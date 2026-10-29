/**
 * 路人對話的總表：每個年代有對話的路人（npcId 對應街景的人物）。
 * 對話的格式與標示見 game/talk.js；目前只有港口商街（第 10 階段），
 * 之後的年代照同樣的做法加進 TALK_BY_ERA。
 */
import { QING_PORT_TALK } from './qingPortTalk.js'

export const TALK_BY_ERA = {
  'qing-port': QING_PORT_TALK,
}

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
