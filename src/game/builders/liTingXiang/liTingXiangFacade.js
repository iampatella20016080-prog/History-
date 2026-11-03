import { LTX_SHELL } from '../../../data/liTingXiangLayout.js'
import { STREET } from '../../config.js'
import { signBoard } from '../facade.js'
import { pottedPlant, shade } from '../props.js'

/**
 * 李亭香・老屋新生的外觀（使用者提供的照片，2026-11-03）：
 * 紅磚的多層洋樓，每層樓之間是灰色洗石子的水平飾帶與突出的簷線，兩端灰色的壁柱；
 * 二、三樓每層兩扇直長方窗（灰色窗楣與窗台），四樓是兩扇圓拱窗，頂上一排灰色欄杆女兒牆；
 * 一樓上方的灰色石匾刻「香亭李」（由右往左讀）；騎樓的磚柱與灰色柱腳、紅色磁磚的步道。
 * 一樓門面是現在的樣子：白色灰泥牆、左邊一扇白框玻璃門（八角形的窗）、右邊兩扇圓拱窗，
 * 上面一整條黑色的弧形雨遮寫 LI TING XIANG，門口擺幾盆綠色植栽。
 *
 * 簡化：真實的店在轉角，是好幾開間的大樓，這裡只做這個地段面寬 5.4 公尺的一開間正面，不做轉角與側面的開間；
 * 樓層數依照片取四層加女兒牆，尺寸是估算。外殼只用街景裡已經有的材質（流暢畫質的批次數不變）。
 */
const S = LTX_SHELL
const BRICK = '#c06a52'
const GREY = '#9c9a92'
const GREY_DARK = '#86847c'
const WHITE = '#f1eee6'
const UPPER_H = 3.0
const FLOORS = 3

/** 本地座標：+z 朝街道；樓上的立面在騎樓外緣（z = walkD），一樓的店面在 z = 0 */
export function buildLiTingXiangFacade(b, cfg, detail) {
  const w = S.half * 2
  const D = S.depth
  const walkD = STREET.walkwayDepth
  const walkH = STREET.walkwayHeight
  const gH = S.groundH
  const top = gH + UPPER_H * FLOORS
  const parapetH = 0.95
  const front = walkD
  const pilaster = 0.42
  const d = detail ?? b

  // ── 建築本體：側牆、後牆、屋頂（紅磚；鄰棟擋住大部分，只要輪廓）
  for (const s of [-1, 1]) b.box('brick', [S.wallT, top, D + front], [s * (S.half - S.wallT / 2), top / 2, (front - D) / 2], { tint: shade(BRICK, 0.92) })
  b.box('brick', [w, top, S.wallT], [0, top / 2, -D + S.wallT / 2], { tint: shade(BRICK, 0.9) })
  b.box('stucco', [w, 0.2, D + front], [0, top + 0.1, (front - D) / 2], { tint: GREY_DARK })

  // ── 樓上的立面（騎樓外緣）：紅磚牆、兩端的灰色壁柱
  const innerW = w - pilaster * 2
  b.box('brick', [innerW, top - gH, 0.3], [0, (gH + top) / 2, front - 0.15], { tint: BRICK })
  for (const s of [-1, 1]) {
    b.box('stucco', [pilaster, top - gH + 0.2, 0.36], [s * (S.half - pilaster / 2), (gH + top) / 2, front - 0.12], { tint: GREY })
    // 壁柱上一道道的磚縫線（灰色洗石子仿石塊）
    for (let y = gH + 0.5; y < top; y += 0.5) d.box('stucco', [pilaster + 0.01, 0.025, 0.37], [s * (S.half - pilaster / 2), y, front - 0.12], { tint: GREY_DARK })
  }

  // ── 每層樓的水平飾帶與簷線（灰色洗石子，突出牆面）；中段的磚牆另有一道細的灰帶
  for (let f = 0; f <= FLOORS; f++) {
    const y = gH + f * UPPER_H
    const band = f === 0 ? 0.55 : 0.32
    b.box('stucco', [w + 0.1, band, 0.5], [0, y + band / 2 - (f === 0 ? 0.2 : 0), front + 0.05], { tint: GREY })
    b.box('stucco', [w + 0.2, 0.08, 0.6], [0, y + band - (f === 0 ? 0.2 : 0), front + 0.08], { tint: GREY_DARK })
    if (f > 0 && f < FLOORS) b.box('stucco', [innerW, 0.14, 0.34], [0, y + UPPER_H * 0.55, front - 0.1], { tint: GREY })
  }

  // ── 窗：二、三樓兩扇直長方窗（灰色窗楣與窗台、白色窗框分格）；四樓兩扇圓拱窗
  const winW = 1.05
  const winXs = [-0.95, 0.95]
  for (let f = 0; f < FLOORS; f++) {
    // 二樓的窗在石匾上面（照片：石匾夾在一樓與二樓的窗之間）
    const y0 = gH + f * UPPER_H + (f === 0 ? 1.2 : 0.75)
    const arched = f === FLOORS - 1
    const h = arched ? 1.35 : f === 0 ? 1.3 : 1.55
    for (const x of winXs) {
      b.box('windowLit', [winW, h, 0.06], [x, y0 + h / 2, front + 0.005], { tint: '#3d3a36' })
      b.box('stucco', [winW + 0.24, 0.12, 0.46], [x, y0 - 0.06, front + 0.06], { tint: GREY })
      // 白色的窗框：外框與井字分格
      for (const s of [-1, 1]) b.box('plain', [0.05, h, 0.04], [x + s * (winW / 2 - 0.025), y0 + h / 2, front + 0.04], { tint: WHITE })
      b.box('plain', [0.04, h, 0.04], [x, y0 + h / 2, front + 0.04], { tint: WHITE })
      b.box('plain', [winW, 0.04, 0.04], [x, y0 + h * 0.62, front + 0.04], { tint: WHITE })
      if (arched) {
        // 圓拱：灰色的拱圈（大一圈的圓）與拱裡的玻璃（下半被窗擋住）
        const r = winW / 2
        b.cylinder('stucco', r + 0.16, r + 0.16, 0.08, 18, [x, y0 + h, front + 0.01], { rotation: [Math.PI / 2, 0, 0], tint: GREY })
        b.cylinder('windowLit', r, r, 0.08, 18, [x, y0 + h, front + 0.035], { rotation: [Math.PI / 2, 0, 0], tint: '#3d3a36' })
        b.box('stucco', [0.16, 0.24, 0.12], [x, y0 + h + r + 0.08, front + 0.06], { tint: GREY_DARK })
      } else {
        b.box('stucco', [winW + 0.3, 0.2, 0.42], [x, y0 + h + 0.12, front + 0.05], { tint: GREY })
      }
    }
  }

  // ── 四樓窗下的陽臺欄杆（灰色寶瓶欄杆示意）與頂上的欄杆女兒牆
  const balustrade = (y, z, height) => {
    b.box('stucco', [innerW, 0.1, 0.32], [0, y + height - 0.05, z], { tint: GREY })
    b.box('stucco', [innerW, 0.08, 0.34], [0, y + 0.04, z], { tint: GREY_DARK })
    const n = Math.round(innerW / 0.2)
    for (let i = 0; i < n; i++) b.box('stucco', [0.08, height - 0.18, 0.08], [-innerW / 2 + (i + 0.5) * (innerW / n), y + height / 2, z], { tint: GREY })
  }
  balustrade(gH + 2 * UPPER_H + 0.32, front + 0.2, 0.42)
  b.box('stucco', [w + 0.1, parapetH, 0.3], [0, top + parapetH / 2, front - 0.15], { tint: GREY_DARK })
  balustrade(top + 0.1, front + 0.02, parapetH - 0.2)
  for (const s of [-1, 1]) b.box('stucco', [pilaster + 0.06, parapetH + 0.25, 0.4], [s * (S.half - pilaster / 2), top + (parapetH + 0.25) / 2, front - 0.1], { tint: GREY })

  // ── 一樓上方的石匾「香亭李」（由右往左讀，灰色石板刻字）
  b.box('stucco', [2.3, 0.62, 0.12], [0, gH + 0.72, front + 0.12], { tint: '#a9a79f' })
  signBoard(b, { text: '香亭李', style: 'engraved', x: 0, y: gH + 0.72, z: front + 0.18, width: 1.9, height: 0.46, frame: false })

  // ── 騎樓：天花、兩端的磚柱與灰色柱腳、紅色磁磚的步道
  b.box('plaster', [w, 0.08, walkD], [0, gH - 0.04, walkD / 2], { tint: WHITE })
  for (const s of [-1, 1]) {
    const x = s * (S.half - 0.24)
    b.box('brick', [0.44, gH - 0.55, 0.44], [x, 0.55 + (gH - 0.55) / 2, walkD - 0.26], { tint: BRICK })
    b.box('stucco', [0.5, 0.55, 0.5], [x, 0.275, walkD - 0.26], { tint: GREY })
  }
  b.box('pavers', [w, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: '#c4714f' })

  // ── 一樓的店面（現在的樣子）：白牆、左邊的玻璃門、右邊兩扇圓拱窗、黑色弧形雨遮
  const room = S.room
  const door = cfg.door
  const fz = -0.15
  const wallSeg = (x0, x1, y0, y1) => b.box('plaster', [x1 - x0, y1 - y0, 0.3], [(x0 + x1) / 2, (y0 + y1) / 2, fz], { tint: WHITE })
  const openTop = 2.45
  wallSeg(room.minX - 0.35, door.minX, 0, openTop)
  wallSeg(door.maxX, room.maxX + 0.35, 0, openTop)
  wallSeg(room.minX - 0.35, room.maxX + 0.35, openTop, gH)
  // 門框（白色）與門楣下的門檻石
  for (const x of [door.minX, door.maxX]) b.box('plain', [0.07, openTop, 0.34], [x, openTop / 2, fz], { tint: '#fbfaf6' })
  b.box('stucco', [door.maxX - door.minX, 0.06, 0.4], [(door.minX + door.maxX) / 2, 0.03, 0.05], { tint: '#d8d4ca' })
  // 右邊兩扇圓拱窗（看得到店裡的燈光）
  for (const x of [0.35, 1.55]) {
    const ww = 0.62
    b.box('windowLit', [ww, 1.2, 0.06], [x, 0.7 + 0.6, fz + 0.14], { tint: '#6a4a2e' })
    b.cylinder('windowLit', ww / 2, ww / 2, 0.06, 16, [x, 1.9, fz + 0.14], { rotation: [Math.PI / 2, 0, 0], tint: '#6a4a2e' })
    b.box('plain', [ww + 0.08, 0.05, 0.08], [x, 0.68, fz + 0.18], { tint: '#fbfaf6' })
    // 白色的窗框（兩側與拱頂）
    for (const s of [-1, 1]) b.box('plain', [0.05, 1.2, 0.05], [x + s * (ww / 2 + 0.02), 1.3, fz + 0.17], { tint: '#fbfaf6' })
  }
  // 黑色弧形雨遮與上面的字（店名的英文拼法）
  // 圓弧：從牆面的上緣往外、往下彎成四分之一圓，前緣一條垂下的布邊
  const awY = gH - 0.12
  const R = 0.55
  const slats = 6
  for (let i = 0; i < slats; i++) {
    const a = ((i + 0.5) / slats) * (Math.PI / 2)
    b.box('awning', [w - 0.5, 0.05, (R * Math.PI) / 2 / slats + 0.02], [0, awY - R + R * Math.cos(a), -0.02 + R * Math.sin(a)], { rotation: [a, 0, 0], tint: '#1f1d1c' })
  }
  b.box('awning', [w - 0.5, 0.3, 0.05], [0, awY - R - 0.15, -0.02 + R], { tint: '#1f1d1c' })
  signBoard(b, { text: 'LI TING XIANG', style: 'awningBlack', x: 0, y: awY - R - 0.15, z: R + 0.01, width: 2.6, height: 0.26, frame: false })
  // 門口的植栽（照片：門兩側與窗下一排綠色盆栽）
  pottedPlant(b, [room.minX + 0.1, walkH, 0.45], { seed: 3, size: 1.2, potTint: '#e9e6de' })
  pottedPlant(b, [door.maxX + 0.35, walkH, 0.4], { seed: 5, size: 0.9, potTint: '#e9e6de' })
  pottedPlant(b, [room.maxX - 0.05, walkH, 0.45], { seed: 8, size: 1.3, potTint: '#7c5a3a' })

  // ── 鏡頭遮擋：騎樓以上的樓層（樓上立面突出到騎樓外緣）與騎樓柱
  b.addBlocker(-S.half, S.half, gH - 0.1, top + parapetH, 0, front + 0.1)
  for (const s of [-1, 1]) {
    const x = s * (S.half - 0.24)
    b.addBlocker(x - 0.25, x + 0.25, 0, gH, walkD - 0.51, walkD - 0.01)
  }

  return { groundHeight: gH, ridgeHeight: top + parapetH, topHeight: top + parapetH, markerHeight: top + parapetH + 2.2 }
}

/** 騎樓柱的障礙物（本地座標） */
export function ltxArcadeColumns() {
  const walkD = STREET.walkwayDepth
  return [-1, 1].map((s) => {
    const x = s * (S.half - 0.24)
    return { minX: x - 0.27, maxX: x + 0.27, minZ: walkD - 0.53, maxZ: walkD + 0.01 }
  })
}
