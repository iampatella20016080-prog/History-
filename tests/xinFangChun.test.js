import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { XIN_FANG_CHUN_BY_ERA, XIN_FANG_CHUN_ID, xinFangChunVariantForEra } from '../src/data/xinFangChunEraConfig.js'
import { XFC_HOTSPOTS, XFC_SHELL, XFC_SITE, XFC_VARIANTS, xfcToWorld } from '../src/data/xinFangChunLayout.js'
import { getInspectObject, inspectablesOfEra } from '../src/data/inspectObjects.js'
import { hasFullLayers } from '../src/data/inspectLayers.js'
import { inspectPlaces } from '../src/data/inspectObjects.js'
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
import { XFC_FURNITURE } from '../src/game/builders/xinFangChun/xinFangChunFurniture.js'
import { xfcObstacles, xfcUpstairsObstacles } from '../src/game/builders/xinFangChun/xinFangChun.js'
import { inXinFangChunLot } from './helpers.js'

/*
 * 新芳春茶行的室內（第 11 階段）：同一個店家 ID、同一個地段，摩登到老屋新生都可以走進去，
 * 走正廳右後的木樓梯上二樓（揀茶間／辦公室／王家生活展），一樓中段是天井。設計見 docs/research/interior-xin-fang-chun.md。
 */
const ERA_IDS = ['modern', 'postwar', 'revival']
const OTHER = ERAS.map((era) => era.id).filter((id) => !ERA_IDS.includes(id))
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const variantOf = (eraId) => XFC_VARIANTS[XIN_FANG_CHUN_BY_ERA[eraId].variant]
const W = (x, z) => xfcToWorld(x, z)
const F = XFC_SHELL.floor2
const F2 = F.y

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/**
 * 沿著路線點行走（本地座標），每一步做一次和遊戲中一個影格相同的碰撞處理，並且跟 Player 一樣用 groundAt 更新樓層與高度
 * （踩上樓梯的斜面，過了一半換到二樓）。
 */
function walkRoute(world, state, points, stepSize) {
  const s = { ...state }
  for (const [lx, lz] of points) {
    const target = W(lx, lz)
    for (let i = 0; i < 600; i++) {
      const dx = target.x - s.x
      const dz = target.z - s.z
      const d = Math.hypot(dx, dz)
      if (d < stepSize * 0.6) break
      const step = Math.min(stepSize, d)
      s.x += (dx / d) * step
      s.z += (dz / d) * step
      resolvePlayerPosition(s, PLAYER.radius, world.collision, s.level)
      const g = groundAt(s, world.collision, s.level, s.y)
      s.level = g.level
      s.y = g.y
    }
  }
  return s
}

const start = () => ({ ...W(0, 1.3), level: 0, y: 0 })
/** 世界 → 本地座標（地段轉 180°） */
const local = (p) => ({ x: XFC_SITE.x - p.x, z: XFC_SITE.z - p.z })
const near = (s, lx, lz, tol = 0.45) => Math.hypot(s.x - W(lx, lz).x, s.z - W(lx, lz).z) < tol

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算；樓層 level、腳下高度 y） */
function followCamera(world, p, yaw, level = 0, y = 0) {
  const found = interiorAmount(p, world.interiors, level)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(CAMERA.pitch, CAMERA.distance, k, shot)
  const target = { x: p.x, y: y + CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas, level)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, distance: d, zone: found?.zone.id }
}

/** 一樓：從街上走過正廳、天井、穿心廊的門，到後進加工廠的走道（本地座標） */
const BACK = [[0, 1.0], [0, -0.6], [0, -5.6], [0, -7.2], [-0.25, -8.4]]
const ROUTES = { modern: BACK, postwar: BACK, revival: BACK }
/** 上二樓：從正廳走到右後的樓梯口、爬上去，到樓梯頂的平台 */
const STAIRS_UP = [[0, -0.9], [2.7, -0.9], [2.7, -1.3], [2.7, -5.0]]
const UPSTAIRS = [[1.8, -5.6], [1.8, -8.4], [1.8, -5.6], [1.6, -3.4]]
const upstairsRoute = () => UPSTAIRS

describe('新芳春茶行：酒樓繁華到老屋新生是同一個店家 ID、同一個地段（各年代的 variant）', () => {
  test('年代設定：三個年代各有版本，店家資料的建築樣式與 variant 依年代設定；其他年代沒有新芳春', () => {
    const shop = getShop(XIN_FANG_CHUN_ID)
    for (const eraId of ERA_IDS) {
      const config = xinFangChunVariantForEra(eraId)
      assert.ok(config && config.label && config.labelEn, eraId)
      const building = getShopBuilding(shop, eraId)
      assert.equal(building.archetype, 'xin-fang-chun', eraId)
      assert.equal(building.variant, config.variant, eraId)
      assert.ok(ERAS.find((era) => era.id === eraId).availableStores.includes(XIN_FANG_CHUN_ID), eraId)
    }
    assert.equal(new Set(ERA_IDS.map((eraId) => XIN_FANG_CHUN_BY_ERA[eraId].variant)).size, 3)
    for (const eraId of OTHER) assert.equal(xinFangChunVariantForEra(eraId), null, eraId)
  })

  test('地段切分不變：新芳春的地段在 x=-27、z=4.5、面寬 7.2 公尺、轉 180°（朝北），兩旁的地段相同', () => {
    const plan = getLotPlan()
    const lot = plan.lots.find((item) => item.storeId === XIN_FANG_CHUN_ID)
    assert.equal(lot.x, XFC_SITE.x)
    assert.equal(lot.z, XFC_SITE.z)
    assert.equal(lot.width, 2 * XFC_SHELL.half)
    assert.equal(lot.rotationY, Math.PI)
    const neighbours = plan.lots.filter((item) => item.z === lot.z && Math.abs(item.x - lot.x) < 7).sort((p, q) => p.x - q.x)
    assert.equal(neighbours.length, 3)
    assert.ok(neighbours[0].x + neighbours[0].width / 2 <= lot.x - lot.width / 2 + 1e-6)
    assert.ok(neighbours[2].x - neighbours[2].width / 2 >= lot.x + lot.width / 2 - 1e-6)
  })

  test('每個年代的資訊熱點：店門口一個、店內至少一個、二樓有「三樓不開放」的提醒，都對應存在的章節', () => {
    for (const eraId of ERA_IDS) {
      const shop = getShop(XIN_FANG_CHUN_ID, eraId)
      assert.ok(shop.hotspots.length >= 2, eraId)
      assert.ok(shop.hotspots.some((hotspot) => hotspot.id === 'front'), eraId)
      assert.ok(shop.hotspots.some((hotspot) => hotspot.id === 'third-floor' && hotspot.level === 1), eraId)
      for (const hotspot of shop.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${eraId}／${hotspot.id}`)
        assert.ok(hotspot.label && hotspot.labelEn && hotspot.note && hotspot.noteEn, `${eraId}／${hotspot.id}`)
      }
      for (const hotspot of XFC_HOTSPOTS[XIN_FANG_CHUN_BY_ERA[eraId].variant]) {
        const [x, z] = hotspot.point
        assert.ok(Math.abs(x) < XFC_SHELL.half && z < XFC_SHELL.walkD && z > XFC_SHELL.room.minZ, `${eraId}／${hotspot.id}`)
        // 二樓的熱點提示在二樓樓板以上
        if (hotspot.level === 1) assert.ok(hotspot.prompt[1] > F2 + 1, `${eraId}／${hotspot.id}`)
      }
    }
  })
})

describe('新芳春茶行：室內只畫這一棟、不與其他建築重疊；其他年代不受影響', () => {
  test('四個年代都有一樓與二樓兩個室內範圍（同一棟建築），港口商街沒有；範圍都在地段裡', () => {
    for (const eraId of ERA_IDS) {
      const zones = worlds[eraId].interiors.filter((item) => item.id.startsWith(XIN_FANG_CHUN_ID))
      assert.deepEqual(zones.map((zone) => zone.id).sort(), ['xin-fang-chun', 'xin-fang-chun-2f'], eraId)
      for (const zone of zones) {
        assert.equal(zone.building, 'store-xin-fang-chun', eraId)
        assert.ok(inXinFangChunLot(zone), eraId)
        for (const part of zone.parts ?? []) assert.ok(inXinFangChunLot(part), `${eraId} ${zone.id}`)
      }
      const upper = zones.find((zone) => zone.id === 'xin-fang-chun-2f')
      assert.ok(upper.parts.some((part) => part.levels?.includes(0) && part.levels?.includes(1)), `${eraId} 樓梯屬於二樓的範圍`)
      assert.ok(upper.camera.maxHeight > F2 + 1.5 && upper.camera.maxHeight < F2 + F.ceiling, eraId)
    }
    for (const eraId of OTHER) assert.ok(!worlds[eraId].interiors.some((item) => item.id.startsWith(XIN_FANG_CHUN_ID)), eraId)
  })

  test('新芳春的遮擋方塊都在地段裡；其他建築的遮擋方塊不伸進新芳春的室內', () => {
    for (const eraId of ERA_IDS) {
      const world = worlds[eraId]
      const record = world.buildings.find((item) => item.id === 'store-xin-fang-chun')
      for (const part of record.parts) assert.ok(inXinFangChunLot(part), `${eraId} ${JSON.stringify(part)}`)
      const room = world.interiors.find((item) => item.id === XIN_FANG_CHUN_ID)
      for (const other of world.buildings.filter((item) => item.id !== 'store-xin-fang-chun')) {
        const overlap = other.box.minX < room.maxX - 0.05 && other.box.maxX > room.minX + 0.05 && other.box.minZ < room.maxZ - 0.05 && other.box.maxZ > room.minZ + 0.05 && other.box.minY < 6
        assert.ok(!overlap, `${eraId}：${other.id} 伸進新芳春的室內`)
      }
    }
  })

  test('室內按需產生：只產生這一棟、沒有接地暗影；繪製批次與頂點在預算內，每個頂點都在地段裡；港口商街沒有', () => {
    for (const eraId of ERA_IDS) {
      const interior = buildEraInteriorSync(eraId, 'store-xin-fang-chun')
      assert.ok(interior.batches.length >= 8 && interior.batches.length <= 16, `${eraId} ${interior.batches.length}`)
      assert.ok(!interior.batches.some((batch) => batch.material === 'contact'), eraId)
      const vertices = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
      assert.ok(vertices < 70000, `${eraId} ${vertices}`)
      for (const batch of [...interior.batches, ...interior.detailBatches]) {
        const attr = batch.geometry.attributes.position
        for (let i = 0; i < attr.count; i++) {
          const point = { minX: attr.getX(i), maxX: attr.getX(i), minZ: attr.getZ(i), maxZ: attr.getZ(i) }
          assert.ok(inXinFangChunLot(point), `${eraId} ${batch.material} (${point.minX.toFixed(2)}, ${point.minZ.toFixed(2)})`)
          assert.ok(attr.getY(i) < F2 + F.ceiling + 0.05, `${eraId} ${batch.material} 高度 ${attr.getY(i).toFixed(2)}`)
        }
      }
    }
    assert.equal(buildEraInteriorSync('qing-port', 'store-xin-fang-chun').batches.length, 0)
  })

  test('器物清單（一樓與二樓）：每一件器物都有建模、障礙物與遮擋高度；障礙物都在店裡、同一層互不重疊', () => {
    const { room } = XFC_SHELL
    for (const eraId of ERA_IDS) {
      const variant = variantOf(eraId)
      for (const item of [...variant.items, ...variant.upstairs.items]) {
        const kind = XFC_FURNITURE[item.type]
        assert.ok(kind?.build && kind.footprint && kind.height, `${eraId} ${item.type}`)
      }
      for (const list of [xfcObstacles(variant), xfcUpstairsObstacles(variant)]) {
        for (const r of list) assert.ok(r.minX >= room.minX - 0.31 && r.maxX <= room.maxX + 0.31 && r.minZ >= room.minZ - 0.31 && r.maxZ <= room.maxZ, `${eraId} ${JSON.stringify(r)}`)
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const [a, b] = [list[i], list[j]]
            assert.ok(!(a.minX < b.maxX - 1e-9 && b.minX < a.maxX - 1e-9 && a.minZ < b.maxZ - 1e-9 && b.minZ < a.maxZ - 1e-9), `${eraId} ${i} 與 ${j} 重疊`)
          }
        }
      }
      // 二樓的障礙物都標 level 1（不擋一樓）
      assert.ok(xfcUpstairsObstacles(variant).every((r) => r.level === 1), eraId)
    }
  })

  test('匾與門聯：二樓盡頭的「新芳春茶行」匾在二樓的高度；門內的門聯「芳尋顧渚」「春採蒙山」（三個年代）', () => {
    for (const eraId of ERA_IDS) {
      const inside = worlds[eraId].signs.filter((sign) => Math.abs(sign.position[0] - XFC_SITE.x) < XFC_SHELL.half && sign.position[2] > XFC_SITE.z)
      const plaque = inside.find((sign) => sign.text === '新芳春茶行' && sign.position[1] > F2)
      assert.ok(plaque && plaque.position[1] < F2 + F.ceiling, eraId)
      assert.deepEqual(inside.filter((sign) => sign.vertical).map((sign) => sign.text).sort(), ['春採蒙山', '芳尋顧渚'].sort(), eraId)
    }
  })

  test('天井：一樓可以走（馬賽克地坪）；二樓的天井口不能站、四周有欄杆；天井上方沒有一樓天花與二樓樓板的遮擋', () => {
    const w = F.well
    const c = W((w.minX + w.maxX) / 2, (w.minZ + w.maxZ) / 2)
    for (const eraId of ERA_IDS) {
      const world = worlds[eraId]
      assert.ok(walkableAt(world, c.x, c.z, 0), `${eraId} 一樓天井`)
      assert.ok(!walkableAt(world, c.x, c.z, 1), `${eraId} 二樓天井口`)
      const over = world.blockers.filter((b) => c.x > b.minX && c.x < b.maxX && c.z > b.minZ && c.z < b.maxZ && b.minY < F2 + 2 && b.maxY > XFC_SHELL.ceiling + 0.1)
      assert.equal(over.length, 0, `${eraId} ${JSON.stringify(over[0])}`)
      // 從二樓往天井走，被欄杆擋住（還在二樓、樓板上）
      const s = walkRoute(world, { ...W(0, -3.2), level: 1, y: F2 }, [[0, -5.6]], 0.15)
      assert.ok(s.level === 1 && s.y === F2 && local(s).z > w.maxZ, `${eraId} 停在 z=${s.z.toFixed(2)}`)
    }
  })
})

describe('新芳春茶行：走進去、上樓、走出來（碰撞）', () => {
  for (const eraId of ERA_IDS) {
    const world = worlds[eraId]
    const route = ROUTES[eraId]
    const deepest = route[route.length - 1]

    test(`${eraId}：從街上走到焙籠間深處再走回街上（步長 0.05／0.15／0.4）`, () => {
      for (const stepSize of [0.05, 0.15, 0.4]) {
        const inside = walkRoute(world, start(), route, stepSize)
        assert.ok(near(inside, ...deepest), `走到 (${inside.x.toFixed(2)}, ${inside.z.toFixed(2)})（步長 ${stepSize}）`)
        assert.equal(inside.level, 0)
        const back = walkRoute(world, inside, [...route].reverse(), stepSize)
        assert.ok(local(back).z > 0.5, `走回 z=${back.z.toFixed(2)}（步長 ${stepSize}）`)
      }
    })

    test(`${eraId}：走樓梯上二樓、走到臨街的窗邊，再下樓走回街上（步長 0.05／0.15／0.4）`, () => {
      for (const stepSize of [0.05, 0.15, 0.4]) {
        let s = walkRoute(world, start(), [...route.slice(0, 2), ...STAIRS_UP], stepSize)
        assert.equal(s.level, 1, `爬上樓梯（步長 ${stepSize}）`)
        assert.ok(Math.abs(s.y - F2) < 1e-6, `二樓樓板 y=${s.y}`)
        const up = upstairsRoute(eraId)
        s = walkRoute(world, s, up, stepSize)
        assert.ok(near(s, ...up[up.length - 1]), `二樓走到 (${s.x.toFixed(2)}, ${s.z.toFixed(2)})（步長 ${stepSize}）`)
        assert.equal(s.level, 1)
        s = walkRoute(world, s, [...up].reverse(), stepSize)
        s = walkRoute(world, s, [...STAIRS_UP].reverse(), stepSize)
        assert.equal(s.level, 0, `下樓（步長 ${stepSize}）`)
        assert.equal(s.y, 0)
        s = walkRoute(world, s, [...route.slice(0, 2)].reverse(), stepSize)
        assert.ok(local(s).z > 0.5, `走回 z=${s.z.toFixed(2)}（步長 ${stepSize}）`)
      }
    })

    test(`${eraId}：連續上下樓、進出 5 次`, () => {
      let s = start()
      for (let i = 0; i < 5; i++) {
        s = walkRoute(world, s, [...route.slice(0, 2), ...STAIRS_UP, ...upstairsRoute(eraId)], 0.15)
        assert.equal(s.level, 1, `第 ${i + 1} 次上樓`)
        s = walkRoute(world, s, [...upstairsRoute(eraId)].reverse(), 0.15)
        s = walkRoute(world, s, [...STAIRS_UP].reverse(), 0.15)
        s = walkRoute(world, s, [...route.slice(0, 2)].reverse(), 0.15)
        assert.ok(s.level === 0 && local(s).z > 0.5, `第 ${i + 1} 次離開：z=${s.z.toFixed(2)}`)
      }
    })

    test(`${eraId}：樓梯只能從兩端上下（一樓從側面、樓梯底下走不上去；二樓從樓梯井走不下去）`, () => {
      const st = F.stair
      // 一樓：從樓梯開放的那一側往右牆走，被欄杆擋住，人還在一樓
      const side = walkRoute(world, { ...W(1.2, -2.0 + 0.0), level: 0, y: 0 }, [[2.9, -3.6]], 0.15)
            assert.ok(side.level === 0 && local(side).x < st.minX, `一樓側面 x=${side.x.toFixed(2)}`)
      assert.ok(!walkableAt(world, W(2.7, -5.1).x, W(2.7, -5.1).z, 0), '樓梯底下（平台下方）不能站')
      // 二樓：樓梯井的位置不能站（只有斜面）；從二樓往樓梯井走被欄杆擋住
      const rail = walkRoute(world, { ...W(1.6, -2.6), level: 1, y: F2 }, [[2.9, -2.6]], 0.15)
      assert.ok(rail.level === 1 && local(rail).x < st.minX && rail.y === F2, `二樓欄杆 x=${rail.x.toFixed(2)}`)
    })

    test(`${eraId}：門以外的立面、隔間牆、擺設與人物都不能穿越（一樓與二樓）`, () => {
      const variant = variantOf(eraId)
      const { door, partition } = variant
      const sideWalk = walkRoute(world, { ...W(door.maxX + 0.6, 1.2), level: 0, y: 0 }, [[door.maxX + 0.6, -3]], 0.15)
      assert.ok(local(sideWalk).z > -0.2, `停在 z=${sideWalk.z.toFixed(2)}`)
      assert.ok(walkableAt(world, W((partition.doorMinX + partition.doorMaxX) / 2, partition.z).x, W(0, partition.z).z))
      assert.ok(!walkableAt(world, W(partition.doorMaxX + 0.6, partition.z).x, W(0, partition.z).z))
      assert.ok(!walkableAt(world, W(XFC_SHELL.half + 0.6, -4).x, W(0, -4).z))
      for (const [items, level] of [[variant.items, 0], [variant.upstairs.items, 1]]) {
        for (const item of items) {
          if (item.block === false) continue
          const r = XFC_FURNITURE[item.type].footprint(item)
          const c = W((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
          assert.ok(!walkableAt(world, c.x, c.z, level), `${item.type} ${JSON.stringify(r)}`)
        }
      }
      for (const npc of [...variant.npcs, ...variant.upstairs.npcs]) assert.ok(!walkableAt(world, W(npc.x, npc.z).x, W(npc.x, npc.z).z, npc.level ?? 0), npc.id)
    })
  }

  test('換年代時：站在新芳春店裡（一樓、二樓、樓梯上）的人物，換到每個年代後都在可以走的地方', () => {
    const spots = [[0, -1.5, 0], [0.5, -3.5, 0], [0, -5.6, 0], [-0.3, -8.4, 0], [2.7, -2.5, 0], [1.6, -3.4, 1], [1.8, -8.0, 1]]
    for (const eraId of ERAS.map((era) => era.id)) {
      for (const [x, z, level] of spots) {
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[eraId].collision, level, { relocate: true })
        const g = groundAt(p, worlds[eraId].collision, level)
        assert.ok(walkableAt(worlds[eraId], p.x, p.z, g.level), `${eraId} (${x}, ${z}, ${level}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      }
    }
  })
})

describe('新芳春茶行：鏡頭不穿牆', () => {
  test('店裡每個可以站的位置（一樓、二樓），頭頂高度都不在任何遮擋方塊裡', () => {
    for (const eraId of ERA_IDS) {
      const world = worlds[eraId]
      let checked = 0
      for (const r of world.collision.walkable.filter((item) => item.inBuilding && !item.ramp && inXinFangChunLot(item))) {
        const level = r.level ?? 0
        const y = (level ? F2 : 0) + 1.6
        for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.2) {
          for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.2) {
            if (!walkableAt(world, x, z, level)) continue
            // 障礙物裡面的點走不到（推擠在牆裡的延伸與可行走範圍的邊上來回抵消），不算可以站的位置
            if (world.collision.obstacles.some((o) => onLevel(o, level) && x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ)) continue
            const box = world.blockers.find((b) => x > b.minX && x < b.maxX && y > b.minY && y < b.maxY && z > b.minZ && z < b.maxZ)
            assert.ok(!box, `${eraId} (${x.toFixed(2)}, ${y}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
            checked++
          }
        }
      }
      assert.ok(checked > 250, `${eraId}：${checked} 個位置`)
    }
  })

  for (const eraId of ERA_IDS) {
    test(`${eraId}：一樓、二樓與樓梯上每個位置、各個方向的跟隨鏡頭都在店裡、天花板以下`, () => {
      const world = worlds[eraId]
      const { room, ceiling } = XFC_SHELL
      const inRoom = (cam) => {
        const q = local(cam)
        return q.x > room.minX - 0.05 && q.x < room.maxX + 0.05 && q.z > room.minZ - 0.05
      }
      let checked = 0
      const check = (p, level, y, top) => {
        for (let i = 0; i < 12; i++) {
          const cam = followCamera(world, p, (i / 12) * Math.PI * 2, level, y)
          assert.ok(inRoom(cam), `${eraId} 樓層 ${level} 玩家 (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) 鏡頭 (${cam.x.toFixed(2)}, ${cam.z.toFixed(2)})`)
          assert.ok(cam.y < top + 0.05, `${eraId} 樓層 ${level} 鏡頭高度 ${cam.y.toFixed(2)}`)
          checked++
        }
      }
      for (let z = room.maxZ - 0.5; z > room.minZ + 0.4; z -= 0.6) {
        for (let x = room.minX + 0.5; x < room.maxX - 0.4; x += 0.6) {
          const p = W(x, z)
          if (walkableAt(world, p.x, p.z, 0) && groundAt(p, world.collision, 0, 0).y === 0) check(p, 0, 0, ceiling)
          if (walkableAt(world, p.x, p.z, 1) && groundAt(p, world.collision, 1, F2).y === F2) check(p, 1, F2, F2 + F.ceiling)
        }
      }
      // 樓梯上：鏡頭在樓梯井裡，不高過二樓天花
      for (let t = 0.1; t < 1; t += 0.2) {
        const lz = F.stair.bottomZ + (F.stair.topZ - F.stair.bottomZ) * t
        check(W(2.7, lz), t < 0.5 ? 0 : 1, F2 * t, F2 + F.ceiling)
      }
      assert.ok(checked > 200, `${checked}`)
    })
  }

  test('爬樓梯時鏡頭屬於二樓的範圍；一樓的範圍不含樓梯', () => {
    const world = worlds.revival
    const mid = W(2.7, (F.stair.bottomZ + F.stair.topZ) / 2)
    assert.equal(interiorAmount(mid, world.interiors, 0)?.zone.id, 'xin-fang-chun-2f')
    assert.equal(interiorAmount(mid, world.interiors, 1)?.zone.id, 'xin-fang-chun-2f')
    assert.equal(interiorAmount(W(0, -3), world.interiors, 0)?.zone.id, 'xin-fang-chun')
    assert.equal(interiorAmount(W(0, -3), world.interiors, 1)?.zone.id, 'xin-fang-chun-2f')
  })
})

describe('新芳春茶行：情境人物與可以近看的器物', () => {
  test('人物：外觀屬於這個年代、姿勢存在、幾何建得出來；一樓的人掛在一樓、二樓的人掛在二樓（level 1、站在樓板上）', () => {
    for (const eraId of ERA_IDS) {
      const variant = variantOf(eraId)
      for (const npc of [...variant.npcs, ...variant.upstairs.npcs]) {
        assert.equal(NPC_LOOKS[npc.look]?.era, eraId, npc.id)
        assert.ok(NPC_POSES[npc.pose], npc.id)
        const parts = buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY || 0.42 })
        assert.ok(parts.body.attributes.position.count > 0, npc.id)
        const placed = worlds[eraId].npcs.find((item) => item.id === npc.id)
        assert.equal(placed.zone, npc.level ? 'xin-fang-chun-2f' : 'xin-fang-chun', npc.id)
        assert.equal(placed.level ?? 0, npc.level ?? 0, npc.id)
        assert.equal(placed.position[1], npc.level ? F2 : 0, npc.id)
      }
    }
  })

  test('新器物（切茶機、優良茶獎狀、外銷鐵罐、算盤）五層資訊齊全、3D 模型建得出來，動作有對應的零件；共用器物補上新芳春的說明', () => {
    for (const id of ['tea-cutter', 'tea-award-certificate', 'export-tea-tin', 'abacus']) {
      const object = getInspectObject(id)
      assert.ok(object && object.titleEn && object.leadEn, id)
      assert.ok(hasFullLayers(object, inspectPlaces(id)), id)
      for (const layer of Object.values(object.layers)) {
        for (const note of layer) {
          assert.ok(note.text && note.textEn, `${id} ${note.text}`)
          for (const sourceId of note.sourceIds ?? []) assert.ok(getSource(sourceId), `${id} ${sourceId}`)
        }
      }
      for (const detail of [false, true]) {
        const model = buildInspectObject(id, { detail })
        assert.ok(model?.parts.length >= 1, id)
        for (const action of object.actions) assert.ok(model.parts.some((part) => part.animate?.action === action.id), `${id} ${action.id}`)
      }
    }
    // 獎狀是戰後的比賽：不放 1934 年
    assert.ok(!inspectPlaces('tea-award-certificate').some((place) => place.eraId === 'modern'))
    for (const [id, layer] of [['charcoal-pit', 'form'], ['charcoal-pit', 'making'], ['roasting-basket', 'where'], ['platform-scale', 'where']]) {
      assert.ok(getInspectObject(id).layers[layer].some((note) => /新芳春/.test(note.text)), `${id} ${layer}`)
    }
    // 風選機與有記共用：新芳春的那一件在老屋新生可以近看
    assert.ok(inspectPlaces('winnowing-machine').some((place) => place.shopId === XIN_FANG_CHUN_ID && place.eraId === 'revival'))
  })

  test('每個年代有兩件以上可以近看的器物（二樓至少一件）：有站得到的位置，而且那裡這件器物比可以交談的人與其他器物都近', () => {
    for (const eraId of ERA_IDS) {
      const world = worlds[eraId]
      const talkers = world.npcs.filter((npc) => talkForNpc(eraId, npc.id))
      const items = inspectablesOfEra(eraId).filter((item) => item.shopId === XIN_FANG_CHUN_ID)
      assert.ok(items.length >= 2, `${eraId} ${items.length}`)
      assert.ok(items.some((item) => item.level === 1), `${eraId} 二樓`)
      for (const item of items) {
        assert.ok(getInspectObject(item.objectId), item.id)
        const level = item.level ?? 0
        if (level === 1) assert.ok(item.position[1] > F2 && item.prompt[1] > F2 + 1, item.id)
        const [x, , z] = item.position
        const sameLevel = talkers.filter((npc) => (npc.level ?? 0) === level)
        // 器物之間也只提示最近的一件：站的位置這件要比同一層其他器物近 0.25 公尺以上
        const others = items.filter((other) => other.id !== item.id && (other.level ?? 0) === level)
        const wins = (sx, sz) => {
          const d = Math.hypot(sx - x, sz - z)
          const picked = pickInteraction({
            inspectable: { id: item.id, distance: d },
            talk: sameLevel.map((npc) => ({ id: npc.id, distance: Math.hypot(sx - npc.position[0], sz - npc.position[2]) })).filter((t) => t.distance < TALK_RADIUS).sort((p, q) => p.distance - q.distance)[0] ?? null,
          })
          const closest = others.every((other) => Math.hypot(sx - other.position[0], sz - other.position[2]) >= other.radius || Math.hypot(sx - other.position[0], sz - other.position[2]) - d > 0.25)
          return closest && d < item.radius - 0.3 && picked.inspectable?.id === item.id && sameLevel.every((npc) => Math.hypot(sx - npc.position[0], sz - npc.position[2]) >= TALK_RADIUS || Math.hypot(sx - npc.position[0], sz - npc.position[2]) - d > 0.25)
        }
        let found = false
        for (let gx = x - item.radius; gx <= x + item.radius && !found; gx += 0.1) {
          for (let gz = z - item.radius; gz <= z + item.radius && !found; gz += 0.1) found = walkableAt(world, gx, gz, level) && wins(gx, gz)
        }
        assert.ok(found, item.id)
      }
    }
  })

  test('店內熱點的提示和器物的近看提示不疊在一起（觸控時兩張卡片都點得到）', () => {
    for (const eraId of ERA_IDS) {
      for (const hotspot of getShop(XIN_FANG_CHUN_ID, eraId).hotspots) {
        for (const item of inspectablesOfEra(eraId)) {
          const d = Math.hypot(...hotspot.prompt.map((v, i) => v - item.prompt[i]))
          assert.ok(d > 0.9, `${eraId}：${hotspot.id} 與 ${item.id} 只差 ${d.toFixed(2)} 公尺`)
        }
      }
    }
  })

  test('每個年代至少一位人物可以交談（有站得到、而且比器物與熱點都近的位置），說完可以近看一件器物；對話每句都有標示，出處都存在', () => {
    for (const eraId of ERA_IDS) {
      const world = worlds[eraId]
      const variant = variantOf(eraId)
      const talks = [...variant.npcs, ...variant.upstairs.npcs].map((npc) => [npc, talkForNpc(eraId, npc.id)]).filter(([, talk]) => talk)
      assert.ok(talks.length >= 1, eraId)
      for (const [placedNpc, talk] of talks) {
        const level = placedNpc.level ?? 0
        const npc = world.npcs.find((item) => item.id === talk.npcId)
        const rivals = [
          ...inspectablesOfEra(eraId).filter((item) => (item.level ?? 0) === level).map((item) => [item.position[0], item.position[2], item.radius]),
          ...getShop(XIN_FANG_CHUN_ID, eraId).hotspots.filter((h) => (h.level ?? 0) === level).map((h) => [h.point.x, h.point.z, h.radius]),
        ]
        let found = false
        for (let gx = npc.position[0] - TALK_RADIUS; gx <= npc.position[0] + TALK_RADIUS && !found; gx += 0.1) {
          for (let gz = npc.position[2] - TALK_RADIUS; gz <= npc.position[2] + TALK_RADIUS && !found; gz += 0.1) {
            const d = Math.hypot(gx - npc.position[0], gz - npc.position[2])
            if (d >= TALK_RADIUS || !walkableAt(world, gx, gz, level)) continue
            found = rivals.every(([x, z, r]) => Math.hypot(gx - x, gz - z) >= r || Math.hypot(gx - x, gz - z) > d)
          }
        }
        assert.ok(found, `${eraId} ${talk.npcId}`)
        assert.ok(getInspectObject(talk.objectId), eraId)
        for (const line of [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)]) {
          assert.ok(['sourced', 'fiction'].includes(line.label) && line.textEn, `${eraId} ${line.text}`)
          if (line.label === 'sourced') for (const id of line.sourceIds) assert.ok(getSource(id), `${eraId} ${id}`)
        }
      }
    }
  })
})
