import { STREET } from '../../config.js'
import { createRng } from '../../utils/random.js'
import { shade } from '../props.js'
import { signBoard } from '../facade.js'

/**
 * 林華泰茶行現在的店面樓房（庶民生活、老屋新生）：1965 年前後因道路工程改建（國家文化記憶庫 500830／601589），
 * 外觀依 Wikimedia Commons 的照片（2008、2018、2021，見 sources.js 的 commons-linhuatai-facade）：
 * - 一樓騎樓，方柱；中央是玻璃門與門楣上的小招牌
 * - 二、三樓是灰色洗石子牆，白色的直立鰭片一路通到屋頂上的框架，每一格一扇鋼框窗，窗下一排小通氣孔
 * - 騎樓上方一塊深色木條招牌，金色的「林華泰茶行」；左邊轉角一座直立的箱形招牌，正面與側面都有字
 * - 屋頂上往後退的第四層（窗帶、上方一排小通氣口、外伸的平屋頂）
 * 真的樓房是四個店面寬（食尚玩家寫「4 棟」），這裡縮在共用地段的一個店面寬裡（4 格鰭片）。
 *
 * 本地座標同閩南街屋：一樓店面在 z = 0，樓上立面在 z = 步道深度，街道在 +z。
 * 只用街景裡已經有的材質（流暢畫質的批次數不變）。回傳值與 buildShophouse 相同的欄位。
 */
export const LHT_1965 = {
  groundH: 3.5,
  topY: 9.9, // 三樓頂的屋頂板
  parapetY: 10.2,
  frameY: 10.75, // 鰭片頂端的橫樑
  penthouse: { minX: -2.5, maxX: 2.5, minZ: -5.4, maxZ: 0.1, h: 2.6 },
  column: 0.45,
  bays: 4,
}

const WINDOW_ROWS = [
  { y0: 4.6, y1: 6.35, vent: 4.15 }, // 二樓；通氣孔在招牌兩側
  { y0: 7.45, y1: 9.2, vent: 6.9 }, // 三樓
]

/** 一扇鋼框窗：玻璃、外框、中央直櫺、上方的橫櫺；下緣窗臺 */
function steelWindow(b, { x, y0, y1, width, z, lit, frameTint, glassTint }) {
  const h = y1 - y0
  const cy = (y0 + y1) / 2
  b.box(lit ? 'windowLit' : 'glass', [width, h, 0.02], [x, cy, z + 0.01], { tint: lit ? '#6b5a3c' : glassTint })
  const bar = 0.05
  b.box('steel', [width, bar, 0.06], [x, y1 - bar / 2, z + 0.035], { tint: frameTint })
  b.box('steel', [width, bar, 0.06], [x, y0 + bar / 2, z + 0.035], { tint: frameTint })
  for (const s of [-1, 0, 1]) b.box('steel', [bar, h, 0.06], [x + (s * (width - bar)) / 2, cy, z + 0.035], { tint: frameTint })
  b.box('steel', [width, 0.04, 0.06], [x, y1 - h * 0.4, z + 0.035], { tint: frameTint })
  b.box('stucco', [width + 0.08, 0.06, 0.12], [x, y0 - 0.03, z + 0.06], { tint: '#c4c1b6' })
}

export function buildLinHuaTai1965(b, cfg, look) {
  const rng = createRng(cfg.seed ?? 19)
  const P = LHT_1965
  const w = cfg.width ?? 6
  const half = w / 2
  const D = cfg.depth ?? 11
  const walkD = STREET.walkwayDepth
  const walkH = STREET.walkwayHeight
  const front = walkD
  const { groundH, topY, parapetY, frameY } = P
  const openingH = Math.min(2.62, groundH - 0.6)
  const wallT = 0.3
  const wallTint = look.facadeTint // 洗石子的灰
  const finTint = look.finTint
  const litChance = cfg.litWindows ?? 0.35

  /* ── 步道與騎樓 ─────────────────────── */
  b.box('stone', [w, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: '#cfcac0' })
  b.box('stone', [w, walkH + 0.025, 0.22], [0, (walkH + 0.025) / 2, walkD - 0.11], { tint: '#a9a397' })
  b.box('stucco', [w, 0.2, walkD], [0, groundH - 0.1, walkD / 2], { tint: shade(wallTint, 0.92) }) // 騎樓天花
  const col = P.column
  for (const s of [-1, 1]) {
    const x = s * (half - col / 2 - 0.02)
    b.box('stucco', [col, groundH, col], [x, groundH / 2, walkD - col / 2 - 0.02], { tint: shade(wallTint, 1.04), grime: 0.2 })
    b.box('stone', [col + 0.04, 0.3, col + 0.04], [x, 0.15, walkD - col / 2 - 0.02], { tint: '#8f8a80' })
  }
  // 騎樓上緣的水平樑（立面最下面一道）
  b.box('stucco', [w, 0.28, 0.4], [0, groundH + 0.12, front - 0.05], { tint: shade(wallTint, 1.06) })

  /* ── 一樓店面牆（門面與兩側的石砌壁柱；門板、捲門在 linHuaTaiEras.js 的 storefront） ── */
  for (const s of [-1, 1]) {
    b.box('stucco', [0.5, groundH, wallT], [s * (half - 0.25), groundH / 2, -wallT / 2], { tint: wallTint, grime: 0.2 })
    b.box('stone', [0.36, openingH - 0.1, 0.06], [s * (half - 0.32), (openingH - 0.1) / 2, 0.03], { tint: '#8c877c' })
  }
  b.box('stucco', [w - 1.0, groundH - openingH, wallT], [0, (openingH + groundH) / 2, -wallT / 2], { tint: wallTint })
  b.box('stone', [w - 1.0, 0.17, 0.4], [0, walkH + 0.01, -0.12], { tint: '#b9b3a7' })
  // 門楣上的小招牌（照片：玻璃門上方一塊深色板、金字）
  signBoard(b, { text: cfg.sign?.text ?? '林華泰茶行', style: 'gold', y: (openingH + groundH) / 2 - 0.05, z: 0.0, width: 1.5, height: 0.34, frameTint: '#2c2019' })

  /* ── 側牆、後牆、屋頂板 ─────────────── */
  for (const s of [-1, 1]) {
    const x = s * (half - 0.13)
    b.box('stucco', [0.26, parapetY, D], [x, parapetY / 2, -D / 2], { tint: shade(wallTint, 0.96), grime: 0.12 })
    b.box('stucco', [0.26, parapetY - groundH, walkD], [x, (parapetY + groundH) / 2, walkD / 2], { tint: shade(wallTint, 0.96) })
  }
  b.box('stucco', [w - 0.52, topY, wallT], [0, topY / 2, -D + wallT / 2], { tint: shade(wallTint, 0.94) })
  b.box('stucco', [w - 0.1, 0.22, D + front - 0.2], [0, topY - 0.11, (front - D) / 2], { tint: shade(wallTint, 0.85) })

  /* ── 樓上立面：洗石子牆、鋼框窗、通氣孔 ── */
  b.box('stucco', [w - 0.02, parapetY - groundH - 0.26, wallT], [0, (parapetY + groundH + 0.26) / 2, front - wallT / 2], { tint: wallTint, grime: look.grime })
  const bay = w / P.bays
  const signHalf = bay * 1.25 // 騎樓上方的橫招牌（中央兩格多一點）
  const signTop = groundH + 1.0
  for (let i = 0; i < P.bays; i++) {
    const x = -half + bay * (i + 0.5)
    for (const [r, row] of WINDOW_ROWS.entries()) {
      steelWindow(b, { x, y0: row.y0, y1: row.y1, width: bay - 0.36, z: front, lit: rng() < litChance * 0.3, frameTint: look.frameTint, glassTint: '#2e3735' })
      // 窗下的小通氣孔（每格兩個；二樓被招牌擋住的就不畫）
      if (r === 0 && Math.abs(x) < signHalf) continue
      for (const dx of [-0.3, 0.3]) b.box('dark', [0.26, 0.12, 0.04], [x + dx, row.vent, front + 0.005], { tint: '#3a3833' })
    }
  }
  // 白色直立鰭片：從騎樓樑一路到屋頂上的框架；招牌範圍內從招牌上緣開始
  for (let i = 0; i <= P.bays; i++) {
    const x = Math.max(-half + 0.08, Math.min(half - 0.08, -half + i * bay))
    const y0 = Math.abs(x) < signHalf ? signTop + 0.05 : groundH + 0.26
    b.box('stucco', [0.14, frameY - y0, 0.34], [x, (frameY + y0) / 2, front + 0.12], { tint: finTint, grime: look.grime * 0.6 })
  }
  // 女兒牆上緣、鰭片頂端的橫樑
  b.box('stucco', [w, 0.12, 0.42], [0, parapetY + 0.06, front - 0.05], { tint: finTint })
  b.box('stucco', [w, 0.14, 0.36], [0, frameY - 0.07, front + 0.12], { tint: finTint })

  /* ── 招牌：騎樓上方的木條招牌（右讀的金字）與左邊轉角的直立箱形招牌 ── */
  const signY = groundH + 0.55
  b.box('planks', [signHalf * 2, 0.92, 0.12], [0, signY, front + 0.1], { tint: '#3a2a20' })
  b.addSign({ text: cfg.sign?.text ?? '林華泰茶行', style: 'letters', width: signHalf * 2 - 0.5, height: 0.66, position: [0, signY, front + 0.165] })
  const vx = -half + 0.36
  const vz = front + 0.3
  const vy0 = groundH + 0.45
  const vy1 = topY - 0.1
  const vh = vy1 - vy0
  b.box('planks', [0.62, vh, 0.5], [vx, (vy0 + vy1) / 2, vz], { tint: '#33251d' })
  const vSign = { text: cfg.sign?.text ?? '林華泰茶行', style: 'letters', vertical: true, width: 0.5, height: vh - 0.5 }
  b.addSign({ ...vSign, position: [vx, (vy0 + vy1) / 2, vz + 0.255] })
  b.addSign({ ...vSign, width: 0.4, position: [vx - 0.315, (vy0 + vy1) / 2, vz], rotationY: -Math.PI / 2 })

  /* ── 第四層：屋頂上往後退的一層 ───── */
  const ph = P.penthouse
  const pw = ph.maxX - ph.minX
  const pd = ph.maxZ - ph.minZ
  const pcx = (ph.minX + ph.maxX) / 2
  const pcz = (ph.minZ + ph.maxZ) / 2
  b.box('stucco', [pw, ph.h, pd], [pcx, topY + ph.h / 2, pcz], { tint: shade(wallTint, 0.98), grime: look.grime })
  // 正面的窗帶（鋼框窗）
  const pwinCount = 3
  for (let i = 0; i < pwinCount; i++) {
    const x = ph.minX + (pw / pwinCount) * (i + 0.5)
    steelWindow(b, { x, y0: topY + 0.9, y1: topY + 1.8, width: pw / pwinCount - 0.3, z: ph.maxZ + 0.02, lit: false, frameTint: look.frameTint, glassTint: '#2e3735' })
  }
  // 上方的小通氣口與外伸的平屋頂
  for (const x of [-1.4, 1.4]) b.box('stucco', [0.6, 0.1, 0.03], [x, topY + 2.25, ph.maxZ + 0.015], { tint: '#d7d4ca' })
  b.box('stucco', [pw + 0.5, 0.2, pd + 0.5], [pcx, topY + ph.h + 0.1, pcz], { tint: shade(wallTint, 1.05) })
  b.box('stucco', [pw + 0.52, 0.32, 0.06], [pcx, topY + ph.h + 0.04, ph.maxZ + 0.26], { tint: shade(wallTint, 0.9) })
  // 屋頂上的水塔（照片左上）
  b.cylinder('steel', 0.36, 0.36, 0.9, 12, [ph.minX + 0.7, topY + ph.h + 0.65, ph.minZ + 1.0], { tint: '#cfd0c8' })

  if (cfg.storefront !== 'closed') b.addPool(0, walkD * 0.5, Math.min(2.4, w * 0.35), '#ffb468', walkH + 0.02)

  // 鏡頭遮擋：騎樓天花以上的樓層伸到步道上方（牆面、屋頂由 linHuaTaiEras.js 依室內需要分開加）
  b.addBlocker(-half, half, groundH - 0.2, topY + ph.h + 0.3, 0, front + 0.25)

  return {
    textLanterns: [],
    groundHeight: groundH,
    wallHeight: topY,
    ridgeHeight: topY + ph.h + 0.2,
  }
}

/** 騎樓柱的本地範圍（碰撞與測試共用） */
export function lht1965Columns(width = 6) {
  const half = width / 2
  const col = LHT_1965.column
  const walkD = STREET.walkwayDepth
  return [-1, 1].map((s) => {
    const x = s * (half - col / 2 - 0.02)
    return { minX: x - col / 2, maxX: x + col / 2, minZ: walkD - col - 0.02, maxZ: walkD - 0.02 }
  })
}
