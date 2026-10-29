import { CubicBezierCurve3, CylinderGeometry, IcosahedronGeometry, QuadraticBezierCurve3, Shape, TubeGeometry, Vector3 } from 'three'
import { PIER, PLAZA, RIVER, STREET } from '../config.js'
import { createRng, pick, range } from '../utils/random.js'
import { shade } from './props.js'
import { gableShape, junkHullShape, ridgeShape, sailShape } from './shapes.js'

/* ───────────── 地面、街道鋪面、河岸與碼頭 ───────────── */

/**
 * 各年代的街道鋪面：
 * - stone-earth 清末：夯土街道＋中央石板路
 * - stone       日治初期：整條街鋪上花崗石板
 * - paved       1930 年代：平整的道路與路緣石
 * - asphalt     戰後：柏油路面、補丁、人孔蓋與水溝蓋
 * - pavers      現在：修復後的仿石鋪面與收邊
 */
const GROUND_STYLES = {
  'stone-earth': { earth: '#ffffff', plaza: ['stone', '#ebe4d6'], pier: '#c9b08c' },
  stone: { earth: '#f2ece2', plaza: ['stone', '#e4ddd0'], pier: '#c4ab88' },
  paved: { earth: '#ece4d6', plaza: ['stone', '#e0dacd'], pier: '#bea684' },
  asphalt: { earth: '#ddd5c6', plaza: ['asphalt', '#c9c4ba'], pier: '#a99883' },
  pavers: { earth: '#e9e3d6', plaza: ['pavers', '#efe9dd'], pier: '#c8b294' },
}

export function buildGround(b, style = 'stone-earth') {
  const look = GROUND_STYLES[style] ?? GROUND_STYLES['stone-earth']
  const groundMinX = RIVER.edgeX
  const groundMaxX = 330
  const groundW = groundMaxX - groundMinX
  b.plane('earth', groundW, 660, [(groundMinX + groundMaxX) / 2, -0.01, 0], {
    rotation: [-Math.PI / 2, 0, 0],
    uvRepeat: [groundW / 4, 660 / 4],
    tint: look.earth,
  })
  // 對岸
  b.plane('earth', 520, 900, [-480, RIVER.waterLevel + 0.45, 0], {
    rotation: [-Math.PI / 2, 0, 0],
    uvRepeat: [520 / 6, 900 / 6],
    tint: '#c2c49d',
  })

  const laneStart = PLAZA.maxX - 0.4
  const laneEnd = STREET.endFacadeX
  const laneLength = laneEnd - laneStart
  const laneX = (laneStart + laneEnd) / 2
  const edge = STREET.facadeZ - STREET.walkwayDepth
  const rowLength = STREET.rowEndX - STREET.rowStartX
  const rowX = (STREET.rowStartX + STREET.rowEndX) / 2

  if (style === 'stone-earth') {
    // 中央石板路
    b.box('stone', [laneLength, 0.03, STREET.laneHalfWidth * 2], [laneX, 0.015, 0], { tint: '#f2ece0' })
  } else if (style === 'stone') {
    // 整條街的花崗石板，中央一道較淺的石板
    b.box('stone', [laneLength, 0.03, edge * 2 - 0.3], [laneX, 0.015, 0], { tint: '#e3dccf' })
    b.box('stone', [laneLength, 0.034, STREET.laneHalfWidth * 1.4], [laneX, 0.017, 0], { tint: '#efe9dd' })
  } else if (style === 'paved') {
    // 1930 年代：平整的混凝土路面（大塊鋪板）
    b.box('stone', [laneLength, 0.03, edge * 2 - 0.34], [laneX, 0.015, 0], { tint: '#ddd6c9' })
    for (const side of [-1, 1]) {
      b.box('stone', [rowLength, 0.09, 0.22], [rowX, 0.045, side * (edge - 0.28)], { tint: '#e8e1d3' })
    }
  } else if (style === 'asphalt') {
    b.box('asphalt', [laneLength, 0.03, edge * 2 - 0.34], [laneX, 0.015, 0], { tint: '#d9d4ca' })
    // 補丁與人孔蓋
    const rng = createRng(1966)
    for (let i = 0; i < 14; i++) {
      const w = range(rng, 1.2, 3.4)
      const d = range(rng, 0.6, 1.6)
      b.box('asphalt', [w, 0.034, d], [range(rng, STREET.rowStartX + 2, STREET.rowEndX - 2), 0.017, range(rng, -1.6, 1.6)], {
        tint: pick(rng, ['#c4bfb5', '#d2cdc3', '#bcb7ae']),
      })
    }
    for (const x of [-22, -6, 10, 26]) {
      b.cylinder('dark', 0.36, 0.36, 0.04, 14, [x, 0.02, 0.4], { tint: '#5f5b55' })
      b.cylinder('dark', 0.28, 0.28, 0.046, 14, [x, 0.022, 0.4], { tint: '#6d6962' })
    }
    for (const side of [-1, 1]) {
      b.box('stone', [rowLength, 0.09, 0.22], [rowX, 0.045, side * (edge - 0.28)], { tint: '#cfc9bd' })
    }
  } else if (style === 'pavers') {
    b.box('pavers', [laneLength, 0.03, edge * 2 - 0.3], [laneX, 0.015, 0], { tint: '#ece6da' })
    for (const side of [-1, 1]) {
      b.box('stone', [laneLength, 0.034, 0.32], [laneX, 0.017, side * (edge - 0.42)], { tint: '#cdc4b4' })
    }
  }

  // 排水溝（戰後之後加上水溝蓋）
  for (const side of [-1, 1]) {
    b.box('dark', [rowLength, 0.012, 0.16], [rowX, 0.006, side * (edge - 0.08)], {
      tint: style === 'asphalt' || style === 'pavers' ? '#6f6a62' : '#857a69',
    })
  }

  // 河岸廣場鋪面
  const [plazaMat, plazaTint] = look.plaza
  b.box(plazaMat, [PLAZA.maxX - PLAZA.minX, 0.03, PLAZA.halfDepth * 2], [(PLAZA.minX + PLAZA.maxX) / 2, 0.015, 0], {
    tint: plazaTint,
  })
  // 石砌堤岸
  const bankW = PLAZA.minX - RIVER.edgeX
  b.box('stone', [bankW, 2.5, 150], [RIVER.edgeX + bankW / 2, -1.2, 0], { tint: '#a69d8b', grime: 0.35 })
  b.box('stone', [bankW + 0.12, 0.14, 150], [RIVER.edgeX + bankW / 2 - 0.06, 0.07, 0], { tint: '#cbc3b2' })

  // 碼頭棧橋
  const deckLen = PIER.maxX + 0.6 - PIER.minX
  b.box('planks', [deckLen, 0.14, PIER.halfWidth * 2], [PIER.minX + deckLen / 2, -0.03, 0], { tint: look.pier })
  for (const side of [-1, 1]) {
    b.box('wood', [deckLen, 0.16, 0.12], [PIER.minX + deckLen / 2, -0.15, side * (PIER.halfWidth - 0.06)], {
      tint: '#7a5f45',
    })
  }
  for (let x = PIER.maxX - 1.2; x >= PIER.minX; x -= 2.3) {
    for (const side of [-1, 1]) {
      b.cylinder('wood', 0.12, 0.13, 2.6, 7, [x, -1.3, side * (PIER.halfWidth - 0.1)], { tint: '#6c5440', grime: 0.4 })
    }
    b.box('wood', [0.16, 0.14, PIER.halfWidth * 2], [x, -0.2, 0], { tint: '#6c5440' })
  }
  // 現代碼頭的欄杆
  if (style === 'pavers') {
    for (const side of [-1, 1]) {
      b.box('plain', [deckLen - 1.2, 0.05, 0.05], [PIER.minX + deckLen / 2 + 0.4, 1.0, side * (PIER.halfWidth - 0.08)], { tint: '#3c4a4f' })
      for (let x = PIER.minX + 0.4; x < PIER.maxX; x += 1.6) {
        b.box('plain', [0.05, 1.0, 0.05], [x, 0.5, side * (PIER.halfWidth - 0.08)], { tint: '#3c4a4f' })
      }
    }
  }
}

export function buildMooringPosts(b, posts) {
  for (const [x, z] of posts) {
    b.cylinder('wood', 0.13, 0.15, 0.62, 8, [x, 0.31, z], { tint: '#6f5641', grime: 0.3 })
    b.cylinder('wood', 0.17, 0.17, 0.08, 8, [x, 0.64, z], { tint: '#5b4635' })
  }
}

/* ───────────── 背景建築（第二排屋頂，形成天際線） ───────────── */
function backdropHouse(b, { x, z, width, depth, height, material, tint, roofTint, gable, rotationY = 0 }) {
  b.group([x, 0, z], rotationY, () => {
    const rise = Math.min(2.6, depth * 0.26)
    const ridgeY = height + rise
    b.box(material, [width - 0.5, height, depth - 0.2], [0, height / 2, -depth / 2], { tint, grime: 0.15 })
    const shape = gableShape(depth, height, ridgeY, gable)
    b.extrude(material, shape, 0.25, { position: [-width / 2, 0, 0], rotation: [0, Math.PI / 2, 0], tint })
    b.extrude(material, shape, 0.25, { position: [width / 2 - 0.25, 0, 0], rotation: [0, Math.PI / 2, 0], tint })
    const angle = Math.atan(rise / (depth / 2))
    const len = Math.hypot(depth / 2 + 0.4, rise + 0.18) + 0.1
    b.box('roof', [width - 0.48, 0.12, len], [0, height + rise / 2 - 0.02, -depth / 4 + 0.2], {
      rotation: [angle, 0, 0],
      tint: roofTint,
    })
    b.box('roof', [width - 0.48, 0.12, len], [0, height + rise / 2 - 0.02, (-depth * 3) / 4 - 0.2], {
      rotation: [-angle, 0, 0],
      tint: shade(roofTint, 0.92),
    })
    b.extrude('roof', ridgeShape(width - 0.3, 'curved'), 0.3, {
      position: [0, ridgeY - 0.06, -depth / 2 - 0.15],
      tint: shade(roofTint, 0.85),
    })
  })
}

/** 平頂的洋樓或鋼筋混凝土樓房（日治後期之後的天際線） */
function backdropBlock(b, { x, z, width, depth, height, tint, rotationY = 0, tank = false, rng }) {
  b.group([x, 0, z], rotationY, () => {
    const mat = height > 11 ? 'stucco' : pick(rng, ['stucco', 'tile', 'stucco'])
    b.box(mat, [width - 0.4, height, depth - 0.2], [0, height / 2, -depth / 2], { tint, grime: 0.18 })
    // 女兒牆與樓層線
    b.box('stucco', [width - 0.2, 0.5, 0.25], [0, height + 0.25, -0.1], { tint: shade(tint, 1.04) })
    const floors = Math.max(1, Math.round(height / 3.1))
    for (let f = 1; f < floors; f++) {
      b.box('stucco', [width - 0.3, 0.12, 0.12], [0, f * (height / floors), 0.02], { tint: shade(tint, 0.93) })
    }
    // 窗列
    const cols = Math.max(1, Math.floor((width - 0.8) / 1.5))
    for (let f = 0; f < floors; f++) {
      const y = (f + 0.55) * (height / floors)
      for (let c = 0; c < cols; c++) {
        const wx = -((cols - 1) * 1.5) / 2 + c * 1.5
        b.box('dark', [0.8, 1.0, 0.05], [wx, y, 0.02], { tint: '#4b4540' })
      }
    }
    if (tank) {
      b.cylinder('plain', 0.55, 0.55, 1.1, 10, [width * 0.15, height + 1.25, -depth * 0.4], { tint: '#b9c3c4' })
      for (const sx of [-0.35, 0.35]) b.box('plain', [0.08, 0.7, 0.08], [width * 0.15 + sx, height + 0.35, -depth * 0.4], { tint: '#6f706b' })
    }
  })
}

/**
 * 在街屋列後方排出第二、三排較簡化的屋頂，形成有層次的天際線。
 * exclusions：要留空的區域（樹、廟宇），格式 { minX, maxX, minZ, maxZ }
 * options.modern：改建成平頂樓房的比例；options.tall：五層以上樓房的比例；
 * options.skyline：遠方的現代大樓（老屋新生）
 */
export function buildBackdrop(b, exclusions = [], { modern = 0, tall = 0, skyline = false, skylineBuilder = b } = {}) {
  const rng = createRng(91)
  const tints = ['#e9dcc0', '#e2d7bd', '#d9dac3', '#ead6b9']
  const roofTints = ['#ffffff', '#ece0d8', '#ddd5cf']
  const blockTints = ['#e6e0d2', '#dcd6c8', '#e9ddc8', '#d6d9cf', '#e2d3c3']
  // 沿 x 排列的帶狀區域：[x0, x1, 立面 z, 朝向]；朝向 0 = 面南、PI = 面北
  const strips = [
    [-33, 36, -19.5, 0],
    [-33, 36, 19.5, Math.PI],
    [-44, -34, -21, 0],
    [-44, -34, 21, Math.PI],
    [37.5, 64, -7.4, 0],
    [37.5, 64, 7.4, Math.PI],
  ]
  const blocked = (minX, maxX, minZ, maxZ) =>
    exclusions.some((e) => minX < e.maxX && maxX > e.minX && minZ < e.maxZ && maxZ > e.minZ)

  const place = (config) => {
    const { x, z, width, depth, rotationY } = config
    // 粗略計算佔地（四種朝向皆為軸對齊）
    const alongX = Math.abs(Math.sin(rotationY)) < 0.5
    const hx = alongX ? width / 2 : depth
    const hz = alongX ? depth : width / 2
    if (blocked(x - hx, x + hx, z - hz, z + hz)) return
    // 每塊地都先抽籤（不論年代），讓同一位置在各年代的演變一致
    const roll = rng()
    const tallRoll = rng()
    const blockTint = pick(rng, blockTints)
    const tank = rng() < 0.5
    if (roll < modern) {
      const height = tallRoll < tall ? range(rng, 13, 19) : range(rng, 6.4, 10.5)
      backdropBlock(b, { ...config, height, tint: blockTint, tank: tank && height < 13, rng })
    } else {
      backdropHouse(b, config)
    }
  }
  const randomConfig = () => ({
    width: range(rng, 4.5, 7.5),
    depth: range(rng, 7, 10),
    height: pick(rng, [3.6, 4.2, 4.8, 6.0, 6.6]),
    material: rng() < 0.45 ? 'brick' : 'plaster',
    tint: pick(rng, tints),
    roofTint: pick(rng, roofTints),
    gable: rng() < 0.5 ? 'horseback' : 'gable',
  })

  for (const [x0, x1, zFace, rotationY] of strips) {
    let x = x0
    while (x < x1) {
      const config = randomConfig()
      const inset = range(rng, 0, 2.2)
      const z = rotationY === 0 ? zFace - inset : zFace + inset
      place({ ...config, x: x + config.width / 2, z, rotationY })
      x += config.width + range(rng, 0, 1.2)
    }
  }
  // 街底建築後方：面向西、沿 z 排列
  let z = -6.4
  while (z < 6.4) {
    const config = randomConfig()
    place({ ...config, x: 51 + range(rng, 0, 4), z: z + config.width / 2, rotationY: -Math.PI / 2 })
    z += config.width + range(rng, 0, 1)
  }

  // 遠方的現代城市天際線（只在「老屋新生」出現，色調淡、融入霧氣）
  if (skyline) {
    const towers = [
      [120, -70, 46], [138, -40, 62], [150, 10, 38], [132, 48, 54], [170, -95, 70],
      [190, 60, 44], [160, 92, 58], [210, -20, 80], [95, 110, 36], [105, -120, 40],
    ]
    for (const [x, zz, h] of towers) {
      const w = range(rng, 14, 22)
      skylineBuilder.box('stucco', [w, h, w * 0.8], [x, h / 2, zz], { tint: pick(rng, ['#d9dcd8', '#d2d6d4', '#e1ddd3']) })
      skylineBuilder.box('dark', [w * 0.85, h * 0.9, 0.1], [x - w / 2 - 0.06, h * 0.48, zz], { rotation: [0, Math.PI / 2, 0], tint: '#9aa3a6' })
    }
  }
}

/* ───────────── 遠方廟宇屋頂（不標示名稱，僅作天際線） ───────────── */
export function buildTempleRoofs(b, position = [6, 0, 25], rotationY = Math.PI) {
  b.group(position, rotationY, () => {
    const w = 11
    const d = 9
    b.box('brick', [w, 4.2, d], [0, 2.1, -d / 2], { grime: 0.2 })
    // 下層屋簷
    for (const s of [1, -1]) {
      b.box('roof', [w + 1.2, 0.14, 3.0], [0, 4.55, -d / 2 + s * 3.6], {
        rotation: [s * 0.42, 0, 0],
        tint: '#f4e2d8',
      })
    }
    // 上層
    b.box('plaster', [w - 3, 2.2, d - 3], [0, 5.6, -d / 2], { tint: '#eadcc2' })
    for (const s of [1, -1]) {
      b.box('roof', [w - 1.4, 0.14, 3.6], [0, 7.25, -d / 2 + s * 1.65], {
        rotation: [s * 0.5, 0, 0],
        tint: '#ffffff',
      })
    }
    b.extrude('roof', ridgeShape(w - 2.2, 'swallowtail'), 0.4, {
      position: [0, 8.05, -d / 2 - 0.2],
      tint: '#d9c4b8',
    })
    // 屋脊中央寶珠
    b.add('plain', new IcosahedronGeometry(0.32, 1), { position: [0, 8.65, -d / 2], tint: '#c9a24f' })
  })
}

/* ───────────── 樹木 ───────────── */
/** 點到矩形（水平面）的距離 */
function distanceToClearing(c, px, pz) {
  return Math.hypot(Math.max(c.minX - px, 0, px - c.maxX), Math.max(c.minZ - pz, 0, pz - c.maxZ))
}

/** 樹冠的一團在留空範圍上方要抬高多少（範圍裡最大的那一個）；squash 是葉團的高度比例 */
function clearingLift(clearings, bx, bz, by, r, squash = 0.72) {
  let lift = 0
  for (const c of clearings) {
    const near = distanceToClearing(c, bx, bz)
    if (near >= r) continue
    const bottom = by - squash * r * Math.sqrt(1 - (near / r) ** 2)
    if (bottom < c.top) lift = Math.max(lift, c.top - bottom)
  }
  return lift
}

/** 氣根末端的最低高度：不在樹幹附近落地的氣根都停在這個高度以上，不擋住人物的走道 */
export const BANYAN_ROOT_CLEARANCE = 2.05

/**
 * 榕樹的樹冠：三層錯開的葉叢（下層寬而扁、顏色最深，上層小而亮），像手繪的層層葉片。
 * 每一層的數量、離樹幹的距離、半徑、高度（乘上 scale）與葉團的高度比例。
 */
const BANYAN_LAYERS = [
  { count: 6, d: [1.6, 2.2], r: [1.15, 1.45], y: [0.5, 0.85], squash: 0.5, greens: ['#6f8160', '#76875f', '#6a7b5c'] },
  { count: 5, d: [0.8, 1.5], r: [1.3, 1.7], y: [1.2, 1.55], squash: 0.56, greens: ['#8e9c77', '#7f8e6b', '#86956f'] },
  { count: 3, d: [0, 0.7], r: [1.1, 1.45], y: [1.95, 2.3], squash: 0.62, greens: ['#a3ae86', '#9aa682', '#adb68e'] },
]

/** 樹幹在高度 h 的半徑 */
function trunkRadiusAt(h, trunkH, scale) {
  const t = Math.min(Math.max(h / trunkH, 0), 1)
  return (0.55 + (0.28 - 0.55) * t) * scale
}

/** 一條氣根的路徑在水平面上是否靠近留空範圍（取曲線上的幾個點） */
function rootInClearing(curve, clearings) {
  if (!clearings.length) return false
  for (let i = 0; i <= 8; i++) {
    const p = curve.getPoint(i / 8)
    if (clearings.some((c) => distanceToClearing(c, p.x, p.z) < 0.12)) return true
  }
  return false
}

function addRoot(target, curve, radius, tint) {
  target.add('wood', new TubeGeometry(curve, 6, radius, 3, false), { tint })
}

/**
 * 榕樹的氣根（亂數的使用順序與留空範圍無關）：
 * - 落地的支柱根：從下層樹冠垂下，在 groundRadius 以內（樹幹與石座的碰撞範圍裡）落到 floorY；
 *   路徑先在樹冠裡往樹幹收、再幾乎垂直地落下，低於 BANYAN_ROOT_CLEARANCE 的部分都在 groundRadius 以內
 * - 垂在樹冠下的短氣根：末端停在 BANYAN_ROOT_CLEARANCE 以上，人物從底下走過
 * - detail 有給時（精緻模式才顯示的細部）另外多一批短氣根；流暢模式（觸控裝置的預設）只有前兩種
 */
function banyanRoots(b, detail, { x, y, z, scale, trunkH, seed, clearings, groundRadius, floorY }) {
  const rng = createRng(seed * 7 + 3)
  const tints = ['#7c6650', '#6f5b47', '#85705a']
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + rng() * 0.8
    const d0 = range(rng, 1.0, 1.6) * scale
    const y0 = y + trunkH + range(rng, 0.45, 0.7) * scale
    const twist = range(rng, -0.25, 0.25)
    const tint = pick(rng, tints)
    const radius = range(rng, 0.035, 0.05)
    const floorR = trunkRadiusAt(floorY - y, trunkH, scale)
    let dEnd = range(rng, floorR + 0.06, groundRadius - 0.14)
    let yEnd = y + floorY
    // 碰撞範圍只比樹幹粗一點（例如河岸廣場的榕樹）：氣根貼著樹幹落下，在樹幹的下段長進樹幹
    if (groundRadius - 0.14 < floorR + 0.06) {
      yEnd = y + range(rng, 0.55, 0.95) * scale
      dEnd = trunkRadiusAt(yEnd - y, trunkH, scale) + 0.02
    }
    const at = (d, h, da = 0) => new Vector3(x + Math.cos(a + da) * d, h, z + Math.sin(a + da) * d)
    const curve = new CubicBezierCurve3(
      at(d0, y0),
      at(dEnd + (d0 - dEnd) * 0.3, y0, twist * 0.5),
      at(dEnd, y0 - 0.2 * scale, twist),
      at(dEnd, yEnd, twist),
    )
    if (!rootInClearing(curve, clearings)) addRoot(b, curve, radius, tint)
  }
  const curtain = (target, count, r) => {
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2
      const d0 = range(r, 1.1, 2.5) * scale
      const y0 = y + trunkH + range(r, 0.55, 0.8) * scale
      const yEnd = Math.max(y + BANYAN_ROOT_CLEARANCE, y0 - range(r, 0.8, 1.4))
      const sway = range(r, -0.14, 0.14)
      const tint = pick(r, tints)
      const radius = range(r, 0.02, 0.032)
      const top = new Vector3(x + Math.cos(a) * d0, y0, z + Math.sin(a) * d0)
      const end = new Vector3(top.x + Math.sin(a) * sway, yEnd, top.z - Math.cos(a) * sway)
      const mid = new Vector3((top.x + end.x) / 2 + Math.cos(a) * 0.08, (y0 + yEnd) / 2, (top.z + end.z) / 2 + Math.sin(a) * 0.08)
      const curve = new QuadraticBezierCurve3(top, mid, end)
      if (!rootInClearing(curve, clearings)) addRoot(target, curve, radius, tint)
    }
  }
  curtain(b, 8, rng)
  if (detail) curtain(detail, 10, createRng(seed * 7 + 5))
}

/**
 * clearing：樹下要留空的範圍（同一個本地座標的矩形與高度 top，例如榕樹下的攤位；可以是一個或多個）：
 * 經過範圍的氣根不產生，樹冠在範圍上方的底面抬高到 top 以上。亂數的使用順序不變，其他部分的形狀與原本相同。
 * 榕樹（banyan）另外可以指定：
 * - groundRadius：氣根可以落地的水平半徑（樹幹與石座的碰撞範圍，人物走不進去）
 * - floorY：落地氣根的末端高度（環樹石座的座面）
 * - detail：精緻模式才顯示的細部，多一批垂在樹冠下的短氣根
 */
export function buildTree(
  b,
  position,
  { scale = 1, seed = 1, banyan = false, clearing = null, groundRadius = 0.55, floorY = 0.38, detail = null } = {},
) {
  const rng = createRng(seed)
  const [x, y, z] = position
  const clearings = clearing ? [clearing].flat().filter(Boolean) : []
  const trunkH = (banyan ? 2.6 : 3.2) * scale
  b.cylinder('wood', 0.28 * scale, (banyan ? 0.55 : 0.38) * scale, trunkH, 8, [x, y + trunkH / 2, z], {
    tint: '#8a7258',
    grime: 0.25,
  })
  if (!banyan) {
    const greens = ['#8e9c77', '#7f8e6b', '#9aa682', '#86956f']
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + rng()
      const d = (i === 0 ? 0 : range(rng, 1.0, 2.0)) * scale
      const r = range(rng, 1.4, 2.1) * scale
      const bx = x + Math.cos(a) * d
      const bz = z + Math.sin(a) * d
      let by = y + trunkH + range(rng, 0.6, 1.6) * scale
      by += clearingLift(clearings, bx, bz, by, r)
      b.add('plain', new IcosahedronGeometry(r, 1), {
        position: [bx, by, bz],
        scale: [1, 0.72, 1],
        rotation: [0, rng() * 6, 0],
        tint: pick(rng, greens),
      })
    }
    return
  }
  // 多層樹冠：每一層的葉叢與下一層錯開半格
  BANYAN_LAYERS.forEach((layer, k) => {
    for (let i = 0; i < layer.count; i++) {
      const a = ((i + k * 0.5) / layer.count) * Math.PI * 2 + rng() * 0.6
      const d = range(rng, ...layer.d) * scale
      const r = range(rng, ...layer.r) * scale
      const bx = x + Math.cos(a) * d
      const bz = z + Math.sin(a) * d
      let by = y + trunkH + range(rng, ...layer.y) * scale
      by += clearingLift(clearings, bx, bz, by, r, layer.squash)
      b.add('plain', new IcosahedronGeometry(r, 1), {
        position: [bx, by, bz],
        scale: [1, layer.squash, 1],
        rotation: [0, rng() * 6, 0],
        tint: pick(rng, layer.greens),
      })
    }
  })
  banyanRoots(b, detail, { x, y, z, scale, trunkH, seed, clearings, groundRadius, floorY })
  // 落葉從下層樹冠的下緣飄下來（components/LeafLayer.jsx）；落在石座外的地面
  b.addLeafTree?.(x, z, { top: y + trunkH + 0.2 * scale, radius: 2.4 * scale, ground: y })
  // 樹下石座
  b.cylinder('stone', 0.95, 1.05, 0.38, 10, [x, y + 0.19, z], { tint: '#c8c0ae' })
}

/* ───────────── 戎克船 ───────────── */
/** 船上的茶箱（清末碼頭接駁的貨；木箱加彩色外裱紙，不另加材質；尺寸同 data/qingWharfLayout.js 的 TEA_CHEST） */
function deckTeaChests(b, spots, deckY) {
  spots.forEach(([x, z, layer = 0, r = 0], i) => {
    const y = deckY + layer * 0.36
    b.box('wood', [0.48, 0.36, 0.36], [x, y + 0.18, z], { rotation: [0, r, 0], tint: ['#c9a77a', '#bf9c6f'][i % 2] })
    b.plane('paper', 0.38, 0.25, [x, y + 0.18, z + 0.186], { rotation: [0, r, 0], tint: ['#e3b45a', '#d9876a', '#ece0c4'][i % 3] })
  })
}

export function buildJunk(b, { length = 9, beam = 2.6, sails = 2, sailTint = '#b98d5f', furled = false, sailAngle = 1.1, cargo = null } = {}) {
  b.extrude('wood', junkHullShape(length), beam, { position: [0, 0, -beam / 2], tint: '#8d6c4d', grime: 0.3 })
  b.box('planks', [length - 1.3, 0.08, beam - 0.1], [0.1, 0.92, 0], { tint: '#bf9f7a' })
  if (cargo === 'tea') deckTeaChests(b, [[1.4, -0.45], [1.4, 0.0], [1.95, -0.22], [1.65, -0.22, 1], [-0.6, 0.5], [-1.15, 0.5]], 0.96)
  for (const s of [-1, 1]) {
    b.box('wood', [length * 0.86, 0.14, 0.08], [0.05, 1.02, s * (beam / 2 + 0.02)], { tint: '#5d4533' })
    // 船眼
    b.cylinder('plain', 0.17, 0.17, 0.03, 10, [length / 2 - 0.95, 0.7, s * (beam / 2 + 0.03)], {
      rotation: [Math.PI / 2, 0, 0],
      tint: '#efe6d2',
    })
    b.cylinder('plain', 0.08, 0.08, 0.04, 8, [length / 2 - 0.92, 0.7, s * (beam / 2 + 0.04)], {
      rotation: [Math.PI / 2, 0, 0],
      tint: '#2b231d',
    })
  }
  b.box('wood', [2.0, 0.95, beam - 0.5], [-length / 2 + 1.5, 1.4, 0], { tint: '#9d7e5d' })
  b.box('roof', [2.3, 0.1, beam - 0.2], [-length / 2 + 1.5, 1.92, 0], { tint: '#e5d7cc' })
  const masts = sails === 1 ? [length * 0.1] : [length * 0.18, -length * 0.12]
  masts.forEach((mx, i) => {
    const h = i === 0 ? 7.2 : 5.6
    b.cylinder('wood', 0.07, 0.11, h, 6, [mx, 0.9 + h / 2, 0], { tint: '#6f533b' })
    if (furled) {
      b.cylinder('cloth', 0.22, 0.22, 2.6, 7, [mx - 0.3, 0.9 + h * 0.35, 0], { rotation: [0, 0, Math.PI / 2], tint: sailTint })
      return
    }
    // 帆繞桅杆轉向，讓岸上看得到帆面
    const sw = i === 0 ? 3.6 : 2.8
    const sh = i === 0 ? 5.4 : 4.1
    b.group([mx, 0, 0], sailAngle, () => {
      b.extrude('cloth', sailShape(sw, sh), 0.04, {
        position: [-0.35, 1.7, 0.12],
        tint: sailTint,
      })
      const battens = Math.floor(sh / 0.85)
      for (let k = 1; k <= battens; k++) {
        const by = 1.7 + (k * sh) / (battens + 1)
        b.box('wood', [sw * 0.98, 0.05, 0.07], [-0.32, by, 0.14], { tint: '#5d4533' })
      }
    })
  })
}

/* ───────────── 舢舨（小型木船，1930 年代之後河面常見） ───────────── */
export function buildSampan(b, { length = 5.2, beam = 1.5, canopy = true, tint = '#8a6a4c', cargo = null } = {}) {
  b.extrude('wood', junkHullShape(length), beam, { position: [0, 0, -beam / 2], scale: [1, 0.55, 1], tint, grime: 0.3 })
  b.box('planks', [length - 1.4, 0.06, beam - 0.12], [0.1, 0.5, 0], { tint: '#bf9f7a' })
  for (const s of [-1, 1]) b.box('wood', [length * 0.84, 0.1, 0.07], [0.05, 0.58, s * (beam / 2 + 0.01)], { tint: '#5d4533' })
  // 駁船載著茶箱（棚子後方的船艙空著，船頭留給撐篙的人）
  if (cargo === 'tea') deckTeaChests(b, [[0.75, -0.2], [0.75, 0.2], [1.3, 0.0], [1.0, 0.0, 1, 0.1]], 0.53)
  if (canopy) {
    const roof = new CylinderGeometry(beam * 0.48, beam * 0.48, length * 0.38, 10, 1, true, -Math.PI / 2, Math.PI)
    b.add('bamboo', roof, { position: [-length * 0.08, 0.62, 0], rotation: [0, 0, Math.PI / 2], tint: '#c9ae7c' })
  }
  // 撐篙
  b.cylinder('bamboo', 0.03, 0.03, 4.2, 5, [length * 0.3, 1.6, beam * 0.3], { rotation: [0.15, 0, 0.75], tint: '#b49a64' })
}

/* ───────────── 今日的藍色公路遊船 ───────────── */
export function buildFerry(b, { length = 13, beam = 3.6 } = {}) {
  const hull = new Shape()
  hull.moveTo(-length / 2, 0.2)
  hull.lineTo(length / 2 - 2.2, 0.2)
  hull.quadraticCurveTo(length / 2 - 0.4, 0.4, length / 2, 1.6)
  hull.lineTo(-length / 2, 1.6)
  hull.closePath()
  b.extrude('plain', hull, beam, { position: [0, 0, -beam / 2], tint: '#f2f1ec' })
  for (const s of [-1, 1]) {
    b.box('plain', [length - 1.6, 0.22, 0.04], [-0.6, 1.1, s * (beam / 2 + 0.02)], { tint: '#2f5d7c' })
  }
  b.box('planks', [length - 1.2, 0.08, beam - 0.2], [-0.4, 1.62, 0], { tint: '#c9b48e' })
  // 船艙與窗
  b.box('plain', [length * 0.5, 1.5, beam - 0.6], [-length * 0.12, 2.4, 0], { tint: '#f6f5f0' })
  b.box('plain', [length * 0.52, 0.12, beam - 0.4], [-length * 0.12, 3.2, 0], { tint: '#2f5d7c' })
  for (const s of [-1, 1]) {
    b.box('glass', [length * 0.44, 0.6, 0.04], [-length * 0.12, 2.55, s * ((beam - 0.6) / 2 + 0.02)])
  }
  // 欄杆
  for (const s of [-1, 1]) {
    b.box('plain', [length - 2.4, 0.04, 0.04], [-0.8, 2.3, s * (beam / 2 - 0.08)], { tint: '#3c4a4f' })
    for (let x = -length / 2 + 0.6; x < length / 2 - 2; x += 1.1) {
      b.box('plain', [0.04, 0.68, 0.04], [x, 1.96, s * (beam / 2 - 0.08)], { tint: '#3c4a4f' })
    }
  }
}
