import { IcosahedronGeometry, LatheGeometry, Vector2 } from 'three'
import { createRng } from '../utils/random.js'
import { plate, soupBowl } from './squidSoupWares.js'

/**
 * 米苔目的兩個年代版本共用的食品與餐具（廟口的米苔目攤、永樂米苔目）：
 * 湯米苔目（短而粗、兩端略尖的米條，浮在大骨湯上，撒上韭菜與油蔥酥）、幾樣小菜（嘴邊肉、油豆腐、菜頭、燙青菜）、
 * 醬油膏與辣椒的小醬碟、筷子，以及攤台上一盆生的米苔目。碗與盤沿用魷魚羹的有厚度的碗盤（squidSoupWares.js）。
 *
 * 所有函式都以「目前的本地座標」擺放；y 為底面高度。
 * 食品的外觀是示意（依照片與食記提到的品項），不代表配方、份量或菜單。
 */

const NOODLE = ['#f1ebdd', '#ebe3d2', '#f4efe4', '#e6ddcb']
const CHIVE = ['#4f8a3a', '#5c9a45', '#457d34']
const SHALLOT = ['#9a6532', '#87542a', '#a8743c']

/** 米苔目：短而粗、兩端略尖的米條（不是麵條，也不是圓球），散落在湯面或盆裡 */
function noodleStrands(b, rng, cx, y, cz, spread, count, { length = 0.045, radius = 0.0052, lift = 0.004 } = {}) {
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    const len = length * (0.75 + rng() * 0.5)
    // 中間粗、兩端細的旋轉體
    const half = len / 2
    const points = [
      [0, -half],
      [radius * 0.55, -half * 0.8],
      [radius, 0],
      [radius * 0.55, half * 0.8],
      [0, half],
    ].map(([px, py]) => new Vector2(px, py))
    b.add('plain', new LatheGeometry(points, 5), {
      position: [cx + Math.cos(a) * d, y + lift + rng() * 0.004, cz + Math.sin(a) * d],
      rotation: [Math.PI / 2 + (rng() - 0.5) * 0.5, (rng() - 0.5) * 0.4, rng() * Math.PI * 2],
      tint: NOODLE[i % NOODLE.length],
    })
  }
}

/** 切成小段的韭菜（綠色的細段）與油蔥酥（褐色的小碎片） */
function garnish(b, rng, cx, y, cz, spread, { chives = 10, shallots = 9 } = {}) {
  for (let i = 0; i < chives; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    b.cylinder('plain', 0.0028, 0.0028, 0.012 + rng() * 0.006, 5, [cx + Math.cos(a) * d, y + 0.007, cz + Math.sin(a) * d], {
      rotation: [Math.PI / 2, rng() * Math.PI, 0],
      tint: CHIVE[i % CHIVE.length],
    })
  }
  for (let i = 0; i < shallots; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * spread
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [cx + Math.cos(a) * d, y + 0.006, cz + Math.sin(a) * d],
      rotation: [rng() * 3, rng() * 3, rng() * 3],
      scale: [0.005 + rng() * 0.003, 0.0018, 0.004 + rng() * 0.002],
      tint: SHALLOT[i % SHALLOT.length],
    })
  }
}

/**
 * 湯米苔目：碗裡淡琥珀色的大骨湯、浮在湯面的米苔目、韭菜與油蔥酥。
 * bowl：碗的樣式（例如永樂米苔目的深色碗、廟口攤位的藍邊白瓷碗）。
 */
export function miTaiMuSoup(b, x, y, z, { seed = 1, bowl = {}, broth = '#d9b98a', strands = 20 } = {}) {
  const rng = createRng(seed)
  const soup = soupBowl(b, x, y, z, { radius: 0.082, height: 0.07, fill: 0.8, ...bowl })
  b.cylinder('plain', soup.radius, soup.radius, 0.004, 18, [x, soup.y, z], { tint: broth })
  // 湯面上一點點油光
  for (let i = 0; i < 4; i++) {
    const a = rng() * Math.PI * 2
    const d = rng() * soup.radius * 0.6
    b.cylinder('plain', 0.007 + rng() * 0.005, 0.007, 0.0012, 8, [x + Math.cos(a) * d, soup.y + 0.0024, z + Math.sin(a) * d], { tint: '#e8cb92' })
  }
  noodleStrands(b, rng, x, soup.y, z, soup.radius * 0.7, strands)
  garnish(b, rng, x, soup.y + 0.004, z, soup.radius * 0.55, strands < 16 ? { chives: 6, shallots: 5 } : undefined)
  return soup
}

/** 嘴邊肉：淺盤上的薄片（粉褐色、外緣較深），上面放著薑絲、淋一點醬油膏 */
export function porkCheek(b, x, y, z, { seed = 2, plateTint = '#f6f3ea', rim = null, radius = 0.085 } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius, tint: plateTint, rim })
  const top = dish.y
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng() * 0.3
    const d = 0.018 + rng() * 0.022
    const px = x + Math.cos(a) * d
    const pz = z + Math.sin(a) * d
    const yaw = a + Math.PI / 2 + (rng() - 0.5) * 0.4
    b.box('plain', [0.036, 0.006, 0.022], [px, top + 0.005 + (i % 3) * 0.003, pz], { rotation: [(rng() - 0.5) * 0.3, yaw, (rng() - 0.5) * 0.3], tint: ['#d9a58e', '#cf9a82', '#e0b09a'][i % 3] })
    b.box('plain', [0.036, 0.0015, 0.004], [px, top + 0.0085 + (i % 3) * 0.003, pz], { rotation: [0, yaw, 0], tint: '#a86a52' })
  }
  // 薑絲與醬油膏
  for (let i = 0; i < 9; i++) {
    b.cylinder('plain', 0.0015, 0.0015, 0.024, 4, [x + (rng() - 0.5) * 0.03, top + 0.017, z + (rng() - 0.5) * 0.03], { rotation: [Math.PI / 2, rng() * Math.PI, 0], tint: '#e8cf7a' })
  }
  for (let i = 0; i < 4; i++) {
    b.add('plain', new IcosahedronGeometry(1, 0), { position: [x + (rng() - 0.5) * 0.04, top + 0.016, z + (rng() - 0.5) * 0.04], scale: [0.01, 0.0025, 0.007], rotation: [0, rng() * 3, 0], tint: '#5a3420' })
  }
  return { y: top }
}

/** 油豆腐：炸成金褐色的豆腐塊，有的切開露出白色的內面，盤底一點醬汁 */
export function friedTofu(b, x, y, z, { seed = 3, plateTint = '#f6f3ea', rim = null, radius = 0.085 } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius, tint: plateTint, rim })
  const top = dish.y
  b.cylinder('plain', radius * 0.55, radius * 0.55, 0.0015, 12, [x, top + 0.001, z], { tint: '#8a5a32' })
  const spots = [[-0.025, -0.018], [0.022, -0.02], [-0.018, 0.024], [0.026, 0.02], [0.0, 0.0]]
  spots.forEach(([px, pz], i) => {
    const yaw = rng() * Math.PI
    const s = 0.026 + rng() * 0.004
    b.box('plain', [s, s * 0.9, s], [x + px, top + s * 0.45 + (i === 4 ? 0.012 : 0), z + pz], { rotation: [0, yaw, i === 4 ? 0.4 : 0], tint: ['#c98a3c', '#bf7f34', '#d39648'][i % 3] })
    if (i % 2 === 0) b.box('plain', [s * 0.82, 0.002, s * 0.82], [x + px, top + s * 0.9 + 0.001 + (i === 4 ? 0.012 : 0), z + pz], { rotation: [0, yaw, i === 4 ? 0.4 : 0], tint: '#f1e7cf' })
  })
  return { y: top }
}

/** 菜頭（滷白蘿蔔）：淡琥珀色的厚圓塊 */
export function daikon(b, x, y, z, { seed = 4, plateTint = '#f6f3ea', rim = null, radius = 0.085 } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius, tint: plateTint, rim })
  const top = dish.y
  for (const [px, pz, k] of [[-0.022, -0.012, 0], [0.024, -0.008, 1], [0.0, 0.026, 2]]) {
    b.cylinder('plain', 0.024, 0.024, 0.024, 12, [x + px, top + 0.013 + k * 0.002, z + pz], { rotation: [(rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3], tint: ['#e7cf9d', '#dcc08a', '#ead6a8'][k] })
  }
  return { y: top }
}

/** 燙青菜：綠色的菜葉、淋上醬油膏與油蔥酥 */
export function blanchedGreens(b, x, y, z, { seed = 5, plateTint = '#f6f3ea', rim = null, radius = 0.085 } = {}) {
  const rng = createRng(seed)
  const dish = plate(b, x, y, z, { radius, tint: plateTint, rim })
  const top = dish.y
  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * 0.045
    b.add('plain', new IcosahedronGeometry(1, 0), {
      position: [x + Math.cos(a) * d, top + 0.005 + rng() * 0.012, z + Math.sin(a) * d],
      rotation: [rng() * 0.5, rng() * Math.PI, rng() * 0.5],
      scale: [0.02 + rng() * 0.008, 0.003, 0.01 + rng() * 0.004],
      tint: ['#3f7a33', '#4f8a3a', '#5c9a45'][i % 3],
    })
  }
  for (let i = 0; i < 5; i++) b.cylinder('plain', 0.002, 0.002, 0.04, 4, [x + (rng() - 0.5) * 0.05, top + 0.01, z + (rng() - 0.5) * 0.05], { rotation: [Math.PI / 2, rng() * Math.PI, 0], tint: '#9cc27a' })
  garnish(b, rng, x, top + 0.014, z, 0.03, { chives: 0, shallots: 7 })
  return { y: top }
}

/** 小醬碟：醬油膏與一點辣椒 */
export function sauceDish(b, x, y, z, { tint = '#f6f3ea' } = {}) {
  const points = [
    [0, 0],
    [0.02, 0],
    [0.032, 0.012],
    [0.03, 0.013],
    [0.018, 0.004],
    [0, 0.004],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('plain', new LatheGeometry(points, 12), { position: [x, y, z], tint })
  b.cylinder('plain', 0.019, 0.019, 0.002, 10, [x, y + 0.006, z], { tint: '#4a2a1a' })
  for (const [dx, dz] of [[0.006, 0.004], [-0.005, -0.003]]) b.cylinder('plain', 0.004, 0.004, 0.002, 6, [x + dx, y + 0.0075, z + dz], { tint: '#c4301f' })
}

/** 一雙筷子（平放在桌上，朝 rotationY 方向） */
export function chopsticks(b, x, y, z, { rotationY = 0, tint = '#c9a46e' } = {}) {
  b.group([x, y, z], rotationY, () => {
    for (const dx of [-0.007, 0.007]) b.cylinder('wood', 0.0035, 0.0028, 0.22, 4, [dx, 0.004, 0], { rotation: [Math.PI / 2, 0, 0], tint })
  })
}

/** 攤台上一盆生的米苔目（鋁盆裡堆著白色的米條） */
export function noodleBasin(b, x, y, z, { seed = 6, radius = 0.15 } = {}) {
  const rng = createRng(seed)
  const points = [
    [0, 0],
    [radius * 0.75, 0],
    [radius, 0.07],
    [radius + 0.006, 0.074],
    [radius - 0.006, 0.072],
    [radius * 0.75 - 0.006, 0.006],
    [0, 0.006],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('steel', new LatheGeometry(points, 18), { position: [x, y, z], tint: '#d3d6d4' })
  // 堆起來的米苔目：底下一層淺色的堆，上面散著一根一根的米條
  b.add('plain', new IcosahedronGeometry(1, 1), { position: [x, y + 0.04, z], scale: [radius * 0.78, 0.035, radius * 0.78], tint: '#ebe4d4' })
  noodleStrands(b, rng, x, y + 0.062, z, radius * 0.6, 26, { lift: 0.004 })
}

/** 一張桌上客人的位子：一碗米苔目、一雙筷子與一碟小菜（桌子中央的本地座標；客人坐在 +z 那一側時 facing 為 1） */
export function dinerPlace(b, x, y, z, { facing = 1, seed = 7, bowl = {}, plateTint = '#f6f3ea', side = 'tofu', utensils = true } = {}) {
  const f = facing
  miTaiMuSoup(b, x, y, z + f * 0.08, { seed, bowl, strands: 11 })
  // 有人坐著吃的位子：筷子在客人的手上，桌上只放碗與小菜
  if (utensils) chopsticks(b, x + 0.11, y, z + f * 0.1, { rotationY: 0.15 })
  const dish = { tofu: friedTofu, greens: blanchedGreens, cheek: porkCheek, daikon }[side] ?? friedTofu
  dish(b, x - 0.1, y, z - f * 0.06, { seed: seed + 1, plateTint, radius: 0.07 })
}
