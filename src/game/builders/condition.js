import { Color } from 'three'

/**
 * 建築新舊程度：同一棟建築在不同年代以不同的色彩與髒污程度呈現。
 * new 新建｜mature 使用多年｜aged 老舊褪色｜restored 修復後潔淨明亮
 */
const _a = new Color()
const _b = new Color()
const WEATHERED = new Color('#9c958a')
const CLEAN = new Color('#ffffff')

export function conditionTint(hex, condition) {
  if (!hex) return hex
  _a.set(hex)
  if (condition === 'mature') {
    _a.multiplyScalar(0.97)
  } else if (condition === 'aged') {
    _b.copy(WEATHERED)
    _a.lerp(_b, 0.24).multiplyScalar(0.9)
  } else if (condition === 'restored') {
    _b.copy(CLEAN)
    _a.lerp(_b, 0.1)
  }
  return `#${_a.getHexString()}`
}

const GRIME_SCALE = { new: 1, mature: 1.3, aged: 2.0, restored: 0.45 }

export function conditionGrime(value, condition) {
  return Math.min(0.6, value * (GRIME_SCALE[condition] ?? 1))
}
