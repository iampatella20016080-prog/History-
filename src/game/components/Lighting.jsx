import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, Vector3 } from 'three'
import { atmosphere } from '../atmosphere.js'
import { playerState } from '../runtime.js'
import { getQuality } from '../quality.js'
import { setGlowLevel } from '../rendering/materials.js'

const SHADOW_SIZE = 30
const LIGHT_DISTANCE = 60

/**
 * 柔和的自然光：天空半球光＋環境光＋太陽（或夕陽）。
 * 光色、強度與方向每一影格依年代氛圍更新；陰影相機跟隨角色移動，
 * 並對齊陰影貼圖像素格，避免移動時陰影邊緣閃爍。
 */
export function Lighting() {
  const sun = useRef()
  const hemi = useRef()
  const ambient = useRef()
  const shadowMapSize = useMemo(() => getQuality().shadowMapSize, [])
  const basis = useMemo(() => ({ x: new Vector3(), y: new Vector3(), z: new Vector3(), up: new Vector3(0, 1, 0) }), [])
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
    const a = atmosphere.current
    light.color.copy(a.sunColor)
    light.intensity = a.sunIntensity
    hemi.current.color.copy(a.hemiSky)
    hemi.current.groundColor.copy(a.hemiGround)
    hemi.current.intensity = a.hemiIntensity
    ambient.current.color.copy(a.ambientColor)
    ambient.current.intensity = a.ambientIntensity
    setGlowLevel(a.glow)

    basis.z.copy(a.lightDirection)
    basis.x.crossVectors(basis.up, basis.z).normalize()
    basis.y.crossVectors(basis.z, basis.x).normalize()
    const texel = (SHADOW_SIZE * 2) / shadowMapSize
    const p = playerState.position
    const px = Math.round(p.dot(basis.x) / texel) * texel
    const py = Math.round(p.dot(basis.y) / texel) * texel
    const pz = p.dot(basis.z)
    temp.copy(basis.x).multiplyScalar(px).addScaledVector(basis.y, py).addScaledVector(basis.z, pz)
    light.target.position.copy(temp)
    light.position.copy(temp).addScaledVector(basis.z, LIGHT_DISTANCE)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#e3ecea', '#c7b08b', 1.75]} />
      <ambientLight ref={ambient} intensity={0.18} color="#fff6e8" />
      <directionalLight
        ref={sun}
        intensity={2.5}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
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

/** 場景霧氣：顏色與距離隨年代變化 */
export function SceneFog() {
  const scene = useThree((state) => state.scene)
  const fog = useMemo(() => new Fog('#e9dcc0', 42, 400), [])
  useEffect(() => {
    scene.fog = fog
    return () => {
      if (scene.fog === fog) scene.fog = null
    }
  }, [scene, fog])
  useFrame(() => {
    const a = atmosphere.current
    fog.color.copy(a.fogColor)
    fog.near = a.fogNear
    fog.far = a.fogFar
  })
  return null
}
