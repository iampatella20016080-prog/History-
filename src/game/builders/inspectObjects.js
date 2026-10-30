import { BoxGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { Parts } from './inspectParts.js'
import { PASTRY_BUILDERS } from './routeObjects/pastryObjects.js'
import { TEMPLE_MEAL_BUILDERS } from './routeObjects/templeMealObjects.js'
import { OLD_HOUSE_BUILDERS } from './routeObjects/oldHouseObjects.js'
import { NEWS_BUILDERS } from './routeObjects/newsObjects.js'

/**
 * 器物 3D 檢視的程式建模（第 10 階段）：對照照片與文獻建模，不用 AI 生成的模型。
 * 只產生幾何（頂點色，和情境人物一樣共用一種卡通材質），可以在 Node 測試；
 * 每件器物由幾個零件（parts）組成，會動的零件帶著樞軸（pivot）與動作（animate），
 * 由 components/ObjectStage.jsx 依檢視狀態（objectInspect.js）轉動。
 *
 * 器物說明與出處在 data/inspectObjects.js；形制查無的部分標「歷史情境重建」。
 * 原點在器物中心附近，radius 是檢視鏡頭取景的大小。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

/* 第 12 階段主題路線的器物（每條路線一個檔案，接受 { detail }）：builders/routeObjects/*.js */
const ROUTE_BUILDERS = { ...PASTRY_BUILDERS, ...TEMPLE_MEAL_BUILDERS, ...OLD_HOUSE_BUILDERS, ...NEWS_BUILDERS }

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

/**
 * 茶籌（口述來源、待核；示意模型）：小木座上一枚鐵片籌與一枚紙籌，
 * 動作 flip 把鐵籌翻面看背面的記號。
 */
function buildTeaTally() {
  const base = new Parts()
  // 木座與紙籌（長方的粗紙，上面一方紅印）
  base.add('#8a6a4c', box(0.3, 0.025, 0.2), { p: [0, 0.0125, 0] })
  base.add('#e3d5ae', box(0.07, 0.004, 0.13), { p: [0.08, 0.027, 0.01], r: [0, -0.18, 0] })
  base.add('#b8463a', box(0.03, 0.004, 0.03), { p: [0.085, 0.03, -0.02], r: [0, -0.18, 0] })

  // 鐵片籌（圓片、中央打孔、正面鑿字的刻痕、背面一道記號）：以直徑為軸翻面
  const tally = new Parts()
  const y = 0.045
  tally.add('#5a544c', new CylinderGeometry(0.055, 0.055, 0.008, 18), { p: [-0.06, y, 0] })
  tally.add('#3a352e', new CylinderGeometry(0.009, 0.009, 0.012, 8), { p: [-0.06, y, -0.035] })
  tally.add('#8f887c', box(0.04, 0.003, 0.012), { p: [-0.06, y + 0.005, 0.005] })
  tally.add('#8f887c', box(0.028, 0.003, 0.01), { p: [-0.06, y + 0.005, 0.025] })
  tally.add('#7c746a', box(0.05, 0.003, 0.014), { p: [-0.06, y - 0.0055, 0.0], r: [Math.PI, 0, 0.3] })

  return {
    radius: 0.2,
    centerY: 0.05,
    parts: [
      { id: 'base', geometry: base.build() },
      { id: 'tally', geometry: tally.build(), pivot: [-0.06, y, 0], animate: { action: 'flip', axis: 'x', from: 0, to: Math.PI } },
    ],
  }
}

/**
 * 桿秤（歷史情境重建）：秤桿吊在提繩上，秤鉤掛著茶簍，秤錘沿著秤桿滑動。
 * 動作 weigh：秤錘往外滑、秤桿擺回水平（秤到平衡）。
 */
function buildTeaScale() {
  const beamLen = 0.9
  const beamY = 0.5
  const frame = new Parts()
  // 提繩（上方的吊點）
  frame.add('#3a332c', box(0.008, 0.16, 0.008), { p: [-0.1, beamY + 0.08, 0] })
  frame.add('#6b5436', box(0.06, 0.02, 0.06), { p: [-0.1, beamY + 0.17, 0] })

  // 秤桿＋秤鉤＋茶簍（一端）：整組以吊點為軸，未秤時下垂、秤重時回水平
  const beam = new Parts()
  beam.add('#c9a05e', new CylinderGeometry(0.014, 0.02, beamLen, 10), { p: [beamLen / 2 - 0.22, beamY, 0], r: [0, 0, Math.PI / 2] })
  for (let i = 1; i <= 6; i++) beam.add('#8a6a3c', new CylinderGeometry(0.016, 0.016, 0.004, 8), { p: [-0.22 + (beamLen / 6.5) * i, beamY, 0], r: [0, 0, Math.PI / 2] })
  beam.add('#3a332c', box(0.01, 0.1, 0.01), { p: [-0.32, beamY - 0.05, 0] })
  beam.add('#4a443c', new CylinderGeometry(0.012, 0.012, 0.05, 6), { p: [-0.32, beamY - 0.11, 0], r: [Math.PI / 2.4, 0, 0] })
  // 茶簍（竹簍、簍裡的茶）
  beam.add('#cdb27e', new CylinderGeometry(0.15, 0.11, 0.14, 12, 1, true), { p: [-0.32, beamY - 0.26, 0] })
  beam.add('#b89c66', new CylinderGeometry(0.11, 0.11, 0.015, 12), { p: [-0.32, beamY - 0.33, 0] })
  beam.add('#4a4034', new CylinderGeometry(0.13, 0.13, 0.03, 12), { p: [-0.32, beamY - 0.21, 0] })
  beam.add('#3a332c', box(0.006, 0.12, 0.006), { p: [-0.38, beamY - 0.14, 0], r: [0, 0, 0.35] })
  beam.add('#3a332c', box(0.006, 0.12, 0.006), { p: [-0.26, beamY - 0.14, 0], r: [0, 0, -0.35] })

  // 秤錘（沿秤桿滑動）：鐵錘與吊繩
  const weight = new Parts()
  weight.add('#3a352e', box(0.008, 0.07, 0.008), { p: [0.1, beamY - 0.035, 0] })
  weight.add('#4a443c', new CylinderGeometry(0.03, 0.038, 0.07, 10), { p: [0.1, beamY - 0.1, 0] })

  return {
    radius: 0.55,
    centerY: 0.38,
    parts: [
      { id: 'frame', geometry: frame.build() },
      { id: 'beam', geometry: beam.build(), pivot: [-0.1, beamY, 0], animate: { action: 'weigh', axis: 'z', from: -0.18, to: 0 } },
      { id: 'weight', geometry: weight.build(), pivot: [0.1, beamY, 0], animate: { action: 'weigh', kind: 'slide', axis: 'x', from: 0, to: 0.32 } },
    ],
  }
}

/**
 * 焙籠與焙坑（歷史情境重建，形制依 Davidson 1903）：
 * 磚臺上的焙坑（覆灰的炭火透著暗紅），焙籠架在坑口；動作 lift 把焙籠抬起來看坑裡的炭火。
 */
function buildRoastingBasket() {
  const pit = new Parts()
  // 低磚臺一角與坑口
  pit.add('#b07a5c', box(0.9, 0.3, 0.9), { p: [0, 0.15, 0] })
  pit.add('#9c8a74', box(0.96, 0.04, 0.96), { p: [0, 0.32, 0] })
  pit.add('#8a5f46', new CylinderGeometry(0.33, 0.33, 0.05, 16), { p: [0, 0.345, 0] })
  pit.add('#8a8178', new CylinderGeometry(0.28, 0.28, 0.04, 16), { p: [0, 0.35, 0] })
  pit.add('#d2622e', new CylinderGeometry(0.14, 0.14, 0.03, 12), { p: [0, 0.365, 0] })
  pit.add('#f0a24e', new CylinderGeometry(0.06, 0.06, 0.02, 8), { p: [0.04, 0.375, -0.03] })

  // 焙籠（上下開、腰部收窄、腰下有篩、篩上一層茶）：抬起時往上、往旁邊移
  const basket = new Parts()
  const y0 = 0.36
  const H = 0.9
  basket.add('#cdb27e', new CylinderGeometry(0.3, 0.24, H * 0.42, 14, 1, true), { p: [0, y0 + H * 0.21, 0] })
  basket.add('#d4bc88', new CylinderGeometry(0.24, 0.3, H * 0.58, 14, 1, true), { p: [0, y0 + H * 0.42 + H * 0.29, 0] })
  basket.add('#a8905e', new CylinderGeometry(0.235, 0.235, 0.03, 14), { p: [0, y0 + H * 0.42, 0] })
  basket.add('#4a4034', new CylinderGeometry(0.21, 0.21, 0.05, 14), { p: [0, y0 + H * 0.42 + 0.04, 0] })
  basket.add('#b89c66', new CylinderGeometry(0.31, 0.31, 0.03, 14, 1, true), { p: [0, y0 + H - 0.015, 0] })
  basket.add('#b89c66', new CylinderGeometry(0.31, 0.31, 0.03, 14, 1, true), { p: [0, y0 + 0.015, 0] })

  return {
    radius: 0.75,
    centerY: 0.65,
    parts: [
      { id: 'pit', geometry: pit.build() },
      { id: 'basket', geometry: basket.build(), pivot: [0, y0, 0], animate: { action: 'lift', kind: 'slide', axis: 'y', from: 0, to: 0.5, drift: [0.55, 0, 0.1] } },
    ],
  }
}

const BUILDERS = {
  'tea-chest': buildTeaChest,
  'rice-measure': buildRiceMeasure,
  'tea-tally': buildTeaTally,
  'tea-scale': buildTeaScale,
  'roasting-basket': buildRoastingBasket,
}

/** 同一件器物的幾何共用（快取到頁面關閉；幾何不大，不需要釋放） */
const cache = new Map()

/**
 * 器物的幾何。detail：精緻畫質的高細節模型（較多的段數與小零件）；流暢畫質（false）簡化，
 * 但零件與小動作相同，互動一樣。第 10 階段的器物本來就不大，兩種畫質共用同一份幾何。
 */
export function buildInspectObject(objectId, { detail = true } = {}) {
  const builder = BUILDERS[objectId] ?? ROUTE_BUILDERS[objectId]
  if (!builder) throw new Error(`未知的檢視器物：${objectId}`)
  const key = ROUTE_BUILDERS[objectId] ? `${objectId}|${detail ? 'fine' : 'smooth'}` : objectId
  if (!cache.has(key)) cache.set(key, builder({ detail }))
  return cache.get(key)
}

/** 會動零件目前的旋轉角（依動作進度 0–1，緩入緩出）；滑動的零件（kind: 'slide'）用 inspectPartTransform */
export function inspectPartRotation(part, t) {
  if (!part.animate) return 0
  const eased = t * t * (3 - 2 * t)
  return part.animate.from + (part.animate.to - part.animate.from) * eased
}

/**
 * 會動零件目前的位移與旋轉（依動作進度 0–1，緩入緩出）：
 * - 預設繞樞軸旋轉（axis 軸，從 from 轉到 to）
 * - kind: 'slide' 的零件沿 axis 軸滑動（例如秤錘、抬起的焙籠）
 * - drift 是額外的位移（兩種都可以用：滑動時偏向旁邊，或旋轉時同時抬起）
 */
export function inspectPartTransform(part, t) {
  const result = { rotation: [0, 0, 0], offset: [0, 0, 0] }
  if (!part.animate) return result
  const eased = t * t * (3 - 2 * t)
  const value = part.animate.from + (part.animate.to - part.animate.from) * eased
  const axisIndex = { x: 0, y: 1, z: 2 }[part.animate.axis] ?? 0
  if (part.animate.kind === 'slide') result.offset[axisIndex] = value
  else result.rotation[axisIndex] = value
  // 額外的位移（滑動的方向偏移，或旋轉時同時抬起，例如提起一串收涎餅）
  for (const [i, d] of (part.animate.drift ?? []).entries()) result.offset[i] += d * eased
  return result
}
