import { IcosahedronGeometry } from 'three'
import { FURNITURE as LHT_FURNITURE } from '../linHuaTai/linHuaTaiFurniture.js'
import { shade } from '../props.js'
import { createRng } from '../../utils/random.js'
import { abacus, bambooBasket, bambooSieve, steelyard } from './riceCultureExhibit.js'
import { riceMeasure } from './riceMeasure.js'

/**
 * 迪化街 329 號酒樓繁華版店內的器物（第 11 階段第 9 項）：清單在 data/riceAndShineBanquetLayout.js，寫法同有記名茶
 * （build／footprint／height；見 builders/shopInterior.js）。麻袋沿用林華泰的 sackPile。
 * 形制依據：米箱依國家文化記憶庫「傳統米店」（宜蘭南館市場，2020 年攝）的說明——木製大米箱盛米；
 * 米籮依臺史博 2003.001.0530（底方口圓、口框繫兩條繩）；米斗、桿秤、算盤、米篩沿用稻舍其他年代的模型。日治時期北街米店的店內照片查無，整間是歷史情境重建。
 */

const WOOD = '#8f6a45'
const WOOD_DARK = '#5e422c'
/** 牆上米篩的半徑（三面並排、不重疊；館藏約 74 公分，這裡縮小才掛得下） */
const SIEVE_R = 0.31
const WHITE_RICE = '#e9e0c6'
const BROWN_RICE = '#c9a878'

/** 沒有細部的建模器（bambooSieve 要求 detail 有 group／box） */
const NO_DETAIL = { group() {}, box() {}, add() {} }

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })
const around = (x, z, hx, hz = hx) => rect(x - hx, x + hx, z - hz, z + hz)

/** 一堆米（壓扁的橢球） */
function riceHeap(b, x, y, z, rx, rz, h, tint, seed = 1) {
  const rng = createRng(seed)
  b.add('plain', new IcosahedronGeometry(1, 1), { position: [x, y + h * 0.4, z], scale: [rx, h, rz], rotation: [0, rng() * 3, 0], tint })
}

export const RICE_BANQUET_FURNITURE = {
  ...LHT_FURNITURE,

  /**
   * 木製大米箱（靠左牆、長邊沿 z，正面朝 +x）：木板釘的箱身，隔板分成白米與糙米兩格，
   * 箱後的牆板立著兩片掀起的蓋子；箱口前緣架著木勺。尺寸是示意。
   */
  riceBin: {
    build(b, item, detail) {
      const { x, z, length, depth, height } = item
      b.group([x, 0, z], 0, () => {
        const hl = length / 2
        const hd = depth / 2
        // 箱底、前後側板（前低後高）
        b.box('planks', [depth, 0.05, length], [0, 0.18, 0], { tint: shade(WOOD, 0.8) })
        b.box('planks', [0.045, height, length], [hd - 0.0225, height / 2, 0], { tint: WOOD, grime: 0.2 })
        b.box('planks', [0.045, height + 0.32, length], [-hd + 0.0225, (height + 0.32) / 2, 0], { tint: shade(WOOD, 0.9), grime: 0.2 })
        for (const s of [-1, 1]) b.box('planks', [depth, height, 0.045], [0, height / 2, s * (hl - 0.0225)], { tint: shade(WOOD, 0.94), grime: 0.2 })
        // 中間的隔板
        b.box('wood', [depth - 0.09, height - 0.04, 0.04], [0, (height - 0.04) / 2, 0], { tint: shade(WOOD, 0.85) })
        // 米：白米（靠門那一格 +z）與糙米
        riceHeap(b, 0, height - 0.1, hl / 2 + 0.02, hd - 0.08, hl / 2 - 0.08, 0.13, WHITE_RICE, 7)
        riceHeap(b, 0, height - 0.1, -hl / 2 - 0.02, hd - 0.08, hl / 2 - 0.08, 0.13, BROWN_RICE, 9)
        // 木箱的鐵箍與前板的木條
        for (const dz of [-hl + 0.08, hl - 0.08]) b.box('steel', [depth + 0.02, 0.04, 0.02], [0, height * 0.55, dz], { tint: '#3a3634' })
        b.box('wood', [0.05, 0.05, length + 0.04], [hd, height, 0], { tint: shade(WOOD, 1.08) })
        // 箱後的兩片蓋子（掀起、靠在牆上）與鉸鏈
        for (const s of [-1, 1]) {
          b.box('planks', [0.04, 0.78, length / 2 - 0.08], [-hd - 0.03, height + 0.4, s * (length / 4)], { rotation: [0, 0, 0.16], tint: shade(WOOD, 1.02), grime: 0.2 })
          b.box('steel', [0.03, 0.04, 0.12], [-hd + 0.01, height + 0.32, s * (length / 4)], { tint: '#3a3634' })
        }
        // 前緣的木勺（斗沿上放一把）
        b.cylinder('wood', 0.012, 0.012, 0.34, 6, [hd - 0.05, height + 0.04, 0.22], { rotation: [Math.PI / 2, 0, 0.1], tint: '#a98355' })
        b.add('wood', new IcosahedronGeometry(0.06, 0), { position: [hd - 0.05, height + 0.045, 0.41], scale: [1, 0.5, 1], tint: '#a98355' })
        detail.box('dark', [0.004, 0.2, 0.004], [hd + 0.001, height * 0.5, 0.2], { tint: '#2f2217' })
        detail.box('dark', [0.004, 0.2, 0.004], [hd + 0.001, height * 0.5, -0.2], { tint: '#2f2217' })
      })
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.03, item.x + item.depth / 2 + 0.03, item.z - item.length / 2, item.z + item.length / 2),
    height: (item) => item.height + 0.5,
  },

  /** 米籮（竹編的籮筐，裝著米；門內擺兩只） */
  riceBasket: {
    build(b, item, detail) {
      const { x, z, radius, seed } = item
      bambooBasket(b, detail, x, 0.02, z, radius, 0.36, seed)
      // 臺史博 2003.001.0530：底四方、口圓
      b.box('bamboo', [radius * 1.5, 0.04, radius * 1.5], [x, 0.03, z], { tint: '#a07440' })
      riceHeap(b, x, 0.3, z, radius * 0.86, radius * 0.86, 0.12, seed % 2 ? BROWN_RICE : WHITE_RICE, seed)
      // 口框上繫扁擔用的兩條繩（細部）：從籮口的四個點往上，在中央上方交會
      const reach = radius * 0.94
      const apex = 0.24
      const tilt = Math.atan2(reach, apex)
      const len = Math.hypot(reach, apex)
      for (const a of [0, Math.PI / 2]) {
        for (const s of [-1, 1]) detail.cylinder('plain', 0.005, 0.005, len, 4, [x + (Math.cos(a) * s * reach) / 2, 0.38 + apex / 2, z + (Math.sin(a) * s * reach) / 2], { rotation: [-Math.sin(a) * s * tilt, 0, Math.cos(a) * s * tilt], tint: '#b49a6c' })
      }
    },
    footprint: (item) => around(item.x, item.z, item.radius + 0.04),
    height: () => 0.5,
  },

  /**
   * 掛在左牆上的米篩（三面竹篩並排掛在木橫梁上）。block: false：貼牆的擺設不擋路
   */
  sieveRack: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const mid = (z0 + z1) / 2
      b.box('wood', [0.05, 0.05, z1 - z0], [x + 0.03, 1.95, mid], { tint: WOOD_DARK })
      b.box('wood', [0.05, 0.05, z1 - z0], [x + 0.03, 1.1, mid], { tint: WOOD_DARK })
      const n = 3
      for (let i = 0; i < n; i++) {
        const sz = z0 + ((z1 - z0) * (i + 0.5)) / n
        const sx = x + 0.1
        // 竹篩的編織紋路（bambooSieve 的細部是給平放的竹篩；掛在牆上的竹篩在牆面的平面上畫）
        bambooSieve(b, NO_DETAIL, sx, 1.55, sz, SIEVE_R, { tilt: Math.PI / 2, rotationY: Math.PI / 2, seed: 20 + i })
        for (let k = -3; k <= 3; k++) {
          const at = (k * SIEVE_R * 0.92) / 3.5
          const half = Math.sqrt((SIEVE_R * 0.92) ** 2 - at * at)
          detail.box('bamboo', [0.004, half * 2, 0.012], [sx + 0.008, 1.55, sz + at], { tint: k % 2 ? '#b58a52' : '#d8b278' })
          detail.box('bamboo', [0.004, 0.012, half * 2], [sx + 0.01, 1.55 + at, sz], { tint: k % 2 ? '#d8b278' : '#b58a52' })
        }
        b.box('wood', [0.02, 0.8, 0.02], [x + 0.05, 1.55, sz - 0.15], { tint: WOOD_DARK })
        b.box('wood', [0.02, 0.8, 0.02], [x + 0.05, 1.55, sz + 0.15], { tint: WOOD_DARK })
      }
    },
    footprint: (item) => rect(item.x - 0.05, item.x + 0.25, item.z0, item.z1),
    height: () => 2.0,
  },

  /**
   * 櫃台（林華泰的櫃台）：檯面上的桿秤（掛在小木架上）、米斗與算盤。
   * 三件都是可以近看的器物（位置見 RB_INSPECT_SPOTS）。
   */
  riceCounter: {
    build(b, item, detail) {
      LHT_FURNITURE.counter.build(b, { ...item, goods: null }, detail)
      const top = item.height
      // 算盤（靠門的一端）
      abacus(b, item.x - 0.05, top + 0.03, item.z + item.length / 2 - 0.35, Math.PI / 2)
      b.box('wood', [0.3, 0.02, 0.18], [item.x - 0.05, top + 0.01, item.z + item.length / 2 - 0.35], { rotation: [0, Math.PI / 2, 0], tint: '#3a281d' })
      // 米斗（中段）
      riceMeasure(b, detail, item.x - 0.05, top, item.z + 0.0, 0.12, 0.3)
      // 桿秤（後段）：小木架、橫桿與秤盤
      const sz = item.z - item.length / 2 + 0.32
      b.box('wood', [0.04, 0.3, 0.04], [item.x - 0.05, top + 0.15, sz - 0.28], { tint: WOOD_DARK })
      b.box('wood', [0.2, 0.03, 0.03], [item.x - 0.05, top + 0.3, sz - 0.2], { tint: WOOD_DARK })
      steelyard(b, item.x - 0.05, top + 0.3, sz, Math.PI / 2)
      // 另一端：一疊紙與印章
      b.box('plain', [0.22, 0.03, 0.3], [item.x + 0.1, top + 0.015, item.z + item.length / 2 - 0.1], { tint: '#e7dcc0' })
    },
    footprint: (item) => LHT_FURNITURE.counter.footprint(item),
    height: (item) => item.height + 0.4,
  },

  /**
   * 帳桌（右牆後段）：矮桌、攤開的帳簿、硯與筆；旁邊一張板凳。帳簿只是示意，不寫字
   * （本站沒有找到這間店的帳冊照片）。
   */
  ledgerDesk: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.group([x, 0, z], 0, () => {
        b.box('wood', [depth, 0.05, width], [0, height - 0.025, 0], { tint: '#9a7856' })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, height - 0.05, 0.06], [sx * (depth / 2 - 0.07), (height - 0.05) / 2, sz * (width / 2 - 0.07)], { tint: '#7a5c40' })
        b.box('wood', [depth - 0.1, 0.04, width - 0.1], [0, height - 0.18, 0], { tint: shade(WOOD_DARK, 1.05) })
        // 攤開的帳簿
        b.box('plain', [0.3, 0.025, 0.4], [0.02, height + 0.012, 0.05], { tint: '#d9ccaa' })
        b.box('plain', [0.005, 0.03, 0.4], [0.02, height + 0.014, 0.05], { tint: '#8a7a5a' })
        b.box('dark', [0.3, 0.008, 0.01], [0.02, height + 0.027, -0.05], { tint: '#2a2420' })
        detail.box('dark', [0.22, 0.004, 0.006], [0.02, height + 0.027, 0.0], { tint: '#2a2420' })
        detail.box('dark', [0.22, 0.004, 0.006], [0.02, height + 0.027, 0.06], { tint: '#2a2420' })
        // 硯與筆
        b.box('dark', [0.1, 0.04, 0.07], [-0.16, height + 0.02, -0.3], { tint: '#26221f' })
        b.cylinder('wood', 0.005, 0.005, 0.18, 5, [-0.14, height + 0.015, -0.18], { rotation: [Math.PI / 2, 0, 0.5], tint: '#2a2420' })
      })
      // 板凳
      b.box('wood', [0.28, 0.04, 0.5], [x - depth / 2 - 0.2, 0.42, z], { tint: '#8a6a48' })
      for (const dz of [-0.2, 0.2]) b.box('wood', [0.06, 0.4, 0.06], [x - depth / 2 - 0.2, 0.2, z + dz], { tint: '#6a4a30' })
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.4, item.x + item.depth / 2 + 0.03, item.z - item.width / 2, item.z + item.width / 2),
    height: (item) => item.height + 0.2,
  },
}
