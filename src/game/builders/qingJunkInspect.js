import { BoxGeometry, CylinderGeometry, IcosahedronGeometry, SphereGeometry } from 'three'
import { Parts } from './inspectParts.js'

/**
 * 清末搭船的器物 3D 檢視（樟腦箱、壓艙石、船眼；說明與出處在 data/qingBoardingObjects.js）。
 * 形制查無的部分是歷史情境重建。接受 { detail }：流暢畫質少畫幾顆石頭與綑紮。
 */
const box = (x, y, z) => new BoxGeometry(x, y, z)

/** 襯鉛樟腦箱：木箱、鉛襯、箱裡的樟腦塊；動作 lid 掀開箱蓋 */
function buildCamphorBox({ detail = true } = {}) {
  const W = 0.56
  const D = 0.42
  const H = 0.4
  const t = 0.02
  const lidH = 0.035
  const bodyH = H - lidH
  const body = new Parts()
  body.add('#b89a6a', box(W, t, D), { p: [0, t / 2, 0] })
  body.add('#b89a6a', box(W, bodyH, t), { p: [0, bodyH / 2, -(D - t) / 2] })
  body.add('#b89a6a', box(W, bodyH, t), { p: [0, bodyH / 2, (D - t) / 2] })
  body.add('#a3875a', box(t, bodyH, D - 2 * t), { p: [-(W - t) / 2, bodyH / 2, 0] })
  body.add('#a3875a', box(t, bodyH, D - 2 * t), { p: [(W - t) / 2, bodyH / 2, 0] })
  // 鉛襯（四壁內側）與露出箱口的折邊
  for (const s of [-1, 1]) {
    body.add('#9aa0a6', box(W - 2 * t, bodyH - t - 0.01, 0.005), { p: [0, (bodyH + t) / 2, s * (D / 2 - t - 0.004)] })
    body.add('#9aa0a6', box(0.005, bodyH - t - 0.01, D - 2 * t), { p: [s * (W / 2 - t - 0.004), (bodyH + t) / 2, 0] })
  }
  body.add('#aeb3b8', box(W + 0.004, 0.012, D + 0.004), { p: [0, bodyH - 0.006, 0] })
  // 箱裡的樟腦（白色結晶塊，示意）
  body.add('#f2f0ea', box(W - 2 * t - 0.02, 0.08, D - 2 * t - 0.02), { p: [0, bodyH - 0.14, 0] })
  for (let i = 0; i < (detail ? 6 : 3); i++) {
    body.add('#f7f5ef', new IcosahedronGeometry(0.035, 0), { p: [-0.18 + i * 0.07, bodyH - 0.085, (i % 2 ? 0.08 : -0.06)], r: [i, i * 0.7, 0] })
  }
  if (detail) for (const sx of [-0.3, 0.3]) body.add('#8c7a52', box(0.035, H + 0.01, D + 0.01), { p: [sx * W, H / 2, 0] })
  const lid = new Parts()
  lid.add('#b89a6a', box(W, lidH, D), { p: [0, bodyH + lidH / 2, 0] })
  lid.add('#9aa0a6', box(W - 0.06, 0.004, D - 0.06), { p: [0, bodyH - 0.002, 0] })
  return {
    radius: 0.48,
    centerY: H / 2,
    parts: [
      { id: 'body', geometry: body.build() },
      { id: 'lid', geometry: lid.build(), pivot: [0, bodyH, -D / 2], animate: { action: 'lid', axis: 'x', from: 0, to: -1.7 } },
    ],
  }
}

/** 壓艙石：艙底板上的一堆河石；動作 lift 拿起最上面的一塊 */
function buildBallastStones({ detail = true } = {}) {
  const base = new Parts()
  base.add('#4a3f33', box(1.0, 0.04, 0.8), { p: [0, 0.02, 0] })
  const greys = ['#8d8a82', '#7a766c', '#9b968b', '#857f74']
  const spots = [
    [-0.3, 0.1, -0.2, 0.16],
    [0.05, 0.1, -0.25, 0.14],
    [0.32, 0.09, -0.15, 0.13],
    [-0.28, 0.1, 0.18, 0.15],
    [0.1, 0.11, 0.2, 0.17],
    [0.36, 0.08, 0.22, 0.11],
    [-0.05, 0.22, 0.0, 0.14],
    [0.25, 0.22, 0.03, 0.12],
    [-0.32, 0.2, -0.02, 0.1],
  ]
  spots.slice(0, detail ? spots.length : 6).forEach(([x, y, z, r], i) => base.add(greys[i % 4], new IcosahedronGeometry(r, detail ? 1 : 0), { p: [x, y, z], r: [i * 0.9, i * 0.4, 0], s: [1, 0.75, 1] }))
  const stone = new Parts()
  stone.add('#908b7f', new IcosahedronGeometry(0.13, detail ? 1 : 0), { p: [-0.1, 0.33, 0.12], r: [0.6, 1.2, 0], s: [1.1, 0.8, 1] })
  return {
    radius: 0.62,
    centerY: 0.2,
    parts: [
      { id: 'heap', geometry: base.build() },
      { id: 'stone', geometry: stone.build(), pivot: [-0.1, 0.33, 0.12], animate: { action: 'lift', axis: 'y', from: 0, to: 2.4, drift: [0.1, 0.3, 0.1] } },
    ],
  }
}

/** 船眼：船首的一段船板、凸出的眼睛與眼周的紅圈（翻到另一側看另一隻眼）；動作 turn 整件轉半圈 */
function buildBoatEye({ detail = true } = {}) {
  const root = new Parts()
  // 船首板（兩側各一片，中間是船首柱）
  for (const s of [-1, 1]) {
    root.add('#8d6c4d', box(0.9, 0.5, 0.05), { p: [0, 0, s * 0.22], r: [0, s * 0.35, 0] })
    root.add('#b8372a', new CylinderGeometry(0.17, 0.17, 0.02, detail ? 20 : 10), { p: [0.05, 0.02, s * 0.27], r: [Math.PI / 2, 0, 0] })
    root.add('#efe6d2', new CylinderGeometry(0.11, 0.11, 0.035, detail ? 20 : 10), { p: [0.05, 0.02, s * 0.285], r: [Math.PI / 2, 0, 0] })
    root.add('#2b231d', new SphereGeometry(0.05, detail ? 12 : 6, detail ? 8 : 4), { p: [0.08, 0.02, s * 0.3] })
  }
  root.add('#5d4533', box(0.08, 0.6, 0.12), { p: [0.44, 0, 0] })
  if (detail) root.add('#5d4533', box(0.86, 0.05, 0.55), { p: [0, 0.27, 0] })
  return {
    radius: 0.6,
    centerY: 0,
    parts: [{ id: 'bow', geometry: root.build(), pivot: [0, 0, 0], animate: { action: 'turn', axis: 'y', from: 0, to: Math.PI } }],
  }
}

/**
 * 鴉片箱（進口貨）：只畫外箱——木板拼的箱子、麻繩、側面的記號牌（示意，不仿任何商號）；
 * 外觀與尺寸查無，是重建。不畫內容物，所以動作是轉過來看側面，不開箱。
 */
function buildOpiumChest({ detail = true } = {}) {
  const W = 0.46
  const D = 0.42
  const H = 0.36
  const root = new Parts()
  root.add('#8a6a4a', box(W, H, D), { p: [0, H / 2, 0] })
  // 木板接縫與四角的板條
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) root.add('#6f5338', box(0.04, H + 0.004, 0.04), { p: [(sx * (W - 0.03)) / 2, H / 2, (sz * (D - 0.03)) / 2] })
  if (detail) for (const y of [0.12, 0.24]) root.add('#76593d', box(W + 0.004, 0.008, D + 0.004), { p: [0, y, 0] })
  // 麻繩（十字綑）
  root.add('#b59c6c', box(W + 0.02, 0.025, 0.03), { p: [0, H + 0.005, 0] })
  root.add('#b59c6c', box(0.03, 0.025, D + 0.02), { p: [0, H + 0.005, 0] })
  for (const s of [-1, 1]) root.add('#b59c6c', box(0.03, H, 0.025), { p: [0, H / 2, s * (D / 2 + 0.008)] })
  // 側面的記號牌（空白，示意貨主記號的位置）
  root.add('#d9c9a4', box(0.003, 0.14, 0.2), { p: [W / 2 + 0.003, H * 0.55, 0] })
  return {
    radius: 0.46,
    centerY: H / 2,
    parts: [{ id: 'chest', geometry: root.build(), pivot: [0, H / 2, 0], animate: { action: 'turn', axis: 'y', from: 0, to: -Math.PI / 2 } }],
  }
}

export const QING_JUNK_INSPECT_BUILDERS = {
  'opium-chest': buildOpiumChest,
  'camphor-box': buildCamphorBox,
  'ballast-stones': buildBallastStones,
  'boat-eye': buildBoatEye,
}
