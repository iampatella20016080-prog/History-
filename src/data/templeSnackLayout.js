/**
 * 1945–1980「庶民生活」：慈聖宮廟口小吃區的傳統豆花攤與傳統糕粿攤（飲食文化情境示意，不是特定的店家）
 *
 * 廟口小吃區在這個年代有四攤可以辨識的攤位：前緣的米苔目攤（東）與魷魚羹攤（西），
 * 以及廟埕後段、天公爐兩側的豆花攤（西）與糕粿攤（東）——後兩者取代這個年代原本在榕樹後方的兩個一般小吃攤（亂數順序不變），
 * 位置在榕樹的樹幹與天公爐之間，從廟埕前緣看得到（不被樹幹與石座擋住）；
 * 共用桌椅集中在中央通道西側的用餐區（TEMPLE_DINING）。
 *
 * 兩攤只以食物主題連結 2000–現在的導演的豆花店與永樂市場的好粿緣（同類食物的參訪對照）：
 * 不使用兩家現代店家的店名、商標或裝潢，也不表示現代店家由這些攤位發展而來；
 * 展示在 1945–1980 不代表這些食物起源於1945年，也不表示慈聖宮當時已有這兩攤（沒有找到這樣的史料）。
 *
 * 位置、朝向、攤台與器具的配置、碰撞、榕樹下讓出的空間、人物與資訊熱點都在這裡定義一次，
 * 店家資料與攤位的產生器（builders/templeDouhuaStall.js、builders/templeKuehStall.js）都從這裡取用。
 * 尺寸依一般的推車式甜食攤、矮桌式糕粿攤的比例估算，並非測量。
 */
import { TEMPLE_COURT, templeCourtToWorld } from './squidSoupLayout.js'

/**
 * 飲食主題（沿用店家資料的 theme 欄位）：versions 是這個主題在各年代的攤位，
 * related 是同類食物的現代店家——只是參訪對照，沒有品牌傳承關係，現代店家的資料與場景都不變。
 */
export const DOUHUA_THEME = {
  id: 'douhua',
  title: '豆花甜食文化', titleEn: 'Douhua and sweet-treat food culture',
  versions: { postwar: 'temple-douhua-stall' },
  related: [{ eraId: 'revival', shopId: 'action-bar', relation: '同類食物的參訪對照，沒有品牌傳承關係', relationEn: 'A comparison visit to a similar food, with no brand lineage between them' }],
}

export const KUEH_THEME = {
  id: 'kueh',
  title: '糕粿米食文化', titleEn: 'Kueh and rice-food culture',
  versions: { postwar: 'temple-kueh-stall' },
  related: [{ eraId: 'revival', shopId: 'hao-guo-yuan', relation: '同類食物的參訪對照，沒有品牌傳承關係', relationEn: 'A comparison visit to a similar food, with no brand lineage between them' }],
}

/**
 * 攤位在廟埕裡的座標框：court 為攤台正面（客人那一側）中央在廟埕本地座標的位置，
 * rotation 為攤位相對於廟埕的旋轉（攤位本地 +z 是客人那一側）。
 * 回傳攤位本地座標 → 世界座標的換算與建築產生器用的 site。
 */
function courtFrame(court, rotation) {
  const c = Math.cos(rotation)
  const s = Math.sin(rotation)
  const toCourt = (x, z) => ({ x: court.x + x * c + z * s, z: court.z - x * s + z * c })
  const toWorld = (x, z) => {
    const p = toCourt(x, z)
    return templeCourtToWorld(p.x, p.z)
  }
  const origin = toWorld(0, 0)
  return { toCourt, toWorld, site: { x: origin.x, z: origin.z, rotationY: TEMPLE_COURT.rotationY + rotation, replaces: [] } }
}

/* ═══════════ 傳統豆花攤：木框推車式的甜食攤（廟埕西側的後段，天公爐與榕樹之間） ═══════════ */

/**
 * 廟口四個攤位（魷魚羹、米苔目、豆花、糕粿）的店家標記高度：放在廟埕兩棵榕樹的樹冠（約 2.5–5.1 公尺）上方，
 * 原本在 3.1–3.7 公尺，整顆藏在樹葉裡（畫面審查）
 */
export const TEMPLE_STALL_MARKER_Y = 6.0

/**
 * 攤位本地座標：原點在推車正面（客人那一側）中央的地面，+z 朝廟埕中央的通道，+x 沿著推車朝迪化街；
 * 推車背面到廟埕西側的矮牆之間是攤販操作的空間。
 */
export const DOUHUA_STALL = {
  court: { x: 3.0, z: -4.7 },
  rotation: -Math.PI / 2,
  /** 木框推車：長 1.24 m、深 0.58 m，檯面高 0.8 m；兩個木輪在靠迪化街的一端，另一端是腳架與推把 */
  cart: { half: 0.62, depth: 0.58, height: 0.8 },
  wheel: { x: 0.3, radius: 0.27 },
  handle: { from: -0.62, to: -0.98, height: 0.72 },
  /** 小型遮棚：推車背面兩根木柱撐起的米白布棚（往客人那一側伸出） */
  canopy: { half: 0.74, back: -0.66, front: 0.34, height: 1.98 },
  /** 米白布幌：掛在遮棚前緣靠迪化街的那一角，直寫「豆花」 */
  banner: { x: 0.6, width: 0.24, height: 0.62 },
  /** 推車上（攤位本地座標）：有蓋的豆花桶、糖水壺、配料小盆、疊碗與展示的兩碗豆花 */
  bucket: { x: -0.34, z: -0.3, radius: 0.19, height: 0.34 },
  kettle: { x: -0.03, z: -0.42 },
  peanuts: { x: 0.33, z: -0.4 },
  spoons: { x: 0.5, z: -0.4 },
  bowls: [
    { id: 'plain', x: -0.06, z: -0.13 },
    { id: 'peanut', x: 0.16, z: -0.13 },
  ],
  stack: { x: 0.47, z: -0.14 },
  /** 兩張木凳：推車前、靠迪化街的那一端（靠近廟埕的共用桌椅，不擋中央通道） */
  stools: [
    { x: 0.32, z: 0.55 },
    { x: 0.82, z: 0.52 },
  ],
  /** 西側榕樹在這個年代讓出遮棚的空間（廟埕本地座標） */
  clearing: { minX: 2.15, maxX: 5.0, minZ: -5.8, maxZ: -3.55, top: 2.2 },
}

const DOUHUA_FRAME = courtFrame(DOUHUA_STALL.court, DOUHUA_STALL.rotation)

/** 豆花攤：攤位本地座標 → 世界座標 */
export const douhuaStallToWorld = DOUHUA_FRAME.toWorld
/** 豆花攤：攤位本地座標 → 廟埕本地座標 */
export const douhuaStallToCourt = DOUHUA_FRAME.toCourt
export const DOUHUA_STALL_SITE = DOUHUA_FRAME.site

/** 攤販（情境人物，沒有名字或身分）：站在推車後方舀豆花 */
export const DOUHUA_STALL_NPCS = [{ id: 'vendor', look: 'postwarDouhuaVendor', pose: 'ladle', x: -0.2, z: -0.95, rotationY: 0.1 }]

/**
 * 資訊熱點（攤位本地座標）：
 * - stall：推車前（客人那一側）→「豆花與甜食攤」
 * - bowls：只能點選（推車上展示的兩碗豆花）→「兩碗豆花」
 */
export const DOUHUA_STALL_HOTSPOTS = [
  {
    id: 'stall',
    label: '廟口的豆花攤', labelEn: 'Temple-front douhua stall',
    note: '飲食文化情境示意', noteEn: 'Illustrative food-culture scene',
    chapter: 'douhua-stall',
    point: [0.05, 1.05],
    level: 0,
    radius: 1.35,
    prompt: [0, 2.45, 0.2],
    camera: { position: [1.9, 1.95, 3.3], target: [-0.05, 1.0, -0.25] },
  },
  {
    id: 'bowls',
    label: '兩碗豆花', labelEn: 'Two bowls of douhua',
    note: '推車上展示的原味糖水豆花與花生豆花（示意）', noteEn: 'Plain syrup douhua and peanut douhua displayed on the cart (illustrative)',
    chapter: 'douhua-bowls',
    clickOnly: true,
    point: [0.05, 0.4],
    level: 0,
    radius: 0,
    prompt: [0.05, 1.45, -0.13],
    camera: { position: [0.45, 1.42, 0.85], target: [0.05, 0.86, -0.13] },
  },
]

/* ═══════════ 傳統糕粿攤：低矮木桌式的糕粿攤（廟埕東側的後段，天公爐與榕樹之間） ═══════════ */

/**
 * 攤位本地座標：原點在矮桌正面（客人那一側）中央的地面，+z 朝廟埕中央的通道，+x 沿著矮桌朝廟門；
 * 桌後是攤販、備用的籃筐與糕模，再後面是廟埕東側的矮牆。
 */
export const KUEH_STALL = {
  court: { x: -3.0, z: -4.6 },
  rotation: Math.PI / 2,
  /** 低矮的木桌：寬 1.64 m、深 0.7 m，桌面高 0.62 m（兩組木架腳） */
  table: { half: 0.82, depth: 0.7, height: 0.62 },
  /** 木製橫牌「傳統糕粿」：桌子背面兩根木柱撐起 */
  sign: { width: 1.16, height: 0.3, y: 1.92, z: -0.76, posts: 0.66 },
  /** 桌上（攤位本地座標）：竹蒸籠、分區木托盤（草仔粿、紅龜粿）、芋粿與蘿蔔糕的木板 */
  steamer: { x: -0.6, z: -0.36, radius: 0.19, tiers: 3 },
  tray: { x: -0.06, z: -0.3, width: 0.64, depth: 0.44 },
  ooKue: { x: 0.44, z: -0.2, width: 0.3, depth: 0.2 },
  caiTau: { x: 0.47, z: -0.5, width: 0.32, depth: 0.2 },
  /** 桌後：少量備用的籃筐與糕模 */
  baskets: { x: 0.72, z: -1.12 },
  molds: { x: -0.72, z: -1.1 },
  /** 東側榕樹在這個年代讓出橫牌的空間（廟埕本地座標） */
  clearing: { minX: -5.0, maxX: -2.15, minZ: -5.7, maxZ: -3.45, top: 2.2 },
}

const KUEH_FRAME = courtFrame(KUEH_STALL.court, KUEH_STALL.rotation)

/** 糕粿攤：攤位本地座標 → 世界座標 */
export const kuehStallToWorld = KUEH_FRAME.toWorld
/** 糕粿攤：攤位本地座標 → 廟埕本地座標 */
export const kuehStallToCourt = KUEH_FRAME.toCourt
export const KUEH_STALL_SITE = KUEH_FRAME.site

/** 攤販（情境人物，沒有名字或身分）：站在矮桌後方招呼客人 */
export const KUEH_STALL_NPCS = [{ id: 'vendor', look: 'postwarKuehVendor', pose: 'wave', x: 0.1, z: -1.0, rotationY: -0.1 }]

/**
 * 資訊熱點（攤位本地座標）：
 * - stall：矮桌前（客人那一側）→「糕粿與日常／節慶米食」
 * - trays：只能點選（托盤與木板上的四種米食）→「四種傳統米食」
 */
export const KUEH_STALL_HOTSPOTS = [
  {
    id: 'stall',
    label: '廟口的糕粿攤', labelEn: 'Temple-front kueh stall',
    note: '飲食文化情境示意', noteEn: 'Illustrative food-culture scene',
    chapter: 'kueh-stall',
    point: [0, 1.05],
    level: 0,
    radius: 1.35,
    prompt: [0, 2.6, 0.1],
    camera: { position: [-1.8, 1.9, 3.2], target: [0.05, 0.85, -0.3] },
  },
  {
    id: 'trays',
    label: '四種傳統米食', labelEn: 'Four traditional rice foods',
    note: '托盤與木板上的草仔粿、紅龜粿、芋粿與蘿蔔糕（示意）', noteEn: 'Mugwort kueh, red-tortoise kueh, taro kueh and turnip cake on trays and boards (illustrative)',
    chapter: 'kueh-foods',
    clickOnly: true,
    point: [0, 0.4],
    level: 0,
    radius: 0,
    prompt: [0, 1.3, -0.3],
    camera: { position: [-0.15, 1.45, 0.9], target: [0.05, 0.66, -0.32] },
  },
]

/* ═══════════ 廟埕的動線與用餐區 ═══════════ */

/**
 * 中央主通道（廟埕本地座標）：從迪化街側的廟埕前緣直到天公爐前，寬度容得下兩個角色並行；
 * 天公爐兩側再繞到廟前的石階。廟門前的視線不被攤位擋住。
 */
export const TEMPLE_CENTRAL_PATH = { minX: -1.0, maxX: 0.38, minZ: -3.6, maxZ: 1.7 }

/**
 * 用餐區（只在這個年代）：廟埕原本的兩組共用桌椅集中到中央通道西側、榕樹前（豆花攤的客人也坐這裡），
 * 旁邊是榕樹下原本的板凳；桌椅與天公爐之間留出走到豆花攤的路，各攤的桌椅不互相堵住。
 * tables 為桌子的中心（廟埕本地座標；桌子 0.9 × 0.6 m，凳子在前後）。老屋新生的共用桌椅不變。
 */
export const TEMPLE_DINING = {
  tables: [
    [1.3, -1.85],
    [1.3, -0.45],
  ],
}
