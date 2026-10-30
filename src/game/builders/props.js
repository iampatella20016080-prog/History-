import {
  Color,
  IcosahedronGeometry,
  LatheGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three'
import { createRng, pick } from '../utils/random.js'
import { contactShadow } from './contactShadow.js'
import { limbGeometry, lumpyClump } from './foliage.js'

/**
 * 街道擺設：木箱、茶箱、麻布袋、乾貨籃、陶甕、推車…
 * 全部以基本幾何組合並寫入 PartBuilder，最後與街景一起合併。
 * position 為物件底部中心（本地座標）。
 */

const _c = new Color()

export function shade(hex, factor) {
  _c.set(hex)
  _c.r *= factor
  _c.g *= factor
  _c.b *= factor
  return `#${_c.getHexString()}`
}

/* ── 木箱 ───────────────────────────────────── */
export function crate(b, position, { size = 0.62, height, rotationY = 0, tint = '#d8c2a2' } = {}) {
  const h = height ?? size * 0.8
  b.group(position, rotationY, () => {
    b.box('wood', [size, h, size], [0, h / 2, 0], { tint })
    const band = shade(tint, 0.72)
    b.box('wood', [size + 0.03, 0.06, size + 0.03], [0, h - 0.04, 0], { tint: band })
    b.box('wood', [size + 0.03, 0.06, size + 0.03], [0, 0.04, 0], { tint: band })
    b.box('wood', [0.05, h - 0.1, size + 0.025], [0, h / 2, 0], { tint: band })
  })
}

/* ── 茶箱（木箱貼「茶」字標籤） ───────────────── */
export function teaChest(b, position, { size = 0.56, rotationY = 0, tint = '#e4d1ae' } = {}) {
  const h = size * 1.05
  b.group(position, rotationY, () => {
    b.box('wood', [size, h, size], [0, h / 2, 0], { tint })
    b.box('dark', [size + 0.02, 0.035, size + 0.02], [0, h - 0.03, 0], { tint: '#4a3b2e' })
    b.box('dark', [size + 0.02, 0.035, size + 0.02], [0, 0.05, 0], { tint: '#4a3b2e' })
    const label = size * 0.62
    b.plane('paper', label, label, [0, h * 0.52, size / 2 + 0.004])
    b.plane('paper', label, label, [size / 2 + 0.004, h * 0.52, 0], { rotation: [0, Math.PI / 2, 0] })
  })
}

/* ── 麻布袋 ─────────────────────────────────── */
export function sack(b, position, { rotationY = 0, tint = '#f2e8d6', scale = 1, lying = false, seed = 1 } = {}) {
  const r = 0.3 * scale
  const geometry = new SphereGeometry(r, 10, 8)
  const pos = geometry.attributes.position
  const rng = createRng(seed)
  const bulge = 0.9 + rng() * 0.2
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i) * 1.2
    let z = pos.getZ(i)
    if (y < -0.55 * r) y = -0.55 * r + (y + 0.55 * r) * 0.2
    if (y > 0.5 * r) {
      const pinch = Math.max(0.3, 1 - (y - 0.5 * r) / (0.9 * r))
      x *= pinch
      z *= pinch
    }
    // 依座標產生的起伏，接縫處的重複頂點會得到相同位移，不會裂開
    const n = Math.sin(x * 23.1 + y * 17.7) * Math.cos(z * 19.3 - y * 11.1) * 0.035 * scale
    pos.setXYZ(i, x * bulge + n, y + n * 0.5, z * 0.85 + n)
  }
  geometry.computeVertexNormals()
  const lift = lying ? r * 0.8 : r * 0.56
  // 平躺時先繞 Z 軸放倒，再繞 Y 軸決定朝向（Euler 'XYZ' 會先套用 Z）
  b.add('burlap', geometry, {
    position: [position[0], position[1] + lift, position[2]],
    rotation: lying ? [0, rotationY, Math.PI / 2] : [0, rotationY, 0],
    tint,
    uvRepeat: [3, 2],
  })
  if (!lying) {
    b.cylinder('burlap', 0.04 * scale, 0.07 * scale, 0.12 * scale, 6, [position[0], position[1] + lift + r * 1.05, position[2]], {
      tint: shade(tint, 0.85),
    })
  }
}

/* ── 陶甕 ───────────────────────────────────── */
const JAR_PROFILE = [
  [0.0, 0.0],
  [0.15, 0.0],
  [0.22, 0.1],
  [0.26, 0.28],
  [0.22, 0.46],
  [0.13, 0.54],
  [0.13, 0.6],
  [0.0, 0.6],
].map(([x, y]) => new Vector2(x, y))

export function jar(b, position, { scale = 1, tint = '#6e4a34', lid = false } = {}) {
  contactShadow(b, position[0], position[1], position[2], 0.36 * scale)
  b.add('plain', new LatheGeometry(JAR_PROFILE, 10), { position, scale: [scale, scale, scale], tint })
  if (lid) {
    b.cylinder('wood', 0.16 * scale, 0.16 * scale, 0.04 * scale, 10, [position[0], position[1] + 0.62 * scale, position[2]], {
      tint: '#9c7a55',
    })
  }
}

/* ── 木桶 ───────────────────────────────────── */
export function barrel(b, position, { radius = 0.3, height = 0.72, tint = '#c9a983' } = {}) {
  contactShadow(b, position[0], position[1], position[2], radius * 1.8)
  b.cylinder('wood', radius, radius * 0.9, height, 10, [position[0], position[1] + height / 2, position[2]], { tint })
  for (const t of [0.22, 0.78]) {
    b.cylinder('dark', radius * (1.0 - t * 0.08) + 0.012, radius * (1.0 - t * 0.08) + 0.012, 0.05, 10, [position[0], position[1] + height * t, position[2]], {
      tint: '#4b3d31',
    })
  }
}

/* ── 籃中貨品 ───────────────────────────────── */
const CONTENTS = {
  shiitake: { base: '#5f3f2b' },
  'dried-shrimp': { base: '#c5714b' },
  'dried-goods': { base: '#6d5a44' },
  tea: { base: '#5a593b' },
  rice: { base: '#efe6d3' },
  beans: { base: '#b78a58' },
  peanuts: { base: '#caa173' },
}

function moundGeometry(r) {
  return new SphereGeometry(r, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2)
}

export function fillContents(b, type, center, radius, seed = 1) {
  const rng = createRng(seed)
  const [cx, cy, cz] = center
  const info = CONTENTS[type] ?? CONTENTS.beans
  const moundH = 0.28
  b.add('plain', moundGeometry(radius), { position: [cx, cy - 0.015, cz], scale: [1, moundH, 1], tint: info.base })
  const surfaceY = (dx, dz) => {
    const d = Math.min(1, Math.hypot(dx, dz) / radius)
    return cy - 0.015 + Math.sqrt(Math.max(0, 1 - d * d)) * radius * moundH
  }
  const scatter = (count, spread, place) => {
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2
      const d = Math.sqrt(rng()) * radius * spread
      const dx = Math.cos(a) * d
      const dz = Math.sin(a) * d
      place(cx + dx, surfaceY(dx, dz), cz + dz, i)
    }
  }
  if (type === 'shiitake') {
    scatter(14, 0.8, (x, y, z) => {
      const cap = new SphereGeometry(0.07, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2)
      b.add('plain', cap, {
        position: [x, y - 0.005, z],
        rotation: [(rng() - 0.5) * 0.5, rng() * 6, (rng() - 0.5) * 0.5],
        scale: [1, 0.55, 1],
        tint: pick(rng, ['#7c5236', '#8b5e3c', '#6c452f', '#94683f']),
      })
    })
  } else if (type === 'dried-shrimp') {
    scatter(34, 0.85, (x, y, z) => {
      b.add('plain', new TorusGeometry(0.028, 0.012, 3, 6, Math.PI * 1.25), {
        position: [x, y + 0.008, z],
        rotation: [rng() * 6, rng() * 6, rng() * 6],
        tint: pick(rng, ['#e39a6b', '#d9855b', '#eaa97d', '#cf7a52']),
      })
    })
  } else if (type === 'dried-goods') {
    scatter(10, 0.8, (x, y, z) => {
      b.add('plain', new IcosahedronGeometry(0.045, 0), {
        position: [x, y, z],
        rotation: [rng() * 6, rng() * 6, rng() * 6],
        scale: [1.2, 0.45, 1],
        tint: '#3b322c',
      })
    })
    scatter(9, 0.75, (x, y, z) => {
      b.cylinder('plain', 0.008, 0.008, 0.14, 4, [x, y + 0.01, z], {
        rotation: [0, rng() * 6, Math.PI / 2],
        tint: '#d2a443',
      })
    })
    scatter(8, 0.7, (x, y, z) => {
      b.cylinder('plain', 0.026, 0.028, 0.03, 7, [x, y + 0.01, z], { tint: '#c9995a' })
    })
  } else if (type === 'beans' || type === 'peanuts') {
    scatter(16, 0.8, (x, y, z) => {
      b.add('plain', new IcosahedronGeometry(0.022, 0), { position: [x, y, z], tint: shade(info.base, 0.85) })
    })
  }
}

/* ── 圓形竹篩／籃 ───────────────────────────── */
export function basket(b, position, { radius = 0.36, depth = 0.13, content = null, seed = 1 } = {}) {
  const [x, y, z] = position
  b.cylinder('bamboo', radius, radius * 0.82, depth, 14, [x, y + depth / 2, z])
  b.add('bamboo', new TorusGeometry(radius, 0.022, 4, 16), {
    position: [x, y + depth, z],
    rotation: [Math.PI / 2, 0, 0],
    tint: '#d9c08e',
  })
  if (content) fillContents(b, content, [x, y + depth - 0.01, z], radius * 0.9, seed)
}

/* ── 烏魚子竹盤 ─────────────────────────────── */
export function roeTray(b, position, { rotationY = 0 } = {}) {
  b.group(position, rotationY, () => {
    b.box('bamboo', [0.86, 0.05, 0.56], [0, 0.025, 0])
    b.box('bamboo', [0.9, 0.06, 0.04], [0, 0.05, 0.28], { tint: '#e2cb98' })
    b.box('bamboo', [0.9, 0.06, 0.04], [0, 0.05, -0.28], { tint: '#e2cb98' })
    const rng = createRng(77)
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 3; i++) {
        b.add('plain', new SphereGeometry(1, 10, 6), {
          position: [-0.26 + i * 0.26, 0.07, -0.12 + row * 0.24],
          rotation: [0, (rng() - 0.5) * 0.3, 0],
          scale: [0.115, 0.024, 0.07],
          tint: pick(rng, ['#c8662f', '#d07436', '#bd5e2b']),
        })
      }
    }
  })
}

/* ── 展示桌（長凳） ─────────────────────────── */
export function displayTable(b, position, { width = 1.7, depth = 0.6, height = 0.66, rotationY = 0, tint = '#a98562' } = {}) {
  b.group(position, rotationY, () => {
    b.box('wood', [width, 0.06, depth], [0, height - 0.03, 0], { tint })
    contactShadow(b, 0, 0, 0, width - 0.1, depth - 0.06, { spread: 0.16 })
    const lx = width / 2 - 0.08
    const lz = depth / 2 - 0.06
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.box('wood', [0.06, height - 0.06, 0.06], [sx * lx, (height - 0.06) / 2, sz * lz], { tint: shade(tint, 0.8) })
      }
    }
    b.box('wood', [width - 0.2, 0.05, 0.04], [0, 0.2, lz], { tint: shade(tint, 0.8) })
    b.box('wood', [width - 0.2, 0.05, 0.04], [0, 0.2, -lz], { tint: shade(tint, 0.8) })
  })
  return height
}

/* ── 燈籠（背景用，合併網格） ─────────────────── */
export function lantern(b, position, { tint = '#b4513b', scale = 1 } = {}) {
  const [x, y, z] = position
  b.add('plain', new SphereGeometry(0.24 * scale, 10, 8), { position: [x, y, z], scale: [1, 1.25, 1], tint })
  b.cylinder('plain', 0.13 * scale, 0.13 * scale, 0.07 * scale, 8, [x, y + 0.31 * scale, z], { tint: '#2f2620' })
  b.cylinder('plain', 0.13 * scale, 0.13 * scale, 0.07 * scale, 8, [x, y - 0.31 * scale, z], { tint: '#2f2620' })
  b.cylinder('plain', 0.015, 0.045, 0.24 * scale, 5, [x, y - 0.46 * scale, z], { tint })
}

/* ── 手推車 ─────────────────────────────────── */
export function handcart(b, position, { rotationY = 0, load = 'sacks', seed = 3 } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    const bedY = 0.55
    b.box('planks', [1.5, 0.07, 0.86], [0, bedY, 0], { tint: '#c8ac86' })
    b.box('wood', [1.5, 0.12, 0.05], [0, bedY + 0.08, 0.43], { tint: '#9a7a58' })
    b.box('wood', [1.5, 0.12, 0.05], [0, bedY + 0.08, -0.43], { tint: '#9a7a58' })
    for (const sz of [-1, 1]) {
      b.cylinder('wood', 0.42, 0.42, 0.07, 12, [-0.1, 0.42, sz * 0.5], { rotation: [Math.PI / 2, 0, 0], tint: '#8a6a4a' })
      b.cylinder('dark', 0.07, 0.07, 0.1, 6, [-0.1, 0.42, sz * 0.5], { rotation: [Math.PI / 2, 0, 0], tint: '#3b2f25' })
      b.box('wood', [1.3, 0.06, 0.06], [1.25, 0.32, sz * 0.36], { rotation: [0, 0, -0.32], tint: '#9a7a58' })
    }
    b.box('wood', [0.06, 0.5, 0.06], [0.62, 0.27, 0], { tint: '#9a7a58' })
    if (load === 'sacks') {
      sack(b, [-0.35, bedY + 0.03, -0.18], { seed: seed + 1, scale: 0.9, lying: true, rotationY: 0.2 })
      sack(b, [0.3, bedY + 0.03, 0.15], { seed: seed + 2, scale: 0.9, lying: true, rotationY: -0.3, tint: '#e6dac2' })
    } else {
      teaChest(b, [-0.3, bedY + 0.04, 0], { rotationY: rng() * 0.3 })
      teaChest(b, [0.32, bedY + 0.04, 0.05], { rotationY: -rng() * 0.3 })
    }
  })
}

/* ── 扁擔與挑籃 ─────────────────────────────── */
export function carryingPole(b, position, { rotationY = 0, content = 'rice', seed = 5 } = {}) {
  b.group(position, rotationY, () => {
    for (const sx of [-1, 1]) {
      b.cylinder('bamboo', 0.27, 0.22, 0.34, 12, [sx * 0.72, 0.17, 0])
      fillContents(b, content, [sx * 0.72, 0.33, 0], 0.24, seed + sx)
    }
    b.box('wood', [1.9, 0.05, 0.06], [0, 0.42, 0.18], { rotation: [0, 0, 0.04], tint: '#b9a070' })
  })
}

/* ── 竹竿（靠牆） ───────────────────────────── */
export function bambooPoles(b, position, { rotationY = 0, count = 3, length = 3.2 } = {}) {
  b.group(position, rotationY, () => {
    for (let i = 0; i < count; i++) {
      b.cylinder('plain', 0.035, 0.04, length, 6, [i * 0.09 - 0.09, length / 2 - 0.05, 0.25], {
        rotation: [-0.16, 0, (i - 1) * 0.04],
        tint: i % 2 ? '#b8ad79' : '#c4b886',
      })
    }
  })
}

/* ── 繩捆 ───────────────────────────────────── */
export function ropeCoil(b, position, { tint = '#b49a6c' } = {}) {
  b.add('plain', new TorusGeometry(0.2, 0.055, 6, 14), {
    position: [position[0], position[1] + 0.05, position[2]],
    rotation: [Math.PI / 2, 0, 0],
    tint,
  })
  b.add('plain', new TorusGeometry(0.15, 0.05, 6, 12), {
    position: [position[0], position[1] + 0.14, position[2]],
    rotation: [Math.PI / 2, 0, 0],
    tint: shade(tint, 0.92),
  })
}

/* ── 一堆貨（隨機組合） ─────────────────────── */
export function goodsPile(b, position, { rotationY = 0, seed = 1, kind = 'mixed' } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    if (kind === 'tea') {
      teaChest(b, [0, 0, 0], { rotationY: rng() * 0.2 })
      teaChest(b, [0.6, 0, 0.04], { rotationY: -rng() * 0.2 })
      teaChest(b, [0.3, 0.59, 0.02], { rotationY: (rng() - 0.5) * 0.3 })
    } else if (kind === 'sacks') {
      sack(b, [0, 0, 0], { seed: seed + 1 })
      sack(b, [0.5, 0, 0.08], { seed: seed + 2, tint: '#e9dcc4' })
      sack(b, [0.24, 0.36, 0.04], { seed: seed + 3, lying: true, rotationY: 0.3, scale: 0.9 })
    } else if (kind === 'crates') {
      crate(b, [0, 0, 0], { rotationY: rng() * 0.2 })
      crate(b, [0.66, 0, 0.05], { size: 0.56, rotationY: -rng() * 0.25, tint: '#cfb592' })
      crate(b, [0.28, 0.5, 0.02], { size: 0.5, rotationY: (rng() - 0.5) * 0.4, tint: '#dcc6a6' })
    } else {
      crate(b, [0, 0, 0], { rotationY: rng() * 0.3 })
      sack(b, [0.62, 0, 0.1], { seed: seed + 4 })
      jar(b, [-0.55, 0, 0.12], { scale: 0.8, tint: pick(rng, ['#6e4a34', '#58483a', '#8a6844']), lid: true })
    }
  })
}

/* ═════════════════ 第二版：各年代道具 ═════════════════ */

/* ── 糕餅木盤（餅店） ───────────────────────── */
export function pastryTray(b, position, { seed = 1, kind = 'round' } = {}) {
  const rng = createRng(seed)
  b.group(position, 0, () => {
    b.box('wood', [0.7, 0.05, 0.46], [0, 0.025, 0], { tint: '#a77c55' })
    for (const sz of [-1, 1]) b.box('wood', [0.74, 0.06, 0.03], [0, 0.05, sz * 0.23], { tint: '#8c6446' })
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const x = -0.22 + col * 0.22
        const z = -0.1 + row * 0.2
        if (kind === 'turtle') {
          b.add('plain', new SphereGeometry(1, 10, 6), {
            position: [x, 0.07, z],
            rotation: [0, (rng() - 0.5) * 0.4, 0],
            scale: [0.09, 0.035, 0.07],
            tint: pick(rng, ['#c4473a', '#b83e33', '#cf5a45']),
          })
        } else {
          b.cylinder('plain', 0.08, 0.085, 0.045, 12, [x, 0.075, z], { tint: pick(rng, ['#d8a560', '#cf9a52', '#e0b06c']) })
          b.cylinder('plain', 0.05, 0.05, 0.01, 10, [x, 0.1, z], { tint: '#f0d6a2' })
        }
      }
    }
  })
}

/* ── 米桶 ───────────────────────────────────── */
export function riceBin(b, position, { content = 'rice' } = {}) {
  const [x, y, z] = position
  b.box('wood', [0.7, 0.55, 0.55], [x, y + 0.275, z], { tint: '#b48c62' })
  b.box('wood', [0.74, 0.06, 0.59], [x, y + 0.55, z], { tint: '#8c6a48' })
  fillContents(b, content, [x, y + 0.56, z], 0.27, 5)
}

/* ── 植栽盆（修復後的街屋前） ───────────────── */
export function planter(b, position, { seed = 1, small = false } = {}) {
  const rng = createRng(seed)
  const [x, y, z] = position
  const w = small ? 0.5 : 0.9
  b.box('wood', [w, 0.42, 0.42], [x, y + 0.21, z], { tint: '#9c7a58' })
  contactShadow(b, x, y, z, w, 0.42)
  b.box('earth', [w - 0.08, 0.04, 0.34], [x, y + 0.42, z], { tint: '#6d5640' })
  const greens = ['#7f9268', '#8fa276', '#6f845d', '#9aa97f']
  if (!small && rng() < 0.6) {
    b.cylinder('wood', 0.04, 0.05, 1.0, 5, [x, y + 0.9, z], { tint: '#7a6450' })
    const tints = [pick(rng, greens), pick(rng, greens)]
    // 流暢畫質：原本的兩顆圓球
    b.variant('smooth', () => {
      b.add('plain', new IcosahedronGeometry(0.42, 1), { position: [x, y + 1.55, z], scale: [1, 0.9, 1], tint: tints[0] })
      b.add('plain', new IcosahedronGeometry(0.3, 1), { position: [x + 0.18, y + 1.35, z + 0.1], tint: tints[1] })
    })
    // 精緻畫質：主幹在上段分成兩根枝，各撐一團不規則的葉叢，枝從葉叢之間露出來
    b.variant('fine', () => {
      const tops = [
        [x - 0.08, y + 1.5, z - 0.04, 0.42, 0.9],
        [x + 0.2, y + 1.33, z + 0.1, 0.3, 1],
      ]
      b.add('wood', limbGeometry([[x, y + 1.3, z], [x - 0.05, y + 1.45, z - 0.03], [x - 0.14, y + 1.72, z - 0.08]], [0.04, 0.03, 0.016]), { tint: '#7a6450' })
      b.add('wood', limbGeometry([[x, y + 1.25, z], [x + 0.14, y + 1.33, z + 0.07], [x + 0.32, y + 1.4, z + 0.16]], [0.035, 0.025, 0.014]), { tint: '#7a6450' })
      tops.forEach(([cx, cy, cz, r, squash], k) => {
        const g = lumpyClump(r, seed * 7 + k, { satellites: 1, outward: k ? 0.5 : 2.6 })
        g.scale(1, squash, 1)
        g.translate(cx, cy, cz)
        b.add('plain', g, { tint: tints[k] })
      })
    })
  } else {
    const count = small ? 2 : 4
    for (let i = 0; i < count; i++) {
      b.add('plain', new IcosahedronGeometry(0.16 + rng() * 0.08, 1), {
        position: [x - w / 2 + 0.15 + (i + 0.5) * ((w - 0.3) / count), y + 0.55 + rng() * 0.1, z + (rng() - 0.5) * 0.12],
        tint: pick(rng, greens),
      })
    }
  }
}

/* ── 盆栽（酒樓門口） ───────────────────────── */
export function pottedPlant(b, position, { seed = 1, size = 1, potTint = '#7c4a3a' } = {}) {
  const rng = createRng(seed)
  const [x, y, z] = position
  b.cylinder('plain', 0.24 * size, 0.18 * size, 0.42 * size, 12, [x, y + 0.21 * size, z], { tint: potTint })
  contactShadow(b, x, y, z, 0.4 * size)
  b.cylinder('plain', 0.27 * size, 0.27 * size, 0.05 * size, 12, [x, y + 0.43 * size, z], { tint: shade(potTint, 0.85) })
  b.cylinder('wood', 0.03 * size, 0.045 * size, 0.6 * size, 5, [x, y + 0.7 * size, z], { tint: '#6c5440' })
  const greens = ['#5f7a52', '#6c8a5c', '#56704a']
  // 精緻畫質：葉叢不規則（缺口與外緣的小葉團），主幹上段分出細枝伸到外側的葉叢，從葉叢之間露出來；
  // 流暢畫質維持原本的圓球
  const stemTop = y + 0.95 * size
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rng()
    const r = (0.2 + rng() * 0.08) * size
    const cx = x + Math.cos(a) * 0.16 * size
    const cy = y + (0.95 + rng() * 0.25) * size
    const cz = z + Math.sin(a) * 0.16 * size
    const tint = pick(rng, greens)
    b.variant('smooth', () => b.add('plain', new IcosahedronGeometry(r, 1), { position: [cx, cy, cz], scale: [1, 0.75, 1], tint }))
    b.variant('fine', () => {
      const g = lumpyClump(r, seed * 13 + i, { satellites: i % 2 ? 1 : 0, outward: a })
      g.scale(1, 0.75, 1)
      g.translate(cx, cy, cz)
      b.add('plain', g, { tint })
      if (i % 2 === 0) {
        const reach = 0.16 + r / size * 0.9
        b.add('wood', limbGeometry([[x, stemTop - 0.18 * size, z], [x + Math.cos(a) * 0.1 * size, stemTop - 0.08 * size, z + Math.sin(a) * 0.1 * size], [x + Math.cos(a) * reach * size, cy - 0.02 * size, z + Math.sin(a) * reach * size]], [0.026 * size, 0.018 * size, 0.009 * size]), { tint: '#6c5440' })
      }
    })
  }
}

/* ── 花盆（咖啡館） ─────────────────────────── */
export function flowerPot(b, position, { seed = 1 } = {}) {
  const rng = createRng(seed)
  const [x, y, z] = position
  b.cylinder('plain', 0.17, 0.13, 0.3, 10, [x, y + 0.15, z], { tint: pick(rng, ['#b9653f', '#a75a3c', '#e6dccb']) })
  b.variant('smooth', () => b.add('plain', new IcosahedronGeometry(0.19, 1), { position: [x, y + 0.38, z], scale: [1, 0.7, 1], tint: '#6f8a5c' }))
  b.variant('fine', () => {
    const leaves = lumpyClump(0.19, seed * 5 + 1, { satellites: 1, outward: seed * 2.4 })
    leaves.scale(1, 0.7, 1)
    leaves.translate(x, y + 0.38, z)
    b.add('plain', leaves, { tint: '#6f8a5c' })
  })
  const flowers = ['#d9504a', '#f2c94c', '#f4efe6', '#d97aa0']
  for (let i = 0; i < 6; i++) {
    const a = rng() * Math.PI * 2
    b.add('plain', new IcosahedronGeometry(0.045, 0), {
      position: [x + Math.cos(a) * 0.12, y + 0.44 + rng() * 0.06, z + Math.sin(a) * 0.12],
      tint: pick(rng, flowers),
    })
  }
}

/* ── 人力車（日治時期） ─────────────────────── */
export function rickshaw(b, position, { rotationY = 0, tint = '#2f2a28', hood = '#4d433b' } = {}) {
  b.group(position, rotationY, () => {
    for (const side of [-1, 1]) {
      b.add('plain', new TorusGeometry(0.58, 0.035, 5, 22), { position: [0, 0.6, side * 0.48], tint: '#3a332d' })
      for (let k = 0; k < 6; k++) {
        b.box('wood', [1.1, 0.025, 0.025], [0, 0.6, side * 0.48], { rotation: [0, 0, (k / 6) * Math.PI], tint: '#6d5a48' })
      }
    }
    b.box('plain', [0.06, 0.06, 1.0], [0, 0.6, 0], { tint: '#3a332d' })
    b.box('plain', [0.75, 0.12, 0.9], [-0.05, 0.92, 0], { tint })
    b.box('plain', [0.1, 0.62, 0.9], [-0.42, 1.25, 0], { rotation: [0, 0, 0.18], tint })
    b.box('cloth', [0.5, 0.5, 0.92], [-0.35, 1.45, 0], { rotation: [0, 0, -0.5], tint: hood })
    b.box('plain', [0.3, 0.06, 0.86], [0.38, 0.62, 0], { rotation: [0, 0, -0.3], tint })
    for (const side of [-1, 1]) {
      b.box('wood', [2.0, 0.05, 0.05], [1.15, 0.5, side * 0.32], { rotation: [0, 0, -0.27], tint: '#5d4a3a' })
    }
  })
}

/* ── 茶館桌凳 ───────────────────────────────── */
export function teaTable(b, position, { rotationY = 0, seed = 1 } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    b.box('wood', [0.82, 0.05, 0.82], [0, 0.74, 0], { tint: '#8c6446' })
    contactShadow(b, 0, 0, 0, 0.72, 0.72, { spread: 0.16 })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box('wood', [0.05, 0.72, 0.05], [sx * 0.34, 0.36, sz * 0.34], { tint: '#6c4c34' })
    }
    for (const [sx, sz] of [[0.75, 0], [-0.75, 0], [0, 0.75]]) {
      b.cylinder('wood', 0.17, 0.17, 0.05, 10, [sx, 0.44, sz], { tint: '#9a7452' })
      b.cylinder('wood', 0.03, 0.03, 0.42, 5, [sx, 0.21, sz], { tint: '#6c4c34' })
      contactShadow(b, sx, 0, sz, 0.22)
    }
    b.add('plain', new SphereGeometry(0.08, 10, 8), { position: [0, 0.84, 0], scale: [1, 0.85, 1], tint: '#5b6f78' })
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + rng()
      b.cylinder('plain', 0.03, 0.025, 0.04, 8, [Math.cos(a) * 0.22, 0.79, Math.sin(a) * 0.22], { tint: '#efe8da' })
    }
  })
}

/* ── 小販推車 ───────────────────────────────── */
export function vendorCart(b, position, { rotationY = 0, seed = 1, content = 'peanuts' } = {}) {
  b.group(position, rotationY, () => {
    b.box('wood', [1.3, 0.5, 0.7], [0, 0.75, 0], { tint: '#b98f68' })
    b.box('wood', [1.36, 0.05, 0.76], [0, 1.02, 0], { tint: '#93714f' })
    for (const side of [-1, 1]) {
      b.cylinder('wood', 0.36, 0.36, 0.06, 12, [-0.2, 0.36, side * 0.42], { rotation: [Math.PI / 2, 0, 0], tint: '#6d5440' })
      b.cylinder('wood', 0.025, 0.025, 1.2, 5, [side * 0.6, 1.6, -0.3], { tint: '#6d5440' })
      b.cylinder('wood', 0.025, 0.025, 1.2, 5, [side * 0.6, 1.6, 0.3], { tint: '#6d5440' })
    }
    b.box('cloth', [1.5, 0.04, 0.95], [0, 2.22, 0], { rotation: [0.08, 0, 0], tint: '#d9cdb4' })
    b.box('wood', [0.9, 0.05, 0.05], [1.0, 0.75, 0.25], { tint: '#6d5440' })
    b.box('wood', [0.9, 0.05, 0.05], [1.0, 0.75, -0.25], { tint: '#6d5440' })
    basket(b, [-0.3, 1.04, 0], { radius: 0.24, depth: 0.1, content, seed })
    basket(b, [0.32, 1.04, 0], { radius: 0.22, depth: 0.1, content: 'beans', seed: seed + 1 })
  })
}

/* ── 路燈 ───────────────────────────────────── */
/**
 * style：electric-pole（日治木電桿）｜deco（1930 年代鑄鐵燈柱）｜
 *        utility（戰後水泥電桿）｜heritage（當代仿古燈柱）
 * 會順便登記燈火光暈與地面光圈。
 */
export function streetLamp(b, position, { style = 'deco', rotationY = 0 } = {}) {
  b.group(position, rotationY, () => {
    if (style === 'electric-pole') {
      b.cylinder('wood', 0.09, 0.12, 6.2, 7, [0, 3.1, 0], { tint: '#6f5a46', grime: 0.3 })
      b.box('wood', [0.08, 0.08, 1.2], [0, 5.6, 0], { tint: '#5e4b3b' })
      b.box('plain', [0.04, 0.04, 1.1], [0, 4.6, 0.55], { tint: '#3d3a36' })
      b.cylinder('plain', 0.04, 0.3, 0.18, 10, [0, 4.42, 1.08], { tint: '#3e4a45' })
      b.add('bulb', new SphereGeometry(0.1, 8, 6), { position: [0, 4.32, 1.08], tint: '#fff3d8' })
      b.addGlow(0, 4.3, 1.08, 2.4, '#ffd08a')
      b.addPool(0, 1.1, 2.6, '#ffc77a')
    } else if (style === 'deco') {
      b.cylinder('plain', 0.22, 0.28, 0.5, 8, [0, 0.25, 0], { tint: '#2f3b36' })
      b.cylinder('plain', 0.06, 0.09, 3.0, 8, [0, 1.95, 0], { tint: '#2f3b36' })
      b.cylinder('plain', 0.14, 0.1, 0.18, 8, [0, 3.48, 0], { tint: '#3a4842' })
      b.add('bulb', new SphereGeometry(0.24, 12, 10), { position: [0, 3.78, 0], tint: '#fff4dc' })
      b.cylinder('plain', 0.05, 0.12, 0.12, 8, [0, 4.06, 0], { tint: '#3a4842' })
      b.addGlow(0, 3.78, 0, 2.6, '#ffd59a')
      b.addPool(0, 0, 2.8, '#ffcf88')
    } else if (style === 'utility') {
      b.cylinder('stone', 0.12, 0.17, 7.6, 8, [0, 3.8, 0], { tint: '#b8b2a6', grime: 0.3 })
      for (const y of [6.8, 7.3]) {
        b.box('plain', [0.09, 0.09, 1.5], [0, y, 0], { tint: '#5a5852' })
        for (const z of [-0.6, -0.2, 0.2, 0.6]) b.cylinder('plain', 0.04, 0.05, 0.12, 6, [0, y + 0.1, z], { tint: '#efeae0' })
      }
      b.box('plain', [0.05, 0.05, 1.3], [0, 5.2, 0.6], { tint: '#4a4844' })
      b.cylinder('plain', 0.06, 0.24, 0.14, 8, [0, 5.1, 1.24], { tint: '#6f7672' })
      b.add('bulb', new SphereGeometry(0.08, 8, 6), { position: [0, 5.0, 1.24], tint: '#fff1d0' })
      b.addGlow(0, 5.0, 1.24, 2.0, '#ffe2b0')
      b.addPool(0, 1.2, 2.4, '#ffe0ac')
    } else {
      b.cylinder('plain', 0.2, 0.24, 0.4, 8, [0, 0.2, 0], { tint: '#22262a' })
      b.cylinder('plain', 0.07, 0.08, 3.1, 8, [0, 1.9, 0], { tint: '#22262a' })
      b.box('plain', [0.36, 0.06, 0.36], [0, 3.48, 0], { tint: '#22262a' })
      b.box('bulb', [0.26, 0.42, 0.26], [0, 3.72, 0], { tint: '#fff6e2' })
      b.cylinder('plain', 0.02, 0.28, 0.22, 4, [0, 4.04, 0], { rotation: [0, Math.PI / 4, 0], tint: '#22262a' })
      b.addGlow(0, 3.72, 0, 2.2, '#ffe6bc')
      b.addPool(0, 0, 2.6, '#ffe0b0')
    }
  })
}

/* ── 咖啡座 ─────────────────────────────────── */
export function cafeSet(b, position, { rotationY = 0, seed = 1, modern = false } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    const top = modern ? '#c9a77c' : '#f2ede2'
    b.cylinder(modern ? 'wood' : 'plain', 0.36, 0.36, 0.04, 16, [0, 0.74, 0], { tint: top })
    b.cylinder('plain', 0.03, 0.03, 0.7, 6, [0, 0.38, 0], { tint: '#2d2a28' })
    b.cylinder('plain', 0.2, 0.22, 0.03, 10, [0, 0.02, 0], { tint: '#2d2a28' })
    contactShadow(b, 0, 0, 0, 0.5)
    for (const side of [-1, 1]) {
      const cx = side * 0.62
      b.group([cx, 0, 0], side > 0 ? -Math.PI / 2 : Math.PI / 2, () => {
        b.cylinder(modern ? 'wood' : 'plain', 0.2, 0.2, 0.04, 12, [0, 0.46, 0], { tint: modern ? '#b48e64' : '#5a3a2c' })
        contactShadow(b, 0, 0, 0, 0.32)
        for (const [lx, lz] of [[0.13, 0.13], [-0.13, 0.13], [0.13, -0.13], [-0.13, -0.13]]) {
          b.box('plain', [0.025, 0.45, 0.025], [lx, 0.23, lz], { tint: '#2d2a28' })
        }
        b.box('plain', [0.36, 0.4, 0.03], [0, 0.72, -0.18], { rotation: [-0.12, 0, 0], tint: modern ? '#b48e64' : '#5a3a2c' })
      })
    }
    b.cylinder('plain', 0.035, 0.03, 0.08, 8, [0.12, 0.8, 0.05], { tint: '#f4efe6' })
    if (rng() < 0.6) b.cylinder('plain', 0.035, 0.03, 0.08, 8, [-0.1, 0.8, -0.08], { tint: '#f4efe6' })
    b.cylinder('plain', 0.04, 0.03, 0.12, 6, [0, 0.82, 0.12], { tint: '#6f8a5c' })
  })
}

/* ── 腳踏車 ─────────────────────────────────── */
export function bicycle(b, position, { rotationY = 0, tint = '#2f3b36' } = {}) {
  b.group(position, rotationY, () => {
    for (const x of [-0.52, 0.52]) {
      b.add('plain', new TorusGeometry(0.33, 0.025, 4, 18), { position: [x, 0.35, 0], tint: '#262421' })
      b.box('plain', [0.04, 0.04, 0.06], [x, 0.35, 0], { tint: '#555' })
    }
    b.box('plain', [0.75, 0.035, 0.035], [-0.05, 0.62, 0], { rotation: [0, 0, 0.12], tint })
    b.box('plain', [0.62, 0.035, 0.035], [-0.2, 0.47, 0], { rotation: [0, 0, -0.62], tint })
    b.box('plain', [0.5, 0.035, 0.035], [0.27, 0.48, 0], { rotation: [0, 0, 1.0], tint })
    b.box('plain', [0.035, 0.42, 0.035], [-0.3, 0.6, 0], { rotation: [0, 0, 0.3], tint })
    b.box('plain', [0.22, 0.05, 0.1], [-0.36, 0.83, 0], { tint: '#3a2a22' })
    b.box('plain', [0.035, 0.4, 0.035], [0.44, 0.62, 0], { rotation: [0, 0, -0.25], tint })
    b.box('plain', [0.04, 0.04, 0.48], [0.4, 0.84, 0], { tint: '#262421' })
    b.box('wood', [0.3, 0.06, 0.32], [-0.6, 0.66, 0], { tint: '#8c6a48' })
  })
}

/* ── 老爺車（1930 年代） ─────────────────────── */
export function vintageCar(b, position, { rotationY = 0, tint = '#28352f' } = {}) {
  b.group(position, rotationY, () => {
    b.box('plain', [3.4, 0.5, 1.5], [0, 0.72, 0], { tint })
    b.box('plain', [1.5, 0.7, 1.36], [-0.35, 1.3, 0], { tint })
    b.box('plain', [1.56, 0.08, 1.42], [-0.35, 1.68, 0], { tint: shade(tint, 0.85) })
    for (const side of [-1, 1]) {
      b.box('glass', [0.55, 0.42, 0.04], [-0.65, 1.32, side * 0.69])
      b.box('glass', [0.55, 0.42, 0.04], [0.0, 1.32, side * 0.69])
    }
    b.box('glass', [0.04, 0.45, 1.2], [0.42, 1.33, 0])
    b.box('plain', [1.3, 0.45, 1.3], [1.15, 0.85, 0], { tint })
    b.box('plain', [0.08, 0.5, 1.0], [1.82, 0.85, 0], { tint: '#b8b2a6' })
    for (const x of [-1.15, 1.2]) {
      for (const side of [-1, 1]) {
        b.cylinder('plain', 0.36, 0.36, 0.22, 14, [x, 0.36, side * 0.72], { rotation: [Math.PI / 2, 0, 0], tint: '#1e1d1b' })
        b.cylinder('plain', 0.16, 0.16, 0.24, 10, [x, 0.36, side * 0.72], { rotation: [Math.PI / 2, 0, 0], tint: '#c9c2b2' })
        b.box('plain', [0.95, 0.06, 0.32], [x, 0.76, side * 0.66], { rotation: [0, 0, 0.0], tint: shade(tint, 0.8) })
      }
    }
    for (const side of [-1, 1]) {
      b.cylinder('bulb', 0.11, 0.11, 0.1, 10, [1.86, 1.1, side * 0.45], { rotation: [0, 0, Math.PI / 2], tint: '#fff2d6' })
      b.box('plain', [1.6, 0.05, 0.12], [0.2, 0.5, side * 0.82], { tint: '#3a3632' })
    }
  })
}

/* ── 板凳 ───────────────────────────────────── */
export function stool(b, position, { tint = '#c96a4a' } = {}) {
  const [x, y, z] = position
  b.cylinder('plain', 0.15, 0.15, 0.04, 10, [x, y + 0.42, z], { tint })
  contactShadow(b, x, y, z, 0.24)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    b.box('plain', [0.03, 0.42, 0.03], [x + Math.cos(a) * 0.1, y + 0.21, z + Math.sin(a) * 0.1], { tint: shade(tint, 0.8) })
  }
}

export function bench(b, position, { rotationY = 0, length = 1.6, modern = false } = {}) {
  b.group(position, rotationY, () => {
    for (let i = 0; i < 3; i++) {
      b.box('wood', [length, 0.04, 0.12], [0, 0.45, -0.14 + i * 0.14], { tint: modern ? '#b48e64' : '#8c6a48' })
    }
    contactShadow(b, 0, 0, 0, length - 0.2, 0.36, { spread: 0.16 })
    for (const side of [-1, 1]) {
      b.box(modern ? 'plain' : 'wood', [0.06, 0.45, 0.42], [side * (length / 2 - 0.15), 0.225, 0], { tint: modern ? '#2a2c2e' : '#6c4c34' })
    }
    if (modern) b.box('wood', [length, 0.32, 0.04], [0, 0.72, -0.2], { rotation: [-0.12, 0, 0], tint: '#b48e64' })
  })
}

/* ── 小吃攤（戰後廟口） ─────────────────────── */
const STALL_DISHES = ['鹹粥', '米粉湯', '肉羹', '油飯', '麵線', '四神湯', '炸物', '豬腳']

export function foodStall(b, position, { rotationY = 0, seed = 1, canopy = '#d9cdb4', sign = true } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    // 攤台
    b.box('wood', [1.9, 0.85, 0.8], [0, 0.425, 0], { tint: '#9a7656' })
    contactShadow(b, 0, 0, 0, 1.9, 0.8)
    b.box('plain', [2.0, 0.05, 0.9], [0, 0.875, 0], { tint: '#d8d4c8' })
    // 棚架
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.cylinder('plain', 0.025, 0.025, 2.4, 5, [sx * 0.95, 1.2, sz * 0.45], { tint: '#6c6a64' })
    }
    b.box('cloth', [2.4, 0.04, 1.5], [0, 2.4, 0.1], { rotation: [0.12, 0, 0], tint: canopy })
    b.box('cloth', [2.4, 0.22, 0.03], [0, 2.3, 0.86], { tint: shade(canopy, 0.85) })
    // 蒸籠與大鍋
    for (let k = 0; k < 3; k++) {
      b.cylinder('bamboo', 0.23, 0.23, 0.12, 14, [-0.55, 0.96 + k * 0.125, 0], { tint: '#d8bd86' })
    }
    b.cylinder('bamboo', 0.24, 0.24, 0.06, 14, [-0.55, 1.34, 0], { tint: '#cbb07a' })
    b.addSteam(-0.55, 1.4, 0, 1)
    b.cylinder('plain', 0.27, 0.22, 0.32, 14, [0.3, 1.05, 0], { tint: '#3f3b38' })
    b.cylinder('plain', 0.29, 0.29, 0.03, 14, [0.3, 1.21, 0], { tint: '#57524d' })
    b.addSteam(0.3, 1.26, 0, 0.8)
    // 碗盤
    for (let i = 0; i < 5; i++) {
      b.cylinder('plain', 0.07, 0.045, 0.06, 10, [0.75 + (i % 2) * 0.12, 0.93 + Math.floor(i / 2) * 0.06, -0.2 + (i % 3) * 0.08], {
        tint: pick(rng, ['#f2efe6', '#e9eef0', '#efe6d2']),
      })
    }
    // 價目牌
    if (sign) {
      const text = pick(rng, STALL_DISHES)
      b.box('wood', [0.08, 0.95, 0.5], [1.0, 1.62, 0.3], { tint: '#6c4c34' })
      b.addSign({ text, style: 'menu', vertical: true, width: 0.42, height: 0.85, position: [1.045, 1.62, 0.3], rotationY: Math.PI / 2 })
      b.addSign({ text, style: 'menu', vertical: true, width: 0.42, height: 0.85, position: [0.955, 1.62, 0.3], rotationY: -Math.PI / 2 })
    }
    // 板凳
    for (let i = 0; i < 3; i++) stool(b, [-0.6 + i * 0.6, 0, 0.85], { tint: pick(rng, ['#c96a4a', '#5f8fa3', '#e0b04c']) })
  })
}

/* ── 載貨三輪車 ─────────────────────────────── */
export function cargoTricycle(b, position, { rotationY = 0, tint = '#3d5a6b' } = {}) {
  b.group(position, rotationY, () => {
    b.add('plain', new TorusGeometry(0.3, 0.03, 4, 18), { position: [0.85, 0.32, 0], tint: '#262421' })
    for (const side of [-1, 1]) {
      b.add('plain', new TorusGeometry(0.3, 0.03, 4, 18), { position: [-0.55, 0.32, side * 0.45], tint: '#262421' })
    }
    b.box('plain', [1.2, 0.04, 0.04], [0.25, 0.62, 0], { rotation: [0, 0, 0.1], tint })
    b.box('plain', [0.22, 0.05, 0.1], [0.45, 0.88, 0], { tint: '#3a2a22' })
    b.box('plain', [0.04, 0.45, 0.04], [0.82, 0.75, 0], { rotation: [0, 0, -0.25], tint })
    b.box('plain', [0.04, 0.04, 0.5], [0.76, 0.98, 0], { tint: '#262421' })
    b.box('wood', [0.9, 0.42, 0.95], [-0.5, 0.75, 0], { tint: '#8c6a48' })
    sack(b, [-0.55, 0.96, -0.2], { seed: 7, scale: 0.75, lying: true })
    crate(b, [-0.45, 0.96, 0.22], { size: 0.45, tint: '#cfb592' })
  })
}

/* ── 三輪客車（戰後；歷史情境重建：前面是腳踏車的車頭與踏板，後面是兩輪的客座與折疊車篷） ── */
export function pedicab(b, position, { rotationY = 0, tint = '#3b4f5e', hood = '#4a4440' } = {}) {
  b.group(position, rotationY, () => {
    // 前輪與車頭（車頭面向本地 +x）
    b.add('plain', new TorusGeometry(0.33, 0.028, 4, 18), { position: [1.0, 0.35, 0], tint: '#262421' })
    b.box('plain', [0.035, 0.5, 0.035], [0.96, 0.62, 0], { rotation: [0, 0, -0.2], tint })
    b.box('plain', [0.04, 0.04, 0.52], [0.9, 0.9, 0], { tint: '#262421' })
    b.box('plain', [0.9, 0.04, 0.04], [0.5, 0.6, 0], { rotation: [0, 0, 0.12], tint })
    b.box('plain', [0.035, 0.38, 0.035], [0.22, 0.66, 0], { rotation: [0, 0, 0.25], tint })
    b.box('plain', [0.22, 0.05, 0.1], [0.18, 0.86, 0], { tint: '#3a2a22' })
    b.box('plain', [0.1, 0.1, 0.1], [0.35, 0.35, 0], { tint: '#555' })
    // 後軸與兩個後輪
    for (const side of [-1, 1]) b.add('plain', new TorusGeometry(0.33, 0.028, 4, 18), { position: [-0.55, 0.35, side * 0.5], tint: '#262421' })
    b.box('plain', [0.05, 0.05, 1.0], [-0.55, 0.35, 0], { tint: '#3a332d' })
    // 客座：車廂、座墊、靠背與腳踏板
    b.box('plain', [0.75, 0.32, 0.86], [-0.5, 0.52, 0], { tint })
    b.box('cloth', [0.5, 0.08, 0.8], [-0.45, 0.66, 0], { tint: '#8a3f36' })
    b.box('plain', [0.08, 0.55, 0.86], [-0.86, 0.95, 0], { rotation: [0, 0, 0.15], tint })
    b.box('plain', [0.22, 0.04, 0.6], [0.2, 0.36, 0], { tint: '#3a332d' })
    // 折起來的車篷
    b.box('cloth', [0.42, 0.42, 0.9], [-0.86, 1.3, 0], { rotation: [0, 0, -0.45], tint: hood })
    for (const side of [-1, 1]) b.box('plain', [0.025, 0.5, 0.025], [-0.78, 1.0, side * 0.44], { rotation: [0, 0, -0.3], tint: '#3a332d' })
  })
}

/* ── A 字立牌（當代咖啡館） ─────────────────── */
export function aBoard(b, position, { rotationY = 0 } = {}) {
  b.group(position, rotationY, () => {
    for (const side of [-1, 1]) {
      b.box('wood', [0.55, 0.8, 0.03], [0, 0.4, side * 0.12], { rotation: [side * 0.16, 0, 0], tint: '#b48e64' })
      b.box('dark', [0.45, 0.62, 0.01], [0, 0.42, side * 0.135], { rotation: [side * 0.16, 0, 0], tint: '#2d3330' })
    }
    for (let i = 0; i < 3; i++) {
      b.box('plain', [0.28 - i * 0.05, 0.02, 0.012], [0, 0.6 - i * 0.12, 0.15], { rotation: [0.16, 0, 0], tint: '#f2eee4' })
    }
  })
}

/* ── 說明牌（歷史情境重建的標示） ───────────── */
export function placard(b, position, { rotationY = 0, text = '', width = 2.3, height = 0.46 } = {}) {
  b.group(position, rotationY, () => {
    for (const side of [-1, 1]) {
      const x = side * (width / 2 - 0.16)
      b.box('stone', [0.24, 0.12, 0.24], [x, 0.06, 0], { tint: '#bdb4a3' })
      b.box('wood', [0.07, 1.42, 0.07], [x, 0.76, -0.02], { tint: '#4a362a' })
    }
    b.box('wood', [width + 0.14, height + 0.14, 0.06], [0, 1.24, 0], { tint: '#3f2e24' })
    b.box('wood', [width + 0.24, 0.05, 0.14], [0, 1.24 + height / 2 + 0.09, 0], { tint: '#3f2e24' })
    b.addSign({ text, style: 'label', width, height, position: [0, 1.24, 0.032] })
  })
}

/* ── 摩登年代的街道設施 ─────────────────────── */

/** 招牌桿：路邊立著的直式招牌（雙面字） */
export function signPole(b, position, { rotationY = 0, text = '喫茶', style = 'deco', height = 2.4 } = {}) {
  b.group(position, rotationY, () => {
    b.box('stone', [0.36, 0.14, 0.36], [0, 0.07, 0], { tint: '#c9c3b6' })
    b.cylinder('plain', 0.035, 0.045, height, 8, [0, height / 2, 0], { tint: '#2e2b27' })
    const boardH = 1.15
    const y = height - boardH / 2 - 0.12
    b.box('plain', [0.46, boardH + 0.08, 0.06], [0.27, y, 0], { tint: '#2e2b27' })
    const sign = { text, style, vertical: true, width: 0.38, height: boardH }
    b.addSign({ ...sign, position: [0.27, y, 0.032] })
    b.addSign({ ...sign, position: [0.27, y, -0.032], rotationY: Math.PI })
    b.add('plain', new SphereGeometry(0.05, 8, 6), { position: [0, height + 0.03, 0], tint: '#b8955a' })
  })
}

/** 報紙架：木架上一疊疊折好的報紙 */
export function newsStand(b, position, { rotationY = 0 } = {}) {
  b.group(position, rotationY, () => {
    b.box('wood', [0.9, 0.06, 0.42], [0, 0.62, 0], { tint: '#7a5a3e' })
    b.box('wood', [0.9, 0.5, 0.04], [0, 1.0, -0.19], { rotation: [-0.25, 0, 0], tint: '#6a4a32' })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box('wood', [0.04, 0.62, 0.04], [sx * 0.42, 0.31, sz * 0.18], { tint: '#5a3e2a' })
    }
    for (let i = 0; i < 3; i++) {
      const x = -0.28 + i * 0.28
      b.box('plain', [0.24, 0.06, 0.3], [x, 0.68, 0.02], { tint: '#efe8d6' })
      b.box('plain', [0.24, 0.32, 0.01], [x, 1.0, -0.15], { rotation: [-0.25, 0, 0], tint: '#f2ecdc' })
      for (let k = 0; k < 4; k++) b.box('plain', [0.18, 0.018, 0.005], [x, 1.1 - k * 0.06, -0.142 + k * 0.015], { rotation: [-0.25, 0, 0], tint: '#5a5248' })
    }
  })
}

/** 海報欄：木框佈告欄上的幾張電影與展覽海報（色塊與幾何圖形，不寫字） */
export function posterBoard(b, position, { rotationY = 0, seed = 1 } = {}) {
  const rng = createRng(seed)
  b.group(position, rotationY, () => {
    for (const sx of [-1, 1]) b.box('wood', [0.08, 2.1, 0.08], [sx * 0.75, 1.05, 0], { tint: '#4a3628' })
    b.box('wood', [1.6, 1.15, 0.06], [0, 1.45, 0], { tint: '#6a4a32' })
    b.box('wood', [1.72, 0.08, 0.2], [0, 2.07, 0.04], { tint: '#4a3628' })
    const palettes = [['#c9564a', '#f0e2c0', '#2f3f5c'], ['#2f6b5a', '#e8d9b0', '#b98f4f'], ['#e0c36a', '#3f4f63', '#efe6d4'], ['#9a4a5e', '#f2e8d4', '#2b2622']]
    for (let i = 0; i < 3; i++) {
      const [bg, fg, ink] = pick(rng, palettes)
      const x = -0.5 + i * 0.5
      const tilt = (rng() - 0.5) * 0.05
      b.box('plain', [0.42, 0.95, 0.01], [x, 1.45, 0.035], { rotation: [0, 0, tilt], tint: bg })
      b.add('plain', new SphereGeometry(0.12, 10, 6), { position: [x, 1.62, 0.04], scale: [1, 1, 0.08], tint: fg })
      b.box('plain', [0.3, 0.05, 0.01], [x, 1.22, 0.042], { tint: ink })
      b.box('plain', [0.22, 0.04, 0.01], [x, 1.13, 0.042], { tint: ink })
    }
  })
}
