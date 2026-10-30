import { BoxGeometry, ConeGeometry, CylinderGeometry, LatheGeometry, SphereGeometry, TorusGeometry, Vector2 } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「廟口的一餐」的器物（第 12 階段）：程式建模，對照文獻（data/routes/templeMealRoute.js），
 * 不用 AI 生成的模型。廟口的攤位都是情境示意，器物也不對應任何真實攤商。
 * 每個建模函式接受 { detail }（精緻畫質多段數與小零件；流暢畫質簡化，零件與小動作相同），
 * 原點在器物底部中央；radius、centerY、viewPitch 的意思同 pastryObjects.js。
 * 碗的形制依台灣碗盤博物館藏的戰後鶯歌日用陶碗（1945–1964）。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

/* ── 顏色 ── */
const BOWL = '#e9e4d8'
const BOWL_BLUE = '#3f5f8a'
const FISH_RED = '#a8553a'
const BROTH = '#8a5a34'
const BROTH_LIGHT = '#a0703f'
const SQUID = '#efd9c4'
const SQUID_EDGE = '#d9b89a'
const BAMBOO_SHOOT = '#e6d28e'
const BASIL = '#4f7a3e'
const SPOON = '#f1ede3'
const BAMBOO = '#c9ae74'
const BAMBOO_DARK = '#a88d55'
const DRIED_SQUID = '#c99b62'
const DRIED_SQUID_DARK = '#a87a48'
const WOOD = '#9a6f45'
const WOOD_DARK = '#7a5432'
const WOOD_LIGHT = '#b88a58'
const TIN = '#a8aaa6'
const TIN_DARK = '#7e807c'
const DOUGH = '#f2ecdd'
const NOODLE = '#efe8d6'
const WATER = '#8fb1b8'
const POT = '#55575a'
const BUCKET = '#b98e5c'
const HOOP = '#5b5f62'
const DOUHUA = '#f5f0e2'
const SYRUP = '#9a5a2a'
const ROPE = '#8a7650'

/** 碗的剖面（外緣；底部收窄、碗口外敞） */
function bowlProfile(r, h, segments) {
  const points = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    points.push(new Vector2(r * (0.42 + 0.58 * Math.sin((t * Math.PI) / 2)), h * t))
  }
  return points
}

/**
 * 白底青花的碗（戰後鶯歌的日用陶碗：手繪的藍色紋樣、碗口的花邊）。
 * r、h 是碗口半徑與高；fish：碗心畫一條魚（碗公），否則只畫碗外的藍色線條。
 * 碗底的店號留空（示意的攤位不畫可辨識的店號）。
 */
function addBowl(parts, { r, h, y = 0, radial, detail, fish = false }) {
  parts.add(BOWL, new LatheGeometry(bowlProfile(r, h, detail ? 10 : 5), radial), { p: [0, y + 0.008, 0] })
  // 內壁（略小一號、法線朝內）
  parts.add('#f1ede4', new LatheGeometry(bowlProfile(r - 0.004, h - 0.002, detail ? 10 : 5), radial), { p: [0, y + 0.01, 0], s: [-1, 1, 1] })
  parts.add(BOWL, new CylinderGeometry(r * 0.4, r * 0.42, 0.008, radial), { p: [0, y + 0.004, 0] })
  // 碗口的花邊與碗外的藍色線條
  parts.add(BOWL_BLUE, new TorusGeometry(r, 0.0025, 4, radial), { p: [0, y + 0.008 + h, 0], r: [Math.PI / 2, 0, 0] })
  parts.add(BOWL_BLUE, new TorusGeometry(r * 0.74, 0.0016, 4, radial), { p: [0, y + 0.008 + h * 0.45, 0], r: [Math.PI / 2, 0, 0] })
  if (detail) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      parts.add(BOWL_BLUE, new SphereGeometry(0.004, 6, 4), { p: [Math.cos(a) * r * 0.99, y + 0.008 + h - 0.004, Math.sin(a) * r * 0.99], s: [1.6, 0.6, 1.6] })
    }
    // 碗外手繪的水草（幾筆斜線）
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2
      parts.add(BOWL_BLUE, box(0.002, h * 0.35, 0.002), { p: [Math.cos(a) * r * 0.86, y + 0.008 + h * 0.62, Math.sin(a) * r * 0.86], r: [0, -a, 0.35] })
    }
  }
  if (fish) {
    // 碗心手繪的魚（藍色的身體與紅褐色的鰭；示意，不仿任何一件典藏）
    const fy = y + 0.012
    parts.add(BOWL_BLUE, new SphereGeometry(0.03, detail ? 12 : 6, 4), { p: [0, fy, 0], s: [1.6, 0.06, 0.7] })
    parts.add(FISH_RED, new ConeGeometry(0.018, 0.03, detail ? 8 : 4), { p: [-0.058, fy, 0], r: [0, 0, Math.PI / 2], s: [1, 1, 0.06] })
    if (detail) {
      parts.add(FISH_RED, box(0.02, 0.001, 0.012), { p: [0.005, fy + 0.002, 0.02], r: [0, 0.4, 0] })
      parts.add('#f1ede4', new SphereGeometry(0.004, 6, 4), { p: [0.035, fy + 0.002, 0.006], s: [1, 0.3, 1] })
      for (let i = 0; i < 5; i++) parts.add(BOWL_BLUE, box(0.002, 0.001, 0.03), { p: [Math.cos(i * 1.3) * r * 0.6, fy, Math.sin(i * 1.3) * r * 0.6], r: [0, i, 0] })
    }
  }
}

/**
 * 一碗魷魚羹（歷史情境重建：白底青花的小碗、勾芡的羹湯、泡發後切塊的魷魚與竹筍絲、一點九層塔，
 * 瓷湯匙架在碗裡；旁邊的竹篩上擺著還沒泡發的乾魷魚）。
 * 動作 scoop：湯匙舀起一塊魷魚。
 */
function buildSquidSoup({ detail }) {
  const radial = detail ? 28 : 14
  // 碗依台灣碗盤博物館藏戰後鶯歌的小碗（口徑約 18.5、高約 5.8 公分）
  const R = 0.0925
  const H = 0.058
  const bowl = new Parts()
  addBowl(bowl, { r: R, h: H, radial, detail })
  // 羹湯（勾芡的湯面）與浮在上面的料
  bowl.add(BROTH, new CylinderGeometry(R * 0.93, R * 0.9, 0.004, radial), { p: [0, 0.008 + H * 0.82, 0] })
  const pieces = detail ? 7 : 4
  for (let i = 0; i < pieces; i++) {
    const a = i * 2.2
    const r = 0.018 + (i % 3) * 0.016
    bowl.add(SQUID, box(0.022, 0.006, 0.012), { p: [Math.cos(a) * r, 0.008 + H * 0.84, Math.sin(a) * r], r: [0, a, 0.1] })
    if (detail) bowl.add(SQUID_EDGE, box(0.022, 0.002, 0.002), { p: [Math.cos(a) * r, 0.008 + H * 0.86, Math.sin(a) * r + 0.004], r: [0, a, 0] })
  }
  for (let i = 0; i < (detail ? 10 : 4); i++) {
    const a = i * 1.37 + 0.4
    const r = 0.012 + (i % 4) * 0.012
    bowl.add(BAMBOO_SHOOT, box(0.024, 0.003, 0.003), { p: [Math.cos(a) * r, 0.008 + H * 0.85, Math.sin(a) * r], r: [0, a * 1.7, 0] })
  }
  bowl.add(BASIL, new SphereGeometry(0.008, 8, 4), { p: [-0.02, 0.008 + H * 0.86, -0.025], s: [1.4, 0.3, 0.8] })
  if (detail) bowl.add(BROTH_LIGHT, new TorusGeometry(R * 0.6, 0.0015, 3, radial), { p: [0, 0.008 + H * 0.83, 0], r: [Math.PI / 2, 0, 0] })
  // 旁邊的竹篩與一隻乾魷魚（扁平的身體、兩片鰭、一束腳）
  const sx = -0.2
  bowl.add(BAMBOO, new CylinderGeometry(0.11, 0.11, 0.012, radial), { p: [sx, 0.006, 0.02] })
  bowl.add(BAMBOO_DARK, new TorusGeometry(0.11, 0.006, 4, radial), { p: [sx, 0.012, 0.02], r: [Math.PI / 2, 0, 0] })
  if (detail) for (let i = -3; i <= 3; i++) bowl.add(BAMBOO_DARK, box(0.2, 0.002, 0.003), { p: [sx, 0.0125, 0.02 + i * 0.028] })
  bowl.add(DRIED_SQUID, box(0.07, 0.006, 0.13), { p: [sx, 0.016, 0.04] })
  bowl.add(DRIED_SQUID, new ConeGeometry(0.05, 0.05, 3), { p: [sx, 0.016, 0.115], r: [Math.PI / 2, 0, 0], s: [1, 1, 0.12] })
  for (let i = 0; i < (detail ? 8 : 3); i++) bowl.add(DRIED_SQUID_DARK, box(0.006, 0.004, 0.07), { p: [sx - 0.025 + i * (0.05 / (detail ? 7 : 2)), 0.015, -0.055], r: [0, (i - 3.5) * 0.05, 0] })

  // 湯匙（瓷湯匙）與舀起的一塊魷魚：以碗沿為樞軸抬起
  const spoon = new Parts()
  const sy = 0.008 + H * 0.84
  spoon.add(SPOON, new SphereGeometry(0.018, detail ? 12 : 6, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { p: [0.03, sy + 0.012, 0.01], s: [1.3, 0.6, 1] })
  spoon.add(SPOON, box(0.07, 0.006, 0.012), { p: [0.075, sy + 0.022, 0.01], r: [0, 0, 0.35] })
  spoon.add(SQUID, box(0.02, 0.008, 0.012), { p: [0.03, sy + 0.012, 0.01] })

  return {
    radius: 0.22,
    centerY: 0.04,
    viewPitch: 0.45,
    parts: [
      { id: 'bowl', geometry: bowl.build() },
      { id: 'spoon', geometry: spoon.build(), pivot: [R * 0.8, sy + 0.02, 0.01], animate: { action: 'scoop', axis: 'z', from: 0, to: 0.55, drift: [0, 0.03, 0] } },
    ],
  }
}

/**
 * 米篩目板（歷史情境重建：架在鍋口的木框，中間是打了許多圓孔的板子；米糰在板上來回壓，
 * 從孔裡擠出一條條粗短的米條，落進底下的熱水鍋）。
 * 動作 press：米糰往前壓過篩板，底下的米苔目一條條垂下來。
 */
function buildRiceSieveBoard({ detail }) {
  const radial = detail ? 24 : 12
  const L = 0.5
  const W = 0.24
  const y = 0.2
  const frame = new Parts()
  // 鍋與鍋裡的熱水：鍋身切開前面一角（剖面），看得到米條落進水裡
  frame.add(POT, new CylinderGeometry(0.17, 0.15, 0.16, radial, 1, true, Math.PI * 0.25, Math.PI * 1.5), { p: [0, 0.08, 0] })
  frame.add('#3e4043', new CylinderGeometry(0.162, 0.142, 0.155, radial, 1, true, Math.PI * 0.25, Math.PI * 1.5), { p: [0, 0.08, 0], s: [-1, 1, 1] })
  frame.add(POT, new CylinderGeometry(0.15, 0.15, 0.01, radial), { p: [0, 0.005, 0] })
  frame.add(WATER, new CylinderGeometry(0.165, 0.165, 0.006, radial), { p: [0, 0.13, 0] })
  // 木框（兩根長邊、兩根短邊），兩端擱在鍋口外
  for (const z of [-W / 2, W / 2]) frame.add(WOOD, box(L, 0.025, 0.025), { p: [0, y, z] })
  for (const x of [-L / 2, L / 2]) frame.add(WOOD_DARK, box(0.025, 0.025, W + 0.025), { p: [x, y, 0] })
  // 中間的篩板：鐵皮打孔（深色的點是孔）
  frame.add(TIN, box(0.26, 0.004, W - 0.02), { p: [0, y - 0.006, 0] })
  const holes = detail ? 9 : 5
  for (let i = 0; i < holes; i++) {
    for (let k = 0; k < holes - 3; k++) {
      frame.add(TIN_DARK, new CylinderGeometry(0.004, 0.004, 0.005, 6), { p: [-0.11 + (i * 0.22) / (holes - 1), y - 0.004, -0.08 + (k * 0.16) / (holes - 4)] })
    }
  }
  if (detail) {
    // 兩端的握把（可以抓著擱穩）
    for (const x of [-L / 2 - 0.035, L / 2 + 0.035]) frame.add(WOOD_LIGHT, box(0.05, 0.018, 0.06), { p: [x, y, 0] })
  }

  // 米糰：在篩板上從一端壓到另一端
  const dough = new Parts()
  dough.add(DOUGH, new SphereGeometry(0.05, radial, detail ? 10 : 6), { p: [-0.09, y + 0.022, 0], s: [1.2, 0.5, 1] })
  if (detail) dough.add('#e6dfcc', new SphereGeometry(0.02, 8, 6), { p: [-0.12, y + 0.04, 0.02], s: [1, 0.5, 1] })

  // 擠出來的米苔目（藏在篩板下，壓的時候往下垂到水面）
  const noodles = new Parts()
  const strands = detail ? 14 : 6
  for (let i = 0; i < strands; i++) {
    const x = -0.1 + (i * 0.2) / (strands - 1)
    const z = ((i * 37) % 9) / 9 * 0.14 - 0.07
    noodles.add(NOODLE, new CylinderGeometry(0.0045, 0.004, 0.075, 6), { p: [x, y - 0.045, z] })
  }

  return {
    radius: 0.42,
    centerY: 0.14,
    viewPitch: 0.2,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'dough', geometry: dough.build(), pivot: [0, y, 0], animate: { action: 'press', kind: 'slide', axis: 'x', from: 0, to: 0.17, drift: [0, -0.008, 0] } },
      { id: 'noodles', geometry: noodles.build(), pivot: [0, y, 0], animate: { action: 'press', kind: 'slide', axis: 'y', from: 0.035, to: -0.005 } },
    ],
  }
}

/**
 * 豆花擔（歷史情境重建：竹扁擔的長度依台灣民俗文物館「籮筐擔」1231 的竹扁擔，長 151.4 公分、
 * 兩端烤彎略往上翹以免繩子滑落；兩頭各吊一個木桶——一桶豆花、一桶糖水，依方子毓 2021 的回憶）。
 * 木桶的尺寸查無，是設計值。
 * 動作 scoop：掀開豆花桶的木蓋，扁平的舀匙舀起一片豆花。
 */
function buildDouhuaPole({ detail }) {
  const radial = detail ? 28 : 14
  const R = 0.15
  const H = 0.28
  const L = 1.514
  const poleY = 0.95
  const gap = L / 2 - 0.12
  const base = new Parts()
  // 竹扁擔（扁平、兩端微翹）：放在兩桶的提繩上
  base.add(BAMBOO, box(L - 0.16, 0.022, 0.07), { p: [0, poleY, 0] })
  for (const side of [-1, 1]) base.add(BAMBOO, box(0.1, 0.022, 0.07), { p: [side * (L / 2 - 0.05), poleY + 0.012, 0], r: [0, 0, side * 0.22] })
  if (detail) for (let i = -3; i <= 3; i++) base.add(BAMBOO_DARK, box(0.006, 0.024, 0.072), { p: [i * 0.2, poleY, 0] })
  // 兩個木桶與提繩
  const bucket = (x, content) => {
    base.add(BUCKET, new CylinderGeometry(R, R * 0.92, H, radial, 1, true), { p: [x, H / 2, 0] })
    base.add('#a57d4f', new CylinderGeometry(R - 0.012, R * 0.92 - 0.012, H - 0.01, radial, 1, true), { p: [x, H / 2 + 0.005, 0], s: [-1, 1, 1] })
    base.add(BUCKET, new CylinderGeometry(R * 0.92, R * 0.92, 0.015, radial), { p: [x, 0.0075, 0] })
    for (const yy of [0.05, H - 0.05]) base.add(HOOP, new TorusGeometry(R * (yy < H / 2 ? 0.94 : 0.99), 0.006, 4, radial), { p: [x, yy, 0], r: [Math.PI / 2, 0, 0] })
    if (detail) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2
        base.add('#9a7347', box(0.003, H - 0.02, 0.004), { p: [x + Math.cos(a) * (R * 0.96 + 0.002), H / 2, Math.sin(a) * (R * 0.96 + 0.002)], r: [0, -a, 0] })
      }
    }
    base.add(content, new CylinderGeometry(R - 0.014, R - 0.014, 0.012, radial), { p: [x, H - 0.05, 0] })
    // 提繩：從桶口兩側拉到扁擔
    for (const side of [-1, 1]) {
      const dz = side * (R - 0.01)
      const len = Math.hypot(poleY - H, dz)
      base.add(ROPE, box(0.008, len, 0.008), { p: [x, (poleY + H) / 2, dz / 2], r: [Math.atan2(-dz, poleY - H), 0, 0] })
    }
  }
  bucket(-gap, DOUHUA)
  bucket(gap, SYRUP)
  // 糖水桶蓋（不會動）
  base.add(WOOD, new CylinderGeometry(R + 0.008, R + 0.008, 0.018, radial), { p: [gap, H + 0.009, 0] })

  // 豆花桶的木蓋：以後緣為樞軸掀開
  const lid = new Parts()
  lid.add(WOOD, new CylinderGeometry(R + 0.008, R + 0.008, 0.018, radial), { p: [-gap, H + 0.009, 0] })
  lid.add(WOOD_DARK, box(0.12, 0.022, 0.03), { p: [-gap, H + 0.028, 0] })
  if (detail) for (const dx of [-0.06, 0.06]) lid.add(WOOD_DARK, box(0.004, 0.019, R * 1.8), { p: [-gap + dx, H + 0.009, 0] })

  // 扁平的舀匙（淺而寬的金屬片加木柄）與舀起的一片豆花：從桶邊伸進桶裡再抬起
  const scoop = new Parts()
  scoop.add(TIN, new CylinderGeometry(0.045, 0.045, 0.004, detail ? 16 : 8), { p: [-gap, H - 0.04, 0.0], s: [1, 1, 0.8] })
  scoop.add(DOUHUA, new SphereGeometry(0.035, detail ? 12 : 6, 4), { p: [-gap, H - 0.036, 0], s: [1.1, 0.18, 0.85] })
  scoop.add(WOOD_LIGHT, box(0.22, 0.012, 0.014), { p: [-gap + 0.15, H - 0.03, 0], r: [0, 0, 0.12] })

  return {
    radius: 0.9,
    centerY: 0.52,
    viewPitch: 0.25,
    parts: [
      { id: 'base', geometry: base.build() },
      { id: 'lid', geometry: lid.build(), pivot: [-gap, H, -R], animate: { action: 'scoop', axis: 'x', from: 0, to: -1.7 } },
      { id: 'scoop', geometry: scoop.build(), pivot: [-gap, H, 0], animate: { action: 'scoop', kind: 'slide', axis: 'y', from: -0.4, to: 0.06 } },
    ],
  }
}

/**
 * 白底青花的碗公（依台灣碗盤博物館藏「鶯歌手繪魚紋碗公」TW-5-01-00-0-B-0030 的形制：陶製，1945–1964，
 * 口徑 20.5、高 8.5 公分，碗心手繪鯉魚與水草、碗口有花邊；紋樣是簡化的示意，不是那件典藏的複製）。
 * 動作 flip：翻過來看碗底——示意的攤位不畫店號（早年圓環小吃攤有在碗上燒店號的做法）。
 */
function buildBlueWhiteBowl({ detail }) {
  const radial = detail ? 32 : 14
  const root = new Parts()
  addBowl(root, { r: 0.1025, h: 0.085, radial, detail, fish: true })
  // 碗底的圈足與一圈藍線（店號的位置留空）
  root.add(BOWL, new CylinderGeometry(0.045, 0.047, 0.012, radial, 1, true), { p: [0, 0.002, 0] })
  root.add(BOWL_BLUE, new TorusGeometry(0.032, 0.0015, 3, radial), { p: [0, -0.002, 0], r: [Math.PI / 2, 0, 0] })
  // 一雙竹筷擱在碗口
  const chopsticks = new Parts()
  for (const dz of [-0.008, 0.008]) chopsticks.add(BAMBOO, new CylinderGeometry(0.003, 0.0045, 0.24, 6), { p: [0.02, 0.097, dz], r: [0, 0, Math.PI / 2 - 0.05] })

  return {
    radius: 0.2,
    centerY: 0.045,
    viewPitch: 0.5,
    parts: [
      { id: 'bowl', geometry: root.build(), pivot: [0, 0.045, 0], animate: { action: 'flip', axis: 'z', from: 0, to: Math.PI } },
      { id: 'chopsticks', geometry: chopsticks.build(), pivot: [0, 0.045, 0], animate: { action: 'flip', kind: 'slide', axis: 'x', from: 0, to: 0.3, drift: [0, -0.06, 0.08] } },
    ],
  }
}

export const TEMPLE_MEAL_BUILDERS = {
  'squid-soup-bowl': buildSquidSoup,
  'rice-sieve-board': buildRiceSieveBoard,
  'douhua-pole': buildDouhuaPole,
  'blue-white-bowl': buildBlueWhiteBowl,
}
