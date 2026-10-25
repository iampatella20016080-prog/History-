import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  WANG_JINGQUAN_DISCLAIMER_TEXT,
  WANG_JINGQUAN_ERA_ID,
  WANG_JINGQUAN_HOST_SHOP_ID,
  WANG_JINGQUAN_PERSON_CHAPTER,
  WANG_JINGQUAN_SOURCE_IDS,
  WANG_JINGQUAN_TIMELINE_EVENTS,
} from '../src/data/wangJingQuanData.js'
import { MAP_PLACES, TIMELINE_EVENTS, getTimelineByEra } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 王井泉的人物小節（第 8 階段，方案 1）：專案沒有山水亭店家（門牌查無），所以掛在同年代、同一條街的波麗路故事裡；
 * 只加一章文字、出處與年表，沒有新的 3D 人物、店家、建築、地段、碰撞或地圖地點。查證結論見 docs/research/wang-jing-quan.md。
 */
const shop = getShop(WANG_JINGQUAN_HOST_SHOP_ID)
const chapter = WANG_JINGQUAN_PERSON_CHAPTER

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

describe('王井泉人物小節：掛載位置', () => {
  test('掛在摩登大稻埕的波麗路，是食物圖鑑之後、文獻章之前的新分頁，純文字；章節說明掛載理由', () => {
    assert.equal(WANG_JINGQUAN_ERA_ID, 'modern')
    assert.ok(ERAS.find((era) => era.id === 'modern').availableStores.includes(WANG_JINGQUAN_HOST_SHOP_ID))
    const index = shop.chapters.findIndex((item) => item.id === chapter.id)
    assert.equal(index, shop.chapters.length - 2)
    assert.equal(shop.chapters[index - 1].type, 'foods')
    assert.equal(shop.chapters.at(-1).type, 'sources')
    assert.equal(chapter.type, 'text')
    assert.match(chapter.tab, /人物：王井泉/)
    assert.match(text, /協助好友廖水來創設波麗路/)
    assert.match(text, /放在波麗路故事裡的原因/)
  })

  test('山水亭、維特都不是店家；沒有新建築、地段不變；波麗路仍只在原來的三個年代', () => {
    assert.ok(!getShop('shan-shui-ting') && !getShop('shanshuiting') && !getShop('vite-cafe'))
    assert.ok(!SHOPS.some((item) => /wang-jing|shanshui|vite/.test(item.id)))
    assert.deepEqual(Object.keys(shop.buildingByEra), ['modern', 'postwar', 'revival'])
    const lots = getLotPlan().lots
    assert.ok(lots.some((item) => item.id === 'south-13') && !lots.some((item) => item.id === 'south-19'))
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      assert.ok(!world.buildings.some((b) => /shan-shui|shanshui|vite|wang/.test(b.storeId ?? '')), era.id)
    }
    // 山水亭門牌查無：地圖上沒有山水亭
    assert.ok(!MAP_PLACES.some((place) => /山水亭|王井泉/.test(place.name)))
  })
})

describe('王井泉人物小節：內容', () => {
  test('山水亭：延平北路一帶街屋二樓、樓上供文藝界人士食宿、純臺灣菜；不寫門牌', () => {
    assert.match(text, /延平北路一帶一幢街屋的二樓/)
    assert.match(text, /樓上供文藝界人士食宿/)
    assert.match(text, /「純臺灣菜」/)
    assert.match(text, /東坡刈包/)
    assert.match(text, /單一來源|只有這一篇來源/)
    assert.doesNotMatch(text, /延平北路[一二]段\d+號|太平町\d+番地|番地/)
    assert.match(text, /門牌查無/)
  })

  test('開業年 1937／1938／1939 並列、1938 年 3 月 3 日註明出自其子回憶；町名太平町／永樂町並列', () => {
    assert.match(text, /1930年代末/)
    for (const pattern of [/1937年/, /1938年3月3日/, /1939年/]) {
      const hit = sentences(chapter).filter((s) => pattern.test(s))
      assert.ok(hit.length, `${pattern} 沒有出現`)
      assert.ok(hit.every((s) => /並列|不定案|待核|三說/.test(s) || /曾品滄|王古勳|臺灣記憶/.test(s)), `${pattern}：${hit.join('／')}`)
    }
    assert.match(text, /王古勳的回憶/)
    assert.match(text, /太平町/)
    assert.match(text, /永樂町/)
    assert.match(text, /並列/)
    assert.doesNotMatch(text, /1938年開業的山水亭|山水亭於1938年開業/)
  })

  test('與文人的關係只寫有出處者：《台灣文學》啟文社、厚生演劇研究會、常客名單、楊三郎與呂赫若', () => {
    assert.match(text, /1941年.*啟文社.*《台灣文學》/)
    assert.match(text, /王井泉任啟文社負責人、張文環任編輯/)
    assert.match(text, /社址就設在山水亭/)
    assert.match(text, /1943年厚生演劇研究會成立/)
    assert.match(text, /《閹雞》/)
    assert.match(text, /呂赫若/)
    assert.match(text, /楊三郎擔任《台灣文學》的編輯委員/)
    assert.match(text, /曾品滄/)
    assert.match(text, /林振莖/)
    // 「梁山泊」只作引述
    for (const s of sentences(chapter).filter((s) => /梁山泊/.test(s))) assert.match(s, /後人稱|稱號|引述/, s)
  })

  test('戰後只寫一句並標明 1945 年以後；生卒年寫、享年不寫', () => {
    assert.match(text, /1945年以後/)
    assert.match(text, /1953年.*民生西路一帶/)
    assert.match(text, /1955年歇業/)
    assert.match(text, /1905年6月4日/)
    assert.match(text, /1965年5月19日/)
    assert.doesNotMatch(text, /享年\d+|得年\d+|59歲|61歲/)
  })

  test('禁寫：日光堂書局、錦茂行、1940 年照片、陳逸松出資、二二八、政治評價', () => {
    assert.doesNotMatch(text, /日光堂|蔣渭川|錦茂行/)
    assert.doesNotMatch(text, /1940年.{0,6}照片|合影/)
    assert.doesNotMatch(text, /陳逸松出資|出資協助/)
    assert.doesNotMatch(text, /二二八|白色恐怖|政治立場/)
    assert.doesNotMatch(text, /偉大|先驅|靈魂人物|教父|傳奇/)
    assert.match(WANG_JINGQUAN_DISCLAIMER_TEXT, /樓下的書局與前身、1940年的照片/)
    assert.match(shop.chapters.at(-1).disclaimer, /山水亭不做成店家/)
  })

  test('波麗路背景章改寫山水亭一句：指向人物章、仍不做成店家', () => {
    const background = shop.chapters.find((item) => item.id === 'background')
    assert.match(chapterText(background), /「人物：王井泉」/)
    assert.match(chapterText(background), /暫不做成店家/)
    assert.ok(background.sourceIds.includes('sinica-newsletter-1584-shanshuiting'))
  })
})

describe('王井泉人物小節：出處與年表', () => {
  test('引用的出處都存在、有網址；新增的有檢核欄位；全部列在文獻章且不重複', () => {
    assert.deepEqual(chapter.sourceIds, WANG_JINGQUAN_SOURCE_IDS)
    const listed = shop.chapters.at(-1).sourceIds
    for (const id of WANG_JINGQUAN_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, `${id} 不存在`)
      assert.match(source.url, /^https?:\/\//, id)
      assert.ok(listed.includes(id), `文獻章漏列 ${id}`)
    }
    assert.equal(new Set(listed).size, listed.length)
    for (const id of ['sinica-newsletter-1584-shanshuiting', 'ntmofa-lin-zhenjing-2013-wang-jingquan', 'ncl-tm-wang-jingquan', 'jaung-wang-jingquan-2015', 'wiki-wang-jingquan']) {
      const source = getSource(id)
      assert.equal(source.accessedAt, '2026-10-25', id)
      assert.ok(source.supports?.length && source.usage && source.context, id)
    }
    assert.match(getSource('sinica-newsletter-1584-shanshuiting').usage, /照片.*不用/)
    assert.match(getSource('ntmofa-lin-zhenjing-2013-wang-jingquan').usage, /家屬回憶|王古勳/)
    assert.match(getSource('wiki-wang-jingquan').usage, /線索/)
  })

  test('年表只加 1941 與 1943 兩件有兩個以上出處的大事，落在摩登大稻埕；開業年不上年表', () => {
    assert.equal(WANG_JINGQUAN_TIMELINE_EVENTS.length, 2)
    for (const event of WANG_JINGQUAN_TIMELINE_EVENTS) {
      assert.ok(TIMELINE_EVENTS.includes(event))
      assert.ok(event.sourceIds.length >= 2, String(event.year))
      for (const id of event.sourceIds) assert.ok(getSource(id), id)
    }
    assert.deepEqual(WANG_JINGQUAN_TIMELINE_EVENTS.map((e) => e.year), [1941, 1943])
    const { groups } = getTimelineByEra()
    const events = groups.find((g) => g.era.id === 'modern').items.filter((i) => i.kind === 'event')
    assert.ok(events.some((i) => i.year === 1941 && /《台灣文學》/.test(i.text)))
    assert.ok(events.some((i) => i.year === 1943 && /厚生演劇研究會/.test(i.text)))
    assert.ok(!TIMELINE_EVENTS.some((i) => /山水亭開/.test(i.text) || [1937, 1938, 1939].includes(i.year) && /山水亭/.test(i.text)))
  })
})
