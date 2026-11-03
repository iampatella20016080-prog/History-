import { CylinderGeometry, SphereGeometry } from 'three'
import { shade } from '../props.js'
import { XFC_FURNITURE } from '../xinFangChun/xinFangChunFurniture.js'

/**
 * 江山樓室內的器物（第 11 階段）：器物清單在 data/jiangShanLouLayout.js，寫法同其他茶行（build／footprint／height；
 * 見 builders/shopInterior.js）。辦公桌沿用新芳春的。宴會廳的擺設依 Wikimedia Commons 那張宴席照（目視）：
 * 白桌布的圓桌與深色木腳、木椅、牆高處題字的匾、有圓形標誌的啤酒廣告旗；其他是歷史情境重建。
 */

const LACQUER = '#5b2c22'
const DARK = '#2e2018'
const CLOTH = '#f2eee4'

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })
const around = (x, z, hx, hz = hx) => rect(x - hx, x + hx, z - hz, z + hz)

/** 題字的匾：深色木框、淺色底、幾行直書的字（筆畫示意；照片上的字讀不出來） */
function inscribedBoard(b, detail, x, y, z, w, h, faceZ = 1) {
  b.box('wood', [w, h, 0.05], [x, y, z], { tint: DARK })
  b.box('plain', [w - 0.12, h - 0.12, 0.01], [x, y, z + faceZ * 0.03], { tint: '#e6dcc2' })
  const cols = Math.max(4, Math.round(w / 0.12))
  for (let i = 0; i < cols; i++) {
    const cx = x - (w - 0.3) / 2 + (i * (w - 0.3)) / (cols - 1)
    const len = (h - 0.3) * (i === 0 || i === cols - 1 ? 0.5 : 0.85)
    ;(i % 2 ? detail : b).box('plain', [0.025, len, 0.004], [cx, y + (h - 0.3 - len) / 2 * 0.5, z + faceZ * 0.037], { tint: '#2a221c' })
  }
  b.box('plain', [0.05, 0.05, 0.004], [x - w / 2 + 0.14, y - h / 2 + 0.16, z + faceZ * 0.037], { tint: '#b8382c' })
}

/** 啤酒廣告旗（照片：白底、上方圓形標誌、直書片假名；本站不寫字，只畫標誌與幾道紅色筆畫） */
function adBanner(b, detail, x, y, z) {
  b.box('wood', [0.5, 0.025, 0.025], [x, y + 0.75, z], { tint: DARK })
  b.box('cloth', [0.42, 1.4, 0.01], [x, y, z], { tint: '#efe9dc' })
  b.cylinder('cloth', 0.13, 0.13, 0.006, 16, [x, y + 0.45, z + 0.008], { rotation: [Math.PI / 2, 0, 0], tint: '#3a3a44' })
  b.cylinder('cloth', 0.09, 0.09, 0.006, 16, [x, y + 0.45, z + 0.011], { rotation: [Math.PI / 2, 0, 0], tint: '#efe9dc' })
  for (let i = 0; i < 4; i++) (i % 2 ? detail : b).box('cloth', [0.12, 0.12, 0.004], [x, y + 0.12 - i * 0.18, z + 0.01], { tint: '#a8322a' })
}

export const JSL_FURNITURE = {
  ...XFC_FURNITURE,

  /** 辦公桌（新芳春的辦公桌）；abacus：桌上一把算盤（江山樓一樓辦公室） */
  officeDesk: {
    ...XFC_FURNITURE.officeDesk,
    build(b, item, detail) {
      XFC_FURNITURE.officeDesk.build(b, item, detail)
      if (!item.abacus) return
      b.box('wood', [0.32, 0.025, 0.13], [item.x + 0.25, 0.82, item.z - 0.05], { tint: '#4a3322' })
      for (let i = 0; i < 9; i++) detail.box('wood', [0.016, 0.016, 0.1], [item.x + 0.12 + i * 0.03, 0.84, item.z - 0.05], { tint: '#2c1f16' })
    },
  },

  /** 一段隔間牆（x0..x1 或 z0..z1，3.1 公尺高）；doors：牆上關著的門（其他宴會廳，沿牆的位置） */
  wallSeg: {
    build(b, item) {
      const alongX = Math.abs(item.x1 - item.x0) >= Math.abs(item.z1 - item.z0)
      const len = alongX ? Math.abs(item.x1 - item.x0) : Math.abs(item.z1 - item.z0)
      const cx = (item.x0 + item.x1) / 2
      const cz = (item.z0 + item.z1) / 2
      b.box('plaster', alongX ? [len, 3.1, 0.12] : [0.12, 3.1, len], [cx, 1.55, cz], { tint: '#e6dcc6' })
      b.box('wood', alongX ? [len, 0.1, 0.16] : [0.16, 0.1, len], [cx, 0.05, cz], { tint: DARK })
      for (const d of item.doors ?? []) {
        const pos = alongX ? [d, 1.1, cz + 0.08] : [cx + 0.08, 1.1, d]
        b.box('wood', alongX ? [1.0, 2.2, 0.05] : [0.05, 2.2, 1.0], pos, { tint: LACQUER })
      }
    },
    footprint: (item) => rect(Math.min(item.x0, item.x1) - 0.08, Math.max(item.x0, item.x1) + 0.08, Math.min(item.z0, item.z1) - 0.08, Math.max(item.z0, item.z1) + 0.08),
    height: () => 3.1,
  },

  /** 牆上關著的木門（不畫門後的房間）；axis：門所在的牆沿 x 或 z */
  wallDoor: {
    build(b, item) {
      const alongX = item.axis === 'x'
      b.box('wood', alongX ? [1.05, 2.25, 0.06] : [0.06, 2.25, 1.05], [item.x, 1.125, item.z], { tint: LACQUER })
      b.box('wood', alongX ? [0.04, 2.15, 0.07] : [0.07, 2.15, 0.04], [item.x, 1.1, item.z], { tint: shade(LACQUER, 0.7) })
      b.box('steel', [0.05, 0.05, 0.05], [item.x + (alongX ? 0.1 : 0.04), 1.05, item.z + (alongX ? 0.04 : 0.1)], { tint: '#c9a64a' })
    },
    footprint: (item) => (item.axis === 'x' ? rect(item.x - 0.55, item.x + 0.55, item.z - 0.06, item.z + 0.06) : rect(item.x - 0.06, item.x + 0.06, item.z - 0.55, item.z + 0.55)),
    height: () => 2.3,
  },

  /** 角落的啤酒木箱（立面有啤酒廣告；三樓之後要近看的器物先留的位置，瓶子的形制示意） */
  beerCrate: {
    build(b, item, detail) {
      const { x, z } = item
      b.box('planks', [0.6, 0.32, 0.42], [x, 0.16, z], { tint: '#8a6a48' })
      b.box('planks', [0.6, 0.32, 0.42], [x + 0.03, 0.48, z], { rotation: [0, 0.1, 0], tint: '#957452' })
      for (let i = 0; i < 6; i++) detail.add('glass', new CylinderGeometry(0.035, 0.04, 0.26, 8), { position: [x - 0.2 + (i % 3) * 0.2, 0.77, z - 0.09 + Math.floor(i / 3) * 0.18], tint: '#5a3a20' })
    },
    footprint: (item) => around(item.x, item.z, 0.36, 0.28),
    height: () => 1.0,
  },

  /** 推開收在門口兩側的木板門屏（吳瀛濤：宴廳每間以木板門屏隔開；板面與格心查無，示意） */
  doorScreen: {
    build(b, item, detail) {
      const { x, z, width } = item
      for (const s of [-1, 1]) {
        const px = x + s * (width / 2 + 0.06)
        for (let k = 0; k < 2; k++) {
          const pz = z + 0.15 + k * 0.32
          b.box('wood', [0.05, 2.4, 0.3], [px, 1.2, pz], { rotation: [0, s * 0.15 * (k ? -1 : 1), 0], tint: LACQUER })
          for (let r = 0; r < 4; r++) detail.box('wood', [0.055, 0.03, 0.26], [px, 0.7 + r * 0.45, pz], { tint: shade(LACQUER, 0.7) })
        }
      }
    },
    footprint: (item) => rect(item.x - item.width / 2 - 0.1, item.x + item.width / 2 + 0.1, item.z, item.z + 0.5),
    // 收在門口兩側、不擋路，也不擋鏡頭（遮擋方塊會蓋住整個門口）
    height: () => 0,
  },

  /** 屋頂的大理石圓桌與四張石凳（直徑約 1 公尺是設計值）；放茶具不放菜 */
  marbleTable: {
    build(b, item, detail) {
      const { x, z } = item
      b.cylinder('stone', 0.5, 0.5, 0.07, 18, [x, 0.74, z], { tint: '#e6e2da' })
      b.cylinder('stone', 0.12, 0.2, 0.7, 10, [x, 0.36, z], { tint: '#cfcac0' })
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4
        b.cylinder('stone', 0.17, 0.2, 0.44, 10, [x + Math.cos(a) * 0.75, 0.22, z + Math.sin(a) * 0.75], { tint: '#d6d1c6' })
      }
      b.add('plain', new SphereGeometry(0.06, 10, 8), { position: [x - 0.1, 0.83, z], scale: [1, 0.8, 1], tint: '#6e3a28' })
      for (let i = 0; i < 3; i++) detail.cylinder('plain', 0.025, 0.02, 0.035, 8, [x + 0.08 + i * 0.07, 0.795, z + 0.1], { tint: '#f1ece0' })
    },
    footprint: (item) => around(item.x, item.z, 0.97),
    height: () => 0.9,
  },

  /** 樓頂庭園的假山、盆景與花架柱（模型畫在建築外觀；這裡只是碰撞） */
  roofObstacle: {
    build() {},
    footprint: (item) => rect(item.minX, item.maxX, item.minZ, item.maxZ),
    height: () => 0,
  },

  /** 門廳的傘架 */
  umbrellaStand: {
    build(b, item) {
      b.cylinder('steel', 0.16, 0.14, 0.55, 12, [item.x, 0.275, item.z], { tint: '#4a4844', openEnded: true })
      for (let i = 0; i < 3; i++) b.cylinder('wood', 0.015, 0.015, 0.9, 6, [item.x - 0.05 + i * 0.05, 0.6, item.z], { rotation: [0.1 * (i - 1), 0, 0.08 * (i - 1)], tint: ['#2a2a30', '#5a2a24', '#3a4a3a'][i] })
    },
    footprint: (item) => around(item.x, item.z, 0.2),
    height: () => 1.0,
  },

  /** 門廳的盆栽（棕櫚；示意） */
  pottedPalm: {
    build(b, item) {
      const { x, z } = item
      b.cylinder('plain', 0.24, 0.18, 0.45, 12, [x, 0.225, z], { tint: '#7c4a3a' })
      b.cylinder('wood', 0.03, 0.04, 1.1, 6, [x, 0.95, z], { tint: '#5a4030' })
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        b.box('plain', [0.6, 0.02, 0.12], [x + Math.cos(a) * 0.28, 1.45, z + Math.sin(a) * 0.28], { rotation: [0, -a, -0.35], tint: '#4f6a3a' })
      }
    },
    footprint: (item) => around(item.x, item.z, 0.28),
    height: () => 1.6,
  },

  /** 廚房門口的布簾（廚房不開放） */
  kitchenCurtain: {
    build(b, item) {
      const { x, z, width } = item
      b.box('wood', [width + 0.1, 0.06, 0.06], [x, 2.35, z], { tint: DARK })
      const n = 4
      for (let i = 0; i < n; i++) b.box('cloth', [width / n - 0.03, 2.2, 0.02], [x - width / 2 + (i + 0.5) * (width / n), 1.22, z + (i % 2) * 0.02], { tint: i % 2 ? '#2f4a5a' : '#34505f' })
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - 0.12, item.z + 0.12),
    height: () => 2.4,
  },

  /** 門廳的菜單立架：木架上攤開的摺頁菜單（模型不寫菜名，見 data/jiangShanLouObjects.js） */
  menuStand: {
    build(b, item, detail) {
      const { x, z } = item
      b.box('wood', [0.05, 1.1, 0.05], [x, 0.55, z], { tint: LACQUER })
      b.box('wood', [0.36, 0.04, 0.36], [x, 0.02, z], { tint: LACQUER })
      b.box('wood', [0.46, 0.04, 0.32], [x, 1.1, z + 0.02], { rotation: [0.45, 0, 0], tint: LACQUER })
      for (const sx of [-1, 1]) b.box('plain', [0.2, 0.01, 0.28], [x + sx * 0.105, 1.13, z + 0.02], { rotation: [0.45, 0, sx * 0.08], tint: sx < 0 ? '#c43a2c' : '#efe6cc' })
      detail.box('plain', [0.08, 0.004, 0.14], [x - 0.1, 1.14, z + 0.02], { rotation: [0.45, 0, 0], tint: '#e8c25a' })
    },
    footprint: (item) => around(item.x, item.z, 0.22),
    height: () => 1.3,
  },

  /** 門廳左牆高處的賀匾兩塊與一面廣告旗（宴席照：牆上掛致贈吳江山的賀匾與廣告旗幟） */
  plaqueWall: {
    build(b, item, detail) {
      const { x, z0, z1, y } = item
      const len = z1 - z0
      b.group([x, 0, (z0 + z1) / 2], Math.PI / 2, () => {
        inscribedBoard(b, detail, -len * 0.25, y, 0.03, 1.5, 0.55)
        inscribedBoard(b, detail, len * 0.2, y, 0.03, 1.3, 0.5)
        adBanner(b, detail, len * 0.46, y - 0.5, 0.06)
      })
    },
    footprint: (item) => rect(item.x - 0.05, item.x + 0.1, item.z0, item.z1),
    height: () => 0,
  },

  /** 等候的長椅（沿 z） */
  bench: {
    build(b, item) {
      const { x, z, length } = item
      b.box('wood', [0.42, 0.05, length], [x, 0.45, z], { tint: LACQUER })
      for (const dz of [-1, 1]) b.box('wood', [0.36, 0.43, 0.06], [x, 0.215, z + dz * (length / 2 - 0.1)], { tint: shade(LACQUER, 0.85) })
      b.box('wood', [0.05, 0.45, length], [x - 0.19, 0.72, z], { tint: shade(LACQUER, 0.9) })
    },
    footprint: (item) => rect(item.x - 0.24, item.x + 0.24, item.z - item.length / 2, item.z + item.length / 2),
    height: () => 1.0,
  },

  /**
   * 宴會廳的圓桌（宴席照：白桌布垂到桌腳、深色木的中柱與四爪腳）與十張木椅；course：桌上一道菜（金錢火雞的擺盤示意），
   * 其他桌放碗、湯匙與酒瓶。直徑 1.5 公尺、十人一桌是待核的說法。
   */
  roundTable: {
    build(b, item, detail) {
      const { x, z } = item
      const r = 0.75
      const top = 0.78
      b.cylinder('wood', 0.08, 0.1, 0.6, 10, [x, 0.38, z], { tint: DARK })
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4
        b.box('wood', [0.5, 0.06, 0.08], [x + Math.cos(a) * 0.22, 0.06, z + Math.sin(a) * 0.22], { rotation: [0, -a, 0], tint: DARK })
      }
      b.cylinder('cloth', r + 0.02, r + 0.08, 0.36, 22, [x, top - 0.16, z], { tint: CLOTH, openEnded: true })
      b.cylinder('cloth', r, r, 0.03, 22, [x, top + 0.01, z], { tint: '#f6f3ec' })
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        const cx = x + Math.cos(a) * (r + 0.32)
        const cz = z + Math.sin(a) * (r + 0.32)
        b.group([cx, 0, cz], -a - Math.PI / 2, () => {
          b.box('wood', [0.38, 0.04, 0.36], [0, 0.45, 0], { tint: '#3a281d' })
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.03, 0.45, 0.03], [sx * 0.16, 0.225, sz * 0.15], { tint: '#3a281d' })
          b.box('wood', [0.38, 0.45, 0.03], [0, 0.7, -0.17], { tint: '#33241a' })
        })
        detail.cylinder('plain', 0.06, 0.045, 0.03, 10, [x + Math.cos(a) * (r - 0.15), top + 0.04, z + Math.sin(a) * (r - 0.15)], { tint: '#f4f0e6' })
      }
      if (item.menu) {
        // 攤開的菜單（三樓的這一桌；不寫菜名）
        for (const sx of [-1, 1]) b.box('plain', [0.16, 0.006, 0.24], [x + 0.25 + sx * 0.085, top + 0.035, z + 0.35], { rotation: [0, 0.3, sx * 0.06], tint: sx < 0 ? '#c43a2c' : '#efe6cc' })
      }
      if (item.course) {
        b.cylinder('plain', 0.2, 0.17, 0.04, 18, [x, top + 0.045, z], { tint: '#f1ede2' })
        b.cylinder('plain', 0.17, 0.17, 0.005, 18, [x, top + 0.066, z], { tint: '#2c4a8a' })
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2
          b.cylinder('plain', 0.03, 0.03, 0.02, 10, [x + Math.cos(a) * 0.11, top + 0.08, z + Math.sin(a) * 0.11], { tint: '#c8924a' })
        }
      } else {
        for (const [dx, dz] of [[-0.2, 0.1], [0.2, -0.1], [0, 0.25]]) b.add('plain', new SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x + dx, top + 0.02, z + dz], scale: [1, -0.6, 1], tint: '#efe9dc' })
      }
      for (let i = 0; i < 3; i++) b.add('glass', new CylinderGeometry(0.035, 0.04, 0.3, 8), { position: [x - 0.1 + i * 0.12, top + 0.17, z - 0.25], tint: i === 1 ? '#3a5a3a' : '#5a3a20' })
    },
    footprint: (item) => around(item.x, item.z, 1.2),
    height: () => 1.0,
  },

  /** 備餐桌（靠左牆）：疊好的青花碗、湯匙與酒壺 */
  sideboard: {
    build(b, item, detail) {
      const { x, z } = item
      b.box('wood', [0.5, 0.86, 1.6], [x, 0.43, z], { tint: LACQUER })
      for (let i = 0; i < 4; i++) {
        const bz = z - 0.55 + i * 0.36
        for (let k = 0; k < 3; k++) b.cylinder('plain', 0.08, 0.06, 0.05, 12, [x, 0.89 + k * 0.045, bz], { tint: k === 2 ? '#2c4a8a' : '#f1ede2' })
      }
      b.add('plain', new SphereGeometry(0.08, 10, 8), { position: [x + 0.05, 0.96, z + 0.62], scale: [1, 1.2, 1], tint: '#9a8a6a' })
      detail.box('steel', [0.03, 0.01, 0.14], [x + 0.12, 0.865, z], { tint: '#c8c4b8' })
    },
    footprint: (item) => rect(item.x - 0.27, item.x + 0.27, item.z - 0.82, item.z + 0.82),
    height: () => 1.1,
  },

  /** 宴會廳後面的牆與通往走廊的木門（關著；其他宴會廳不畫） */
  corridorWall: {
    build(b, item) {
      const { x0, x1, z } = item
      const w = x1 - x0
      b.box('plaster', [w, 3.1, 0.12], [(x0 + x1) / 2, 1.55, z], { tint: '#e6dcc6' })
      for (const dx of [0.25, 0.7]) {
        const cx = x0 + w * dx
        b.box('wood', [1.0, 2.2, 0.06], [cx, 1.1, z + 0.08], { tint: LACQUER })
        b.box('wood', [0.04, 2.1, 0.07], [cx, 1.1, z + 0.09], { tint: shade(LACQUER, 0.7) })
      }
      b.box('wood', [w, 0.1, 0.06], [(x0 + x1) / 2, 0.05, z + 0.08], { tint: DARK })
    },
    footprint: (item) => rect(item.x0, item.x1, item.z - 0.1, item.z + 0.12),
    height: () => 3.1,
  },

  /** 宴會廳牆高處的題字匾（宴席照：兩塊深框淺底的匾） */
  hallPlaque: {
    build(b, item, detail) {
      inscribedBoard(b, detail, item.x, item.y, item.z, 1.7, 0.75)
    },
    footprint: (item) => rect(item.x - 0.85, item.x + 0.85, item.z - 0.05, item.z + 0.05),
    height: () => 0,
  },

  /** 掛在牆上的啤酒廣告旗 */
  adBanner: {
    build(b, item, detail) {
      adBanner(b, detail, item.x, 2.1, item.z)
    },
    footprint: (item) => rect(item.x - 0.25, item.x + 0.25, item.z - 0.05, item.z + 0.05),
    height: () => 0,
  },

  // 三樓大廳（歷史情境重建，依臺史博明信片〈臺灣料理江山樓三樓宴會場〉2020.006.0807.0003 目視；只能瀏覽、不放圖）

  /** 深色的方柱 */
  squareColumn: {
    build(b, item) {
      b.box('wood', [0.32, 3.1, 0.32], [item.x, 1.55, item.z], { tint: DARK })
      b.box('wood', [0.42, 0.12, 0.42], [item.x, 0.06, item.z], { tint: shade(DARK, 0.8) })
    },
    footprint: (item) => around(item.x, item.z, 0.18),
    height: () => 3.1,
  },

  /** 白桌布的方桌與四張直條靠背木椅（坐墊） */
  squareTable: {
    build(b, item, detail) {
      const { x, z } = item
      b.box('cloth', [1.0, 0.04, 1.0], [x, 0.78, z], { tint: CLOTH })
      b.box('cloth', [1.04, 0.3, 1.04], [x, 0.62, z], { tint: '#ece7db' })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, 0.48, 0.06], [x + sx * 0.44, 0.24, z + sz * 0.44], { tint: DARK })
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2
        b.group([x + Math.cos(a) * 0.82, 0, z + Math.sin(a) * 0.82], -a - Math.PI / 2, () => {
          b.box('wood', [0.4, 0.04, 0.38], [0, 0.45, 0], { tint: '#3a281d' })
          b.box('cloth', [0.34, 0.03, 0.32], [0, 0.48, 0], { tint: '#8a3a2c' })
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.03, 0.45, 0.03], [sx * 0.17, 0.225, sz * 0.16], { tint: '#3a281d' })
          for (let k = 0; k < 5; k++) detail.box('wood', [0.03, 0.42, 0.02], [-0.16 + k * 0.08, 0.7, -0.18], { tint: '#33241a' })
          b.box('wood', [0.4, 0.04, 0.03], [0, 0.92, -0.18], { tint: '#33241a' })
        })
      }
    },
    footprint: (item) => around(item.x, item.z, 1.05),
    height: () => 1.0,
  },

  /** 沿左牆的一排長桌與長凳 */
  longTable: {
    build(b, item) {
      const { x, z, length } = item
      b.box('cloth', [0.6, 0.04, length], [x, 0.78, z], { tint: CLOTH })
      for (const dz of [-1, 1]) for (const dx of [-1, 1]) b.box('wood', [0.05, 0.76, 0.05], [x + dx * 0.24, 0.38, z + dz * (length / 2 - 0.1)], { tint: DARK })
      b.box('wood', [0.3, 0.05, length], [x + 0.62, 0.45, z], { tint: LACQUER })
      for (const dz of [-1, 1]) b.box('wood', [0.24, 0.43, 0.05], [x + 0.62, 0.215, z + dz * (length / 2 - 0.12)], { tint: shade(LACQUER, 0.85) })
    },
    footprint: (item) => rect(item.x - 0.32, item.x + 0.8, item.z - item.length / 2, item.z + item.length / 2),
    height: () => 1.0,
  },

  /** 牆高處有欄杆的迴廊（只是牆上的一條走道與欄杆，走不上去） */
  gallery: {
    build(b, item, detail) {
      const { x0, x1, z0, z1, y } = item
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0)
      const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0)
      const cx = (x0 + x1) / 2
      const cz = (z0 + z1) / 2
      const n = item.inward
      const ledge = alongX ? [len, 0.08, 0.45] : [0.45, 0.08, len]
      const off = (v) => (alongX ? [cx, v[0], cz + n * v[1]] : [cx + n * v[1], v[0], cz])
      b.box('wood', ledge, off([y, 0.22]), { tint: DARK })
      b.box('wood', alongX ? [len, 0.05, 0.05] : [0.05, 0.05, len], off([y + 0.42, 0.42]), { tint: DARK })
      const count = Math.floor(len / 0.22)
      for (let i = 0; i <= count; i++) {
        const t = -len / 2 + (i * len) / count
        const pos = alongX ? [cx + t, y + 0.21, cz + n * 0.42] : [cx + n * 0.42, y + 0.21, cz + t]
        ;(i % 4 ? detail : b).box('wood', [0.03, 0.38, 0.03], pos, { tint: shade(DARK, 1.2) })
      }
    },
    footprint: (item) => rect(item.x0, item.x1, item.z0, item.z1),
    height: () => 0,
  },

  /** 白玻璃的球形吊燈 */
  globeLamp: {
    build(b, item) {
      b.box('steel', [0.015, 0.5, 0.015], [item.x, item.ceiling - 0.25, item.z], { tint: '#3a3a3a' })
      b.add('glass', new SphereGeometry(0.17, 12, 8), { position: [item.x, item.ceiling - 0.62, item.z], tint: '#f6f1df' })
    },
    footprint: (item) => around(item.x, item.z, 0.01),
    height: () => 0,
  },
}
