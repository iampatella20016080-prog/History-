import { SphereGeometry, TorusGeometry } from 'three'
import {
  COURT_D,
  XH_FLOOR_Y,
  XH_HALL,
  XH_ITEMS,
  XH_NPCS,
  hz,
  sideRoomWalls,
  xhToWorld,
} from '../../data/xiaHaiLayout.js'
import { rect, snapToWalls, subtractRect } from './shopInterior.js'
import { shade } from './props.js'

/**
 * 霞海城隍廟・港口商街的殿內（第 11 階段；cfg.interior === 'xiahai'，建築樣式仍是共用的 'temple'）。
 * 配置在 data/xiaHaiLayout.js；查證見 docs/research/interior-xia-hai-cheng-huang.md。
 *
 * - buildXiaHaiShell：街景裡的部分（殿的側牆與後牆、地坪、桁桷、大楣、匾額與楹聯的字、偏殿隔牆、
 *   鏡頭遮擋、室內範圍與人物）。匾聯的字畫在街景的招牌圖集裡。
 * - buildXiaHaiInterior：按需載入的擺設（神龕、神像、神案、香爐、義勇公祿位、夫人龕…），不投射也不接收陰影。
 * - xiaHaiCollision：拜亭的石階（看不見的斜面）、拜亭、中門與殿內（地面在台基上 0.45 m，都標 inBuilding）。
 *
 * 神像都是簡化的人形（座、袍、頭、冠），不做臉部細節；燻黑的臉依廟方「面容……已呈黑色」與照片。
 * 清末殿內的圖像查無：花罩、背板蟠龍依現況照片，桁桷用舊木色（紅漆是現況）。
 */

const H = XH_HALL
const Y = XH_FLOOR_Y
const WOOD = '#6a4a34'
const DARK_WOOD = '#3e2a1e'
const GILT = '#c9a148'
const RED = '#8e2f25'
const SOOT = '#2a221e'

/** 同時移動主要零件與精緻畫質的細部（detail 可以是 null） */
function grp(b, detail, position, rotationY, callback) {
  b.push(position, rotationY)
  detail?.push(position, rotationY)
  try {
    callback()
  } finally {
    detail?.pop()
    b.pop()
  }
}

/* ═══════════ 神像（簡化的人形） ═══════════ */

/**
 * 坐像：座、下袍、上身、肩、頭、冠；beard：長髯垂到腰（鎮殿城隍）；crown：'duke' 公爵帽、'phoenix' 鳳冠、'plain'
 * h 是坐像總高（含座）。座底在 y。
 */
function seatedFigure(b, x, y, z, h, { robe, trim = GILT, face = SOOT, crown = 'plain', beard = false, rotationY = 0, detail = null }) {
  grp(b, detail, [x, y, z], rotationY, () => {
    const seatH = h * 0.18
    b.box('wood', [h * 0.5, seatH, h * 0.42], [0, seatH / 2, 0], { tint: shade(RED, 0.9) })
    // 下袍（膝到腳，往前垂）
    b.box('plain', [h * 0.44, h * 0.26, h * 0.4], [0, seatH + h * 0.13, h * 0.06], { tint: robe })
    b.box('plain', [h * 0.42, h * 0.22, h * 0.06], [0, seatH + h * 0.04, h * 0.27], { tint: shade(robe, 0.85) })
    // 上身
    b.cylinder('plain', h * 0.14, h * 0.19, h * 0.34, 10, [0, seatH + h * 0.42, -h * 0.03], { tint: robe })
    b.box('plain', [h * 0.42, h * 0.07, h * 0.24], [0, seatH + h * 0.57, -h * 0.03], { tint: robe })
    // 胸前的補子與袍緣（金線示意）
    b.box('plain', [h * 0.16, h * 0.14, 0.01], [0, seatH + h * 0.44, h * 0.13], { tint: trim })
    // 頭與臉
    const headY = seatH + h * 0.69
    b.add('plain', new SphereGeometry(h * 0.085, 10, 8), { position: [0, headY, 0], tint: face })
    if (beard) b.box('dark', [h * 0.08, h * 0.3, 0.02], [0, headY - h * 0.2, h * 0.12], { tint: '#1a1614' })
    if (crown === 'duke') {
      b.box('plain', [h * 0.22, h * 0.09, h * 0.2], [0, headY + h * 0.1, 0], { tint: '#1c1a1a' })
      b.box('plain', [h * 0.36, h * 0.025, h * 0.06], [0, headY + h * 0.12, -h * 0.02], { tint: '#1c1a1a' })
      // 冠上的紅絨飾（照片）
      b.add('plain', new SphereGeometry(h * 0.03, 8, 6), { position: [0, headY + h * 0.17, 0.02], tint: '#b3302a' })
    } else if (crown === 'phoenix') {
      b.cylinder('plain', h * 0.11, h * 0.09, h * 0.12, 10, [0, headY + h * 0.11, 0], { tint: '#d9b04a' })
      for (const s of [-1, 1]) b.box('plain', [0.01, h * 0.16, 0.01], [s * h * 0.1, headY - h * 0.02, h * 0.04], { tint: '#d9b04a' })
      if (detail) for (let i = -2; i <= 2; i++) detail.add('plain', new SphereGeometry(h * 0.014, 6, 4), { position: [i * h * 0.04, headY + h * 0.18, h * 0.05], tint: '#e6c35c' })
    } else {
      b.box('plain', [h * 0.18, h * 0.06, h * 0.18], [0, headY + h * 0.09, 0], { tint: '#262222' })
    }
  })
}

/**
 * 立像（大型神偶與配祀小立像）：下襬外張的長袍、上身、頭、帽。
 * hat：'tall' 謝將軍的高帽、'flat' 范將軍的方帽、'judge' 判官的展角帽；sash：斜披的錦帶（大型謝范，靈安社）
 */
function standingFigure(b, x, y, z, h, { robe, face = SOOT, hat = 'judge', sash = null, rotationY = 0, arms = true }) {
  b.group([x, y, z], rotationY, () => {
    b.cylinder('plain', h * 0.1, h * 0.15, h * 0.55, 10, [0, h * 0.275, 0], { tint: robe })
    b.cylinder('plain', h * 0.1, h * 0.11, h * 0.25, 10, [0, h * 0.67, 0], { tint: shade(robe, 1.08) })
    b.box('plain', [h * 0.3, h * 0.05, h * 0.16], [0, h * 0.79, 0], { tint: robe })
    // 寬袖、腰帶、袍下緣與露出的靴尖
    if (arms) for (const s of [-1, 1]) b.box('plain', [h * 0.09, h * 0.3, h * 0.11], [s * h * 0.14, h * 0.64, h * 0.03], { tint: shade(robe, 0.9) })
    b.cylinder('plain', h * 0.115, h * 0.115, h * 0.035, 10, [0, h * 0.55, 0], { tint: GILT })
    b.cylinder('plain', h * 0.152, h * 0.152, h * 0.03, 10, [0, h * 0.015, 0], { tint: shade(robe, 0.7) })
    b.box('dark', [h * 0.16, h * 0.03, h * 0.08], [0, h * 0.015, h * 0.14], { tint: '#1e1c1c' })
    b.add('plain', new SphereGeometry(h * 0.065, 10, 8), { position: [0, h * 0.87, 0], tint: face })
    const top = h * 0.93
    if (hat === 'tall') {
      b.cylinder('plain', h * 0.045, h * 0.07, h * 0.2, 8, [0, top + h * 0.08, 0], { tint: '#ece8de' })
    } else if (hat === 'flat') {
      b.box('plain', [h * 0.16, h * 0.06, h * 0.16], [0, top + h * 0.02, 0], { tint: '#1e1c1c' })
    } else {
      b.box('plain', [h * 0.13, h * 0.07, h * 0.13], [0, top + h * 0.02, 0], { tint: '#1e1c1c' })
      b.box('plain', [h * 0.36, h * 0.015, h * 0.03], [0, top + h * 0.03, -h * 0.03], { tint: '#1e1c1c' })
    }
    if (sash) b.box('plain', [h * 0.05, h * 0.42, 0.015], [0, h * 0.62, h * 0.11], { rotation: [0, 0, 0.5], tint: sash })
  })
}

/* ═══════════ 器物 ═══════════ */

const box2 = (x, z, w, d) => rect(x - w / 2, x + w / 2, z - d / 2, z + d / 2)
const turned = (item, w, d) => (Math.abs(Math.sin(item.rotationY ?? 0)) > 0.5 ? box2(item.x, item.z, d, w) : box2(item.x, item.z, w, d))

/** 主神龕：台、木雕透雕安金的花罩（上方三格人物堵、兩側透雕格子）、白底蟠龍背板；鎮殿城隍與龕內配祀 */
function buildMainShrine(b, item, detail) {
  const { x, z } = item
  const w = 3.2
  const d = 0.9
  // 龕台很高（照片：鎮殿城隍坐在翹頭神案上方看得到的高度）；龕頂在三方匾額下面
  const baseH = 1.0
  const top = 3.05
  grp(b, detail, [x, 0, z], 0, () => {
    // 台座
    b.box('wood', [w, baseH, d], [0, baseH / 2, 0], { tint: RED })
    b.box('wood', [w + 0.06, 0.06, d + 0.06], [0, baseH, 0], { tint: GILT })
    // 背板：白底、金與彩繪的蟠龍與祥雲（龍頭在城隍正上方；依現況照片）
    b.box('plaster', [w - 0.2, top - baseH, 0.05], [0, (top + baseH) / 2, -d / 2 + 0.03], { tint: '#ece6d6' })
    // 蟠龍：沿一條 S 形曲線排成的扁平筆觸（金身、綠鬃），龍頭在城隍正上方；祥雲是淡藍的扁片
    const panelZ = -d / 2 + 0.065
    const path = []
    for (let i = 0; i <= 22; i++) {
      const t = i / 22
      path.push([Math.sin(t * Math.PI * 2.2 + 0.4) * 1.0 * (1 - t * 0.35), baseH + 0.75 + t * 1.75])
    }
    for (let i = 0; i < path.length - 1; i++) {
      const [x0, y0] = path[i]
      const [x1, y1] = path[i + 1]
      const len = Math.hypot(x1 - x0, y1 - y0)
      const thick = 0.07 + 0.06 * Math.sin((i / path.length) * Math.PI)
      b.box('plain', [len + 0.03, thick, 0.012], [(x0 + x1) / 2, (y0 + y1) / 2, panelZ], { rotation: [0, 0, Math.atan2(y1 - y0, x1 - x0)], tint: i % 3 ? '#c9a043' : '#b58a32' })
      if (i % 3 === 1) b.box('plain', [0.05, 0.1, 0.008], [(x0 + x1) / 2, (y0 + y1) / 2 + thick * 0.7, panelZ + 0.004], { rotation: [0, 0, Math.atan2(y1 - y0, x1 - x0) + 0.5], tint: '#4f7f62' })
    }
    const [hx, hy] = path.at(-1)
    b.box('plain', [0.32, 0.2, 0.014], [hx, hy + 0.05, panelZ + 0.002], { tint: '#d2a443' })
    for (const s of [-1, 1]) b.box('plain', [0.03, 0.18, 0.01], [hx + s * 0.09, hy + 0.2, panelZ + 0.006], { rotation: [0, 0, -s * 0.4], tint: '#b58a32' })
    b.box('plain', [0.12, 0.12, 0.01], [hx + 0.35, hy - 0.05, panelZ + 0.004], { rotation: [0, 0, Math.PI / 4], tint: '#d64a32' })
    for (const [dx, dy] of [[-1.05, 2.45], [1.05, 2.5], [-1.15, 0.95], [1.1, 0.9], [0.55, 1.6]]) {
      b.box('plain', [0.34, 0.1, 0.008], [dx, baseH + dy, panelZ - 0.002], { tint: '#8fa9b4' })
      b.box('plain', [0.2, 0.08, 0.008], [dx + 0.08, baseH + dy + 0.07, panelZ - 0.002], { tint: '#9fb8c2' })
    }
    // 兩側龕柱與花罩
    for (const s of [-1, 1]) {
      b.box('wood', [0.16, top - baseH, 0.16], [s * (w / 2 - 0.08), (top + baseH) / 2, d / 2 - 0.1], { tint: RED })
      // 兩側的透雕格子
      for (let k = 0; top - 0.55 - k * 0.38 > baseH + 0.2; k++) b.box('lattice', [0.36, 0.3, 0.04], [s * (w / 2 - 0.36), top - 0.55 - k * 0.38, d / 2 - 0.08], { tint: GILT })
    }
    b.box('wood', [w + 0.1, 0.5, 0.14], [0, top - 0.25, d / 2 - 0.05], { tint: RED })
    // 龕台正面的木雕堵
    for (let k = -3; k <= 3; k++) b.box('plain', [0.36, baseH - 0.3, 0.02], [k * 0.44, baseH / 2, d / 2 + 0.01], { tint: k % 2 ? '#b48a3a' : '#9a3a2c' })
    // 上方三格人物堵（人物只畫成浮起的小色塊）
    for (const k of [-1, 0, 1]) {
      b.box('plain', [0.8, 0.36, 0.02], [k * 0.95, top - 0.25, d / 2 + 0.03], { tint: '#b48a3a' })
      for (const p of [-0.22, 0, 0.22]) b.box('plain', [0.1, 0.2, 0.02], [k * 0.95 + p, top - 0.26, d / 2 + 0.045], { tint: k ? '#4f6f62' : '#8a3a2c' })
    }
    // 花罩下緣的垂飾（精緻畫質）
    if (detail) for (let k = -7; k <= 7; k++) detail.cylinder('plain', 0.03, 0.01, 0.16, 6, [k * 0.2, top - 0.58, d / 2 - 0.02], { tint: GILT })
    b.box('wood', [w + 0.3, 0.1, d + 0.1], [0, top + 0.05, -0.05], { tint: DARK_WOOD })
    // 鎮殿城隍（三尺六、約 1.1 m）：硬身木雕、公爵帽、刺繡雪衣式神袍、長髯、黑面
    seatedFigure(b, 0, baseH, -0.12, 1.1, { robe: '#7a2b24', trim: '#d6ae52', crown: 'duke', beard: true, detail })
    // 龕內配祀（前兩排，階梯式）：文武判官、牛馬將軍二尺三（0.7 m）；謝二尺二、范一尺三；劍印童、日夜遊神一尺六
    b.box('wood', [w - 0.4, 0.18, 0.3], [0, baseH + 0.09, 0.25], { tint: shade(RED, 0.85) })
    const second = [
      [-1.15, 0.7, '#2f4d6a', 'judge'], [-0.75, 0.7, '#7a2b24', 'judge'], [0.75, 0.7, '#3a5a3a', 'flat'], [1.15, 0.7, '#5a3a2a', 'flat'],
    ]
    for (const [dx, h, robe, hat] of second) standingFigure(b, dx, baseH, -0.05, h, { robe, hat })
    const first = [
      [-1.2, 0.67, '#e8e2d4', 'tall'], [-0.85, 0.4, '#2a2a2a', 'flat'], [-0.5, 0.48, '#a8382c', 'flat'], [0.5, 0.48, '#3a6a8a', 'flat'], [0.85, 0.48, '#8a6a2a', 'judge'], [1.2, 0.48, '#4a4a6a', 'judge'],
    ]
    for (const [dx, h, robe, hat] of first) standingFigure(b, dx, baseH + 0.18, 0.25, h, { robe, hat, arms: h > 0.5 })
  })
}

/** 大型文武判官神偶（約八尺、2.4 m）：立在主神龕左右的地上 */
function buildBigPuppet(b, item) {
  const civil = item.figure === 'civil'
  b.box('wood', [0.6, 0.12, 0.6], [item.x, 0.06, item.z], { tint: shade(RED, 0.8) })
  standingFigure(b, item.x, 0.12, item.z, 2.3, { robe: civil ? '#9a2e26' : '#2e5a48', face: civil ? SOOT : '#3c5a3a', hat: 'judge' })
}

/** 落地神龕（謝將軍八尺、范將軍約六尺；1870 年靈安社塑，身披「台北靈安社」錦帶、白鐵頭盔示意） */
function buildGroundShrine(b, item) {
  const xie = item.figure === 'xie'
  b.group([item.x, 0, item.z], item.rotationY ?? 0, () => {
    b.box('wood', [0.9, 0.2, 0.8], [0, 0.1, 0], { tint: shade(RED, 0.85) })
    b.box('wood', [0.9, 0.12, 0.8], [0, 3.2, 0], { tint: RED })
    for (const s of [-1, 1]) b.box('wood', [0.08, 3.0, 0.08], [s * 0.42, 1.7, 0.36], { tint: RED })
    b.box('plaster', [0.86, 3.0, 0.04], [0, 1.7, -0.38], { tint: '#d9cfbd' })
    const h = xie ? 2.45 : 1.85
    standingFigure(b, 0, 0.2, 0, h, { robe: xie ? '#ece8de' : '#2a2a2c', face: xie ? '#e9e4da' : SOOT, hat: xie ? 'tall' : 'flat', sash: '#b3302a' })
  })
}

/** 翹頭神案：高約五尺（1.5 m）、寬約六尺（1.8 m）、深約兩尺（0.6 m），兩端書卷形翹頭，正面數堵木雕；案下虎爺 */
function buildAltarTable(b, item, detail) {
  const { x, z } = item
  const w = 1.8
  const d = 0.6
  const h = 1.5
  grp(b, detail, [x, 0, z], 0, () => {
    b.box('wood', [w, 0.08, d], [0, h - 0.04, 0], { tint: DARK_WOOD })
    for (const s of [-1, 1]) {
      b.box('wood', [0.1, h - 0.08, d - 0.06], [s * (w / 2 - 0.08), (h - 0.08) / 2, 0], { tint: shade(DARK_WOOD, 1.1) })
      // 書卷形翹頭
      b.cylinder('wood', 0.07, 0.07, d, 10, [s * (w / 2 - 0.02), h + 0.05, 0], { rotation: [Math.PI / 2, 0, 0], tint: DARK_WOOD })
    }
    // 正面數堵木雕（貼金）
    for (let k = 0; k < 4; k++) {
      b.box('wood', [0.34, 0.5, 0.03], [-0.6 + k * 0.4, h - 0.4, d / 2 - 0.01], { tint: RED })
      b.box('plain', [0.24, 0.36, 0.01], [-0.6 + k * 0.4, h - 0.4, d / 2 + 0.01], { tint: GILT })
    }
    b.box('wood', [w - 0.2, 0.06, 0.04], [0, 0.22, d / 2 - 0.05], { tint: DARK_WOOD })
    // 令牌（案上）
    b.box('wood', [0.12, 0.3, 0.06], [-0.55, h + 0.15, 0], { tint: '#b23a2c' })
    // 案下的虎爺（虎頭鍘造型，身長一尺六、約 0.5 m）
    b.box('plain', [0.5, 0.2, 0.24], [0, 0.18, 0.05], { tint: '#c88a2c' })
    b.box('plain', [0.2, 0.2, 0.22], [0, 0.26, 0.24], { tint: '#d29a34' })
    for (let k = -1; k <= 1; k++) b.box('dark', [0.05, 0.16, 0.01], [k * 0.12, 0.19, 0.18], { tint: '#3a2a1e' })
    if (detail) for (const s of [-1, 1]) detail.add('plain', new SphereGeometry(0.02, 6, 4), { position: [s * 0.05, 0.31, 0.355], tint: '#f2e2a0' })
  })
}

/** 主神龕前的供桌與銅鑄圓香爐（八寸高、徑約一尺；照片：深色、爐身浮雕龍紋） */
function buildOfferingTable(b, item, detail) {
  const { x, z } = item
  grp(b, detail, [x, 0, z], 0, () => {
    b.box('wood', [1.5, 0.07, 0.6], [0, 0.88, 0], { tint: shade(RED, 0.9) })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.07, 0.85, 0.07], [sx * 0.68, 0.425, sz * 0.25], { tint: shade(RED, 0.75) })
    // 桌裙（清末的桌裙文字查無，不寫字）
    b.box('plain', [1.5, 0.55, 0.02], [0, 0.6, 0.31], { tint: '#a8382c' })
    // 銅香爐
    b.cylinder('plain', 0.15, 0.12, 0.2, 18, [0, 1.02, 0], { tint: '#4a3a28' })
    b.cylinder('plain', 0.165, 0.165, 0.03, 18, [0, 1.13, 0], { tint: '#5a4630' })
    for (const s of [-1, 1]) b.add('plain', new TorusGeometry(0.04, 0.012, 6, 10), { position: [s * 0.17, 1.08, 0], rotation: [0, Math.PI / 2, 0], tint: '#5a4630' })
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 2
      b.box('plain', [0.04, 0.08, 0.04], [Math.cos(a) * 0.09, 0.95, Math.sin(a) * 0.09], { tint: '#3e3022' })
    }
    // 香灰與三炷香
    b.cylinder('plain', 0.14, 0.14, 0.01, 14, [0, 1.12, 0], { tint: '#b8b0a2' })
    for (const dx of [-0.03, 0, 0.03]) b.cylinder('wood', 0.004, 0.004, 0.3, 4, [dx, 1.27, 0], { tint: '#8a3a2a' })
    if (detail) for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2
      detail.box('plain', [0.04, 0.05, 0.005], [Math.cos(a) * 0.14, 1.03, Math.sin(a) * 0.14], { rotation: [0, -a, 0], tint: '#6a5436' })
    }
  })
  // 長明燈（清末無電燈：油燈示意）
}

/** 八仙桌（拜殿中央的案桌，祭解用；大理石面與 1973 年的桌堵不畫，用素木示意） */
function buildBaxianTable(b, item) {
  b.box('wood', [0.95, 0.06, 0.95], [item.x, 0.84, item.z], { tint: '#6a4a32' })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.07, 0.81, 0.07], [item.x + sx * 0.42, 0.405, item.z + sz * 0.42], { tint: '#553a26' })
  for (const s of [-1, 1]) b.box('wood', [0.95, 0.1, 0.03], [item.x, 0.74, item.z + s * 0.45], { tint: '#553a26' })
}

/** 廟祝櫃台（拜殿左側）：長櫃、籤筒與一疊籤詩 */
function buildKeeperDesk(b, item) {
  b.group([item.x, 0, item.z], item.rotationY, () => {
    b.box('wood', [1.4, 0.95, 0.55], [0, 0.475, 0], { tint: '#5e4230' })
    b.box('wood', [1.48, 0.05, 0.62], [0, 0.97, 0], { tint: '#4a3222' })
    // 籤筒（一百首運籤）
    b.cylinder('wood', 0.07, 0.07, 0.22, 10, [0.45, 1.1, 0], { tint: '#7a3a2a' })
    for (let k = 0; k < 9; k++) b.box('wood', [0.01, 0.12, 0.012], [0.42 + (k % 3) * 0.03, 1.25, -0.03 + Math.floor(k / 3) * 0.03], { tint: '#c9a46a' })
    b.box('plain', [0.22, 0.04, 0.16], [-0.35, 1.01, 0.05], { tint: '#e9dcc2' })
  })
}

/** 道士辦公處（拜殿右側）：只畫一張桌與桌上的木魚、經本（道士不畫人） */
function buildPriestDesk(b, item) {
  b.group([item.x, 0, item.z], item.rotationY, () => {
    b.box('wood', [1.2, 0.06, 0.6], [0, 0.8, 0], { tint: '#6a4a32' })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.06, 0.77, 0.06], [sx * 0.54, 0.385, sz * 0.25], { tint: '#553a26' })
    b.add('wood', new SphereGeometry(0.09, 10, 8), { position: [0.3, 0.88, 0], scale: [1, 0.75, 1], tint: '#8a4a2a' })
    b.box('plain', [0.24, 0.04, 0.18], [-0.25, 0.85, 0], { tint: '#d9c9a4' })
  })
}

/** 蒲團 */
function buildCushion(b, item) {
  b.cylinder('plain', 0.22, 0.24, 0.12, 14, [item.x, 0.06, item.z], { tint: '#9a6a3a' })
}

/** 義勇公龕（正殿左後）：無花罩、素聯板；綠底金字祿位（二尺八、約 0.85 m）與透雕安金的蟠龍外框 */
function buildYiyongShrine(b, item, detail) {
  const { x, z } = item
  grp(b, detail, [x, 0, z], 0, () => {
    b.box('wood', [1.25, 0.95, 0.7], [0, 0.475, 0], { tint: '#5a3a28' })
    b.box('wood', [1.3, 0.05, 0.75], [0, 0.97, 0], { tint: '#4a3020' })
    // 祿位：綠底、金框、蟠龍外框
    b.box('wood', [0.62, 0.85, 0.06], [0, 1.42, -0.2], { tint: GILT })
    b.box('plain', [0.46, 0.7, 0.02], [0, 1.4, -0.16], { tint: '#2f5a3a' })
    // 中央一行大字與兩側五列人名（只畫筆畫）
    for (let k = 0; k < 9; k++) b.box('plain', [0.05, 0.035, 0.005], [0, 1.68 - k * 0.065, -0.148], { tint: '#e2c060' })
    for (const s of [-1, 1]) for (let c = 0; c < 5; c++) for (let k = 0; k < 7; k++) {
      b.box('plain', [0.018, 0.022, 0.004], [s * (0.07 + c * 0.03), 1.62 - k * 0.07, -0.148], { tint: '#d8b656' })
    }
    for (const s of [-1, 1]) {
      for (let k = 0; k < 5; k++) b.add('plain', new SphereGeometry(0.045, 6, 5), { position: [s * 0.33, 1.1 + k * 0.17, -0.17], tint: '#d6ae4a' })
    }
    b.add('plain', new SphereGeometry(0.07, 8, 6), { position: [0, 1.9, -0.17], scale: [1.4, 1, 0.6], tint: '#d6ae4a' })
    if (detail) for (let k = 0; k < 9; k++) detail.add('plain', new SphereGeometry(0.025, 6, 4), { position: [-0.28 + k * 0.07, 1.86 + Math.sin(k) * 0.02, -0.16], tint: '#e6c35c' })
    // 兩側的素聯板（清末的聯查無，不寫字）
    for (const s of [-1, 1]) b.box('wood', [0.16, 1.4, 0.04], [s * 0.72, 1.75, -0.3], { tint: '#3e2a1e' })
    b.box('wood', [1.7, 0.16, 0.08], [0, 2.55, -0.3], { tint: '#3e2a1e' })
  })
}

/** 偏殿的夫人龕：素木龕（三段式花罩是現況、年代不詳，清末用素木示意）；夫人軟身坐像三尺二與兩側等高宮娥 */
function buildMadamShrine(b, item, detail) {
  const { x, z } = item
  grp(b, detail, [x, 0, z], 0, () => {
    b.box('wood', [1.7, 0.45, 0.75], [0, 0.225, 0], { tint: '#6a4a32' })
    b.box('wood', [1.76, 0.1, 0.8], [0, 2.55, 0], { tint: '#5a3e2a' })
    for (const s of [-1, 1]) b.box('wood', [0.1, 2.1, 0.1], [s * 0.8, 1.5, 0.3], { tint: '#5a3e2a' })
    b.box('plaster', [1.6, 2.1, 0.04], [0, 1.5, -0.35], { tint: '#e2dccb' })
    // 城隍夫人：鳳冠、刺繡鳳袍、雲肩霞帔
    seatedFigure(b, 0, 0.45, -0.05, 0.98, { robe: '#a8382c', trim: '#2f5a8a', crown: 'phoenix', detail })
    b.box('plain', [0.42, 0.06, 0.26], [0, 0.45 + 0.98 * 0.6, -0.05], { tint: '#3a6a9a' })
    // 兩側宮娥（等高、持搖扇）
    for (const s of [-1, 1]) {
      standingFigure(b, s * 0.55, 0.45, 0.0, 0.98, { robe: s < 0 ? '#c97a6a' : '#6a8aa8', hat: 'flat' })
      b.cylinder('plain', 0.12, 0.12, 0.01, 12, [s * 0.55 + s * 0.12, 0.45 + 0.98 * 0.95, 0.08], { rotation: [Math.PI / 2, 0, 0], tint: '#e8dcb8' })
    }
  })
}

/** 偏殿龕前的案桌（桌裙；桌上不放供品） */
function buildMadamTable(b, item) {
  b.box('wood', [1.2, 0.06, 0.5], [item.x, 0.85, item.z], { tint: '#6a4a32' })
  b.box('plain', [1.2, 0.6, 0.02], [item.x, 0.52, item.z + 0.26], { tint: '#a8382c' })
  for (const s of [-1, 1]) b.box('wood', [0.06, 0.82, 0.44], [item.x + s * 0.55, 0.41, item.z], { tint: '#553a26' })
}

/** 器物登記表：type → { build, footprint（障礙物）, height（鏡頭遮擋高度） } */
export const XH_FURNITURE = {
  mainShrine: { build: buildMainShrine, footprint: (i) => box2(i.x, i.z, 3.3, 1.0), height: () => 3.1 },
  bigPuppet: { build: buildBigPuppet, footprint: (i) => box2(i.x, i.z, 0.7, 0.7), height: () => 2.4 },
  groundShrine: { build: buildGroundShrine, footprint: (i) => turned(i, 0.95, 0.85), height: () => 3.3 },
  altarTable: { build: buildAltarTable, footprint: (i) => box2(i.x, i.z, 1.95, 0.7), height: () => 1.7 },
  offeringTable: { build: buildOfferingTable, footprint: (i) => box2(i.x, i.z, 1.6, 0.7), height: () => 1.3 },
  baxianTable: { build: buildBaxianTable, footprint: (i) => box2(i.x, i.z, 1.0, 1.0), height: () => 0.9 },
  keeperDesk: { build: buildKeeperDesk, footprint: (i) => turned(i, 1.5, 0.65), height: () => 1.3 },
  priestDesk: { build: buildPriestDesk, footprint: (i) => turned(i, 1.25, 0.65), height: () => 1.0 },
  cushion: { build: buildCushion, footprint: (i) => box2(i.x, i.z, 0.5, 0.5), height: () => 0.12 },
  yiyongShrine: { build: buildYiyongShrine, footprint: (i) => box2(i.x, i.z, 1.35, 0.95), height: () => 2.65 },
  madamShrine: { build: buildMadamShrine, footprint: (i) => box2(i.x, i.z, 1.8, 0.85), height: () => 2.6 },
  madamTable: { build: buildMadamTable, footprint: (i) => box2(i.x, i.z, 1.25, 0.55), height: () => 0.9 },
}

/* ═══════════ 碰撞 ═══════════ */

const NO_PARTITION = { z: -1e3, doorMinX: 0, doorMaxX: 0 }

function disjoint(list) {
  const result = []
  for (const r of list) {
    let pieces = [r]
    for (const placed of result) pieces = pieces.flatMap((piece) => subtractRect(piece, placed))
    result.push(...pieces)
  }
  return result
}

/** 殿內的障礙物（殿的本地座標）：器物（靠牆的補到牆裡）、人物、偏殿隔牆、拜亭的步口柱 */
export function xhObstacles() {
  const list = XH_ITEMS.filter((i) => i.block !== false).map((i) => snapToWalls(XH_FURNITURE[i.type].footprint(i), H.room, NO_PARTITION))
  for (const npc of XH_NPCS) list.push(box2(npc.x, npc.z, 0.5, 0.5))
  // 神龕周圍信眾不進入（謝宗榮）：神案以後、主神龕與大型神偶一帶整片擋住，右邊補到偏殿隔牆
  list.push(rect(-2.6, H.sideRoom.minX, H.room.minZ - 0.3, -6.1))
  list.push(...sideRoomWalls())
  for (const c of H.columns) list.push(box2(c.x, c.z, c.r * 2, c.r * 2))
  return disjoint(list)
}

const rectOf = (transform, r, extra = {}) => {
  const p = transform(r.minX, r.minZ)
  const q = transform(r.maxX, r.maxZ)
  return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
}
/** 殿的本地矩形 → 廟的本地矩形 */
const toTemple = (r) => ({ ...r, minZ: hz(r.minZ), maxZ: hz(r.maxZ) })

/**
 * 可行走範圍（世界座標）：石階的斜面（廟埕 y 0 → 台基 y 0.45）、拜亭、中門、殿內；都標 inBuilding
 * （霞海城隍廟只在港口商街，換年代時人物移到戶外）
 */
export function xiaHaiCollision(transform) {
  const inB = (r, extra = {}) => rectOf(transform, toTemple(r), { inBuilding: true, ...extra })
  const st = H.steps
  const from = transform(0, hz(st.bottom)).z
  const to = transform(0, hz(st.top)).z
  const walkable = [
    inB(rect(st.minX, st.maxX, st.top - 0.05, st.bottom), { levels: [0, 0], ramp: { axis: 'z', from, to, y0: 0, y1: Y } }),
    inB(rect(H.porch.minX, H.porch.maxX, H.porch.minZ, H.porch.maxZ), { floorY: Y }),
    inB(rect(H.door.minX, H.door.maxX, H.room.maxZ - 0.1, H.porch.minZ + 0.05), { floorY: Y }),
    inB(rect(H.room.minX, H.room.maxX, H.room.minZ, H.room.maxZ), { floorY: Y }),
  ]
  const obstacles = xhObstacles().map((r) => rectOf(transform, toTemple(r)))
  return { walkable, obstacles }
}

/* ═══════════ 街景裡的部分（外殼、匾聯、遮擋、室內範圍、人物） ═══════════ */

/** 清代匾額（殿的本地座標；黑底金字，style 'gold'）。左右依神明的方向：神明的右手邊是 -x */
const PLAQUES = [
  { text: '其盛矣乎', x: 0, y: 3.6, z: -6.88, width: 1.3 },
  { text: '藻鑑分明', x: -1.45, y: 3.55, z: -6.88, width: 1.1 },
  { text: '威靈海內', x: 1.45, y: 3.55, z: -6.88, width: 1.1 },
  // 正殿前大楣中央，朝外（朝殿門）
  { text: '天眼時開', x: 0, y: 3.35, z: H.splitZ + 0.12, width: 1.3 },
  // 拜殿前大楣（正面牆的內側），朝內
  { text: '正直無私', x: 2.0, y: 3.3, z: H.room.maxZ - 0.06, width: 1.1, inward: true },
  { text: '昭靈聿應', x: -2.0, y: 3.3, z: H.room.maxZ - 0.06, width: 1.1, inward: true },
]

/** 蘇斐然的木聯（1860；今在夫人龕內，清末位置查無，本站放主神龕兩側，標「今在夫人龕」） */
const COUPLET = [
  { text: '天理昭彰看如何結局', x: -1.78 },
  { text: '人心奸險待這裡關防', x: 1.78 },
]

export function buildXiaHaiShell(b, cfg, detail = null) {
  const { room } = H
  const width = room.maxX - room.minX
  const depth = room.maxZ - room.minZ
  const midZ = (room.minZ + room.maxZ) / 2
  b.push([0, Y, -COURT_D])
  detail?.push([0, Y, -COURT_D])
  // 地坪（方磚示意）
  b.box('stone', [width, 0.04, depth], [0, 0.02, midZ], { tint: '#b8ab94', grime: 0.15 })
  // 兩側牆與後牆（外側也看得到；牆裙）
  for (const s of [-1, 1]) {
    b.box('brick', [0.25, H.wallTop, depth + 0.3], [s * (room.maxX + 0.125), H.wallTop / 2, midZ - 0.1], { tint: '#ffffff', grime: 0.15 })
    b.box('plaster', [0.03, H.wallTop - 0.2, depth], [s * (room.maxX - 0.01), (H.wallTop - 0.2) / 2 + 0.1, midZ], { tint: '#e3d9c4', grime: 0.2 })
    b.box('stone', [0.04, 0.6, depth], [s * (room.maxX - 0.02), 0.3, midZ], { tint: '#8e8678' })
  }
  b.box('brick', [width + 0.5, H.wallTop, 0.25], [0, H.wallTop / 2, room.minZ - 0.125], { tint: '#ffffff', grime: 0.15 })
  // 後牆的蟠龍彩繪牆面（廟方：「正殿後方神龕牆面作蟠龍彩繪裝飾」）只在神龕兩側露出一點
  b.box('plaster', [width, H.wallTop - 0.2, 0.03], [0, (H.wallTop - 0.2) / 2 + 0.1, room.minZ + 0.01], { tint: '#ddd2bb', grime: 0.15 })
  // 正面牆的內側（中門兩側）
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? room.minX : H.door.maxX
    const x1 = s < 0 ? H.door.minX : room.maxX
    b.box('plaster', [x1 - x0, H.wallTop - 0.2, 0.03], [(x0 + x1) / 2, (H.wallTop - 0.2) / 2 + 0.1, room.maxZ + 0.01], { tint: '#e3d9c4', grime: 0.2 })
  }
  // 屋頂底：素木望板與桁（擱檁式，殿內無柱、桁桷外露；正殿十三架檁的示意，舊木色）
  const roofY = H.wallTop - 0.05
  b.box('planks', [width, 0.05, depth], [0, roofY + 0.02, midZ], { tint: '#5a4232' })
  for (let i = 0; i < 13; i++) {
    const z = room.maxZ - 0.25 - i * ((depth - 0.5) / 12)
    b.cylinder('wood', 0.09, 0.09, width, 8, [0, roofY - 0.1, z], { rotation: [0, 0, Math.PI / 2], tint: i === 9 ? '#6e4c34' : '#5e4230' })
  }
  // 中檁的太極八卦（現況、年代不詳）：只在精緻畫質畫一個淡淡的圓
  if (detail) detail.cylinder('plain', 0.22, 0.22, 0.02, 20, [0, roofY - 0.2, room.maxZ - 0.25 - 9 * ((depth - 0.5) / 12)], { tint: '#d9ccb0' })
  // 拜殿的捲棚（1971 年以前；廟方依日治圖像）：沿殿寬排列、前後方向的弧形椽（精緻畫質）
  if (detail) {
    const span = room.maxZ - H.splitZ
    const cz = (room.maxZ + H.splitZ) / 2
    for (let x = room.minX + 0.6; x < room.maxX; x += 0.9) {
      detail.add('wood', new TorusGeometry(span / 2 - 0.1, 0.045, 5, 14, Math.PI), { position: [x, roofY - 0.62, cz], rotation: [0, Math.PI / 2, 0], scale: [1, 0.42, 1], tint: '#5e4230' })
    }
  }
  b.box('wood', [width, 0.45, 0.3], [0, roofY - 0.4, H.splitZ], { tint: '#5a3e2c' })
  b.box('wood', [width, 0.08, 0.34], [0, roofY - 0.66, H.splitZ], { tint: GILT })
  // 主神龕上方的大楣（三方匾掛在這裡）
  b.box('wood', [width, 0.3, 0.25], [0, roofY - 0.25, -7.0], { tint: '#5a3e2c' })
  // 偏殿的隔牆（木板壁，門在 x = 3.2 的隔牆上）
  const sr = H.sideRoom
  const wallH = 2.9
  const plank = '#6a4c36'
  b.box('planks', [0.08, wallH, sr.doorMinZ - sr.minZ], [sr.minX, wallH / 2, (sr.minZ + sr.doorMinZ) / 2], { tint: plank })
  b.box('planks', [0.08, wallH, sr.maxZ - sr.doorMaxZ], [sr.minX, wallH / 2, (sr.doorMaxZ + sr.maxZ) / 2], { tint: plank })
  b.box('planks', [0.08, wallH - 2.2, sr.doorMaxZ - sr.doorMinZ], [sr.minX, (wallH + 2.2) / 2, (sr.doorMinZ + sr.doorMaxZ) / 2], { tint: plank })
  b.box('planks', [sr.maxX - sr.minX, wallH, 0.08], [(sr.minX + sr.maxX) / 2, wallH / 2, sr.maxZ], { tint: plank })
  b.box('wood', [0.12, 0.12, sr.doorMaxZ - sr.doorMinZ + 0.2], [sr.minX, 2.2, (sr.doorMinZ + sr.doorMaxZ) / 2], { tint: DARK_WOOD })
  // 長明燈（正殿中央；清末無電燈，油燈示意）
  b.box('dark', [0.015, 0.9, 0.015], [0, roofY - 0.55, -5.3], { tint: '#2a2622' })
  b.cylinder('plain', 0.12, 0.08, 0.14, 12, [0, roofY - 1.05, -5.3], { tint: '#6a4a2a' })
  b.addGlow(0, roofY - 1.0, -5.3, 0.5, '#ffb36b', 0.3)
  // 匾額與楹聯（街景的招牌圖集）
  for (const p of PLAQUES) {
    b.group([p.x, 0, p.z], p.inward ? Math.PI : 0, () => {
      b.box('wood', [p.width + 0.16, 0.56, 0.06], [0, p.y, 0.03], { tint: '#3a1d17' })
      b.addSign({ text: p.text, style: 'gold', width: p.width, height: 0.42, position: [0, p.y, 0.065] })
    })
  }
  for (const c of COUPLET) {
    b.box('wood', [0.24, 2.1, 0.05], [c.x, 2.05, -6.9], { tint: '#2a1a15' })
    b.addSign({ text: c.text, style: 'lacquer', vertical: true, width: 0.18, height: 1.95, position: [c.x, 2.05, -6.87] })
  }
  // 大型謝范神偶的錦帶「台北靈安社」（1870 年靈安社塑；廟方）
  for (const s of [-1, 1]) {
    const item = XH_ITEMS.find((i) => i.type === 'groundShrine' && Math.sign(i.x) === s)
    const h = item.figure === 'xie' ? 2.45 : 1.85
    b.addSign({ text: '台北靈安社', style: 'red', vertical: true, width: 0.07, height: 0.42, position: [item.x - s * 0.17, 0.2 + h * 0.6, item.z], rotationY: -s * Math.PI / 2 })
  }

  // 鏡頭遮擋（殿的本地座標；y 是世界高度）：兩側牆、後牆、正面牆（中門以外）、屋頂、偏殿隔牆、器物
  const top = Y + H.wallTop
  const ridge = Y + 9
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? room.minX - 0.3 : room.maxX, s < 0 ? room.minX : room.maxX + 0.3, 0, ridge, room.minZ - 0.3, room.maxZ + 0.3)
  b.addBlocker(room.minX - 0.3, room.maxX + 0.3, 0, ridge, room.minZ - 0.6, room.minZ)
  b.addBlocker(room.minX - 0.3, H.door.minX, 0, ridge, room.maxZ, H.frontWallZ + 0.18)
  b.addBlocker(H.door.maxX, room.maxX + 0.3, 0, ridge, room.maxZ, H.frontWallZ + 0.18)
  b.addBlocker(H.door.minX, H.door.maxX, Y + H.door.height, ridge, room.maxZ, H.frontWallZ + 0.18)
  b.addBlocker(room.minX - 0.3, room.maxX + 0.3, top - 0.15, ridge, room.minZ - 0.6, room.maxZ)
  // 拜亭的屋簷
  b.addBlocker(H.porch.minX - 0.4, H.porch.maxX + 0.4, Y + 3.5, ridge, room.maxZ, 0.2)
  for (const r of sideRoomWalls()) b.addBlocker(r.minX, r.maxX, 0, Y + 2.9, r.minZ, r.maxZ)
  for (const item of XH_ITEMS) {
    if (item.type === 'cushion') continue
    const fp = XH_FURNITURE[item.type].footprint(item)
    b.addBlocker(fp.minX, fp.maxX, 0, Y + XH_FURNITURE[item.type].height(item), fp.minZ, fp.maxZ)
  }
  // 大楣與匾的高度（鏡頭不穿過大楣）
  b.addBlocker(room.minX, room.maxX, Y + roofY - 0.7, top, H.splitZ - 0.17, H.splitZ + 0.17)
  detail?.pop()
  b.pop()

  // 室內範圍、跟隨鏡頭的範圍、觀賞範圍（世界座標）
  const zone = (minX, maxX, minZ, maxZ) => {
    const p = b.transformPoint(minX, 0, hz(minZ))
    const q = b.transformPoint(maxX, 0, hz(maxZ))
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
  }
  const door = b.transformPoint(0, 0, hz(H.frontWallZ))
  const npcs = XH_NPCS.map((npc, i) => {
    const p = xhToWorld(npc.x, hz(npc.z))
    return {
      id: npc.id,
      zone: 'xia-hai-cheng-huang',
      look: npc.look,
      pose: npc.pose,
      seatY: 0,
      position: [p.x, Y, p.z],
      rotationY: b.worldRotationY(npc.rotationY),
      phase: (0.41 + i * 0.29) % 1,
    }
  })
  return {
    interiors: [
      {
        id: 'xia-hai-cheng-huang',
        ...zone(room.minX, room.maxX, room.minZ, room.maxZ),
        ceiling: H.wallTop,
        entry: zone(H.door.minX - 1.4, H.door.maxX + 1.4, room.maxZ, H.steps.bottom + 0.6),
        entryHold: 0.5,
        entryRamp: 2.4,
        door: { x: door.x, z: door.z },
        camera: { distance: 3.2, maxHeight: Y + H.wallTop - 0.45, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        viewerStart: { distance: 2.8 },
        loadRadius: 16,
        showRadius: 26,
      },
    ],
    viewerRegions: [{ ...zone(room.minX + 0.3, room.maxX - 0.3, room.minZ + 0.3, room.maxZ - 0.2), minY: Y + 0.6, maxY: Y + 2.2, cameraMaxY: Y + H.wallTop - 0.4 }],
    followAreas: [zone(room.minX, room.maxX, room.minZ, H.porch.maxZ)],
    npcs,
  }
}

/** 按需載入的殿內擺設（器物清單；殿的本地座標，地面在台基上） */
export function buildXiaHaiInterior(b, cfg = {}, detail = b) {
  if (cfg.interior !== 'xiahai') return
  b.push([0, Y, -COURT_D])
  if (detail !== b) detail.push([0, Y, -COURT_D])
  for (const item of XH_ITEMS) XH_FURNITURE[item.type].build(b, item, detail === b ? null : detail)
  if (detail !== b) detail.pop()
  b.pop()
}

/** 測試用：殿內的器物清單（殿的本地座標） */
export const XH_ITEM_BOUNDS = () => XH_ITEMS.map((item) => ({ item, ...XH_FURNITURE[item.type].footprint(item) }))
