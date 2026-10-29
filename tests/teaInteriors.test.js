import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { DODD } from '../src/data/doddLayout.js'
import { LHT, LHT_SITE } from '../src/data/linHuaTaiQingLayout.js'
import { inspectablesOfEra } from '../src/data/inspectObjects.js'
import { talkForNpc } from '../src/data/talk.js'
import { NPC_LOOKS, NPC_POSES, buildNpcGeometry } from '../src/game/character/npcBuilder.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { indoorFollow, interiorAmount, followAllowed, inFollowArea, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

const qing = buildEraWorldSync('qing-port')
const DOOR = { dodd: { x: 5.15, z: -4.5 }, lht: { x: -22, z: -4.5 } }

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 模擬行走（步長可調，和遊戲中一個影格的碰撞處理相同） */
function walk(world, from, direction, steps, stepSize = 0.15) {
  const p = { x: from.x, z: from.z }
  const length = Math.hypot(direction.x, direction.z)
  for (let i = 0; i < steps; i++) {
    p.x += (direction.x / length) * stepSize
    p.z += (direction.z / length) * stepSize
    resolvePlayerPosition(p, PLAYER.radius, world.collision)
  }
  return p
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算；做法同 tests/yongle.test.js） */
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

describe('寶順洋行與林華泰（港口商街）：室內只在這個年代', () => {
  test('兩個室內範圍都在、其他年代沒有（室內 id、入口與鏡頭設定齊全）', () => {
    const ids = qing.interiors.map((zone) => zone.id).sort()
    assert.deepEqual(ids, ['dodd-tea-house', 'lin-hua-tai'])
    for (const zone of qing.interiors) {
      assert.ok(zone.entry && zone.door && zone.camera && zone.ceiling > 2.5, zone.id)
      assert.ok(zone.loadRadius >= 10 && zone.showRadius > zone.loadRadius, zone.id)
    }
    for (const era of ERAS.filter((item) => item.id !== 'qing-port')) {
      const world = buildEraWorldSync(era.id)
      assert.ok(!world.interiors.some((zone) => zone.id === 'dodd-tea-house' || zone.id === 'lin-hua-tai'), era.id)
    }
  })

  test('林華泰的地段不旋轉（配置資料的世界座標換算依此假設）、其他年代仍是一般街屋', () => {
    const lot = getLotPlan().lots.find((item) => item.storeId === 'lin-hua-tai')
    assert.ok(lot)
    assert.equal(lot.rotationY, 0)
    assert.equal(lot.x, LHT_SITE.x)
    assert.equal(lot.z, LHT_SITE.z)
    const shop = getShop('lin-hua-tai')
    assert.equal(shop.buildingByEra['qing-port'].archetype, 'lin-hua-tai-qing')
    for (const eraId of ['banquet', 'modern', 'postwar', 'revival']) {
      assert.ok(!shop.buildingByEra[eraId].archetype, eraId)
      assert.ok(!getShop('lin-hua-tai', eraId).hotspots, `${eraId} 沒有室內熱點`)
    }
    assert.ok(getShop('lin-hua-tai', 'qing-port').hotspots.length >= 3)
  })

  test('資訊熱點都對應存在的章節；店門口也有熱點（在店外就能開啟介紹）', () => {
    for (const [id, eraId] of [
      ['dodd-tea-house', 'qing-port'],
      ['lin-hua-tai', 'qing-port'],
    ]) {
      const shop = getShop(id, eraId)
      assert.ok(shop.hotspots.some((hotspot) => hotspot.id === 'front'), id)
      for (const hotspot of shop.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${id}／${hotspot.id} 的章節 ${hotspot.chapter}`)
        assert.ok(hotspot.label && hotspot.note && hotspot.prompt && hotspot.camera, `${id}／${hotspot.id}`)
      }
    }
  })

  test('室內的人物：外觀與姿勢存在、屬於港口商街、幾何建得出來；坐著揀茶的 sort 姿勢有動作', () => {
    for (const npc of [...DODD.npcs, ...LHT.npcs]) {
      const look = NPC_LOOKS[npc.look]
      assert.ok(look, npc.id)
      assert.equal(look.era, 'qing-port', npc.id)
      assert.ok(NPC_POSES[npc.pose], npc.id)
      const parts = buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY || 0.46 })
      assert.ok(parts.body.attributes.position.count > 0, npc.id)
    }
    assert.ok(NPC_POSES.sort.seated)
    assert.ok(NPC_POSES.sort.anim.elbow[1] > NPC_POSES.sort.anim.elbow[0])
    // 街景資料裡的室內人物掛在對的 zone，而且都有對話或擺設的角色
    const zoned = (qing.npcs ?? []).filter((npc) => npc.zone)
    assert.equal(zoned.filter((npc) => npc.zone === 'dodd-tea-house').length, DODD.npcs.length)
    assert.equal(zoned.filter((npc) => npc.zone === 'lin-hua-tai').length, LHT.npcs.length)
    // 室內有對話的人物（揀茶女、焙茶工、學徒）
    for (const id of ['dodd-picker-a', 'dodd-roaster', 'lht-apprentice']) assert.ok(talkForNpc('qing-port', id), id)
  })

  test('室內可以近看的器物都在室內的可行走範圍附近（走得到提示半徑內）', () => {
    for (const item of inspectablesOfEra('qing-port').filter((entry) => entry.id !== 'wharf-tea-chest')) {
      const [x, , z] = item.position
      // 器物本身是障礙物（桌上、地上），檢查提示半徑內有可以站的位置
      const ring = item.radius - 0.35
      const spots = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return [x + Math.cos(a) * ring, z + Math.sin(a) * ring]
      })
      assert.ok(
        spots.some(([sx, sz]) => walkableAt(qing, sx, sz)),
        item.id,
      )
    }
  })
})

describe('寶順洋行與林華泰：走進去、走出來（碰撞）', () => {
  for (const [name, door, lane] of [
    ['寶順洋行', DOOR.dodd, 0],
    ['林華泰', DOOR.lht, 0.7],
  ]) {
    test(`${name}：從街上走進店內深處再走回街上（步長 0.05／0.15／0.4）`, () => {
      for (const stepSize of [0.05, 0.15, 0.4]) {
        const start = { x: door.x + lane, z: -1.5 }
        const inside = walk(qing, start, { x: 0, z: -1 }, Math.ceil(10 / stepSize), stepSize)
        assert.ok(inside.z < -10.2, `${name} 走到 z=${inside.z.toFixed(2)}（步長 ${stepSize}）`)
        const back = walk(qing, inside, { x: 0, z: 1 }, Math.ceil(10 / stepSize), stepSize)
        assert.ok(back.z > -2.6, `${name} 走回 z=${back.z.toFixed(2)}（步長 ${stepSize}）`)
      }
    })

    test(`${name}：連續進出 5 次`, () => {
      let p = { x: door.x, z: -1.2 }
      for (let i = 0; i < 5; i++) {
        p = walk(qing, p, { x: 0, z: -1 }, 40)
        assert.ok(p.z < door.z - 1.0, `第 ${i + 1} 次進入：z=${p.z.toFixed(2)}`)
        p = walk(qing, p, { x: 0, z: 1 }, 40)
        assert.ok(p.z > -2.6, `第 ${i + 1} 次離開：z=${p.z.toFixed(2)}`)
      }
    })

    test(`${name}：大門以外的立面走不進去`, () => {
      // 從門旁的牆走：被牆擋住（還在步道上）
      const side = walk(qing, { x: door.x + 2.2, z: -2.0 }, { x: 0, z: -1 }, 30)
      assert.ok(side.z > door.z - 0.5, `${name} 停在 z=${side.z.toFixed(2)}`)
      // 店內的牆外與隔壁不能站
      assert.ok(!walkableAt(qing, door.x + 4.2, door.z - 4))
    })
  }

  test('寶順洋行：揀茶桌、焙茶磚臺、裝箱檯與茶箱不能穿越', () => {
    const { x: ox, z: oz } = DOOR.dodd
    for (const [lx, lz] of [
      [DODD.picking.tables[0].x, DODD.picking.tables[0].z],
      [(DODD.roasting.platform.minX + DODD.roasting.platform.maxX) / 2, (DODD.roasting.platform.minZ + DODD.roasting.platform.maxZ) / 2],
      [DODD.packing.bench.x, DODD.packing.bench.z],
      [DODD.packing.chests[0].x, DODD.packing.chests[0].z],
    ]) {
      assert.ok(!walkableAt(qing, ox + lx, oz + lz), `(${lx}, ${lz})`)
    }
  })

  test('林華泰：櫃台、秤茶桌、焙茶磚臺與層架不能穿越；隔間牆只有中央的門能過', () => {
    const { x: ox, z: oz } = DOOR.lht
    for (const [lx, lz] of [
      [LHT.counter.x, LHT.counter.z],
      [LHT.scaleTable.x, LHT.scaleTable.z],
      [(LHT.roasting.platform.minX + LHT.roasting.platform.maxX) / 2, (LHT.roasting.platform.minZ + LHT.roasting.platform.maxZ) / 2],
      [LHT.shelf.x, (LHT.shelf.z0 + LHT.shelf.z1) / 2],
    ]) {
      assert.ok(!walkableAt(qing, ox + lx, oz + lz), `(${lx}, ${lz})`)
    }
    // 隔間牆：門的位置能走、牆的位置不能
    assert.ok(walkableAt(qing, ox, oz + LHT.partition.z))
    assert.ok(!walkableAt(qing, ox + 1.8, oz + LHT.partition.z))
  })

  test('換到其他年代時，站在店裡的人物會被移回戶外', () => {
    for (const door of [DOOR.dodd, DOOR.lht]) {
      const banquet = buildEraWorldSync('banquet')
      const p = { x: door.x, z: door.z - 4 }
      resolvePlayerPosition(p, PLAYER.radius, banquet.collision, 0, { relocate: true })
      assert.ok(p.z > -4.5, `移到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    }
  })
})

describe('寶順洋行與林華泰：鏡頭', () => {
  test('店內各處的跟隨鏡頭不在遮擋方塊裡、不穿出屋頂', () => {
    const spots = [
      [DOOR.dodd.x, DOOR.dodd.z - 1.2],
      [DOOR.dodd.x - 0.2, DOOR.dodd.z - 4.6],
      [DOOR.dodd.x + 0.4, DOOR.dodd.z - 7.8],
      [DOOR.lht.x, DOOR.lht.z - 1.4],
      [DOOR.lht.x - 0.2, DOOR.lht.z - 4.4],
      [DOOR.lht.x + 0.4, DOOR.lht.z - 6.9],
    ]
    for (const [x, z] of spots) {
      if (!walkableAt(qing, x, z)) continue
      for (let i = 0; i < 8; i++) {
        const yaw = (i / 8) * Math.PI * 2
        const cam = followCamera(qing, { x, z }, yaw)
        for (const box of qing.blockers) {
          const inside =
            cam.x > box.minX + 0.03 && cam.x < box.maxX - 0.03 && cam.y > box.minY + 0.03 && cam.y < box.maxY - 0.03 && cam.z > box.minZ + 0.03 && cam.z < box.maxZ - 0.03
          assert.ok(!inside, `鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)}) 在方塊裡（站在 ${x}, ${z}）`)
        }
        const zone = qing.interiors.find((item) => x > item.minX && x < item.maxX && z > item.minZ && z < item.maxZ)
        if (zone) assert.ok(cam.y < zone.ceiling + 0.6, `鏡頭高 ${cam.y.toFixed(2)}（站在 ${x}, ${z}）`)
      }
    }
  })

  test('室內細部建得出來，而且頂點都在兩家店的地段裡', () => {
    for (const zone of qing.interiors) {
      const interior = buildEraInteriorSync('qing-port', zone.building)
      assert.ok(interior.batches.length > 0, zone.id)
    }
  })
})
