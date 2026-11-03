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
}
