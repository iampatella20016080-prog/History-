/**
 * 魷魚羹的兩個年代版本：同一個飲食主題「魷魚羹飲食文化」，各自的位置、模型、碰撞、互動與故事
 *
 * - 1945–1980「庶民生活」：慈聖宮廟埕旁、與其他小吃攤相鄰的魷魚羹攤（飲食文化情境示意，不是特定的店家）
 * - 2000–現在「老屋新生」：永樂市場外、街道對面的老潘魷魚羹（迪化街一段30號）
 *
 * 兩者只以飲食主題串連：廟口的攤位不是老潘的前身，老潘也不是從廟口遷出，場景不表示兩者有任何傳承關係。
 * 兩個版本在不同的位置，各自只在自己的年代產生；只共用餐碗、食品與部分器具的模型（builders/squidSoupWares.js）。
 * 位置、入口、碰撞、資訊熱點與鏡頭錨點都在這裡定義一次，店家資料與建築、室內的產生器都從這裡取用。
 *
 * 尺寸依需求說明中對照片的描述與一般小吃攤、街屋的比例估算（照片本身沒有在開發時取得），並非測量；未拍到的部分是簡化的示意。
 */
export const SQUID_SOUP_THEME = {
  id: 'squid-soup',
  title: '魷魚羹飲食文化', titleEn: 'Squid soup food culture',
  /** 年代 id → 這個年代的版本（店家 id） */
  versions: { postwar: 'temple-squid-stall', revival: 'lao-pan-squid-soup' },
}

/* ═══════════ 1945–1980：慈聖宮廟口的魷魚羹攤 ═══════════ */

/**
 * 慈聖宮的地段（與 shops.js 的慈聖宮相同：迪化街南側、廟埕朝北）。
 * 廟埕本地座標（同 builders/specials.js）：原點在廟埕前緣的中央，+z 朝迪化街，廟埕在 z -6.2 – 0，
 * z 0 – 1.7 是廟埕前緣接到街道的鋪面；廟門在 -z 端的正中央。
 */
export const TEMPLE_COURT = { x: 4, z: 4.5, rotationY: Math.PI }

/**
 * 魷魚羹攤：在廟埕西側（廟埕本地 +x）的前緣，背對西側的榕樹、攤台朝向迪化街，
 * 旁邊是廟埕原本的共用桌椅與小吃攤；廟門前的中央通道與廟門都不佔用（東側的前緣有電線桿擋在攤位前）。
 *
 * 攤位本地座標：原點在攤台正面（客人那一側）的中央地面，+z 朝客人與迪化街，+x 沿著攤台；
 * 攤位與廟埕同方向，所以攤位 +x 為廟埕本地 +x。
 */
export const TEMPLE_STALL = {
  /** 攤台正面中央在廟埕本地座標的位置 */
  court: { x: 4.45, z: -0.6 },
  /** 木框攤台：寬 1.6 m、深 0.72 m，金屬工作面高 0.88 m */
  counter: { half: 0.8, depth: 0.72, height: 0.88 },
  /** 帆布棚：四根竹竿撐起，向客人那一側延伸 */
  canopy: { half: 1.05, back: -0.95, front: 0.85, height: 2.25 },
  /** 大湯鍋、展示的那一碗魷魚羹（攤台上，攤位本地座標） */
  pot: { x: 0.38, z: -0.36 },
  bowl: { x: -0.22, z: -0.14 },
  /** 兩張小方桌與木凳（桌面 0.62 m 見方；凳子在桌子前後），兩張桌子之間留出走到攤台前的通道 */
  tables: [
    { x: 0.62, z: 1.65 },
    { x: -0.95, z: 1.65 },
  ],
  tableHalf: 0.31,
  stoolOffset: 0.52,
  /**
   * 榕樹下留給攤位的空間（廟埕本地座標）：只在這個年代，西側榕樹垂到這裡的氣根不產生、
   * 低垂的樹冠抬高到帆布棚上方（top），帆布棚與攤台不會穿過樹。
   */
  clearing: { minX: 3.35, maxX: 5.7, minZ: -1.6, maxZ: 0.95, top: 2.45 },
}

/** 魷魚羹攤：攤位本地座標 → 世界座標 */
export function templeStallToWorld(x, z) {
  return templeCourtToWorld(TEMPLE_STALL.court.x + x, TEMPLE_STALL.court.z + z)
}

/** 廟埕本地座標 → 世界座標 */
export function templeCourtToWorld(x, z) {
  const { x: ox, z: oz, rotationY } = TEMPLE_COURT
  const c = Math.cos(rotationY)
  const s = Math.sin(rotationY)
  return { x: ox + x * c + z * s, z: oz - x * s + z * c }
}

/** 攤位的世界座標原點與朝向（建築產生器以這裡為原點） */
export const TEMPLE_STALL_SITE = (() => {
  const p = templeStallToWorld(0, 0)
  return { x: p.x, z: p.z, rotationY: TEMPLE_COURT.rotationY, replaces: [] }
})()

/**
 * 資訊熱點（攤位本地座標）：
 * - stall：攤位前、兩張小桌之間（站在街邊或攤台前都會出現提示）
 * - bowl：只能點選（攤台上展示的那一碗），開啟「一碗魷魚羹」
 * camera：開啟介紹時的鏡頭位置與注視點（[x, y, z]，攤位本地座標）
 */
export const TEMPLE_STALL_HOTSPOTS = [
  {
    id: 'stall',
    label: '廟口的魷魚羹攤', labelEn: 'Temple-front squid soup stall',
    note: '飲食文化情境示意', noteEn: 'Illustrative food-culture scene',
    chapter: 'temple-food',
    point: [-0.16, 1.45],
    level: 0,
    radius: 1.75,
    prompt: [-0.16, 2.55, 0.2],
    camera: { position: [-2.9, 2.1, 4.6], target: [0.1, 1.15, -0.2] },
  },
  {
    id: 'bowl',
    label: '一碗魷魚羹', labelEn: 'A bowl of squid soup',
    note: '攤台上展示的一碗（示意）', noteEn: 'A bowl displayed on the stall counter (illustrative)',
    chapter: 'bowl',
    clickOnly: true,
    point: [TEMPLE_STALL.bowl.x, 0.4],
    level: 0,
    radius: 0,
    prompt: [TEMPLE_STALL.bowl.x, 1.55, TEMPLE_STALL.bowl.z],
    camera: { position: [-0.75, 1.62, 1.0], target: [TEMPLE_STALL.bowl.x, 0.95, TEMPLE_STALL.bowl.z] },
  },
]

/* ═══════════ 2000–現在：老潘魷魚羹 ═══════════ */

/**
 * 老潘魷魚羹（迪化街一段30號）：取代迪化街南側街尾、永樂市場前廣場旁的一般地段（south-18），
 * 隔著街道與廣場面對永樂市場。場景的街道是敘事式配置，只保留「市場外、街道對面」的相對關係，不是精確的地籍位置。
 *
 * 建築本地座標：原點在一樓店面線的中央地面；+z 朝迪化街（騎樓在 z 0 – 1.7，柱列外緣接街道），
 * 室內在 -z；+x 是從街上看店面的右側（稻舍那一側），-x 是永樂市場前廣場那一側。
 */
export const LAO_PAN = {
  /** 世界座標的原點與取代的地段 */
  site: { x: 34.0, z: 4.5, rotationY: Math.PI, replaces: ['south-18'] },
  half: 2.0, // 面寬 4 m
  wallT: 0.2,
  arcade: 1.7, // 騎樓深度
  pier: 0.4, // 騎樓方柱
  back: -10.0, // 後牆外緣（後段的廚房不開放）
  groundH: 3.6, // 一樓樓高（二樓樓板頂）
  arcadeCeiling: 3.3,
  ceiling: 3.2, // 店內天花
  floor3: 7.0,
  top: 10.2,
  parapet: 10.8,
  /** 店內（用餐區）的內側範圍：後段牆上是通往後場的布簾門 */
  room: { minX: -1.8, maxX: 1.8, minZ: -6.6, maxZ: 0 },
  /** 入口：店面線上、料理檯旁（料理檯在廣場那一側） */
  entrance: { minX: -0.36, maxX: 1.8 },
  /**
   * 料理檯：騎樓下、店門口的不鏽鋼攤車（玻璃展示罩、疊碗、兩口湯鍋；食記寫到「攤車在外頭」），
   * 店裡沿牆是瀝水區與碗盤架；攤車後方到瀝水區是工作區，不開放。
   */
  counter: { minX: -1.85, maxX: -0.4, minZ: 0.5, maxZ: 1.28, height: 0.88 },
  sink: { minX: -1.8, maxX: -1.2, minZ: -1.7, maxZ: -0.35, height: 0.82 },
  staff: { minX: -1.85, maxX: -0.36, minZ: -1.75, maxZ: 1.3 },
  /** 三組座位：靠牆的長方桌（0.7 × 1.0 m）與前後的塑膠凳，中央留出走道 */
  tables: [
    { id: 'r1', x: 1.38, z: -2.55 },
    { id: 'r2', x: 1.38, z: -4.85 },
    { id: 'l1', x: -1.38, z: -3.7 },
  ],
  table: { halfX: 0.35, halfZ: 0.5, height: 0.74 },
  stoolOffset: 0.85,
  /** 四道展示餐點擺在入口旁的第一張桌子（r1） */
  foodTable: 'r1',
  /** 黑白貓：坐在第二張桌子（r2）靠走道的桌腳旁，身體朝店裡、回頭看門口 */
  cat: { x: 0.86, z: -5.45, rotationY: Math.PI * 0.92, headTurn: 2.1 },
  /** 後牆旁的飲料冰箱、靠牆疊著的備用塑膠凳與牆角的盆栽 */
  fridge: { minX: -1.8, maxX: -1.12, minZ: -6.6, maxZ: -5.95 },
  spareStools: { x: -1.5, z: -5.4 },
  plant: { x: 1.6, z: -6.35 },
}

/** 走道（兩側桌椅之間）的寬度 */
export function laoPanAisle() {
  const { tables, table } = LAO_PAN
  const right = Math.min(...tables.filter((t) => t.x > 0).map((t) => t.x - table.halfX))
  const left = Math.max(...tables.filter((t) => t.x < 0).map((t) => t.x + table.halfX))
  return { minX: left, maxX: right, width: right - left }
}

/** 老潘：建築本地座標 → 世界座標 */
export function laoPanToWorld(x, z) {
  const { x: ox, z: oz, rotationY } = LAO_PAN.site
  const c = Math.cos(rotationY)
  const s = Math.sin(rotationY)
  return { x: ox + x * c + z * s, z: oz - x * s + z * c }
}

export function laoPanTable(id) {
  return LAO_PAN.tables.find((t) => t.id === id)
}

/**
 * 資訊熱點（建築本地座標）：走近時出現提示，電腦按 E、觸控點提示或點那個物件，開啟老潘介紹的對應章節。
 * - storefront：騎樓下、店門口（看招牌、雨棚與立面）→「店家與位置」
 * - counter：騎樓前、攤車的正面（湯鍋、玻璃展示罩）→「市場周邊飲食」
 * - foods：店裡第一張桌子旁（四道展示餐點）→「代表餐點」
 * 一樓的熱點連同離開時的緩衝，不和小藝埕、永樂市場的互動範圍重疊。
 */
export const LAO_PAN_HOTSPOTS = [
  {
    id: 'storefront',
    label: '老潘魷魚羹', labelEn: 'Lao Pan Squid Soup',
    note: '迪化街一段30號，永樂市場對面', noteEn: 'No. 30, Section 1, Dihua Street, opposite Yongle Market',
    chapter: 'shop',
    point: [0.6, 1.0],
    level: 0,
    radius: 1.1,
    prompt: [0.6, 2.75, 1.05],
    camera: { position: [-1.4, 2.0, 6.4], target: [0.2, 3.9, 1.9] },
  },
  {
    id: 'counter',
    label: '料理檯', labelEn: 'Cooking counter',
    note: '湯鍋、玻璃展示罩與疊放的碗', noteEn: 'Soup pots, a glass display case and stacked bowls',
    chapter: 'market',
    point: [-1.1, 1.95],
    level: 0,
    radius: 0.9,
    prompt: [-1.1, 1.95, 0.95],
    camera: { position: [0.95, 1.85, 3.4], target: [-1.15, 1.0, 0.85] },
  },
  {
    id: 'foods',
    label: '四道展示餐點', labelEn: 'Four dishes on display',
    note: '沙茶魷魚羹、魚酥羹、甜不辣、乾拌沙茶生魷魚', noteEn: 'Sha-cha squid soup, fish-crisp soup, tempura (tian-bu-la) and dry-tossed sha-cha raw squid',
    chapter: 'foods',
    point: [0.45, -2.6],
    level: 0,
    radius: 1.5,
    prompt: [1.2, 1.75, -2.55],
    camera: { position: [-0.35, 1.72, -1.1], target: [1.38, 0.78, -2.62] },
  },
]
