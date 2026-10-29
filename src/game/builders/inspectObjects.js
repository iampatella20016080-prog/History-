import { BoxGeometry, BufferAttribute, Color, CylinderGeometry, Euler, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * 器物 3D 檢視的程式建模（第 10 階段）：對照照片與文獻建模，不用 AI 生成的模型。
 * 只產生幾何（頂點色，和情境人物一樣共用一種卡通材質），可以在 Node 測試；
 * 每件器物由幾個零件（parts）組成，會動的零件帶著樞軸（pivot）與動作（animate），
 * 由 components/ObjectStage.jsx 依檢視狀態（objectInspect.js）轉動。
 *
 * 器物說明與出處在 data/inspectObjects.js；形制查無的部分標「歷史情境重建」。
 * 原點在器物中心附近，radius 是檢視鏡頭取景的大小。
 */

const _m = new Matrix4()
const _q = new Quaternion()
const _e = new Euler()
const _p = new Vector3()
const _s = new Vector3()
const _c = new Color()

/** 頂點色零件合併（做法同 character/npcBuilder.js 的 Parts） */
class Parts {
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

const box = (x, y, z) => new BoxGeometry(x, y, z)

/* ── 顏色 ── */
const PINE = '#c8a66c'
const PINE_DARK = '#b08f58'
const LEAD = '#9aa0a6'
const TEA = '#3d3328'
const PAPER = '#e8c46a'
const PAPER_ART = '#b8463a'
const IRON_DARK = '#4a443c'

/**
 * 外銷茶箱（半箱，約 40 磅；尺寸對齊 qingWharfLayout.js 的 TEA_CHEST 0.48×0.36×0.36）：
 * 松木箱體、內襯薄鉛、箱裡的烏龍茶；外裱印花紙（側面色帶與正面的商號圖案，示意）；
 * 箱蓋以後緣為樞軸打開（動作 lid）。
 */
function buildTeaChest() {
  const W = 0.48
  const D = 0.36
  const H = 0.36
  const t = 0.018
  const lidH = 0.03
  const bodyH = H - lidH
  const body = new Parts()
  // 箱底與四壁（松木）
  body.add(PINE, box(W, t, D), { p: [0, t / 2, 0] })
  body.add(PINE, box(W, bodyH, t), { p: [0, bodyH / 2, -(D - t) / 2] })
  body.add(PINE, box(W, bodyH, t), { p: [0, bodyH / 2, (D - t) / 2] })
  body.add(PINE_DARK, box(t, bodyH, D - 2 * t), { p: [-(W - t) / 2, bodyH / 2, 0] })
  body.add(PINE_DARK, box(t, bodyH, D - 2 * t), { p: [(W - t) / 2, bodyH / 2, 0] })
  // 內襯的薄鉛（四壁內側與箱裡一圈）
  body.add(LEAD, box(W - 2 * t, bodyH - t - 0.02, 0.004), { p: [0, (bodyH + t) / 2, -(D / 2 - t - 0.004)] })
  body.add(LEAD, box(W - 2 * t, bodyH - t - 0.02, 0.004), { p: [0, (bodyH + t) / 2, D / 2 - t - 0.004] })
  body.add(LEAD, box(0.004, bodyH - t - 0.02, D - 2 * t), { p: [-(W / 2 - t - 0.004), (bodyH + t) / 2, 0] })
  body.add(LEAD, box(0.004, bodyH - t - 0.02, D - 2 * t), { p: [(W / 2 - t - 0.004), (bodyH + t) / 2, 0] })
  // 箱裡的烏龍茶（鬆鬆的一層）
  body.add(TEA, box(W - 2 * t - 0.01, 0.05, D - 2 * t - 0.01), { p: [0, bodyH - 0.12, 0] })
  body.add(TEA, new SphereGeometry(0.07, 10, 6), { p: [0.05, bodyH - 0.1, 0.03], s: [1, 0.5, 1] })
  body.add(TEA, new SphereGeometry(0.05, 10, 6), { p: [-0.09, bodyH - 0.1, -0.05], s: [1, 0.45, 1] })
  // 外裱的印花紙：側面上下色帶、正面的商號圖案（紅底方框，示意「德記洋行茶箱籤」的風格）
  body.add(PAPER, box(W + 0.004, 0.09, D + 0.004), { p: [0, bodyH - 0.085, 0] })
  body.add(PAPER, box(W + 0.004, 0.07, D + 0.004), { p: [0, 0.075, 0] })
  body.add(PAPER_ART, box(0.2, 0.15, 0.003), { p: [0, bodyH / 2 + 0.01, D / 2 + 0.004] })
  body.add('#f3e6c8', box(0.15, 0.1, 0.003), { p: [0, bodyH / 2 + 0.01, D / 2 + 0.006] })
  body.add(PAPER_ART, box(0.05, 0.06, 0.003), { p: [0, bodyH / 2 + 0.01, D / 2 + 0.008] })
  // 四角的鐵皮包角
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      body.add(IRON_DARK, box(0.03, 0.1, 0.03), { p: [(sx * (W - 0.028)) / 2, 0.05, (sz * (D - 0.028)) / 2] })
      body.add(IRON_DARK, box(0.03, 0.08, 0.03), { p: [(sx * (W - 0.028)) / 2, bodyH - 0.045, (sz * (D - 0.028)) / 2] })
    }
  }

  // 箱蓋（以後緣 -z 為樞軸往後掀開）：松木板＋上面的裱紙。
  // 零件的幾何都在器物座標裡（樞軸只決定旋轉中心，見 components/ObjectStage.jsx）。
  const lid = new Parts()
  lid.add(PINE, box(W, lidH, D), { p: [0, bodyH + lidH / 2, 0] })
  lid.add(PAPER, box(W - 0.1, 0.004, D - 0.08), { p: [0, bodyH + lidH + 0.002, 0] })
  lid.add(PAPER_ART, box(0.14, 0.004, 0.14), { p: [0, bodyH + lidH + 0.004, 0] })

  return {
    radius: 0.42,
    centerY: H / 2,
    parts: [
      { id: 'body', geometry: body.build() },
      {
        id: 'lid',
        geometry: lid.build(),
        pivot: [0, bodyH, -D / 2],
        animate: { action: 'lid', axis: 'x', from: 0, to: -1.85 },
      },
    ],
  }
}

/**
 * 米斗（原本故事視窗裡的 CSS 立體模型改成同一個畫布的 3D 檢視）：
 * 上寬下窄的木斗（四片梯形木板）、金屬角件、斗底與斗裡的米；動作 flip 整個翻過來看斗底。
 */
function buildRiceMeasure() {
  const topR = 0.19
  const bottomR = 0.13
  const H = 0.2
  const root = new Parts()
  // 斗身：四面的錐臺（旋轉 45 度讓面向正前方），再挖出內側（小一號、略深）
  root.add('#a9814f', new CylinderGeometry(topR, bottomR, H, 4, 1, true), { p: [0, H / 2, 0], r: [0, Math.PI / 4, 0] })
  root.add('#8f6a3e', new CylinderGeometry(topR - 0.016, bottomR - 0.016, H - 0.01, 4, 1, true), { p: [0, H / 2 + 0.008, 0], r: [0, Math.PI / 4, 0], s: [-1, 1, 1] })
  // 斗口的沿與斗底
  root.add('#b58a55', new CylinderGeometry(topR + 0.008, topR + 0.008, 0.016, 4, 1, true), { p: [0, H - 0.008, 0], r: [0, Math.PI / 4, 0] })
  root.add('#8f6a3e', box(bottomR * 1.35, 0.02, bottomR * 1.35), { p: [0, 0.01, 0] })
  // 斗裡的米
  root.add('#efe7d2', box((topR - 0.03) * 1.3, 0.02, (topR - 0.03) * 1.3), { p: [0, H - 0.055, 0], r: [0, Math.PI / 4, 0] })
  // 金屬角件（四個斗角，上下各一段）
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const topX = Math.cos(a) * topR
    const topZ = Math.sin(a) * topR
    const bottomX = Math.cos(a) * bottomR
    const bottomZ = Math.sin(a) * bottomR
    root.add(IRON_DARK, box(0.022, 0.05, 0.022), { p: [topX, H - 0.03, topZ], r: [0, -a, 0] })
    root.add(IRON_DARK, box(0.022, 0.04, 0.022), { p: [bottomX, 0.035, bottomZ], r: [0, -a, 0] })
  }
  // 斗底的墨印（翻過來才看得到，示意）
  root.add('#3a3028', box(0.07, 0.002, 0.07), { p: [0, -0.002, 0], r: [0, Math.PI / 4, 0] })

  return {
    radius: 0.3,
    centerY: H / 2,
    parts: [
      {
        id: 'root',
        geometry: root.build(),
        pivot: [0, H / 2, 0],
        animate: { action: 'flip', axis: 'z', from: 0, to: Math.PI },
      },
    ],
  }
}

const BUILDERS = {
  'tea-chest': buildTeaChest,
  'rice-measure': buildRiceMeasure,
}

/** 同一件器物的幾何共用（快取到頁面關閉；幾何不大，不需要釋放） */
const cache = new Map()

export function buildInspectObject(objectId) {
  if (!BUILDERS[objectId]) throw new Error(`未知的檢視器物：${objectId}`)
  if (!cache.has(objectId)) cache.set(objectId, BUILDERS[objectId]())
  return cache.get(objectId)
}

/** 會動零件目前的旋轉角（依動作進度 0–1，緩入緩出） */
export function inspectPartRotation(part, t) {
  if (!part.animate) return 0
  const eased = t * t * (3 - 2 * t)
  return part.animate.from + (part.animate.to - part.animate.from) * eased
}
