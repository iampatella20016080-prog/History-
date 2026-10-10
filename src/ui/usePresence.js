import { useEffect, useState } from 'react'

/**
 * 讓元件在關閉時保留到離場動畫結束。
 * 進場與離場都以 CSS @keyframes 處理（不依賴 requestAnimationFrame 的時序）。
 * 回傳 mounted（是否渲染）與 state（'open' | 'closing'）。
 */
export function usePresence(open, exitDuration = 320) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return undefined
    }
    const timer = setTimeout(() => setMounted(false), exitDuration)
    return () => clearTimeout(timer)
  }, [open, exitDuration])

  return { mounted: mounted || open, state: open ? 'open' : 'closing' }
}
