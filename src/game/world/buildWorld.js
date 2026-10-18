import { IcosahedronGeometry, SphereGeometry } from 'three'
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
  newsStand,
  placard,
  planter,
  posterBoard,
  signPole,
  pottedPlant,
  rickshaw,
  ropeCoil,
  streetLamp,
  vendorCart,
  vintageCar,
} from '../builders/props.js'
import { buildShophouse } from '../builders/shophouse.js'
import { buildZiYang } from '../builders/ziyang.js'
import { buildGrandRestaurant, buildTeaMansion, buildTemple } from '../builders/specials.js'
import { catenaryPoints, lanternString, wire } from '../builders/wires.js'
import { pennantShape } from '../builders/shapes.js'
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
  ziyang: buildZiYang,
}

const PROP_BUILDERS = {
  handcart: (b, p, o) => handcart(b, p.position, { ...o, load: p.load }),
  carryingPole: (b, p, o) => carryingPole(b, p.position, { ...o, content: p.content }),
  goodsPile: (b, p, o) => goodsPile(b, p.position, { ...o, kind: p.kind }),
  ropeCoil: (b, p) => ropeCoil(b, p.position),
  rickshaw: (b, p, o) => rickshaw(b, p.position, { ...o, tint: p.tint }),
  vendorCart: (b, p, o) => vendorCart(b, p.position, { ...o, content: p.content }),
  vintageCar: (b, p, o) => vintageCar(b, p.position, { ...o, tint: p.tint }),
  bicycle: (b, p, o) => bicycle(b, p.position, o),
  flowerPot: (b, p, o) => flowerPot(b, p.position, o),
  bench: (b, p, o) => bench(b, p.position, { ...o, modern: p.modern }),
  cargoTricycle: (b, p, o) => cargoTricycle(b, p.position, o),
  foodStall: (b, p, o) => foodStall(b, p.position, { ...o, canopy: p.canopy }),
  planter: (b, p, o) => planter(b, p.position, o),
  aBoard: (b, p, o) => aBoard(b, p.position, o),
  placard: (b, p, o) => placard(b, p.position, { ...o, text: p.text }),
  signPole: (b, p, o) => signPole(b, p.position, { ...o, text: p.text, style: p.style, height: p.height }),
  newsStand: (b, p, o) => newsStand(b, p.position, o),
  posterBoard: (b, p, o) => posterBoard(b, p.position, o),
  pottedPlant: (b, p, o) => pottedPlant(b, p.position, { seed: o.seed, size: p.size ?? 1 }),
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

/**
 * 遠景與節慶裝飾（沒有碰撞，只在精緻模式顯示）：
 * - bunting   跨街的三角布旗串
 * - festoon   宴席燈飾（一串小燈泡）
 * - flowerBox 陽臺或窗臺上的花箱
 */
function placeDecoration(b, item) {
  if (item.type === 'bunting') {
    const { from, to, sag = 0.5, count = 12, colors = ['#b8463a', '#d9b25c', '#efe3c8', '#5f7f6b'] } = item
    const points = catenaryPoints(from, to, sag, count * 2)
    wire(b, { from, to, sag, radius: 0.01, tint: '#4a3a2e', segments: count * 2 })
    for (let k = 0; k < count; k++) {
      const p = points[k * 2 + 1]
      const q = points[k * 2 + 2] ?? p
      const angle = Math.atan2(q.z - p.z, q.x - p.x)
      b.group([p.x, p.y, p.z], -angle, () => {
        b.extrude('cloth', pennantShape(0.34, 0.42), 0.01, { position: [-0.17, 0, 0], tint: colors[k % colors.length] })
      })
    }
  } else if (item.type === 'festoon') {
    const { from, to, sag = 0.3, count = 9 } = item
    const points = catenaryPoints(from, to, sag, count + 1)
    wire(b, { from, to, sag, radius: 0.008, tint: '#2f2620', segments: count + 1 })
    for (let k = 1; k <= count; k++) {
      const p = points[k]
      b.add('bulb', new SphereGeometry(0.06, 8, 6), { position: [p.x, p.y - 0.08, p.z], tint: '#fff2cf' })
    }
  } else if (item.type === 'flowerBox') {
    const [x, y, z] = item.position
    b.group([x, y, z], item.rotationY ?? 0, () => {
      b.box('wood', [item.width ?? 1.2, 0.22, 0.28], [0, 0.11, 0], { tint: '#7a5236' })
      const count = Math.max(2, Math.round((item.width ?? 1.2) / 0.3))
      for (let i = 0; i < count; i++) {
        const fx = -((item.width ?? 1.2) / 2) + 0.15 + i * (((item.width ?? 1.2) - 0.3) / Math.max(1, count - 1))
        b.add('plain', new IcosahedronGeometry(0.15, 0), { position: [fx, 0.32, 0], scale: [1, 0.8, 1], tint: i % 2 ? '#7f9a63' : '#6c8a58' })
        if (i % 2 === 0) b.add('plain', new IcosahedronGeometry(0.06, 0), { position: [fx + 0.05, 0.44, 0.08], tint: i % 4 ? '#e9c25a' : '#d0574a' })
      }
    })
  }
}

/** 店家的提示框與屋頂標記錨點（建築本地座標 → 世界座標） */
function storeAnchors(b, archetype, result) {
  // 形狀特殊的建築（例如斜切的轉角）由產生器直接給世界座標的錨點
  if (result.anchors) return result.anchors
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
    marker: anchor(0, result.markerHeight ?? result.topHeight + 3.2, STREET.walkwayDepth - 1.2),
  }
}

function treeBlocker({ position: [x, , z], scale, collider }) {
  const r = (collider ? 3.4 : 2.6) * scale
  return { minX: x - r, maxX: x + r, minY: 2.4 * scale, maxY: 7 * scale, minZ: z - r, maxZ: z + r }
}

/** 一棟建築所有遮擋方塊的外框（建築觀賞模式聚焦建築時決定立面位置與大小） */
function unionBoxes(boxes) {
  if (!boxes.length) return null
  const box = { ...boxes[0] }
  for (const item of boxes) {
    box.minX = Math.min(box.minX, item.minX)
    box.maxX = Math.max(box.maxX, item.maxX)
    box.minY = Math.min(box.minY, item.minY)
    box.maxY = Math.max(box.maxY, item.maxY)
    box.minZ = Math.min(box.minZ, item.minZ)
    box.maxZ = Math.max(box.maxZ, item.maxZ)
  }
  return box
}

/**
 * 產生某個年代的整條街（產生器函式：每完成一部分就 yield 一次，
 * 讓主執行緒可以分段執行；在 Web Worker 中則一次跑完）。
 *
 * 回傳值包含依材質合併的網格、招牌、燈火、燈籠、蒸氣、布幡、店家錨點、
 * 鏡頭遮擋範圍、每棟建築的外框與碰撞資料，全部為可序列化的資料。
 */
export function* eraWorldSteps(eraId) {
  const era = getEra(eraId)
  if (!era) throw new Error(`未知的年代：${eraId}`)
  const layout = createEraLayout(era)
  const b = new PartBuilder()
  const detail = new PartBuilder()
  const stores = {}
  const textLanterns = []
  const extraBlockers = []
  const buildings = []
  let hasTemple = false

  buildGround(b, era.streetProps.ground)
  yield

  for (const building of layout.buildings) {
    const { config } = building
    const archetype = config.archetype ?? 'minnan'
    const builder = BUILDING_BUILDERS[archetype] ?? buildShophouse
    b.push([building.x, 0, building.z], building.rotationY)
    const firstBlocker = b.blockers.length
    const result = builder(b, config) ?? {}
    const parts = b.blockers.slice(firstBlocker)
    const box = unionBoxes(parts)
    if (box) {
      const record = { id: building.id, storeId: building.storeId ?? null, rotationY: building.rotationY ?? 0, box, parts }
      // 立面不朝向本地 +z 的建築（斜切的轉角）另外指定觀賞模式聚焦的立面
      if (result.focus) record.focus = result.focus
      buildings.push(record)
    }
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
  // 遠景裝飾（街屋後方的樹、遠方天際線、年代的節慶裝飾）另外合併，流暢模式下不顯示
  layout.trees.forEach((tree, i) =>
    buildTree(tree.collider ? b : detail, tree.position, { scale: tree.scale, seed: 10 + i, banyan: !!tree.collider }),
  )
  for (const item of layout.decorations ?? []) placeDecoration(detail, item)
  yield

  const exclusions = layout.trees.map(({ position: [x, , z], scale }) => ({
    minX: x - 3.5 * scale,
    maxX: x + 3.5 * scale,
    minZ: z - 3.5 * scale,
    maxZ: z + 3.5 * scale,
  }))
  exclusions.push({ minX: -3, maxX: 13, minZ: 18, maxZ: 36 })
  buildBackdrop(b, exclusions, { ...BACKDROP_BY_ERA[era.id], skylineBuilder: detail })
  if (!hasTemple) buildTempleRoofs(b, DISTANT_TEMPLE.position, DISTANT_TEMPLE.rotationY)
  yield

  // 依材質合併（每種材質一段，避免單一影格卡頓）
  const batches = []
  for (const material of [...b.groups.keys()]) {
    batches.push(...b.buildMaterial(material))
    yield
  }

  const detailBatches = []
  for (const material of [...detail.groups.keys()]) {
    detailBatches.push(...detail.buildMaterial(material))
    yield
  }

  const blockers = [...b.blockers, ...extraBlockers, ...layout.trees.map(treeBlocker)]

  return {
    eraId: era.id,
    batches,
    detailBatches,
    signs: b.signs,
    glows: b.glows,
    pools: b.pools,
    lanterns: b.lanterns,
    steam: b.steam,
    banners: b.banners,
    textLanterns,
    stores,
    blockers,
    buildings,
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
