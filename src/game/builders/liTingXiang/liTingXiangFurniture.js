import { shade } from '../props.js'

/**
 * 李亭香（老屋新生）店內的器物（第 11 階段）：器物清單在 data/liTingXiangLayout.js，寫法同林華泰
 * （build／footprint／height；見 builders/shopInterior.js）。
 * 店內的照片描述查無：展示櫃、櫃台、禮盒架、內用座位與餅印牆都是示意（歷史情境重建），
 * 糕餅的樣子依報導的文字（平西餅掌心大、渾圓、淡金色；平安龜包壓紋金紙）；查證見 docs/research/interior-li-ting-xiang.md。
 */

const WOOD = '#6e4a32'
const WOOD_LIGHT = '#b08a62'
const CAKE = '#e2c48a'
const CAKE_TOP = '#d6aa62'
const GOLD = '#d8b04a'
const MUNG = '#b9c48a'
const BOX = '#efe8da'
const RED = '#a8322a'

/** 同時移動主要零件與精緻畫質的細部（細部不跟著 b 的群組移動；detail 和 b 是同一個時只移一次） */
function grp(b, detail, position, rotationY, callback) {
  const d = detail && detail !== b ? detail : null
  b.push(position, rotationY)
  d?.push(position, rotationY)
  try {
    callback()
  } finally {
    d?.pop()
    b.pop()
  }
}

const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })

/** 一個平西餅（掌心大、渾圓、表面淡金色；大小是示意） */
function pingxi(b, detail, x, y, z, r = 0.045) {
  b.cylinder('plain', r, r * 1.05, r * 0.55, 12, [x, y + r * 0.275, z], { tint: CAKE })
  detail.cylinder('plain', r * 0.82, r * 0.82, 0.004, 12, [x, y + r * 0.55 + 0.002, z], { tint: CAKE_TOP })
}

/** 一隻平安龜（龜形小餅包壓紋金紙：扁圓的殼、頭與四足；大小是示意） */
function turtle(b, detail, x, y, z, rotationY = 0) {
  grp(b, detail, [x, y, z], rotationY, () => {
    b.box('plain', [0.09, 0.03, 0.07], [0, 0.015, 0], { tint: GOLD })
    b.box('plain', [0.07, 0.022, 0.05], [0, 0.04, 0], { tint: shade(GOLD, 1.08) })
    b.box('plain', [0.025, 0.018, 0.022], [0.055, 0.012, 0], { tint: shade(GOLD, 0.9) })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) detail.box('plain', [0.018, 0.012, 0.016], [sx * 0.035, 0.008, sz * 0.04], { tint: shade(GOLD, 0.85) })
  })
}

/** 一盤綠豆糕（小方塊） */
function mungTray(b, detail, x, y, z) {
  b.box('plain', [0.26, 0.012, 0.2], [x, y + 0.006, z], { tint: '#f4efe4' })
  for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) b.box('plain', [0.055, 0.03, 0.055], [x - 0.08 + i * 0.08, y + 0.027, z - 0.045 + k * 0.09], { tint: shade(MUNG, 1 - ((i + k) % 2) * 0.06) })
  detail.box('plain', [0.24, 0.002, 0.004], [x, y + 0.013, z + 0.098], { tint: RED })
}

/** 一串收涎餅（十二片口酥餅以紅線串成一圈，放在紅紙上；可以近看的模型在糕餅路線） */
export function shouxianRing(b, detail, x, y, z) {
  b.box('plain', [0.26, 0.004, 0.26], [x, y + 0.002, z], { rotation: [0, Math.PI / 8, 0], tint: RED })
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    b.cylinder('plain', 0.022, 0.022, 0.012, 8, [x + Math.cos(a) * 0.1, y + 0.01, z + Math.sin(a) * 0.1], { tint: CAKE })
  }
  detail.cylinder('cloth', 0.1, 0.1, 0.003, 20, [x, y + 0.017, z], { tint: '#c0302a', openEnded: true })
}

export const LTX_FURNITURE = {
  /**
   * 靠左牆的玻璃展示櫃（沿 z 擺）：木櫃身、上半是玻璃櫃，兩層擺平西餅、平安龜與綠豆糕；
   * 平西餅在靠門那一端、平安龜在裡面那一端（兩件可以近看）。
   */
  displayCase: {
    build(b, item, detail) {
      const { x, z, length, depth, height } = item
      const base = height - 0.32
      grp(b, detail, [x, 0, z], 0, () => {
        // 木櫃身（踢腳、門板的凹線）
        b.box('wood', [depth, base, length], [0, base / 2, 0], { tint: WOOD })
        b.box('dark', [0.02, 0.08, length - 0.04], [depth / 2 + 0.005, 0.04, 0], { tint: '#2e241c' })
        for (let i = 1; i < 3; i++) detail.box('dark', [0.006, base - 0.2, 0.012], [depth / 2 + 0.004, base / 2 + 0.04, -length / 2 + (i * length) / 3], { tint: '#3a2a1e' })
        // 玻璃櫃：木框、玻璃、內層板
        b.box('wood', [depth, 0.03, length], [0, base + 0.015, 0], { tint: WOOD_LIGHT })
        b.box('glassClear', [depth - 0.04, 0.3, length - 0.04], [0, base + 0.18, 0], { tint: '#dfe8ea' })
        for (const sz of [-1, 1]) b.box('wood', [depth, 0.32, 0.03], [0, base + 0.16, sz * (length / 2 - 0.015)], { tint: WOOD_LIGHT })
        b.box('wood', [depth, 0.025, length], [0, height - 0.012, 0], { tint: WOOD_LIGHT })
        // 下層：平西餅（靠門）與平安龜（裡面）；中段一盤綠豆糕
        const y0 = base + 0.035
        for (let i = 0; i < 6; i++) pingxi(b, detail, -0.12 + (i % 2) * 0.14, y0, length / 2 - 0.18 - Math.floor(i / 2) * 0.12)
        mungTray(b, detail, 0, y0, 0)
        for (let i = 0; i < 6; i++) turtle(b, detail, -0.12 + (i % 2) * 0.14, y0, -length / 2 + 0.16 + Math.floor(i / 2) * 0.12, 0.3 * (i % 3))
        // 上層的小架與標價牌（不寫字）
        b.box('glassClear', [depth - 0.12, 0.012, length - 0.2], [-0.03, base + 0.2, 0], { tint: '#e8eff0' })
        for (let i = 0; i < 4; i++) pingxi(b, detail, -0.05, base + 0.206, -length / 2 + 0.35 + i * 0.4, 0.038)
        for (let i = 0; i < 3; i++) detail.box('plain', [0.004, 0.035, 0.06], [depth / 2 - 0.04, y0 + 0.02, -length / 2 + 0.3 + i * 0.6], { tint: '#f6f1e6' })
      })
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.03, item.x + item.depth / 2 + 0.03, item.z - item.length / 2, item.z + item.length / 2),
    height: (item) => item.height + 0.05,
  },

  /** 櫃台（沿 z 擺）：木櫃面、素色紙盒、紙袋，靠門那一端放一串收涎餅（可以近看） */
  counter: {
    build(b, item, detail) {
      const { x, z, length, depth, height } = item
      grp(b, detail, [x, 0, z], 0, () => {
        b.box('wood', [depth, 0.05, length], [0, height - 0.025, 0], { tint: WOOD_LIGHT })
        b.box('planks', [0.06, height - 0.05, length], [-depth / 2 + 0.03, (height - 0.05) / 2, 0], { tint: shade(WOOD, 1.05), grime: 0.08 })
        for (const sz of [-1, 1]) b.box('wood', [depth - 0.06, height - 0.05, 0.06], [0.03, (height - 0.05) / 2, sz * (length / 2 - 0.03)], { tint: WOOD })
        // 素色紙盒一疊與紙袋
        for (let i = 0; i < 3; i++) b.box('plain', [0.26, 0.07, 0.2], [0.1, height + 0.035 + i * 0.07, -length / 2 + 0.3], { rotation: [0, 0.05 * i, 0], tint: shade(BOX, 1 - i * 0.03) })
        detail.box('plain', [0.262, 0.012, 0.03], [0.1, height + 0.2, -length / 2 + 0.3], { tint: RED })
        b.box('plain', [0.08, 0.26, 0.2], [0.12, height + 0.13, -0.05], { tint: '#d8c8a8' })
        // 收據機（示意的小黑盒）
        b.box('dark', [0.18, 0.08, 0.2], [0.14, height + 0.04, 0.3], { tint: '#2c2c2e' })
        shouxianRing(b, detail, -0.15, height, length / 2 - 0.2)
      })
    },
    footprint: (item) => rect(item.x - item.depth / 2 - 0.03, item.x + item.depth / 2 + 0.03, item.z - item.length / 2, item.z + item.length / 2),
    height: (item) => item.height + 0.25,
  },

  /** 靠右牆的禮盒架：三層木板、素色的禮盒（不畫店家的包裝設計） */
  giftBoxShelf: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      const cz = (z0 + z1) / 2
      for (const sz of [z0, z1]) b.box('wood', [0.32, 1.7, 0.03], [x, 0.85, sz], { tint: WOOD })
      for (let r = 0; r < 4; r++) {
        const y = 0.12 + r * 0.48
        b.box('wood', [0.32, 0.025, length], [x, y, cz], { tint: WOOD_LIGHT })
        if (r === 3) continue
        const n = Math.max(2, Math.floor(length / 0.26))
        for (let i = 0; i < n; i++) {
          const tint = (i + r) % 3 === 0 ? '#c9b48e' : (i + r) % 3 === 1 ? BOX : '#b8504a'
          b.box('plain', [0.24, 0.16 + (i % 2) * 0.05, 0.2], [x - 0.02, y + 0.09 + (i % 2) * 0.025, z0 + 0.15 + i * (length - 0.3) / Math.max(1, n - 1)], { tint })
          detail.box('plain', [0.005, 0.02, 0.2], [x - 0.142, y + 0.12, z0 + 0.15 + i * (length - 0.3) / Math.max(1, n - 1)], { tint: GOLD })
        }
      }
    },
    footprint: (item) => rect(item.x - 0.2, item.x + 0.2, item.z0 - 0.03, item.z1 + 0.03),
    height: () => 1.75,
  },

  /** 內用座位：小方桌、兩張椅子（前後），桌上一壺茶、兩只杯、一碟平西餅 */
  cafeTable: {
    build(b, item, detail) {
      const { x, z } = item
      grp(b, detail, [x, 0, z], 0, () => {
        b.box('wood', [0.66, 0.04, 0.66], [0, 0.74, 0], { tint: WOOD })
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.045, 0.72, 0.045], [sx * 0.28, 0.36, sz * 0.28], { tint: shade(WOOD, 0.85) })
        for (const sz of [-1, 1]) {
          const cz = sz * 0.52
          b.box('wood', [0.42, 0.035, 0.4], [0, 0.45, cz], { tint: WOOD_LIGHT })
          for (const sx of [-1, 1]) for (const kz of [-1, 1]) b.box('wood', [0.035, 0.45, 0.035], [sx * 0.18, 0.225, cz + kz * 0.17], { tint: shade(WOOD, 0.85) })
          b.box('wood', [0.42, 0.36, 0.03], [0, 0.65, cz + sz * 0.19], { tint: WOOD_LIGHT })
        }
        b.cylinder('plain', 0.07, 0.08, 0.1, 12, [0.12, 0.81, -0.08], { tint: '#f0ece2' })
        detail.cylinder('plain', 0.025, 0.02, 0.04, 8, [0.12, 0.88, -0.08], { tint: '#f0ece2' })
        for (const s of [-1, 1]) b.cylinder('plain', 0.03, 0.025, 0.045, 10, [-0.12, 0.783, s * 0.17], { tint: '#f6f2ea' })
        b.cylinder('plain', 0.1, 0.09, 0.012, 14, [-0.1, 0.766, 0], { tint: '#f6f2ea' })
        pingxi(b, detail, -0.1, 0.772, 0, 0.04)
      })
    },
    footprint: (item) => rect(item.x - 0.36, item.x + 0.36, item.z - 0.76, item.z + 0.76),
    height: () => 1.0,
  },

  /**
   * 左牆掛的一片木板與餅印（示意：華山糕餅文化館有餅模展示，本店的掛牆是示意）：
   * 深色木雕的長方餅印，刻圓形、桃形、龜形的凹槽；中央一塊是壽字桃形餅印（可以近看）。
   */
  mouldWall: {
    build(b, item, detail) {
      const { x, z0, z1 } = item
      const length = z1 - z0
      grp(b, detail, [x, 0, (z0 + z1) / 2], Math.PI / 2, () => {
        // 群組裡的本地 x 沿牆（世界 -z → 本地 +x），本地 +z 朝店內
        b.box('planks', [length, 1.1, 0.025], [0, 1.45, 0.012], { tint: '#9a7652' })
        const shapes = ['round', 'peach', 'turtle', 'round', 'peach', 'round', 'turtle', 'peach']
        const cols = 4
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < cols; c++) {
            const lx = -length / 2 + (c + 0.5) * (length / cols)
            const ly = 1.2 + r * 0.5
            b.box('wood', [0.34, 0.2, 0.04], [lx, ly, 0.045], { tint: shade('#4a3222', 0.92 + ((r + c) % 3) * 0.06) })
            b.box('wood', [0.08, 0.06, 0.035], [lx + 0.2, ly, 0.045], { tint: '#3e2a1c' })
            const shape = shapes[r * cols + c]
            if (shape === 'round') b.cylinder('dark', 0.065, 0.065, 0.006, 12, [lx - 0.03, ly, 0.066], { rotation: [Math.PI / 2, 0, 0], tint: '#2a1c12' })
            else if (shape === 'peach') {
              b.cylinder('dark', 0.06, 0.06, 0.006, 12, [lx - 0.03, ly - 0.01, 0.066], { rotation: [Math.PI / 2, 0, 0], tint: '#2a1c12' })
              b.box('dark', [0.06, 0.06, 0.006], [lx - 0.03, ly + 0.035, 0.066], { rotation: [0, 0, Math.PI / 4], tint: '#2a1c12' })
            } else {
              b.box('dark', [0.13, 0.09, 0.006], [lx - 0.03, ly, 0.066], { tint: '#2a1c12' })
              detail.box('dark', [0.03, 0.03, 0.006], [lx + 0.05, ly, 0.066], { tint: '#2a1c12' })
            }
          }
        }
      })
    },
    footprint: (item) => rect(item.x - 0.04, item.x + 0.1, item.z0, item.z1),
    height: () => 2.1,
  },

  /** 隔間牆中央的後門：關著的兩扇木門（後面是工作間，不開放） */
  backDoor: {
    build(b, item) {
      const { x, z, width } = item
      for (const s of [-1, 1]) {
        b.box('wood', [width / 2 - 0.02, 2.12, 0.05], [x + s * (width / 4), 1.06, z + 0.03], { tint: '#7a5236' })
        b.box('wood', [width / 2 - 0.18, 0.9, 0.012], [x + s * (width / 4), 1.45, z + 0.06], { tint: '#6a462e' })
        b.box('steel', [0.02, 0.14, 0.03], [x + s * 0.06, 1.0, z + 0.07], { tint: '#b8a36a' })
      }
    },
    footprint: (item) => rect(item.x - item.width / 2, item.x + item.width / 2, item.z - 0.12, item.z + 0.12),
    height: () => 2.2,
  },
}
