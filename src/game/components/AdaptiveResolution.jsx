import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../state/useGameStore.js'

const WINDOW = 1.6 // 秒
const LOW_FPS = 42
const HIGH_FPS = 57

/**
 * 依實際畫面更新率微調渲染解析度：太慢時逐步降低、穩定流暢時再慢慢回升
 * （不超過裝置畫質設定的上限）。年代轉場期間不調整，避免誤判。
 */
export function AdaptiveResolution({ min, max }) {
  const setDpr = useThree((state) => state.setDpr)
  const initial = useThree((state) => state.viewport.initialDpr)
  const stats = useRef({ time: 0, frames: 0, good: 0, dpr: null })

  useFrame((_, delta) => {
    const s = stats.current
    if (s.dpr === null) s.dpr = Math.min(max, initial)
    if (delta > 0.25 || useGameStore.getState().transitioning || document.hidden) {
      s.time = 0
      s.frames = 0
      return
    }
    s.time += delta
    s.frames++
    if (s.time < WINDOW) return
    const fps = s.frames / s.time
    s.time = 0
    s.frames = 0
    if (fps < LOW_FPS && s.dpr > min + 0.01) {
      s.dpr = Math.max(min, s.dpr - 0.15)
      s.good = 0
      setDpr(s.dpr)
    } else if (fps > HIGH_FPS && s.dpr < Math.min(max, initial) - 0.01) {
      s.good++
      if (s.good >= 3) {
        s.dpr = Math.min(Math.min(max, initial), s.dpr + 0.1)
        s.good = 0
        setDpr(s.dpr)
      }
    } else {
      s.good = 0
    }
  })
  return null
}
