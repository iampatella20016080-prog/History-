import { PlaneGeometry } from 'three'

/**
 * 接地暗影（第 9 階段・細部）：柱腳與家具底下一片柔和的暗影，做進模型裡。
 *
 * 流暢模式（觸控裝置的預設）沒有細部陰影，柱子和桌椅看起來像浮在地上。這裡在物件底下鋪一片
 * 貼地的薄片，用 contact 材質（半透明、中間深四周淡，見 materials.js）畫出來：
 * - 兩種畫質都看得到，不靠即時陰影；薄片不投射也不接收陰影、不描輪廓線
 * - 整條街（或一個室內）的暗影依材質合併成一個網格，每個年代只多一個繪製批次
 * - 半透明疊在任何地面上都是「變暗」，石板、柏油、木地板都適用
 */

/** 暗影貼在地面上方的高度（避免和地面互相閃爍） */
export const CONTACT_LIFT = 0.006

/** 暗影超出物件底面的寬度：至少 8 公分，大物件依底面大小加寬 */
export function contactSpread(width, depth) {
  return Math.max(0.08, Math.min(width, depth) * 0.28)
}

/**
 * 暗影貼圖的濃度（u, v 為 0–1）：中間一塊實心，往外以超橢圓（介於圓與方之間）柔和淡出，
 * 方柱與圓桌都適用。
 */
export function contactFalloff(u, v) {
  const x = Math.abs(u * 2 - 1)
  const y = Math.abs(v * 2 - 1)
  const d = (x ** 3 + y ** 3) ** (1 / 3)
  const t = Math.min(1, Math.max(0, (d - 0.5) / 0.5))
  const s = t * t * (3 - 2 * t)
  return 1 - s
}

/**
 * 在 (x, y, z)（物件底面中心，y 是地面高度）鋪一片 width × depth 底面的暗影。
 * 旋轉跟著 PartBuilder 目前的矩陣（group 裡的家具會一起轉）。
 */
export function contactShadow(b, x, y, z, width, depth = width, { spread = contactSpread(width, depth) } = {}) {
  return b.add('contact', new PlaneGeometry(width + spread * 2, depth + spread * 2), {
    position: [x, y + CONTACT_LIFT, z],
    rotation: [-Math.PI / 2, 0, 0],
  })
}
