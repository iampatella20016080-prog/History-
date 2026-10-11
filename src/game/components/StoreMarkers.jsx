import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Color, MeshToonMaterial, Vector3 } from 'three'
import { useGameStore } from '../../state/useGameStore.js'
import { atmosphere } from '../atmosphere.js'
import { getMaterials } from '../rendering/materials.js'
import { getLanternTexture } from '../rendering/signTexture.js'
import { clamp, damp } from '../utils/math.js'
import { ShopPrompt } from '../../ui/ShopPrompt.jsx'

const projected = new Vector3()

/** 提示框位置：投影到螢幕後限制在畫面內（避開右上角的設定與店家名錄） */
function promptPosition(el, camera, size) {
  projected.setFromMatrixPosition(el.matrixWorld).project(camera)
  const marginX = Math.min(130, size.width * 0.2)
  const top = 96
  const x = clamp((projected.x * 0.5 + 0.5) * size.width, marginX, size.width - marginX)
  const y = clamp((-projected.y * 0.5 + 0.5) * size.height, top, size.height - 40)
  return [x, y]
}

/** 店號燈籠（寫有店名字樣）：隨風輕擺，玩家靠近店家時亮起 */
function TextLantern({ lantern, index }) {
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
  useEffect(
    () => () => {
      material.dispose()
      capMaterial.dispose()
    },
    [material, capMaterial],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 1.3 + index * 1.7) * 0.05
      group.current.rotation.x = Math.sin(t * 0.9 + index) * 0.03
    }
    const nearby = lantern.storeId && useGameStore.getState().nearbyShopId === lantern.storeId
    const base = 0.12 + atmosphere.current.glow * 0.9 * atmosphere.current.lanternGlow
    material.emissiveIntensity = damp(material.emissiveIntensity, nearby ? base + 0.45 : base, 4, delta)
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

export function TextLanterns({ lanterns }) {
  return lanterns.map((lantern, i) => <TextLantern key={`${lantern.text}-${i}`} lantern={lantern} index={i} />)
}

let markerMaterials = null
function getMarkerMaterials() {
  if (markerMaterials) return markerMaterials
  const { gradientMap } = getMaterials()
  markerMaterials = {
    gem: new MeshToonMaterial({ color: '#c0553b', emissive: new Color('#ff8a5a'), emissiveIntensity: 0.3, gradientMap }),
    ring: new MeshToonMaterial({ color: '#d9b56a', emissive: new Color('#ffd27a'), emissiveIntensity: 0.25, gradientMap }),
    soonGem: new MeshToonMaterial({ color: '#efe3c8', emissive: new Color('#fff2d6'), emissiveIntensity: 0.18, gradientMap }),
    soonRing: new MeshToonMaterial({ color: '#9c8a6c', emissive: new Color('#c9b48a'), emissiveIntensity: 0.12, gradientMap }),
  }
  return markerMaterials
}

/**
 * 屋頂上的店家標記：
 * - 可探索的店家：旋轉的紅色寶珠與金環（遠處就看得到）
 * - 即將開放的店家：較小、米白色的標記
 */
function StoreMarker({ position, shopId, open }) {
  const group = useRef()
  const materials = getMarkerMaterials()
  const base = open ? 1 : 0.62

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { nearbyShopId, mode, transitioning, viewMode } = useGameStore.getState()
    const active = nearbyShopId === shopId
    if (!group.current) return
    group.current.position.y = position.y + Math.sin(t * 1.8 + position.x) * 0.18 * base
    group.current.rotation.y += delta * (active ? 2.4 : open ? 0.9 : 0.5)
    // 建築觀賞模式只留建築本身，不顯示屋頂標記
    const visible = mode === 'explore' && !transitioning && viewMode === 'explore'
    const target = visible ? (active ? base * 1.25 : base) : 0.001
    group.current.scale.setScalar(damp(group.current.scale.x, target, 6, delta))
    if (open) materials.gem.emissiveIntensity = damp(materials.gem.emissiveIntensity, active ? 0.75 : 0.3, 4, delta)
  })

  return (
    <group ref={group} position={[position.x, position.y, position.z]} scale={0.001}>
      <mesh material={open ? materials.gem : materials.soonGem} scale={[0.42, 0.62, 0.42]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={open ? materials.ring : materials.soonRing} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.62, 0.05, 6, 24]} />
      </mesh>
    </group>
  )
}

/** 這個年代所有店家的屋頂標記；已開放的店家另有靠近時的店名提示（未開放的店家不顯示提示） */
export function StoreMarkers({ shopModels, promptLayer }) {
  return shopModels.map(({ shop, anchors }) => (
    <group key={shop.id} name={`store-${shop.id}`}>
      <StoreMarker position={anchors.marker} shopId={shop.id} open={shop.status === 'open'} />
      {shop.status === 'open' && (
        <Html
          position={[anchors.prompt.x, anchors.prompt.y, anchors.prompt.z]}
          portal={promptLayer}
          calculatePosition={promptPosition}
          zIndexRange={[12, 0]}
          pointerEvents="none"
        >
          <ShopPrompt shop={shop} />
        </Html>
      )}
    </group>
  ))
}
