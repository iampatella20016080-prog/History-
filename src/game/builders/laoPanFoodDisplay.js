import { LAO_PAN, laoPanTable } from '../../data/squidSoupLayout.js'
import { condimentSet, dryShachaSquid, fishCrispGeng, soupSpoon, squidGeng, tempura } from './squidSoupWares.js'

/**
 * 老潘魷魚羹：入口旁第一張桌子上的四道展示餐點（沙茶魷魚羹、魚酥羹、甜不辣、乾拌沙茶生魷魚）。
 * 品名依網路食記核對；食物的造型依使用者提供的照片做成示意，不代表完整或即時的菜單、配方、份量或售價。
 *
 * 碗與食品的模型與 1945–1980 廟口的魷魚羹攤共用（builders/squidSoupWares.js）。
 * 湯匙、筷子與調味料放在 detail（精緻模式才顯示）；四道餐點兩種畫質都顯示。
 */
export const LAO_PAN_DISHES = [
  { id: 'shacha-squid-geng', name: '沙茶魷魚羹', at: [-0.17, 0.27] },
  { id: 'fish-crisp-geng', name: '魚酥羹', at: [-0.17, -0.22] },
  { id: 'tempura', name: '甜不辣', at: [0.13, 0.3] },
  { id: 'dry-shacha-squid', name: '乾拌沙茶生魷魚', at: [0.13, -0.25] },
]

/** 桌面上的位置（建築本地座標） */
export function laoPanDishPosition(dish, floorY) {
  const t = laoPanTable(LAO_PAN.foodTable)
  return { x: t.x + dish.at[0], y: floorY + LAO_PAN.table.height + 0.03, z: t.z + dish.at[1] }
}

export function buildLaoPanFoodDisplay(b, detail, floorY) {
  const t = laoPanTable(LAO_PAN.foodTable)
  for (const dish of LAO_PAN_DISHES) {
    const { x, y, z } = laoPanDishPosition(dish, floorY)
    if (dish.id === 'shacha-squid-geng') {
      squidGeng(b, x, y, z, { seed: 41, shacha: true })
      soupSpoon(detail, x + 0.05, y + 0.052, z - 0.01, { rotationY: -0.9 })
    } else if (dish.id === 'fish-crisp-geng') {
      fishCrispGeng(b, x, y, z, { seed: 42 })
      soupSpoon(detail, x + 0.05, y + 0.052, z + 0.02, { rotationY: -0.6 })
    } else if (dish.id === 'tempura') {
      tempura(b, x, y, z, { seed: 43 })
    } else {
      dryShachaSquid(b, x, y, z, { seed: 44 })
    }
  }
  // 一雙筷子擱在甜不辣的盤緣；靠牆一端是調味料與筷筒
  const top = floorY + LAO_PAN.table.height + 0.03
  for (const dz of [-0.012, 0.012]) detail.cylinder('wood', 0.0035, 0.0035, 0.22, 4, [t.x + 0.02, top + 0.03, t.z + 0.3 + dz], { rotation: [0, 0, Math.PI / 2 - 0.12], tint: '#b88a58' })
  condimentSet(detail, t.x + 0.22, top, t.z + 0.02, { rotationY: -Math.PI / 2, menuCard: false })
}
