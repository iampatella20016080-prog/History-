import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getSource } from '../src/data/sources.js'
import { INSPECT_OBJECTS, inspectablesOfEra, inspectPlaces } from '../src/data/inspectObjects.js'
import { hasFullLayers, layerSourceIds } from '../src/data/inspectLayers.js'
import { TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { QING_BOARDING_TALK } from '../src/data/qingBoardingTalk.js'
import { QING_BOARDING_OBJECTS } from '../src/data/qingBoardingObjects.js'
import {
  BOARDING_SPOTS,
  BOAT_LEVEL,
  BOATMAN,
  CREW,
  DECK,
  DECK_Y,
  JUNK,
  JUNK_DECK_ZONE,
  PIER_HEAD,
  QING_BOARDING_ERA,
  QING_BOARDING_SOURCE_IDS,
  RIDE_ROUTE,
  SHELTER,
  deckEntryWorld,
  junkBlockers,
  junkToWorld,
  worldToJunk,
} from '../src/data/qingBoardingLayout.js'
import { WHARF_BOATS } from '../src/data/qingWharfLayout.js'
import {
  BOARDING_TIMING,
  boardingFade,
  boardingLocked,
  createBoarding,
  requestBoard,
  requestFall,
  requestReturn,
  rescueAt,
  resetBoarding,
  ridePath,
  rideProgress,
  skipRide,
  stepBoarding,
} from '../src/game/boarding.js'
import { buildInspectObject } from '../src/game/builders/inspectObjects.js'
import { buildNpcGeometry, NPC_LOOKS } from '../src/game/character/npcBuilder.js'
import { exitPointAt, groundAt, hasLevel, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PIER, PLAYER, RIVER } from '../src/game/config.js'
import { validateTalk } from '../src/game/talk.js'
import { followDistance, inFollowArea, orbitDirection, pointInBlockers } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildRiverJunk, splashGeometry } from '../src/game/builders/qingJunk.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 清末搭船（港口商街）：搭駁船上河道中的帆船、甲板上走動與近看器物、搭駁船回棧橋，以及從棧橋邊或甲板邊落水。
 * 查證與設計見 docs/research/qing-boarding.md。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const qing = worlds[QING_BOARDING_ERA]
const sameBox = (a, b) => ['minX', 'maxX', 'minZ', 'maxZ'].every((k) => Math.abs(a[k] - b[k]) < 1e-9)

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.level = ground.level
  p.y = ground.y
  p.water = Boolean(ground.water)
}

function walkTo(world, p, [x, z], step, { stopInWater = false } = {}) {
  for (let n = 0; n < 6000; n++) {
    const dx = x - p.x
    const dz = z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
    if (stopInWater && p.water) return 0
  }
  return Math.hypot(x - p.x, z - p.z)
}

/** 和 Player.jsx 相同：落水後導演把人物放回棧橋頭、面向街道 */
function rescue(world, p) {
  p.x = PIER_HEAD.x
  p.z = PIER_HEAD.z
  p.level = 0
  resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
  const ground = groundAt(p, world.collision, 0, null)
  p.level = ground.level
  p.y = ground.y
  p.water = Boolean(ground.water)
}

const entry = deckEntryWorld()
const L = (x, z) => junkToWorld([x, z])
/** 甲板上的路線（本地座標）：舷梯口 → 後甲板 → 蓆篷裡 → 桅旁 → 船首的船眼旁 → 回舷梯口 */
const DECK_ROUTE = [
  [-3.0, 1.15, '舷梯口'],
  [-3.0, -1.2, '後甲板右舷'],
  [-1.2, -0.3, '蓆篷裡'],
  [0.8, -1.3, '桅旁'],
  [0.8, 1.3, '蓆篷口左舷'],
  [1.5, 1.3, '貨艙口左舷'],
  [4.0, 1.2, '船首的船眼旁'],
  [4.0, -1.2, '船首右舷'],
  [-3.0, 1.15, '回到舷梯口'],
]

function followDeckRoute(p, step) {
  for (const [lx, lz, label] of DECK_ROUTE) {
    const [x, z] = L(lx, lz)
    const miss = walkTo(qing, p, [x, z], step)
    assert.ok(miss < step + 1e-6, `${label}：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})，差 ${miss.toFixed(2)} m`)
    assert.equal(p.level, BOAT_LEVEL, `${label}：仍在甲板的樓層`)
    assert.equal(p.water, false, `${label}：沒有落水`)
    assert.ok(Math.abs(p.y - DECK_Y) < 1e-9, `${label}：站在甲板面上`)
  }
}

describe('清末搭船：狀態機（game/boarding.js）', () => {
  test('岸上 → 去程 → 船上 → 回程 → 岸上；每段都有固定長度、一定結束', () => {
    let b = createBoarding()
    assert.equal(b.phase, 'ashore')
    assert.equal(requestReturn(b).phase, 'ashore', '岸上不能回程')
    b = requestBoard(b)
    assert.equal(b.phase, 'departing')
    assert.ok(boardingLocked(b))
    assert.equal(requestBoard(b), b, '去程中再按搭船不重複')
    const events = []
    for (let i = 0; i < 1000 && b.phase === 'departing'; i++) {
      const r = stepBoarding(b, 1 / 60)
      b = r.boarding
      events.push(...r.events)
    }
    assert.deepEqual(events, ['arrive'])
    assert.equal(b.phase, 'aboard')
    assert.ok(!boardingLocked(b))
    b = requestReturn(b)
    assert.equal(b.phase, 'returning')
    let landed = []
    for (let i = 0; i < 1000 && b.phase === 'returning'; i++) {
      const r = stepBoarding(b, 1 / 60)
      b = r.boarding
      landed.push(...r.events)
    }
    assert.deepEqual(landed, ['land'])
    assert.equal(b.phase, 'ashore')
  })

  test('略過：直接到岸（只剩淡入）；減少動態時整段很短', () => {
    let b = skipRide(requestBoard(createBoarding()))
    const r = stepBoarding(b, BOARDING_TIMING.rideFade)
    assert.equal(r.boarding.phase, 'aboard')
    assert.deepEqual(r.events, ['arrive'])
    const reduced = requestBoard(createBoarding(), { reduced: true })
    assert.ok(reduced.duration < 1.5)
    assert.equal(skipRide(createBoarding()).phase, 'ashore', '岸上略過沒有作用')
  })

  test('落水：水花 → 淡出 → 回到棧橋頭 → 淡入 → 岸上；划船途中與水裡不會再落水', () => {
    let b = requestFall(createBoarding())
    assert.equal(b.phase, 'fallen')
    assert.ok(boardingLocked(b))
    assert.equal(requestFall(b), b)
    assert.equal(requestFall(requestBoard(createBoarding())).phase, 'departing')
    const events = []
    const fades = []
    for (let i = 0; i < 1000 && b.phase === 'fallen'; i++) {
      const r = stepBoarding(b, 1 / 60)
      b = r.boarding
      events.push(...r.events)
      fades.push(boardingFade(b))
    }
    assert.deepEqual(events, ['splash', 'rescue'])
    assert.equal(b.phase, 'ashore')
    assert.ok(Math.max(...fades) > 0.99, '中途全黑')
    assert.ok(fades[0] < 0.01, '水花時還看得到')
    assert.ok(rescueAt() > BOARDING_TIMING.splash)
    // 從船上落水也一樣
    assert.equal(requestFall({ ...createBoarding(), phase: 'aboard' }).phase, 'fallen')
  })

  test('駁船的路線：從停泊處到帆船旁，船頭朝帆船；黑幕只在到岸前後', () => {
    const start = ridePath(RIDE_ROUTE, 0)
    const end = ridePath(RIDE_ROUTE, 1)
    assert.deepEqual([start.x, start.z], RIDE_ROUTE[0])
    assert.deepEqual([end.x, end.z], RIDE_ROUTE[2])
    // 起點的船頭朝河心（-x）：和停泊的 rotationY = π 一致
    assert.ok(Math.abs(Math.abs(start.yaw) - Math.PI) < 0.15, `起點朝向 ${start.yaw}`)
    // 終點在帆船靠棧橋這一側的舷外
    const [, , lz] = worldToJunk([end.x, 0, end.z])
    assert.ok(Math.abs(lz) > JUNK.beam / 2 + 0.3 && Math.abs(lz) < JUNK.beam / 2 + 2, `終點在舷外 ${lz}`)
    let b = requestBoard(createBoarding())
    assert.equal(boardingFade(b), 0)
    assert.equal(rideProgress(b), 0)
    b = stepBoarding(b, b.duration / 2).boarding
    assert.equal(boardingFade(b), 0, '中途沒有黑幕')
    assert.ok(rideProgress(b) > 0.3 && rideProgress(b) < 0.7)
    b = stepBoarding(b, b.duration / 2 - 0.01).boarding
    assert.ok(boardingFade(b) > 0.9, '到岸前全黑')
    const arrived = stepBoarding(b, 0.02).boarding
    assert.equal(arrived.phase, 'aboard')
    assert.ok(boardingFade(arrived) > 0.9, '剛到岸還是黑的，之後淡入')
    assert.equal(boardingFade(stepBoarding(arrived, 2).boarding), 0)
    assert.equal(resetBoarding(arrived).phase, 'ashore')
  })
})

describe('清末搭船：只在港口商街', () => {
  test('其他年代沒有甲板的樓層、水面、船上的人物與帆船的遮擋方塊；港口商街的廣場與棧橋範圍不變', () => {
    for (const era of ERAS.filter((item) => item.id !== QING_BOARDING_ERA)) {
      const world = worlds[era.id]
      assert.equal(hasLevel(world.collision, BOAT_LEVEL), false, era.id)
      assert.ok(!world.collision.walkable.some((rect) => rect.water), `${era.id} 沒有水面`)
      assert.ok(!world.npcs.some((npc) => npc.zone === JUNK_DECK_ZONE.id || npc.id === BOATMAN.id), era.id)
      for (const box of junkBlockers()) assert.ok(!world.blockers.some((o) => sameBox(o, box)), `${era.id} 多了帆船的遮擋方塊`)
      assert.equal(world.junkDeck, null)
    }
    assert.ok(hasLevel(qing.collision, BOAT_LEVEL))
    assert.deepEqual(qing.junkDeck, JUNK_DECK_ZONE)
    for (const box of junkBlockers()) assert.ok(qing.blockers.some((o) => sameBox(o, box)))
    // 整艘船一個大方塊的舊遮擋（會包住甲板）不再出現
    assert.ok(!qing.blockers.some((o) => o.maxY > DECK_Y + 0.5 && o.minX < -70 && o.maxX > -62 && o.minZ < -8 && o.maxZ > -7), '沒有整艘船的大方塊')
  })

  test('帆船只換模型不加船：港口商街三艘船、位置不變；帆船朝向沿 x 軸', () => {
    assert.equal(WHARF_BOATS.length, 3)
    const junk = WHARF_BOATS.find((boat) => boat.type === 'junk')
    assert.equal(junk.model, 'qingJunk')
    assert.deepEqual(junk.position, JUNK.position)
    assert.equal(junk.rotationY, Math.PI)
    assert.ok(WHARF_BOATS.find((boat) => boat.ride)?.type === 'sampan')
  })

  test('港口商街的室內基準不含甲板：產生整個年代的室內時沒有甲板的批次；指名時才有', () => {
    const all = buildEraInteriorSync(QING_BOARDING_ERA)
    const deck = buildEraInteriorSync(QING_BOARDING_ERA, JUNK_DECK_ZONE.building)
    const total = (batches) => batches.reduce((n, batch) => n + batch.geometry.attributes.position.count, 0)
    assert.ok(total(deck.batches) > 0)
    const withoutDeck = total(all.batches)
    assert.ok(withoutDeck > 0)
    // 甲板的頂點都在船的本地範圍裡（不是世界座標）
    for (const batch of deck.batches) {
      const pos = batch.geometry.attributes.position.array
      for (let i = 0; i < pos.length; i += 3) assert.ok(Math.abs(pos[i]) < JUNK.length / 2 + 0.5 && Math.abs(pos[i + 2]) < JUNK.beam / 2 + 0.5, `${batch.material} 頂點 (${pos[i]}, ${pos[i + 2]})`)
    }
  })
})

describe('清末搭船：效能預算', () => {
  const allowed = new Set(['wood', 'planks', 'bamboo', 'cloth', 'plain', 'dark', 'stone', 'paper', 'roof'])
  test('船殼與甲板只用街景既有的材質；甲板流暢畫質 ≤ 6 批、精緻細部 ≤ 3 批', () => {
    const b = new PartBuilder()
    const d = new PartBuilder()
    buildRiverJunk(b, d)
    const hull = b.build()
    const hullDetail = d.build()
    for (const batch of [...hull, ...hullDetail]) assert.ok(allowed.has(batch.material), `船殼用了 ${batch.material}`)
    assert.ok(hull.length <= 7, `船殼 ${hull.length} 批`)
    const deck = buildEraInteriorSync(QING_BOARDING_ERA, JUNK_DECK_ZONE.building)
    for (const batch of [...deck.batches, ...deck.detailBatches]) assert.ok(allowed.has(batch.material), `甲板用了 ${batch.material}`)
    assert.ok(deck.batches.length <= 6, `甲板流暢畫質 ${deck.batches.length} 批`)
    assert.ok(deck.detailBatches.length <= 3, `甲板細部 ${deck.detailBatches.length} 批`)
    const splash = splashGeometry()
    assert.ok(splash.attributes.position.count > 0 && splash.attributes.position.count < 2000)
  })

  test('船上的兩位人物與船夫：外觀存在、幾何可以產生（各三個網格）', () => {
    for (const npc of [BOATMAN, ...CREW]) {
      assert.ok(NPC_LOOKS[npc.look], npc.look)
      const parts = buildNpcGeometry(npc.look, npc.pose)
      for (const key of ['body', 'head', 'forearm']) assert.ok(parts[key].attributes.position.count > 0, `${npc.id} ${key}`)
    }
    const crew = qing.npcs.filter((npc) => npc.zone === JUNK_DECK_ZONE.id)
    assert.equal(crew.length, 2)
    for (const npc of crew) assert.equal(npc.level, BOAT_LEVEL)
    assert.ok(qing.npcs.find((npc) => npc.id === BOATMAN.id)?.hideWhileRiding)
  })
})

describe('清末搭船：甲板的碰撞', () => {
  for (const step of [0.05, 0.15, 0.4]) {
    test(`在甲板上繞一圈（舷梯口→後甲板→蓆篷→桅→船首→回來），每步 ${step} m`, () => {
      const p = { x: entry.x, z: entry.z, level: BOAT_LEVEL, y: DECK_Y, water: false }
      stepTo(qing, p, entry.x, entry.z)
      assert.equal(p.level, BOAT_LEVEL)
      followDeckRoute(p, step)
    })
  }

  test('連續上下船 5 次：到甲板的舷梯口、繞一圈、回棧橋頭，都不卡住', () => {
    for (let i = 0; i < 5; i++) {
      const p = { x: entry.x, z: entry.z, level: BOAT_LEVEL, y: DECK_Y, water: false }
      stepTo(qing, p, entry.x, entry.z)
      followDeckRoute(p, 0.12)
      rescue(qing, p)
      assert.equal(p.level, 0, `第 ${i + 1} 次回到岸上`)
      assert.equal(p.water, false)
      assert.ok(Math.hypot(p.x - PIER_HEAD.x, p.z - PIER_HEAD.z) < 0.2, `第 ${i + 1} 次在棧橋頭`)
      assert.ok(walkableAt(qing, p.x, p.z), '站的位置合法')
    }
  })

  test('走不進艄棚、蓆篷的鋪位、桅、貨艙口的貨、船首的錨與船上的人', () => {
    for (const [lx, lz, label] of [
      [-4.8, 0, '艄棚'],
      [-1.2, 0.6, '鋪位'],
      [1.2, 0, '桅'],
      [2.9, 0, '貨艙口'],
      [5.0, 0, '船首'],
      ...CREW.map((member) => [...member.local, member.id]),
    ]) {
      const [x, z] = L(lx, lz)
      assert.ok(!walkableAt(qing, x, z, BOAT_LEVEL), label)
    }
    // 蓆篷裡走得進去（兩端開口）
    const [sx, sz] = L((SHELTER.minX + SHELTER.maxX) / 2, -0.3)
    assert.ok(walkableAt(qing, sx, sz, BOAT_LEVEL), '蓆篷裡')
  })

  test('甲板的範圍標 inBuilding 與 exitTo（棧橋頭、面向街道）；街道這一層看不到甲板', () => {
    const deck = qing.collision.walkable.filter((rect) => rect.level === BOAT_LEVEL && !rect.water)
    assert.equal(deck.length, 1)
    assert.ok(deck[0].inBuilding)
    assert.deepEqual(deck[0].exitTo, [PIER_HEAD.x, PIER_HEAD.z, PIER_HEAD.heading])
    assert.ok(!walkableAt(qing, entry.x, entry.z, 0), '街道的樓層走不到甲板')
    const exit = exitPointAt({ x: entry.x, z: entry.z }, qing.collision, BOAT_LEVEL)
    assert.deepEqual(exit, { x: PIER_HEAD.x, z: PIER_HEAD.z, heading: PIER_HEAD.heading })
    assert.equal(exitPointAt({ x: -40, z: 0 }, qing.collision, 0), null)
  })

  test('換年代時人物在船上：回到棧橋頭，而且那裡在每個年代都站得住（不在建築裡）', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      const p = { x: PIER_HEAD.x, z: PIER_HEAD.z }
      resolvePlayerPosition(p, PLAYER.radius, world.collision, 0, { relocate: true })
      assert.ok(Math.hypot(p.x - PIER_HEAD.x, p.z - PIER_HEAD.z) < 1e-6, era.id)
      assert.ok(!groundAt(p, world.collision, 0).water, era.id)
      assert.ok(!world.collision.walkable.some((rect) => rect.inBuilding && (rect.level ?? 0) === 0 && p.x > rect.minX && p.x < rect.maxX && p.z > rect.minZ && p.z < rect.maxZ), `${era.id} 棧橋頭不在建築裡`)
    }
    // 回到港口商街時人物也在棧橋頭，不會被放回船上
    assert.equal(groundAt({ x: PIER_HEAD.x, z: PIER_HEAD.z }, qing.collision, 0).level, 0)
  })
})

describe('清末搭船：落水', () => {
  const FROM_DECK = [
    [[-3.0, 1.15], [-3.0, 2.6], '從舷梯口往左舷跨出去'],
    [[0.9, -1.3], [0.9, -2.8], '從桅旁往右舷跨出去'],
    [[4.0, 1.2], [4.0, 2.8], '從船首往左舷跨出去'],
  ]
  for (const step of [0.05, 0.15, 0.4]) {
    test(`從甲板邊走出去就落水，拉回棧橋頭後再上船：連續 5 次（每步 ${step} m）`, () => {
      for (let i = 0; i < 5; i++) {
        const [from, to, label] = FROM_DECK[i % FROM_DECK.length]
        const p = { x: 0, z: 0, level: BOAT_LEVEL, y: DECK_Y, water: false }
        stepTo(qing, p, ...L(...from))
        assert.equal(p.water, false, `${label}：出發時在甲板上`)
        walkTo(qing, p, L(...to), step, { stopInWater: true })
        assert.equal(p.water, true, `${label}：第 ${i + 1} 次走出去要落水`)
        assert.ok(p.y < RIVER.waterLevel, `${label}：人在水裡（y ${p.y}）`)
        // 水裡仍然推得動、不會被障礙物夾住（再走幾步）
        stepTo(qing, p, p.x + step * 0.5, p.z)
        rescue(qing, p)
        assert.equal(p.level, 0)
        assert.equal(p.water, false, `${label}：回到岸上`)
        assert.ok(Math.hypot(p.x - PIER_HEAD.x, p.z - PIER_HEAD.z) < 0.2)
        assert.ok(walkableAt(qing, p.x, p.z))
      }
    })

    test(`從棧橋兩側與盡頭走出去就落水，回岸後走回廣場不卡住（每步 ${step} m）`, () => {
      // 起點避開棧橋上的茶箱堆與繫船柱（那些本來就擋路）
      for (const [start, target, label] of [
        [[-48.5, 0], [-48.5, 4], '北側'],
        [[-48.5, 0], [-48.5, -4], '南側'],
        [[-51.8, 0], [-57, 0], '盡頭'],
        [[-46, 0], [-46, -3.5], '棧橋頭南側'],
      ]) {
        const p = { x: start[0], z: start[1], level: 0, y: 0, water: false }
        stepTo(qing, p, ...start)
        walkTo(qing, p, target, step, { stopInWater: true })
        assert.equal(p.water, true, `${label}：要落水`)
        assert.equal(p.level, 0)
        assert.ok(p.y < RIVER.waterLevel)
        rescue(qing, p)
        assert.equal(p.water, false)
        const miss = walkTo(qing, p, [-38.5, 0.6], step)
        assert.ok(miss < step + 1e-6, `${label}：回岸後走回廣場卡住 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.equal(p.water, false)
      }
    })
  }

  test('水裡走不上駁船；水面不會延伸到河岸的石堤與廣場', () => {
    for (const boat of WHARF_BOATS.filter((item) => item.type === 'sampan')) assert.ok(!walkableAt(qing, boat.position[0], boat.position[2]), boat.type)
    for (const rect of qing.collision.walkable.filter((item) => item.water && (item.level ?? 0) === 0)) {
      assert.ok(rect.maxX <= RIVER.edgeX, '水面在河岸外')
      assert.ok(rect.minZ >= PIER.halfWidth || rect.maxZ <= -PIER.halfWidth || rect.maxX <= PIER.minX, '不蓋到棧橋')
    }
    assert.ok(!walkableAt(qing, -48, 6), '遠離棧橋的水面不能走（會掉下去的範圍只在棧橋邊）')
  })

  test('store：落水時與划船途中不能換年代、交談、進入觀賞模式；在甲板上可以換年代', () => {
    resetStore('qing-port')
    const store = useGameStore.getState()
    useGameStore.setState({ boardingPhase: 'fallen', boardingRequest: null, nearbyBoardingId: null })
    assert.equal(store.requestEra('banquet'), false)
    assert.equal(store.startTalk('qing-wharf-boatman'), false)
    assert.equal(store.setViewMode('viewer'), false)
    assert.equal(store.travelToShop('lin-hua-tai'), false)
    useGameStore.setState({ boardingPhase: 'departing' })
    assert.equal(store.requestEra('banquet'), false)
    assert.equal(store.requestBoarding('skip'), true)
    assert.equal(useGameStore.getState().boardingRequest.action, 'skip')
    useGameStore.setState({ boardingPhase: 'aboard' })
    assert.ok(store.requestEra('banquet'))
    resetStore('qing-port')
  })

  test('store：棧橋頭的駁船旁才能搭船、甲板的舷梯口才能回程；落水的請求只在岸上與船上', () => {
    resetStore('qing-port')
    useGameStore.setState({ boardingPhase: 'ashore', boardingRequest: null, nearbyBoardingId: null })
    const store = useGameStore.getState()
    assert.equal(store.requestBoarding('board'), false, '不在駁船旁')
    useGameStore.setState({ nearbyBoardingId: 'embark' })
    assert.equal(store.requestBoarding('return'), false)
    assert.equal(store.requestBoarding('board'), true)
    assert.equal(useGameStore.getState().boardingRequest.action, 'board')
    assert.equal(useGameStore.getState().nearbyBoardingId, null)
    useGameStore.setState({ boardingPhase: 'aboard', nearbyBoardingId: 'disembark' })
    assert.equal(store.requestBoarding('board'), false)
    assert.equal(store.requestBoarding('fall'), true)
    useGameStore.setState({ boardingPhase: 'returning' })
    assert.equal(store.requestBoarding('fall'), false)
    resetStore('qing-port')
  })
})

describe('清末搭船：鏡頭', () => {
  test('在甲板各個位置與方向，第三人稱鏡頭都不停在船殼、蓆篷、桅與艄棚的遮擋方塊裡', () => {
    const { blockers } = qing
    let checked = 0
    for (let lx = DECK.minX; lx <= DECK.maxX; lx += 0.5) {
      for (let lz = DECK.minZ; lz <= DECK.maxZ; lz += 0.5) {
        const [x, z] = L(lx, lz)
        if (!walkableAt(qing, x, z, BOAT_LEVEL)) continue
        checked++
        const p = { x, y: DECK_Y + CAMERA.targetHeight, z }
        // 蓆篷裡和室內一樣用貼近障礙物的規則（world.followAreas）
        const tight = inFollowArea({ x, z }, qing.followAreas, BOAT_LEVEL)
        for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 8) {
          const direction = orbitDirection(yaw, CAMERA.pitch)
          const d = followDistance(p, direction, CAMERA.distance, 1.3, blockers, tight)
          const camera = { x: p.x + direction.x * d, y: p.y + direction.y * d, z: p.z + direction.z * d }
          assert.equal(pointInBlockers(camera, blockers), false, `(${lx}, ${lz}) yaw ${yaw.toFixed(2)}`)
        }
      }
    }
    assert.ok(checked > 60, `檢查了 ${checked} 個位置`)
  })

  test('駁船路線上鏡頭的注視點都在河上；棧橋頭與水面都看不到整艘船的方塊', () => {
    for (let s = 0; s <= 1; s += 0.1) {
      const at = ridePath(RIDE_ROUTE, s)
      assert.ok(at.x < RIVER.edgeX, `s=${s.toFixed(1)} 在河上`)
    }
  })
})

describe('清末搭船：互動點、器物與人物', () => {
  function standNear(position, radius, level) {
    for (let gx = position[0] - radius; gx <= position[0] + radius; gx += 0.1) {
      for (let gz = position[2] - radius; gz <= position[2] + radius; gz += 0.1) {
        const d = Math.hypot(gx - position[0], gz - position[2])
        if (d > radius - 0.25) continue
        // 站得住而且不是水面
        if (walkableAt(qing, gx, gz, level) && !groundAt({ x: gx, z: gz }, qing.collision, level).water) return { x: gx, z: gz }
      }
    }
    return null
  }

  test('兩個搭船點都站得到：棧橋頭的駁船旁（街道）、甲板的舷梯口（甲板）', () => {
    assert.equal(BOARDING_SPOTS.length, 2)
    for (const spot of BOARDING_SPOTS) {
      assert.ok(standNear(spot.position, spot.radius, spot.level), spot.id)
      assert.ok(spot.labelEn && spot.noteEn && spot.prompt)
    }
    const embark = BOARDING_SPOTS.find((spot) => spot.action === 'board')
    assert.ok(embark.position[0] > PIER.minX && embark.position[0] < PIER.maxX, '在棧橋上')
    assert.ok(Math.hypot(embark.position[0] - BOATMAN.position[0], embark.position[2] - BOATMAN.position[2]) < 1.5, '在船夫旁')
  })

  test('甲板上四件可以近看的器物都在甲板的樓層、站得到；茶箱的「在哪」多了帆船甲板', () => {
    const deckItems = inspectablesOfEra(QING_BOARDING_ERA).filter((item) => item.level === BOAT_LEVEL)
    assert.equal(deckItems.length, 4)
    for (const item of deckItems) {
      assert.ok(INSPECT_OBJECTS[item.objectId], item.id)
      assert.ok(standNear(item.position, item.radius, BOAT_LEVEL), `${item.id} 站不到`)
      assert.ok(item.labelEn)
      // 器物在船的範圍裡
      const [lx, , lz] = worldToJunk(item.position)
      assert.ok(Math.abs(lx) < JUNK.length / 2 && Math.abs(lz) < JUNK.beam / 2 + 0.3, item.id)
    }
    assert.ok(inspectPlaces('tea-chest').some((place) => place.id === 'junk-tea-chest'))
    assert.ok(inspectablesOfEra(QING_BOARDING_ERA).filter((item) => (item.level ?? 0) === 0).every((item) => !item.id.startsWith('junk-')))
  })

  test('樟腦箱、壓艙石、船眼：五層資訊完整、模型可以產生、有小動作、出處都在 sources.js', () => {
    for (const object of Object.values(QING_BOARDING_OBJECTS)) {
      assert.ok(hasFullLayers(object, inspectPlaces(object.id)), `${object.id} 分層不完整`)
      for (const id of layerSourceIds(object)) assert.ok(getSource(id), `${object.id}：出處 ${id}`)
      assert.ok(object.reconstruction, `${object.id} 標歷史情境重建`)
      for (const detail of [true, false]) {
        const built = buildInspectObject(object.id, { detail })
        assert.ok(built.radius > 0 && built.parts.length > 0)
        for (const part of built.parts) assert.ok(part.geometry.attributes.position.count > 0, `${object.id}／${part.id}`)
        for (const action of object.actions) assert.ok(built.parts.some((part) => part.animate?.action === action.id), `${object.id}：動作 ${action.id}`)
      }
    }
    // 鴉片箱先不做
    assert.ok(!INSPECT_OBJECTS['opium-chest'])
  })

  test('三位人物的對話：格式正確、標示有出處的句子都附出處、都對應街景裡的人物、站得到', () => {
    assert.equal(QING_BOARDING_TALK.length, 3)
    const ids = new Set()
    for (const talk of QING_BOARDING_TALK) {
      assert.deepEqual(validateTalk(talk), [], talk.id)
      assert.equal(talk.eraId, QING_BOARDING_ERA)
      assert.ok(!ids.has(talk.npcId))
      ids.add(talk.npcId)
      for (const line of [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]) {
        for (const id of line.sourceIds ?? []) assert.ok(getSource(id), `${talk.id}：出處 ${id}`)
      }
      const npc = qing.npcs.find((item) => item.id === talk.npcId)
      assert.ok(npc, `${talk.id}：街景裡沒有 ${talk.npcId}`)
      assert.equal(talkForNpc(QING_BOARDING_ERA, npc.id), talk)
      assert.ok(standNear(npc.position, TALK_RADIUS, npc.level ?? 0), `${talk.id} 站不到`)
      if (talk.objectId) assert.ok(INSPECT_OBJECTS[talk.objectId])
    }
    // 其他年代找不到這些對話
    for (const era of ERAS.filter((item) => item.id !== QING_BOARDING_ERA)) for (const talk of QING_BOARDING_TALK) assert.equal(talkForNpc(era.id, talk.npcId), null, era.id)
  })

  test('查證來源都在 sources.js，而且有英文', () => {
    for (const id of QING_BOARDING_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.ok(source.contextEn, `${id} 缺英文`)
    }
    assert.ok(getSource('dodd-blockade-1888').url.includes('archive.org') || getSource('dodd-blockade-1888').usage.includes('archive.org'), '陶德日記已有全文')
  })
})
