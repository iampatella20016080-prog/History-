import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 摩登大稻埕：波麗路開放探索。
 * 建築早就在街上，這一階段只補章節與文獻，所以檢查：店家資料與文獻、年份與門牌的寫法、各年代的建築不變、互動位置與介紹鏡頭都在街上。
 * 山水亭與維特咖啡資料不足，只在背景章提到，不能成為店家。
 */
const BOLERO_ERAS = ['modern', 'postwar', 'revival']
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const shop = getShop('bolero')

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function chapterText(chapter) {
  return [chapter.lead, chapter.intro, ...(chapter.paragraphs ?? []), ...(chapter.items ?? []).map((item) => `${item.description}${item.note ?? ''}`), ...(chapter.facts ?? []).map((f) => f.value)]
    .filter(Boolean)
    .join('')
}

describe('波麗路：店家資料', () => {
  test('已開放，出現在摩登、庶民生活、老屋新生三個年代，其他年代沒有', () => {
    assert.equal(shop.status, 'open')
    assert.equal(shop.year, 1934)
    assert.deepEqual(Object.keys(shop.buildingByEra), BOLERO_ERAS)
    assert.deepEqual(Object.keys(shop.eraNotes).filter((key) => !key.endsWith('En')), BOLERO_ERAS)
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes('bolero'), BOLERO_ERAS.includes(era.id), `${era.id} 的店家名錄`)
    }
  })

  test('六個章節（含第 8 階段的人物小節），最後一章是文獻；每一章都有出處，文獻章列出所有引用', () => {
    assert.equal(shop.chapters.length, 6)
    assert.deepEqual(shop.chapters.map((chapter) => chapter.type), ['text', 'text', 'text', 'foods', 'text', 'sources'])
    for (const chapter of shop.chapters) {
      assert.ok(chapter.sourceIds?.length, `${chapter.tab} 沒有出處`)
      for (const sourceId of chapter.sourceIds) {
        const source = getSource(sourceId)
        assert.ok(source, `${chapter.tab} 引用的 ${sourceId} 不存在`)
        assert.match(source.url, /^https?:\/\//, sourceId)
        assert.ok(source.citation, sourceId)
      }
    }
    const cited = new Set(shop.chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
    const listed = new Set(shop.chapters.at(-1).sourceIds)
    for (const sourceId of cited) assert.ok(listed.has(sourceId), `文獻章漏列 ${sourceId}`)
    assert.ok(listed.has('boch-bolero'), '要引用官方的歷史建築登錄')
  })

  test('食物圖鑑：三道代表菜都有名稱、分類、說明與插圖；不寫開賣年份', () => {
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    assert.deepEqual(foods.items.map((item) => item.id), ['duck-rice', 'curry-rice', 'bolero-steak'])
    for (const item of foods.items) {
      assert.ok(item.id && item.name && item.category && item.description, item.name)
    }
    assert.ok(foods.footnote)
    assert.match(foods.intro, /沒有寫到每一道菜開始販售的年份/)
    assert.doesNotMatch(foods.items.map((item) => item.description).join(''), /1934年(就|即)有/)
    // 插圖都登記在 FoodIllustration
    const jsx = readFileSync(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of foods.items) assert.ok(jsx.includes(`'${item.id}':`), `${item.id} 沒有插圖`)
  })

  test('門牌採官方登錄的 314 號，不寫 134 與 308；歷史建築不寫成市定古蹟', () => {
    const text = shop.chapters.map(chapterText).join('') + Object.values(shop.eraNotes).join('') + shop.note
    assert.match(text, /民生西路314號/)
    assert.doesNotMatch(text, /民生西路134號/)
    assert.doesNotMatch(text, /308號營業|搬到308/)
    assert.doesNotMatch(text, /波麗路.{0,20}市定古蹟/)
    assert.match(shop.eraNotes.revival, /2006年5月17日登錄為臺北市歷史建築/)
  })

  test('單一來源的說法標「相傳」或出處：店名由來、畫家常客、鴨子飯的研發；維基獨有的改建與分家不採用', () => {
    const history = shop.chapters.find((chapter) => chapter.id === 'history')
    assert.match(chapterText(history), /相傳取自.{0,20}Boléro/)
    const salon = shop.chapters.find((chapter) => chapter.id === 'salon')
    assert.match(chapterText(salon), /鏡週刊.{0,40}張萬傳/)
    assert.match(chapterText(salon), /單一來源/)
    assert.match(chapterText(history), /1947年.{0,30}顏雲連.{0,60}不採用/)
    for (const note of Object.values(shop.eraNotes)) assert.doesNotMatch(note, /顏雲連|308/)
  })

  test('背景章交代維特咖啡與山水亭資料不足；兩家都不是店家', () => {
    const background = shop.chapters.find((chapter) => chapter.id === 'background')
    const text = chapterText(background)
    assert.match(text, /維特咖啡/)
    assert.match(text, /山水亭/)
    assert.match(text, /不做成可探索的店家|暫不做成店家/)
    assert.ok(!getShop('shan-shui-ting'))
    assert.ok(!getShop('vite-cafe'))
    for (const era of ERAS) {
      assert.ok(!worlds[era.id].buildings.some((b) => /shan-shui|vite/.test(b.storeId ?? '')), era.id)
    }
  })
})

describe('波麗路：街景不變', () => {
  test('在出現的年代有建築（Art Deco 西餐廳），其他年代沒有', () => {
    for (const era of ERAS) {
      const building = worlds[era.id].buildings.find((item) => item.storeId === 'bolero')
      assert.equal(!!building, BOLERO_ERAS.includes(era.id), era.id)
    }
    assert.equal(shop.building.archetype, 'deco')
    assert.equal(shop.buildingByEra.modern.shopType, 'restaurant')
  })

  test('開放波麗路沒有改變五個年代的建築與碰撞數量', () => {
    for (const era of ERAS) {
      const again = buildEraWorldSync(era.id)
      assert.equal(again.buildings.length, worlds[era.id].buildings.length, era.id)
      assert.equal(again.collision.obstacles.length, worlds[era.id].collision.obstacles.length, era.id)
      assert.equal(again.collision.walkable.length, worlds[era.id].collision.walkable.length, era.id)
    }
  })
})

describe('波麗路：互動位置與介紹鏡頭', () => {
  const placement = getShopPlacement(shop)

  test('互動位置在店門前的街道上，每個年代都走得到', () => {
    for (const eraId of BOLERO_ERAS) {
      const world = worlds[eraId]
      const point = placement.interactionPoint
      assert.ok(walkableAt(world, point.x, point.z), `${eraId} 的互動位置被擋住`)
      for (const side of [-0.6, 0.6]) {
        const p = point.clone().addScaledVector(placement.right, side)
        assert.ok(walkableAt(world, p.x, p.z), `${eraId}：互動位置旁 ${side} m 被擋住`)
      }
    }
  })

  test('介紹鏡頭在街道上、不在任何方塊裡，而且看得到店面', () => {
    const cam = placement.camera.position
    const target = placement.camera.target
    for (const eraId of BOLERO_ERAS) {
      const world = worlds[eraId]
      for (const box of world.collision.obstacles) {
        assert.ok(!insideBox(cam, box, 0.2), `${eraId}：鏡頭在方塊裡 ${JSON.stringify(box)}`)
      }
      assert.ok(walkableAt(world, cam.x, cam.z), `${eraId}：鏡頭的位置不在可行走的街道上`)
      for (let t = 0.1; t < 0.75; t += 0.1) {
        const p = cam.clone().lerp(target, t)
        for (const box of world.collision.obstacles) {
          assert.ok(!insideBox(p, box), `${eraId}：視線在 ${t} 處被方塊擋住`)
        }
      }
    }
    assert.ok(cam.y >= 3.5 && cam.y <= 6)
    assert.ok(target.y >= 2.5 && target.y <= 5)
  })
})
