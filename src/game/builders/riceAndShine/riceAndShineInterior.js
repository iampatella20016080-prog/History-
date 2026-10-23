import { CylinderGeometry, IcosahedronGeometry, LatheGeometry, TorusGeometry, Vector2 } from 'three'
import { MILL, MODERN, POSTWAR, RS } from '../../../data/riceAndShineLayout.js'
import { createRng } from '../../utils/random.js'
import { sack, shade } from '../props.js'
import { buildRiceCourtyard } from './riceAndShineCourtyard.js'
import { riceMeasure, ricePanel } from './riceAndShineExterior.js'
import { buildRiceSecondFloor, rattanChair } from './riceAndShineSecondFloor.js'
import { abacus, bambooBasket, bambooSieve, exhibitShelf, husker, measureStand, steelyard, wallHangings } from './riceCultureExhibit.js'
import { emptyTableSet, mealSet, teaCup } from './riceMealProps.js'
import { bareBulb, drawerCabinet, farmTools, flatPanel, lineShaftRig, millMachine, paddyHeap, sackStack } from './riceMillProps.js'

/**
 * 迪化街329號店屋的室內（RiceAndShineInterior；按需載入，依年代的 variant 換一整套室內）
 *
 * - riceMill（1930–1945）：前店（米袋、米斗、米桶、帳桌、秤、算盤、木櫃）→ 碾米區（碾米機與天軸、稻穀堆、
 *   木製農具、竹籮、米篩、右半邊的白米）→ 天井（曬稻穀的竹篩、水缸）→ 米倉（堆疊的米袋、木梯、木桁架）。
 *   灰泥牆、三和土地面，光線偏暗：天井的日光與暖色裸燈泡，沒有軌道燈。
 * - postwarRiceHouse（1945–1980）：同一套格局變舊：米袋少了、碾米機蓋著布、右半邊的白米少了，
 *   後進一部分變成住家（方桌、板凳、碗櫃、電鍋、熱水瓶、日曆與舊報紙）與倉庫（木箱、舊米袋）。
 * - riceAndShineModern（2000–現在）：稻舍。外露的紅磚牆、深色木梁、木板天花、紅陶地磚、暖色軌道燈；
 *   前段的米食用餐區（小方桌、藤編木椅、托盤套餐）、櫃台、雕花木櫃、老屋再生說明板；左牆的米業文化展示；
 *   天井；後段的舊碾米機與出菜櫃台；木樓梯與二樓。
 * - earlyRiceTrade（1895–1930）：街屋不能進去，沒有室內。
 * 只產生幾何；文字招牌、燈火、遮擋方塊與碰撞在 riceAndShineExterior.js（街景資料）。細小的擺飾放在 detail。
 */
const IN = RS.half - RS.wallT
const STYLE = {
  riceMill: { floor: 'granite', floorTint: '#7d766a', wall: 'plaster', wallTint: '#cbbd9f', lower: '#8f8068', beam: '#3b2a20', board: '#4f3a2a', grime: 0.25 },
  postwarRiceHouse: { floor: 'granite', floorTint: '#6c665c', wall: 'plaster', wallTint: '#b7aa8e', lower: '#6f7a72', beam: '#33251c', board: '#433226', grime: 0.4 },
  riceAndShineModern: { floor: 'terracotta', floorTint: '#b8613f', wall: 'brick', wallTint: '#a65a44', lower: null, beam: '#3a2a20', board: '#5a4030', grime: 0.08 },
}

/* ═══════════ 共用：地坪、牆面、隔間牆、木梁天花 ═══════════ */

function room(b, detail, variant, r, ceiling) {
  const st = STYLE[variant]
  const w = IN * 2
  const d = r.maxZ - r.minZ
  const cz = (r.minZ + r.maxZ) / 2
  b.box(st.floor, [w, 0.015, d], [0, 0.0425, cz], { tint: st.floorTint })
  for (const s of [-1, 1]) {
    b.box(st.wall, [0.03, ceiling + 0.2, d], [s * (IN - 0.035), (ceiling + 0.2) / 2, cz], { tint: s < 0 ? st.wallTint : shade(st.wallTint, 0.96), grime: st.grime })
    // 舊店屋：牆腳的深色牆裙（防潮）
    if (st.lower) b.box('plaster', [0.035, 0.9, d], [s * (IN - 0.04), 0.45, cz], { tint: st.lower, grime: 0.3 })
    // 稻舍：木作的踢腳板
    else b.box('wood', [0.02, 0.12, d], [s * (IN - 0.055), 0.06, cz], { tint: '#3a281d' })
  }
  // 木梁（橫跨兩側的牆）與木板天花
  b.box('planks', [w, 0.04, d], [0, ceiling + 0.27, cz], { tint: st.board })
  for (let z = r.maxZ - 0.45; z > r.minZ + 0.2; z -= 0.95) b.box('wood', [w, 0.22, 0.16], [0, ceiling + 0.14, z], { tint: shade(st.beam, 0.95 + (Math.abs(z * 13) % 1) * 0.12) })
  // 牆面的色差、補過的地方、水痕
  const rng = createRng(Math.round(-r.minZ * 100))
  for (let i = 0; i < 7; i++) {
    const s = rng() < 0.5 ? -1 : 1
    const tint = st.wall === 'brick' ? (rng() < 0.5 ? '#8a4a38' : '#c07a60') : shade(st.wallTint, rng() < 0.5 ? 0.82 : 1.08)
    b.box(st.wall === 'brick' ? 'brick' : 'plaster', [0.006, 0.15 + rng() * 0.4, 0.3 + rng() * 0.6], [s * (IN - 0.052), 1.0 + rng() * (ceiling - 1.4), r.minZ + 0.3 + rng() * (d - 0.6)], { tint })
  }
  void detail
}

/** 隔間牆（前進與天井、天井與後進之間），中間有門洞 */
function dividerWall(b, z0, z1, door, variant, frameTint) {
  const st = STYLE[variant]
  const top = RS.floor2
  const cz = (z0 + z1) / 2
  const t = z1 - z0
  const mat = st.wall === 'brick' ? 'brick' : 'plaster'
  const tint = st.wall === 'brick' ? shade(st.wallTint, 0.94) : st.wallTint
  b.box(mat, [door.minX + IN, top, t], [(-IN + door.minX) / 2, top / 2, cz], { tint, grime: st.grime })
  b.box(mat, [IN - door.maxX, top, t], [(door.maxX + IN) / 2, top / 2, cz], { tint, grime: st.grime })
  b.box(mat, [door.maxX - door.minX, top - door.height, t], [(door.minX + door.maxX) / 2, (door.height + top) / 2, cz], { tint })
  // 門框
  for (const x of [door.minX, door.maxX]) b.box('wood', [0.08, door.height, t + 0.04], [x, door.height / 2, cz], { tint: frameTint })
  b.box('wood', [door.maxX - door.minX + 0.16, 0.12, t + 0.06], [(door.minX + door.maxX) / 2, door.height + 0.06, cz], { tint: frameTint })
  b.box('stone', [door.maxX - door.minX, 0.06, t + 0.1], [(door.minX + door.maxX) / 2, 0.03, cz], { tint: '#8a857a' })
}

function shellFinishes(b, detail, variant) {
  const backCeiling = variant === 'riceAndShineModern' ? RS.ceiling1 : RS.ceiling1 + 0.1
  room(b, detail, variant, RS.front, RS.ceiling1)
  room(b, detail, variant, RS.back, backCeiling)
  const frame = variant === 'postwarRiceHouse' ? '#4a3626' : '#3f2b1f'
  dividerWall(b, RS.front.minZ - RS.wallT, RS.front.minZ, RS.courtyardDoor, variant, frame)
  dividerWall(b, RS.back.maxZ, RS.back.maxZ + RS.wallT, RS.backDoor, variant, frame)
  // 後牆的內面
  const st = STYLE[variant]
  b.box(st.wall === 'brick' ? 'brick' : 'plaster', [IN * 2, backCeiling + 0.2, 0.03], [0, (backCeiling + 0.2) / 2, RS.back.minZ + 0.05], { tint: shade(st.wallTint, 0.92), grime: st.grime })
  buildRiceCourtyard(b, detail, variant)
}

/* ═══════════ 1930：米行與碾米間 ═══════════ */

/** 帳桌：木櫃台、算盤、翻開的帳本、秤、硯台與錢箱；後方靠牆的木櫃與品名牌 */
function counterDesk(b, detail, r, aged) {
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  const wood = aged ? '#4f3a2a' : '#6a4a30'
  b.box('wood', [w, r.height - 0.05, d], [cx, (r.height - 0.05) / 2, cz], { tint: wood, grime: 0.15 })
  b.box('wood', [w + 0.06, 0.05, d + 0.06], [cx, r.height - 0.025, cz], { tint: shade(wood, 1.15) })
  for (let i = 0; i < 3; i++) b.box('wood', [0.02, r.height - 0.25, d / 3 - 0.06], [r.minX - 0.005, (r.height - 0.05) / 2, r.minZ + (i + 0.5) * (d / 3)], { tint: shade(wood, 1.1) })
  const top = r.height
  abacus(b, cx - 0.25, top + 0.02, cz + 0.1, Math.PI / 2)
  b.box('wood', [0.3, 0.02, 0.18], [cx - 0.25, top + 0.01, cz + 0.1], { tint: '#3a281d' })
  flatPanel(b, 'ledger', 0.34, 0.24, [cx + 0.1, top + 0.006, cz - 0.1], 0.2)
  b.box('plain', [0.1, 0.02, 0.07], [cx + 0.35, top + 0.01, cz + 0.2], { tint: '#1f1c1a' })
  b.cylinder('wood', 0.004, 0.005, 0.16, 4, [cx + 0.3, top + 0.02, cz + 0.05], { rotation: [Math.PI / 2, 0, 0.3], tint: '#2a2420' })
  b.box('wood', [0.26, 0.14, 0.18], [cx + 0.45, top + 0.07, cz - 0.25], { tint: '#3e2a1e' })
  steelyard(b, r.minX + 0.2, top + 0.65, cz - 0.3, Math.PI / 2)
  b.box('wood', [0.04, 0.6, 0.04], [r.minX + 0.05, top + 0.3, cz - 0.3], { tint: wood })
  b.box('wood', [0.4, 0.04, 0.04], [r.minX + 0.2, top + 0.6, cz - 0.3], { tint: wood })
  // 帳桌上的小米斗（量給客人看）
  riceMeasure(b, detail, cx - 0.05, top, cz + 0.32, 0.09, 0.3)
  // 後方靠牆的木櫃（抽屜）與品名牌（白米、糙米、糯米）
  drawerCabinet(b, detail, { minX: IN - 0.45, maxX: IN - 0.05, minZ: r.minZ - 1.2, maxZ: r.minZ - 0.1, height: 1.6 }, { facing: -1, tint: aged ? '#4a3626' : '#5a3d29', drawers: 4 })
  ricePanel(b, 'priceBoard', 0.36, 0.6, [IN - 0.06, 2.3, cz], -Math.PI / 2)
}

/** 米桶與米斗（前店）：兩個木桶裝著白米與糙米，插著米斗與木勺 */
function riceBins(b, detail, r, aged) {
  const cz = (r.minZ + r.maxZ) / 2
  const xs = [r.minX + 0.14, r.maxX - 0.14]
  xs.forEach((x, i) => {
    b.cylinder('wood', 0.14, 0.12, 0.5, 14, [x, 0.25, cz + (i ? 0.08 : -0.08)], { tint: aged ? '#5e4430' : '#7a5636' })
    for (const y of [0.1, 0.4]) b.add('steel', new TorusGeometry(0.135, 0.008, 4, 16), { position: [x, y, cz + (i ? 0.08 : -0.08)], rotation: [Math.PI / 2, 0, 0], tint: '#3a3634' })
    b.add('plain', new IcosahedronGeometry(0.12, 1), { position: [x, 0.5, cz + (i ? 0.08 : -0.08)], scale: [1, 0.35, 1], tint: i ? '#d8c89a' : '#f1ecdc' })
  })
  riceMeasure(b, detail, r.minX + 0.14, 0.5, cz - 0.1, 0.07, 0.5)
  b.box('wood', [0.04, 0.03, 0.32], [r.maxX - 0.1, 0.56, cz + 0.05], { rotation: [0.6, 0.3, 0], tint: '#a07848' })
  // 一只大米斗放在地上
  riceMeasure(b, detail, (r.minX + r.maxX) / 2, 0.05, r.maxZ + 0.25, 0.15, 0.2)
}

function riceMillInterior(b, detail) {
  const L = MILL
  counterDesk(b, detail, L.counter, false)
  sackStack(b, L.sacks, { layers: 5, fill: 1, seed: 11, axis: 'z' })
  riceBins(b, detail, L.bins, false)
  // 碾米區：碾米機（皮帶接到天花下的天軸）、稻穀堆、竹籮與米篩、木製農具
  millMachine(b, detail, L.machine, { facing: 1, lineShaft: { x: -1.7, y: RS.ceiling1 - 0.25 }, seed: 3 })
  lineShaftRig(b, -1.7, RS.ceiling1 - 0.25, -5.6, -1.0)
  paddyHeap(b, detail, (L.heap.minX + L.heap.maxX) / 2, (L.heap.minZ + L.heap.maxZ) / 2, 0.32, 0.4, 5)
  bambooBasket(b, detail, -0.55, 0.04, -4.35, 0.16, 0.18, 12)
  bambooSieve(b, detail, -0.1, 0.5, -5.62, 0.26, { tilt: 1.35, seed: 13 })
  farmTools(b, -2.3, -2.95, { rotationY: Math.PI / 2 })
  // 右半邊：堆白米的米袋、一袋打開的白米、木製米篩與竹籮
  sackStack(b, L.whiteRice, { layers: 6, fill: 1, tint: ['#efe9dc', '#e6dcc4', '#f2ecdf'], seed: 21, axis: 'z' })
  sack(b, [L.whiteRice.minX - 0.3, 0, -3.2], { tint: '#f2ecdf', scale: 0.7, seed: 22 })
  b.add('plain', new IcosahedronGeometry(0.16, 1), { position: [L.whiteRice.minX - 0.3, 0.48, -3.2], scale: [1, 0.3, 1], tint: '#f5f1e4' })
  bambooSieve(b, detail, L.whiteRice.minX - 0.15, 0.04, -5.6, 0.25, { seed: 23 })
  bambooBasket(b, detail, L.whiteRice.minX - 0.35, 0.04, -2.75, 0.15, 0.2, 24)
  // 天井旁的米倉（後進）：兩堆疊得很高的米袋、靠在後牆的木梯、木桁架
  sackStack(b, L.granaryLeft, { layers: 8, fill: 1, seed: 31 })
  sackStack(b, L.granaryRight, { layers: 7, fill: 1, tint: ['#d8c49c', '#cdb991'], seed: 32 })
  ladder(b, L.ladder)
  trusses(b, false)
  // 裸燈泡（暖色）
  for (const z of [-1.4, -4.2, -9.2]) bareBulb(b, 0.2, RS.ceiling1 - 0.4, z, RS.ceiling1, '#3a3a36')
  // 柱上的月曆紙與牆上的米行帳簿（細部）
  ricePanel(b, 'ricePoster', 0.42, 0.56, [-IN + 0.06, 2.1, -1.0], Math.PI / 2, detail)
}

/** 木梯（靠在後牆） */
function ladder(b, r) {
  const cx = (r.minX + r.maxX) / 2
  const z = (r.minZ + r.maxZ) / 2
  const lean = 0.12
  for (const s of [-1, 1]) b.box('wood', [0.05, r.height, 0.06], [cx + s * 0.22, r.height / 2, z], { rotation: [lean, 0, 0], tint: '#7a5534' })
  for (let i = 1; i < 10; i++) {
    const y = i * 0.3
    b.box('wood', [0.44, 0.04, 0.04], [cx, y, z + Math.sin(lean) * (y - r.height / 2)], { tint: '#8a6440' })
  }
}

/** 米倉的木桁架（後進較高的天花下，斜撐與吊柱） */
function trusses(b, aged) {
  const y0 = RS.ceiling1 - 0.05
  const tint = aged ? '#33251c' : '#3b2a20'
  for (const z of [-8.6, -9.6, -10.4]) {
    b.box('wood', [IN * 2, 0.18, 0.14], [0, y0, z], { tint })
    b.box('wood', [0.12, 0.4, 0.12], [0, y0 + 0.26, z], { tint })
    for (const s of [-1, 1]) b.box('wood', [1.4, 0.1, 0.1], [s * 0.65, y0 + 0.2, z], { rotation: [0, 0, -s * 0.28], tint })
  }
}

/* ═══════════ 1945：戰後 ═══════════ */

function postwarInterior(b, detail) {
  const L = POSTWAR
  counterDesk(b, detail, L.counter, true)
  sackStack(b, L.sacks, { layers: 4, fill: 0.75, tint: ['#cdb991', '#bfa982'], seed: 41, axis: 'z' })
  millMachine(b, detail, L.machine, { facing: 1, aged: true, covered: true, seed: 3 })
  farmTools(b, -2.3, -2.6, { rotationY: Math.PI / 2, aged: true })
  sackStack(b, L.whiteRice, { layers: 3, fill: 0.8, tint: ['#e6dcc4', '#d8cdb2'], seed: 42, axis: 'z' })
  bambooSieve(b, detail, -0.6, 0.45, -5.62, 0.24, { tilt: 1.35, seed: 43 })
  // 帳桌上的收音機與熱水瓶、牆上的日曆與舊報紙
  const c = L.counter
  b.box('wood', [0.24, 0.16, 0.14], [c.maxX - 0.2, c.height + 0.08, c.minZ + 0.15], { tint: '#5a3a28' })
  b.box('plain', [0.006, 0.1, 0.1], [c.maxX - 0.32, c.height + 0.09, c.minZ + 0.15], { tint: '#c9b48a' })
  ricePanel(b, 'calendar', 0.3, 0.4, [IN - 0.06, 1.9, -2.6], -Math.PI / 2)
  // 後進：倉庫（木箱、舊米袋、空的米桶）與住家（方桌、板凳、碗櫃、電鍋、熱水瓶、碗筷）
  const sto = L.storage
  const rng = createRng(1962)
  for (let i = 0; i < 5; i++) {
    const x = sto.minX + 0.3 + (i % 3) * 0.42
    const y = Math.floor(i / 3) * 0.42
    b.box('wood', [0.4, 0.4, 0.5], [x, y + 0.2, sto.minZ + 0.35 + (rng() - 0.5) * 0.1], { rotation: [0, (rng() - 0.5) * 0.2, 0], tint: rng() < 0.5 ? '#7a5a3c' : '#6a4a30' })
  }
  sackStack(b, { minX: sto.minX, maxX: sto.maxX, minZ: sto.maxZ - 0.6, maxZ: sto.maxZ }, { layers: 1, fill: 0.8, tint: ['#bfa982'], seed: 44 })
  const ht = L.homeTable
  const hx = (ht.minX + ht.maxX) / 2
  const hz = (ht.minZ + ht.maxZ) / 2
  b.box('wood', [ht.maxX - ht.minX - 0.3, 0.04, ht.maxZ - ht.minZ - 0.3], [hx, 0.73, hz], { tint: '#6a4a30' })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.05, 0.71, 0.05], [hx + sx * 0.3, 0.355, hz + sz * 0.3], { tint: '#5a3d29' })
  for (const [dx, dz] of [
    [0, 0.48],
    [0, -0.48],
    [0.48, 0],
  ]) {
    b.box('wood', [0.32, 0.03, 0.2], [hx + dx, 0.42, hz + dz], { tint: '#7a5a3c' })
    for (const s of [-1, 1]) b.box('wood', [0.03, 0.41, 0.18], [hx + dx + s * 0.13, 0.205, hz + dz], { tint: '#6a4a30' })
  }
  // 電鍋（圓筒形的鍋身、鍋蓋與把手）、熱水瓶、碗與筷子、報紙
  b.cylinder('steel', 0.13, 0.12, 0.2, 16, [hx - 0.15, 0.85, hz - 0.1], { tint: '#c9ccc8' })
  b.cylinder('steel', 0.12, 0.13, 0.05, 16, [hx - 0.15, 0.97, hz - 0.1], { tint: '#b9bcb8' })
  b.box('steel', [0.05, 0.03, 0.03], [hx - 0.15, 1.01, hz - 0.1], { tint: '#2a2826' })
  b.cylinder('steel', 0.05, 0.05, 0.3, 12, [hx + 0.18, 0.9, hz - 0.18], { tint: '#b85a4a' })
  b.cylinder('plain', 0.03, 0.03, 0.04, 10, [hx + 0.18, 1.07, hz - 0.18], { tint: '#efe9dc' })
  for (let i = 0; i < 2; i++) b.add('plain', new LatheGeometry([[0, 0], [0.025, 0], [0.05, 0.04], [0.045, 0.045], [0, 0.01]].map(([x, y]) => new Vector2(x, y)), 12), { position: [hx + 0.05 + i * 0.12, 0.75, hz + 0.15], tint: i ? '#efe9dc' : '#e2ddd0' })
  flatPanel(b, 'newspaper', 0.32, 0.26, [hx + 0.1, 0.752, hz - 0.05], 0.3)
  // 碗櫃（紗門）
  drawerCabinet(b, detail, L.cupboard, { facing: -1, tint: '#5a4232', drawers: 2 })
  b.box('cloth', [0.02, 0.6, (L.cupboard.maxZ - L.cupboard.minZ) - 0.2], [L.cupboard.minX - 0.01, 1.35, (L.cupboard.minZ + L.cupboard.maxZ) / 2], { tint: '#8a958a' })
  trusses(b, true)
  for (const z of [-1.4, -4.2, -9.2]) bareBulb(b, 0.2, RS.ceiling1 - 0.4, z, RS.ceiling1, z < -8 ? '#e9e6dc' : null)
  // 牆上的舊報紙（糊在牆上補洞）
  ricePanel(b, 'newspaper', 0.5, 0.4, [-IN + 0.06, 1.5, -9.4], Math.PI / 2, detail)
}

/* ═══════════ 2000–現在：稻舍一樓 ═══════════ */

/** 軌道燈：天花下的黑色軌道與幾盞投射燈（暖色的燈泡） */
function trackLights(b) {
  for (const x of [-1.2, 1.2]) {
    b.box('dark', [0.04, 0.03, 4.6], [x, RS.ceiling1 - 0.02, -3.3], { tint: '#1d1b1a' })
    for (const z of [-1.6, -2.8, -4.0, -5.2]) {
      b.cylinder('dark', 0.01, 0.01, 0.08, 4, [x, RS.ceiling1 - 0.07, z], { tint: '#1d1b1a' })
      const tilt = x < 0 ? -0.5 : 0.5
      b.add('dark', new CylinderGeometry(0.04, 0.05, 0.14, 10), { position: [x, RS.ceiling1 - 0.17, z], rotation: [0, 0, tilt], tint: '#1f1d1c' })
      b.add('bulb', new CylinderGeometry(0.035, 0.035, 0.01, 10), { position: [x + Math.sin(tilt) * 0.075, RS.ceiling1 - 0.17 - Math.cos(tilt) * 0.075, z], rotation: [0, 0, tilt], tint: '#ffe2b0' })
    }
  }
}

/** 一樓的小方桌、藤編木椅與托盤套餐（每張桌子的狀態不同） */
function diningTables(b, detail) {
  const { half, height } = MODERN.table
  MODERN.tables.forEach((t, i) => {
    b.box('wood', [half * 2, 0.04, half * 2], [t.x, height - 0.02, t.z], { tint: '#3a281d' })
    b.box('wood', [half * 2 - 0.08, 0.06, half * 2 - 0.08], [t.x, height - 0.07, t.z], { tint: '#2f2118' })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.05, height - 0.04, 0.05], [t.x + sx * (half - 0.05), (height - 0.04) / 2, t.z + sz * (half - 0.05)], { tint: '#2f2118' })
    for (const side of [1, -1]) rattanChair(b, detail, t.x, 0, t.z + side * MODERN.chairOffset, side > 0 ? 0 : Math.PI, i * 2 + (side > 0 ? 0 : 1))
    if (t.state === 'empty') {
      emptyTableSet(b, t.x, height, t.z, i + 1)
      return
    }
    ;[1, -1].forEach((side, k) => {
      mealSet(b, detail, t.x, height, t.z + side * 0.17, side > 0 ? 0 : Math.PI, (t.meal ?? 0) + k, t.state, 100 + i * 10 + k)
    })
  })
}

/** 櫃台：木作的櫃台、點餐機、菜單、杯子、熱水壺、米的包裝、照片與小盆栽；後方牆上的米產品層架 */
function counter(b, detail) {
  const r = MODERN.counter
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  b.box('wood', [w, r.height - 0.05, d], [cx, (r.height - 0.05) / 2, cz], { tint: '#4a3224' })
  b.box('woodLight', [w + 0.05, 0.05, d + 0.05], [cx, r.height - 0.025, cz], { tint: '#b48a5c' })
  for (let i = 0; i < 4; i++) b.box('planks', [w / 4 - 0.04, r.height - 0.2, 0.02], [r.minX + (i + 0.5) * (w / 4), (r.height - 0.05) / 2, r.minZ - 0.005], { tint: i % 2 ? '#5a3d29' : '#553a27' })
  b.box('wood', [0.02, r.height - 0.2, d - 0.08], [r.minX - 0.005, (r.height - 0.05) / 2, cz], { tint: '#5a3d29' })
  const top = r.height
  // 點餐機（平板與底座）
  b.box('dark', [0.04, 0.08, 0.06], [r.minX + 0.35, top + 0.04, cz], { tint: '#2a2826' })
  b.box('dark', [0.02, 0.18, 0.26], [r.minX + 0.33, top + 0.14, cz], { rotation: [0, 0, 0.35], tint: '#1b1a1a' })
  b.box('plain', [0.004, 0.15, 0.22], [r.minX + 0.315, top + 0.145, cz], { rotation: [0, 0, 0.35], tint: '#e8eef0' })
  // 菜單立牌、杯子、熱水壺、紙袋包裝的米、小盆栽
  b.group([r.minX + 0.12, top, cz - 0.25], -Math.PI / 2 + 0.3, () => ricePanel(b, 'menuCard', 0.22, 0.16, [0, 0.09, 0], 0))
  for (let i = 0; i < 4; i++) teaCup(b, cx + 0.05 + (i % 2) * 0.07, top + Math.floor(i / 2) * 0.045, cz + 0.22, { flip: true, tint: i % 2 ? '#efe9dc' : '#a9cfa7' })
  b.add('steel', new LatheGeometry([[0, 0], [0.07, 0], [0.08, 0.06], [0.06, 0.16], [0.03, 0.2], [0, 0.2]].map(([x, y]) => new Vector2(x, y)), 14), { position: [cx + 0.35, top, cz - 0.15], tint: '#b9b4a8' })
  for (let i = 0; i < 3; i++) {
    b.box('plain', [0.12, 0.2, 0.08], [r.maxX - 0.15, top + 0.1, r.minZ + 0.15 + i * 0.14], { rotation: [0, (i - 1) * 0.1, 0], tint: '#c4a172' })
    ricePanel(b, 'riceLabels', 0.08, 0.1, [r.maxX - 0.21, top + 0.11, r.minZ + 0.15 + i * 0.14], -Math.PI / 2, detail)
  }
  b.cylinder('terracotta', 0.06, 0.05, 0.1, 10, [cx - 0.2, top + 0.05, cz + 0.25], { tint: '#9a5a3a' })
  b.add('plain', new IcosahedronGeometry(0.08, 1), { position: [cx - 0.2, top + 0.16, cz + 0.25], scale: [1, 0.8, 1], tint: '#6c8a5c' })
  // 後方（右牆）的米產品層架與相框
  for (let i = 0; i < 3; i++) {
    const y = 1.35 + i * 0.4
    b.box('wood', [0.28, 0.03, 1.2], [IN - 0.16, y, cz - 0.1], { tint: '#4a3224' })
    for (let k = 0; k < 5; k++) b.box('plain', [0.14, 0.2 + (k % 2) * 0.04, 0.12], [IN - 0.16, y + 0.12, cz - 0.6 + k * 0.24], { tint: k % 3 === 0 ? '#c4a172' : k % 3 === 1 ? '#efe6d2' : '#b9a06a' })
  }
  b.box('wood', [0.03, 0.34, 0.44], [IN - 0.06, 2.75, cz - 0.1], { tint: '#2b211b' })
  ricePanel(b, 'oldPhoto', 0.38, 0.28, [IN - 0.08, 2.75, cz - 0.1], -Math.PI / 2)
}

/** 雕花的舊木櫃（入口左側）與櫃上的乾燥稻穗、茶葉罐 */
function oldCabinet(b, detail) {
  const r = MODERN.cabinet
  drawerCabinet(b, detail, r, { facing: 1, tint: '#3f2a1e', carved: true, drawers: 2 })
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  b.cylinder('plain', 0.07, 0.09, 0.26, 12, [cx, r.height + 0.17, cz - 0.15], { tint: '#3a2e28' })
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    b.cylinder('plain', 0.004, 0.004, 0.5, 3, [cx + Math.cos(a) * 0.04, r.height + 0.5, cz - 0.15 + Math.sin(a) * 0.04], { rotation: [Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25], tint: '#c9a24e' })
    detail.add('plain', new IcosahedronGeometry(0.025, 0), { position: [cx + Math.cos(a) * 0.1, r.height + 0.74, cz - 0.15 + Math.sin(a) * 0.1], scale: [0.6, 2.2, 0.6], tint: '#d4ad55' })
  }
  b.cylinder('steel', 0.05, 0.05, 0.14, 12, [cx, r.height + 0.11, cz + 0.2], { tint: '#b23a2b' })
}

/** 出口旁的「老屋再生」說明板（店面線內側的牆上，木框）與牆上的乾燥稻穗、稻田海報 */
function renewalAndWall(b, detail) {
  const rb = MODERN.renewalBoard
  const cx = (rb.minX + rb.maxX) / 2
  const cy = (rb.y0 + rb.y1) / 2
  const z = -RS.wallT - 0.03
  b.box('wood', [rb.maxX - rb.minX + 0.08, rb.y1 - rb.y0 + 0.08, 0.03], [cx, cy, z + 0.01], { tint: '#2f211a' })
  ricePanel(b, 'renewalBoard', rb.maxX - rb.minX, rb.y1 - rb.y0, [cx, cy, z - 0.01], Math.PI)
  // 稻田的照片（右牆，用餐區）與掛著的乾燥稻穗
  b.box('wood', [0.03, 0.66, 0.5], [IN - 0.06, 1.7, -3.3], { tint: '#2b211b' })
  ricePanel(b, 'ricePoster', 0.44, 0.6, [IN - 0.08, 1.7, -3.3], -Math.PI / 2)
  for (let i = 0; i < 7; i++) {
    b.cylinder('plain', 0.004, 0.004, 0.6, 3, [IN - 0.1, 1.95 - i * 0.01, -4.6 + (i - 3) * 0.03], { rotation: [(i - 3) * 0.06, 0, 0], tint: '#c9a24e' })
    detail.add('plain', new IcosahedronGeometry(0.03, 0), { position: [IN - 0.1, 1.62, -4.6 + (i - 3) * 0.05], scale: [0.6, 2.4, 0.6], tint: '#d4ad55' })
  }
  b.cylinder('cloth', 0.02, 0.02, 0.06, 6, [IN - 0.1, 2.25, -4.6], { tint: '#b3282a' })
  // 用餐區的長條木格窗（左牆上方，看得到展示區的木架上緣）——簡化成木格柵
  for (let i = 0; i < 6; i++) b.box('wood', [0.03, 0.03, 2.2], [-IN + 0.06, 2.9 + (i % 2) * 0.01, -2.8], { tint: '#3a281d' })
}

/** 後段：舊碾米機（展示）、出菜的木櫃台、廚房的門簾 */
function backSpace(b, detail) {
  millMachine(b, detail, MODERN.mill, { facing: -1, seed: 7 })
  b.box('plain', [0.24, 0.16, 0.004], [MODERN.mill.minX - 0.12, 0.9, MODERN.mill.maxZ + 0.02], { rotation: [0, 0, 0], tint: '#f4efe2' })
  const p = MODERN.pass
  const px = (p.minX + p.maxX) / 2
  const pz = (p.minZ + p.maxZ) / 2
  b.box('wood', [p.maxX - p.minX, p.height - 0.05, p.maxZ - p.minZ], [px, (p.height - 0.05) / 2, pz], { tint: '#4a3224' })
  b.box('woodLight', [p.maxX - p.minX + 0.04, 0.05, p.maxZ - p.minZ + 0.04], [px, p.height - 0.025, pz], { tint: '#b48a5c' })
  for (let i = 0; i < 3; i++) b.box('woodLight', [0.42, 0.012, 0.3], [p.minX + 0.3 + i * 0.05, p.height + 0.006 + i * 0.014, pz], { tint: '#d6b382' })
  b.cylinder('steel', 0.12, 0.11, 0.16, 14, [p.maxX - 0.2, p.height + 0.08, pz], { tint: '#b9b4a8' })
  // 廚房的門（左牆後方）與藍染的門簾
  b.box('dark', [0.04, 2.2, 0.9], [-IN + 0.05, 1.1, -9.3], { tint: '#2a2420' })
  for (let i = 0; i < 3; i++) b.box('cloth', [0.02, 0.9, 0.28], [-IN + 0.08, 1.7, -9.3 + (i - 1) * 0.3], { tint: '#2f4b6e' })
  // 後段的吊燈
  bareBulb(b, -0.4, 2.6, -8.9, RS.ceiling1, '#d8b080')
  bareBulb(b, 0.95, 2.5, -9.85 + 1.0, RS.ceiling1, '#d8b080')
}

function modernInterior(b, detail) {
  trackLights(b)
  diningTables(b, detail)
  counter(b, detail)
  oldCabinet(b, detail)
  renewalAndWall(b, detail)
  exhibitShelf(b, detail)
  husker(b, detail)
  wallHangings(b, detail)
  measureStand(b, detail)
  // 展示區的小說明卡（木架下）
  b.box('plain', [0.003, 0.12, 0.18], [MODERN.shelf.maxX + 0.01, 0.62, -1.75], { tint: '#f4efe2' })
  backSpace(b, detail)
  buildRiceSecondFloor(b, detail)
}

/* ═══════════ 主程式 ═══════════ */

export function buildRiceAndShineInterior(b, config = {}, detail = b) {
  const variant = config.variant ?? 'riceMill'
  if (variant === 'earlyRiceTrade' || !STYLE[variant]) return
  shellFinishes(b, detail, variant)
  if (variant === 'riceMill') riceMillInterior(b, detail)
  else if (variant === 'postwarRiceHouse') postwarInterior(b, detail)
  else modernInterior(b, detail)
}
