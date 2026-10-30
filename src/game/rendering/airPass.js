import { Color, LinearFilter, Matrix4, ShaderMaterial, Vector2, Vector3, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { RIVER } from '../config.js'
import { RAY_RESOLUTION, RAY_SAMPLES, airPassPlan, lineFade, rayStrength } from '../aerial.js'

/**
 * 空氣遠近感與光束（只在精緻畫質建立；流暢畫質不建立這兩個材質，著色器也不會編譯）
 *
 * 接在 ToonRenderer 的輪廓 pass 之後、光暈與輸出之前，兩趟全螢幕繪製：
 * 1. 光束（四分之一解析度）：從每個像素往太陽在畫面上的位置取樣深度，
 *    看得到天空（深度緩衝沒有寫入）的地方算「有光」，被屋簷、騎樓、樹擋住的就沒有；累積後就是斜陽的光束。
 * 2. 空氣（全解析度）：用深度還原世界座標，依距離與高度加上指數霧（公式同 aerial.js），
 *    遠景往天空色退、飽和降低；描邊已經畫在色彩上，所以遠處的黑線也一起淡出。
 *    河面上方另外加一層貼著水面的薄霧，最後把光束疊上去。
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const RAYS_FRAGMENT = /* glsl */ `
  uniform sampler2D tDepth;
  uniform vec2 uSun;
  uniform float uAspect;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // 看得到天空的地方才有光，離太陽越近越亮
  float light(vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    float sky = step(0.999995, texture2D(tDepth, uv).x);
    vec2 q = (uv - uSun) * vec2(uAspect, 1.0);
    return sky * (0.03 + exp(-dot(q, q) * 14.0));
  }

  void main() {
    vec2 delta = (uSun - vUv) * (0.92 / float(RAY_SAMPLES));
    vec2 uv = vUv + delta * hash12(gl_FragCoord.xy);
    float weight = 1.0;
    float sum = 0.0;
    for (int i = 0; i < RAY_SAMPLES; i++) {
      sum += light(uv) * weight;
      weight *= 0.965;
      uv += delta;
    }
    gl_FragColor = vec4(vec3(sum / float(RAY_SAMPLES)), 1.0);
  }
`

const AIR_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  uniform sampler2D tDepth;
  uniform sampler2D tRays;
  uniform float uNear;
  uniform float uFar;
  uniform vec2 uTanHalf;
  uniform mat4 uCameraWorld;
  uniform vec3 uCameraPos;
  uniform float uDensity;
  uniform float uStart;
  uniform float uFalloff;
  uniform float uMax;
  uniform float uDesaturate;
  uniform vec3 uAirColor;
  uniform vec3 uSunGlow;
  uniform vec3 uSunDir;
  uniform float uSunScatter;
  uniform float uRiverMist;
  uniform float uRiverEdge;
  uniform float uWaterLevel;
  uniform float uRays;
  uniform vec3 uRayColor;
  varying vec2 vUv;

  void main() {
    vec3 color = texture2D(tInput, vUv).rgb;
    float d = texture2D(tDepth, vUv).x;
    if (d < 0.999995) {
      float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
      vec3 viewPos = vec3((vUv * 2.0 - 1.0) * uTanHalf * z, -z);
      vec3 world = (uCameraWorld * vec4(viewPos, 1.0)).xyz;
      float dist = length(viewPos);
      vec3 dir = (world - uCameraPos) / dist;

      // 指數高度霧沿視線的積分（aerial.js 的 opticalDepth）
      float k = uFalloff;
      float dy = world.y - uCameraPos.y;
      float base = exp(-k * max(uCameraPos.y, 0.0));
      float height = abs(k * dy) < 1e-4 ? base : (base - exp(-k * max(world.y, 0.0))) / (k * dy);
      float fog = min(uMax, 1.0 - exp(-uDensity * max(dist - uStart, 0.0) * height));

      // 朝太陽的方向，空氣帶一點太陽光暈的顏色
      float toSun = pow(max(dot(dir, uSunDir), 0.0), 6.0) * uSunScatter;
      vec3 air = mix(uAirColor, uSunGlow, toSun);
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(color, vec3(luma), fog * uDesaturate);
      color = mix(color, air, fog);

      // 河面上方貼著水面的薄霧
      if (uRiverMist > 0.001) {
        float overWater = smoothstep(uRiverEdge - 2.0, uRiverEdge - 26.0, world.x);
        float low = exp(-max(world.y - uWaterLevel, 0.0) / 1.6);
        float mist = uRiverMist * overWater * low * (1.0 - exp(-dist / 80.0));
        color = mix(color, air * 1.04, clamp(mist, 0.0, 0.4));
      }
    }
    if (uRays > 0.001) color += uRayColor * texture2D(tRays, vUv).r * uRays;
    gl_FragColor = vec4(color, 1.0);
  }
`

function makeTarget(colorType) {
  const target = new WebGLRenderTarget(1, 1, { type: colorType, depthBuffer: false })
  target.texture.minFilter = LinearFilter
  target.texture.magFilter = LinearFilter
  target.texture.generateMipmaps = false
  return target
}

/**
 * 建立空氣與光束 pass。quality 沒有開 air（流暢畫質）時回傳 null，什麼都不配置。
 * inputTexture：輪廓 pass 的輸出；depthTexture：法線 pass 的深度。
 */
export function createAirPass(quality, { colorType, inputTexture, depthTexture }) {
  const plan = airPassPlan(quality)
  if (!plan.aerial) return null

  const target = makeTarget(colorType)
  const raysTarget = makeTarget(colorType)

  const raysMaterial = new ShaderMaterial({
    name: 'GodRays',
    vertexShader: VERTEX,
    fragmentShader: RAYS_FRAGMENT,
    defines: { RAY_SAMPLES },
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tDepth: { value: depthTexture },
      uSun: { value: new Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
    },
  })

  const airMaterial = new ShaderMaterial({
    name: 'AerialPerspective',
    vertexShader: VERTEX,
    fragmentShader: AIR_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tInput: { value: inputTexture },
      tDepth: { value: depthTexture },
      tRays: { value: raysTarget.texture },
      uNear: { value: 0.3 },
      uFar: { value: 900 },
      uTanHalf: { value: new Vector2(1, 1) },
      uCameraWorld: { value: new Matrix4() },
      uCameraPos: { value: new Vector3() },
      uDensity: { value: 0 },
      uStart: { value: 0 },
      uFalloff: { value: 0.05 },
      uMax: { value: 0 },
      uDesaturate: { value: 0 },
      uAirColor: { value: new Color() },
      uSunGlow: { value: new Color() },
      uSunDir: { value: new Vector3(0, 1, 0) },
      uSunScatter: { value: 0 },
      uRiverMist: { value: 0 },
      uRiverEdge: { value: RIVER.edgeX },
      uWaterLevel: { value: RIVER.waterLevel },
      uRays: { value: 0 },
      uRayColor: { value: new Color() },
    },
  })

  const raysQuad = new FullScreenQuad(raysMaterial)
  const airQuad = new FullScreenQuad(airMaterial)
  const width = new Vector2()
  const sun = new Vector3()
  const forward = new Vector3()
  const air = {}
  let rays = 0

  function resize(w, h) {
    width.set(w, h)
    target.setSize(w, h)
    raysTarget.setSize(Math.max(1, Math.floor(w * RAY_RESOLUTION)), Math.max(1, Math.floor(h * RAY_RESOLUTION)))
    raysMaterial.uniforms.uAspect.value = w / Math.max(1, h)
  }

  /** 每影格的參數；回傳精緻畫質用的描邊淡出距離 */
  function update(camera, a) {
    for (const key of ['density', 'start', 'heightFalloff', 'max', 'desaturate', 'horizon', 'sunScatter', 'rays']) air[key] = a[`air_${key}`]
    camera.updateMatrixWorld() // 本影格的鏡頭（gl.render 之前），還原世界座標才不會慢一格
    const u = airMaterial.uniforms
    u.uNear.value = camera.near
    u.uFar.value = camera.far
    const tanY = Math.tan((camera.fov * Math.PI) / 360)
    u.uTanHalf.value.set(tanY * camera.aspect, tanY)
    u.uCameraWorld.value.copy(camera.matrixWorld)
    u.uCameraPos.value.setFromMatrixPosition(camera.matrixWorld)
    u.uDensity.value = air.density
    u.uStart.value = air.start
    u.uFalloff.value = Math.max(1e-3, air.heightFalloff)
    u.uMax.value = air.max
    u.uDesaturate.value = air.desaturate
    u.uAirColor.value.copy(a.fogColor).lerp(a.skyHorizon, air.horizon)
    u.uSunGlow.value.copy(a.sunGlow)
    u.uSunDir.value.copy(a.sunDirection)
    u.uSunScatter.value = air.sunScatter
    u.uRiverMist.value = a.riverMist * 0.6

    // 太陽在畫面上的位置；在鏡頭後方或離畫面太遠時光束淡出
    camera.getWorldDirection(forward)
    const facing = forward.dot(a.sunDirection)
    sun.copy(a.sunDirection).multiplyScalar(500).add(u.uCameraPos.value).project(camera)
    rays = rayStrength(air, a.elevation, facing, [sun.x, sun.y])
    raysMaterial.uniforms.uSun.value.set(sun.x * 0.5 + 0.5, sun.y * 0.5 + 0.5)
    u.uRays.value = rays
    u.uRayColor.value.copy(a.sunGlow).lerp(a.sunColor, 0.5).multiplyScalar(1.5)
    return lineFade(air)
  }

  function render(gl) {
    if (rays > 0.001) {
      gl.setRenderTarget(raysTarget)
      raysQuad.render(gl)
    }
    gl.setRenderTarget(target)
    airQuad.render(gl)
  }

  function dispose() {
    target.dispose()
    raysTarget.dispose()
    raysMaterial.dispose()
    airMaterial.dispose()
    raysQuad.dispose()
    airQuad.dispose()
  }

  return { texture: target.texture, resize, update, render, dispose, get rays() { return rays }, size: width }
}
