import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getEra, getEraIndex, ERAS } from '../../data/eras.js'
import { useGameStore } from '../../state/useGameStore.js'
import { beginAtmosphereTransition, setAtmosphereProgress } from '../atmosphere.js'
import { transitionState } from '../transition.js'
import { getCachedEraWorld, loadEraWorld, prefetchEraWorld, setDisplayedEra } from '../world/worldManager.js'

/**
 * 年代轉場導演（約 1.8 秒）：
 *
 * 1. 起霧（0.7 秒）：柔和的霧氣從畫面邊緣湧入，天色與光線開始往新年代過渡
 * 2. 交換：霧最濃時擷取目前畫面，換上新年代的街景（若尚未產生完成則在霧中等待）
 * 3. 顯影（1.1 秒）：以水墨暈染般的遮罩，從畫面中央向外逐步顯現新的街景，霧氣散去
 *
 * 角色留在同一條街的同一個位置，不重新載入頁面、不黑屏。
 */
const OUT_DURATION = 0.7
const IN_DURATION = 1.15
const ATMOSPHERE_AT_SWAP = 0.42

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

export function EraDirector({ onSwap }) {
  const job = useRef(null)
  const cancelPrefetch = useRef(null)

  useFrame((_, rawDelta) => {
    // 影格較慢時（例如上傳新街景的那一格）也讓轉場維持大致相同的長度
    const dt = Math.min(rawDelta, 0.1)
    const store = useGameStore.getState()
    const request = store.eraTransition
    const state = transitionState

    // 開始新的轉場
    if (request && request.nonce !== job.current?.nonce) {
      cancelPrefetch.current?.()
      const target = getEra(request.to)
      job.current = {
        nonce: request.nonce,
        to: request.to,
        phase: 'out',
        elapsed: 0,
        inElapsed: 0,
        world: getCachedEraWorld(request.to),
      }
      const current = job.current
      if (!current.world) {
        loadEraWorld(request.to).then(
          (world) => {
            if (job.current === current) current.world = world
          },
          (error) => {
            console.error('[大稻埕食光街] 年代街景產生失敗：', error)
            if (job.current === current) current.failed = true
          },
        )
      }
      beginAtmosphereTransition(target)
    }

    const current = job.current
    if (!current) return
    current.elapsed += dt

    if (current.phase === 'out') {
      const t = current.elapsed / OUT_DURATION
      state.mist = 0.82 * ease(t)
      setAtmosphereProgress(Math.min(t, 1) * ATMOSPHERE_AT_SWAP)
      if (current.failed) {
        // 產生失敗：退回原本的年代
        beginAtmosphereTransition(getEra(store.eraId))
        current.phase = 'in'
        current.to = store.eraId
        current.inElapsed = 0
        state.dissolve = 1
      } else if (t >= 1 && current.world) {
        state.snapshotRequested = true
        state.snapshotReady = false
        current.phase = 'snapshot'
      }
    } else if (current.phase === 'snapshot') {
      if (state.snapshotReady) {
        state.dissolve = 0
        onSwap(current.world)
        setDisplayedEra(current.to)
        useGameStore.getState().swapEra(current.to)
        current.phase = 'mount'
      }
    } else if (current.phase === 'mount') {
      // 等新的街景掛載完成再開始顯影（避免看到尚未就緒的畫面）
      state.mist = 0.82 + Math.sin(current.elapsed * 2) * 0.02
      if (state.mountedEraId === current.to) {
        current.phase = 'in'
        current.inElapsed = 0
      }
    } else if (current.phase === 'in') {
      current.inElapsed += dt
      const t = current.inElapsed / IN_DURATION
      state.dissolve = ease(t * 1.15)
      state.mist = 0.82 * (1 - ease(t))
      setAtmosphereProgress(ATMOSPHERE_AT_SWAP + (1 - ATMOSPHERE_AT_SWAP) * Math.min(1, t))
      if (t >= 1) {
        state.mist = 0
        state.dissolve = 1
        job.current = { ...current, phase: 'done', nonce: current.nonce }
        useGameStore.getState().finishEraTransition()
        // 閒置時預先產生下一個年代
        const index = getEraIndex(current.to)
        const next = ERAS[index + 1] ?? ERAS[index - 1]
        cancelPrefetch.current = prefetchEraWorld(next?.id)
      }
    }
  }, -3)

  return null
}
