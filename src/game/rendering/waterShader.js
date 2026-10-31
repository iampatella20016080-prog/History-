import { Color, CustomBlending, DoubleSide, Matrix4, SrcColorFactor, ShaderMaterial, Vector3, ZeroFactor } from 'three'
import { RIPPLE_GLSL } from './rainShader.js'

/**
 * 淡水河的水面與倒影（著色器）
 *
 * 水面：在原本的卡通水面材質上加三件事，全部在片段著色器裡算，不增加繪製呼叫——
 * - 波紋：幾組不同方向、不同速度的正弦波疊加成水面的起伏（精緻模式多一層最細的紋路），
 *   波峰稍亮、波谷稍暗；
 * - 反光：依波紋的法線把太陽反射到鏡頭的地方點出閃爍的亮片（夕陽時在河面上連成一條金色的光帶），
 *   斜看水面時混入天空地平線的顏色（菲涅耳）；
 * - 燈火倒影：入夜的年代（glow 高）靠岸的水面有暖色、隨波紋斷開的光帶。
 * - 雨點（精緻畫質的雨天，uRain > 0；只加在有倒影的那一份著色器）：雨點打在河面上的一圈圈漣漪，扭曲倒影、亮一圈細環。
 *
 * 岸上的倒影（只在精緻畫質，material.userData.planarReflection）：取樣 RiverReflection 畫的平面反射貼圖，
 * 依波紋的斜率扭曲；斜看水面時倒影較清楚（菲涅耳），並帶一點河水的顏色。流暢畫質的著色器原樣不變。
 *
 * 船的倒影：把船的幾何對水面鏡射，深度改成「同一條視線打到水面的深度」，
 * 所以倒影畫在水面上、會被岸邊與船身擋住，卻不會被水面本身遮掉；離水面越遠越淡、越晃。
 */
export const waterUniforms = {
  uTime: { value: 0 },
  uOctaves: { value: 3 },
  uSunDir: { value: new Vector3(0, 1, 0) },
  uSunColor: { value: new Color('#ffffff') },
  uSky: { value: new Color('#ffffff') },
  uGlint: { value: 1 },
  uNight: { value: 0 },
  uWarm: { value: new Color('#ffb066') },
  uEdgeX: { value: 0 },
  // 雨勢（weather.js；精緻畫質的雨天才大於 0）
  uRain: { value: 0 },
}

/** 平面反射（精緻畫質）：倒影貼圖、世界座標 → 貼圖座標的矩陣、強度與河水色調 */
export const waterReflectUniforms = {
  tReflect: { value: null },
  uReflectMatrix: { value: new Matrix4() },
  uReflect: { value: 0.85 },
  uReflectTint: { value: new Color('#ffffff') },
}

const REFLECT_HEAD = /* glsl */ `
  uniform sampler2D tReflect;
  uniform mat4 uReflectMatrix;
  uniform float uReflect;
  uniform vec3 uReflectTint;
`

// 放在菲涅耳混入天色之後、亮片之前（亮片仍然壓在倒影上面）
const REFLECT_APPLY = /* glsl */ `
          {
            vec4 rc = uReflectMatrix * vec4(vWaterPos, 1.0);
            // 波紋扭曲：橫向（沿河岸）晃得多、縱向少，近處晃得比遠處明顯
            vec2 ruv = rc.xy / rc.w + vec2(wGrad.x, wGrad.y * 0.4) * 0.045 / max(1.0, rc.w * 0.03);
            vec3 refl = texture2D(tReflect, clamp(ruv, 0.001, 0.999)).rgb;
            // 卡通風格：倒影的明暗分成幾階（和色階一致的硬邊），帶一點河水的顏色
            float rl = dot(refl, vec3(0.299, 0.587, 0.114));
            float steps = floor(rl * 5.0 + 0.5) / 5.0;
            refl *= mix(1.0, steps / max(rl, 0.001), 0.45);
            refl *= uReflectTint;
            gl_FragColor.rgb = mix(gl_FragColor.rgb, refl, uReflect * mix(0.3, 0.95, smoothstep(0.0, 0.6, fres)));
          }
`

// 雨點的漣漪（只在精緻畫質的水面著色器，也就是有倒影的那一份；晴天 uRain = 0 時整段略過）
const RAIN_HEAD = /* glsl */ `
  uniform float uRain;
`
const RAIN_RIPPLES = /* glsl */ `
        // 近處才算漣漪；遠處的細環小於一個像素
        vec3 wRain = vec3(0.0);
        if (uRain > 0.001) {
          float near = 1.0 - smoothstep(25.0, 60.0, length(vWaterPos.xz - cameraPosition.xz));
          wRain = rainRipples(vWaterPos.xz * 1.6, uTime) * uRain * near;
          wGrad += wRain.xy * 0.06;
        }`
const RAIN_RING = /* glsl */ `
          // 雨點漣漪的細環：天光的顏色
          gl_FragColor.rgb += uSky * clamp(wRain.z, 0.0, 1.0) * 0.1;`

const WAVES = /* glsl */ `
  uniform float uTime;
  uniform float uOctaves;
  // 一組正弦波：方向、波數、速度、振幅；回傳 (高度, d高度/dx, d高度/dz)
  vec3 wave(vec2 p, vec2 dir, float k, float speed, float amp) {
    float phase = dot(dir, p) * k + uTime * speed;
    return vec3(sin(phase), dir * cos(phase) * k) * amp;
  }
  // 水面起伏：低頻的長浪（看得出的明暗）＋高頻的細紋（反光的亮片）
  vec3 waterWaves(vec2 p) {
    vec3 w = wave(p, normalize(vec2(0.8, 0.6)), 1.6, 1.1, 0.02);
    w += wave(p, normalize(vec2(-0.35, 1.0)), 2.9, -1.5, 0.012);
    w += wave(p, normalize(vec2(0.95, -0.3)), 6.1, 2.3, 0.006);
    if (uOctaves > 2.5) w += wave(p, normalize(vec2(0.2, -1.0)), 11.3, -3.1, 0.0035);
    return w;
  }
`

/** 在河面的卡通材質上加入波紋、反光與燈火倒影（材質仍是 MeshToonMaterial，陰影與霧照舊） */
export function patchWaterMaterial(material) {
  material.onBeforeCompile = (shader) => {
    const reflect = Boolean(material.userData.planarReflection)
    Object.assign(shader.uniforms, waterUniforms)
    if (reflect) Object.assign(shader.uniforms, waterReflectUniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWaterPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWaterPos = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWaterPos;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform vec3 uSky;
        uniform float uGlint;
        uniform float uNight;
        uniform vec3 uWarm;
        uniform float uEdgeX;
        ${reflect ? REFLECT_HEAD + RAIN_HEAD : ''}${WAVES}${reflect ? RIPPLE_GLSL : ''}`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec3 wWave = waterWaves(vWaterPos.xz);
        vec2 wGrad = wWave.yz;${reflect ? RAIN_RIPPLES : ''}
        diffuseColor.rgb *= 0.97 + 0.05 * (wWave.x / 0.04);`,
      )
      .replace(
        '#include <opaque_fragment>',
        `#include <opaque_fragment>
        {
          vec3 n = normalize(vec3(-wGrad.x, 1.0, -wGrad.y));
          vec3 v = normalize(cameraPosition - vWaterPos);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uSky, fres * 0.4);${reflect ? REFLECT_APPLY : ''}
          vec3 r = reflect(-v, n);
          // 亮片：只有法線剛好把太陽反射到鏡頭的細紋才亮（卡通風格的硬邊），越遠越密、越細
          float s = pow(max(dot(r, uSunDir), 0.0), 600.0);
          gl_FragColor.rgb += uSunColor * smoothstep(0.3, 0.7, s) * uGlint;
          // 靠岸的燈火倒影：沿著河岸的暖色光帶，被波紋切成一段一段
          float bank = smoothstep(uEdgeX - 9.0, uEdgeX - 0.5, vWaterPos.x);
          float broken = smoothstep(0.7, 0.95, sin(vWaterPos.z * 1.3 + wGrad.x * 25.0) * 0.5 + 0.5);
          float ripple = smoothstep(0.55, 0.95, sin(vWaterPos.x * 7.0 + wGrad.y * 30.0 + uTime * 0.9) * 0.5 + 0.5);
          gl_FragColor.rgb += uWarm * (uNight * bank * broken * ripple * 0.22);${reflect ? RAIN_RING : ''}
        }`,
      )
  }
  material.customProgramCacheKey = () => (material.userData.planarReflection ? 'river-water-reflect' : 'river-water')
  return material
}

const REFLECTION_VERTEX = /* glsl */ `
  attribute vec3 color;
  uniform float uWaterLevel;
  uniform float uTime;
  varying vec3 vColor;
  varying float vHeight;
  varying float vHitX;
  varying float vDistance;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    // 鏡射後在水面下的深度＝原本在水面上的高度
    float h = uWaterLevel - world.y;
    // 離水面越遠的部分晃得越厲害
    float wobble = clamp(h, 0.0, 4.0);
    world.x += sin(world.z * 1.9 + uTime * 1.6) * 0.06 * wobble;
    world.z += sin(world.x * 1.4 + world.y * 3.0 + uTime * 1.2) * 0.05 * wobble;
    vec4 clip = projectionMatrix * viewMatrix * world;
    // 深度用同一條視線與水面的交點：倒影貼在水面上，前方的岸與船身照樣擋得住
    float t = (cameraPosition.y - uWaterLevel) / max(cameraPosition.y - world.y, 0.001);
    vec3 hit = cameraPosition + (world.xyz - cameraPosition) * t;
    vec4 hitClip = projectionMatrix * viewMatrix * vec4(hit, 1.0);
    clip.z = (hitClip.z / hitClip.w - 0.00002) * clip.w;
    gl_Position = clip;
    vColor = color;
    vHeight = h;
    vHitX = hit.x;
    vDistance = length(hit - cameraPosition);
  }
`

const REFLECTION_FRAGMENT = /* glsl */ `
  uniform vec3 uTone;
  uniform float uOpacity;
  uniform float uEdgeX;
  varying vec3 vColor;
  varying float vHeight;
  varying float vHitX;
  varying float vDistance;
  void main() {
    // 原本在水面下的部分（船底）沒有倒影；交點落在岸上的不畫
    if (vHeight < 0.0 || vHitX > uEdgeX) discard;
    // 卡通風格的倒影：把已經打過光的水面壓暗（相乘混色），所以不論白天或入夜，倒影都比水面暗；
    // 船上亮的部分（白帆、白色船身）壓得比較少
    float lum = clamp(dot(vColor * uTone, vec3(0.333)), 0.0, 1.0);
    vec3 shade = mix(vec3(0.42, 0.45, 0.52), vec3(0.9), lum * lum);
    float fade = (1.0 - smoothstep(0.4, 5.5, vHeight)) * (1.0 - smoothstep(60.0, 140.0, vDistance));
    gl_FragColor = vec4(mix(vec3(1.0), shade, uOpacity * fade), 1.0);
  }
`

export const reflectionUniforms = {
  uWaterLevel: { value: 0 },
  uTime: { value: 0 },
  uTone: { value: new Color('#ffffff') },
  uOpacity: { value: 0.7 },
  uEdgeX: { value: 0 },
}

/** 船的倒影材質（所有船共用一份；不寫入深度、不投射陰影、不參與輪廓線） */
export function createReflectionMaterial() {
  return new ShaderMaterial({
    vertexShader: REFLECTION_VERTEX,
    fragmentShader: REFLECTION_FRAGMENT,
    uniforms: reflectionUniforms,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    // 相乘混色：畫面顏色 × 倒影顏色
    blending: CustomBlending,
    blendSrc: ZeroFactor,
    blendDst: SrcColorFactor,
  })
}
