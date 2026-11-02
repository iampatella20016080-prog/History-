import { IcosahedronGeometry } from 'three'
import { shade, stool } from '../props.js'

/**
 * 昭和浪漫洗濯屋一樓的器物（器物清單在 data/showaLaundryLayout.js 的 SHOWA_VARIANT.items）：
 * 每一種器物有 build(b, item, detail)、footprint(item)、height(item)，同一份清單產生模型、碰撞與鏡頭遮擋
 * （做法同林華泰茶行，見 builders/shopInterior.js）。
 * 吧台、展示櫃、樓梯、碗櫥與靠窗座位依使用者提供的照片與媒體描述；後場的木桶與洗衣板是情境示意。
 */

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })

const WOOD = '#7a5236'
const WOOD_DARK = '#4e3424'
const CONCRETE = '#7d8486'
const GLASS = '#e7eef0'

/** 霜淇淋機（吧台上的白色機身、兩個出料口與把手） */
function softServeMachine(b, x, y, z) {
  b.box('plain', [0.42, 0.62, 0.5], [x, y + 0.31, z], { tint: '#ecebe6' })
  b.box('steel', [0.38, 0.06, 0.04], [x, y + 0.5, z + 0.26], { tint: '#b9bec0' })
  for (const dx of [-0.1, 0.1]) {
    b.cylinder('steel', 0.025, 0.02, 0.07, 8, [dx + x, y + 0.36, z + 0.27], { tint: '#c8ccce' })
    b.box('dark', [0.02, 0.1, 0.02], [dx + x, y + 0.52, z + 0.3], { tint: '#2a2622', rotation: [0.4, 0, 0] })
  }
  b.box('steel', [0.42, 0.03, 0.18], [x, y + 0.2, z + 0.32], { tint: '#9aa0a2' })
}

/** 桌燈（黑色燈座與米白燈罩） */
function deskLamp(b, x, y, z) {
  b.cylinder('dark', 0.07, 0.08, 0.04, 10, [x, y + 0.02, z], { tint: '#2a2622' })
  b.cylinder('dark', 0.012, 0.012, 0.32, 6, [x, y + 0.2, z], { tint: '#2a2622' })
  b.cylinder('paper', 0.07, 0.12, 0.16, 12, [x, y + 0.4, z], { tint: '#f1e6cc', openEnded: true })
  b.cylinder('bulb', 0.035, 0.035, 0.05, 8, [x, y + 0.36, z], { tint: '#ffe6b0' })
}

/**
 * 吧台（照片）：正面是灰色水泥質感、台面木作；台上有「受付」牌、紅色轉盤電話、桌燈與霜淇淋機。
 * 店員在吧台與隔間牆之間（那一條在碰撞上補滿，客人走不進去）。「受付」牌是招牌貼圖，畫在街景裡（showaLaundry.js）。
 */
function buildBar(b, item, detail) {
  const { x0, x1, z, depth, height } = item
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  const front = z + depth / 2
  b.box('stone', [w, height - 0.06, depth - 0.1], [cx, (height - 0.06) / 2, z + 0.03], { tint: CONCRETE, grime: 0.12 })
  b.box('wood', [w + 0.04, 0.06, depth + 0.04], [cx, height - 0.03, z], { tint: WOOD })
  b.box('dark', [w, 0.08, 0.04], [cx, 0.04, front - 0.05], { tint: '#3a3632' })
  softServeMachine(b, x0 + 0.55, height, z - 0.05)
  b.box('plain', [0.32, 0.04, 0.03], [cx - 0.15, height + 0.02, front - 0.03], { tint: '#f2efe6' })
  deskLamp(b, x1 - 0.65, height, z - 0.1)
  // 紅色轉盤電話
  b.box('plain', [0.2, 0.08, 0.16], [x1 - 0.3, height + 0.04, z], { tint: '#d0442e' })
  b.box('plain', [0.22, 0.04, 0.05], [x1 - 0.3, height + 0.1, z], { tint: '#d0442e' })
  if (detail) {
    detail.cylinder('plain', 0.045, 0.045, 0.012, 12, [x1 - 0.3, height + 0.085, z + 0.05], { tint: '#f4efe6', rotation: [-0.5, 0, 0] })
    // 收銀機（小黑盒與螢幕）、紙杯與湯匙罐
    detail.box('dark', [0.24, 0.1, 0.2], [cx + 0.45, height + 0.05, z - 0.12], { tint: '#2c2b2a' })
    detail.box('dark', [0.18, 0.13, 0.02], [cx + 0.45, height + 0.17, z - 0.18], { tint: '#3a3d40', rotation: [-0.3, 0, 0] })
    for (let i = 0; i < 4; i++) detail.cylinder('paper', 0.035, 0.028, 0.09, 8, [x0 + 1.1 + i * 0.09, height + 0.045 + (i % 2) * 0.09, z - 0.18], { tint: '#f6f1e6' })
  }
}

/** 玻璃展示櫃（照片：吧台右端的木框玻璃櫃，裡面擺布丁盒、糰子與玩具） */
function buildGlassCase(b, item, detail) {
  const { x0, x1, z, depth, height } = item
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  b.box('wood', [w, 0.62, depth], [cx, 0.31, z], { tint: WOOD })
  b.box('glassClear', [w - 0.06, height - 0.66, depth - 0.06], [cx, (0.62 + height) / 2, z], { tint: GLASS })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.04, height - 0.62, 0.04], [cx + sx * (w / 2 - 0.02), (0.62 + height) / 2, z + sz * (depth / 2 - 0.02)], { tint: WOOD_DARK })
  b.box('wood', [w + 0.02, 0.04, depth + 0.02], [cx, height, z], { tint: WOOD_DARK })
  // 布丁盒（白底紅條紋）與一小盤三色糰子
  for (let i = 0; i < 3; i++) b.box('plain', [0.13, 0.09, 0.13], [x0 + 0.16 + i * 0.2, 0.67, z + 0.1], { tint: i % 2 ? '#f3efe6' : '#d6463a' })
  if (detail) {
    for (const [k, tint] of [[0, '#f0b9c4'], [1, '#f3f0e8'], [2, '#9cbf7a']]) {
      detail.add('plain', new IcosahedronGeometry(0.025, 1), { position: [x0 + 0.25 + k * 0.055, 0.71, z - 0.12], tint })
    }
  }
}

/** 吧台上方的層架（照片：鐵層架上的老玩偶、鐵盒與吊飾；只是擺設，不擋路） */
function buildShelf(b, item, detail) {
  const { x0, x1, z, y } = item
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  b.box('steel', [w, 0.03, 0.3], [cx, y, z], { tint: '#9aa0a2' })
  b.box('steel', [w, 0.03, 0.3], [cx, y + 0.42, z], { tint: '#9aa0a2' })
  const tints = ['#d8b45a', '#c9463a', '#e8e2d2', '#5b7aa0', '#e0a090']
  for (let i = 0; i < 9; i++) {
    const x = x0 + 0.2 + i * ((w - 0.4) / 8)
    const target = i % 3 === 1 && detail ? detail : b
    target.box('plain', [0.14, 0.18 + (i % 3) * 0.04, 0.14], [x, y + 0.12 + (i % 3) * 0.02, z], { tint: tints[i % tints.length] })
  }
}

/**
 * 往閣樓的木樓梯（照片：吧台左側陡而窄的木梯）：二樓不開放，樓梯口用金魚珠簾與一條繩子封住。
 * 樓梯從 z1（靠前）往 z0（靠後）升高，碰撞上整段擋住。「二樓不開放」小牌畫在街景裡（showaLaundry.js）。
 */
function buildStairs(b, item, detail) {
  const { x0, x1, z0, z1, steps } = item
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  const rise = 2.95 / steps
  const run = (z1 - z0) / steps
  for (let i = 0; i < steps; i++) {
    const zc = z1 - (i + 0.5) * run
    b.box('wood', [w, 0.05, run + 0.04], [cx, rise * (i + 1) - 0.025, zc], { tint: WOOD })
    b.box('wood', [w, rise, 0.02], [cx, rise * (i + 0.5), z1 - i * run], { tint: shade(WOOD, 0.8) })
  }
  // 斜樑與扶手
  const len = Math.hypot(z1 - z0, 2.95)
  const angle = Math.atan2(2.95, z1 - z0)
  b.box('wood', [0.06, 0.2, len], [x1 + 0.02, 1.45, (z0 + z1) / 2], { tint: WOOD_DARK, rotation: [angle, 0, 0] })
  b.box('wood', [0.04, 0.04, len], [x1 + 0.02, 2.35, (z0 + z1) / 2], { tint: WOOD_DARK, rotation: [angle, 0, 0] })
  // 樓梯口的珠簾（紅白相間的串珠，照片的金魚珠簾；流暢畫質只有一片半透明的簾）
  const curtainZ = z1 + 0.05
  if (detail) {
    for (let k = 0; k < 9; k++) {
      const x = x0 + 0.06 + k * ((w - 0.12) / 8)
      for (let j = 0; j < 9; j++) detail.add('plain', new IcosahedronGeometry(0.016, 0), { position: [x, 0.95 + j * 0.13, curtainZ], tint: j % 3 === 0 ? '#d65a3a' : '#f3ece0' })
    }
  } else {
    b.box('glassClear', [w, 1.2, 0.01], [cx, 1.55, curtainZ], { tint: '#e9b9a8' })
  }
  b.box('wood', [w + 0.06, 0.05, 0.05], [cx, 2.2, curtainZ], { tint: WOOD_DARK })
  // 封住樓梯口的繩子與小牌
  b.box('dark', [w, 0.02, 0.02], [cx, 0.85, curtainZ + 0.04], { tint: '#8a3a2a' })
}

/** 碗櫥（照片：復古木框玻璃碗櫥，上面擺炭火熨斗；碗櫥裡的玻璃杯） */
function buildCupboard(b, item, detail) {
  const { x0, x1, z, depth, height } = item
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  b.box('wood', [w, height, depth], [cx, height / 2, z], { tint: WOOD })
  b.box('glassClear', [w - 0.12, height * 0.45, 0.02], [cx, height * 0.7, z + depth / 2 + 0.01], { tint: GLASS })
  b.box('wood', [w - 0.1, 0.03, 0.04], [cx, height * 0.7, z + depth / 2 + 0.02], { tint: WOOD_DARK })
  b.box('wood', [0.03, height * 0.45, 0.04], [cx, height * 0.7, z + depth / 2 + 0.02], { tint: WOOD_DARK })
  b.box('wood', [w + 0.06, 0.04, depth + 0.06], [cx, height + 0.02, z], { tint: WOOD_DARK })
  // 炭火熨斗（近看的器物在這裡；模型的細節見 showaLaundryInspect.js）
  b.cylinder('steel', 0.07, 0.065, 0.11, 12, [cx + 0.2, height + 0.1, z], { tint: '#6e5a44', rotation: [0, 0, Math.PI / 2] })
  b.box('wood', [0.2, 0.03, 0.03], [cx + 0.38, height + 0.12, z], { tint: '#5a3f2a' })
  if (detail) {
    for (let i = 0; i < 6; i++) detail.cylinder('glassClear', 0.03, 0.026, 0.09, 8, [x0 + 0.15 + (i % 3) * 0.12, height * 0.55 + Math.floor(i / 3) * 0.32, z + 0.05], { tint: '#d9e6e0' })
  }
}

/** 靠窗的長桌與高腳椅（媒體：一樓靠窗三到五個座位） */
function buildWindowLedge(b, item, detail) {
  const { x0, x1, z, depth } = item
  const w = x1 - x0
  b.box('wood', [w, 0.05, depth], [(x0 + x1) / 2, 0.98, z], { tint: '#9a7452' })
  for (const x of [x0 + 0.08, x1 - 0.08]) b.box('wood', [0.05, 0.96, 0.05], [x, 0.48, z], { tint: WOOD_DARK })
  for (const x of item.stools) stool(b, [x, 0, z - 0.42], { tint: '#6b4a32' })
  if (detail) detail.box('plain', [0.1, 0.12, 0.1], [x0 + 0.3, 1.06, z], { tint: '#d6463a' })
}

/**
 * 後場的木桶與洗衣板（情境示意：臺灣早年洗衣的工具，不是這家店留下來的東西；近看的器物）。
 * 木桶靠後牆，洗衣板斜靠在桶邊。
 */
function buildWashTub(b, item) {
  const { x, z } = item
  b.cylinder('wood', 0.36, 0.3, 0.42, 16, [x, 0.21, z], { tint: '#a37a50' })
  for (const y of [0.08, 0.34]) b.cylinder('steel', 0.37, 0.36, 0.03, 16, [x, y, z], { tint: '#5a5a58' })
  b.cylinder('plain', 0.3, 0.3, 0.02, 16, [x, 0.38, z], { tint: '#cfd8d8' })
  b.box('wood', [0.34, 0.62, 0.03], [x + 0.48, 0.32, z + 0.08], { tint: '#c8a77c', rotation: [0, 0.3, 0.18] })
  for (let i = 0; i < 6; i++) b.box('wood', [0.3, 0.025, 0.02], [x + 0.47, 0.2 + i * 0.06, z + 0.1], { tint: '#a8875c', rotation: [0, 0.3, 0.18] })
}

export const SHOWA_FURNITURE = {
  bar: {
    build: buildBar,
    footprint: (item) => rect(item.x0 - 0.03, item.x1, item.z - item.depth / 2 - 0.03, item.z + item.depth / 2 + 0.03),
    height: (item) => item.height + 0.6,
  },
  glassCase: {
    build: buildGlassCase,
    footprint: (item) => rect(item.x0, item.x1 + 0.03, item.z - item.depth / 2 - 0.03, item.z + item.depth / 2 + 0.03),
    height: (item) => item.height,
  },
  shelf: {
    build: buildShelf,
    footprint: (item) => rect(item.x0, item.x1, item.z - 0.15, item.z + 0.15),
    // 鏡頭遮擋只在層架那一段高度（不擋住吧台前的鏡頭）
    height: (item) => item.y + 0.7,
    bounds: (item) => rect(item.x0, item.x1, item.z - 0.15, item.z + 0.15),
  },
  stairs: {
    build: buildStairs,
    footprint: (item) => rect(item.x0, item.x1 + 0.08, item.z0, item.z1 + 0.1),
    height: () => 2.95,
  },
  cupboard: {
    build: buildCupboard,
    footprint: (item) => rect(item.x0 - 0.03, item.x1 + 0.03, item.z - item.depth / 2 - 0.03, item.z + item.depth / 2 + 0.03),
    height: (item) => item.height + 0.2,
  },
  windowLedge: {
    build: buildWindowLedge,
    footprint: (item) => rect(item.x0 - 0.05, item.x1 + 0.05, item.z - 0.65, item.z + item.depth / 2 + 0.2),
    height: () => 1.05,
  },
  washTub: {
    build: buildWashTub,
    footprint: (item) => rect(item.x - 0.4, item.x + 0.7, item.z - 0.4, item.z + 0.4),
    height: () => 0.7,
  },
}
