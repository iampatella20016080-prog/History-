import { useFrame } from '@react-three/fiber'
import { playerState } from '../runtime.js'
import { useGameStore } from '../../state/useGameStore.js'

const EXIT_MARGIN = 0.7

/**
 * 每一影格檢查角色與各店家互動點的距離，找出最近且在範圍內的店家。
 * 離開範圍時多留一點緩衝，避免在邊界上提示閃爍。
 */
export function InteractionSystem({ shopModels }) {
  useFrame(() => {
    const store = useGameStore.getState()
    if (!store.started || store.mode !== 'explore') return
    const p = playerState.position
    let nearest = null
    let nearestDistance = Infinity
    for (const { shop, placement } of shopModels) {
      const point = placement.interactionPoint
      const distance = Math.hypot(p.x - point.x, p.z - point.z)
      const radius = (shop.interaction?.radius ?? 3.2) + (store.nearbyShopId === shop.id ? EXIT_MARGIN : 0)
      if (distance < radius && distance < nearestDistance) {
        nearest = shop.id
        nearestDistance = distance
      }
    }
    store.setNearbyShop(nearest)
  })
  return null
}
