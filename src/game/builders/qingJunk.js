import { CylinderGeometry, IcosahedronGeometry, RingGeometry, SphereGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DECK, HATCH, JUNK, MAST, SHELTER } from '../../data/qingBoardingLayout.js'
import { TEA_CHEST } from '../../data/qingWharfLayout.js'
import { createRng } from '../utils/random.js'
import { junkHullShape } from './shapes.js'
import { wharfTeaChest } from './qingWharf.js'

/**
 * 清末搭船（港口商街）的內河帆船：船殼（畫在 components/River.jsx，隨水面起伏）與按需產生的甲板細部。
 *
 * 形制依 Davidson 1903 的基隆河帆船照片（單桅、高長方形帆、低船身、船中草蓆篷、船首圓形標記）與
 * 記憶庫〈戎克船〉的紅頭仔描述（平底、船首凸眼塗紅、長約 12 m），用在清末大稻埕標「推定相近」；
 * 舵、錨、艄棚、鋪位、貨物的擺法都查無，是歷史情境重建（docs/research/qing-boarding.md）。
 *
 * 本地座標：船心為原點、船頭 +x、甲板面 y = JUNK.deckY；只用街景既有的材質（wood、planks、bamboo、cloth、
 * plain、dark、stone、paper），不新增材質。
 */
const DECK_Y = JUNK.deckY
const WOOD_DARK = '#5d4533'
const MAT = '#c9ae7c'

/** 船中的草蓆篷：半圓筒的蓆面（兩端開口）、四根竹柱與橫向的竹條 */
function matShelter(b, detail) {
  const length = SHELTER.maxX - SHELTER.minX
  const cx = (SHELTER.minX + SHELTER.maxX) / 2
  const r = SHELTER.maxZ
  const roof = new CylinderGeometry(r, r, length, 12, 1, true, -Math.PI / 2, Math.PI)
  b.add('bamboo', roof, { position: [cx, DECK_Y + 0.42, 0], rotation: [0, 0, Math.PI / 2], scale: [1, (SHELTER.height - 0.42) / r, 1], tint: MAT })
  for (const sz of [-1, 1]) {
    for (const x of [SHELTER.minX + 0.05, SHELTER.maxX - 0.05]) {
      b.cylinder('bamboo', 0.045, 0.05, 1.0, 6, [x, DECK_Y + 0.5, sz * 1.0], { tint: '#b49a64' })
    }
    // 蓆面下緣的側板（低矮的擋板）
    b.box('wood', [length, 0.42, 0.04], [cx, DECK_Y + 0.21, sz * (r - 0.02)], { tint: '#8d6c4d', grime: 0.3 })
  }
  // 蓆面上的橫向竹條（精緻畫質）
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (Math.PI * (i + 0.5)) / 5
    const y = DECK_Y + 0.42 + Math.sin(a + Math.PI / 2) * (SHELTER.height - 0.42) * 1.0
    const z = Math.cos(a + Math.PI / 2) * (r + 0.015)
    detail.box('bamboo', [length + 0.1, 0.03, 0.03], [cx, y, z], { rotation: [a + Math.PI / 2, 0, 0], tint: '#a88f5a' })
  }
}

/** 船尾的艄棚（舵工站的地方：小小的蓆頂與舵柄；形式查無） */
function sternShelter(b, detail) {
  const minX = -5.45
  const maxX = -4.0
  const cx = (minX + maxX) / 2
  for (const sz of [-1, 1]) {
    b.cylinder('bamboo', 0.045, 0.05, 1.35, 6, [maxX - 0.08, DECK_Y + 0.68, sz * 1.45], { tint: '#b49a64' })
  }
  b.box('bamboo', [maxX - minX + 0.3, 0.05, 3.3], [cx, DECK_Y + 1.42, 0], { rotation: [0, 0, 0.1], tint: MAT })
  // 舵柄（從船尾伸進艄棚）與舵柱
  b.cylinder('wood', 0.06, 0.08, 1.8, 6, [minX + 0.1, DECK_Y + 0.75, 0], { rotation: [0, 0, 0.35], tint: WOOD_DARK })
  b.box('wood', [0.18, 1.9, 0.12], [minX - 0.35, DECK_Y - 0.6, 0], { tint: WOOD_DARK })
  detail.box('wood', [0.08, 1.3, 0.5], [minX - 0.45, DECK_Y - 0.95, 0], { tint: '#4f3a2b' })
}

/** 船首：船眼（眼周塗紅）、錨與錨索（材質看不清，重建） */
function bow(b, detail) {
  const half = JUNK.length / 2
  const bz = JUNK.beam / 2
  for (const s of [-1, 1]) {
    b.cylinder('plain', 0.26, 0.26, 0.025, 12, [half - 0.95, 0.72, s * (bz + 0.02)], { rotation: [Math.PI / 2, 0, 0], tint: '#b8372a' })
    b.cylinder('plain', 0.17, 0.17, 0.035, 12, [half - 0.95, 0.72, s * (bz + 0.03)], { rotation: [Math.PI / 2, 0, 0], tint: '#efe6d2' })
    b.cylinder('plain', 0.075, 0.075, 0.045, 8, [half - 0.92, 0.72, s * (bz + 0.04)], { rotation: [Math.PI / 2, 0, 0], tint: '#2b231d' })
  }
  // 船首的繫纜樁與錨索捲（都在 x ≥ 4.7 的船首範圍裡，前面留通道）
  b.box('wood', [0.16, 0.5, 0.16], [half - 0.45, DECK_Y + 0.25, 0.9], { tint: WOOD_DARK })
  b.cylinder('dark', 0.4, 0.4, 0.22, 10, [half - 0.7, DECK_Y + 0.11, -0.7], { tint: '#6b5a44' })
  detail.cylinder('dark', 0.28, 0.28, 0.26, 10, [half - 0.7, DECK_Y + 0.13, -0.7], { tint: '#7a6850' })
  // 錨：木柄與鐵爪躺在甲板上（形式查無）
  b.cylinder('dark', 0.05, 0.05, 1.1, 6, [half - 0.6, DECK_Y + 0.08, 0.3], { rotation: [0, 0, Math.PI / 2], tint: '#3a3430' })
  for (const s of [-1, 1]) b.box('dark', [0.4, 0.07, 0.07], [half - 1.0, DECK_Y + 0.08, 0.3 + s * 0.18], { rotation: [0, s * 0.5, 0], tint: '#3a3430' })
}

/**
 * 船殼（畫在 River.jsx，隨水面起伏；從岸上看得到的部分）：
 * 平底的低船身、甲板面板、矮舷牆、單桅與收起的帆、船中的草蓆篷、船尾艄棚、船眼與船首的錨。
 * 貨艙口只畫框，裡面的貨與甲板上的細部按需產生（buildJunkDeck）。
 */
export function buildRiverJunk(b, detail = b) {
  const { length, beam } = JUNK
  b.extrude('wood', junkHullShape(length), beam, { position: [0, 0, -beam / 2], tint: '#8d6c4d', grime: 0.3 })
  b.box('planks', [DECK.maxX - DECK.minX, 0.08, DECK.maxZ - DECK.minZ], [(DECK.minX + DECK.maxX) / 2, DECK_Y, 0], { tint: '#bf9f7a' })
  // 矮舷牆（0.14 高，可以跨出去）
  for (const s of [-1, 1]) b.box('wood', [length * 0.88, 0.14, 0.08], [0.05, DECK_Y + 0.1, s * (beam / 2 + 0.02)], { tint: WOOD_DARK })
  // 貨艙口的框
  const hx = (HATCH.minX + 0.65 + HATCH.maxX) / 2
  const hl = HATCH.maxX - HATCH.minX - 0.65
  for (const s of [-1, 1]) {
    b.box('wood', [hl, 0.22, 0.08], [hx, DECK_Y + 0.14, s * (HATCH.maxZ - 0.04)], { tint: WOOD_DARK })
    b.box('wood', [0.08, 0.22, HATCH.maxZ * 2], [s > 0 ? HATCH.maxX - 0.04 : HATCH.minX + 0.69, DECK_Y + 0.14, 0], { tint: WOOD_DARK })
  }
  // 單桅（船中偏前）：收起的帆綁在桅邊，帆面直條拼接（照片），材質不寫
  b.cylinder('wood', 0.09, MAST.radius, MAST.height, 7, [MAST.x, DECK_Y + MAST.height / 2, 0], { tint: '#6f533b' })
  b.cylinder('cloth', 0.24, 0.24, 3.6, 8, [MAST.x - 0.25, DECK_Y + 1.75, 0.05], { rotation: [0, 0, Math.PI / 2], tint: '#b98d5f' })
  b.box('wood', [3.9, 0.06, 0.06], [MAST.x - 0.2, DECK_Y + 2.02, 0.08], { tint: WOOD_DARK })
  // 帆的橫撐與綑繩（精緻畫質）
  for (let i = -1; i <= 1; i++) detail.box('wood', [0.05, 0.56, 0.05], [MAST.x - 0.25 + i * 1.3, DECK_Y + 1.75, 0.05], { tint: WOOD_DARK })
  for (let i = -2; i <= 2; i++) detail.cylinder('dark', 0.26, 0.26, 0.03, 10, [MAST.x - 0.25 + i * 0.7, DECK_Y + 1.75, 0.05], { rotation: [0, 0, Math.PI / 2], tint: '#4a3f33' })
  matShelter(b, detail)
  sternShelter(b, detail)
  bow(b, detail)
}

/** 襯鉛的樟腦木箱（外箱尺寸查無，是重建）：木箱、箱口露出的鉛襯邊、兩道綑紮 */
function camphorBox(b, detail, [x, y, z], rotationY = 0, seed = 1) {
  const w = 0.56
  const d = 0.42
  const h = 0.4
  const rng = createRng(seed)
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [w, h, d], [0, h / 2, 0], { tint: ['#b89a6a', '#c4a677'][seed % 2], grime: 0.35 })
    // 箱口露出的鉛襯邊（用石材的批次上灰色，不多一種材質）
    b.box('stone', [w - 0.06, 0.012, d - 0.06], [0, h + 0.004, 0], { tint: '#9aa0a6' })
    for (const sx of [-0.3, 0.3]) detail.box('bamboo', [0.035, h + 0.012, d + 0.012], [sx * w, h / 2, 0], { tint: '#8c7a52' })
    detail.plane('paper', w * 0.4, h * 0.4, [0.05 + (rng() - 0.5) * 0.05, h * 0.55, d / 2 + 0.006], { tint: '#efe4c8' })
  })
}

/**
 * 甲板細部（按需產生，和店家的室內一樣；本地座標，掛在船殼的群組裡跟著起伏）：
 * 貨艙口裡的壓艙石、艙口板上的茶箱堆、旁邊的樟腦箱、蓆篷裡的鋪位與雜物、船尾的水桶與繩索。
 * 不投射也不接收陰影。
 */
export function buildJunkDeck(b, detail = b) {
  // 貨艙口：艙底的壓艙石（從艙口看得到；1867 年海關報告記戎克船把壓艙石倒進河裡）
  const floorY = DECK_Y - 0.5
  const hx0 = HATCH.minX + 0.65
  b.box('dark', [HATCH.maxX - hx0, 0.04, HATCH.maxZ * 2], [(hx0 + HATCH.maxX) / 2, floorY, 0], { tint: '#4a3f33' })
  const rng = createRng(77)
  for (let i = 0; i < 14; i++) {
    const r = 0.1 + rng() * 0.09
    const x = hx0 + 0.2 + rng() * (HATCH.maxX - hx0 - 0.4)
    const z = (rng() - 0.5) * (HATCH.maxZ * 2 - 0.4)
    b.add('stone', new IcosahedronGeometry(r, 0), { position: [x, floorY + r * 0.7, z], rotation: [rng() * 3, rng() * 3, 0], scale: [1, 0.7, 1], tint: ['#8d8a82', '#7a766c', '#9b968b'][i % 3] })
  }
  // 艙口板（前段）與上面的茶箱堆
  const boardX = HATCH.maxX - 0.6
  b.box('planks', [1.05, 0.05, HATCH.maxZ * 2 - 0.1], [boardX, DECK_Y + 0.27, 0], { tint: '#b3936b' })
  const { width: w, depth: d, height: h } = TEA_CHEST
  const chests = [
    [boardX - 0.25, 0, -0.42, 0],
    [boardX - 0.25, 0, 0.0, 0],
    [boardX - 0.25, 0, 0.42, 0],
    [boardX + 0.27, 0, -0.2, 0.08],
    [boardX + 0.27, 0, 0.22, -0.05],
    [boardX - 0.25, 1, -0.2, 0.04],
    [boardX - 0.25, 1, 0.22, -0.06],
    [boardX + 0.27, 1, 0.0, 0.1],
  ]
  chests.forEach(([x, layer, z, rot], i) => wharfTeaChest(b, detail, [x, DECK_Y + 0.3 + layer * h, z], { rotationY: rot, tint: ['#c9a77a', '#bf9c6f', '#d0b085'][i % 3], seed: 300 + i }))
  // 樟腦箱（艙口後方；清代經香港出口用襯鉛木箱，Davidson）
  camphorBox(b, detail, [HATCH.minX + 0.3, DECK_Y + 0.04, -0.55], 0.06, 1)
  camphorBox(b, detail, [HATCH.minX + 0.3, DECK_Y + 0.44, -0.55], -0.08, 2)
  camphorBox(b, detail, [HATCH.minX + 0.3, DECK_Y + 0.04, 0.5], 0.1, 3)
  // 蓆篷裡：鋪位（草蓆與捲起的被褥）與雜物（鍋具查無，只放一個陶甕與一個水桶）
  b.box('bamboo', [1.2, 0.03, 0.7], [-1.15, DECK_Y + 0.05, 0.6], { tint: '#d1bb8a' })
  b.cylinder('bamboo', 0.17, 0.17, 0.6, 8, [-1.5, DECK_Y + 0.2, 0.62], { rotation: [Math.PI / 2, 0, 0], tint: '#8a7a62' })
  b.cylinder('dark', 0.16, 0.13, 0.38, 8, [-0.1, DECK_Y + 0.19, 0.7], { tint: '#6b5240' })
  b.cylinder('wood', 0.15, 0.13, 0.3, 8, [0.2, DECK_Y + 0.15, 0.7], { tint: '#8d6c4d' })
  detail.cylinder('dark', 0.13, 0.13, 0.02, 8, [-0.1, DECK_Y + 0.39, 0.7], { tint: '#4a3f33' })
  // 後甲板右舷角落：兩個疊起的鴉片箱（進口貨，等著卸上岸；外觀查無，只畫木箱與麻繩，不畫內容物）
  for (const [y, rot] of [[0.02, 0.05], [0.38, -0.08]]) {
    b.group([-3.7, DECK_Y + y, -1.47], rot, () => {
      b.box('wood', [0.46, 0.36, 0.42], [0, 0.18, 0], { tint: '#8a6a4a', grime: 0.4 })
      detail.box('dark', [0.48, 0.03, 0.44], [0, 0.26, 0], { tint: '#5a4a38' })
    })
  }
  // 後甲板：繩索捲與水桶
  b.cylinder('dark', 0.3, 0.3, 0.16, 10, [-3.0, DECK_Y + 0.08, -0.35], { tint: '#6b5a44' })
  detail.cylinder('dark', 0.2, 0.2, 0.2, 10, [-3.0, DECK_Y + 0.1, -0.35], { tint: '#7a6850' })
  b.cylinder('wood', 0.14, 0.12, 0.3, 8, [-2.4, DECK_Y + 0.15, -1.35], { tint: '#8d6c4d' })
  // 甲板上散落的篾條與一張草蓆（精緻畫質）
  detail.box('bamboo', [1.1, 0.02, 0.6], [-3.9, DECK_Y + 0.045, 0.9], { tint: '#cdb98a' })
  for (let i = 0; i < 3; i++) detail.box('bamboo', [0.9, 0.015, 0.03], [3.9, DECK_Y + 0.05, -1.2 + i * 0.07], { rotation: [0, 0.2 + i * 0.1, 0], tint: '#9c8456' })
}

/**
 * 落水的水花（一次繪製）：水面上的一圈漣漪與幾顆水珠，components/River.jsx 依時間縮放與淡出。
 * 兩種畫質都用同一個幾何；只在落水的 0.6 秒裡畫。
 */
export function splashGeometry() {
  const parts = [new RingGeometry(0.25, 0.75, 18).rotateX(-Math.PI / 2)]
  const rng = createRng(5)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng() * 0.4
    const r = 0.25 + rng() * 0.35
    const drop = new SphereGeometry(0.05 + rng() * 0.05, 6, 4)
    drop.translate(Math.cos(a) * r, 0.25 + rng() * 0.45, Math.sin(a) * r)
    parts.push(drop)
  }
  const merged = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
  parts.forEach((g) => g.dispose())
  for (const name of Object.keys(merged.attributes)) if (name !== 'position' && name !== 'normal') merged.deleteAttribute(name)
  merged.computeBoundingSphere()
  return merged
}
