import { buildLinHuaTaiQing, linHuaTaiQingCollision } from '../linHuaTaiQing.js'
import { buildLinHuaTaiQingInterior } from '../linHuaTaiQingInterior.js'
import { buildLinHuaTaiEra, buildLinHuaTaiEraInterior, linHuaTaiEraCollision } from './linHuaTaiEras.js'

/**
 * 林華泰茶行（同一個店家 ID、同一個地段；建築樣式 'lin-hua-tai'）：依年代的 variant 換外殼與室內
 * （data/linHuaTaiEraConfig.js）。港口商街（qingPort）沿用第 10 階段的 linHuaTaiQing.js，
 * 其他四個年代在 linHuaTaiEras.js（器物清單見 data/linHuaTaiLayout.js）。
 */
const isQing = (config) => config.variant === 'qingPort'

export function buildLinHuaTai(b, config, detail) {
  return isQing(config) ? buildLinHuaTaiQing(b, config, detail) : buildLinHuaTaiEra(b, config, detail)
}

export function buildLinHuaTaiInterior(b, config, detail) {
  return isQing(config) ? buildLinHuaTaiQingInterior(b, config, detail) : buildLinHuaTaiEraInterior(b, config, detail)
}

export function linHuaTaiCollision(config, transform) {
  return isQing(config) ? linHuaTaiQingCollision(config, transform) : linHuaTaiEraCollision(config, transform)
}
