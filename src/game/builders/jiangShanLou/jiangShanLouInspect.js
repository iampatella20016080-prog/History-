import { BoxGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 江山樓室內可以近看的器物（第 11 階段）的 3D 檢視模型：菜單、金錢火雞、賀匾。
 * 形制依據與分層資訊在 data/jiangShanLouObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * 菜單不寫菜名；匾的字讀不出來，只畫筆畫。detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

/** 菜單：直式摺頁，封面紅底金框；動作 unfold：封面翻開，內頁是一行行的色帶（不寫菜名） */
function buildMenu({ detail }) {
  const inside = new Parts()
  inside.add('#efe6cc', box(0.2, 0.006, 0.3), { p: [0.1, 0.003, 0] })
  for (let i = 0; i < (detail ? 10 : 6); i++) inside.add('#3a2a20', box(0.004, 0.002, 0.22), { p: [0.04 + i * 0.015, 0.0065, 0] })
  inside.add('#b8382c', box(0.03, 0.002, 0.03), { p: [0.17, 0.0065, 0.11] })
  const cover = new Parts()
  cover.add('#b23a2c', box(0.2, 0.008, 0.3), { p: [-0.1, 0.004, 0] })
  cover.add('#d6ae52', box(0.17, 0.002, 0.27), { p: [-0.1, 0.0085, 0] })
  cover.add('#b23a2c', box(0.15, 0.002, 0.25), { p: [-0.1, 0.0095, 0] })
  cover.add('#e8c25a', box(0.03, 0.002, 0.12), { p: [-0.1, 0.0105, 0.02] })
  return {
    radius: 0.25,
    centerY: 0.01,
    viewPitch: 0.9,
    parts: [
      { id: 'inside', geometry: inside.build() },
      { id: 'cover', geometry: cover.build(), pivot: [0, 0, 0], animate: { action: 'unfold', axis: 'z', from: Math.PI, to: 0 } },
    ],
  }
}

/** 金錢火雞（擺盤示意）：青花圓盤上一圈錢幣狀的小塊；動作 lift：掀開盤蓋 */
function buildCourse({ detail }) {
  const seg = detail ? 28 : 16
  const dish = new Parts()
  dish.add('#f1ede2', cyl(0.2, 0.15, 0.04, seg), { p: [0, 0.02, 0] })
  dish.add('#2c4a8a', cyl(0.19, 0.19, 0.004, seg, true), { p: [0, 0.041, 0] })
  dish.add('#f1ede2', cyl(0.165, 0.165, 0.004, seg), { p: [0, 0.042, 0] })
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    dish.add('#c8924a', cyl(0.028, 0.028, 0.02, 12), { p: [Math.cos(a) * 0.11, 0.054, Math.sin(a) * 0.11] })
    if (detail) dish.add('#8a5a2a', cyl(0.01, 0.01, 0.022, 8), { p: [Math.cos(a) * 0.11, 0.055, Math.sin(a) * 0.11] })
  }
  dish.add('#e8dcb8', new SphereGeometry(0.05, 10, 8), { p: [0, 0.06, 0], s: [1, 0.5, 1] })
  const cover = new Parts()
  cover.add('#c9c4b8', new SphereGeometry(0.19, seg, 10, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, 0.045, 0], s: [1, 0.55, 1] })
  cover.add('#9a948a', cyl(0.025, 0.025, 0.03, 10), { p: [0, 0.155, 0] })
  return {
    radius: 0.24,
    centerY: 0.06,
    viewPitch: 0.6,
    parts: [
      { id: 'dish', geometry: dish.build() },
      { id: 'cover', geometry: cover.build(), pivot: [0, 0.045, 0], animate: { action: 'lift', kind: 'slide', axis: 'y', from: 0, to: 0.18, drift: [0.28, 0, 0] } },
    ],
  }
}

/** 賀匾：深色木框、淺色底、直書的筆畫與紅印（字讀不出來）；動作 read：匾往前傾、湊近看 */
function buildPlaque({ detail }) {
  const board = new Parts()
  board.add('#2e2018', box(1.4, 0.6, 0.05), { p: [0, 0.3, 0] })
  board.add('#e6dcc2', box(1.28, 0.48, 0.01), { p: [0, 0.3, 0.03] })
  const cols = detail ? 12 : 8
  for (let i = 0; i < cols; i++) board.add('#2a221c', box(0.025, i === 0 || i === cols - 1 ? 0.2 : 0.36, 0.004), { p: [-0.55 + (i * 1.1) / (cols - 1), 0.32, 0.037] })
  board.add('#b8382c', box(0.05, 0.05, 0.004), { p: [-0.56, 0.12, 0.037] })
  return {
    radius: 0.75,
    centerY: 0.3,
    viewPitch: 0.05,
    parts: [{ id: 'board', geometry: board.build(), pivot: [0, 0.6, 0], animate: { action: 'read', axis: 'x', from: 0, to: 0.25 } }],
  }
}

/** 啤酒瓶（瓶形依高砂麥酒海報，酒標示意）與玻璃杯；動作 pour：酒瓶傾斜 */
function buildBeerBottle({ detail }) {
  const seg = detail ? 18 : 10
  const glass = new Parts()
  glass.add('#d8e4e0', cyl(0.035, 0.03, 0.11, seg, true), { p: [0.12, 0.055, 0] })
  glass.add('#c89a3a', cyl(0.031, 0.028, 0.07, seg), { p: [0.12, 0.035, 0] })
  const bottle = new Parts()
  bottle.add('#3a2414', cyl(0.038, 0.038, 0.17, seg), { p: [0, 0.085, 0] })
  bottle.add('#3a2414', cyl(0.014, 0.036, 0.06, seg), { p: [0, 0.2, 0] })
  bottle.add('#3a2414', cyl(0.013, 0.013, 0.07, seg), { p: [0, 0.265, 0] })
  bottle.add('#c9b37a', cyl(0.0395, 0.0395, 0.06, seg, true), { p: [0, 0.09, 0] })
  bottle.add('#a8322a', cyl(0.0398, 0.0398, 0.012, seg, true), { p: [0, 0.11, 0] })
  if (detail) bottle.add('#c9a64a', cyl(0.015, 0.015, 0.012, 10), { p: [0, 0.304, 0] })
  return {
    radius: 0.2,
    centerY: 0.13,
    viewPitch: 0.25,
    parts: [
      { id: 'glass', geometry: glass.build() },
      { id: 'bottle', geometry: bottle.build(), pivot: [0.03, 0.0, 0], animate: { action: 'pour', axis: 'z', from: 0, to: -1.1 } },
    ],
  }
}

/** 木板門屏（示意）：兩扇木板門；動作 open：右扇推開 */
function buildPartitionScreen({ detail }) {
  const fixed = new Parts()
  const moving = new Parts()
  for (const [parts, x] of [[fixed, -0.3], [moving, 0.3]]) {
    parts.add('#5b2c22', box(0.58, 2.2, 0.05), { p: [x, 1.1, 0] })
    for (let r = 0; r < 4; r++) parts.add('#3e1e16', box(0.48, 0.03, 0.06), { p: [x, 0.6 + r * 0.45, 0] })
    if (detail) parts.add('#c9a64a', box(0.03, 0.06, 0.07), { p: [x + (x < 0 ? 0.24 : -0.24), 1.05, 0] })
  }
  return {
    radius: 1.2,
    centerY: 1.1,
    viewPitch: 0.05,
    parts: [
      { id: 'left', geometry: fixed.build() },
      { id: 'right', geometry: moving.build(), pivot: [0.3, 1.1, 0], animate: { action: 'open', kind: 'slide', axis: 'x', from: 0, to: 0.5 } },
    ],
  }
}

/** 假山（形狀是重建）：幾塊灰石、石台與一棵矮樹；動作 look：整座轉一圈 */
function buildRockery({ detail }) {
  const rock = new Parts()
  rock.add('#9a968c', box(1.3, 0.15, 1.0), { p: [0, 0.075, 0] })
  for (const [x, y, z, r, h] of [[0, 0.15, 0, 0.45, 0.35], [0.35, 0.15, 0.15, 0.3, 0.27], [-0.3, 0.15, -0.1, 0.27, 0.25], [0.05, 0.45, 0.03, 0.27, 0.3], [0.1, 0.68, -0.02, 0.16, 0.22]]) rock.add('#8f8a80', new SphereGeometry(r, detail ? 10 : 7, 5), { p: [x, y + h * 0.5, z], s: [1, h / r, 0.85] })
  rock.add('#5a4030', cyl(0.025, 0.035, 0.4, 6), { p: [0.12, 0.98, 0] })
  rock.add('#4f6a3a', new SphereGeometry(0.21, 8, 6), { p: [0.12, 1.22, 0], s: [1.2, 0.7, 1.2] })
  return {
    radius: 0.9,
    centerY: 0.6,
    viewPitch: 0.3,
    parts: [{ id: 'rockery', geometry: rock.build(), pivot: [0, 0, 0], animate: { action: 'look', axis: 'y', from: 0, to: Math.PI * 2 } }],
  }
}

/** 盆栽（陶盆與示意的矮樹）與矮架；動作 turn：盆轉一轉 */
function buildBonsai({ detail }) {
  const stand = new Parts()
  stand.add('#5a3f2b', box(0.42, 0.04, 0.42), { p: [0, 0.18, 0] })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) stand.add('#5a3f2b', box(0.04, 0.18, 0.04), { p: [sx * 0.17, 0.09, sz * 0.17] })
  const pot = new Parts()
  pot.add('#7c4a3a', cyl(0.16, 0.12, 0.16, detail ? 16 : 10), { p: [0, 0.28, 0] })
  pot.add('#5a4030', cyl(0.02, 0.03, 0.22, 6), { p: [0.02, 0.47, 0], r: [0, 0, 0.2] })
  for (const [x, y, z, r] of [[-0.05, 0.6, 0, 0.12], [0.1, 0.56, 0.05, 0.1], [0.02, 0.66, -0.06, 0.09]]) pot.add('#4f6a3a', new SphereGeometry(r, 8, 6), { p: [x, y, z], s: [1.3, 0.7, 1.3] })
  return {
    radius: 0.4,
    centerY: 0.38,
    viewPitch: 0.3,
    parts: [
      { id: 'stand', geometry: stand.build() },
      { id: 'pot', geometry: pot.build(), pivot: [0, 0.2, 0], animate: { action: 'turn', axis: 'y', from: 0, to: Math.PI } },
    ],
  }
}

/** 大理石圓桌與一張石凳（尺寸是設計值）；動作 touch：茶杯往前推 */
function buildMarbleTable({ detail }) {
  const seg = detail ? 24 : 14
  const table = new Parts()
  table.add('#e6e2da', cyl(0.5, 0.5, 0.07, seg), { p: [0, 0.74, 0] })
  if (detail) for (let i = 0; i < 4; i++) table.add('#bdb8ae', box(0.6 - i * 0.1, 0.002, 0.004), { p: [-0.1 + i * 0.05, 0.776, -0.15 + i * 0.1], r: [0, 0.6 + i * 0.4, 0] })
  table.add('#cfcac0', cyl(0.12, 0.2, 0.7, 10), { p: [0, 0.36, 0] })
  table.add('#d6d1c6', cyl(0.17, 0.2, 0.44, 10), { p: [0.75, 0.22, 0] })
  const cup = new Parts()
  cup.add('#f1ece0', cyl(0.03, 0.022, 0.04, 10), { p: [0.1, 0.795, 0.1] })
  cup.add('#6e3a28', new SphereGeometry(0.06, 10, 8), { p: [-0.12, 0.83, 0], s: [1, 0.8, 1] })
  return {
    radius: 0.9,
    centerY: 0.5,
    viewPitch: 0.45,
    parts: [
      { id: 'table', geometry: table.build() },
      { id: 'cup', geometry: cup.build(), pivot: [0, 0.78, 0], animate: { action: 'touch', kind: 'slide', axis: 'x', from: 0, to: 0.12 } },
    ],
  }
}

export const JSL_INSPECT_BUILDERS = {
  'beer-bottle': buildBeerBottle,
  'partition-screen': buildPartitionScreen,
  'roof-rockery': buildRockery,
  'roof-bonsai': buildBonsai,
  'marble-round-table': buildMarbleTable,
  'banquet-menu': buildMenu,
  'banquet-course': buildCourse,
  'congratulatory-plaque': buildPlaque,
}
