import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  JIANG_WEISHUI_DISCLAIMER_TEXT,
  JIANG_WEISHUI_ERA_ID,
  JIANG_WEISHUI_HOST_SHOP_ID,
  JIANG_WEISHUI_MAP_PLACE,
  JIANG_WEISHUI_PERSON_CHAPTER,
  JIANG_WEISHUI_SOURCE_IDS,
  JIANG_WEISHUI_TIMELINE_EVENTS,
} from '../src/data/jiangWeiShuiData.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimelineByEra, getUnmappedShops } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 蔣渭水的人物小節（第 8 階段，方案 1）：只在江山樓的故事裡加一章文字、出處、年表與地圖；
 * 沒有新的 3D 人物、店家、建築、地段或碰撞。查證結論見 docs/research/jiang-wei-shui.md（含補查）。
 */
const shop = getShop(JIANG_WEISHUI_HOST_SHOP_ID)
const chapter = JIANG_WEISHUI_PERSON_CHAPTER

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

describe('蔣渭水人物小節：掛載位置', () => {
  test('是江山樓故事裡的新分頁（食物圖鑑之後、文獻章之前），純文字', () => {
    assert.equal(JIANG_WEISHUI_ERA_ID, 'banquet')
    const index = shop.chapters.findIndex((item) => item.id === chapter.id)
    assert.equal(index, shop.chapters.length - 2)
    assert.equal(shop.chapters[index - 1].type, 'foods')
    assert.equal(shop.chapters.at(-1).type, 'sources')
    assert.equal(chapter.type, 'text')
    assert.match(chapter.tab, /人物：蔣渭水/)
    assert.ok(!chapter.foods && !chapter.hotspots)
  })

  test('沒有新的店家、人物條目或建築；江山樓仍只在酒樓繁華、共用地段不變', () => {
    assert.ok(!SHOPS.some((item) => /蔣渭水|jiang-wei-shui|daan|chunfeng/.test(item.id)))
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(JIANG_WEISHUI_HOST_SHOP_ID), era.id === 'banquet', era.id)
    }
    assert.deepEqual(Object.keys(shop.buildingByEra), ['banquet'])
    const lots = getLotPlan().lots
    assert.ok(lots.some((item) => item.id === 'south-13') && !lots.some((item) => item.id === 'south-19'))
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      const own = world.buildings.filter((item) => item.storeId === JIANG_WEISHUI_HOST_SHOP_ID)
      assert.equal(own.length, era.id === 'banquet' ? 1 : 0, era.id)
      assert.ok(!world.buildings.some((item) => /daan|chunfeng|weishui/.test(item.storeId ?? '')), era.id)
    }
  })
})

describe('蔣渭水人物小節：內容', () => {
  test('大安醫院：1916 年在太平町設立、《臺灣民報》總批發處；只寫太平町不寫門牌', () => {
    assert.match(text, /1916年.*太平町（今延平北路二段）開設大安醫院/)
    assert.match(text, /《臺灣民報》/)
    assert.match(text, /國家文化記憶庫/)
    // 門牌只在「各說不一／待核」的句子裡出現
    // 大安醫院的門牌（27／31／33／35 號）只在「各說不一／待核」的句子裡出現；27 號只能是渭水驛站的地址
    for (const s of sentences(chapter).filter((s) => /\b(31|33|35)號/.test(s) || /大安醫院.{0,20}27號/.test(s))) {
      assert.match(s, /待核|各說不一/, s)
    }
    assert.doesNotMatch(text, /大安醫院.{0,12}延平北路二段\d+號/)
    assert.doesNotMatch(text, /義美/)
  })

  test('春風得意樓：1920 年入股、1922 年買下並歇業，對街位置引莊永明；不寫成創辦人', () => {
    assert.match(text, /1920年3月.*成為大股東/)
    assert.match(text, /1922年2月.*買下全部股份/)
    assert.match(text, /同年夏天前後關店|同年歇業/)
    assert.match(text, /「就在春風得意樓對街」/)
    assert.match(text, /莊永明/)
    assert.match(text, /不是春風得意樓的創辦人/)
    assert.doesNotMatch(text, /蔣渭水創立|蔣渭水創辦的|創辦春風得意樓/)
  })

  test('臺灣文化協會：1921 年 10 月成立；17 日與靜修女學校地點標待核', () => {
    assert.match(text, /1921年10月，臺灣文化協會成立/)
    for (const pattern of [/10月17日|17日/, /靜修/, /文協本部/]) {
      const hit = sentences(chapter).filter((s) => pattern.test(s))
      assert.ok(hit.length, `${pattern} 沒有出現`)
      for (const s of hit) assert.match(s, /待核/, s)
    }
  })

  test('渭水驛站是「今日可去的地方」：延平北路二段 27 號、2020-10-07、文化局館所、前身 URS27W、緊鄰大安醫院舊址', () => {
    assert.match(text, /延平北路二段27號/)
    assert.match(text, /渭水驛站/)
    assert.match(text, /臺北市政府文化局/)
    assert.match(text, /URS27W/)
    assert.match(text, /緊鄰大安醫院舊址/)
    assert.match(text, /2020年10月7日/)
    assert.match(text, /《你好，渭水》/)
    // 歷史建築登錄年份不寫
    assert.doesNotMatch(text, /2006年/)
  })

  test('生年三說並列標待核；卒年 1931；註明活動多在年代後半', () => {
    assert.match(text, /1888/)
    assert.match(text, /1890/)
    assert.match(text, /1891/)
    for (const s of sentences(chapter).filter((s) => /1888/.test(s))) assert.match(s, /待核|並列|各資料不一/, s)
    assert.match(text, /1931年8月5日/)
    assert.match(text, /後半/)
    assert.match(text, /1916–1930|1916–1931/)
  })

  test('禁寫：墓地、紀念公園、路線之爭、評價、稱號、〈臨床講義〉', () => {
    assert.doesNotMatch(text, /墳|墓|遷葬|櫻花陵園|六張犁|大直|關渡/)
    assert.doesNotMatch(text, /紀念公園|紀念廣場/)
    assert.doesNotMatch(text, /路線之爭|左傾|右派|左派/)
    assert.doesNotMatch(text, /孫中山|孫文|革命|先驅|英雄|偉大|啟蒙者|精神領袖|「文化頭」/)
    assert.doesNotMatch(text, /臨床講義/)
    assert.doesNotMatch(text, /義美/)
    assert.match(chapter.lead, /不作評價/)
    // 免責文字只在否定句裡提到禁寫項目
    assert.match(JIANG_WEISHUI_DISCLAIMER_TEXT, /不作政治或歷史評價/)
    assert.match(shop.chapters.at(-1).disclaimer, /墓地的遷葬與登錄、紀念公園/)
  })
})

describe('蔣渭水人物小節：出處、年表與地圖', () => {
  test('引用的出處都存在、有網址與檢核欄位；全部列在文獻章且不重複', () => {
    assert.deepEqual(chapter.sourceIds, JIANG_WEISHUI_SOURCE_IDS)
    const listed = shop.chapters.at(-1).sourceIds
    for (const id of JIANG_WEISHUI_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, `${id} 不存在`)
      assert.match(source.url, /^https?:\/\//, id)
      assert.equal(source.accessedAt, '2026-10-25', id)
      assert.ok(source.supports?.length && source.usage && source.context, id)
      assert.ok(listed.includes(id), `文獻章漏列 ${id}`)
    }
    assert.equal(new Set(listed).size, listed.length)
    // 低可信度與二手來源在用途欄寫明
    assert.match(getSource('wiki-jiang-wei-shui').usage, /線索/)
    assert.match(getSource('taiwannews-2021-tca-where').usage, /二手/)
    assert.match(getSource('moc-jiang-wei-shui-monument').usage, /旁證/)
    // 春風得意樓的莊永明文與江山樓的莊永明文是兩篇
    assert.notEqual(getSource('jaung-chunfeng-deyilou-2015').url, getSource('jaung-jiang-shan-lou-2015').url)
  })

  test('年表只加 1916、1921、2020 三件有出處的大事，落在正確的年代；春風得意樓年份不上年表', () => {
    assert.equal(JIANG_WEISHUI_TIMELINE_EVENTS.length, 3)
    for (const event of JIANG_WEISHUI_TIMELINE_EVENTS) {
      assert.ok(TIMELINE_EVENTS.includes(event))
      for (const id of event.sourceIds) assert.ok(getSource(id), id)
    }
    assert.deepEqual(JIANG_WEISHUI_TIMELINE_EVENTS.map((e) => e.year), [1916, 1921, 2020])
    const { groups } = getTimelineByEra()
    const group = (id) => groups.find((g) => g.era.id === id).items.filter((i) => i.kind === 'event')
    assert.ok(group('banquet').some((i) => i.year === 1916 && /大安醫院/.test(i.text)))
    assert.ok(group('banquet').some((i) => i.year === 1921 && /文化協會/.test(i.text)))
    assert.ok(group('revival').some((i) => i.year === 2020 && /渭水驛站/.test(i.text)))
    assert.ok(!TIMELINE_EVENTS.some((i) => /春風得意樓/.test(i.text)))
  })

  test('地圖加渭水驛站（延平北路二段 27 號，有官方新聞稿）；大安醫院、春風得意樓不標；江山樓仍無門牌', () => {
    assert.ok(MAP_PLACES.includes(JIANG_WEISHUI_MAP_PLACE))
    assert.equal(JIANG_WEISHUI_MAP_PLACE.precision, 'address')
    assert.equal(JIANG_WEISHUI_MAP_PLACE.address, '延平北路二段27號')
    assert.deepEqual(JIANG_WEISHUI_MAP_PLACE.shopIds, [])
    assert.ok(JIANG_WEISHUI_MAP_PLACE.sourceIds.every((id) => getSource(id)?.context.includes('27號')))
    assert.ok(!MAP_PLACES.some((place) => /大安醫院$|春風得意樓/.test(place.name)))
    assert.ok(getUnmappedShops().some((item) => item.id === 'jiang-shan-lou'))
    assert.equal(new Set(MAP_PLACES.map((place) => place.id)).size, MAP_PLACES.length)
  })
})
