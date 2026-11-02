import { SphereGeometry, TorusGeometry } from 'three'
import { shade } from '../props.js'
import { YJ_FURNITURE } from '../youJi/youJiFurniture.js'

/**
 * 新芳春茶行各年代室內的器物（第 11 階段）：器物清單在 data/xinFangChunLayout.js，寫法同林華泰、有記
 * （build／footprint／height；見 builders/shopInterior.js）。沿用林華泰與有記的櫃台、層架、揀茶桌、焙坑、焙籠、磅仔、方桌等。
 * 形制依據寫在各器物的註解（〔照片〕是 Wikimedia Commons「Category:Sin Hong Choon」與《臺灣工藝》77 期的照片觀察）；
 * 查證見 docs/research/interior-xin-fang-chun.md。
 */

const IRON = '#3a3e3c'
const BLUE_GREY = '#4f6670'
const DARK_WOOD = '#3a2a20'
const BAMBOO = '#cdb27e'

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })
const around = (x, z, hx, hz = hx) => rect(x - hx, x + hx, z - hz, z + hz)
const boxFootprint = (item, pad = 0.03) => rect(item.x - item.width / 2 - pad, item.x + item.width / 2 + pad, item.z - item.depth / 2 - pad, item.z + item.depth / 2 + pad)

/** 一張靠背木椅（朝本地 +z 坐） */
function chair(b, x, z, rotationY, tint = DARK_WOOD) {
  b.group([x, 0, z], rotationY, () => {
    b.box('wood', [0.4, 0.04, 0.38], [0, 0.45, 0], { tint })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.035, 0.45, 0.035], [sx * 0.17, 0.225, sz * 0.16], { tint })
    b.box('wood', [0.4, 0.5, 0.035], [0, 0.72, -0.18], { tint: shade(tint, 0.9) })
  })
}

/** 一個外銷方鐵罐（紅：CHASE & SANBORN、綠：HUNG KEE；字樣只畫色塊） */
function exportTin(b, x, y, z, red, s = 1) {
  b.box('steel', [0.13 * s, 0.2 * s, 0.13 * s], [x, y + 0.1 * s, z], { tint: red ? '#a5362c' : '#3f6a4a' })
  b.box('plain', [0.135 * s, 0.07 * s, 0.135 * s], [x, y + 0.1 * s, z], { tint: '#e2cf96' })
  b.box('steel', [0.11 * s, 0.025 * s, 0.11 * s], [x, y + 0.21 * s, z], { tint: '#c9b37a' })
}

export const XFC_FURNITURE = {
  ...YJ_FURNITURE,

  /** 天井的馬賽克拼花地坪（Marie Claire：宜蘭石磨石子與拼花馬賽克；〔照片〕修復專文）；花樣是示意 */
  wellFloor: {
    build(b, item, detail) {
      const { x, z, width, depth } = item
      b.box('stone', [width, 0.02, depth], [x, 0.06, z], { tint: '#d9d2c2' })
      b.box('stone', [width - 0.3, 0.022, depth - 0.3], [x, 0.062, z], { tint: '#b4746a' })
      b.box('stone', [width - 0.5, 0.024, depth - 0.5], [x, 0.064, z], { tint: '#e2dccd' })
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2
        b.box('stone', [0.36, 0.026, 0.36], [x + Math.cos(a) * 0.45, 0.066, z + Math.sin(a) * 0.45], { rotation: [0, Math.PI / 4, 0], tint: i % 2 ? '#5d7f86' : '#a35a4c' })
      }
      for (let i = 0; i < 16; i++) detail.box('stone', [0.06, 0.028, 0.06], [x - width / 2 + 0.12 + (i % 8) * ((width - 0.24) / 7), 0.067, z + (i < 8 ? -1 : 1) * (depth / 2 - 0.08)], { tint: i % 2 ? '#3f5f68' : '#c9a26a' })
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - item.depth / 2, item.z + item.depth / 2),
    height: () => 0,
  },

  /**
   * 大稻埕現存最大的風選機（〔照片〕Commons〈新芳春茶行風選機.jpg〉）：高處的木格箱、斜下到地面的木作斜槽（帆布帶）、
   * 深色鐵漏斗、大鐵飛輪與皮帶，主體深灰藍漆，長約 4–5 公尺（本站縮成 length）。長邊沿 z，靠右牆。
   */
  bigWinnower: {
    build(b, item, detail) {
      const { x, z, length, width } = item
      const z0 = z + length / 2
      const z1 = z - length / 2
      // 高處的木格箱（後端）與支架
      b.box('planks', [width, 0.9, 0.9], [x, 2.0, z1 + 0.5], { tint: '#7a5a3c' })
      for (let i = 0; i < 3; i++) detail.box('wood', [width + 0.02, 0.03, 0.92], [x, 1.7 + i * 0.3, z1 + 0.5], { tint: '#5a4030' })
      for (const sx of [-1, 1]) for (const dz of [0.1, 0.9]) b.box('wood', [0.08, 1.6, 0.08], [x + sx * (width / 2 - 0.05), 0.8, z1 + dz], { tint: '#5a4030' })
      // 斜槽（從木格箱斜下到前端地面）
      const run = length - 1.1
      const drop = 1.45
      const ang = Math.atan2(drop, run)
      b.box('planks', [width * 0.7, 0.06, Math.hypot(run, drop)], [x, 0.3 + drop / 2, z1 + 1.0 + run / 2], { rotation: [-ang, 0, 0], tint: BLUE_GREY })
      for (const sx of [-1, 1]) b.box('wood', [0.05, 0.18, Math.hypot(run, drop)], [x + sx * width * 0.36, 0.38 + drop / 2, z1 + 1.0 + run / 2], { rotation: [-ang, 0, 0], tint: shade(BLUE_GREY, 0.8) })
      // 前端的鐵漏斗與機座
      b.box('steel', [width, 0.6, 0.7], [x, 0.3, z0 - 0.4], { tint: shade(BLUE_GREY, 0.85) })
      b.cylinder('steel', 0.35, 0.12, 0.45, 4, [x, 0.85, z0 - 0.4], { rotation: [0, Math.PI / 4, 0], tint: IRON })
      // 大鐵飛輪與皮帶（朝走道 -x 那一側）
      b.add('steel', new TorusGeometry(0.42, 0.04, 6, 20), { position: [x - width / 2 - 0.08, 0.95, z0 - 1.2], rotation: [0, Math.PI / 2, 0], tint: IRON })
      for (let i = 0; i < 4; i++) b.box('steel', [0.03, 0.8, 0.03], [x - width / 2 - 0.08, 0.95, z0 - 1.2], { rotation: [(i * Math.PI) / 4, 0, 0], tint: IRON })
      b.box('dark', [0.02, 1.6, 0.06], [x - width / 2 - 0.08, 1.9, z0 - 1.2], { tint: '#2a2622' })
      b.cylinder('bamboo', 0.24, 0.2, 0.36, 12, [x - 0.1, 0.18, z0 + 0.2], { tint: BAMBOO, openEnded: true })
    },
    footprint: (item) => rect(item.x - item.width / 2 - 0.15, item.x + item.width / 2, item.z - item.length / 2, item.z + item.length / 2 + 0.4),
    height: () => 2.5,
  },

  /**
   * 切茶機（〔照片〕Commons〈新芳春茶行切茶機.jpg〉）：鑄鐵機身、上方梯形鐵漏斗、側面大齒輪與飛輪（直徑約 50 公分）、
   * 皮帶往上連到天軸；菱形銘牌；A 形鑄鐵腳架；地上兩個圓筒網狀滾筒；高約 1.5 公尺。
   */
  teaCutter: {
    build(b, item, detail) {
      const { x, z } = item
      for (const sx of [-1, 1]) {
        b.box('steel', [0.08, 0.9, 0.08], [x + sx * 0.3, 0.45, z - 0.2], { rotation: [0.2, 0, 0], tint: IRON })
        b.box('steel', [0.08, 0.9, 0.08], [x + sx * 0.3, 0.45, z + 0.2], { rotation: [-0.2, 0, 0], tint: IRON })
      }
      b.box('steel', [0.7, 0.4, 0.5], [x, 1.05, z], { tint: '#454a47' })
      b.cylinder('steel', 0.34, 0.16, 0.36, 4, [x, 1.43, z], { rotation: [0, Math.PI / 4, 0], tint: IRON })
      b.add('steel', new TorusGeometry(0.25, 0.035, 6, 18), { position: [x + 0.42, 1.05, z], rotation: [0, Math.PI / 2, 0], tint: IRON })
      for (let i = 0; i < 3; i++) b.box('steel', [0.02, 0.48, 0.03], [x + 0.42, 1.05, z], { rotation: [(i * Math.PI) / 3, 0, 0], tint: IRON })
      b.cylinder('steel', 0.16, 0.16, 0.06, 14, [x - 0.4, 1.05, z], { rotation: [0, 0, Math.PI / 2], tint: '#5a5e5a' })
      b.box('steel', [0.004, 0.1, 0.1], [x - 0.351, 1.1, z + 0.12], { rotation: [Math.PI / 4, 0, 0], tint: '#b8a46a' })
      b.box('dark', [0.02, 1.4, 0.05], [x + 0.42, 1.95, z], { tint: '#2a2622' })
      for (const dx of [-0.25, 0.2]) detail.cylinder('steel', 0.12, 0.12, 0.45, 10, [x + dx, 0.12, z + 0.42], { rotation: [0, 0, Math.PI / 2], tint: '#7a7e78', openEnded: true })
    },
    footprint: (item) => around(item.x, item.z, 0.5, 0.42),
    height: () => 1.7,
  },

  /** 抖篩機（〔照片〕Commons〈新芳春茶行抖篩機.jpg〉）：梯形鐵漏斗、長木條框斜槽（木條留縫）、鐵架腳、一側飛輪。長邊沿 z */
  sieveShaker: {
    build(b, item) {
      const { x, z } = item
      for (const dz of [-0.6, 0.6]) for (const sx of [-1, 1]) b.box('steel', [0.05, 0.7 + dz * 0.3, 0.05], [x + sx * 0.25, (0.7 + dz * 0.3) / 2, z + dz], { tint: IRON })
      b.box('wood', [0.55, 0.06, 1.4], [x, 0.78, z], { rotation: [-0.2, 0, 0], tint: '#8a6a48' })
      for (let i = 0; i < 6; i++) b.box('wood', [0.5, 0.04, 0.03], [x, 0.84 + i * 0.012, z - 0.6 + i * 0.24], { rotation: [-0.2, 0, 0], tint: '#6e5034' })
      b.cylinder('steel', 0.3, 0.1, 0.35, 4, [x, 1.25, z - 0.65], { rotation: [0, Math.PI / 4, 0], tint: IRON })
      b.add('steel', new TorusGeometry(0.2, 0.03, 6, 16), { position: [x + 0.32, 0.7, z + 0.3], rotation: [0, Math.PI / 2, 0], tint: IRON })
    },
    footprint: (item) => rect(item.x - 0.32, item.x + 0.4, item.z - 0.72, item.z + 0.72),
    height: () => 1.5,
  },

  /** 深色多抽屜木辦公桌與木凳（〔照片〕《臺灣工藝》77 期 p.55：王家生活展） */
  officeDesk: {
    build(b, item, detail) {
      const { x, z } = item
      b.box('wood', [1.3, 0.05, 0.7], [x, 0.78, z], { tint: DARK_WOOD })
      for (const sx of [-1, 1]) {
        b.box('wood', [0.4, 0.73, 0.66], [x + sx * 0.43, 0.365, z], { tint: shade(DARK_WOOD, 1.1) })
        for (let i = 0; i < 3; i++) {
          b.box('wood', [0.34, 0.18, 0.01], [x + sx * 0.43, 0.15 + i * 0.22, z + 0.335], { tint: shade(DARK_WOOD, 1.25) })
          detail.box('steel', [0.06, 0.015, 0.02], [x + sx * 0.43, 0.18 + i * 0.22, z + 0.345], { tint: '#b8a46a' })
        }
      }
      b.box('plain', [0.3, 0.03, 0.22], [x - 0.2, 0.82, z], { tint: '#e2d6b4' })
      chair(b, x, z + 0.6, Math.PI, '#4a3426')
    },
    footprint: (item) => rect(item.x - 0.68, item.x + 0.68, item.z - 0.38, item.z + 0.85),
    height: () => 1.0,
  },

  /** 1930 年代風格的會客沙發與茶几（形制示意；《臺灣工藝》77 期寫二樓「完整保留 1930 年代風格的會客大廳」） */
  armchairSet: {
    build(b, item) {
      const { x, z } = item
      b.box('wood', [0.9, 0.06, 0.55], [x, 0.45, z], { tint: DARK_WOOD })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.05, 0.42, 0.05], [x + sx * 0.4, 0.21, z + sz * 0.22], { tint: DARK_WOOD })
      for (const [cx, cz, ry] of [[x - 0.95, z, Math.PI / 2], [x + 0.95, z, -Math.PI / 2]]) {
        b.group([cx, 0, cz], ry, () => {
          b.box('cloth', [0.7, 0.42, 0.65], [0, 0.21, 0], { tint: '#6a3a2c' })
          b.box('cloth', [0.7, 0.45, 0.16], [0, 0.6, -0.26], { tint: '#5e3226' })
          for (const sx of [-1, 1]) b.box('cloth', [0.12, 0.25, 0.6], [sx * 0.33, 0.5, 0], { tint: '#5e3226' })
        })
      }
      b.cylinder('plain', 0.05, 0.06, 0.08, 10, [x, 0.52, z], { tint: '#efe9dc' })
    },
    footprint: (item) => rect(item.x - 1.35, item.x + 1.35, item.z - 0.4, item.z + 0.4),
    height: () => 0.9,
  },

  /** 往三樓的樓梯口：三階磨石子踏面與關著的黑木門（三樓不開放、不畫；〔照片〕Commons〈新芳春茶行階梯.jpg〉的踏面與牆面） */
  sealedStair: {
    build(b, item) {
      const { x, z } = item
      for (let i = 0; i < 3; i++) b.box('stone', [0.95, 0.18 * (i + 1), 0.3], [x, 0.09 * (i + 1), z + 0.45 - i * 0.3], { tint: '#c8c2b4' })
      b.box('wood', [0.95, 2.0, 0.08], [x, 0.54 + 1.0, z - 0.42], { tint: '#22201e' })
      b.box('stone', [1.05, 2.4, 0.04], [x, 1.2, z - 0.5], { tint: '#b9b5aa' })
    },
    footprint: (item) => rect(item.x - 0.5, item.x + 0.55, item.z - 0.65, item.z + 0.62),
    height: () => 2.6,
  },

  /** 牆上的優良茶比賽獎狀（直式、泛黃、上緣國徽與紅印；〔照片〕《臺灣工藝》77 期 p.56；字是示意）。面朝 +z */
  certificateFrame: {
    build(b, item, detail) {
      const { x, z, y } = item
      b.box('wood', [0.5, 0.68, 0.03], [x, y, z], { tint: '#3a2418' })
      b.box('plain', [0.42, 0.6, 0.01], [x, y, z + 0.02], { tint: '#e8dcb4' })
      b.cylinder('plain', 0.04, 0.04, 0.005, 12, [x, y + 0.22, z + 0.027], { rotation: [Math.PI / 2, 0, 0], tint: '#2c4a8a' })
      b.box('plain', [0.06, 0.06, 0.004], [x + 0.12, y - 0.2, z + 0.027], { tint: '#b8382c' })
      for (let i = 0; i < 6; i++) detail.box('plain', [0.006, 0.3, 0.003], [x + 0.15 - i * 0.05, y, z + 0.027], { tint: '#3a3028' })
    },
    footprint: (item) => rect(item.x - 0.25, item.x + 0.25, item.z - 0.05, item.z + 0.05),
    height: () => 0,
  },

  /** 外銷鐵罐的木架（side：'left' 靠左牆、'right' 靠右牆；紅綠方鐵罐依《臺灣工藝》77 期 p.57，字樣只畫色塊） */
  tinRack: {
    build(b, item) {
      const { x, z0, z1, side } = item
      const length = z1 - z0
      const cz = (z0 + z1) / 2
      const face = side === 'left' ? 1 : -1
      b.box('wood', [0.04, 2.0, length], [x - face * 0.17, 1.0, cz], { tint: '#6a4a2c' })
      for (let row = 0; row < 4; row++) {
        const y = 0.35 + row * 0.48
        b.box('wood', [0.36, 0.03, length], [x, y, cz], { tint: '#8a643e' })
        const n = Math.round(length / 0.2)
        for (let i = 0; i < n; i++) exportTin(b, x + face * 0.02, y + 0.015, z0 + 0.12 + (i * (length - 0.24)) / (n - 1), (i + row) % 3 === 0)
      }
    },
    footprint: (item) => rect(item.x - 0.2, item.x + 0.2, item.z0, item.z1),
    height: () => 2.0,
  },

  /** 部分空間出租後堆在角落的木箱與雜物（形制示意；文獻只寫部分空間出租） */
  crates: {
    build(b, item) {
      const { x, z } = item
      b.box('planks', [0.6, 0.5, 0.5], [x - 0.3, 0.25, z], { tint: '#8a6a4a' })
      b.box('planks', [0.55, 0.45, 0.45], [x + 0.32, 0.225, z + 0.05], { tint: '#7a5c40' })
      b.box('planks', [0.5, 0.4, 0.45], [x - 0.25, 0.7, z + 0.02], { tint: '#957452' })
      b.box('plain', [0.4, 0.3, 0.3], [x + 0.35, 0.6, z], { tint: '#d8ccae' })
    },
    footprint: (item) => rect(item.x - 0.65, item.x + 0.65, item.z - 0.3, item.z + 0.32),
    height: () => 1.0,
  },

  /** 王氏宗親會籌備處的長會議桌與椅子（形制示意） */
  meetingTable: {
    build(b, item) {
      const { x, z } = item
      b.box('wood', [2.4, 0.05, 0.9], [x, 0.76, z], { tint: DARK_WOOD })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, 0.73, 0.06], [x + sx * 1.1, 0.365, z + sz * 0.38], { tint: DARK_WOOD })
      b.box('cloth', [2.2, 0.01, 0.4], [x, 0.79, z], { tint: '#3e5a4a' })
      for (const dx of [-0.8, 0, 0.8]) {
        chair(b, x + dx, z + 0.7, Math.PI)
        chair(b, x + dx, z - 0.7, 0)
      }
    },
    footprint: (item) => rect(item.x - 1.25, item.x + 1.25, item.z - 0.95, item.z + 0.95),
    height: () => 1.0,
  },

  /** 故事館正廳的展桌：木桌上的茶具（〔照片〕Commons Interior-08） */
  exhibitTable: {
    build(b, item, detail) {
      const { x, z, width, depth } = item
      b.box('wood', [width, 0.05, depth], [x, 0.78, z], { tint: '#5a4030' })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, 0.75, 0.06], [x + sx * (width / 2 - 0.08), 0.375, z + sz * (depth / 2 - 0.08)], { tint: '#4a3426' })
      b.add('plain', new SphereGeometry(0.07, 10, 8), { position: [x - 0.3, 0.86, z], scale: [1, 0.8, 1], tint: '#6e3a28' })
      for (let i = 0; i < 4; i++) b.cylinder('plain', 0.03, 0.025, 0.04, 8, [x + 0.05 + (i % 2) * 0.1, 0.83, z - 0.08 + Math.floor(i / 2) * 0.16], { tint: '#f1ece0' })
      detail.box('plain', [0.26, 0.004, 0.18], [x + 0.4, 0.808, z], { tint: '#e8e0cc' })
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.0,
  },

  /** 玻璃展櫃（content：'machines' 小機件與茶壺、'certificate' 獎狀、算盤與帳本） */
  glassCase: {
    build(b, item, detail) {
      const { x, z, width, depth } = item
      b.box('wood', [width, 0.8, depth], [x, 0.4, z], { tint: '#3a2a20' })
      b.box('glassClear', [width - 0.04, 0.5, depth - 0.04], [x, 1.05, z], { tint: '#d8e8e4' })
      b.box('wood', [width, 0.04, depth], [x, 1.31, z], { tint: '#3a2a20' })
      if (item.content === 'certificate') {
        b.box('plain', [0.3, 0.004, 0.42], [x - 0.3, 0.81, z], { rotation: [0, Math.PI / 2, 0], tint: '#e8dcb4' })
        b.box('plain', [0.04, 0.004, 0.04], [x - 0.3, 0.813, z - 0.1], { tint: '#b8382c' })
        b.box('wood', [0.45, 0.025, 0.12], [x + 0.25, 0.815, z + 0.1], { tint: '#4a3322' })
        b.box('plain', [0.2, 0.04, 0.15], [x + 0.25, 0.82, z - 0.12], { tint: '#d6c9a8' })
        for (let i = 0; i < 2; i++) b.cylinder('steel', 0.05, 0.05, 0.12, 10, [x + 0.45, 0.86, z - 0.15 + i * 0.12], { tint: i ? '#4a6a50' : '#8a3a2c' })
      } else {
        b.cylinder('steel', 0.08, 0.1, 0.2, 10, [x - 0.3, 0.9, z], { tint: '#3e4240' })
        b.add('plain', new SphereGeometry(0.07, 10, 8), { position: [x + 0.2, 0.86, z], scale: [1, 0.8, 1], tint: '#6e3a28' })
        detail.box('steel', [0.2, 0.05, 0.12], [x, 0.83, z + 0.1], { tint: '#6a6e6a' })
      }
    },
    footprint: (item) => boxFootprint(item),
    height: () => 1.35,
  },

  /** 立式說明板（故事館；板面只畫淺色與幾道橫線） */
  exhibitPanel: {
    build(b, item, detail) {
      const { x, z, width } = item
      b.box('plain', [width, 1.5, 0.05], [x, 1.1, z], { tint: '#3d3a36' })
      b.box('plain', [width - 0.12, 1.3, 0.01], [x, 1.12, z + 0.03], { tint: '#e8e2d4' })
      for (let i = 0; i < 6; i++) detail.box('plain', [width - 0.3, 0.02, 0.004], [x, 1.5 - i * 0.12, z + 0.037], { tint: '#6a645a' })
      for (const sx of [-1, 1]) b.box('steel', [0.04, 0.35, 0.3], [x + sx * (width / 2 - 0.05), 0.17, z], { tint: '#2f2e2c' })
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - 0.18, item.z + 0.18),
    height: () => 1.9,
  },

  /** 窗邊的白桌巾圓桌與硬木椅（〔照片〕Commons Interior-09） */
  tastingRound: {
    build(b, item) {
      const { x, z } = item
      b.cylinder('cloth', 0.5, 0.52, 0.32, 18, [x, 0.62, z], { tint: '#f3f0ea' })
      b.cylinder('cloth', 0.5, 0.5, 0.03, 18, [x, 0.77, z], { tint: '#f6f3ee' })
      b.cylinder('wood', 0.05, 0.08, 0.46, 8, [x, 0.23, z], { tint: DARK_WOOD })
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 + 0.4
        chair(b, x + Math.cos(a) * 0.75, z + Math.sin(a) * 0.75, Math.atan2(-Math.cos(a), -Math.sin(a)) + Math.PI)
      }
      b.cylinder('plain', 0.03, 0.025, 0.04, 8, [x + 0.1, 0.81, z], { tint: '#f1ece0' })
    },
    footprint: (item) => around(item.x, item.z, 0.9),
    height: () => 1.0,
  },

  /** 隔間牆背面（焙籠間那一側）的臺灣茶業發展史時間表（故事館；文字只畫色塊） */
  timelineWall: {
    build(b, item, detail) {
      const { x0, x1, z } = item
      const w = x1 - x0
      b.box('plain', [w, 1.3, 0.02], [(x0 + x1) / 2, 1.6, z], { tint: '#2f3a3a' })
      b.box('plain', [w - 0.1, 0.03, 0.005], [(x0 + x1) / 2, 1.6, z - 0.012], { tint: '#c9a64a' })
      for (let i = 0; i < 6; i++) {
        const tx = x0 + 0.2 + (i * (w - 0.4)) / 5
        b.box('plain', [0.22, 0.32, 0.005], [tx, i % 2 ? 1.85 : 1.35, z - 0.012], { tint: '#e8e2d4' })
        detail.cylinder('plain', 0.025, 0.025, 0.006, 8, [tx, 1.6, z - 0.014], { rotation: [Math.PI / 2, 0, 0], tint: '#c9a64a' })
      }
    },
    footprint: (item) => rect(item.x0, item.x1, item.z - 0.05, item.z + 0.05),
    height: () => 0,
  },

  /** 後牆上投影的焙茶影像（〔照片〕Commons〈新芳春茶行後方焙籠間.jpg〉：右牆投影；本站放在後牆） */
  projectorWall: {
    build(b, item) {
      const { x0, x1, z } = item
      b.box('windowLit', [x1 - x0, 1.1, 0.02], [(x0 + x1) / 2, 1.9, z], { tint: '#8a6a44' })
    },
    footprint: (item) => rect(item.x0, item.x1, item.z - 0.05, item.z + 0.05),
    height: () => 0,
  },

  /** 二樓前段書店區的靠牆書架（故事館；形制示意） */
  bookShelf: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      const cz = (z0 + z1) / 2
      b.box('wood', [0.32, 2.0, length], [x, 1.0, cz], { tint: '#6a4a32' })
      for (let row = 0; row < 5; row++) {
        const y = 0.12 + row * 0.38
        b.box('wood', [0.3, 0.025, length - 0.04], [x + 0.02, y, cz], { tint: '#8a643e' })
        const n = Math.round(length / 0.09)
        for (let i = 0; i < n; i += detail === b ? 2 : 1) {
          const target = i % 2 ? detail : b
          target.box('plain', [0.2, 0.24 + ((i * 7) % 5) * 0.015, 0.06], [x + 0.03, y + 0.14, z0 + 0.06 + i * ((length - 0.12) / (n - 1))], { tint: ['#8a3a2c', '#3e5a6a', '#d8ccae', '#4a5a3a', '#6a4a6a'][(i + row) % 5] })
        }
      }
    },
    footprint: (item) => rect(item.x - 0.16, item.x + 0.16, item.z0, item.z1),
    height: () => 2.0,
  },
}
