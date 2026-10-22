import assert from 'node:assert/strict'
import { createEraTransitionDirector } from '../src/game/eraTransition.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { riceToWorld } from '../src/data/riceAndShineLayout.js'

/** 時間軸上的年份 → 年代 id */
export const YEAR = {
  1853: 'qing-port',
  1895: 'banquet',
  1930: 'modern',
  1945: 'postwar',
  2000: 'revival',
}

export function resetStore(eraId = 'qing-port') {
  useGameStore.setState({
    started: true,
    worldReady: true,
    mode: 'explore',
    eraId,
    eraRequestSeq: 0,
    eraTransition: null,
    transitioning: false,
    eraError: null,
    nearbyShopId: null,
    menuOpen: false,
  })
}

const flush = () => new Promise((resolve) => setImmediate(resolve))

/**
 * 模擬遊戲的影格迴圈：轉場狀態機＋渲染器（擷取畫面）＋React（掛載新街景）。
 *
 * options.load(eraId, frame) 決定街景何時產生完成或失敗：
 *   回傳 { frames, fail } —— 幾個影格後完成（或失敗）
 * options.renderer：渲染器是否回應擷取畫面的請求
 * options.mount：新街景是否會掛載（以及延遲幾個影格）
 */
export function createHarness({ load = () => ({ frames: 3 }), renderer = true, mount = true, mountDelay = 2, swapError = null } = {}) {
  const visual = { mist: 0, dissolve: 1, snapshotRequested: false, snapshotReady: false, mountedWorld: null }
  const cache = new Map()
  const loads = []
  const events = []
  let pendingMount = null
  let displayed = { eraId: useGameStore.getState().eraId }
  cache.set(displayed.eraId, displayed)
  visual.mountedWorld = displayed

  const director = createEraTransitionDirector({
    visual,
    getWorld: (eraId) => cache.get(eraId) ?? null,
    loadWorld: (eraId) =>
      new Promise((resolve, reject) => {
        const plan = load(eraId)
        loads.push({ eraId, frames: plan.frames ?? 0, fail: !!plan.fail, resolve, reject })
      }),
    begin: (job) => events.push({ type: 'begin', id: job.id, target: job.target }),
    setAtmosphereProgress: () => {},
    swap: (job) => {
      // 與 EraDirector 相同的順序：先更新 store，再換場景中的街景
      if (!useGameStore.getState().swapEra(job.id, job.to)) throw new Error('stale transition')
      if (swapError) throw swapError
      displayed = job.world
      pendingMount = mount ? { world: job.world, frames: mountDelay } : null
      events.push({ type: 'swap', id: job.id, to: job.to })
    },
    fail: (job) => {
      events.push({ type: 'fail', id: job.id, target: job.target })
      const store = useGameStore.getState()
      if (store.eraId !== job.from) store.swapEra(job.id, job.from)
      useGameStore.getState().reportEraError(job.id, job.target)
    },
    revertAtmosphere: () => {},
    finish: (job) => {
      events.push({ type: 'finish', id: job.id, to: job.to })
      useGameStore.getState().finishEraTransition(job.id)
    },
    abandon: (job) => events.push({ type: 'abandon', id: job.id }),
  })

  async function frame(dt = 1 / 60) {
    const state = useGameStore.getState()
    director.update(dt, state.eraTransition)
    // 渲染器（ToonRenderer）：收到請求就保存畫面
    if (renderer && visual.snapshotRequested) {
      visual.snapshotRequested = false
      visual.snapshotReady = true
    }
    // React（EraScene）：換上新街景後隔幾個影格才掛載完成
    if (pendingMount && --pendingMount.frames <= 0) {
      visual.mountedWorld = pendingMount.world
      pendingMount = null
    }
    // 街景產生（Web Worker）
    for (const item of [...loads]) {
      if (item.frames-- > 0) continue
      loads.splice(loads.indexOf(item), 1)
      if (item.fail) item.reject(new Error(`build failed: ${item.eraId}`))
      else {
        const world = { eraId: item.eraId }
        cache.set(item.eraId, world)
        item.resolve(world)
      }
    }
    await flush()
  }

  /** 一直跑到轉場結束（transitioning 變回 false），回傳用了幾個影格 */
  async function runUntilIdle(maxFrames = 3000) {
    for (let i = 1; i <= maxFrames; i++) {
      await frame()
      if (!useGameStore.getState().transitioning) return i
    }
    throw new Error(`轉場在 ${maxFrames} 個影格內沒有結束（phase: ${director.job?.phase}）`)
  }

  /** 送出切換請求並確認每一個完成條件 */
  async function switchTo(eraId) {
    const before = useGameStore.getState().eraRequestSeq
    const id = useGameStore.getState().requestEra(eraId)
    assert.ok(id, `切換到 ${eraId} 的請求應該被接受`)
    assert.equal(id, before + 1, '每次請求的 id 都是新的流水號')
    assert.equal(useGameStore.getState().transitioning, true)
    let sawMist = false
    const frames = await (async () => {
      for (let i = 1; i <= 3000; i++) {
        await frame()
        if (visual.mist > 0.5) sawMist = true
        if (!useGameStore.getState().transitioning) return i
      }
      throw new Error(`切換到 ${eraId} 的轉場沒有結束（phase: ${director.job?.phase}）`)
    })()
    const state = useGameStore.getState()
    assert.equal(state.eraId, eraId, '年代已更新')
    assert.equal(state.transitioning, false, 'transitioning 恢復 false')
    assert.equal(state.eraTransition, null, 'eraTransition 恢復 null')
    assert.equal(displayed.eraId, eraId, '畫面上是目標年代的街景')
    assert.equal(visual.mountedWorld?.eraId, eraId, '目標年代的街景已掛載')
    assert.equal(visual.mist, 0, '霧氣散去')
    assert.equal(visual.dissolve, 1, '顯影完成')
    assert.ok(sawMist, '有播放轉場（霧氣）')
    assert.ok(events.some((e) => e.type === 'finish' && e.id === id && e.to === eraId), '以同一個 id 結束轉場')
    return { id, frames }
  }

  return {
    director,
    visual,
    events,
    frame,
    runUntilIdle,
    switchTo,
    get displayed() {
      return displayed
    },
  }
}

/**
 * 範圍是否在稻舍（迪化街329號店屋）的地段裡：這棟店屋從 1930 起可以走進去（室內、觀賞範圍、貼近障礙物的範圍），
 * 其他店家的測試檢查「這個年代沒有室內」時排除它（稻舍本身在 riceAndShine.test.js 驗證）
 */
export function inRiceAndShineLot(rect) {
  const a = riceToWorld(-2.85, 2.2)
  const c = riceToWorld(2.85, -11.1)
  const minX = Math.min(a.x, c.x)
  const maxX = Math.max(a.x, c.x)
  const minZ = Math.min(a.z, c.z)
  const maxZ = Math.max(a.z, c.z)
  return rect.minX >= minX - 1e-6 && rect.maxX <= maxX + 1e-6 && rect.minZ >= minZ - 1e-6 && rect.maxZ <= maxZ + 1e-6
}
