import { CircleGeometry, IcosahedronGeometry, LatheGeometry, PlaneGeometry, SphereGeometry, TorusGeometry, Vector2 } from 'three'
import { createRng } from '../utils/random.js'
import { soupBowl } from './squidSoupWares.js'

/**
 * 廟口豆花攤與糕粿攤共用的食品、碗盤與器具（1945–1980，飲食文化情境示意）。
 *
 * 碗沿用魷魚羹、米苔目攤的有厚度的碗（squidSoupWares.soupBowl）；這裡另外有：
 * - 豆花：米白色、薄而不規則的柔軟片狀（舀起來的一片一片，不是方形豆腐或圓球）、淡琥珀色的糖水、小小的橢圓花生粒
 * - 有厚度的瓷湯匙、有蓋的木豆花桶、扁平的舀匙、糖水壺、配料小盆
 * - 糕粿：草仔粿（深綠、扁圓、表面略有起伏）、紅龜粿（紅色扁橢圓、簡化的龜甲壓紋）、
 *   芋粿（灰白色厚片、少量紫灰色的芋頭顆粒）、蘿蔔糕（米白色長方塊：整塊與切片）
 * - 竹蒸籠、墊葉、分區木托盤、木板、食品夾、乾淨的布巾、籃筐與糕模
 *
 * 只產生幾何；不使用導演的豆花店或好粿緣的模型、招牌與包裝（現代店家的模型與外觀都不變）。
 * 流暢與精緻模式都保留每一種食物：主要的一份放在 b，額外的份數與細小的顆粒放在 detail（只在精緻模式顯示）。
 */

/** 食物的主要顏色（測試用來確認兩種畫質都保留每一種食物） */
export const SWEETS_TINTS = {
  douhua: '#ebdfbd',
  syrup: '#dcab62',
  peanut: '#c8955c',
  caoAKue: '#2e4a21',
  angKuKue: '#c8342e',
  ooKue: '#cdc4c8',
  ooKueBits: '#7a6888',
  caiTauKue: '#f2e6c4',
  leaf: '#7aa64b',
}

const PORCELAIN = '#f4f0e4'
const BLUE_RIM = '#2f5f9e'

/** 依位置決定的平滑起伏（同一個頂點在不同面上有相同的位移，表面不會裂開） */
function wobble(x, y, z, seed) {
  return Math.sin(x * 37 + seed * 1.7) * Math.sin(z * 41 - seed * 0.9) + 0.5 * Math.sin(y * 53 + x * 19 + seed)
}

/** 把幾何的每個頂點依函式位移後回傳 */
function deform(geometry, fn) {
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i++) {
    const [x, y, z] = fn(p.getX(i), p.getY(i), p.getZ(i))
    p.setXYZ(i, x, y, z)
  }
  p.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

/* ───────────── 豆花 ───────────── */

/**
 * 一片豆花：薄片、外緣不規則，中間微微下凹（像是用扁平的舀匙一片一片舀起來的柔軟豆花）。
 * r 為片的大小，t 為厚度。
 */
export function douhuaFlake(b, x, y, z, { r = 0.034, t = 0.009, seed = 1, rotationY = 0, tilt = [0, 0], tint = SWEETS_TINTS.douhua } = {}) {
  // 壓得很扁的多面球：外緣依角度起伏（不規則的輪廓），上面微微隆起、邊緣較薄，看起來柔軟（不是方塊、圓片或圓球）
  const geometry = deform(new IcosahedronGeometry(1, 3), (px, py, pz) => {
    const a = Math.atan2(pz, px)
    const edge = 1 + 0.16 * Math.sin(2 * a + seed) + 0.09 * Math.sin(3 * a - seed * 1.3)
    const d = Math.min(1, Math.hypot(px, pz))
    // 中間較厚、邊緣較薄；整片微微往上彎（像是舀起的一片）
    return [px * edge * r, py * t * 0.5 * (1 - 0.45 * d) + d * d * t * 0.5, pz * edge * r * 0.82]
  })
  b.add('plain', geometry, { position: [x, y, z], rotation: [tilt[0], rotationY, tilt[1]], tint })
}

/** 一顆花生：小小的橢圓顆粒（與片狀的豆花形狀不同） */
export function peanut(b, x, y, z, { rotationY = 0, tint = SWEETS_TINTS.peanut } = {}) {
  b.add('plain', new SphereGeometry(1, 7, 5), { position: [x, y, z], rotation: [0, rotationY, 0.25], scale: [0.0088, 0.0058, 0.0062], tint })
}

/**
 * 有厚度的瓷湯匙：匙面是有內外壁的淺碗（旋轉成形後壓成橢圓），握柄是有厚度的長條，往上翹。
 * (x, y, z) 是匙面的底部中央；rotationY 為握柄的方向。
 */
export function thickSpoon(b, x, y, z, { rotationY = 0, tint = PORCELAIN } = {}) {
  const t = 0.0035
  const points = [
    [0, 0],
    [0.012, 0],
    [0.019, 0.006],
    [0.022, 0.012],
    [0.0215, 0.0138],
    [0.022 - t, 0.012],
    [0.019 - t, 0.007],
    [0.012 - t * 0.5, t],
    [0, t],
  ].map(([px, py]) => new Vector2(px, py))
  b.group([x, y, z], rotationY, () => {
    b.add('plain', new LatheGeometry(points, 14), { position: [0, 0, 0], scale: [1, 1, 1.35], tint })
    b.box('plain', [0.011, 0.005, 0.075], [0, 0.022, 0.058], { rotation: [-0.36, 0, 0], tint })
  })
}

/**
 * 一碗豆花：有厚度的碗、淡琥珀色的糖水、幾片疊在一起的米白色豆花；peanuts 時再加一小撮花生。
 * 回傳糖水面的高度。
 */
export function douhuaBowl(b, x, y, z, { seed = 1, peanuts = false, spoon = true, detail = b } = {}) {
  const rng = createRng(seed)
  const surface = soupBowl(b, x, y, z, { radius: 0.078, height: 0.064, tint: PORCELAIN, rim: BLUE_RIM, fill: 0.72 })
  // 糖水：淡琥珀色的糖水面（中間一圈稍深，看起來有深度）
  b.cylinder('plain', surface.radius, surface.radius * 0.92, 0.006, 20, [x, surface.y - 0.003, z], { tint: SWEETS_TINTS.syrup })
  b.cylinder('plain', surface.radius * 0.55, surface.radius * 0.55, 0.001, 16, [x + 0.012, surface.y + 0.0005, z + 0.008], { tint: '#d29a4e' })
  // 豆花：大小不一的薄片，一部分露出糖水、一部分斜斜地疊著
  // 一大片與兩、三片較小的疊在碗的一側（微微傾斜），另一側露出糖水
  const flakes = peanuts ? 3 : 4
  const cx = x - 0.012
  for (let i = 0; i < flakes; i++) {
    const a = Math.PI * 0.6 + (i / flakes) * Math.PI * 0.9 + rng() * 0.4
    const d = i === 0 ? 0 : 0.018 + rng() * 0.01
    const fx = cx + Math.cos(a) * d
    const fz = z + Math.sin(a) * d
    douhuaFlake(b, fx, surface.y + 0.004 + (i === 0 ? 0.004 : (i % 2) * 0.002), fz, {
      r: i === 0 ? 0.026 : 0.016 + rng() * 0.005,
      t: 0.014 + rng() * 0.004,
      seed: seed * 7 + i,
      rotationY: rng() * Math.PI * 2,
      tilt: [(rng() - 0.5) * 0.4, (rng() - 0.5) * 0.4],
    })
  }
  if (peanuts) {
    // 花生：靠碗的一側堆成一小撮
    for (let i = 0; i < 16; i++) {
      const a = 0.4 + (rng() - 0.5) * 1.6
      const d = 0.018 + rng() * 0.03
      const target = i < 9 ? b : detail
      peanut(target, x + Math.cos(a) * d + 0.014, surface.y + 0.004 + (i % 3) * 0.003, z + Math.sin(a) * d, { rotationY: rng() * Math.PI })
    }
  }
  if (spoon) thickSpoon(b, x + 0.05, surface.y + 0.004, z + 0.02, { rotationY: 0.7 })
  return surface.y
}

/**
 * 有蓋的圓形豆花桶：木板拼成的桶身與兩道鐵箍；桶蓋往後挪開一點，露出桶裡平整的米白色豆花表面。
 * (x, y, z) 為桶底中央。
 */
export function douhuaBucket(b, x, y, z, { radius = 0.19, height = 0.34, open = 0.08 } = {}) {
  const staves = 14
  for (let i = 0; i < staves; i++) {
    const a = (i / staves) * Math.PI * 2
    const tone = i % 2 ? '#a5784c' : '#b3875a'
    b.box('wood', [(2 * Math.PI * radius) / staves + 0.004, height, 0.022], [x + Math.cos(a) * (radius - 0.011), y + height / 2, z + Math.sin(a) * (radius - 0.011)], {
      rotation: [0, -a + Math.PI / 2, 0],
      tint: tone,
    })
  }
  b.cylinder('wood', radius - 0.02, radius - 0.02, 0.02, 16, [x, y + 0.01, z], { tint: '#8f6844' })
  for (const h of [0.06, height - 0.06]) b.add('steel', new TorusGeometry(radius + 0.003, 0.006, 4, 24), { position: [x, y + h, z], rotation: [Math.PI / 2, 0, 0], tint: '#5d5a55' })
  // 桶裡的豆花表面（米白，靠近桶口）
  b.cylinder('plain', radius - 0.024, radius - 0.024, 0.01, 20, [x, y + height - 0.05, z], { tint: SWEETS_TINTS.douhua })
  // 桶蓋：木蓋與把手，往後挪開 open
  b.cylinder('wood', radius + 0.012, radius + 0.012, 0.024, 20, [x, y + height + 0.012, z - open], { tint: '#9b7048' })
  b.box('wood', [radius * 1.1, 0.03, 0.04], [x, y + height + 0.038, z - open], { tint: '#6e4c32' })
}

/** 扁平的舀匙（舀豆花用）：淺而平的圓形匙面與長柄；(x, y, z) 為匙面中央 */
export function flatScoop(b, x, y, z, { rotationY = 0, tilt = 0.25, length = 0.3 } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.cylinder('steel', 0.05, 0.048, 0.008, 18, [0, 0, 0], { tint: '#c2b28c' })
    b.add('steel', new TorusGeometry(0.05, 0.003, 4, 18), { position: [0, 0.004, 0], rotation: [Math.PI / 2, 0, 0], tint: '#a8976f' })
    b.cylinder('wood', 0.006, 0.006, length, 6, [0, Math.sin(tilt) * length * 0.5 + 0.004, 0.05 + Math.cos(tilt) * length * 0.5], { rotation: [Math.PI / 2 - tilt, 0, 0], tint: '#8a6440' })
  })
}

/** 糖水壺：圓胖的鋁壺、斜斜的壺嘴、提把與壺蓋；(x, y, z) 為壺底中央 */
export function syrupKettle(b, x, y, z, { rotationY = 0, tint = '#c7c3ba' } = {}) {
  const points = [
    [0, 0],
    [0.065, 0],
    [0.082, 0.04],
    [0.08, 0.09],
    [0.05, 0.13],
    [0.036, 0.135],
    [0, 0.135],
  ].map(([px, py]) => new Vector2(px, py))
  b.group([x, y, z], rotationY, () => {
    b.add('steel', new LatheGeometry(points, 16), { tint })
    b.cylinder('steel', 0.04, 0.04, 0.012, 12, [0, 0.14, 0], { tint: '#b4b0a7' })
    b.add('steel', new SphereGeometry(0.012, 8, 6), { position: [0, 0.152, 0], tint: '#3a3632' })
    b.cylinder('steel', 0.008, 0.015, 0.11, 8, [0.095, 0.09, 0], { rotation: [0, 0, -0.95], tint })
    b.add('steel', new TorusGeometry(0.06, 0.005, 5, 14, Math.PI), { position: [0, 0.145, 0], rotation: [0, Math.PI / 2, 0], tint: '#5d5a55' })
  })
}

/** 有厚度的琺瑯小盆（白身藍邊）；回傳盆裡的高度與半徑 */
export function smallBasin(b, x, y, z, { radius = 0.08, height = 0.05, tint = '#efece4', rim = BLUE_RIM, fill = 0.6 } = {}) {
  const r = radius
  const h = height
  const t = 0.005
  const points = [
    [0, 0],
    [r * 0.7, 0],
    [r, h],
    [r - t * 0.5, h + 0.003],
    [r - t, h],
    [r * 0.7 - t, t],
    [0, t],
  ].map(([px, py]) => new Vector2(px, py))
  b.add('plain', new LatheGeometry(points, 18), { position: [x, y, z], tint })
  b.add('plain', new TorusGeometry(r - t * 0.5, 0.003, 4, 18), { position: [x, y + h + 0.001, z], rotation: [Math.PI / 2, 0, 0], tint: rim })
  const level = t + (h - t) * fill
  return { y: y + level, radius: r * 0.7 + (r * 0.3) * (level / h) - t }
}

/** 配料小盆裡的花生（一大撮，精緻模式多一些） */
export function peanutBasin(b, x, y, z, { seed = 3, detail = b } = {}) {
  const rng = createRng(seed)
  const level = smallBasin(b, x, y, z, { radius: 0.075, height: 0.045, fill: 0.55 })
  b.cylinder('plain', level.radius, level.radius * 0.9, 0.008, 16, [x, level.y - 0.004, z], { tint: '#b78550' })
  for (let i = 0; i < 34; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * level.radius * 0.9
    peanut(i < 18 ? b : detail, x + Math.cos(a) * d, level.y + 0.003 + (1 - d / level.radius) * 0.008, z + Math.sin(a) * d, { rotationY: rng() * Math.PI })
  }
}

/** 泡著湯匙的水盆（攤販洗好的湯匙放在清水裡） */
export function spoonBasin(b, x, y, z, { detail = b } = {}) {
  const level = smallBasin(b, x, y, z, { radius: 0.07, height: 0.05, fill: 0.7 })
  b.cylinder('glassClear', level.radius, level.radius * 0.9, 0.005, 16, [x, level.y, z], { tint: '#cfe0e2' })
  for (let i = 0; i < 3; i++) thickSpoon(i ? detail : b, x - 0.02 + i * 0.02, level.y - 0.012, z - 0.012, { rotationY: 2.6 + i * 0.3 })
}

/* ───────────── 糕粿 ───────────── */

/**
 * 墊葉：橢圓形、尖頭的葉片（教育部辭典：草仔粿外墊黃槿葉或月桃葉等），中間有一條葉脈。
 * (x, y, z) 為葉片中央，length × width 為葉片大小。
 */
export function leafPad(b, x, y, z, { length = 0.12, width = 0.09, rotationY = 0, tint = SWEETS_TINTS.leaf, detail = b } = {}) {
  const geometry = deform(new CircleGeometry(0.5, 16), (px, py) => {
    // 平放：圓形 → 一端尖的葉形
    const tip = py > 0 ? 1 - py * 0.55 : 1
    return [px * tip, 0, -py]
  })
  b.add('plain', geometry, { position: [x, y + 0.002, z], rotation: [0, rotationY, 0], scale: [width, 1, length], tint })
  detail.box('plain', [0.003, 0.002, length * 0.8], [x, y + 0.004, z], { rotation: [0, rotationY, 0], tint: '#7ea35a' })
}

/** 草仔粿：深綠色、扁圓，表面略有起伏（手捏成形的痕跡）；(x, y, z) 為底部中央 */
export function caoAKue(b, x, y, z, { seed = 1, size = 1 } = {}) {
  const r = 0.052 * size
  const geometry = deform(new IcosahedronGeometry(1, 2), (px, py, pz) => {
    const f = 1 + 0.07 * wobble(px, py, pz, seed)
    const flat = py < 0 ? py * 0.35 : py
    return [px * f, flat * (1 + 0.06 * wobble(pz, px, py, seed + 2)), pz * f]
  })
  b.add('plain', geometry, { position: [x, y + r * 0.3, z], rotation: [0, seed, 0], scale: [r, r * 0.46, r * 0.9], tint: SWEETS_TINTS.caoAKue })
}

/**
 * 紅龜粿：紅色、扁橢圓（龜背形），表面是簡化的龜甲壓紋——中央一塊六角形、外圈六塊龜甲，
 * 以及印模壓出的頭尾與四足的小凸起（國立臺灣歷史博物館的粿模：「表面中央處雕刻六角形，向外延伸成龜殼紋路」）。
 * (x, y, z) 為底部中央，rotationY 為頭的方向。
 */
export function angKuKue(b, x, y, z, { rotationY = 0, size = 1 } = {}) {
  const s = size
  const red = SWEETS_TINTS.angKuKue
  const deep = '#a8261f'
  b.group([x, y, z], rotationY, () => {
    b.add('plain', new SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), { position: [0, 0.004 * s, 0], scale: [0.058 * s, 0.026 * s, 0.076 * s], tint: red })
    b.cylinder('plain', 0.058 * s, 0.058 * s, 0.008 * s, 18, [0, 0.004 * s, 0], { scale: [1, 1, 0.076 / 0.058], tint: red })
    // 中央的六角形
    b.cylinder('plain', 0.02 * s, 0.022 * s, 0.003 * s, 6, [0, 0.0305 * s, 0], { tint: deep })
    // 外圈的六塊龜甲（沿著橢圓排列）
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6
      // 外圈的龜甲貼著龜背的弧面（越往外越低），只微微凸起
      b.cylinder('plain', 0.013 * s, 0.014 * s, 0.003 * s, 6, [Math.cos(a) * 0.034 * s, 0.0255 * s, Math.sin(a) * 0.045 * s], { rotation: [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35], tint: deep })
    }
    // 頭、尾與四足（印模邊緣的小凸起）
    b.add('plain', new SphereGeometry(0.012 * s, 8, 6), { position: [0, 0.008 * s, 0.078 * s], scale: [1, 0.6, 1.2], tint: red })
    b.add('plain', new SphereGeometry(0.007 * s, 6, 4), { position: [0, 0.006 * s, -0.078 * s], scale: [1, 0.6, 1.2], tint: red })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.add('plain', new SphereGeometry(0.01 * s, 6, 4), { position: [sx * 0.055 * s, 0.006 * s, sz * 0.045 * s], scale: [1.2, 0.55, 1], tint: red })
    }
  })
}

/**
 * 芋粿：灰白色的厚片（整條切開的長方塊），切面帶少量紫灰色的芋頭顆粒。
 * (x, y, z) 為底部中央；slab 是一片的尺寸 [寬, 高, 厚]，rotation 為整片的方向。
 */
export function ooKueSlice(b, x, y, z, { size = [0.1, 0.06, 0.03], rotationY = 0, lying = false, seed = 1, detail = b } = {}) {
  const rng = createRng(seed)
  const [w, h, d] = size
  b.group([x, y, z], rotationY, () => {
    // 平放時厚度朝上
    const dims = lying ? [w, d, h] : [w, h, d]
    b.box('plain', dims, [0, dims[1] / 2, 0], { tint: SWEETS_TINTS.ooKue })
    // 芋頭顆粒：露在切面（立著時在前後兩面，平放時在上面）
    for (let i = 0; i < 7; i++) {
      const u = (rng() - 0.5) * w * 0.8
      const v = 0.15 + rng() * 0.7
      const k = 0.008 + rng() * 0.006
      const target = i < 4 ? b : detail
      if (lying) target.box('plain', [k, 0.002, k * 0.8], [u, d + 0.0005, (v - 0.5) * h * 0.8], { rotation: [0, rng(), 0], tint: SWEETS_TINTS.ooKueBits })
      else for (const side of [-1, 1]) target.box('plain', [k, k * 0.8, 0.002], [u, v * h, side * (d / 2 + 0.0005)], { tint: SWEETS_TINTS.ooKueBits })
    }
  })
}

/** 整條芋粿（還沒切的部分）：灰白色的長方塊，端面看得到芋頭顆粒 */
export function ooKueLoaf(b, x, y, z, { length = 0.14, rotationY = 0, seed = 2, detail = b } = {}) {
  const rng = createRng(seed)
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [length, 0.06, 0.1], [0, 0.03, 0], { tint: SWEETS_TINTS.ooKue })
    for (let i = 0; i < 6; i++) {
      const target = i < 3 ? b : detail
      target.box('plain', [0.002, 0.009, 0.01], [length / 2 + 0.0005, 0.01 + rng() * 0.04, (rng() - 0.5) * 0.08], { tint: SWEETS_TINTS.ooKueBits })
    }
  })
}

/**
 * 蘿蔔糕：米白色的長方塊。block 是整塊，slices 是切下來的薄片（斜斜地排開）；
 * 表面有淡淡的蘿蔔絲紋路（精緻模式）。(x, y, z) 為底部中央。
 */
export function caiTauKue(b, x, y, z, { length = 0.16, slices = 3, rotationY = 0, detail = b } = {}) {
  const tint = SWEETS_TINTS.caiTauKue
  b.group([x, y, z], rotationY, () => {
    b.box('plain', [length, 0.064, 0.1], [-0.04, 0.032, 0], { tint })
    for (let i = 0; i < 4; i++) detail.box('plain', [length * 0.8, 0.0015, 0.003], [-0.04, 0.0645, -0.032 + i * 0.022], { rotation: [0, 0.05 * (i - 1.5), 0], tint: '#dcd0b2' })
    // 切下來的薄片：平放、一片疊著一片斜斜地排開
    for (let i = 0; i < slices; i++) {
      b.box('plain', [0.06, 0.014, 0.095], [length / 2 - 0.0 + i * 0.03, 0.008 + i * 0.006, 0.01 - i * 0.004], { rotation: [0, 0.1 * i, -0.18], tint: i % 2 ? '#f5ebd0' : tint })
    }
  })
}

/* ───────────── 器具 ───────────── */

/** 竹蒸籠：幾層竹編的圓籠與蓋（籠身的竹條紋路、籠緣），(x, y, z) 為最下層的底部中央 */
export function bambooSteamer(b, x, y, z, { radius = 0.19, tiers = 3, tierHeight = 0.075, lid = true, detail = b } = {}) {
  for (let i = 0; i < tiers; i++) {
    const y0 = y + i * tierHeight
    b.cylinder('bamboo', radius, radius, tierHeight - 0.006, 18, [x, y0 + tierHeight / 2, z], { tint: i % 2 ? '#d4b77f' : '#cbae76' })
    b.add('bamboo', new TorusGeometry(radius + 0.002, 0.006, 4, 22), { position: [x, y0 + tierHeight - 0.004, z], rotation: [Math.PI / 2, 0, 0], tint: '#b8995f' })
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2
      detail.box('bamboo', [0.006, tierHeight - 0.02, 0.004], [x + Math.cos(a) * (radius + 0.001), y0 + tierHeight / 2, z + Math.sin(a) * (radius + 0.001)], { rotation: [0, -a, 0], tint: '#b3945c' })
    }
  }
  if (lid) {
    const top = y + tiers * tierHeight
    b.add('bamboo', new SphereGeometry(radius, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x, top - 0.002, z], scale: [1, 0.28, 1], tint: '#d8bd86' })
    b.add('bamboo', new TorusGeometry(radius + 0.003, 0.007, 4, 22), { position: [x, top, z], rotation: [Math.PI / 2, 0, 0], tint: '#b8995f' })
  }
  return y + tiers * tierHeight
}

/** 分區木托盤：淺木框，中間以木條隔成 sections 區；回傳托盤底面的高度 */
export function sectionTray(b, x, y, z, { width = 0.6, depth = 0.42, sections = 2, rotationY = 0, tint = '#b58858' } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [width, 0.012, depth], [0, 0.006, 0], { tint: '#c69d6b' })
    for (const s of [-1, 1]) {
      b.box('wood', [width, 0.034, 0.016], [0, 0.017, s * (depth / 2 - 0.008)], { tint })
      b.box('wood', [0.016, 0.034, depth], [s * (width / 2 - 0.008), 0.017, 0], { tint })
    }
    for (let i = 1; i < sections; i++) b.box('wood', [0.012, 0.03, depth - 0.03], [-width / 2 + (width * i) / sections, 0.015, 0], { tint })
  })
  return y + 0.012
}

/** 木板（切粿用的砧板），回傳板面的高度 */
export function woodBoard(b, x, y, z, { width = 0.3, depth = 0.2, rotationY = 0, tint = '#c9a173' } = {}) {
  b.box('wood', [width, 0.018, depth], [x, y + 0.009, z], { rotation: [0, rotationY, 0], tint })
  return y + 0.018
}

/** 食品夾：兩片細長的竹夾，尾端相連 */
export function foodTongs(b, x, y, z, { rotationY = 0 } = {}) {
  b.group([x, y, z], rotationY, () => {
    for (const s of [-1, 1]) b.box('bamboo', [0.006, 0.004, 0.2], [s * 0.012, 0.004, 0], { rotation: [0, s * 0.06, 0], tint: '#d2b47a' })
    b.box('bamboo', [0.03, 0.008, 0.016], [0, 0.005, 0.1], { tint: '#b8995f' })
  })
}

/**
 * 乾淨的布巾：蓋住部分商品的白棉布，四邊垂下、表面有幾道皺褶。
 * (x, y, z) 為布面中央（商品上方的高度），width × depth 為蓋住的範圍。
 */
export function clothCover(b, x, y, z, { width = 0.3, depth = 0.2, drop = 0.03, rotationY = 0, detail = b } = {}) {
  // 一張細分的布面：中間平鋪在粿上、微微起伏，後緣與兩側自然垂到托盤底，前緣往後折起一道
  const geometry = deform(new PlaneGeometry(width, depth, 10, 8).rotateX(-Math.PI / 2), (px, py, pz) => {
    const u = Math.abs(px) / (width / 2)
    const v = pz / (depth / 2) // -1 後緣、+1 前緣
    const side = Math.max(0, (u - 0.7) / 0.3) ** 2
    const back = Math.max(0, (-v - 0.55) / 0.45) ** 2
    const fall = Math.min(1, side + back)
    const ripple = 0.004 * Math.sin(px * 60) * Math.cos(pz * 40)
    return [px * (1 - 0.06 * fall), -drop * fall + ripple, pz - 0.01 * back]
  })
  b.group([x, y, z], rotationY, () => {
    b.add('cloth', geometry, { tint: '#f3f0e8' })
    b.box('cloth', [width * 0.96, 0.008, 0.022], [0, 0.004, depth / 2 - 0.012], { tint: '#ebe7de' })
    for (let i = 0; i < 3; i++) detail.box('cloth', [0.005, 0.004, depth * 0.5], [-width * 0.25 + i * width * 0.25, 0.004, 0.01], { rotation: [0, 0.12 * (i - 1), 0], tint: '#e2ddd2' })
  })
}

/** 竹編的圓籃（備用的籃筐），(x, y, z) 為底部中央 */
export function bambooBasket(b, x, y, z, { radius = 0.2, height = 0.12 } = {}) {
  b.cylinder('bamboo', radius, radius * 0.82, height, 16, [x, y + height / 2, z], { tint: '#c4a46c' })
  b.cylinder('bamboo', radius * 0.92, radius * 0.92, 0.006, 16, [x, y + height - 0.01, z], { tint: '#8f7346' })
  b.add('bamboo', new TorusGeometry(radius, 0.008, 4, 20), { position: [x, y + height, z], rotation: [Math.PI / 2, 0, 0], tint: '#a98a55' })
}

/**
 * 木製糕模（紅龜粿的印模）：長方形的木板，正面刻著橢圓的龜背凹槽與六角形的紋路，一端有握柄。
 * (x, y, z) 為糕模底部中央；lean 為斜靠的角度。
 */
export function kuehMold(b, x, y, z, { rotationY = 0, lean = 0 } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [0.2, 0.03, 0.14], [0, 0.015, 0], { rotation: [lean, 0, 0], tint: '#8a5e3a' })
    b.box('wood', [0.08, 0.026, 0.035], [0.13, 0.013, 0], { rotation: [lean, 0, 0], tint: '#7a5232' })
    b.cylinder('wood', 0.052, 0.052, 0.006, 16, [0, 0.03, 0], { rotation: [lean, 0, 0], scale: [1.25, 1, 0.95], tint: '#5e3f27' })
    b.cylinder('wood', 0.016, 0.016, 0.004, 6, [0, 0.033, 0], { rotation: [lean, 0, 0], tint: '#9a6e46' })
  })
}

/** 小木凳（方凳面與四支腳），(x, y, z) 為地面中央 */
export function woodStool(b, x, y, z, { top = 0.42, tint = '#9a7656', legTint = '#6c4c34', rotationY = 0 } = {}) {
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [0.3, 0.035, 0.24], [0, top - 0.018, 0], { tint })
    for (const lx of [-0.115, 0.115]) {
      for (const lz of [-0.085, 0.085]) b.box('wood', [0.032, top - 0.035, 0.032], [lx, (top - 0.035) / 2, lz], { tint: legTint })
    }
    b.box('wood', [0.24, 0.02, 0.02], [0, 0.12, 0], { tint: legTint })
  })
}
