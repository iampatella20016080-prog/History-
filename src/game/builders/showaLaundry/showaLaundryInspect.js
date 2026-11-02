import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 昭和浪漫洗濯屋可以近看的器物的 3D 檢視模型：「僑隆洗染」舊招牌、門口的霜淇淋模型、炭火熨斗、木桶與洗衣板。
 * 形制依據與分層資訊在 data/showaLaundryObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

/**
 * 「僑隆洗染」舊招牌（使用者的照片與現場確認）：紅底的直式木牌、米白色的邊框與四個白字。
 * 字只用米白色的筆畫塊示意（3D 檢視不畫招牌貼圖）；動作 turn：轉到背面看木板。
 */
function buildOldSign({ detail }) {
  const W = 0.32
  const H = 1.4
  const T = 0.035
  const board = new Parts()
  board.add('#7a2620', box(W + 0.04, H + 0.04, T), { p: [0, 0, -0.004] })
  board.add('#b8302a', box(W, H, T + 0.004))
  for (const s of [-1, 1]) {
    board.add('#efe5d2', box(0.012, H - 0.04, 0.004), { p: [s * (W / 2 - 0.02), 0, T / 2 + 0.002] })
    board.add('#efe5d2', box(W - 0.04, 0.012, 0.004), { p: [0, s * (H / 2 - 0.02), T / 2 + 0.002] })
  }
  // 四個字（每個字幾道筆畫）
  for (let k = 0; k < 4; k++) {
    const y = H / 2 - 0.2 - k * 0.33
    board.add('#fbf6ec', box(0.18, 0.025, 0.004), { p: [0, y + 0.06, T / 2 + 0.003] })
    board.add('#fbf6ec', box(0.025, 0.2, 0.004), { p: [-0.05 + (k % 2) * 0.06, y - 0.02, T / 2 + 0.003] })
    board.add('#fbf6ec', box(0.15, 0.025, 0.004), { p: [0.01, y - 0.09, T / 2 + 0.003] })
    if (detail) board.add('#fbf6ec', box(0.025, 0.12, 0.004), { p: [0.07, y, T / 2 + 0.003], r: [0, 0, 0.5] })
  }
  // 背面的木紋（深色的橫條）與吊掛的鐵片
  for (let i = 0; i < (detail ? 9 : 4); i++) board.add('#5e3a26', box(W - 0.02, 0.01, 0.003), { p: [0, -H / 2 + 0.1 + i * (H / (detail ? 9 : 4)), -T / 2 - 0.006] })
  board.add('#55524c', box(0.08, 0.04, 0.01), { p: [0, H / 2 - 0.05, -T / 2 - 0.01] })
  return {
    radius: 0.75,
    centerY: 0,
    viewPitch: 0.1,
    parts: [{ id: 'sign', geometry: board.build(), pivot: [0, 0, 0], animate: { action: 'turn', axis: 'y', from: 0, to: Math.PI } }],
  }
}

/**
 * 門口的大型霜淇淋模型（使用者的照片）：黑色底座、格紋的餅乾甜筒、一圈圈旋上去的白色霜淇淋。
 * 動作 spin：上面的霜淇淋轉一圈（像機器擠出來的樣子）。
 */
function buildConeModel({ detail }) {
  const base = new Parts()
  base.add('#262524', cyl(0.26, 0.3, 0.12, 20), { p: [0, 0.06, 0] })
  base.add('#d29a58', cyl(0.2, 0.05, 0.85, detail ? 24 : 14), { p: [0, 0.545, 0], r: [Math.PI, 0, 0] })
  // 甜筒的格紋
  for (let i = 0; i < (detail ? 6 : 3); i++) base.add('#b97c3c', cyl(0.06 + i * 0.026, 0.06 + i * 0.026, 0.012, 20, true), { p: [0, 0.27 + i * 0.12, 0] })
  base.add('#c98f4e', new TorusGeometry(0.2, 0.025, 6, 24), { p: [0, 0.97, 0], r: [Math.PI / 2, 0, 0] })
  const cream = new Parts()
  const rings = detail ? 5 : 3
  for (let i = 0; i < rings; i++) {
    const r = 0.22 - i * (0.17 / rings)
    cream.add('#f5f1e8', new TorusGeometry(r, 0.06 - i * 0.006, 8, 24), { p: [0.012 * (i % 2), 1.03 + i * 0.09, 0], r: [Math.PI / 2, 0, 0] })
  }
  cream.add('#f5f1e8', cyl(0.02, 0.08, 0.16, 12), { p: [0, 1.03 + rings * 0.09 + 0.02, 0] })
  return {
    radius: 0.8,
    centerY: 0.7,
    viewPitch: 0.25,
    parts: [
      { id: 'base', geometry: base.build() },
      { id: 'cream', geometry: cream.build(), pivot: [0, 0, 0], animate: { action: 'spin', axis: 'y', from: 0, to: Math.PI * 2 } },
    ],
  }
}

/**
 * 炭火熨斗（依台灣民俗文物館「初期熨斗」的描述：形狀像水瓢、把手接著木棒，圓筒裡放燒紅的炭；
 * 長約37公分、直徑約12公分）。動作 open：掀開圓筒的蓋子，看到裡面的炭火。
 */
function buildCharcoalIron({ detail }) {
  const R = 0.06
  const body = new Parts()
  body.add('#6e5a44', cyl(R, R * 1.05, 0.075, detail ? 24 : 14), { p: [0, 0.0375, 0] })
  body.add('#5a4836', cyl(R * 1.08, R * 1.08, 0.008, detail ? 24 : 14), { p: [0, 0.004, 0] })
  // 圓筒裡的炭與餘火
  body.add('#2a2420', cyl(R * 0.85, R * 0.85, 0.03, 12), { p: [0, 0.05, 0] })
  for (let i = 0; i < (detail ? 6 : 3); i++) body.add(i % 2 ? '#c4502c' : '#e07a3a', new SphereGeometry(0.012, 6, 4), { p: [Math.cos(i * 1.7) * 0.03, 0.066, Math.sin(i * 1.7) * 0.03] })
  // 把手：鐵桿接木棒
  body.add('#4a3c30', box(0.07, 0.012, 0.014), { p: [R + 0.035, 0.06, 0] })
  body.add('#8a6a48', cyl(0.013, 0.013, 0.17, 10), { p: [R + 0.155, 0.065, 0], r: [0, 0, Math.PI / 2 - 0.12] })
  const lid = new Parts()
  lid.add('#6a5642', cyl(R * 1.02, R * 1.02, 0.01, detail ? 24 : 14), { p: [0, 0.08, 0] })
  for (let i = 0; i < (detail ? 8 : 4); i++) lid.add('#3e3328', cyl(0.006, 0.006, 0.012, 6), { p: [Math.cos(i * 0.8) * 0.035, 0.086, Math.sin(i * 0.8) * 0.035] })
  lid.add('#4a3c30', box(0.025, 0.012, 0.012), { p: [-R + 0.005, 0.088, 0] })
  return {
    radius: 0.2,
    centerY: 0.05,
    viewPitch: 0.5,
    parts: [
      { id: 'iron', geometry: body.build() },
      { id: 'lid', geometry: lid.build(), pivot: [R, 0.08, 0], animate: { action: 'open', axis: 'z', from: 0, to: -1.9 } },
    ],
  }
}

/**
 * 木桶與洗衣板（情境示意；做法依業界文章的描述：竹刷、波浪形的洗衣板與木桶泡肥皂水搓洗）：
 * 箍著兩道鐵箍的木桶、桶裡的肥皂水，斜靠在桶邊的洗衣板。動作 scrub：洗衣板放進桶裡。
 */
function buildWashTub({ detail }) {
  const tub = new Parts()
  const seg = detail ? 20 : 12
  tub.add('#a37a50', cyl(0.36, 0.3, 0.42, seg, true), { p: [0, 0.21, 0] })
  tub.add('#8c6640', cyl(0.3, 0.3, 0.02, seg), { p: [0, 0.01, 0] })
  for (const y of [0.08, 0.34]) tub.add('#5a5a58', cyl(0.365, 0.355, 0.03, seg, true), { p: [0, y, 0] })
  tub.add('#cfd8d8', cyl(0.33, 0.33, 0.01, seg), { p: [0, 0.32, 0] })
  if (detail) for (let i = 0; i < 6; i++) tub.add('#f4f6f4', new SphereGeometry(0.03, 6, 4), { p: [Math.cos(i) * 0.15, 0.33, Math.sin(i * 1.3) * 0.12] })
  const board = new Parts()
  board.add('#c8a77c', box(0.32, 0.6, 0.025), { p: [0, 0.3, 0] })
  for (let i = 0; i < (detail ? 12 : 6); i++) board.add('#a8875c', box(0.28, 0.018, 0.02), { p: [0, 0.12 + i * (0.36 / (detail ? 12 : 6)), 0.018] })
  return {
    radius: 0.6,
    centerY: 0.3,
    viewPitch: 0.35,
    parts: [
      { id: 'tub', geometry: tub.build() },
      { id: 'board', geometry: board.build(), pivot: [0.42, 0, 0], animate: { action: 'scrub', axis: 'z', from: -0.2, to: 0.35 } },
    ],
  }
}

export const SHOWA_INSPECT_BUILDERS = {
  'qiaolong-sign': buildOldSign,
  'soft-serve-model': buildConeModel,
  'charcoal-iron': buildCharcoalIron,
  'wash-tub': buildWashTub,
}
