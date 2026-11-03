/**
 * 路人對話的總表：每個年代有對話的路人（npcId 對應街景的人物）。
 * 對話的格式與標示見 game/talk.js；港口商街的碼頭與茶行（第 10 階段）在 qingPortTalk.js，
 * 第 12 階段主題路線的對話寫在各路線的資料檔（data/routes/*.js 的 TALK，每段對話有 eraId）；
 * 林華泰茶行各年代室內的對話在 linHuaTaiTalk.js；昭和浪漫洗濯屋（老屋新生）的對話在 showaLaundryTalk.js。
 */
import { QING_PORT_TALK } from './qingPortTalk.js'
import { PASTRY_TALK } from './routes/pastryRoute.js'
import { TEMPLE_MEAL_TALK } from './routes/templeMealRoute.js'
import { OLD_HOUSE_TALK } from './routes/oldHouseRoute.js'
import { NEWS_TALK } from './routes/newsRoute.js'
import { FOLKLORE_TALK } from './routes/folkloreRoute.js'
import { NEIGHBOUR_TALK } from './routes/neighbourRoute.js'
import { LHT_TALK } from './linHuaTaiTalk.js'
import { YJ_TALK } from './youJiTalk.js'
import { XFC_TALK } from './xinFangChunTalk.js'
import { JSL_TALK } from './jiangShanLouTalk.js'
import { QING_BOARDING_TALK } from './qingBoardingTalk.js'
import { SHOWA_TALK } from './showaLaundryTalk.js'

// 林華泰茶行各年代室內的人物（第 11 階段；data/linHuaTaiTalk.js）與清末搭船的船夫、舵工、水手（data/qingBoardingTalk.js）也依 eraId 併進來
const ROUTE_TALK = [...PASTRY_TALK, ...TEMPLE_MEAL_TALK, ...OLD_HOUSE_TALK, ...NEWS_TALK, ...FOLKLORE_TALK, ...NEIGHBOUR_TALK, ...LHT_TALK, ...YJ_TALK, ...XFC_TALK, ...JSL_TALK, ...QING_BOARDING_TALK, ...SHOWA_TALK]

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
