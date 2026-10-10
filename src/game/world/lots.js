import { PLAZA, STREET } from '../config.js'
import { SHOPS } from '../../data/shops.js'
import { createRng, pick, range } from '../utils/random.js'
import { getStreetSide } from './placement.js'

/**
 * 地段配置（五個年代共用）
 *
 * 整條街先切成固定的地段：店家的地段依 shops.js 的座標保留，其餘以固定亂數種子切分。
 * 每個年代再依地段決定蓋什麼樣的房子，所以同一塊地在不同年代會「演變」而不是隨機重排。
 */
function complement([start, end], reserved) {
  const sorted = [...reserved].sort((a, b) => a[0] - b[0])
  const result = []
  let cursor = start
  for (const [a, b] of sorted) {
    if (a > cursor + 0.01) result.push([cursor, Math.min(a, end)])
    cursor = Math.max(cursor, b)
  }
  if (cursor < end - 0.01) result.push([cursor, end])
  return result
}

function splitInterval(rng, x0, x1) {
  const widths = []
  let x = x0
  while (x1 - x > 0.05) {
    const remaining = x1 - x
    let width
    if (remaining <= 7.0) width = remaining
    else {
      width = pick(rng, [4.2, 4.6, 5.0, 5.4, 5.8, 6.2])
      if (remaining - width < 3.6) width = remaining / 2
    }
    widths.push([x, width])
    x += width
  }
  return widths
}

let cachedPlan = null

export function getLotPlan() {
  if (cachedPlan) return cachedPlan
  const rng = createRng(1853)
  const lots = []
  const seed = () => Math.floor(rng() * 4294967295)

  for (const side of ['north', 'south']) {
    const z = side === 'north' ? -STREET.facadeZ : STREET.facadeZ
    const rotationY = side === 'north' ? 0 : Math.PI
    const shops = SHOPS.filter((shop) => getStreetSide(shop) === side)
    const reserved = shops.map((shop) => [shop.position.x - shop.building.width / 2, shop.position.x + shop.building.width / 2])
    for (const [x0, x1] of complement([STREET.rowStartX, STREET.rowEndX], reserved)) {
      for (const [x, width] of splitInterval(rng, x0, x1)) {
        lots.push({
          id: `${side}-${lots.length}`,
          kind: 'row',
          side,
          x: x + width / 2,
          z,
          rotationY,
          width,
          depth: range(rng, 10, 13),
          seed: seed(),
          rowStart: Math.abs(x - STREET.rowStartX) < 0.01,
        })
      }
    }
    for (const shop of shops) {
      const width = shop.building.width
      const x0 = shop.position.x - width / 2
      const subLots = width > 7.4
        ? [0, 1].map((i) => ({ id: `${shop.id}-sub${i}`, x: x0 + width * (0.25 + i * 0.5), width: width / 2, depth: range(rng, 10, 12.5), seed: seed() }))
        : [{ id: `${shop.id}-sub0`, x: shop.position.x, width, depth: range(rng, 10, 12.5), seed: seed() }]
      lots.push({
        id: `store-${shop.id}`,
        kind: 'store',
        storeId: shop.id,
        side,
        x: shop.position.x,
        z,
        rotationY,
        width,
        depth: shop.building.depth ?? 11,
        seed: seed(),
        subLots: subLots.map((sub) => ({ ...sub, z, rotationY, kind: 'row' })),
      })
    }
  }

  // 河岸廣場兩側的貨棧
  for (const side of [-1, 1]) {
    let x = PLAZA.minX
    for (const [i, width] of [5.4, 4.6].entries()) {
      lots.push({
        id: `plaza-${side}-${i}`,
        kind: 'plaza',
        x: x + width / 2,
        z: side * PLAZA.halfDepth,
        rotationY: side < 0 ? 0 : Math.PI,
        width,
        depth: 10,
        seed: seed(),
        warehouse: true,
      })
      x += width
    }
  }

  // 街底橫向建築（收束街景）
  lots.push({
    id: 'street-end',
    kind: 'end',
    x: STREET.endFacadeX,
    z: 0,
    rotationY: -Math.PI / 2,
    width: 13,
    depth: 11,
    seed: 4242,
  })

  cachedPlan = { lots }
  return cachedPlan
}
