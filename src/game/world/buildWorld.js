import { STREET } from '../config.js'
import { PartBuilder } from '../builders/PartBuilder.js'
import {
  buildBackdrop,
  buildGround,
  buildMooringPosts,
  buildTempleRoofs,
  buildTree,
} from '../builders/environment.js'
import { carryingPole, goodsPile, handcart, ropeCoil } from '../builders/props.js'
import { buildShophouse } from '../builders/shophouse.js'
import { createStreetLayout } from './layout.js'
import { getShopPlacement } from './placement.js'

/**
 * 建築類型 → 產生器。之後加入市場、酒樓等不同形式的建築時，
 * 在這裡註冊新的產生器，並於店家資料的 building.type 指定即可。
 */
export const BUILDING_BUILDERS = {
  shophouse: buildShophouse,
}

const TEMPLE = { position: [6, 0, 25], rotationY: Math.PI }

function placeProp(b, prop) {
  const options = { rotationY: prop.rotationY ?? 0, seed: Math.round(prop.position[0] * 13 + prop.position[2] * 7) }
  switch (prop.type) {
    case 'handcart':
      handcart(b, prop.position, { ...options, load: prop.load })
      break
    case 'carryingPole':
      carryingPole(b, prop.position, { ...options, content: prop.content })
      break
    case 'goodsPile':
      goodsPile(b, prop.position, { ...options, kind: prop.kind })
      break
    case 'ropeCoil':
      ropeCoil(b, prop.position)
      break
    default:
      break
  }
}

function hashString(text) {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return h >>> 0
}

/**
 * 產生整個場景所需的幾何與資料：
 * 背景街景（合併網格）、招牌、店家建築、碰撞範圍與鏡頭遮擋範圍。
 */
export function buildWorld(shops) {
  const layout = createStreetLayout(shops)
  const b = new PartBuilder()
  const signs = []

  buildGround(b)
  for (const building of layout.buildings) {
    const builder = BUILDING_BUILDERS[building.config.type] ?? buildShophouse
    b.push([building.x, 0, building.z], building.rotationY)
    const result = builder(b, building.config)
    result.signs.forEach((sign, i) => signs.push({ ...sign, id: `${building.id}-${i}` }))
    b.pop()
  }
  layout.props.forEach((prop) => placeProp(b, prop))
  buildMooringPosts(b, layout.mooringPosts)
  layout.trees.forEach((tree, i) => buildTree(b, tree.position, { scale: tree.scale, seed: 10 + i, banyan: !!tree.collider }))

  const exclusions = layout.trees.map(({ position: [x, , z], scale }) => ({
    minX: x - 3.5 * scale,
    maxX: x + 3.5 * scale,
    minZ: z - 3.5 * scale,
    maxZ: z + 3.5 * scale,
  }))
  exclusions.push({ minX: -1, maxX: 13, minZ: 22, maxZ: 36 })
  buildBackdrop(b, exclusions)
  buildTempleRoofs(b, TEMPLE.position, TEMPLE.rotationY)

  const batches = b.build()
  const blockers = [...b.blockers]
  // 樹冠也會擋住鏡頭
  for (const { position: [x, , z], scale, collider } of layout.trees) {
    const r = (collider ? 3.4 : 2.6) * scale
    blockers.push({ minX: x - r, maxX: x + r, minY: 2.4 * scale, maxY: 7 * scale, minZ: z - r, maxZ: z + r })
  }

  // 互動店家：獨立建模，方便之後加入店家專屬的動態效果
  const shopModels = shops.map((shop) => {
    const placement = getShopPlacement(shop)
    const sb = new PartBuilder()
    const builder = BUILDING_BUILDERS[shop.building.type] ?? buildShophouse
    sb.push([shop.position.x, 0, shop.position.z], placement.rotationY)
    const result = builder(sb, { ...shop.building, couplets: true, seed: hashString(shop.id) % 100000 })
    const anchor = (x, y, z) => sb.transformPoint(x, y, z)
    // 提示框錨點：店面上方、簷下步道外緣（沿街行走時仍在畫面內）
    const anchors = {
      prompt: anchor(0, result.groundHeight - 0.2, STREET.walkwayDepth + 0.4),
      marker: anchor(0, result.ridgeHeight + 1.6, -1.5),
    }
    sb.pop()
    blockers.push(...sb.blockers)
    return {
      shop,
      placement,
      batches: sb.build(),
      signs: result.signs.map((sign, i) => ({ ...sign, id: `${shop.id}-${i}` })),
      lanterns: result.lanterns,
      anchors,
    }
  })

  return {
    batches,
    signs,
    shopModels,
    blockers,
    collision: { walkable: layout.walkable, obstacles: layout.obstacles },
  }
}
