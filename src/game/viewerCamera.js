import { CAMERA, STREET } from './config.js'
import { onLevel, raycastBoxes, raycastBoxIndex, rampAt } from './collision.js'
import { clamp } from './utils/math.js'

/**
 * 建築觀賞模式的鏡頭計算（純函式，不依賴畫面，方便測試）
 *
 * 鏡頭繞著「注視點」環繞：位置 = 注視點 + 方向(yaw, pitch) × 距離。
 * yaw／pitch 的定義與第三人稱鏡頭相同（pitch 為正時鏡頭在注視點上方往下看）。
 *
 * 限制：
 * - 注視點只能在街道、河岸廣場與碼頭上方（不會跑進建築或離開街區）
 * - 鏡頭被建築擋住時自動拉近（不穿牆），也不會低於地面或飛出街區範圍
 */
export const VIEWER = {
  minDistance: 1.6,
  maxDistance: 30,
  minPitch: -0.2,
  maxPitch: 1.35,
  minTargetY: 0.8,
  maxTargetY: 18,
  /** 進入觀賞模式時：在角色附近、略高於街道 */
  start: { height: 2.4, pitch: 0.3, distance: 8.5 },
  margin: 0.4,
  /** 鏡頭可活動的街區範圍 */
  bounds: { minX: -60, maxX: 46, minY: 0.45, maxY: 34, minZ: -20, maxZ: 20 },
  /** 注視點可在的區域：街道、河岸廣場、碼頭 */
  targetRegions: [
    { minX: STREET.rowStartX - 0.5, maxX: STREET.rowEndX + 0.5, minZ: -2.5, maxZ: 2.5 },
    { minX: -44, maxX: STREET.rowStartX + 1, minZ: -9, maxZ: 9 },
    { minX: -52.5, maxX: -43, minZ: -1.6, maxZ: 1.6 },
  ],
}

const TARGET_CLEARANCE = 0.35

const DEFAULT_SPACE = { regions: VIEWER.targetRegions, bounds: VIEWER.bounds }

/**
 * 某個年代的觀賞範圍：基本的街道、廣場與碼頭，加上年代額外的範圍
 * （例如可以走進去的永樂市場：騎樓、大門與一樓走道，各有不超過天花板的高度上限 maxY）。
 */
export function viewerSpaceOf(world) {
  if (!world?.viewerRegions?.length && !world?.viewerBounds) return DEFAULT_SPACE
  return {
    regions: [...VIEWER.targetRegions, ...(world.viewerRegions ?? [])],
    bounds: { ...VIEWER.bounds, ...(world.viewerBounds ?? {}) },
  }
}

/** 走向室內的大門：離大門 ENTRY_HOLD 公尺內完全切換成室內鏡頭，往外 ENTRY_RAMP 公尺內逐漸過渡 */
const ENTRY_HOLD = 1.2
const ENTRY_RAMP = 6
/** 第三人稱鏡頭在街道上被建築擋住時，最近只拉到這個距離 */
const FOLLOW_MIN_DISTANCE = 1.3
/** 鏡頭與遮擋物之間至少留的距離；遮擋物比最近距離還近時，鏡頭也不會比這更靠近角色 */
const FOLLOW_WALL_GAP = 0.12
const FOLLOW_NEAREST = 0.15

/**
 * 第三人稱鏡頭可以退到的距離：射線在 hit 公尺碰到遮擋物時，退到遮擋物前 0.45 公尺，但至少保持 minDistance。
 * tight（室內與建築另外指定的窄巷，遮擋方塊貼著實際的牆、櫃台與車）時，遮擋物比 minDistance 還近
 * （例如角色貼著巷子的牆或停著的豆花車），鏡頭停在遮擋物前面，不會進到遮擋物裡。
 * 街道上的遮擋方塊比較粗略（例如騎樓上方的量體也涵蓋了騎樓），維持原本的最近距離；
 * 注視點本身就在方塊裡（hit 為 0，看不出遮擋物在哪裡）時也維持最近距離。
 */
export function followAllowed(hit, minDistance, tight = false) {
  const loose = Math.max(minDistance, hit - 0.45)
  if (!tight || hit <= 1e-4) return loose
  return Math.min(loose, Math.max(FOLLOW_NEAREST, hit - FOLLOW_WALL_GAP))
}

/** 點是否在建築另外指定的「貼近障礙物」範圍裡（例如豆花店的224巷；室內範圍另外由 interiorAmount 判斷）；範圍屬於某個樓層（預設 0） */
export function inFollowArea(p, areas = [], level = 0) {
  return areas.some((r) => onLevel(r, level) && p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ)
}

/**
 * 線段 ab 是否穿過遮擋方塊；不算起點本身所在的方塊
 * （例如鏡頭還在騎樓上方的粗略量體裡，從裡面往外的射線一定會「碰到」它，但那不是要穿過的牆）。
 */
export function segmentCrossesWall(a, b, blockers) {
  return segmentBlocked(
    a,
    b,
    blockers.filter((box) => !(a.x > box.minX && a.x < box.maxX && a.y > box.minY && a.y < box.maxY && a.z > box.minZ && a.z < box.maxZ)),
  )
}

function insideRect(r, p) {
  return p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ
}

/**
 * 點是否在室內範圍裡。範圍可以由幾塊組成（parts，各自屬於某個樓層），
 * 例如爐鍋咖啡的樓梯間（上下兩層）、二樓的樓梯平台與店內；範圍本身的矩形是這幾塊的外框。
 */
function insideZone(zone, p, level) {
  if (zone.parts) return zone.parts.some((part) => onLevel(part, level) && insideRect(part, p))
  return onLevel(zone, level) && insideRect(zone, p)
}

/**
 * 角色在室內（例如永樂市場一樓）時為 1；在通往大門的入口範圍內，越靠近大門越接近 1；其他地方為 0。
 * 室內範圍可以另外指定過渡的距離（entryHold、entryRamp，例如巷子裡的小店較短）。
 * 室內範圍屬於某個樓層（level，預設 0；樓梯間可以用 levels 同時屬於上下兩層），
 * 例如二樓的咖啡館只在角色走上二樓時才算室內，站在下面的騎樓不算。入口範圍屬於一樓。
 * 回傳 { zone, amount }，不在任何室內或入口範圍時回傳 null。
 */
export function interiorAmount(p, interiors = [], level = 0) {
  for (const zone of interiors) if (insideZone(zone, p, level)) return { zone, amount: 1 }
  for (const zone of interiors) {
    if (!zone.entry || (zone.entry.level ?? 0) !== level || !insideRect(zone.entry, p)) continue
    const d = Math.hypot(p.x - zone.door.x, p.z - zone.door.z)
    const hold = zone.entryHold ?? ENTRY_HOLD
    const ramp = zone.entryRamp ?? ENTRY_RAMP
    return { zone, amount: 1 - clamp((d - hold) / ramp, 0, 1) }
  }
  return null
}

/**
 * 第三人稱鏡頭的仰角與距離，依室內混合程度 k（0–1）往室內的鏡頭設定 shot 過渡：
 * 距離縮短、上下拖曳的角度對應到室內較低的範圍（鏡頭不會貼著天花板往下看），被擋住時可以拉得更近。
 */
export function indoorFollow(pitch, distance, k, shot) {
  if (!shot || k <= 0.001) return { pitch, distance, minDistance: FOLLOW_MIN_DISTANCE }
  const t = clamp((pitch - CAMERA.minPitch) / (CAMERA.maxPitch - CAMERA.minPitch), 0, 1)
  return {
    pitch: pitch + (shot.minPitch + t * (shot.maxPitch - shot.minPitch) - pitch) * k,
    distance: distance + (Math.min(distance, shot.distance) - distance) * k,
    minDistance: FOLLOW_MIN_DISTANCE + (shot.minDistance - FOLLOW_MIN_DISTANCE) * k,
  }
}

/** 由 yaw／pitch 算出「注視點 → 鏡頭」的單位方向 */
export function orbitDirection(yaw, pitch, out = { x: 0, y: 0, z: 0 }) {
  const cosPitch = Math.cos(pitch)
  out.x = Math.sin(yaw) * cosPitch
  out.y = Math.sin(pitch)
  out.z = Math.cos(yaw) * cosPitch
  return out
}

/** 射線從方塊內部出發時，離開方塊的距離（用於限制鏡頭不飛出街區、不低於地面） */
function exitDistance(o, d, b) {
  let t = Infinity
  for (const [origin, dir, min, max] of [
    [o.x, d.x, b.minX, b.maxX],
    [o.y, d.y, b.minY, b.maxY],
    [o.z, d.z, b.minZ, b.maxZ],
  ]) {
    if (dir > 1e-8) t = Math.min(t, (max - origin) / dir)
    else if (dir < -1e-8) t = Math.min(t, (min - origin) / dir)
  }
  return Math.max(0, t)
}

/**
 * 範圍在 (x, z) 的高度區間 [minY, maxY] 與鏡頭高度上限 cameraMaxY。
 * 一般範圍只有上限（例如一樓室內不超過天花板）；疊在一樓上方的二樓室內另外有下限 minY。
 * 樓梯間的範圍有 ramp（與碰撞的斜面相同）：minY、maxY 與 cameraMaxY 是相對於樓梯斜面的高度。
 */
function regionRange(r, x, z) {
  const base = r.ramp ? rampAt(r.ramp, { x, z }).y : 0
  return {
    minY: r.minY == null ? -Infinity : base + r.minY,
    maxY: r.maxY == null ? Infinity : base + r.maxY,
    cameraMaxY: r.cameraMaxY == null ? Infinity : base + r.cameraMaxY,
  }
}

/** 包含注視點的範圍；同一個位置有上下疊著的範圍時（例如二樓的咖啡館在一樓騎樓上方），只取高度區間包含注視點的那幾個 */
function regionsAt(target, regions) {
  const found = regions.filter((r) => inRegion(r, target.x, target.z))
  const level = found.filter((r) => {
    const range = regionRange(r, target.x, target.z)
    return target.y >= range.minY - 1e-6 && target.y <= range.maxY + 1e-6
  })
  return level.length ? level : found
}

/** 注視點所在範圍的鏡頭高度上限（室內）：取所在範圍中最寬鬆的上限，沒有上限時為 Infinity */
function cameraCeiling(target, regions) {
  const found = regionsAt(target, regions)
  if (!found.length) return Infinity
  return Math.max(...found.map((r) => regionRange(r, target.x, target.z).cameraMaxY))
}

/** 沿方向最多可以退多遠而不撞到建築、地面、街區邊界或室內的高度上限（已扣掉安全距離） */
export function allowedDistance(target, direction, wanted, blockers, space = DEFAULT_SPACE) {
  const hit = raycastBoxes(target, direction, wanted + VIEWER.margin, blockers)
  const exit = exitDistance(target, direction, space.bounds)
  let allowed = Math.min(hit, exit) - VIEWER.margin
  const ceiling = cameraCeiling(target, space.regions)
  if (ceiling < Infinity && direction.y > 1e-3) allowed = Math.min(allowed, (ceiling - target.y) / direction.y)
  return Math.max(0.3, allowed)
}

/** 兩點之間有沒有被建築擋住（例如角色在市場裡、鏡頭在外面）；起點在方塊裡也算被擋住 */
export function segmentBlocked(a, b, blockers) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const length = Math.hypot(dx, dy, dz)
  if (length < 1e-6) return false
  const direction = { x: dx / length, y: dy / length, z: dz / length }
  return raycastBoxes(a, direction, length, blockers) < length - 1e-3
}

function insideBox(p, b, pad) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad && p.y > b.minY - pad && p.y < b.maxY + pad
}

function inRegion(r, x, z) {
  return x >= r.minX - 1e-6 && x <= r.maxX + 1e-6 && z >= r.minZ - 1e-6 && z <= r.maxZ + 1e-6
}

/**
 * 範圍的高度區間（室內不超過天花板，二樓不低於地板）：注視點已經在某個所在範圍的區間裡就不動，
 * 否則移到最近的區間（只有上限時，就是取所在範圍中最寬鬆的上限）
 */
function clampRegionHeight(target, regions) {
  let best = null
  for (const r of regions) {
    if (!inRegion(r, target.x, target.z)) continue
    const { minY, maxY } = regionRange(r, target.x, target.z)
    const y = clamp(target.y, minY, maxY)
    if (!best || Math.abs(y - target.y) < Math.abs(best - target.y)) best = y
  }
  if (best != null && Number.isFinite(best)) target.y = best
}

/** 把注視點限制在街道／廣場／碼頭（與年代額外的範圍）上方，並推出建築與樹的範圍（會直接修改 target） */
export function clampViewerTarget(target, blockers = [], space = DEFAULT_SPACE) {
  const regions = space.regions
  const inTargetRegion = (x, z) => regions.some((r) => inRegion(r, x, z))
  target.y = clamp(target.y, VIEWER.minTargetY, VIEWER.maxTargetY)
  if (!inTargetRegion(target.x, target.z)) {
    let best = null
    for (const r of regions) {
      const x = clamp(target.x, r.minX, r.maxX)
      const z = clamp(target.z, r.minZ, r.maxZ)
      const d = (x - target.x) ** 2 + (z - target.z) ** 2
      if (!best || d < best.d) best = { x, z, d }
    }
    target.x = best.x
    target.z = best.z
  }
  // 先壓到範圍的高度上限：從高處移進市場的注視點會降到天花板下，而不是被樓上的量體推回廣場
  clampRegionHeight(target, regions)
  for (let pass = 0; pass < 2; pass++) {
    for (const b of blockers) {
      if (!insideBox(target, b, TARGET_CLEARANCE)) continue
      const pushes = [
        { axis: 'x', value: b.minX - TARGET_CLEARANCE, cost: target.x - (b.minX - TARGET_CLEARANCE) },
        { axis: 'x', value: b.maxX + TARGET_CLEARANCE, cost: b.maxX + TARGET_CLEARANCE - target.x },
        { axis: 'z', value: b.minZ - TARGET_CLEARANCE, cost: target.z - (b.minZ - TARGET_CLEARANCE) },
        { axis: 'z', value: b.maxZ + TARGET_CLEARANCE, cost: b.maxZ + TARGET_CLEARANCE - target.z },
      ]
      pushes.sort((a, c) => a.cost - c.cost)
      // 往最近的一側推出，但不能推到街區外（例如廣場邊緣的樹）
      const push =
        pushes.find((item) => inTargetRegion(item.axis === 'x' ? item.value : target.x, item.axis === 'z' ? item.value : target.z)) ??
        pushes[0]
      target[push.axis] = push.value
    }
  }
  // 凹角（例如斜切的轉角由幾個方塊拼成）可能在兩個方塊之間來回推：
  // 改從所有推出位置中，找最近、在街區內而且不在任何方塊裡的一個
  if (blockers.some((b) => insideBox(target, b, TARGET_CLEARANCE))) {
    let best = null
    for (const b of blockers) {
      if (!insideBox(target, b, TARGET_CLEARANCE)) continue
      for (const [axis, value] of [
        ['x', b.minX - TARGET_CLEARANCE],
        ['x', b.maxX + TARGET_CLEARANCE],
        ['z', b.minZ - TARGET_CLEARANCE],
        ['z', b.maxZ + TARGET_CLEARANCE],
      ]) {
        const candidate = { ...target, [axis]: value }
        if (!inTargetRegion(candidate.x, candidate.z)) continue
        if (blockers.some((other) => insideBox(candidate, other, TARGET_CLEARANCE))) continue
        const cost = Math.abs(value - target[axis])
        if (!best || cost < best.cost) best = { axis, value, cost }
      }
    }
    if (best) target[best.axis] = best.value
  }
  // 推出方塊後可能換了範圍，再檢查一次高度上限
  clampRegionHeight(target, regions)
  return target
}

function containsPoint(box, p) {
  return p.x >= box.minX && p.x <= box.maxX && p.y >= box.minY && p.y <= box.maxY && p.z >= box.minZ && p.z <= box.maxZ
}

/**
 * 點選：從鏡頭射出的射線最先碰到的建築（沒有則回傳 null）。
 * 用每棟建築各自的遮擋方塊判斷（外框會包住騎樓上方的空間，鏡頭常常就在那裡），
 * 並略過鏡頭本身所在的方塊。
 */
export function pickBuilding(origin, direction, buildings, maxDistance = 400) {
  let best = null
  for (const building of buildings) {
    const parts = (building.parts ?? [building.box]).filter((part) => !containsPoint(part, origin))
    const hit = raycastBoxIndex(origin, direction, maxDistance, parts)
    if (hit && (!best || hit.distance < best.distance)) best = { building, distance: hit.distance }
  }
  return best?.building ?? null
}

/** 建築立面：朝向、立面中心（地面高度）、寬度與高度 */
export function facadeOf(building) {
  if (building.focus) return building.focus
  const { box, rotationY } = building
  const fx = Math.sin(rotationY)
  const fz = Math.cos(rotationY)
  const hx = (box.maxX - box.minX) / 2
  const hz = (box.maxZ - box.minZ) / 2
  const cx = (box.minX + box.maxX) / 2
  const cz = (box.minZ + box.maxZ) / 2
  const front = Math.abs(fx) * hx + Math.abs(fz) * hz
  return {
    forward: { x: fx, z: fz },
    center: { x: cx + fx * front, z: cz + fz * front },
    width: 2 * (Math.abs(fz) * hx + Math.abs(fx) * hz),
    height: box.maxY,
  }
}

function angleDifference(a, b) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
}

const YAW_OFFSETS = [0, 0.3, -0.3, 0.55, -0.55, 0.8, -0.8, 1.0, -1.0, 1.15, -1.15]
const PITCHES = [0, 0.1, 0.24, 0.4, 0.58, 0.78]

/** 從鏡頭看立面上的幾個取樣點（中央、上下緣、左右緣），回傳被其他建築或樹擋住的點數 */
function hiddenFacadePoints(camera, facade, blockers) {
  const rx = facade.forward.z
  const rz = -facade.forward.x
  const half = facade.width * 0.42
  const samples = [
    [0, 1.0],
    [0, facade.height * 0.5],
    [0, facade.height * 0.9],
    [-half, facade.height * 0.45],
    [half, facade.height * 0.45],
  ]
  const direction = { x: 0, y: 0, z: 0 }
  let hidden = 0
  for (const [side, y] of samples) {
    const px = facade.center.x + rx * side + facade.forward.x * 0.2
    const pz = facade.center.z + rz * side + facade.forward.z * 0.2
    const dx = px - camera.x
    const dy = y - camera.y
    const dz = pz - camera.z
    const length = Math.hypot(dx, dy, dz)
    if (length < 0.1) continue
    direction.x = dx / length
    direction.y = dy / length
    direction.z = dz / length
    if (raycastBoxes(camera, direction, length - 0.05, blockers) < length - 0.05) hidden++
  }
  return hidden
}

/**
 * 聚焦建築：依建築的寬度與高度算出能看見整個立面的距離，
 * 再在幾個角度與高度中，挑一個鏡頭不穿牆、立面也不被對街建築或樹擋住的位置
 * （窄街上通常會稍微斜著看）。
 *
 * @returns {{ target: {x,y,z}, yaw: number, pitch: number, distance: number }}
 */
export function planBuildingFocus(building, blockers, { yaw: currentYaw = 0, aspect = 16 / 9, fov = 42, space = DEFAULT_SPACE } = {}) {
  const facade = facadeOf(building)
  const halfV = Math.tan(((fov / 2) * Math.PI) / 180)
  const halfH = halfV * aspect
  // 建築可以另外指定：注視點高度（viewHeight）、最遠距離（maxDistance）、最大仰角（maxPitch）與
  // 最大的斜看角度（maxYawOffset），例如窄街盡頭的永樂市場從街上正面看，而不是退到屋頂上方俯瞰
  const needed = clamp(Math.max((facade.height * 0.6) / halfV, (facade.width * 0.56) / halfH), 5, Math.min(VIEWER.maxDistance, facade.maxDistance ?? Infinity))
  const baseYaw = Math.atan2(facade.forward.x, facade.forward.z)
  const baseHeight = facade.viewHeight ?? clamp(facade.height * 0.45, 1.6, 12)
  const pitches = PITCHES.filter((pitch) => pitch <= (facade.maxPitch ?? Infinity))
  const offsets = YAW_OFFSETS.filter((offset) => Math.abs(offset) <= (facade.maxYawOffset ?? Infinity))
  const heights = facade.viewHeight != null ? [baseHeight] : [baseHeight, 1.7, clamp(facade.height * 0.75, 1.6, 14)]
  const direction = { x: 0, y: 0, z: 0 }
  let best = null
  // 注視點高度：立面中段為主；被樹冠等擋住時，也試試從樹下或樹上看
  for (const height of heights) {
    const target = {
      x: facade.center.x + facade.forward.x * TARGET_CLEARANCE,
      y: height,
      z: facade.center.z + facade.forward.z * TARGET_CLEARANCE,
    }
    clampViewerTarget(target, blockers, space)
    for (const offset of offsets) {
      for (const pitch of pitches) {
        const yaw = baseYaw + offset
        orbitDirection(yaw, pitch, direction)
        const available = allowedDistance(target, direction, needed, blockers, space)
        const distance = Math.min(needed, available)
        const camera = {
          x: target.x + direction.x * distance,
          y: target.y + direction.y * distance,
          z: target.z + direction.z * distance,
        }
        const score =
          (needed - distance) +
          hiddenFacadePoints(camera, facade, blockers) * 3 +
          Math.abs(offset) * 1.4 +
          Math.abs(pitch - 0.24) * 3.5 +
          angleDifference(yaw, currentYaw) * 0.6 +
          Math.abs(target.y - baseHeight) * 0.35
        if (!best || score < best.score) best = { score, target, yaw, pitch, distance }
      }
    }
  }
  return { target: best.target, yaw: best.yaw, pitch: best.pitch, distance: best.distance }
}
