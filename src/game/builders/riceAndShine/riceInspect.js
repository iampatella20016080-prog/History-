import { BoxGeometry, ConeGeometry, CylinderGeometry, PlaneGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 迪化街 329 號酒樓繁華版店內可以近看的新器物（第 11 階段第 9 項）的 3D 檢視模型：米箱、麻袋、米籮。
 * 形制依據與分層資訊在 data/riceAndShineObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * detail：精緻畫質多一些木紋與米粒。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

const WOOD = '#9a7348'
const WOOD_DARK = '#6a4b2e'
const WOOD_LIGHT = '#b08a5c'
const IRON = '#3a3634'
const WHITE = '#f1ecdc'
const BROWN = '#c9a878'

/**
 * 米箱：木板釘的長箱，隔板分成白米與糙米兩格，後面的牆板高、前緣低；兩片掀起的蓋子靠在後牆板上。
 * 動作 scoop：箱口前的木斗從白米裡舀起一斗（升高、轉向觀眾）；尺寸是示意（記憶庫「傳統米店」只說木製大米箱）。
 */
function buildRiceBin({ detail }) {
  const L = 1.0 // 長（x）
  const D = 0.56 // 深（z）
  const H = 0.4
  const T = 0.03
  const bin = new Parts()
  // 箱底與四面
  bin.add(WOOD_DARK, box(L, 0.04, D), { p: [0, 0.06, 0] })
  bin.add(WOOD, box(L, H, T), { p: [0, H / 2 + 0.04, D / 2 - T / 2] }) // 前板
  bin.add(WOOD, box(L, H + 0.2, T), { p: [0, (H + 0.2) / 2 + 0.04, -D / 2 + T / 2] }) // 後板（較高）
  for (const s of [-1, 1]) bin.add(WOOD_LIGHT, box(T, H + 0.02, D), { p: [s * (L / 2 - T / 2), H / 2 + 0.05, 0] })
  // 中間的隔板
  bin.add(WOOD_DARK, box(T, H - 0.02, D - 0.06), { p: [0, H / 2 + 0.03, 0] })
  // 米：白米（左格）與糙米（右格），米面微微隆起
  const heap = (x, color, k) => bin.add(color, new SphereGeometry(1, detail ? 14 : 8, 8), { p: [x, H - 0.03, 0], s: [L / 4 - 0.03, 0.09 + k, D / 2 - 0.05] })
  heap(-L / 4, WHITE, 0.01)
  heap(L / 4, BROWN, 0.0)
  // 前板的鐵條與木條
  for (const x of [-L / 2 + 0.1, L / 2 - 0.1]) bin.add(IRON, box(0.025, H - 0.02, 0.008), { p: [x, H / 2 + 0.05, D / 2 + 0.004] })
  bin.add(WOOD_LIGHT, box(L + 0.02, 0.025, 0.04), { p: [0, H + 0.05, D / 2] })
  if (detail) {
    for (let i = 0; i < 4; i++) bin.add('#7d5a38', box(L - 0.06, 0.004, 0.006), { p: [0, 0.12 + i * 0.08, D / 2 + 0.002] })
    for (let i = 0; i < 12; i++) bin.add(i % 2 ? WHITE : BROWN, new SphereGeometry(0.006, 5, 4), { p: [-0.42 + i * 0.077, H + 0.065, D / 2 - 0.06], s: [1.6, 0.6, 1] })
  }
  // 掀起的蓋子（兩片，靠在後牆板上）與鉸鏈
  const lids = new Parts()
  for (const s of [-1, 1]) {
    lids.add(WOOD, box(L / 2 - 0.05, 0.03, 0.5), { p: [s * (L / 4), H + 0.34, -D / 2 - 0.02], r: [1.25, 0, 0] })
    lids.add(IRON, box(0.1, 0.02, 0.02), { p: [s * (L / 4), H + 0.27, -D / 2 + 0.02] })
  }
  // 木斗（舀米用）：靠在箱口前緣的白米格裡
  const dou = new Parts()
  dou.add('#a9814f', cyl(0.1, 0.075, 0.1, 4, true), { p: [-L / 4, H + 0.03, D / 2 - 0.12], r: [0, Math.PI / 4, 0] })
  dou.add(WHITE, box(0.12, 0.012, 0.12), { p: [-L / 4, H + 0.06, D / 2 - 0.12], r: [0, Math.PI / 4, 0] })
  dou.add(IRON, box(0.016, 0.04, 0.016), { p: [-L / 4 + 0.07, H + 0.07, D / 2 - 0.12 + 0.07] })
  return {
    radius: 1.0,
    centerY: 0.44,
    viewPitch: 0.45,
    parts: [
      { id: 'bin', geometry: bin.build() },
      { id: 'lids', geometry: lids.build() },
      { id: 'dou', geometry: dou.build(), pivot: [-L / 4, H + 0.03, D / 2 - 0.12], animate: { action: 'scoop', kind: 'slide', axis: 'y', from: 0, to: 0.2, drift: [0.22, 0, 0.22] } },
    ],
  }
}

const JUTE = '#b89f74'
const JUTE_DARK = '#9c8660'
const STRIPE = '#4f7d52'
const PADDY = '#c9a24e'
const ROPE = '#a98f62'
const BAMBOO = '#c79c5f'
const BAMBOO_DARK = '#9e7444'

/** 麻袋的形狀：圓角方塊（|x/a|^3 + |y/b|^3 + |z/c|^3 = 1），袋身與貼在正面的綠線、縫線用同一個曲面 */
const SACK = { a: 0.33, b: 0.33, c: 0.2, p: 3, y: 0.33 }

function sackBody(seg) {
  const { a, b, c, p, y } = SACK
  const g = new SphereGeometry(1, seg, Math.round(seg * 0.75))
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const [dx, dy, dz] = [pos.getX(i), pos.getY(i), pos.getZ(i)]
    const t = (Math.abs(dx) ** p + Math.abs(dy) ** p + Math.abs(dz) ** p) ** (-1 / p)
    pos.setXYZ(i, dx * t * a, dy * t * b + y, dz * t * c)
  }
  g.computeVertexNormals()
  return g
}

/** 貼在袋身正面的一塊長條（中心 cx、cy，寬 w、高 h）：頂點順著曲面，浮起一點點 */
function sackPatch(w, h, cx, cy, segX, segY) {
  const { a, b, c, p, y } = SACK
  const g = new PlaneGeometry(w, h, segX, segY)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i) + cx
    const py = pos.getY(i) + cy
    const rest = Math.max(0, 1 - Math.abs(px / a) ** p - Math.abs(py / b) ** p)
    pos.setXYZ(i, px, py + y, c * rest ** (1 / p) + 0.003)
  }
  g.computeVertexNormals()
  return g
}

/**
 * 麻袋（臺史博 2002.005.0289：麻布大口袋，中間印一條綠色粗線）：鼓起的袋身、綠線，袋口束起來。
 * 動作 open：束袋口的那一截解開、放到旁邊的地上，露出裡面的稻穀；鼓起的形狀與綁法是示意。
 */
function buildJuteSack({ detail }) {
  const seg = detail ? 28 : 16
  const top = SACK.y + SACK.b
  const body = new Parts()
  body.add(JUTE, sackBody(seg), {})
  // 綠線（中間一條粗線）
  body.add(STRIPE, sackPatch(0.07, SACK.b * 1.8, 0, 0, 1, detail ? 24 : 14), {})
  // 袋口：收窄的頸，裡面是稻穀
  body.add(JUTE_DARK, cyl(0.1, 0.15, 0.08, seg, true), { p: [0, top + 0.02, 0] })
  body.add(PADDY, new SphereGeometry(0.095, 12, 6), { p: [0, top + 0.05, 0], s: [1, 0.4, 1] })
  // 麻布的橫向縫線與髒汙（精緻畫質）
  if (detail) {
    for (const cy of [-0.22, -0.08, 0.1, 0.24]) body.add(JUTE_DARK, sackPatch(0.56, 0.004, 0, cy, 14, 1), {})
    for (const [cx, cy, w, h] of [[-0.17, -0.14, 0.09, 0.06], [0.16, 0.13, 0.07, 0.09]]) body.add('#a58f68', sackPatch(w, h, cx, cy, 4, 4), {})
  }
  // 束袋口的那一截：一圈麻布與繩子
  const tie = new Parts()
  tie.add(JUTE_DARK, new ConeGeometry(0.13, 0.13, seg, 1, true), { p: [0, top + 0.1, 0], r: [Math.PI, 0, 0] })
  tie.add(JUTE, new CylinderGeometry(0.065, 0.065, 0.03, seg), { p: [0, top + 0.05, 0] })
  tie.add(ROPE, new TorusGeometry(0.075, 0.012, 5, 16), { p: [0, top + 0.05, 0], r: [Math.PI / 2, 0, 0] })
  return {
    radius: 0.75,
    centerY: 0.44,
    viewPitch: 0.25,
    parts: [
      { id: 'body', geometry: body.build() },
      { id: 'tie', geometry: tie.build(), pivot: [0, top + 0.05, 0], animate: { action: 'open', kind: 'slide', axis: 'y', from: 0, to: 0, drift: [0.36, -(top + 0.0), 0.12] } },
    ],
  }
}

/**
 * 米籮（臺史博 2003.001.0530：底四方、口圓、上闊下窄、圓腹，口框繫兩條繩供扁擔挑）：竹編的籮身與裡面的稻穀。
 * 動作 lift：連繩提起來掂一下；大小與繩子的綁法是示意。
 */
function buildCarryingBasket({ detail }) {
  const seg = detail ? 24 : 14
  const H = 0.35
  const R = 0.27
  const APEX = 0.24 // 兩條繩在籮口上方交會的高度
  const root = new Parts()
  root.add(BAMBOO_DARK, box(R * 1.28, 0.04, R * 1.28), { p: [0, 0.02, 0] })
  root.add(BAMBOO, cyl(R * 1.08, R * 0.74, H * 0.62, seg, true), { p: [0, H * 0.31, 0] })
  root.add(BAMBOO, cyl(R, R * 1.08, H * 0.38, seg, true), { p: [0, H * 0.81, 0] })
  root.add(BAMBOO_DARK, new TorusGeometry(R, 0.012, 5, seg), { p: [0, H, 0], r: [Math.PI / 2, 0, 0] })
  root.add(PADDY, new SphereGeometry(1, seg, 8), { p: [0, H - 0.05, 0], s: [R * 0.94, 0.07, R * 0.94] })
  // 竹篾的橫紋（精緻畫質）
  if (detail) for (let i = 0; i < 6; i++) root.add(BAMBOO_DARK, new TorusGeometry(R * (0.8 + i * 0.05), 0.003, 3, seg), { p: [0, 0.05 + i * 0.05, 0], r: [Math.PI / 2, 0, 0] })
  // 兩條繩：從籮口的四個點往上，在中央上方交會
  const reach = R * 0.96
  const tilt = Math.atan2(reach, APEX)
  const len = Math.hypot(reach, APEX)
  for (const a of [0, Math.PI / 2]) {
    for (const s of [-1, 1]) {
      root.add(ROPE, cyl(0.006, 0.006, len, 5), { p: [(Math.cos(a) * s * reach) / 2, H + APEX / 2, (Math.sin(a) * s * reach) / 2], r: [-Math.sin(a) * s * tilt, 0, Math.cos(a) * s * tilt] })
    }
  }
  root.add(ROPE, new TorusGeometry(0.022, 0.007, 5, 10), { p: [0, H + APEX + 0.015, 0] })
  return {
    radius: 0.58,
    centerY: 0.3,
    viewPitch: 0.3,
    parts: [{ id: 'root', geometry: root.build(), pivot: [0, 0, 0], animate: { action: 'lift', kind: 'slide', axis: 'y', from: 0, to: 0.1 } }],
  }
}

export const RICE_INSPECT_BUILDERS = {
  'rice-bin': buildRiceBin,
  'jute-sack': buildJuteSack,
  'carrying-basket': buildCarryingBasket,
}
