import { create } from 'zustand'
import { DEFAULT_ERA_ID, getEra } from '../data/eras.js'
import { getShop } from '../data/shops.js'

/** 網址可指定一開始的年代，例如 ?era=modern */
function initialEra() {
  if (typeof window === 'undefined') return DEFAULT_ERA_ID
  const id = new URLSearchParams(window.location.search).get('era')
  return id && getEra(id) ? id : DEFAULT_ERA_ID
}

function detectTouch() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 1
}

/**
 * 遊戲狀態（React UI 與 3D 場景共用）
 *
 * mode
 *   explore ── 自由探索街道
 *   focus   ── 按下 E（或點「探索店家」）後，鏡頭正移向店面（角色暫停）
 *   reading ── 店家介紹視窗開啟中
 *
 * 年代
 *   eraId          目前畫面上的年代
 *   eraTransition  進行中的年代轉場 { from, to, nonce }（沒有時為 null）
 *   titleCard      畫面中央的章節標題 { eraId, nonce }
 *
 * 需要每一影格讀取的資料（角色座標、鏡頭角度）不放在這裡，
 * 改用 game/runtime.js 的可變物件，避免觸發 React 重新渲染。
 */
export const useGameStore = create((set, get) => ({
  started: false,
  eraId: initialEra(),
  eraTransition: null,
  transitioning: false,
  titleCard: null,
  worldReady: false,
  mode: 'explore',
  nearbyShopId: null,
  activeShopId: null,
  chapterIndex: 0,
  menuOpen: false,
  visited: {},
  travel: null,
  inputMode: detectTouch() ? 'touch' : 'mouse',

  start: () => {
    if (get().started) return
    set((state) => ({ started: true, titleCard: { eraId: state.eraId, nonce: (state.titleCard?.nonce ?? 0) + 1 } }))
  },

  setWorldReady: (ready) => set({ worldReady: ready }),

  setInputMode: (inputMode) => {
    if (get().inputMode !== inputMode) set({ inputMode })
  },

  setNearbyShop: (id) => {
    if (get().nearbyShopId !== id) set({ nearbyShopId: id })
  },

  /** 玩家在店家附近按下 E 或點「探索店家」 */
  interact: () => {
    const { started, mode, nearbyShopId, transitioning } = get()
    if (!started || mode !== 'explore' || !nearbyShopId || transitioning) return
    if (getShop(nearbyShopId)?.status === 'open') get().openShop(nearbyShopId)
  },

  openShop: (id) =>
    set((state) => ({
      mode: 'focus',
      activeShopId: id,
      chapterIndex: 0,
      menuOpen: false,
      visited: { ...state.visited, [id]: true },
    })),

  /** 鏡頭抵達店面後顯示介紹視窗 */
  revealStory: () => {
    if (get().mode === 'focus') set({ mode: 'reading' })
  },

  closeShop: () => {
    if (get().mode !== 'explore') set({ mode: 'explore', activeShopId: null })
  },

  setChapter: (index) => set({ chapterIndex: index }),

  toggleMenu: (open) => set((state) => ({ menuOpen: open ?? !state.menuOpen })),

  /** 從選單前往店家：角色移動到店門口 */
  travelToShop: (id) =>
    set((state) => ({
      travel: { shopId: id, nonce: (state.travel?.nonce ?? 0) + 1 },
      menuOpen: false,
    })),

  /** 切換年代（時間軸）：轉場進行中或閱讀介紹時不接受新的切換 */
  requestEra: (id) => {
    const { eraId, transitioning, mode, worldReady } = get()
    if (!getEra(id) || transitioning || !worldReady || mode !== 'explore') return false
    if (id === eraId) return false
    set((state) => ({
      eraTransition: { from: eraId, to: id, nonce: (state.eraTransition?.nonce ?? 0) + 1 },
      transitioning: true,
      titleCard: { eraId: id, nonce: (state.titleCard?.nonce ?? 0) + 1 },
      nearbyShopId: null,
      menuOpen: false,
    }))
    return true
  },

  /** 轉場中霧氣最濃時：街景換成新的年代 */
  swapEra: (id) => set({ eraId: id, nearbyShopId: null }),

  finishEraTransition: () => set({ transitioning: false, eraTransition: null }),
}))
