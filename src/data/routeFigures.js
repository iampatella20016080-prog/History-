/**
 * 主題路線的情境人物（第 12 階段）：站在節點店門口或攤位旁、可以交談的路人。
 *
 * 每條路線的人物寫在自己的資料檔（data/routes/*.js 的 FIGURES），這裡合併成總表，
 * 由 eraLayout（碰撞障礙物）、buildWorld（鏡頭遮擋方塊與 world.npcs）與路線地圖共用。
 * 人物不具名、不走動，只有待機動作（components/NpcLayer.jsx）；形式都是「歷史情境重建」。
 *
 * 格式：{ id, eraId, look, pose, position: [x, z], rotationY }
 *   id         world.npcs 的 id 會加上 route- 前綴（對話資料的 npcId 用加了前綴的 id）
 *   rotationY  NPC 面向 +Z 的慣例（0 面向南方的街心，Math.PI 面向北方）
 */
import { PASTRY_FIGURES } from './routes/pastryRoute.js'
import { TEMPLE_MEAL_FIGURES } from './routes/templeMealRoute.js'
import { OLD_HOUSE_FIGURES } from './routes/oldHouseRoute.js'
import { NEWS_FIGURES } from './routes/newsRoute.js'
import { FOLKLORE_FIGURES } from './routes/folkloreRoute.js'
import { NEIGHBOUR_FIGURES } from './routes/neighbourRoute.js'

/** 人物的碰撞半寬（和 streetPropsLayout 的 FIGURE_HALF 相同） */
export const ROUTE_FIGURE_HALF = 0.3
const FIGURE_HEIGHT = 1.75

export const ROUTE_FIGURES = [...PASTRY_FIGURES, ...TEMPLE_MEAL_FIGURES, ...OLD_HOUSE_FIGURES, ...NEWS_FIGURES, ...FOLKLORE_FIGURES, ...NEIGHBOUR_FIGURES]

export function routeFigureNpcId(figure) {
  return `route-${figure.id}`
}

export function routeFiguresOfEra(eraId) {
  return ROUTE_FIGURES.filter((figure) => figure.eraId === eraId)
}

export function getRouteFigureByNpcId(npcId) {
  return ROUTE_FIGURES.find((figure) => routeFigureNpcId(figure) === npcId) ?? null
}

/** 人物的範圍（碰撞障礙物；加上高度就是鏡頭遮擋方塊） */
export function routeFigureBox(figure) {
  const [x, z] = figure.position
  return { minX: x - ROUTE_FIGURE_HALF, maxX: x + ROUTE_FIGURE_HALF, minY: 0, maxY: FIGURE_HEIGHT, minZ: z - ROUTE_FIGURE_HALF, maxZ: z + ROUTE_FIGURE_HALF }
}

/** 交給 NpcLayer 的人物資料 */
export function routeFigureNpcs(eraId) {
  return routeFiguresOfEra(eraId).map((figure, i) => ({
    id: routeFigureNpcId(figure),
    look: figure.look,
    pose: figure.pose,
    position: [figure.position[0], 0, figure.position[1]],
    rotationY: figure.rotationY ?? 0,
    phase: (0.31 + i * 0.29) % 1,
  }))
}
