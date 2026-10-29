import { useFrame } from '@react-three/fiber'
import { inspectablesOfEra } from '../../data/inspectObjects.js'
import { TALK_RADIUS, talkForNpc } from '../../data/talk.js'
import { playerState } from '../runtime.js'
import { useGameStore } from '../../state/useGameStore.js'

const EXIT_MARGIN = 0.7
/** 對話中走出這個距離就自動結束（比提示半徑寬，不會一轉身就斷） */
const TALK_LEAVE = TALK_RADIUS + 1.6

/**
 * 每一影格檢查角色與各互動對象的距離：店家的互動點、有對話的路人、街上可以近看的器物，
 * 各自找出最近且在範圍內的一個（按 E 時依路人 → 器物 → 店家的順序擇一，見 store.interact）。
 * 離開範圍時多留一點緩衝，避免在邊界上提示閃爍。
 * 互動點屬於某個樓層（例如二樓的咖啡館），角色要在同一層才算；
 * 有資訊熱點的店家（例如爐鍋咖啡）改看每個熱點，記下最近的那一個；只能點選的熱點（clickOnly）不算。
 */
export function InteractionSystem({ shopModels, npcs = [], eraId }) {
  useFrame(() => {
    const store = useGameStore.getState()
    if (!store.started || store.mode !== 'explore') return
    if (store.transitioning || store.viewMode !== 'explore') {
      store.setNearbyShop(null)
      store.setNearbyTalk(null)
      store.setNearbyInspectable(null)
      return
    }
    const p = playerState.position
    const level = playerState.level ?? 0

    // 有對話的路人（都在街上，樓層 0）：對話中走遠就結束
    let nearestTalk = null
    let talkDistance = Infinity
    if (level === 0) {
      for (const npc of npcs) {
        if (npc.zone || !talkForNpc(eraId, npc.id)) continue
        const distance = Math.hypot(p.x - npc.position[0], p.z - npc.position[2])
        const radius = TALK_RADIUS + (store.nearbyTalkNpcId === npc.id ? EXIT_MARGIN : 0)
        if (distance < radius && distance < talkDistance) {
          nearestTalk = npc.id
          talkDistance = distance
        }
      }
    }
    if (store.talk) {
      const npc = npcs.find((item) => item.id === store.talk.talk.npcId)
      if (!npc || Math.hypot(p.x - npc.position[0], p.z - npc.position[2]) > TALK_LEAVE) store.endTalk()
    }

    // 街上可以近看的器物
    let nearestInspectable = null
    let inspectableDistance = Infinity
    if (level === 0) {
      for (const item of inspectablesOfEra(eraId)) {
        const distance = Math.hypot(p.x - item.position[0], p.z - item.position[2])
        const radius = item.radius + (store.nearbyInspectableId === item.id ? EXIT_MARGIN : 0)
        if (distance < radius && distance < inspectableDistance) {
          nearestInspectable = item.id
          inspectableDistance = distance
        }
      }
    }
    // 路人與器物同時在範圍內：只提示比較近的那一個（按 E 也是它）
    if (nearestTalk && nearestInspectable) {
      if (talkDistance <= inspectableDistance) nearestInspectable = null
      else nearestTalk = null
    }
    store.setNearbyTalk(store.talk ? null : nearestTalk)
    store.setNearbyInspectable(nearestInspectable)
    let nearest = null
    let nearestHotspot = null
    let nearestDistance = Infinity
    const consider = (shop, point, pointLevel, baseRadius, hotspotId) => {
      if (pointLevel !== level) return
      const distance = Math.hypot(p.x - point.x, p.z - point.z)
      const current = store.nearbyShopId === shop.id && store.nearbyHotspotId === hotspotId
      const radius = baseRadius + (current ? EXIT_MARGIN : 0)
      if (distance < radius && distance < nearestDistance) {
        nearest = shop.id
        nearestHotspot = hotspotId
        nearestDistance = distance
      }
    }
    for (const { shop, placement } of shopModels) {
      if (placement.hotspots.length) {
        for (const hotspot of placement.hotspots) {
          // 只能點選的熱點（例如攤台上展示的一碗）不以距離觸發
          if (hotspot.clickOnly) continue
          consider(shop, hotspot.interactionPoint, hotspot.level ?? 0, hotspot.radius ?? 2, hotspot.id)
        }
      } else {
        consider(shop, placement.interactionPoint, placement.level, shop.interaction?.radius ?? 3.2, null)
      }
    }
    store.setNearbyShop(nearest, nearestHotspot)
  })
  return null
}
