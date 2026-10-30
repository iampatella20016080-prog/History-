import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { getQualitySettings } from '../quality.js'
import { setShopGlowEnabled, setSurfaceDetail } from '../rendering/materials.js'
import { useGameStore } from '../../state/useGameStore.js'
import { getMaterials, peekInteriorMaterials } from '../rendering/materials.js'
import { setRelief } from '../rendering/relief.js'

const WINDOW = 1.6 // 秒
const LOW_FPS = 42
const HIGH_FPS = 57
const adaptiveEnabled = typeof window === 'undefined' || new URLSearchParams(window.location.search).get('adaptive') !== '0'

/**
 * 畫質模式的解析度控制：
 * - 切換模式時立即把渲染解析度（DPR）設為該模式的上限（不超過裝置像素比）
 * - 執行中畫面太慢時在該模式的範圍內逐步降低、穩定流暢時再回升（年代轉場期間不調整）
 * - 把實際的設定寫在 <html> 的 data 屬性上，方便檢查（data-quality、data-dpr、data-dpr-max、data-shop-glow）
 * 網址加上 ?adaptive=0 可停用自動調整（量測實際設定用）。
 */
export function QualityController() {
  const mode = useGameStore((state) => state.qualityMode)
  const setDpr = useThree((state) => state.setDpr)
  const gl = useThree((state) => state.gl)
  const settings = useMemo(() => getQualitySettings(mode), [mode])
  const stats = useRef({ time: 0, frames: 0, good: 0, dpr: settings.dpr, written: 0 })

  useEffect(() => {
    stats.current = { time: 0, frames: 0, good: 0, dpr: settings.dpr, written: 0 }
    setDpr(settings.dpr)
    const data = document.documentElement.dataset
    data.quality = settings.id
    data.dprMax = String(settings.dpr)
    data.dof = String(settings.dofTaps)
    data.detail = settings.detail ? 'full' : 'reduced'
    // 店內透光只在精緻畫質：切換時 windowLit、glassWarm 重新編譯（不加材質、不加批次）
    setShopGlowEnabled(settings.shopGlow)
    data.shopGlow = settings.shopGlow ? 'on' : 'off'
  }, [settings, setDpr])

  // 地磚與牆面的大尺度變化只在精緻畫質（流暢畫質的著色器與原本相同）；在第一次繪製之前套用
  useLayoutEffect(() => setSurfaceDetail(settings.detail), [settings])

  // 材質凹凸：只在精緻畫質接上法線貼圖（流暢畫質的材質與著色器維持原樣）
  useEffect(() => {
    setRelief(settings.relief, () => [getMaterials(), peekInteriorMaterials()].filter(Boolean))
    document.documentElement.dataset.relief = settings.relief ? 'on' : 'off'
  }, [settings.relief])

  useFrame((_, delta) => {
    const s = stats.current
    const actual = gl.getPixelRatio()
    if (actual !== s.written) {
      s.written = actual
      document.documentElement.dataset.dpr = actual.toFixed(2)
    }
    if (!adaptiveEnabled || delta > 0.25 || useGameStore.getState().transitioning || document.hidden) {
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
    if (fps < LOW_FPS && s.dpr > settings.dprMin + 0.01) {
      s.dpr = Math.max(settings.dprMin, s.dpr - 0.15)
      s.good = 0
      setDpr(s.dpr)
    } else if (fps > HIGH_FPS && s.dpr < settings.dpr - 0.01) {
      s.good++
      if (s.good >= 3) {
        s.dpr = Math.min(settings.dpr, s.dpr + 0.1)
        s.good = 0
        setDpr(s.dpr)
      }
    } else {
      s.good = 0
    }
  })
  return null
}
