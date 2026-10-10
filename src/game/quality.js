/**
 * 畫質設定：依裝置決定解析度、陰影貼圖、反鋸齒與景深取樣數。
 *
 * - high   桌上型電腦（滑鼠操作）
 * - medium 平板（觸控、高像素密度螢幕，例如 iPad）：解析度上限較低，陰影貼圖減半
 * - low    效能不足時自動降級（或網址加上 ?quality=low）
 *
 * 執行中若畫面更新率過低，AdaptiveResolution 會再逐步降低解析度。
 */
const TIERS = {
  high: { name: 'high', dpr: [1, 1.5], shadowMapSize: 2048, msaa: 4, dofTaps: 12 },
  medium: { name: 'medium', dpr: [1, 1.3], shadowMapSize: 1024, msaa: 4, dofTaps: 8 },
  low: { name: 'low', dpr: [0.85, 1], shadowMapSize: 1024, msaa: 0, dofTaps: 0 },
}

let cached = null

function detectTier() {
  if (typeof window === 'undefined') return 'high'
  const param = new URLSearchParams(window.location.search).get('quality')
  if (param && TIERS[param]) return param
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const touch = navigator.maxTouchPoints > 1
  const smallMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4
  if (coarse || touch) return smallMemory ? 'low' : 'medium'
  return 'high'
}

export function getQuality() {
  if (!cached) cached = { ...TIERS[detectTier()] }
  return cached
}
