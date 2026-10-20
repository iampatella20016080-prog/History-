import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { beforeEach, describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { ART_YARD, LUGUO_CAFE, LUGUO_HOTSPOTS, LUGUO_STAIRS, artYardToWorld } from '../src/data/luguoCafeLayout.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { CAFE_ITEMS } from '../src/game/builders/luguoCafeInterior.js'
import { groundAt, hasLevel, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { QUALITY_MODES } from '../src/game/quality.js'
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
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 爐鍋咖啡：只在「老屋新生」出現的小藝埕（屈臣氏大藥房舊址）、側面的32巷與騎樓、
 * 從騎樓的樓梯入口走上二樓（分樓層的碰撞與看不見的連續斜面）、二樓店內的家具與吧檯、
 * 五個資訊熱點、鏡頭（跟隨、觀賞模式、介紹）、按需載入的室內細部，以及介紹內容與文獻。
 */
const revival = buildEraWorldSync('revival')
const shop = getShop('luguo-cafe')
const zone = revival.interiors.find((item) => item.id === 'luguo-cafe')
const space = viewerSpaceOf(revival)
const H2 = ART_YARD.floor2
const P = (x, z) => artYardToWorld(x, z)

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function overlaps(a, b, pad = 0.05) {
  return a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
}

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 角色：位置、樓層與地板高度（與 Player 相同：每一步先推出障礙物，再依樓層與斜面決定高度） */
function player(x, z, level = 0, y = 0) {
  return { x, z, level, y, maxRise: 0 }
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.maxRise = Math.max(p.maxRise, Math.abs(ground.y - p.y))
  p.level = ground.level
  p.y = ground.y
}

/** 模擬按住方向鍵往目標走（每步 step 公尺），回傳離目標還差多少 */
function walkTo(world, p, target, step = 0.15) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

function walkDirection(world, p, direction, steps, step = 0.15) {
  for (let i = 0; i < steps; i++) stepTo(world, p, p.x + direction.x * step, p.z + direction.z * step)
  return p
}

// 從迪化街經過轉角騎樓、巷子側騎樓、樓梯入口，走上兩段樓梯，穿過玻璃門到吧檯前（建築本地座標）
const UP = [
  [3.0, 1.0, '轉角騎樓'],
  [3.1, -12.9, '巷子側騎樓'],
  [3.95, -13.1, '繞過立牌'],
  [3.95, -14.52, '樓梯入口前'],
  [1.8, -14.52, '入口內'],
  [-2.4, -14.52, '第一段樓梯頂'],
  [-2.4, -13.1, '平台迴轉'],
  [2.2, -13.1, '第二段樓梯頂'],
  [3.05, -13.1, '二樓樓梯平台'],
  [3.05, -11.2, '玻璃門'],
  [0.4, -6.0, '中央走道'],
  [-0.75, -1.0, '吧檯前'],
]
const DOWN = [
  [0.4, -6.0, '中央走道'],
  [0.6, -10.9, '扭蛋機旁'],
  [3.05, -11.2, '玻璃門'],
  [3.05, -13.1, '二樓樓梯平台'],
  [-2.4, -13.1, '第二段樓梯底'],
  [-2.4, -14.52, '平台'],
  [1.8, -14.52, '第一段樓梯底'],
  [3.95, -14.52, '樓梯入口'],
  [3.95, -13.1, '巷子側騎樓'],
  [3.1, -12.9, '巷子側騎樓'],
  [3.0, 1.0, '轉角騎樓'],
]
const STREET = { x: ART_YARD.site.x, z: 0 }

function followRoute(world, p, route, step) {
  for (const [x, z, label] of route) {
    const miss = walkTo(world, p, P(x, z), step)
    assert.ok(miss < step + 1e-6, `${label}：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)}) y ${p.y.toFixed(2)} 樓層 ${p.level}，差 ${miss.toFixed(2)} m`)
  }
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算：注視點在角色所在的地板上方） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const level = p.level ?? 0
  const found = interiorAmount(p, world.interiors, level)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: (p.y ?? 0) + CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas, level)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, target }
}

describe('爐鍋咖啡：只在「老屋新生」的小藝埕二樓', () => {
  test('店家資料：所在建築小藝埕、二樓、可以走進去的室內；只出現在「老屋新生」', () => {
    assert.equal(shop.name, '爐鍋咖啡')
    assert.equal(shop.buildingId, 'art-yard')
    assert.equal(shop.floor, 2)
    assert.equal(shop.hasInterior, true)
    assert.equal(shop.interaction.level, 1)
    for (const era of ERAS) assert.equal(era.availableStores.includes('luguo-cafe'), era.id === 'revival', era.id)
    // 店家的位置在二樓的吧檯前（世界座標由配置換算，不另外寫死）
    const bar = P(LUGUO_CAFE.bar.counterX + 0.35, -1.0)
    assert.ok(Math.abs(shop.position.x - bar.x) < 1e-9 && Math.abs(shop.position.z - bar.z) < 1e-9)
  })

  test('其他年代沒有小藝埕、32巷、招牌與室內；那兩個地段仍是一般街屋', () => {
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = buildEraWorldSync(era.id)
      assert.ok(!world.buildings.some((item) => /luguo/.test(item.id) || item.storeId === 'luguo-cafe'), era.id)
      assert.ok(!world.signs.some((sign) => /爐鍋|WATSON|屈臣氏|小藝埕|32巷/.test(sign.text)), era.id)
      assert.ok(!world.interiors.some((item) => item.id === 'luguo-cafe'), era.id)
      for (const id of ART_YARD.site.replaces) assert.ok(world.buildings.some((item) => item.id === id), `${era.id} ${id}`)
      assert.equal(buildEraInteriorSync(era.id, 'site-luguo-cafe').batches.length, 0, era.id)
      assert.equal(hasLevel(world.collision, 1), false, `${era.id} 沒有二樓`)
    }
    for (const id of ART_YARD.site.replaces) assert.ok(!revival.buildings.some((item) => item.id === id), id)
    assert.equal(hasLevel(revival.collision, 1), true)
  })

  test('招牌：屈臣氏大藥房、A.S. WATSON & CO.、小藝埕的旗幟、巷子側的木製爐鍋咖啡招牌與32巷的路名牌', () => {
    const signs = revival.signs
    assert.ok(signs.some((sign) => sign.text === '屈臣氏大藥房' && sign.style === 'redRelief'))
    assert.ok(signs.some((sign) => sign.text === 'A.S. WATSON & CO.' && sign.style === 'relief'))
    assert.ok(signs.filter((sign) => sign.text === '小藝埕' && sign.style === 'artYard').length >= 4)
    assert.ok(signs.some((sign) => sign.text === 'ArtYard'))
    assert.ok(signs.some((sign) => sign.text === '爐鍋咖啡' && sign.style === 'luguoWood'))
    assert.ok(signs.some((sign) => sign.text === '迪化街一段32巷'))
    assert.ok(signs.some((sign) => sign.text === '二樓 咖啡'))
  })

  test('小藝埕、32巷與鄰棟不覆蓋永樂市場、豆花店或其他建築', () => {
    const mine = revival.buildings.filter((item) => /luguo/.test(item.id))
    const others = revival.buildings.filter((item) => !/luguo/.test(item.id))
    assert.ok(mine.length >= 7)
    for (const id of ['yong-le-market', 'action-bar', 'lin-fu-zhen', 'zi-yang']) assert.ok(others.some((item) => item.storeId === id), `${id} 仍在街上`)
    // 永樂市場前廣場大樹的樹冠：遮擋方塊比樹冠大一圈，實際的樹冠離小藝埕的側牆約 0.35 m
    const canopy = (o, part) => o.storeId === 'yong-le-market' && part.minY > 2 && part.maxY < 6 && part.maxX - part.minX < 4.5
    for (const a of mine) {
      for (const part of a.parts) {
        for (const o of others) {
          for (const other of o.parts) {
            if (canopy(o, other)) continue
            assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, `${a.id} 與 ${o.id} 重疊`)
          }
        }
      }
    }
  })
})

describe('爐鍋咖啡：從迪化街走上二樓、再走回街上（分樓層的碰撞與樓梯斜面）', () => {
  for (const step of [0.05, 0.15]) {
    test(`每步 ${step} m：走上兩段樓梯到吧檯前（二樓、地板 4 m），再走回迪化街（一樓、地面）`, () => {
      const p = player(STREET.x, STREET.z)
      followRoute(revival, p, UP, step)
      assert.equal(p.level, 1)
      assert.ok(Math.abs(p.y - H2) < 1e-9, `y ${p.y}`)
      const point = getShopPlacement(shop).interactionPoint
      assert.ok(Math.hypot(p.x - point.x, p.z - point.z) < shop.interaction.radius, '在吧檯的互動範圍裡')
      followRoute(revival, p, DOWN, step)
      walkTo(revival, p, STREET, step)
      assert.equal(p.level, 0)
      assert.equal(p.y, 0)
      // 高度連續變化：每一步的高度差不超過斜面的坡度（不會瞬間跳上二樓或掉下去）
      assert.ok(p.maxRise <= step * 0.7 + 1e-6, `最大高度差 ${p.maxRise.toFixed(3)} m`)
    })
  }

  test('樓梯連續上下 5 次（每步 0.15 m），每次都回到同一個地方', () => {
    const p = player(STREET.x, STREET.z)
    followRoute(revival, p, UP.slice(0, 3), 0.15)
    for (let i = 0; i < 5; i++) {
      followRoute(revival, p, UP.slice(3, 10), 0.15)
      assert.ok(p.level === 1 && Math.abs(p.y - H2) < 1e-9, `第 ${i + 1} 次上樓：樓層 ${p.level} y ${p.y.toFixed(2)}`)
      followRoute(revival, p, DOWN.slice(3, 9), 0.15)
      assert.ok(p.level === 0 && p.y === 0, `第 ${i + 1} 次下樓：樓層 ${p.level} y ${p.y.toFixed(2)}`)
    }
    assert.ok(p.maxRise <= 0.15 * 0.7 + 1e-6, `最大高度差 ${p.maxRise.toFixed(3)} m`)
  })

  test('樓梯上的高度：第一段 0 → 2 m（平台），第二段 2 → 4 m；過了第二段的一半算二樓', () => {
    const { run, flight1, flight2, landing } = LUGUO_STAIRS
    const z1 = (flight1.minZ + flight1.maxZ) / 2
    const z2 = (flight2.minZ + flight2.maxZ) / 2
    const at = (x, z, level, y) => groundAt(P(x, z), revival.collision, level, y)
    assert.deepEqual(at(run.lower, z1, 0, 0), { level: 0, y: 0 })
    assert.ok(Math.abs(at(0, z1, 0, 1).y - 1) < 1e-9)
    assert.deepEqual(at(landing.minX + 0.5, z1, 0, landing.y), { level: 0, y: landing.y })
    assert.ok(Math.abs(at(0, z2, 0, 3).y - 3) < 1e-9)
    assert.equal(at(-0.5, z2, 0, 2.5).level, 0)
    assert.equal(at(0.5, z2, 0, 3.5).level, 1)
    assert.deepEqual(at(run.lower, z2, 1, H2), { level: 1, y: H2 })
  })

  test('樓層分開：二樓的家具不擋一樓的騎樓；站在騎樓下的人不會被當成在二樓', () => {
    // 窗邊方桌的正下方是巷子側的騎樓
    const table = CAFE_ITEMS.find((item) => item.type === 'squareTable')
    const below = P(table.x, table.z)
    assert.ok(walkableAt(revival, below.x, below.z, 0), '騎樓可以走')
    assert.ok(!walkableAt(revival, below.x, below.z, 1), '二樓是桌子')
    assert.equal(groundAt(below, revival.collision, 0, 0).y, 0)
    assert.equal(groundAt(below, revival.collision, 1, H2).y, H2)
    // 二樓的地板範圍不會讓一樓的人「浮」上去
    const arcade = P(3.3, -6.0)
    assert.deepEqual(groundAt(arcade, revival.collision, 0, 0), { level: 0, y: 0 })
    // 室內鏡頭只在二樓（或樓梯間）才算；騎樓上不算在咖啡館裡
    assert.equal(interiorAmount(arcade, revival.interiors, 0)?.zone.id === 'luguo-cafe' && interiorAmount(arcade, revival.interiors, 0).amount === 1, false)
    assert.equal(interiorAmount(arcade, revival.interiors, 1)?.amount, 1)
  })

  test('二樓的樓梯平台與店裡的牆邊不會掉下去或穿出去', () => {
    const { top, flight1 } = LUGUO_STAIRS
    // 樓梯平台往西（第一段樓梯的上方）：停在平台邊的欄杆
    const p = player(P(2.6, (flight1.minZ + flight1.maxZ) / 2).x, P(2.6, (flight1.minZ + flight1.maxZ) / 2).z, 1, H2)
    walkDirection(revival, p, { x: -1, z: 0 }, 40)
    assert.ok(p.level === 1 && p.y === H2, `樓層 ${p.level} y ${p.y}`)
    assert.ok(p.x >= P(top.minX - 0.1, 0).x + PLAYER.radius - 1e-6, `停在 x=${p.x.toFixed(2)}`)
    // 店裡往東（窗戶）、往南（迪化街側的窗）、往西（吧檯後面的木櫃）
    for (const [start, direction, check] of [
      [[1.0, -5.6], { x: 1, z: 0 }, (q) => q.x <= P(LUGUO_CAFE.maxX, 0).x - PLAYER.radius + 1e-6],
      [[0.6, -1.0], { x: 0, z: 1 }, (q) => q.z <= P(0, LUGUO_CAFE.maxZ).z - PLAYER.radius + 1e-6],
      [[-0.75, -2.0], { x: -1, z: 0 }, (q) => q.x >= P(LUGUO_CAFE.bar.counterX, 0).x],
    ]) {
      const q = player(P(...start).x, P(...start).z, 1, H2)
      walkDirection(revival, q, direction, 50)
      assert.ok(q.level === 1 && q.y === H2 && check(q), `從 (${start}) 往 ${JSON.stringify(direction)}：停在 (${q.x.toFixed(2)}, ${q.z.toFixed(2)})`)
    }
  })

  test('家具、吧檯、柱子與扭蛋機都不能穿越；走道、熱點與玻璃門可以站', () => {
    const blocking = CAFE_ITEMS.filter((item) => !['barGate'].includes(item.type))
    for (const item of blocking) {
      const p = P(item.x, item.z)
      assert.ok(!walkableAt(revival, p.x, p.z, 1), `${item.type} (${item.x}, ${item.z})`)
    }
    for (const [x, z, label] of [
      [3.05, -11.6, '玻璃門'],
      [3.05, -13.1, '樓梯平台'],
      [0.4, -6.0, '中央走道'],
      [0.4, -9.0, '中央走道'],
      [-0.75, -1.0, '吧檯前'],
    ]) {
      assert.ok(walkableAt(revival, P(x, z).x, P(x, z).z, 1), label)
    }
    for (const hotspot of LUGUO_HOTSPOTS) {
      const p = P(...hotspot.point)
      assert.ok(walkableAt(revival, p.x, p.z, hotspot.level), hotspot.id)
    }
  })

  test('在二樓或樓梯上換到其他年代：回到一樓，推到最近、可以走的街道上', () => {
    const modern = buildEraWorldSync('modern')
    for (const [x, z, level, y] of [
      [-0.75, -1.0, 1, H2],
      [1.4, -7.6, 1, H2],
      [3.05, -13.1, 1, H2],
      [0, -13.1, 0, 3],
      [3.3, -9.0, 0, 0],
    ]) {
      const p = player(P(x, z).x, P(x, z).z, level, y)
      // 與 Player 相同：新的年代沒有這個樓層時回到一樓，再推出、落到地面
      if (!hasLevel(modern.collision, p.level)) p.level = 0
      resolvePlayerPosition(p, PLAYER.radius, modern.collision, p.level)
      const ground = groundAt(p, modern.collision, p.level, p.y)
      assert.deepEqual(ground, { level: 0, y: 0 })
      assert.ok(walkableAt(modern, p.x, p.z), `推到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      assert.ok(p.z > ART_YARD.site.z - 1, `推到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    }
  })
})

describe('爐鍋咖啡：資訊熱點與介紹', () => {
  const placement = getShopPlacement(shop)

  test('五個熱點：小藝埕外觀、樓梯入口、窗邊座位、咖啡吧檯、紅色扭蛋機；各自對應一個章節', () => {
    assert.deepEqual(
      shop.hotspots.map((item) => item.id),
      ['art-yard', 'stairs', 'window', 'bar', 'gacha'],
    )
    const chapters = new Set(shop.chapters.map((chapter) => chapter.id))
    for (const hotspot of shop.hotspots) {
      assert.ok(chapters.has(hotspot.chapter), hotspot.id)
      assert.ok(hotspot.label && hotspot.note, hotspot.id)
    }
    assert.equal(placement.hotspots.length, 5)
    assert.equal(placement.level, 1)
    // 外觀與樓梯入口在一樓，店裡的三個在二樓
    assert.deepEqual(
      shop.hotspots.map((item) => item.level),
      [0, 0, 1, 1, 1],
    )
  })

  test('熱點的介紹鏡頭不在任何方塊裡，看得到熱點；店裡的鏡頭在天花板下', () => {
    for (const hotspot of placement.hotspots) {
      const cam = hotspot.camera.position
      assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `${hotspot.id}：${JSON.stringify(cam)}`)
      const at = hotspot.interactionPoint
      const y = hotspot.level === 1 ? H2 : 0
      assert.ok(!segmentBlocked(cam, { x: at.x, y: y + 1.2, z: at.z }, revival.blockers), `${hotspot.id} 看得到站的位置`)
      if (hotspot.level === 1) {
        assert.ok(cam.y > H2 + 0.5 && cam.y < ART_YARD.ceiling2 - 0.4, `${hotspot.id} y=${cam.y}`)
        assert.ok(cam.x > zone.minX && cam.x < zone.maxX && cam.z > P(0, LUGUO_CAFE.minZ).z && cam.z < zone.maxZ, `${hotspot.id} 在店裡`)
      }
    }
  })

  test('從店家名錄前往：站在二樓的吧檯前；介紹鏡頭在店裡', () => {
    const point = placement.interactionPoint
    const arrive = { x: point.x + placement.forward.x * 0.5, z: point.z + placement.forward.z * 0.5 }
    assert.ok(walkableAt(revival, arrive.x, arrive.z, 1))
    assert.deepEqual(groundAt(arrive, revival.collision, 1, null), { level: 1, y: H2 })
    const cam = placement.camera.position
    assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), JSON.stringify(cam))
    assert.ok(cam.y > H2 && cam.y < ART_YARD.ceiling2)
  })

  test('店家名錄與觀賞模式：熱點是可以點選的細部目標，鄰棟不屬於爐鍋咖啡', () => {
    const records = revival.buildings.filter((item) => item.storeId === 'luguo-cafe')
    assert.equal(records.find((item) => !item.detail).id, 'site-luguo-cafe')
    assert.deepEqual(
      records
        .filter((item) => item.detail)
        .map((item) => item.hotspot)
        .sort(),
      ['bar', 'gacha', 'stairs', 'window'],
    )
    for (const id of ['luguo-lane-brick', 'luguo-lane-end']) assert.equal(revival.buildings.find((item) => item.id === id).storeId, null, id)
  })
})

describe('爐鍋咖啡：熱點開啟對應的章節', () => {
  beforeEach(() => {
    resetStore('revival')
    useGameStore.setState({ viewMode: 'explore', activeShopId: null, activeHotspotId: null, nearbyHotspotId: null, chapterIndex: 0 })
  })
  const index = (id) => shop.chapters.findIndex((chapter) => chapter.id === id)

  test('靠近扭蛋機按 E：開啟「咖啡製作與飲食文化」；點窗邊座位：開啟「小藝埕」', () => {
    const store = useGameStore.getState()
    store.setNearbyShop('luguo-cafe', 'gacha')
    useGameStore.getState().interact()
    let state = useGameStore.getState()
    assert.equal(state.activeShopId, 'luguo-cafe')
    assert.equal(state.activeHotspotId, 'gacha')
    assert.equal(state.chapterIndex, index('coffee'))
    state.closeShop()
    assert.equal(useGameStore.getState().activeHotspotId, null)
    // 點到窗邊座位（觸控點物件）
    useGameStore.getState().interact('window')
    state = useGameStore.getState()
    assert.equal(state.activeHotspotId, 'window')
    assert.equal(state.chapterIndex, index('art-yard'))
  })

  test('從店家名錄開啟（沒有熱點）從第一章開始；進入觀賞模式時清除附近的熱點', () => {
    useGameStore.getState().openShop('luguo-cafe', null)
    assert.equal(useGameStore.getState().chapterIndex, 0)
    assert.equal(useGameStore.getState().activeHotspotId, null)
    useGameStore.getState().closeShop()
    useGameStore.getState().setNearbyShop('luguo-cafe', 'bar')
    assert.equal(useGameStore.getState().setViewMode('viewer'), true)
    assert.equal(useGameStore.getState().nearbyHotspotId, null)
    useGameStore.getState().setViewMode('explore')
  })
})

describe('爐鍋咖啡：鏡頭', () => {
  test('走近樓梯入口時逐漸切換成室內鏡頭；在樓梯間與二樓完全切換', () => {
    const { door } = LUGUO_STAIRS
    const dz = (door.minZ + door.maxZ) / 2
    const xs = [ART_YARD.half + 0.5, 3.6, 3.0, 2.6]
    const ramp = xs.map((x) => interiorAmount(P(x, dz), revival.interiors, 0)?.amount ?? 0)
    for (let i = 1; i < ramp.length; i++) assert.ok(ramp[i] >= ramp[i - 1], ramp.join(', '))
    assert.equal(interiorAmount(P(0, -13.1), revival.interiors, 0).amount, 1, '樓梯間')
    assert.equal(interiorAmount(P(0.4, -6.0), revival.interiors, 1).amount, 1, '店裡')
    assert.equal(interiorAmount(P(3.0, 1.0), revival.interiors, 0), null, '迪化街側的騎樓')
  })

  test('樓梯上、樓梯平台與店裡：各個方向的跟隨鏡頭都在天花板下、不在牆裡，看得到人物', () => {
    const spots = [
      [1.0, -14.52, 0, 0.375],
      [-0.6, -14.52, 0, 1.375],
      [-2.4, -14.0, 0, 2],
      [-2.3, -13.1, 0, 2],
      [-0.4, -13.1, 0, 2.75],
      [1.0, -13.1, 1, 3.625],
      [3.05, -13.1, 1, H2],
      [3.05, -11.6, 1, H2],
      [0.4, -6.0, 1, H2],
      [1.4, -7.6, 1, H2],
      [-0.75, -1.0, 1, H2],
      [-0.3, -10.95, 1, H2],
      [-1.0, -7.2, 1, H2],
    ]
    for (const [x, z, level, y] of spots) {
      const p = { ...P(x, z), level, y }
      const ground = groundAt(p, revival.collision, level, y)
      assert.ok(Math.abs(ground.y - y) < 0.05, `(${x}, ${z}) 高度 ${ground.y}`)
      for (const pitch of [CAMERA.pitch, 0.15, 0.7]) {
        for (let i = 0; i < 12; i++) {
          const cam = followCamera(revival, p, (i / 12) * Math.PI * 2, pitch)
          const where = `(${x}, ${z}) 樓層 ${level} pitch ${pitch} 方向 ${i}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`
          assert.equal(cam.k, 1, where)
          assert.ok(cam.y <= zone.camera.maxHeight + 1e-6, where)
          assert.ok(cam.y > y, where)
          assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
          assert.ok(!segmentBlocked(cam, cam.target, revival.blockers), where)
        }
      }
    }
  })

  test('32巷與巷子側的騎樓：跟隨鏡頭不會穿進牆、柱或鄰棟', () => {
    for (const [x, z] of [
      [3.3, -6.0],
      [3.3, -11.0],
      [3.95, -13.1],
      [7.0, -8.0],
      [7.0, -14.0],
    ]) {
      const p = { ...P(x, z), level: 0, y: 0 }
      assert.ok(walkableAt(revival, p.x, p.z), `(${x}, ${z}) 可以站`)
      for (let i = 0; i < 12; i++) {
        const cam = followCamera(revival, p, (i / 12) * Math.PI * 2)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `(${x}, ${z}) 方向 ${i}：(${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`)
      }
    }
  })
})

describe('爐鍋咖啡：建築觀賞模式（外觀、樓梯與店內）', () => {
  test('用 WASD 把注視點從巷子、騎樓、樓梯入口一路移上二樓、穿過玻璃門進到店裡：沿路不穿牆，最後在店裡', () => {
    const target = { ...P(6.5, -10.0), y: 2.0 }
    clampViewerTarget(target, revival.blockers, space)
    const path = [
      [5.0, -14.5],
      [1.8, -14.5],
      [-2.3, -14.5],
      [-2.3, -13.1],
      [2.4, -13.1],
      [3.05, -13.1],
      [3.05, -11.4],
      [0.4, -6.0],
    ]
    for (const [x, z] of path) {
      const goal = P(x, z)
      for (let i = 0; i < 400; i++) {
        const dx = goal.x - target.x
        const dz = goal.z - target.z
        const d = Math.hypot(dx, dz)
        if (d < 0.1) break
        target.x += (dx / d) * 0.1
        target.z += (dz / d) * 0.1
        clampViewerTarget(target, revival.blockers, space)
        assert.ok(!revival.blockers.some((box) => insideBox(target, box)), `往 (${x}, ${z})：(${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`)
      }
    }
    const end = P(0.4, -6.0)
    assert.ok(Math.hypot(target.x - end.x, target.z - end.z) < 0.2, `注視點到 (${target.x.toFixed(2)}, ${target.z.toFixed(2)})`)
    assert.ok(target.y > H2 + 0.5 && target.y < ART_YARD.ceiling2 - 0.5, `y=${target.y.toFixed(2)}`)
  })

  test('從街上把高處的注視點移進店裡的範圍：高度降到店裡（二樓地板與天花之間）', () => {
    const target = { ...P(0.4, -6.0), y: 14 }
    clampViewerTarget(target, revival.blockers, space)
    assert.ok(target.y >= H2 + 0.8 - 1e-6 && target.y <= H2 + 2.4 + 1e-6, `y=${target.y.toFixed(2)}`)
    // 站在一樓騎樓高度的注視點移進店裡：升到二樓
    const low = { ...P(0.4, -6.0), y: 1.5 }
    clampViewerTarget(low, revival.blockers, space)
    assert.ok(low.y >= H2 + 0.8 - 1e-6, `y=${low.y.toFixed(2)}`)
  })

  test('在店裡旋轉鏡頭：停在天花板下，不會鑽進牆、地板或家具；起始鏡頭在店裡', () => {
    for (const [x, z] of [
      [0.4, -6.0],
      [-0.75, -1.0],
      [1.4, -7.6],
      [-0.3, -10.6],
    ]) {
      const target = { ...P(x, z), y: H2 + 1.6 }
      for (const pitch of [-0.15, 0.16, 0.5, 0.9, 1.3]) {
        for (let i = 0; i < 8; i++) {
          const direction = orbitDirection((i / 8) * Math.PI * 2, pitch)
          const d = allowedDistance(target, direction, 8.5, revival.blockers, space)
          const cam = { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
          const where = `(${x}, ${z}) pitch ${pitch} 方向 ${i}：(${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`
          assert.ok(cam.y <= ART_YARD.ceiling2 - 0.4 + 1e-6 && cam.y >= H2, where)
          assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
        }
      }
      for (let i = 0; i < 8; i++) {
        const direction = orbitDirection((i / 8) * Math.PI * 2, 0.16)
        const d = Math.min(zone.viewerStart.distance, allowedDistance(target, direction, zone.viewerStart.distance, revival.blockers, space))
        const cam = { x: target.x + direction.x * d, z: target.z + direction.z * d }
        assert.ok(cam.x > zone.minX && cam.x < zone.maxX && cam.z > zone.minZ && cam.z < zone.maxZ, `起始鏡頭 (${x}, ${z}) 方向 ${i}`)
      }
    }
  })

  test('聚焦小藝埕：鏡頭在迪化街上看轉角塔樓；聚焦吧檯、窗邊與扭蛋機：鏡頭在店裡', () => {
    const facade = revival.buildings.find((item) => item.id === 'site-luguo-cafe')
    const plan = planBuildingFocus(facade, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
    const f = orbitDirection(plan.yaw, plan.pitch)
    const view = { x: plan.target.x + f.x * plan.distance, y: plan.target.y + f.y * plan.distance, z: plan.target.z + f.z * plan.distance }
    assert.ok(view.z > P(0, ART_YARD.front).z, JSON.stringify(view))
    assert.ok(!revival.blockers.some((box) => insideBox(view, box)))
    for (const id of ['luguo-bar', 'luguo-window', 'luguo-gacha']) {
      const record = revival.buildings.find((item) => item.id === id)
      const near = planBuildingFocus(record, revival.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space })
      const n = orbitDirection(near.yaw, near.pitch)
      const cam = { x: near.target.x + n.x * near.distance, y: near.target.y + n.y * near.distance, z: near.target.z + n.z * near.distance }
      assert.ok(cam.x > zone.minX && cam.x < zone.maxX && cam.z > P(0, LUGUO_CAFE.minZ).z && cam.z < zone.maxZ, `${id}：${JSON.stringify(cam)}`)
      assert.ok(cam.y > H2 && cam.y < ART_YARD.ceiling2, `${id} y=${cam.y}`)
      assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), id)
    }
  })
})

describe('爐鍋咖啡：室內按需載入與畫質', () => {
  test('室內只在接近時另外產生；細小的擺飾另外合併（流暢模式不顯示）；頂點數有上限', () => {
    const interior = buildEraInteriorSync('revival', zone.building)
    assert.ok(interior.batches.length > 6)
    assert.ok(interior.detailBatches.length > 0)
    const materials = new Set(interior.batches.map((batch) => batch.material))
    for (const material of ['terracotta', 'wood', 'steel', 'glassClear']) assert.ok(materials.has(material), material)
    for (const batch of [...interior.batches, ...interior.detailBatches]) {
      const box = batch.geometry.boundingBox
      assert.ok(box.min.x > zone.minX - 0.3 && box.max.x < zone.maxX + 0.3, batch.material)
      assert.ok(box.min.z > zone.minZ - 0.3 && box.max.z < zone.maxZ + 0.3, batch.material)
      assert.ok(box.min.y >= H2 - 0.05 && box.max.y <= ART_YARD.ceiling2 + 0.05, batch.material)
    }
    const verts = (batches) => batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(verts(interior.batches) < 90000, `室內頂點數 ${verts(interior.batches)}`)
    assert.ok(verts(interior.detailBatches) < 40000, `細部頂點數 ${verts(interior.detailBatches)}`)
    // 永樂市場的室內不包含爐鍋咖啡
    const market = revival.interiors.find((item) => item.id === 'yong-le-market')
    for (const batch of buildEraInteriorSync('revival', market.building).batches) assert.ok(batch.geometry.boundingBox.min.x > zone.maxX, batch.material)
    assert.ok(zone.loadRadius > 0 && zone.showRadius >= zone.loadRadius)
    assert.equal(QUALITY_MODES.smooth.detail, false)
    assert.equal(QUALITY_MODES.fine.detail, true)
  })
})

describe('爐鍋咖啡：介紹內容', () => {
  const textOf = (item) =>
    item.chapters
      .flatMap((chapter) => [
        chapter.title,
        chapter.lead,
        chapter.intro,
        chapter.note,
        ...(chapter.paragraphs ?? []),
        ...(chapter.timeline ?? []).flatMap((entry) => [entry.place, entry.text]),
        ...(chapter.facts ?? []).flatMap((fact) => [fact.label, fact.value]),
        ...(chapter.items ?? []).flatMap((food) => [food.name, food.description, food.note]),
      ])
      .filter(Boolean)
      .join('')

  test('五個章節：屈臣氏大藥房、小藝埕、爐鍋咖啡、咖啡製作、參考文獻', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => [chapter.title, chapter.type]),
      [
        ['第一章｜屈臣氏大藥房與歷史建築', 'text'],
        ['第二章｜小藝埕與老屋再利用', 'text'],
        ['第三章｜爐鍋咖啡的創立及進駐', 'text'],
        ['第四章｜咖啡製作與飲食文化', 'foods'],
        ['第五章｜參考文獻', 'sources'],
      ],
    )
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    const art = readFileSync(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of foods.items) assert.ok(art.includes(`'${item.id}':`) || art.includes(`  ${item.id}:`), item.id)
  })

  test('分開寫建築、品牌與進駐的年份：興建 1928（一說 1917）、小藝埕 2011、品牌 since 2004；進駐年份標明未能查證', () => {
    const text = textOf(shop)
    assert.match(text, /1928/)
    assert.match(text, /1917/)
    assert.match(text, /2011/)
    assert.match(text, /2004/)
    assert.match(shop.yearNote, /未能查證/)
    assert.match(text, /A\.S\. WATSON & CO\./)
  })

  test('不捏造經營資訊：沒有營業時間、價格或「首座／第一家」之類的說法', () => {
    const text = textOf(shop)
    assert.doesNotMatch(text, /營業時間[：:為是]|\d+\s*元|首座|第一家|全臺第一/)
    assert.match(text, /不列出營業時間、價格/)
  })

  test('引用的文獻都存在、都有網址', () => {
    const ids = new Set(shop.chapters.flatMap((chapter) => chapter.sourceIds ?? []))
    assert.ok(ids.size >= 12, `${ids.size} 筆`)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https?:\/\//, id)
    }
    assert.ok(ids.has('taipei-pictorial-watson') && ids.has('artyard-about'))
  })
})
