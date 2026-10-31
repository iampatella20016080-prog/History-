import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, MeshBasicMaterial, SRGBColorSpace } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { getMaterials } from '../rendering/materials.js'
import { transitionState } from '../transition.js'
import { nightEra, nightState } from '../night.js'

/** 月亮離鏡頭的距離（在遠山 760 公尺之後、遠裁切面 900 公尺之內，所以會被山擋住） */
const MOON_DISTANCE = 830
const MOON_SIZE = 46

/** 月亮的貼圖：卡通風格的圓盤（一點月海的斑紋）加上柔和的月暈 */
function moonTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const g = canvas.getContext('2d')
  const c = size / 2
  const halo = g.createRadialGradient(c, c, size * 0.12, c, c, size * 0.5)
  halo.addColorStop(0, 'rgba(220,228,255,0.55)')
  halo.addColorStop(0.35, 'rgba(170,186,230,0.18)')
  halo.addColorStop(1, 'rgba(150,170,220,0)')
  g.fillStyle = halo
  g.fillRect(0, 0, size, size)
  g.fillStyle = '#f4f1e2'
  g.beginPath()
  g.arc(c, c, size * 0.13, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = 'rgba(190,190,176,0.55)'
  for (const [x, y, r] of [
    [-0.035, -0.03, 0.035],
    [0.04, 0.02, 0.028],
    [-0.01, 0.05, 0.02],
  ]) {
    g.beginPath()
    g.arc(c + x * size, c + y * size, r * size, 0, Math.PI * 2)
    g.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** 亮窗與暖色玻璃的發光顏色：夜裡往年代的燈光顏色移（油燈偏橘、日光燈偏冷白） */
const TINTED = ['windowLit', 'glassWarm']

/**
 * 夜晚（只在精緻畫質、夜晚或正在入夜時掛載）：
 * - 月亮：天空裡一個圓盤加月暈（一次繪製），方向就是夜裡太陽換成的月光方向；也畫進河面倒映
 * - 窗光的顏色依年代（night.js 的 NIGHT_ERAS）；強度、燈籠與燈光落點由 atmosphere 的 glow 帶動
 * 卸載時把窗光的顏色還原。
 */
export function Night() {
  const mesh = useRef()
  const material = useMemo(
    () => new MeshBasicMaterial({ map: moonTexture(), transparent: true, depthWrite: false, fog: false, toneMapped: false }),
    [],
  )
  const tint = useMemo(() => new Color(), [])
  const original = useMemo(() => {
    const materials = getMaterials()
    return Object.fromEntries(TINTED.map((name) => [name, materials[name].emissive.clone()]))
  }, [])

  useEffect(
    () => () => {
      const materials = getMaterials()
      for (const name of TINTED) materials[name].emissive.copy(original[name])
      material.map.dispose()
      material.dispose()
    },
    [material, original],
  )

  useFrame(({ camera }) => {
    const t = nightState.night
    const era = nightEra(transitionState.mountedEraId)
    const materials = getMaterials()
    tint.set(era.windowTint)
    for (const name of TINTED) materials[name].emissive.copy(original[name]).lerp(tint, era.tintAmount * t)
    const m = mesh.current
    if (!m) return
    m.position.copy(camera.position).addScaledVector(atmosphere.current.sunDirection, MOON_DISTANCE)
    m.quaternion.copy(camera.quaternion)
    material.opacity = t
    m.visible = t > 0.01 && atmosphere.current.sunDirection.y > 0
  })

  return (
    <mesh
      ref={mesh}
      name="moon"
      material={material}
      renderOrder={-950}
      frustumCulled={false}
      userData={{ reflect: true }}
      onUpdate={(object) => object.layers.set(LAYERS.NO_OUTLINE)}
    >
      <planeGeometry args={[MOON_SIZE * 4, MOON_SIZE * 4]} />
    </mesh>
  )
}
