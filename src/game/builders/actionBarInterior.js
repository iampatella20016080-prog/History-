import { CylinderGeometry, IcosahedronGeometry, LatheGeometry, OctahedronGeometry, TorusGeometry, Vector2 } from 'three'
import { createRng } from '../utils/random.js'
import { directorChair, SHOP } from './actionBar.js'

/**
 * 導演的豆花店的店內細部（按需載入）：木質牆板與深色天花、豆花櫃台與工作區、桌椅、
 * 左牆的影像教育看板與懸掛的手寫留言本、裝框的獎狀、右牆的兒童畫作、攝影機與場記板，以及豆花的 3D 展示。
 * 只產生幾何；看板上的文字、遮擋方塊與碰撞在 actionBar.js（街景資料的一部分）。
 *
 * 看板上的照片、留言、兒童畫作與獎狀都是原創的簡化示意，不複製真實的作品、照片或影展標誌。
 * 座標同 actionBar.js 的店本地座標：原點在騎樓柱列外緣中央，+z 朝巷子，店內在 -z。
 */
const S = SHOP
const IN = S.half - S.wallT - 0.04 // 室內牆面
const FRONT = -S.arcade - S.wallT
const BACK = S.backZ + 0.03
const CEIL = S.ceiling - 0.03

const WOOD_WALL = '#b88656'
const WOOD_LOW = '#946540'
const WOOD_DARK = '#5e3f29'

const dot = (b, material, r, position, tint, scale = [1, 1, 1], detail = 0) =>
  b.add(material, new IcosahedronGeometry(r, detail), { position, scale, tint })

/* ── 豆花（櫃台與展示桌上的 3D 展示） ─────────── */

/** 有厚度的碗：外壁、碗緣、內壁與碗底（旋轉成形） */
const BOWL_PROFILE = [
  [0, 0],
  [0.046, 0],
  [0.052, 0.006],
  [0.074, 0.03],
  [0.088, 0.054],
  [0.084, 0.058],
  [0.078, 0.052],
  [0.044, 0.012],
  [0, 0.012],
].map(([x, y]) => new Vector2(x, y))

function bowl(b, x, y, z, tint = '#f6f5f0', scale = 1) {
  b.add('plain', new LatheGeometry(BOWL_PROFILE, 20), { position: [x, y, z], scale: [scale, scale, scale], tint })
}

/**
 * 一碗豆花：碗、半透明的麥芽糖水、一大匙白色的豆花，再加上配料。
 * 配料像店家傳單上的照片一樣，各自佔碗裡的一塊扇形（不是全部混在一起）：
 * balls（地瓜粉圓，橘色與紫色）、jelly（粉粿，黃色與黑糖色的方塊）、red（紅豆）、green（綠豆）、peanut（花生）
 * 沒有配料時就是一碗傳統的白豆花加麥芽糖水。
 */
function douhuaBowl(b, x, y, z, toppings, seed = 1, scale = 1) {
  const rng = createRng(seed)
  const k = scale
  bowl(b, x, y, z, '#f6f5f0', k)
  // 麥芽糖水（半透明的琥珀色，下面一層深一點的糖色）
  b.cylinder('glassClear', 0.08 * k, 0.074 * k, 0.012 * k, 18, [x, y + 0.047 * k, z], { tint: '#c98a3c' })
  b.cylinder('plain', 0.075 * k, 0.07 * k, 0.004 * k, 18, [x, y + 0.042 * k, z], { tint: '#a8642a' })
  // 白色的豆花：用大湯匙舀起的一大片（扁扁的弧面）
  const plain = toppings.length === 0
  const tofuR = plain ? 0.058 : 0.046
  const tofuAt = plain ? [x, z] : [x - 0.026 * k, z - 0.01 * k]
  dot(b, 'plain', tofuR * k, [tofuAt[0], y + 0.056 * k, tofuAt[1]], '#fbfaf4', [1.15, 0.42, 0.95], 1)
  dot(b, 'plain', tofuR * 0.62 * k, [tofuAt[0] + 0.02 * k, y + 0.068 * k, tofuAt[1] + 0.012 * k], '#f6f3ea', [1.1, 0.34, 0.9], 1)
  // 每一種配料佔一塊扇形（從豆花的另一側開始排）
  const n = toppings.length
  toppings.forEach((kind, i) => {
    const mid = -0.9 + ((i + 0.5) / n) * 2.4 // 扇形的中心角（避開豆花所在的 -x 側）
    const at = () => {
      const a = mid + (rng() - 0.5) * (2.2 / n)
      const r = (0.022 + rng() * 0.036) * k
      return [x + Math.cos(a) * r, z + Math.sin(a) * r]
    }
    const top = y + 0.06 * k
    if (kind === 'balls') {
      // 地瓜粉圓：橘色（紅地瓜）與紫色（紫地瓜）的小圓粒，堆成小小一堆
      for (let j = 0; j < 12; j++) {
        const [px, pz] = at()
        dot(b, 'plain', 0.0085 * k, [px, top + (j % 3) * 0.004 * k, pz], j % 3 === 0 ? '#6f4a97' : '#ec8a2e', [1, 0.95, 1], 0)
      }
    } else if (kind === 'jelly') {
      // 粉粿：黃色（山梔子）與黑糖色的小方塊
      for (let j = 0; j < 6; j++) {
        const [px, pz] = at()
        b.box('plain', [0.02 * k, 0.017 * k, 0.02 * k], [px, top + 0.002 * k, pz], { rotation: [0, rng() * 1.5, 0.1], tint: j % 2 ? '#5b2f1e' : '#eba43a' })
      }
    } else if (kind === 'red' || kind === 'green') {
      // 紅豆、綠豆：一小堆橢圓的豆子（綠豆比紅豆小一點）
      const tint = kind === 'red' ? ['#6b2025', '#80302f'] : ['#7d7b3d', '#93904d']
      const size = kind === 'red' ? 0.0062 : 0.0048
      for (let j = 0; j < 16; j++) {
        const [px, pz] = at()
        b.add('plain', new OctahedronGeometry(size * k), { position: [px, top + (j % 2) * 0.003 * k, pz], rotation: [0, rng() * 3, 0], scale: [1.4, 0.85, 1], tint: tint[j % 2] })
      }
    } else if (kind === 'peanut') {
      // 花生：長一點的淺褐色顆粒
      for (let j = 0; j < 8; j++) {
        const [px, pz] = at()
        b.add('plain', new OctahedronGeometry(0.0075 * k), { position: [px, top, pz], rotation: [0, rng() * 3, 0], scale: [1.7, 0.85, 1], tint: '#d7b178' })
      }
    }
  })
}

/** 一小碟單一配料（展示桌上，讓每一種配料都看得清楚） */
function toppingSaucer(b, x, y, z, kind, seed) {
  const rng = createRng(seed)
  b.cylinder('plain', 0.06, 0.045, 0.018, 16, [x, y + 0.009, z], { tint: '#f4f3ee' })
  b.add('plain', new TorusGeometry(0.056, 0.004, 4, 16), { position: [x, y + 0.018, z], rotation: [Math.PI / 2, 0, 0], tint: '#2c5d9c' })
  for (let j = 0; j < 18; j++) {
    const a = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) * 0.038
    const px = x + Math.cos(a) * r
    const pz = z + Math.sin(a) * r
    const py = y + 0.024 + (0.038 - r) * 0.3
    if (kind === 'balls') dot(b, 'plain', 0.0085, [px, py, pz], j % 3 === 0 ? '#6f4a97' : '#ec8a2e')
    else {
      const tint = kind === 'red' ? ['#6b2025', '#80302f'] : ['#7d7b3d', '#93904d']
      b.add('plain', new OctahedronGeometry(kind === 'red' ? 0.0062 : 0.0048), { position: [px, py, pz], rotation: [0, rng() * 3, 0], scale: [1.4, 0.85, 1], tint: tint[j % 2] })
    }
  }
}

/** 藍白花紋的小碟子（裝粉粿） */
function fenGuoDish(b, x, y, z) {
  b.cylinder('plain', 0.07, 0.055, 0.02, 18, [x, y + 0.01, z], { tint: '#f2f4f6' })
  b.add('plain', new TorusGeometry(0.062, 0.006, 4, 18), { position: [x, y + 0.02, z], rotation: [Math.PI / 2, 0, 0], tint: '#2c5d9c' })
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    b.box('plain', [0.012, 0.004, 0.012], [x + Math.cos(a) * 0.045, y + 0.021, z + Math.sin(a) * 0.045], { tint: '#2c5d9c' })
  }
  // 黃色與黑糖色的粉粿交錯疊放
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      b.box('plain', [0.026, 0.024, 0.026], [x - 0.028 + i * 0.028, y + 0.034, z - 0.028 + j * 0.028], { tint: (i + j) % 2 ? '#5b2f1e' : '#e7a53a' })
    }
  }
  b.box('plain', [0.026, 0.024, 0.026], [x, y + 0.058, z], { tint: '#e7a53a' })
}

/** 配料托盤（不鏽鋼淺盤） */
function toppingTray(b, x, y, z, kind, seed) {
  const rng = createRng(seed)
  b.box('steel', [0.3, 0.012, 0.22], [x, y + 0.006, z], { tint: '#d3d6d7' })
  for (const s of [-1, 1]) {
    b.box('steel', [0.3, 0.04, 0.01], [x, y + 0.02, z + s * 0.11], { tint: '#c4c8c9' })
    b.box('steel', [0.01, 0.04, 0.22], [x + s * 0.15, y + 0.02, z], { tint: '#c4c8c9' })
  }
  const spot = () => [x + (rng() - 0.5) * 0.26, z + (rng() - 0.5) * 0.18]
  if (kind === 'balls' || kind === 'purple') {
    for (let i = 0; i < 20; i++) {
      const [px, pz] = spot()
      dot(b, 'plain', 0.01, [px, y + 0.022 + rng() * 0.01, pz], kind === 'purple' ? '#6f4a97' : '#ec8a2e')
    }
  } else if (kind === 'jelly' || kind === 'dark') {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        b.box('plain', [0.05, 0.03, 0.05], [x - 0.09 + i * 0.06, y + 0.027, z - 0.06 + j * 0.06], { tint: kind === 'dark' ? '#5b2f1e' : '#e7a53a' })
      }
    }
  } else {
    const tints = { red: ['#6b2025', '#80302f'], green: ['#7d7b3d', '#93904d'], peanut: ['#d7b178', '#c99f63'] }[kind]
    for (let i = 0; i < 30; i++) {
      const [px, pz] = spot()
      b.add('plain', new OctahedronGeometry(kind === 'peanut' ? 0.009 : 0.0075), { position: [px, y + 0.02 + rng() * 0.01, pz], rotation: [0, rng() * 3, 0], scale: kind === 'peanut' ? [1.7, 0.85, 1] : [1.4, 0.85, 1], tint: tints[i % 2] })
    }
  }
}

/* ── 室內裝修 ─────────────────────────────── */

function finishes(b) {
  const depth = FRONT - BACK
  const zc = (FRONT + BACK) / 2
  // 木地板
  b.box('planks', [IN * 2, 0.02, depth], [0, 0.05, zc], { tint: '#7c5a3e' })
  // 兩側牆與後牆：下段深色木板、上段木質牆板、腰帶
  for (const s of [-1, 1]) {
    b.box('wood', [0.04, 1.0, depth], [s * IN, 0.5, zc], { tint: WOOD_LOW })
    b.box('planks', [0.04, CEIL - 1.0, depth], [s * IN, (1.0 + CEIL) / 2, zc], { tint: WOOD_WALL })
    b.box('wood', [0.06, 0.06, depth], [s * (IN - 0.01), 1.02, zc], { tint: WOOD_DARK })
  }
  b.box('wood', [IN * 2, 1.0, 0.04], [0, 0.5, BACK], { tint: WOOD_LOW })
  b.box('planks', [IN * 2, CEIL - 1.0, 0.04], [0, (1.0 + CEIL) / 2, BACK], { tint: WOOD_WALL })
  // 前牆內側
  for (const [x0, x1] of [
    [-IN, S.window[0]],
    [S.door[1], IN],
  ]) {
    b.box('planks', [x1 - x0, CEIL, 0.04], [(x0 + x1) / 2, CEIL / 2, FRONT - 0.02], { tint: WOOD_WALL })
  }
  b.box('planks', [IN * 2, CEIL - 2.6, 0.04], [0, (2.6 + CEIL) / 2, FRONT - 0.02], { tint: WOOD_WALL })
  // 深色天花與木樑
  b.box('planks', [IN * 2, 0.04, depth], [0, CEIL, zc], { tint: '#3b2c22' })
  for (let i = 0; i < 4; i++) b.box('wood', [IN * 2, 0.16, 0.12], [0, CEIL - 0.08, FRONT - 0.9 - i * 1.7], { tint: '#2e221b' })
  // 吊燈（暖色的燈泡與燈罩）與投向看板的軌道燈
  for (const z of [-3.1, -4.9]) {
    b.box('dark', [0.012, 0.55, 0.012], [0.15, CEIL - 0.28, z], { tint: '#1f1a17' })
    b.add('plain', new CylinderGeometry(0.06, 0.2, 0.18, 14, 1, true), { position: [0.15, CEIL - 0.62, z], tint: '#e8d2a6' })
    b.add('bulb', new IcosahedronGeometry(0.06, 1), { position: [0.15, CEIL - 0.68, z], tint: '#ffe2ad' })
  }
  b.box('dark', [0.04, 0.04, 3.6], [-1.4, CEIL - 0.05, -4.2], { tint: '#1f1f1f' })
  for (const z of [-2.8, -4.0, -5.3]) {
    b.cylinder('dark', 0.035, 0.05, 0.12, 10, [-1.6, CEIL - 0.14, z], { rotation: [0, 0, 0.7], tint: '#262626' })
  }
}

/* ── 豆花櫃台與工作區 ───────────────────────── */

function counter(b) {
  const z0 = S.counterZ
  const d = 0.7
  const zc = z0 - d / 2
  // 木製櫃台：直條木板的正面、淺色的檯面
  b.box('wood', [IN * 2, 0.98, d - 0.06], [0, 0.49, zc - 0.03], { tint: '#8a5d3b' })
  for (let i = 0; i < 20; i++) b.box('wood', [0.012, 0.9, 0.012], [-IN + 0.14 + i * 0.27, 0.48, z0 - 0.025], { tint: '#6c4a2f' })
  b.box('woodLight', [IN * 2, 0.05, d + 0.04], [0, 1.0, zc], { tint: '#cfa877' })
  // 左段：玻璃配料櫃（六盤自製配料）
  const caseX = -1.55
  b.box('glassClear', [1.9, 0.3, 0.5], [caseX, 1.18, zc], { tint: '#e7eef0' })
  b.box('steel', [1.92, 0.02, 0.52], [caseX, 1.34, zc], { tint: '#c9cdce' })
  const kinds = ['balls', 'purple', 'jelly', 'dark', 'red', 'green']
  kinds.forEach((kind, i) => toppingTray(b, caseX - 0.62 + (i % 3) * 0.31, 1.03, zc + (i < 3 ? 0.11 : -0.12), kind, 50 + i))
  // 中段：完成的豆花、裝豆花的木桶與湯杓
  const bowls = [
    ['balls', 'jelly', 'red'],
    ['peanut', 'green', 'balls'],
    ['jelly', 'red', 'peanut'],
  ]
  // 完成的豆花放在兩層的木製展示台上（站在櫃台前也看得到碗裡的配料）
  b.box('woodLight', [0.92, 0.06, 0.2], [0.27, 1.055, z0 - 0.14], { tint: '#d2ad7c' })
  b.box('woodLight', [0.92, 0.16, 0.16], [0.27, 1.105, z0 - 0.34], { tint: '#c39a6a' })
  bowls.forEach((toppings, i) => douhuaBowl(b, -0.02 + i * 0.29, 1.085, z0 - 0.14, toppings, 70 + i, 1.4))
  douhuaBowl(b, 0.12, 1.185, z0 - 0.34, [], 74, 1.3)
  douhuaBowl(b, 0.44, 1.185, z0 - 0.34, ['balls'], 75, 1.3)
  b.cylinder('wood', 0.18, 0.16, 0.32, 18, [1.05, 1.19, zc - 0.08], { tint: '#b28552' })
  b.add('steel', new TorusGeometry(0.18, 0.012, 4, 18), { position: [1.05, 1.35, zc - 0.08], rotation: [Math.PI / 2, 0, 0], tint: '#8f8a80' })
  b.cylinder('plain', 0.165, 0.165, 0.01, 18, [1.05, 1.34, zc - 0.08], { tint: '#f6f3ea' })
  b.box('steel', [0.02, 0.02, 0.36], [1.18, 1.4, zc - 0.08], { rotation: [0.6, 0, 0], tint: '#c9cdce' })
  // 右段：點餐的平板、菜單架與疊放的碗
  b.box('dark', [0.26, 0.18, 0.02], [1.55, 1.13, z0 - 0.2], { rotation: [-0.5, 0, 0], tint: '#1d1f22' })
  b.box('plain', [0.24, 0.16, 0.012], [1.55, 1.13, z0 - 0.19], { rotation: [-0.5, 0, 0], tint: '#5fa8d8' })
  b.box('wood', [0.32, 0.26, 0.03], [2.1, 1.16, z0 - 0.14], { rotation: [-0.2, 0, 0], tint: '#c39a6a' })
  b.box('plain', [0.28, 0.22, 0.01], [2.1, 1.16, z0 - 0.12], { rotation: [-0.2, 0, 0], tint: '#f6f2e7' })
  for (let i = 0; i < 5; i++) bowl(b, 2.45, 1.025 + i * 0.016, zc - 0.1, '#f6f5f0')
  // 櫃台上方垂掛的場記板
  clapperboard(b, -0.9, 2.55, z0 - 0.35, 0, 0.9)
  clapperboard(b, 1.25, 2.6, z0 - 0.35, 0.18, 0.75)
}

function workArea(b) {
  const z = BACK + 0.38
  // 不鏽鋼工作台、爐具、湯鍋（糖水與豆花）與水壺
  b.box('steel', [IN * 2 - 0.2, 0.04, 0.62], [0, 0.88, z], { tint: '#d6d9da' })
  b.box('steel', [IN * 2 - 0.3, 0.025, 0.56], [0, 0.25, z], { tint: '#c9cdce' })
  for (const s of [-1, 1]) {
    for (const zz of [-0.25, 0.25]) b.box('steel', [0.04, 0.86, 0.04], [s * (IN - 0.2), 0.43, z + zz], { tint: '#bfc4c5' })
  }
  b.box('dark', [0.5, 0.06, 0.4], [-1.2, 0.93, z], { tint: '#222426' })
  b.cylinder('steel', 0.2, 0.2, 0.34, 18, [-1.2, 1.13, z], { tint: '#d0d3d4' })
  b.cylinder('glassClear', 0.18, 0.18, 0.02, 18, [-1.2, 1.24, z], { tint: '#c98a3c' })
  b.cylinder('steel', 0.22, 0.2, 0.42, 18, [-0.45, 1.11, z], { tint: '#c6c9ca' })
  b.cylinder('steel', 0.1, 0.12, 0.22, 12, [0.4, 1.01, z], { tint: '#b9bdbe' })
  b.box('steel', [0.03, 0.03, 0.18], [0.52, 1.1, z], { tint: '#9a9fa0' })
  // 後牆的層架：裝豆子與糖的玻璃罐、碗盤
  for (const y of [1.55, 1.95]) {
    b.box('wood', [2.2, 0.04, 0.26], [0.95, y, BACK + 0.15], { tint: '#7a5236' })
    for (let i = 0; i < 6; i++) {
      const x = 0.05 + i * 0.36
      b.cylinder('glassClear', 0.07, 0.07, 0.2, 12, [x, y + 0.12, BACK + 0.15], { tint: '#e9eef0' })
      b.cylinder('plain', 0.062, 0.062, 0.12, 12, [x, y + 0.08, BACK + 0.15], { tint: ['#6b2025', '#7d7b3d', '#d7b178', '#efe7d2', '#c9852e', '#e98a34'][i] })
      b.cylinder('plain', 0.074, 0.074, 0.03, 12, [x, y + 0.235, BACK + 0.15], { tint: '#3d3a36' })
    }
  }
  // 小冰箱與後牆的菜單黑板（文字在 actionBar.js）
  b.box('plain', [0.6, 0.85, 0.55], [IN - 0.4, 0.43, z], { tint: '#ecebe6' })
  b.box('dark', [0.95, 0.6, 0.03], [-1.2, 2.45, BACK + 0.02], { tint: '#2c3431' })
  b.box('wood', [1.0, 0.65, 0.025], [-1.2, 2.45, BACK + 0.005], { tint: '#8a6a45' })
  b.box('plain', [2.3, 0.3, 0.02], [0.6, 2.62, BACK + 0.02], { tint: '#f1f4f6' })
}

/** 電影場記板：黑色板身、上方黑白斜紋的拍板、白色的欄位線 */
function clapperboard(b, x, y, z, tilt = 0, s = 1) {
  b.group([x, y, z], 0, () => {
    b.box('plain', [0.36 * s, 0.26 * s, 0.015], [0, 0, 0], { rotation: [0, 0, tilt], tint: '#1f1f1f' })
    for (let i = 0; i < 3; i++) b.box('plain', [0.32 * s, 0.006, 0.004], [0, (-0.06 + i * 0.05) * s, 0.009], { rotation: [0, 0, tilt], tint: '#e8e8e2' })
    b.group([0, 0.16 * s, 0], 0, () => {
      b.box('plain', [0.36 * s, 0.06 * s, 0.016], [0, 0, 0], { rotation: [0, 0, tilt + 0.12], tint: '#f2f2ee' })
      for (let i = 0; i < 4; i++) {
        b.box('plain', [0.04 * s, 0.062 * s, 0.018], [(-0.13 + i * 0.09) * s, 0, 0.001], { rotation: [0, 0, tilt + 0.12 + 0.55], tint: '#1f1f1f' })
      }
    })
  })
}

/* ── 左牆：影像教育看板、獎狀、懸掛的留言本、飲水櫃、攝影機 ── */

function leftWall(b) {
  const x = -IN + 0.025
  b.group([x, 0, 0], Math.PI / 2, () => {
    // 本地座標：+x 沿著牆往店內深處（=-z），+z 朝房間
    const along = (z) => -z
    // 《逗。留。台灣》兒童影像紀錄學習營看板：白底、上緣膠卷格、照片示意與彩色的手寫牌
    const ec = along(-3.15)
    b.box('plain', [1.62, 1.55, 0.02], [ec, 2.02, 0.01], { tint: '#eef2f5' })
    for (let i = 0; i < 9; i++) b.box('plain', [0.1, 0.07, 0.01], [ec - 0.72 + i * 0.18, 2.73, 0.025], { tint: '#b7c6d3' })
    b.box('plain', [0.9, 0.62, 0.012], [ec + 0.28, 1.86, 0.025], { tint: '#c7d0d6' })
    // 照片示意：電腦前的孩子（簡單的人形剪影）
    for (const [px, h, tint] of [
      [-0.05, 0.3, '#8a9aa6'],
      [0.18, 0.36, '#7d8e9b'],
      [0.48, 0.42, '#6f818f'],
    ]) {
      dot(b, 'plain', 0.06, [ec + px, 1.76 + h * 0.5, 0.035], tint, [1, 1.1, 0.3], 1)
      b.box('plain', [0.16, h * 0.55, 0.01], [ec + px, 1.58 + h * 0.1, 0.034], { tint })
    }
    b.box('dark', [0.32, 0.2, 0.012], [ec + 0.12, 1.6, 0.04], { tint: '#40474d' })
    const paddles = ['#7fb7e0', '#9fd06b', '#f2d36b', '#6fa3d6', '#8fc7d8', '#e0b36b']
    paddles.forEach((tint, i) => {
      const px = ec - 0.62 + (i % 2) * 0.28
      const py = 2.38 - Math.floor(i / 2) * 0.3
      b.box('plain', [0.24, 0.17, 0.012], [px, py, 0.035], { tint })
      for (let k = 0; k < 3; k++) b.box('plain', [0.16, 0.012, 0.004], [px, py + 0.04 - k * 0.04, 0.043], { tint: '#2d3b52' })
      b.box('wood', [0.025, 0.12, 0.01], [px, py - 0.13, 0.035], { tint: '#c9a46a' })
    })
    // 黑白方塊（示意的報名條碼，不是真的條碼）
    for (let i = 0; i < 16; i++) {
      if ((i * 7 + 3) % 3 === 0) continue
      b.box('plain', [0.025, 0.025, 0.004], [ec + 0.55 + (i % 4) * 0.027, 2.36 - Math.floor(i / 4) * 0.027, 0.04], { tint: '#1f1f1f' })
    }
    // 上方三個裝框的獎狀（原創的星形圖樣，不使用影展的標誌）
    ;[
      ['#c7ccd1', '#5b5aa8'],
      ['#d6b765', '#6b5d4e'],
      ['#c7ccd1', '#7a7f86'],
    ].forEach(([frame, inner], i) => {
      const px = ec - 0.5 + i * 0.5
      b.box('steel', [0.38, 0.46, 0.03], [px, 3.0, 0.02], { tint: frame })
      b.box('plain', [0.32, 0.4, 0.01], [px, 3.0, 0.036], { tint: '#f4f2ea' })
      b.box('plain', [0.24, 0.16, 0.006], [px, 3.08, 0.042], { tint: inner })
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + Math.PI / 2
        b.box('plain', [0.012, 0.05, 0.004], [px + Math.cos(a) * 0.022, 3.08 + Math.sin(a) * 0.022, 0.046], { rotation: [0, 0, a - Math.PI / 2], tint: '#ffffff' })
      }
      for (let k = 0; k < 3; k++) b.box('plain', [0.2, 0.01, 0.004], [px, 2.92 - k * 0.04, 0.042], { tint: '#8b8b88' })
    })
    // 導演的公益豆花看板與懸掛的手寫留言本（三欄、每欄五排，每排兩本）
    const mc = along(-5.05)
    b.box('plain', [1.95, 1.75, 0.02], [mc, 1.98, 0.01], { tint: '#eef2f5' })
    for (let i = 0; i < 11; i++) b.box('plain', [0.1, 0.07, 0.01], [mc - 0.9 + i * 0.18, 2.8, 0.025], { tint: '#b7c6d3' })
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 5; r++) {
        const cx = mc - 0.6 + c * 0.6
        const ry = 2.42 - r * 0.32
        b.cylinder('steel', 0.012, 0.012, 0.52, 6, [cx, ry + 0.11, 0.05], { rotation: [0, 0, Math.PI / 2], tint: '#8a8578' })
        for (const off of [-0.13, 0.13]) {
          b.box('plain', [0.22, 0.24, 0.035], [cx + off, ry - 0.02, 0.05], { rotation: [0.06, 0, 0], tint: '#f8f7f2' })
          b.box('dark', [0.18, 0.012, 0.02], [cx + off, ry + 0.095, 0.07], { tint: '#3a3734' })
          for (let k = 0; k < 4; k++) b.box('plain', [0.15 - (k % 2) * 0.04, 0.008, 0.004], [cx + off + 0.01, ry + 0.04 - k * 0.045, 0.07], { tint: '#3d3b48' })
          b.box('plain', [0.035, 0.035, 0.004], [cx + off - 0.07, ry + 0.05, 0.072], { tint: '#c8402f' })
        }
      }
    }
    // 牆上的小螢幕（播放影像紀錄的成果）
    b.box('dark', [0.46, 0.3, 0.03], [along(-4.05), 1.45, 0.02], { tint: '#18191b' })
    b.box('plain', [0.42, 0.26, 0.01], [along(-4.05), 1.45, 0.038], { tint: '#4f7fa8' })
  })
  // 飲水櫃：木櫃、玻璃水罐、倒扣的杯子（蓋著小毛巾）、面紙盒
  b.box('wood', [0.42, 0.92, 1.05], [-IN + 0.21, 0.46, -4.05], { tint: '#6f4b31' })
  b.box('woodLight', [0.46, 0.04, 1.1], [-IN + 0.23, 0.94, -4.05], { tint: '#b98d5f' })
  b.cylinder('glassClear', 0.11, 0.11, 0.3, 14, [-IN + 0.22, 1.11, -4.3], { tint: '#e5eef0' })
  b.cylinder('glassClear', 0.1, 0.1, 0.18, 14, [-IN + 0.22, 1.05, -4.3], { tint: '#d6e4ea' })
  b.box('steel', [0.3, 0.012, 0.3], [-IN + 0.22, 0.965, -4.3], { tint: '#3e4b5a' })
  for (let i = 0; i < 4; i++) b.cylinder('glassClear', 0.032, 0.03, 0.09, 10, [-IN + 0.16 + (i % 2) * 0.08, 1.01, -3.72 - Math.floor(i / 2) * 0.08], { tint: '#e5eef0' })
  b.box('cloth', [0.22, 0.02, 0.22], [-IN + 0.2, 1.065, -3.76], { tint: '#f4f1ea' })
  b.box('wood', [0.2, 0.1, 0.12], [-IN + 0.22, 0.99, -4.65], { tint: '#c9a46a' })
  // 攝影機與三腳架（角落）
  const cx = -IN + 0.3
  const cz = -5.88
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4
    b.box('dark', [0.025, 1.42, 0.025], [cx + Math.cos(a) * 0.17, 0.68, cz + Math.sin(a) * 0.17], { rotation: [Math.sin(a) * 0.24, 0, -Math.cos(a) * 0.24], tint: '#2a2a2a' })
  }
  b.box('dark', [0.14, 0.1, 0.14], [cx, 1.4, cz], { tint: '#3a3a3a' })
  b.box('dark', [0.18, 0.18, 0.34], [cx, 1.56, cz + 0.04], { tint: '#1f2022' })
  b.cylinder('dark', 0.065, 0.075, 0.18, 14, [cx, 1.58, cz + 0.29], { rotation: [Math.PI / 2, 0, 0], tint: '#18191a' })
  b.cylinder('glassClear', 0.05, 0.05, 0.01, 14, [cx, 1.58, cz + 0.385], { rotation: [Math.PI / 2, 0, 0], tint: '#6f8fb0' })
  b.box('plain', [0.04, 0.03, 0.08], [cx, 1.68, cz - 0.02], { tint: '#c43a2f' })
  // 角落的膠卷盤
  b.add('plain', new TorusGeometry(0.16, 0.035, 6, 18), { position: [-IN + 0.06, 2.0, -6.0], rotation: [0, Math.PI / 2, 0], tint: '#3a3a3a' })
  b.cylinder('steel', 0.13, 0.13, 0.03, 18, [-IN + 0.06, 2.0, -6.0], { rotation: [0, 0, Math.PI / 2], tint: '#a9adae' })
}

/* ── 右牆：小朋友的畫作展示牆、長椅與小桌 ─────────── */

function rightWall(b) {
  const x = IN - 0.025
  const rng = createRng(2021)
  b.group([x, 0, 0], -Math.PI / 2, () => {
    // 本地座標：+x 沿著牆往店外（=+z），+z 朝房間
    const along = (z) => z
    b.box('wood', [3.8, 1.75, 0.02], [along(-4.2), 1.98, 0.01], { tint: '#c9a06e' })
    const papers = ['#fbf8ef', '#fdf3d8', '#eef6fb', '#fbefe9', '#f3f8e8']
    const inks = ['#e0534a', '#f2a93b', '#4f9bd9', '#58b368', '#9a64c8', '#f07fa6', '#2f3b52']
    for (let i = 0; i < 30; i++) {
      const col = i % 10
      const row = Math.floor(i / 10)
      const px = along(-6.0) + 0.16 + col * 0.35 + (rng() - 0.5) * 0.05
      const py = 2.55 - row * 0.52 + (rng() - 0.5) * 0.06
      const w = 0.27 + rng() * 0.05
      const h = 0.34 + rng() * 0.06
      const tilt = (rng() - 0.5) * 0.12
      b.box('plain', [w, h, 0.006], [px, py, 0.025], { rotation: [0, 0, tilt], tint: papers[i % papers.length] })
      // 畫裡的東西：太陽、房子、花、人，或彩色的塗鴉（原創的簡單圖形）
      const motif = i % 5
      const ink = () => inks[Math.floor(rng() * inks.length)]
      if (motif === 0) {
        b.add('plain', new CylinderGeometry(0.04, 0.04, 0.004, 12), { position: [px + 0.06, py + 0.09, 0.03], rotation: [Math.PI / 2, 0, 0], tint: '#f2b632' })
        b.box('plain', [0.12, 0.09, 0.004], [px - 0.03, py - 0.06, 0.03], { tint: ink() })
        b.box('plain', [0.13, 0.05, 0.004], [px - 0.03, py + 0.01, 0.031], { rotation: [0, 0, 0.5], tint: '#c8402f' })
      } else if (motif === 1) {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2
          b.add('plain', new CylinderGeometry(0.018, 0.018, 0.004, 8), { position: [px + Math.cos(a) * 0.03, py + 0.04 + Math.sin(a) * 0.03, 0.03], rotation: [Math.PI / 2, 0, 0], tint: ink() })
        }
        b.box('plain', [0.008, 0.12, 0.004], [px, py - 0.06, 0.03], { tint: '#58b368' })
      } else if (motif === 2) {
        b.add('plain', new CylinderGeometry(0.03, 0.03, 0.004, 10), { position: [px, py + 0.08, 0.03], rotation: [Math.PI / 2, 0, 0], tint: '#f0c9a0' })
        b.box('plain', [0.06, 0.1, 0.004], [px, py - 0.01, 0.03], { tint: ink() })
        for (const s of [-1, 1]) b.box('plain', [0.008, 0.08, 0.004], [px + s * 0.02, py - 0.1, 0.03], { tint: '#2f3b52' })
      } else if (motif === 3) {
        for (let k = 0; k < 4; k++) b.box('plain', [0.16 + rng() * 0.05, 0.012, 0.004], [px, py + 0.1 - k * 0.06, 0.03], { rotation: [0, 0, (rng() - 0.5) * 0.5], tint: ink() })
      } else {
        // 一碗豆花的畫
        b.box('plain', [0.16, 0.06, 0.004], [px, py - 0.03, 0.03], { tint: '#f7f7f2' })
        b.box('plain', [0.14, 0.025, 0.004], [px, py, 0.031], { tint: '#d99a45' })
        for (let k = 0; k < 4; k++) b.add('plain', new CylinderGeometry(0.012, 0.012, 0.004, 8), { position: [px - 0.045 + k * 0.03, py + 0.02, 0.032], rotation: [Math.PI / 2, 0, 0], tint: k % 2 ? '#7a4f9c' : '#e98a34' })
      }
      // 圖釘
      b.add('plain', new CylinderGeometry(0.01, 0.01, 0.006, 6), { position: [px, py + h / 2 - 0.03, 0.033], rotation: [Math.PI / 2, 0, 0], tint: '#c8402f' })
    }
  })
  // 長椅（坐墊）與兩張小桌、凳子
  b.box('wood', [0.5, 0.42, 3.7], [IN - 0.27, 0.21, -4.25], { tint: '#7b5235' })
  b.box('cloth', [0.46, 0.06, 3.6], [IN - 0.27, 0.45, -4.25], { tint: '#9a5b45' })
  for (const z of [-3.3, -5.1]) {
    b.box('woodLight', [0.62, 0.04, 0.62], [1.5, 0.72, z], { tint: '#c9a173' })
    b.cylinder('wood', 0.04, 0.05, 0.7, 8, [1.5, 0.35, z], { tint: '#5e3f29' })
    b.cylinder('wood', 0.2, 0.22, 0.03, 12, [1.5, 0.015, z], { tint: '#5e3f29' })
    douhuaBowl(b, 1.45, 0.74, z + 0.08, ['balls', 'red'], Math.round(z * -10), 1)
    b.box('steel', [0.015, 0.008, 0.14], [1.62, 0.75, z + 0.06], { rotation: [0, 0.4, 0], tint: '#c9cdce' })
  }
  for (const [x, z] of [
    [0.95, -3.3],
    [0.95, -5.1],
  ]) {
    b.cylinder('wood', 0.17, 0.17, 0.04, 12, [x, 0.46, z], { tint: '#b98d5f' })
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2
      b.box('wood', [0.03, 0.45, 0.03], [x + Math.cos(a) * 0.11, 0.22, z + Math.sin(a) * 0.11], { tint: '#6e4a2f' })
    }
  }
}

/* ── 櫥窗前的豆花展示桌（近距離觀賞） ───────────── */

function displayTable(b) {
  const x = -1.78
  const z = -2.7
  b.box('woodLight', [1.0, 0.04, 0.72], [x, 0.76, z], { tint: '#c39a6a' })
  for (const [dx, dz] of [
    [-0.44, -0.3],
    [0.44, -0.3],
    [-0.44, 0.3],
    [0.44, 0.3],
  ]) {
    b.box('wood', [0.05, 0.74, 0.05], [x + dx, 0.37, z + dz], { tint: '#6e4a2f' })
  }
  b.box('cloth', [0.95, 0.008, 0.26], [x, 0.785, z], { tint: '#e9e3d4' })
  for (let i = 0; i < 8; i++) b.box('cloth', [0.95, 0.009, 0.012], [x, 0.786, z - 0.11 + i * 0.03], { tint: i % 2 ? '#7d9a8a' : '#e9e3d4' })
  // 一碗豆花的主角：傳統白豆花（只加麥芽糖水）、兩碗配料不同的豆花、一碟粉粿，
  // 以及地瓜粉圓、紅豆、綠豆三小碟（每一種的形狀與顏色都不同）
  douhuaBowl(b, x - 0.3, 0.79, z + 0.06, [], 10, 1.45)
  douhuaBowl(b, x + 0.02, 0.79, z - 0.12, ['balls', 'green', 'jelly'], 11, 1.45)
  douhuaBowl(b, x + 0.33, 0.79, z + 0.06, ['red', 'peanut', 'balls'], 12, 1.45)
  fenGuoDish(b, x - 0.33, 0.79, z - 0.2)
  toppingSaucer(b, x - 0.14, 0.79, z + 0.25, 'balls', 21)
  toppingSaucer(b, x + 0.04, 0.79, z + 0.27, 'red', 22)
  toppingSaucer(b, x + 0.22, 0.79, z + 0.25, 'green', 23)
  for (const dx of [-0.42, 0.42]) b.box('woodLight', [0.02, 0.01, 0.16], [x + dx, 0.795, z + 0.24], { rotation: [0, 0.5, 0], tint: '#d7b98c' })
  // 桌旁的導演椅
  directorChair(b, x + 0.05, z + 0.62, Math.PI)
}

export function buildActionBarInterior(b) {
  b.group(S.origin, S.rotationY, () => {
    finishes(b)
    counter(b)
    workArea(b)
    leftWall(b)
    rightWall(b)
    displayTable(b)
  })
}
