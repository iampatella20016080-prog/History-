import { IcosahedronGeometry, Shape, SphereGeometry, TorusGeometry } from 'three'
import { STREET } from '../config.js'
import { rollingShutter } from './facade.js'
import { bench, pottedPlant, shade } from './props.js'

/**
 * 滋養豆餡舖：迪化街與涼州街口的二層樓轉角街屋（老屋新生）。
 *
 * 依實地照片建模（尺寸由照片估算，並為了配合遊戲街道略為壓縮高度，並非精確測量）：
 * - 斜切的轉角立面面向路口：兩根延伸到屋頂的紅磚大柱、三扇長窗、「滋養豆餡舖」黑字橫帶，
 *   上方是渦卷紋、貝殼紋與大圓球的中央山牆
 * - 灰色洗石子牆面與水平紅磚飾帶、木窗框與窗下鐵欄杆、柱頂層疊圓球的小尖塔
 * - 涼州街一側三個開間、迪化街一側一個開間，各有自己的小山牆
 * - 一樓連續騎樓：柱與楣樑交接處的弧形托座、白色天花與圓形吸頂燈、深灰石板地坪
 * - 現代店面：黑色遮雨棚、淺色木作、灰色石材、大片玻璃與白色暖簾；轉角店內有淺層的陳設
 *
 * 本地座標：原點在迪化街側立面（樓上）後方一個步道深度處——與一般街屋相同，
 * 迪化街在 +z、樓上立面位於 z = 步道深度；涼州街在 -x，立面位於 x = SIDE_X。
 */
const WALK_D = STREET.walkwayDepth
const WALK_H = STREET.walkwayHeight

const SIDE_X = -4.5 // 涼州街側立面
const EAST_X = 4.5 // 與隔壁街屋的界牆
const FRONT_Z = WALK_D // 迪化街側立面
const CHAMFER = 4.6 // 轉角斜切的長度（沿兩條街各退 4.6 m）
const BACK_Z = -14.6
const WALL_T = 0.3

/** 立面的高度（公尺） */
const H = {
  ground: 4.0, // 騎樓淨高（楣樑下緣）
  ceiling: 4.3,
  sill: 5.3, // 二樓窗臺線腳
  winBottom: 5.48,
  winTop: 8.2,
  cornice: 9.3,
  corniceTop: 9.65,
  frieze: 10.85, // 轉角山牆的頂部簷口
  friezeTop: 11.05,
}

const C = {
  granite: '#aeb0b0',
  graniteDark: '#94979a',
  graniteLight: '#c4c5c4',
  relief: '#b9bab9',
  brick: '#ffffff',
  frame: '#5c4130',
  iron: '#272a2a',
  ceiling: '#f4f2ec',
  floor: '#8f8e8a',
  wood: '#ffffff',
  metal: '#6f767b',
  awning: '#232120',
}

/* ── 立面線（樓上外牆面）與柱位 ───────────── */
const NODES = [
  [SIDE_X, BACK_Z],
  [SIDE_X, -10.7],
  [SIDE_X, -6.8],
  [SIDE_X, FRONT_Z - CHAMFER],
  [SIDE_X + CHAMFER, FRONT_Z],
  [EAST_X, FRONT_Z],
]

const BIG = 0.95
const SMALL = 0.62
const PIER_INSET = 0.1 // 柱心往牆內退，柱子凸出立面約 0.2–0.35 m

/**
 * 柱：位置（本地）、旋轉、尺寸、尖塔高度。
 * 轉角兩根大柱以兩面牆的角平分線為方向；兩端的柱子往牆內收，不越過地界。
 */
const PIERS = [
  { node: 0, rotationY: -Math.PI / 2, size: SMALL, along: 0.31, post: 0.95 },
  { node: 1, rotationY: -Math.PI / 2, size: SMALL, post: 0.95 },
  { node: 2, rotationY: -Math.PI / 2, size: SMALL, post: 0.95 },
  { node: 3, rotationY: (-3 * Math.PI) / 8, size: BIG, post: 1.25 },
  { node: 4, rotationY: -Math.PI / 8, size: BIG, post: 1.25 },
  { node: 5, rotationY: 0, size: SMALL, along: -0.31, post: 0.95 },
].map((pier) => {
  const [nx, nz] = NODES[pier.node]
  const r = pier.rotationY
  // 柱的本地 +x 沿立面方向、+z 朝外
  const ux = Math.cos(r)
  const uz = -Math.sin(r)
  const ox = Math.sin(r)
  const oz = Math.cos(r)
  const along = pier.along ?? 0
  return { ...pier, x: nx + ux * along - ox * PIER_INSET, z: nz + uz * along - oz * PIER_INSET }
})

/**
 * 立面的各開間：a → b 沿立面前進（朝外為本地 +z）。
 * clear：兩側柱子之間的淨寬（相對開間中心）；windows：窗的中心與寬度（相對淨寬中心）。
 */
const SEGMENTS = [
  { id: 's3', from: 0, to: 1, ea: 0.62, eb: 0.31, gable: 'shell', windows: [-0.7, 0.7], windowW: 0.86, ground: 'doors' },
  { id: 's2', from: 1, to: 2, ea: 0.31, eb: 0.31, gable: 'stepped', windows: [-0.74, 0.74], windowW: 0.9, ground: 'cafe' },
  { id: 's1', from: 2, to: 3, ea: 0.31, eb: 0.6, gable: 'shell', windows: [-0.7, 0.7], windowW: 0.86, ground: 'noren', banner: true },
  { id: 'c', from: 3, to: 4, ea: 0.6, eb: 0.6, gable: 'crown', windows: [-1.65, 0, 1.65], windowW: 1.0, ground: 'main', sign: '滋養豆餡舖' },
  { id: 'd', from: 4, to: 5, ea: 0.6, eb: 0.62, gable: 'medallion', windows: [-0.75, 0.75], windowW: 0.9, ground: 'shutter' },
].map((seg) => {
  const [ax, az] = NODES[seg.from]
  const [bx, bz] = NODES[seg.to]
  const dx = bx - ax
  const dz = bz - az
  const length = Math.hypot(dx, dz)
  const u0 = -length / 2 + seg.ea
  const u1 = length / 2 - seg.eb
  return {
    ...seg,
    length,
    center: [(ax + bx) / 2, 0, (az + bz) / 2],
    rotationY: Math.atan2(-dz, dx),
    u0,
    u1,
    uc: (u0 + u1) / 2,
    width: u1 - u0,
  }
})

/** 一樓店面牆（騎樓內側）：立面線往內退一個步道深度 */
const INNER = {
  sideX: SIDE_X + WALK_D,
  // 斜切段內側線：z - x = (FRONT_Z - CHAMFER - SIDE_X) - WALK_D·√2
  chamferOffset: FRONT_Z - CHAMFER - SIDE_X - WALK_D * Math.SQRT2,
  frontZ: 0,
}
const INNER_CORNER_SIDE = [INNER.sideX, INNER.sideX + INNER.chamferOffset]
const INNER_CORNER_FRONT = [INNER.frontZ - INNER.chamferOffset, INNER.frontZ]

/** 騎樓平面（外緣為立面線、內緣為店面牆） */
const ARCADE_OUTLINE = [
  NODES[0],
  NODES[3],
  NODES[4],
  NODES[5],
  [EAST_X, INNER.frontZ],
  INNER_CORNER_FRONT,
  INNER_CORNER_SIDE,
  [INNER.sideX, BACK_Z],
]

const FOOTPRINT = [NODES[0], NODES[3], NODES[4], NODES[5], [EAST_X, BACK_Z]]

/** 立面線往牆內退 d（天花板收在牆裡，避免和牆面重疊閃爍） */
function insetOuter(d) {
  const sideX = SIDE_X + d
  const frontZ = FRONT_Z - d
  const offset = FRONT_Z - CHAMFER - SIDE_X - d * Math.SQRT2
  return [
    [sideX, BACK_Z],
    [sideX, sideX + offset],
    [frontZ - offset, frontZ],
    [EAST_X, frontZ],
  ]
}

/* ── 小工具 ─────────────────────────────── */

/** 平面多邊形 → 水平板（Shape 的 y 對應 -z，擠出方向朝上） */
function slab(b, material, outline, y, thickness, tint) {
  const shape = new Shape()
  outline.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)))
  shape.closePath()
  b.extrude(material, shape, thickness, { position: [0, y, 0], rotation: [-Math.PI / 2, 0, 0], tint, curveSegments: 2 })
}

const ball = (r, detail = 1) => new IcosahedronGeometry(r, detail)

/** 二次貝茲曲線取樣 */
function quad(points, [x0, y0], [cx, cy], [x1, y1], steps = 6) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const a = (1 - t) * (1 - t)
    const m = 2 * (1 - t) * t
    const c = t * t
    points.push([a * x0 + m * cx + c * x1, a * y0 + m * cy + c * y1])
  }
}

/**
 * 左右對稱的山牆輪廓：right 為右半邊的頂緣（從右側牆頂走到中央最高點）。
 * 回傳 Shape 與頂緣折線（給壓頂線腳使用）。
 */
function gableOutline(half, right) {
  const top = right
  const left = top
    .slice()
    .reverse()
    .map(([x, y]) => [-x, y])
  const ridge = [...top, ...left.slice(1)]
  const shape = new Shape()
  shape.moveTo(-half, 0)
  shape.lineTo(half, 0)
  for (const [x, y] of ridge) shape.lineTo(x, y)
  shape.closePath()
  return { shape, ridge }
}

/** 沿頂緣折線的壓頂線腳（每一段一個斜放的方塊） */
function coping(b, ridge, { x = 0, y, z = 0, depth = 0.4, thickness = 0.1, tint = C.graniteLight }) {
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x0, y0] = ridge[i]
    const [x1, y1] = ridge[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (len < 1e-3) continue
    const angle = Math.atan2(y1 - y0, x1 - x0)
    b.box('granite', [len + 0.05, thickness, depth], [x + (x0 + x1) / 2, y + (y0 + y1) / 2, z], {
      rotation: [0, 0, angle],
      tint,
    })
  }
}

/** 貝殼（扇形）浮雕：開口朝上，position 為扇形的樞紐 */
function shellRelief(b, { x, y, z, r = 0.36, lobes = 7, tint = C.relief }) {
  const shape = new Shape()
  shape.moveTo(-r * 0.18, 0)
  shape.lineTo(r * 0.18, 0)
  for (let i = 0; i <= lobes; i++) {
    const a0 = (i / lobes) * Math.PI
    const a1 = ((i + 0.5) / lobes) * Math.PI
    const a2 = ((i + 1) / lobes) * Math.PI
    if (i === lobes) break
    shape.lineTo(Math.cos(a0) * r, Math.sin(a0) * r)
    shape.quadraticCurveTo(Math.cos(a1) * r * 1.16, Math.sin(a1) * r * 1.16, Math.cos(a2) * r, Math.sin(a2) * r)
  }
  shape.closePath()
  b.extrude('granite', shape, 0.07, { position: [x, y, z], tint, curveSegments: 3 })
  // 放射狀的肋
  for (let i = 1; i < lobes; i++) {
    const a = (i / lobes) * Math.PI
    b.box('granite', [r * 0.86, 0.035, 0.04], [x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, z + 0.085], {
      rotation: [0, 0, a],
      tint: shade(tint, 0.9),
    })
  }
  b.box('granite', [r * 0.5, r * 0.22, 0.1], [x, y + r * 0.06, z + 0.05], { tint: shade(tint, 0.95) })
}

/** 渦卷（螺旋）：圓盤＋同心環 */
function volute(b, { x, y, z, r = 0.17, tint = C.relief, depth = 0.08 }) {
  b.cylinder('granite', r, r, depth, 12, [x, y, z + depth / 2], { rotation: [Math.PI / 2, 0, 0], tint })
  b.add('granite', new TorusGeometry(r * 0.62, r * 0.13, 4, 12), { position: [x, y, z + depth], tint: shade(tint, 0.88) })
  b.add('granite', ball(r * 0.22, 0), { position: [x, y, z + depth], tint: shade(tint, 0.9) })
}

/** 花草浮雕的框（矩形邊框＋幾個凸起的葉片與花） */
function floralPanel(b, { x, y, z, w, h, tint = C.relief }) {
  for (const side of [-1, 1]) {
    b.box('granite', [w, 0.05, 0.05], [x, y + side * (h / 2), z + 0.025], { tint })
    b.box('granite', [0.05, h, 0.05], [x + side * (w / 2), y, z + 0.025], { tint })
  }
  const leaves = Math.max(2, Math.round(w / 0.3))
  for (let i = 0; i < leaves; i++) {
    const t = (i + 0.5) / leaves - 0.5
    b.add('granite', ball(0.075, 0), {
      position: [x + t * (w - 0.16), y + (i % 2 ? 0.05 : -0.04), z + 0.04],
      scale: [1.6, 0.8, 0.6],
      rotation: [0, 0, (i % 2 ? -1 : 1) * 0.5],
      tint: shade(tint, 0.92),
    })
  }
  b.add('granite', ball(0.07, 1), { position: [x, y, z + 0.06], tint: shade(tint, 1.04) })
}

/* ── 紅磚柱 ─────────────────────────────── */

function brickPier(b, pier) {
  const s = pier.size
  const big = s > 0.8
  // 花崗石柱礎
  b.box('granite', [s + 0.14, 0.85, s + 0.14], [0, 0.425, 0], { tint: C.graniteDark, grime: 0.15 })
  b.box('granite', [s + 0.2, 0.08, s + 0.2], [0, 0.87, 0], { tint: C.granite })
  b.box('brick', [s, H.ground - 0.91, s], [0, (0.91 + H.ground) / 2, 0], { tint: C.brick, grime: 0.12 })
  // 一樓柱頭（與楣樑線腳同高）
  b.box('granite', [s + 0.16, 0.1, s + 0.16], [0, H.ground + 0.05, 0], { tint: C.graniteLight })
  b.box('granite', [s + 0.08, 0.48, s + 0.08], [0, H.ground + 0.34, 0], { tint: C.granite })
  b.box('granite', [s + 0.16, 0.08, s + 0.16], [0, H.ground + 0.6, 0], { tint: C.graniteLight })
  b.box('brick', [s, H.cornice - H.ground - 0.64, s], [0, (H.ground + 0.64 + H.cornice) / 2, 0], { tint: C.brick })
  // 簷口高度的柱頭
  b.box('granite', [s + 0.12, 0.2, s + 0.12], [0, H.cornice + 0.1, 0], { tint: C.granite })
  b.box('granite', [s + 0.26, 0.15, s + 0.26], [0, H.cornice + 0.27, 0], { tint: C.graniteLight })
  // 小尖塔：方柱、三顆層疊的圓球、帽頂與頂端的小球
  const base = H.corniceTop
  b.box('granite', [s + 0.04, 0.3, s + 0.04], [0, base + 0.15, 0], { tint: C.granite })
  const postW = s * 0.72
  const postH = pier.post
  const y0 = base + 0.3
  b.box('granite', [postW, postH, postW], [0, y0 + postH / 2, 0], { tint: C.granite })
  const r = postW * (big ? 0.15 : 0.17)
  const faces = big ? [[0, 1], [1, 0], [-1, 0]] : [[0, 1], [1, 0], [-1, 0]]
  for (const [fx, fz] of faces) {
    // 凹槽（深色）與三顆圓球
    b.box('granite', [fz ? postW * 0.42 : 0.02, postH * 0.78, fx ? postW * 0.42 : 0.02], [fx * (postW / 2 + 0.006), y0 + postH * 0.5, fz * (postW / 2 + 0.006)], {
      tint: C.graniteDark,
    })
    for (let k = 0; k < 3; k++) {
      b.add('granite', new SphereGeometry(r, 8, 6), {
        position: [fx * (postW / 2), y0 + postH * (0.25 + k * 0.25), fz * (postW / 2)],
        tint: C.graniteLight,
      })
    }
  }
  const capY = y0 + postH
  b.box('granite', [postW + 0.18, 0.1, postW + 0.18], [0, capY + 0.05, 0], { tint: C.graniteLight })
  b.box('granite', [postW + 0.08, 0.14, postW + 0.08], [0, capY + 0.17, 0], { tint: C.granite })
  b.box('granite', [postW * 0.5, 0.12, postW * 0.5], [0, capY + 0.3, 0], { tint: C.granite })
  b.add('granite', new SphereGeometry(postW * 0.24, 10, 7), { position: [0, capY + 0.36 + postW * 0.22, 0], tint: C.graniteLight })
}

/* ── 樓上立面 ───────────────────────────── */

/** 紅磚飾帶（由窗頂往下：紅 0.25 m、灰 0.28 m 交錯） */
const BRICK_BANDS = Array.from({ length: 5 }, (_, k) => {
  const top = H.winTop - k * 0.53
  return [top - 0.25, top]
})

function tallWindow(b, x, w) {
  const y0 = H.winBottom
  const y1 = H.winTop
  const h = y1 - y0
  const zg = -0.2
  const fz = zg + 0.04
  const f = 0.07
  b.box('glass', [w, h, 0.03], [x, y0 + h / 2, zg])
  b.box('wood', [w, f, 0.07], [x, y1 - f / 2, fz], { tint: C.frame })
  b.box('wood', [w, f, 0.07], [x, y0 + f / 2, fz], { tint: C.frame })
  for (const side of [-1, 1]) b.box('wood', [f, h, 0.07], [x + side * (w / 2 - f / 2), y0 + h / 2, fz], { tint: C.frame })
  // 上方氣窗（三格）與下方窗扇（兩欄三列）
  const ty = y1 - 0.52
  b.box('wood', [w, 0.06, 0.07], [x, ty, fz], { tint: C.frame })
  for (const t of [-1 / 6, 1 / 6]) b.box('wood', [0.03, 0.46, 0.05], [x + t * w, ty + 0.25, fz + 0.005], { tint: C.frame })
  b.box('wood', [0.05, ty - y0, 0.06], [x, (y0 + ty) / 2, fz], { tint: C.frame })
  const row = (ty - y0) / 3
  for (const k of [1, 2]) b.box('wood', [w, 0.032, 0.05], [x, y0 + row * k, fz + 0.005], { tint: C.frame })
}

/** 窗下的鐵欄杆：直條、上緣的小菱形飾帶與中央的菱形 */
function ironRailing(b, x, w) {
  const z = 0.14
  const y0 = H.winBottom + 0.04
  const y1 = H.winBottom + 0.76
  const band = y1 - 0.15
  const t = 0.026
  const ww = w + 0.12
  b.box('plain', [ww, 0.04, 0.05], [x, y1, z], { tint: C.iron })
  b.box('plain', [ww, t, t], [x, y0, z], { tint: C.iron })
  b.box('plain', [ww, t, t], [x, band, z], { tint: C.iron })
  for (const side of [-1, 1]) {
    b.box('plain', [t, y1 - y0, t], [x + side * (ww / 2), (y0 + y1) / 2, z], { tint: C.iron })
    for (const y of [y0, y1]) b.box('plain', [t, t, z], [x + side * (ww / 2), y, z / 2], { tint: C.iron })
  }
  const bars = Math.round(ww / 0.11)
  for (let i = 1; i < bars; i++) {
    const bx = x - ww / 2 + (i * ww) / bars
    if (Math.abs(bx - x) < 0.16) continue
    b.box('plain', [0.018, band - y0, 0.018], [bx, (y0 + band) / 2, z], { tint: C.iron })
  }
  // 上緣飾帶的小菱形
  const n = Math.max(3, Math.round(ww / 0.15))
  for (let i = 0; i < n; i++) {
    const bx = x - ww / 2 + ((i + 0.5) * ww) / n
    b.box('plain', [0.06, 0.06, 0.016], [bx, (band + y1) / 2, z], { rotation: [0, 0, Math.PI / 4], tint: C.iron })
  }
  // 中央菱形
  const dy = (y0 + band) / 2
  for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    b.box('plain', [0.2, 0.02, 0.02], [x + sx * 0.07, dy + sy * 0.09, z], { rotation: [0, 0, sx * sy * -0.9], tint: C.iron })
  }
}

/** 一個開間的樓上立面（在開間座標中：立面在 z = 0、朝外為 +z） */
function upperFacade(b, seg) {
  const { u0, u1, uc, width } = seg
  const a = u0 - 0.06
  const c = u1 + 0.06
  const zc = -WALL_T / 2
  // 楣樑到窗臺：實牆
  b.box('granite', [c - a, H.winBottom - H.ground, WALL_T], [(a + c) / 2, (H.ground + H.winBottom) / 2, zc], { tint: C.granite, grime: 0.08 })
  // 窗頂到簷口：實牆
  b.box('granite', [c - a, H.corniceTop - H.winTop, WALL_T], [(a + c) / 2, (H.winTop + H.corniceTop) / 2, zc], { tint: C.granite })
  // 窗間牆與紅磚飾帶
  const wins = seg.windows.map((offset) => ({ x: uc + offset, w: seg.windowW }))
  const edges = [a]
  for (const win of wins) edges.push(win.x - win.w / 2, win.x + win.w / 2)
  edges.push(c)
  for (let i = 0; i < edges.length; i += 2) {
    const s0 = edges[i]
    const s1 = edges[i + 1]
    const sw = s1 - s0
    if (sw < 0.02) continue
    const sx = (s0 + s1) / 2
    b.box('granite', [sw, H.winTop - H.winBottom, WALL_T], [sx, (H.winBottom + H.winTop) / 2, zc], { tint: C.granite })
    for (const [y0, y1] of BRICK_BANDS) {
      b.box('brick', [sw + 0.01, y1 - y0, WALL_T + 0.016], [sx, (y0 + y1) / 2, zc + 0.008], { tint: C.brick })
    }
  }
  for (const win of wins) {
    tallWindow(b, win.x, win.w)
    ironRailing(b, win.x, win.w)
  }

  // 楣樑下緣線腳、店招橫帶、窗臺線腳
  b.box('granite', [width + 0.06, 0.1, 0.1], [uc, H.ground + 0.05, 0.05], { tint: C.graniteLight })
  const panelW = Math.min(width - 0.5, seg.sign ? 4.3 : width - 0.7)
  const panelY = (H.ground + 0.62 + H.sill) / 2
  const panelH = 0.6
  for (const side of [-1, 1]) {
    b.box('granite', [panelW + 0.12, 0.06, 0.06], [uc, panelY + side * (panelH / 2 + 0.03), 0.03], { tint: C.graniteLight })
    b.box('granite', [0.06, panelH, 0.06], [uc + side * (panelW / 2 + 0.03), panelY, 0.03], { tint: C.graniteLight })
  }
  if (seg.sign) {
    b.addSign({ text: seg.sign, style: 'engraved', width: panelW - 0.35, height: 0.52, position: [uc, panelY, 0.012] })
  }
  b.box('granite', [width + 0.1, 0.1, 0.1], [uc, H.sill + 0.04, 0.05], { tint: C.graniteLight })
  b.box('granite', [width + 0.16, 0.09, 0.16], [uc, H.sill + 0.13, 0.08], { tint: C.granite })

  // 主簷口（三層）與托架
  b.box('granite', [width + 0.24, 0.1, 0.1], [uc, H.cornice + 0.05, 0.05], { tint: C.granite })
  b.box('granite', [width + 0.3, 0.13, 0.2], [uc, H.cornice + 0.165, 0.1], { tint: C.graniteLight })
  b.box('granite', [width + 0.36, 0.12, 0.3], [uc, H.cornice + 0.29, 0.15], { tint: C.granite })
  const brackets = seg.windows.length === 3 ? [-0.82, 0.82] : [0]
  for (const offset of brackets) {
    b.box('granite', [0.16, 0.28, 0.16], [uc + offset, H.cornice - 0.14, 0.08], { tint: C.graniteLight })
    b.box('granite', [0.1, 0.12, 0.1], [uc + offset, H.cornice - 0.34, 0.05], { tint: C.granite })
  }

  // 山牆
  if (seg.gable === 'crown') cornerCrown(b, seg)
  else bayGable(b, seg)
}

/** 側面開間的小山牆：shell 貝殼、stepped 階梯、medallion 圓形徽飾 */
function bayGable(b, seg) {
  const half = seg.width / 2
  const y = H.corniceTop
  const right = []
  if (seg.gable === 'stepped') {
    right.push([half, 0.42], [half * 0.52, 0.42], [half * 0.52, 0.78], [half * 0.2, 0.78], [half * 0.2, 1.05], [0, 1.05])
  } else {
    const shoulder = 0.5
    const top = seg.gable === 'medallion' ? 1.4 : 1.25
    right.push([half, shoulder], [half * 0.58, shoulder])
    quad(right, [half * 0.58, shoulder], [half * 0.44, shoulder + 0.02], [half * 0.38, shoulder + 0.28], 4)
    quad(right, [half * 0.38, shoulder + 0.28], [half * 0.26, top], [0, top], 7)
  }
  const { shape, ridge } = gableOutline(half, right)
  b.extrude('granite', shape, 0.26, { position: [seg.uc, y, -0.27], tint: C.granite, curveSegments: 2 })
  coping(b, ridge, { x: seg.uc, y: y + 0.03, z: -0.12, depth: 0.42, thickness: 0.1 })
  // 山牆下緣的線腳
  b.box('granite', [seg.width, 0.08, 0.06], [seg.uc, y + 0.3, 0.02], { tint: C.graniteLight })

  // 浮雕
  const z = -0.01
  floralPanel(b, { x: seg.uc - half * 0.58, y: y + 0.17, z, w: half * 0.62, h: 0.2 })
  floralPanel(b, { x: seg.uc + half * 0.58, y: y + 0.17, z, w: half * 0.62, h: 0.2 })
  if (seg.gable === 'shell') {
    shellRelief(b, { x: seg.uc, y: y + 0.5, z, r: 0.34 })
    volute(b, { x: seg.uc - 0.52, y: y + 0.62, z, r: 0.11 })
    volute(b, { x: seg.uc + 0.52, y: y + 0.62, z, r: 0.11 })
  } else if (seg.gable === 'medallion') {
    b.cylinder('granite', 0.36, 0.36, 0.08, 18, [seg.uc, y + 0.82, z + 0.04], { rotation: [Math.PI / 2, 0, 0], tint: C.relief })
    b.add('granite', new TorusGeometry(0.36, 0.045, 4, 18), { position: [seg.uc, y + 0.82, z + 0.08], tint: C.graniteLight })
    shellRelief(b, { x: seg.uc, y: y + 0.66, z: z + 0.08, r: 0.24, lobes: 6, tint: C.graniteLight })
    for (const side of [-1, 1]) {
      b.add('granite', ball(0.1, 0), { position: [seg.uc + side * 0.5, y + 0.66, z + 0.04], scale: [1.8, 0.7, 0.6], rotation: [0, 0, side * 0.6], tint: C.relief })
    }
  } else {
    // 階梯山頭：中央小方柱與圓球、十字形浮雕
    b.box('granite', [0.26, 0.32, 0.26], [seg.uc, y + 1.21, -0.14], { tint: C.granite })
    b.box('granite', [0.34, 0.06, 0.34], [seg.uc, y + 1.4, -0.14], { tint: C.graniteLight })
    b.add('granite', new SphereGeometry(0.13, 10, 7), { position: [seg.uc, y + 1.55, -0.14], tint: C.graniteLight })
    b.box('granite', [0.12, 0.42, 0.06], [seg.uc, y + 0.58, z + 0.03], { tint: C.relief })
    b.box('granite', [0.36, 0.1, 0.06], [seg.uc, y + 0.64, z + 0.03], { tint: C.relief })
    volute(b, { x: seg.uc - half * 0.36, y: y + 0.56, z, r: 0.1 })
    volute(b, { x: seg.uc + half * 0.36, y: y + 0.56, z, r: 0.1 })
  }
}

/**
 * 轉角的中央山牆：簷口上方的飾帶（貝殼紋與渦卷）、頂部簷口，
 * 再往上是中央的方形山頭（凹字形框）、兩側帶小圓球的短柱、大渦卷與頂端的大圓球。
 */
function cornerCrown(b, seg) {
  const { uc, width } = seg
  const y = H.corniceTop
  const fh = H.frieze - H.corniceTop
  b.box('granite', [width, fh, 0.28], [uc, y + fh / 2, -0.15], { tint: C.granite })
  // 飾帶中央：貝殼與兩側渦卷、捲草
  const z = -0.01
  shellRelief(b, { x: uc, y: y + 0.18, z, r: 0.46, lobes: 9 })
  for (const side of [-1, 1]) {
    volute(b, { x: uc + side * 0.68, y: y + 0.42, z, r: 0.17 })
    b.add('granite', ball(0.12, 0), { position: [uc + side * 0.98, y + 0.3, z + 0.03], scale: [2.0, 0.7, 0.6], rotation: [0, 0, side * 0.35], tint: C.relief })
    floralPanel(b, { x: uc + side * (width / 2 - 0.85), y: y + 0.6, z, w: 1.1, h: 0.42 })
  }
  // 頂部簷口
  b.box('granite', [width + 0.1, 0.1, 0.36], [uc, H.frieze + 0.05, -0.1], { tint: C.graniteLight })
  b.box('granite', [width + 0.2, 0.1, 0.46], [uc, H.frieze + 0.15, -0.1], { tint: C.granite })

  const top = H.friezeTop
  // 中央方形山頭
  const cw = 2.0
  const ch = 1.3
  b.box('granite', [cw, ch, 0.42], [uc, top + ch / 2, -0.16], { tint: C.granite })
  for (const side of [-1, 1]) {
    b.box('granite', [0.08, ch - 0.3, 0.06], [uc + side * 0.56, top + ch / 2, 0.08], { tint: C.graniteLight })
    b.box('granite', [0.2, 0.08, 0.06], [uc + side * 0.42, top + 0.19, 0.08], { tint: C.graniteLight })
  }
  // 凹字形的框與中央直槽
  b.box('granite', [1.2, 0.08, 0.06], [uc, top + ch - 0.15, 0.08], { tint: C.graniteLight })
  b.box('granite', [0.3, ch - 0.48, 0.03], [uc, top + (ch - 0.3) / 2 + 0.1, 0.065], { tint: C.graniteDark })
  b.box('granite', [0.08, ch - 0.48, 0.06], [uc - 0.19, top + (ch - 0.3) / 2 + 0.1, 0.08], { tint: C.graniteLight })
  b.box('granite', [0.08, ch - 0.48, 0.06], [uc + 0.19, top + (ch - 0.3) / 2 + 0.1, 0.08], { tint: C.graniteLight })
  b.box('granite', [0.46, 0.08, 0.06], [uc, top + 0.23, 0.08], { tint: C.graniteLight })
  // 帽頂、台座與大圓球
  b.box('granite', [cw + 0.24, 0.1, 0.56], [uc, top + ch + 0.05, -0.16], { tint: C.graniteLight })
  b.box('granite', [cw + 0.1, 0.1, 0.48], [uc, top + ch + 0.15, -0.16], { tint: C.granite })
  b.box('granite', [0.86, 0.36, 0.5], [uc, top + ch + 0.38, -0.16], { tint: C.granite })
  b.box('granite', [1.0, 0.08, 0.6], [uc, top + ch + 0.6, -0.16], { tint: C.graniteLight })
  b.cylinder('granite', 0.12, 0.2, 0.14, 10, [uc, top + ch + 0.71, -0.16], { tint: C.granite })
  b.add('granite', new SphereGeometry(0.34, 14, 10), { position: [uc, top + ch + 1.08, -0.16], tint: C.graniteLight })

  // 兩側帶圓球的短柱與大渦卷
  for (const side of [-1, 1]) {
    const px = uc + side * 1.32
    b.box('granite', [0.36, 0.86, 0.36], [px, top + 0.43, -0.16], { tint: C.granite })
    b.box('granite', [0.46, 0.08, 0.46], [px, top + 0.9, -0.16], { tint: C.graniteLight })
    b.add('granite', new SphereGeometry(0.15, 10, 7), { position: [px, top + 1.08, -0.16], tint: C.graniteLight })
    // 渦卷：從短柱往外下降到大柱旁
    const outer = width / 2 - 0.1
    const reach = outer - 1.5
    const s = new Shape()
    s.moveTo(0, 0)
    s.lineTo(side * reach, 0)
    s.lineTo(side * reach, 0.3)
    s.quadraticCurveTo(side * (reach * 0.55), 0.42, side * 0.25, 0.82)
    s.lineTo(0, 0.96)
    s.closePath()
    b.extrude('granite', s, 0.3, { position: [px + side * 0.18, top, -0.3], tint: C.granite, curveSegments: 6 })
    // 沿渦卷上緣的壓頂
    coping(b, [[side * reach, 0.3], [side * reach * 0.62, 0.4], [side * reach * 0.3, 0.6], [side * 0.25, 0.82], [0, 0.96]].map(([x, yy]) => [x + px + side * 0.18, yy]), {
      y: top + 0.03,
      z: -0.14,
      depth: 0.38,
      thickness: 0.08,
    })
    volute(b, { x: px + side * (outer - 1.4), y: top + 0.3, z: 0.0, r: 0.27, depth: 0.1 })
    volute(b, { x: px + side * 0.5, y: top + 0.7, z: 0.0, r: 0.13 })
  }
}

/* ── 一樓騎樓 ───────────────────────────── */

/** 柱與楣樑交接處的弧形托座（在開間座標中，u 為托座貼著柱子的位置，dir 為伸出的方向） */
function arcadeBracket(b, u, dir, z = -0.3) {
  const shape = new Shape()
  const p = (x, y) => [dir * x, y]
  shape.moveTo(...p(0, 0))
  shape.lineTo(...p(0.62, 0))
  shape.lineTo(...p(0.62, -0.08))
  shape.bezierCurveTo(...p(0.34, -0.1), ...p(0.14, -0.28), ...p(0.12, -0.62))
  shape.lineTo(...p(0.04, -0.76))
  shape.lineTo(...p(0, -0.76))
  shape.closePath()
  b.extrude('granite', shape, 0.28, { position: [u, H.ground, z], tint: C.granite, curveSegments: 6 })
  volute(b, { x: u + dir * 0.13, y: H.ground - 0.58, z: z + 0.28, r: 0.07, depth: 0.04 })
}

/** 黑色遮雨棚（在店面牆座標中：牆面 z = 0、騎樓在 +z），垂邊印白色店名 */
function blackAwning(b, { x, y, width, depth = 0.72, drop = 0.3, text = '滋養' }) {
  const angle = Math.atan2(drop, depth)
  const len = Math.hypot(drop, depth)
  b.box('cloth', [width, 0.03, len], [x, y - drop / 2, depth / 2], { rotation: [angle, 0, 0], tint: C.awning })
  b.box('cloth', [width, 0.26, 0.025], [x, y - drop - 0.13, depth], { tint: '#1d1b1a' })
  for (const side of [-1, 1]) {
    b.box('plain', [0.025, 0.025, len], [x + side * (width / 2), y - drop / 2, depth / 2], { rotation: [angle, 0, 0], tint: '#1a1918' })
    b.box('plain', [0.02, 0.02, 0.5], [x + side * (width / 2 - 0.1), y - drop - 0.25, depth * 0.55], { rotation: [-0.7, 0, 0], tint: '#1a1918' })
  }
  if (text) b.addSign({ text, style: 'awningBlack', width: Math.min(0.8, width * 0.3), height: 0.22, position: [x, y - drop - 0.13, depth + 0.015] })
}

/** 玻璃（透明）＋灰色金屬框 */
function glassPane(b, { x, y0, y1, width, z = 0.04 }) {
  const h = y1 - y0
  b.box('glassClear', [width, h, 0.02], [x, y0 + h / 2, z], { tint: '#dfe8ea' })
  const f = 0.05
  b.box('plain', [width + f * 2, f, 0.08], [x, y1 + f / 2, z], { tint: C.metal })
  b.box('plain', [width + f * 2, f, 0.08], [x, y0 - f / 2, z], { tint: C.metal })
  for (const side of [-1, 1]) b.box('plain', [f, h, 0.08], [x + side * (width / 2 + f / 2), y0 + h / 2, z], { tint: C.metal })
}

/** 淺色木作貼板（橫向木紋） */
function woodCladding(b, { x, width, y0 = WALK_H, y1 = 3.05, z = 0.03 }) {
  b.box('woodLight', [y1 - y0, width, 0.06], [x, (y0 + y1) / 2, z], { rotation: [0, 0, Math.PI / 2], tint: C.wood })
}

/** 店面牆（在店面牆座標中：外牆面 z = 0、騎樓在 +z）：openings 為不砌牆的範圍 */
function shopWall(b, { from, to, openings = [], top = 3.05 }) {
  const zc = -WALL_T / 2
  b.box('granite', [to - from, H.ceiling - top, WALL_T], [(from + to) / 2, (top + H.ceiling) / 2, zc], { tint: C.graniteLight })
  const edges = [from]
  for (const [a, c] of openings) edges.push(a, c)
  edges.push(to)
  for (let i = 0; i < edges.length; i += 2) {
    if (edges[i + 1] - edges[i] < 0.01) continue
    b.box('granite', [edges[i + 1] - edges[i], top - WALK_H, WALL_T], [(edges[i] + edges[i + 1]) / 2, (WALK_H + top) / 2, zc], { tint: C.graniteLight })
  }
}

/** 店面牆的開間座標：在樓上立面的開間座標中往內退一個步道深度 */
function shopFrame(b, seg, callback) {
  b.group(seg.center, seg.rotationY, () => b.group([0, 0, -WALK_D], 0, callback))
}

/** 店面牆在各開間座標中的範圍（u） */
function innerRange(seg) {
  const half = seg.length / 2
  if (seg.id === 's1') return [-half, half - (NODES[3][1] - INNER_CORNER_SIDE[1])]
  if (seg.id === 'c') {
    const inner = Math.hypot(INNER_CORNER_FRONT[0] - INNER_CORNER_SIDE[0], INNER_CORNER_FRONT[1] - INNER_CORNER_SIDE[1])
    return [-inner / 2, inner / 2]
  }
  if (seg.id === 'd') return [-half + (INNER_CORNER_FRONT[0] - NODES[4][0]), half]
  return [-half, half]
}

/* ── 店面與淺層室內 ─────────────────────── */

/** 轉角店面：大片玻璃、木作、黑色遮雨棚、灰色石牆上的「滋養」大字，以及店內陳設 */
function mainStorefront(b, seg) {
  const [from, to] = innerRange(seg)
  const glass = [from + 0.5, from + 3.6]
  shopFrame(b, seg, () => {
    shopWall(b, { from, to, openings: [glass] })
    woodCladding(b, { x: from + 0.25, width: 0.5 })
    woodCladding(b, { x: glass[1] + 0.2, width: 0.4 })
    const gx = (glass[0] + glass[1]) / 2
    const gw = glass[1] - glass[0]
    glassPane(b, { x: gx - gw / 4, y0: WALK_H + 0.05, y1: 2.98, width: gw / 2 - 0.05 })
    glassPane(b, { x: gx + gw / 4, y0: WALK_H + 0.05, y1: 2.98, width: gw / 2 - 0.05 })
    // 門把（中央兩扇對開的玻璃門）
    for (const side of [-1, 1]) b.box('plain', [0.03, 0.6, 0.03], [gx + side * 0.12, 1.2, 0.12], { tint: '#3a3a38' })
    blackAwning(b, { x: gx, y: 3.42, width: gw + 0.4 })
    b.addSign({ text: '滋養', style: 'engraved', vertical: true, width: 0.62, height: 1.45, position: [glass[1] + 0.92, 1.95, 0.012] })
    b.addSign({ text: '滋養', style: 'engraved', vertical: true, width: 0.22, height: 0.5, position: [from + 0.25, 2.35, 0.065] })
    b.addPool(gx, 0.9, 2.1, '#ffcf96', WALK_H + 0.02)
    shopInterior(b, { from: glass[0] - 0.1, to: glass[1] + 0.1 })
  })
}

/** 店內：木地板、暖色天花與嵌燈、層架上的禮盒與茶具、木製櫃台與和菓子、和菓子木模 */
function shopInterior(b, { from, to }) {
  const back = -2.5
  const front = -WALL_T
  const roomH = 3.2
  const w = to - from
  const cx = (from + to) / 2
  const depth = front - back
  const zc = (front + back) / 2
  b.box('woodLight', [w, 0.04, depth], [cx, WALK_H + 0.02, zc], { tint: '#f4dfc2' })
  b.box('interior', [w, 0.06, depth], [cx, roomH, zc], { tint: '#f6f1e6' })
  b.box('interior', [w, roomH, 0.08], [cx, roomH / 2, back], { tint: '#efe6d6' })
  for (const side of [-1, 1]) b.box('interior', [0.08, roomH, depth], [cx + side * (w / 2), roomH / 2, zc], { tint: '#ebe1cf' })
  // 嵌燈
  for (const u of [-0.32, 0, 0.32]) {
    for (const t of [0.3, 0.7]) {
      b.cylinder('bulb', 0.06, 0.06, 0.02, 10, [cx + u * w, roomH - 0.04, front - t * depth], { tint: '#fff6dc' })
    }
  }
  b.addGlow(cx, roomH - 0.3, zc, 1.6, '#ffd9a0')
  // 天花的木格柵
  b.box('woodLight', [w * 0.6, 0.12, 0.6], [cx + w * 0.12, roomH - 0.1, zc - 0.2], { tint: '#f3dcbc' })

  // 後牆的層架：禮盒、木盒、圓形木桶與茶具
  const shelfW = w * 0.62
  const sx = cx - w * 0.12
  b.box('woodLight', [shelfW, 2.2, 0.06], [sx, 0.15 + 1.1, back + 0.07], { tint: '#f1dcbd' })
  const colors = ['#c44a3b', '#efe5d0', '#2e2b29', '#b5835a', '#8e2f2a', '#d9c7a4', '#3c5d84']
  let k = 0
  for (const y of [1.05, 1.62, 2.19]) {
    b.box('woodLight', [shelfW, 0.04, 0.36], [sx, y, back + 0.24], { tint: '#ecd2ae' })
    let x = sx - shelfW / 2 + 0.12
    while (x < sx + shelfW / 2 - 0.2) {
      const tint = colors[k % colors.length]
      const kind = k % 5
      if (kind === 3) {
        b.cylinder('interior', 0.12, 0.12, 0.2, 10, [x + 0.1, y + 0.12, back + 0.24], { tint: '#b98a5a' })
        x += 0.28
      } else if (kind === 4) {
        for (let c = 0; c < 3; c++) b.cylinder('interior', 0.045, 0.035, 0.08, 8, [x + 0.06 + c * 0.11, y + 0.06, back + 0.26], { tint: c === 1 ? '#3c5d84' : '#f2efe8' })
        x += 0.38
      } else {
        const bw = 0.26 + (k % 3) * 0.05
        b.box('interior', [bw, 0.13 + (k % 2) * 0.05, 0.24], [x + bw / 2, y + 0.1, back + 0.24], { tint })
        b.box('interior', [bw + 0.01, 0.025, 0.245], [x + bw / 2, y + 0.06, back + 0.24], { tint: shade(tint, 0.72) })
        x += bw + 0.06
      }
      k++
    }
  }
  // 和菓子木模（掛在右側牆上的一排木模）
  const moldX = cx + w * 0.36
  b.box('wood', [0.32, 1.5, 0.06], [moldX, 1.75, back + 0.08], { tint: '#6b4a32' })
  for (let i = 0; i < 6; i++) {
    b.box('wood', [i % 2 ? 0.42 : 0.36, 0.16, 0.08], [moldX + (i % 2 ? 0.05 : -0.03), 1.1 + i * 0.24, back + 0.14], { tint: i % 2 ? '#7d5638' : '#5e3f2a' })
  }
  // 木製櫃台與玻璃展示櫃
  const counterW = Math.min(2.2, w * 0.5)
  const ccx = cx + w * 0.08
  const ccz = front - 1.15
  b.box('woodLight', [counterW, 0.9, 0.62], [ccx, 0.15 + 0.45, ccz], { tint: '#f6e2c4' })
  b.box('woodLight', [counterW + 0.06, 0.04, 0.68], [ccx, 1.07, ccz], { tint: '#efd7b2' })
  b.box('glassClear', [counterW - 0.1, 0.32, 0.5], [ccx, 1.25, ccz], { tint: '#e9f1f2' })
  // 和菓子：草莓大福、白色大福、銅鑼燒、羊羹
  const items = [
    ['daifuku', '#f6f0e4'],
    ['strawberry', '#f6f0e4'],
    ['dorayaki', '#a8703f'],
    ['yokan', '#4a2521'],
    ['daifuku', '#e9c7cf'],
    ['strawberry', '#f6f0e4'],
  ]
  items.forEach(([kind, tint], i) => {
    const x = ccx - counterW / 2 + 0.2 + (i * (counterW - 0.4)) / (items.length - 1)
    const y = 1.12
    b.box('interior', [0.26, 0.02, 0.2], [x, y - 0.02, ccz], { tint: '#2d2b29' })
    if (kind === 'yokan') {
      b.box('interior', [0.2, 0.06, 0.06], [x, y + 0.03, ccz - 0.04], { tint })
      b.box('interior', [0.2, 0.06, 0.06], [x, y + 0.03, ccz + 0.05], { tint: '#6b3b2a' })
    } else if (kind === 'dorayaki') {
      b.cylinder('interior', 0.07, 0.07, 0.05, 10, [x - 0.05, y + 0.03, ccz], { tint })
      b.cylinder('interior', 0.07, 0.07, 0.05, 10, [x + 0.06, y + 0.03, ccz + 0.02], { tint })
    } else {
      for (const dx of [-0.06, 0.06]) {
        b.add('interior', new SphereGeometry(0.055, 8, 6), { position: [x + dx, y + 0.035, ccz], scale: [1, 0.75, 1], tint })
        if (kind === 'strawberry') b.add('interior', new SphereGeometry(0.03, 6, 5), { position: [x + dx, y + 0.08, ccz], scale: [1, 1.2, 1], tint: '#d6343b' })
      }
    }
  })
  // 櫃台旁的小几、盆栽與茶具
  b.box('woodLight', [0.6, 0.42, 0.45], [cx - w * 0.36, 0.36, front - 0.7], { tint: '#efd8b6' })
  pottedPlant(b, [cx - w * 0.36, 0.57, front - 0.7], { seed: 4, size: 0.55, potTint: '#3c5d84' })
  b.cylinder('dark', 0.11, 0.13, 0.14, 10, [cx - w * 0.36 + 0.2, 0.64, front - 0.62], { tint: '#2a2523' })
  // 右側的木格柵屏風
  for (let i = 0; i < 7; i++) {
    b.box('woodLight', [0.04, 1.9, 0.05], [cx + w * 0.42 - i * 0.08, 1.1, front - 0.9], { tint: '#efd5ae' })
  }
}

/** 涼州街側第一開間：古董木櫃的玻璃櫥窗、木作與白色暖簾的入口 */
function norenStorefront(b, seg) {
  const [from, to] = innerRange(seg)
  const window = [to - 1.85, to - 0.55]
  const door = [from + 0.15, from + 1.0]
  shopFrame(b, seg, () => {
    shopWall(b, { from, to, openings: [window, door] })
    woodCladding(b, { x: (to + window[1]) / 2, width: to - window[1] })
    woodCladding(b, { x: (window[0] + door[1]) / 2, width: window[0] - door[1] })
    const wx = (window[0] + window[1]) / 2
    const ww = window[1] - window[0]
    b.box('granite', [ww, 0.3, 0.12], [wx, WALK_H + 0.15, 0.02], { tint: C.graniteDark })
    glassPane(b, { x: wx, y0: WALK_H + 0.32, y1: 2.98, width: ww - 0.1 })
    blackAwning(b, { x: wx, y: 3.42, width: ww + 0.3 })
    // 古董木櫃（格子玻璃門，裡面是木盒與器物）
    const cz = -0.32
    b.box('wood', [ww - 0.2, 2.3, 0.04], [wx, 0.47 + 1.15, cz - 0.42], { tint: '#6a4a33' })
    for (let i = 0; i <= 3; i++) b.box('wood', [0.05, 2.3, 0.06], [wx - (ww - 0.2) / 2 + (i * (ww - 0.2)) / 3, 0.47 + 1.15, cz], { tint: '#7b5537' })
    for (let j = 0; j <= 4; j++) b.box('wood', [ww - 0.2, 0.05, 0.42], [wx, 0.47 + j * 0.575, cz - 0.2], { tint: '#7b5537' })
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const x = wx - (ww - 0.2) / 2 + ((i + 0.5) * (ww - 0.2)) / 3
        const y = 0.47 + j * 0.575 + 0.1
        if ((i + j) % 2) b.box('interior', [0.24, 0.14, 0.2], [x, y + 0.04, cz - 0.2], { tint: j % 2 ? '#9a6d48' : '#2f2b28' })
        else b.cylinder('interior', 0.07, 0.08, 0.12, 8, [x, y + 0.03, cz - 0.2], { tint: '#e9e3d6' })
      }
    }
    // 白色暖簾與後方的入口
    const dx = (door[0] + door[1]) / 2
    const dw = door[1] - door[0]
    b.box('dark', [dw, 2.85, 0.04], [dx, WALK_H + 1.425, -0.5], { tint: '#4a3d33' })
    b.box('wood', [dw + 0.1, 0.05, 0.05], [dx, 2.72, 0.06], { tint: '#3b3029' })
    for (const side of [-1, 1]) {
      b.addBanner({ text: side < 0 ? '滋' : '養', style: 'whiteCloth', vertical: true, width: dw / 2 - 0.03, height: 0.95, position: [dx + side * (dw / 4), 2.22, 0.07] })
    }
    b.addPool(wx, 0.9, 1.4, '#ffcf96', WALK_H + 0.02)
  })
}

/** 涼州街側第二開間：木框玻璃門面，騎樓下的長椅 */
function cafeStorefront(b, seg) {
  const [from, to] = innerRange(seg)
  const open = [from + 0.35, to - 0.35]
  shopFrame(b, seg, () => {
    shopWall(b, { from, to, openings: [open] })
    const ow = open[1] - open[0]
    const panes = 4
    for (let i = 0; i < panes; i++) {
      const px = open[0] + (ow * (i + 0.5)) / panes
      const bottom = i === 1 ? WALK_H : WALK_H + 0.55
      b.box('glassWarm', [ow / panes - 0.08, 2.95 - bottom, 0.04], [px, (bottom + 2.95) / 2, 0.0])
      if (i !== 1) b.box('woodLight', [ow / panes, 0.55, 0.1], [px, WALK_H + 0.27, 0.03], { tint: '#f0d7b2' })
    }
    for (let i = 0; i <= panes; i++) b.box('wood', [0.07, 2.85, 0.1], [open[0] + (ow * i) / panes, WALK_H + 1.42, 0.04], { tint: '#6a4a33' })
    b.box('wood', [ow + 0.1, 0.1, 0.12], [(open[0] + open[1]) / 2, 2.98, 0.04], { tint: '#6a4a33' })
    for (const u of [-0.95, 0.95]) bench(b, [u, 0, 0.42], { length: 1.3, modern: true })
  })
}

/** 涼州街側第三開間：木板門 */
function doorsStorefront(b, seg) {
  const [from, to] = innerRange(seg)
  const open = [from + 0.4, to - 0.4]
  shopFrame(b, seg, () => {
    shopWall(b, { from, to, openings: [open] })
    const ow = open[1] - open[0]
    const leaves = 4
    for (let i = 0; i < leaves; i++) {
      const px = open[0] + (ow * (i + 0.5)) / leaves
      b.box('planks', [ow / leaves - 0.04, 2.85, 0.06], [px, WALK_H + 1.43, -0.02], { tint: '#9a7552' })
      b.box('wood', [ow / leaves - 0.04, 0.06, 0.08], [px, 1.1, 0.0], { tint: '#6a4a33' })
    }
    b.box('wood', [ow + 0.1, 0.1, 0.12], [(open[0] + open[1]) / 2, 2.98, 0.02], { tint: '#6a4a33' })
  })
}

/** 迪化街側開間：拉下的鐵捲門 */
function shutterStorefront(b, seg) {
  const [from, to] = innerRange(seg)
  const open = [from + 0.35, to - 0.35]
  shopFrame(b, seg, () => {
    shopWall(b, { from, to, openings: [open] })
    b.group([(open[0] + open[1]) / 2, 0, 0], 0, () => {
      rollingShutter(b, { width: open[1] - open[0], height: 2.7, y0: WALK_H, z: -0.05, openRatio: 0 })
    })
  })
}

const STOREFRONTS = {
  main: mainStorefront,
  noren: norenStorefront,
  cafe: cafeStorefront,
  doors: doorsStorefront,
  shutter: shutterStorefront,
}

/** 騎樓：地坪、天花、吸頂燈、柱間的樑與托座 */
function arcade(b) {
  slab(b, 'stone', ARCADE_OUTLINE, 0, WALK_H, C.floor)
  slab(b, 'stucco', [...insetOuter(0.15), ...ARCADE_OUTLINE.slice(4)], H.ceiling, 0.12, C.ceiling)
  // 轉角人行道（立面線外的三角形）與騎樓外緣的收邊石
  slab(b, 'pavers', [NODES[3], [SIDE_X, FRONT_Z], NODES[4]], 0, 0.03, '#efe9dd')
  for (const seg of SEGMENTS) {
    b.group(seg.center, seg.rotationY, () => {
      b.box('stone', [seg.length, WALK_H + 0.02, 0.2], [0, (WALK_H + 0.02) / 2, -0.1], { tint: '#6f6e6b' })
      arcadeBracket(b, seg.u0, 1)
      arcadeBracket(b, seg.u1, -1)
      // 吸頂燈
      const lights = Math.max(1, Math.round(seg.width / 2.4))
      for (let i = 0; i < lights; i++) {
        const u = seg.u0 + ((i + 0.5) * seg.width) / lights
        b.cylinder('bulb', 0.2, 0.22, 0.05, 14, [u, H.ceiling - 0.03, -WALK_D / 2], { tint: '#fffaf0' })
        b.add('plain', new TorusGeometry(0.22, 0.025, 4, 14), { position: [u, H.ceiling - 0.04, -WALK_D / 2], rotation: [Math.PI / 2, 0, 0], tint: '#3b302a' })
      }
    })
  }
  // 從柱子往店面牆的樑（轉角兩根大柱的樑斜向接到店面牆的轉角）
  const beam = ([x0, z0], [x1, z1]) => {
    const len = Math.hypot(x1 - x0, z1 - z0)
    b.box('granite', [0.36, H.ceiling - H.ground + 0.05, len], [(x0 + x1) / 2, (H.ground + H.ceiling) / 2, (z0 + z1) / 2], {
      rotation: [0, Math.atan2(x1 - x0, z1 - z0), 0],
      tint: C.granite,
    })
  }
  beam([PIERS[1].x, PIERS[1].z], [INNER.sideX, PIERS[1].z])
  beam([PIERS[2].x, PIERS[2].z], [INNER.sideX, PIERS[2].z])
  beam([PIERS[3].x, PIERS[3].z], INNER_CORNER_SIDE)
  beam([PIERS[4].x, PIERS[4].z], INNER_CORNER_FRONT)
  beam([PIERS[5].x, PIERS[5].z], [PIERS[5].x, INNER.frontZ])
  // 店面牆轉角的木作包柱
  for (const [x, z] of [INNER_CORNER_SIDE, INNER_CORNER_FRONT]) {
    // 兩面店面牆都往 (+x, -z) 方向是室內，包柱略往內收
    b.box('woodLight', [0.36, 3.0 - WALK_H, 0.36], [x + 0.035, WALK_H + (3.0 - WALK_H) / 2, z - 0.035], {
      rotation: [0, Math.PI / 4, 0],
      tint: C.wood,
    })
    b.box('granite', [0.42, H.ceiling - 3.0, 0.42], [x + 0.035, (3.0 + H.ceiling) / 2, z - 0.035], { rotation: [0, Math.PI / 4, 0], tint: C.graniteLight })
  }
}

/** 建築的其他部分：界牆、後牆、平屋頂 */
function body(b) {
  const topY = H.corniceTop + 0.55
  b.box('stucco', [WALL_T, topY, FRONT_Z - BACK_Z], [EAST_X - WALL_T / 2, topY / 2, (FRONT_Z + BACK_Z) / 2], { tint: '#cfcbc3', grime: 0.12 })
  b.box('stucco', [EAST_X - SIDE_X, topY, WALL_T], [(EAST_X + SIDE_X) / 2, topY / 2, BACK_Z + WALL_T / 2], { tint: '#cbc6bd', grime: 0.15 })
  b.box('granite', [WALL_T + 0.06, 0.12, FRONT_Z - BACK_Z], [EAST_X - WALL_T / 2, topY + 0.06, (FRONT_Z + BACK_Z) / 2], { tint: C.granite })
  b.box('granite', [EAST_X - SIDE_X, 0.12, WALL_T + 0.06], [(EAST_X + SIDE_X) / 2, topY + 0.06, BACK_Z + WALL_T / 2], { tint: C.granite })
  slab(b, 'stucco', FOOTPRINT, H.corniceTop - 0.12, 0.1, '#b9b5ad')
  // 屋頂上的樓梯間與水塔（從觀賞模式的高處看得到）
  b.box('stucco', [2.4, 2.0, 2.6], [1.8, H.corniceTop + 1.0, -9.5], { tint: '#d6d2c9' })
  b.box('plain', [2.6, 0.08, 2.8], [1.8, H.corniceTop + 2.04, -9.5], { tint: '#9a968e' })
  b.cylinder('plain', 0.55, 0.55, 1.1, 12, [1.8, H.corniceTop + 2.65, -10.2], { tint: '#c9c9c4' })
  // 一樓店面後方的室內隔間（從玻璃看進去時不會看到空蕩的建築內部）
  b.box('stucco', [EAST_X - INNER.sideX, H.ceiling, WALL_T], [(EAST_X + INNER.sideX) / 2, H.ceiling / 2, -8.2], { tint: '#d8d1c4' })
}

/* ── 街道：涼州街路面、斑馬線、路名牌、布旗 ─── */

/** 涼州街（本地座標）：沿著涼州街側立面往後延伸的短街 */
export const SIDE_STREET = { minX: SIDE_X - 4.6, maxX: SIDE_X, minZ: -17, maxZ: -5.0 }

function sideStreet(b) {
  const { minX, maxX, minZ, maxZ } = SIDE_STREET
  b.box('asphalt', [maxX - minX, 0.03, maxZ - minZ], [(minX + maxX) / 2, 0.015, (minZ + maxZ) / 2], { tint: '#c4bfb6' })
  // 路口的斑馬線
  for (let x = minX + 0.45; x < maxX - 0.3; x += 0.8) {
    b.box('plain', [0.42, 0.012, 1.3], [x, 0.036, maxZ - 1.0], { tint: '#f0eee8' })
  }
  b.box('plain', [maxX - minX - 0.2, 0.012, 0.12], [(minX + maxX) / 2, 0.036, maxZ - 1.95], { tint: '#f0eee8' })
  // 路名牌（綠底白字「涼州街」）
  const px = minX + 0.25
  const pz = maxZ + 0.4
  b.cylinder('plain', 0.06, 0.07, 4.2, 8, [px, 2.1, pz], { tint: '#8a9093' })
  b.box('plain', [0.06, 0.06, 0.34], [px, 3.85, pz - 0.15], { tint: '#8a9093' })
  b.box('plain', [0.5, 1.42, 0.05], [px, 3.0, pz - 0.36], { tint: '#1d6a50' })
  for (const r of [0, Math.PI]) {
    b.addSign({ text: '涼州街', style: 'road', vertical: true, width: 0.44, height: 1.34, position: [px, 3.0, pz - 0.36 + (r ? -0.027 : 0.027)], rotationY: r })
  }
}

/** 涼州街側柱子上的白色布旗（「滋養」） */
function pierBanners(b) {
  for (const index of [1, 2]) {
    const pier = PIERS[index]
    b.group([pier.x, 0, pier.z], pier.rotationY, () => {
      b.box('plain', [0.03, 0.03, 0.7], [0, 7.55, pier.size / 2 + 0.33], { tint: '#3a3633' })
      b.addBanner({ text: '滋養', style: 'whiteCloth', vertical: true, width: 0.4, height: 1.5, position: [0, 6.78, pier.size / 2 + 0.55], rotationY: Math.PI / 2 })
    })
  }
}

/* ── 碰撞、遮擋與觀賞鏡頭 ───────────────── */

/** 斜切轉角的遮擋：把轉角三角形切成幾段階梯狀的方塊 */
function chamferSlices(count = 5) {
  const z0 = FRONT_Z - CHAMFER
  const step = CHAMFER / count
  const slices = []
  for (let k = 0; k < count; k++) {
    const za = z0 + k * step
    const zb = za + step
    slices.push({ minX: SIDE_X + (za + zb) / 2 - z0, maxX: EAST_X, minZ: za, maxZ: zb })
  }
  return slices
}

function registerBlockers(b) {
  b.addBlocker(SIDE_X, EAST_X, 0, H.friezeTop, BACK_Z, FRONT_Z - CHAMFER)
  for (const s of chamferSlices()) b.addBlocker(s.minX, s.maxX, 0, H.friezeTop, s.minZ, s.maxZ)
  // 轉角中央山牆
  const c = SEGMENTS[3]
  const cx = c.center[0] + Math.sin(c.rotationY) * -0.45
  const cz = c.center[2] + Math.cos(c.rotationY) * -0.45
  b.addBlocker(cx - 0.75, cx + 0.75, H.friezeTop, H.friezeTop + 2.4, cz - 0.75, cz + 0.75)
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：涼州街、轉角三角形的人行道；
 * 凸出立面的轉角大柱與涼州街側的柱子。transform 為本地 → 世界座標（同 templeCollision）。
 */
export function ziYangCollision(config, transform) {
  const rect = (minX, maxX, minZ, maxZ) => {
    const a = transform(minX, minZ)
    const c = transform(maxX, maxZ)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  const cornerZ = FRONT_Z - CHAMFER
  const walkable = [
    // 涼州街（與河岸廣場重疊一段，才走得進去）
    rect(SIDE_STREET.minX + 0.3, SIDE_X - 0.45, BACK_Z + 0.6, SIDE_STREET.maxZ + 3.0),
    // 斜切轉角前的三角形人行道（以三個方塊近似，並與街道、廣場重疊）
    rect(SIDE_X - 0.8, SIDE_X + 2.1, FRONT_Z - 2.2, FRONT_Z + 1.0),
    rect(SIDE_X - 0.8, SIDE_X + 0.8, cornerZ + 1.1, FRONT_Z - 1.7),
    rect(SIDE_X + 1.6, SIDE_X + 3.4, FRONT_Z - 1.1, FRONT_Z + 1.0),
  ]
  const obstacles = PIERS.map((pier) => {
    const r = pier.size / 2 + (pier.size > 0.8 ? 0.2 : 0.02)
    return rect(pier.x - r, pier.x + r, pier.z - r, pier.z + r)
  })
  // 路名牌的柱子
  obstacles.push(rect(SIDE_STREET.minX + 0.12, SIDE_STREET.minX + 0.38, SIDE_STREET.maxZ + 0.27, SIDE_STREET.maxZ + 0.53))
  return { walkable, obstacles }
}

/* ── 主程式 ─────────────────────────────── */

export function buildZiYang(b) {
  sideStreet(b)
  arcade(b)
  for (const seg of SEGMENTS) {
    b.group(seg.center, seg.rotationY, () => upperFacade(b, seg))
    STOREFRONTS[seg.ground]?.(b, seg)
  }
  for (const pier of PIERS) b.group([pier.x, 0, pier.z], pier.rotationY, () => brickPier(b, pier))
  body(b)
  pierBanners(b)
  registerBlockers(b)

  const c = SEGMENTS[3]
  const forward = [Math.sin(c.rotationY), Math.cos(c.rotationY)]
  const at = (u, y, z) => {
    const cos = Math.cos(c.rotationY)
    const sin = Math.sin(c.rotationY)
    const p = b.transformPoint(c.center[0] + u * cos + z * sin, y, c.center[2] - u * sin + z * cos)
    return [p.x, p.y, p.z]
  }
  const worldForward = b.transformPoint(forward[0], 0, forward[1]).sub(b.transformPoint(0, 0, 0))
  return {
    groundHeight: H.ground,
    topHeight: H.friezeTop,
    // 店名提示在轉角騎樓開口的上緣；屋頂標記在中央山牆的大圓球上方
    anchors: { prompt: at(0, H.ground - 0.2, 0.4), marker: at(0, H.friezeTop + 4.5, -0.2) },
    // 觀賞模式聚焦的立面：斜切的轉角立面
    focus: {
      center: { x: at(0, 0, 0)[0], z: at(0, 0, 0)[2] },
      forward: { x: worldForward.x, z: worldForward.z },
      width: c.length + 2.5,
      // 到中央山牆頂端的大圓球
      height: H.friezeTop + 2.75,
    },
  }
}
