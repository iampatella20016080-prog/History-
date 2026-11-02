/**
 * 有記名茶的室內配置（第 11 階段；查證與設計見 docs/research/interior-you-ji.md）
 *
 * 同一棟兩層的紅磚騎樓街屋、同一個地段（x=11.6、z=-4.5、不旋轉，面寬 6 m、進深 11 m），四個年代共用外殼的尺寸：
 * 騎樓步道 → 前店 → 隔間牆（中央留門）→ 店後的焙籠間；店後靠右牆的木樓梯上二樓（揀茶樓／清源堂）。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 * 擺設用「器物清單」描述（做法同林華泰，見 builders/shopInterior.js）；二樓的清單在 upstairs。
 *
 * 1949 年以前有記的精製廠在建昌街 11 號、茶行在民生西路口，不在這條街：酒樓繁華與摩登的格局是歷史情境重建；
 * 庶民生活依現況照片回推；老屋新生依官網門市頁的照片（門市、焙籠間、清源堂）。
 */

/** 四個年代共用的外殼尺寸（floor2：二樓樓板頂的高度、天花高、範圍與樓梯） */
export const YJ_SHELL = {
  half: 3.0,
  depth: 11,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 2.95,
  walkD: 1.7,
  room: { minX: -2.65, maxX: 2.65, minZ: -10.4, maxZ: -0.34 },
  floor2: {
    y: 3.55,
    ceiling: 2.6,
    room: { minX: -2.65, maxX: 2.65, minZ: -10.4, maxZ: -0.34 },
    // 靠右牆的木樓梯：從 z=-6.0（一樓）往後爬到 z=-9.6（二樓），上面是樓梯口的平台
    stair: { minX: 1.6, maxX: 2.6, bottomZ: -6.0, topZ: -9.6 },
  },
}

/** 二樓揀茶樓（酒樓繁華到庶民生活）：沿左牆三張揀茶桌、右牆放淺盤的木架、毛茶袋 */
const sortingLoft = (sorters) => ({
  items: [
    { type: 'pickingTable', x: -1.75, z: -2.0, width: 1.3, depth: 0.95, height: 0.62 },
    { type: 'pickingTable', x: -1.75, z: -4.3, width: 1.3, depth: 0.95, height: 0.62 },
    { type: 'pickingTable', x: -1.75, z: -6.6, width: 1.3, depth: 0.95, height: 0.62 },
    { type: 'trayRack', x: 2.42, z0: -4.6, z1: -3.0 },
    { type: 'sackPile', x: 1.9, z: -1.3, count: 2 },
    { type: 'sackPile', x: -1.7, z: -8.6, count: 2 },
  ],
  npcs: sorters,
})

/**
 * 各年代的版本：
 * - door：店門口可以走的寬度；frontPanels：兩側是門板、捲門或木框櫥窗
 * - partition：前店與焙籠間之間的隔間牆
 * - items：一樓的器物清單（builders/youJi/youJiFurniture.js 的 YJ_FURNITURE；block: false 的不擋路）
 * - upstairs：二樓的器物與人物（人物 level 1）
 * - npcs：情境人物（不具名）；lamps：一樓的吊燈
 */
export const YJ_VARIANTS = {
  /**
   * 1895–1930（歷史情境重建）：精製茶廠的一般情形。前店刷嘜頭、外銷泰國的竹篾茶箱；店後揀茶、兩口焙坑；二樓揀茶樓。
   */
  refineryBanquet: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'boards',
    partition: { z: -4.8, doorMinX: -1.0, doorMaxX: 1.0 },
    lamps: [],
    items: [
      { type: 'counter', x: 1.75, z: -2.4, length: 1.8, depth: 0.6, height: 0.95, goods: 'paper', abacus: true },
      { type: 'teaChestStack', x: -1.85, z: -1.4, count: 3 },
      { type: 'markStencilBoard', x: -2.6, z0: -4.4, z1: -2.6 },
      { type: 'markingTable', x: -0.2, z: -3.45, width: 1.2, depth: 0.7, height: 0.78 },
      { type: 'pickingTable', x: -1.75, z: -6.4, width: 1.3, depth: 0.95, height: 0.62 },
      { type: 'trayRack', x: -2.42, z0: -8.4, z1: -7.3 },
      { type: 'roastingPlatform', minX: -2.55, maxX: -1.0, minZ: -10.25, maxZ: -8.85, height: 0.32, pits: [[-2.15, -9.55], [-1.4, -9.55]], baskets: [[-2.15, -9.55]] },
      { type: 'sackPile', x: 0.1, z: -9.6, count: 2 },
    ],
    upstairs: sortingLoft([
      { id: 'yj-banquet-sorter-a', look: 'yjSorterBanquet', pose: 'sort', x: -0.75, z: -2.0, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
      { id: 'yj-banquet-sorter-b', look: 'lhtSorterBlue', pose: 'sort', x: -0.75, z: -4.3, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
    ]),
    npcs: [{ id: 'yj-banquet-marker', look: 'yjBanquetMarker', pose: 'stand', x: -0.2, z: -2.75, rotationY: Math.PI, seatY: 0 }],
  },

  /**
   * 1930–1945（歷史情境重建）：稻殼焙窟（深 58 公分，碳化稻殼燒成白灰當熱源）兩排共八個；
   * 前店多了磅仔與貼標籤的桌子（英文、泰文商標查無照片，標籤只寫 FORMOSA）。
   */
  refineryModern: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'boards',
    partition: { z: -4.6, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[0, -2.4], [-1.2, -7.6]],
    items: [
      { type: 'counter', x: 1.75, z: -2.4, length: 1.8, depth: 0.6, height: 0.95, goods: 'paper', abacus: true },
      { type: 'platformScale', x: 1.0, z: -3.95, rotationY: Math.PI / 2, style: 'iron' },
      { type: 'teaChestStack', x: -1.85, z: -1.4, count: 4 },
      { type: 'markStencilBoard', x: -2.6, z0: -4.2, z1: -2.6 },
      { type: 'labelTable', x: -0.45, z: -3.3, width: 1.0, depth: 0.6, height: 0.78 },
      { type: 'toolRack', x0: -2.6, x1: -1.1, z: -4.9 },
      { type: 'huskPits', minX: -2.55, maxX: -1.75, minZ: -9.5, maxZ: -5.9, pits: [[-2.15, -6.35], [-2.15, -7.3], [-2.15, -8.25], [-2.15, -9.1]], baskets: [[-2.15, -6.35], [-2.15, -8.25]] },
      { type: 'huskPits', minX: -0.7, maxX: 0.1, minZ: -9.5, maxZ: -5.9, pits: [[-0.3, -6.35], [-0.3, -7.3], [-0.3, -8.25], [-0.3, -9.1]], baskets: [[-0.3, -7.3], [-0.3, -9.1]] },
      { type: 'basketStack', x: 0.85, z: -9.9 },
    ],
    upstairs: sortingLoft([
      { id: 'yj-modern-sorter-a', look: 'yjSorterModern', pose: 'sort', x: -0.75, z: -2.0, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
      { id: 'yj-modern-sorter-b', look: 'yjSorterModernB', pose: 'sort', x: -0.75, z: -6.6, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
    ]),
    npcs: [{ id: 'yj-modern-roaster', look: 'lhtModernRoaster', pose: 'ladle', x: -1.22, z: -7.8, rotationY: -Math.PI / 2, seatY: 0 }],
  },

  /**
   * 1949 年遷入現址之後（依現況照片回推）：前店的評茶櫃台、木格抽屜茶櫃、「FORMOSA／有記選庄」木茶箱；
   * 店後八個焙窟（官網「約 40 個焙籠」只在對白說）、老木作風選機、炭焙工具、焙籠與竹簍；二樓揀茶樓。
   */
  factoryNo5: {
    door: { minX: -1.5, maxX: 1.5 },
    frontPanels: 'shutter',
    partition: { z: -4.6, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[0, -2.4], [-0.6, -7.6]],
    items: [
      { type: 'counter', x: 1.75, z: -2.4, length: 1.8, depth: 0.6, height: 0.95, goods: 'tasting' },
      { type: 'platformScale', x: 1.0, z: -3.95, rotationY: Math.PI / 2, style: 'iron' },
      { type: 'teaChestStack', x: -1.85, z: -1.4, count: 4, formosa: true },
      { type: 'drawerCabinet', x: -2.55, z0: -3.85, z1: -2.3 },
      { type: 'winnowingMachine', x: -1.8, z: -5.4 },
      { type: 'huskPits', minX: -2.55, maxX: -1.75, minZ: -9.9, maxZ: -6.5, pits: [[-2.15, -6.9], [-2.15, -7.85], [-2.15, -8.75], [-2.15, -9.5]], baskets: [[-2.15, -6.9], [-2.15, -8.75], [-2.15, -9.5]] },
      { type: 'huskPits', minX: -0.7, maxX: 0.1, minZ: -9.9, maxZ: -6.5, pits: [[-0.3, -6.9], [-0.3, -7.85], [-0.3, -8.75], [-0.3, -9.5]], baskets: [[-0.3, -7.85], [-0.3, -9.5]] },
      { type: 'toolRack', x0: 0.45, x1: 1.35, z: -10.2 },
      { type: 'basketStack', x: 0.9, z: -7.3 },
      { type: 'bigBasket', x: 0.85, z: -8.5 },
    ],
    upstairs: sortingLoft([{ id: 'yj-postwar-sorter', look: 'yjSorterPostwar', pose: 'sort', x: -0.75, z: -4.3, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 }]),
    npcs: [{ id: 'yj-postwar-roaster', look: 'lhtPostwarWorker', pose: 'ladle', x: -1.22, z: -8.3, rotationY: -Math.PI / 2, seatY: 0 }],
  },

  /**
   * 2000–現在（依官網門市頁照片）：門市的弧形木櫃台、嵌牆木格櫃與圓茶罐、試茶席、木格屏風門上的金字匾、
   * 竹編大圓篩、嘜頭板；後面的焙籠間（焙窟、焙籠、炭焙工具、風選機）；二樓清源堂（紅毯矮舞台、黑色雕花屏風、
   * 「御前清客」匾、紅燈籠、硬木方桌與南管樂器）。
   */
  teaHouseToday: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'open',
    partition: { z: -4.8, doorMinX: -1.0, doorMaxX: 1.0 },
    lamps: [[0.6, -1.6], [0.6, -3.6]],
    items: [
      { type: 'curvedCounter', x: -1.75, z: -2.6, length: 1.8, depth: 0.6, height: 0.92 },
      { type: 'wallTinShelf', x: 2.45, z0: -4.4, z1: -1.0 },
      { type: 'tastingTable', x: 0.55, z: -3.4, width: 1.2, depth: 0.8, height: 0.76 },
      { type: 'markStencilBoard', x: -2.6, z0: -4.6, z1: -3.85 },
      { type: 'plaque', x: 0, z: -4.75, y: 2.45, width: 1.5, text: 'youji', block: false },
      { type: 'bigSieve', x: 1.9, z: -4.7, block: false },
      { type: 'winnowingMachine', x: -1.8, z: -5.6 },
      { type: 'huskPits', minX: -2.55, maxX: -1.75, minZ: -9.9, maxZ: -6.6, pits: [[-2.15, -7.0], [-2.15, -7.9], [-2.15, -8.75], [-2.15, -9.5]], baskets: [[-2.15, -7.0], [-2.15, -7.9], [-2.15, -8.75], [-2.15, -9.5]] },
      { type: 'huskPits', minX: -0.7, maxX: 0.1, minZ: -9.9, maxZ: -6.6, pits: [[-0.3, -7.0], [-0.3, -7.9], [-0.3, -8.75], [-0.3, -9.5]], baskets: [[-0.3, -7.0], [-0.3, -8.75]] },
      { type: 'toolRack', x0: 0.45, x1: 1.35, z: -10.2 },
      { type: 'basketStack', x: 0.9, z: -7.4 },
      { type: 'bigBasket', x: 0.85, z: -8.6 },
    ],
    upstairs: {
      items: [
        { type: 'stage', x: -0.7, z: -8.4, width: 2.4, depth: 1.6, height: 0.3 },
        { type: 'screen', x: -0.7, z: -9.9, width: 2.9 },
        { type: 'plaque', x: -0.7, z: -10.3, y: 2.25, width: 1.6, text: 'qingke', block: false },
        { type: 'redLantern', x: -1.65, z: -8.85, block: false },
        { type: 'redLantern', x: 0.25, z: -8.85, block: false },
        { type: 'squareTable', x: -1.75, z: -5.3 },
        { type: 'squareTable', x: 0.45, z: -5.3 },
        { type: 'squareTable', x: -1.75, z: -2.6 },
        { type: 'squareTable', x: 0.45, z: -2.6 },
        { type: 'instrumentWall', x: -2.62, z0: -7.5, z1: -6.2, block: false },
      ],
      npcs: [{ id: 'yj-revival-musician', look: 'yjMusician', pose: 'rest', x: -0.7, z: -8.55, rotationY: 0, seatY: 0.75, level: 1 }],
    },
    npcs: [
      { id: 'yj-revival-staff', look: 'lhtRevivalStaff', pose: 'stand', x: -2.35, z: -2.6, rotationY: Math.PI / 2, seatY: 0 },
      { id: 'yj-revival-roaster', look: 'yjRevivalRoaster', pose: 'ladle', x: -1.22, z: -8.3, rotationY: -Math.PI / 2, seatY: 0 },
    ],
  },
}

/** 本地 → 世界座標（地段固定在 x=11.6、z=-4.5、不旋轉） */
export const YJ_SITE = { x: 11.6, z: -4.5 }
export function yjToWorld(x, z) {
  return { x: YJ_SITE.x + x, z: YJ_SITE.z + z }
}

const F2 = YJ_SHELL.floor2.y
const at = (x, y, z) => {
  const p = yjToWorld(x, z)
  return [p.x, y, p.z]
}

const front = (note, noteEn) => ({
  id: 'front',
  label: '有記名茶',
  labelEn: 'Youji Tea',
  note,
  noteEn,
  chapter: 'history',
  level: 0,
  radius: 2.6,
  point: [0, 1.2],
  prompt: [0, 2.8, 0.6],
  camera: { position: [5.0, 4.4, 6.6], target: [0, 3.4, 0] },
})

/** 1949 年以前的提醒（使用者 2026-11-02 決定加）：有記這時不在這裡 */
const notHereYet = {
  id: 'not-here',
  label: '這個年代的有記',
  labelEn: 'Youji in this era',
  note: '1949 年以前有記的精製廠在建昌街 11 號、茶行在民生西路口；這棟店裡的擺設是精製茶廠的一般情形',
  noteEn: 'Before 1949 Youji’s refinery was at 11 Jianchang Street and its hong near Minsheng West Road; this interior shows a typical tea refinery',
  chapter: 'history',
  level: 0,
  radius: 1.8,
  point: [0.9, -0.9],
  prompt: [0.9, 2.2, -0.9],
  camera: { position: [0.6, 1.8, 0.9], target: [0.2, 1.2, -2.6] },
}

const loft = (note, noteEn) => ({
  id: 'loft',
  label: '二樓揀茶樓',
  labelEn: 'Upstairs sorting loft',
  note,
  noteEn,
  chapter: 'workshop',
  level: 1,
  radius: 2.0,
  point: [0.2, -3.2],
  prompt: [0.2, F2 + 1.7, -3.2],
  camera: { position: [0.9, F2 + 1.8, -0.9], target: [-1.4, F2 + 0.6, -4.2] },
})

/** 各年代的資訊熱點（本地座標；章節是有記共用的章節） */
export const YJ_HOTSPOTS = {
  refineryBanquet: [
    front('日治時期：精製茶外銷泰國，茶箱上刷嘜頭', 'Japanese era: refined tea for Thailand, chests marked with stencils'),
    notHereYet,
    loft('茶季時婦女上樓揀茶，挑掉茶枝與壞葉', 'In the tea season women came upstairs to sort, picking out twigs and bad leaves'),
  ],
  refineryModern: [
    front('1930 年代：稻殼焙窟日夜焙茶二十天', '1930s: rice-husk pits firing tea day and night for twenty days'),
    notHereYet,
    {
      id: 'pits',
      label: '稻殼焙窟', labelEn: 'Rice-husk pits',
      note: '深 58 公分的圓坑，碳化稻殼燒成白灰當熱源，上面架焙籠', noteEn: 'Round pits 58 cm deep, carbonised husk burnt to white ash for heat, baskets set over them',
      chapter: 'workshop',
      level: 0, radius: 2.0,
      point: [-1.2, -6.2], prompt: [-1.2, 1.9, -5.6],
      camera: { position: [0.6, 2.2, -5.2], target: [-1.2, 0.4, -8.2] },
    },
  ],
  factoryNo5: [
    front('1949 年遷到重慶北路現址，臺北市第 5 號登記工廠', 'Moved here in 1949: factory no. 5 on the Taipei register'),
    {
      id: 'roasting-room',
      label: '焙籠間', labelEn: 'Roasting room',
      note: '焙籠間建於日治時期，約 40 個焙籠在焙窟上運作', noteEn: 'The roasting room dates from the Japanese era; some forty baskets at work over the pits',
      chapter: 'workshop',
      level: 0, radius: 2.0,
      point: [0.5, -5.6], prompt: [0.5, 2.1, -5.6],
      camera: { position: [0.6, 2.2, -5.2], target: [-1.2, 0.4, -8.4] },
    },
    loft('二樓揀茶樓：每天四十多名女工挑茶枝', 'The upstairs sorting loft: forty-odd women a day picking out stalks'),
  ],
  teaHouseToday: [
    front('2004 年起前面是門市，後面仍是用炭焙的茶廠', 'Since 2004: a shop in front, a charcoal-roasting factory still at work behind'),
    {
      id: 'roasting-room',
      label: '焙籠間', labelEn: 'Roasting room',
      note: '大稻埕僅存仍在運作的焙窟與焙籠', noteEn: 'The last working roasting pits and baskets in Dadaocheng',
      chapter: 'workshop',
      level: 0, radius: 2.0,
      point: [0.5, -5.7], prompt: [0.5, 2.1, -5.7],
      camera: { position: [0.6, 2.2, -5.4], target: [-1.2, 0.4, -8.4] },
    },
    {
      id: 'qingyuan',
      label: '清源堂', labelEn: 'Qingyuan Hall',
      note: '二樓原是揀茶樓；每週六下午有南管演奏', noteEn: 'Upstairs was the sorting loft; there is nanguan music every Saturday afternoon',
      chapter: 'workshop',
      level: 1, radius: 2.2,
      // 在方桌之間（舞台前留給南管樂人的交談提示）
      point: [-0.65, -3.9], prompt: [-0.65, F2 + 1.9, -3.9],
      camera: { position: [0.4, F2 + 1.8, -1.2], target: [-0.7, F2 + 0.9, -8.6] },
    },
  ],
}

/** 室內可以近看的器物的位置（本地座標 → 世界座標；level 1 在二樓） */
export const YJ_INSPECT_SPOTS = {
  'yj-banquet-mark-stencil': { position: at(-2.5, 1.45, -3.5), prompt: at(-1.85, 1.55, -3.5), radius: 1.6 },
  'yj-banquet-sorting-tray': { position: at(-1.75, F2 + 0.7, -4.3), prompt: at(-1.75, F2 + 1.3, -4.3), radius: 1.9, level: 1 },
  'yj-modern-husk-pit': { position: at(-0.3, 0.2, -6.35), prompt: at(-0.3, 1.1, -5.8), radius: 1.7 },
  'yj-modern-mark-stencil': { position: at(-2.5, 1.45, -3.4), prompt: at(-1.85, 1.55, -3.4), radius: 1.6 },
  'yj-modern-sorting-tray': { position: at(-1.75, F2 + 0.7, -4.3), prompt: at(-1.75, F2 + 1.3, -4.3), radius: 1.9, level: 1 },
  'yj-postwar-winnower': { position: at(-1.8, 1.0, -5.4), prompt: at(-1.1, 1.6, -5.6), radius: 1.7 },
  'yj-postwar-husk-pit': { position: at(-2.15, 0.2, -7.85), prompt: at(-1.95, 1.15, -7.85), radius: 1.6 },
  'yj-postwar-sorting-tray': { position: at(-1.75, F2 + 0.7, -2.0), prompt: at(-1.75, F2 + 1.3, -2.0), radius: 1.9, level: 1 },
  'yj-revival-winnower': { position: at(-1.8, 1.0, -5.6), prompt: at(-1.1, 1.6, -5.8), radius: 1.7 },
  'yj-revival-husk-pit': { position: at(-2.15, 0.2, -7.9), prompt: at(-1.95, 1.15, -7.9), radius: 1.6 },
  'yj-revival-mark-stencil': { position: at(-2.5, 1.45, -4.2), prompt: at(-1.85, 1.55, -4.2), radius: 1.5 },
  'yj-revival-roasting-basket': { position: at(0.9, 0.8, -7.4), prompt: at(0.75, 1.5, -6.95), radius: 1.5 },
  'yj-revival-nanguan': { position: at(-2.5, F2 + 1.5, -6.85), prompt: at(-2.0, F2 + 2.0, -6.85), radius: 1.8, level: 1 },
}
