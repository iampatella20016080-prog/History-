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

/** 店家的某個資訊熱點（沒有或找不到時回傳 null） */
function hotspotOf(shop, hotspotId) {
  return (hotspotId && shop?.hotspots?.find((item) => item.id === hotspotId)) || null
}

/** 熱點對應的介紹章節（章節 id；找不到時從第一章開始） */
function hotspotChapterIndex(shop, hotspot) {
  return Math.max(0, shop.chapters?.findIndex((chapter) => chapter.id === hotspot.chapter) ?? 0)
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
 *   focus   ── 按下 E（或點店面）後，鏡頭正移向店面（角色暫停）
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
 * 觀看方式（與 mode 分開：mode 管店家介紹，viewMode 管鏡頭與角色）
 *   viewMode       'explore'（第三人稱探索）或 'viewer'（建築觀賞：角色暫停並隱藏，鏡頭自由環繞）
 *   uiHidden       觀賞模式的「隱藏介面」：只留 3D 街景（離開觀賞模式時自動恢復）
 *   viewerFocus    觀賞模式中要求鏡頭聚焦某家店的建築 { storeId, nonce }（店家名錄使用）
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
  /** 店家的資訊熱點（例如爐鍋咖啡的吧檯、扭蛋機）：附近的熱點與目前介紹開啟時的熱點 */
  nearbyHotspotId: null,
  activeShopId: null,
  activeHotspotId: null,
  chapterIndex: 0,
  menuOpen: false,
  visited: {},
  travel: null,
  inputMode: detectTouch() ? 'touch' : 'mouse',
  qualityMode: initialQualityMode(),
  qualityOpen: false,
  viewMode: 'explore',
  uiHidden: false,
  viewerFocus: null,

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

  setNearbyShop: (id, hotspotId = null) => {
    const state = get()
    if (state.nearbyShopId !== id || state.nearbyHotspotId !== hotspotId) set({ nearbyShopId: id, nearbyHotspotId: hotspotId })
  },

  /**
   * 玩家在已開放的店家附近按下 E 或點店面。
   * hotspotId：點到的是店裡的某個資訊熱點（例如扭蛋機）時，開啟那個熱點的章節；否則用附近的熱點。
   */
  interact: (hotspotId = null) => {
    const { started, mode, nearbyShopId, nearbyHotspotId, transitioning, viewMode } = get()
    if (!started || mode !== 'explore' || viewMode !== 'explore' || !nearbyShopId || transitioning) return
    if (getShop(nearbyShopId, get().eraId)?.status === 'open') get().openShop(nearbyShopId, hotspotId ?? nearbyHotspotId)
  },

  /** 開啟店家介紹（建築觀賞模式中不開啟故事）；hotspotId 省略時，若正在這家店的熱點附近就用那個熱點 */
  openShop: (id, hotspotId) => {
    const state = get()
    if (state.viewMode !== 'explore') return false
    const hotspot = hotspotOf(getShop(id, state.eraId), hotspotId === undefined && id === state.nearbyShopId ? state.nearbyHotspotId : hotspotId)
    set((state) => ({
      mode: 'focus',
      activeShopId: id,
      activeHotspotId: hotspot?.id ?? null,
      chapterIndex: hotspot ? hotspotChapterIndex(getShop(id, state.eraId), hotspot) : 0,
      menuOpen: false,
      qualityOpen: false,
      visited: { ...state.visited, [id]: true },
    }))
    return true
  },

  /** 鏡頭抵達店面後顯示介紹視窗 */
  revealStory: () => {
    if (get().mode === 'focus') set({ mode: 'reading' })
  },

  closeShop: () => {
    if (get().mode !== 'explore') set({ mode: 'explore', activeShopId: null, activeHotspotId: null })
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
   * 切換年代（設定選單、數字鍵）。轉場進行中、閱讀介紹時或選到目前的年代時不接受。
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
      nearbyHotspotId: null,
      menuOpen: false,
    })
    return requestId
  },

  /** 轉場中霧氣最濃時：街景換成新的年代（只接受目前這次轉場的 id） */
  swapEra: (transitionId, eraId) => {
    if (get().eraTransition?.id !== transitionId || !getEra(eraId)) return false
    set({ eraId, nearbyShopId: null, nearbyHotspotId: null })
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

  /**
   * 切換探索／建築觀賞模式。只有在開始探索、而且沒有開啟店家介紹時才能進入觀賞模式。
   * 切換時不會重新載入街景，也不會改動年代、畫質或音樂設定。
   */
  setViewMode: (viewMode) => {
    const state = get()
    if (viewMode === state.viewMode) return false
    if (viewMode === 'viewer') {
      if (!state.started || state.mode !== 'explore') return false
      set({ viewMode: 'viewer', uiHidden: false, nearbyShopId: null, nearbyHotspotId: null, menuOpen: false, viewerFocus: null })
      return true
    }
    if (viewMode === 'explore') {
      set({ viewMode: 'explore', uiHidden: false, viewerFocus: null })
      return true
    }
    return false
  },

  /** 觀賞模式的「隱藏介面」（只在觀賞模式有效） */
  setUiHidden: (hidden) => {
    const next = !!hidden && get().viewMode === 'viewer'
    if (get().uiHidden !== next) set({ uiHidden: next, qualityOpen: false, menuOpen: false })
  },

  /** 觀賞模式中，從店家名錄要求鏡頭聚焦某家店的建築 */
  focusBuilding: (storeId) => {
    if (get().viewMode !== 'viewer') return false
    set((state) => ({ viewerFocus: { storeId, nonce: (state.viewerFocus?.nonce ?? 0) + 1 }, menuOpen: false }))
    return true
  },
}))
