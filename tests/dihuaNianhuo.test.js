import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { NANBEI_BACKGROUND_CHAPTER, NIANHUO_CHAPTER, NIANHUO_SOURCE_IDS, XIA_ER_ZUI_CHAPTER } from '../src/data/dihuaNianhuoData.js'
import { MI_TAI_MU_THEME } from '../src/data/miTaiMuLayout.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimelineByEra } from '../src/data/overview.js'
import { SHOPS, getShop, getTheme, getThemeRelated, getThemeVersions } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 迪化街年貨大街與呷二嘴（第 6 階段 C）：只加章節與出處，沒有新的店家條目、建築或碰撞。
 * 查證結論（docs/research/dihua-nianhuo.md、xia-er-zui.md）：年貨大街自 1996 年、構想由來並列、不寫日期與數字；
 * 呷二嘴只掛在米苔目主題的 related，1954 標未見文件佐證。
 */
const market = getShop('yong-le-market')
const mtm = getShop('yong-le-mi-tai-mu')
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
const nianhuoText = [NIANHUO_CHAPTER, NANBEI_BACKGROUND_CHAPTER].map(chapterText).join('')
const xiaText = chapterText(XIA_ER_ZUI_CHAPTER)
const marketText = market.chapters.map(chapterText).join('')
const mtmText = mtm.chapters.map(chapterText).join('')

describe('迪化街年貨大街', () => {
  test('章節掛在永樂市場（只在老屋新生），年貨大街與南北貨背景是各自獨立的兩節', () => {
    assert.ok(market.chapters.includes(NIANHUO_CHAPTER))
    assert.ok(market.chapters.includes(NANBEI_BACKGROUND_CHAPTER))
    assert.notEqual(NIANHUO_CHAPTER.id, NANBEI_BACKGROUND_CHAPTER.id)
    assert.deepEqual(Object.keys(market.buildingByEra), ['revival'])
    assert.match(NANBEI_BACKGROUND_CHAPTER.title, /與1996年的活動無關/)
    assert.match(NANBEI_BACKGROUND_CHAPTER.paragraphs.join(''), /不把兩者寫成同一件事的延續/)
  })

  test('1996 年緣起並列官方說法與報導，標待核', () => {
    assert.match(nianhuoText, /1996年農曆春節前半個月/)
    assert.match(nianhuoText, /市府首創/)
    assert.match(nianhuoText, /迪化街工作室/)
    assert.match(nianhuoText, /並列/)
    assert.match(nianhuoText, /待核/)
    assert.match(nianhuoText, /原報紙本站沒有直接查閱/)
    assert.match(nianhuoText, /不寫日期/)
  })

  test('禁寫內容不出現：百年傳統、世界第一、遊客與交易額、農曆日期區間', () => {
    for (const text of [nianhuoText, marketText]) {
      assert.doesNotMatch(text, /百年年貨傳統/)
      assert.doesNotMatch(text, /全世界第一|世界第一條|全球第一/)
      assert.doesNotMatch(text, /萬人次|萬美元|億元|交易額達|遊客達/)
      assert.doesNotMatch(text, /12月10日|十二月十日/)
    }
    // 沒有把任何戰前商家寫進去
    assert.doesNotMatch(nianhuoText, /行（創立|創於|成立於）/)
  })

  test('年表加入 1996，有出處，落在年代之間；年表與地圖約束維持', () => {
    const event = TIMELINE_EVENTS.find((item) => item.year === 1996)
    assert.ok(event)
    for (const id of event.sourceIds) assert.ok(getSource(id), id)
    assert.ok(getTimelineByEra().between.some((item) => item.year === 1996))
    // 地圖沒有新增地點（年貨大街沒有精確位置）
    assert.ok(!MAP_PLACES.some((place) => /年貨|呷二嘴/.test(place.name)))
  })
})

describe('呷二嘴：米苔目主題的 related', () => {
  test('只掛在 related，不是店家條目，也不進 versions', () => {
    const theme = getTheme('mi-tai-mu')
    assert.equal(theme, MI_TAI_MU_THEME)
    assert.deepEqual(theme.versions, { postwar: 'temple-mi-tai-mu-stall', revival: 'yong-le-mi-tai-mu' })
    const related = getThemeRelated(mtm)
    assert.equal(related.length, 1)
    assert.equal(related[0].eraId, 'revival')
    assert.equal(related[0].shop, null)
    assert.equal(related[0].place.name, '呷二嘴')
    assert.equal(related[0].place.address, '臺北市大同區甘州街34號')
    assert.match(related[0].relation, /參訪對照.*沒有品牌傳承關係/)
    assert.ok(!SHOPS.some((shop) => /xia-er-zui|nianhuo/.test(shop.id)))
    assert.deepEqual(getThemeVersions(mtm).map((item) => item.shop.id), ['temple-mi-tai-mu-stall'])
    // 廟口的情境攤位也看得到同一個 related（同一主題），但自己的章節不變
    assert.equal(getThemeRelated(getShop('temple-mi-tai-mu-stall')).length, 1)
  })

  test('1954 標未見文件佐證；不寫禁寫內容', () => {
    assert.match(xiaText, /1954/)
    assert.match(xiaText, /未見文件佐證/)
    assert.ok(!/米其林/.test(xiaText + mtmText))
    assert.ok(!/意麵王/.test(xiaText + mtmText))
    assert.match(xiaText, /不是呷二嘴的前身/)
    assert.match(xiaText, /不使用它的招牌、商標或裝潢/)
    assert.ok(mtm.chapters.includes(XIA_ER_ZUI_CHAPTER))
    assert.ok(!/呷二嘴/.test(marketText))
  })
})

describe('出處與其他年代', () => {
  test('章節與參考資料章節的出處都存在，含檢核欄位', () => {
    const ids = [
      ...NIANHUO_CHAPTER.sourceIds,
      ...NANBEI_BACKGROUND_CHAPTER.sourceIds,
      ...XIA_ER_ZUI_CHAPTER.sourceIds,
      ...market.chapters.flatMap((c) => c.sourceIds ?? []),
      ...mtm.chapters.flatMap((c) => c.sourceIds ?? []),
    ]
    for (const id of new Set(ids)) assert.ok(getSource(id), id)
    // 這次新增的出處都有網址、出版時間、用途與檢核說明
    for (const id of [...NIANHUO_SOURCE_IDS, ...XIA_ER_ZUI_CHAPTER.sourceIds]) {
      const source = getSource(id)
      assert.ok(source.url && source.published && source.usage && source.context, id)
    }
    const sourcesOf = (shop) => shop.chapters.find((c) => c.type === 'sources').sourceIds
    for (const id of [...NIANHUO_CHAPTER.sourceIds, ...NANBEI_BACKGROUND_CHAPTER.sourceIds]) assert.ok(sourcesOf(market).includes(id), id)
    for (const id of XIA_ER_ZUI_CHAPTER.sourceIds) assert.ok(sourcesOf(mtm).includes(id), id)
    assert.match(getSource('ettoday-2026-xia-er-zui').context, /沒有文件佐證/)
  })

  test('沒有新的地段、建築或店家：各年代名錄與建築沒有年貨大街或呷二嘴', () => {
    for (const era of ERAS) {
      assert.ok(!era.availableStores.some((id) => /xia-er-zui|nianhuo/.test(id)), era.id)
      assert.ok(!worlds[era.id].buildings.some((b) => /xia-er-zui|nianhuo/.test(b.storeId ?? '')), era.id)
    }
    assert.ok(!getLotPlan().lots.some((lot) => /xia-er-zui|nianhuo/.test(lot.id)))
    // 永樂市場與永樂米苔目仍只出現在老屋新生
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes('yong-le-market'), era.id === 'revival', era.id)
      assert.equal(era.availableStores.includes('yong-le-mi-tai-mu'), era.id === 'revival', era.id)
    }
  })
})
