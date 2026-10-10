import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ERAS, getEra, getEraIndex } from '../../data/eras.js'
import { useGameStore } from '../../state/useGameStore.js'
import { beginAtmosphereTransition, setAtmosphere, setAtmosphereProgress } from '../atmosphere.js'
import { createEraTransitionDirector } from '../eraTransition.js'
import { transitionState } from '../transition.js'
import {
  getCachedEraWorld,
  loadEraWorld,
  prefetchEraWorld,
  releaseEraWorld,
  retainEraWorld,
  setDisplayedEra,
} from '../world/worldManager.js'

/**
 * 年代轉場導演（約 1.8 秒）：把 eraTransition.js 的狀態機接到 store、天色與街景管理。
 *
 * 1. 起霧（0.7 秒）：柔和的霧氣湧入，天色與光線開始往新年代過渡
 * 2. 交換：霧最濃時擷取目前畫面，換上新年代的街景（若尚未產生完成則在霧中等待）
 * 3. 顯影（1.1 秒）：以水墨暈染般的遮罩，從畫面中央向外逐步顯現新的街景，霧氣散去
 *
 * 角色留在同一條街的同一個位置，不重新載入頁面、不黑屏。
 * 每次轉場都會以該次請求的 id 呼叫 store.finishEraTransition，之後即可再次切換。
 */
export function EraDirector({ onSwap }) {
  const onSwapRef = useRef(onSwap)
  onSwapRef.current = onSwap

  const director = useMemo(() => {
    let cancelPrefetch = null
    const release = (job) => {
      releaseEraWorld(job.from)
      releaseEraWorld(job.target)
    }
    return createEraTransitionDirector({
      visual: transitionState,
      getWorld: getCachedEraWorld,
      loadWorld: loadEraWorld,
      begin: (job) => {
        cancelPrefetch?.()
        cancelPrefetch = null
        retainEraWorld(job.from)
        retainEraWorld(job.target)
        beginAtmosphereTransition(getEra(job.target))
      },
      setAtmosphereProgress,
      swap: (job) => {
        // 先更新 store（同時確認這次轉場仍然有效），再換掉場景中的街景
        if (!useGameStore.getState().swapEra(job.id, job.to)) throw new Error(`轉場已失效：#${job.id}`)
        setDisplayedEra(job.to)
        onSwapRef.current(job.world)
      },
      fail: (job, error) => {
        console.error(`[大稻埕食光街] 無法切換到「${job.target}」，留在原本的年代：`, error)
        const store = useGameStore.getState()
        if (store.eraId !== job.from) store.swapEra(job.id, job.from)
        setDisplayedEra(job.from)
        const world = getCachedEraWorld(job.from)
        if (world && transitionState.mountedWorld !== world) onSwapRef.current(world)
        useGameStore.getState().reportEraError(job.id, job.target)
      },
      revertAtmosphere: (eraId) => beginAtmosphereTransition(getEra(eraId)),
      finish: (job) => {
        release(job)
        useGameStore.getState().finishEraTransition(job.id)
        // 閒置時預先產生下一個年代
        const settled = useGameStore.getState().eraId
        const index = getEraIndex(settled)
        const next = ERAS[index + 1] ?? ERAS[index - 1]
        cancelPrefetch = prefetchEraWorld(next?.id)
      },
      abandon: release,
    })
  }, [])

  useFrame((_, rawDelta) => {
    // 影格較慢時（例如上傳新街景的那一格）也讓轉場維持大致相同的長度
    const dt = Math.min(rawDelta, 0.1)
    const store = useGameStore.getState()
    try {
      director.update(dt, store.eraTransition)
    } catch (error) {
      // 非預期的錯誤：結束這次轉場、天色回到畫面上的年代，讓使用者可以繼續操作與再次切換
      console.error('[大稻埕食光街] 年代轉場發生錯誤：', error)
      director.recover()
      const era = getEra(useGameStore.getState().eraId)
      if (era) setAtmosphere(era)
    }
  }, -3)

  return null
}
