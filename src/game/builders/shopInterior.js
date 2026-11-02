import { shade } from './props.js'

/**
 * 可以走進去的街屋室內：共用的做法（第 11 階段；林華泰茶行是第一個用的店家，之後的店家照同樣的方式接上）
 *
 * 一棟街屋分成：簷下步道 → 店門口（兩側門板、捲門或櫥窗下牆）→ 前店 → 隔間牆（中央留門）→ 店後的工作間。
 * 擺設用「器物清單」描述（type、位置、大小），同一份清單產生模型、碰撞的障礙物與鏡頭的遮擋方塊，不會對不上。
 * 本地座標：原點在立面中心，+z 朝街道，室內在 -z；從街上正對立面時 +x 是右手邊。
 *
 * createShopInterior(spec) 的 spec：
 * - id：室內範圍的 id（室內人物的 zone 用同一個）
 * - shell：外殼尺寸 { half, depth, wallT, groundH, ceiling, walkD, room: { minX, maxX, minZ, maxZ } }
 * - variantOf(cfg)：這個年代的版本 { door, frontPanels, partition, lamps, items, npcs }（沒有時回傳 null）
 * - lookOf(cfg)：外殼的材質與顏色 { floor: [材質, 顏色], wall, ceiling: 'beams' | 'plaster', partition, wood, partitionWindows }
 * - furniture：器物的登記表（type → { build(b, item, detail), footprint(item), height(item), bounds?(item) }）
 * - siteToWorld(x, z)：本地 → 世界座標（地段固定，人物的位置用）
 * - exterior(b, cfg, detail, look)：外觀（門面要留空讓人走進去），回傳建築產生器的結果（groundHeight、ridgeHeight…）
 * - extraObstacles(cfg, look)：本地座標的額外障礙物（例如騎樓柱），可省略
 * - buildExtras(b, cfg, variant)：按需載入的室內多放的東西（板凳、吊燈），可省略
 *
 * 外殼只用街景裡已經有的材質（流暢畫質的批次數不變）；室內擺設按需載入，不投射也不接收陰影。
 */

/** 本地座標的矩形 */
export const rect = (x0, x1, z0, z1) => ({ minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) })

/** 器物的障礙物（本地座標）；block: false 或疊在上面的器物不擋路 */
export function itemFootprint(furniture, item) {
  if (item.block === false) return null
  return furniture[item.type].footprint(item)
}

/** 器物的鏡頭遮擋外框（疊放的器物也要擋鏡頭） */
export function itemBounds(furniture, item) {
  const kind = furniture[item.type]
  return kind.bounds ? kind.bounds(item) : kind.footprint(item)
}

/**
 * 靠牆的障礙物延伸到牆裡：擺設和牆之間如果只留一條比人窄的縫，推擠會在牆與擺設之間來回抵消，
 * 人物可能卡在縫裡（tests/linHuaTai.test.js 的死角檢查）。離側牆、後牆或隔間牆（門以外）不到 0.7 公尺的就補滿。
 */
const SNAP = 0.7
export function snapToWalls(r, room, partition) {
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
export function subtractRect(r, a) {
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

/** 本地座標的矩形 → 世界座標（transform 是地段的本地 → 世界） */
const rectOf = (transform, x0, x1, z0, z1, extra = {}) => {
  const p = transform(x0, z0)
  const q = transform(x1, z1)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
}

export function createShopInterior(spec) {
  const { id, shell: S, variantOf, lookOf, furniture, siteToWorld } = spec

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
    // 前店的後牆是木壁板與木框玻璃窗（partitionWindows）
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

  /** 店門口兩側：門板（frontPanels 'boards'）、捲門（'shutter'）或櫥窗的木框下牆（'open'）；中央是可以走進去的門 */
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

  /** 店內擺設的鏡頭遮擋（擺設在室內按需載入，遮擋一直都在） */
  function furnitureBlockers(b, variant) {
    const start = b.blockers.length
    for (const item of variant.items) {
      const fp = itemBounds(furniture, item)
      b.addBlocker(fp.minX, fp.maxX, 0, furniture[item.type].height(item), fp.minZ, fp.maxZ)
    }
    return [{ start, end: b.blockers.length }]
  }

  /**
   * 本地座標的障礙物（器物、站著或坐著的人物）：靠牆的延伸到牆裡，再切成互不重疊的矩形
   * （範圍的聯集不變；街景的障礙物彼此不重疊，見 tests/modern.test.js）
   */
  function obstacles(variant) {
    const list = variant.items.map((item) => itemFootprint(furniture, item)).filter(Boolean)
    for (const npc of variant.npcs) list.push({ minX: npc.x - 0.25, maxX: npc.x + 0.25, minZ: npc.z - 0.25, maxZ: npc.z + 0.25 })
    const result = []
    for (const r of list.map((r) => snapToWalls(r, S.room, variant.partition))) {
      let pieces = [r]
      for (const placed of result) pieces = pieces.flatMap((piece) => subtractRect(piece, placed))
      result.push(...pieces)
    }
    return result
  }

  /** 碰撞：簷下步道、店門口、前店、隔間門與店後（都標 inBuilding：換年代時人物移到戶外） */
  function collision(config, transform) {
    const variant = variantOf(config)
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
    const local = obstacles(variant)
    if (spec.extraObstacles) local.push(...spec.extraObstacles(config, lookOf(config)))
    return { walkable, obstacles: local.map((r) => rectOf(transform, r.minX, r.maxX, r.minZ, r.maxZ)) }
  }

  /** 街景裡的部分：外觀、室內外殼、門面、鏡頭遮擋、室內範圍、觀賞範圍與人物 */
  function build(b, cfg = {}, detail = null) {
    const variant = variantOf(cfg)
    const look = lookOf(cfg)
    const result = spec.exterior(b, cfg, detail, look) ?? {}
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
          id,
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
        const p = siteToWorld(npc.x, npc.z)
        return {
          id: npc.id,
          zone: id,
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

  /** 室內擺設（按需載入）：器物清單，再加上店家自己的板凳、吊燈等 */
  function buildInterior(b, cfg = {}, detail = b) {
    const variant = variantOf(cfg)
    if (!variant) return
    for (const item of variant.items) furniture[item.type].build(b, item, detail)
    spec.buildExtras?.(b, cfg, variant)
  }

  return { variantOf, obstacles, collision, build, buildInterior }
}
