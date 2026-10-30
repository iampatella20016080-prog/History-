import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Euler, MeshToonMaterial, Quaternion, Vector3 } from 'three'
import { buildInspectObject, inspectPartTransform } from '../builders/inspectObjects.js'
import { inspectRuntime, resetInspectRuntime } from '../inspectRuntime.js'
import { inspectActionT, updateInspect } from '../objectInspect.js'
import { QUALITY_MODES } from '../quality.js'
import { getMaterials } from '../rendering/materials.js'
import { renderState } from '../runtime.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 器物 3D 檢視的舞台：把器物畫在主畫面的同一個畫布（不另開 WebGL），
 * 沿用卡通材質與描邊（和街景一起走卡通渲染管線）。
 *
 * 舞台固定在街道上空（STAGE，街景之外，背景只剩天空與遠山），檢視時鏡頭移到舞台前
 * （在 CameraRig 之後覆寫鏡頭，priority 0.5；關閉後 CameraRig 自然接回原本的運鏡）。
 * 器物稍微偏上，底下留給說明卡片；旋轉、縮放與小動作的進度在 inspectRuntime
 * （由 ui/InspectOverlay.jsx 的手勢更新）。
 */
const STAGE = new Vector3(0, 52, 0)
/** 鏡頭看向舞台的方向（固定，背景是西邊的河面與遠山） */
const VIEW_DIR = new Vector3(Math.sin(1.9), 0.2, Math.cos(1.9)).normalize()
const _up = new Vector3(0, 1, 0)
const _rot = new Quaternion()
const _euler = new Euler()
const _target = new Vector3()

let stageMaterial = null

/** 卡通著色、頂點色；自發光是自身顏色的 22%（器物在暗處也看得清楚），做法同情境人物 */
function inspectMaterial() {
  if (stageMaterial) return stageMaterial
  const material = new MeshToonMaterial({ gradientMap: getMaterials().gradientMap, vertexColors: true, emissive: new Color('#ffffff'), emissiveIntensity: 0.22 })
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance *= diffuseColor.rgb;')
  }
  material.customProgramCacheKey = () => 'inspect-emissive-by-color'
  stageMaterial = material
  return material
}

export function ObjectStage() {
  const inspect = useGameStore((state) => state.inspect)
  const root = useRef()
  const spin = useRef()
  const partRefs = useRef({})
  // 精緻畫質用高細節模型，流暢畫質簡化（零件與小動作相同）
  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail ?? true)
  const object = useMemo(() => (inspect ? buildInspectObject(inspect.objectId, { detail }) : null), [inspect, detail])
  // 開始檢視的俯仰角（兩種畫質相同；換畫質時不重設檢視狀態）
  const viewPitch = object?.viewPitch

  // 每次打開都從預設的角度開始
  useEffect(() => {
    if (inspect) resetInspectRuntime({ pitch: viewPitch })
  }, [inspect, viewPitch])

  // 在 CameraRig 之後執行（priority 0.5）：檢視中覆寫鏡頭，鏡頭移到街道上空的舞台前
  useFrame(({ camera }, delta) => {
    const group = root.current
    if (!group || !object) return
    inspectRuntime.value = updateInspect(inspectRuntime.value, Math.min(delta, 0.1))
    const state = inspectRuntime.value
    // 距離依縮放：器物大小（radius）取景
    const distance = (object.radius * 3.4) / state.zoom
    camera.position.copy(STAGE).addScaledVector(VIEW_DIR, distance)
    // 器物稍微偏上（底下留給說明卡片）：鏡頭的注視點往下移一點
    _target.copy(STAGE).addScaledVector(_up, -distance * 0.13)
    camera.lookAt(_target)
    group.position.copy(STAGE)
    // 旋轉：先對齊鏡頭，再依拖曳的 pitch／yaw 轉動器物本身
    group.quaternion.copy(camera.quaternion).multiply(_rot.setFromEuler(_euler.set(state.pitch, state.yaw, 0, 'XYZ')))
    // 景深的焦點放在器物上
    renderState.focusDistance = distance
    for (const part of object.parts) {
      const ref = partRefs.current[part.id]
      if (ref && part.animate) {
        const { rotation, offset } = inspectPartTransform(part, inspectActionT(state, part.animate.action))
        ref.rotation.set(rotation[0], rotation[1], rotation[2])
        ref.position.set(offset[0], offset[1], offset[2])
      }
    }
  }, 0.5)

  if (!object) return null
  const material = inspectMaterial()
  return (
    <group ref={root} name="object-stage">
      <group ref={spin} position={[0, -object.centerY, 0]}>
        {object.parts.map((part) => (
          <group key={part.id} position={part.pivot ?? [0, 0, 0]}>
            <group ref={(el) => (partRefs.current[part.id] = el)}>
              <mesh geometry={part.geometry} material={material} position={part.pivot ? [-part.pivot[0], -part.pivot[1], -part.pivot[2]] : [0, 0, 0]} />
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}
