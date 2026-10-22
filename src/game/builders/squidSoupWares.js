import { IcosahedronGeometry, LatheGeometry, Shape, SphereGeometry, TorusGeometry, Vector2 } from 'three'
import { createRng } from '../utils/random.js'

/**
 * 魷魚羹的兩個年代版本共用的餐具、食品與器具（廟口的魷魚羹攤、老潘魷魚羹）：
 * 有厚度的碗（內外兩層的旋轉體）、湯匙、筷筒與調味罐、大湯鍋與長柄湯勺、疊碗，以及四種食品
 * （魷魚羹、魚酥羹、甜不辣、乾拌沙茶生魷魚）。食材依形狀分別建模，不是同樣的圓球。
 *
 * 所有函式都以「目前的本地座標」擺放（呼叫前先用 b.group 移到桌面或攤台上）；y 為底面高度。
 * 食品的外觀依使用者提供的照片做成示意，不代表配方或份量。
 */

const SQUID = ['#f4e4d6', '#efd8c6', '#f7ece2']
const SQUID_EDGE = '#d9a78f'
const LEAF = ['#4f8a3a', '#5f9a44', '#3f7a33']

/* ── 碗、盤、湯匙 ─────────────────────────── */

/**
 * 有厚度的碗：外壁、碗口、內壁與內底一起做成旋轉體，從上方看得到碗的厚度與內側。
 * 回傳碗裡湯面的高度與半徑（fill 為湯面在碗深的比例）。
 */
export function soupBowl(b, x, y, z, { radius = 0.078, height = 0.066, tint = '#f6f3ea', rim = null, fill = 0.78, segments = 18 } = {}) {
  const r = radius
  const h = height
  const t = 0.006 // 碗壁厚度
  const foot = r * 0.5
  const points = [
    [0, 0],
    [foot, 0],
    [foot, 0.008],
    [r * 0.62, 0.012],
    [r * 0.86, h * 0.45],
    [r, h],
    [r - t * 0.5, h + 0.003],
    [r - t, h],
    [r * 0.86 - t, h * 0.47],
    [r * 0.62 - t, 0.016],
    [0, 0.016],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('plain', new LatheGeometry(points, segments), { position: [x, y, z], tint })
  if (rim) b.add('plain', new TorusGeometry(r - t * 0.5, 0.0032, 4, segments), { position: [x, y + h + 0.001, z], rotation: [Math.PI / 2, 0, 0], tint: rim })
  const level = 0.016 + (h - 0.016) * fill
  // 內壁在這個高度的半徑（線性內插）
  const k = (level - 0.016) / (h * 0.47 - 0.016)
  const inner = level < h * 0.47 ? r * 0.62 - t + (r * 0.24) * k : r * 0.86 - t + (r * 0.14) * ((level - h * 0.47) / (h * 0.53))
  return { y: y + level, radius: inner }
}

/** 淺盤（甜不辣、乾拌）：有一圈盤緣的旋轉體 */
export function plate(b, x, y, z, { radius = 0.11, tint = '#f6f3ea', rim = null, segments = 20 } = {}) {
  const r = radius
  const points = [
    [0, 0],
    [r * 0.55, 0],
    [r * 0.55, 0.006],
    [r * 0.82, 0.01],
    [r, 0.022],
    [r - 0.004, 0.025],
    [r * 0.8, 0.014],
    [0, 0.011],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('plain', new LatheGeometry(points, segments), { position: [x, y, z], tint })
  if (rim) b.add('plain', new TorusGeometry(r - 0.002, 0.0025, 4, segments), { position: [x, y + 0.023, z], rotation: [Math.PI / 2, 0, 0], tint: rim })
  return { y: y + 0.012, radius: r * 0.8 }
}

/** 白色的瓷湯匙：淺淺的匙面與往上翹的握柄 */
export function soupSpoon(b, x, y, z, { rotationY = 0, tint = '#f8f6f0' } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.add('plain', new SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), {
      position: [0, 0.012, 0],
      scale: [0.022, 0.012, 0.03],
      tint,
    })
    b.box('plain', [0.012, 0.006, 0.07], [0, 0.026, 0.055], { rotation: [-0.42, 0, 0], tint })
  })
}

/** 湯麵上的葉菜（扁平的小葉片） */
function leaves(b, rng, cx, y, cz, spread, count) {
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [cx + Math.cos(a) * d, y + 0.002 + rng() * 0.003, cz + Math.sin(a) * d],
      rotation: [rng() * 0.4, rng() * Math.PI, rng() * 0.4],
      scale: [0.012 + rng() * 0.006, 0.002, 0.007 + rng() * 0.004],
      tint: LEAF[i % LEAF.length],
    })
  }
}

/** 魷魚片：捲起來的長條（部分圓環）與刻花的扁片，邊緣略帶粉紅 */
function squidPieces(b, rng, cx, y, cz, spread, count, { scale = 1 } = {}) {
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    const px = cx + Math.cos(a) * d
    const pz = cz + Math.sin(a) * d
    if (i % 3 === 2) {
      // 刻花的扁片（魷魚身切成的片）
      b.box('plain', [0.03 * scale, 0.005, 0.018 * scale], [px, y + 0.004, pz], { rotation: [rng() * 0.5 - 0.25, rng() * Math.PI, rng() * 0.4 - 0.2], tint: SQUID[i % SQUID.length] })
      b.box('plain', [0.026 * scale, 0.0012, 0.003], [px, y + 0.0072, pz], { rotation: [0, rng() * Math.PI, 0], tint: SQUID_EDGE })
    } else {
      // 捲曲的長條（約大半圈）
      b.add('plain', new TorusGeometry(0.013 * scale, 0.0045 * scale, 4, 7, Math.PI * (1.05 + rng() * 0.5)), {
        position: [px, y + 0.005, pz],
        rotation: [Math.PI / 2 + (rng() - 0.5) * 0.7, (rng() - 0.5) * 0.5, rng() * Math.PI * 2],
        tint: SQUID[i % SQUID.length],
      })
    }
  }
}

/** 裹著魚漿的魷魚塊（不規則的淡色塊） */
function pasteChunks(b, rng, cx, y, cz, spread, count) {
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [cx + Math.cos(a) * d, y + 0.003, cz + Math.sin(a) * d],
      rotation: [rng() * 3, rng() * 3, rng() * 3],
      scale: [0.016 + rng() * 0.006, 0.008, 0.011 + rng() * 0.004],
      tint: i % 2 ? '#e9dcc4' : '#efe4cf',
    })
  }
}

/* ── 四種食品 ─────────────────────────────── */

/**
 * 魷魚羹（沙茶魷魚羹）：白碗、褐色的羹湯、看得出形狀的魷魚片、魚漿塊與少量葉菜。
 * shacha：沙茶的版本湯色較深、帶一點紅褐的油光。
 */
export function squidGeng(b, x, y, z, { seed = 1, shacha = false, bowl = {} } = {}) {
  const rng = createRng(seed)
  const soup = soupBowl(b, x, y, z, bowl)
  b.cylinder('plain', soup.radius, soup.radius, 0.004, 16, [x, soup.y, z], { tint: shacha ? '#7a4a26' : '#8d5c33' })
  if (shacha) {
    for (let i = 0; i < 5; i++) {
      const a = rng() * Math.PI * 2
      const d = rng() * soup.radius * 0.7
      b.cylinder('plain', 0.008 + rng() * 0.006, 0.008, 0.0015, 8, [x + Math.cos(a) * d, soup.y + 0.0025, z + Math.sin(a) * d], { tint: '#a0582c' })
    }
  }
  squidPieces(b, rng, x, soup.y, z, soup.radius * 0.62, 7)
  pasteChunks(b, rng, x, soup.y, z, soup.radius * 0.6, 4)
  leaves(b, rng, x + soup.radius * 0.2, soup.y + 0.006, z - soup.radius * 0.15, soup.radius * 0.3, 4)
  return soup
}

/** 魚酥羹：不規則的金黃魚酥片，一部分露出湯面 */
export function fishCrispGeng(b, x, y, z, { seed = 2, bowl = {} } = {}) {
  const rng = createRng(seed)
  const soup = soupBowl(b, x, y, z, bowl)
  b.cylinder('plain', soup.radius, soup.radius, 0.004, 16, [x, soup.y, z], { tint: '#9a6a3a' })
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.5
    const d = (0.25 + rng() * 0.55) * soup.radius
    const w = 0.026 + rng() * 0.018
    b.box('plain', [w, 0.006, w * (0.45 + rng() * 0.35)], [x + Math.cos(a) * d, soup.y + 0.004 + rng() * 0.006, z + Math.sin(a) * d], {
      rotation: [(rng() - 0.5) * 0.9, rng() * Math.PI, (rng() - 0.5) * 0.9],
      tint: ['#d9a24a', '#c98d38', '#e3b25a'][i % 3],
    })
  }
  leaves(b, rng, x, soup.y + 0.008, z, soup.radius * 0.35, 3)
  return soup
}

/** 甜不辣：盤裡不同形狀的魚漿製品（扁片、竹輪狀的管、圓片、三角）、蘿蔔塊與紅褐色的醬汁 */
export function tempura(b, x, y, z, { seed = 3, plateTint = '#f6f3ea', rim = null } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius: 0.11, tint: plateTint, rim })
  const top = dish.y
  // 盤底的醬汁
  b.cylinder('plain', 0.07, 0.07, 0.002, 14, [x, top + 0.001, z], { tint: '#a3472d' })
  const pieces = [
    { kind: 'flat', at: [-0.04, -0.025], r: 0.4 },
    { kind: 'flat', at: [0.035, 0.03], r: -0.9 },
    { kind: 'tube', at: [0.03, -0.035], r: 0.3 },
    { kind: 'tube', at: [-0.045, 0.035], r: 1.4 },
    { kind: 'round', at: [0.0, 0.0], r: 0 },
    { kind: 'tri', at: [0.06, 0.0], r: 0.6 },
  ]
  for (const piece of pieces) {
    const [px, pz] = piece.at
    const tint = ['#d8ae74', '#cf9f63', '#e0bb83'][Math.floor(rng() * 3)]
    if (piece.kind === 'flat') {
      b.box('plain', [0.055, 0.01, 0.03], [x + px, top + 0.007, z + pz], { rotation: [0, piece.r, 0.08], tint })
    } else if (piece.kind === 'tube') {
      b.cylinder('plain', 0.011, 0.011, 0.05, 10, [x + px, top + 0.012, z + pz], { rotation: [0, piece.r, Math.PI / 2], tint })
      for (const s of [-1, 1]) {
        b.cylinder('plain', 0.006, 0.006, 0.002, 8, [x + px + Math.cos(piece.r) * 0.025 * s, top + 0.012, z + pz - Math.sin(piece.r) * 0.025 * s], { rotation: [0, piece.r, Math.PI / 2], tint: '#9c6a3c' })
      }
    } else if (piece.kind === 'round') {
      b.cylinder('plain', 0.022, 0.022, 0.011, 12, [x + px, top + 0.008, z + pz], { rotation: [0.15, 0, 0.1], tint })
    } else {
      const tri = new Shape()
      tri.moveTo(-0.022, -0.016)
      tri.lineTo(0.024, -0.014)
      tri.lineTo(0.0, 0.024)
      tri.closePath()
      b.extrude('plain', tri, 0.01, { position: [x + px, top + 0.003, z + pz], rotation: [-Math.PI / 2, 0, piece.r], tint })
    }
  }
  // 白蘿蔔塊
  for (const [px, pz] of [[-0.065, -0.005], [0.015, 0.06], [-0.01, -0.06]]) {
    b.box('plain', [0.024, 0.022, 0.024], [x + px, top + 0.012, z + pz], { rotation: [0, rng() * 1.5, 0], tint: '#eee6cf' })
  }
  // 淋在上面的醬汁
  for (let i = 0; i < 6; i++) {
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [x + (rng() - 0.5) * 0.09, top + 0.018, z + (rng() - 0.5) * 0.09],
      scale: [0.012, 0.003, 0.008],
      rotation: [0, rng() * 3, 0],
      tint: '#8f3a24',
    })
  }
  return { y: top }
}

/** 乾拌沙茶生魷魚：魷魚片、豆芽、深色的沙茶醬與綠色葉片 */
export function dryShachaSquid(b, x, y, z, { seed = 4, plateTint = '#f6f3ea', rim = null } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius: 0.1, tint: plateTint, rim })
  const top = dish.y
  // 豆芽：白色的細莖與淡黃色的芽頭
  for (let i = 0; i < 16; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * 0.055
    const px = x + Math.cos(a) * d
    const pz = z + Math.sin(a) * d
    const yaw = rng() * Math.PI
    b.cylinder('plain', 0.0028, 0.0028, 0.042, 5, [px, top + 0.006 + rng() * 0.006, pz], { rotation: [0, yaw, Math.PI / 2 + (rng() - 0.5) * 0.3], tint: '#f1ecd6' })
    if (i % 2 === 0) b.add('plain', new SphereGeometry(0.0045, 6, 4), { position: [px + Math.cos(yaw) * 0.021, top + 0.008, pz - Math.sin(yaw) * 0.021], tint: '#e8d77a' })
  }
  squidPieces(b, rng, x, top + 0.012, z, 0.05, 8, { scale: 1.15 })
  // 沙茶醬：深褐色的醬團
  for (let i = 0; i < 7; i++) {
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [x + (rng() - 0.5) * 0.06, top + 0.02, z + (rng() - 0.5) * 0.06],
      scale: [0.011, 0.005, 0.009],
      rotation: [rng() * 3, rng() * 3, rng() * 3],
      tint: i % 2 ? '#5a3820' : '#4a2e1a',
    })
  }
  leaves(b, rng, x - 0.01, top + 0.026, z + 0.01, 0.03, 5)
  return { y: top }
}

/* ── 器具 ─────────────────────────────────── */

/**
 * 不鏽鋼大湯鍋：有厚度的鍋身（旋轉體：外壁、捲邊、內壁）、兩側把手、湯面；
 * lid 為 'on'（蓋著）、'ajar'（掀開一半，斜靠在鍋口）或省略（沒有蓋子）。
 */
export function bigPot(b, x, y, z, { radius = 0.24, height = 0.34, soup = '#8a5a30', lid = null, tint = '#d6dadb' } = {}) {
  const r = radius
  const h = height
  const level = h - 0.05 // 湯面
  const points = [
    [0, 0],
    [r * 0.96, 0],
    [r, h],
    [r + 0.006, h + 0.008],
    [r - 0.008, h + 0.004],
    [r - 0.008, level],
    [0, level],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('steel', new LatheGeometry(points, 20), { position: [x, y, z], tint })
  b.cylinder('plain', r - 0.009, r - 0.009, 0.004, 18, [x, y + level + 0.002, z], { tint: soup })
  for (const s of [-1, 1]) {
    b.box('steel', [0.05, 0.022, 0.03], [x + s * (r + 0.02), y + h - 0.05, z], { tint: '#b7bdbf' })
  }
  if (lid) {
    const ajar = lid === 'ajar'
    b.group([x + (ajar ? r * 0.45 : 0), y + h + (ajar ? 0.05 : 0.012), z], 0, () => {
      b.cylinder('steel', r + 0.008, r + 0.008, 0.012, 18, [0, 0, 0], { rotation: [0, 0, ajar ? 0.3 : 0], tint: '#cfd4d5' })
      b.cylinder('plain', 0.018, 0.024, 0.03, 8, [ajar ? -0.006 : 0, 0.02, 0], { rotation: [0, 0, ajar ? 0.3 : 0], tint: '#2f2b28' })
    })
  }
  return { top: y + h, soup: y + level }
}

/** 長柄湯勺：細長的握柄與小勺；從 (x, y, z) 的勺子往 rotationY 方向斜斜伸出 */
export function ladle(b, x, y, z, { length = 0.42, rotationY = 0, tilt = 0.9, cup = 0.032 } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.cylinder('steel', cup, cup * 0.75, cup * 0.9, 10, [0, 0, 0], { tint: '#c9cecf' })
    b.cylinder('steel', 0.006, 0.006, length, 6, [0, Math.cos(tilt) * length / 2 + cup * 0.3, Math.sin(tilt) * length / 2], { rotation: [tilt, 0, 0], tint: '#bfc5c7' })
  })
}

/** 疊放的碗（倒扣，從上方看得到碗底的圈足） */
export function bowlStack(b, x, y, z, { count = 5, radius = 0.075, tint = '#f6f3ea', rim = null } = {}) {
  for (let i = 0; i < count; i++) {
    const yy = y + i * 0.018
    b.cylinder('plain', radius * 0.6, radius, 0.06, 14, [x, yy + 0.03, z], { tint })
    if (rim) b.cylinder('plain', radius * 1.005, radius * 1.005, 0.006, 14, [x, yy + 0.004, z], { tint: rim })
  }
  b.cylinder('plain', radius * 0.34, radius * 0.34, 0.012, 12, [x, y + (count - 1) * 0.018 + 0.066, z], { tint })
}

/** 桌上的筷筒、醋瓶、胡椒罐、辣椒醬罐與菜單卡（老潘的食記寫到桌上有醋、胡椒粉、辣椒醬與餐具） */
export function condimentSet(b, x, y, z, { rotationY = 0, menuCard = true } = {}) {
  b.group([x, y, z], rotationY, () => {
    // 筷筒與筷子
    b.cylinder('plain', 0.03, 0.028, 0.11, 10, [0, 0.055, 0], { tint: '#c9a46a' })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      b.cylinder('wood', 0.0035, 0.0035, 0.22, 4, [Math.cos(a) * 0.014, 0.12, Math.sin(a) * 0.014], { rotation: [Math.sin(a) * 0.08, 0, Math.cos(a) * 0.08], tint: '#b88a58' })
    }
    // 醋瓶（深色）、胡椒罐（白身紅蓋）、辣椒醬罐（紅）
    b.cylinder('plain', 0.022, 0.024, 0.12, 10, [0.075, 0.06, 0.01], { tint: '#3a2a22' })
    b.cylinder('plain', 0.009, 0.012, 0.03, 8, [0.075, 0.135, 0.01], { tint: '#d8d2c4' })
    b.cylinder('plain', 0.017, 0.017, 0.07, 10, [0.125, 0.035, -0.02], { tint: '#f2efe7' })
    b.cylinder('plain', 0.018, 0.018, 0.016, 10, [0.125, 0.078, -0.02], { tint: '#c23a2c' })
    b.cylinder('plain', 0.025, 0.025, 0.06, 10, [0.125, 0.03, 0.04], { tint: '#b3261d' })
    b.cylinder('plain', 0.026, 0.026, 0.012, 10, [0.125, 0.066, 0.04], { tint: '#ece6d8' })
    // 桌上的菜單卡（白卡，只有示意的格線，沒有品名與價格）
    if (menuCard) {
      b.box('plain', [0.14, 0.003, 0.2], [-0.13, 0.002, 0.02], { rotation: [0, 0.12, 0], tint: '#f7f4ec' })
      for (let i = 0; i < 5; i++) b.box('plain', [0.1, 0.0015, 0.008], [-0.13, 0.004, -0.05 + i * 0.035], { rotation: [0, 0.12, 0], tint: '#b9483a' })
    }
  })
}

/** 配料盤（攤台上的方形淺盤）：kind 為 'squid'（魷魚片）、'greens'（葉菜）或 'paste'（魚漿塊） */
export function toppingTray(b, x, y, z, { kind = 'squid', seed = 5, width = 0.24, depth = 0.17, tint = '#e8e4da' } = {}) {
  const rng = createRng(seed)
  b.box('plain', [width, 0.012, depth], [x, y + 0.006, z], { tint })
  for (const s of [-1, 1]) {
    b.box('plain', [width, 0.022, 0.006], [x, y + 0.016, z + s * (depth / 2 - 0.003)], { tint })
    b.box('plain', [0.006, 0.022, depth], [x + s * (width / 2 - 0.003), y + 0.016, z], { tint })
  }
  const spread = Math.min(width, depth) * 0.42
  if (kind === 'squid') {
    squidPieces(b, rng, x - width * 0.12, y + 0.012, z, spread, 9, { scale: 1.1 })
    squidPieces(b, rng, x + width * 0.18, y + 0.012, z, spread * 0.8, 6, { scale: 1.1 })
  } else if (kind === 'greens') {
    leaves(b, rng, x, y + 0.016, z, spread * 1.4, 16)
  } else {
    pasteChunks(b, rng, x, y + 0.012, z, spread * 1.3, 12)
  }
}
