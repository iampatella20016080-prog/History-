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
 * 乾元藥行：迪化街百年藥行的文化據點，只在「酒樓繁華」出現；
 * 同一塊地段（north-6）在港口商街是城隍廟、老屋新生是永樂米苔目，各在自己的年代取代。
 */
const SHOP_ID = 'qian-yuan-yao-hang'
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

function allText() {
  return (
    shop.chapters.map(chapterText).join('') +
    shop.chapters.flatMap((c) => [...(c.timeline ?? []), ...(c.facts ?? [])].map((i) => i.text ?? i.value)).join('') +
    shop.summary +
    shop.note +
    shop.eraNotes.banquet
  )
}

describe('乾元藥行：店家資料', () => {
  test('文化據點（中藥行不屬於飲食圖鑑），只出現在「酒樓繁華」，沒有食物圖鑑', () => {
    assert.equal(shop.kind, 'heritage')
    assert.equal(shop.status, 'open')
    assert.deepEqual(Object.keys(shop.buildingByEra), ['banquet'])
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(SHOP_ID), era.id === 'banquet', era.id)
    }
    assert.ok(!shop.chapters.some((chapter) => chapter.type === 'foods'))
  })

  test('四個章節都是文字與文獻；每一章都有存在的出處，文獻章列出所有引用', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => chapter.type),
      ['text', 'text', 'text', 'sources'],
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

  test('創立年份兩說並列；創辦人張清河；單一來源標示；建築標「歷史情境重建」', () => {
    assert.match(shop.yearLabel, /1896/)
    assert.match(shop.yearLabel, /1875/)
    assert.match(shop.yearNote, /臺灣日日新報/)
    const text = allText()
    assert.match(text, /張清河/)
    assert.match(text, /一說1875/)
    assert.match(text, /單一來源/)
    assert.match(text, /歷史情境重建/)
    assert.match(shop.note, /歷史情境重建/)
    // 建築年代與登錄不寫成事實；與林復振不寫成隸屬關係
    assert.doesNotMatch(text, /興建於|建於\d{4}|登錄為歷史建築|指定為古蹟/)
    assert.doesNotMatch(text, /隸屬|分號|林復振的/)
    assert.match(text, /各自經營/)
    // 門牌標示未核實
    assert.match(shop.note, /未核實/)
  })
})

describe('乾元藥行：地段與街景', () => {
  test('不改變五個年代共用的地段切分：只在酒樓繁華取代 north-6，面寬與地段一致', () => {
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => item.storeId === SHOP_ID))
    const lot = lots.find((item) => item.id === 'north-6')
    assert.ok(lot)
    assert.ok(Math.abs(lot.x - shop.site.x) < 1e-6)
    assert.ok(Math.abs(lot.width - shop.building.width) < 0.05)
    assert.deepEqual(shop.site.replaces, ['north-6'])
    assert.ok(lots.some((item) => item.id === 'south-13'))
    assert.ok(!lots.some((item) => item.id === 'south-19'))
  })

  test('只有「酒樓繁華」有乾元藥行；其他年代這塊地段維持原樣', () => {
    for (const era of ERAS) {
      const building = worlds[era.id].buildings.find((item) => item.storeId === SHOP_ID)
      assert.equal(!!building, era.id === 'banquet', era.id)
    }
    // 港口商街這塊地是城隍廟、老屋新生是永樂米苔目；摩登與庶民生活是一般街屋（north-6 還在）
    assert.ok(worlds['qing-port'].buildings.find((item) => item.storeId === 'xia-hai-cheng-huang'))
    assert.ok(worlds.revival.buildings.find((item) => item.storeId === 'yong-le-mi-tai-mu'))
    for (const eraId of ['modern', 'postwar']) {
      assert.ok(worlds[eraId].buildings.find((item) => item.id === 'north-6'), eraId)
    }
  })

  test('藥行不和鄰近的建築重疊', () => {
    const world = worlds.banquet
    const self = world.buildings.find((item) => item.storeId === SHOP_ID)
    const halfW = shop.building.width / 2
    for (const other of world.buildings) {
      if (other === self) continue
      if (!Number.isFinite(other.x) || !Number.isFinite(other.config?.width)) continue
      if (Math.abs(other.z - self.z) > 6) continue
      const otherHalf = other.config.width / 2
      const gap = Math.abs(other.x - self.x) - halfW - otherHalf
      assert.ok(gap > -0.05, `與 ${other.storeId ?? other.id}（x=${other.x}）重疊：間距 ${gap.toFixed(2)}`)
    }
  })
})

describe('乾元藥行：互動與鏡頭', () => {
  const placement = getShopPlacement(shop)
  const world = worlds.banquet

  test('互動位置在店門前的街道上，多種步長左右來回都走得到', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(world, point.x, point.z))
    for (const step of [0.12, 0.21, 0.45, 0.6]) {
      for (const side of [-1, 1]) {
        const p = point.clone()
        for (let i = 0; i < 4; i++) {
          p.addScaledVector(placement.right, side * step)
          const q = { x: p.x, z: p.z }
          resolvePlayerPosition(q, PLAYER.radius, world.collision)
          assert.ok(Math.hypot(q.x - p.x, q.z - p.z) < 0.5, `步長 ${step} 側 ${side}`)
          p.set(q.x, p.y, q.z)
        }
      }
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
