import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, ShaderMaterial } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { bankLightAmount, buildOppositeBank } from '../oppositeBank.js'
import { nightEra } from '../night.js'
import { QUALITY_MODES } from '../quality.js'
import { useGameStore } from '../../state/useGameStore.js'

const VERTEX = /* glsl */ `
  attribute vec3 tint;
  attribute float light;
  varying vec3 vTint;
  varying float vLight;
  void main() {
    vTint = tint;
    vLight = light;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * 剪影：遠景色（和遠山同一個年代色，近一點所以暗一點、清楚一點）乘上各部位的色調，再往霧色退；
 * 窗與路燈在入夜時亮起（白天和牆面同色，看不出來）。卡通風格的平塗，不打光。
 */
const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uFog;
  uniform float uFogAmount;
  uniform vec3 uLightColor;
  uniform float uLightAmount;
  varying vec3 vTint;
  varying float vLight;
  void main() {
    vec3 color = uColor * vTint;
    color = mix(color, uFog, uFogAmount);
    if (vLight > 0.0) color = mix(color, uLightColor * (0.7 + vLight * 0.6), uLightAmount * step(0.001, vLight));
    gl_FragColor = vec4(color, 1.0);
  }
`

const WARM = new Color('#ffcc88')

/**
 * 隔岸天際線（只在精緻畫質掛載）：對岸三重埔一帶的低面數剪影，依年代不同（純邏輯與查證見 oppositeBank.js）。
 * 一個網格、一次繪製；也畫進河面倒映（userData.reflect），夜裡的燈火在河面上有倒影。
 * 流暢畫質不建立，保留原本的遠景（遠山與河面）。
 */
function Bank({ eraId }) {
  const { geometry, material } = useMemo(() => {
    const built = buildOppositeBank(eraId)
    if (!built) return {}
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(built.position, 3))
    g.setAttribute('tint', new BufferAttribute(built.tint, 3))
    g.setAttribute('light', new BufferAttribute(built.light, 1))
    g.computeBoundingSphere()
    const m = new ShaderMaterial({
      name: 'OppositeBank',
      // 只畫朝碼頭的面，兩面都畫（面的方向不必一一對齊）
      side: DoubleSide,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uColor: { value: new Color() },
        uFog: { value: new Color() },
        uFogAmount: { value: 0.3 },
        uLightColor: { value: new Color() },
        uLightAmount: { value: 0 },
      },
    })
    return { geometry: g, material: m }
  }, [eraId])

  useEffect(
    () => () => {
      geometry?.dispose()
      material?.dispose()
    },
    [geometry, material],
  )

  useFrame(() => {
    if (!material) return
    const a = atmosphere.current
    const u = material.uniforms
    // 比遠山近：用遠山的顏色壓暗一些；距離的霧主要交給空氣遠近感那一趟（airPass），這裡只混一點
    u.uColor.value.copy(a.mountains).multiplyScalar(0.62)
    u.uFog.value.copy(a.fogColor)
    u.uFogAmount.value = 0.06
    u.uLightAmount.value = bankLightAmount(a.glow)
    u.uLightColor.value.set(nightEra(eraId).windowTint).lerp(WARM, 0.5)
  })

  if (!geometry) return null
  return (
    <mesh
      name="opposite-bank"
      userData={{ reflect: true, eraId }}
      geometry={geometry}
      material={material}
      renderOrder={-880}
      onUpdate={(mesh) => mesh.layers.set(LAYERS.NO_OUTLINE)}
    />
  )
}

/** 只在精緻畫質（畫質設定的 oppositeBank）掛載；年代換上新街景時換成新年代的對岸 */
export function OppositeBank({ eraId }) {
  const enabled = useGameStore((state) => Boolean(QUALITY_MODES[state.qualityMode]?.oppositeBank))
  return enabled ? <Bank key={eraId} eraId={eraId} /> : null
}
