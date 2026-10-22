import { CylinderGeometry, IcosahedronGeometry, LatheGeometry, SphereGeometry, Vector2 } from 'three'
import { createRng } from '../../utils/random.js'

/**
 * 稻舍的米食料理與餐具（RiceMealProps）
 *
 * 每道菜都拆成：碗盤（有厚度：碗口、內壁、碗底與圈足）＋主食材＋副食材＋醬汁＋配料＋表面的小細節。
 * - 白飯：凹凸的飯堆（表面高低不平、邊緣不整齊）＋散落的米粒、少量油蔥酥
 * - 控肉：肥瘦分層的肉塊（大小不一、略微傾斜）、深淺不一的醬色、醬汁的亮面、蔥花
 * - 青菜：分開的葉片與菜梗（葉片微捲、深淺綠色、不規則排列）、蒜末
 * - 豆腐：白豆腐（略微不平）、薄薄一層醬油、柴魚片與蔥末
 * - 湯：半透明的湯（玻璃材質）、浮油、蔥花、薑絲、少量食材、碗壁內側的液面
 * 主要的形體放在 b（兩種畫質都看得到），細小的米粒、蔥花、柴魚、浮油放在 detail（精緻模式才顯示）。
 * 套餐的配置有五種（mealVariants），每張桌子的狀態不同（空桌／剛上菜／用餐中／用餐後）。
 */

/* ── 碗盤：有厚度的碗（外壁、碗口、內壁、碗底與圈足） ── */

const BOWL = (r, h) =>
  [
    [0, 0],
    [r * 0.42, 0],
    [r * 0.44, h * 0.08],
    [r * 0.5, h * 0.1],
    [r * 0.82, h * 0.42],
    [r, h],
    [r * 0.94, h * 1.02],
    [r * 0.88, h * 0.94],
    [r * 0.46, h * 0.22],
    [0, h * 0.2],
  ].map(([x, y]) => new Vector2(x, y))

/** 碗的樣式：青花瓷、米白陶、淺綠釉、深色陶 */
export const BOWL_STYLES = {
  blueWhite: { body: '#eef0ef', band: '#2f5f9e' },
  cream: { body: '#efe6d3', band: '#d8c9a8' },
  celadon: { body: '#a9cfa7', band: '#8fbb8c' },
  dark: { body: '#3a2e28', band: '#5a463a' },
}

export function bowl(b, x, y, z, r, h, style = 'cream', seed = 1) {
  const s = BOWL_STYLES[style]
  const rng = createRng(seed)
  b.add('plain', new LatheGeometry(BOWL(r, h), 14), { position: [x, y, z], tint: s.body })
  // 釉面的色帶（碗口下）與細微的不均勻
  b.add('plain', new CylinderGeometry(r * 0.98, r * 0.9, h * 0.08, 14, 1, true), { position: [x, y + h * 0.86, z], tint: s.band })
  if (style === 'blueWhite') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rng() * 0.3
      b.add('plain', new IcosahedronGeometry(r * 0.08, 0), { position: [x + Math.cos(a) * r * 0.74, y + h * 0.5, z + Math.sin(a) * r * 0.74], scale: [1, 1.4, 0.3], tint: '#2f5f9e' })
    }
  }
}

/** 淺盤（有一點厚度的盤緣） */
export function plate(b, x, y, z, r, style = 'cream') {
  const s = BOWL_STYLES[style]
  b.add('plain', new LatheGeometry([[0, 0], [r * 0.6, 0], [r * 0.62, 0.006], [r, 0.022], [r * 0.97, 0.026], [r * 0.6, 0.012], [0, 0.012]].map(([px, py]) => new Vector2(px, py)), 12), { position: [x, y, z], tint: s.body })
}

/* ── 食物 ── */

/** 白飯：凹凸的飯堆＋散落的米粒（eaten 0–1：吃掉的比例） */
export function rice(b, detail, x, y, z, r, seed = 1, eaten = 0) {
  const rng = createRng(seed)
  const top = r * (0.55 - eaten * 0.45)
  if (top > 0.005) {
    // 飯堆：一個壓扁的球加上幾個小團，讓表面高低不平
    b.add('plain', new IcosahedronGeometry(r * 0.86, 1), { position: [x, y + top * 0.35, z], scale: [1, top / (r * 0.86), 1], tint: '#f5f2ea' })
    for (let i = 0; i < 7; i++) {
      const a = rng() * Math.PI * 2
      const d = rng() * r * 0.55
      detail.add('plain', new IcosahedronGeometry(r * (0.22 + rng() * 0.12), 0), { position: [x + Math.cos(a) * d, y + top * (0.55 + rng() * 0.3), z + Math.sin(a) * d], scale: [1, 0.55, 1], tint: rng() < 0.5 ? '#f8f6ef' : '#ece7da' })
    }
  }
  // 表面與碗緣的米粒（細長、方向不一）
  const grains = eaten > 0.6 ? 10 : 34
  for (let i = 0; i < grains; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * r * 0.8
    detail.add('plain', new IcosahedronGeometry(0.0045, 0), {
      position: [x + Math.cos(a) * d, y + Math.max(0.006, top * (0.9 - (d / r) * 0.6)) + 0.002, z + Math.sin(a) * d],
      rotation: [rng() * 0.6, rng() * 3, rng() * 0.6],
      scale: [2.2, 1, 1],
      tint: rng() < 0.15 ? '#e6dfcc' : '#fbfaf5',
    })
  }
  // 油蔥酥
  if (eaten < 0.3) for (let i = 0; i < 8; i++) detail.add('plain', new IcosahedronGeometry(0.005, 0), { position: [x + (rng() - 0.5) * r * 0.5, y + top * 0.95, z + (rng() - 0.5) * r * 0.5], tint: '#b9772f' })
}

/** 控肉：肥瘦分層的肉塊（大小不一）、醬汁與蔥花 */
export function braisedPork(b, detail, x, y, z, r, seed = 1, pieces = 3) {
  const rng = createRng(seed)
  // 碗底的醬汁（亮面的深褐色）
  b.cylinder('glassWarm', r * 0.82, r * 0.82, 0.008, 18, [x, y + 0.012, z], { tint: '#6a3418' })
  for (let i = 0; i < pieces; i++) {
    const a = (i / pieces) * Math.PI * 2 + rng() * 0.5
    const d = r * 0.35
    const w = 0.032 + rng() * 0.01
    const px = x + Math.cos(a) * d
    const pz = z + Math.sin(a) * d
    const ry = a + rng() * 0.6
    const tilt = (rng() - 0.5) * 0.4
    b.group([px, y + 0.02, pz], ry, () => {
      // 由下往上：豬皮（深）、肥肉（半透明的淺色）、瘦肉（醬色）、肥肉、瘦肉
      const layers = [
        [0.005, '#5a2a14'],
        [0.008, '#e8c9a0'],
        [0.009, '#7a3a1e'],
        [0.005, '#e3c095'],
        [0.008, '#8a4524'],
      ]
      let yy = 0
      for (const [lh, tint] of layers) {
        b.box('plain', [w, lh, w * 0.82], [0, yy + lh / 2, 0], { rotation: [tilt, 0, tilt * 0.5], tint })
        yy += lh
      }
      // 表面的醬汁亮面與纖維
      b.box('glassWarm', [w * 0.9, 0.003, w * 0.7], [0, yy + 0.002, 0], { rotation: [tilt, 0, tilt * 0.5], tint: '#9a5228' })
    })
    for (let k = 0; k < 3; k++) detail.box('plain', [0.022, 0.0015, 0.002], [px + (rng() - 0.5) * 0.02, y + 0.058, pz + (rng() - 0.5) * 0.02], { rotation: [0, rng() * 3, 0], tint: '#5e2c16' })
  }
  // 蔥花與青江菜的葉
  for (let i = 0; i < 10; i++) detail.add('plain', new IcosahedronGeometry(0.004, 0), { position: [x + (rng() - 0.5) * r, y + 0.062, z + (rng() - 0.5) * r], tint: '#6fae4c' })
  leaf(b, x + r * 0.55, y + 0.05, z - r * 0.2, 0.06, '#4f8f3f', 0.5)
}

/** 雞腿排：表面焦色的肉片與醬汁 */
export function chicken(b, detail, x, y, z, r, seed = 1) {
  const rng = createRng(seed)
  b.cylinder('glassWarm', r * 0.8, r * 0.8, 0.008, 16, [x, y + 0.012, z], { tint: '#7a3a18' })
  for (let i = 0; i < 4; i++) {
    const a = rng() * Math.PI * 2
    b.add('plain', new IcosahedronGeometry(0.035 + rng() * 0.01, 1), { position: [x + Math.cos(a) * r * 0.3, y + 0.035, z + Math.sin(a) * r * 0.3], scale: [1.4, 0.55, 1], rotation: [0, rng() * 3, 0], tint: i % 2 ? '#9a5126' : '#b56a32' })
  }
  for (let i = 0; i < 6; i++) detail.box('plain', [0.025, 0.002, 0.004], [x + (rng() - 0.5) * r, y + 0.06, z + (rng() - 0.5) * r], { rotation: [0, rng() * 3, 0], tint: '#4a2210' })
}

/** 一片青菜葉（壓扁、微捲的葉片） */
function leaf(b, x, y, z, size, tint, curl = 0.3) {
  b.add('plain', new SphereGeometry(size, 6, 3, 0, Math.PI * 2, 0, Math.PI * 0.4), { position: [x, y, z], scale: [1, 0.35 + curl * 0.2, 0.55], rotation: [curl, 0, 0.2], tint })
}

/** 青菜：葉片與菜梗分開、深淺綠色、不規則排列、蒜末 */
export function greens(b, detail, x, y, z, r, seed = 1) {
  const rng = createRng(seed)
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2
    const d = rng() * r * 0.5
    const px = x + Math.cos(a) * d
    const pz = z + Math.sin(a) * d
    b.group([px, y + 0.02 + i * 0.004, pz], rng() * Math.PI * 2, () => {
      b.box('plain', [0.006, 0.006, 0.07], [0, 0, 0], { tint: '#b9d68a' })
      leaf(b, 0, 0.004, 0.04, 0.03 + rng() * 0.01, rng() < 0.5 ? '#3f7f36' : '#5a9a45', 0.4 + rng() * 0.4)
    })
  }
  // 油光與蒜末
  for (let i = 0; i < 9; i++) detail.add('plain', new IcosahedronGeometry(0.0035, 0), { position: [x + (rng() - 0.5) * r, y + 0.04, z + (rng() - 0.5) * r], tint: '#f1ead2' })
}

/** 豆腐：白豆腐、薄薄的醬油、柴魚片與蔥末 */
export function tofu(b, detail, x, y, z, seed = 1) {
  const rng = createRng(seed)
  b.box('plain', [0.06, 0.035, 0.05], [x, y + 0.02, z], { rotation: [0, rng() * 0.3, 0], tint: '#f6f3e8' })
  b.cylinder('glassWarm', 0.05, 0.05, 0.004, 14, [x, y + 0.004, z], { tint: '#5a2c12' })
  for (let i = 0; i < 9; i++) detail.box('plain', [0.012, 0.002, 0.008], [x + (rng() - 0.5) * 0.04, y + 0.04, z + (rng() - 0.5) * 0.035], { rotation: [rng(), rng() * 3, rng()], tint: '#d9a868' })
  for (let i = 0; i < 6; i++) detail.add('plain', new IcosahedronGeometry(0.003, 0), { position: [x + (rng() - 0.5) * 0.04, y + 0.042, z + (rng() - 0.5) * 0.03], tint: '#6fae4c' })
}

/** 小菜（滷味、醃漬物）：幾塊大小不一的食材 */
export function sideDish(b, detail, x, y, z, kind, seed = 1) {
  const rng = createRng(seed)
  const tint = kind === 'braised' ? ['#8a5a2e', '#a8743c'] : kind === 'tomato' ? ['#c8392b', '#e0503a'] : ['#c9a65a', '#e0c070']
  for (let i = 0; i < 5; i++) {
    b.add('plain', new IcosahedronGeometry(0.014 + rng() * 0.008, kind === 'tomato' ? 1 : 0), { position: [x + (rng() - 0.5) * 0.06, y + 0.02, z + (rng() - 0.5) * 0.06], scale: [1.2, 0.8, 1], tint: tint[i % 2] })
  }
  if (kind !== 'tomato') detail.add('plain', new IcosahedronGeometry(0.004, 0), { position: [x, y + 0.035, z], tint: '#7ab35a' })
}

/** 湯盅：有蓋的白色湯盅、半透明的湯、浮油、蔥花、薑絲、液面 */
export function soup(b, detail, x, y, z, seed = 1, lidOpen = true) {
  const rng = createRng(seed)
  const r = 0.042
  b.add('plain', new LatheGeometry(BOWL(r, 0.06), 12), { position: [x, y, z], tint: '#f6f4ee' })
  b.cylinder('glassClear', r * 0.86, r * 0.84, 0.035, 16, [x, y + 0.03, z], { tint: '#d9a35a' })
  // 碗壁內側的液面（一圈薄薄的亮色）
  b.add('plain', new CylinderGeometry(r * 0.87, r * 0.87, 0.003, 16, 1, true), { position: [x, y + 0.048, z], tint: '#e8c27a' })
  for (let i = 0; i < 6; i++) detail.add('glassWarm', new CylinderGeometry(0.004, 0.004, 0.001, 8), { position: [x + (rng() - 0.5) * 0.04, y + 0.049, z + (rng() - 0.5) * 0.04], tint: '#f2c35a' })
  for (let i = 0; i < 4; i++) detail.box('plain', [0.018, 0.0015, 0.002], [x + (rng() - 0.5) * 0.03, y + 0.05, z + (rng() - 0.5) * 0.03], { rotation: [0, rng() * 3, 0], tint: '#e7d27a' })
  for (let i = 0; i < 5; i++) detail.add('plain', new IcosahedronGeometry(0.003, 0), { position: [x + (rng() - 0.5) * 0.035, y + 0.05, z + (rng() - 0.5) * 0.035], tint: '#6fae4c' })
  if (lidOpen) b.cylinder('plain', r * 1.02, r * 1.02, 0.012, 16, [x + 0.075, y + 0.006, z + 0.02], { rotation: [0.08, 0, 0], tint: '#f3f1ea' })
  else b.add('plain', new SphereGeometry(r * 1.02, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.35), { position: [x, y + 0.045, z], tint: '#f3f1ea' })
}

/** 茶杯（level：0 空杯、0.5 半杯；flip：倒扣） */
export function teaCup(b, x, y, z, { level = 0.5, flip = false, tint = '#efe9dc' } = {}) {
  if (flip) {
    b.cylinder('plain', 0.024, 0.03, 0.045, 12, [x, y + 0.0225, z], { tint })
    return
  }
  b.add('plain', new LatheGeometry(BOWL(0.03, 0.045), 10), { position: [x, y, z], tint })
  if (level > 0) b.cylinder('glassClear', 0.024, 0.02, 0.04 * level, 12, [x, y + 0.008 + 0.02 * level, z], { tint: '#b8862a' })
}

/** 筷子與筷架、紙巾 */
export function chopsticks(b, x, y, z, rotationY = 0, used = false) {
  b.group([x, y, z], rotationY, () => {
    if (!used) b.box('plain', [0.03, 0.012, 0.012], [0, 0.006, -0.06], { tint: '#d8c8a8' })
    for (const s of [-1, 1]) b.box('wood', [0.006, 0.006, 0.22], [s * 0.006, used ? 0.012 : 0.016, 0], { rotation: [used ? 0.05 : 0, s * 0.02, 0], tint: '#3a2a20' })
  })
}

/* ── 套餐 ── */

/** 套餐的五種配置：主菜、碗型與配菜略有不同 */
export const MEAL_VARIANTS = [
  { main: 'pork', mainBowl: 'blueWhite', riceBowl: 'celadon', sides: ['braised', 'tofu'], veg: true },
  { main: 'chicken', mainBowl: 'blueWhite', riceBowl: 'celadon', sides: ['tofu', 'tomato'], veg: true },
  { main: 'pork', mainBowl: 'dark', riceBowl: 'cream', sides: ['braised', 'pickle'], veg: true },
  { main: 'chicken', mainBowl: 'cream', riceBowl: 'celadon', sides: ['tomato', 'tofu'], veg: false },
  { main: 'pork', mainBowl: 'blueWhite', riceBowl: 'dark', sides: ['pickle', 'tofu'], veg: true },
]

/**
 * 木托盤上的一份套餐（WoodTray：RiceBowl、MainDish、VegetableDish、SideDishA／B、Soup、TeaCup、Chopsticks、ChopstickRest、SmallNapkin）。
 * state：served 剛上菜、eating 用餐中（飯少了、茶半杯、筷子放在碗上）、after 用餐後（空碗、收在一起）
 */
export function mealSet(b, detail, x, y, z, rotationY, variantIndex, state = 'served', seed = 1) {
  const v = MEAL_VARIANTS[variantIndex % MEAL_VARIANTS.length]
  const rng = createRng(seed)
  const eaten = state === 'eating' ? 0.45 : state === 'after' ? 1 : 0
  // 托盤的座標系同時套用在主要與細部兩個產生器上（細小的米粒、蔥花在細部）
  const ry = rotationY + (rng() - 0.5) * 0.06
  b.push([x, y, z], ry)
  if (detail !== b) detail.push([x, y, z], ry)
  const done = () => {
    b.pop()
    if (detail !== b) detail.pop()
  }
  ;(() => {
    // 木托盤（有邊框）
    b.box('woodLight', [0.42, 0.012, 0.3], [0, 0.006, 0], { tint: '#d6b382' })
    for (const s of [-1, 1]) {
      b.box('woodLight', [0.42, 0.025, 0.012], [0, 0.02, s * 0.144], { tint: '#c9a472' })
      b.box('woodLight', [0.012, 0.025, 0.3], [s * 0.204, 0.02, 0], { tint: '#c9a472' })
    }
    const t = 0.012
    if (state === 'after') {
      // 用餐後：空碗疊在一起、用過的筷子與杯子
      bowl(b, 0.06, t, 0.02, 0.06, 0.05, v.riceBowl, seed)
      bowl(b, 0.06, t + 0.04, 0.02, 0.055, 0.045, v.mainBowl, seed + 1)
      plate(b, -0.1, t, -0.05, 0.05, 'cream')
      teaCup(b, -0.12, t, 0.08, { level: 0 })
      chopsticks(b, 0.02, t + 0.01, -0.08, 1.2, true)
      return
    }
    // 白飯
    bowl(b, 0.08, t, 0.06, 0.06, 0.05, v.riceBowl, seed)
    rice(b, detail, 0.08, t + 0.012, 0.06, 0.052, seed, eaten)
    // 主菜
    bowl(b, -0.08, t, 0.04, 0.075, 0.05, v.mainBowl, seed + 2)
    if (v.main === 'pork') braisedPork(b, detail, -0.08, t + 0.01, 0.04, 0.065, seed + 3, eaten > 0 ? 2 : 3)
    else chicken(b, detail, -0.08, t + 0.01, 0.04, 0.065, seed + 3)
    // 配菜與青菜（小碟）
    const dishes = [...v.sides, ...(v.veg ? ['veg'] : [])]
    dishes.forEach((kind, i) => {
      const dx = -0.12 + i * 0.09
      const dz = -0.08
      plate(b, dx, t, dz, 0.04, i % 2 ? 'cream' : 'blueWhite')
      if (kind === 'tofu') tofu(b, detail, dx, t + 0.012, dz, seed + 10 + i)
      else if (kind === 'veg') greens(b, detail, dx, t + 0.012, dz, 0.035, seed + 20 + i)
      else sideDish(b, detail, dx, t + 0.012, dz, kind, seed + 30 + i)
    })
    // 湯盅、茶杯、筷子與筷架、紙巾
    soup(b, detail, 0.16, t, -0.08, seed + 40, state !== 'served')
    teaCup(b, 0.17, t, 0.1, { level: state === 'eating' ? 0.5 : 0.85 })
    chopsticks(b, state === 'eating' ? 0.06 : 0.19, state === 'eating' ? t + 0.06 : t, state === 'eating' ? 0.06 : 0.0, state === 'eating' ? 0.4 : 0, state === 'eating')
    b.box('cloth', [0.06, 0.004, 0.06], [-0.17, t + 0.002, 0.11], { rotation: [0, 0.3, 0], tint: '#f4f1ea' })
  })()
  done()
}

/** 空桌：茶壺、菜單與筷筒 */
export function emptyTableSet(b, x, y, z, seed = 1) {
  const rng = createRng(seed)
  b.add('plain', new LatheGeometry([[0, 0], [0.06, 0], [0.075, 0.04], [0.07, 0.08], [0.04, 0.1], [0.025, 0.11], [0, 0.11]].map(([px, py]) => new Vector2(px, py)), 14), { position: [x - 0.12, y, z], tint: '#f2efe7' })
  b.box('plain', [0.012, 0.012, 0.05], [x - 0.04, y + 0.06, z], { rotation: [0, 0, -0.5], tint: '#f2efe7' })
  b.box('plain', [0.18, 0.004, 0.25], [x + 0.1, y + 0.002, z], { rotation: [0, 0.1 + (rng() - 0.5) * 0.1, 0], tint: '#efe6d2' })
  b.cylinder('bamboo', 0.03, 0.03, 0.1, 10, [x - 0.02, y + 0.05, z + 0.12], { tint: '#b58a52' })
  for (let i = 0; i < 4; i++) b.box('wood', [0.005, 0.12, 0.005], [x - 0.02 + (i - 1.5) * 0.008, y + 0.11, z + 0.12], { rotation: [0.06 * (i - 1.5), 0, 0], tint: '#3a2a20' })
  for (let i = 0; i < 2; i++) teaCup(b, x - 0.12 + i * 0.07, y, z - 0.1, { flip: true, tint: i ? '#e9e2d2' : '#3c5f86' })
}
