import { useEffect } from 'react'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 觸控裝置（iPad Safari）相關的全域處理：
 * - 依最近一次的指標類型切換觸控／滑鼠介面（顯示或隱藏搖桿）
 * - 阻止 Safari 的雙指縮放整頁、雙擊放大與橡皮筋回彈，避免與遊戲操作衝突
 *   （介紹視窗等需要捲動的區域不受影響）
 */
export function useDeviceGuards() {
  useEffect(() => {
    const store = useGameStore.getState
    const onPointerDown = (event) => {
      if (event.pointerType === 'touch') store().setInputMode('touch')
      else if (event.pointerType === 'mouse') store().setInputMode('mouse')
    }
    const onKeyDown = (event) => {
      if (event.code?.startsWith('Key') || event.code?.startsWith('Arrow')) store().setInputMode('mouse')
    }
    const prevent = (event) => event.preventDefault()
    // 只有可捲動的內容區允許原生觸控捲動
    const onTouchMove = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
        return
      }
      // 音量滑桿需要原生的拖曳
      if (!event.target.closest?.('[data-scrollable], input[type="range"]')) event.preventDefault()
    }
    let lastTouchEnd = 0
    const onTouchEnd = (event) => {
      const now = Date.now()
      if (now - lastTouchEnd < 320 && !event.target.closest?.('a, input, textarea')) event.preventDefault()
      lastTouchEnd = now
    }
    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })
    window.addEventListener('keydown', onKeyDown, { capture: true, passive: true })
    document.addEventListener('gesturestart', prevent)
    document.addEventListener('gesturechange', prevent)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: false })
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      document.removeEventListener('gesturestart', prevent)
      document.removeEventListener('gesturechange', prevent)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
