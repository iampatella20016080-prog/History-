import { Vector2 } from 'three'
import { windDirection, windStrength } from '../motion.js'

/**
 * 整條街共用的風（著色器 uniform）：布幡、遮雨棚、煙與落葉讀同一組值，一陣風吹過時一起動。
 * 每個影格由 EraScene 的 WindClock 更新一次。
 * uMotion：精緻畫質為 1；流暢畫質為 0，布幡回到原本固定幅度的輕擺、遮雨棚不動（只改 uniform，不重新編譯）。
 */
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.5 },
  uWindDir: { value: new Vector2(1, 0) },
  uMotion: { value: 1 },
}

export function updateWind(t, enabled = true) {
  windUniforms.uTime.value = t
  windUniforms.uMotion.value = enabled ? 1 : 0
  windUniforms.uWind.value = windStrength(t)
  const [x, z] = windDirection(t)
  windUniforms.uWindDir.value.set(x, z)
}
