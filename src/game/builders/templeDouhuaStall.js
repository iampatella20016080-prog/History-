import { CylinderGeometry, TorusGeometry } from 'three'
import { DOUHUA_STALL, DOUHUA_STALL_HOTSPOTS, DOUHUA_STALL_NPCS } from '../../data/templeSnackLayout.js'
import { conditionTint } from './condition.js'
import { shade } from './props.js'
import { bowlStack } from './squidSoupWares.js'
import { douhuaBowl, douhuaBucket, flatScoop, peanutBasin, spoonBasin, syrupKettle, woodStool } from './templeSweetsWares.js'
import { contactShadow } from './contactShadow.js'

/**
 * 1945–1980「庶民生活」：慈聖宮廟口的傳統豆花攤（飲食文化情境示意，不是特定的店家，也不是導演的豆花店的前身）。
 *
 * 木框推車式的甜食攤，與魷魚羹、米苔目的大鍋熱食攤明顯不同：一端兩個木輪、另一端是腳架與推把，
 * 推車背面兩根木柱撐起小小的米白布棚，棚角掛著只寫「豆花」的米白布幌。
 * 推車上：有蓋的圓形木豆花桶與扁平的舀匙、糖水壺、配料小盆（花生）與泡著湯匙的水盆、疊碗，
 * 以及展示的兩碗豆花（原味糖水豆花、花生豆花）；推車前兩張木凳，推車後是攤販舀豆花的操作空間。
 * 沒有現代的豆花車、場記板、品牌包裝、彩色粉圓或電子菜單。
 *
 * 攤位本地座標（見 data/templeSnackLayout.js）：原點在推車正面的中央地面，+z 朝廟埕中央的通道，+x 朝迪化街。
 */
const S = DOUHUA_STALL
/** 廟埕鋪面的高度 */
const G = 0.06
const FRAME = '#7c5a3c'
const PANEL = '#c4a77c'
const TOP = '#b08458'
const CLOTH = '#ece4d0'

function cartTop() {
  return G + S.cart.height
}

/** 木框推車：四根角柱、木板車身與檯面，一端兩個木輪（輪輻與輪軸），另一端是腳架與兩支推把 */
function cart(b, tint) {
  const { half, depth, height } = S.cart
  const top = cartTop()
  const bodyBottom = G + 0.26
  contactShadow(b, 0, G, -depth / 2, half * 2, depth)
  // 車身：木板側板與正面板（中間一道橫木），木框角柱
  b.box('wood', [half * 2 - 0.04, top - 0.03 - bodyBottom, depth - 0.04], [0, (bodyBottom + top - 0.03) / 2, -depth / 2], { tint: tint(PANEL) })
  for (const z of [0, -depth]) {
    b.box('wood', [half * 2, 0.045, 0.03], [0, bodyBottom + 0.02, z], { tint: tint(FRAME) })
    b.box('wood', [half * 2, 0.03, 0.025], [0, (bodyBottom + top) / 2, z + (z ? -0.002 : 0.002)], { tint: tint(shade(FRAME, 1.1)) })
  }
  for (const x of [-half, half]) {
    for (const z of [0, -depth]) b.box('wood', [0.05, top - bodyBottom, 0.05], [x, (bodyBottom + top) / 2, z], { tint: tint(FRAME) })
  }
  // 檯面（四邊略微凸出）
  b.box('wood', [half * 2 + 0.06, 0.03, depth + 0.06], [0, top - 0.015, -depth / 2], { tint: tint(TOP) })
  b.box('wood', [half * 2 + 0.07, 0.012, 0.012], [0, top - 0.004, 0.036], { tint: tint(FRAME) })
  // 木輪：靠迪化街的一端，車身兩側各一個（輪框、輪轂與六支輪輻），中間是輪軸
  const r = S.wheel.radius
  const wy = G + r
  for (const z of [0.05, -depth - 0.05]) {
    b.add('wood', new TorusGeometry(r - 0.02, 0.022, 6, 20), { position: [S.wheel.x, wy, z], tint: tint('#6a4a30') })
    b.cylinder('wood', 0.04, 0.04, 0.06, 10, [S.wheel.x, wy, z], { rotation: [Math.PI / 2, 0, 0], tint: tint('#5a3e28') })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI
      b.box('wood', [0.018, (r - 0.03) * 2, 0.018], [S.wheel.x, wy, z], { rotation: [0, 0, a], tint: tint('#7a5838') })
    }
  }
  b.add('steel', new CylinderGeometry(0.014, 0.014, depth + 0.16, 6), { position: [S.wheel.x, wy, -depth / 2], rotation: [Math.PI / 2, 0, 0], tint: '#4a4640' })
  // 另一端的腳架（著地）與兩支推把
  for (const z of [0, -depth]) {
    b.box('wood', [0.05, bodyBottom - G + 0.02, 0.05], [-half + 0.1, (G + bodyBottom) / 2, z], { tint: tint(FRAME) })
    b.box('wood', [Math.abs(S.handle.to - S.handle.from) + 0.1, 0.04, 0.04], [(S.handle.from + S.handle.to) / 2 - 0.05, G + S.handle.height, z], { rotation: [0, 0, -0.06], tint: tint(FRAME) })
  }
  b.cylinder('wood', 0.02, 0.02, depth + 0.04, 6, [S.handle.to - 0.02, G + S.handle.height + 0.02, -depth / 2], { rotation: [Math.PI / 2, 0, 0], tint: tint('#5a3e28') })
}

/** 小型遮棚：推車背面兩根木柱、兩支斜撐與米白布棚頂；棚角掛著直寫「豆花」的米白布幌 */
function canopy(b, detail, tint) {
  const { half, back, front, height } = S.canopy
  const postX = half - 0.1
  for (const x of [-postX, postX]) {
    b.box('wood', [0.045, height - G - 0.25, 0.045], [x, G + 0.25 + (height - G - 0.25) / 2, back + 0.04], { tint: tint(FRAME) })
    // 斜撐：從柱頂往前伸到棚的前緣
    const run = front - back
    b.box('wood', [0.03, 0.03, Math.hypot(run, 0.12)], [x, height - 0.03, (front + back) / 2], { rotation: [Math.atan2(0.12, run), 0, 0], tint: tint(shade(FRAME, 1.1)) })
  }
  b.box('wood', [half * 2, 0.03, 0.03], [0, height - 0.09, front], { tint: tint(FRAME) })
  // 布棚頂（前低後高）與前緣的短垂邊
  b.box('cloth', [half * 2 + 0.1, 0.018, front - back + 0.14], [0, height + 0.005, (front + back) / 2], { rotation: [Math.atan2(0.12, front - back), 0, 0], tint: tint(CLOTH) })
  b.box('cloth', [half * 2 + 0.1, 0.09, 0.012], [0, height - 0.1, front + 0.075], { tint: tint(shade(CLOTH, 0.95)) })
  detail.box('cloth', [half * 2 + 0.1, 0.012, 0.014], [0, height - 0.15, front + 0.076], { tint: tint('#c9b896') })
  // 米白布幌：棚角斜向掛著（從通道與迪化街都看得到），只寫「豆花」
  const { x, width, height: h } = S.banner
  const top = height - 0.05
  b.group([x, 0, front + 0.02], Math.PI / 4, () => {
    b.cylinder('wood', 0.008, 0.008, width + 0.06, 6, [0, top, 0], { rotation: [0, 0, Math.PI / 2], tint: tint(FRAME) })
    b.box('cloth', [width, h, 0.008], [0, top - h / 2, 0], { tint: tint('#efe8d6') })
    for (const side of [1, -1]) {
      b.addSign({ text: '豆花', style: 'cloth', vertical: true, width: width - 0.03, height: h - 0.06, position: [0, top - h / 2 - 0.01, side * 0.006], rotationY: side > 0 ? 0 : Math.PI })
    }
  })
}

/** 推車上的器具與兩碗豆花 */
function wares(b, detail) {
  const top = cartTop()
  const { bucket, kettle, peanuts, spoons, bowls, stack } = S
  douhuaBucket(b, bucket.x, top, bucket.z, { radius: bucket.radius, height: bucket.height, open: 0.07 })
  // 扁平的舀匙：斜靠在桶口（桶蓋挪開的那一側）
  flatScoop(b, bucket.x + 0.02, top + bucket.height + 0.03, bucket.z + bucket.radius * 0.55, { rotationY: 0.4, tilt: 0.35 })
  syrupKettle(b, kettle.x, top, kettle.z, { rotationY: -0.6 })
  peanutBasin(b, peanuts.x, top, peanuts.z, { seed: 81, detail })
  spoonBasin(b, spoons.x, top, spoons.z, { detail })
  bowlStack(b, stack.x, top, stack.z, { count: 5, tint: '#f4f0e4', rim: '#2f5f9e' })
  // 展示的兩碗：原味糖水豆花、花生豆花
  for (const [i, bowl] of bowls.entries()) douhuaBowl(b, bowl.x, top, bowl.z, { seed: 90 + i, peanuts: bowl.id === 'peanut', detail })
  // 推把上掛著的擦手布（精緻模式）
  detail.box('cloth', [0.03, 0.22, 0.16], [S.handle.to + 0.12, G + S.handle.height - 0.1, -0.02], { tint: '#e9e4d6' })
}

function stools(b, tint) {
  for (const [i, stool] of S.stools.entries()) woodStool(b, stool.x, G, stool.z, { top: 0.42, tint: tint(i ? '#a37a54' : '#94704e'), rotationY: i * 0.2 - 0.1 })
}

/**
 * 遮擋方塊（鏡頭與點選）：推車車身、豆花桶、布棚頂與布幌、兩張木凳；
 * 展示的兩碗另外成為可以點選、聚焦的目標（點它開啟「兩碗豆花」），布棚只用棚頂的厚度，從高處也點得到那兩碗。
 */
function registerBlockers(b) {
  const { half, depth } = S.cart
  const { half: ch, back, front, height } = S.canopy
  const top = cartTop()
  b.addBlocker(S.handle.to - 0.04, half + 0.04, 0, top, -depth - 0.09, 0.09)
  b.addBlocker(S.bucket.x - S.bucket.radius - 0.02, S.bucket.x + S.bucket.radius + 0.02, top, top + S.bucket.height + 0.06, S.bucket.z - S.bucket.radius - 0.09, S.bucket.z + S.bucket.radius + 0.02)
  b.addBlocker(-ch - 0.05, ch + 0.05, height - 0.06, height + 0.1, back - 0.07, front + 0.09)
  b.addBlocker(S.banner.x - 0.2, S.banner.x + 0.2, height - 0.05 - S.banner.height, height - 0.04, front - 0.18, front + 0.2)
  for (const stool of S.stools) b.addBlocker(stool.x - 0.16, stool.x + 0.16, 0, G + 0.42, stool.z - 0.13, stool.z + 0.13)
  const start = b.blockers.length
  const [a, c] = S.bowls
  b.addBlocker(a.x - 0.09, c.x + 0.09, top, top + 0.1, a.z - 0.09, a.z + 0.09)
  return { bowls: { start, end: b.blockers.length } }
}

/** 攤位的人物（世界座標，見 components/NpcLayer.jsx） */
function stallNpcs(b) {
  return DOUHUA_STALL_NPCS.map((npc, i) => {
    const p = b.transformPoint(npc.x, G, npc.z)
    return { id: `temple-douhua-${npc.id}`, look: npc.look, pose: npc.pose, position: [p.x, p.y, p.z], rotationY: b.worldRotationY(npc.rotationY), phase: (0.21 + i * 0.37) % 1 }
  })
}

export function buildTempleDouhuaStall(b, cfg = {}, detail = b) {
  const condition = cfg.condition ?? 'aged'
  const tint = (hex) => conditionTint(hex, condition)
  cart(b, tint)
  canopy(b, detail, tint)
  wares(b, detail)
  stools(b, tint)
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
  const top = cartTop()
  const stall = DOUHUA_STALL_HOTSPOTS.find((item) => item.id === 'stall')
  const [a, c] = S.bowls
  return {
    groundHeight: S.canopy.height,
    topHeight: S.canopy.height + 0.15,
    anchors: { prompt: local(...stall.prompt), marker: local(0, S.canopy.height + 1.3, 0) },
    // 觀賞模式聚焦攤位：從通道斜看推車、豆花桶與布幌
    focus: { center: toWorld(0, 0.25), forward: dir(0, 1), width: 2.2, height: 2.2, viewHeight: 1.1, maxDistance: 4.8, maxPitch: 0.45, maxYawOffset: 0.7 },
    subStores: [
      {
        id: 'temple-douhua-bowls',
        storeId: 'temple-douhua-stall',
        detail: true,
        hotspot: 'bowls',
        range: ranges.bowls,
        focus: {
          center: toWorld((a.x + c.x) / 2, a.z + 0.1),
          forward: dir(0, 1),
          width: 0.6,
          height: 0.35,
          viewHeight: top + 0.06,
          // 廟埕裡觀賞鏡頭的高度上限是 2.1 m（在榕樹樹冠的方塊下）：仰角放低，鏡頭才能在 2 m 內看著食物
          maxDistance: 2.0,
          maxPitch: 0.55,
          maxYawOffset: 0.6,
        },
      },
    ],
    npcs: stallNpcs(b),
  }
}

/**
 * 攤位的障礙物（世界座標）：推車（連同木輪與推把）、推車後方攤販操作的空間（到廟埕的矮牆）、兩張木凳。
 * 客人那一側與木凳之間留出站著看豆花的空間。
 */
export function templeDouhuaStallCollision(config, transform) {
  const rect = (x0, x1, z0, z1) => {
    const a = transform(x0, z0)
    const c = transform(x1, z1)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  const { half, depth } = S.cart
  const obstacles = [
    rect(S.handle.to - 0.05, half + 0.05, -depth - 0.1, 0.1),
    // 攤販操作的空間：推車背面到廟埕的矮牆，左右略寬於遮棚（攤販站在這裡）
    rect(-S.canopy.half - 0.05, S.canopy.half + 0.05, -2.9, -depth - 0.1),
  ]
  for (const stool of S.stools) obstacles.push(rect(stool.x - 0.17, stool.x + 0.17, stool.z - 0.14, stool.z + 0.14))
  return { walkable: [], obstacles }
}
