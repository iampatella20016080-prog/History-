/**
 * 共面（Z-fighting）處理：合併網格之前，找出「不同零件、同一個朝向、同一個平面、互相重疊」的面。
 *
 * 兩個面落在同一個深度時，GPU 每個像素只能任意挑一個畫，角色或鏡頭一動就會快速閃爍（Z-fighting）。
 * - 完全重複的方塊（同一個朝向、六個面都相同）：移除較早加入的那一個（重複的幾何直接刪掉一層）。
 * - 其他重疊：其中一個零件在這一側「往外長」DELTA（移動它最外側平面上的頂點），讓它確實在前面：
 *   - 兩個方塊：面較小的那一個（飾條、窗框、地面上的鋪面、招牌底板…）往外長；
 *   - 其他形狀（擠出的牆、窗框、柱頭、平面貼片…）：這個平面要是該零件在法線方向上最外側的面才能長；
 *     兩個都可以時較小的那一個長，都不行就不動（交給各自的產生器處理）。
 *   只會往外長、不會往內縮，所以不會在相鄰建築之間出現縫隙；位移只有幾公釐，看不出差別。
 * - fixed：已經產生、不能再改的零件（例如室內產生時，同一棟建築的外殼）；和它們共面時一律由可以修改的那一個長。
 * - 反覆執行（只重新檢查上一輪移動過的零件）：同一面牆上有兩個以上互相重疊的飾件時，第一輪它們都長到同一個位置，
 *   下一輪再把較小的那一個推到更外面。
 * 太小的三角形（圓形物件的細分）不比較：它們不會形成大面積的閃爍。
 */
export const COPLANAR_DELTA = 0.005
const PLANE_TOLERANCE = 0.0015
const MIN_OVERLAP = 1e-5
const MIN_TRIANGLE = 1e-4
const MIN_BOX_TRIANGLE = 1e-5
const Q = 500 // 法線量化

/** 方塊（任何朝向）：36 個頂點、三組互相垂直的面法線；回傳三個軸與沿著三個軸的範圍 */
function orientedBox(g) {
  const pos = g.attributes.position
  if (pos.count !== 36) return null
  const nrm = g.attributes.normal
  if (!nrm) return null
  const axes = []
  for (let i = 0; i < nrm.count; i += 6) {
    let x = nrm.getX(i)
    let y = nrm.getY(i)
    let z = nrm.getZ(i)
    const lead = Math.abs(x) > 1e-4 ? x : Math.abs(y) > 1e-4 ? y : z
    if (lead < 0) {
      x = -x
      y = -y
      z = -z
    }
    if (!axes.some((a) => Math.abs(a[0] * x + a[1] * y + a[2] * z) > 0.9999)) axes.push([x, y, z])
  }
  if (axes.length !== 3) return null
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (Math.abs(axes[i][0] * axes[j][0] + axes[i][1] * axes[j][1] + axes[i][2] * axes[j][2]) > 1e-4) return null
  const arr = pos.array
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < arr.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const v = arr[i] * axes[k][0] + arr[i + 1] * axes[k][1] + arr[i + 2] * axes[k][2]
      if (v < min[k]) min[k] = v
      if (v > max[k]) max[k] = v
    }
  }
  for (let i = 0; i < arr.length; i += 3) {
    let onFaces = 0
    for (let k = 0; k < 3; k++) {
      const v = arr[i] * axes[k][0] + arr[i + 1] * axes[k][1] + arr[i + 2] * axes[k][2]
      if (Math.abs(v - min[k]) < 1e-5 || Math.abs(v - max[k]) < 1e-5) onFaces++
    }
    if (onFaces < 3) return null
  }
  return { axes, min, max }
}

/** 方塊在法線 n 方向的那一面的面積 */
function boxFaceArea(box, nx, ny, nz) {
  const e = [0, 1, 2].map((k) => box.max[k] - box.min[k])
  for (let k = 0; k < 3; k++) {
    const a = box.axes[k]
    if (Math.abs(a[0] * nx + a[1] * ny + a[2] * nz) > 0.999) return e[(k + 1) % 3] * e[(k + 2) % 3]
  }
  return Infinity
}

/** 兩個方塊是否完全相同（軸可以順序不同、方向相反） */
function sameBox(p, q) {
  for (let k = 0; k < 3; k++) {
    const a = p.axes[k]
    const j = q.axes.findIndex((c) => Math.abs(a[0] * c[0] + a[1] * c[1] + a[2] * c[2]) > 0.9999)
    if (j < 0) return false
    const same = Math.abs(p.min[k] - q.min[j]) < 1e-4 && Math.abs(p.max[k] - q.max[j]) < 1e-4
    const flipped = Math.abs(p.min[k] + q.max[j]) < 1e-4 && Math.abs(p.max[k] + q.min[j]) < 1e-4
    if (!same && !flipped) return false
  }
  return true
}

/** 一個量化法線的平面座標系（同一組法線的三角形用同一組 2D 座標） */
function basisFor(nx, ny, nz) {
  const rx = Math.abs(ny) < 0.9 ? 0 : 1
  const ry = Math.abs(ny) < 0.9 ? 1 : 0
  let ex = ry * nz
  let ey = -rx * nz
  let ez = rx * ny - ry * nx
  const el = Math.hypot(ex, ey, ez)
  ex /= el
  ey /= el
  ez /= el
  return [ex, ey, ez, ny * ez - nz * ey, nz * ex - nx * ez, nx * ey - ny * ex]
}

/**
 * builders：可以修改的 PartBuilder（例如街景的主要與細部）；fixed：只用來比較的 PartBuilder（不修改）。
 * 回傳統計：{ rounds, removed, expanded }
 */
export function resolveAllCoplanar(builders, { fixed = [], delta = COPLANAR_DELTA, rounds = 10, dryRun = false } = {}) {
  const parts = []
  const collect = (builder, editable) => {
    for (const list of builder.groups.values()) {
      for (const g of list) parts.push({ g, list, editable, box: orientedBox(g), size: 0, entries: [], extremes: new Map(), removed: false })
    }
  }
  builders.forEach((builder) => collect(builder, true))
  fixed.forEach((builder) => collect(builder, false))

  const groups = new Map() // 法線鍵 → { basis, list（依 d 排序）, dirty }
  const index = (part, pi) => {
    const arr = part.g.attributes.position.array
    let minX = Infinity
    let minY = Infinity
    let minZ = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let maxZ = -Infinity
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i] < minX) minX = arr[i]
      if (arr[i] > maxX) maxX = arr[i]
      if (arr[i + 1] < minY) minY = arr[i + 1]
      if (arr[i + 1] > maxY) maxY = arr[i + 1]
      if (arr[i + 2] < minZ) minZ = arr[i + 2]
      if (arr[i + 2] > maxZ) maxZ = arr[i + 2]
    }
    part.size = (maxX - minX + 0.01) * (maxY - minY + 0.01) * (maxZ - minZ + 0.01)
    part.extremes.clear()
    const minTriangle = part.box ? MIN_BOX_TRIANGLE : MIN_TRIANGLE
    part.entries = []
    for (let i = 0; i + 8 < arr.length; i += 9) {
      const ux = arr[i + 3] - arr[i]
      const uy = arr[i + 4] - arr[i + 1]
      const uz = arr[i + 5] - arr[i + 2]
      const vx = arr[i + 6] - arr[i]
      const vy = arr[i + 7] - arr[i + 1]
      const vz = arr[i + 8] - arr[i + 2]
      let nx = uy * vz - uz * vy
      let ny = uz * vx - ux * vz
      let nz = ux * vy - uy * vx
      const len = Math.hypot(nx, ny, nz)
      if (len / 2 < minTriangle) continue
      nx /= len
      ny /= len
      nz /= len
      const qx = Math.round(nx * Q)
      const qy = Math.round(ny * Q)
      const qz = Math.round(nz * Q)
      const key = (qx + 512) * 1048576 + (qy + 512) * 1024 + (qz + 512)
      let group = groups.get(key)
      if (!group) groups.set(key, (group = { basis: basisFor(qx / Q, qy / Q, qz / Q), list: [], dirty: true }))
      const [ex, ey, ez, fx, fy, fz] = group.basis
      const q = []
      for (let k = 0; k < 9; k += 3) q.push([arr[i + k] * ex + arr[i + k + 1] * ey + arr[i + k + 2] * ez, arr[i + k] * fx + arr[i + k + 1] * fy + arr[i + k + 2] * fz])
      const entry = {
        pi,
        nx,
        ny,
        nz,
        key,
        d: nx * arr[i] + ny * arr[i + 1] + nz * arr[i + 2],
        q,
        u0: Math.min(q[0][0], q[1][0], q[2][0]),
        u1: Math.max(q[0][0], q[1][0], q[2][0]),
        v0: Math.min(q[0][1], q[1][1], q[2][1]),
        v1: Math.max(q[0][1], q[1][1], q[2][1]),
        group,
        alive: true,
      }
      group.list.push(entry)
      group.dirty = true
      part.entries.push(entry)
    }
  }
  parts.forEach(index)

  const extreme = (part, nx, ny, nz, key) => {
    if (part.extremes.has(key)) return part.extremes.get(key)
    const arr = part.g.attributes.position.array
    let m = -Infinity
    for (let i = 0; i < arr.length; i += 3) {
      const v = arr[i] * nx + arr[i + 1] * ny + arr[i + 2] * nz
      if (v > m) m = v
    }
    part.extremes.set(key, m)
    return m
  }
  const sortGroups = () => {
    for (const group of groups.values()) {
      if (!group.dirty) continue
      group.list = group.list.filter((e) => e.alive)
      group.list.sort((a, b) => a.d - b.d)
      group.dirty = false
    }
  }

  const total = { rounds: 0, removed: 0, expanded: 0 }
  const conflicts = []
  let candidates = null // null：第一輪檢查全部
  for (let round = 0; round < rounds; round++) {
    sortGroups()
    const edges = [] // front 要在 back 的前面（同一個朝向）
    const removals = new Set()
    const seen = new Set()
    const check = (p, q) => {
      if (p.pi === q.pi) return
      if (q.u0 >= p.u1 || p.u0 >= q.u1 || q.v0 >= p.v1 || p.v0 >= q.v1) return
      if (p.nx * q.nx + p.ny * q.ny + p.nz * q.nz < 0.9999) return
      const P = parts[p.pi]
      const R = parts[q.pi]
      if (removals.has(p.pi) || removals.has(q.pi)) return
      if (!P.editable && !R.editable) return
      const a = Math.min(p.pi, q.pi)
      const b = Math.max(p.pi, q.pi)
      const pairKey = `${a}:${b}:${p.key}`
      if (seen.has(pairKey)) return
      const area = overlapArea(p.q, q.q)
      if (area < MIN_OVERLAP) return
      seen.add(pairKey)
      if (dryRun) {
        conflicts.push({ area, normal: [p.nx, p.ny, p.nz].map((v) => +v.toFixed(3)), at: centroid(p.q, p.group.basis, p.d, p), geometries: [P.g, R.g] })
        return
      }
      let mover = null
      if (P.box && R.box) {
        if (P.editable && R.editable && sameBox(P.box, R.box)) {
          removals.add(a)
          return
        }
        if (!P.editable) mover = q.pi
        else if (!R.editable) mover = p.pi
        else {
          const fa = boxFaceArea(P.box, p.nx, p.ny, p.nz)
          const fb = boxFaceArea(R.box, q.nx, q.ny, q.nz)
          if (Math.abs(fa - fb) > 1e-6) mover = fa < fb ? p.pi : q.pi
          else mover = Math.abs(P.size - R.size) > 1e-9 ? (P.size < R.size ? p.pi : q.pi) : b
        }
      } else {
        const canP = P.editable && extreme(P, p.nx, p.ny, p.nz, p.key) - p.d < PLANE_TOLERANCE
        const canQ = R.editable && extreme(R, q.nx, q.ny, q.nz, q.key) - q.d < PLANE_TOLERANCE
        if (canP && canQ) mover = P.size <= R.size ? p.pi : q.pi
        else if (canP) mover = p.pi
        else if (canQ) mover = q.pi
      }
      if (mover == null) return
      const t = mover === p.pi ? p : q
      edges.push({ front: mover, back: mover === p.pi ? q.pi : p.pi, t })
    }
    if (!candidates) {
      // 第一輪：每一組法線依 d 排序後滑動比較
      for (const group of groups.values()) {
        const list = group.list
        for (let i = 0; i < list.length; i++) {
          const p = list[i]
          for (let k = i + 1; k < list.length && list[k].d - p.d <= PLANE_TOLERANCE; k++) check(p, list[k])
        }
      }
    } else {
      // 之後：只檢查上一輪移動過的零件（二分搜尋同一個平面附近的三角形）
      for (const pi of candidates) {
        for (const p of parts[pi].entries) {
          const list = p.group.list
          let lo = 0
          let hi = list.length
          while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (list[mid].d < p.d - PLANE_TOLERANCE) lo = mid + 1
            else hi = mid
          }
          for (let k = lo; k < list.length && list[k].d <= p.d + PLANE_TOLERANCE; k++) check(p, list[k])
        }
      }
    }
    total.rounds++
    if (dryRun) return { ...total, conflicts }
    // 分層：同一個朝向上，每個零件要在它該在前面的所有零件之前——層數 = 那些零件的最大層數 + 1，
    // 往外長「層數 × delta」。同一個平面上疊了好幾個飾件時一次就錯開，不會兩個長到同一個位置又互相閃爍
    const layer = new Map()
    const layerOf = (pi, key) => layer.get(`${pi}|${key}`) ?? 0
    for (let pass = 0; pass < 8; pass++) {
      let changed = false
      for (const e of edges) {
        if (removals.has(e.front) || removals.has(e.back)) continue
        const want = Math.min(8, layerOf(e.back, e.t.key) + 1)
        if (want > layerOf(e.front, e.t.key)) {
          layer.set(`${e.front}|${e.t.key}`, want)
          changed = true
        }
      }
      if (!changed) break
    }
    const moves = new Map() // 零件索引 → [{ 三角形（朝向）, 層數 }]
    for (const e of edges) {
      if (removals.has(e.front)) continue
      if (!moves.has(e.front)) moves.set(e.front, [])
      const list = moves.get(e.front)
      if (!list.some((m) => m.t.key === e.t.key)) list.push({ t: e.t, layers: layerOf(e.front, e.t.key) })
    }
    if (!moves.size && !removals.size) break

    // 套用：刪除重複的方塊；把要長的零件在那一側最外面的頂點往外推 delta
    for (const pi of removals) {
      const part = parts[pi]
      part.removed = true
      const at = part.list.indexOf(part.g)
      if (at >= 0) part.list.splice(at, 1)
      part.g.userData.discarded = true
      for (const e of part.entries) {
        e.alive = false
        e.group.dirty = true
      }
      part.entries = []
      total.removed++
    }
    candidates = new Set()
    for (const [pi, list] of moves) {
      const part = parts[pi]
      if (part.removed) continue
      const pos = part.g.attributes.position
      const arr = pos.array
      for (const { t: m, layers } of list) {
        const top = extreme(part, m.nx, m.ny, m.nz, m.key)
        const shift = delta * Math.max(1, layers)
        for (let i = 0; i < arr.length; i += 3) {
          if (arr[i] * m.nx + arr[i + 1] * m.ny + arr[i + 2] * m.nz < top - PLANE_TOLERANCE) continue
          arr[i] += m.nx * shift
          arr[i + 1] += m.ny * shift
          arr[i + 2] += m.nz * shift
        }
        total.expanded++
      }
      pos.needsUpdate = true
      for (const e of part.entries) {
        e.alive = false
        e.group.dirty = true
      }
      if (part.box) part.box = orientedBox(part.g)
      index(part, pi)
      candidates.add(pi)
    }
  }
  for (const part of parts) if (part.removed) part.g.dispose()
  return total
}

/**
 * 只找出共面重疊的地方、不修改（測試與除錯用）：回傳 [{ area, normal, at }]。
 * builders 可以是 PartBuilder，或任何有 groups（Map：材質 → 幾何陣列）的物件。
 */
export function findCoplanar(builders, { visibleOnly = false } = {}) {
  const conflicts = resolveAllCoplanar(builders, { dryRun: true }).conflicts
  if (!visibleOnly) return conflicts
  // 看得到的才算：重疊處往外 2 公分的點在地面以下、或在另一個實心的軸對齊方塊裡，就看不到
  const solids = []
  for (const builder of builders) {
    for (const list of builder.groups.values()) {
      for (const g of list) {
        const box = orientedBox(g)
        if (!box || box.axes.some((a) => Math.max(Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])) < 0.9999)) continue
        const lo = [0, 0, 0]
        const hi = [0, 0, 0]
        box.axes.forEach((a, k) => {
          const axis = Math.abs(a[0]) > 0.5 ? 0 : Math.abs(a[1]) > 0.5 ? 1 : 2
          const sign = a[axis] > 0 ? 1 : -1
          lo[axis] = sign > 0 ? box.min[k] : -box.max[k]
          hi[axis] = sign > 0 ? box.max[k] : -box.min[k]
        })
        if (hi.some((v, k) => v - lo[k] < 0.03)) continue
        solids.push({ g, lo, hi })
      }
    }
  }
  return conflicts.filter(({ at, normal, geometries }) => {
    const p = at.map((v, k) => v + normal[k] * 0.02)
    if (p[1] < 0.005) return false
    return !solids.some(({ g, lo, hi }) => !geometries.includes(g) && p.every((v, k) => v > lo[k] + 0.001 && v < hi[k] - 0.001))
  })
}

/** 三角形中心的世界座標（除錯用） */
function centroid(q, basis, d, n) {
  const u = (q[0][0] + q[1][0] + q[2][0]) / 3
  const v = (q[0][1] + q[1][1] + q[2][1]) / 3
  const [ex, ey, ez, fx, fy, fz] = basis
  return [u * ex + v * fx + d * n.nx, u * ey + v * fy + d * n.ny, u * ez + v * fz + d * n.nz].map((x) => +x.toFixed(2))
}

/** 兩個三角形（2D）重疊的面積（Sutherland–Hodgman 裁切） */
function overlapArea(A, B) {
  const ccw = (t) => ((t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[1][1] - t[0][1]) * (t[2][0] - t[0][0]) >= 0 ? t : [t[0], t[2], t[1]])
  let poly = ccw(A)
  const clip = ccw(B)
  for (let i = 0; i < 3 && poly.length; i++) {
    const p1 = clip[i]
    const p2 = clip[(i + 1) % 3]
    const inside = (p) => (p2[0] - p1[0]) * (p[1] - p1[1]) - (p2[1] - p1[1]) * (p[0] - p1[0]) >= -1e-9
    const out = []
    for (let k = 0; k < poly.length; k++) {
      const cur = poly[k]
      const prev = poly[(k + poly.length - 1) % poly.length]
      const ci = inside(cur)
      const pi = inside(prev)
      if (ci) {
        if (!pi) out.push(intersect(prev, cur, p1, p2))
        out.push(cur)
      } else if (pi) out.push(intersect(prev, cur, p1, p2))
    }
    poly = out
  }
  let s = 0
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k]
    const b = poly[(k + 1) % poly.length]
    s += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(s) / 2
}

function intersect(a, b, p, q) {
  const den = (a[0] - b[0]) * (p[1] - q[1]) - (a[1] - b[1]) * (p[0] - q[0])
  if (Math.abs(den) < 1e-12) return a
  const t = ((a[0] - p[0]) * (p[1] - q[1]) - (a[1] - p[1]) * (p[0] - q[0])) / den
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
}
