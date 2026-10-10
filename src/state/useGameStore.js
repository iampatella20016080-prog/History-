import { create } from 'zustand'
import { DEFAULT_ERA_ID } from '../data/eras.js'

/**
 * 遊戲狀態（React UI 與 3D 場景共用）
 *
 * mode
 *   explore ── 自由探索街道
 *   focus   ── 按下 E 後，鏡頭正移向店面（角色暫停）
 *   reading ── 店家介紹視窗開啟中
 *
 * 需要每一影格讀取的資料（角色座標、鏡頭角度）不放在這裡，
 * 改用 game/runtime.js 的可變物件，避免觸發 React 重新渲染。
 */
export const useGameStore = create((set, get) => ({
  started: false,
  eraId: DEFAULT_ERA_ID,
  mode: 'explore',
  nearbyShopId: null,
  activeShopId: null,
  chapterIndex: 0,
  menuOpen: false,
  visited: {},
  travel: null,

  start: () => set({ started: true }),

  setNearbyShop: (id) => {
    if (get().nearbyShopId !== id) set({ nearbyShopId: id })
  },

  /** 玩家在店家附近按下 E */
  interact: () => {
    const { started, mode, nearbyShopId } = get()
    if (started && mode === 'explore' && nearbyShopId) get().openShop(nearbyShopId)
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
}))
