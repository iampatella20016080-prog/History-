/**
 * 路人對話的總表：每個年代有對話的路人（npcId 對應街景的人物）。
 * 對話的格式與標示見 game/talk.js；港口商街的碼頭與茶行（第 10 階段）在 qingPortTalk.js，
 * 第 12 階段主題路線的對話寫在各路線的資料檔（data/routes/*.js 的 TALK，每段對話有 eraId）。
 */
import { QING_PORT_TALK } from './qingPortTalk.js'
import { PASTRY_TALK } from './routes/pastryRoute.js'
import { TEMPLE_MEAL_TALK } from './routes/templeMealRoute.js'

const ROUTE_TALK = [...PASTRY_TALK, ...TEMPLE_MEAL_TALK]

function byEra(talks) {
  const map = { 'qing-port': [...QING_PORT_TALK] }
  for (const talk of talks) (map[talk.eraId] ??= []).push(talk)
  return map
}

export const TALK_BY_ERA = byEra(ROUTE_TALK)

/** 這個年代所有有對話的路人 */
export function talksOfEra(eraId) {
  return TALK_BY_ERA[eraId] ?? []
}

/** 這位路人的對話（沒有時回傳 null） */
export function talkForNpc(eraId, npcId) {
  return talksOfEra(eraId).find((talk) => talk.npcId === npcId) ?? null
}

/** 對話的提示半徑（走進這個距離出現「交談」提示） */
export const TALK_RADIUS = 2.6
