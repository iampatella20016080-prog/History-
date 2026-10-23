import { ConeGeometry, IcosahedronGeometry, SphereGeometry, TorusGeometry } from 'three'
import { CULTURE_SLOTS, EARLY, MODERN, POSTWAR } from '../../../data/shizixuanLayout.js'
import { basket, jar, pastryTray, shade } from '../props.js'
import { createRng } from '../../utils/random.js'
import { PARTY_INSET } from './shizixuanShell.js'
import { fillShelf, pastry, szxPanel } from './shizixuanPastries.js'

/**
 * 十字軒糕餅舖的室內細部（按需載入）。殼體（牆、樓板、天花上方的樓板）在 shizixuanExterior.js，
 * 室內的燈火也在那裡（室內只產生幾何）。
 *
 * - 1930：前舖的帳桌與兩層展示架、後坊的製餅工作檯。
 * - 1945：木製餅櫃（三層）、右牆的紙盒竹籮櫥櫃。
 * - 2000（依實拍照片）：米白天花與兩塊凹進的方格木天花、嵌燈；櫃台後的深色石材牆與深木多格展示（獎狀、老電話、擺件）；
 *   靠窗的長型展示架與黃銅吊燈、中央展示島（鏡面柱）、右牆與後牆的商品層架（價卡）、後牆上方的歷史金屬展板、
 *   櫃台（收銀機、包裝區）與前方的玻璃展示櫃（黃色、紅色托盤上的金元寶與壽桃）；深灰人字拼地磚。
 * 五個文化節點（滿月、收涎、婚嫁、祝壽、祭祀）的擺件在 1930／1945 的展示架上、2000 的「生命禮俗」展台上。
 */

/* ═══════════ 五個文化節點的擺件 ═══════════ */

/** 紅圓（滿月）：一疊扁圓的紅色糯米糰，疊在小木盤上 */
function manYue(b, position) {
  b.group(position, 0, () => {
    b.cylinder('wood', 0.16, 0.16, 0.02, 14, [0, 0.01, 0], { tint: '#8c6446' })
    for (let i = 0; i < 3; i++) b.cylinder('plain', 0.055, 0.06, 0.03, 12, [(i - 1) * 0.1, 0.035, 0], { tint: i % 2 ? '#c4473a' : '#cf5a45' })
  })
}

/** 收涎（鹹光餅）：紅絲線串起的小圓餅，掛在小木架上 */
function shouYan(b, position) {
  b.group(position, 0, () => {
    b.box('wood', [0.2, 0.02, 0.12], [0, 0.01, 0], { tint: '#6a4a30' })
    b.cylinder('wood', 0.01, 0.01, 0.42, 4, [0, 0.23, 0], { tint: '#5a3c26' })
    b.box('wood', [0.28, 0.02, 0.02], [0, 0.45, 0], { tint: '#6a4a30' })
    for (let i = 0; i < 4; i++) {
      const y = 0.38 - i * 0.075
      b.cylinder('plain', 0.004, 0.004, 0.05, 4, [0.1, y + 0.035, 0], { tint: '#b3291d' })
      b.cylinder('plain', 0.045, 0.048, 0.018, 10, [0.1, y, 0], { rotation: [Math.PI / 2, 0, 0], tint: '#e0c48a' })
    }
  })
}

/** 婚嫁（喜餅）：兩個紅色禮盒，繫著金色緞帶 */
function hunJia(b, position) {
  b.group(position, 0, () => {
    b.box('cloth', [0.26, 0.1, 0.26], [0, 0.05, 0], { tint: '#b3291d' })
    // 緞帶比盒面高出幾公釐、兩條緞帶的高度錯開（交叉處不共面）
    b.box('plain', [0.27, 0.019, 0.03], [0, 0.0945, 0], { tint: '#d9b46a' })
    b.box('plain', [0.03, 0.028, 0.27], [0, 0.094, 0], { tint: '#d9b46a' })
    b.box('cloth', [0.2, 0.09, 0.2], [0.03, 0.145, 0.02], { tint: '#9d2a28' })
    b.box('plain', [0.21, 0.022, 0.025], [0.03, 0.183, 0.02], { tint: '#d9b46a' })
  })
}

/** 祝壽（壽桃）：三顆桃形的粉色麵食，疊在小木盤上 */
function zhuShou(b, position) {
  b.group(position, 0, () => {
    b.cylinder('wood', 0.17, 0.17, 0.02, 14, [0, 0.01, 0], { tint: '#8c6446' })
    for (const [x, z] of [
      [0, 0.07],
      [-0.08, -0.05],
      [0.08, -0.05],
    ]) {
      b.add('plain', new SphereGeometry(1, 10, 8), { position: [x, 0.065, z], scale: [0.055, 0.045, 0.055], tint: '#f0b0b0' })
      b.add('plain', new ConeGeometry(0.025, 0.035, 8), { position: [x, 0.12, z], tint: '#eaa0a2' })
    }
  })
}

/** 祭祀（紅龜粿）：木盤上三塊印著龜甲紋的紅龜粿 */
function jiSi(b, position) {
  b.group(position, 0, () => {
    b.cylinder('wood', 0.17, 0.17, 0.02, 14, [0, 0.01, 0], { tint: '#8c6446' })
    for (const [x, z, r] of [
      [-0.07, 0.04, 0.3],
      [0.07, 0.04, -0.2],
      [0, -0.07, 0.1],
    ]) {
      b.add('plain', new IcosahedronGeometry(1, 1), { position: [x, 0.04, z], rotation: [0, r, 0], scale: [0.065, 0.022, 0.048], tint: '#c4372e' })
      b.box('plain', [0.05, 0.003, 0.003], [x, 0.0635, z], { rotation: [0, r, 0], tint: '#9a2a22' })
    }
  })
}

const CULTURE_BUILDERS = [manYue, shouYan, hunJia, zhuShou, jiSi]

/** 同時轉換主網格與細部網格的座標（細部網格有自己的座標堆疊） */
function both(b, detail, position, rotationY, fn) {
  b.push(position, rotationY)
  if (detail !== b) detail.push(position, rotationY)
  fn()
  if (detail !== b) detail.pop()
  b.pop()
}

function placeCultureSlots(b, variant, y) {
  CULTURE_SLOTS[variant].forEach(([x, z], i) => {
    const builder = CULTURE_BUILDERS[i]
    builder(b, [x, y, z])
  })
}

/* ═══════════ 1930–1945：十字軒（糕餅店初創） ═══════════ */

function earlyInterior(b) {
  const { counter, shelf, workbench } = EARLY
  // 帳桌：算盤、帳本與秤
  b.box('wood', [counter.maxX - counter.minX, counter.height, counter.maxZ - counter.minZ], [(counter.minX + counter.maxX) / 2, counter.height / 2, (counter.minZ + counter.maxZ) / 2], { tint: '#6a4a30' })
  b.box('wood', [0.3, 0.02, 0.2], [counter.minX + 0.3, counter.height + 0.01, (counter.minZ + counter.maxZ) / 2], { tint: '#4a3320' })
  // 兩層展示架：下層是早期的西點麵包與漢餅，上層是五個文化節點的擺件
  const cx = (shelf.minX + shelf.maxX) / 2
  const cz = (shelf.minZ + shelf.maxZ) / 2
  for (const y of [0.8, shelf.height]) b.box('wood', [shelf.maxX - shelf.minX, 0.04, shelf.maxZ - shelf.minZ], [cx, y - 0.02, cz], { tint: '#5a3c26' })
  for (const [i, z] of [-1.2, 0, 1.2].entries()) b.group([cx, 0.8, cz + z], Math.PI / 2, () => pastryTray(b, [0, 0, 0], { seed: 11 + i, kind: i === 1 ? 'turtle' : 'round' }))
  for (const lx of [shelf.minX + 0.03, shelf.maxX - 0.03]) for (const lz of [shelf.minZ + 0.03, shelf.maxZ - 0.03]) b.box('wood', [0.04, shelf.height - 0.02, 0.04], [lx, (shelf.height - 0.02) / 2, lz], { tint: '#4a3320' })
  // 後坊：工作檯、揉麵盆與桿麵棍
  b.box('wood', [workbench.maxX - workbench.minX, workbench.height, workbench.maxZ - workbench.minZ], [0, workbench.height / 2, (workbench.minZ + workbench.maxZ) / 2], { tint: shade('#6a4a30', 0.9) })
  b.cylinder('plain', 0.18, 0.2, 0.08, 14, [-0.6, workbench.height + 0.04, (workbench.minZ + workbench.maxZ) / 2], { tint: '#e8dcc2' })
  b.cylinder('wood', 0.025, 0.025, 0.5, 10, [0.5, workbench.height + 0.025, (workbench.minZ + workbench.maxZ) / 2], { rotation: [0, 0, Math.PI / 2], tint: '#caa876' })
  basket(b, [0.9, workbench.height, workbench.minZ + 0.35], { radius: 0.26, depth: 0.12, content: 'flour', seed: 15 })
  placeCultureSlots(b, 'earlyShop', shelf.height)
}

/* ═══════════ 1945–1980：十字軒餅舖（戰後） ═══════════ */

function postwarInterior(b) {
  const { counter, shelf, cabinet } = POSTWAR
  b.box('wood', [counter.maxX - counter.minX, counter.height, counter.maxZ - counter.minZ], [(counter.minX + counter.maxX) / 2, counter.height / 2, (counter.minZ + counter.maxZ) / 2], { tint: '#6a4a30' })
  b.box('wood', [0.3, 0.02, 0.2], [counter.minX + 0.3, counter.height + 0.01, (counter.minZ + counter.maxZ) / 2], { tint: '#4a3320' })
  // 木製餅櫃：三層架，陳列漢餅、壽桃與紅龜（紙盒與竹籮，不用壓克力）；最上層是五個文化節點
  const levels = [0.4, 0.85, 1.3]
  const cx = (shelf.minX + shelf.maxX) / 2
  const cz = (shelf.minZ + shelf.maxZ) / 2
  for (const y of levels) b.box('wood', [shelf.maxX - shelf.minX, 0.04, shelf.maxZ - shelf.minZ], [cx, y - 0.02, cz], { tint: '#5a3c26' })
  for (const lx of [shelf.minX + 0.03, shelf.maxX - 0.03]) for (const lz of [shelf.minZ + 0.03, shelf.maxZ - 0.03]) b.box('wood', [0.04, levels[2] - 0.02, 0.04], [lx, (levels[2] - 0.02) / 2, lz], { tint: '#4a3320' })
  levels.slice(0, 2).forEach((y, i) => {
    for (const dz of [-1.3, 0, 1.3]) b.group([cx, y, cz + dz], Math.PI / 2, () => pastryTray(b, [0, 0, 0], { seed: 20 + i * 3 + Math.round(dz * 10), kind: i ? 'turtle' : 'round' }))
  })
  // 右牆的櫥櫃：紙盒、竹籮與陶甕
  b.box('wood', [cabinet.maxX - cabinet.minX, cabinet.height, cabinet.maxZ - cabinet.minZ], [(cabinet.minX + cabinet.maxX) / 2, cabinet.height / 2, (cabinet.minZ + cabinet.maxZ) / 2], { tint: '#5a3c26' })
  for (let i = 0; i < 3; i++) b.box('plain', [0.3, 0.2, 0.3], [cabinet.minX + 0.3 + i * 0.45, cabinet.height + 0.1, cabinet.minZ + 0.3], { tint: i % 2 ? '#f1e8d3' : '#e6dbc2' })
  basket(b, [cabinet.maxX - 0.3, cabinet.height, cabinet.maxZ - 0.3], { radius: 0.3, depth: 0.16, content: 'pastry', seed: 23 })
  jar(b, [cabinet.maxX - 0.35, cabinet.height, (cabinet.minZ + cabinet.maxZ) / 2], { scale: 0.7, tint: '#6e4a34' })
  placeCultureSlots(b, 'postwarShop', levels[2])
}

/* ═══════════ 2000–現在：十字軒糕餅舖（依實拍照片） ═══════════ */

const WALL = MODERN.half - PARTY_INSET - MODERN.wallT // 室內牆面
const BACK = -MODERN.depth + MODERN.wallT
const CEIL = MODERN.ceiling
const RECESSES = [
  { minX: -0.9, maxX: 1.9, minZ: -5.6, maxZ: -2.4 },
  { minX: -1.2, maxX: 3.8, minZ: -8.6, maxZ: -6.4 },
]
const DARK_WOOD = '#3a2b22'
const MID_WOOD = '#8a6440'
const BLACK = '#1e1c1b'

/** 米白天花（扣掉兩塊凹槽）；凹槽裡是方格木天花與四周的白色側板、燈帶 */
function ceiling(b, detail) {
  const xs = [...new Set([-WALL, WALL, ...RECESSES.flatMap((r) => [r.minX, r.maxX])])].sort((a, c) => a - c)
  const zs = [...new Set([BACK, -MODERN.wallT, ...RECESSES.flatMap((r) => [r.minZ, r.maxZ])])].sort((a, c) => a - c)
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < zs.length - 1; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2
      const cz = (zs[j] + zs[j + 1]) / 2
      if (RECESSES.some((r) => cx > r.minX && cx < r.maxX && cz > r.minZ && cz < r.maxZ)) continue
      b.box('plaster', [xs[i + 1] - xs[i], 0.03, zs[j + 1] - zs[j]], [cx, CEIL + 0.015, cz], { tint: '#f3efe6' })
    }
  }
  const depth = 0.16
  for (const r of RECESSES) {
    const w = r.maxX - r.minX
    const d = r.maxZ - r.minZ
    const cx = (r.minX + r.maxX) / 2
    const cz = (r.minZ + r.maxZ) / 2
    // 四周的側板（把天花與木天花之間封起來）
    b.box('plaster', [w, depth, 0.03], [cx, CEIL + 0.03 + depth / 2, r.maxZ - 0.015], { tint: '#f3efe6' })
    b.box('plaster', [w, depth, 0.03], [cx, CEIL + 0.03 + depth / 2, r.minZ + 0.015], { tint: '#f3efe6' })
    b.box('plaster', [0.03, depth, d - 0.06], [r.minX + 0.015, CEIL + 0.03 + depth / 2, cz], { tint: '#f3efe6' })
    b.box('plaster', [0.03, depth, d - 0.06], [r.maxX - 0.015, CEIL + 0.03 + depth / 2, cz], { tint: '#f3efe6' })
    // 方格木天花與格線
    const y = CEIL + 0.03 + depth
    b.box('woodLight', [w - 0.06, 0.03, d - 0.06], [cx, y + 0.015, cz], { tint: '#d7a874' })
    const nx = Math.round(w / 0.7)
    const nz = Math.round(d / 0.7)
    for (let i = 1; i < nx; i++) b.box('wood', [0.025, 0.012, d - 0.06], [r.minX + (w * i) / nx, y - 0.006, cz], { tint: '#9a6a3e' })
    for (let j = 1; j < nz; j++) detail.box('wood', [w - 0.06, 0.004, 0.025], [cx, y - 0.005, r.minZ + (d * j) / nz], { tint: '#9a6a3e' })
    // 凹槽邊緣的燈帶（間接照明）
    b.box('bulb', [w - 0.1, 0.012, 0.02], [cx, CEIL + 0.045, r.maxZ - 0.04], { tint: '#fff2d8' })
    b.box('bulb', [w - 0.1, 0.012, 0.02], [cx, CEIL + 0.045, r.minZ + 0.04], { tint: '#fff2d8' })
  }
  // 嵌燈：白色圓環與燈面（在凹槽裡的裝在木天花上）
  for (const x of [-3, -1, 1, 3]) {
    for (const z of [-1.6, -3.6, -5.6, -7.6]) {
      const inRecess = RECESSES.some((r) => x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ)
      const y = inRecess ? CEIL + 0.03 + depth - 0.01 : CEIL - 0.005
      b.add('plain', new TorusGeometry(0.075, 0.014, 6, 16), { position: [x, y, z], rotation: [Math.PI / 2, 0, 0], tint: '#f5f3ee' })
      b.cylinder('bulb', 0.06, 0.06, 0.008, 14, [x, y + 0.002, z], { tint: '#fff6e0' })
    }
  }
  // 空調出風口
  szxPanel(b, 'vent', 0.9, 0.36, [-3.0, CEIL - 0.004, -3.0], { rotation: [Math.PI / 2, 0, 0] })
  szxPanel(b, 'vent', 0.9, 0.36, [2.6, CEIL - 0.004, -1.2], { rotation: [Math.PI / 2, 0, 0] })
}

/** 牆面：米白的內牆、櫃台後方左牆的深灰褐不規則石材 */
function walls(b, detail) {
  const lining = '#efe9dd'
  const h = CEIL - 0.03
  b.box('plaster', [0.02, h, 4.35], [-WALL + 0.022, 0.03 + h / 2, -0.25 - 4.35 / 2], { tint: lining })
  b.box('plaster', [0.02, h, -BACK - 0.3], [WALL - 0.022, 0.03 + h / 2, (BACK - 0.25) / 2], { tint: lining })
  b.box('plaster', [WALL * 2 - 0.1, h, 0.02], [0, 0.03 + h / 2, BACK + 0.022], { tint: lining })
  // 石材牆（z −4.6 到後牆）：一列一列的石塊，深淺、大小與凸出都不同
  const rng = createRng(68)
  let y = 0.03
  let row = 0
  while (y < CEIL - 0.01) {
    const h = Math.min(0.22 + rng() * 0.16, CEIL - y)
    let z = -4.6
    while (z > BACK + 0.05) {
      const w = Math.min(0.3 + rng() * 0.35, z - BACK - 0.04)
      const proud = 0.03 + rng() * 0.06 + (row % 2) * 0.004
      const tint = shade(rng() < 0.5 ? '#5f554c' : '#73675a', 0.85 + rng() * 0.3)
      ;(rng() < 0.85 ? b : detail).box('stone', [proud, h - 0.012, w - 0.012], [-WALL + 0.012 + proud / 2, y + h / 2, z - w / 2], { tint })
      z -= w
    }
    y += h
    row++
  }
}

/** 深灰人字拼地磚（細部網格，精緻模式才顯示）：(u, v) 是轉 45° 的座標，橫磚與直磚交錯 */
function herringbone(detail, skip) {
  const W = 0.21
  const s = Math.SQRT1_2
  const toXZ = (u, v) => [(u - v) * s, (u + v) * s]
  const inRoom = (x, z) => x > -WALL + 0.15 && x < WALL - 0.15 && z < -0.35 && z > BACK + 0.15 && !skip.some((r) => x > r.minX - 0.05 && x < r.maxX + 0.05 && z > r.minZ - 0.05 && z < r.maxZ + 0.05)
  const rng = createRng(1930)
  const tile = (u0, v0, du, dv, high) => {
    const [x, z] = toXZ(u0 + du / 2, v0 + dv / 2)
    if (!inRoom(x, z)) return
    const tint = shade('#4a4a4c', 0.85 + rng() * 0.3)
    detail.box('glossTile', [du - 0.014, 0.004, dv - 0.014], [x, high ? 0.033 : 0.032, z], { rotation: [0, -Math.PI / 4, 0], tint })
  }
  for (let n = -40; n <= 40; n++) {
    for (let k = -40; k <= 40; k++) {
      const u = (k + 2 * n) * W
      const v = (k - 2 * n) * W
      tile(u, v, 2 * W, W, false)
      tile(u + 2 * W, v - W, W, 2 * W, true)
    }
  }
}

/** 有門板、把手與踢腳的木櫃（底部封閉） */
function cabinet(b, { minX, maxX, minZ, maxZ, height, tint, front = 'z', top = BLACK }) {
  const w = maxX - minX
  const d = maxZ - minZ
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  b.box('wood', [w - 0.04, 0.08, d - 0.04], [cx, 0.04, cz], { tint: shade(tint, 0.6) })
  b.box('wood', [w, height - 0.12, d], [cx, 0.08 + (height - 0.12) / 2, cz], { tint })
  b.box('stone', [w + 0.03, 0.04, d + 0.03], [cx, height - 0.02, cz], { tint: top })
  // 門板與把手（正面朝 +z 或 +x）
  const n = Math.max(1, Math.round((front === 'z' ? w : d) / 0.6))
  for (let i = 0; i < n; i++) {
    if (front === 'z') {
      const x = minX + (w * (i + 0.5)) / n
      b.box('wood', [w / n - 0.05, height - 0.26, 0.015], [x, 0.08 + (height - 0.12) / 2, maxZ + 0.0075], { tint: shade(tint, 1.08) })
      b.box('steel', [0.1, 0.015, 0.02], [x, height - 0.2, maxZ + 0.025], { tint: '#b8a06a' })
    } else {
      const z = minZ + (d * (i + 0.5)) / n
      b.box('wood', [0.015, height - 0.26, d / n - 0.05], [maxX + 0.0075, 0.08 + (height - 0.12) / 2, z], { tint: shade(tint, 1.08) })
      b.box('steel', [0.02, 0.015, 0.1], [maxX + 0.025, height - 0.2, z], { tint: '#b8a06a' })
    }
  }
}

/** 層架（沿著 x；用 group 轉向）：深木框、層板、層板前緣的價卡與燈帶，層板上排滿商品 */
function shelfUnit(b, detail, { length, depth, height, levels, kinds, seed, tint = DARK_WOOD, baseLevel = false }) {
  // 原點在層架左下角、背板那一側；+z 朝前
  for (const x of [0.015, length - 0.015]) b.box('wood', [0.03, height, depth], [x, height / 2, depth / 2], { tint })
  b.box('wood', [length - 0.06, height, 0.02], [length / 2, height / 2, 0.01], { tint: shade(tint, 0.85) })
  b.box('wood', [length - 0.06, 0.03, depth - 0.02], [length / 2, height - 0.015, depth / 2 + 0.01], { tint })
  let count = 0
  levels.forEach((y, i) => {
    // 最下層放在櫃子的檯面上（baseLevel）：不另外加層板
    if (!(baseLevel && i === 0)) {
      b.box('wood', [length - 0.06, 0.025, depth - 0.02], [length / 2, y - 0.0125, depth / 2 + 0.01], { tint })
      b.box('bulb', [length - 0.1, 0.006, 0.012], [length / 2, y - 0.03, depth - 0.03], { tint: '#fff2d8' })
    }
    const tags = Math.max(1, Math.floor(length / 0.6))
    for (let t = 0; t < tags; t++) szxPanel(b, 'priceTags', 0.09, 0.03, [0.3 + t * 0.6, y - 0.012, depth + 0.002], { sub: [(seed + i + t) % 8, 8] })
    const maxH = (levels[i + 1] ?? height) - y - 0.05
    count += fillShelf(b, detail, { x0: 0.05, x1: length - 0.05, y, z: depth / 2 + 0.02, depth: depth - 0.08, kinds, seed: seed + i * 7, maxHeight: maxH })
  })
  return count
}

/** 黃銅吊燈：從天花垂下的吊線、錐形燈罩與燈泡 */
function pendant(b, x, z, drop) {
  b.cylinder('dark', 0.004, 0.004, drop, 4, [x, CEIL - drop / 2, z], { tint: '#1d1b1a' })
  b.cylinder('steel', 0.03, 0.18, 0.2, 16, [x, CEIL - drop - 0.1, z], { tint: '#b58a3c', openEnded: true })
  b.cylinder('steel', 0.035, 0.035, 0.05, 10, [x, CEIL - drop + 0.02, z], { tint: '#8a6a2e' })
  b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, CEIL - drop - 0.17, z], tint: '#fff0c8' })
}

/** 有深木框的獎狀（立在層架上或掛在牆上） */
function certificate(b, name, w, h, [x, y, z], rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [w + 0.06, h + 0.06, 0.025], [0, 0, 0], { tint: '#3a2418' })
    szxPanel(b, name, w, h, [0, 0, 0.0135])
  })
}

/** 撥盤式的老電話 */
function oldPhone(b, [x, y, z], rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [0.2, 0.08, 0.22], [0, 0.04, 0], { tint: '#1c1b1b' })
    b.box('plain', [0.16, 0.04, 0.14], [0, 0.1, -0.02], { tint: '#222120' })
    b.add('plain', new TorusGeometry(0.045, 0.012, 6, 16), { position: [0, 0.1, 0.06], rotation: [-1.1, 0, 0], tint: '#3a3a3a' })
    b.cylinder('plain', 0.02, 0.02, 0.22, 8, [0, 0.14, -0.02], { rotation: [0, 0, Math.PI / 2], tint: '#1c1b1b' })
    for (const s of [-1, 1]) b.add('plain', new SphereGeometry(1, 8, 6), { position: [s * 0.11, 0.14, -0.02], scale: [0.03, 0.035, 0.04], tint: '#1c1b1b' })
  })
}

/** 小型擺件：福祿壽與招財貓的簡化雕像、木箱、玻璃盒、鐵壺 */
function figurine(b, [x, y, z], tint, size = 1) {
  b.cylinder('plain', 0.05 * size, 0.06 * size, 0.16 * size, 10, [x, y + 0.08 * size, z], { tint })
  b.add('plain', new SphereGeometry(1, 10, 8), { position: [x, y + 0.2 * size, z], scale: [0.042 * size, 0.045 * size, 0.042 * size], tint: '#f0dcc0' })
  b.cylinder('plain', 0.03 * size, 0.04 * size, 0.04 * size, 8, [x, y + 0.26 * size, z], { tint: shade(tint, 0.7) })
}

function woodBox(b, [x, y, z]) {
  b.box('wood', [0.3, 0.2, 0.2], [x, y + 0.1, z], { tint: '#6a3a24' })
  b.box('wood', [0.31, 0.03, 0.21], [x, y + 0.215, z], { tint: '#5a301e' })
  b.box('steel', [0.05, 0.06, 0.012], [x, y + 0.14, z + 0.106], { tint: '#c9a24a' })
}

function glassBox(b, [x, y, z]) {
  b.box('wood', [0.28, 0.03, 0.22], [x, y + 0.015, z], { tint: BLACK })
  b.box('glassClear', [0.26, 0.26, 0.2], [x, y + 0.16, z], { tint: '#ffffff' })
  figurine(b, [x, y + 0.03, z], '#b83a2e', 0.8)
}

function kettle(b, [x, y, z]) {
  b.add('plain', new SphereGeometry(1, 12, 8), { position: [x, y + 0.08, z], scale: [0.09, 0.08, 0.09], tint: '#2a2826' })
  b.cylinder('plain', 0.012, 0.02, 0.1, 6, [x + 0.09, y + 0.1, z], { rotation: [0, 0, -0.8], tint: '#2a2826' })
  b.add('plain', new TorusGeometry(0.05, 0.008, 6, 12, Math.PI), { position: [x, y + 0.15, z], tint: '#2a2826' })
}

/** 收銀機與刷卡機 */
function register(b, [x, y, z], rotationY) {
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [0.36, 0.1, 0.34], [0, 0.05, 0], { tint: '#d8d6d0' })
    b.box('plain', [0.32, 0.03, 0.14], [0, 0.115, 0.07], { tint: '#3a3a3a' })
    b.box('plain', [0.04, 0.2, 0.04], [0, 0.2, -0.1], { tint: '#2a2a2a' })
    b.box('plain', [0.3, 0.2, 0.02], [0, 0.33, -0.09], { rotation: [-0.3, 0, 0], tint: '#1a1a1a' })
    b.box('windowLit', [0.27, 0.17, 0.004], [0, 0.33, -0.077], { rotation: [-0.3, 0, 0], tint: '#9ec4d8' })
    b.box('plain', [0.08, 0.03, 0.15], [0.3, 0.015, 0.05], { tint: '#222' })
    b.box('plain', [0.06, 0.02, 0.04], [0.3, 0.04, 0.0], { tint: '#3a3a3a' })
  })
}

function modernInterior(b, detail) {
  const M = MODERN
  ceiling(b, detail)
  walls(b, detail)
  herringbone(detail, [M.windowCounter, M.island, M.rightShelf, M.counter, M.glassCase, M.certShelf, M.productWall, M.ritualStand])

  // 靠窗的長型展示架：木質底座、黑色檯面、兩層階梯木架，上方四盞黃銅吊燈
  const wc = M.windowCounter
  cabinet(b, { ...wc, height: 0.78, tint: '#a8835a' })
  b.box('wood', [wc.maxX - wc.minX - 0.1, 0.16, 0.3], [(wc.minX + wc.maxX) / 2, 0.86, wc.minZ + 0.2], { tint: '#9a7650' })
  b.box('wood', [wc.maxX - wc.minX - 0.1, 0.16, 0.15], [(wc.minX + wc.maxX) / 2, 1.02, wc.minZ + 0.125], { tint: '#9a7650' })
  fillShelf(b, detail, { x0: wc.minX + 0.08, x1: wc.maxX - 0.08, y: 0.78, z: wc.maxZ - 0.14, depth: 0.24, kinds: ['bag', 'roundCake', 'riceCracker', 'longCake', 'bag'], seed: 3 })
  fillShelf(b, detail, { x0: wc.minX + 0.1, x1: wc.maxX - 0.1, y: 0.94, z: wc.minZ + 0.28, depth: 0.12, kinds: ['pineapple', 'mungBean', 'roundCake'], seed: 4 })
  fillShelf(b, detail, { x0: wc.minX + 0.1, x1: wc.maxX - 0.1, y: 1.1, z: wc.minZ + 0.125, depth: 0.12, kinds: ['tin', 'mungBean', 'pineapple'], seed: 5, maxHeight: 0.2 })
  for (const x of [-3.6, -2.7, -1.8, -0.9]) pendant(b, x, -0.7, 1.0)

  // 中央展示島：木櫃體、黑色檯面、鏡面柱（掛著壽桃吉祥物立牌），檯面上是托盤、禮盒與袋裝糕點
  const is = M.island
  cabinet(b, { ...is, height: 0.9, tint: MID_WOOD })
  const colX = 0.5
  const colZ = -4.0
  b.box('wood', [0.36, CEIL - 0.9, 0.36], [colX, 0.9 + (CEIL - 0.9) / 2, colZ], { tint: DARK_WOOD })
  for (const [dx, dz, ry] of [
    [0, 0.181, 0],
    [0, -0.181, Math.PI],
    [0.181, 0, Math.PI / 2],
    [-0.181, 0, -Math.PI / 2],
  ]) b.group([colX + dx, 0.9, colZ + dz], ry, () => b.box('steel', [0.3, CEIL - 1.1, 0.008], [0, (CEIL - 0.9) / 2, 0.004], { tint: '#d6dde0' }))
  szxPanel(b, 'mascot', 0.42, 0.42, [colX, 2.25, colZ + 0.196])
  fillShelf(b, detail, { x0: is.minX + 0.08, x1: is.maxX - 0.08, y: 0.9, z: is.maxZ - 0.26, depth: 0.42, kinds: ['tray', 'giftBox', 'bag', 'tray'], seed: 7, maxHeight: 0.12 })
  fillShelf(b, detail, { x0: is.minX + 0.08, x1: is.maxX - 0.08, y: 0.9, z: is.minZ + 0.26, depth: 0.42, kinds: ['weddingBox', 'riceCracker', 'giftBox', 'smallPile'], seed: 8, maxHeight: 0.12 })
  fillShelf(b, detail, { x0: is.minX + 0.08, x1: colX - 0.22, y: 0.9, z: colZ, depth: 0.5, kinds: ['bag', 'longCake', 'smallPile'], seed: 9, maxHeight: 0.12 })
  fillShelf(b, detail, { x0: colX + 0.22, x1: is.maxX - 0.08, y: 0.9, z: colZ, depth: 0.5, kinds: ['roundCake', 'mungBean', 'pineapple'], seed: 10, maxHeight: 0.12 })
  for (const [x, z] of [
    [is.minX + 0.2, is.maxZ + 0.02],
    [is.maxX - 0.3, is.maxZ + 0.02],
  ]) szxPanel(b, 'priceTags', 0.12, 0.04, [x, 0.82, z + 0.005], { sub: [Math.round(x * 3 + 8) % 8, 8] })

  // 右牆的商品層架（長 6.8 m，5 層、下層是封閉櫃門）
  const rs = M.rightShelf
  both(b, detail, [rs.maxX, 0, rs.minZ], -Math.PI / 2, () => {
    cabinet(b, { minX: 0.03, maxX: rs.maxZ - rs.minZ - 0.03, minZ: 0.02, maxZ: rs.maxX - rs.minX - 0.04, height: 0.4, tint: DARK_WOOD })
    shelfUnit(b, detail, { length: rs.maxZ - rs.minZ, depth: rs.maxX - rs.minX, height: rs.height, levels: [0.4, 0.78, 1.16, 1.54, 1.92], baseLevel: true, kinds: ['tin', 'bag', 'giftBox', 'pineapple', 'roundCake', 'weddingBox', 'riceCracker', 'mungBean', 'longCake'], seed: 21 })
  })

  // 後牆的商品牆（下層封閉櫃門）與上方的六塊歷史金屬展板
  const pw = M.productWall
  both(b, detail, [pw.minX, 0, pw.minZ], 0, () => {
    cabinet(b, { minX: 0.03, maxX: pw.maxX - pw.minX - 0.03, minZ: 0.02, maxZ: pw.maxZ - pw.minZ - 0.04, height: 0.85, tint: DARK_WOOD })
    shelfUnit(b, detail, { length: pw.maxX - pw.minX, depth: pw.maxZ - pw.minZ, height: pw.height, levels: [0.85, 1.25, 1.65], baseLevel: true, kinds: ['tin', 'giftBox', 'bag', 'weddingBox', 'pineapple', 'riceCracker', 'tray'], seed: 31 })
  })
  const panels = ['panelMuseum', 'panel1930', 'panelDecade', 'panelTenCake', 'panelRitual', 'panelRitual2']
  panels.forEach((name, i) => {
    const x = pw.minX + 0.45 + i * 0.92
    b.box('steel', [0.6, 0.82, 0.02], [x, 2.58, BACK + 0.042], { tint: '#8c9196' })
    szxPanel(b, name, 0.54, 0.76, [x, 2.58, BACK + 0.054])
  })

  // 生命禮俗展台（五個文化節點）
  const st = M.ritualStand
  cabinet(b, { ...st, height: st.height, tint: MID_WOOD })
  for (const [x] of CULTURE_SLOTS.modernShop) b.box('steel', [0.2, 0.05, 0.006], [x, 0.7, st.maxZ + 0.02], { tint: '#c9a24a' })
  placeCultureSlots(b, 'modernShop', st.height)

  // 櫃台：深色木櫃、黑色石材檯面、收銀機、包裝區（紙袋、緞帶捲）、立著的獎狀
  const ct = M.counter
  b.group([ct.minX, 0, ct.maxZ], Math.PI / 2, () => cabinet(b, { minX: 0, maxX: ct.maxZ - ct.minZ, minZ: 0, maxZ: ct.maxX - ct.minX, height: ct.height, tint: DARK_WOOD }))
  register(b, [-2.75, ct.height, -6.2], Math.PI / 2)
  for (let i = 0; i < 4; i++) b.box('plain', [0.22, 0.32, 0.12], [-2.9, ct.height + 0.16, -7.5 - i * 0.14], { tint: i % 2 ? '#f4f0e8' : '#e9e2d4' })
  b.cylinder('plain', 0.06, 0.06, 0.05, 14, [-2.6, ct.height + 0.025, -8.25], { tint: '#c3242b' })
  certificate(b, 'certA', 0.3, 0.22, [-2.55, ct.height + 0.15, -6.9], Math.PI / 2 - 0.2)
  pastry(b, detail, 'tray', [-2.55, ct.height, -7.2], 51)

  // 櫃台前的玻璃展示櫃：深色櫃座、玻璃、金屬邊框；裡面與上面排著黃色、紅色托盤（金元寶與壽桃）
  const gc = M.glassCase
  const gw = gc.maxX - gc.minX
  const gd = gc.maxZ - gc.minZ
  const gx = (gc.minX + gc.maxX) / 2
  const gz = (gc.minZ + gc.maxZ) / 2
  b.box('wood', [gw, 0.55, gd], [gx, 0.275, gz], { tint: BLACK })
  b.box('glassClear', [gw - 0.04, 0.42, gd - 0.04], [gx, 0.59 + 0.21, gz], { tint: '#ffffff' })
  for (const x of [gc.minX + 0.012, gc.maxX - 0.012]) for (const z of [gc.minZ + 0.012, gc.maxZ - 0.012]) b.box('steel', [0.024, 0.47, 0.024], [x, 0.785, z], { tint: '#b9b4a8' })
  b.box('steel', [gw, 0.02, gd], [gx, 1.03, gz], { tint: '#cfcac0' })
  both(b, detail, [gx, 0.55, gc.maxZ], Math.PI / 2, () => fillShelf(b, detail, { x0: 0.05, x1: gd - 0.05, y: 0, z: 0, depth: gw - 0.1, kinds: ['tray'], seed: 41 }))
  both(b, detail, [gx, 1.04, gc.maxZ], Math.PI / 2, () => fillShelf(b, detail, { x0: 0.05, x1: gd - 0.05, y: 0, z: 0, depth: gw - 0.1, kinds: ['tray'], seed: 42 }))

  // 左牆的深木多格展示（4 欄 × 4 層）：獎狀、老電話、木箱、福祿壽、玻璃盒、鐵壺
  const cs = M.certShelf
  const cols = 4
  const rows = [0, 0.65, 1.3, 1.95, 2.6]
  const len = cs.maxZ - cs.minZ
  // 直隔板在層板之間（不穿過層板）、比層板淺一點（前後面都不共面）
  const dividerH = cs.height - 0.06
  b.box('wood', [0.34, dividerH, 0.03], [(cs.minX + cs.maxX) / 2, 0.03 + dividerH / 2, cs.minZ + 0.015], { tint: DARK_WOOD })
  for (let i = 1; i <= cols; i++) b.box('wood', [0.34, dividerH, 0.03], [(cs.minX + cs.maxX) / 2, 0.03 + dividerH / 2, cs.minZ + (len * i) / cols - 0.015], { tint: DARK_WOOD })
  for (const [i, y] of rows.entries()) {
    const h = i === 0 || i === rows.length - 1 ? 0.03 : 0.025
    b.box('wood', [0.35, h, i === 0 || i === rows.length - 1 ? len : len - 0.06], [(cs.minX + cs.maxX) / 2, i === 0 ? 0.015 : i === rows.length - 1 ? cs.height - 0.015 : y, (cs.minZ + cs.maxZ) / 2], { tint: DARK_WOOD })
  }
  const certs = ['certA', 'certB', 'certC', 'certD']
  const shelfX = cs.maxX - 0.12
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const z = cs.minZ + (len * (c + 0.5)) / cols
      const y = rows[r] + 0.015
      const pick = (r * 3 + c * 5) % 7
      if (pick < 3) {
        const name = certs[(r + c) % 4]
        const portrait = name === 'certC' || name === 'certD'
        certificate(b, name, portrait ? 0.3 : 0.42, portrait ? 0.42 : 0.3, [cs.minX + 0.12, y + 0.26, z], Math.PI / 2)
      } else if (pick === 3) oldPhone(b, [shelfX, y, z], Math.PI / 2)
      else if (pick === 4) {
        figurine(b, [shelfX, y, z - 0.18], '#c9a24a')
        figurine(b, [shelfX, y, z], '#b83a2e')
        figurine(b, [shelfX, y, z + 0.18], '#2f6a4a')
      } else if (pick === 5) woodBox(b, [shelfX, y, z])
      else if (r % 2) glassBox(b, [shelfX, y, z])
      else kettle(b, [shelfX, y, z])
    }
  }
  // 石材牆上掛的大幅感謝狀與老照片（櫃台上方）
  certificate(b, 'certB', 0.7, 0.5, [-WALL + 0.14, 2.6, -4.95], Math.PI / 2)
  szxPanel(b, 'oldPhoto', 0.5, 0.38, [-3.84, 2.75, -9.0], { rotation: [0, Math.PI / 2, 0] })
}

export function buildShizixuanInterior(b, config = {}, detail = b) {
  const variant = config.variant ?? 'modernShop'
  if (variant === 'earlyShop') return earlyInterior(b)
  if (variant === 'postwarShop') return postwarInterior(b)
  return modernInterior(b, detail)
}
