import { ConeGeometry, CylinderGeometry, IcosahedronGeometry, LatheGeometry, Shape, TorusGeometry, Vector2 } from 'three'
import { MUSEUM as M, museumBannerEdge, museumBenches, museumChairs } from '../../data/huangYujieLayout.js'
import { createRng } from '../utils/random.js'
import { exhibitPanel } from './huangYujieExterior.js'

/**
 * 黃玉階文史館的一樓展間（HuangYujieInterior；按需載入）
 *
 * 老屋文史空間，不是白盒子展館、也不是咖啡廳：深色外露的木梁（色差、泛白與修補的金屬構件）與木板天花、
 * 米白牆面與淺綠色的老窗框、暖黃的吊燈；左牆是黃玉階的人物展示與「日治初期大稻埕的初等教育發展」大型展板，
 * 中央是可以坐下聽導覽的深色長木桌與長板凳，右牆是高到天花的深色木製層架（雕花托架、牛皮紙包裝、提籃、陶甕、
 * 茶具、便當提盒、書籍、舊式電視、玻璃燈具…），右前方是醬缸與商號陳列，後方是「學貫中西」匾額、小展桌與茶席，
 * 天花下掛著米白布面、紅色紋樣的大型布旗與「源珍」小布旗。
 * 只產生幾何；文字招牌、燈火、遮擋方塊與碰撞在 huangYujieExterior.js（街景資料的一部分）。
 * 器物與擺設是依照片簡化的示意，不是館藏的複製；細小的擺飾放在 detail（精緻模式才顯示），
 * 兩種畫質都保留木梁、醬缸、展板、長桌與層架的主要物件。
 */
const R = M.room
// 牆面裝修（在展間外殼的暗色牆內側一點，不會互相閃爍）
const WALL_L = R.minX + 0.03
const WALL_R = R.maxX - 0.03
const WALL_B = R.minZ + 0.03
const PLASTER = '#e8e1d0'
const DARK_WOOD = '#3f2b1f'
const SHELF_WOOD = '#4a3224'
const BEAM = '#3b2a22'

const JAR_PROFILE = [
  [0, 0],
  [0.6, 0],
  [0.82, 0.1],
  [0.97, 0.32],
  [1.0, 0.52],
  [0.92, 0.76],
  [0.7, 0.9],
  [0.6, 0.95],
  [0.64, 1.0],
  [0, 1.0],
].map(([x, y]) => new Vector2(x, y))

const POT_PROFILE = [
  [0, 0],
  [0.7, 0],
  [0.95, 0.25],
  [1.0, 0.5],
  [0.85, 0.82],
  [0.5, 0.95],
  [0.55, 1.0],
  [0, 1.0],
].map(([x, y]) => new Vector2(x, y))

const KETTLE_PROFILE = [
  [0, 0],
  [0.8, 0],
  [1.0, 0.35],
  [0.92, 0.7],
  [0.55, 0.92],
  [0.3, 1.0],
  [0, 1.0],
].map(([x, y]) => new Vector2(x, y))

/** 旋轉成形的器物（輪廓為單位大小，以 r、h 縮放） */
function lathe(b, material, profile, x, y, z, r, h, tint, segments = 12) {
  return b.add(material, new LatheGeometry(profile, segments), { position: [x, y, z], scale: [r, h, r], tint })
}

/* ── 地坪、牆面與天花 ─────────────────────── */

function finishes(b) {
  const w = R.maxX - R.minX
  const d = R.maxZ - R.minZ
  const cz = (R.minZ + R.maxZ) / 2
  const top = M.boards
  // 灰綠色的洗石子地坪
  b.box('granite', [w, 0.02, d], [0, 0.035, cz], { tint: '#8f9189' })
  // 左牆前段（人物展示）是木板牆，其餘是米白灰泥牆；前牆內側也是木板
  const pw = M.portraitWall
  b.box('planks', [0.02, top, R.maxZ - pw.minZ + 0.05], [WALL_L, top / 2, (R.maxZ + pw.minZ - 0.05) / 2], { tint: '#6e4a31' })
  b.box('plaster', [0.02, top, pw.minZ - R.minZ - 0.05], [WALL_L, top / 2, (pw.minZ - 0.05 + R.minZ) / 2], { tint: PLASTER, grime: 0.12 })
  b.box('plaster', [0.02, top, d], [WALL_R, top / 2, cz], { tint: PLASTER, grime: 0.12 })
  b.box('plaster', [w, top, 0.02], [0, top / 2, WALL_B], { tint: '#ebe7dc', grime: 0.1 })
  // 前牆內側的木板（大門的位置留空）
  const { door } = M
  for (const [x0, x1] of [
    [R.minX, door.minX],
    [door.maxX, R.maxX],
  ]) {
    b.box('planks', [x1 - x0, top, 0.02], [(x0 + x1) / 2, top / 2, R.maxZ - 0.03], { tint: '#6e4a31' })
  }
  b.box('planks', [door.maxX - door.minX, top - door.height, 0.02], [0, (door.height + top) / 2, R.maxZ - 0.03], { tint: '#6e4a31' })
  // 斑駁的牆面（顏色深淺不一的補土）
  const rng = createRng(1897)
  for (let i = 0; i < 7; i++) {
    const z = R.minZ + 0.6 + rng() * (d - 1.2)
    b.box('plaster', [0.008, 0.25 + rng() * 0.5, 0.3 + rng() * 0.6], [WALL_R - 0.012, 2.6 + rng() * 0.35, z], { tint: rng() < 0.5 ? '#d9d0bd' : '#f2ede2' })
  }
  for (const [x, y, sw, sh] of [
    [-1.6, 2.8, 0.5, 0.3],
    [1.7, 0.6, 0.4, 0.5],
    [-0.9, 0.4, 0.6, 0.3],
  ]) {
    b.box('plaster', [sw, sh, 0.008], [x, y, WALL_B + 0.012], { tint: '#ddd5c4' })
  }
  // 裸露的管線：沿著右牆與後牆上緣，接到開關盒
  b.cylinder('steel', 0.016, 0.016, d - 0.4, 6, [WALL_R - 0.04, 2.9, cz], { rotation: [Math.PI / 2, 0, 0], tint: '#c9c8c2' })
  b.cylinder('steel', 0.016, 0.016, w - 0.6, 6, [0.1, 2.9, WALL_B + 0.04], { rotation: [0, 0, Math.PI / 2], tint: '#c9c8c2' })
  b.cylinder('steel', 0.016, 0.016, 1.5, 6, [-1.75, 2.15, WALL_B + 0.04], { tint: '#c9c8c2' })
  b.box('plain', [0.1, 0.14, 0.04], [-1.75, 1.35, WALL_B + 0.03], { tint: '#efeee8' })
}

/** 木梁天花：三道方形大梁、架在上面的圓木小梁與木板；色差、泛白、修補的木料與金屬固定構件 */
function ceiling(b) {
  const w = R.maxX - R.minX
  const d = R.maxZ - R.minZ
  const cz = (R.minZ + R.maxZ) / 2
  const y0 = M.ceiling
  b.box('planks', [w, 0.03, d], [0, M.boards - 0.015, cz], { tint: '#2e231c' })
  const rng = createRng(1918)
  // 圓木小梁（沿著展間的長邊）
  const logs = 11
  for (let i = 0; i < logs; i++) {
    const x = R.minX + 0.15 + (i * (w - 0.3)) / (logs - 1)
    const tint = rng() < 0.2 ? '#6b5f55' : `#${(0x2c2019 + Math.floor(rng() * 0x0c0806)).toString(16)}`
    b.cylinder('wood', 0.06, 0.065, d, 7, [x, M.boards - 0.09, cz], { rotation: [Math.PI / 2, 0, 0], tint })
  }
  // 方形大梁（橫跨展間）
  const girders = [-2.55, -5.3, -8.05]
  girders.forEach((z, i) => {
    b.box('wood', [w, 0.2, 0.17], [0, y0 + 0.1, z], { tint: i === 1 ? '#4c3a2e' : BEAM, grime: 0.08 })
    // 泛白的舊漆與磨損
    for (let k = 0; k < 3; k++) b.box('plain', [0.2 + rng() * 0.4, 0.012, 0.12], [R.minX + 0.4 + rng() * (w - 0.8), y0 - 0.002, z], { tint: '#8d8478' })
  })
  // 修補：大梁旁補上的淺色新木料與螺栓固定的鋼板（照片中看得到）
  const fix = girders[0]
  b.box('wood', [1.4, 0.16, 0.06], [0.6, y0 + 0.1, fix + 0.12], { tint: '#8f7a5a' })
  b.box('steel', [0.5, 0.14, 0.012], [0.2, y0 + 0.1, fix + 0.157], { tint: '#6c5a4a' })
  for (const x of [0.02, 0.38]) {
    b.add('steel', new CylinderGeometry(0.022, 0.022, 0.03, 8), { position: [x, y0 + 0.1, fix + 0.17], rotation: [Math.PI / 2, 0, 0], tint: '#3f3a36' })
  }
  b.box('steel', [0.05, 0.2, 0.2], [-1.2, y0 + 0.1, girders[2]], { tint: '#5a4c40' })
  // 木板天花上的剝落（淺色的斑塊）
  for (let k = 0; k < 9; k++) b.box('plain', [0.1 + rng() * 0.3, 0.005, 0.1 + rng() * 0.3], [R.minX + 0.3 + rng() * (w - 0.6), M.boards - 0.033, R.minZ + 0.4 + rng() * (d - 0.8)], { tint: '#9b8b78' })
}

/* ── 吊燈 ─────────────────────────────────── */

/** 復古的金屬吊燈（深色燈罩、暖黃燈泡） */
function metalPendant(b, x, y, z) {
  const top = M.boards - 0.05
  b.cylinder('dark', 0.006, 0.006, top - y, 4, [x, (top + y) / 2, z], { tint: '#1d1b1a' })
  b.add('steel', new CylinderGeometry(0.06, 0.24, 0.16, 16, 1, true), { position: [x, y, z], tint: '#3f3d38' })
  b.cylinder('steel', 0.065, 0.065, 0.05, 12, [x, y + 0.09, z], { tint: '#2e2c29' })
  b.add('bulb', new IcosahedronGeometry(0.055, 1), { position: [x, y - 0.06, z], tint: '#ffe7b8' })
}

/** 白色玻璃燈罩（波浪的裙邊） */
function glassPendant(b, x, y, z, r = 0.2) {
  const top = M.boards - 0.05
  b.cylinder('dark', 0.006, 0.006, top - y, 4, [x, (top + y) / 2, z], { tint: '#1d1b1a' })
  b.add('bulb', new LatheGeometry(
    [
      [0.02, 0.2],
      [0.25, 0.17],
      [0.55, 0.08],
      [0.9, 0.0],
      [1.0, -0.03],
    ].map(([px, py]) => new Vector2(px * r, py * r * 3)),
    16,
  ), { position: [x, y, z], tint: '#f8f2e4' })
}

/* ── 左牆：人物展示與初等教育展板 ───────────── */

function portraitWall(b, detail) {
  const pw = M.portraitWall
  const cz = (pw.minZ + pw.maxZ) / 2
  // 肖像看板（展板圖集）與木框
  b.box('wood', [0.03, 1.66, 1.31], [WALL_L + 0.02, 1.75, cz], { tint: '#2b211b' })
  exhibitPanel(b, 'portrait', 1.25, 1.6, [WALL_L + 0.04, 1.75, cz], Math.PI / 2)
  // 上方一排裝框的文件
  for (let i = 0; i < 4; i++) {
    const z = pw.maxZ - 0.28 - i * 0.34
    exhibitPanel(b, `cert${i}`, 0.22, 0.3, [WALL_L + 0.03, 2.78, z], Math.PI / 2)
  }
  // 掛在牆上的紅紙與小提籃（細部）
  detail.box('plain', [0.01, 0.18, 0.18], [WALL_L + 0.03, 0.62, pw.minZ + 0.2], { rotation: [Math.PI / 4, 0, 0], tint: '#c8372d' })
}

function eduWall(b) {
  const ew = M.eduWall
  const cz = (ew.minZ + ew.maxZ) / 2
  const len = ew.maxZ - ew.minZ
  const h = ew.y1 - ew.y0
  b.box('plain', [0.03, h + 0.06, len + 0.06], [WALL_L + 0.02, (ew.y0 + ew.y1) / 2, cz], { tint: '#d9cdb4' })
  exhibitPanel(b, 'edu', len, h, [WALL_L + 0.04, (ew.y0 + ew.y1) / 2, cz], Math.PI / 2)
  // 展板下的木製踢腳與地上一只大陶甕
  b.box('wood', [0.04, 0.12, len], [WALL_L + 0.03, 0.06, cz], { tint: DARK_WOOD })
}

/* ── 醬缸 ─────────────────────────────────── */

/** 一只陶醬缸：深褐色的缸身、缸口與封口（木蓋、紅布、印花紙、麻布或開口） */
function jar(b, x, y, z, r, h, cover, seed = 1) {
  const rng = createRng(seed)
  const tint = ['#33241b', '#2b211c', '#3d2a1d', '#312a26'][Math.floor(rng() * 4)]
  lathe(b, 'plain', JAR_PROFILE, x, y, z, r, h, tint, 14)
  const mouth = r * 0.64
  const top = y + h
  if (cover === 'wood') {
    b.cylinder('wood', mouth + 0.03, mouth + 0.03, 0.035, 14, [x, top + 0.018, z], { tint: '#8a6440' })
    b.box('wood', [mouth * 1.2, 0.03, 0.05], [x, top + 0.05, z], { tint: '#6b4a30' })
  } else if (cover === 'cloth' || cover === 'red') {
    b.add('cloth', new IcosahedronGeometry(mouth * 1.25, 1), { position: [x, top + 0.02, z], scale: [1, 0.55, 1], tint: '#9c1e20' })
    b.add('cloth', new TorusGeometry(mouth * 0.95, 0.012, 4, 14), { position: [x, top - 0.02, z], rotation: [Math.PI / 2, 0, 0], tint: '#e8d9b0' })
  } else if (cover === 'plain') {
    b.add('plain', new IcosahedronGeometry(mouth * 1.15, 1), { position: [x, top, z], scale: [1, 0.4, 1], tint: '#e3d2b4' })
    b.add('cloth', new TorusGeometry(mouth * 0.98, 0.012, 4, 14), { position: [x, top - 0.03, z], rotation: [Math.PI / 2, 0, 0], tint: '#a83a2c' })
  } else if (cover === 'burlap') {
    b.add('burlap', new IcosahedronGeometry(mouth * 1.25, 1), { position: [x, top + 0.01, z], scale: [1, 0.45, 1], tint: '#b79c74' })
  } else {
    // 開口的缸：深色的缸內與一根斜插的竹竿
    b.cylinder('dark', mouth * 0.9, mouth * 0.9, 0.01, 12, [x, top - 0.02, z], { tint: '#1b1612' })
    b.cylinder('bamboo', 0.012, 0.012, 1.1, 6, [x + 0.05, top + 0.4, z - 0.05], { rotation: [0.15, 0, -0.25], tint: '#c9a76a' })
  }
}

/** 缸身上的紅色菱形紙（normal：+1 面向 +x、-1 面向 -x） */
function diamondLabel(b, x, y, z, size, normal) {
  b.box('plain', [0.006, size, size], [x + normal * 0.004, y, z], { rotation: [Math.PI / 4, 0, 0], tint: '#c8332b' })
}

function entryJars(b) {
  M.entryJars.forEach((j, i) => jar(b, j.x, 0.035, j.z, j.r, j.h, j.cover, 40 + i))
  const big = M.entryJars[1]
  diamondLabel(b, big.x + big.r, big.h * 0.55, big.z, 0.15, 1)
}

/* ── 右前方：醬缸與商號陳列 ───────────────── */

function jarArea(b, detail) {
  const jc = M.jarCounter
  const cz = (jc.minZ + jc.maxZ) / 2
  const len = jc.maxZ - jc.minZ
  // 深色的木櫃台（正面朝展間中央）與直條的木板
  b.box('planks', [jc.maxX - jc.minX, jc.height, len], [(jc.minX + jc.maxX) / 2, jc.height / 2, cz], { tint: '#4d3527' })
  b.box('wood', [jc.maxX - jc.minX + 0.05, 0.04, len + 0.05], [(jc.minX + jc.maxX) / 2, jc.height + 0.02, cz], { tint: '#3c281d' })
  for (let i = 1; i < 6; i++) b.box('wood', [0.01, jc.height - 0.08, 0.03], [jc.minX - 0.005, jc.height / 2, jc.minZ + (i * len) / 6], { tint: '#2f2018' })
  // 櫃台上的陶缸與菱形紙
  M.counterJars.forEach((j, i) => {
    jar(b, j.x, jc.height + 0.02, j.z, j.r, j.h, j.cover, 60 + i)
    if (j.label) diamondLabel(b, j.x - j.r, jc.height + j.h * 0.55, j.z, j.r * 0.62, -1)
  })
  // 牆上的木架：牛皮紙包裝（紅紙封條）與掛著秤、繩索、小布包的橫桿
  const shelfY = 1.98
  b.box('wood', [0.42, 0.04, len + 0.1], [WALL_R - 0.21, shelfY, cz], { tint: SHELF_WOOD })
  bracket(b, WALL_R, shelfY, jc.minZ + 0.08, 0.38, 1)
  bracket(b, WALL_R, shelfY, jc.maxZ - 0.08, 0.38, -1)
  for (const [z, w] of [
    [cz - 0.3, 0.42],
    [cz + 0.28, 0.36],
  ]) {
    b.box('plain', [0.34, 0.3, w], [WALL_R - 0.22, shelfY + 0.17, z], { tint: '#c4a172' })
    exhibitPanel(b, 'wraps', w * 0.9, 0.27, [WALL_R - 0.395, shelfY + 0.17, z], -Math.PI / 2)
  }
  b.cylinder('wood', 0.02, 0.02, len, 8, [WALL_R - 0.36, shelfY - 0.12, cz], { rotation: [Math.PI / 2, 0, 0], tint: '#5a3f2b' })
  // 秤（秤桿、秤盤與秤錘）
  const sx = WALL_R - 0.36
  const sz = jc.maxZ - 0.2
  b.cylinder('wood', 0.012, 0.012, 0.7, 6, [sx, shelfY - 0.32, sz - 0.12], { rotation: [Math.PI / 2 - 0.1, 0, 0], tint: '#8a6a44' })
  b.cylinder('steel', 0.003, 0.003, 0.3, 4, [sx, shelfY - 0.27, sz], { tint: '#3a3634' })
  b.cylinder('steel', 0.09, 0.07, 0.025, 12, [sx, shelfY - 0.62, sz + 0.08], { tint: '#8a7a5a' })
  b.add('steel', new IcosahedronGeometry(0.035, 0), { position: [sx, shelfY - 0.46, sz - 0.4], tint: '#2f2b28' })
  // 繩索、小布包與竹竿
  detail.add('plain', new TorusGeometry(0.08, 0.012, 4, 10), { position: [sx, shelfY - 0.28, cz - 0.1], rotation: [0, Math.PI / 2, 0], tint: '#b49a6c' })
  detail.add('cloth', new IcosahedronGeometry(0.07, 1), { position: [sx, shelfY - 0.3, cz + 0.12], scale: [1, 1.3, 1], tint: '#c64a5a' })
  b.cylinder('bamboo', 0.012, 0.012, 1.4, 6, [WALL_R - 0.08, 1.1, jc.minZ + 0.05], { rotation: [0.06, 0, -0.08], tint: '#c9a76a' })
  // 靠在櫃台前的大型竹篩與竹蒸籠蓋
  for (const [z, r, tilt] of [
    [jc.maxZ - 0.38, 0.36, 0.22],
    [jc.minZ + 0.42, 0.32, 0.3],
  ]) {
    const x = jc.minX - 0.12
    b.add('bamboo', new TorusGeometry(r, 0.028, 5, 22), { position: [x, r + 0.02, z], rotation: [0, Math.PI / 2, tilt], tint: '#b58a52' })
    b.add('bamboo', new CylinderGeometry(r - 0.02, r - 0.02, 0.012, 20), { position: [x + 0.01, r + 0.02, z], rotation: [0, 0, Math.PI / 2 - tilt], tint: '#c79c5f' })
    for (let k = -2; k <= 2; k++) b.box('wood', [0.018, 0.03, r * 1.7], [x - 0.012, r + 0.02 + k * r * 0.32, z], { rotation: [tilt, 0, 0], tint: '#8a6440' })
  }
  // 階梯式的木收納架（放小陶盆與竹器）
  const rk = M.jarRack
  const rz = (rk.minZ + rk.maxZ) / 2
  for (let i = 0; i < 5; i++) {
    const y = 0.05 + i * 0.24
    const depth = 0.44 - i * 0.04
    const x = WALL_R - depth / 2
    b.box('wood', [depth, 0.02, rk.maxZ - rk.minZ], [x, y, rz], { tint: '#9a7552' })
    b.box('wood', [0.02, 0.2, rk.maxZ - rk.minZ], [WALL_R - depth, y + 0.1, rz], { tint: '#a88360' })
    if (i % 2 === 0) detail.cylinder('terracotta', 0.06, 0.045, 0.1, 10, [x, y + 0.06, rz + 0.08], { tint: i ? '#b0674a' : '#5d7d8a' })
  }
  for (const z of [rk.minZ + 0.01, rk.maxZ - 0.01]) b.box('wood', [0.46, 1.25, 0.02], [WALL_R - 0.23, 0.62, z], { tint: '#9a7552' })
}

/** 層板下的雕花托架（在層架正面的平面上：從立柱伸到層板下緣的一塊曲線木板） */
function bracket(b, wallX, y, z, depth, side = 1) {
  const s = 0.16
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.lineTo(s, 0)
  shape.quadraticCurveTo(s * 0.35, -s * 0.2, s * 0.25, -s)
  shape.lineTo(0, -s)
  shape.lineTo(0, 0)
  // 形狀的 x 軸沿著 z（往層架中間），y 往下；擠出的方向是 -x（從牆往外的前緣）
  b.extrude('wood', shape, 0.03, { position: [wallX - depth + 0.03, y - 0.02, z], rotation: [0, -Math.PI / 2, 0], scale: [side, 1, 1], tint: '#3a281d' })
}

/* ── 右牆：高層木架 ───────────────────────── */

const SHELF_LEVELS = [0.62, 1.16, 1.7, 2.24, 2.8]

function shelves(b, detail) {
  const sh = M.shelves
  const depth = sh.maxX - sh.minX
  const units = 2
  const unitLen = (sh.maxZ - sh.minZ) / units
  const front = WALL_R - depth
  for (let u = 0; u < units; u++) {
    const z0 = sh.minZ + u * unitLen
    const z1 = z0 + unitLen
    const zc = (z0 + z1) / 2
    // 立柱與層板
    for (const z of [z0 + 0.03, zc, z1 - 0.03]) b.box('wood', [0.05, sh.height, 0.05], [front + 0.025, sh.height / 2, z], { tint: SHELF_WOOD })
    for (const z of [z0 + 0.03, z1 - 0.03]) b.box('wood', [depth, sh.height, 0.04], [WALL_R - depth / 2, sh.height / 2, z], { tint: SHELF_WOOD })
    for (const y of SHELF_LEVELS) {
      b.box('wood', [depth, 0.035, unitLen - 0.04], [WALL_R - depth / 2, y, zc], { tint: SHELF_WOOD })
      // 層板下的雕花托架（每個立柱兩側）
      for (const z of [z0 + 0.06, zc - 0.03, zc + 0.03, z1 - 0.06]) bracket(b, WALL_R, y, z, depth, z < zc ? 1 : -1)
    }
    // 最下層是有門的木櫃
    b.box('planks', [depth - 0.04, SHELF_LEVELS[0] - 0.02, unitLen - 0.1], [WALL_R - depth / 2, (SHELF_LEVELS[0] - 0.02) / 2, zc], { tint: '#553a29' })
    for (const z of [zc - unitLen / 4, zc + unitLen / 4]) {
      b.box('wood', [0.015, SHELF_LEVELS[0] - 0.14, unitLen / 2 - 0.12], [front + 0.01, SHELF_LEVELS[0] / 2, z], { tint: '#6a4a33' })
      b.box('steel', [0.02, 0.08, 0.015], [front - 0.005, SHELF_LEVELS[0] / 2, z + (z < zc ? 0.2 : -0.2)], { tint: '#b8a06a' })
    }
    shelfItems(b, detail, u, z0, z1, front)
  }
}

/** 層架上的陳設：每一層、每一組都不一樣（不複製同一層） */
function shelfItems(b, detail, unit, z0, z1, front) {
  const rng = createRng(1882 + unit * 17)
  const mid = (z0 + z1) / 2
  const x = (front + WALL_R) / 2
  const at = (t) => z0 + 0.12 + t * (z1 - z0 - 0.24)
  const [l0, l1, l2, l3, l4] = SHELF_LEVELS
  if (unit === 0) {
    // 最上層：牛皮紙包裝（紅紙封條）與竹編箱
    kraftBox(b, x, l4 + 0.02, at(0.15), 0.34, 0.28, 0.4)
    kraftBox(b, x, l4 + 0.02, at(0.55), 0.3, 0.22, 0.34)
    b.box('bamboo', [0.36, 0.22, 0.42], [x, l4 + 0.13, at(0.9)], { tint: '#b48b55' })
    // 第四層：鐵茶壺、漆提盒、牛皮紙包裝
    lathe(b, 'plain', KETTLE_PROFILE, x, l3 + 0.02, at(0.12), 0.13, 0.2, '#2a2624')
    b.add('dark', new TorusGeometry(0.09, 0.01, 4, 12, Math.PI), { position: [x, l3 + 0.24, at(0.12)], rotation: [0, Math.PI / 2, 0], tint: '#1f1c1a' })
    lacquerBasket(b, x, l3 + 0.02, at(0.45), 0.13, 0.3)
    kraftBox(b, x, l3 + 0.02, at(0.82), 0.3, 0.32, 0.3, true)
    // 第三層：綁紅繩的小陶甕（兩排）
    for (let i = 0; i < 5; i++) clayJar(b, x + (i % 2 ? -0.08 : 0.06), l2 + 0.02, at(0.1 + i * 0.2), 0.075, 0.2, detail)
    // 第二層：不鏽鋼加木框的便當提盒、白瓷碗
    for (let i = 0; i < 3; i++) tiffin(b, x, l1 + 0.02, at(0.12 + i * 0.22), 0.09, 2 + (i % 2))
    for (let i = 0; i < 2; i++) b.cylinder('plain', 0.08, 0.06, 0.08, 14, [x, l1 + 0.06 + i * 0.07, at(0.85)], { tint: '#f1efe8' })
    // 櫃頂：舊式電視與書
    crt(b, x, l0 + 0.02, at(0.25))
    books(b, front, l0 + 0.02, at(0.7), 0.42, 0.24)
  } else {
    // 最上層：竹籃、提籃、牛皮紙包裝
    b.cylinder('bamboo', 0.15, 0.13, 0.2, 12, [x, l4 + 0.12, at(0.12)], { tint: '#a77b48' })
    b.add('bamboo', new TorusGeometry(0.11, 0.012, 4, 12, Math.PI), { position: [x, l4 + 0.22, at(0.12)], rotation: [0, Math.PI / 2, 0], tint: '#8e6538' })
    kraftBox(b, x, l4 + 0.02, at(0.5), 0.32, 0.26, 0.36, true)
    lacquerBasket(b, x, l4 + 0.02, at(0.86), 0.12, 0.28)
    // 第四層：提籃與鐵壺
    lacquerBasket(b, x, l3 + 0.02, at(0.15), 0.14, 0.32)
    lathe(b, 'plain', KETTLE_PROFILE, x, l3 + 0.02, at(0.55), 0.12, 0.18, '#332d29')
    b.box('wood', [0.3, 0.2, 0.3], [x, l3 + 0.12, at(0.88)], { tint: '#7d5a3c' })
    // 第三層：玻璃燈具、醬油瓶、木盒
    for (const t of [0.12, 0.3]) glassLamp(b, x, l2 + 0.02, at(t))
    for (let i = 0; i < 3; i++) bottle(b, x + (i - 1) * 0.06, l2 + 0.02, at(0.55 + i * 0.07), i === 1 ? '#7a1f1a' : '#3a2018')
    b.box('wood', [0.28, 0.12, 0.24], [x, l2 + 0.08, at(0.88)], { tint: '#8a6440' })
    // 第二層：茶葉罐、白瓷碗、小陶甕
    for (let i = 0; i < 4; i++) b.cylinder('steel', 0.045, 0.045, 0.14, 10, [x, l1 + 0.09, at(0.1 + i * 0.1)], { tint: ['#c9c6bc', '#b23a2b', '#c9c6bc', '#2f4b6e'][i] })
    for (let i = 0; i < 3; i++) b.cylinder('plain', 0.075, 0.055, 0.07, 12, [x, l1 + 0.055 + i * 0.06, at(0.62)], { tint: '#f3f0e8' })
    clayJar(b, x, l1 + 0.02, at(0.88), 0.09, 0.22, detail)
    // 櫃頂：書、陶鍋與銅碗
    books(b, front, l0 + 0.02, at(0.25), 0.5, 0.26)
    lathe(b, 'plain', POT_PROFILE, x, l0 + 0.02, at(0.65), 0.13, 0.16, '#2a2522')
    b.cylinder('steel', 0.1, 0.07, 0.06, 14, [x, l0 + 0.05, at(0.9)], { tint: '#b8954f' })
  }
  // 細部：散放的茶杯與小物（精緻模式）
  for (let i = 0; i < 3; i++) {
    detail.cylinder('plain', 0.03, 0.025, 0.05, 8, [x - 0.08, SHELF_LEVELS[1 + (i % 3)] + 0.045, mid + (rng() - 0.5) * 0.5], { tint: i % 2 ? '#e9e4d8' : '#3c5f86' })
  }
}

function kraftBox(b, x, y, z, w, h, d, label = false) {
  b.box('plain', [w, h, d], [x, y + h / 2, z], { tint: '#c4a172' })
  b.box('plain', [w + 0.005, 0.012, d + 0.005], [x, y + h * 0.55, z], { tint: '#8a6a40' })
  if (label) exhibitPanel(b, 'wraps', d * 0.92, h * 0.85, [x - w / 2 - 0.004, y + h / 2, z], -Math.PI / 2)
  else b.box('plain', [0.005, h * 0.5, h * 0.5], [x - w / 2 - 0.004, y + h / 2, z], { rotation: [Math.PI / 4, 0, 0], tint: '#c8332b' })
}

function lacquerBasket(b, x, y, z, r, h) {
  b.cylinder('plain', r, r * 0.95, h * 0.55, 14, [x, y + h * 0.275, z], { tint: '#5a2420' })
  b.cylinder('plain', r * 1.02, r * 1.02, 0.03, 14, [x, y + h * 0.56, z], { tint: '#1f1a18' })
  b.add('bamboo', new TorusGeometry(r * 0.8, 0.012, 4, 12, Math.PI), { position: [x, y + h * 0.58, z], rotation: [0, Math.PI / 2, 0], tint: '#2a2220' })
}

function clayJar(b, x, y, z, r, h, detail) {
  lathe(b, 'terracotta', POT_PROFILE, x, y, z, r, h, '#b98a62', 10)
  detail.add('plain', new TorusGeometry(r * 0.75, 0.007, 3, 10), { position: [x, y + h * 0.7, z], rotation: [Math.PI / 2, 0, 0], tint: '#c9b48a' })
  b.box('cloth', [0.01, 0.06, 0.02], [x - r * 0.9, y + h * 0.75, z], { tint: '#c8332b' })
}

function tiffin(b, x, y, z, r, tiers) {
  for (let i = 0; i < tiers; i++) {
    b.cylinder('steel', r, r, 0.075, 14, [x, y + 0.04 + i * 0.08, z], { tint: '#c9ccc9' })
    b.cylinder('wood', r + 0.004, r + 0.004, 0.03, 14, [x, y + 0.04 + i * 0.08, z], { tint: '#b88d58' })
  }
  b.add('steel', new TorusGeometry(r * 0.7, 0.007, 3, 10, Math.PI), { position: [x, y + tiers * 0.08 + 0.02, z], rotation: [0, Math.PI / 2, 0], tint: '#9c9e9a' })
}

function crt(b, x, y, z) {
  b.box('plain', [0.36, 0.32, 0.4], [x + 0.02, y + 0.16, z], { tint: '#8d8f8c' })
  b.box('dark', [0.01, 0.22, 0.28], [x - 0.165, y + 0.18, z], { tint: '#262a2a' })
  b.box('plain', [0.012, 0.05, 0.36], [x - 0.165, y + 0.035, z], { tint: '#6c6e6b' })
}

function books(b, front, y, z, len, h) {
  b.box('plain', [0.22, h, len], [front + 0.13, y + h / 2, z], { tint: '#6c5a48' })
  exhibitPanel(b, 'books', len, h, [front + 0.015, y + h / 2, z], -Math.PI / 2)
}

function glassLamp(b, x, y, z) {
  b.cylinder('dark', 0.07, 0.08, 0.04, 10, [x, y + 0.02, z], { tint: '#2a2826' })
  b.add('glassClear', new IcosahedronGeometry(0.08, 1), { position: [x, y + 0.13, z], scale: [1, 1.2, 1], tint: '#e8eef0' })
  b.cylinder('dark', 0.04, 0.06, 0.06, 10, [x, y + 0.26, z], { tint: '#2a2826' })
  b.add('dark', new TorusGeometry(0.05, 0.006, 3, 10, Math.PI), { position: [x, y + 0.31, z], rotation: [0, Math.PI / 2, 0], tint: '#2a2826' })
}

function bottle(b, x, y, z, tint) {
  b.cylinder('plain', 0.035, 0.035, 0.2, 10, [x, y + 0.1, z], { tint })
  b.cylinder('plain', 0.013, 0.02, 0.06, 8, [x, y + 0.23, z], { tint })
  b.box('plain', [0.005, 0.07, 0.05], [x - 0.036, y + 0.11, z], { tint: '#d8c49a' })
}

/* ── 中央：長桌、板凳與木椅 ───────────────── */

function tables(b, detail) {
  const H = M.tableHeight
  for (const t of M.tables) {
    const cx = (t.minX + t.maxX) / 2
    const cz = (t.minZ + t.maxZ) / 2
    const w = t.maxX - t.minX
    const d = t.maxZ - t.minZ
    // 深色木桌面（有使用痕跡的淺色磨損）與桌腳、橫撐
    b.box('planks', [w, 0.06, d], [cx, H - 0.03, cz], { tint: DARK_WOOD })
    b.box('plain', [w * 0.3, 0.004, d * 0.2], [cx + 0.1, H + 0.001, cz - d * 0.2], { tint: '#5a4232' })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box('wood', [0.07, H - 0.06, 0.07], [cx + sx * (w / 2 - 0.07), (H - 0.06) / 2, cz + sz * (d / 2 - 0.08)], { tint: '#33241a' })
      b.box('wood', [0.04, 0.06, d - 0.2], [cx + sx * (w / 2 - 0.07), 0.2, cz], { tint: '#33241a' })
    }
    for (const bench of museumBenches(t)) benchPiece(b, bench)
    for (const c of museumChairs(t)) woodChair(b, c.x, c.z)
  }
  // 桌面上的少量物件：竹編資料籃、書與紙卡（導覽交流）
  const a = M.tables[0]
  const ax = (a.minX + a.maxX) / 2
  b.box('bamboo', [0.28, 0.12, 0.38], [ax - 0.05, H + 0.06, a.minZ + 0.45], { tint: '#9a6e3f' })
  b.box('plain', [0.24, 0.02, 0.32], [ax - 0.05, H + 0.13, a.minZ + 0.45], { tint: '#efe9dc' })
  b.box('plain', [0.2, 0.05, 0.28], [ax + 0.05, H + 0.025, a.maxZ - 0.4], { tint: '#7a3a2f' })
  for (const [z, ry] of [
    [-4.9, 0.2],
    [-6.9, -0.3],
  ]) {
    detail.box('plain', [0.12, 0.08, 0.002], [ax + 0.08, H + 0.04, z], { rotation: [0.5, ry, 0], tint: '#f6f3ea' })
    detail.box('plain', [0.12, 0.08, 0.002], [ax + 0.08, H + 0.04, z - 0.05], { rotation: [-0.5, ry, 0], tint: '#f6f3ea' })
  }
  const bt = M.tables[1]
  b.add('steel', new LatheGeometry(KETTLE_PROFILE, 10), { position: [ax, H, (bt.minZ + bt.maxZ) / 2 + 0.2], scale: [0.07, 0.12, 0.07], tint: '#2c2724' })
  b.box('plain', [0.22, 0.04, 0.3], [ax - 0.08, H + 0.02, (bt.minZ + bt.maxZ) / 2 - 0.25], { tint: '#3e5a3a' })
}

function benchPiece(b, r) {
  const { height } = M.bench
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  b.box('planks', [w, 0.05, d], [cx, height - 0.025, cz], { tint: '#4a3424' })
  for (const sz of [-1, 1]) {
    b.box('wood', [w - 0.06, height - 0.05, 0.05], [cx, (height - 0.05) / 2, cz + sz * (d / 2 - 0.12)], { tint: '#35251b' })
  }
  b.box('wood', [0.04, 0.05, d - 0.3], [cx, 0.14, cz], { tint: '#35251b' })
}

function woodChair(b, x, z) {
  b.box('wood', [0.4, 0.04, 0.4], [x, 0.45, z], { tint: '#5a3f2b' })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.035, 0.45, 0.035], [x + sx * 0.17, 0.225, z + sz * 0.17], { tint: '#3f2c1f' })
  b.box('wood', [0.035, 0.45, 0.38], [x + 0.18, 0.7, z], { tint: '#3f2c1f' })
  b.box('wood', [0.02, 0.1, 0.32], [x + 0.18, 0.85, z], { tint: '#5a3f2b' })
}

/* ── 後牆：學貫中西、小展桌、藤椅 ───────────── */

function backWall(b, detail) {
  const { plaque, window: win, scroll } = M.backWall
  const z = WALL_B
  // 「學貫中西」匾額的底板（黑底帶一點藍）、角落的紅色印章與上方的木雕花邊
  b.box('plain', [plaque.w, plaque.h, 0.05], [plaque.x, plaque.y, z + 0.03], { tint: '#202838' })
  b.box('plain', [0.08, 0.08, 0.01], [plaque.x + plaque.w / 2 - 0.16, plaque.y + plaque.h / 2 - 0.08, z + 0.06], { tint: '#b2302a' })
  b.box('wood', [plaque.w + 0.2, 0.05, 0.05], [plaque.x, plaque.y + plaque.h / 2 + 0.07, z + 0.03], { tint: '#8a5a32' })
  for (let i = 0; i < 9; i++) {
    const cx = plaque.x - plaque.w / 2 + 0.02 + i * ((plaque.w - 0.04) / 8)
    b.add('wood', new TorusGeometry(0.055, 0.016, 4, 10, Math.PI * 1.4), { position: [cx, plaque.y + plaque.h / 2 + 0.15, z + 0.03], rotation: [0, 0, (i % 2 ? 1 : -1) * 0.6], tint: '#9a6638' })
  }
  // 淺綠色的老窗框（霧面的壓花玻璃）
  const fw = 0.06
  b.box('plain', [win.w - 0.04, win.h - 0.04, 0.02], [win.x, win.y, z + 0.02], { tint: '#cfd0c4' })
  for (const s of [-1, 1]) {
    b.box('wood', [fw, win.h + fw, 0.06], [win.x + s * (win.w / 2), win.y, z + 0.04], { tint: '#7fb1a2' })
    b.box('wood', [win.w + fw, fw, 0.06], [win.x, win.y + s * (win.h / 2), z + 0.04], { tint: '#7fb1a2' })
  }
  b.box('wood', [0.035, win.h, 0.04], [win.x, win.y, z + 0.04], { tint: '#7fb1a2' })
  for (const t of [-1 / 6, 1 / 6]) b.box('wood', [win.w, 0.03, 0.04], [win.x, win.y + t * win.h, z + 0.04], { tint: '#7fb1a2' })
  // 人體解剖圖掛軸（展板圖集）與上下的木軸
  exhibitPanel(b, 'anatomy', scroll.w, scroll.h, [scroll.x, scroll.y, z + 0.025])
  for (const s of [-1, 1]) b.cylinder('wood', 0.018, 0.018, scroll.w + 0.12, 8, [scroll.x, scroll.y + s * (scroll.h / 2 + 0.01), z + 0.04], { rotation: [0, 0, Math.PI / 2], tint: '#7a5534' })
  // 紅色的「行善得福」紙條
  b.box('plain', [0.17, 0.64, 0.005], [1.7, 1.62, z + 0.012], { tint: '#c8342c' })
  // 小展桌：鋪深藍桌布，上面是鐵壺、小茶壺、玻璃瓶架、筆架與竹籃
  const dk = M.desk
  const dx = (dk.minX + dk.maxX) / 2
  const dz = (dk.minZ + dk.maxZ) / 2
  b.box('cloth', [dk.maxX - dk.minX, dk.height, dk.maxZ - dk.minZ], [dx, dk.height / 2, dz], { tint: '#26355c' })
  b.box('cloth', [dk.maxX - dk.minX + 0.02, 0.01, dk.maxZ - dk.minZ + 0.02], [dx, dk.height + 0.005, dz], { tint: '#2c3d66' })
  lathe(b, 'plain', KETTLE_PROFILE, dk.minX + 0.18, dk.height, dz, 0.1, 0.16, '#262321')
  b.box('dark', [0.18, 0.08, 0.18], [dk.minX + 0.18, dk.height + 0.04, dz], { tint: '#2a2624' })
  lathe(b, 'plain', KETTLE_PROFILE, dk.minX + 0.45, dk.height + 0.01, dz + 0.05, 0.06, 0.08, '#8a4a2e')
  b.box('glassClear', [0.32, 0.02, 0.1], [dx + 0.1, dk.height + 0.01, dz], { tint: '#d8e4e6' })
  for (let i = 0; i < 5; i++) detail.cylinder('glassClear', 0.022, 0.022, 0.12, 8, [dx - 0.04 + i * 0.07, dk.height + 0.08, dz], { tint: '#e3eef0' })
  // 筆架與毛筆
  const bx = dk.maxX - 0.32
  b.box('wood', [0.3, 0.02, 0.1], [bx, dk.height + 0.01, dz], { tint: '#9a7048' })
  for (const s of [-1, 1]) b.box('wood', [0.02, 0.32, 0.02], [bx + s * 0.13, dk.height + 0.17, dz], { tint: '#9a7048' })
  b.box('wood', [0.3, 0.02, 0.02], [bx, dk.height + 0.32, dz], { tint: '#9a7048' })
  for (let i = 0; i < 4; i++) detail.cylinder('wood', 0.006, 0.008, 0.2, 5, [bx - 0.09 + i * 0.06, dk.height + 0.2, dz], { tint: i % 2 ? '#2a2420' : '#c9a76a' })
  b.cylinder('bamboo', 0.12, 0.1, 0.16, 12, [dk.maxX - 0.08, dk.height + 0.08, dz - 0.05], { tint: '#9a6e3f' })
  rattanChair(b, M.rattanChair.x, M.rattanChair.z)
}

/** 藤椅：圓形的藤編座面、直立的橢圓椅背與兩側彎曲的扶手（椅子面向 +x 的小展桌） */
function rattanChair(b, x, z) {
  const tint = '#c39557'
  const frame = '#a07040'
  b.cylinder('bamboo', 0.24, 0.24, 0.05, 16, [x, 0.46, z], { tint })
  b.add('bamboo', new TorusGeometry(0.24, 0.018, 5, 18), { position: [x, 0.485, z], rotation: [Math.PI / 2, 0, 0], tint: frame })
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    b.cylinder('bamboo', 0.018, 0.018, 0.46, 6, [x + sx * 0.16, 0.23, z + sz * 0.16], { tint: frame })
  }
  // 椅背：直立的橢圓藤編板（在 -x 那一側），外框一圈
  b.add('bamboo', new CylinderGeometry(0.22, 0.22, 0.035, 18), { position: [x - 0.22, 0.86, z], rotation: [0, 0, Math.PI / 2 + 0.12], scale: [1.4, 1, 1], tint })
  b.add('bamboo', new TorusGeometry(0.22, 0.016, 5, 20), { position: [x - 0.22, 0.86, z], rotation: [0, Math.PI / 2, 0], scale: [1, 1.4, 1], tint: frame })
  // 扶手：從椅背兩側彎到座面前緣
  for (const s of [-1, 1]) {
    b.add('bamboo', new TorusGeometry(0.16, 0.014, 4, 10, Math.PI / 2), { position: [x - 0.06, 0.5, z + s * 0.22], rotation: [0, 0, 0], tint: frame })
  }
}

/* ── 天花下的大型布旗與「源珍」小布旗 ───────── */

function banner(b) {
  const { x, y, z, w, h, tilt } = M.banner
  const c = Math.cos(tilt)
  const s = Math.sin(tilt)
  // 布旗的本地座標 (u, v, n) → 建築本地座標
  const at = (u, v, n = 0) => [x + u, y + v * c - n * s, z + v * s + n * c]
  b.box('cloth', [w, h, 0.01], [x, y, z], { rotation: [tilt, 0, 0], tint: '#f0e7d6' })
  // 四邊的花邊與紅色剪紙風的紋樣：中央的圓形團紋、四角的雲紋
  for (const v of [-h / 2 + 0.03, h / 2 - 0.03]) b.box('cloth', [w, 0.04, 0.012], at(0, v, 0.004), { rotation: [tilt, 0, 0], tint: '#3f6a52' })
  for (const u of [-w / 2 + 0.03, w / 2 - 0.03]) b.box('cloth', [0.04, h, 0.012], at(u, 0, 0.004), { rotation: [tilt, 0, 0], tint: '#3f6a52' })
  b.add('cloth', new TorusGeometry(0.2, 0.035, 4, 20), { position: at(0, 0, 0.012), rotation: [tilt, 0, 0], scale: [1.3, 1, 1], tint: '#c4282a' })
  b.add('cloth', new CylinderGeometry(0.13, 0.13, 0.008, 16), { position: at(0, 0, 0.012), rotation: [Math.PI / 2 + tilt, 0, 0], scale: [1.4, 1, 1], tint: '#c4282a' })
  for (const [u, v] of [
    [-w / 2 + 0.22, h / 2 - 0.2],
    [w / 2 - 0.22, h / 2 - 0.2],
    [-w / 2 + 0.22, -h / 2 + 0.2],
    [w / 2 - 0.22, -h / 2 + 0.2],
  ]) {
    for (let k = 0; k < 3; k++) {
      b.add('cloth', new CylinderGeometry(0.06, 0.06, 0.008, 10), { position: at(u + (k - 1) * 0.07, v + (k % 2) * 0.05, 0.012), rotation: [Math.PI / 2 + tilt, 0, 0], tint: '#c4282a' })
    }
  }
  // 上下的竹竿、吊繩與紅色流蘇
  const top = at(0, h / 2, 0)
  const bottom = at(0, -h / 2, 0)
  for (const p of [top, bottom]) b.cylinder('bamboo', 0.018, 0.018, w + 0.25, 8, p, { rotation: [0, 0, Math.PI / 2], tint: '#c9a76a' })
  for (const [px, py, pz] of [top, bottom]) {
    for (const sx of [-1, 1]) {
      const len = M.boards - 0.05 - py
      b.cylinder('plain', 0.004, 0.004, len, 3, [px + sx * (w / 2 + 0.08), py + len / 2, pz], { tint: '#efe9dc' })
      b.add('cloth', new ConeGeometry(0.03, 0.22, 6), { position: [px + sx * (w / 2 + 0.12), py - 0.12, pz], rotation: [Math.PI, 0, 0], tint: '#c4282a' })
    }
  }
  // 旗下的三面小布旗：中間寫「源珍」（文字在街景的招牌層），兩側是紅色的圓形印記
  const edge = museumBannerEdge()
  ;[-0.36, 0, 0.36].forEach((u) => {
    b.box('cloth', [0.3, 0.38, 0.006], [x + u, edge.y - 0.21, edge.z + 0.004], { tint: '#f1eee6' })
    if (u === 0) return
    b.add('cloth', new TorusGeometry(0.08, 0.012, 4, 16), { position: [x + u, edge.y - 0.2, edge.z + 0.01], tint: '#c8382f' })
    b.add('cloth', new CylinderGeometry(0.035, 0.035, 0.004, 10), { position: [x + u, edge.y - 0.2, edge.z + 0.01], rotation: [Math.PI / 2, 0, 0], tint: '#c8382f' })
  })
}

/* ── 左後方：舊式木櫃台與茶席 ─────────────── */

function teaCorner(b, detail) {
  const tc = M.teaCounter
  const cx = (tc.minX + tc.maxX) / 2
  const cz = (tc.minZ + tc.maxZ) / 2
  const len = tc.maxZ - tc.minZ
  const depth = tc.maxX - tc.minX
  // 有嵌板門的木櫃台
  b.box('planks', [depth, tc.height - 0.04, len], [cx, (tc.height - 0.04) / 2, cz], { tint: '#553a28' })
  b.box('wood', [depth + 0.06, 0.04, len + 0.06], [cx + 0.03, tc.height - 0.02, cz], { tint: '#6a4a33' })
  for (let i = 0; i < 3; i++) {
    const z = tc.minZ + (len * (i + 0.5)) / 3
    b.box('wood', [0.015, tc.height - 0.3, len / 3 - 0.12], [tc.maxX + 0.005, tc.height / 2 - 0.05, z], { tint: '#6c4b33' })
  }
  b.box('plain', [0.006, 0.26, 0.26], [tc.maxX + 0.014, 0.45, cz], { rotation: [Math.PI / 4, 0, 0], tint: '#d9562f' })
  // 茶席：圓形竹托盤、黑色茶壺（竹提把）與杯底朝上的茶杯
  const ty = tc.height
  const tx = cx + 0.02
  const tz = tc.maxZ - 0.32
  b.cylinder('bamboo', 0.26, 0.26, 0.025, 20, [tx, ty + 0.012, tz], { tint: '#8a4a2e' })
  b.add('bamboo', new TorusGeometry(0.26, 0.014, 4, 22), { position: [tx, ty + 0.03, tz], rotation: [Math.PI / 2, 0, 0], tint: '#6a3a24' })
  lathe(b, 'plain', KETTLE_PROFILE, tx, ty + 0.025, tz, 0.09, 0.12, '#1f1c1b', 14)
  b.add('bamboo', new TorusGeometry(0.07, 0.009, 4, 12, Math.PI), { position: [tx, ty + 0.15, tz], tint: '#d8b778' })
  b.cylinder('plain', 0.014, 0.01, 0.06, 6, [tx + 0.09, ty + 0.08, tz], { rotation: [0, 0, -0.9], tint: '#1f1c1b' })
  const cups = 9
  for (let i = 0; i < cups; i++) {
    const a = (i / cups) * Math.PI * 2
    const tint = i % 3 === 0 ? '#3c5f86' : i % 3 === 1 ? '#a8764c' : '#e6e1d4'
    // 杯底朝上：小的一端在上
    detail.cylinder('plain', 0.024, 0.032, 0.055, 10, [tx + Math.cos(a) * 0.18, ty + 0.055, tz + Math.sin(a) * 0.18], { tint })
  }
  // 櫃台後段：裝飾燈座、小陶缽與疊起的書；蒸籠與斗笠
  b.cylinder('plain', 0.06, 0.09, 0.22, 12, [cx, ty + 0.11, tz - 0.48], { tint: '#3d6a8a' })
  b.add('steel', new IcosahedronGeometry(0.05, 1), { position: [cx, ty + 0.27, tz - 0.48], tint: '#c9c6bc' })
  b.box('plain', [0.2, 0.06, 0.28], [cx, ty + 0.03, tz - 0.8], { tint: '#b03a2e' })
  b.cylinder('bamboo', 0.2, 0.2, 0.2, 16, [cx, ty + 0.1, tc.minZ + 0.22], { tint: '#a77d4a' })
  b.add('bamboo', new ConeGeometry(0.3, 0.16, 16), { position: [cx, ty + 0.28, tc.minZ + 0.22], tint: '#d2b47c' })
  // 牆上的舊照片（展板圖集）
  exhibitPanel(b, 'oldPhoto', 0.95, 0.57, [WALL_L + 0.03, 1.95, cz], Math.PI / 2)
  b.box('wood', [0.02, 0.63, 1.01], [WALL_L + 0.015, 1.95, cz], { tint: '#2b211b' })
  // 掛在牆上的竹籃
  b.cylinder('bamboo', 0.11, 0.08, 0.14, 12, [WALL_L + 0.12, 1.45, tc.minZ + 0.25], { tint: '#b58a52' })
}

/* ── 主程式 ─────────────────────────────── */

export function buildHuangYujieInterior(b, config = {}, detail = b) {
  finishes(b)
  ceiling(b)
  portraitWall(b, detail)
  eduWall(b)
  entryJars(b)
  jarArea(b, detail)
  shelves(b, detail)
  tables(b, detail)
  backWall(b, detail)
  banner(b)
  teaCorner(b, detail)
  // 吊燈：長桌上方的金屬吊燈、小展桌與茶席上方的白色玻璃燈罩
  for (const t of M.tables) metalPendant(b, (t.minX + t.maxX) / 2, 2.42, (t.minZ + t.maxZ) / 2)
  glassPendant(b, 0.85, 2.12, -8.75, 0.2)
  glassPendant(b, -1.85, 2.3, -8.4, 0.14)
}
