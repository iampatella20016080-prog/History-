/**
 * 爐鍋咖啡與小藝埕的配置資料（只在 2000–現在「老屋新生」出現）
 *
 * 位置、入口、樓梯、房間、資訊熱點與鏡頭錨點都在這裡定義一次，
 * 店家資料（shops.js）、建築與室內的產生器（builders/luguoCafe*.js）都從這裡取用，不在各處重複寫座標。
 *
 * 建築本地座標：原點在迪化街北側立面線（一樓店面線）上、建築寬度的中央；
 * +x 往東（街底的永樂市場），+z 往迪化街（南），室內在 -z；y 為高度。
 * 建築取代北側街尾的兩個一般地段（north-7、north-8），東側的牆面對永樂市場前廣場北邊的小巷（場景中的32巷），
 * 二樓的爐鍋咖啡從側面騎樓的樓梯入口上樓。
 *
 * 尺寸依實地照片估算，並非測量；巷子的位置是情境示意，不是實際的門牌位置。
 */
export const ART_YARD = {
  /** 世界座標的原點（地段的中心、北側立面線）與取代的地段 */
  site: { x: 31.8, z: -4.5, rotationY: 0, replaces: ['north-7', 'north-8'] },
  half: 4.2, // 面寬 8.4 m（x -4.2 – 4.2）
  front: 1.7, // 樓上立面前緣（騎樓柱列外緣，世界 z -2.8）
  back: -15.5, // 後牆外緣
  wallT: 0.25,
  floor2: 4.0, // 二樓地板面
  slab: 0.25,
  ceiling2: 7.5, // 二樓天花
  floor3: 7.8,
  top: 11.2, // 三樓牆頂
  parapet: 12.0,
  towerTop: 14.4, // 轉角塔樓第四層的牆頂
  towerParapet: 15.3,
  /** 轉角塔樓佔的面寬（迪化街側 x -0.4 – 4.2）與側面的深度（z 1.7 – -2.9） */
  tower: { minX: -0.4, maxX: 4.2, minZ: -2.9 },
  /** 側面立面（面向巷子）的開間：塔樓之後四個開間，每間約 3.15 m */
  sideBays: [-2.9, -6.05, -9.2, -12.35, -15.5],
  /** 騎樓：迪化街側（z 0 – 1.7）與巷子側（x 2.4 – 4.2，一樓店面牆在 x 2.4） */
  arcadeWallX: 2.4,
  columnInset: 0.25,
}

/**
 * 樓梯（迴轉梯）：從巷子側騎樓的入口往西上第一段（12 階），在半樓的平台迴轉，第二段往東上到二樓的樓梯平台，
 * 再經過咖啡館的玻璃門進到店裡。看得見的階梯另外建模；角色踩的是碰撞資料裡看不見的連續斜面。
 */
export const LUGUO_STAIRS = {
  door: { minZ: -15.05, maxZ: -14.0 }, // 騎樓牆上的入口（x = arcadeWallX）
  pad: { minX: 1.6, maxX: 2.4 }, // 入口內的平地
  run: { lower: 1.6, upper: -1.6 }, // 兩段樓梯的東端與西端（x）
  flight1: { minZ: -15.15, maxZ: -13.9 }, // 第一段（往西上）
  flight2: { minZ: -13.7, maxZ: -12.5 }, // 第二段（往東上）
  landing: { minX: -3.0, maxX: -1.6, y: 2.0 }, // 半樓的迴轉平台
  top: { minX: 1.6, maxX: 3.95 }, // 二樓的樓梯平台（與第二段同寬）
  steps: 12, // 每段的階數
  wellMinZ: -15.25, // 樓梯間的後牆內側
  wellMaxZ: -12.4, // 樓梯間與咖啡館之間的牆（咖啡館側在 z -12.2）
}

/** 二樓的爐鍋咖啡：房間內側的範圍與玻璃門（樓梯平台 → 店內） */
export const LUGUO_CAFE = {
  minX: -3.95,
  maxX: 3.95,
  minZ: -12.2,
  maxZ: 1.45,
  door: { minX: 2.55, maxX: 3.55 }, // 北牆（z -12.2 – -12.4）上的玻璃門（寬 1 m）
  /** 吧檯：靠西牆的大木櫃與平行的工作台（客人站在東側） */
  bar: { cabinetX: -3.95, counterX: -1.95, minZ: -3.3, maxZ: 1.15 },
}

/** 建築本地座標 → 世界座標（建築沒有旋轉） */
export function artYardToWorld(x, z) {
  const { site } = ART_YARD
  const c = Math.cos(site.rotationY)
  const s = Math.sin(site.rotationY)
  return { x: site.x + x * c + z * s, z: site.z - x * s + z * c }
}

/**
 * 資訊熱點（建築本地座標）：走近時出現提示，電腦按 E、觸控點提示或點那個物件，開啟爐鍋咖啡介紹的對應章節。
 * level：所在樓層（0 街道與一樓、1 二樓）；radius：觸發距離；prompt：提示框的位置；
 * camera：開啟介紹時的鏡頭位置與注視點（[x, y, z]，建築本地座標）。
 */
export const LUGUO_HOTSPOTS = [
  {
    id: 'art-yard',
    label: '小藝埕（屈臣氏大藥房舊址）',
    note: '轉角塔樓的立面保留「A.S. WATSON & CO.」字樣',
    chapter: 'building',
    point: [3.0, 3.6],
    level: 0,
    radius: 2.6,
    prompt: [3.0, 3.4, 2.4],
    camera: { position: [-3.4, 3.2, 10.6], target: [2.4, 7.4, 0.6] },
  },
  {
    id: 'stairs',
    label: '樓梯入口',
    note: '從巷子側的騎樓走上二樓',
    chapter: 'luguo',
    point: [3.35, -14.5],
    level: 0,
    radius: 1.7,
    prompt: [3.3, 2.7, -14.5],
    camera: { position: [8.0, 2.6, -11.2], target: [2.2, 1.7, -14.5] },
  },
  {
    id: 'window',
    label: '窗邊座位',
    note: '三組木格窗面對小巷',
    chapter: 'art-yard',
    point: [1.4, -7.6],
    level: 1,
    radius: 2.3,
    prompt: [2.6, 5.9, -7.6],
    camera: { position: [-1.6, 6.1, -2.6], target: [3.2, 5.0, -8.6] },
  },
  {
    id: 'bar',
    label: '咖啡吧檯',
    note: '手沖、義式咖啡與烘焙咖啡豆',
    chapter: 'coffee',
    point: [-0.75, -1.0],
    level: 1,
    radius: 2.0,
    prompt: [-1.95, 5.75, -1.0],
    camera: { position: [1.6, 6.0, -3.6], target: [-2.9, 5.0, -0.2] },
  },
  {
    id: 'gacha',
    label: '紅色扭蛋機',
    note: '裝著咖啡器具的迷你模型（依實地照片）',
    chapter: 'coffee',
    point: [-0.3, -10.95],
    level: 1,
    radius: 1.4,
    prompt: [-0.3, 6.15, -11.9],
    camera: { position: [1.5, 5.75, -8.9], target: [-0.3, 4.9, -11.9] },
  },
]
