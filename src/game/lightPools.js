/**
 * 燈光落點（第 9 階段・只在精緻畫質）：燈籠、路燈、店門口的燈真的照到地面與牆上。
 *
 * 不為每盞燈建立 Three.js 點光源（每盞燈都會讓所有材質多算一次光、重新編譯），
 * 而是在卡通渲染管線的色彩趟之後加一趟全螢幕的處理（rendering/lightPoolPass.js）：
 * 用法線＋深度趟已有的深度與法線還原每個像素的位置，依「鏡頭附近的 N 盞燈」加上暖色的光斑。
 * 光斑分成幾階（和卡通材質的色階一致），燈下的地面、背後的牆面都會亮起一圈。
 *
 * 這裡是純邏輯（不依賴 React／Three）：哪些燈算光源、光的半徑、衰減曲線、
 * 每個影格挑哪幾盞燈、各年代的強度。衰減與色階的 GLSL 寫在 lightPoolPass.js，與這裡的 JS 對照。
 */

/** 一個影格最多幾盞燈（著色器裡的迴圈長度） */
export const MAX_POOL_LIGHTS = 16

/** 挑燈：離「鏡頭前方的注視點」多遠以內的燈才考慮（公尺），以及最後幾公尺淡出 */
export const POOL_RANGE = 46
export const POOL_FADE = 10

/** 注視點在鏡頭前方幾公尺（鏡頭背後的燈照不到畫面，優先挑前方的燈） */
export const POOL_LOOK_AHEAD = 12

/** 光斑的色階數（與卡通材質的明暗階數接近，邊緣柔化） */
export const POOL_BANDS = 4

/** 整體增益：最亮處（燈下正中）表面亮度最多變成約 1 + POOL_GAIN 倍 */
export const POOL_GAIN = 3

/**
 * 光的半徑（公尺）：依光暈大小。燈籠（光暈 1.5）約 5.4 公尺，掛在騎樓下 3–4 公尺高也照得到正下方的地面；
 * 路燈（2.2–2.6）約 7 公尺；小燈泡、櫃檯燈（0.6–1）約 3.6–4.4 公尺。
 * 半徑刻意不大：一整排燈的光斑才會一圈一圈分開，不會連成一片把冷色的陰影洗掉。
 */
export function poolRadius(size = 1) {
  return Math.min(7, Math.max(3.5, size * 2 + 2.4))
}

/** 平滑的距離衰減：中心 1、到半徑時 0（(1 − x²)²，在半徑處斜率也是 0，邊緣不會有硬邊） */
export function poolFalloff(distance, radius) {
  const x = Math.min(1, Math.max(0, distance / radius))
  const k = 1 - x * x
  return k * k
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 卡通色階：分成 POOL_BANDS 階，每階的邊緣用 smoothstep 柔化（不是硬切的同心圓） */
export function poolBand(value, bands = POOL_BANDS) {
  const f = Math.max(0, value) * bands
  const step = Math.floor(f)
  return Math.min(1, (step + smoothstep(0.35, 0.65, f - step)) / bands)
}

/**
 * 各年代的強度（0–1），由年代的 glow 值（白天 0 – 入夜 1；轉場時連續變化）換算：
 * 酒樓繁華（入夜，glow 1）全亮；摩登（黃昏 0.62）約六成；老屋新生（明亮白日 0.42）只剩一點店面的暖光；
 * 港口商街（0.12）與庶民生活（0.08）的白天為 0，不做這一趟。
 */
export function lightPoolStrength(glow = 0) {
  return smoothstep(0.35, 0.8, glow)
}

/** sRGB 十六進位色 → 線性 RGB（與 Three.js 的 Color.set 相同的轉換） */
function srgbToLinear(c) {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4)
}

export function hexToLinear(hex) {
  const value = parseInt(String(hex).replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => srgbToLinear(c / 255))
}

/** 冷色的燈（例如爐鍋咖啡的藍色燈箱）不投下暖色光斑，光的顏色維持原色但減弱 */
function isWarm([r, , b]) {
  return r >= b
}

/**
 * 街景的燈火（world.glows）→ 光源清單：位置、半徑、線性色彩（含這盞燈的權重）。
 * 燈籠與路燈最亮；窗內、櫃檯的小燈比較弱。
 */
export function buildPoolLights(glows = []) {
  return glows.map((glow) => {
    const color = hexToLinear(glow.color ?? '#ffb36b')
    const size = glow.size ?? 1
    const weight = (isWarm(color) ? 1 : 0.5) * Math.min(1, 0.45 + size * 0.35)
    return {
      position: glow.position,
      radius: poolRadius(size),
      color: color.map((c) => c * weight),
    }
  })
}

/**
 * 挑出這個影格要算的燈：離注視點（鏡頭前方 POOL_LOOK_AHEAD 公尺）最近的 max 盞，
 * 每盞附上淡出權重——超出 POOL_RANGE 的不算，最後 POOL_FADE 公尺逐漸變暗；
 * 燈比 max 盞多時，也依第 max+1 盞的距離淡出，鏡頭移動時燈不會突然出現或消失。
 *
 * focus：[x, y, z]。回傳 [{ index, weight }]，依距離由近到遠。
 */
export function selectPoolLights(lights, focus, max = MAX_POOL_LIGHTS, range = POOL_RANGE, fade = POOL_FADE) {
  const candidates = []
  for (let i = 0; i < lights.length; i++) {
    const [x, y, z] = lights[i].position
    const d = Math.hypot(x - focus[0], y - focus[1], z - focus[2])
    if (d < range) candidates.push({ index: i, distance: d })
  }
  candidates.sort((a, b) => a.distance - b.distance)
  const cutoff = candidates.length > max ? Math.min(range, candidates[max].distance) : range
  return candidates.slice(0, max).map(({ index, distance }) => ({
    index,
    weight: 1 - smoothstep(cutoff - fade, cutoff, distance),
  }))
}

/** 注視點：鏡頭位置往前方（水平方向）POOL_LOOK_AHEAD 公尺 */
export function poolFocus(position, forward, ahead = POOL_LOOK_AHEAD) {
  const len = Math.hypot(forward[0], forward[2]) || 1
  return [position[0] + (forward[0] / len) * ahead, position[1], position[2] + (forward[2] / len) * ahead]
}

/**
 * 這趟處理要不要存在：只有畫質設定 lightPools 為 true（精緻）才建立。
 * 回傳下一個狀態——流暢畫質永遠是 null，也不呼叫 create（不建立、不編譯著色器）。
 */
export function syncLightPoolPass(current, quality, create) {
  if (quality?.lightPools) return current ?? create()
  current?.dispose()
  return null
}
