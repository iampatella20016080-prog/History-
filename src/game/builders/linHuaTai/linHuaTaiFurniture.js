import { IcosahedronGeometry } from 'three'
import { jar, sack, shade, teaChest } from '../props.js'
import { pickingTable, roastingBasket, roastingPlatform } from '../teaWares.js'

/**
 * 林華泰茶行各年代室內的器物（第 11 階段）：資料是 data/linHuaTaiLayout.js 的器物清單
 * （type、位置、大小），每一種器物有三個函式：
 * - build(b, item, detail)：模型（b 兩種畫質都有；detail 只在精緻畫質，放細小的擺飾）
 * - footprint(item)：碰撞的障礙物（本地座標矩形）；block: false 的器物不擋路
 * - height(item)：鏡頭遮擋方塊的高度
 * 之後其他店家的室內可以沿用同一份清單的寫法：清單決定擺設、碰撞與鏡頭，不會對不上。
 * 形制的依據寫在各器物的註解；查證紀錄見 docs/research/lin-hua-tai.md。
 */

const TEA = '#4a4034'
const BAMBOO = '#cdb27e'
const PAPER = '#e8dcc0'
const SEAL = '#b8463a'
const HUSK = '#2b2622'

/**
 * 茶桶的三種大小（半徑、高）。官網照片：大圓鐵桶的桶徑約成人肩寬的兩倍、桶高到胸部
 * （照片目測，非實測）；中桶與小桶依「大小茶桶」的說法示意。
 */
export const DRUM_SIZES = {
  large: { r: 0.38, h: 1.05 },
  medium: { r: 0.3, h: 0.82 },
  small: { r: 0.21, h: 0.58 },
}
const DRUM_TINT = '#8d998c'

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })
const around = (x, z, hx, hz = hx) => rect(x - hx, x + hx, z - hz, z + hz)
const boxFootprint = (item, pad = 0.03) => rect(item.x - item.width / 2 - pad, item.x + item.width / 2 + pad, item.z - item.depth / 2 - pad, item.z + item.depth / 2 + pad)

/** 一堆茶包（兩排，往 -z 排；count 個） */
function sackPositions(item) {
  const list = []
  for (let i = 0; i < item.count; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    list.push([item.x + (col ? 0.3 : -0.3), item.z + 0.3 - row * 0.6])
  }
  return list
}

/** 一群茶桶的外框（清單 drums 是 [x, z, 大小, 打開]） */
function drumBounds(item) {
  let box = null
  for (const [x, z, size] of item.drums) {
    const { r } = DRUM_SIZES[size]
    const d = around(x, z, r + 0.02)
    box = box ? rect(Math.min(box.minX, d.minX), Math.max(box.maxX, d.maxX), Math.min(box.minZ, d.minZ), Math.max(box.maxZ, d.maxZ)) : d
  }
  return box
}

/**
 * 一個茶桶（官網照片）：灰綠色的圓鐵桶身、上下兩道箍、平而略凸的桶蓋，蓋面用紅漆手寫茶名與價碼
 * （模型只畫幾道紅色的筆畫，不寫字）。open：打開的桶，裡面的茶與斜靠在桶邊的桶蓋。
 */
export function teaDrum(b, detail, [x, y, z], size, { tint = DRUM_TINT, open = false, seed = 0 } = {}) {
  const { r, h } = DRUM_SIZES[size]
  const body = shade(tint, 0.92 + ((seed * 37) % 11) / 100)
  b.cylinder('steel', r, r, h, 18, [x, y + h / 2, z], { tint: body })
  for (const t of [0.1, 0.9]) b.cylinder('steel', r + 0.012, r + 0.012, 0.035, 18, [x, y + h * t, z], { tint: shade(body, 0.8) })
  if (open) {
    b.cylinder('dark', r - 0.02, r - 0.02, 0.02, 18, [x, y + h - 0.05, z], { tint: TEA })
    b.cylinder('steel', r + 0.012, r + 0.012, 0.03, 18, [x + r + 0.02, y + h * 0.55, z], { rotation: [0, 0, Math.PI / 2 - 0.2], tint: shade(body, 0.9) })
    return
  }
  const top = y + h + 0.018
  b.cylinder('steel', r + 0.015, r + 0.018, 0.036, 18, [x, y + h, z], { tint: shade(body, 1.05) })
  b.cylinder('steel', r * 0.7, r + 0.01, 0.012, 18, [x, top + 0.004, z], { tint: shade(body, 1.1) })
  // 蓋面的紅字（茶名與價碼）：兩三道筆畫
  const marks = 2 + (seed % 2)
  for (let i = 0; i < marks; i++) {
    b.box('plain', [r * (0.9 - i * 0.18), 0.004, 0.035], [x, top + 0.012, z - r * 0.25 + i * r * 0.28], { rotation: [0, 0.08 * (i - 1), 0], tint: '#b23a2c' })
  }
  if (detail) detail.box('plain', [0.04, 0.004, 0.12], [x + r * 0.45, top + 0.012, z], { tint: '#b23a2c' })
}

/**
 * 林家的焙籠（官網〈林華泰的歷史 2/5〉家族口述）：細竹片編的圓筒，高約兩尺，口徑略大於火坑口，
 * 筒內中央一片竹編圓盤把圓筒隔成上下兩半，茶葉鋪在圓盤上。
 */
export function familyBasket(b, [x, y, z], { tea = true } = {}) {
  const H = 0.6
  b.cylinder('bamboo', 0.34, 0.34, H, 14, [x, y + H / 2, z], { tint: shade(BAMBOO, 0.86), grime: 0.2, openEnded: true })
  b.cylinder('bamboo', 0.35, 0.35, 0.035, 14, [x, y + H - 0.0175, z], { tint: shade(BAMBOO, 0.7) })
  b.cylinder('bamboo', 0.35, 0.35, 0.035, 14, [x, y + 0.0175, z], { tint: shade(BAMBOO, 0.7) })
  b.cylinder('bamboo', 0.32, 0.32, 0.025, 14, [x, y + H / 2, z], { tint: shade(BAMBOO, 0.95) })
  if (tea) b.cylinder('dark', 0.3, 0.3, 0.05, 14, [x, y + H / 2 + 0.035, z], { tint: TEA })
}

/** 火坑（坑口與地面齊平）：磚緣，坑裡是蓋著薰黑稻糠的炭火（中央透一點暗紅） */
function firePit(b, x, y, z, { sealed = false } = {}) {
  b.cylinder('brick', 0.39, 0.39, 0.04, 14, [x, y + 0.02, z], { tint: sealed ? '#7a5848' : '#8f604a' })
  b.cylinder('dark', 0.3, 0.3, 0.045, 14, [x, y + 0.025, z], { tint: sealed ? '#141210' : HUSK })
  if (!sealed) b.cylinder('bulb', 0.09, 0.09, 0.02, 8, [x, y + 0.045, z], { tint: '#c4502c' })
}

/* ── 各種器物 ─────────────────────────────── */

export const FURNITURE = {
  /** 櫃台（靠右牆、長邊沿 z；正面朝 -x 的店內）：檯面、前板與側板；檯面上的擺設依 goods */
  counter: {
    build(b, item, detail) {
      const { x, z, length, depth, height } = item
      const wood = item.tint ?? '#9a7a56'
      b.group([x, 0, z], -Math.PI / 2, () => {
        // 群組裡的本地 x 是世界的 z（往 -z 為負）、本地 +z 朝店內（世界 -x）
        b.box('wood', [length, 0.06, depth], [0, height - 0.03, 0], { tint: wood })
        b.box('planks', [length, height - 0.06, 0.08], [0, (height - 0.06) / 2, depth / 2 - 0.04], { tint: shade(wood, 0.86), grime: 0.15 })
        for (const sx of [-1, 1]) b.box('wood', [0.08, height - 0.06, depth - 0.1], [sx * (length / 2 - 0.08), (height - 0.06) / 2, 0], { tint: shade(wood, 0.75) })
        if (item.goods === 'paper') {
          // 包茶用的紙、包好的紙包、印章
          b.box('plain', [0.3, 0.05, 0.24], [-0.5, height + 0.025, 0], { tint: '#efe4c6' })
          for (let i = 0; i < 3; i++) b.box('paper', [0.12, 0.05, 0.09], [0.15 + i * 0.15, height + 0.025, 0.05], { tint: PAPER })
          detail.box('wood', [0.05, 0.08, 0.05], [-0.15, height + 0.04, 0.12], { tint: '#6a4a34' })
        } else if (item.goods === 'tasting') {
          // 長條木櫃台上：淺木盤盛的茶樣、茶壺與小杯（官網照片）、帳簿；桌尾一台鑄鐵的桿式台秤
          for (let i = 0; i < 3; i++) {
            const lx = -0.75 + i * 0.3
            b.box('wood', [0.24, 0.035, 0.24], [lx, height + 0.018, 0.04], { tint: '#c49a62' })
            b.box('dark', [0.18, 0.02, 0.18], [lx, height + 0.038, 0.04], { tint: i === 1 ? '#5a5a34' : TEA })
          }
          b.cylinder('plain', 0.06, 0.07, 0.1, 10, [0.2, height + 0.05, 0.12], { tint: '#7a4a32' })
          for (let i = 0; i < 3; i++) detail.cylinder('plain', 0.025, 0.02, 0.035, 8, [0.32 + i * 0.07, height + 0.018, 0.16], { tint: '#f1ece0' })
          b.box('plain', [0.26, 0.03, 0.2], [0.3, height + 0.015, -0.12], { tint: '#d8cba8' })
          b.box('dark', [0.28, 0.025, 0.24], [length / 2 - 0.22, height + 0.0125, 0], { tint: '#2f2c2a' })
          b.box('dark', [0.04, 0.32, 0.04], [length / 2 - 0.12, height + 0.16, -0.08], { tint: '#2f2c2a' })
          b.box('dark', [0.36, 0.025, 0.03], [length / 2 - 0.26, height + 0.31, -0.08], { tint: '#2f2c2a' })
        }
      })
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.03, item.x + item.depth / 2 + 0.03, item.z - item.length / 2, item.z + item.length / 2),
    height: (item) => item.height + 0.3,
  },

  /** 牆邊的層架（左牆）：下到上依 goods 放茶箱、茶甕或紙包 */
  wallShelf: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      for (const zz of [z0 + 0.05, z1 - 0.05]) b.box('wood', [0.06, 2.0, 0.06], [x + 0.18, 1.0, zz], { tint: '#6f523a' })
      ;[0.72, 1.4, 2.05].slice(0, item.goods.length).forEach((y, level) => {
        b.box('wood', [0.42, 0.05, length], [x, y, (z0 + z1) / 2], { tint: '#8d6c4d' })
        const kind = item.goods[level]
        const count = kind === 'packets' ? 6 : 4
        for (let i = 0; i < count; i++) {
          const z = z0 + 0.3 + (i * (length - 0.6)) / (count - 1)
          if (kind === 'jars') jar(b, [x, y + 0.025, z], { scale: 0.55, tint: i % 2 ? '#58483a' : '#6e4a34', lid: true })
          else if (kind === 'chests') teaChest(b, [x + 0.02, y + 0.025, z], { size: 0.34, rotationY: 0.04 * (i - 1.5) })
          else if (kind === 'packets') {
            b.box('paper', [0.24, 0.1, 0.16], [x, y + 0.075, z], { tint: PAPER })
            detail.box('paper', [0.22, 0.08, 0.15], [x + 0.01, y + 0.165, z + 0.01], { rotation: [0, 0.2, 0], tint: '#e2d3b0' })
          }
        }
      })
    },
    footprint: (item) => rect(item.x - 0.3, item.x + 0.26, item.z0 - 0.08, item.z1 + 0.08),
    height: () => 2.1,
  },

  /** 包茶桌（四方包）：一疊方形毛邊紙、一盤待包的茶、包好蓋了紅印的紙包、印章 */
  packingTable: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.group([x, 0, z], 0, () => {
        b.box('wood', [width, 0.055, depth], [0, height - 0.028, 0], { tint: '#a98562' })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.07, height - 0.055, 0.07], [sx * (width / 2 - 0.09), (height - 0.055) / 2, sz * (depth / 2 - 0.09)], { tint: '#8a6a4c' })
        b.box('plain', [0.3, 0.04, 0.3], [-0.4, height + 0.02, 0.1], { tint: '#efe4c6' })
        b.cylinder('bamboo', 0.2, 0.18, 0.05, 14, [-0.05, height + 0.025, -0.1], { tint: BAMBOO })
        b.cylinder('dark', 0.17, 0.17, 0.03, 14, [-0.05, height + 0.045, -0.1], { tint: TEA })
        for (let i = 0; i < 6; i++) {
          const px = 0.2 + (i % 3) * 0.13
          const pz = -0.12 + Math.floor(i / 3) * 0.2
          b.box('plain', [0.11, 0.045, 0.08], [px, height + 0.023, pz], { tint: PAPER })
          b.box('plain', [0.03, 0.002, 0.03], [px + 0.02, height + 0.047, pz], { tint: SEAL })
        }
        detail.box('wood', [0.04, 0.07, 0.04], [-0.4, height + 0.075, -0.22], { tint: '#6a4a34' })
      })
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.4,
  },

  /** 揀茶桌：矮桌上的竹淺盤與毛茶（teaWares.pickingTable）；精緻畫質多幾撮挑出來的茶梗 */
  pickingTable: {
    build(b, item, detail) {
      pickingTable(b, { x: item.x, z: item.z }, item)
      for (let i = 0; i < 4; i++) detail.box('dark', [0.06, 0.012, 0.02], [item.x - 0.2 + i * 0.12, item.height + 0.085, item.z + 0.1 - (i % 2) * 0.18], { rotation: [0, i * 0.7, 0], tint: '#7a6a4c' })
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.3,
  },

  /** 靠牆放淺盤的木架（1904 年圖版〈烘焙室內部〉：左側牆邊一排木架放淺盤） */
  trayRack: {
    build(b, item) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      for (const zz of [z0 + 0.04, z1 - 0.04]) b.box('wood', [0.05, 1.7, 0.05], [x - 0.2, 0.85, zz], { tint: '#6f523a' })
      for (let i = 0; i < 6; i++) {
        const y = 0.25 + i * 0.26
        b.box('wood', [0.04, 0.03, length], [x - 0.2, y, (z0 + z1) / 2], { tint: '#7d5f44' })
        b.cylinder('bamboo', 0.25, 0.23, 0.05, 12, [x - 0.02, y + 0.03, (z0 + z1) / 2 - 0.35], { tint: shade(BAMBOO, 0.95 - i * 0.02) })
        b.cylinder('bamboo', 0.25, 0.23, 0.05, 12, [x - 0.02, y + 0.03, (z0 + z1) / 2 + 0.35], { tint: shade(BAMBOO, 0.9 - i * 0.02) })
      }
    },
    footprint: (item) => rect(item.x - 0.3, item.x + 0.26, item.z0 - 0.05, item.z1 + 0.05),
    height: () => 1.8,
  },

  /** 焙茶的磚臺與焙坑、坑上的焙籠（Davidson 1903 的形制；日治前期） */
  roastingPlatform: {
    build(b, item) {
      const platform = { minX: item.minX, maxX: item.maxX, minZ: item.minZ, maxZ: item.maxZ, height: item.height }
      roastingPlatform(b, { platform, pits: item.pits.map(([x, z]) => ({ x, z })), pitRadius: 0.3 })
      for (const [x, z] of item.baskets) roastingBasket(b, [x, item.height + 0.07, z], { tea: true })
    },
    footprint: (item) => rect(item.minX - 0.05, item.maxX + 0.05, item.minZ - 0.05, item.maxZ + 0.05),
    height: (item) => (item.baskets.length ? 1.3 : 0.7),
  },

  /**
   * 一長排火坑（1930 年代以後，官網家族口述）：低矮的磚砌臺面，坑口直徑約兩尺，坑上架著兩尺高的竹焙籠。
   * sealed：封存的焙坑遺址（官網〈林華泰的歷史 3/5〉照片：水泥與磚砌的長方台座上兩個圓坑，坑口內壁黑；
   * 牆邊靠著幾根長木棒）。
   */
  pitStrip: {
    build(b, item) {
      const h = item.sealed ? 0.45 : 0.18
      const w = item.maxX - item.minX
      const d = item.maxZ - item.minZ
      b.box('brick', [w, h, d], [(item.minX + item.maxX) / 2, h / 2, (item.minZ + item.maxZ) / 2], { tint: item.sealed ? '#9a7462' : '#a0705a', grime: 0.35 })
      b.box('stone', [w + 0.06, 0.04, d + 0.06], [(item.minX + item.maxX) / 2, h + 0.02, (item.minZ + item.maxZ) / 2], { tint: item.sealed ? '#a59c90' : '#8c8070' })
      for (const [x, z] of item.pits) firePit(b, x, h + 0.02, z, { sealed: item.sealed })
      for (const [x, z] of item.baskets) familyBasket(b, [x, h + 0.04, z])
      if (item.sealed) {
        // 牆邊靠著的長木棒（舊工具）
        for (let i = 0; i < 4; i++) b.cylinder('wood', 0.025, 0.025, 1.9, 6, [item.minX - 0.08, 0.95, item.minZ + 0.25 + i * 0.22], { rotation: [0.06 * (i - 1.5), 0, 0.12], tint: '#6a4e38' })
      }
    },
    footprint: (item) => rect(item.minX - 0.04, item.maxX + 0.04, item.minZ - 0.04, item.maxZ + 0.04),
    height: (item) => (item.baskets.length ? 0.95 : 0.6),
  },

  /** 走道上待放上火坑的焙籠（先在走道上把茶鋪在竹盤上，再整個安置到火坑上） */
  familyBasket: {
    build(b, item) {
      familyBasket(b, [item.x, 0, item.z], { tea: item.tea })
    },
    footprint: (item) => around(item.x, item.z, 0.37),
    height: () => 0.7,
  },

  /** 地上待用的焙籠（Davidson 的形制） */
  roastingBasket: {
    build(b, item) {
      roastingBasket(b, [item.x, 0, item.z], { tea: false })
    },
    footprint: (item) => around(item.x, item.z, 0.35),
    height: () => 0.95,
  },

  /** 一個茶甕 */
  jar: {
    build(b, item) {
      jar(b, [item.x, 0, item.z], { scale: item.scale ?? 1, tint: '#5c4b3c', lid: true })
    },
    footprint: (item) => around(item.x, item.z, 0.27 * (item.scale ?? 1)),
    height: () => 0.7,
  },

  /** 一袋茶 */
  sack: {
    build(b, item) {
      sack(b, [item.x, 0, item.z], { tint: '#e6d9bd', seed: Math.round(Math.abs(item.x * 7 + item.z * 3)) + 1 })
    },
    footprint: (item) => around(item.x, item.z, 0.3),
    height: () => 0.75,
  },

  /** 一堆茶包（毛茶；兩排、第二層疊幾袋。茶包的材質文獻沒寫，布袋是示意） */
  sackPile: {
    build(b, item) {
      const positions = sackPositions(item)
      positions.forEach(([x, z], i) => sack(b, [x, 0, z], { tint: i % 2 ? '#e2d4b4' : '#d8c8a4', seed: 11 + i, rotationY: i * 0.6 }))
      positions.slice(0, Math.floor(positions.length / 2)).forEach(([x, z], i) => sack(b, [x + 0.04, 0.45, z - 0.3], { tint: '#ded0ae', seed: 31 + i, lying: true, rotationY: 0.3 + i }))
    },
    footprint(item) {
      const rows = Math.ceil(item.count / 2)
      return rect(item.x - 0.62, item.x + 0.62, item.z + 0.62 - rows * 0.6 - 0.04, item.z + 0.62)
    },
    height: () => 1.1,
  },

  /** 一疊茶箱 */
  chestStack: {
    build(b, item) {
      for (let i = 0; i < item.count; i++) {
        const level = i < 2 ? 0 : 1
        const col = i % 2
        teaChest(b, [item.x + (col ? 0.17 : -0.17), level * 0.42, item.z + (level ? 0.02 : 0)], { size: 0.38, rotationY: 0.05 * (i - 1.5) })
      }
    },
    footprint: (item) => around(item.x, item.z, 0.4, 0.26),
    height: () => 0.9,
  },

  /** 盛木炭的竹籃（兩籃） */
  charcoalBaskets: {
    build(b, item) {
      for (const [dx, dz] of [[-0.17, 0.08], [0.18, -0.1]]) {
        b.cylinder('bamboo', 0.2, 0.16, 0.34, 12, [item.x + dx, 0.17, item.z + dz], { tint: BAMBOO })
        b.add('dark', new IcosahedronGeometry(0.17, 0), { position: [item.x + dx, 0.34, item.z + dz], scale: [1, 0.45, 1], tint: '#2e2a27' })
      }
    },
    footprint: (item) => around(item.x, item.z, 0.42, 0.34),
    height: () => 0.5,
  },

  /**
   * 落地的台秤（磅仔）：臺史博「秤陀1組」的館方說明，昭和年間以後開始用磅仔秤重，大型的鐵或銅製、
   * 下有四個輪子、上有平臺與秤桿。style 'iron'：鐵製、四個輪子；'wood'：官網照片的老秤（木製底座加金屬立柱與秤桿）。
   */
  platformScale: {
    build(b, item) {
      const iron = item.style === 'iron'
      const base = iron ? '#3e4240' : '#8a6a4a'
      b.group([item.x, 0, item.z], item.rotationY ?? 0, () => {
        b.box(iron ? 'steel' : 'wood', [0.62, 0.12, 0.48], [0, 0.14, 0], { tint: base })
        b.box('steel', [0.56, 0.02, 0.42], [0, 0.21, 0], { tint: iron ? '#5a5e5a' : '#6f6a62' })
        if (iron) for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cylinder('dark', 0.045, 0.045, 0.03, 10, [sx * 0.24, 0.045, sz * 0.18], { rotation: [Math.PI / 2, 0, 0], tint: '#222' })
        else b.box('wood', [0.64, 0.08, 0.5], [0, 0.04, 0], { tint: shade(base, 0.8) })
        // 立柱、秤桿、秤錘與吊著的砝碼盤
        b.box('steel', [0.06, 0.95, 0.06], [-0.27, 0.65, 0], { tint: '#2f302e' })
        b.box('steel', [0.5, 0.03, 0.03], [-0.04, 1.1, 0], { tint: '#2f302e' })
        b.box('steel', [0.05, 0.06, 0.05], [0.08, 1.1, 0], { tint: '#575a56' })
        b.box('steel', [0.01, 0.16, 0.01], [0.19, 1.01, 0], { tint: '#2f302e' })
        b.cylinder('steel', 0.05, 0.05, 0.015, 10, [0.19, 0.93, 0], { tint: '#575a56' })
        // 秤上的一袋茶
        sack(b, [0.02, 0.22, 0], { tint: '#ddd0b0', seed: 5, scale: 0.7 })
      })
    },
    footprint: (item) => (Math.abs(Math.sin(item.rotationY ?? 0)) > 0.5 ? around(item.x, item.z, 0.28, 0.36) : around(item.x, item.z, 0.36, 0.28)),
    height: () => 1.2,
  },

  /**
   * 大型輸送帶式乾燥機（官網〈我們的專業領域〉照片）：長形鐵殼、斜向的進料斗與多層輸送帶，
   * 頂上的鐵架與傳動輪、朝上的排氣管，側面的小窗與撥桿；出料口下的大竹簍。長邊沿 z。
   */
  dryer: {
    build(b, item, detail) {
      const { x, z, length, width, height } = item
      const body = item.tint ?? '#7c847e'
      const shellH = height - 0.2
      b.box('steel', [width, shellH, length], [x, 0.2 + shellH / 2, z], { tint: body })
      for (const sz of [-1, 1]) b.box('dark', [width + 0.06, 0.2, 0.22], [x, 0.1, z + sz * (length / 2 - 0.2)], { tint: '#3a3632' })
      // 頂上的鐵架與兩個傳動輪
      for (const sz of [-1, 1]) b.box('steel', [0.06, 0.35, 0.06], [x - width / 2 + 0.1, height + 0.17, z + sz * (length / 2 - 0.3)], { tint: shade(body, 0.7) })
      b.box('steel', [0.06, 0.06, length - 0.5], [x - width / 2 + 0.1, height + 0.35, z], { tint: shade(body, 0.7) })
      for (const sz of [-1, 1]) b.cylinder('dark', 0.16, 0.16, 0.05, 14, [x - width / 2 + 0.1, height + 0.35, z + sz * (length / 2 - 0.3)], { rotation: [0, 0, Math.PI / 2], tint: '#2f2c29' })
      // 斜向的進料斗與輸送帶（從前端斜上機頂）
      const feedZ = z + length / 2 + 0.35
      b.box('steel', [width * 0.7, 0.06, 1.0], [x, height * 0.55, feedZ - 0.25], { rotation: [-0.55, 0, 0], tint: shade(body, 0.85) })
      b.box('steel', [width * 0.75, 0.32, 0.4], [x, 0.45, feedZ], { tint: shade(body, 0.9) })
      // 排氣管
      b.cylinder('steel', 0.1, 0.1, 1.2, 10, [x + width / 4, height + 0.6, z - length / 2 + 0.35], { tint: shade(body, 0.8) })
      // 側面（朝 -x 的走道）：一排小窗、撥桿、出料口
      for (let i = 0; i < 3; i++) b.box('dark', [0.02, 0.16, 0.24], [x - width / 2 - 0.01, height * 0.68, z - length / 3 + i * (length / 3)], { tint: '#3b4442' })
      for (let i = 0; i < 2; i++) b.box('dark', [0.04, 0.22, 0.03], [x - width / 2 - 0.03, height * 0.45, z - length / 6 + i * (length / 3)], { rotation: [0.4, 0, 0], tint: '#2f2c29' })
      b.box('steel', [0.36, 0.12, 0.3], [x - width / 2 - 0.12, 0.55, z - length / 2 + 0.3], { tint: shade(body, 0.75) })
      for (let i = 0; i < 9; i++) detail.cylinder('steel', 0.018, 0.018, 0.02, 6, [x - width / 2 - 0.01, height - 0.1, z - length / 2 + 0.2 + i * ((length - 0.4) / 8)], { rotation: [0, 0, Math.PI / 2], tint: shade(body, 0.65) })
    },
    footprint: (item) => rect(item.x - item.width / 2 - 0.4, item.x + item.width / 2, item.z - item.length / 2, item.z + item.length / 2 + 0.6),
    height: (item) => item.height + 0.5,
  },

  /** 大竹簍（圓口、兩側環耳；乾燥機旁盛茶，官網照片） */
  bambooBaskets: {
    build(b, item) {
      for (const [dx, dz, s] of [[-0.12, 0.05, 1], [0.32, -0.12, 0.85]]) {
        const r = 0.34 * s
        b.cylinder('bamboo', r, r * 0.82, 0.42 * s, 14, [item.x + dx, 0.21 * s, item.z + dz], { tint: shade(BAMBOO, 1.04), openEnded: true })
        b.cylinder('bamboo', r * 0.82, r * 0.82, 0.02, 14, [item.x + dx, 0.01, item.z + dz], { tint: shade(BAMBOO, 0.9) })
        b.cylinder('bamboo', r + 0.015, r + 0.015, 0.03, 14, [item.x + dx, 0.42 * s, item.z + dz], { tint: shade(BAMBOO, 0.78) })
        b.cylinder('dark', r - 0.03, r - 0.03, 0.02, 14, [item.x + dx, 0.36 * s, item.z + dz], { tint: '#3c4a30' })
      }
    },
    footprint: (item) => rect(item.x - 0.5, item.x + 0.65, item.z - 0.45, item.z + 0.42),
    height: () => 0.5,
  },

  /** 攤在水泥地上曬涼的茶（官網照片：厚厚一層，用人工起出一格格的凹坑），旁邊靠著木耙 */
  coolingFloor: {
    build(b, item, detail) {
      const w = item.maxX - item.minX
      const d = item.maxZ - item.minZ
      const cx = (item.minX + item.maxX) / 2
      const cz = (item.minZ + item.maxZ) / 2
      b.box('dark', [w, 0.07, d], [cx, 0.035, cz], { tint: '#35402c' })
      // 格子狀的凹坑（較淺的溝）
      for (let i = 1; i < 4; i++) b.box('dark', [0.05, 0.075, d - 0.1], [item.minX + (i * w) / 4, 0.036, cz], { tint: '#262d20' })
      for (let i = 1; i < 5; i++) b.box('dark', [w - 0.1, 0.075, 0.05], [cx, 0.036, item.minZ + (i * d) / 5], { tint: '#262d20' })
      // 木耙
      b.cylinder('wood', 0.02, 0.02, 1.5, 6, [item.maxX + 0.1, 0.75, item.minZ + 0.2], { rotation: [0.2, 0, -0.15], tint: '#8a6a48' })
      b.box('wood', [0.4, 0.05, 0.05], [item.maxX + 0.0, 0.08, item.minZ + 0.06], { tint: '#7a5c40' })
      if (detail) for (let i = 0; i < 10; i++) detail.add('dark', new IcosahedronGeometry(0.03, 0), { position: [item.minX + 0.1 + ((i * 0.41) % 1) * (w - 0.2), 0.08, item.minZ + 0.1 + ((i * 0.73) % 1) * (d - 0.2)], tint: '#2f3826' })
    },
    footprint: (item) => rect(item.minX, item.maxX + 0.2, item.minZ, item.maxZ),
    height: () => 0.3,
  },

  /**
   * 薰花茶（窨花）：竹蓆上一層茶、一層茉莉花層層鋪疊，最上面再鋪一層茶（日治時期影像說明；
   * 官網家族口述：茶和花混在一起過夜，半夜翻動一兩次，直到黎明）。花苞的形狀是示意。
   */
  jasmineHeap: {
    build(b, item, detail) {
      const { x, z, width, depth } = item
      b.box('bamboo', [width, 0.03, depth], [x, 0.015, z], { tint: '#c9ad74' })
      const layers = [['dark', '#55492f'], ['plain', '#efeadb'], ['dark', '#5a4d34'], ['plain', '#f1ede0'], ['dark', '#4f4430']]
      layers.forEach(([mat, tint], i) => b.box(mat, [width - 0.16 - i * 0.12, 0.05, depth - 0.14 - i * 0.1], [x, 0.055 + i * 0.05, z], { tint }))
      // 每朵花各自一份幾何（add 會直接改寫非索引幾何的頂點，不能共用）
      for (let i = 0; i < 18; i++) {
        const fx = x - width / 2 + 0.35 + ((i * 0.37) % 1) * (width - 0.7)
        const fz = z - depth / 2 + 0.3 + ((i * 0.61) % 1) * (depth - 0.6)
        b.add('plain', new IcosahedronGeometry(0.03, 0), { position: [fx, 0.31, fz], tint: '#f6f3e8' })
      }
      // 翻動用的木耙
      b.cylinder('wood', 0.02, 0.02, 1.3, 6, [x + width / 2 + 0.12, 0.65, z + 0.2], { rotation: [0.15, 0, -0.12], tint: '#8a6a48' })
      for (let i = 0; i < 10; i++) detail.add('plain', new IcosahedronGeometry(0.022, 0), { position: [x - width / 2 + 0.08 + ((i * 0.53) % 1) * (width - 0.16), 0.035, z + depth / 2 - 0.04], tint: '#efeadb' })
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2 + 0.2, item.z - item.depth / 2, item.z + item.depth / 2),
    height: () => 0.35,
  },

  /** 一群茶桶（清單 drums：[x, z, 大小, 打開]；y：疊在下一排上面） */
  drums: {
    build(b, item, detail) {
      item.drums.forEach(([x, z, size, open], i) => teaDrum(b, detail, [x, item.y ?? 0, z], size, { open: !!open, seed: i + (item.seed ?? 0) }))
    },
    footprint: (item) => (item.y ? null : drumBounds(item)),
    height: (item) => (item.y ?? 0) + 1.1,
    bounds: drumBounds,
  },

  /** 櫃台後面靠牆的木格抽屜櫃（官網〈林華泰的歷史 5/5〉照片的背景：木格抽屜牆） */
  drawerWall: {
    build(b, item) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      b.box('wood', [0.2, 1.9, length], [x, 0.95, (z0 + z1) / 2], { tint: '#7a5634' })
      const cols = Math.round(length / 0.38)
      for (let row = 0; row < 5; row++) {
        for (let c = 0; c < cols; c++) {
          const zz = z0 + (c + 0.5) * (length / cols)
          b.box('wood', [0.02, 0.28, length / cols - 0.05], [x - 0.105, 0.4 + row * 0.33, zz], { tint: '#93693f' })
          b.box('dark', [0.03, 0.03, 0.06], [x - 0.12, 0.4 + row * 0.33, zz], { tint: '#3a2a1e' })
        }
      }
    },
    footprint: (item) => rect(item.x - 0.12, item.x + 0.1, item.z0, item.z1),
    height: () => 1.9,
  },
}

/** 這件器物的障礙物（本地座標）；block: false 或疊在上面的器物不擋路 */
export function furnitureFootprint(item) {
  if (item.block === false) return null
  return FURNITURE[item.type].footprint(item)
}

/** 鏡頭遮擋用的外框（疊放的茶桶也要擋鏡頭） */
export function furnitureBounds(item) {
  const kind = FURNITURE[item.type]
  return kind.bounds ? kind.bounds(item) : kind.footprint(item)
}

/** 室內的茶桶數（老屋新生「近百個大小茶桶」只畫出一部分；測試與說明文字用） */
export function drumCount(items) {
  return items.filter((item) => item.type === 'drums').reduce((sum, item) => sum + item.drums.length, 0)
}
