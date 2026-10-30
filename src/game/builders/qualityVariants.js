import { resolveAllCoplanar } from './coplanar.js'
import { PartBuilder } from './PartBuilder.js'

/**
 * 只在一種畫質出現的零件（第 9 階段・細部；使用者 2026-10-30 決定：細節美觀類的效果只在精緻畫質啟用）。
 *
 * 產生器用 b.variant('smooth' | 'fine', callback) 標記零件：
 * - 'smooth'：原本的形狀（例如圓球的葉團、從牆頂往下的水漬），精緻畫質時被取代
 * - 'fine'：細部（不規則的葉團與粗枝、接地暗影、窗臺下的水漬）
 *
 * 合併前把 'fine' 的零件移到另一個 PartBuilder，最後併進精緻畫質才顯示的 detail 批次；
 * 'smooth' 的零件留在原處，合併時排在最前面（PartBuilder.buildMaterial 的 smoothOnly），
 * 精緻畫質用 drawRange 跳過它們。所以流暢畫質的網格、頂點、批次與繪製呼叫都和加入細部之前完全相同，
 * 精緻畫質只多出 detail 裡的幾批。
 */

/** 從 builders 取出 'fine' 的零件，放進一個新的 PartBuilder（零件已經是世界座標） */
export function takeFineParts(builders) {
  const fine = new PartBuilder()
  for (const builder of builders) {
    for (const [material, list] of [...builder.groups]) {
      const kept = list.filter((g) => g.userData.variant !== 'fine')
      if (kept.length === list.length) continue
      const moved = list.filter((g) => g.userData.variant === 'fine')
      if (!fine.groups.has(material)) fine.groups.set(material, [])
      fine.groups.get(material).push(...moved)
      if (kept.length) builder.groups.set(material, kept)
      else builder.groups.delete(material)
    }
  }
  return fine
}

/** 兩種畫質都有的零件（不含 'smooth'）：只用來和精緻畫質的零件比較共面 */
function commonView(builder) {
  const groups = new Map()
  for (const [material, list] of builder.groups) {
    const common = list.filter((g) => !g.userData.variant)
    if (common.length) groups.set(material, common)
  }
  return { groups }
}

/**
 * 精緻畫質的零件和兩種畫質都有的零件之間的共面（流暢畫質的零件不在精緻畫質出現，不比較），
 * 再把它們併進 detail（精緻畫質才顯示的批次）。
 */
export function mergeFineParts(fine, builders, detail, coplanar = {}) {
  if (!fine.groups.size) return
  resolveAllCoplanar([fine], { ...coplanar, fixed: [...builders, ...(coplanar.fixed ?? [])].map(commonView) })
  for (const [material, list] of fine.groups) {
    if (!detail.groups.has(material)) detail.groups.set(material, [])
    detail.groups.get(material).push(...list)
  }
  fine.groups.clear()
}

/** 某一批在這個畫質要畫的頂點範圍：精緻畫質跳過最前面只屬於流暢畫質的零件 */
export function batchDrawStart(batch, fine) {
  return fine ? (batch.smoothOnly ?? 0) : 0
}
