import { TEMPLE_STALL, TEMPLE_STALL_HOTSPOTS } from '../../data/squidSoupLayout.js'
import { conditionTint } from './condition.js'
import { shade } from './props.js'
import { bigPot, bowlStack, ladle, soupSpoon, squidGeng, toppingTray } from './squidSoupWares.js'
import { contactShadow } from './contactShadow.js'

/**
 * 1945–1980「庶民生活」：慈聖宮廟埕旁的魷魚羹攤（飲食文化情境示意，不是特定的店家，也不是老潘的前身）。
 *
 * 木框攤台與金屬工作面、四根竹竿撐起的簡單帆布棚、大湯鍋與長柄湯勺、疊碗、配料盤、展示的一碗魷魚羹，
 * 以及兩張小方桌與木凳。招牌只寫「魷魚羹」。沒有室內；鍋口只有少量蒸氣。
 *
 * 攤位本地座標（見 data/squidSoupLayout.js）：原點在攤台正面的中央地面，+z 朝客人與迪化街。
 */
const S = TEMPLE_STALL
/** 廟埕鋪面的高度（攤位與桌椅放在鋪面上） */
const G = 0.06
const WOOD = '#8a6446'
const WOOD_DARK = '#5e4230'
const CANVAS = '#d9cfb6'
const BOWL = '#f3efe4'
const BOWL_RIM = '#2f5f9e'

function counterTop() {
  return G + S.counter.height
}

/** 木框攤台：四根柱腳、上下橫框、正面直板、下層置物板與金屬工作面 */
function counter(b, tint) {
  const { half, depth, height } = S.counter
  const top = counterTop()
  const back = -depth
  contactShadow(b, 0, G, back / 2, half * 2, depth)
  for (const x of [-half + 0.04, half - 0.04]) {
    for (const z of [back + 0.04, -0.04]) b.box('wood', [0.06, height - 0.03, 0.06], [x, G + (height - 0.03) / 2, z], { tint: tint(WOOD_DARK) })
  }
  // 上下橫框
  for (const y of [G + 0.12, top - 0.1]) {
    b.box('wood', [half * 2, 0.05, 0.05], [0, y, -0.02], { tint: tint(WOOD_DARK) })
    b.box('wood', [half * 2, 0.05, 0.05], [0, y, back + 0.02], { tint: tint(WOOD_DARK) })
    for (const x of [-half + 0.02, half - 0.02]) b.box('wood', [0.05, 0.05, depth], [x, y, back / 2], { tint: tint(WOOD_DARK) })
  }
  // 正面與兩側的直板（板與板之間留一點縫）
  const planks = 6
  const w = (half * 2 - 0.1) / planks
  for (let i = 0; i < planks; i++) {
    b.box('wood', [w - 0.012, height - 0.26, 0.02], [-half + 0.05 + w * (i + 0.5), G + 0.14 + (height - 0.26) / 2, -0.012], { tint: tint(shade(WOOD, 0.94 + (i % 3) * 0.04)) })
  }
  for (const s of [-1, 1]) b.box('wood', [0.02, height - 0.26, depth - 0.06], [s * (half - 0.012), G + 0.14 + (height - 0.26) / 2, back / 2], { tint: tint(WOOD) })
  // 下層置物板與上面的水桶、碗籃
  b.box('wood', [half * 2 - 0.08, 0.025, depth - 0.08], [0, G + 0.15, back / 2], { tint: tint(WOOD) })
  b.cylinder('plain', 0.14, 0.12, 0.26, 12, [half - 0.3, G + 0.29, back / 2], { tint: '#6f7f86' })
  b.cylinder('bamboo', 0.17, 0.15, 0.16, 12, [-half + 0.32, G + 0.24, back / 2], { tint: '#c7a874' })
  // 金屬工作面（鍍鋅鐵皮，四邊略為下折）
  b.box('steel', [half * 2 + 0.06, 0.025, depth + 0.06], [0, top - 0.012, back / 2], { tint: tint('#c9ccca') })
  b.box('steel', [half * 2 + 0.06, 0.05, 0.012], [0, top - 0.035, 0.035], { tint: tint('#b9bdbb') })
  // 湯鍋下的煤球爐（從前面的開口看得到）
  b.cylinder('plain', 0.2, 0.22, 0.26, 12, [S.pot.x, top - 0.2, S.pot.z], { tint: '#7a5a44' })
  b.box('plain', [0.12, 0.08, 0.02], [S.pot.x, top - 0.25, -0.008], { tint: '#2a1d16' })
  // 煤球爐的煙：從鍋邊和爐身之間冒出來
  b.addSmoke(S.pot.x + 0.22, top + 0.02, S.pot.z, 0.45)
}

/** 簡單的帆布棚：四根竹竿、前低後高的帆布、前緣的垂邊與招牌 */
function canopy(b, tint) {
  const { half, back, front, height } = S.canopy
  const rear = height + 0.14
  for (const x of [-half, half]) {
    for (const [z, h] of [[back, rear], [front, height]]) {
      b.cylinder('bamboo', 0.025, 0.03, h - G, 6, [x, G + (h - G) / 2, z], { tint: '#b69a6a' })
    }
    b.cylinder('bamboo', 0.02, 0.02, front - back + 0.12, 6, [x, (rear + height) / 2 - 0.02, (front + back) / 2], {
      rotation: [Math.PI / 2 + Math.atan2(rear - height, front - back), 0, 0],
      tint: '#a88d5f',
    })
  }
  for (const [z, h] of [[back, rear], [front, height]]) b.cylinder('bamboo', 0.02, 0.02, half * 2 + 0.1, 6, [0, h - 0.01, z], { rotation: [0, 0, Math.PI / 2], tint: '#a88d5f' })
  // 帆布（往前略為下垂）與前緣垂邊
  const run = front - back + 0.2
  const slope = Math.atan2(rear - height, front - back)
  b.box('cloth', [half * 2 + 0.24, 0.02, run], [0, (rear + height) / 2 + 0.02, (front + back) / 2], { rotation: [slope, 0, 0], tint: tint(CANVAS) })
  b.box('cloth', [half * 2 + 0.24, 0.2, 0.015], [0, height - 0.08, front + 0.1], { tint: tint(shade(CANVAS, 0.9)) })
  // 招牌：掛在前緣橫竿上的木板，只寫「魷魚羹」
  b.box('wood', [0.96, 0.36, 0.035], [0, height - 0.34, front + 0.12], { tint: tint(WOOD_DARK) })
  for (const x of [-0.36, 0.36]) b.cylinder('plain', 0.004, 0.004, 0.14, 4, [x, height - 0.1, front + 0.12], { tint: '#3a3128' })
  b.addSign({ text: '魷魚羹', style: 'painted', width: 0.88, height: 0.3, position: [0, height - 0.34, front + 0.14] })
}

/** 攤台上的器具與食品：大湯鍋、湯勺、疊碗、配料盤與展示的一碗魷魚羹 */
function wares(b, detail) {
  const top = counterTop()
  const { pot, bowl } = S
  bigPot(b, pot.x, top - 0.12, pot.z, { radius: 0.22, height: 0.34, soup: '#8d5c33', lid: null, tint: '#c3c6c3' })
  // 湯勺的勺子在湯裡，握柄斜靠在鍋口
  ladle(b, pot.x - 0.06, top + 0.12, pot.z + 0.02, { length: 0.5, rotationY: -2.4, tilt: 1.05 })
  // 鍋口的少量蒸氣
  b.addSteam(pot.x, top + 0.26, pot.z, 0.55)
  // 展示的一碗魷魚羹（藍邊白瓷碗）與湯匙
  squidGeng(b, bowl.x, top, bowl.z, { seed: 21, bowl: { tint: BOWL, rim: BOWL_RIM } })
  soupSpoon(detail, bowl.x + 0.05, top + 0.055, bowl.z + 0.02, { rotationY: 0.5 })
  // 疊碗與配料盤（魷魚片、魚漿塊、葉菜）
  bowlStack(b, -0.66, top, -0.2, { count: 6, tint: BOWL, rim: BOWL_RIM })
  bowlStack(b, -0.66, top, -0.48, { count: 4, tint: BOWL, rim: BOWL_RIM })
  toppingTray(b, -0.4, top, -0.52, { kind: 'squid', seed: 22 })
  toppingTray(b, -0.12, top, -0.52, { kind: 'paste', seed: 23, width: 0.2 })
  toppingTray(detail, 0.68, top, -0.12, { kind: 'greens', seed: 24, width: 0.16, depth: 0.14 })
}

/** 兩張小方桌與木凳；桌上各一個筷筒 */
function tables(b, detail, tint) {
  const h = 0.68
  for (const [i, table] of S.tables.entries()) {
    const t = S.tableHalf
    b.box('wood', [t * 2, 0.035, t * 2], [table.x, G + h, table.z], { tint: tint(shade(WOOD, 1.08)) })
    contactShadow(b, table.x, G, table.z, t * 2 - 0.06)
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box('wood', [0.04, h, 0.04], [table.x + sx * (t - 0.04), G + h / 2, table.z + sz * (t - 0.04)], { tint: tint(WOOD_DARK) })
    }
    b.box('wood', [t * 2 - 0.08, 0.03, 0.03], [table.x, G + 0.18, table.z], { tint: tint(WOOD_DARK) })
    // 木凳：方形凳面與四支腳
    for (const sz of [-1, 1]) {
      const z = table.z + sz * S.stoolOffset
      const x = table.x + (i % 2 ? 0.03 : -0.03) * sz
      b.box('wood', [0.32, 0.04, 0.26], [x, G + 0.42, z], { tint: tint(shade(WOOD, 1.12)) })
      contactShadow(b, x, G, z, 0.26, 0.2)
      for (const lx of [-0.12, 0.12]) {
        for (const lz of [-0.09, 0.09]) b.box('wood', [0.035, 0.42, 0.035], [x + lx, G + 0.21, z + lz], { tint: tint(WOOD_DARK) })
      }
    }
    // 筷筒與一支湯匙（精緻模式）
    detail.cylinder('bamboo', 0.035, 0.032, 0.12, 8, [table.x + 0.15, G + h + 0.078, table.z - 0.12], { tint: '#c7a874' })
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      detail.cylinder('wood', 0.004, 0.004, 0.22, 4, [table.x + 0.15 + Math.cos(a) * 0.015, G + h + 0.14, table.z - 0.12 + Math.sin(a) * 0.015], { tint: '#b88a58' })
    }
  }
}

/**
 * 攤位的遮擋方塊（鏡頭與點選）：攤台、帆布棚的頂與垂邊、招牌、兩張桌子；
 * 帆布棚只用棚頂、垂邊與招牌的範圍，從高處往下看時，點攤台上的那一碗不會被棚子的方塊擋住。
 * 展示的那一碗另外成為一個可以點選、聚焦的目標（點它開啟「一碗魷魚羹」）。
 */
function registerBlockers(b) {
  const { half, depth } = S.counter
  const top = counterTop()
  b.addBlocker(-half - 0.04, half + 0.04, 0, top, -depth - 0.04, 0.04)
  b.addBlocker(-S.canopy.half - 0.12, S.canopy.half + 0.12, S.canopy.height - 0.18, S.canopy.height + 0.2, S.canopy.back - 0.1, S.canopy.front + 0.18)
  b.addBlocker(-0.5, 0.5, S.canopy.height - 0.53, S.canopy.height - 0.16, S.canopy.front + 0.08, S.canopy.front + 0.16)
  for (const table of S.tables) b.addBlocker(table.x - S.tableHalf, table.x + S.tableHalf, 0, G + 0.72, table.z - S.tableHalf, table.z + S.tableHalf)
  const start = b.blockers.length
  b.addBlocker(S.bowl.x - 0.13, S.bowl.x + 0.13, top, top + 0.16, S.bowl.z - 0.13, S.bowl.z + 0.13)
  return { bowl: { start, end: b.blockers.length } }
}

export function buildTempleSquidStall(b, cfg = {}, detail = b) {
  const condition = cfg.condition ?? 'aged'
  const tint = (hex) => conditionTint(hex, condition)
  counter(b, tint)
  canopy(b, tint)
  wares(b, detail)
  tables(b, detail, tint)
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
  const top = counterTop()
  const stall = TEMPLE_STALL_HOTSPOTS.find((item) => item.id === 'stall')
  return {
    groundHeight: S.canopy.height,
    topHeight: S.canopy.height + 0.2,
    anchors: { prompt: local(...stall.prompt), marker: local(0, S.canopy.height + 1.4, 0) },
    // 觀賞模式聚焦攤位：從街邊斜看攤台、帆布棚與招牌
    focus: {
      center: toWorld(0, 0.3),
      forward: dir(0, 1),
      width: 2.6,
      height: 2.5,
      viewHeight: 1.3,
      maxDistance: 5.5,
      maxPitch: 0.45,
      maxYawOffset: 0.7,
    },
    subStores: [
      {
        id: 'temple-squid-stall-bowl',
        storeId: 'temple-squid-stall',
        detail: true,
        hotspot: 'bowl',
        range: ranges.bowl,
        focus: {
          center: toWorld(S.bowl.x, S.bowl.z + 0.1),
          forward: dir(0, 1),
          width: 0.7,
          height: 0.45,
          viewHeight: top + 0.08,
          maxDistance: 2.1,
          maxPitch: 0.75,
          maxYawOffset: 0.6,
        },
      },
    ],
  }
}

/** 攤位的障礙物（世界座標）：攤台與後方的竹竿、前方的兩根竹竿、兩張桌子連同前後的木凳 */
export function templeSquidStallCollision(config, transform) {
  const rect = (x0, x1, z0, z1) => {
    const a = transform(x0, z0)
    const c = transform(x1, z1)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  // 攤台連同後方的兩根竹竿
  const obstacles = [rect(-S.canopy.half - 0.05, S.canopy.half + 0.05, S.canopy.back - 0.05, 0.05)]
  for (const x of [-S.canopy.half, S.canopy.half]) obstacles.push(rect(x - 0.06, x + 0.06, S.canopy.front - 0.06, S.canopy.front + 0.06))
  for (const table of S.tables) {
    obstacles.push(rect(table.x - S.tableHalf - 0.02, table.x + S.tableHalf + 0.02, table.z - S.stoolOffset - 0.15, table.z + S.stoolOffset + 0.15))
  }
  return { walkable: [], obstacles }
}
