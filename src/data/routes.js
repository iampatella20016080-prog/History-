/**
 * 主題探索路線的總表（第 10、12 階段）：一箱茶的旅程，以及第 12 階段的六條主題路線。
 * 路線與節點的格式見 game/themeRoute.js；每條路線的節點、路人對話、情境人物與器物寫在自己的資料檔。
 */
import { TEA_ROUTE } from './teaRoute.js'
import { PASTRY_ROUTE } from './routes/pastryRoute.js'
import { TEMPLE_MEAL_ROUTE } from './routes/templeMealRoute.js'
import { getShop } from './shops.js'
import { getInspectable } from './inspectObjects.js'
import { getRouteFigureByNpcId } from './routeFigures.js'

export const ROUTES = [TEA_ROUTE, PASTRY_ROUTE, TEMPLE_MEAL_ROUTE]

export function getRoute(id) {
  return ROUTES.find((route) => route.id === id) ?? null
}

/**
 * 節點在街景裡的位置（世界座標 [x, z]；路線地圖用）：
 * mapAt 指定 → 路線人物 → 街上的器物 → 店家的位置。查不到時回傳 null。
 */
export function routeNodePoint(node) {
  if (node.mapAt) return node.mapAt
  for (const npcId of node.npcIds ?? []) {
    const figure = getRouteFigureByNpcId(npcId)
    if (figure) return figure.position
  }
  if (node.inspectableId) {
    const item = getInspectable(node.inspectableId)
    if (item) return [item.position[0], item.position[2]]
  }
  const shop = node.shopId ? getShop(node.shopId, node.eraId) : null
  if (shop?.position) return [shop.position.x, shop.position.z]
  return null
}
