import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { QUALITY_MODES } from '../quality.js'
import { createToonMaterial } from '../rendering/materials.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 老潘魷魚羹店裡的黑白貓（依需求說明中描述的照片加入的情境角色；沒有名字，也不表示由店家飼養）。
 *
 * 風格化的坐姿：黑色的背與尾巴，白色的胸口、口鼻周圍與四隻腳，淡黃綠色的眼睛。
 * 坐在座位區邊緣的桌腳旁、身體朝店裡，回頭看著門口；不會走動，也不會跳上料理檯或餐桌。
 * 待機動畫只有眨眼、輕微轉頭與尾巴末端擺動；流暢模式保留貓的模型，尾巴只擺末端一節、轉頭的幅度較小。
 *
 * 位置與朝向來自街景資料（world.cats，見 builders/laoPanExterior.js），跟著這個年代的街景掛載與卸載。
 */
const BLACK = '#25221f'
const WHITE = '#f4f1ea'
const EYE = '#d4dc7a'
const PINK = '#d99a92'
/** 鏡頭離貓多遠以內才繪製（公尺） */
const SHOW_DISTANCE = 26

/** 每隻貓固定的眨眼節奏（秒）：間隔不規則但每次載入都一樣 */
const BLINKS = [3.4, 5.1, 2.6, 4.4, 6.0, 3.0, 4.8]
const BLINK_TIME = 0.16

function useCatMaterials() {
  const materials = useMemo(() => {
    const make = (color, glow = 0.16) => createToonMaterial(color, { emissive: new Color(color), emissiveIntensity: glow })
    return { black: make(BLACK, 0.12), white: make(WHITE, 0.1), eye: make(EYE, 0.35), pupil: make('#141210', 0), pink: make(PINK, 0.15) }
  }, [])
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials])
  return materials
}

/** 一個橢球（以單位球縮放） */
function Blob({ material, position, scale, rotation }) {
  return (
    <mesh material={material} position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 14, 10]} />
    </mesh>
  )
}

export function LaoPanCat({ cat }) {
  const m = useCatMaterials()
  const root = useRef()
  const head = useRef()
  const eyes = useRef([])
  const tail = useRef([])
  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail ?? true)

  // 尾巴：從臀部往側邊繞到前腳旁的一串小段，最後兩段是會擺動的末端
  const tailSegments = useMemo(() => {
    const list = []
    for (let i = 0; i < 6; i++) list.push({ length: 0.07, radius: 0.022 - i * 0.002 })
    return list
  }, [])

  useFrame(({ camera, clock }) => {
    const group = root.current
    if (!group) return
    const [x, , z] = cat.position
    const visible = Math.hypot(camera.position.x - x, camera.position.z - z) < SHOW_DISTANCE
    group.visible = visible
    if (!visible) return
    const t = clock.elapsedTime
    // 眨眼：依固定的節奏
    let cycle = 0
    for (const gap of BLINKS) cycle += gap
    let phase = t % cycle
    let blink = 1
    for (const gap of BLINKS) {
      if (phase < gap) {
        const into = gap - phase
        if (into < BLINK_TIME) blink = 0.12 + 0.88 * Math.abs(into / BLINK_TIME - 0.5) * 2
        break
      }
      phase -= gap
    }
    for (const eye of eyes.current) if (eye) eye.scale.y = blink
    // 轉頭：回頭看的姿勢附近慢慢地左右張望
    const sway = detail ? 0.24 : 0.12
    if (head.current) {
      head.current.rotation.y = cat.headTurn + Math.sin(t * 0.33) * sway + Math.sin(t * 0.11 + 1.3) * sway * 0.5
      head.current.rotation.x = Math.sin(t * 0.47) * 0.05
    }
    // 尾巴末端擺動（流暢模式只擺最後一節）
    const from = detail ? tailSegments.length - 3 : tailSegments.length - 1
    tail.current.forEach((segment, i) => {
      if (!segment) return
      segment.rotation.y = segment.userData.baseYaw + (i >= from ? Math.sin(t * 2.1 - i * 0.7) * (detail ? 0.28 : 0.18) : 0)
    })
    // 開發模式：測試用（貓有沒有掛載、眨眼與轉頭的狀態）
    if (import.meta.env.DEV && window.__DDC__) {
      window.__DDC__.cats ??= {}
      window.__DDC__.cats[cat.id] = { visible, blink, headYaw: head.current?.rotation.y ?? null, tailYaw: tail.current.at(-1)?.rotation.y ?? null, time: t }
    }
  })

  useEffect(
    () => () => {
      if (import.meta.env.DEV && window.__DDC__?.cats) delete window.__DDC__.cats[cat.id]
    },
    [cat.id],
  )

  // 尾巴的一節一節以前一節的末端為原點（巢狀的群組），整條尾巴貼著地面繞到身體右側
  const renderTail = (index) => {
    if (index >= tailSegments.length) return null
    const { length, radius } = tailSegments[index]
    const baseYaw = index === 0 ? 2.2 : 0.42
    return (
      <group
        ref={(node) => {
          if (node) node.userData.baseYaw = baseYaw
          tail.current[index] = node
        }}
        rotation={[0, baseYaw, 0]}
      >
        <mesh material={m.black} position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.9, radius, length, 8]} />
        </mesh>
        <group position={[0, index === tailSegments.length - 1 ? 0.005 : 0, length]}>{renderTail(index + 1)}</group>
      </group>
    )
  }

  return (
    <group ref={root} name={`cat-${cat.id}`} position={cat.position} rotation={[0, cat.rotationY, 0]}>
      {/* 臀部、背（黑）與白色的胸口 */}
      <Blob material={m.black} position={[0, 0.12, -0.04]} scale={[0.115, 0.12, 0.15]} />
      <Blob material={m.black} position={[0, 0.22, 0.03]} scale={[0.085, 0.13, 0.085]} rotation={[-0.25, 0, 0]} />
      <Blob material={m.white} position={[0, 0.2, 0.085]} scale={[0.06, 0.1, 0.04]} rotation={[-0.2, 0, 0]} />
      {/* 前腳與後腳（白） */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={m.white} position={[s * 0.038, 0.1, 0.085]}>
            <cylinderGeometry args={[0.021, 0.024, 0.18, 8]} />
          </mesh>
          <Blob material={m.white} position={[s * 0.04, 0.015, 0.1]} scale={[0.027, 0.016, 0.035]} />
          <Blob material={m.white} position={[s * 0.085, 0.018, 0.0]} scale={[0.03, 0.018, 0.05]} />
        </group>
      ))}
      {/* 尾巴：從臀部後方開始 */}
      <group position={[0.05, 0.02, -0.16]}>{renderTail(0)}</group>
      {/* 頭：以脖子為軸轉動；白色口鼻、粉紅鼻頭、淡黃綠色的眼睛與黑色瞳孔、耳朵 */}
      <group ref={head} position={[0, 0.33, 0.05]}>
        <Blob material={m.black} position={[0, 0.045, 0.02]} scale={[0.072, 0.066, 0.068]} />
        <Blob material={m.white} position={[0, 0.018, 0.07]} scale={[0.042, 0.03, 0.03]} />
        <Blob material={m.pink} position={[0, 0.04, 0.094]} scale={[0.009, 0.007, 0.006]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <group ref={(node) => (eyes.current[s < 0 ? 0 : 1] = node)} position={[s * 0.029, 0.058, 0.074]}>
              <Blob material={m.eye} position={[0, 0, 0]} scale={[0.016, 0.014, 0.008]} />
              <Blob material={m.pupil} position={[0, 0, 0.006]} scale={[0.005, 0.012, 0.004]} />
            </group>
            <mesh material={m.black} position={[s * 0.043, 0.112, 0.012]} rotation={[0.1, 0, -s * 0.38]}>
              <coneGeometry args={[0.028, 0.065, 4]} />
            </mesh>
            <mesh material={m.pink} position={[s * 0.041, 0.106, 0.026]} rotation={[0.1, 0, -s * 0.38]}>
              <coneGeometry args={[0.014, 0.038, 4]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** 這個年代街景裡的貓（目前只有老潘店裡的一隻） */
export function CatLayer({ cats }) {
  if (!cats?.length) return null
  return (
    <group name="cats">
      {cats.map((cat) => (
        <LaoPanCat key={cat.id} cat={cat} />
      ))}
    </group>
  )
}
