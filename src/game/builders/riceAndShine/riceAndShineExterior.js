import { CylinderGeometry, IcosahedronGeometry, PlaneGeometry, Shape, TorusGeometry } from 'three'
import { EARLY, MILL, MODERN, POSTWAR, RICE_HOTSPOTS, RICE_NPCS, RS, diningTableBox, longTableBox } from '../../../data/riceAndShineLayout.js'
import { riceUV } from '../../rendering/riceAtlas.js'
import { createRng } from '../../utils/random.js'
import { barrel, basket, carryingPole, handcart, sack, shade } from '../props.js'
import { buildShophouse } from '../shophouse.js'

/**
 * 迪化街一段329號店屋（RiceAndShineExterior；同一棟建築、同一個 ID，依年代的 variant 替換外觀）
 *
 * - earlyRiceTrade（1895–1930）：初期的閩南式街屋（紅磚、木構、瓦屋頂、亭仔腳），「米」「碾米」木牌與「糧」布幡；
 *   街邊的米袋、竹籮、木桶、米斗、扁擔、手推車與稻穀袋，米商、搬運工與碾米工人（情境人物）。沒有玻璃門、沒有「稻舍」。
 * - riceMill（1930–1945）：二層紅磚店屋——三個拱券（中央較寬）、厚實磚柱、放射狀拱磚、二樓三組木框窗、白色飾板、
 *   磚砌簷口與女兒牆上的綠色花磚、騎樓與深長的店屋格局。木門、暖色燈泡，沒有現代玻璃門與軌道燈。
 * - postwarRiceHouse（1945–1980）：同一棟店屋老化：磚色變深、水痕與髒污、缺角的花磚、舊木門與電線。
 * - riceAndShineModern（2000–現在）：修復後的老紅磚（保留磨損與色差）、二樓飾板上的「稻舍」、騎樓的紅色地磚、
 *   中央玻璃入口與上方的「稻舍 Rice & Shine」、騎樓的黑底「稻舍米糧行」牌與牆上的大稻埕街景壁畫（原創圖樣）。
 * 室內的細部在 riceAndShineInterior.js 按需載入；這裡只有外殼、文字招牌、燈火、遮擋方塊、碰撞與熱點的點選範圍。
 *
 * 座標：建築本地座標（見 data/riceAndShineLayout.js）：原點在一樓店面線的中央地面，+z 朝迪化街，室內在 -z。
 */
const PALETTE = {
  riceMill: { brick: '#b8664b', dark: '#934b37', grime: 0.08, wood: '#7a5134', stone: '#a9a49a', tile: '#5f9b84' },
  postwarRiceHouse: { brick: '#915040', dark: '#6f3a2c', grime: 0.32, wood: '#5e4330', stone: '#8d877c', tile: '#4d7a68' },
  riceAndShineModern: { brick: '#aa5f48', dark: '#874634', grime: 0.16, wood: '#8a5a37', stone: '#a29d93', tile: '#6aa58e' },
}
const IN = RS.half - RS.wallT // 室內牆面

/** 圖集上的一塊平面（name 見 rendering/riceAtlas.js），預設面向 +z */
export function ricePanel(b, name, w, h, position, rotationY = 0, target = b) {
  const geometry = new PlaneGeometry(w, h)
  const [u0, v0, u1, v1] = riceUV(name)
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
  return target.add('riceExhibit', geometry, { position, rotation: [0, rotationY, 0] })
}

/* ═══════════ 紅磚店屋（1930 起） ═══════════ */

/** 拱上的牆：矩形挖掉一個（半圓或弧形）拱（形狀在 xy 平面，往 +z 擠出 depth） */
function archSpandrel(b, cx, w, spring, top, z, depth, tint, rise = null) {
  const r = w / 2
  const shape = new Shape()
  shape.moveTo(cx - r, top)
  shape.lineTo(cx - r, spring)
  if (rise == null) {
    shape.absarc(cx, spring, r, Math.PI, 0, true)
  } else {
    const R = (r * r + rise * rise) / (2 * rise)
    const cy = spring + rise - R
    const a = Math.atan2(spring - cy, r)
    shape.absarc(cx, cy, R, Math.PI - a, a, true)
  }
  shape.lineTo(cx + r, top)
  shape.lineTo(cx - r, top)
  b.extrude('brick', shape, depth, { position: [0, 0, z], tint, curveSegments: 14 })
}

/** 沿著拱排一圈深淺交錯的放射狀拱磚 */
function voussoirs(b, cx, spring, w, z, pal, rise = null, seed = 1) {
  const r = w / 2
  let R = r + 0.08
  let cy = spring
  let a0 = 0
  let a1 = Math.PI
  if (rise != null) {
    const Rc = (r * r + rise * rise) / (2 * rise)
    cy = spring + rise - Rc
    const a = Math.atan2(spring - cy, r)
    a0 = a
    a1 = Math.PI - a
    R = Rc + 0.08
  }
  const count = Math.max(8, Math.round(((a1 - a0) * R) / 0.08))
  const rng = createRng(seed)
  for (let k = 0; k <= count; k++) {
    const a = a0 + ((a1 - a0) * k) / count
    const tint = k % 2 ? pal.dark : shade(pal.brick, 1.06 + rng() * 0.06)
    b.box('brick', [0.066, 0.2, 0.07], [cx + Math.cos(a) * R, cy + Math.sin(a) * R, z], { rotation: [0, 0, a - Math.PI / 2], tint })
  }
}

/** 綠色的花磚（通風磚）：方形的釉面磚與四瓣花紋 */
function ventTile(b, x, y, z, tint, broken = false) {
  if (broken) {
    b.box('dark', [0.18, 0.18, 0.03], [x, y, z], { tint: '#1f1a17' })
    return
  }
  b.box('plain', [0.19, 0.19, 0.03], [x, y, z], { tint })
  b.add('plain', new TorusGeometry(0.055, 0.014, 4, 12), { position: [x, y, z + 0.018], tint: shade(tint, 1.25) })
  for (const [dx, dy] of [
    [0.06, 0],
    [-0.06, 0],
    [0, 0.06],
    [0, -0.06],
  ]) {
    b.add('plain', new IcosahedronGeometry(0.022, 0), { position: [x + dx, y + dy, z + 0.02], scale: [1, 1, 0.4], tint: shade(tint, 0.7) })
  }
}

function brickFacade(b, variant) {
  const pal = PALETTE[variant]
  const { half, piers, pierZ, arches, spring, band, panels, sill, windowSpring, windows, cornice, parapet, tiles } = RS
  const [z0, z1] = pierZ
  const T = z1 - z0
  const aged = variant === 'postwarRiceHouse'
  // 一樓：四道厚實的磚柱（花崗石的柱礎、拱腳的線腳）
  for (const [i, [x0, x1]] of piers.entries()) {
    const w = x1 - x0
    b.box('granite', [w + 0.04, 0.32, T + 0.06], [(x0 + x1) / 2, 0.16, (z0 + z1) / 2 + 0.01], { tint: pal.stone })
    b.box('brick', [w, band[0] - 0.32, T], [(x0 + x1) / 2, (band[0] + 0.32) / 2, (z0 + z1) / 2], { tint: shade(pal.brick, 1 - i * 0.015), grime: pal.grime })
    b.box('brick', [w + 0.08, 0.1, T + 0.08], [(x0 + x1) / 2, spring + 0.05, (z0 + z1) / 2 + 0.02], { tint: pal.dark })
  }
  // 三個拱券：拱上的牆與一圈放射狀的拱磚
  arches.forEach((arch, i) => {
    archSpandrel(b, arch.x, arch.w, spring + 0.1, band[0], z0, T, pal.brick)
    voussoirs(b, arch.x, spring + 0.1, arch.w, z1 + 0.02, pal, null, 10 + i)
  })
  // 腰帶（疊澀磚）與二樓的牆
  b.box('brick', [half * 2 + 0.1, 0.12, T + 0.12], [0, band[0] + 0.06, (z0 + z1) / 2 + 0.03], { tint: pal.dark })
  b.box('brick', [half * 2 + 0.06, 0.1, T + 0.07], [0, band[0] + 0.18, (z0 + z1) / 2 + 0.02], { tint: shade(pal.brick, 0.95) })
  b.box('brick', [half * 2, sill - band[0] - 0.22, T], [0, (band[0] + 0.22 + sill) / 2, (z0 + z1) / 2], { tint: pal.brick, grime: pal.grime * 0.6 })
  // 窗下的三塊白色飾板（灰泥，有淺色的框）
  const edges = [-half, ...windows.flatMap((win) => [win.x - win.w / 2 - 0.08, win.x + win.w / 2 + 0.08]), half]
  for (const win of windows) {
    const pw = win.w + (win.x === 0 ? 0.32 : 0.36)
    b.box('plaster', [pw + 0.1, panels[1] - panels[0] + 0.1, 0.05], [win.x, (panels[0] + panels[1]) / 2, z1 + 0.025], { tint: aged ? '#cfc7b6' : '#e9e4d8', grime: aged ? 0.25 : 0.06 })
    b.box('plaster', [pw - 0.06, panels[1] - panels[0] - 0.08, 0.02], [win.x, (panels[0] + panels[1]) / 2, z1 + 0.055], { tint: aged ? '#d8d1c1' : '#f2efe7' })
  }
  b.box('brick', [half * 2 + 0.06, 0.08, T + 0.07], [0, sill, (z0 + z1) / 2 + 0.02], { tint: pal.dark })
  // 二樓的四道磚柱（凸出牆面）與三組窗（窗上是弧形的拱與拱磚）
  for (let i = 0; i < 4; i++) {
    const x0 = edges[i * 2]
    const x1 = edges[i * 2 + 1]
    b.box('brick', [x1 - x0, cornice - sill, T + 0.05], [(x0 + x1) / 2, (sill + cornice) / 2, (z0 + z1) / 2 + 0.025], { tint: shade(pal.brick, 0.97), grime: pal.grime * 0.5 })
  }
  windows.forEach((win, i) => {
    const ww = win.w + 0.16
    const rise = ww * 0.22
    archSpandrel(b, win.x, ww, windowSpring, cornice, z0, T, pal.brick, rise)
    voussoirs(b, win.x, windowSpring, ww, z1 + 0.02, pal, rise, 20 + i)
    woodWindow(b, win, ww, rise, z0 + 0.1, pal, variant)
  })
  // 簷口、女兒牆與綠色花磚（三個磚框，每框三塊）
  b.box('brick', [half * 2 + 0.16, 0.12, T + 0.16], [0, cornice + 0.06, (z0 + z1) / 2 + 0.05], { tint: pal.dark })
  b.box('brick', [half * 2 + 0.1, 0.08, T + 0.1], [0, cornice + 0.16, (z0 + z1) / 2 + 0.035], { tint: shade(pal.dark, 1.08) })
  b.box('brick', [half * 2, parapet[1] - cornice - 0.2, T], [0, (cornice + 0.2 + parapet[1]) / 2, (z0 + z1) / 2], { tint: pal.brick, grime: pal.grime })
  b.box('brick', [half * 2 + 0.08, 0.08, T + 0.08], [0, parapet[1] + 0.04, (z0 + z1) / 2], { tint: pal.dark })
  const rng = createRng(329)
  for (const win of windows) {
    const n = win.x === 0 ? 4 : 3
    const fw = n * 0.2 + 0.12
    b.box('brick', [fw + 0.08, tiles.y1 - tiles.y0 + 0.12, 0.05], [win.x, (tiles.y0 + tiles.y1) / 2, z1 + 0.02], { tint: pal.dark })
    for (let k = 0; k < n; k++) {
      const x = win.x - ((n - 1) * 0.2) / 2 + k * 0.2
      ventTile(b, x, (tiles.y0 + tiles.y1) / 2, z1 + 0.05, pal.tile, aged && rng() < 0.25)
    }
  }
  // 兩側的雨水管與支架
  for (const x of [-half + 0.08, half - 0.08]) {
    b.cylinder('plain', 0.045, 0.045, parapet[1] - 0.2, 10, [x, (parapet[1] - 0.2) / 2, z1 + 0.08], { tint: aged ? '#7a4a3a' : '#8a5848' })
    for (const y of [1.2, 3.6, 6.0]) b.box('steel', [0.12, 0.03, 0.09], [x, y, z1 + 0.04], { tint: '#6f6a64' })
  }
  // 磚面的色差與磨損：補過的磚、缺角、深色的水痕
  const patches = aged ? 16 : variant === 'riceAndShineModern' ? 12 : 5
  for (let i = 0; i < patches; i++) {
    const x = -half + 0.2 + rng() * (half * 2 - 0.4)
    const y = 0.5 + rng() * (parapet[0] - 0.8)
    const tint = rng() < 0.5 ? shade(pal.brick, 0.78) : shade(pal.brick, 1.14)
    b.box('brick', [0.18 + rng() * 0.3, 0.07 + rng() * 0.1, 0.012], [x, y, z1 + 0.007], { tint })
  }
  if (aged || variant === 'riceAndShineModern') {
    for (const x of [-2.1, -0.95, 0.4, 1.4, 2.2]) b.box('plain', [0.05, 0.9 + rng() * 0.6, 0.006], [x, cornice - 0.55, z1 + 0.034], { tint: shade(pal.dark, aged ? 0.7 : 0.85) })
  }
  // 牆縫與女兒牆上的小植物（戰後與現在）
  if (aged || variant === 'riceAndShineModern') {
    for (const [x, y] of [
      [-2.5, parapet[1] + 0.05],
      [1.1, parapet[1] + 0.05],
      [2.55, cornice + 0.2],
    ]) {
      for (let k = 0; k < 4; k++) b.add('plain', new IcosahedronGeometry(0.06 + rng() * 0.05, 0), { position: [x + (rng() - 0.5) * 0.25, y + rng() * 0.12, z1], scale: [1.4, 0.8, 0.8], tint: rng() < 0.5 ? '#5f7f45' : '#7a9a52' })
    }
  }
}

/** 二樓的木框窗：深色玻璃、木框與窗櫺（中央是格子窗，兩側是雙開窗；現在的兩側窗是打開的） */
function woodWindow(b, win, ww, rise, z, pal, variant) {
  const { sill, windowSpring } = RS
  const r = ww / 2
  const glass = new Shape()
  const R = (r * r + rise * rise) / (2 * rise)
  const cy = windowSpring + rise - R
  const a = Math.atan2(windowSpring - cy, r)
  glass.moveTo(win.x - r, sill)
  glass.lineTo(win.x + r, sill)
  glass.lineTo(win.x + r, windowSpring)
  glass.absarc(win.x, cy, R, a, Math.PI - a, false)
  glass.lineTo(win.x - r, sill)
  b.extrude('dark', glass, 0.02, { position: [0, 0, z - 0.06], tint: '#1f1a17', curveSegments: 10 })
  const wood = variant === 'postwarRiceHouse' ? '#5c4330' : '#6e4a2f'
  const h = windowSpring - sill
  for (const s of [-1, 1]) b.box('wood', [0.07, h + rise * 0.6, 0.08], [win.x + s * (win.w / 2), sill + (h + rise * 0.6) / 2, z], { tint: wood })
  b.box('wood', [win.w + 0.14, 0.07, 0.1], [win.x, sill + 0.035, z + 0.01], { tint: wood })
  b.box('wood', [win.w, 0.06, 0.08], [win.x, windowSpring, z], { tint: wood })
  if (win.x === 0) {
    // 中央的格子窗
    b.box('glass', [win.w - 0.06, h - 0.06, 0.02], [win.x, sill + h / 2, z - 0.01], { tint: variant === 'riceAndShineModern' ? '#bcd0d2' : '#9fb1b4' })
    for (let i = 1; i < 4; i++) b.box('wood', [0.035, h, 0.05], [win.x - win.w / 2 + (i * win.w) / 4, sill + h / 2, z + 0.01], { tint: wood })
    for (let i = 1; i < 5; i++) b.box('wood', [win.w, 0.035, 0.05], [win.x, sill + (i * h) / 5, z + 0.01], { tint: wood })
  } else if (variant === 'riceAndShineModern') {
    // 打開的雙開窗（兩扇往外推開）
    for (const s of [-1, 1]) {
      const hinge = win.x + s * (win.w / 2)
      b.group([hinge, 0, z + 0.04], s * 1.15, () => {
        b.box('wood', [win.w / 2, h - 0.04, 0.05], [-s * (win.w / 4), sill + h / 2, 0], { tint: wood })
        b.box('glass', [win.w / 2 - 0.1, h - 0.16, 0.02], [-s * (win.w / 4), sill + h / 2, 0.02], { tint: '#bcd0d2' })
      })
    }
  } else {
    b.box('glass', [win.w - 0.06, h - 0.06, 0.02], [win.x, sill + h / 2, z - 0.01], { tint: '#93a4a7' })
    b.box('wood', [0.05, h, 0.05], [win.x, sill + h / 2, z + 0.01], { tint: wood })
    for (let i = 1; i < 3; i++) b.box('wood', [win.w, 0.035, 0.05], [win.x, sill + (i * h) / 3, z + 0.01], { tint: wood })
  }
}

/** 騎樓：地坪、木梁天花、端牆、一樓店面線上的門與牆 */
function arcadeAndShopfront(b, variant) {
  const pal = PALETTE[variant]
  const { half, arcadeCeiling: ceil, door, pierZ } = RS
  const modern = variant === 'riceAndShineModern'
  const aged = variant === 'postwarRiceHouse'
  // 騎樓地坪：現在是紅色地磚，早期是灰色的洗石子／三和土
  b.box(modern ? 'terracotta' : 'granite', [half * 2 - 0.4, 0.03, pierZ[0]], [0, 0.035, pierZ[0] / 2], { tint: modern ? '#d27a52' : aged ? '#8f8a80' : '#aaa59b' })
  // 兩端的端牆（與鄰屋的騎樓隔開）
  for (const s of [-1, 1]) b.box('brick', [0.2, ceil, pierZ[0]], [s * (half - 0.1), ceil / 2, pierZ[0] / 2], { tint: shade(pal.brick, 0.95), grime: pal.grime })
  // 騎樓天花：深色木梁與木板
  b.box('planks', [half * 2 - 0.4, 0.04, pierZ[0] + 0.1], [0, ceil + 0.12, pierZ[0] / 2], { tint: aged ? '#3a2b21' : '#4a3426' })
  for (let i = 0; i < 9; i++) b.box('wood', [0.1, 0.14, pierZ[0] + 0.1], [-half + 0.45 + i * ((half * 2 - 0.9) / 8), ceil + 0.03, pierZ[0] / 2], { tint: aged ? '#3d2c22' : '#523a2a' })
  // 一樓店面線：中央的入口與兩側的牆（木門）
  const wallZ = -RS.wallT / 2
  const wood = aged ? '#5e4430' : modern ? '#9a6a40' : '#7b5536'
  for (const [x0, x1] of [
    [-IN, door.minX],
    [door.maxX, IN],
  ]) {
    b.box('brick', [x1 - x0, ceil, RS.wallT], [(x0 + x1) / 2, ceil / 2, wallZ], { tint: shade(pal.brick, 0.92), grime: pal.grime })
    // 兩側拱下的木門（關著）
    const cx = (x0 + x1) / 2
    b.box('wood', [x1 - x0 - 0.5, 2.3, 0.06], [cx, 1.15, 0.03], { tint: wood })
    for (const y of [0.6, 1.4, 2.0]) b.box('wood', [x1 - x0 - 0.62, 0.03, 0.02], [cx, y, 0.07], { tint: shade(wood, 0.75) })
  }
  b.box('brick', [door.maxX - door.minX, ceil - door.height, RS.wallT], [0, (door.height + ceil) / 2, wallZ], { tint: shade(pal.brick, 0.9) })
  if (modern) {
    // 中央的玻璃入口：深色的鋼框、兩扇玻璃門與門把；門楣上方的木作與金色店招
    b.box('glassClear', [door.maxX - door.minX - 0.04, door.height - 0.04, 0.03], [0, door.height / 2, 0.02], { tint: '#e6eef0' })
    for (const x of [door.minX, 0, door.maxX]) b.box('steel', [0.05, door.height, 0.06], [x, door.height / 2, 0.03], { tint: '#2a2826' })
    b.box('steel', [door.maxX - door.minX + 0.05, 0.06, 0.06], [0, door.height, 0.03], { tint: '#2a2826' })
    for (const s of [-1, 1]) b.box('steel', [0.02, 0.36, 0.04], [s * 0.08, 1.1, 0.07], { tint: '#b9a06a' })
    b.box('wood', [door.maxX - door.minX + 0.4, 0.5, 0.08], [0, door.height + 0.3, 0.04], { tint: '#3d2a1e' })
    b.addSign({ text: '稻舍 Rice & Shine', style: 'riceGold', width: 1.6, height: 0.34, position: [0, door.height + 0.3, 0.09] })
    // 門口的紅色地墊
    b.box('cloth', [1.1, 0.012, 0.6], [0, 0.055, 0.45], { tint: '#8a2a2a' })
  } else {
    // 早期：往內推開的木門與門檻
    b.box('wood', [door.maxX - door.minX + 0.12, 0.08, 0.26], [0, 0.04, wallZ], { tint: shade(wood, 0.8) })
    for (const s of [-1, 1]) {
      b.box('wood', [0.08, door.height, 0.24], [s * door.maxX, door.height / 2, wallZ], { tint: shade(wood, 0.85) })
      b.box('wood', [0.6, door.height - 0.1, 0.05], [s * (door.maxX + 0.3), (door.height - 0.1) / 2, -RS.wallT - 0.04], { tint: wood })
    }
    b.box('wood', [door.maxX - door.minX + 0.16, 0.1, 0.24], [0, door.height + 0.05, wallZ], { tint: shade(wood, 0.85) })
  }
  // 騎樓下的燈：現在是暖色的燈泡；早期是裸燈泡
  for (const x of [-1.8, 0, 1.8]) {
    b.cylinder('dark', 0.008, 0.008, 0.25, 4, [x, ceil - 0.13, 0.75], { tint: '#1d1b1a' })
    b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, ceil - 0.3, 0.75], tint: '#ffe8c0' })
    b.addGlow(x, ceil - 0.32, 0.75, modern ? 0.8 : 0.6, '#ffd59a')
  }
  b.addPool(0, 0.7, modern ? 1.6 : 1.1, '#ffcf96')
}

/** 騎樓牆上的大稻埕街景壁畫（西端牆內側，原創圖樣）、黑底的「稻舍米糧行」牌、菜單架、長凳與竹篩 */
function modernArcadeDetails(b, detail) {
  const { half, pierZ, arcadeCeiling: ceil } = RS
  const wallX = half - 0.2
  b.box('brick', [0.06, 2.6, pierZ[0] - 0.2], [wallX - 0.03, 1.5, pierZ[0] / 2], { tint: '#8f4c38' })
  ricePanel(b, 'arcadeMural', pierZ[0] - 0.3, 2.45, [wallX - 0.065, 1.5, pierZ[0] / 2], -Math.PI / 2)
  b.box('plain', [0.08, 0.14, pierZ[0] - 0.2], [wallX - 0.06, 0.2, pierZ[0] / 2], { tint: '#b3282a' })
  // 黑底金字的「稻舍米糧行」吊牌：掛在右側（西側）拱券下，不擋住入口上方的「稻舍 Rice & Shine」
  const px = RS.arches[2].x
  b.box('dark', [0.98, 0.36, 0.04], [px, ceil - 0.48, 0.3], { tint: '#1b1918' })
  for (const s of [-1, 1]) b.cylinder('steel', 0.006, 0.006, 0.3, 4, [px + s * 0.4, ceil - 0.16, 0.3], { tint: '#3a3634' })
  b.addSign({ text: '稻舍米糧行', style: 'riceBlack', width: 0.9, height: 0.2, position: [px, ceil - 0.44, 0.33] })
  b.addSign({ text: 'RICE & SHINE SHOP', style: 'riceBlack', width: 0.66, height: 0.07, position: [px, ceil - 0.6, 0.33] })
  // 菜單架（看板只畫圖樣，不寫價格）
  b.group([1.25, 0, 0.62], -0.2, () => {
    b.box('steel', [0.03, 1.15, 0.03], [0, 0.57, 0], { tint: '#2a2826' })
    b.box('steel', [0.4, 0.02, 0.3], [0, 0.02, 0], { tint: '#2a2826' })
    b.box('dark', [0.46, 0.34, 0.03], [0, 1.18, 0.02], { rotation: [-0.5, 0, 0], tint: '#1f1d1c' })
    ricePanel(b, 'menuCard', 0.4, 0.28, [0, 1.19, 0.045], 0)
  })
  // 長凳、竹篩與陶甕（照片：玻璃門旁）
  b.box('wood', [1.3, 0.06, 0.32], [-1.75, 0.45, 0.25], { tint: '#6e4a2f' })
  for (const x of [-2.3, -1.2]) b.box('wood', [0.06, 0.45, 0.28], [x, 0.225, 0.25], { tint: '#5a3c26' })
  b.add('bamboo', new TorusGeometry(0.32, 0.02, 5, 22), { position: [-1.0, 0.36, 0.12], rotation: [0.15, 0, 0], tint: '#b58a52' })
  b.add('bamboo', new CylinderGeometry(0.31, 0.31, 0.01, 22), { position: [-1.0, 0.36, 0.12], rotation: [Math.PI / 2 + 0.15, 0, 0], tint: '#c79c5f' })
  b.cylinder('terracotta', 0.16, 0.12, 0.42, 12, [-2.35, 0.21, 0.55], { tint: '#9a5a3a' })
  detail.add('plain', new IcosahedronGeometry(0.12, 0), { position: [-2.35, 0.55, 0.55], scale: [1, 1.6, 1], tint: '#c9b48a' })
  // 拱下掛的紅燈籠（照片：騎樓左側）
  b.addLantern(-1.85, ceil - 0.45, 1.1, { scale: 0.55, color: '#d0455a' })
}

/** 1930 與 1945：店面上方的木牌（「米」「碾米」，一般的行業字，不使用「稻舍」） */
function oldShopSigns(b, variant) {
  const style = variant === 'postwarRiceHouse' ? 'painted' : 'wood'
  b.box('wood', [1.0, 0.42, 0.05], [0, RS.door.height + 0.42, 0.06], { tint: variant === 'postwarRiceHouse' ? '#d9cdb0' : '#8a6440' })
  b.addSign({ text: '米', style, width: 0.86, height: 0.34, position: [0, RS.door.height + 0.42, 0.09] })
  b.group([1.05, 0, 1.28], 0, () => {
    b.box('wood', [0.06, 0.06, 0.4], [0, 2.85, -0.2], { tint: '#5a3c26' })
    b.box('wood', [0.05, 1.05, 0.32], [0, 2.25, 0.02], { tint: variant === 'postwarRiceHouse' ? '#e9e1cf' : '#9a7048' })
  })
  b.addSign({ text: '碾米', style: variant === 'postwarRiceHouse' ? 'vertical' : 'wood', vertical: true, width: 0.28, height: 0.95, position: [1.08, 2.25, 1.3], rotationY: Math.PI / 2 })
  b.addSign({ text: '碾米', style: variant === 'postwarRiceHouse' ? 'vertical' : 'wood', vertical: true, width: 0.28, height: 0.95, position: [1.02, 2.25, 1.3], rotationY: -Math.PI / 2 })
  if (variant === 'postwarRiceHouse') {
    // 戰後：電線、電表與牆上的舊鐵皮雨遮
    for (const y of [3.55, 3.65]) b.box('dark', [RS.half * 2 + 0.6, 0.015, 0.015], [0, y, RS.pierZ[1] + 0.1], { tint: '#1f1d1c' })
    b.box('steel', [0.26, 0.34, 0.12], [-2.2, 2.6, 0.06], { tint: '#9a9f9a' })
  }
}

/** 外殼：兩側牆、後牆、屋頂（前進與後進）；天井上方開敞 */
function shell(b, variant) {
  const pal = PALETTE[variant] ?? PALETTE.riceMill
  const { half, wallT, depth, parapet, floor2 } = RS
  const top = 7.0
  for (const s of [-1, 1]) {
    b.box('brick', [wallT, top, depth], [s * (half - wallT / 2), top / 2, -depth / 2], { tint: shade(pal.brick, 0.9), grime: pal.grime + 0.1 })
    b.box('brick', [wallT, top - RS.arcadeCeiling, RS.pierZ[0]], [s * (half - wallT / 2), (RS.arcadeCeiling + top) / 2, RS.pierZ[0] / 2], { tint: shade(pal.brick, 0.9) })
  }
  b.box('brick', [half * 2, top, wallT], [0, top / 2, -depth + wallT / 2], { tint: shade(pal.brick, 0.88), grime: pal.grime + 0.1 })
  // 前進（含騎樓上方）與後進的屋頂；天井（z -6.0 ~ -7.8）上方開敞
  b.box('roof', [half * 2, 0.12, RS.front.maxZ - RS.front.minZ + RS.pierZ[1] + 0.4], [0, parapet[0] - 0.05, (RS.front.minZ + RS.pierZ[1]) / 2], { tint: '#8d8478' })
  b.box('roof', [half * 2, 0.12, RS.back.maxZ - RS.back.minZ + 0.4], [0, top - 0.1, (RS.back.minZ + RS.back.maxZ) / 2], { rotation: [0.08, 0, 0], tint: '#9a6a52' })
  // 天井旁、前進與後進之間的牆（二樓以上）
  // 現在的版本：過廊（右側）穿過這兩道牆，留一個門洞（高 2.3 m）
  const gap = variant === 'riceAndShineModern' ? RS.corridor.minX - 0.02 : null
  for (const z of [RS.front.minZ - wallT / 2, RS.back.maxZ + wallT / 2]) {
    if (gap == null) {
      b.box('brick', [half * 2 - wallT * 2, top - floor2, wallT], [0, (floor2 + top) / 2, z], { tint: shade(pal.brick, 0.92), grime: pal.grime })
      continue
    }
    const inner = half - wallT
    b.box('brick', [gap + inner, top - floor2, wallT], [(gap - inner) / 2, (floor2 + top) / 2, z], { tint: shade(pal.brick, 0.92), grime: pal.grime })
    b.box('brick', [inner - gap, top - floor2 - 2.3, wallT], [(gap + inner) / 2, (floor2 + 2.3 + top) / 2, z], { tint: shade(pal.brick, 0.92), grime: pal.grime })
  }
}

/** 一樓的暗色外殼（室內細部未載入時，從門口看進去是暗的）與室內的燈火 */
function interiorShell(b, variant) {
  const spaces = variant === 'earlyRiceTrade' ? [RS.frontShop] : [RS.front, RS.back]
  const ceiling = RS.ceiling1 + 0.15
  for (const r of spaces) {
    const w = r.maxX - r.minX
    const d = r.maxZ - r.minZ
    const cz = (r.minZ + r.maxZ) / 2
    b.box('dark', [w, 0.02, d], [0, 0.025, cz], { tint: '#2f2822' })
    b.box('dark', [w, 0.04, d], [0, ceiling + 0.25, cz], { tint: '#241d18' })
    for (const s of [-1, 1]) b.box('dark', [0.02, ceiling + 0.25, d], [s * (IN - 0.01), (ceiling + 0.25) / 2, cz], { tint: '#33291f' })
  }
  b.box('dark', [RS.half * 2 - 0.4, ceiling + 0.25, 0.02], [0, (ceiling + 0.25) / 2, RS.back.minZ + 0.01], { tint: '#33291f' })
  b.addGlow(0, 1.9, -0.8, 1.4, '#ffc98a')
  if (variant === 'riceAndShineModern') {
    // 軌道燈（只在現在）
    for (const z of [-1.6, -2.8, -4.0, -5.2]) for (const x of [-1.2, 1.2]) b.addGlow(x, RS.ceiling1 - 0.2, z, 0.55, '#ffe2b0')
    b.addGlow(0, 2.6, -8.9, 0.9, '#ffd9a6')
    b.addGlow(0, RS.floor2 + 2.2, -2.0, 1.2, '#ffe0b0')
    // 二樓臨街大窗透進來的日光
    b.addPool(0, 0.3, 1.6, '#fff1d6', RS.floor2 + 0.06)
  } else if (variant !== 'earlyRiceTrade') {
    // 1930、1945：只有暖色的裸燈泡
    for (const z of [-1.4, -4.2, -9.2]) b.addGlow(0.2, RS.ceiling1 - 0.4, z, 0.7, '#ffc77f')
  }
  // 天井的日光
  if (variant !== 'earlyRiceTrade') b.addPool(0, -6.9, 1.6, '#fff4dc')
}

/* ═══════════ 1895–1930：初期的米業店屋 ═══════════ */

function earlyRiceTrade(b, config, detail) {
  // 閩南式街屋：紅磚、木構、瓦屋頂、亭仔腳；「米」字木牌、「碾米」直式木牌與「糧」布幡
  buildShophouse(b, {
    ...config,
    width: RS.half * 2,
    depth: RS.depth,
    floors: 1,
    groundHeight: 3.3,
    ground: 'brick',
    upper: 'plaster',
    plasterTint: '#e8d8bc',
    gable: 'horseback',
    ridge: 'plain',
    storefront: 'open',
    goods: 'rice',
    sign: { text: '米', style: 'wood' },
    hangingSign: { text: '碾米', style: 'wood', side: 'right' },
    banner: { text: '糧' },
    condition: 'mature',
    seed: 1916,
  })
  // 街邊的米業：米袋堆、竹籮、木桶、米斗與凳子、扁擔、手推車與稻穀袋
  const { arcadeSacks: s, barrels, measureStool: m, cart } = EARLY
  const rng = createRng(1895)
  for (let i = 0; i < 6; i++) {
    sack(b, [s.minX + 0.25 + (i % 3) * 0.33, 0.05 + Math.floor(i / 3) * 0.3, (s.minZ + s.maxZ) / 2 + (rng() - 0.5) * 0.2], { rotationY: rng() * 0.6, tint: i % 2 ? '#e2d3b4' : '#cdb991', seed: 30 + i })
  }
  barrel(b, [(barrels.minX + barrels.maxX) / 2 - 0.15, 0, barrels.minZ + 0.3], { radius: 0.26, height: 0.7 })
  basket(b, [(barrels.minX + barrels.maxX) / 2 + 0.1, 0.02, barrels.maxZ - 0.2], { radius: 0.24, depth: 0.16, content: 'rice', seed: 5 })
  b.box('wood', [0.4, 0.04, 0.4], [(m.minX + m.maxX) / 2, 0.45, (m.minZ + m.maxZ) / 2], { tint: '#8a6440' })
  for (const [dx, dz] of [
    [-0.16, -0.16],
    [0.16, -0.16],
    [-0.16, 0.16],
    [0.16, 0.16],
  ]) b.box('wood', [0.04, 0.45, 0.04], [(m.minX + m.maxX) / 2 + dx, 0.225, (m.minZ + m.maxZ) / 2 + dz], { tint: '#6a4a30' })
  riceMeasure(b, detail, (m.minX + m.maxX) / 2, 0.47, (m.minZ + m.maxZ) / 2, 0.2)
  handcart(b, [(cart.minX + cart.maxX) / 2, 0, (cart.minZ + cart.maxZ) / 2], { rotationY: Math.PI / 2 + 0.2, load: 'sacks', seed: 7 })
  const pole = EARLY.pole
  carryingPole(b, [(pole.minX + pole.maxX) / 2, 0, (pole.minZ + pole.maxZ) / 2 - 0.05], { rotationY: 0.04, content: 'rice', seed: 9 })
}

/** 米斗：上寬下窄的木斗，四片木板、金屬角件與斗裡的米（size 是斗口的半寬） */
export function riceMeasure(b, detail, x, y, z, size = 0.2, rotationY = 0) {
  const h = size * 1.05
  b.group([x, y, z], rotationY, () => {
    const bottom = size * 0.72
    for (const [rx, rz, sx, sz] of [
      [0, 1, 0, 1],
      [0, -1, 0, -1],
      [1, 0, 1, 0],
      [-1, 0, -1, 0],
    ]) {
      const tilt = Math.atan2(size - bottom, h)
      const len = (size + bottom) + 0.03
      if (rz) b.box('wood', [len, h, 0.025], [0, h / 2, rz * (size + bottom) / 2], { rotation: [rz * tilt, 0, 0], tint: rz > 0 ? '#9a6e44' : '#8a6038' })
      else b.box('wood', [0.025, h, len], [rx * (size + bottom) / 2, h / 2, 0], { rotation: [0, 0, -rx * tilt], tint: rx > 0 ? '#a37548' : '#80583a' })
      void sx
      void sz
    }
    b.box('wood', [bottom * 2, 0.025, bottom * 2], [0, 0.0125, 0], { tint: '#6e4a2e' })
    // 金屬角件與斗口的磨損
    for (const [cx, cz] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) b.box('steel', [0.035, 0.05, 0.035], [cx * size * 0.98, h - 0.03, cz * size * 0.98], { tint: '#3f3a34' })
    // 斗裡的米（少量米粒在細部）
    b.box('plain', [size * 1.7, 0.02, size * 1.7], [0, h - 0.05, 0], { tint: '#efe9d8' })
    const rng = createRng(Math.round(x * 100 + z * 10))
    for (let i = 0; i < 18; i++) detail.add('plain', new IcosahedronGeometry(0.006, 0), { position: [x + (rng() - 0.5) * size * 1.5, y + h - 0.035, z + (rng() - 0.5) * size * 1.5], scale: [1.8, 0.8, 1], tint: '#f5f1e4' })
  })
}

/* ═══════════ 遮擋方塊、點選範圍、碰撞 ═══════════ */

function registerBlockers(b, variant) {
  const { half, pierZ, arcadeCeiling: ceil, piers, door, wallT, depth, parapet, front, back, courtyard, floor2 } = RS
  const ranges = {}
  const mark = (name, fn) => {
    const start = b.blockers.length
    fn()
    ranges[name] = { start, end: b.blockers.length }
  }
  if (variant === 'earlyRiceTrade') {
    mark('street', () => b.addBlocker(-half + 0.05, half - 0.05, 0, 5.2, -depth, 0.0))
    const m = EARLY.measureStool
    mark('measure', () => b.addBlocker(m.minX, m.maxX, 0, 0.75, m.minZ, m.maxZ))
    return ranges
  }
  // 一樓：店面線的牆（入口兩側與門楣上方）、騎樓的磚柱與端牆
  b.addBlocker(-half, door.minX, 0, ceil, -wallT, 0)
  b.addBlocker(door.maxX, half, 0, ceil, -wallT, 0)
  b.addBlocker(door.minX, door.maxX, door.height, ceil, -wallT, 0)
  for (const [x0, x1] of piers) b.addBlocker(x0, x1, 0, RS.band[0], pierZ[0], pierZ[1] - 0.02)
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - 0.2, s < 0 ? -half + 0.2 : half, 0, ceil, 0, pierZ[0])
  // 騎樓上方與二樓的立面、屋頂（現在的版本二樓臨街的前進可以走到窗邊：只擋騎樓天花到二樓樓板，與立面本身）
  if (variant === 'riceAndShineModern') {
    b.addBlocker(-half, half, ceil, floor2, front.maxZ, pierZ[1] - 0.02)
    b.addBlocker(-half, half, floor2, parapet[1] + 0.1, pierZ[0] - 0.02, pierZ[1] - 0.02)
  } else {
    b.addBlocker(-half, half, ceil, parapet[1] + 0.1, front.maxZ, pierZ[1] - 0.02)
  }
  // 兩側牆、後牆
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, 7.0, -depth, 0)
  b.addBlocker(-half, half, 0, 7.0, -depth, back.minZ)
  // 前進與後進之間（天井兩側）的牆：一樓有門洞
  for (const [z0, z1, d] of [
    [front.minZ - wallT, front.minZ, RS.courtyardDoor],
    [back.maxZ, back.maxZ + wallT, RS.backDoor],
  ]) {
    b.addBlocker(-half, d.minX, 0, floor2, z0, z1)
    b.addBlocker(d.maxX, half, 0, floor2, z0, z1)
    b.addBlocker(d.minX, d.maxX, d.height, floor2, z0, z1)
  }
  const modern = variant === 'riceAndShineModern'
  // 一樓的天花（前進、後進）；現在的版本二樓前進可以走，其他版本二樓整層是實心
  if (modern) {
    b.addBlocker(-half, half, RS.ceiling1, floor2, front.minZ, front.maxZ)
    // 後進的一樓天花：樓梯上方開一個樓梯井（二樓的樓梯井到屋頂都是開的）
    b.addBlocker(-half, RS.landing.minX - 0.02, RS.ceiling1, floor2, RS.stair.maxZ + 0.08, back.maxZ)
    b.addBlocker(RS.landing.minX, half, RS.ceiling1, floor2, back.minZ, back.maxZ)
    // 二樓：臨街的前進的天花與屋頂、前進與過廊之間的牆（過廊的門洞）、後進二樓（平台以外）不開放
    b.addBlocker(-half, half, RS.ceiling2, 7.4, front.minZ, pierZ[0])
    b.addBlocker(-half, RS.corridor.minX - 0.02, floor2, 7.0, front.minZ - wallT, front.minZ)
    b.addBlocker(-half, RS.landing.minX - 0.05, floor2, 7.0, RS.stair.maxZ + 0.08, back.maxZ + wallT)
    b.addBlocker(-half, RS.landing.minX - 0.05, RS.ceiling2, 7.0, back.minZ, RS.stair.maxZ + 0.08)
    b.addBlocker(RS.landing.minX, half, RS.ceiling2, 7.0, back.minZ, back.maxZ + wallT)
    // 過廊的欄杆（天井那一側）
    b.addBlocker(RS.corridor.minX - 0.08, RS.corridor.minX, floor2, floor2 + 1.0, courtyard.minZ - 0.2, courtyard.maxZ + 0.2)
    // 二樓過廊的樓板（從天井看上去）
    b.addBlocker(RS.corridor.minX - 0.08, half, floor2 - 0.25, floor2, courtyard.minZ - 0.2, courtyard.maxZ + 0.2)
  } else {
    b.addBlocker(-half, half, RS.ceiling1, 7.0, front.minZ, front.maxZ)
    b.addBlocker(-half, half, RS.ceiling1 + 0.6, 7.0, back.minZ, back.maxZ)
  }
  // 點選、聚焦的目標
  if (modern) {
    const sh = MODERN.shelf
    mark('exhibit', () => b.addBlocker(sh.minX, sh.maxX, 0.3, sh.height, sh.minZ, sh.maxZ))
    const ms = MODERN.measureStand
    mark('measure', () => b.addBlocker(ms.minX, ms.maxX, 0, ms.height + 0.35, ms.minZ, ms.maxZ))
    const hk = MODERN.husker
    mark('basket', () => b.addBlocker(hk.minX, hk.maxX, 0, hk.height, hk.minZ, hk.maxZ))
    const rb = MODERN.renewalBoard
    mark('renewal', () => b.addBlocker(rb.minX, rb.maxX, rb.y0, rb.y1, -wallT - 0.06, -wallT))
    const ml = MODERN.mill
    mark('milling', () => b.addBlocker(ml.minX, ml.maxX, 0, ml.height, ml.minZ, ml.maxZ))
    mark('food', () => {
      const t = MODERN.tables[0]
      b.addBlocker(t.x - MODERN.table.half, t.x + MODERN.table.half, MODERN.table.height - 0.02, MODERN.table.height + 0.2, t.z - MODERN.table.half, t.z + MODERN.table.half)
    })
    const nb = MODERN.nanjieBoard
    mark('nanjie', () => b.addBlocker(RS.upstairs.maxX - 0.06, RS.upstairs.maxX, floor2 + nb.y0, floor2 + nb.y1, nb.minZ, nb.maxZ))
    mark('courtyard', () => b.addBlocker(-half + wallT, -half + wallT + 0.06, MODERN.mural.y0, MODERN.mural.y1, MODERN.mural.minZ, MODERN.mural.maxZ))
  } else {
    const L = variant === 'riceMill' ? MILL : POSTWAR
    mark('machine', () => b.addBlocker(L.machine.minX, L.machine.maxX, 0, L.machine.height, L.machine.minZ, L.machine.maxZ))
    mark('counter', () => b.addBlocker(L.counter.minX, L.counter.maxX, 0, L.counter.height + 0.3, L.counter.minZ, L.counter.maxZ))
  }
  return ranges
}

/** 家具的遮擋方塊（只給鏡頭用） */
export function riceFurnitureBlockers(b, config) {
  const variant = config.variant
  if (variant === 'riceAndShineModern') {
    for (const t of MODERN.tables) {
      const r = diningTableBox(t)
      b.addBlocker(r.minX, r.maxX, 0, 0.95, r.minZ, r.maxZ)
    }
    for (const t of MODERN.longTables) {
      const r = longTableBox(t)
      b.addBlocker(r.minX, r.maxX, RS.floor2, RS.floor2 + 0.95, r.minZ, r.maxZ)
    }
    for (const r of [MODERN.counter, MODERN.cabinet, MODERN.pass]) b.addBlocker(r.minX, r.maxX, 0, r.height, r.minZ, r.maxZ)
  } else if (variant === 'riceMill' || variant === 'postwarRiceHouse') {
    const L = variant === 'riceMill' ? MILL : POSTWAR
    for (const key of Object.keys(L)) {
      if (['machine', 'counter'].includes(key)) continue
      const r = L[key]
      if (r?.minX == null) continue
      b.addBlocker(r.minX, r.maxX, 0, r.height ?? 1, r.minZ, r.maxZ)
    }
  }
}

function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/**
 * 可行走範圍與障礙物（世界座標，分樓層）。1895 的街屋不能進去（只有街邊的擺設是障礙物）；
 * 1930、1945：騎樓、入口、前進、天井、後進；2000：再加上後進的木樓梯（看不見的斜面）、二樓的平台、過廊與前進。
 */
export function riceAndShineCollision(config, transform) {
  const variant = config.variant
  const rect = (minX, maxX, minZ, maxZ, extra = {}) => ({ ...worldRect(transform, minX, maxX, minZ, maxZ), ...extra })
  // 店屋的可行走範圍（騎樓與室內）標示 inBuilding：換年代時被移走的角色回到街上，不會被推進這棟店屋（見 collision.js）
  const room = (minX, maxX, minZ, maxZ, extra = {}) => rect(minX, maxX, minZ, maxZ, { inBuilding: true, ...extra })
  const ob = (r, extra = {}) => rect(r.minX, r.maxX, r.minZ, r.maxZ, extra)
  if (variant === 'earlyRiceTrade') {
    const { arcadeSacks, barrels, measureStool, cart, pole } = EARLY
    return { walkable: [], obstacles: [ob(arcadeSacks), ob(barrels), ob(measureStool), ob(cart), ob(pole)] }
  }
  const { half, pierZ, piers, door, front, courtyard, back, wallT, courtyardDoor: cd, backDoor: bd } = RS
  const inner = half - 0.2
  const walkable = [
    // 騎樓（與街道重疊）、入口、前進、天井、後進與兩道門洞
    room(-inner + 0.02, inner - 0.02, 0.02, pierZ[1] + 0.1),
    room(door.minX + 0.02, door.maxX - 0.02, -wallT - 0.3, 0.3),
    room(front.minX + 0.02, front.maxX - 0.02, front.minZ + 0.02, front.maxZ - 0.02),
    room(cd.minX + 0.02, cd.maxX - 0.02, courtyard.maxZ - 0.3, front.minZ + 0.3),
    room(courtyard.minX + 0.02, courtyard.maxX - 0.02, courtyard.minZ + 0.02, courtyard.maxZ - 0.02),
    room(bd.minX + 0.02, bd.maxX - 0.02, back.maxZ - 0.3, courtyard.minZ + 0.3),
  ]
  const obstacles = [...piers.map(([x0, x1]) => rect(x0 - 0.02, x1 + 0.02, pierZ[0] - 0.02, pierZ[1] + 0.05))]
  // 站著的人物（店員、碾米工人）
  for (const npc of RICE_NPCS[variant] ?? []) if (!npc.table && npc.pose !== 'eat') obstacles.push(rect(npc.x - 0.25, npc.x + 0.25, npc.z - 0.25, npc.z + 0.25))
  if (variant === 'riceAndShineModern') {
    const { stair, stairPad: pad, landing, corridor, upstairs } = RS
    const F2 = RS.floor2
    const ramp = { axis: 'x', from: transform(stair.fromX, 0).x, to: transform(stair.toX, 0).x, y0: 0, y1: F2 }
    walkable.push(
      // 後進：樓梯以外的地方（樓梯口另外一塊）
      room(back.minX + 0.02, back.maxX - 0.02, stair.maxZ, back.maxZ - 0.02),
      room(pad.minX, pad.maxX, pad.minZ, pad.maxZ + 0.1),
      room(stair.fromX - 0.05, stair.toX + 0.1, stair.minZ, stair.maxZ, { levels: [0, 1], ramp }),
      room(landing.minX, landing.maxX, landing.minZ, landing.maxZ, { level: 1, floorY: F2 }),
      room(corridor.minX, corridor.maxX, corridor.minZ, corridor.maxZ + 0.4, { level: 1, floorY: F2 }),
      room(upstairs.minX + 0.02, upstairs.maxX - 0.02, upstairs.minZ + 0.02, upstairs.maxZ, { level: 1, floorY: F2 }),
    )
    // 樓梯開放那一側的扶手：只能從樓梯口（西端，最下面兩階也可以）上樓梯，不能從後進的側面踩到高處的踏板
    obstacles.push(rect(stair.fromX + 0.5, back.maxX, stair.maxZ - 0.02, stair.maxZ + 0.1))
    for (const r of [MODERN.counter, MODERN.cabinet, MODERN.shelf, MODERN.husker, MODERN.measureStand, MODERN.tree, ...MODERN.pots, MODERN.mortar, MODERN.mill, MODERN.pass]) obstacles.push(ob(r))
    for (const t of MODERN.tables) obstacles.push(ob(diningTableBox(t)))
    // 騎樓的長凳、菜單架與陶甕
    obstacles.push(rect(-2.4, -1.05, 0.02, 0.45), rect(1.0, 1.5, 0.4, 0.85), rect(-2.55, -2.15, 0.35, 0.75))
    // 二樓：長桌與藤椅、書架、圓几
    for (const t of MODERN.longTables) obstacles.push(ob(longTableBox(t), { level: 1 }))
    obstacles.push(ob(MODERN.bookshelf, { level: 1 }), ob(MODERN.nanjieStand, { level: 1 }))
    const rt = MODERN.roundTable
    obstacles.push(rect(rt.x - rt.r, rt.x + rt.r, rt.z - rt.r, rt.z + rt.r, { level: 1 }))
  } else {
    walkable.push(room(back.minX + 0.02, back.maxX - 0.02, back.minZ + 0.02, back.maxZ - 0.02))
    const L = variant === 'riceMill' ? MILL : POSTWAR
    for (const r of Object.values(L)) if (r?.minX != null) obstacles.push(ob(r))
  }
  return { walkable, obstacles }
}

/* ═══════════ 主程式 ═══════════ */

export function buildRiceAndShineExterior(b, config = {}, detail = b) {
  const variant = config.variant ?? 'riceMill'
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
  const zone = (minX, maxX, minZ, maxZ, extra = {}) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
  }
  const hotspots = RICE_HOTSPOTS[variant]
  const npcs = (RICE_NPCS[variant] ?? []).map((npc, i) => {
    let { x, z, rotationY } = npc
    let seat = false
    if (npc.table) {
      const t = MODERN.tables.find((item) => item.id === npc.table)
      x = t.x
      z = t.z + npc.side * MODERN.chairOffset
      rotationY = npc.side > 0 ? Math.PI : 0
      seat = true
    }
    const w = b.transformPoint(x, 0, z)
    return {
      id: `rice-${variant}-${npc.id}`,
      look: npc.look,
      pose: npc.pose,
      position: [w.x, npc.walkway ? 0.15 : 0, w.z],
      rotationY: b.worldRotationY(rotationY),
      seatY: seat ? 0.46 : undefined,
      phase: (i * 0.31) % 1,
      zone: z < 0 && !npc.walkway ? RS.id : undefined,
    }
  })

  if (variant === 'earlyRiceTrade') {
    earlyRiceTrade(b, config, detail)
    const ranges = registerBlockers(b, variant)
    const street = hotspots[0]
    return {
      groundHeight: 3.3,
      topHeight: 6.4,
      anchors: { prompt: local(...street.prompt), marker: local(0, 7.2, -1.0) },
      focus: { center: toWorld(0, 1.7), forward: dir(0, 1), width: RS.half * 2 + 1, height: 6.0, viewHeight: 2.6, maxDistance: 9, maxPitch: 0.45 },
      subStores: [
        { id: 'rice-early-measure', storeId: RS.id, detail: true, hotspot: 'early-measure', range: ranges.measure, focus: { center: toWorld((EARLY.measureStool.minX + EARLY.measureStool.maxX) / 2, EARLY.measureStool.maxZ), forward: dir(0, 1), width: 1.2, height: 1.0, viewHeight: 0.7, maxDistance: 2.2, maxPitch: 0.7, maxYawOffset: 0.6 } },
      ],
      npcs,
    }
  }

  brickFacade(b, variant)
  arcadeAndShopfront(b, variant)
  if (variant === 'riceAndShineModern') {
    modernArcadeDetails(b, detail)
    // 二樓飾板上的「稻舍」（由左往右，深褐色的浮雕字）
    b.addSign({ text: '稻舍', style: 'riceRelief', width: 1.3, height: 0.44, position: [0, (RS.panels[0] + RS.panels[1]) / 2, RS.pierZ[1] + 0.07] })
  } else {
    oldShopSigns(b, variant)
  }
  shell(b, variant)
  interiorShell(b, variant)
  const ranges = registerBlockers(b, variant)
  const front = hotspots[0]
  const sub = (id, range, hotspot, focus) => ({ id: `rice-${id}`, storeId: RS.id, detail: true, hotspot, range, focus })
  const inside = { maxDistance: 2.6, maxPitch: 0.5, maxYawOffset: 0.6 }
  const F2 = RS.floor2
  const subStores =
    variant === 'riceAndShineModern'
      ? [
          sub('exhibit', ranges.exhibit, 'rs-exhibit', { center: toWorld(MODERN.shelf.maxX, -2.8), forward: dir(1, 0), width: 2.6, height: 2.4, viewHeight: 1.4, ...inside }),
          sub('measure', ranges.measure, 'rs-measure', { center: toWorld(MODERN.measureStand.maxX, -5.36), forward: dir(1, 0), width: 0.9, height: 0.8, viewHeight: 0.95, maxDistance: 2.1, maxPitch: 0.6, maxYawOffset: 0.6 }),
          sub('basket', ranges.basket, 'rs-basket', { center: toWorld(MODERN.husker.maxX, -4.65), forward: dir(1, 0), width: 1.4, height: 1.4, viewHeight: 0.8, ...inside }),
          sub('renewal', ranges.renewal, 'rs-renewal', { center: toWorld(-1.3, -0.3), forward: dir(0, -1), width: 1.0, height: 1.3, viewHeight: 1.55, maxDistance: 2.2, maxPitch: 0.3, maxYawOffset: 0.4 }),
          sub('milling', ranges.milling, 'rs-milling', { center: toWorld(MODERN.mill.minX, -8.85), forward: dir(-1, 0), width: 1.6, height: 1.8, viewHeight: 1.0, maxDistance: 2.2, maxPitch: 0.5, maxYawOffset: 0.6 }),
          sub('food', ranges.food, 'rs-dining', { center: toWorld(MODERN.tables[0].x, MODERN.tables[0].z + 0.4), forward: dir(0, 1), width: 0.9, height: 0.5, viewHeight: MODERN.table.height + 0.1, maxDistance: 2.0, maxPitch: 0.95, maxYawOffset: 0.5 }),
          sub('nanjie', ranges.nanjie, 'rs-nanjie', { center: toWorld(RS.upstairs.maxX, -2.7), forward: dir(-1, 0), width: 1.6, height: 1.6, viewHeight: F2 + 1.7, maxDistance: 2.4, maxPitch: 0.3, maxYawOffset: 0.4 }),
          sub('courtyard', ranges.courtyard, 'rs-courtyard', { center: toWorld(RS.courtyard.minX, -6.9), forward: dir(1, 0), width: 1.8, height: 2.8, viewHeight: 1.9, maxDistance: 2.6, maxPitch: 0.3, maxYawOffset: 0.5 }),
        ]
      : [
          sub('machine', ranges.machine, variant === 'riceMill' ? 'mill-machine' : 'postwar-tools', { center: toWorld(MILL.machine.maxX, -4.25), forward: dir(1, 0), width: 2.2, height: 2.4, viewHeight: 1.3, ...inside }),
          ...(variant === 'riceMill' ? [sub('counter', ranges.counter, 'mill-counter', { center: toWorld(MILL.counter.minX, -1.15), forward: dir(-1, 0), width: 1.2, height: 1.2, viewHeight: 1.0, ...inside })] : []),
        ]
  const room = (r) => zone(r.minX, r.maxX, r.minZ, r.maxZ)
  const interiors = [
    {
      id: RS.id,
      ...room(RS.front),
      // 後進只算到樓梯前（樓梯屬於二樓的室內範圍，爬樓梯時鏡頭跟著往上）
      parts: [room(RS.front), room(RS.courtyard), variant === 'riceAndShineModern' ? zone(RS.back.minX, RS.back.maxX, RS.stairPad.maxZ - 0.05, RS.back.maxZ) : room(RS.back)].map((p) => ({ ...p, level: 0 })),
      ceiling: RS.ceiling1,
      entry: { ...zone(-IN + 0.1, IN - 0.1, -RS.wallT, RS.pierZ[1] + 0.6), level: 0 },
      entryHold: 0.5,
      entryRamp: 2.4,
      door: toWorld(0, 0),
      camera: { distance: 2.9, maxHeight: RS.ceiling1 - 0.35, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
      viewerStart: { distance: 2.5 },
      loadRadius: 14,
      showRadius: 24,
    },
  ]
  if (variant === 'riceAndShineModern') {
    interiors.push({
      id: `${RS.id}-2f`,
      ...room(RS.upstairs),
      parts: [
        { ...zone(RS.stair.fromX, RS.stair.toX, RS.stair.minZ, RS.stair.maxZ), levels: [0, 1] },
        { ...room(RS.landing), level: 1 },
        { ...room(RS.corridor), level: 1 },
        { ...room(RS.upstairs), level: 1 },
      ],
      ceiling: RS.ceiling2,
      camera: { distance: 2.9, maxHeight: RS.ceiling2 - 0.35, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.6 },
      viewerStart: { distance: 2.6 },
      loadRadius: 14,
      showRadius: 24,
    })
  }
  const viewerRegions = [
    { ...zone(-IN + 0.3, IN - 0.3, 0.15, RS.pierZ[0] - 0.1), maxY: 2.3, cameraMaxY: RS.arcadeCeiling - 0.15 },
    { ...zone(RS.door.minX + 0.2, RS.door.maxX - 0.2, -0.6, 0.6), maxY: 2.1, cameraMaxY: RS.door.height - 0.1 },
    { ...zone(RS.front.minX + 0.35, RS.front.maxX - 0.35, RS.front.minZ + 0.35, RS.front.maxZ - 0.3), maxY: 2.3, cameraMaxY: RS.ceiling1 - 0.3 },
    { ...zone(RS.courtyard.minX + 0.35, RS.courtyard.maxX - 0.35, RS.courtyard.minZ + 0.3, RS.courtyard.maxZ - 0.3), maxY: 3.0, cameraMaxY: 5.5 },
    { ...zone(RS.back.minX + 0.35, RS.back.maxX - 0.35, RS.back.minZ + 0.35, RS.back.maxZ - 0.3), maxY: 2.3, cameraMaxY: RS.ceiling1 - 0.3 },
  ]
  if (variant === 'riceAndShineModern') {
    viewerRegions.push(
      { ...zone(RS.landing.minX + 0.1, RS.landing.maxX - 0.1, RS.landing.minZ + 0.1, RS.landing.maxZ), minY: F2 + 0.8, maxY: F2 + 2.0, cameraMaxY: RS.ceiling2 - 0.3 },
      { ...zone(RS.corridor.minX + 0.15, RS.corridor.maxX - 0.15, RS.corridor.minZ, RS.corridor.maxZ), minY: F2 + 0.8, maxY: F2 + 2.0, cameraMaxY: F2 + 2.6 },
      { ...zone(RS.upstairs.minX + 0.25, RS.upstairs.maxX - 0.25, RS.upstairs.minZ + 0.25, RS.upstairs.maxZ - 0.05), minY: F2 + 0.8, maxY: F2 + 2.3, cameraMaxY: RS.ceiling2 - 0.35 },
    )
  }
  return {
    groundHeight: RS.floor2,
    topHeight: RS.parapet[1],
    anchors: { prompt: local(...front.prompt), marker: local(0, RS.parapet[1] + 2.4, -1.0) },
    focus: { center: toWorld(0, RS.pierZ[1]), forward: dir(0, 1), width: RS.half * 2 + 0.6, height: RS.parapet[1], viewHeight: 4.0, maxDistance: 10, maxPitch: 0.45, maxYawOffset: 0.5 },
    subStores,
    interiors,
    viewerRegions,
    followAreas: [zone(-RS.half, RS.half, RS.back.minZ, RS.pierZ[1] + 0.3)],
    npcs,
  }
}
