/**
 * 空氣遠近感與光束的純邏輯（不依賴 React／Three，可以直接單測；只在精緻畫質使用）
 *
 * - 空氣遠近感（aerial perspective）：依距離與高度的指數霧。空氣在地面附近較濃、往上變薄，
 *   所以長街的盡頭偏向天空色、對比與飽和降低，屋頂和遠山比街面更清楚地「退後」。
 *   後製著色器（rendering/airPass.js）用同一組公式，這裡的函式是它的 JavaScript 版本，方便測試與調參。
 * - 描邊淡出：霧越濃的年代，黑線越早淡掉，遠處的線條不會比建築本身搶眼。
 * - 光束（god rays）：太陽低的時候（傍晚、黃昏）才明顯；太陽在鏡頭後方或離畫面太遠時自然淡出。
 *
 * 各年代的參數放在 eras.js 的 lighting.air，沒有設定的欄位用 AIR_DEFAULTS。
 */

/** 預設值（中性、偏淡的空氣） */
export const AIR_DEFAULTS = {
  density: 0.005, // 地面高度的消光係數（每公尺）
  start: 14, // 這段距離以內不加空氣（近景維持原本的清楚）
  heightFalloff: 0.045, // 濃度隨高度遞減（每公尺），越大越貼地
  max: 0.62, // 上限：最遠的山也不會完全被霧吃掉
  desaturate: 0.5, // 隨霧降低飽和的比例
  horizon: 0.45, // 空氣顏色取多少天空地平線色（其餘是年代霧色）
  sunScatter: 0.45, // 朝太陽方向的空氣帶多少太陽光暈色
  rays: 0, // 光束強度（會再乘上太陽高度與畫面位置的係數）
  // 精緻畫質的調色倍率（乘在年代的對比與飽和上；流暢畫質沒有空氣這一趟，不套用）
  contrast: 1,
  saturation: 1,
}

export const AIR_KEYS = Object.keys(AIR_DEFAULTS)

/** 預設的描邊淡出距離（和 ToonRenderer 的輪廓 pass 相同，流暢畫質一直用這組） */
export const DEFAULT_LINE_FADE = [38, 150]

/** 光束取樣：四分之一解析度、每個像素沿著往太陽的方向取樣幾次 */
export const RAY_SAMPLES = 32
export const RAY_RESOLUTION = 0.25

/** 某年代的空氣參數（沒有設定的欄位用預設值） */
export function airValues(lighting) {
  const values = {}
  for (const key of AIR_KEYS) values[key] = lighting?.air?.[key] ?? AIR_DEFAULTS[key]
  return values
}

/**
 * 沿視線的光學厚度：從鏡頭高度 cameraY 到目標高度 pointY 的指數高度霧積分。
 * density(y) = density · e^(−k·y)；兩端高度相同時退化成 density · e^(−k·y) · 距離。
 */
export function opticalDepth(distance, cameraY, pointY, air) {
  const d = Math.max(0, distance - air.start)
  if (d <= 0) return 0
  const k = air.heightFalloff
  const dy = pointY - cameraY
  const base = Math.exp(-k * Math.max(cameraY, 0))
  const height = Math.abs(k * dy) < 1e-4 ? base : (base - Math.exp(-k * Math.max(pointY, 0))) / (k * dy)
  return air.density * d * height
}

/** 霧的比例（0 = 原色、1 = 全是空氣色），有上限 */
export function fogAmount(distance, cameraY, pointY, air) {
  return Math.min(air.max, 1 - Math.exp(-opticalDepth(distance, cameraY, pointY, air)))
}

/** 霧達到 amount 的距離（鏡頭和目標都在 height 公尺高；霧到不了這麼濃時回傳 Infinity） */
export function distanceForFog(amount, air, height = 2) {
  if (amount >= air.max) return Infinity
  const perMeter = air.density * Math.exp(-air.heightFalloff * height)
  return air.start - Math.log(1 - amount) / perMeter
}

/**
 * 精緻畫質的描邊淡出距離：霧到 0.12 開始淡、到 0.4 完全淡掉（不比預設更遠）。
 * 霧越濃的年代，線條越早退場。
 */
export function lineFade(air) {
  const [defaultNear, defaultFar] = DEFAULT_LINE_FADE
  const far = Math.min(defaultFar, Math.max(60, distanceForFog(0.4, air)))
  const near = Math.min(defaultNear, Math.max(18, distanceForFog(0.12, air)), far * 0.6)
  return [near, far]
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 太陽高度（度）對光束的係數：剛落下時淡出、低角度最強、高過約 45° 就沒有 */
export function sunElevationFactor(elevation) {
  return smoothstep(-3, 2, elevation) * (1 - smoothstep(12, 46, elevation))
}

/**
 * 太陽在畫面上的係數。
 * facing：鏡頭前方與太陽方向的內積（≤ 0 表示太陽在後方）；
 * ndc：太陽投影到畫面的座標 [x, y]（−1～1 是畫面內）。離畫面越遠越淡，超過約 1.8 倍畫面就沒有。
 */
export function sunScreenFactor(facing, ndc) {
  if (!(facing > 0)) return 0
  const edge = Math.max(Math.abs(ndc[0]), Math.abs(ndc[1]))
  return smoothstep(0.05, 0.35, facing) * (1 - smoothstep(0.95, 1.8, edge))
}

/** 這一影格的光束強度 */
export function rayStrength(air, elevation, facing, ndc) {
  return air.rays * sunElevationFactor(elevation) * sunScreenFactor(facing, ndc)
}

/** 各畫質要不要加空氣與光束的 pass（流暢畫質完全不加，著色器也不編譯） */
export function airPassPlan(quality) {
  const on = Boolean(quality?.air)
  return { aerial: on, rays: on }
}
