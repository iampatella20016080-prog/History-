import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { LANE, SHOP } from '../src/game/builders/actionBar.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import {
  allowedDistance,
  clampViewerTarget,
  indoorFollow,
  interiorAmount,
  orbitDirection,
  planBuildingFocus,
  segmentBlocked,
  viewerSpaceOf,
} from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 導演的豆花店 Action! Bar：只在「老屋新生」出現的迪化街一段224巷、巷子裡的二層樓店面、
 * 可以直接走進去的店內（碰撞、跟隨鏡頭、觀賞模式）、按需載入的室內細部與豆花展示，
 * 以及店家資料（五個章節、不捏造的人物與獎項、有出處的文獻）。
 */
const revival = buildEraWorldSync('revival')
const shop = getShop('action-bar')
const zone = revival.interiors.find((item) => item.id === 'action-bar')
const space = viewerSpaceOf(revival)

// 巷口在迪化街南側的立面線上；巷子往南（+z）延伸，店在巷子東側、朝西
const MOUTH = { x: shop.site.x, z: shop.site.z }
/** 店的本地座標（原點在騎樓柱列外緣中央，+z 朝巷子）→ 世界座標 */
const fromShop = (sx, sz) => ({ x: MOUTH.x + SHOP.origin[0] - sz, z: MOUTH.z + SHOP.origin[2] + sx })
const DOOR_Z = fromShop((SHOP.door[0] + SHOP.door[1]) / 2, 0).z
const COUNTER_X = fromShop(0, SHOP.counterZ).x

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function overlaps(a, b, pad = 0.05) {
  return a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 模擬按住方向鍵行走（每步 0.15 公尺，和遊戲中一個影格的碰撞處理相同），回傳最後的位置 */
function walk(world, from, direction, steps) {
  const p = { x: from.x, z: from.z }
  for (let i = 0; i < steps; i++) {
    p.x += direction.x * 0.15
    p.z += direction.z * 0.15
    resolvePlayerPosition(p, PLAYER.radius, world.collision)
  }
  return p
}

/** 從迪化街走進巷子、穿過騎樓與大門，走到櫃台前；回傳每一段的終點 */
function walkIn(world, from = { x: MOUTH.x, z: 0 }) {
  const lane = walk(world, from, { x: 0, z: 1 }, Math.round((DOOR_Z - from.z) / 0.15))
  const inside = walk(world, lane, { x: 1, z: 0 }, 60)
  return { lane, inside }
}

/** 從店裡走回巷子、再走回迪化街 */
function walkOut(world, from) {
  const lane = walk(world, from, { x: -1, z: 0 }, Math.round((from.x - MOUTH.x) / 0.15))
  const street = walk(world, lane, { x: 0, z: -1 }, Math.round((lane.z - 0) / 0.15))
  return { lane, street }
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const found = interiorAmount(p, world.interiors)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  let allowed = Math.max(follow.minDistance, hit - 0.45)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, distance: d }
}

describe('導演的豆花店：只在「老屋新生」的224巷', () => {
  test('店家只出現在「老屋新生」，其他年代沒有巷子、店、豆花車與室內', () => {
    for (const era of ERAS) assert.equal(era.availableStores.includes('action-bar'), era.id === 'revival', era.id)
    assert.equal(shop.year, 2021)
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = buildEraWorldSync(era.id)
      assert.ok(!world.buildings.some((item) => /action-bar/.test(item.id) || item.storeId === 'action-bar'), era.id)
      assert.ok(!world.signs.some((sign) => /導演的豆花|224巷/.test(sign.text)), era.id)
      assert.ok(!world.interiors.some((item) => item.id === 'action-bar'), era.id)
      // 巷口的地段在其他年代仍是一般街屋
      assert.ok(world.buildings.some((item) => item.id === 'south-17'), era.id)
      assert.equal(buildEraInteriorSync(era.id, 'site-action-bar').batches.length, 0, era.id)
    }
    assert.ok(!revival.buildings.some((item) => item.id === 'south-17'))
  })

  test('招牌：正面的藍白店名與 ACTION! BAR、側邊的藍色膠卷招牌、豆花車與巷名牌', () => {
    const signs = revival.signs
    assert.ok(signs.some((sign) => sign.text === '導演的豆花店' && sign.style === 'actionBlue'))
    assert.ok(signs.some((sign) => sign.text === 'ACTION! BAR'))
    assert.ok(signs.some((sign) => sign.text === '導演的豆花店' && sign.style === 'filmBlue'))
    assert.ok(signs.some((sign) => sign.text === '導演的豆花車'))
    assert.ok(signs.some((sign) => sign.text === '迪化街一段224巷'))
  })

  test('巷子與店不覆蓋林復振、滋養、永樂市場或其他建築', () => {
    const mine = revival.buildings.filter((item) => /action-bar/.test(item.id))
    const others = revival.buildings.filter((item) => !/action-bar/.test(item.id))
    assert.ok(mine.length > 3)
    for (const id of ['lin-fu-zhen', 'zi-yang', 'yong-le-market', 'hao-guo-yuan']) {
      assert.ok(others.some((item) => item.storeId === id), `${id} 仍在街上`)
    }
    for (const a of mine) {
      for (const part of a.parts) {
        for (const o of others) {
          for (const other of o.parts) assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, `${a.id} 與 ${o.id} 重疊`)
        }
      }
    }
    // 巷子的可行走範圍也不穿進其他建築
    const laneRect = revival.collision.walkable.find((r) => Math.abs(r.minX - (MOUTH.x - LANE.half)) < 1e-6 && r.maxZ > 25)
    assert.ok(laneRect, '巷子的可行走範圍')
    for (const o of others) for (const other of o.parts) assert.ok(!overlaps({ ...laneRect, minZ: MOUTH.z + 0.1 }, other), o.id)
  })

  test('豆花車停在巷子西側，留下至少 4.5 公尺的通道', () => {
    const truck = revival.buildings.find((item) => item.id === 'action-bar-truck')
    assert.ok(truck)
    const clear = MOUTH.x + LANE.half - truck.box.maxX
    assert.ok(clear > 4.5, `通道寬 ${clear.toFixed(2)} 公尺`)
    assert.ok(truck.box.minX >= MOUTH.x - LANE.half)
  })
})

describe('導演的豆花店：從迪化街走進店裡（碰撞）', () => {
  test('從迪化街走進巷子，穿過騎樓與大門，走到櫃台前', () => {
    const { lane, inside } = walkIn(revival)
    assert.ok(Math.abs(lane.z - DOOR_Z) < 0.2 && Math.abs(lane.x - MOUTH.x) < 0.01, `巷子裡 (${lane.x.toFixed(2)}, ${lane.z.toFixed(2)})`)
    assert.ok(inside.x > COUNTER_X - 1.4 && inside.x < COUNTER_X, `店裡 x=${inside.x.toFixed(2)}`)
    const point = getShopPlacement(shop).interactionPoint
    assert.ok(Math.hypot(inside.x - point.x, inside.z - point.z) < shop.interaction.radius)
  })

  test('連續進出 5 次：每次都走到櫃台前，再走回迪化街', () => {
    let p = { x: MOUTH.x, z: 0 }
    const point = getShopPlacement(shop).interactionPoint
    for (let i = 0; i < 5; i++) {
      const { inside } = walkIn(revival, p)
      assert.ok(Math.hypot(inside.x - point.x, inside.z - point.z) < shop.interaction.radius, `第 ${i + 1} 次進入：(${inside.x.toFixed(2)}, ${inside.z.toFixed(2)})`)
      const { street } = walkOut(revival, inside)
      assert.ok(street.z < 1 && Math.abs(street.x - MOUTH.x) < 0.3, `第 ${i + 1} 次離開：(${street.x.toFixed(2)}, ${street.z.toFixed(2)})`)
      p = street
    }
  })

  test('牆、柱、櫃台、豆花車與店內的桌椅都不能穿越', () => {
    // 店的前牆（大門兩側）、二樓下的側牆、櫃台後方
    assert.ok(!walkableAt(revival, fromShop(-2.0, -2.1).x, fromShop(-2.0, -2.1).z))
    assert.ok(!walkableAt(revival, fromShop(2.0, -2.1).x, fromShop(2.0, -2.1).z))
    assert.ok(!walkableAt(revival, fromShop(0, SHOP.counterZ - 0.4).x, fromShop(0, SHOP.counterZ - 0.4).z))
    // 騎樓的圓柱
    for (const sx of SHOP.columns) assert.ok(!walkableAt(revival, fromShop(sx, -0.4).x, fromShop(sx, -0.4).z), `柱 ${sx}`)
    // 豆花車
    const truck = revival.buildings.find((item) => item.id === 'action-bar-truck').box
    assert.ok(!walkableAt(revival, (truck.minX + truck.maxX) / 2, (truck.minZ + truck.maxZ) / 2))
    // 櫥窗前的豆花展示桌
    assert.ok(!walkableAt(revival, fromShop(-1.78, -2.7).x, fromShop(-1.78, -2.7).z))
    // 店裡往左牆走：停在牆前
    const wall = walk(revival, fromShop(0, -4.2), { x: 0, z: -1 }, 40)
    assert.ok(wall.z > fromShop(-SHOP.half + SHOP.wallT, 0).z + PLAYER.radius - 0.01, `停在 z=${wall.z.toFixed(2)}`)
    // 巷子東側的鄰棟立面
    const neighbour = walk(revival, { x: MOUTH.x, z: MOUTH.z + 13 }, { x: 1, z: 0 }, 40)
    assert.ok(neighbour.x < MOUTH.x + LANE.half, `停在 x=${neighbour.x.toFixed(2)}`)
    // 店裡的空地可以站
    assert.ok(walkableAt(revival, fromShop(0, -4.2).x, fromShop(0, -4.2).z))
  })

  test('換到其他年代時，站在店裡或巷子裡的人物會被推到最近、可以走的街道上', () => {
    const modern = buildEraWorldSync('modern')
    for (const start of [fromShop(0, -4.2), { x: MOUTH.x, z: MOUTH.z + 15 }]) {
      const p = { ...start }
      resolvePlayerPosition(p, PLAYER.radius, modern.collision)
      assert.ok(walkableAt(modern, p.x, p.z), `推到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      // 不會留在原本巷子或店的位置（那一帶在其他年代是街屋）
      assert.ok(p.z < MOUTH.z + 6, `推到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    }
  })
})

describe('導演的豆花店：互動、介紹鏡頭與店家名錄', () => {
  const placement = getShopPlacement(shop)

  test('互動點在店裡櫃台前，可以站；從名錄前往時站的位置也在店裡', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(revival, point.x, point.z))
    assert.ok(point.x > zone.minX && point.x < zone.maxX && point.z > zone.minZ && point.z < zone.maxZ)
    const arrive = { x: point.x + placement.forward.x * 0.5, z: point.z + placement.forward.z * 0.5 }
    assert.ok(walkableAt(revival, arrive.x, arrive.z))
    assert.ok(Math.hypot(arrive.x - point.x, arrive.z - point.z) < shop.interaction.radius)
  })

  test('介紹的鏡頭在店裡、不在任何方塊裡，看得到豆花櫃台', () => {
    const cam = placement.camera.position
    assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), JSON.stringify(cam))
    assert.ok(cam.x > zone.minX && cam.x < zone.maxX && cam.z > zone.minZ && cam.z < zone.maxZ)
    assert.ok(cam.y < SHOP.ceiling - 0.5)
    assert.ok(!segmentBlocked(cam, { x: shop.position.x - 0.1, y: 1.3, z: shop.position.z }, revival.blockers))
  })

  test('店家名錄的「聚焦建築」聚焦店面立面；豆花櫃台是店裡的細部目標', () => {
    const records = revival.buildings.filter((item) => item.storeId === 'action-bar')
    const facade = records.find((item) => !item.detail)
    const counter = records.find((item) => item.detail)
    assert.equal(facade.id, 'site-action-bar')
    assert.equal(counter.id, 'action-bar-douhua')
    // 鄰棟與豆花車不屬於豆花店
    for (const id of ['action-bar-lane-brick', 'action-bar-lane-tan', 'action-bar-truck']) {
      assert.equal(revival.buildings.find((item) => item.id === id).storeId, null, id)
    }
  })
})

describe('導演的豆花店：鏡頭', () => {
  test('走向大門時鏡頭逐漸切換成店內鏡頭；在店裡完全切換', () => {
    assert.equal(interiorAmount({ x: MOUTH.x, z: 2 }, revival.interiors), null)
    const xs = [MOUTH.x, MOUTH.x + 2.5, MOUTH.x + 3.6, MOUTH.x + 4.4, MOUTH.x + 5.4]
    const ramp = xs.map((x) => interiorAmount({ x, z: DOOR_Z }, revival.interiors)?.amount ?? 0)
    for (let i = 1; i < ramp.length; i++) assert.ok(ramp[i] >= ramp[i - 1], ramp.join(', '))
    assert.ok(ramp[0] < 0.2 && ramp.at(-1) === 1, ramp.join(', '))
    assert.equal(interiorAmount(fromShop(0, -4.2), revival.interiors).amount, 1)
    const indoor = indoorFollow(CAMERA.pitch, CAMERA.distance, 1, zone.camera)
    assert.ok(indoor.distance <= zone.camera.distance && indoor.minDistance < 1)
  })

  test('在店裡與大門，各個方向的跟隨鏡頭都在天花板下、不在牆裡，看得到人物', () => {
    const spots = [fromShop(-0.1, -2.5), fromShop(0, -4.2), fromShop(1.0, -4.0), fromShop(-1.5, -5.2), placement().interactionPoint]
    for (const p of spots) {
      for (let i = 0; i < 12; i++) {
        const cam = followCamera(revival, p, (i / 12) * Math.PI * 2)
        const where = `(${p.x.toFixed(2)}, ${p.z.toFixed(2)}) 方向 ${i}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`
        assert.equal(cam.k, 1, where)
        assert.ok(cam.y <= zone.camera.maxHeight + 1e-6, where)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
        assert.ok(!segmentBlocked(cam, { x: p.x, y: CAMERA.targetHeight, z: p.z }, revival.blockers), where)
      }
    }
    function placement() {
      return getShopPlacement(shop)
    }
  })

  test('在巷子裡，跟隨鏡頭不會穿進兩側的建築', () => {
    for (const p of [
      { x: MOUTH.x, z: MOUTH.z + 4 },
      { x: MOUTH.x + 1, z: MOUTH.z + 12 },
      { x: MOUTH.x + 1.5, z: MOUTH.z + 22 },
    ]) {
      for (let i = 0; i < 12; i++) {
        const cam = followCamera(revival, p, (i / 12) * Math.PI * 2)
        const where = `(${p.x.toFixed(2)}, ${p.z.toFixed(2)}) 方向 ${i}`
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
      }
    }
  })
})

describe('導演的豆花店：建築觀賞模式（外觀與店內）', () => {
  test('用 WASD 把注視點從迪化街移進巷子、騎樓與店裡：沿路都在範圍內，不穿牆', () => {
    const target = { x: MOUTH.x, y: 2.4, z: 0 }
    const path = [
      [{ x: 0, z: 1 }, Math.round((DOOR_Z - 0) / 0.15)],
      [{ x: 1, z: 0 }, 50],
    ]
    for (const [dir, steps] of path) {
      for (let i = 0; i < steps; i++) {
        target.x += dir.x * 0.15
        target.z += dir.z * 0.15
        clampViewerTarget(target, revival.blockers, space)
        assert.ok(!revival.blockers.some((box) => insideBox(target, box)), `(${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`)
      }
    }
    assert.ok(target.x > zone.minX + 1, `注視點到 x=${target.x.toFixed(2)}`)
    assert.ok(target.y <= SHOP.ceiling - 1, `y=${target.y.toFixed(2)}`)
  })

  test('店裡旋轉鏡頭：鏡頭停在天花板下方，不會鑽進牆或天花板', () => {
    const target = { ...fromShop(0, -4.2), y: 1.6 }
    for (const pitch of [0.15, 0.5, 0.9, 1.3]) {
      for (let i = 0; i < 8; i++) {
        const direction = orbitDirection((i / 8) * Math.PI * 2, pitch)
        const d = allowedDistance(target, direction, 8.5, revival.blockers, space)
        const cam = { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
        assert.ok(cam.y <= SHOP.ceiling - 0.4 + 1e-6, `pitch ${pitch}：y=${cam.y.toFixed(2)}`)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `pitch ${pitch} 方向 ${i}`)
      }
    }
  })

  test('聚焦店面：鏡頭在巷子裡，看得到騎樓；聚焦豆花櫃台：鏡頭在店裡近距離看', () => {
    const facade = revival.buildings.find((item) => item.id === 'site-action-bar')
    const plan = planBuildingFocus(facade, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
    const f = orbitDirection(plan.yaw, plan.pitch)
    const view = { x: plan.target.x + f.x * plan.distance, y: plan.target.y + f.y * plan.distance, z: plan.target.z + f.z * plan.distance }
    assert.ok(view.x > MOUTH.x - LANE.half && view.x < MOUTH.x + LANE.half, JSON.stringify(view))
    assert.ok(!revival.blockers.some((box) => insideBox(view, box)))
    assert.ok(!segmentBlocked(view, { ...fromShop(0, 0.3), y: 2.4 }, revival.blockers), '看得到騎樓')

    const counter = revival.buildings.find((item) => item.id === 'action-bar-douhua')
    const near = planBuildingFocus(counter, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
    const n = orbitDirection(near.yaw, near.pitch)
    const cam = { x: near.target.x + n.x * near.distance, y: near.target.y + n.y * near.distance, z: near.target.z + n.z * near.distance }
    assert.ok(cam.x > zone.minX && cam.x < zone.maxX && cam.z > zone.minZ && cam.z < zone.maxZ, JSON.stringify(cam))
    assert.ok(near.distance <= 2.5 && cam.y < SHOP.ceiling - 0.5)
    assert.ok(!revival.blockers.some((box) => insideBox(cam, box)))
  })

  test('觀賞模式不能把注視點移出巷底', () => {
    const target = { x: MOUTH.x, y: 2.4, z: MOUTH.z + 10 }
    for (let i = 0; i < 200; i++) {
      target.z += 0.15
      clampViewerTarget(target, revival.blockers, space)
    }
    assert.ok(target.z < MOUTH.z + LANE.length + 0.5, `z=${target.z.toFixed(2)}`)
  })
})

describe('導演的豆花店：室內細部與豆花展示按需載入', () => {
  test('室內細部只在接近時另外產生；每棟建築的室內各自產生', () => {
    const interior = buildEraInteriorSync('revival', zone.building)
    assert.ok(interior.batches.length > 4)
    const materials = new Set(interior.batches.map((batch) => batch.material))
    for (const material of ['planks', 'wood', 'glassClear', 'steel']) assert.ok(materials.has(material), material)
    for (const batch of interior.batches) {
      const box = batch.geometry.boundingBox
      assert.ok(box.min.x > zone.minX - 0.3 && box.max.x < zone.maxX + 0.3, batch.material)
      assert.ok(box.min.z > zone.minZ - 0.3 && box.max.z < zone.maxZ + 0.3, batch.material)
      assert.ok(box.max.y <= SHOP.ceiling + 0.05, batch.material)
    }
    // 永樂市場的室內不包含豆花店，反之亦然
    const market = revival.interiors.find((item) => item.id === 'yong-le-market')
    for (const batch of buildEraInteriorSync('revival', market.building).batches) {
      assert.ok(batch.geometry.boundingBox.min.x > zone.maxX, batch.material)
    }
    const verts = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(verts < 120000, `室內頂點數 ${verts}`)
    assert.ok(zone.loadRadius > 0 && zone.showRadius >= zone.loadRadius)
  })
})

describe('導演的豆花店：介紹內容', () => {
  const textOf = (item) =>
    item.chapters
      .flatMap((chapter) => [chapter.title, chapter.lead, chapter.intro, ...(chapter.paragraphs ?? []), ...(chapter.items ?? []).flatMap((food) => [food.description, food.note])])
      .filter(Boolean)
      .join('')

  test('五個章節：豆花車、夢想基地、一碗豆花、用影像記錄臺灣、參考文獻', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => [chapter.title, chapter.type]),
      [
        ['第一章｜一台豆花車的誕生', 'text'],
        ['第二章｜夢想基地', 'text'],
        ['第三章｜一碗豆花', 'foods'],
        ['第四章｜用影像記錄臺灣', 'text'],
        ['第五章｜參考文獻', 'sources'],
      ],
    )
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    assert.deepEqual(
      foods.items.map((item) => item.name),
      ['傳統豆花', '麥芽糖水', '地瓜粉圓', '粉粿', '紅豆・綠豆'],
    )
    const art = readFileSync(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of foods.items) assert.ok(art.includes(`'${item.id}':`) || art.includes(`  ${item.id}:`), item.id)
  })

  test('店名、地址、2021年開店與豆花車的由來', () => {
    assert.equal(shop.name, '導演的豆花店 Action! Bar')
    const text = textOf(shop)
    assert.match(text, /夢想基地－導演的豆花店/)
    assert.match(text, /迪化街一段224巷24號/)
    assert.match(text, /2021年/)
    assert.match(text, /何明瑞/)
    assert.match(text, /你在天上飛、我在地上跑/)
  })

  test('不捏造獎項與經營資訊：只寫可查證的「入圍」，示意內容標明為原創', () => {
    const text = textOf(shop)
    assert.doesNotMatch(text, /WorldFest|休士頓|獲獎|得獎|榮獲/)
    assert.match(text, /入圍/)
    assert.doesNotMatch(text, /營業時間|\d+元/)
    assert.match(text, /原創的示意/)
  })

  test('引用的文獻都存在、都有網址，包含臺北市商業處與商工登記', () => {
    const ids = new Set(shop.chapters.flatMap((chapter) => chapter.sourceIds ?? []))
    assert.ok(ids.size >= 8)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https:\/\//, id)
    }
    assert.ok(ids.has('tcooc-action-bar') && ids.has('gcis-action-bar'))
    assert.match(getSource('tcooc-action-bar').url, /tcooc\.gov\.taipei/)
  })
})
