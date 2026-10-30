import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HalfFloatType, PerspectiveCamera, UnsignedByteType, Vector2, WebGLRenderTarget } from 'three'
import { LAYERS, RIVER } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { collectReflected, reflectionSize, riverInView, updateMirrorCamera } from '../rendering/planarReflection.js'
import { waterReflectUniforms } from '../rendering/waterShader.js'

const RETAG_FRAMES = 30

/**
 * 河面倒映（只在精緻畫質掛載）：每個影格在 ToonRenderer 之前，用鏡射到水面下的虛擬鏡頭
 * 以低解析度畫一次岸上的主要量體、燈火、天空與遠山（圖層 LAYERS.REFLECT 篩選，見 planarReflection.js），
 * 水面著色器再取樣這張貼圖。人物、船（另有自己的倒影）、招牌、室內與細部道具不畫。
 * 陰影貼圖沿用上一個影格的（不在這一趟更新）。
 */
export function RiverReflection({ scale }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const state = useRef({ frame: 0, tagged: [] })
  const { target, virtual } = useMemo(() => {
    const half = gl.capabilities.isWebGL2 && gl.extensions.has('EXT_color_buffer_float')
    const rt = new WebGLRenderTarget(64, 64, { type: half ? HalfFloatType : UnsignedByteType, depthBuffer: true })
    rt.texture.generateMipmaps = false
    const cam = new PerspectiveCamera()
    cam.layers.set(LAYERS.REFLECT)
    return { target: rt, virtual: cam }
  }, [gl])

  useEffect(() => {
    waterReflectUniforms.tReflect.value = target.texture
    // 開發版：e2e 讀倒影貼圖與標記的物件
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.__DDC__) window.__DDC__.riverReflection = { target, state: state.current }
    return () => {
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__DDC__) delete window.__DDC__.riverReflection
      for (const object of state.current.tagged) object.layers.disable(LAYERS.REFLECT)
      state.current.tagged = []
      waterReflectUniforms.tReflect.value = null
      target.dispose()
    }
  }, [target])

  const size = useMemo(() => new Vector2(), [])
  useFrame(({ camera }) => {
    const s = state.current
    // 年代切換、室內按需產生後重新標記（標記只是多開一個圖層位元，不影響主畫面）
    if (s.frame++ % RETAG_FRAMES === 0) {
      const next = collectReflected(scene)
      const keep = new Set(next)
      for (const object of s.tagged) if (!keep.has(object)) object.layers.disable(LAYERS.REFLECT)
      for (const object of next) object.layers.enable(LAYERS.REFLECT)
      s.tagged = next
    }
    // 主畫面先畫過幾個影格（陰影貼圖建立之後）才開始；否則陰影取樣器會綁到空的貼圖
    if (s.frame < 3 || !camera.isPerspectiveCamera) return
    if (!riverInView(camera, RIVER.edgeX, RIVER.waterLevel)) return
    virtual.fov = camera.fov
    virtual.aspect = camera.aspect
    if (!updateMirrorCamera(camera, virtual, RIVER.waterLevel, waterReflectUniforms.uReflectMatrix.value)) return

    gl.getDrawingBufferSize(size)
    const [w, h] = reflectionSize(size.x, size.y, scale)
    if (target.width !== w || target.height !== h) target.setSize(w, h)

    const previous = gl.getRenderTarget()
    const shadowUpdate = gl.shadowMap.needsUpdate
    gl.shadowMap.needsUpdate = false
    gl.setRenderTarget(target)
    gl.setClearColor(atmosphere.current.skyHorizon, 1)
    gl.clear(true, true, false)
    gl.render(scene, virtual)
    gl.setRenderTarget(previous)
    gl.shadowMap.needsUpdate = shadowUpdate
  }, 0.5)

  return null
}
