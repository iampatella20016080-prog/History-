import { CylinderGeometry, IcosahedronGeometry, Shape, TorusGeometry } from 'three'
import { MODERN, RS } from '../../../data/riceAndShineLayout.js'
import { createRng } from '../../utils/random.js'
import { shade } from '../props.js'
import { ricePanel } from './riceAndShineExterior.js'
import { teaCup } from './riceMealProps.js'

/**
 * 稻舍的木樓梯與二樓（RiceAndShineSecondFloor；只有 2000–現在）
 *
 * 後進的木樓梯沿著後牆往 +x 爬升（踏板、踢板、斜樑、扶手與欄杆），上面是樓梯井與平台；
 * 平台接天井旁的過廊（木地板、木欄杆，可以往下看天井），過廊的門通到臨街的前進：
 * 木地板、兩側的紅磚牆、深色木梁與木板天花、三扇大窗（窗內是日光）、兩張長木桌與藤編木椅、
 * 書架、圓几與電扇、講座用的投影幕、牆上的《南街殷賑》說明板（原創線條示意，非原作圖像）。
 */
const F2 = RS.floor2
const IN = RS.half - RS.wallT
const BRICK = '#a65a44'
const FLOOR = '#7a5638'
const BEAM = '#3a2a20'
const BOARD = '#5a4030'

/** 藤編木椅：深色木框、座面、藤編的椅背（細部有藤編的紋路）。椅背在本地 +z，坐的人面向 -z */
export function rattanChair(b, detail, x, y, z, rotationY = 0, seed = 1) {
  const rng = createRng(seed)
  const frame = rng() < 0.5 ? '#3a281d' : '#45301f'
  const ry = rotationY + (rng() - 0.5) * 0.12
  b.push([x, y, z], ry)
  if (detail !== b) detail.push([x, y, z], ry)
  const s = 0.2
  for (const [lx, lz] of [
    [-s, -s],
    [s, -s],
  ]) b.box('wood', [0.035, 0.44, 0.035], [lx, 0.22, lz], { tint: frame })
  for (const lx of [-s, s]) b.box('wood', [0.035, 0.92, 0.035], [lx, 0.46, s], { rotation: [-0.06, 0, 0], tint: frame })
  b.box('wood', [0.44, 0.04, 0.44], [0, 0.45, 0], { tint: shade(frame, 1.15) })
  b.box('bamboo', [0.38, 0.012, 0.38], [0, 0.476, 0], { tint: '#c49a5e' })
  for (const lz of [-s, s]) b.box('wood', [0.4, 0.025, 0.025], [0, 0.15, lz], { tint: frame })
  // 椅背：上橫木（略彎）與藤編面板
  b.box('wood', [0.44, 0.05, 0.035], [0, 0.9, s + 0.03], { rotation: [-0.06, 0, 0], tint: frame })
  b.box('bamboo', [0.36, 0.3, 0.012], [0, 0.7, s + 0.015], { rotation: [-0.06, 0, 0], tint: '#c9a46a' })
  b.box('wood', [0.4, 0.025, 0.03], [0, 0.54, s + 0.01], { tint: frame })
  for (let i = 0; i < 6; i++) detail.box('bamboo', [0.36, 0.006, 0.006], [0, 0.58 + i * 0.045, s + 0.024 - i * 0.003], { tint: '#a8804a' })
  for (let i = 0; i < 7; i++) detail.box('bamboo', [0.006, 0.3, 0.006], [-0.15 + i * 0.05, 0.7, s + 0.024], { rotation: [-0.06, 0, 0], tint: '#b48c55' })
  if (detail !== b) detail.pop()
  b.pop()
}

/* ═══════════ 木樓梯、樓梯井、平台 ═══════════ */

function stair(b, detail) {
  const { stair: st, landing, back } = RS
  const steps = 18
  const run = (st.toX - st.fromX) / steps
  const rise = F2 / steps
  const depth = st.maxZ - st.minZ
  const cz = (st.minZ + st.maxZ) / 2
  for (let i = 0; i < steps; i++) {
    const x = st.fromX + (i + 0.5) * run
    const top = (i + 1) * rise
    b.box('planks', [run + 0.03, 0.04, depth], [x, top - 0.02, cz], { tint: i % 2 ? '#6e4a2f' : '#744e31' })
    b.box('wood', [0.025, rise, depth - 0.04], [x - run / 2 + 0.012, top - rise / 2 - 0.02, cz], { tint: '#4a3224' })
    // 踏板前緣的磨損（顏色較淺）
    detail.box('wood', [0.04, 0.006, depth * 0.5], [x - run / 2 + 0.03, top + 0.002, cz + 0.05], { tint: '#8e6a46' })
  }
  // 斜樑（兩側）與樓梯下方的木板
  const len = Math.hypot(st.toX - st.fromX, F2)
  const ang = Math.atan2(F2, st.toX - st.fromX)
  const mx = (st.fromX + st.toX) / 2
  for (const z of [st.minZ + 0.03, st.maxZ - 0.03]) b.box('wood', [len, 0.26, 0.06], [mx, F2 / 2 - 0.08, z], { rotation: [0, 0, ang], tint: '#3f2b1f' })
  b.box('planks', [len, 0.02, depth], [mx + 0.05, F2 / 2 - 0.2, cz], { rotation: [0, 0, ang], tint: '#4f3726' })
  // 扶手與欄杆（樓梯開放的一側，z = st.maxZ）
  const rz = st.maxZ + 0.03
  b.box('wood', [len, 0.06, 0.06], [mx, F2 / 2 + 0.9, rz], { rotation: [0, 0, ang], tint: '#3a281d' })
  for (let i = 0; i <= steps; i += 2) {
    const x = st.fromX + i * run
    const y = i * rise
    b.box('wood', [0.035, 0.9, 0.035], [x, y + 0.45, rz], { tint: '#45301f' })
  }
  b.box('wood', [0.08, 1.1, 0.08], [st.fromX, 0.55, rz], { tint: '#3a281d' })
  // 樓梯井：上方二樓的封閉房間（儲藏室）的牆與天花
  const wallZ = st.maxZ + 0.08
  b.box('brick', [landing.minX - 0.05 + IN, RS.ceiling2 - F2 + 0.2, 0.08], [(-IN + landing.minX - 0.05) / 2, (F2 + RS.ceiling2) / 2, wallZ + 0.04], { tint: BRICK })
  b.box('brick', [0.08, RS.ceiling2 - F2, back.maxZ - wallZ], [landing.minX - 0.05 - 0.04, (F2 + RS.ceiling2) / 2, (wallZ + back.maxZ) / 2], { tint: BRICK })
  // 儲藏室的木門（關著）
  b.box('wood', [0.04, 2.0, 0.8], [landing.minX - 0.07, F2 + 1.0, -8.9], { tint: '#5a3d29' })
  b.box('steel', [0.03, 0.03, 0.1], [landing.minX - 0.04, F2 + 1.0, -8.65], { tint: '#b39a5a' })
  // 一樓天花在樓梯上方的開口邊緣（木樑）與樓梯井的天花
  b.box('wood', [landing.minX + IN, 0.3, 0.12], [(-IN + landing.minX) / 2, RS.ceiling1 + 0.15, wallZ - 0.02], { tint: BEAM })
  b.box('planks', [IN * 2, 0.04, wallZ - back.minZ], [0, RS.ceiling2 + 0.02, (wallZ + back.minZ) / 2], { tint: BOARD })
  b.box('planks', [IN - landing.minX, 0.04, back.maxZ - wallZ], [(IN + landing.minX) / 2, RS.ceiling2 + 0.02, (wallZ + back.maxZ) / 2], { tint: BOARD })
  // 平台的樓板（樓梯那一段從樓梯頂端開始，其餘從平台的西緣開始）
  b.box('planks', [IN - st.toX, 0.2, st.maxZ - back.minZ], [(IN + st.toX) / 2, F2 - 0.1, (st.maxZ + back.minZ) / 2], { tint: FLOOR })
  b.box('planks', [IN - landing.minX, 0.2, back.maxZ - st.maxZ], [(IN + landing.minX) / 2, F2 - 0.1, (back.maxZ + st.maxZ) / 2], { tint: FLOOR })
  // 樓梯井兩側（後牆、右牆）在二樓的紅磚面
  b.box('brick', [IN * 2, RS.ceiling2 - F2 + 0.6, 0.03], [0, (F2 - 0.6 + RS.ceiling2) / 2, back.minZ + 0.015], { tint: shade(BRICK, 0.95), grime: 0.1 })
  b.box('brick', [0.03, RS.ceiling2, back.maxZ - back.minZ], [IN - 0.015, RS.ceiling2 / 2, (back.minZ + back.maxZ) / 2], { tint: shade(BRICK, 0.97) })
  // 平台上的小窗（後牆高處，透進來的光）與吊燈
  b.box('plain', [0.6, 0.5, 0.01], [2.0, F2 + 1.8, back.minZ + 0.035], { tint: '#e8eff0' })
  b.box('wood', [0.7, 0.06, 0.05], [2.0, F2 + 1.52, back.minZ + 0.05], { tint: '#5a3d29' })
  b.box('wood', [0.03, 0.5, 0.04], [2.0, F2 + 1.8, back.minZ + 0.05], { tint: '#5a3d29' })
}

/* ═══════════ 天井旁的過廊 ═══════════ */

function corridor(b, detail) {
  const { corridor: c, courtyard } = RS
  const z0 = courtyard.minZ - 0.2
  const z1 = courtyard.maxZ + 0.2
  // 木樓板（下方的樑從天井看得到）
  b.box('planks', [IN - c.minX + 0.08, 0.06, z1 - z0], [(IN + c.minX - 0.08) / 2, F2 - 0.03, (z0 + z1) / 2], { tint: FLOOR })
  b.box('wood', [IN - c.minX + 0.08, 0.2, z1 - z0], [(IN + c.minX - 0.08) / 2, F2 - 0.16, (z0 + z1) / 2], { tint: '#4a3224' })
  for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3]) b.box('wood', [IN - c.minX + 0.1, 0.2, 0.1], [(IN + c.minX - 0.1) / 2, F2 - 0.36, z], { tint: BEAM })
  // 支撐的木柱（立在天井裡、靠牆）
  b.box('wood', [0.12, F2 - 0.26, 0.12], [c.minX + 0.02, (F2 - 0.26) / 2, z0 + 0.12], { tint: '#4a3224' })
  // 欄杆：扶手、橫木與直欄
  const rx = c.minX - 0.04
  b.box('wood', [0.07, 0.06, z1 - z0], [rx, F2 + 1.0, (z0 + z1) / 2], { tint: '#3a281d' })
  b.box('wood', [0.05, 0.04, z1 - z0], [rx, F2 + 0.12, (z0 + z1) / 2], { tint: '#3a281d' })
  const n = 16
  for (let i = 0; i <= n; i++) b.box('wood', [0.03, 0.88, 0.03], [rx, F2 + 0.56, z0 + (i / n) * (z1 - z0)], { tint: '#45301f' })
  // 過廊上的小盆栽與牆上的小燈
  b.cylinder('terracotta', 0.12, 0.09, 0.22, 10, [IN - 0.2, F2 + 0.11, -6.4], { tint: '#9a5a3a' })
  b.add('plain', new IcosahedronGeometry(0.16, 1), { position: [IN - 0.2, F2 + 0.36, -6.4], scale: [1, 0.8, 1], tint: '#6c8a5c' })
  b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [IN - 0.08, F2 + 2.1, -6.9], tint: '#ffe2b0' })
  b.box('steel', [0.08, 0.12, 0.08], [IN - 0.04, F2 + 2.2, -6.9], { tint: '#2a2826' })
  void detail
}

/* ═══════════ 臨街的前進（二樓） ═══════════ */

/** 窗內側的日光面（矩形加上弧形的拱，與立面的窗相同）與窗框、窗台 */
function windowLight(b, win) {
  const { sill, windowSpring, pierZ } = RS
  const ww = win.w + 0.16
  const r = ww / 2 - 0.06
  const rise = ww * 0.22
  const R = (r * r + rise * rise) / (2 * rise)
  const cy = windowSpring + rise - R
  const a = Math.atan2(windowSpring - cy, r)
  const shape = new Shape()
  shape.moveTo(win.x - r, sill)
  shape.lineTo(win.x + r, sill)
  shape.lineTo(win.x + r, windowSpring)
  shape.absarc(win.x, cy, R, a, Math.PI - a, false)
  shape.lineTo(win.x - r, sill)
  const z = pierZ[0] - 0.02
  b.extrude('plain', shape, 0.01, { position: [0, 0, z], tint: '#e6eff0', curveSegments: 10 })
  // 窗框與窗櫺（室內側）
  const h = windowSpring - sill
  for (const s of [-1, 1]) b.box('wood', [0.07, h, 0.06], [win.x + s * r, sill + h / 2, z - 0.02], { tint: '#6e4a2f' })
  b.box('wood', [ww + 0.1, 0.05, 0.22], [win.x, sill - 0.02, z - 0.08], { tint: '#5a3d29' })
  b.box('wood', [ww, 0.05, 0.06], [win.x, windowSpring, z - 0.02], { tint: '#6e4a2f' })
  const bars = win.x === 0 ? 3 : 1
  for (let i = 1; i <= bars; i++) b.box('wood', [0.035, h, 0.04], [win.x - r + (i * 2 * r) / (bars + 1), sill + h / 2, z - 0.02], { tint: '#6e4a2f' })
  b.box('wood', [2 * r, 0.035, 0.04], [win.x, sill + h * 0.55, z - 0.02], { tint: '#6e4a2f' })
}

function upstairsRoom(b, detail) {
  const u = RS.upstairs
  const front = RS.pierZ[0]
  const len = front - u.minZ
  const cz = (front + u.minZ) / 2
  // 木地板（長條木板、深淺不一）
  b.box('planks', [IN * 2, 0.04, len], [0, F2 + 0.0, cz], { tint: FLOOR })
  const rng = createRng(2014)
  for (let i = 0; i < 10; i++) detail.box('planks', [0.12 + rng() * 0.1, 0.004, 0.6 + rng() * 1.2], [-IN + 0.3 + rng() * (IN * 2 - 0.6), F2 + 0.022, u.minZ + 0.5 + rng() * (len - 1)], { tint: rng() < 0.5 ? '#6a4a30' : '#8a6444' })
  // 兩側的紅磚牆（保留色差與補過的地方）、靠街的立面內側、後方的牆（過廊的門洞）
  for (const s of [-1, 1]) b.box('brick', [0.03, RS.ceiling2 - F2, len], [s * (IN - 0.015), (F2 + RS.ceiling2) / 2, cz], { tint: s < 0 ? BRICK : shade(BRICK, 0.96), grime: 0.08 })
  for (let i = 0; i < 9; i++) {
    const s = rng() < 0.5 ? -1 : 1
    b.box('brick', [0.006, 0.12 + rng() * 0.25, 0.3 + rng() * 0.5], [s * (IN - 0.032), F2 + 0.4 + rng() * 2.2, u.minZ + 0.4 + rng() * (len - 0.8)], { tint: rng() < 0.5 ? '#8a4a38' : '#c07a60' })
  }
  const bz = u.minZ + 0.015
  const door = RS.corridor
  b.box('brick', [door.minX - 0.02 + IN, RS.ceiling2 - F2, 0.03], [(-IN + door.minX - 0.02) / 2, (F2 + RS.ceiling2) / 2, bz], { tint: shade(BRICK, 0.94) })
  b.box('brick', [IN - door.minX + 0.02, RS.ceiling2 - F2 - 2.3, 0.03], [(IN + door.minX - 0.02) / 2, (F2 + 2.3 + RS.ceiling2) / 2, bz], { tint: shade(BRICK, 0.94) })
  b.box('wood', [IN - door.minX + 0.1, 0.1, 0.24], [(IN + door.minX) / 2, F2 + 2.35, u.minZ - 0.1], { tint: BEAM })
  b.box('wood', [0.08, 2.3, 0.24], [door.minX - 0.06, F2 + 1.15, u.minZ - 0.1], { tint: BEAM })
  // 立面的內側（窗以外的牆）：窗下的牆與窗間的磚柱
  b.box('brick', [IN * 2, RS.sill - F2, 0.03], [0, (F2 + RS.sill) / 2, front - 0.015], { tint: shade(BRICK, 0.92) })
  const edges = [-IN, ...RS.windows.flatMap((w) => [w.x - w.w / 2 - 0.02, w.x + w.w / 2 + 0.02]), IN]
  for (let i = 0; i < 4; i++) b.box('brick', [edges[i * 2 + 1] - edges[i * 2], RS.ceiling2 - RS.sill, 0.03], [(edges[i * 2] + edges[i * 2 + 1]) / 2, (RS.sill + RS.ceiling2) / 2, front - 0.015], { tint: shade(BRICK, 0.92) })
  for (const win of RS.windows) {
    b.box('brick', [win.w + 0.04, RS.ceiling2 - RS.windowSpring - 0.25, 0.03], [win.x, (RS.windowSpring + 0.25 + RS.ceiling2) / 2, front - 0.015], { tint: shade(BRICK, 0.92) })
    windowLight(b, win)
  }
  // 深色木梁與木板天花
  b.box('planks', [IN * 2, 0.04, len], [0, RS.ceiling2 + 0.02, cz], { tint: BOARD })
  for (let z = front - 0.5; z > u.minZ + 0.2; z -= 0.95) b.box('wood', [IN * 2, 0.22, 0.15], [0, RS.ceiling2 - 0.11, z], { tint: shade(BEAM, 0.95 + ((z * 7) % 1) * 0.1) })
  // 吊燈（暖黃的燈罩）
  for (const [x, z] of [
    [-1.3, -2.1],
    [0.8, -1.9],
    [-0.4, -4.4],
  ]) {
    b.cylinder('dark', 0.006, 0.006, 0.7, 4, [x, RS.ceiling2 - 0.35, z], { tint: '#1d1b1a' })
    b.add('woodLight', new CylinderGeometry(0.08, 0.2, 0.18, 14, 1, true), { position: [x, RS.ceiling2 - 0.78, z], tint: '#d8b080' })
    b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, RS.ceiling2 - 0.84, z], tint: '#ffe2b0' })
  }
  // 兩張長木桌與藤編木椅
  const top = F2 + 0.76
  for (const t of MODERN.longTables) {
    const cx = (t.minX + t.maxX) / 2
    const tcz = (t.minZ + t.maxZ) / 2
    const w = t.maxX - t.minX
    const d = t.maxZ - t.minZ
    b.box('wood', [w, 0.05, d], [cx, top - 0.025, tcz], { tint: '#3f2b1f' })
    b.box('wood', [w - 0.1, 0.08, d - 0.2], [cx, top - 0.09, tcz], { tint: '#33241a' })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, 0.71, 0.06], [cx + sx * (w / 2 - 0.06), F2 + 0.355, tcz + sz * (d / 2 - 0.1)], { tint: '#33241a' })
    for (const chairX of t.chairs) {
      const n = Math.max(2, Math.floor(d / 0.62))
      for (let i = 0; i < n; i++) {
        const z = t.minZ + (i + 0.5) * (d / n)
        rattanChair(b, detail, chairX, F2, z, chairX < cx ? -Math.PI / 2 : Math.PI / 2, i + chairX * 10)
      }
    }
    // 桌上：茶杯、書、筆記本、小花瓶、講座的傳單
    const r2 = createRng(t.id.length * 17 + d * 10)
    for (let i = 0; i < 3; i++) teaCup(b, cx + (r2() - 0.5) * 0.3, top, t.minZ + 0.4 + i * (d / 3), { level: r2() < 0.5 ? 0 : 0.6, tint: i % 2 ? '#3c5f86' : '#efe9dc' })
    b.box('plain', [0.2, 0.03, 0.15], [cx - 0.1, top + 0.015, tcz + 0.2], { rotation: [0, 0.2, 0], tint: '#3f5a6e' })
    b.box('plain', [0.18, 0.004, 0.24], [cx + 0.12, top + 0.002, tcz - 0.3], { rotation: [0, -0.15, 0], tint: '#efe6d2' })
    b.cylinder('plain', 0.03, 0.04, 0.14, 10, [cx, top + 0.07, tcz], { tint: '#a9cfa7' })
    for (let i = 0; i < 5; i++) detail.cylinder('plain', 0.003, 0.003, 0.24, 3, [cx + (i - 2) * 0.01, top + 0.24, tcz], { rotation: [0, 0, (i - 2) * 0.12], tint: '#c9a24e' })
  }
  // 書架（左牆後方）
  const bs = MODERN.bookshelf
  const bx = (bs.minX + bs.maxX) / 2
  const bzc = (bs.minZ + bs.maxZ) / 2
  b.box('wood', [bs.maxX - bs.minX, bs.height, 0.04], [bx, F2 + bs.height / 2, bs.minZ + 0.02], { tint: '#3e2a1e' })
  b.box('wood', [bs.maxX - bs.minX, bs.height, 0.04], [bx, F2 + bs.height / 2, bs.maxZ - 0.02], { tint: '#3e2a1e' })
  for (let i = 0; i < 5; i++) {
    const y = F2 + 0.1 + i * 0.5
    b.box('wood', [bs.maxX - bs.minX, 0.03, bs.maxZ - bs.minZ], [bx, y, bzc], { tint: '#4a3224' })
    if (i < 4) ricePanel(b, 'books', bs.maxZ - bs.minZ - 0.12, 0.36, [bs.maxX - 0.04, y + 0.2, bzc + (i % 2 ? 0.04 : -0.03)], Math.PI / 2)
  }
  // 圓几、電扇與茶壺（臨街的窗邊）
  const rt = MODERN.roundTable
  b.cylinder('wood', rt.r, rt.r, 0.04, 20, [rt.x, F2 + 0.62, rt.z], { tint: '#3f2b1f' })
  b.cylinder('wood', 0.04, 0.05, 0.6, 8, [rt.x, F2 + 0.3, rt.z], { tint: '#33241a' })
  b.cylinder('wood', 0.22, 0.24, 0.03, 14, [rt.x, F2 + 0.015, rt.z], { tint: '#33241a' })
  const fy = F2 + 0.64
  b.cylinder('steel', 0.08, 0.1, 0.03, 12, [rt.x - 0.08, fy + 0.015, rt.z], { tint: '#3e6e6a' })
  b.cylinder('steel', 0.015, 0.015, 0.26, 6, [rt.x - 0.08, fy + 0.15, rt.z], { tint: '#3e6e6a' })
  b.add('steel', new TorusGeometry(0.13, 0.008, 4, 18), { position: [rt.x - 0.08, fy + 0.36, rt.z], rotation: [0, -0.6, 0], tint: '#c9c6bc' })
  for (let i = 0; i < 3; i++) b.box('plain', [0.11, 0.004, 0.05], [rt.x - 0.08, fy + 0.36, rt.z], { rotation: [0, -0.6, (i / 3) * Math.PI * 2], tint: '#3e6e6a' })
  b.add('plain', new IcosahedronGeometry(0.07, 1), { position: [rt.x + 0.14, fy + 0.07, rt.z - 0.06], scale: [1, 0.8, 1], tint: '#5a3a28' })
  // 講座用的投影幕（後方牆上，捲起一半）與投影機
  const sc = MODERN.screen
  b.box('steel', [sc.maxX - sc.minX + 0.12, 0.08, 0.08], [(sc.minX + sc.maxX) / 2, F2 + sc.y1 + 0.05, u.minZ + 0.08], { tint: '#2a2826' })
  b.box('plain', [sc.maxX - sc.minX, sc.y1 - sc.y0, 0.01], [(sc.minX + sc.maxX) / 2, F2 + (sc.y0 + sc.y1) / 2, u.minZ + 0.07], { tint: '#f1efe8' })
  b.box('dark', [sc.maxX - sc.minX, 0.03, 0.03], [(sc.minX + sc.maxX) / 2, F2 + sc.y0, u.minZ + 0.08], { tint: '#1d1b1a' })
  const t2 = MODERN.longTables[1]
  b.box('steel', [0.22, 0.08, 0.16], [(t2.minX + t2.maxX) / 2, top + 0.04, t2.minZ + 0.25], { tint: '#d9d6cf' })
  b.cylinder('dark', 0.03, 0.03, 0.02, 10, [(t2.minX + t2.maxX) / 2, top + 0.04, t2.minZ + 0.16], { rotation: [Math.PI / 2, 0, 0], tint: '#1d1b1a' })
  // 《南街殷賑》說明板（右牆）：深色木框、說明板與小展示台
  const nb = MODERN.nanjieBoard
  const nz = (nb.minZ + nb.maxZ) / 2
  b.box('wood', [0.04, nb.y1 - nb.y0 + 0.1, nb.maxZ - nb.minZ + 0.1], [IN - 0.05, F2 + (nb.y0 + nb.y1) / 2, nz], { tint: '#2f211a' })
  ricePanel(b, 'nanjieBoard', nb.maxZ - nb.minZ, nb.y1 - nb.y0, [IN - 0.075, F2 + (nb.y0 + nb.y1) / 2, nz], -Math.PI / 2)
  const st = MODERN.nanjieStand
  const sx = (st.minX + st.maxX) / 2
  b.box('wood', [st.maxX - st.minX, 0.04, st.maxZ - st.minZ], [sx, F2 + st.height - 0.02, nz], { tint: '#3a281d' })
  for (const dz of [-0.42, 0.42]) b.box('wood', [0.04, st.height - 0.04, 0.04], [st.minX + 0.04, F2 + (st.height - 0.04) / 2, nz + dz], { tint: '#33241a' })
  b.box('plain', [0.16, 0.12, 0.004], [sx, F2 + st.height + 0.07, nz - 0.2], { rotation: [-0.4, -Math.PI / 2, 0], tint: '#f4efe2' })
  b.box('plain', [0.12, 0.03, 0.2], [sx, F2 + st.height + 0.015, nz + 0.2], { tint: '#7a3a2f' })
}

/** 2000–現在：樓梯、過廊與二樓 */
export function buildRiceSecondFloor(b, detail) {
  stair(b, detail)
  corridor(b, detail)
  upstairsRoom(b, detail)
}
