import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, NormalBlending, ShaderMaterial } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { QUALITY_MODES } from '../quality.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 蒸氣與香煙：從蒸籠、湯鍋、香爐裊裊上升、逐漸散開的柔和煙團（全部在著色器中運算）。
 */
const PUFFS = 6

const VERTEX = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aCorner;
  attribute vec2 aParams;
  attribute float aPuff;
  uniform float uTime;
  uniform float uPuffs;
  varying vec2 vCorner;
  varying float vAlpha;
  void main() {
    float strength = aParams.x;
    float life = fract(uTime * 0.23 + aParams.y);
    vec3 drift = vec3(sin(life * 3.0 + aParams.y * 9.0) * 0.22, life * 1.7, cos(life * 2.3 + aParams.y * 5.0) * 0.16) * life;
    vec4 mv = modelViewMatrix * vec4(aCenter + drift * vec3(1.0, strength, 1.0), 1.0);
    float size = (0.16 + life * 0.62) * (0.6 + strength * 0.4);
    mv.xy += aCorner * size;
    gl_Position = projectionMatrix * mv;
    // 流暢模式只畫一半的煙團（隔一個略過，移到畫面外）
    if (uPuffs < 5.5 && mod(aPuff, 2.0) > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vCorner = aCorner;
    vAlpha = sin(life * 3.14159) * 0.3 * min(strength, 1.0) * (1.0 - smoothstep(30.0, 70.0, -mv.z));
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vCorner;
  varying float vAlpha;
  void main() {
    float r = length(vCorner);
    float a = smoothstep(1.0, 0.15, r) * vAlpha;
    gl_FragColor = vec4(uColor, a);
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

const uniforms = { uTime: { value: 0 }, uColor: { value: new Color('#f7f2e8') }, uPuffs: { value: PUFFS } }
const _white = new Color('#fbf7ef')

export function SteamLayer({ steam }) {
  const layer = useMemo(() => {
    const n = steam.length * PUFFS * 6
    const center = new Float32Array(n * 3)
    const corner = new Float32Array(n * 2)
    const params = new Float32Array(n * 2)
    const puff = new Float32Array(n)
    let v = 0
    steam.forEach((source, i) => {
      for (let p = 0; p < PUFFS; p++) {
        const phase = p / PUFFS + i * 0.137
        for (const [cx, cy] of CORNERS) {
          center.set(source.position, v * 3)
          corner.set([cx, cy], v * 2)
          params.set([source.strength ?? 1, phase], v * 2)
          puff[v] = p
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
    uniforms.uPuffs.value = QUALITY_MODES[useGameStore.getState().qualityMode]?.detail === false ? PUFFS / 2 : PUFFS
    // 蒸氣顏色帶一點環境光色調（入夜時偏藍灰）
    uniforms.uColor.value.copy(_white).lerp(atmosphere.current.fogColor, 0.35)
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
