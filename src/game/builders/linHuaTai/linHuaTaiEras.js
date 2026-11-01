import { LHT_SHELL, LHT_VARIANTS, lhtEraToWorld } from '../../../data/linHuaTaiLayout.js'
import { buildShophouse } from '../shophouse.js'
import { shade, stool } from '../props.js'
import { FURNITURE, furnitureBounds, furnitureFootprint } from './linHuaTaiFurniture.js'
import { buildLinHuaTai1965, lht1965Columns } from './linHuaTaiBuilding1965.js'

/**
 * 林華泰茶行・酒樓繁華到老屋新生（第 11 階段；港口商街版在 builders/linHuaTaiQing.js）：
 * 酒樓繁華與摩登的外觀沿用一般閩南街屋（buildShophouse，walkIn 讓門面留空）；
 * 庶民生活與老屋新生是 1965 年前後改建的四層樓（linHuaTaiBuilding1965.js）。這裡補上：
 * - 門面兩側的門板（日治）、捲門（戰後）或敞開的店面（現在）
 * - 室內的外殼（地坪、內牆、天花、前店與工作間之間的隔間牆、後牆的小窗）
 * - 碰撞、鏡頭遮擋與室內範圍；擺設（器物清單，data/linHuaTaiLayout.js）在 buildLinHuaTaiEraInterior 按需載入
 * 外殼只用街景裡已經有的材質（流暢畫質的批次數不變）。格局查無，屬歷史情境重建。
 */
const S = LHT_SHELL

/** 各年代外殼的材質與顏色 */
// building1965：1965 年前後改建的四層樓（linHuaTaiBuilding1965.js）；庶民生活的樓還新、老屋新生的洗石子已經舊了
const LOOKS = {
  baozhongHong: { floor: ['earth', '#9a8468'], wall: '#e8dcc2', ceiling: 'beams', partition: 'planks', wood: '#c4a685' },
  charcoalRoastery: { floor: ['stone', '#a39684'], wall: '#e4d8bf', ceiling: 'beams', partition: 'planks', wood: '#b99a78' },
  wholesaleHong: {
    floor: ['stone', '#9c978c'], wall: '#ddd5c2', ceiling: 'plaster', partition: 'brick', wood: '#a88d70',
    building1965: { facadeTint: '#b4b2a6', finTint: '#e6e3da', frameTint: '#5d7266', grime: 0.08 },
  },
  heritageHong: {
    floor: ['stone', '#aaa498'], wall: '#ece6d6', ceiling: 'plaster', partition: 'planks', wood: '#7e5f45', partitionWindows: true,
    building1965: { facadeTint: '#a19f93', finTint: '#d6d3ca', frameTint: '#4f6157', grime: 0.3 },
  },
}

export function lhtEraVariant(config) {
  return LHT_VARIANTS[config.variant] ?? null
}

/** 室內外殼：地坪、內牆、天花、隔間牆（中央留門）與後牆的小窗 */
function interiorShell(b, variant, look) {
  const { room, ceiling } = S
  const { partition } = variant
  const width = room.maxX - room.minX
  const depth = room.maxZ - room.minZ
  const midZ = (room.minZ + room.maxZ) / 2
  b.box(look.floor[0], [width, 0.05, depth], [0, 0.025, midZ], { tint: look.floor[1], grime: 0.1 })
  if (look.ceiling === 'beams') {
    b.box('wood', [width, 0.07, depth], [0, ceiling + 0.035, midZ], { tint: '#584534' })
    for (let z = room.maxZ - 1.0; z > room.minZ; z -= 1.5) b.box('wood', [width, 0.13, 0.13], [0, ceiling - 0.065, z], { tint: '#49392b' })
  } else {
    b.box('plaster', [width, 0.06, depth], [0, ceiling + 0.03, midZ], { tint: shade(look.wall, 0.96) })
  }
  for (const s of [-1, 1]) b.box('plaster', [0.04, ceiling, depth], [s * (room.maxX + 0.02), ceiling / 2, midZ], { tint: look.wall, grime: 0.2 })
  b.box('plaster', [width, ceiling, 0.04], [0, ceiling / 2, room.minZ - 0.02], { tint: shade(look.wall, 0.97), grime: 0.2 })
  b.box('windowLit', [1.0, 0.8, 0.06], [1.2, 1.9, room.minZ + 0.01], { tint: '#453823' })
  // 隔間牆（中央留門）與門楣
  const pz = partition.z
  const mat = look.partition
  const tint = mat === 'planks' ? look.wood : '#b98a6c'
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? room.minX : partition.doorMaxX
    const x1 = s < 0 ? partition.doorMinX : room.maxX
    b.box(mat, [x1 - x0, ceiling, 0.1], [(x0 + x1) / 2, ceiling / 2, pz], { tint, grime: 0.18 })
  }
  // 現在：前店的後牆是木壁板與木框玻璃窗（官網照片的背景）
  if (look.partitionWindows) {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? room.minX + 0.2 : partition.doorMaxX + 0.25
      const x1 = s < 0 ? partition.doorMinX - 0.25 : room.maxX - 0.2
      b.box('windowLit', [x1 - x0, 0.75, 0.04], [(x0 + x1) / 2, 1.85, pz + 0.06], { tint: '#3d3326' })
      b.box('wood', [x1 - x0 + 0.08, 0.06, 0.08], [(x0 + x1) / 2, 1.45, pz + 0.07], { tint: shade(look.wood, 0.8) })
      b.box('wood', [x1 - x0 + 0.08, 0.06, 0.08], [(x0 + x1) / 2, 2.25, pz + 0.07], { tint: shade(look.wood, 0.8) })
    }
  }
  const doorW = partition.doorMaxX - partition.doorMinX
  const doorX = (partition.doorMinX + partition.doorMaxX) / 2
  b.box('wood', [doorW + 0.2, 0.14, 0.14], [doorX, 2.15, pz], { tint: shade(look.wood, 0.62) })
  b.box(mat, [doorW, ceiling - 2.22, 0.1], [doorX, (2.22 + ceiling) / 2, pz], { tint })
}

/** 店門口兩側：門板（日治）、捲門（戰後）或窄窄的木框（現在）；中央是可以走進去的門 */
function storefront(b, variant, look, openingH) {
  const { door } = variant
  const inner = S.half - 0.5
  const sides = [
    [-inner, door.minX],
    [door.maxX, inner],
  ]
  const h = openingH - 0.17
  for (const [x0, x1] of sides) {
    const w = x1 - x0
    if (w < 0.05) continue
    const cx = (x0 + x1) / 2
    if (variant.frontPanels === 'shutter') {
      b.box('shutter', [w, h, 0.05], [cx, 0.17 + h / 2, -0.12], { tint: '#8e9690' })
    } else if (variant.frontPanels === 'open') {
      // 現在：兩側是木框的玻璃櫥窗下牆，上半透出店裡
      b.box('planks', [w, 0.9, 0.12], [cx, 0.17 + 0.45, -0.12], { tint: look.wood })
      b.box('wood', [w, 0.06, 0.16], [cx, 1.1, -0.12], { tint: shade(look.wood, 0.7) })
    } else {
      // 門板：一片片直立的木板拼起來，白天卸下中央的幾片
      const count = Math.max(1, Math.round(w / 0.3))
      for (let i = 0; i < count; i++) {
        b.box('planks', [w / count - 0.012, h, 0.05], [x0 + (i + 0.5) * (w / count), 0.17 + h / 2, -0.12], { tint: shade(look.wood, 0.95 - (i % 2) * 0.05), grime: 0.2 })
      }
    }
  }
  if (variant.frontPanels === 'shutter') {
    // 捲起的捲門（門楣下的捲軸箱）
    b.box('shutter', [door.maxX - door.minX + 0.2, 0.32, 0.3], [(door.minX + door.maxX) / 2, openingH - 0.16, -0.05], { tint: '#7f8781' })
  }
}

/** 店內家具的鏡頭遮擋（家具在室內按需載入，遮擋一直都在） */
function furnitureBlockers(b, variant) {
  const start = b.blockers.length
  for (const item of variant.items) {
    const fp = furnitureBounds(item)
    b.addBlocker(fp.minX, fp.maxX, 0, FURNITURE[item.type].height(item), fp.minZ, fp.maxZ)
  }
  return [{ start, end: b.blockers.length }]
}

/* ── 碰撞 ─────────────────────────────── */

const rectOf = (transform, x0, x1, z0, z1, extra = {}) => {
  const p = transform(x0, z0)
  const q = transform(x1, z1)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
}

/**
 * 靠牆的障礙物延伸到牆裡：擺設和牆之間如果只留一條比人窄的縫，推擠會在牆與擺設之間來回抵消，
 * 人物可能卡在縫裡（tests/linHuaTai.test.js 的死角檢查）。離側牆、後牆或隔間牆（門以外）不到 0.7 公尺的就補滿。
 */
const SNAP = 0.7
function snapToWalls(r, partition) {
  const { room } = S
  const out = { ...r }
  if (r.minX - room.minX < SNAP) out.minX = room.minX - 0.3
  if (room.maxX - r.maxX < SNAP) out.maxX = room.maxX + 0.3
  if (r.minZ - room.minZ < SNAP) out.minZ = room.minZ - 0.3
  const clearOfDoor = r.maxX <= partition.doorMinX || r.minX >= partition.doorMaxX
  if (clearOfDoor && r.minZ > partition.z && r.minZ - partition.z < SNAP) out.minZ = partition.z - 0.05
  if (clearOfDoor && r.maxZ < partition.z && partition.z - r.maxZ < SNAP) out.maxZ = partition.z + 0.05
  return out
}

/** 矩形 r 扣掉 a（回傳不重疊的幾塊，聯集和 r − a 相同） */
function subtractRect(r, a) {
  if (a.minX >= r.maxX || a.maxX <= r.minX || a.minZ >= r.maxZ || a.maxZ <= r.minZ) return [r]
  const pieces = []
  if (a.minX > r.minX) pieces.push({ ...r, maxX: a.minX })
  if (a.maxX < r.maxX) pieces.push({ ...r, minX: a.maxX })
  const minX = Math.max(r.minX, a.minX)
  const maxX = Math.min(r.maxX, a.maxX)
  if (a.minZ > r.minZ) pieces.push({ minX, maxX, minZ: r.minZ, maxZ: a.minZ })
  if (a.maxZ < r.maxZ) pieces.push({ minX, maxX, minZ: a.maxZ, maxZ: r.maxZ })
  return pieces.filter((p) => p.maxX - p.minX > 0.01 && p.maxZ - p.minZ > 0.01)
}

/**
 * 本地座標的障礙物（器物、站著或坐著的人物與板凳）：靠牆的延伸到牆裡，再切成互不重疊的矩形
 * （範圍的聯集不變；街景的障礙物彼此不重疊，見 tests/modern.test.js）
 */
export function lhtEraObstacles(variant) {
  const list = variant.items.map(furnitureFootprint).filter(Boolean)
  for (const npc of variant.npcs) list.push({ minX: npc.x - 0.25, maxX: npc.x + 0.25, minZ: npc.z - 0.25, maxZ: npc.z + 0.25 })
  const result = []
  for (const rect of list.map((r) => snapToWalls(r, variant.partition))) {
    let pieces = [rect]
    for (const placed of result) pieces = pieces.flatMap((piece) => subtractRect(piece, placed))
    result.push(...pieces)
  }
  return result
}

export function linHuaTaiEraCollision(config, transform) {
  const variant = lhtEraVariant(config)
  if (!variant) return { walkable: [], obstacles: [] }
  const { half, walkD, room } = S
  const { door, partition } = variant
  const inB = (x0, x1, z0, z1) => rectOf(transform, x0, x1, z0, z1, { inBuilding: true })
  const walkable = [
    inB(-half + 0.1, half - 0.1, -0.05, walkD + 0.35),
    inB(door.minX, door.maxX, room.maxZ, 0.05),
    inB(room.minX + 0.05, room.maxX - 0.05, partition.z + 0.1, room.maxZ + 0.02),
    inB(partition.doorMinX + 0.05, partition.doorMaxX - 0.05, partition.z - 0.1, partition.z + 0.12),
    inB(room.minX + 0.05, room.maxX - 0.05, room.minZ + 0.05, partition.z - 0.08),
  ]
  const local = lhtEraObstacles(variant)
  // 四層樓的騎樓柱（在步道兩端）
  if (LOOKS[config.variant]?.building1965) local.push(...lht1965Columns(config.width ?? half * 2))
  const obstacles = local.map((r) => rectOf(transform, r.minX, r.maxX, r.minZ, r.maxZ))
  return { walkable, obstacles }
}

/* ── 主程式 ─────────────────────────────── */

export function buildLinHuaTaiEra(b, cfg = {}, detail = null) {
  const variant = lhtEraVariant(cfg)
  const look = LOOKS[cfg.variant]
  const result = look.building1965
    ? buildLinHuaTai1965(b, cfg, look.building1965)
    : buildShophouse(b, { ...cfg, walkIn: true, goods: false, display: null }, detail) ?? {}
  const openingH = Math.min(2.62, (result.groundHeight ?? S.groundH) - 0.6)
  interiorShell(b, variant, look)
  storefront(b, variant, look, openingH)
  const cameraOnly = furnitureBlockers(b, variant)
  const { half, room, ceiling, walkD, wallT, depth } = S
  const { door, partition } = variant
  const groundH = result.groundHeight ?? S.groundH
  // 建築的鏡頭遮擋分成牆面、門面與屋頂（室內的跟隨鏡頭要能在店裡活動）
  const ridge = (result.ridgeHeight ?? 5.6) + 0.4
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, ridge, -depth, 0)
  b.addBlocker(-half, half, 0, ridge, -depth, room.minZ)
  b.addBlocker(-half, door.minX, 0, groundH, -wallT, 0)
  b.addBlocker(door.maxX, half, 0, groundH, -wallT, 0)
  b.addBlocker(door.minX, door.maxX, openingH - 0.17, groundH, -wallT, 0)
  b.addBlocker(room.minX, partition.doorMinX, 0, ceiling, partition.z - 0.06, partition.z + 0.06)
  b.addBlocker(partition.doorMaxX, room.maxX, 0, ceiling, partition.z - 0.06, partition.z + 0.06)
  b.addBlocker(partition.doorMinX, partition.doorMaxX, 2.15, ceiling, partition.z - 0.06, partition.z + 0.06)
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
    npcs: variant.npcs.map((npc, i) => {
      const p = lhtEraToWorld(npc.x, npc.z)
      return {
        id: npc.id,
        zone: 'lin-hua-tai',
        look: npc.look,
        pose: npc.pose,
        seatY: npc.seatY,
        position: [p.x, 0, p.z],
        rotationY: b.worldRotationY(npc.rotationY),
        phase: (0.37 + i * 0.29) % 1,
      }
    }),
  }
}

/** 室內擺設（按需載入）：器物清單、坐著的人物的板凳、吊燈 */
export function buildLinHuaTaiEraInterior(b, cfg = {}, detail = b) {
  const variant = lhtEraVariant(cfg)
  if (!variant) return
  for (const item of variant.items) FURNITURE[item.type].build(b, item, detail)
  for (const npc of variant.npcs) if (npc.pose === 'sort') stool(b, [npc.x, 0, npc.z], { tint: '#9a7652' })
  // 吊燈：1930 年代起的電燈泡（燈罩與燈泡；只是燈具，不另外打光）
  const cord = S.ceiling - 0.55
  for (const [x, z] of variant.lamps) {
    b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
    b.cylinder(cfg.variant === 'heritageHong' ? 'steel' : 'plain', 0.07, 0.2, 0.12, 12, [x, cord, z], { tint: cfg.variant === 'heritageHong' ? '#d8d4c8' : '#e9e2cd', openEnded: true })
    b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, cord - 0.05, z], { tint: '#ffe6b0' })
  }
}
