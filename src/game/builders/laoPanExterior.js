import { Shape } from 'three'
import { LAO_PAN, LAO_PAN_HOTSPOTS, laoPanTable } from '../../data/squidSoupLayout.js'
import { shade } from './props.js'
import { bigPot, bowlStack, ladle, toppingTray } from './squidSoupWares.js'

/**
 * 老潘魷魚羹（迪化街一段30號；只在 2000–現在「老屋新生」）：立面、招牌、雨棚與騎樓下的攤車。
 *
 * 依使用者提供的店面照片重建（尺寸為估算）：
 * - 褪色的黃色長方形主招牌（立體鐵框，紅色店名、深藍色品名），右側紅底、裝飾框的直立招牌（雙面）
 * - 紅色帆布雨棚：波浪形的下緣，垂邊上寫著「冷氣開放」
 * - 老街屋：二樓灰色水泥牆與鐵窗、三樓紅磚與窗框、屋頂的水塔，少量外露的排水管與冷氣管
 * - 開放式的一樓門面：騎樓下的不鏽鋼攤車（玻璃展示罩、疊碗、兩口湯鍋），入口在攤車旁
 * 照片上的舊價格沒有放進場景；褪色與使用的痕跡用低對比的頂點色呈現，不做成廢墟。
 *
 * 一樓店內的外殼（米色地磚、牆、天花、通往後場的布簾門）也在這裡，從街上就看得到；
 * 桌椅、料理區、四道展示餐點在 laoPanInterior.js 按需載入，黑白貓在 components/LaoPanCat.jsx。
 *
 * 本地座標見 data/squidSoupLayout.js：原點在一樓店面線的中央，+z 朝迪化街，室內在 -z，+x 是從街上看的右側。
 */
const L = LAO_PAN
const GREY = '#b4b1a8'
const GREY_DARK = '#9e9b93'
const BRICK = '#c98a6c'
const RED = '#c0342b'
const YELLOW_FRAME = '#3b3f45'
const FLOOR_Y = 0.05

/* ── 立面與建築外殼 ─────────────────────── */

function arcade(b) {
  const { half, arcade: front, pier, arcadeCeiling: H } = L
  // 騎樓地坪（灰色磨石子，略低於隔壁的騎樓）與店內的米色地磚
  b.box('stone', [half * 2, 0.06, front], [0, 0.03, front / 2], { tint: '#cfcac0' })
  b.box('creamTile', [L.room.maxX - L.room.minX, FLOOR_Y, L.room.maxZ - L.room.minZ], [0, FLOOR_Y / 2, (L.room.minZ + L.room.maxZ) / 2], { tint: '#ffffff' })
  // 兩根騎樓方柱（磨石子、柱腳較深）與柱列上方的梁
  for (const s of [-1, 1]) {
    const x = s * (half - pier / 2)
    b.box('plaster', [pier, H, pier], [x, H / 2, front - pier / 2], { tint: GREY, grime: 0.35 })
    b.box('plaster', [pier + 0.04, 0.5, pier + 0.04], [x, 0.25, front - pier / 2], { tint: GREY_DARK })
  }
  b.box('plaster', [half * 2, L.groundH - H, 0.42], [0, (H + L.groundH) / 2, front - 0.21], { tint: GREY, grime: 0.1 })
  // 騎樓天花與一盞日光燈
  b.box('plaster', [half * 2 - 0.1, 0.06, front - 0.4], [0, H - 0.03, (front - 0.4) / 2], { tint: '#e2ded4' })
  b.box('bulb', [1.1, 0.04, 0.06], [0.6, H - 0.1, 0.8], { tint: '#f6f8f2' })
  b.addGlow(0.6, H - 0.2, 0.8, 0.8, '#fff6e2')
}

/** 店面線：兩側的牆垛、拉起的鐵捲門與捲門箱；整個一樓門面是開放的 */
function shopfront(b) {
  const { half, wallT } = L
  const top = 3.0
  for (const s of [-1, 1]) b.box('plaster', [wallT, L.arcadeCeiling, 0.3], [s * (half - wallT / 2), L.arcadeCeiling / 2, -0.05], { tint: GREY, grime: 0.3 })
  // 捲門箱與拉到頂的鐵捲門（只露出最下面一截）
  b.box('steel', [half * 2 - 0.4, 0.3, 0.3], [0, top + 0.15, 0.08], { tint: '#9aa1a3' })
  b.box('shutter', [half * 2 - 0.4, 0.12, 0.03], [0, top - 0.06, 0.2], { tint: '#c9cdcd' })
  b.box('plaster', [half * 2 - 0.4, L.arcadeCeiling - top - 0.3, 0.2], [0, (top + 0.3 + L.arcadeCeiling) / 2, -0.02], { tint: GREY })
}

/** 二樓以上的正面（騎樓上方）：灰色水泥牆、鐵窗、三樓紅磚與窗框、女兒牆與屋頂的水塔 */
function upperFacade(b) {
  const { half, arcade: front, groundH, floor3, top, parapet } = L
  const z = front
  // 二樓：灰色水泥牆
  b.box('plaster', [half * 2, floor3 - groundH, 0.2], [0, (groundH + floor3) / 2, z - 0.1], { tint: GREY, grime: 0.2 })
  // 二樓的鋁窗與外凸的鐵窗
  const wy0 = 5.0
  const wy1 = 6.45
  b.box('dark', [2.5, wy1 - wy0, 0.04], [0, (wy0 + wy1) / 2, z + 0.01], { tint: '#3d4a52' })
  for (const x of [-1.25, 0, 1.25]) b.box('plain', [0.05, wy1 - wy0, 0.06], [x, (wy0 + wy1) / 2, z + 0.03], { tint: '#c9ccc8' })
  for (const y of [wy0, wy1]) b.box('plain', [2.56, 0.05, 0.08], [0, y, z + 0.03], { tint: '#c9ccc8' })
  for (let i = 0; i <= 8; i++) b.box('plain', [0.018, wy1 - wy0 + 0.1, 0.018], [-1.3 + i * 0.325, (wy0 + wy1) / 2, z + 0.2], { tint: '#5d6266' })
  for (const y of [wy0 - 0.05, (wy0 + wy1) / 2, wy1 + 0.05]) b.box('plain', [2.66, 0.022, 0.022], [0, y, z + 0.2], { tint: '#5d6266' })
  b.box('plain', [2.66, 0.04, 0.22], [0, wy1 + 0.08, z + 0.11], { tint: '#5d6266' })
  // 樓層之間的小簷
  b.box('plaster', [half * 2 + 0.06, 0.12, 0.3], [0, floor3, z + 0.05], { tint: GREY_DARK, grime: 0.3 })
  // 三樓：紅磚牆與白色窗框
  b.box('brick', [half * 2, top - floor3, 0.2], [0, (floor3 + top) / 2, z - 0.1], { tint: BRICK, grime: 0.25 })
  const y0 = 7.9
  const y1 = 9.35
  b.box('dark', [1.9, y1 - y0, 0.04], [0, (y0 + y1) / 2, z + 0.01], { tint: '#34404a' })
  for (const x of [-0.95, 0, 0.95]) b.box('plain', [0.06, y1 - y0 + 0.06, 0.07], [x, (y0 + y1) / 2, z + 0.03], { tint: '#ece9df' })
  for (const y of [y0, y1]) b.box('plain', [1.96, 0.06, 0.07], [0, y, z + 0.03], { tint: '#ece9df' })
  b.box('plaster', [2.1, 0.08, 0.16], [0, y0 - 0.06, z + 0.07], { tint: GREY })
  // 女兒牆與壓頂
  b.box('plaster', [half * 2, parapet - top, 0.2], [0, (top + parapet) / 2, z - 0.1], { tint: GREY, grime: 0.35 })
  b.box('plaster', [half * 2 + 0.08, 0.08, 0.3], [0, parapet + 0.04, z - 0.1], { tint: GREY_DARK })
  // 屋頂的不鏽鋼水塔
  b.cylinder('steel', 0.55, 0.55, 1.2, 16, [-0.6, top + 0.9, -3.0], { tint: '#d0d4d4' })
  b.cylinder('steel', 0.57, 0.57, 0.06, 16, [-0.6, top + 1.52, -3.0], { tint: '#c2c7c8' })
  for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) b.box('steel', [0.05, 0.3, 0.05], [-0.6 + dx, top + 0.15, -3.0 + dz], { tint: '#8d9496' })
}

/** 側牆、後牆與屋頂；廣場那一側（-x）的側牆看得到排水管與冷氣室外機 */
function shell(b) {
  const { half, wallT, arcade: front, back, groundH, top, parapet } = L
  const depth = front - back
  for (const s of [-1, 1]) {
    // 一樓的側牆（店內）與二樓以上的側牆（含騎樓上方）
    b.box('plaster', [wallT, groundH, -back], [s * (half - wallT / 2), groundH / 2, back / 2], { tint: s < 0 ? '#bdb9af' : GREY, grime: 0.3 })
    b.box('plaster', [wallT, parapet - groundH, depth], [s * (half - wallT / 2), (groundH + parapet) / 2, (front + back) / 2], { tint: s < 0 ? '#b8b4aa' : GREY, grime: 0.25 })
  }
  b.box('plaster', [half * 2, parapet, wallT], [0, parapet / 2, back + wallT / 2], { tint: GREY_DARK, grime: 0.3 })
  b.box('plaster', [half * 2, 0.2, depth], [0, top - 0.1, (front + back) / 2], { tint: '#a7a39a' })
  // 二樓樓板（店內天花上方）
  b.box('plaster', [half * 2 - wallT * 2, L.groundH - L.ceiling, -back - wallT], [0, (L.ceiling + L.groundH) / 2, (back + wallT) / 2], { tint: '#d9d5cb' })
  // 廣場那一側：二、三樓的小窗
  for (const [y, z] of [[5.3, -3.2], [5.3, -7.2], [8.4, -3.2]]) {
    b.box('dark', [0.05, 0.9, 0.8], [-half - 0.01, y, z], { tint: '#3a464e' })
    b.box('plain', [0.07, 0.06, 0.88], [-half - 0.02, y - 0.47, z], { tint: '#cfd1cc' })
    b.box('plain', [0.07, 0.06, 0.88], [-half - 0.02, y + 0.47, z], { tint: '#cfd1cc' })
  }
}

/** 外露的管線：正面轉角的排水管、樓層之間的冷氣管與廣場側的冷氣室外機 */
function pipes(b) {
  const { half, arcade: front, parapet } = L
  const x = -half + 0.08
  // 排水管：從屋頂沿著正面的轉角到騎樓的柱頂，再沿著柱子到地面
  b.cylinder('plain', 0.045, 0.045, parapet - L.arcadeCeiling, 8, [x, (parapet + L.arcadeCeiling) / 2, front + 0.06], { tint: '#8f9590' })
  b.cylinder('plain', 0.045, 0.045, L.arcadeCeiling, 8, [-half - 0.06, L.arcadeCeiling / 2, front - 0.08], { tint: '#8f9590' })
  for (const y of [9.6, 7.5, 5.2, 3.9]) b.box('plain', [0.12, 0.03, 0.1], [x, y, front + 0.02], { tint: '#6f7470' })
  // 二樓窗下的冷氣管（灰色線槽）
  b.box('plain', [1.6, 0.06, 0.06], [-0.9, 4.88, front + 0.05], { tint: '#d4d2ca' })
  b.box('plain', [0.06, 1.5, 0.06], [-half + 0.25, 4.15, front + 0.05], { tint: '#d4d2ca' })
  // 廣場側牆上的冷氣室外機與支架
  b.box('plain', [0.32, 0.55, 0.8], [-half - 0.17, 4.6, -1.6], { tint: '#e6e4dc' })
  b.box('dark', [0.02, 0.4, 0.4], [-half - 0.34, 4.6, -1.6], { tint: '#4d5256' })
  b.box('plain', [0.36, 0.04, 0.85], [-half - 0.18, 4.3, -1.6], { tint: '#6f7470' })
  b.box('plain', [0.06, 0.06, 2.2], [-half - 0.05, 4.45, -0.6], { tint: '#d4d2ca' })
}

/* ── 招牌與雨棚 ─────────────────────────── */

/** 褪色的黃色主招牌：立體的鐵框，上半是紅色的店名，下半是深藍色的品名（依食記核對的品名） */
function mainSign(b) {
  const { arcade: front } = L
  const x0 = -L.half + 0.08
  const x1 = 1.42
  const y0 = 3.72
  const y1 = 4.84
  const cx = (x0 + x1) / 2
  const w = x1 - x0
  const h = y1 - y0
  const z = front + 0.16
  b.box('plain', [w, h, 0.14], [cx, (y0 + y1) / 2, front + 0.08], { tint: '#d8b955' })
  for (const y of [y0, y1]) b.box('plain', [w + 0.06, 0.05, 0.17], [cx, y, front + 0.085], { tint: YELLOW_FRAME })
  for (const x of [x0, x1]) b.box('plain', [0.05, h + 0.06, 0.17], [x, (y0 + y1) / 2, front + 0.085], { tint: YELLOW_FRAME })
  b.addSign({ text: '老潘魷魚羹', style: 'laopanName', width: w - 0.12, height: 0.66, position: [cx, y1 - 0.4, z] })
  b.addSign({ text: '魷魚羹・魚酥羹・甜不辣', style: 'laopanSub', width: w - 0.4, height: 0.32, position: [cx, y0 + 0.24, z] })
}

/** 右側紅底、裝飾框的直立招牌：垂直於立面，兩面都有店名；上下兩支鐵架固定在立面上 */
function verticalSign(b) {
  const { arcade: front } = L
  const x = L.half - 0.24
  const y0 = 3.95
  const y1 = 6.95
  const z0 = front + 0.12
  const z1 = front + 0.92
  const cz = (z0 + z1) / 2
  const h = y1 - y0
  b.box('plain', [0.14, h, z1 - z0], [x, (y0 + y1) / 2, cz], { tint: '#a9241b' })
  // 金黃色的外框（有厚度）與上下的弧形飾頂
  for (const y of [y0, y1]) b.box('plain', [0.18, 0.07, z1 - z0 + 0.06], [x, y, cz], { tint: '#d9b04a' })
  for (const z of [z0, z1]) b.box('plain', [0.18, h + 0.06, 0.06], [x, (y0 + y1) / 2, z], { tint: '#d9b04a' })
  const crest = new Shape()
  crest.moveTo(-(z1 - z0) / 2, 0)
  crest.quadraticCurveTo(0, 0.42, (z1 - z0) / 2, 0)
  crest.closePath()
  b.extrude('plain', crest, 0.12, { position: [x - 0.06, y1 + 0.03, cz], rotation: [0, Math.PI / 2, 0], tint: '#b8281f' })
  b.extrude('plain', crest, 0.12, { position: [x - 0.06, y0 - 0.03, cz], rotation: [Math.PI, Math.PI / 2, 0], tint: '#b8281f' })
  // 固定在立面上的鐵架
  for (const y of [y0 + 0.3, y1 - 0.3]) b.box('steel', [0.06, 0.06, 0.18], [x, y, front + 0.06], { tint: '#6c7275' })
  for (const s of [-1, 1]) {
    b.addSign({ text: '老潘魷魚羹', style: 'laopanVertical', vertical: true, width: z1 - z0 - 0.06, height: h - 0.1, position: [x + s * 0.074, (y0 + y1) / 2, cz], rotationY: s * Math.PI / 2 })
  }
}

/** 波浪形的下緣（一排半圓），寬 width、高 depth，原點在上緣的中央 */
function scallopShape(width, depth, count) {
  const shape = new Shape()
  const step = width / count
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  for (let i = count - 1; i >= 0; i--) {
    const x0 = -width / 2 + step * (i + 1)
    const x1 = -width / 2 + step * i
    shape.quadraticCurveTo((x0 + x1) / 2, -depth * 2, x1, 0)
  }
  shape.closePath()
  return shape
}

/** 紅色帆布雨棚：從騎樓梁往街上斜斜伸出，垂邊上寫著「冷氣開放」，下緣是波浪形 */
function awning(b) {
  const { arcade: front } = L
  const x0 = -L.half + 0.05
  const x1 = 1.5
  const cx = (x0 + x1) / 2
  const w = x1 - x0
  const yBack = 3.55
  const yFront = 2.92
  const out = 0.82
  const zFront = front + out
  const slope = Math.atan2(yBack - yFront, out)
  const length = Math.hypot(out, yBack - yFront)
  // 斜面的帆布（略為褪色）與三支鐵架
  b.box('cloth', [w, 0.02, length], [cx, (yBack + yFront) / 2, front + out / 2], { rotation: [slope, 0, 0], tint: RED })
  for (const x of [x0 + 0.06, cx, x1 - 0.06]) {
    b.cylinder('steel', 0.012, 0.012, length, 5, [x, (yBack + yFront) / 2 - 0.03, front + out / 2], { rotation: [Math.PI / 2 + slope, 0, 0], tint: '#5d6366' })
  }
  b.cylinder('steel', 0.014, 0.014, w, 6, [cx, yFront - 0.02, zFront], { rotation: [0, 0, Math.PI / 2], tint: '#5d6366' })
  // 垂邊：上面一段平的（寫字的地方），下面是一排波浪
  const valance = 0.3
  b.box('cloth', [w, valance, 0.016], [cx, yFront - valance / 2, zFront + 0.01], { tint: shade(RED, 0.96) })
  b.extrude('cloth', scallopShape(w, 0.06, Math.round(w / 0.22)), 0.016, { position: [cx, yFront - valance, zFront + 0.002], tint: shade(RED, 0.96) })
  b.addSign({ text: '冷氣開放', style: 'awningRed', width: 1.5, height: valance - 0.06, position: [cx + 0.15, yFront - valance / 2, zFront + 0.02] })
}

/* ── 騎樓下的不鏽鋼攤車 ─────────────────── */

/** 攤車：不鏽鋼車身、正面的紅色細條、玻璃展示罩（裡面是配料）、疊碗、兩口湯鍋與吊掛的長柄湯勺 */
function cart(b, detail) {
  const c = L.counter
  const cx = (c.minX + c.maxX) / 2
  const cz = (c.minZ + c.maxZ) / 2
  const w = c.maxX - c.minX
  const d = c.maxZ - c.minZ
  const top = c.height
  b.box('steel', [w, top - 0.14, d], [cx, 0.14 + (top - 0.14) / 2, cz], { tint: '#d3d7d8' })
  b.box('steel', [w + 0.04, 0.03, d + 0.04], [cx, top - 0.015, cz], { tint: '#dfe2e2' })
  b.box('plain', [w - 0.1, 0.06, 0.01], [cx, top - 0.16, c.maxZ + 0.004], { tint: '#b3261d' })
  // 車輪與腳
  for (const x of [c.minX + 0.12, c.maxX - 0.12]) {
    for (const z of [c.minZ + 0.12, c.maxZ - 0.12]) {
      b.box('steel', [0.04, 0.1, 0.04], [x, 0.09, z], { tint: '#8f9597' })
      b.cylinder('dark', 0.05, 0.05, 0.04, 10, [x, 0.05, z], { rotation: [Math.PI / 2, 0, 0], tint: '#2c2d2e' })
    }
  }
  // 玻璃展示罩（正面靠街的一半，左側）：不鏽鋼框、透明玻璃，裡面是三盤配料
  const gx0 = c.minX + 0.06
  const gx1 = c.minX + 0.86
  const gz0 = c.maxZ - 0.36
  const gz1 = c.maxZ - 0.04
  const gh = 0.34
  const gcx = (gx0 + gx1) / 2
  const gcz = (gz0 + gz1) / 2
  toppingTray(b, gcx - 0.24, top, gcz, { kind: 'squid', seed: 31, width: 0.22, depth: 0.24, tint: '#eceae4' })
  toppingTray(b, gcx, top, gcz, { kind: 'paste', seed: 32, width: 0.22, depth: 0.24, tint: '#eceae4' })
  toppingTray(b, gcx + 0.24, top, gcz, { kind: 'greens', seed: 33, width: 0.22, depth: 0.24, tint: '#eceae4' })
  for (const x of [gx0, gx1]) {
    for (const z of [gz0, gz1]) b.box('steel', [0.02, gh, 0.02], [x, top + gh / 2, z], { tint: '#c4c9ca' })
  }
  for (const y of [top + gh]) {
    b.box('steel', [gx1 - gx0 + 0.02, 0.02, 0.02], [gcx, y, gz0], { tint: '#c4c9ca' })
    b.box('steel', [gx1 - gx0 + 0.02, 0.02, 0.02], [gcx, y, gz1], { tint: '#c4c9ca' })
  }
  b.box('glassClear', [gx1 - gx0, 0.008, gz1 - gz0], [gcx, top + gh, gcz], { tint: '#e8f2f4' })
  b.box('glassClear', [gx1 - gx0, gh, 0.008], [gcx, top + gh / 2, gz1], { tint: '#e8f2f4' })
  for (const x of [gx0, gx1]) b.box('glassClear', [0.008, gh, gz1 - gz0], [x, top + gh / 2, gcz], { tint: '#e8f2f4' })
  // 兩口湯鍋（攤車後半，靠老闆的那一側），一口掀開一半的鍋蓋；鍋口只有少量蒸氣
  const potZ = c.minZ + 0.22
  bigPot(b, c.minX + 0.3, top - 0.1, potZ, { radius: 0.2, height: 0.32, soup: '#7a4a26', lid: 'ajar' })
  bigPot(b, c.minX + 0.78, top - 0.1, potZ, { radius: 0.18, height: 0.3, soup: '#916236' })
  b.addSteam(c.minX + 0.3, top + 0.24, potZ, 0.45)
  b.addSteam(c.minX + 0.78, top + 0.22, potZ, 0.4)
  // 吊掛長柄湯勺的橫桿
  const railY = top + 0.75
  for (const x of [c.minX + 0.05, c.maxX - 0.4]) b.box('steel', [0.025, railY - top, 0.025], [x, (top + railY) / 2, c.minZ + 0.02], { tint: '#b9bfc1' })
  b.box('steel', [c.maxX - 0.4 - c.minX, 0.02, 0.02], [(c.minX + 0.05 + c.maxX - 0.4) / 2, railY, c.minZ + 0.02], { tint: '#b9bfc1' })
  for (const [i, x] of [c.minX + 0.2, c.minX + 0.42, c.minX + 0.64].entries()) {
    ladle(detail, x, railY - 0.5 - i * 0.02, c.minZ + 0.05, { length: 0.46, rotationY: 0, tilt: 0.04, cup: 0.03 + i * 0.004 })
  }
  ladle(b, c.minX + 0.78 + 0.04, top + 0.12, potZ + 0.03, { length: 0.44, rotationY: Math.PI * 0.85, tilt: 0.85 })
  // 疊放的碗（攤車右端）與湯匙筒
  bowlStack(b, c.maxX - 0.2, top, c.maxZ - 0.2, { count: 7 })
  bowlStack(b, c.maxX - 0.2, top, c.minZ + 0.22, { count: 5 })
  bowlStack(b, c.maxX - 0.45, top, c.maxZ - 0.2, { count: 4, radius: 0.07 })
  b.cylinder('steel', 0.045, 0.04, 0.12, 10, [c.maxX - 0.46, top + 0.06, c.minZ + 0.2], { tint: '#c9cecf' })
}

/* ── 店內的外殼 ─────────────────────────── */

/** 店內的牆（下半部白色磁磚、上半部米白色）、天花與日光燈、後牆的布簾門 */
function interiorShell(b) {
  const { room, ceiling } = L
  const depth = room.maxZ - room.minZ
  const cz = (room.minZ + room.maxZ) / 2
  for (const s of [-1, 1]) {
    const x = s * (room.maxX - 0.01)
    b.box('whiteTile', [0.02, 1.2, depth], [x, 0.6 + FLOOR_Y, cz], { tint: '#f4f3ee' })
    b.box('plaster', [0.02, ceiling - 1.25, depth], [x, (1.25 + ceiling) / 2, cz], { tint: '#efe9dc' })
    b.box('plain', [0.03, 0.04, depth], [x, 1.25, cz], { tint: '#c9c2b0' })
  }
  // 天花與兩盞日光燈（中性偏暖）
  b.box('plaster', [room.maxX - room.minX, 0.04, depth], [0, ceiling + 0.02, cz], { tint: '#f1ede3' })
  for (const z of [-1.6, -4.4]) {
    b.box('plain', [0.14, 0.05, 1.25], [0, ceiling - 0.03, z], { tint: '#e6e3da' })
    b.box('bulb', [0.06, 0.04, 1.2], [0, ceiling - 0.07, z], { tint: '#fbfaf2' })
    b.addGlow(0, ceiling - 0.2, z, 0.9, '#fff3dc')
    b.addPool(0, z, 1.5, '#fff1d8', FLOOR_Y + 0.01)
  }
  // 後牆：通往後場（不開放）的門洞與布簾，門洞裡是看不清楚的暗處
  const back = room.minZ
  const door = { minX: 0.35, maxX: 1.15, top: 2.1 }
  b.box('plaster', [door.minX - room.minX, ceiling, 0.2], [(room.minX + door.minX) / 2, ceiling / 2, back - 0.1], { tint: '#ebe5d8' })
  b.box('plaster', [room.maxX - door.maxX, ceiling, 0.2], [(door.maxX + room.maxX) / 2, ceiling / 2, back - 0.1], { tint: '#ebe5d8' })
  b.box('plaster', [door.maxX - door.minX, ceiling - door.top, 0.2], [(door.minX + door.maxX) / 2, (door.top + ceiling) / 2, back - 0.1], { tint: '#ebe5d8' })
  b.box('whiteTile', [room.maxX - room.minX, 1.2, 0.02], [0, 0.6 + FLOOR_Y, back + 0.01], { tint: '#f4f3ee' })
  b.box('dark', [door.maxX - door.minX, door.top, 0.04], [(door.minX + door.maxX) / 2, door.top / 2, back - 0.6], { tint: '#3b3631' })
  const panels = 3
  const pw = (door.maxX - door.minX) / panels
  for (let i = 0; i < panels; i++) {
    b.box('cloth', [pw - 0.02, 1.0, 0.012], [door.minX + pw * (i + 0.5), door.top - 0.5, back - 0.03], { tint: i % 2 ? '#e6e8e4' : '#dfe3e0' })
  }
  b.cylinder('plain', 0.012, 0.012, door.maxX - door.minX + 0.1, 6, [(door.minX + door.maxX) / 2, door.top + 0.01, back - 0.03], { rotation: [0, 0, Math.PI / 2], tint: '#6d5a45' })
}

/** 店內牆上的品名板（只有品名，不寫價格）：字屬於街景的招牌層，板子在這裡 */
function menuBoard(b) {
  const x = L.room.maxX - 0.03
  b.box('plain', [0.03, 0.34, 2.3], [x, 2.38, -3.7], { tint: '#f4f1e8' })
  b.box('plain', [0.035, 0.38, 0.03], [x, 2.38, -2.55], { tint: '#9b2a20' })
  b.box('plain', [0.035, 0.38, 0.03], [x, 2.38, -4.85], { tint: '#9b2a20' })
  b.addSign({ text: '魷魚羹・魚酥羹・甜不辣・乾拌沙茶生魷魚', style: 'laopanMenu', width: 2.2, height: 0.26, position: [x - 0.02, 2.38, -3.7], rotationY: -Math.PI / 2 })
}

/* ── 遮擋方塊、碰撞與觀賞範圍 ───────────── */

/** 店內家具的遮擋方塊（只給鏡頭用，位置與 laoPanInterior.js 相同） */
export function laoPanFurnitureBlockers(b) {
  const { table } = L
  for (const t of L.tables) b.addBlocker(t.x - table.halfX, t.x + table.halfX, 0, table.height + 0.05, t.z - table.halfZ, t.z + table.halfZ)
  const f = L.fridge
  b.addBlocker(f.minX, f.maxX, 0, 1.9, f.minZ, f.maxZ)
  const sink = L.sink
  b.addBlocker(sink.minX, sink.maxX, 0, sink.height + 0.05, sink.minZ, sink.maxZ)
  b.addBlocker(L.room.minX, L.room.minX + 0.32, 1.4, 2.05, L.sink.minZ, L.sink.maxZ)
}

function registerBlockers(b) {
  const { half, wallT, arcade: front, back, groundH, arcadeCeiling: H, parapet, pier, ceiling, room } = L
  const ranges = {}
  // 二樓以上（含騎樓上方）、一樓的側牆與後牆、店內天花、騎樓的梁與柱
  b.addBlocker(-half - 0.02, half + 0.02, groundH, parapet + 0.1, back, front + 0.05)
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, groundH, back, 0.1)
  b.addBlocker(-half, half, 0, groundH, back, room.minZ)
  b.addBlocker(-half, half, ceiling, groundH, room.minZ, 0)
  b.addBlocker(-half, half, H, groundH, 0, front)
  b.addBlocker(-half, half, 3.0, H, -0.1, 0.25)
  for (const s of [-1, 1]) b.addBlocker(s * (half - pier / 2) - pier / 2, s * (half - pier / 2) + pier / 2, 0, H, front - pier, front)
  // 屋頂的水塔
  b.addBlocker(-1.2, 0.0, L.top, L.top + 1.6, -3.6, -2.4)
  // 雨棚（伸到街上）
  b.addBlocker(-half + 0.05, 1.5, 2.45, 3.6, front, front + 0.86)
  // 招牌：主招牌與直立招牌另外成為可以聚焦的目標（點它開啟「店家與位置」）
  let start = b.blockers.length
  b.addBlocker(-half + 0.05, 1.45, 3.7, 4.86, front, front + 0.18)
  b.addBlocker(half - 0.34, half - 0.14, 3.6, 7.4, front, front + 0.96)
  ranges.signs = { start, end: b.blockers.length }
  // 攤車（料理檯）與上面的展示罩、吊桿
  const c = L.counter
  start = b.blockers.length
  b.addBlocker(c.minX - 0.03, c.maxX + 0.03, 0, c.height + 0.36, c.minZ - 0.03, c.maxZ + 0.03)
  b.addBlocker(c.minX, c.maxX - 0.38, c.height, c.height + 0.78, c.minZ - 0.02, c.minZ + 0.08)
  ranges.counter = { start, end: b.blockers.length }
  // 四道展示餐點（第一張桌子的桌面上方）
  const t = laoPanTable(L.foodTable)
  start = b.blockers.length
  b.addBlocker(t.x - L.table.halfX, t.x + L.table.halfX, L.table.height, L.table.height + 0.14, t.z - L.table.halfZ, t.z + L.table.halfZ)
  ranges.foods = { start, end: b.blockers.length }
  return ranges
}

function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：騎樓（伸進迪化街的路面一段）、一樓店內；
 * 障礙物是騎樓的柱、攤車與後方的工作區（攤車、瀝水區）、三組桌椅（連同前後的塑膠凳）、貓、冰箱。
 */
export function laoPanCollision(config, transform) {
  const rect = (...args) => worldRect(transform, ...args)
  const { half, arcade: front, pier, room, table, stoolOffset } = L
  const walkable = [
    // 騎樓：攤車旁到右側的柱子，往街上伸出一段（與街道的可行走範圍重疊）
    rect(L.entrance.minX - 0.05, half - 0.05, -0.05, front + 0.35),
    // 店內
    rect(room.minX + 0.01, room.maxX - 0.01, room.minZ + 0.05, 0.05),
  ]
  const obstacles = [
    rect(half - pier, half, front - pier, front),
    rect(L.staff.minX, L.staff.maxX, L.staff.minZ, L.staff.maxZ),
    rect(L.fridge.minX, L.fridge.maxX, L.fridge.minZ, L.fridge.maxZ + 0.02),
  ]
  for (const t of L.tables) {
    obstacles.push(rect(t.x - table.halfX - 0.02, t.x + table.halfX + 0.02, t.z - stoolOffset - 0.19, t.z + stoolOffset + 0.19))
  }
  const { cat, spareStools: spare, plant } = L
  obstacles.push(rect(cat.x - 0.14, cat.x + 0.14, cat.z - 0.26, cat.z + 0.26))
  obstacles.push(rect(spare.x - 0.17, spare.x + 0.17, spare.z - 0.17, spare.z + 0.17))
  obstacles.push(rect(plant.x - 0.16, plant.x + 0.2, plant.z - 0.16, plant.z + 0.16))
  return { walkable, obstacles }
}

/** 老潘佔用的世界範圍（範圍內不產生遠景房屋與遠景的樹） */
export function laoPanFootprint(transform) {
  return worldRect(transform, -L.half, L.half, L.back - 0.5, L.arcade)
}

/* ── 主程式 ─────────────────────────────── */

export function buildLaoPanExterior(b, cfg = {}, detail = b) {
  arcade(b)
  shopfront(b)
  upperFacade(b)
  shell(b)
  pipes(b)
  mainSign(b)
  verticalSign(b)
  awning(b)
  cart(b, detail)
  interiorShell(b)
  menuBoard(b)
  const ranges = registerBlockers(b)

  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const zone = (minX, maxX, minZ, maxZ) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  const { half, arcade: front, room, ceiling, parapet } = L
  const storefront = LAO_PAN_HOTSPOTS.find((item) => item.id === 'storefront')
  const c = L.counter
  const food = laoPanTable(L.foodTable)
  const cat = L.cat
  const catWorld = toWorld(cat.x, cat.z)
  return {
    groundHeight: L.groundH,
    topHeight: parapet,
    anchors: { prompt: local(...storefront.prompt), marker: local(0, parapet + 2.6, -1.0) },
    // 觀賞模式聚焦老潘：從迪化街上看立面（招牌、雨棚、攤車與騎樓）
    focus: {
      center: toWorld(0, front),
      forward: dir(0, 1),
      width: half * 2 + 1.0,
      height: 7.4,
      viewHeight: 3.4,
      maxDistance: 9.5,
      maxPitch: 0.42,
      maxYawOffset: 0.55,
    },
    subStores: [
      {
        id: 'lao-pan-signs',
        storeId: 'lao-pan-squid-soup',
        detail: true,
        hotspot: 'storefront',
        range: ranges.signs,
        focus: { center: toWorld(0, front + 0.2), forward: dir(0, 1), width: 4.6, height: 3.6, viewHeight: 4.9, maxDistance: 7.5, maxPitch: 0.3, maxYawOffset: 0.55 },
      },
      {
        id: 'lao-pan-counter',
        storeId: 'lao-pan-squid-soup',
        detail: true,
        hotspot: 'counter',
        range: ranges.counter,
        focus: {
          center: toWorld((c.minX + c.maxX) / 2, c.maxZ),
          forward: dir(0, 1),
          width: 1.8,
          height: 1.4,
          viewHeight: c.height + 0.2,
          maxDistance: 2.4,
          maxPitch: 0.6,
          maxYawOffset: 0.6,
        },
      },
      {
        id: 'lao-pan-foods',
        storeId: 'lao-pan-squid-soup',
        detail: true,
        hotspot: 'foods',
        range: ranges.foods,
        focus: {
          center: toWorld(food.x - L.table.halfX, food.z),
          forward: dir(-1, 0),
          width: 1.0,
          height: 0.6,
          viewHeight: L.table.height + 0.12,
          maxDistance: 2.1,
          maxPitch: 0.85,
          maxYawOffset: 0.5,
        },
      },
    ],
    interiors: [
      {
        id: 'lao-pan-squid-soup',
        ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
        ceiling,
        // 入口：騎樓與騎樓前 0.9 公尺的街道；越靠近店門越接近室內鏡頭
        entry: zone(-half + 0.05, half - 0.05, room.maxZ, front + 0.9),
        entryHold: 0.5,
        entryRamp: 2.4,
        door: toWorld((L.entrance.minX + L.entrance.maxX) / 2, 0),
        // 狹長的小吃店：鏡頭更近、更低，注視點在胸口附近
        camera: { distance: 3.0, maxHeight: ceiling - 0.45, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        viewerStart: { distance: 2.6 },
        // 按需載入：走到老潘附近（永樂市場前廣場、迪化街街尾）才產生；出發點（約 20 m 外）還不產生
        loadRadius: 15,
        showRadius: 24,
      },
    ],
    // 觀賞模式：注視點可以進到騎樓與店內（不超過天花板與騎樓的梁）
    viewerRegions: [
      { ...zone(L.entrance.minX + 0.1, half - 0.5, 0.15, front - 0.1), maxY: 2.5, cameraMaxY: 3.1 },
      { ...zone(room.minX + 0.35, room.maxX - 0.35, room.minZ + 0.35, -0.1), maxY: 2.2, cameraMaxY: ceiling - 0.35 },
    ],
    // 騎樓與店內：人物可以貼著攤車、桌椅與牆走，第三人稱鏡頭在這裡停在障礙物前面
    followAreas: [zone(-half, half, room.minZ, front)],
    // 黑白貓（components/LaoPanCat.jsx）：位置與朝向（世界座標）
    cats: [
      {
        id: 'lao-pan-cat',
        zone: 'lao-pan-squid-soup',
        position: [catWorld.x, FLOOR_Y, catWorld.z],
        rotationY: b.worldRotationY(cat.rotationY),
        headTurn: cat.headTurn,
      },
    ],
  }
}

/** 店內地磚的高度（店內的家具放在這個高度上） */
export const LAO_PAN_FLOOR_Y = FLOOR_Y
