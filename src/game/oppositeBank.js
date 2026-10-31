import { RIVER } from './config.js'
import { seeded } from './motion.js'

/**
 * 隔岸天際線（第 14 階段，只在精緻畫質）：從碼頭與棧橋往西看，淡水河對岸三重埔一帶的輪廓，依年代不同。
 * 純邏輯（不依賴 React／Three，可以直接單測）：年代的配置（OPPOSITE_BANK）與低面數剪影的頂點（buildOppositeBank）。
 * 查證紀錄：docs/research/opposite-bank.md；出處加在 sources.js。
 *
 * 尺度：場景裡的河比實際窄（實際約 450–500 公尺，這裡對岸在堤防外約 285 公尺，因為觀音山的剪影在 410 公尺），
 * 所以對岸的高度按「從碼頭看的仰角」縮小——實際距離約 0.6–1.5 公里的房子，放在 290–480 公尺處時高度乘上約 0.45，
 * 看起來的大小和實際差不多，觀音山仍然在後面。
 *
 * 只畫朝東（朝碼頭）、朝上與朝南北的面；背面與底面看不到，不畫。
 * 每個頂點有三個屬性：位置、色調（tint，乘在年代的遠景色上）與燈火（light，0 = 牆面，> 0 = 窗或路燈的亮度）。
 */

/** 對岸的岸線（x）、地面高度與範圍 */
export const BANK = {
  edgeX: RIVER.edgeX - 285, // 約 −330
  farX: -720,
  minZ: -760,
  maxZ: 760,
  groundY: RIVER.waterLevel + 1.1, // 對岸的灘地略高於水面
  heightScale: 0.45, // 實際高度 → 場景高度
}

/** 臺北橋（碼頭的北側，右手邊）：從這一岸的河面橫跨到對岸 */
export const BRIDGE = { z: -150, fromX: RIVER.edgeX - 6, toX: BANK.edgeX - 4 }

/** 觀音山主峰的方向（碼頭往西、z ≈ 0）：現代的大樓在這一段要留空隙，露出山脊 */
export const GUANYIN_GAP = { minZ: -45, maxZ: 60, maxHeight: 16 }

/** 色調（乘在遠景色上，1 = 原色） */
const TINT = {
  field: [0.72, 0.9, 0.64],
  flower: [1.02, 1.0, 0.9],
  bamboo: [0.42, 0.62, 0.4],
  wall: [1.35, 1.28, 1.16],
  roof: [0.78, 0.62, 0.55],
  concrete: [1.25, 1.25, 1.28],
  tower: [1.15, 1.18, 1.26],
  factory: [0.94, 0.94, 0.96],
  wood: [0.72, 0.62, 0.52],
  steel: [0.55, 0.6, 0.66],
  wall2: [1.05, 1.08, 1.14],
  park: [0.78, 0.98, 0.74],
}

/**
 * 各年代的對岸。evidence：sources.js 的 id；reconstructed：查不到的部分（歷史情境重建）。
 * bridge：none／wood-trestle（1889 木橋）／steel-truss（1925 鋼桁架）／concrete（1969 混凝土橋）／wide（1996 現橋）
 */
export const OPPOSITE_BANK = {
  'qing-port': {
    bridge: 'wood-trestle',
    farms: 16,
    settlement: 0,
    blocks: 0,
    factories: 0,
    chimneys: 0,
    towers: 0,
    floodwall: false,
    lights: 0.12, // 有燈的窗（油燈）比例
    note: '平坦肥沃的沖積平原：水田、零星的竹圍農舍；1889 年劉銘傳為鐵路修的木橋在北邊（右手邊），其中有一段可以旋轉開合讓船通過。',
    noteEn: 'A flat, fertile alluvial plain of paddy fields with scattered bamboo-ringed farmhouses; to the north (right) the wooden bridge Liu Mingchuan built for the railway in 1889, with a swing span that opened for boats.',
    evidence: ['cheng-1998-sanchongpu', 'zh-wiki-sanchong-district', 'zh-wiki-taipei-bridge', 'zh-wiki-sanchongpu'],
    reconstructed: '竹圍與農舍的位置、數量與高度，以及木橋的高度：歷史情境重建（木橋 1889–1895 年才有）。',
    reconstructedEn: 'The positions, number and height of bamboo groves and farmhouses, and the height of the wooden bridge: historical reconstruction (the bridge only stood in 1889–1895).',
  },
  banquet: {
    bridge: 'steel-truss',
    farms: 18,
    settlement: 14,
    blocks: 0,
    factories: 0,
    chimneys: 0,
    towers: 0,
    floodwall: false,
    lights: 0.4,
    note: '三重埔被劃為洪泛區，仍是田地與香花園（約 38 公頃茉莉供大稻埕的茶商窨花）；1925 年 6 月 18 日鋼桁架的臺北橋通車，「鐵橋夕照」列為臺北八景，橋頭有小聚落。',
    noteEn: 'Sanchongpu was zoned as a flood plain and stayed fields and flower gardens (about 38 hectares of jasmine for scenting Dadaocheng’s tea); the steel-truss Taipei Bridge opened on 18 June 1925, and “sunset over the iron bridge” became one of the Eight Views of Taipei, with a small settlement at the bridgehead.',
    evidence: ['sanchong-district-office-history', 'zh-wiki-sanchong-district', 'zh-wiki-taipei-bridge'],
    reconstructed: '鋼桁架的跨數與高度、橋頭聚落與農舍的分布：歷史情境重建；這個年代橫跨 1895–1930，以 1925 年以後的鐵橋為準。',
    reconstructedEn: 'The number and height of the truss spans and the layout of the bridgehead settlement and farmhouses: historical reconstruction; the era spans 1895–1930 and shows the iron bridge after 1925.',
  },
  modern: {
    bridge: 'steel-truss',
    farms: 18,
    settlement: 20,
    blocks: 0,
    factories: 0,
    chimneys: 0,
    towers: 0,
    floodwall: false,
    lights: 0.5,
    note: '洪泛區的農田與香花園延續，加上 1925 年的鋼桁架臺北橋（「鐵橋夕照」）；臺北橋頭的聚落稍大。',
    noteEn: 'The flood-plain fields and flower gardens continue, with the 1925 steel-truss Taipei Bridge (“sunset over the iron bridge”); the bridgehead settlement is a little larger.',
    evidence: ['zh-wiki-sanchong-district', 'zh-wiki-taipei-bridge', 'sinica-taipei-history-map'],
    reconstructed: '對岸房屋的分布（1944–45 年美軍航照可以判讀，這次沒有逐圖判讀）：歷史情境重建。',
    reconstructedEn: 'The layout of houses on the far bank (readable from the 1944–45 US aerial photographs, not checked one by one here): historical reconstruction.',
  },
  postwar: {
    bridge: 'concrete',
    farms: 4,
    settlement: 26,
    blocks: 120,
    factories: 9,
    chimneys: 4,
    towers: 0,
    floodwall: false,
    lights: 0.55,
    note: '戰後三重從農村變成工業城鎮：人口 1956 年 7.4 萬、1966 年 17.4 萬，「客廳即工廠」，2–4 層的透天厝、公寓與廠房連成一片；1969 年混凝土的臺北橋通車。',
    noteEn: 'After the war Sanchong turned from farmland into an industrial town: 74,000 people in 1956 and 174,000 in 1966, “the living room is the factory”, with two- to four-storey houses, flats and workshops in a continuous spread; the concrete Taipei Bridge opened in 1969.',
    evidence: ['zh-wiki-sanchong-district', 'sanchong-district-office-history', 'zh-wiki-taipei-bridge', 'heo-dadaocheng-levee'],
    reconstructed: '工廠、煙囪的位置與數量，以及 1980 年以前三重沿河有沒有連續的堤防：查無資料，歷史情境重建。',
    reconstructedEn: 'The positions and number of factories and chimneys, and whether Sanchong had a continuous embankment along the river before 1980: no record found, historical reconstruction.',
  },
  revival: {
    bridge: 'wide',
    farms: 0,
    settlement: 0,
    blocks: 150,
    factories: 0,
    chimneys: 0,
    towers: 34,
    floodwall: true,
    lights: 0.7,
    note: '1985–1996 年分期加高的堤防與河濱公園，牆後是高密度的住宅大樓；1996 年 7 月 16 日現在的臺北橋通車。大樓之間留著空隙，看得到觀音山的稜線。',
    noteEn: 'Embankments raised in stages from 1985 to 1996 and a riverside park, with dense residential towers behind the wall; today’s Taipei Bridge opened on 16 July 1996. Gaps between the towers leave the ridge of Guanyinshan in view.',
    evidence: ['zh-wiki-erchong-floodway', 'heo-dadaocheng-levee', 'zh-wiki-taipei-bridge', 'udn-2026-dadaocheng-riverside'],
    reconstructed: '大樓的實際位置與高度：歷史情境重建（依 15–30 層、約 45–90 公尺的量級，按仰角縮小）。',
    reconstructedEn: 'The actual positions and heights of the towers: historical reconstruction (on the scale of 15–30 storeys, about 45–90 m, reduced to match the viewing angle).',
  },
}

export function oppositeBankFor(eraId) {
  return OPPOSITE_BANK[eraId] ?? null
}

// ---------- 幾何 ----------

function createSink() {
  return { pos: [], tint: [], light: [] }
}

function tri(sink, a, b, c, tint, light = 0) {
  sink.pos.push(...a, ...b, ...c)
  for (let i = 0; i < 3; i++) {
    sink.tint.push(...tint)
    sink.light.push(light)
  }
}

function quad(sink, a, b, c, d, tint, light = 0) {
  tri(sink, a, b, c, tint, light)
  tri(sink, a, c, d, tint, light)
}

const shade = (tint, k) => [tint[0] * k, tint[1] * k, tint[2] * k]

/** 方塊：只畫朝東（+x）、朝上與朝南北的面 */
function box(sink, x0, x1, y0, y1, z0, z1, tint) {
  quad(sink, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], tint) // +x
  quad(sink, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], shade(tint, 1.08)) // 上
  quad(sink, [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1], shade(tint, 0.9)) // +z
  quad(sink, [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z0], shade(tint, 0.86)) // −z
}

/** 兩坡屋頂（屋脊沿 z）：朝東的斜面與南北的山牆 */
function gable(sink, x0, x1, y, h, z0, z1, tint) {
  const xm = (x0 + x1) / 2
  quad(sink, [x1, y, z0], [x1, y, z1], [xm, y + h, z1], [xm, y + h, z0], tint)
  tri(sink, [x0, y, z1], [xm, y + h, z1], [x1, y, z1], shade(tint, 0.85))
  tri(sink, [x1, y, z0], [xm, y + h, z0], [x0, y, z0], shade(tint, 0.82))
}

/** 竹叢：八角錐台（朝東的半圈），頂端收成圓頂 */
function bamboo(sink, cx, cz, r, h, y, tint) {
  const n = 8
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i / n) * Math.PI
    const a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI
    const p = (a, rr, yy) => [cx + Math.cos(a) * rr, yy, cz + Math.sin(a) * rr]
    const k = 0.82 + 0.18 * Math.cos((a0 + a1) / 2)
    quad(sink, p(a0, r, y), p(a1, r, y), p(a1, r * 0.8, y + h * 0.75), p(a0, r * 0.8, y + h * 0.75), shade(tint, k))
    tri(sink, p(a0, r * 0.8, y + h * 0.75), p(a1, r * 0.8, y + h * 0.75), [cx, y + h, cz], shade(tint, k * 1.06))
  }
}

/** 細長的桿件（兩點之間的方柱，只畫朝東的兩面）：桁架的斜材、欄杆 */
function beam(sink, a, b, w, tint) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dz = b[2] - a[2]
  const len = Math.hypot(dx, dy, dz) || 1
  // 截面的兩個方向：垂直於桿件、一個朝上（或朝 x）
  let ux = -dy / len
  let uy = dx / len
  let uz = 0
  const ul = Math.hypot(ux, uy, uz)
  if (ul < 0.2) {
    ux = 0
    uy = 0
    uz = 1
  } else {
    ux /= ul
    uy /= ul
  }
  const h = w / 2
  const off = (p, s) => [p[0] + ux * h * s, p[1] + uy * h * s, p[2] + uz * h * s]
  const side = [0, 0, 1]
  const sz = (p, s) => [p[0] + side[0] * h * s, p[1] + side[1] * h * s, p[2] + side[2] * h * s]
  quad(sink, off(a, -1), off(b, -1), off(b, 1), off(a, 1), tint)
  quad(sink, sz(a, -1), sz(a, 1), sz(b, 1), sz(b, -1), shade(tint, 0.9))
}

/** 窗或燈：朝東的小方塊面（只在燈火 > 0 時發光） */
function lamp(sink, x, y, z, w, h, light) {
  quad(sink, [x + 0.05, y, z - w / 2], [x + 0.05, y, z + w / 2], [x + 0.05, y + h, z + w / 2], [x + 0.05, y + h, z - w / 2], TINT.wall2, light)
}

/** 一棟房子（牆＋兩坡或平屋頂）與朝東的窗 */
function house(sink, rng, x, z, w, d, h, roof, lit, tint = TINT.wall) {
  const y = BANK.groundY
  box(sink, x - d, x, y, y + h, z - w / 2, z + w / 2, shade(tint, 0.9 + rng() * 0.2))
  if (roof === 'gable') gable(sink, x - d, x, y + h, Math.min(2.2, d * 0.45), z - w / 2 - 0.3, z + w / 2 + 0.3, TINT.roof)
  const floors = Math.max(1, Math.round(h / 2.2))
  const cols = Math.max(1, Math.floor(w / 3.2))
  for (let f = 0; f < floors; f++)
    for (let c = 0; c < cols; c++) {
      if (rng() > lit) continue
      const zc = z - w / 2 + ((c + 0.5) * w) / cols
      lamp(sink, x, y + 0.7 + f * (h / floors), zc, Math.min(1.1, w / cols - 0.5), 0.8, 0.6 + rng() * 0.4)
    }
}

function buildBridge(sink, type, rng) {
  const { z, fromX, toX } = BRIDGE
  const WL = RIVER.waterLevel
  if (type === 'none') return
  if (type === 'wood-trestle') {
    // 1889 年的木橋：低矮、多跨（46 跨木結構，每跨約 9.75 公尺），北岸一段可旋轉開合
    const deck = WL + 2.6
    box(sink, toX, fromX, deck, deck + 0.5, z - 2.2, z + 2.2, TINT.wood)
    for (let x = fromX - 3; x > toX; x -= 6) {
      box(sink, x - 0.35, x, WL - 0.5, deck, z - 1.9, z - 1.5, TINT.wood)
      box(sink, x - 0.35, x, WL - 0.5, deck, z + 1.5, z + 1.9, TINT.wood)
    }
    for (let x = fromX; x > toX; x -= 3) beam(sink, [x, deck + 0.5, z - 2.2], [x, deck + 1.3, z - 2.2], 0.12, TINT.wood)
    beam(sink, [fromX, deck + 1.3, z - 2.2], [toX, deck + 1.3, z - 2.2], 0.12, TINT.wood)
    return
  }
  if (type === 'steel-truss') {
    // 1925 年的鋼桁架橋：一跨一跨的華倫式桁架（跨數與高度是情境重建）
    const deck = WL + 3.2
    box(sink, toX, fromX, deck, deck + 0.7, z - 3, z + 3, TINT.steel)
    const span = 28
    for (let x0 = fromX; x0 - span >= toX - 1; x0 -= span) {
      const x1 = x0 - span
      box(sink, x1 + span / 2 - 1.2, x1 + span / 2 + 1.2, WL - 0.5, deck, z - 2.6, z + 2.6, TINT.concrete)
      for (const side of [-3, 3]) {
        const top = deck + 4.6
        beam(sink, [x0, top, z + side], [x1, top, z + side], 0.45, TINT.steel)
        beam(sink, [x0, deck + 0.7, z + side], [x0 - span / 4, top, z + side], 0.32, TINT.steel)
        beam(sink, [x0 - span / 4, top, z + side], [x0 - span / 2, deck + 0.7, z + side], 0.32, TINT.steel)
        beam(sink, [x0 - span / 2, deck + 0.7, z + side], [x0 - (3 * span) / 4, top, z + side], 0.32, TINT.steel)
        beam(sink, [x0 - (3 * span) / 4, top, z + side], [x1, deck + 0.7, z + side], 0.32, TINT.steel)
      }
    }
    // 橋上的路燈（1925 年以後已有電燈）
    for (let x = fromX - 14; x > toX; x -= 28) lamp(sink, x, deck + 3.2, z - 3.4, 0.5, 0.5, 0.9)
    return
  }
  if (type === 'concrete') {
    // 1969 年的混凝土橋：平板、厚一點的橋面與一排橋墩，沒有桁架
    const deck = WL + 3.4
    box(sink, toX, fromX, deck, deck + 1.3, z - 4.5, z + 4.5, TINT.concrete)
    for (let x = fromX - 12; x > toX; x -= 24) box(sink, x - 1.4, x, WL - 0.5, deck, z - 3.5, z + 3.5, TINT.concrete)
    for (let x = fromX - 6; x > toX; x -= 24) {
      beam(sink, [x, deck + 1.3, z - 4.4], [x, deck + 4.4, z - 4.4], 0.18, TINT.steel)
      lamp(sink, x, deck + 4.3, z - 4.7, 0.5, 0.35, 1)
    }
    return
  }
  // 1996 年的現橋：寬平的橋面（實際寬 44 公尺）、大跨距、成排路燈
  const deck = WL + 4.2
  box(sink, toX, fromX, deck, deck + 1.6, z - 10, z + 10, TINT.concrete)
  for (let x = fromX - 30; x > toX; x -= 30) box(sink, x - 2, x, WL - 0.5, deck, z - 7, z + 7, TINT.concrete)
  for (let x = fromX - 4; x > toX; x -= 14) {
    for (const side of [-9.6, 9.6]) {
      beam(sink, [x, deck + 1.6, z + side], [x, deck + 5.6, z + side], 0.2, TINT.steel)
      lamp(sink, x, deck + 5.4, z + side - 0.3, 0.6, 0.4, 1)
    }
  }
}

/**
 * 某個年代的對岸剪影：回傳 { position, tint, light, counts }（Float32Array）。
 * 結果固定（同一個年代每次都一樣），沒有配置的年代回傳 null。
 */
export function buildOppositeBank(eraId) {
  const layout = oppositeBankFor(eraId)
  if (!layout) return null
  const rng = seeded(eraId.length * 131 + 7)
  const sink = createSink()
  const y = BANK.groundY
  const counts = { farms: 0, settlement: 0, blocks: 0, factories: 0, chimneys: 0, towers: 0, maxHeight: 0, lights: 0 }
  const top = (h) => (counts.maxHeight = Math.max(counts.maxHeight, h))

  // 灘地與農田（現代是河濱公園）：一大片朝上的地面，前緣一道低低的岸
  const groundTint = layout.floodwall ? TINT.park : layout.blocks > 0 ? TINT.factory : TINT.field
  quad(sink, [BANK.farX, y, BANK.minZ], [BANK.farX, y, BANK.maxZ], [BANK.edgeX, y, BANK.maxZ], [BANK.edgeX, y, BANK.minZ], shade(groundTint, 0.95))
  quad(sink, [BANK.edgeX, RIVER.waterLevel - 0.4, BANK.minZ], [BANK.edgeX, RIVER.waterLevel - 0.4, BANK.maxZ], [BANK.edgeX, y, BANK.maxZ], [BANK.edgeX, y, BANK.minZ], shade(TINT.field, 0.7))
  // 田地的分區（香花園、菜園）：淡淡的色帶
  if (layout.farms > 0) {
    for (let i = 0; i < 10; i++) {
      const x0 = BANK.edgeX - 8 - rng() * 120
      const z0 = -300 + rng() * 600
      const w = 30 + rng() * 60
      const t = rng() < 0.4 && eraId !== 'qing-port' ? TINT.flower : TINT.field
      quad(sink, [x0 - 25, y + 0.05, z0], [x0 - 25, y + 0.05, z0 + w], [x0, y + 0.05, z0 + w], [x0, y + 0.05, z0], shade(t, 0.9 + rng() * 0.15))
    }
  }

  // 竹圍農舍
  for (let i = 0; i < layout.farms; i++) {
    const x = BANK.edgeX - 14 - rng() * 150
    const z = -330 + rng() * 660
    for (let k = 0; k < 4; k++) {
      // 竹叢比按仰角縮小的高度略大一點（實際 8–12 公尺 × 0.45 只有 4–5 公尺，在霧裡看不出來）
      const h = 6 + rng() * 2.5
      bamboo(sink, x - rng() * 10, z + (rng() - 0.5) * 18, 4 + rng() * 3, h, y, TINT.bamboo)
      top(h)
    }
    house(sink, rng, x + 3, z, 7 + rng() * 3, 4, 2.6, 'gable', layout.lights)
    counts.farms++
  }

  // 臺北橋頭的聚落（1–2 層）
  for (let i = 0; i < layout.settlement; i++) {
    const x = BANK.edgeX - 4 - rng() * 28
    const z = BRIDGE.z + 12 + (i % 14) * 7 + rng() * 3 - (i >= 14 ? 120 : 0)
    const h = rng() < 0.5 ? 2.2 : 4
    house(sink, rng, x, z, 5 + rng() * 2, 4, h, 'gable', layout.lights)
    top(h + 2)
    counts.settlement++
  }

  // 戰後的透天厝、公寓與廠房；現代的中層公寓
  for (let i = 0; i < layout.blocks; i++) {
    const row = i % 4
    const x = BANK.edgeX - (layout.floodwall ? 20 : 6) - row * 16 - rng() * 8
    const z = -360 + Math.floor(i / 4) * (720 / (layout.blocks / 4)) + rng() * 4
    const h = layout.floodwall ? 4 + rng() * 6 : 2.7 + Math.floor(rng() * 3) * 1.3
    const w = 6 + rng() * 8
    house(sink, rng, x, z, w, 7, h, 'flat', layout.lights, layout.floodwall ? TINT.wall2 : TINT.wall)
    top(h)
    counts.blocks++
  }
  for (let i = 0; i < layout.factories; i++) {
    const x = BANK.edgeX - 40 - rng() * 40
    const z = -280 + i * 62 + rng() * 10
    const w = 16 + rng() * 10
    box(sink, x - 14, x, y, y + 3.4, z - w / 2, z + w / 2, TINT.factory)
    // 鋸齒屋頂（採光的高窗朝北）
    for (let k = -w / 2; k < w / 2 - 1; k += 3.2) {
      quad(sink, [x, y + 3.4, z + k], [x, y + 3.4, z + k + 3.2], [x - 14, y + 3.4, z + k + 3.2], [x - 14, y + 3.4, z + k], shade(TINT.roof, 0.9))
      tri(sink, [x, y + 3.4, z + k], [x, y + 4.8, z + k], [x, y + 3.4, z + k + 3.2], shade(TINT.factory, 0.85))
    }
    top(4.8)
    counts.factories++
  }
  for (let i = 0; i < layout.chimneys; i++) {
    const x = BANK.edgeX - 50 - rng() * 30
    const z = -250 + i * 150 + rng() * 20
    const h = 10 + rng() * 3.5
    box(sink, x - 1.1, x, y, y + h, z - 0.55, z + 0.55, shade(TINT.factory, 0.8))
    top(h)
    counts.chimneys++
  }

  // 現代：堤防（防洪牆）＋牆後的高樓；觀音山主峰的方向留空隙
  if (layout.floodwall) {
    const wx = BANK.edgeX - 12
    box(sink, wx - 1.5, wx, y, y + 3, BANK.minZ, BANK.maxZ, TINT.concrete)
    quad(sink, [wx - 1.5, y + 3, BANK.minZ], [wx - 1.5, y + 3, BANK.maxZ], [wx, y + 3, BANK.maxZ], [wx, y + 3, BANK.minZ], TINT.concrete)
  }
  for (let i = 0; i < layout.towers; i++) {
    let z = -420 + (i / layout.towers) * 860 + (rng() - 0.5) * 12
    const x = BANK.edgeX - 70 - rng() * 120
    const w = 12 + rng() * 8
    let h = 20 + rng() * 22
    if (z > GUANYIN_GAP.minZ - w / 2 && z < GUANYIN_GAP.maxZ + w / 2) h = Math.min(h, GUANYIN_GAP.maxHeight - 2)
    box(sink, x - 12, x, y, y + h, z - w / 2, z + w / 2, shade(TINT.tower, 0.92 + rng() * 0.16))
    const floors = Math.floor(h / 1.35)
    for (let f = 1; f < floors; f++)
      for (let c = 0; c < 4; c++) {
        if (rng() > layout.lights) continue
        lamp(sink, x, y + f * 1.35, z - w / 2 + ((c + 0.5) * w) / 4, w / 4 - 0.8, 0.6, 0.5 + rng() * 0.5)
      }
    top(h)
    counts.towers++
  }

  buildBridge(sink, layout.bridge, rng)
  counts.lights = sink.light.filter((v) => v > 0).length / 6
  return {
    position: new Float32Array(sink.pos),
    tint: new Float32Array(sink.tint),
    light: new Float32Array(sink.light),
    counts,
  }
}

/** 對岸的燈火量：入夜的年代（glow 高）、夜晚與雨天（陰天店家早點亮燈）時亮 */
export function bankLightAmount(glow) {
  const t = Math.min(1, Math.max(0, (glow - 0.3) / 0.6))
  return t * t * (3 - 2 * t)
}
