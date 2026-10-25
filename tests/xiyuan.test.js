import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimelineByEra } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import {
  XIKU_BACKGROUND_CHAPTER,
  XIYUAN_HISTORY_CHAPTER,
  XIYUAN_SOURCE_IDS,
  XIYUAN_TIMELINE_EVENT,
  XIYUAN_VENUE_CHAPTER,
} from '../src/data/xiyuanData.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 大稻埕戲苑（第 7 階段 C）：只加三章與出處，掛在永樂市場故事裡，沒有新的店家、建築、地段或碰撞。
 * 查證結論（docs/research/da-dao-cheng-xi-yuan.md）：8、9 樓（非 4 樓）；1987 → 2009 → 2010 試營運 → 2011 正式營運並列、待核；
 * 與歷史戲院沒有傳承，「戲窟」一節獨立成背景並明寫並非延續。
 */
const market = getShop('yong-le-market')
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

function chapterText(chapter) {
  return [
    chapter.tab,
    chapter.title,
    chapter.lead,
    ...(chapter.paragraphs ?? []),
    ...(chapter.timeline ?? []).map((i) => `${i.place}${i.text}`),
    ...(chapter.facts ?? []).map((i) => `${i.label}${i.value}`),
  ]
    .filter(Boolean)
    .join('')
}
const chapters = [XIYUAN_VENUE_CHAPTER, XIYUAN_HISTORY_CHAPTER, XIKU_BACKGROUND_CHAPTER]
const venueText = chapterText(XIYUAN_VENUE_CHAPTER)
const historyText = chapterText(XIYUAN_HISTORY_CHAPTER)
const xikuText = chapterText(XIKU_BACKGROUND_CHAPTER)
const xiyuanText = venueText + historyText + xikuText
const sourcesChapter = market.chapters.find((c) => c.type === 'sources')

describe('大稻埕戲苑：章節', () => {
  test('三章依序掛在永樂市場故事裡（年貨大街之後、參考資料之前），市場仍只在老屋新生', () => {
    const ids = market.chapters.map((c) => c.id)
    const start = ids.indexOf('xiyuan-venue')
    assert.ok(start > ids.indexOf('nanbei-background'))
    assert.deepEqual(ids.slice(start, start + 3), ['xiyuan-venue', 'xiyuan-history', 'xiku-background'])
    assert.equal(ids[start + 3], 'sources')
    assert.deepEqual(Object.keys(market.buildingByEra), ['revival'])
    for (const chapter of chapters) assert.equal(chapter.type, 'text')
  })

  test('位置是 8、9 樓：9 樓劇場、8 樓曲藝場與布袋戲展、演出類型、管理單位', () => {
    assert.match(venueText, /8、9樓/)
    assert.match(venueText, /9樓劇場/)
    assert.match(venueText, /8樓曲藝場/)
    assert.match(venueText, /布袋戲/)
    assert.match(venueText, /歌仔戲/)
    assert.match(venueText, /南管/)
    assert.match(venueText, /臺北市藝文推廣處/)
    // 座位數三說並列、標待核
    assert.match(venueText, /約500席/)
    assert.match(venueText, /506/)
    assert.match(venueText, /待核/)
    assert.match(venueText, /不做3D/)
  })

  test('沿革年份並列：1987 延平活動中心 → 2009 更名 → 2010 試營運 → 2011 正式營運，開幕年份標待核', () => {
    assert.match(historyText, /1987年2月/)
    assert.match(historyText, /延平活動中心/)
    assert.match(historyText, /2009年10月31日/)
    assert.match(historyText, /2010年試營運|2010年（百科3月6日/)
    assert.match(historyText, /2011年正式營運|正式營運.*2011年/)
    assert.match(historyText, /2010／2011並列/)
    assert.match(historyText, /待核/)
    // 前身所在的兩說與 2015 改隸都標待核、不推論
    assert.match(historyText, /延平區行政中心/)
    assert.match(historyText, /不推論/)
    assert.match(historyText, /2015年11月6日/)
    assert.match(historyText, /只有百科/)
    assert.deepEqual(XIYUAN_HISTORY_CHAPTER.timeline.map((i) => i.place), ['1987年2月', '2009', '2010', '2011', '2015'])
  })

  test('戲窟一節是獨立背景：只列淡水戲館、永樂座、第一劇場，明寫戲苑並非延續，館方宗旨標自述', () => {
    assert.match(XIKU_BACKGROUND_CHAPTER.title, /並非這些戲院的延續/)
    assert.match(xikuText, /並非它們的延續/)
    assert.match(xikuText, /淡水戲館/)
    assert.match(xikuText, /臺灣新舞臺/)
    assert.match(xikuText, /永樂座/)
    assert.match(xikuText, /1924年2月17日/)
    assert.match(xikuText, /1960年5月/)
    assert.match(xikuText, /第一劇場/)
    assert.match(xikuText, /1935年/)
    assert.match(xikuText, /館方的宗旨與自述/)
    assert.match(xikuText, /沒有承接、同址或同團體/)
    assert.match(xikuText, /不是史實的連結/)
  })

  test('禁寫內容不出現：北投／臺北戲棚、百年傳統、歷史戲院的傳承、4 樓、文化局或市場處營運、布市推論', () => {
    assert.doesNotMatch(xiyuanText, /北投的原址|從北投遷|遷自北投|自北投遷|前身在北投/)
    assert.doesNotMatch(xiyuanText, /臺北戲棚遷來|臺北戲棚的前身|前身是臺北戲棚/)
    assert.doesNotMatch(xiyuanText, /百年戲曲|百年戲院|百年的傳統/)
    assert.doesNotMatch(xiyuanText, /永樂座的重生|永樂座重生|重生為戲苑|戲苑是永樂座|永樂座的延續/)
    assert.doesNotMatch(xiyuanText, /承接了|延續了|傳承了/)
    assert.doesNotMatch(xiyuanText, /4樓|四樓/)
    assert.doesNotMatch(xiyuanText, /文化局(直營|營運|經營)|市場處(直營|營運|經營)/)
    assert.doesNotMatch(xiyuanText, /布市.*(日治|戰後).*(樓上|二、三樓).*因此/)
    // 「不採用」「不寫」出現在否定句裡才算：這幾個詞只能跟著否定出現
    for (const match of xiyuanText.matchAll(/北投|臺北戲棚/g)) {
      const around = xiyuanText.slice(Math.max(0, match.index - 20), match.index + 40)
      assert.match(around, /查無|不採用|不寫/, around)
    }
    for (const match of xiyuanText.matchAll(/百年/g)) {
      const around = xiyuanText.slice(Math.max(0, match.index - 30), match.index + 20)
      assert.match(around, /不寫|不採/, around)
    }
  })
})

describe('大稻埕戲苑：出處、年表與地圖', () => {
  test('章節與參考資料章的出處都存在、有檢核欄位，並列在永樂市場的參考資料章', () => {
    for (const id of new Set(chapters.flatMap((c) => c.sourceIds))) {
      assert.ok(getSource(id), id)
      assert.ok(XIYUAN_SOURCE_IDS.includes(id), id)
      assert.ok(sourcesChapter.sourceIds.includes(id), id)
    }
    for (const id of XIYUAN_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source.url && source.published && source.usage && source.context, id)
    }
    // 官方場館頁、兩篇《PAR表演藝術》都在
    assert.match(getSource('eculture-taipei-xiyuan').publisher, /臺北市政府/)
    assert.match(getSource('par-2011-xiyuan').context, /館方自述/)
    assert.match(getSource('par-2014-xiku').context, /並非它們的延續/)
    assert.match(getSource('wiki-dadaocheng-xiyuan').context, /待核/)
    assert.match(sourcesChapter.disclaimer, /2010／2011並列/)
    assert.match(sourcesChapter.disclaimer, /8、9樓沒有做出/)
    // 年貨大街的免責文字仍在
    assert.match(sourcesChapter.disclaimer, /年貨大街/)
  })

  test('年表只加 2011 正式營運（並列 2010 試營運、標待核），有出處、落在老屋新生；地圖不加地點', () => {
    assert.ok(TIMELINE_EVENTS.includes(XIYUAN_TIMELINE_EVENT))
    assert.equal(XIYUAN_TIMELINE_EVENT.year, 2011)
    assert.match(XIYUAN_TIMELINE_EVENT.text, /2010年試營運/)
    assert.match(XIYUAN_TIMELINE_EVENT.text, /待核/)
    for (const id of XIYUAN_TIMELINE_EVENT.sourceIds) assert.ok(getSource(id), id)
    assert.ok(!TIMELINE_EVENTS.some((e) => /戲苑|延平活動中心/.test(e.text) && e.year !== 2011))
    const { groups } = getTimelineByEra()
    assert.ok(groups.find((g) => g.era.id === 'revival').items.some((item) => item === XIYUAN_TIMELINE_EVENT || item.text === XIYUAN_TIMELINE_EVENT.text))
    assert.ok(!MAP_PLACES.some((place) => /戲苑|戲窟|永樂座/.test(place.name)))
    assert.equal(MAP_PLACES.find((place) => place.id === 'yongle').name, '永樂市場・好粿緣')
  })
})

describe('大稻埕戲苑：沒有新的店家、建築或地段；其他年代不受影響', () => {
  test('各年代名錄、建築、地段都沒有戲苑；永樂市場仍只在老屋新生', () => {
    assert.ok(!SHOPS.some((shop) => /xiyuan|xiku|yongle-za/.test(shop.id)))
    for (const era of ERAS) {
      assert.ok(!era.availableStores.some((id) => /xiyuan|xiku/.test(id)), era.id)
      assert.ok(!worlds[era.id].buildings.some((b) => /xiyuan|xiku/.test(b.storeId ?? '')), era.id)
      assert.equal(era.availableStores.includes('yong-le-market'), era.id === 'revival', era.id)
    }
    assert.ok(!getLotPlan().lots.some((lot) => /xiyuan|xiku/.test(lot.id)))
  })

  test('永樂市場大樓的建築與碰撞不變：只做外觀與一樓，沒有 8、9 樓的室內', () => {
    const world = worlds.revival
    const market3d = world.buildings.filter((b) => b.storeId === 'yong-le-market')
    assert.ok(market3d.length >= 1)
    assert.ok(!(world.interiors ?? []).some((i) => /xiyuan|theatre|theater/.test(JSON.stringify(i).toLowerCase())))
    // 其他年代的街底沒有永樂市場
    for (const era of ERAS.filter((era) => era.id !== 'revival')) {
      assert.ok(!worlds[era.id].buildings.some((b) => b.storeId === 'yong-le-market'), era.id)
    }
  })
})
