import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Color, MeshToonMaterial, Vector3 } from 'three'
import { useGameStore } from '../../state/useGameStore.js'
import { getMaterials } from '../rendering/materials.js'
import { getLanternTexture } from '../rendering/signTexture.js'
import { clamp, damp } from '../utils/math.js'
import { ShopPrompt } from '../../ui/ShopPrompt.jsx'
import { SignBoards } from './SignBoards.jsx'
import { StaticBatches } from './StaticBatches.jsx'

const projected = new Vector3()

/** 提示框位置：投影到螢幕後限制在畫面內（避開上方的標題與年代橫幅） */
function promptPosition(el, camera, size) {
  projected.setFromMatrixPosition(el.matrixWorld).project(camera)
  const marginX = Math.min(130, size.width * 0.2)
  const x = clamp((projected.x * 0.5 + 0.5) * size.width, marginX, size.width - marginX)
  const y = clamp((-projected.y * 0.5 + 0.5) * size.height, 190, size.height - 40)
  return [x, y]
}

/** 會隨風輕擺、靠近時發光的燈籠 */
function ShopLantern({ lantern, shopId, index }) {
  const group = useRef()
  const material = useMemo(() => {
    const texture = getLanternTexture(lantern.text)
    return new MeshToonMaterial({
      map: texture,
      emissive: new Color('#ff9a5c'),
      emissiveMap: texture,
      emissiveIntensity: 0.12,
      gradientMap: getMaterials().gradientMap,
    })
  }, [lantern.text])
  const capMaterial = useMemo(() => new MeshToonMaterial({ color: '#2f2620', gradientMap: getMaterials().gradientMap }), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 1.3 + index * 1.7) * 0.05
      group.current.rotation.x = Math.sin(t * 0.9 + index) * 0.03
    }
    const nearby = useGameStore.getState().nearbyShopId === shopId
    material.emissiveIntensity = damp(material.emissiveIntensity, nearby ? 0.55 : 0.12, 4, delta)
  })

  return (
    <group position={[lantern.position[0], lantern.position[1] + 0.42, lantern.position[2]]} rotation-y={lantern.rotationY}>
      <group ref={group}>
        <mesh position={[0, -0.42, 0]} scale={[1, 1.25, 1]} material={material} castShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
        </mesh>
        <mesh position={[0, -0.1, 0]} material={capMaterial}>
          <cylinderGeometry args={[0.13, 0.13, 0.07, 10]} />
        </mesh>
        <mesh position={[0, -0.74, 0]} material={capMaterial}>
          <cylinderGeometry args={[0.13, 0.13, 0.07, 10]} />
        </mesh>
        <mesh position={[0, -0.9, 0]} material={material}>
          <cylinderGeometry args={[0.015, 0.05, 0.24, 6]} />
        </mesh>
      </group>
    </group>
  )
}

/** 漂浮在屋頂上方的探索標記，讓玩家從遠處就能找到可互動的店家 */
function ShopMarker({ position, shopId }) {
  const group = useRef()
  const materials = useMemo(() => {
    const { gradientMap } = getMaterials()
    return {
      gem: new MeshToonMaterial({ color: '#c0553b', emissive: new Color('#ff8a5a'), emissiveIntensity: 0.25, gradientMap }),
      ring: new MeshToonMaterial({ color: '#d9b56a', emissive: new Color('#ffd27a'), emissiveIntensity: 0.2, gradientMap }),
    }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { nearbyShopId, mode } = useGameStore.getState()
    const active = nearbyShopId === shopId
    if (!group.current) return
    group.current.position.y = position.y + Math.sin(t * 1.8) * 0.18
    group.current.rotation.y += delta * (active ? 2.4 : 0.9)
    const target = mode === 'explore' ? (active ? 1.25 : 1) : 0.001
    const s = damp(group.current.scale.x, target, 6, delta)
    group.current.scale.setScalar(s)
    materials.gem.emissiveIntensity = damp(materials.gem.emissiveIntensity, active ? 0.7 : 0.25, 4, delta)
  })

  return (
    <group ref={group} position={[position.x, position.y, position.z]}>
      <mesh material={materials.gem} scale={[0.42, 0.62, 0.42]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={materials.ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.62, 0.05, 6, 24]} />
      </mesh>
    </group>
  )
}

/** 可互動的店家建築：建築本體、招牌、燈籠、標記與互動提示 */
export function ShopBuilding({ model, promptLayer }) {
  const { shop, batches, signs, lanterns, anchors } = model
  return (
    <group name={`shop-${shop.id}`}>
      <StaticBatches batches={batches} />
      <SignBoards signs={signs} />
      {lanterns.map((lantern, i) => (
        <ShopLantern key={i} lantern={lantern} shopId={shop.id} index={i} />
      ))}
      <ShopMarker position={anchors.marker} shopId={shop.id} />
      <Html
        position={[anchors.prompt.x, anchors.prompt.y, anchors.prompt.z]}
        portal={promptLayer}
        calculatePosition={promptPosition}
        zIndexRange={[12, 0]}
        pointerEvents="none"
      >
        <ShopPrompt shop={shop} />
      </Html>
    </group>
  )
}
