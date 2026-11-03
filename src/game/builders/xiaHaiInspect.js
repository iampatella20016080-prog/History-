import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from './inspectParts.js'

/**
 * 霞海城隍廟殿內可以近看的器物（第 11 階段）的 3D 檢視模型：香爐、主神龕、清代匾額、義勇公祿位。
 * 形制依據與分層資訊在 data/xiaHaiObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * 匾與祿位的字只畫筆畫；神像是簡化的人形，不做臉部細節。detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open)

/** 銅鑄圓香爐（八寸高、徑約一尺：約 0.24 × 0.3 m）：三足、雙耳、爐身浮雕龍紋；動作 offer：一炷香插進香灰 */
function buildCenser({ detail }) {
  const seg = detail ? 32 : 18
  const body = new Parts()
  body.add('#4a3a28', cyl(0.15, 0.12, 0.17, seg), { p: [0, 0.11, 0] })
  body.add('#5a4630', cyl(0.165, 0.165, 0.025, seg), { p: [0, 0.205, 0] })
  body.add('#b8b0a2', cyl(0.145, 0.145, 0.01, seg), { p: [0, 0.2, 0] })
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2
    body.add('#3e3022', box(0.035, 0.06, 0.035), { p: [Math.cos(a) * 0.085, 0.03, Math.sin(a) * 0.085] })
  }
  for (const s of [-1, 1]) body.add('#5a4630', new TorusGeometry(0.035, 0.01, 6, 12), { p: [s * 0.165, 0.17, 0], r: [0, Math.PI / 2, 0] })
  // 爐身的龍紋浮雕（示意：一圈起伏的帶）
  const n = detail ? 24 : 12
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2
    body.add('#6a5436', box(0.03, 0.025, 0.008), { p: [Math.cos(a) * 0.141, 0.12 + Math.sin(a * 3) * 0.02, Math.sin(a) * 0.141], r: [0, -a + Math.PI / 2, 0] })
  }
  for (const dx of [-0.025, 0.025]) body.add('#8a3a2a', cyl(0.003, 0.003, 0.22, 4), { p: [dx, 0.31, 0] })
  const stick = new Parts()
  stick.add('#8a3a2a', cyl(0.003, 0.003, 0.22, 4), { p: [0, 0.11, 0] })
  stick.add('#d8572a', cyl(0.004, 0.004, 0.012, 6), { p: [0, 0.225, 0] })
  return {
    radius: 0.28,
    centerY: 0.16,
    viewPitch: 0.35,
    parts: [
      { id: 'censer', geometry: body.build() },
      { id: 'stick', geometry: stick.build(), pivot: [0, 0.2, 0], animate: { action: 'offer', kind: 'slide', axis: 'y', from: 0.18, to: 0 } },
    ],
  }
}

/** 主神龕（縮小的示意）：花罩、白底蟠龍背板、燻黑的鎮殿城隍；動作 bow：花罩前的垂簾式光影（龕前的神像微微低下示意合掌） */
function buildShrine({ detail }) {
  const frame = new Parts()
  const w = 1.6
  frame.add('#8e2f25', box(w, 0.35, 0.5), { p: [0, 0.175, 0] })
  frame.add('#ece6d6', box(w - 0.12, 1.1, 0.03), { p: [0, 0.9, -0.22] })
  for (const s of [-1, 1]) {
    frame.add('#8e2f25', box(0.08, 1.15, 0.08), { p: [s * (w / 2 - 0.04), 0.92, 0.2] })
    for (let k = 0; k < 4; k++) frame.add('#c9a148', box(0.18, 0.16, 0.02), { p: [s * (w / 2 - 0.18), 1.22 - k * 0.2, 0.22] })
  }
  frame.add('#8e2f25', box(w + 0.06, 0.24, 0.08), { p: [0, 1.38, 0.2] })
  for (const k of [-1, 0, 1]) frame.add('#b48a3a', box(0.42, 0.17, 0.01), { p: [k * 0.48, 1.38, 0.245] })
  // 蟠龍（扁平筆觸）與龍頭
  const pts = []
  for (let i = 0; i <= 16; i++) {
    const t = i / 16
    pts.push([Math.sin(t * Math.PI * 2.2 + 0.4) * 0.5 * (1 - t * 0.35), 0.5 + t * 0.85])
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    frame.add(i % 3 ? '#c9a043' : '#b58a32', box(Math.hypot(x1 - x0, y1 - y0) + 0.02, 0.05, 0.006), { p: [(x0 + x1) / 2, (y0 + y1) / 2, -0.2], r: [0, 0, Math.atan2(y1 - y0, x1 - x0)] })
  }
  frame.add('#d2a443', box(0.16, 0.1, 0.008), { p: [pts.at(-1)[0], pts.at(-1)[1] + 0.03, -0.198] })
  // 鎮殿城隍：座、袍、補子、黑面、長髯、公爵帽與紅絨飾
  const god = new Parts()
  god.add('#7a2b24', box(0.32, 0.18, 0.28), { p: [0, 0.44, 0.02] })
  god.add('#7a2b24', cyl(0.09, 0.12, 0.24, 12), { p: [0, 0.65, -0.02] })
  god.add('#7a2b24', box(0.28, 0.05, 0.16), { p: [0, 0.76, -0.02] })
  god.add('#d6ae52', box(0.1, 0.09, 0.01), { p: [0, 0.66, 0.085] })
  god.add('#2a221e', new SphereGeometry(0.06, 12, 10), { p: [0, 0.85, 0] })
  god.add('#1a1614', box(0.05, 0.2, 0.015), { p: [0, 0.72, 0.08] })
  god.add('#1c1a1a', box(0.15, 0.06, 0.13), { p: [0, 0.93, 0] })
  god.add('#1c1a1a', box(0.24, 0.015, 0.04), { p: [0, 0.945, -0.01] })
  god.add('#b3302a', new SphereGeometry(0.02, 8, 6), { p: [0, 0.98, 0.01] })
  if (detail) for (let k = -3; k <= 3; k++) god.add('#c9a148', box(0.012, 0.03, 0.012), { p: [k * 0.035, 0.6, 0.11] })
  // 配祀小像沒有出處的年代，不畫（使用者 2026-11-03）：兩側垂簾
  for (const x of [-0.45, 0.45]) frame.add('#b8a27a', box(0.4, 0.75, 0.01), { p: [x, 0.75, 0.05] })
  return {
    radius: 0.95,
    centerY: 0.75,
    viewPitch: 0.1,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'god', geometry: god.build(), pivot: [0, 0.35, 0], animate: { action: 'bow', axis: 'x', from: 0, to: 0.06 } },
    ],
  }
}

/** 三方清代匾額（黑底金字、雕花木框；字只畫筆畫）；動作 read：匾微微前傾 */
function buildPlaques({ detail }) {
  const boards = new Parts()
  const strokes = detail ? 5 : 3
  for (const [x, w, y] of [[0, 0.9, 0.36], [-0.95, 0.76, 0.34], [0.95, 0.76, 0.34]]) {
    boards.add('#3a1d17', box(w + 0.1, 0.34, 0.04), { p: [x, y, 0] })
    boards.add('#2a1a15', box(w, 0.26, 0.01), { p: [x, y, 0.024] })
    for (let c = 0; c < 4; c++) {
      const cx = x + w / 2 - w / 8 - (c * w) / 4
      for (let k = 0; k < strokes; k++) boards.add('#d4ad5c', box(0.08, 0.012, 0.004), { p: [cx, y + 0.08 - (k * 0.16) / Math.max(1, strokes - 1), 0.031] })
      boards.add('#d4ad5c', box(0.012, 0.16, 0.004), { p: [cx, y, 0.031] })
    }
    // 上款與下款的小字
    boards.add('#c9a050', box(0.012, 0.18, 0.004), { p: [x + w / 2 - 0.03, y, 0.031] })
    boards.add('#c9a050', box(0.012, 0.18, 0.004), { p: [x - w / 2 + 0.03, y, 0.031] })
  }
  return {
    radius: 1.1,
    centerY: 0.35,
    viewPitch: 0.0,
    parts: [{ id: 'boards', geometry: boards.build(), pivot: [0, 0.53, 0], animate: { action: 'read', axis: 'x', from: 0, to: 0.18 } }],
  }
}

/** 義勇公祿位（二尺八、約 0.85 m）：綠底金字，兩側五列人名，透雕安金蟠龍外框；動作 read：鏡頭靠近讀名字（牌位微微前傾） */
function buildTablet({ detail }) {
  const t = new Parts()
  t.add('#5a3a28', box(0.62, 0.08, 0.24), { p: [0, 0.04, 0] })
  t.add('#c9a148', box(0.56, 0.78, 0.05), { p: [0, 0.47, 0] })
  t.add('#2f5a3a', box(0.42, 0.64, 0.01), { p: [0, 0.46, 0.03] })
  for (let k = 0; k < 9; k++) t.add('#e2c060', box(0.045, 0.032, 0.004), { p: [0, 0.71 - k * 0.058, 0.037] })
  for (const s of [-1, 1]) for (let c = 0; c < 5; c++) for (let k = 0; k < 7; k++) {
    t.add('#d8b656', box(0.016, 0.02, 0.004), { p: [s * (0.065 + c * 0.028), 0.66 - k * 0.064, 0.037] })
  }
  const beads = detail ? 9 : 5
  for (const s of [-1, 1]) for (let k = 0; k < beads; k++) t.add('#d6ae4a', new SphereGeometry(0.03, 8, 6), { p: [s * 0.3, 0.14 + (k * 0.66) / (beads - 1), 0.02] })
  t.add('#d6ae4a', new SphereGeometry(0.06, 10, 8), { p: [0, 0.9, 0.02], s: [1.6, 1, 0.6] })
  return {
    radius: 0.55,
    centerY: 0.48,
    viewPitch: 0.05,
    parts: [{ id: 'tablet', geometry: t.build(), pivot: [0, 0, 0], animate: { action: 'read', axis: 'x', from: 0, to: 0.08 } }],
  }
}

export const XH_INSPECT_BUILDERS = {
  'incense-burner': buildCenser,
  'chenghuang-shrine': buildShrine,
  'qing-plaques': buildPlaques,
  'yiyonggong-tablet': buildTablet,
}
