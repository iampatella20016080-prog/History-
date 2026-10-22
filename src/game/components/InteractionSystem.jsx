import { useFrame } from '@react-three/fiber'
import { playerState } from '../runtime.js'
import { useGameStore } from '../../state/useGameStore.js'

const EXIT_MARGIN = 0.7

/**
 * 每一影格檢查角色與各店家互動點的距離，找出最近且在範圍內的店家。
 * 離開範圍時多留一點緩衝，避免在邊界上提示閃爍。
 * 互動點屬於某個樓層（例如二樓的咖啡館），角色要在同一層才算；
 * 有資訊熱點的店家（例如爐鍋咖啡）改看每個熱點，記下最近的那一個；只能點選的熱點（clickOnly）不算。
 */
export function InteractionSystem({ shopModels }) {
  useFrame(() => {
    const store = useGameStore.getState()
    if (!store.started || store.mode !== 'explore') return
    if (store.transitioning || store.viewMode !== 'explore') {
      store.setNearbyShop(null)
      return
    }
    const p = playerState.position
    const level = playerState.level ?? 0
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
