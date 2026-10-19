import { CylinderGeometry, IcosahedronGeometry, Shape, TorusGeometry } from 'three'
import { pottedPlant, shade } from './props.js'

/**
 * 導演的豆花店 Action! Bar（夢想基地－導演的豆花店，迪化街一段224巷24號；只在 2000–現在「老屋新生」）
 *
 * 迪化街南側的一塊地段改成一條巷子（224巷），店在巷子東側、面向巷子：
 * 灰色洗石子的二層老屋，一樓兩根圓形石柱與騎樓、木作入口與白色暖簾，二樓黑框長窗（貼著白色的 X 膠帶）與窗型冷氣，
 * 立面上白邊藍字的「導演的豆花店 ACTION! BAR」，側邊突出電影膠卷邊的藍色招牌；騎樓下有木製菜單架、導演椅與盆栽。
 * 巷子對面停著一台簡化的白色「導演的豆花車」（品牌的起點，停在路邊，不擋住通行）。
 * 一樓店內可以走進去；室內細部（櫃台、豆花、展示牆…）在 actionBarInterior.js 按需載入。
 *
 * 座標：原點在迪化街南側立面線、巷口中央（世界座標 x 22.9、z 4.5），+z 往巷子裡（南）。
 * 店的本地座標：原點在騎樓柱列外緣的中央，+z 朝巷子（西）、+x 沿著店面往巷底（南），室內在 -z。
 * 建築的尺寸依照片估算，並非測量。
 */
export const LANE = {
  half: 3.5, // 巷寬 7 m（兩側是李亭香與稻舍的山牆）
  length: 25, // 迪化街立面線到巷底
  rowDepth: 11, // 兩側街屋的深度
  mouth: -1.7, // 巷口的路面接到迪化街的人行道
}

export const SHOP = {
  origin: [3.5, 0, 18.8], // 巷子座標
  rotationY: -Math.PI / 2,
  half: 3.0, // 面寬 6 m
  depth: 9.0,
  arcade: 1.8, // 騎樓深度
  wallT: 0.2,
  groundH: 3.7, // 一樓樓高
  slab: 0.25,
  top: 7.0, // 二樓牆頂
  parapet: 7.65,
  ceiling: 3.35, // 店內天花
  columns: [-1.05, 1.05],
  door: [-0.95, 0.75],
  window: [-2.5, -1.15],
  sideDoor: [1.4, 2.3],
  counterZ: -6.3, // 櫃台正面
  backZ: -8.8, // 室內後牆內側
}

const STONE = '#c9c6bd' // 洗石子
const STONE_DARK = '#b3afa5'
const WOOD = '#9a6a43'
const WOOD_DARK = '#6e4a2f'

/* ── 小工具 ─────────────────────────────── */

/** 店的本地座標 → 巷子座標 */
function shopToLane(x, z) {
  const [ox, , oz] = SHOP.origin
  const c = Math.cos(SHOP.rotationY)
  const s = Math.sin(SHOP.rotationY)
  return [ox + x * c + z * s, oz - x * s + z * c]
}

/** 黑框的長方形窗：外框、橫豎窗櫺、深色玻璃與白色 X 膠帶 */
function window2F(b, x, y, w, h, { tape = true } = {}) {
  b.box('glass', [w - 0.1, h - 0.1, 0.04], [x, y, -0.08], { tint: '#3a4148' })
  for (const s of [-1, 1]) {
    b.box('dark', [0.06, h, 0.08], [x + s * (w / 2 - 0.03), y, -0.04], { tint: '#1f2224' })
    b.box('dark', [w, 0.06, 0.08], [x, y + s * (h / 2 - 0.03), -0.04], { tint: '#1f2224' })
  }
  b.box('dark', [0.04, h, 0.06], [x, y, -0.04], { tint: '#1f2224' })
  b.box('dark', [w, 0.04, 0.06], [x, y + h * 0.18, -0.04], { tint: '#1f2224' })
  if (!tape) return
  // 白色 X 膠帶（照片中每一扇窗都有）
  const half = [x - w / 4, x + w / 4]
  for (const cx of half) {
    const len = Math.hypot(w / 2 - 0.1, h * 0.6)
    const a = Math.atan2(h * 0.6, w / 2 - 0.1)
    for (const s of [-1, 1]) {
      b.box('plain', [len, 0.05, 0.01], [cx, y - h * 0.08, -0.03], { rotation: [0, 0, s * a], tint: '#f3f3ef' })
    }
  }
}

/** 窗型冷氣（外露的機身、散熱鰭片、鐵架） */
function windowAC(b, x, y, z, { w = 0.62, h = 0.44, d = 0.55, rotationY = 0 } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [w, h, d], [0, 0, d / 2 - 0.08], { tint: '#e4e3dc' })
    b.box('perforated', [w - 0.06, h - 0.1, 0.02], [0, 0, d - 0.07], { tint: '#b8bbb8' })
    for (let i = 0; i < 5; i++) b.box('plain', [0.012, h - 0.12, 0.03], [-w / 2 + 0.08 + i * 0.12, 0, d - 0.09], { tint: '#9fa29f' })
    b.box('steel', [w + 0.08, 0.03, 0.04], [0, -h / 2 - 0.04, d - 0.15], { tint: '#7d7f7c' })
    b.box('steel', [0.03, 0.03, d + 0.1], [-w / 2, -h / 2 - 0.04, d / 2 - 0.1], { tint: '#7d7f7c' })
    b.box('steel', [0.03, 0.03, d + 0.1], [w / 2, -h / 2 - 0.04, d / 2 - 0.1], { tint: '#7d7f7c' })
  })
}

/** 分離式冷氣的室外機 */
function acUnit(b, x, y, z, rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [0.8, 0.55, 0.3], [0, 0, 0.15], { tint: '#ecebe5' })
    b.add('dark', new CylinderGeometry(0.2, 0.2, 0.02, 16), { position: [-0.12, 0, 0.31], rotation: [Math.PI / 2, 0, 0], tint: '#3a3d3c' })
    b.box('steel', [0.9, 0.03, 0.34], [0, -0.3, 0.15], { tint: '#8a8c88' })
  })
}

/** 機車（停在巷邊）：車身、坐墊、前後輪、龍頭與後照鏡 */
function scooter(b, x, z, rotationY, tint = '#d9dcdc') {
  b.group([x, 0, z], rotationY, () => {
    for (const zz of [-0.62, 0.66]) {
      b.add('dark', new CylinderGeometry(0.22, 0.22, 0.1, 14), { position: [0, 0.22, zz], rotation: [0, 0, Math.PI / 2], tint: '#232425' })
      b.add('steel', new CylinderGeometry(0.1, 0.1, 0.11, 10), { position: [0, 0.22, zz], rotation: [0, 0, Math.PI / 2], tint: '#a9adae' })
    }
    b.box('plain', [0.42, 0.42, 1.0], [0, 0.48, -0.1], { tint })
    b.box('plain', [0.36, 0.12, 0.6], [0, 0.74, -0.28], { tint: '#262626' })
    b.box('plain', [0.4, 0.62, 0.22], [0, 0.66, 0.48], { tint, rotation: [-0.25, 0, 0] })
    b.box('steel', [0.62, 0.05, 0.05], [0, 1.02, 0.56], { tint: '#3a3a3a' })
    for (const s of [-1, 1]) {
      b.box('steel', [0.015, 0.22, 0.015], [s * 0.26, 1.12, 0.56], { tint: '#3a3a3a' })
      b.box('glass', [0.12, 0.07, 0.02], [s * 0.3, 1.24, 0.56], { tint: '#9eb7c9' })
    }
    b.box('plain', [0.3, 0.12, 0.08], [0, 0.82, 0.62], { tint: '#f2f1ea' })
  })
}

/* ── 巷子 ─────────────────────────────── */

function lane(b) {
  const { half, length, mouth } = LANE
  // 柏油路面（從迪化街的人行道接進巷子）
  b.box('asphalt', [half * 2, 0.04, length - mouth], [0, 0.02, (length + mouth) / 2], { tint: '#8a8d8f' })
  // 兩側的紅線（禁止停車）與白色邊線
  for (const s of [-1, 1]) {
    b.box('plain', [0.1, 0.012, length - 0.4], [s * (half - 0.08), 0.045, length / 2 + 0.2], { tint: '#b8332c' })
    b.box('plain', [0.08, 0.012, length - 2], [s * (half - 1.15), 0.045, length / 2 + 1], { tint: '#e8e6df' })
  }
  // 排水溝蓋
  for (const z of [6.5, 16.8, 23.6]) {
    b.box('steel', [0.5, 0.012, 0.9], [half - 0.45, 0.046, z], { tint: '#3c3d3c' })
    for (let i = 0; i < 6; i++) b.box('dark', [0.42, 0.01, 0.04], [half - 0.45, 0.052, z - 0.36 + i * 0.145], { tint: '#1f2020' })
  }
  // 巷口的綠色路名牌
  b.cylinder('steel', 0.04, 0.04, 2.44, 8, [half - 0.3, 1.22, -0.6], { tint: '#9aa09f' })
  b.box('plain', [1.18, 0.34, 0.03], [half - 0.3, 2.62, -0.6], { tint: '#1d6a50' })
  b.addSign({ text: '迪化街一段224巷', style: 'road', width: 1.12, height: 0.28, position: [half - 0.3, 2.62, -0.62], rotationY: Math.PI })
  b.addSign({ text: '迪化街一段224巷', style: 'road', width: 1.12, height: 0.28, position: [half - 0.3, 2.62, -0.58] })

  // 兩側山牆上的生活痕跡：冷氣室外機、水管、電表箱、電線
  acUnit(b, -half, 3.6, 3.2, Math.PI / 2)
  acUnit(b, half, 4.2, 6.8, -Math.PI / 2)
  acUnit(b, -half, 6.2, 8.4, Math.PI / 2)
  for (const [x, z] of [
    [-half + 0.07, 5.5],
    [half - 0.07, 9.6],
  ]) {
    b.cylinder('plain', 0.05, 0.05, 6.6, 8, [x, 3.3, z], { tint: '#d8d6cf' })
  }
  b.box('steel', [0.08, 0.5, 0.36], [half - 0.04, 1.6, 3.4], { tint: '#9aa29e' })
  b.box('steel', [0.08, 0.36, 0.28], [-half + 0.04, 1.5, 9.8], { tint: '#9aa29e' })
  for (const y of [5.2, 5.5]) b.box('dark', [half * 2, 0.02, 0.02], [0, y, 10.4], { tint: '#202020' })
}

/* ── 店：導演的豆花店 ─────────────────────── */

function shopShell(b) {
  const { half, depth, arcade, wallT, groundH, slab, top, parapet, ceiling, columns, door, window, sideDoor } = SHOP
  const front = -arcade
  const floor2 = groundH + slab
  // 騎樓地坪（灰色洗石子）與店內的深色地板（室內細部未載入時，從門口看進去是暗的）
  b.box('granite', [half * 2, 0.03, arcade], [0, 0.035, -arcade / 2], { tint: '#bdbab2' })
  b.box('dark', [half * 2 - 0.4, 0.02, depth - arcade - 0.4], [0, 0.03, front - (depth - arcade) / 2], { tint: '#3a2e26' })
  // 騎樓兩側的端牆（洗石子方柱）
  for (const s of [-1, 1]) {
    b.box('granite', [0.5, floor2, arcade + 0.1], [s * (half - 0.25), floor2 / 2, -arcade / 2 + 0.05], { tint: STONE, grime: 0.12 })
  }
  // 圓形石柱（柱礎、柱身、柱頭）
  for (const x of columns) {
    b.cylinder('granite', 0.38, 0.4, 0.22, 20, [x, 0.11, -0.4], { tint: STONE_DARK })
    b.cylinder('granite', 0.3, 0.31, groundH - 0.5, 20, [x, 0.22 + (groundH - 0.5) / 2, -0.4], { tint: STONE, grime: 0.15 })
    b.cylinder('granite', 0.37, 0.32, 0.18, 20, [x, groundH - 0.19, -0.4], { tint: STONE_DARK })
  }
  // 騎樓天花（二樓樓板底）
  b.box('plain', [half * 2 - 0.9, 0.06, arcade], [0, groundH - 0.03, -arcade / 2], { tint: '#d9d5cc' })
  b.cylinder('bulb', 0.07, 0.07, 0.04, 10, [0, groundH - 0.08, -0.9], { tint: '#fff2d6' })
  b.addGlow(0, groundH - 0.2, -0.9, 0.9, '#ffd9a0')

  // 一樓立面（騎樓後方的木作）
  const fz = front
  const wood = (x0, x1, y0, y1, tint = WOOD, mat = 'planks') =>
    b.box(mat, [x1 - x0, y1 - y0, wallT], [(x0 + x1) / 2, (y0 + y1) / 2, fz - wallT / 2], { tint })
  const openTop = 2.55
  // 櫥窗（木框＋玻璃）
  const [wx0, wx1] = window
  wood(wx0, wx1, 0, 0.85, WOOD_DARK)
  b.box('glassClear', [wx1 - wx0 - 0.1, openTop - 0.9, 0.04], [(wx0 + wx1) / 2, (0.85 + openTop) / 2, fz - 0.06], { tint: '#e7eef0' })
  for (const x of [wx0 + 0.03, (wx0 + wx1) / 2, wx1 - 0.03]) b.box('wood', [0.06, openTop - 0.85, 0.08], [x, (0.85 + openTop) / 2, fz - 0.04], { tint: WOOD_DARK })
  b.box('wood', [wx1 - wx0, 0.08, 0.12], [(wx0 + wx1) / 2, 0.88, fz - 0.03], { tint: WOOD_DARK })
  wood(wx1, door[0], 0, openTop, WOOD_DARK)
  // 大門（開著的木門＋門框）
  const [dx0, dx1] = door
  for (const x of [dx0, dx1]) b.box('wood', [0.08, openTop, 0.24], [x, openTop / 2, fz - 0.1], { tint: WOOD_DARK })
  b.box('wood', [dx1 - dx0 + 0.16, 0.1, 0.24], [(dx0 + dx1) / 2, openTop + 0.05, fz - 0.1], { tint: WOOD_DARK })
  // 門扇整個推開、貼著前牆內側（不擋住門口與店內的走道）
  b.group([dx1 - 0.04, 0, fz - wallT - 0.03], Math.PI + 0.04, () => {
    b.box('wood', [0.86, openTop - 0.08, 0.05], [-0.43, (openTop - 0.08) / 2, 0], { tint: WOOD })
    b.box('glassClear', [0.46, 0.9, 0.02], [-0.43, 1.65, 0.03], { tint: '#e7eef0' })
    b.box('steel', [0.03, 0.22, 0.04], [-0.78, 1.05, 0.05], { tint: '#c9a46a' })
  })
  // 右側通往二樓的木門（關著）與木作牆
  const [sx0, sx1] = sideDoor
  wood(door[1], sx0, 0, openTop, WOOD_DARK)
  b.box('wood', [sx1 - sx0, openTop - 0.1, 0.06], [(sx0 + sx1) / 2, (openTop - 0.1) / 2, fz + 0.02], { tint: WOOD })
  for (const y of [0.6, 1.4, 2.1]) b.box('wood', [sx1 - sx0 - 0.16, 0.04, 0.02], [(sx0 + sx1) / 2, y, fz + 0.06], { tint: WOOD_DARK })
  wood(sx1, half - 0.5, 0, openTop, WOOD_DARK)
  // 門楣上方的木作橫帶（店名雕在木板上）與小圓燈
  wood(-half + 0.5, half - 0.5, openTop, groundH, '#83593a')
  b.box('wood', [half * 2 - 1, 0.06, 0.1], [0, openTop + 0.04, fz + 0.02], { tint: WOOD_DARK })
  for (const x of [-0.4, 0.4]) {
    b.cylinder('steel', 0.012, 0.012, 0.35, 6, [x, groundH - 0.2, fz + 0.2], { tint: '#3a3634' })
    b.add('plain', new CylinderGeometry(0.06, 0.13, 0.12, 12, 1, true), { position: [x, groundH - 0.42, fz + 0.2], tint: '#2b2b2b' })
    b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, groundH - 0.48, fz + 0.2], tint: '#fff1cf' })
  }
  // 白色暖簾（大門上半部）
  b.box('cloth', [dx1 - dx0 - 0.08, 0.5, 0.02], [(dx0 + dx1) / 2, openTop - 0.28, fz + 0.06], { tint: '#efece4' })
  for (let i = 1; i < 4; i++) b.box('cloth', [0.012, 0.42, 0.024], [dx0 + ((dx1 - dx0) * i) / 4, openTop - 0.32, fz + 0.07], { tint: '#d8d4ca' })
  // 門口地墊
  b.box('cloth', [1.2, 0.012, 0.7], [(dx0 + dx1) / 2, 0.055, fz + 0.45], { tint: '#5a4c3f' })

  // 二樓：洗石子立面、店名招牌帶、三扇黑框長窗、窗型冷氣、簷口與女兒牆
  const upperH = top - floor2
  b.box('granite', [half * 2, slab + 0.3, 0.32], [0, groundH + slab / 2 - 0.15, 0.06], { tint: STONE_DARK, grime: 0.1 })
  b.box('granite', [half * 2, upperH, 0.3], [0, floor2 + upperH / 2, -0.15], { tint: STONE, grime: 0.18 })
  for (const s of [-1, 1]) b.box('granite', [0.42, upperH + 0.2, 0.42], [s * (half - 0.21), floor2 + upperH / 2, -0.1], { tint: shade(STONE, 0.96) })
  // 窗（在立面牆上挖洞的效果：深色窗洞＋窗框）
  const winY = floor2 + 1.95
  const winH = 1.35
  for (const [x, w] of [
    [-1.65, 1.1],
    [0.05, 1.75],
    [1.75, 1.1],
  ]) {
    b.box('dark', [w + 0.04, winH + 0.04, 0.05], [x, winY, 0.0], { tint: '#2b2d2f' })
    b.group([0, 0, 0.12], 0, () => window2F(b, x, winY, w, winH))
    b.box('granite', [w + 0.18, 0.08, 0.14], [x, winY - winH / 2 - 0.05, 0.06], { tint: STONE_DARK })
  }
  windowAC(b, 0.05, winY + 0.45, 0.1)
  // 簷口、女兒牆與上方的大理石紋板
  b.box('granite', [half * 2 + 0.12, 0.18, 0.46], [0, top + 0.09, -0.1], { tint: STONE_DARK })
  b.box('granite', [half * 2, parapet - top - 0.18, 0.3], [0, (top + 0.18 + parapet) / 2, -0.18], { tint: STONE, grime: 0.15 })
  b.box('stone', [1.9, 0.4, 0.04], [-0.9, parapet - 0.3, -0.02], { tint: '#d8d0c2' })
  for (let i = 0; i < 4; i++) {
    b.box('stone', [1.6 - i * 0.3, 0.02, 0.01], [-0.9 + i * 0.05, parapet - 0.38 + i * 0.06, 0.01], { tint: i % 2 ? '#b6aa98' : '#c9bda9' })
  }

  // 店名：藍色白邊的「導演的豆花店」與深藍色的「ACTION! BAR」，右邊是碗與膠卷的圖示（簡化的原創示意）
  const signY = floor2 + 0.62
  b.addSign({ text: 'ACTION! BAR', style: 'actionNavy', width: 1.55, height: 0.26, position: [0.05, signY + 0.3, 0.02] })
  b.addSign({ text: '導演的豆花店', style: 'actionBlue', width: 2.5, height: 0.44, position: [-0.25, signY - 0.06, 0.02] })
  b.group([1.75, signY + 0.05, 0.02], 0, () => {
    b.add('plain', new CylinderGeometry(0.36, 0.36, 0.03, 24), { rotation: [Math.PI / 2, 0, 0], tint: '#ffffff' })
    b.add('plain', new CylinderGeometry(0.31, 0.31, 0.035, 24), { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.003], tint: '#2b93d9' })
    // 碗（白色半圓）與斜放的膠卷帶
    const bowl = new Shape()
    bowl.absarc(0, 0.02, 0.21, Math.PI, 0, true)
    bowl.lineTo(-0.21, 0.02)
    b.extrude('plain', bowl, 0.02, { position: [0, -0.02, 0.02], tint: '#ffffff' })
    b.box('plain', [0.5, 0.11, 0.02], [0, -0.08, 0.045], { rotation: [0, 0, 0.32], tint: '#1f2b45' })
    for (let i = 0; i < 6; i++) b.box('plain', [0.035, 0.03, 0.01], [-0.19 + i * 0.075, -0.08 + (-0.19 + i * 0.075) * 0.33, 0.058], { tint: '#ffffff' })
    b.add('plain', new IcosahedronGeometry(0.05, 1), { position: [0.12, 0.2, 0.04], tint: '#ffffff' })
    b.add('plain', new IcosahedronGeometry(0.035, 1), { position: [0.2, 0.15, 0.04], tint: '#ffffff' })
  })

  // 側邊突出的藍色招牌（電影膠卷邊，兩面都有字）
  const px = half - 0.2
  b.box('steel', [0.06, 0.06, 1.2], [px, floor2 + 2.85, 0.45], { tint: '#9aa09f' })
  b.box('steel', [0.06, 0.06, 1.2], [px, floor2 + 0.85, 0.45], { tint: '#9aa09f' })
  b.group([px, floor2 + 1.85, 1.0], Math.PI / 2, () => {
    b.box('steel', [0.92, 2.5, 0.28], [0, 0, 0], { tint: '#d9dde0' })
    b.box('plain', [0.86, 2.44, 0.29], [0, 0, 0], { tint: '#2190dc' })
    for (const s of [-1, 1]) {
      b.addSign({ text: '導演的豆花店', style: 'filmBlue', vertical: true, width: 0.82, height: 2.36, position: [0, 0, s * 0.15], rotationY: s > 0 ? 0 : Math.PI })
    }
  })
  b.addGlow(px, floor2 + 1.85, 1.0, 1.4, '#9fd2ff')

  // 側牆、後牆、屋頂板（被鄰棟擋住的部分也做出來，從巷底看得到）；騎樓上方的二樓兩側也封起來
  for (const s of [-1, 1]) {
    b.box('plaster', [wallT, parapet, depth - arcade], [s * (half - wallT / 2), parapet / 2, front - (depth - arcade) / 2], { tint: '#cfcac0', grime: 0.2 })
    b.box('plaster', [wallT, parapet - groundH, arcade - 0.3], [s * (half - wallT / 2), (groundH + parapet) / 2, -0.3 - (arcade - 0.3) / 2], { tint: '#cfcac0', grime: 0.2 })
  }
  b.box('plaster', [half * 2, top, wallT], [0, top / 2, -depth + wallT / 2], { tint: '#cfcac0', grime: 0.2 })
  b.box('plaster', [half * 2 - 2 * wallT, 0.2, depth - 0.3 - wallT], [0, top - 0.1, (-0.3 + SHOP.backZ) / 2], { tint: '#bfb9ae' })
  // 屋頂上的加蓋鐵皮屋與水塔
  b.box('plaster', [half * 2 - 1, 2.2, 3.4], [0, top + 1.1, -depth + 2.0], { tint: '#d9d6cf' })
  b.box('roof', [half * 2 - 0.6, 0.08, 3.8], [0, top + 2.28, -depth + 2.0], { rotation: [0.08, 0, 0], tint: '#a9adae' })
  b.cylinder('plain', 0.45, 0.45, 1.0, 14, [-1.6, top + 0.5, -depth + 4.6], { tint: '#e6e2d6' })

  // 店內的暗色外殼（室內細部未載入時，從門口與櫥窗看進去是暗的）
  b.box('dark', [half * 2 - 0.42, 0.04, depth - arcade - 0.4], [0, ceiling + 0.02, front - (depth - arcade) / 2], { tint: '#2b231e' })
  for (const s of [-1, 1]) {
    b.box('dark', [0.04, ceiling, depth - arcade - 0.4], [s * (half - wallT - 0.02), ceiling / 2, front - (depth - arcade) / 2], { tint: '#3b2f27' })
  }
  b.box('dark', [half * 2 - 0.4, ceiling, 0.02], [0, ceiling / 2, SHOP.backZ + 0.012], { tint: '#3b2f27' })
  // 從門口與櫥窗透出的暖光
  b.addGlow((dx0 + dx1) / 2, 1.9, fz - 0.6, 1.6, '#ffc98a')
  b.addPool((dx0 + dx1) / 2, fz + 0.9, 1.4, '#ffcf96')

  // 騎樓下（大門前留出走道）：左邊是導演椅、小桌與盆栽，右邊是木製菜單架與黑板
  b.group([1.75, 0, -1.15], 0.15, () => {
    for (const s of [-1, 1]) b.box('wood', [0.05, 1.35, 0.05], [s * 0.3, 0.67, 0], { tint: WOOD_DARK })
    b.box('wood', [0.66, 0.84, 0.04], [0, 0.98, 0.03], { tint: '#b98d5f' })
    b.box('plain', [0.56, 0.72, 0.01], [0, 0.98, 0.055], { tint: '#f4efe2' })
    for (let i = 0; i < 6; i++) b.box('plain', [0.4 - (i % 3) * 0.08, 0.025, 0.005], [-0.04, 1.24 - i * 0.1, 0.062], { tint: i % 3 === 0 ? '#2b5f8c' : '#4a3b30' })
  })
  b.group([2.3, 0, -1.55], -0.25, () => {
    for (const s of [-1, 1]) b.box('wood', [0.04, 1.5, 0.04], [s * 0.22, 0.75, 0], { tint: WOOD_DARK })
    b.box('dark', [0.46, 0.62, 0.03], [0, 1.15, 0.02], { tint: '#2c3431' })
    b.addSign({ text: '今日豆花', style: 'chalk', width: 0.42, height: 0.12, position: [0, 1.3, 0.04] })
  })
  directorChair(b, -2.05, -0.95, 0.35)
  b.box('wood', [0.4, 0.04, 0.4], [-1.6, 0.62, -1.25], { tint: '#b98d5f' })
  for (const [x, z] of [
    [-1.43, -1.08],
    [-1.77, -1.08],
    [-1.43, -1.42],
    [-1.77, -1.42],
  ]) {
    b.box('wood', [0.03, 0.6, 0.03], [x, 0.3, z], { tint: WOOD_DARK })
  }
  pottedPlant(b, [-1.6, 0.64, -1.25], { seed: 224, size: 0.5, potTint: '#5d6b4a' })
  pottedPlant(b, [-2.55, 0, -1.55], { seed: 225, size: 0.9, potTint: '#8a8f86' })
}

/** 摺疊導演椅（木框、灰藍色帆布椅面與椅背） */
export function directorChair(b, x, z, rotationY = 0) {
  b.group([x, 0, z], rotationY, () => {
    for (const s of [-1, 1]) {
      b.box('wood', [0.04, 0.95, 0.04], [s * 0.24, 0.47, -0.18], { tint: '#c8a272' })
      b.box('wood', [0.04, 0.62, 0.04], [s * 0.24, 0.31, 0.16], { tint: '#c8a272' })
      b.box('wood', [0.04, 0.04, 0.42], [s * 0.24, 0.64, 0], { tint: '#c8a272' })
      // 交叉的椅腳
      b.box('wood', [0.03, 0.62, 0.03], [s * 0.26, 0.28, 0], { rotation: [0.62, 0, 0], tint: '#b8925f' })
      b.box('wood', [0.03, 0.62, 0.03], [s * 0.26, 0.28, 0], { rotation: [-0.62, 0, 0], tint: '#b8925f' })
    }
    b.box('cloth', [0.46, 0.03, 0.36], [0, 0.48, 0], { tint: '#7f8e98' })
    b.box('cloth', [0.48, 0.22, 0.02], [0, 0.86, -0.18], { tint: '#7f8e98' })
  })
}

/* ── 鄰棟 ─────────────────────────────── */

/** 店北側的紅磚老屋（二樓兩個拱窗、一樓紅磚柱騎樓與玻璃店面；不使用實際店家的招牌） */
function brickNeighbour(b) {
  const w = 4.8
  const d = 9
  b.group([LANE.half, 0, 13.4], -Math.PI / 2, () => {
    b.box('granite', [w, 0.03, 1.8], [0, 0.035, -0.9], { tint: '#bdb9b0' })
    for (const x of [-w / 2 + 0.3, w / 2 - 0.3]) b.box('brick', [0.5, 3.6, 0.5], [x, 1.8, -0.3], { tint: '#c9775a', grime: 0.2 })
    b.box('glassClear', [w - 1.2, 2.4, 0.04], [0, 1.3, -1.8], { tint: '#e6ecee' })
    b.box('wood', [w - 1.0, 0.12, 0.1], [0, 2.56, -1.78], { tint: '#6b4a33' })
    b.box('wood', [w - 1.0, 1.05, 0.2], [0, 3.1, -1.8], { tint: '#7a563a' })
    b.box('dark', [w - 1.2, 2.4, 0.04], [0, 1.3, -2.2], { tint: '#40352c' })
    // 二樓紅磚立面與兩個拱窗
    b.box('brick', [w, 3.3, 0.3], [0, 5.35, -0.15], { tint: '#c06a4d', grime: 0.22 })
    b.box('granite', [w, 0.35, 0.36], [0, 3.72, -0.1], { tint: '#d6d2c8' })
    for (const x of [-1.05, 1.05]) {
      b.box('dark', [1.2, 1.7, 0.06], [x, 5.3, 0.02], { tint: '#2b2f33' })
      const arch = new Shape()
      arch.absarc(0, 0, 0.62, 0, Math.PI, false)
      arch.lineTo(-0.62, 0)
      b.extrude('brick', arch, 0.08, { position: [x, 6.15, 0.0], tint: '#a9573e' })
      b.add('dark', new CylinderGeometry(0.56, 0.56, 0.04, 16, 1, false, -Math.PI / 2, Math.PI), { position: [x, 6.15, 0.04], rotation: [Math.PI / 2, 0, 0], tint: '#2b2f33' })
      for (const s of [-1, 1]) b.box('dark', [0.05, 1.7, 0.06], [x + s * 0.58, 5.3, 0.06], { tint: '#1f2224' })
      b.box('dark', [0.04, 2.2, 0.05], [x, 5.5, 0.07], { tint: '#1f2224' })
    }
    // 窗下的磁磚花飾帶（簡化的花草圖樣）
    b.box('plain', [w - 0.6, 0.55, 0.06], [0, 4.25, 0.02], { tint: '#f1ede2' })
    for (let i = 0; i < 3; i++) {
      b.add('plain', new IcosahedronGeometry(0.12, 0), { position: [-1.5 + i * 1.5, 4.25, 0.07], scale: [1.2, 0.8, 0.3], tint: ['#c45e4c', '#4f7f61', '#d7a44a'][i] })
    }
    b.box('brick', [w, 0.5, 0.36], [0, 7.25, -0.1], { tint: '#a9573e' })
    for (const s of [-1, 1]) b.box('plaster', [0.2, 7.5, d - 0.3], [s * (w / 2 - 0.1), 3.75, -d / 2 - 0.15], { tint: '#c9b8a6' })
    b.box('plaster', [w, 7.5, 0.2], [0, 3.75, -d + 0.1], { tint: '#c9b8a6' })
    b.box('plaster', [w - 0.4, 0.2, d - 0.5], [0, 7.38, -d / 2 - 0.05], { tint: '#b9a896' })
    // 一樓牆邊的綠色植物
    pottedPlant(b, [-1.6, 0, -0.9], { seed: 31, size: 1.05, potTint: '#7d5a44' })
    pottedPlant(b, [1.5, 0, -1.0], { seed: 32, size: 0.85, potTint: '#7d5a44' })
  })
}

/** 店南側的白色鐵皮加蓋小屋（咖啡館，簡化） */
function whiteShed(b) {
  const w = 3.2
  const d = 6.6
  b.group([LANE.half, 0, 23.4], -Math.PI / 2, () => {
    // 店面內凹：玻璃後面看得到暗色的店內與吊燈
    b.box('plaster', [w, 3.4, d - 0.55], [0, 1.7, -0.95 - (d - 0.55) / 2], { tint: '#ecebe6', grime: 0.15 })
    for (const s of [-1, 1]) b.box('plaster', [0.12, 3.4, 0.6], [s * (w / 2 - 0.06), 1.7, -0.68], { tint: '#ecebe6', grime: 0.15 })
    b.box('plaster', [w, 0.9, 0.6], [0, 2.95, -0.68], { tint: '#ecebe6', grime: 0.15 })
    b.box('glassClear', [w - 0.5, 2.3, 0.04], [0, 1.35, -0.38], { tint: '#e6ecee' })
    for (const x of [-w / 2 + 0.25, 0, w / 2 - 0.25]) b.box('steel', [0.06, 2.4, 0.06], [x, 1.3, -0.36], { tint: '#d4d6d4' })
    b.box('dark', [w - 0.6, 2.2, 0.04], [0, 1.3, -0.9], { tint: '#3e3a35' })
    for (const x of [-0.7, 0.6]) {
      b.box('plain', [0.04, 0.3, 0.04], [x, 2.35, -0.6], { tint: '#3a3634' })
      b.add('plain', new IcosahedronGeometry(0.1, 1), { position: [x, 2.15, -0.6], tint: '#f6e6c4' })
    }
    // 斜屋頂的白色波浪鐵皮
    b.box('roof', [w + 0.4, 0.06, d + 0.6], [0, 3.6, -d / 2 - 0.3], { rotation: [-0.12, 0, 0], tint: '#f0efea' })
    for (let i = 0; i < 9; i++) b.box('roof', [0.04, 0.05, d + 0.6], [-w / 2 - 0.1 + i * 0.42, 3.64, -d / 2 - 0.3], { rotation: [-0.12, 0, 0], tint: '#d8d7d0' })
    acUnit(b, 0.6, 2.9, -0.36, 0)
  })
}

/** 巷子西側的大樓（淡褐色磁磚牆面、花崗石橫帶與白框窗，豆花車就停在它前面） */
function tanBuilding(b) {
  const w = 14
  const d = 5.4
  const floors = [0, 3.6, 7.0, 10.4]
  b.group([-LANE.half, 0, 18], Math.PI / 2, () => {
    b.box('tile', [w, 10.4, d], [0, 5.2, -d / 2], { tint: '#c9a27c', grime: 0.12 })
    for (const y of floors.slice(1)) b.box('granite', [w + 0.04, 0.4, 0.12], [0, y, 0.04], { tint: '#cfcbc2' })
    b.box('granite', [w + 0.04, 0.7, 0.12], [0, 0.35, 0.04], { tint: '#b9b5ac' })
    // 窗與花崗石窗框；中段的大窗有鐵窗花
    for (const [fi, y0] of floors.slice(0, 3).entries()) {
      for (let i = 0; i < 5; i++) {
        const x = -w / 2 + 1.5 + i * 2.75
        if (fi === 0 && (i === 1 || i === 3)) continue
        const wy = y0 + 1.8
        b.box('granite', [1.5, 1.7, 0.1], [x, wy, 0.03], { tint: '#d3cfc6' })
        b.box('glass', [1.2, 1.4, 0.05], [x, wy, 0.07], { tint: '#cfd8db' })
        b.box('plain', [1.2, 0.05, 0.03], [x, wy + 0.25, 0.1], { tint: '#f4f4f0' })
        b.box('plain', [0.05, 1.4, 0.03], [x, wy, 0.1], { tint: '#f4f4f0' })
        if (fi === 1 && i === 2) {
          for (let k = 0; k < 6; k++) b.box('dark', [0.02, 0.5, 0.02], [x - 0.5 + k * 0.2, wy - 0.9, 0.25], { tint: '#2a2523' })
          b.box('dark', [1.3, 0.03, 0.04], [x, wy - 0.65, 0.25], { tint: '#2a2523' })
          b.box('dark', [1.3, 0.03, 0.04], [x, wy - 1.15, 0.25], { tint: '#2a2523' })
        }
      }
      // 凹進去的磁磚面板（照片中的方形凹槽）
      for (const x of [-w / 2 + 2.9, w / 2 - 2.9]) {
        if (fi === 0) continue
        b.box('tile', [1.3, 1.9, 0.05], [x, y0 + 1.8, 0.0], { tint: '#b58f6a' })
      }
    }
    // 一樓的入口與壁燈
    for (const x of [-w / 2 + 4.25, w / 2 - 4.25]) {
      b.box('dark', [1.4, 2.4, 0.06], [x, 1.2, 0.03], { tint: '#3d3a36' })
      b.box('granite', [1.7, 0.25, 0.2], [x, 2.55, 0.08], { tint: '#d3cfc6' })
      b.cylinder('plain', 0.1, 0.1, 0.42, 10, [x + 1.1, 2.6, 0.12], { tint: '#d6c39a' })
    }
    b.box('granite', [w + 0.3, 0.5, 0.4], [0, 10.6, -0.05], { tint: '#cfcbc2' })
    // 屋頂：女兒牆、樓梯間與水塔（從觀賞模式的高處看也不是一個空盒子）
    b.box('granite', [w + 0.1, 0.5, 0.2], [0, 10.6, -d + 0.1], { tint: '#cfcbc2' })
    for (const s of [-1, 1]) b.box('granite', [0.2, 0.5, d], [s * (w / 2 - 0.05), 10.6, -d / 2], { tint: '#cfcbc2' })
    b.box('plaster', [3.0, 2.4, 2.6], [w / 2 - 2.6, 11.6, -d + 1.8], { tint: '#cdc4b5', grime: 0.2 })
    b.box('dark', [0.9, 1.9, 0.05], [w / 2 - 2.6, 11.35, -d + 3.12], { tint: '#4a3f36' })
    for (const x of [-3.5, -1.8]) {
      b.cylinder('plain', 0.55, 0.55, 1.3, 14, [x, 11.3, -d + 2.0], { tint: '#e8e4da' })
      b.cylinder('plain', 0.57, 0.57, 0.08, 14, [x, 11.98, -d + 2.0], { tint: '#cfcbc2' })
    }
    for (const x of [-w / 2 + 1.2, 1.2]) acUnit(b, x, 10.75, -d + 4.2, Math.PI)
  })
}

/**
 * 巷子後方的平頂老屋（從觀賞模式的高處才看得到）：補滿店與巷子佔地裡其餘的空地，
 * 不讓遠景房屋與地面的空隙露出來。巷子座標：[minX, maxX, minZ, maxZ, 高度, 色調]
 */
const FILLERS = [
  [12.5, 14, 12.5, 33, 6.6, '#d2c8b8'],
  [5, 12.5, 25, 33, 7.4, '#cfc6b6'],
  [10.5, 12.5, 21.8, 25, 5.2, '#d8cfc0'],
  [-11.5, -5, 25, 33, 8.2, '#c9bfae'],
  [-11.5, -8.9, 12.8, 25, 9.6, '#cdc3b2'],
]

function fillerBlocks(b) {
  for (const [x0, x1, z0, z1, h, tint] of FILLERS) {
    const cx = (x0 + x1) / 2
    const cz = (z0 + z1) / 2
    b.box('plaster', [x1 - x0, h, z1 - z0], [cx, h / 2, cz], { tint, grime: 0.25 })
    // 女兒牆與屋頂上的水塔
    b.box('plaster', [x1 - x0 + 0.1, 0.45, 0.2], [cx, h + 0.2, z0 + 0.1], { tint: '#bfb5a4' })
    b.box('plaster', [x1 - x0 + 0.1, 0.45, 0.2], [cx, h + 0.2, z1 - 0.1], { tint: '#bfb5a4' })
    if (x1 - x0 > 4) b.cylinder('plain', 0.5, 0.5, 1.1, 12, [cx + 0.8, h + 0.55, cz], { tint: '#e6e2d8' })
  }
}

/** 巷底的二層老屋（鐵捲門與盆栽，收束巷子的街景） */
function laneEnd(b) {
  const w = 10
  b.group([0, 0, LANE.length], Math.PI, () => {
    b.box('plaster', [w, 6.4, 7], [0, 3.2, -3.5], { tint: '#d6d0c4', grime: 0.2 })
    b.box('shutter', [3.2, 2.6, 0.06], [-1.2, 1.3, 0.03], { tint: '#b8bcbc' })
    b.box('dark', [1.0, 2.2, 0.05], [1.6, 1.1, 0.03], { tint: '#4a3f36' })
    for (const x of [-2.6, 0, 2.6]) {
      b.box('glass', [1.3, 1.2, 0.05], [x, 4.6, 0.03], { tint: '#cfd8db' })
      b.box('plain', [1.38, 0.06, 0.1], [x, 3.97, 0.05], { tint: '#efefe9' })
    }
    b.box('plaster', [w + 0.2, 0.4, 0.3], [0, 6.5, -0.05], { tint: '#c9c3b6' })
    acUnit(b, 3.5, 3.4, 0.0, 0)
    pottedPlant(b, [2.9, 0, 0.5], { seed: 41, size: 1.1 })
    pottedPlant(b, [-3.4, 0, 0.45], { seed: 42, size: 0.9 })
  })
}

/* ── 導演的豆花車 ─────────────────────────── */

const TRUCK = { x: -LANE.half + 1.0, z: 17.2, length: 4.4, width: 1.56 }

/**
 * 簡化的白色「導演的豆花車」：小貨車的車頭、白色貨箱、像小屋一樣的斜屋頂（邊緣有鏽痕），
 * 車身側面是一格一格的電影場記板圖樣與藍色的說明看板（原創的簡化圖樣，不使用照片中的人物插畫）。
 * 車頭朝向迪化街，停在巷子西側的紅線內。
 */
function beanFlowerTruck(b) {
  const { x, z, length, width } = TRUCK
  b.group([x, 0, z + length / 2], Math.PI, () => {
    const L = length
    const W = width
    // 車輪
    for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) {
      for (const s of [-1, 1]) {
        b.add('dark', new CylinderGeometry(0.31, 0.31, 0.2, 18), { position: [s * (W / 2 - 0.08), 0.31, zz], rotation: [0, 0, Math.PI / 2], tint: '#202122' })
        b.add('steel', new CylinderGeometry(0.17, 0.17, 0.21, 14), { position: [s * (W / 2 - 0.08), 0.31, zz], rotation: [0, 0, Math.PI / 2], tint: '#c4c8ca' })
      }
    }
    b.box('dark', [W - 0.2, 0.22, L - 0.3], [0, 0.48, 0], { tint: '#2a2b2c' })
    // 車頭（朝 -z 的本地方向，群組轉了 180 度，所以朝向迪化街）
    const cabZ = L / 2 - 0.66
    b.box('plain', [W, 1.32, 1.3], [0, 1.25, cabZ], { tint: '#f4f4f1' })
    b.box('plain', [W - 0.04, 0.28, 0.4], [0, 2.02, cabZ - 0.1], { tint: '#f4f4f1' })
    b.box('dark', [W - 0.12, 0.6, 0.04], [0, 1.6, L / 2 - 0.02], { rotation: [-0.25, 0, 0], tint: '#34424c' })
    for (const s of [-1, 1]) {
      b.box('dark', [0.04, 0.5, 0.7], [s * (W / 2 + 0.005), 1.6, cabZ - 0.05], { tint: '#34424c' })
      b.box('dark', [0.06, 0.16, 0.1], [s * (W / 2 + 0.08), 1.62, cabZ + 0.42], { tint: '#1e1f20' })
      // 車門上的藍色圓形標誌
      b.add('plain', new CylinderGeometry(0.24, 0.24, 0.02, 20), { position: [s * (W / 2 + 0.012), 1.08, cabZ - 0.1], rotation: [0, 0, Math.PI / 2], tint: '#2f78c4' })
      // 圓形標誌裡的白色碗與熱氣（原創的簡化圖樣）
      b.box('plain', [0.024, 0.07, 0.2], [s * (W / 2 + 0.014), 1.03, cabZ - 0.1], { tint: '#f4f4f1' })
      b.box('plain', [0.024, 0.03, 0.12], [s * (W / 2 + 0.014), 0.985, cabZ - 0.1], { tint: '#f4f4f1' })
      b.box('plain', [0.024, 0.018, 0.2], [s * (W / 2 + 0.014), 1.13, cabZ - 0.07], { rotation: [0.5, 0, 0], tint: '#f4f4f1' })
    }
    b.box('dark', [W - 0.1, 0.18, 0.08], [0, 0.72, L / 2 + 0.02], { tint: '#2b2c2d' })
    for (const s of [-1, 1]) b.box('glassWarm', [0.26, 0.14, 0.04], [s * 0.55, 0.98, L / 2 + 0.01], { tint: '#fff2d0' })
    // 貨箱
    const boxL = L - 1.5
    const boxZ = -L / 2 + boxL / 2 + 0.1
    b.box('plain', [W + 0.06, 1.62, boxL], [0, 1.47, boxZ], { tint: '#f2f1ec', grime: 0.1 })
    for (const s of [-1, 1]) {
      const fx = s * (W / 2 + 0.035)
      // 場記板格子（3×3，車身後段；中央一格是藍底的碗）
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cz = boxZ - 0.25 - c * 0.42
          const cy = 2.0 - r * 0.38
          if (r === 1 && c === 1) {
            b.box('plain', [0.012, 0.3, 0.34], [fx, cy, cz], { tint: '#2f8fd8' })
            b.box('plain', [0.014, 0.1, 0.16], [fx, cy - 0.02, cz], { tint: '#f4f4f1' })
            continue
          }
          b.box('plain', [0.012, 0.26, 0.34], [fx, cy - 0.02, cz], { tint: '#222222' })
          b.box('plain', [0.014, 0.06, 0.34], [fx, cy + 0.13, cz], { tint: '#f2f2f2' })
          for (let k = 0; k < 3; k++) b.box('plain', [0.016, 0.06, 0.05], [fx, cy + 0.13, cz - 0.12 + k * 0.12], { tint: '#222222' })
        }
      }
      // 藍色說明看板與攝影機圖示（車身前段；取代照片中的人物插畫）
      b.box('plain', [0.012, 0.85, 0.42], [fx, 1.75, boxZ + 0.85], { tint: '#2f8fd8' })
      for (let k = 0; k < 5; k++) b.box('plain', [0.014, 0.03, 0.3], [fx, 2.02 - k * 0.13, boxZ + 0.85], { tint: '#e6f1fb' })
      b.box('plain', [0.014, 0.2, 0.3], [fx, 1.05, boxZ + 0.85], { tint: '#3d6fa8' })
      b.add('plain', new CylinderGeometry(0.07, 0.07, 0.016, 14), { position: [fx, 1.05, boxZ + 0.62], rotation: [0, 0, Math.PI / 2], tint: '#1f2b45' })
    }
    // 小屋造型的斜屋頂（白色、邊緣鏽蝕）
    for (const s of [-1, 1]) {
      b.box('plain', [W / 2 + 0.28, 0.05, boxL + 0.3], [s * (W / 4 + 0.08), 2.55, boxZ], { rotation: [0, 0, -s * 0.42], tint: '#f0ede4' })
      b.box('plain', [0.06, 0.06, boxL + 0.3], [s * (W / 2 + 0.12), 2.38, boxZ], { tint: '#a8653a' })
    }
    for (const zz of [boxZ - boxL / 2 - 0.15, boxZ + boxL / 2 + 0.15]) {
      const tri = new Shape()
      tri.moveTo(-W / 2 - 0.12, 0)
      tri.lineTo(W / 2 + 0.12, 0)
      tri.lineTo(0, 0.42)
      tri.lineTo(-W / 2 - 0.12, 0)
      b.extrude('plain', tri, 0.04, { position: [0, 2.28, zz - 0.02], tint: '#ece8dd' })
    }
    // 後面掀起的側板（像遮陽棚）
    b.box('plain', [W - 0.1, 0.04, 0.7], [0, 2.3, -L / 2 - 0.25], { rotation: [0.15, 0, 0], tint: '#f2f1ec' })
    b.box('steel', [0.03, 0.03, 0.75], [W / 2 - 0.1, 2.0, -L / 2 - 0.2], { rotation: [0.5, 0, 0], tint: '#a9adae' })
  })
  // 車身上的字（從巷子這一側看；在場記板格子下方）
  const sideX = x + width / 2 + 0.06
  const boxCenter = z + length / 2 - (-length / 2 + (length - 1.5) / 2 + 0.1)
  b.addSign({ text: '導演的豆花車', style: 'truckBlue', width: 1.2, height: 0.22, position: [sideX, 0.98, boxCenter + 0.67], rotationY: Math.PI / 2 })
}

/* ── 遮擋方塊、碰撞與觀賞範圍 ───────────── */

/** 鏡頭的遮擋方塊：店（騎樓上方的二樓、牆、室內天花、櫃台）、鄰棟、豆花車；回傳豆花櫃台方塊的範圍 */
function registerBlockers(b) {
  const { half, depth, arcade, wallT, groundH, parapet, ceiling, columns, door, counterZ, backZ } = SHOP
  b.group(SHOP.origin, SHOP.rotationY, () => {
    const front = -arcade
    // 一樓正面的木作（門兩側與門楣）
    b.addBlocker(-half, door[0], 0, groundH, front - wallT, front)
    b.addBlocker(door[1], half, 0, groundH, front - wallT, front)
    b.addBlocker(door[0], door[1], 2.55, groundH, front - wallT, front)
    // 騎樓兩側的端牆、柱
    for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - 0.5, s < 0 ? -half + 0.5 : half, 0, groundH, front, 0.05)
    for (const x of columns) b.addBlocker(x - 0.32, x + 0.32, 0, groundH, -0.72, -0.08)
    // 二樓以上（包含騎樓上方）、側牆、後牆、店內天花
    b.addBlocker(-half - 0.06, half + 0.06, groundH - 0.05, parapet, -depth, 0.3)
    for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, groundH, -depth, front)
    b.addBlocker(-half, half, 0, groundH, -depth, backZ)
    b.addBlocker(-half, half, ceiling, groundH, -depth, front)
    // 側邊突出的招牌
    b.addBlocker(half - 0.4, half + 0.05, groundH + 0.6, groundH + 3.4, 0.4, 1.55)
    // 推開的門扇（貼著前牆內側）
    b.addBlocker(door[1] - 0.04, door[1] + 0.86, 0, 2.5, front - wallT - 0.1, front - wallT)
  })
  // 巷子後方的平頂老屋：只擋鏡頭，屬於豆花店這棟建築（觀賞模式點它們時聚焦豆花店的立面）
  for (const [x0, x1, z0, z1, h] of FILLERS) b.addBlocker(x0, x1, 0, h + 0.45, z0, z1)
  // 豆花櫃台（另外成為一個可以點選、聚焦的目標）
  const start = b.blockers.length
  b.group(SHOP.origin, SHOP.rotationY, () => {
    b.addBlocker(-SHOP.half + SHOP.wallT, SHOP.half - SHOP.wallT, 0, 1.32, counterZ - 0.7, counterZ)
  })
  const counter = { start, end: b.blockers.length }
  // 鄰棟與豆花車（以巷子座標）：各自成為一棟可以點選、聚焦的建築，不算在豆花店裡
  const { half: lh, length } = LANE
  const neighbours = []
  const add = (id, box, focus) => {
    const first = b.blockers.length
    b.addBlocker(...box)
    neighbours.push({ id, range: { start: first, end: b.blockers.length }, focus })
  }
  add('action-bar-lane-brick', [lh, lh + 9, 0, 7.6, 11, 15.8], laneFacade(b, lh, 13.4, -1, 0, 4.8, 7.6))
  add('action-bar-lane-shed', [lh, lh + 7, 0, 3.8, 21.8, length], laneFacade(b, lh, 23.4, -1, 0, 3.2, 3.8))
  add('action-bar-lane-tan', [-lh - 5.4, -lh, 0, 11, 11, length], laneFacade(b, -lh, 18, 1, 0, 14, 11))
  add('action-bar-lane-end', [-5, 5, 0, 6.8, length, length + 7], laneFacade(b, 0, length, 0, -1, 7, 6.8))

  add(
    'action-bar-truck',
    [TRUCK.x - TRUCK.width / 2 - 0.1, TRUCK.x + TRUCK.width / 2 + 0.1, 0, 2.85, TRUCK.z - 0.4, TRUCK.z + TRUCK.length + 0.1],
    { ...laneFacade(b, TRUCK.x + TRUCK.width / 2, TRUCK.z + TRUCK.length / 2, 1, 0, TRUCK.length, 2.85), viewHeight: 1.6, maxDistance: 6 },
  )
  return { counter, neighbours }
}

/** 巷子裡一面立面的聚焦資料：立面中心（巷子座標）、朝向、寬度與高度 → 世界座標 */
function laneFacade(b, x, z, fx, fz, width, height) {
  const c = b.transformPoint(x, 0, z)
  const f = b.transformPoint(x + fx, 0, z + fz).sub(c)
  return { center: { x: c.x, z: c.z }, forward: { x: f.x, z: f.z }, width, height, viewHeight: Math.min(3.4, height * 0.5), maxDistance: 9, maxPitch: 0.4 }
}

/** 巷子座標的矩形 → 世界座標的軸對齊矩形 */
function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/** 店的本地矩形 → 巷子座標的矩形（店轉了 -90 度） */
function shopRect(x0, x1, z0, z1) {
  const a = shopToLane(x0, z0)
  const c = shopToLane(x1, z1)
  return [Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])]
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：224巷、店的騎樓、大門與店內（櫃台前）；
 * 障礙物是豆花車、機車、圓柱、騎樓下的菜單架與導演椅、店內的桌椅與展示桌。
 */
export function actionBarCollision(config, transform) {
  const { half, length } = LANE
  const S = SHOP
  const rect = (...args) => worldRect(transform, ...args)
  const fromShop = (x0, x1, z0, z1) => rect(...shopRect(x0, x1, z0, z1))
  const walkable = [
    // 巷子（伸進迪化街的路面一段，與街道的可行走範圍重疊，才走得進去）
    rect(-half, half, -3.4, length - 0.1),
    // 騎樓（與巷子重疊）
    fromShop(-S.half + 0.5, S.half - 0.5, -S.arcade + 0.05, 1.4),
    // 大門（前後各伸進騎樓與店內一段）
    fromShop(S.door[0] + 0.02, S.door[1] - 0.02, -S.arcade - 1.1, -S.arcade + 0.9),
    // 店內（櫃台前方）
    fromShop(-S.half + S.wallT + 0.02, S.half - S.wallT - 0.02, S.counterZ + 0.05, -S.arcade - S.wallT - 0.02),
  ]
  const obstacles = [
    // 豆花車與巷邊的機車
    rect(TRUCK.x - TRUCK.width / 2 - 0.05, TRUCK.x + TRUCK.width / 2 + 0.05, TRUCK.z - 0.35, TRUCK.z + TRUCK.length + 0.05),
    rect(half - 0.85, half - 0.05, 11.7, 13.2),
    rect(half - 0.85, half - 0.05, 13.6, 15.1),
    // 騎樓的圓柱、菜單架、黑板、導演椅與小桌、盆栽
    ...S.columns.map((x) => fromShop(x - 0.33, x + 0.33, -0.73, -0.07)),
    fromShop(1.4, 2.1, -1.45, -0.85),
    fromShop(2.05, 2.55, -1.8, -1.3),
    fromShop(-2.85, -1.38, -1.8, -0.65),
    // 巷底的兩盆盆栽與巷口路名牌的柱子
    rect(-3.3, -2.5, 24.1, 25),
    rect(3.0, 3.5, 24.15, 25),
    rect(half - 0.38, half - 0.22, -0.68, -0.52),
    // 推開貼在前牆內側的門扇
    fromShop(S.door[1] - 0.06, S.door[1] + 0.9, -S.arcade - S.wallT - 0.13, -S.arcade - S.wallT + 0.02),
    // 店內：櫥窗前的豆花展示桌、右側的長椅與兩張小桌、兩張圓凳、左後方的攝影機腳架與飲水櫃
    fromShop(-2.35, -1.2, -3.15, -2.25),
    fromShop(0.77, 1.13, -3.48, -3.12),
    fromShop(0.77, 1.13, -5.28, -4.92),
    fromShop(2.15, 2.8, -6.2, -2.3),
    fromShop(1.15, 1.85, -3.65, -2.95),
    fromShop(1.15, 1.85, -5.45, -4.75),
    fromShop(-2.8, -2.15, -6.2, -5.55),
    fromShop(-2.8, -2.35, -4.6, -3.5),
  ]
  return { walkable, obstacles }
}

/** 店與巷子的佔地（範圍內不產生遠景房屋與樹） */
export function actionBarFootprint(transform) {
  return worldRect(transform, -LANE.half - 8, LANE.half + 10.5, 10.2, LANE.length + 8)
}

/* ── 主程式 ─────────────────────────────── */

export function buildActionBar(b) {
  lane(b)
  b.group(SHOP.origin, SHOP.rotationY, () => shopShell(b))
  brickNeighbour(b)
  whiteShed(b)
  tanBuilding(b)
  laneEnd(b)
  fillerBlocks(b)
  beanFlowerTruck(b)
  // 巷邊停放的機車
  scooter(b, LANE.half - 0.45, 12.45, Math.PI, '#d6d9d9')
  scooter(b, LANE.half - 0.45, 14.35, Math.PI, '#2f3236')
  interiorSigns(b)
  const { counter, neighbours } = registerBlockers(b)

  const S = SHOP
  const local = (sx, y, sz) => {
    const [lx, lz] = shopToLane(sx, sz)
    const p = b.transformPoint(lx, y, lz)
    return [p.x, p.y, p.z]
  }
  const toWorld = (lx, lz) => {
    const p = b.transformPoint(lx, 0, lz)
    return { x: p.x, z: p.z }
  }
  const dir = (sx, sz) => {
    const [ax, az] = shopToLane(0, 0)
    const [bx, bz] = shopToLane(sx, sz)
    const p = b.transformPoint(bx, 0, bz).sub(b.transformPoint(ax, 0, az))
    return { x: p.x, z: p.z }
  }
  const zone = (x0, x1, z0, z1) => {
    const [a, c, d, e] = shopRect(x0, x1, z0, z1)
    const p = toWorld(a, d)
    const q = toWorld(c, e)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  const laneZone = (minX, maxX, minZ, maxZ) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  const counterFront = local(0.15, 0, S.counterZ)
  const doorPoint = local((S.door[0] + S.door[1]) / 2, 0, -S.arcade)

  return {
    groundHeight: S.groundH,
    topHeight: S.parapet,
    // 店名提示在櫃台上方（走進店裡才出現）；屋頂標記在立面上方
    anchors: { prompt: local(0.15, 1.95, S.counterZ + 0.3), marker: local(0, S.parapet + 2.6, -1.0) },
    // 觀賞模式聚焦：巷子很窄，從巷子裡斜看立面（騎樓、招牌與二樓窗）
    focus: {
      center: { x: local(0, 0, 0)[0], z: local(0, 0, 0)[2] },
      forward: dir(0, 1),
      width: S.half * 2,
      height: S.parapet,
      viewHeight: 3.6,
      maxDistance: 9,
      maxPitch: 0.4,
    },
    // 豆花櫃台：店裡的細部目標（detail）——探索時在附近點它開啟介紹，觀賞模式點它近距離聚焦豆花；
    // 店家名錄的「聚焦建築」仍然聚焦立面
    subStores: [
      {
        id: 'action-bar-douhua',
        storeId: 'action-bar',
        detail: true,
        range: counter,
        focus: {
          center: { x: counterFront[0], z: counterFront[2] },
          forward: dir(0, 1),
          width: 1.6,
          height: 1.4,
          viewHeight: 1.12,
          maxDistance: 2.3,
          maxPitch: 0.6,
          maxYawOffset: 0.6,
        },
      },
      ...neighbours.map(({ id, range, focus }) => ({ id, storeId: null, range, focus })),
    ],
    interiors: [
      {
        id: 'action-bar',
        ...zone(-S.half + S.wallT, S.half - S.wallT, S.backZ, -S.arcade - S.wallT),
        ceiling: S.ceiling,
        // 入口：騎樓與騎樓前 1.5 公尺的巷子；越靠近大門越接近室內鏡頭（巷子窄，過渡的距離較短）
        entry: zone(-S.half + 0.4, S.half - 0.4, -S.arcade - S.wallT, 1.5),
        entryHold: 0.6,
        entryRamp: 2.8,
        door: { x: doorPoint[0], z: doorPoint[2] },
        // 小小的店：鏡頭更近、更低，注視點在胸口附近
        camera: { distance: 3.0, maxHeight: 2.45, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        // 在店裡進入建築觀賞模式：鏡頭離注視點近一點（店只有約 4 公尺深）
        viewerStart: { distance: 2.6 },
        loadRadius: 18,
        showRadius: 24,
      },
    ],
    // 觀賞模式：注視點可以進到巷子、騎樓與店內（店內不超過天花板）
    viewerRegions: [
      { ...laneZone(-LANE.half + 0.4, LANE.half - 0.2, -2.4, LANE.length - 0.6), maxY: 7 },
      // 騎樓與大門的注視點壓在門楣下方（門楣 2.55 公尺，再留注視點的間距），才穿得過大門
      { ...zone(-S.half + 0.6, S.half - 0.6, -S.arcade + 0.1, 1.2), maxY: 2.05, cameraMaxY: 3.3 },
      { ...zone(S.door[0] + 0.2, S.door[1] - 0.2, -S.arcade - 0.6, -S.arcade + 0.2), maxY: 2.0, cameraMaxY: 2.9 },
      { ...zone(-S.half + S.wallT + 0.4, S.half - S.wallT - 0.4, S.counterZ + 0.3, -S.arcade - S.wallT - 0.3), maxY: 2.1, cameraMaxY: 2.75 },
    ],
    viewerBounds: { maxZ: toWorld(0, LANE.length + 3).z },
    // 窄巷與騎樓：人物可以貼著兩側的牆、柱與豆花車走，第三人稱鏡頭在這裡停在障礙物前面
    followAreas: [laneZone(-LANE.half, LANE.half, LANE.mouth, LANE.length), zone(-S.half, S.half, -S.arcade - S.wallT, 0.05)],
  }
}

/* ── 店內的看板文字（屬於街景的招牌層；看板本身在 actionBarInterior.js） ── */

function interiorSigns(b) {
  b.group(SHOP.origin, SHOP.rotationY, () => {
    // 文字貼在 actionBarInterior.js 的看板表面前方（室內牆面在 ±(half - wallT - 0.04)）
    const L = -SHOP.half + SHOP.wallT + 0.1
    const R = SHOP.half - SHOP.wallT - 0.08
    const B = SHOP.backZ + 0.08
    // 左牆：公益豆花看板（懸掛的留言本）與兒童影像紀錄學習營看板（看板上的標題依實地照片）
    b.addSign({ text: '導演的公益豆花', style: 'boardInk', width: 1.3, height: 0.24, position: [L, 2.62, -5.05], rotationY: Math.PI / 2 })
    b.addSign({ text: '《逗。留。台灣》', style: 'boardInk', width: 1.3, height: 0.22, position: [L, 2.6, -3.15], rotationY: Math.PI / 2 })
    b.addSign({ text: '免費兒童影像紀錄學習營', style: 'boardInk', width: 1.3, height: 0.14, position: [L, 2.41, -3.15], rotationY: Math.PI / 2 })
    // 後牆：菜單與「豆花」黑板
    b.addSign({ text: '豆花', style: 'chalk', width: 0.7, height: 0.3, position: [-1.2, 2.45, B] })
    b.addSign({ text: '傳統豆花・麥芽糖水・地瓜粉圓・粉粿', style: 'boardWhite', width: 2.2, height: 0.16, position: [0.6, 2.62, B] })
    // 右牆：小朋友的畫
    b.addSign({ text: '小朋友的畫', style: 'label', width: 0.8, height: 0.15, position: [R, 3.0, -4.2], rotationY: -Math.PI / 2 })
  })
}
