import { createStore } from 'zustand/vanilla'
import { getMusicTrack } from './musicTracks.js'

/**
 * 背景音樂管理（全站共用，不屬於任何 3D 場景元件，年代或畫質切換時不會被重建）
 *
 * - 依「已成功切換的年代」（遊戲狀態的 eraId）播放該年代的 15 秒循環曲；停在同一年代就一直循環。
 * - 循環使用 Web Audio 的 AudioBufferSourceNode（loop、loopStart、loopEnd），不以計時器重播；
 *   只有第一次進入與換曲時淡入淡出，換曲時新舊兩首交叉淡化 0.8 秒，之後停止並釋放舊音源。
 * - 快速連續切換年代時，只有最後一次請求會播放；過期的載入會被取消或忽略，不會疊播。
 * - 音檔先載入目前年代，其餘在需要時才載入並快取；載入失敗不影響年代切換，可重試。
 * - AudioContext 只在使用者操作（「開始探索」、「啟用音樂」、打開背景音樂開關）時建立或恢復，
 *   受瀏覽器阻擋時狀態為 blocked，介面顯示「啟用音樂」按鈕，不顯示假的播放狀態。
 * - 開啟店家故事時降到使用者音量的 40%；頁面進入背景時暫停，回來後只在原本有播放時恢復。
 * - 開關與音量存在 localStorage（ddc.music.enabled、ddc.music.volume），預設開啟、音量 25%。
 */
export const MUSIC_STORAGE = { enabled: 'ddc.music.enabled', volume: 'ddc.music.volume' }
export const DEFAULT_VOLUME = 0.25
export const CROSSFADE = 0.8 // 換曲的交叉淡化（秒）
export const FIRST_FADE_IN = 1.0 // 第一次進入的淡入（秒）
export const DUCK_RATIO = 0.4 // 開啟故事時的音量比例
const GAIN_RAMP = 0.25 // 調整音量、開關時的平滑時間（秒）
const DUCK_RAMP = 0.6

function readSettings(storage) {
  let enabled = true
  let volume = DEFAULT_VOLUME
  try {
    const e = storage?.getItem(MUSIC_STORAGE.enabled)
    if (e === 'false') enabled = false
    const v = Number.parseFloat(storage?.getItem(MUSIC_STORAGE.volume))
    if (Number.isFinite(v)) volume = Math.min(1, Math.max(0, v))
  } catch {
    // 無法讀取（私密瀏覽等），使用預設值
  }
  return { enabled, volume }
}

function writeSetting(storage, key, value) {
  try {
    storage?.setItem(key, String(value))
  } catch {
    // 無法儲存時仍可在本次使用中調整
  }
}

/**
 * @param {object} env 依賴（測試時替換）：
 *   createContext() → AudioContext；fetchAudio(url, signal) → ArrayBuffer；
 *   storage（localStorage）；doc（document）；resolveUrl(file) → 網址
 */
export function createAudioManager(env = {}) {
  const storage = env.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null)
  const doc = env.doc ?? (typeof document !== 'undefined' ? document : null)
  const createContext =
    env.createContext ??
    (() => {
      const Ctor = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null
      return Ctor ? new Ctor() : null
    })
  const fetchAudio =
    env.fetchAudio ??
    (async (url, signal) => {
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.arrayBuffer()
    })
  const resolveUrl = env.resolveUrl ?? ((file) => `${import.meta.env?.BASE_URL ?? '/'}${file}`)

  const initial = readSettings(storage)
  /** 介面讀取的狀態 */
  const store = createStore(() => ({
    enabled: initial.enabled,
    volume: initial.volume,
    // idle（尚未啟用）｜loading｜playing｜blocked（被瀏覽器阻擋）｜paused（頁面在背景）｜off（使用者關閉）｜error｜unsupported
    status: initial.enabled ? 'idle' : 'off',
    trackEraId: null,
    error: null,
  }))
  const set = (patch) => store.setState(patch)
  const get = () => store.getState()

  let ctx = null
  let master = null
  let current = null // { eraId, source, gain }
  const live = new Set() // 尚未停止的音源（含淡出中的舊音源）
  const buffers = new Map() // eraId → AudioBuffer
  const raw = new Map() // eraId → Promise<ArrayBuffer>（尚未解碼）
  const pending = new Map() // eraId → { controller, promise }
  let desiredEra = null
  let token = 0
  let ducked = false
  let hiddenWhilePlaying = false
  let unsubscribers = []
  let startedCount = 0 // 累計建立過的配樂音源數（測試用：確認沒有重播或疊播）

  const now = () => ctx?.currentTime ?? 0
  const targetGain = () => (get().enabled ? get().volume * (ducked ? DUCK_RATIO : 1) : 0)

  function rampParam(param, value, seconds) {
    const t = now()
    param.cancelScheduledValues(t)
    param.setValueAtTime(param.value, t)
    param.linearRampToValueAtTime(value, t + Math.max(0.01, seconds))
  }

  function ensureContext() {
    if (ctx) return ctx
    ctx = createContext()
    if (!ctx) {
      set({ status: 'unsupported' })
      return null
    }
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    // iOS 來電等情況會把 AudioContext 打斷；恢復失敗時改為等待使用者再點一次
    ctx.onstatechange = () => {
      if (!ctx) return
      if (ctx.state === 'running' && current && get().enabled && get().status === 'blocked') set({ status: 'playing' })
      else if (ctx.state !== 'running' && ctx.state !== 'closed' && get().status === 'playing' && !doc?.hidden) set({ status: 'blocked' })
    }
    return ctx
  }

  function abortStale(keepEra) {
    for (const [eraId, entry] of pending) {
      if (eraId === keepEra) continue
      entry.controller?.abort()
      pending.delete(eraId)
      raw.delete(eraId)
    }
  }

  /** 下載（不需要 AudioContext，可在使用者操作前先開始） */
  function download(eraId) {
    if (buffers.has(eraId)) return Promise.resolve(null)
    if (raw.has(eraId)) return raw.get(eraId)
    const track = getMusicTrack(eraId)
    if (!track) return Promise.reject(new Error(`沒有 ${eraId} 的配樂`))
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const promise = fetchAudio(resolveUrl(track.file), controller?.signal)
    raw.set(eraId, promise)
    pending.set(eraId, { controller, promise })
    promise.then(
      () => pending.delete(eraId),
      () => {
        pending.delete(eraId)
        raw.delete(eraId)
      },
    )
    return promise
  }

  function decode(data) {
    return new Promise((resolve, reject) => {
      // 舊版 Safari 只支援 callback 形式
      const result = ctx.decodeAudioData(data, resolve, reject)
      if (result && typeof result.then === 'function') result.then(resolve, reject)
    })
  }

  async function loadBuffer(eraId) {
    if (buffers.has(eraId)) return buffers.get(eraId)
    const data = await download(eraId)
    if (buffers.has(eraId)) return buffers.get(eraId)
    // decodeAudioData 會轉移（清空）ArrayBuffer，複製一份以免重試時失敗
    const buffer = await decode(data.slice(0))
    buffers.set(eraId, buffer)
    raw.delete(eraId)
    return buffer
  }

  function stopSource(entry, at) {
    try {
      entry.source.stop(at)
    } catch {
      // 已經停止
    }
  }

  function startTrack(eraId, buffer) {
    const track = getMusicTrack(eraId)
    const t = now()
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(master)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.loopStart = track.loopStart
    source.loopEnd = track.loopEnd
    source.connect(gain)
    const entry = { eraId, source, gain, startedAt: t }
    live.add(entry)
    startedCount++
    source.onended = () => {
      live.delete(entry)
      try {
        source.disconnect()
        gain.disconnect()
      } catch {
        // 已中斷連線
      }
    }
    // 從曲首（循環起點）開始播放
    source.start(t, track.loopStart)
    const fadeIn = current ? CROSSFADE : FIRST_FADE_IN
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(1, t + fadeIn)

    // 舊曲淡出後停止；若還有更早、仍在淡出的音源，立即收掉，最多只會有兩首短暫重疊
    for (const other of live) {
      if (other === entry) continue
      if (other === current) {
        rampParam(other.gain.gain, 0, CROSSFADE)
        stopSource(other, t + CROSSFADE + 0.05)
      } else {
        rampParam(other.gain.gain, 0, 0.05)
        stopSource(other, t + 0.08)
      }
    }
    current = entry
    set({ trackEraId: eraId })
  }

  function applyMaster(seconds = GAIN_RAMP) {
    if (master) rampParam(master.gain, targetGain(), seconds)
  }

  function refreshStatus() {
    if (!get().enabled) return set({ status: 'off' })
    if (!ctx) return set({ status: 'idle' })
    if (doc?.hidden) return set({ status: 'paused' })
    if (ctx.state !== 'running') return set({ status: 'blocked' })
    if (current && current.eraId === desiredEra) return set({ status: 'playing', error: null })
  }

  /** 播放目前年代（換曲、重試、恢復時呼叫） */
  async function sync() {
    const eraId = desiredEra
    if (!eraId || !ctx || !get().enabled) return
    if (current?.eraId === eraId) {
      refreshStatus()
      return
    }
    const request = ++token
    abortStale(eraId)
    if (!buffers.has(eraId)) set({ status: 'loading', error: null })
    try {
      const buffer = await loadBuffer(eraId)
      // 過期的請求：年代已經又換了、音樂被關閉，或有更新的請求
      if (request !== token || eraId !== desiredEra || !get().enabled || !ctx) return
      if (current?.eraId === eraId) return
      startTrack(eraId, buffer)
      applyMaster()
      refreshStatus()
    } catch (error) {
      if (error?.name === 'AbortError' || request !== token) return
      set({ status: 'error', error: '背景音樂載入失敗' })
    }
  }

  /** 使用者操作時呼叫（必須在點擊事件中同步執行，iPad Safari 才允許發聲） */
  function unlock() {
    if (!get().enabled) return
    if (!ensureContext()) return
    // iOS：在使用者操作中播放一段極短的無聲緩衝，確保音訊輸出被啟用
    try {
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate || 44100)
      const source = ctx.createBufferSource()
      source.buffer = silent
      source.connect(ctx.destination)
      source.start(0)
    } catch {
      // 忽略
    }
    hiddenWhilePlaying = false
    const resumed = ctx.state === 'running' ? Promise.resolve() : Promise.resolve(ctx.resume?.())
    resumed
      .catch(() => {})
      .then(() => {
        if (!ctx) return
        if (ctx.state !== 'running') {
          set({ status: 'blocked' })
          return
        }
        applyMaster()
        refreshStatus()
        sync()
      })
  }

  function setEnabled(enabled) {
    writeSetting(storage, MUSIC_STORAGE.enabled, enabled)
    set({ enabled })
    if (enabled) {
      unlock()
      return
    }
    // 關閉：淡出後停止音源並暫停 AudioContext（不在背景偷偷播放）
    token++
    abortStale(null)
    if (ctx && master) {
      applyMaster(GAIN_RAMP)
      const t = now()
      for (const entry of live) stopSource(entry, t + GAIN_RAMP + 0.05)
      current = null
      const ref = ctx
      setTimeout(() => {
        if (ctx === ref && !get().enabled) ref.suspend?.().catch(() => {})
      }, (GAIN_RAMP + 0.1) * 1000)
    }
    set({ status: 'off', trackEraId: null })
  }

  function setVolume(volume) {
    const value = Math.min(1, Math.max(0, Number(volume) || 0))
    writeSetting(storage, MUSIC_STORAGE.volume, value)
    set({ volume: value })
    applyMaster(0.08)
  }

  function setDucked(value) {
    if (ducked === value) return
    ducked = value
    applyMaster(DUCK_RAMP)
  }

  /** 已成功切換的年代 */
  function setEra(eraId) {
    if (eraId === desiredEra && (current?.eraId === eraId || pending.has(eraId))) return
    desiredEra = eraId
    if (!ctx) {
      // 尚未啟用：先下載目前年代的音檔，使用者按下「開始探索」後立即可播
      if (get().enabled) download(eraId).catch(() => {})
      return
    }
    if (doc?.hidden) return
    sync()
  }

  function retry() {
    set({ error: null })
    if (!ctx || ctx.state !== 'running') unlock()
    else sync()
  }

  function onVisibilityChange() {
    if (!ctx) return
    if (doc.hidden) {
      hiddenWhilePlaying = ctx.state === 'running' && Boolean(current) && get().enabled
      if (ctx.state === 'running') ctx.suspend?.().catch(() => {})
      if (get().enabled) set({ status: 'paused' })
      return
    }
    if (!get().enabled) return
    if (!hiddenWhilePlaying) {
      // 原本就沒有在播放（例如被阻擋）：維持原狀，等使用者點擊
      if (get().status === 'paused') set({ status: ctx.state === 'running' ? 'playing' : 'blocked' })
      return
    }
    hiddenWhilePlaying = false
    Promise.resolve(ctx.resume?.())
      .catch(() => {})
      .then(() => {
        if (!ctx || doc.hidden) return
        if (ctx.state !== 'running') set({ status: 'blocked' })
        else {
          refreshStatus()
          sync()
        }
      })
  }

  /**
   * 連接遊戲狀態：開始探索（使用者操作，啟用 AudioContext）、年代（只看已成功切換的 eraId）
   * 與故事視窗（降低音量）。畫質、選單、角色移動都不會影響音樂。
   * 「開始探索」的點擊或 Enter 鍵會同步觸發這裡的訂閱，因此仍在使用者操作之中，iPad 允許發聲。
   */
  function connect(gameStore) {
    disconnect()
    const state = gameStore.getState()
    setDucked(state.mode !== 'explore')
    setEra(state.eraId)
    unsubscribers.push(
      gameStore.subscribe((next, prev) => {
        if (next.started && !prev.started) unlock()
        if (next.eraId !== prev.eraId) setEra(next.eraId)
        if (next.mode !== prev.mode) setDucked(next.mode !== 'explore')
      }),
    )
    if (doc?.addEventListener) {
      doc.addEventListener('visibilitychange', onVisibilityChange)
      unsubscribers.push(() => doc.removeEventListener('visibilitychange', onVisibilityChange))
    }
  }

  function disconnect() {
    for (const off of unsubscribers) off()
    unsubscribers = []
  }

  /** 目前的實際狀態（測試與除錯用） */
  function inspect() {
    return {
      ...get(),
      contextState: ctx?.state ?? null,
      desiredEra,
      currentEra: current?.eraId ?? null,
      liveSources: live.size,
      startedCount,
      masterTarget: targetGain(),
      ducked,
      cached: [...buffers.keys()],
      loading: [...pending.keys()],
      loop: current ? { loop: current.source.loop, loopStart: current.source.loopStart, loopEnd: current.source.loopEnd } : null,
      startedAt: current?.startedAt ?? null,
      currentTime: ctx?.currentTime ?? null,
    }
  }

  /** 在總音量之後接一個分析節點（自動化測試量測實際輸出用） */
  function tap() {
    if (!ctx || !master) return null
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    master.connect(analyser)
    return analyser
  }

  return { store, connect, disconnect, unlock, setEnabled, setVolume, setDucked, setEra, retry, inspect, tap, onVisibilityChange }
}

/** 全站共用的背景音樂 */
export const audioManager = createAudioManager()
