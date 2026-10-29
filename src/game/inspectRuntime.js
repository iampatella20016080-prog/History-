import { newInspectState } from './objectInspect.js'

/**
 * 器物檢視的即時狀態（可變物件，不放 zustand：拖曳與動作進度每個影格都在變，
 * 不應觸發 React 重新渲染；做法同 runtime.js 的角色與鏡頭狀態）。
 *
 * UI（InspectOverlay）以 objectInspect.js 的純函式更新 value；
 * 3D 舞台（ObjectStage）每個影格讀取並推進動作進度。
 */
export const inspectRuntime = {
  value: newInspectState(),
}

export function resetInspectRuntime() {
  inspectRuntime.value = newInspectState()
}
