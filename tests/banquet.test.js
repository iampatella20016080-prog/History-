import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { getShop, shopYearText } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildArcadeBuilding } from '../src/game/builders/arcade.js'
import { buildGrandRestaurant } from '../src/game/builders/specials.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout, facadeSignature } from '../src/game/world/eraLayout.js'

/**
 * 酒樓年代（1895–1930）精修：江山樓地標、燈籠數量與變化、立面組合，以及其他年代不受影響。
 */
const banquet = buildEraWorldSync('banquet')
// 精修前（main 分支 aa38355）酒樓年代的燈籠總數：一般燈籠 76 盞＋店家字燈籠 2 盞
const LANTERNS_BEFORE = 78

describe('江山樓', () => {
  const shop = getShop('jiang-shan-lou')

  test('四層樓，明顯高於一般洋樓', () => {
    const jsl = buildGrandRestaurant(new PartBuilder(), { ...shop.building, seed: 1 })
    const neighbour = buildArcadeBuilding(new PartBuilder(), { archetype: 'baroque', width: 5, floors: 3, seed: 1 })
    assert.equal(shop.building.floors, 4)
    assert.ok(jsl.topHeight >= 15, `江山樓高度 ${jsl.topHeight}`)
    assert.ok(jsl.topHeight > neighbour.topHeight + 4, `江山樓 ${jsl.topHeight}／三層洋樓 ${neighbour.topHeight}`)
  })

  test('平屋頂：不使用瓦屋頂（沒有宮殿式屋頂）', () => {
    const b = new PartBuilder()
    buildGrandRestaurant(b, { ...shop.building, seed: 1 })
    assert.equal(b.groups.has('roof'), false)
    assert.ok(b.groups.has('brick'), '紅磚立面')
  })

  test('有清楚的「江山樓」招牌，建築前有「江山樓｜歷史情境重建」說明牌', () => {
    const names = banquet.signs.filter((sign) => sign.text === '江山樓')
    assert.ok(names.length >= 3, `江山樓招牌 ${names.length} 面`)
    const placard = banquet.signs.find((sign) => sign.text === '江山樓｜歷史情境重建')
    assert.ok(placard, '說明牌')
    assert.equal(placard.style, 'label')
    assert.ok(Math.abs(placard.position[0] - shop.position.x) < 6, '說明牌在江山樓前')
  })

  test('第 3 階段起開放探索（章節測試在 jiangShanLou.test.js）', () => {
    assert.equal(shop.status, 'open')
  })

  test('創立年份標示兩種記載與來源，不自行認定單一年份', () => {
    assert.match(shop.yearLabel, /1917/)
    assert.match(shop.yearLabel, /1921/)
    assert.equal(shopYearText(shop), shop.yearLabel)
    assert.ok(shop.yearNote.includes('1917') && shop.yearNote.includes('1921'))
    assert.ok(shop.sourceIds.length >= 2)
    for (const id of shop.sourceIds) {
      const source = getSource(id)
      assert.ok(source, `來源 ${id}`)
      // 莊永明書坊的部落格只有 http
      assert.match(source.url, /^https?:\/\//)
    }
    assert.equal(shopYearText(getShop('lin-fu-zhen')), '1853年')
  })
})

describe('街景', () => {
  test('燈籠減少約三成五，大小不一', () => {
    const total = banquet.lanterns.length + banquet.textLanterns.length
    const ratio = total / LANTERNS_BEFORE
    assert.ok(ratio >= 0.55 && ratio <= 0.7, `燈籠 ${total} 盞（精修前 ${LANTERNS_BEFORE}，比例 ${ratio.toFixed(2)}）`)
    const sizes = new Set(banquet.lanterns.map((lantern) => lantern.scale.toFixed(2)))
    assert.ok(sizes.size >= 6, `燈籠尺寸 ${sizes.size} 種`)
  })

  test('燈籠亮度調降約 25%，並有冷色補光', () => {
    const { lighting } = getEra('banquet')
    assert.equal(lighting.lanternGlow, 0.75)
    assert.ok(lighting.fill.intensity > 0)
  })

  test('至少三種背景立面組合，同一側相鄰的一般街屋不重複', () => {
    const layout = createEraLayout(getEra('banquet'))
    const generic = layout.buildings.filter((building) => !building.storeId)
    const kinds = new Set(generic.map((building) => facadeSignature(building.config)))
    assert.ok(kinds.size >= 3, `立面組合 ${kinds.size} 種：${[...kinds].join('、')}`)
    const archetypes = new Set(generic.map((building) => `${building.config.archetype}|${building.config.facade ?? ''}`))
    assert.ok(archetypes.has('minnan|') && archetypes.has('baroque|brick') && archetypes.has('baroque|stucco'))
    const rows = new Map()
    for (const building of layout.buildings) {
      const key = building.z.toFixed(1)
      rows.set(key, [...(rows.get(key) ?? []), building])
    }
    for (const row of rows.values()) {
      row.sort((a, b) => a.x - b.x)
      for (let i = 1; i < row.length; i++) {
        if (row[i].storeId || row[i - 1].storeId) continue
        assert.notEqual(facadeSignature(row[i].config), facadeSignature(row[i - 1].config), `${row[i - 1].id} 與 ${row[i].id}`)
      }
    }
  })

  test('有人力車、布幡與盆栽', () => {
    const layout = createEraLayout(getEra('banquet'))
    assert.ok(layout.props.filter((prop) => prop.type === 'rickshaw').length >= 3)
    assert.ok(layout.props.some((prop) => prop.type === 'pottedPlant'))
    assert.ok(banquet.banners.length >= 2, `布幡 ${banquet.banners.length} 面`)
  })
})

describe('其他四個年代不受影響', () => {
  for (const era of ERAS.filter((item) => item.id !== 'banquet')) {
    test(era.title, () => {
      const layout = createEraLayout(era)
      for (const building of layout.buildings) {
        for (const key of ['ornate', 'facade', 'lanternScale', 'lanternDrop', 'lanternCount']) {
          assert.equal(building.config[key], undefined, `${building.id}.${key}`)
        }
      }
      assert.equal(era.lighting.lanternGlow ?? 1, 1)
      // 冷色補光：第 9 階段調光後摩登也有（tests/lightingMotion.test.js），其他白天的年代仍然沒有
      if (era.id !== 'modern') assert.equal(era.lighting.fill?.intensity ?? 0, 0)
      // 江山樓前的說明牌只在酒樓繁華（港口商街另有清末碼頭的說明牌）
      assert.ok(!layout.props.some((prop) => prop.type === 'placard' && /江山樓/.test(prop.text)))
    })
  }
})
