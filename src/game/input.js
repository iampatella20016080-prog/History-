/**
 * 移動輸入：鍵盤（WASD／方向鍵、Shift 快走）與觸控搖桿（類比輸入）
 *
 * 只記錄輸入狀態，由角色控制器在每一影格讀取。
 * 視窗失焦或分頁切換時會清除所有輸入，避免角色卡在行走狀態。
 *
 * 搖桿：stickX（右為正）、stickY（前為正），範圍 -1–1，推得越遠走得越快。
 */
const KEY_ACTIONS = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
}

export const moveInput = {
  forward: false,
  back: false,
  left: false,
  right: false,
  run: false,
  stickX: 0,
  stickY: 0,
}

function isTypingTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function handleKeyDown(event) {
  const action = KEY_ACTIONS[event.code]
  if (!action || isTypingTarget(event.target)) return
  moveInput[action] = true
  if (event.code.startsWith('Arrow')) event.preventDefault()
}

function handleKeyUp(event) {
  const action = KEY_ACTIONS[event.code]
  if (action) moveInput[action] = false
}

export function clearMoveInput() {
  for (const key of Object.keys(moveInput)) moveInput[key] = typeof moveInput[key] === 'number' ? 0 : false
}

/** 觸控搖桿寫入類比輸入 */
export function setStick(x, y) {
  moveInput.stickX = x
  moveInput.stickY = y
}

export function attachMoveInput() {
  const onVisibility = () => {
    if (document.hidden) clearMoveInput()
  }
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', clearMoveInput)
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', clearMoveInput)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
