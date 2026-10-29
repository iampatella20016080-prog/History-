import { Color, CustomBlending, DoubleSide, SrcColorFactor, ShaderMaterial, Vector3, ZeroFactor } from 'three'

/**
 * 淡水河的水面與倒影（著色器）
 *
 * 水面：在原本的卡通水面材質上加三件事，全部在片段著色器裡算，不增加繪製呼叫——
 * - 波紋：幾組不同方向、不同速度的正弦波疊加成水面的起伏（精緻模式多一層最細的紋路），
 *   波峰稍亮、波谷稍暗；
 * - 反光：依波紋的法線把太陽反射到鏡頭的地方點出閃爍的亮片（夕陽時在河面上連成一條金色的光帶），
 *   斜看水面時混入天空地平線的顏色（菲涅耳）；
 * - 燈火倒影：入夜的年代（glow 高）靠岸的水面有暖色、隨波紋斷開的光帶。
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
}

const WAVES = /* glsl */ `
  uniform float uTime;
  uniform float uOctaves;
  // 一組正弦波：方向、波數、速度、振幅；回傳 (高度, d高度/dx, d高度/dz)。
  // footprint：一個像素在水面上涵蓋的長度。波長小於兩三個像素的波會疊成橫條紋（摩爾紋），依波數淡出
  vec3 wave(vec2 p, vec2 dir, float k, float speed, float amp, float footprint) {
    float phase = dot(dir, p) * k + uTime * speed;
    float lod = 1.0 - smoothstep(0.35, 0.9, k * footprint);
    return vec3(sin(phase), dir * cos(phase) * k) * amp * lod;
  }
  // 水面起伏：低頻的長浪（看得出的明暗）＋高頻的細紋（反光的亮片）
  vec3 waterWaves(vec2 p, float footprint) {
    vec3 w = wave(p, normalize(vec2(0.8, 0.6)), 1.6, 1.1, 0.02, footprint);
    w += wave(p, normalize(vec2(-0.35, 1.0)), 2.9, -1.5, 0.012, footprint);
    w += wave(p, normalize(vec2(0.95, -0.3)), 6.1, 2.3, 0.006, footprint);
    if (uOctaves > 2.5) w += wave(p, normalize(vec2(0.2, -1.0)), 11.3, -3.1, 0.0035, footprint);
    return w;
  }
`

/** 在河面的卡通材質上加入波紋、反光與燈火倒影（材質仍是 MeshToonMaterial，陰影與霧照舊） */
export function patchWaterMaterial(material) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, waterUniforms)
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
        ${WAVES}`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        // 遠處一個像素涵蓋好幾公尺的水面：用螢幕空間導數估計，淡出太細的波（避免摩爾紋與亮片閃爍）
        vec2 wFw = fwidth(vWaterPos.xz);
        float wFootprint = max(wFw.x, wFw.y);
        vec3 wWave = waterWaves(vWaterPos.xz, wFootprint);
        vec2 wGrad = wWave.yz;
        diffuseColor.rgb *= 0.97 + 0.05 * (wWave.x / 0.04);`,
      )
      .replace(
        '#include <opaque_fragment>',
        `#include <opaque_fragment>
        {
          vec3 n = normalize(vec3(-wGrad.x, 1.0, -wGrad.y));
          vec3 v = normalize(cameraPosition - vWaterPos);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uSky, fres * 0.4);
          vec3 r = reflect(-v, n);
          // 亮片：只有法線剛好把太陽反射到鏡頭的細紋才亮（卡通風格的硬邊），越遠越密、越細
          float s = pow(max(dot(r, uSunDir), 0.0), 600.0);
          // 遠處的亮片融成柔和的光帶（不再是一個個硬邊亮點，避免閃爍）
          float far = smoothstep(0.08, 0.6, wFootprint);
          float sparkle = mix(smoothstep(0.3, 0.7, s), pow(max(dot(r, uSunDir), 0.0), 40.0) * 1.1, far);
          gl_FragColor.rgb += uSunColor * sparkle * uGlint;
          // 靠岸的燈火倒影：沿著河岸的暖色光帶，被波紋切成一段一段
          float bank = smoothstep(uEdgeX - 9.0, uEdgeX - 0.5, vWaterPos.x);
          float broken = smoothstep(0.7, 0.95, sin(vWaterPos.z * 1.3 + wGrad.x * 25.0) * 0.5 + 0.5);
          float ripple = smoothstep(0.55, 0.95, sin(vWaterPos.x * 7.0 + wGrad.y * 30.0 + uTime * 0.9) * 0.5 + 0.5);
          ripple = mix(ripple, 0.5, smoothstep(0.1, 0.4, wFootprint));
          gl_FragColor.rgb += uWarm * (uNight * bank * broken * ripple * 0.22);
        }`,
      )
  }
  material.customProgramCacheKey = () => 'river-water'
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
