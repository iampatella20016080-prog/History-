import { Vector2 } from 'three'
import { windDirection, windStrength } from '../motion.js'

/**
 * 整條街共用的風（著色器 uniform）：布幡、遮雨棚、煙與落葉讀同一組值，一陣風吹過時一起動。
 * 每個影格由 EraScene 的 WindClock 更新一次。
 */
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.5 },
  uWindDir: { value: new Vector2(1, 0) },
}

export function updateWind(t) {
  windUniforms.uTime.value = t
  windUniforms.uWind.value = windStrength(t)
  const [x, z] = windDirection(t)
  windUniforms.uWindDir.value.set(x, z)
}
