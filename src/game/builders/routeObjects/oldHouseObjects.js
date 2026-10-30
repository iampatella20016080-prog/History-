import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「老屋裡的新生活」的器物（第 12 階段）：依國立臺灣歷史博物館（臺史博）與文獻的形制程式建模，
 * 紋樣、店號與標籤文字都不複製（data/routes/oldHouseRoute.js）。每個建模函式接受 { detail }，
 * 原點在器物底部中央；radius、centerY、viewPitch 的意思同 pastryObjects.js。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

/* ── 顏色 ── */
const WOOD = '#9a6f45'
const WOOD_DARK = '#76522f'
const WOOD_LIGHT = '#b98c5a'
const WOOD_RED = '#8e4a34'
const IRON = '#4a4640'
const GRAIN = '#d8c58c'
const HUSK = '#c9ae6a'
const PAPER = '#efe4c8'
const PAPER_OLD = '#e3d3a8'
const COVER_BLUE = '#3f5a7a'
const THREAD = '#e9e2cf'
const TIN = '#a9a59a'
const TIN_DARK = '#87847a'
const LABEL = '#e8dcbc'
const SEAL = '#b8463a'
const TEA_LEAF = '#4a4a30'
const GLASS = '#c9dcd8'
const GLASS_BROWN = '#7a4a26'
const CORK = '#b08a5c'
const CAKE = '#e2b06a'
const CAKE_DARK = '#c48e4a'

/**
 * 風鼓（依臺史博 2000.003.0001「風鼓車」：木質，長 77.2 × 寬 139.8 × 高 129.1 公分；
 * 上方倒梯形的風鼓斗、可以抽開的風鼓掩、方形的風鼓櫃、圓形的風鼓肚裡有風鼓葉、一側的風鼓手（搖柄）、
 * 頭皂與二皂兩個出口、四支風鼓腳；店號與紅紙不畫）。
 * 動作 crank：搖兩圈風鼓手，風鼓葉跟著轉，風鼓掩抽開。
 */
function buildWinnowingFan({ detail }) {
  const radial = detail ? 28 : 12
  const W = 1.398 // 寬（含風鼓肚與出風口）
  const D = 0.772 // 長（前後）
  const H = 1.291
  const body = new Parts()
  // 四支風鼓腳與兩側的風鼓架
  for (const x of [-0.42, 0.28]) for (const z of [-D / 2 + 0.06, D / 2 - 0.06]) body.add(WOOD_DARK, box(0.07, 0.62, 0.07), { p: [x, 0.31, z] })
  for (const z of [-D / 2 + 0.06, D / 2 - 0.06]) body.add(WOOD_DARK, box(W * 0.85, 0.06, 0.06), { p: [-0.05, 0.6, z] })
  // 風鼓櫃（方形）與風鼓肚（圓形，在右側）
  body.add(WOOD, box(0.62, 0.42, D * 0.62), { p: [-0.2, 0.83, 0] })
  body.add(WOOD, new CylinderGeometry(0.33, 0.33, D * 0.66, radial), { p: [0.3, 0.86, 0], r: [Math.PI / 2, 0, 0] })
  body.add(WOOD_LIGHT, new CylinderGeometry(0.2, 0.2, D * 0.67, radial), { p: [0.3, 0.86, 0], r: [Math.PI / 2, 0, 0] })
  // 出風口（左側，空殼與雜物從這裡吹出）
  body.add(WOOD, box(0.32, 0.26, D * 0.5), { p: [-0.62, 0.84, 0] })
  body.add('#3a2e22', box(0.02, 0.2, D * 0.42), { p: [-0.785, 0.84, 0] })
  // 頭皂、二皂：櫃子底下兩個斜的出口
  for (const [x, len] of [[-0.3, 0.3], [-0.05, 0.24]]) body.add(WOOD_DARK, box(0.12, len, 0.16), { p: [x, 0.52, D * 0.18], r: [0.5, 0, 0] })
  // 風鼓斗（倒梯形漏斗）
  body.add(WOOD, new CylinderGeometry(0.4, 0.16, 0.3, 4, 1, true), { p: [-0.2, 1.2, 0], r: [0, Math.PI / 4, 0], s: [1, 1, D / 0.8] })
  body.add('#5a4630', new CylinderGeometry(0.36, 0.14, 0.27, 4, 1, true), { p: [-0.2, 1.21, 0], r: [0, Math.PI / 4, 0], s: [-1, 1, D / 0.8] })
  // 斗裡的稻穀
  body.add(GRAIN, new CylinderGeometry(0.3, 0.3, 0.02, 4), { p: [-0.2, 1.27, 0], r: [0, Math.PI / 4, 0], s: [1, 1, D / 0.8] })
  // 出口下方落下的稻穀小堆
  body.add(GRAIN, new SphereGeometry(0.1, detail ? 12 : 6, 6), { p: [-0.33, 0.02, D * 0.34], s: [1.3, 0.35, 1] })
  if (detail) {
    body.add(HUSK, new SphereGeometry(0.08, 10, 5), { p: [-0.95, 0.02, 0], s: [1.5, 0.25, 1.2] })
    // 木板的拼縫
    for (let i = -2; i <= 2; i++) body.add(WOOD_DARK, box(0.004, 0.42, D * 0.62 + 0.004), { p: [-0.2 + i * 0.12, 0.83, 0] })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      body.add(IRON, new SphereGeometry(0.012, 6, 4), { p: [0.3 + Math.cos(a) * 0.28, 0.86 + Math.sin(a) * 0.28, D * 0.335] })
    }
  }

  // 風鼓葉（在風鼓肚裡，從前面的開口看得到）與風鼓手（搖柄，在前側）：同一根軸
  const fan = new Parts()
  const blades = detail ? 6 : 4
  for (let i = 0; i < blades; i++) fan.add(WOOD_LIGHT, box(0.36, 0.04, D * 0.5), { p: [0.3, 0.86, 0], r: [0, 0, (i / blades) * Math.PI] })
  fan.add(IRON, new CylinderGeometry(0.02, 0.02, D * 0.9, 8), { p: [0.3, 0.86, 0], r: [Math.PI / 2, 0, 0] })
  fan.add(IRON, box(0.03, 0.2, 0.025), { p: [0.3, 0.86 + 0.1, D * 0.45] })
  fan.add(WOOD_DARK, new CylinderGeometry(0.02, 0.02, 0.12, 8), { p: [0.3, 0.86 + 0.2, D * 0.45 + 0.06], r: [Math.PI / 2, 0, 0] })

  // 風鼓掩（斗底的擋板）：搖的時候抽開
  const gate = new Parts()
  gate.add(WOOD_RED, box(0.3, 0.02, 0.24), { p: [-0.2, 1.05, 0] })
  gate.add(WOOD_DARK, box(0.05, 0.05, 0.05), { p: [-0.2, 1.05, 0.14] })

  return {
    radius: 1.0,
    centerY: 0.72,
    viewPitch: 0.2,
    parts: [
      { id: 'body', geometry: body.build() },
      { id: 'fan', geometry: fan.build(), pivot: [0.3, 0.86, 0], animate: { action: 'crank', axis: 'z', from: 0, to: -Math.PI * 4 } },
      { id: 'gate', geometry: gate.build(), pivot: [-0.2, 1.05, 0], animate: { action: 'crank', kind: 'slide', axis: 'z', from: 0, to: 0.18 } },
    ],
  }
}

/**
 * 米店的帳冊（依臺史博 2010.015.0220.0067 瑞興號米店帳冊：19.8 × 19.1 × 1.4 公分，棉線裝訂、藍色封面，
 * 日本時代（內頁有「庚申」，對照同套的「大正九年庚申」約 1920 年）；瑞興號與錦瑞號帳冊全套 72 冊；內頁的字不畫）。
 * 動作 open：翻開封面，看裡頭直行的帳目格子。
 */
function buildRiceLedger({ detail }) {
  const S = 0.198
  const T = 0.014
  const pages = new Parts()
  pages.add(PAPER_OLD, box(S - 0.004, T - 0.002, 0.191 - 0.004), { p: [0, T / 2, 0] })
  pages.add(COVER_BLUE, box(S, 0.0015, 0.191), { p: [0, 0.00075, 0] })
  // 內頁的直行格線與帳目（示意的色塊，不寫字）
  const rows = detail ? 10 : 5
  for (let i = 0; i < rows; i++) pages.add('#b9a77e', box(0.0015, 0.0006, 0.16), { p: [-0.08 + (i * 0.16) / (rows - 1), T + 0.0003, 0] })
  if (detail) {
    for (let i = 0; i < 9; i++) for (let k = 0; k < 4; k++) pages.add('#5a5048', box(0.006, 0.0006, 0.012 + ((i + k) % 3) * 0.006), { p: [-0.072 + i * 0.018, T + 0.0004, -0.06 + k * 0.04] })
    pages.add(SEAL, box(0.014, 0.0007, 0.014), { p: [0.06, T + 0.0005, -0.07] })
  }
  // 棉線裝訂（書背的四個線眼與繞線）
  for (let i = 0; i < 4; i++) pages.add(THREAD, box(0.012, T + 0.002, 0.003), { p: [-S / 2 + 0.008, T / 2, -0.07 + i * 0.047] })

  const cover = new Parts()
  cover.add(COVER_BLUE, box(S, 0.0015, 0.191), { p: [0, T + 0.00075, 0] })
  cover.add(LABEL, box(0.03, 0.0006, 0.11), { p: [S / 2 - 0.03, T + 0.0016, -0.02] })
  if (detail) cover.add('#2f4560', box(S, 0.0006, 0.004), { p: [0, T + 0.0016, 0.093] })

  return {
    radius: 0.17,
    centerY: 0.01,
    viewPitch: 0.5,
    parts: [
      { id: 'pages', geometry: pages.build() },
      { id: 'cover', geometry: cover.build(), pivot: [-S / 2, T, 0], animate: { action: 'open', axis: 'z', from: 0, to: Math.PI * 0.96 } },
    ],
  }
}

/**
 * 壽字桃形餅印（依臺史博 2012.019.0010「酒瓶形單面雕桃形壽字紋帶柄餅印」：木質，22.1 × 11.7 × 3.1 公分，
 * 推測 1960–1980 年；桃形外圈、中央「壽」字、周圍桃葉花草，用來做神誕或壽慶的糕餅；柄尾的紅絲帶不畫）。
 * 動作 press：餅印以握柄那端為樞軸翻起，刻紋轉向你，底下是剛印好的桃形糕餅。
 */
function buildLongevityCakeMould({ detail }) {
  const radial = detail ? 24 : 12
  const T = 0.031
  const y = 0.022 + T / 2
  const mould = new Parts()
  // 酒瓶形：圓的印面加上漸窄的頸與握柄
  mould.add(WOOD, new CylinderGeometry(0.058, 0.058, T, radial), { p: [0.03, y, 0] })
  mould.add(WOOD, box(0.06, T, 0.07), { p: [-0.035, y, 0] })
  mould.add(WOOD_DARK, box(0.075, T * 0.8, 0.034), { p: [-0.1, y, 0] })
  // 印面朝下：桃形外圈（兩個圓與一個尖）、中央的「壽」（示意的筆畫）、桃葉
  const under = y - T / 2 - 0.001
  mould.add(WOOD_DARK, new CylinderGeometry(0.042, 0.042, 0.004, radial), { p: [0.03, under, 0], s: [1, 1, 1.05] })
  mould.add(WOOD_DARK, new SphereGeometry(0.02, 8, 4), { p: [0.075, under, 0], s: [1.2, 0.1, 0.6] })
  mould.add(WOOD_LIGHT, new TorusGeometry(0.034, 0.003, 4, radial), { p: [0.03, under - 0.002, 0], r: [Math.PI / 2, 0, 0] })
  for (const dz of detail ? [-0.012, -0.004, 0.004, 0.012] : [-0.006, 0.006]) mould.add(WOOD_LIGHT, box(0.026, 0.003, 0.0025), { p: [0.03, under - 0.002, dz] })
  if (detail) {
    mould.add(WOOD_LIGHT, box(0.003, 0.003, 0.03), { p: [0.03, under - 0.002, 0] })
    for (const side of [-1, 1]) mould.add(WOOD_LIGHT, new SphereGeometry(0.009, 6, 4), { p: [-0.005, under - 0.002, side * 0.03], s: [1.6, 0.25, 0.7] })
    // 木紋
    for (let i = 0; i < 4; i++) mould.add(WOOD_LIGHT, box(0.1, 0.0015, 0.002), { p: [0.0, y + T / 2, -0.03 + i * 0.02] })
  }

  // 印好的桃形糕餅
  const cake = new Parts()
  cake.add(WOOD_LIGHT, box(0.2, 0.01, 0.15), { p: [0.03, 0.005, 0] })
  cake.add(CAKE, new CylinderGeometry(0.04, 0.042, 0.012, radial), { p: [0.03, 0.016, 0], s: [1, 1, 1.05] })
  cake.add(CAKE, new SphereGeometry(0.018, 8, 4), { p: [0.072, 0.016, 0], s: [1.2, 0.3, 0.6] })
  cake.add(CAKE_DARK, new TorusGeometry(0.032, 0.0025, 4, radial), { p: [0.03, 0.022, 0], r: [Math.PI / 2, 0, 0] })
  for (const dz of detail ? [-0.012, -0.004, 0.004, 0.012] : [-0.006, 0.006]) cake.add(CAKE_DARK, box(0.024, 0.002, 0.002), { p: [0.03, 0.0225, dz] })

  return {
    radius: 0.2,
    centerY: 0.03,
    viewPitch: 0.45,
    parts: [
      { id: 'cake', geometry: cake.build() },
      { id: 'mould', geometry: mould.build(), pivot: [-0.14, y, 0], animate: { action: 'press', axis: 'z', from: 0, to: 2.4 } },
    ],
  }
}

/**
 * 包種茶罐與四方包（茶罐依臺史博 2019.031.0393「新芳春茶行包種茶茶罐」：金屬方罐，8.6 × 8.5 × 9.5 公分，
 * 推測 1932–1945 年，一面貼紙——標籤上的字不畫；四方包依《農業周刊》15 卷 34 期：方形毛邊紙兩張內外相襯，
 * 包四兩茶葉成長方形的四方包，外面蓋茶名與行號的印章）。
 * 動作 open：打開罐蓋，罐裡的四方包升起來，再打開紙包看茶葉。
 */
function buildBaozhongTin({ detail }) {
  const W = 0.086
  const D = 0.085
  const H = 0.095
  const tin = new Parts()
  tin.add(TIN, box(W, H - 0.012, D), { p: [0, (H - 0.012) / 2, 0] })
  if (detail) {
    for (const yy of [0.004, H - 0.016]) tin.add(TIN_DARK, box(W + 0.002, 0.004, D + 0.002), { p: [0, yy, 0] })
    // 罐身的鏽斑
    for (let i = 0; i < 5; i++) tin.add('#8a6a4a', new SphereGeometry(0.004, 6, 4), { p: [W / 2 + 0.0005, 0.015 + i * 0.013, -0.03 + ((i * 7) % 5) * 0.014], s: [0.2, 1, 1.3] })
  }
  // 正面的貼紙：表格欄位（橫線與直欄）、空白不寫字
  tin.add(LABEL, box(0.068, 0.07, 0.001), { p: [0, 0.046, D / 2 + 0.0006] })
  tin.add('#8a7a5a', box(0.066, 0.0012, 0.0012), { p: [0, 0.066, D / 2 + 0.0012] })
  for (const x of [-0.011, 0.011]) tin.add('#8a7a5a', box(0.0012, 0.05, 0.0012), { p: [x, 0.04, D / 2 + 0.0012] })
  if (detail) tin.add(SEAL, box(0.01, 0.01, 0.0012), { p: [0.022, 0.025, D / 2 + 0.0013] })

  const lid = new Parts()
  lid.add(TIN_DARK, box(W + 0.003, 0.016, D + 0.003), { p: [0, H - 0.008, 0] })
  lid.add(TIN, box(W - 0.01, 0.002, D - 0.01), { p: [0, H + 0.001, 0] })

  // 四方包：長方形的紙包、外層毛邊紙、蓋著紅色印章；打開時從罐裡升起
  const pack = new Parts()
  pack.add(PAPER, box(0.07, 0.03, 0.05), { p: [0, H - 0.03, 0] })
  pack.add(PAPER_OLD, box(0.072, 0.002, 0.052), { p: [0, H - 0.015, 0] })
  pack.add(SEAL, box(0.018, 0.0015, 0.018), { p: [0.012, H - 0.0135, 0.004] })
  if (detail) {
    pack.add(SEAL, box(0.008, 0.0015, 0.024), { p: [-0.016, H - 0.0135, 0] })
    pack.add(PAPER_OLD, box(0.07, 0.03, 0.002), { p: [0, H - 0.03, 0.025], r: [0.08, 0, 0] })
    pack.add(TEA_LEAF, new SphereGeometry(0.004, 5, 4), { p: [0.03, H - 0.014, 0.02] })
  }

  return {
    radius: 0.13,
    centerY: 0.07,
    viewPitch: 0.35,
    parts: [
      { id: 'tin', geometry: tin.build() },
      { id: 'lid', geometry: lid.build(), pivot: [0, H, -D / 2], animate: { action: 'open', axis: 'x', from: 0, to: -2.2 } },
      { id: 'pack', geometry: pack.build(), pivot: [0, H, 0], animate: { action: 'open', kind: 'slide', axis: 'y', from: 0, to: 0.07, drift: [0, 0, 0.03] } },
    ],
  }
}

/**
 * 藥房的玻璃藥瓶（依臺史博的藥瓶：2004.028.5685 透明玻璃瓶配木蓋 3.6 × 3.6 × 7.9 公分、
 * 2019.036.0022.0002 褐色玻璃小藥瓶附蓋 2.6 × 2.6 × 4.4 公分；第三只軟木塞細瓶依藝術與建築索引典「藥鋪瓶」的
 * 一般形制：玻璃製、玻璃塞或軟木塞，內容物的名稱用標籤或鑄在玻璃上。標籤空白不寫字）。
 * 動作 uncork：拔起三個瓶塞。
 */
function buildPharmacyBottles({ detail }) {
  const radial = detail ? 18 : 8
  const tray = new Parts()
  tray.add(WOOD_DARK, box(0.16, 0.01, 0.09), { p: [0, 0.005, 0] })
  if (detail) for (const z of [-0.042, 0.042]) tray.add(WOOD, box(0.16, 0.012, 0.006), { p: [0, 0.011, z] })
  const bottles = [
    { x: -0.045, w: 0.036, h: 0.079, color: GLASS, cap: WOOD_LIGHT, capH: 0.012, square: true },
    { x: 0.012, w: 0.026, h: 0.044, color: GLASS_BROWN, cap: '#3a3632', capH: 0.008, square: true },
    { x: 0.055, w: 0.02, h: 0.064, color: '#dfe8e4', cap: CORK, capH: 0.01, square: false },
  ]
  const caps = new Parts()
  for (const b of bottles) {
    const bodyH = b.h - b.capH - 0.008
    if (b.square) tray.add(b.color, box(b.w, bodyH, b.w), { p: [b.x, 0.01 + bodyH / 2, 0] })
    else tray.add(b.color, new CylinderGeometry(b.w / 2, b.w / 2, bodyH, radial), { p: [b.x, 0.01 + bodyH / 2, 0] })
    // 肩與瓶頸
    tray.add(b.color, new CylinderGeometry(b.w * 0.22, b.w * (b.square ? 0.45 : 0.48), 0.008, radial), { p: [b.x, 0.01 + bodyH + 0.004, 0] })
    // 空白的標籤
    tray.add(LABEL, box(b.w * 0.8, bodyH * 0.45, 0.0008), { p: [b.x, 0.01 + bodyH * 0.45, b.w / 2 + 0.0005] })
    if (detail) tray.add('#9aa8a4', box(b.w * 0.7, 0.002, 0.001), { p: [b.x, 0.01 + bodyH * 0.72, b.w / 2 + 0.0006] })
    caps.add(b.cap, new CylinderGeometry(b.w * 0.24, b.w * 0.2, b.capH, radial), { p: [b.x, 0.01 + bodyH + 0.008 + b.capH / 2, 0] })
    if (detail) caps.add(b.cap, new CylinderGeometry(b.w * 0.3, b.w * 0.3, 0.003, radial), { p: [b.x, 0.01 + bodyH + 0.008 + b.capH, 0] })
  }

  return {
    radius: 0.12,
    centerY: 0.04,
    viewPitch: 0.25,
    parts: [
      { id: 'tray', geometry: tray.build() },
      { id: 'caps', geometry: caps.build(), pivot: [0, 0.06, 0], animate: { action: 'uncork', kind: 'slide', axis: 'y', from: 0, to: 0.035 } },
    ],
  }
}

export const OLD_HOUSE_BUILDERS = {
  'winnowing-fan': buildWinnowingFan,
  'rice-ledger': buildRiceLedger,
  'longevity-cake-mould': buildLongevityCakeMould,
  'baozhong-tin': buildBaozhongTin,
  'pharmacy-bottles': buildPharmacyBottles,
}
