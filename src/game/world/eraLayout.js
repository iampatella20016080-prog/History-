import { PIER, PLAZA, STREET } from '../config.js'
import { getShop, getShopBuilding, getShopsByEra } from '../../data/shops.js'
import { genericBuildingConfig } from './lineage.js'
import { getLotPlan } from './lots.js'
import { templeCollision } from '../builders/specials.js'
import { ziYangCollision } from '../builders/ziyang.js'
import { yongleCollision, yongleFootprint } from '../builders/yongleMarket.js'
import { actionBarCollision, actionBarFootprint } from '../builders/actionBar.js'
import { huangYujieCollision, huangYujieFootprint } from '../builders/huangYujieExterior.js'
import { luguoCollision, luguoFootprint } from '../builders/luguoCafe.js'
import { cafeObstacles } from '../builders/luguoCafeInterior.js'
import { templeSquidStallCollision } from '../builders/templeSquidStall.js'
import { laoPanCollision, laoPanFootprint } from '../builders/laoPanExterior.js'
import { templeMiTaiMuStallCollision } from '../builders/templeMiTaiMuStall.js'
import { templeDouhuaStallCollision } from '../builders/templeDouhuaStall.js'
import { templeKuehStallCollision } from '../builders/templeKuehStall.js'
import { yongleMiTaiMuCollision, yongleMiTaiMuFootprint } from '../builders/yongleMiTaiMuExterior.js'
import { riceAndShineCollision } from '../builders/riceAndShine/riceAndShineExterior.js'

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
    // 江山樓前的說明牌（歷史情境重建）
    { type: 'placard', position: [-10.2, 0, 2.38], rotationY: 2.5, text: '江山樓｜歷史情境重建' },
    { type: 'rickshaw', position: [-20.6, 0, 1.85], rotationY: Math.PI + 0.1, tint: '#6a3b2e' },
    { type: 'rickshaw', position: [7.5, 0, -1.8], rotationY: 0.15, tint: '#3e4f48' },
    { type: 'rickshaw', position: [-38.5, 0, 3.6], rotationY: 2.2, tint: '#5b4436' },
    { type: 'rickshaw', position: [27.2, 0, 1.9], rotationY: Math.PI - 0.12, tint: '#6a3b2e' },
    { type: 'pottedPlant', position: [-17.0, 0, -2.55] },
    { type: 'pottedPlant', position: [2.9, 0, -2.55], size: 0.9 },
    { type: 'pottedPlant', position: [19.6, 0, 2.55], size: 1.1 },
    { type: 'pottedPlant', position: [-29.4, 0, 2.55] },
    { type: 'vendorCart', position: [-25.5, 0, 2.0], rotationY: 0.05, content: 'peanuts' },
    { type: 'vendorCart', position: [21.5, 0, -2.0], rotationY: Math.PI - 0.1, content: 'beans' },
    { type: 'goodsPile', position: [-41.5, 0, -6.6], rotationY: 0.1, kind: 'tea' },
    { type: 'goodsPile', position: [-39.4, 0, -6.8], rotationY: -0.2, kind: 'crates' },
    { type: 'goodsPile', position: [-42.4, 0, 5.2], rotationY: -0.2, kind: 'tea' },
    { type: 'ropeCoil', position: [-47.5, 0, 1.0] },
  ],
  modern: [
    { type: 'vintageCar', position: [16.5, 0, 1.75], rotationY: Math.PI, tint: '#6f8a7e' },
    // 河岸廣場邊的汽車停靠處、路邊的招牌桿、報紙架與海報欄（不塞滿，留出步行空間）
    { type: 'vintageCar', position: [-37.4, 0, 6.0], rotationY: -Math.PI / 2 + 0.08, tint: '#9a6a52' },
    { type: 'signPole', position: [-14.2, 0, -2.55], rotationY: 0.0, text: '喫茶', style: 'deco', height: 2.5 },
    { type: 'signPole', position: [13.6, 0, 2.55], rotationY: Math.PI, text: '洋服', style: 'lacquer', height: 2.15 },
    { type: 'signPole', position: [31.7, 0, -2.55], rotationY: 0.0, text: '藥局', style: 'vertical', height: 2.7 },
    { type: 'newsStand', position: [-34.6, 0, -2.25], rotationY: Math.PI / 2 },
    { type: 'posterBoard', position: [-41.9, 0, 7.55], rotationY: Math.PI },
    { type: 'pottedPlant', position: [0.9, 0, -2.55], size: 0.9 },
    { type: 'pottedPlant', position: [20.0, 0, 2.55] },
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
    // 停在涼州街邊（不擋住從河岸廣場走進涼州街的路）
    { type: 'bicycle', position: [-37.95, 0, -12.6], rotationY: Math.PI / 2 },
    { type: 'bicycle', position: [-37.95, 0, -13.5], rotationY: Math.PI / 2 + 0.06 },
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
  placard: [1.25, 0.22],
  signPole: [0.3, 0.3],
  newsStand: [0.5, 0.25],
  posterBoard: [0.85, 0.15],
  pottedPlant: [0.3, 0.3],
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

/**
 * 酒樓年代的燈籠串（跨街）：三串、每串四到五盞，大小、高度與間距各不相同；
 * 刻意避開江山樓正前方，讓地標立面保持清楚。
 */
function lanternStrings() {
  return [
    { from: [-25.6, 5.9, -2.9], to: [-24.4, 5.6, 2.9], sag: 0.75, count: 5, scales: [0.52, 0.64, 0.56, 0.68, 0.5], offsets: [0.1, -0.15, 0.05, 0.12, -0.1], drops: [0, 0.12, 0, 0.2, 0.05] },
    { from: [6.8, 5.4, -2.9], to: [5.6, 5.7, 2.9], sag: 1.0, count: 4, scales: [0.6, 0.48, 0.62, 0.5], offsets: [-0.12, 0.08, -0.05, 0.15], drops: [0.1, 0, 0.18, 0] },
    { from: [24.0, 6.1, -2.9], to: [25.6, 5.8, 2.9], sag: 0.85, count: 5, scales: [0.5, 0.6, 0.72, 0.6, 0.48], offsets: [0.08, 0, -0.1, 0.06, 0.14], drops: [0.06, 0.15, 0, 0.1, 0.2] },
  ]
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

/** 立面組合的特徵（用來避免相鄰兩棟一模一樣） */
export function facadeSignature(config) {
  const material = config.archetype === 'minnan' ? (config.floors === 2 ? config.upper : config.ground) : config.facade ?? ''
  return `${config.archetype}|${config.floors ?? ''}|${material ?? ''}`
}

/**
 * 酒樓年代：同一側相鄰的兩棟一般街屋若立面組合相同，換掉後一棟的牆面材料
 * （洋樓在紅磚／灰泥之間切換，閩南街屋在紅磚／白灰之間切換）。只調整外觀，不改變地段。
 */
function diversifyRows(buildings) {
  const rows = new Map()
  for (const building of buildings) {
    const key = building.z.toFixed(1)
    if (!rows.has(key)) rows.set(key, [])
    rows.get(key).push(building)
  }
  for (const row of rows.values()) {
    row.sort((a, b) => a.x - b.x)
    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1].config
      const config = row[i].config
      if (row[i].storeId || facadeSignature(prev) !== facadeSignature(config)) continue
      if (config.archetype === 'baroque') {
        const brick = config.facade !== 'brick'
        config.facade = brick ? 'brick' : 'stucco'
        config.windowStyles = brick ? ['segment', 'rect'] : ['arch', 'arch']
        config.parapet = brick ? 'balustrade' : 'scroll'
      } else if (config.archetype === 'minnan') {
        const key = config.floors === 2 ? 'upper' : 'ground'
        config[key] = config[key] === 'brick' ? 'plaster' : 'brick'
      }
    }
  }
}

const MODERN_ORDER = ['restaurant', 'cafe', 'tailor', 'pharmacy', 'tea', 'cloth']
const MODERN_WORDS = { restaurant: '洋食', cafe: '喫茶', tailor: '洋服', pharmacy: '藥局', tea: '茶行', cloth: '布行' }

/**
 * 摩登年代的街區節奏：
 * - 店種平均分配（西餐廳、喫茶、洋服、藥局、茶行、布行），同一側相鄰的店不重複；
 *   閩南舊店屋只當茶行、布行或藥局，Art Deco 樓較常是西餐廳、喫茶與洋服店
 * - 每一排兩端若是 Art Deco 樓，朝外的牆角做成弧角
 */
const MODERN_ALLOWED = {
  minnan: ['tea', 'cloth', 'pharmacy'],
  deco: ['restaurant', 'cafe', 'tailor', 'pharmacy', 'cloth'],
  baroque: MODERN_ORDER,
}

function arrangeModernRows(buildings) {
  const rows = new Map()
  for (const building of buildings) {
    const key = building.z.toFixed(1)
    if (!rows.has(key)) rows.set(key, [])
    rows.get(key).push(building)
  }
  const used = Object.fromEntries(MODERN_ORDER.map((type) => [type, 0]))
  const ordered = [...rows.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
  for (const [, row] of ordered) {
    row.sort((a, b) => a.x - b.x)
    let previous = null
    row.forEach((building, index) => {
      const config = building.config
      if (building.storeId || !config.shopType) {
        previous = null
        return
      }
      const allowed = MODERN_ALLOWED[config.archetype] ?? MODERN_ORDER
      const options = allowed.filter((type) => type !== previous)
      // 使用次數最少的店種；同樣少時依原本（亂數）的店種與位置輪替
      const offset = index + Math.round(building.x)
      options.sort((p, q) => used[p] - used[q] || (p === config.shopType ? -1 : q === config.shopType ? 1 : 0) || ((MODERN_ORDER.indexOf(p) + offset) % 6) - ((MODERN_ORDER.indexOf(q) + offset) % 6))
      const type = options[0]
      used[type]++
      previous = type
      config.shopType = type
      if (config.sign) config.sign = { ...config.sign, text: MODERN_WORDS[type] }
      if (config.archetype === 'minnan') config.goods = type === 'tea' ? 'tea' : type === 'cloth' ? 'cloth' : 'jars'
      else config.cafe = type === 'cafe' && config.cafe !== false
    })
    if (row.length < 2) continue
    // 兩端的弧角（本地 +x 方向在世界座標中的朝向依建築旋轉而定）
    for (const [building, worldSide] of [[row[0], -1], [row[row.length - 1], 1]]) {
      if (building.storeId || building.config.archetype !== 'deco') continue
      const localPlusX = Math.cos(building.rotationY)
      building.config.roundCorner = worldSide * localPlusX > 0 ? 'right' : 'left'
    }
  }
}

/** 形狀特殊的店家建築（以 shop.site 指定位置）額外的可行走範圍與障礙物 */
const SITE_COLLISION = {
  ziyang: ziYangCollision,
  'yongle-market': yongleCollision,
  'action-bar': actionBarCollision,
  // 小藝埕：騎樓、32巷、樓梯（看不見的斜面）與二樓；二樓的家具障礙物來自店內的家具配置
  'luguo-cafe': (config, transform) => {
    const collision = luguoCollision(config, transform)
    return { walkable: collision.walkable, obstacles: [...collision.obstacles, ...cafeObstacles(transform)] }
  },
  // 廟口的魷魚羹攤：攤台、竹竿與桌椅（可行走範圍是原本的廟埕）
  'temple-squid-stall': templeSquidStallCollision,
  // 老潘魷魚羹：騎樓與一樓店內；攤車、工作區、桌椅、貓與冰箱
  'lao-pan': laoPanCollision,
  // 廟口的米苔目攤：攤台、竹竿、桌椅與站著的人物（可行走範圍是原本的廟埕）
  'temple-mi-tai-mu-stall': templeMiTaiMuStallCollision,
  // 廟口的豆花攤與糕粿攤：推車／矮桌、攤販操作的空間（到廟埕的矮牆）與木凳
  'temple-douhua-stall': templeDouhuaStallCollision,
  'temple-kueh-stall': templeKuehStallCollision,
  // 永樂米苔目：騎樓與一樓店內；機車、外帶區、桌椅、站著的人物與後方的櫃台
  'yong-le-mi-tai-mu': yongleMiTaiMuCollision,
  // 黃玉階文史館：騎樓、通往豆花店騎樓的拱門與一樓展間；柱、花槽、醬缸、展示牆、層架、長桌與茶席
  'huang-yujie-museum': huangYujieCollision,
}
/** 佔地較大的店家建築（含巷子）：範圍內不產生遠景房屋與遠景的樹 */
const SITE_FOOTPRINT = { 'yongle-market': yongleFootprint, 'action-bar': actionBarFootprint, 'luguo-cafe': luguoFootprint, 'lao-pan': laoPanFootprint, 'yong-le-mi-tai-mu': yongleMiTaiMuFootprint, 'huang-yujie-museum': huangYujieFootprint }

function siteTransform({ x, z, rotationY = 0 }) {
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  return (lx, lz) => ({ x: x + lx * cos + lz * sin, z: z - lx * sin + lz * cos })
}

/**
 * 這個年代以 site 指定位置的店家（例如滋養豆餡舖的轉角建築）：
 * 只在店家出現的年代取代 site.replaces 列出的一般地段，其他年代的地段完全不變。
 */
function siteShops(era) {
  return getShopsByEra(era)
    .filter((shop) => shop.site)
    .map((shop) => ({ shop, config: getShopBuilding(shop, era.id) }))
    .filter((item) => item.config)
}

export function createEraLayout(era) {
  const plan = getLotPlan()
  const buildings = []
  const extraWalkable = []
  const extraObstacles = []
  const backdropExclusions = []
  const sites = siteShops(era)
  const replaced = new Set(sites.flatMap(({ shop }) => shop.site.replaces ?? []))

  for (const lot of plan.lots) {
    if (replaced.has(lot.id)) continue
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
        // 迪化街329號店屋（稻舍）：同一個地段，依年代的 variant 決定能不能走進去（騎樓、前進、天井、後進、樓梯與二樓）
        if (config.archetype === 'rice-and-shine') {
          const cos = Math.cos(lot.rotationY)
          const sin = Math.sin(lot.rotationY)
          const transform = (x, z) => ({ x: lot.x + x * cos + z * sin, z: lot.z - x * sin + z * cos })
          const collision = riceAndShineCollision(config, transform)
          extraWalkable.push(...collision.walkable)
          extraObstacles.push(...collision.obstacles)
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

  for (const { shop, config } of sites) {
    const { site } = shop
    buildings.push({
      id: `site-${shop.id}`,
      x: site.x,
      z: site.z,
      rotationY: site.rotationY ?? 0,
      storeId: shop.id,
      config: { litWindows: era.lighting.glow > 0.5 ? 0.85 : 0.4, ...config },
    })
    const collision = SITE_COLLISION[config.archetype]?.(config, siteTransform(site))
    if (collision) {
      extraWalkable.push(...collision.walkable)
      extraObstacles.push(...collision.obstacles)
    }
    const footprint = SITE_FOOTPRINT[config.archetype]?.(siteTransform(site))
    if (footprint) backdropExclusions.push(footprint)
  }

  if (era.id === 'banquet') diversifyRows(buildings)
  if (era.id === 'modern') arrangeModernRows(buildings)

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
  // 遠景的樹不能長在店家建築與巷子裡（只影響有這些店家的年代）
  const trees = BASE_TREES.filter(({ position: [x, , z] }) => !backdropExclusions.some((r) => x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ))
  for (const tree of trees) {
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
    trees,
    mooringPosts: MOORING_POSTS,
    backdropExclusions,
  }
}
