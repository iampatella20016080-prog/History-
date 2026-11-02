import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 新芳春茶行各年代室內可以近看的器物（第 11 階段）的 3D 檢視模型：切茶機、優良茶比賽獎狀、外銷鐵罐、算盤。
 * 形制依據與分層資訊在 data/xinFangChunObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * 零件的座標是器物本身的座標（pivot 是動作的轉軸）；detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

const IRON = '#3a3e3c'
const IRON_LIGHT = '#5a5e5a'
const PAPER = '#e8dcb4'
const WOOD = '#4a3322'
const BEAD = '#2c1f16'

/** 切茶機：A 形鑄鐵腳架、機身、梯形漏斗、銘牌、地上的網狀滾筒；動作 turn：側面的飛輪轉一圈 */
function buildTeaCutter({ detail }) {
  const body = new Parts()
  for (const sx of [-1, 1]) {
    body.add(IRON, box(0.08, 0.9, 0.08), { p: [sx * 0.3, 0.45, -0.2], r: [0.2, 0, 0] })
    body.add(IRON, box(0.08, 0.9, 0.08), { p: [sx * 0.3, 0.45, 0.2], r: [-0.2, 0, 0] })
  }
  body.add('#454a47', box(0.7, 0.4, 0.5), { p: [0, 1.05, 0] })
  body.add(IRON, cyl(0.34, 0.16, 0.36, 4), { p: [0, 1.43, 0], r: [0, Math.PI / 4, 0] })
  body.add('#b8a46a', box(0.1, 0.1, 0.006), { p: [0, 1.1, 0.253], r: [0, 0, Math.PI / 4] })
  body.add(IRON_LIGHT, cyl(0.16, 0.16, 0.06, detail ? 20 : 12), { p: [-0.4, 1.05, 0], r: [0, 0, Math.PI / 2] })
  for (const dx of [-0.25, 0.2]) body.add('#7a7e78', cyl(0.12, 0.12, 0.45, detail ? 14 : 8, true), { p: [dx, 0.12, 0.45], r: [0, 0, Math.PI / 2] })
  const wheel = new Parts()
  wheel.add(IRON, new TorusGeometry(0.25, 0.035, 6, detail ? 24 : 14), { p: [0.42, 1.05, 0], r: [0, Math.PI / 2, 0] })
  for (let i = 0; i < 3; i++) wheel.add(IRON, box(0.02, 0.48, 0.03), { p: [0.42, 1.05, 0], r: [(i * Math.PI) / 3, 0, 0] })
  wheel.add(IRON_LIGHT, cyl(0.05, 0.05, 0.08, 10), { p: [0.42, 1.05, 0], r: [0, 0, Math.PI / 2] })
  return {
    radius: 0.95,
    centerY: 0.8,
    viewPitch: 0.25,
    parts: [
      { id: 'body', geometry: body.build() },
      { id: 'wheel', geometry: wheel.build(), pivot: [0.42, 1.05, 0], animate: { action: 'turn', axis: 'x', from: 0, to: Math.PI * 2 } },
    ],
  }
}

/** 優良茶比賽獎狀：木框、泛黃紙面、上緣國徽與紅印、直書的字行（示意）；動作 read：獎狀往前湊近 */
function buildCertificate({ detail }) {
  const frame = new Parts()
  frame.add(WOOD, box(0.5, 0.68, 0.03), { p: [0, 0.34, 0] })
  frame.add(PAPER, box(0.42, 0.6, 0.006), { p: [0, 0.34, 0.018] })
  frame.add('#2c4a8a', cyl(0.045, 0.045, 0.004, detail ? 20 : 12), { p: [0, 0.57, 0.022], r: [Math.PI / 2, 0, 0] })
  frame.add('#f2efe6', cyl(0.02, 0.02, 0.005, 10), { p: [0, 0.57, 0.024], r: [Math.PI / 2, 0, 0] })
  frame.add('#b8382c', box(0.07, 0.07, 0.004), { p: [0.12, 0.14, 0.022] })
  for (let i = 0; i < (detail ? 8 : 5); i++) frame.add('#3a3028', box(0.006, 0.34, 0.003), { p: [0.16 - i * 0.04, 0.34, 0.022] })
  return {
    radius: 0.42,
    centerY: 0.34,
    viewPitch: 0.05,
    parts: [{ id: 'frame', geometry: frame.build(), pivot: [0, 0.34, 0], animate: { action: 'read', kind: 'slide', axis: 'z', from: 0, to: 0.12 } }],
  }
}

/** 外銷鐵罐：紅、綠兩個方鐵罐（字樣只畫色帶）；動作 turn：綠罐轉過來 */
function buildExportTin({ detail }) {
  const tin = (parts, x, red) => {
    parts.add(red ? '#a5362c' : '#3f6a4a', box(0.13, 0.2, 0.13), { p: [x, 0.1, 0] })
    parts.add('#e2cf96', box(0.135, 0.06, 0.135), { p: [x, 0.11, 0] })
    parts.add('#c9b37a', box(0.11, 0.025, 0.11), { p: [x, 0.212, 0] })
    parts.add(red ? '#7a2420' : '#2a4a34', box(0.136, 0.012, 0.136), { p: [x, 0.16, 0] })
    if (detail) for (let i = 0; i < 4; i++) parts.add('#3a2a20', box(0.08, 0.006, 0.002), { p: [x, 0.09 + i * 0.012, 0.068] })
  }
  const red = new Parts()
  tin(red, -0.1, true)
  const green = new Parts()
  tin(green, 0.1, false)
  return {
    radius: 0.25,
    centerY: 0.1,
    viewPitch: 0.25,
    parts: [
      { id: 'red', geometry: red.build() },
      { id: 'green', geometry: green.build(), pivot: [0.1, 0.1, 0], animate: { action: 'turn', axis: 'y', from: 0, to: Math.PI / 2 } },
    ],
  }
}

/** 算盤（上二下五）：木框、橫樑、檔與算珠；動作 count：一排下珠撥上去 */
function buildAbacus({ detail }) {
  const rods = detail ? 13 : 9
  const W = 0.45
  const frame = new Parts()
  frame.add(WOOD, box(W, 0.02, 0.02), { p: [0, 0.01, -0.09] })
  frame.add(WOOD, box(W, 0.02, 0.02), { p: [0, 0.01, 0.09] })
  for (const sx of [-1, 1]) frame.add(WOOD, box(0.02, 0.025, 0.2), { p: [sx * (W / 2 - 0.01), 0.012, 0] })
  frame.add(WOOD, box(W, 0.022, 0.012), { p: [0, 0.014, -0.035] })
  const beads = new Parts()
  const moving = new Parts()
  for (let i = 0; i < rods; i++) {
    const x = -W / 2 + 0.03 + (i * (W - 0.06)) / (rods - 1)
    frame.add('#8a7a60', box(0.003, 0.003, 0.18), { p: [x, 0.012, 0] })
    for (let k = 0; k < 2; k++) beads.add(BEAD, new SphereGeometry(0.011, 6, 4), { p: [x, 0.012, -0.075 + k * 0.022], s: [1.2, 0.8, 0.7] })
    for (let k = 0; k < 5; k++) (i === Math.floor(rods / 2) && k === 0 ? moving : beads).add(BEAD, new SphereGeometry(0.011, 6, 4), { p: [x, 0.012, 0.0 + k * 0.016], s: [1.2, 0.8, 0.7] })
  }
  return {
    radius: 0.3,
    centerY: 0.02,
    viewPitch: 0.8,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'beads', geometry: beads.build() },
      { id: 'bead', geometry: moving.build(), pivot: [0, 0.012, 0], animate: { action: 'count', kind: 'slide', axis: 'z', from: 0, to: -0.018 } },
    ],
  }
}

export const XFC_INSPECT_BUILDERS = {
  'tea-cutter': buildTeaCutter,
  'tea-award-certificate': buildCertificate,
  'export-tea-tin': buildExportTin,
  abacus: buildAbacus,
}
