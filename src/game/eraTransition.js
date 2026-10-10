/**
 * 年代轉場狀態機（不依賴 React 與 Three.js，可以在 Node 中直接測試）
 *
 * 每一次有效的切換請求都帶著唯一、持續遞增的 id（store 的 eraRequestSeq）。
 * 狀態機只以 id 判斷是否為新的請求，並保證每個開始處理的請求最後都會呼叫
 * hooks.finish(job)，讓 store 解除轉場鎖定：
 *
 *   out ──(新街景就緒、霧最濃)──▶ snapshot ──▶ mount ──▶ in ──▶ 完成
 *    │                                                    ▲
 *    └────(街景產生失敗)──▶ 退回原本的年代（霧散去）────────┘
 *
 * - out：霧氣湧入、天色開始過渡，同時等待新年代的街景產生
 * - snapshot：請渲染器擷取目前畫面（水墨顯影的起點），收到後換上新街景
 * - mount：等新街景實際掛載到場景中
 * - in：以水墨暈染般的遮罩顯現新街景、霧氣散去，然後結束
 *
 * 等待渲染器（snapshot）與場景掛載（mount）都有影格數上限：沒有回應時改走
 * 不需要該步驟的路徑（不使用快照、直接顯影），因此不會停在轉場中。
 * 街景產生失敗時記錄錯誤、退回原本的年代並正常結束轉場。
 */
export const ERA_TRANSITION_TIMING = {
  out: 0.7, // 起霧（秒）
  in: 1.15, // 顯影（秒）
  atmosphereAtSwap: 0.42, // 交換街景時，天色過渡的進度
  maxMist: 0.82,
  snapshotMaxFrames: 20,
  mountMaxFrames: 240,
}

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

/**
 * @param {object} hooks
 * @param {object} hooks.visual  轉場畫面狀態 { mist, dissolve, snapshotRequested, snapshotReady, mountedWorld }
 * @param {(eraId: string) => object|null} hooks.getWorld        已產生完成的街景（沒有則回傳 null）
 * @param {(eraId: string) => Promise<object>} hooks.loadWorld   產生街景
 * @param {(job) => void} hooks.begin                 轉場開始（鎖定 job.from／job.target 的街景、開始天色過渡）
 * @param {(progress: number) => void} hooks.setAtmosphereProgress
 * @param {(job) => void} hooks.swap                  換上新街景（store.swapEra、React 狀態）；失敗時丟出錯誤
 * @param {(job, error) => void} hooks.fail           切換失敗（記錄、確保畫面與 store 回到 job.from、提示使用者）
 * @param {(eraId: string) => void} hooks.revertAtmosphere 天色開始退回原本的年代
 * @param {(job) => void} hooks.finish                轉場結束（store.finishEraTransition、釋放鎖定）
 * @param {(job) => void} [hooks.abandon]             轉場被新的請求取代（釋放鎖定）
 */
export function createEraTransitionDirector(hooks, timing = ERA_TRANSITION_TIMING) {
  const { visual } = hooks
  let job = null
  let handledId = null

  function resetVisual() {
    visual.mist = 0
    visual.dissolve = 1
    visual.snapshotRequested = false
    visual.snapshotReady = false
  }

  function start(request) {
    if (job) {
      // 理論上 store 不會在轉場中接受新的請求；若發生，放棄舊的轉場改處理新的
      const previous = job
      job = null
      hooks.abandon?.(previous)
    }
    const current = {
      id: request.id,
      from: request.from, // 轉場開始時的年代
      target: request.to, // 要切換到的年代（鎖定與釋放街景以此為準）
      to: request.to, // 轉場結束時畫面上的年代（失敗時改為原本的年代）
      phase: 'out',
      elapsed: 0,
      inElapsed: 0,
      waitFrames: 0,
      mistFrom: visual.mist,
      world: hooks.getWorld(request.to) ?? null,
      error: null,
      usedSnapshot: false,
      reverting: false,
    }
    job = current
    visual.snapshotRequested = false
    visual.snapshotReady = false
    visual.dissolve = 1
    hooks.begin(current)
    if (!current.world) {
      let promise
      try {
        promise = Promise.resolve(hooks.loadWorld(request.to))
      } catch (error) {
        promise = Promise.reject(error)
      }
      promise.then(
        (world) => {
          if (job !== current) return
          if (world) current.world = world
          else current.error = new Error(`年代街景是空的：${request.to}`)
        },
        (error) => {
          if (job === current) current.error = error ?? new Error(`年代街景產生失敗：${request.to}`)
        },
      )
    }
  }

  /** 失敗：退回轉場開始時的年代（job.from），霧散去後正常結束 */
  function beginRevert(current) {
    current.reverting = true
    current.to = current.from
    hooks.fail(current, current.error)
    hooks.revertAtmosphere(current.from)
    visual.snapshotRequested = false
    visual.dissolve = 1
    current.usedSnapshot = false
    current.mistFrom = visual.mist
    current.phase = 'in'
    current.inElapsed = 0
  }

  function complete(current) {
    resetVisual()
    job = null
    hooks.finish(current)
  }

  /**
   * 每一影格呼叫一次。
   * @param {number} dt 經過的秒數
   * @param {{ id, from, to } | null} request store 目前的轉場請求
   */
  function update(dt, request) {
    if (request && request.id !== handledId) {
      handledId = request.id
      start(request)
    }
    const current = job
    if (!current) return
    current.elapsed += dt

    if (current.phase === 'out') {
      const t = Math.min(current.elapsed / timing.out, 1)
      visual.mist = current.mistFrom + (timing.maxMist - current.mistFrom) * ease(t)
      hooks.setAtmosphereProgress(t * timing.atmosphereAtSwap)
      if (current.error) {
        beginRevert(current)
      } else if (t >= 1 && current.world) {
        visual.snapshotReady = false
        visual.snapshotRequested = true
        current.phase = 'snapshot'
        current.waitFrames = 0
      }
      return
    }

    if (current.phase === 'snapshot') {
      current.waitFrames++
      const ready = visual.snapshotReady
      if (!ready && current.waitFrames <= timing.snapshotMaxFrames) return
      visual.snapshotRequested = false
      current.usedSnapshot = ready
      visual.dissolve = ready ? 0 : 1
      try {
        hooks.swap(current)
      } catch (error) {
        current.error = error
        beginRevert(current)
        return
      }
      current.phase = 'mount'
      current.waitFrames = 0
      return
    }

    if (current.phase === 'mount') {
      current.waitFrames++
      visual.mist = timing.maxMist + Math.sin(current.elapsed * 2) * 0.02
      if (visual.mountedWorld === current.world || current.waitFrames > timing.mountMaxFrames) {
        current.mistFrom = visual.mist
        current.phase = 'in'
        current.inElapsed = 0
      }
      return
    }

    if (current.phase === 'in') {
      current.inElapsed += dt
      const t = Math.min(current.inElapsed / timing.in, 1)
      visual.dissolve = current.usedSnapshot ? ease(t * 1.15) : 1
      visual.mist = current.mistFrom * (1 - ease(t))
      hooks.setAtmosphereProgress(
        current.reverting ? t : timing.atmosphereAtSwap + (1 - timing.atmosphereAtSwap) * t,
      )
      if (t >= 1) complete(current)
    }
  }

  /**
   * 轉場過程中發生非預期的錯誤時呼叫：立即結束目前的轉場並解除鎖定，
   * 讓使用者可以繼續操作與再次切換。
   */
  function recover() {
    const current = job
    resetVisual()
    job = null
    if (current) hooks.finish(current)
  }

  return {
    update,
    recover,
    get job() {
      return job
    },
    get handledId() {
      return handledId
    },
  }
}
