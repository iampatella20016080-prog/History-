import { CylinderGeometry, IcosahedronGeometry, LatheGeometry, PlaneGeometry, Shape, TorusGeometry, Vector2 } from 'three'
import { HUANG_YUJIE_HOTSPOTS, MUSEUM as M, museumBannerEdge, museumTableBox } from '../../data/huangYujieLayout.js'
import { SHOP } from '../../data/actionBarLayout.js'
import { exhibitUV } from '../rendering/exhibitAtlas.js'
import { createRng } from '../utils/random.js'
import { partyArch, partyArchBlockers } from './actionBar.js'

/**
 * 黃玉階文史館（HuangYujieExterior；歷史商號：元珍豆醬店；只在 2000–現在「老屋新生」）
 *
 * 224巷東側、導演的豆花店北鄰的二層紅磚街屋（依使用者提供的實地照片建模，尺寸為估算）：
 * - 二樓：三組拱形窗（中央較寬）、四道磚柱、拱頂的放射狀磚紋、牆面厚度、窗下的飾板帶
 *   （左右是有淺色邊框的彩色陶飾板，中央是黑底金字、由右往左讀的「元珍」匾額）、水平簷口與女兒牆、牆縫植物與風化痕跡
 * - 一樓：兩根紅磚圓柱與灰色柱頭、灰色大梁、退縮的木造門面與敞開的大門、木櫃式的構件與斜掛的綠色「源珍」匾額、
 *   露出木梁與木板的騎樓天花、暖色吊燈、騎樓的介紹板；門前的木質花槽（右端留出通道）
 * - 右側的牆墩中間是通往豆花店騎樓的拱門（與豆花店北側端牆的拱門對齊）
 * 柱、拱窗、窗框、簷口都是 3D 幾何；陶飾板是簡化的浮雕；照片中的鏡頭光斑、路人、車牌與現代雜物不重現。
 * 展間的細部在 huangYujieInterior.js 按需載入；這裡只有展間的暗色外殼、文字招牌、燈火、遮擋方塊與碰撞。
 *
 * 座標：建築本地座標（見 data/huangYujieLayout.js）：原點在騎樓柱列外緣的中央地面，+z 朝巷子，室內在 -z。
 */
const BRICK = '#b5644a'
const BRICK_DARK = '#8e4635'
const GRANITE = '#9f9d97'
const WOOD = '#7a5236'
const WOOD_DARK = '#4b3223'
const BEAM = '#45302a'
const FRONT = -M.arcade // 一樓木造門面的外側
const DOOR_LEAF = 0.62 // 門扇寬
const IN = M.half - M.wallT // 室內牆面（側牆內側）

/* ── 小工具 ─────────────────────────────── */

/** 展板圖集上的一塊平面（name 見 rendering/exhibitAtlas.js），預設面向 +z */
export function exhibitPanel(b, name, w, h, position, rotationY = 0) {
  const geometry = new PlaneGeometry(w, h)
  const [u0, v0, u1, v1] = exhibitUV(name)
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
  return b.add('exhibit', geometry, { position, rotation: [0, rotationY, 0] })
}

/** 牆縫或屋頂邊緣長出來的一叢植物（幾個壓扁的綠色多面體） */
function weed(b, x, y, z, seed, size = 1) {
  const rng = createRng(seed)
  const n = 3 + Math.floor(rng() * 3)
  for (let i = 0; i < n; i++) {
    const r = (0.07 + rng() * 0.09) * size
    b.add('plain', new IcosahedronGeometry(r, 0), {
      position: [x + (rng() - 0.5) * 0.3 * size, y + rng() * 0.18 * size, z + (rng() - 0.3) * 0.12],
      scale: [1.4, 0.7 + rng() * 0.6, 0.8],
      tint: rng() < 0.5 ? '#5f7f45' : '#7a9a52',
    })
  }
}

/* ── 一樓：騎樓、柱、門面 ─────────────────── */

function arcade(b) {
  const { half, pier, arcadeCeiling: ceil } = M
  const inner = half - pier
  // 騎樓地坪（灰色洗石子）
  b.box('granite', [inner * 2, 0.03, M.arcade], [0, 0.035, FRONT / 2], { tint: '#b8b4ab' })
  // 左端的牆墩（灰色石材飾面，電線沿著牆墩往上）與右端有拱門的牆墩（通往豆花店的騎樓）
  b.box('granite', [pier, M.floor2, M.arcade + 0.08], [-half + pier / 2, M.floor2 / 2, FRONT / 2 + 0.04], { tint: GRANITE, grime: 0.18 })
  for (let i = 0; i < 3; i++) b.box('dark', [0.025, M.floor2 + 2.2, 0.025], [-half + 0.1 + i * 0.05, (M.floor2 + 2.2) / 2, 0.06], { tint: '#262423' })
  b.box('steel', [0.18, 0.24, 0.1], [-half + 0.2, 2.3, 0.08], { tint: '#d8d8d2' })
  partyArch(b, half - pier / 2, pier, M.floor2, FRONT, 0.08, { material: 'brick', tint: BRICK, trim: '#d2cdc2' })
  // 兩根紅磚圓柱：灰色的柱礎、紅磚柱身、灰色柱頭與方形的頂板
  for (const x of M.columns) {
    b.cylinder('granite', 0.34, 0.36, 0.22, 20, [x, 0.11, M.columnZ], { tint: GRANITE })
    const shaft = M.columnTop - 0.22 - 0.26
    b.cylinder('brick', M.columnR, M.columnR + 0.01, shaft, 22, [x, 0.22 + shaft / 2, M.columnZ], { tint: BRICK, grime: 0.18 })
    b.cylinder('granite', 0.33, M.columnR, 0.16, 20, [x, M.columnTop - 0.18, M.columnZ], { tint: GRANITE })
    b.box('granite', [0.72, 0.1, 0.72], [x, M.columnTop - 0.05, M.columnZ], { tint: shade(GRANITE, 0.94) })
  }
  // 柱頭上的灰色大梁
  const [b0, b1] = M.beam
  b.box('stucco', [half * 2, b1 - b0, 0.44], [0, (b0 + b1) / 2, -0.18], { tint: '#8d8c87', grime: 0.15 })
  // 騎樓天花：從門面伸到柱列的深褐色木梁（色澤不均、局部泛白）與上方的木板
  b.box('planks', [inner * 2, 0.04, M.arcade - 0.2], [0, ceil + 0.16, FRONT / 2 - 0.1], { tint: '#3e2b20' })
  const rng = createRng(1850)
  const n = 10
  for (let i = 0; i < n; i++) {
    const x = -inner + 0.12 + (i * (inner * 2 - 0.24)) / (n - 1)
    const tint = rng() < 0.25 ? '#6d5e52' : shade(BEAM, 0.85 + rng() * 0.3)
    b.box('wood', [0.11, 0.15, M.arcade - 0.25], [x, ceil + 0.065, FRONT / 2 - 0.1], { tint, grime: 0.1 })
  }
  b.box('wood', [inner * 2, 0.16, 0.14], [0, ceil + 0.06, FRONT + 0.1], { tint: BEAM })
  // 暖色的鐵籠吊燈
  cageLamp(b, 0.55, ceil, -0.95)
}

/** 復古的鐵籠吊燈：電線、金屬燈罩、燈泡外的鐵籠 */
function cageLamp(b, x, ceilY, z, drop = 0.55) {
  const y = ceilY - drop
  b.cylinder('dark', 0.008, 0.008, drop, 4, [x, ceilY - drop / 2, z], { tint: '#1f1d1c' })
  b.add('steel', new CylinderGeometry(0.05, 0.19, 0.12, 16, 1, true), { position: [x, y - 0.02, z], tint: '#6c6a62' })
  b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, y - 0.12, z], tint: '#fff1cf' })
  b.add('dark', new TorusGeometry(0.075, 0.006, 4, 12), { position: [x, y - 0.12, z], rotation: [Math.PI / 2, 0, 0], tint: '#2a2826' })
  b.addGlow(x, y - 0.14, z, 0.8, '#ffd29a')
}

function facadeGround(b) {
  const { half, pier, door, arcadeCeiling: ceil } = M
  const inner = half - pier
  const wallZ = FRONT - M.wallT / 2
  const wood = (x0, x1, y0, y1, tint = WOOD, mat = 'planks') => b.box(mat, [x1 - x0, y1 - y0, M.wallT], [(x0 + x1) / 2, (y0 + y1) / 2, wallZ], { tint })
  // 左右兩段木作牆與門楣上方
  wood(-inner, door.minX, 0, ceil)
  wood(door.maxX, inner, 0, ceil)
  wood(door.minX, door.maxX, door.height, ceil, WOOD_DARK)
  // 門框與門檻（大門敞開，看得到展間）
  for (const x of [door.minX, door.maxX]) b.box('wood', [0.1, door.height, 0.26], [x, door.height / 2, wallZ], { tint: WOOD_DARK })
  b.box('wood', [door.maxX - door.minX + 0.2, 0.12, 0.26], [0, door.height + 0.06, wallZ], { tint: WOOD_DARK })
  b.box('wood', [door.maxX - door.minX, 0.05, 0.3], [0, 0.04, wallZ], { tint: '#5a3d2a' })
  // 敞開的兩扇木門，往內推開、貼著門內兩側的前牆
  for (const s of [-1, 1]) {
    const x = s * (door.maxX + DOOR_LEAF / 2)
    b.box('wood', [DOOR_LEAF, door.height - 0.1, 0.04], [x, (door.height - 0.1) / 2, FRONT - M.wallT - 0.03], { tint: WOOD })
    b.box('wood', [DOOR_LEAF - 0.16, 0.7, 0.01], [x, 1.6, FRONT - M.wallT - 0.055], { tint: '#6a4630' })
  }
  // 門面的木作分格（壓條）
  for (const x of [-inner + 0.25, -1.25, 1.25, inner - 0.25]) b.box('wood', [0.05, ceil - 0.1, 0.04], [x, (ceil - 0.1) / 2, FRONT + 0.02], { tint: WOOD_DARK })
  for (const y of [0.9, 2.45]) b.box('wood', [inner * 2, 0.05, 0.04], [0, y, FRONT + 0.02], { tint: WOOD_DARK })
  // 左邊木牆上的介紹板（紅底，展板圖集）與右邊的粉色直式布條
  b.box('wood', [1.16, 0.85, 0.04], [-1.42, 1.5, FRONT + 0.03], { tint: '#3c2a1f' })
  exhibitPanel(b, 'arcadeBoard', 1.1, 0.79, [-1.42, 1.5, FRONT + 0.055])
  b.box('cloth', [0.36, 1.46, 0.015], [1.3, 1.55, FRONT + 0.03], { tint: '#ead0d5' })
  // 門楣上方的木櫃式構件（框與嵌板）
  const cabY0 = door.height + 0.08
  const cabZ = 0.46
  b.box('wood', [inner * 2 - 0.1, ceil - cabY0, cabZ], [0, (cabY0 + ceil) / 2, FRONT + cabZ / 2], { tint: '#8a5e3c' })
  for (let i = 0; i <= 6; i++) {
    const x = -inner + 0.05 + (i * (inner * 2 - 0.1)) / 6
    b.box('wood', [0.05, ceil - cabY0, 0.03], [x, (cabY0 + ceil) / 2, FRONT + cabZ + 0.01], { tint: '#5d3f2a' })
  }
  b.box('wood', [inner * 2 - 0.1, 0.05, 0.03], [0, cabY0 + 0.03, FRONT + cabZ + 0.01], { tint: '#5d3f2a' })
  greenSignboard(b)
}

/** 斜掛在木櫃前的綠色「源珍」木匾（上緣往前傾，兩個金屬掛件） */
export const GREEN_SIGN = { x: -0.35, y: 2.92, z: FRONT + 0.62, w: 1.02, h: 0.64, tilt: 0.62 }

function greenSignboard(b) {
  const { x, y, z, w, h, tilt } = GREEN_SIGN
  b.box('wood', [w, h, 0.05], [x, y, z], { rotation: [tilt, 0, 0], tint: '#2c5643' })
  // 掛件與繫繩
  for (const s of [-1, 1]) {
    b.add('steel', new CylinderGeometry(0.035, 0.035, 0.03, 12), {
      position: [x + s * (w / 2 - 0.12), y - Math.cos(tilt) * (h / 2 - 0.1), z - Math.sin(tilt) * (h / 2 - 0.1) + 0.04],
      rotation: [Math.PI / 2 + tilt, 0, 0],
      tint: '#8a7650',
    })
  }
  b.addSign({ text: '源珍', style: 'heritageGreen', width: w - 0.1, height: h - 0.12, position: [x, y - Math.sin(tilt) * 0.03, z + Math.cos(tilt) * 0.03], tilt })
}

/* ── 二樓立面 ─────────────────────────────── */

function upperFacade(b) {
  const { half, floor2, sill, spring, cornice, parapet, windows, panels } = M
  const top = 6.76 // 拱上的橫帶下緣
  const T = 0.3
  // 一樓大梁以上到窗台的牆（飾板帶在這一段）
  b.box('brick', [half * 2, sill - floor2, T], [0, (floor2 + sill) / 2, -T / 2], { tint: BRICK, grime: 0.1 })
  // 窗台的磚線腳與大梁上方的疊澀磚
  b.box('brick', [half * 2 + 0.06, 0.08, T + 0.08], [0, sill, -T / 2 + 0.04], { tint: BRICK_DARK })
  b.box('brick', [half * 2 + 0.04, 0.1, T + 0.05], [0, floor2 + 0.32, -T / 2 + 0.025], { tint: BRICK_DARK })
  b.box('brick', [half * 2 + 0.02, 0.06, T + 0.03], [0, floor2 + 0.2, -T / 2 + 0.015], { tint: shade(BRICK, 0.9) })
  // 四道磚柱（凸出牆面）
  const edges = [-half, ...windows.flatMap((w) => [w.x - w.w / 2, w.x + w.w / 2]), half]
  for (let i = 0; i < 4; i++) {
    const x0 = edges[i * 2]
    const x1 = edges[i * 2 + 1]
    b.box('brick', [x1 - x0, top - sill, T + 0.06], [(x0 + x1) / 2, (sill + top) / 2, -T / 2 + 0.03], { tint: shade(BRICK, 0.97), grime: 0.08 })
  }
  // 每扇窗：拱上的牆（挖出半圓）、放射狀的拱磚、窗框與玻璃
  windows.forEach((win, i) => {
    const r = win.w / 2
    const shape = new Shape()
    shape.moveTo(win.x - r, top)
    shape.lineTo(win.x - r, spring)
    shape.absarc(win.x, spring, r, Math.PI, 0, true)
    shape.lineTo(win.x + r, top)
    shape.lineTo(win.x - r, top)
    b.extrude('brick', shape, T, { position: [0, 0, -T], tint: BRICK, curveSegments: 14 })
    voussoirs(b, win.x, spring, r, i)
    archWindow(b, win, -0.2)
  })
  // 拱上的橫帶、簷口與女兒牆
  b.box('brick', [half * 2, cornice - top, T], [0, (top + cornice) / 2, -T / 2], { tint: BRICK, grime: 0.05 })
  b.box('brick', [half * 2 + 0.14, 0.16, T + 0.14], [0, cornice + 0.08, -T / 2 + 0.06], { tint: BRICK_DARK })
  b.box('brick', [half * 2 + 0.06, 0.08, T + 0.08], [0, cornice + 0.2, -T / 2 + 0.03], { tint: shade(BRICK_DARK, 1.08) })
  b.box('brick', [half * 2, parapet - cornice - 0.24, T], [0, (cornice + 0.24 + parapet) / 2, -T / 2], { tint: shade(BRICK, 0.92), grime: 0.2 })
  b.box('granite', [half * 2 + 0.04, 0.06, T + 0.04], [0, parapet + 0.03, -T / 2], { tint: '#8a8780' })
  // 窗下的飾板帶：左右的彩色陶飾板、中央的「元珍」匾額
  const [p0, p1] = panels
  for (const panel of M.ceramics) ceramicPanel(b, panel.x, (p0 + p1) / 2, panel.w, p1 - p0, panel.kind)
  plaqueFrame(b)
  // 風化：窗下與簷口的深色水痕、牆縫與屋頂邊緣的植物
  for (const x of [-1.85, -1.1, 0.55, 1.2, 2.0]) b.box('plain', [0.05 + (Math.abs(x) % 0.05), 0.7, 0.004], [x, sill - 0.42, 0.006], { tint: '#6a4134' })
  for (const x of [-1.3, 0.3, 1.7]) b.box('plain', [0.06, 0.5, 0.004], [x, cornice - 0.3, 0.006], { tint: '#6d4537' })
  ;[
    [-2.2, parapet + 0.05, 1],
    [-1.4, parapet + 0.05, 2],
    [-0.2, parapet + 0.05, 3],
    [0.9, parapet + 0.05, 4],
    [1.9, parapet + 0.05, 5],
    [-2.25, 5.2, 6],
    [-2.28, 4.3, 7],
    [2.25, cornice - 0.1, 8],
    [-0.75, sill + 0.05, 9],
  ].forEach(([x, y, seed]) => weed(b, x, y, 0.06, 300 + seed, y > parapet ? 1.2 : 0.7))
  // 兩側的雨水管
  for (const x of [-half + 0.12, half - 0.1]) {
    b.cylinder('plain', 0.045, 0.045, parapet - 0.2, 10, [x, (parapet - 0.2) / 2, 0.08], { tint: '#d3d2cb' })
    for (const y of [1.5, 3.8, 6.0]) b.box('steel', [0.12, 0.03, 0.08], [x, y, 0.05], { tint: '#8d8d88' })
  }
}

/** 拱頂的放射狀磚紋：沿著半圓排一圈斜向的磚（顏色深淺交錯） */
function voussoirs(b, cx, cy, r, seed) {
  const R = r + 0.09
  const count = Math.max(9, Math.round((Math.PI * R) / 0.085))
  // 拱磚比牆面凸出一點（也比磚柱的表面凸出），深淺交錯，從巷子裡看得出一圈放射狀的磚紋
  for (let k = 0; k <= count; k++) {
    const a = (k / count) * Math.PI
    const tint = (k + seed) % 2 === 0 ? '#7f3a2a' : '#c4734f'
    b.box('brick', [0.068, 0.2, 0.09], [cx + Math.cos(a) * R, cy + Math.sin(a) * R, 0.045], { rotation: [0, 0, a - Math.PI / 2], tint })
  }
}

/** 拱形窗：深色玻璃（矩形＋半圓）、深色窗框與窗櫺；z 是窗面的位置（牆面以內） */
function archWindow(b, win, z) {
  const { sill, spring } = M
  const r = win.w / 2
  const glass = new Shape()
  glass.moveTo(win.x - r, sill)
  glass.lineTo(win.x + r, sill)
  glass.lineTo(win.x + r, spring)
  glass.absarc(win.x, spring, r, 0, Math.PI, false)
  glass.lineTo(win.x - r, sill)
  b.extrude('glass', glass, 0.02, { position: [0, 0, z - 0.02], tint: '#2c3237', curveSegments: 14 })
  const frame = '#1c1d1f'
  for (const s of [-1, 1]) b.box('dark', [0.06, spring - sill, 0.06], [win.x + s * (r - 0.03), (sill + spring) / 2, z + 0.02], { tint: frame })
  b.box('dark', [win.w, 0.06, 0.06], [win.x, sill + 0.03, z + 0.02], { tint: frame })
  b.box('dark', [win.w, 0.05, 0.05], [win.x, spring, z + 0.02], { tint: frame })
  b.box('dark', [win.w, 0.035, 0.04], [win.x, sill + (spring - sill) * 0.55, z + 0.02], { tint: frame })
  b.box('dark', [0.04, spring - sill + r * 0.9, 0.04], [win.x, sill + (spring - sill + r * 0.9) / 2, z + 0.02], { tint: frame })
  b.add('dark', new TorusGeometry(r - 0.03, 0.03, 4, 16, Math.PI), { position: [win.x, spring, z + 0.02], tint: frame })
  // 窗台
  b.box('granite', [win.w + 0.06, 0.06, 0.24], [win.x, sill + 0.03, z + 0.12], { tint: '#9a968e' })
}

/** 彩色陶飾板（簡化的浮雕）：淺色邊框、深藍底與花瓶、魚或牡丹 */
function ceramicPanel(b, x, y, w, h, kind) {
  b.box('plain', [w + 0.14, h + 0.14, 0.07], [x, y, 0.035], { tint: '#ece7dc' })
  b.box('plain', [w - 0.04, h - 0.04, 0.02], [x, y, 0.075], { tint: '#2d4660' })
  const z = 0.09
  // 几座（金色）與花瓶
  b.box('plain', [w * 0.62, 0.05, 0.03], [x + 0.02, y - h * 0.34, z], { tint: '#c49a45' })
  const vase = kind === 'fish' ? '#3e7d93' : '#c9a244'
  b.add('plain', new LatheGeometry(VASE_PROFILE, 12), { position: [x - w * 0.08, y - h * 0.31, z], scale: [0.9, 1, 0.5], tint: vase })
  if (kind === 'fish') {
    // 魚（橘色）、綠色的枝葉與紅花
    b.add('plain', new IcosahedronGeometry(0.07, 1), { position: [x + w * 0.24, y - h * 0.05, z + 0.01], scale: [1.9, 0.75, 0.4], rotation: [0, 0, 0.5], tint: '#e0743a' })
    b.add('plain', new IcosahedronGeometry(0.035, 0), { position: [x + w * 0.38, y + h * 0.06, z + 0.01], scale: [1, 1.6, 0.4], rotation: [0, 0, 0.5], tint: '#c95a2c' })
    for (let i = 0; i < 4; i++) b.add('plain', new IcosahedronGeometry(0.04, 0), { position: [x - w * 0.12 + i * 0.03, y + h * (0.1 + i * 0.05), z], scale: [0.6, 1.8, 0.4], rotation: [0, 0, -0.3 + i * 0.25], tint: '#4f9a5c' })
    b.add('plain', new IcosahedronGeometry(0.035, 0), { position: [x - w * 0.02, y + h * 0.3, z + 0.01], scale: [1, 1, 0.5], tint: '#c8383a' })
    b.box('plain', [0.03, h * 0.5, 0.02], [x - w * 0.32, y + h * 0.05, z], { tint: '#3b6e4e' })
  } else {
    // 牡丹（粉紅、桃紅）與綠葉
    for (const [px, py, c, r] of [
      [-0.12, 0.12, '#e48aa2', 0.06],
      [0.02, 0.2, '#f1b3c2', 0.055],
      [0.12, 0.08, '#d65a76', 0.06],
      [-0.02, 0.0, '#ea9fb3', 0.045],
    ]) {
      b.add('plain', new IcosahedronGeometry(r, 1), { position: [x - w * 0.08 + px, y + py * h * 1.6, z + 0.015], scale: [1, 0.9, 0.5], tint: c })
    }
    for (let i = 0; i < 5; i++) b.add('plain', new IcosahedronGeometry(0.045, 0), { position: [x - w * 0.08 + (i - 2) * 0.07, y + h * 0.02 + (i % 2) * 0.04, z], scale: [1.6, 0.7, 0.35], rotation: [0, 0, (i - 2) * 0.4], tint: '#4c8a54' })
    b.add('plain', new IcosahedronGeometry(0.05, 0), { position: [x + w * 0.3, y - h * 0.2, z], scale: [1.2, 0.8, 0.4], tint: '#d8c07a' })
  }
}

const VASE_PROFILE = [
  [0, 0],
  [0.05, 0],
  [0.075, 0.05],
  [0.08, 0.1],
  [0.05, 0.16],
  [0.035, 0.2],
  [0.05, 0.23],
  [0, 0.23],
].map(([x, y]) => new Vector2(x, y))

/** 中央「元珍」匾額：淺色邊框、深色底板與框下的小陶飾 */
function plaqueFrame(b) {
  const { x, w, h } = M.plaque
  const y = (M.panels[0] + M.panels[1]) / 2
  b.box('plain', [w + 0.2, h + 0.18, 0.08], [x, y, 0.04], { tint: '#ece8de' })
  b.box('plain', [w, h, 0.03], [x, y, 0.09], { tint: '#1e2433' })
  b.addSign({ text: '元珍', style: 'heritagePlaque', width: w - 0.08, height: h - 0.08, position: [x, y, 0.108] })
  // 框下的台座與五個小陶飾
  b.box('plain', [w + 0.26, 0.05, 0.16], [x, y - h / 2 - 0.12, 0.08], { tint: '#e3ddd0' })
  ;['#4f8a54', '#c8723a', '#d0a64a', '#4f8a54', '#b84a3c'].forEach((tint, i) => {
    b.add('plain', new IcosahedronGeometry(0.035, 0), { position: [x - 0.5 + i * 0.25, y - h / 2 - 0.07, 0.11], scale: [0.8, 1.3, 0.8], tint })
  })
}

/* ── 花槽、外殼與店內暗色外殼 ───────────────── */

function planter(b) {
  const { minX, maxX, minZ, maxZ, height } = M.planter
  const d = maxZ - minZ
  const cz = (minZ + maxZ) / 2
  const count = 3
  const len = (maxX - minX) / count
  const rng = createRng(1918)
  for (let i = 0; i < count; i++) {
    const x0 = minX + i * len
    b.box('planks', [len - 0.04, height, d], [x0 + len / 2, height / 2, cz], { tint: '#8a6544', grime: 0.15 })
    for (let k = 1; k < 4; k++) b.box('wood', [len - 0.04, 0.02, 0.01], [x0 + len / 2, (height * k) / 4, maxZ + 0.005], { tint: '#5b412c' })
    b.box('earth', [len - 0.12, 0.03, d - 0.08], [x0 + len / 2, height - 0.02, cz], { tint: '#4b3a2c' })
    // 少量植栽：寬葉與直立的虎尾蘭
    for (let k = 0; k < 3; k++) {
      const px = x0 + 0.2 + rng() * (len - 0.4)
      if (rng() < 0.5) {
        for (let j = 0; j < 5; j++) b.box('plain', [0.05, 0.35 + rng() * 0.3, 0.015], [px + (j - 2) * 0.04, height + 0.25, cz], { rotation: [0, rng() * 3, (j - 2) * 0.12], tint: rng() < 0.5 ? '#4f7a3a' : '#6c9248' })
      } else {
        weed(b, px, height + 0.05, cz, 500 + i * 10 + k, 1.3)
      }
    }
  }
}

function shell(b) {
  const { half, wallT, back, floor2, parapet } = M
  const depth = -back
  // 兩側的牆（右側與豆花店之間留 5 公分）、後牆、屋頂板
  for (const s of [-1, 1]) {
    b.box('plaster', [wallT, parapet, depth - M.arcade], [s * (half - wallT / 2), parapet / 2, FRONT - (depth - M.arcade) / 2], { tint: '#cbbba8', grime: 0.2 })
    b.box('plaster', [wallT, parapet - floor2, M.arcade - 0.3], [s * (half - wallT / 2), (floor2 + parapet) / 2, -0.3 - (M.arcade - 0.3) / 2], { tint: '#cbbba8', grime: 0.2 })
  }
  b.box('plaster', [half * 2, parapet, wallT], [0, parapet / 2, back + wallT / 2], { tint: '#c6b6a3', grime: 0.2 })
  b.box('plaster', [half * 2 - 2 * wallT, 0.2, depth - 0.3 - wallT], [0, parapet - 0.25, (-0.3 + back + wallT) / 2], { tint: '#b7a895' })
  // 屋頂上的小水塔
  b.cylinder('plain', 0.4, 0.4, 0.9, 14, [-1.1, parapet - 0.15 + 0.45, back + 2.0], { tint: '#e3ded2' })
}

function interiorShell(b) {
  const { room, ceiling } = M
  const w = room.maxX - room.minX
  const d = room.maxZ - room.minZ
  const cz = (room.minZ + room.maxZ) / 2
  // 室內細部未載入時，從門口看進去是暗的
  b.box('dark', [w, 0.02, d], [0, 0.025, cz], { tint: '#3a332c' })
  b.box('dark', [w, 0.04, d], [0, ceiling + 0.3, cz], { tint: '#2a211b' })
  // 暗色外殼貼著結構牆（展間的牆面裝修在它內側 3 公分，見 huangYujieInterior.js）
  for (const s of [-1, 1]) b.box('dark', [0.02, ceiling + 0.3, d], [s * (IN - 0.01), (ceiling + 0.3) / 2, cz], { tint: '#3a3029' })
  b.box('dark', [w, ceiling + 0.3, 0.02], [0, (ceiling + 0.3) / 2, room.minZ + 0.01], { tint: '#3a3029' })
  // 從門口透出的暖光與室內吊燈的光暈
  b.addGlow(0, 1.9, FRONT - 0.7, 1.5, '#ffc98a')
  b.addPool(0, FRONT + 0.8, 1.3, '#ffcf96')
  for (const t of M.tables) b.addGlow((t.minX + t.maxX) / 2, 2.35, (t.minZ + t.maxZ) / 2, 1.1, '#ffcf8f')
  b.addGlow(0.85, 2.0, -8.75, 0.9, '#fff0d6')
  b.addGlow(-1.85, 2.15, -8.4, 0.7, '#ffd9a6')
}

/* ── 室內的文字招牌（屬於街景的招牌層；看板本身在 huangYujieInterior.js） ── */

function interiorSigns(b) {
  const { backWall, room, banner } = M
  const edge = museumBannerEdge()
  // 牆面裝修在 room.minZ + 0.03；匾額底板厚 5 公分
  const B = room.minZ + 0.09
  // 後牆的「學貫中西」匾額（黑底金字，由右往左）與紅色的「行善得福」
  b.addSign({ text: '學貫中西', style: 'heritagePlaque', width: backWall.plaque.w - 0.1, height: backWall.plaque.h - 0.08, position: [backWall.plaque.x, backWall.plaque.y, B] })
  b.addSign({ text: '行善得福', style: 'couplet', vertical: true, width: 0.15, height: 0.6, position: [1.7, 1.62, room.minZ + 0.05] })
  // 大布旗下的「源珍」小布旗
  b.addSign({ text: '源珍', style: 'flagCloth', width: 0.3, height: 0.36, position: [banner.x, edge.y - 0.22, edge.z + 0.012] })
  // 陶缸上的紅色菱形紙：醬、醋（右前方的商號陳列區面向展間中央；入口的醬缸面向右邊）
  for (const jar of M.counterJars) {
    if (!jar.label) continue
    b.addSign({ text: jar.label, style: 'jarLabel', width: jar.r * 0.42, height: jar.r * 0.42, position: [jar.x - jar.r - 0.014, M.jarCounter.height + jar.h * 0.55, jar.z], rotationY: -Math.PI / 2 })
  }
  const big = M.entryJars[1]
  b.addSign({ text: '醬', style: 'jarLabel', width: 0.12, height: 0.12, position: [big.x + big.r + 0.012, big.h * 0.55, big.z], rotationY: Math.PI / 2 })
  // 騎樓粉色直式布條
  b.addSign({ text: '豆醬店', style: 'pinkBanner', vertical: true, width: 0.32, height: 1.0, position: [1.3, 1.62, FRONT + 0.04] })
}

/* ── 遮擋方塊、可以點選的物件與碰撞 ───────────── */

function registerBlockers(b) {
  const { half, pier, back, floor2, parapet, door, room, ceiling, arcadeCeiling: ceil, wallT } = M
  const inner = half - pier
  const ranges = {}
  const mark = (name, fn) => {
    const start = b.blockers.length
    fn()
    ranges[name] = { start, end: b.blockers.length }
  }
  // 一樓門面（門兩側與門楣上）、木櫃式構件、斜掛的匾額
  b.addBlocker(-inner, door.minX, 0, ceil, FRONT - wallT, FRONT)
  b.addBlocker(door.maxX, inner, 0, ceil, FRONT - wallT, FRONT)
  b.addBlocker(door.minX, door.maxX, door.height, ceil, FRONT - wallT, FRONT)
  b.addBlocker(-inner, inner, door.height + 0.08, ceil, FRONT, FRONT + 0.47)
  b.addBlocker(GREEN_SIGN.x - GREEN_SIGN.w / 2, GREEN_SIGN.x + GREEN_SIGN.w / 2, GREEN_SIGN.y - 0.3, GREEN_SIGN.y + 0.3, FRONT + 0.4, FRONT + 0.9)
  // 兩端的牆墩（右側有拱門）、柱
  b.addBlocker(-half, -inner, 0, floor2, FRONT, 0.04)
  partyArchBlockers(b, inner, half, floor2, FRONT, 0.04)
  for (const x of M.columns) b.addBlocker(x - 0.3, x + 0.3, 0, M.columnTop, M.columnZ - 0.3, M.columnZ + 0.3)
  // 騎樓天花以上（大梁、二樓、女兒牆；騎樓上方也算）、側牆、後牆
  b.addBlocker(-half, half, ceil, parapet + 0.1, back, 0.0)
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, ceil, back, FRONT)
  b.addBlocker(-half, half, 0, ceil, back, room.minZ)
  // 窗下的飾板帶與「元珍」匾額（可以點選、聚焦）
  mark('plaque', () => b.addBlocker(-half + 0.1, half - 0.1, M.panels[0] - 0.15, M.panels[1] + 0.12, -0.05, 0.04))
  // 展間的天花（木梁；可以點選、近看）
  mark('beams', () => b.addBlocker(room.minX, room.maxX, ceiling, ceil, room.minZ, room.maxZ))
  // 展間裡的展示物（可以點選、聚焦）
  const pw = M.portraitWall
  mark('portrait', () => b.addBlocker(room.minX, room.minX + 0.08, pw.y0, pw.y1, pw.minZ, pw.maxZ))
  const ew = M.eduWall
  mark('board', () => b.addBlocker(room.minX, room.minX + 0.08, ew.y0, ew.y1, ew.minZ, ew.maxZ))
  const ej = M.entryJarsBox
  mark('jars', () => b.addBlocker(ej.minX, ej.maxX, 0, 0.8, ej.minZ, ej.maxZ))
  const ja = M.jarArea
  mark('jarArea', () => {
    b.addBlocker(ja.minX + 0.2, ja.maxX, 0, M.jarCounter.height + 0.75, M.jarCounter.minZ, M.jarCounter.maxZ)
    b.addBlocker(M.jarRack.minX, M.jarRack.maxX, 0, 1.25, M.jarRack.minZ, M.jarRack.maxZ)
  })
  const sh = M.shelves
  mark('shelves', () => b.addBlocker(sh.minX, sh.maxX, 0, sh.height, sh.minZ, sh.maxZ))
  const tc = M.teaCounter
  mark('tea', () => b.addBlocker(tc.minX, tc.maxX, 0, tc.height + 0.22, tc.minZ, tc.maxZ))
  const dk = M.desk
  mark('study', () => {
    b.addBlocker(dk.minX, dk.maxX, 0, dk.height + 0.3, dk.minZ, dk.maxZ)
    b.addBlocker(M.backWall.plaque.x - M.backWall.plaque.w / 2, M.backWall.plaque.x + M.backWall.plaque.w / 2, M.backWall.plaque.y - 0.3, M.backWall.plaque.y + 0.3, room.minZ, room.minZ + 0.08)
  })
  return ranges
}

/** 中央長桌、板凳、木椅與藤椅的遮擋方塊（只給鏡頭用，不是可以點選的建築） */
export function museumFurnitureBlockers(b) {
  for (const t of M.tables) {
    const box = museumTableBox(t)
    b.addBlocker(box.minX, box.maxX, 0, M.tableHeight + 0.06, box.minZ, box.maxZ)
  }
  const c = M.rattanChair
  b.addBlocker(c.x - 0.28, c.x + 0.28, 0, 1.0, c.z - 0.3, c.z + 0.3)
}

/** 本地矩形 → 世界座標的軸對齊矩形 */
function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：騎樓、通往豆花店騎樓的拱門、大門與一樓展間；
 * 障礙物是圓柱、花槽、醬缸、展示牆、層架、商號陳列、長桌與板凳、木椅、藤椅、茶席與小展桌。
 * 兩棟的室內沒有打通（只從騎樓往返）。
 */
export function huangYujieCollision(config, transform) {
  const { half, pier, door, room, planter: pl, passage = SHOP.passage } = M
  const rect = (...args) => worldRect(transform, ...args)
  const inner = half - pier
  // 拱門：從文史館的騎樓穿過兩道牆墩，伸進豆花店的騎樓一段（豆花店的騎樓從它本地 x = -2.5 開始可以走）
  const passageReach = half + 0.05 + 0.9
  const walkable = [
    rect(-inner, inner, FRONT + 0.02, 0.05),
    rect(inner - 0.25, passageReach, passage.minZ, passage.maxZ),
    rect(door.minX + 0.02, door.maxX - 0.02, FRONT - M.wallT - 0.35, FRONT + 0.25),
    rect(room.minX + 0.02, room.maxX - 0.02, room.minZ + 0.02, room.maxZ - 0.02),
  ]
  const ob = (r) => rect(r.minX, r.maxX, r.minZ, r.maxZ)
  const obstacles = [
    ...M.columns.map((x) => rect(x - M.columnR - 0.05, x + M.columnR + 0.05, M.columnZ - M.columnR - 0.05, M.columnZ + M.columnR + 0.05)),
    ob(pl),
    ob(M.entryJarsBox),
    // 推開貼在前牆內側的兩扇門
    rect(-door.maxX - DOOR_LEAF - 0.03, -door.maxX + 0.02, FRONT - M.wallT - 0.08, FRONT - M.wallT + 0.02),
    rect(door.maxX - 0.02, door.maxX + DOOR_LEAF + 0.03, FRONT - M.wallT - 0.08, FRONT - M.wallT + 0.02),
    rect(room.minX, room.minX + 0.07, M.eduWall.minZ, M.eduWall.maxZ),
    rect(room.minX, room.minX + 0.05, M.portraitWall.minZ, M.portraitWall.maxZ),
    ob(M.jarArea),
    ob(M.shelves),
    ob(M.teaCounter),
    ob(M.desk),
    rect(M.rattanChair.x - 0.27, M.rattanChair.x + 0.27, M.rattanChair.z - 0.29, M.rattanChair.z + 0.29),
    ...M.tables.map((t) => ob(museumTableBox(t))),
  ]
  return { walkable, obstacles }
}

/** 佔地（範圍內不產生遠景房屋與樹） */
export function huangYujieFootprint(transform) {
  return worldRect(transform, -M.half - 0.1, M.half + 0.05, M.back - 0.1, 0.4)
}

/* ── 主程式 ─────────────────────────────── */

export function buildHuangYujieExterior(b) {
  arcade(b)
  facadeGround(b)
  upperFacade(b)
  planter(b)
  shell(b)
  interiorShell(b)
  interiorSigns(b)
  const ranges = registerBlockers(b)

  const { half, room, ceiling, parapet, door, pier, arcadeCeiling: ceil } = M
  const inner = half - pier
  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const zone = (minX, maxX, minZ, maxZ) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  const facadeHotspot = HUANG_YUJIE_HOTSPOTS.find((item) => item.id === 'facade')
  const sub = (id, range, hotspot, focus) => ({ id: `huang-yujie-${id}`, storeId: M.id, detail: true, hotspot, range, focus })
  const inside = { maxDistance: 2.6, maxPitch: 0.45, maxYawOffset: 0.55 }
  const ew = M.eduWall
  const pw = M.portraitWall
  const sh = M.shelves

  return {
    groundHeight: M.floor2,
    topHeight: parapet,
    // 店名提示在入口前的騎樓；屋頂標記在立面上方
    anchors: { prompt: local(...facadeHotspot.prompt), marker: local(0, parapet + 2.4, -1.0) },
    // 觀賞模式聚焦文史館：從巷子裡看整個紅磚立面（巷子窄，鏡頭停在巷子對側以內）
    focus: { center: toWorld(0, 0), forward: dir(0, 1), width: half * 2 + 0.6, height: parapet, viewHeight: 4.2, maxDistance: 8.5, maxPitch: 0.45, maxYawOffset: 0.5 },
    subStores: [
      // 二樓窗下的飾板帶與「元珍」匾額：近看拱窗與陶飾
      sub('plaque', ranges.plaque, 'plaque', { center: toWorld(0, 0.05), forward: dir(0, 1), width: half * 2, height: 2.6, viewHeight: 5.0, maxDistance: 5.6, maxPitch: 0.55, maxYawOffset: 0.45 }),
      // 展間的木梁天花
      sub('beams', ranges.beams, 'beams', { center: toWorld(0, -6.6), forward: dir(0, 1), width: 3.6, height: 1.0, viewHeight: 2.7, maxDistance: 3.6, maxPitch: 0.05, maxYawOffset: 0.3 }),
      sub('portrait', ranges.portrait, 'portrait', { center: toWorld(room.minX, (pw.minZ + pw.maxZ) / 2), forward: dir(1, 0), width: pw.maxZ - pw.minZ + 0.3, height: 2.1, viewHeight: 1.75, ...inside }),
      sub('board', ranges.board, 'board', { center: toWorld(room.minX, (ew.minZ + ew.maxZ) / 2), forward: dir(1, 0), width: ew.maxZ - ew.minZ + 0.2, height: 2.0, viewHeight: 1.65, maxDistance: 3.4, maxPitch: 0.3, maxYawOffset: 0.4 }),
      sub('jars', ranges.jars, 'jars', { center: toWorld(M.entryJarsBox.maxX, -2.95), forward: dir(1, 0), width: 1.7, height: 1.0, viewHeight: 0.7, maxDistance: 2.2, maxPitch: 0.6, maxYawOffset: 0.6 }),
      sub('jar-area', ranges.jarArea, 'jar-area', { center: toWorld(M.jarArea.minX, -3.0), forward: dir(-1, 0), width: 2.0, height: 2.0, viewHeight: 1.2, maxDistance: 2.4, maxPitch: 0.45, maxYawOffset: 0.6 }),
      sub('shelves', ranges.shelves, 'shelves', { center: toWorld(sh.minX, (sh.minZ + sh.maxZ) / 2), forward: dir(-1, 0), width: sh.maxZ - sh.minZ + 0.2, height: 3.0, viewHeight: 1.6, maxDistance: 2.6, maxPitch: 0.3, maxYawOffset: 0.45 }),
      sub('tea', ranges.tea, 'tea', { center: toWorld(M.teaCounter.maxX, -8.3), forward: dir(1, 0), width: 1.6, height: 1.6, viewHeight: 1.1, maxDistance: 2.2, maxPitch: 0.6, maxYawOffset: 0.6 }),
      sub('study', ranges.study, 'study', { center: toWorld(0.6, room.minZ + 0.6), forward: dir(0, 1), width: 2.6, height: 2.6, viewHeight: 1.6, maxDistance: 2.6, maxPitch: 0.3, maxYawOffset: 0.4 }),
    ],
    interiors: [
      {
        id: M.id,
        ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
        ceiling,
        // 入口：騎樓；越靠近大門越接近室內鏡頭
        entry: zone(-inner + 0.2, inner - 0.2, FRONT - M.wallT, 0.4),
        entryHold: 0.55,
        entryRamp: 2.4,
        door: toWorld(0, FRONT),
        // 狹長的展間：鏡頭更近、更低，注視點在胸口附近
        camera: { distance: 2.9, maxHeight: ceiling - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        viewerStart: { distance: 2.5 },
        loadRadius: 14,
        showRadius: 24,
      },
    ],
    // 觀賞模式：注視點可以進到騎樓、拱門、大門與展間（不超過木櫃與天花）
    viewerRegions: [
      { ...zone(-inner + 0.35, inner - 0.35, FRONT + 0.55, -0.1), maxY: 2.3, cameraMaxY: ceil - 0.15 },
      { ...zone(inner - 0.2, half + 0.6, SHOP.passage.minZ + 0.25, SHOP.passage.maxZ - 0.25), maxY: 1.8, cameraMaxY: SHOP.passage.spring },
      { ...zone(door.minX + 0.2, door.maxX - 0.2, FRONT - 0.6, FRONT + 0.6), maxY: 2.0, cameraMaxY: door.height - 0.05 },
      { ...zone(room.minX + 0.35, room.maxX - 0.35, room.minZ + 0.35, room.maxZ - 0.3), maxY: 2.25, cameraMaxY: ceiling - 0.3 },
    ],
    // 騎樓、拱門與展間：人物可以貼著柱、花槽與展示物走，第三人稱鏡頭在這裡停在障礙物前面
    followAreas: [zone(-half, half + 0.6, FRONT - M.wallT, 0.4), zone(room.minX, room.maxX, room.minZ, room.maxZ)],
  }
}

function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor))
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor))
  const b = Math.min(255, Math.round((n & 255) * factor))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
