/**
 * 霞海城隍廟・港口商街的殿內配置（第 11 階段；查證與設計見 docs/research/interior-xia-hai-cheng-huang.md）
 *
 * 街上的廟沿用本站的廟宇原型（specials.js 的 buildTemple，寬 12 m）：廟埕深 6.2 m，後面是台基上的拜亭與殿。
 * 殿內依廟方「廟宇藝術」各頁的位置安排：拜殿（中央案桌、左側廟祝櫃台、右側道士的桌、兩側牆前謝范將軍的落地神龕）
 * → 正殿（主神龕、翹頭神案、供桌與香爐、龕左右的大型文武判神偶、左後的義勇公龕）＋右側隔出的偏殿（城隍夫人，1893 年起）。
 * 真實的廟正身只有一坎約 6.5 m 寬；本站用整個殿寬，尺度是示意（使用者依研究文件第 6 節的建議）。
 * 1895 年以後才有的東西（月老、八司官、光明燈、天公爐、現代彩繪與門神）都不畫；供品查無出處，不畫。
 *
 * 本地座標：原點在廟的臨街中心，+z 朝街道，廟埕與殿在 -z；從街上正對廟時 +x 是右手邊。
 * 左右：匾額依廟方的寫法以神明的方向（面朝廟外）為準——神明的右手邊是本地的 -x。
 */

/** 廟埕深度（specials.js 的 courtD）；殿的群組原點在 z = -COURT_D（台基正面的石階上緣） */
export const COURT_D = 6.2
/** 台基高度：殿內的地面 */
export const XH_FLOOR_Y = 0.45

/** 殿的本地座標 → 廟的本地座標 */
export const hz = (z) => z - COURT_D

/** 殿內外殼（殿的本地座標） */
export const XH_HALL = {
  // 室內淨空：兩側牆內面 ±5.05，正面牆內面 -1.9，後牆內面 -7.85
  room: { minX: -5.05, maxX: 5.05, minZ: -7.85, maxZ: -1.9 },
  // 正面牆（specials.js：z = -1.7、厚 0.35）與中門
  frontWallZ: -1.7,
  door: { minX: -0.95, maxX: 0.95, height: 2.75 },
  // 牆頂與屋頂底（specials.js 的屋身磚塊底在台基上 3.8 m）
  wallTop: 3.85,
  // 拜殿與正殿的交界（大楣）
  splitZ: -4.2,
  // 右側偏殿（隔牆在 x = 3.2，門在隔牆上）
  sideRoom: { minX: 3.2, maxX: 5.05, minZ: -7.85, maxZ: -4.6, doorMinZ: -6.0, doorMaxZ: -5.0 },
  // 拜亭（正面牆與步口柱之間）與石階
  porch: { minX: -5.2, maxX: 5.2, minZ: -1.5, maxZ: -0.2 },
  steps: { minX: -1.5, maxX: 1.5, top: -0.2, bottom: 0.72 },
  columns: [-4.8, -1.7, 1.7, 4.8].map((x) => ({ x, z: -0.55, r: 0.2 })),
}

/**
 * 殿內的器物清單（殿的本地座標；y 從殿內地面算起）。同一份清單產生模型、障礙物與鏡頭遮擋。
 * 尺寸依廟方：鎮殿城隍三尺六（約 1.1 m）、配祀二尺三／二尺二／一尺六、大型神偶約八尺（2.4 m）、
 * 翹頭神案高約五尺、寬約六尺、深約兩尺；香爐八寸高、徑一尺；夫人三尺二；義勇公祿位二尺八。
 */
export const XH_ITEMS = [
  // ── 拜殿 ──
  { type: 'baxianTable', x: 0, z: -3.05 },
  { type: 'keeperDesk', x: -3.9, z: -2.75, rotationY: Math.PI / 2 },
  { type: 'priestDesk', x: 4.6, z: -2.75, rotationY: -Math.PI / 2 },
  // 拜殿與正殿交接處兩側牆前的落地神龕（廟方：謝范將軍神偶；神偶不畫，以簾幕示意——只畫主神與夫人，使用者 2026-11-03）
  { type: 'groundShrine', x: -4.6, z: -3.85, figure: 'xie', rotationY: Math.PI / 2 },
  { type: 'groundShrine', x: 4.6, z: -3.85, figure: 'fan', rotationY: -Math.PI / 2 },
  // ── 正殿 ──
  { type: 'mainShrine', x: 0, z: -7.33 },
  { type: 'altarTable', x: 0, z: -6.45 },
  { type: 'offeringTable', x: 0, z: -5.6 },
  { type: 'cushion', x: -0.45, z: -4.85, block: false },
  { type: 'cushion', x: 0.45, z: -4.85, block: false },
  { type: 'yiyongShrine', x: -4.35, z: -7.37 },
  // ── 右側偏殿：城隍夫人（1893 年起；宮娥不畫） ──
  { type: 'madamShrine', x: 4.12, z: -7.42 },
  { type: 'madamTable', x: 4.12, z: -6.65 },
]

/** 偏殿的隔牆（殿的本地座標的障礙物；門在 x = 3.2 的隔牆上） */
export function sideRoomWalls() {
  const r = XH_HALL.sideRoom
  return [
    { minX: r.minX - 0.06, maxX: r.minX + 0.06, minZ: r.minZ - 0.3, maxZ: r.doorMinZ },
    { minX: r.minX - 0.06, maxX: r.minX + 0.06, minZ: r.doorMaxZ, maxZ: r.maxZ + 0.06 },
    { minX: r.minX - 0.06, maxX: r.maxX + 0.3, minZ: r.maxZ - 0.06, maxZ: r.maxZ + 0.06 },
  ]
}

/** 殿內的人物（不具名；廟祝站在拜殿左側櫃台後，來拜的婦人站在正殿蒲團旁） */
export const XH_NPCS = [
  { id: 'xh-keeper', look: 'xhKeeper', pose: 'stand', x: -4.65, z: -2.75, rotationY: Math.PI / 2 },
  { id: 'xh-worshipper', look: 'xhWorshipper', pose: 'stand', x: 0.45, z: -4.35, rotationY: Math.PI },
]

/** 廟的地段（shops.js：site x 21.1、z -4.5、不旋轉）：本地 → 世界座標 */
export const XH_SITE = { x: 21.1, z: -4.5 }
export function xhToWorld(x, z) {
  return { x: XH_SITE.x + x, z: XH_SITE.z + z }
}

const at = (x, y, z) => {
  const p = xhToWorld(x, hz(z))
  return [p.x, XH_FLOOR_Y + y, p.z]
}

const shot = (position, target) => ({ position, target })
const Y = XH_FLOOR_Y

/** 殿內的資訊熱點（廟的本地座標；章節是霞海城隍廟的章節） */
export const XH_INTERIOR_HOTSPOTS = [
  {
    id: 'hall',
    label: '拜殿與正殿',
    labelEn: 'Vestibule and main hall',
    note: '兩殿式：正殿前加一座拜殿；殿內沒有一根柱子，桁桷外露（尺度是示意）',
    noteEn: 'Two halls: a vestibule before the main hall; not a single pillar inside, purlins and rafters exposed (scale illustrative)',
    chapter: 'origin',
    radius: 2.0,
    point: [0, hz(-2.6)],
    prompt: [0, Y + 2.4, hz(-2.6)],
    camera: shot([1.4, Y + 1.7, hz(-2.2)], [0, Y + 2.0, hz(-7.2)]),
  },
  {
    id: 'side-room',
    label: '右室：城隍夫人',
    labelEn: 'The right-hand room: the City God’s consort',
    note: '1893 年（光緒十九年）九間仔街阿仙舍立；今在左翼偏殿，本站依 1925 年報載的「右室」',
    noteEn: 'Installed in 1893 by Ah-sian of Kau-king-a Street; today in the left wing—this site follows the 1925 newspaper’s “right-hand room”',
    chapter: 'origin',
    radius: 1.4,
    point: [4.1, hz(-5.9)],
    prompt: [4.1, Y + 2.2, hz(-5.9)],
    camera: shot([3.7, Y + 1.6, hz(-5.1)], [4.12, Y + 1.3, hz(-7.6)]),
  },
]

/** 殿內可以近看的器物的位置（世界座標） */
export const XH_INSPECT_SPOTS = {
  'xh-shrine': { position: at(1.2, 1.8, -6.6), prompt: at(1.9, 2.0, -5.6), radius: 1.8 },
  'xh-censer': { position: at(0, 1.0, -5.6), prompt: at(-0.5, 1.5, -5.05), radius: 1.6 },
  'xh-plaques': { position: at(-1.45, 3.5, -6.9), prompt: at(-1.6, 1.9, -5.3), radius: 2.0 },
  'xh-yiyong': { position: at(-4.35, 1.4, -7.37), prompt: at(-3.9, 1.8, -6.3), radius: 1.6 },
}
