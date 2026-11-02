import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 有記名茶各年代室內可以近看的器物（第 11 階段）的 3D 檢視模型：嘜頭、稻殼焙窟、風選機、南管樂器。
 * 形制依據與分層資訊在 data/youJiObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

const BOARD = '#3e2c20'
const CUT = '#d6c296'
const BAMBOO = '#cdb27e'
const BAMBOO_DARK = '#a98d5c'
const INK = '#2a2420'
const BRICK = '#9c6a54'
const CEMENT = '#9b958a'
const ASH = '#d9d4c8'
const WOOD = '#8a6440'
const WOOD_DARK = '#5e422c'
const TEA = '#4a4034'

/** 嘜頭（鏤空的菱形框與字；字樣是示意）與一面竹篾茶箱；動作 brush：板子貼上箱面、刷出墨字 */
function buildMarkStencil({ detail }) {
  const chest = new Parts()
  chest.add(BAMBOO, box(0.42, 0.38, 0.42), { p: [0, 0.19, 0] })
  for (const y of [0.05, 0.33]) chest.add(BAMBOO_DARK, box(0.432, 0.025, 0.432), { p: [0, y, 0] })
  if (detail) for (let i = 0; i < 9; i++) chest.add(BAMBOO_DARK, box(0.004, 0.36, 0.004), { p: [-0.2 + i * 0.05, 0.19, 0.212] })
  // 刷上去的墨字（菱形框與幾道筆畫）
  const mark = new Parts()
  mark.add(INK, box(0.14, 0.14, 0.004), { p: [0, 0.2, 0.213], r: [0, 0, Math.PI / 4] })
  mark.add(BAMBOO, box(0.11, 0.11, 0.004), { p: [0, 0.2, 0.215], r: [0, 0, Math.PI / 4] })
  for (let i = 0; i < 2; i++) mark.add(INK, box(0.03, 0.04, 0.004), { p: [-0.016 + i * 0.032, 0.2, 0.217] })
  mark.add(INK, box(0.28, 0.022, 0.004), { p: [0, 0.08, 0.213] })
  // 嘜頭板：深色木板，鏤空處用淺色表示
  const board = new Parts()
  board.add(BOARD, box(0.36, 0.3, 0.015), { p: [0, 0.2, 0.4] })
  board.add(CUT, box(0.15, 0.15, 0.004), { p: [0, 0.03 + 0.2, 0.009 + 0.4], r: [0, 0, Math.PI / 4] })
  board.add(BOARD, box(0.115, 0.115, 0.005), { p: [0, 0.03 + 0.2, 0.011 + 0.4], r: [0, 0, Math.PI / 4] })
  for (let i = 0; i < 2; i++) board.add(CUT, box(0.032, 0.042, 0.004), { p: [-0.016 + i * 0.032, 0.03 + 0.2, 0.013 + 0.4] })
  board.add(CUT, box(0.28, 0.024, 0.004), { p: [0, -0.09 + 0.2, 0.009 + 0.4] })
  if (detail) for (let i = 0; i < 6; i++) board.add(BOARD, box(0.006, 0.026, 0.005), { p: [-0.12 + i * 0.05, -0.09 + 0.2, 0.011 + 0.4] })
  return {
    radius: 0.45,
    centerY: 0.22,
    viewPitch: 0.25,
    parts: [
      { id: 'chest', geometry: chest.build() },
      { id: 'mark', geometry: mark.build() },
      { id: 'board', geometry: board.build(), pivot: [0, 0.2, 0.4], animate: { action: 'brush', kind: 'slide', axis: 'z', from: 0, to: -0.17 } },
    ],
  }
}

/** 稻殼焙窟：磚砌邊、水泥面，坑裡白灰與碎炭，旁邊一把撥灰的鐵耙；動作 rake：耙子伸進坑裡 */
function buildHuskAshPit({ detail }) {
  const seg = detail ? 24 : 14
  const T = 0.14
  const pit = new Parts()
  pit.add(BRICK, box(0.95, T, 0.95), { p: [0, T / 2, 0] })
  pit.add(CEMENT, box(0.99, 0.03, 0.99), { p: [0, T + 0.015, 0] })
  pit.add('#8f5c48', cyl(0.37, 0.37, 0.04, seg), { p: [0, T + 0.035, 0] })
  pit.add('#9d988e', cyl(0.3, 0.3, 0.046, seg), { p: [0, T + 0.04, 0] })
  pit.add(ASH, cyl(0.27, 0.27, 0.05, seg), { p: [0, T + 0.043, 0] })
  for (let i = 0; i < (detail ? 7 : 3); i++) pit.add('#1e1c1a', box(0.05, 0.03, 0.04), { p: [0.21 * Math.cos(i * 0.9), T + 0.07, 0.21 * Math.sin(i * 0.9)], r: [0, i, 0] })
  if (detail) for (let i = 0; i < 5; i++) pit.add('#c4c0b6', new SphereGeometry(0.03, 6, 4), { p: [-0.12 + i * 0.06, T + 0.07, 0.05 * ((i % 2) - 0.5)], s: [1.4, 0.35, 1] })
  const rake = new Parts()
  rake.add('#8a6a48', cyl(0.014, 0.014, 0.9, 6), { p: [0.42, 0.65, 0.3] })
  rake.add('#3e3c38', box(0.16, 0.02, 0.02), { p: [0.42, 0.21, 0.3] })
  for (let i = 0; i < 4; i++) rake.add('#3e3c38', box(0.012, 0.06, 0.012), { p: [-0.06 + i * 0.04 + 0.42, 0.18, 0.3] })
  return {
    radius: 0.62,
    centerY: 0.25,
    viewPitch: 0.6,
    parts: [
      { id: 'pit', geometry: pit.build() },
      { id: 'rake', geometry: rake.build(), pivot: [0.42, 1.1, 0.3], animate: { action: 'rake', axis: 'z', from: -0.35, to: 0.35 } },
    ],
  }
}

/** 風選機（依有記官網 Z62A0031 的局部，尺寸目測）：木格框、風箱、進料斗、一排出料斗；動作 crank：風箱的葉輪轉起來 */
function buildWinnowingMachine({ detail }) {
  const L = 1.4
  const D = 0.62
  const H = 1.45
  const frame = new Parts()
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) frame.add(WOOD_DARK, box(0.07, H, 0.07), { p: [sx * (L / 2 - 0.04), H / 2, sz * (D / 2 - 0.04)] })
  frame.add(WOOD, box(L - 0.1, H * 0.55, D - 0.12), { p: [0, H * 0.42, 0] })
  for (let i = 0; i < 4; i++) frame.add(WOOD_DARK, box(L, 0.05, 0.05), { p: [0, 0.25 + i * 0.36, D / 2 - 0.03] })
  frame.add(WOOD, box(0.5, 0.32, 0.46), { p: [0.15, H + 0.12, 0] })
  frame.add('#3a2e26', box(0.04, 0.9, 0.01), { p: [L / 2 - 0.18, H - 0.25, D / 2 + 0.01] })
  frame.add('#7d5a3a', cyl(0.36, 0.36, D - 0.14, detail ? 24 : 14), { p: [-L / 2 + 0.36, 0.62, 0], r: [Math.PI / 2, 0, 0] })
  for (let i = 0; i < 4; i++) {
    frame.add(WOOD, box(0.18, 0.03, 0.34), { p: [-0.05 + i * 0.2, 0.3, D / 2 + 0.12], r: [0.5, 0, 0] })
    if (detail) for (const s of [-1, 1]) frame.add(WOOD_DARK, box(0.012, 0.08, 0.34), { p: [-0.05 + i * 0.2 + s * 0.09, 0.33, D / 2 + 0.12], r: [0.5, 0, 0] })
  }
  frame.add(BAMBOO, cyl(0.2, 0.16, 0.26, 12, true), { p: [L / 2 - 0.05, 0.13, D / 2 + 0.3] })
  frame.add(TEA, cyl(0.17, 0.17, 0.02, 12), { p: [L / 2 - 0.05, 0.2, D / 2 + 0.3] })
  // 搖柄（連在風箱的軸上）
  const crank = new Parts()
  crank.add('#4a3424', box(0.04, 0.3, 0.04), { p: [-L / 2 + 0.36, -0.13 + 0.62, D / 2 + 0.05] })
  crank.add('#4a3424', cyl(0.02, 0.02, 0.14, 6), { p: [-L / 2 + 0.36, -0.26 + 0.62, 0.06 + D / 2 + 0.05], r: [Math.PI / 2, 0, 0] })
  crank.add('#4a3424', cyl(0.05, 0.05, 0.05, 10), { p: [-L / 2 + 0.36, 0.62, -0.02 + D / 2 + 0.05], r: [Math.PI / 2, 0, 0] })
  return {
    radius: 1.0,
    centerY: 0.8,
    viewPitch: 0.2,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'crank', geometry: crank.build(), pivot: [-L / 2 + 0.36, 0.62, D / 2 + 0.05], animate: { action: 'crank', axis: 'z', from: 0, to: Math.PI * 2 } },
    ],
  }
}

/** 南管樂器（照片可辨的四件）：琵琶、三絃、月琴形、洞簫與紅穗，掛在一片牆板上；動作 look：琵琶從牆上取下、轉向觀眾 */
function buildNanguan({ detail }) {
  const wall = new Parts()
  wall.add('#e8dfcc', box(1.3, 1.1, 0.03), { p: [0, 0.55, -0.03] })
  wall.add('#2e2016', cyl(0.07, 0.07, 0.05, 12), { p: [-0.15, 0.25, 0.02], r: [Math.PI / 2, 0, 0] })
  wall.add('#3a2418', box(0.025, 0.8, 0.025), { p: [-0.15, 0.68, 0.02] })
  wall.add('#9a6a3a', cyl(0.15, 0.15, 0.05, detail ? 24 : 14), { p: [0.2, 0.45, 0.02], r: [Math.PI / 2, 0, 0] })
  wall.add('#3a2418', box(0.03, 0.25, 0.035), { p: [0.2, 0.72, 0.02] })
  wall.add('#b8955a', cyl(0.014, 0.014, 0.75, 8), { p: [0.5, 0.55, 0.02] })
  wall.add('#a8322a', cyl(0.02, 0.035, 0.18, 8), { p: [0.5, 0.1, 0.02] })
  if (detail) for (let i = 0; i < 5; i++) wall.add('#3a2a1c', box(0.01, 0.01, 0.012), { p: [0.5, 0.4 + i * 0.08, 0.035] })
  const pipa = new Parts()
  pipa.add('#8a5a2e', new SphereGeometry(0.17, detail ? 16 : 10, 10), { p: [-0.45, 0.5, 0.06], s: [0.85, 1.25, 0.25] })
  pipa.add('#3a2418', box(0.05, 0.32, 0.04), { p: [-0.45, 0.33 + 0.5, 0.01 + 0.06] })
  pipa.add('#3a2418', box(0.06, 0.1, 0.04), { p: [-0.45, 0.51 + 0.5, -0.02 + 0.06], r: [-0.5, 0, 0] })
  for (let i = 0; i < 4; i++) pipa.add('#e8e0cc', box(0.002, 0.5, 0.002), { p: [-0.015 + i * 0.01 + -0.45, 0.15 + 0.5, 0.045 + 0.06] })
  if (detail) pipa.add('#5a3a1e', new TorusGeometry(0.03, 0.006, 4, 10), { p: [-0.45, -0.12 + 0.5, 0.04 + 0.06] })
  return {
    radius: 0.8,
    centerY: 0.55,
    viewPitch: 0.1,
    parts: [
      { id: 'wall', geometry: wall.build() },
      { id: 'pipa', geometry: pipa.build(), pivot: [-0.45, 0.5, 0.06], animate: { action: 'look', kind: 'slide', axis: 'y', from: 0, to: 0.1, drift: [0.15, 0, 0.25] } },
    ],
  }
}

export const YJ_INSPECT_BUILDERS = {
  'mark-stencil': buildMarkStencil,
  'husk-ash-pit': buildHuskAshPit,
  'winnowing-machine': buildWinnowingMachine,
  'nanguan-instruments': buildNanguan,
}
