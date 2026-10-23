import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { MARKET, STALLS } from '../src/game/builders/yongleMarket.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import {
  allowedDistance,
  clampViewerTarget,
  followAllowed,
  inFollowArea,
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
 * 永樂市場與好粿緣：只在「老屋新生」出現的街底市場大樓、可以走進去的一樓市場（碰撞、鏡頭、觀賞模式）、
 * 按需載入的室內細部，以及店家資料（不捏造的店家介紹、有出處的食物與市場歷史）。
 */
const revival = buildEraWorldSync('revival')
const market = getShop('yong-le-market')
const hao = getShop('hao-guo-yuan')
const zone = revival.interiors[0]
const space = viewerSpaceOf(revival)

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
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

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const found = interiorAmount(p, world.interiors)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  // 室內與窄巷停在障礙物前面；街道維持原本的最近距離（與 CameraRig 相同）
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, distance: d }
}

describe('永樂市場：只在「老屋新生」的街底', () => {
  test('市場與好粿緣只出現在「老屋新生」，好粿緣在市場裡（攤位1020），不是街上的建築', () => {
    for (const era of ERAS) {
      for (const id of ['yong-le-market', 'hao-guo-yuan']) assert.equal(era.availableStores.includes(id), era.id === 'revival', `${era.id} ${id}`)
    }
    assert.equal(hao.inside, 'yong-le-market')
    assert.equal(hao.stall, '1020')
    assert.ok(!hao.site && !hao.building, '好粿緣沒有自己的街屋')
    const marketBuilding = revival.buildings.find((item) => item.storeId === 'yong-le-market')
    const stall = revival.buildings.find((item) => item.storeId === 'hao-guo-yuan')
    assert.ok(marketBuilding && stall)
    // 好粿緣的攤位在市場一樓的室內範圍裡
    for (const [x, z] of [
      [stall.box.minX, stall.box.minZ],
      [stall.box.maxX, stall.box.maxZ],
    ]) {
      assert.ok(x >= zone.minX - 1e-6 && x <= zone.maxX + 1e-6 && z >= zone.minZ - 1e-6 && z <= zone.maxZ + 1e-6)
    }
  })

  test('其他年代沒有市場、室內與額外的觀賞範圍', () => {
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = buildEraWorldSync(era.id)
      assert.equal(world.interiors.length, 0, era.id)
      // 戰後只有慈聖宮廟埕後段的觀賞範圍（豆花攤與糕粿攤，見 tests/templeSnacks.test.js），沒有市場的
      assert.equal(world.viewerRegions.length, era.id === 'postwar' ? 1 : 0, era.id)
      assert.ok(!world.buildings.some((item) => item.storeId === 'yong-le-market' || item.storeId === 'hao-guo-yuan'), era.id)
      assert.equal(buildEraInteriorSync(era.id).batches.length, 0, era.id)
    }
  })

  test('立面的招牌與好粿緣的綠色招牌、攤位牌都在', () => {
    const texts = revival.signs.map((sign) => sign.text)
    assert.ok(texts.includes('永樂布業商場'))
    assert.ok(revival.signs.some((sign) => sign.text === '好粿緣' && sign.style === 'greenBoard'))
    assert.ok(texts.includes('攤位編號1020'))
    for (const tag of ['草仔粿', '紅龜粿', '蘿蔔糕', '芋粿巧']) assert.ok(texts.includes(tag), tag)
  })

  test('一樓有 6–10 個攤位，每個攤位都有到天花板的遮擋方塊', () => {
    assert.ok(STALLS.length >= 6 && STALLS.length <= 10)
    const stall = revival.buildings.find((item) => item.storeId === 'hao-guo-yuan')
    assert.equal(stall.parts.length, 1)
    assert.equal(stall.box.maxY, MARKET.hall.ceiling)
  })
})

describe('永樂市場：走進去、走出來（碰撞）', () => {
  test('從迪化街街底沿著走道走進市場深處，再沿原路走回街上', () => {
    const inside = walk(revival, { x: 30, z: 0.2 }, { x: 1, z: 0 }, 260)
    assert.ok(inside.x > 57, `走到 x=${inside.x.toFixed(2)}`)
    assert.ok(Math.abs(inside.z - 0.2) < 0.01)
    const back = walk(revival, inside, { x: -1, z: 0 }, 260)
    assert.ok(back.x < 31, `走回 x=${back.x.toFixed(2)}`)
  })

  test('連續進出 5 次，每次都能走到好粿緣前面再回到街上', () => {
    let p = { x: 32, z: 0 }
    for (let i = 0; i < 5; i++) {
      p = walk(revival, p, { x: 1, z: 0 }, 130)
      assert.ok(Math.hypot(p.x - 50.05, p.z - -0.65) < hao.interaction.radius, `第 ${i + 1} 次進入：(${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      p = walk(revival, p, { x: -1, z: 0 }, 130)
      assert.ok(p.x < 34, `第 ${i + 1} 次離開：x=${p.x.toFixed(2)}`)
    }
  })

  test('大門以外的立面走不進去；攤位、展示櫃與牆壁不能穿越', () => {
    // 沿著大門旁邊（騎樓）往牆走：停在牆前
    const wall = walk(revival, { x: 38, z: 4 }, { x: 1, z: 0 }, 80)
    assert.ok(wall.x < MARKET.wallT + 41.9, `停在 x=${wall.x.toFixed(2)}`)
    // 在走道上往攤位走：停在攤位前緣
    const stall = walk(revival, { x: 50.05, z: 0 }, { x: 0, z: -1 }, 40)
    assert.ok(stall.z > -MARKET.aisleHalf + PLAYER.radius - 0.01, `停在 z=${stall.z.toFixed(2)}`)
    // 攤位裡、市場外牆裡與天花板上方的空間都不能站
    assert.ok(!walkableAt(revival, 50.05, -3.6))
    assert.ok(!walkableAt(revival, 52, 3.6))
    assert.ok(!walkableAt(revival, 46, 7))
    assert.ok(walkableAt(revival, 46, 0))
  })

  test('換到其他年代時，站在市場裡的人物會被推回街上', () => {
    const modern = buildEraWorldSync('modern')
    const p = { x: 50, z: 0 }
    resolvePlayerPosition(p, PLAYER.radius, modern.collision)
    assert.ok(p.x < 36, `推到 x=${p.x.toFixed(2)}`)
  })
})

describe('好粿緣：互動位置與介紹鏡頭', () => {
  const placement = getShopPlacement(hao)

  test('互動點與從名錄前往時站的位置都在走道上，而且在互動範圍內', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(revival, point.x, point.z))
    const arrive = { x: point.x + placement.forward.x * 0.5, z: point.z + placement.forward.z * 0.5 }
    assert.ok(walkableAt(revival, arrive.x, arrive.z))
    assert.ok(Math.hypot(arrive.x - point.x, arrive.z - point.z) < hao.interaction.radius)
    assert.ok(Math.abs(arrive.z) < MARKET.aisleHalf)
  })

  test('介紹的鏡頭在走道上、不在任何方塊裡，看得到攤位正面', () => {
    const cam = placement.camera.position
    assert.ok(!revival.blockers.some((box) => insideBox(cam, box)))
    assert.ok(cam.x > zone.minX && cam.x < zone.maxX && Math.abs(cam.z) < MARKET.aisleHalf)
    assert.ok(cam.y < MARKET.hall.ceiling - 1)
    const front = { x: hao.position.x, y: 1.4, z: hao.position.z + 0.06 }
    assert.ok(!segmentBlocked(cam, front, revival.blockers))
  })
})

describe('永樂市場：室內鏡頭', () => {
  test('從街上走向大門時，鏡頭逐漸切換成室內鏡頭；在室內完全切換', () => {
    assert.equal(interiorAmount({ x: 20, z: 0 }, revival.interiors), null)
    const ramp = [35, 37, 39, 41.5].map((x) => interiorAmount({ x, z: 0 }, revival.interiors)?.amount ?? 0)
    for (let i = 1; i < ramp.length; i++) assert.ok(ramp[i] >= ramp[i - 1], ramp.join(', '))
    assert.ok(ramp[0] < 0.5 && ramp[3] === 1, ramp.join(', '))
    assert.equal(interiorAmount({ x: 50, z: 0 }, revival.interiors).amount, 1)
    const indoor = indoorFollow(CAMERA.pitch, CAMERA.distance, 1, zone.camera)
    assert.ok(indoor.distance <= zone.camera.distance && indoor.pitch < CAMERA.pitch && indoor.minDistance < 1.3)
  })

  test('在走道與大門，各個方向的跟隨鏡頭都在天花板與吊牌下方，不在牆或攤位裡，看得到人物', () => {
    const spots = [
      { x: 42.2, z: 0 },
      { x: 44, z: 2.5 },
      { x: 46, z: 0 },
      { x: 50.05, z: -0.15 },
      { x: 56, z: 0.8 },
    ]
    for (const p of spots) {
      for (let i = 0; i < 12; i++) {
        const cam = followCamera(revival, p, (i / 12) * Math.PI * 2)
        const where = `(${p.x}, ${p.z}) 方向 ${i}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`
        assert.equal(cam.k, 1, where)
        assert.ok(cam.y <= zone.camera.maxHeight + 1e-6, where)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
        assert.ok(!segmentBlocked(cam, { x: p.x, y: CAMERA.targetHeight, z: p.z }, revival.blockers), where)
      }
    }
  })
})

describe('永樂市場：建築觀賞模式可以進到室內', () => {
  test('觀賞範圍包含廣場、大門與一樓走道；室內的注視點不超過天花板', () => {
    assert.ok(space.regions.length > 3)
    const target = clampViewerTarget({ x: 50, y: 6, z: 0 }, revival.blockers, space)
    assert.ok(Math.abs(target.x - 50) < 1e-6 && Math.abs(target.z) < 1e-6)
    assert.ok(target.y <= 2.8 + 1e-6)
    // 攤位裡的點被推回走道
    const stall = clampViewerTarget({ x: 50, y: 1.7, z: -3.5 }, revival.blockers, space)
    assert.ok(Math.abs(stall.z) <= MARKET.aisleHalf, `z=${stall.z}`)
  })

  test('用 WASD 從街上把注視點移進市場：沿路都在範圍內，不會穿牆', () => {
    const target = { x: 30, y: 2.4, z: 0 }
    for (let i = 0; i < 200; i++) {
      target.x += 0.15
      clampViewerTarget(target, revival.blockers, space)
      assert.ok(!revival.blockers.some((box) => insideBox(target, box)), `x=${target.x.toFixed(2)}`)
    }
    assert.ok(target.x > 55, `注視點到 x=${target.x.toFixed(2)}`)
    assert.ok(target.y <= 2.8 + 1e-6)
  })

  test('室內旋轉鏡頭：鏡頭停在日光燈下方，不會鑽進天花板', () => {
    const target = { x: 50, y: 1.7, z: 0 }
    for (const pitch of [0.2, 0.6, 1.0, 1.3]) {
      for (let i = 0; i < 8; i++) {
        const direction = orbitDirection((i / 8) * Math.PI * 2, pitch)
        const d = allowedDistance(target, direction, 8.5, revival.blockers, space)
        const cam = { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
        assert.ok(cam.y <= 3.1 + 1e-6, `pitch ${pitch}：y=${cam.y.toFixed(2)}`)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)))
      }
    }
  })

  test('聚焦好粿緣：鏡頭在走道上；聚焦市場：從迪化街上正面看立面', () => {
    const stall = revival.buildings.find((item) => item.storeId === 'hao-guo-yuan')
    const plan = planBuildingFocus(stall, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
    const d = orbitDirection(plan.yaw, plan.pitch)
    const cam = { x: plan.target.x + d.x * plan.distance, y: plan.target.y + d.y * plan.distance, z: plan.target.z + d.z * plan.distance }
    assert.ok(cam.x > zone.minX && cam.x < zone.maxX && Math.abs(cam.z) < MARKET.aisleHalf, JSON.stringify(cam))
    assert.ok(cam.y < 3.2 && !revival.blockers.some((box) => insideBox(cam, box)))

    const building = revival.buildings.find((item) => item.storeId === 'yong-le-market')
    const facadePlan = planBuildingFocus(building, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
    const f = orbitDirection(facadePlan.yaw, facadePlan.pitch)
    const view = {
      x: facadePlan.target.x + f.x * facadePlan.distance,
      y: facadePlan.target.y + f.y * facadePlan.distance,
      z: facadePlan.target.z + f.z * facadePlan.distance,
    }
    assert.ok(view.x < 36 && Math.abs(view.z) < 2.5 && view.y < 12, JSON.stringify(view))
    assert.ok(!segmentBlocked(view, { x: 39.4, y: 3, z: 0 }, revival.blockers), '看得到大門')
  })

  test('從室內到街上隔著牆：判定為被擋住（返回探索時直接切換，不穿牆）', () => {
    assert.ok(segmentBlocked({ x: 50, y: 1.7, z: 0 }, { x: 38, y: 6.5, z: 0 }, revival.blockers))
    assert.ok(!segmentBlocked({ x: 46, y: 1.7, z: 0 }, { x: 56, y: 1.7, z: 0 }, revival.blockers))
  })
})

describe('永樂市場：室內細部按需載入', () => {
  test('街景不含室內細部；室內另外產生（地磚、展示櫃、商品）', () => {
    const worldMaterials = new Set(revival.batches.map((batch) => batch.material))
    const interior = buildEraInteriorSync('revival', zone.building)
    const interiorMaterials = new Set(interior.batches.map((batch) => batch.material))
    assert.ok(!worldMaterials.has('marketTile'), '街景的網格裡沒有室內地磚')
    for (const material of ['marketTile', 'whiteTile', 'steel', 'perforated', 'glassClear', 'wood']) {
      assert.ok(interiorMaterials.has(material), material)
    }
    // 室內細部在室內範圍裡（加上大門一帶）
    for (const batch of interior.batches) {
      const box = batch.geometry.boundingBox
      assert.ok(box.min.x > zone.minX - 1.5 && box.max.x < zone.maxX + 0.5, batch.material)
      assert.ok(box.min.z > zone.minZ - 0.5 && box.max.z < zone.maxZ + 0.5, batch.material)
      assert.ok(box.max.y <= MARKET.hall.ceiling + 0.7, batch.material)
    }
    assert.ok(zone.loadRadius > 0 && zone.showRadius >= zone.loadRadius)
  })
})

describe('永樂市場與好粿緣：介紹內容', () => {
  const textOf = (shop) =>
    shop.chapters
      .flatMap((chapter) => [chapter.title, chapter.lead, ...(chapter.paragraphs ?? []), ...(chapter.items ?? []).flatMap((item) => [item.description, item.note])])
      .filter(Boolean)
      .join('')

  test('好粿緣：店家介紹、代表食品、食物文化、參考資料四個章節', () => {
    assert.deepEqual(
      hao.chapters.map((chapter) => [chapter.tab, chapter.type]),
      [
        ['店家介紹', 'text'],
        ['代表食品', 'foods'],
        ['食物文化', 'text'],
        ['參考資料', 'sources'],
      ],
    )
    const foods = hao.chapters.find((chapter) => chapter.type === 'foods')
    assert.deepEqual(
      foods.items.map((item) => item.name),
      ['草仔粿', '紅龜粿', '蘿蔔糕（菜頭粿）', '芋粿巧'],
    )
    // 每一種食物都有自己的插圖
    const art = readFileSync(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of foods.items) assert.ok(art.includes(`'${item.id}':`), item.id)
  })

  test('好粿緣：不捏造創立年份、創辦人或配方，並說明找不到店史資料', () => {
    assert.equal(hao.year, undefined)
    const text = textOf(hao)
    // 提到好粿緣的句子都沒有年份（市場的1908、1985年是市場的歷史，不是好粿緣的）
    for (const sentence of text.split(/[。；]/).filter((item) => item.includes('好粿緣'))) {
      assert.doesNotMatch(sentence, /\d{4}年/, sentence)
    }
    assert.doesNotMatch(text, /創立於\d|創辦人[是為]/)
    assert.match(text, /沒有找到/)
    assert.match(text, /並非好粿緣的配方|不寫創立年份/)
  })

  test('永樂市場：說明1908年的起源與1985年開業的現有大樓，並區分兩個時期的建築', () => {
    assert.equal(market.year, 1908)
    const text = textOf(market)
    assert.match(text, /1908/)
    assert.match(text, /1985/)
    assert.match(text, /1908年的市場是另一棟早已拆除的平房建築/)
    assert.match(text, /簡化的概念配置/)
  })

  test('引用的文獻都存在，而且都有網址', () => {
    for (const shop of [market, hao]) {
      const ids = new Set(shop.chapters.flatMap((chapter) => chapter.sourceIds ?? []))
      assert.ok(ids.size >= 4, shop.id)
      for (const id of ids) {
        const source = getSource(id)
        assert.ok(source, id)
        assert.match(source.url, /^https:\/\//, id)
      }
    }
  })
})
