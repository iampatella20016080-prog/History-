import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 寶順洋行與李春生：茶葉外銷起點的文化據點，只在「港口商街」出現；其他年代這塊地段是一般街屋。
 */
const SHOP_ID = 'dodd-tea-house'
const shop = getShop(SHOP_ID)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function chapterText(chapter) {
  return [chapter.lead, chapter.intro, ...(chapter.paragraphs ?? [])].filter(Boolean).join('')
}

describe('寶順洋行與李春生：店家資料', () => {
  test('文化據點，只出現在「港口商街」', () => {
    assert.equal(shop.kind, 'heritage')
    assert.equal(shop.status, 'open')
    assert.deepEqual(Object.keys(shop.buildingByEra), ['qing-port'])
    assert.deepEqual(Object.keys(shop.eraNotes), ['qing-port'])
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(SHOP_ID), era.id === 'qing-port', era.id)
    }
  })

  test('六個章節：文字、器物（第 10 階段的茶箱）與文獻，沒有食物圖鑑；每一章都有出處', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => chapter.type),
      ['text', 'text', 'text', 'text', 'object', 'sources'],
    )
    for (const chapter of shop.chapters) {
      assert.ok(chapter.sourceIds?.length, chapter.tab)
      for (const id of chapter.sourceIds) {
        const source = getSource(id)
        assert.ok(source, `${chapter.tab} 引用的 ${id} 不存在`)
        assert.match(source.url, /^https?:\/\//, id)
      }
    }
    const cited = new Set(shop.chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
    const listed = new Set(shop.chapters.at(-1).sourceIds)
    for (const id of cited) assert.ok(listed.has(id), `文獻章漏列 ${id}`)
  })

  test('年份有多種說法的地方並列，不寫「首富」、運量只寫約數', () => {
    assert.match(shop.yearNote, /1865/)
    assert.match(shop.yearNote, /1869/)
    const text = shop.chapters.map(chapterText).join('') + shop.eraNotes['qing-port']
    assert.doesNotMatch(text, /首富/)
    assert.doesNotMatch(text, /2131|2,131/)
    assert.match(text, /約十三萬公斤/)
    // 紀念教會採「後代所建」
    assert.match(text, /孫輩在貴德街44號建李春生紀念教會/)
    // 洋樓是情境示意
    assert.match(shop.note, /情境示意/)
    assert.match(shop.eraNotes['qing-port'], /情境示意/)
  })
})

describe('寶順洋行與李春生：地段與街景', () => {
  test('不改變五個年代共用的地段切分：只在港口商街取代 north-5，沒有新的店面地段', () => {
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => item.storeId === SHOP_ID))
    const lot = lots.find((item) => item.id === 'north-5')
    assert.ok(lot)
    // 洋樓的位置與面寬和被取代的地段一致，不和兩旁的林復振、有記重疊
    assert.ok(Math.abs(lot.x - shop.site.x) < 1e-6)
    assert.ok(Math.abs(lot.width - shop.building.width) < 0.05)
    assert.deepEqual(shop.site.replaces, ['north-5'])
    // 地段編號不變（南側從 south-13 開始）
    assert.ok(lots.some((item) => item.id === 'south-13'))
    assert.ok(!lots.some((item) => item.id === 'south-19'))
  })

  test('只有「港口商街」有洋行的建築；其他四個年代這塊地段是沒有店家的街屋', () => {
    for (const era of ERAS) {
      const building = worlds[era.id].buildings.find((item) => item.storeId === SHOP_ID)
      assert.equal(!!building, era.id === 'qing-port', era.id)
    }
  })

  test('洋行不和鄰近的建築重疊', () => {
    const world = worlds['qing-port']
    const self = world.buildings.find((item) => item.storeId === SHOP_ID)
    const box = self.bounds ?? self.box ?? null
    if (!box) return
    for (const other of world.buildings) {
      if (other === self) continue
      const ob = other.bounds ?? other.box
      if (!ob) continue
      const overlap = box.minX < ob.maxX - 0.05 && box.maxX > ob.minX + 0.05 && box.minZ < ob.maxZ - 0.05 && box.maxZ > ob.minZ + 0.05
      assert.ok(!overlap, `與 ${other.storeId ?? other.id ?? '建築'} 重疊`)
    }
  })
})

describe('寶順洋行與李春生：互動與鏡頭', () => {
  const placement = getShopPlacement(shop)
  const world = worlds['qing-port']

  test('互動位置在店門前的街道上，左右各一步都走得到', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(world, point.x, point.z))
    for (const side of [-0.6, 0.6]) {
      const p = point.clone().addScaledVector(placement.right, side)
      assert.ok(walkableAt(world, p.x, p.z), `旁 ${side} m`)
    }
  })

  test('介紹鏡頭在路面上、不在任何方塊裡，視線沒有被擋住', () => {
    const cam = placement.camera.position
    const target = placement.camera.target
    for (const box of world.collision.obstacles) assert.ok(!insideBox(cam, box, 0.2))
    assert.ok(walkableAt(world, cam.x, cam.z))
    for (let t = 0.1; t < 0.75; t += 0.1) {
      const p = cam.clone().lerp(target, t)
      for (const box of world.collision.obstacles) assert.ok(!insideBox(p, box), `視線在 ${t} 被擋住`)
    }
  })
})
