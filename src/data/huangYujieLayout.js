/**
 * 黃玉階文史館（歷史商號：元珍豆醬店）的位置、尺寸、室內配置、資訊熱點與鏡頭
 * （只在 2000–現在「老屋新生」；文化展示／歷史街屋，不是餐廳）
 *
 * 位置：迪化街一段224巷東側，導演的豆花店的北鄰。站在巷子裡正對兩棟建築時，
 * 左邊是紅磚拱窗的文史館，右邊是灰色立面的豆花店（使用者提供的實地照片）。
 * 文史館依豆花店的位置、朝向與面寬定位（data/actionBarLayout.js），兩棟之間留 5 公分的縫，不重疊；
 * 兩棟的騎樓由端牆上的拱門相連（照片：從文史館的騎樓看得到拱門另一側的豆花店），各自有入口、碰撞與互動。
 *
 * 建築本地座標（與豆花店相同的方向）：原點在騎樓柱列外緣的中央地面，+z 朝巷子（西），
 * +x 沿著立面往豆花店（南；從巷子看是右邊），室內在 -z。
 * 尺寸依照片的比例估算，並非測量；照片沒有拍到的深處是簡化的示意。
 */
import { ACTION_BAR_SITE, LANE, SHOP, laneToWorld } from './actionBarLayout.js'

/** 與豆花店之間的縫（公尺） */
const GAP = 0.05

export const MUSEUM = {
  id: 'huang-yujie-museum',
  /** 相鄰的建築：從巷子正對立面時，右邊（本地 +x）是導演的豆花店 */
  neighbours: { right: 'action-bar' },
  half: 2.375, // 面寬 4.75 m（照片中比豆花店窄）
  wallT: 0.2,
  arcade: SHOP.arcade, // 騎樓深度與豆花店相同（兩棟的騎樓相連）
  back: -9.4, // 後牆外緣（後面緊鄰永樂市場的街廓）
  /** 立面的高度：灰色的大梁、二樓樓板、窗下的飾板帶、拱窗、簷口與女兒牆 */
  beam: [3.2, 3.6],
  floor2: 3.6,
  panels: [4.05, 4.75],
  sill: 4.85,
  spring: 6.05,
  cornice: 6.95,
  parapet: 7.4,
  /** 二樓三組拱窗：中央較寬、兩側較窄（三窗四柱） */
  windows: [
    { x: -1.5, w: 0.82 },
    { x: 0, w: 1.24 },
    { x: 1.5, w: 0.82 },
  ],
  pilasters: [-2.13, -0.82, 0.82, 2.13],
  /** 窗下的飾板：左右是有淺色邊框的彩色陶飾板，中央是黑底金字的「元珍」匾額 */
  ceramics: [
    { x: -1.5, w: 0.86, kind: 'fish' },
    { x: 1.5, w: 0.86, kind: 'peony' },
  ],
  plaque: { x: 0, w: 1.42, h: 0.62 },
  /** 一樓：兩根紅磚圓柱（灰色柱頭與柱礎）與退縮的木造門面 */
  columns: [-1.0, 1.0],
  columnZ: -0.42,
  columnR: 0.26,
  columnTop: 3.2,
  /** 兩端的牆墩（右邊的牆墩中間是通往豆花店騎樓的拱門，見 SHOP.passage） */
  pier: 0.4,
  door: { minX: -0.8, maxX: 0.8, height: 2.45 },
  /** 騎樓頂部露出的木梁與木板 */
  arcadeCeiling: 3.15,
  /** 門前的木質花槽（在柱列外緣的路邊）；右端留出走進騎樓的通道（另外也可以從豆花店的騎樓穿過拱門） */
  planter: { minX: -2.2, maxX: 1.4, minZ: 0.02, maxZ: 0.38, height: 0.62 },
  /** 一樓展間的內側範圍 */
  room: { minX: -2.175, maxX: 2.175, minZ: -9.2, maxZ: -2.0 },
  ceiling: 3.05, // 木梁下緣
  boards: 3.3, // 天花木板
  /** 入口一側（左牆前）的陶醬缸：大小略有差異，部分加蓋或布封（展示物） */
  entryJars: [
    { x: -1.88, z: -2.38, r: 0.24, h: 0.6, cover: 'wood' },
    { x: -1.86, z: -2.9, r: 0.29, h: 0.74, cover: 'cloth' },
    { x: -1.92, z: -3.38, r: 0.2, h: 0.5, cover: 'paper' },
    { x: -1.52, z: -2.62, r: 0.18, h: 0.44, cover: 'wood' },
  ],
  entryJarsBox: { minX: -2.175, maxX: -1.3, minZ: -3.62, maxZ: -2.1 },
  /** 左牆：黃玉階的人物展示牆（木板牆、肖像看板與文件框）與「日治初期大稻埕的初等教育發展」大型展板 */
  portraitWall: { minZ: -3.62, maxZ: -2.08, y0: 0.9, y1: 2.85 },
  eduWall: { minZ: -7.52, maxZ: -3.78, y0: 0.75, y1: 2.62 },
  /** 左後方：舊式木櫃台與茶席（圓形竹托盤、黑色茶壺、杯底朝上的茶杯），上方掛著「源珍」布旗 */
  teaCounter: { minX: -2.175, maxX: -1.6, minZ: -9.15, maxZ: -7.7, height: 0.94 },
  /** 右前方：醬缸與商號陳列區（深色木櫃台上的大陶缸、上方掛秤的木架、竹篩、階梯式木收納架） */
  jarCounter: { minX: 1.55, maxX: 2.175, minZ: -3.4, maxZ: -2.14, height: 0.78 },
  /** 櫃台上的陶缸（x、z 是缸的中心；label 是缸身紅色菱形紙上的字） */
  counterJars: [
    { x: 1.87, z: -2.46, r: 0.25, h: 0.6, cover: 'red', label: '醬', labelEn: 'Soy sauce' },
    { x: 1.88, z: -2.98, r: 0.26, h: 0.66, cover: 'open', label: '醋', labelEn: 'Vinegar' },
    { x: 1.72, z: -3.26, r: 0.15, h: 0.36, cover: 'burlap', label: '醋', labelEn: 'Vinegar' },
  ],
  jarRack: { minX: 1.7, maxX: 2.175, minZ: -3.95, maxZ: -3.44 },
  jarArea: { minX: 1.33, maxX: 2.175, minZ: -3.98, maxZ: -2.1 },
  /** 右牆：高到天花的深色木製開放層架（兩組，每層下方有雕花托架） */
  shelves: { minX: 1.725, maxX: 2.175, minZ: -7.62, maxZ: -4.06, height: 2.98 },
  /** 中央的導覽交流區：兩張深色長木桌（沿著展間的長邊）、長板凳與木椅 */
  tables: [
    { id: 'a', minX: -0.45, maxX: 0.25, minZ: -5.6, maxZ: -4.2, right: 'bench' },
    { id: 'b', minX: -0.45, maxX: 0.25, minZ: -7.4, maxZ: -6.4, right: 'chairs' },
  ],
  tableHeight: 0.76,
  bench: { width: 0.28, height: 0.45, gap: 0.09 },
  /** 後牆：小展桌（深藍桌布）、藤椅，牆上是「學貫中西」匾額、淺綠色老窗框與人體解剖圖掛軸 */
  desk: { minX: 0.15, maxX: 1.6, minZ: -9.15, maxZ: -8.6, height: 0.76 },
  rattanChair: { x: -0.1, z: -8.6 },
  backWall: { plaque: { x: 0.55, y: 2.52, w: 1.86, h: 0.5 }, window: { x: -0.4, y: 1.58, w: 0.72, h: 0.92 }, scroll: { x: 1.2, y: 1.6, w: 0.6, h: 0.96 } },
  /** 天花下懸掛的大型布旗（米白布面、紅色剪紙風紋樣）與旗下的「源珍」小布旗 */
  banner: { x: -0.7, z: -8.15, w: 1.5, h: 0.95, y: 2.72, tilt: -0.75 },
}

/** 大布旗的下緣（旗下掛著「源珍」小布旗）：布旗繞左右軸傾斜 tilt */
export function museumBannerEdge() {
  const { y, z, h, tilt } = MUSEUM.banner
  return { y: y - (h / 2) * Math.cos(tilt), z: z - (h / 2) * Math.sin(tilt) }
}

/** 文史館在巷子座標的原點（豆花店北側：豆花店的面寬、縫與文史館的半個面寬） */
const ORIGIN_LANE = { x: SHOP.origin[0], z: SHOP.origin[2] - SHOP.half - GAP - MUSEUM.half }

/** 世界座標的原點與朝向（不取代任何地段：224巷的巷口已經取代了 south-17） */
export const MUSEUM_SITE = (() => {
  const p = laneToWorld(ORIGIN_LANE.x, ORIGIN_LANE.z)
  return { x: p.x, z: p.z, rotationY: ACTION_BAR_SITE.rotationY + SHOP.rotationY, replaces: [] }
})()

/** 建築本地座標 → 世界座標 */
export function museumToWorld(x, z) {
  const { x: ox, z: oz, rotationY } = MUSEUM_SITE
  const c = Math.cos(rotationY)
  const s = Math.sin(rotationY)
  return { x: ox + x * c + z * s, z: oz - x * s + z * c }
}

/** 文史館在巷子座標的範圍（巷子東側、豆花店北側） */
export function museumLaneRange() {
  return { minZ: ORIGIN_LANE.z - MUSEUM.half, maxZ: ORIGIN_LANE.z + MUSEUM.half, minX: ORIGIN_LANE.x, maxX: ORIGIN_LANE.x - MUSEUM.back, laneHalf: LANE.half }
}

/** 中央長桌兩側的長板凳（建築本地座標的矩形） */
export function museumBenches(table) {
  const { width, gap } = MUSEUM.bench
  const minZ = table.minZ + 0.05
  const maxZ = table.maxZ - 0.05
  const left = { minX: table.minX - gap - width, maxX: table.minX - gap, minZ, maxZ }
  const right = { minX: table.maxX + gap, maxX: table.maxX + gap + width, minZ, maxZ }
  return table.right === 'bench' ? [left, right] : [left]
}

/** 長桌 b 右側的兩張木椅（中心位置） */
export function museumChairs(table) {
  if (table.right !== 'chairs') return []
  const x = table.maxX + 0.36
  const len = table.maxZ - table.minZ
  return [
    { x, z: table.minZ + len * 0.28 },
    { x, z: table.minZ + len * 0.72 },
  ]
}

/** 長桌連同板凳、木椅的障礙範圍 */
export function museumTableBox(table) {
  const parts = [table, ...museumBenches(table), ...museumChairs(table).map((c) => ({ minX: c.x - 0.22, maxX: c.x + 0.22, minZ: c.z - 0.22, maxZ: c.z + 0.22 }))]
  return {
    minX: Math.min(...parts.map((p) => p.minX)),
    maxX: Math.max(...parts.map((p) => p.maxX)),
    minZ: Math.min(...parts.map((p) => p.minZ)),
    maxZ: Math.max(...parts.map((p) => p.maxZ)),
  }
}

/**
 * 展間的動線（建築本地座標，依序）：騎樓 → 入口 → 左牆的展示牆 → 中央長桌交流區 → 右牆的高層木架 →
 * 醬缸商號展示區 → 後方的小展桌與茶席 → 回到出口。端對端測試與單元測試都沿著這條動線走。
 */
export const MUSEUM_ROUTE = [
  { id: 'arcade', x: 0.9, z: -1.0 },
  { id: 'entrance', x: 0, z: -2.45 },
  { id: 'portrait', x: -0.95, z: -3.0 },
  { id: 'corner-in', x: -0.85, z: -3.6 },
  { id: 'aisle', x: -1.45, z: -4.3 },
  { id: 'edu-wall', x: -1.45, z: -5.6 },
  { id: 'cross', x: -1.2, z: -6.0 },
  { id: 'tables', x: -0.1, z: -6.0 },
  { id: 'shelves', x: 1.15, z: -5.8 },
  { id: 'jar-area', x: 0.85, z: -2.95 },
  { id: 'right-aisle', x: 1.2, z: -6.6 },
  { id: 'right-back', x: 1.2, z: -7.7 },
  { id: 'desk', x: 0.85, z: -7.95 },
  { id: 'tea', x: -1.05, z: -7.95 },
  { id: 'left-aisle', x: -1.45, z: -7.2 },
  { id: 'back-to-door', x: -1.45, z: -4.3 },
  { id: 'corner-out', x: -0.85, z: -3.6 },
  { id: 'exit', x: 0, z: -2.45 },
  { id: 'arcade-out', x: 0.9, z: -1.0 },
]

/**
 * 資訊熱點（HeritageExhibitHotspots；建築本地座標）：走近時出現提示，電腦按 E、觸控點提示或點那個物件，
 * 開啟文史館介紹的對應章節。clickOnly 的熱點不以距離觸發，只能點選那個物件。
 * camera：開啟介紹時的鏡頭位置與注視點（[x, y, z]，建築本地座標）。
 */
export const HUANG_YUJIE_HOTSPOTS = [
  {
    id: 'facade',
    label: '黃玉階文史館', labelEn: 'Huang Yujie Museum of Culture and History',
    note: '紅磚拱窗的歷史街屋（元珍豆醬店）', noteEn: 'A historic red-brick shophouse with arched windows (Yuanzhen Bean-Sauce Shop)',
    chapter: 'museum',
    point: [0, -0.95],
    level: 0,
    radius: 1.0,
    prompt: [0, 2.85, -1.0],
    camera: { position: [-1.4, 1.8, 3.4], target: [0.15, 3.5, -0.8] },
  },
  {
    id: 'portrait',
    label: '黃玉階與大稻埕', labelEn: 'Huang Yujie and Dadaocheng',
    note: '人物展示牆', noteEn: 'Display wall on the man and his life',
    chapter: 'huang',
    point: [-0.95, -3.0],
    level: 0,
    radius: 0.9,
    prompt: [-1.55, 2.55, -2.85],
    camera: { position: [0.95, 1.65, -2.55], target: [-2.0, 1.55, -2.95] },
  },
  {
    id: 'board',
    label: '社會改革與初等教育', labelEn: 'Social reform and primary education',
    note: '文史展板', noteEn: 'History display boards',
    chapter: 'reform',
    point: [-1.45, -5.6],
    level: 0,
    radius: 1.05,
    prompt: [-1.75, 2.98, -5.6],
    camera: { position: [1.15, 1.72, -5.65], target: [-2.1, 1.55, -5.65] },
  },
  {
    id: 'jar-area',
    label: '元珍豆醬店與飲食生活', labelEn: 'Yuanzhen Bean-Sauce Shop and food life',
    note: '醬缸與商號陳列', noteEn: 'Sauce vats and shop displays',
    chapter: 'yuanzhen',
    point: [0.85, -2.95],
    level: 0,
    radius: 0.85,
    prompt: [1.75, 2.5, -2.8],
    camera: { position: [-0.55, 1.62, -2.45], target: [2.0, 1.05, -2.95] },
  },
  {
    id: 'tea',
    label: '日常器物與商號生活', labelEn: 'Everyday objects and shop life',
    note: '茶席與舊式器物', noteEn: 'A tea setting and old-style objects',
    chapter: 'objects',
    point: [-1.05, -7.95],
    level: 0,
    radius: 0.85,
    prompt: [-1.85, 2.15, -8.0],
    camera: { position: [-0.15, 1.55, -6.95], target: [-1.95, 1.0, -8.2] },
  },
  {
    id: 'plaque',
    label: '「元珍」匾額', labelEn: 'The "Yuanzhen" plaque',
    note: '二樓窗下的黑底金字匾額', noteEn: 'A black plaque with gold lettering beneath the first-floor window',
    chapter: 'yuanzhen',
    clickOnly: true,
    point: [0, -0.95],
    level: 0,
    radius: 0,
    prompt: [0, 4.4, 0.2],
    camera: { position: [0.6, 2.9, 4.6], target: [0, 4.45, 0.14] },
  },
  {
    id: 'jars',
    label: '陶醬缸', labelEn: 'Earthenware sauce vat',
    note: '入口一側的展示物', noteEn: 'An exhibit beside the entrance',
    chapter: 'yuanzhen',
    clickOnly: true,
    point: [-1.4, -3.0],
    level: 0,
    radius: 0,
    prompt: [-1.8, 1.4, -2.95],
    camera: { position: [0.25, 1.4, -2.35], target: [-1.85, 0.55, -2.95] },
  },
  {
    id: 'beams',
    label: '老屋的木梁', labelEn: 'Timber beams of the old house',
    note: '裸露的木梁與修補構件', noteEn: 'Exposed timber beams and repaired members',
    chapter: 'museum',
    clickOnly: true,
    point: [0, -5.0],
    level: 0,
    radius: 0,
    prompt: [0, 2.8, -5.0],
    camera: { position: [0.95, 1.45, -2.6], target: [-0.1, 3.05, -6.4] },
  },
  {
    id: 'shelves',
    label: '木製展示架', labelEn: 'Wooden display rack',
    note: '舊商號的包裝、器物與文獻', noteEn: 'Packaging, objects and documents from an old shop',
    chapter: 'objects',
    clickOnly: true,
    point: [1.2, -5.8],
    level: 0,
    radius: 0,
    prompt: [1.6, 3.1, -5.8],
    camera: { position: [-0.35, 1.68, -5.85], target: [2.0, 1.6, -5.85] },
  },
  {
    id: 'study',
    label: '「學貫中西」匾額', labelEn: 'The "Learned in East and West" plaque',
    note: '後牆的小展桌', noteEn: 'A small display table at the back wall',
    chapter: 'huang',
    clickOnly: true,
    point: [0.85, -8.0],
    level: 0,
    radius: 0,
    prompt: [0.55, 2.95, -8.9],
    camera: { position: [0.7, 1.6, -6.7], target: [0.6, 1.75, -9.15] },
  },
]
