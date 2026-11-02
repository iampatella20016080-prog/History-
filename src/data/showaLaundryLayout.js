/**
 * 昭和浪漫洗濯屋（安西街3號；只在 2000–現在「老屋新生」）的位置、外殼尺寸、一樓的器物清單與人物
 *
 * 真實的店在安西街的街角：沿街的長立面（門、綠木框窗、大字店名）＋轉角的短山牆（暖簾、「台北・大稻埕」）。
 * 本站放在河岸廣場東南角：取代南側街屋列最西端的 south-13 與廣場南側的貨棧 plaza-1-1（和北側的滋養豆餡舖對稱），
 * 長立面沿著迪化街、山牆朝河岸廣場。安西街真正的位置不在迪化街上，這是配合本站街道的安排。
 *
 * 外觀與一樓依使用者提供的照片（2026-11-02）與媒體描述建模，尺寸由照片估算、比真實少一個開間；
 * 二樓閣樓不開放（使用者 2026-11-02 決定只做一樓），樓梯口封住。查證紀錄見 docs/research/showa-laundry.md。
 *
 * 本地座標（和共用的街屋室內 builders/shopInterior.js 相同）：原點在立面中心，+z 朝迪化街，室內在 -z；
 * 從街上正對立面時 +x 是右手邊（世界的西方、河岸廣場那一側）。
 */

/** 地段：世界座標的基準點與要取代的一般地段（只在老屋新生） */
export const SHOWA_SITE = { x: -34.6, z: 4.5, rotationY: Math.PI, replaces: ['south-13', 'plaza-1-1'] }

/** 本地 → 世界座標 */
export function showaToWorld(x, z) {
  const cos = Math.cos(SHOWA_SITE.rotationY)
  const sin = Math.sin(SHOWA_SITE.rotationY)
  return { x: SHOWA_SITE.x + x * cos + z * sin, z: SHOWA_SITE.z - x * sin + z * cos }
}

/**
 * 外殼：長立面 7.7 m（四開間）、山牆寬 5 m；一樓室內天花 3.0 m，屋簷 5.4 m、屋脊 6.6 m 的低坡鐵皮兩坡頂。
 * 隔間牆後面是 1.1 m 深的後場（擺著洗衣的舊物，情境示意）。
 */
export const SHOWA_SHELL = {
  half: 3.85,
  depth: 5.0,
  wallT: 0.25,
  groundH: 3.3,
  ceiling: 3.0,
  walkD: 1.7,
  room: { minX: -3.55, maxX: 3.55, minZ: -4.7, maxZ: -0.28 },
  eave: 5.4,
  ridge: 6.6,
  /** 後棟：山牆後面較矮的鐵皮屋（填補取代的地段，只是外觀） */
  annex: { minZ: -10.5, maxZ: -5.0, height: 3.6 },
}

/** 立面的開間（本地 x）：窗、門、壁柱與嵌在牆裡的販賣機（依照片由左到右） */
export const SHOWA_FACADE = {
  windows: [
    { x0: -3.25, x1: -2.42 },
    { x0: -0.55, x1: 1.25 },
    { x0: 1.45, x1: 2.5 },
  ],
  sill: 1.07,
  head: 2.45,
  vending: { x0: 2.56, x1: 3.26, depth: 0.62, height: 1.85 },
  /** 門左側壁柱上的「僑隆洗染」直式舊招牌 */
  oldSign: { x: -2.18, y0: 0.95, y1: 2.35, width: 0.32 },
}

/**
 * 一樓（2000–現在）：
 * - 門進來右手邊是長吧台（正面灰色水泥質感、台面木作，受付牌、紅色電話、桌燈、霜淇淋機），右端接玻璃展示櫃
 * - 左手邊是往閣樓的木樓梯（樓梯口掛金魚珠簾、封住），樓梯旁是碗櫥
 * - 沿著窗是靠窗的長桌與高腳椅（媒體：一樓靠窗只有三到五個座位）
 * - 隔間牆後的後場擺著木桶與洗衣板（情境示意，不是這家店的原物）
 */
export const SHOWA_VARIANT = {
  door: { minX: -1.95, maxX: -0.75 },
  frontPanels: 'open',
  partition: { z: -3.6, doorMinX: -2.35, doorMaxX: -1.55 },
  lamps: [[1.0, -1.7], [2.6, -1.7], [-1.3, -2.1]],
  items: [
    { type: 'bar', x0: 0.15, x1: 2.75, z: -2.62, depth: 0.66, height: 1.02 },
    { type: 'glassCase', x0: 2.75, x1: 3.5, z: -2.62, depth: 0.66, height: 1.2 },
    { type: 'shelf', x0: 0.2, x1: 3.4, z: -3.45, y: 2.05, block: false },
    { type: 'stairs', x0: -3.5, x1: -2.8, z0: -3.55, z1: -1.25, steps: 11 },
    { type: 'cupboard', x0: -1.45, x1: -0.4, z: -3.33, depth: 0.42, height: 1.75 },
    { type: 'windowLedge', x0: 0.0, x1: 2.45, z: -0.48, depth: 0.32, stools: [0.45, 1.25, 2.05] },
    { type: 'windowLedge', x0: -3.45, x1: -2.3, z: -0.48, depth: 0.32, stools: [-2.9] },
    { type: 'washTub', x: 0.9, z: -4.3 },
  ],
  npcs: [
    // 吧台裡的店員（不具名、不說話；不替仍在營業的店家說話）
    { id: 'showa-staff', look: 'showaStaff', pose: 'stand', x: 1.5, z: -3.25, rotationY: 0, seatY: 0 },
    // 看碗櫥上老物件的客人（可以交談）
    { id: 'showa-collector', look: 'revivalElderWoman', pose: 'stand', x: -0.9, z: -2.55, rotationY: Math.PI, seatY: 0 },
    // 靠窗吃霜淇淋的客人
    { id: 'showa-window-guest', look: 'revivalYoung', pose: 'softServe', x: 1.25, z: -1.05, rotationY: 0, seatY: 0.62 },
  ],
}

/**
 * 店外（本地座標）：門口的霜淇淋模型、長凳與腳踏車；山牆一側的「牛乳」長凳、小洗手台與盆栽；兩位可以交談的路人。
 * 每一件都是障礙物（互不重疊），seated 的人物坐在長凳上。
 */
export const SHOWA_OUTSIDE = {
  cone: { x: -3.3, z: 0.55, r: 0.28 },
  bench: { x0: 0.75, x1: 2.35, z: 0.42, depth: 0.42 },
  bicycle: { x: -0.05, z: 0.32 },
  gableBench: { x: 4.32, z0: -2.45, z1: -0.85, depth: 0.42 },
  sink: { x: 4.12, z: -2.85 },
  plants: [{ x: 4.15, z: -0.35 }, { x: 4.2, z: -3.35 }],
  npcs: [
    { id: 'showa-queue-visitor', look: 'revivalShopper', pose: 'phone', x: 3.3, z: 1.15, rotationY: Math.PI * 1.15 },
    { id: 'showa-bench-elder', look: 'revivalElder', pose: 'rest', x: 4.36, z: -1.65, rotationY: Math.PI / 2, seatY: 0.45 },
  ],
}

/**
 * 山牆朝廣場的那一面：廣場南側貨棧（plaza-1-0）的騎樓蓋住山牆靠後的 1.7 m，
 * 所以暖簾、窗、字與長凳都放在看得到、走得到的前段（本地 z 0 到 -3.3；廣場可以走到世界 z = 7.8）。
 */
export const SHOWA_GABLE = { centerZ: -1.65 }

const at = (x, y, z) => {
  const p = showaToWorld(x, z)
  return [p.x, y, p.z]
}

/** 資訊熱點（本地座標；章節見 shops.js 的 showa-laundry） */
export const SHOWA_HOTSPOTS = [
  {
    id: 'old-sign',
    label: '老洗衣店',
    labelEn: 'The old laundry',
    note: '門口左側紅底白字的直式招牌，是這裡還是洗衣店時留下來的',
    noteEn: 'The red vertical sign left of the door, left over from when this was a laundry',
    chapter: 'laundry',
    level: 0,
    radius: 1.8,
    point: [-2.3, 1.0],
    prompt: [-2.75, 2.65, 0.45],
    camera: { position: [-0.6, 1.7, 3.2], target: [-2.2, 1.6, 0] },
  },
  {
    id: 'bar',
    label: '吧台',
    labelEn: 'The counter',
    note: '每月換口味的霜淇淋、三色烤糰子與苦甜布丁',
    noteEn: 'Soft serve in a flavour that changes monthly, grilled three-colour dango and a bittersweet pudding',
    chapter: 'foods',
    level: 0,
    radius: 1.9,
    point: [1.4, -1.7],
    prompt: [1.4, 1.95, -1.9],
    camera: { position: [0.2, 1.75, -0.8], target: [1.6, 1.1, -2.2] },
  },
  {
    id: 'gable',
    label: '轉角的山牆',
    labelEn: 'The corner gable',
    note: '暖簾、「台北・大稻埕」與「隱身於街角的霜淇淋專賣店」',
    noteEn: 'Noren curtains, “Taipei · Dadaocheng” and “the soft-serve shop hidden on the street corner”',
    chapter: 'shop',
    level: 0,
    radius: 2.2,
    // 熱點在山牆的前角（離長凳上的阿伯遠一點，交談與介紹的提示不互搶）
    point: [5.3, 0.3],
    prompt: [4.6, 3.3, -1.65],
    camera: { position: [9.5, 2.6, -0.6], target: [3.85, 2.6, -1.65] },
  },
]

/** 可以近看的器物的位置（世界座標；data/showaLaundryObjects.js 引用） */
export const SHOWA_INSPECT_SPOTS = {
  'showa-old-sign': { position: at(-2.18, 1.65, 0.05), prompt: at(-2.18, 2.6, 0.5), radius: 1.7 },
  'showa-cone': { position: at(-3.3, 0.9, 0.55), prompt: at(-3.3, 2.0, 0.8), radius: 1.6 },
  'showa-charcoal-iron': { position: at(-0.95, 1.8, -3.33), prompt: at(-0.95, 2.15, -3.0), radius: 1.6 },
  'showa-washboard': { position: at(0.9, 0.5, -4.3), prompt: at(0.9, 1.3, -4.0), radius: 1.6 },
}
