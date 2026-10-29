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
import { buildYongleMarket } from '../builders/yongleMarket.js'
import { buildYongleInterior } from '../builders/yongleInterior.js'
import { buildActionBar } from '../builders/actionBar.js'
import { buildActionBarInterior } from '../builders/actionBarInterior.js'
import { buildLuguoCafe } from '../builders/luguoCafe.js'
import { buildLuguoCafeInterior, cafeFurnitureBlockers, cafeSigns } from '../builders/luguoCafeInterior.js'
import { buildGrandRestaurant, buildTeaMansion, buildTemple } from '../builders/specials.js'
import { buildTempleSquidStall } from '../builders/templeSquidStall.js'
import { buildLaoPanExterior, laoPanFurnitureBlockers } from '../builders/laoPanExterior.js'
import { buildLaoPanInterior } from '../builders/laoPanInterior.js'
import { buildTempleMiTaiMuStall } from '../builders/templeMiTaiMuStall.js'
import { buildTempleDouhuaStall } from '../builders/templeDouhuaStall.js'
import { buildTempleKuehStall } from '../builders/templeKuehStall.js'
import { buildYongleMiTaiMuExterior, yongleMiTaiMuFurnitureBlockers } from '../builders/yongleMiTaiMuExterior.js'
import { buildYongleMiTaiMuInterior } from '../builders/yongleMiTaiMuInterior.js'
import { buildHuangYujieExterior, museumFurnitureBlockers } from '../builders/huangYujieExterior.js'
import { buildHuangYujieInterior } from '../builders/huangYujieInterior.js'
import { buildRiceAndShineExterior, riceFurnitureBlockers } from '../builders/riceAndShine/riceAndShineExterior.js'
import { buildRiceAndShineInterior } from '../builders/riceAndShine/riceAndShineInterior.js'
import { buildShizixuanExterior, szxFurnitureBlockers } from '../builders/shizixuan/shizixuanExterior.js'
import { buildShizixuanInterior } from '../builders/shizixuan/shizixuanInterior.js'
import { COPLANAR_DELTA, resolveAllCoplanar } from '../builders/coplanar.js'
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
  'yongle-market': buildYongleMarket,
  'action-bar': buildActionBar,
  // 小藝埕與二樓的爐鍋咖啡：建築、樓梯與店內的空殼，加上店內的招牌字、燈火與家具的鏡頭遮擋（位置與家具的配置相同）
  'luguo-cafe': (b, config) => {
    const result = buildLuguoCafe(b, config)
    cafeSigns(b)
    // 家具的遮擋方塊只給鏡頭用：不算在小藝埕這棟建築的點選範圍裡（點窗邊的椅子、吧檯上的咖啡機時仍然點到那個熱點）
    const start = b.blockers.length
    cafeFurnitureBlockers(b)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
  // 1945–1980：慈聖宮廟埕旁的魷魚羹攤（細小的擺飾放在 detail，精緻模式才顯示）
  'temple-squid-stall': buildTempleSquidStall,
  // 2000–現在：老潘魷魚羹的立面、招牌、雨棚、攤車與店內的外殼；店內家具的遮擋方塊只給鏡頭用
  'lao-pan': (b, config, detail) => {
    const result = buildLaoPanExterior(b, config, detail)
    const start = b.blockers.length
    laoPanFurnitureBlockers(b)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
  // 1945–1980：慈聖宮廟口小吃群裡的米苔目攤（攤販與客人是情境人物，見 components/NpcLayer.jsx）
  'temple-mi-tai-mu-stall': buildTempleMiTaiMuStall,
  // 1945–1980：慈聖宮廟口的豆花攤（木框推車）與糕粿攤（矮木桌），各有一位攤販（情境人物）
  'temple-douhua-stall': buildTempleDouhuaStall,
  'temple-kueh-stall': buildTempleKuehStall,
  // 2000–現在：永樂米苔目的立面、招牌、騎樓、外帶區與店內的外殼；店內家具的遮擋方塊只給鏡頭用
  'yong-le-mi-tai-mu': (b, config, detail) => {
    const result = buildYongleMiTaiMuExterior(b, config, detail)
    const start = b.blockers.length
    yongleMiTaiMuFurnitureBlockers(b)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
  // 2000–現在：黃玉階文史館（導演的豆花店北鄰）的紅磚立面、騎樓、招牌與展間的外殼；長桌、板凳與藤椅的遮擋方塊只給鏡頭用
  'huang-yujie-museum': (b, config, detail) => {
    const result = buildHuangYujieExterior(b, config, detail)
    const start = b.blockers.length
    museumFurnitureBlockers(b)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
  // 迪化街一段329號店屋（稻舍 Rice & Shine）：同一棟建築依年代的 variant 換外觀、招牌、人物與室內；家具的遮擋方塊只給鏡頭用
  'rice-and-shine': (b, config, detail) => {
    const result = buildRiceAndShineExterior(b, config, detail)
    const start = b.blockers.length
    riceFurnitureBlockers(b, config)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
  // 十字軒糕餅舖（延平北路二段68號）：同一棟建築依年代的 variant 換外觀、招牌與室內；家具的遮擋方塊只給鏡頭用
  shizixuan: (b, config, detail) => {
    const result = buildShizixuanExterior(b, config, detail)
    const start = b.blockers.length
    szxFurnitureBlockers(b, config)
    result.cameraOnly = [{ start, end: b.blockers.length }]
    return result
  },
}

/**
 * 可以走進去的建築的室內細部（按需載入：角色或鏡頭接近時才在背景產生，見 worldManager.loadEraInterior）。
 * 室內的招牌、遮擋方塊與碰撞屬於街景資料，由上面的建築產生器產生。
 */
export const BUILDING_INTERIORS = {
  'yongle-market': buildYongleInterior,
  'action-bar': buildActionBarInterior,
  'luguo-cafe': buildLuguoCafeInterior,
  'lao-pan': buildLaoPanInterior,
  'yong-le-mi-tai-mu': buildYongleMiTaiMuInterior,
  'huang-yujie-museum': buildHuangYujieInterior,
  'rice-and-shine': buildRiceAndShineInterior,
  shizixuan: buildShizixuanInterior,
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
  const interiors = []
  const viewerRegions = []
  const followAreas = []
  // 店裡會動的小動物（例如老潘的黑白貓）：位置與朝向，由元件另外繪製與播放待機動畫
  const cats = []
  // 店家與攤位裡的情境人物（例如米苔目攤的攤販與客人）：位置、面向與姿勢，由元件另外繪製與播放待機動作
  const npcs = []
  let viewerBounds = null
  let hasTemple = false

  buildGround(b, era.streetProps.ground)
  yield

  for (const building of layout.buildings) {
    const { config } = building
    const archetype = config.archetype ?? 'minnan'
    const builder = BUILDING_BUILDERS[archetype] ?? buildShophouse
    b.push([building.x, 0, building.z], building.rotationY)
    // 建築裡細小的擺飾（例如攤位桌上的筷筒）可以放在 detail：與建築同一個座標，精緻模式才顯示
    detail.push([building.x, 0, building.z], building.rotationY)
    const firstBlocker = b.blockers.length
    const result = builder(b, config, detail) ?? {}
    // 建築裡另外可以點選的店家（例如市場裡的攤位）或店裡的細部（detail，例如豆花櫃台）：
    // 它們的遮擋方塊另外成為一棟「建築」，可以點選與聚焦
    const subStores = result.subStores ?? []
    const subParts = new Set()
    // 只給鏡頭用的遮擋方塊（例如店裡的家具）：不屬於任何一棟可以點選的建築
    for (const range of result.cameraOnly ?? []) b.blockers.slice(range.start, range.end).forEach((part) => subParts.add(part))
    for (const sub of subStores) {
      const own = b.blockers.slice(sub.range.start, sub.range.end)
      own.forEach((part) => subParts.add(part))
      const subBox = unionBoxes(own)
      if (subBox) {
        const record = { id: sub.id, storeId: sub.storeId, rotationY: building.rotationY ?? 0, box: subBox, parts: own, focus: sub.focus }
        if (sub.detail) record.detail = true
        // 店裡的資訊熱點（例如爐鍋咖啡的扭蛋機）：探索時點它開啟那個熱點的介紹章節
        if (sub.hotspot) record.hotspot = sub.hotspot
        buildings.push(record)
      }
      if (sub.anchors) stores[sub.storeId] = { anchors: sub.anchors }
    }
    const parts = b.blockers.slice(firstBlocker).filter((part) => !subParts.has(part))
    const box = unionBoxes(parts)
    if (box) {
      const record = { id: building.id, storeId: building.storeId ?? null, rotationY: building.rotationY ?? 0, box, parts }
      // 立面不朝向本地 +z 的建築（斜切的轉角）另外指定觀賞模式聚焦的立面
      if (result.focus) record.focus = result.focus
      buildings.push(record)
    }
    // 室內範圍記下所屬的建築，按需載入時只產生這棟建築的室內
    if (result.interiors) interiors.push(...result.interiors.map((zone) => ({ ...zone, building: building.id })))
    if (result.viewerRegions) viewerRegions.push(...result.viewerRegions)
    if (result.followAreas) followAreas.push(...result.followAreas)
    if (result.cats) cats.push(...result.cats)
    if (result.npcs) npcs.push(...result.npcs)
    if (result.viewerBounds) viewerBounds = { ...(viewerBounds ?? {}), ...result.viewerBounds }
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
    detail.pop()
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
    // 河岸廣場的榕樹（collider）：落地的氣根只在樹幹的碰撞範圍裡（eraLayout 的半寬 0.55），精緻模式多一批短氣根
    buildTree(tree.collider ? b : detail, tree.position, {
      scale: tree.scale,
      seed: 10 + i,
      banyan: !!tree.collider,
      groundRadius: 0.55,
      detail: tree.collider ? detail : null,
    }),
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
  // 佔地較大的店家建築（例如街底的永樂市場）範圍內不產生遠景房屋
  exclusions.push(...(layout.backdropExclusions ?? []))
  buildBackdrop(b, exclusions, { ...BACKDROP_BY_ERA[era.id], skylineBuilder: detail })
  if (!hasTemple) buildTempleRoofs(b, DISTANT_TEMPLE.position, DISTANT_TEMPLE.rotationY)
  yield

  // 共面的面（Z-fighting）：重複的方塊刪掉一層，重疊的較小方塊往外推幾公釐（見 builders/coplanar.js）
  resolveAllCoplanar([b, detail])
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
    // 可以走進去的室內（鏡頭在室內拉近壓低、室內細部按需載入）與觀賞模式額外的範圍
    interiors,
    viewerRegions,
    viewerBounds,
    // 第三人稱鏡頭要貼近障礙物的範圍（窄巷；室內另外判斷）
    followAreas,
    cats,
    npcs,
  }
}

/**
 * 某個年代的室內細部（按需載入）：只產生幾何，依材質合併。
 * 位置與街景相同（同一份年代配置），所以室內的招牌、遮擋方塊與碰撞都對得上。
 * buildingId：只產生這棟建築的室內（室內範圍的 building）；省略時產生這個年代所有的室內。
 */
export function* eraInteriorSteps(eraId, buildingId = null) {
  const era = getEra(eraId)
  if (!era) throw new Error(`未知的年代：${eraId}`)
  const layout = createEraLayout(era)
  const b = new PartBuilder()
  // 細小的擺飾（例如爐鍋咖啡吧檯上的杯具與商品盒）另外合併：流暢模式下不顯示
  const detail = new PartBuilder()
  const shells = []
  for (const building of layout.buildings) {
    const builder = BUILDING_INTERIORS[building.config.archetype]
    if (!builder || (buildingId && building.id !== buildingId)) continue
    b.push([building.x, 0, building.z], building.rotationY)
    detail.push([building.x, 0, building.z], building.rotationY)
    builder(b, building.config, detail)
    detail.pop()
    b.pop()
    // 同一棟建築的外殼（已經在街景裡）：只用來比較共面，室內的面和它重疊時往室內推
    const shellBuilder = BUILDING_BUILDERS[building.config.archetype]
    if (shellBuilder) {
      const shell = new PartBuilder()
      shell.push([building.x, 0, building.z], building.rotationY)
      shellBuilder(shell, building.config, shell)
      shells.push(shell)
    }
    yield
  }
  // 外殼在街景裡可能已經往外長了 COPLANAR_DELTA：室內的面長兩倍，和外殼原本與長過的位置都錯開
  resolveAllCoplanar([b, detail], { fixed: shells, delta: COPLANAR_DELTA * 2 })
  for (const shell of shells) {
    for (const list of shell.groups.values()) {
      for (const g of list) {
        g.userData.discarded = true
        g.dispose()
      }
    }
  }
  yield
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
  return { eraId: era.id, batches, detailBatches }
}

export function buildEraInteriorSync(eraId, buildingId = null) {
  const steps = eraInteriorSteps(eraId, buildingId)
  let step = steps.next()
  while (!step.done) step = steps.next()
  return step.value
}

/** 一次產生整條街（Web Worker 或測試使用） */
export function buildEraWorldSync(eraId) {
  const steps = eraWorldSteps(eraId)
  let step = steps.next()
  while (!step.done) step = steps.next()
  return step.value
}
