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

export const JSL_INSPECT_BUILDERS = {
  'banquet-menu': buildMenu,
  'banquet-course': buildCourse,
  'congratulatory-plaque': buildPlaque,
}
