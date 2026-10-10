import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA, PALETTE } from './config.js'
import { World } from './World.jsx'
import { buildWorld } from './world/buildWorld.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('[大稻埕食光街] 3D 場景發生錯誤：', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="canvas-fallback paper" role="alert">
          <h2>無法載入 3D 場景</h2>
          <p>你的瀏覽器可能不支援 WebGL 2，或硬體加速已關閉。請改用最新版的 Chrome、Edge、Firefox 或 Safari，並確認已開啟硬體加速。</p>
        </div>
      )
    }
    return this.props.children
  }
}

/** 3D 畫布：先讓介面顯示，再於下一個影格產生街景幾何 */
export function GameCanvas() {
  const eraId = useGameStore((state) => state.eraId)
  const shops = useMemo(() => getShopsByEra(eraId), [eraId])
  const [world, setWorld] = useState(null)
  // 店家提示框（Drei <Html>）掛載的固定圖層；
  // 若交給 Drei 自動選擇容器，畫布初始化時容器會改變，提示框內容會被清空。
  const promptLayer = useRef(null)

  useEffect(() => {
    let cancelled = false
    const id = window.setTimeout(() => {
      const startTime = performance.now()
      const built = buildWorld(shops)
      if (import.meta.env.DEV) console.info(`[大稻埕食光街] 街景產生耗時 ${(performance.now() - startTime).toFixed(0)} ms`)
      if (!cancelled) setWorld(built)
    }, 30)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [shops])

  return (
    <CanvasErrorBoundary>
      <Canvas
        className="game-canvas"
        dpr={[1, 1.5]}
        shadows="percentage"
        flat
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [30, 12.5, 1.2] }}
        onCreated={({ gl }) => {
          gl.setClearColor(PALETTE.skyHorizon)
          if (import.meta.env.DEV && window.__DDC__) window.__DDC__.gl = gl
        }}
      >
        {world && <World world={world} promptLayer={promptLayer} />}
      </Canvas>
      <div ref={promptLayer} className="prompt-layer" />
      {!world && <div className="scene-loading">街景繪製中…</div>}
    </CanvasErrorBoundary>
  )
}
