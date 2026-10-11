import { STREET } from './config.js'
import { raycastBoxes, raycastBoxIndex } from './collision.js'
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

/** 沿方向最多可以退多遠而不撞到建築、地面或街區邊界（已扣掉安全距離） */
export function allowedDistance(target, direction, wanted, blockers) {
  const hit = raycastBoxes(target, direction, wanted + VIEWER.margin, blockers)
  const exit = exitDistance(target, direction, VIEWER.bounds)
  return Math.max(0.3, Math.min(hit, exit) - VIEWER.margin)
}

function insideBox(p, b, pad) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad && p.y > b.minY - pad && p.y < b.maxY + pad
}

function inTargetRegion(x, z) {
  return VIEWER.targetRegions.some((r) => x >= r.minX - 1e-6 && x <= r.maxX + 1e-6 && z >= r.minZ - 1e-6 && z <= r.maxZ + 1e-6)
}

/** 把注視點限制在街道／廣場／碼頭上方，並推出建築與樹的範圍（會直接修改 target） */
export function clampViewerTarget(target, blockers = []) {
  target.y = clamp(target.y, VIEWER.minTargetY, VIEWER.maxTargetY)
  if (!inTargetRegion(target.x, target.z)) {
    let best = null
    for (const r of VIEWER.targetRegions) {
      const x = clamp(target.x, r.minX, r.maxX)
      const z = clamp(target.z, r.minZ, r.maxZ)
      const d = (x - target.x) ** 2 + (z - target.z) ** 2
      if (!best || d < best.d) best = { x, z, d }
    }
    target.x = best.x
    target.z = best.z
  }
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
export function planBuildingFocus(building, blockers, { yaw: currentYaw = 0, aspect = 16 / 9, fov = 42 } = {}) {
  const facade = facadeOf(building)
  const halfV = Math.tan(((fov / 2) * Math.PI) / 180)
  const halfH = halfV * aspect
  const needed = clamp(Math.max((facade.height * 0.6) / halfV, (facade.width * 0.56) / halfH), 5, VIEWER.maxDistance)
  const baseYaw = Math.atan2(facade.forward.x, facade.forward.z)
  const baseHeight = clamp(facade.height * 0.45, 1.6, 12)
  const direction = { x: 0, y: 0, z: 0 }
  let best = null
  // 注視點高度：立面中段為主；被樹冠等擋住時，也試試從樹下或樹上看
  for (const height of [baseHeight, 1.7, clamp(facade.height * 0.75, 1.6, 14)]) {
    const target = {
      x: facade.center.x + facade.forward.x * TARGET_CLEARANCE,
      y: height,
      z: facade.center.z + facade.forward.z * TARGET_CLEARANCE,
    }
    clampViewerTarget(target, blockers)
    for (const offset of YAW_OFFSETS) {
      for (const pitch of PITCHES) {
        const yaw = baseYaw + offset
        orbitDirection(yaw, pitch, direction)
        const available = allowedDistance(target, direction, needed, blockers)
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
