import { PIER, PLAZA, STREET } from '../config.js'
import { getShop, getShopBuilding } from '../../data/shops.js'
import { genericBuildingConfig } from './lineage.js'
import { getLotPlan } from './lots.js'
import { templeCollision } from '../builders/specials.js'

/**
 * 某個年代的街區配置：建築（依地段演變）、街道道具、路燈、電線、燈籠串、碰撞與可行走範圍。
 * 所有年代共用同一條街與同一組地段。
 */

/* ── 各年代的街道道具（座標為世界座標） ───────────── */
const PROPS_BY_ERA = {
  'qing-port': [
    { type: 'handcart', position: [19.5, 0, 2.05], rotationY: 0.12, load: 'sacks' },
    { type: 'carryingPole', position: [-14.5, 0, -2.05], rotationY: -0.05, content: 'rice' },
    { type: 'goodsPile', position: [-30.6, 0, 2.15], rotationY: 0.2, kind: 'sacks' },
    { type: 'goodsPile', position: [26.5, 0, -2.2], rotationY: -0.15, kind: 'crates' },
    { type: 'goodsPile', position: [8.2, 0, 2.25], rotationY: 0.4, kind: 'mixed' },
    { type: 'goodsPile', position: [-41.5, 0, -6.6], rotationY: 0.1, kind: 'tea' },
    { type: 'goodsPile', position: [-39.6, 0, -6.9], rotationY: -0.3, kind: 'tea' },
    { type: 'goodsPile', position: [-37.6, 0, 6.5], rotationY: 0.25, kind: 'crates' },
    { type: 'goodsPile', position: [-42.4, 0, 5.2], rotationY: -0.2, kind: 'sacks' },
    { type: 'handcart', position: [-36.4, 0, -5.9], rotationY: 1.4, load: 'tea' },
    { type: 'ropeCoil', position: [-47.5, 0, 1.0] },
    { type: 'goodsPile', position: [-50.6, 0, -0.95], rotationY: -Math.PI / 2, kind: 'tea' },
  ],
  banquet: [
    { type: 'rickshaw', position: [-9.5, 0, 1.75], rotationY: Math.PI + 0.1 },
    { type: 'rickshaw', position: [7.5, 0, -1.8], rotationY: 0.15 },
    { type: 'rickshaw', position: [-38.5, 0, 3.6], rotationY: 2.2 },
    { type: 'vendorCart', position: [-25.5, 0, 2.0], rotationY: 0.05, content: 'peanuts' },
    { type: 'vendorCart', position: [21.5, 0, -2.0], rotationY: Math.PI - 0.1, content: 'beans' },
    { type: 'goodsPile', position: [-41.5, 0, -6.6], rotationY: 0.1, kind: 'tea' },
    { type: 'goodsPile', position: [-39.4, 0, -6.8], rotationY: -0.2, kind: 'crates' },
    { type: 'goodsPile', position: [-42.4, 0, 5.2], rotationY: -0.2, kind: 'tea' },
    { type: 'ropeCoil', position: [-47.5, 0, 1.0] },
  ],
  modern: [
    { type: 'vintageCar', position: [16.5, 0, 1.75], rotationY: Math.PI },
    { type: 'bicycle', position: [-17.2, 0, -2.45], rotationY: 0.05 },
    { type: 'bicycle', position: [5.8, 0, 2.45], rotationY: Math.PI - 0.1 },
    { type: 'bicycle', position: [-37.5, 0, -6.5], rotationY: 0.4 },
    { type: 'flowerPot', position: [-30.2, 0, 2.5] },
    { type: 'flowerPot', position: [28.2, 0, -2.5] },
    { type: 'bench', position: [-40.5, 0, 6.6], rotationY: Math.PI },
    { type: 'goodsPile', position: [-41.8, 0, -6.4], rotationY: 0.1, kind: 'tea' },
  ],
  postwar: [
    { type: 'cargoTricycle', position: [-18.6, 0, 2.0], rotationY: 0.05 },
    { type: 'bicycle', position: [12.8, 0, -2.45], rotationY: -0.05 },
    { type: 'bicycle', position: [-27.5, 0, 2.45], rotationY: Math.PI },
    { type: 'bicycle', position: [24.4, 0, 2.45], rotationY: Math.PI + 0.08 },
    { type: 'foodStall', position: [-40.5, 0, -6.3], rotationY: 0, canopy: '#c9b08a' },
    { type: 'goodsPile', position: [-37.2, 0, 6.4], rotationY: 0.2, kind: 'crates' },
    { type: 'goodsPile', position: [26.8, 0, -2.3], rotationY: -0.1, kind: 'sacks' },
  ],
  revival: [
    { type: 'bench', position: [-41.2, 0, 6.7], rotationY: Math.PI, modern: true },
    { type: 'bench', position: [-38.2, 0, 6.7], rotationY: Math.PI, modern: true },
    { type: 'bench', position: [-41.2, 0, -6.7], rotationY: 0, modern: true },
    { type: 'bicycle', position: [-36.4, 0, -6.6], rotationY: 0.0 },
    { type: 'bicycle', position: [-35.6, 0, -6.6], rotationY: 0.0 },
    { type: 'bicycle', position: [9.6, 0, 2.45], rotationY: Math.PI },
    { type: 'planter', position: [-30.4, 0, 2.45] },
    { type: 'planter', position: [20.6, 0, -2.45] },
    { type: 'aBoard', position: [14.6, 0, -2.4], rotationY: 0.3 },
  ],
}

/** 道具的碰撞半寬（x, z） */
const FOOTPRINT = {
  handcart: [1.3, 0.75],
  carryingPole: [1.05, 0.38],
  goodsPile: [0.85, 0.5],
  ropeCoil: [0.3, 0.3],
  rickshaw: [1.6, 0.6],
  vendorCart: [1.4, 0.55],
  vintageCar: [1.9, 0.85],
  bicycle: [0.9, 0.22],
  flowerPot: [0.25, 0.25],
  bench: [0.85, 0.3],
  cargoTricycle: [1.25, 0.6],
  foodStall: [1.25, 1.1],
  planter: [0.5, 0.25],
  aBoard: [0.32, 0.25],
}

/** 各年代的路燈位置（街道兩側交錯） */
const LAMP_X = [-28, -16, -4, 8, 20, 31]

function streetLamps(era) {
  const style = era.streetProps.lamps
  if (!style) return []
  const lamps = LAMP_X.map((x, i) => {
    const side = i % 2 === 0 ? -1 : 1
    return { style, position: [x, 0, side * 2.62], rotationY: side < 0 ? 0 : Math.PI }
  })
  // 河岸廣場
  lamps.push({ style, position: [-43.2, 0, -2.2], rotationY: -Math.PI / 2 })
  lamps.push({ style, position: [-43.2, 0, 2.2], rotationY: -Math.PI / 2 })
  return lamps
}

/** 戰後的電線：沿街與跨街的懸垂線 */
function utilityWires(lamps) {
  const wires = []
  const tops = lamps.filter((lamp) => lamp.position[0] > -35).map((lamp) => [lamp.position[0], 7.3, lamp.position[2]])
  tops.sort((a, b) => a[0] - b[0])
  for (let i = 0; i < tops.length - 1; i++) {
    const [ax, ay, az] = tops[i]
    const [bx, by, bz] = tops[i + 1]
    for (const offset of [-0.55, 0.55]) wires.push({ from: [ax, ay + 0.1, az + offset], to: [bx, by + 0.1, bz + offset], sag: 0.55 })
    wires.push({ from: [ax, ay - 0.5, az], to: [ax, ay - 0.9, -az * 1.7], sag: 0.35 })
  }
  return wires
}

/** 酒樓年代的燈籠串（跨街） */
function lanternStrings() {
  return [-21, -7, 9, 23].map((x) => ({ from: [x, 5.6, -2.9], to: [x + 1.5, 5.6, 2.9], sag: 0.9, count: 7 }))
}

function propObstacle(prop) {
  const [hx, hz] = FOOTPRINT[prop.type] ?? [0.5, 0.5]
  const r = prop.rotationY ?? 0
  const c = Math.abs(Math.cos(r))
  const s = Math.abs(Math.sin(r))
  const ex = hx * c + hz * s
  const ez = hx * s + hz * c
  const shift = prop.type === 'goodsPile' ? 0.3 : 0
  const cx = prop.position[0] + Math.cos(r) * shift
  const cz = prop.position[2] - Math.sin(r) * shift
  return { minX: cx - ex, maxX: cx + ex, minZ: cz - ez, maxZ: cz + ez }
}

const BASE_TREES = [
  { position: [-40.6, 0, -3.6], scale: 1.0, collider: true },
  { position: [-28, 0, -24], scale: 1.2 },
  { position: [-8, 0, 23], scale: 1.1 },
  { position: [16, 0, -25], scale: 1.3 },
  { position: [30, 0, 22], scale: 1.0 },
  { position: [-41, 0, -27], scale: 1.1 },
  { position: [-40.5, 0, 28], scale: 1.25 },
  { position: [-41.5, 0, -40], scale: 1.0 },
  { position: [-41, 0, 43], scale: 1.15 },
]

const MOORING_POSTS = [
  [-46.2, 1.3],
  [-49.4, -1.3],
  [-52.6, 1.3],
  [-52.6, -1.3],
]

export function createEraLayout(era) {
  const plan = getLotPlan()
  const buildings = []
  const extraWalkable = []
  const extraObstacles = []

  for (const lot of plan.lots) {
    if (lot.kind === 'store') {
      const shop = getShop(lot.storeId)
      const config = getShopBuilding(shop, era.id)
      if (config) {
        const litWindows = era.lighting.glow > 0.5 ? 0.85 : 0.4
        buildings.push({
          id: lot.id,
          x: lot.x,
          z: lot.z,
          rotationY: lot.rotationY,
          storeId: shop.id,
          config: { litWindows, ...config, seed: lot.seed % 1000000, width: lot.width },
        })
        if (config.archetype === 'temple') {
          const cos = Math.cos(lot.rotationY)
          const sin = Math.sin(lot.rotationY)
          const transform = (x, z) => ({ x: lot.x + x * cos + z * sin, z: lot.z - x * sin + z * cos })
          const { walk, obstacles } = templeCollision(config, transform)
          extraWalkable.push(walk)
          extraObstacles.push(...obstacles)
        }
        continue
      }
      for (const sub of lot.subLots) {
        buildings.push({ id: sub.id, x: sub.x, z: sub.z, rotationY: sub.rotationY, config: genericBuildingConfig(sub, era) })
      }
      continue
    }
    buildings.push({ id: lot.id, x: lot.x, z: lot.z, rotationY: lot.rotationY, config: genericBuildingConfig(lot, era) })
  }

  const props = PROPS_BY_ERA[era.id] ?? []
  const lamps = streetLamps(era)
  const wires = era.streetProps.wires ? utilityWires(lamps) : []
  const strings = era.streetProps.lanternStrings ? lanternStrings() : []

  const streetHalf = STREET.facadeZ - STREET.walkwayDepth
  const plazaHalf = PLAZA.halfDepth - STREET.walkwayDepth
  const walkable = [
    { minX: PLAZA.minX, maxX: STREET.walkEndX, minZ: -streetHalf, maxZ: streetHalf },
    { minX: PLAZA.minX, maxX: PLAZA.maxX, minZ: -plazaHalf, maxZ: plazaHalf },
    { minX: PIER.minX, maxX: PIER.maxX + 1, minZ: -PIER.halfWidth, maxZ: PIER.halfWidth },
    ...extraWalkable,
  ]

  const obstacles = [...props.map(propObstacle), ...extraObstacles]
  for (const lamp of lamps) {
    const [x, , z] = lamp.position
    obstacles.push({ minX: x - 0.22, maxX: x + 0.22, minZ: z - 0.22, maxZ: z + 0.22 })
  }
  for (const tree of BASE_TREES) {
    if (!tree.collider) continue
    const [x, , z] = tree.position
    obstacles.push({ minX: x - 0.55, maxX: x + 0.55, minZ: z - 0.55, maxZ: z + 0.55 })
  }
  for (const [x, z] of MOORING_POSTS) {
    obstacles.push({ minX: x - 0.18, maxX: x + 0.18, minZ: z - 0.18, maxZ: z + 0.18 })
  }

  return {
    buildings,
    props,
    lamps,
    wires,
    lanternStrings: strings,
    walkable,
    obstacles,
    trees: BASE_TREES,
    mooringPosts: MOORING_POSTS,
  }
}
