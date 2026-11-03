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
  },
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
      { type: 'officeDesk', x: 2.2, z: -5.6 },
    ],
    upstairs: {
      items: [
        { type: 'roundTable', x: -3.0, z: -2.0, guests: [0, 1, 2] },
        { type: 'roundTable', x: 0.4, z: -2.0, course: true },
        { type: 'roundTable', x: -1.3, z: -5.3 },
        { type: 'sideboard', x: -4.85, z: -5.4 },
        { type: 'corridorWall', x0: -5.1, x1: 3.85, z: -7.1 },
        { type: 'hallPlaque', x: -2.6, z: -6.93, y: 2.3, block: false },
        { type: 'hallPlaque', x: 0.6, z: -6.93, y: 2.3, block: false },
        { type: 'adBanner', x: -4.3, z: -6.85, block: false },
        { type: 'adBanner', x: 2.2, z: -6.85, block: false },
      ],
      npcs: [
        { id: 'jsl-waiter-upstairs', look: 'jslWaitress', pose: 'stand', x: -4.15, z: -4.3, rotationY: Math.PI / 2, seatY: 0, level: 1 },
        { id: 'jsl-guest-a', look: 'jslGuest', pose: 'rest', x: -3.0, z: -1.05, rotationY: Math.PI, seatY: 0.46, level: 1, table: true },
        { id: 'jsl-guest-b', look: 'jslGuestB', pose: 'rest', x: -3.95, z: -2.0, rotationY: Math.PI / 2, seatY: 0.46, level: 1, table: true },
        { id: 'jsl-guest-c', look: 'jslGuestC', pose: 'rest', x: -2.05, z: -2.0, rotationY: -Math.PI / 2, seatY: 0.46, level: 1, table: true },
      ],
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
    id: 'upper-floors',
    label: '三樓與四樓', labelEn: 'Third and fourth floors',
    note: '三樓也是宴會廳；四樓是花園（樓頂庭園假山），本站不畫', noteEn: 'The third floor held more banquet rooms; the fourth was a roof garden with an artificial hill—not shown here',
    chapter: 'history',
    level: 1, radius: 1.6,
    point: [3.3, -6.5], prompt: [3.3, F2 + 2.3, -6.6],
    camera: { position: [1.5, F2 + 1.8, -4.4], target: [4.5, F2 + 1.4, -6.8] },
  },
]

/** 室內可以近看的器物的位置（本地座標 → 世界座標；level 1 在二樓） */
export const JSL_INSPECT_SPOTS = {
  'jsl-menu': { position: at(-1.6, 1.15, -2.0), prompt: at(-1.6, 1.6, -1.6), radius: 1.6 },
  'jsl-plaque': { position: at(-5.0, 2.7, -4.6), prompt: at(-4.2, 2.2, -3.6), radius: 1.8 },
  'jsl-course': { position: at(0.4, F2 + 0.82, -2.0), prompt: at(0.4, F2 + 1.4, -1.3), radius: 2.0, level: 1 },
  'jsl-hall-plaque': { position: at(-2.6, F2 + 2.3, -6.9), prompt: at(-2.6, F2 + 1.9, -6.3), radius: 2.0, level: 1 },
}
