import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { FrameWindow, formatStats } from './statsMath.js'
import { getQualitySettings } from '../game/quality.js'
import { useGameStore } from '../state/useGameStore.js'

const UPDATE_MS = 400

/**
 * 效能浮層（僅 ?stats=1 時才會動態載入）。
 * 多 pass 管線下 renderer.info 預設每次 render 都重設，所以關閉 autoReset，
 * 在每個影格最前面手動重設、最後讀取，得到整個影格所有 pass 的總數。
 * 浮層是直接掛在 body 的 DOM 節點，數字以 textContent 更新（不經 React 重繪），
 * 並放在 window.__DDC_STATS__ 供自動化測試讀取。
 */
export default function StatsOverlay() {
  const gl = useThree((s) => s.gl)
  const el = useRef(null)
  const win = useRef(new FrameWindow(2))
  const last = useRef(0)

  useEffect(() => {
    gl.info.autoReset = false
    const node = document.createElement('pre')
    node.className = 'stats-overlay'
    node.setAttribute('aria-hidden', 'true')
    document.body.appendChild(node)
    el.current = node
    return () => {
      gl.info.autoReset = true
      node.remove()
      el.current = null
    }
  }, [gl])

  useFrame((_, delta) => {
    win.current.push(delta)
    gl.info.reset()
  }, -1000)

  useFrame(() => {
    const now = performance.now()
    if (now - last.current < UPDATE_MS) return
    last.current = now
    const quality = getQualitySettings(useGameStore.getState().qualityMode)
    const { render } = gl.info
    const snapshot = {
      fps: win.current.summary(),
      calls: render.calls,
      triangles: render.triangles,
      width: gl.domElement.width,
      height: gl.domElement.height,
      dpr: gl.getPixelRatio(),
      dprMax: quality.dpr,
      quality: quality.id,
    }
    window.__DDC_STATS__ = snapshot
    if (el.current) el.current.textContent = formatStats(snapshot).join('\n')
  }, 1000)

  return null
}
