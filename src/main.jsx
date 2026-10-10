import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { cameraState, playerState } from './game/runtime.js'
import { transitionState } from './game/transition.js'
import { useGameStore } from './state/useGameStore.js'
import './styles/global.css'

// 開發模式下提供除錯用的全域物件（正式版不會包含）
if (import.meta.env.DEV) {
  window.__DDC__ = { useGameStore, playerState, cameraState, transitionState }
}

// 註：不使用 <StrictMode>。開發模式的重複掛載會讓 Drei <Html>（店家提示框）
// 建立的 React root 被同步卸載而清空內容。
createRoot(document.getElementById('root')).render(<App />)
