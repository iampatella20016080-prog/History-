import {
  BoxGeometry,
  BufferAttribute,
  Color,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MATERIAL_TILE } from '../rendering/materials.js'

const KEEP_ATTRIBUTES = new Set(['position', 'normal', 'uv'])
const UP = new Vector3(0, 1, 0)
const ONE = new Vector3(1, 1, 1)
const _local = new Matrix4()
const _final = new Matrix4()
const _quat = new Quaternion()
const _euler = new Euler()
const _pos = new Vector3()
const _scale = new Vector3()
const _color = new Color()

/**
 * 依「實際尺寸」產生方塊 UV，讓貼圖在不同大小的牆面上保持一致的比例，
 * 並以方塊位置偏移 UV，使相鄰牆面的磚縫、木紋大致連續。
 */
export function createBoxGeometry(w, h, d, tile, offset = [0, 0, 0]) {
  const geometry = new BoxGeometry(w, h, d)
  if (!tile) return geometry
  const uv = geometry.attributes.uv
  const x0 = offset[0] - w / 2
  const y0 = offset[1] - h / 2
  const z0 = offset[2] - d / 2
  // BoxGeometry 面順序：+x, -x, +y, -y, +z, -z
  const faces = [
    [d, h, z0, y0],
    [d, h, z0, y0],
    [w, d, x0, z0],
    [w, d, x0, z0],
    [w, h, x0, y0],
    [w, h, x0, y0],
  ]
  for (let f = 0; f < 6; f++) {
    const [us, vs, uo, vo] = faces[f]
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i
      uv.setXY(k, (uv.getX(k) * us + uo) / tile, (uv.getY(k) * vs + vo) / tile)
    }
  }
  return geometry
}

/**
 * 程式化建模工具：把大量基本幾何形狀依材質分組，最後合併成少數網格。
 *
 * - push / pop：矩陣堆疊，方便以「建築本地座標」擺放零件
 * - box / cylinder / extrude / add：加入零件（可指定頂點色 tint 與牆腳髒污 grime）
 * - addCollider / addBlocker：同時登記角色碰撞與鏡頭遮擋用的範圍（世界座標）
 * - build：依材質合併並回傳 [{ material, geometry }]
 */
export class PartBuilder {
  constructor() {
    this.groups = new Map()
    this.stack = [new Matrix4()]
    this.colliders = []
    this.blockers = []
  }

  get matrix() {
    return this.stack[this.stack.length - 1]
  }

  push(position = [0, 0, 0], rotationY = 0) {
    _quat.setFromAxisAngle(UP, rotationY)
    _local.compose(_pos.set(position[0], position[1], position[2]), _quat, ONE)
    this.stack.push(this.matrix.clone().multiply(_local))
    return this
  }

  pop() {
    if (this.stack.length > 1) this.stack.pop()
    return this
  }

  group(position, rotationY, callback) {
    this.push(position, rotationY)
    callback()
    this.pop()
  }

  /** 加入任意幾何（會轉成非索引、只保留 position/normal/uv，並寫入頂點色） */
  add(material, geometry, options = {}) {
    const {
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      tint = '#ffffff',
      grime = 0,
      uvRepeat = null,
    } = options

    let g = geometry.index ? geometry.toNonIndexed() : geometry
    if (g !== geometry) geometry.dispose()
    for (const name of Object.keys(g.attributes)) {
      if (!KEEP_ATTRIBUTES.has(name)) g.deleteAttribute(name)
    }
    if (!g.attributes.normal) g.computeVertexNormals()
    if (!g.attributes.uv) {
      g.setAttribute('uv', new BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    }
    if (uvRepeat) {
      const uv = g.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * uvRepeat[0], uv.getY(i) * uvRepeat[1])
    }

    // 頂點色：底部可加深（牆腳髒污、雨水痕），增加手繪的層次
    const positions = g.attributes.position
    const count = positions.count
    let minY = Infinity
    let maxY = -Infinity
    if (grime > 0) {
      for (let i = 0; i < count; i++) {
        const y = positions.getY(i)
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
    _color.set(tint)
    const colors = new Float32Array(count * 3)
    const span = Math.max(maxY - minY, 1e-6)
    for (let i = 0; i < count; i++) {
      const f = grime > 0 ? 1 - grime * (1 - (positions.getY(i) - minY) / span) : 1
      colors[i * 3] = _color.r * f
      colors[i * 3 + 1] = _color.g * f
      colors[i * 3 + 2] = _color.b * f
    }
    g.setAttribute('color', new BufferAttribute(colors, 3))

    _euler.set(rotation[0], rotation[1], rotation[2])
    _quat.setFromEuler(_euler)
    _local.compose(_pos.set(position[0], position[1], position[2]), _quat, _scale.set(scale[0], scale[1], scale[2]))
    _final.multiplyMatrices(this.matrix, _local)
    g.applyMatrix4(_final)

    if (!this.groups.has(material)) this.groups.set(material, [])
    this.groups.get(material).push(g)
    return g
  }

  box(material, size, position = [0, 0, 0], options = {}) {
    const [w, h, d] = size
    const hasRotation = options.rotation && options.rotation.some((r) => r !== 0)
    const geometry = createBoxGeometry(w, h, d, MATERIAL_TILE[material], hasRotation ? [0, 0, 0] : position)
    return this.add(material, geometry, { ...options, position })
  }

  cylinder(material, radiusTop, radiusBottom, height, segments, position = [0, 0, 0], options = {}) {
    const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, options.openEnded ?? false)
    const tile = MATERIAL_TILE[material]
    const circumference = Math.PI * (radiusTop + radiusBottom)
    const uvRepeat = tile ? [circumference / tile, height / tile] : null
    return this.add(material, geometry, { uvRepeat, ...options, position })
  }

  /** 將 2D 輪廓擠出成立體（山牆、屋脊、船身等）；輪廓單位為公尺 */
  extrude(material, shape, depth, options = {}) {
    const geometry = new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: options.curveSegments ?? 6,
    })
    const tile = MATERIAL_TILE[material]
    return this.add(material, geometry, { uvRepeat: tile ? [1 / tile, 1 / tile] : null, ...options })
  }

  plane(material, width, height, position = [0, 0, 0], options = {}) {
    return this.add(material, new PlaneGeometry(width, height), { ...options, position })
  }

  transformPoint(x, y, z) {
    return new Vector3(x, y, z).applyMatrix4(this.matrix)
  }

  /** 目前矩陣的世界旋轉（只考慮 Y 軸） */
  worldRotationY(localRotationY = 0) {
    const e = this.matrix.elements
    return Math.atan2(e[8], e[10]) + localRotationY
  }

  /** 登記角色碰撞範圍（本地座標矩形 → 世界座標） */
  addCollider(minX, maxX, minZ, maxZ) {
    const corners = [
      this.transformPoint(minX, 0, minZ),
      this.transformPoint(maxX, 0, minZ),
      this.transformPoint(minX, 0, maxZ),
      this.transformPoint(maxX, 0, maxZ),
    ]
    this.colliders.push({
      minX: Math.min(...corners.map((c) => c.x)),
      maxX: Math.max(...corners.map((c) => c.x)),
      minZ: Math.min(...corners.map((c) => c.z)),
      maxZ: Math.max(...corners.map((c) => c.z)),
    })
  }

  /** 登記鏡頭遮擋範圍（本地座標方塊 → 世界座標） */
  addBlocker(minX, maxX, minY, maxY, minZ, maxZ) {
    const corners = [
      this.transformPoint(minX, minY, minZ),
      this.transformPoint(maxX, minY, minZ),
      this.transformPoint(minX, minY, maxZ),
      this.transformPoint(maxX, minY, maxZ),
    ]
    this.blockers.push({
      minX: Math.min(...corners.map((c) => c.x)),
      maxX: Math.max(...corners.map((c) => c.x)),
      minY,
      maxY,
      minZ: Math.min(...corners.map((c) => c.z)),
      maxZ: Math.max(...corners.map((c) => c.z)),
    })
  }

  build() {
    const result = []
    for (const [material, list] of this.groups) {
      if (!list.length) continue
      const geometry = list.length === 1 ? list[0] : mergeGeometries(list, false)
      if (list.length > 1) list.forEach((g) => g.dispose())
      geometry.computeBoundingSphere()
      geometry.computeBoundingBox()
      result.push({ material, geometry })
    }
    this.groups.clear()
    return result
  }
}
