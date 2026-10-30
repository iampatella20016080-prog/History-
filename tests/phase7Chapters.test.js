import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { LI_TING_XIANG_ID, LI_TING_XIANG_SOURCE_IDS, LTX_CHAPTERS } from '../src/data/liTingXiangData.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimeline, getUnmappedShops } from '../src/data/overview.js'
import { SHOPS, getShop, getShopBuilding } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 第 7 階段 B：小藝埕補章節與李亭香（docs/research/xiao-yi-cheng.md、li-ting-xiang.md）。
 * 只加章節、出處與名錄的年代限縮，沒有新的建築、地段或碰撞：
 * - 小藝埕只補在爐鍋咖啡的「小藝埕」章節，不新增 3D、不做民藝埕
 * - 李亭香只在老屋新生開放探索；其他年代同一地段的店屋保留，招牌改成一般的「餅舖」
 */
const luguo = getShop('luguo-cafe')
const ltx = getShop(LI_TING_XIANG_ID)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

function chapterText(chapter) {
  return [
    chapter.tab,
    chapter.title,
    chapter.lead,
    chapter.intro,
    chapter.footnote,
    chapter.disclaimer,
    ...(chapter.paragraphs ?? []),
    ...(chapter.timeline ?? []).map((i) => `${i.place}${i.text}`),
    ...(chapter.facts ?? []).map((i) => `${i.label}${i.value}`),
  ]
    .filter(Boolean)
    .join('')
}
const artYard = luguo.chapters.find((chapter) => chapter.id === 'art-yard')
const artYardText = chapterText(artYard)
const ltxText = [ltx.summary, ltx.yearLabel, ltx.yearNote, ...Object.values(ltx.eraNotes), ...ltx.chapters.map(chapterText)].join('')

describe('小藝埕：補章節（不新增 3D）', () => {
  test('補在爐鍋咖啡既有的「小藝埕」章節裡，章節數與順序不變', () => {
    assert.deepEqual(
      luguo.chapters.map((chapter) => chapter.id),
      ['building', 'art-yard', 'luguo', 'coffee', 'sources'],
    )
    assert.ok(artYard.paragraphs.length >= 7)
  })

  test('四個可寫的重點：營運模式標官方自述、第一棟藝埕（2011）、洋樓與三進街屋的對照、樓層隨時間調整', () => {
    assert.match(artYardText, /官方自述/)
    assert.match(artYardText, /創業助成、街區營造、文化運動/)
    assert.match(artYardText, /第一棟/)
    assert.match(artYardText, /2011年/)
    assert.match(artYardText, /民藝埕/)
    assert.match(artYardText, /三進/)
    assert.match(artYardText, /茂元中藥行/)
    assert.match(artYardText, /不同的建築/)
    assert.match(artYardText, /隨時間調整/)
  })

  test('待核與取捨：地址兩說並列、不推論因果、民間承租不是政府計畫', () => {
    assert.match(artYardText, /32巷1號/)
    assert.match(artYardText, /34號/)
    assert.match(artYardText, /待核/)
    assert.match(artYardText, /不推論/)
    assert.match(artYardText, /沒有查到它是政府的計畫/)
  })

  test('禁寫內容不出現：民藝埕就是小藝埕、最古老、租金、市府推動、現況入駐名單', () => {
    const text = JSON.stringify(luguo.chapters.filter((chapter) => chapter.type !== 'sources'))
    assert.doesNotMatch(text, /民藝埕（屈臣氏|民藝埕就是|民藝埕二樓/)
    assert.doesNotMatch(text, /最古老|最老/)
    assert.doesNotMatch(text, /租金|租期為|年租/)
    assert.doesNotMatch(text, /市府推動|市府計畫|市府出資/)
    assert.doesNotMatch(text, /現在的入駐名單：|目前入駐/)
    // 爐鍋咖啡不寫成世代群經營
    assert.doesNotMatch(text, /世代群經營的爐鍋|爐鍋咖啡由世代群/)
  })

  test('新增的官方 HOUSES 頁出處有網址、出版時間、用途與檢核，並列在參考文獻章', () => {
    const source = getSource('artyard-houses')
    assert.ok(source)
    for (const key of ['url', 'published', 'usage', 'context']) assert.ok(source[key], key)
    assert.ok(artYard.sourceIds.includes('artyard-houses'))
    assert.ok(luguo.chapters.find((chapter) => chapter.type === 'sources').sourceIds.includes('artyard-houses'))
    for (const id of artYard.sourceIds) assert.ok(getSource(id), id)
  })

  test('沒有新增民藝埕：各年代的店家、建築與名錄都沒有它', () => {
    assert.ok(!SHOPS.some((shop) => /min-yi|民藝埕/.test(`${shop.id}${shop.name}`)))
    for (const era of ERAS) {
      assert.ok(!era.availableStores.some((id) => /min-yi/.test(id)), era.id)
      assert.ok(!worlds[era.id].buildings.some((item) => /min-yi/.test(item.id)), era.id)
    }
  })
})

describe('李亭香：只做現代與店家自述', () => {
  test('開放探索，四個章節：現況與傳承、店名與平西餅、兼賣雜貨、參考文獻', () => {
    assert.equal(ltx.status, 'open')
    assert.deepEqual(ltx.chapters.map((chapter) => [chapter.id, chapter.type]), [
      ['today', 'text'],
      ['name', 'text'],
      ['decline', 'text'],
      ['sources', 'sources'],
    ])
    assert.equal(ltx.chapters, LTX_CHAPTERS)
  })

  test('1895 是店家自述並標待核；創立地點兩說並列；店名由來標店家說法；兼賣雜貨只寫「約40年前」', () => {
    assert.match(ltx.yearLabel, /店家自述/)
    assert.match(ltx.yearLabel, /待核/)
    assert.match(ltxText, /1895年/)
    assert.match(ltxText, /蘆洲/)
    assert.match(ltxText, /並列/)
    assert.match(ltxText, /亭仔腳/)
    assert.match(ltxText, /店家說法/)
    assert.match(ltxText, /約40年前/)
    assert.match(ltxText, /香菸/)
    assert.match(ltxText, /不寫世代序號/)
  })

  test('禁寫內容不出現：1895 年創於迪化街、第 N 代、綠豆糕／牡丹餅為老味、與滋養的傳承、年貨大街、文資／古蹟', () => {
    assert.doesNotMatch(ltxText, /1895年創於迪化街|1895年創立於迪化街|1895年創立於大稻埕|創立於1895年的糕餅老店/)
    assert.doesNotMatch(ltxText, /第[一二三四五六七八九十\d]+代/)
    assert.doesNotMatch(ltxText, /牡丹餅/)
    assert.doesNotMatch(ltxText, /綠豆糕[^，。]*老味|老味[^，。]*綠豆糕|早年[^，。]*綠豆糕/)
    assert.doesNotMatch(ltxText, /滋養/)
    assert.doesNotMatch(ltxText, /年貨大街/)
    assert.doesNotMatch(ltxText, /文資|古蹟|歷史建築/)
    assert.doesNotMatch(ltxText, /師承|傳承自/)
    assert.doesNotMatch(ltxText, /創始店至今仍在營業/)
  })

  test('出處都存在、都是媒體或部落格（有網址、出版時間、用途與檢核），參考文獻章列齊', () => {
    assert.ok(LI_TING_XIANG_SOURCE_IDS.length >= 4)
    for (const id of LI_TING_XIANG_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, id)
      for (const key of ['url', 'published', 'usage', 'context']) assert.ok(source[key], `${id}.${key}`)
    }
    assert.deepEqual(ltx.sourceIds, LI_TING_XIANG_SOURCE_IDS)
    const sourcesChapter = ltx.chapters.find((chapter) => chapter.type === 'sources')
    for (const chapter of ltx.chapters) for (const id of chapter.sourceIds ?? []) assert.ok(sourcesChapter.sourceIds.includes(id), id)
  })

  test('年表：1895 是店家的年份（標待核），沒有新增大事；地圖仍然不標李亭香', () => {
    const { items } = getTimeline()
    const item = items.find((entry) => entry.kind === 'shop' && entry.shopId === LI_TING_XIANG_ID)
    assert.equal(item.year, 1895)
    assert.match(item.label, /待核/)
    assert.deepEqual(item.eraIds, ['revival'])
    assert.ok(!TIMELINE_EVENTS.some((event) => /李亭香|平西餅/.test(event.text)))
    assert.ok(!MAP_PLACES.some((place) => place.shopIds.includes(LI_TING_XIANG_ID)))
    assert.ok(getUnmappedShops().some((shop) => shop.id === LI_TING_XIANG_ID))
  })
})

describe('李亭香：年代限縮（名錄只在老屋新生，店屋與地段不變）', () => {
  test('只有老屋新生的名錄有李亭香；酒樓繁華、摩登、庶民生活不列', () => {
    for (const era of ERAS) assert.equal(era.availableStores.includes(LI_TING_XIANG_ID), era.id === 'revival', era.id)
  })

  test('酒樓繁華起四個年代同一地段仍有這棟店屋（建築不變），日治、戰後的招牌只寫一般的「餅舖」、不寫店名', () => {
    for (const eraId of ['banquet', 'modern', 'postwar', 'revival']) {
      const building = getShopBuilding(ltx, eraId)
      assert.ok(building, eraId)
      assert.ok(worlds[eraId].buildings.some((item) => item.storeId === LI_TING_XIANG_ID), eraId)
      assert.equal(building.sign.text, eraId === 'revival' ? '李亭香' : '餅舖', eraId)
    }
    assert.equal(getShopBuilding(ltx, 'qing-port'), null)
    for (const era of ERAS) {
      const signs = worlds[era.id].signs ?? []
      const named = signs.some((sign) => /李亭香/.test(sign.text ?? ''))
      assert.equal(named, era.id === 'revival', `${era.id} 的招牌`)
    }
  })

  test('共用地段切分不變：店家地段的位置與寬度在五個年代相同', () => {
    const plans = ERAS.map((era) => getLotPlan(era.id))
    const lot = (plan) => plan.lots.find((item) => item.storeId === LI_TING_XIANG_ID) ?? null
    const reference = lot(plans[0])
    for (const plan of plans) assert.deepEqual(lot(plan), reference)
    assert.ok(reference)
    assert.equal(reference.center?.x ?? reference.x, ltx.position.x)
  })

  test('年代說明：只在老屋新生，其他年代的餅舖標情境示意；年代版本不改名', () => {
    assert.deepEqual(Object.keys(ltx.eraNotes).filter((key) => !key.endsWith('En')), ['revival'])
    assert.match(ltx.eraNotes.revival, /情境示意/)
    assert.equal(getShop(LI_TING_XIANG_ID, 'revival').name, '李亭香')
    assert.equal(getEra('revival').availableStores.filter((id) => id === LI_TING_XIANG_ID).length, 1)
  })
})
