/**
 * 李亭香的室內配置（第 11 階段；查證與設計見 docs/research/interior-li-ting-xiang.md）
 *
 * 只在老屋新生可以走進去（迪化街一段 309 號，仍營業）：地段在 x=16.7、z=4.5、轉 180°（朝北），面寬 5.4 m、進深 11 m，
 * 是這條街最窄的一間。其他三個年代仍是一般閩南街屋，不動。
 * 簷下步道 → 前店（玻璃展示櫃、櫃台、禮盒架）→ 內用座位（依旅遊媒體「店內設有內用座位」）→ 隔間牆的後門（關著，後面的工作間不開放）。
 * 店內的照片描述查無，格局與擺設都是歷史情境重建；不寫店家沒有公開的經營細節。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 */

export const LTX_SHELL = {
  half: 2.7,
  depth: 11,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 2.95,
  walkD: 1.7,
  room: { minX: -2.35, maxX: 2.35, minZ: -10.4, maxZ: -0.34 },
}

/**
 * 老屋新生的版本（器物清單見 builders/liTingXiang/liTingXiangFurniture.js；block: false 的不擋路）：
 * - 左側玻璃展示櫃（平西餅、平安龜、綠豆糕；平西餅與平安龜可以近看）
 * - 右側櫃台（紙盒、一盤收涎餅可以近看），店員站在櫃台後；門口右側素色禮盒架
 * - 內用座位兩組小方桌（坐著喝茶的客人）；左牆掛餅印（示意，壽字桃形餅印可以近看）
 * - 隔間牆的後門關著（使用者同意研究文件的建議：不畫工作區，後門加熱點說明）
 */
export const LTX_VARIANTS = {
  pastryShop: {
    door: { minX: -1.0, maxX: 1.0 },
    frontPanels: 'open',
    partition: { z: -6.0, doorMinX: -0.9, doorMaxX: 0.9 },
    lamps: [[0, -2.2], [0, -4.6]],
    items: [
      { type: 'displayCase', x: -1.85, z: -2.25, length: 1.9, depth: 0.6, height: 1.0 },
      { type: 'counter', x: 1.45, z: -2.45, length: 1.4, depth: 0.6, height: 0.95 },
      { type: 'giftBoxShelf', x: 2.2, z0: -1.55, z1: -0.6 },
      { type: 'cafeTable', x: -1.25, z: -4.6 },
      { type: 'cafeTable', x: 1.25, z: -4.6 },
      { type: 'mouldWall', x: -2.33, z0: -5.7, z1: -3.6, block: false },
      { type: 'backDoor', x: 0, z: -6.0, width: 1.8 },
    ],
    npcs: [
      { id: 'ltx-staff', look: 'ltxStaff', pose: 'stand', x: 2.0, z: -2.45, rotationY: -Math.PI / 2, seatY: 0 },
      { id: 'ltx-customer', look: 'ltxCustomer', pose: 'rest', x: 1.25, z: -5.12, rotationY: 0, seatY: 0.45 },
    ],
  },
}

/** 本地 → 世界座標（地段在 x=16.7、z=4.5、轉 180°：建築朝北） */
export const LTX_SITE = { x: 16.7, z: 4.5 }
export function ltxToWorld(x, z) {
  return { x: LTX_SITE.x - x, z: LTX_SITE.z - z }
}

const at = (x, y, z) => {
  const p = ltxToWorld(x, z)
  return [p.x, y, p.z]
}

/** 店內的資訊熱點（本地座標；章節是李亭香共用的章節） */
export const LTX_INTERIOR_HOTSPOTS = [
  {
    id: 'shop-front',
    label: '前店與內用座位',
    labelEn: 'Shop front and tea seats',
    note: '旅遊媒體寫店面「融合了紅磚洋樓與白洋房空間」、設有內用座位；店內擺設是歷史情境重建',
    noteEn: 'Travel media describe the shop as blending a red-brick western house with a white one, with seats inside; the furnishings are a historical reconstruction',
    chapter: 'today',
    level: 0,
    radius: 1.6,
    point: [0, -3.6],
    prompt: [0, 2.2, -3.6],
    camera: { position: [0.4, 1.8, -0.8], target: [0, 1.1, -5.0] },
  },
  {
    id: 'workroom',
    label: '後面是工作間',
    labelEn: 'The workroom behind',
    note: '後面是工作間，不開放；本站查無可見的描述，不畫',
    noteEn: 'The workroom is behind this door and not open; no visible description was found, so this site does not draw it',
    chapter: 'today',
    level: 0,
    radius: 1.3,
    point: [0, -5.45],
    prompt: [0, 2.3, -5.6],
    camera: { position: [0.3, 1.7, -3.4], target: [0, 1.3, -6.0] },
  },
]

/** 可以近看的器物的位置（本地座標 → 世界座標） */
export const LTX_INSPECT_SPOTS = {
  'ltx-pingxi': { position: at(-1.85, 1.05, -1.6), prompt: at(-1.3, 1.6, -1.6), radius: 1.5 },
  'ltx-turtle': { position: at(-1.85, 1.05, -2.9), prompt: at(-1.3, 1.6, -2.9), radius: 1.5 },
  'ltx-shouxian': { position: at(1.3, 1.0, -1.95), prompt: at(0.9, 1.55, -1.95), radius: 1.4 },
  'ltx-mould': { position: at(-2.3, 1.45, -4.0), prompt: at(-1.8, 1.9, -4.0), radius: 1.5 },
}
