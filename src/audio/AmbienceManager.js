import { createStore } from 'zustand/vanilla'
import {
  AMBIENCE_DEFAULT_VOLUME,
  AMBIENCE_SOUNDS,
  AMBIENCE_STORAGE,
  FADE,
  LOOP_PAD,
  UPDATE_INTERVAL,
  masterRamp,
  masterTarget,
  planTracks,
  getEraAmbience,
} from './ambienceCore.js'

/**
 * 環境音管理（與背景音樂分開：自己的 AudioContext、開關與音量；全站只有一個，不屬於任何 3D 元件）
 *
 * - 每個年代一組環境聲（見 ambienceCore.js）；位置相關的聲音依人物距離調整 gain，每 0.25 秒更新一次，
 *   同時最多 4 個聲軌（iPad Safari），其餘的等有空位或距離變近時才建立。
 * - 年代轉場：開始轉場（store.transitioning）就把總音量淡出；街景換上後（store.eraId 改變）
 *   停掉不屬於新年代的聲軌，兩個年代共有的聲音（河水、人聲）不中斷；轉場結束後總音量淡入。
 * - AudioContext 只在「開始探索」或打開環境音開關（使用者操作）時建立、恢復，沿用背景音樂的作法；
 *   被瀏覽器阻擋時狀態為 blocked，不顯示假的播放狀態。頁面進入背景時暫停。
 * - 開關與音量存在 localStorage（ddc.ambience.enabled、ddc.ambience.volume），預設開啟、音量 60%。
 */
function readSettings(storage) {
  let enabled = true
  let volume = AMBIENCE_DEFAULT_VOLUME
  try {
    if (storage?.getItem(AMBIENCE_STORAGE.enabled) === 'false') enabled = false
    const v = Number.parseFloat(storage?.getItem(AMBIENCE_STORAGE.volume))
    if (Number.isFinite(v)) volume = Math.min(1, Math.max(0, v))
  } catch {
    // 無法讀取時使用預設值
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

const RETRY_AFTER = 10 // 載入失敗後多久才再試（秒）

/**
 * @param {object} env 依賴（測試時替換）：createContext、fetchAudio(url, signal)、storage、doc、
 *   getPosition() → {x, z}、resolveUrl(file)、setInterval／clearInterval
 */
export function createAmbienceManager(env = {}) {
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
  const timers = { set: env.setInterval ?? globalThis.setInterval?.bind(globalThis), clear: env.clearInterval ?? globalThis.clearInterval?.bind(globalThis) }

  const initial = readSettings(storage)
  const store = createStore(() => ({
    enabled: initial.enabled,
    volume: initial.volume,
    // idle（尚未啟用）｜playing｜blocked｜paused（頁面在背景）｜off｜error｜unsupported
    status: initial.enabled ? 'idle' : 'off',
    eraId: null,
  }))
  const set = (patch) => store.setState(patch)
  const get = () => store.getState()

  let ctx = null
  let master = null
  const tracks = new Map() // id → { id, source?, gain?, starting, stopAt? }
  const buffers = new Map()
  const loading = new Map()
  const failed = new Map() // id → 可再試的時間（ctx 時間）
  let eraId = null
  let transitioning = false
  let story = false
  let music = false
  let getPosition = env.getPosition ?? (() => ({ x: 0, z: 0 }))
  let timer = null
  let unsubscribers = []
  let hiddenWhilePlaying = false
  let everFaded = false
  let startedCount = 0
  let lastMasterTarget = 0

  const now = () => ctx?.currentTime ?? 0

  function ramp(param, value, seconds) {
    const t = now()
    param.cancelScheduledValues(t)
    param.setValueAtTime(param.value, t)
    param.linearRampToValueAtTime(value, t + Math.max(0.01, seconds))
  }

  function applyMaster(secondsOverride) {
    if (!master) return
    const to = masterTarget({ enabled: get().enabled, volume: get().volume, transitioning, story, music })
    const seconds = secondsOverride ?? masterRamp({ from: lastMasterTarget, to, first: !everFaded })
    if (to > 0) everFaded = true
    lastMasterTarget = to
    ramp(master.gain, to, seconds)
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
    ctx.onstatechange = () => {
      if (!ctx) return
      if (ctx.state === 'running' && get().enabled && get().status === 'blocked') set({ status: 'playing' })
      else if (ctx.state !== 'running' && ctx.state !== 'closed' && get().status === 'playing' && !doc?.hidden) set({ status: 'blocked' })
    }
    return ctx
  }

  function decode(data) {
    return new Promise((resolve, reject) => {
      const result = ctx.decodeAudioData(data, resolve, reject)
      if (result && typeof result.then === 'function') result.then(resolve, reject)
    })
  }

  function loadBuffer(id) {
    if (buffers.has(id)) return Promise.resolve(buffers.get(id))
    if (loading.has(id)) return loading.get(id)
    const sound = AMBIENCE_SOUNDS[id]
    const promise = (async () => {
      const data = await fetchAudio(resolveUrl(sound.file))
      const buffer = await decode(data.slice(0))
      buffers.set(id, buffer)
      return buffer
    })()
    loading.set(id, promise)
    const done = () => loading.delete(id)
    promise.then(done, done)
    return promise
  }

  function teardown(track) {
    tracks.delete(track.id)
    if (!track.source) return
    try {
      track.source.stop()
    } catch {
      // 已經停止
    }
    try {
      track.source.disconnect()
      track.gain.disconnect()
    } catch {
      // 已中斷連線
    }
  }

  function fadeOut(track, seconds) {
    if (track.stopAt !== undefined) return
    if (!track.source) {
      teardown(track) // 還在載入，直接取消
      return
    }
    ramp(track.gain.gain, 0, seconds)
    track.stopAt = now() + seconds + 0.05
  }

  async function startTrack(id) {
    const track = { id, starting: true }
    tracks.set(id, track)
    try {
      const buffer = await loadBuffer(id)
      if (tracks.get(id) !== track || !ctx) return
      const sound = AMBIENCE_SOUNDS[id]
      const gain = ctx.createGain()
      gain.gain.value = 0
      gain.connect(master)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.loopStart = LOOP_PAD
      source.loopEnd = LOOP_PAD + sound.duration
      source.connect(gain)
      source.start(now(), LOOP_PAD)
      track.source = source
      track.gain = gain
      track.starting = false
      startedCount++
      if (get().status === 'error') set({ status: 'playing' })
      tick() // 立即套用音量
    } catch {
      if (tracks.get(id) === track) tracks.delete(id)
      failed.set(id, now() + RETRY_AFTER)
      if (!tracks.size && get().status === 'playing') set({ status: 'error' })
    }
  }

  /** 依年代與人物位置更新各聲軌（每 UPDATE_INTERVAL 秒一次） */
  function tick() {
    if (!ctx || !get().enabled || doc?.hidden || ctx.state !== 'running' || !eraId) return
    const t = now()
    for (const track of [...tracks.values()]) if (track.stopAt !== undefined && track.stopAt <= t) teardown(track)
    const { targets, start } = planTracks({ eraId, pos: getPosition(), live: tracks.keys() })
    for (const track of [...tracks.values()]) {
      if (!targets.has(track.id)) fadeOut(track, FADE.track)
      else if (track.stopAt !== undefined) {
        // 又回到範圍內：取消淡出
        track.stopAt = undefined
      }
    }
    for (const id of start) {
      if ((failed.get(id) ?? 0) > t) continue
      failed.delete(id)
      startTrack(id)
    }
    for (const [id, gain] of targets) {
      const track = tracks.get(id)
      if (track?.gain) ramp(track.gain.gain, gain, FADE.track)
    }
    if (get().status === 'idle' || get().status === 'blocked' || get().status === 'paused') set({ status: 'playing' })
  }

  function startTimer() {
    if (timer !== null || !timers.set) return
    timer = timers.set(tick, UPDATE_INTERVAL * 1000)
  }

  function stopTimer() {
    if (timer === null) return
    timers.clear?.(timer)
    timer = null
  }

  /** 使用者操作時呼叫（iPad Safari 要求在觸控或點擊中同步執行） */
  function unlock() {
    if (!get().enabled) return
    if (!ensureContext()) return
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
        set({ status: 'playing' })
        applyMaster()
        startTimer()
        tick()
      })
  }

  function setEnabled(enabled) {
    writeSetting(storage, AMBIENCE_STORAGE.enabled, enabled)
    set({ enabled })
    if (enabled) {
      unlock()
      return
    }
    stopTimer()
    if (ctx && master) {
      applyMaster(0.25)
      for (const track of [...tracks.values()]) fadeOut(track, 0.25)
      const ref = ctx
      setTimeout(() => {
        if (ctx !== ref || get().enabled) return
        for (const track of [...tracks.values()]) teardown(track)
        ref.suspend?.().catch(() => {})
      }, 400)
    }
    set({ status: 'off' })
  }

  function setVolume(volume) {
    const value = Math.min(1, Math.max(0, Number(volume) || 0))
    writeSetting(storage, AMBIENCE_STORAGE.volume, value)
    set({ volume: value })
    applyMaster(0.08)
  }

  function setStory(value) {
    if (story === value) return
    story = value
    applyMaster(FADE.story)
  }

  /** 背景音樂是否正在播放（播放中環境音退讓） */
  function setMusicActive(value) {
    if (music === value) return
    music = value
    applyMaster(FADE.story)
  }

  function setTransitioning(value) {
    if (transitioning === value) return
    transitioning = value
    applyMaster()
  }

  /** 街景已換成新年代：停掉不屬於新年代的聲軌，共有的聲音繼續 */
  function setEra(next) {
    if (next === eraId) return
    eraId = next
    set({ eraId: next })
    const keep = new Set(getEraAmbience(next).map((e) => e.sound))
    for (const track of [...tracks.values()]) if (!keep.has(track.id)) fadeOut(track, 0.1)
    tick()
  }

  function retry() {
    failed.clear()
    if (!ctx || ctx.state !== 'running') unlock()
    else tick()
  }

  function onVisibilityChange() {
    if (!ctx) return
    if (doc.hidden) {
      hiddenWhilePlaying = ctx.state === 'running' && get().enabled
      stopTimer()
      if (ctx.state === 'running') ctx.suspend?.().catch(() => {})
      if (get().enabled) set({ status: 'paused' })
      return
    }
    if (!get().enabled) return
    if (!hiddenWhilePlaying) {
      if (get().status === 'paused') set({ status: ctx.state === 'running' ? 'playing' : 'blocked' })
      return
    }
    hiddenWhilePlaying = false
    Promise.resolve(ctx.resume?.())
      .catch(() => {})
      .then(() => {
        if (!ctx || doc.hidden) return
        if (ctx.state !== 'running') {
          set({ status: 'blocked' })
          return
        }
        set({ status: 'playing' })
        startTimer()
        tick()
      })
  }

  /**
   * 連接遊戲狀態：started（使用者操作，啟用 AudioContext）、eraId（只看已成功切換的年代）、
   * transitioning（轉場時淡出／淡入）與 mode（閱讀故事時降低音量）。getPos 回傳人物的世界座標。
   */
  function connect(gameStore, getPos) {
    disconnect()
    if (getPos) getPosition = getPos
    const state = gameStore.getState()
    transitioning = Boolean(state.transitioning)
    story = state.mode !== 'explore'
    eraId = state.eraId
    set({ eraId })
    unsubscribers.push(
      gameStore.subscribe((next, prev) => {
        if (next.started && !prev.started) unlock()
        if (next.transitioning !== prev.transitioning) setTransitioning(Boolean(next.transitioning))
        if (next.eraId !== prev.eraId) setEra(next.eraId)
        if (next.mode !== prev.mode) setStory(next.mode !== 'explore')
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
    stopTimer()
  }

  /** 目前的實際狀態（測試與除錯用） */
  function inspect() {
    return {
      ...get(),
      contextState: ctx?.state ?? null,
      transitioning,
      story,
      music,
      masterTarget: lastMasterTarget,
      liveTracks: [...tracks.keys()],
      playingTracks: [...tracks.values()].filter((t) => t.source && t.stopAt === undefined).map((t) => t.id),
      startedCount,
      cached: [...buffers.keys()],
    }
  }

  return { store, connect, disconnect, unlock, setEnabled, setVolume, setEra, setMusicActive, retry, tick, inspect, onVisibilityChange }
}

/** 全站共用的環境音 */
export const ambienceManager = createAmbienceManager()
