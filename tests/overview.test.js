import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { MAP_PLACES, MAP_STREETS, TIMELINE_EVENTS, eraForYear, getPlaceShops, getTimeline, getTimelineByEra, getUnmappedShops } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'

/** 總覽頁：年表與對照地圖的資料（純資料模組） */
describe('總覽：年表', () => {
  test('每個有年份的店家都在年表上，而且依年份排序；沒有年份的另外列出', () => {
    const { items, undated } = getTimeline()
    const dated = SHOPS.filter((shop) => typeof shop.year === 'number')
    assert.equal(items.filter((item) => item.kind === 'shop').length, dated.length)
    assert.equal(undated.length, SHOPS.length - dated.length)
    for (let i = 1; i < items.length; i++) assert.ok(items[i].year >= items[i - 1].year, `${items[i - 1].year} → ${items[i].year}`)
    // 年份記載不一的店家帶著說明
    const xfc = items.find((item) => item.shopId === 'xin-fang-chun')
    assert.match(xfc.label, /1934年落成/)
    // 文化據點有標記
    assert.ok(items.find((item) => item.shopId === 'dodd-tea-house').heritage)
  })

  test('大事都有存在的出處', () => {
    for (const event of TIMELINE_EVENTS) {
      assert.ok(event.sourceIds.length, event.text)
      for (const id of event.sourceIds) assert.ok(getSource(id), `${event.year}：${id} 不存在`)
      assert.equal(typeof event.year, 'number')
    }
    for (let i = 1; i < TIMELINE_EVENTS.length; i++) assert.ok(TIMELINE_EVENTS[i].year >= TIMELINE_EVENTS[i - 1].year)
  })

  test('年份歸到正確的年代；1980–2000 之間沒有年代', () => {
    assert.equal(eraForYear(1853), 'qing-port')
    assert.equal(eraForYear(1894), 'qing-port')
    assert.equal(eraForYear(1895), 'banquet')
    assert.equal(eraForYear(1934), 'modern')
    assert.equal(eraForYear(1953), 'postwar')
    assert.equal(eraForYear(1985), null)
    assert.equal(eraForYear(2021), 'revival')
    const { groups, between } = getTimelineByEra()
    assert.deepEqual(groups.map((g) => g.era.id), ERAS.map((era) => era.id))
    assert.ok(between.some((item) => item.year === 1985))
    // 每個店家項目的年代清單和 eras.js 的名錄一致
    for (const group of groups) {
      for (const item of group.items.filter((i) => i.kind === 'shop')) {
        for (const era of ERAS) assert.equal(item.eraIds.includes(era.id), era.availableStores.includes(item.shopId), `${item.shopId} ${era.id}`)
      }
    }
  })
})

describe('總覽：對照地圖', () => {
  test('每個地點都對應存在的店家、有門牌文字與出處；座標在圖內', () => {
    for (const place of MAP_PLACES) {
      assert.ok(getPlaceShops(place).length === place.shopIds.length, `${place.id} 有不存在的店家`)
      assert.ok(place.address, place.id)
      assert.ok(['address', 'approx'].includes(place.precision), place.id)
      assert.ok(place.x > 0 && place.x < 100 && place.y > 0 && place.y < 100, place.id)
      assert.ok(place.sourceIds.length, `${place.id} 沒有出處`)
      for (const id of place.sourceIds) assert.ok(getSource(id), `${place.id}：${id} 不存在`)
    }
  })

  test('依門牌標示的地點，門牌真的出現在該店家的資料或文獻裡', () => {
    for (const place of MAP_PLACES.filter((item) => item.precision === 'address')) {
      const number = place.address.match(/\d+(巷\d+)?號/)?.[0]
      assert.ok(number, place.id)
      const texts = [
        ...getPlaceShops(place).flatMap((shop) => [shop.address, shop.summary, shop.note, JSON.stringify(shop.chapters ?? ''), JSON.stringify(shop.eras ?? '')]),
        ...place.sourceIds.map((id) => getSource(id).context),
      ]
      assert.ok(texts.some((text) => text && text.includes(number)), `${place.id} 的門牌 ${number} 在資料裡找不到`)
    }
  })

  test('街道至少畫出迪化街、延平北路、重慶北路、民生西路、涼州街與淡水河', () => {
    const ids = MAP_STREETS.map((street) => street.id)
    for (const id of ['dihua', 'yanping', 'chongqing', 'minsheng', 'liangzhou', 'river']) assert.ok(ids.includes(id), id)
    for (const street of MAP_STREETS) assert.ok(street.points.length >= 2 && street.name)
  })

  test('沒有門牌的店家列在「地圖上沒有標示」，不會被亂標', () => {
    const unmapped = getUnmappedShops().map((shop) => shop.id)
    for (const id of ['lin-fu-zhen', 'li-ting-xiang', 'jiang-shan-lou', 'bolero']) assert.ok(unmapped.includes(id), id)
    for (const id of unmapped) assert.ok(getShop(id))
    const mapped = new Set(MAP_PLACES.flatMap((place) => place.shopIds))
    for (const id of unmapped) assert.ok(!mapped.has(id))
  })
})
