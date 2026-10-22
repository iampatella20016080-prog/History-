import { TorusGeometry } from 'three'
import { YONGLE_MTM, YONGLE_MTM_NPCS, yongleMtmNpcPlacement, yongleMtmTable } from '../../data/miTaiMuLayout.js'
import { chopsticks, daikon, dinerPlace, friedTofu, miTaiMuSoup, porkCheek, sauceDish } from './miTaiMuWares.js'
import { bigPot, bowlStack, condimentSet, ladle, soupSpoon } from './squidSoupWares.js'
import { YONGLE_FLOOR_Y } from './yongleMiTaiMuExterior.js'

/**
 * 永樂米苔目的一樓店內細部（按需載入：角色或鏡頭接近時才在背景產生）：
 * 中間與靠右牆兩排淺色木紋桌面、黑色桌腳的方桌，前後是黑色的圓凳；桌上的筷筒與調味料，有客人的位子擺著碗與小菜；
 * 左牆的調味料長櫃、送餐的小推車與藍色垃圾桶、後方木作櫃台上的湯鍋與疊碗、玻璃展示櫃、白色的冷藏櫃；
 * 走道邊第一張桌子擺著一碗湯米苔目與三碟小菜（嘴邊肉、油豆腐、菜頭）、醬碟與餐具。
 * 店內的外殼（地磚、牆、天花與嵌燈、菜單板、壁扇、後方藍色的端景）與外帶區在 yongleMiTaiMuExterior.js，人物在 NpcLayer.jsx。
 *
 * 依使用者提供的店內照片簡化（桌椅的數量、間距與後方的配置是示意，不是精確的平面）。
 * 細小的擺飾（調味料、筷筒、湯匙）放在 detail，流暢模式不顯示。
 */
const F = YONGLE_FLOOR_Y
const L = YONGLE_MTM
const DARK_BOWL = { tint: '#2a2624', rim: null }

/** 方桌：淺色木紋桌面與黑色的十字桌腳 */
function table(b, t) {
  const { half, height } = L.table
  b.box('woodLight', [half * 2, 0.035, half * 2], [t.x, F + height + 0.0175, t.z], { tint: '#d9b98a' })
  b.box('plain', [half * 2 - 0.1, 0.05, half * 2 - 0.1], [t.x, F + height - 0.025, t.z], { tint: '#2a2a2c' })
  b.cylinder('plain', 0.035, 0.035, height - 0.05, 8, [t.x, F + (height - 0.05) / 2, t.z], { tint: '#262628' })
  for (const r of [0, Math.PI / 2]) b.box('plain', [0.56, 0.03, 0.05], [t.x, F + 0.02, t.z], { rotation: [0, r + Math.PI / 4, 0], tint: '#262628' })
}

/** 黑色圓凳：淺色木紋的圓形凳面、黑色的四支腳與腳踏圈 */
function stool(b, x, z) {
  const h = 0.46
  b.cylinder('woodLight', 0.16, 0.16, 0.04, 12, [x, F + h - 0.02, z], { tint: '#d8c09a' })
  b.cylinder('plain', 0.155, 0.13, 0.03, 12, [x, F + h - 0.055, z], { tint: '#232325' })
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    b.cylinder('plain', 0.012, 0.012, h - 0.06, 4, [x + Math.cos(a) * 0.11, F + (h - 0.06) / 2, z + Math.sin(a) * 0.11], { rotation: [Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1], tint: '#232325' })
  }
  b.add('plain', new TorusGeometry(0.125, 0.008, 3, 10), { position: [x, F + 0.16, z], rotation: [Math.PI / 2, 0, 0], tint: '#232325' })
}

/** 桌椅：每張桌子前後各一張圓凳；有客人坐著的位子擺著碗與小菜，其他桌子只有筷筒與調味料 */
function seating(b, detail) {
  const seated = new Map()
  for (const npc of YONGLE_MTM_NPCS) if (npc.table) seated.set(npc.table, npc)
  const sides = ['cheek', 'tofu', 'daikon', 'tofu']
  L.tables.forEach((t, i) => {
    table(b, t)
    for (const s of [-1, 1]) stool(b, t.x, t.z + s * L.stoolOffset)
    const top = F + L.table.height + 0.035
    if (t.id === L.foodTable) return
    const npc = seated.get(t.id)
    if (npc) dinerPlace(b, t.x, top, t.z, { facing: npc.side, seed: 60 + i, bowl: DARK_BOWL, side: sides[i % sides.length], utensils: false })
    // 筷筒、醬油膏與辣椒醬（靠牆那一側；中間那排放在桌子的一角）
    condimentSet(detail, t.x + (t.id.startsWith('r') ? 0.18 : 0.2), top, t.z - (npc ? -npc.side * 0.2 : 0.05), { rotationY: -Math.PI / 2, menuCard: false })
  })
}

/** 走道邊第一張桌子：一碗湯米苔目、三碟小菜（嘴邊肉、油豆腐、菜頭）、醬碟、筷子與湯匙 */
function foodDisplay(b, detail) {
  const t = yongleMtmTable(L.foodTable)
  const top = F + L.table.height + 0.035
  // 客人從走道（-x）那一側看過去：湯碗在靠走道的一邊，小菜在後面
  miTaiMuSoup(b, t.x - 0.14, top, t.z + 0.04, { seed: 71, bowl: DARK_BOWL })
  porkCheek(b, t.x + 0.07, top, t.z - 0.16, { seed: 72, radius: 0.08 })
  friedTofu(b, t.x + 0.16, top, t.z + 0.06, { seed: 73, radius: 0.075 })
  daikon(b, t.x + 0.06, top, t.z + 0.22, { seed: 74, radius: 0.07 })
  sauceDish(b, t.x - 0.12, top, t.z - 0.18)
  chopsticks(b, t.x - 0.25, top, t.z - 0.05, { rotationY: 0.1 })
  soupSpoon(detail, t.x - 0.22, top + 0.004, t.z + 0.16, { rotationY: -0.4 })
  condimentSet(detail, t.x + 0.24, top, t.z - 0.3, { rotationY: -Math.PI / 2, menuCard: false })
}

/** 左牆：調味料長櫃（筷筒、醬料瓶、湯匙）、送餐的小推車（湯鍋）、藍色垃圾桶 */
function leftWall(b, detail) {
  const c = L.condiments
  const cx = (c.minX + c.maxX) / 2
  const cz = (c.minZ + c.maxZ) / 2
  b.box('woodLight', [c.maxX - c.minX, c.height - 0.04, c.maxZ - c.minZ], [cx, F + (c.height - 0.04) / 2, cz], { tint: '#9a6a42' })
  b.box('wood', [c.maxX - c.minX + 0.03, 0.04, c.maxZ - c.minZ + 0.03], [cx, F + c.height - 0.02, cz], { tint: '#6e4a30' })
  for (let i = 0; i < 3; i++) {
    const z = c.maxZ - 0.25 - i * 0.45
    detail.cylinder('plain', 0.04, 0.035, 0.14, 10, [cx, F + c.height + 0.07, z], { tint: '#e9e6de' })
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2
      detail.cylinder('wood', 0.004, 0.004, 0.22, 4, [cx + Math.cos(a) * 0.02, F + c.height + 0.16, z + Math.sin(a) * 0.02], { tint: '#c9a46e' })
    }
    for (const [dx, dz, color] of [[0.08, 0.1, '#c23a2c'], [-0.06, 0.12, '#3a2a22'], [0.06, -0.12, '#f2efe7']]) {
      b.cylinder('plain', 0.024, 0.026, 0.14, 8, [cx + dx * 0.5, F + c.height + 0.07, z + dz], { tint: color })
    }
  }
  // 送餐的小推車：木頭的平台、上面一口湯鍋
  const cart = L.cart
  b.box('wood', [0.4, 0.04, 0.4], [cart.x, F + 0.72, cart.z], { tint: '#8a6440' })
  b.box('wood', [0.4, 0.04, 0.4], [cart.x, F + 0.2, cart.z], { tint: '#8a6440' })
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box('plain', [0.03, 0.7, 0.03], [cart.x + dx * 0.17, F + 0.37, cart.z + dz * 0.17], { tint: '#2e2e30' })
  bigPot(b, cart.x, F + 0.74, cart.z, { radius: 0.15, height: 0.2, soup: '#d6b585', tint: '#bfc3c4', lid: 'on' })
  const bin = L.bin
  b.cylinder('plain', 0.17, 0.14, 0.42, 12, [bin.x, F + 0.21, bin.z], { tint: '#3a8fc7' })
  b.cylinder('plain', 0.175, 0.175, 0.02, 12, [bin.x, F + 0.42, bin.z], { tint: '#f3f3f0' })
}

/** 後方的端景：木作櫃台與備餐區（湯鍋、疊碗）、玻璃展示櫃、白色的冷藏櫃；櫃台後方不開放 */
function backArea(b, detail) {
  const k = L.backCounter
  const cx = (k.minX + k.maxX) / 2
  const cz = (k.minZ + k.maxZ) / 2
  b.box('woodLight', [k.maxX - k.minX, k.height - 0.04, k.maxZ - k.minZ], [cx, F + (k.height - 0.04) / 2, cz], { tint: '#8f6440' })
  b.box('wood', [k.maxX - k.minX + 0.04, 0.04, k.maxZ - k.minZ + 0.06], [cx, F + k.height - 0.02, cz], { tint: '#5e4230' })
  // 櫃台正面一片一片的木門板
  for (let i = 0; i < 5; i++) b.box('wood', [0.48, k.height - 0.24, 0.014], [k.minX + 0.32 + i * 0.58, F + (k.height - 0.04) / 2, k.maxZ + 0.007], { tint: '#7a5434' })
  bigPot(b, k.minX + 0.5, F + k.height, cz, { radius: 0.22, height: 0.3, soup: '#d6b585', tint: '#c3c7c8' })
  ladle(b, k.minX + 0.56, F + k.height + 0.24, cz + 0.02, { length: 0.45, rotationY: 2.6, tilt: 0.95 })
  b.addSteam(k.minX + 0.5, F + k.height + 0.32, cz, 0.4)
  bowlStack(b, k.minX + 1.15, F + k.height, cz + 0.1, { count: 7, radius: 0.07, tint: '#2a2624' })
  bowlStack(b, k.minX + 1.4, F + k.height, cz - 0.1, { count: 5, radius: 0.065, tint: '#f2efe8' })
  // 右邊的玻璃展示櫃（裡面幾個小擺飾的色塊）
  b.box('plain', [0.75, 1.5, 0.5], [k.maxX - 0.42, F + k.height + 0.75, cz - 0.15], { tint: '#6b4a30' })
  b.box('glassClear', [0.7, 1.4, 0.02], [k.maxX - 0.42, F + k.height + 0.75, cz + 0.11], { tint: '#ffffff' })
  for (let i = 0; i < 6; i++) detail.box('plain', [0.12, 0.12, 0.12], [k.maxX - 0.62 + (i % 3) * 0.2, F + k.height + 0.35 + Math.floor(i / 3) * 0.5, cz - 0.15], { tint: ['#d9c28a', '#c98a5a', '#e8e2d2'][i % 3] })
  // 白色的冷藏櫃（照片左後方的白色高櫃）
  const f = L.fridge
  b.box('plain', [f.maxX - f.minX, 1.9, f.maxZ - f.minZ], [(f.minX + f.maxX) / 2, F + 0.95, (f.minZ + f.maxZ) / 2], { tint: '#f1f1ee' })
  for (let i = 0; i < 8; i++) b.box('plain', [f.maxX - f.minX - 0.12, 0.015, 0.005], [(f.minX + f.maxX) / 2, F + 0.5 + i * 0.12, f.maxZ + 0.003], { tint: '#cfcfca' })
  // 牆上的盆栽與紅色的中國結（照片後方的端景）
  b.cylinder('plain', 0.1, 0.08, 0.16, 10, [k.minX + 0.2, F + k.height + 0.08, cz - 0.25], { tint: '#3a3d40' })
  for (let i = 0; i < 5; i++) b.box('plain', [0.02, 0.3, 0.08], [k.minX + 0.2 + (i - 2) * 0.03, F + k.height + 0.3, cz - 0.25], { rotation: [0, i, (i - 2) * 0.25], tint: '#4f8a3a' })
  b.box('plain', [0.06, 0.4, 0.02], [k.minX + 0.05, 2.1, L.room.minZ + 0.06], { tint: '#c4262a' })
}

export function buildYongleMiTaiMuInterior(b, config = {}, detail = b) {
  seating(b, detail)
  foodDisplay(b, detail)
  leftWall(b, detail)
  backArea(b, detail)
  // 店裡沒有其他需要回傳的資料（人物由外觀的產生器登記，跟著室內一起顯示）
  return {}
}

/** 人物坐的位子（測試用）：每位坐著的客人都在某張桌子前後的凳子上 */
export function yongleMtmSeatedNpcs() {
  return YONGLE_MTM_NPCS.filter((npc) => npc.table).map((npc) => ({ npc, ...yongleMtmNpcPlacement(npc) }))
}
