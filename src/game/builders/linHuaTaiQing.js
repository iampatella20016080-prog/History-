import { LHT, lhtToWorld } from '../../data/linHuaTaiQingLayout.js'
import { buildShophouse } from './shophouse.js'
import { shade } from './props.js'

/**
 * 林華泰茶行・港口商街版（1853–1895；只有這個年代可以走進去）：
 * 外觀沿用一般閩南街屋（buildShophouse，walkIn 讓門面留空），
 * 這裡補上室內的外殼（地板、內牆、天花、隔間牆與敞開的門板）；
 * 前店、秤茶桌與焙茶區的擺設在 linHuaTaiQingInterior.js 按需載入。
 * 格局查無，屬歷史情境重建；配置見 data/linHuaTaiQingLayout.js。
 */
const L = LHT
const FLOOR = '#9c8468'

/** 室內外殼：夯土般的地坪、內牆、天花木梁、前店與焙茶區之間的隔間牆 */
function interiorShell(b, woodTint) {
  const { room, ceiling, partition, door } = L
  const darkWood = shade(woodTint, 0.62)
  // 地坪（石灰地）與天花、木梁
  b.box('earth', [room.maxX - room.minX, 0.05, room.maxZ - room.minZ], [0, 0.025, (room.minZ + room.maxZ) / 2], { tint: FLOOR, grime: 0.12 })
  b.box('wood', [room.maxX - room.minX, 0.07, room.maxZ - room.minZ], [0, ceiling + 0.035, (room.minZ + room.maxZ) / 2], { tint: '#584534' })
  for (let z = room.maxZ - 1.0; z > room.minZ; z -= 1.5) {
    b.box('wood', [room.maxX - room.minX, 0.13, 0.13], [0, ceiling - 0.065, z], { tint: '#49392b' })
  }
  // 內牆（灰泥）與後牆、後牆的透光小窗
  for (const s of [-1, 1]) {
    b.box('plaster', [0.04, ceiling, room.maxZ - room.minZ], [s * (room.maxX + 0.02), ceiling / 2, (room.minZ + room.maxZ) / 2], { tint: '#e9dec6', grime: 0.2 })
  }
  b.box('plaster', [room.maxX - room.minX, ceiling, 0.04], [0, ceiling / 2, room.minZ - 0.02], { tint: '#e5dac2', grime: 0.2 })
  b.box('windowLit', [1.0, 0.8, 0.06], [0.9, 1.8, room.minZ + 0.01], { tint: '#453823' })
  b.addGlow(0.9, 1.8, room.minZ + 0.4, 1.4, '#ffdcae')
  // 隔間牆（木板，中央留門）與門楣
  const pz = partition.z
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? room.minX : partition.doorMaxX
    const x1 = s < 0 ? partition.doorMinX : room.maxX
    b.box('planks', [x1 - x0, ceiling, 0.08], [(x0 + x1) / 2, ceiling / 2, pz], { tint: woodTint, grime: 0.18 })
  }
  b.box('wood', [partition.doorMaxX - partition.doorMinX + 0.2, 0.14, 0.12], [0, 2.1, pz], { tint: darkWood })
  b.box('plaster', [partition.doorMaxX - partition.doorMinX, ceiling - 2.17, 0.08], [0, (2.17 + ceiling) / 2, pz], { tint: '#e9dec6' })
  // 店門口兩側折起的門板（白天卸下斜靠在門邊）
  for (let i = 0; i < 3; i++) {
    b.box('planks', [0.3, 2.2, 0.05], [-L.half + 0.55 + i * 0.07, 1.1, 0.2 + i * 0.07], { rotation: [-0.08, 0, 0], tint: shade(woodTint, 0.95 - i * 0.04) })
  }
  // 門口灑進店內的光
  b.addPool(0, -0.8, 1.4, '#ffc98a', 0.07)
}

/** 室內家具的鏡頭遮擋（家具在 interior 按需載入，遮擋一直都在） */
function furnitureBlockers(b) {
  const start = b.blockers.length
  const { counter, scaleTable, roasting, shelf } = L
  b.addBlocker(counter.x - counter.depth / 2, counter.x + counter.depth / 2, 0, counter.height + 0.2, counter.z - counter.width / 2, counter.z + counter.width / 2)
  b.addBlocker(scaleTable.x - scaleTable.width / 2, scaleTable.x + scaleTable.width / 2, 0, 1.5, scaleTable.z - scaleTable.depth / 2, scaleTable.z + scaleTable.depth / 2)
  b.addBlocker(roasting.platform.minX, roasting.platform.maxX, 0, 1.3, roasting.platform.minZ, roasting.platform.maxZ)
  b.addBlocker(shelf.x - 0.3, shelf.x + 0.45, 0, 1.9, shelf.z0 - 0.1, shelf.z1 + 0.1)
  return [{ start, end: b.blockers.length }]
}

/* ── 碰撞 ─────────────────────────────── */

const rectOf = (transform, x0, x1, z0, z1, extra = {}) => {
  const p = transform(x0, z0)
  const q = transform(x1, z1)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
}

export function linHuaTaiQingCollision(config, transform) {
  const { half, walkD, door, room, counter, scaleTable, roasting, shelf, partition, jarsOnFloor, sacks } = L
  const inB = (x0, x1, z0, z1) => rectOf(transform, x0, x1, z0, z1, { inBuilding: true })
  const walkable = [
    inB(-half + 0.1, half - 0.1, -0.05, walkD + 0.35),
    inB(door.minX, door.maxX, room.maxZ, 0.05),
    inB(room.minX + 0.05, room.maxX - 0.05, partition.z + 0.1, room.maxZ + 0.02),
    // 隔間牆的門與焙茶區
    inB(partition.doorMinX + 0.05, partition.doorMaxX - 0.05, partition.z - 0.1, partition.z + 0.12),
    inB(room.minX + 0.05, room.maxX - 0.05, room.minZ + 0.05, partition.z - 0.08),
  ]
  const obstacles = [
    rectOf(transform, counter.x - counter.depth / 2 - 0.03, counter.x + counter.depth / 2 + 0.03, counter.z - counter.width / 2, counter.z + counter.width / 2),
    rectOf(transform, scaleTable.x - scaleTable.width / 2 - 0.03, scaleTable.x + scaleTable.width / 2 + 0.03, scaleTable.z - scaleTable.depth / 2 - 0.03, scaleTable.z + scaleTable.depth / 2 + 0.03),
    rectOf(transform, roasting.platform.minX - 0.05, roasting.platform.maxX + 0.05, roasting.platform.minZ - 0.05, roasting.platform.maxZ + 0.05),
    rectOf(transform, shelf.x - 0.35, shelf.x + 0.45, shelf.z0 - 0.1, shelf.z1 + 0.1),
    ...jarsOnFloor.map((j) => rectOf(transform, j.x - 0.26, j.x + 0.26, j.z - 0.26, j.z + 0.26)),
    ...sacks.map((s) => rectOf(transform, s.x - 0.3, s.x + 0.3, s.z - 0.3, s.z + 0.3)),
    ...roasting.sacks.map((s) => rectOf(transform, s.x - 0.3, s.x + 0.3, s.z - 0.3, s.z + 0.3)),
    ...roasting.baskets.filter((k) => !k.onPit).map((k) => rectOf(transform, k.x - 0.35, k.x + 0.35, k.z - 0.35, k.z + 0.35)),
    ...L.npcs.map((npc) => rectOf(transform, npc.x - 0.25, npc.x + 0.25, npc.z - 0.25, npc.z + 0.25)),
  ]
  return { walkable, obstacles }
}

/* ── 主程式 ─────────────────────────────── */

export function buildLinHuaTaiQing(b, cfg = {}, detail = null) {
  const woodTint = cfg.woodTint ?? '#c9ad8a'
  const result = buildShophouse(b, { ...cfg, walkIn: true, goods: false, display: null }, detail) ?? {}
  interiorShell(b, woodTint)
  const cameraOnly = furnitureBlockers(b)
  const { half, room, ceiling, walkD, door, wallT, depth, partition } = L
  // 建築的鏡頭遮擋分成牆面、門面與屋頂（室內的跟隨鏡頭要能在店裡活動）
  const ridge = (result.ridgeHeight ?? 5.6) + 0.4
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, ridge, -depth, 0)
  b.addBlocker(-half, half, 0, ridge, -depth, -depth + wallT)
  b.addBlocker(-half, door.minX, 0, result.groundHeight ?? 3.3, -wallT, 0)
  b.addBlocker(door.maxX, half, 0, result.groundHeight ?? 3.3, -wallT, 0)
  b.addBlocker(door.minX, door.maxX, 2.45, result.groundHeight ?? 3.3, -wallT, 0)
  // 隔間牆（中央留門）與天花以上的屋頂
  b.addBlocker(room.minX, partition.doorMinX, 0, ceiling, partition.z - 0.06, partition.z + 0.06)
  b.addBlocker(partition.doorMaxX, room.maxX, 0, ceiling, partition.z - 0.06, partition.z + 0.06)
  b.addBlocker(partition.doorMinX, partition.doorMaxX, 2.1, ceiling, partition.z - 0.06, partition.z + 0.06)
  b.addBlocker(-half, half, ceiling, ridge, -depth, 0)

  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const zone = (minX, maxX, minZ, maxZ) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }

  return {
    ...result,
    cameraOnly,
    interiors: [
      {
        id: 'lin-hua-tai',
        ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
        ceiling,
        entry: zone(door.minX - 1.2, door.maxX + 1.2, room.maxZ, walkD + 0.9),
        entryHold: 0.5,
        entryRamp: 2.4,
        door: toWorld(0, 0),
        camera: { distance: 3.0, maxHeight: ceiling - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        viewerStart: { distance: 2.6 },
        loadRadius: 15,
        showRadius: 24,
      },
    ],
    viewerRegions: [
      { ...zone(-half + 0.4, half - 0.4, 0.15, walkD - 0.1), maxY: 2.4, cameraMaxY: 3.0 },
      { ...zone(room.minX + 0.3, room.maxX - 0.3, room.minZ + 0.3, -0.15), maxY: 2.2, cameraMaxY: ceiling - 0.3 },
    ],
    followAreas: [zone(-half, half, room.minZ, walkD), zone(-half - 0.5, half + 0.5, walkD, walkD + 2.4)],
    npcs: L.npcs.map((npc, i) => {
      const p = lhtToWorld(npc.x, npc.z)
      return {
        id: npc.id,
        zone: 'lin-hua-tai',
        look: npc.look,
        pose: npc.pose,
        seatY: npc.seatY,
        position: [p.x, 0, p.z],
        rotationY: b.worldRotationY(npc.rotationY),
        phase: (0.41 + i * 0.29) % 1,
      }
    }),
  }
}
