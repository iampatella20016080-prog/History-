/**
 * 林華泰茶行・酒樓繁華到老屋新生的室內配置（第 11 階段；港口商街版在 linHuaTaiQingLayout.js）
 *
 * 同一棟建築、同一個地段（x=-22、z=-4.5、不旋轉，面寬 6 m、進深 11 m），四個年代共用外殼的尺寸：
 * 簷下步道 → 前店 → 隔間牆（中央留門）→ 店後的工作間。擺設依年代的 variant 換（linHuaTaiEraConfig.js）。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 *
 * 擺設用一份「器物清單」描述（type、位置、大小）：同一份資料產生模型（builders/linHuaTai/）、
 * 碰撞的障礙物與鏡頭的遮擋方塊，之後其他店家的室內可以直接套用同樣的寫法。
 *
 * 格局都是歷史情境重建：林華泰在這些年代的店內照片與平面查無；擺設依官網的家族口述（炭焙暖房、
 * 院子裡的茶農、茉莉花、焙坑縮減、乾燥機）、Discover Taipei 與官網的現況描述（大鐵桶、老秤、金屬鏟），
 * 以及日治時期大稻埕茶業的一般情形（揀茶、四方包）。查證紀錄見 docs/research/lin-hua-tai.md。
 */

/** 四個年代共用的外殼尺寸 */
export const LHT_SHELL = {
  half: 3.0,
  depth: 11,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 2.95,
  walkD: 1.7,
  room: { minX: -2.65, maxX: 2.65, minZ: -10.4, maxZ: -0.34 },
}

/**
 * 各年代的版本：
 * - door：店門口可以走的寬度（兩側是門板、捲門或木框櫥窗）
 * - partition：前店與工作間之間的隔間牆（z 與中央門的寬度）
 * - items：器物清單（見 builders/linHuaTai/linHuaTaiFurniture.js 的 FURNITURE；block: false 的不擋路）
 * - npcs：情境人物（不具名；室內 zone 'lin-hua-tai'）
 * - lamps：天花板吊燈的位置（1930 年代起）
 */
export const LHT_VARIANTS = {
  /**
   * 1895–1930：揀茶與包種茶。1883 年起是一層樓的精製包裝廠（國家文化記憶庫）；
   * 擺設依 1904 年《福爾摩沙烏龍茶》的圖版（揀茶女圍坐竹淺盤、烘焙室的木架與淺盤、成袋的「袋茶」）
   * 與包種茶的四方包（農業周刊）。前店包四方包，店後揀茶、兩口焙坑。
   */
  baozhongHong: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'boards',
    partition: { z: -5.0, doorMinX: -1.1, doorMaxX: 1.1 },
    lamps: [],
    items: [
      { type: 'counter', x: 1.75, z: -2.6, length: 2.0, depth: 0.6, height: 0.95, goods: 'paper' },
      { type: 'wallShelf', x: -2.42, z0: -4.9, z1: -1.0, goods: ['chests', 'jars', 'packets'] },
      { type: 'packingTable', x: -0.85, z: -3.3, width: 1.3, depth: 0.75, height: 0.8 },
      { type: 'jar', x: -2.0, z: -0.85, scale: 1.0 },
      { type: 'sack', x: 2.25, z: -0.85 },
      { type: 'pickingTable', x: -1.75, z: -6.5, width: 1.3, depth: 0.95, height: 0.62 },
      { type: 'pickingTable', x: -1.75, z: -8.6, width: 1.3, depth: 0.95, height: 0.62 },
      { type: 'trayRack', x: 2.42, z0: -8.2, z1: -6.7 },
      { type: 'roastingPlatform', minX: 0.95, maxX: 2.5, minZ: -10.25, maxZ: -8.85, height: 0.32, pits: [[1.35, -9.55], [2.1, -9.55]], baskets: [[1.35, -9.55]] },
      { type: 'sackPile', x: 2.05, z: -5.65, count: 2 },
    ],
    npcs: [
      { id: 'lht-banquet-keeper', look: 'lhtBanquetKeeper', pose: 'stand', x: 2.35, z: -2.6, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'lht-banquet-sorter-a', look: 'lhtSorter', pose: 'sort', x: -0.75, z: -6.5, rotationY: -Math.PI / 2, seatY: 0.4 },
      { id: 'lht-banquet-sorter-b', look: 'lhtSorterBlue', pose: 'sort', x: -0.75, z: -8.6, rotationY: -Math.PI / 2, seatY: 0.4 },
    ],
  },

  /**
   * 1930–1945：炭焙暖房（官網〈林華泰的歷史 1/5、2/5〉家族口述）：兩條平行的走道兩頭相通、圍成狹長的長方形，
   * 三十幾個直徑約兩尺、深兩尺半的圓火坑在走道兩旁排成四長排；相思木炭上蓋著薰黑的稻糠悶燒；
   * 焙籠是高約兩尺的竹編圓筒，中間一片竹編圓盤。這裡畫出其中的十六個火坑。前店用紙包茶（1960 年代以後才有鐵罐）。
   */
  charcoalRoastery: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'boards',
    partition: { z: -4.6, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[0, -2.4], [-1.3, -7.4], [1.2, -7.4]],
    items: [
      { type: 'counter', x: 1.75, z: -2.4, length: 1.8, depth: 0.6, height: 0.95, goods: 'paper' },
      { type: 'wallShelf', x: -2.42, z0: -4.5, z1: -1.0, goods: ['chests', 'jars', 'packets'] },
      { type: 'chestStack', x: -1.0, z: -3.45, count: 4 },
      { type: 'platformScale', x: 0.55, z: -3.75, rotationY: Math.PI / 2, style: 'iron' },
      { type: 'sack', x: 2.25, z: -0.85 },
      // 四長排火坑：靠左牆一排、中央背對背兩排、靠右牆一排；走道在兩排之間，前後兩端相通
      { type: 'pitStrip', minX: -2.6, maxX: -1.8, minZ: -9.3, maxZ: -5.55, pits: [[-2.2, -6.0], [-2.2, -6.95], [-2.2, -7.9], [-2.2, -8.85]], baskets: [[-2.2, -6.0], [-2.2, -7.9], [-2.2, -8.85]] },
      { type: 'pitStrip', minX: -0.85, maxX: 0.75, minZ: -9.3, maxZ: -5.55, pits: [[-0.45, -6.0], [-0.45, -6.95], [-0.45, -7.9], [-0.45, -8.85], [0.35, -6.0], [0.35, -6.95], [0.35, -7.9], [0.35, -8.85]], baskets: [[-0.45, -6.95], [-0.45, -8.85], [0.35, -6.0], [0.35, -6.95], [0.35, -8.85]] },
      { type: 'pitStrip', minX: 1.7, maxX: 2.5, minZ: -9.3, maxZ: -5.55, pits: [[2.1, -6.0], [2.1, -6.95], [2.1, -7.9], [2.1, -8.85]], baskets: [[2.1, -6.0], [2.1, -6.95], [2.1, -8.85]] },
      { type: 'familyBasket', x: -2.2, z: -5.05, tea: true },
      { type: 'charcoalBaskets', x: 2.15, z: -9.9 },
    ],
    npcs: [
      { id: 'lht-modern-clerk', look: 'lhtModernClerk', pose: 'stand', x: 2.35, z: -2.4, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'lht-modern-roaster', look: 'lhtModernRoaster', pose: 'ladle', x: 1.22, z: -7.9, rotationY: Math.PI / 2, seatY: 0 },
    ],
  },

  /**
   * 1945–1980：批發茶行（官網〈林華泰的歷史 3/5〉家族口述）：茶季早上茶農背著茶包進出、白天卡車載來粗茶；
   * 炭焙坑從三十幾個縮減到八個，改用大型乾燥機；入夜後茉莉花農送花來，茶和花混在一起過夜、半夜翻動。
   * 前店：秤、帳簿與評茶盤、成堆的茶包；店後：八個火坑、輸送帶式乾燥機、層層鋪疊的茶與茉莉花。
   */
  wholesaleHong: {
    door: { minX: -1.6, maxX: 1.6 },
    frontPanels: 'shutter',
    partition: { z: -5.0, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[0, -2.5], [-0.2, -7.4]],
    items: [
      { type: 'counter', x: 1.8, z: -2.9, length: 1.9, depth: 0.6, height: 0.95, goods: 'tasting' },
      { type: 'sackPile', x: -1.85, z: -1.4, count: 4 },
      { type: 'sackPile', x: -1.85, z: -3.6, count: 5 },
      { type: 'platformScale', x: 0.2, z: -4.0, rotationY: Math.PI / 2, style: 'iron' },
      { type: 'chestStack', x: 1.95, z: -4.5, count: 4 },
      { type: 'pitStrip', minX: -2.5, maxX: -0.75, minZ: -9.5, maxZ: -5.9, pits: [[-2.05, -6.35], [-1.2, -6.35], [-2.05, -7.25], [-1.2, -7.25], [-2.05, -8.15], [-1.2, -8.15], [-2.05, -9.05], [-1.2, -9.05]], baskets: [[-2.05, -6.35], [-1.2, -7.25], [-2.05, -8.15]] },
      { type: 'dryer', x: 1.6, z: -6.9, length: 2.6, width: 1.5, height: 1.55 },
      { type: 'jasmineHeap', x: 0.6, z: -9.85, width: 1.5, depth: 0.9 },
      { type: 'bambooBaskets', x: 2.15, z: -9.85 },
    ],
    npcs: [
      { id: 'lht-postwar-clerk', look: 'lhtPostwarClerk', pose: 'stand', x: 2.38, z: -2.9, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'lht-postwar-worker', look: 'lhtPostwarWorker', pose: 'stand', x: -0.4, z: -9.85, rotationY: Math.PI / 2, seatY: 0 },
    ],
  },

  /**
   * 2000–現在：重慶北路二段193號（現在的四層樓約 1965–66 年改建；國家文化記憶庫）。依官網照片：
   * 灰綠色的大圓鐵桶、桶蓋上紅字寫茶名與價碼；長條木櫃台上有淺木盤盛的茶樣與茶具；用了五十多年的落地老秤；
   * 店後仍在使用的輸送帶式乾燥機、攤在水泥地上曬涼的茶、封存的兩口焙坑。
   * 店裡實際上有將近百個大小茶桶（官網），這裡只畫出其中一部分。
   */
  heritageHong: {
    door: { minX: -1.7, maxX: 1.7 },
    frontPanels: 'open',
    partition: { z: -5.4, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[-0.9, -1.8], [0.9, -1.8], [-0.9, -4.0], [0.9, -4.0], [0, -7.6]],
    items: [
      { type: 'counter', x: 1.95, z: -3.6, length: 2.1, depth: 0.65, height: 0.92, goods: 'tasting', tint: '#b8955e' },
      { type: 'drawerWall', x: 2.55, z0: -4.75, z1: -2.45 },
      { type: 'platformScale', x: 1.0, z: -4.85, rotationY: 0, style: 'wood' },
      // 茶桶：左牆一排大桶（上面再疊一排中桶）、前面一排中桶、中央的島、門邊的大桶、隔間牆前的小桶
      { type: 'drums', drums: [[-2.2, -0.9, 'large'], [-2.2, -1.75, 'large'], [-2.2, -2.6, 'large'], [-2.2, -3.45, 'large'], [-2.2, -4.3, 'large']] },
      { type: 'drums', y: 1.07, drums: [[-2.25, -0.9, 'medium'], [-2.25, -1.75, 'medium'], [-2.25, -2.6, 'medium'], [-2.25, -3.45, 'medium'], [-2.25, -4.3, 'medium']], seed: 5 },
      { type: 'drums', drums: [[-1.45, -1.3, 'medium'], [-1.45, -2.2, 'medium'], [-1.45, -3.1, 'medium'], [-1.45, -4.0, 'medium']], seed: 9 },
      { type: 'drums', drums: [[-0.05, -1.75, 'medium'], [0.55, -1.75, 'medium'], [-0.05, -2.45, 'medium'], [0.55, -2.45, 'medium', true], [-0.05, -3.15, 'medium'], [0.55, -3.15, 'medium']], seed: 13 },
      { type: 'drums', drums: [[2.2, -0.9, 'large'], [2.2, -1.75, 'large']], seed: 17 },
      { type: 'drums', drums: [[-2.35, -5.05, 'small'], [-1.9, -5.05, 'small'], [-1.45, -5.05, 'small']], seed: 21 },
      { type: 'pitStrip', minX: -2.5, maxX: -0.9, minZ: -10.2, maxZ: -8.7, pits: [[-2.1, -9.45], [-1.3, -9.45]], baskets: [], sealed: true },
      { type: 'coolingFloor', minX: -2.5, maxX: -0.9, minZ: -8.3, maxZ: -6.0 },
      { type: 'dryer', x: 1.65, z: -7.9, length: 3.8, width: 1.4, height: 1.6, tint: '#8a8f8a' },
      { type: 'bambooBaskets', x: 0.2, z: -9.95 },
    ],
    npcs: [
      { id: 'lht-revival-staff', look: 'lhtRevivalStaff', pose: 'stand', x: 2.42, z: -3.0, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'lht-revival-visitor', look: 'revivalShopper', pose: 'phone', x: 0.95, z: -0.9, rotationY: Math.PI + 0.5, seatY: 0 },
    ],
  },
}

/** 本地 → 世界座標（地段固定在 x=-22、z=-4.5、不旋轉） */
export const LHT_ERA_SITE = { x: -22, z: -4.5 }
export function lhtEraToWorld(x, z) {
  return { x: LHT_ERA_SITE.x + x, z: LHT_ERA_SITE.z + z }
}

const at = (x, y, z) => {
  const p = lhtEraToWorld(x, z)
  return [p.x, y, p.z]
}

const front = (note, noteEn) => ({
  id: 'front',
  label: '林華泰茶行',
  labelEn: 'Lin Huatai Tea Hong',
  note,
  noteEn,
  chapter: 'history',
  level: 0,
  radius: 2.6,
  point: [0, 1.2],
  prompt: [0, 2.8, 0.4],
  camera: { position: [5.0, 4.2, 6.2], target: [0, 3.2, 0] },
})

/** 各年代的資訊熱點（本地座標；章節是林華泰共用的章節） */
export const LHT_ERA_HOTSPOTS = {
  baozhongHong: [
    front('日治時期：揀茶、包四方包，再焙過才出貨', 'Japanese era: sorting tea and wrapping square packets, then firing again before it ships'),
    {
      id: 'packing',
      label: '包茶桌', labelEn: 'Packing table',
      note: '包種茶：兩張毛邊紙包四兩茶，蓋上茶名與行號', noteEn: 'Baozhong: four taels of tea in two sheets of rough paper, stamped with the tea’s name and the firm’s',
      chapter: 'foods',
      level: 0, radius: 1.8,
      // 提示移到左上方，不和四方包的近看提示疊在一起（觸控時點得到）
      point: [-0.85, -3.3], prompt: [-1.45, 2.1, -3.3],
      camera: { position: [0.9, 1.75, -1.7], target: [-1.0, 0.85, -3.5] },
    },
    {
      id: 'sorting',
      label: '揀茶', labelEn: 'Tea sorting',
      note: '婦女圍著竹淺盤，挑掉茶枝、茶梗與壞葉', noteEn: 'Women sit round bamboo trays, picking out twigs, stalks and spoiled leaves',
      chapter: 'workshop',
      level: 0, radius: 2.0,
      point: [-0.2, -7.5], prompt: [-0.2, 1.6, -7.5],
      camera: { position: [0.9, 1.8, -5.6], target: [-1.5, 0.7, -7.6] },
    },
  ],
  charcoalRoastery: [
    front('1930 年代：店後是三十幾個火坑的炭焙暖房（家族口述）', '1930s: behind the shop, a charcoal-roasting room of thirty-odd fire pits (family oral history)'),
    {
      id: 'roasting',
      label: '炭焙暖房', labelEn: 'Charcoal-roasting room',
      note: '四長排火坑、兩條走道；相思木炭蓋著稻糠悶燒，沒有一點煙', noteEn: 'Four long rows of pits and two aisles; acacia charcoal smoulders under rice husk, without a wisp of smoke',
      chapter: 'workshop',
      level: 0, radius: 2.2,
      point: [-0.1, -5.1], prompt: [0.2, 1.9, -5.1],
      camera: { position: [1.25, 2.1, -4.9], target: [-0.6, 0.4, -8.4] },
    },
  ],
  wholesaleHong: [
    front('戰後：以批發為主，茶季早上茶農背著茶包進出（家族口述）', 'Postwar: mainly wholesale; on tea-season mornings farmers came and went with bags of tea (family oral history)'),
    {
      id: 'buying',
      label: '收茶', labelEn: 'Buying tea',
      note: '向茶農買茶：看茶色、聞茶香，再過秤', noteEn: 'Buying from the farmers: look at the colour, smell the aroma, then weigh it',
      chapter: 'workshop',
      level: 0, radius: 1.9,
      point: [0.6, -3.2], prompt: [0.6, 1.6, -3.2],
      camera: { position: [-0.6, 1.8, -1.3], target: [1.2, 0.9, -3.6] },
    },
    {
      id: 'dryer',
      label: '乾燥機與火坑', labelEn: 'Drying machine and fire pits',
      note: '火坑從三十幾個縮減到八個，改用大型乾燥機（家族口述）', noteEn: 'The pits shrank from thirty-odd to eight as a large drying machine took over (family oral history)',
      chapter: 'workshop',
      level: 0, radius: 2.2,
      point: [-0.15, -7.4], prompt: [-0.15, 1.8, -7.4],
      camera: { position: [-0.2, 2.1, -5.3], target: [0.4, 0.7, -8.6] },
    },
  ],
  heritageHong: [
    front('重慶北路二段193號：「前店後廠」，近百個大小茶桶', '193 Chongqing North Road, Section 2: “shop in front, factory behind”, nearly a hundred tea drums'),
    {
      id: 'drums',
      label: '大茶桶', labelEn: 'Tea drums',
      note: '批發用的散茶裝在超大號的圓鐵桶裡，價碼寫在桶蓋上', noteEn: 'Loose wholesale tea in oversized round iron drums, with the price written on the lid',
      chapter: 'workshop',
      level: 0, radius: 2.0,
      point: [-0.7, -2.4], prompt: [-0.7, 1.7, -2.4],
      camera: { position: [1.1, 1.9, -0.4], target: [-0.8, 0.7, -3.0] },
    },
    {
      id: 'dryer',
      label: '乾燥機與焙坑遺址', labelEn: 'Drying machine and the old pits',
      note: '運作半世紀的乾燥機還在用；最後兩口炭焙坑留作遺址', noteEn: 'The half-century-old drying machine is still in use; the last two charcoal pits are kept as a relic',
      chapter: 'workshop',
      level: 0, radius: 2.2,
      point: [0.0, -8.2], prompt: [0.0, 1.8, -8.2],
      camera: { position: [0.3, 2.1, -5.9], target: [-0.9, 0.5, -9.0] },
    },
  ],
}

/** 室內可以近看的器物的位置（本地座標 → 世界座標；data/inspectObjects.js 引用） */
export const LHT_ERA_INSPECT_SPOTS = {
  'lht-banquet-square-packet': { position: at(-0.6, 0.86, -3.3), prompt: at(-0.6, 1.35, -3.3), radius: 1.6 },
  'lht-banquet-sorting-tray': { position: at(-1.75, 0.7, -6.5), prompt: at(-1.75, 1.3, -6.5), radius: 1.9 },
  'lht-banquet-tea-tally': { position: at(-1.6, 0.66, -8.2), prompt: at(-1.6, 1.25, -8.2), radius: 1.9 },
  'lht-modern-charcoal-pit': { position: at(-0.45, 0.25, -6.0), prompt: at(-0.45, 1.1, -5.6), radius: 1.7 },
  'lht-modern-platform-scale': { position: at(0.55, 0.6, -3.75), prompt: at(0.55, 1.4, -3.75), radius: 1.6 },
  'lht-postwar-tasting-tray': { position: at(1.8, 1.0, -2.45), prompt: at(1.8, 1.45, -2.45), radius: 1.6 },
  'lht-postwar-jasmine': { position: at(0.6, 0.15, -9.85), prompt: at(0.6, 1.0, -9.5), radius: 1.8 },
  'lht-revival-tea-drum': { position: at(0.55, 0.85, -2.45), prompt: at(0.55, 1.45, -2.45), radius: 1.8 },
  'lht-revival-tasting-tray': { position: at(1.95, 0.97, -3.15), prompt: at(1.95, 1.45, -3.15), radius: 1.6 },
  'lht-revival-platform-scale': { position: at(1.0, 0.6, -4.85), prompt: at(1.0, 1.4, -4.85), radius: 1.6 },
}
