import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { CS_ERAS, CS_FLOOR_Y, CS_HALL, CS_INTERIOR_HOTSPOTS, CS_ITEMS, CS_NPCS, csItemsFor, csToWorld } from '../src/data/ciShengLayout.js'
import { getInspectObject, inspectablesOfEra, inspectPlaces } from '../src/data/inspectObjects.js'
import { hasFullLayers } from '../src/data/inspectLayers.js'
import { getSource } from '../src/data/sources.js'
import { TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { pickInteraction } from '../src/game/interactionPick.js'
import { NPC_LOOKS, NPC_POSES, buildNpcGeometry } from '../src/game/character/npcBuilder.js'
import { groundAt, onLevel, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { indoorFollow, interiorAmount, followAllowed, inFollowArea, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { buildInspectObject } from '../src/game/builders/inspectObjects.js'
import { CS_FURNITURE, csObstacles } from '../src/game/builders/ciShengTemple.js'

/*
 * 慈聖宮的殿內（第 11 階段，酒樓繁華到老屋新生）：從廟埕走上石階、穿過三川殿與中庭，到正殿的供桌前；
 * 神龕一帶不能進去。四個年代同一套格局、依年代增減。設計見 docs/research/interior-ci-sheng-gong.md。
 */
const ID = 'ci-sheng-gong'
const BUILDING = `store-${ID}`
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const Y = CS_FLOOR_Y
const { room } = CS_HALL
/** 殿的本地座標 → 世界座標 */
const W = (x, z) => csToWorld(x, z)
/** 世界座標 → 殿的本地座標（廟朝北：旋轉 π） */
const local = (p) => ({ x: -(p.x - 4), z: -(p.z - 4.5) + 6.2 })

/** 廟的地段（廟寬 12 m、從臨街到殿後約 15 m；廟朝北，殿在南邊） */
function inTempleLot(r) {
  return r.minX >= 4 - 6.0 - 1e-6 && r.maxX <= 4 + 6.0 + 1e-6 && r.minZ >= 4.5 - 2.6 - 1e-6 && r.maxZ <= 4.5 + 15.2 + 1e-6
}

function walkableAt(w, x, z, level = 0) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, w.collision, level)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}

/** 沿著路線點行走（殿的本地座標），每一步做一次和遊戲中一個影格相同的碰撞處理，並且用 groundAt 更新高度 */
function walkRoute(w, state, points, stepSize) {
  const s = { ...state }
  for (const [lx, lz] of points) {
    const target = W(lx, lz)
    for (let i = 0; i < 800; i++) {
      const dx = target.x - s.x
      const dz = target.z - s.z
      const d = Math.hypot(dx, dz)
      if (d < stepSize * 0.6) break
      const step = Math.min(stepSize, d)
      s.x += (dx / d) * step
      s.z += (dz / d) * step
      resolvePlayerPosition(s, PLAYER.radius, w.collision, s.level)
      const g = groundAt(s, w.collision, s.level, s.y)
      s.level = g.level
      s.y = g.y
    }
  }
  return s
}
const near = (s, lx, lz, tol = 0.45) => Math.hypot(s.x - W(lx, lz).x, s.z - W(lx, lz).z) < tol
/** 廟埕後段、天公爐的東側（殿的本地座標 (-1.2, 2.0)；天公爐在正中 z 1.15 – 2.25）出發 */
const start = () => ({ ...W(-1.2, 2.0), level: 0, y: 0 })

/** 三川殿 → 中庭 → 正殿的供桌前（和 tests/e2e/ciShengGong.e2e.mjs 相同） */
const IN = [[-0.9, 1.0], [0, 0.5], [0, -0.6], [0, -2.2], [0, -3.5], [0, -4.9]]
/** 中庭的石柱前（右廊） */
const PILLARS = [[1.6, -3.2], [2.0, -3.45]]
const OUT = [[0, -3.5], [0, -2.2], [0, -0.8], [0, 0.5], [-0.9, 1.0], [-1.2, 2.0]]

function followCamera(w, p, yaw, level = 0, y = 0) {
  const found = interiorAmount(p, w.interiors, level)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(CAMERA.pitch, CAMERA.distance, k, shot)
  const target = { x: p.x, y: y + CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, w.blockers)
  const tight = k >= 0.999 || inFollowArea(p, w.followAreas, level)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k }
}

describe('慈聖宮殿內：四個年代、地段不變、熱點', () => {
  test('酒樓繁華到老屋新生的廟都可以走進殿內（interior: cisheng，variant 是年代）；港口商街沒有慈聖宮', () => {
    const shop = getShop(ID)
    for (const eraId of CS_ERAS) {
      const building = getShopBuilding(shop, eraId)
      assert.equal(building.interior, 'cisheng', eraId)
      assert.equal(building.variant, eraId)
      assert.equal(building.archetype, 'temple')
    }
    assert.equal(getShopBuilding(shop, 'qing-port'), null)
    assert.ok(!worlds['qing-port'].interiors.some((zone) => zone.id === ID))
  })

  test('共用地段切分不變；廟埕原有的榕樹、矮牆、天公爐與戰後的攤位照舊', () => {
    const plan = getLotPlan()
    assert.ok(plan.lots.some((lot) => lot.id === `store-${ID}`))
    for (const id of ['temple-squid-stall', 'temple-mi-tai-mu-stall', 'temple-douhua-stall', 'temple-kueh-stall']) assert.ok(worlds.postwar.buildings.some((item) => item.storeId === id), id)
    // 天公爐（廟埕本地 z -4.5）仍是障礙物
    for (const eraId of CS_ERAS) {
      const burner = W(0, 6.2 - 4.5)
      assert.ok(!walkableAt(worlds[eraId], burner.x, burner.z), `${eraId} 天公爐`)
    }
  })

  test('熱點：廟埕前一個、殿內兩個（正殿、廟的來歷），都對應存在的章節；殿內的提示高度在殿內', () => {
    for (const eraId of CS_ERAS) {
      const shop = getShop(ID, eraId)
      assert.deepEqual(shop.hotspots.map((h) => h.id), ['court', 'hall', 'history'], eraId)
      for (const hotspot of shop.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${eraId} ${hotspot.id}`)
        assert.ok(hotspot.label && hotspot.labelEn && hotspot.note && hotspot.noteEn, hotspot.id)
      }
    }
    for (const hotspot of CS_INTERIOR_HOTSPOTS) assert.ok(hotspot.prompt[1] > Y + 1 && hotspot.prompt[1] < Y + 3, hotspot.id)
    // 年代錯位：1914 年才遷到日新街
    assert.match(CS_INTERIOR_HOTSPOTS.find((h) => h.id === 'history').label, /1914/)
  })

  test('古蹟身分改用文資網的官方出處（2020-12-22 公告）', () => {
    const shop = getShop(ID)
    assert.ok(getSource('nchdb-cisheng-monument'))
    assert.match(shop.yearNote, /2020/)
    assert.doesNotMatch(shop.yearNote, /古蹟身分只有維基百科/)
  })
})

describe('慈聖宮殿內：建模、預算、不與其他建築重疊', () => {
  for (const eraId of CS_ERAS) {
    const world = worlds[eraId]
    test(`${eraId}：一個室內範圍、在地段裡；地面在台基上；其他建築不伸進殿內`, () => {
      const zones = world.interiors.filter((zone) => zone.id.startsWith(ID))
      assert.deepEqual(zones.map((zone) => zone.id), [ID])
      assert.equal(zones[0].building, BUILDING)
      assert.ok(inTempleLot(zones[0]))
      assert.ok(zones[0].camera.maxHeight > Y + 2.5 && zones[0].camera.maxHeight < Y + CS_HALL.wallTop)
      const record = world.buildings.find((item) => item.id === BUILDING)
      for (const part of record.parts) assert.ok(inTempleLot(part), JSON.stringify(part))
      for (const other of world.buildings.filter((item) => item.id !== BUILDING)) {
        const overlap = other.box.minX < zones[0].maxX - 0.05 && other.box.maxX > zones[0].minX + 0.05 && other.box.minZ < zones[0].maxZ - 0.05 && other.box.maxZ > zones[0].minZ + 0.05 && other.box.minY < 6
        assert.ok(!overlap, `${other.id} 伸進殿內`)
      }
    })

    test(`${eraId}：殿內按需產生、沒有接地暗影；繪製批次與頂點在預算內，每個頂點都在地段裡、殿裡`, () => {
      const interior = buildEraInteriorSync(eraId, BUILDING)
      assert.ok(interior.batches.length >= 3 && interior.batches.length <= 12, `${interior.batches.length}`)
      assert.ok(!interior.batches.some((batch) => batch.material === 'contact'))
      const vertices = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
      assert.ok(vertices < 70000, `${vertices}`)
      for (const batch of [...interior.batches, ...interior.detailBatches]) {
        const attr = batch.geometry.attributes.position
        for (let i = 0; i < attr.count; i++) {
          const point = { minX: attr.getX(i), maxX: attr.getX(i), minZ: attr.getZ(i), maxZ: attr.getZ(i) }
          assert.ok(inTempleLot(point), `${batch.material} (${point.minX.toFixed(2)}, ${point.minZ.toFixed(2)})`)
          assert.ok(attr.getY(i) > Y - 0.02 && attr.getY(i) < Y + CS_HALL.wallTop + 0.8, `${batch.material} 高度 ${attr.getY(i).toFixed(2)}`)
        }
      }
    })
  }

  test('港口商街沒有慈聖宮的殿內', () => {
    assert.equal(buildEraInteriorSync('qing-port', BUILDING).batches.length, 0)
  })

  test('器物清單：每一件都有建模、障礙物與遮擋高度；障礙物都在殿內、互不重疊', () => {
    for (const item of CS_ITEMS) {
      const kind = CS_FURNITURE[item.type]
      assert.ok(kind?.build && kind.footprint && kind.height, item.type)
      const fp = kind.footprint(item)
      assert.ok(fp.minX >= room.minX - 0.01 && fp.maxX <= room.maxX + 0.01 && fp.minZ >= room.minZ - 0.01 && fp.maxZ <= room.maxZ + 0.01, item.type)
    }
    for (const eraId of CS_ERAS) {
      const obstacles = csObstacles(eraId)
      for (let i = 0; i < obstacles.length; i++) {
        for (let j = i + 1; j < obstacles.length; j++) {
          const a = obstacles[i]
          const b = obstacles[j]
          assert.ok(a.maxX <= b.minX + 1e-6 || b.maxX <= a.minX + 1e-6 || a.maxZ <= b.minZ + 1e-6 || b.maxZ <= a.minZ + 1e-6, `${eraId} ${i} ${j}`)
        }
      }
    }
  })

  test('依年代增減：光明燈從庶民生活起、拱門只在老屋新生；同治石柱、神龕與供桌四個年代都在', () => {
    const count = (eraId, type) => csItemsFor(eraId).filter((item) => item.type === type).length
    assert.deepEqual(CS_ERAS.map((eraId) => count(eraId, 'lightTower')), [0, 0, 4, 4])
    assert.deepEqual(CS_ERAS.map((eraId) => count(eraId, 'arch')), [0, 0, 0, 1])
    for (const eraId of CS_ERAS) {
      assert.equal(count(eraId, 'stonePillar'), 4, eraId)
      assert.equal(count(eraId, 'mazuShrine'), 1, eraId)
      assert.equal(count(eraId, 'altarLong'), 1, eraId)
    }
    // 使用者 2026-11-05：神將垂簾、哼哈二將拿掉、香爐在長案上
    assert.ok(!CS_ITEMS.some((item) => ['bigGuard', 'gateGuardian'].includes(item.type)))
    for (const eraId of CS_ERAS) {
      assert.equal(count(eraId, 'wallCurtain'), 1, eraId)
      assert.equal(count(eraId, 'sideTable'), 1, eraId)
    }
    // 招牌：匾與款識、右柱的字四個年代都有（右柱是「慈孃」不是「慈顏」）；誤讀的「海國慈□」不出現
    for (const eraId of CS_ERAS) {
      const texts = worlds[eraId].signs.map((sign) => sign.text)
      assert.ok(['惠澤覃敷', '慈孃印菩薩之心西天衣鉢', '海國陽春', '大正九年元月吉日', '稻江平樂社', '□□□仝敬獻'].every((text) => texts.includes(text)), eraId)
      assert.ok(!texts.some((text) => text.startsWith('海國慈')), eraId)
    }
  })
})

describe('慈聖宮殿內：走進去、走出來（碰撞）', () => {
  for (const eraId of CS_ERAS) {
    const world = worlds[eraId]
    for (const stepSize of [0.05, 0.15, 0.4]) {
      test(`${eraId}：從廟埕走上石階、穿過三川殿到供桌前，到中庭的石柱前，再走回廟埕（步長 ${stepSize}）`, () => {
        let s = walkRoute(world, start(), IN, stepSize)
        assert.ok(near(s, 0, -4.9), `供桌前 ${JSON.stringify(local(s))}`)
        assert.ok(Math.abs(s.y - Y) < 1e-6, `台基上 ${s.y}`)
        s = walkRoute(world, s, [[0.6, -3.9], ...PILLARS], stepSize)
        assert.ok(near(s, 2.0, -3.45), `石柱前 ${JSON.stringify(local(s))}`)
        s = walkRoute(world, s, OUT, stepSize)
        assert.ok(near(s, -1.2, 2.0), `廟埕 ${JSON.stringify(local(s))}`)
        assert.equal(s.y, 0)
      })
    }
  }

  test('連續進出 5 次（步長 0.15 與 0.3 交替；四個年代）', () => {
    for (const eraId of CS_ERAS) {
      let s = start()
      for (let i = 0; i < 5; i++) {
        const stepSize = i % 2 ? 0.3 : 0.15
        s = walkRoute(worlds[eraId], s, IN, stepSize)
        assert.ok(near(s, 0, -4.9), `${eraId} 第 ${i + 1} 次進去 ${JSON.stringify(local(s))}`)
        s = walkRoute(worlds[eraId], s, OUT, stepSize)
        assert.ok(near(s, -1.2, 2.0), `${eraId} 第 ${i + 1} 次出來 ${JSON.stringify(local(s))}`)
      }
    }
  })

  test('神龕一帶、供桌、長案、石柱與人物都不能穿越；兩側牆、後牆走不出去', () => {
    for (const eraId of CS_ERAS) {
      const world = worlds[eraId]
      for (const [x, z] of [[0, -7.3], [0, -6.4], [0, -5.4], [4.55, -4.65], [2.7, -2.95], [-2.7, -3.95], [3.5, -4.8]]) {
        const p = W(x, z)
        assert.ok(!walkableAt(world, p.x, p.z), `${eraId} (${x}, ${z})`)
      }
      for (const npc of [CS_NPCS[eraId]]) assert.ok(!walkableAt(world, W(npc.x, npc.z).x, W(npc.x, npc.z).z), npc.id)
      for (const [x, z] of [[5.4, -3.0], [-5.4, -3.0], [0, -8.1]]) assert.ok(!walkableAt(world, W(x, z).x, W(x, z).z), `${eraId} (${x}, ${z})`)
    }
  })

  test('換年代時：站在殿內、拜亭、石階上的人物，換到每個年代後都在可以走的地方（港口商街移到戶外）', () => {
    const spots = [[0, -2.4], [1.5, -3.2], [-3.5, -4.6], [0, -4.9], [0, -1.0], [0, 0.3]]
    for (const era of ERAS) {
      for (const [x, z] of spots) {
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[era.id].collision, 0, { relocate: true })
        assert.ok(walkableAt(worlds[era.id], p.x, p.z), `${era.id} (${x}, ${z})`)
      }
    }
  })
})

describe('慈聖宮殿內：鏡頭不穿牆', () => {
  for (const eraId of ['banquet', 'revival']) {
    const world = worlds[eraId]
    test(`${eraId}：殿內每個可以站的位置，頭頂高度都不在任何遮擋方塊裡`, () => {
      let checked = 0
      for (const r of world.collision.walkable.filter((item) => item.inBuilding && !item.ramp && item.floorY === Y && inTempleLot(item))) {
        const y = Y + 1.6
        for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.2) {
          for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.2) {
            if (!walkableAt(world, x, z)) continue
            if (world.collision.obstacles.some((o) => onLevel(o, 0) && x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ)) continue
            const box = world.blockers.find((b) => x > b.minX && x < b.maxX && y > b.minY && y < b.maxY && z > b.minZ && z < b.maxZ)
            assert.ok(!box, `(${x.toFixed(2)}, ${y}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
            checked++
          }
        }
      }
      assert.ok(checked > 300, `${checked} 個位置`)
    })

    test(`${eraId}：殿內每個位置、各個方向的跟隨鏡頭都在殿裡、屋頂底下`, () => {
      let checked = 0
      for (let z = room.maxZ - 0.4; z > room.minZ + 0.3; z -= 0.5) {
        for (let x = room.minX + 0.4; x < room.maxX - 0.3; x += 0.5) {
          const p = W(x, z)
          if (!walkableAt(world, p.x, p.z) || groundAt(p, world.collision, 0, Y).y !== Y) continue
          for (let i = 0; i < 12; i++) {
            const cam = followCamera(world, p, (i / 12) * Math.PI * 2, 0, Y)
            const q = local(cam)
            const inside = world.blockers.find((b) => cam.x > b.minX && cam.x < b.maxX && cam.y > b.minY && cam.y < b.maxY && cam.z > b.minZ && cam.z < b.maxZ)
            assert.ok(!inside && inTempleLot({ minX: cam.x, maxX: cam.x, minZ: cam.z, maxZ: cam.z }), `玩家 ${JSON.stringify(local(p))} 鏡頭 ${JSON.stringify(q)} ${JSON.stringify(inside)}`)
            if (q.z < room.maxZ) assert.ok(q.x > room.minX - 0.05 && q.x < room.maxX + 0.05 && q.z > room.minZ - 0.05, `玩家 ${JSON.stringify(local(p))} 鏡頭 ${JSON.stringify(q)}`)
            assert.ok(cam.y < Y + CS_HALL.wallTop + 0.05, `鏡頭高度 ${cam.y.toFixed(2)}`)
            checked++
          }
        }
      }
      assert.ok(checked > 200, `${checked}`)
    })
  }
})

describe('慈聖宮殿內：人物、器物與對話', () => {
  test('人物：每個年代一位，外觀屬於那個年代、姿勢存在、幾何建得出來；站在台基上', () => {
    for (const eraId of CS_ERAS) {
      const npc = CS_NPCS[eraId]
      assert.equal(NPC_LOOKS[npc.look]?.era, eraId, npc.id)
      assert.ok(NPC_POSES[npc.pose], npc.id)
      assert.ok(buildNpcGeometry(npc.look, npc.pose, { seatY: 0 }).body.attributes.position.count > 0, npc.id)
      const placed = worlds[eraId].npcs.find((item) => item.id === npc.id)
      assert.equal(placed.zone, ID)
      assert.equal(placed.position[1], Y)
      for (const other of CS_ERAS.filter((e) => e !== eraId)) assert.ok(!worlds[other].npcs.some((item) => item.id === npc.id), `${npc.id} ${other}`)
    }
  })

  test('四件器物（媽祖神龕、同治石柱、「惠澤覃敷」匾、共用的香爐）五層資訊齊全、出處都存在、3D 模型建得出來、動作有對應的零件', () => {
    for (const id of ['incense-burner', 'mazu-shrine', 'tongzhi-stone-pillars', 'huize-tanfu-plaque']) {
      const object = getInspectObject(id)
      assert.ok(object && object.titleEn && object.leadEn, id)
      assert.ok(hasFullLayers(object, inspectPlaces(id)), id)
      for (const note of Object.values(object.layers).flat()) {
        assert.ok(note.text && note.textEn, `${id} ${note.text}`)
        for (const sourceId of note.sourceIds ?? []) assert.ok(getSource(sourceId), `${id} ${sourceId}`)
      }
      for (const sourceId of object.sourceIds ?? []) assert.ok(getSource(sourceId), `${id} ${sourceId}`)
      for (const detail of [false, true]) {
        const model = buildInspectObject(id, { detail })
        assert.ok(model?.parts.length >= 1, id)
        for (const action of object.actions) assert.ok(model.parts.some((part) => part.animate?.action === action.id), `${id} ${action.id}`)
      }
    }
    // 「在哪家店」：香爐同時列出霞海城隍廟與慈聖宮
    const shops = new Set(inspectPlaces('incense-burner').map((place) => place.shopId))
    assert.ok(shops.has('xia-hai-cheng-huang') && shops.has(ID))
  })

  test('廟的原則：供品只在老屋新生、只寫查無；匾文是「海國陽春」、右柱是「慈孃」、香爐不寫成金色小爐；匾在酒樓繁華標 1920 年以後', () => {
    for (const id of ['mazu-shrine', 'tongzhi-stone-pillars', 'huize-tanfu-plaque']) {
      const object = getInspectObject(id)
      const text = [object.lead, ...object.paragraphs, ...Object.values(object.layers).flat().map((n) => n.text)].join('')
      assert.doesNotMatch(text, /海國慈|慈顏|金色小爐/, id)
      for (const m of text.matchAll(/供品/g)) assert.match(text.slice(Math.max(0, m.index - 20), m.index + 20), /不畫|查無|只有 2025 年的照片/, id)
    }
    const plaque = inspectablesOfEra('banquet').find((item) => item.objectId === 'huize-tanfu-plaque')
    assert.match(plaque.label, /1920/)
  })

  for (const eraId of CS_ERAS) {
    const world = worlds[eraId]
    test(`${eraId}：每件器物有站得到的位置，而且那裡這件器物比可以交談的人與其他器物都近`, () => {
      const talkers = world.npcs.filter((npc) => talkForNpc(eraId, npc.id))
      const items = inspectablesOfEra(eraId).filter((item) => item.shopId === ID)
      assert.equal(items.length, 4)
      for (const item of items) {
        const [x, , z] = item.position
        const others = items.filter((other) => other.id !== item.id)
        const wins = (sx, sz) => {
          const d = Math.hypot(sx - x, sz - z)
          const picked = pickInteraction({
            inspectable: { id: item.id, distance: d },
            talk: talkers.map((npc) => ({ id: npc.id, distance: Math.hypot(sx - npc.position[0], sz - npc.position[2]) })).filter((t) => t.distance < TALK_RADIUS).sort((p, q) => p.distance - q.distance)[0] ?? null,
          })
          const closest = others.every((other) => Math.hypot(sx - other.position[0], sz - other.position[2]) >= other.radius || Math.hypot(sx - other.position[0], sz - other.position[2]) - d > 0.25)
          return closest && d < item.radius - 0.3 && picked.inspectable?.id === item.id && talkers.every((npc) => Math.hypot(sx - npc.position[0], sz - npc.position[2]) >= TALK_RADIUS || Math.hypot(sx - npc.position[0], sz - npc.position[2]) - d > 0.25)
        }
        let found = false
        for (let gx = x - item.radius; gx <= x + item.radius && !found; gx += 0.1) {
          for (let gz = z - item.radius; gz <= z + item.radius && !found; gz += 0.1) found = walkableAt(world, gx, gz) && wins(gx, gz)
        }
        assert.ok(found, item.id)
      }
    })

    test(`${eraId}：殿內熱點的提示和器物的近看提示不疊在一起`, () => {
      for (const hotspot of getShop(ID, eraId).hotspots) {
        for (const item of inspectablesOfEra(eraId)) {
          const d = Math.hypot(...hotspot.prompt.map((v, i) => v - item.prompt[i]))
          assert.ok(d > 0.9, `${hotspot.id} 與 ${item.id} 只差 ${d.toFixed(2)} 公尺`)
        }
      }
    })

    test(`${eraId}：殿內的人物可以交談（有站得到、比器物與熱點都近的位置）；每句都有標示、出處都存在`, () => {
      const rivals = [
        ...inspectablesOfEra(eraId).map((item) => [item.position[0], item.position[2], item.radius]),
        ...getShop(ID, eraId).hotspots.map((h) => [h.point.x, h.point.z, h.radius]),
      ]
      const npc = CS_NPCS[eraId]
      const talk = talkForNpc(eraId, npc.id)
      assert.ok(talk, npc.id)
      const placed = world.npcs.find((item) => item.id === npc.id)
      let found = false
      for (let gx = placed.position[0] - TALK_RADIUS; gx <= placed.position[0] + TALK_RADIUS && !found; gx += 0.1) {
        for (let gz = placed.position[2] - TALK_RADIUS; gz <= placed.position[2] + TALK_RADIUS && !found; gz += 0.1) {
          const d = Math.hypot(gx - placed.position[0], gz - placed.position[2])
          if (d >= TALK_RADIUS || !walkableAt(world, gx, gz)) continue
          found = rivals.every(([x, z, r]) => Math.hypot(gx - x, gz - z) >= r || Math.hypot(gx - x, gz - z) > d)
        }
      }
      assert.ok(found, npc.id)
      assert.ok(getInspectObject(talk.objectId), npc.id)
      for (const line of [...talk.lines, ...(talk.followUps ?? []).flatMap((f) => f.lines)]) {
        assert.ok(['sourced', 'fiction', 'folklore'].includes(line.label) && line.textEn, line.text)
        if (line.label === 'sourced') assert.ok(line.sourceIds?.length && line.sourceIds.every((id) => getSource(id)), line.text)
      }
    })
  }

  test('酒樓繁華的廟方的人可以追問「1914 年以前這裡有廟嗎」', () => {
    const followUp = talkForNpc('banquet', 'cs-banquet-caretaker').followUps.find((f) => f.id === 'before-1914')
    assert.match(followUp.lines[0].text, /情境示意/)
  })
})
