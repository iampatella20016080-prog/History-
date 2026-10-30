import { BufferAttribute, Color, Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * 器物 3D 檢視的建模工具（builders/inspectObjects.js 與第 12 階段的 builders/routeObjects/*.js 共用）：
 * 頂點色零件合併，和情境人物一樣共用一種卡通材質。
 */

const _m = new Matrix4()
const _q = new Quaternion()
const _e = new Euler()
const _p = new Vector3()
const _s = new Vector3()
const _c = new Color()

/** 頂點色零件合併（做法同 character/npcBuilder.js 的 Parts） */
export class Parts {
  constructor() {
    this.list = []
  }

  add(color, geometry, { p = [0, 0, 0], r = [0, 0, 0], s = 1 } = {}) {
    const scale = Array.isArray(s) ? s : [s, s, s]
    _m.compose(_p.set(...p), _q.setFromEuler(_e.set(...r)), _s.set(...scale))
    let g = geometry.index ? geometry.toNonIndexed() : geometry
    if (g !== geometry) geometry.dispose()
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
    g.applyMatrix4(_m)
    _c.set(color)
    const count = g.attributes.position.count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = _c.r
      colors[i * 3 + 1] = _c.g
      colors[i * 3 + 2] = _c.b
    }
    g.setAttribute('color', new BufferAttribute(colors, 3))
    this.list.push(g)
    return this
  }

  build() {
    if (!this.list.length) return null
    const geometry = this.list.length === 1 ? this.list[0] : mergeGeometries(this.list, false)
    this.list.forEach((g) => g !== geometry && g.dispose())
    geometry.computeBoundingSphere()
    return geometry
  }
}

