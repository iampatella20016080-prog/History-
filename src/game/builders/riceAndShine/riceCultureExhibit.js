import { ConeGeometry, CylinderGeometry, IcosahedronGeometry, LatheGeometry, TorusGeometry, Vector2 } from 'three'
import { MODERN } from '../../../data/riceAndShineLayout.js'
import { createRng } from '../../utils/random.js'
import { riceMeasure, ricePanel } from './riceAndShineExterior.js'
import { teaCup } from './riceMealProps.js'

/**
 * 米業文化展示（RiceCultureExhibit；2000–現在的稻舍）：左牆的高木架、土礱、蓑衣與斗笠、放米斗的小雕花桌。
 * 木架每一層的物件都不同（米斗、竹籮、陶甕、舊書、帳本、鐵罐、茶具、舊包裝、小工具），共三十多件；
 * 擺放有輕微的旋轉、縮放與位置差異，部分疊起來、靠在一起或放歪。器物是簡化的示意，不是館藏的複製。
 * 座標：建築本地座標，木架靠在左牆（x = -2.6），正面朝 +x。
 */
const JAR = [
  [0, 0],
  [0.62, 0],
  [0.86, 0.14],
  [1.0, 0.42],
  [0.94, 0.72],
  [0.66, 0.9],
  [0.58, 0.96],
  [0.62, 1.0],
  [0, 1.0],
].map(([x, y]) => new Vector2(x, y))

/** 陶甕：不同的尺寸與釉色、布封口、麻繩、紅紙標籤（字在街景的招牌層） */
export function storageJar(b, x, y, z, r, h, glaze, { cloth = null, rope = true, label = true, seed = 1 } = {}) {
  const rng = createRng(seed)
  b.add('plain', new LatheGeometry(JAR, 14), { position: [x, y, z], scale: [r, h, r], rotation: [0, rng() * 3, (rng() - 0.5) * 0.04], tint: glaze })
  const top = y + h
  if (cloth) {
    b.add('cloth', new IcosahedronGeometry(r * 0.75, 1), { position: [x, top + r * 0.08, z], scale: [1, 0.5, 1], tint: cloth })
    if (rope) b.add('plain', new TorusGeometry(r * 0.6, 0.006, 3, 12), { position: [x, top - r * 0.05, z], rotation: [Math.PI / 2, 0, 0], tint: '#b49a6c' })
  }
  if (label) b.box('plain', [0.004, r * 0.8, r * 0.8], [x + r * 0.98, y + h * 0.55, z], { rotation: [Math.PI / 4, 0, 0], tint: '#c8332b' })
}

/** 竹籮：竹編的籃身（交錯的竹篾）、外圈竹框、深淺竹色、輕微變形 */
export function bambooBasket(b, detail, x, y, z, r, h, seed = 1) {
  const rng = createRng(seed)
  const sx = 1 + (rng() - 0.5) * 0.06
  b.add('bamboo', new CylinderGeometry(r, r * 0.82, h, 16, 1, true), { position: [x, y + h / 2, z], scale: [sx, 1, 2 - sx], tint: '#b58a52' })
  b.add('bamboo', new CylinderGeometry(r * 0.82, r * 0.82, 0.01, 16), { position: [x, y + 0.005, z], tint: '#a07440' })
  b.add('bamboo', new TorusGeometry(r, 0.012, 4, 18), { position: [x, y + h, z], rotation: [Math.PI / 2, 0, 0], scale: [sx, 2 - sx, 1], tint: '#8e6538' })
  // 交錯的竹篾（細部）
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    detail.box('bamboo', [0.008, h * 0.95, 0.006], [x + Math.cos(a) * r * 0.92 * sx, y + h / 2, z + Math.sin(a) * r * 0.92 * (2 - sx)], { rotation: [0, -a, 0.12], tint: i % 2 ? '#c99e62' : '#9e7444' })
  }
}

/** 竹篩：外圈竹框與交錯的竹編（不是單一圓盤）、使用造成的輕微變形；靠立時 tilt 為傾斜角 */
export function bambooSieve(b, detail, x, y, z, r, { tilt = 0, rotationY = 0, seed = 1 } = {}) {
  const rng = createRng(seed)
  b.group([x, y, z], rotationY, () => {
    b.add('bamboo', new TorusGeometry(r, 0.016, 5, 22), { rotation: [Math.PI / 2 - tilt, 0, 0], scale: [1, 1 + (rng() - 0.5) * 0.05, 1], tint: '#9e7444' })
    b.add('bamboo', new CylinderGeometry(r * 0.98, r * 0.98, 0.006, 22), { rotation: [-tilt, 0, 0], tint: '#c79c5f' })
  })
  // 編織的紋路：兩個方向的竹篾
  for (let i = -3; i <= 3; i++) {
    for (const ang of [0, Math.PI / 2]) {
      detail.group([x, y, z], rotationY, () => {
        detail.box('bamboo', [ang ? 0.012 : r * 1.8 * Math.cos(Math.asin(Math.min(0.95, Math.abs(i) / 3.5))), 0.004, ang ? r * 1.8 * Math.cos(Math.asin(Math.min(0.95, Math.abs(i) / 3.5))) : 0.012], [ang ? (i * r) / 3.5 : 0, 0.005, ang ? 0 : (i * r) / 3.5], { rotation: [-tilt, 0, 0], tint: i % 2 ? '#b58a52' : '#d8b278' })
      })
    }
  }
}

/** 鐵皮茶罐、木算盤、舊書堆、帳本、鐵秤、木印章與紙袋 */
function tin(b, x, y, z, r, h, tint) {
  b.cylinder('steel', r, r, h, 12, [x, y + h / 2, z], { tint })
  b.cylinder('steel', r * 1.03, r * 1.03, 0.012, 12, [x, y + h + 0.006, z], { tint: '#c9c6bc' })
}

export function abacus(b, x, y, z, rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [0.28, 0.02, 0.012], [0, 0.07, 0], { tint: '#4a3020' })
    b.box('wood', [0.28, 0.02, 0.012], [0, -0.07, 0], { tint: '#4a3020' })
    b.box('wood', [0.28, 0.01, 0.012], [0, 0.03, 0], { tint: '#4a3020' })
    for (const s of [-1, 1]) b.box('wood', [0.015, 0.16, 0.014], [s * 0.14, 0, 0], { tint: '#4a3020' })
    for (let i = 0; i < 9; i++) {
      const bx = -0.12 + i * 0.03
      b.box('wood', [0.003, 0.14, 0.003], [bx, 0, 0], { tint: '#2a1d14' })
      for (let k = 0; k < 4; k++) b.box('wood', [0.02, 0.014, 0.014], [bx, -0.055 + k * 0.018 + (i % 3 === 0 ? 0.01 : 0), 0], { tint: '#6a3a22' })
      b.box('wood', [0.02, 0.014, 0.014], [bx, 0.05, 0], { tint: '#6a3a22' })
    }
  })
}

function bookStack(b, x, y, z, n, seed = 1) {
  const rng = createRng(seed)
  let yy = y
  for (let i = 0; i < n; i++) {
    const h = 0.025 + rng() * 0.02
    b.box('plain', [0.2 + rng() * 0.04, h, 0.15 + rng() * 0.03], [x + (rng() - 0.5) * 0.02, yy + h / 2, z + (rng() - 0.5) * 0.02], { rotation: [0, (rng() - 0.5) * 0.25, 0], tint: ['#7a3a2f', '#3f5a6e', '#c9b48a', '#2f4b3a'][i % 4] })
    yy += h
  }
}

export function steelyard(b, x, y, z, rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    b.cylinder('wood', 0.008, 0.01, 0.55, 6, [0, 0, 0], { rotation: [0, 0, Math.PI / 2 - 0.08], tint: '#8a6a44' })
    b.cylinder('steel', 0.002, 0.002, 0.2, 4, [-0.18, -0.1, 0], { tint: '#3a3634' })
    b.cylinder('steel', 0.07, 0.055, 0.02, 12, [-0.18, -0.2, 0], { tint: '#8a7a5a' })
    b.add('steel', new IcosahedronGeometry(0.025, 0), { position: [0.16, -0.06, 0], tint: '#2f2b28' })
  })
}

function kraftPackage(b, x, y, z, w, h, d, rotY, labelled) {
  b.box('plain', [w, h, d], [x, y + h / 2, z], { rotation: [0, rotY, 0], tint: '#c4a172' })
  b.box('plain', [w + 0.003, 0.01, d + 0.003], [x, y + h * 0.6, z], { rotation: [0, rotY, 0], tint: '#8a6a40' })
  if (labelled) ricePanel(b, 'riceLabels', w * 0.6, h * 0.6, [x + w / 2 + 0.004, y + h / 2, z], Math.PI / 2)
}

/* ═══════════ 左牆的高木架 ═══════════ */

const LEVELS = [0.35, 0.86, 1.36, 1.86, 2.36]

export function exhibitShelf(b, detail) {
  const sh = MODERN.shelf
  const depth = sh.maxX - sh.minX
  const len = sh.maxZ - sh.minZ
  const front = sh.maxX
  const cx = (sh.minX + sh.maxX) / 2
  const cz = (sh.minZ + sh.maxZ) / 2
  // 深色木架：兩側與中間的立柱、層板、雕花托架、下方的木櫃
  for (const z of [sh.minZ + 0.03, cz, sh.maxZ - 0.03]) b.box('wood', [depth, sh.height, 0.05], [cx, sh.height / 2, z], { tint: '#3e2a1e' })
  for (const y of LEVELS) b.box('wood', [depth, 0.03, len], [cx, y, cz], { tint: '#4a3224' })
  b.box('planks', [depth - 0.04, LEVELS[0] - 0.02, len - 0.08], [cx, (LEVELS[0] - 0.02) / 2, cz], { tint: '#553a29' })
  // 層板下的雕花托架（三角形的木托，貼著立柱）
  for (const y of LEVELS.slice(1, 4)) for (const z of [sh.minZ + 0.08, cz - 0.06, cz + 0.06, sh.maxZ - 0.08]) b.box('wood', [0.025, 0.07, 0.07], [front - 0.03, y - 0.03, z], { rotation: [Math.PI / 4, 0, 0], tint: '#3a281d' })
  const rng = createRng(1907)
  const jit = () => (rng() - 0.5) * 0.04
  const at = (t) => sh.minZ + 0.12 + t * (len - 0.24)
  const [l0, l1, l2, l3, l4] = LEVELS
  // 第一層：大小不一的米斗、三只陶甕（不同釉色、布封口與麻繩）、小米袋
  riceMeasure(b, detail, cx + 0.03, l0 + 0.015, at(0.06), 0.13, 0.15)
  riceMeasure(b, detail, cx - 0.02, l0 + 0.015, at(0.2), 0.1, -0.2)
  riceMeasure(b, detail, cx - 0.02, l0 + 0.115, at(0.2), 0.07, 0.4)
  storageJar(b, cx, l0 + 0.015, at(0.4), 0.11, 0.3, '#3a2e26', { cloth: '#b8282a', seed: 1 })
  storageJar(b, cx + 0.02, l0 + 0.015, at(0.55), 0.08, 0.22, '#7a5a3a', { cloth: '#d9c8a2', seed: 2 })
  storageJar(b, cx - 0.03, l0 + 0.015, at(0.68), 0.09, 0.26, '#4f6a5a', { seed: 3 })
  b.add('burlap', new IcosahedronGeometry(0.12, 1), { position: [cx, l0 + 0.12, at(0.88)], scale: [1, 0.9, 1.3], tint: '#cdb991' })
  // 第二層：竹籮兩只、靠著的竹篩、舊書堆、翻開的帳本、三個鐵罐
  bambooBasket(b, detail, cx + jit(), l1 + 0.015, at(0.08), 0.1, 0.12, 4)
  bambooBasket(b, detail, cx + jit(), l1 + 0.015, at(0.24), 0.08, 0.1, 5)
  bambooSieve(b, detail, cx - 0.12, l1 + 0.2, at(0.38), 0.17, { tilt: 1.2, rotationY: Math.PI / 2, seed: 6 })
  bookStack(b, cx, l1 + 0.015, at(0.56), 4, 7)
  ricePanel(b, 'ledger', 0.24, 0.18, [cx + 0.05, l1 + 0.12, at(0.72)], Math.PI / 2)
  b.box('plain', [0.14, 0.02, 0.24], [cx + 0.04, l1 + 0.025, at(0.72)], { rotation: [0, 0, -0.5], tint: '#d8c8a0' })
  for (let i = 0; i < 3; i++) tin(b, cx + jit(), l1 + 0.015, at(0.84 + i * 0.055), 0.035 + i * 0.005, 0.1 + i * 0.02, ['#b23a2b', '#c9c6bc', '#2f4b6e'][i])
  // 第三層：茶壺與茶杯（有的倒扣、有的放歪）、牛皮紙包裝、木算盤、木勺、毛筆與墨盒、木印章
  b.add('plain', new LatheGeometry([[0, 0], [0.06, 0], [0.07, 0.04], [0.06, 0.08], [0.035, 0.1], [0, 0.1]].map(([x, y]) => new Vector2(x, y)), 12), { position: [cx, l2 + 0.015, at(0.06)], tint: '#5a3a28' })
  teaCup(b, cx + 0.05, l2 + 0.015, at(0.14), { flip: true, tint: '#efe9dc' })
  teaCup(b, cx - 0.04, l2 + 0.015, at(0.17), { level: 0, tint: '#3c5f86' })
  teaCup(b, cx + 0.03, l2 + 0.015, at(0.21), { flip: true, tint: '#a8764c' })
  kraftPackage(b, cx, l2 + 0.015, at(0.36), 0.22, 0.2, 0.18, 0.06, true)
  kraftPackage(b, cx + 0.01, l2 + 0.215, at(0.36), 0.18, 0.12, 0.15, -0.1, false)
  abacus(b, cx + 0.05, l2 + 0.11, at(0.6), Math.PI / 2 + 0.05)
  b.box('wood', [0.04, 0.02, 0.18], [cx, l2 + 0.025, at(0.74)], { rotation: [0, 0.3, 0], tint: '#a07848' })
  b.add('wood', new IcosahedronGeometry(0.03, 0), { position: [cx, l2 + 0.03, at(0.74) + 0.09], scale: [1, 0.5, 1.2], tint: '#a07848' })
  detail.cylinder('wood', 0.005, 0.007, 0.18, 5, [cx + 0.06, l2 + 0.02, at(0.84)], { rotation: [0, 0, Math.PI / 2], tint: '#2a2420' })
  b.box('plain', [0.08, 0.025, 0.06], [cx, l2 + 0.028, at(0.9)], { tint: '#1f1c1a' })
  b.box('wood', [0.03, 0.06, 0.03], [cx - 0.06, l2 + 0.045, at(0.95)], { tint: '#7a4a2e' })
  // 第四層：竹籃、鐵秤（掛著）、老照片、麻繩
  bambooBasket(b, detail, cx, l3 + 0.015, at(0.1), 0.11, 0.16, 8)
  steelyard(b, cx + 0.1, l4 - 0.12, at(0.38), Math.PI / 2)
  b.box('wood', [0.02, 0.22, 0.28], [cx - 0.12, l3 + 0.13, at(0.6)], { rotation: [0, 0, -0.12], tint: '#2b211b' })
  ricePanel(b, 'oldPhoto', 0.25, 0.19, [cx - 0.105, l3 + 0.13, at(0.6)], Math.PI / 2)
  b.add('plain', new TorusGeometry(0.06, 0.014, 4, 12), { position: [cx, l3 + 0.03, at(0.84)], rotation: [Math.PI / 2, 0, 0], tint: '#b49a6c' })
  b.add('plain', new TorusGeometry(0.045, 0.014, 4, 12), { position: [cx + 0.01, l3 + 0.055, at(0.84)], rotation: [Math.PI / 2, 0, 0.2], tint: '#a88a5c' })
  // 最上層：竹編箱、米袋、紙袋
  b.box('bamboo', [0.3, 0.16, 0.34], [cx, l4 + 0.095, at(0.2)], { rotation: [0, 0.05, 0], tint: '#b48b55' })
  b.add('burlap', new IcosahedronGeometry(0.11, 1), { position: [cx, l4 + 0.1, at(0.55)], scale: [1, 0.85, 1.25], tint: '#d9c8a2' })
  b.box('plain', [0.12, 0.18, 0.2], [cx, l4 + 0.105, at(0.85)], { rotation: [0, -0.15, 0.04], tint: '#d7c09a' })
}

/* ═══════════ 土礱、蓑衣、斗笠、米斗的小雕花桌 ═══════════ */

/** 土礱（照片：竹編的礱身放在有輪子的木座上，旁邊是推的木把手） */
export function husker(b, detail) {
  const hk = MODERN.husker
  const x = (hk.minX + hk.maxX) / 2
  const z = (hk.minZ + hk.maxZ) / 2
  b.box('wood', [0.7, 0.08, 0.7], [x, 0.14, z], { tint: '#6e4a2e' })
  for (const [dx, dz] of [
    [-0.28, -0.28],
    [0.28, -0.28],
    [-0.28, 0.28],
    [0.28, 0.28],
  ]) {
    b.add('steel', new CylinderGeometry(0.05, 0.05, 0.03, 10), { position: [x + dx, 0.05, z + dz], rotation: [0, 0, Math.PI / 2], tint: '#2a2826' })
  }
  b.cylinder('bamboo', 0.3, 0.32, 0.2, 18, [x, 0.28, z], { tint: '#a8804a' })
  b.add('bamboo', new TorusGeometry(0.34, 0.025, 5, 22), { position: [x, 0.38, z], rotation: [Math.PI / 2, 0, 0], tint: '#8e6538' })
  b.cylinder('bamboo', 0.24, 0.26, 0.28, 18, [x, 0.52, z], { tint: '#b58a52' })
  b.add('bamboo', new ConeGeometry(0.28, 0.16, 18, 1, true), { position: [x, 0.74, z], rotation: [Math.PI, 0, 0], tint: '#c99e62' })
  // 推動礱上層的木把手
  b.box('wood', [0.06, 0.06, 0.9], [x + 0.32, 0.6, z], { rotation: [0.15, 0, 0], tint: '#7a5534' })
  b.box('wood', [0.04, 0.04, 0.4], [x + 0.32, 0.66, z + 0.45], { rotation: [0, Math.PI / 2, 0], tint: '#7a5534' })
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    detail.box('bamboo', [0.01, 0.26, 0.006], [x + Math.cos(a) * 0.245, 0.52, z + Math.sin(a) * 0.245], { rotation: [0, -a, 0.15], tint: i % 2 ? '#c99e62' : '#94683c' })
  }
}

/** 牆上的蓑衣與斗笠、編織的扇 */
export function wallHangings(b, detail) {
  const wx = MODERN.shelf.minX + 0.03
  const z = -4.65
  const rng = createRng(29)
  // 蓑衣：一層一層往下散開的棕櫚纖維（每層是一排細長的纖維束，越往下越寬，下緣參差不齊）
  for (let r = 0; r < 4; r++) {
    const n = 9 + r * 2
    const width = 0.34 + r * 0.12
    const y = 2.28 - r * 0.2
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) - 0.5
      const len = 0.3 + rng() * 0.08
      b.box('burlap', [0.012, len, 0.045], [wx + 0.03 + r * 0.008, y - len / 2, z + t * width], {
        rotation: [t * 0.5, 0, 0],
        tint: rng() < 0.5 ? '#6e5a44' : rng() < 0.5 ? '#806a50' : '#5e4c3a',
      })
    }
  }
  // 領口的繩子
  b.box('plain', [0.02, 0.025, 0.36], [wx + 0.04, 2.3, z], { tint: '#8a7050' })
  b.box('wood', [0.04, 0.03, 0.6], [wx + 0.04, 2.48, z], { tint: '#4a3020' })
  // 斗笠與扇
  b.add('bamboo', new ConeGeometry(0.26, 0.12, 18, 1, true), { position: [wx + 0.06, 1.75, z - 0.75], rotation: [0, 0, -Math.PI / 2], tint: '#cfa96a' })
  b.add('bamboo', new CylinderGeometry(0.16, 0.16, 0.01, 14, 1, false, 0, Math.PI), { position: [wx + 0.04, 1.7, z + 0.62], rotation: [0, 0, Math.PI / 2], tint: '#c99e62' })
  b.box('wood', [0.015, 0.22, 0.02], [wx + 0.04, 1.55, z + 0.62], { tint: '#8a6440' })
  void detail
}

/** 放米斗的小雕花桌（深色木、雕花的牙板）與桌上的米斗、說明卡 */
export function measureStand(b, detail) {
  const ms = MODERN.measureStand
  const x = (ms.minX + ms.maxX) / 2
  const z = (ms.minZ + ms.maxZ) / 2
  const w = ms.maxX - ms.minX
  const d = ms.maxZ - ms.minZ
  b.box('wood', [w, 0.04, d], [x, ms.height - 0.02, z], { tint: '#2f211a' })
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) b.box('wood', [0.05, ms.height - 0.04, 0.05], [x + sx * (w / 2 - 0.05), (ms.height - 0.04) / 2, z + sz * (d / 2 - 0.05)], { tint: '#2a1d16' })
  // 雕花的牙板與下層的隔板
  b.box('wood', [w - 0.1, 0.1, 0.02], [x, ms.height - 0.1, z + d / 2 - 0.05], { tint: '#3a281d' })
  for (let i = 0; i < 5; i++) b.add('wood', new TorusGeometry(0.03, 0.008, 4, 8, Math.PI), { position: [x - w / 2 + 0.12 + i * ((w - 0.24) / 4), ms.height - 0.12, z + d / 2 - 0.035], tint: '#4a3224' })
  b.box('wood', [w - 0.1, 0.02, d - 0.1], [x, 0.18, z], { tint: '#3a281d' })
  riceMeasure(b, detail, x, ms.height, z, 0.15, 0.1)
  b.box('plain', [0.1, 0.07, 0.003], [x + 0.18, ms.height + 0.035, z + 0.12], { rotation: [-0.3, -0.6, 0], tint: '#f4efe2' })
}
