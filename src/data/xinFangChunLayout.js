/**
 * 新芳春茶行的室內配置（第 11 階段；查證與設計見 docs/research/interior-xin-fang-chun.md）
 *
 * 三開間、三層的洋樓，地段在 x=-27、z=4.5（南側、朝北，本地 → 世界轉 180°），面寬 7.2 m、進深 12 m。
 * 真實建築縱深三進、約 492 坪；本站壓成「前進正廳 → 天井（日月雙井壓成一井）→ 後進焙籠間與加工廠」兩段加一井，是示意。
 * 正廳右後的木樓梯上二樓（前段揀茶間、後段辦公室與會客廳）；三樓是王家住家與公媽廳，樓梯口封住、不畫。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 */

/** 三個年代共用的外殼尺寸（floor2：二樓樓板頂、天花高、範圍、樓梯與天井） */
export const XFC_SHELL = {
  half: 3.6,
  depth: 12,
  wallT: 0.3,
  groundH: 3.8,
  ceiling: 3.3,
  walkD: 1.7,
  room: { minX: -3.25, maxX: 3.25, minZ: -11.4, maxZ: -0.34 },
  floor2: {
    y: 4.05,
    ceiling: 2.9,
    room: { minX: -3.25, maxX: 3.25, minZ: -11.4, maxZ: -0.34 },
    // 正廳右後的木樓梯（Interior-08）：沿右牆從 z=-0.8 往後爬到 z=-4.6；樓梯頂的平台只蓋住一小段
    stair: { minX: 2.25, maxX: 3.2, bottomZ: -0.8, topZ: -4.6, landingZ: -5.5 },
    // 天井：中央 2.4 × 2.0 m，一樓可以走（馬賽克拼花地坪），二樓四周是洗石子欄杆
    well: { minX: -1.2, maxX: 1.2, minZ: -6.6, maxZ: -4.6 },
  },
}

const F2 = XFC_SHELL.floor2.y

/** 天井的馬賽克地坪（一樓，不擋路） */
const wellFloor = { type: 'wellFloor', x: 0, z: -5.6, width: 2.4, depth: 2.0, block: false }

/** 後進：焙籠坑的紅磚低台（三排四列 12 坑）與加工廠的機具（風選機、切茶機、抖篩機、磅秤） */
const pits = []
for (const x of [-2.75, -1.95, -1.15]) for (const z of [-7.8, -8.75, -9.7, -10.65]) pits.push([x, z])
const backRoom = (baskets, extra = []) => [
  { type: 'pitStrip', minX: -3.15, maxX: -0.75, minZ: -11.1, maxZ: -7.35, pits, baskets },
  { type: 'bigWinnower', x: 2.45, z: -9.0, length: 3.6, width: 1.0 },
  { type: 'teaCutter', x: 0.6, z: -10.6 },
  { type: 'sieveShaker', x: 0.6, z: -8.4 },
  { type: 'platformScale', x: 1.4, z: -7.0, rotationY: Math.PI / 2, style: 'iron' },
  { type: 'basketStack', x: -0.2, z: -11.0 },
  ...extra,
]
const someBaskets = [[-2.75, -7.8], [-1.95, -7.8], [-2.75, -8.75], [-1.15, -8.75], [-1.95, -9.7], [-2.75, -10.65], [-1.95, -10.65], [-1.15, -10.65]]

/** 三樓的樓梯口（封住；二樓後段右角） */
const sealedStair = { type: 'sealedStair', x: 2.7, z: -10.75 }

/**
 * 各年代的版本（一樓 items、二樓 upstairs；人物不具名，二樓的 level 1）
 */
export const XFC_VARIANTS = {
  /**
   * 1934–1945：營運中的茶行。正廳是茶行、帳房與銷售（櫃台與算盤、層架、包四方包）；
   * 後進焙籠間與加工廠；二樓前段揀茶間、後段辦公室與會客廳。擺設依文獻與現存機具回推。
   */
  teaMansion1934: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'boards',
    partition: { z: -6.6, doorMinX: -1.2, doorMaxX: 1.2 },
    lamps: [[-1.6, -1.6], [0, -1.6], [-1.6, -3.6], [0, -3.6]],
    items: [
      { type: 'counter', x: 1.5, z: -3.0, length: 2.0, depth: 0.6, height: 0.95, goods: 'paper', abacus: true },
      { type: 'wallShelf', x: -2.95, z0: -4.4, z1: -1.7, goods: ['chests', 'jars', 'packets'] },
      { type: 'teaChestStack', x: -2.45, z: -0.95, count: 3 },
      { type: 'packingTable', x: -0.9, z: -3.2, width: 1.3, depth: 0.75, height: 0.8 },
      { type: 'platformScale', x: -2.4, z: -5.7, rotationY: 0, style: 'iron' },
      wellFloor,
      ...backRoom(someBaskets),
    ],
    upstairs: {
      items: [
        { type: 'pickingTable', x: -2.3, z: -1.5, width: 1.3, depth: 0.95, height: 0.62 },
        { type: 'pickingTable', x: -2.3, z: -3.6, width: 1.3, depth: 0.95, height: 0.62 },
        { type: 'pickingTable', x: 0.0, z: -1.5, width: 1.3, depth: 0.95, height: 0.62 },
        { type: 'sackPile', x: 0.3, z: -3.6, count: 2 },
        { type: 'trayRack', x: 2.97, z0: -8.4, z1: -7.0 },
        { type: 'officeDesk', x: -2.3, z: -8.2 },
        { type: 'officeDesk', x: -2.3, z: -10.2 },
        { type: 'armchairSet', x: 0.6, z: -9.6 },
        { type: 'plaque', x: 0, z: -11.35, y: 2.15, width: 1.9, text: 'xfc', block: false },
        sealedStair,
      ],
      npcs: [
        { id: 'xfc-modern-sorter-a', look: 'xfcSorterModern', pose: 'sort', x: -1.3, z: -1.5, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
        { id: 'xfc-modern-sorter-b', look: 'yjSorterModernB', pose: 'sort', x: -1.3, z: -3.6, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
        { id: 'xfc-modern-sorter-c', look: 'yjSorterModern', pose: 'sort', x: 1.0, z: -1.5, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 },
      ],
    },
    npcs: [
      { id: 'xfc-modern-bookkeeper', look: 'xfcBookkeeper', pose: 'stand', x: 1.98, z: -3.0, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'xfc-modern-roaster', look: 'lhtModernRoaster', pose: 'ladle', x: -0.35, z: -9.2, rotationY: -Math.PI / 2, seatY: 0 },
    ],
  },

  /**
   * 1945–1980：1950 年改組兩合公司；之後生意逐漸收起、部分空間出租。正廳的評茶櫃台、外銷鐵罐架、
   * 隔間牆上的優良茶比賽獎狀（戰後的比賽）；後進機具照舊；二樓揀茶桌減少，後段是王氏宗親會籌備處的長會議桌。
   */
  limitedPartnership: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'shutter',
    partition: { z: -6.6, doorMinX: -1.2, doorMaxX: 1.2 },
    lamps: [[-1.6, -2.4], [0, -2.4]],
    items: [
      { type: 'counter', x: 1.5, z: -3.0, length: 2.0, depth: 0.6, height: 0.95, goods: 'tasting' },
      { type: 'tinRack', x: -2.95, z0: -4.4, z1: -1.7, side: 'left' },
      { type: 'teaChestStack', x: -2.45, z: -0.95, count: 4 },
      { type: 'certificateFrame', x: -2.2, z: -6.5, y: 1.75, block: false },
      { type: 'crates', x: 2.55, z: -6.1 },
      wellFloor,
      ...backRoom(someBaskets.slice(0, 5)),
    ],
    upstairs: {
      items: [
        { type: 'pickingTable', x: -2.3, z: -1.5, width: 1.3, depth: 0.95, height: 0.62 },
        { type: 'pickingTable', x: -2.3, z: -3.6, width: 1.3, depth: 0.95, height: 0.62 },
        { type: 'sackPile', x: 0.3, z: -3.6, count: 2 },
        { type: 'meetingTable', x: 0, z: -9.0 },
        { type: 'officeDesk', x: -2.3, z: -10.4 },
        { type: 'plaque', x: 0, z: -11.35, y: 2.15, width: 1.9, text: 'xfc', block: false },
        sealedStair,
      ],
      npcs: [{ id: 'xfc-postwar-sorter', look: 'yjSorterPostwar', pose: 'sort', x: -1.3, z: -1.5, rotationY: -Math.PI / 2, seatY: 0.4, level: 1 }],
    },
    npcs: [{ id: 'xfc-postwar-clerk', look: 'lhtPostwarClerk', pose: 'stand', x: 1.98, z: -3.0, rotationY: -Math.PI / 2, seatY: 0 }],
  },

  /**
   * 2016 年起的茶葉故事館（依照片）：正廳的展桌、玻璃櫃、說明板、導覽櫃台、白桌巾圓桌；
   * 後進焙籠間與加工廠原樣保留，隔間牆背面是茶業發展史時間表、後牆投影焙茶影像；
   * 二樓前段書店區，後段「王家生活展」（多抽屜木櫃、辦公桌、獎狀與算盤的玻璃櫃）與外銷茶罐。
   */
  teaStoryHouse: {
    door: { minX: -1.2, maxX: 1.2 },
    frontPanels: 'open',
    partition: { z: -6.6, doorMinX: -1.2, doorMaxX: 1.2 },
    lamps: [[-1.6, -1.6], [0, -1.6], [-1.6, -3.6], [0, -3.6]],
    items: [
      { type: 'counter', x: 1.5, z: -3.0, length: 2.0, depth: 0.6, height: 0.95, goods: 'none', tint: '#6a4a34' },
      { type: 'exhibitTable', x: -2.35, z: -1.6, width: 1.3, depth: 0.7 },
      { type: 'glassCase', x: -2.45, z: -3.7, width: 1.2, depth: 0.6, content: 'machines' },
      { type: 'exhibitPanel', x: -0.95, z: -4.1, width: 1.1 },
      { type: 'tastingRound', x: -2.3, z: -5.7 },
      wellFloor,
      ...backRoom(someBaskets, [
        { type: 'timelineWall', x0: -3.2, x1: -1.3, z: -6.72, block: false },
        { type: 'projectorWall', x0: -0.6, x1: 1.6, z: -11.33, block: false },
      ]),
    ],
    upstairs: {
      items: [
        { type: 'bookShelf', x: -3.0, z0: -4.4, z1: -1.0 },
        { type: 'squareTable', x: -1.15, z: -2.2 },
        { type: 'squareTable', x: 0.85, z: -2.2 },
        { type: 'drawerCabinet', x: -3.08, z0: -10.4, z1: -7.6 },
        { type: 'officeDesk', x: -1.4, z: -9.2 },
        { type: 'glassCase', x: 1.0, z: -8.0, width: 1.2, depth: 0.6, content: 'certificate' },
        { type: 'tinRack', x: 2.95, z0: -9.9, z1: -7.6, side: 'right' },
        { type: 'plaque', x: 0, z: -11.35, y: 2.15, width: 1.9, text: 'xfc', block: false },
        sealedStair,
      ],
      npcs: [{ id: 'xfc-revival-visitor', look: 'revivalShopper', pose: 'stand', x: 0.05, z: -8.0, rotationY: Math.PI / 2, seatY: 0, level: 1 }],
    },
    npcs: [{ id: 'xfc-revival-guide', look: 'xfcGuide', pose: 'stand', x: 0.8, z: -4.35, rotationY: 0, seatY: 0 }],
  },
}

/** 本地 → 世界座標（地段在 x=-27、z=4.5、轉 180°：建築朝北） */
export const XFC_SITE = { x: -27, z: 4.5 }
export function xfcToWorld(x, z) {
  return { x: XFC_SITE.x - x, z: XFC_SITE.z - z }
}

const at = (x, y, z) => {
  const p = xfcToWorld(x, z)
  return [p.x, y, p.z]
}

/** 熱點的鏡頭（本地座標；shops.js 的 hotspotsToWorld 換成世界座標） */
const shot = (position, target) => ({ position, target })

const front = (note, noteEn) => ({
  id: 'front',
  label: '新芳春茶行',
  labelEn: 'Xinfangchun Tea Hong',
  note,
  noteEn,
  chapter: 'history',
  level: 0,
  radius: 2.8,
  point: [0, 1.2],
  prompt: [0, 3.0, 0.6],
  camera: shot([5.0, 4.6, 7.0], [0, 4.2, 0]),
})

const factory = (note, noteEn) => ({
  id: 'factory',
  label: '焙籠間與加工廠',
  labelEn: 'Roasting room and factory',
  note,
  noteEn,
  chapter: 'architecture',
  level: 0,
  radius: 2.0,
  point: [0.0, -7.2],
  prompt: [-0.2, 2.3, -7.3],
  camera: shot([0.4, 2.4, -6.9], [-1.6, 0.4, -10.0]),
})

const thirdFloor = {
  id: 'third-floor',
  label: '往三樓的樓梯',
  labelEn: 'Stairs to the third floor',
  note: '三樓是王家的住家與公媽廳，不開放；本站不畫',
  noteEn: 'The third floor is the Wang family’s home and ancestral hall; it is not open and this site does not show it',
  chapter: 'architecture',
  level: 1,
  radius: 1.8,
  point: [1.9, -10.0],
  prompt: [1.9, F2 + 2.1, -10.0],
  camera: shot([0.4, F2 + 1.8, -8.0], [2.7, F2 + 1.0, -10.9]),
}

/** 各年代的資訊熱點（本地座標；章節是新芳春共用的章節） */
export const XFC_HOTSPOTS = {
  teaMansion1934: [
    front('1934 年落成：三間併連、三層、三進，臺北最大的茶工廠', 'Completed 1934: three bays joined, three storeys and three bays deep—the largest tea factory in Taipei'),
    {
      id: 'well',
      label: '天井', labelEn: 'Light well',
      note: '穿心廊與日月雙井（本站壓成一井）：馬賽克地坪、洗石子花瓶欄杆', noteEn: 'A through-passage and twin “sun and moon” wells (shown here as one): mosaic floor, terrazzo vase balusters',
      chapter: 'architecture',
      level: 0, radius: 1.6,
      point: [0, -5.6], prompt: [0, 2.5, -5.6],
      camera: shot([0.8, 1.7, -3.9], [0, 4.6, -5.8]),
    },
    factory('後進：數十個焙籠坑的焙籠間，與風選、切茶的加工廠', 'The rear: a roasting room of dozens of pits and a factory for winnowing and cutting'),
    thirdFloor,
  ],
  limitedPartnership: [
    front('1950 年改組兩合公司；之後生意逐漸收起，部分空間出租', 'Reorganised as a partnership in 1950; trade slowly wound down and part of the building was let'),
    factory('後進的機具照舊運轉', 'The machines in the rear still run'),
    {
      id: 'clan',
      label: '王氏宗親會', labelEn: 'Wang clan association',
      note: '民國 40 年以後，這棟也是王氏宗親會的籌備處（官方登錄）', noteEn: 'From 1951 the building was also the preparatory office of the Wang clan association (official registration)',
      chapter: 'history',
      level: 1, radius: 2.0,
      point: [-0.2, -7.6], prompt: [-0.2, F2 + 1.9, -7.6],
      camera: shot([0.6, F2 + 1.8, -6.9], [0, F2 + 0.6, -9.6]),
    },
    thirdFloor,
  ],
  teaStoryHouse: [
    front('2016 年 9 月起免費開放的茶葉故事館（市定古蹟）', 'Since September 2016 a free tea story house (municipal historic site)'),
    {
      id: 'museum',
      label: '茶葉故事館', labelEn: 'Tea story house',
      note: '2011–2015 年修復，恢復九成原貌；屋主捐給臺北市政府', noteEn: 'Restored 2011–2015 to about nine-tenths of its original state; the owner donated it to the city',
      chapter: 'museum',
      level: 0, radius: 1.8,
      point: [0.4, -1.2], prompt: [0.4, 2.5, -1.2],
      camera: shot([1.0, 1.8, -0.6], [-1.6, 1.2, -3.8]),
    },
    factory('焙籠間保留數十個焙籠坑；牆上的木烙畫畫著焙茶的步驟', 'The roasting room keeps dozens of pits; pokerwork pictures on the wall show the roasting steps'),
    thirdFloor,
  ],
}

/** 室內可以近看的器物的位置（本地座標 → 世界座標；level 1 在二樓） */
export const XFC_INSPECT_SPOTS = {
  'xfc-modern-abacus': { position: at(1.45, 1.0, -3.8), prompt: at(0.95, 1.5, -3.8), radius: 1.5 },
  'xfc-modern-cutter': { position: at(0.6, 0.8, -10.6), prompt: at(0.0, 1.6, -10.4), radius: 1.6 },
  'xfc-modern-pit': { position: at(-1.15, 0.25, -7.8), prompt: at(-1.0, 1.2, -7.2), radius: 1.5 },
  'xfc-modern-sorting-tray': { position: at(-2.3, F2 + 0.7, -3.6), prompt: at(-2.3, F2 + 1.3, -3.6), radius: 1.9, level: 1 },
  'xfc-postwar-certificate': { position: at(-2.2, 1.75, -6.45), prompt: at(-2.2, 2.3, -6.1), radius: 1.6 },
  'xfc-postwar-tins': { position: at(-2.9, 1.2, -3.0), prompt: at(-2.4, 1.6, -3.0), radius: 1.5 },
  'xfc-postwar-cutter': { position: at(0.6, 0.8, -10.6), prompt: at(0.0, 1.6, -10.4), radius: 1.6 },
  'xfc-postwar-sorting-tray': { position: at(-2.3, F2 + 0.7, -3.6), prompt: at(-2.3, F2 + 1.3, -3.6), radius: 1.9, level: 1 },
  'xfc-revival-cutter': { position: at(0.6, 0.8, -10.6), prompt: at(0.0, 1.6, -10.4), radius: 1.6 },
  'xfc-revival-winnower': { position: at(1.95, 1.2, -8.0), prompt: at(1.4, 1.9, -8.0), radius: 1.5 },
  'xfc-revival-pit': { position: at(-1.15, 0.25, -7.8), prompt: at(-1.0, 1.2, -7.2), radius: 1.5 },
  'xfc-revival-certificate': { position: at(1.0, F2 + 1.0, -8.0), prompt: at(0.5, F2 + 1.5, -8.4), radius: 1.6, level: 1 },
  'xfc-revival-tins': { position: at(2.9, F2 + 1.2, -9.3), prompt: at(2.4, F2 + 1.6, -9.3), radius: 1.5, level: 1 },
  'xfc-revival-abacus': { position: at(-1.4, F2 + 0.8, -9.2), prompt: at(-1.4, F2 + 1.3, -9.7), radius: 1.5, level: 1 },
}
