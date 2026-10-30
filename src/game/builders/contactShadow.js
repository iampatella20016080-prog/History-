import { PlaneGeometry } from 'three'

/**
 * 接地暗影（第 9 階段・細部）：柱腳與家具底下一片柔和的暗影，做進模型裡。
 *
 * 在物件底下鋪一片貼地的薄片，用 contact 材質（半透明，見 materials.js）畫出來，三層疊起來中間深四周淡：
 * - 只在精緻畫質出現（variant 'fine'，見 qualityVariants.js）；流暢畫質（iPad）維持原本的樣子與繪製呼叫
 * - 不靠即時陰影；薄片不投射也不接收陰影、不描輪廓線
 * - 整條街（或一個室內）的暗影依材質合併成一個網格，精緻畫質每個年代只多一個繪製批次
 * - 半透明疊在任何地面上都是「變暗」，石板、柏油、木地板都適用
 */

/** 暗影貼在地面上方的高度（避免和地面互相閃爍） */
export const CONTACT_LIFT = 0.006

/** 暗影超出物件底面的寬度：至少 14 公分，大物件依底面大小加寬（太窄時只剩一圈細邊，遠看就消失） */
export function contactSpread(width, depth) {
  return Math.max(0.14, Math.min(width, depth) * 0.45)
}

/**
 * 三層由大到小、疊在一起的半透明薄片（每層透明度相同，見 materials.js 的 contact）：
 * 越靠近物件疊得越多、越暗，外圈最淡——像卡通著色一樣分成幾階的柔和暗影。
 * 每層是 [超出底面的寬度佔 spread 的比例, 離地高度的增量]。
 */
export const CONTACT_RINGS = [
  [1, 0],
  [0.6, 0.001],
  [0.25, 0.002],
]

/** 一層薄片的透明度；三層疊起來最暗處約 1 − (1 − a)³ */
export const CONTACT_OPACITY = 0.3

/** 疊了 n 層之後的暗度 */
export function contactDarkness(layers) {
  return 1 - (1 - CONTACT_OPACITY) ** layers
}

/**
 * 在 (x, y, z)（物件底面中心，y 是地面高度）鋪一片 width × depth 底面的暗影。
 * 旋轉跟著 PartBuilder 目前的矩陣（group 裡的家具會一起轉）。
 * maxZ：地面在 +z 方向的邊緣（例如騎樓步道的前緣），暗影不超出去懸在半空中。
 */
export function contactShadow(b, x, y, z, width, depth = width, { spread = contactSpread(width, depth), maxZ = Infinity } = {}) {
  b.variant('fine', () => {
    for (const [k, lift] of CONTACT_RINGS) {
      const w = width + spread * k * 2
      const z0 = z - depth / 2 - spread * k
      const z1 = Math.min(z + depth / 2 + spread * k, maxZ)
      if (z1 - z0 < 0.02) continue
      b.add('contact', new PlaneGeometry(w, z1 - z0), {
        position: [x, y + CONTACT_LIFT + lift, (z0 + z1) / 2],
        rotation: [-Math.PI / 2, 0, 0],
      })
    }
  })
}
