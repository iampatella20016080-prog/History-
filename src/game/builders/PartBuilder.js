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
import { SHOP_ROOM_ATTRIBUTE, tagShopGlowUV, tagShopGlowUVGroup } from '../rendering/shopGlow.js'

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
 * 依面法線的主要軸向做平面投影 UV（適用於細分過、彎曲過的幾何）
 */
export function projectUV(geometry, tile) {
  const pos = geometry.attributes.position
  const normal = geometry.attributes.normal
  const uv = geometry.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(normal.getX(i))
    const ny = Math.abs(normal.getY(i))
    const nz = Math.abs(normal.getZ(i))
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile)
    else if (nx >= nz) uv.setXY(i, z / tile, y / tile)
    else uv.setXY(i, x / tile, y / tile)
  }
  uv.needsUpdate = true
}

/**
 * 兩端微微上翹的屋面板（閩南屋頂的「起翹」）。
 * 在本地座標中沿 x 細分後彎曲，再交給 PartBuilder 旋轉擺放。
 */
export function createCurvedSlab(width, thickness, length, upturn, tile, segments = 10) {
  const geometry = new BoxGeometry(width, thickness, length, segments, 1, 1)
  const pos = geometry.attributes.position
  const half = width / 2
  for (let i = 0; i < pos.count; i++) {
    const t = Math.abs(pos.getX(i)) / half
    pos.setY(i, pos.getY(i) + upturn * t * t * t)
  }
  geometry.computeVertexNormals()
  if (tile) projectUV(geometry, tile)
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
    // 需要另外渲染的動態元素（全部以世界座標登記）
    this.signs = [] // 招牌文字面板
    this.glows = [] // 燈火光暈
    this.pools = [] // 地面光暈
    this.lanterns = [] // 會隨風擺動的燈籠（實例化渲染）
    this.steam = [] // 蒸氣
    this.banners = [] // 布幡
    this.leafTrees = [] // 會落葉的榕樹（樹冠範圍）
  }

  /** 登記招牌：position 為本地座標，rotationY 為本地旋轉 */
  addSign(sign) {
    const p = this.transformPoint(...sign.position)
    this.signs.push({ ...sign, position: [p.x, p.y, p.z], rotationY: this.worldRotationY(sign.rotationY ?? 0) })
  }

  addGlow(x, y, z, size = 1, color = '#ffb36b', flicker = 0) {
    const p = this.transformPoint(x, y, z)
    this.glows.push({ position: [p.x, p.y, p.z], size, color, flicker })
  }

  addPool(x, z, radius = 2, color = '#ffb36b', y = 0.05) {
    const p = this.transformPoint(x, y, z)
    this.pools.push({ position: [p.x, p.y, p.z], radius, color })
  }

  addLantern(x, y, z, { scale = 1, color = '#c0553b', glow = true } = {}) {
    const p = this.transformPoint(x, y, z)
    this.lanterns.push({ position: [p.x, p.y, p.z], scale, color, rotationY: this.worldRotationY() })
    if (glow) this.glows.push({ position: [p.x, p.y, p.z], size: 1.5 * scale, color: '#ff9a5c', flicker: 1 })
  }

  addSteam(x, y, z, strength = 1) {
    const p = this.transformPoint(x, y, z)
    this.steam.push({ position: [p.x, p.y, p.z], strength })
  }

  /** 爐灶與香爐的煙（和蒸氣一起畫，顏色較灰、升得較高、會被風吹斜） */
  addSmoke(x, y, z, strength = 1) {
    const p = this.transformPoint(x, y, z)
    this.steam.push({ position: [p.x, p.y, p.z], strength, kind: 'smoke' })
  }

  /** 榕樹的落葉範圍：樹冠中心（本地座標）、樹冠下緣高度 top、半徑與地面高度 */
  addLeafTree(x, z, { top, radius, ground = 0 }) {
    const p = this.transformPoint(x, top, z)
    const g = this.transformPoint(x, ground, z)
    this.leafTrees.push({ position: [p.x, g.y, p.z], top: p.y, radius, ground: g.y })
  }

  addBanner(banner) {
    const p = this.transformPoint(...banner.position)
    this.banners.push({ ...banner, position: [p.x, p.y, p.z], rotationY: this.worldRotationY(banner.rotationY ?? 0) })
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

  /**
   * 店內透光：在剛加入的幾何（windowLit）寫入 UV 標記，kind 'room' 是假室內窗、'back' 是店內後牆
   * （見 rendering/shopGlow.js）。回傳同一個幾何。
   */
  shopGlow(geometry, kind, options) {
    const { position, normal, uv } = geometry.attributes
    tagShopGlowUV(position.array, normal.array, uv.array, kind, options)
    uv.needsUpdate = true
    return geometry
  }

  /**
   * 好幾片玻璃共用一個假房間（玻璃店面的整排玻璃）：UV 不動（流暢畫質照原本每片貼一張室內圖），
   * 另外寫頂點屬性 shopRoom = 1 + 整排共用的 0–1 位置，只有精緻畫質的著色器讀它。
   */
  shopGlowGroup(geometries) {
    const parts = geometries.map((g) => {
      const array = new Float32Array(g.attributes.position.count * 2)
      g.setAttribute(SHOP_ROOM_ATTRIBUTE, new BufferAttribute(array, 2))
      return { positions: g.attributes.position.array, normals: g.attributes.normal.array, uvs: array }
    })
    tagShopGlowUVGroup(parts, 'room', { offset: 1 })
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

  /** 只合併一種材質（可分段執行）；回傳 [] 或 [{ material, geometry }] */
  buildMaterial(material) {
    const list = this.groups.get(material)
    this.groups.delete(material)
    if (!list?.length) return []
    // 只有部分幾何有的屬性（玻璃店面的 shopRoom）：其他幾何補 0，才能合併
    const names = new Map()
    for (const g of list) for (const [name, attribute] of Object.entries(g.attributes)) names.set(name, attribute.itemSize)
    for (const g of list) {
      for (const [name, itemSize] of names) {
        if (!g.attributes[name]) g.setAttribute(name, new BufferAttribute(new Float32Array(g.attributes.position.count * itemSize), itemSize))
      }
    }
    const geometry = list.length === 1 ? list[0] : mergeGeometries(list, false)
    if (list.length > 1) list.forEach((g) => g.dispose())
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
    return [{ material, geometry }]
  }

  build() {
    const result = []
    for (const material of [...this.groups.keys()]) result.push(...this.buildMaterial(material))
    return result
  }
}
