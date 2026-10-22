import { IcosahedronGeometry, TorusGeometry } from 'three'
import { LAO_PAN } from '../../data/squidSoupLayout.js'
import { LAO_PAN_FLOOR_Y } from './laoPanExterior.js'
import { buildLaoPanFoodDisplay } from './laoPanFoodDisplay.js'
import { bowlStack, condimentSet, plate } from './squidSoupWares.js'

/**
 * 老潘魷魚羹的一樓店內細部（按需載入：角色或鏡頭接近時才在背景產生）：
 * 三組靠牆的長方桌與紅色、深綠色的塑膠凳（中央留出走道）、桌上的調味料與菜單卡、
 * 攤車後方的瀝水區與碗盤架、後牆旁的飲料冰箱、天花的吊扇，以及四道展示餐點（laoPanFoodDisplay.js）。
 * 店內的外殼（地磚、牆、天花、布簾門）、攤車與招牌在 laoPanExterior.js，黑白貓在 components/LaoPanCat.jsx。
 *
 * 未拍攝的部分（店內深處的尺寸與配置）是簡化的示意；需求說明提到的「內湖店」室內照片沒有用來重建這裡的平面。
 * 細小的擺飾（調味料、菜單卡、碗盤架上的碗、吊扇）放在 detail，流暢模式不顯示。
 */
const F = LAO_PAN_FLOOR_Y
const STOOL_COLORS = ['#c8362c', '#2f5b45', '#c8362c', '#2f5b45', '#2f5b45', '#c8362c']

/** 長方桌：淺色美耐板桌面與鐵管桌腳 */
function table(b, t) {
  const { halfX, halfZ, height } = LAO_PAN.table
  b.box('plain', [halfX * 2, 0.03, halfZ * 2], [t.x, F + height + 0.015, t.z], { tint: '#e2d3b0' })
  b.box('plain', [halfX * 2 + 0.01, 0.02, halfZ * 2 + 0.01], [t.x, F + height - 0.005, t.z], { tint: '#8f7a5a' })
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) b.cylinder('steel', 0.016, 0.016, height - 0.02, 6, [t.x + sx * (halfX - 0.05), F + (height - 0.02) / 2, t.z + sz * (halfZ - 0.06)], { tint: '#9aa0a2' })
  }
  b.box('steel', [halfX * 2 - 0.1, 0.02, 0.02], [t.x, F + 0.12, t.z], { tint: '#9aa0a2' })
}

/** 塑膠凳：圓形凳面、一圈裙邊與四支外八的腳 */
function plasticStool(b, x, z, tint) {
  const h = 0.45
  b.cylinder('plain', 0.15, 0.15, 0.03, 14, [x, F + h - 0.015, z], { tint })
  b.cylinder('plain', 0.15, 0.135, 0.06, 14, [x, F + h - 0.06, z], { tint, openEnded: true })
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    b.box('plain', [0.05, h - 0.06, 0.03], [x + Math.cos(a) * 0.12, F + (h - 0.06) / 2, z + Math.sin(a) * 0.12], {
      rotation: [Math.sin(a) * 0.12, -a, -Math.cos(a) * 0.12],
      tint,
    })
  }
  b.add('plain', new TorusGeometry(0.15, 0.012, 4, 14), { position: [x, F + 0.12, z], rotation: [Math.PI / 2, 0, 0], tint })
}

/** 三組座位：桌子與前後的塑膠凳；桌上的調味料、筷筒與菜單卡（第一張桌子另外擺四道展示餐點） */
function seating(b, detail) {
  for (const [i, t] of LAO_PAN.tables.entries()) {
    table(b, t)
    for (const [k, s] of [-1, 1].entries()) plasticStool(b, t.x, t.z + s * LAO_PAN.stoolOffset, STOOL_COLORS[(i * 2 + k) % STOOL_COLORS.length])
    if (t.id !== LAO_PAN.foodTable) {
      const wallSide = Math.sign(t.x)
      condimentSet(detail, t.x + wallSide * 0.2, F + LAO_PAN.table.height + 0.03, t.z - 0.05, { rotationY: wallSide > 0 ? -Math.PI / 2 : Math.PI / 2 })
    }
    // 牆上貼的菜單（白紙與紅色的格線，沒有品名與價格）
    const wx = Math.sign(t.x) * (LAO_PAN.room.maxX - 0.02)
    detail.box('plain', [0.01, 0.42, 0.3], [wx, 1.55, t.z], { tint: '#f7f4ec' })
    for (let k = 0; k < 6; k++) detail.box('plain', [0.012, 0.012, 0.22], [wx, 1.7 - k * 0.055, t.z], { tint: '#b9483a' })
  }
  // 靠牆疊著的備用塑膠凳
  const spare = LAO_PAN.spareStools
  for (let k = 0; k < 4; k++) {
    b.cylinder('plain', 0.15, 0.135, 0.06, 14, [spare.x, F + 0.03 + k * 0.07, spare.z], { tint: STOOL_COLORS[k % 2], openEnded: k < 3 })
  }
  b.cylinder('plain', 0.15, 0.15, 0.03, 14, [spare.x, F + 0.3, spare.z], { tint: STOOL_COLORS[1] })
}

/** 攤車後方的瀝水區（不鏽鋼水槽與瀝水架）與牆上的碗盤架 */
function washArea(b, detail) {
  const s = LAO_PAN.sink
  const cx = (s.minX + s.maxX) / 2
  const cz = (s.minZ + s.maxZ) / 2
  const w = s.maxX - s.minX
  const d = s.maxZ - s.minZ
  b.box('steel', [w, s.height, d], [cx, F + s.height / 2, cz], { tint: '#cfd3d4' })
  b.box('dark', [w - 0.14, 0.02, d * 0.45], [cx, F + s.height + 0.002, s.minZ + d * 0.3], { tint: '#5b6366' })
  b.cylinder('steel', 0.012, 0.012, 0.3, 6, [s.minX + 0.08, F + s.height + 0.15, s.minZ + 0.1], { tint: '#b7bdbf' })
  b.box('steel', [0.02, 0.02, 0.2], [s.minX + 0.08, F + s.height + 0.3, s.minZ + 0.2], { tint: '#b7bdbf' })
  // 瀝水架：鐵線架與倒扣的碗
  const rz = s.maxZ - 0.35
  for (let i = 0; i < 6; i++) b.box('steel', [w - 0.1, 0.008, 0.008], [cx, F + s.height + 0.05, rz - 0.25 + i * 0.1], { tint: '#9aa0a2' })
  for (const sx of [-1, 1]) b.box('steel', [0.01, 0.06, 0.55], [cx + sx * (w / 2 - 0.06), F + s.height + 0.03, rz], { tint: '#9aa0a2' })
  for (let i = 0; i < 4; i++) {
    b.cylinder('plain', 0.045, 0.075, 0.06, 12, [cx + (i % 2 ? 0.1 : -0.1), F + s.height + 0.09, rz - 0.18 + Math.floor(i / 2) * 0.2], { rotation: [0.45, 0, 0], tint: '#f4f1e8' })
  }
  // 牆上的碗盤架：兩層不鏽鋼層板，疊著碗與盤子
  const x0 = LAO_PAN.room.minX
  for (const y of [1.45, 1.85]) {
    b.box('steel', [0.3, 0.02, d], [x0 + 0.15, y, cz], { tint: '#c9ced0' })
    b.box('steel', [0.02, 0.06, d], [x0 + 0.3, y + 0.03, cz], { tint: '#c9ced0' })
  }
  for (let i = 0; i < 4; i++) bowlStack(detail, x0 + 0.15, 1.46, s.minZ + 0.2 + i * 0.3, { count: 4 + (i % 2), radius: 0.07 })
  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 5; k++) plate(detail, x0 + 0.15, 1.86 + k * 0.014, s.minZ + 0.3 + i * 0.4, { radius: 0.1, segments: 14 })
  }
  // 大水桶
  b.cylinder('plain', 0.2, 0.17, 0.42, 12, [s.maxX + 0.18, F + 0.21, s.minZ + 0.2], { tint: '#3e6f8f' })
}

/** 後牆旁的飲料冰箱（玻璃門朝走道）與天花的吊扇 */
function backItems(b, detail) {
  const f = LAO_PAN.fridge
  const cx = (f.minX + f.maxX) / 2
  const cz = (f.minZ + f.maxZ) / 2
  const h = 1.9
  b.box('plain', [f.maxX - f.minX, h, f.maxZ - f.minZ], [cx, F + h / 2, cz], { tint: '#e9ebe9' })
  b.box('plain', [0.02, h - 0.3, f.maxZ - f.minZ - 0.08], [f.maxX + 0.005, F + (h - 0.3) / 2 + 0.08, cz], { tint: '#3b4448' })
  b.box('bulb', [0.02, 0.14, f.maxZ - f.minZ - 0.08], [f.maxX + 0.006, F + h - 0.12, cz], { tint: '#e8f0f2' })
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 4; k++) {
      detail.cylinder('plain', 0.03, 0.03, 0.2, 8, [f.maxX - 0.08, F + 0.32 + row * 0.38, f.minZ + 0.1 + k * 0.15], {
        tint: ['#d9573f', '#e7c34b', '#4f8a5a', '#f0efe8'][(row + k) % 4],
      })
    }
  }
  // 吊扇（靜止）
  const fy = LAO_PAN.ceiling - 0.32
  detail.cylinder('steel', 0.012, 0.012, 0.28, 6, [0, LAO_PAN.ceiling - 0.14, -3.0], { tint: '#d2d0c8' })
  detail.cylinder('plain', 0.09, 0.09, 0.09, 12, [0, fy, -3.0], { tint: '#e4e1d8' })
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    detail.box('plain', [0.5, 0.012, 0.11], [Math.cos(a) * 0.32, fy - 0.02, -3.0 + Math.sin(a) * 0.32], { rotation: [0, -a, 0.06], tint: '#ece9e0' })
  }
  // 牆角的盆栽（小小的綠色植物）
  const { plant } = LAO_PAN
  b.cylinder('plain', 0.12, 0.1, 0.22, 10, [plant.x, F + 0.11, plant.z], { tint: '#9a5b3c' })
  b.add('plain', new IcosahedronGeometry(0.2, 0), { position: [plant.x, F + 0.36, plant.z], scale: [1, 1.2, 1], tint: '#5f8f4a' })
}

export function buildLaoPanInterior(b, cfg = {}, detail = b) {
  seating(b, detail)
  washArea(b, detail)
  backItems(b, detail)
  buildLaoPanFoodDisplay(b, detail, F)
}
