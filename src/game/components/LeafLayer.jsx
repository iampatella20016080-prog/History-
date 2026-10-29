import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, ShaderMaterial } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { leafSeeds, motionSettings, MOTION_SETTINGS } from '../motion.js'
import { windUniforms } from '../rendering/wind.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 榕樹下的落葉：葉子從樹冠下緣飄落、翻轉、隨風偏移，落地後停一下再淡出，然後從樹冠重新開始。
 * 整個年代的落葉合成一個網格（一次繪製），位置全部在頂點著色器裡依時間計算；
 * 流暢模式只畫前面幾片（其餘移到畫面外），份量見 motion.js 的 MOTION_SETTINGS。
 */
const MAX_PER_TREE = Math.max(...Object.values(MOTION_SETTINGS).map((s) => s.leavesPerTree))

const VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute vec2 aCorner;
  attribute vec4 aParams; // 相位、旋轉速度、大小、顏色
  attribute vec2 aGround; // 地面高度、這棵樹裡的序號
  uniform float uTime;
  uniform float uCount;
  uniform float uWind;
  uniform vec2 uWindDir;
  varying vec2 vCorner;
  varying float vAlpha;
  varying float vHue;
  varying float vShade;
  void main() {
    float height = max(0.5, aStart.y - aGround.x);
    float fall = max(2.0, height / 1.2);
    float cycle = fall + 2.5;
    float t = fract(uTime / cycle + aParams.x) * cycle;
    float k = min(t / fall, 1.0);
    float landed = step(fall, t);
    float ft = min(t, fall);
    // 左右飄盪（落地後停止）與順著風的偏移
    vec2 sway = vec2(sin(ft * aParams.y + aParams.x * 6.283), cos(ft * aParams.y * 0.8 + aParams.x * 3.1)) * 0.32;
    vec2 drift = uWindDir * uWind * ft * 0.3;
    vec3 center = vec3(aStart.x + sway.x + drift.x, mix(aStart.y, aGround.x + 0.03, k), aStart.z + sway.y + drift.y);
    float size = aParams.z;
    float angle = ft * aParams.y * 1.7;
    vec2 c = aCorner * vec2(size, size * 0.6);
    vec3 offset;
    if (landed > 0.5) {
      // 平躺在地上
      float a = aParams.x * 6.283;
      offset = vec3(c.x * cos(a) - c.y * sin(a), 0.0, c.x * sin(a) + c.y * cos(a));
    } else {
      // 空中翻轉：繞兩個軸旋轉的小葉片
      float ca = cos(angle);
      float sa = sin(angle);
      float cb = cos(angle * 0.63 + aParams.x * 4.0);
      float sb = sin(angle * 0.63 + aParams.x * 4.0);
      offset = vec3(c.x * ca, c.x * sa * cb + c.y * sb, c.y * cb - c.x * sa * sb);
    }
    vec4 mv = modelViewMatrix * vec4(center + offset, 1.0);
    gl_Position = projectionMatrix * mv;
    // 流暢模式：每棵樹只畫前 uCount 片
    if (aGround.y >= uCount) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vCorner = aCorner;
    vHue = aParams.w;
    vShade = 0.8 + 0.2 * sin(angle);
    float fadeIn = smoothstep(0.0, 0.5, t);
    float fadeOut = 1.0 - smoothstep(fall + 1.2, cycle, t);
    vAlpha = fadeIn * fadeOut * (1.0 - smoothstep(35.0, 60.0, -mv.z));
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uGreen;
  uniform vec3 uDry;
  uniform vec3 uLight;
  varying vec2 vCorner;
  varying float vAlpha;
  varying float vHue;
  varying float vShade;
  void main() {
    // 葉形：兩端尖的橢圓
    vec2 p = vCorner;
    float edge = abs(p.y) + p.x * p.x * 0.9;
    if (edge > 0.95 || vAlpha < 0.02) discard;
    vec3 color = mix(uGreen, uDry, smoothstep(0.35, 1.0, vHue)) * uLight * vShade;
    gl_FragColor = vec4(color, vAlpha);
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
  uCount: { value: MAX_PER_TREE },
  uWind: windUniforms.uWind,
  uWindDir: windUniforms.uWindDir,
  uGreen: { value: new Color('#7f8e5e') },
  uDry: { value: new Color('#b89a58') },
  uLight: { value: new Color('#ffffff') },
}
const _light = new Color()

/** 落葉的幾何（純資料，方便測試）：每片葉子 6 個頂點 */
export function leafGeometry(trees) {
  const leaves = leafSeeds(trees, MAX_PER_TREE)
  const n = leaves.length * 6
  const start = new Float32Array(n * 3)
  const corner = new Float32Array(n * 2)
  const params = new Float32Array(n * 4)
  const ground = new Float32Array(n * 2)
  let v = 0
  leaves.forEach((leaf, i) => {
    for (const [cx, cy] of CORNERS) {
      start.set(leaf.start, v * 3)
      corner.set([cx, cy], v * 2)
      params.set([leaf.phase, leaf.spin, leaf.size, leaf.hue], v * 4)
      ground.set([leaf.ground, i % MAX_PER_TREE], v * 2)
      v++
    }
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(start, 3))
  geometry.setAttribute('aStart', new BufferAttribute(start, 3))
  geometry.setAttribute('aCorner', new BufferAttribute(corner, 2))
  geometry.setAttribute('aParams', new BufferAttribute(params, 4))
  geometry.setAttribute('aGround', new BufferAttribute(ground, 2))
  geometry.computeBoundingSphere()
  geometry.boundingSphere.radius += 4
  return geometry
}

export function LeafLayer({ trees }) {
  const layer = useMemo(() => {
    if (!trees?.length) return null
    const geometry = leafGeometry(trees)
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      fog: false,
    })
    return { geometry, material }
  }, [trees])

  useEffect(
    () => () => {
      layer?.geometry.dispose()
      layer?.material.dispose()
    },
    [layer],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uCount.value = motionSettings(useGameStore.getState().qualityMode).leavesPerTree
    // 葉子的亮度跟著天光：半球光＋一部分太陽光（入夜時暗下來、帶一點冷色）
    const a = atmosphere.current
    _light.copy(a.hemiSky).multiplyScalar(a.hemiIntensity * 0.32)
    _light.r += a.sunColor.r * a.sunIntensity * 0.16
    _light.g += a.sunColor.g * a.sunIntensity * 0.16
    _light.b += a.sunColor.b * a.sunIntensity * 0.16
    uniforms.uLight.value.setRGB(Math.min(_light.r, 1.1), Math.min(_light.g, 1.1), Math.min(_light.b, 1.1))
  })

  if (!layer) return null
  return (
    <mesh
      name="falling-leaves"
      geometry={layer.geometry}
      material={layer.material}
      renderOrder={4}
      onUpdate={(mesh) => mesh.layers.set(LAYERS.NO_OUTLINE)}
    />
  )
}
