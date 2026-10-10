import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { PALETTE, SUN } from '../config.js'
import { playerState } from '../runtime.js'

const SHADOW_SIZE = 30
const SHADOW_MAP = 2048

/**
 * 柔和的自然光：天空半球光＋西南方暖色陽光。
 * 陰影相機跟隨角色移動，並對齊陰影貼圖像素格，避免移動時陰影邊緣閃爍。
 */
export function Lighting() {
  const sun = useRef()
  const basis = useMemo(() => {
    const z = new Vector3(...SUN.offset).normalize()
    const x = new Vector3(0, 1, 0).cross(z).normalize()
    const y = z.clone().cross(x).normalize()
    return { x, y, z, distance: new Vector3(...SUN.offset).length() }
  }, [])
  const temp = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const light = sun.current
    if (!light) return
    light.target.position.set(0, 0, 0)
    light.parent?.add(light.target)
  }, [])

  useFrame(() => {
    const light = sun.current
    if (!light) return
    const texel = (SHADOW_SIZE * 2) / SHADOW_MAP
    const p = playerState.position
    const px = Math.round(p.dot(basis.x) / texel) * texel
    const py = Math.round(p.dot(basis.y) / texel) * texel
    const pz = p.dot(basis.z)
    temp.copy(basis.x).multiplyScalar(px).addScaledVector(basis.y, py).addScaledVector(basis.z, pz)
    light.target.position.copy(temp)
    light.position.copy(temp).addScaledVector(basis.z, basis.distance)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={[PALETTE.hemiSky, PALETTE.hemiGround, 1.75]} />
      <ambientLight intensity={0.18} color="#fff6e8" />
      <directionalLight
        ref={sun}
        color={SUN.color}
        intensity={SUN.intensity}
        castShadow
        shadow-mapSize={[SHADOW_MAP, SHADOW_MAP]}
        shadow-camera-left={-SHADOW_SIZE}
        shadow-camera-right={SHADOW_SIZE}
        shadow-camera-top={SHADOW_SIZE}
        shadow-camera-bottom={-SHADOW_SIZE}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
      />
    </>
  )
}
