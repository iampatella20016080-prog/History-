import { MI_TAI_MU_STALL, MI_TAI_MU_STALL_HOTSPOTS, MI_TAI_MU_STALL_NPCS } from '../../data/miTaiMuLayout.js'
import { conditionTint } from './condition.js'
import { blanchedGreens, chopsticks, dinerPlace, friedTofu, miTaiMuSoup, noodleBasin, sauceDish } from './miTaiMuWares.js'
import { shade } from './props.js'
import { bigPot, bowlStack, ladle, soupSpoon } from './squidSoupWares.js'
import { contactShadow } from './contactShadow.js'

/**
 * 1945–1980「庶民生活」：慈聖宮廟埕的米苔目攤（飲食文化情境示意，不是特定的店家，也不是永樂米苔目的前身）。
 *
 * 廟口小吃群的一攤：漆成淡綠色、磨舊的木攤台與鍍鋅鐵皮工作面，煤球爐上的大湯鍋（掀開一半的木鍋蓋、少量蒸氣），
 * 一盆生的米苔目、疊碗、展示的一碗湯米苔目與兩碟小菜；淡藍色的帆布棚，前緣掛著只寫「米苔目」的木招牌。
 * 兩張小方桌與木凳，桌上有客人的碗；攤販在攤台後招呼客人，兩位客人坐著吃，一位站在攤台旁等。沒有室內。
 *
 * 攤位本地座標（見 data/miTaiMuLayout.js）：原點在攤台正面的中央地面，+z 朝客人與迪化街。
 */
const S = MI_TAI_MU_STALL
/** 廟埕鋪面的高度（攤位與桌椅放在鋪面上） */
const G = 0.06
const PAINT = '#7f9a8c'
const PAINT_DARK = '#5f7569'
const WOOD = '#8f6a4a'
const WOOD_DARK = '#5e4230'
const CANVAS = '#a9b9c4'
const BOWL = '#f3efe4'
const BOWL_RIM = '#2f5f9e'
/** 木凳的凳面高度（坐著的客人放在這個高度上） */
const STOOL_TOP = G + 0.44

function counterTop() {
  return G + S.counter.height
}

/** 攤台：淡綠色油漆、磨出木色的邊角，正面兩片門板、下層置物板，金屬工作面；左端下方是煤球爐 */
function counter(b, tint) {
  const { half, depth, height } = S.counter
  const top = counterTop()
  const back = -depth
  contactShadow(b, 0, G, back / 2, half * 2, depth)
  b.box('wood', [half * 2, height - 0.02, depth], [0, G + (height - 0.02) / 2, back / 2], { tint: tint(PAINT) })
  // 正面的兩片門板與木條、磨舊的下緣
  for (const s of [-1, 1]) {
    b.box('wood', [half - 0.08, height - 0.3, 0.02], [s * (half / 2), G + 0.16 + (height - 0.3) / 2, 0.01], { tint: tint(shade(PAINT, 1.06)) })
    b.box('wood', [0.03, 0.12, 0.03], [s * 0.08, G + height * 0.55, 0.025], { tint: tint(PAINT_DARK) })
  }
  b.box('wood', [half * 2 + 0.02, 0.1, depth + 0.02], [0, G + 0.05, back / 2], { tint: tint(WOOD_DARK) })
  for (const x of [-half, half]) b.box('wood', [0.05, height - 0.02, 0.05], [x, G + (height - 0.02) / 2, 0.0], { tint: tint(WOOD) })
  // 金屬工作面
  b.box('steel', [half * 2 + 0.06, 0.025, depth + 0.06], [0, top - 0.012, back / 2], { tint: tint('#c9ccca') })
  b.box('steel', [half * 2 + 0.06, 0.05, 0.012], [0, top - 0.035, 0.035], { tint: tint('#b9bdbb') })
  // 湯鍋下的煤球爐（從正面的開口看得到爐口的火光）
  b.cylinder('plain', 0.2, 0.22, 0.28, 12, [S.pot.x, top - 0.22, S.pot.z], { tint: '#7a5a44' })
  b.box('plain', [0.13, 0.08, 0.02], [S.pot.x, top - 0.26, 0.022], { tint: '#2a1d16' })
  b.box('bulb', [0.08, 0.03, 0.01], [S.pot.x, top - 0.28, 0.033], { tint: '#ff9a52' })
  // 煤球爐的煙：從鍋邊和爐身之間冒出來
  b.addSmoke(S.pot.x - 0.22, top + 0.02, S.pot.z, 0.45)
  // 攤台旁的水桶與一疊木柴
  b.cylinder('plain', 0.13, 0.11, 0.3, 12, [-half - 0.2, G + 0.15, back + 0.15], { tint: '#6f7f86' })
}

/** 帆布棚：四根竹竿、淡藍色的帆布（前低後高）、前緣的垂邊與只寫「米苔目」的木招牌 */
function canopy(b, tint) {
  const { half, back, front, height } = S.canopy
  const rear = height + 0.16
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
  const run = front - back + 0.2
  const slope = Math.atan2(rear - height, front - back)
  b.box('cloth', [half * 2 + 0.24, 0.02, run], [0, (rear + height) / 2 + 0.02, (front + back) / 2], { rotation: [slope, 0, 0], tint: tint(CANVAS) })
  // 前緣的垂邊（白色的寬條紋）
  b.box('cloth', [half * 2 + 0.24, 0.18, 0.015], [0, height - 0.07, front + 0.1], { tint: tint(shade(CANVAS, 0.92)) })
  for (let i = 0; i < 6; i++) b.box('cloth', [0.16, 0.18, 0.017], [-half + 0.1 + i * ((half * 2 - 0.2) / 5), height - 0.07, front + 0.1], { tint: tint('#e9e6dc') })
  // 招牌：掛在前緣橫竿下的木板，只寫「米苔目」
  b.box('wood', [0.66, 0.32, 0.035], [0, height - 0.36, front + 0.12], { tint: tint(WOOD_DARK) })
  for (const x of [-0.26, 0.26]) b.cylinder('plain', 0.004, 0.004, 0.14, 4, [x, height - 0.12, front + 0.12], { tint: '#3a3128' })
  b.addSign({ text: '米苔目', style: 'painted', width: 0.6, height: 0.26, position: [0, height - 0.36, front + 0.14] })
}

/** 攤台上：湯鍋與湯勺、一盆生的米苔目、疊碗、展示的一碗湯米苔目與兩碟小菜、醬油膏與筷筒 */
function wares(b, detail) {
  const top = counterTop()
  const { pot, noodles, bowl, sides } = S
  bigPot(b, pot.x, top - 0.12, pot.z, { radius: 0.24, height: 0.36, soup: '#d6b585', lid: null, tint: '#c3c6c3' })
  // 掀開一半的木鍋蓋，斜靠在鍋子的後緣
  b.cylinder('wood', 0.25, 0.25, 0.025, 16, [pot.x, top + 0.34, pot.z - 0.2], { rotation: [-1.15, 0, 0], tint: '#a07a52' })
  b.box('wood', [0.16, 0.04, 0.03], [pot.x, top + 0.38, pot.z - 0.17], { rotation: [-1.15, 0, 0], tint: '#6e4c32' })
  ladle(b, pot.x + 0.08, top + 0.14, pot.z + 0.04, { length: 0.5, rotationY: 2.5, tilt: 1.0 })
  b.addSteam(pot.x, top + 0.28, pot.z, 0.7)
  noodleBasin(b, noodles.x, top, noodles.z, { seed: 31, radius: 0.15 })
  // 展示的一碗湯米苔目（藍邊白瓷碗）與湯匙、兩碟小菜（油豆腐、燙青菜）
  miTaiMuSoup(b, bowl.x, top, bowl.z, { seed: 32, bowl: { tint: BOWL, rim: BOWL_RIM } })
  soupSpoon(detail, bowl.x + 0.06, top + 0.06, bowl.z + 0.02, { rotationY: 0.6 })
  friedTofu(b, sides.x, top, sides.z, { seed: 33, rim: BOWL_RIM, radius: 0.075 })
  blanchedGreens(b, 0.42, top, -0.42, { seed: 34, rim: BOWL_RIM, radius: 0.07 })
  sauceDish(detail, bowl.x - 0.13, top, bowl.z + 0.1)
  chopsticks(detail, bowl.x + 0.12, top, bowl.z + 0.06, { rotationY: 0.2 })
  // 疊碗與筷筒
  bowlStack(b, 0.72, top, -0.44, { count: 5, tint: BOWL, rim: BOWL_RIM })
  bowlStack(b, -0.72, top, -0.15, { count: 4, tint: BOWL, rim: BOWL_RIM })
  b.cylinder('bamboo', 0.035, 0.032, 0.13, 8, [-0.12, top + 0.065, -0.12], { tint: '#c7a874' })
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    detail.cylinder('wood', 0.004, 0.004, 0.22, 4, [-0.12 + Math.cos(a) * 0.016, top + 0.14, -0.12 + Math.sin(a) * 0.016], { tint: '#b88a58' })
  }
  // 醬油膏的玻璃瓶
  b.cylinder('plain', 0.024, 0.026, 0.13, 10, [-0.16, top + 0.065, -0.55], { tint: '#3a2a22' })
  b.cylinder('plain', 0.012, 0.014, 0.03, 8, [-0.16, top + 0.145, -0.55], { tint: '#c23a2c' })
}

/** 兩張小方桌與木凳；有客人坐著的位子，桌上是那位客人的碗與小菜 */
function tables(b, detail, tint) {
  const h = 0.68
  const seated = new Map(MI_TAI_MU_STALL_NPCS.filter((npc) => npc.seat).map((npc) => [npc.x, npc]))
  for (const [i, table] of S.tables.entries()) {
    const t = S.tableHalf
    b.box('wood', [t * 2, 0.035, t * 2], [table.x, G + h, table.z], { tint: tint('#9a5a3c') })
    contactShadow(b, table.x, G, table.z, t * 2 - 0.06)
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box('wood', [0.04, h, 0.04], [table.x + sx * (t - 0.04), G + h / 2, table.z + sz * (t - 0.04)], { tint: tint(WOOD_DARK) })
    }
    // 桌腳之間貼近地面的橫木（不擋到坐著的客人的腳）
    for (const sx of [-1, 1]) b.box('wood', [0.03, 0.03, t * 2 - 0.08], [table.x + sx * (t - 0.04), G + 0.08, table.z], { tint: tint(WOOD_DARK) })
    // 木凳：方形凳面與四支腳
    for (const sz of [-1, 1]) {
      const z = table.z + sz * S.stoolOffset
      b.box('wood', [0.3, 0.04, 0.26], [table.x, STOOL_TOP - 0.02, z], { tint: tint(shade(WOOD, 1.12)) })
      contactShadow(b, table.x, G, z, 0.26, 0.2)
      for (const lx of [-0.11, 0.11]) {
        for (const lz of [-0.09, 0.09]) b.box('wood', [0.035, STOOL_TOP - G - 0.04, 0.035], [table.x + lx, G + (STOOL_TOP - G - 0.04) / 2, z + lz], { tint: tint(WOOD_DARK) })
      }
    }
    // 客人的碗與小菜（坐在 +z 那一側的客人，碗在桌子靠 +z 的一邊）
    const npc = seated.get(table.x)
    if (npc) {
      const facing = npc.z > table.z ? 1 : -1
      dinerPlace(b, table.x, G + h + 0.018, table.z, { facing, seed: 40 + i, bowl: { tint: BOWL, rim: BOWL_RIM }, side: i ? 'greens' : 'tofu', utensils: false })
    }
    // 筷筒（精緻模式）
    detail.cylinder('bamboo', 0.035, 0.032, 0.12, 8, [table.x + 0.18, G + h + 0.078, table.z - 0.18], { tint: '#c7a874' })
  }
}

/**
 * 攤位的遮擋方塊（鏡頭與點選）：攤台、帆布棚的頂與招牌、兩張桌子；
 * 帆布棚只用棚頂與招牌的範圍，從高處往下看時，點攤台上的那一碗不會被棚子的方塊擋住。
 * 展示的那一碗與小菜另外成為一個可以點選、聚焦的目標（點它開啟「一碗米苔目」）。
 */
function registerBlockers(b) {
  const { half, depth } = S.counter
  const { half: ch, back, front, height } = S.canopy
  const top = counterTop()
  b.addBlocker(-half - 0.04, half + 0.04, 0, top, -depth - 0.04, 0.04)
  b.addBlocker(-ch - 0.12, ch + 0.12, height - 0.16, height + 0.24, back - 0.1, front + 0.15)
  b.addBlocker(-0.35, 0.35, height - 0.53, height - 0.16, front + 0.08, front + 0.16)
  for (const table of S.tables) b.addBlocker(table.x - S.tableHalf, table.x + S.tableHalf, 0, G + 0.72, table.z - S.tableHalf, table.z + S.tableHalf)
  const start = b.blockers.length
  b.addBlocker(S.bowl.x - 0.12, S.bowl.x + 0.12, top, top + 0.15, S.bowl.z - 0.12, S.bowl.z + 0.12)
  return { bowl: { start, end: b.blockers.length } }
}

/** 攤位的人物（世界座標，見 components/NpcLayer.jsx） */
function stallNpcs(b) {
  return MI_TAI_MU_STALL_NPCS.map((npc, i) => {
    const p = b.transformPoint(npc.x, G, npc.z)
    return {
      id: `temple-mi-tai-mu-${npc.id}`,
      look: npc.look,
      pose: npc.pose,
      position: [p.x, p.y, p.z],
      rotationY: b.worldRotationY(npc.rotationY),
      seatY: npc.seat ? STOOL_TOP - G : undefined,
      phase: (i * 0.37) % 1,
    }
  })
}

export function buildTempleMiTaiMuStall(b, cfg = {}, detail = b) {
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
  const stall = MI_TAI_MU_STALL_HOTSPOTS.find((item) => item.id === 'stall')
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
        id: 'temple-mi-tai-mu-bowl',
        storeId: 'temple-mi-tai-mu-stall',
        detail: true,
        hotspot: 'bowl',
        range: ranges.bowl,
        focus: {
          center: toWorld(S.bowl.x - 0.12, S.bowl.z + 0.1),
          forward: dir(0, 1),
          width: 0.8,
          height: 0.45,
          viewHeight: top + 0.08,
          maxDistance: 2.1,
          maxPitch: 0.75,
          maxYawOffset: 0.6,
        },
      },
    ],
    npcs: stallNpcs(b),
  }
}

/** 攤位的障礙物（世界座標）：攤台與後方的竹竿、前方的兩根竹竿、兩張桌子連同前後的木凳、站著的人物 */
export function templeMiTaiMuStallCollision(config, transform) {
  const rect = (x0, x1, z0, z1) => {
    const a = transform(x0, z0)
    const c = transform(x1, z1)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  // 攤台、攤販站的位置與後方的兩根竹竿
  const obstacles = [rect(-S.canopy.half - 0.05, S.canopy.half + 0.05, S.canopy.back - 0.05, 0.05)]
  for (const x of [-S.canopy.half, S.canopy.half]) obstacles.push(rect(x - 0.06, x + 0.06, S.canopy.front - 0.06, S.canopy.front + 0.06))
  for (const table of S.tables) {
    obstacles.push(rect(table.x - S.tableHalf - 0.02, table.x + S.tableHalf + 0.02, table.z - S.stoolOffset - 0.15, table.z + S.stoolOffset + 0.15))
  }
  for (const npc of MI_TAI_MU_STALL_NPCS) {
    if (!npc.seat) obstacles.push(rect(npc.x - 0.22, npc.x + 0.22, npc.z - 0.22, npc.z + 0.22))
  }
  // 攤台旁的水桶
  obstacles.push(rect(-S.counter.half - 0.35, -S.counter.half - 0.05, -S.counter.depth, -S.counter.depth + 0.3))
  return { walkable: [], obstacles }
}
