import { QUALITY_MODES } from './quality.js'

/**
 * 天氣的純邏輯（不依賴 React／Three，可以直接單測）。第 14 階段：只在精緻畫質（電腦版）的美觀效果。
 *
 * - 設定：晴／雨，記在 localStorage（ddc.weather）；網址 ?weather=rain|clear 可指定（測試用，優先於記住的選擇）。
 * - 只在精緻畫質：畫質設定的 `weather` 為 false 的模式（流暢，iPad 與觸控裝置的預設）一律是晴天——
 *   不建立雨的網格、不做濕地面與積水倒影那兩趟、著色器不編譯、雨聲不播，畫面與繪製呼叫和以前完全相同。
 *   使用者選了「雨」再切到流暢畫質時，選擇仍記著，切回精緻畫質就再下雨。
 * - 雨勢的變化（stepWeather）：開始下雨時雨絲在幾秒內變密，地面慢慢變濕、積水慢慢變大，屋簷過一會兒才開始滴水；
 *   雨停後雨絲很快停，屋簷還滴一陣子，地面先乾、積水最後才退（地面漸乾）。
 * - 雨天的光線（RAIN_LOOK）：陰天——陽光、太陽光暈與光束幾乎沒有，天色偏灰、霧近一點，飽和與對比降低，
 *   店家與路燈早一點亮。在 atmosphere.js 疊在年代光線上（雨勢 0 時完全不改，結果和以前逐位相同）。
 */
export const WEATHER_IDS = ['clear', 'rain']
export const WEATHER_STORAGE_KEY = 'ddc.weather'

/** 這個畫質有沒有天氣選項（精緻畫質才有） */
export function weatherAvailable(qualityId) {
  return Boolean(QUALITY_MODES[qualityId]?.weather)
}

/** 畫面上實際的天氣：流暢畫質一律晴天 */
export function effectiveWeather(qualityId, weather) {
  return weatherAvailable(qualityId) && weather === 'rain' ? 'rain' : 'clear'
}

function readStored(storage) {
  try {
    const value = storage?.getItem(WEATHER_STORAGE_KEY)
    return WEATHER_IDS.includes(value) ? value : null
  } catch {
    return null
  }
}

/** 開始時的天氣：網址參數 > 使用者上次的選擇 > 晴天 */
export function initialWeather(search = typeof window === 'undefined' ? '' : window.location.search, storage = typeof window === 'undefined' ? null : window.localStorage) {
  const param = new URLSearchParams(search).get('weather')
  if (WEATHER_IDS.includes(param)) return param
  return readStored(storage) ?? 'clear'
}

export function saveWeather(id, storage = typeof window === 'undefined' ? null : window.localStorage) {
  try {
    storage?.setItem(WEATHER_STORAGE_KEY, id)
  } catch {
    // 私密瀏覽等情況下無法儲存，仍可在本次使用中切換
  }
}

/**
 * 雨勢變化的速度（每秒的變化量，0..1）：
 * rain 雨絲的密度、sky 陰天的光線、wet 地面變濕變暗、puddle 積水的大小、drip 屋簷滴水。
 */
export const WEATHER_RATES = {
  rain: { up: 1 / 5, down: 1 / 3 },
  // 天色：雨來之前先陰下來，雨停後慢慢放晴
  sky: { up: 1 / 4, down: 1 / 22 },
  wet: { up: 1 / 14, down: 1 / 40 },
  puddle: { up: 1 / 28, down: 1 / 70 },
  // 屋簷：開始下雨後約 4 秒才有水滴下（跟著 rain 上升，但慢一點）；雨停後還滴約 18 秒
  drip: { up: 1 / 9, down: 1 / 18 },
}

/** 一開始就下雨（網址 ?weather=rain 或記住的選擇）時，直接是下了一陣子的樣子，不用等地面變濕 */
export function weatherSteady(raining) {
  const v = raining ? 1 : 0
  return { rain: v, sky: v, wet: v, puddle: v, drip: v }
}

export function createWeatherState() {
  return weatherSteady(false)
}

function approach(value, target, up, down, dt) {
  if (value < target) return Math.min(target, value + up * dt)
  if (value > target) return Math.max(target, value - down * dt)
  return value
}

/**
 * 往目標天氣推進一個影格（就地修改並回傳 state）。
 * 屋簷滴水跟著地面濕的程度：雨剛開始時屋頂還沒積水，雨停後屋頂上的水還要一陣子才滴完。
 * 積水不會比地面濕更快出現，也不會在地面乾了之後還留著太多。
 */
export function stepWeather(state, dt, raining) {
  const target = raining ? 1 : 0
  const step = Math.min(Math.max(dt, 0), 0.25)
  const r = WEATHER_RATES
  state.rain = approach(state.rain, target, r.rain.up, r.rain.down, step)
  state.sky = approach(state.sky, target, r.sky.up, r.sky.down, step)
  state.wet = approach(state.wet, target, r.wet.up, r.wet.down, step)
  state.puddle = approach(state.puddle, Math.min(target, state.wet + 0.05), r.puddle.up, r.puddle.down, step)
  const dripTarget = raining ? Math.min(1, state.wet * 2.2) : 0
  state.drip = approach(state.drip, dripTarget, r.drip.up, r.drip.down, step)
  return state
}

/** 有沒有任何雨的痕跡（全部是 0 時雨的元件什麼都不畫） */
export function weatherActive(state) {
  return state.rain > 0.001 || state.wet > 0.001 || state.puddle > 0.001 || state.drip > 0.001 || state.sky > 0.001
}

/**
 * 執行期的雨勢（每個影格由 Rain 元件寫入；渲染器、河面、環境音讀取）。
 * 流暢畫質沒有 Rain 元件，一直是 0。
 */
export const weatherState = createWeatherState()

/**
 * 雨天的光線：疊在年代光線上的修改，amount = 雨勢（0..1）。
 * - mul：數值乘上 1 + (倍率 − 1) × 雨勢
 * - add：數值加上 加量 × 雨勢
 * - colors：顏色往灰色移（gray：去飽和比例，dark：亮度倍率），再往 tint 混一點
 */
export const RAIN_LOOK = {
  mul: {
    sunIntensity: 0.32,
    hemiIntensity: 0.9,
    fillIntensity: 0.6,
    fogNear: 0.55,
    fogFar: 0.6,
    saturation: 0.82,
    contrast: 0.94,
    exposure: 0.96,
    stars: 0,
    air_density: 1.9,
    air_start: 0.6,
    air_heightFalloff: 0.7,
    air_rays: 0,
    air_sunScatter: 0.2,
    riverMist: 1.6,
    vignette: 1.15,
  },
  add: {
    // 陰天：店家與路燈早一點點亮（白天的年代也有一點燈光落點）
    glow: 0.22,
    air_max: 0.1,
  },
  colors: {
    skyTop: { gray: 0.75, dark: 0.78, tint: '#8f9aa3', mix: 0.35 },
    skyHorizon: { gray: 0.7, dark: 0.85, tint: '#b5bcc0', mix: 0.35 },
    skyBottom: { gray: 0.7, dark: 0.8 },
    sunGlow: { gray: 0.6, dark: 0.25 },
    sunColor: { gray: 0.55, dark: 0.85 },
    fogColor: { gray: 0.65, dark: 0.85, tint: '#aeb5b8', mix: 0.3 },
    hemiSky: { gray: 0.5, dark: 0.95, tint: '#c3ccd3', mix: 0.25 },
    hemiGround: { gray: 0.4, dark: 0.85 },
    // 雲融進陰天的天色（不要變成一團一團的深灰）
    cloudColor: { gray: 0.85, dark: 0.95, tint: '#b8bec2', mix: 0.65 },
    cloudEmissive: { gray: 0.85, dark: 0.9, tint: '#9aa1a5', mix: 0.55 },
    mountains: { gray: 0.5, dark: 0.95, tint: '#a7afb2', mix: 0.45 },
    water: { gray: 0.45, dark: 0.82 },
  },
}

/** 疊上雨天光線後的數值（純函式，給 atmosphere.js 與測試用；amount ≤ 0 時原樣回傳） */
export function rainNumber(key, value, amount) {
  if (!(amount > 0)) return value
  const t = Math.min(1, amount)
  const m = RAIN_LOOK.mul[key]
  const a = RAIN_LOOK.add[key]
  let v = value
  if (m !== undefined) v *= 1 + (m - 1) * t
  if (a !== undefined) v += a * t
  return v
}

/**
 * 雨絲與屋簷滴水的份量（只在精緻畫質）：
 * 雨絲在鏡頭周圍 box 公尺見方、height 公尺高的範圍內循環，鏡頭移動時位置固定在世界座標（不會跟著鏡頭跑）。
 */
export const RAIN = {
  streaks: 14000, // 雨絲（每條一個四邊形，一次繪製）
  splashes: 2200, // 落地的水花（同一次繪製）
  box: 34,
  height: 22,
  speed: 9.5, // 雨滴落下的速度（公尺／秒）
  length: 0.62, // 雨絲的長度（公尺，約 1/15 秒的動態模糊）
  maxDrips: 3200, // 屋簷滴水點的上限（每點兩滴，一次繪製）
  dripsPerEmitter: 2,
  puddleScale: 0.3, // 積水倒影的解析度（相對畫面）
}
