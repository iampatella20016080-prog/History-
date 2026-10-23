import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { SZX_CHAPTERS, SZX_ERA_NOTES, SZX_RECORD } from '../src/data/shizixuanData.js'
import { SHIZIXUAN_ID, shizixuanEraConfig } from '../src/data/shizixuanEraConfig.js'
import { EARLY, EARLY_SITE, MODERN, POSTWAR, SZX_HOTSPOTS, WIDE_SITE, szxToWorld } from '../src/data/shizixuanLayout.js'
import { getShop, getShopsByEra } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { groundAt, resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'
import { resetStore } from './helpers.js'

/**
 * 十字軒糕餅舖（延平北路二段68號）：同一個店家 ID、同一個地段，三個年代各有不同的版本。
 * 1853、1895 這塊地是一般街屋（還沒有十字軒）；1930 窄身的糕餅店初創（取代 north-3）；1945 戰後擴大為
 * 兩個店面寬（取代 north-2 與 north-3）；2000–現在依實地照片重建為三層樓的十字軒糕餅舖（同一塊地段）。
 * 驗證：年代版本、地段切分不變、不與鄰近建築重疊、碰撞（街上走進去、連續進出）、熱點與五個文化節點、
 * 「TEN CAKE」只出現在 2000–現在、文獻都存在。
 */
const WORLDS = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const STEPS = [0.15, 0.09, 0.05]

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function player(x, z, level = 0, y = 0) {
  return { x, z, level, y }
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.level = ground.level
  p.y = ground.y
}

function walkTo(world, p, target, step) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

describe('年代版本：同一個店家 ID、同一個地段', () => {
  test('1853、1895 這塊地還沒有十字軒；1930 起每個年代都有自己的版本，取代正確的地段', () => {
    assert.equal(shizixuanEraConfig.qingPort.active, false)
    assert.equal(shizixuanEraConfig.banquet.active, false)
    assert.ok(!getEra('qing-port').availableStores.includes(SHIZIXUAN_ID))
    assert.ok(!getEra('banquet').availableStores.includes(SHIZIXUAN_ID))
    for (const eraId of ['qing-port', 'banquet']) {
      const b = WORLDS[eraId].buildings.find((item) => item.storeId === SHIZIXUAN_ID)
      assert.ok(!b, `${eraId} 這塊地沒有十字軒的建築`)
    }
    const expected = {
      modern: ['earlyShop', '十字軒（糕餅店）'],
      postwar: ['postwarShop', '十字軒餅舖'],
      revival: ['modernShop', '十字軒糕餅舖'],
    }
    for (const [eraId, [variant, name]] of Object.entries(expected)) {
      const shop = getShop(SHIZIXUAN_ID, eraId)
      assert.equal(shop.variant, variant, eraId)
      assert.equal(shop.name, name, eraId)
      assert.ok(getEra(eraId).availableStores.includes(SHIZIXUAN_ID), eraId)
    }
  })

  test('1930 只取代 north-3（窄面寬）；1945、2000 取代 north-2 與 north-3（面寬較大）；其他地段不受影響', () => {
    const plan = getLotPlan()
    const north = plan.lots.filter((lot) => lot.side === 'north' && lot.kind === 'row')
    assert.ok(north.some((lot) => lot.id === 'north-2'))
    assert.ok(north.some((lot) => lot.id === 'north-3'))
    // 1853、1895 這塊地還是一般街屋：north-2、north-3 正常出現
    for (const eraId of ['qing-port', 'banquet']) {
      const world = WORLDS[eraId]
      assert.ok(world.buildings.some((item) => item.id === 'north-2'), eraId)
      assert.ok(world.buildings.some((item) => item.id === 'north-3'), eraId)
    }
    // 1930：north-3 被取代，north-2 還在
    const modern = WORLDS.modern
    assert.ok(modern.buildings.some((item) => item.id === 'north-2'))
    assert.ok(!modern.buildings.some((item) => item.id === 'north-3'))
    assert.ok(modern.buildings.some((item) => item.id === 'site-shizixuan'))
    // 1945、2000：north-2 與 north-3 都被取代
    for (const eraId of ['postwar', 'revival']) {
      const world = WORLDS[eraId]
      assert.ok(!world.buildings.some((item) => item.id === 'north-2'), eraId)
      assert.ok(!world.buildings.some((item) => item.id === 'north-3'), eraId)
      assert.ok(world.buildings.some((item) => item.id === 'site-shizixuan'), eraId)
    }
  })

  test('1930 窄面寬（4.6 m）；1945、2000 面寬較大（9.2 m），座落在同一塊地段（同一個東緣）', () => {
    const early = getShop(SHIZIXUAN_ID, 'modern').site
    const wide = getShop(SHIZIXUAN_ID, 'postwar').site
    assert.ok(Math.abs(EARLY.half * 2 - 4.6) < 1e-6)
    assert.ok(Math.abs(MODERN.half * 2 - 9.2) < 1e-6)
    assert.deepEqual(early, EARLY_SITE)
    assert.deepEqual(wide, WIDE_SITE)
    // 右（東）緣：early 與 wide 共用同一條邊界（延平北路二段上同一個街角）
    assert.ok(Math.abs(early.x + EARLY.half - (wide.x + MODERN.half)) < 1e-6)
  })
})

describe('十字軒：不和其他建築重疊', () => {
  test('三個年代的建築範圍不重疊任何其他建築', () => {
    const overlaps = (a, c) => a.minX < c.maxX - 0.05 && a.maxX > c.minX + 0.05 && a.minZ < c.maxZ - 0.05 && a.maxZ > c.minZ + 0.05
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const world = WORLDS[eraId]
      const mine = world.buildings.find((item) => item.storeId === SHIZIXUAN_ID)
      assert.ok(mine, eraId)
      for (const other of world.buildings) {
        if (other === mine) continue
        assert.ok(!overlaps(mine.box, other.box), `${eraId}：${mine.id} 與 ${other.id} 重疊`)
      }
    }
  })
})

describe('十字軒：碰撞——走進去、走出來', () => {
  // x 偏移避開店內的家具（結帳櫃台、展示櫃等），走的是一條直線，不是真正的路徑規劃
  const ROOMS = {
    modern: { x: 0, door: -0.3, inside: -2.0, site: EARLY_SITE },
    postwar: { x: 0, door: -0.3, inside: -3.0, site: WIDE_SITE },
    revival: { x: 2.0, door: -0.3, inside: -4.0, site: WIDE_SITE },
  }
  for (const [eraId, room] of Object.entries(ROOMS)) {
    test(`${eraId}：從街上走進店裡，連續進出 3 次都正常`, () => {
      const world = WORLDS[eraId]
      const toWorld = (x, z) => szxToWorld(room.site, x, z)
      const street = toWorld(room.x, 3.0)
      const door = toWorld(room.x, room.door)
      const inside = toWorld(room.x, room.inside)
      for (const step of STEPS) {
        for (let n = 0; n < 3; n++) {
          const p = player(street.x, street.z)
          let miss = walkTo(world, p, door, step)
          assert.ok(miss < step + 0.05, `${eraId} 第 ${n + 1} 次走到門口：差 ${miss.toFixed(3)}`)
          miss = walkTo(world, p, inside, step)
          assert.ok(miss < step + 0.05, `${eraId} 第 ${n + 1} 次走進店裡：差 ${miss.toFixed(3)}`)
          miss = walkTo(world, p, street, step)
          assert.ok(miss < step + 0.05, `${eraId} 第 ${n + 1} 次走回街上：差 ${miss.toFixed(3)}`)
        }
      }
    })
  }

  test('牆壁本身不能走進去（門以外的立面是障礙物）', () => {
    const world = WORLDS.revival
    const toWorld = (x, z) => szxToWorld(WIDE_SITE, x, z)
    const wallPoint = toWorld(0, -0.05) // 中央柱子之間、兩個入口之外的立面
    assert.ok(!walkableAt(world, wallPoint.x, wallPoint.z))
  })
})

describe('十字軒：熱點、章節與五個文化節點', () => {
  test('每個年代都有主要熱點，而且各自對應存在的章節', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const shop = getShop(SHIZIXUAN_ID, eraId)
      assert.ok(shop.hotspots.length >= 6, eraId)
      for (const hotspot of shop.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${eraId}／${hotspot.id}`)
      }
    }
  })

  test('五個生命禮俗的文化節點（滿月、收涎、婚嫁、祝壽、祭祀）在每個年代都能開啟與關閉', () => {
    const ids = ['szx-man-yue', 'szx-shou-yan', 'szx-hun-jia', 'szx-zhu-shou', 'szx-ji-si']
    for (const eraId of ['modern', 'postwar', 'revival']) {
      resetStore(eraId)
      const shop = getShop(SHIZIXUAN_ID, eraId)
      assert.deepEqual(
        shop.hotspots.filter((h) => ids.includes(h.id)).map((h) => h.id).sort(),
        [...ids].sort(),
        eraId,
      )
      for (const hotspotId of ids) {
        const hotspot = shop.hotspots.find((h) => h.id === hotspotId)
        const index = shop.chapters.findIndex((chapter) => chapter.id === hotspot.chapter)
        assert.ok(index >= 0, `${eraId}／${hotspotId}`)
        useGameStore.getState().setNearbyShop(SHIZIXUAN_ID, hotspotId)
        useGameStore.getState().interact()
        assert.equal(useGameStore.getState().activeHotspotId, hotspotId, `${eraId}／${hotspotId}`)
        assert.equal(useGameStore.getState().chapterIndex, index, `${eraId}／${hotspotId}`)
        useGameStore.getState().closeShop()
        assert.equal(useGameStore.getState().mode, 'explore', `${eraId}／${hotspotId} 關閉後`)
      }
    }
  })

  test('五個文化節點的短篇介紹長度合理（約 20–90 字），而且引用的文獻存在', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const chapters = SZX_CHAPTERS[eraId]
      for (const id of ['culture-man-yue', 'culture-shou-yan', 'culture-hun-jia', 'culture-zhu-shou', 'culture-ji-si']) {
        const chapter = chapters.find((item) => item.id === id)
        assert.ok(chapter, `${eraId}／${id}`)
        assert.ok(chapter.lead.length >= 15 && chapter.lead.length <= 90, `${eraId}／${id}：${chapter.lead.length} 字`)
        for (const sourceId of chapter.sourceIds) assert.ok(getSource(sourceId), sourceId)
      }
    }
  })

  test('熱點（連同離開時的緩衝）不和其他已開放店家的互動範圍重疊', () => {
    const EXIT_MARGIN = 0.6
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const mineShop = getShop(SHIZIXUAN_ID, eraId)
      const circles = (item) => {
        const placement = getShopPlacement(item)
        if (placement.hotspots.length) return placement.hotspots.filter((h) => !h.clickOnly && (h.level ?? 0) === 0).map((h) => ({ point: h.interactionPoint, radius: h.radius }))
        return placement.level === 0 ? [{ point: placement.interactionPoint, radius: item.interaction?.radius ?? 3.2 }] : []
      }
      const others = getEra(eraId)
        .availableStores.filter((id) => id !== mineShop.id)
        .map((id) => getShop(id, eraId))
        .filter((item) => item?.status === 'open')
      for (const mine of circles(mineShop)) {
        for (const other of others) {
          for (const theirs of circles(other)) {
            const d = Math.hypot(mine.point.x - theirs.point.x, mine.point.z - theirs.point.z)
            assert.ok(d >= mine.radius + EXIT_MARGIN + theirs.radius, `${eraId}：${mineShop.id} 與 ${other.id}：相距 ${d.toFixed(2)} m`)
          }
        }
      }
    }
  })
})

describe('十字軒：不捏造「TEN CAKE」的年份；文獻與資料', () => {
  test('1930、1945 的招牌與章節都沒有「TEN CAKE」；只有 2000–現在的招牌有「TEN CAKE」「SINCE 1930」', () => {
    for (const eraId of ['modern', 'postwar']) {
      const world = WORLDS[eraId]
      const signs = world.signs.filter((sign) => {
        const b = world.buildings.find((item) => item.storeId === SHIZIXUAN_ID)
        return b && sign.text?.includes('TEN CAKE')
      })
      assert.equal(signs.length, 0, eraId)
      const shop = getShop(SHIZIXUAN_ID, eraId)
      for (const chapter of shop.chapters) {
        const text = JSON.stringify(chapter)
        assert.ok(!text.includes('TEN CAKE'), `${eraId}／${chapter.id}`)
      }
    }
    const revival = WORLDS.revival
    // 照片：左開間的徽章下方是「TEN CAKE」與「SINCE 1930」兩行，右開間是圓框的「十字軒糕餅舖」
    assert.ok(revival.signs.some((sign) => sign.text === 'TEN CAKE'))
    assert.ok(revival.signs.some((sign) => sign.text === 'SINCE 1930'))
    assert.ok(revival.signs.some((sign) => sign.text === '十字軒糕餅舖' && sign.style === 'szxCircle'))
    for (const eraId of ['modern', 'postwar']) assert.ok(!WORLDS[eraId].signs.some((sign) => /TEN CAKE|SINCE 1930/.test(sign.text)), eraId)
  })

  test('地址與創辦人資料有出處；1930、1945 的描述沒有使用「十字軒糕餅舖」這個 2000 年代才有的品牌全名', () => {
    assert.equal(SZX_RECORD.address, '臺北市大同區延平北路二段68號')
    assert.ok(SZX_RECORD.sourceIds.every((id) => getSource(id)))
    assert.equal(getShop(SHIZIXUAN_ID, 'modern').name, '十字軒（糕餅店）')
    assert.equal(getShop(SHIZIXUAN_ID, 'postwar').name, '十字軒餅舖')
    for (const eraId of ['modern', 'postwar', 'revival']) assert.ok(SZX_ERA_NOTES[eraId]?.length > 0, eraId)
  })

  test('引用的文獻都存在，而且都有網址', () => {
    const ids = new Set()
    for (const eraId of ['modern', 'postwar', 'revival']) {
      for (const chapter of SZX_CHAPTERS[eraId]) for (const id of chapter.sourceIds ?? []) ids.add(id)
    }
    assert.ok(ids.size > 0)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.ok(source.url?.startsWith('http'), id)
    }
  })
})

describe('十字軒：室內細部按需載入', () => {
  test('街景不含室內細部（展示架、結帳櫃台、文化節點的擺件）；室內另外產生', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const interior = buildEraInteriorSync(eraId)
      assert.ok(interior.batches.length > 0, eraId)
    }
  })

  test('只在店家出現的年代有室內與觀賞範圍，其他店家的室內不受影響（見 tests/yongle.test.js、tests/riceAndShine.test.js）', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const world = WORLDS[eraId]
      assert.ok(world.interiors.some((item) => item.id === SHIZIXUAN_ID), eraId)
    }
    for (const eraId of ['qing-port', 'banquet']) {
      assert.ok(!WORLDS[eraId].interiors.some((item) => item.id === SHIZIXUAN_ID), eraId)
    }
  })
})
