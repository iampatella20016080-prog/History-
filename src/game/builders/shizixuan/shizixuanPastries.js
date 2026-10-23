import { ConeGeometry, IcosahedronGeometry, PlaneGeometry, TetrahedronGeometry } from 'three'
import { szxUV } from '../../rendering/szxAtlas.js'
import { createRng } from '../../utils/random.js'
import { shade } from '../props.js'

/**
 * 十字軒（2000–現在）的商品：14 種外觀，形狀共用、依材質合併（專案的效能做法：繪製呼叫依材質計算，
 * 不是依商品數量，所以不另外用 InstancedMesh）。主體（厚度、邊緣、包裝）在主網格；
 * 表面印記、貼紙、凸點放在 detail（精緻模式才顯示）。座標是商品底部的中心。
 */

/** 圖集上的一塊平面（name 見 rendering/szxAtlas.js）；sub = [i, n] 取橫向 n 等分裡的第 i 塊 */
export function szxPanel(b, name, w, h, position, { rotation = [0, 0, 0], sub = null, tint = '#ffffff' } = {}) {
  const geometry = new PlaneGeometry(w, h)
  let [u0, v0, u1, v1] = szxUV(name)
  if (sub) {
    const [i, n] = sub
    const du = (u1 - u0) / n
    u0 += du * i
    u1 = u0 + du
  }
  const uv = geometry.attributes.uv
  for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) * (u1 - u0), v0 + uv.getY(k) * (v1 - v0))
  return b.add('szxExhibit', geometry, { position, rotation, tint })
}

const top = (b, w, d, [x, y, z], name, sub, rotY = 0) => szxPanel(b, name, w, d, [x, y + 0.002, z], { rotation: [-Math.PI / 2, 0, rotY], sub })

export const PASTRY_KINDS = ['roundCake', 'mungBean', 'pineapple', 'riceCracker', 'redTurtle', 'peach', 'ingot', 'longCake', 'bag', 'giftBox', 'tin', 'tray', 'smallPile', 'weddingBox']

/** 每一種商品的佔地（寬、深、高），排列商品時用 */
export const PASTRY_SIZE = {
  roundCake: [0.1, 0.1, 0.035],
  mungBean: [0.05, 0.05, 0.03],
  pineapple: [0.07, 0.045, 0.03],
  riceCracker: [0.13, 0.13, 0.035],
  redTurtle: [0.11, 0.08, 0.045],
  peach: [0.1, 0.1, 0.1],
  ingot: [0.11, 0.06, 0.06],
  longCake: [0.2, 0.05, 0.04],
  bag: [0.18, 0.12, 0.08],
  giftBox: [0.3, 0.22, 0.09],
  tin: [0.11, 0.11, 0.16],
  tray: [0.3, 0.2, 0.08],
  smallPile: [0.16, 0.16, 0.06],
  weddingBox: [0.26, 0.26, 0.06],
}

function roundCake(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#d9a35a' : '#e0b06a'
  b.cylinder('plain', 0.045, 0.048, 0.024, 9, [x, y + 0.012, z], { tint })
  b.cylinder('plain', 0.038, 0.045, 0.008, 9, [x, y + 0.028, z], { tint: shade(tint, 1.12) })
  d.cylinder('plain', 0.012, 0.012, 0.002, 6, [x, y + 0.033, z], { tint: '#b3291d' })
}

function mungBean(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#e4d79a' : '#d9cf86'
  b.box('plain', [0.045, 0.026, 0.045], [x, y + 0.013, z], { tint })
  d.box('plain', [0.03, 0.003, 0.03], [x, y + 0.0275, z], { tint: shade(tint, 0.86) })
}

function pineapple(b, d, [x, y, z], rng) {
  const foil = rng() < 0.4
  b.box('plain', [0.065, 0.026, 0.04], [x, y + 0.013, z], { tint: foil ? '#d8b04e' : '#d79a42' })
  if (foil) d.box('plain', [0.067, 0.004, 0.012], [x, y + 0.028, z], { tint: '#b3291d' })
  else d.box('plain', [0.05, 0.004, 0.026], [x, y + 0.028, z], { tint: '#c58434' })
}

function riceCracker(b, d, [x, y, z], rng) {
  b.cylinder('plain', 0.06, 0.06, 0.03, 10, [x, y + 0.015, z], { tint: '#efe2bd' })
  for (let i = 0; i < 5; i++) {
    const a = rng() * Math.PI * 2
    const r = rng() * 0.05
    d.add('plain', new TetrahedronGeometry(0.008, 0), { position: [x + Math.cos(a) * r, y + 0.032, z + Math.sin(a) * r], tint: rng() < 0.5 ? '#d9b26a' : '#7a5a3a' })
  }
}

function redTurtle(b, d, [x, y, z], rng) {
  b.add('plain', new IcosahedronGeometry(1, 0), { position: [x, y + 0.02, z], scale: [0.055, 0.022, 0.04], tint: rng() < 0.5 ? '#c4372e' : '#cf4a3c' })
  d.box('plain', [0.04, 0.003, 0.002], [x, y + 0.042, z], { tint: '#9a2a22' })
  d.box('plain', [0.002, 0.003, 0.03], [x, y + 0.042, z], { tint: '#9a2a22' })
}

function peach(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#f0a8a8' : '#ea9a9c'
  b.add('plain', new IcosahedronGeometry(1, 1), { position: [x, y + 0.04, z], scale: [0.045, 0.04, 0.045], tint })
  b.add('plain', new ConeGeometry(0.022, 0.03, 6), { position: [x, y + 0.085, z], tint: shade(tint, 0.95) })
  d.add('plain', new TetrahedronGeometry(1, 0), { position: [x + 0.025, y + 0.06, z], scale: [0.025, 0.006, 0.014], rotation: [0, 0, 0.4], tint: '#6e9a4a' })
}

/** 托盤裡的小壽桃（較簡化的形狀） */
function peachSmall(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#f0a8a8' : '#ea9a9c'
  b.add('plain', new IcosahedronGeometry(1, 0), { position: [x, y + 0.035, z], scale: [0.04, 0.035, 0.04], tint })
  b.add('plain', new ConeGeometry(0.018, 0.025, 4), { position: [x, y + 0.075, z], tint: shade(tint, 0.95) })
}

function ingot(b, d, [x, y, z]) {
  b.box('plain', [0.08, 0.025, 0.05], [x, y + 0.0125, z], { tint: '#e2b54a' })
  for (const s of [-1, 1]) b.add('plain', new IcosahedronGeometry(1, 0), { position: [x + s * 0.04, y + 0.03, z], scale: [0.02, 0.022, 0.026], tint: '#e9c25a' })
  b.add('plain', new IcosahedronGeometry(1, 0), { position: [x, y + 0.035, z], scale: [0.022, 0.024, 0.02], tint: '#f0cc6a' })
  d.box('plain', [0.03, 0.004, 0.002], [x, y + 0.02, z + 0.028], { tint: '#b3291d' })
}

/** 托盤裡的小元寶 */
function ingotSmall(b, d, [x, y, z]) {
  b.box('plain', [0.07, 0.022, 0.045], [x, y + 0.011, z], { tint: '#e2b54a' })
  b.add('plain', new IcosahedronGeometry(1, 0), { position: [x, y + 0.03, z], scale: [0.03, 0.022, 0.02], tint: '#f0cc6a' })
}

function longCake(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#c9894a' : '#ddb27a'
  b.box('plain', [0.19, 0.035, 0.045], [x, y + 0.0175, z], { tint })
  for (let i = -1; i <= 1; i++) d.box('plain', [0.004, 0.004, 0.036], [x + i * 0.05, y + 0.037, z], { tint: shade(tint, 0.8) })
}

function bag(b, d, [x, y, z], rng) {
  const inner = rng() < 0.5 ? '#e0b06a' : '#efe2bd'
  for (let i = 0; i < 3; i++) b.cylinder('plain', 0.04, 0.042, 0.03, 6, [x - 0.05 + i * 0.05, y + 0.02, z], { tint: inner })
  b.box('glassClear', [0.18, 0.07, 0.11], [x, y + 0.035, z], { tint: '#ffffff' })
  // 袋口的紅色緞帶與正面的品名貼紙
  b.box('plain', [0.03, 0.03, 0.03], [x + 0.095, y + 0.05, z], { tint: '#c3242b' })
  top(d, 0.07, 0.035, [x, y + 0.07, z], 'stickers', [rng() < 0.5 ? 2 : 5, 6])
}

function giftBox(b, d, [x, y, z], rng) {
  const tint = rng() < 0.7 ? '#b81f26' : '#9e1a20'
  b.box('plain', [0.29, 0.07, 0.21], [x, y + 0.035, z], { tint })
  b.box('plain', [0.3, 0.025, 0.22], [x, y + 0.0825, z], { tint: shade(tint, 1.08) })
  top(b, 0.26, 0.18, [x, y + 0.095, z], 'giftPattern')
  d.box('plain', [0.24, 0.012, 0.004], [x, y + 0.035, z + 0.107], { tint: '#d9a63e' })
}

function tin(b, d, [x, y, z], rng) {
  const tint = ['#c3242b', '#2f5a7a', '#d9a63e', '#3f6a4a'][Math.floor(rng() * 4)]
  b.cylinder('plain', 0.05, 0.05, 0.14, 10, [x, y + 0.07, z], { tint })
  b.cylinder('steel', 0.052, 0.052, 0.018, 10, [x, y + 0.149, z], { tint: '#c9c4b8' })
  b.cylinder('plain', 0.0505, 0.0505, 0.05, 10, [x, y + 0.07, z], { tint: '#f6ecd4' })
  d.cylinder('plain', 0.0508, 0.0508, 0.012, 10, [x, y + 0.07, z], { tint })
}

function tray(b, d, [x, y, z], rng) {
  const yellow = rng() < 0.6
  const tint = yellow ? '#f2c230' : '#d8262c'
  b.box('plain', [0.3, 0.012, 0.2], [x, y + 0.006, z], { tint })
  // 四邊的框立在底板上（不和底板的側面重疊）
  for (const s of [-1, 1]) {
    b.box('plain', [0.3, 0.03, 0.012], [x, y + 0.027, z + s * 0.094], { tint: shade(tint, 0.92) })
    b.box('plain', [0.012, 0.03, 0.176], [x + s * 0.144, y + 0.027, z], { tint: shade(tint, 0.92) })
  }
  const fill = yellow ? ingotSmall : peachSmall
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) fill(b, d, [x - 0.09 + i * 0.09, y + 0.012, z - 0.045 + j * 0.09], rng)
  // 透明蓋
  b.box('glassClear', [0.29, 0.07, 0.19], [x, y + 0.06, z], { tint: '#ffffff' })
}

function smallPile(b, d, [x, y, z], rng) {
  b.cylinder('plain', 0.08, 0.075, 0.012, 10, [x, y + 0.006, z], { tint: '#f4f0e6' })
  for (let i = 0; i < 8; i++) {
    const a = rng() * Math.PI * 2
    const r = rng() * 0.06
    b.add('plain', new TetrahedronGeometry(0.018, 0), { position: [x + Math.cos(a) * r, y + 0.022 + (i > 5 ? 0.012 : 0), z + Math.sin(a) * r], rotation: [rng(), rng(), 0], tint: ['#e0b06a', '#c98a4a', '#f0d8a0'][i % 3] })
  }
}

function weddingBox(b, d, [x, y, z], rng) {
  const tint = rng() < 0.5 ? '#c3242b' : '#b52a2f'
  b.cylinder('plain', 0.13, 0.13, 0.05, 12, [x, y + 0.025, z], { tint })
  b.cylinder('plain', 0.1, 0.1, 0.004, 12, [x, y + 0.052, z], { tint: '#d9a63e' })
  top(d, 0.08, 0.08, [x, y + 0.053, z], 'stickers', [0, 6])
}

const BUILDERS = { roundCake, mungBean, pineapple, riceCracker, redTurtle, peach, ingot, longCake, bag, giftBox, tin, tray, smallPile, weddingBox }

/** 放一件商品（kind 見 PASTRY_KINDS） */
export function pastry(b, detail, kind, position, seed = 1) {
  BUILDERS[kind](b, detail, position, createRng(seed))
}

/**
 * 在一段層板上排滿商品：沿 x 從 x0 到 x1，深度方向排 rows 列（z 是層板中心）。
 * kinds 會輪流使用；回傳放了幾件。
 */
export function fillShelf(b, detail, { x0, x1, y, z, depth = 0.3, kinds, seed = 1, gap = 0.02, maxHeight = 1 }) {
  const rng = createRng(seed)
  let count = 0
  let x = x0
  let k = Math.floor(rng() * kinds.length)
  let skipped = 0
  while (x < x1) {
    const kind = kinds[k % kinds.length]
    const [w, dd, h] = PASTRY_SIZE[kind]
    if (h > maxHeight) {
      k++
      if (++skipped > kinds.length) break
      continue
    }
    skipped = 0
    if (x + w > x1) break
    const rows = Math.min(2, Math.max(1, Math.floor((depth + gap) / (dd + gap))))
    let column = 0
    for (let r = rows - 1; r >= 0; r--) {
      // 後排每隔一件才放（被前排擋住的部分不必全滿）
      if (r < rows - 1 && (count + column) % 2) continue
      const zz = z - depth / 2 + dd / 2 + r * (dd + gap) + (depth - rows * (dd + gap) + gap) / 2
      // 最前面一列在主網格；後面幾列只在精緻模式顯示（流暢模式少畫被擋住的商品）
      const target = r === rows - 1 ? b : detail
      pastry(target, detail, kind, [x + w / 2, y, zz], seed * 131 + count)
      count++
      column++
    }
    x += w + gap
    if (rng() < 0.45) k++
  }
  return count
}
