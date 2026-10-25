/**
 * 米苔目的兩個年代版本：同一個飲食主題「米苔目飲食文化」，各自的位置、模型、碰撞、人物、互動與故事
 *
 * - 1945–1980「庶民生活」：慈聖宮廟埕的米苔目攤，屬於廟口小吃群的一部分（飲食文化情境示意，不是特定的店家）
 * - 2000–現在「老屋新生」：永樂米苔目的現代店面（依使用者提供的實地照片建模）
 *
 * 兩者只以飲食主題串連：廟口的攤位不是永樂米苔目的前身，場景與介紹都不表示永樂米苔目當時已經存在或在廟口擺攤。
 * 兩個版本在不同的位置（廟埕／迪化街北側），各自只在自己的年代產生；只共用碗盤、湯匙與部分器具的模型。
 * 位置、碰撞、資訊熱點、鏡頭錨點與人物（NPC）都在這裡定義一次，店家資料與建築、室內的產生器都從這裡取用。
 *
 * 尺寸依照片與一般小吃攤、街屋的比例估算，並非測量；照片沒有拍到的部分是簡化的示意。
 */
import { XIA_ER_ZUI_RELATED } from './dihuaNianhuoData.js'
import { TEMPLE_COURT, templeCourtToWorld } from './squidSoupLayout.js'

export const MI_TAI_MU_THEME = {
  id: 'mi-tai-mu',
  title: '米苔目飲食文化',
  /** 年代 id → 這個年代的版本（店家 id） */
  versions: { postwar: 'temple-mi-tai-mu-stall', revival: 'yong-le-mi-tai-mu' },
  /** 同類食物的現代相關店家（只有文字介紹，沒有店家條目與模型）：呷二嘴，沒有品牌傳承關係 */
  related: [XIA_ER_ZUI_RELATED],
}

/* ═══════════ 1945–1980：慈聖宮廟口的米苔目攤 ═══════════ */

/**
 * 米苔目攤：在廟埕東側（廟埕本地 -x）的前緣，取代這個年代原本在那裡的一般小吃攤，攤台朝向迪化街；
 * 背後是東側的榕樹，西側隔著廟門前的中央通道是共用桌椅與魷魚羹攤。路燈在攤位的左前方，兩張小桌在它的兩側。
 *
 * 攤位本地座標（與 squidSoupLayout.js 的魷魚羹攤相同）：原點在攤台正面（客人那一側）的中央地面，
 * +z 朝客人與迪化街，+x 沿著攤台；攤位與廟埕同方向，所以攤位 +x 為廟埕本地 +x。
 */
export const MI_TAI_MU_STALL = {
  /** 攤台正面中央在廟埕本地座標的位置 */
  court: { x: -2.55, z: -0.45 },
  /** 木框攤台：寬 1.6 m、深 0.7 m，工作面高 0.86 m */
  counter: { half: 0.8, depth: 0.7, height: 0.86 },
  /** 帆布棚：四根竹竿撐起，向客人那一側延伸 */
  canopy: { half: 1.0, back: -0.88, front: 0.82, height: 2.2 },
  /**
   * 攤台上：煤球爐上的湯鍋、一盆生的米苔目、展示的一碗米苔目與小菜（攤位本地座標）。
   * 展示的那一碗在招牌的右側（招牌寬 ±0.33 m），從街上的高處往下看也不會被招牌擋住。
   */
  pot: { x: -0.42, z: -0.36 },
  noodles: { x: 0.02, z: -0.48 },
  bowl: { x: 0.5, z: -0.14 },
  sides: { x: 0.22, z: -0.15 },
  /** 兩張小方桌與木凳（桌面 0.6 m 見方；凳子在桌子前後），兩張桌子之間留出走到攤台前的通道 */
  tables: [
    { id: 'a', x: -0.85, z: 1.5 },
    { id: 'b', x: 0.85, z: 1.5 },
  ],
  tableHalf: 0.3,
  stoolOffset: 0.5,
  /**
   * 榕樹下留給攤位的空間（廟埕本地座標）：只在這個年代，東側榕樹垂到這裡的氣根不產生、
   * 低垂的樹冠抬高到帆布棚上方（top），帆布棚與攤台不會穿過樹。
   */
  clearing: { minX: -3.75, maxX: -1.35, minZ: -1.55, maxZ: 0.55, top: 2.4 },
}

/** 米苔目攤：攤位本地座標 → 世界座標 */
export function miTaiMuStallToWorld(x, z) {
  return templeCourtToWorld(MI_TAI_MU_STALL.court.x + x, MI_TAI_MU_STALL.court.z + z)
}

/** 攤位的世界座標原點與朝向（建築產生器以這裡為原點） */
export const MI_TAI_MU_STALL_SITE = (() => {
  const p = miTaiMuStallToWorld(0, 0)
  return { x: p.x, z: p.z, rotationY: TEMPLE_COURT.rotationY, replaces: [] }
})()

/**
 * 攤位的人物（攤位本地座標，rotationY 是面向，0 為面向 +z）：
 * 攤台後招呼客人的攤販、兩張小桌各一位吃米苔目的客人，以及站在攤台旁等著的客人。
 * 都是情境人物，沒有名字或身分；不會走動，只有簡單的待機動作。
 */
export const MI_TAI_MU_STALL_NPCS = [
  { id: 'vendor', look: 'postwarVendor', pose: 'wave', x: -0.05, z: -1.02, rotationY: 0 },
  { id: 'diner-a', look: 'postwarDiner', pose: 'eat', x: -0.85, z: 2.0, rotationY: Math.PI, seat: true },
  { id: 'diner-b', look: 'postwarDinerWoman', pose: 'eat', x: 0.85, z: 1.0, rotationY: 0, seat: true },
  { id: 'waiting', look: 'postwarCustomer', pose: 'stand', x: 1.28, z: 0.3, rotationY: -Math.PI / 2 - 0.25 },
]

/**
 * 資訊熱點（攤位本地座標）：
 * - stall：攤位前、兩張小桌之間（站在街邊或攤台前都會出現提示）→「廟口的米苔目」
 * - bowl：只能點選（攤台上展示的那一碗與小菜）→「一碗米苔目」
 * camera：開啟介紹時的鏡頭位置與注視點（[x, y, z]，攤位本地座標）
 */
export const MI_TAI_MU_STALL_HOTSPOTS = [
  {
    id: 'stall',
    label: '廟口的米苔目',
    note: '飲食文化情境示意',
    chapter: 'temple-food',
    point: [0, 1.25],
    level: 0,
    radius: 1.6,
    prompt: [0, 2.5, 0.2],
    camera: { position: [2.7, 2.0, 4.4], target: [-0.1, 1.1, -0.2] },
  },
  {
    id: 'bowl',
    label: '一碗米苔目',
    note: '攤台上展示的一碗與小菜（示意）',
    chapter: 'bowl',
    clickOnly: true,
    point: [MI_TAI_MU_STALL.bowl.x, 0.4],
    level: 0,
    radius: 0,
    prompt: [MI_TAI_MU_STALL.bowl.x, 1.5, MI_TAI_MU_STALL.bowl.z],
    camera: { position: [0.95, 1.58, 0.95], target: [MI_TAI_MU_STALL.bowl.x + 0.1, 0.93, MI_TAI_MU_STALL.bowl.z - 0.05] },
  },
]

/* ═══════════ 2000–現在：永樂米苔目 ═══════════ */

/**
 * 永樂米苔目：取代迪化街北側的一般地段 north-6（距離出發點不遠、往永樂市場的方向）。
 * 實際的店在民樂街（臺北市大同區民樂街111號）；場景的街道是敘事式配置，只保留「永樂市場／迪化街商圈」的關係，
 * 不是精確的地籍位置。與慈聖宮廟埕隔著街道、不相鄰，不暗示與戰後的廟口攤位有關。
 *
 * 建築本地座標：原點在一樓店面線的中央地面；+z 朝迪化街（騎樓在 z 0 – 1.7），室內在 -z；
 * +x 是從街上看店面的右側（入口那一側）。地段其餘的 1.8 m（x 2.3 – 4.1）是一棟窄小的鄰屋（樓梯間與藍色鐵捲門）。
 */
export const YONGLE_MTM = {
  /** 世界座標的原點與取代的地段（north-6：x 14.6 – 21.0） */
  site: { x: 16.9, z: -4.5, rotationY: 0, replaces: ['north-6'] },
  half: 2.3, // 面寬 4.6 m
  wallT: 0.2,
  arcade: 1.7, // 騎樓深度
  pier: 0.4,
  back: -11.0, // 後牆外緣（後場不開放）
  groundH: 3.6, // 一樓樓高（二樓樓板頂）
  arcadeCeiling: 3.2,
  ceiling: 3.05, // 店內天花
  /** 二樓以上：每層 3 m，四樓頂上是綠色玻璃的頂樓加蓋 */
  floors: [3.6, 6.6, 9.6],
  roof: 12.6,
  roofTop: 13.7,
  /** 右側的鄰屋（樓梯間、藍色鐵捲門），只有三層樓 */
  neighbour: { minX: 2.3, maxX: 4.1, top: 9.9 },
  /** 店內（用餐區）的內側範圍 */
  room: { minX: -2.1, maxX: 2.1, minZ: -10.4, maxZ: 0 },
  /** 入口：店面線上、外帶區的右側 */
  entrance: { minX: -0.25, maxX: 2.1 },
  /**
   * 外帶區：店面線內側左邊的木作櫃檯（湯鍋、碗盤、紅色的「外帶區」牌子），上方是不鏽鋼的大排煙罩與兩台箱型排風扇；
   * 櫃檯前的騎樓放著兩個有輪子的鋁櫃。櫃檯後方是工作區（不開放）。
   */
  takeaway: { minX: -2.1, maxX: -0.35, minZ: -0.8, maxZ: -0.08, height: 0.92 },
  takeawayStaff: { minX: -2.1, maxX: -0.35, minZ: -1.35, maxZ: -0.08 },
  cabinets: { minX: -2.0, maxX: -0.55, minZ: 0.06, maxZ: 0.5 },
  /** 騎樓左半邊停著的兩台機車（車頭朝街）；右邊的柱子旁是排煙管接到地上的鼓風機 */
  scooters: [
    { x: -1.62, z: 1.08, rotationY: 0.06 },
    { x: -0.88, z: 1.12, rotationY: -0.05 },
  ],
  blower: { minX: 1.5, maxX: 1.86, minZ: 1.1, maxZ: 1.42 },
  /** 左牆：調味料與筷筒的長櫃、木作櫃門；長櫃後方是送餐的小推車與藍色垃圾桶 */
  condiments: { minX: -2.1, maxX: -1.66, minZ: -2.95, maxZ: -1.55, height: 0.9 },
  cart: { x: -1.84, z: -3.38 },
  bin: { x: -1.86, z: -3.95 },
  /** 方桌（0.7 m 見方，淺色木紋桌面、黑色桌腳）與前後的黑色圓凳；中間一排、靠右牆一排，左邊是走道 */
  tables: [
    { id: 'm1', x: 0.1, z: -3.0 },
    { id: 'm2', x: 0.1, z: -5.0 },
    { id: 'm3', x: 0.1, z: -7.0 },
    { id: 'r1', x: 1.68, z: -2.4 },
    { id: 'r2', x: 1.68, z: -4.4 },
    { id: 'r3', x: 1.68, z: -6.4 },
    { id: 'r4', x: 1.68, z: -8.3 },
  ],
  table: { half: 0.35, height: 0.74 },
  stoolOffset: 0.55,
  /** 一碗米苔目與小菜擺在入口旁、走道邊的第一張桌子（m1） */
  foodTable: 'm1',
  /** 右牆的大菜單板（只有品名與菜色圖，沒有價格）、壁扇與桌號牌 */
  menuBoard: { minZ: -6.6, maxZ: -2.9, y0: 1.75, y1: 2.6 },
  /** 後方的端景：木作櫃台與備餐區、藍色牆面、玻璃展示櫃；櫃台後方不開放 */
  backCounter: { minX: -0.85, maxX: 2.1, minZ: -10.4, maxZ: -9.5, height: 1.0 },
  fridge: { minX: -2.1, maxX: -1.4, minZ: -10.4, maxZ: -9.75 },
}

/** 走道（左牆的長櫃到中間那排桌凳）的寬度 */
export function yongleMtmAisle() {
  const { tables, table, condiments } = YONGLE_MTM
  const middle = Math.min(...tables.filter((t) => t.id.startsWith('m')).map((t) => t.x - table.half))
  return { minX: condiments.maxX, maxX: middle, width: middle - condiments.maxX }
}

/** 永樂米苔目：建築本地座標 → 世界座標 */
export function yongleMtmToWorld(x, z) {
  const { x: ox, z: oz, rotationY } = YONGLE_MTM.site
  const c = Math.cos(rotationY)
  const s = Math.sin(rotationY)
  return { x: ox + x * c + z * s, z: oz - x * s + z * c }
}

export function yongleMtmTable(id) {
  return YONGLE_MTM.tables.find((t) => t.id === id)
}

/**
 * 店裡的人物（建築本地座標；rotationY 是面向，0 為面向 +z）：四位坐著吃米苔目的客人、
 * 店門口右側排隊的兩個人、在騎樓點外帶的客人，以及外帶區與後方櫃台的兩位店員。
 * 都是情境人物，不對應照片裡的任何人；不會走動，只有簡單的待機動作。
 * seat：坐在 table 那張桌子的前（+z）或後（-z）凳子上。
 */
export const YONGLE_MTM_NPCS = [
  { id: 'diner-r1', look: 'revivalDiner', pose: 'eat', table: 'r1', side: 1 },
  { id: 'diner-m2', look: 'revivalDinerWoman', pose: 'eat', table: 'm2', side: -1 },
  { id: 'diner-r2', look: 'revivalDinerBackpack', pose: 'eat', table: 'r2', side: -1 },
  { id: 'diner-m3', look: 'revivalDinerHat', pose: 'eat', table: 'm3', side: 1 },
  { id: 'queue-1', look: 'revivalQueue', pose: 'phone', x: 1.62, z: -0.62, rotationY: Math.PI + 0.55 },
  { id: 'queue-2', look: 'revivalQueueWoman', pose: 'stand', x: 1.66, z: -1.3, rotationY: Math.PI + 0.35 },
  { id: 'takeaway', look: 'revivalCustomer', pose: 'stand', x: -0.1, z: 0.42, rotationY: Math.PI + 0.4, arcade: true },
  { id: 'staff-front', look: 'revivalStaff', pose: 'ladle', x: -1.3, z: -1.0, rotationY: 0 },
  { id: 'staff-back', look: 'revivalStaffBack', pose: 'stand', x: 0.7, z: -10.05, rotationY: 0 },
]

/** 某位人物在建築本地座標的位置與面向（坐著的客人依桌子與凳子換算） */
export function yongleMtmNpcPlacement(npc) {
  if (!npc.table) return { x: npc.x, z: npc.z, rotationY: npc.rotationY, seat: false }
  const t = yongleMtmTable(npc.table)
  const z = t.z + npc.side * YONGLE_MTM.stoolOffset
  // 坐在 +z 那一側的凳子上就面向 -z（朝向桌子），反之亦然
  return { x: t.x, z, rotationY: npc.side > 0 ? Math.PI : 0, seat: true }
}

/**
 * 資訊熱點（建築本地座標）：走近時出現提示，電腦按 E、觸控點提示或點那個物件，開啟永樂米苔目介紹的對應章節。
 * - storefront：騎樓下、入口前（看招牌與立面）→「店家與店面」
 * - dining：走進店門後（看狹長的用餐空間、牆上的菜單板）→「店內的用餐空間」
 * - foods：走道邊第一張桌子（一碗米苔目與小菜）→「一碗米苔目」
 */
export const YONGLE_MTM_HOTSPOTS = [
  {
    id: 'storefront',
    label: '永樂米苔目',
    note: '大稻埕的米苔目小吃店',
    chapter: 'shop',
    point: [0.95, 1.05],
    level: 0,
    radius: 1.1,
    prompt: [0.95, 2.8, 1.1],
    camera: { position: [-1.8, 2.0, 7.0], target: [0.3, 4.4, 1.6] },
  },
  {
    id: 'dining',
    label: '店內的用餐空間',
    note: '狹長的一樓、方桌與圓凳、牆上的菜單板',
    chapter: 'dining',
    point: [0.95, -1.45],
    level: 0,
    radius: 0.85,
    prompt: [0.95, 2.15, -1.6],
    camera: { position: [-1.0, 1.7, 0.6], target: [0.6, 1.4, -6.0] },
  },
  {
    id: 'foods',
    label: '一碗米苔目',
    note: '湯米苔目與幾樣小菜',
    chapter: 'foods',
    point: [-0.72, -3.0],
    level: 0,
    radius: 1.05,
    prompt: [0.1, 1.65, -3.0],
    camera: { position: [-1.35, 1.62, -1.7], target: [0.1, 0.8, -3.05] },
  },
]
