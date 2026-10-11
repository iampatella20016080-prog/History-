import { useEffect } from 'react'
import { ERAS } from '../data/eras.js'
import { getShop } from '../data/shops.js'
import { attachMoveInput, clearMoveInput } from '../game/input.js'
import { useGameStore } from '../state/useGameStore.js'

const REVEAL_DELAY = 750

/**
 * 全域鍵盤操作：
 * E 探索店家、Esc 關閉介紹或選單（觀賞模式隱藏介面時：重新顯示介面）、左右鍵切換章節、1–5 切換年代；
 * 並在按下 E 後等鏡頭移到店面，再開啟介紹視窗。
 */
export function useGameKeyboard() {
  useEffect(() => attachMoveInput(), [])

  useEffect(() => {
    const onKeyDown = (event) => {
      const store = useGameStore.getState()
      if (event.code === 'KeyE' && !event.repeat) {
        const shop = store.nearbyShopId ? getShop(store.nearbyShopId) : null
        if (store.started && store.mode === 'explore' && store.viewMode === 'explore' && shop?.status === 'open' && !store.transitioning) {
          event.preventDefault()
          store.openShop(store.nearbyShopId)
        }
      } else if (/^Digit[1-5]$/.test(event.code) && !event.repeat && store.started) {
        const era = ERAS[Number(event.code.slice(5)) - 1]
        if (era) store.requestEra(era.id)
      } else if (event.code === 'Escape') {
        if (store.uiHidden) store.setUiHidden(false)
        else if (store.mode !== 'explore') store.closeShop()
        else if (store.menuOpen) store.toggleMenu(false)
      } else if (store.mode === 'reading' && (event.code === 'ArrowRight' || event.code === 'ArrowLeft')) {
        event.preventDefault()
        const delta = event.code === 'ArrowRight' ? 1 : -1
        const count = getShop(store.activeShopId)?.chapters.length ?? 1
        store.setChapter(Math.max(0, Math.min(count - 1, store.chapterIndex + delta)))
      } else if (!store.started && event.code === 'Enter' && event.target === document.body) {
        store.start()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // 按下 E 之後：停止角色移動，等鏡頭靠近店面再顯示介紹
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (state.mode === previous.mode) return
        if (state.mode === 'focus') {
          clearMoveInput()
          const timer = setTimeout(() => useGameStore.getState().revealStory(), REVEAL_DELAY)
          const unsubscribe = useGameStore.subscribe((next) => {
            if (next.mode !== 'focus') {
              clearTimeout(timer)
              unsubscribe()
            }
          })
        }
      }),
    [],
  )
}
