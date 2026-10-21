import { clamp } from './utils/math.js'

/**
 * 2D 碰撞（XZ 平面），分樓層
 *
 * - walkable：可行走區域（多個矩形的聯集），角色必須留在其中
 * - obstacles：障礙物矩形（貨物堆、推車、柱子…），角色會被推開
 *
 * 矩形格式：{ minX, maxX, minZ, maxZ }，另外可以有：
 * - level：所在的樓層（預設 0，街道與一樓）；levels：同時屬於好幾層（例如樓梯）
 * - floorY：地板高度（預設 0）
 * - ramp：樓梯的斜面 { axis: 'x'｜'z', from, to, y0, y1 }，沿著 axis 從 from（高度 y0）到 to（高度 y1）；
 *         levels 依序是 from 端與 to 端的樓層。看得見的階梯另外建模，角色踩的是這個看不見的連續斜面。
 *
 * 角色只跟目前樓層的範圍與障礙物碰撞，所以二樓的地板可以蓋在一樓的騎樓上方。
 */
export function resolvePlayerPosition(position, radius, world, level = 0) {
  const { walkable, obstacles } = collisionForLevel(world, level)
  for (let pass = 0; pass < 2; pass++) {
    for (const box of obstacles) pushOutOfBox(position, radius, box)
    constrainToWalkable(position, radius, walkable)
  }
}

export function onLevel(item, level) {
  return item.levels ? item.levels.includes(level) : (item.level ?? 0) === level
}

/** 每個樓層的可行走範圍與障礙物（同一份碰撞資料只篩選一次） */
const levelCache = new WeakMap()

function collisionForLevel(world, level) {
  let byLevel = levelCache.get(world)
  if (!byLevel) levelCache.set(world, (byLevel = new Map()))
  let entry = byLevel.get(level)
  if (!entry) {
    const walkable = world.walkable.filter((rect) => onLevel(rect, level))
    // 這份資料沒有這個樓層（例如換到沒有二樓店家的年代）：改用一樓
    entry = walkable.length
      ? { walkable, obstacles: world.obstacles.filter((box) => onLevel(box, level)), level }
      : level === 0
        ? { walkable, obstacles: world.obstacles, level: 0 }
        : collisionForLevel(world, 0)
    byLevel.set(level, entry)
  }
  return entry
}

/** 這份碰撞資料有沒有這個樓層（沒有時角色要回到一樓） */
export function hasLevel(world, level) {
  return collisionForLevel(world, level).level === level
}

/** 斜面在點 p 的高度與位置比例（0：from 端，1：to 端） */
export function rampAt(ramp, p) {
  const value = ramp.axis === 'x' ? p.x : p.z
  const t = clamp((value - ramp.from) / (ramp.to - ramp.from), 0, 1)
  return { t, y: ramp.y0 + (ramp.y1 - ramp.y0) * t }
}

/** 角色的高度和斜面差多少以內才算踩在樓梯上（從二樓的地板上方經過樓梯時不會掉下去） */
const RAMP_CATCH = 0.6

/**
 * 角色所在的樓層與地板高度：踩在樓梯上時依斜面計算，過了樓梯的一半就換到另一層；
 * 否則是目前樓層的地板。y 為角色目前的高度（省略時不檢查高度，例如傳送後）。
 */
export function groundAt(position, world, level = 0, y = null) {
  const entry = collisionForLevel(world, level)
  let floor = null
  for (const rect of entry.walkable) {
    if (position.x < rect.minX || position.x > rect.maxX || position.z < rect.minZ || position.z > rect.maxZ) continue
    if (rect.ramp) {
      const on = rampAt(rect.ramp, position)
      if (y != null && Math.abs(on.y - y) > RAMP_CATCH) continue
      const levels = rect.levels ?? [entry.level, entry.level]
      return { level: on.t < 0.5 ? levels[0] : levels[1], y: on.y }
    }
    floor ??= rect.floorY ?? 0
  }
  return { level: entry.level, y: floor ?? entry.walkable.find((rect) => !rect.ramp)?.floorY ?? 0 }
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

function insideAny(x, z, walkable) {
  for (const rect of walkable) {
    if (x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ) return true
  }
  return false
}

// 圓周上的取樣點：圓心和這些點都在可行走區域（矩形聯集）裡，角色就算站得下。
// 只看單一矩形的話，兩個矩形接起來的窄口會比角色還窄，小步走的時候會卡住。
const PROBES = Array.from({ length: 16 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)])

function discInWalkable(x, z, radius, walkable) {
  if (!insideAny(x, z, walkable)) return false
  for (const [dx, dz] of PROBES) {
    if (!insideAny(x + dx * radius, z + dz * radius, walkable)) return false
  }
  return true
}

function constrainToWalkable(position, radius, walkable) {
  if (walkable.some((rect) => insideShrunk(position, radius, rect))) return
  if (discInWalkable(position.x, position.z, radius, walkable)) return
  let bestX = position.x
  let bestZ = position.z
  let bestDist = Infinity
  for (const rect of walkable) {
    const x = clamp(position.x, rect.minX + radius, rect.maxX - radius)
    const z = clamp(position.z, rect.minZ + radius, rect.maxZ - radius)
    // 縮小後矩形裡的點一定站得下；只修正單軸的點要另外確認，才能沿著接縫滑過去
    for (const [cx, cz, safe] of [
      [x, z, true],
      [x, position.z, false],
      [position.x, z, false],
    ]) {
      const dist = (cx - position.x) ** 2 + (cz - position.z) ** 2
      if (dist >= bestDist) continue
      if (!safe && !discInWalkable(cx, cz, radius, walkable)) continue
      bestDist = dist
      bestX = cx
      bestZ = cz
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
