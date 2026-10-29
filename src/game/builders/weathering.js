import { Matrix4, Vector3 } from 'three'
import { createRng } from '../utils/random.js'

/**
 * 灰泥牆的風化、海報與鐵窗花（第 9 階段・美術）
 *
 * 只套用在一般街屋與洋樓（lineage 產生的背景建築，config.weathering = 年代 id）；
 * 店家建築與另外建模的建築（江山樓、稻舍、爐鍋咖啡、永樂市場……）都不套用。
 *
 * - 風化：水漬、剝落、髒污、補土痕跡，以頂點色的薄片貼在牆面前方，程度依年代與 condition 而不同
 * - 海報：只在庶民生活年代，貼在牆面與騎樓柱；只用不具名的色塊圖案（電影、藥品、選舉的情境示意），不寫字
 * - 鐵窗花：只在庶民生活與老屋新生年代，部分窗戶前加上鐵窗
 *
 * 全部使用既有的 plain 材質（依材質合併，不增加繪製呼叫）；海報與鐵窗放在 detail（低畫質不顯示）。
 * 亂數以建築的 seed 固定，同一面牆每次產生都一樣。
 */

/** 各年代的基本風化程度（0–1）：清末較新，庶民生活最舊，老屋新生修復過 */
export const ERA_WEATHERING = {
  'qing-port': 0.12,
  banquet: 0.26,
  modern: 0.38,
  postwar: 0.85,
  revival: 0.3,
}

const CONDITION_SCALE = { new: 0.5, mature: 1, aged: 1.3, restored: 0.6 }

export const POSTER_ERAS = ['postwar']
export const GRILLE_ERAS = ['postwar', 'revival']

/**
 * 海報的情境示意圖案（歷史情境重建）：只用泛稱，不用真實的片名、品牌、商標或人名，也不寫字。
 * colors：底色、標題色帶、圖像色塊
 */
export const POSTER_THEMES = [
  { id: 'film', label: '電影海報（情境示意）', colors: ['#e9dcc0', '#b2402f', '#3d5a73'] },
  { id: 'medicine', label: '藥品廣告（情境示意）', colors: ['#f2ecd8', '#2f6b54', '#d8a43a'] },
  { id: 'election', label: '選舉傳單（情境示意）', colors: ['#f4efe4', '#c4372c', '#2b3c78'] },
]

const GRILLE_CHANCE = { postwar: 0.55, revival: 0.35 }
const GRILLE_TINT = { postwar: '#3d4a4c', revival: '#4a5a52' }
const DECAL_T = 0.008

export function weatheringLevel(eraId, condition = 'new') {
  const base = ERA_WEATHERING[eraId]
  if (base == null) return 0
  return Math.min(1, base * (CONDITION_SCALE[condition] ?? 1))
}

const overlaps = (a, b, pad = 0) =>
  Math.abs(a.x - b.x) * 2 < a.width + b.width + pad * 2 && Math.abs(a.y - b.y) * 2 < a.height + b.height + pad * 2

const inside = (r, s) => r.x - r.width / 2 >= s.x0 && r.x + r.width / 2 <= s.x1 && r.y - r.height / 2 >= s.y0 && r.y + r.height / 2 <= s.y1

/**
 * 規劃一棟建築立面的風化、海報與鐵窗（純資料，不碰 PartBuilder，方便單測）。
 * surfaces：牆面 [{ x0, x1, y0, y1, z }]（z 為牆面前緣）
 * columns：騎樓柱的正面 [{ x, width, y0, y1, z, round }]
 * openings：窗與招牌（rectWindow／archWindow／signBoard 登記）；avoid：其他要避開的範圍（招牌、燈籠）
 */
export function planWeathering({ eraId, condition = 'new', seed = 1, surfaces = [], columns = [], openings = [], avoid = [] }) {
  const rng = createRng((seed ^ 0x5eed1) >>> 0)
  const level = weatheringLevel(eraId, condition)
  // 老屋新生：整條街都整修過，以補土痕跡為主
  const restored = condition === 'restored' || eraId === 'revival'
  const blocked = [...openings, ...avoid]
  const stains = []
  const posters = []
  const grilles = []
  const free = (rect, s, pad = 0.04) => inside(rect, s) && !blocked.some((o) => overlaps(rect, o, pad)) && ![...stains, ...posters].some((o) => overlaps(rect, o, 0.02))

  for (const s of surfaces) {
    const area = (s.x1 - s.x0) * (s.y1 - s.y0)
    const count = Math.min(8, Math.round(level * area * 0.55))
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const roll = rng()
        let kind
        if (restored) kind = roll < 0.8 ? 'patch' : 'streak'
        else kind = roll < 0.5 ? 'streak' : roll < 0.8 ? 'peel' : 'soot'
        const width = kind === 'streak' ? 0.1 + rng() * 0.22 : kind === 'soot' ? 0.6 + rng() * 0.9 : 0.25 + rng() * 0.5
        const height = kind === 'streak' ? 0.5 + rng() * 1.1 : kind === 'soot' ? 0.18 + rng() * 0.2 : 0.2 + rng() * 0.4
        const x = s.x0 + width / 2 + rng() * Math.max(0, s.x1 - s.x0 - width)
        // 水漬從牆頂往下流，髒污在牆腳
        const y = kind === 'streak' ? s.y1 - height / 2 - rng() * 0.15 : kind === 'soot' ? s.y0 + height / 2 + rng() * 0.1 : s.y0 + height / 2 + rng() * Math.max(0, s.y1 - s.y0 - height)
        const rect = { kind, x, y, width, height, z: s.z }
        if (!free(rect, s)) continue
        stains.push(rect)
        break
      }
    }
  }

  if (POSTER_ERAS.includes(eraId)) {
    const wants = (chance) => rng() < chance * Math.max(0.4, level)
    const placePoster = (rect, s) => {
      if (!free(rect, s, 0.06)) return false
      const theme = POSTER_THEMES[Math.floor(rng() * POSTER_THEMES.length) % POSTER_THEMES.length]
      posters.push({ ...rect, theme: theme.id, tilt: (rng() - 0.5) * 0.08, torn: condition === 'aged' && rng() < 0.5 })
      return true
    }
    for (const c of columns) {
      if (!wants(0.7)) continue
      const width = Math.min(c.round ? 0.2 : 0.34, c.width - 0.08)
      const height = width * 1.45
      placePoster({ x: c.x, y: Math.min(c.y1 - height / 2, 1.55), width, height, z: c.z - (c.round ? 0.02 : 0) }, { x0: c.x - c.width / 2, x1: c.x + c.width / 2, y0: c.y0, y1: c.y1 })
    }
    for (const s of surfaces) {
      if (!wants(0.5)) continue
      for (let attempt = 0; attempt < 5; attempt++) {
        const width = 0.38 + rng() * 0.12
        const height = width * 1.4
        const x = s.x0 + width / 2 + rng() * Math.max(0, s.x1 - s.x0 - width)
        const y = s.y0 + height / 2 + rng() * Math.max(0, Math.min(1.4, s.y1 - s.y0 - height))
        if (placePoster({ x, y, width, height, z: s.z }, s)) break
      }
    }
  }

  if (GRILLE_ERAS.includes(eraId)) {
    for (const o of openings) {
      if (o.grille || (o.kind !== 'window' && o.kind !== 'arch')) continue
      if (rng() >= GRILLE_CHANCE[eraId]) continue
      // 拱窗只罩住直段
      const height = o.kind === 'arch' ? Math.max(0.3, o.straight) : o.height - 0.12
      const y = o.kind === 'arch' ? o.bottom + height / 2 : o.y
      grilles.push({ x: o.x, y, width: o.width - 0.1, height, z: o.z, motif: rng() < 0.5 ? 'flower' : 'diamond' })
    }
  }

  return { eraId, condition, level, stains, posters, grilles }
}

const STAIN_TINT = {
  streak: '#7d7466',
  peel: '#b5a891',
  soot: '#6c665d',
  patch: '#f4eee0',
}

/** 把規劃好的風化、海報與鐵窗加到建築上（本地座標） */
export function applyWeathering(b, detail, plan) {
  const d = detail ?? b
  for (const s of plan.stains) {
    b.box('plain', [s.width, s.height, DECAL_T], [s.x, s.y, s.z + 0.006], { tint: STAIN_TINT[s.kind] })
    // 剝落處露出底下的紅磚
    if (s.kind === 'peel') b.box('plain', [s.width * 0.45, s.height * 0.45, DECAL_T], [s.x + s.width * 0.12, s.y - s.height * 0.1, s.z + 0.012], { tint: '#9c5a45' })
  }
  for (const p of plan.posters) {
    const [bg, band, image] = POSTER_THEMES.find((t) => t.id === p.theme).colors
    const rot = { rotation: [0, 0, p.tilt] }
    const h = p.torn ? p.height * 0.82 : p.height
    const y = p.torn ? p.y + (p.height - h) / 2 : p.y
    d.box('plain', [p.width, h, DECAL_T], [p.x, y, p.z + 0.008], { ...rot, tint: bg })
    d.box('plain', [p.width * 0.86, h * 0.16, DECAL_T], [p.x, y + h * 0.34, p.z + 0.013], { ...rot, tint: band })
    d.box('plain', [p.width * 0.7, h * 0.38, DECAL_T], [p.x, y - h * 0.04, p.z + 0.013], { ...rot, tint: image })
    // 不寫字：以細色條示意文字行
    for (const k of [0, 1]) d.box('plain', [p.width * (0.6 - k * 0.2), 0.018, DECAL_T], [p.x, y - h * (0.32 + k * 0.08), p.z + 0.013], { ...rot, tint: '#4a423a' })
  }
  for (const g of plan.grilles) ironGrille(d, g, plan.eraId)
}

/** 鐵窗：外框、直條、中段橫條與花樣，以四根短撐桿固定在窗前 */
function ironGrille(b, { x, y, width, height, z, motif }, eraId) {
  const tint = GRILLE_TINT[eraId] ?? '#3d4a4c'
  const t = 0.022
  const gz = z + 0.16
  for (const dy of [-height / 2, height / 2]) b.box('plain', [width, t, t], [x, y + dy, gz], { tint })
  for (const dx of [-width / 2, width / 2]) b.box('plain', [t, height, t], [x + dx, y, gz], { tint })
  const bars = Math.max(3, Math.round(width / 0.15))
  for (let i = 1; i < bars; i++) b.box('plain', [t * 0.8, height, t * 0.8], [x - width / 2 + (i * width) / bars, y, gz], { tint })
  b.box('plain', [width, t, t], [x, y, gz], { tint })
  for (const dx of [-width / 2, width / 2]) for (const dy of [-height / 2, height / 2]) b.box('plain', [t, t, 0.14], [x + dx, y + dy, z + 0.09], { tint })
  const s = Math.min(width, height) * 0.16
  for (const dy of [-height / 4, height / 4]) {
    for (const dx of [-width / 4, width / 4]) {
      if (motif === 'flower') {
        // 四片花瓣的鐵窗花
        for (let k = 0; k < 4; k++) b.box('plain', [s, t * 0.8, t * 0.8], [x + dx, y + dy, gz + 0.012], { rotation: [0, 0, (k * Math.PI) / 4], tint })
      } else {
        for (const angle of [Math.PI / 4, -Math.PI / 4]) b.box('plain', [s * 1.2, t * 0.8, t * 0.8], [x + dx, y + dy, gz + 0.012], { rotation: [0, 0, angle], tint })
      }
    }
  }
}

/** 開始記錄立面上的窗與招牌（沒有指定 config.weathering 時不做任何事） */
export function beginWeathering(b, cfg) {
  if (!cfg.weathering) return null
  b.openings = []
  return { signs: b.signs.length, lanterns: b.lanterns.length, banners: b.banners.length }
}

/** 收集這棟建築的窗、招牌、燈籠與布幡（換回本地座標），規劃並加上風化、海報與鐵窗 */
export function finishWeathering(b, detail, cfg, mark, { surfaces, columns }) {
  if (!mark) return null
  const openings = b.openings ?? []
  b.openings = undefined
  const inverse = new Matrix4().copy(b.matrix).invert()
  const local = (position) => new Vector3(...position).applyMatrix4(inverse)
  const avoid = []
  for (const sign of b.signs.slice(mark.signs)) {
    const p = local(sign.position)
    const vertical = Math.abs(Math.sin(sign.rotationY - b.worldRotationY(0))) > 0.5
    avoid.push({ kind: 'sign', x: p.x, y: p.y, width: (vertical ? 0.4 : sign.width ?? 1) + 0.3, height: (sign.height ?? 0.6) + 0.3 })
  }
  for (const item of [...b.lanterns.slice(mark.lanterns), ...b.banners.slice(mark.banners)]) {
    const p = local(item.position)
    avoid.push({ kind: 'lantern', x: p.x, y: p.y, width: 0.9, height: item.height ? item.height + 0.4 : 1.2 })
  }
  const plan = planWeathering({ eraId: cfg.weathering, condition: cfg.condition, seed: cfg.seed ?? 1, surfaces, columns, openings, avoid })
  applyWeathering(b, detail, plan)
  plan.avoid = [...openings.filter((o) => o.kind === 'sign'), ...avoid]
  if (b.weatherLog) b.weatherLog.push(plan)
  return plan
}
