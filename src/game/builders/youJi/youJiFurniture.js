import { CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { shade } from '../props.js'
import { FURNITURE as LHT_FURNITURE, familyBasket } from '../linHuaTai/linHuaTaiFurniture.js'

/**
 * 有記名茶各年代室內的器物（第 11 階段）：器物清單在 data/youJiLayout.js，寫法同林華泰
 * （build／footprint／height；見 builders/shopInterior.js）。櫃台、揀茶桌、淺盤架、焙坑磚臺、毛茶袋、磅仔沿用林華泰的器物。
 * 形制依據寫在各器物的註解（〔照片〕是官網門市頁與《臺灣工藝》80 期的照片觀察）；查證見 docs/research/interior-you-ji.md。
 */

const TEA = '#4a4034'
const BAMBOO = '#cdb27e'
const ASH = '#d9d4c8'
const INK = '#2a2420'
const RED = '#a8322a'
const BLACKWOOD = '#2a201b'

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })
const around = (x, z, hx, hz = hx) => rect(x - hx, x + hx, z - hz, z + hz)
const boxFootprint = (item, pad = 0.03) => rect(item.x - item.width / 2 - pad, item.x + item.width / 2 + pad, item.z - item.depth / 2 - pad, item.z + item.depth / 2 + pad)

/** 算盤（櫃台上；只是擺設，可以近看的算盤在南北貨行） */
function abacus(b, detail, [x, y, z], rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [0.32, 0.025, 0.13], [0, 0.0125, 0], { tint: '#4a3322' })
    b.box('wood', [0.32, 0.02, 0.012], [0, 0.03, -0.02], { tint: '#3a281b' })
    for (let i = 0; i < 11; i++) {
      const bx = -0.14 + i * 0.028
      for (let k = 0; k < (detail ? 5 : 2); k++) detail.box('wood', [0.018, 0.016, 0.014], [bx, 0.033, 0.0 + k * 0.016], { tint: '#2c1f16' })
    }
  })
}

/**
 * 外銷泰國的茶箱（官網部落格〈Ewkee〉：內層木板釘製、外層竹篾編織護罩，防潮；竹篾印不上字，用嘜頭刷字）。
 * 箱面的墨刷是示意（幾道筆畫與菱形框，不寫字）；formosa：故事頁的木箱「一面印 FORMOSA、另一面『有記選庄』」，
 * 庶民生活的箱面多一道橫寫的字樣（示意）。
 */
function jacketedChest(b, detail, [x, y, z], { size = 0.42, rotationY = 0, formosa = false } = {}) {
  b.group([x, y, z], rotationY, () => {
    const s = size
    b.box('bamboo', [s, s * 0.9, s], [0, (s * 0.9) / 2, 0], { tint: shade(BAMBOO, 0.88), grime: 0.2 })
    // 竹篾的護罩：上下兩道竹箍
    for (const t of [0.12, 0.88]) b.box('bamboo', [s + 0.012, 0.025, s + 0.012], [0, s * 0.9 * t, 0], { tint: shade(BAMBOO, 0.7) })
    // 正面（+z）的嘜頭墨刷：菱形框與幾道字
    b.box('dark', [0.13, 0.13, 0.004], [0, s * 0.5, s / 2 + 0.003], { rotation: [0, 0, Math.PI / 4], tint: INK })
    b.box('bamboo', [0.1, 0.1, 0.004], [0, s * 0.5, s / 2 + 0.005], { rotation: [0, 0, Math.PI / 4], tint: shade(BAMBOO, 0.88) })
    for (let i = 0; i < 2; i++) b.box('dark', [0.035, 0.035, 0.004], [-0.015 + i * 0.03, s * 0.5, s / 2 + 0.007], { tint: INK })
    detail.box('dark', [s * 0.7, 0.025, 0.004], [0, s * 0.2, s / 2 + 0.004], { tint: INK })
    if (formosa) b.box('dark', [s * 0.8, 0.045, 0.004], [0, s * 0.78, s / 2 + 0.004], { tint: '#3b2f28' })
  })
}

/** 嘜頭板：深色的矩形木板，刻鏤空的字與菱形框（字形保留斷點）。〔照片〕《臺灣工藝》80 期 p.49：木板牆上釘掛十餘塊 */
function stencilBoard(b, detail, [x, y, z], w, h, seed) {
  b.box('wood', [w, h, 0.02], [x, y, z], { tint: shade('#3e2c20', 0.9 + (seed % 3) * 0.06) })
  // 鏤空的菱形框與字（淺色表示透出的牆面）
  b.box('plain', [h * 0.42, h * 0.42, 0.004], [x - w * 0.18, y, z + 0.012], { rotation: [0, 0, Math.PI / 4], tint: '#c9b48e' })
  b.box('wood', [h * 0.32, h * 0.32, 0.005], [x - w * 0.18, y, z + 0.014], { rotation: [0, 0, Math.PI / 4], tint: '#3e2c20' })
  for (let i = 0; i < 3; i++) detail.box('plain', [w * 0.08, h * 0.12, 0.004], [x + w * 0.08 + i * w * 0.12, y + h * 0.15, z + 0.012], { tint: '#c9b48e' })
  for (let i = 0; i < 4; i++) detail.box('plain', [w * 0.06, h * 0.08, 0.004], [x + w * 0.05 + i * w * 0.1, y - h * 0.22, z + 0.012], { tint: '#c9b48e' })
}

/** 一個焙窟（坑口與磚緣，坑裡是碳化稻殼燒成的白灰，邊上幾塊碎炭）。〔照片〕官網 Z62A0078 */
function huskPit(b, detail, x, y, z) {
  b.cylinder('brick', 0.37, 0.37, 0.04, 14, [x, y + 0.02, z], { tint: '#8f5c48' })
  b.cylinder('dark', 0.3, 0.3, 0.046, 14, [x, y + 0.024, z], { tint: '#9d988e' })
  b.cylinder('plain', 0.27, 0.27, 0.05, 14, [x, y + 0.026, z], { tint: ASH })
  for (let i = 0; i < 3; i++) detail.box('dark', [0.05, 0.03, 0.04], [x + 0.2 * Math.cos(i * 2.1), y + 0.05, z + 0.2 * Math.sin(i * 2.1)], { rotation: [0, i, 0], tint: '#1e1c1a' })
}

/** 有記的焙籠：竹編圓筒，口徑約 60–70 公分、高約 50 公分，上下各一圈竹箍；側面墨書「有記」（〔照片〕官網 Z62A0087；字是示意的兩道墨） */
function yjBasket(b, detail, [x, y, z], { tea = true, mark = false } = {}) {
  familyBasket(b, [x, y, z], { tea })
  if (mark) {
    b.box('dark', [0.12, 0.05, 0.004], [x, y + 0.36, z + 0.345], { tint: INK })
    detail.box('dark', [0.1, 0.04, 0.004], [x, y + 0.27, z + 0.345], { tint: INK })
  }
}

export const YJ_FURNITURE = {
  ...LHT_FURNITURE,

  /** 櫃台（林華泰的櫃台；abacus：櫃面多一把算盤） */
  counter: {
    ...LHT_FURNITURE.counter,
    build(b, item, detail) {
      LHT_FURNITURE.counter.build(b, item, detail)
      if (item.abacus) abacus(b, detail, [item.x - 0.05, item.height, item.z + item.length / 2 - 0.35], Math.PI / 2)
    },
  },

  /** 一疊外銷的竹篾茶箱（兩個一排、第二層疊上去） */
  teaChestStack: {
    build(b, item, detail) {
      for (let i = 0; i < item.count; i++) {
        const level = i < 2 ? 0 : 1
        const col = i % 2
        jacketedChest(b, detail, [item.x + (col ? 0.22 : -0.22), level * 0.38, item.z + (level ? 0.03 : 0)], { size: 0.42, rotationY: 0.04 * (i - 1.5), formosa: item.formosa })
      }
    },
    footprint: (item) => around(item.x, item.z, 0.46, 0.28),
    height: (item) => (item.count > 2 ? 0.8 : 0.42),
  },

  /** 掛在左牆上的嘜頭板（一面木板牆釘著十幾塊；〔照片〕《臺灣工藝》80 期 p.49） */
  markStencilBoard: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      b.group([x, 0, (z0 + z1) / 2], Math.PI / 2, () => {
        // 群組裡的本地 x 沿牆（世界 -z → 本地 +x），本地 +z 朝店內
        b.box('planks', [length, 1.5, 0.03], [0, 1.45, 0.015], { tint: '#a7865f' })
        const cols = Math.max(2, Math.round(length / 0.42))
        const pitch = length / cols
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < cols; c++) {
            const w = pitch * (0.78 - ((r + c) % 2) * 0.12)
            stencilBoard(b, detail, [-length / 2 + (c + 0.5) * pitch, 0.95 + r * 0.45, 0.04], w, 0.36 - ((r * 3 + c) % 2) * 0.06, r * 3 + c)
          }
        }
      })
    },
    footprint: (item) => rect(item.x - 0.05, item.x + 0.12, item.z0, item.z1),
    height: () => 2.2,
  },

  /** 刷嘜頭的工作桌：一個待刷的竹篾箱、一塊嘜頭板、漆碗與刷子 */
  markingTable: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.group([x, 0, z], 0, () => {
        b.box('wood', [width, 0.055, depth], [0, height - 0.028, 0], { tint: '#9a7856' })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.07, height - 0.055, 0.07], [sx * (width / 2 - 0.09), (height - 0.055) / 2, sz * (depth / 2 - 0.09)], { tint: '#7a5c40' })
        jacketedChest(b, detail, [-0.25, height, 0], { size: 0.42 })
        stencilBoard(b, detail, [0.28, height + 0.012, 0.05], 0.34, 0.26, 4)
        b.box('wood', [0.34, 0.012, 0.26], [0.28, height + 0.006, 0.05], { tint: '#3e2c20' })
        b.cylinder('plain', 0.07, 0.05, 0.06, 12, [0.38, height + 0.03, -0.22], { tint: '#3a3430' })
        b.cylinder('dark', 0.062, 0.062, 0.01, 12, [0.38, height + 0.058, -0.22], { tint: INK })
        b.box('wood', [0.2, 0.02, 0.035], [0.22, height + 0.015, -0.24], { rotation: [0, 0.4, 0], tint: '#7a5232' })
      })
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.35,
  },

  /** 貼標籤的桌子（英文、泰文商標查無照片：標籤紙只畫空白與一行橫字，示意 FORMOSA） */
  labelTable: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.group([x, 0, z], 0, () => {
        b.box('wood', [width, 0.05, depth], [0, height - 0.025, 0], { tint: '#a07c58' })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, height - 0.05, 0.06], [sx * (width / 2 - 0.08), (height - 0.05) / 2, sz * (depth / 2 - 0.08)], { tint: '#7a5c40' })
        for (let i = 0; i < 5; i++) {
          const lx = -0.35 + (i % 3) * 0.16
          const lz = -0.12 + Math.floor(i / 3) * 0.2
          b.box('plain', [0.13, 0.006 + i * 0.002, 0.09], [lx, height + 0.004 + i * 0.001, lz], { tint: '#efe6cf' })
          b.box('dark', [0.09, 0.002, 0.012], [lx, height + 0.012 + i * 0.002, lz], { tint: '#3a5070' })
        }
        b.cylinder('plain', 0.05, 0.05, 0.05, 10, [0.32, height + 0.025, -0.1], { tint: '#d8d0b8' })
        detail.box('wood', [0.14, 0.012, 0.02], [0.3, height + 0.006, 0.12], { rotation: [0, 0.3, 0], tint: '#7a5232' })
      })
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.1,
  },

  /** 靠牆的炭焙工具架：長柄的圓鏟、方鏟、四齒耙、火鉗、撥灰器（〔照片〕官網 Z62A0042；沿 x 排在 z 那面牆前） */
  toolRack: {
    build(b, item, detail) {
      const { x0, x1, z } = item
      const len = x1 - x0
      b.box('wood', [len, 0.06, 0.08], [(x0 + x1) / 2, 1.6, z - 0.06], { tint: '#6a4e36' })
      b.box('wood', [len, 0.06, 0.08], [(x0 + x1) / 2, 0.35, z - 0.06], { tint: '#6a4e36' })
      const n = Math.max(4, Math.round(len / 0.16))
      for (let i = 0; i < n; i++) {
        const tx = x0 + 0.08 + (i * (len - 0.16)) / (n - 1)
        const lean = 0.06 * ((i % 3) - 1)
        b.cylinder('wood', 0.018, 0.018, 1.65, 6, [tx, 0.95, z + 0.02], { rotation: [0, 0, lean], tint: '#8a6a48' })
        const kind = i % 4
        if (kind === 0) b.cylinder('steel', 0.1, 0.1, 0.012, 12, [tx, 0.1, z + 0.08], { rotation: [Math.PI / 2 - 0.3, 0, 0], tint: '#4a4844' })
        else if (kind === 1) b.box('steel', [0.16, 0.18, 0.012], [tx, 0.1, z + 0.07], { tint: '#4a4844' })
        else if (kind === 2) for (let t = 0; t < 4; t++) detail.box('steel', [0.012, 0.14, 0.012], [tx - 0.06 + t * 0.04, 0.08, z + 0.06], { tint: '#3e3c38' })
        else b.box('steel', [0.02, 0.4, 0.02], [tx + 0.03, 0.25, z + 0.05], { tint: '#3e3c38' })
      }
      b.cylinder('steel', 0.13, 0.11, 0.3, 12, [x1 - 0.2, 0.15, z + 0.25], { tint: '#555651' })
    },
    footprint: (item) => rect(item.x0, item.x1, item.z - 0.2, item.z + 0.38),
    height: () => 1.8,
  },

  /**
   * 一排稻殼焙窟：低矮的磚砌臺（微笑台灣「以紅磚搭出成排的坑」）、水泥面，坑內白灰；焙籠架在坑上（〔照片〕官網 Z62A0078、Z62A0087）。
   * 坑徑照片量不出來，依林華泰的「約兩尺」。
   */
  huskPits: {
    build(b, item, detail) {
      const h = 0.14
      const w = item.maxX - item.minX
      const d = item.maxZ - item.minZ
      const cx = (item.minX + item.maxX) / 2
      const cz = (item.minZ + item.maxZ) / 2
      b.box('brick', [w, h, d], [cx, h / 2, cz], { tint: '#9c6a54', grime: 0.35 })
      b.box('stone', [w + 0.04, 0.03, d + 0.04], [cx, h + 0.015, cz], { tint: '#9b958a' })
      for (const [x, z] of item.pits) huskPit(b, detail, x, h + 0.01, z)
      item.baskets.forEach(([x, z], i) => yjBasket(b, detail, [x, h + 0.04, z], { mark: i === 0 }))
    },
    footprint: (item) => rect(item.minX - 0.04, item.maxX + 0.04, item.minZ - 0.04, item.maxZ + 0.04),
    height: (item) => (item.baskets.length ? 0.85 : 0.4),
  },

  /** 疊兩層的焙籠（《臺灣工藝》80 期 p.49 圖 2：焙窟後方疊放竹編焙籠） */
  basketStack: {
    build(b, item, detail) {
      yjBasket(b, detail, [item.x, 0, item.z], { tea: false, mark: true })
      yjBasket(b, detail, [item.x + 0.03, 0.6, item.z - 0.02], { tea: false })
    },
    footprint: (item) => around(item.x, item.z, 0.4),
    height: () => 1.25,
  },

  /** 竹編大圓簍（細密斜紋、藤條加固、提把環；〔照片〕官網 Z62A0033），放在木板上 */
  bigBasket: {
    build(b, item) {
      const { x, z } = item
      b.box('planks', [0.7, 0.04, 0.7], [x, 0.02, z], { tint: '#8a6a4a' })
      b.cylinder('bamboo', 0.3, 0.24, 0.5, 16, [x, 0.29, z], { tint: shade(BAMBOO, 0.95), openEnded: true })
      b.cylinder('bamboo', 0.24, 0.24, 0.02, 16, [x, 0.05, z], { tint: shade(BAMBOO, 0.85) })
      for (const t of [0.2, 0.52]) b.cylinder('wood', 0.3 - (0.52 - t) * 0.1 + 0.012, 0.3 - (0.52 - t) * 0.1 + 0.012, 0.025, 16, [x, t, z], { tint: '#8a6a42', openEnded: true })
      for (const s of [-1, 1]) b.add('wood', new TorusGeometry(0.06, 0.012, 5, 10), { position: [x + s * 0.31, 0.5, z], rotation: [0, Math.PI / 2, 0], tint: '#8a6a42' })
    },
    footprint: (item) => around(item.x, item.z, 0.36),
    height: () => 0.6,
  },

  /**
   * 老木作風選機（〔照片〕官網 Z62A0031，只拍到局部）：直立的木格框、上方的進料斗與垂下的皮帶、
   * 下緣斜向伸出一排 4–5 個木製出料斗（每個約 20 公分寬）、右下的竹簍承接。長邊沿 x，出料斗朝 +z（走道）。
   * 整體尺寸是目測的示意。
   */
  winnowingMachine: {
    build(b, item, detail) {
      const { x, z } = item
      const L = 1.4
      const D = 0.62
      const H = 1.45
      b.group([x, 0, z], 0, () => {
        // 木格框與側板
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.07, H, 0.07], [sx * (L / 2 - 0.04), H / 2, sz * (D / 2 - 0.04)], { tint: '#6a4a32' })
        b.box('planks', [L - 0.1, H * 0.55, D - 0.12], [0, H * 0.42, 0], { tint: '#8a6440', grime: 0.25 })
        for (let i = 0; i < 4; i++) b.box('wood', [L, 0.05, 0.05], [0, 0.25 + i * 0.36, D / 2 - 0.03], { tint: '#5e422c' })
        // 圓鼓形的風箱（左端）與搖柄
        b.cylinder('planks', 0.36, 0.36, D - 0.14, 16, [-L / 2 + 0.36, 0.62, 0], { rotation: [Math.PI / 2, 0, 0], tint: '#7d5a3a' })
        b.box('wood', [0.04, 0.3, 0.04], [-L / 2 + 0.36, 0.55, D / 2 + 0.05], { tint: '#4a3424' })
        b.cylinder('wood', 0.02, 0.02, 0.14, 6, [-L / 2 + 0.36, 0.42, D / 2 + 0.11], { rotation: [Math.PI / 2, 0, 0], tint: '#4a3424' })
        // 上方的進料斗與垂下的皮帶
        b.box('planks', [0.5, 0.32, 0.46], [0.15, H + 0.12, 0], { tint: '#8a6440' })
        b.box('planks', [0.3, 0.06, 0.3], [0.15, H - 0.06, 0], { tint: '#6e5034' })
        b.box('dark', [0.04, 0.9, 0.01], [L / 2 - 0.18, H - 0.25, D / 2 + 0.01], { tint: '#3a2e26' })
        // 一排斜伸出來的出料斗
        for (let i = 0; i < 4; i++) {
          const fx = -0.05 + i * 0.2
          b.box('planks', [0.18, 0.03, 0.34], [fx, 0.3, D / 2 + 0.12], { rotation: [0.5, 0, 0], tint: shade('#8a6440', 0.92 + i * 0.03) })
          for (const s of [-1, 1]) detail.box('wood', [0.012, 0.08, 0.34], [fx + s * 0.09, 0.33, D / 2 + 0.12], { rotation: [0.5, 0, 0], tint: '#6a4a32' })
        }
        b.cylinder('bamboo', 0.2, 0.16, 0.26, 12, [L / 2 - 0.05, 0.13, D / 2 + 0.3], { tint: BAMBOO, openEnded: true })
        b.cylinder('dark', 0.17, 0.17, 0.02, 12, [L / 2 - 0.05, 0.2, D / 2 + 0.3], { tint: TEA })
      })
    },
    footprint: (item) => rect(item.x - 0.75, item.x + 0.75, item.z - 0.35, item.z + 0.55),
    height: () => 1.75,
  },

  /** 嵌在左牆的木格抽屜茶櫃（〔照片〕官網 IMG_5059：成排有標籤的木格抽屜，上方一排黑色圓茶罐） */
  drawerCabinet: {
    build(b, item) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      b.box('wood', [0.22, 1.8, length], [x, 0.9, (z0 + z1) / 2], { tint: '#6e4c30' })
      const cols = Math.round(length / 0.3)
      for (let row = 0; row < 6; row++) {
        for (let c = 0; c < cols; c++) {
          const zz = z0 + (c + 0.5) * (length / cols)
          b.box('wood', [0.02, 0.22, length / cols - 0.04], [x + 0.115, 0.3 + row * 0.25, zz], { tint: '#8d6440' })
          b.box('plain', [0.006, 0.05, 0.08], [x + 0.127, 0.34 + row * 0.25, zz], { tint: '#ece2c8' })
        }
      }
      for (let c = 0; c < cols; c++) {
        const zz = z0 + (c + 0.5) * (length / cols)
        b.cylinder('dark', 0.07, 0.07, 0.2, 12, [x, 1.9, zz], { tint: '#1f1d1c' })
        b.cylinder('plain', 0.072, 0.072, 0.04, 12, [x, 2.02, zz], { tint: c % 2 ? '#c9682e' : '#a8322a' })
      }
    },
    footprint: (item) => rect(item.x - 0.12, item.x + 0.12, item.z0, item.z1),
    height: () => 2.1,
  },

  /** 門市左側的弧形淺色木櫃台（〔照片〕官網 IMG_8476），台上放小盒茶；凸面朝店內（+x） */
  curvedCounter: {
    build(b, item, detail) {
      const { x, z, length, depth, height } = item
      const R = 2.2
      const seg = 9
      const span = length / R
      for (let i = 0; i < seg; i++) {
        const a = -span / 2 + ((i + 0.5) * span) / seg
        const cx = x + (Math.cos(a) - 1) * R * 0.25
        const cz = z + Math.sin(a) * R
        const w = (length / seg) * 1.04
        b.box('wood', [depth, 0.05, w], [cx, height - 0.025, cz], { rotation: [0, -a * 0.25, 0], tint: '#d2b58a' })
        b.box('planks', [0.06, height - 0.05, w], [cx + depth / 2 - 0.03, (height - 0.05) / 2, cz], { rotation: [0, -a * 0.25, 0], tint: '#c4a47a' })
      }
      for (let i = 0; i < 4; i++) {
        const bz = z - 0.5 + i * 0.32
        b.box('plain', [0.14, 0.09, 0.1], [x + 0.08, height + 0.045, bz], { tint: i % 2 ? '#a8322a' : '#e9dfc6' })
        detail.box('plain', [0.1, 0.004, 0.06], [x + 0.08, height + 0.092, bz], { tint: '#c9a64a' })
      }
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.05, item.x + item.depth / 2 + 0.05, item.z - item.length / 2, item.z + item.length / 2),
    height: (item) => item.height + 0.2,
  },

  /** 右牆的嵌牆木格櫃與一排圓茶罐（黑身、橙或紅蓋；〔照片〕官網 IMG_8476、IMG_8100）；櫃面朝店內（-x） */
  wallTinShelf: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      const cz = (z0 + z1) / 2
      b.box('wood', [0.36, 2.2, length], [x, 1.1, cz], { tint: '#7a5634' })
      const cols = Math.round(length / 0.55)
      for (let row = 0; row < 4; row++) {
        const y = 0.45 + row * 0.5
        b.box('wood', [0.34, 0.03, length - 0.04], [x - 0.02, y, cz], { tint: '#93693f' })
        for (let c = 0; c <= cols; c++) b.box('wood', [0.34, 0.5, 0.025], [x - 0.02, y + 0.25, z0 + (c * length) / cols], { tint: '#6a4a2c' })
        const n = cols * 3
        for (let i = 0; i < n; i++) {
          const zz = z0 + 0.12 + (i * (length - 0.24)) / (n - 1)
          b.cylinder('dark', 0.055, 0.055, 0.17, 10, [x - 0.06, y + 0.1, zz], { tint: '#1f1d1c' })
          b.cylinder('plain', 0.057, 0.057, 0.03, 10, [x - 0.06, y + 0.2, zz], { tint: (i + row) % 3 ? '#c9682e' : '#a8322a' })
          if (row === 1) detail.box('plain', [0.004, 0.06, 0.06], [x - 0.116, y + 0.1, zz], { tint: '#d9c08a' })
        }
      }
    },
    footprint: (item) => rect(item.x - 0.2, item.x + 0.2, item.z0, item.z1),
    height: () => 2.2,
  },

  /** 試茶席：深色硬木方桌加玻璃桌面、木茶盤、紫砂壺與杯，四張靠背木椅（〔照片〕官網 IMG_3458） */
  tastingTable: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.box('wood', [width, 0.05, depth], [x, height - 0.025, z], { tint: BLACKWOOD })
      b.box('glassClear', [width - 0.04, 0.012, depth - 0.04], [x, height + 0.006, z], { tint: '#cfe0dc' })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, height - 0.05, 0.06], [x + sx * (width / 2 - 0.06), (height - 0.05) / 2, z + sz * (depth / 2 - 0.06)], { tint: BLACKWOOD })
      b.box('wood', [0.5, 0.04, 0.3], [x, height + 0.03, z], { tint: '#9a7448' })
      b.add('plain', new SphereGeometry(0.06, 10, 8), { position: [x - 0.1, height + 0.1, z], scale: [1, 0.8, 1], tint: '#6e3a28' })
      for (let i = 0; i < 4; i++) b.cylinder('plain', 0.025, 0.02, 0.035, 8, [x + 0.06 + (i % 2) * 0.08, height + 0.068, z - 0.06 + Math.floor(i / 2) * 0.12], { tint: '#f1ece0' })
      // 四張靠背木椅
      for (const [cx, cz, ry] of [[x - width / 2 - 0.12, z, Math.PI / 2], [x + width / 2 + 0.12, z, -Math.PI / 2], [x, z - depth / 2 - 0.12, 0], [x, z + depth / 2 + 0.12, Math.PI]]) {
        b.group([cx, 0, cz], ry, () => {
          b.box('wood', [0.4, 0.04, 0.38], [0, 0.45, 0], { tint: '#3a2a20' })
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.035, 0.45, 0.035], [sx * 0.17, 0.225, sz * 0.16], { tint: '#3a2a20' })
          b.box('wood', [0.4, 0.5, 0.035], [0, 0.72, -0.18], { tint: '#33251c' })
          detail.box('wood', [0.08, 0.36, 0.01], [0, 0.72, -0.16], { tint: '#5a4030' })
        })
      }
    },
    footprint: (item) => rect(item.x - item.width / 2 - 0.35, item.x + item.width / 2 + 0.35, item.z - item.depth / 2 - 0.35, item.z + item.depth / 2 + 0.35),
    height: () => 1.0,
  },

  /** 匾額的木框（字在街景的招牌圖集裡，見 builders/youJi/youJi.js 的 plaqueSigns） */
  plaque: {
    build(b, item) {
      b.box('wood', [item.width + 0.14, 0.56, 0.06], [item.x, item.y, item.z], { tint: '#3a2418' })
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - 0.05, item.z + 0.05),
    // 掛在門楣與屏風上方：不擋路也不擋鏡頭（遮擋方塊從地面起算，會擋住門口）
    height: () => 0,
  },

  /** 靠在隔間牆上的竹編大圓篩（直徑近 1 公尺）貼紅紙「福」（〔照片〕官網 IMG_3065；福字畫成紅色方紙） */
  bigSieve: {
    build(b, item, detail) {
      const { x, z } = item
      b.cylinder('bamboo', 0.48, 0.48, 0.04, 22, [x, 0.58, z + 0.06], { rotation: [Math.PI / 2 - 0.12, 0, 0], tint: BAMBOO })
      b.add('wood', new TorusGeometry(0.48, 0.022, 5, 22), { position: [x, 0.58, z + 0.07], rotation: [-0.12, 0, 0], tint: '#8a6a42' })
      b.box('plain', [0.24, 0.24, 0.006], [x, 0.62, z + 0.1], { rotation: [-0.12, 0, Math.PI / 4], tint: RED })
      detail.box('plain', [0.08, 0.1, 0.004], [x, 0.62, z + 0.105], { rotation: [-0.12, 0, 0], tint: '#2a1a14' })
    },
    footprint: (item) => rect(item.x - 0.5, item.x + 0.5, item.z - 0.05, item.z + 0.2),
    height: () => 1.1,
  },

  /** 清源堂的矮舞台：鋪紅毯，台上一張黑色硬木椅、兩側方几（〔照片〕官網 IMG_0923） */
  stage: {
    build(b, item, detail) {
      const { x, z, width, depth, height } = item
      b.box('planks', [width, height, depth], [x, height / 2, z], { tint: '#4a3426' })
      b.box('cloth', [width - 0.06, 0.012, depth - 0.06], [x, height + 0.006, z], { tint: '#a3262a' })
      const cz = z - 0.15
      b.group([x, height, cz], 0, () => {
        b.box('wood', [0.5, 0.05, 0.45], [0, 0.45, 0], { tint: BLACKWOOD })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.04, 0.45, 0.04], [sx * 0.21, 0.225, sz * 0.19], { tint: BLACKWOOD })
        b.box('wood', [0.5, 0.6, 0.04], [0, 0.78, -0.2], { tint: BLACKWOOD })
        for (const sx of [-1, 1]) b.box('wood', [0.04, 0.22, 0.4], [sx * 0.24, 0.6, 0], { tint: BLACKWOOD })
      })
      for (const sx of [-1, 1]) {
        b.box('wood', [0.42, 0.62, 0.42], [x + sx * 0.75, height + 0.31, cz], { tint: BLACKWOOD })
        detail.cylinder('plain', 0.05, 0.06, 0.1, 10, [x + sx * 0.75, height + 0.67, cz], { tint: '#6e3a28' })
      }
    },
    footprint: (item) => boxFootprint(item, 0.02),
    height: () => 1.4,
  },

  /** 舞台後方 6 扇黑色雕花木屏風（雕花只畫成淺浮雕的格子；〔照片〕官網 IMG_0923） */
  screen: {
    build(b, item, detail) {
      const { x, z, width } = item
      const n = 6
      const pw = width / n
      for (let i = 0; i < n; i++) {
        const px = x - width / 2 + (i + 0.5) * pw
        const ry = (i % 2 ? 1 : -1) * 0.08
        b.box('wood', [pw - 0.02, 2.1, 0.05], [px, 1.08, z], { rotation: [0, ry, 0], tint: '#1e1814' })
        b.box('wood', [pw - 0.12, 1.1, 0.012], [px, 1.35, z + 0.03], { rotation: [0, ry, 0], tint: '#3a2c22' })
        for (let k = 0; k < 4; k++) detail.box('wood', [pw - 0.2, 0.02, 0.01], [px, 0.95 + k * 0.25, z + 0.04], { rotation: [0, ry, 0], tint: '#5a4432' })
        detail.box('wood', [pw - 0.14, 0.3, 0.012], [px, 0.42, z + 0.03], { rotation: [0, ry, 0], tint: '#3a2c22' })
      }
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - 0.15, item.z + 0.15),
    height: () => 2.2,
  },

  /** 掛著的紅燈籠（〔照片〕官網 IMG_0923：兩側紅柱聯旁的紅燈籠） */
  redLantern: {
    build(b, item) {
      b.box('dark', [0.015, 0.4, 0.015], [item.x, 2.4, item.z], { tint: '#2a2622' })
      b.add('lanternLit', new SphereGeometry(0.2, 12, 10), { position: [item.x, 2.0, item.z], scale: [1, 1.15, 1], tint: '#c8302a' })
      for (const dy of [-0.23, 0.23]) b.cylinder('wood', 0.07, 0.07, 0.04, 10, [item.x, 2.0 + dy, item.z], { tint: '#2a1a12' })
    },
    footprint: (item) => around(item.x, item.z, 0.2),
    height: () => 2.6,
  },

  /** 清源堂的硬木方桌（玻璃桌面）與四張靠背椅（〔照片〕官網 IMG_0923） */
  squareTable: {
    build(b, item, detail) {
      YJ_FURNITURE.tastingTable.build(b, { x: item.x, z: item.z, width: 0.75, depth: 0.75, height: 0.76 }, detail)
    },
    footprint: (item) => around(item.x, item.z, 0.675),
    height: () => 1.0,
  },

  /** 右（左）牆掛的南管樂器：梨形琵琶、長頸小身的三絃、圓身的月琴形樂器、細長的洞簫與紅穗（只畫照片看得到的四件） */
  instrumentWall: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const span = z1 - z0
      const zAt = (t) => z0 + span * t
      const wx = x + 0.06
      // 琵琶：梨形的共鳴箱、短頸、曲首
      b.add('wood', new SphereGeometry(0.17, 12, 10), { position: [wx, 1.35, zAt(0.15)], scale: [0.25, 1.25, 0.85], tint: '#8a5a2e' })
      b.box('wood', [0.04, 0.32, 0.05], [wx, 1.68, zAt(0.15)], { tint: '#3a2418' })
      b.box('wood', [0.04, 0.1, 0.06], [wx, 1.86, zAt(0.15)], { rotation: [0.5, 0, 0], tint: '#3a2418' })
      // 三絃：長頸、小方圓身
      b.cylinder('wood', 0.07, 0.07, 0.05, 12, [wx, 1.05, zAt(0.4)], { rotation: [0, 0, Math.PI / 2], tint: '#2e2016' })
      b.box('wood', [0.025, 0.85, 0.025], [wx, 1.5, zAt(0.4)], { tint: '#3a2418' })
      // 月琴形：圓身、短頸
      b.cylinder('wood', 0.15, 0.15, 0.05, 16, [wx, 1.3, zAt(0.65)], { rotation: [0, 0, Math.PI / 2], tint: '#9a6a3a' })
      b.box('wood', [0.03, 0.25, 0.035], [wx, 1.55, zAt(0.65)], { tint: '#3a2418' })
      // 洞簫與紅穗
      b.cylinder('bamboo', 0.014, 0.014, 0.75, 8, [wx, 1.35, zAt(0.88)], { tint: '#b8955a' })
      b.add('cloth', new CylinderGeometry(0.02, 0.035, 0.18, 8), { position: [wx, 0.88, zAt(0.88)], tint: RED })
      for (let i = 0; i < 4; i++) detail.box('plain', [0.01, 0.01, 0.01], [wx + 0.01, 1.2 + i * 0.1, zAt(0.88)], { tint: '#3a2a1c' })
    },
    footprint: (item) => rect(item.x - 0.05, item.x + 0.12, item.z0, item.z1),
    height: () => 2.0,
  },
}
