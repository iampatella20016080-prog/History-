/**
 * 操作說明面板的收合邏輯（不依賴 React，可直接單測）。
 * 桌面版：第一次實際移動，或展開後約 12 秒無互動就自動收起；
 * 使用者手動切換後以手動為準（manual），不再自動收起。
 * 最後的狀態記在 sessionStorage，同一次造訪重新整理不再煩人。
 */

export const CONTROLS_IDLE_MS = 12000
export const CONTROLS_STORAGE_KEY = 'ddc.controlsHint'

/** 預設：觸控收起、桌面展開 */
export function defaultControlsState(touch) {
  return { collapsed: Boolean(touch), manual: false }
}

/** 第一次實際移動：桌面且尚未手動操作時收起 */
export function controlsOnMove(state, touch) {
  if (touch || state.manual || state.collapsed) return state
  return { ...state, collapsed: true }
}

/** 展開後無互動計時到：同上條件才收起 */
export function controlsOnIdle(state, touch) {
  return controlsOnMove(state, touch)
}

/** 使用者按切換鈕：以手動為準 */
export function controlsOnToggle(state) {
  return { collapsed: !state.collapsed, manual: true }
}

/** 面板是否需要啟動無互動計時 */
export function controlsNeedsIdleTimer(state, touch) {
  return !touch && !state.manual && !state.collapsed
}

function getStorage() {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

/** 讀取本次造訪的狀態；沒有、壞掉或無法讀取時退回預設 */
export function loadControlsState(touch, storage = getStorage()) {
  const fallback = defaultControlsState(touch)
  try {
    const raw = storage?.getItem(CONTROLS_STORAGE_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    if (typeof data?.collapsed !== 'boolean') return fallback
    return { collapsed: data.collapsed, manual: data.manual === true }
  } catch {
    return fallback
  }
}

/** 寫入失敗不影響操作 */
export function saveControlsState(state, storage = getStorage()) {
  try {
    storage?.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* 隱私模式或儲存空間滿：略過 */
  }
}
