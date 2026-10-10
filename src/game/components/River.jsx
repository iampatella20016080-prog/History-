import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshToonMaterial } from 'three'
import { RIVER } from '../config.js'
import { PartBuilder } from '../builders/PartBuilder.js'
import { buildJunk } from '../builders/environment.js'
import { getMaterials } from '../rendering/materials.js'
import { getTextures } from '../rendering/textures.js'
import { StaticBatches } from './StaticBatches.jsx'

const BOATS = [
  // 停靠在碼頭北側
  { position: [-49.2, RIVER.waterLevel - 0.35, -3.4], rotationY: Math.PI, length: 9.5, sails: 2, furled: true, bob: 0.6 },
  // 河面上的帆船
  { position: [-92, RIVER.waterLevel - 0.35, 26], rotationY: 0.35, length: 10, sails: 2, bob: 1.3, drift: 0.35 },
  { position: [-150, RIVER.waterLevel - 0.35, -46], rotationY: -0.25, length: 8, sails: 1, bob: 2.1, drift: -0.25, sailTint: '#a9805a' },
  { position: [-60, RIVER.waterLevel - 0.3, 9], rotationY: -1.2, length: 6.2, sails: 1, bob: 0.9, furled: true, sailTint: '#9f7a58' },
]

function Boat({ boat }) {
  const group = useRef()
  const batches = useMemo(() => {
    const b = new PartBuilder()
    buildJunk(b, { length: boat.length, sails: boat.sails, furled: boat.furled, sailTint: boat.sailTint })
    return b.build()
  }, [boat])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return
    g.position.y = boat.position[1] + Math.sin(t * 0.9 + boat.bob) * 0.06
    g.rotation.z = Math.sin(t * 0.7 + boat.bob) * 0.025
    g.rotation.x = Math.sin(t * 0.55 + boat.bob * 2) * 0.018
    if (boat.drift) {
      g.position.z = boat.position[2] + Math.sin(t * 0.02 + boat.bob) * 6 * Math.sign(boat.drift)
    }
  })

  return (
    <group ref={group} position={boat.position} rotation-y={boat.rotationY}>
      <StaticBatches batches={batches} />
    </group>
  )
}

/** 淡水河：卡通水面（貼圖緩慢流動）與往來的戎克船 */
export function River() {
  const material = useMemo(() => {
    const texture = getTextures().water.clone()
    texture.needsUpdate = true
    texture.repeat.set(160, 160)
    return new MeshToonMaterial({
      map: texture,
      color: new Color('#ffffff'),
      gradientMap: getMaterials().gradientMap,
    })
  }, [])

  useFrame((_, delta) => {
    material.map.offset.x -= delta * 0.004
    material.map.offset.y += delta * 0.0015
  })

  const width = 1100
  return (
    <group>
      <mesh
        position={[RIVER.edgeX - width / 2, RIVER.waterLevel, 0]}
        rotation-x={-Math.PI / 2}
        material={material}
        receiveShadow
      >
        <planeGeometry args={[width, 1600]} />
      </mesh>
      {BOATS.map((boat, i) => (
        <Boat key={i} boat={boat} />
      ))}
    </group>
  )
}
