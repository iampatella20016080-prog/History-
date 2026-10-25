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
 * 酒樓繁華：江山樓開放探索。
 * 建築早就在街上，這一階段只補章節與文獻，所以檢查：店家資料與文獻、各年代的建築不變、互動位置與介紹鏡頭都在街上。
 * 其他三家酒樓（東薈芳、春風得意樓、蓬萊閣）資料不足、不做，只在背景章交代。
 */
const ID = 'jiang-shan-lou'
const ERA = 'banquet'
const shop = getShop(ID)
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

describe('江山樓：店家資料', () => {
  test('已開放，只出現在酒樓繁華年代', () => {
    assert.equal(shop.status, 'open')
    assert.equal(shop.year, 1921)
    assert.deepEqual(Object.keys(shop.buildingByEra), [ERA])
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(ID), era.id === ERA, `${era.id} 的店家名錄`)
    }
    assert.deepEqual(Object.keys(shop.eraNotes), [ERA])
    assert.equal(shop.reconstruction, true, '原址不在迪化街，要標情境重建')
  })

  test('六個章節（含第 8 階段的人物小節），最後一章是文獻；每一章都有出處', () => {
    assert.equal(shop.chapters.length, 6)
    assert.deepEqual(
      shop.chapters.map((chapter) => chapter.type),
      ['text', 'text', 'text', 'foods', 'text', 'sources'],
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
    const cited = new Set(shop.chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
    const listed = new Set(shop.chapters.at(-1).sourceIds)
    for (const sourceId of cited) assert.ok(listed.has(sourceId), `文獻章漏列 ${sourceId}`)
  })

  test('食物圖鑑：四道午宴菜都有名稱、分類、說明與插圖', async () => {
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    assert.equal(foods.items.length, 4)
    for (const item of foods.items) {
      assert.ok(item.id && item.name && item.category && item.description, item.name)
    }
    assert.ok(foods.footnote, '要說明菜名的來源與界線')
    // 插圖元件登記在 FoodIllustration（只檢查原始碼，不載入 React）
    const { readFile } = await import('node:fs/promises')
    const src = await readFile(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of foods.items) {
      assert.match(src, new RegExp(`'${item.id}':`), `${item.name} 沒有插圖`)
    }
  })

  test('開業年份並列兩說；拆除年份不寫死 1976', () => {
    assert.match(shop.yearLabel, /1921/)
    assert.match(shop.yearLabel, /1917/)
    assert.match(shop.yearNote, /莊永明/)
    assert.match(shop.yearNote, /國立臺灣歷史博物館/)
    assert.match(shop.note, /1970年代/)
    const history = shop.chapters.find((chapter) => chapter.id === 'history')
    assert.ok(history.facts.some((fact) => fact.label === '拆除' && /1970年代/.test(fact.value)))
  })

  test('皇太子午宴：承辦者與收尾點心並列兩說，並標明是二手整理', () => {
    const banquet = shop.chapters.find((chapter) => chapter.id === 'banquet')
    const text = chapterText(banquet)
    assert.match(text, /1923年4月24日/)
    assert.match(text, /江山樓與東薈芳/)
    assert.match(text, /八寶飯/)
    assert.match(text, /二手/)
    assert.ok(banquet.sourceIds.includes('foodnext-chen-yuchen-2020'))
    assert.ok(banquet.sourceIds.includes('jaung-jiang-shan-lou-2015'))
  })

  test('藝旦俗諺標「相傳」；不把其他三家酒樓的未查證創辦人寫成事實', () => {
    const text = shop.chapters.map(chapterText).join('') + Object.values(shop.eraNotes).join('')
    assert.match(text, /相傳/)
    assert.doesNotMatch(text, /陳天來創立|陳天來創辦的|蔣渭水創立|蔣渭水創辦的/)
    assert.doesNotMatch(text, /首富/)
    // 江山樓門牌查無
    assert.doesNotMatch(text, /歸綏街\d+號|甘州街\d+號/)
  })
})

describe('江山樓：街景不變', () => {
  test('只有酒樓繁華年代有江山樓的建築', () => {
    for (const era of ERAS) {
      const building = worlds[era.id].buildings.find((item) => item.storeId === ID)
      assert.equal(!!building, era.id === ERA, era.id)
    }
  })

  test('開放江山樓沒有改變五個年代的建築數量與碰撞', () => {
    for (const era of ERAS) {
      const again = buildEraWorldSync(era.id)
      assert.equal(again.buildings.length, worlds[era.id].buildings.length, era.id)
      assert.equal(again.collision.obstacles.length, worlds[era.id].collision.obstacles.length, era.id)
      assert.equal(again.collision.walkable.length, worlds[era.id].collision.walkable.length, era.id)
    }
  })
})

describe('江山樓：互動位置與介紹鏡頭', () => {
  const placement = getShopPlacement(shop)
  const world = worlds[ERA]

  test('互動位置在店門前的街道上，左右各一步也走得到', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(world, point.x, point.z), '互動位置被擋住')
    for (const side of [-0.6, 0.6]) {
      const p = point.clone().addScaledVector(placement.right, side)
      assert.ok(walkableAt(world, p.x, p.z), `互動位置旁 ${side} m 被擋住`)
    }
  })

  test('介紹鏡頭在街道上、不在任何方塊裡，而且看得到四層樓的店面', () => {
    const cam = placement.camera.position
    const target = placement.camera.target
    for (const box of world.collision.obstacles) {
      assert.ok(!insideBox(cam, box, 0.2), `鏡頭在方塊裡 ${JSON.stringify(box)}`)
    }
    assert.ok(walkableAt(world, cam.x, cam.z), '鏡頭的位置不在可行走的街道上')
    for (let t = 0.1; t < 0.75; t += 0.1) {
      const p = cam.clone().lerp(target, t)
      for (const box of world.collision.obstacles) {
        assert.ok(!insideBox(p, box), `視線在 ${t} 處被方塊擋住`)
      }
    }
    assert.ok(cam.y >= 3.5 && cam.y <= 6.5)
    assert.ok(target.y >= 3 && target.y <= 6)
  })
})
