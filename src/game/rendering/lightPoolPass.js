import { LinearFilter, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import {
  MAX_POOL_LIGHTS,
  POOL_BANDS,
  POOL_GAIN,
  buildPoolLights,
  poolFocus,
  selectPoolLights,
} from '../lightPools.js'

/**
 * 燈光落點的全螢幕處理（只在精緻畫質建立；純邏輯見 game/lightPools.js）。
 *
 * 放在卡通渲染管線的色彩趟與輪廓趟之間：讀色彩趟的結果，用法線＋深度趟的深度還原像素在鏡頭空間的位置、
 * 用同一趟的法線算受光面，對鏡頭附近的 N 盞燈加總暖色光斑，再交給輪廓趟（描邊與環境遮蔽照常疊在上面）。
 * 光斑以「乘上去」的方式提亮（color × (1 + 光)）：亮的是表面原本的顏色，深色的木作不會被洗成一片橘色。
 *
 * 白天的年代強度為 0 時整趟略過（不多一次繪製）。
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  #define MAX_LIGHTS ${MAX_POOL_LIGHTS}
  #define BANDS ${POOL_BANDS.toFixed(1)}
  uniform sampler2D tColor;
  uniform sampler2D tNormal;
  uniform sampler2D tDepth;
  uniform float uNear;
  uniform float uFar;
  uniform vec2 uProj;      // 投影矩陣的 [0][0]、[1][1]
  uniform int uCount;
  uniform vec4 uLightPos[MAX_LIGHTS];    // 鏡頭空間位置、半徑
  uniform vec3 uLightColor[MAX_LIGHTS];  // 線性色彩 × 權重 × 年代強度 × 增益
  varying vec2 vUv;

  // 與 lightPools.js 的 poolBand 相同
  float poolBand(float v) {
    float f = max(v, 0.0) * BANDS;
    float s = floor(f);
    return min(1.0, (s + smoothstep(0.35, 0.65, f - s)) / BANDS);
  }

  void main() {
    vec3 color = texture2D(tColor, vUv).rgb;
    float d = texture2D(tDepth, vUv).x;
    // 天空與很遠的地方不算
    if (d >= 0.99999) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }
    float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 p = vec3(ndc.x * z / uProj.x, ndc.y * z / uProj.y, -z);
    vec3 n = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
    vec3 light = vec3(0.0);
    for (int i = 0; i < MAX_LIGHTS; i++) {
      if (i >= uCount) break;
      vec4 lp = uLightPos[i];
      vec3 l = lp.xyz - p;
      float dist = length(l);
      if (dist >= lp.w) continue;
      // 與 lightPools.js 的 poolFalloff 相同
      float x = dist / lp.w;
      float k = 1.0 - x * x;
      // 受光面（Lambert）：斜斜照到的遠處地面很快變暗，光斑集中在燈下與燈背後的牆面
      float ndl = max(dot(n, l / max(dist, 1e-3)), 0.0);
      light += uLightColor[i] * poolBand(k * k * ndl);
    }
    // 遠處淡出（和輪廓線一樣，遠景不需要細節）
    light *= 1.0 - smoothstep(70.0, 110.0, z);
    // 已經很亮的表面（亮窗、燈籠本身、店裡的燈箱）不再提亮，避免過曝
    light *= 1.0 - smoothstep(0.55, 1.1, dot(color, vec3(0.2126, 0.7152, 0.0722)));
    gl_FragColor = vec4(color * (1.0 + light), 1.0);
  }
`

const _view = new Vector3()
const _forward = new Vector3()

export function createLightPoolPass(colorType) {
  const target = new WebGLRenderTarget(1, 1, { type: colorType, depthBuffer: false })
  target.texture.minFilter = LinearFilter
  target.texture.generateMipmaps = false

  const material = new ShaderMaterial({
    name: 'LightPools',
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tColor: { value: null },
      tNormal: { value: null },
      tDepth: { value: null },
      uNear: { value: 0.3 },
      uFar: { value: 900 },
      uProj: { value: new Vector2(1, 1) },
      uCount: { value: 0 },
      uLightPos: { value: Array.from({ length: MAX_POOL_LIGHTS }, () => new Vector4()) },
      uLightColor: { value: Array.from({ length: MAX_POOL_LIGHTS }, () => new Vector3()) },
    },
  })
  const quad = new FullScreenQuad(material)
  // 光源清單依街景的 glows 陣列快取（年代切換時換一份）
  const cache = new WeakMap()
  const lightsFor = (glows) => {
    if (!cache.has(glows)) cache.set(glows, buildPoolLights(glows))
    return cache.get(glows)
  }

  /**
   * 更新這個影格的燈；回傳是否需要做這一趟（強度 0 或附近沒有燈就不做）。
   * strength：年代強度（lightPoolStrength）
   */
  function update(camera, glows, strength) {
    const u = material.uniforms
    u.uCount.value = 0
    if (!glows?.length || strength <= 0.001) return false
    const lights = lightsFor(glows)
    // 鏡頭這個影格可能剛移動過（gl.render 才會更新矩陣），先更新，光斑才不會落後一個影格
    camera.updateMatrixWorld()
    camera.getWorldDirection(_forward)
    const p = camera.position
    const picked = selectPoolLights(lights, poolFocus([p.x, p.y, p.z], [_forward.x, _forward.y, _forward.z]))
    let count = 0
    for (const { index, weight } of picked) {
      if (weight <= 0.001) continue
      const light = lights[index]
      _view.fromArray(light.position).applyMatrix4(camera.matrixWorldInverse)
      u.uLightPos.value[count].set(_view.x, _view.y, _view.z, light.radius)
      const s = weight * strength * POOL_GAIN
      u.uLightColor.value[count].set(light.color[0] * s, light.color[1] * s, light.color[2] * s)
      count++
    }
    u.uCount.value = count
    u.uNear.value = camera.near
    u.uFar.value = camera.far
    u.uProj.value.set(camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[5])
    return count > 0
  }

  /** 把 colorTexture 加上光斑畫到自己的目標，回傳結果貼圖（輪廓趟改讀這張） */
  function render(gl, colorTexture, normalTexture, depthTexture, width, height) {
    if (target.width !== width || target.height !== height) target.setSize(width, height)
    const u = material.uniforms
    u.tColor.value = colorTexture
    u.tNormal.value = normalTexture
    u.tDepth.value = depthTexture
    gl.setRenderTarget(target)
    quad.render(gl)
    return target.texture
  }

  function dispose() {
    target.dispose()
    material.dispose()
    quad.dispose()
  }

  return { update, render, dispose, material }
}
