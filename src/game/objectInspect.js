/**
 * 器物 3D 檢視（純邏輯，不依賴 React／Three，可以直接單測）
 *
 * 器物畫在主畫面的同一個畫布（components/ObjectStage.jsx），沿用卡通材質與描邊；
 * 可以旋轉、縮放，並有開蓋、翻面、秤重之類的小動作。
 *
 * 這裡只管檢視的狀態：
 * - yaw／pitch 旋轉（拖曳）、zoom 縮放（滾輪或捏合）
 * - 每個小動作的進度 0–1（按一下做、再按一下還原），由每個影格的 update 往目標推進
 */

export const INSPECT_LIMITS = {
  minPitch: -1.2,
  maxPitch: 0.5,
  minZoom: 0.6,
  maxZoom: 2.4,
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** pitch：開始時的俯仰角（器物建模可以指定 viewPitch，例如扁平的粿印從上方看；省略時 -0.3） */
export function newInspectState({ pitch = -0.3 } = {}) {
  return { yaw: 0.6, pitch: clamp(pitch, INSPECT_LIMITS.minPitch, INSPECT_LIMITS.maxPitch), zoom: 1, spinning: true, actions: {} }
}

/** 拖曳旋轉（dx／dy 為螢幕位移換算的弧度）；碰過之後就不再自己慢慢轉 */
export function rotateInspect(state, dx, dy) {
  return {
    ...state,
    spinning: false,
    yaw: state.yaw + dx,
    pitch: clamp(state.pitch + dy, INSPECT_LIMITS.minPitch, INSPECT_LIMITS.maxPitch),
  }
}

/** 縮放（factor > 1 拉近） */
export function zoomInspect(state, factor) {
  return { ...state, zoom: clamp(state.zoom * factor, INSPECT_LIMITS.minZoom, INSPECT_LIMITS.maxZoom) }
}

/** 按一下小動作：做（目標 1）；再按一下：還原（目標 0） */
export function toggleInspectAction(state, id) {
  const current = state.actions[id] ?? { t: 0, target: 0 }
  return { ...state, actions: { ...state.actions, [id]: { ...current, target: current.target > 0.5 ? 0 : 1 } } }
}

/** 小動作目前的進度（0–1） */
export function inspectActionT(state, id) {
  return state.actions[id]?.t ?? 0
}

/**
 * 每個影格：把每個小動作的進度往目標推進（速度 speed／秒），沒碰過時慢慢自轉。
 * 進度都到位且不自轉時回傳原本的狀態（物件相同，表示不需要重畫）。
 */
export function updateInspect(state, dt, { speed = 2.2, spinSpeed = 0.25 } = {}) {
  let changed = false
  const actions = {}
  for (const [id, action] of Object.entries(state.actions)) {
    const t = clamp(action.t + Math.sign(action.target - action.t) * speed * dt, 0, 1)
    const settled = Math.abs(t - action.target) < 1e-4
    actions[id] = settled ? { t: action.target, target: action.target } : { t, target: action.target }
    if (actions[id].t !== action.t) changed = true
  }
  const yaw = state.spinning ? state.yaw + spinSpeed * dt : state.yaw
  if (!changed && yaw === state.yaw) return state
  return { ...state, yaw, actions }
}

/** 這件器物記進探索手記的條目 id */
export function objectJournalId(objectId) {
  return `object:${objectId}`
}
