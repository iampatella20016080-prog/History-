import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA, PALETTE } from './config.js'
import { World } from './World.jsx'
import { setAtmosphere } from './atmosphere.js'
import { QualityController } from './components/QualityController.jsx'
import { getQualitySettings } from './quality.js'
import { loadEraWorld, prefetchEraWorld, setDisplayedEra } from './world/worldManager.js'
import { ERAS, getEra, getEraIndex } from '../data/eras.js'
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

/** 3D 畫布：先讓介面顯示，再產生目前年代的街景（Web Worker），並在閒置時預先產生下一個年代 */
export function GameCanvas() {
  const [world, setWorld] = useState(null)
  const [error, setError] = useState(null)
  // 初始解析度依畫質模式；之後切換由 QualityController 即時套用
  const initialDpr = useMemo(() => getQualitySettings(useGameStore.getState().qualityMode).dpr, [])
  // 店家提示框（Drei <Html>）掛載的固定圖層；
  // 若交給 Drei 自動選擇容器，畫布初始化時容器會改變，提示框內容會被清空。
  const promptLayer = useRef(null)

  useEffect(() => {
    let cancelled = false
    let cancelPrefetch = () => {}
    const eraId = useGameStore.getState().eraId
    loadEraWorld(eraId).then(
      (built) => {
        if (cancelled) return
        setAtmosphere(getEra(eraId))
        setDisplayedEra(eraId)
        setWorld(built)
        useGameStore.getState().setWorldReady(true)
        const next = ERAS[getEraIndex(eraId) + 1]
        cancelPrefetch = prefetchEraWorld(next?.id, 1200)
      },
      (reason) => {
        console.error('[大稻埕食光街] 街景產生失敗：', reason)
        if (!cancelled) setError(reason)
      },
    )
    return () => {
      cancelled = true
      cancelPrefetch()
    }
  }, [])

  const swapWorld = useCallback((next) => setWorld(next), [])

  if (error) {
    return (
      <div className="canvas-fallback paper" role="alert">
        <h2>街景產生失敗</h2>
        <p>請重新整理頁面再試一次。若問題持續發生，請改用最新版的 Chrome、Edge、Firefox 或 Safari。</p>
      </div>
    )
  }

  return (
    <CanvasErrorBoundary>
      <Canvas
        className="game-canvas"
        dpr={initialDpr}
        shadows="percentage"
        flat
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [30, 12.5, 1.2] }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(PALETTE.skyHorizon)
          if (import.meta.env.DEV && window.__DDC__) Object.assign(window.__DDC__, { gl, scene })
        }}
      >
        <QualityController />
        {world && <World world={world} promptLayer={promptLayer} onSwap={swapWorld} />}
      </Canvas>
      <div ref={promptLayer} className="prompt-layer" />
      {!world && <div className="scene-loading">街景繪製中…</div>}
    </CanvasErrorBoundary>
  )
}
