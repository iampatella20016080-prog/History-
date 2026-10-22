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

// 依店家物件快取：同一家店在不同年代可能是不同的物件（例如迪化街329號店屋），各有自己的互動位置與熱點
const cache = new WeakMap()

/**
 * 由店家資料推導場景中會用到的位置：
 * - origin：店面立面中心
 * - interactionPoint：觸發互動提示的位置（店門前的街道上）
 * - camera：按 E 探索時的鏡頭位置與注視點
 */
export function getShopPlacement(shop) {
  if (cache.has(shop)) return cache.get(shop)
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
  // 二樓的店家（例如爐鍋咖啡）：互動點與從店家名錄前往的位置在二樓（level 1）
  const level = shop.interaction?.level ?? 0
  // 資訊熱點（世界座標）：各自的互動位置、所在樓層、提示框位置與開啟介紹時的鏡頭
  const hotspots = (shop.hotspots ?? []).map((hotspot) => ({
    ...hotspot,
    interactionPoint: new Vector3(hotspot.point.x, 0, hotspot.point.z),
    camera: { position: new Vector3(...hotspot.camera.position), target: new Vector3(...hotspot.camera.target) },
  }))
  const placement = { rotationY, forward, right, origin, interactionPoint, camera, level, hotspots }
  cache.set(shop, placement)
  return placement
}

/** 店家所在的街道側（用於自動預留街屋位置）；自訂位置（site）與建築裡的店家（inside）不預留 */
export function getStreetSide(shop) {
  if (shop.site || shop.inside) return null
  if (shop.facing === 'south' && shop.position.z < 0) return 'north'
  if (shop.facing === 'north' && shop.position.z > 0) return 'south'
  return null
}
