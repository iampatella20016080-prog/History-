/**
 * 林華泰茶行・港口商街版室內（第 10 階段「一箱茶的旅程」）
 *
 * 1883 年起做毛茶的篩選與精製（官網）；創辦人與最初的店址查無，
 * 這個年代的店面與室內格局都是歷史情境重建：前店（櫃台與茶箱茶甕）、秤茶桌（桿秤與茶簍）、
 * 後段的焙茶區（焙坑與焙籠，形制依 Davidson 1903，日治初期記載、推定相近）。
 * 查證紀錄見 docs/research/lin-hua-tai.md 與 tea-journey-qing-port.md。
 *
 * 本地座標：原點在立面中心（地段 x=-22、z=-4.5），+z 朝街道，室內在 -z。
 * 只有港口商街的 variant 走 `lin-hua-tai-qing` 建築樣式；其他年代仍是一般街屋外觀、沒有室內。
 */

export const LHT = {
  half: 3.0, // 面寬 6 m
  depth: 11,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 2.9,
  walkD: 1.7,
  walkH: 0.15,
  door: { minX: -1.0, maxX: 1.0 },
  room: { minX: -2.65, maxX: 2.65, minZ: -7.6, maxZ: -0.34 },

  /** 前店：右側的櫃台、左牆的層架（茶甕與茶箱）、地上的茶袋 */
  counter: { x: 1.55, z: -2.3, width: 1.9, depth: 0.62, height: 0.95, rotationY: Math.PI / 2 },
  shelf: { x: -2.5, z0: -3.9, z1: -0.9 },
  jarsOnFloor: [
    { x: -1.9, z: -0.9 },
    { x: -1.3, z: -0.75 },
  ],
  sacks: [
    { x: -1.9, z: -4.3 },
    { x: 2.3, z: -0.9 },
  ],

  /** 秤茶桌（前店中央偏左）：桿秤、茶簍與茶箱 */
  scaleTable: { x: -0.7, z: -2.9, width: 1.4, depth: 0.8, height: 0.8, rotationY: 0.06 },

  /** 隔間牆（前店與焙茶區之間，中央留門） */
  partition: { z: -4.9, doorMinX: -1.15, doorMaxX: 1.15 },

  /** 焙茶區（後段）：磚臺、兩個焙坑與焙籠、待焙的毛茶袋 */
  roasting: {
    platform: { minX: -2.4, maxX: 0.2, minZ: -7.3, maxZ: -5.5, height: 0.32 },
    pits: [
      { x: -1.8, z: -6.4 },
      { x: -0.5, z: -6.4 },
    ],
    pitRadius: 0.3,
    baskets: [
      { x: -1.8, z: -6.4, onPit: true },
      { x: 2.1, z: -7.1, onPit: false },
    ],
    sacks: [{ x: 2.2, z: -5.6 }],
  },

  /** 情境人物（室內 zone；不具名）：掌櫃在櫃台後、學徒在秤茶桌旁 */
  npcs: [
    { id: 'lht-keeper', look: 'qingClerk', pose: 'stand', x: 2.35, z: -2.3, rotationY: -Math.PI / 2, seatY: 0 },
    { id: 'lht-apprentice', look: 'qingApprentice', pose: 'stand', x: -0.65, z: -3.8, rotationY: 0.15, seatY: 0 },
  ],
}

/** 本地 → 世界座標（地段固定在 x=-22、z=-4.5、不旋轉） */
export const LHT_SITE = { x: -22, z: -4.5 }
export function lhtToWorld(x, z) {
  return { x: LHT_SITE.x + x, z: LHT_SITE.z + z }
}

const at = (x, y, z) => {
  const p = lhtToWorld(x, z)
  return [p.x, y, p.z]
}

/**
 * 資訊熱點（只在港口商街的年代版本）：
 * - 秤茶桌 → 「器物：桿秤」（tea-scale）
 * - 焙茶區 → 「前店後廠」（workshop）
 */
export const LHT_HOTSPOTS = [
  {
    id: 'front',
    label: '林華泰茶行', labelEn: 'Lin Huatai Tea Hong',
    note: '1883 年起做毛茶的篩選與精製', noteEn: 'From 1883, sorting and refining crude tea',
    chapter: 'tea-port',
    level: 0,
    radius: 2.6,
    point: [0, 1.2],
    prompt: [0, 2.8, 0.4],
    camera: { position: [5.0, 4.2, 6.2], target: [0, 3.2, 0] },
  },
  {
    id: 'scale',
    label: '秤茶桌', labelEn: 'Tea-weighing table',
    note: '毛茶論擔論斤計價，桿秤上的秤錘移到刻度就知道重量', noteEn: 'Crude tea is priced by the picul and the catty; slide the weight along the steelyard to the mark and you know the weight',
    chapter: 'tea-scale',
    level: 0,
    radius: 1.8,
    point: [-0.7, -2.9],
    prompt: [-0.7, 1.5, -2.9],
    camera: { position: [0.9, 1.7, -1.4], target: [-0.9, 0.9, -3.1] },
  },
  {
    id: 'roasting',
    label: '焙茶區', labelEn: 'Tea-firing area',
    note: '店後的焙坑與焙籠：毛茶再篩選、烘焙，才能出售或外銷', noteEn: 'The firing pits and baskets at the back: crude tea is sorted again and fired before it can be sold or exported',
    chapter: 'workshop',
    level: 0,
    radius: 2.0,
    point: [-1.1, -6.2],
    prompt: [-1.1, 1.7, -6.2],
    camera: { position: [0.8, 1.8, -4.6], target: [-1.4, 0.8, -6.6] },
  },
]

/** 室內可以近看的器物（data/inspectObjects.js 引用） */
export const LHT_INSPECT_SPOTS = {
  'lht-tea-scale': { position: at(-0.7, 0.85, -2.9), prompt: at(-0.7, 1.35, -2.9), radius: 1.6 },
  'lht-roasting-basket': { position: at(2.1, 0.5, -7.1), prompt: at(2.1, 1.4, -7.1), radius: 1.7 },
}
