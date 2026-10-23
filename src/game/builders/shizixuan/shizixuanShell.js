import { Shape } from 'three'

/**
 * 十字軒的建築殼體工具：正面牆依開口切段（窗戶嵌在牆裡）、側牆（與鄰棟交界的 party wall）往內退一點、
 * 正面牆與後牆只蓋在兩道側牆之間（角落不重疊、頂面不共面）、樓板、屋頂板、山牆與窗後的暗色室內背板。
 *
 * 每一個零件都登記在 parts（建築本地座標的範圍），測試用來確認殼體完整（tests/shizixuanShell.test.js）。
 * 共面的處理靠實際的位置與厚度分開，不用 polygonOffset／renderOrder／透明。
 */

/** 側牆外側離地段邊界的距離：不和隔壁一般街屋的山牆共面 */
export const PARTY_INSET = 0.012
/** 貼在牆面上的飾件至少往外 1.2 cm */
export const TRIM_GAP = 0.012

export function createShellParts() {
  return { front: [], back: [], left: [], right: [], floor: [], roof: [], slabs: [], gables: [], partitions: [], piers: [], backdrops: [], openings: [] }
}

function record(parts, key, minX, maxX, minY, maxY, minZ, maxZ) {
  parts[key].push({ minX, maxX, minY, maxY, minZ, maxZ })
}

function boxPart(b, parts, key, mat, minX, maxX, minY, maxY, minZ, maxZ, opts = {}) {
  if (maxX - minX < 1e-4 || maxY - minY < 1e-4 || maxZ - minZ < 1e-4) return
  b.box(mat, [maxX - minX, maxY - minY, maxZ - minZ], [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2], opts)
  record(parts, key, minX, maxX, minY, maxY, minZ, maxZ)
}

/**
 * 一段牆（在 xy 平面，厚度沿 z：minZ–maxZ），依開口切成窗下、窗上與窗間的方塊。
 * openings：[{ minX, maxX, minY, maxY }]，同一段牆裡的開口在 x 方向不重疊。
 */
export function wallWithOpenings(b, parts, key, mat, { minX, maxX, minY, maxY, minZ, maxZ, openings = [], tint, grime = 0 }) {
  const opts = { tint, grime }
  const sorted = openings
    .map((o) => ({ ...o, minX: Math.max(o.minX, minX), maxX: Math.min(o.maxX, maxX), minY: Math.max(o.minY, minY), maxY: Math.min(o.maxY, maxY) }))
    .filter((o) => o.maxX > o.minX && o.maxY > o.minY)
    .sort((a, b2) => a.minX - b2.minX)
  let x = minX
  for (const o of sorted) {
    boxPart(b, parts, key, mat, x, o.minX, minY, maxY, minZ, maxZ, opts)
    boxPart(b, parts, key, mat, o.minX, o.maxX, minY, o.minY, minZ, maxZ, opts)
    boxPart(b, parts, key, mat, o.minX, o.maxX, o.maxY, maxY, minZ, maxZ, opts)
    parts.openings.push({ key, minX: o.minX, maxX: o.maxX, minY: o.minY, maxY: o.maxY, minZ, maxZ })
    x = o.maxX
  }
  boxPart(b, parts, key, mat, x, maxX, minY, maxY, minZ, maxZ, opts)
}

/** 兩道側牆（party wall）：外側離地段邊界 PARTY_INSET */
export function sideWalls(b, parts, mat, { half, wallT, minY, maxY, minZ, maxZ, tint, grime = 0 }) {
  const outer = half - PARTY_INSET
  boxPart(b, parts, 'left', mat, -outer, -outer + wallT, minY, maxY, minZ, maxZ, { tint, grime })
  boxPart(b, parts, 'right', mat, outer - wallT, outer, minY, maxY, minZ, maxZ, { tint, grime })
  return { inner: outer - wallT, outer }
}

/** 水平的板（樓板、屋頂板、地板） */
export function slab(b, parts, key, mat, { minX, maxX, minZ, maxZ, y, t, tint }) {
  boxPart(b, parts, key, mat, minX, maxX, y - t, y, minZ, maxZ, { tint })
}

/** 三角形的山牆（在 zy 平面，厚度沿 x：x0–x0+t）：底邊 y0，從 zFront 到 zBack，頂點在 (zRidge, yRidge) */
export function gableWall(b, parts, key, mat, { x0, t, y0, zFront, zBack, zRidge, yRidge, tint }) {
  const shape = new Shape()
  // Shape 的 u = −z、v = y；繞 y 軸轉 90° 之後，擠出方向是 +x
  shape.moveTo(-zFront, y0)
  shape.lineTo(-zBack, y0)
  shape.lineTo(-zRidge, yRidge)
  shape.lineTo(-zFront, y0)
  b.extrude(mat, shape, t, { position: [x0, 0, 0], rotation: [0, Math.PI / 2, 0], tint })
  record(parts, 'gables', x0, x0 + t, y0, yRidge, Math.min(zFront, zBack), Math.max(zFront, zBack))
}

/** 窗後的暗色室內背板（樓上沒有做室內的部分）：從窗戶看進去是暗的室內，不是空洞 */
export function windowBackdrop(b, parts, { minX, maxX, minY, maxY, z, tint = '#2a2420' }) {
  boxPart(b, parts, 'backdrops', 'interior', minX, maxX, minY, maxY, z - 0.04, z, { tint })
}

/** 嵌在開口裡的木框格子窗：框、窗櫺與玻璃都在開口的範圍內（玻璃退在牆厚的中間） */
export function insetWindow(b, { minX, maxX, minY, maxY, frontZ, depth, frame = '#9a6a3a', glass = '#9fb3b6', cols = 2, rows = 3, lit = false, grille = 0 }) {
  const w = maxX - minX
  const h = maxY - minY
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const fz = frontZ - depth * 0.35
  const f = 0.06
  // 外框（四邊，貼著開口的內緣）
  b.box('wood', [w, f, depth * 0.5], [cx, minY + f / 2, fz], { tint: frame })
  b.box('wood', [w, f, depth * 0.5], [cx, maxY - f / 2, fz], { tint: frame })
  b.box('wood', [f, h - 2 * f, depth * 0.5], [minX + f / 2, cy, fz], { tint: frame })
  b.box('wood', [f, h - 2 * f, depth * 0.5], [maxX - f / 2, cy, fz], { tint: frame })
  // 玻璃（退在框的後面）
  b.box(lit ? 'windowLit' : 'glass', [w - 2 * f, h - 2 * f, 0.01], [cx, cy, fz - depth * 0.25 - 0.006], { tint: lit ? '#ffd9a0' : glass })
  // 窗櫺
  // 直櫺與橫櫺的前後面錯開，交叉處不共面
  for (let i = 1; i < cols; i++) b.box('wood', [0.03, h - 2 * f, 0.04], [minX + (w * i) / cols, cy, fz + 0.005], { tint: frame })
  for (let j = 1; j < rows; j++) b.box('wood', [w - 2 * f, 0.03, 0.024], [cx, minY + (h * j) / rows, fz + 0.005], { tint: frame })
  // 下段的鐵窗花（2000 的照片：窗的下三分之一）
  if (grille > 0) {
    const gh = h * grille
    const gz = frontZ + 0.04
    b.box('steel', [w + 0.06, 0.025, 0.04], [cx, minY + gh, gz], { tint: '#2a2826' })
    b.box('steel', [w + 0.06, 0.025, 0.04], [cx, minY + 0.03, gz], { tint: '#2a2826' })
    const n = Math.max(3, Math.round(w / 0.11))
    for (let i = 0; i <= n; i++) b.box('steel', [0.014, gh, 0.014], [minX - 0.02 + ((w + 0.04) * i) / n, minY + gh / 2, gz], { tint: '#2a2826' })
  }
}

/**
 * 往內推開的門扇（門洞保持暢通，人物不會穿過玻璃）：hingeX 是門軸，side = -1 門扇往 +x 延伸（左門軸）、+1 往 −x（右門軸），
 * 打開後貼著門洞的側邊往室內（−z）。回傳門扇在地面上的範圍（給碰撞用）。
 */
export function openDoorLeaf(b, { hingeX, side, width, height, z, frame = '#6b4a30', glass = '#a9bcc0', angle = 1.45 }) {
  const rot = side < 0 ? angle : -angle
  const dir = side < 0 ? 1 : -1
  b.group([hingeX, 0, z], rot, () => {
    const cx = (dir * width) / 2
    b.box('wood', [width, 0.06, 0.05], [cx, 0.03, 0], { tint: frame })
    b.box('wood', [width, 0.06, 0.05], [cx, height - 0.03, 0], { tint: frame })
    b.box('wood', [0.06, height - 0.12, 0.05], [dir * 0.03, height / 2, 0], { tint: frame })
    b.box('wood', [0.06, height - 0.12, 0.05], [dir * (width - 0.03), height / 2, 0], { tint: frame })
    b.box('glassClear', [width - 0.12, height - 0.12, 0.012], [cx, height / 2, 0], { tint: glass })
    b.box('steel', [0.025, 0.4, 0.03], [dir * (width - 0.12), 1.05, 0.03], { tint: '#c9a24a' })
  })
  // 打開後的佔地（門軸附近往室內延伸）
  const ex = Math.cos(rot) * dir * width
  const ez = -Math.sin(rot) * dir * width
  return { minX: Math.min(hingeX, hingeX + ex) - 0.06, maxX: Math.max(hingeX, hingeX + ex) + 0.06, minZ: Math.min(z, z + ez) - 0.06, maxZ: Math.max(z, z + ez) + 0.02 }
}
