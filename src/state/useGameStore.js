import { create } from 'zustand'
import { DEFAULT_ERA_ID, getEra } from '../data/eras.js'
import { getShop } from '../data/shops.js'
import { QUALITY_MODES, initialQualityMode, saveQualityMode } from '../game/quality.js'

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
 *   eraRequestSeq  年代切換請求的流水號：每次有效的請求加一，永遠不會重設
 *   eraTransition  進行中的年代轉場 { id, from, to }（id 即該次請求的流水號；沒有時為 null）
 *   transitioning  是否正在轉場（與 eraTransition 同步設定與清除）
 *   eraError       最近一次切換失敗的資訊 { id, eraId }（顯示提示用）
 *   titleCard      畫面中央的章節標題 { eraId, nonce }
 *
 * 畫質
 *   qualityMode    'smooth'（流暢）或 'fine'（精緻），記在 localStorage，切換後立即套用
 *
 * 轉場的每一步（換街景、結束、回報錯誤）都必須帶著該次請求的 id，
 * 與目前的 eraTransition.id 相符才會生效，過期的呼叫一律忽略。
 *
 * 需要每一影格讀取的資料（角色座標、鏡頭角度）不放在這裡，
 * 改用 game/runtime.js 的可變物件，避免觸發 React 重新渲染。
 */
export const useGameStore = create((set, get) => ({
  started: false,
  eraId: initialEra(),
  eraRequestSeq: 0,
  eraTransition: null,
  transitioning: false,
  eraError: null,
  titleCard: null,
  titleSeq: 0,
  worldReady: false,
  mode: 'explore',
  nearbyShopId: null,
  activeShopId: null,
  chapterIndex: 0,
  menuOpen: false,
  visited: {},
  travel: null,
  inputMode: detectTouch() ? 'touch' : 'mouse',
  qualityMode: initialQualityMode(),
  qualityOpen: false,

  start: () => {
    if (get().started) return
    set((state) => ({
      started: true,
      titleSeq: state.titleSeq + 1,
      titleCard: { eraId: state.eraId, nonce: state.titleSeq + 1 },
    }))
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

  toggleMenu: (open) => set((state) => ({ menuOpen: open ?? !state.menuOpen, qualityOpen: false })),

  /** 從選單前往店家：角色移動到店門口 */
  travelToShop: (id) =>
    set((state) => ({
      travel: { shopId: id, nonce: (state.travel?.nonce ?? 0) + 1 },
      menuOpen: false,
    })),

  /**
   * 切換年代（時間軸、數字鍵）。轉場進行中、閱讀介紹時或選到目前的年代時不接受。
   * 接受時回傳這次請求的 id（流水號），否則回傳 false。
   */
  requestEra: (id) => {
    const { eraId, transitioning, mode, worldReady, eraRequestSeq, titleSeq } = get()
    if (!getEra(id) || transitioning || !worldReady || mode !== 'explore') return false
    if (id === eraId) return false
    const requestId = eraRequestSeq + 1
    set({
      eraRequestSeq: requestId,
      eraTransition: { id: requestId, from: eraId, to: id },
      transitioning: true,
      eraError: null,
      titleSeq: titleSeq + 1,
      titleCard: { eraId: id, nonce: titleSeq + 1 },
      nearbyShopId: null,
      menuOpen: false,
    })
    return requestId
  },

  /** 轉場中霧氣最濃時：街景換成新的年代（只接受目前這次轉場的 id） */
  swapEra: (transitionId, eraId) => {
    if (get().eraTransition?.id !== transitionId || !getEra(eraId)) return false
    set({ eraId, nearbyShopId: null })
    return true
  },

  /** 轉場結束：解除鎖定，允許下一次切換（只接受目前這次轉場的 id） */
  finishEraTransition: (transitionId) => {
    if (get().eraTransition?.id !== transitionId) return false
    set({ transitioning: false, eraTransition: null })
    return true
  },

  /** 這次切換失敗（街景無法產生）：記錄錯誤供介面提示，轉場會退回原本的年代後結束 */
  reportEraError: (transitionId, eraId) => {
    if (get().eraTransition?.id !== transitionId) return false
    set({ eraError: { id: transitionId, eraId }, titleCard: null })
    return true
  },

  dismissEraError: () => set({ eraError: null }),

  /** 切換畫質模式（流暢／精緻）並記住選擇 */
  setQualityMode: (mode) => {
    if (!QUALITY_MODES[mode]) return false
    saveQualityMode(mode)
    if (get().qualityMode !== mode) set({ qualityMode: mode })
    return true
  },

  toggleQualityPanel: (open) => set((state) => ({ qualityOpen: open ?? !state.qualityOpen, menuOpen: false })),
}))
