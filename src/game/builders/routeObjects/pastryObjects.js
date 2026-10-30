import { BoxGeometry, ConeGeometry, CylinderGeometry, LatheGeometry, Shape, ShapeGeometry, SphereGeometry, TorusGeometry, Vector2 } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「一塊糕餅的人生」的器物（第 12 階段）：程式建模，對照照片與文獻（data/routes/pastryRoute.js），
 * 不用 AI 生成的模型。每個建模函式接受 { detail }：
 *   detail true   精緻畫質：較多的段數與小零件（葉脈、印紋的細線、餡料的顆粒）
 *   detail false  流暢畫質：段數減半、省略小零件，但零件（parts）與小動作相同
 * 原點在器物底部中央；radius 是檢視鏡頭取景的大小，centerY 是轉動的中心高度，
 * viewPitch 是開始檢視時的俯仰角（扁平的器物從上方看，見 objectInspect.js 的 newInspectState）。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

/* ── 顏色 ── */
const BUN = '#f4ead8'
const BUN_SHADE = '#eadcc3'
const BLUSH = '#ec8f8f'
const BLUSH_DEEP = '#d9646c'
const LEAF = '#5d8a4e'
const LEAF_DARK = '#4a7240'
const BEAN = '#6b3a32'
const BEAN_DARK = '#55302a'
const WOOD = '#9a6f45'
const LACQUER = '#9c4632' // 朱漆殘留的木色
const LACQUER_DARK = '#843a2a'
const IRON = '#4a443c'
const WOOD_DARK = '#7a5432'
const WOOD_LIGHT = '#b88a58'
const KUEH_RED = '#cf3b3b'
const KUEH_RED_DARK = '#a92f33'
const BANANA_LEAF = '#4f7f45'
const BOX_RED = '#b8323a'
const BOX_RED_DARK = '#962a31'
const GOLD = '#d8b25a'
const CAKE = '#d79c5a'
const CAKE_DARK = '#b97a3e'
const MONAKA = '#e6c99a'
const MONAKA_DARK = '#cfae78'

/** 壽桃的外形（剖面）：底部圓潤、上端收成桃尖 */
function peachProfile(segments) {
  const points = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    // 半徑：下半部像圓，上半部收尖；高度 0–0.17
    const y = t * 0.17
    const r = Math.sin(Math.PI * Math.min(1, t * 1.05)) * 0.085 * (1 - 0.55 * t * t) + (t < 0.04 ? 0.03 * (1 - t / 0.04) : 0)
    points.push(new Vector2(Math.max(0.001, r), y))
  }
  return points
}

/** 剖面輪廓的平面（XY 平面、法線 +Z）：scale 縮小時是裡頭的餡 */
function profileShape(segments, scale) {
  const points = peachProfile(segments)
  const shape = new Shape()
  shape.moveTo(points[0].x * scale, points[0].y * scale)
  for (const point of points) shape.lineTo(point.x * scale, point.y * scale)
  for (let i = points.length - 1; i >= 0; i--) shape.lineTo(-points[i].x * scale, points[i].y * scale)
  return new ShapeGeometry(shape, 1)
}

/**
 * 壽桃（做壽的禮俗；做法依國史館臺灣文獻館《臺灣民俗文物辭典》「壽桃」：發麵包餡、捏成桃形蒸熟、
 * 壓出紋路後噴上紅色，白色表面帶粉紅；底下兩片葉形麵皮是一般壽桃的樣式，標準尺寸查無）。
 * 動作 split：把壽桃掰成兩半，看裡頭的餡（示意為棗泥）。
 */
function buildLongevityPeach({ detail }) {
  const seg = detail ? 28 : 14
  const radial = detail ? 24 : 12
  const plate = new Parts()
  // 紅色的小紙盤（壽桃常放在紅紙或紅盤上送禮）
  plate.add(BOX_RED, new CylinderGeometry(0.105, 0.095, 0.01, radial), { p: [0, 0.005, 0] })
  plate.add(BOX_RED_DARK, new TorusGeometry(0.1, 0.004, 4, radial), { p: [0, 0.011, 0], r: [Math.PI / 2, 0, 0] })

  // 兩半：各是半個壽桃（LatheGeometry 只轉半圈），切面是餡與麵皮
  const half = (side) => {
    const parts = new Parts()
    const phiStart = side > 0 ? 0 : Math.PI
    parts.add(BUN, new LatheGeometry(peachProfile(seg), radial, phiStart, Math.PI), { p: [0, 0.014, 0] })
    // 桃尖的紅暈（半個小球，貼在尖端）
    parts.add(BLUSH, new SphereGeometry(0.034, radial, detail ? 10 : 6, phiStart, Math.PI, 0, Math.PI / 2), { p: [0, 0.16, 0], s: [1, 0.8, 1] })
    // 桃身正面壓出的一道紋（貼著表面的細長凹痕）
    if (detail) parts.add(BUN_SHADE, new SphereGeometry(0.006, 6, 8), { p: [side * 0.004, 0.1, 0.074], r: [-0.5, 0, 0], s: [0.6, 6, 0.5] })
    // 切面：沿著壽桃的剖面輪廓做一片完整的麵皮切面，中間是餡（《臺灣民俗文物辭典》的家庭做法包棗泥）
    // 卡通材質只畫正面：切面兩面都放一片，從哪個角度看都看得到（餡比麵皮略微往外凸）
    for (const face of [Math.PI / 2, -Math.PI / 2]) {
      const out = Math.sign(face) === -side ? 1 : 0
      parts.add(BUN_SHADE, profileShape(seg, 1), { p: [side * 0.001, 0.014, 0], r: [0, face, 0] })
      parts.add(BEAN, profileShape(seg, 0.62), { p: [side * (0.001 - 0.0015 * out), 0.034, 0], r: [0, face, 0] })
    }
    if (detail) {
      // 餡裡的豆粒
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI
        parts.add(BEAN_DARK, new SphereGeometry(0.006, 6, 4), { p: [side * 0.003, 0.075 + Math.sin(a) * 0.022, Math.cos(a) * 0.022] })
      }
    }
    return parts
  }

  // 底下兩片葉形的麵皮（染綠），整顆壽桃坐在葉子上
  const leaves = new Parts()
  for (const side of [-1, 1]) {
    leaves.add(LEAF, new SphereGeometry(0.06, radial, 6), { p: [side * 0.07, 0.018, 0.07], r: [0, side * 0.6, 0], s: [1.3, 0.12, 0.6] })
    if (detail) leaves.add(LEAF_DARK, box(0.11, 0.004, 0.004), { p: [side * 0.07, 0.026, 0.07], r: [0, side * 0.6, 0] })
  }

  return {
    radius: 0.24,
    centerY: 0.09,
    viewPitch: 0.25,
    parts: [
      { id: 'plate', geometry: plate.build() },
      { id: 'leaves', geometry: leaves.build() },
      // 兩半各自以外側的底緣為軸往外倒開，露出切面的餡（動作 split）
      { id: 'left', geometry: half(-1).build(), pivot: [-0.08, 0.014, 0], animate: { action: 'split', axis: 'z', from: 0, to: 0.6 } },
      { id: 'right', geometry: half(1).build(), pivot: [0.08, 0.014, 0], animate: { action: 'split', axis: 'z', from: 0, to: -0.6 } },
    ],
  }
}

/**
 * 龜粿印（依國立臺灣歷史博物館典藏 2003.001.0563「朱漆三面龜桃連錢紋帶柄粿印」的形制：
 * 木質、連柄長 36.1 × 寬 17.3 × 高 3.3 公分、表面塗朱漆；一面刻龜紋（龜甲兩圈、中央六角框），
 * 另一面刻桃紋與銀圓紋，側面七枚連錢，握柄底部有鐵圈可以穿繩懸掛）與一個剛印好的紅龜粿。
 * 紋樣是簡化的示意，不是那件典藏的複製。
 * 動作 press：粿印以後緣為樞軸掀起，龜紋那一面轉向你，底下是印好龜紋的紅龜粿（墊著葉片）。
 */
function buildKuehMold({ detail }) {
  const radial = detail ? 24 : 12
  const L = 0.25 // 印版（不含握柄）
  const HANDLE = 0.111
  const W = 0.173
  const T = 0.033
  const y = 0.03 + T / 2
  const cx = -HANDLE / 2 // 連柄全長 36.1 公分置中
  const mold = new Parts()
  mold.add(LACQUER, box(L, T, W), { p: [cx, y, 0] })
  mold.add(LACQUER_DARK, box(HANDLE, 0.026, 0.05), { p: [cx + L / 2 + HANDLE / 2, y, 0] })
  // 握柄底部的鐵圈
  mold.add(IRON, new TorusGeometry(0.014, 0.003, 6, detail ? 14 : 8), { p: [cx + L / 2 + HANDLE - 0.008, y, 0], r: [Math.PI / 2, 0, 0] })
  // 下面（蓋在粿上的一面）：龜紋——龜身的凹槽、兩圈龜甲、中央的六角框、四隻腳與頭
  const under = y - T / 2 - 0.001
  mold.add(WOOD_DARK, new CylinderGeometry(0.072, 0.072, 0.004, radial), { p: [cx, under, 0], s: [1.2, 1, 0.92] })
  mold.add(LACQUER, new TorusGeometry(0.052, 0.004, 4, radial), { p: [cx, under - 0.002, 0], r: [Math.PI / 2, 0, 0], s: [1.2, 0.92, 1] })
  mold.add(LACQUER, new CylinderGeometry(0.022, 0.022, 0.004, 6), { p: [cx, under - 0.002, 0] })
  if (detail) {
    // 外圈龜甲的分格
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      mold.add(LACQUER, box(0.022, 0.004, 0.003), { p: [cx + Math.cos(a) * 0.064, under - 0.002, Math.sin(a) * 0.058], r: [0, -a, 0] })
    }
    // 中央六角框裡的「壽」字（示意的筆畫）
    for (const dz of [-0.008, 0, 0.008]) mold.add(WOOD_DARK, box(0.022, 0.004, 0.002), { p: [cx, under - 0.004, dz] })
  }
  for (const [x, z] of [[0.058, 0.058], [0.058, -0.058], [-0.058, 0.058], [-0.058, -0.058], [0.1, 0]]) {
    mold.add(WOOD_DARK, new CylinderGeometry(0.015, 0.015, 0.004, 8), { p: [cx + x, under, z] })
  }
  // 上面：桃紋（雙線的桃形與桃尖）與銀圓紋
  const over = y + T / 2 + 0.001
  mold.add(WOOD_DARK, new CylinderGeometry(0.045, 0.045, 0.003, radial), { p: [cx - 0.045, over, 0], s: [1, 1, 1.1] })
  mold.add(LACQUER, new CylinderGeometry(0.036, 0.036, 0.004, radial), { p: [cx - 0.045, over, 0], s: [1, 1, 1.1] })
  mold.add(WOOD_DARK, new ConeGeometry(0.018, 0.03, 8), { p: [cx - 0.002, over, 0], r: [0, 0, -Math.PI / 2], s: [1, 1, 0.12] })
  mold.add(WOOD_DARK, new TorusGeometry(0.032, 0.004, 4, radial), { p: [cx + 0.065, over, 0], r: [Math.PI / 2, 0, 0] })
  if (detail) {
    mold.add(WOOD_DARK, box(0.014, 0.003, 0.014), { p: [cx + 0.065, over, 0], r: [0, Math.PI / 4, 0] })
    // 桃葉
    mold.add(WOOD_DARK, new SphereGeometry(0.014, 8, 4), { p: [cx - 0.045, over, 0.05], s: [1.6, 0.15, 0.7] })
  }
  // 側面：七枚連錢（流暢畫質四枚）
  const coins = detail ? 7 : 4
  for (let i = 0; i < coins; i++) {
    const x = cx - L / 2 + 0.025 + (i * (L - 0.05)) / (coins - 1)
    mold.add(WOOD_DARK, new TorusGeometry(0.009, 0.002, 4, 8), { p: [x, y, W / 2 + 0.001] })
  }

  // 紅龜粿（龜形的紅色糯米粿，背上印著龜甲紋）墊在葉片上
  const shell = detail ? 7 : 1
  const kueh = new Parts()
  kueh.add(BANANA_LEAF, box(0.26, 0.004, 0.18), { p: [0, 0.002, 0] })
  if (detail) kueh.add('#3f6a38', box(0.24, 0.002, 0.004), { p: [0, 0.005, 0] })
  kueh.add(KUEH_RED, new SphereGeometry(0.075, radial, detail ? 10 : 6), { p: [0, 0.006, 0], s: [1.25, 0.32, 0.95] })
  for (let i = 0; i < shell; i++) {
    const a = (i / 6) * Math.PI * 2
    const r = i === 0 ? 0 : 0.045
    kueh.add(KUEH_RED_DARK, new CylinderGeometry(0.017, 0.017, 0.003, 6), { p: [Math.cos(a) * r, 0.03, Math.sin(a) * r * 0.8] })
  }
  for (const [x, z] of [[0.06, 0.06], [0.06, -0.06], [-0.06, 0.06], [-0.06, -0.06], [0.11, 0]]) {
    kueh.add(KUEH_RED, new SphereGeometry(0.018, 8, 6), { p: [x, 0.012, z], s: [1, 0.55, 1] })
  }

  return {
    radius: 0.3,
    centerY: 0.05,
    viewPitch: 0.45,
    parts: [
      { id: 'kueh', geometry: kueh.build() },
      { id: 'mold', geometry: mold.build(), pivot: [0, y, -W / 2], animate: { action: 'press', axis: 'x', from: 0, to: -2.5 } },
    ],
  }
}

/**
 * 收涎餅（嬰兒滿四個月「收涎」的禮俗：教育部《臺灣台語常用詞辭典》「收瀾」——外婆家送中間有孔的口酥餅，
 * 用紅絲線串起來掛在嬰兒胸前，象徵收口水）。十二片小圓餅串在紅線上、放在紅紙上；
 * 餅的大小是示意，十二片取客家「做四個月」十二、二十四或三十六片的雙數。
 * 動作 lift：抓著繩結提起紅線，整串收涎餅轉成垂掛的樣子（像掛在嬰兒胸前）。
 */
function buildShouxianCakes({ detail }) {
  const radial = detail ? 18 : 10
  const COUNT = 12
  const R = 0.11 // 一串圍成的圓
  const paper = new Parts()
  paper.add(BOX_RED, box(0.28, 0.004, 0.28), { p: [0, 0.002, 0], r: [0, Math.PI / 8, 0] })
  if (detail) paper.add(GOLD, box(0.25, 0.001, 0.005), { p: [0, 0.0045, 0.115], r: [0, Math.PI / 8, 0] })

  const string = new Parts()
  const y = 0.016
  for (let i = 0; i < COUNT; i++) {
    const a = (i / COUNT) * Math.PI * 2
    const x = Math.cos(a) * R
    const z = Math.sin(a) * R
    // 口酥餅：扁圓、中央一個孔（用環面表示）、表面的烤色
    string.add(CAKE, new TorusGeometry(0.02, 0.011, detail ? 8 : 5, radial), { p: [x, y, z], r: [Math.PI / 2, 0, 0], s: [1, 1, 0.9] })
    if (detail) string.add(CAKE_DARK, new TorusGeometry(0.02, 0.003, 4, radial), { p: [x, y + 0.01, z], r: [Math.PI / 2, 0, 0] })
  }
  // 紅絲線：穿過每片餅的孔圍成一圈，上端打結
  string.add(KUEH_RED, new TorusGeometry(R, 0.0025, 4, detail ? 36 : 16), { p: [0, y, 0], r: [Math.PI / 2, 0, 0] })
  // 繩結在前緣（提起時抓這裡）
  string.add(KUEH_RED, new SphereGeometry(0.008, 8, 6), { p: [0, y + 0.004, R + 0.012] })
  if (detail) {
    for (const side of [-1, 1]) string.add(KUEH_RED, box(0.003, 0.003, 0.04), { p: [side * 0.008, y, R + 0.03], r: [0, side * 0.3, 0] })
  }

  return {
    radius: 0.32,
    centerY: 0.17,
    viewPitch: 0.4,
    parts: [
      { id: 'paper', geometry: paper.build() },
      // 抓著前緣的繩結提起來：整圈往下轉成垂掛，同時抬高（像掛在嬰兒胸前）
      { id: 'string', geometry: string.build(), pivot: [0, y, R + 0.012], animate: { action: 'lift', axis: 'x', from: 0, to: -1.5, drift: [0, 0.3, -0.06] } },
    ],
  }
}

/**
 * 最中（糯米燒成的薄脆餅皮包豆餡的和菓子；形制依一般最中的樣式：兩片花形餅皮）。
 * 動作 fill：上片餅皮掀開，看中間的紅豆餡；再按一下合起來。
 */
function buildMonaka({ detail }) {
  const radial = detail ? 30 : 12
  // 花形（圓邊上幾道淺凹）：用圓柱體加上花瓣邊的小圓
  const shell = (parts, y, flip) => {
    parts.add(MONAKA, new CylinderGeometry(0.075, 0.072, 0.02, radial), { p: [0, y, 0] })
    const petals = detail ? 8 : 0
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2
      parts.add(MONAKA_DARK, box(0.004, 0.022, 0.03), { p: [Math.cos(a) * 0.073, y, Math.sin(a) * 0.073], r: [0, -a, 0] })
    }
    // 餅皮表面燒出的紋（同心圓與中央的花心）
    parts.add(MONAKA_DARK, new TorusGeometry(0.045, 0.003, 4, radial), { p: [0, y + flip * 0.011, 0], r: [Math.PI / 2, 0, 0] })
    parts.add(MONAKA_DARK, new CylinderGeometry(0.012, 0.012, 0.003, 10), { p: [0, y + flip * 0.011, 0] })
  }
  const bottom = new Parts()
  // 木製小碟
  bottom.add(WOOD_LIGHT, box(0.24, 0.012, 0.18), { p: [0, 0.006, 0] })
  if (detail) bottom.add(WOOD, box(0.24, 0.002, 0.004), { p: [0, 0.013, 0.07] })
  shell(bottom, 0.022, 1)
  // 紅豆餡（顆粒餡：表面有豆粒）
  bottom.add(BEAN, new SphereGeometry(0.062, radial, detail ? 8 : 5), { p: [0, 0.033, 0], s: [1, 0.3, 1] })
  if (detail) {
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39
      const r = 0.012 + (i % 3) * 0.015
      bottom.add(BEAN_DARK, new SphereGeometry(0.007, 6, 4), { p: [Math.cos(a) * r, 0.05, Math.sin(a) * r], s: [1.3, 0.8, 1] })
    }
  }
  const top = new Parts()
  shell(top, 0.062, 1)

  return {
    radius: 0.22,
    centerY: 0.07,
    viewPitch: 0.4,
    parts: [
      { id: 'bottom', geometry: bottom.build() },
      // 上片：平時蓋在餡上，掀開時以後緣為樞軸翻起
      { id: 'top', geometry: top.build(), pivot: [0, 0.062, -0.075], animate: { action: 'fill', axis: 'x', from: 0, to: -1.75 } },
    ],
  }
}

export const PASTRY_BUILDERS = {
  'longevity-peach': buildLongevityPeach,
  'kueh-mold': buildKuehMold,
  'shouxian-cakes': buildShouxianCakes,
  monaka: buildMonaka,
}
