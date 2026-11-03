import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { LTX_INTERIOR_HOTSPOTS, LTX_SHELL, LTX_SITE, LTX_VARIANTS, ltxToWorld } from '../src/data/liTingXiangLayout.js'
import { LI_TING_XIANG_ID } from '../src/data/liTingXiangData.js'
import { getInspectObject, inspectablesOfEra, inspectPlaces } from '../src/data/inspectObjects.js'
import { hasFullLayers } from '../src/data/inspectLayers.js'
import { getSource } from '../src/data/sources.js'
import { TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { pickInteraction } from '../src/game/interactionPick.js'
import { NPC_LOOKS, NPC_POSES, buildNpcGeometry } from '../src/game/character/npcBuilder.js'
import { onLevel, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { indoorFollow, interiorAmount, followAllowed, inFollowArea, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { buildInspectObject } from '../src/game/builders/inspectObjects.js'
import { LTX_FURNITURE } from '../src/game/builders/liTingXiang/liTingXiangFurniture.js'
import { ltxObstacles } from '../src/game/builders/liTingXiang/liTingXiang.js'
import { inLiTingXiangLot } from './helpers.js'

/*
 * 李亭香的室內（第 11 階段）：只有老屋新生可以走進去（前店、內用座位；後門關著，工作間不開放）。
 * 其他三個年代仍是一般閩南街屋。設計見 docs/research/interior-li-ting-xiang.md。
 */
const ERA_ID = 'revival'
const OTHER = ERAS.map((era) => era.id).filter((id) => id !== ERA_ID)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const variant = LTX_VARIANTS.pastryShop
const W = (x, z) => ltxToWorld(x, z)
const BUILDING = `store-${LI_TING_XIANG_ID}`

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 沿著路線點行走（本地座標），每一步做一次和遊戲中一個影格相同的碰撞處理 */
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
      resolvePlayerPosition(s, PLAYER.radius, world.collision, 0)
    }
  }
  return s
}

const start = () => ({ ...W(-1.45, 1.3) })
/** 世界 → 本地座標（地段轉 180°） */
const local = (p) => ({ x: LTX_SITE.x - p.x, z: LTX_SITE.z - p.z })
const near = (s, lx, lz, tol = 0.45) => Math.hypot(s.x - W(lx, lz).x, s.z - W(lx, lz).z) < tol

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw) {
  const found = interiorAmount(p, world.interiors, 0)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(CAMERA.pitch, CAMERA.distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas, 0)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
}

/** 從街上走進左邊的門、經過展示櫃與櫃台之間，到內用座位中間的走道、後門前面（本地座標） */
const ROUTE = [[-1.45, 1.0], [-1.45, -0.6], [0, -1.0], [0, -2.4], [0, -4.6], [0, -5.4]]
/** 到內用座位旁邊（左邊那張桌子的前面） */
const SEATS = [[-1.45, 1.0], [-1.45, -0.6], [0, -1.0], [-0.4, -3.4], [-1.3, -3.55]]

describe('李亭香：只有老屋新生換樣式、地段不變、熱點', () => {
  test('建築樣式與版本：老屋新生是 li-ting-xiang／pastryShop；其他年代仍是一般閩南街屋（或沒有）', () => {
    const shop = getShop(LI_TING_XIANG_ID)
    const building = getShopBuilding(shop, ERA_ID)
    assert.equal(building.archetype, 'li-ting-xiang')
    assert.equal(building.variant, 'pastryShop')
    for (const eraId of OTHER) {
      const other = getShopBuilding(shop, eraId)
      if (other) assert.equal(other.archetype, 'minnan', eraId)
    }
  })

  test('地段切分不變：李亭香的地段在 x=16.7、z=4.5、面寬 5.4 公尺、轉 180°（朝北），兩旁的地段不重疊', () => {
    const plan = getLotPlan()
    const lot = plan.lots.find((item) => item.storeId === LI_TING_XIANG_ID)
    assert.equal(lot.x, LTX_SITE.x)
    assert.equal(lot.z, LTX_SITE.z)
    assert.equal(lot.width, 2 * LTX_SHELL.half)
    assert.equal(lot.rotationY, Math.PI)
    const neighbours = plan.lots.filter((item) => item.z === lot.z && Math.abs(item.x - lot.x) < 10).sort((p, q) => p.x - q.x)
    const i = neighbours.indexOf(lot)
    assert.ok(neighbours[i - 1].x + neighbours[i - 1].width / 2 <= lot.x - lot.width / 2 + 1e-6)
    assert.ok(neighbours[i + 1].x - neighbours[i + 1].width / 2 >= lot.x + lot.width / 2 - 1e-6)
  })

  test('店內的熱點：前店與內用座位、後面的工作間（不開放），都對應存在的章節', () => {
    const shop = getShop(LI_TING_XIANG_ID, ERA_ID)
    assert.deepEqual(shop.hotspots.map((h) => h.id).sort(), ['shop-front', 'workroom'])
    for (const hotspot of shop.hotspots) {
      assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), hotspot.id)
      assert.ok(hotspot.label && hotspot.labelEn && hotspot.note && hotspot.noteEn, hotspot.id)
    }
    for (const hotspot of LTX_INTERIOR_HOTSPOTS) assert.ok(hotspot.prompt[1] > 1 && hotspot.prompt[1] < LTX_SHELL.ceiling, hotspot.id)
    assert.match(LTX_INTERIOR_HOTSPOTS.find((h) => h.id === 'shop-front').note, /歷史情境重建/)
  })
})

describe('李亭香：室內只畫這一棟、不與其他建築重疊；其他年代不受影響', () => {
  test('老屋新生有一個室內範圍（在地段裡）；其他年代沒有', () => {
    const zones = worlds[ERA_ID].interiors.filter((item) => item.id.startsWith(LI_TING_XIANG_ID))
    assert.deepEqual(zones.map((zone) => zone.id), [LI_TING_XIANG_ID])
    assert.equal(zones[0].building, BUILDING)
    assert.ok(inLiTingXiangLot(zones[0]))
    assert.ok(zones[0].camera.maxHeight < LTX_SHELL.ceiling)
    for (const eraId of OTHER) assert.ok(!worlds[eraId].interiors.some((item) => item.id.startsWith(LI_TING_XIANG_ID)), eraId)
  })

  test('其他年代的建築仍是整塊的鏡頭遮擋（沒有可以走進去的範圍），碰撞沒有標 inBuilding 的範圍在李亭香的地段裡', () => {
    for (const eraId of OTHER) {
      const inside = worlds[eraId].collision.walkable.filter((r) => r.inBuilding && inLiTingXiangLot(r) && r.minZ > LTX_SITE.z)
      assert.equal(inside.length, 0, eraId)
    }
  })

  test('李亭香的遮擋方塊都在地段裡；其他建築的遮擋方塊不伸進李亭香的室內', () => {
    const world = worlds[ERA_ID]
    const record = world.buildings.find((item) => item.id === BUILDING)
    for (const part of record.parts) assert.ok(inLiTingXiangLot(part), JSON.stringify(part))
    const room = world.interiors.find((item) => item.id === LI_TING_XIANG_ID)
    for (const other of world.buildings.filter((item) => item.id !== BUILDING)) {
      const overlap = other.box.minX < room.maxX - 0.05 && other.box.maxX > room.minX + 0.05 && other.box.minZ < room.maxZ - 0.05 && other.box.maxZ > room.minZ + 0.05 && other.box.minY < 4
      assert.ok(!overlap, `${other.id} 伸進李亭香的室內`)
    }
  })

  test('室內按需產生：只產生這一棟、沒有接地暗影；繪製批次與頂點在預算內，每個頂點都在地段裡；其他年代沒有', () => {
    const interior = buildEraInteriorSync(ERA_ID, BUILDING)
    assert.ok(interior.batches.length >= 4 && interior.batches.length <= 10, `${interior.batches.length}`)
    assert.ok(!interior.batches.some((batch) => batch.material === 'contact'))
    const vertices = interior.batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(vertices < 30000, `${vertices}`)
    for (const batch of [...interior.batches, ...interior.detailBatches]) {
      const attr = batch.geometry.attributes.position
      for (let i = 0; i < attr.count; i++) {
        const point = { minX: attr.getX(i), maxX: attr.getX(i), minZ: attr.getZ(i), maxZ: attr.getZ(i) }
        assert.ok(inLiTingXiangLot(point), `${batch.material} (${point.minX.toFixed(2)}, ${point.minZ.toFixed(2)})`)
        assert.ok(attr.getY(i) < LTX_SHELL.ceiling + 0.05, `${batch.material} 高度 ${attr.getY(i).toFixed(2)}`)
      }
    }
    for (const eraId of OTHER) assert.equal(buildEraInteriorSync(eraId, BUILDING).batches.length, 0, eraId)
  })

  test('器物清單：每一件器物都有建模、障礙物與遮擋高度；障礙物都在店裡、互不重疊', () => {
    const { room } = LTX_SHELL
    for (const item of variant.items) {
      const kind = LTX_FURNITURE[item.type]
      assert.ok(kind?.build && kind.footprint && kind.height, item.type)
    }
    const list = ltxObstacles(variant)
    for (const r of list) assert.ok(r.minX >= room.minX - 0.31 && r.maxX <= room.maxX + 0.31 && r.minZ >= room.minZ - 0.31 && r.maxZ <= room.maxZ, JSON.stringify(r))
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = [list[i], list[j]]
        assert.ok(!(a.minX < b.maxX - 1e-9 && b.minX < a.maxX - 1e-9 && a.minZ < b.maxZ - 1e-9 && b.minZ < a.maxZ - 1e-9), `${i} 與 ${j} 重疊`)
      }
    }
  })

  test('後面的工作間不開放：後門關著，走不過去', () => {
    const s = walkRoute(worlds[ERA_ID], W(0, -5.2), [[0, -8.0]], 0.15)
    assert.ok(local(s).z > -6.0, `停在 z=${local(s).z.toFixed(2)}`)
    assert.ok(!walkableAt(worlds[ERA_ID], W(0, variant.partition.z).x, W(0, variant.partition.z).z))
  })

  test('店內沒有寫店名以外的招牌字（不畫店家的包裝設計與標價）', () => {
    const inside = worlds[ERA_ID].signs.filter((sign) => Math.abs(sign.position[0] - LTX_SITE.x) < LTX_SHELL.half && sign.position[2] > LTX_SITE.z + 0.2)
    assert.equal(inside.length, 0)
  })
})

describe('李亭香：走進去、走出來（碰撞）', () => {
  const world = worlds[ERA_ID]

  test('從街上走過前店到後門前、再走回街上（步長 0.05／0.15／0.4）', () => {
    const deepest = ROUTE[ROUTE.length - 1]
    for (const stepSize of [0.05, 0.15, 0.4]) {
      const inside = walkRoute(world, start(), ROUTE, stepSize)
      assert.ok(near(inside, ...deepest), `走到 (${local(inside).x.toFixed(2)}, ${local(inside).z.toFixed(2)})（步長 ${stepSize}）`)
      const back = walkRoute(world, inside, [...ROUTE].reverse(), stepSize)
      assert.ok(local(back).z > 0.5, `走回 z=${local(back).z.toFixed(2)}（步長 ${stepSize}）`)
    }
  })

  test('走到內用座位旁，再走回街上（步長 0.05／0.15／0.4）', () => {
    const deepest = SEATS[SEATS.length - 1]
    for (const stepSize of [0.05, 0.15, 0.4]) {
      const inside = walkRoute(world, start(), SEATS, stepSize)
      assert.ok(near(inside, ...deepest), `走到 (${local(inside).x.toFixed(2)}, ${local(inside).z.toFixed(2)})（步長 ${stepSize}）`)
      const back = walkRoute(world, inside, [...SEATS].reverse(), stepSize)
      assert.ok(local(back).z > 0.5, `走回 z=${local(back).z.toFixed(2)}（步長 ${stepSize}）`)
    }
  })

  test('連續進出 5 次', () => {
    let s = start()
    for (let i = 0; i < 5; i++) {
      s = walkRoute(world, s, ROUTE, 0.15)
      assert.ok(near(s, ...ROUTE[ROUTE.length - 1]), `第 ${i + 1} 次進去`)
      s = walkRoute(world, s, [...ROUTE].reverse(), 0.15)
      assert.ok(local(s).z > 0.5, `第 ${i + 1} 次離開：z=${local(s).z.toFixed(2)}`)
    }
  })

  test('門以外的立面、擺設與人物都不能穿越', () => {
    const { door } = variant
    const sideWalk = walkRoute(world, W(door.maxX + 0.6, 1.2), [[door.maxX + 0.6, -3]], 0.15)
    assert.ok(local(sideWalk).z > -0.2, `停在 z=${local(sideWalk).z.toFixed(2)}`)
    assert.ok(!walkableAt(world, W(LTX_SHELL.half + 0.6, -4).x, W(0, -4).z))
    for (const item of variant.items) {
      if (item.block === false) continue
      const r = LTX_FURNITURE[item.type].footprint(item)
      const c = W((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(world, c.x, c.z), `${item.type} ${JSON.stringify(r)}`)
    }
    for (const npc of variant.npcs) assert.ok(!walkableAt(world, W(npc.x, npc.z).x, W(npc.x, npc.z).z), npc.id)
  })

  test('換年代時：站在李亭香店裡的人物，換到每個年代後都移到可以走的地方（其他年代移到戶外）', () => {
    const spots = [[0, -1.5], [0, -3.6], [-0.4, -5.3], [0.6, -0.5]]
    for (const eraId of ERAS.map((era) => era.id)) {
      for (const [x, z] of spots) {
        const p = W(x, z)
        resolvePlayerPosition(p, PLAYER.radius, worlds[eraId].collision, 0, { relocate: true })
        assert.ok(walkableAt(worlds[eraId], p.x, p.z), `${eraId} (${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        if (eraId !== ERA_ID) assert.ok(local(p).z > -0.1, `${eraId} (${x}, ${z}) 移到戶外：z=${local(p).z.toFixed(2)}`)
      }
    }
  })
})

describe('李亭香：鏡頭不穿牆', () => {
  const world = worlds[ERA_ID]

  test('店裡每個可以站的位置，頭頂高度都不在任何遮擋方塊裡', () => {
    let checked = 0
    for (const r of world.collision.walkable.filter((item) => item.inBuilding && inLiTingXiangLot(item))) {
      const y = 1.6
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
    assert.ok(checked > 100, `${checked} 個位置`)
  })

  test('店裡每個位置、各個方向的跟隨鏡頭都在店裡、天花板以下', () => {
    const { room, ceiling } = LTX_SHELL
    let checked = 0
    // 後門關著：後面的工作間走不到，只檢查前店與內用座位
    for (let z = room.maxZ - 0.3; z > variant.partition.z + 0.3; z -= 0.4) {
      for (let x = room.minX + 0.4; x < room.maxX - 0.3; x += 0.4) {
        const p = W(x, z)
        if (!walkableAt(world, p.x, p.z)) continue
        for (let i = 0; i < 12; i++) {
          const cam = followCamera(world, p, (i / 12) * Math.PI * 2)
          const q = local(cam)
          // 門口附近：鏡頭可以從門退到騎樓與 224 巷（戶外），只要不在任何遮擋方塊裡
          const inBlocker = world.blockers.some((b) => cam.x > b.minX && cam.x < b.maxX && cam.y > b.minY && cam.y < b.maxY && cam.z > b.minZ && cam.z < b.maxZ)
          const inRoom = q.x > room.minX - 0.05 && q.x < room.maxX + 0.05 && q.z > room.minZ - 0.05
          assert.ok((inRoom || q.z > 0) && !inBlocker, `玩家 (${x.toFixed(1)}, ${z.toFixed(1)}) 鏡頭 (${q.x.toFixed(2)}, ${q.z.toFixed(2)})`)
          assert.ok(q.z > variant.partition.z - 0.05, `鏡頭不到後門後面：z=${q.z.toFixed(2)}`)
          assert.ok(cam.y < ceiling + 0.05, `鏡頭高度 ${cam.y.toFixed(2)}`)
          checked++
        }
      }
    }
    assert.ok(checked > 150, `${checked}`)
  })
})

describe('李亭香：情境人物、對話與可以近看的器物', () => {
  const world = worlds[ERA_ID]

  test('人物：外觀屬於老屋新生、姿勢存在、幾何建得出來；在室內範圍裡', () => {
    for (const npc of variant.npcs) {
      assert.equal(NPC_LOOKS[npc.look]?.era, ERA_ID, npc.id)
      assert.ok(NPC_POSES[npc.pose], npc.id)
      const parts = buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY || 0.42 })
      assert.ok(parts.body.attributes.position.count > 0, npc.id)
      const placed = world.npcs.find((item) => item.id === npc.id)
      assert.equal(placed.zone, LI_TING_XIANG_ID, npc.id)
    }
  })

  test('新器物（平西餅、平安龜）五層資訊齊全、出處都存在、3D 模型建得出來，動作有對應的零件', () => {
    for (const id of ['pingxi-cake', 'peace-turtle']) {
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
  })

  test('研究文件的建議（第 6 節）：平西餅寫 27 層、註另一說；平安龜的餡兩說並列、標待核；餅印牆寫明是示意、沿用的路線器物不加分層', () => {
    const form = getInspectObject('pingxi-cake').layers.form.map((note) => note.text).join('')
    assert.match(form, /27 層/)
    assert.match(form, /30 層/)
    const making = getInspectObject('peace-turtle').layers.making
    assert.ok(making.some((note) => /麥芽糖/.test(note.text) && /黑芝麻/.test(note.text) && note.status === 'pending'))
    // 沿用的路線器物不加分層（加了會讓卡片變成只有一個分頁）；餅印牆的「示意」寫在近看的標籤上
    for (const id of ['longevity-cake-mould', 'shouxian-cakes']) assert.equal(getInspectObject(id).layers, undefined, id)
    assert.match(inspectablesOfEra(ERA_ID).find((item) => item.id === 'ltx-mould').label, /示意/)
  })

  test('糕餅路線的外婆仍在門口（店外的街上），不在店裡', () => {
    const grandma = worlds[ERA_ID].npcs.find((npc) => npc.id === 'route-pastry-shouxian')
    assert.ok(grandma, '找不到外婆')
    assert.ok(local({ x: grandma.position[0], z: grandma.position[2] }).z > 0, '外婆在立面外')
  })

  test('四件可以近看的器物：有站得到的位置，而且那裡這件器物比可以交談的人與其他器物都近', () => {
    const talkers = world.npcs.filter((npc) => talkForNpc(ERA_ID, npc.id))
    const items = inspectablesOfEra(ERA_ID).filter((item) => item.shopId === LI_TING_XIANG_ID)
    assert.deepEqual(items.map((item) => item.objectId).sort(), ['longevity-cake-mould', 'peace-turtle', 'pingxi-cake', 'shouxian-cakes'])
    for (const item of items) {
      assert.ok(getInspectObject(item.objectId), item.id)
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

  test('店內熱點的提示和器物的近看提示不疊在一起（觸控時兩張卡片都點得到）', () => {
    for (const hotspot of getShop(LI_TING_XIANG_ID, ERA_ID).hotspots) {
      for (const item of inspectablesOfEra(ERA_ID)) {
        const d = Math.hypot(...hotspot.prompt.map((v, i) => v - item.prompt[i]))
        assert.ok(d > 0.9, `${hotspot.id} 與 ${item.id} 只差 ${d.toFixed(2)} 公尺`)
      }
    }
  })

  test('兩位人物都可以交談（有站得到、而且比器物與熱點都近的位置），說完可以近看一件器物；每句都有標示，出處都存在；不提店家的人名', () => {
    for (const placedNpc of variant.npcs) {
      const talk = talkForNpc(ERA_ID, placedNpc.id)
      assert.ok(talk, placedNpc.id)
      const npc = world.npcs.find((item) => item.id === talk.npcId)
      const rivals = [
        ...inspectablesOfEra(ERA_ID).map((item) => [item.position[0], item.position[2], item.radius]),
        ...getShop(LI_TING_XIANG_ID, ERA_ID).hotspots.map((h) => [h.point.x, h.point.z, h.radius]),
      ]
      let found = false
      for (let gx = npc.position[0] - TALK_RADIUS; gx <= npc.position[0] + TALK_RADIUS && !found; gx += 0.1) {
        for (let gz = npc.position[2] - TALK_RADIUS; gz <= npc.position[2] + TALK_RADIUS && !found; gz += 0.1) {
          const d = Math.hypot(gx - npc.position[0], gz - npc.position[2])
          if (d >= TALK_RADIUS || !walkableAt(world, gx, gz)) continue
          found = rivals.every(([x, z, r]) => Math.hypot(gx - x, gz - z) >= r || Math.hypot(gx - x, gz - z) > d)
        }
      }
      assert.ok(found, talk.npcId)
      assert.ok(getInspectObject(talk.objectId), talk.npcId)
      assert.doesNotMatch(talk.role, /李/)
      for (const line of [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)]) {
        assert.ok(['sourced', 'fiction', 'folklore'].includes(line.label) && line.textEn, line.text)
        assert.doesNotMatch(line.text, /李佳陽|李榮華/, line.text)
        if (line.label !== 'fiction') for (const id of line.sourceIds) assert.ok(getSource(id), id)
      }
    }
  })
})
