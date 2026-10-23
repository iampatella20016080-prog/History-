/**
 * 依距離顯示／隱藏（人物、店裡的貓、室內細部）：加上遲滯（hysteresis），
 * 走近到 show 以內才顯示、退到 show + margin 以外才隱藏。
 * 在臨界距離附近來回走動時不會每個影格切換一次，造成閃爍。（純函式，不依賴 React／Three，可以直接單測）
 */
import { flickerDebugState } from './debugFlicker.js'

export const VISIBILITY_MARGIN = 2

export function hysteresisVisible(wasVisible, distance, show, margin = VISIBILITY_MARGIN) {
  // 閃爍除錯：關閉距離切換時一律顯示
  if (flickerDebugState.lod) return true
  return wasVisible ? distance < show + margin : distance < show
}
