import { SphereGeometry, TorusGeometry } from 'three'
import { STREET } from '../config.js'
import { createRng, pick } from '../utils/random.js'
import { cafeSet, pottedPlant, shade, teaChest } from './props.js'

/**
 * 1930 年代的店面（摩登大稻埕）：西餐廳、喫茶店（咖啡館）、洋服店、藥局、茶行、布行。
 *
 * 店面由「住宅側門＋展示櫥窗＋內退的入口」組成：櫥窗是細金屬框（Art Deco 樓）或木框（舊洋樓），
 * 下方是洗石子或木板的窗臺，上方一道透光的氣窗；櫥窗沒有整片發光玻璃，
 * 而是看得到裡面依店種不同的陳設（桌椅、人台、藥櫃、茶罐、布匹…），
 * 店前騎樓再放一件與店種相符的小擺設。只在「摩登大稻埕」年代使用。
 */
export const SHOP_TYPES = {
  restaurant: { word: '洋食', awning: '#7a2e33' },
  cafe: { word: '喫茶', awning: '#2f6b5a' },
  tailor: { word: '洋服', awning: '#3f4f63' },
  pharmacy: { word: '藥局', awning: '#2f5d6b' },
  tea: { word: '茶行', awning: '#5d6b3a' },
  cloth: { word: '布行', awning: '#8a5a36' },
}

const METAL = '#2e2b27'
const BRASS = '#b8955a'
const TERRAZZO = '#d6d1c4'

/* ── 小型陳設 ─────────────────────────────── */

function bentwoodChair(b, position, rotationY, tint = '#4a3324') {
  b.group(position, rotationY, () => {
    b.cylinder('wood', 0.19, 0.19, 0.04, 12, [0, 0.46, 0], { tint })
    for (const [lx, lz] of [[0.13, 0.12], [-0.13, 0.12], [0.11, -0.12], [-0.11, -0.12]]) {
      b.box('wood', [0.025, 0.45, 0.025], [lx, 0.23, lz], { tint: shade(tint, 0.8) })
    }
    b.add('wood', new TorusGeometry(0.15, 0.016, 5, 14, Math.PI), { position: [0, 0.78, -0.15], rotation: [0, 0, 0], tint })
    b.box('wood', [0.025, 0.34, 0.025], [0.15, 0.62, -0.15], { tint })
    b.box('wood', [0.025, 0.34, 0.025], [-0.15, 0.62, -0.15], { tint })
  })
}

function clothTable(b, position, { square = true, cloth = '#f2eee4', size = 0.7 } = {}) {
  const [x, y, z] = position
  if (square) {
    b.box('plain', [size, 0.04, size], [x, y + 0.74, z], { tint: cloth })
    b.box('cloth', [size + 0.04, 0.22, size + 0.04], [x, y + 0.64, z], { tint: shade(cloth, 0.96) })
  } else {
    b.cylinder('plain', size / 2, size / 2, 0.04, 16, [x, y + 0.74, z], { tint: cloth })
  }
  b.cylinder('plain', 0.03, 0.03, 0.7, 6, [x, y + 0.37, z], { tint: METAL })
  b.cylinder('plain', 0.18, 0.2, 0.03, 10, [x, y + 0.015, z], { tint: METAL })
  // 桌上的小花瓶與杯盤
  b.cylinder('plain', 0.03, 0.04, 0.12, 8, [x, y + 0.82, z], { tint: '#d9e2e4' })
  b.add('plain', new SphereGeometry(0.045, 6, 4), { position: [x, y + 0.9, z], tint: '#c85a4a' })
  b.cylinder('plain', 0.07, 0.07, 0.015, 10, [x + size * 0.25, y + 0.77, z + size * 0.2], { tint: '#fbf8f2' })
}

function dressForm(b, position, suit = '#2f3542') {
  const [x, y, z] = position
  b.cylinder('plain', 0.16, 0.18, 0.03, 10, [x, y + 0.015, z], { tint: METAL })
  b.cylinder('plain', 0.02, 0.02, 0.9, 6, [x, y + 0.45, z], { tint: METAL })
  // 西裝上衣（肩寬、腰身）
  b.cylinder('cloth', 0.21, 0.17, 0.55, 12, [x, y + 1.18, z], { tint: suit, scale: [1.15, 1, 0.75] })
  b.cylinder('cloth', 0.13, 0.21, 0.12, 12, [x, y + 1.5, z], { tint: suit, scale: [1.2, 1, 0.8] })
  b.box('plain', [0.08, 0.3, 0.02], [x, y + 1.3, z + 0.13], { tint: '#f0ece2' }) // 襯衫
  b.box('plain', [0.03, 0.18, 0.02], [x, y + 1.32, z + 0.142], { tint: '#7a2e33' }) // 領帶
  b.cylinder('plain', 0.05, 0.06, 0.12, 8, [x, y + 1.62, z], { tint: '#e6dccb' })
}

function fabricBolt(b, position, { tint, upright = false, length = 1.1 }) {
  const [x, y, z] = position
  b.cylinder('cloth', 0.09, 0.09, length, 10, [x, y + (upright ? length / 2 : 0.09), z], {
    rotation: upright ? [0, 0, 0] : [0, 0, Math.PI / 2],
    tint,
  })
}

function teaTin(b, position, tint, scale = 1) {
  const [x, y, z] = position
  b.cylinder('plain', 0.09 * scale, 0.09 * scale, 0.2 * scale, 10, [x, y + 0.1 * scale, z], { tint })
  b.cylinder('plain', 0.095 * scale, 0.095 * scale, 0.03 * scale, 10, [x, y + 0.215 * scale, z], { tint: BRASS })
  b.box('plain', [0.09 * scale, 0.08 * scale, 0.01], [x, y + 0.1 * scale, z + 0.09 * scale], { tint: '#f1e6c8' })
}

function showGlobe(b, position, tint) {
  const [x, y, z] = position
  b.cylinder('plain', 0.12, 0.16, 0.08, 10, [x, y + 0.04, z], { tint: BRASS })
  b.cylinder('plain', 0.025, 0.025, 0.3, 6, [x, y + 0.23, z], { tint: BRASS })
  b.add('plain', new SphereGeometry(0.2, 14, 10), { position: [x, y + 0.55, z], scale: [1, 1.2, 1], tint })
  b.cylinder('plain', 0.05, 0.07, 0.12, 8, [x, y + 0.84, z], { tint })
}

function shelf(b, x, y, z, width, tint = '#6b4a34') {
  b.box('wood', [width, 0.04, 0.32], [x, y, z], { tint })
}

/* ── 店內（櫥窗後方）的陳設 ───────────────── */

function room(b, { x0, x1, walkH, top, depth, floor, wall }) {
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  b.box(floor === 'terrazzo' ? 'stone' : 'planks', [w, 0.04, depth], [cx, walkH + 0.02, -depth / 2 - 0.25], { tint: floor === 'terrazzo' ? '#cfcabd' : '#7a5a42' })
  b.box('dark', [w, 0.1, depth], [cx, top + 0.05, -depth / 2 - 0.25], { tint: '#2e2621' })
  b.box('plain', [w, top - walkH, 0.1], [cx, (top + walkH) / 2, -depth - 0.25], { tint: wall })
  for (const x of [x0, x1]) b.box('plain', [0.08, top - walkH, depth], [x, (top + walkH) / 2, -depth / 2 - 0.25], { tint: shade(wall, 0.85) })
}

function pendantLamps(b, xs, top, z) {
  for (const x of xs) {
    b.box('dark', [0.015, 0.4, 0.015], [x, top - 0.2, z], { tint: '#2c211b' })
    b.cylinder('plain', 0.16, 0.06, 0.12, 12, [x, top - 0.44, z], { tint: '#efe6d0' })
    b.add('bulb', new SphereGeometry(0.06, 8, 6), { position: [x, top - 0.5, z], tint: '#fff0cf' })
    b.addGlow(x, top - 0.55, z, 1.0, '#ffd9a0')
  }
}

const INTERIORS = {
  restaurant(b, { x0, x1, walkH, top, depth }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'terrazzo', wall: '#c9a27a' })
    const back = -depth - 0.2
    b.box('wood', [x1 - x0, 1.0, 0.04], [(x0 + x1) / 2, walkH + 0.5, back + 0.02], { tint: '#5a3a28' }) // 護牆板
    b.box('plain', [0.7, 0.5, 0.03], [(x0 + x1) / 2, walkH + 1.8, back + 0.03], { tint: '#8d7a5a' }) // 畫框
    b.box('plain', [0.6, 0.4, 0.02], [(x0 + x1) / 2, walkH + 1.8, back + 0.05], { tint: '#c9b48a' })
    const tables = (x1 - x0) > 2.6 ? [x0 + (x1 - x0) * 0.3, x0 + (x1 - x0) * 0.72] : [(x0 + x1) / 2]
    tables.forEach((tx, i) => {
      const tz = -1.5 - (i % 2) * 0.7
      clothTable(b, [tx, walkH, tz], { square: true })
      bentwoodChair(b, [tx - 0.55, walkH, tz], Math.PI / 2)
      bentwoodChair(b, [tx + 0.55, walkH, tz], -Math.PI / 2)
    })
    pendantLamps(b, tables, top, -1.6)
  },
  cafe(b, { x0, x1, walkH, top, depth }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'terrazzo', wall: '#a9b8a8' })
    const back = -depth - 0.2
    // 鏡面與吧檯、咖啡壺
    b.box('plain', [Math.min(1.6, x1 - x0 - 0.6), 0.9, 0.03], [(x0 + x1) / 2, walkH + 1.75, back + 0.03], { tint: '#9fb0b4' })
    b.box('wood', [Math.min(2.2, x1 - x0 - 0.3), 0.95, 0.5], [(x0 + x1) / 2, walkH + 0.48, back + 0.35], { tint: '#6a4630' })
    b.box('stone', [Math.min(2.3, x1 - x0 - 0.2), 0.05, 0.56], [(x0 + x1) / 2, walkH + 0.98, back + 0.35], { tint: '#eae6dc' })
    b.cylinder('plain', 0.12, 0.12, 0.42, 12, [x1 - 0.6, walkH + 1.22, back + 0.3], { tint: '#b9a27a' })
    b.cylinder('plain', 0.07, 0.12, 0.1, 12, [x1 - 0.6, walkH + 1.48, back + 0.3], { tint: '#b9a27a' })
    cafeSet(b, [(x0 + x1) / 2 - 0.2, walkH, -1.55], { seed: 7 })
    pottedPlant(b, [x0 + 0.35, walkH, -1.0], { seed: 9, size: 0.9, potTint: '#e6dccb' })
    pendantLamps(b, [(x0 + x1) / 2], top, -1.5)
  },
  tailor(b, { x0, x1, walkH, top, depth, rng }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'planks', wall: '#b9a88a' })
    const back = -depth - 0.2
    const colors = ['#3a4252', '#5a5248', '#6b6252', '#2f3a35', '#7a6a5a', '#4a3f45']
    for (let row = 0; row < 3; row++) {
      shelf(b, (x0 + x1) / 2, walkH + 0.6 + row * 0.55, back + 0.18, x1 - x0 - 0.4)
      for (let x = x0 + 0.35; x < x1 - 0.3; x += 0.24) {
        b.box('cloth', [0.2, 0.16 + rng() * 0.1, 0.28], [x, walkH + 0.7 + row * 0.55, back + 0.18], { tint: pick(rng, colors) })
      }
    }
    b.box('wood', [Math.min(1.6, x1 - x0 - 0.6), 0.85, 0.7], [(x0 + x1) / 2, walkH + 0.43, -1.7], { tint: '#7a5a3e' }) // 裁布台
    fabricBolt(b, [(x0 + x1) / 2, walkH + 0.86, -1.7], { tint: '#3f4652', length: 0.9 })
    b.box('plain', [0.5, 1.5, 0.04], [x0 + 0.3, walkH + 1.0, -1.2], { rotation: [0, Math.PI / 2.4, 0], tint: '#a6b4b8' }) // 穿衣鏡
    pendantLamps(b, [(x0 + x1) / 2], top, -1.6)
  },
  pharmacy(b, { x0, x1, walkH, top, depth, rng }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'terrazzo', wall: '#d2cbb6' })
    const back = -depth - 0.2
    // 整面百子櫃（藥櫃抽屜）
    const cabW = x1 - x0 - 0.3
    b.box('wood', [cabW, 2.1, 0.4], [(x0 + x1) / 2, walkH + 1.05, back + 0.2], { tint: '#7a4e32' })
    const cols = Math.max(4, Math.floor(cabW / 0.3))
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = x0 + 0.15 + (c + 0.5) * (cabW / cols)
        const dy = walkH + 0.25 + r * 0.32
        b.box('wood', [cabW / cols - 0.04, 0.27, 0.03], [dx, dy, back + 0.41], { tint: '#9a6a46' })
        b.add('plain', new SphereGeometry(0.015, 5, 3), { position: [dx, dy, back + 0.44], tint: BRASS })
      }
    }
    // 玻璃櫃檯與藥瓶
    b.box('wood', [Math.min(2, x1 - x0 - 0.4), 0.9, 0.5], [(x0 + x1) / 2, walkH + 0.45, -1.6], { tint: '#6a4630' })
    for (let i = 0; i < 6; i++) {
      const bx = (x0 + x1) / 2 - 0.6 + i * 0.24
      b.cylinder('plain', 0.05, 0.05, 0.18, 8, [bx, walkH + 1.0, -1.6], { tint: pick(rng, ['#7f9c8c', '#b48a52', '#8a5040', '#dfe6e6']) })
    }
    pendantLamps(b, [(x0 + x1) / 2], top, -1.4)
  },
  tea(b, { x0, x1, walkH, top, depth, rng }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'planks', wall: '#b08a5e' })
    const back = -depth - 0.2
    const tins = ['#8e3b2c', '#3f6b4f', '#b88a3e', '#5a3a2c']
    for (let row = 0; row < 3; row++) {
      shelf(b, (x0 + x1) / 2, walkH + 0.7 + row * 0.6, back + 0.18, x1 - x0 - 0.4)
      for (let x = x0 + 0.35; x < x1 - 0.3; x += 0.26) teaTin(b, [x, walkH + 0.72 + row * 0.6, back + 0.18], pick(rng, tins))
    }
    teaChest(b, [x1 - 0.6, walkH, -1.4], { rotationY: 0.2 })
    teaChest(b, [x1 - 0.6, walkH + 0.56, -1.4], { rotationY: -0.1, size: 0.5 })
    b.box('wood', [Math.min(1.5, x1 - x0 - 1.2), 0.85, 0.55], [x0 + 0.9, walkH + 0.43, -1.7], { tint: '#6a4630' })
    // 秤
    b.box('plain', [0.04, 0.4, 0.04], [x0 + 0.9, walkH + 1.05, -1.7], { tint: BRASS })
    b.cylinder('plain', 0.12, 0.1, 0.02, 10, [x0 + 0.75, walkH + 1.15, -1.7], { tint: BRASS })
    pendantLamps(b, [(x0 + x1) / 2], top, -1.5)
  },
  cloth(b, { x0, x1, walkH, top, depth, rng }) {
    room(b, { x0, x1, walkH, top, depth, floor: 'planks', wall: '#c9b28e' })
    const back = -depth - 0.2
    const colors = ['#c9564a', '#3f5f8a', '#e0c36a', '#6f8a5c', '#d7b8a8', '#2f3f5c', '#efe6d4', '#9a4a5e']
    for (let row = 0; row < 4; row++) {
      shelf(b, (x0 + x1) / 2, walkH + 0.45 + row * 0.5, back + 0.2, x1 - x0 - 0.3)
      for (let y = 0; y < 2; y++) {
        fabricBolt(b, [(x0 + x1) / 2, walkH + 0.47 + row * 0.5 + y * 0.19, back + 0.2], { tint: pick(rng, colors), length: x1 - x0 - 0.5 })
      }
    }
    b.box('wood', [Math.min(1.8, x1 - x0 - 0.6), 0.8, 0.8], [(x0 + x1) / 2, walkH + 0.4, -1.6], { tint: '#7a5a3e' }) // 量布台
    for (let i = 0; i < 3; i++) {
      b.box('cloth', [0.5, 0.06, 0.4], [(x0 + x1) / 2 - 0.4 + i * 0.4, walkH + 0.83 + i * 0.03, -1.6], { tint: pick(rng, colors) })
    }
    pendantLamps(b, [(x0 + x1) / 2], top, -1.5)
  },
}

/* ── 櫥窗內的陳列 ─────────────────────────── */

const WINDOWS = {
  restaurant(b, { x0, x1, y, rng }) {
    const cx = (x0 + x1) / 2
    // 窗前的菜單牌與一桌示範擺設
    b.box('wood', [0.5, 0.65, 0.03], [x0 + 0.4, y + 0.4, -0.45], { rotation: [-0.1, 0.25, 0], tint: '#3a2a20' })
    b.box('plain', [0.42, 0.55, 0.02], [x0 + 0.4, y + 0.42, -0.43], { rotation: [-0.1, 0.25, 0], tint: '#f2ebda' })
    for (let i = 0; i < 4; i++) b.box('plain', [0.28, 0.02, 0.01], [x0 + 0.42, y + 0.6 - i * 0.1, -0.415], { rotation: [-0.1, 0.25, 0], tint: '#6a5a4a' })
    b.cylinder('plain', 0.22, 0.24, 0.03, 16, [cx + 0.2, y + 0.02, -0.6], { tint: '#f6f2e8' })
    b.add('plain', new SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), { position: [cx + 0.2, y + 0.03, -0.6], tint: '#c98a4a' }) // 蛋包飯的樣品
    b.cylinder('plain', 0.03, 0.05, 0.25, 8, [cx - 0.25, y + 0.12, -0.55], { tint: '#6a2a2a' }) // 葡萄酒瓶
    if (rng() < 0.5) pottedPlant(b, [x1 - 0.3, y - 0.55, -0.5], { seed: 3, size: 0.8, potTint: '#e6dccb' })
  },
  cafe(b, { x0, x1, y }) {
    const cx = (x0 + x1) / 2
    // 三層蛋糕架與咖啡杯
    for (let i = 0; i < 3; i++) {
      b.cylinder('plain', 0.22 - i * 0.05, 0.22 - i * 0.05, 0.015, 14, [cx, y + 0.05 + i * 0.2, -0.55], { tint: '#f6f2e8' })
      for (let k = 0; k < 4 - i; k++) {
        const a = (k / (4 - i)) * Math.PI * 2
        b.add('plain', new SphereGeometry(0.04, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), {
          position: [cx + Math.cos(a) * (0.13 - i * 0.03), y + 0.065 + i * 0.2, -0.55 + Math.sin(a) * (0.13 - i * 0.03)],
          tint: k % 2 ? '#e8c9a0' : '#a5603c',
        })
      }
    }
    b.cylinder('plain', 0.012, 0.012, 0.45, 6, [cx, y + 0.24, -0.55], { tint: BRASS })
    for (const dx of [-0.55, 0.55]) {
      if (cx + dx < x0 + 0.15 || cx + dx > x1 - 0.15) continue
      b.cylinder('plain', 0.08, 0.08, 0.012, 12, [cx + dx, y + 0.01, -0.45], { tint: '#f6f2e8' })
      b.cylinder('plain', 0.045, 0.035, 0.07, 10, [cx + dx, y + 0.05, -0.45], { tint: '#f6f2e8' })
    }
  },
  tailor(b, { x0, x1, y }) {
    const span = x1 - x0
    const suits = ['#2f3542', '#5a5248', '#3a4a42']
    const count = span > 1.6 ? 2 : 1
    for (let i = 0; i < count; i++) dressForm(b, [x0 + span * (i + 0.5) / count, y - 0.55, -0.6], suits[i])
    // 帽架上的紳士帽
    b.cylinder('plain', 0.015, 0.015, 0.5, 6, [x1 - 0.2, y + 0.25, -0.4], { tint: METAL })
    b.cylinder('cloth', 0.13, 0.13, 0.015, 14, [x1 - 0.2, y + 0.52, -0.4], { tint: '#4a3f36' })
    b.cylinder('cloth', 0.08, 0.085, 0.1, 14, [x1 - 0.2, y + 0.58, -0.4], { tint: '#4a3f36' })
  },
  pharmacy(b, { x0, x1, y }) {
    const cx = (x0 + x1) / 2
    showGlobe(b, [cx - Math.min(0.45, (x1 - x0) / 4), y, -0.55], '#a83a32')
    showGlobe(b, [cx + Math.min(0.45, (x1 - x0) / 4), y, -0.55], '#3f7a5a')
    for (let i = 0; i < 3; i++) b.box('plain', [0.22, 0.14, 0.12], [cx, y + 0.07 + i * 0.14, -0.35], { tint: ['#f1e6c8', '#d8e2e0', '#efd9c0'][i] })
  },
  tea(b, { x0, x1, y }) {
    const cx = (x0 + x1) / 2
    const tins = ['#8e3b2c', '#3f6b4f', '#b88a3e']
    // 金字塔形的茶罐堆
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 3 - row; k++) teaTin(b, [cx - 0.3 + row * 0.11 + k * 0.22, y + row * 0.23, -0.55], tins[(k + row) % 3], 1.05)
    }
    // 茶盤與茶壺
    b.box('wood', [0.4, 0.03, 0.26], [cx + Math.min(0.6, (x1 - x0) / 2 - 0.3), y + 0.015, -0.4], { tint: '#5a3a28' })
    b.add('plain', new SphereGeometry(0.07, 10, 8), { position: [cx + Math.min(0.6, (x1 - x0) / 2 - 0.3), y + 0.09, -0.4], scale: [1, 0.85, 1], tint: '#7a4a3a' })
  },
  cloth(b, { x0, x1, y, rng }) {
    const colors = ['#c9564a', '#3f5f8a', '#e0c36a', '#6f8a5c', '#d7b8a8', '#9a4a5e']
    // 扇形立起的布捲
    const n = Math.max(3, Math.floor((x1 - x0) / 0.24))
    for (let i = 0; i < n; i++) {
      const x = x0 + 0.2 + i * ((x1 - x0 - 0.4) / Math.max(1, n - 1))
      b.cylinder('cloth', 0.08, 0.08, 1.15, 10, [x, y + 0.55, -0.5 - (i % 2) * 0.12], { rotation: [0.12 * (i % 2 ? 1 : -1), 0, (i - n / 2) * 0.05], tint: pick(rng, colors) })
    }
  },
}

/* ── 騎樓下的小擺設 ───────────────────────── */

function outsideDisplay(b, type, { x, walkH, z, rng, signText }) {
  if (type === 'restaurant' || type === 'cafe') {
    // 立式菜單黑板
    b.group([x, walkH, z], 0.25, () => {
      for (const side of [-1, 1]) b.box('wood', [0.5, 0.85, 0.03], [0, 0.42, side * 0.12], { rotation: [side * 0.15, 0, 0], tint: '#6a4a32' })
      b.box('dark', [0.42, 0.62, 0.01], [0, 0.46, 0.14], { rotation: [0.15, 0, 0], tint: '#2d3330' })
      for (let i = 0; i < 3; i++) b.box('plain', [0.26 - i * 0.04, 0.02, 0.012], [0, 0.62 - i * 0.12, 0.155], { rotation: [0.15, 0, 0], tint: '#f2eee4' })
    })
  } else if (type === 'tea') {
    teaChest(b, [x, walkH, z], { rotationY: rng() * 0.3 })
  } else if (type === 'cloth') {
    // 低矮的木架與布捲
    b.box('wood', [0.9, 0.05, 0.4], [x, walkH + 0.45, z], { tint: '#7a5a3e' })
    for (const dx of [-0.38, 0.38]) b.box('wood', [0.05, 0.45, 0.35], [x + dx, walkH + 0.22, z], { tint: '#5a3e2a' })
    for (let i = 0; i < 3; i++) fabricBolt(b, [x - 0.25 + i * 0.25, walkH + 0.48, z], { tint: pick(rng, ['#c9564a', '#3f5f8a', '#e0c36a', '#6f8a5c']), length: 0.36 })
  } else if (type === 'pharmacy' && signText) {
    // 小小的立牌
    b.box('wood', [0.05, 0.9, 0.05], [x, walkH + 0.45, z], { tint: '#4a3628' })
    b.box('plain', [0.42, 0.62, 0.05], [x, walkH + 1.0, z], { tint: '#f4efe2' })
    b.addSign({ text: signText, style: 'vertical', vertical: true, width: 0.3, height: 0.5, position: [x, walkH + 1.0, z + 0.03] })
  }
}

/* ── 組合：住宅側門＋櫥窗＋內退入口 ───────── */

/**
 * @param cfg  建築設定（shopType、facade、seed…）
 * @param opts { innerW, openingH, style（deco｜baroque）, darkWood, condition }
 */
export function displayShopfront(b, cfg, { innerW, openingH, style, darkWood }) {
  const rng = createRng((cfg.seed ?? 1) + 77)
  const type = SHOP_TYPES[cfg.shopType] ? cfg.shopType : 'tea'
  const walkH = STREET.walkwayHeight
  const walkD = STREET.walkwayDepth
  const deco = style === 'deco'
  const frameMat = deco ? 'plain' : 'wood'
  const frameTint = deco ? METAL : darkWood
  const top = openingH - 0.02 // 開口上緣（上方是騎樓內的牆）
  const sill = walkH + 0.55
  const transomH = 0.4
  const paneTop = top - transomH - 0.04
  const left = -innerW / 2
  const right = innerW / 2

  // 住宅側門（通往樓上住家的木門，關著）
  let shopLeft = left
  if (innerW >= 3.2) {
    const doorW = 0.82
    shopLeft = left + doorW + 0.12
    const dx = left + doorW / 2
    b.box('planks', [doorW - 0.08, top - walkH - 0.5, 0.06], [dx, walkH + (top - walkH - 0.5) / 2, -0.12], { tint: shade(darkWood, 0.95) })
    for (const py of [0.75, 1.75]) b.box('wood', [doorW * 0.55, 0.7, 0.02], [dx, walkH + py, -0.08], { tint: shade(darkWood, 1.15) })
    b.box('glassWarm', [doorW - 0.2, 0.32, 0.03], [dx, top - 0.27, -0.12])
    b.box(frameMat, [doorW, 0.06, 0.1], [dx, top - 0.47, -0.08], { tint: frameTint })
    b.add('plain', new SphereGeometry(0.03, 6, 4), { position: [dx + doorW * 0.3, walkH + 1.15, -0.06], tint: BRASS })
    b.box('plain', [0.16, 0.1, 0.02], [dx, walkH + 1.95, -0.07], { tint: '#efe6d0' }) // 門牌
    b.box(deco ? 'stone' : 'stucco', [0.12, top - walkH, 0.22], [left + doorW + 0.06, (top + walkH) / 2, -0.08], { tint: deco ? TERRAZZO : '#e8dfcc' })
  }

  // 入口位置：寬的店面入口在中間、兩側各一扇櫥窗；窄的店面入口在右側
  const span = right - shopLeft
  const entryW = 1.1
  const twoWindows = span >= 3.6
  const entryX0 = twoWindows ? shopLeft + (span - entryW) / 2 : right - entryW
  const entryX1 = entryX0 + entryW
  const windows = twoWindows ? [[shopLeft, entryX0], [entryX1, right]] : [[shopLeft, entryX0]]
  const recess = 0.85

  // 店內
  const depth = 2.7
  const interior = INTERIORS[type]
  interior(b, { x0: shopLeft, x1: right, walkH, top, depth, rng })

  for (const [x0, x1] of windows) {
    const w = x1 - x0
    const cx = (x0 + x1) / 2
    // 窗臺（洗石子或木板）
    if (deco) {
      b.box('stone', [w, sill - walkH, 0.26], [cx, (sill + walkH) / 2, -0.13], { tint: TERRAZZO })
      b.box('plain', [w, 0.06, 0.28], [cx, walkH + 0.03, -0.12], { tint: '#2b2a27' })
    } else {
      b.box('planks', [w, sill - walkH, 0.12], [cx, (sill + walkH) / 2, -0.1], { tint: darkWood })
    }
    b.box(frameMat, [w, 0.05, 0.4], [cx, sill + 0.02, -0.3], { tint: shade(frameTint, 1.3) }) // 陳列台面
    // 細框：外框、直櫺、氣窗橫料
    b.box(frameMat, [w, 0.05, 0.08], [cx, paneTop, -0.12], { tint: frameTint })
    b.box(frameMat, [w, 0.04, 0.08], [cx, top, -0.12], { tint: frameTint })
    for (const x of [x0 + 0.03, x1 - 0.03]) b.box(frameMat, [0.05, top - sill, 0.08], [x, (top + sill) / 2, -0.12], { tint: frameTint })
    const mullions = Math.max(1, Math.round(w / 1.2))
    for (let i = 1; i < mullions; i++) b.box(frameMat, [0.035, top - sill, 0.07], [x0 + (i * w) / mullions, (top + sill) / 2, -0.12], { tint: frameTint })
    // 氣窗（透光的小格）
    b.box('glassWarm', [w - 0.08, transomH - 0.04, 0.03], [cx, paneTop + transomH / 2, -0.14])
    for (let i = 1; i < Math.round(w / 0.35); i++) b.box(frameMat, [0.025, transomH, 0.05], [x0 + i * (w / Math.round(w / 0.35)), paneTop + transomH / 2, -0.11], { tint: frameTint })
    // 玻璃的反光（兩道斜線）
    for (const [fx, len] of [[0.28, 0.9], [0.4, 0.5]]) {
      b.box('plain', [0.025, len, 0.01], [x0 + w * fx, sill + (paneTop - sill) * 0.6, -0.09], { rotation: [0, 0, -0.6], tint: '#e8eef0' })
    }
    WINDOWS[type](b, { x0: x0 + 0.08, x1: x1 - 0.08, y: sill + 0.04, rng })
    // 西餐廳與喫茶店：窗下半部的蕾絲短簾（黃銅橫桿）
    if (type === 'restaurant' || type === 'cafe') {
      const rodY = sill + (paneTop - sill) * 0.42
      b.cylinder('plain', 0.012, 0.012, w - 0.1, 6, [cx, rodY, -0.2], { rotation: [0, 0, Math.PI / 2], tint: BRASS })
      const folds = Math.max(4, Math.round(w / 0.16))
      for (let i = 0; i < folds; i++) {
        const fx = x0 + 0.06 + (i + 0.5) * ((w - 0.12) / folds)
        b.box('cloth', [(w - 0.12) / folds + 0.01, rodY - sill - 0.38, 0.015], [fx, (rodY + sill + 0.38) / 2, -0.21 + (i % 2) * 0.02], { tint: i % 2 ? '#efe6d4' : '#e6dcc6' })
      }
    }
  }

  // 內退的入口：兩側斜進的玻璃側窗、洗石子地坪、木框玻璃門
  b.box('stone', [entryW, 0.03, recess], [(entryX0 + entryX1) / 2, walkH + 0.015, -recess / 2], { tint: deco ? '#cfc4b0' : '#c7bead' })
  for (const x of [entryX0, entryX1]) {
    b.box(frameMat, [0.05, top - walkH, 0.06], [x, (top + walkH) / 2, -0.12], { tint: frameTint })
    b.box(frameMat, [0.04, top - sill, recess], [x + (x === entryX0 ? 0.02 : -0.02), (top + sill) / 2, -recess / 2], { tint: frameTint, scale: [1, 1, 1] })
    b.box(deco ? 'stone' : 'planks', [0.06, sill - walkH, recess], [x, (sill + walkH) / 2, -recess / 2], { tint: deco ? TERRAZZO : darkWood })
  }
  const doorW = entryW - 0.2
  const doorH = top - walkH - transomH - 0.1
  const doorZ = -recess
  for (const side of [-1, 1]) {
    const dx = (entryX0 + entryX1) / 2 + side * doorW / 4
    b.box('wood', [doorW / 2 - 0.02, doorH, 0.05], [dx, walkH + doorH / 2, doorZ], { tint: deco ? '#4a3a2c' : darkWood })
    b.box('glassWarm', [doorW / 2 - 0.16, doorH * 0.55, 0.03], [dx, walkH + doorH * 0.62, doorZ + 0.02])
    b.box('plain', [0.025, 0.25, 0.03], [dx - side * (doorW / 4 - 0.08), walkH + doorH * 0.5, doorZ + 0.05], { tint: BRASS })
  }
  b.box('glassWarm', [entryW - 0.1, transomH - 0.06, 0.03], [(entryX0 + entryX1) / 2, top - transomH / 2, doorZ + 0.01])
  b.box(frameMat, [entryW, 0.05, 0.08], [(entryX0 + entryX1) / 2, top - transomH - 0.02, doorZ + 0.02], { tint: frameTint })
  b.addPool((entryX0 + entryX1) / 2, 0.4, 1.2, '#ffcf96', walkH + 0.01)

  // 騎樓下的擺設（靠近櫥窗的一側，不擋入口）
  const outsideX = twoWindows ? (windows[0][0] + windows[0][1]) / 2 : (shopLeft + entryX0) / 2
  outsideDisplay(b, type, { x: outsideX, walkH, z: walkD * 0.45, rng, signText: SHOP_TYPES[type].word.slice(0, 1) })
  return { type, entry: [entryX0, entryX1] }
}
