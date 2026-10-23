import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshToonMaterial } from 'three'
import { buildNpcGeometry, npcAnimation } from '../character/npcBuilder.js'
import { QUALITY_MODES } from '../quality.js'
import { getMaterials } from '../rendering/materials.js'
import { useGameStore } from '../../state/useGameStore.js'
import { hysteresisVisible } from '../visibility.js'

/**
 * 店家與攤位裡的情境人物（攤販、吃米苔目的客人、排隊的人與店員；幾何見 character/npcBuilder.js）。
 *
 * 位置、面向與姿勢來自街景資料（world.npcs，由攤位與店家的建築產生器提供），跟著這個年代的街景掛載與卸載；
 * 店裡的人物（zone）放在那間店的室內群組裡，室內產生、顯示時才出現。
 * 人物不會走動：只有右前臂（夾菜、招手、舀湯）與頭的待機動作；流暢模式的動作幅度較小、每兩個影格更新一次。
 * 每個人物三個網格、共用一種材質（頂點色），離鏡頭太遠就不繪製。
 */
const SHOW_DISTANCE = 30

let sharedMaterial = null

/** 卡通著色、頂點色；自發光與主角的服裝一樣是自身顏色的 16%（陰影裡也看得清楚） */
function npcMaterial() {
  if (sharedMaterial) return sharedMaterial
  const material = new MeshToonMaterial({ gradientMap: getMaterials().gradientMap, vertexColors: true, emissive: new Color('#ffffff'), emissiveIntensity: 0.16 })
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance *= diffuseColor.rgb;')
  }
  material.customProgramCacheKey = () => 'npc-emissive-by-color'
  sharedMaterial = material
  return material
}

/** 同一種外觀與姿勢的人物共用幾何（快取到頁面關閉） */
const geometryCache = new Map()
function npcGeometry(npc) {
  const key = `${npc.look}|${npc.pose}|${npc.seatY ?? 0}`
  if (!geometryCache.has(key)) geometryCache.set(key, buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY }))
  return geometryCache.get(key)
}

export function Npc({ npc }) {
  const root = useRef()
  const head = useRef()
  const elbow = useRef()
  const frame = useRef(0)
  const parts = useMemo(() => npcGeometry(npc), [npc])
  const material = npcMaterial()
  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail ?? true)

  useFrame(({ camera, clock }) => {
    const group = root.current
    if (!group) return
    const [x, , z] = npc.position
    // 遲滯：在顯示距離附近來回時不會閃爍
    const visible = hysteresisVisible(group.visible, Math.hypot(camera.position.x - x, camera.position.z - z), SHOW_DISTANCE)
    group.visible = visible
    frame.current++
    const t = clock.elapsedTime
    if (visible && (detail || frame.current % 2 === 0)) {
      const a = npcAnimation(parts.pose, t, npc.phase ?? 0)
      const scale = detail ? 1 : 0.6
      const [low] = parts.pose.anim.elbow
      if (elbow.current) elbow.current.rotation.x = -(low + (a.elbow - low) * scale)
      if (head.current) {
        head.current.rotation.x = parts.pose.head + (a.nod - parts.pose.head) * scale
        head.current.rotation.y = a.turn * scale
      }
    }
    // 開發模式：測試用（人物有沒有掛載、目前的姿勢與動作）
    if (import.meta.env.DEV && window.__DDC__) {
      window.__DDC__.npcs ??= {}
      window.__DDC__.npcs[npc.id] = { visible, look: npc.look, pose: npc.pose, zone: npc.zone ?? null, elbow: elbow.current?.rotation.x ?? null, nod: head.current?.rotation.x ?? null, position: npc.position, time: t }
    }
  })

  useEffect(
    () => () => {
      if (import.meta.env.DEV && window.__DDC__?.npcs) delete window.__DDC__.npcs[npc.id]
    },
    [npc.id],
  )

  return (
    <group ref={root} name={`npc-${npc.id}`} position={npc.position} rotation={[0, npc.rotationY, 0]}>
      <mesh geometry={parts.body} material={material} castShadow />
      <group position={parts.headPivot.position} quaternion={parts.headPivot.quaternion}>
        <group ref={head}>
          <mesh geometry={parts.head} material={material} castShadow />
        </group>
      </group>
      <group position={parts.elbowPivot.position} quaternion={parts.elbowPivot.quaternion}>
        <group ref={elbow}>
          <mesh geometry={parts.forearm} material={material} castShadow />
        </group>
      </group>
    </group>
  )
}

/** 一組人物（攤位前的人物在街景裡；店裡的人物在那間店的室內群組裡） */
export function NpcLayer({ npcs, name = 'npcs' }) {
  if (!npcs?.length) return null
  return (
    <group name={name}>
      {npcs.map((npc) => (
        <Npc key={npc.id} npc={npc} />
      ))}
    </group>
  )
}
