import { BoxGeometry, CylinderGeometry, IcosahedronGeometry, SphereGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 林華泰茶行各年代室內可以近看的器物（第 11 階段）的 3D 檢視模型：
 * 四方包、揀茶竹淺盤、炭焙火坑與焙籠、磅仔、窨茉莉花、評茶盤、大茶桶。
 * 形制依據與分層資訊在 data/linHuaTaiObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * detail：精緻畫質多一些小零件與段數；流暢畫質（false）零件與小動作相同。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

const PAPER = '#ecdfbf'
const PAPER_IN = '#f3ead2'
const SEAL = '#b23a2c'
const TEA = '#4a4034'
const TEA_GREEN = '#4f5233'
const BAMBOO = '#cdb27e'
const BAMBOO_DARK = '#a98d5c'
const RATTAN = '#8a6a42'
const BRICK = '#9a6450'
const HUSK = '#2b2622'
const EMBER = '#c4502c'
const IRON = '#3e4240'
const WOOD = '#a98058'
const DRUM = '#8d998c'

/** 四方包（依《農業周刊》：兩張方形毛邊紙包四兩茶、摺成長方形、蓋茶名與行號印）；動作 open：掀開上層的紙 */
function buildSquarePacket({ detail }) {
  const W = 0.12
  const D = 0.08
  const H = 0.04
  const body = new Parts()
  body.add(PAPER, box(W, 0.006, D), { p: [0, 0.003, 0] })
  for (const sz of [-1, 1]) body.add(PAPER, box(W, H, 0.004), { p: [0, H / 2, sz * (D / 2 - 0.002)] })
  for (const sx of [-1, 1]) body.add(PAPER, box(0.004, H, D), { p: [sx * (W / 2 - 0.002), H / 2, 0] })
  // 內襯的一張紙與裡面的茶
  body.add(PAPER_IN, box(W - 0.01, 0.003, D - 0.01), { p: [0, 0.008, 0] })
  body.add(TEA, box(W - 0.016, 0.022, D - 0.016), { p: [0, 0.02, 0] })
  for (let i = 0; i < (detail ? 9 : 4); i++) body.add(TEA_GREEN, new SphereGeometry(0.008, 6, 4), { p: [-0.04 + (i % 5) * 0.02, 0.032, -0.02 + Math.floor(i / 5) * 0.03], s: [1.4, 0.5, 0.8] })
  // 上層的紙（以後緣為樞軸掀開）：紙面、摺邊與兩個印
  const lid = new Parts()
  lid.add(PAPER, box(W + 0.004, 0.004, D + 0.004), { p: [0, H + 0.002, 0] })
  lid.add('#e2d3ae', box(W + 0.004, 0.004, 0.02), { p: [0, H + 0.005, D / 2 - 0.012] })
  lid.add(SEAL, box(0.03, 0.002, 0.03), { p: [0.025, H + 0.0055, -0.008] })
  lid.add(SEAL, box(0.012, 0.002, 0.045), { p: [-0.03, H + 0.0055, -0.005] })
  if (detail) lid.add('#f6efd8', box(0.022, 0.0025, 0.022), { p: [0.025, H + 0.006, -0.008] })
  return {
    radius: 0.11,
    centerY: 0.03,
    viewPitch: -0.55,
    parts: [
      { id: 'packet', geometry: body.build() },
      { id: 'lid', geometry: lid.build(), pivot: [0, H, -D / 2], animate: { action: 'open', axis: 'x', from: 0, to: -2.4 } },
    ],
  }
}

/** 揀茶的竹淺盤（做法借自臺史博竹編大篩）：盤、毛茶與挑出來的茶梗；動作 pick：茶梗挑到盤邊 */
function buildSortingTray({ detail }) {
  const R = 0.33
  const seg = detail ? 28 : 16
  const tray = new Parts()
  tray.add(BAMBOO, cyl(R, R - 0.02, 0.012, seg), { p: [0, 0.006, 0] })
  tray.add(BAMBOO_DARK, cyl(R + 0.012, R + 0.012, 0.06, seg, true), { p: [0, 0.03, 0] })
  tray.add(RATTAN, cyl(R + 0.018, R + 0.018, 0.014, seg, true), { p: [0, 0.058, 0] })
  if (detail) for (let i = 0; i < 8; i++) tray.add(BAMBOO_DARK, box(2 * R * Math.sqrt(1 - ((i - 3.5) / 4.2) ** 2), 0.002, 0.006), { p: [0, 0.013, (i - 3.5) * 0.075] })
  const tea = new Parts()
  tea.add(TEA, cyl(R - 0.04, R - 0.02, 0.025, seg), { p: [0, 0.024, 0] })
  for (let i = 0; i < (detail ? 26 : 10); i++) {
    const a = i * 2.4
    const r = 0.04 + ((i * 0.37) % 1) * 0.22
    tea.add(i % 3 ? TEA : TEA_GREEN, new SphereGeometry(0.018, 6, 4), { p: [Math.cos(a) * r, 0.04, Math.sin(a) * r], s: [1.5, 0.45, 0.9] })
  }
  // 茶梗與黃片（挑出來時滑到盤邊）
  const stalks = new Parts()
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1
    stalks.add('#9a8358', box(0.05, 0.005, 0.006), { p: [Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12], r: [0, a, 0] })
  }
  stalks.add('#b8a046', new SphereGeometry(0.014, 6, 4), { p: [0.06, 0.05, -0.08], s: [1.4, 0.3, 1] })
  return {
    radius: 0.36,
    centerY: 0.04,
    viewPitch: -0.75,
    parts: [
      { id: 'tray', geometry: tray.build() },
      { id: 'tea', geometry: tea.build() },
      { id: 'stalks', geometry: stalks.build(), pivot: [0, 0.05, 0], animate: { action: 'pick', kind: 'slide', axis: 'y', from: 0, to: 0.06, drift: [0.42, -0.03, 0.05] } },
    ],
  }
}

/** 炭焙火坑與焙籠（官網家族口述：坑徑約兩尺、深兩尺半；焙籠高約兩尺的竹編圓筒，中央一片竹盤）；動作 lift */
function buildCharcoalPit({ detail }) {
  const seg = detail ? 24 : 14
  const T = 0.18
  const pit = new Parts()
  // 一段磚砌臺面（四周切開的樣子）、坑口的磚緣、稻糠與透出的炭火
  pit.add(BRICK, box(0.95, T, 0.95), { p: [0, T / 2, 0] })
  pit.add('#8c8070', box(0.99, 0.03, 0.99), { p: [0, T + 0.015, 0] })
  pit.add('#8f604a', cyl(0.39, 0.39, 0.04, seg), { p: [0, T + 0.04, 0] })
  pit.add(HUSK, cyl(0.3, 0.3, 0.045, seg), { p: [0, T + 0.045, 0] })
  pit.add(EMBER, cyl(0.1, 0.1, 0.02, 10), { p: [0, T + 0.065, 0] })
  if (detail) {
    for (let i = 0; i < 7; i++) pit.add(EMBER, new SphereGeometry(0.018, 6, 4), { p: [Math.cos(i * 0.9) * 0.18, T + 0.068, Math.sin(i * 0.9) * 0.18], s: [1, 0.4, 1] })
    // 臺面的磚縫
    for (let i = 1; i < 4; i++) pit.add('#7a4c3c', box(0.952, 0.006, 0.006), { p: [0, i * (T / 4), 0.476] })
  }
  const y0 = T + 0.06
  const H = 0.6
  const basket = new Parts()
  basket.add(BAMBOO_DARK, cyl(0.34, 0.34, H, seg, true), { p: [0, y0 + H / 2, 0] })
  basket.add('#8f7448', cyl(0.35, 0.35, 0.035, seg, true), { p: [0, y0 + H - 0.018, 0] })
  basket.add('#8f7448', cyl(0.35, 0.35, 0.035, seg, true), { p: [0, y0 + 0.018, 0] })
  basket.add(BAMBOO, cyl(0.32, 0.32, 0.02, seg), { p: [0, y0 + H / 2, 0] })
  basket.add(TEA, cyl(0.3, 0.3, 0.045, seg), { p: [0, y0 + H / 2 + 0.032, 0] })
  if (detail) for (let i = 0; i < 6; i++) basket.add(BAMBOO, cyl(0.343, 0.343, 0.008, seg, true), { p: [0, y0 + 0.09 + i * 0.085, 0] })
  return {
    radius: 0.62,
    centerY: 0.42,
    parts: [
      { id: 'pit', geometry: pit.build() },
      { id: 'basket', geometry: basket.build(), pivot: [0, y0, 0], animate: { action: 'lift', kind: 'slide', axis: 'y', from: 0, to: 0.5, drift: [0.62, 0, 0.1] } },
    ],
  }
}

/** 磅仔（臺史博館方說明：鐵或銅製、四個輪子、平臺與秤桿）；動作 weigh：秤錘沿秤桿滑到平衡、秤桿擺平 */
function buildPlatformScale({ detail }) {
  const frame = new Parts()
  frame.add(IRON, box(0.62, 0.1, 0.46), { p: [0, 0.11, 0] })
  frame.add(WOOD, box(0.58, 0.025, 0.42), { p: [0, 0.172, 0] })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) frame.add('#222222', cyl(0.045, 0.045, 0.03, 12), { p: [sx * 0.24, 0.045, sz * 0.2], r: [Math.PI / 2, 0, 0] })
  // 立柱與秤桿的支點
  frame.add(IRON, box(0.06, 0.95, 0.06), { p: [-0.27, 0.62, 0] })
  frame.add(IRON, box(0.08, 0.06, 0.08), { p: [-0.27, 1.1, 0] })
  // 秤上的一袋茶
  frame.add('#ddd0b0', new SphereGeometry(0.17, detail ? 14 : 8, detail ? 10 : 6), { p: [0.02, 0.32, 0], s: [1.1, 0.85, 0.9] })
  frame.add('#c9b98e', cyl(0.03, 0.05, 0.08, 6), { p: [0.02, 0.48, 0] })
  if (detail) for (let i = 0; i < 4; i++) frame.add('#2a2c2a', cyl(0.012, 0.012, 0.012, 6), { p: [-0.2 + i * 0.13, 0.11, 0.232], r: [Math.PI / 2, 0, 0] })
  // 秤桿（擺動）與刻度
  const beam = new Parts()
  beam.add(IRON, box(0.56, 0.025, 0.025), { p: [0.0, 1.13, 0] })
  for (let i = 0; i < (detail ? 10 : 5); i++) beam.add('#c9c2b0', box(0.003, 0.012, 0.027), { p: [-0.18 + i * (detail ? 0.045 : 0.09), 1.142, 0] })
  beam.add(IRON, box(0.012, 0.15, 0.012), { p: [0.27, 1.06, 0] })
  beam.add('#575a56', cyl(0.05, 0.05, 0.015, 12), { p: [0.27, 0.98, 0] })
  // 秤錘（沿秤桿滑動）
  const poise = new Parts()
  poise.add('#575a56', box(0.05, 0.06, 0.05), { p: [-0.15, 1.13, 0] })
  return {
    radius: 0.62,
    centerY: 0.6,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'beam', geometry: beam.build(), pivot: [-0.27, 1.13, 0], animate: { action: 'weigh', axis: 'z', from: 0.08, to: 0 } },
      { id: 'poise', geometry: poise.build(), pivot: [-0.15, 1.13, 0], animate: { action: 'weigh', kind: 'slide', axis: 'x', from: 0, to: 0.26 } },
    ],
  }
}

/** 窨茉莉花（茶與花層層鋪疊；器具查無，竹蓆是示意）；動作 sift：最上層的花篩出、移到一旁 */
function buildJasmineScenting({ detail }) {
  const mat = new Parts()
  mat.add('#c9ad74', box(0.7, 0.012, 0.6), { p: [0, 0.006, 0] })
  if (detail) for (let i = 0; i < 9; i++) mat.add('#b39760', box(0.7, 0.002, 0.008), { p: [0, 0.013, -0.27 + i * 0.068] })
  // 層層鋪疊：茶、花、茶、花、茶（切開的一角看得到層次）
  const layers = [TEA, '#f1ede0', '#55492f', '#efeadb', TEA]
  layers.forEach((color, i) => mat.add(color, box(0.56 - i * 0.05, 0.03, 0.46 - i * 0.04), { p: [0, 0.027 + i * 0.03, 0] }))
  const flowers = new Parts()
  const bud = () => new IcosahedronGeometry(0.014, detail ? 1 : 0)
  for (let i = 0; i < (detail ? 34 : 16); i++) {
    const x = -0.17 + ((i * 0.37) % 1) * 0.34
    const z = -0.14 + ((i * 0.61) % 1) * 0.28
    flowers.add(i % 5 ? '#f7f4ea' : '#efe6c4', bud(), { p: [x, 0.185, z], s: [1, 1.5, 1] })
  }
  return {
    radius: 0.42,
    centerY: 0.1,
    viewPitch: -0.6,
    parts: [
      { id: 'heap', geometry: mat.build() },
      { id: 'flowers', geometry: flowers.build(), pivot: [0, 0.185, 0], animate: { action: 'sift', kind: 'slide', axis: 'y', from: 0, to: 0.12, drift: [0.48, -0.17, 0] } },
    ],
  }
}

/** 評茶盤（審茶盤：早期木製、方形、可盛 150–200 公克，有倒茶樣的缺口）；動作 tilt：抬起一邊倒出茶樣 */
function buildTastingTray({ detail }) {
  const S = 0.24
  const tray = new Parts()
  tray.add(WOOD, box(S, 0.01, S), { p: [0, 0.005, 0] })
  for (const sz of [-1, 1]) tray.add('#9a7048', box(S, 0.03, 0.012), { p: [0, 0.02, sz * (S / 2 - 0.006)] })
  tray.add('#9a7048', box(0.012, 0.03, S - 0.024), { p: [-(S / 2 - 0.006), 0.02, 0] })
  // 有缺口的一邊（前緣 +x 中間留一段）
  for (const sz of [-1, 1]) tray.add('#9a7048', box(0.012, 0.03, 0.08), { p: [S / 2 - 0.006, 0.02, sz * 0.068] })
  tray.add(TEA_GREEN, box(S - 0.06, 0.02, S - 0.06), { p: [-0.01, 0.02, 0] })
  for (let i = 0; i < (detail ? 18 : 7); i++) tray.add(i % 2 ? TEA : TEA_GREEN, new SphereGeometry(0.012, 6, 4), { p: [-0.07 + ((i * 0.37) % 1) * 0.12, 0.032, -0.07 + ((i * 0.61) % 1) * 0.14], s: [1.3, 0.6, 1] })
  if (detail) tray.add('#6f5034', box(S - 0.03, 0.002, 0.004), { p: [0, 0.0105, 0.05] })
  return {
    radius: 0.17,
    centerY: 0.03,
    viewPitch: -0.55,
    parts: [{ id: 'tray', geometry: tray.build(), pivot: [S / 2, 0, 0], animate: { action: 'tilt', axis: 'z', from: 0, to: -0.45 } }],
  }
}

/** 大茶桶（官網照片：灰綠色的圓鐵桶、平而略凸的蓋、蓋上紅字的茶名與價碼）；動作 open：桶蓋掀起移到一旁 */
function buildTeaDrum({ detail }) {
  const R = 0.38
  const H = 1.05
  const seg = detail ? 32 : 18
  const drum = new Parts()
  drum.add(DRUM, cyl(R, R, H, seg, true), { p: [0, H / 2, 0] })
  drum.add('#7a8679', cyl(R - 0.01, R - 0.01, 0.01, seg), { p: [0, 0.005, 0] })
  for (const t of [0.1, 0.9]) drum.add('#76827a', cyl(R + 0.012, R + 0.012, 0.035, seg, true), { p: [0, H * t, 0] })
  // 桶裡的茶與一把金屬茶鏟
  drum.add(TEA_GREEN, cyl(R - 0.01, R - 0.01, 0.02, seg), { p: [0, H - 0.12, 0] })
  for (let i = 0; i < (detail ? 20 : 8); i++) drum.add(i % 2 ? TEA : TEA_GREEN, new SphereGeometry(0.02, 6, 4), { p: [-0.25 + ((i * 0.37) % 1) * 0.5, H - 0.105, -0.25 + ((i * 0.61) % 1) * 0.5], s: [1.4, 0.5, 1] })
  drum.add('#b8bcb8', box(0.12, 0.006, 0.16), { p: [0.08, H - 0.1, 0.05], r: [0, 0.4, 0.1] })
  drum.add('#b8bcb8', cyl(0.012, 0.012, 0.22, 8), { p: [0.15, H - 0.02, 0.15], r: [0.6, 0.4, -0.5] })
  if (detail) for (let i = 0; i < 3; i++) drum.add('#6c776d', box(0.006, H * 0.75, 0.004), { p: [Math.cos(i * 2.1) * (R + 0.001), H / 2, Math.sin(i * 2.1) * (R + 0.001)], r: [0, -i * 2.1, 0] })
  // 桶蓋：平而略凸、蓋鈕、紅漆的筆畫
  const lid = new Parts()
  lid.add('#97a395', cyl(R + 0.016, R + 0.02, 0.035, seg), { p: [0, H + 0.0175, 0] })
  lid.add('#9eaa9c', cyl(R * 0.7, R + 0.01, 0.014, seg), { p: [0, H + 0.042, 0] })
  lid.add('#5d675e', cyl(0.035, 0.035, 0.025, 10), { p: [0, H + 0.06, 0] })
  const strokes = detail ? 5 : 3
  for (let i = 0; i < strokes; i++) lid.add(SEAL, box(R * (0.85 - i * 0.12), 0.004, 0.03), { p: [-0.02, H + 0.051, -R * 0.4 + i * (R * 0.8) / (strokes - 1)], r: [0, 0.06 * (i - 1), 0] })
  return {
    radius: 0.66,
    centerY: 0.6,
    parts: [
      { id: 'drum', geometry: drum.build() },
      { id: 'lid', geometry: lid.build(), pivot: [0, H, 0], animate: { action: 'open', kind: 'slide', axis: 'y', from: 0, to: 0.22, drift: [0.62, -0.1, 0] } },
    ],
  }
}

export const LHT_INSPECT_BUILDERS = {
  'square-packet': buildSquarePacket,
  'tea-sorting-tray': buildSortingTray,
  'charcoal-pit': buildCharcoalPit,
  'platform-scale': buildPlatformScale,
  'jasmine-scenting': buildJasmineScenting,
  'tasting-tray': buildTastingTray,
  'tea-drum': buildTeaDrum,
}
