import { IcosahedronGeometry, Shape, TorusGeometry } from 'three'
import { SHOWA_FACADE, SHOWA_GABLE, SHOWA_OUTSIDE, SHOWA_SHELL, SHOWA_VARIANT, showaToWorld } from '../../../data/showaLaundryLayout.js'
import { bench, bicycle, pottedPlant, shade } from '../props.js'
import { createShopInterior } from '../shopInterior.js'
import { SHOWA_FURNITURE } from './showaLaundryFurniture.js'

/**
 * 昭和浪漫洗濯屋（安西街3號；只在 2000–現在「老屋新生」）：河岸廣場東南角的轉角老屋。
 *
 * 依使用者提供的照片（2026-11-02）建模，尺寸由照片估算（不是測量），長立面比真實少一個開間：
 * - 沿街的長立面：灰白斑駁的水泥牆、綠木框窗、白框玻璃門（門牌 3）、門左側紅底白字的「僑隆洗染」直式舊招牌、
 *   牆上兩行大字「昭和浪漫洗濯屋／アイスクリーム專売店」、窗上的鐵皮雨遮、嵌在牆裡的紅色販賣機
 * - 低坡的鐵皮兩坡頂，屋脊、簷口與山牆邊緣是紅色的收邊
 * - 朝廣場的山牆：頂上的木框小窗、「台北・大稻埕」、黃底「隱身於街角的霜淇淋專賣店」、紫色暖簾、
 *   綠木框窗、長凳、白色小洗手台與盆栽
 * 一樓的室內用共用的街屋室內（shopInterior.js；器物清單見 data/showaLaundryLayout.js），二樓不開放。
 * 門口的霜淇淋模型、長凳、腳踏車與兩位路人是店外的情境（SHOWA_OUTSIDE）。
 */
const S = SHOWA_SHELL
const F = SHOWA_FACADE
const O = SHOWA_OUTSIDE

const WALL = '#c9c5bb'
const WALL_DARK = '#a9a59c'
const FRAME_GREEN = '#4e7a5c'
const TRIM_RED = '#a8382c'
const TIN = '#8e908b'

const LOOK = { floor: ['stone', '#8c867a'], wall: '#e6e0d1', ceiling: 'beams', partition: 'planks', wood: '#6e4c34' }

/** 綠木框玻璃窗（立面或山牆上；本地 x0–x1、y0–y1，z 是外牆面） */
function greenWindow(b, x0, x1, y0, y1, z, { cols = 3, rows = 2 } = {}) {
  const w = x1 - x0
  const h = y1 - y0
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  b.box('glassClear', [w - 0.06, h - 0.06, 0.03], [cx, cy, z - 0.1], { tint: '#e3ece8' })
  for (const y of [y0 + 0.03, y1 - 0.03]) b.box('wood', [w, 0.06, 0.08], [cx, y, z - 0.08], { tint: FRAME_GREEN })
  for (const x of [x0 + 0.03, x1 - 0.03]) b.box('wood', [0.06, h, 0.08], [x, cy, z - 0.08], { tint: FRAME_GREEN })
  for (let i = 1; i < cols; i++) b.box('wood', [0.035, h - 0.06, 0.05], [x0 + (w * i) / cols, cy, z - 0.09], { tint: FRAME_GREEN })
  for (let j = 1; j < rows; j++) b.box('wood', [w - 0.06, 0.035, 0.05], [cx, y0 + (h * j) / rows, z - 0.09], { tint: FRAME_GREEN })
  b.box('stone', [w + 0.08, 0.05, 0.12], [cx, y0 - 0.02, z + 0.03], { tint: WALL_DARK })
}

/** 山牆的三角形（從 z=0 到 z=-depth，屋簷到屋脊；x 是牆的外側或內側面） */
function gableTriangle(b, x, tint) {
  const shape = new Shape()
  shape.moveTo(0, S.eave)
  shape.lineTo(S.depth, S.eave)
  shape.lineTo(S.depth / 2, S.ridge)
  shape.lineTo(0, S.eave)
  b.extrude('plaster', shape, S.wallT, { position: [x, 0, 0], rotation: [0, Math.PI / 2, 0], tint, grime: 0.15 })
}

/** 外牆：正面（窗與門以外）、兩側山牆、後牆 */
function walls(b) {
  const { half, wallT, depth, eave } = S
  const openingTop = F.head
  const z = -wallT / 2
  // 正面的實牆：窗下、壁柱與窗頂以上（門是開口）
  const openings = [...F.windows.map(({ x0, x1 }) => ({ x0, x1, y0: F.sill })), { x0: SHOWA_VARIANT.door.minX, x1: SHOWA_VARIANT.door.maxX, y0: 0 }].sort((a, c) => a.x0 - c.x0)
  let cursor = -half
  for (const o of openings) {
    if (o.x0 > cursor) b.box('plaster', [o.x0 - cursor, openingTop, wallT], [(cursor + o.x0) / 2, openingTop / 2, z], { tint: WALL, grime: 0.32 })
    if (o.y0 > 0) b.box('plaster', [o.x1 - o.x0, o.y0, wallT], [(o.x0 + o.x1) / 2, o.y0 / 2, z], { tint: WALL, grime: 0.4 })
    cursor = o.x1
  }
  b.box('plaster', [half - cursor, openingTop, wallT], [(cursor + half) / 2, openingTop / 2, z], { tint: WALL, grime: 0.32 })
  b.box('plaster', [half * 2, eave - openingTop, wallT], [0, (openingTop + eave) / 2, z], { tint: WALL, grime: 0.18 })
  // 牆腳的水漬與斑駁（幾塊顏色深一點的補土）
  for (const [x, y, w, h] of [[-3.0, 3.2, 0.9, 0.5], [2.4, 4.9, 1.1, 0.3], [0.4, 2.85, 0.7, 0.2]]) b.box('plaster', [w, h, 0.02], [x, y, 0.005], { tint: shade(WALL, 0.9) })
  // 兩側山牆與後牆
  for (const s of [-1, 1]) {
    b.box('plaster', [wallT, eave, depth], [s * (half - wallT / 2), eave / 2, -depth / 2], { tint: s > 0 ? WALL : WALL_DARK, grime: 0.3 })
    gableTriangle(b, s > 0 ? half - wallT : -half, s > 0 ? WALL : WALL_DARK)
  }
  b.box('plaster', [half * 2, eave, wallT], [0, eave / 2, -depth + wallT / 2], { tint: WALL_DARK })
}

/** 低坡的鐵皮兩坡頂：屋面是波浪鐵皮，屋脊、簷口與山牆邊緣是紅色收邊 */
function roof(b) {
  const { half, depth, eave, ridge } = S
  const run = depth / 2 + 0.45
  const rise = (ridge - eave) * (run / (depth / 2))
  const len = Math.hypot(run, rise)
  const angle = Math.atan2(rise, run)
  const width = half * 2 + 0.5
  for (const s of [1, -1]) {
    const zc = s > 0 ? 0.45 - run / 2 : -depth - 0.45 + run / 2
    const yc = ridge - rise / 2 + 0.04
    b.box('shutter', [width, 0.05, len], [0, yc, zc], { tint: TIN, rotation: [s * angle, 0, 0] })
    // 簷口的紅色收邊
    b.box('plain', [width + 0.04, 0.12, 0.06], [0, ridge - rise - 0.02, s > 0 ? 0.47 : -depth - 0.47], { tint: TRIM_RED })
    // 山牆兩端沿著斜面的紅色收邊
    for (const sx of [-1, 1]) b.box('plain', [0.06, 0.14, len], [sx * (width / 2 + 0.02), yc + 0.02, zc], { tint: TRIM_RED, rotation: [s * angle, 0, 0] })
  }
  b.box('plain', [width + 0.06, 0.14, 0.26], [0, ridge + 0.1, -depth / 2], { tint: TRIM_RED })
}

/** 窗上的鐵皮雨遮與門上的紅白條紋垂簾 */
function canopy(b) {
  const { half } = S
  const y0 = 3.05
  const out = 0.95
  const drop = 0.22
  const len = Math.hypot(out, drop)
  b.box('shutter', [half * 2 + 0.1, 0.04, len], [0, y0 - drop / 2, out / 2], { tint: shade(TIN, 1.05), rotation: [Math.atan2(drop, out), 0, 0] })
  b.box('steel', [half * 2 + 0.1, 0.06, 0.04], [0, y0 - drop - 0.02, out], { tint: '#6f716d' })
  for (const x of [-half + 0.25, 0, half - 0.25]) b.box('steel', [0.03, 0.03, out], [x, y0 - 0.25, out / 2], { tint: '#5d5f5b', rotation: [0.6, 0, 0] })
  // 門楣上的紅白條紋垂簾（照片）
  const { minX, maxX } = SHOWA_VARIANT.door
  const n = 8
  for (let i = 0; i < n; i++) {
    const w = (maxX - minX + 0.3) / n
    b.box('cloth', [w, 0.24, 0.02], [minX - 0.15 + (i + 0.5) * w, 2.66, 0.02], { tint: i % 2 ? '#f3eee4' : '#c8382c' })
  }
}

/** 門：白框玻璃雙開門（白天開著，門扇貼著兩側的門框往裡開） */
function door(b) {
  const { minX, maxX } = SHOWA_VARIANT.door
  const h = F.head
  b.box('wood', [maxX - minX + 0.12, 0.08, 0.14], [(minX + maxX) / 2, h + 0.02, -0.1], { tint: '#efece4' })
  for (const [x, s] of [[minX + 0.03, 1], [maxX - 0.03, -1]]) {
    b.box('wood', [0.05, h, 0.12], [x - s * 0.03, h / 2, -0.12], { tint: '#efece4' })
    // 開著的門扇（貼著門框往室內）
    b.group([x, 0, -0.18], 0, () => {
      b.box('wood', [0.04, h - 0.05, 0.56], [0, h / 2, -0.28], { tint: '#efece4' })
      b.box('glassClear', [0.02, h - 0.5, 0.42], [0, h / 2 + 0.1, -0.28], { tint: '#e3ece8' })
      for (const y of [0.9, 1.5]) b.box('wood', [0.045, 0.03, 0.5], [0, y, -0.28], { tint: '#e6e2d8' })
    })
  }
}

/** 嵌在牆裡的紅色販賣機（照片：只看得到前半截） */
function vendingMachine(b, detail) {
  const { x0, x1, depth, height } = F.vending
  const cx = (x0 + x1) / 2
  const w = x1 - x0
  const zc = -S.wallT + depth / 2
  b.box('plain', [w, height, depth], [cx, height / 2, zc], { tint: '#c9322a' })
  const front = zc + depth / 2
  b.box('glassClear', [w - 0.12, 0.62, 0.02], [cx, 1.4, front + 0.01], { tint: '#eef2f2' })
  b.box('plain', [w - 0.12, 0.62, 0.01], [cx, 1.4, front - 0.01], { tint: '#f4f1ea' })
  b.box('dark', [w - 0.2, 0.14, 0.03], [cx, 0.32, front + 0.01], { tint: '#2b2a29' })
  b.box('plain', [w - 0.16, 0.3, 0.015], [cx, 0.78, front + 0.008], { tint: '#efe1b8' })
  const rows = detail ?? b
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 5; i++) {
      const tint = ['#d8463a', '#f2c94c', '#4f8fc0', '#7cb36a', '#f0ede6'][(i + r) % 5]
      rows.cylinder('plain', 0.028, 0.028, 0.12, 8, [x0 + 0.14 + i * 0.105, 1.18 + r * 0.2, front - 0.03], { tint })
    }
  }
}

/**
 * 山牆（朝廣場）上的小窗、字、暖簾與燈籠；x 是山牆外側面。
 * 屋脊下的小窗在山牆中央；字、暖簾與窗在看得到的前段（SHOWA_GABLE.centerZ，後段被廣場貨棧的騎樓擋住）。
 */
function gableFace(b, detail) {
  const x = S.half
  b.group([x, 0, -S.depth / 2], Math.PI / 2, () => {
    // 屋脊下的木框小窗
    b.box('glassClear', [0.62, 0.5, 0.03], [0, 5.05, -0.08], { tint: '#d9e2de' })
    for (const y of [4.79, 5.31]) b.box('wood', [0.7, 0.05, 0.07], [0, y, -0.03], { tint: '#6e5240' })
    for (const u of [-0.33, 0.33]) b.box('wood', [0.05, 0.56, 0.07], [u, 5.05, -0.03], { tint: '#6e5240' })
  })
  b.group([x, 0, SHOWA_GABLE.centerZ], Math.PI / 2, () => {
    b.addSign({ text: '台北・大稻埕', style: 'showaWall', width: 2.3, height: 0.44, position: [0, 4.1, 0.015] })
    b.addSign({ text: '隱身於街角的霜淇淋專賣店', style: 'showaYellow', width: 2.9, height: 0.3, position: [0, 3.42, 0.03] })
    b.box('wood', [3.0, 0.36, 0.03], [0, 3.42, 0.012], { tint: '#c9a66a' })
    // 雨遮與暖簾的橫桿
    b.box('shutter', [3.2, 0.04, 0.55], [0, 3.05, 0.27], { tint: TIN, rotation: [0.2, 0, 0] })
    b.box('wood', [3.1, 0.04, 0.04], [0, 2.86, 0.32], { tint: '#3a2c22' })
    // 紫色暖簾三幅（照片：みたらし団子／だんご／火男烤団子）
    const panels = [['みたらし団子', -1.0], ['だんご', 0], ['火男烤団子', 1.0]]
    for (const [text, u] of panels) {
      b.box('cloth', [0.96, 0.46, 0.015], [u, 2.62, 0.33], { tint: '#3b3358' })
      b.addSign({ text, style: 'showaNoren', width: 0.9, height: 0.3, position: [u, 2.64, 0.342] })
    }
    // 綠木框窗（暖簾下）
    greenWindow(b, -1.25, 1.25, 1.05, 2.3, 0, { cols: 4, rows: 2 })
    // 牆上的燈籠（白、紅；流暢畫質只有大的兩顆）
    const balls = [[-1.45, 2.95, '#f1ece2', 0.13], [1.45, 2.95, '#d6523e', 0.13]]
    for (const [u, y, tint, r] of balls) b.add('paper', new IcosahedronGeometry(r, 1), { position: [u, y, 0.22], tint })
    if (detail) for (const [u, y, tint] of [[-1.62, 2.8, '#e98f6a'], [1.62, 2.8, '#f1ece2']]) detail.add('paper', new IcosahedronGeometry(0.09, 1), { position: [u, y, 0.22], tint })
  })
}

/** 立面的招牌字、門牌、舊招牌與小廣告牌 */
function facadeSigns(b) {
  b.addSign({ text: '昭和浪漫洗濯屋', style: 'showaWall', width: 5.2, height: 0.86, position: [0.35, 4.55, 0.015] })
  b.addSign({ text: 'アイスクリーム專売店', style: 'showaWall', width: 5.6, height: 0.56, position: [0.55, 3.62, 0.015] })
  // 門牌（照片：門左上方的藍色門牌「3」）
  b.box('plain', [0.2, 0.14, 0.02], [-2.08, 2.55, 0.01], { tint: '#2a5aa0' })
  b.addSign({ text: '3', style: 'showaHouseNo', width: 0.16, height: 0.11, position: [-2.08, 2.55, 0.022] })
  // 「僑隆洗染」舊招牌（使用者現場確認：原本洗衣店留下來的招牌）：紅底白字的直式木牌
  const { x, y0, y1, width } = F.oldSign
  b.box('wood', [width + 0.04, y1 - y0 + 0.04, 0.04], [x, (y0 + y1) / 2, 0.02], { tint: '#7a2620' })
  b.addSign({ text: '僑隆洗染', style: 'showaOldRed', vertical: true, width, height: y1 - y0, position: [x, (y0 + y1) / 2, 0.042] })
  // 窗上的小廣告牌（復古日文字樣，不用真實品牌）
  b.addSign({ text: 'アイス', style: 'showaPlate', width: 0.5, height: 0.18, position: [1.95, 2.74, 0.015] })
  b.addSign({ text: '牛乳', style: 'showaPlate', width: 0.36, height: 0.18, position: [-2.85, 2.74, 0.015] })
  // 店內的「受付」牌與樓梯口的「二樓不開放」（招牌貼圖在街景裡；位置見器物清單）
  const bar = SHOWA_VARIANT.items.find((item) => item.type === 'bar')
  b.addSign({ text: '受付', style: 'showaPlate', width: 0.3, height: 0.12, position: [(bar.x0 + bar.x1) / 2 - 0.15, bar.height + 0.1, bar.z + bar.depth / 2 - 0.02] })
  const stairs = SHOWA_VARIANT.items.find((item) => item.type === 'stairs')
  b.addSign({ text: '二樓不開放', style: 'showaPlate', width: 0.42, height: 0.12, position: [(stairs.x0 + stairs.x1) / 2, 0.72, stairs.z1 + 0.11] })
}

/** 後棟：山牆後面較矮的鐵皮屋（只有外觀；填補取代的地段） */
function annex(b) {
  const { half } = S
  const { minZ, maxZ, height } = S.annex
  const d = maxZ - minZ
  b.box('plaster', [half * 2 - 0.1, height, d], [0, height / 2, (minZ + maxZ) / 2], { tint: WALL_DARK, grime: 0.35 })
  b.box('shutter', [half * 2 + 0.1, 0.05, d + 0.3], [0, height + 0.12, (minZ + maxZ) / 2], { tint: shade(TIN, 0.92), rotation: [-0.06, 0, 0] })
  b.box('plain', [0.08, 2.4, 0.08], [half - 0.1, 1.2, minZ + 1.5], { tint: '#8a8d88' })
}

/** 店外的小物：門口的霜淇淋模型、長凳、腳踏車；山牆一側的長凳、小洗手台與盆栽；簷下步道 */
function outside(b, detail) {
  const { half, walkD } = S
  b.box('stone', [half * 2, 0.15, walkD], [0, 0.075, walkD / 2], { tint: '#c6c1b5' })
  b.box('stone', [half * 2, 0.17, 0.2], [0, 0.085, walkD - 0.1], { tint: '#a39d91' })
  // 大型霜淇淋模型（黑色底座、餅乾甜筒、白色霜淇淋）
  const { cone } = O
  b.cylinder('dark', 0.26, 0.3, 0.12, 14, [cone.x, 0.21, cone.z], { tint: '#262524' })
  b.cylinder('plain', 0.2, 0.05, 0.85, 14, [cone.x, 0.72, cone.z], { tint: '#d29a58' })
  // 一圈圈旋上去的白色霜淇淋（照片）
  for (const [i, r] of [0.2, 0.15, 0.1].entries()) b.add('plain', new TorusGeometry(r, 0.065 - i * 0.012, 6, 16), { position: [cone.x, 1.2 + i * 0.12, cone.z], rotation: [Math.PI / 2, 0, 0.4 * i], tint: '#f5f1e8' })
  b.cylinder('plain', 0.015, 0.07, 0.14, 10, [cone.x, 1.6, cone.z], { tint: '#f5f1e8' })
  // 門口的長凳與腳踏車
  bench(b, [(O.bench.x0 + O.bench.x1) / 2, 0.15, O.bench.z], { length: O.bench.x1 - O.bench.x0 })
  bicycle(b, [O.bicycle.x, 0.15, O.bicycle.z], { tint: '#262624' })
  // 山牆一側：「牛乳」長凳、小洗手台與盆栽
  const gb = O.gableBench
  bench(b, [gb.x, 0, (gb.z0 + gb.z1) / 2], { rotationY: Math.PI / 2, length: gb.z1 - gb.z0 })
  b.addSign({ text: '牛乳', style: 'showaBench', width: 0.6, height: 0.13, position: [gb.x + 0.22, 0.38, (gb.z0 + gb.z1) / 2], rotationY: Math.PI / 2 })
  const { sink } = O
  b.box('whiteTile', [0.42, 0.22, 0.34], [sink.x, 0.82, sink.z], { tint: '#f4f3ee' })
  b.box('steel', [0.05, 0.72, 0.05], [sink.x - 0.08, 0.36, sink.z], { tint: '#9aa0a2' })
  b.box('steel', [0.03, 0.12, 0.03], [S.half + 0.03, 1.05, sink.z], { tint: '#b9bec0' })
  O.plants.forEach((p, i) => pottedPlant(b, [p.x, 0, p.z], { seed: 31 + i, size: 0.8 }))
  // 東端的落水管
  b.cylinder('plain', 0.045, 0.045, S.eave, 8, [-S.half + 0.1, S.eave / 2, 0.06], { tint: '#9a9c97' })
  if (detail) {
    // 霜淇淋模型旁的小立牌、窗台上的小物
    detail.box('plain', [0.3, 0.42, 0.03], [O.cone.x + 0.45, 0.46, 0.75], { tint: '#f3eee4', rotation: [-0.2, 0.3, 0] })
  }
}

/** 外觀（共用的街屋室內呼叫）：回傳屋簷、屋脊、錨點與觀賞模式聚焦的立面 */
function exterior(b, cfg, detail) {
  walls(b)
  roof(b)
  canopy(b)
  door(b)
  vendingMachine(b, detail)
  for (const { x0, x1 } of F.windows) greenWindow(b, x0, x1, F.sill, F.head, 0)
  // 立面左上的小窗（閣樓）
  greenWindow(b, -3.35, -2.7, 3.75, 4.35, 0, { cols: 2, rows: 1 })
  facadeSigns(b)
  gableFace(b, detail)
  annex(b)
  outside(b, detail)
  // 鏡頭遮擋：販賣機、後棟、山牆三角與屋頂（共用模組另外加牆面與門面）
  const v = F.vending
  b.addBlocker(v.x0, v.x1, 0, v.height, -S.wallT, -S.wallT + v.depth)
  b.addBlocker(-S.half, S.half, 0, S.annex.height + 0.2, S.annex.minZ, S.annex.maxZ)

  const at = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const center = b.transformPoint(0, 0, 0)
  const ahead = b.transformPoint(0, 0, 1)
  return {
    groundHeight: S.groundH,
    ridgeHeight: S.ridge,
    topHeight: S.ridge,
    // 店名提示在門前（不遮住牆上的大字）；屋頂標記在屋脊上方
    anchors: { prompt: at(-1.35, 2.15, 1.25), marker: at(0, S.ridge + 3.2, -S.depth / 2) },
    focus: {
      center: { x: center.x, z: center.z },
      forward: { x: ahead.x - center.x, z: ahead.z - center.z },
      width: S.half * 2 + 2.6,
      height: S.ridge + 1.2,
    },
  }
}

const interior = createShopInterior({
  id: 'showa-laundry',
  shell: S,
  variantOf: (config) => (config.variant === 'iceCream' ? SHOWA_VARIANT : null),
  lookOf: () => LOOK,
  furniture: SHOWA_FURNITURE,
  siteToWorld: showaToWorld,
  exterior,
  buildExtras(b) {
    // 吊燈：黑色燈罩與燈泡（照片）
    const cord = S.ceiling - 0.6
    for (const [x, z] of SHOWA_VARIANT.lamps) {
      b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder('dark', 0.06, 0.16, 0.14, 12, [x, cord, z], { tint: '#2b2a28', openEnded: true })
      b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, cord - 0.05, z], { tint: '#ffe6b0' })
    }
  },
})

/**
 * 店外的障礙物（本地座標，互不重疊）：正面朝廣場那一段的牆與販賣機、山牆（廣場本來就能走，要擋住）、
 * 門口的霜淇淋模型、長凳與腳踏車、山牆一側的長凳、洗手台與盆栽、店外的兩位路人。
 */
export function showaOutsideObstacles() {
  const { half, wallT, depth } = S
  const v = F.vending
  const r = (minX, maxX, minZ, maxZ) => ({ minX, maxX, minZ, maxZ })
  const list = [
    r(SHOWA_VARIANT.door.maxX, v.x0, -wallT - 0.05, -0.04),
    r(v.x0, v.x1, -wallT - 0.05, -wallT + v.depth + 0.03),
    r(v.x1, half + 0.05, -wallT - 0.05, -0.04),
    r(half - wallT - 0.05, half + 0.05, -depth - 0.05, -wallT - 0.05),
    r(O.cone.x - O.cone.r - 0.04, O.cone.x + O.cone.r + 0.04, O.cone.z - O.cone.r - 0.04, O.cone.z + O.cone.r + 0.04),
    r(O.bench.x0, O.bench.x1, O.bench.z - O.bench.depth / 2, O.bench.z + O.bench.depth / 2),
    r(O.bicycle.x - 0.85, O.bicycle.x + 0.6, O.bicycle.z - 0.2, O.bicycle.z + 0.2),
    r(O.gableBench.x - O.gableBench.depth / 2, O.gableBench.x + O.gableBench.depth / 2 + 0.25, O.gableBench.z0, O.gableBench.z1),
    r(half + 0.05, O.sink.x + 0.24, O.sink.z - 0.22, O.sink.z + 0.22),
    ...O.plants.map((p) => r(p.x - 0.22, p.x + 0.22, p.z - 0.22, p.z + 0.22)),
  ]
  for (const npc of O.npcs) {
    if (npc.seatY) continue // 坐在長凳上的人已經在長凳的範圍裡
    list.push(r(npc.x - 0.25, npc.x + 0.25, npc.z - 0.25, npc.z + 0.25))
  }
  return list
}

/** 碰撞：共用的街屋室內（步道、門口、前店、隔間門與後場），加上店外的障礙物（山牆前是原本的河岸廣場） */
export function showaLaundryCollision(config, transform) {
  const collision = interior.collision(config, transform)
  if (!collision.walkable.length) return collision
  const rectOf = ({ minX, maxX, minZ, maxZ }) => {
    const p = transform(minX, minZ)
    const q = transform(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  return {
    walkable: collision.walkable,
    obstacles: [...collision.obstacles, ...showaOutsideObstacles().map(rectOf)],
  }
}

/** 街景：外觀、室內外殼、店內的人物，加上店外的兩位路人（不屬於室內，一直都在） */
export function buildShowaLaundry(b, config, detail) {
  const result = interior.build(b, config, detail)
  const outsideNpcs = O.npcs.map((npc, i) => {
    const p = showaToWorld(npc.x, npc.z)
    return {
      id: npc.id,
      look: npc.look,
      pose: npc.pose,
      seatY: npc.seatY ?? 0,
      position: [p.x, 0, p.z],
      rotationY: b.worldRotationY(npc.rotationY),
      phase: (0.21 + i * 0.37) % 1,
    }
  })
  return { ...result, npcs: [...(result.npcs ?? []), ...outsideNpcs] }
}

export const buildShowaLaundryInterior = interior.buildInterior
export const showaInteriorObstacles = interior.obstacles

/** 店與後棟的範圍（世界座標）：範圍內不產生遠景的樹 */
export function showaLaundryFootprint(transform) {
  const p = transform(-S.half - 0.3, S.walkD)
  const q = transform(S.half + 1.0, S.annex.minZ)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
}
