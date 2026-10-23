/**
 * 迪化街一段329號店屋（稻舍 Rice & Shine）的位置、尺寸、各年代的空間、家具、資訊熱點與鏡頭
 *
 * 店家的地段沿用原本「稻舍」的街屋地段（迪化街南側、224巷東側；地段的切分與亂數完全不變），
 * 建築本地座標：原點在一樓店面線（騎樓後方的牆）的中央地面；+z 朝迪化街（騎樓在 z 0 – 1.7），室內在 -z；
 * 從街上正對立面時，+x 是右手邊（西側、224巷那一側）。
 *
 * 一樓：騎樓 → 前進（店面）→ 天井 → 後進；二樓（只在 2000–現在開放）：後進的木樓梯 → 天井旁的過廊 → 臨街的前進。
 * 尺寸依照片與一般大稻埕街屋的比例估算，並非測量；照片沒有拍到的部分是簡化的示意。
 */
import { RICE_AND_SHINE_ID } from './riceAndShineEraConfig.js'

export const RS = {
  id: RICE_AND_SHINE_ID,
  /** 地段（與原本稻舍的地段相同）：店面中心的世界座標、朝北（面向迪化街） */
  position: { x: 29.2, z: 4.5 },
  half: 2.8, // 面寬 5.6 m
  depth: 11,
  wallT: 0.2,
  arcade: 1.7, // 騎樓深度（亭仔腳）
  /** 騎樓立面：四道紅磚柱、三個拱券（中央較寬） */
  piers: [
    [-2.8, -2.4],
    [-1.25, -0.85],
    [0.85, 1.25],
    [2.4, 2.8],
  ],
  pierZ: [1.38, 1.7],
  arches: [
    { x: -1.825, w: 1.15 },
    { x: 0, w: 1.7 },
    { x: 1.825, w: 1.15 },
  ],
  spring: 2.35,
  arcadeCeiling: 3.45,
  floor2: 3.75, // 二樓樓板頂
  ceiling1: 3.3, // 一樓木梁下緣
  /** 二樓立面：腰帶、三塊白色飾板、窗台、三組木框窗（中央較寬）、簷口、女兒牆與綠色花磚 */
  band: [3.75, 4.12],
  panels: [4.28, 4.88],
  sill: 4.98,
  windowSpring: 6.08,
  windows: [
    { x: -1.75, w: 0.86 },
    { x: 0, w: 1.42 },
    { x: 1.75, w: 0.86 },
  ],
  cornice: 6.62,
  parapet: [6.82, 7.72],
  tiles: { y0: 7.06, y1: 7.46 },
  ceiling2: 6.55,
  /** 一樓店面線上的門：中央是入口（2000 年代是玻璃門），兩側是木門 */
  door: { minX: -0.75, maxX: 0.75, height: 2.6 },
  /** 一樓的三個空間（內側範圍） */
  front: { minX: -2.6, maxX: 2.6, minZ: -5.8, maxZ: -0.2 },
  courtyard: { minX: -2.6, maxX: 2.6, minZ: -7.8, maxZ: -6.0 },
  back: { minX: -2.6, maxX: 2.6, minZ: -10.8, maxZ: -8.0 },
  /** 前進與天井之間、天井與後進之間的門洞 */
  courtyardDoor: { minX: -0.8, maxX: 0.8, height: 2.4 },
  backDoor: { minX: -1.3, maxX: 0.3, height: 2.3 },
  /** 2000–現在：後進的木樓梯（沿著後牆往 +x 爬升）、樓梯口的平地、二樓的平台、天井旁的過廊與二樓前進 */
  stair: { minZ: -10.75, maxZ: -9.95, fromX: -2.2, toX: 2.05 },
  stairPad: { minX: -2.58, maxX: -2.1, minZ: -10.78, maxZ: -9.85 },
  landing: { minX: 1.7, maxX: 2.58, minZ: -10.78, maxZ: -8.0 },
  corridor: { minX: 1.75, maxX: 2.58, minZ: -8.0, maxZ: -5.6 },
  upstairs: { minX: -2.6, maxX: 2.6, minZ: -5.8, maxZ: 1.35 },
  /** 1895–1930：只有前段的店面可以走進去 */
  frontShop: { minX: -2.6, maxX: 2.6, minZ: -3.0, maxZ: -0.2 },
}

/** 地段的旋轉（南側的地段朝北） */
export const RS_ROTATION = Math.PI

/** 建築本地座標 → 世界座標 */
export function riceToWorld(x, z) {
  const c = Math.cos(RS_ROTATION)
  const s = Math.sin(RS_ROTATION)
  return { x: RS.position.x + x * c + z * s, z: RS.position.z - x * s + z * c }
}

const box = (minX, maxX, minZ, maxZ, height = 1) => ({ minX, maxX, minZ, maxZ, height })

/* ═══════════ 2000–現在：稻舍 Rice & Shine ═══════════ */

export const MODERN = {
  /** 一樓：兩排小方桌（中間與靠右牆），每張桌子的使用狀態與套餐不同 */
  tables: [
    { id: 'm1', x: 0.15, z: -2.3, state: 'served', meal: 0 },
    { id: 'm2', x: 0.15, z: -4.2, state: 'eating', meal: 1 },
    { id: 'r1', x: 1.75, z: -2.3, state: 'empty' },
    { id: 'r2', x: 1.75, z: -4.2, state: 'after', meal: 2 },
  ],
  table: { half: 0.37, height: 0.76 },
  chairOffset: 0.62,
  counter: box(1.3, 2.58, -1.25, -0.45, 1.0),
  cabinet: box(-2.58, -2.1, -1.3, -0.45, 0.86),
  /** 出口旁的「老屋再生」說明板（掛在店面線的內側牆上） */
  renewalBoard: { minX: -1.65, maxX: -0.95, y0: 0.95, y1: 2.15 },
  /** 米業文化展示：左牆的高木架、土礱與蓑衣、放米斗的小雕花桌 */
  shelf: box(-2.6, -2.16, -4.05, -1.55, 2.45),
  husker: box(-2.45, -1.7, -5.05, -4.25, 1.15),
  measureStand: box(-2.45, -1.8, -5.62, -5.1, 0.78),
  /** 天井：壁畫（左牆）、小樹、盆栽 */
  mural: { minZ: -7.7, maxZ: -6.1, y0: 0.55, y1: 3.15 },
  tree: box(-2.45, -1.85, -7.75, -7.15),
  pots: [box(1.95, 2.45, -6.55, -6.1), box(2.1, 2.55, -7.75, -7.3)],
  mortar: box(0.98, 1.42, -7.77, -7.33, 0.32),
  /** 後進：舊碾米機（碾米工廠的互動點）、出菜的木櫃台 */
  mill: box(0.35, 1.55, -9.45, -8.25, 1.6),
  pass: box(-2.58, -1.4, -8.75, -8.05, 0.95),
  /** 二樓：兩張長木桌與藤編木椅、書架、圓几與電扇、講座用的投影幕 */
  longTables: [
    { id: 'u1', minX: -1.7, maxX: -0.9, minZ: -3.5, maxZ: -0.7, chairs: [-2.1, -0.5] },
    { id: 'u2', minX: 0.2, maxX: 1.0, minZ: -3.2, maxZ: -0.6, chairs: [1.4] },
  ],
  bookshelf: box(-2.6, -2.24, -5.6, -4.0, 2.2),
  roundTable: { x: 2.1, z: 0.85, r: 0.32 },
  /** 《南街殷賑》說明板下的小展示台（靠右牆） */
  nanjieStand: box(2.35, 2.6, -3.2, -2.2, 0.84),
  nanjieBoard: { minZ: -3.4, maxZ: -2.0, y0: 1.05, y1: 2.45 },
  screen: { minX: -2.2, maxX: 0.2, y0: 1.2, y1: 2.9 },
}

/** 二樓長桌連同木椅的範圍 */
export function longTableBox(t) {
  const xs = [t.minX, t.maxX, ...t.chairs.flatMap((x) => [x - 0.22, x + 0.22])]
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: t.minZ - 0.05, maxZ: t.maxZ + 0.05 }
}

/** 一樓小方桌連同前後兩張椅子的範圍 */
export function diningTableBox(t) {
  const { half } = MODERN.table
  const reach = MODERN.chairOffset + 0.22
  return { minX: t.x - half, maxX: t.x + half, minZ: t.z - reach, maxZ: t.z + reach }
}

/* ═══════════ 1930–1945：米行與碾米間；1945–1980：戰後 ═══════════ */

export const MILL = {
  /** 前段：帳桌（算盤、帳本、秤）、米袋、米斗與米桶 */
  counter: box(1.2, 2.58, -1.6, -0.7, 0.9),
  sacks: box(-2.58, -1.5, -2.6, -0.5, 1.2),
  bins: box(-1.3, -0.75, -1.15, -0.55, 0.75),
  /** 中段：大型碾米機（左半邊）、稻穀堆、堆白米的右半邊（依報導：第一進一樓左邊擺碾米機、右邊堆白米） */
  machine: box(-2.45, -0.95, -5.3, -3.2, 2.3),
  heap: box(-0.85, -0.25, -5.3, -4.65, 0.45),
  whiteRice: box(1.1, 2.58, -5.5, -3.0, 1.4),
  /** 天井：曬穀的竹篩架、水缸 */
  drying: box(-2.45, -1.2, -7.05, -6.2, 0.7),
  waterJar: box(1.85, 2.45, -7.65, -7.05, 0.8),
  /** 後進：米倉（左右兩堆米袋）、靠在後牆的木梯 */
  granaryLeft: box(-2.58, -1.0, -10.75, -8.6, 1.9),
  granaryRight: box(0.8, 2.58, -10.75, -9.0, 1.6),
  ladder: box(-0.6, 0.2, -10.8, -10.45, 3.2),
}

/** 戰後：米袋少了，後進的一部分變成住家（方桌、板凳、碗櫃）與倉庫 */
export const POSTWAR = {
  counter: MILL.counter,
  sacks: box(-2.58, -1.8, -2.0, -0.5, 0.9),
  machine: MILL.machine,
  whiteRice: box(1.6, 2.58, -5.2, -3.6, 0.9),
  waterJar: MILL.waterJar,
  /** 天井：洗衣的木盆與板凳 */
  washing: box(-2.05, -0.75, -6.95, -6.25, 0.4),
  storage: box(-2.58, -1.2, -10.75, -9.2, 1.4),
  homeTable: box(0.2, 1.35, -9.7, -8.65, 0.75),
  cupboard: box(2.1, 2.58, -10.4, -8.6, 1.8),
}

/* ═══════════ 1895–1930：初期的米業店屋 ═══════════ */

export const EARLY = {
  /** 木構的亭仔腳（簷柱）、半開的門板、帳桌、米袋與米斗 */
  posts: [-2.6, -0.95, 0.95, 2.6],
  postZ: 1.55,
  counter: box(1.2, 2.58, -1.7, -0.8, 0.88),
  sacks: box(-2.58, -1.6, -2.5, -0.5, 1.0),
  partitionZ: -3.0,
  /**
   * 騎樓與街邊（地段的東半邊；西半邊的街上原本就有一台人力車）：米袋堆、竹籮與木桶、米斗與凳子、扁擔、手推車
   */
  arcadeSacks: box(-2.7, -2.0, 1.75, 2.45, 0.9),
  barrels: box(-1.9, -1.35, 1.8, 2.45, 0.75),
  measureStool: box(-1.2, -0.75, 1.95, 2.45, 0.7),
  cart: box(-2.6, -1.1, 2.75, 3.9, 1.1),
  pole: box(-1.1, 0.9, 3.45, 4.05, 0.6),
}

/* ═══════════ 各年代的人物（情境人物，不對應任何實際的人） ═══════════ */

export const RICE_NPCS = {
  earlyRiceTrade: [
    { id: 'merchant', look: 'riceMerchant', pose: 'stand', x: 0.6, z: 0.9, rotationY: 0.25, walkway: true },
    { id: 'porter', look: 'ricePorter', pose: 'carry', x: 1.4, z: 4.4, rotationY: Math.PI / 2 + 0.3 },
    { id: 'miller', look: 'riceMiller', pose: 'ladle', x: -0.55, z: 2.95, rotationY: -2.6 },
  ],
  riceMill: [
    { id: 'clerk', look: 'riceClerk', pose: 'stand', x: 1.9, z: -2.0, rotationY: Math.PI / 2 + Math.PI },
    { id: 'miller', look: 'riceMillerModern', pose: 'ladle', x: -0.55, z: -3.6, rotationY: -Math.PI / 2 - 0.3 },
  ],
  postwarRiceHouse: [{ id: 'keeper', look: 'postwarVendor', pose: 'stand', x: 1.9, z: -2.1, rotationY: -Math.PI / 2 }],
  riceAndShineModern: [
    { id: 'diner-a', look: 'revivalDiner', pose: 'eat', table: 'm2', side: 1 },
    { id: 'diner-b', look: 'revivalDinerWoman', pose: 'eat', table: 'm2', side: -1 },
    { id: 'staff', look: 'revivalStaffBack', pose: 'stand', x: 2.3, z: -1.45, rotationY: -Math.PI / 2 },
  ],
}

/* ═══════════ 動線（建築本地座標；level 1 是二樓） ═══════════ */

export const RICE_ROUTE = {
  riceAndShineModern: [
    { id: 'street', x: 0, z: 3.0 },
    { id: 'arcade', x: 0, z: 1.0 },
    { id: 'entrance', x: 0, z: -0.8 },
    { id: 'aisle', x: 0.95, z: -1.3 },
    { id: 'dining', x: 0.95, z: -3.25 },
    { id: 'dining-back', x: 0.95, z: -5.35 },
    { id: 'to-exhibit', x: -1.1, z: -5.4 },
    { id: 'exhibit', x: -1.3, z: -3.0 },
    { id: 'basket', x: -1.15, z: -4.5 },
    { id: 'measure', x: -1.25, z: -5.35 },
    { id: 'courtyard-door', x: 0, z: -5.9 },
    { id: 'courtyard', x: 0, z: -6.9 },
    { id: 'back-door', x: -0.5, z: -7.9 },
    { id: 'back', x: -0.5, z: -8.9 },
    { id: 'to-stair', x: -1.7, z: -9.45 },
    { id: 'stair-foot', x: -2.35, z: -9.6 },
    { id: 'stair-start', x: -2.35, z: -10.35 },
    { id: 'stair-top', x: 2.15, z: -10.35, level: 1 },
    { id: 'landing', x: 2.15, z: -9.0, level: 1 },
    { id: 'corridor', x: 2.15, z: -6.8, level: 1 },
    { id: 'upstairs', x: 2.1, z: -4.6, level: 1 },
    { id: 'nanjie', x: 2.0, z: -2.7, level: 1 },
    { id: 'front-aisle', x: 1.9, z: -0.25, level: 1 },
    { id: 'window', x: 0.0, z: 0.4, level: 1 },
  ],
  riceMill: [
    { id: 'street', x: 0, z: 3.0 },
    { id: 'arcade', x: 0, z: 1.0 },
    { id: 'entrance', x: 0, z: -0.9 },
    { id: 'counter', x: 0.35, z: -1.4 },
    { id: 'machine', x: 0.25, z: -3.9 },
    { id: 'courtyard-door', x: 0.1, z: -5.9 },
    { id: 'courtyard', x: 0, z: -6.9 },
    { id: 'back-door', x: -0.5, z: -7.9 },
    { id: 'granary', x: -0.2, z: -9.2 },
  ],
}

/* ═══════════ 資訊熱點（各年代） ═══════════ */

/**
 * 走近時出現提示，電腦按 E、觸控點提示或點那個物件，開啟這個年代介紹的對應章節。clickOnly 只能點選物件。
 * camera：開啟介紹時的鏡頭位置與注視點（[x, y, z]，建築本地座標；二樓的 y 已經包含樓板高度）。
 */
const F2 = RS.floor2
export const RICE_HOTSPOTS = {
  earlyRiceTrade: [
    { id: 'early-street', label: '北街米業逐漸形成', note: '米袋、竹籮與木牌', chapter: 'early', point: [-0.25, 2.25], level: 0, radius: 1.2, prompt: [0, 3.2, 1.2], camera: { position: [-1.9, 2.0, 6.4], target: [0.2, 1.9, 0.4] } },
    { id: 'early-measure', label: '米斗', note: '量米的木斗', chapter: 'rice-measure', clickOnly: true, point: [-0.6, 2.25], level: 0, radius: 0, prompt: [-0.98, 1.6, 2.2], camera: { position: [0.3, 1.5, 3.7], target: [-0.98, 0.75, 2.2] } },
  ],
  riceMill: [
    { id: 'mill-front', label: '迪化街329號米行／碾米間', note: '紅磚拱券的米行', chapter: 'rice-mill', point: [0, 1.0], level: 0, radius: 1.0, prompt: [0, 3.0, 1.0], camera: { position: [-1.7, 2.0, 5.8], target: [0, 2.8, 0.6] } },
    { id: 'mill-counter', label: '米斗與帳桌', note: '秤、算盤與帳本', chapter: 'rice-measure', point: [0.35, -1.4], level: 0, radius: 0.8, prompt: [1.8, 1.9, -1.2], camera: { position: [-0.9, 1.6, -0.6], target: [1.9, 1.0, -1.2] } },
    { id: 'mill-machine', label: '碾米機', note: '稻穀變成白米', chapter: 'rice-milling', point: [0.25, -3.9], level: 0, radius: 0.85, prompt: [-1.6, 2.6, -4.2], camera: { position: [0.95, 1.75, -2.4], target: [-1.6, 1.3, -4.3] } },
    { id: 'mill-trade', label: '北街為什麼曾經都是米行？', note: '天井', chapter: 'dadaocheng-rice-trade', point: [0, -6.9], level: 0, radius: 0.85, prompt: [0, 2.4, -6.9], camera: { position: [1.0, 1.6, -5.2], target: [-0.6, 1.5, -8.8] } },
    { id: 'mill-granary', label: '米倉', note: '堆疊的米袋與木梯', chapter: 'rice-mill', point: [-0.2, -9.2], level: 0, radius: 0.85, prompt: [0, 2.6, -9.6], camera: { position: [0.3, 1.7, -8.2], target: [-1.3, 1.2, -10.2] } },
  ],
  postwarRiceHouse: [
    { id: 'postwar-front', label: '戰後米業與產業轉變', note: '老化的紅磚店屋', chapter: 'decline', point: [0, 1.0], level: 0, radius: 1.0, prompt: [0, 3.0, 1.0], camera: { position: [-1.7, 2.0, 5.8], target: [0, 2.8, 0.6] } },
    { id: 'postwar-tools', label: '留下來的碾米器具', note: '蓋著布的碾米機', chapter: 'rice-milling', point: [-0.3, -3.8], level: 0, radius: 0.85, prompt: [-1.6, 2.6, -4.2], camera: { position: [0.95, 1.75, -2.4], target: [-1.6, 1.3, -4.3] } },
    { id: 'postwar-home', label: '住家與倉庫', note: '後進的日常', chapter: 'decline', point: [-0.3, -8.6], level: 0, radius: 0.85, prompt: [0.8, 2.3, -9.2], camera: { position: [-0.5, 1.6, -7.6], target: [1.2, 1.0, -9.6] } },
  ],
  riceAndShineModern: [
    { id: 'rs-arcade', label: '稻舍 Rice & Shine', note: '老屋再生的米食餐館', chapter: 'rice-shine', point: [0, 1.0], level: 0, radius: 1.0, prompt: [0, 3.0, 1.0], camera: { position: [-1.7, 2.0, 5.8], target: [0, 3.2, 0.6] } },
    { id: 'rs-renewal', label: '老屋再生', note: '米行 → 歷史建築 → 稻舍', chapter: 'renewal', point: [-1.15, -0.95], level: 0, radius: 0.7, prompt: [-1.3, 2.4, -0.4], camera: { position: [-0.6, 1.6, -2.6], target: [-1.3, 1.5, -0.25] } },
    { id: 'rs-dining', label: '米食料理', note: '木托盤上的套餐', chapter: 'meals', point: [0.95, -3.25], level: 0, radius: 0.8, prompt: [0.15, 1.7, -2.3], camera: { position: [0.95, 1.55, -1.4], target: [0.15, 0.8, -2.3] } },
    { id: 'rs-exhibit', label: '北街為什麼曾經都是米行？', note: '米業文化展示', chapter: 'dadaocheng-rice-trade', point: [-1.3, -3.0], level: 0, radius: 0.85, prompt: [-2.3, 2.75, -2.8], camera: { position: [0.3, 1.65, -2.6], target: [-2.3, 1.4, -2.9] } },
    { id: 'rs-measure', label: '米斗', note: '量米的木斗', chapter: 'rice-measure', point: [-1.25, -5.35], level: 0, radius: 0.6, prompt: [-2.1, 1.4, -5.35], camera: { position: [-0.7, 1.4, -4.6], target: [-2.1, 0.9, -5.35] } },
    { id: 'rs-basket', label: '竹籮與竹篩', note: '土礱、蓑衣與斗笠', chapter: 'rice-basket', point: [-1.15, -4.5], level: 0, radius: 0.6, prompt: [-2.1, 1.6, -4.65], camera: { position: [-0.5, 1.5, -3.8], target: [-2.1, 0.9, -4.65] } },
    { id: 'rs-courtyard', label: '天井', note: '日光、植物與壁畫', chapter: 'courtyard', point: [0, -6.9], level: 0, radius: 0.85, prompt: [-1.2, 3.2, -6.9], camera: { position: [1.2, 1.5, -6.3], target: [-2.4, 1.9, -7.0] } },
    { id: 'rs-milling', label: '碾米工廠', note: '舊碾米機', chapter: 'rice-milling', point: [-0.45, -8.9], level: 0, radius: 0.85, prompt: [0.95, 2.2, -8.85], camera: { position: [-0.9, 1.6, -8.2], target: [0.95, 1.0, -8.85] } },
    { id: 'rs-nanjie', label: '郭雪湖《南街殷賑》與大稻埕', note: '二樓的小展覽', chapter: 'nanjie', point: [2.0, -2.7], level: 1, radius: 0.85, prompt: [2.45, F2 + 2.7, -2.7], camera: { position: [0.6, F2 + 1.6, -2.2], target: [2.55, F2 + 1.7, -2.7] } },
  ],
}
