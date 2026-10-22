import { KUEH_STALL, KUEH_STALL_HOTSPOTS, KUEH_STALL_NPCS } from '../../data/templeSnackLayout.js'
import { conditionTint } from './condition.js'
import { shade } from './props.js'
import {
  angKuKue,
  bambooBasket,
  bambooSteamer,
  caiTauKue,
  caoAKue,
  clothCover,
  foodTongs,
  kuehMold,
  leafPad,
  ooKueLoaf,
  ooKueSlice,
  sectionTray,
  woodBoard,
} from './templeSweetsWares.js'

/**
 * 1945–1980「庶民生活」：慈聖宮廟口的傳統糕粿攤（飲食文化情境示意，不是特定的店家，也不是好粿緣的前身）。
 *
 * 低矮的木桌式攤位（不是推車，也沒有布棚）：兩組木架腳撐起的矮木桌，桌後兩根木柱撐著木製橫牌「傳統糕粿」。
 * 桌上：一疊竹蒸籠（少量蒸氣）、分區的木托盤（草仔粿、紅龜粿，墊著葉子；一部分用乾淨的布巾蓋著）、
 * 切粿用的木板（芋粿、蘿蔔糕的整塊與切片）與食品夾；桌後是攤販，以及少量備用的籃筐與糕模。
 * 不使用好粿緣的綠色招牌、現代包裝或價目。
 *
 * 攤位本地座標（見 data/templeSnackLayout.js）：原點在矮桌正面的中央地面，+z 朝廟埕中央的通道，+x 朝廟門。
 */
const S = KUEH_STALL
const G = 0.06
const WOOD = '#9a7350'
const WOOD_DARK = '#664a33'

function tableTop() {
  return G + S.table.height
}

/** 矮木桌：厚木板桌面與兩組 A 字形的木架腳（中間一道橫木），桌下放著一個木箱 */
function table(b, detail, tint) {
  const { half, depth, height } = S.table
  const top = tableTop()
  b.box('wood', [half * 2, 0.04, depth], [0, top - 0.02, -depth / 2], { tint: tint(WOOD) })
  b.box('wood', [half * 2 + 0.01, 0.05, 0.02], [0, top - 0.045, -0.005], { tint: tint(shade(WOOD, 0.86)) })
  for (const x of [-half + 0.18, half - 0.18]) {
    for (const s of [-1, 1]) {
      b.box('wood', [0.045, height - 0.03, 0.045], [x, G + (height - 0.03) / 2, -depth / 2 + s * (depth / 2 - 0.12)], { rotation: [s * 0.16, 0, 0], tint: tint(WOOD_DARK) })
    }
    b.box('wood', [0.04, 0.04, depth - 0.12], [x, G + 0.2, -depth / 2], { tint: tint(WOOD_DARK) })
  }
  // 桌下的木箱（裝著備用的粿）
  detail.box('wood', [0.5, 0.24, 0.36], [0.1, G + 0.12, -depth / 2 - 0.02], { tint: tint('#8a6644') })
}

/** 木製橫牌「傳統糕粿」：桌子背面兩根木柱撐著的木板（黑色木框） */
function sign(b, tint) {
  const { width, height, y, z, posts } = S.sign
  for (const x of [-posts, posts]) b.box('wood', [0.05, y + height / 2 + 0.06 - G, 0.05], [x, G + (y + height / 2 + 0.06 - G) / 2, z], { tint: tint(WOOD_DARK) })
  b.box('wood', [width + 0.08, height + 0.08, 0.04], [0, y, z + 0.03], { tint: tint('#4f3826') })
  b.box('wood', [width, height, 0.045], [0, y, z + 0.035], { tint: tint('#b48a60') })
  b.addSign({ text: '傳統糕粿', style: 'wood', width: width - 0.08, height: height - 0.06, position: [0, y, z + 0.06] })
  b.addSign({ text: '傳統糕粿', style: 'wood', width: width - 0.08, height: height - 0.06, position: [0, y, z + 0.008], rotationY: Math.PI })
}

/** 桌上的竹蒸籠、分區木托盤、木板、食品夾與布巾；四種米食分盤陳列 */
function wares(b, detail) {
  const top = tableTop()
  const { steamer, tray, ooKue, caiTau } = S
  // 竹蒸籠：三層與蓋，放在一塊墊板上，籠蓋邊冒出少量蒸氣
  b.box('wood', [steamer.radius * 2 + 0.04, 0.02, steamer.radius * 2 + 0.04], [steamer.x, top + 0.01, steamer.z], { tint: '#7a5a3e' })
  const lidTop = bambooSteamer(b, steamer.x, top + 0.02, steamer.z, { radius: steamer.radius, tiers: steamer.tiers, detail })
  b.addSteam(steamer.x, lidTop + 0.05, steamer.z, 0.45)

  // 分區木托盤：左區草仔粿、右區紅龜粿（主要展示，墊著葉子）
  const floor = sectionTray(b, tray.x, top, tray.z, { width: tray.width, depth: tray.depth, sections: 2 })
  const left = tray.x - tray.width / 4
  const right = tray.x + tray.width / 4
  const rows = [tray.z + 0.1, tray.z - 0.1]
  // 草仔粿：前排兩個露出來（流暢與精緻都有），後排兩個在布巾下（精緻模式）
  for (const [i, dx] of [-0.065, 0.065].entries()) {
    leafPad(b, left + dx, floor, rows[0], { length: 0.13, width: 0.1, rotationY: 0.3 + i * 0.5, detail })
    caoAKue(b, left + dx, floor + 0.003, rows[0], { seed: 11 + i })
    leafPad(detail, left + dx, floor, rows[1], { length: 0.13, width: 0.1, rotationY: 1.2 + i * 0.4, detail })
    caoAKue(detail, left + dx, floor + 0.003, rows[1], { seed: 13 + i })
  }
  clothCover(b, left, floor + 0.054, rows[1] - 0.01, { width: 0.29, depth: 0.17, drop: 0.052, detail })
  // 紅龜粿：前排兩個（流暢與精緻都有），後排兩個（精緻模式）
  for (const [i, dx] of [-0.07, 0.07].entries()) {
    leafPad(b, right + dx, floor, rows[0], { length: 0.16, width: 0.12, rotationY: i * 0.3, detail })
    angKuKue(b, right + dx, floor + 0.003, rows[0], { rotationY: 0.05 - i * 0.1, size: 0.95 })
    leafPad(detail, right + dx, floor, rows[1], { length: 0.16, width: 0.12, rotationY: 0.4 + i * 0.3, detail })
    angKuKue(detail, right + dx, floor + 0.003, rows[1], { rotationY: -0.1 + i * 0.15, size: 0.95 })
  }
  foodTongs(b, tray.x + 0.02, top + 0.004, tray.z + tray.depth / 2 + 0.05, { rotationY: Math.PI / 2 - 0.15 })

  // 芋粿：整條與兩片厚片（灰白色、帶少量紫灰色的芋頭顆粒）
  const ooTop = woodBoard(b, ooKue.x, top, ooKue.z, { width: ooKue.width, depth: ooKue.depth, rotationY: 0.04 })
  ooKueLoaf(b, ooKue.x - 0.06, ooTop, ooKue.z - 0.02, { length: 0.13, detail })
  ooKueSlice(b, ooKue.x + 0.07, ooTop, ooKue.z + 0.03, { size: [0.1, 0.06, 0.032], lying: true, rotationY: 0.2, seed: 21, detail })
  ooKueSlice(detail, ooKue.x + 0.09, ooTop + 0.032, ooKue.z - 0.03, { size: [0.1, 0.06, 0.03], lying: true, rotationY: -0.25, seed: 22, detail })

  // 蘿蔔糕：整塊與三片切片（米白色的長方塊）
  const caiTop = woodBoard(b, caiTau.x, top, caiTau.z, { width: caiTau.width, depth: caiTau.depth, rotationY: -0.03, tint: '#c09466' })
  caiTauKue(b, caiTau.x - 0.03, caiTop, caiTau.z, { length: 0.13, slices: 3, detail })
}

/** 桌後：少量備用的籃筐（兩個疊著、一個放在地上）與糕模（放在木箱上） */
function backArea(b, detail, tint) {
  const { baskets, molds } = S
  bambooBasket(b, baskets.x, G, baskets.z, { radius: 0.2, height: 0.12 })
  bambooBasket(b, baskets.x, G + 0.12, baskets.z, { radius: 0.18, height: 0.1 })
  bambooBasket(detail, baskets.x + 0.05, G, baskets.z - 0.42, { radius: 0.17, height: 0.1 })
  b.box('wood', [0.36, 0.3, 0.3], [molds.x, G + 0.15, molds.z], { tint: tint('#7d5c3e') })
  kuehMold(b, molds.x - 0.06, G + 0.3, molds.z + 0.02, { rotationY: 0.2 })
  kuehMold(detail, molds.x + 0.08, G + 0.33, molds.z - 0.04, { rotationY: -0.4 })
}

/**
 * 遮擋方塊（鏡頭與點選）：矮桌、橫牌與兩根木柱、竹蒸籠；
 * 托盤與兩塊木板上的四種米食另外成為可以點選、聚焦的目標（點它開啟「四種傳統米食」）。
 */
function registerBlockers(b) {
  const { half, depth } = S.table
  const { width, height, y, z, posts } = S.sign
  const top = tableTop()
  b.addBlocker(-half - 0.02, half + 0.02, 0, top, -depth - 0.02, 0.02)
  b.addBlocker(-width / 2 - 0.05, width / 2 + 0.05, y - height / 2 - 0.05, y + height / 2 + 0.05, z - 0.01, z + 0.07)
  for (const x of [-posts, posts]) b.addBlocker(x - 0.04, x + 0.04, 0, y, z - 0.03, z + 0.03)
  b.addBlocker(S.steamer.x - S.steamer.radius - 0.02, S.steamer.x + S.steamer.radius + 0.02, top, top + 0.3, S.steamer.z - S.steamer.radius - 0.02, S.steamer.z + S.steamer.radius + 0.02)
  const start = b.blockers.length
  b.addBlocker(S.tray.x - S.tray.width / 2, S.caiTau.x + S.caiTau.width / 2, top, top + 0.09, S.caiTau.z - S.caiTau.depth / 2, S.tray.z + S.tray.depth / 2)
  return { trays: { start, end: b.blockers.length } }
}

/** 攤位本地座標的矩形 → 世界座標的範圍（跟隨鏡頭用） */
function followZone(b, minX, maxX, minZ, maxZ) {
  const p = b.transformPoint(minX, 0, minZ)
  const q = b.transformPoint(maxX, 0, maxZ)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
}

function stallNpcs(b) {
  return KUEH_STALL_NPCS.map((npc, i) => {
    const p = b.transformPoint(npc.x, G, npc.z)
    return { id: `temple-kueh-${npc.id}`, look: npc.look, pose: npc.pose, position: [p.x, p.y, p.z], rotationY: b.worldRotationY(npc.rotationY), phase: (0.63 + i * 0.37) % 1 }
  })
}

export function buildTempleKuehStall(b, cfg = {}, detail = b) {
  const condition = cfg.condition ?? 'aged'
  const tint = (hex) => conditionTint(hex, condition)
  table(b, detail, tint)
  sign(b, tint)
  wares(b, detail)
  backArea(b, detail, tint)
  const ranges = registerBlockers(b)

  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const top = tableTop()
  const stall = KUEH_STALL_HOTSPOTS.find((item) => item.id === 'stall')
  return {
    groundHeight: S.sign.y + S.sign.height / 2,
    topHeight: S.sign.y + S.sign.height / 2 + 0.1,
    anchors: { prompt: local(...stall.prompt), marker: local(0, S.sign.y + 1.2, 0) },
    // 觀賞模式聚焦攤位：從通道看矮桌、托盤、蒸籠與橫牌
    focus: { center: toWorld(0, 0.2), forward: dir(0, 1), width: 2.0, height: 2.2, viewHeight: 1.0, maxDistance: 4.6, maxPitch: 0.5, maxYawOffset: 0.7 },
    subStores: [
      {
        id: 'temple-kueh-trays',
        storeId: 'temple-kueh-stall',
        detail: true,
        hotspot: 'trays',
        range: ranges.trays,
        focus: {
          center: toWorld(0.1, S.tray.z + 0.15),
          forward: dir(0, 1),
          width: 1.0,
          height: 0.35,
          viewHeight: top + 0.05,
          maxDistance: 2.1,
          maxPitch: 0.85,
          maxYawOffset: 0.6,
        },
      },
    ],
    // 攤位前（客人那一側）是「貼近障礙物」的跟隨範圍：背後的榕樹樹冠與攤位很近，鏡頭停在它們前面，不會退進樹冠或布棚裡
    followAreas: [followZone(b, -1.2, 1.2, -0.2, 2.3)],
    npcs: stallNpcs(b),
  }
}

/** 攤位的障礙物（世界座標）：矮桌（連同橫牌的木柱）、桌後攤販與籃筐、糕模所在的空間（到廟埕的矮牆） */
export function templeKuehStallCollision(config, transform) {
  const rect = (x0, x1, z0, z1) => {
    const a = transform(x0, z0)
    const c = transform(x1, z1)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  const { half, depth } = S.table
  return {
    walkable: [],
    obstacles: [rect(-half - 0.05, half + 0.05, -depth - 0.1, 0.06), rect(-half - 0.15, half + 0.15, -2.9, -depth - 0.1)],
  }
}
