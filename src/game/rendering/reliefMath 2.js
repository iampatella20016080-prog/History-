/**
 * 材質凹凸的純邏輯（不依賴 React／Three／DOM，可以直接單測）：高度圖 → 切線空間法線。
 *
 * 只在精緻畫質使用（見 quality.js 的 relief）。高度由既有手繪貼圖的像素推算——
 * 磚縫、地磚縫、石板縫、木板接縫比磚面淺（暗或偏灰），屋瓦的筒瓦與板瓦依 textures.js 的繪製參數直接算出弧面，
 * 所以法線與色彩貼圖的圖樣完全對得上，不新增貼圖尺寸或材質批次。
 *
 * 卡通渲染：法線進入 MeshToonMaterial 的 dot(N, L)，再查色階貼圖（三段硬邊），
 * 所以斜光下磚縫的上緣跳一格暗、下緣跳一格亮，不會變成寫實的柔和漸層。
 * 描邊用的法線趟是 MeshNormalMaterial 覆寫，不讀法線貼圖，描邊不受影響。
 */

/**
 * 各材質的高度推算方式與凹凸強度：
 * - mode：'luma' 依亮度（暗＝凹）、'mortar' 依綠色通道（灰白的磚縫＝凹）、'roof' 屋瓦弧面（解析式）
 * - lo／hi：亮度（或綠色通道）在這兩個值之間由凹變凸；沒有設定時直接用亮度當連續的高度（木紋、洗石子）
 * - blur：模糊半徑（像素），讓磚縫邊緣成為幾個像素寬的斜面，也濾掉斑點雜訊
 * - strength：法線的斜率倍率；normalScale：材質上的 normalScale（遠近一致的整體強度）
 */
export const RELIEF = {
  brick: { mode: 'mortar', lo: 150, hi: 182, blur: 1.5, strength: 16, normalScale: 1 },
  tile: { mode: 'luma', lo: 196, hi: 214, blur: 1.5, strength: 12, normalScale: 1 },
  pavers: { mode: 'luma', lo: 165, hi: 190, blur: 1.5, strength: 14, normalScale: 1 },
  stone: { mode: 'luma', lo: 140, hi: 166, blur: 2, strength: 14, normalScale: 1 },
  roof: { mode: 'roof', blur: 1, strength: 34, normalScale: 1 },
  wood: { mode: 'luma', blur: 1, strength: 9, normalScale: 1 },
  planks: { mode: 'luma', blur: 1, strength: 11, normalScale: 1 },
  granite: { mode: 'luma', blur: 0.6, strength: 6, normalScale: 1 },
}

/** 與 textures.js 的 roofTexture 相同的參數：16 列（偶數板瓦、奇數筒瓦），每 64 像素一層瓦 */
export const ROOF_PATTERN = { cols: 16, course: 64 }

const clamp01 = (x) => Math.min(1, Math.max(0, x))
export function smoothstep(lo, hi, x) {
  const t = clamp01((x - lo) / (hi - lo))
  return t * t * (3 - 2 * t)
}

/** sRGB 像素的亮度（0–255） */
export const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

/**
 * 屋瓦的高度（0–1）：筒瓦是凸起的半圓、板瓦是淺淺的凹槽；每一層瓦的下緣疊在下一層上，
 * 所以沿著瓦溝方向是鋸齒（上緣低、下緣高，交疊處有一道落差）。
 */
export function roofHeight(x, y, size, pattern = ROOF_PATTERN) {
  const cw = size / pattern.cols
  const c = Math.floor(x / cw)
  const t = (x - c * cw) / cw
  const tube = ((c % 2) + 2) % 2 === 1
  const across = tube ? 0.35 + 0.65 * Math.sin(Math.PI * t) : 0.3 - 0.22 * Math.sin(Math.PI * t)
  const oy = tube ? pattern.course / 2 : 0
  const along = (((y + oy) % pattern.course) + pattern.course) % pattern.course / pattern.course
  return clamp01(across * (0.8 + 0.2 * along))
}

/** 由 RGBA 像素（Uint8ClampedArray，列優先、第 0 列在上）推算高度（0–1） */
export function heightFromPixels(data, width, height, config) {
  const out = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (config.mode === 'roof') {
        out[i] = roofHeight(x + 0.5, y + 0.5, width)
        continue
      }
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      const v = config.mode === 'mortar' ? g : luma(r, g, b)
      if (config.mode === 'mortar') out[i] = 1 - smoothstep(config.lo, config.hi, v)
      else out[i] = config.lo == null ? v / 255 : smoothstep(config.lo, config.hi, v)
    }
  }
  return out
}

/** 可無縫重複的高斯近似模糊（水平、垂直各兩次方框模糊；邊界環繞） */
export function blurWrap(values, width, height, radius) {
  if (!(radius > 0)) return values
  const r = Math.max(1, Math.round(radius))
  let src = values
  let tmp = new Float32Array(values.length)
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        for (let k = -r; k <= r; k++) sum += src[y * width + (((x + k) % width) + width) % width]
        tmp[y * width + x] = sum / (2 * r + 1)
      }
    }
    const next = new Float32Array(values.length)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        for (let k = -r; k <= r; k++) sum += tmp[((((y + k) % height) + height) % height) * width + x]
        next[y * width + x] = sum / (2 * r + 1)
      }
    }
    src = next
  }
  return src
}

/**
 * 高度 → 切線空間法線（RGBA，0–255 編碼，與畫布同方向：第 0 列在上）。
 * 貼圖照 CanvasTexture 預設上下翻轉，所以畫布往右是 +u、往上是 +v：
 * n = normalize(−∂h/∂u·s, −∂h/∂v·s, 1)，其中 ∂h/∂v = −∂h/∂列。
 */
export function normalsFromHeight(heights, width, height, strength) {
  const out = new Uint8ClampedArray(width * height * 4)
  const at = (x, y) => heights[((((y % height) + height) % height) * width) + (((x % width) + width) % width)]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 0.5
      const dRow = (at(x, y + 1) - at(x, y - 1)) * 0.5
      let nx = -dx * strength
      let ny = dRow * strength
      let nz = 1
      const len = Math.hypot(nx, ny, nz)
      nx /= len
      ny /= len
      nz /= len
      const i = (y * width + x) * 4
      out[i] = Math.round((nx * 0.5 + 0.5) * 255)
      out[i + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      out[i + 2] = Math.round((nz * 0.5 + 0.5) * 255)
      out[i + 3] = 255
    }
  }
  return out
}

/** 一張色彩貼圖的像素 → 法線貼圖的像素（整條流程） */
export function reliefNormals(data, width, height, config) {
  const h = blurWrap(heightFromPixels(data, width, height, config), width, height, config.blur)
  return normalsFromHeight(h, width, height, config.strength)
}
