import { BoxGeometry, CylinderGeometry, Euler, Matrix4, Quaternion, ShapeGeometry, TorusGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * 角色服裝的組裝工具（只產生幾何，不建立材質，可在 Node 測試）
 *
 * 角色骨架（與 Player.jsx 相同的群組，單位：公尺）：
 *   legRight／legLeft     髖關節（身體群組內 y = 0.86，x = ∓0.11），往下為負
 *   footRight／footLeft   腳踝（腿群組內 y = -0.78），鞋底在腳踝下方 0.08（站立時貼地）
 *   torso                 軀幹（髖部高度為原點，肩膀約 0.6）
 *   armRight／armLeft     肩關節（軀幹內 x = ∓0.245、y = 0.56），手在 y = -0.55
 *   handRight／handLeft   手的位置（手上拿的東西，會反向擺動保持下垂）
 *   head                  頭（軀幹內 y = 0.7）
 *   skirtFront／skirtBack 長衫下襬的前後片（髖部高度，隨前後腳擺動）
 * 角色面向 +Z；角色的右側是 -X。
 *
 * 同一個部位、同一種材質的零件會合併成一個網格，減少繪製呼叫（iPad 效能）。
 */
export const RIG = {
  hipY: 0.86,
  legX: 0.11,
  ankleY: -0.78,
  soleDepth: 0.08,
  shoulderX: 0.245,
  shoulderY: 0.56,
  handY: -0.55,
  headY: 0.7,
}

/** 從髖關節到鞋底的長度（走路時用來讓鞋底貼地） */
export const LEG_LENGTH = -RIG.ankleY + RIG.soleDepth

export const SLOTS = [
  'torso',
  'head',
  'armRight',
  'armLeft',
  'handRight',
  'handLeft',
  'legRight',
  'legLeft',
  'footRight',
  'footLeft',
  'skirtFront',
  'skirtBack',
]

const KEEP = new Set(['position', 'normal', 'uv'])
const _m = new Matrix4()
const _q = new Quaternion()
const _e = new Euler()
const _p = new Vector3()
const _s = new Vector3()

export class OutfitBuilder {
  constructor(id) {
    this.id = id
    this.parts = new Map()
    this.tags = new Set()
  }

  /**
   * @param {string} slot 部位
   * @param {string} material 材質名稱（對應服裝的 palette）
   * @param {import('three').BufferGeometry} geometry
   * @param {{ p?: number[], r?: number[], s?: number[]|number, tag?: string, shadow?: boolean }} options
   */
  add(slot, material, geometry, { p = [0, 0, 0], r = [0, 0, 0], s = 1, tag, shadow = true } = {}) {
    if (!SLOTS.includes(slot)) throw new Error(`未知的部位：${slot}`)
    const scale = Array.isArray(s) ? s : [s, s, s]
    _m.compose(_p.set(...p), _q.setFromEuler(_e.set(...r)), _s.set(...scale))
    let g = geometry.index ? geometry.toNonIndexed() : geometry
    if (g !== geometry) geometry.dispose()
    for (const name of Object.keys(g.attributes)) if (!KEEP.has(name)) g.deleteAttribute(name)
    if (!g.attributes.uv) throw new Error('零件缺少 uv')
    g.applyMatrix4(_m)
    const key = `${slot}|${material}|${shadow ? 1 : 0}`
    if (!this.parts.has(key)) this.parts.set(key, { slot, material, shadow, list: [] })
    this.parts.get(key).list.push(g)
    if (tag) this.tags.add(tag)
    return this
  }

  /** 合併成 { slot: [{ material, geometry, shadow }] } */
  build(anim = {}) {
    const slots = Object.fromEntries(SLOTS.map((slot) => [slot, []]))
    for (const { slot, material, shadow, list } of this.parts.values()) {
      const geometry = list.length === 1 ? list[0] : mergeGeometries(list, false)
      list.forEach((g) => g !== geometry && g.dispose())
      geometry.computeBoundingSphere()
      slots[slot].push({ material, geometry, shadow })
    }
    return { id: this.id, slots, tags: [...this.tags], anim: { ...DEFAULT_ANIM, ...anim } }
  }
}

/** 動畫參數：腿與手臂的擺幅倍率、手臂向外張開的角度（避免手臂穿過寬鬆的衣服或包包） */
export const DEFAULT_ANIM = {
  legSwing: 1,
  armSwing: { right: 1, left: 1 },
  armSpread: { right: 0.1, left: 0.1 },
}

/* ───────────── 幾何小工具 ───────────── */

/** 直筒或錐形的筒（衣身、袖子、褲管）；y 置中 */
export function tube(rTop, rBottom, height, radial = 12) {
  return new CylinderGeometry(rTop, rBottom, height, radial, 1, false)
}

/** 前方開口的衣身（敞開的外衣、長衫下襬）：thetaStart 以 +Z 為 0、往 +X 增加 */
export function shell(rTop, rBottom, height, thetaStart, thetaLength, radial = 18) {
  return new CylinderGeometry(rTop, rBottom, height, radial, 1, true, thetaStart, thetaLength)
}

/** 前方開口 gap（弧度）的衣身 */
export function openShell(rTop, rBottom, height, gap, radial = 18) {
  return shell(rTop, rBottom, height, gap / 2, Math.PI * 2 - gap, radial)
}

/**
 * 水平的環（衣襬、袖口、領圈），有立體厚度。
 * thetaStart／thetaLength 與 shell 相同（以 +Z 為 0）；預設整圈。
 */
export function ring(radius, thickness, thetaStart = 0, thetaLength = Math.PI * 2) {
  const g = new TorusGeometry(radius, thickness, 5, 28, thetaLength)
  // Torus 在 XY 平面、從 +X 開始；轉到水平後角度 u 對應方向 (cos u, sin u)
  g.rotateX(Math.PI / 2)
  const uStart = Math.PI / 2 - (thetaStart + thetaLength)
  g.rotateY(-uStart)
  return g
}

/** 錐形衣身在高度 y 的半徑（y 從 y0 到 y1，半徑從 r0 到 r1） */
export function radiusAt(y, y0, r0, y1, r1) {
  const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)))
  return r0 + (r1 - r0) * t
}

/**
 * 沿著錐形表面的帶子（背帶、衣襟的邊條）：在表面上取點，分段接成有厚度的帶子。
 * points：[[x, y], ...]（z 由表面決定），front 為 true 時在前面、false 在背面。
 */
export function surfaceStrap(builder, slot, material, points, { radius, width = 0.03, thickness = 0.014, front = true, lift = 0.012, segments = 6, tag }) {
  const path = []
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    for (let k = i === 0 ? 0 : 1; k <= segments; k++) {
      const t = k / segments
      const x = x0 + (x1 - x0) * t
      const y = y0 + (y1 - y0) * t
      const r = radius(y) + lift
      const z = Math.sqrt(Math.max(r * r - x * x, 0.0001)) * (front ? 1 : -1)
      path.push(new Vector3(x, y, z))
    }
  }
  for (let i = 0; i < path.length - 1; i++) segment(builder, slot, material, path[i], path[i + 1], { width, thickness, tag })
}

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()

/** 兩點之間的扁平帶子（厚度方向朝外：遠離 Y 軸） */
export function segment(builder, slot, material, from, to, { width = 0.03, thickness = 0.014, tag, shadow = false } = {}) {
  const length = from.distanceTo(to)
  if (length < 1e-4) return
  const g = new BoxGeometry(width, length * 1.04, thickness)
  const mid = _a.addVectors(from, to).multiplyScalar(0.5)
  const yAxis = _b.subVectors(to, from).normalize()
  const out = _c.set(mid.x, 0, mid.z)
  if (out.lengthSq() < 1e-8) out.set(0, 0, 1)
  out.normalize()
  const xAxis = new Vector3().crossVectors(yAxis, out).normalize()
  const zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize()
  const basis = new Matrix4().makeBasis(xAxis, yAxis, zAxis)
  g.applyMatrix4(basis)
  g.translate(mid.x, mid.y, mid.z)
  builder.add(slot, material, g, { tag, shadow })
}

/**
 * 貼在錐形表面上的平面圖形（V 領、領帶、口袋）：把平面座標 (x, y) 彎到表面上。
 * radius(y) 是表面半徑；lift 是離表面的距離；depth > 0 時做成有厚度的片。
 */
export function wrapShape(shape, radius, { lift = 0.004, back = false } = {}) {
  const g = new ShapeGeometry(shape, 4)
  const position = g.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const r = radius(y) + lift
    const a = x / r
    position.setXYZ(i, r * Math.sin(a) * (back ? -1 : 1), y, r * Math.cos(a) * (back ? -1 : 1))
  }
  g.computeVertexNormals()
  return g
}
