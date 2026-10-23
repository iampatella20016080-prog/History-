import { TorusGeometry } from 'three'
import { YONGLE_MTM_HOTSPOTS, YONGLE_MTM, YONGLE_MTM_NPCS, yongleMtmNpcPlacement, yongleMtmTable } from '../../data/miTaiMuLayout.js'
import { shade } from './props.js'
import { bigPot, bowlStack, ladle } from './squidSoupWares.js'

/**
 * 永樂米苔目（只在 2000–現在「老屋新生」）：立面、招牌、騎樓與一樓店內的外殼。
 *
 * 依使用者提供的實地照片建模（尺寸為估算）：
 * - 狹長、垂直感明顯的街屋：二樓以上是白色小方磚外牆，二樓木框窗與兩盞圓燈，三、四樓是貼磁磚的陽台矮牆與退縮的窗，
 *   頂樓是綠色玻璃的加蓋
 * - 紅色橫式主招牌：表面一條一條直向的凸條，金色立體字「永樂米苔目」，右側直寫的小字「50年老店」
 * - 左右兩側的紅色直立側招牌
 * - 一樓入口內縮成騎樓：右邊是開放的入口，左邊是外帶區的木作櫃檯與不鏽鋼排煙罩、兩台箱型排風扇，
 *   排煙管沿著騎樓天花接到右邊柱子旁的鼓風機；騎樓吊著兩盞藤編吊燈，左半邊停著兩台機車、放著兩個有輪子的鋁櫃
 * - 右邊的柱子貼著木板；右側是一棟窄小的鄰屋（藍色鐵捲門）
 * 照片裡的路人、隔壁店家的招牌與廣告都沒有放進場景；招牌上的「50年老店」只是招牌上的文字，不是本站查證的開業年份。
 *
 * 一樓店內的外殼（淺色亮面地磚、牆、白色天花與嵌燈、壁扇、右牆的大菜單板、後方藍色的端景）也在這裡，從街上就看得到；
 * 桌椅、備餐區的器具與食品在 yongleMiTaiMuInterior.js 按需載入，店裡的人物在 components/NpcLayer.jsx。
 *
 * 本地座標見 data/miTaiMuLayout.js：原點在一樓店面線的中央，+z 朝迪化街，室內在 -z，+x 是從街上看的右側（入口那一側）。
 */
const L = YONGLE_MTM
const TILE_WHITE = '#f3f2ee'
const TILE_GREY = '#dcdcd8'
const RED = '#c22d27'
const RED_DARK = '#9e221d'
const WOOD_FRAME = '#8a6340'
const PLANK = '#b88f62'
const FLOOR_Y = 0.05

/* ── 騎樓與店面線 ─────────────────────────── */

function arcade(b) {
  const { half, arcade: front, pier, arcadeCeiling: H } = L
  // 騎樓地坪：磨石子與兩道綠色的分隔線；店內是淺色亮面的大塊地磚
  b.box('stone', [half * 2, 0.06, front], [0, 0.03, front / 2], { tint: '#d8d3c8' })
  for (const z of [0.35, front - 0.45]) b.box('plain', [half * 2 - 0.1, 0.004, 0.07], [0, 0.062, z], { tint: '#5f8f6a' })
  b.box('glossTile', [L.room.maxX - L.room.minX, FLOOR_Y, L.room.maxZ - L.room.minZ], [0, FLOOR_Y / 2, (L.room.minZ + L.room.maxZ) / 2], { tint: '#ffffff' })
  // 左邊的柱子貼白色小磁磚；右邊的柱子貼木板（照片裡右側的木板牆）
  b.box('mosaicTile', [pier, H, pier], [-half + pier / 2, H / 2, front - pier / 2], { tint: '#ffffff' })
  b.box('woodLight', [pier, H, pier], [half - pier / 2, H / 2, front - pier / 2], { tint: PLANK })
  for (let y = 0.3; y < H; y += 0.3) b.box('plain', [pier + 0.01, 0.012, pier + 0.01], [half - pier / 2, y, front - pier / 2], { tint: shade(PLANK, 0.7) })
  // 柱列上方的梁（主招牌掛在這裡）與騎樓天花（白色，靠外緣貼一圈小磁磚）
  b.box('mosaicTile', [half * 2, L.groundH - H, 0.4], [0, (H + L.groundH) / 2, front - 0.2], { tint: '#ffffff' })
  b.box('plaster', [half * 2 - 0.1, 0.06, front - 0.4], [0, H - 0.03, (front - 0.4) / 2], { tint: '#efede6' })
  // 兩盞藤編吊燈（籃子形、下緣垂著細穗）
  for (const x of [-0.45, 0.45]) {
    b.cylinder('plain', 0.004, 0.004, 0.55, 4, [x, H - 0.3, 0.95], { tint: '#2b2622' })
    b.cylinder('bamboo', 0.05, 0.24, 0.16, 14, [x, H - 0.64, 0.95], { tint: '#b98c52' })
    b.add('bamboo', new TorusGeometry(0.24, 0.012, 4, 18), { position: [x, H - 0.72, 0.95], rotation: [Math.PI / 2, 0, 0], tint: '#9c7440' })
    b.cylinder('bulb', 0.05, 0.05, 0.05, 8, [x, H - 0.72, 0.95], { tint: '#fff0c8' })
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      b.cylinder('plain', 0.002, 0.002, 0.14, 3, [x + Math.cos(a) * 0.22, H - 0.8, 0.95 + Math.sin(a) * 0.22], { tint: '#d9c9a6' })
    }
    b.addGlow(x, H - 0.8, 0.95, 0.6, '#ffe3b0')
  }
}

/** 店面線：兩側的牆垛、拉到頂的鐵捲門與捲門箱；外帶區上方的不鏽鋼排煙罩與兩台箱型排風扇 */
function shopfront(b) {
  const { half, wallT, arcadeCeiling: H } = L
  const top = 3.0
  for (const s of [-1, 1]) b.box('mosaicTile', [wallT, H, 0.3], [s * (half - wallT / 2), H / 2, -0.05], { tint: '#ffffff' })
  b.box('steel', [half * 2 - 0.4, 0.28, 0.3], [0, top + 0.14, 0.06], { tint: '#a7acad' })
  b.box('shutter', [half * 2 - 0.4, 0.1, 0.03], [0, top - 0.05, 0.2], { tint: '#cfd2d2' })
  // 捲門箱上方到騎樓天花之間的牆（捲門箱已經頂到天花時不產生：負的高度會變成翻面的方塊）
  if (H - top - 0.28 > 0.01) b.box('plaster', [half * 2 - 0.4, H - top - 0.28, 0.2], [0, (top + 0.28 + H) / 2, -0.02], { tint: '#e9e7e0' })
  // 排煙罩：外帶區上方的大不鏽鋼罩，下緣有一圈折邊
  const { takeaway: t } = L
  const hx = (t.minX + t.maxX) / 2
  const hw = t.maxX - t.minX
  b.box('steel', [hw + 0.1, 0.5, 0.95], [hx, 2.55, -0.4], { tint: '#c7cbcc' })
  b.box('steel', [hw + 0.14, 0.06, 0.99], [hx, 2.29, -0.4], { tint: '#b2b7b8' })
  b.box('steel', [0.5, 0.55, 0.5], [hx + 0.2, 2.98, -0.5], { tint: '#bfc4c5' })
  // 兩台箱型排風扇（白色外框、圓形的扇葉護網），裝在排煙罩前緣下方
  for (const x of [-1.62, -0.92]) {
    b.box('plain', [0.5, 0.5, 0.2], [x, 1.98, 0.12], { tint: '#ece9e1' })
    b.cylinder('dark', 0.2, 0.2, 0.02, 16, [x, 1.98, 0.225], { rotation: [Math.PI / 2, 0, 0], tint: '#5d5a54' })
    for (const r of [0.07, 0.14, 0.2]) b.add('plain', new TorusGeometry(r, 0.004, 3, 16), { position: [x, 1.98, 0.235], tint: '#c8c4bb' })
    b.cylinder('plain', 0.035, 0.035, 0.03, 8, [x, 1.98, 0.24], { rotation: [Math.PI / 2, 0, 0], tint: '#8d8a83' })
  }
}

/** 排煙管：從排煙罩頂端出來，沿著騎樓天花接到右邊柱子旁，再往下接到地上的鼓風機（一節一節的伸縮軟管） */
function exhaustDuct(b) {
  const H = L.arcadeCeiling
  const r = 0.11
  const segment = (x0, y0, z0, x1, y1, z1) => {
    const dx = x1 - x0
    const dy = y1 - y0
    const dz = z1 - z0
    const len = Math.hypot(dx, dy, dz)
    const n = Math.max(2, Math.round(len / 0.09))
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n
      const p = [x0 + dx * t, y0 + dy * t, z0 + dz * t]
      // 軟管：每一節是一圈鋁箔環
      const rotation = Math.abs(dy) > Math.abs(dx) + Math.abs(dz) ? [0, 0, 0] : Math.abs(dx) > Math.abs(dz) ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]
      b.cylinder('steel', r, r, len / n - 0.012, 12, p, { rotation, tint: i % 2 ? '#c9cbc8' : '#b6b9b6' })
    }
  }
  const hood = { x: -1.02, z: -0.5 }
  segment(hood.x, 3.0, hood.z, hood.x, H - 0.2, hood.z + 0.02)
  segment(hood.x, H - 0.2, hood.z, hood.x, H - 0.2, 0.55)
  segment(hood.x, H - 0.2, 0.55, 1.7, H - 0.2, 0.55)
  segment(1.7, H - 0.2, 0.55, 1.7, 0.55, 0.8)
  segment(1.7, 0.55, 0.8, 1.68, 0.46, 1.22)
  // 鼓風機（灰色的馬達與底座）
  const f = L.blower
  b.box('plain', [f.maxX - f.minX, 0.3, f.maxZ - f.minZ], [(f.minX + f.maxX) / 2, 0.21, (f.minZ + f.maxZ) / 2], { tint: '#4d4f50' })
  b.cylinder('plain', 0.12, 0.12, 0.1, 12, [(f.minX + f.maxX) / 2, 0.36, (f.minZ + f.maxZ) / 2], { tint: '#3d3f40' })
  b.box('plain', [0.03, 0.4, 0.03], [f.minX + 0.04, 0.2, f.maxZ - 0.04], { tint: '#2b2c2d' })
  // 吊著軟管的鐵鍊
  b.cylinder('plain', 0.006, 0.006, 0.2, 4, [1.7, H - 0.1, 0.55], { tint: '#c9a43a' })
}

/** 外帶區：店面線內側左邊的木作櫃檯、紅色的「外帶區」牌子、湯鍋與碗盤；櫃檯前的騎樓放著兩個有輪子的鋁櫃 */
function takeaway(b, detail) {
  const t = L.takeaway
  const cx = (t.minX + t.maxX) / 2
  const w = t.maxX - t.minX
  const d = t.maxZ - t.minZ
  const cz = (t.minZ + t.maxZ) / 2
  // 櫃檯：淺色木板的正面、深色的檯面
  b.box('woodLight', [w, t.height - 0.04, d], [cx, (t.height - 0.04) / 2 + FLOOR_Y, cz], { tint: '#c99f6c' })
  for (let i = 1; i < 6; i++) b.box('plain', [w, 0.01, 0.005], [cx, FLOOR_Y + i * 0.15, t.maxZ + 0.002], { tint: '#9f7a4e' })
  b.box('wood', [w + 0.04, 0.04, d + 0.06], [cx, t.height + FLOOR_Y - 0.02, cz + 0.02], { tint: '#7a5534' })
  // 櫃檯上：一口湯鍋、疊碗、桌上型電風扇與筷筒
  bigPot(b, cx - 0.4, t.height + FLOOR_Y, cz - 0.05, { radius: 0.2, height: 0.26, soup: '#d6b585', tint: '#c9cdcd' })
  ladle(b, cx - 0.36, t.height + FLOOR_Y + 0.2, cz - 0.02, { length: 0.42, rotationY: 2.3, tilt: 0.9 })
  b.addSteam(cx - 0.4, t.height + FLOOR_Y + 0.28, cz - 0.05, 0.45)
  bowlStack(b, cx + 0.2, t.height + FLOOR_Y, cz - 0.1, { count: 6, radius: 0.07, tint: '#2c2826' })
  bowlStack(b, cx + 0.45, t.height + FLOOR_Y, cz - 0.15, { count: 4, radius: 0.07, tint: '#f2efe8' })
  b.cylinder('plain', 0.02, 0.03, 0.25, 8, [cx + 0.05, t.height + FLOOR_Y + 0.12, cz + 0.12], { tint: '#3a3d40' })
  b.cylinder('dark', 0.16, 0.16, 0.03, 14, [cx + 0.05, t.height + FLOOR_Y + 0.38, cz + 0.12], { rotation: [Math.PI / 2 - 0.15, 0, 0], tint: '#2f3236' })
  detail.cylinder('bamboo', 0.035, 0.032, 0.12, 8, [cx + 0.7, t.height + FLOOR_Y + 0.06, cz + 0.08], { tint: '#c7a874' })
  // 紅色的「外帶區」牌子（直立在櫃檯右端）
  b.box('plain', [0.5, 0.62, 0.03], [t.maxX - 0.3, t.height + FLOOR_Y + 0.42, t.maxZ - 0.02], { tint: '#c22a25' })
  b.addSign({ text: '外帶區', style: 'takeawayRed', width: 0.44, height: 0.2, position: [t.maxX - 0.3, t.height + FLOOR_Y + 0.6, t.maxZ + 0.0] })
  for (let i = 0; i < 3; i++) b.box('plain', [0.36, 0.016, 0.004], [t.maxX - 0.3, t.height + FLOOR_Y + 0.38 - i * 0.07, t.maxZ + 0.0], { tint: '#f3e9d8' })
  // 騎樓上兩個有輪子的鋁櫃（木紋面板）
  const c = L.cabinets
  const cw = (c.maxX - c.minX - 0.05) / 2
  for (let i = 0; i < 2; i++) {
    const x = c.minX + cw / 2 + i * (cw + 0.05)
    const z = (c.minZ + c.maxZ) / 2
    b.box('steel', [cw, 0.72, c.maxZ - c.minZ], [x, 0.44, z], { tint: '#c4c8c8' })
    for (const y of [0.28, 0.62]) b.box(i ? 'perforated' : 'wood', [cw - 0.06, 0.3, 0.01], [x, y, c.maxZ + 0.004], { tint: i ? '#d9dbd9' : '#6e4a30' })
    for (const dx of [-1, 1]) b.cylinder('plain', 0.03, 0.03, 0.02, 8, [x + dx * (cw / 2 - 0.05), 0.05, z], { rotation: [0, 0, Math.PI / 2], tint: '#2b2b2d' })
  }
  // 鋁櫃上的一頂安全帽與一個水桶（生活感）
  b.add('plain', new TorusGeometry(0.11, 0.02, 4, 12), { position: [c.minX + 0.3, 0.83, 0.3], rotation: [Math.PI / 2, 0, 0], tint: '#1f2a3a' })
  b.cylinder('plain', 0.12, 0.12, 0.12, 12, [c.minX + 0.3, 0.88, 0.3], { tint: '#2b5aa8' })
  b.cylinder('plain', 0.15, 0.12, 0.3, 12, [-2.0, 0.21, 1.25], { tint: '#e57f28' })
}

/** 二樓以上的正面（騎樓上方）：白色小方磚、二樓木框窗與兩盞圓燈、三四樓的陽台矮牆與退縮的窗、頂樓的綠色玻璃加蓋 */
function upperFacade(b) {
  const { half, arcade: front, groundH, floors, roof, roofTop } = L
  const z = front
  const [f2, f3, f4] = floors
  // 兩側從二樓到屋頂的磁磚邊柱
  for (const s of [-1, 1]) b.box('mosaicTile', [0.32, roof - groundH, 0.3], [s * (half - 0.16), (groundH + roof) / 2, z - 0.15], { tint: '#ffffff' })
  // 二樓：磁磚牆與木框的三扇窗
  b.box('mosaicTile', [half * 2 - 0.64, 0.75, 0.2], [0, f2 + 0.375, z - 0.1], { tint: '#ffffff' })
  b.box('mosaicTile', [half * 2 - 0.64, f3 - f2 - 2.55, 0.2], [0, f3 - (f3 - f2 - 2.55) / 2, z - 0.1], { tint: '#ffffff' })
  const wy0 = f2 + 0.75
  const wy1 = f3 - (f3 - f2 - 2.55)
  b.box('dark', [half * 2 - 0.64, wy1 - wy0, 0.04], [0, (wy0 + wy1) / 2, z - 0.12], { tint: '#313a40' })
  for (const x of [-(half - 0.36), -0.55, 0.55, half - 0.36]) b.box('wood', [0.08, wy1 - wy0, 0.08], [x, (wy0 + wy1) / 2, z - 0.08], { tint: WOOD_FRAME })
  for (const y of [wy0, wy1]) b.box('wood', [half * 2 - 0.62, 0.08, 0.09], [0, y, z - 0.08], { tint: WOOD_FRAME })
  // 窗裡淡淡的窗簾（右邊一片紅色）
  b.box('plain', [0.9, wy1 - wy0 - 0.2, 0.02], [1.15, (wy0 + wy1) / 2, z - 0.16], { tint: '#7c3a34' })
  // 窗下左側的兩盞黑色圓燈
  for (const x of [-1.55, -1.2]) {
    b.cylinder('dark', 0.11, 0.11, 0.08, 12, [x, wy0 + 0.12, z + 0.02], { rotation: [Math.PI / 2, 0, 0], tint: '#26282a' })
    b.add('plain', new TorusGeometry(0.1, 0.012, 4, 14), { position: [x, wy0 + 0.12, z + 0.065], tint: '#8f9395' })
  }
  // 三、四樓：貼磁磚的陽台矮牆（略為突出）與退縮的鋁窗
  for (const [y0, y1] of [[f3, f4], [f4, roof]]) {
    b.box('mosaicTile', [half * 2 - 0.64, 0.95, 0.22], [0, y0 + 0.475, z + 0.04], { tint: '#ffffff' })
    b.box('mosaicTile', [half * 2 - 0.64, 0.2, 0.26], [0, y0 + 0.95, z + 0.05], { tint: '#ffffff' })
    b.box('mosaicTile', [half * 2 - 0.64, y1 - y0 - 0.95, 0.2], [0, y0 + 0.95 + (y1 - y0 - 0.95) / 2, z - 0.85], { tint: '#ffffff' })
    const gy0 = y0 + 1.15
    const gy1 = y1 - 0.3
    b.box('dark', [half * 2 - 1.0, gy1 - gy0, 0.04], [0, (gy0 + gy1) / 2, z - 0.72], { tint: '#2f383e' })
    for (const x of [-(half - 0.55), -0.4, 0.75, half - 0.55]) b.box('plain', [0.06, gy1 - gy0, 0.06], [x, (gy0 + gy1) / 2, z - 0.69], { tint: '#9aa0a2' })
    for (const y of [gy0, gy1]) b.box('plain', [half * 2 - 0.98, 0.06, 0.07], [0, y, z - 0.69], { tint: '#9aa0a2' })
    // 陽台的地板與天花
    b.box('plaster', [half * 2 - 0.64, 0.1, 0.9], [0, y0 + 0.05, z - 0.4], { tint: '#cfccc4' })
  }
  // 陽台上的盆栽與晾衣竿（生活感）
  b.cylinder('plain', 0.12, 0.09, 0.2, 10, [-1.3, f3 + 1.05, z - 0.3], { tint: '#9a5a3a' })
  b.add('plain', new TorusGeometry(0.1, 0.06, 4, 8), { position: [-1.3, f3 + 1.22, z - 0.3], rotation: [Math.PI / 2, 0, 0], tint: '#5f8a4a' })
  b.cylinder('steel', 0.012, 0.012, 3.4, 6, [0, f4 - 0.35, z - 0.45], { rotation: [0, 0, Math.PI / 2], tint: '#b9bdbe' })
  // 屋頂：女兒牆、頂樓的綠色玻璃加蓋（鋼骨與綠色的玻璃板）
  b.box('mosaicTile', [half * 2, 0.55, 0.2], [0, roof + 0.275, z - 0.1], { tint: '#ffffff' })
  const gz = z - 0.55
  b.box('plain', [half * 2 - 0.2, 0.06, 0.06], [0, roofTop, gz - 0.3], { tint: '#3d4a45' })
  for (const x of [-(half - 0.12), -0.8, 0.8, half - 0.12]) b.box('plain', [0.06, roofTop - roof - 0.5, 0.06], [x, roof + 0.5 + (roofTop - roof - 0.5) / 2, gz], { tint: '#3d4a45' })
  b.box('glass', [half * 2 - 0.3, roofTop - roof - 0.55, 0.03], [0, roof + 0.55 + (roofTop - roof - 0.55) / 2, gz], { tint: '#7fbfa8' })
  b.box('glass', [half * 2 - 0.2, 0.03, 1.6], [0, roofTop + 0.12, gz - 0.75], { rotation: [0.12, 0, 0], tint: '#6fb29a' })
  // 外露的線材與排水管（照片左側的電線、冷氣管；不一比一複製）
  b.cylinder('plain', 0.035, 0.035, roof - groundH, 8, [-half + 0.06, (roof + groundH) / 2, z + 0.06], { tint: '#9aa09c' })
  b.cylinder('plain', 0.018, 0.018, f4 - groundH, 6, [-half + 0.14, (f4 + groundH) / 2, z + 0.1], { tint: '#d9d7d0' })
}

/** 側牆、後牆與屋頂（從斜角與比較矮的鄰屋上方看得到） */
function shell(b) {
  const { half, wallT, arcade: front, back, groundH, roof } = L
  const depth = front - back
  for (const s of [-1, 1]) {
    b.box('plaster', [wallT, roof - groundH, depth - 0.3], [s * (half - wallT / 2), (groundH + roof) / 2, (front - 0.3 + back) / 2], { tint: '#d6d3cc', grime: 0.25 })
    b.box('plaster', [wallT, groundH, -back], [s * (half - wallT / 2), groundH / 2, back / 2], { tint: '#cfcbc2', grime: 0.3 })
  }
  b.box('plaster', [half * 2, roof, wallT], [0, roof / 2, back + wallT / 2], { tint: '#c9c5bc', grime: 0.3 })
  b.box('plaster', [half * 2, 0.2, depth - 0.3], [0, roof - 0.1, (front - 0.3 + back) / 2], { tint: '#b9b5ac' })
  // 二樓樓板（店內天花上方）
  b.box('plaster', [half * 2 - wallT * 2, groundH - L.ceiling, -back - wallT], [0, (L.ceiling + groundH) / 2, (back + wallT) / 2], { tint: '#dedbd4' })
  // 屋頂上的水塔
  b.cylinder('steel', 0.5, 0.5, 1.1, 14, [0.9, roof + 0.75, back + 1.6], { tint: '#d0d4d4' })
  // 屋頂上的冷氣室外機（側牆貼著鄰屋，不往外凸出）
  b.box('plain', [0.75, 0.55, 0.32], [-1.0, roof + 0.28, back + 2.4], { tint: '#e6e4de' })
}

/** 主招牌：紅色長方形、表面一條一條直向的凸條；金色立體字「永樂米苔目」與右側直寫的「50年老店」 */
function mainSign(b) {
  const { half, arcade: front, arcadeCeiling: H } = L
  // 招牌只到地段的寬度，不切進兩側鄰屋的簷口
  const width = half * 2 - 0.04
  const y0 = H + 0.08
  const y1 = H + 0.9
  const z = front + 0.16
  b.box('plain', [width, y1 - y0, 0.2], [0, (y0 + y1) / 2, z], { tint: RED_DARK })
  // 直向的凸條
  const ribs = 34
  for (let i = 0; i < ribs; i++) {
    const x = -width / 2 + 0.06 + (i * (width - 0.12)) / (ribs - 1)
    b.box('plain', [0.05, y1 - y0 - 0.08, 0.03], [x, (y0 + y1) / 2, z + 0.11], { tint: i % 2 ? RED : shade(RED, 1.06) })
  }
  b.box('plain', [width + 0.04, 0.05, 0.24], [0, y1 + 0.02, z], { tint: shade(RED_DARK, 0.85) })
  b.box('plain', [width + 0.04, 0.05, 0.24], [0, y0 - 0.02, z], { tint: shade(RED_DARK, 0.85) })
  // 金色立體字（字的位置略為偏左，右端留給「50年老店」）
  b.addSign({ text: '永樂米苔目', style: 'mitaimuGold', width: width - 0.75, height: y1 - y0 - 0.06, position: [-0.22, (y0 + y1) / 2, z + 0.135] })
  b.addSign({ text: '50年老店', style: 'mitaimuSmall', vertical: true, width: 0.22, height: y1 - y0 - 0.12, position: [width / 2 - 0.3, (y0 + y1) / 2, z + 0.135] })
}

/** 左右兩側的紅色直立側招牌（垂直於立面、兩面都有字）：右側較大，寫「永樂米苔目」；左側是燈箱，寫「米苔目」 */
function sideSigns(b) {
  const { half, arcade: front } = L
  const signs = [
    { x: half - 0.12, y0: 5.0, y1: 8.6, out: 0.95, text: '永樂米苔目' },
    { x: -half + 0.12, y0: 4.55, y1: 6.35, out: 0.8, text: '米苔目' },
  ]
  for (const s of signs) {
    const h = s.y1 - s.y0
    const zc = front + 0.12 + s.out / 2
    // 招牌箱與兩根固定在牆上的鐵架
    b.box('plain', [0.2, h, s.out], [s.x, (s.y0 + s.y1) / 2, zc], { tint: RED })
    b.box('plain', [0.22, h + 0.04, 0.04], [s.x, (s.y0 + s.y1) / 2, front + 0.12 + s.out], { tint: RED_DARK })
    for (const y of [s.y0 + 0.2, s.y1 - 0.2]) b.box('plain', [0.04, 0.04, 0.2], [s.x, y, front + 0.06], { tint: '#3a3a3c' })
    for (const side of [-1, 1]) {
      b.addSign({ text: s.text, style: 'mitaimuVertical', vertical: true, width: s.out - 0.1, height: h - 0.16, position: [s.x + side * 0.102, (s.y0 + s.y1) / 2, zc], rotationY: (side * Math.PI) / 2 })
    }
  }
}

/** 右側窄小的鄰屋（地段其餘的 1.8 m）：騎樓與藍色鐵捲門、二三樓的灰泥牆與窗、冷氣室外機 */
function neighbour(b) {
  const { arcade: front, back } = L
  const n = L.neighbour
  const w = n.maxX - n.minX
  const cx = (n.minX + n.maxX) / 2
  b.box('stone', [w, 0.06, front], [cx, 0.03, front / 2], { tint: '#cdc8bc' })
  b.box('shutter', [w - 0.3, 2.9, 0.05], [cx - 0.1, 1.45, 0.02], { tint: '#3f6fb3' })
  b.box('plaster', [w - 0.3, L.arcadeCeiling - 2.9, 0.2], [cx - 0.1, (2.9 + L.arcadeCeiling) / 2, -0.05], { tint: '#d8d4ca' })
  b.box('plaster', [0.32, L.arcadeCeiling, 0.32], [n.maxX - 0.16, L.arcadeCeiling / 2, front - 0.16], { tint: '#d0ccc2', grime: 0.25 })
  b.box('plaster', [w, n.top - L.arcadeCeiling, 0.2], [cx, (L.arcadeCeiling + n.top) / 2, front - 0.1], { tint: '#cfcac0', grime: 0.3 })
  b.box('plaster', [w, n.top, -back - 0.2], [cx, n.top / 2, (back - 0.2) / 2], { tint: '#c9c4b9', grime: 0.3 })
  for (const y of [4.6, 7.6]) {
    b.box('dark', [w - 0.6, 1.2, 0.04], [cx, y + 0.6, front + 0.01], { tint: '#3a454c' })
    b.box('plain', [w - 0.5, 0.06, 0.1], [cx, y, front + 0.05], { tint: '#d8d8d2' })
    for (let i = 0; i <= 5; i++) b.box('plain', [0.016, 1.3, 0.016], [n.minX + 0.3 + i * ((w - 0.6) / 5), y + 0.62, front + 0.18], { tint: '#5d6266' })
  }
  b.box('plain', [0.75, 0.55, 0.3], [cx, 6.6, front + 0.2], { tint: '#e6e4de' })
  b.cylinder('dark', 0.2, 0.2, 0.02, 14, [cx, 6.6, front + 0.36], { rotation: [Math.PI / 2, 0, 0], tint: '#5b5953' })
}

/** 左邊柱子前的菜色海報板（照片裡的立牌）：只有菜色的圓形圖與店名，沒有價格 */
function posterBoard(b) {
  const { half, arcade: front } = L
  const x = -half + 0.2
  const z = front + 0.02
  b.box('plain', [0.36, 1.1, 0.03], [x, 1.35, z], { tint: '#f4efe4' })
  b.box('plain', [0.36, 0.14, 0.035], [x, 1.86, z + 0.002], { tint: RED })
  const colors = ['#d8b07a', '#c9874a', '#e8d6b0', '#9c5a3a', '#b8c890', '#e0c090']
  for (let i = 0; i < 6; i++) {
    b.cylinder('plain', 0.065, 0.065, 0.01, 12, [x - 0.08 + (i % 2) * 0.16, 1.62 - Math.floor(i / 2) * 0.22, z + 0.02], { rotation: [Math.PI / 2, 0, 0], tint: colors[i] })
  }
}

/** 騎樓左半邊停著的機車（車頭朝街）：車身、腳踏板、座墊、龍頭與兩面後照鏡、前後輪 */
function scooter(b, x, z, rotationY, tint) {
  b.group([x, 0.06, z], rotationY, () => {
    for (const wz of [-0.55, 0.6]) {
      b.add('plain', new TorusGeometry(0.2, 0.07, 6, 14), { position: [0, 0.22, wz], rotation: [0, Math.PI / 2, 0], tint: '#222224' })
      b.cylinder('plain', 0.11, 0.11, 0.1, 10, [0, 0.22, wz], { rotation: [0, 0, Math.PI / 2], tint: '#8b8f93' })
    }
    // 後車身與座墊
    b.box('plain', [0.36, 0.34, 0.75], [0, 0.55, -0.35], { tint })
    b.box('plain', [0.32, 0.1, 0.62], [0, 0.77, -0.3], { tint: '#1e1e20' })
    // 腳踏板與前車身
    b.box('plain', [0.3, 0.08, 0.5], [0, 0.32, 0.18], { tint: '#2a2b2e' })
    b.box('plain', [0.34, 0.6, 0.2], [0, 0.62, 0.48], { rotation: [-0.25, 0, 0], tint })
    b.box('plain', [0.24, 0.22, 0.22], [0, 0.36, 0.62], { tint })
    // 龍頭、後照鏡與車頭燈
    b.box('plain', [0.6, 0.05, 0.06], [0, 1.0, 0.45], { tint: '#2a2b2e' })
    for (const s of [-1, 1]) {
      b.cylinder('plain', 0.008, 0.008, 0.18, 4, [s * 0.24, 1.1, 0.43], { tint: '#2a2b2e' })
      b.box('plain', [0.09, 0.06, 0.02], [s * 0.26, 1.2, 0.43], { tint: '#1e1e20' })
    }
    b.box('bulb', [0.14, 0.08, 0.03], [0, 0.9, 0.56], { tint: '#f4f1e8' })
  })
}

/** 一樓店內的外殼：左牆的木作櫃門、右牆下半的淺色木作護牆與菜單板、白色天花與嵌燈、壁扇、後方藍色的端景 */
function interiorShell(b) {
  const { room, ceiling, menuBoard: m } = L
  const depth = room.maxZ - room.minZ
  const cz = (room.minZ + room.maxZ) / 2
  // 天花：白色、一排一排的圓形嵌燈，中間一個木格柵的出風口與兩個監視器的圓罩
  b.box('plaster', [room.maxX - room.minX, 0.06, depth], [0, ceiling + 0.03, cz], { tint: '#f6f5f1' })
  for (let i = 0; i < 6; i++) {
    for (const x of [-0.9, 0.95]) {
      const z = -1.3 - i * 1.65
      b.cylinder('bulb', 0.09, 0.09, 0.02, 12, [x, ceiling - 0.005, z], { tint: '#fffaf0' })
      if (i % 2 === 0) b.addGlow(x, ceiling - 0.25, z, 0.9, '#fff6e6')
    }
  }
  b.box('lattice', [0.9, 0.03, 0.9], [-0.2, ceiling - 0.01, -6.2], { tint: '#c9a678' })
  for (const [x, z] of [[0.6, -1.2], [-1.6, -7.8]]) b.add('plain', new TorusGeometry(0.05, 0.04, 6, 10), { position: [x, ceiling - 0.04, z], rotation: [Math.PI / 2, 0, 0], tint: '#f2f2ef' })
  // 左牆：上半白牆、下半木作櫃門（一扇一扇的門板與把手）
  b.box('plaster', [0.06, ceiling, depth], [room.minX + 0.03, ceiling / 2, cz], { tint: '#f1efe9' })
  for (let i = 0; i < 4; i++) {
    const z = -3.7 - i * 0.62
    b.box('woodLight', [0.04, 2.1, 0.58], [room.minX + 0.08, FLOOR_Y + 1.05, z], { tint: '#9a6a42' })
    b.box('plain', [0.02, 0.12, 0.02], [room.minX + 0.11, FLOOR_Y + 1.05, z + 0.22], { tint: '#d0cdc6' })
  }
  // 右牆：白牆與下半淺色木作護牆、大菜單板、壁扇與紅色的桌號牌
  b.box('plaster', [0.06, ceiling, depth], [room.maxX - 0.03, ceiling / 2, cz], { tint: '#f4f2ed' })
  b.box('woodLight', [0.03, 0.9, depth - 1.0], [room.maxX - 0.075, FLOOR_Y + 0.45, cz - 0.5], { tint: '#d6bf96' })
  b.box('plain', [0.05, 0.03, depth - 1.0], [room.maxX - 0.08, FLOOR_Y + 0.91, cz - 0.5], { tint: '#b99a6a' })
  const mz = (m.minZ + m.maxZ) / 2
  const mw = m.maxZ - m.minZ
  b.box('plain', [0.03, m.y1 - m.y0 + 0.08, mw + 0.08], [room.maxX - 0.08, (m.y0 + m.y1) / 2, mz], { tint: '#8a3a2a' })
  b.box('plain', [0.03, m.y1 - m.y0, mw], [room.maxX - 0.095, (m.y0 + m.y1) / 2, mz], { tint: '#f3ead6' })
  b.addSign({ text: '永樂米苔目', style: 'mitaimuMenu', vertical: true, width: 0.24, height: m.y1 - m.y0 - 0.1, position: [room.maxX - 0.112, (m.y0 + m.y1) / 2, m.minZ + 0.2], rotationY: -Math.PI / 2 })
  // 菜單板上的菜色圖（圓形的菜色照片示意，沒有品名與價格）
  const dishes = ['#d8b07a', '#c9874a', '#e8d6b0', '#9c5a3a', '#b8c890', '#e0c090', '#c98a3c', '#efe4cc']
  let k = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 3; row++) {
      const z = m.maxZ - 0.22 - col * 0.46
      const y = m.y1 - 0.17 - row * 0.27
      b.cylinder('plain', 0.075, 0.075, 0.01, 12, [room.maxX - 0.115, y, z], { rotation: [0, 0, Math.PI / 2], tint: dishes[k++ % dishes.length] })
      b.box('plain', [0.008, 0.02, 0.14], [room.maxX - 0.115, y - 0.105, z], { tint: '#8a6a52' })
    }
  }
  // 菜單板靠入口那一端的下方貼著一張黃色的告示
  b.box('plain', [0.01, 0.2, 0.3], [room.maxX - 0.114, m.y0 - 0.14, m.maxZ - 0.35], { tint: '#f2d36a' })
  for (const z of [-3.0, -5.6, -8.0]) {
    // 壁扇
    b.box('plain', [0.1, 0.16, 0.12], [room.maxX - 0.1, 2.45, z], { tint: '#ecebe6' })
    b.cylinder('plain', 0.2, 0.2, 0.08, 14, [room.maxX - 0.32, 2.4, z], { rotation: [0, 0, Math.PI / 2 - 0.35], tint: '#f3f2ee' })
    b.add('plain', new TorusGeometry(0.2, 0.01, 4, 16), { position: [room.maxX - 0.36, 2.39, z], rotation: [0, Math.PI / 2, -0.35], tint: '#c9c7c0' })
  }
  b.box('plain', [0.1, 0.16, 0.12], [room.minX + 0.1, 2.45, -6.0], { tint: '#ecebe6' })
  b.cylinder('plain', 0.2, 0.2, 0.08, 14, [room.minX + 0.32, 2.4, -6.0], { rotation: [0, 0, -Math.PI / 2 + 0.35], tint: '#f3f2ee' })
  // 桌號牌（紅底白字）與兩張小告示（只有線條，沒有文字）
  L.tables.forEach((t) => {
    if (!t.id.startsWith('r')) return
    b.box('plain', [0.01, 0.22, 0.18], [room.maxX - 0.1, 1.45, t.z], { tint: '#cf2a26' })
    b.addSign({ text: t.id.slice(1), style: 'tableNumber', width: 0.16, height: 0.2, position: [room.maxX - 0.106, 1.45, t.z], rotationY: -Math.PI / 2 })
    b.box('plain', [0.01, 0.2, 0.24], [room.maxX - 0.1, 1.45, t.z - 0.3], { tint: '#f6f4ee' })
    for (let j = 0; j < 4; j++) b.box('plain', [0.012, 0.012, 0.18], [room.maxX - 0.102, 1.5 - j * 0.04, t.z - 0.3], { tint: '#9a9a96' })
  })
  // 後方的端景：藍色牆面、牆上有一幅紅框的掛畫（不畫人物）、一排毛玻璃方格的高窗、上方的茅草裝飾邊
  const back = room.minZ
  b.box('plaster', [room.maxX - room.minX, ceiling, 0.08], [0, ceiling / 2, back - 0.04], { tint: '#f0eee8' })
  b.box('plain', [room.maxX - room.minX - 1.2, 1.5, 0.03], [0.55, FLOOR_Y + 1.75, back + 0.02], { tint: '#3d6f9e' })
  b.box('plain', [0.7, 0.62, 0.04], [0.6, FLOOR_Y + 1.78, back + 0.045], { tint: '#b3262a' })
  b.box('plain', [0.6, 0.52, 0.02], [0.6, FLOOR_Y + 1.78, back + 0.07], { tint: '#e9c76a' })
  b.box('plain', [0.46, 0.36, 0.02], [0.6, FLOOR_Y + 1.78, back + 0.082], { tint: '#d6b48a' })
  b.box('whiteTile', [room.maxX - room.minX - 0.2, 0.32, 0.03], [0, ceiling - 0.25, back + 0.03], { tint: '#f1f5f7' })
  b.box('plain', [room.maxX - room.minX - 0.2, 0.03, 0.05], [0, ceiling - 0.42, back + 0.04], { tint: '#9a8a74' })
  thatch(b, -0.75, 2.1, ceiling - 0.55, -9.4)
  // 左牆高處的電視（只有深色的螢幕）
  b.box('dark', [0.06, 0.38, 0.62], [room.minX + 0.08, 2.5, -8.9], { tint: '#1c2028' })
  b.box('plain', [0.01, 0.3, 0.52], [room.minX + 0.115, 2.5, -8.9], { tint: '#2f5a7a' })
  // 入口內左側的茅草裝飾邊（照片左上角）
  thatch(b, -1.4, -2.9, ceiling - 0.42, room.minX + 0.14, true)
}

/** 茅草的裝飾邊：一條橫木下垂著細密、長短不一的草束（along：沿著 x 或 z） */
function thatch(b, from, to, y, at, alongZ = false) {
  const n = Math.round(Math.abs(to - from) / 0.03)
  const pos = (t) => (alongZ ? [at, y, t] : [t, y, at])
  b.box('wood', alongZ ? [0.05, 0.05, Math.abs(to - from)] : [Math.abs(to - from), 0.05, 0.05], pos((from + to) / 2), { tint: '#8a6440' })
  for (let i = 0; i < n; i++) {
    const t = from + ((to - from) * (i + 0.5)) / n
    const len = 0.22 + ((i * 7) % 5) * 0.03
    const p = pos(t)
    p[1] = y - len / 2
    b.box('bamboo', alongZ ? [0.02, len, 0.028] : [0.028, len, 0.02], p, { rotation: alongZ ? [((i % 3) - 1) * 0.08, 0, 0.1] : [0.08, 0, ((i % 3) - 1) * 0.08], tint: i % 2 ? '#cfb27a' : '#c2a46c' })
  }
}

/* ── 遮擋方塊、碰撞 ─────────────────────── */

/** 店內家具的遮擋方塊（只給鏡頭用，不算在點選範圍裡）：桌子、外帶區、調味料長櫃、後方櫃台 */
export function yongleMiTaiMuFurnitureBlockers(b) {
  for (const t of L.tables) b.addBlocker(t.x - L.table.half, t.x + L.table.half, 0, L.table.height + FLOOR_Y, t.z - L.table.half, t.z + L.table.half)
  const c = L.condiments
  b.addBlocker(c.minX, c.maxX, 0, c.height, c.minZ, c.maxZ)
  const k = L.backCounter
  b.addBlocker(k.minX, k.maxX, 0, k.height, k.minZ, k.maxZ)
  const f = L.fridge
  b.addBlocker(f.minX, f.maxX, 0, 1.9, f.minZ, f.maxZ)
}

/** 建築的遮擋方塊（鏡頭與點選）：外殼、天花、招牌、外帶區與排煙罩，以及三個可以點選的目標 */
function registerBlockers(b) {
  const { half, wallT, arcade: front, back, groundH, roof, room, ceiling } = L
  // 側牆、後牆、二樓以上的量體（騎樓上方到屋頂）、店內天花
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, roof, back, front)
  b.addBlocker(-half, half, 0, roof, back, room.minZ - 0.08)
  b.addBlocker(-half, half, groundH, roof + 0.6, back, front)
  b.addBlocker(-half, half, ceiling, groundH, back, 0)
  b.addBlocker(-half, half, L.arcadeCeiling, groundH, 0, front)
  // 騎樓的柱子、外帶區（櫃檯與排煙罩）、鋁櫃
  b.addBlocker(-half, -half + L.pier, 0, L.arcadeCeiling, front - L.pier, front)
  b.addBlocker(half - L.pier, half, 0, L.arcadeCeiling, front - L.pier, front)
  const t = L.takeaway
  b.addBlocker(t.minX, t.maxX, 0, t.height + 0.1, t.minZ, t.maxZ)
  b.addBlocker(t.minX, t.maxX + 0.05, 2.28, L.arcadeCeiling, -0.9, 0.1)
  const c = L.cabinets
  b.addBlocker(c.minX, c.maxX, 0, 0.82, c.minZ, c.maxZ)
  // 鄰屋
  const n = L.neighbour
  b.addBlocker(n.minX, n.maxX, 0, n.top, back, front)
  const ranges = {}
  // 主招牌與兩側的直立招牌
  let start = b.blockers.length
  b.addBlocker(-half, half, L.arcadeCeiling + 0.06, L.arcadeCeiling + 0.92, front + 0.06, front + 0.3)
  b.addBlocker(half - 0.22, half - 0.02, 5.0, 8.6, front + 0.1, front + 1.1)
  b.addBlocker(-half + 0.02, -half + 0.22, 4.55, 6.35, front + 0.1, front + 0.95)
  ranges.signs = { start, end: b.blockers.length }
  // 一碗米苔目與小菜（第一張桌子的桌面上方）
  const food = yongleMtmTable(L.foodTable)
  start = b.blockers.length
  b.addBlocker(food.x - L.table.half, food.x + L.table.half, L.table.height + FLOOR_Y, L.table.height + FLOOR_Y + 0.14, food.z - L.table.half, food.z + L.table.half)
  ranges.foods = { start, end: b.blockers.length }
  // 右牆的大菜單板
  const m = L.menuBoard
  start = b.blockers.length
  b.addBlocker(room.maxX - 0.14, room.maxX, m.y0 - 0.05, m.y1 + 0.05, m.minZ, m.maxZ)
  ranges.menu = { start, end: b.blockers.length }
  return ranges
}

function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：騎樓（伸進迪化街的路面一段）、一樓店內；
 * 障礙物是騎樓的柱子、機車、鋁櫃與鼓風機，外帶區與後方的工作區、調味料長櫃、推車與垃圾桶、桌子連同前後的圓凳、
 * 站著的人物、後方的櫃台與冰箱。
 */
export function yongleMiTaiMuCollision(config, transform) {
  const rect = (...args) => worldRect(transform, ...args)
  const { half, arcade: front, pier, room, table, stoolOffset } = L
  const walkable = [rect(-half + pier, half - pier, -0.05, front + 0.35), rect(room.minX + 0.01, room.maxX - 0.01, room.minZ + 0.05, 0.05)]
  const t = L.takeawayStaff
  const c = L.cabinets
  const f = L.blower
  const k = L.condiments
  const obstacles = [
    rect(-half, -half + pier, front - pier, front),
    rect(half - pier, half, front - pier, front),
    rect(t.minX, t.maxX, t.minZ, t.maxZ),
    rect(c.minX, c.maxX, c.minZ - 0.02, c.maxZ),
    rect(f.minX, f.maxX, f.minZ, f.maxZ),
    rect(k.minX, k.maxX, k.minZ, k.maxZ),
    rect(L.backCounter.minX, L.backCounter.maxX, L.backCounter.minZ, L.backCounter.maxZ),
    rect(L.fridge.minX, L.fridge.maxX, L.fridge.minZ, L.fridge.maxZ),
  ]
  for (const s of L.scooters) obstacles.push(rect(s.x - 0.24, s.x + 0.24, s.z - 0.85, s.z + 0.85))
  for (const p of [L.cart, L.bin]) obstacles.push(rect(p.x - 0.22, p.x + 0.22, p.z - 0.24, p.z + 0.24))
  for (const tb of L.tables) obstacles.push(rect(tb.x - table.half - 0.02, tb.x + table.half + 0.02, tb.z - stoolOffset - 0.19, tb.z + stoolOffset + 0.19))
  for (const npc of YONGLE_MTM_NPCS) {
    const p = yongleMtmNpcPlacement(npc)
    if (!p.seat) obstacles.push(rect(p.x - 0.22, p.x + 0.22, p.z - 0.22, p.z + 0.22))
  }
  return { walkable, obstacles }
}

/** 永樂米苔目（連同右側的鄰屋）佔用的世界範圍（範圍內不產生遠景房屋與遠景的樹） */
export function yongleMiTaiMuFootprint(transform) {
  return worldRect(transform, -L.half, L.neighbour.maxX, L.back - 0.5, L.arcade)
}

/* ── 人物 ─────────────────────────────── */

/** 店裡與騎樓的人物（世界座標）：店裡的人物跟著室內一起顯示（zone），騎樓的客人在街景裡 */
function shopNpcs(b) {
  return YONGLE_MTM_NPCS.map((npc, i) => {
    const p = yongleMtmNpcPlacement(npc)
    const w = b.transformPoint(p.x, FLOOR_Y, p.z)
    return {
      id: `yong-le-${npc.id}`,
      look: npc.look,
      pose: npc.pose,
      position: [w.x, npc.arcade ? 0.06 : FLOOR_Y, w.z],
      rotationY: b.worldRotationY(p.rotationY),
      seatY: p.seat ? 0.46 : undefined,
      phase: (i * 0.29) % 1,
      zone: npc.arcade ? undefined : 'yong-le-mi-tai-mu',
    }
  })
}

/* ── 主程式 ─────────────────────────────── */

export function buildYongleMiTaiMuExterior(b, cfg = {}, detail = b) {
  arcade(b)
  shopfront(b)
  exhaustDuct(b)
  takeaway(b, detail)
  upperFacade(b)
  shell(b)
  mainSign(b)
  sideSigns(b)
  neighbour(b)
  posterBoard(b)
  L.scooters.forEach((s, i) => scooter(b, s.x, s.z, s.rotationY, i ? '#f1efe8' : '#3a4250'))
  interiorShell(b)
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
  const { half, arcade: front, room, ceiling, roof, menuBoard: m } = L
  const storefront = YONGLE_MTM_HOTSPOTS.find((item) => item.id === 'storefront')
  const food = yongleMtmTable(L.foodTable)
  return {
    groundHeight: L.groundH,
    topHeight: roof,
    anchors: { prompt: local(...storefront.prompt), marker: local(0, L.roofTop + 2.0, -1.0) },
    // 觀賞模式聚焦永樂米苔目：從迪化街上看狹長的立面、主招牌與騎樓
    focus: {
      center: toWorld(0, front),
      forward: dir(0, 1),
      width: half * 2 + 1.2,
      height: 9.5,
      viewHeight: 4.2,
      maxDistance: 11.5,
      maxPitch: 0.5,
      maxYawOffset: 0.5,
    },
    subStores: [
      {
        id: 'yong-le-signs',
        storeId: 'yong-le-mi-tai-mu',
        detail: true,
        hotspot: 'storefront',
        range: ranges.signs,
        focus: { center: toWorld(0, front + 0.2), forward: dir(0, 1), width: 5.4, height: 3.0, viewHeight: L.arcadeCeiling + 0.6, maxDistance: 7.5, maxPitch: 0.32, maxYawOffset: 0.5 },
      },
      {
        id: 'yong-le-menu',
        storeId: 'yong-le-mi-tai-mu',
        detail: true,
        hotspot: 'dining',
        range: ranges.menu,
        focus: {
          center: toWorld(room.maxX - 0.12, (m.minZ + m.maxZ) / 2),
          forward: dir(-1, 0),
          width: m.maxZ - m.minZ + 0.3,
          height: 1.2,
          viewHeight: (m.y0 + m.y1) / 2,
          maxDistance: 2.6,
          maxPitch: 0.25,
          maxYawOffset: 0.45,
        },
      },
      {
        id: 'yong-le-foods',
        storeId: 'yong-le-mi-tai-mu',
        detail: true,
        hotspot: 'foods',
        range: ranges.foods,
        // 從入口那一側（+z）看桌上的一碗米苔目與小菜（走道那一側離左牆太近，鏡頭退不開）
        focus: {
          center: toWorld(food.x, food.z + L.table.half),
          forward: dir(0, 1),
          width: 0.9,
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
        id: 'yong-le-mi-tai-mu',
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
        // 按需載入：接近店面時才產生（出發點在斜對面、約 5.5 m 外，開始探索後很快就會產生，從街上看得到店裡）
        loadRadius: 8,
        showRadius: 26,
      },
    ],
    // 觀賞模式：注視點可以進到騎樓與店內（不超過天花板與騎樓的梁）
    viewerRegions: [
      { ...zone(-half + 0.5, half - 0.5, 0.15, front - 0.1), maxY: 2.5, cameraMaxY: 3.0 },
      { ...zone(room.minX + 0.35, room.maxX - 0.35, room.minZ + 0.35, -0.1), maxY: 2.2, cameraMaxY: ceiling - 0.35 },
    ],
    // 騎樓與店內：人物可以貼著桌椅與牆走，第三人稱鏡頭在這裡停在障礙物前面；
    // 店門前的一段街道也是：主招牌與騎樓的梁凸出到騎樓外緣，人物背對店面走出來時，鏡頭停在招牌前面
    followAreas: [zone(-half, half, room.minZ, front), zone(-half - 0.3, half + 0.3, front, front + 2.6)],
    npcs: shopNpcs(b),
  }
}

/** 店內地磚的高度（店內的家具放在這個高度上） */
export const YONGLE_FLOOR_Y = FLOOR_Y
