/**
 * 夜晚的純邏輯（不依賴 React／Three，可以直接單測）。第 14 階段：只在精緻畫質（電腦版）的美觀效果。
 *
 * - 時段：白天／夜晚，記在 localStorage（ddc.timeOfDay）；網址 ?time=night|day 可指定（測試用）。
 *   流暢畫質一律是年代原本的時刻（和 weather.js 的天氣一樣，只在精緻畫質有效）。
 * - 夜晚的光線（NIGHT_LOOK）：疊在年代光線上——夜空與星星、太陽換成偏藍的月光（掛在觀音山上空，河面上有一條月光），
 *   天空光變暗、暗部偏藍；窗內透光、燈籠、路燈與燈光落點加強（依年代，見 NIGHT_ERAS）。
 *   夜晚的量 0 時不呼叫，年代光線逐位不變。
 * - 各年代的照明（NIGHT_ERAS）：依 docs/research/night-lighting.md 查證。清末只有油燈、燈籠與廟燈，沒有電燈；
 *   1905 年龜山發電所送電後大稻埕才有電燈；戰後店裡有日光燈；2000 年後是暖黃的 LED 與立面燈。
 *   查不到大稻埕本地紀錄的部分（窗光的顏色、亮度）是「歷史情境重建」。
 */
import { QUALITY_MODES } from './quality.js'

export const TIME_IDS = ['day', 'night']
export const TIME_STORAGE_KEY = 'ddc.timeOfDay'

/** 這個畫質有沒有時段選項（精緻畫質才有，和天氣共用同一個開關） */
export function timeAvailable(qualityId) {
  return Boolean(QUALITY_MODES[qualityId]?.weather)
}

/** 畫面上實際的時段：流暢畫質一律白天（年代原本的時刻） */
export function effectiveTimeOfDay(qualityId, time) {
  return timeAvailable(qualityId) && time === 'night' ? 'night' : 'day'
}

function readStored(storage) {
  try {
    const value = storage?.getItem(TIME_STORAGE_KEY)
    return TIME_IDS.includes(value) ? value : null
  } catch {
    return null
  }
}

/** 開始時的時段：網址參數 > 使用者上次的選擇 > 白天 */
export function initialTimeOfDay(search = typeof window === 'undefined' ? '' : window.location.search, storage = typeof window === 'undefined' ? null : window.localStorage) {
  const param = new URLSearchParams(search).get('time')
  if (TIME_IDS.includes(param)) return param
  return readStored(storage) ?? 'day'
}

export function saveTimeOfDay(id, storage = typeof window === 'undefined' ? null : window.localStorage) {
  try {
    storage?.setItem(TIME_STORAGE_KEY, id)
  } catch {
    // 私密瀏覽等情況下無法儲存，仍可在本次使用中切換
  }
}

/** 執行期的夜晚程度（0 白天 – 1 夜晚；精緻畫質的 WeatherClock 每個影格寫入，流暢畫質一直是 0） */
export const nightState = { night: 0 }

/** 入夜與天亮的速度（每秒，0..1）：約 5 秒入夜、4 秒天亮 */
export const NIGHT_RATE = { up: 1 / 5, down: 1 / 4 }

export function stepNight(value, dt, night) {
  const step = Math.min(Math.max(dt, 0), 0.25)
  if (night) return Math.min(1, value + NIGHT_RATE.up * step)
  return Math.max(0, value - NIGHT_RATE.down * step)
}

/**
 * 夜晚的光線：to 的數值與顏色往目標移（線性內插，量 = 夜晚的程度），mul 的數值乘上倍率。
 * 月亮的方位：西方、觀音山上空，仰角 11°（陰影的方向仍以 24° 為下限；從碼頭看得到月亮與河面上的月光；太陽的方向換成月亮，天空著色器的太陽光暈就是月暈，陰影也跟著月光）。
 */
export const NIGHT_LOOK = {
  to: {
    sunIntensity: 0.45,
    hemiIntensity: 1.05,
    // 月光照不到的街面（被街屋的影子遮住）也要看得出石板與人物
    ambientIntensity: 0.65,
    fillIntensity: 0.32,
    fillAzimuth: 40,
    fillElevation: 30,
    azimuth: 262,
    elevation: 11,
    stars: 1,
    riverMist: 0.32,
    air_rays: 0,
    air_sunScatter: 0.12,
    air_horizon: 0.6,
    lift: 0.035,
    shadowR: 0.88,
    shadowG: 0.94,
    shadowB: 1.14,
    highlightR: 1.06,
    highlightG: 1.0,
    highlightB: 0.9,
  },
  mul: {
    saturation: 0.86,
    contrast: 0.94,
    exposure: 1.02,
    vignette: 1.25,
    fogNear: 0.85,
    fogFar: 0.92,
    // 夜裡空氣遠近感淡一點（霧色很暗，太濃會整片灰濛濛）
    air_density: 0.7,
    air_max: 0.75,
  },
  colors: {
    sunColor: '#a8bce0', // 月光
    sunGlow: '#6d7fa8', // 月暈
    hemiSky: '#4a5b88',
    hemiGround: '#2a2620',
    ambientColor: '#6a7aa4',
    fillColor: '#6c84c0',
    skyTop: '#07102a',
    skyHorizon: '#232d4c',
    skyBottom: '#10162a',
    fogColor: '#1d2438',
    mountains: '#202a40',
    water: '#1d2840',
    cloudColor: '#5a6584',
    cloudEmissive: '#323a55',
  },
}

/**
 * 各年代的夜間照明（夜晚時窗光、燈籠與燈泡的強度與顏色）。
 * glow：窗內透光與燈火的強度（atmosphere 的 glow；白天的年代 0、酒樓繁華的傍晚 1）；lanternGlow：燈籠、燈泡與光暈；
 * windowTint：亮窗與暖色玻璃的發光顏色（往這個顏色移 tintAmount）。
 * evidence：有出處（sources.js 的 id）；reconstructed：查不到大稻埕本地紀錄、依旁證推測的「歷史情境重建」。
 */
export const NIGHT_ERAS = {
  'qing-port': {
    glow: 0.85,
    lanternGlow: 0.9,
    windowTint: '#ff9f4a',
    tintAmount: 0.55,
    electric: false,
    note: '油燈、燈籠與廟燈：光很暗、偏橘，一點一點的。1895 年以前大稻埕街上沒有電燈（1888 年興市公司的電燈只在臺北城內，點了一個多月就停）；1860–80 年代起洋行輸入煤油。',
    noteEn: 'Oil lamps, lanterns and temple lamps: dim, orange points of light. There was no electric light in Dadaocheng’s streets before 1895 (the electric lamps of the Xingshi Company in 1888 were inside the walled city and went out after about a month); kerosene was imported by foreign firms from the 1860s–80s.',
    evidence: ['culture-xindian-hydro', 'fujii-taipei-cinema-league', 'chu-2022-qing-petroleum', 'beigang-kerosene-lamp-curation'],
    reconstructed: '窗光與燈籠的顏色、亮度：歷史情境重建（花生油、豆油燈與燈籠的光）。',
    reconstructedEn: 'The colour and brightness of window light and lanterns: historical reconstruction (light from peanut-oil and bean-oil lamps and lanterns).',
  },
  banquet: {
    glow: 1.0,
    lanternGlow: 0.8,
    windowTint: '#ffb866',
    tintAmount: 0.4,
    electric: true,
    note: '1905 年龜山發電所送電，城內、艋舺、大稻埕三區開始有電燈；同年 9 月大稻埕立起第一根電線桿。電線桿上的白熾燈與酒樓的燈籠並存。',
    noteEn: 'From 1905 the Guishan power station supplied the walled city, Mengjia and Dadaocheng with electric light; Dadaocheng’s first electric pole went up that September. Incandescent lamps on poles stood alongside restaurant lanterns.',
    evidence: ['culture-xindian-hydro', 'storystudio-first-electric-light', 'gjtaiwan-1905-taipei-lights', 'taipower-history-03-electric-light'],
    reconstructed: '大稻埕路燈的樣式與酒樓的燈籠：歷史情境重建。',
    reconstructedEn: 'The style of Dadaocheng’s street lamps and the restaurants’ lanterns: historical reconstruction.',
  },
  modern: {
    glow: 1.0,
    lanternGlow: 0.8,
    windowTint: '#ffc878',
    tintAmount: 0.35,
    electric: true,
    note: '白熾燈的街燈與店面燈飾；1931 年臺北的霓虹燈從 1 座增加到 6 處（在城內的榮町、本町）；鈴蘭燈約 1930 年傳入臺灣，1942 年起因金屬回收拆除。',
    noteEn: 'Incandescent street lamps and shopfront illuminations; in 1931 Taipei’s neon signs grew from one to six (in Sakae-machi and Hon-machi inside the old city); suzuran lamps reached Taiwan around 1930 and were taken down for metal from 1942.',
    evidence: ['fujii-taipei-cinema-league', 'taipower-suzuran-lamp', 'taipower-history-03-electric-light'],
    reconstructed: '太平町、大稻埕有沒有霓虹燈與鈴蘭燈：查無資料，所以這次沒有加霓虹招牌；窗光的顏色是歷史情境重建。',
    reconstructedEn: 'Whether Taiheichō and Dadaocheng had neon signs or suzuran lamps: no record found, so no neon signs are added; the colour of window light is historical reconstruction.',
  },
  postwar: {
    glow: 1.0,
    lanternGlow: 0.85,
    windowTint: '#e9f1ff',
    tintAmount: 0.4,
    electric: true,
    note: '臺北的路燈由白熱燈、日光燈到水銀燈（只有順序，沒有年份）；1960 年前後臺灣電氣化率超過五成。店裡的白色日光燈管讓窗光偏冷白。',
    noteEn: 'Taipei’s street lamps went from incandescent to fluorescent to mercury vapour (the order is recorded, not the years); Taiwan passed 50% electrification around 1960. White fluorescent tubes in shops make the window light a cooler white.',
    evidence: ['taipei-pkl-streetlight-history', 'storystudio-first-electric-light'],
    reconstructed: '日光燈、水銀燈在大稻埕出現的年份與店家用日光燈的情形：歷史情境重建。',
    reconstructedEn: 'When fluorescent and mercury lamps appeared in Dadaocheng, and shops’ use of fluorescent tubes: historical reconstruction.',
  },
  revival: {
    glow: 1.0,
    lanternGlow: 0.85,
    windowTint: '#ffc98a',
    tintAmount: 0.3,
    electric: true,
    note: '臺北市 16 萬多盞路燈 2018 年換成 LED；迪化街夜裡是照在老洋樓上的暖黃燈光，碼頭的貨櫃市集點燈。',
    noteEn: 'Taipei replaced its 160,000-plus street lamps with LEDs in 2018; at night Dihua Street has warm yellow light on its old Western-style buildings, and the container market at the wharf is lit up.',
    evidence: ['ltn-2018-taipei-led', 'taipei-pkl-streetlight-history', 'udn-2026-dadaocheng-riverside'],
    reconstructed: '迪化街歷史街區路燈的款式：查無資料，歷史情境重建。',
    reconstructedEn: 'The style of the heritage street lamps on Dihua Street: no record found, historical reconstruction.',
  },
}

export function nightEra(eraId) {
  return NIGHT_ERAS[eraId] ?? NIGHT_ERAS.revival
}

/** 夜晚的數值（純函式；amount ≤ 0 時原樣回傳）。glow、lanternGlow 依年代（eraNight） */
export function nightNumber(key, value, amount, eraNight = null) {
  if (!(amount > 0)) return value
  const t = Math.min(1, amount)
  let target = NIGHT_LOOK.to[key]
  if (eraNight && (key === 'glow' || key === 'lanternGlow')) target = eraNight[key]
  let v = value
  if (target !== undefined) v = value + (target - value) * t
  const m = NIGHT_LOOK.mul[key]
  if (m !== undefined) v *= 1 + (m - 1) * t
  return v
}

/** 夜晚時精緻畫質的光暈（bloom）再加強多少（燈籠、路燈的光暈） */
export const NIGHT_BLOOM = 0.25
