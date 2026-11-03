import { shade } from './props.js'
import { rect, snapToWalls, subtractRect } from './shopInterior.js'

/**
 * 共用街屋室內（shopInterior.js）的二樓以上（第 11 階段；江山樓是第一個用的店家）。
 * shopInterior.js 處理一樓與二樓（level 1）；這裡再往上疊：每一層 { level, y, ceiling, room, stair, holes, open, hall, items, npcs }。
 * - stair：從下一層爬上來的樓梯（沿 z，bottomZ 在下一層、topZ 在這一層；landingZ：下一層被平台蓋住的範圍到哪裡）
 * - holes：這一層天花再開的口（往上一層的樓梯井）
 * - open：露天的樓頂（不畫牆與天花，沒有天花的遮擋）
 * - hall：只有一小塊可以走（例如四樓的樓梯間）；其他部分是實心的遮擋，不畫內部
 * 本地座標同 shopInterior.js；碰撞與鏡頭的寫法也相同（樓梯是 levels [L-1, L] 的斜面，兩端以外有欄杆）。
 */
const NO_PARTITION = { z: -1e3, doorMinX: 0, doorMaxX: 0 }
const minus = (r, holes) => holes.reduce((pieces, hole) => pieces.flatMap((piece) => subtractRect(piece, hole)), [r])
const stairRect = (st) => rect(st.minX, st.maxX, st.topZ, st.bottomZ)

function disjoint(list) {
  const result = []
  for (const r of list) {
    let pieces = [r]
    for (const placed of result) pieces = pieces.flatMap((piece) => subtractRect(piece, placed))
    result.push(...pieces)
  }
  return result
}

/**
 * floors：由下往上；base：二樓（shopInterior.js 的 floor2，{ y, ceiling }）。
 * 回傳 shell／collision／blockers／zones／npcs／buildInterior，給店家的建築產生器接上。
 */
export function createUpperFloors({ id, half, depth, floors, base, furniture, siteToWorld }) {
  const below = (i) => (i === 0 ? base : floors[i - 1])
  const walkRoom = (f) => f.hall ?? f.room
  /** 室內範圍的 id：三樓 -3f、四樓 -4f，露天的樓頂 -roof */
  const zoneId = (f) => `${id}-${f.open ? 'roof' : `${f.level + 1}f`}`

  /** 街景裡的外殼：樓板（留樓梯井）、牆面與窗、天花（留開口）、樓梯與欄杆 */
  function shell(b, look) {
    floors.forEach((f, i) => {
      const prev = below(i)
      const st = f.stair
      const sr = stairRect(st)
      const r = walkRoom(f)
      const wall = look.wall2 ?? look.wall
      const width = r.maxX - r.minX
      const depthR = r.maxZ - r.minZ
      const midZ = (r.minZ + r.maxZ) / 2
      const cx = (r.minX + r.maxX) / 2
      for (const p of minus(r, [sr])) b.box(f.open ? 'stone' : 'planks', [p.maxX - p.minX, 0.08, p.maxZ - p.minZ], [(p.minX + p.maxX) / 2, f.y - 0.04, (p.minZ + p.maxZ) / 2], { tint: f.open ? '#b9b0a0' : look.floor2 ?? '#6e4e36', grime: 0.12 })
      if (!f.open) {
        for (const s of [-1, 1]) b.box('plaster', [0.04, f.ceiling, depthR], [s < 0 ? r.minX - 0.02 : r.maxX + 0.02, f.y + f.ceiling / 2, midZ], { tint: wall, grime: 0.2 })
        // 前後牆：樓梯穿過的那一段不畫（四樓樓梯間的樓梯從牆的位置上下）
        const crossing = [st, ...floors.filter((g) => g.level === f.level + 1).map((g) => g.stair)]
        for (const z of [r.minZ - 0.02, r.maxZ + 0.02]) {
          const cuts = crossing.filter((c) => z > c.topZ - 0.05 && z < c.bottomZ + 0.05).map((c) => rect(c.minX, c.maxX, z - 0.1, z + 0.1))
          for (const seg of minus(rect(r.minX, r.maxX, z - 0.02, z + 0.02), cuts)) b.box('plaster', [seg.maxX - seg.minX, f.ceiling, 0.04], [(seg.minX + seg.maxX) / 2, f.y + f.ceiling / 2, z], { tint: shade(wall, 0.97), grime: 0.2 })
        }
        if (!f.hall) {
          // 臨街一排窗（室內那一面）
          const n = look.windows2 ?? 6
          const pitch = (width - 0.6) / n
          for (let k = 0; k < n; k++) {
            const x = r.minX + 0.3 + (k + 0.5) * pitch
            b.box('windowLit', [pitch - 0.24, 1.5, 0.04], [x, f.y + 1.45, r.maxZ - 0.01], { tint: '#4a3d2a' })
            b.box('wood', [0.04, 1.5, 0.05], [x, f.y + 1.45, r.maxZ - 0.03], { tint: shade(look.wood, 0.75) })
          }
        }
        for (const p of minus(r, (f.holes ?? []).map((h) => rect(h.minX, h.maxX, h.minZ, h.maxZ)))) {
          b.box('plaster', [p.maxX - p.minX, 0.06, p.maxZ - p.minZ], [(p.minX + p.maxX) / 2, f.y + f.ceiling + 0.03, (p.minZ + p.maxZ) / 2], { tint: shade(wall, 0.95) })
        }
      }
      // 樓梯（從下一層的地板爬到這一層）
      const rise = f.y - prev.y
      const steps = Math.max(12, Math.round(rise / 0.22))
      const run = (st.bottomZ - st.topZ) / steps
      const sw = st.maxX - st.minX
      const sx = (st.minX + st.maxX) / 2
      const wood = look.stairWood ?? '#6e4f36'
      for (let k = 0; k < steps; k++) {
        const z = st.bottomZ - (k + 0.5) * run
        b.box('wood', [sw, 0.05, run + 0.03], [sx, prev.y + ((k + 1) * rise) / steps - 0.025, z], { tint: shade(wood, 1.05) })
        b.box('wood', [sw, rise / steps, 0.025], [sx, prev.y + ((k + 0.5) * rise) / steps, z + run / 2], { tint: shade(wood, 0.8) })
      }
      const len = Math.hypot(st.bottomZ - st.topZ, rise)
      const ang = Math.atan2(rise, st.bottomZ - st.topZ)
      const midSZ = (st.bottomZ + st.topZ) / 2
      b.box('wood', [0.05, 0.05, len], [st.minX - 0.03, prev.y + rise / 2 + 0.9, midSZ], { rotation: [ang, 0, 0], tint: shade(wood, 0.6) })
      for (const x of [st.minX + 0.04, st.maxX - 0.04]) b.box('wood', [0.07, 0.22, len], [x, prev.y + rise / 2 - 0.1, midSZ], { rotation: [ang, 0, 0], tint: shade(wood, 0.7) })
      // 這一層樓梯井的欄杆
      const railY = f.y + 0.92
      b.box('wood', [0.05, 0.05, st.bottomZ - st.topZ], [st.minX - 0.05, railY, midSZ], { tint: shade(wood, 0.6) })
      b.box('wood', [r.maxX - st.minX, 0.05, 0.05], [(st.minX + r.maxX) / 2, railY, st.bottomZ + 0.05], { tint: shade(wood, 0.6) })
      for (let k = 0; k <= 5; k++) b.box('wood', [0.05, 0.92, 0.05], [st.minX - 0.05, f.y + 0.46, st.bottomZ - (k * (st.bottomZ - st.topZ)) / 5], { tint: shade(wood, 0.6) })
    })
  }

  /** 碰撞：每層的樓梯斜面、地板（留樓梯井）、欄杆、器物與人物 */
  function collision(variant, transform, inB) {
    const walkable = []
    const obstacles = []
    floors.forEach((f, i) => {
      const L = f.level
      const st = f.stair
      const sr = stairRect(st)
      const prev = below(i)
      const ramp = { axis: 'z', from: transform(0, st.bottomZ).z, to: transform(0, st.topZ).z, y0: prev.y, y1: f.y }
      walkable.push(inB(st.minX, st.maxX, st.topZ, st.bottomZ, { levels: [L - 1, L], ramp }))
      const r = walkRoom(f)
      const inner = rect(r.minX + 0.05, r.maxX - 0.05, r.minZ + 0.05, r.maxZ - 0.05)
      for (const p of minus(inner, [sr])) walkable.push(inB(p.minX, p.maxX, p.minZ, p.maxZ, { level: L, floorY: f.y }))
      // 下一層：樓梯側面的欄杆與平台下方
      const lowerRoom = i === 0 ? base.room : walkRoom(floors[i - 1])
      for (const o of [rect(st.minX - 0.1, st.minX, st.topZ, st.bottomZ - 0.5), rect(st.minX - 0.1, lowerRoom.maxX, st.landingZ ?? lowerRoom.minZ, st.topZ)]) obstacles.push({ ...o, level: L - 1 })
      // 這一層：器物、人物與樓梯井的欄杆
      const up = variant.floors?.[L] ?? { items: [], npcs: [] }
      const list = up.items.map((item) => (item.block === false ? null : furniture[item.type].footprint(item))).filter(Boolean)
      for (const npc of up.npcs) list.push(rect(npc.x - 0.25, npc.x + 0.25, npc.z - 0.25, npc.z + 0.25))
      const snapped = f.open ? list : list.map((o) => snapToWalls(o, r, NO_PARTITION))
      snapped.push(rect(st.minX - 0.1, st.minX, st.topZ, st.bottomZ + 0.1), rect(st.minX, r.maxX + 0.3, st.bottomZ, st.bottomZ + 0.1))
      for (const o of disjoint(snapped)) obstacles.push({ ...o, level: L })
    })
    return { walkable, obstacles }
  }

  /** 鏡頭遮擋：層與層之間的樓板（留樓梯井）、四樓樓梯間以外的實心部分 */
  function blockers(b) {
    floors.forEach((f, i) => {
      const prev = below(i)
      const top = prev.y + prev.ceiling
      for (const p of minus(rect(-half, half, -depth, 0), [stairRect(f.stair)])) b.addBlocker(p.minX, p.maxX, top, f.y, p.minZ, p.maxZ)
      if (f.hall && !f.open) {
        const holes = [f.hall, ...(f.holes ?? []), stairRect(f.stair)].map((h) => rect(h.minX, h.maxX, h.minZ, h.maxZ))
        for (const p of minus(rect(-half, half, -depth, 0), holes)) b.addBlocker(p.minX, p.maxX, f.y, f.y + f.ceiling, p.minZ, p.maxZ)
      }
    })
  }

  /** 室內範圍、觀賞範圍、貼近範圍與人物（世界座標；zone(minX, maxX, minZ, maxZ) 由建築產生器提供） */
  function zones(b, variant, zone) {
    const part = (r, extra) => ({ ...zone(r.minX, r.maxX, r.minZ, r.maxZ), ...extra })
    const interiors = floors.map((f) => {
      const r = walkRoom(f)
      return {
        id: zoneId(f),
        ...zone(r.minX, r.maxX, r.minZ, r.maxZ),
        parts: [part(stairRect(f.stair), { levels: [f.level - 1, f.level] }), part(r, { level: f.level })],
        ceiling: f.open ? 6 : f.ceiling,
        camera: { distance: 2.8, maxHeight: f.y + (f.open ? 6 : f.ceiling - 0.4), minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.6 },
        viewerStart: { distance: 2.5 },
        loadRadius: 18,
        showRadius: 28,
      }
    })
    const viewerRegions = floors.map((f) => {
      const r = walkRoom(f)
      return { ...zone(r.minX + 0.3, r.maxX - 0.3, r.minZ + 0.3, r.maxZ - 0.15), minY: f.y + 0.8, maxY: f.y + 2.0, cameraMaxY: f.y + (f.open ? 5 : f.ceiling - 0.3) }
    })
    const followAreas = floors.filter((f) => !f.open).map((f) => ({ ...zone(-half, half, -depth, 0), level: f.level }))
    let n = 0
    const npcs = floors.flatMap((f) =>
      (variant.floors?.[f.level]?.npcs ?? []).map((npc) => {
        const p = siteToWorld(npc.x, npc.z)
        return {
          id: npc.id,
          zone: zoneId(f),
          look: npc.look,
          pose: npc.pose,
          seatY: npc.seatY,
          level: f.level,
          position: [p.x, f.y, p.z],
          rotationY: b.worldRotationY(npc.rotationY),
          phase: (0.53 + n++ * 0.31) % 1,
        }
      }),
    )
    return { interiors, viewerRegions, followAreas, npcs }
  }

  /** 按需載入的器物（各層抬到樓板上） */
  function buildInterior(b, variant, detail) {
    for (const f of floors) {
      b.push([0, f.y, 0])
      if (detail !== b) detail.push([0, f.y, 0])
      for (const item of variant.floors?.[f.level]?.items ?? []) furniture[item.type].build(b, item, detail)
      if (detail !== b) detail.pop()
      b.pop()
    }
  }

  /** 器物的鏡頭遮擋（各層；只給鏡頭用） */
  function itemBlockers(b, variant) {
    for (const f of floors) {
      for (const item of variant.floors?.[f.level]?.items ?? []) {
        const kind = furniture[item.type]
        const fp = kind.bounds ? kind.bounds(item) : kind.footprint(item)
        const h = kind.height(item)
        if (h > 0) b.addBlocker(fp.minX, fp.maxX, f.y, f.y + Math.min(h, (f.ceiling ?? 3) - 0.05), fp.minZ, fp.maxZ)
      }
    }
  }

  return { shell, collision, blockers, zones, buildInterior, itemBlockers }
}
