import { BufferAttribute, CylinderGeometry, IcosahedronGeometry, Matrix4, Quaternion, Vector3 } from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createRng } from '../utils/random.js'

/**
 * 葉叢與粗枝（第 9 階段・細部）：讓樹冠與盆栽的外緣不再像幾顆球。
 *
 * - lumpyClump：表面用幾道低頻起伏推擠的葉團，有凹下去的缺口與凸出的小團；
 *   下半部只往內縮，所以葉團的底面不會比原本的球低（樹下攤位的留空範圍不受影響）
 * - limbGeometry：一串由粗到細的枝段（樹枝從樹幹伸出、在葉團之間露出來）
 *
 * 兩者都回傳一個幾何（交給 PartBuilder.add 依材質合併），不增加網格或材質。
 * 亂數都用呼叫端給的 seed，不動到呼叫端原本的亂數順序。
 */

/** 凸出與凹陷的幅度（相對半徑）：凸出較小、凹陷較深，外緣看起來有缺口 */
export const LUMP_OUT = 0.12
export const LUMP_IN = 0.26

const _dir = new Vector3()

/**
 * 不規則的葉團：以 (0,0,0) 為中心、半徑約 r。
 * satellites：在 outward 方向（水平角度，弧度）外緣多長出的小葉團數量（0–2），讓輪廓參差。
 * detail：主葉團的細分（1 是 240 個頂點、2 是 960 個）；起伏要圓滑，外緣的大葉團用 2。
 * 小葉團固定用細分 1。
 */
export function lumpyClump(r, seed, { satellites = 0, outward = 0, detail = 1 } = {}) {
  const rng = createRng(seed)
  const waves = []
  for (let i = 0; i < 3; i++) {
    // 隨機方向的低頻波：頻率 1.2–2.5，表面出現 2–3 個圓滑的大起伏（頻率再高，粗網格會折出稜角，像水晶）
    const k = new Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize()
    waves.push({ k, f: 1.2 + rng() * 1.3, phase: rng() * Math.PI * 2, weight: i === 0 ? 0.5 : 0.25 })
  }
  // 一個較深的缺口
  const notch = new Vector3(Math.cos(outward + (rng() - 0.5) * 2.4), (rng() - 0.3) * 0.8, Math.sin(outward + (rng() - 0.5) * 2.4)).normalize()
  const parts = [displaced(new IcosahedronGeometry(r, detail), r, waves, notch)]
  for (let i = 0; i < satellites; i++) {
    const a = outward + (rng() - 0.5) * 1.6
    const sr = r * (0.34 + rng() * 0.16)
    const g = displaced(new IcosahedronGeometry(sr, 1), sr, waves, null)
    g.translate(Math.cos(a) * r * 0.82, r * (0.05 + rng() * 0.3), Math.sin(a) * r * 0.82)
    parts.push(g)
  }
  return finish(parts)
}

/** 依波形推擠頂點（同一位置的頂點位移相同，表面不會裂開） */
function displaced(geometry, r, waves, notch) {
  geometry.deleteAttribute('uv')
  geometry.deleteAttribute('normal')
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    _dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
    let n = 0
    for (const w of waves) n += Math.sin(_dir.dot(w.k) * w.f * Math.PI + w.phase) * w.weight
    // -1..1 → 凹陷 LUMP_IN、凸出 LUMP_OUT
    let d = n >= 0 ? n * LUMP_OUT : n * LUMP_IN
    if (notch) {
      const near = _dir.dot(notch)
      if (near > 0.7) d -= (near - 0.7) * 1.1
    }
    // 下半部只往內縮
    if (_dir.y < -0.15) d = Math.min(d, 0)
    const scale = Math.max(0.45, 1 + d)
    pos.setXYZ(i, _dir.x * r * scale, _dir.y * r * scale, _dir.z * r * scale)
  }
  return geometry
}

function finish(parts) {
  const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts, false)
  if (parts.length > 1) parts.forEach((g) => g.dispose())
  // 合併相同位置的頂點後再算法線：葉團保持圓滑的卡通明暗，不會變成多面體
  const smooth = mergeVertices(merged, 1e-4)
  merged.dispose()
  smooth.computeVertexNormals()
  smooth.setAttribute('uv', new BufferAttribute(new Float32Array(smooth.attributes.position.count * 2), 2))
  return smooth
}

const UP = new Vector3(0, 1, 0)

/**
 * 粗枝：points 是一串點（世界或建築本地座標），radii 是每個點的半徑（由粗到細）。
 * 每一段是一個上下不同粗細的開口圓柱（5 邊），UV 依木紋貼圖的實際尺寸 tile 計算。
 */
export function limbGeometry(points, radii, tile = 1.4, segments = 5) {
  const parts = []
  const q = new Quaternion()
  const m = new Matrix4()
  for (let i = 0; i < points.length - 1; i++) {
    const a = new Vector3(...points[i])
    const b = new Vector3(...points[i + 1])
    const dir = b.clone().sub(a)
    const len = dir.length()
    if (len < 1e-4) continue
    // 每段多 4% 的長度，讓轉折處接起來
    const g = new CylinderGeometry(radii[i + 1], radii[i], len * 1.04, segments, 1, true)
    const uv = g.attributes.uv
    const around = (Math.PI * (radii[i] + radii[i + 1])) / tile
    for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * around, (uv.getY(k) * len) / tile)
    q.setFromUnitVectors(UP, dir.normalize())
    m.compose(a.clone().add(b).multiplyScalar(0.5), q, new Vector3(1, 1, 1))
    g.applyMatrix4(m)
    parts.push(g.toNonIndexed())
    g.dispose()
  }
  if (parts.length === 1) return parts[0]
  const merged = mergeGeometries(parts, false)
  parts.forEach((g) => g.dispose())
  return merged
}

/** 幾何是否有頂點在 clearings（{ minX, maxX, minZ, maxZ, top }）上方 top + margin 以下 */
export function dipsIntoClearing(geometry, clearings, margin = 0.12) {
  if (!clearings.length) return false
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    for (const c of clearings) {
      if (x > c.minX - margin && x < c.maxX + margin && z > c.minZ - margin && z < c.maxZ + margin && y < c.top + margin) return true
    }
  }
  return false
}
