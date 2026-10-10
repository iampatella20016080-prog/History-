import {
  Color,
  IcosahedronGeometry,
  LatheGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three'
import { createRng, pick } from '../utils/random.js'

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
  b.add('plain', new LatheGeometry(JAR_PROFILE, 10), { position, scale: [scale, scale, scale], tint })
  if (lid) {
    b.cylinder('wood', 0.16 * scale, 0.16 * scale, 0.04 * scale, 10, [position[0], position[1] + 0.62 * scale, position[2]], {
      tint: '#9c7a55',
    })
  }
}

/* ── 木桶 ───────────────────────────────────── */
export function barrel(b, position, { radius = 0.3, height = 0.72, tint = '#c9a983' } = {}) {
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
