import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 茶的主線：林華泰茶行、有記名茶、新芳春茶行開放探索。
 * 建築早就在街上，這一階段只補章節與文獻，所以檢查：店家資料與文獻、各年代的建築不變、互動位置與介紹鏡頭都在街上。
 */
const TEA_SHOPS = {
  'lin-hua-tai': { eras: ['qing-port', 'banquet', 'modern', 'postwar', 'revival'], year: 1883 },
  'you-ji': { eras: ['banquet', 'modern', 'postwar', 'revival'], year: 1890 },
  'xin-fang-chun': { eras: ['modern', 'postwar', 'revival'], year: 1934 },
}

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
  return [chapter.lead, chapter.intro, ...(chapter.paragraphs ?? []), ...(chapter.items ?? []).map((item) => `${item.description}${item.note ?? ''}`)]
    .filter(Boolean)
    .join('')
}

describe('茶的主線：店家資料', () => {
  for (const [id, spec] of Object.entries(TEA_SHOPS)) {
    const shop = getShop(id)

    test(`${shop.name}：已開放，出現在 ${spec.eras.length} 個年代，其他年代沒有`, () => {
      assert.equal(shop.status, 'open')
      assert.equal(shop.year, spec.year)
      assert.deepEqual(Object.keys(shop.buildingByEra), spec.eras)
      for (const era of ERAS) {
        assert.equal(era.availableStores.includes(id), spec.eras.includes(era.id), `${era.id} 的店家名錄`)
      }
      // 每個出現的年代都有「此時期的店家」說明
      assert.deepEqual(Object.keys(shop.eraNotes), spec.eras)
    })

    test(`${shop.name}：五個章節，最後一章是文獻；每一章都有出處`, () => {
      assert.equal(shop.chapters.length, 5)
      assert.deepEqual(
        shop.chapters.map((chapter) => chapter.type),
        ['text', 'text', 'text', 'foods', 'sources'],
      )
      for (const chapter of shop.chapters) {
        assert.ok(chapter.sourceIds?.length, `${chapter.tab} 沒有出處`)
        for (const sourceId of chapter.sourceIds) {
          const source = getSource(sourceId)
          assert.ok(source, `${chapter.tab} 引用的 ${sourceId} 不存在`)
          assert.match(source.url, /^https?:\/\//, sourceId)
          assert.ok(source.citation, sourceId)
        }
      }
      // 文獻章列出所有章節引用的來源
      const cited = new Set(shop.chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
      const listed = new Set(shop.chapters.at(-1).sourceIds)
      for (const sourceId of cited) assert.ok(listed.has(sourceId), `文獻章漏列 ${sourceId}`)
    })

    test(`${shop.name}：食物圖鑑的每一項都有名稱、分類與說明`, () => {
      const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
      assert.ok(foods.items.length >= 3)
      for (const item of foods.items) {
        assert.ok(item.id && item.name && item.category && item.description, item.name)
      }
      assert.ok(foods.footnote, '要說明品名的來源與界線')
    })
  }

  test('有記名茶：不寫成古蹟（官方查無登錄）；年份標示廈門創立與來臺', () => {
    const shop = getShop('you-ji')
    for (const chapter of shop.chapters.filter((item) => item.type !== 'sources')) {
      assert.doesNotMatch(chapterText(chapter), /市定古蹟|歷史建築/, chapter.tab)
    }
    assert.match(shop.yearLabel, /1890/)
    assert.match(shop.yearLabel, /1907/)
    assert.match(shop.eraNotes.banquet, /廈門/)
    assert.match(shop.eraNotes.postwar, /1949/)
  })

  test('林華泰茶行：家族回憶標為「家族口述」；創辦人不寫成事實', () => {
    const shop = getShop('lin-hua-tai')
    const history = shop.chapters.find((chapter) => chapter.id === 'history')
    assert.equal(history.summary.label, '家族口述')
    assert.ok(history.facts.some((fact) => fact.label === '創辦人' && /未載/.test(fact.value)))
    assert.match(shop.eraNotes.modern, /家族口述/)
    assert.match(shop.eraNotes.postwar, /家族口述/)
  })

  test('新芳春茶行：落成年份與創立年份分開標示；停止製茶的時間並列出處', () => {
    const shop = getShop('xin-fang-chun')
    assert.match(shop.yearLabel, /1934年落成/)
    assert.match(shop.yearNote, /1918|1919/)
    assert.ok(shop.sourceIds.includes('nchdb-xinfangchun'))
    const history = shop.chapters.find((chapter) => chapter.id === 'history')
    assert.ok(history.facts.some((fact) => fact.label === '茶行創立' && /1918/.test(fact.value) && /1919/.test(fact.value)))
    const museum = shop.chapters.find((chapter) => chapter.id === 'museum')
    assert.match(chapterText(museum), /逐漸停歇/)
    assert.match(shop.eraNotes.postwar, /各來源不一/)
  })

  test('茶的主線：三家都不用「首富」、不寫未查證的店名由來', () => {
    for (const id of Object.keys(TEA_SHOPS)) {
      const shop = getShop(id)
      const text = shop.chapters.map(chapterText).join('') + Object.values(shop.eraNotes).join('')
      assert.doesNotMatch(text, /首富/, id)
      assert.doesNotMatch(text, /店名由來|取名自/, id)
    }
  })
})

describe('茶的主線：街景不變', () => {
  for (const [id, spec] of Object.entries(TEA_SHOPS)) {
    const shop = getShop(id)
    test(`${shop.name}：在出現的年代有建築，其他年代沒有`, () => {
      for (const era of ERAS) {
        const building = worlds[era.id].buildings.find((item) => item.storeId === id)
        assert.equal(!!building, spec.eras.includes(era.id), `${era.id}`)
      }
    })
  }

  test('開放三家茶行沒有改變五個年代的建築數量（建築資料不看 status）', () => {
    // 建築數量與其他年代測試（banquet／modern）的期望一致：這裡只確認同一個年代重建兩次結果相同
    for (const era of ERAS) {
      const again = buildEraWorldSync(era.id)
      assert.equal(again.buildings.length, worlds[era.id].buildings.length, era.id)
      assert.equal(again.collision.obstacles.length, worlds[era.id].collision.obstacles.length, era.id)
      assert.equal(again.collision.walkable.length, worlds[era.id].collision.walkable.length, era.id)
    }
  })
})

describe('茶的主線：互動位置與介紹鏡頭', () => {
  for (const [id, spec] of Object.entries(TEA_SHOPS)) {
    const shop = getShop(id)
    const placement = getShopPlacement(shop)

    test(`${shop.name}：互動位置在店門前的街道上，每個年代都走得到`, () => {
      for (const eraId of spec.eras) {
        const world = worlds[eraId]
        const point = placement.interactionPoint
        assert.ok(walkableAt(world, point.x, point.z), `${eraId} 的互動位置被擋住`)
        // 互動位置的左右各一步也走得到（人物不會被卡在提示的範圍邊緣）
        for (const side of [-0.6, 0.6]) {
          const p = point.clone().addScaledVector(placement.right, side)
          assert.ok(walkableAt(world, p.x, p.z), `${eraId}：互動位置旁 ${side} m 被擋住`)
        }
      }
    })

    test(`${shop.name}：介紹鏡頭在街道上、不在任何方塊裡，而且看得到店面`, () => {
      const cam = placement.camera.position
      const target = placement.camera.target
      for (const eraId of spec.eras) {
        const world = worlds[eraId]
        for (const box of world.collision.obstacles) {
          assert.ok(!insideBox(cam, box, 0.2), `${eraId}：鏡頭在方塊裡 ${JSON.stringify(box)}`)
        }
        assert.ok(walkableAt(world, cam.x, cam.z), `${eraId}：鏡頭的位置不在可行走的街道上`)
        // 鏡頭與注視點之間（街道上的這一段）沒有方塊擋住
        for (let t = 0.1; t < 0.75; t += 0.1) {
          const p = cam.clone().lerp(target, t)
          for (const box of world.collision.obstacles) {
            assert.ok(!insideBox(p, box), `${eraId}：視線在 ${t} 處被方塊擋住`)
          }
        }
      }
      // 鏡頭看著店面：注視點在立面附近、鏡頭離地有高度
      assert.ok(cam.y >= 3.5 && cam.y <= 6)
      assert.ok(target.y >= 2.5 && target.y <= 5)
    })
  }
})
