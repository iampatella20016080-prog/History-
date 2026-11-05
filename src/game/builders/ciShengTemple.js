import { SphereGeometry, TorusGeometry } from 'three'
import {
  COURT_D,
  CS_AGE,
  CS_FLOOR_Y,
  CS_HALL,
  csItemsFor,
  csNpcFor,
  csToWorld,
  hz,
} from '../../data/ciShengLayout.js'
import { rect, snapToWalls } from './shopInterior.js'
import { shade } from './props.js'
import { NO_PARTITION, box2, disjoint, grp, rectOf, seatedFigure, toTemple } from './xiaHaiTemple.js'

/**
 * 慈聖宮的殿內（第 11 階段；cfg.interior === 'cisheng'，建築樣式仍是共用的 'temple'，cfg.variant 是年代）。
 * 配置在 data/ciShengLayout.js；查證見 docs/research/interior-ci-sheng-gong.md。
 *
 * - buildCiShengShell：街景裡的部分（殿的側牆與後牆、地坪、桁桷、大楣、匾額與楹聯的字、鏡頭遮擋、室內範圍與人物）。
 *   匾聯的字畫在街景的招牌圖集裡。
 * - buildCiShengInterior：按需載入的擺設（神龕與媽祖、供桌、石柱、神將、光明燈…），不投射也不接收陰影。
 * - ciShengCollision：拜亭的石階（看不見的斜面）、拜亭、中門與殿內（地面在台基上 0.45 m，都標 inBuilding）。
 *
 * 神像都是簡化的人形（座、袍、頭、冠），不做臉部細節。廟的原則（第 5 階段）：沒有出處的神像、供品與祭祀細節不畫——
 * 只畫照片可見的媽祖（5 尊）；四尊大型神將垂簾、哼哈二將不畫（使用者 2026-11-05 照建議），龕前小尊侍神、門神圖案也不畫。
 * 純裝飾的細部（梁架的瓜筒、宮燈、神龕的透雕小件）只在精緻畫質（detail）。
 */

const H = CS_HALL
const Y = CS_FLOOR_Y
// 殿內和街上一樣亮（室內不接收陰影）：黑漆、貼金與紅袍都用比照片暗的色，畫面上才讀得出黑金的龕
const GILT = '#a8802e'
const RED = '#6e2219'

/** 依年代老化的木色：新廟（原色）→ 燻黑 → 重修後 */
const AGE = {
  new: { beam: '#6a4c34', plank: '#5e432f', wall: '#ece3cf', black: '#3a2c24', floor: '#bdb09a', soot: 1.0 },
  mature: { beam: '#5f4432', plank: '#523a2a', wall: '#e0d5bd', black: '#302620', floor: '#b0a38c', soot: 0.9 },
  aged: { beam: '#43322a', plank: '#3a2b23', wall: '#cfc3aa', black: '#2a201c', floor: '#a79a84', soot: 0.78 },
  restored: { beam: '#5a4332', plank: '#4d3a2c', wall: '#eee9dd', black: '#302620', floor: '#cfc7b6', soot: 0.95 },
}
const ageOf = (cfg) => AGE[CS_AGE[cfg.variant] ?? 'mature']

/* ═══════════ 器物 ═══════════ */

const BLACK = (age) => age.black

/** 媽祖神龕：黑、金色木雕的龕（三層階梯、花罩、上方黑底的匾），龕內 5 尊媽祖金身（正中較大、戴冕旒，其餘戴鳳冠） */
function buildMazuShrine(b, item, detail, cfg) {
  const age = ageOf(cfg)
  const black = BLACK(age)
  const w = 3.0
  const d = 0.9
  const top = 3.15
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    // 台座與正面的堵
    b.box('lacquer', [w, 0.85, d], [0, 0.425, 0], { tint: black })
    b.box('lacquer', [w + 0.06, 0.06, d + 0.06], [0, 0.85, 0], { tint: GILT })
    for (let k = -3; k <= 3; k++) b.box('lacquer', [0.34, 0.5, 0.02], [k * 0.4, 0.45, d / 2 + 0.01], { tint: k % 2 ? '#b48a3a' : shade(black, 1.5) })
    // 背板：黑底、金色格子
    b.box('lacquer', [w - 0.16, top - 0.85, 0.05], [0, (top + 0.85) / 2, -d / 2 + 0.03], { tint: shade(black, 0.9) })
    for (let k = 0; k < 6; k++) b.box('lattice', [w - 0.5, 0.05, 0.02], [0, 1.1 + k * 0.36, -d / 2 + 0.07], { tint: GILT })
    // 三層階梯：媽祖坐在上面
    b.box('wood', [2.7, 0.22, 0.78], [0, 0.96, 0.02], { tint: shade(RED, 0.85) })
    b.box('wood', [1.9, 0.22, 0.6], [0, 1.18, -0.06], { tint: shade(RED, 0.8) })
    b.box('wood', [1.0, 0.22, 0.42], [0, 1.4, -0.14], { tint: shade(RED, 0.75) })
    // 兩側龕柱、橫樑與花罩
    for (const s of [-1, 1]) {
      b.box('lacquer', [0.16, top - 0.85, 0.16], [s * (w / 2 - 0.08), (top + 0.85) / 2, d / 2 - 0.1], { tint: black })
      for (let k = 0; top - 0.7 - k * 0.38 > 1.1; k++) b.box('lattice', [0.36, 0.3, 0.04], [s * (w / 2 - 0.36), top - 0.7 - k * 0.38, d / 2 - 0.08], { tint: GILT })
    }
    b.box('lacquer', [w + 0.1, 0.46, 0.14], [0, top - 0.3, d / 2 - 0.05], { tint: black })
    for (const k of [-1, 0, 1]) b.box('lacquer', [0.8, 0.3, 0.02], [k * 0.95, top - 0.3, d / 2 + 0.03], { tint: GILT })
    b.box('lacquer', [w + 0.3, 0.1, d + 0.1], [0, top + 0.05, -0.05], { tint: shade(black, 0.8) })
    // 上方黑底金字的橫匾「海國陽春」（字在街景的招牌圖集；款識照片看不到，不寫）
    // 匾掛在花罩頂的前緣，從供桌前看得到（字的 z 與 signs() 相同）
    b.box('lacquer', [1.9, 0.44, 0.06], [0, 3.48, 0.36], { tint: shade(black, 0.85) })
    for (const dy of [-0.2, 0.2]) b.box('lacquer', [1.8, 0.03, 0.02], [0, 3.48 + dy, 0.395], { tint: GILT })
    for (const s of [-1, 1]) b.box('lacquer', [0.03, 0.4, 0.02], [s * 0.9, 3.48, 0.395], { tint: GILT })
    // 花罩下緣的垂飾、神龕上緣的透雕小件（精緻畫質）
    if (detail) {
      for (let k = -7; k <= 7; k++) detail.cylinder('lacquer', 0.03, 0.01, 0.16, 6, [k * 0.2, top - 0.6, d / 2 - 0.02], { tint: GILT })
      for (let k = -6; k <= 6; k++) detail.add('lacquer', new SphereGeometry(0.035, 6, 4), { position: [k * 0.22, top + 0.13, d / 2 - 0.02], tint: '#e0b545' })
    }
    // 鎮殿媽祖（正中、較大、冕旒）與兩層各兩尊（鳳冠）；紅底金繡袍、貼金的臉
    const robe = '#a32a20'
    const face = '#c9a23e'
    seatedFigure(b, 0, 1.52, -0.14, 1.0, { robe, trim: '#c09440', face, crown: 'mianliu', detail, material: 'lacquer' })
    for (const s of [-1, 1]) seatedFigure(b, s * 0.62, 1.3, -0.06, 0.8, { robe, trim: '#c09440', face, crown: 'phoenix', detail, material: 'lacquer' })
    for (const s of [-1, 1]) seatedFigure(b, s * 1.12, 1.08, 0.02, 0.72, { robe, trim: '#c09440', face, crown: 'phoenix', detail, material: 'lacquer' })
  })
}

/** 黑色長供桌：前堵金字「慈聖宮」與龍紋（字在街景的招牌圖集；年款「民國甲□年」，供桌是戰後之物）；老屋新生多金色花瓶插百合、橘塔與供品盒 */
function buildAltarLong(b, item, detail, cfg) {
  const age = ageOf(cfg)
  const black = BLACK(age)
  const w = 2.6
  const d = 0.7
  const h = 0.9
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    b.box('lacquer', [w, 0.08, d], [0, h - 0.04, 0], { tint: black })
    for (const s of [-1, 1]) b.box('lacquer', [0.12, h - 0.08, d - 0.08], [s * (w / 2 - 0.1), (h - 0.08) / 2, 0], { tint: shade(black, 1.1) })
    b.box('lacquer', [w - 0.2, h - 0.2, 0.05], [0, (h - 0.2) / 2 + 0.05, d / 2 - 0.05], { tint: shade(black, 1.15) })
    // 前堵的龍紋（金色筆觸；中央留給金字）
    for (const s of [-1, 1]) {
      for (let k = 0; k < 6; k++) b.box('lacquer', [0.16, 0.035, 0.012], [s * (0.55 + k * 0.14), 0.42 + Math.sin(k * 1.3) * 0.1, d / 2 - 0.015], { tint: k % 2 ? '#c9a043' : '#b58a32', rotation: [0, 0, Math.sin(k * 1.3) * 0.5] })
    }
    if (cfg.variant === 'revival') {
      // 供桌兩端的金色花瓶插百合、橘子疊成塔的高腳盤、紅色供品盒（老屋新生；其他年代的供品查無，不畫）
      for (const s of [-1, 1]) {
        b.cylinder('lacquer', 0.05, 0.08, 0.16, 12, [s * 0.95, h + 0.08, 0], { tint: '#a87a28' })
        b.cylinder('lacquer', 0.03, 0.05, 0.08, 10, [s * 0.95, h + 0.2, 0], { tint: '#a87a28' })
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2
          b.add('lacquer', new SphereGeometry(0.055, 6, 5), { position: [s * 0.95 + Math.cos(a) * 0.07, h + 0.34 + (k % 2) * 0.05, Math.sin(a) * 0.07], tint: '#f4efe6' })
        }
      }
      b.cylinder('lacquer', 0.12, 0.05, 0.14, 12, [-0.45, h + 0.07, 0], { tint: '#b8442f' })
      const tier = [[0, 4], [0.1, 2]]
      for (const [dy, n] of tier) {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2
          b.add('lacquer', new SphereGeometry(0.06, 8, 6), { position: [-0.45 + Math.cos(a) * 0.065 * (n > 2 ? 1 : 0.4), h + 0.2 + dy, Math.sin(a) * 0.065 * (n > 2 ? 1 : 0.4)], tint: '#e8902f' })
        }
      }
      b.box('lacquer', [0.2, 0.1, 0.14], [0.5, h + 0.05, 0.02], { tint: '#b3302a' })
      b.box('lacquer', [0.2, 0.01, 0.14], [0.5, h + 0.105, 0.02], { tint: GILT })
    }
  })
}

/** 同治六年的石柱：黑色的方石柱（有柱礎與看架），柱上的字在街景（右柱楷書的聯、左柱篆書只畫筆畫） */
function buildStonePillar(b, item, detail, cfg) {
  const age = ageOf(cfg)
  const dir = item.x > 0 ? -1 : 1
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    b.box('stone', [0.5, 0.18, 0.5], [0, 0.09, 0], { tint: '#a39a8a' })
    b.box('lacquer', [0.3, 3.5, 0.3], [0, 1.93, 0], { tint: '#3a3a40' })
    // 柱頂的看架與彩繪瓜筒（上方彩繪、金色木雕）
    b.box('wood', [0.46, 0.2, 0.46], [0, 3.78, 0], { tint: age.beam })
    b.box('lacquer', [0.34, 0.14, 0.34], [0, 3.95, 0], { tint: '#3f6f66' })
    if (detail) for (const sx of [-1, 1]) detail.box('lacquer', [0.05, 0.12, 0.5], [sx * 0.2, 3.78, 0], { tint: GILT })
    // 左柱（篆書）：只畫幾列筆畫，不寫字（字查無）
    if (item.script === 'seal') {
      for (let k = 0; k < 8; k++) b.box('lacquer', [0.1, 0.02, 0.006], [dir * 0.152, 2.9 - k * 0.2, 0], { tint: '#c9a148', rotation: [0, (dir * Math.PI) / 2, 0] })
    }
  })
}

/** 黑色圓木柱（正殿；柱礎石磉） */
function buildRoundPillar(b, item, detail, cfg) {
  const age = ageOf(cfg)
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    b.cylinder('stone', 0.3, 0.3, 0.22, 12, [0, 0.11, 0], { tint: '#a39a8a' })
    b.cylinder('lacquer', 0.2, 0.22, 3.55, 14, [0, 2.0, 0], { tint: BLACK(age) })
    b.cylinder('lacquer', 0.22, 0.22, 0.06, 14, [0, 3.7, 0], { tint: GILT })
  })
}

/** 右側牆的垂簾：照片裡一排四尊大型神將的位置；身分沒有官方出處，不畫（比照霞海城隍廟的簾幕） */
function buildWallCurtain(b, item) {
  const len = 3.6
  b.box('lacquer', [0.03, 3.0, len], [item.x, 1.6, item.z], { tint: '#b8a27a' })
  for (let k = 0; k < 9; k++) b.box('lacquer', [0.035, 3.0, 0.02], [item.x - 0.002, 1.6, item.z - len / 2 + 0.2 + k * 0.4], { tint: '#9e8862' })
  b.box('wood', [0.06, 0.08, len + 0.1], [item.x, 3.12, item.z], { tint: '#3a2a22' })
}

/** 神將前的長案（沿牆，黑色）與深色圓爐（2025 年的照片，只有遠景；材質與款識查無，形制待核；不畫香與供品） */
function buildSideTable(b, item, detail, cfg) {
  const black = BLACK(ageOf(cfg))
  const h = 0.85
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    b.box('lacquer', [0.6, 0.07, 1.4], [0, h - 0.035, 0], { tint: black })
    for (const s of [-1, 1]) b.box('lacquer', [0.5, h - 0.07, 0.08], [0, (h - 0.07) / 2, s * 0.62], { tint: shade(black, 1.1) })
    b.box('lacquer', [0.04, h - 0.25, 1.2], [-0.25, (h - 0.25) / 2 + 0.1, 0], { tint: shade(black, 1.15) })
    b.cylinder('lacquer', 0.15, 0.11, 0.18, 18, [0, h + 0.09, 0], { tint: '#3a2e22' })
    b.cylinder('lacquer', 0.16, 0.16, 0.025, 18, [0, h + 0.19, 0], { tint: '#4a3a28' })
    b.cylinder('lacquer', 0.14, 0.14, 0.01, 14, [0, h + 0.18, 0], { tint: '#b8b0a2' })
  })
}

/** 光明燈塔：紅底的圓錐形塔，滿佈金色小燈泡（2025 年的照片） */
function buildLightTower(b, item, detail) {
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    b.box('wood', [0.5, 0.18, 0.5], [0, 0.09, 0], { tint: '#3a2a22' })
    b.cylinder('lacquer', 0.12, 0.25, 1.35, 12, [0, 0.855, 0], { tint: '#b3302a' })
    b.cylinder('lacquer', 0.03, 0.12, 0.2, 10, [0, 1.62, 0], { tint: '#d6ae52' })
    const rows = detail ? 7 : 4
    for (let r = 0; r < rows; r++) {
      const t = (r + 0.5) / rows
      const rad = 0.245 - t * 0.12
      const n = detail ? 8 : 5
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r * 0.4
        b.add('lacquer', new SphereGeometry(0.028, 5, 4), { position: [Math.cos(a) * rad, 0.3 + t * 1.2, Math.sin(a) * rad], tint: '#f3d36a' })
      }
    }
  })
}

/** 弧形黑色木牌樓式拱門：兩根黑色圓柱與一道壓扁的弧形橫樑，樑上金字「慈聖宮」在街景的招牌圖集（老屋新生；2025 年的照片） */
function buildArch(b, item, detail, cfg) {
  const age = ageOf(cfg)
  const span = 2.35
  grp(b, detail, [item.x, 0, item.z], 0, () => {
    for (const s of [-1, 1]) {
      b.cylinder('stone', 0.24, 0.24, 0.18, 12, [s * span, 0.09, 0], { tint: '#a39a8a' })
      b.cylinder('lacquer', 0.14, 0.15, 2.7, 12, [s * span, 1.53, 0], { tint: BLACK(age) })
    }
    b.add('lacquer', new TorusGeometry(span, 0.09, 6, 22, Math.PI), { position: [0, 2.75, 0], scale: [1, 0.26, 1], tint: BLACK(age) })
    b.box('lacquer', [0.7, 0.34, 0.08], [0, 3.38, 0], { tint: BLACK(age) })
    // 橫樑下的素紅小燈籠與橫樑上的透雕小件
    if (detail) {
      for (const s of [-1, 1]) {
        detail.add('lacquer', new SphereGeometry(0.09, 10, 8), { position: [s * 1.5, 2.42, 0], scale: [1, 1.2, 1], tint: '#c0392b' })
        detail.box('lacquer', [0.02, 0.28, 0.02], [s * 1.5, 2.65, 0], { tint: '#3a2a22' })
      }
      for (let k = -4; k <= 4; k++) detail.add('lacquer', new SphereGeometry(0.03, 6, 4), { position: [k * 0.5, 2.75 + Math.sqrt(Math.max(0, 1 - (k * 0.5 / span) ** 2)) * span * 0.26, 0], tint: '#e0b545' })
    }
  })
}

/** 蒲團 */
function buildCushion(b, item) {
  b.cylinder('lacquer', 0.22, 0.24, 0.12, 14, [item.x, 0.06, item.z], { tint: '#9a3a2c' })
}

/** 器物登記表：type → { build, footprint（障礙物）, height（鏡頭遮擋高度） } */
export const CS_FURNITURE = {
  stonePillar: { build: buildStonePillar, footprint: (i) => box2(i.x, i.z, 0.52, 0.52), height: () => 4.1 },
  roundPillar: { build: buildRoundPillar, footprint: (i) => box2(i.x, i.z, 0.6, 0.6), height: () => 3.8 },
  mazuShrine: { build: buildMazuShrine, footprint: (i) => box2(i.x, i.z, 3.3, 1.0), height: () => 3.7 },
  altarLong: { build: buildAltarLong, footprint: (i) => box2(i.x, i.z, 2.7, 0.8), height: () => 1.4 },
  wallCurtain: { build: buildWallCurtain, footprint: (i) => box2(i.x, i.z, 0.1, 3.6), height: () => 3.2 },
  sideTable: { build: buildSideTable, footprint: (i) => box2(i.x, i.z, 0.65, 1.45), height: () => 1.2 },
  cushion: { build: buildCushion, footprint: (i) => box2(i.x, i.z, 0.5, 0.5), height: () => 0.12 },
  lightTower: { build: buildLightTower, footprint: (i) => box2(i.x, i.z, 0.55, 0.55), height: () => 1.8 },
  // 拱門：只有兩根柱子擋路，中間可以走過（橫樑在頭上）
  arch: { build: buildArch, footprint: (i) => box2(i.x, i.z, 0.36, 0.36), height: () => 3.6, footprints: (i) => [-2.35, 2.35].map((dx) => box2(i.x + dx, i.z, 0.36, 0.36)) },
}

const footprintsOf = (item) => CS_FURNITURE[item.type].footprints?.(item) ?? [CS_FURNITURE[item.type].footprint(item)]

/* ═══════════ 碰撞 ═══════════ */

/** 殿內的障礙物（殿的本地座標）：器物（靠牆的補到牆裡）、人物、神龕一帶、拜亭的步口柱 */
export function csObstacles(eraId) {
  const list = csItemsFor(eraId)
    .filter((i) => i.block !== false)
    .flatMap((i) => footprintsOf(i).map((fp) => snapToWalls(fp, H.room, NO_PARTITION)))
  for (const npc of csNpcFor(eraId)) list.push(box2(npc.x, npc.z, 0.5, 0.5))
  // 信眾走到供桌前約 1 m 為止（謝宗榮：神龕周圍信眾不進入）：以後整片擋住
  list.push(rect(H.room.minX - 0.3, H.room.maxX + 0.3, H.room.minZ - 0.3, H.limitZ))
  for (const c of H.columns) list.push(box2(c.x, c.z, c.r * 2, c.r * 2))
  // 切開重疊時的浮點誤差會讓相鄰的方塊差 1e-15：湊成 1e-6 的整數倍，避免「重疊」的假警報
  const snap = (v) => Math.round(v * 1e6) / 1e6
  return disjoint(list).map((r) => ({ minX: snap(r.minX), maxX: snap(r.maxX), minZ: snap(r.minZ), maxZ: snap(r.maxZ) }))
}

/**
 * 可行走範圍（世界座標）：石階的斜面（廟埕 y 0 → 台基 y 0.45）、拜亭、中門、殿內；都標 inBuilding
 * （換年代時人物移到戶外；慈聖宮四個年代都有殿內，同一套範圍）
 */
export function ciShengCollision(transform, eraId) {
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
  const obstacles = csObstacles(eraId).map((r) => rectOf(transform, toTemple(r)))
  return { walkable, obstacles }
}

/* ═══════════ 街景裡的部分（外殼、匾聯、遮擋、室內範圍、人物） ═══════════ */

/** 匾聯與桌堵的字（殿的本地座標；左右以殿的本地座標為準） */
function signs(b, eraId) {
  const room = H.room
  // 三川殿中門內側上方（朝殿內）：紅底金字的大匾「惠澤覃敷」（大正九年稻江平樂社獻；外側門楣與廟名額之間沒有空間）
  b.group([0, 0, room.maxZ - 0.06], Math.PI, () => {
    b.box('plain', [1.6, 0.72, 0.06], [0, 3.36, 0.03], { tint: GILT })
    b.addSign({ text: '惠澤覃敷', style: 'red', width: 1.0, height: 0.56, position: [0, 3.36, 0.065] })
    // 款識在兩側的紅底上：只寫看得清楚的字，社員姓名看不清，用「□」（使用者 2026-11-05）
    for (const s of [-1, 1]) b.box('plain', [0.26, 0.62, 0.012], [s * 0.65, 3.36, 0.062], { tint: '#8e2a1e' })
    b.addSign({ text: '大正九年元月吉日', style: 'letters', vertical: true, width: 0.16, height: 0.58, position: [0.65, 3.36, 0.072] })
    b.addSign({ text: '稻江平樂社', style: 'letters', vertical: true, width: 0.12, height: 0.56, position: [-0.59, 3.36, 0.072] })
    b.addSign({ text: '□□□仝敬獻', style: 'letters', vertical: true, width: 0.12, height: 0.56, position: [-0.71, 3.36, 0.072] })
  })
  for (const item of csItemsFor(eraId)) {
    // 右柱：陰刻描金楷書（上款同治六年丁卯端午日；一副聯的一邊，另一邊查無）
    if (item.type === 'stonePillar' && item.script === 'regular') {
      b.group([item.x, 0, item.z], -Math.PI / 2, () => {
        b.addSign({ text: '慈孃印菩薩之心西天衣鉢', style: 'lacquer', vertical: true, width: 0.2, height: 2.4, position: [0, 1.95, 0.155] })
      })
    }
    if (item.type === 'mazuShrine') {
      b.addSign({ text: '海國陽春', style: 'gold', width: 1.6, height: 0.34, position: [item.x, 3.48, item.z + 0.395] })
    }
    if (item.type === 'altarLong') {
      b.addSign({ text: '慈聖宮', style: 'gold', width: 0.9, height: 0.34, position: [item.x, 0.42, item.z + 0.335] })
    }
    if (item.type === 'arch') {
      b.addSign({ text: '慈聖宮', style: 'gold', width: 0.62, height: 0.26, position: [item.x, 3.38, item.z + 0.05] })
    }
  }
}

export function buildCiShengShell(b, cfg, detail = null) {
  const { room } = H
  const eraId = cfg.variant
  const age = ageOf(cfg)
  const restored = eraId === 'revival'
  const width = room.maxX - room.minX
  const depth = room.maxZ - room.minZ
  const midZ = (room.minZ + room.maxZ) / 2
  b.push([0, Y, -COURT_D])
  detail?.push([0, Y, -COURT_D])
  // 地坪：磨石子（老屋新生；照片）、其他年代用石板示意（早年地坪查無）
  b.box('stone', [width, 0.04, depth], [0, 0.02, midZ], { tint: age.floor, grime: restored ? 0.05 : 0.18 })
  // 兩側牆與後牆（外側也看得到；牆裙。老屋新生的側牆是淺色磁磚）
  for (const s of [-1, 1]) {
    b.box('brick', [0.25, H.wallTop, depth + 0.3], [s * (room.maxX + 0.125), H.wallTop / 2, midZ - 0.1], { tint: '#ffffff', grime: 0.15 })
    b.box('plaster', [0.03, H.wallTop - 0.2, depth], [s * (room.maxX - 0.01), (H.wallTop - 0.2) / 2 + 0.1, midZ], { tint: age.wall, grime: restored ? 0.05 : 0.2 })
    b.box('stone', [0.04, restored ? 1.2 : 0.6, depth], [s * (room.maxX - 0.02), restored ? 0.6 : 0.3, midZ], { tint: restored ? '#d9d4c6' : '#8e8678' })
  }
  b.box('brick', [width + 0.5, H.wallTop, 0.25], [0, H.wallTop / 2, room.minZ - 0.125], { tint: '#ffffff', grime: 0.15 })
  b.box('plaster', [width, H.wallTop - 0.2, 0.03], [0, (H.wallTop - 0.2) / 2 + 0.1, room.minZ + 0.01], { tint: age.wall, grime: 0.15 })
  // 正面牆的內側（中門兩側）
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? room.minX : H.door.maxX
    const x1 = s < 0 ? H.door.minX : room.maxX
    b.box('plaster', [x1 - x0, H.wallTop - 0.2, 0.03], [(x0 + x1) / 2, (H.wallTop - 0.2) / 2 + 0.1, room.maxZ + 0.01], { tint: age.wall, grime: restored ? 0.05 : 0.2 })
  }
  // 中門上方的內側（匾掛在這裡）
  b.box('plaster', [H.door.maxX - H.door.minX, H.wallTop - H.door.height - 0.2, 0.03], [0, (H.wallTop + H.door.height) / 2, room.maxZ + 0.01], { tint: age.wall, grime: restored ? 0.05 : 0.2 })
  // 屋頂底：望板與桁（徹上明造，桁桷外露；木色依年代燻黑）
  const roofY = H.wallTop - 0.05
  b.box('planks', [width, 0.05, depth], [0, roofY + 0.02, midZ], { tint: age.plank })
  for (let i = 0; i < 13; i++) {
    const z = room.maxZ - 0.25 - i * ((depth - 0.5) / 12)
    b.cylinder('wood', 0.09, 0.09, width, 8, [0, roofY - 0.1, z], { rotation: [0, 0, Math.PI / 2], tint: age.beam })
  }
  // 正殿「三通五瓜」的梁架示意（三根通梁、五個瓜筒；只在精緻畫質）
  if (detail) {
    for (const z of [-5.1, -6.2, -7.3]) {
      detail.cylinder('wood', 0.11, 0.11, width - 0.4, 8, [0, roofY - 0.42, z], { rotation: [0, 0, Math.PI / 2], tint: age.beam })
      // 瓜筒立在通梁上、托著上面的桁（彩繪，依年代燻黑）
      for (let k = -2; k <= 2; k++) detail.cylinder('plain', 0.08, 0.1, 0.2, 8, [k * 1.7, roofY - 0.21, z], { tint: shade(k % 2 ? '#3f6f66' : '#8e3a2c', age.soot) })
    }
  }
  // 三川殿與中庭、正殿交界的大楣
  b.box('wood', [width, 0.45, 0.3], [0, roofY - 0.4, H.splitZ], { tint: age.beam })
  b.box('plain', [width, 0.08, 0.34], [0, roofY - 0.66, H.splitZ], { tint: GILT })
  signs(b, eraId)
  // 光明燈的微光（戰後起）與老屋新生的宮燈
  for (const item of csItemsFor(eraId)) {
    if (item.type === 'lightTower') b.addGlow(item.x, 1.2, item.z, 0.45, '#ffcf70', 0.15)
  }

  // 鏡頭遮擋（殿的本地座標；y 是世界高度）：兩側牆、後牆、正面牆（中門以外）、屋頂、器物
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
  for (const item of csItemsFor(eraId)) {
    if (item.block === false) continue
    const height = CS_FURNITURE[item.type].height(item)
    for (const fp of footprintsOf(item)) b.addBlocker(fp.minX, fp.maxX, 0, Y + height, fp.minZ, fp.maxZ)
  }
  // 大楣的高度（鏡頭不穿過大楣）
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
  const npcs = csNpcFor(eraId).map((npc, i) => {
    const p = csToWorld(npc.x, npc.z)
    return {
      id: npc.id,
      zone: 'ci-sheng-gong',
      look: npc.look,
      pose: npc.pose,
      seatY: 0,
      position: [p.x, Y, p.z],
      rotationY: b.worldRotationY(npc.rotationY),
      phase: (0.37 + i * 0.29) % 1,
    }
  })
  return {
    interiors: [
      {
        id: 'ci-sheng-gong',
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
    // 跟隨鏡頭貼著障礙物的範圍延伸到石階前：走出中門轉向時，鏡頭停在正面牆前，不會退進牆裡
    followAreas: [zone(room.minX, room.maxX, room.minZ, H.steps.bottom + 0.6)],
    npcs,
  }
}

/** 按需載入的殿內擺設（器物清單；殿的本地座標，地面在台基上）。細部（宮燈…）在 detail */
export function buildCiShengInterior(b, cfg = {}, detail = b) {
  if (cfg.interior !== 'cisheng') return
  const fine = detail === b ? null : detail
  b.push([0, Y, -COURT_D])
  if (fine) fine.push([0, Y, -COURT_D])
  for (const item of csItemsFor(cfg.variant)) CS_FURNITURE[item.type].build(b, item, fine, cfg)
  // 宮燈（六角木框；老屋新生，2025 年的照片；純裝飾，只在精緻畫質）
  if (fine && cfg.variant === 'revival') {
    for (const [x, z] of [[-1.2, -4.0], [1.2, -4.0], [-2.4, -3.2], [2.4, -3.2], [-1.2, -5.0], [1.2, -5.0]]) {
      fine.cylinder('lacquer', 0.005, 0.005, 0.9, 4, [x, H.wallTop - 0.55, z], { tint: '#2a2622' })
      fine.cylinder('plain', 0.16, 0.16, 0.26, 6, [x, H.wallTop - 1.2, z], { tint: '#f1dca0' })
      for (const dy of [-0.14, 0.14]) fine.cylinder('lacquer', 0.18, 0.18, 0.04, 6, [x, H.wallTop - 1.2 + dy, z], { tint: '#2a1d17' })
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2
        fine.box('lacquer', [0.02, 0.26, 0.02], [x + Math.cos(a) * 0.165, H.wallTop - 1.2, z + Math.sin(a) * 0.165], { tint: '#2a1d17' })
      }
    }
  }
  if (fine) fine.pop()
  b.pop()
}

/** 測試用：殿內的器物清單的範圍（殿的本地座標） */
export const csItemBounds = (eraId) => csItemsFor(eraId).flatMap((item) => footprintsOf(item).map((fp) => ({ item, ...fp })))

