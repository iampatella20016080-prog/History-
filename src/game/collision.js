import { clamp } from './utils/math.js'

/**
 * 2D 碰撞（XZ 平面）
 *
 * - walkable：可行走區域（多個矩形的聯集），角色必須留在其中
 * - obstacles：障礙物矩形（貨物堆、推車、柱子…），角色會被推開
 *
 * 矩形格式：{ minX, maxX, minZ, maxZ }
 */
export function resolvePlayerPosition(position, radius, world) {
  for (let pass = 0; pass < 2; pass++) {
    for (const box of world.obstacles) pushOutOfBox(position, radius, box)
    constrainToWalkable(position, radius, world.walkable)
  }
}

function pushOutOfBox(position, radius, box) {
  const nearestX = clamp(position.x, box.minX, box.maxX)
  const nearestZ = clamp(position.z, box.minZ, box.maxZ)
  const dx = position.x - nearestX
  const dz = position.z - nearestZ
  const distSq = dx * dx + dz * dz
  if (distSq >= radius * radius) return

  if (distSq > 1e-10) {
    const dist = Math.sqrt(distSq)
    position.x = nearestX + (dx / dist) * radius
    position.z = nearestZ + (dz / dist) * radius
    return
  }

  // 圓心已在矩形內：沿穿透最淺的方向推出
  const left = position.x - box.minX
  const right = box.maxX - position.x
  const back = position.z - box.minZ
  const front = box.maxZ - position.z
  const min = Math.min(left, right, back, front)
  if (min === left) position.x = box.minX - radius
  else if (min === right) position.x = box.maxX + radius
  else if (min === back) position.z = box.minZ - radius
  else position.z = box.maxZ + radius
}

function insideShrunk(position, radius, rect) {
  return (
    position.x >= rect.minX + radius &&
    position.x <= rect.maxX - radius &&
    position.z >= rect.minZ + radius &&
    position.z <= rect.maxZ - radius
  )
}

function constrainToWalkable(position, radius, walkable) {
  if (walkable.some((rect) => insideShrunk(position, radius, rect))) return
  let bestX = position.x
  let bestZ = position.z
  let bestDist = Infinity
  for (const rect of walkable) {
    const x = clamp(position.x, rect.minX + radius, rect.maxX - radius)
    const z = clamp(position.z, rect.minZ + radius, rect.maxZ - radius)
    const dist = (x - position.x) ** 2 + (z - position.z) ** 2
    if (dist < bestDist) {
      bestDist = dist
      bestX = x
      bestZ = z
    }
  }
  position.x = bestX
  position.z = bestZ
}

/**
 * 射線與 3D 軸對齊方塊（AABB）的最近交點距離，用於鏡頭避開建築。
 * box 格式：{ minX, maxX, minY, maxY, minZ, maxZ }
 */
export function raycastBoxes(origin, direction, maxDistance, boxes) {
  let nearest = maxDistance
  for (const box of boxes) {
    const t = rayBox(origin, direction, box)
    if (t !== null && t < nearest) nearest = t
  }
  return nearest
}

/** 同上，但回傳最近被射中的方塊 { index, distance }；都沒射中時回傳 null */
export function raycastBoxIndex(origin, direction, maxDistance, boxes) {
  let nearest = null
  for (let i = 0; i < boxes.length; i++) {
    const t = rayBox(origin, direction, boxes[i])
    if (t !== null && t < maxDistance && (!nearest || t < nearest.distance)) nearest = { index: i, distance: t }
  }
  return nearest
}

function rayBox(o, d, b) {
  let tMin = 0
  let tMax = Infinity
  const axes = [
    [o.x, d.x, b.minX, b.maxX],
    [o.y, d.y, b.minY, b.maxY],
    [o.z, d.z, b.minZ, b.maxZ],
  ]
  for (const [origin, dir, min, max] of axes) {
    if (Math.abs(dir) < 1e-8) {
      if (origin < min || origin > max) return null
      continue
    }
    let t1 = (min - origin) / dir
    let t2 = (max - origin) / dir
    if (t1 > t2) [t1, t2] = [t2, t1]
    tMin = Math.max(tMin, t1)
    tMax = Math.min(tMax, t2)
    if (tMin > tMax) return null
  }
  return tMin
}
