import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from './inspectParts.js'

/**
 * 慈聖宮殿內可以近看的器物（第 11 階段）的 3D 檢視模型：媽祖神龕、同治六年的石柱、「惠澤覃敷」匾。
 * 形制依據與分層資訊在 data/ciShengObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * 匾與柱上的字只畫筆畫（「海國陽春」匾目前不寫字，待決）；神像是簡化的人形，不做臉部細節。detail：精緻畫質多一些小零件與段數。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg) => new CylinderGeometry(rt, rb, h, seg, 1, false)
const BLACK = '#2a1f1a'
const GILT = '#c9a148'

/** 一尊坐像（縮小的示意）：座、袍、肩、貼金的臉、冕旒或鳳冠 */
function addMazu(parts, x, y, scale, crown, detail) {
  const s = scale
  parts.add('#8e2f25', box(0.3 * s, 0.1 * s, 0.26 * s), { p: [x, y + 0.05 * s, 0] })
  parts.add('#a8382c', cyl(0.1 * s, 0.14 * s, 0.26 * s, 12), { p: [x, y + 0.23 * s, 0] })
  parts.add('#a8382c', box(0.3 * s, 0.05 * s, 0.17 * s), { p: [x, y + 0.34 * s, 0] })
  parts.add('#d6ae52', box(0.1 * s, 0.1 * s, 0.01), { p: [x, y + 0.23 * s, 0.1 * s] })
  parts.add('#cfa84e', new SphereGeometry(0.065 * s, 12, 10), { p: [x, y + 0.45 * s, 0] })
  if (crown === 'mianliu') {
    parts.add('#1c1a1a', box(0.2 * s, 0.02 * s, 0.15 * s), { p: [x, y + 0.53 * s, 0] })
    const n = detail ? 9 : 5
    for (let k = 0; k < n; k++) parts.add('#e6c35c', box(0.006, 0.07 * s, 0.006), { p: [x + (k - (n - 1) / 2) * 0.022 * s, y + 0.49 * s, 0.075 * s] })
  } else {
    parts.add('#d9b04a', cyl(0.07 * s, 0.06 * s, 0.09 * s, 10), { p: [x, y + 0.53 * s, 0] })
    if (detail) for (let k = -2; k <= 2; k++) parts.add('#e6c35c', new SphereGeometry(0.01 * s, 6, 4), { p: [x + k * 0.025 * s, y + 0.59 * s, 0.03 * s] })
  }
}

/** 媽祖神龕（縮小的示意）：黑金的龕、三層階梯上 5 尊媽祖、上方不寫字的橫匾；動作 bow：神像群微微低下 */
function buildMazuShrine({ detail }) {
  const frame = new Parts()
  const w = 1.6
  frame.add(BLACK, box(w, 0.4, 0.5), { p: [0, 0.2, 0] })
  frame.add(GILT, box(w + 0.04, 0.03, 0.54), { p: [0, 0.415, 0] })
  frame.add('#3a2a22', box(w - 0.1, 1.15, 0.03), { p: [0, 1.0, -0.22] })
  for (let k = 0; k < 5; k++) frame.add(GILT, box(w - 0.3, 0.025, 0.01), { p: [0, 0.62 + k * 0.2, -0.2] })
  frame.add('#8e2f25', box(1.4, 0.1, 0.4), { p: [0, 0.47, 0.01] })
  frame.add('#8a2a22', box(1.0, 0.1, 0.32), { p: [0, 0.57, -0.03] })
  frame.add('#7a251e', box(0.5, 0.1, 0.22), { p: [0, 0.67, -0.07] })
  for (const s of [-1, 1]) {
    frame.add(BLACK, box(0.08, 1.25, 0.08), { p: [s * (w / 2 - 0.04), 1.02, 0.2] })
    for (let k = 0; k < 4; k++) frame.add(GILT, box(0.18, 0.15, 0.02), { p: [s * (w / 2 - 0.18), 1.38 - k * 0.2, 0.22] })
  }
  frame.add(BLACK, box(w + 0.06, 0.24, 0.08), { p: [0, 1.58, 0.2] })
  for (const k of [-1, 0, 1]) frame.add('#b48a3a', box(0.42, 0.16, 0.01), { p: [k * 0.48, 1.58, 0.245] })
  // 上方的橫匾「海國陽春」（黑底、金邊；寫不寫字待決，目前不寫）
  frame.add('#1f1814', box(0.95, 0.26, 0.04), { p: [0, 1.82, -0.05] })
  frame.add(GILT, box(0.9, 0.02, 0.01), { p: [0, 1.93, -0.025] })
  frame.add(GILT, box(0.9, 0.02, 0.01), { p: [0, 1.71, -0.025] })
  if (detail) for (let k = -6; k <= 6; k++) frame.add('#e0b545', new SphereGeometry(0.02, 6, 4), { p: [k * 0.12, 1.66, 0.25] })
  const gods = new Parts()
  addMazu(gods, 0, 0.77, 1.15, 'mianliu', detail)
  for (const s of [-1, 1]) addMazu(gods, s * 0.34, 0.67, 0.95, 'phoenix', detail)
  for (const s of [-1, 1]) addMazu(gods, s * 0.6, 0.57, 0.8, 'phoenix', detail)
  return {
    radius: 1.0,
    centerY: 0.95,
    viewPitch: 0.1,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'gods', geometry: gods.build(), pivot: [0, 0.45, 0], animate: { action: 'bow', axis: 'x', from: 0, to: 0.06 } },
    ],
  }
}

/** 同治六年的石柱（一對，縮小的示意）：黑色方石柱、柱礎、金字的聯；動作 read：柱組微微轉向鏡頭 */
function buildStonePillars({ detail }) {
  const pillars = new Parts()
  const strokes = detail ? 11 : 7
  for (const [s, regular] of [[-1, false], [1, true]]) {
    const x = s * 0.4
    pillars.add('#a39a8a', box(0.34, 0.12, 0.34), { p: [x, 0.06, 0] })
    pillars.add('#2a2a2c', box(0.22, 1.5, 0.22), { p: [x, 0.87, 0] })
    pillars.add('#5c4332', box(0.32, 0.12, 0.32), { p: [x, 1.68, 0] })
    pillars.add('#3f6f66', box(0.24, 0.1, 0.24), { p: [x, 1.79, 0] })
    // 右柱：楷書的聯（11 字，一列筆畫）；左柱：篆書，聯首「慈」以外的字不補，只畫幾道刻痕
    const face = 0.114
    for (let k = 0; k < strokes; k++) {
      const y = 1.45 - k * (1.2 / strokes)
      pillars.add(regular ? '#d4ad5c' : '#bb9a52', box(regular ? 0.09 : 0.07, 0.014, 0.004), { p: [x - s * 0.0, y, face] })
      if (regular) pillars.add('#d4ad5c', box(0.012, 0.075, 0.004), { p: [x, y, face] })
    }
    // 上款
    pillars.add('#c9a050', box(0.012, 0.3, 0.004), { p: [x + 0.08, 0.5, face] })
  }
  return {
    radius: 0.95,
    centerY: 0.9,
    viewPitch: 0.05,
    parts: [{ id: 'pillars', geometry: pillars.build(), pivot: [0, 0.9, 0], animate: { action: 'read', axis: 'y', from: 0, to: 0.12 } }],
  }
}

/** 「惠澤覃敷」匾（紅底金字、金色雕花框；字只畫筆畫，款識未辨讀）；動作 read：匾微微前傾 */
function buildHuizePlaque({ detail }) {
  const board = new Parts()
  const w = 1.3
  board.add(GILT, box(w + 0.16, 0.6, 0.05), { p: [0, 0.3, 0] })
  board.add('#a8382c', box(w, 0.46, 0.012), { p: [0, 0.3, 0.03] })
  const strokes = detail ? 5 : 3
  for (let c = 0; c < 4; c++) {
    const cx = -0.45 + c * 0.3
    for (let k = 0; k < strokes; k++) board.add('#e8c874', box(0.15, 0.016, 0.006), { p: [cx, 0.3 + 0.13 - (k * 0.26) / Math.max(1, strokes - 1), 0.04] })
    board.add('#e8c874', box(0.018, 0.3, 0.006), { p: [cx, 0.3, 0.04] })
  }
  // 款識（未辨讀）：右上與左側的小字只畫筆畫
  board.add('#e0b95e', box(0.012, 0.2, 0.006), { p: [w / 2 - 0.05, 0.38, 0.04] })
  board.add('#e0b95e', box(0.012, 0.2, 0.006), { p: [-w / 2 + 0.05, 0.3, 0.04] })
  if (detail) {
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) board.add('#d6ae4a', new SphereGeometry(0.025, 6, 4), { p: [s * (w / 2 + 0.05), 0.08 + k * 0.11, 0.02] })
    board.add('#d6ae4a', new TorusGeometry(0.05, 0.012, 5, 10, Math.PI), { p: [0, 0.62, 0.02] })
  }
  return {
    radius: 0.85,
    centerY: 0.3,
    viewPitch: 0.0,
    parts: [{ id: 'board', geometry: board.build(), pivot: [0, 0.6, 0], animate: { action: 'read', axis: 'x', from: 0, to: 0.18 } }],
  }
}

export const CS_INSPECT_BUILDERS = {
  'mazu-shrine': buildMazuShrine,
  'tongzhi-stone-pillars': buildStonePillars,
  'huize-tanfu-plaque': buildHuizePlaque,
}
