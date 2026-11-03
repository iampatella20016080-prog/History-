import { shade } from './props.js'

/**
 * 可以走進去的街屋室內：共用的做法（第 11 階段；林華泰茶行是第一個用的店家，之後的店家照同樣的方式接上）
 *
 * 一棟街屋分成：簷下步道 → 店門口（兩側門板、捲門或櫥窗下牆）→ 前店 → 隔間牆（中央留門）→ 店後的工作間。
 * 擺設用「器物清單」描述（type、位置、大小），同一份清單產生模型、碰撞的障礙物與鏡頭的遮擋方塊，不會對不上。
 * 店門口兩側（frontPanels）：'boards' 門板、'shutter' 捲門、'open' 櫥窗下牆、'none' 不畫（立面已經有牆與櫥窗）。
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
 * 二樓（可省略；有記名茶是第一個用的店家）：shell.floor2 = { y, ceiling, room, stair: { minX, maxX, bottomZ, topZ, landingZ? }, well? }
 * - landingZ：一樓樓梯頂端之後被平台蓋住、不能走的範圍到哪裡（預設到後牆；新芳春的樓梯在正廳，平台只有一小段）；
 * - well：天井（本地矩形，新芳春）：一樓天花、二樓樓板與二樓天花都在這裡開口，上面是天光；一樓可以走，二樓四周有欄杆；
 * - 店後靠牆的木樓梯從 bottomZ（地面）往 topZ 爬到二樓樓板（y），樓板在樓梯上方留樓梯井；
 * - 年代版本的 upstairs = { items, npcs }：二樓的器物清單與人物（人物在二樓，level 1）；
 * - 碰撞：樓梯是 levels [0, 1] 的斜面，二樓的可行走範圍與障礙物標 level 1；樓梯側面與樓梯井有欄杆（只能從兩端上下）；
 * - 室內範圍：一樓（不含樓梯）與二樓（含樓梯，id 加 -2f），兩個範圍共用同一份按需載入的室內。
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
  // 補到隔間牆的中線為止：前店與店後同一段牆前後都有擺設時，兩邊的障礙物不會互相重疊（重疊會被切成好幾塊，切縫會把人來回推）
  if (clearOfDoor && r.minZ > partition.z && r.minZ - partition.z < SNAP) out.minZ = partition.z
  if (clearOfDoor && r.maxZ < partition.z && partition.z - r.maxZ < SNAP) out.maxZ = partition.z
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

/** 二樓不用隔間牆（snapToWalls 的隔間牆放到很遠的地方） */
const NO_PARTITION = { z: -1e3, doorMinX: 0, doorMaxX: 0 }

export function createShopInterior(spec) {
  const { id, shell: S, variantOf, lookOf, furniture, siteToWorld } = spec
  const F = S.floor2 ?? null
  /** 樓梯（本地座標的矩形）：一樓天花與二樓樓板在這裡留樓梯井 */
  const stairRect = F ? rect(F.stair.minX, F.stair.maxX, F.stair.topZ, F.stair.bottomZ) : null
  const roomRect = (r) => rect(r.minX, r.maxX, r.minZ, r.maxZ)
  /** 天井（一樓天花、二樓樓板與天花的開口） */
  const wellRect = F?.well ? roomRect(F.well) : null
  /** 樓板與天花的開口：樓梯井與天井 */
  const holes = [stairRect, wellRect].filter(Boolean)
  const minusHoles = (r) => holes.reduce((pieces, hole) => pieces.flatMap((piece) => subtractRect(piece, hole)), [r])

  /** 室內外殼：地坪、內牆、天花、隔間牆（中央留門）與後牆的小窗 */
  function interiorShell(b, variant, look) {
    const { room, ceiling } = S
    const { partition } = variant
    const width = room.maxX - room.minX
    const depth = room.maxZ - room.minZ
    const midZ = (room.minZ + room.maxZ) / 2
    b.box(look.floor[0], [width, 0.05, depth], [0, 0.025, midZ], { tint: look.floor[1], grime: 0.1 })
    // 一樓天花（有二樓時在樓梯上方留樓梯井）
    const ceilingPieces = minusHoles(roomRect(room))
    for (const r of ceilingPieces) {
      const size = [r.maxX - r.minX, 0, r.maxZ - r.minZ]
      const at = [(r.minX + r.maxX) / 2, 0, (r.minZ + r.maxZ) / 2]
      if (look.ceiling === 'beams') b.box('wood', [size[0], 0.07, size[2]], [at[0], ceiling + 0.035, at[2]], { tint: '#584534' })
      else b.box('plaster', [size[0], 0.06, size[2]], [at[0], ceiling + 0.03, at[2]], { tint: shade(look.wall, 0.96) })
    }
    if (look.ceiling === 'beams') {
      for (let z = room.maxZ - 1.0; z > room.minZ; z -= 1.5) {
        // 樓梯井上方的梁截短（不擋到上樓的頭）
        // 樓梯井與天井上方的梁截短（不擋到上樓的頭、不橫過天光）
        for (const seg of minusHoles(rect(room.minX, room.maxX, z - 0.065, z + 0.065))) {
          if (seg.maxZ - seg.minZ < 0.12) continue
          b.box('wood', [seg.maxX - seg.minX, 0.13, 0.13], [(seg.minX + seg.maxX) / 2, ceiling - 0.065, z], { tint: '#49392b' })
        }
      }
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

  /**
   * 二樓的外殼（有 floor2 時）：樓板（留樓梯井）、內牆、臨街一排直長窗、天花；木樓梯（踏板、斜樑、扶手）與樓梯井的欄杆
   */
  function upperShell(b, look) {
    const { y, ceiling: c2, room: r2, stair } = F
    const width = r2.maxX - r2.minX
    const depth = r2.maxZ - r2.minZ
    const midZ = (r2.minZ + r2.maxZ) / 2
    const wall = look.wall2 ?? look.wall
    const floorTint = look.floor2 ?? '#7a5a3e'
    for (const r of minusHoles(roomRect(r2))) {
      b.box('planks', [r.maxX - r.minX, 0.08, r.maxZ - r.minZ], [(r.minX + r.maxX) / 2, y - 0.04, (r.minZ + r.maxZ) / 2], { tint: floorTint, grime: 0.12 })
    }
    for (const s of [-1, 1]) b.box('plaster', [0.04, c2, depth], [s * (r2.maxX + 0.02), y + c2 / 2, midZ], { tint: wall, grime: 0.2 })
    b.box('plaster', [width, c2, 0.04], [0, y + c2 / 2, r2.minZ - 0.02], { tint: shade(wall, 0.97), grime: 0.2 })
    b.box('plaster', [width, c2, 0.04], [0, y + c2 / 2, r2.maxZ + 0.02], { tint: shade(wall, 0.98), grime: 0.15 })
    // 臨街的一排直長窗（室內那一面）
    const n = look.windows2 ?? 5
    const pitch = (width - 0.6) / n
    for (let i = 0; i < n; i++) {
      const x = r2.minX + 0.3 + (i + 0.5) * pitch
      b.box('windowLit', [pitch - 0.22, 1.5, 0.04], [x, y + 1.45, r2.maxZ - 0.01], { tint: '#4a3d2a' })
      b.box('wood', [pitch - 0.14, 0.06, 0.08], [x, y + 0.67, r2.maxZ - 0.03], { tint: shade(look.wood, 0.75) })
      b.box('wood', [0.04, 1.5, 0.05], [x, y + 1.45, r2.maxZ - 0.03], { tint: shade(look.wood, 0.75) })
    }
    for (const r of wellRect ? subtractRect(roomRect(r2), wellRect) : [roomRect(r2)]) {
      b.box('plaster', [r.maxX - r.minX, 0.06, r.maxZ - r.minZ], [(r.minX + r.maxX) / 2, y + c2 + 0.03, (r.minZ + r.maxZ) / 2], { tint: look.ceiling2Tint ?? shade(wall, 0.95) })
    }
    if (wellRect) {
      // 天井：開口四周的樓板邊、二樓的欄杆（洗石子花瓶欄杆示意）與上面的天光（三面紅磚牆往上到天光）
      const w = wellRect
      const cx = (w.minX + w.maxX) / 2
      const cz = (w.minZ + w.maxZ) / 2
      const ww = w.maxX - w.minX
      const wd = w.maxZ - w.minZ
      const shaft = 1.6
      for (const sx of [w.minX, w.maxX]) b.box('brick', [0.06, shaft, wd], [sx, y + c2 + shaft / 2, cz], { tint: '#b8806a' })
      for (const sz of [w.minZ, w.maxZ]) b.box('brick', [ww, shaft, 0.06], [cx, y + c2 + shaft / 2, sz], { tint: '#b8806a' })
      b.box('windowLit', [ww, 0.04, wd], [cx, y + c2 + shaft, cz], { tint: '#e8f0f4' })
      const rail = look.wellRail ?? '#d8d2c4'
      for (const [x0, x1, z0, z1] of [[w.minX, w.maxX, w.minZ, w.minZ], [w.minX, w.maxX, w.maxZ, w.maxZ], [w.minX, w.minX, w.minZ, w.maxZ], [w.maxX, w.maxX, w.minZ, w.maxZ]]) {
        const len = Math.max(x1 - x0, z1 - z0)
        const alongX = x1 - x0 > z1 - z0
        b.box('stucco', [alongX ? len : 0.14, 0.1, alongX ? 0.14 : len], [(x0 + x1) / 2, y + 0.92, (z0 + z1) / 2], { tint: rail })
        b.box('stucco', [alongX ? len : 0.16, 0.08, alongX ? 0.16 : len], [(x0 + x1) / 2, y + 0.04, (z0 + z1) / 2], { tint: shade(rail, 0.9) })
        const n = Math.round(len / 0.22)
        for (let i = 1; i < n; i++) {
          const t = i / n
          b.box('stucco', [0.07, 0.8, 0.07], [x0 + (x1 - x0) * t, y + 0.48, z0 + (z1 - z0) * t], { tint: rail })
        }
      }
    }

    // 木樓梯：從 bottomZ（地面）往 topZ 爬到樓板
    const steps = 16
    const run = (stair.bottomZ - stair.topZ) / steps
    const rise = y / steps
    const sw = stair.maxX - stair.minX
    const sx = (stair.minX + stair.maxX) / 2
    const wood = look.stairWood ?? '#6e4f36'
    for (let i = 0; i < steps; i++) {
      const z = stair.bottomZ - (i + 0.5) * run
      b.box('wood', [sw, 0.05, run + 0.03], [sx, (i + 1) * rise - 0.025, z], { tint: shade(wood, 1.05) })
      b.box('wood', [sw, rise, 0.025], [sx, (i + 0.5) * rise, z + run / 2], { tint: shade(wood, 0.8) })
    }
    const len = Math.hypot(stair.bottomZ - stair.topZ, y)
    const ang = Math.atan2(y, stair.bottomZ - stair.topZ)
    const midSZ = (stair.bottomZ + stair.topZ) / 2
    for (const x of [stair.minX + 0.04, stair.maxX - 0.04]) b.box('wood', [0.07, 0.22, len], [x, y / 2 - 0.1, midSZ], { rotation: [ang, 0, 0], tint: shade(wood, 0.7) })
    // 開放那一側的扶手與欄杆柱
    const railX = stair.minX - 0.03
    b.box('wood', [0.05, 0.05, len], [railX, y / 2 + 0.9, midSZ], { rotation: [ang, 0, 0], tint: shade(wood, 0.6) })
    for (let i = 0; i <= 4; i++) {
      const z = stair.bottomZ - 0.15 - (i * (stair.bottomZ - stair.topZ - 0.3)) / 4
      const h = ((stair.bottomZ - z) / (stair.bottomZ - stair.topZ)) * y
      b.box('wood', [0.05, 0.92, 0.05], [railX, h + 0.46, z], { tint: shade(wood, 0.6) })
    }
    // 二樓樓梯井的欄杆（開放的一側與樓梯口那一端）
    const rail = (x0, x1, z0, z1) => {
      b.box('wood', [Math.max(0.05, x1 - x0), 0.05, Math.max(0.05, z1 - z0)], [(x0 + x1) / 2, y + 0.92, (z0 + z1) / 2], { tint: shade(wood, 0.6) })
      b.box('wood', [Math.max(0.03, x1 - x0), 0.03, Math.max(0.03, z1 - z0)], [(x0 + x1) / 2, y + 0.45, (z0 + z1) / 2], { tint: shade(wood, 0.65) })
      const n = Math.max(2, Math.round(Math.max(x1 - x0, z1 - z0) / 0.6))
      for (let i = 0; i <= n; i++) b.box('wood', [0.05, 0.92, 0.05], [x0 + ((x1 - x0) * i) / n, y + 0.46, z0 + ((z1 - z0) * i) / n], { tint: shade(wood, 0.6) })
    }
    rail(stair.minX - 0.05, stair.minX - 0.05, stair.topZ, stair.bottomZ + 0.05)
    rail(stair.minX - 0.05, r2.maxX, stair.bottomZ + 0.05, stair.bottomZ + 0.05)
  }

  /** 店門口兩側：門板（frontPanels 'boards'）、捲門（'shutter'）或櫥窗的木框下牆（'open'）；中央是可以走進去的門 */
  function storefront(b, variant, look, openingH) {
    const { door } = variant
    // 'none'：立面本身已經有店門口兩側的牆與櫥窗（例如江山樓），不另外畫門板
    if (variant.frontPanels === 'none') return
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
    for (const item of variant.upstairs?.items ?? []) {
      const fp = itemBounds(furniture, item)
      b.addBlocker(fp.minX, fp.maxX, F.y, F.y + Math.min(furniture[item.type].height(item), F.ceiling - 0.05), fp.minZ, fp.maxZ)
    }
    return [{ start, end: b.blockers.length }]
  }

  /**
   * 本地座標的障礙物（器物、站著或坐著的人物）：靠牆的延伸到牆裡，再切成互不重疊的矩形
   * （範圍的聯集不變；街景的障礙物彼此不重疊，見 tests/modern.test.js）
   */
  function obstacles(variant) {
    const list = variant.items.map((item) => itemFootprint(furniture, item)).filter(Boolean)
    for (const npc of variant.npcs) if (!npc.level) list.push({ minX: npc.x - 0.25, maxX: npc.x + 0.25, minZ: npc.z - 0.25, maxZ: npc.z + 0.25 })
    if (F) {
      // 樓梯開放那一側的欄杆（最下面兩階以外）與樓梯上段底下：一樓只能從樓梯口走上樓梯
      const st = F.stair
      list.push(rect(st.minX - 0.1, st.minX, st.topZ, st.bottomZ - 0.5), rect(st.minX - 0.1, S.room.maxX, st.landingZ ?? S.room.minZ, st.topZ))
    }
    return disjoint(list.map((r) => snapToWalls(r, S.room, variant.partition)))
  }

  /** 二樓的障礙物（本地座標，level 1）：器物、人物與樓梯井的欄杆 */
  function upstairsObstacles(variant) {
    if (!F) return []
    const up = variant.upstairs ?? { items: [], npcs: [] }
    const st = F.stair
    const list = up.items.map((item) => itemFootprint(furniture, item)).filter(Boolean)
    for (const npc of up.npcs) list.push({ minX: npc.x - 0.25, maxX: npc.x + 0.25, minZ: npc.z - 0.25, maxZ: npc.z + 0.25 })
    const snapped = list.map((r) => snapToWalls(r, F.room, NO_PARTITION))
    // 欄杆不補到牆裡（樓梯口那一端要留給上下樓的人）
    snapped.push(rect(st.minX - 0.1, st.minX, st.topZ, st.bottomZ + 0.1), rect(st.minX, F.room.maxX + 0.3, st.bottomZ, st.bottomZ + 0.1))
    // 天井四周的欄杆（整個開口擋住）
    if (wellRect) snapped.push(rect(wellRect.minX - 0.1, wellRect.maxX + 0.1, wellRect.minZ - 0.1, wellRect.maxZ + 0.1))
    return disjoint(snapped).map((r) => ({ ...r, level: 1 }))
  }

  /** 切成互不重疊的矩形（聯集不變） */
  function disjoint(list) {
    const result = []
    for (const r of list) {
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
    const inB = (x0, x1, z0, z1, extra = {}) => rectOf(transform, x0, x1, z0, z1, { inBuilding: true, ...extra })
    const walkable = [
      inB(-half + 0.1, half - 0.1, -0.05, walkD + 0.35),
      inB(door.minX, door.maxX, room.maxZ, 0.05),
      inB(room.minX + 0.05, room.maxX - 0.05, partition.z + 0.1, room.maxZ + 0.02),
      inB(partition.doorMinX + 0.05, partition.doorMaxX - 0.05, partition.z - 0.1, partition.z + 0.12),
      inB(room.minX + 0.05, room.maxX - 0.05, room.minZ + 0.05, partition.z - 0.08),
    ]
    if (F) {
      // 樓梯（斜面，從一樓到二樓）與二樓（樓梯井以外）
      const st = F.stair
      const ramp = { axis: 'z', from: transform(0, st.bottomZ).z, to: transform(0, st.topZ).z, y0: 0, y1: F.y }
      walkable.push(inB(st.minX, st.maxX, st.topZ, st.bottomZ, { levels: [0, 1], ramp }))
      const inner = rect(F.room.minX + 0.05, F.room.maxX - 0.05, F.room.minZ + 0.05, F.room.maxZ - 0.05)
      for (const r of minusHoles(inner)) walkable.push(inB(r.minX, r.maxX, r.minZ, r.maxZ, { level: 1, floorY: F.y }))
    }
    const local = obstacles(variant)
    if (spec.extraObstacles) local.push(...spec.extraObstacles(config, lookOf(config)))
    const world = local.map((r) => rectOf(transform, r.minX, r.maxX, r.minZ, r.maxZ))
    for (const r of upstairsObstacles(variant)) world.push(rectOf(transform, r.minX, r.maxX, r.minZ, r.maxZ, { level: 1 }))
    return { walkable, obstacles: world }
  }

  /** 街景裡的部分：外觀、室內外殼、門面、鏡頭遮擋、室內範圍、觀賞範圍與人物 */
  function build(b, cfg = {}, detail = null) {
    const variant = variantOf(cfg)
    const look = lookOf(cfg)
    const result = spec.exterior(b, cfg, detail, look) ?? {}
    const openingH = Math.min(2.62, (result.groundHeight ?? S.groundH) - 0.6)
    interiorShell(b, variant, look)
    if (F) upperShell(b, look)
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
    if (F) {
      // 二樓：一樓天花到二樓樓板之間（留樓梯井）、二樓天花以上、臨街的樓上立面與騎樓頂
      for (const r of minusHoles(rect(-half, half, -depth, 0))) b.addBlocker(r.minX, r.maxX, ceiling, F.y, r.minZ, r.maxZ)
      b.addBlocker(-half, half, F.y + F.ceiling, ridge, -depth, 0)
      b.addBlocker(-half, half, F.y, ridge, F.room.maxZ + 0.02, 0)
      b.addBlocker(-half, half, groundH, ridge, 0, walkD)
    } else {
      b.addBlocker(-half, half, ceiling, ridge, -depth, 0)
    }

    const toWorld = (x, z) => {
      const p = b.transformPoint(x, 0, z)
      return { x: p.x, z: p.z }
    }
    const zone = (minX, maxX, minZ, maxZ) => {
      const p = toWorld(minX, minZ)
      const q = toWorld(maxX, maxZ)
      return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
    }

    const part = (r, extra) => ({ ...zone(r.minX, r.maxX, r.minZ, r.maxZ), ...extra })
    const upper = F
      ? [
          {
            id: `${id}-2f`,
            ...zone(F.room.minX, F.room.maxX, F.room.minZ, F.room.maxZ),
            // 樓梯屬於二樓的範圍（爬樓梯時鏡頭跟著往上）
            parts: [part(stairRect, { levels: [0, 1] }), part(F.room, { level: 1 })],
            ceiling: F.ceiling,
            camera: { distance: 2.8, maxHeight: F.y + F.ceiling - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.6 },
            viewerStart: { distance: 2.5 },
            loadRadius: 15,
            showRadius: 24,
          },
        ]
      : []
    const npcOf = (npc, i) => {
      const p = siteToWorld(npc.x, npc.z)
      return {
        id: npc.id,
        zone: npc.level ? `${id}-2f` : id,
        look: npc.look,
        pose: npc.pose,
        seatY: npc.seatY,
        ...(npc.level ? { level: npc.level } : {}),
        position: [p.x, npc.level ? F.y : 0, p.z],
        rotationY: b.worldRotationY(npc.rotationY),
        phase: (0.37 + i * 0.29) % 1,
      }
    }

    return {
      ...result,
      cameraOnly,
      interiors: [
        {
          id,
          ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
          ...(F ? { parts: subtractRect(roomRect(room), stairRect).map((r) => part(r, { level: 0 })) } : {}),
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
        ...upper,
      ],
      viewerRegions: [
        { ...zone(-half + 0.4, half - 0.4, 0.15, walkD - 0.1), maxY: 2.4, cameraMaxY: 3.0 },
        { ...zone(room.minX + 0.3, room.maxX - 0.3, room.minZ + 0.3, -0.15), maxY: 2.2, cameraMaxY: ceiling - 0.3 },
        ...(F ? [{ ...zone(F.room.minX + 0.3, F.room.maxX - 0.3, F.room.minZ + 0.3, F.room.maxZ - 0.15), minY: F.y + 0.8, maxY: F.y + 2.0, cameraMaxY: F.y + F.ceiling - 0.3 }] : []),
      ],
      followAreas: [
        zone(-half, half, room.minZ, walkD),
        zone(-half - 0.5, half + 0.5, walkD, walkD + 2.4),
        ...(F ? [{ ...zone(-half, half, room.minZ, 0), level: 1 }] : []),
      ],
      npcs: [...variant.npcs, ...(variant.upstairs?.npcs ?? [])].map(npcOf),
    }
  }

  /** 室內擺設（按需載入）：器物清單，再加上店家自己的板凳、吊燈等 */
  function buildInterior(b, cfg = {}, detail = b) {
    const variant = variantOf(cfg)
    if (!variant) return
    for (const item of variant.items) furniture[item.type].build(b, item, detail)
    if (F && variant.upstairs) {
      // 二樓的器物：整組抬到二樓樓板上
      b.push([0, F.y, 0])
      if (detail !== b) detail.push([0, F.y, 0])
      for (const item of variant.upstairs.items) furniture[item.type].build(b, item, detail)
      if (detail !== b) detail.pop()
      b.pop()
    }
    spec.buildExtras?.(b, cfg, variant)
  }

  return { variantOf, obstacles, upstairsObstacles, collision, build, buildInterior }
}
