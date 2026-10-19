import { Vector3 } from 'three'
import { STREET } from '../config.js'

/** 店面朝向 → 繞 Y 軸旋轉角（建築本地 +z 方向即店面朝向） */
export const FACING_ROTATION = {
  south: 0,
  north: Math.PI,
  east: Math.PI / 2,
  west: -Math.PI / 2,
  // 街角斜切的店面（例如滋養豆餡舖：面向迪化街與涼州街的路口）
  southwest: -Math.PI / 4,
  southeast: Math.PI / 4,
}

const cache = new Map()

/**
 * 由店家資料推導場景中會用到的位置：
 * - origin：店面立面中心
 * - interactionPoint：觸發互動提示的位置（店門前的街道上）
 * - camera：按 E 探索時的鏡頭位置與注視點
 */
export function getShopPlacement(shop) {
  if (cache.has(shop.id)) return cache.get(shop.id)
  const rotationY = FACING_ROTATION[shop.facing] ?? 0
  const forward = new Vector3(Math.sin(rotationY), 0, Math.cos(rotationY))
  const right = new Vector3(Math.cos(rotationY), 0, -Math.sin(rotationY))
  const origin = new Vector3(shop.position.x, 0, shop.position.z)
  // 一般店家：店門前的街道上；室內的攤位可以指定較近的距離（interaction.distance，走道比街道窄）
  const interactionPoint = origin.clone().addScaledVector(forward, shop.interaction?.distance ?? STREET.walkwayDepth + 0.75)
  const cam = shop.camera ?? {}
  const camera = {
    position: origin
      .clone()
      .addScaledVector(forward, cam.distance ?? 9)
      .addScaledVector(right, cam.side ?? 0)
      .setY(cam.height ?? 3),
    target: origin
      .clone()
      .addScaledVector(forward, 0.6)
      .setY(cam.lookHeight ?? 3),
  }
  const placement = { rotationY, forward, right, origin, interactionPoint, camera }
  cache.set(shop.id, placement)
  return placement
}

/** 店家所在的街道側（用於自動預留街屋位置）；自訂位置（site）與建築裡的店家（inside）不預留 */
export function getStreetSide(shop) {
  if (shop.site || shop.inside) return null
  if (shop.facing === 'south' && shop.position.z < 0) return 'north'
  if (shop.facing === 'north' && shop.position.z > 0) return 'south'
  return null
}
