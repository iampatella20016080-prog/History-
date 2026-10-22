import { IcosahedronGeometry, TorusGeometry } from 'three'
import { MILL, MODERN, POSTWAR, RS } from '../../../data/riceAndShineLayout.js'
import { createRng } from '../../utils/random.js'
import { pottedPlant, shade } from '../props.js'
import { ricePanel } from './riceAndShineExterior.js'
import { bambooSieve, storageJar } from './riceCultureExhibit.js'

/**
 * 天井（RiceAndShineCourtyard）：前進與後進之間露天的天井，光線從上方進來，和室內的暖色燈光不同。
 * - 1930：曬稻穀的竹篩架、水缸與木勺；石板地。
 * - 1945：水缸、洗衣的木盆與晾衣繩（一部分成為住家）。
 * - 2000：潮濕的老紅磚（牆腳的深色水痕與青苔）、盆栽與小樹、左牆上的大稻埕生活壁畫（原創圖樣）。
 */
const C = RS.courtyard
const IN = RS.half - RS.wallT

function paving(b, detail, variant) {
  const w = IN * 2
  const d = C.maxZ - C.minZ + 0.4
  const cz = (C.minZ + C.maxZ) / 2
  const modern = variant === 'riceAndShineModern'
  b.box(modern ? 'brick' : 'stone', [w, 0.03, d], [0, 0.035, cz], { tint: modern ? '#8f5644' : variant === 'postwarRiceHouse' ? '#7e7a72' : '#9a958a' })
  // 中央的排水溝與石板的縫
  b.box('stone', [w, 0.012, 0.12], [0, 0.052, C.minZ + 0.25], { tint: '#5a5650' })
  const rng = createRng(77)
  for (let i = 0; i < 8; i++) detail.box('stone', [0.02, 0.006, d * (0.3 + rng() * 0.5)], [-IN + 0.4 + rng() * (w - 0.8), 0.052, cz + (rng() - 0.5) * 0.4], { tint: '#6a665e' })
  // 牆腳潮濕的深色水痕與青苔（兩側牆）
  for (const s of [-1, 1]) {
    b.box('plain', [0.006, 0.35, C.maxZ - C.minZ], [s * (IN - 0.003), 0.2, cz], { tint: modern ? '#5e3a2e' : '#4f4a42' })
    for (let i = 0; i < 5; i++) b.add('plain', new IcosahedronGeometry(0.06 + rng() * 0.05, 0), { position: [s * (IN - 0.02), 0.06, C.minZ + 0.2 + rng() * (C.maxZ - C.minZ - 0.4)], scale: [0.5, 0.6, 1.6], tint: rng() < 0.5 ? '#4f6a3a' : '#5f7a45' })
  }
}

function modernCourtyard(b, detail) {
  // 左牆：壁畫的灰泥底與壁畫（大稻埕的生活：米行、挑擔、曬穀；原創圖樣）
  const m = MODERN.mural
  const mz = (m.minZ + m.maxZ) / 2
  const mw = m.maxZ - m.minZ
  b.box('plaster', [0.03, m.y1 - m.y0 + 0.2, mw + 0.2], [-IN + 0.015, (m.y0 + m.y1) / 2, mz], { tint: '#e3d8c2', grime: 0.15 })
  ricePanel(b, 'courtyardMural', mw, mw * 0.75, [-IN + 0.035, (m.y0 + m.y1) / 2 + 0.15, mz], Math.PI / 2)
  // 牆上潮濕的老紅磚：壁畫四周露出的磚與深淺不一的補磚
  const rng = createRng(1916)
  for (let i = 0; i < 10; i++) {
    const s = i < 4 ? -1 : 1
    const z = C.minZ + 0.1 + rng() * (C.maxZ - C.minZ - 0.2)
    b.box('brick', [0.008, 0.08 + rng() * 0.12, 0.2 + rng() * 0.3], [s * (IN - 0.004), 0.4 + rng() * (s < 0 ? 0.2 : 3.2), z], { tint: rng() < 0.5 ? '#6e3a2c' : '#a8644c' })
  }
  // 小樹（磚砌的樹台、彎曲的樹幹與幾團樹葉）
  const t = MODERN.tree
  const tx = (t.minX + t.maxX) / 2
  const tz = (t.minZ + t.maxZ) / 2
  b.box('brick', [t.maxX - t.minX, 0.38, t.maxZ - t.minZ], [tx, 0.19, tz], { tint: '#8a4a38' })
  b.box('earth', [t.maxX - t.minX - 0.08, 0.03, t.maxZ - t.minZ - 0.08], [tx, 0.39, tz], { tint: '#5a4632' })
  b.cylinder('wood', 0.04, 0.07, 1.4, 6, [tx + 0.05, 1.08, tz], { rotation: [0, 0, -0.12], tint: '#6a5040' })
  b.cylinder('wood', 0.025, 0.04, 0.8, 5, [tx + 0.25, 1.9, tz + 0.1], { rotation: [0.2, 0, -0.5], tint: '#6a5040' })
  for (const [dx, dy, dz, r, c] of [
    [0.1, 2.2, 0, 0.5, '#5f7f45'],
    [0.45, 2.35, 0.25, 0.38, '#6f8f52'],
    [-0.1, 2.5, -0.15, 0.36, '#557a40'],
    [0.3, 2.7, -0.1, 0.32, '#7a9a5a'],
  ]) b.add('plain', new IcosahedronGeometry(r, 1), { position: [tx + dx, dy, tz + dz], scale: [1, 0.8, 1], tint: c })
  for (let i = 0; i < 14; i++) detail.add('plain', new IcosahedronGeometry(0.05, 0), { position: [tx + 0.15 + (rng() - 0.5) * 1.0, 2.0 + rng() * 0.9, tz + (rng() - 0.5) * 0.8], scale: [1.4, 0.4, 0.8], tint: rng() < 0.5 ? '#86a862' : '#4f6f3a' })
  // 盆栽（陶盆、大小不一）
  MODERN.pots.forEach((p, i) => {
    const px = (p.minX + p.maxX) / 2
    const pz = (p.minZ + p.maxZ) / 2
    pottedPlant(b, [px, 0.04, pz], { seed: 40 + i, size: i ? 0.95 : 0.8, potTint: i ? '#8a4f3a' : '#6e5a4a' })
  })
  // 石臼（舊的器物，放在天井當擺飾）
  const mo = MODERN.mortar
  const ox = (mo.minX + mo.maxX) / 2
  const oz = (mo.minZ + mo.maxZ) / 2
  b.cylinder('stone', 0.2, 0.22, 0.26, 14, [ox, 0.17, oz], { tint: '#8d877c' })
  b.cylinder('stone', 0.14, 0.14, 0.02, 14, [ox, 0.31, oz], { tint: '#6a665e' })
}

function millCourtyard(b, detail, variant) {
  const aged = variant === 'postwarRiceHouse'
  // 水缸、木蓋與木勺
  const wj = (aged ? POSTWAR : MILL).waterJar
  const jx = (wj.minX + wj.maxX) / 2
  const jz = (wj.minZ + wj.maxZ) / 2
  storageJar(b, jx, 0.04, jz, 0.28, 0.72, aged ? '#4a3a30' : '#5a4436', { label: false, seed: 9 })
  b.cylinder('wood', 0.2, 0.2, 0.03, 14, [jx, 0.78, jz], { tint: '#7a5534' })
  b.box('wood', [0.03, 0.03, 0.5], [jx + 0.05, 0.82, jz], { rotation: [0.3, 0.4, 0], tint: '#8a6440' })
  if (!aged) {
    // 曬稻穀的竹篩架（木架上三只裝著稻穀的竹篩）
    const dr = MILL.drying
    const dx = (dr.minX + dr.maxX) / 2
    const dz = (dr.minZ + dr.maxZ) / 2
    const w = dr.maxX - dr.minX
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('wood', [0.05, 0.6, 0.05], [dx + sx * (w / 2 - 0.05), 0.3, dz + sz * 0.32], { tint: '#6a4a30' })
    for (const sz of [-1, 1]) b.box('wood', [w, 0.05, 0.05], [dx, 0.6, dz + sz * 0.32], { tint: '#6a4a30' })
    for (let i = 0; i < 3; i++) {
      const x = dr.minX + 0.2 + i * ((w - 0.4) / 2)
      bambooSieve(b, detail, x, 0.64, dz, 0.24, { seed: 50 + i })
      b.add('plain', new IcosahedronGeometry(0.2, 1), { position: [x, 0.64, dz], scale: [1, 0.12, 1], tint: '#c4993f' })
    }
    // 靠牆的竹籮與一把竹掃帚
    b.add('bamboo', new TorusGeometry(0.22, 0.02, 4, 16), { position: [-2.4, 0.5, -7.5], rotation: [0, Math.PI / 2, 0.1], tint: '#9e7444' })
    return
  }
  // 戰後：洗衣的木盆、板凳與晾衣繩（掛著衣服）
  const wa = POSTWAR.washing
  b.cylinder('wood', 0.32, 0.28, 0.2, 16, [wa.minX + 0.35, 0.14, (wa.minZ + wa.maxZ) / 2], { tint: '#8a6a44' })
  b.cylinder('plain', 0.3, 0.3, 0.01, 16, [wa.minX + 0.35, 0.2, (wa.minZ + wa.maxZ) / 2], { tint: '#9ab0b8' })
  b.box('wood', [0.4, 0.04, 0.2], [wa.maxX - 0.25, 0.25, (wa.minZ + wa.maxZ) / 2], { tint: '#7a5a3c' })
  for (const dx of [-0.16, 0.16]) b.box('wood', [0.03, 0.23, 0.18], [wa.maxX - 0.25 + dx, 0.115, (wa.minZ + wa.maxZ) / 2], { tint: '#6a4a30' })
  b.cylinder('dark', 0.004, 0.004, IN * 2, 3, [0, 2.45, -7.1], { rotation: [0, 0, Math.PI / 2], tint: '#2a2622' })
  const rng = createRng(1958)
  for (let i = 0; i < 5; i++) {
    const x = -1.8 + i * 0.75 + (rng() - 0.5) * 0.2
    b.box('cloth', [0.4 + rng() * 0.15, 0.5 + rng() * 0.25, 0.01], [x, 2.15, -7.1], { rotation: [0, 0, (rng() - 0.5) * 0.08], tint: ['#e8e3d6', '#7a8ea0', '#c9b48a', '#a85a4a', '#e2dccc'][i] })
  }
}

export function buildRiceCourtyard(b, detail, variant) {
  paving(b, detail, variant)
  if (variant === 'riceAndShineModern') modernCourtyard(b, detail)
  else millCourtyard(b, detail, variant)
  void shade
}
