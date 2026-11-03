/**
 * 江山樓的室內配置（第 11 階段；只有酒樓繁華；查證與設計見 docs/research/interior-jiang-shan-lou.md）
 *
 * 四層紅磚酒樓，地段在 x=-13.5、z=4.5（南側、朝北，本地 → 世界轉 180°），面寬 11 m、進深 12 m。
 * 建築 1970 年代拆除，室內影像只有一張宴席照（Wikimedia Commons〈Memorybank2019-大稻埕江山樓酒家宴席.jpg〉）；
 * 格局全部是歷史情境重建：一樓門廳與辦公室（後面的廚房不開放），右側木樓梯上二樓，畫其中一間宴會廳；
 * 三樓（宴會廳）、四樓（花園）只在熱點與對白。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 */
export const JIANG_SHAN_LOU_ID = 'jiang-shan-lou'

/** 外殼尺寸（floor2：二樓樓板頂、天花高、範圍與樓梯） */
export const JSL_SHELL = {
  half: 5.5,
  depth: 12,
  wallT: 0.35,
  groundH: 4.5,
  ceiling: 4.0,
  walkD: 1.7,
  room: { minX: -5.1, maxX: 5.1, minZ: -11.4, maxZ: -0.4 },
  floor2: {
    y: 4.55,
    ceiling: 3.1,
    room: { minX: -5.1, maxX: 5.1, minZ: -11.4, maxZ: -0.4 },
    // 門廳右側的木樓梯：沿右牆從 z=-1.2 往後爬到 z=-5.8；樓梯頂的平台只蓋住一小段
    stair: { minX: 4.0, maxX: 5.0, bottomZ: -1.2, topZ: -5.8, landingZ: -6.7 },
    // 往三樓的樓梯井；二樓天花以上的鏡頭遮擋由 builders/upperFloors.js 處理
    ceilingHoles: [{ minX: 4.0, maxX: 5.0, minZ: -10.4, maxZ: -6.9 }],
    roofBlocker: false,
  },
}

/**
 * 三樓、四樓與樓頂（builders/upperFloors.js；第 11 階段擴充，2026-11-03）：
 * - 三樓（level 2）：宴會場，同二樓的格局（前段大廳、後段一小間可以進去、走廊與其他廳的門關著）
 * - 四樓（level 3）：只有樓梯間可以走，四樓的房間不畫
 * - 樓頂（level 4）：露天的庭園，假山、盆景與花架在建築外觀（jiangShanLou.js 的 nmthSigns），這裡只登記它們的碰撞
 * 樓梯都沿右牆（x 4.0–5.0）；三、四樓的高度跟外觀的樓層（一樓 4.5 m、樓上每層 3.6 m）對齊。
 */
const ROOF_Y = 4.5 + 3.6 * 3 + 0.12
export const JSL_UPPER = [
  {
    level: 2,
    y: 4.5 + 3.6 + 0.05,
    ceiling: 3.1,
    room: { minX: -5.1, maxX: 5.1, minZ: -11.4, maxZ: -0.4 },
    stair: { minX: 4.0, maxX: 5.0, bottomZ: -6.9, topZ: -10.4, landingZ: -11.4 },
    holes: [{ minX: 4.0, maxX: 5.0, minZ: -4.6, maxZ: -1.0 }],
  },
  {
    level: 3,
    y: 4.5 + 3.6 * 2 + 0.05,
    ceiling: 3.1,
    room: { minX: -5.1, maxX: 5.1, minZ: -11.4, maxZ: -0.4 },
    hall: { minX: 2.9, maxX: 5.1, minZ: -6.3, maxZ: -4.4 },
    stair: { minX: 4.0, maxX: 5.0, bottomZ: -1.0, topZ: -4.6, landingZ: -5.6 },
    holes: [{ minX: 4.0, maxX: 5.0, minZ: -9.6, maxZ: -6.0 }],
  },
  {
    level: 4,
    y: ROOF_Y,
    open: true,
    room: { minX: -5.0, maxX: 5.0, minZ: -11.2, maxZ: -0.8 },
    stair: { minX: 4.0, maxX: 5.0, bottomZ: -6.0, topZ: -9.6, landingZ: -9.6 },
  },
]

/**
 * 二、三樓的後段（z 以後）：通往走廊的牆（中間 x 1.4–2.6 開著）、隔出一小間宴會廳的牆（x=-0.6，門口 1.2 公尺開著）、
 * 小間的圓桌與匾、走廊後牆上關著的門（其他宴會廳）。
 */
function backRooms(z) {
  return [
    { type: 'wallSeg', x0: -5.1, x1: 1.4, z0: z, z1: z, doors: [-3.6] },
    { type: 'wallSeg', x0: 2.6, x1: 3.85, z0: z, z1: z },
    { type: 'wallSeg', x0: -0.6, x1: -0.6, z0: z - 0.1, z1: z - 1.3 },
    { type: 'wallSeg', x0: -0.6, x1: -0.6, z0: z - 2.5, z1: -11.4 },
    { type: 'roundTable', x: -2.9, z: z - 2.5 },
    { type: 'hallPlaque', x: -2.9, z: -11.33, y: 2.3, block: false },
    { type: 'wallDoor', x: 0.6, z: -11.3, axis: 'x' },
    { type: 'wallDoor', x: 2.4, z: -11.3, axis: 'x' },
  ]
}

/**
 * 唯一的版本（酒樓繁華）：一樓門廳（菜單立架、牆上的賀匾與廣告旗、等候的長椅、辦公桌），
 * 隔間牆後是廚房（布簾擋住、不開放）；二樓一間宴會廳（白桌布的圓桌、備餐桌、屏風、賀匾、廣告旗、吊扇）。
 * 宴會廳的擺設依宴席照：白桌布的圓桌與深色木腳、牆高處兩塊題字的匾、有圓形標誌與直書片假名的啤酒廣告旗、吊扇、白玻璃罩吊燈、彩紙串。
 */
export const JSL_VARIANTS = {
  banquetHouse: {
    door: { minX: -1.25, maxX: 1.25 },
    frontPanels: 'none',
    partition: { z: -7.0, doorMinX: -1.4, doorMaxX: 1.4 },
    lamps: [[0, -2.2], [0, -4.8], [-3.0, -3.5]],
    items: [
      { type: 'kitchenCurtain', x: 0, z: -6.95, width: 2.8 },
      { type: 'menuStand', x: -1.6, z: -2.0 },
      { type: 'plaqueWall', x: -5.06, z0: -6.2, z1: -1.2, y: 2.7, block: false },
      { type: 'bench', x: -4.55, z: -2.3, length: 1.5 },
      { type: 'bench', x: -4.55, z: -4.6, length: 1.5 },
      { type: 'officeDesk', x: 2.2, z: -5.6, abacus: true },
      { type: 'umbrellaStand', x: -3.4, z: -0.9 },
      { type: 'pottedPalm', x: -2.4, z: -0.9 },
      { type: 'pottedPalm', x: 2.0, z: -6.5 },
    ],
    upstairs: {
      items: [
        { type: 'roundTable', x: -3.0, z: -2.0, guests: [0, 1, 2] },
        { type: 'roundTable', x: 0.4, z: -2.0, course: true },
        { type: 'roundTable', x: -1.3, z: -5.3 },
        { type: 'sideboard', x: -4.85, z: -5.4 },
        ...backRooms(-7.1),
        { type: 'hallPlaque', x: -2.6, z: -6.93, y: 2.3, block: false },
        { type: 'hallPlaque', x: 0.6, z: -6.93, y: 2.3, block: false },
        { type: 'adBanner', x: -4.3, z: -6.85, block: false },
        { type: 'adBanner', x: 3.2, z: -6.85, block: false },
      ],
      npcs: [
        { id: 'jsl-waiter-upstairs', look: 'jslWaitress', pose: 'stand', x: -4.15, z: -4.3, rotationY: Math.PI / 2, seatY: 0, level: 1 },
        { id: 'jsl-guest-a', look: 'jslGuest', pose: 'rest', x: -3.0, z: -1.05, rotationY: Math.PI, seatY: 0.46, level: 1, table: true },
        { id: 'jsl-guest-b', look: 'jslGuestB', pose: 'rest', x: -3.95, z: -2.0, rotationY: Math.PI / 2, seatY: 0.46, level: 1, table: true },
        { id: 'jsl-guest-c', look: 'jslGuestC', pose: 'rest', x: -2.05, z: -2.0, rotationY: -Math.PI / 2, seatY: 0.46, level: 1, table: true },
      ],
    },
    // 三樓、四樓的樓梯間與樓頂（builders/upperFloors.js）；新器物的位置先留好（器物的分層文字由研究補上後再接成可以近看的器物）
    floors: {
      2: {
        items: [
          { type: 'roundTable', x: -3.0, z: -2.6 },
          { type: 'roundTable', x: 0.6, z: -2.6, menu: true },
          { type: 'sideboard', x: -4.85, z: -4.8 },
          { type: 'beerCrate', x: -4.6, z: -0.95 },
          // 宴廳之間的木板門屏（吳瀛濤：每間以木板門屏隔開；形制是重建），推開收在走廊門口兩側
          { type: 'doorScreen', x: 2.0, z: -6.5, width: 1.2, block: false },
          ...backRooms(-6.5),
          { type: 'hallPlaque', x: -2.4, z: -6.33, y: 2.3, block: false },
          { type: 'adBanner', x: 0.4, z: -6.25, block: false },
        ],
        npcs: [
          { id: 'jsl-3f-waitress', look: 'jslWaitress', pose: 'stand', x: -4.15, z: -3.8, rotationY: Math.PI / 2, seatY: 0 },
          { id: 'jsl-3f-guest-a', look: 'jslGuestC', pose: 'rest', x: 0.6, z: -1.65, rotationY: Math.PI, seatY: 0.46 },
          { id: 'jsl-3f-guest-b', look: 'jslGuest', pose: 'rest', x: 1.55, z: -2.6, rotationY: -Math.PI / 2, seatY: 0.46 },
        ],
      },
      3: {
        items: [{ type: 'wallDoor', x: 3.4, z: -6.28, axis: 'x' }, { type: 'wallDoor', x: 2.93, z: -5.3, axis: 'z' }],
        npcs: [],
      },
      4: {
        // 樓頂庭園（外觀已畫）：假山、盆景與花架柱的碰撞
        items: [
          // 屋頂的大理石圓桌座（吳瀛濤；一桌幾人、桌面大小查無，示意）
          { type: 'marbleTable', x: 2.8, z: -9.0 },
          { type: 'roofObstacle', minX: -3.95, maxX: -1.25, minZ: -7.85, maxZ: -5.75 },
          ...[[-4.2, -2.6], [-1.0, -2.2], [1.6, -2.6], [-4.3, -9.6], [0.6, -10.4]].map(([x, z]) => ({ type: 'roofObstacle', minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 })),
          ...[-0.8, 1.8].flatMap((x) => [-4.8, -7.6].map((z) => ({ type: 'roofObstacle', minX: x - 0.12, maxX: x + 0.12, minZ: z - 0.12, maxZ: z + 0.12 }))),
        ],
        npcs: [],
      },
    },
    npcs: [
      { id: 'jsl-waiter', look: 'jslWaiter', pose: 'stand', x: 1.6, z: -3.2, rotationY: 0, seatY: 0 },
      { id: 'jsl-guest-waiting', look: 'jslGuestB', pose: 'rest', x: -4.6, z: -2.3, rotationY: Math.PI / 2, seatY: 0.46 },
    ],
  },
}

/** 本地 → 世界座標（地段在 x=-13.5、z=4.5、轉 180°：建築朝北） */
export const JSL_SITE = { x: -13.5, z: 4.5 }
export function jslToWorld(x, z) {
  return { x: JSL_SITE.x - x, z: JSL_SITE.z - z }
}

const at = (x, y, z) => {
  const p = jslToWorld(x, z)
  return [p.x, y, p.z]
}

const F2 = JSL_SHELL.floor2.y
const F3 = JSL_UPPER[0].y
const F4 = JSL_UPPER[1].y

/** 店內的資訊熱點（本地座標；章節是江山樓既有的章節） */
export const JSL_INTERIOR_HOTSPOTS = [
  {
    id: 'kitchen',
    label: '廚房', labelEn: 'Kitchen',
    note: '一樓後面是廚房（不開放）：開幕時聘福州、上海、廣東的名廚', noteEn: 'The kitchen behind the ground floor (closed to visitors): at its opening it hired cooks from Fuzhou, Shanghai and Canton',
    chapter: 'history',
    level: 0, radius: 2.0,
    point: [1.6, -6.2], prompt: [1.9, 2.6, -6.4],
    camera: { position: [0.8, 1.8, -3.6], target: [0, 1.4, -7.0] },
  },
  {
    id: 'banquet-room',
    label: '二樓的宴會廳', labelEn: 'Upstairs banquet room',
    note: '二、三樓是宴會場，共十四間、可容五百人；這裡畫其中一間', noteEn: 'The second and third floors were banquet rooms—fourteen in all, for five hundred guests; one is shown here',
    chapter: 'banquet',
    level: 1, radius: 2.2,
    point: [2.6, -4.2], prompt: [2.6, F2 + 2.2, -4.2],
    camera: { position: [3.2, F2 + 2.0, -0.9], target: [-1.6, F2 + 0.8, -4.0] },
  },
  {
    id: 'office',
    label: '辦公廳', labelEn: 'Office',
    note: '一樓充作辦公廳、廚房、作業地，使用人經常有五十名以上（吳瀛濤）', noteEn: 'The ground floor served as office, kitchen and workrooms, with fifty or more staff as a rule (Wu Ying-tao)',
    chapter: 'history',
    level: 0, radius: 1.6,
    point: [1.0, -5.2], prompt: [0.9, 2.6, -5.6],
    camera: { position: [-0.6, 1.8, -3.0], target: [2.2, 1.0, -5.8] },
  },
  {
    id: 'third-floor',
    label: '三樓的宴會場', labelEn: 'Third-floor banquet rooms',
    note: '二、三樓都是宴會場（陳柔縉）；這裡畫一間大廳與後面一小間，其他廳的門關著', noteEn: 'The second and third floors were both banquet floors (Chen Rou-chin); one large hall and a small room behind are shown, the other rooms’ doors closed',
    chapter: 'banquet',
    level: 2, radius: 2.2,
    point: [2.6, -4.6], prompt: [2.6, F3 + 2.2, -4.6],
    camera: { position: [3.2, F3 + 2.0, -1.0], target: [-1.6, F3 + 0.8, -4.0] },
  },
  {
    id: 'fourth-floor',
    label: '四樓', labelEn: 'Fourth floor',
    note: '四樓的房間本站不畫；樓梯再往上是樓頂', noteEn: 'The fourth-floor rooms are not shown; the stairs continue up to the roof',
    chapter: 'history',
    level: 3, radius: 1.4,
    point: [3.6, -5.4], prompt: [3.6, F4 + 2.1, -5.4],
    camera: { position: [3.3, F4 + 1.8, -4.6], target: [4.5, F4 + 2.0, -7.6] },
  },
  {
    id: 'roof-garden',
    label: '樓頂庭園', labelEn: 'Roof garden',
    note: '樓頂有庭園與假山（莊永明）；陳柔縉寫四樓有花園。假山、盆景與花架的樣子是示意', noteEn: 'The roof had a garden with an artificial hill (Chuang Yung-ming); Chen Rou-chin says the fourth floor had a garden. The rockery, potted plants and trellis are illustrative',
    chapter: 'history',
    level: 4, radius: 2.4,
    point: [1.6, -6.2], prompt: [1.6, ROOF_Y + 2.2, -6.2],
    camera: { position: [3.2, ROOF_Y + 2.4, -1.6], target: [-2.6, ROOF_Y + 0.8, -6.8] },
  },
]

/** 室內可以近看的器物的位置（本地座標 → 世界座標；level 1 在二樓） */
export const JSL_INSPECT_SPOTS = {
  'jsl-menu': { position: at(-1.6, 1.15, -2.0), prompt: at(-1.6, 1.6, -1.6), radius: 1.6 },
  'jsl-plaque': { position: at(-5.0, 2.7, -4.6), prompt: at(-4.2, 2.2, -3.6), radius: 1.8 },
  'jsl-course': { position: at(0.4, F2 + 0.82, -2.0), prompt: at(0.4, F2 + 1.4, -1.3), radius: 2.0, level: 1 },
  'jsl-hall-plaque': { position: at(-2.6, F2 + 2.3, -6.9), prompt: at(-2.6, F2 + 1.9, -6.3), radius: 2.0, level: 1 },
  'jsl-abacus': { position: at(2.45, 0.85, -5.65), prompt: at(2.45, 1.4, -4.9), radius: 1.6 },
  'jsl-3f-menu': { position: at(0.85, F3 + 0.82, -2.25), prompt: at(0.85, F3 + 1.4, -1.5), radius: 1.9, level: 2 },
  'jsl-3f-beer': { position: at(-4.6, F3 + 0.8, -0.95), prompt: at(-4.0, F3 + 1.4, -1.2), radius: 1.6, level: 2 },
  'jsl-3f-screen': { position: at(2.0, F3 + 1.2, -6.5), prompt: at(2.0, F3 + 2.0, -5.9), radius: 1.6, level: 2 },
  'jsl-roof-rockery': { position: at(-2.6, ROOF_Y + 0.8, -6.8), prompt: at(-1.2, ROOF_Y + 1.8, -6.8), radius: 2.2, level: 4 },
  'jsl-roof-bonsai': { position: at(-4.3, ROOF_Y + 0.6, -9.6), prompt: at(-3.7, ROOF_Y + 1.4, -9.3), radius: 1.6, level: 4 },
  'jsl-roof-marble': { position: at(2.8, ROOF_Y + 0.75, -9.0), prompt: at(2.8, ROOF_Y + 1.4, -8.0), radius: 1.8, level: 4 },
  'jsl-3f-plaque': { position: at(-2.4, F3 + 2.3, -6.3), prompt: at(-2.4, F3 + 1.9, -5.7), radius: 2.0, level: 2 },
}
