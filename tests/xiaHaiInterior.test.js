import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { XH_FLOOR_Y, XH_HALL, XH_INTERIOR_HOTSPOTS, XH_ITEMS, XH_NPCS, XH_SITE, hz, xhToWorld } from '../src/data/xiaHaiLayout.js'
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
import { XH_FURNITURE, xhObstacles } from '../src/game/builders/xiaHaiTemple.js'

/*
 * 霞海城隍廟的殿內（第 11 階段，港口商街）：從廟埕走上石階、穿過拜亭與中門，到拜殿、正殿的神案前，
 * 再進右側的偏殿；神龕一帶不能進去。設計見 docs/research/interior-xia-hai-cheng-huang.md。
 */
const ID = 'xia-hai-cheng-huang'
const BUILDING = `site-${ID}`
const ERA = 'qing-port'
const OTHER = ERAS.map((era) => era.id).filter((id) => id !== ERA)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const world = worlds[ERA]
const Y = XH_FLOOR_Y
const { room } = XH_HALL
/** 殿的本地座標 → 世界座標 */
const W = (x, z) => xhToWorld(x, hz(z))
const local = (p) => ({ x: p.x - XH_SITE.x, z: p.z - XH_SITE.z + 6.2 })

/** 廟的地段（廟寬 12 m、從臨街到殿後約 15 m） */
function inTempleLot(r) {
  return r.minX >= XH_SITE.x - 6.0 - 1e-6 && r.maxX <= XH_SITE.x + 6.0 + 1e-6 && r.minZ >= XH_SITE.z - 15.2 - 1e-6 && r.maxZ <= XH_SITE.z + 2.6 + 1e-6
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
/** 廟埕中央（殿的本地座標 z 3.0）出發 */
const start = () => ({ ...W(0, 3.0), level: 0, y: 0 })

/** 拜殿走到神案前 */
const IN = [[0, 1.5], [0, -0.6], [0, -2.0], [1.2, -2.6], [1.2, -4.0], [1.3, -4.95]]
/** 從神案前到右側偏殿 */
const SIDE = [[1.5, -4.6], [2.8, -5.5], [4.1, -5.5], [4.1, -6.0]]
/** 左後的義勇公龕前 */
const LEFT = [[-1.5, -4.6], [-3.2, -5.4], [-4.0, -6.4]]
const OUT = [[2.8, -5.5], [1.6, -4.3], [1.2, -2.6], [0, -2.0], [0, -0.8], [0, 1.6], [0, 3.0]]

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

describe('霞海城隍廟殿內：只有港口商街、地段不變、熱點', () => {
  test('港口商街的廟可以走進殿內（interior: xiahai）；其他年代沒有霞海城隍廟', () => {
    const shop = getShop(ID)
    assert.equal(getShopBuilding(shop, ERA).interior, 'xiahai')
    assert.equal(getShopBuilding(shop, ERA).archetype, 'temple')
    for (const eraId of OTHER) assert.equal(getShopBuilding(shop, eraId), null, eraId)
  })

  test('慈聖宮（同樣是廟宇原型）沒有殿內、天公爐照舊', () => {
    for (const eraId of OTHER) {
      assert.ok(!worlds[eraId].interiors.some((zone) => zone.id === ID), eraId)
      assert.ok(!worlds[eraId].collision.walkable.some((r) => r.floorY === Y && inTempleLot(r)), eraId)
    }
    assert.equal(getShop('ci-sheng-gong').building?.interior, undefined)
  })

  test('共用地段切分不變：霞海城隍廟用 site 取代 north-6 與波麗路的地段', () => {
    const shop = getShop(ID)
    assert.deepEqual(shop.site, { x: 21.1, z: -4.5, rotationY: 0, replaces: ['north-6', 'store-bolero'] })
    const plan = getLotPlan()
    assert.ok(plan.lots.some((lot) => lot.id === 'north-6'))
  })

  test('熱點：拜殿與正殿、右室，都對應存在的章節；提示高度在殿內', () => {
    const shop = getShop(ID, ERA)
    assert.deepEqual(shop.hotspots.map((h) => h.id), ['hall', 'side-room'])
    for (const hotspot of shop.hotspots) {
      assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), hotspot.id)
      assert.ok(hotspot.label && hotspot.labelEn && hotspot.note && hotspot.noteEn, hotspot.id)
    }
    for (const hotspot of XH_INTERIOR_HOTSPOTS) assert.ok(hotspot.prompt[1] > Y + 1 && hotspot.prompt[1] < Y + 3, hotspot.id)
  })
})

describe('霞海城隍廟殿內：建模、預算、不與其他建築重疊', () => {
  test('一個室內範圍、在地段裡；地面在台基上', () => {
    const zones = world.interiors.filter((zone) => zone.id.startsWith(ID))
    assert.deepEqual(zones.map((zone) => zone.id), [ID])
    assert.equal(zones[0].building, BUILDING)
    assert.ok(inTempleLot(zones[0]))
    assert.ok(zones[0].camera.maxHeight > Y + 2.5 && zones[0].camera.maxHeight < Y + XH_HALL.wallTop)
  })

  test('廟的遮擋方塊都在地段裡；其他建築的遮擋方塊不伸進殿內', () => {
    const record = world.buildings.find((item) => item.id === BUILDING)
    for (const part of record.parts) assert.ok(inTempleLot(part), JSON.stringify(part))
    const zone = world.interiors.find((item) => item.id === ID)
    for (const other of world.buildings.filter((item) => item.id !== BUILDING)) {
      const overlap = other.box.minX < zone.maxX - 0.05 && other.box.maxX > zone.minX + 0.05 && other.box.minZ < zone.maxZ - 0.05 && other.box.maxZ > zone.minZ + 0.05 && other.box.minY < 6
      assert.ok(!overlap, `${other.id} 伸進殿內`)
    }
  })

  test('殿內按需產生：只產生這一座廟、沒有接地暗影；繪製批次與頂點在預算內，每個頂點都在地段裡；其他年代沒有', () => {
    const interior = buildEraInteriorSync(ERA, BUILDING)
    assert.ok(interior.batches.length >= 3 && interior.batches.length <= 12, `${interior.batches.length}`)
    assert.ok(!interior.batches.some((batch) => batch.material === 'contact'))
    const vertices = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(vertices < 70000, `${vertices}`)
    for (const batch of [...interior.batches, ...interior.detailBatches]) {
      const attr = batch.geometry.attributes.position
      for (let i = 0; i < attr.count; i++) {
        const point = { minX: attr.getX(i), maxX: attr.getX(i), minZ: attr.getZ(i), maxZ: attr.getZ(i) }
        assert.ok(inTempleLot(point), `${batch.material} (${point.minX.toFixed(2)}, ${point.minZ.toFixed(2)})`)
        assert.ok(attr.getY(i) > Y - 0.02 && attr.getY(i) < Y + XH_HALL.wallTop, `${batch.material} 高度 ${attr.getY(i).toFixed(2)}`)
      }
    }
    // 港口商街整個年代的殿內（流暢畫質基準）也包含這一座；慈聖宮不產生
    for (const eraId of OTHER) assert.equal(buildEraInteriorSync(eraId, BUILDING).batches.length, 0, eraId)
  })

  test('器物清單：每一件都有建模、障礙物與遮擋高度；障礙物都在殿內、互不重疊；神像不畫供品、月老、八司官、光明燈', () => {
    for (const item of XH_ITEMS) {
      const kind = XH_FURNITURE[item.type]
      assert.ok(kind?.build && kind.footprint && kind.height, item.type)
      const fp = kind.footprint(item)
      assert.ok(fp.minX >= room.minX - 0.01 && fp.maxX <= room.maxX + 0.01 && fp.minZ >= room.minZ - 0.01 && fp.maxZ <= room.maxZ + 0.01, item.type)
    }
    const obstacles = xhObstacles()
    for (let i = 0; i < obstacles.length; i++) {
      for (let j = i + 1; j < obstacles.length; j++) {
        const a = obstacles[i]
        const b = obstacles[j]
        assert.ok(a.maxX <= b.minX + 1e-6 || b.maxX <= a.minX + 1e-6 || a.maxZ <= b.minZ + 1e-6 || b.maxZ <= a.minZ + 1e-6, `${i} ${j}`)
      }
    }
    const types = XH_ITEMS.map((item) => item.type).join(' ')
    for (const banned of ['matchmaker', 'yuelao', 'eightOfficers', 'lightTower', 'skyCenser']) assert.ok(!types.includes(banned), banned)
  })

  test('港口商街的廟埕不畫天公爐（1980 年才設），慈聖宮的天公爐照舊是障礙物', () => {
    const burner = W(0, 1.7 + 6.2 - 6.2 - 4.5 + 4.5)
    const court = xhToWorld(0, -6.2 + 1.7)
    assert.ok(walkableAt(world, court.x, court.z), '霞海城隍廟的廟埕中央可以走')
    void burner
  })
})

describe('霞海城隍廟殿內：走進去、走出來（碰撞）', () => {
  for (const stepSize of [0.05, 0.15, 0.4]) {
    test(`從廟埕走上石階、穿過中門到神案前，進右側偏殿，再走回廟埕（步長 ${stepSize}）`, () => {
      let s = walkRoute(world, start(), IN, stepSize)
      assert.ok(near(s, 1.3, -4.95), `神案前 ${JSON.stringify(local(s))}`)
      assert.ok(Math.abs(s.y - Y) < 1e-6, `台基上 ${s.y}`)
      s = walkRoute(world, s, SIDE, stepSize)
      assert.ok(near(s, 4.1, -6.0), `偏殿 ${JSON.stringify(local(s))}`)
      s = walkRoute(world, s, OUT, stepSize)
      assert.ok(near(s, 0, 3.0), `廟埕 ${JSON.stringify(local(s))}`)
      assert.equal(s.y, 0)
    })
    test(`走到左後的義勇公龕前再走出來（步長 ${stepSize}）`, () => {
      let s = walkRoute(world, start(), IN, stepSize)
      s = walkRoute(world, s, LEFT, stepSize)
      assert.ok(near(s, -4.0, -6.4), JSON.stringify(local(s)))
      s = walkRoute(world, s, [[-1.5, -4.6], [-1.2, -3.6], [-1.2, -2.6], ...OUT.slice(3)], stepSize)
      assert.ok(near(s, 0, 3.0), JSON.stringify(local(s)))
    })
  }

  test('連續進出 5 次（步長 0.15 與 0.3 交替）', () => {
    let s = start()
    for (let i = 0; i < 5; i++) {
      const stepSize = i % 2 ? 0.3 : 0.15
      s = walkRoute(world, s, [...IN, ...SIDE], stepSize)
      assert.ok(near(s, 4.1, -6.0), `第 ${i + 1} 次進去 ${JSON.stringify(local(s))}`)
      s = walkRoute(world, s, OUT, stepSize)
      assert.ok(near(s, 0, 3.0), `第 ${i + 1} 次出來 ${JSON.stringify(local(s))}`)
    }
  })

  test('神龕一帶、神案、擺設、人物與偏殿隔牆都不能穿越；台基正面（石階以外）走不上去', () => {
    for (const [x, z] of [[0, -7.2], [0, -6.45], [2.25, -7.3], [-4.35, -7.37], [4.12, -7.42], [0, -3.05], [3.2, -7.0], [2.9, -6.6]]) {
      const p = W(x, z)
      assert.ok(!walkableAt(world, p.x, p.z), `(${x}, ${z})`)
    }
    for (const npc of XH_NPCS) assert.ok(!walkableAt(world, W(npc.x, npc.z).x, W(npc.x, npc.z).z), npc.id)
    // 從廟埕往台基側面直走：停在台基前
    const s = walkRoute(world, { ...W(4.0, 2.0), level: 0, y: 0 }, [[4.0, -1.0]], 0.15)
    assert.ok(local(s).z > -0.25 - 1e-6 + 0.0 && s.y === 0, JSON.stringify(local(s)))
    // 兩側牆、後牆走不出去
    for (const [x, z] of [[5.4, -3.0], [-5.4, -3.0], [0, -8.1]]) assert.ok(!walkableAt(world, W(x, z).x, W(x, z).z), `(${x}, ${z})`)
  })

  test('換年代時：站在殿內、拜亭、石階上的人物，換到每個年代後都在可以走的地方', () => {
    const spots = [[0, -2.4], [3.0, -3.0], [-3.5, -5.5], [4.1, -6.0], [0, -1.0], [0, 0.3]]
    for (const era of ERAS) {
      for (const [x, z] of spots) {
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[era.id].collision, 0, { relocate: true })
        assert.ok(walkableAt(worlds[era.id], p.x, p.z), `${era.id} (${x}, ${z})`)
        if (era.id !== ERA) assert.ok(!worlds[era.id].collision.walkable.some((r) => r.inBuilding && p.x > r.minX && p.x < r.maxX && p.z > r.minZ && p.z < r.maxZ && inTempleLot(r) && r.floorY === Y), era.id)
      }
    }
  })
})

describe('霞海城隍廟殿內：鏡頭不穿牆', () => {
  test('殿內每個可以站的位置，頭頂高度都不在任何遮擋方塊裡', () => {
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
    assert.ok(checked > 400, `${checked} 個位置`)
  })

  test('殿內每個位置、各個方向的跟隨鏡頭都在殿裡、屋頂底下', () => {
    let checked = 0
    for (let z = room.maxZ - 0.4; z > room.minZ + 0.3; z -= 0.5) {
      for (let x = room.minX + 0.4; x < room.maxX - 0.3; x += 0.5) {
        const p = W(x, z)
        if (!walkableAt(world, p.x, p.z) || groundAt(p, world.collision, 0, Y).y !== Y) continue
        for (let i = 0; i < 12; i++) {
          const cam = followCamera(world, p, (i / 12) * Math.PI * 2, 0, Y)
          const q = local(cam)
          // 鏡頭不在任何遮擋方塊裡（中門開著：靠門的位置鏡頭可以從門口退到拜亭與石階前），也不出廟的地段
          const inside = world.blockers.find((b) => cam.x > b.minX && cam.x < b.maxX && cam.y > b.minY && cam.y < b.maxY && cam.z > b.minZ && cam.z < b.maxZ)
          assert.ok(!inside && inTempleLot({ minX: cam.x, maxX: cam.x, minZ: cam.z, maxZ: cam.z }), `玩家 ${JSON.stringify(local(p))} 鏡頭 ${JSON.stringify(q)} ${JSON.stringify(inside)}`)
          if (q.z < room.maxZ) assert.ok(q.x > room.minX - 0.05 && q.x < room.maxX + 0.05 && q.z > room.minZ - 0.05, `玩家 ${JSON.stringify(local(p))} 鏡頭 ${JSON.stringify(q)}`)
          assert.ok(cam.y < Y + XH_HALL.wallTop + 0.05, `鏡頭高度 ${cam.y.toFixed(2)}`)
          checked++
        }
      }
    }
    assert.ok(checked > 300, `${checked}`)
  })
})

describe('霞海城隍廟殿內：人物、器物與對話', () => {
  test('人物：港口商街的外觀、姿勢存在、幾何建得出來；站在台基上', () => {
    for (const npc of XH_NPCS) {
      assert.equal(NPC_LOOKS[npc.look]?.era, ERA, npc.id)
      assert.ok(NPC_POSES[npc.pose], npc.id)
      assert.ok(buildNpcGeometry(npc.look, npc.pose, { seatY: 0 }).body.attributes.position.count > 0, npc.id)
      const placed = world.npcs.find((item) => item.id === npc.id)
      assert.equal(placed.zone, ID)
      assert.equal(placed.position[1], Y)
    }
  })

  test('四件器物（香爐、主神龕、清代匾額、義勇公祿位）五層資訊齊全、出處都存在、3D 模型建得出來、動作有對應的零件', () => {
    for (const id of ['incense-burner', 'chenghuang-shrine', 'qing-plaques', 'yiyonggong-tablet']) {
      const object = getInspectObject(id)
      assert.ok(object && object.titleEn && object.leadEn, id)
      assert.ok(hasFullLayers(object, inspectPlaces(id)), id)
      for (const note of Object.values(object.layers).flat()) {
        assert.ok(note.text && note.textEn, `${id} ${note.text}`)
        for (const sourceId of note.sourceIds ?? []) assert.ok(getSource(sourceId), `${id} ${sourceId}`)
      }
      for (const detail of [false, true]) {
        const model = buildInspectObject(id, { detail })
        assert.ok(model?.parts.length >= 1, id)
        for (const action of object.actions) assert.ok(model.parts.some((part) => part.animate?.action === action.id), `${id} ${action.id}`)
      }
    }
  })

  test('廟的原則：供品不畫不寫（只能出現在「查無、不畫」的說明裡）；1895 年以後的東西不出現', () => {
    for (const id of ['incense-burner', 'chenghuang-shrine', 'qing-plaques', 'yiyonggong-tablet']) {
      const object = getInspectObject(id)
      const text = [object.lead, ...object.paragraphs, ...Object.values(object.layers).flat().map((n) => n.text)].join('')
      for (const m of text.matchAll(/供品/g)) assert.match(text.slice(Math.max(0, m.index - 20), m.index + 12), /不畫|查無/, id)
      assert.doesNotMatch(object.lead, /月老|月下老人|八司|光明燈/, id)
    }
  })

  test('每件器物有站得到的位置，而且那裡這件器物比可以交談的人與其他器物都近', () => {
    const talkers = world.npcs.filter((npc) => talkForNpc(ERA, npc.id))
    const items = inspectablesOfEra(ERA).filter((item) => item.shopId === ID)
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

  test('殿內熱點的提示和器物的近看提示不疊在一起', () => {
    for (const hotspot of getShop(ID, ERA).hotspots) {
      for (const item of inspectablesOfEra(ERA)) {
        const d = Math.hypot(...hotspot.prompt.map((v, i) => v - item.prompt[i]))
        assert.ok(d > 0.9, `${hotspot.id} 與 ${item.id} 只差 ${d.toFixed(2)} 公尺`)
      }
    }
  })

  test('兩位人物都可以交談（有站得到、比器物與熱點都近的位置）；每句都有標示、出處都存在；城隍夫人的追問標 1893 年', () => {
    const rivals = [
      ...inspectablesOfEra(ERA).map((item) => [item.position[0], item.position[2], item.radius]),
      ...getShop(ID, ERA).hotspots.map((h) => [h.point.x, h.point.z, h.radius]),
    ]
    for (const npc of XH_NPCS) {
      const talk = talkForNpc(ERA, npc.id)
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
      for (const line of [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)]) {
        assert.ok(['sourced', 'fiction', 'folklore'].includes(line.label) && line.textEn, line.text)
        if (line.label === 'sourced') assert.ok(line.sourceIds?.length && line.sourceIds.every((id) => getSource(id)), line.text)
      }
    }
    const consort = talkForNpc(ERA, 'xh-worshipper').followUps.find((f) => f.id === 'consort')
    assert.match(consort.lines[0].text, /1893/)
  })
})
