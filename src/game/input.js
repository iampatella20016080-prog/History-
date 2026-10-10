/**
 * 鍵盤移動輸入（WASD／方向鍵、Shift 快走）
 *
 * 只記錄按鍵狀態，由角色控制器在每一影格讀取。
 * 視窗失焦或分頁切換時會清除所有按鍵，避免角色卡在行走狀態。
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
  for (const key of Object.keys(moveInput)) moveInput[key] = false
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
