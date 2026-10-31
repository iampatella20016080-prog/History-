/**
 * 畫質設定：兩種可隨時切換的模式（右上角齒輪）。
 *
 * - smooth 流暢（適合 iPad）：解析度上限 1.25、陰影貼圖 1024、關閉景深／光暈／環境遮蔽／空氣遠近感與光束、
 *          減少遠景裝飾與蒸氣粒子；保留基本陰影、漫畫描邊與所有年代建築。
 * - fine   精緻（適合電腦）：解析度上限 1.75（不超過裝置像素比）、陰影貼圖 2048、柔和陰影、
 *          適量環境遮蔽、非常輕微的光暈與輕微景深、空氣遠近感與斜陽光束、完整的遠景裝飾、燈光落點（燈照到地面與牆上，lightPools.js）、材質凹凸與河面倒映、天氣（雨天，weather.js）、隔岸天際線（oppositeBank.js）。
 *
 * 觸控裝置預設「流暢」、桌面電腦預設「精緻」；使用者的選擇記在 localStorage。
 * 切換後由 QualityController、Lighting、ToonRenderer 與各場景元件立即套用，不需要重新整理。
 * 網址參數 ?quality=smooth|fine 可指定模式（測試用；舊的 low／medium 視為 smooth、high 視為 fine）。
 */
export const QUALITY_MODES = {
  smooth: {
    id: 'smooth',
    label: '流暢',
    hint: '適合 iPad',
    dprMax: 1.25,
    dprMin: 0.8,
    shadowMapSize: 1024,
    shadowRadius: 1,
    msaa: 2,
    dofTaps: 0,
    ao: 0,
    bloom: 0,
    air: false,
    detail: false,
    // 店內透光（後牆漸層、假室內）：細節美觀類只在精緻畫質啟用，流暢畫質維持平面發光
    shopGlow: false,
    relief: false,
    waterReflection: 0,
    lightPools: false,
    // 天氣（雨天，第 14 階段）：流暢畫質沒有天氣選項，一律晴天（game/weather.js）
    weather: false,
    // 隔岸天際線（第 14 階段）：流暢畫質保留原本的遠景（遠山與河面）
    oppositeBank: false,
  },
  fine: {
    id: 'fine',
    label: '精緻',
    hint: '適合電腦',
    dprMax: 1.75,
    dprMin: 1,
    shadowMapSize: 2048,
    shadowRadius: 2.6,
    msaa: 4,
    dofTaps: 12,
    ao: 0.4,
    bloom: 0.16,
    air: true,
    detail: true,
    shopGlow: true,
    // 材質凹凸（磚縫、屋瓦、木紋、地磚、洗石子的法線貼圖，rendering/relief.js）
    relief: true,
    // 河面倒映：平面反射的解析度（相對畫面的比例；0 = 不做，rendering/planarReflection.js）
    waterReflection: 0.35,
    lightPools: true,
    // 天氣選項（晴／雨）：雨絲、屋簷滴水、濕地面與積水倒影、河面雨點、雨聲（game/weather.js）
    weather: true,
    // 隔岸天際線：對岸三重埔一帶依年代的低面數剪影、夜裡的燈火與河面倒影（game/oppositeBank.js）
    oppositeBank: true,
  },
}

export const QUALITY_STORAGE_KEY = 'ddc.qualityMode'

const LEGACY = { low: 'smooth', medium: 'smooth', high: 'fine' }

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return Boolean(window.matchMedia?.('(pointer: coarse)').matches) || (navigator.maxTouchPoints ?? 0) > 1
}

/** 依裝置的預設模式：觸控裝置（iPad）流暢、桌面電腦精緻 */
export function defaultQualityMode() {
  return isTouchDevice() ? 'smooth' : 'fine'
}

function readStored() {
  try {
    const value = window.localStorage.getItem(QUALITY_STORAGE_KEY)
    return QUALITY_MODES[value] ? value : null
  } catch {
    return null
  }
}

/** 開始時的模式：網址參數 > 使用者上次的選擇 > 裝置預設 */
export function initialQualityMode() {
  if (typeof window === 'undefined') return 'fine'
  const param = new URLSearchParams(window.location.search).get('quality')
  const fromParam = QUALITY_MODES[param] ? param : LEGACY[param]
  return fromParam ?? readStored() ?? defaultQualityMode()
}

export function saveQualityMode(id) {
  try {
    window.localStorage.setItem(QUALITY_STORAGE_KEY, id)
  } catch {
    // 私密瀏覽等情況下無法儲存，仍可在本次使用中切換
  }
}

function devicePixelRatio() {
  return typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
}

/** 某個模式的實際設定（解析度上限依裝置像素比限制） */
export function getQualitySettings(id) {
  const mode = QUALITY_MODES[id] ?? QUALITY_MODES.fine
  const ratio = devicePixelRatio()
  const dpr = Math.min(mode.dprMax, ratio)
  return { ...mode, dpr, dprMin: Math.min(mode.dprMin, dpr) }
}
