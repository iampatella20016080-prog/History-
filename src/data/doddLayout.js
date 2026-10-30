/**
 * 寶順洋行（Dodd & Co.）港口商街的精製茶廠室內（第 10 階段「一箱茶的旅程」）
 *
 * 洋行與精製茶廠實際在河邊的建昌街、千秋街，街上這棟洋樓是情境示意（見 shops.js 的 note）；
 * 室內的格局查無，依 Davidson（1903，Ch. XXIII）記載的精製流程重建：
 * 揀茶（大竹篩、婦女按件計酬）→ 焙茶（磚臺上的焙坑與焙籠、炭火）→ 裝箱（鉛襯木箱焊封）。
 * 全部標「歷史情境重建」；查證紀錄見 docs/research/tea-journey-qing-port.md。
 *
 * 本地座標：原點在立面中心，+z 朝街道（南），室內在 -z；+x 是從街上看的右側。
 * 世界座標：site { x: 5.15, z: -4.5, rotationY: 0 }（取代北側地段 north-5）。
 */

export const DODD = {
  site: { x: 5.15, z: -4.5, rotationY: 0 },
  half: 3.45, // 面寬 6.9 m
  depth: 11,
  wallT: 0.3,
  groundH: 3.8, // 一樓挑高（洋樓）
  upperH: 3.0,
  ceiling: 3.5, // 室內天花
  walkD: 1.7, // 簷下步道（與街道的可行走範圍相接）
  walkH: 0.15,
  door: { minX: -0.9, maxX: 0.9 }, // 中央大門的開口
  /** 室內（牆內）的範圍 */
  room: { minX: -3.1, maxX: 3.1, minZ: -8.6, maxZ: -0.34 },

  /** 揀茶區（前段右側）：兩張矮桌、大竹篩與坐著的揀茶女 */
  picking: {
    tables: [
      { x: 1.7, z: -1.9, rotationY: 0.12 },
      { x: 2.1, z: -3.6, rotationY: -0.1 },
    ],
    tableSize: { width: 1.5, depth: 0.9, height: 0.55 },
    /** 揀完裝茶的簍子與地上的茶袋 */
    baskets: [
      { x: 0.9, z: -2.8 },
      { x: 2.8, z: -2.7 },
    ],
    sacks: [{ x: 2.9, z: -1.2 }],
  },

  /** 焙茶區（後段左側）：磚臺上的焙坑與焙籠（Davidson：坑深二呎、徑二呎、相距一呎） */
  roasting: {
    platform: { minX: -2.9, maxX: -0.7, minZ: -8.3, maxZ: -5.4, height: 0.32 },
    pits: [
      { x: -2.3, z: -6.1 },
      { x: -1.3, z: -6.1 },
      { x: -2.3, z: -7.5 },
      { x: -1.3, z: -7.5 },
    ],
    pitRadius: 0.3,
    /** 焙籠（高約三呎、形如骰盅）：兩個在坑上、一個在旁邊待用 */
    baskets: [
      { x: -2.3, z: -6.1, onPit: true },
      { x: -1.3, z: -7.5, onPit: true },
      { x: -0.35, z: -7.9, onPit: false },
    ],
  },

  /** 裝箱區（後段右側）：工作檯（鉛襯與焊具）、裝好與空的茶箱 */
  packing: {
    bench: { x: 2.2, z: -7.6, width: 2.0, depth: 0.8, height: 0.82, rotationY: 0 },
    chests: [
      { x: 2.6, z: -6.2, stack: 2, rotationY: 0.1 },
      { x: 1.5, z: -6.4, stack: 1, rotationY: -0.15 },
    ],
    leadSheets: { x: 2.9, z: -8.2 },
  },

  /** 側牆的層架（茶樣罐）與帳桌 */
  shelf: { x: -2.95, z0: -4.6, z1: -1.4 },
  desk: { x: -2.2, z: -0.9, rotationY: Math.PI / 2 },

  /** 情境人物（室內 zone；不具名）：兩位揀茶女（坐）、一位焙茶工、一位點貨的職員 */
  npcs: [
    { id: 'dodd-picker-a', look: 'qingPicker', pose: 'sort', x: 1.7, z: -1.15, rotationY: Math.PI, seatY: 0.42 },
    { id: 'dodd-picker-b', look: 'qingPickerBlue', pose: 'sort', x: 2.15, z: -4.35, rotationY: 0.1, seatY: 0.42 },
    { id: 'dodd-roaster', look: 'qingRoaster', pose: 'ladle', x: -1.8, z: -4.9, rotationY: Math.PI, seatY: 0 },
    { id: 'dodd-clerk', look: 'qingClerk', pose: 'stand', x: 1.0, z: -5.6, rotationY: Math.PI / 2 + 0.3, seatY: 0 },
  ],
}

/** 本地 → 世界座標 */
export function doddToWorld(x, z) {
  const { x: ox, z: oz } = DODD.site
  return { x: ox + x, z: oz + z }
}

const at = (x, y, z) => {
  const p = doddToWorld(x, z)
  return [p.x, y, p.z]
}

/**
 * 資訊熱點（走近出現提示、點開對應章節；格式同其他店家，經 shops.js 的 hotspotsToWorld 轉換）：
 * - 揀茶桌 → 「洋樓街、教會與揀茶女」（street）
 * - 焙茶區 → 「精製茶廠」（refinery）
 * - 裝箱檯 → 「器物：茶箱」（tea-chest）
 */
export const DODD_HOTSPOTS = [
  {
    id: 'front',
    label: '寶順洋行', labelEn: 'Dodd & Co. (Boshun hong)',
    note: '英商陶德的洋行：臺灣烏龍茶外銷的起點', noteEn: 'John Dodd\'s British hong: the starting point of Taiwan\'s oolong tea exports',
    chapter: 'dodd',
    level: 0,
    radius: 2.6,
    point: [0, 1.2],
    prompt: [0, 3.0, 0.4],
    camera: { position: [-5.0, 4.2, 6.2], target: [0, 3.2, 0] },
  },
  {
    id: 'picking',
    label: '揀茶桌', labelEn: 'Tea-sorting table',
    note: '婦女坐在大竹篩前挑出茶枝與壞葉，按件計酬', noteEn: 'Women sit before large bamboo sieves picking out twigs and spoiled leaves, paid by the piece',
    chapter: 'street',
    level: 0,
    radius: 1.9,
    point: [1.9, -2.75],
    prompt: [1.9, 1.5, -2.75],
    camera: { position: [0.1, 1.7, -4.3], target: [2.0, 0.8, -2.5] },
  },
  {
    id: 'roasting',
    label: '焙茶區', labelEn: 'Tea-firing area',
    note: '磚臺上的焙坑燒著炭火，茶在焙籠裡烘上八到十個小時', noteEn: 'Charcoal burns in the firing pits on the brick platform, and the tea is fired in baskets for eight to ten hours',
    chapter: 'refinery',
    level: 0,
    radius: 2.0,
    point: [-1.6, -5.9],
    prompt: [-1.6, 1.7, -5.9],
    camera: { position: [0.9, 1.8, -4.4], target: [-1.9, 0.8, -6.6] },
  },
  {
    id: 'packing',
    label: '裝箱檯', labelEn: 'Packing bench',
    note: '茶趁熱裝進鉛襯的木箱焊封，等著挑去碼頭', noteEn: 'The tea is packed while still warm into lead-lined wooden chests, soldered shut and carried to the wharf',
    chapter: 'tea-chest',
    level: 0,
    radius: 1.9,
    point: [2.1, -6.9],
    prompt: [2.1, 1.6, -6.9],
    camera: { position: [0.0, 1.8, -5.2], target: [2.3, 0.9, -7.2] },
  },
]

/** 室內可以近看的器物（data/inspectObjects.js 的 STREET_INSPECTABLES 引用這些位置） */
export const DODD_INSPECT_SPOTS = {
  'dodd-tea-tally': { position: at(0.9, 0.6, -2.8), prompt: at(0.9, 1.2, -2.8), radius: 1.6 },
  'dodd-roasting-basket': { position: at(-0.35, 0.5, -7.9), prompt: at(-0.35, 1.4, -7.9), radius: 1.7 },
}
