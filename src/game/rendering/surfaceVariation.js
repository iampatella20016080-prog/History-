/**
 * 打破大面積地磚與牆面的重複感（第 9 階段・細部）。
 *
 * 手繪貼圖每 1–4 公尺重複一次，一整條街鋪滿時一眼看得出是同一張圖。這裡在卡通材質的片段著色器裡
 * 依「世界座標」疊上三層變化，不新增材質、不增加繪製呼叫：
 *
 * 1. 大尺度的明暗與色相：約 5–14 公尺一個起伏的低頻雜訊，偏暖或偏冷幾個百分點
 * 2. 補丁：雜訊超過門檻的幾公尺大的不規則區塊整片換一個色調（柏油補過的路面、重新抹過的灰泥）
 * 3. 單塊的破磚與換過的磚：依貼圖實際的磚格（rows × perRow、是否錯縫）找出每一塊，
 *    以整個世界的磚格編號取亂數，少數幾塊顏色不同或有一道裂縫；同一張貼圖的不同重複位置結果不同
 *
 * 純邏輯（磚格編號、亂數、哪些磚是破的）同時寫成 JS，與 GLSL 對照，可以直接單測。
 */

/**
 * 各材質的設定：
 * - tone：大尺度明暗幅度；hue：冷暖幅度；scale：起伏的尺度（公尺）
 * - patch：補丁色調差（0 不做）；patchScale：補丁的大小（公尺）；seam：補丁邊緣接縫的深度（只有柏油，
 *   其他材質的接縫看起來像一圈水漬，不加）。石板與夯土的貼圖本身已有深淺，不加補丁
 * - grid：貼圖一次重複裡的磚格（與 textures.js 的繪製一致）；bond 為錯縫（奇數列偏移半塊）
 * - broken：一塊磚是破磚（有裂縫）的機率；swapped：換過、顏色不同的機率
 */
export const SURFACE_VARIATION = {
  plaster: { tone: 0.07, hue: 0.03, scale: 7, patch: 0.06, patchScale: 3.5 },
  stucco: { tone: 0.06, hue: 0.025, scale: 7, patch: 0.05, patchScale: 3.5 },
  brick: { tone: 0.06, hue: 0.03, scale: 6, patch: 0, grid: { rows: 16, perRow: 4, bond: true }, broken: 0.012, swapped: 0.03 },
  stone: { tone: 0.08, hue: 0.03, scale: 9, patch: 0 },
  earth: { tone: 0.1, hue: 0.04, scale: 12, patch: 0 },
  asphalt: { tone: 0.08, hue: 0.02, scale: 10, patch: 0.1, patchScale: 4, seam: 0.18 },
  pavers: { tone: 0.06, hue: 0.025, scale: 9, patch: 0, grid: { rows: 8, perRow: 4, bond: true }, broken: 0.015, swapped: 0.04 },
  tile: { tone: 0.05, hue: 0.02, scale: 6, patch: 0, grid: { rows: 16, perRow: 4, bond: true }, broken: 0.01, swapped: 0.03 },
  marketTile: { tone: 0.05, hue: 0.015, scale: 8, patch: 0, grid: { rows: 4, perRow: 4, bond: false }, broken: 0.03, swapped: 0.04 },
  terracotta: { tone: 0.06, hue: 0.03, scale: 6, patch: 0, grid: { rows: 4, perRow: 4, bond: false }, broken: 0.03, swapped: 0.05 },
  creamTile: { tone: 0.05, hue: 0.02, scale: 6, patch: 0, grid: { rows: 4, perRow: 4, bond: false }, broken: 0.025, swapped: 0.04 },
  roof: { tone: 0.06, hue: 0.03, scale: 8, patch: 0.05, patchScale: 4 },
}

const fract = (x) => x - Math.floor(x)

/** 2D → [0,1) 的雜湊（Dave Hoskins 的 hash12；與 GLSL 版相同） */
export function hash12(x, y) {
  let a = fract(x * 0.1031)
  let b = fract(y * 0.1031)
  let c = fract(x * 0.1031)
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33)
  a += d
  b += d
  c += d
  return fract((a + b) * c)
}

/** 貼圖座標 (u, v) 落在第幾塊磚（整個世界的編號，不是一次重複裡的編號） */
export function unitCell(u, v, grid) {
  const row = Math.floor(v * grid.rows)
  const shift = grid.bond && ((row % 2) + 2) % 2 === 1 ? 0.5 : 0
  const col = Math.floor(u * grid.perRow - shift)
  return [col, row]
}

/** 這塊磚是破磚（broken）、換過的磚（swapped）還是一般的磚 */
export function unitState(col, row, config) {
  const h = hash12(col + 0.5, row + 0.5)
  if (h < (config.broken ?? 0)) return 'broken'
  if (h < (config.broken ?? 0) + (config.swapped ?? 0)) return 'swapped'
  return 'normal'
}

const GLSL_COMMON = /* glsl */ `
uniform vec4 uSurfVar;   // tone, hue, 1/scale, patch
uniform vec4 uSurfGrid;  // rows, perRow, bond, 有磚格
uniform vec4 uSurfUnit;  // broken, swapped, 1/patchScale, seam
varying vec3 vSurfWorld;
varying float vSurfUp;
float surfHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float surfNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = surfHash(i);
  float b = surfHash(i + vec2(1.0, 0.0));
  float c = surfHash(i + vec2(0.0, 1.0));
  float d = surfHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`

const GLSL_APPLY = /* glsl */ `
{
  // 地面用水平座標，牆面沿著牆展開（x + z 讓轉角處連續）
  vec2 sp = vSurfUp > 0.6 ? vSurfWorld.xz : vec2(vSurfWorld.x + vSurfWorld.z, vSurfWorld.y * 1.4);
  vec2 q = sp * uSurfVar.z;
  float n = surfNoise(q) * 0.65 + surfNoise(q * 2.3 + 17.0) * 0.35;
  float m = n * 2.0 - 1.0;
  vec3 tone = vec3(1.0 + m * uSurfVar.x);
  float warm = surfNoise(q * 0.7 + 41.0) * 2.0 - 1.0;
  tone *= vec3(1.0 + warm * uSurfVar.y, 1.0, 1.0 - warm * uSurfVar.y);
  if (uSurfVar.w > 0.0) {
    // 補丁：雜訊高的不規則區塊整片偏一個色調，邊緣有一圈較深的接縫
    float pn = surfNoise(sp * uSurfUnit.z + 73.0) * 0.75 + surfNoise(sp * uSurfUnit.z * 3.0 + 5.0) * 0.25;
    float inPatch = smoothstep(0.7, 0.72, pn);
    float seam = smoothstep(0.68, 0.7, pn) - inPatch;
    tone *= mix(vec3(1.0), vec3(1.0 - uSurfVar.w * 0.6, 1.0 - uSurfVar.w * 0.5, 1.0 - uSurfVar.w * 0.2), inPatch);
    tone *= 1.0 - seam * uSurfUnit.w;
  }
#ifdef USE_MAP
  if (uSurfGrid.w > 0.5) {
    float row = floor(vMapUv.y * uSurfGrid.x);
    float shift = (uSurfGrid.z > 0.5 && mod(row, 2.0) > 0.5) ? 0.5 : 0.0;
    float colF = vMapUv.x * uSurfGrid.y - shift;
    float col = floor(colF);
    float h = surfHash(vec2(col + 0.5, row + 0.5));
    vec2 local = vec2(fract(colF), fract(vMapUv.y * uSurfGrid.x));
    if (h < uSurfUnit.x) {
      // 破磚：一道斜斜的裂縫，加一個小缺角
      float a = surfHash(vec2(col, row) + 7.0) * 3.1416;
      vec2 dir = vec2(cos(a), sin(a));
      vec2 c = vec2(0.3, 0.3) + 0.4 * vec2(surfHash(vec2(col, row) + 3.0), surfHash(vec2(col, row) + 9.0));
      float dist = abs(dot(local - c, vec2(-dir.y, dir.x)));
      float along = abs(dot(local - c, dir));
      float crack = (1.0 - smoothstep(0.012, 0.03, dist)) * (1.0 - smoothstep(0.32, 0.4, along));
      float chip = 1.0 - smoothstep(0.1, 0.13, length(local - vec2(0.92, 0.9)));
      tone *= (1.0 - crack * 0.45) * (1.0 - chip * 0.3) * 0.94;
    } else if (h < uSurfUnit.x + uSurfUnit.y) {
      // 換過的磚：比旁邊新一點或舊一點
      float s = surfHash(vec2(row, col) + 11.0);
      tone *= s > 0.5 ? vec3(1.08, 1.06, 1.03) : vec3(0.88, 0.88, 0.9);
    }
  }
#endif
  diffuseColor.rgb *= tone;
}
`

/**
 * 在卡通材質上加上表面變化（onBeforeCompile；同一段著色器的材質共用程式，各自的 uniform 不同）。
 * 設定放在 material.userData.surfaceVariation，複製材質（室內）時一起帶過去。
 */
export function applySurfaceVariation(material, config) {
  material.userData.surfaceVariation = config
  material.onBeforeCompile = surfaceVariationCompile
  material.customProgramCacheKey = surfaceVariationKey
  return material
}

function surfaceVariationKey() {
  return 'surface-variation'
}

function surfaceVariationCompile(shader) {
  const cfg = this.userData.surfaceVariation
  const grid = cfg.grid
  shader.uniforms.uSurfVar = { value: [cfg.tone, cfg.hue, 1 / cfg.scale, cfg.patch ?? 0] }
  shader.uniforms.uSurfGrid = { value: grid ? [grid.rows, grid.perRow, grid.bond ? 1 : 0, 1] : [1, 1, 0, 0] }
  shader.uniforms.uSurfUnit = { value: [cfg.broken ?? 0, cfg.swapped ?? 0, 1 / (cfg.patchScale ?? 4), cfg.seam ?? 0] }
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vSurfWorld;\nvarying float vSurfUp;')
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vSurfWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vSurfUp = abs(normalize(mat3(modelMatrix) * objectNormal).y);`,
    )
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${GLSL_COMMON}`)
    .replace('#include <color_fragment>', `#include <color_fragment>\n${GLSL_APPLY}`)
}

export const SURFACE_VARIATION_GLSL = { common: GLSL_COMMON, apply: GLSL_APPLY }
