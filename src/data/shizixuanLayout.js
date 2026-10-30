/**
 * 十字軒糕餅舖（延平北路二段68號）的位置、尺寸、各年代的空間、家具與資訊熱點
 *
 * 地段：迪化街北側 north-2／north-3 這兩塊一般地段（原本就是街屋，不是重新切分地段），
 * 用 shop.site 取代：1930 只取代 north-3（窄面寬，單一店面）；1945、2000 取代 north-2 與 north-3（兩個店面寬）。
 * 建築本地座標：原點在一樓店面線的中央地面，+z 朝延平北路（騎樓在 z 0 – 1.7），室內在 -z；
 * 從街上正對立面時，+x 是右手邊。尺寸依照片與一般店屋比例估算，並非測量。
 */
import { SHIZIXUAN_ID } from './shizixuanEraConfig.js'

export { SHIZIXUAN_ID }

/** 1930：只取代 north-3（窄面寬，單一店面） */
export const EARLY_SITE = { x: -12.1, z: -4.5, rotationY: 0, replaces: ['north-3'] }
/** 1945、2000：取代 north-2 與 north-3（兩個店面寬） */
export const WIDE_SITE = { x: -14.4, z: -4.5, rotationY: 0, replaces: ['north-2', 'north-3'] }

/** 本地座標 → 世界座標（北側地段：rotationY 一律是 0，不旋轉） */
export function szxToWorld(site, x, z) {
  const c = Math.cos(site.rotationY ?? 0)
  const s = Math.sin(site.rotationY ?? 0)
  return { x: site.x + x * c + z * s, z: site.z - x * s + z * c }
}

const box = (minX, maxX, minZ, maxZ, height = 1) => ({ minX, maxX, minZ, maxZ, height })

/* ═══════════ 1930–1945：十字軒（糕餅店初創） ═══════════ */

export const EARLY = {
  half: 2.3, // 面寬 4.6 m（north-3 單一店面）
  depth: 9.0,
  wallT: 0.2,
  arcade: 1.7,
  ceiling: 2.9,
  door: { minX: -0.65, maxX: 0.65, height: 2.3 },
  front: box(-2.0, 2.0, -4.1, -0.2),
  partitionDoor: { minX: -0.5, maxX: 0.5, height: 2.1 },
  back: box(-2.0, 2.0, -8.3, -4.5),
  counter: box(0.9, 2.0, -1.4, -0.5, 0.95),
  shelf: box(-2.0, -1.55, -4.0, -0.6, 1.5),
  workbench: box(-1.5, 1.5, -7.8, -5.1, 0.85),
}

/* ═══════════ 1945–1980：十字軒餅舖（戰後） ═══════════ */

export const POSTWAR = {
  half: 4.6, // 面寬 9.2 m（north-2 ＋ north-3）
  depth: 9.4,
  wallT: 0.2,
  arcade: 1.7,
  ceiling: 3.0,
  door: { minX: -1.0, maxX: 1.0, height: 2.5 },
  front: box(-4.2, 4.2, -5.8, -0.2),
  skylight: box(-1.0, 1.0, -6.6, -5.9),
  back: box(-4.2, 4.2, -9.2, -6.8),
  counter: box(1.5, 3.8, -1.7, -0.6, 0.95),
  shelf: box(-4.2, -3.55, -5.6, -0.8, 1.6),
  cabinet: box(1.6, 4.0, -5.0, -2.2, 1.3),
}

/* ═══════════ 2000–現在：十字軒糕餅舖（延平北路二段68號，依實拍照片） ═══════════ */

/**
 * 三層樓、平屋頂、淡米黃小磁磚立面；樓上立面懸挑到騎樓外緣（z = arcade），一樓店面退在 z = 0。
 * 兩個開間（中央一道柱）：左開間一樓是展示窗，右開間是入口。室內是一整間現代糕餅店。
 */
export const MODERN = {
  half: 4.6, // 面寬 9.2 m（兩個開間）
  depth: 10.0,
  wallT: 0.2,
  arcade: 1.7,
  groundH: 3.4, // 二樓樓板頂
  upperH: 3.0,
  floors: 3,
  parapet: 0.6,
  arcadeCeiling: 2.55, // 騎樓天花（招牌盒在它上方）
  ceiling: 3.0, // 一樓室內天花
  pier: 0.6, // 中央柱寬
  endPier: 0.42,
  door: { minX: 0.8, maxX: 2.8, height: 2.7 },
  sideLight: { minX: 3.0, maxX: 4.2, minY: 0.5, maxY: 2.9 },
  showWindow: { minX: -4.15, maxX: -0.55, minY: 0.45, maxY: 2.9 },
  front: box(-4.2, 4.2, -9.6, -0.2),
  /** 室內家具（依實拍：入口 → 中央島 → 兩側商品 → 櫃台 → 歷史與獎狀展示） */
  windowCounter: box(-4.15, -0.75, -1.05, -0.35, 0.9),
  island: box(-0.5, 1.6, -5.0, -3.0, 0.95),
  rightShelf: box(3.65, 4.2, -8.4, -1.6, 2.3),
  counter: box(-3.3, -2.2, -8.6, -5.6, 1.0),
  glassCase: box(-2.15, -1.55, -8.4, -5.8, 1.05),
  certShelf: box(-4.2, -3.85, -9.6, -4.6, 2.6),
  productWall: box(-1.6, 4.2, -9.6, -9.1, 2.1),
  ritualStand: box(-1.2, 3.2, -9.1, -8.7, 0.85),
}

/** 五個文化節點共用的展示位置（相對於各年代的展示架／展示櫃前緣，依序：滿月、收涎、婚嫁、祝壽、祭祀） */
export const CULTURE_SLOTS = {
  earlyShop: [
    [-1.75, -0.9],
    [-1.75, -1.7],
    [-1.75, -2.5],
    [-1.75, -3.3],
    [-1.75, -3.9],
  ],
  postwarShop: [
    [-3.95, -1.2],
    [-3.95, -2.4],
    [-3.95, -3.6],
    [-3.95, -4.6],
    [-3.95, -5.4],
  ],
  // 後牆「生命禮俗」展板下方的展台上
  modernShop: [
    [-0.75, -8.9],
    [0.15, -8.9],
    [1.05, -8.9],
    [1.95, -8.9],
    [2.85, -8.9],
  ],
}

/* ═══════════ 資訊熱點（各年代） ═══════════ */

const CULTURE_META = [
  { id: 'man-yue', title: '滿月', titleEn: 'Full-month celebration', note: '彌月紅圓', noteEn: 'Red full-month rice balls', chapter: 'culture-man-yue' },
  { id: 'shou-yan', title: '收涎', titleEn: 'Drool-collecting rite', note: '收瀾鹹光餅', noteEn: 'Salty guangbing biscuits for the drool-collecting rite', chapter: 'culture-shou-yan' },
  { id: 'hun-jia', title: '婚嫁', titleEn: 'Weddings', note: '訂婚喜餅', noteEn: 'Engagement cakes', chapter: 'culture-hun-jia' },
  { id: 'zhu-shou', title: '祝壽', titleEn: 'Birthdays', note: '做壽壽桃', noteEn: 'Longevity peach buns for birthdays', chapter: 'culture-zhu-shou' },
  { id: 'ji-si', title: '祭祀', titleEn: 'Worship', note: '祭祀紅龜粿', noteEn: 'Red-tortoise kueh for offerings', chapter: 'culture-ji-si' },
]

function cultureHotspots(variant) {
  const slots = CULTURE_SLOTS[variant]
  return CULTURE_META.map((meta, i) => {
    const [x, z] = slots[i]
    // 1930、1945 的節點在左牆的展示架上（從右側看）；2000 的節點在後牆的展台上（從前方看）
    const facingBack = variant === 'modernShop'
    const point = facingBack ? [x, z + 0.8] : [x + 0.5, z]
    const camera = facingBack ? { position: [x + 0.25, 1.55, z + 1.7], target: [x, 1.0, z] } : { position: [x + 0.85, 1.55, z + 0.15], target: [x, 1.2, z] }
    return {
      id: `szx-${meta.id}`,
      label: meta.title,
      labelEn: meta.titleEn,
      note: meta.note,
      noteEn: meta.noteEn,
      chapter: meta.chapter,
      point,
      level: 0,
      radius: 0.55,
      prompt: facingBack ? [x, 1.45, z + 0.1] : [x + 0.4, 1.4, z],
      camera,
    }
  })
}

export const SZX_HOTSPOTS = {
  earlyShop: [
    { id: 'szx-front', label: '十字軒（糕餅店）', labelEn: 'Shizixuan (pastry shop)', note: '窄身街屋的糕餅店', noteEn: 'A pastry shop in a narrow shophouse', chapter: 'szx-intro', point: [0, -0.9], level: 0, radius: 1.0, prompt: [0, 2.6, -0.2], camera: { position: [-1.4, 1.7, 3.6], target: [0, 1.7, -0.6] } },
    { id: 'szx-counter', label: '西點與漢餅', labelEn: 'Western pastries and Han-style cakes', note: '帳桌與糕餅', noteEn: 'Account table and pastries', chapter: 'szx-products', point: [1.4, -0.9], level: 0, radius: 0.7, prompt: [1.6, 1.7, -0.6], camera: { position: [0.1, 1.55, 0.6], target: [1.6, 1.0, -0.9] } },
    ...cultureHotspots('earlyShop'),
  ],
  postwarShop: [
    { id: 'szx-front', label: '十字軒餅舖', labelEn: 'Shizixuan Cake Shop', note: '戰後的漢餅店', noteEn: 'A postwar Han-style cake shop', chapter: 'szx-intro', point: [0, -0.9], level: 0, radius: 1.0, prompt: [0, 2.7, -0.2], camera: { position: [-1.8, 1.8, 4.6], target: [0, 1.8, -0.6] } },
    { id: 'szx-counter', label: '漢餅與壽桃', labelEn: 'Han-style cakes and longevity peach buns', note: '木製餅櫃與紙盒', noteEn: 'Wooden cake cabinets and paper boxes', chapter: 'szx-products', point: [2.6, -1.2], level: 0, radius: 0.8, prompt: [2.8, 1.7, -0.9], camera: { position: [0.6, 1.55, 0.6], target: [2.8, 1.0, -1.2] } },
    ...cultureHotspots('postwarShop'),
  ],
  modernShop: [
    { id: 'szx-front', label: '十字軒糕餅舖', labelEn: 'Shizixuan Pastry Shop', note: '延平北路的老字號', noteEn: 'A long-established shop on Yanping North Road', chapter: 'szx-intro', point: [1.8, 1.0], level: 0, radius: 1.1, prompt: [1.8, 2.3, 1.2], camera: { position: [0.8, 2.6, 6.8], target: [0, 4.6, 0.6] } },
    { id: 'szx-checkout', label: '櫃台與糕餅托盤', labelEn: 'Counter and pastry trays', note: '金元寶與壽桃', noteEn: 'Gold-ingot cakes and longevity peach buns', chapter: 'szx-products', point: [-0.9, -7.0], level: 0, radius: 0.75, prompt: [-1.9, 1.7, -7.0], camera: { position: [0.2, 1.65, -6.0], target: [-2.2, 1.0, -7.2] } },
    { id: 'szx-history', label: '老照片與獎狀', labelEn: 'Old photographs and certificates', note: '歷史展示牆', noteEn: 'Historical display wall', chapter: 'szx-history', point: [-1.1, -5.4], level: 0, radius: 0.8, prompt: [-3.0, 2.2, -5.2], camera: { position: [-0.75, 1.7, -5.3], target: [-4.1, 1.6, -6.4] } },
    ...cultureHotspots('modernShop'),
  ],
}
