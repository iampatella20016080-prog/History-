import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { getInspectObject, inspectablesOfEra } from '../src/data/inspectObjects.js'
import { TALK_LABELS } from '../src/game/talk.js'
import { talkForNpc } from '../src/data/talk.js'
import { SHOWA_OUTSIDE, SHOWA_SHELL, SHOWA_SITE, SHOWA_VARIANT, showaToWorld } from '../src/data/showaLaundryLayout.js'
import { SHOWA_FURNITURE } from '../src/game/builders/showaLaundry/showaLaundryFurniture.js'
import { showaInteriorObstacles, showaOutsideObstacles } from '../src/game/builders/showaLaundry/showaLaundry.js'
import { NPC_LOOKS, NPC_POSES } from '../src/game/character/npcBuilder.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { facadeOf, followAllowed, indoorFollow, inFollowArea, interiorAmount, orbitDirection, planBuildingFocus } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/*
 * 昭和浪漫洗濯屋（安西街3號；只在 2000–現在「老屋新生」）：河岸廣場東南角的轉角老屋，一樓可以走進去、二樓不開放。
 * 查證紀錄見 docs/research/showa-laundry.md。
 */
const SHOP_ID = 'showa-laundry'
const REPLACED = ['south-13', 'plaza-1-1']
const shop = getShop(SHOP_ID)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const revival = worlds.revival
const building = revival.buildings.find((item) => item.storeId === SHOP_ID)
const W = (x, z) => showaToWorld(x, z)
const STEPS = [0.05, 0.15, 0.4]

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 沿著路線點行走（每一步做一次和遊戲中一個影格相同的碰撞處理；做法同 tests/linHuaTai.test.js） */
function walkRoute(world, start, points, stepSize) {
  const p = { x: start.x, z: start.z }
  for (const target of points) {
    for (let i = 0; i < 600; i++) {
      const dx = target.x - p.x
      const dz = target.z - p.z
      const d = Math.hypot(dx, dz)
      if (d < stepSize * 0.6) break
      const s = Math.min(stepSize, d)
      p.x += (dx / d) * s
      p.z += (dz / d) * s
      resolvePlayerPosition(p, PLAYER.radius, world.collision)
    }
  }
  return p
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw) {
  const found = interiorAmount(p, world.interiors)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(CAMERA.pitch, CAMERA.distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
}

const lotBox = () => {
  const a = W(-SHOWA_SHELL.half, SHOWA_SHELL.walkD)
  const b = W(SHOWA_SHELL.half + 1.0, SHOWA_SHELL.annex.minZ)
  return { minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z) }
}

/** 從街上走進店裡、穿過隔間門到後場（本地座標） */
const ROUTE = [[-1.35, 1.2], [-1.35, -0.6], [-1.6, -1.8], [-1.95, -3.0], [-1.95, -4.15], [-2.95, -4.2]]
const toWorld = (route) => route.map(([x, z]) => W(x, z))

describe('昭和浪漫洗濯屋：店家資料與章節', () => {
  test('已開放、有室內，只出現在「老屋新生」', () => {
    assert.equal(shop.status, 'open')
    assert.equal(shop.hasInterior, true)
    assert.deepEqual(Object.keys(shop.buildingByEra), ['revival'])
    for (const era of ERAS) assert.equal(era.availableStores.includes(SHOP_ID), era.id === 'revival', era.id)
  })

  test('章節：店家與位置、老洗衣店、洗衣這件事、安西街、代表食品、參考文獻', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => [chapter.id, chapter.type]),
      [['shop', 'text'], ['laundry', 'text'], ['washing', 'text'], ['street', 'text'], ['foods', 'foods'], ['sources', 'sources']],
    )
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    assert.deepEqual(foods.items.map((item) => item.name), ['季節霜淇淋', '三色烤糰子', '昭和苦甜布丁'])
    // 布丁只寫店家的布丁，不寫一般的喫茶店背景（使用者 2026-11-02 決定）
    const pudding = foods.items.find((item) => item.id === 'bittersweet-pudding')
    assert.doesNotMatch(`${pudding.description}${pudding.note ?? ''}`, /喫茶店/)
  })

  test('只有一篇媒體的說法寫成「據說」；屋齡不寫成事實', () => {
    const laundry = shop.chapters.find((chapter) => chapter.id === 'laundry')
    const text = [laundry.lead, ...laundry.paragraphs].join('')
    assert.match(text, /據說這棟房子是一間約八十年的老洗衣店/)
    assert.match(text, /據說改建自1937年的老宅/)
    assert.ok(laundry.facts.some((fact) => fact.label === '屋齡' && /據說/.test(fact.value) && /待核/.test(fact.value)))
    assert.ok(laundry.facts.some((fact) => fact.label === '洗衣店的年代' && /查無/.test(fact.value)))
    const shopChapter = shop.chapters.find((chapter) => chapter.id === 'shop')
    assert.match(shopChapter.paragraphs.join(''), /據說店名的「昭和」/)
  })

  test('「僑隆洗染」舊招牌標「使用者現場確認」，不當成文獻出處，也不拿招牌推年份', () => {
    const laundry = shop.chapters.find((chapter) => chapter.id === 'laundry')
    assert.match(laundry.lead, /僑隆洗染.*使用者現場確認，2026-11-02/)
    assert.match(laundry.paragraphs.join(''), /不能用來推算年份/)
    for (const id of shop.sourceIds) assert.doesNotMatch(getSource(id).citation, /使用者/)
    assert.ok(revival.signs.some((sign) => sign.text === '僑隆洗染' && sign.vertical))
  })

  test('引用的文獻都存在、有網址，中英文都有；經營者不點名', () => {
    const ids = new Set([...shop.sourceIds, ...shop.chapters.flatMap((chapter) => chapter.sourceIds ?? [])])
    assert.ok(ids.size >= 12)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https?:\/\//, id)
      assert.ok(source.citationEn && source.titleEn && source.contextEn, id)
    }
    for (const chapter of shop.chapters) {
      for (const key of ['title', 'tab']) assert.ok(chapter[`${key}En`], `${chapter.id} ${key}En`)
      if (chapter.paragraphs) assert.equal(chapter.paragraphs.length, chapter.paragraphsEn.length, chapter.id)
    }
  })
})

describe('昭和浪漫洗濯屋：轉角的位置（只在老屋新生）', () => {
  test('不改變五個年代共用的地段切分', () => {
    const ids = getLotPlan().lots.map((lot) => lot.id)
    for (const id of REPLACED) assert.ok(ids.includes(id), id)
    assert.ok(!ids.includes(`store-${SHOP_ID}`))
  })

  test('只在老屋新生取代 south-13 與 plaza-1-1；其他四個年代的地段與建築不變', () => {
    for (const era of ERAS) {
      const layout = createEraLayout(getEra(era.id))
      const ids = layout.buildings.map((item) => item.id)
      const site = layout.buildings.find((item) => item.storeId === SHOP_ID)
      if (era.id === 'revival') {
        for (const id of REPLACED) assert.ok(!ids.includes(id), `${era.id} 仍有 ${id}`)
        assert.deepEqual([site.x, site.z, site.rotationY], [SHOWA_SITE.x, SHOWA_SITE.z, SHOWA_SITE.rotationY])
      } else {
        for (const id of REPLACED) assert.ok(ids.includes(id), `${era.id} 少了 ${id}`)
        assert.equal(site, undefined, era.id)
        assert.ok(!worlds[era.id].signs.some((sign) => sign.style?.startsWith('showa')), era.id)
        assert.ok(!worlds[era.id].npcs.some((npc) => npc.id.startsWith('showa')), era.id)
      }
    }
  })

  test('轉角建築不和其他建築重疊（隔壁的新芳春、廣場南側的貨棧）', () => {
    for (const other of revival.buildings) {
      if (other === building) continue
      for (const a of building.parts) {
        for (const b of other.parts) {
          const overlap =
            Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) > 0.05 &&
            Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ) > 0.05 &&
            Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY) > 0.05
          assert.ok(!overlap, `與 ${other.id} 重疊`)
        }
      }
    }
    // 長立面沿著迪化街南側的立面線，山牆朝河岸廣場
    assert.ok(Math.abs(W(0, 0).z - 4.5) < 1e-9)
    assert.ok(W(SHOWA_SHELL.half, 0).x < W(-SHOWA_SHELL.half, 0).x, '本地 +x 是廣場那一側（西）')
    assert.ok(building.box.minX > -38.6 && building.box.maxX < -30.6)
  })

  test('廣場南側原本的長凳移走，其他廣場道具不變', () => {
    const benches = createEraLayout(getEra('revival')).props.filter((prop) => prop.type === 'bench')
    assert.ok(!benches.some((prop) => Math.abs(prop.position[0] - -38.2) < 0.01))
    assert.equal(benches.length, 2)
  })
})

describe('昭和浪漫洗濯屋：走進去、走出來（碰撞）', () => {
  test('從街上走到後場再走回街上（步長 0.05／0.15／0.4）', () => {
    const route = toWorld(ROUTE)
    const deepest = route[route.length - 1]
    for (const stepSize of STEPS) {
      const inside = walkRoute(revival, route[0], route.slice(1), stepSize)
      assert.ok(Math.hypot(inside.x - deepest.x, inside.z - deepest.z) < 0.45, `步長 ${stepSize}：停在 (${inside.x.toFixed(2)}, ${inside.z.toFixed(2)})`)
      const back = walkRoute(revival, inside, [...route].reverse(), stepSize)
      assert.ok(back.z < W(0, 0.6).z, `步長 ${stepSize}：走回 z=${back.z.toFixed(2)}`)
    }
  })

  test('連續進出 5 次（三種步長）', () => {
    const route = toWorld(ROUTE)
    for (const stepSize of STEPS) {
      let p = route[0]
      for (let i = 0; i < 5; i++) {
        p = walkRoute(revival, p, route.slice(1), stepSize)
        assert.ok(p.z > W(0, -3.9).z, `步長 ${stepSize} 第 ${i + 1} 次進到後場：z=${p.z.toFixed(2)}`)
        p = walkRoute(revival, p, [...route].reverse(), stepSize)
        assert.ok(p.z < W(0, 0.6).z, `步長 ${stepSize} 第 ${i + 1} 次離開：z=${p.z.toFixed(2)}`)
      }
    }
  })

  test('走到吧台前、靠窗座位旁，再走出來', () => {
    for (const stepSize of STEPS) {
      const p = walkRoute(revival, W(-1.35, 1.2), toWorld([[-1.35, -0.6], [-0.3, -1.75], [1.5, -1.75]]), stepSize)
      assert.ok(Math.hypot(p.x - W(1.5, -1.75).x, p.z - W(1.5, -1.75).z) < 0.4, `步長 ${stepSize}：停在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      const out = walkRoute(revival, p, toWorld([[-0.3, -1.75], [-1.35, -0.6], [-1.35, 1.2]]), stepSize)
      assert.ok(out.z < W(0, 0.6).z)
    }
  })

  test('從河岸廣場沿著山牆走到洗手台旁，再走回廣場', () => {
    for (const stepSize of STEPS) {
      const start = { x: -41, z: 3 }
      const p = walkRoute(revival, start, [{ x: -40.4, z: 6 }, W(4.9, -2.75)], stepSize)
      assert.ok(Math.hypot(p.x - W(4.9, -2.75).x, p.z - W(4.9, -2.75).z) < 0.4, `步長 ${stepSize}：停在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      const back = walkRoute(revival, p, [{ x: -40.4, z: 6 }, start], stepSize)
      assert.ok(Math.hypot(back.x - start.x, back.z - start.z) < 0.4)
    }
  })

  test('門以外的立面、山牆、樓梯、吧台後面與擺設都不能穿越', () => {
    // 從簷下直直往窗戶走，被擋在立面外
    for (const x of [-2.9, 0.4, 2.0, 2.9]) {
      const p = walkRoute(revival, W(x, 1.1), [W(x, -2)], 0.15)
      assert.ok(p.z < W(0, -0.1).z, `x=${x}：停在 z=${p.z.toFixed(2)}`)
    }
    // 從廣場往山牆走，被擋在牆外
    const side = walkRoute(revival, W(5.2, -1.8), [W(1.5, -1.8)], 0.15)
    assert.ok(side.x < W(SHOWA_SHELL.half - 0.05, 0).x, `停在 x=${side.x.toFixed(2)}`)
    // 二樓不開放：樓梯整段擋住；吧台與隔間牆之間是店員的位置
    const stairs = SHOWA_VARIANT.items.find((item) => item.type === 'stairs')
    for (const z of [(stairs.z0 + stairs.z1) / 2, stairs.z0 + 0.3]) assert.ok(!walkableAt(revival, W((stairs.x0 + stairs.x1) / 2, z).x, W(0, z).z), `樓梯 z=${z}`)
    assert.ok(!walkableAt(revival, W(1.5, -3.3).x, W(1.5, -3.3).z), '吧台後面')
    // 擺設與人物的中心都不能站（層架不擋路）
    for (const item of SHOWA_VARIANT.items) {
      if (item.block === false) continue
      const r = SHOWA_FURNITURE[item.type].footprint(item)
      const c = W((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(revival, c.x, c.z), item.type)
    }
    for (const npc of [...SHOWA_VARIANT.npcs, ...SHOWA_OUTSIDE.npcs]) assert.ok(!walkableAt(revival, W(npc.x, npc.z).x, W(npc.x, npc.z).z), npc.id)
    // 店與後棟裡（不是室內範圍的地方）不能站
    assert.ok(!walkableAt(revival, W(0, -7.5).x, W(0, -7.5).z), '後棟')
  })

  test('障礙物彼此不重疊（店內與店外各自）', () => {
    for (const list of [showaInteriorObstacles(SHOWA_VARIANT), showaOutsideObstacles()]) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [a, b] = [list[i], list[j]]
          assert.ok(!(a.minX < b.maxX - 1e-9 && b.minX < a.maxX - 1e-9 && a.minZ < b.maxZ - 1e-9 && b.minZ < a.maxZ - 1e-9), `${i} 與 ${j} 重疊`)
        }
      }
    }
  })

  test('換到其他年代時：站在店裡的人物移到可以走的地方', () => {
    for (const [x, z] of [[-1.35, -1.2], [1.5, -1.8], [-2.9, -4.2], [5.0, -3.0]]) {
      for (const era of ERAS) {
        if (era.id === 'revival') continue
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[era.id].collision, 0, { relocate: true })
        assert.ok(walkableAt(worlds[era.id], p.x, p.z), `${era.id} (${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      }
    }
  })
})

describe('昭和浪漫洗濯屋：鏡頭不穿牆', () => {
  const room = SHOWA_SHELL.room
  const roomBox = (() => {
    const a = W(room.minX, room.minZ)
    const b = W(room.maxX, room.maxZ)
    return { minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z) }
  })()

  test('店裡每個可以站的位置，頭頂高度都不在任何遮擋方塊裡', () => {
    let checked = 0
    for (let x = roomBox.minX + 0.3; x < roomBox.maxX - 0.3; x += 0.2) {
      for (let z = roomBox.minZ + 0.3; z < roomBox.maxZ - 0.3; z += 0.2) {
        if (!walkableAt(revival, x, z)) continue
        const box = revival.blockers.find((b) => x > b.minX && x < b.maxX && 1.6 > b.minY && 1.6 < b.maxY && z > b.minZ && z < b.maxZ)
        assert.ok(!box, `(${x.toFixed(2)}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
        checked++
      }
    }
    assert.ok(checked > 60, `${checked} 個位置`)
  })

  test('店裡每個位置、各個方向的跟隨鏡頭都在店裡、天花板以下', () => {
    let checked = 0
    for (let x = roomBox.minX + 0.4; x < roomBox.maxX - 0.3; x += 0.5) {
      for (let z = roomBox.minZ + 0.4; z < roomBox.maxZ - 0.3; z += 0.5) {
        if (!walkableAt(revival, x, z)) continue
        for (let i = 0; i < 12; i++) {
          const cam = followCamera(revival, { x, z }, (i / 12) * Math.PI * 2)
          // 往門口看時鏡頭可以從門退到簷下（同 tests/linHuaTai.test.js），只檢查兩側與後牆
          assert.ok(cam.x > roomBox.minX - 0.3 && cam.x < roomBox.maxX + 0.3 && cam.z < roomBox.maxZ + 0.3, `玩家 (${x.toFixed(1)}, ${z.toFixed(1)}) 鏡頭 (${cam.x.toFixed(2)}, ${cam.z.toFixed(2)})`)
          assert.ok(cam.y < SHOWA_SHELL.ceiling + 0.05, `鏡頭高度 ${cam.y.toFixed(2)}`)
          checked++
        }
      }
    }
    assert.ok(checked > 100, `${checked} 個鏡頭`)
  })

  test('介紹鏡頭與熱點鏡頭不在建築裡，看得到目標', () => {
    const placement = getShopPlacement(shop)
    const shots = [placement.camera, ...placement.hotspots.map((hotspot) => hotspot.camera)]
    for (const { position, target } of shots) {
      const inside = revival.blockers.find((b) => position.x > b.minX && position.x < b.maxX && position.y > b.minY && position.y < b.maxY && position.z > b.minZ && position.z < b.maxZ)
      assert.ok(!inside, `鏡頭 (${position.x.toFixed(2)}, ${position.z.toFixed(2)}) 在 ${JSON.stringify(inside)} 裡`)
      const dx = target.x - position.x
      const dy = target.y - position.y
      const dz = target.z - position.z
      const length = Math.hypot(dx, dy, dz)
      const others = revival.blockers.filter((box) => !building.parts.includes(box))
      assert.ok(raycastBoxes(position, { x: dx / length, y: dy / length, z: dz / length }, length, others) >= length - 1e-6, '被其他建築擋住')
    }
  })

  test('觀賞模式聚焦長立面：鏡頭在迪化街那一側、不穿牆', () => {
    const facade = facadeOf(building)
    assert.ok(facade.forward.z < -0.9, '長立面朝迪化街（北）')
    const plan = planBuildingFocus(building, revival.blockers, { yaw: 0, aspect: 16 / 9, fov: 42 })
    const direction = orbitDirection(plan.yaw, plan.pitch)
    const camera = { x: plan.target.x + direction.x * plan.distance, z: plan.target.z + direction.z * plan.distance }
    const front = (camera.x - facade.center.x) * facade.forward.x + (camera.z - facade.center.z) * facade.forward.z
    assert.ok(front > 3, `前方 ${front.toFixed(2)} m`)
    assert.ok(raycastBoxes(plan.target, direction, plan.distance, revival.blockers) >= plan.distance - 1e-6)
  })
})

describe('昭和浪漫洗濯屋：室內、器物、人物與對話', () => {
  test('室內按需產生：只產生這一棟，頂點都在地段裡；繪製批次在預算內', () => {
    const interior = buildEraInteriorSync('revival', building.id)
    const box = lotBox()
    for (const batch of [...interior.batches, ...interior.detailBatches]) {
      const attr = batch.geometry.attributes.position
      for (let i = 0; i < attr.count; i++) {
        const x = attr.getX(i)
        const z = attr.getZ(i)
        assert.ok(x > box.minX - 0.1 && x < box.maxX + 0.1 && z > box.minZ - 0.1 && z < box.maxZ + 0.1, `${batch.material} (${x.toFixed(2)}, ${z.toFixed(2)})`)
      }
    }
    assert.ok(interior.batches.length <= 10, `流暢畫質 ${interior.batches.length} 批`)
    assert.ok(interior.batches.length + interior.detailBatches.length <= 16)
    assert.ok(revival.interiors.some((zone) => zone.id === SHOP_ID && zone.building === building.id))
  })

  test('流暢畫質的街景批次數不變（外殼只用街景已有的材質）', () => {
    assert.equal(revival.batches.length, 37)
  })

  test('四件可以近看的器物：都有資料、出處與模型，位置在店門口或店裡', () => {
    const items = inspectablesOfEra('revival').filter((item) => item.shopId === SHOP_ID)
    assert.deepEqual(items.map((item) => item.objectId), ['qiaolong-sign', 'soft-serve-model', 'charcoal-iron', 'wash-tub'])
    const box = lotBox()
    for (const item of items) {
      assert.ok(getInspectObject(item.objectId), item.id)
      const [x, , z] = item.position
      assert.ok(x > box.minX - 0.5 && x < box.maxX + 0.5 && z > box.minZ - 0.5 && z < box.maxZ + 0.5, item.id)
    }
    // 情境示意的器物要標出來
    for (const id of ['charcoal-iron', 'wash-tub']) assert.equal(getInspectObject(id).reconstruction, true, id)
    assert.match(getInspectObject('qiaolong-sign').lead, /使用者現場確認/)
  })

  test('人物：外觀與姿勢都存在；店裡的在室內、店外的兩位一直都在', () => {
    const npcs = revival.npcs.filter((npc) => npc.id.startsWith('showa-'))
    assert.equal(npcs.length, SHOWA_VARIANT.npcs.length + SHOWA_OUTSIDE.npcs.length)
    for (const npc of npcs) {
      assert.ok(NPC_LOOKS[npc.look], npc.look)
      assert.ok(NPC_POSES[npc.pose], npc.pose)
    }
    for (const npc of SHOWA_VARIANT.npcs) assert.equal(npcs.find((item) => item.id === npc.id).zone, SHOP_ID)
    for (const npc of SHOWA_OUTSIDE.npcs) assert.equal(npcs.find((item) => item.id === npc.id).zone, undefined)
  })

  test('對話：三位可以交談的人，標示有效、「有出處」都附存在的出處；店員不說話', () => {
    const ids = ['showa-queue-visitor', 'showa-bench-elder', 'showa-collector']
    for (const id of ids) {
      const talk = talkForNpc('revival', id)
      assert.ok(talk, id)
      assert.ok(revival.npcs.some((npc) => npc.id === id), id)
      assert.ok(getInspectObject(talk.objectId), id)
      const lines = [...talk.lines, ...talk.followUps.flatMap((followUp) => followUp.lines)]
      const labels = new Set(lines.map((line) => line.label))
      for (const line of lines) {
        assert.ok(TALK_LABELS[line.label], `${id}：${line.label}`)
        assert.ok(line.textEn, `${id}：${line.text}`)
        if (line.label === 'sourced') for (const sourceId of line.sourceIds) assert.ok(getSource(sourceId), sourceId)
      }
      assert.ok(labels.has('fiction'), id)
    }
    assert.equal(talkForNpc('revival', 'showa-staff'), null)
    assert.equal(talkForNpc('postwar', 'showa-queue-visitor'), null)
  })
})
