import { Color, LinearFilter, Matrix4, ShaderMaterial, Vector2, Vector3, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { COVER_GLSL, RIPPLE_GLSL, coverUniforms, rainRuntime } from './rainShader.js'

/**
 * 濕地面與積水倒影的全螢幕處理（只在精緻畫質建立，而且要下過雨、地面濕了才編譯與繪製）。
 *
 * 放在卡通渲染管線的色彩趟之後、燈光落點與輪廓趟之前：用法線＋深度趟還原每個像素的世界座標與法線，
 * - 頭上沒有遮蔽（遮雨高度圖）的地方變濕：朝上的石板、地磚、路面變暗、飽和略升，牆面也暗一點；
 *   騎樓下、店裡的地板是乾的。
 * - 朝上、貼地的表面依世界座標的雜訊（加上亭仔腳邊的排水溝一帶）長出積水：取樣積水倒影
 *   （Rain 元件以 planarReflection.js 對地面鏡射畫的低解析度倒影），倒映燈火、招牌、窗與天色；
 *   積水外的濕石板只反射亮的燈火。雨點打出一圈一圈的漣漪，扭曲倒影。
 * - 雨停後 wet 先退（地面漸乾），puddle 最後才退（積水慢慢縮小）。
 * 燈光落點與描邊照常疊在上面。
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D tColor;
  uniform sampler2D tNormal;
  uniform sampler2D tDepth;
  uniform sampler2D tPuddle;
  uniform float uPuddleReady;
  uniform mat4 uPuddleMatrix;
  uniform float uPuddleY;
  uniform mat4 uCamMatrix;
  uniform vec3 uCamPos;
  uniform float uNear;
  uniform float uFar;
  uniform vec2 uProj;
  uniform float uWet;
  uniform float uPuddle;
  uniform float uRain;
  uniform float uTime;
  uniform vec3 uTint;
  varying vec2 vUv;
  ${COVER_GLSL}
  ${RIPPLE_GLSL}

  float pHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float pNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(pHash(i), pHash(i + vec2(1.0, 0.0)), u.x), mix(pHash(i + vec2(0.0, 1.0)), pHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec3 color = texture2D(tColor, vUv).rgb;
    float d = texture2D(tDepth, vUv).x;
    if (d >= 0.99999) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }
    float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 pv = vec3(ndc.x * z / uProj.x, ndc.y * z / uProj.y, -z);
    vec3 pw = (uCamMatrix * vec4(pv, 1.0)).xyz;
    vec3 nw = normalize(mat3(uCamMatrix) * normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0));
    // 頭上有遮蔽（騎樓、屋簷、店裡、樹冠）的地方不濕；水面（河）由水面著色器自己處理
    float cover = coverHeight(pw.xz);
    float exposed = 1.0 - smoothstep(0.25, 0.7, cover - pw.y);
    exposed *= step(uWaterY + 0.08, pw.y) * (1.0 - smoothstep(70.0, 120.0, z));
    float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    // 燈籠、亮窗、燈箱等本身發光的東西不變暗
    float lit = smoothstep(0.62, 1.05, lum);
    if (exposed < 0.002) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }
    float up = smoothstep(0.72, 0.93, nw.y);
    float wet = uWet * exposed * (1.0 - lit);
    vec3 wetColor = max(mix(vec3(lum), color, 1.15), 0.0) * mix(0.86, 0.6, up);
    color = mix(color, wetColor, wet);

    if (up > 0.01 && pw.y < 0.7) {
      // 積水：大片的低窪（低頻雜訊）＋亭仔腳邊的排水溝一帶；雨停後慢慢縮小
      float n = pNoise(pw.xz * 0.21) * 0.68 + pNoise(pw.xz * 0.83 + 7.3) * 0.32;
      float gutter = (1.0 - smoothstep(0.05, 0.55, abs(abs(pw.z) - 2.62))) * step(-34.0, pw.x) * step(pw.x, 36.0) * 0.22;
      float th = mix(1.08, 0.56, uPuddle);
      float mask = smoothstep(th, th + 0.05, n + gutter) * up * exposed * step(0.001, uPuddle);
      vec3 rip = rainRipples(pw.xz * 2.2, uTime) * uRain;
      vec3 v = normalize(uCamPos - pw);
      float fres = pow(1.0 - max(v.y, 0.0), 3.0);
      vec3 refl = vec3(0.0);
      if (uPuddleReady > 0.5) {
        vec4 rc = uPuddleMatrix * vec4(pw.x, uPuddleY, pw.z, 1.0);
        vec2 ruv = rc.xy / rc.w + rip.xy * 0.018 * (0.3 + mask);
        refl = texture2D(tPuddle, clamp(ruv, 0.001, 0.999)).rgb;
        // 卡通風格：倒影的明暗分成幾階，帶一點地面與天光的顏色
        float rl = dot(refl, vec3(0.299, 0.587, 0.114));
        refl *= mix(1.0, (floor(rl * 5.0 + 0.5) / 5.0) / max(rl, 0.001), 0.4) * uTint;
      }
      float puddle = mask * mix(0.5, 0.9, fres);
      color = mix(color, refl * 0.92 + color * 0.08, puddle);
      // 積水外的濕石板：只反射亮的燈火與天光的一點點
      float sheen = uWet * up * exposed * (1.0 - mask) * mix(0.25, 0.7, fres);
      color += max(refl - 0.32, 0.0) * sheen * 0.9;
      // 漣漪的亮環
      color += vec3(0.55, 0.6, 0.62) * clamp(rip.z, 0.0, 1.0) * 0.12 * mask;
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

const WHITE = new Color('#ffffff')

export function createWetPass(colorType) {
  const target = new WebGLRenderTarget(1, 1, { type: colorType, depthBuffer: false })
  target.texture.minFilter = LinearFilter
  target.texture.generateMipmaps = false
  const material = new ShaderMaterial({
    name: 'WetGround',
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      ...coverUniforms(),
      tColor: { value: null },
      tNormal: { value: null },
      tDepth: { value: null },
      tPuddle: { value: null },
      uPuddleReady: { value: 0 },
      uPuddleMatrix: { value: new Matrix4() },
      uPuddleY: { value: 0 },
      uCamMatrix: { value: new Matrix4() },
      uCamPos: { value: new Vector3() },
      uNear: { value: 0.3 },
      uFar: { value: 900 },
      uProj: { value: new Vector2(1, 1) },
      uWet: { value: 0 },
      uPuddle: { value: 0 },
      uRain: { value: 0 },
      uTime: { value: 0 },
      uTint: { value: new Color('#ffffff') },
    },
  })
  const quad = new FullScreenQuad(material)
  const start = performance.now()

  /**
   * 這個影格要不要做這一趟：地面有濕、遮雨高度圖已經畫好才做（晴天、剛切到精緻畫質時整趟略過，也不編譯）。
   * weather：weather.js 的 weatherState；water：河水的顏色（倒影帶一點地面的顏色）
   */
  function update(camera, weather, water) {
    if (!(weather.wet > 0.001 || weather.puddle > 0.001) || !rainRuntime.coverReady) return false
    const u = material.uniforms
    camera.updateMatrixWorld()
    u.uCamMatrix.value.copy(camera.matrixWorld)
    u.uCamPos.value.setFromMatrixPosition(camera.matrixWorld)
    u.uNear.value = camera.near
    u.uFar.value = camera.far
    u.uProj.value.set(camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[5])
    u.uWet.value = weather.wet
    u.uPuddle.value = weather.puddle
    u.uRain.value = weather.rain
    u.uTime.value = (performance.now() - start) / 1000
    u.tCover.value = rainRuntime.cover
    u.tPuddle.value = rainRuntime.puddle
    u.uPuddleReady.value = rainRuntime.puddleReady && rainRuntime.puddle ? 1 : 0
    u.uPuddleMatrix.value.copy(rainRuntime.puddleMatrix)
    u.uPuddleY.value = rainRuntime.puddleY
    if (water) u.uTint.value.copy(water).lerp(WHITE, 0.7)
    return true
  }

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
