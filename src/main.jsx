import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ambienceManager } from './audio/AmbienceManager.js'
import { audioManager } from './audio/AudioManager.js'
import { inspectRuntime } from './game/inspectRuntime.js'
import { cameraState, playerState } from './game/runtime.js'
import { transitionState } from './game/transition.js'
import { useGameStore } from './state/useGameStore.js'
import './styles/global.css'

// 背景音樂：在 3D 場景之外、全站只連接一次
audioManager.connect(useGameStore)
// 環境音：依人物位置調整音量；被瀏覽器阻擋時，下一次點擊或按鍵就是使用者操作，在那時恢復
ambienceManager.connect(useGameStore, () => playerState.position)
const resumeAmbience = () => {
  if (ambienceManager.store.getState().status === 'blocked') ambienceManager.unlock()
}
window.addEventListener('pointerdown', resumeAmbience, { passive: true })
window.addEventListener('keydown', resumeAmbience)

// 開發模式下提供除錯用的全域物件（正式版不會包含）
if (import.meta.env.DEV) {
  window.__DDC__ = { useGameStore, playerState, cameraState, transitionState, audioManager, ambienceManager, inspectRuntime }
}

// 註：不使用 <StrictMode>。開發模式的重複掛載會讓 Drei <Html>（店家提示框）
// 建立的 React root 被同步卸載而清空內容。
createRoot(document.getElementById('root')).render(<App />)
