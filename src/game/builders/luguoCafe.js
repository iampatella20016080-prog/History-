import { CylinderGeometry, Shape, SphereGeometry } from 'three'
import { ART_YARD, LUGUO_CAFE, LUGUO_STAIRS, artYardToWorld } from '../../data/luguoCafeLayout.js'
import { pottedPlant } from './props.js'

/**
 * 小藝埕（屈臣氏大藥房舊址）與二樓的爐鍋咖啡（只在 2000–現在「老屋新生」）
 *
 * 迪化街北側街尾的轉角建築：灰色洗石子的三層樓立面與四層的轉角塔樓，連續的直立木格窗、窗臺與線腳，
 * 立面柱列、塔樓頂的女兒牆與圓球柱頭；塔樓正面有「屈臣氏大藥房」的店號浮雕、「A.S. WATSON & CO.」字樣
 * 與寶塔、龍麟浮雕（簡化）；側面掛著紅褐色的「小藝埕 ArtYard」旗幟。
 * 一樓是兩側相連的騎樓（陶磚地、木條天花），面向小巷（32巷）的騎樓有爐鍋咖啡的木製招牌與上二樓的樓梯入口。
 *
 * 這個檔案產生建築外觀、巷子、樓梯（看得見的階梯）與二樓咖啡館的空殼（地板、牆、天花、柱與窗），
 * 以及碰撞、鏡頭遮擋、室內範圍與觀賞範圍；咖啡館的家具與擺飾在 luguoCafeInterior.js 按需載入。
 * 位置與尺寸都在 data/luguoCafeLayout.js；依實地照片估算，並非測量。
 *
 * 座標：建築本地座標（見 luguoCafeLayout.js），+x 往東、+z 往迪化街；y 為高度。
 */
const A = ART_YARD
const ST = LUGUO_STAIRS
const CAFE = LUGUO_CAFE

const STONE = '#c9c5bb' // 洗石子
const STONE_DARK = '#aeaaa1'
const STONE_LIGHT = '#d7d3c9'
const FRAME = '#4c3628' // 深棕色木窗框
const PLASTER = '#f3ebdc' // 室內米白牆
const WOOD = '#9b6b45'

/** 階高、級深（兩段樓梯相同） */
const TREAD = (ST.run.lower - ST.run.upper) / ST.steps
const RISER = ST.landing.y / ST.steps

/* ── 小工具 ─────────────────────────────── */

/** 沿著 x（迪化街側的牆）或 z（巷子側的牆）擺一個方塊：位置 [沿牆, 高度, 牆的法線方向]、尺寸 [沿牆, 高, 厚] */
function orient(b, along, material, [a, y, d], [la, h, ld], options) {
  if (along === 'x') b.box(material, [la, h, ld], [a, y, d], options)
  else b.box(material, [ld, h, la], [d, y, a], options)
}

/**
 * 一面有開口（窗、門）的牆：沿 along 方向從 from 到 to、高度 y0 到 y1；plane 是牆面的位置，
 * 牆往 inward（+1／-1）的方向長出厚度 t。開口 [{ a0, a1, y0, y1 }] 的地方不產生牆面。
 */
function wallWithOpenings(b, { along, plane, inward, from, to, y0, y1, t, openings = [], material = 'granite', tint = STONE, grime = 0.14 }) {
  const ys = [...new Set([y0, y1, ...openings.flatMap((o) => [o.y0, o.y1])])].filter((y) => y >= y0 - 1e-6 && y <= y1 + 1e-6).sort((p, q) => p - q)
  for (let i = 0; i < ys.length - 1; i++) {
    const ya = ys[i]
    const yb = ys[i + 1]
    if (yb - ya < 1e-4) continue
    const holes = openings
      .filter((o) => o.y0 <= ya + 1e-6 && o.y1 >= yb - 1e-6)
      .map((o) => [o.a0, o.a1])
      .sort((p, q) => p[0] - q[0])
    let cursor = from
    const segments = []
    for (const [a0, a1] of holes) {
      if (a0 > cursor + 1e-4) segments.push([cursor, a0])
      cursor = Math.max(cursor, a1)
    }
    if (to > cursor + 1e-4) segments.push([cursor, to])
    for (const [s0, s1] of segments) {
      orient(b, along, material, [(s0 + s1) / 2, (ya + yb) / 2, plane + (inward * t) / 2], [s1 - s0, yb - ya, t], { tint, grime })
    }
  }
}

/**
 * 深棕色的木格窗：開口 [a0, a1] × [y0, y1] 裡的窗框、窗扇的直櫺、上方的氣窗（transom）與細格子、玻璃與石材窗臺。
 * 窗框退在牆面內 recess 公尺；glass 為玻璃材質（二樓咖啡館的窗用透明玻璃，看得見店裡）。
 */
function woodWindow(b, { along, plane, inward, a0, a1, y0, y1, sashes = 3, transom = 0.45, rows = 3, glass = 'glass', recess = 0.12, sill = true }) {
  const w = a1 - a0
  const h = y1 - y0
  const mid = (a0 + a1) / 2
  const d = plane + inward * recess
  const bar = (a, y, la, hh, ld = 0.09) => orient(b, along, 'wood', [a, y, d], [la, hh, ld], { tint: FRAME })
  // 玻璃
  orient(b, along, glass, [mid, y0 + h / 2, d + inward * 0.01], [w - 0.06, h - 0.06, 0.02], { tint: glass === 'glassClear' ? '#ffffff' : '#46545c' })
  // 外框
  bar(a0 + 0.04, y0 + h / 2, 0.08, h)
  bar(a1 - 0.04, y0 + h / 2, 0.08, h)
  bar(mid, y1 - 0.04, w, 0.08)
  bar(mid, y0 + 0.04, w, 0.08)
  // 氣窗的橫框
  const ty = y1 - transom
  if (transom > 0) bar(mid, ty, w, 0.07)
  // 窗扇之間的直框與每扇的格子
  const sw = w / sashes
  for (let i = 0; i < sashes; i++) {
    const s0 = a0 + i * sw
    if (i > 0) bar(s0, y0 + h / 2, 0.06, h)
    const c = s0 + sw / 2
    bar(c, y0 + (ty - y0) / 2, 0.025, ty - y0 - 0.06, 0.05)
    for (let r = 1; r < rows; r++) bar(c, y0 + ((ty - y0) * r) / rows, sw - 0.04, 0.025, 0.05)
    if (transom > 0) bar(c, ty + transom / 2, 0.025, transom - 0.08, 0.05)
  }
  // 石材窗臺（往牆外突出）
  if (sill) orient(b, along, 'granite', [mid, y0 - 0.05, plane - inward * 0.05], [w + 0.16, 0.1, 0.24], { tint: STONE_LIGHT })
}

/** 方形洗石子柱：柱礎、柱身、柱頭 */
function squareColumn(b, x, z, height, size = 0.5) {
  b.box('granite', [size + 0.14, 0.32, size + 0.14], [x, 0.16, z], { tint: STONE_DARK, grime: 0.18 })
  b.box('granite', [size, height - 0.62, size], [x, 0.32 + (height - 0.62) / 2, z], { tint: STONE, grime: 0.16 })
  b.box('granite', [size + 0.16, 0.14, size + 0.16], [x, height - 0.23, z], { tint: STONE_LIGHT })
  b.box('granite', [size + 0.08, 0.16, size + 0.08], [x, height - 0.08, z], { tint: STONE_DARK })
}

/* ── 立面的開口 ─────────────────────────── */

const WIN2 = { y0: 4.8, y1: 7.05 } // 二樓
const WIN3 = { y0: 8.45, y1: 10.5 } // 三樓
const WIN4 = { y0: 11.85, y1: 13.45 } // 塔樓第四層

/** 塔樓每一面的三扇窄窗（沿牆座標的中心） */
function towerWindows(centerA, half = 1.2) {
  return [-half, 0, half].map((offset) => [centerA + offset - 0.34, centerA + offset + 0.34])
}

/** 巷子側（x = A.half）的窗：塔樓側面三扇窄窗，之後每個開間一組三扇的木格窗 */
function sideOpenings() {
  const towerCenter = (A.front - 0.25 + A.tower.minZ + 0.25) / 2
  const tower = towerWindows(towerCenter, 1.15)
  const bays = []
  for (let i = 0; i < A.sideBays.length - 1; i++) {
    const c = (A.sideBays[i] + A.sideBays[i + 1]) / 2
    bays.push([c - 1.0, c + 1.0])
  }
  return { tower, bays }
}

/** 迪化街側（z = A.front）的窗：西側一個開間的大窗（四扇）與塔樓正面三扇窄窗 */
function frontOpenings() {
  const wingCenter = (-A.half + A.tower.minX) / 2
  const towerCenter = (A.tower.minX + A.half) / 2
  return { wing: [[wingCenter - 1.2, wingCenter + 1.2]], tower: towerWindows(towerCenter, 1.2) }
}

/* ── 巷子（32巷）與鄰棟 ───────────────────── */

const LANE = { minX: A.half, maxX: A.half + 5.6, minZ: -16.6, mouthZ: -4.1 }

function lane(b) {
  const { minX, maxX, minZ, mouthZ } = LANE
  const w = maxX - minX
  // 灰色石板與柏油混合的巷道（從廣場北緣接進巷子）
  b.box('pavers', [w, 0.04, mouthZ - minZ], [(minX + maxX) / 2, 0.02, (minZ + mouthZ) / 2], { tint: '#b9b5ad' })
  b.box('plain', [0.1, 0.012, mouthZ - minZ - 0.6], [maxX - 0.3, 0.045, (minZ + mouthZ) / 2 - 0.2], { tint: '#b8332c' })
  for (const z of [-7.4, -12.6]) {
    b.box('steel', [0.5, 0.012, 0.9], [maxX - 0.75, 0.046, z], { tint: '#3c3d3c' })
    for (let i = 0; i < 6; i++) b.box('dark', [0.42, 0.01, 0.04], [maxX - 0.75, 0.052, z - 0.36 + i * 0.145], { tint: '#1f2020' })
  }
  // 巷口的綠色路名牌
  b.cylinder('steel', 0.04, 0.04, 2.44, 8, [maxX - 0.35, 1.22, mouthZ - 0.4], { tint: '#9aa09f' })
  b.box('plain', [1.18, 0.34, 0.03], [maxX - 0.35, 2.62, mouthZ - 0.4], { tint: '#1d6a50' })
  b.addSign({ text: '迪化街一段32巷', style: 'road', width: 1.12, height: 0.28, position: [maxX - 0.35, 2.62, mouthZ - 0.38] })
  b.addSign({ text: '迪化街一段32巷', style: 'road', width: 1.12, height: 0.28, position: [maxX - 0.35, 2.62, mouthZ - 0.42], rotationY: Math.PI })
}

/** 巷子東側的紅磚老屋（二層，一樓手作小店；不使用實際店家的招牌）與巷底收尾的三層樓 */
function laneNeighbours(b) {
  const x0 = LANE.maxX + 0.1
  const z0 = -11.4
  const z1 = LANE.minZ
  const d = 5.6
  const len = z0 - z1
  const cz = (z0 + z1) / 2
  b.group([x0, 0, cz], -Math.PI / 2, () => {
    // 本地：+z 朝巷子（西），x 沿著巷子
    b.box('brick', [len, 7.2, d], [0, 3.6, -d / 2], { tint: '#b8664a', grime: 0.2 })
    b.box('brick', [len + 0.1, 0.4, 0.3], [0, 7.3, 0.0], { tint: '#9c513b' })
    b.box('granite', [len, 0.25, 0.24], [0, 3.55, 0.06], { tint: STONE_LIGHT })
    // 一樓：木框玻璃店面與綠色的小招牌
    b.box('glassWarm', [len - 1.4, 2.4, 0.04], [0, 1.4, 0.02], {})
    for (const x of [-len / 2 + 0.7, 0, len / 2 - 0.7]) b.box('wood', [0.1, 2.6, 0.08], [x, 1.3, 0.05], { tint: '#5d4130' })
    b.box('wood', [len - 1.2, 0.1, 0.08], [0, 2.62, 0.05], { tint: '#5d4130' })
    b.box('plain', [1.6, 0.42, 0.05], [-0.6, 2.98, 0.08], { tint: '#3a9a6a' })
    b.addSign({ text: '手作雜貨', style: 'greenBoard', width: 1.5, height: 0.34, position: [-0.6, 2.98, 0.115] })
    // 二樓的拱窗（深色玻璃）
    for (const x of [-1.3, 1.3]) {
      b.box('dark', [1.0, 1.5, 0.06], [x, 5.2, 0.02], { tint: '#2d3236' })
      const arch = new Shape()
      arch.absarc(0, 0, 0.55, 0, Math.PI, false)
      arch.lineTo(-0.55, 0)
      b.extrude('brick', arch, 0.08, { position: [x, 5.95, 0.0], tint: '#9c513b' })
      b.box('granite', [1.2, 0.1, 0.2], [x, 4.42, 0.08], { tint: STONE_LIGHT })
    }
    pottedPlant(b, [len / 2 - 0.5, 0, 0.35], { seed: 41, size: 0.9, potTint: '#6d4b3a' })
  })
  // 巷底：三層樓的米色街屋（窗與鐵窗），收住巷子的視線
  const ex0 = A.half - 0.6
  const ex1 = LANE.maxX + 1.4
  const ez = LANE.minZ - 0.1
  const ed = 6
  b.box('stucco', [ex1 - ex0, 10.4, ed], [(ex0 + ex1) / 2, 5.2, ez - ed / 2], { tint: '#ddd3c1', grime: 0.18 })
  b.box('stucco', [ex1 - ex0 + 0.2, 0.4, 0.3], [(ex0 + ex1) / 2, 10.5, ez - 0.1], { tint: '#cfc4b0' })
  for (const y of [4.6, 7.8]) {
    for (const x of [ex0 + 1.6, (ex0 + ex1) / 2, ex1 - 1.6]) {
      b.box('dark', [1.1, 1.4, 0.05], [x, y, ez + 0.01], { tint: '#363a3d' })
      for (let i = 0; i < 5; i++) b.box('steel', [0.025, 1.45, 0.04], [x - 0.5 + i * 0.25, y, ez + 0.06], { tint: '#6c706f' })
    }
  }
  b.box('shutter', [2.6, 2.6, 0.05], [(ex0 + ex1) / 2, 1.3, ez + 0.02], { tint: '#b9bcb8' })
}

/* ── 小藝埕：一樓騎樓與店面 ───────────────── */

function arcades(b) {
  const { half, front, arcadeWallX: wx, wallT } = A
  const H = A.floor2 - A.slab // 騎樓天花（二樓樓板底）
  // 陶磚地坪（兩側的騎樓）
  b.box('terracotta', [2 * half, 0.04, front], [0, 0.02, front / 2], { tint: '#ffffff' })
  b.box('terracotta', [half - wx, 0.04, -(A.back + wallT)], [(half + wx) / 2, 0.02, (A.back + wallT) / 2], { tint: '#ffffff' })
  // 木條天花與白色的圓盤吊燈
  // 天花只鋪到柱列上方的梁的內側（不與梁的外側面重疊）
  b.box('planks', [2 * half - 0.7, 0.05, front - 0.5], [-0.15, H - 0.03, (front - 0.5) / 2], { tint: '#c79a6a' })
  b.box('planks', [half - 0.5 - wx, 0.05, -(A.back + wallT)], [(half - 0.5 + wx) / 2, H - 0.03, (A.back + wallT) / 2], { tint: '#c79a6a' })
  for (const [x, z] of [
    [-2.2, 0.85],
    [1.4, 0.85],
    [3.3, -4.4],
    [3.3, -10.6],
  ]) {
    b.cylinder('steel', 0.012, 0.012, 0.3, 6, [x, H - 0.2, z], { tint: '#6b6b66' })
    b.add('bulb', new CylinderGeometry(0.06, 0.28, 0.12, 18), { position: [x, H - 0.38, z], tint: '#fff4dc' })
    b.addGlow(x, H - 0.5, z, 0.9, '#ffe3b0')
  }
  // 騎樓柱：迪化街側與巷子側
  const inset = A.columnInset
  for (const x of [-half + inset, A.tower.minX, half - inset]) squareColumn(b, x, front - inset, H)
  for (const z of A.sideBays) if (z > A.back) squareColumn(b, half - inset, z, H)
  squareColumn(b, half - inset, A.back + inset, H)
  // 柱列上方的梁（立面的牆從這裡往上）
  b.box('granite', [2 * half, 0.32, 0.5], [0, H - 0.16, front - 0.25], { tint: STONE, grime: 0.15 })
  b.box('granite', [0.5, 0.32, front - 0.5 - A.back], [half - 0.25, H - 0.16, (front - 0.5 + A.back) / 2], { tint: STONE, grime: 0.15 })
}

/** 一樓店面：迪化街側（z = 0）與巷子側（x = arcadeWallX）；巷子側最後一個開間是上二樓的樓梯入口 */
function groundShops(b) {
  const { half, arcadeWallX: wx, wallT, tower } = A
  const H = A.floor2 - A.slab
  const door = ST.door
  // 迪化街側：西側的木框玻璃窗與木門、轉角的書店咖啡（玻璃店面）
  wallWithOpenings(b, {
    along: 'x',
    plane: 0,
    inward: -1,
    from: -half,
    to: wx,
    y0: 0,
    y1: H,
    t: wallT,
    openings: [
      { a0: -3.7, a1: -1.0, y0: 0.6, y1: 2.9 },
      { a0: -0.15, a1: 2.15, y0: 0.05, y1: 2.95 },
    ],
    material: 'stucco',
    tint: '#d8d2c6',
  })
  b.box('glassWarm', [2.6, 2.2, 0.04], [-2.35, 1.75, -0.08], {})
  for (const x of [-3.65, -2.35, -1.05]) b.box('wood', [0.08, 2.4, 0.1], [x, 1.75, -0.05], { tint: '#8a5a37' })
  b.box('wood', [2.8, 0.1, 0.1], [-2.35, 2.92, -0.05], { tint: '#8a5a37' })
  b.box('glassWarm', [2.2, 2.85, 0.04], [1.0, 1.5, -0.08], {})
  for (const x of [-0.12, 1.0, 2.12]) b.box('wood', [0.08, 2.95, 0.1], [x, 1.48, -0.05], { tint: '#5e3b28' })
  b.box('wood', [2.35, 0.1, 0.1], [1.0, 2.96, -0.05], { tint: '#5e3b28' })
  // 轉角店的小方燈箱（一般的店種字樣，不使用實際店家的商標）
  b.box('plain', [0.5, 0.5, 0.5], [tower.minX + 0.6, 3.15, 0.55], { tint: '#f2efe8' })
  b.box('plain', [0.52, 0.32, 0.52], [tower.minX + 0.6, 3.15, 0.55], { tint: '#7d2b2b' })
  for (const r of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const nx = Math.sin(r) * 0.265
    const nz = Math.cos(r) * 0.265
    b.addSign({ text: 'BOOK CAFE', style: 'redPlate', width: 0.46, height: 0.2, position: [tower.minX + 0.6 + nx, 3.15, 0.55 + nz], rotationY: r })
  }

  // 巷子側：木門、木框窗與上樓的入口
  wallWithOpenings(b, {
    along: 'z',
    plane: wx,
    inward: -1,
    from: A.back + wallT,
    to: 0,
    y0: 0,
    y1: H,
    t: wallT,
    openings: [
      { a0: -2.55, a1: -0.35, y0: 0.6, y1: 2.9 },
      { a0: -5.6, a1: -3.4, y0: 0.05, y1: 2.9 },
      { a0: -8.7, a1: -6.55, y0: 0.6, y1: 2.9 },
      { a0: -11.85, a1: -9.7, y0: 0.6, y1: 2.9 },
      { a0: -13.75, a1: -12.65, y0: 0.05, y1: 2.6 },
      { a0: door.minZ, a1: door.maxZ, y0: 0, y1: 2.65 },
    ],
    material: 'stucco',
    tint: '#d8d2c6',
  })
  for (const [z0, z1, y0] of [
    [-2.55, -0.35, 0.6],
    [-8.7, -6.55, 0.6],
    [-11.85, -9.7, 0.6],
  ]) {
    woodWindow(b, { along: 'z', plane: wx, inward: -1, a0: z0, a1: z1, y0, y1: 2.9, sashes: 3, transom: 0.5, rows: 2, glass: 'glassWarm', recess: 0.1, sill: false })
  }
  // 雙開木門（照片中貼著海報的那一扇）與入口旁的木門
  b.box('wood', [0.08, 2.85, 2.2], [wx - 0.1, 1.48, -4.5], { tint: '#9a6a42' })
  b.box('glassWarm', [0.04, 1.2, 0.7], [wx - 0.05, 2.0, -4.0], {})
  b.box('glassWarm', [0.04, 1.2, 0.7], [wx - 0.05, 2.0, -5.0], {})
  b.box('wood', [0.08, 2.55, 1.1], [wx - 0.1, 1.33, -13.2], { tint: '#a8784c' })
  b.box('glass', [0.04, 0.9, 0.72], [wx - 0.05, 2.05, -13.2], { tint: '#a9b3b4' })
  // 海報（原創的簡化圖樣，不複製實際的海報）
  b.box('plain', [0.02, 0.6, 0.44], [wx + 0.01, 1.55, -13.2], { tint: '#e8e3d6' })
  b.box('plain', [0.025, 0.3, 0.3], [wx + 0.015, 1.6, -13.2], { tint: '#c99a52' })
  b.box('plain', [0.02, 0.5, 0.3], [wx + 0.01, 1.0, -12.95], { tint: '#d95a3b' })

  // 樓梯入口：深色木門框、推開貼在牆上的木門，上方是爐鍋咖啡的木製招牌
  const dz = (door.minZ + door.maxZ) / 2
  for (const z of [door.minZ - 0.04, door.maxZ + 0.04]) b.box('wood', [0.28, 2.7, 0.08], [wx - 0.05, 1.35, z], { tint: '#5a3c2a' })
  b.box('wood', [0.28, 0.1, door.maxZ - door.minZ + 0.16], [wx - 0.05, 2.7, dz], { tint: '#5a3c2a' })
  b.box('wood', [0.9, 2.5, 0.05], [wx + 0.42, 1.27, door.minZ - 0.12], { tint: '#9a6a42' })
  b.box('glass', [0.6, 0.9, 0.02], [wx + 0.42, 1.95, door.minZ - 0.09], { tint: '#a9b3b4' })
  // 招牌：黑框淺色木板（店名與英文），兩側淡淡的咖啡枝葉線條
  const sz = door.maxZ - door.minZ + 0.7
  b.box('wood', [0.08, 0.92, sz + 0.16], [wx + 0.06, 3.2, dz], { tint: '#2a1f18' })
  b.box('woodLight', [0.06, 0.8, sz], [wx + 0.1, 3.2, dz], { tint: '#d7ae73' })
  b.addSign({ text: '爐鍋咖啡', style: 'luguoWood', width: sz - 0.5, height: 0.5, position: [wx + 0.135, 3.13, dz], rotationY: Math.PI / 2 })
  b.box('dark', [0.02, 0.15, 0.95], [wx + 0.135, 3.5, dz], { tint: '#2a2622' })
  b.addSign({ text: 'LUGUO CAFE', style: 'modern', width: 0.9, height: 0.12, position: [wx + 0.15, 3.5, dz], rotationY: Math.PI / 2 })
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      b.box('dark', [0.02, 0.05, 0.22], [wx + 0.14, 2.92 + i * 0.13, dz + s * (sz / 2 - 0.2)], { rotation: [s * (0.5 + i * 0.2), 0, 0], tint: '#3b4a33' })
    }
  }
  // 牆上的方形小招牌（2F）與騎樓下的木製立牌
  b.box('dark', [0.04, 0.5, 0.5], [wx + 0.02, 2.3, door.maxZ + 0.75], { tint: '#262321' })
  b.addSign({ text: '爐鍋咖啡', style: 'modern', width: 0.42, height: 0.16, position: [wx + 0.045, 2.38, door.maxZ + 0.75], rotationY: Math.PI / 2 })
  b.addSign({ text: '2F', style: 'modern', width: 0.2, height: 0.14, position: [wx + 0.045, 2.18, door.maxZ + 0.75], rotationY: Math.PI / 2 })
  aBoardSign(b, wx + 0.34, door.maxZ + 0.5)
  pottedPlant(b, [wx + 0.35, 0, door.minZ - 0.45], { seed: 52, size: 0.8, potTint: '#7e6450' })
}

/** 騎樓下的木製 A 字立牌（爐鍋咖啡 2F）：靠在入口旁的牆邊，兩面朝向騎樓的兩頭 */
function aBoardSign(b, x, z) {
  b.group([x, 0, z], 0.12, () => {
    for (const s of [-1, 1]) {
      b.box('woodLight', [0.55, 1.0, 0.04], [0, 0.5, s * 0.16], { rotation: [s * 0.2, 0, 0], tint: '#cfa877' })
      b.addSign({ text: '爐鍋咖啡', style: 'luguoWood', width: 0.42, height: 0.2, position: [0, 0.72, s * 0.19], rotationY: s > 0 ? 0 : Math.PI })
      b.addSign({ text: '2F', style: 'luguoWood', width: 0.18, height: 0.14, position: [0, 0.5, s * 0.185], rotationY: s > 0 ? 0 : Math.PI })
    }
  })
}

/* ── 小藝埕：樓上的立面 ────────────────── */

function upperFacades(b) {
  const { half, front, back, wallT, tower } = A
  const side = sideOpenings()
  const fr = frontOpenings()
  const H = A.floor2 - A.slab
  // 二樓（咖啡館）的外牆兩層：外側洗石子、內側米白灰泥；窗用透明玻璃
  const cafeSide = [...side.tower, ...side.bays.slice(0, 3)].map(([a0, a1]) => ({ a0, a1, ...WIN2 }))
  const stairSide = [{ a0: side.bays[3][0], a1: side.bays[3][1], ...WIN2 }]
  const upperSide = [...side.tower, ...side.bays].map(([a0, a1]) => ({ a0, a1, ...WIN3 }))
  const towerSide4 = side.tower.map(([a0, a1]) => ({ a0, a1, ...WIN4 }))
  const sideOpen = [...cafeSide, ...stairSide, ...upperSide]
  wallWithOpenings(b, { along: 'z', plane: half, inward: -1, from: back, to: front, y0: H, y1: A.top, t: 0.12, openings: sideOpen })
  wallWithOpenings(b, { along: 'z', plane: half - 0.12, inward: -1, from: back + wallT, to: front - wallT, y0: A.floor2, y1: A.ceiling2, t: 0.13, openings: sideOpen, material: 'plaster', tint: PLASTER, grime: 0 })
  // 塔樓的側面往上一層
  wallWithOpenings(b, { along: 'z', plane: half, inward: -1, from: tower.minZ, to: front, y0: A.top, y1: A.towerTop, t: 0.25, openings: towerSide4 })

  const frontCafe = [...fr.wing, ...fr.tower].map(([a0, a1]) => ({ a0, a1, ...WIN2 }))
  const frontUpper = [...fr.wing, ...fr.tower].map(([a0, a1]) => ({ a0, a1, ...WIN3 }))
  const towerFront4 = fr.tower.map(([a0, a1]) => ({ a0, a1, ...WIN4 }))
  wallWithOpenings(b, { along: 'x', plane: front, inward: -1, from: -half, to: half, y0: H, y1: A.top, t: 0.12, openings: [...frontCafe, ...frontUpper] })
  wallWithOpenings(b, { along: 'x', plane: front - 0.12, inward: -1, from: -half + wallT, to: half - wallT, y0: A.floor2, y1: A.ceiling2, t: 0.13, openings: frontCafe, material: 'plaster', tint: PLASTER, grime: 0 })
  wallWithOpenings(b, { along: 'x', plane: front, inward: -1, from: tower.minX, to: half, y0: A.top, y1: A.towerTop, t: 0.25, openings: towerFront4 })
  // 三樓以上的內部（看不到的實心量體，填在外牆後面，避免從窗戶看進去是空的）
  b.box('dark', [2 * half - 0.3, A.top - A.floor3 - 0.1, front - back - 0.3], [0, (A.floor3 + A.top) / 2, (front + back) / 2], { tint: '#3d3a36' })
  b.box('dark', [half - tower.minX - 0.3, A.towerTop - A.top, front - tower.minZ - 0.3], [(tower.minX + half) / 2, (A.top + A.towerTop) / 2, (front + tower.minZ) / 2], { tint: '#3d3a36' })
  // 西側與後側的牆（與鄰棟相接的山牆，素面）
  b.box('stucco', [0.2, A.top - H, front - back], [-half + 0.1, (H + A.top) / 2, (front + back) / 2], { tint: '#cfc8bb', grime: 0.2 })
  b.box('stucco', [2 * half, A.top, wallT], [0, A.top / 2, back + wallT / 2], { tint: '#cfc8bb', grime: 0.2 })
  b.box('stucco', [0.2, H, -back], [-half + 0.1, H / 2, back / 2], { tint: '#cfc8bb', grime: 0.2 })

  // 窗：二樓（透明玻璃，看得見咖啡館）與三、四樓
  for (const o of cafeSide) woodWindow(b, { along: 'z', plane: half, inward: -1, ...o, sashes: o.a1 - o.a0 > 1 ? 3 : 1, glass: 'glassClear', transom: 0.5 })
  for (const o of stairSide) woodWindow(b, { along: 'z', plane: half, inward: -1, ...o, sashes: 3, transom: 0.5 })
  for (const o of upperSide) woodWindow(b, { along: 'z', plane: half, inward: -1, ...o, sashes: o.a1 - o.a0 > 1 ? 3 : 1, transom: 0.45 })
  for (const o of towerSide4) woodWindow(b, { along: 'z', plane: half, inward: -1, ...o, sashes: 1, transom: 0, rows: 3 })
  for (const o of frontCafe) woodWindow(b, { along: 'x', plane: front, inward: -1, ...o, sashes: o.a1 - o.a0 > 1 ? 4 : 1, glass: 'glassClear', transom: 0.5 })
  for (const o of frontUpper) woodWindow(b, { along: 'x', plane: front, inward: -1, ...o, sashes: o.a1 - o.a0 > 1 ? 4 : 1, transom: 0.45 })
  for (const o of towerFront4) woodWindow(b, { along: 'x', plane: front, inward: -1, ...o, sashes: 1, transom: 0, rows: 3 })

  // 立面的壁柱（開間之間）與水平線腳
  const pilaster = (along, a, y0, y1, width = 0.44) => orient(b, along, 'granite', [a, (y0 + y1) / 2, along === 'x' ? front + 0.06 : half + 0.06], [width, y1 - y0, 0.12], { tint: STONE_LIGHT, grime: 0.12 })
  for (const z of [front - 0.25, ...A.sideBays.filter((z) => z > back), back + 0.25]) pilaster('z', z, H, A.top, z === front - 0.25 || z === back + 0.25 ? 0.5 : 0.44)
  pilaster('z', tower.minZ + 0.24, A.top, A.towerTop, 0.48)
  pilaster('z', front - 0.25, A.top, A.towerTop, 0.5)
  for (const x of [-half + 0.25, tower.minX, half - 0.25]) pilaster('x', x, H, A.top, 0.5)
  pilaster('x', tower.minX + 0.24, A.top, A.towerTop, 0.48)
  pilaster('x', half - 0.25, A.top, A.towerTop, 0.5)
  // 二樓與三樓之間、屋頂的線腳（巷子側與迪化街西側的開間；塔樓正面留給字樣與浮雕）
  const band = (along, a0, a1, y, h, out) => orient(b, along, 'granite', [(a0 + a1) / 2, y, (along === 'x' ? front : half) + out / 2], [a1 - a0, h, out], { tint: STONE_LIGHT, grime: 0.1 })
  band('z', back, tower.minZ, 7.62, 0.22, 0.16)
  band('x', -half, tower.minX, 7.62, 0.22, 0.16)
  band('z', back, tower.minZ, A.top - 0.12, 0.3, 0.24)
  band('x', -half, tower.minX, A.top - 0.12, 0.3, 0.24)
  // 轉角的壁柱在牆角接起來
  b.box('granite', [0.12, A.towerTop - H, 0.12], [half + 0.06, (H + A.towerTop) / 2, front + 0.06], { tint: STONE_LIGHT, grime: 0.12 })
  band('z', tower.minZ, front, A.towerTop - 0.12, 0.3, 0.26)
  band('x', tower.minX, half, A.towerTop - 0.12, 0.3, 0.26)
  band('z', back, front, H + 0.06, 0.12, 0.08)
  band('x', -half, half, H + 0.06, 0.12, 0.08)
  // 三層樓部分的女兒牆：深灰色的石粒帶
  for (const [along, a0, a1] of [
    ['z', back, tower.minZ],
    ['x', -half, tower.minX],
  ]) {
    orient(b, along, 'granite', [(a0 + a1) / 2, A.top + 0.4, (along === 'x' ? front : half) - 0.1], [a1 - a0, 0.8, 0.2], { tint: STONE, grime: 0.15 })
    orient(b, along, 'granite', [(a0 + a1) / 2, A.top + 0.4, (along === 'x' ? front : half) + 0.005], [a1 - a0 - 0.3, 0.42, 0.02], { tint: '#8e8a83' })
  }
  b.box('granite', [0.2, 0.8, front - back], [-half + 0.1, A.top + 0.4, (front + back) / 2], { tint: STONE })
  b.box('granite', [2 * half, 0.8, 0.2], [0, A.top + 0.4, back + 0.1], { tint: STONE })
  b.box('plain', [2 * half - 0.4, 0.06, front - back - 0.4], [0, A.top + 0.03, (front + back) / 2], { tint: '#9d9890' })
  towerTop(b)
  towerOrnaments(b)
  banners(b)
}

/** 塔樓頂：女兒牆、中央凸起的牌面、四角的方柱與圓球柱頭 */
function towerTop(b) {
  const { half, front, tower } = A
  const y = A.towerTop
  const cx = (tower.minX + half) / 2
  const cz = (front + tower.minZ) / 2
  const w = half - tower.minX
  const d = front - tower.minZ
  b.box('granite', [w, A.towerParapet - y, 0.22], [cx, (y + A.towerParapet) / 2, front - 0.11], { tint: STONE, grime: 0.15 })
  b.box('granite', [0.22, A.towerParapet - y, d], [half - 0.11, (y + A.towerParapet) / 2, cz], { tint: STONE, grime: 0.15 })
  b.box('granite', [w, A.towerParapet - y, 0.22], [cx, (y + A.towerParapet) / 2, tower.minZ + 0.11], { tint: STONE })
  b.box('granite', [0.22, A.towerParapet - y, d], [tower.minX + 0.11, (y + A.towerParapet) / 2, cz], { tint: STONE })
  b.box('plain', [w - 0.3, 0.06, d - 0.3], [cx, y + 0.03, cz], { tint: '#9d9890' })
  // 正面中央凸起的牌面（帶弧形的頂）
  b.box('granite', [1.8, 0.55, 0.28], [cx, A.towerParapet + 0.27, front - 0.12], { tint: STONE_LIGHT })
  const crest = new Shape()
  crest.moveTo(-0.9, 0)
  crest.quadraticCurveTo(0, 0.55, 0.9, 0)
  crest.lineTo(-0.9, 0)
  b.extrude('granite', crest, 0.28, { position: [cx, A.towerParapet + 0.54, front - 0.26], tint: STONE_LIGHT })
  // 側面的捲草收邊
  for (const s of [-1, 1]) b.cylinder('granite', 0.16, 0.16, 0.26, 12, [cx + s * 1.0, A.towerParapet + 0.12, front - 0.12], { rotation: [Math.PI / 2, 0, 0], tint: STONE_LIGHT })
  // 四角的方柱與圓球
  for (const [x, z] of [
    [tower.minX + 0.2, front - 0.2],
    [half - 0.2, front - 0.2],
    [half - 0.2, tower.minZ + 0.2],
    [tower.minX + 0.2, tower.minZ + 0.2],
  ]) {
    b.box('granite', [0.5, 1.1, 0.5], [x, y + 0.55, z], { tint: STONE_LIGHT, grime: 0.12 })
    b.box('granite', [0.6, 0.12, 0.6], [x, y + 1.16, z], { tint: STONE_DARK })
    b.add('granite', new SphereGeometry(0.24, 14, 10), { position: [x, y + 1.46, z], tint: STONE_LIGHT })
  }
}

/**
 * 塔樓正面的字樣與浮雕（簡化）：一樓騎樓上方的店號「屈臣氏大藥房」（由右往左）、
 * 二三樓之間的「A.S. WATSON & CO.」與捲草線腳、三樓窗上方的七層寶塔與兩側護衛的龍與麒麟。
 */
function towerOrnaments(b) {
  const { half, front, tower } = A
  const cx = (tower.minX + half) / 2
  const z = front + 0.02
  // 店號：洗石子框的牌面與紅褐色浮雕字
  b.box('granite', [3.6, 0.78, 0.1], [cx, 4.28, front + 0.05], { tint: STONE_LIGHT })
  b.box('granite', [3.36, 0.56, 0.04], [cx, 4.28, front + 0.11], { tint: '#cbc6bb' })
  b.addSign({ text: '屈臣氏大藥房', style: 'redRelief', width: 3.2, height: 0.5, position: [cx, 4.28, front + 0.135] })
  // 英文字樣與上方的捲草線腳
  b.addSign({ text: 'A.S. WATSON & CO.', style: 'relief', width: 3.6, height: 0.42, position: [cx, 7.5, z] })
  b.box('granite', [3.9, 0.08, 0.1], [cx, 7.85, front + 0.05], { tint: STONE_LIGHT })
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.add('granite', new CylinderGeometry(0.1 - i * 0.02, 0.1 - i * 0.02, 0.06, 12), {
        position: [cx + s * (0.45 + i * 0.42), 8.05 + (i % 2) * 0.04, front + 0.06],
        rotation: [Math.PI / 2, 0, 0],
        tint: STONE_LIGHT,
      })
    }
    b.box('granite', [1.25, 0.05, 0.06], [cx + s * 0.85, 8.0, front + 0.05], { rotation: [0, 0, s * 0.08], tint: STONE_LIGHT })
  }
  b.add('granite', new SphereGeometry(0.13, 12, 8), { position: [cx, 8.05, front + 0.06], scale: [1.4, 1, 0.5], tint: STONE_LIGHT })
  // 七層寶塔（逐層縮小的塔身與屋簷，帶一點紅色）
  const py = 10.75
  for (let i = 0; i < 7; i++) {
    const w = 0.5 - i * 0.05
    b.box('granite', [w, 0.1, 0.08], [cx, py + i * 0.14, front + 0.06], { tint: '#d2c5b6' })
    b.box('granite', [w + 0.14, 0.035, 0.1], [cx, py + i * 0.14 + 0.065, front + 0.07], { tint: '#b6705e' })
  }
  b.box('granite', [0.04, 0.16, 0.06], [cx, py + 1.05, front + 0.06], { tint: '#b6705e' })
  // 兩側的龍（左）與麒麟（右）：簡化成弧形的身體與頭
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const t = i / 4
      b.add('granite', new SphereGeometry(0.09 - t * 0.02, 10, 8), {
        position: [cx + s * (0.95 - t * 0.55), py + 0.2 + Math.sin(t * Math.PI) * 0.35, front + 0.06],
        scale: [1.6, 1, 0.5],
        tint: '#cfc9bf',
      })
    }
    b.add('granite', new SphereGeometry(0.11, 10, 8), { position: [cx + s * 0.36, py + 0.55, front + 0.07], scale: [1.2, 1, 0.55], tint: '#cfc9bf' })
    // 浮雕兩旁的直書小字框（字太小，只做框）
    b.box('granite', [0.12, 0.9, 0.03], [cx + s * 1.45, py + 0.45, front + 0.03], { tint: '#b6705e' })
  }
}

/** 「小藝埕 ArtYard」紅褐色垂掛旗幟：掛在巷子側的壁柱與迪化街側西側的壁柱上 */
function banners(b) {
  const { half, front, tower } = A
  const hang = (x, z, rotationY) => {
    b.group([x, 0, z], rotationY, () => {
      // 本地：+x 離開牆面，旗面在 xy 平面上
      b.cylinder('steel', 0.02, 0.02, 0.9, 6, [0.45, 7.15, 0], { rotation: [0, 0, Math.PI / 2], tint: '#3a3a38' })
      b.box('cloth', [0.62, 1.7, 0.02], [0.52, 6.25, 0], { tint: '#7b3a31' })
      for (const s of [-1, 1]) {
        b.addSign({ text: '小藝埕', style: 'artYard', vertical: true, width: 0.5, height: 1.15, position: [0.52, 6.45, s * 0.012], rotationY: s > 0 ? 0 : Math.PI })
        b.addSign({ text: 'ArtYard', style: 'artYardLatin', width: 0.5, height: 0.16, position: [0.52, 5.62, s * 0.012], rotationY: s > 0 ? 0 : Math.PI })
      }
    })
  }
  for (const z of [tower.minZ, ...A.sideBays.slice(1, -1)]) hang(half + 0.12, z, 0)
  hang(-half + 0.25, front + 0.12, -Math.PI / 2)
  hang(tower.minX, front + 0.12, -Math.PI / 2)
}

/* ── 樓梯（看得見的階梯）與樓梯間 ─────────────── */

function staircase(b) {
  const { flight1, flight2, landing, run, pad, top, wellMinZ, wellMaxZ } = ST
  const H2 = A.floor2
  const STEP = '#a75c3e' // 深色陶磚的踏面
  const RISE = '#e4dccd'
  // 入口內的平地
  const padX0 = run.lower - 0.5 * TREAD
  b.box('terracotta', [pad.maxX - padX0, 0.04, flight1.maxZ - flight1.minZ], [(padX0 + pad.maxX) / 2, 0.02, (flight1.minZ + flight1.maxZ) / 2], { tint: '#d9b49a' })
  // 第一段：往西上（看得見的踏階；碰撞是看不見的斜面）
  const fw = flight1.maxZ - flight1.minZ
  const fz = (flight1.minZ + flight1.maxZ) / 2
  for (let k = 1; k < ST.steps; k++) {
    const x1 = run.lower - (k - 0.5) * TREAD
    const x0 = run.lower - (k + 0.5) * TREAD
    const y = k * RISER
    b.box('stucco', [x1 - x0, y - 0.03, fw], [(x0 + x1) / 2, (y - 0.03) / 2, fz], { tint: RISE })
    b.box('terracotta', [x1 - x0 + 0.03, 0.035, fw], [(x0 + x1) / 2 - 0.015, y - 0.017, fz], { tint: STEP })
  }
  // 半樓的迴轉平台（兩段之間）
  const lx1 = run.upper + 0.5 * TREAD
  const lw = flight2.maxZ - flight1.minZ
  b.box('stucco', [lx1 - landing.minX, landing.y - 0.03, lw], [(landing.minX + lx1) / 2, (landing.y - 0.03) / 2, (flight1.minZ + flight2.maxZ) / 2], { tint: RISE })
  b.box('terracotta', [lx1 - landing.minX, 0.035, lw], [(landing.minX + lx1) / 2, landing.y - 0.017, (flight1.minZ + flight2.maxZ) / 2], { tint: STEP })
  // 第二段：往東上
  const gw = flight2.maxZ - flight2.minZ
  const gz = (flight2.minZ + flight2.maxZ) / 2
  for (let k = 1; k < ST.steps; k++) {
    const x0 = run.upper + (k - 0.5) * TREAD
    const x1 = run.upper + (k + 0.5) * TREAD
    const y = landing.y + k * RISER
    b.box('stucco', [x1 - x0, y - 0.03, gw], [(x0 + x1) / 2, (y - 0.03) / 2, gz], { tint: RISE })
    b.box('terracotta', [x1 - x0 + 0.03, 0.035, gw], [(x0 + x1) / 2 + 0.015, y - 0.017, gz], { tint: STEP })
  }
  // 二樓的樓梯平台（與咖啡館的地板同高）
  const tx0 = run.lower - 0.5 * TREAD
  b.box('plain', [top.maxX - tx0, A.slab, wellMaxZ - wellMinZ], [(tx0 + top.maxX) / 2, H2 - A.slab / 2, (wellMinZ + wellMaxZ) / 2], { tint: '#e8e2d6' })
  b.box('terracotta', [top.maxX - tx0, 0.035, wellMaxZ - wellMinZ], [(tx0 + top.maxX) / 2, H2 + 0.017, (wellMinZ + wellMaxZ) / 2], { tint: '#ffffff' })
  // 兩段之間的矮牆（頂部跟著第二段的斜度）與木扶手
  const divZ = (flight1.maxZ + flight2.minZ) / 2
  const divT = flight2.minZ - flight1.maxZ
  for (let k = 0; k < 4; k++) {
    const x0 = run.upper + 0.5 * TREAD + k * ((run.lower - run.upper - TREAD) / 4)
    const x1 = x0 + (run.lower - run.upper - TREAD) / 4
    const h = landing.y + ((x1 - run.upper) / (run.lower - run.upper)) * (H2 - landing.y) + 0.85
    b.box('stucco', [x1 - x0, h, divT], [(x0 + x1) / 2, h / 2, divZ], { tint: '#ece6da' })
  }
  const slope = Math.atan2(H2 - landing.y, run.lower - run.upper)
  const railLen = Math.hypot(run.lower - run.upper, H2 - landing.y)
  b.box('wood', [railLen, 0.07, 0.09], [(run.lower + run.upper) / 2, (landing.y + H2) / 2 + 0.95, divZ], { rotation: [0, 0, slope], tint: '#6e4a2f' })
  // 牆邊扶手（第一段沿後牆，第二段沿咖啡館的牆）
  b.box('wood', [Math.hypot(run.lower - run.upper, landing.y), 0.06, 0.06], [(run.lower + run.upper) / 2, landing.y / 2 + 0.9, wellMinZ + 0.07], { rotation: [0, 0, -Math.atan2(landing.y, run.lower - run.upper)], tint: '#6e4a2f' })
  b.box('wood', [railLen, 0.06, 0.06], [(run.lower + run.upper) / 2, (landing.y + H2) / 2 + 0.9, wellMaxZ - 0.07], { rotation: [0, 0, slope], tint: '#6e4a2f' })
  // 二樓平台面向樓梯井的欄杆
  const railZ0 = wellMinZ + 0.05
  const railZ1 = flight2.minZ - 0.1
  b.box('wood', [0.07, 0.06, railZ1 - railZ0], [tx0 + 0.04, H2 + 0.95, (railZ0 + railZ1) / 2], { tint: '#6e4a2f' })
  for (let i = 0; i < 5; i++) b.box('steel', [0.025, 0.9, 0.025], [tx0 + 0.04, H2 + 0.48, railZ0 + 0.1 + i * ((railZ1 - railZ0 - 0.2) / 4)], { tint: '#3b3631' })
  // 樓梯間的牆（白色灰泥）：後牆、西側的牆、與咖啡館之間的牆（一樓部分）
  const wallTop = A.ceiling2
  b.box('plaster', [ST.pad.maxX - landing.minX, wallTop, 0.06], [(landing.minX + ST.pad.maxX) / 2, wallTop / 2, wellMinZ + 0.03], { tint: '#f1ebdf' })
  b.box('plaster', [0.2, wallTop, wellMaxZ - wellMinZ], [landing.minX - 0.1, wallTop / 2, (wellMinZ + wellMaxZ) / 2], { tint: '#f1ebdf' })
  b.box('plaster', [ST.pad.maxX - landing.minX, H2, 0.2], [(landing.minX + ST.pad.maxX) / 2, H2 / 2, wellMaxZ + 0.1], { tint: '#f1ebdf' })
  // 樓梯間的天花與燈
  b.box('plaster', [A.half - landing.minX, 0.08, wellMaxZ - wellMinZ], [(landing.minX + A.half) / 2, wallTop + 0.04, (wellMinZ + wellMaxZ) / 2], { tint: '#f6f2ea' })
  b.cylinder('bulb', 0.18, 0.18, 0.06, 14, [0, wallTop - 0.04, -13.8], { tint: '#fff4dc' })
  b.addGlow(0, wallTop - 0.4, -13.8, 1.4, '#ffe6bb')
  b.addGlow(1.9, 2.4, (flight1.minZ + flight1.maxZ) / 2, 1.0, '#ffe6bb')
  // 樓梯口牆上的小黑板（原創的簡單字樣）
  b.box('dark', [0.04, 0.6, 0.8], [landing.minX + 0.03, landing.y + 1.5, (flight1.minZ + flight1.maxZ) / 2], { tint: '#2c3431' })
  b.addSign({ text: '二樓 咖啡', style: 'chalk', width: 0.7, height: 0.3, position: [landing.minX + 0.055, landing.y + 1.5, (flight1.minZ + flight1.maxZ) / 2], rotationY: Math.PI / 2 })
}

/* ── 二樓咖啡館的空殼（地板、牆、天花、柱與門） ─────────────── */

/** 咖啡館裡的方柱（從地板到天花） */
export const CAFE_PILLARS = [
  [-1.35, -6.05],
  [-1.35, -9.2],
]

function cafeShell(b) {
  const { minX, maxX, minZ, maxZ, door } = CAFE
  const H2 = A.floor2
  const C = A.ceiling2
  // 地板：橘紅色陶磚（樓板底是騎樓的天花）
  b.box('plain', [A.half - 0.12 + A.half - 0.2, A.slab, A.front - 0.12 - minZ], [(A.half - 0.12 - A.half + 0.2) / 2, H2 - A.slab / 2, (minZ + A.front - 0.12) / 2], { tint: '#d9d2c6' })
  b.box('stone', [door.maxX - door.minX, A.slab + 0.035, 0.2], [(door.minX + door.maxX) / 2, H2 - A.slab / 2 + 0.017, minZ - 0.1], { tint: '#b9b2a6' })
  // 店內的地板：室內細部還沒產生時是暗色（從窗外看進去是暗的），產生後由 luguoCafeInterior.js 蓋上陶磚地板
  b.box('dark', [maxX - minX, 0.02, maxZ - minZ], [(minX + maxX) / 2, H2 + 0.01, (minZ + maxZ) / 2], { tint: '#4a3b31' })
  // 西牆（與鄰棟的界牆）與北牆（與樓梯間之間，留玻璃門）
  b.box('plaster', [0.05, C - H2, maxZ - minZ], [minX - 0.025, (H2 + C) / 2, (minZ + maxZ) / 2], { tint: PLASTER })
  wallWithOpenings(b, {
    along: 'x',
    plane: minZ,
    inward: -1,
    from: minX - 0.05,
    to: maxX + 0.13,
    y0: H2,
    y1: C,
    t: 0.2,
    openings: [{ a0: door.minX, a1: door.maxX, y0: H2, y1: H2 + 2.35 }],
    material: 'plaster',
    tint: PLASTER,
    grime: 0,
  })
  // 天花、橫梁（開間線上）與方柱
  b.box('plaster', [maxX - minX + 0.25, 0.1, maxZ - minZ + 0.25], [(minX + maxX) / 2, C + 0.05, (minZ + maxZ) / 2], { tint: '#f8f4ec' })
  for (const z of [A.tower.minZ, -6.05, -9.2]) b.box('plaster', [maxX - minX, 0.42, 0.36], [(minX + maxX) / 2, C - 0.21, z], { tint: '#f1ebdf' })
  b.box('plaster', [0.36, 0.42, maxZ - minZ], [A.tower.minX, C - 0.21, (minZ + maxZ) / 2], { tint: '#f1ebdf' })
  for (const [x, z] of CAFE_PILLARS) {
    b.box('plaster', [0.46, C - H2, 0.46], [x, (H2 + C) / 2, z], { tint: '#f4eee3' })
    b.box('wood', [0.5, 0.12, 0.5], [x, H2 + 0.06, z], { tint: '#6e4a2f' })
  }
  // 牆腳的木踢腳板
  b.box('wood', [0.03, 0.12, maxZ - minZ], [minX + 0.015, H2 + 0.06, (minZ + maxZ) / 2], { tint: '#6e4a2f' })
  // 玻璃門：深棕色木框、四格玻璃，推開後貼在店內的北牆上（門口不擋路）；門上的門弓器與緊急出口燈
  const w = door.maxX - door.minX
  b.group([door.minX - w / 2, H2, minZ + 0.06], 0, () => {
    b.box('wood', [0.07, 2.3, 0.06], [-w / 2 + 0.035, 1.15, 0], { tint: FRAME })
    b.box('wood', [0.07, 2.3, 0.06], [w / 2 - 0.035, 1.15, 0], { tint: FRAME })
    for (const y of [0.05, 0.75, 1.3, 1.82, 2.27]) b.box('wood', [w, 0.07, 0.06], [0, y, 0], { tint: FRAME })
    b.box('glassClear', [w - 0.08, 2.2, 0.02], [0, 1.15, 0.0], {})
    // 門上的紅色春聯方塊（原創字樣）
    b.box('plain', [0.34, 0.34, 0.015], [0, 1.6, 0.04], { rotation: [0, 0, Math.PI / 4], tint: '#c8342c' })
    b.addSign({ text: '福', style: 'redPlate', width: 0.2, height: 0.2, position: [0, 1.6, 0.05] })
  })
  b.box('steel', [0.42, 0.06, 0.06], [door.minX + 0.35, H2 + 2.3, minZ + 0.05], { tint: '#9a9c9b' })
  b.box('plain', [0.56, 0.22, 0.1], [(door.minX + door.maxX) / 2, H2 + 2.62, minZ + 0.06], { tint: '#f1f1ee' })
  b.addSign({ text: 'EXIT', style: 'exitGreen', width: 0.48, height: 0.16, position: [(door.minX + door.maxX) / 2, H2 + 2.62, minZ + 0.115] })
}

/* ── 碰撞、遮擋、室內與觀賞範圍 ─────────────────── */

/** 建築本地的矩形 → 世界座標（transform 由年代配置傳入，也可以用 artYardToWorld） */
function worldRect(transform, minX, maxX, minZ, maxZ, extra = {}) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z), ...extra }
}

/** 樓梯斜面（建築本地 x → 世界 x；建築沒有旋轉，所以 from／to 只要平移） */
function rampWorld(transform, fromX, toX, y0, y1) {
  return { axis: 'x', from: transform(fromX, 0).x, to: transform(toX, 0).x, y0, y1 }
}

/**
 * 角色的可行走範圍與障礙物（世界座標），分樓層：
 * 一樓（level 0）是迪化街側與巷子側的騎樓、32巷、樓梯入口；樓梯（看不見的連續斜面）連到二樓；
 * 二樓（level 1）是樓梯平台、玻璃門與咖啡館。家具的障礙物見 luguoCafeInterior.js 的 cafeObstacles（同一份配置）。
 */
export function luguoCollision(config, transform = (x, z) => artYardToWorld(x, z)) {
  const rect = (...args) => worldRect(transform, ...args)
  const { half, front, arcadeWallX: wx, back } = A
  const { door, pad, run, flight1, flight2, landing, top } = ST
  const H2 = A.floor2
  const walkable = [
    // 一樓：迪化街側的騎樓（與街道的可行走範圍重疊）、巷子側的騎樓、32巷（與廣場重疊）
    rect(-half + 0.2, half + 0.45, -0.05, front + 0.4),
    rect(wx + 0.15, half + 0.45, back + 0.25, front + 0.4),
    rect(LANE.minX + 0.05, LANE.maxX - 0.05, LANE.minZ + 0.3, LANE.mouthZ + 0.5),
    // 樓梯入口（穿過騎樓的牆）與入口內的平地
    rect(pad.minX - 0.1, wx + 0.55, door.minZ + 0.05, door.maxZ - 0.05),
    rect(pad.minX - 0.1, pad.maxX, flight1.minZ + 0.02, flight1.maxZ - 0.02),
    // 第一段樓梯（只在一樓），半樓平台（上下兩層都可以走），第二段樓梯（過了一半算二樓）
    rect(run.upper - 0.15, run.lower + 0.15, flight1.minZ + 0.02, flight1.maxZ - 0.02, { levels: [0, 0], ramp: rampWorld(transform, run.lower, run.upper, 0, landing.y) }),
    rect(landing.minX + 0.02, run.upper + 0.1, flight1.minZ + 0.02, flight2.maxZ - 0.02, { levels: [0, 1], floorY: landing.y }),
    rect(run.upper - 0.15, run.lower + 0.15, flight2.minZ + 0.02, flight2.maxZ - 0.02, { levels: [0, 1], ramp: rampWorld(transform, run.upper, run.lower, landing.y, H2) }),
    // 二樓：樓梯平台、玻璃門、咖啡館
    rect(top.minX - 0.1, top.maxX - 0.08, flight1.minZ + 0.02, flight2.maxZ + 0.25, { level: 1, floorY: H2 }),
    rect(CAFE.door.minX + 0.05, CAFE.door.maxX - 0.05, flight2.maxZ - 0.3, CAFE.minZ + 0.45, { level: 1, floorY: H2 }),
    rect(CAFE.minX + 0.05, CAFE.maxX - 0.05, CAFE.minZ + 0.03, CAFE.maxZ - 0.03, { level: 1, floorY: H2 }),
  ]
  const inset = A.columnInset
  const column = (x, z) => rect(x - 0.33, x + 0.33, z - 0.33, z + 0.33)
  const obstacles = [
    // 騎樓柱
    ...[-half + inset, A.tower.minX, half - inset].map((x) => column(x, front - inset)),
    ...A.sideBays.filter((z) => z > back).map((z) => column(half - inset, z)),
    column(half - inset, back + inset),
    // 樓梯入口旁的木製立牌與盆栽、推開的門扇
    rect(wx + 0.02, wx + 0.66, door.maxZ + 0.24, door.maxZ + 0.76),
    rect(wx + 0.12, wx + 0.58, door.minZ - 0.68, door.minZ - 0.22),
    rect(wx + 0.02, wx + 0.86, door.minZ - 0.16, door.minZ - 0.08),
    // 巷子東側老屋門口的盆栽
    rect(LANE.maxX - 0.3, LANE.maxX + 0.1, -11.95, -11.55),
    // 二樓：咖啡館的方柱與推開的玻璃門
    ...CAFE_PILLARS.map(([x, z]) => ({ ...rect(x - 0.25, x + 0.25, z - 0.25, z + 0.25), level: 1 })),
    { ...rect(2 * CAFE.door.minX - CAFE.door.maxX - 0.02, CAFE.door.minX, CAFE.minZ, CAFE.minZ + 0.12), level: 1 },
    // 巷口路名牌的柱子
    rect(LANE.maxX - 0.47, LANE.maxX - 0.23, LANE.mouthZ - 0.52, LANE.mouthZ - 0.28),
  ]
  return { walkable, obstacles }
}

/** 建築、巷子與鄰棟的佔地（範圍內不產生遠景房屋與樹） */
export function luguoFootprint(transform) {
  return worldRect(transform, -A.half, LANE.maxX + 5.8, LANE.minZ - 6.6, 0)
}

/** 鏡頭遮擋（建築本地座標）：一樓店面、樓梯間、二樓的牆與地板、三樓以上與塔樓 */
function registerBlockers(b) {
  const { half, front, back, arcadeWallX: wx, wallT, tower } = A
  const { flight1, flight2, landing, run, wellMinZ, wellMaxZ, door } = ST
  const H = A.floor2 - A.slab
  const H2 = A.floor2
  const C = A.ceiling2
  // 一樓：迪化街側與巷子側的店面（騎樓後面的實心）、樓梯間以外的部分
  b.addBlocker(-half, wx, 0, H, wellMaxZ + 0.2, 0)
  b.addBlocker(-half, landing.minX - 0.2, 0, H, back, wellMaxZ + 0.2)
  // 巷子側的牆在樓梯入口兩側
  b.addBlocker(wx - wallT, wx, 0, H, back, door.minZ)
  b.addBlocker(wx - wallT, wx, 0, H, door.maxZ, wellMaxZ + 0.2)
  b.addBlocker(wx - wallT, wx, 2.65, H, door.minZ, door.maxZ)
  // 騎樓柱與騎樓天花（二樓樓板）
  const inset = A.columnInset
  for (const x of [-half + inset, tower.minX, half - inset]) b.addBlocker(x - 0.3, x + 0.3, 0, H, front - inset - 0.3, front - inset + 0.3)
  for (const z of [...A.sideBays.filter((z) => z > back), back + inset]) b.addBlocker(half - inset - 0.3, half - inset + 0.3, 0, H, z - 0.3, z + 0.3)
  b.addBlocker(-half, half, H, H2, CAFE.minZ - 0.2, front)
  b.addBlocker(wx, half, H, H2, back, CAFE.minZ - 0.2)
  // 樓梯間：後牆、西牆、樓梯的實心（分段的階梯量體）與兩段之間的矮牆
  b.addBlocker(landing.minX - 0.2, half, 0, C, back, wellMinZ)
  b.addBlocker(landing.minX - 0.2, landing.minX, 0, C, wellMinZ, wellMaxZ)
  for (let k = 0; k < 4; k++) {
    const x1 = run.lower - k * ((run.lower - run.upper) / 4)
    const x0 = x1 - (run.lower - run.upper) / 4
    b.addBlocker(x0, x1, 0, (landing.y * (run.lower - x1)) / (run.lower - run.upper) + 0.05, flight1.minZ, flight1.maxZ)
    const g0 = run.upper + k * ((run.lower - run.upper) / 4)
    b.addBlocker(g0, g0 + (run.lower - run.upper) / 4, 0, landing.y + ((H2 - landing.y) * (g0 - run.upper)) / (run.lower - run.upper) + 0.05, flight2.minZ, flight2.maxZ)
  }
  b.addBlocker(landing.minX, run.upper, 0, landing.y - 0.05, flight1.minZ, flight2.maxZ)
  // 兩段之間的矮牆與扶手（頂部跟著第二段的斜度）
  for (let k = 0; k < 4; k++) {
    const x0 = run.upper + k * ((run.lower - run.upper) / 4)
    const x1 = x0 + (run.lower - run.upper) / 4
    const h = landing.y + ((x1 - run.upper) / (run.lower - run.upper)) * (H2 - landing.y) + 1.0
    b.addBlocker(x0, x1, 0, h, flight1.maxZ - 0.02, flight2.minZ + 0.02)
  }
  b.addBlocker(run.lower - 0.5 * TREAD, half, H, H2, wellMinZ, wellMaxZ)
  // 二樓：西牆、東牆（巷子側立面）、迪化街側立面、北牆（玻璃門以外）、天花與三樓以上
  b.addBlocker(-half, CAFE.minX, H2, C, back, front)
  b.addBlocker(CAFE.maxX, half, H2, C, back, front)
  b.addBlocker(-half, half, H2, C, CAFE.maxZ, front)
  b.addBlocker(-half, CAFE.door.minX, H2, C, CAFE.minZ - 0.2, CAFE.minZ)
  b.addBlocker(CAFE.door.maxX, half, H2, C, CAFE.minZ - 0.2, CAFE.minZ)
  b.addBlocker(CAFE.door.minX, CAFE.door.maxX, H2 + 2.35, C, CAFE.minZ - 0.2, CAFE.minZ)
  b.addBlocker(-half, half, C, A.parapet, back, front)
  b.addBlocker(tower.minX, half, A.parapet, A.towerParapet + 0.4, tower.minZ, front)
  b.addBlocker(-half, landing.minX, H2, C, back, CAFE.minZ)
  // 咖啡館的方柱
  for (const [x, z] of CAFE_PILLARS) b.addBlocker(x - 0.23, x + 0.23, H2, C, z - 0.23, z + 0.23)
}

/* ── 主程式 ─────────────────────────────── */

export function buildLuguoCafe(b) {
  lane(b)
  laneNeighbours(b)
  arcades(b)
  groundShops(b)
  upperFacades(b)
  staircase(b)
  cafeShell(b)
  registerBlockers(b)

  // 店裡的資訊熱點與鄰棟：各自成為一棟可以點選、聚焦的「建築」
  const subStores = []
  const addSub = (id, storeId, boxes, focus, extra = {}) => {
    const start = b.blockers.length
    for (const box of boxes) b.addBlocker(...box)
    subStores.push({ id, storeId, range: { start, end: b.blockers.length }, focus, ...extra })
  }
  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const H2 = A.floor2
  const { door } = ST
  const { bar } = CAFE
  const dz = (door.minZ + door.maxZ) / 2
  // 樓梯入口（木製招牌）：探索時點它開啟介紹，觀賞模式點它聚焦入口
  addSub('luguo-stairs', 'luguo-cafe', [[A.arcadeWallX, A.arcadeWallX + 0.18, 2.72, 3.7, door.minZ - 0.45, door.maxZ + 0.45]], {
    center: toWorld(A.arcadeWallX, dz),
    forward: dir(1, 0),
    width: 2.4,
    height: 3.6,
    viewHeight: 1.9,
    maxDistance: 4.5,
    maxPitch: 0.35,
    maxYawOffset: 0.6,
  }, { detail: true, hotspot: 'stairs' })
  // 咖啡吧檯
  addSub('luguo-bar', 'luguo-cafe', [[bar.counterX - 0.35, bar.counterX + 0.35, H2, H2 + 1.12, bar.minZ, bar.maxZ]], {
    center: toWorld(bar.counterX + 0.35, (bar.minZ + bar.maxZ) / 2),
    forward: dir(1, 0),
    width: 4.2,
    height: 2.4,
    viewHeight: H2 + 1.25,
    maxDistance: 3.6,
    maxPitch: 0.5,
    maxYawOffset: 0.7,
  }, { detail: true, hotspot: 'bar' })
  // 窗邊座位（中間一組窗前的桌子與扶手椅）
  addSub('luguo-window', 'luguo-cafe', [[2.15, 3.8, H2, H2 + 0.9, -8.15, -7.05]], {
    center: toWorld(CAFE.maxX - 0.2, -7.6),
    forward: dir(-1, 0),
    width: 6.4,
    height: 3.2,
    viewHeight: H2 + 1.3,
    maxDistance: 4.2,
    maxPitch: 0.45,
    maxYawOffset: 0.8,
  }, { detail: true, hotspot: 'window' })
  // 紅色扭蛋機
  const { gacha } = CAFE
  addSub('luguo-gacha', 'luguo-cafe', [[gacha.x - 0.3, gacha.x + 0.3, H2, H2 + 1.75, CAFE.minZ, gacha.z + 0.3]], {
    center: toWorld(gacha.x, gacha.z + 0.3),
    forward: dir(0, 1),
    width: 1.6,
    height: 2.2,
    viewHeight: H2 + 1.0,
    maxDistance: 2.6,
    maxPitch: 0.4,
    maxYawOffset: 0.6,
  }, { detail: true, hotspot: 'gacha' })
  // 巷子東側的紅磚老屋與巷底的街屋（不屬於小藝埕）
  addSub('luguo-lane-brick', null, [[LANE.maxX + 0.1, LANE.maxX + 5.7, 0, 7.5, LANE.minZ, -11.4]], {
    center: toWorld(LANE.maxX + 0.1, (LANE.minZ - 11.4) / 2),
    forward: dir(-1, 0),
    width: 5.2,
    height: 7.5,
    viewHeight: 3.4,
    maxDistance: 8,
    maxPitch: 0.4,
  })
  addSub('luguo-lane-end', null, [[A.half - 0.6, LANE.maxX + 1.4, 0, 10.8, LANE.minZ - 6.1, LANE.minZ - 0.1]], {
    center: toWorld((A.half + LANE.maxX) / 2, LANE.minZ - 0.1),
    forward: dir(0, 1),
    width: 6.6,
    height: 10.8,
    viewHeight: 4,
    maxDistance: 12,
    maxPitch: 0.4,
  })

  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const rect = (minX, maxX, minZ, maxZ, extra = {}) => worldRect((x, z) => toWorld(x, z), minX, maxX, minZ, maxZ, extra)
  const { flight1, flight2, landing, run, top, wellMinZ, wellMaxZ } = ST
  const stairsPart = rect(landing.minX, A.arcadeWallX, wellMinZ, wellMaxZ, { levels: [0, 1] })
  const topPart = rect(A.arcadeWallX, CAFE.maxX, wellMinZ, wellMaxZ, { level: 1 })
  const cafePart = rect(CAFE.minX, CAFE.maxX, wellMaxZ, CAFE.maxZ, { level: 1 })
  const parts = [stairsPart, topPart, cafePart]
  const bounds = {
    minX: Math.min(...parts.map((p) => p.minX)),
    maxX: Math.max(...parts.map((p) => p.maxX)),
    minZ: Math.min(...parts.map((p) => p.minZ)),
    maxZ: Math.max(...parts.map((p) => p.maxZ)),
  }
  const doorPoint = toWorld(A.arcadeWallX, dz)
  const towerCenter = (A.tower.minX + A.half) / 2

  return {
    groundHeight: A.floor2,
    topHeight: A.towerParapet,
    // 提示框（沒有靠近任何熱點時的預設位置：吧檯上方）與屋頂標記（塔樓上方）
    anchors: { prompt: local(bar.counterX, H2 + 1.75, -1.0), marker: local(towerCenter, A.towerParapet + 2.6, 0) },
    // 觀賞模式聚焦小藝埕：從迪化街上看轉角塔樓的正面
    focus: {
      center: toWorld(towerCenter - 1.2, A.front),
      forward: dir(0, 1),
      width: 2 * A.half,
      height: A.towerParapet,
      viewHeight: 6.5,
      maxDistance: 16,
      maxPitch: 0.5,
    },
    subStores,
    interiors: [
      {
        id: 'luguo-cafe',
        ...bounds,
        // 樓梯間（上下兩層）、二樓的樓梯平台與店內
        parts,
        ceiling: A.ceiling2,
        // 入口：巷子側騎樓上的樓梯入口前；越靠近入口越接近室內鏡頭
        entry: rect(A.arcadeWallX, A.half + 0.6, door.minZ - 2.4, door.maxZ + 2.4, { level: 0 }),
        entryHold: 0.5,
        entryRamp: 2.4,
        door: doorPoint,
        // 樓梯間與二樓：鏡頭較近、較低，高度上限在天花板（7.5 m）與梁的下方
        camera: { distance: 3.2, maxHeight: A.ceiling2 - 0.55, minPitch: 0.06, maxPitch: 0.62, lookHeight: 1.45, minDistance: 0.6 },
        viewerStart: { distance: 3.4 },
        // 按需載入：走到小藝埕附近（迪化街街尾、32巷、永樂市場前廣場）才產生；出發點（約 15 m 外）還不產生
        loadRadius: 14,
        showRadius: 22,
      },
    ],
    // 觀賞模式：注視點可以進到巷子、兩側騎樓、樓梯入口、沿著樓梯走上二樓，再穿過玻璃門進到店裡
    viewerRegions: [
      { ...rect(LANE.minX + 0.3, LANE.maxX - 0.3, LANE.minZ + 0.4, LANE.mouthZ + 0.6), maxY: 9 },
      { ...rect(A.arcadeWallX + 0.35, A.half + 0.5, A.back + 0.4, A.front + 0.5), maxY: 2.9, cameraMaxY: 3.45 },
      { ...rect(-A.half + 0.4, A.half + 0.5, 0.35, A.front + 0.5), maxY: 2.9, cameraMaxY: 3.45 },
      { ...rect(ST.pad.minX - 0.2, A.arcadeWallX + 0.6, door.minZ + 0.2, door.maxZ - 0.2), maxY: 2.3, cameraMaxY: 2.6 },
      { ...rect(run.upper, run.lower, flight1.minZ + 0.25, flight1.maxZ - 0.25), ramp: rampWorld((x, z) => toWorld(x, z), run.lower, run.upper, 0, landing.y), minY: 0.8, maxY: 2.4, cameraMaxY: 3.2 },
      { ...rect(landing.minX + 0.3, run.upper + 0.2, flight1.minZ + 0.25, flight2.maxZ - 0.25), minY: landing.y + 0.8, maxY: landing.y + 2.4, cameraMaxY: landing.y + 3.6 },
      { ...rect(run.upper, run.lower, flight2.minZ + 0.25, flight2.maxZ - 0.25), ramp: rampWorld((x, z) => toWorld(x, z), run.upper, run.lower, landing.y, A.floor2), minY: 0.8, maxY: 2.4, cameraMaxY: 3.2 },
      { ...rect(top.minX - 0.2, top.maxX - 0.3, flight2.minZ + 0.25, flight2.maxZ), minY: H2 + 0.8, maxY: H2 + 2.0, cameraMaxY: A.ceiling2 - 0.4 },
      { ...rect(CAFE.door.minX + 0.2, CAFE.door.maxX - 0.2, flight2.maxZ - 0.2, CAFE.minZ + 0.4), minY: H2 + 0.8, maxY: H2 + 2.0, cameraMaxY: H2 + 2.3 },
      { ...rect(CAFE.minX + 0.4, CAFE.maxX - 0.4, CAFE.minZ + 0.4, CAFE.maxZ - 0.4), minY: H2 + 0.8, maxY: H2 + 2.4, cameraMaxY: A.ceiling2 - 0.6 },
    ],
    viewerBounds: { minZ: toWorld(0, LANE.minZ - 3).z },
    // 32巷與兩側騎樓：人物可以貼著牆、柱走，第三人稱鏡頭在這裡停在障礙物前面
    followAreas: [
      rect(LANE.minX, LANE.maxX, LANE.minZ, LANE.mouthZ),
      rect(A.arcadeWallX, A.half + 0.2, A.back, A.front + 0.2),
      rect(-A.half, A.half + 0.2, 0, A.front + 0.2),
    ],
  }
}

export { LANE as LUGUO_LANE, TREAD as LUGUO_TREAD, RISER as LUGUO_RISER, WIN2 as LUGUO_WIN2, frontOpenings, orient, sideOpenings, wallWithOpenings, woodWindow }
