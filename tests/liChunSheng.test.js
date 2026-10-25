import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  LI_CHUNSHENG_DISCLAIMER_TEXT,
  LI_CHUNSHENG_ERA_ID,
  LI_CHUNSHENG_HOST_SHOP_ID,
  LI_CHUNSHENG_MAP_PLACE,
  LI_CHUNSHENG_PERSON_CHAPTER,
  LI_CHUNSHENG_SOURCE_IDS,
  LI_CHUNSHENG_TIMELINE_EVENTS,
} from '../src/data/liChunShengData.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimelineByEra } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 李春生的人物小節（第 8 階段，方案 1）：只在寶順洋行的故事裡加一章文字、出處、年表與地圖；
 * 沒有新的 3D 人物、店家、建築、地段或碰撞。查證結論見 docs/research/li-chun-sheng.md。
 */
const shop = getShop(LI_CHUNSHENG_HOST_SHOP_ID)
const chapter = LI_CHUNSHENG_PERSON_CHAPTER

function chapterText(item) {
  return [
    item.tab,
    item.title,
    item.lead,
    ...(item.paragraphs ?? []),
    ...(item.timeline ?? []).map((i) => `${i.place}${i.text}`),
    ...(item.facts ?? []).map((i) => `${i.label}${i.value}`),
  ]
    .filter(Boolean)
    .join('')
}
const text = chapterText(chapter)
const sentences = (item) => [...(item.paragraphs ?? []), ...(item.facts ?? []).map((i) => i.value), ...(item.timeline ?? []).map((i) => i.text)].flatMap((p) => p.split(/[。；]/))

describe('李春生人物小節：掛載位置', () => {
  test('是寶順洋行故事裡的第四章（建昌街與揀茶女之後、文獻章之前），純文字', () => {
    assert.equal(LI_CHUNSHENG_ERA_ID, 'qing-port')
    const index = shop.chapters.findIndex((item) => item.id === chapter.id)
    assert.equal(index, 3)
    assert.equal(shop.chapters[index - 1].id, 'street')
    assert.equal(shop.chapters.at(-1).type, 'sources')
    assert.equal(chapter.type, 'text')
    assert.match(chapter.tab, /人物/)
    assert.ok(!chapter.foods && !chapter.hotspots)
  })

  test('沒有新的店家、人物條目或建築；寶順洋行仍只在港口商街', () => {
    assert.ok(!SHOPS.some((item) => /李春生/.test(item.id) || item.id.includes('li-chunsheng')))
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(LI_CHUNSHENG_HOST_SHOP_ID), era.id === 'qing-port', era.id)
    }
    assert.deepEqual(Object.keys(shop.buildingByEra), ['qing-port'])
    // 共用地段不變：沒有為人物預留地段；洋樓仍只取代 north-5
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => item.storeId === LI_CHUNSHENG_HOST_SHOP_ID))
    assert.ok(lots.some((item) => item.id === 'south-13') && !lots.some((item) => item.id === 'south-19'))
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      const own = world.buildings.filter((item) => item.storeId === LI_CHUNSHENG_HOST_SHOP_ID)
      assert.equal(own.length, era.id === 'qing-port' ? 1 : 0, era.id)
    }
  })
})

describe('李春生人物小節：內容', () => {
  test('(1) 人物的一條路：廈門長大、受洗、學英語 → 寶順行買辦 → 安溪茶苗 → 自營茶商', () => {
    assert.match(text, /廈門/)
    assert.match(text, /1851年.*受洗/)
    assert.match(text, /英國語文/)
    assert.match(text, /怡記洋行/)
    assert.match(text, /寶順行.*買辦|買辦.*寶順/)
    assert.match(text, /安溪採辦茶苗/)
    assert.match(text, /李節記/)
    assert.match(text, /資本額排第三/)
  })

  test('買辦夾在洋行與茶農之間的視角，但不推論動機', () => {
    assert.match(text, /買辦站在兩邊的中間/)
    assert.match(text, /洋行/)
    assert.match(text, /茶農|農民/)
    assert.match(text, /不替他補|不替他解釋動機/)
    assert.match(text, /為什麼走這條路，不在文獻裡/)
  })

  test('(2) 人與街：建昌公司、貴德街洋樓街、揀茶女的茶街', () => {
    assert.match(text, /1889年.*建昌公司/)
    assert.match(text, /建昌街與千秋街（戰後的貴德街）/)
    assert.match(text, /臺北第一條洋樓街/)
    assert.match(text, /「茶街」/)
    assert.match(text, /揀茶的婦女/)
  })

  test('(3) 人與教會：大稻埕教會（甘州街 40 號，出資規劃監造）、紀念教會（後代 1935 年所建，貴德街 44 號）', () => {
    assert.match(text, /甘州街40號/)
    assert.match(text, /1915年遷建的禮拜堂由他出資、規劃並監造/)
    assert.match(text, /貴德街44號/)
    assert.match(text, /1935年5月5日/)
    assert.match(text, /孫輩李延旭、李延弼與信徒所建/)
    // 後代為何建教會：不推論
    assert.match(text, /沒有記建教會的理由/)
    assert.match(text, /不替後人補上動機/)
    assert.doesNotMatch(text, /為了紀念祖父|感念|報答|遺志/)
  })

  test('(4) 稱號只寫當時的稱呼並標出處', () => {
    assert.match(text, /「清季台灣北部最有名富紳」（國史館）/)
    assert.match(text, /「台灣茶業之父」/)
    assert.match(text, /杜聰明/)
    assert.match(text, /不另外加評語|不評價他的思想/)
  })

  test('待核標示：來臺年並列、建昌公司年份、四達商行、1896 赴日細節、著作出版年、1901 長老', () => {
    assert.match(text, /1865/)
    assert.match(text, /1866/)
    assert.match(text, /1868/)
    assert.match(text, /並列/)
    for (const pattern of [/四達商行/, /1886/, /1896.*赴日|赴日.*待核/, /1901/]) {
      const hit = sentences(chapter).filter((s) => pattern.test(s))
      assert.ok(hit.length, `${pattern} 沒有出現`)
      assert.ok(hit.some((s) => /待核/.test(s)), `${pattern} 的句子沒有標待核：${hit.join('／')}`)
    }
    assert.match(text, /出版年各來源不一，本站只寫書名、不寫年份/)
    // 過世只寫年份，兩說並列
    assert.match(text, /9月7日/)
    assert.match(text, /10月5日/)
    assert.match(text, /本站只寫1924年|本站只寫年份/)
  })

  test('禁寫：住址／故居、紀念教會文資身分與設計者、「首富」「總辦」、思想評價與「第一位思想家」', () => {
    assert.doesNotMatch(text, /故居|住址|住所|宅邸/)
    assert.doesNotMatch(text, /古蹟|歷史建築|文化資產|設計者|建築師/)
    assert.doesNotMatch(text, /首富|總辦/)
    assert.doesNotMatch(text, /思想家|啟蒙|先驅|偉大|傑出/)
    assert.doesNotMatch(text, /孫中山|孫文/)
    // 免責文字只在否定句裡提到這些詞
    assert.match(LI_CHUNSHENG_DISCLAIMER_TEXT, /不寫|不用/)
    assert.match(shop.chapters.at(-1).disclaimer, /「總辦」職稱.*不用/)
  })
})

describe('李春生人物小節：出處、年表與地圖', () => {
  test('引用的出處都存在、有網址；新增的有檢核欄位；全部列在文獻章', () => {
    assert.deepEqual(chapter.sourceIds, LI_CHUNSHENG_SOURCE_IDS)
    const listed = new Set(shop.chapters.at(-1).sourceIds)
    for (const id of LI_CHUNSHENG_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, `${id} 不存在`)
      assert.match(source.url, /^https?:\/\//, id)
      assert.ok(listed.has(id), `文獻章漏列 ${id}`)
    }
    for (const id of ['cosmiccare-li-chunsheng-church', 'culture-taipei-jp-spots', 'pts-2024-li-chunsheng', 'ntu-li-chunsheng-works-2004', 'rti-li-chunsheng-tea', 'wiki-li-chunsheng']) {
      const source = getSource(id)
      assert.equal(source.accessedAt, '2026-10-25', id)
      assert.ok(source.supports?.length && source.usage && source.context, id)
    }
    // 低可信度的來源在用途欄寫明只作線索／旁證
    assert.match(getSource('rti-li-chunsheng-tea').usage, /旁證|線索/)
    assert.match(getSource('wiki-li-chunsheng').usage, /線索/)
    // 文獻章沒有重複的 id
    const ids = shop.chapters.at(-1).sourceIds
    assert.equal(new Set(ids).size, ids.length)
  })

  test('年表只加 1866 與 1915 兩件有出處的大事，落在正確的年代；單一來源的年份不上年表', () => {
    assert.equal(LI_CHUNSHENG_TIMELINE_EVENTS.length, 2)
    for (const event of LI_CHUNSHENG_TIMELINE_EVENTS) {
      assert.ok(TIMELINE_EVENTS.includes(event))
      for (const id of event.sourceIds) assert.ok(getSource(id), id)
    }
    assert.equal(LI_CHUNSHENG_TIMELINE_EVENTS[0].year, 1866)
    assert.match(LI_CHUNSHENG_TIMELINE_EVENTS[0].text, /1865年，並列/)
    assert.equal(LI_CHUNSHENG_TIMELINE_EVENTS[1].year, 1915)
    const { groups } = getTimelineByEra()
    const group = (id) => groups.find((g) => g.era.id === id).items.filter((i) => i.kind === 'event')
    assert.ok(group('qing-port').some((i) => i.year === 1866 && /李春生/.test(i.text)))
    assert.ok(group('banquet').some((i) => i.year === 1915 && /大稻埕教會/.test(i.text)))
    assert.ok(!TIMELINE_EVENTS.some((i) => [1861, 1886, 1901].includes(i.year)))
  })

  test('地圖加大稻埕教會（甘州街 40 號，依門牌）；不標李春生故居', () => {
    assert.ok(MAP_PLACES.includes(LI_CHUNSHENG_MAP_PLACE))
    assert.equal(LI_CHUNSHENG_MAP_PLACE.precision, 'address')
    assert.deepEqual(LI_CHUNSHENG_MAP_PLACE.shopIds, [LI_CHUNSHENG_HOST_SHOP_ID])
    assert.ok(LI_CHUNSHENG_MAP_PLACE.sourceIds.every((id) => getSource(id)?.context.includes('甘州街40號')))
    assert.ok(!MAP_PLACES.some((place) => /故居|李春生宅/.test(place.name)))
    assert.equal(new Set(MAP_PLACES.map((place) => place.id)).size, MAP_PLACES.length)
  })
})
