import { PIER, RIVER } from '../game/config.js'

/**
 * 清末搭船（港口商街，1853–1895）：河道中下錨的內河帆船、搭駁船上船與回程、甲板上的器物與人物、落水。
 *
 * 只在 `qing-port` 出現；其他年代的棧橋、碰撞與河上的船都不變。查證紀錄與設計見 docs/research/qing-boarding.md。
 * 船型依 Davidson 1903 的基隆河帆船照片（約 1897，單桅、船中蓆篷、船首圓形標記）與記憶庫的「紅頭仔」描述
 * （平底、船首凸眼塗紅、長約 12 m）：地點與年代都不是清末的大稻埕，標「推定相近」；甲板的格局、舵、錨、
 * 艄棚與鋪位都查無，是歷史情境重建。
 *
 * 座標：帆船的本地座標以船心為原點、船頭在 +x、甲板面在 y = 0.92（船殼隨水面起伏，甲板的碰撞用固定高度）；
 * rotationY 為 π，所以世界座標 = (船心 x − 本地 x, 船心 y + 本地 y, 船心 z − 本地 z)，甲板的碰撞可以用軸對齊的矩形。
 */
export const QING_BOARDING_ERA = 'qing-port'

/** 甲板的碰撞樓層（街道是 0；室內的二樓用 1，甲板用一個不會和建築撞到的號碼） */
export const BOAT_LEVEL = 5

/** 按需產生的甲板細部（和店家的室內一樣由 worldManager.loadEraInterior 產生）：room id 與「建築」id */
export const JUNK_DECK_ZONE = { id: 'qing-junk-deck', building: 'qing-junk' }

const WL = RIVER.waterLevel

/** 帆船：位置（船心，水面下 0.35）、朝向、大小 */
export const JUNK = {
  position: [-66, WL - 0.35, -7.5],
  rotationY: Math.PI,
  length: 12,
  beam: 3.6,
  deckY: 0.92, // 甲板面（本地）
}

/** 甲板面的世界高度 */
export const DECK_Y = JUNK.position[1] + JUNK.deckY

/** 帆船本地座標 → 世界座標（[x, y, z] 或 [x, z]） */
export function junkToWorld(local) {
  const [bx, by, bz] = JUNK.position
  if (local.length === 2) return [bx - local[0], bz - local[1]]
  return [bx - local[0], by + local[1], bz - local[2]]
}

/** 世界座標 → 帆船本地座標 */
export function worldToJunk([x, y, z]) {
  const [bx, by, bz] = JUNK.position
  return [bx - x, y - by, bz - z]
}

/** 本地的朝向（人物面向 +Z 的 rotationY）→ 世界 */
export function junkRotationToWorld(rotationY) {
  return rotationY + JUNK.rotationY
}

/** 帆船本地的矩形 { minX, maxX, minZ, maxZ }（x、z 都會翻轉）→ 世界 */
function junkRect({ minX, maxX, minZ, maxZ, ...rest }) {
  const [bx, , bz] = JUNK.position
  return { minX: bx - maxX, maxX: bx - minX, minZ: bz - maxZ, maxZ: bz - minZ, ...rest }
}

/**
 * 甲板的格局（本地座標；船頭 +x）：
 *   船尾 艄棚 x −5.45…−4.0 ｜ 後甲板 ｜ 蓆篷 x −1.9…0.5（可以走進去）｜ 桅 x 1.2、水手 ｜ 貨艙口 x 1.9…3.85 ｜ 船首 錨 x 4.7…5.45
 * 貨艙口兩側與船首前的通道都寬過人物（0.64 m）。
 * 甲板面板長 10.7（x −5.25…5.45）、寬 3.5；舷牆只有 0.14 高，人物可以跨出去——跨出去就落水（見 WATER）。
 */
export const DECK = { minX: -5.25, maxX: 5.45, minZ: -1.75, maxZ: 1.75 }

/** 蓆篷（船中段的草蓆棚）：長 2.4、寬 2.1、頂高 2.3（走得進去，兩端開口；照片上的篷比較低，這裡為了人物與跟隨鏡頭抬高） */
export const SHELTER = { minX: -1.9, maxX: 0.5, minZ: -1.05, maxZ: 1.05, height: 2.3 }

/** 貨艙口：茶箱堆、樟腦箱與看得到的壓艙石 */
export const HATCH = { minX: 1.9, maxX: 3.85, minZ: -0.85, maxZ: 0.85 }

/** 單桅（船中偏前） */
export const MAST = { x: 1.2, z: 0, radius: 0.13, height: 7.4 }

/**
 * 甲板上的障礙物（本地座標；高度是給鏡頭遮擋用的世界高度差，從甲板面算）
 * 人物走不進去：艄棚、蓆篷的四根柱子與裡面的鋪位、桅、貨艙口的貨、船首的錨與錨索。
 */
export const DECK_OBSTACLES = [
  { id: 'stern-shelter', minX: -5.5, maxX: -4.0, minZ: -1.75, maxZ: 1.75, height: 1.5 },
  { id: 'bedding', minX: -1.75, maxX: -0.55, minZ: 0.25, maxZ: 0.95, height: 0.4 },
  { id: 'gear', minX: -0.5, maxX: 0.35, minZ: 0.45, maxZ: 0.95, height: 0.45 },
  ...[-1, 1].flatMap((sz) =>
    [SHELTER.minX + 0.05, SHELTER.maxX - 0.05].map((x, i) => ({ id: `shelter-post-${sz > 0 ? 'p' : 'n'}${i}`, minX: x - 0.06, maxX: x + 0.06, minZ: sz * 1.0 - 0.06, maxZ: sz * 1.0 + 0.06, height: SHELTER.height })),
  ),
  { id: 'mast', minX: MAST.x - MAST.radius, maxX: MAST.x + MAST.radius, minZ: -MAST.radius, maxZ: MAST.radius, height: MAST.height },
  { id: 'hatch', ...HATCH, height: 0.95 },
  { id: 'bow', minX: 4.7, maxX: 5.5, minZ: -1.75, maxZ: 1.75, height: 0.6 },
  // 後甲板右舷角落：等著卸上岸的鴉片箱（進口貨；只有箱子）
  { id: 'opium-chests', minX: -3.95, maxX: -3.45, minZ: -1.72, maxZ: -1.22, height: 0.75 },
]

/** 棧橋頭：換年代、落水或回程時人物回到這裡，面向街道（+x） */
export const PIER_HEAD = { x: -47.2, z: 0.1, heading: Math.PI / 2 }

/** 上船時站的位置（甲板靠棧橋那一側的舷梯口；本地座標與面向船頭） */
export const DECK_ENTRY = { local: [-3.0, 1.15], heading: -Math.PI / 2 }

/**
 * 甲板的可行走範圍（世界座標）：只屬於 BOAT_LEVEL 這一層，街道（level 0）完全不受影響。
 * inBuilding：換年代時人物不會被推進這裡；exitTo：換年代時直接放回棧橋頭。
 */
export function deckWalkable() {
  return [
    { ...junkRect(DECK), level: BOAT_LEVEL, floorY: DECK_Y, inBuilding: true, exitTo: [PIER_HEAD.x, PIER_HEAD.z, PIER_HEAD.heading] },
  ]
}

/** 甲板上的障礙物（世界座標，含 level） */
export function deckObstacles() {
  return DECK_OBSTACLES.map((box) => ({ ...junkRect(box), level: BOAT_LEVEL }))
}

/**
 * 落水的範圍（世界座標）：可以走出去的水面，踩進去就落水（collision.groundAt 回報 water）。
 * - 甲板四周（BOAT_LEVEL）：從舷邊跨出去
 * - 棧橋兩側與盡頭（level 0）：從棧橋邊走出去；停在棧橋旁的駁船是障礙物，走不上去
 * 水面的「地板」比水位低一些，人物落水時沒到胸口。
 */
export const WATER_FLOOR = WL - 0.55
export const PIER_WATER_WIDTH = 2.4

export function waterWalkable() {
  const edge = RIVER.edgeX - 0.05
  return [
    { ...junkRect({ minX: -7.5, maxX: 7.5, minZ: -4.2, maxZ: 4.2 }), level: BOAT_LEVEL, floorY: WATER_FLOOR, water: true },
    { minX: PIER.minX - 3, maxX: edge, minZ: PIER.halfWidth, maxZ: PIER.halfWidth + PIER_WATER_WIDTH, floorY: WATER_FLOOR, water: true },
    { minX: PIER.minX - 3, maxX: edge, minZ: -PIER.halfWidth - PIER_WATER_WIDTH, maxZ: -PIER.halfWidth, floorY: WATER_FLOOR, water: true },
    { minX: PIER.minX - 3, maxX: PIER.minX, minZ: -PIER.halfWidth, maxZ: PIER.halfWidth, floorY: WATER_FLOOR, water: true },
  ]
}

/** 棧橋旁兩艘駁船的船身（世界座標，level 0 的障礙物：掉進水裡也走不上船） */
export function sampanObstacles(boats) {
  return boats
    .filter((boat) => boat.type === 'sampan')
    .map((boat) => ({ minX: boat.position[0] - boat.length / 2, maxX: boat.position[0] + boat.length / 2, minZ: boat.position[2] - boat.beam / 2 - 0.1, maxZ: boat.position[2] + boat.beam / 2 + 0.1 }))
}

/**
 * 帆船的鏡頭遮擋方塊（世界座標，分件；取代整艘船一個大方塊，鏡頭才能在甲板上跟著人物）：
 * 水面以上的船殼（到舷牆頂）、蓆篷、艄棚、桅與收起的帆、船首的錨。
 */
export function junkBlockers() {
  const [, by] = JUNK.position
  const deck = DECK_Y
  const box = (rect, minY, maxY) => ({ ...junkRect(rect), minY, maxY })
  return [
    box({ minX: -6, maxX: 6, minZ: -1.9, maxZ: 1.9 }, WL - 0.6, deck + 0.16),
    // 蓆篷：頂與兩側的蓆面各一片（不是整個量體，人物走進去時鏡頭可以跟進去，貼著蓆面）
    box({ minX: SHELTER.minX, maxX: SHELTER.maxX, minZ: SHELTER.minZ, maxZ: SHELTER.maxZ }, deck + SHELTER.height - 0.1, deck + SHELTER.height),
    box({ minX: SHELTER.minX, maxX: SHELTER.maxX, minZ: SHELTER.minZ - 0.05, maxZ: SHELTER.minZ + 0.05 }, deck + 0.02, deck + SHELTER.height - 0.1),
    box({ minX: SHELTER.minX, maxX: SHELTER.maxX, minZ: SHELTER.maxZ - 0.05, maxZ: SHELTER.maxZ + 0.05 }, deck + 0.02, deck + SHELTER.height - 0.1),
    box({ minX: -5.5, maxX: -4.0, minZ: -1.75, maxZ: 1.75 }, deck, deck + 1.5),
    box({ minX: MAST.x - 0.3, maxX: MAST.x + 0.3, minZ: -0.3, maxZ: 0.3 }, deck, by + JUNK.deckY + MAST.height),
    box({ minX: 4.7, maxX: 5.5, minZ: -1.75, maxZ: 1.75 }, deck, deck + 0.6),
  ]
}

/** 蓆篷裡（兩端各多 2.2 m，走進去之前鏡頭就先貼近）：第三人稱鏡頭改用貼近障礙物的規則（像室內與窄巷），不會穿過蓆頂 */
export function deckFollowAreas() {
  return [{ ...junkRect({ minX: SHELTER.minX - 2.2, maxX: SHELTER.maxX + 2.2, minZ: SHELTER.minZ, maxZ: SHELTER.maxZ }), level: BOAT_LEVEL }]
}

/**
 * 駁船的路線（世界座標）：棧橋南側的停泊處 → 河心 → 帆船靠棧橋這一側的舷邊（船尾段）。
 * 終點離舷邊約 1 公尺（舷牆外、駁船的船身寬 1.5）。
 */
export const RIDE_ROUTE = [
  [-49.6, -(PIER.halfWidth + 1.4)],
  [-57.5, -2.6],
  [-62.6, -4.75],
]

/** 鏡頭在划船時的位置（棧橋頭的河岸邊，稍高；注視駁船） */
export const RIDE_CAMERA = { position: [-45.6, 2.6, 1.4], lookHeight: 0.6 }

/** 駁船上的位置（駁船本地座標：船頭 +x）：人物站在棚子後面的船尾，船夫在船頭撐篙 */
export const SAMPAN_SEATS = { player: [-1.75, 0.53, 0.0], boatman: [1.55, 0.53, -0.2] }

/**
 * 搭船的互動點（世界座標）：走近出現提示，點提示（或按 E）就出發／回程
 * - embark：棧橋頭、駁船船夫旁（level 0）
 * - disembark：甲板的舷梯口（BOAT_LEVEL）
 */
export const BOARDING_SPOTS = [
  {
    id: 'embark',
    action: 'board',
    // 船夫就在旁邊：搭船的按鈕併在他的「交談」提示卡上（兩張卡不疊在一起）
    npcId: 'qing-boatman',
    label: '駁船',
    labelEn: 'Cargo boat',
    note: '搭駁船到河心的帆船',
    noteEn: 'Ride out to the junk anchored midstream',
    position: [-48.6, 0, -0.9],
    // 提示卡放在駁船的船頭（離船夫頭上的「交談」卡遠一點，兩張卡不疊在一起）
    prompt: [-51.6, 0.6, -2.9],
    radius: 2.3,
    level: 0,
  },
  {
    id: 'disembark',
    action: 'return',
    npcId: 'qing-junk-helmsman',
    label: '舷梯口',
    labelEn: 'Gangway',
    note: '搭駁船回棧橋',
    noteEn: 'Take the cargo boat back to the pier',
    position: [...junkToWorld([DECK_ENTRY.local[0], DECK_Y, DECK_ENTRY.local[1]])],
    prompt: junkToWorld([DECK_ENTRY.local[0], DECK_Y + 1.5, DECK_ENTRY.local[1] + 0.7]),
    radius: 1.7,
    level: BOAT_LEVEL,
  },
]

/** 上船後站的位置（世界座標） */
export function deckEntryWorld() {
  const [x, z] = junkToWorld(DECK_ENTRY.local)
  return { x, z, heading: junkRotationToWorld(DECK_ENTRY.heading) }
}

/**
 * 人物（不具名的情境人物；穿著是歷史情境重建：短衫或赤膊、捲褲管、斗笠、辮子）
 * - boatman：棧橋頭的駁船船夫（街上的人物；划船時隱藏，改畫在駁船上撐篙）
 * - helmsman、deckhand：船上的舵工與水手（甲板載入時才畫，位置是帆船的本地座標）
 */
export const BOATMAN = { id: 'qing-boatman', look: 'qingBoatman', pose: 'stand', position: [-48.1, 0, -0.95], rotationY: Math.PI }

export const CREW = [
  { id: 'qing-junk-helmsman', look: 'qingHelmsman', pose: 'stand', local: [-3.6, 0.55], rotationY: -Math.PI / 2 },
  { id: 'qing-junk-deckhand', look: 'qingDeckhand', pose: 'carry', local: [1.5, 0.0], rotationY: Math.PI / 2 },
]

/** 船上人物的世界座標資料（street npcs 的格式；zone 讓 EraScene 不在街上畫他們，anchor 給距離判斷用） */
export function crewNpcs() {
  return CREW.map((member, i) => {
    const [x, z] = junkToWorld(member.local)
    return {
      id: member.id,
      look: member.look,
      pose: member.pose,
      position: [x, DECK_Y, z],
      rotationY: junkRotationToWorld(member.rotationY),
      level: BOAT_LEVEL,
      zone: JUNK_DECK_ZONE.id,
      phase: (0.31 + i * 0.37) % 1,
    }
  })
}

/** 船上人物的障礙物（世界座標，BOAT_LEVEL） */
export function crewObstacles() {
  return CREW.map((member) => {
    const [x, z] = junkToWorld(member.local)
    return { minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3, level: BOAT_LEVEL }
  })
}

/** 駁船船夫的障礙物（level 0，同時是鏡頭遮擋方塊） */
export function boatmanBox() {
  const [x, , z] = BOATMAN.position
  return { minX: x - 0.3, maxX: x + 0.3, minY: 0, maxY: 1.85, minZ: z - 0.3, maxZ: z + 0.3 }
}

/**
 * 甲板上可以近看的器物（本地座標；data/inspectObjects.js 轉成世界座標的 STREET_INSPECTABLES）
 * 位置都在貨艙口的貨物上或船首，人物站在旁邊的甲板上。
 */
export const DECK_INSPECT_SPOTS = {
  'junk-tea-chest': { local: [3.5, 0.9, 0.5], prompt: [3.5, 1.6, 0.5], radius: 1.4 },
  'junk-camphor-box': { local: [2.2, 0.75, -0.55], prompt: [2.2, 1.5, -0.55], radius: 1.4 },
  // 壓艙石的提示點在艙口左舷的框邊（站在艙口旁往下看），和茶箱、樟腦箱各有自己最近的站位
  'junk-ballast-stones': { local: [2.7, 0.3, 0.7], prompt: [2.7, 1.7, 0.7], radius: 1.3 },
  'junk-opium-chest': { local: [-3.7, 0.5, -1.47], prompt: [-3.7, 1.4, -1.47], radius: 1.4 },
  'junk-boat-eye': { local: [5.1, 0.6, 1.4], prompt: [5.0, 1.5, 1.2], radius: 1.7 },
}

export function deckInspectSpot(id) {
  const spot = DECK_INSPECT_SPOTS[id]
  return { position: junkToWorld([spot.local[0], JUNK.deckY + spot.local[1], spot.local[2]]), prompt: junkToWorld([spot.prompt[0], JUNK.deckY + spot.prompt[1], spot.prompt[2]]), radius: spot.radius, level: BOAT_LEVEL }
}

/** 清末搭船的查證來源（都在 data/sources.js；查證紀錄見 docs/research/qing-boarding.md） */
export const QING_BOARDING_SOURCE_IDS = [
  'davidson-formosa-1903',
  'tamsui-trade-report-1867',
  'tamsui-trade-report-1879',
  'tcmb-dadaocheng-wharf',
  'tcmb-junk-keelung',
  'tcmb-keelung-river-junk',
  'nmmst-river-boats',
  'zhu-qinbin-ship-paint-2018',
  'danshui-ting-zhi-1871',
  'dodd-blockade-1888',
  'mackay-from-far-formosa-1896',
  'denby-frus-1888',
]
