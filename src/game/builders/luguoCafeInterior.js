import { CylinderGeometry, IcosahedronGeometry, Shape, SphereGeometry, TorusGeometry } from 'three'
import { ART_YARD, LUGUO_CAFE } from '../../data/luguoCafeLayout.js'
import { LUGUO_WIN2, frontOpenings, orient, sideOpenings, wallWithOpenings } from './luguoCafe.js'
import { pottedPlant } from './props.js'

/**
 * 爐鍋咖啡的二樓室內（按需載入，只在 2000–現在「老屋新生」）
 *
 * 依實地照片簡化的四個區域：
 * A. 窗邊座位：東牆三組木格窗與轉角塔樓的窗前，圓桌、方桌、縫紉機腳架的書桌，六種不同的椅子、大型盆栽與掛畫
 * B. 咖啡吧檯：靠西牆的大木櫃（上層玻璃櫃門、櫃頂的彩色茶壺與咖啡壺）、平行的工作台、義式咖啡機、磨豆機、手沖濾杯與細口壺
 * C. 閱讀與收藏：書架、雜誌架、沙發與綠色扶手椅、地毯、立燈與盆栽、深色木格架
 * D. 樓梯入口：玻璃門旁的冰滴咖啡架、紅黑色雙層扭蛋機、摺疊腳踏車、滅火器與海報
 * 中央走道（x -0.9 – 1.6）從玻璃門一路通到吧檯，不放家具。
 *
 * 地板、牆與天花的內側另外鋪一層（室內材質，不受街景陰影影響），南側窗戶照進來的陽光在地磚上留下格子狀的亮塊。
 * 店內的畫作、海報、春聯與貼紙都是原創的簡化圖樣，不複製店內實際的作品。
 * 細小的擺飾（書、杯具、商品盒、扭蛋、軌道燈…）放在 detail（精緻模式才顯示）。
 * 店內的招牌字與燈光在 luguoCafe.js（屬於街景的招牌層與燈火）。
 */
const A = ART_YARD
const CAFE = LUGUO_CAFE
const F = A.floor2 + 0.035 // 地板面（陶磚的頂面）

const WOOD = '#9b6b45'
const WOOD_DARK = '#5d3b27'
const WOOD_RED = '#7a4a32'
const IRON = '#2a2826'
const COPPER = '#c88a58'

/* ── 家具配置（建築本地座標；碰撞也由這份清單產生） ───────── */

/**
 * type：家具種類；x、z：位置；face：椅子面向的點；rot：旋轉（弧度，本地 +z 為正面）。
 * 每種家具的佔地（半寬、半深）見 FOOTPRINT；size 指定時覆蓋。
 */
export const CAFE_ITEMS = [
  // A. 窗邊座位
  { type: 'roundTable', x: 2.75, z: -4.45, d: 0.9 },
  { type: 'spindleChair', x: 2.75, z: -3.62, face: [2.75, -4.45] },
  { type: 'windsorChair', x: 1.95, z: -4.65, face: [2.75, -4.45] },
  { type: 'leatherChair', x: 3.5, z: -5.05, face: [2.75, -4.45] },
  { type: 'squareTable', x: 3.35, z: -7.6, w: 0.8, d: 0.8 },
  { type: 'armChair', x: 2.45, z: -7.6, face: [3.35, -7.6] },
  { type: 'spindleChair', x: 3.35, z: -6.78, face: [3.35, -7.6] },
  { type: 'squareTable', x: 3.4, z: -10.05, w: 0.75, d: 0.75 },
  { type: 'bentwoodChair', x: 2.62, z: -10.05, face: [3.4, -10.05] },
  { type: 'windsorChair', x: 3.4, z: -9.25, face: [3.4, -10.05] },
  { type: 'sewingDesk', x: 3.62, z: -1.05, rot: -Math.PI / 2, w: 1.5, d: 0.55 },
  { type: 'carvedChair', x: 2.95, z: -1.05, face: [3.62, -1.05] },
  { type: 'roundTable', x: 2.15, z: 0.55, d: 0.75 },
  { type: 'leatherChair', x: 1.4, z: 0.55, face: [2.15, 0.55] },
  { type: 'bentwoodChair', x: 2.15, z: -0.25, face: [2.15, 0.55] },
  { type: 'cactus', x: 3.62, z: -2.75 },
  // B. 咖啡吧檯
  { type: 'backCabinet', x: -3.7, z: -1.1, rot: Math.PI / 2, w: 4.8, d: 0.5 },
  { type: 'barCounter', x: CAFE.bar.counterX, z: (CAFE.bar.minZ + CAFE.bar.maxZ) / 2, rot: Math.PI / 2, w: CAFE.bar.maxZ - CAFE.bar.minZ, d: 0.7 },
  { type: 'barGate', x: -2.88, z: -3.42, w: 1.15, d: 0.1 },
  // C. 閱讀與收藏
  { type: 'bookshelf', x: -3.77, z: -4.6, rot: Math.PI / 2, w: 1.4, d: 0.36, h: 2.1 },
  { type: 'magazineRack', x: -3.78, z: -5.85, rot: Math.PI / 2, w: 0.65, d: 0.32 },
  { type: 'sofa', x: -3.52, z: -7.2, rot: Math.PI / 2, w: 1.8, d: 0.8 },
  { type: 'lowTable', x: -2.6, z: -7.2, w: 0.55, d: 1.0 },
  { type: 'softChair', x: -2.55, z: -8.6, face: [-2.6, -7.2] },
  { type: 'floorLamp', x: -3.62, z: -8.5 },
  { type: 'plant', x: -3.5, z: -8.95, size: 1.25 },
  { type: 'bookshelf', x: -3.77, z: -9.75, rot: Math.PI / 2, w: 1.3, d: 0.36, h: 2.0 },
  { type: 'latticeShelf', x: -3.72, z: -11.3, rot: Math.PI / 2, w: 1.2, d: 0.44, h: 2.3 },
  { type: 'roundTable', x: -2.35, z: -10.6, d: 0.7 },
  { type: 'spindleChair', x: -2.35, z: -9.85, face: [-2.35, -10.6] },
  { type: 'carvedChair', x: -1.62, z: -10.85, face: [-2.35, -10.6] },
  // D. 樓梯入口與扭蛋機（北牆）
  { type: 'flyerCabinet', x: -1.25, z: -11.88, w: 0.8, d: 0.55 },
  { type: 'gacha', x: CAFE.gacha.x, z: CAFE.gacha.z },
  { type: 'bike', x: 0.6, z: -11.98 },
  { type: 'extinguisher', x: 1.15, z: -12.03 },
]

/** 每種家具的佔地半寬、半深（本地座標，旋轉前）；沒有列出的不擋路（例如地毯、掛畫） */
const FOOTPRINT = {
  roundTable: (item) => [item.d / 2, item.d / 2],
  squareTable: (item) => [item.w / 2, item.d / 2],
  sewingDesk: (item) => [item.w / 2, item.d / 2],
  spindleChair: () => [0.24, 0.24],
  windsorChair: () => [0.25, 0.25],
  leatherChair: () => [0.25, 0.26],
  armChair: () => [0.29, 0.28],
  bentwoodChair: () => [0.22, 0.24],
  carvedChair: () => [0.25, 0.25],
  softChair: () => [0.38, 0.38],
  cactus: () => [0.24, 0.24],
  plant: () => [0.28, 0.28],
  floorLamp: () => [0.18, 0.18],
  backCabinet: (item) => [item.w / 2, item.d / 2],
  barCounter: (item) => [item.w / 2 + 0.02, item.d / 2 + 0.02],
  barGate: (item) => [item.w / 2, 0.08],
  bookshelf: (item) => [item.w / 2, item.d / 2],
  magazineRack: (item) => [item.w / 2, item.d / 2],
  sofa: (item) => [item.w / 2, item.d / 2],
  lowTable: (item) => [item.w / 2, item.d / 2],
  latticeShelf: (item) => [item.w / 2, item.d / 2],
  flyerCabinet: (item) => [item.w / 2, item.d / 2],
  gacha: () => [0.27, 0.24],
  bike: () => [0.4, 0.18],
  extinguisher: () => [0.12, 0.12],
}

/**
 * 家具的高度（公尺，從二樓地板起算）：鏡頭的遮擋方塊用。
 * 跟隨鏡頭與觀賞模式的鏡頭停在家具前面，不會停進書架、木櫃或冰滴咖啡架裡。
 */
const HEIGHT = {
  roundTable: 0.78,
  squareTable: 0.78,
  sewingDesk: 0.8,
  lowTable: 0.46,
  spindleChair: 0.96,
  windsorChair: 0.96,
  leatherChair: 1.0,
  armChair: 0.96,
  bentwoodChair: 0.96,
  carvedChair: 1.26,
  softChair: 0.98,
  sofa: 0.92,
  cactus: 1.95,
  plant: (item) => 1.5 * (item.size ?? 1),
  floorLamp: 1.75,
  backCabinet: 2.75,
  barGate: 0.96,
  bookshelf: (item) => item.h,
  magazineRack: 0.92,
  latticeShelf: (item) => item.h,
  flyerCabinet: 2.62,
  bike: 0.72,
  extinguisher: 0.62,
}

function itemRotation(item) {
  if (item.face) return Math.atan2(item.face[0] - item.x, item.face[1] - item.z)
  return item.rot ?? 0
}

/** 家具的障礙物（世界座標，二樓 level 1）：與 luguoCollision 一起放進年代的碰撞資料 */
export function cafeObstacles(transform) {
  const obstacles = []
  for (const item of CAFE_ITEMS) {
    const footprint = FOOTPRINT[item.type]
    if (!footprint) continue
    const [hx, hz] = footprint(item)
    const r = itemRotation(item)
    const c = Math.abs(Math.cos(r))
    const s = Math.abs(Math.sin(r))
    const ex = hx * c + hz * s
    const ez = hx * s + hz * c
    const a = transform(item.x - ex, item.z - ez)
    const b = transform(item.x + ex, item.z + ez)
    obstacles.push({ minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z), level: 1 })
  }
  return obstacles
}

/**
 * 家具的鏡頭遮擋方塊（屬於街景，與 cafeObstacles 使用同一份家具配置）。
 * 吧檯工作台本身與扭蛋機已經是可以點選的物件（luguoCafe.js 的 addSub），這裡另外加上檯面上的咖啡機與磨豆機。
 */
export function cafeFurnitureBlockers(b) {
  for (const item of CAFE_ITEMS) {
    const footprint = FOOTPRINT[item.type]
    const height = HEIGHT[item.type]
    if (!footprint || height == null) continue
    const [hx, hz] = footprint(item)
    const h = typeof height === 'function' ? height(item) : height
    const r = itemRotation(item)
    const c = Math.abs(Math.cos(r))
    const sn = Math.abs(Math.sin(r))
    const ex = hx * c + hz * sn
    const ez = hx * sn + hz * c
    b.addBlocker(item.x - ex, item.x + ex, F, F + h, item.z - ez, item.z + ez)
  }
  // 吧檯上的磨豆機與義式咖啡機（工作台的本地 x 從 -w/2 + 0.35 到 -w/2 + 2.1；工作台旋轉 90°，本地 x 對應建築的 -z）
  const counter = CAFE_ITEMS.find((item) => item.type === 'barCounter')
  const z0 = counter.z + counter.w / 2 - 2.1
  const z1 = counter.z + counter.w / 2 - 0.35
  b.addBlocker(counter.x - 0.32, counter.x + 0.3, F + 1.05, F + 1.85, z0, z1)
}

/* ── 小工具 ─────────────────────────────── */

/** 細的圓柱（腳、桿）：從 [x, y0, z] 往上 h */
function post(b, material, x, y0, z, h, r, tint, segments = 8) {
  b.cylinder(material, r, r, h, segments, [x, y0 + h / 2, z], { tint })
}

/* ── 椅子（本地 +z 為正面、座面朝前） ───────── */

/** A. 雕花直櫺椅：四腳、座面、兩根背柱、雕花的頂板與四根直櫺 */
function spindleChair(b, tint = '#8a5a38') {
  for (const [x, z] of [
    [-0.18, 0.18],
    [0.18, 0.18],
    [-0.18, -0.17],
    [0.18, -0.17],
  ]) {
    post(b, 'wood', x, 0, z, 0.44, 0.02, tint)
  }
  b.box('wood', [0.44, 0.04, 0.42], [0, 0.46, 0.01], { tint })
  for (const x of [-0.19, 0.19]) post(b, 'wood', x, 0.46, -0.18, 0.56, 0.02, tint)
  const crest = new Shape()
  crest.moveTo(-0.21, 0)
  crest.lineTo(0.21, 0)
  crest.lineTo(0.21, 0.08)
  crest.quadraticCurveTo(0, 0.2, -0.21, 0.08)
  crest.lineTo(-0.21, 0)
  b.extrude('wood', crest, 0.03, { position: [0, 0.92, -0.2], tint })
  for (let i = 0; i < 4; i++) post(b, 'wood', -0.11 + i * 0.075, 0.5, -0.19, 0.42, 0.009, tint, 6)
  b.box('wood', [0.4, 0.035, 0.02], [0, 0.7, -0.19], { tint })
}

/** B. 溫莎椅：外八的椅腳、略呈馬鞍形的座面、彎曲的頂梁與六根細直櫺 */
function windsorChair(b, tint = '#7a4f33') {
  for (const [x, z] of [
    [-0.17, 0.16],
    [0.17, 0.16],
    [-0.17, -0.15],
    [0.17, -0.15],
  ]) {
    b.cylinder('wood', 0.018, 0.022, 0.46, 8, [x * 1.08, 0.22, z * 1.08], { rotation: [z * 0.35, 0, -x * 0.35], tint })
  }
  b.box('wood', [0.46, 0.05, 0.44], [0, 0.46, 0], { tint })
  b.add('wood', new TorusGeometry(0.24, 0.018, 6, 16, Math.PI), { position: [0, 0.74, -0.04], rotation: [-Math.PI / 2 - 0.25, 0, 0], tint })
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.15 + (i / 5) * 0.7)
    post(b, 'wood', Math.cos(a) * 0.21, 0.48, -0.04 - Math.sin(a) * 0.17, 0.4, 0.009, tint, 6)
  }
}

/** C. 皮革靠背椅：黑色鐵腳、深棕色皮革的座墊與帶直紋的弧形靠背 */
function leatherChair(b, tint = '#5b3a2a') {
  for (const [x, z] of [
    [-0.19, 0.19],
    [0.19, 0.19],
    [-0.19, -0.18],
    [0.19, -0.18],
  ]) {
    post(b, 'steel', x, 0, z, 0.44, 0.014, IRON, 6)
  }
  b.box('cloth', [0.46, 0.09, 0.44], [0, 0.48, 0.01], { tint })
  b.box('cloth', [0.46, 0.4, 0.07], [0, 0.78, -0.21], { rotation: [-0.12, 0, 0], tint })
  for (let i = 0; i < 4; i++) b.box('dark', [0.012, 0.36, 0.01], [-0.15 + i * 0.1, 0.78, -0.17], { rotation: [-0.12, 0, 0], tint: '#3e2619' })
  post(b, 'steel', -0.2, 0.5, -0.2, 0.45, 0.012, IRON, 6)
  post(b, 'steel', 0.2, 0.5, -0.2, 0.45, 0.012, IRON, 6)
}

/** D. 木扶手椅：方正的木框、扶手、低靠背與花布座墊 */
function armChair(b, tint = '#6e4530') {
  for (const [x, z] of [
    [-0.24, 0.22],
    [0.24, 0.22],
    [-0.24, -0.22],
    [0.24, -0.22],
  ]) {
    b.box('wood', [0.05, 0.44, 0.05], [x, 0.22, z], { tint })
  }
  b.box('wood', [0.54, 0.05, 0.5], [0, 0.44, 0], { tint })
  b.box('cloth', [0.48, 0.06, 0.44], [0, 0.49, 0.01], { tint: '#7a6b5a' })
  for (const x of [-0.25, 0.25]) {
    b.box('wood', [0.05, 0.05, 0.5], [x, 0.68, 0], { tint })
    b.box('wood', [0.04, 0.22, 0.04], [x, 0.57, 0.2], { tint })
  }
  b.box('wood', [0.54, 0.34, 0.04], [0, 0.72, -0.23], { tint })
  b.box('wood', [0.5, 0.05, 0.05], [0, 0.92, -0.23], { tint })
}

/** E. 曲木椅：圓座面、四根細腳、環形的靠背 */
function bentwoodChair(b, tint = '#4e3022') {
  b.cylinder('wood', 0.21, 0.21, 0.04, 16, [0, 0.46, 0.02], { tint })
  b.add('wood', new TorusGeometry(0.2, 0.012, 6, 18), { position: [0, 0.32, 0.02], rotation: [Math.PI / 2, 0, 0], tint })
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    b.cylinder('wood', 0.014, 0.017, 0.46, 6, [Math.cos(a) * 0.16, 0.22, 0.02 + Math.sin(a) * 0.16], { tint })
  }
  b.add('wood', new TorusGeometry(0.17, 0.014, 6, 18), { position: [0, 0.78, -0.17], scale: [1, 1.15, 1], tint })
  for (const x of [-0.17, 0.17]) post(b, 'wood', x, 0.46, -0.17, 0.32, 0.013, tint, 6)
}

/** F. 高背雕花椅：比 A 更高的背柱與頂上的圓頭，背板中央是一塊雕花板 */
function carvedChair(b, tint = '#9a6a42') {
  for (const [x, z] of [
    [-0.19, 0.19],
    [0.19, 0.19],
    [-0.19, -0.18],
    [0.19, -0.18],
  ]) {
    post(b, 'wood', x, 0, z, 0.44, 0.022, tint)
  }
  b.box('wood', [0.46, 0.045, 0.44], [0, 0.46, 0], { tint })
  for (const x of [-0.2, 0.2]) {
    post(b, 'wood', x, 0.46, -0.19, 0.72, 0.022, tint)
    b.add('wood', new SphereGeometry(0.035, 8, 6), { position: [x, 1.2, -0.19], tint })
  }
  b.box('wood', [0.4, 0.05, 0.03], [0, 1.12, -0.19], { tint })
  b.box('wood', [0.22, 0.4, 0.025], [0, 0.82, -0.19], { tint: '#b07c4e' })
  b.add('wood', new SphereGeometry(0.07, 10, 8), { position: [0, 0.86, -0.17], scale: [1, 1.3, 0.3], tint: '#8a5a38' })
}

/** 綠色絨布扶手椅（靠背上鋪一塊白色鉤花墊） */
function softChair(b) {
  b.box('cloth', [0.74, 0.42, 0.7], [0, 0.21, 0], { tint: '#3f5a3a' })
  b.box('cloth', [0.74, 0.5, 0.18], [0, 0.66, -0.27], { tint: '#3f5a3a' })
  for (const x of [-0.32, 0.32]) b.box('cloth', [0.12, 0.26, 0.62], [x, 0.52, 0.02], { tint: '#36502f' })
  b.box('cloth', [0.48, 0.08, 0.52], [0, 0.46, 0.06], { tint: '#4a6844' })
  b.box('plain', [0.5, 0.3, 0.015], [0, 0.82, -0.17], { tint: '#f4f1e8' })
  for (const [x, z] of [
    [-0.3, 0.28],
    [0.3, 0.28],
    [-0.3, -0.28],
    [0.3, -0.28],
  ]) {
    post(b, 'wood', x, 0, z, 0.06, 0.025, WOOD_DARK, 6)
  }
}

const CHAIRS = { spindleChair, windsorChair, leatherChair, armChair, bentwoodChair, carvedChair, softChair }

/* ── 桌子 ─────────────────────────────── */

function roundTable(b, item) {
  const r = item.d / 2
  b.cylinder('wood', r, r, 0.045, 24, [0, 0.74, 0], { tint: '#b07a4a' })
  b.cylinder('wood', r - 0.02, r - 0.03, 0.03, 24, [0, 0.705, 0], { tint: '#8a5a38' })
  post(b, 'steel', 0, 0.04, 0, 0.66, 0.04, IRON, 10)
  b.cylinder('steel', 0.26, 0.3, 0.04, 16, [0, 0.02, 0], { tint: IRON })
}

function squareTable(b, item) {
  b.box('wood', [item.w, 0.045, item.d], [0, 0.74, 0], { tint: '#a8743f' })
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    b.box('wood', [0.05, 0.7, 0.05], [sx * (item.w / 2 - 0.06), 0.35, sz * (item.d / 2 - 0.06)], { tint: WOOD_DARK })
  }
  b.box('wood', [item.w - 0.1, 0.07, 0.03], [0, 0.66, item.d / 2 - 0.06], { tint: WOOD_DARK })
}

/** 縫紉機腳架改成的書桌：木桌面、黑色鑄鐵的側架（帶圓輪與踏板） */
function sewingDesk(b, item) {
  b.box('wood', [item.w, 0.05, item.d], [0, 0.75, 0], { tint: '#b98552' })
  b.box('wood', [item.w - 0.1, 0.1, item.d - 0.08], [0, 0.68, 0], { tint: '#8a5a38' })
  for (const s of [-1, 1]) {
    const x = s * (item.w / 2 - 0.12)
    b.box('steel', [0.04, 0.62, 0.05], [x, 0.33, item.d / 2 - 0.1], { tint: IRON })
    b.box('steel', [0.04, 0.62, 0.05], [x, 0.33, -item.d / 2 + 0.1], { tint: IRON })
    b.box('steel', [0.05, 0.05, item.d - 0.1], [x, 0.05, 0], { tint: IRON })
    b.add('steel', new TorusGeometry(0.15, 0.02, 6, 16), { position: [x, 0.4, 0], rotation: [0, Math.PI / 2, 0], tint: IRON })
  }
  b.box('steel', [item.w - 0.3, 0.03, 0.22], [0, 0.12, 0], { rotation: [0.15, 0, 0], tint: IRON })
}

function lowTable(b, item) {
  b.box('wood', [item.w, 0.04, item.d], [0, 0.44, 0], { tint: '#6b4430' })
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    b.box('wood', [0.04, 0.42, 0.04], [sx * (item.w / 2 - 0.05), 0.21, sz * (item.d / 2 - 0.05)], { tint: '#553522' })
  }
  b.box('wood', [item.w - 0.08, 0.02, item.d - 0.08], [0, 0.16, 0], { tint: '#553522' })
}

/* ── 收藏與閱讀 ─────────────────────────── */

/** 木書架：側板、背板與層板；書在 detail（一排排高低、顏色不同的書） */
function bookshelf(b, d, item) {
  const { w, h } = item
  const depth = item.d
  b.box('wood', [w, h, 0.03], [0, h / 2, -depth / 2 + 0.015], { tint: WOOD_DARK })
  for (const s of [-1, 1]) b.box('wood', [0.03, h, depth], [s * (w / 2 - 0.015), h / 2, 0], { tint: WOOD })
  const shelves = 5
  for (let i = 0; i <= shelves; i++) b.box('wood', [w - 0.03, 0.025, depth], [0, 0.05 + (i * (h - 0.08)) / shelves, 0], { tint: WOOD })
  const colors = ['#8b3a2e', '#2f4a6b', '#d9c9a3', '#4c6b4a', '#c98a3c', '#6a4c7a', '#e8e1d2', '#30302e', '#b45c4a']
  for (let i = 0; i < shelves; i++) {
    let x = -w / 2 + 0.05
    let k = i * 7
    const y = 0.065 + (i * (h - 0.08)) / shelves
    const maxH = (h - 0.08) / shelves - 0.05
    while (x < w / 2 - 0.08) {
      const bw = 0.025 + ((k * 37) % 9) * 0.005
      const bh = maxH * (0.62 + ((k * 13) % 7) * 0.05)
      if ((k * 11) % 13 === 0) {
        // 偶爾一疊平放的書或小擺飾
        d.box('plain', [0.16, 0.06, depth * 0.7], [x + 0.08, y + 0.03, 0.02], { tint: colors[(k + 3) % colors.length] })
        x += 0.18
      } else {
        d.box('plain', [bw, bh, depth * 0.78], [x + bw / 2, y + bh / 2, 0.02], { tint: colors[k % colors.length] })
        x += bw + 0.004
      }
      k++
    }
  }
}

/** 深色的中式木格架：格子側板、層板與幾件收藏（茶壺、木盒、書） */
function latticeShelf(b, d, item) {
  const { w, h } = item
  const depth = item.d
  for (const s of [-1, 1]) {
    b.box('wood', [0.05, h, 0.05], [s * (w / 2 - 0.025), h / 2, depth / 2 - 0.025], { tint: '#3e2619' })
    b.box('wood', [0.05, h, 0.05], [s * (w / 2 - 0.025), h / 2, -depth / 2 + 0.025], { tint: '#3e2619' })
    for (let i = 0; i < 6; i++) b.box('wood', [0.015, h - 0.2, 0.02], [s * (w / 2 - 0.025), h / 2, -depth / 2 + 0.07 + i * ((depth - 0.14) / 5)], { tint: '#4a2e1f' })
  }
  b.box('wood', [w, 0.06, depth], [0, h, 0], { tint: '#3e2619' })
  for (const y of [0.12, 0.62, 1.12, 1.62]) b.box('wood', [w - 0.06, 0.03, depth - 0.04], [0, y, 0], { tint: '#4a2e1f' })
  b.box('wood', [w - 0.06, 0.4, 0.02], [0, 0.32, -depth / 2 + 0.03], { tint: '#3e2619' })
  d.cylinder('plain', 0.08, 0.09, 0.14, 12, [-0.3, 0.71, 0], { tint: '#c9b28a' })
  d.box('wood', [0.3, 0.12, 0.2], [0.25, 0.7, 0], { tint: '#9a6a42' })
  d.cylinder('plain', 0.06, 0.07, 0.18, 10, [0.32, 1.23, 0], { tint: '#2f5d74' })
  for (let i = 0; i < 6; i++) d.box('plain', [0.04, 0.24 + (i % 3) * 0.04, 0.24], [-0.4 + i * 0.05, 1.27 + (i % 3) * 0.02, 0], { tint: ['#8b3a2e', '#e8e1d2', '#2f4a6b'][i % 3] })
  d.box('plain', [0.36, 0.26, 0.04], [0, 1.78, -0.15], { tint: '#d8c9a8' })
}

/** 雜誌展示架：斜放的三層木板與幾本雜誌 */
function magazineRack(b, d, item) {
  for (const s of [-1, 1]) b.box('wood', [0.03, 0.9, item.d], [s * (item.w / 2 - 0.015), 0.45, 0], { tint: WOOD })
  for (let i = 0; i < 3; i++) {
    b.box('wood', [item.w - 0.04, 0.02, 0.24], [0, 0.22 + i * 0.28, 0.02], { rotation: [-0.5, 0, 0], tint: WOOD })
    for (let k = 0; k < 2; k++) {
      d.box('plain', [0.22, 0.28, 0.01], [-0.14 + k * 0.28, 0.33 + i * 0.28, 0.06], { rotation: [-0.5, 0, 0], tint: ['#d65a4a', '#2f6d8a', '#e2c35a', '#5b7a52', '#efe8da', '#8a5aa0'][(i * 2 + k) % 6] })
    }
  }
}

/** 兩人座的皮沙發（木框、坐墊、扶手與抱枕） */
function sofa(b, item) {
  const { w } = item
  b.box('cloth', [w, 0.38, 0.78], [0, 0.24, 0], { tint: '#6b3f2a' })
  b.box('cloth', [w, 0.5, 0.2], [0, 0.66, -0.29], { tint: '#6b3f2a' })
  for (const s of [-1, 1]) b.box('cloth', [0.16, 0.24, 0.72], [s * (w / 2 - 0.08), 0.55, 0.02], { tint: '#5c3523' })
  for (const s of [-1, 1]) b.box('cloth', [w / 2 - 0.18, 0.1, 0.56], [s * (w / 4 - 0.04), 0.48, 0.07], { tint: '#7a4a32' })
  b.box('cloth', [0.36, 0.32, 0.12], [-w / 4, 0.66, -0.16], { rotation: [-0.2, 0, 0.1], tint: '#c9b48c' })
  b.box('cloth', [0.34, 0.3, 0.12], [w / 4, 0.66, -0.16], { rotation: [-0.2, 0, -0.08], tint: '#8a9a7a' })
  b.box('wood', [w + 0.04, 0.05, 0.8], [0, 0.03, 0], { tint: WOOD_DARK })
}

/* ── 咖啡吧檯 ─────────────────────────────── */

/**
 * 大木櫃（靠西牆）：下層的木門櫃當作工作檯，上層三組玻璃櫃門（直紋玻璃）、中央開放的層架；
 * 櫃頂排著彩色的茶壺、咖啡壺與杯子（detail），櫃門上貼著原創的小貼紙。
 */
function backCabinet(b, d, item) {
  const { w } = item
  const depth = item.d
  const lowH = 0.92
  const top = 2.45
  b.box('wood', [w, lowH, depth], [0, lowH / 2, 0], { tint: '#b07a48' })
  b.box('wood', [w + 0.04, 0.05, depth + 0.04], [0, lowH + 0.025, 0.01], { tint: '#6e4a2f' })
  for (let i = 0; i < 6; i++) b.box('wood', [w / 6 - 0.06, lowH - 0.16, 0.02], [-w / 2 + (i + 0.5) * (w / 6), lowH / 2, depth / 2 + 0.005], { tint: '#c08a55' })
  // 上層：玻璃櫃門（三組，每組兩扇）與中央的開放層架
  const upY = lowH + 0.4
  const upH = top - upY
  b.box('wood', [w, upH, 0.03], [0, upY + upH / 2, -depth / 2 + 0.03], { tint: '#8a5a38' })
  for (const s of [-1, 1]) b.box('wood', [0.05, upH, depth * 0.7], [s * (w / 2 - 0.025), upY + upH / 2, -depth * 0.15], { tint: '#b07a48' })
  b.box('wood', [w, 0.05, depth * 0.72], [0, top, -depth * 0.14], { tint: '#b07a48' })
  b.box('wood', [w, 0.04, depth * 0.7], [0, upY, -depth * 0.15], { tint: '#b07a48' })
  const groups = [-w / 3, 0, w / 3]
  groups.forEach((cx, g) => {
    const gw = w / 3 - 0.06
    if (g === 1) {
      // 中央：開放的層架（音響與咖啡豆罐）
      b.box('wood', [gw, 0.025, depth * 0.6], [cx, upY + upH * 0.45, -depth * 0.18], { tint: '#b07a48' })
      b.box('dark', [0.52, 0.34, 0.2], [cx - 0.2, upY + upH * 0.45 + 0.19, -depth * 0.2], { tint: '#33302b' })
      b.box('perforated', [0.46, 0.26, 0.01], [cx - 0.2, upY + upH * 0.45 + 0.19, -depth * 0.2 + 0.105], { tint: '#9a8f7a' })
      for (let i = 0; i < 3; i++) d.cylinder('steel', 0.06, 0.06, 0.16, 10, [cx + 0.18 + i * 0.14, upY + 0.12, -depth * 0.15], { tint: '#c8b58a' })
      return
    }
    for (const s of [-1, 1]) {
      const dx = cx + s * (gw / 4)
      b.box('wood', [gw / 2 - 0.02, upH - 0.04, 0.03], [dx, upY + upH / 2, depth * 0.2], { tint: '#c08a55' })
      b.box('glassWarm', [gw / 2 - 0.12, upH - 0.16, 0.02], [dx, upY + upH / 2, depth * 0.2 + 0.012], {})
      for (let k = 0; k < 8; k++) b.box('plain', [0.008, upH - 0.18, 0.005], [dx - gw / 4 + 0.08 + k * ((gw / 2 - 0.16) / 7), upY + upH / 2, depth * 0.2 + 0.025], { tint: '#e9dcc4' })
      b.box('steel', [0.015, 0.22, 0.03], [dx - s * (gw / 4 - 0.06), upY + upH * 0.45, depth * 0.2 + 0.03], { tint: IRON })
    }
    // 原創的小貼紙（色塊）與中央層架兩側的紅色春聯（字在 luguoCafe.js 的招牌層，原創的吉祥話）
    if (g === 0) b.box('plain', [0.13, 0.95, 0.006], [cx + w / 6 - 0.11, upY + upH / 2, depth * 0.2 + 0.03], { tint: '#c8342c' })
    if (g === 2) b.box('plain', [0.13, 0.95, 0.006], [cx - w / 6 + 0.11, upY + upH / 2, depth * 0.2 + 0.03], { tint: '#c8342c' })
    d.box('plain', [0.22, 0.3, 0.005], [cx - gw / 4, upY + upH * 0.6, depth * 0.2 + 0.03], { tint: ['#d6573f', '#2e6fa0', '#e8c04a'][g] })
    d.box('plain', [0.16, 0.16, 0.005], [cx + gw / 4, upY + upH * 0.35, depth * 0.2 + 0.03], { rotation: [0, 0, Math.PI / 4], tint: ['#c8342c', '#e5b84a', '#3e7a5a'][g] })
  })
  // 櫃頂：彩色的琺瑯咖啡壺、茶壺與杯子（照片中排成一排）
  const pots = ['#c8342c', '#d3b45a', '#f2efe8', '#2e6fa0', '#2b2b2b', '#c8342c', '#d3b45a', '#f2efe8', '#2e6fa0', '#3a2a22']
  pots.forEach((tint, i) => {
    const x = -w / 2 + 0.3 + i * ((w - 0.6) / (pots.length - 1))
    const y = top + 0.025
    d.cylinder('plain', 0.075, 0.09, 0.2, 12, [x, y + 0.1, -depth * 0.14], { tint })
    d.cylinder('plain', 0.03, 0.06, 0.06, 10, [x, y + 0.23, -depth * 0.14], { tint })
    d.cylinder('plain', 0.008, 0.012, 0.2, 6, [x + 0.12, y + 0.14, -depth * 0.14], { rotation: [0, 0, -0.9], tint })
    if (i % 3 === 1) d.cylinder('plain', 0.04, 0.035, 0.07, 10, [x + 0.2, y + 0.035, -depth * 0.1], { tint: i % 2 ? '#c8342c' : '#f2efe8' })
  })
  // 櫃頂一端的「LUGUO CAFE」木字塊（字在 luguoCafe.js 的招牌層）
  b.box('wood', [1.3, 0.2, 0.08], [w / 2 - 0.8, top + 0.125, depth * 0.08], { tint: '#7a8c78' })
}

/** 吧檯工作台：木作檯身、深色檯面、檯前的木條，以及檯面上的咖啡機具（大型的在主網格，細小的在 detail） */
function barCounter(b, d, item) {
  const { w } = item
  const depth = item.d
  const h = 1.05
  b.box('wood', [w, h - 0.06, depth], [0, (h - 0.06) / 2, 0], { tint: '#9a6a42' })
  // 檯前：上排一列抽屜（黃銅把手），下面是直條木板
  for (let i = 0; i < 9; i++) b.box('wood', [0.05, 0.62, 0.02], [-w / 2 + 0.25 + i * ((w - 0.5) / 8), 0.36, depth / 2 + 0.01], { tint: '#7a4f33' })
  const drawers = 5
  const dw = (w - 0.3) / drawers
  for (let i = 0; i < drawers; i++) {
    const x = -w / 2 + 0.15 + (i + 0.5) * dw
    b.box('wood', [dw - 0.05, 0.2, 0.025], [x, 0.84, depth / 2 + 0.012], { tint: '#b07a48' })
    b.box('steel', [0.1, 0.022, 0.03], [x, 0.84, depth / 2 + 0.035], { tint: '#b8933e' })
  }
  b.box('steel', [w + 0.06, 0.06, depth + 0.06], [0, h - 0.03, 0], { tint: '#6d6a64' })
  // 義式咖啡機（不鏽鋼，兩個沖煮頭）
  const em = { x: -w / 2 + 1.6, y: h }
  b.box('steel', [0.9, 0.42, 0.52], [em.x, em.y + 0.21, -0.05], { tint: '#c9ccc9' })
  b.box('steel', [0.92, 0.06, 0.54], [em.x, em.y + 0.45, -0.05], { tint: '#9fa3a1' })
  b.box('steel', [0.86, 0.04, 0.12], [em.x, em.y + 0.06, 0.24], { tint: '#7c807e' })
  for (const s of [-1, 1]) {
    b.cylinder('steel', 0.05, 0.05, 0.08, 12, [em.x + s * 0.22, em.y + 0.22, 0.24], { tint: '#d8dbd8' })
    b.box('dark', [0.04, 0.03, 0.22], [em.x + s * 0.22, em.y + 0.18, 0.36], { tint: IRON })
    b.cylinder('steel', 0.012, 0.012, 0.2, 6, [em.x + s * 0.42, em.y + 0.3, 0.26], { rotation: [0.5, 0, 0], tint: '#bfc3c0' })
  }
  b.box('glassClear', [0.5, 0.3, 0.02], [em.x, em.y + 0.62, 0.15], {})
  // 磨豆機（黑色機身、茶色的豆槽）
  const gx = -w / 2 + 0.55
  b.box('dark', [0.22, 0.42, 0.3], [gx, h + 0.21, -0.02], { tint: '#262423' })
  b.cylinder('dark', 0.07, 0.07, 0.12, 12, [gx, h + 0.48, -0.02], { tint: '#262423' })
  b.cylinder('glassWarm', 0.14, 0.07, 0.24, 14, [gx, h + 0.66, -0.02], {})
  // 手沖區：濾杯架、濾杯、細口壺與分享壺
  const px = -w / 2 + 2.75
  for (const s of [-1, 1]) {
    b.box('steel', [0.18, 0.02, 0.18], [px + s * 0.22, h + 0.22, 0.05], { tint: '#3a3a38' })
    b.cylinder('steel', 0.01, 0.01, 0.22, 6, [px + s * 0.22, h + 0.11, -0.03], { tint: '#3a3a38' })
    b.cylinder('plain', 0.08, 0.04, 0.09, 12, [px + s * 0.22, h + 0.28, 0.05], { tint: s < 0 ? '#f4f1ea' : '#2a2a28' })
    d.cylinder('glassClear', 0.06, 0.07, 0.13, 12, [px + s * 0.22, h + 0.065, 0.05], {})
  }
  b.cylinder('steel', 0.07, 0.08, 0.16, 12, [px + 0.55, h + 0.08, -0.08], { tint: '#2b2b2b' })
  b.cylinder('steel', 0.01, 0.014, 0.26, 6, [px + 0.66, h + 0.15, -0.08], { rotation: [0, 0, -1.0], tint: '#2b2b2b' })
  // 玻璃展示櫃（咖啡豆）
  const cx = w / 2 - 0.55
  b.box('wood', [0.8, 0.06, 0.46], [cx, h + 0.03, 0], { tint: '#6e4a2f' })
  b.box('glassClear', [0.78, 0.36, 0.44], [cx, h + 0.24, 0], {})
  for (let i = 0; i < 4; i++) d.box('plain', [0.14, 0.2, 0.08], [cx - 0.28 + i * 0.19, h + 0.16, 0], { tint: ['#c99a52', '#3f3a35', '#e6dccb', '#8b3a2e'][i] })
  // 細小的器具：杯子、量匙、電子秤、濾紙、商品盒（精緻模式）
  for (let i = 0; i < 6; i++) d.cylinder('plain', 0.04, 0.035, 0.07, 10, [em.x - 0.3 + i * 0.12, em.y + 0.515, -0.12], { tint: i % 2 ? '#f2efe8' : '#e8e0d0' })
  d.box('dark', [0.16, 0.025, 0.14], [px, h + 0.0125, 0.22], { tint: '#1f1f1f' })
  d.cylinder('plain', 0.07, 0.07, 0.12, 14, [px - 0.55, h + 0.06, 0.12], { tint: '#f3efe6' })
  for (let i = 0; i < 4; i++) {
    d.box('plain', [0.16, 0.22, 0.06], [-w / 2 + 0.95 + i * 0.18, h + 0.11, 0.24], { tint: ['#b8463a', '#d9b25c', '#2f4a6b', '#efe3c8'][i] })
  }
  d.box('plain', [0.26, 0.16, 0.16], [cx + 0.1, h + 0.08, 0.3], { tint: '#e1c49a' })
  d.box('plain', [0.24, 0.12, 0.14], [cx - 0.22, h + 0.06, 0.3], { tint: '#6c8a9c' })
}

/** 吧檯後方入口的矮門（員工區） */
function barGate(b, item) {
  b.box('wood', [item.w, 0.95, 0.05], [0, 0.48, 0], { tint: '#8a5a38' })
}

/* ── 樓梯入口與扭蛋機 ─────────────────────── */

/**
 * 紅黑色的雙層扭蛋機：黑色底座、兩台紅色機身（投幣口與旋鈕）、透明的上蓋；
 * 透明外殼裡的扭蛋與商品示意卡在 detail（不使用實際商品的圖樣）。
 */
function gacha(b, d) {
  b.box('dark', [0.46, 0.08, 0.4], [0, 0.04, 0], { tint: '#1e1d1c' })
  const unit = (y0, scale) => {
    const w = 0.44 * scale
    b.box('plain', [w, 0.34, 0.36], [0, y0 + 0.17, 0], { tint: '#c8282e' })
    b.box('steel', [0.16, 0.18, 0.02], [-0.08, y0 + 0.19, 0.185], { tint: '#c9ccc9' })
    b.cylinder('steel', 0.05, 0.05, 0.03, 12, [-0.08, y0 + 0.19, 0.205], { rotation: [Math.PI / 2, 0, 0], tint: '#dfe2df' })
    b.box('plain', [0.1, 0.08, 0.02], [0.12, y0 + 0.14, 0.185], { tint: '#b8bcbb' })
    b.add('glassClear', new CylinderGeometry(0.2 * scale, 0.2 * scale, 0.34, 16, 1, false, -Math.PI / 2, Math.PI), {
      position: [0, y0 + 0.34 + 0.13, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [1, 1.25, 1.05],
    })
    b.box('plain', [w, 0.08, 0.36], [0, y0 + 0.38, 0], { tint: '#1e1d1c' })
    for (let i = 0; i < 9; i++) {
      d.add('plain', new SphereGeometry(0.03, 8, 6), {
        position: [-0.12 + (i % 5) * 0.06, y0 + 0.43 + Math.floor(i / 5) * 0.05, -0.05 + (i % 3) * 0.05],
        tint: ['#f2efe8', '#c99a52', '#2f4a6b', '#8b3a2e'][i % 4],
      })
    }
    d.box('plain', [0.3, 0.18, 0.005], [0, y0 + 0.5, 0.12], { tint: '#2a2622' })
  }
  unit(0.08, 1)
  unit(0.6, 1.1)
  // 頂上的大透明罩
  b.add('glassClear', new CylinderGeometry(0.24, 0.24, 0.48, 18, 1, false, -Math.PI / 2, Math.PI), {
    position: [0, 1.36, 0],
    rotation: [0, 0, Math.PI / 2],
    scale: [1, 1.0, 0.95],
  })
  b.box('plain', [0.5, 0.12, 0.4], [0, 1.18, 0], { tint: '#1e1d1c' })
  b.box('plain', [0.5, 0.06, 0.4], [0, 1.25, 0], { tint: '#c8282e' })
  d.box('plain', [0.2, 0.14, 0.02], [0.05, 1.42, 0], { tint: '#c9a46a' })
}

/** 摺疊起來的腳踏車（兩個小輪子並排、車架、座墊） */
function bike(b) {
  for (const z of [-0.07, 0.07]) {
    b.add('dark', new TorusGeometry(0.2, 0.025, 6, 18), { position: [z * 2.2, 0.21, z], tint: '#1c1c1c' })
    b.add('steel', new TorusGeometry(0.17, 0.008, 4, 16), { position: [z * 2.2, 0.21, z], tint: '#9ea3a2' })
  }
  b.box('steel', [0.5, 0.04, 0.04], [0, 0.35, 0], { rotation: [0, 0, 0.35], tint: '#2a2a2a' })
  b.box('steel', [0.04, 0.5, 0.04], [0.12, 0.4, 0.04], { tint: '#2a2a2a' })
  b.box('cloth', [0.2, 0.06, 0.1], [0.12, 0.66, 0.04], { tint: '#8a7a68' })
  b.box('steel', [0.3, 0.03, 0.03], [-0.15, 0.5, -0.05], { rotation: [0, 0.4, -0.3], tint: '#a9aead' })
}

function extinguisher(b) {
  b.cylinder('plain', 0.08, 0.085, 0.42, 12, [0, 0.21, 0], { tint: '#c8282e' })
  b.cylinder('dark', 0.03, 0.04, 0.08, 8, [0, 0.46, 0], { tint: '#1e1d1c' })
  b.box('dark', [0.12, 0.02, 0.03], [0.04, 0.5, 0], { tint: '#1e1d1c' })
}

/** 放傳單的小木櫃與櫃上的冰滴咖啡架（木框、上方的冰水瓶、中段的咖啡粉槽、螺旋管與下方的玻璃壺） */
function flyerCabinet(b, d, item) {
  const { w } = item
  const depth = item.d
  b.box('wood', [w, 0.82, depth], [0, 0.41, 0], { tint: '#b07a48' })
  b.box('wood', [w + 0.03, 0.04, depth + 0.03], [0, 0.84, 0], { tint: '#8a5a38' })
  b.box('wood', [w - 0.08, 0.16, 0.02], [0, 0.6, depth / 2 + 0.005], { tint: '#c08a55' })
  b.box('steel', [0.14, 0.02, 0.02], [0, 0.6, depth / 2 + 0.02], { tint: IRON })
  // 抽屜裡的傳單（原創的色塊）
  for (let i = 0; i < 6; i++) d.box('plain', [0.14, 0.2, 0.01], [-0.3 + i * 0.12, 0.35, depth / 2 + 0.01], { rotation: [0.2, 0, 0], tint: ['#e8c04a', '#2f4a6b', '#d65a4a', '#efe8da', '#5b7a52', '#30302e'][i] })
  // 冰滴咖啡架
  b.group([0.12, 0.86, 0], 0, () => {
    for (const s of [-1, 1]) post(b, 'wood', s * 0.2, 0, -0.08, 1.75, 0.025, '#3e2619')
    for (const y of [0.05, 0.62, 1.12, 1.7]) b.box('wood', [0.48, 0.035, 0.24], [0, y, 0], { tint: '#3e2619' })
    b.cylinder('glassClear', 0.11, 0.11, 0.4, 14, [0, 1.42, 0], {})
    b.cylinder('steel', 0.012, 0.012, 0.1, 6, [0, 1.17, 0], { tint: '#c9ccc9' })
    b.cylinder('dark', 0.06, 0.06, 0.32, 12, [0, 0.95, 0], { tint: '#2a1c14' })
    b.add('glassClear', new TorusGeometry(0.06, 0.008, 4, 14), { position: [0, 0.72, 0], rotation: [Math.PI / 2, 0, 0] })
    b.add('glassClear', new TorusGeometry(0.06, 0.008, 4, 14), { position: [0, 0.69, 0], rotation: [Math.PI / 2, 0, 0] })
    b.cylinder('glassClear', 0.1, 0.12, 0.26, 14, [0, 0.2, 0], {})
    b.cylinder('dark', 0.095, 0.11, 0.08, 14, [0, 0.1, 0], { tint: '#3b2418' })
  })
}

/* ── 燈具、植物與牆上的東西 ─────────────────── */

/** 銅色的球形吊燈 */
function copperPendant(b, x, z, y = 6.35) {
  b.cylinder('steel', 0.006, 0.006, A.ceiling2 - y - 0.12, 4, [x, (A.ceiling2 + y + 0.12) / 2, z], { tint: '#3a3a38' })
  b.add('steel', new SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), { position: [x, y, z], rotation: [Math.PI, 0, 0], tint: COPPER })
  b.cylinder('bulb', 0.06, 0.06, 0.06, 10, [x, y - 0.04, z], { tint: '#fff4dc' })
}

/** 一串彩色的紙燈籠（粉、橘、紅、綠、黃、藍） */
function paperLanterns(b, x, z) {
  const colors = ['#f2b8b4', '#e98a4a', '#d8382e', '#7ab34a', '#f0d24a', '#3a9ad9']
  b.cylinder('steel', 0.005, 0.005, 1.0, 4, [x, A.ceiling2 - 0.5, z], { tint: '#3a3a38' })
  colors.forEach((tint, i) => {
    b.add('cloth', new SphereGeometry(0.17 - Math.abs(i - 2.5) * 0.008, 12, 9), { position: [x + (i % 2) * 0.06, A.ceiling2 - 0.95 - i * 0.31, z], scale: [1, 0.86, 1], tint })
  })
}

/** 大型盆栽：大戟屬的柱狀植物（照片中的仙人掌造型） */
function cactus(b) {
  b.cylinder('plain', 0.2, 0.16, 0.34, 14, [0, 0.17, 0], { tint: '#9a5a3c' })
  b.cylinder('earth', 0.19, 0.19, 0.03, 12, [0, 0.33, 0], { tint: '#5a4232' })
  for (const [x, z, h, r] of [
    [0, 0, 1.6, 0.06],
    [0.08, 0.05, 1.25, 0.05],
    [-0.08, 0.03, 1.4, 0.05],
    [0.02, -0.08, 1.05, 0.045],
    [-0.06, -0.06, 0.9, 0.04],
  ]) {
    b.cylinder('plain', r * 0.8, r, h, 8, [x, 0.34 + h / 2, z], { tint: '#3f6a3a' })
    for (let i = 1; i < 4; i++) b.add('plain', new IcosahedronGeometry(r * 0.9, 0), { position: [x + (i % 2 ? r : -r), 0.34 + (h * i) / 4, z], scale: [1, 0.5, 1], tint: '#4f7a46' })
  }
}

function floorLamp(b) {
  b.cylinder('steel', 0.14, 0.16, 0.03, 14, [0, 0.015, 0], { tint: '#40403c' })
  post(b, 'steel', 0, 0.03, 0, 1.42, 0.012, '#5a5c58', 6)
  b.cylinder('plain', 0.08, 0.16, 0.2, 14, [0, 1.5, 0.06], { rotation: [0.4, 0, 0], tint: '#5c6f6a' })
}

/**
 * 原創的抽象畫（不是店內實際的作品）：木框、畫布底色與幾塊幾何色塊。
 * palette 依序是：底色、主色、點綴色；kind 決定構圖（色帶、圓、拼塊）。
 */
function painting(b, w, h, { palette, kind = 0 }) {
  const [bg, main, accent] = palette
  b.box('wood', [w + 0.1, h + 0.1, 0.05], [0, 0, 0], { tint: '#6e4a2f' })
  b.box('plain', [w, h, 0.02], [0, 0, 0.02], { tint: bg })
  if (kind === 0) {
    b.box('plain', [w, h * 0.28, 0.01], [0, -h * 0.36, 0.033], { tint: main })
    b.cylinder('plain', w * 0.14, w * 0.14, 0.01, 18, [w * 0.18, h * 0.18, 0.033], { rotation: [Math.PI / 2, 0, 0], tint: accent })
  } else if (kind === 1) {
    for (let i = 0; i < 3; i++) b.box('plain', [w * 0.22, h * (0.3 + i * 0.18), 0.01], [-w * 0.3 + i * w * 0.3, -h * 0.5 + h * (0.15 + i * 0.09), 0.033], { tint: i === 1 ? accent : main })
  } else {
    b.box('plain', [w * 0.46, h * 0.46, 0.01], [-w * 0.2, h * 0.18, 0.033], { tint: main })
    b.box('plain', [w * 0.34, h * 0.3, 0.01], [w * 0.22, -h * 0.22, 0.034], { tint: accent })
    b.box('plain', [w * 0.8, 0.02, 0.01], [0, -h * 0.02, 0.035], { tint: '#f4efe4' })
  }
}

/** 北牆的海報（原創：米白底上一格一格的乾貨圓點）與小相框 */
function poster(b, w, h) {
  b.box('steel', [w + 0.06, h + 0.06, 0.03], [0, 0, 0], { tint: '#b9bcbb' })
  b.box('plain', [w, h, 0.01], [0, 0, 0.018], { tint: '#efe9dc' })
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      b.cylinder('plain', 0.03, 0.03, 0.006, 8, [-w * 0.32 + c * w * 0.16, h * 0.28 - r * h * 0.09, 0.025], { rotation: [Math.PI / 2, 0, 0], tint: ['#8a5a38', '#c99a52', '#3f3a35', '#a8463a', '#6f7a4a'][(r + c) % 5] })
    }
  }
  b.box('plain', [w * 0.8, h * 0.12, 0.006], [0, -h * 0.36, 0.024], { tint: '#9cb7c4' })
}

/** 地毯（波斯紋樣簡化成邊框與中央的菱形） */
function rug(b, w, d) {
  b.box('cloth', [w, 0.012, d], [0, 0.006, 0], { tint: '#8a2f2a' })
  b.box('cloth', [w - 0.2, 0.014, d - 0.2], [0, 0.008, 0], { tint: '#2f3f5a' })
  b.box('cloth', [w - 0.5, 0.016, d - 0.5], [0, 0.01, 0], { tint: '#b84a3a' })
  b.box('cloth', [0.5, 0.018, 0.5], [0, 0.012, 0], { rotation: [0, Math.PI / 4, 0], tint: '#e3c17a' })
}

/* ── 室內的地板、牆面與窗光 ───────────────── */

/** 地板（陶磚）、四面牆的內側（米白，留出窗與門）、天花 */
function interiorShell(b) {
  const { minX, maxX, minZ, maxZ, door } = CAFE
  const y0 = A.floor2
  const C = A.ceiling2
  b.box('terracotta', [maxX - minX, 0.01, maxZ - minZ], [(minX + maxX) / 2, F + 0.005, (minZ + maxZ) / 2], { tint: '#d9c6b0' })
  const side = sideOpenings()
  const fr = frontOpenings()
  const east = [...side.tower, ...side.bays.slice(0, 3)].map(([a0, a1]) => ({ a0, a1, ...LUGUO_WIN2 }))
  const south = [...fr.wing, ...fr.tower].map(([a0, a1]) => ({ a0, a1, ...LUGUO_WIN2 }))
  const skin = { inward: -1, y0, y1: C, t: 0.012, material: 'plaster', tint: '#f6eedf', grime: 0 }
  wallWithOpenings(b, { ...skin, along: 'z', plane: maxX - 0.002, from: minZ, to: maxZ, openings: east })
  wallWithOpenings(b, { ...skin, along: 'x', plane: maxZ - 0.002, from: minX, to: maxX, openings: south })
  wallWithOpenings(b, { ...skin, along: 'z', plane: minX + 0.014, from: minZ, to: maxZ })
  wallWithOpenings(b, { ...skin, along: 'x', plane: minZ + 0.014, from: minX, to: maxX, openings: [{ a0: door.minX, a1: door.maxX, y0, y1: y0 + 2.35 }] })
  b.box('plaster', [maxX - minX, 0.012, maxZ - minZ], [(minX + maxX) / 2, C - 0.006, (minZ + maxZ) / 2], { tint: '#fbf7f0' })
  // 木踢腳板
  for (const [along, plane, from, to] of [
    ['z', maxX - 0.02, minZ, maxZ],
    ['z', minX + 0.03, minZ, maxZ],
    ['x', maxZ - 0.02, minX, maxX],
    ['x', minZ + 0.03, minX, door.minX],
    ['x', minZ + 0.03, door.maxX, maxX],
  ]) {
    orient(b, along, 'wood', [(from + to) / 2, F + 0.06, plane], [to - from, 0.12, 0.02], { tint: '#6e4a2f' })
  }
}

/**
 * 從南側（迪化街側）窗戶照進來的陽光：太陽在西南方，窗格的影子斜斜地落在地磚上。
 * 每一格玻璃投影成地板上的一塊亮色平行四邊形（亮塊之間就是窗框的影子），不用即時陰影。
 */
const SUN_STEP = { x: 0.62, z: -0.71 } // 高度每 1 公尺，影子往 +x、-z 移動的距離（與街景陽光的方向一致）

function windowLight(b) {
  const { maxZ } = CAFE
  const fr = frontOpenings()
  const { y0, y1 } = LUGUO_WIN2
  const transom = 0.5
  for (const [a0, a1] of [...fr.wing, ...fr.tower]) {
    const sashes = a1 - a0 > 1 ? 4 : 1
    const sw = (a1 - a0) / sashes
    const ty = y1 - transom
    const rows = [
      [y0 + 0.08, y0 + (ty - y0) / 3 - 0.02],
      [y0 + (ty - y0) / 3 + 0.02, y0 + ((ty - y0) * 2) / 3 - 0.02],
      [y0 + ((ty - y0) * 2) / 3 + 0.02, ty - 0.04],
      [ty + 0.04, y1 - 0.08],
    ]
    for (let i = 0; i < sashes; i++) {
      const p0 = a0 + i * sw + 0.06
      const p1 = a0 + (i + 1) * sw - 0.06
      for (const [h0, h1] of rows) {
        const lo = h0 - A.floor2
        const hi = h1 - A.floor2
        const corners = [
          [p0 + SUN_STEP.x * lo, maxZ + SUN_STEP.z * lo],
          [p1 + SUN_STEP.x * lo, maxZ + SUN_STEP.z * lo],
          [p1 + SUN_STEP.x * hi, maxZ + SUN_STEP.z * hi],
          [p0 + SUN_STEP.x * hi, maxZ + SUN_STEP.z * hi],
        ]
        // 亮塊只畫在店裡的地板上（不伸進牆裡）
        if (corners.some(([x]) => x > CAFE.maxX - 0.05 || x < CAFE.minX + 0.05)) continue
        const shape = new Shape()
        shape.moveTo(corners[0][0], -corners[0][1])
        for (const [x, z] of corners.slice(1)) shape.lineTo(x, -z)
        shape.lineTo(corners[0][0], -corners[0][1])
        b.extrude('terracotta', shape, 0.004, { position: [0, F + 0.011, 0], rotation: [-Math.PI / 2, 0, 0], tint: '#ffffff' })
      }
    }
  }
}

/* ── 主程式 ─────────────────────────────── */

const SIMPLE = { roundTable, squareTable, sewingDesk, lowTable, sofa, barGate, cactus, floorLamp, bike, extinguisher }
const WITH_DETAIL = { bookshelf, latticeShelf, magazineRack, backCabinet, barCounter, gacha, flyerCabinet }

export function buildLuguoCafeInterior(b, config, detail = b) {
  interiorShell(b)
  windowLight(b)
  for (const item of CAFE_ITEMS) {
    const rot = itemRotation(item)
    b.push([item.x, F, item.z], rot)
    detail.push([item.x, F, item.z], rot)
    if (CHAIRS[item.type]) CHAIRS[item.type](b)
    else if (SIMPLE[item.type]) SIMPLE[item.type](b, item)
    else if (WITH_DETAIL[item.type]) WITH_DETAIL[item.type](b, detail, item)
    else if (item.type === 'plant') pottedPlant(b, [0, 0, 0], { seed: 61, size: item.size ?? 1, potTint: '#6d4b3a' })
    detail.pop()
    b.pop()
  }
  // 地毯（沙發前）與牆上的畫（原創的抽象色塊）
  b.group([-2.85, F, -7.2], 0, () => rug(b, 1.9, 2.6))
  const hang = (x, y, z, rot, w, h, opts) => b.group([x, y, z], rot, () => painting(b, w, h, opts))
  hang(CAFE.maxX - 0.03, A.floor2 + 1.75, -2.78, -Math.PI / 2, 0.62, 0.8, { palette: ['#2f5f9e', '#e9c64a', '#c8342c'], kind: 0 })
  hang(CAFE.maxX - 0.03, A.floor2 + 1.75, -6.05, -Math.PI / 2, 0.6, 0.76, { palette: ['#f1e6d0', '#3f6a8a', '#d9603a'], kind: 1 })
  hang(CAFE.maxX - 0.03, A.floor2 + 1.75, -9.2, -Math.PI / 2, 0.6, 0.76, { palette: ['#3a8a7a', '#f2d6a2', '#2a2f4a'], kind: 2 })
  hang(CAFE.minX + 0.03, A.floor2 + 1.85, -6.7, Math.PI / 2, 0.72, 0.72, { palette: ['#246a8e', '#8fc06a', '#f0f0e8'], kind: 2 })
  hang(CAFE.minX + 0.03, A.floor2 + 1.85, -7.75, Math.PI / 2, 0.66, 0.66, { palette: ['#2b6f9a', '#e98a4a', '#2f6e4a'], kind: 0 })
  hang(-0.6, A.floor2 + 1.9, CAFE.maxZ - 0.03, Math.PI, 0.56, 0.78, { palette: ['#d23a2f', '#f2c64a', '#2f4f8a'], kind: 1 })
  b.group([0.45, A.floor2 + 1.6, CAFE.minZ + 0.035], 0, () => poster(b, 0.62, 0.82))
  b.group([-1.45, A.floor2 + 1.95, CAFE.minZ + 0.035], 0, () => painting(b, 0.4, 0.3, { palette: ['#e2b04a', '#c8603a', '#f4efe4'], kind: 0 }))
  // 吊燈：吧檯上方兩盞銅色球燈、走道上方兩盞，一串彩色紙燈籠
  copperPendant(b, CAFE.bar.counterX, -0.3)
  copperPendant(b, CAFE.bar.counterX, -2.2)
  copperPendant(b, 0.4, -3.4)
  copperPendant(b, 0.4, -8.8)
  paperLanterns(b, 0.35, -6.3)
  // 吧檯上的盆栽與窗邊桌上的小植物
  pottedPlant(b, [CAFE.bar.counterX, F + 1.05, 0.9], { seed: 63, size: 0.45, potTint: '#2b2b2b' })
  // 吧檯後方（工作區，客人走不進去）地上的麻布咖啡豆袋，與檯面上一小袋（精緻模式）
  for (const [x, z, tint, r] of [
    [-2.92, 0.62, '#b89a6c', 0.2],
    [-2.88, 0.08, '#a88a5e', -0.15],
  ]) {
    b.group([x, F, z], r, () => {
      b.box('cloth', [0.44, 0.46, 0.3], [0, 0.23, 0], { tint })
      b.add('cloth', new IcosahedronGeometry(0.22, 1), { position: [0, 0.48, 0], scale: [1, 0.35, 0.7], tint })
      b.box('cloth', [0.3, 0.12, 0.012], [0, 0.26, 0.157], { tint: '#6d5236' })
    })
  }
  detail.box('cloth', [0.1, 0.2, 0.16], [CAFE.bar.counterX + 0.05, F + 1.15, -1.12], { tint: '#b89a6c' })
  for (const [x, z] of [
    [2.75, -4.45],
    [3.35, -7.6],
    [2.15, 0.55],
  ]) {
    detail.cylinder('plain', 0.05, 0.04, 0.07, 10, [x, F + 0.8, z], { tint: '#f2efe8' })
    detail.add('plain', new IcosahedronGeometry(0.06, 0), { position: [x, F + 0.88, z], tint: '#5f8a4a' })
  }
  // 窗邊書桌上的黃銅桌燈
  b.group([3.62, F + 0.78, -1.45], 0, () => {
    b.cylinder('steel', 0.07, 0.08, 0.02, 12, [0, 0.01, 0], { tint: '#b8933e' })
    post(b, 'steel', 0, 0.02, 0, 0.3, 0.01, '#b8933e', 6)
    b.cylinder('steel', 0.06, 0.12, 0.16, 14, [0, 0.38, 0], { tint: '#c9a24a' })
  })
  // 軌道燈與吊扇（精緻模式）
  for (const x of [-0.9, 1.9]) {
    detail.box('steel', [0.04, 0.03, CAFE.maxZ - CAFE.minZ - 1.5], [x, A.ceiling2 - 0.45, (CAFE.minZ + CAFE.maxZ) / 2], { tint: '#ece9e2' })
    for (let i = 0; i < 6; i++) {
      const z = CAFE.minZ + 1.4 + i * 2.1
      detail.cylinder('steel', 0.035, 0.045, 0.12, 10, [x, A.ceiling2 - 0.55, z], { rotation: [0.5, 0, 0], tint: '#f4f2ec' })
    }
  }
  detail.cylinder('steel', 0.08, 0.08, 0.12, 10, [0.35, A.ceiling2 - 0.36, -10.4], { tint: '#f1efe9' })
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    detail.box('plain', [0.7, 0.012, 0.12], [0.35 + Math.cos(a) * 0.4, A.ceiling2 - 0.43, -10.4 + Math.sin(a) * 0.4], { rotation: [0, -a, 0], tint: '#f1efe9' })
  }
}

/* ── 店內的招牌字與燈火（屬於街景的招牌層與燈火：室內細部還沒產生時也存在，與家具位置相同） ── */

/** 家具本地座標的一點 → 建築本地座標（家具以 rot 旋轉） */
function itemPoint(item, lx, ly, lz) {
  const r = itemRotation(item)
  return [item.x + lx * Math.cos(r) + lz * Math.sin(r), F + ly, item.z - lx * Math.sin(r) + lz * Math.cos(r)]
}

export function cafeSigns(b) {
  const find = (type) => CAFE_ITEMS.find((item) => item.type === type)
  const cabinet = find('backCabinet')
  // 大木櫃頂上的木字塊
  b.addSign({ text: 'LUGUO CAFE', style: 'modernLight', width: 1.2, height: 0.16, position: itemPoint(cabinet, cabinet.w / 2 - 0.8, 2.575, cabinet.d * 0.08 + 0.042), rotationY: itemRotation(cabinet) })
  // 大木櫃中央層架兩側的春聯（原創的吉祥話）
  const couplet = (lx, text) =>
    b.addSign({ text, style: 'couplet', vertical: true, width: 0.11, height: 0.86, position: itemPoint(cabinet, lx, 1.32 + 1.13 / 2, cabinet.d * 0.2 + 0.036), rotationY: itemRotation(cabinet) })
  couplet(-cabinet.w / 6 - 0.11, '豆香滿室')
  couplet(cabinet.w / 6 + 0.11, '茶暖人間')
  // 吧檯前的小黑板
  const counter = find('barCounter')
  b.addSign({ text: '手沖・義式', style: 'chalk', width: 0.62, height: 0.24, position: itemPoint(counter, counter.w / 2 - 0.7, 0.72, counter.d / 2 + 0.045), rotationY: itemRotation(counter) })
  // 扭蛋機的小標籤（一般字樣，不使用實際商品的圖樣）
  const machine = find('gacha')
  b.addSign({ text: '咖啡器具', style: 'redPlate', width: 0.16, height: 0.06, position: itemPoint(machine, 0.12, 0.27, 0.196), rotationY: itemRotation(machine) })
  b.addSign({ text: '迷你模型', style: 'label', width: 0.26, height: 0.08, position: itemPoint(machine, 0, 0.5 + 0.08, 0.127), rotationY: itemRotation(machine) })
  // 燈火：吧檯與走道的吊燈、紙燈籠、桌燈與立燈
  const glow = ([x, y, z], size, color = '#ffd9a0') => b.addGlow(x, y, z, size, color)
  glow([CAFE.bar.counterX, 6.15, -0.3], 0.9)
  glow([CAFE.bar.counterX, 6.15, -2.2], 0.9)
  glow([0.4, 6.15, -3.4], 0.9)
  glow([0.4, 6.15, -8.8], 0.9)
  glow([0.35, 5.6, -6.3], 1.2, '#ffc58a')
  glow([3.62, F + 1.05, -1.45], 0.6)
  glow([-3.62, F + 1.45, -8.44], 0.7)
}
