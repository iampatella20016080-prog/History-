import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { EARLY, MODERN, POSTWAR, SHIZIXUAN_ID, SZX_HOTSPOTS, WIDE_SITE, szxToWorld } from '../src/data/shizixuanLayout.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildShizixuanExterior } from '../src/game/builders/shizixuan/shizixuanExterior.js'
import { buildShizixuanInterior } from '../src/game/builders/shizixuan/shizixuanInterior.js'
import { PARTY_INSET } from '../src/game/builders/shizixuan/shizixuanShell.js'
import { groundAt, resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 十字軒的建築殼體檢查（三個年代）：
 * - shellParts 完整（四面牆、地板、樓板、屋頂），正面牆＋開口剛好覆蓋整個立面
 * - 封閉殼體：從側面、背面、上方、斜角射向建築的射線都先打到殼體；樓上窗戶後面 0.6 m 內有背板（不是空洞）
 * - 沒有共面重疊的面（方塊的同向表面距離 < 2 mm、重疊 > 1 cm²），外觀與室內都檢查
 * - 屋頂不超出自己的地段、側牆不和鄰棟共面
 * - 2000 的頂點預算、從入口走得到每一個熱點
 */
const VARIANTS = {
  earlyShop: { L: EARLY, floors: 2, eave: 4.8 },
  postwarShop: { L: POSTWAR, floors: 2, eave: 6.4 },
  modernShop: { L: MODERN, floors: 3, eave: 10.0 },
}
const TRANSPARENT = new Set(['glass', 'glassClear', 'glassWarm', 'windowLit'])

function build(variant) {
  const b = new PartBuilder()
  const detail = new PartBuilder()
  const result = buildShizixuanExterior(b, { variant }, detail)
  const bi = new PartBuilder()
  const di = new PartBuilder()
  buildShizixuanInterior(bi, { variant }, di)
  return { b, detail, result, bi, di }
}
const BUILT = Object.fromEntries(Object.keys(VARIANTS).map((v) => [v, build(v)]))

function meshes(builder, { opaqueOnly = true } = {}) {
  const list = []
  for (const [material, geometries] of builder.groups) {
    if (opaqueOnly && TRANSPARENT.has(material)) continue
    for (const g of geometries) list.push(new Mesh(g, new MeshBasicMaterial({ side: 2 })))
  }
  return list
}

function firstHit(list, origin, direction) {
  const ray = new Raycaster(new Vector3(...origin), new Vector3(...direction).normalize(), 0, 100)
  const hits = ray.intersectObjects(list, false)
  return hits[0] ?? null
}

/** 軸對齊的方塊（PartBuilder.box 沒有旋轉時）：36 個頂點都落在外框的角上 */
function axisBoxes(builder) {
  const boxes = []
  for (const [material, geometries] of builder.groups) {
    for (const g of geometries) {
      const pos = g.attributes.position
      if (pos.count !== 36) continue
      g.computeBoundingBox()
      const { min, max } = g.boundingBox
      let aligned = true
      for (let i = 0; i < pos.count && aligned; i++) {
        for (const [axis, v] of [
          ['x', pos.getX(i)],
          ['y', pos.getY(i)],
          ['z', pos.getZ(i)],
        ]) {
          if (Math.abs(v - min[axis]) > 1e-5 && Math.abs(v - max[axis]) > 1e-5) aligned = false
        }
      }
      if (aligned) boxes.push({ material, min: min.clone(), max: max.clone() })
    }
  }
  return boxes
}

/** 同向、共面而且重疊的表面（距離 < 2 mm、重疊面積 > 1 cm²）：依平面位置排序後只比較相鄰的面 */
function coplanarFaces(boxes) {
  const OTHER = { x: ['y', 'z'], y: ['x', 'z'], z: ['x', 'y'] }
  const found = []
  for (const axis of ['x', 'y', 'z']) {
    const [u, v] = OTHER[axis]
    for (const side of ['min', 'max']) {
      const faces = boxes.map((box) => ({ box, at: box[side][axis] })).sort((a, c) => a.at - c.at)
      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length && faces[j].at - faces[i].at < 0.002; j++) {
          const a = faces[i].box
          const c = faces[j].box
          const du = Math.min(a.max[u], c.max[u]) - Math.max(a.min[u], c.min[u])
          const dv = Math.min(a.max[v], c.max[v]) - Math.max(a.min[v], c.min[v])
          if (du > 0.001 && dv > 0.001 && du * dv > 1e-4) found.push({ axis, side, at: faces[i].at.toFixed(3), area: (du * dv).toFixed(4), a: a.material, b: c.material, ar: [a.min.toArray().map((n) => +n.toFixed(2)), a.max.toArray().map((n) => +n.toFixed(2))], br: [c.min.toArray().map((n) => +n.toFixed(2)), c.max.toArray().map((n) => +n.toFixed(2))] })
        }
      }
    }
  }
  return found
}

const count = (builder) => [...builder.groups.values()].flat().reduce((sum, g) => sum + g.attributes.position.count, 0)

describe('十字軒的建築殼體：零件完整', () => {
  for (const [variant, { L, floors }] of Object.entries(VARIANTS)) {
    test(`${variant}：四面牆、地板、每一層樓板與屋頂都存在`, () => {
      const parts = BUILT[variant].result.shellParts
      for (const key of ['front', 'back', 'left', 'right', 'floor', 'roof']) assert.ok(parts[key].length > 0, `${variant} 缺 ${key}`)
      const slabs = parts.slabs.filter((s) => s.minZ < -1)
      assert.equal(slabs.length, floors - 1, `${variant} 樓板`)
      if (variant === 'earlyShop') assert.equal(parts.gables.length, 2, '1930 兩側的山牆')
      // 側牆從後牆到立面，高度到屋簷或女兒牆
      for (const side of ['left', 'right']) {
        const w = parts[side][0]
        assert.ok(w.maxZ - w.minZ >= L.depth - 1e-6, `${variant} ${side} 進深`)
        assert.ok(w.maxY >= VARIANTS[variant].eave - 1e-6, `${variant} ${side} 高度 ${w.maxY}`)
      }
    })

    test(`${variant}：正面牆加上開口剛好覆蓋整個立面（沒有缺牆）`, () => {
      const parts = BUILT[variant].result.shellParts
      const planes = new Map()
      for (const r of [...parts.front, ...parts.openings.filter((o) => o.key === 'front')]) {
        const key = r.minZ.toFixed(3)
        if (!planes.has(key)) planes.set(key, { area: 0, minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })
        const p = planes.get(key)
        p.area += (r.maxX - r.minX) * (r.maxY - r.minY)
        p.minX = Math.min(p.minX, r.minX)
        p.maxX = Math.max(p.maxX, r.maxX)
        p.minY = Math.min(p.minY, r.minY)
        p.maxY = Math.max(p.maxY, r.maxY)
      }
      for (const [z, p] of planes) {
        const full = (p.maxX - p.minX) * (p.maxY - p.minY)
        assert.ok(Math.abs(p.area - full) < 1e-3, `${variant} z=${z}：${p.area.toFixed(3)} / ${full.toFixed(3)} m²`)
        // 立面從一道側牆的內側到另一道
        assert.ok(Math.abs(p.maxX - (L.half - PARTY_INSET - L.wallT)) < 1e-6 && Math.abs(p.minX + (L.half - PARTY_INSET - L.wallT)) < 1e-6, `${variant} z=${z} 寬度`)
      }
    })
  }
})

describe('十字軒的建築殼體：封閉（射線）', () => {
  for (const [variant, { L }] of Object.entries(VARIANTS)) {
    test(`${variant}：側面、背面與上方射向建築的射線都先打到殼體`, () => {
      const { b, result } = BUILT[variant]
      const list = meshes(b)
      const outer = L.half - PARTY_INSET
      const parts = result.shellParts
      const frontMax = Math.max(...parts.left.map((w) => w.maxZ))
      const eave = VARIANTS[variant].eave
      const misses = []
      // 側面：在山牆或屋簷以下的每一點都要打在側牆外側 0.3 m 內
      for (const s of [-1, 1]) {
        for (let z = -L.depth + 0.25; z < frontMax - 0.1; z += 0.5) {
          for (let y = 0.2; y < eave - 0.1; y += 0.4) {
            const hit = firstHit(list, [s * (L.half + 2), y, z], [-s, 0, 0])
            if (!hit || Math.abs(hit.point.x) < outer - 0.3) misses.push(`側 ${s} (${y.toFixed(1)}, ${z.toFixed(1)})`)
          }
        }
      }
      // 背面
      for (let x = -outer + 0.25; x < outer - 0.1; x += 0.5) {
        for (let y = 0.2; y < eave - 0.1; y += 0.4) {
          const hit = firstHit(list, [x, y, -L.depth - 2], [0, 0, 1])
          if (!hit || hit.point.z > -L.depth + 0.4) misses.push(`後 (${x.toFixed(1)}, ${y.toFixed(1)})`)
        }
      }
      // 上方：打在屋頂、山牆或女兒牆上（不會掉進建築裡）
      const roofLow = variant === 'earlyShop' ? eave - 0.3 : Math.min(...parts.roof.map((r) => r.maxY)) - 0.05
      for (let x = -outer + 0.2; x < outer - 0.1; x += 0.5) {
        for (let z = -L.depth + 0.2; z < 0; z += 0.5) {
          const hit = firstHit(list, [x, 30, z], [0, -1, 0])
          if (!hit || hit.point.y < roofLow) misses.push(`上 (${x.toFixed(1)}, ${z.toFixed(1)}) → ${hit?.point.y.toFixed(2)}`)
        }
      }
      // 45° 高角度（四個斜角方向，對準屋頂與牆頂）：在穿過建築中心以前打到殼體
      for (const [dx, dz] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        for (let k = -2; k <= 2; k++) {
          // 對準屋頂面（平屋頂）或屋簷下方（斜屋頂）
          const roofTop = Math.max(...parts.roof.map((r) => r.maxY))
          const target = [k * outer * 0.35, Math.min(eave - 0.6, roofTop), -L.depth / 2 + k * 0.8]
          const dir = [-dx, -1, -dz]
          const origin = target.map((v, i) => v - dir[i] * 12)
          const hit = firstHit(list, origin, dir)
          const travelled = hit ? hit.distance : Infinity
          if (travelled > Math.hypot(12, 12, 12) + 0.5) misses.push(`斜 (${dx}, ${dz}) #${k}`)
        }
      }
      assert.equal(misses.length, 0, `${variant}：${misses.length} 處漏光：${misses.slice(0, 6).join('、')}`)
    })

    test(`${variant}：樓上的窗戶後面 0.6 m 內是暗色背板或牆（不是空洞，也不是漂浮的窗框）`, () => {
      const { b, result } = BUILT[variant]
      const list = meshes(b)
      const parts = result.shellParts
      const upper = parts.openings.filter((o) => o.key === 'front' && o.minY > 2.95)
      assert.ok(upper.length > 0, `${variant} 樓上有窗`)
      for (const o of upper) {
        const hit = firstHit(list, [(o.minX + o.maxX) / 2 + 0.05, (o.minY + o.maxY) / 2 + 0.05, o.maxZ + 3], [0, 0, -1])
        assert.ok(hit && hit.point.z > o.minZ - 0.6, `${variant} 窗 (${o.minX.toFixed(2)}, ${o.minY.toFixed(2)})：${hit ? hit.point.z.toFixed(2) : '沒有打到'}`)
      }
    })
  }
})

describe('十字軒：沒有共面重疊（Z-fighting）', () => {
  for (const variant of Object.keys(VARIANTS)) {
    test(`${variant}：外觀（主網格＋細部）`, () => {
      const { b, detail } = BUILT[variant]
      const found = coplanarFaces([...axisBoxes(b), ...axisBoxes(detail)])
      assert.equal(found.length, 0, `${variant}：${found.length} 處：${JSON.stringify(found.slice(0, 4))}`)
    })
    test(`${variant}：室內（主網格＋細部）`, () => {
      const { bi, di } = BUILT[variant]
      const found = coplanarFaces([...axisBoxes(bi), ...axisBoxes(di)])
      assert.equal(found.length, 0, `${variant}：${found.length} 處：${JSON.stringify(found.slice(0, 4))}`)
    })
  }
})

describe('十字軒：不穿進鄰棟', () => {
  for (const [variant, { L }] of Object.entries(VARIANTS)) {
    test(`${variant}：屋頂在自己的地段內（屋簷只往前後伸出 ≤ 0.6 m），側牆不和鄰棟的山牆共面`, () => {
      const parts = BUILT[variant].result.shellParts
      for (const r of [...parts.roof, ...parts.gables]) {
        assert.ok(r.minX >= -L.half + 0.005 - 1e-6 && r.maxX <= L.half - 0.005 + 1e-6, `${variant} 屋頂 x ${r.minX.toFixed(3)}–${r.maxX.toFixed(3)}`)
        assert.ok(r.minZ >= -L.depth - 0.6 && r.maxZ <= (L.arcade ?? 1.7) + 0.6, `${variant} 屋頂 z ${r.minZ.toFixed(2)}–${r.maxZ.toFixed(2)}`)
      }
      for (const w of [...parts.left, ...parts.right]) assert.ok(Math.max(Math.abs(w.minX), Math.abs(w.maxX)) <= L.half - 0.005, `${variant} 側牆外側 ${w.minX}–${w.maxX}`)
    })
  }

  test('三個年代：外觀的所有零件都在地段的寬度內（不伸進隔壁）', () => {
    for (const [variant, { L }] of Object.entries(VARIANTS)) {
      for (const g of [...BUILT[variant].b.groups.values()].flat()) {
        g.computeBoundingBox()
        assert.ok(g.boundingBox.min.x >= -L.half - 1e-6 && g.boundingBox.max.x <= L.half + 1e-6, `${variant}：x ${g.boundingBox.min.x.toFixed(3)}–${g.boundingBox.max.x.toFixed(3)}`)
      }
    }
  })
})

describe('十字軒 2000：效能與行走', () => {
  test('頂點預算：室內主網格 ≤ 130k、細部 ≤ 130k；外觀 ≤ 60k', () => {
    const { b, bi, di } = BUILT.modernShop
    assert.ok(count(bi) <= 130000, `室內 ${count(bi)}`)
    assert.ok(count(di) <= 130000, `室內細部 ${count(di)}`)
    assert.ok(count(b) <= 60000, `外觀 ${count(b)}`)
  })

  test('從入口走得到每一個熱點（每步 0.15、0.05 m），再走回騎樓', () => {
    const world = buildEraWorldSync('revival')
    const toWorld = (x, z) => szxToWorld(WIDE_SITE, x, z)
    const step = (p, x, z) => {
      p.x = x
      p.z = z
      resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
      groundAt(p, world.collision, 0, 0)
    }
    const walk = (p, target, size) => {
      for (let n = 0; n < 3000; n++) {
        const dx = target.x - p.x
        const dz = target.z - p.z
        const d = Math.hypot(dx, dz)
        if (d < size) return 0
        step(p, p.x + (dx / d) * size, p.z + (dz / d) * size)
      }
      return Math.hypot(target.x - p.x, target.z - p.z)
    }
    // 走道：入口 → 中央島右側 → 後段 → 熱點
    const aisle = [
      [1.8, 0.8],
      [1.8, -0.6],
      [2.6, -2.0],
      [2.6, -6.0],
      [-1.0, -6.0],
    ]
    for (const size of [0.15, 0.05]) {
      for (const h of SZX_HOTSPOTS.modernShop.filter((item) => item.id !== 'szx-front')) {
        const p = { ...toWorld(1.8, 1.5), level: 0, y: 0 }
        const route = h.point[0] < 2.2 && h.point[1] < -6 ? [...aisle.slice(0, 4), [h.point[0], -6.0]] : h.point[1] < -5 ? aisle : aisle.slice(0, 4)
        for (const [x, z] of [...route, h.point]) {
          const miss = walk(p, toWorld(x, z), size)
          assert.ok(miss < size + 0.05, `${h.id}：卡在 (${x}, ${z}) 前 ${miss.toFixed(2)} m`)
        }
        for (const [x, z] of [...route].reverse()) assert.ok(walk(p, toWorld(x, z), size) < size + 0.05, `${h.id}：回程卡在 (${x}, ${z})`)
      }
    }
    assert.equal(world.interiors.find((item) => item.id === SHIZIXUAN_ID)?.ceiling, MODERN.ceiling)
  })
})
