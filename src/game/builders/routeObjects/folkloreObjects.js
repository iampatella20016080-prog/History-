import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「軼事系列」的器物（第 12 階段）：依典藏與文獻的形制程式建模（data/routes/folkloreRoute.js），
 * 歌仔冊的內文、刺繡的紋樣都是簡化的示意。每個建模函式接受 { detail }，
 * 原點在器物底部中央；radius、centerY、viewPitch 的意思同 pastryObjects.js。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

const RED = '#b8323a'
const RED_DARK = '#8f2a30'
const SILK_GREEN = '#4f7a5a'
const SILK_BLUE = '#3f5f8a'
const GOLD = '#d8b25a'
const SOLE = '#3a302a'
const BAMBOO = '#c9ae74'
const BAMBOO_DARK = '#a88d55'
const RATTAN = '#8a6a44'
const GRAIN = '#d8c58c'
const BUN = '#cf3b3b'
const BUN_DARK = '#a92f33'
const BEAN = '#6b3a32'
const TRAY = '#9a6f45'
const PAPER = '#e8dcbc'
const PAPER_COVER = '#d9c08a'
const INK = '#3a342c'
const INK_SOFT = '#7a7060'

/**
 * 弓鞋（依台灣民俗文物館「弓鞋」0346：清末民初，布，長 11、寬 4.8、高 5 公分；尖頭、高跟、高鞋面，
 * 紅布繡花；纏足的閩南籍婦女穿的，多為富裕人家）。一雙；刺繡是示意的花樣。
 * 動作 flip：拿起一隻翻過來，看鞋底與鞋跟。
 */
function buildBowedShoes({ detail }) {
  const radial = detail ? 16 : 8
  const shoe = (parts, x) => {
    // 鞋底前低後高（後跟墊高），鞋身是長蛋形、前端收成往上翹的尖頭，鞋口在後上方
    parts.add(SOLE, box(0.03, 0.005, 0.09), { p: [x, 0.012, 0.004], r: [0.24, 0, 0] })
    parts.add(SOLE, new CylinderGeometry(0.011, 0.014, 0.028, radial), { p: [x, 0.014, -0.032] })
    parts.add(RED, new SphereGeometry(0.022, radial, detail ? 12 : 8), { p: [x, 0.03, 0.0], r: [0.24, 0, 0], s: [0.82, 0.9, 2.1] })
    parts.add(RED, new ConeGeometry(0.009, 0.026, radial), { p: [x, 0.03, 0.055], r: [Math.PI / 2 - 0.55, 0, 0] })
    parts.add(RED_DARK, new TorusGeometry(0.013, 0.0028, 4, radial), { p: [x, 0.05, -0.022], r: [Math.PI / 2 + 0.35, 0, 0], s: [1, 1.35, 1] })
    parts.add('#5a2a2a', new CylinderGeometry(0.011, 0.011, 0.002, radial), { p: [x, 0.051, -0.022], r: [0.35, 0, 0], s: [1, 1, 1.35] })
    // 繡花：鞋面的花與葉
    parts.add(GOLD, new SphereGeometry(0.006, 6, 4), { p: [x, 0.044, 0.012], s: [1, 0.5, 1] })
    parts.add(SILK_GREEN, new SphereGeometry(0.005, 6, 4), { p: [x + 0.009, 0.04, 0.022], s: [1.4, 0.4, 0.8] })
    if (detail) {
      parts.add(SILK_BLUE, new SphereGeometry(0.004, 6, 4), { p: [x - 0.009, 0.041, 0.004], s: [1, 0.4, 1] })
      parts.add(SILK_GREEN, new SphereGeometry(0.004, 6, 4), { p: [x - 0.007, 0.036, 0.03], s: [1.4, 0.4, 0.8] })
      // 鞋口的滾邊與鞋跟的包布
      for (let i = 0; i < 5; i++) parts.add(GOLD, box(0.0018, 0.0018, 0.007), { p: [x + Math.sin(i * 1.2) * 0.012, 0.037 - i * 0.002, 0.03 + i * 0.004] })
      parts.add(RED_DARK, new CylinderGeometry(0.0115, 0.0145, 0.004, radial), { p: [x, 0.026, -0.032] })
    }
  }
  const left = new Parts()
  shoe(left, -0.03)
  // 墊在下面的一塊紅布
  left.add('#e3d5ae', box(0.14, 0.003, 0.13), { p: [0, -0.0015, 0] })
  const right = new Parts()
  shoe(right, 0.03)

  return {
    radius: 0.11,
    centerY: 0.03,
    viewPitch: 0.35,
    parts: [
      { id: 'left', geometry: left.build() },
      { id: 'right', geometry: right.build(), pivot: [0.03, 0.03, 0], animate: { action: 'flip', axis: 'z', from: 0, to: Math.PI * 0.9, drift: [0.04, 0.05, 0] } },
    ],
  }
}

/**
 * 乞龜的紅麵龜（依文化局《走讀大稻埕》：紅麵團內包紅豆餡，印上烏龜圖樣；做法另見《臺灣民俗文物辭典》「麵龜」）。
 * 木托盤上三隻；動作 lift：拿起最上面的一隻、掰開看紅豆餡。
 */
function buildRedTurtleBuns({ detail }) {
  const radial = detail ? 22 : 10
  const turtle = (parts, x, y, z, s = 1) => {
    parts.add(BUN, new SphereGeometry(0.06 * s, radial, detail ? 10 : 6), { p: [x, y, z], s: [1.25, 0.42, 1] })
    // 龜甲的印紋與頭、四腳
    parts.add(BUN_DARK, new TorusGeometry(0.035 * s, 0.003, 4, radial), { p: [x, y + 0.024 * s, z], r: [Math.PI / 2, 0, 0], s: [1.25, 1, 1] })
    parts.add(BUN_DARK, new CylinderGeometry(0.014 * s, 0.014 * s, 0.003, 6), { p: [x, y + 0.026 * s, z] })
    parts.add(BUN, new SphereGeometry(0.016 * s, 8, 6), { p: [x + 0.08 * s, y - 0.004, z], s: [1.2, 0.6, 0.9] })
    for (const [dx, dz] of [[0.045, 0.045], [0.045, -0.045], [-0.045, 0.045], [-0.045, -0.045]]) parts.add(BUN, new SphereGeometry(0.014 * s, 6, 4), { p: [x + dx * s, y - 0.008, z + dz * s], s: [1, 0.5, 1] })
    if (detail) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        parts.add(BUN_DARK, new CylinderGeometry(0.01 * s, 0.01 * s, 0.003, 6), { p: [x + Math.cos(a) * 0.026 * s * 1.25, y + 0.022 * s, z + Math.sin(a) * 0.026 * s] })
      }
    }
  }
  const tray = new Parts()
  tray.add(TRAY, box(0.36, 0.015, 0.26), { p: [0, 0.0075, 0] })
  if (detail) for (const z of [-0.125, 0.125]) tray.add('#7a5432', box(0.36, 0.02, 0.01), { p: [0, 0.012, z] })
  turtle(tray, -0.09, 0.04, -0.04)
  turtle(tray, 0.07, 0.04, 0.05)
  // 最上面的一隻（乞龜）：拿起來，切面露出紅豆餡
  const top = new Parts()
  turtle(top, -0.01, 0.07, 0.0)
  top.add(BEAN, new SphereGeometry(0.036, radial, 6), { p: [-0.01, 0.068, 0.0], s: [1.2, 0.32, 0.9] })

  return {
    radius: 0.26,
    centerY: 0.05,
    viewPitch: 0.45,
    parts: [
      { id: 'tray', geometry: tray.build() },
      { id: 'top', geometry: top.build(), pivot: [-0.01, 0.07, 0], animate: { action: 'lift', axis: 'x', from: 0, to: -0.9, drift: [0, 0.12, 0.05] } },
    ],
  }
}

/**
 * 米篩（依國立臺灣歷史博物館 2005.008.1708：竹篾與厚竹片編製，長 74.2 × 寬 73.6 × 高 7.4 公分，
 * 圓盤狀、面大而淺、「壓一挑一」編出四角孔，口緣以粗竹條夾住內外兩側、尾端以籐皮返折纏繞；篩選米穀、豆類）。
 * 動作 sift：傾斜米篩，篩面上的稻穀滑向一邊。
 */
function buildRiceSieve({ detail }) {
  const radial = detail ? 40 : 16
  const R = 0.37
  const sieve = new Parts()
  // 篩面：淺盤（精緻畫質畫出壓一挑一的竹篾格子）
  sieve.add(BAMBOO, new CylinderGeometry(R, R - 0.01, 0.006, radial), { p: [0, 0.04, 0] })
  const strips = detail ? 24 : 8
  for (let i = 0; i < strips; i++) {
    const offset = -R * 0.9 + (i * R * 1.8) / (strips - 1)
    const len = 2 * Math.sqrt(Math.max(0, R * R - offset * offset)) * 0.96
    sieve.add(BAMBOO_DARK, box(len, 0.002, 0.004), { p: [0, 0.0445, offset] })
    sieve.add(BAMBOO_DARK, box(0.004, 0.002, len), { p: [offset, 0.0455, 0] })
  }
  // 口緣：粗竹條夾住內外兩側（兩圈）與籐皮纏繞
  sieve.add(BAMBOO, new TorusGeometry(R, 0.012, 6, radial), { p: [0, 0.05, 0], r: [Math.PI / 2, 0, 0] })
  sieve.add(BAMBOO_DARK, new TorusGeometry(R - 0.014, 0.008, 6, radial), { p: [0, 0.052, 0], r: [Math.PI / 2, 0, 0] })
  for (let i = 0; i < (detail ? 18 : 6); i++) {
    const a = (i / (detail ? 18 : 6)) * Math.PI * 2
    sieve.add(RATTAN, box(0.012, 0.03, 0.03), { p: [Math.cos(a) * R, 0.05, Math.sin(a) * R], r: [0, -a, 0] })
  }
  // 篩面上的稻穀
  sieve.add(GRAIN, new SphereGeometry(0.15, radial, 6), { p: [-0.05, 0.046, 0.02], s: [1.3, 0.12, 1] })
  if (detail) for (let i = 0; i < 20; i++) sieve.add(GRAIN, new SphereGeometry(0.008, 5, 3), { p: [0.12 + ((i * 37) % 11) * 0.012, 0.05, -0.1 + ((i * 53) % 17) * 0.012], s: [1.6, 0.6, 0.8] })

  return {
    radius: 0.48,
    centerY: 0.06,
    viewPitch: 0.55,
    parts: [{ id: 'sieve', geometry: sieve.build(), pivot: [0, 0.04, 0], animate: { action: 'sift', axis: 'z', from: 0, to: 0.28, drift: [0, 0.06, 0] } }],
  }
}

/**
 * 歌仔冊（依國立臺灣大學圖書館「歌仔冊與唸歌」典藏的竹林書局《周成過臺灣歌 上本》：民國 40 年 6 月、新竹，
 * 4 葉、16 公分）。薄薄的線裝小冊；封面與內頁的字不畫，以色塊示意七字一句的唱詞。
 * 動作 open：翻開封面。
 */
function buildSongbook({ detail }) {
  const H = 0.16 // 高
  const W = 0.115 // 寬（查無，示意）
  const T = 0.004
  const pages = new Parts()
  pages.add(PAPER, box(W, T, H), { p: [0, T / 2, 0] })
  // 內頁：直排的唱詞（七字一句，四句一段的示意）
  const cols = detail ? 12 : 5
  for (let i = 0; i < cols; i++) {
    for (let k = 0; k < (detail ? 2 : 1); k++) pages.add(INK_SOFT, box(0.003, 0.0006, H * (detail ? 0.38 : 0.8)), { p: [W / 2 - 0.012 - (i * (W - 0.02)) / cols, T + 0.0003, detail ? (k ? -0.035 : 0.04) : 0] })
  }
  // 書背的線（三個線眼）
  for (let i = 0; i < 3; i++) pages.add('#5a4a3a', box(0.008, T + 0.002, 0.003), { p: [-W / 2 + 0.006, T / 2, -0.05 + i * 0.05] })
  const cover = new Parts()
  cover.add(PAPER_COVER, box(W, 0.0012, H), { p: [0, T + 0.0006, 0] })
  // 封面的題簽與插圖框
  cover.add(INK, box(0.014, 0.0005, 0.1), { p: [W / 2 - 0.02, T + 0.0015, 0.01] })
  cover.add(INK_SOFT, box(0.06, 0.0005, 0.06), { p: [-0.01, T + 0.0015, -0.02] })
  if (detail) {
    cover.add(PAPER_COVER, box(0.052, 0.0006, 0.052), { p: [-0.01, T + 0.0017, -0.02] })
    cover.add(RED, box(0.012, 0.0006, 0.012), { p: [W / 2 - 0.02, T + 0.0016, -0.06] })
  }

  return {
    radius: 0.14,
    centerY: 0.005,
    viewPitch: 0.6,
    parts: [
      { id: 'pages', geometry: pages.build() },
      { id: 'cover', geometry: cover.build(), pivot: [-W / 2, T, 0], animate: { action: 'open', axis: 'z', from: 0, to: Math.PI * 0.95 } },
    ],
  }
}

export const FOLKLORE_BUILDERS = {
  'bowed-shoes': buildBowedShoes,
  'red-turtle-buns': buildRedTurtleBuns,
  'rice-sieve': buildRiceSieve,
  'zhou-cheng-songbook': buildSongbook,
}
