import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, NormalBlending, ShaderMaterial } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { QUALITY_MODES } from '../quality.js'
import { motionSettings } from '../motion.js'
import { windUniforms } from '../rendering/wind.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 蒸氣與煙：從蒸籠、湯鍋裊裊上升的白色蒸氣，以及香爐、煤球爐的灰色煙（kind: 'smoke'）——
 * 煙升得較高、散得較開、壽命較長，會被風吹斜（風是整條街共用的，見 rendering/wind.js）。
 * 全部在著色器中運算，蒸氣與煙在同一個網格（一次繪製）。
 */
const PUFFS = 6

const VERTEX = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aCorner;
  attribute vec2 aParams;
  attribute float aPuff;
  attribute float aKind;
  uniform float uTime;
  uniform float uPuffs;
  uniform float uSmokePuffs;
  uniform float uWind;
  uniform vec2 uWindDir;
  varying vec2 vCorner;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float strength = aParams.x;
    float smoke = aKind;
    float life = fract(uTime * mix(0.23, 0.12, smoke) + aParams.y);
    vec3 drift = vec3(sin(life * 3.0 + aParams.y * 9.0) * 0.22, life * mix(1.7, 3.4, smoke), cos(life * 2.3 + aParams.y * 5.0) * 0.16) * life;
    // 風把煙吹斜（越高越斜）；蒸氣只受一點影響
    drift.xz += uWindDir * uWind * life * life * mix(0.35, 1.6, smoke);
    vec4 mv = modelViewMatrix * vec4(aCenter + drift * vec3(1.0, strength, 1.0), 1.0);
    float size = (0.16 + life * mix(0.62, 1.1, smoke)) * (0.6 + strength * 0.4);
    mv.xy += aCorner * size;
    gl_Position = projectionMatrix * mv;
    // 流暢模式減量：蒸氣隔一個略過；煙只畫前 uSmokePuffs 團（移到畫面外）
    if (smoke < 0.5 && uPuffs < 5.5 && mod(aPuff, 2.0) > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    if (smoke > 0.5 && aPuff >= uSmokePuffs) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vCorner = aCorner;
    vKind = smoke;
    vAlpha = sin(life * 3.14159) * mix(0.3, 0.22, smoke) * min(strength, 1.0) * (1.0 - smoothstep(30.0, 70.0, -mv.z));
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSmokeColor;
  varying vec2 vCorner;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float r = length(vCorner);
    float a = smoothstep(1.0, 0.15, r) * vAlpha;
    gl_FragColor = vec4(mix(uColor, uSmokeColor, vKind), a);
  }
`

const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, -1],
  [1, 1],
  [-1, 1],
]

const uniforms = {
  uTime: { value: 0 },
  uColor: { value: new Color('#f7f2e8') },
  uSmokeColor: { value: new Color('#9a968f') },
  uPuffs: { value: PUFFS },
  uSmokePuffs: { value: PUFFS },
  uWind: windUniforms.uWind,
  uWindDir: windUniforms.uWindDir,
}
const _white = new Color('#fbf7ef')
const _smoke = new Color('#a29c94')

export function SteamLayer({ steam }) {
  const layer = useMemo(() => {
    const n = steam.length * PUFFS * 6
    const center = new Float32Array(n * 3)
    const corner = new Float32Array(n * 2)
    const params = new Float32Array(n * 2)
    const puff = new Float32Array(n)
    const kind = new Float32Array(n)
    let v = 0
    steam.forEach((source, i) => {
      for (let p = 0; p < PUFFS; p++) {
        const phase = p / PUFFS + i * 0.137
        for (const [cx, cy] of CORNERS) {
          center.set(source.position, v * 3)
          corner.set([cx, cy], v * 2)
          params.set([source.strength ?? 1, phase], v * 2)
          puff[v] = p
          kind[v] = source.kind === 'smoke' ? 1 : 0
          v++
        }
      }
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(center, 3))
    geometry.setAttribute('aCenter', new BufferAttribute(center, 3))
    geometry.setAttribute('aCorner', new BufferAttribute(corner, 2))
    geometry.setAttribute('aParams', new BufferAttribute(params, 2))
    geometry.setAttribute('aPuff', new BufferAttribute(puff, 1))
    geometry.setAttribute('aKind', new BufferAttribute(kind, 1))
    geometry.computeBoundingSphere()
    geometry.boundingSphere.radius += 3
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      fog: false,
    })
    return { geometry, material }
  }, [steam])

  useEffect(
    () => () => {
      layer.geometry.dispose()
      layer.material.dispose()
    },
    [layer],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    const qualityMode = useGameStore.getState().qualityMode
    uniforms.uPuffs.value = QUALITY_MODES[qualityMode]?.detail === false ? PUFFS / 2 : PUFFS
    uniforms.uSmokePuffs.value = Math.min(PUFFS, motionSettings(qualityMode).smokePuffs)
    // 蒸氣顏色帶一點環境光色調（入夜時偏藍灰）；煙更灰、更融入環境
    uniforms.uColor.value.copy(_white).lerp(atmosphere.current.fogColor, 0.35)
    uniforms.uSmokeColor.value.copy(_smoke).lerp(atmosphere.current.fogColor, 0.5)
  })

  if (!steam.length) return null
  return (
    <mesh
      geometry={layer.geometry}
      material={layer.material}
      renderOrder={3}
      onUpdate={(mesh) => mesh.layers.set(LAYERS.NO_OUTLINE)}
    />
  )
}
