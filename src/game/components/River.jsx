import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, CanvasTexture, Color, DoubleSide, Matrix4, MeshBasicMaterial, MeshToonMaterial, SRGBColorSpace } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LAYERS, RIVER } from '../config.js'
import { getEra } from '../../data/eras.js'
import { WHARF_BOATS } from '../../data/qingWharfLayout.js'
import { atmosphere } from '../atmosphere.js'
import { QUALITY_MODES } from '../quality.js'
import { motionEnabled, MOTION_SETTINGS } from '../motion.js'
import { createReflectionMaterial, patchWaterMaterial, reflectionUniforms, waterReflectUniforms, waterUniforms } from '../rendering/waterShader.js'
import { RiverReflection } from './RiverReflection.jsx'
import { useGameStore } from '../../state/useGameStore.js'
import { PartBuilder } from '../builders/PartBuilder.js'
import { buildFerry, buildJunk, buildSampan } from '../builders/environment.js'
import { getMaterials } from '../rendering/materials.js'
import { getTextures } from '../rendering/textures.js'
import { StaticBatches } from './StaticBatches.jsx'

const WL = RIVER.waterLevel
const WHITE = new Color('#ffffff')

/** 各年代河面上的船：清末到日治初期的戎克船、之後的舢舨，以及今日的遊船 */
const BOATS = {
  junks: [
    { type: 'junk', position: [-49.2, WL - 0.35, -3.4], rotationY: Math.PI, length: 9.5, sails: 2, furled: true, bob: 0.6 },
    { type: 'junk', position: [-92, WL - 0.35, 26], rotationY: 0.35, length: 10, sails: 2, bob: 1.3, drift: 0.35 },
    { type: 'junk', position: [-150, WL - 0.35, -46], rotationY: -0.25, length: 8, sails: 1, bob: 2.1, drift: -0.25, sailTint: '#a9805a' },
    { type: 'junk', position: [-60, WL - 0.3, 9], rotationY: -1.2, length: 6.2, sails: 1, bob: 0.9, furled: true, sailTint: '#9f7a58' },
  ],
  // 清末碼頭：棧橋兩側的接駁小船與河道中下錨的戎克船載著茶箱（data/qingWharfLayout.js），遠處河面的兩艘與日治初期相同
  get qingWharf() {
    return [...WHARF_BOATS, ...BOATS.junks.slice(1, 3)]
  },
  sampans: [
    { type: 'sampan', position: [-48.6, WL - 0.2, -3.0], rotationY: Math.PI, length: 5.4, canopy: true, bob: 0.6 },
    { type: 'sampan', position: [-50.8, WL - 0.2, 3.1], rotationY: Math.PI + 0.1, length: 4.8, canopy: false, bob: 1.4 },
    { type: 'sampan', position: [-70, WL - 0.2, 14], rotationY: -1.1, length: 5.0, canopy: true, bob: 2.2, drift: 0.3 },
    { type: 'junk', position: [-140, WL - 0.35, -40], rotationY: -0.25, length: 8, sails: 1, bob: 2.1, drift: -0.25, sailTint: '#a9805a' },
  ],
  ferry: [
    { type: 'ferry', position: [-51.2, WL - 0.25, -4.4], rotationY: Math.PI, length: 13, bob: 0.4 },
    { type: 'sampan', position: [-66, WL - 0.2, 12], rotationY: -1.1, length: 5.0, canopy: false, bob: 2.2, drift: 0.3 },
    { type: 'ferry', position: [-160, WL - 0.25, 50], rotationY: 0.4, length: 12, bob: 1.7, drift: 0.2 },
  ],
}

/** 對水面（y = 水位）鏡射的矩陣 */
const MIRROR = new Matrix4().makeTranslation(0, WL, 0).multiply(new Matrix4().makeScale(1, -1, 1)).multiply(new Matrix4().makeTranslation(0, -WL, 0))

let reflectionMaterial = null
function getReflectionMaterial() {
  reflectionMaterial ??= createReflectionMaterial()
  return reflectionMaterial
}

/** 船的倒影幾何：整艘船合成一個網格（一次繪製），顏色用頂點色 */
function reflectionGeometry(batches) {
  const parts = batches.map(({ geometry }) => {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone()
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'color') g.deleteAttribute(name)
    if (!g.attributes.color) g.setAttribute('color', new BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(0.6), 3))
    return g
  })
  const merged = mergeGeometries(parts)
  parts.forEach((g) => g.dispose())
  merged.computeBoundingSphere()
  return merged
}

function Boat({ boat, reflection }) {
  const group = useRef()
  const mirror = useRef()
  const batches = useMemo(() => {
    const b = new PartBuilder()
    if (boat.type === 'sampan') buildSampan(b, { length: boat.length, beam: boat.beam, canopy: boat.canopy, cargo: boat.cargo })
    else if (boat.type === 'ferry') buildFerry(b, { length: boat.length })
    else buildJunk(b, { length: boat.length, beam: boat.beam, sails: boat.sails, furled: boat.furled, sailTint: boat.sailTint, cargo: boat.cargo })
    return b.build()
  }, [boat])
  const mirrored = useMemo(() => (reflection ? reflectionGeometry(batches) : null), [batches, reflection])
  useEffect(() => () => mirrored?.dispose(), [mirrored])

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
    // 倒影跟著船上下起伏與漂移：船的世界矩陣對水面鏡射（River 的群組在原點）
    const m = mirror.current
    if (m) {
      g.updateMatrix()
      m.matrix.multiplyMatrices(MIRROR, g.matrix)
      m.matrixWorldNeedsUpdate = true
    }
  })

  return (
    <>
      <group ref={group} position={boat.position} rotation-y={boat.rotationY}>
        <StaticBatches batches={batches} />
      </group>
      {mirrored && (
        <mesh
          ref={mirror}
          name="boat-reflection"
          geometry={mirrored}
          material={getReflectionMaterial()}
          matrixAutoUpdate={false}
          frustumCulled={false}
          renderOrder={2}
          onUpdate={(mesh) => mesh.layers.set(LAYERS.NO_OUTLINE)}
        />
      )}
    </>
  )
}

/** 河面上的薄霧：幾片朝向街道的柔和霧帶，濃淡依年代的 riverMist 值 */
function RiverMist({ detail }) {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 128
    const g = canvas.getContext('2d')
    const grad = g.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.55)')
    grad.addColorStop(0.85, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0.6)')
    g.fillStyle = grad
    g.fillRect(0, 0, 8, 128)
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false, side: DoubleSide, opacity: 0.3 })
  }, [])
  const group = useRef()
  useEffect(() => {
    group.current?.traverse((object) => object.layers.set(LAYERS.NO_OUTLINE))
  }, [])
  useFrame((state) => {
    const a = atmosphere.current
    material.color.copy(a.fogColor)
    material.opacity = a.riverMist * 0.75
    if (group.current) group.current.position.z = Math.sin(state.clock.elapsedTime * 0.03) * 8
  })
  return (
    <group ref={group}>
      {[
        [-70, 7, 0.9],
        [-105, 10, 1.0],
        [-150, 13, 1.0],
      ].map(([x, h, s], i) => (
        <mesh key={i} visible={detail || i === 0} position={[x, WL + h / 2 - 0.4, 0]} rotation-y={Math.PI / 2} material={material} renderOrder={5}>
          <planeGeometry args={[520 * s, h]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * 淡水河：卡通水面（貼圖緩慢流動）、河面薄霧、各年代的船隻。
 * 精緻畫質的水面另外有波紋、反光與燈火倒影（rendering/waterShader.js），船也有倒影；
 * 流暢畫質用原本的靜態水面材質、不建立倒影（兩份材質共用同一張貼圖，切換畫質時換材質，不必重新編譯）。
 */
export function River({ eraId }) {
  const materials = useMemo(() => {
    const texture = getTextures().water.clone()
    texture.needsUpdate = true
    texture.repeat.set(160, 160)
    const create = () => new MeshToonMaterial({ map: texture, color: new Color('#ffffff'), gradientMap: getMaterials().gradientMap })
    return { still: create(), rippled: patchWaterMaterial(create()) }
  }, [])
  const motion = useGameStore((state) => motionEnabled(state.qualityMode))
  const material = motion ? materials.rippled : materials.still

  useFrame((state, delta) => {
    // 貼圖共用：移動一次就好
    materials.still.map.offset.x -= delta * 0.004
    materials.still.map.offset.y += delta * 0.0015
    const a = atmosphere.current
    materials.still.color.copy(a.water)
    materials.rippled.color.copy(a.water)
    if (!motion) return
    const t = state.clock.elapsedTime
    waterUniforms.uTime.value = t
    waterUniforms.uOctaves.value = MOTION_SETTINGS.fine.rippleOctaves
    waterUniforms.uSunDir.value.copy(a.sunDirection)
    // 反光的顏色是天空裡太陽周圍的光暈色；太陽越低（傍晚）光帶越亮、越暖
    waterUniforms.uSunColor.value.copy(a.sunGlow).lerp(a.sunColor, 0.4)
    waterUniforms.uGlint.value = Math.min(1.2, 0.35 + a.sunIntensity * 0.18 + (1 - Math.min(a.elevation, 60) / 60) * 0.5)
    waterUniforms.uSky.value.copy(a.skyHorizon)
    // 燈火倒影只在入夜的年代（酒樓繁華最明顯、摩登較淡，白天的年代沒有）
    const night = Math.min(1, Math.max(0, (a.glow * a.lanternGlow - 0.45) / 0.35))
    waterUniforms.uNight.value = night * night * (3 - 2 * night)
    waterUniforms.uEdgeX.value = RIVER.edgeX
    // 岸上的倒影帶一點河水的顏色（只有精緻畫質的水面著色器讀這組）
    waterReflectUniforms.uReflectTint.value.copy(a.water).lerp(WHITE, 0.55)
    reflectionUniforms.uTime.value = t
    reflectionUniforms.uWaterLevel.value = WL
    reflectionUniforms.uEdgeX.value = RIVER.edgeX
    // 船身顏色的亮度跟著天光（白天白帆比較亮，入夜時整艘船都暗下來）
    reflectionUniforms.uTone.value.setScalar(Math.min(1, 0.35 + a.hemiIntensity * 0.12 + a.sunIntensity * 0.15))
  })

  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail !== false)
  // 岸上的倒影（平面反射）只在精緻畫質；流暢畫質用不打補丁的水面材質，維持原樣
  const reflectScale = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.waterReflection ?? 0)
  useEffect(() => {
    const on = reflectScale > 0
    const rippled = materials.rippled
    if (Boolean(rippled.userData.planarReflection) === on) return
    rippled.userData.planarReflection = on
    rippled.needsUpdate = true
  }, [materials, reflectScale])
  const boats = BOATS[getEra(eraId)?.streetProps.boats] ?? BOATS.junks
  const width = 1100
  return (
    <group>
      <mesh position={[RIVER.edgeX - width / 2, RIVER.waterLevel, 0]} rotation-x={-Math.PI / 2} material={material} receiveShadow>
        <planeGeometry args={[width, 1600]} />
      </mesh>
      {boats.map((boat, i) =>
        // 流暢模式不畫遠處河面上的船；倒影只在精緻畫質（每艘船都有）
        detail || (boat.position[0] > -80 && !boat.detailOnly) ? <Boat key={`${eraId}-${i}`} boat={boat} reflection={motion} /> : null,
      )}
      <RiverMist detail={detail} />
      {reflectScale > 0 && <RiverReflection scale={reflectScale} />}
    </group>
  )
}
