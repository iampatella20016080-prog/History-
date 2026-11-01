import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { LIN_HUA_TAI_BY_ERA, LIN_HUA_TAI_ID, linHuaTaiVariantForEra } from '../src/data/linHuaTaiEraConfig.js'
import { LHT_ERA_HOTSPOTS, LHT_ERA_SITE, LHT_SHELL, LHT_VARIANTS, lhtEraToWorld } from '../src/data/linHuaTaiLayout.js'
import { getInspectObject, inspectablesOfEra } from '../src/data/inspectObjects.js'
import { getSource } from '../src/data/sources.js'
import { TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { pickInteraction } from '../src/game/interactionPick.js'
import { NPC_LOOKS, NPC_POSES, buildNpcGeometry } from '../src/game/character/npcBuilder.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { indoorFollow, interiorAmount, followAllowed, inFollowArea, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { DRUM_SIZES, FURNITURE, drumCount } from '../src/game/builders/linHuaTai/linHuaTaiFurniture.js'
import { lhtEraObstacles } from '../src/game/builders/linHuaTai/linHuaTaiEras.js'
import { inLinHuaTaiLot } from './helpers.js'

/*
 * 林華泰茶行的室內（第 11 階段）：同一個店家 ID、同一個地段，五個年代都可以走進去；
 * 港口商街是第 10 階段（tests/teaInteriors.test.js），這裡測其他四個年代的版本。
 */
const LATER = ['banquet', 'modern', 'postwar', 'revival']
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const variantOf = (eraId) => LHT_VARIANTS[LIN_HUA_TAI_BY_ERA[eraId].variant]
const W = (x, z) => lhtEraToWorld(x, z)

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 沿著路線點行走（步長可調，每一步做一次和遊戲中一個影格相同的碰撞處理） */
function walkRoute(world, start, points, stepSize) {
  const p = { x: start.x, z: start.z }
  for (const target of points) {
    for (let i = 0; i < 400; i++) {
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

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算；做法同 tests/teaInteriors.test.js） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const found = interiorAmount(p, world.interiors)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, distance: d }
}

/** 每個年代從街上走到店後深處的路線（本地座標；繞過擺設，穿過隔間牆的門） */
const ROUTES = {
  banquet: [[0.4, 1.0], [0.4, -0.6], [0.5, -4.4], [0.1, -5.6], [0.15, -9.9]],
  modern: [[0, 1.0], [0, -0.6], [-0.2, -4.0], [0, -5.1], [-1.3, -5.1], [-1.3, -9.8], [0.5, -9.85]],
  postwar: [[0, 1.0], [0, -0.6], [-0.6, -3.0], [-0.6, -4.6], [0, -5.6], [-0.15, -8.9]],
  revival: [[0, 1.0], [0, -0.6], [-0.75, -1.2], [-0.75, -4.6], [0, -5.0], [0, -6.0], [0.05, -9.3]],
}

describe('林華泰茶行：五個年代都是同一個店家 ID、同一個地段（各年代的 variant）', () => {
  test('年代設定：五個年代各有版本，店家資料的建築樣式與 variant 依年代設定', () => {
    const shop = getShop(LIN_HUA_TAI_ID)
    for (const era of ERAS) {
      const config = linHuaTaiVariantForEra(era.id)
      assert.ok(config, era.id)
      const building = getShopBuilding(shop, era.id)
      assert.equal(building.archetype, 'lin-hua-tai', era.id)
      assert.equal(building.variant, config.variant, era.id)
      assert.ok(config.label && config.labelEn, era.id)
      assert.ok(era.availableStores.includes(LIN_HUA_TAI_ID), era.id)
    }
    assert.equal(LIN_HUA_TAI_BY_ERA['qing-port'].variant, 'qingPort')
    assert.deepEqual(new Set(LATER.map((eraId) => LIN_HUA_TAI_BY_ERA[eraId].variant)).size, 4)
  })

  test('地段切分不變：林華泰的地段在 x=-22、z=-4.5、面寬 6 公尺、不旋轉，兩旁的地段相同', () => {
    const plan = getLotPlan()
    const lot = plan.lots.find((item) => item.storeId === LIN_HUA_TAI_ID)
    assert.equal(lot.x, LHT_ERA_SITE.x)
    assert.equal(lot.z, LHT_ERA_SITE.z)
    assert.equal(lot.width, 2 * LHT_SHELL.half)
    assert.equal(lot.rotationY, 0)
    const neighbours = plan.lots.filter((item) => item.z === lot.z && Math.abs(item.x - lot.x) < 6).sort((p, q) => p.x - q.x).map((item) => [item.id, item.x, item.width])
    assert.deepEqual(neighbours, [
      ['north-1', -27.25, 4.5],
      ['store-lin-hua-tai', -22, 6],
      ['north-2', -16.7, 4.6],
    ])
  })

  test('每個年代的資訊熱點：店門口一個、店內至少一個，都對應存在的章節', () => {
    for (const eraId of LATER) {
      const shop = getShop(LIN_HUA_TAI_ID, eraId)
      assert.ok(shop.hotspots.length >= 2, eraId)
      assert.ok(shop.hotspots.some((hotspot) => hotspot.id === 'front'), eraId)
      for (const hotspot of shop.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${eraId}／${hotspot.id}`)
        assert.ok(hotspot.label && hotspot.labelEn && hotspot.note && hotspot.noteEn, `${eraId}／${hotspot.id}`)
      }
      // 熱點的位置在店裡（店門口的在簷下）
      for (const hotspot of LHT_ERA_HOTSPOTS[LIN_HUA_TAI_BY_ERA[eraId].variant]) {
        const [x, z] = hotspot.point
        assert.ok(Math.abs(x) < LHT_SHELL.half && z < LHT_SHELL.walkD && z > LHT_SHELL.room.minZ, `${eraId}／${hotspot.id}`)
      }
    }
  })
})

describe('林華泰茶行：室內只畫這一棟、不與其他建築重疊', () => {
  test('五個年代都有林華泰的室內範圍；室內、觀賞範圍與貼近範圍都在地段裡', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      const zone = world.interiors.find((item) => item.id === LIN_HUA_TAI_ID)
      assert.ok(zone, era.id)
      assert.equal(zone.building, 'store-lin-hua-tai', era.id)
      assert.ok(inLinHuaTaiLot(zone), era.id)
      assert.ok(zone.loadRadius >= 10 && zone.showRadius > zone.loadRadius, era.id)
    }
    for (const eraId of LATER) {
      const world = worlds[eraId]
      const record = world.buildings.find((item) => item.id === 'store-lin-hua-tai')
      assert.ok(record, eraId)
      // 林華泰的遮擋方塊都在地段裡；其他建築的遮擋方塊不伸進林華泰的室內
      for (const part of record.parts) assert.ok(inLinHuaTaiLot(part), `${eraId} ${JSON.stringify(part)}`)
      const room = world.interiors.find((item) => item.id === LIN_HUA_TAI_ID)
      for (const other of world.buildings.filter((item) => item.id !== 'store-lin-hua-tai' && item.storeId !== LIN_HUA_TAI_ID)) {
        const overlap = other.box.minX < room.maxX - 0.05 && other.box.maxX > room.minX + 0.05 && other.box.minZ < room.maxZ - 0.05 && other.box.maxZ > room.minZ + 0.05 && other.box.minY < 2.5
        assert.ok(!overlap, `${eraId}：${other.id} 伸進林華泰的室內`)
      }
    }
  })

  test('室內按需產生：只產生這一棟的室內、沒有接地暗影（流暢畫質）；繪製批次與頂點在預算內', () => {
    for (const era of ERAS) {
      const interior = buildEraInteriorSync(era.id, 'store-lin-hua-tai')
      assert.ok(interior.batches.length >= 8 && interior.batches.length <= 12, `${era.id} ${interior.batches.length}`)
      assert.ok(!interior.batches.some((batch) => batch.material === 'contact'), era.id)
      const vertices = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
      assert.ok(vertices < 60000, `${era.id} ${vertices}`)
      // 室內的每個頂點都在林華泰的地段裡（兩種畫質）
      for (const batch of [...interior.batches, ...interior.detailBatches]) {
        const attr = batch.geometry.attributes.position
        for (let i = 0; i < attr.count; i++) {
          const point = { minX: attr.getX(i), maxX: attr.getX(i), minZ: attr.getZ(i), maxZ: attr.getZ(i) }
          assert.ok(inLinHuaTaiLot(point), `${era.id} ${batch.material} (${point.minX.toFixed(2)}, ${point.minZ.toFixed(2)})`)
        }
      }
    }
  })

  test('流暢畫質的街景批次不變：15／20／25／27／37（外殼只用街景已有的材質）', () => {
    const expected = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) assert.equal(worlds[era.id].batches.length, expected[era.id], era.id)
  })

  test('器物清單：每一件器物都有建模、障礙物與遮擋高度；障礙物都在店裡', () => {
    const { room } = LHT_SHELL
    for (const eraId of LATER) {
      for (const item of variantOf(eraId).items) {
        const kind = FURNITURE[item.type]
        assert.ok(kind?.build && kind.footprint && kind.height, `${eraId} ${item.type}`)
      }
      for (const r of lhtEraObstacles(variantOf(eraId))) {
        assert.ok(r.minX >= room.minX - 0.31 && r.maxX <= room.maxX + 0.31 && r.minZ >= room.minZ - 0.31 && r.maxZ <= room.maxZ, `${eraId} ${JSON.stringify(r)}`)
      }
    }
    // 老屋新生的茶桶：灰綠色的大小鐵桶，畫出其中一部分（官網：近百個）
    const drums = drumCount(variantOf('revival').items)
    assert.ok(drums >= 20 && drums < 100, `${drums}`)
    assert.ok(DRUM_SIZES.large.r > DRUM_SIZES.medium.r && DRUM_SIZES.medium.r > DRUM_SIZES.small.r)
  })
})

describe('林華泰茶行：走進去、走出來（碰撞）', () => {
  for (const eraId of LATER) {
    const world = worlds[eraId]
    const route = ROUTES[eraId].map(([x, z]) => W(x, z))
    const deepest = route[route.length - 1]

    test(`${eraId}：從街上走到店後深處再走回街上（步長 0.05／0.15／0.4）`, () => {
      for (const stepSize of [0.05, 0.15, 0.4]) {
        const start = W(0, 2.2)
        const inside = walkRoute(world, start, route, stepSize)
        assert.ok(Math.hypot(inside.x - deepest.x, inside.z - deepest.z) < 0.45, `走到 (${inside.x.toFixed(2)}, ${inside.z.toFixed(2)})（步長 ${stepSize}）`)
        const back = walkRoute(world, inside, [...route].reverse(), stepSize)
        assert.ok(back.z > W(0, 0.5).z, `走回 z=${back.z.toFixed(2)}（步長 ${stepSize}）`)
      }
    })

    test(`${eraId}：連續進出 5 次`, () => {
      let p = W(0, 2.2)
      for (let i = 0; i < 5; i++) {
        p = walkRoute(world, p, route, 0.15)
        assert.ok(p.z < W(0, -7.5).z, `第 ${i + 1} 次進入：z=${p.z.toFixed(2)}`)
        p = walkRoute(world, p, [...route].reverse(), 0.15)
        assert.ok(p.z > W(0, 0.5).z, `第 ${i + 1} 次離開：z=${p.z.toFixed(2)}`)
      }
    })

    test(`${eraId}：門以外的立面、隔間牆與擺設都不能穿越`, () => {
      const { door, partition } = variantOf(eraId)
      // 門旁的立面：直直往裡走會被擋在簷下
      const side = walkRoute(world, W(door.maxX + 0.6, 1.2), [W(door.maxX + 0.6, -3)], 0.15)
      assert.ok(side.z > W(0, -0.2).z, `停在 z=${side.z.toFixed(2)}`)
      // 隔間牆：門的位置能站、牆的位置不能
      assert.ok(walkableAt(world, W((partition.doorMinX + partition.doorMaxX) / 2, partition.z).x, W(0, partition.z).z))
      assert.ok(!walkableAt(world, W(partition.doorMaxX + 0.6, partition.z).x, W(0, partition.z).z))
      // 店外的牆外與隔壁不能站
      assert.ok(!walkableAt(world, W(LHT_SHELL.half + 0.6, -4).x, W(0, -4).z))
      // 擺設與人物的中心都不能站（疊在上面的茶桶除外）
      const { items, npcs } = variantOf(eraId)
      for (const item of items) {
        const r = FURNITURE[item.type].footprint(item)
        if (!r) continue
        const c = W((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
        assert.ok(!walkableAt(world, c.x, c.z), `${item.type} ${JSON.stringify(r)}`)
      }
      for (const npc of npcs) assert.ok(!walkableAt(world, W(npc.x, npc.z).x, W(npc.x, npc.z).z), npc.id)
      // 障礙物彼此不重疊（和街景其他障礙物的寫法一致）
      const list = lhtEraObstacles(variantOf(eraId))
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [a, b] = [list[i], list[j]]
          assert.ok(!(a.minX < b.maxX - 1e-9 && b.minX < a.maxX - 1e-9 && a.minZ < b.maxZ - 1e-9 && b.minZ < a.maxZ - 1e-9), `${i} 與 ${j} 重疊`)
        }
      }
    })
  }

  test('換年代時：站在港口商街店裡的人物，換到每個年代後都在可以走的地方（不卡在擺設或牆裡）', () => {
    for (const [x, z] of [[0, -1.5], [0.6, -3.5], [0, -5.0], [-0.6, -6.6], [0.2, -7.2]]) {
      for (const eraId of LATER) {
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[eraId].collision, 0, { relocate: true })
        assert.ok(walkableAt(worlds[eraId], p.x, p.z), `${eraId} (${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      }
    }
  })
})

describe('林華泰茶行：鏡頭不穿牆', () => {
  test('店裡每個可以站的位置，頭頂高度都不在任何遮擋方塊裡（沒有卡在擺設與牆之間的死角）', () => {
    for (const eraId of LATER) {
      const world = worlds[eraId]
      let checked = 0
      for (const r of world.collision.walkable.filter((item) => item.inBuilding && inLinHuaTaiLot(item))) {
        for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.2) {
          for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.2) {
            if (!walkableAt(world, x, z)) continue
            const box = world.blockers.find((b) => x > b.minX && x < b.maxX && 1.6 > b.minY && 1.6 < b.maxY && z > b.minZ && z < b.maxZ)
            assert.ok(!box, `${eraId} (${x.toFixed(2)}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
            checked++
          }
        }
      }
      assert.ok(checked > 150, `${eraId}：${checked} 個位置`)
    }
  })

  for (const eraId of LATER) {
    test(`${eraId}：店裡每個位置、各個方向的跟隨鏡頭都在店裡、天花板以下`, () => {
      const world = worlds[eraId]
      const { room, ceiling } = LHT_SHELL
      const a = W(room.minX, room.minZ)
      const b = W(room.maxX, room.maxZ)
      let checked = 0
      for (let z = room.maxZ - 0.5; z > room.minZ + 0.4; z -= 0.6) {
        for (let x = room.minX + 0.5; x < room.maxX - 0.4; x += 0.6) {
          const p = W(x, z)
          if (!walkableAt(world, p.x, p.z)) continue
          for (let i = 0; i < 12; i++) {
            const cam = followCamera(world, p, (i / 12) * Math.PI * 2)
            assert.ok(cam.x > a.x - 0.05 && cam.x < b.x + 0.05 && cam.z > a.z - 0.05, `${eraId} 玩家 (${x.toFixed(1)}, ${z.toFixed(1)}) 鏡頭 (${cam.x.toFixed(2)}, ${cam.z.toFixed(2)})`)
            assert.ok(cam.y < ceiling + 0.05, `${eraId} 鏡頭高度 ${cam.y.toFixed(2)}`)
            checked++
          }
        }
      }
      assert.ok(checked > 100, `${checked}`)
    })
  }
})

describe('林華泰茶行：情境人物與可以近看的器物', () => {
  test('人物：外觀屬於這個年代、姿勢存在、幾何建得出來；掛在林華泰的室內', () => {
    for (const eraId of LATER) {
      const variant = variantOf(eraId)
      for (const npc of variant.npcs) {
        assert.equal(NPC_LOOKS[npc.look]?.era, eraId, npc.id)
        assert.ok(NPC_POSES[npc.pose], npc.id)
        const parts = buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY || 0.42 })
        assert.ok(parts.body.attributes.position.count > 0, npc.id)
      }
      const zoned = worlds[eraId].npcs.filter((npc) => npc.zone === LIN_HUA_TAI_ID)
      assert.equal(zoned.length, variant.npcs.length, eraId)
    }
  })

  test('每個年代的室內有兩三件可以近看的器物：有站得到的位置，而且那裡器物比可以交談的人更近（才會提示器物）', () => {
    for (const eraId of LATER) {
      const world = worlds[eraId]
      const talkers = world.npcs.filter((npc) => talkForNpc(eraId, npc.id))
      const items = inspectablesOfEra(eraId).filter((item) => item.shopId === LIN_HUA_TAI_ID)
      assert.ok(items.length >= 2 && items.length <= 3, `${eraId} ${items.length}`)
      for (const item of items) {
        assert.ok(getInspectObject(item.objectId), item.id)
        const [x, , z] = item.position
        const wins = (sx, sz) => {
          const d = Math.hypot(sx - x, sz - z)
          const picked = pickInteraction({
            inspectable: { id: item.id, distance: d },
            talk: talkers.map((npc) => ({ id: npc.id, distance: Math.hypot(sx - npc.position[0], sz - npc.position[2]) })).filter((t) => t.distance < TALK_RADIUS).sort((a, b) => a.distance - b.distance)[0] ?? null,
          })
          return d < item.radius && picked.inspectable?.id === item.id
        }
        let found = false
        for (let gx = x - item.radius; gx <= x + item.radius && !found; gx += 0.1) {
          for (let gz = z - item.radius; gz <= z + item.radius && !found; gz += 0.1) found = walkableAt(world, gx, gz) && wins(gx, gz)
        }
        assert.ok(found, item.id)
      }
    }
  })

  test('每個年代有一位店裡的人物可以交談，說完可以近看一件器物；對話的出處都存在', () => {
    for (const eraId of LATER) {
      const talks = variantOf(eraId).npcs.map((npc) => talkForNpc(eraId, npc.id)).filter(Boolean)
      assert.equal(talks.length, 1, eraId)
      const [talk] = talks
      assert.ok(getInspectObject(talk.objectId), eraId)
      for (const line of [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)]) {
        assert.ok(['sourced', 'fiction'].includes(line.label) && line.textEn, `${eraId} ${line.text}`)
        if (line.label === 'sourced') for (const id of line.sourceIds) assert.ok(getSource(id), `${eraId} ${id}`)
      }
    }
  })
})
