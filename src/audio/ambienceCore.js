/**
 * 環境音的純邏輯（不依賴 React、Three 或 Web Audio，可直接單元測試）
 *
 * - AMBIENCE_SOUNDS：音檔表（全部是 tools/music/generate_ambience.py 合成的循環音，出處見 docs/research/ambience-sources.md）
 * - ERA_AMBIENCE：每個年代的聲音清單。`bed` 是整條街都聽得到的底噪；`spot` 有位置，
 *   依人物到錨點的距離調整音量（內圈全音量、外圈 0，之間平滑下降），只用 gain，不用 PannerNode
 * - planTracks：依年代與人物位置算出每個聲軌的目標音量，並限制同時播放的聲軌數（iPad Safari）
 */
export const AMBIENCE_STORAGE = { enabled: 'ddc.ambience.enabled', volume: 'ddc.ambience.volume' }
export const AMBIENCE_DEFAULT_VOLUME = 0.35
/** 同時播放的聲軌上限（含正在淡出、尚未停止的） */
export const MAX_TRACKS = 4
/** 低於這個音量就視為聽不到，不播放 */
export const MIN_AUDIBLE = 0.02
/** 年代轉場：開始轉場就淡出，新年代街景換上後淡入（EraDirector 約 1.8 秒） */
export const FADE = { out: 0.6, in: 1.4, first: 1.5, track: 0.7, story: 0.6 }
/** 閱讀故事時的環境音比例 */
export const STORY_RATIO = 0.45
/** 背景音樂播放中時，環境音退讓的比例（避免和音樂旋律搶聲音） */
export const MUSIC_RATIO = 0.55
/** 更新人物距離的間隔（秒） */
export const UPDATE_INTERVAL = 0.25
/** 循環音檔前後各多 1 秒循環內容，避免 MP3 編碼補位造成的接縫 */
export const LOOP_PAD = 1

const GEN = 'tools/music/generate_ambience.py（numpy 濾波雜訊與加法合成，ffmpeg 轉 MP3 56 kbps 單聲道）'

/** 音檔：duration 是循環區間長度（秒），檔案實際長度為 duration + 2 */
export const AMBIENCE_SOUNDS = {
  'river-lap': { file: 'audio/ambience/river-lap.mp3', duration: 10, label: '河水拍岸', source: GEN },
  oars: { file: 'audio/ambience/oars.mp3', duration: 10, label: '船槳與水花', source: GEN },
  'gong-distant': { file: 'audio/ambience/gong-distant.mp3', duration: 14, label: '遠處的鑼鼓與絃音', source: GEN },
  'bicycle-bell': { file: 'audio/ambience/bicycle-bell.mp3', duration: 12, label: '腳踏車鈴', source: GEN },
  gramophone: { file: 'audio/ambience/gramophone.mp3', duration: 12, label: '留聲機', source: GEN },
  trishaw: { file: 'audio/ambience/trishaw.mp3', duration: 10, label: '三輪車', source: GEN },
  radio: { file: 'audio/ambience/radio.mp3', duration: 12, label: '收音機', source: GEN },
  'traffic-hum': { file: 'audio/ambience/traffic-hum.mp3', duration: 12, label: '遠處車流', source: GEN },
}

// 錨點座標（世界座標，街道沿 X 軸，西側 x < -44.6 是淡水河；見 game/config.js）
const RIVER_BANK = { x: -47, z: 0 }
const PLAZA_WEST = { x: -38, z: 0 }
const STREET_MID = { x: 0, z: 0 }
const STREET_EAST = { x: 28, z: -4 }
const TEMPLE_COURT = { x: 4, z: 7 } // 慈聖宮廟埕（squidSoupLayout 的 TEMPLE_COURT）
const SHOP_ROW = { x: -12, z: -4 }

const bed = (sound, gain) => ({ sound, mode: 'bed', gain })
const spot = (sound, gain, anchor, inner, outer) => ({ sound, mode: 'spot', gain, anchor, inner, outer })

/**
 * 每個年代的聲音。年代正確性（待核與依據見 docs/research/ambience-sources.md）：
 * - 留聲機：只放在摩登（1930–1945）；收音機：庶民生活（1945–1980）；機車：老屋新生（2000–）
 * - 港口商街沒有任何機械聲、電聲；酒樓繁華只有人聲與遠處的鑼鼓絃音
 */
export const ERA_AMBIENCE = {
  'qing-port': [
    spot('river-lap', 1.0, RIVER_BANK, 14, 52),
    spot('oars', 0.8, RIVER_BANK, 6, 36),
  ],
  banquet: [
    spot('river-lap', 0.55, RIVER_BANK, 8, 40),
    spot('gong-distant', 0.45, STREET_EAST, 24, 70),
  ],
  modern: [
    spot('river-lap', 0.45, RIVER_BANK, 8, 38),
    spot('bicycle-bell', 0.55, STREET_MID, 26, 60),
    spot('gramophone', 0.45, SHOP_ROW, 8, 30),
  ],
  postwar: [
    spot('river-lap', 0.4, RIVER_BANK, 8, 36),
    spot('trishaw', 0.55, STREET_MID, 20, 54),
    spot('radio', 0.4, SHOP_ROW, 6, 22),
  ],
  revival: [
    spot('river-lap', 0.4, PLAZA_WEST, 8, 36),
    spot('traffic-hum', 0.6, STREET_EAST, 30, 90),
  ],
}

export function getEraAmbience(eraId) {
  return ERA_AMBIENCE[eraId] ?? []
}

/** 距離 → 音量（0..1）：內圈 1、外圈 0，之間用平滑曲線 */
export function distanceGain(distance, inner, outer) {
  if (!(outer > inner)) return distance <= inner ? 1 : 0
  if (distance <= inner) return 1
  if (distance >= outer) return 0
  const t = (distance - inner) / (outer - inner)
  const s = 1 - t * t * (3 - 2 * t)
  return s
}

/** 單一聲音在人物位置的音量（0..1，含該聲音自己的 gain，不含總音量） */
export function entryGain(entry, pos) {
  if (entry.mode === 'bed') return entry.gain
  return entry.gain * distanceGain(Math.hypot(pos.x - entry.anchor.x, pos.z - entry.anchor.z), entry.inner, entry.outer)
}

/**
 * 算出各聲軌的目標音量。
 * @param {{eraId:string, pos:{x:number,z:number}, live?:Iterable<string>, max?:number}} input
 *   live：目前已建立（含淡出中）的聲音 id
 * @returns {{targets: Map<string, number>, start: string[]}}
 *   targets：應該聽得到的聲音（最多 max 個，依音量排序）；live 裡不在 targets 的要淡出
 *   start：這一輪可以新建的聲軌（建立後含淡出中的總數不超過 max）
 */
export function planTracks({ eraId, pos, live = [], max = MAX_TRACKS }) {
  const liveSet = new Set(live)
  const ranked = getEraAmbience(eraId)
    .map((entry) => ({ id: entry.sound, gain: entryGain(entry, pos) }))
    .filter((item) => item.gain >= MIN_AUDIBLE)
    .sort((a, b) => b.gain - a.gain)
  // 同一個聲音在清單中只會出現一次；已經在播的不佔用新名額，優先保留
  const chosen = ranked.slice(0, max)
  const targets = new Map(chosen.map((item) => [item.id, item.gain]))
  const start = []
  let count = liveSet.size
  for (const item of chosen) {
    if (liveSet.has(item.id)) continue
    if (count >= max) break
    start.push(item.id)
    count++
  }
  return { targets, start }
}

/** 總音量：開關、使用者音量、轉場（淡出時為 0）與閱讀故事時的比例 */
export function masterTarget({ enabled, volume, transitioning, story, music = false }) {
  if (!enabled || transitioning) return 0
  return volume * (story ? STORY_RATIO : 1) * (music ? MUSIC_RATIO : 1)
}

/** 總音量的淡入淡出秒數（目前總音量 → 目標） */
export function masterRamp({ from, to, first }) {
  if (to < from) return FADE.out
  return first ? FADE.first : FADE.in
}

export function ambienceSoundIds() {
  const ids = new Set()
  for (const list of Object.values(ERA_AMBIENCE)) for (const e of list) ids.add(e.sound)
  return [...ids]
}
