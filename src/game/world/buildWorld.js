import { STREET } from '../config.js'
import { PartBuilder } from '../builders/PartBuilder.js'
import { buildArcadeBuilding } from '../builders/arcade.js'
import {
  buildBackdrop,
  buildGround,
  buildMooringPosts,
  buildTempleRoofs,
  buildTree,
} from '../builders/environment.js'
import {
  aBoard,
  bench,
  bicycle,
  cargoTricycle,
  carryingPole,
  flowerPot,
  foodStall,
  goodsPile,
  handcart,
  planter,
  rickshaw,
  ropeCoil,
  streetLamp,
  vendorCart,
  vintageCar,
} from '../builders/props.js'
import { buildShophouse } from '../builders/shophouse.js'
import { buildGrandRestaurant, buildTeaMansion, buildTemple } from '../builders/specials.js'
import { lanternString, wire } from '../builders/wires.js'
import { getEra } from '../../data/eras.js'
import { createEraLayout } from './eraLayout.js'

/**
 * 建築樣式 → 產生器。新增建築形式時在這裡註冊，並於店家資料或 lineage 指定 archetype。
 */
export const BUILDING_BUILDERS = {
  minnan: buildShophouse,
  baroque: buildArcadeBuilding,
  deco: buildArcadeBuilding,
  postwar: buildArcadeBuilding,
  'grand-restaurant': buildGrandRestaurant,
  'tea-mansion': buildTeaMansion,
  temple: buildTemple,
}

const PROP_BUILDERS = {
  handcart: (b, p, o) => handcart(b, p.position, { ...o, load: p.load }),
  carryingPole: (b, p, o) => carryingPole(b, p.position, { ...o, content: p.content }),
  goodsPile: (b, p, o) => goodsPile(b, p.position, { ...o, kind: p.kind }),
  ropeCoil: (b, p) => ropeCoil(b, p.position),
  rickshaw: (b, p, o) => rickshaw(b, p.position, o),
  vendorCart: (b, p, o) => vendorCart(b, p.position, { ...o, content: p.content }),
  vintageCar: (b, p, o) => vintageCar(b, p.position, o),
  bicycle: (b, p, o) => bicycle(b, p.position, o),
  flowerPot: (b, p, o) => flowerPot(b, p.position, o),
  bench: (b, p, o) => bench(b, p.position, { ...o, modern: p.modern }),
  cargoTricycle: (b, p, o) => cargoTricycle(b, p.position, o),
  foodStall: (b, p, o) => foodStall(b, p.position, { ...o, canopy: p.canopy }),
  planter: (b, p, o) => planter(b, p.position, o),
  aBoard: (b, p, o) => aBoard(b, p.position, o),
}

/** 遠方廟宇屋頂（清末的天際線；之後由實際的慈聖宮取代） */
const DISTANT_TEMPLE = { position: [6, 0, 25], rotationY: Math.PI }

const BACKDROP_BY_ERA = {
  'qing-port': { modern: 0, tall: 0 },
  banquet: { modern: 0.16, tall: 0 },
  modern: { modern: 0.32, tall: 0.05 },
  postwar: { modern: 0.55, tall: 0.18 },
  revival: { modern: 0.6, tall: 0.3, skyline: true },
}

function placeProp(b, prop) {
  const build = PROP_BUILDERS[prop.type]
  if (!build) return
  const seed = Math.round(Math.abs(prop.position[0] * 13 + prop.position[2] * 7)) + 1
  build(b, prop, { rotationY: prop.rotationY ?? 0, seed })
}

/** 店家的提示框與屋頂標記錨點（建築本地座標 → 世界座標） */
function storeAnchors(b, archetype, result) {
  const anchor = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const front = STREET.walkwayDepth + 0.4
  if (archetype === 'temple') {
    return { prompt: anchor(0, 3.0, front), marker: anchor(0, 9.6, -6.2) }
  }
  if (archetype === 'minnan') {
    return {
      prompt: anchor(0, result.groundHeight - 0.2, front),
      marker: anchor(0, result.ridgeHeight + 1.6, -1.5),
    }
  }
  return {
    prompt: anchor(0, result.groundHeight - 0.2, front),
    marker: anchor(0, result.topHeight + 3.2, STREET.walkwayDepth - 1.2),
  }
}

function treeBlocker({ position: [x, , z], scale, collider }) {
  const r = (collider ? 3.4 : 2.6) * scale
  return { minX: x - r, maxX: x + r, minY: 2.4 * scale, maxY: 7 * scale, minZ: z - r, maxZ: z + r }
}

/**
 * 產生某個年代的整條街（產生器函式：每完成一部分就 yield 一次，
 * 讓主執行緒可以分段執行；在 Web Worker 中則一次跑完）。
 *
 * 回傳值包含依材質合併的網格、招牌、燈火、燈籠、蒸氣、布幡、店家錨點、
 * 鏡頭遮擋範圍與碰撞資料，全部為可序列化的資料。
 */
export function* eraWorldSteps(eraId) {
  const era = getEra(eraId)
  if (!era) throw new Error(`未知的年代：${eraId}`)
  const layout = createEraLayout(era)
  const b = new PartBuilder()
  const stores = {}
  const textLanterns = []
  const extraBlockers = []
  let hasTemple = false

  buildGround(b, era.streetProps.ground)
  yield

  for (const building of layout.buildings) {
    const { config } = building
    const archetype = config.archetype ?? 'minnan'
    const builder = BUILDING_BUILDERS[archetype] ?? buildShophouse
    b.push([building.x, 0, building.z], building.rotationY)
    const result = builder(b, config) ?? {}
    if (archetype === 'temple') {
      hasTemple = true
      for (const side of [-1, 1]) {
        const p = b.transformPoint(side * (config.width / 2 - 2.4), 0, result.treeZ ?? -2.4)
        extraBlockers.push(treeBlocker({ position: [p.x, 0, p.z], scale: 0.9, collider: true }))
      }
    }
    if (building.storeId) {
      stores[building.storeId] = { anchors: storeAnchors(b, archetype, result) }
    }
    for (const lantern of result.textLanterns ?? []) {
      textLanterns.push({ ...lantern, storeId: building.storeId ?? null })
    }
    b.pop()
    yield
  }

  layout.props.forEach((prop) => placeProp(b, prop))
  for (const lamp of layout.lamps) streetLamp(b, lamp.position, { style: lamp.style, rotationY: lamp.rotationY })
  for (const line of layout.wires) wire(b, line)
  for (const line of layout.lanternStrings) lanternString(b, line)
  buildMooringPosts(b, layout.mooringPosts)
  layout.trees.forEach((tree, i) => buildTree(b, tree.position, { scale: tree.scale, seed: 10 + i, banyan: !!tree.collider }))
  yield

  const exclusions = layout.trees.map(({ position: [x, , z], scale }) => ({
    minX: x - 3.5 * scale,
    maxX: x + 3.5 * scale,
    minZ: z - 3.5 * scale,
    maxZ: z + 3.5 * scale,
  }))
  exclusions.push({ minX: -3, maxX: 13, minZ: 18, maxZ: 36 })
  buildBackdrop(b, exclusions, BACKDROP_BY_ERA[era.id])
  if (!hasTemple) buildTempleRoofs(b, DISTANT_TEMPLE.position, DISTANT_TEMPLE.rotationY)
  yield

  // 依材質合併（每種材質一段，避免單一影格卡頓）
  const batches = []
  for (const material of [...b.groups.keys()]) {
    batches.push(...b.buildMaterial(material))
    yield
  }

  const blockers = [...b.blockers, ...extraBlockers, ...layout.trees.map(treeBlocker)]

  return {
    eraId: era.id,
    batches,
    signs: b.signs,
    glows: b.glows,
    pools: b.pools,
    lanterns: b.lanterns,
    steam: b.steam,
    banners: b.banners,
    textLanterns,
    stores,
    blockers,
    collision: { walkable: layout.walkable, obstacles: layout.obstacles },
  }
}

/** 一次產生整條街（Web Worker 或測試使用） */
export function buildEraWorldSync(eraId) {
  const steps = eraWorldSteps(eraId)
  let step = steps.next()
  while (!step.done) step = steps.next()
  return step.value
}
