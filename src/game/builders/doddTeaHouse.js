import { DODD, DODD_HOTSPOTS, doddToWorld } from '../../data/doddLayout.js'
import { archWindow, cornice, pilaster, rectWindow } from './facade.js'

/**
 * 寶順洋行（港口商街，1853–1895）：兩層洋樓的立面與可以走進去的精製茶廠外殼。
 *
 * 立面沿用原本 baroque 樣式的語彙（白灰泥、壁柱、拱窗、卷草女兒牆與木招牌），
 * 一樓改成中央大門敞開的門面（原本是 storefront: 'half' 的一般洋樓）；
 * 室內的揀茶、焙茶與裝箱擺設在 doddTeaHouseInterior.js 按需載入，
 * 這裡只建室內的外殼（地板、牆面、天花與透光的後窗），從街上就看得到。
 * 格局查無，依 Davidson（1903）的精製流程重建（歷史情境重建）；見 data/doddLayout.js。
 */
const L = DODD
const PLASTER = '#f1e9d8'
const TRIM = '#fbf7ee'
const WOOD = '#6b4f39'
const FLOOR = '#8a6c4e'

/** 立面（+z 朝街道）：壁柱、一樓門面、二樓拱窗、簷口與卷草女兒牆 */
function facade(b) {
  const { half, wallT, groundH, upperH, door, walkD, walkH } = L
  const top = groundH + upperH
  // 簷下步道
  b.box('stone', [half * 2, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: '#dcd5c6' })
  b.box('stone', [half * 2, walkH + 0.025, 0.22], [0, (walkH + 0.025) / 2, walkD - 0.11], { tint: '#b3a995' })
  // 一樓：兩側牆段（大門兩旁各開一扇直欞窗）與門楣上的牆帶
  const openingH = 2.7
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -half : door.maxX
    const x1 = s < 0 ? door.minX : half
    b.box('stucco', [x1 - x0, openingH, wallT], [(x0 + x1) / 2, openingH / 2, -wallT / 2], { tint: PLASTER, grime: 0.14 })
    rectWindow(b, { x: s * (half - (half - door.maxX) / 2), y: 1.7, width: 0.9, height: 1.2, z: 0.01, lit: true, frameTint: WOOD, barTint: '#caa97e' })
    b.addGlow(s * (half - (half - door.maxX) / 2), 1.7, 0.3, 1.2, '#ffcf8a')
  }
  b.box('stucco', [half * 2, groundH - openingH, wallT], [0, (openingH + groundH) / 2, -wallT / 2], { tint: PLASTER, grime: 0.1 })
  // 大門：木門框與兩扇往內敞開的門板
  b.box('wood', [door.maxX - door.minX + 0.24, 0.16, wallT + 0.08], [0, openingH + 0.08, -wallT / 2], { tint: WOOD })
  for (const s of [-1, 1]) {
    b.box('wood', [0.12, openingH, wallT + 0.08], [s * (door.maxX + 0.06), openingH / 2, -wallT / 2], { tint: WOOD })
    b.box('planks', [0.06, openingH - 0.25, 0.85], [s * (door.maxX - 0.05), (openingH - 0.25) / 2 + 0.02, -wallT - 0.42], { tint: '#7c5a40', grime: 0.15 })
  }
  // 門上的玻璃氣窗（透光）
  b.box('windowLit', [door.maxX - door.minX, 0.5, 0.06], [0, openingH + 0.16 + 0.17, -wallT / 2], { tint: '#3d3226' })
  // 二樓：灰泥牆、三扇拱窗、兩側與中央的壁柱
  b.box('stucco', [half * 2, upperH, wallT], [0, groundH + upperH / 2, -wallT / 2], { tint: PLASTER, grime: 0.08 })
  for (const x of [-2.1, 0, 2.1]) archWindow(b, { x, y: groundH + 1.55, width: 1.0, height: 1.7, z: 0.01, frameTint: TRIM, lit: x !== 0 })
  for (const x of [-half + 0.25, half - 0.25]) pilaster(b, { x, y0: groundH, y1: top, z: 0.02, width: 0.36, tint: TRIM })
  cornice(b, { y: groundH + 0.06, width: half * 2 + 0.1, z: 0.04, tint: TRIM })
  cornice(b, { y: top, width: half * 2 + 0.16, z: 0.08, tint: TRIM })
  // 卷草女兒牆（中央拱起）與招牌
  b.box('stucco', [half * 2, 0.6, 0.24], [0, top + 0.3, -0.12], { tint: PLASTER })
  b.box('stucco', [2.6, 0.5, 0.26], [0, top + 0.78, -0.12], { tint: TRIM })
  b.cylinder('stucco', 0.3, 0.3, 0.26, 10, [-1.3, top + 0.6, -0.12], { rotation: [Math.PI / 2, 0, 0], tint: TRIM })
  b.cylinder('stucco', 0.3, 0.3, 0.26, 10, [1.3, top + 0.6, -0.12], { rotation: [Math.PI / 2, 0, 0], tint: TRIM })
  // 招牌（字樣由 SignLayer 依傳統由右至左排，與原本 baroque 立面的招牌相同）
  b.addSign({ text: 'Dodd & Co. 寶順洋行', style: 'wood', width: 3.6, height: 0.62, position: [0, groundH - 0.42, 0.08] })
}

/** 側牆、後牆、屋頂與室內的外殼（地板、內牆、天花、透光的後窗） */
function shell(b) {
  const { half, wallT, groundH, upperH, depth, room, ceiling } = L
  const top = groundH + upperH
  const back = -depth
  for (const s of [-1, 1]) {
    b.box('stucco', [wallT, top, depth], [s * (half - wallT / 2), top / 2, back / 2], { tint: '#e8dfc9', grime: 0.2 })
  }
  b.box('stucco', [half * 2, top, wallT], [0, top / 2, back + wallT / 2], { tint: '#e3dac4', grime: 0.2 })
  // 平屋頂與矮女兒牆（洋樓）
  b.box('stone', [half * 2, 0.18, depth], [0, top - 0.09, back / 2], { tint: '#c9bfa8' })
  for (const s of [-1, 1]) b.box('stucco', [wallT, 0.5, depth], [s * (half - wallT / 2), top + 0.25, back / 2], { tint: PLASTER })
  b.box('stucco', [half * 2, 0.5, wallT], [0, top + 0.25, back + wallT / 2], { tint: PLASTER })

  // ── 室內外殼（從大門就看得到） ──
  // 地板（木板）與天花
  b.box('planks', [room.maxX - room.minX, 0.06, room.maxZ - room.minZ], [0, 0.03, (room.minZ + room.maxZ) / 2], { tint: FLOOR, grime: 0.1 })
  b.box('wood', [room.maxX - room.minX, 0.08, room.maxZ - room.minZ], [0, ceiling + 0.04, (room.minZ + room.maxZ) / 2], { tint: '#5c4836' })
  // 天花的木梁
  for (let z = room.maxZ - 1.2; z > room.minZ; z -= 1.6) {
    b.box('wood', [room.maxX - room.minX, 0.14, 0.14], [0, ceiling - 0.07, z], { tint: '#4e3c2c' })
  }
  // 室內牆面（略暖的灰泥）與室內那一面的後牆、透光的後窗
  for (const s of [-1, 1]) {
    b.box('plaster', [0.04, ceiling, room.maxZ - room.minZ], [s * (room.maxX + 0.02), ceiling / 2, (room.minZ + room.maxZ) / 2], { tint: '#efe6d2', grime: 0.18 })
  }
  b.box('plaster', [room.maxX - room.minX, ceiling, 0.04], [0, ceiling / 2, room.minZ - 0.02], { tint: '#ece2cd', grime: 0.18 })
  b.box('windowLit', [1.4, 1.1, 0.06], [-1.4, 1.9, room.minZ + 0.01], { tint: '#4a3a2a' })
  b.box('windowLit', [1.4, 1.1, 0.06], [1.4, 1.9, room.minZ + 0.01], { tint: '#4a3a2a' })
  b.addGlow(0, 2.0, room.minZ + 0.4, 1.8, '#ffdcae')
  // 門口灑進室內的光
  b.addPool(0, -0.9, 1.6, '#ffc98a', 0.08)
}

/** 室內家具的鏡頭遮擋（家具本身在 interior 按需載入，但鏡頭的遮擋與碰撞一直都在） */
function furnitureBlockers(b) {
  const start = b.blockers.length
  const { picking, roasting, packing } = L
  for (const t of picking.tables) b.addBlocker(t.x - 0.8, t.x + 0.8, 0, 0.75, t.z - 0.55, t.z + 0.55)
  const p = roasting.platform
  b.addBlocker(p.minX, p.maxX, 0, 1.4, p.minZ, p.maxZ)
  b.addBlocker(packing.bench.x - packing.bench.width / 2, packing.bench.x + packing.bench.width / 2, 0, 1.1, packing.bench.z - 0.5, packing.bench.z + 0.5)
  return [{ start, end: b.blockers.length }]
}

/* ── 碰撞與佔地 ─────────────────────────── */

const rect = (transform, x0, x1, z0, z1, extra = {}) => {
  const p = transform(x0, z0)
  const q = transform(x1, z1)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
}

/** 可行走範圍（標 inBuilding：換年代時角色回到街上）與室內的障礙物 */
export function doddCollision(config, transform) {
  const { half, walkD, door, room, picking, roasting, packing, shelf, desk } = L
  const room_ = (x0, x1, z0, z1) => rect(transform, x0, x1, z0, z1, { inBuilding: true })
  const walkable = [
    // 簷下步道（與街道的可行走範圍相接）
    room_(-half + 0.1, half - 0.1, -0.05, walkD + 0.35),
    // 大門
    room_(door.minX, door.maxX, room.maxZ, 0.05),
    // 室內
    room_(room.minX + 0.05, room.maxX - 0.05, room.minZ + 0.05, room.maxZ + 0.02),
  ]
  const obstacles = [
    ...picking.tables.map((t) => rect(transform, t.x - 0.8, t.x + 0.8, t.z - 0.52, t.z + 0.52)),
    ...picking.baskets.map((k) => rect(transform, k.x - 0.3, k.x + 0.3, k.z - 0.3, k.z + 0.3)),
    rect(transform, roasting.platform.minX - 0.05, roasting.platform.maxX + 0.05, roasting.platform.minZ - 0.05, roasting.platform.maxZ + 0.05),
    rect(transform, packing.bench.x - packing.bench.width / 2 - 0.05, packing.bench.x + packing.bench.width / 2 + 0.05, packing.bench.z - 0.5, packing.bench.z + 0.5),
    ...packing.chests.map((c) => rect(transform, c.x - 0.35, c.x + 0.35, c.z - 0.3, c.z + 0.3)),
    rect(transform, shelf.x - 0.35, shelf.x + 0.4, shelf.z0 - 0.1, shelf.z1 + 0.1),
    rect(transform, desk.x - 0.5, desk.x + 0.5, desk.z - 0.45, desk.z + 0.45),
    // 焙茶區旁待用的焙籠與站著的人物
    ...roasting.baskets.filter((k) => !k.onPit).map((k) => rect(transform, k.x - 0.35, k.x + 0.35, k.z - 0.35, k.z + 0.35)),
    ...L.npcs.filter((npc) => npc.pose !== 'sort').map((npc) => rect(transform, npc.x - 0.25, npc.x + 0.25, npc.z - 0.25, npc.z + 0.25)),
    // 坐著的揀茶女與板凳
    ...L.npcs.filter((npc) => npc.pose === 'sort').map((npc) => rect(transform, npc.x - 0.3, npc.x + 0.3, npc.z - 0.3, npc.z + 0.3)),
  ]
  return { walkable, obstacles }
}

/** 寶順洋行佔用的範圍（不產生遠景房屋與遠景的樹） */
export function doddFootprint(transform) {
  return rect(transform, -L.half - 0.4, L.half + 0.4, -L.depth - 0.5, L.walkD)
}

/* ── 主程式 ─────────────────────────────── */

export function buildDoddTeaHouse(b, cfg = {}) {
  facade(b)
  shell(b)
  const cameraOnly = furnitureBlockers(b)
  const { half, groundH, upperH, depth, room, ceiling, walkD, door, wallT } = L
  const top = groundH + upperH
  // 建築的鏡頭遮擋分成牆面與樓板（不能是一整個實心方塊：室內的跟隨鏡頭要能在店裡活動）
  const openingH = 2.7
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, top + 1.1, -depth, 0)
  b.addBlocker(-half, half, 0, top + 1.1, -depth, -depth + wallT)
  b.addBlocker(-half, door.minX, 0, groundH, -wallT, 0)
  b.addBlocker(door.maxX, half, 0, groundH, -wallT, 0)
  b.addBlocker(door.minX, door.maxX, openingH, groundH, -wallT, 0)
  // 二樓（室內天花以上整層）與女兒牆
  b.addBlocker(-half, half, ceiling, top + 1.1, -depth, 0)

  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const toWorld = (x, z) => doddToWorld(x, z)
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const zone = (minX, maxX, minZ, maxZ) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }

  return {
    groundHeight: groundH,
    topHeight: top + 1.1,
    cameraOnly,
    anchors: { prompt: local(0, groundH + 0.6, walkD), marker: local(0, top + 2.4, -1.2) },
    focus: {
      center: toWorld(0, 0.2),
      forward: dir(0, 1),
      width: half * 2 + 1.0,
      height: top + 1.2,
      viewHeight: 3.4,
      maxDistance: 11,
      maxPitch: 0.45,
      maxYawOffset: 0.55,
    },
    interiors: [
      {
        id: 'dodd-tea-house',
        ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
        ceiling,
        // 入口：簷下步道與門前 0.9 公尺的街道
        entry: zone(door.minX - 1.2, door.maxX + 1.2, room.maxZ, walkD + 0.9),
        entryHold: 0.5,
        entryRamp: 2.4,
        door: toWorld(0, 0),
        camera: { distance: 3.4, maxHeight: ceiling - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.5, minDistance: 0.8 },
        viewerStart: { distance: 3.0 },
        loadRadius: 15,
        showRadius: 24,
      },
    ],
    viewerRegions: [
      { ...zone(-half + 0.4, half - 0.4, 0.15, walkD - 0.1), maxY: 2.6, cameraMaxY: 3.2 },
      { ...zone(room.minX + 0.35, room.maxX - 0.35, room.minZ + 0.35, -0.15), maxY: 2.4, cameraMaxY: ceiling - 0.3 },
    ],
    followAreas: [zone(-half, half, room.minZ, walkD), zone(-half - 0.5, half + 0.5, walkD, walkD + 2.4)],
    // 室內的情境人物（zone：室內載入、顯示時才出現）
    npcs: L.npcs.map((npc, i) => {
      const p = toWorld(npc.x, npc.z)
      return {
        id: npc.id,
        zone: 'dodd-tea-house',
        look: npc.look,
        pose: npc.pose,
        seatY: npc.seatY,
        position: [p.x, 0, p.z],
        rotationY: b.worldRotationY(npc.rotationY),
        phase: (0.23 + i * 0.37) % 1,
      }
    }),
  }
}

export { DODD_HOTSPOTS }
