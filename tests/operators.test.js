import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  OPERATORS_POSTWAR_CHAPTER,
  OPERATORS_POSTWAR_DISCLAIMER_TEXT,
  OPERATORS_POSTWAR_ERA_ID,
  OPERATORS_POSTWAR_HOST_SHOP_ID,
  OPERATORS_POSTWAR_SOURCE_IDS,
  OPERATORS_REVIVAL_CHAPTER,
  OPERATORS_REVIVAL_DISCLAIMER_TEXT,
  OPERATORS_REVIVAL_ERA_ID,
  OPERATORS_REVIVAL_HOST_SHOP_ID,
  OPERATORS_REVIVAL_SOURCE_IDS,
} from '../src/data/operatorsData.js'
import { MAP_PLACES, TIMELINE_EVENTS } from '../src/data/overview.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'

/**
 * 在地經營者群像（第 8 階段 C）：庶民生活掛在林復振的 postwar 年代版本、老屋新生掛在永樂市場；
 * 都是純文字一章，只用既有出處，沒有新的店家、建築、地段、碰撞、年表或地圖。
 */
const postwarShop = getShop(OPERATORS_POSTWAR_HOST_SHOP_ID, OPERATORS_POSTWAR_ERA_ID)
const revivalShop = getShop(OPERATORS_REVIVAL_HOST_SHOP_ID, OPERATORS_REVIVAL_ERA_ID)

function chapterText(item) {
  return [item.tab, item.title, item.lead, ...(item.paragraphs ?? []), ...(item.timeline ?? []).map((i) => `${i.place}${i.text}`), ...(item.facts ?? []).map((i) => `${i.label}${i.value}`)]
    .filter(Boolean)
    .join('')
}
const sentences = (item) => [...(item.paragraphs ?? []), ...(item.facts ?? []).map((i) => i.value), ...(item.timeline ?? []).map((i) => i.text)].flatMap((p) => p.split(/[。；]/))
const postwarText = chapterText(OPERATORS_POSTWAR_CHAPTER)
const revivalText = chapterText(OPERATORS_REVIVAL_CHAPTER)
const allText = postwarText + revivalText + OPERATORS_POSTWAR_DISCLAIMER_TEXT + OPERATORS_REVIVAL_DISCLAIMER_TEXT

/** 句子裡的「出處提示」：出處名稱、文獻種類或「待核／查無／不寫」的否定句 */
const SOURCE_CUE = /官網|沿革|國家文化記憶庫|大紀元|遠見|維基|曾品滄|林振莖|鏡週刊|今周刊|ETtoday|中研院|市場處|文化部|文化資產網|料理．台灣|臺灣工藝|自由時報|食力|公視|中山區公所|中央社|旅人誌|500輯|商工登記|商業處|報時光|官方稿|人間福報|Bella|〈林復振商行〉|檔案館|報導|專訪|家族口述|文獻未載|查無|待核|不寫|不點名|單一來源|本站/

describe('經營者群像：掛載位置', () => {
  test('庶民生活：是林復振 postwar 版本文獻章前的一章，其他年代與基本版的林復振不變', () => {
    assert.equal(OPERATORS_POSTWAR_ERA_ID, 'postwar')
    const ids = postwarShop.chapters.map((c) => c.id)
    assert.deepEqual(ids, ['formation', 'history', 'foods', 'operators-postwar', 'sources'])
    assert.equal(OPERATORS_POSTWAR_CHAPTER.type, 'text')
    assert.match(OPERATORS_POSTWAR_CHAPTER.tab, /群像/)
    assert.ok(!OPERATORS_POSTWAR_CHAPTER.foods && !OPERATORS_POSTWAR_CHAPTER.hotspots)
    assert.deepEqual(getShop(OPERATORS_POSTWAR_HOST_SHOP_ID).chapters.map((c) => c.id), ['formation', 'history', 'foods', 'sources'])
    for (const era of ERAS) {
      if (era.id === 'postwar') continue
      const shop = getShop(OPERATORS_POSTWAR_HOST_SHOP_ID, era.id)
      assert.ok(!shop.chapters.some((c) => c.id === 'operators-postwar'), era.id)
      assert.equal(shop.chapters.length, 4, era.id)
    }
    // 同一個年代每次拿到同一個物件（互動位置快取依物件區分）
    assert.equal(getShop(OPERATORS_POSTWAR_HOST_SHOP_ID, 'postwar'), postwarShop)
  })

  test('老屋新生：在永樂市場「背景：年前買南北貨」之後、戲苑三章之前；永樂市場仍只在老屋新生', () => {
    assert.equal(OPERATORS_REVIVAL_ERA_ID, 'revival')
    const ids = revivalShop.chapters.map((c) => c.id)
    const index = ids.indexOf('operators-revival')
    assert.equal(ids[index - 1], 'nanbei-background')
    assert.equal(ids[index + 1], 'xiyuan-venue')
    assert.equal(ids.at(-1), 'sources')
    assert.equal(OPERATORS_REVIVAL_CHAPTER.type, 'text')
    assert.match(OPERATORS_REVIVAL_CHAPTER.tab, /群像/)
    for (const era of ERAS) assert.equal(era.availableStores.includes(OPERATORS_REVIVAL_HOST_SHOP_ID), era.id === 'revival', era.id)
    assert.ok(ERAS.find((e) => e.id === 'postwar').availableStores.includes(OPERATORS_POSTWAR_HOST_SHOP_ID))
  })

  test('沒有新的店家、建築、地段、年表大事或地圖地點', () => {
    assert.ok(!SHOPS.some((item) => /operator|群像/.test(item.id + item.name)))
    assert.deepEqual(Object.keys(getShop(OPERATORS_POSTWAR_HOST_SHOP_ID).buildingByEra), ['qing-port', 'banquet', 'modern', 'postwar', 'revival'])
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => /operator/.test(item.id)))
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      assert.equal(world.buildings.filter((b) => b.storeId === OPERATORS_POSTWAR_HOST_SHOP_ID).length, 1, era.id)
      assert.equal(world.buildings.filter((b) => b.storeId === OPERATORS_REVIVAL_HOST_SHOP_ID).length, era.id === 'revival' ? 1 : 0, era.id)
    }
    assert.ok(!TIMELINE_EVENTS.some((e) => /群像|經營者/.test(e.text)))
    assert.ok(!MAP_PLACES.some((p) => /群像|經營者/.test(p.name)))
  })
})

describe('經營者群像：出處', () => {
  test('引用的出處都存在、有網址，全部列在掛載故事的文獻章且不重複；免責文字接在文獻章後面', () => {
    for (const [chapter, ids, shop, disclaimer] of [
      [OPERATORS_POSTWAR_CHAPTER, OPERATORS_POSTWAR_SOURCE_IDS, postwarShop, OPERATORS_POSTWAR_DISCLAIMER_TEXT],
      [OPERATORS_REVIVAL_CHAPTER, OPERATORS_REVIVAL_SOURCE_IDS, revivalShop, OPERATORS_REVIVAL_DISCLAIMER_TEXT],
    ]) {
      assert.deepEqual(chapter.sourceIds, ids)
      assert.equal(new Set(ids).size, ids.length)
      const sources = shop.chapters.at(-1)
      assert.equal(sources.type, 'sources')
      const listed = new Set(sources.sourceIds)
      for (const id of ids) {
        const source = getSource(id)
        assert.ok(source, `${id} 不存在`)
        assert.match(source.url, /^https?:\/\//, id)
        assert.ok(source.citation, id)
        assert.ok(listed.has(id), `文獻章漏列 ${id}`)
      }
      assert.equal(new Set(sources.sourceIds).size, sources.sourceIds.length)
      assert.ok(sources.disclaimer.endsWith(disclaimer) || sources.disclaimer.includes(disclaimer))
    }
    // 永樂市場的文獻章要全部是 https（yongle.test 的要求）
    for (const id of revivalShop.chapters.at(-1).sourceIds) assert.match(getSource(id).url, /^https:\/\//, id)
  })

  test('每一句陳述都帶出處提示（出處名稱、文獻種類，或待核／查無／不寫的否定句）', () => {
    for (const chapter of [OPERATORS_POSTWAR_CHAPTER, OPERATORS_REVIVAL_CHAPTER]) {
      for (const paragraph of chapter.paragraphs) {
        for (const sentence of paragraph.split('。').filter((s) => s.trim())) {
          assert.match(sentence, SOURCE_CUE, `沒有出處提示：${sentence}`)
        }
      }
      for (const item of chapter.timeline) assert.match(item.text, SOURCE_CUE, item.text)
    }
  })
})

describe('經營者群像：內容與分寸', () => {
  test('庶民生活：有出處的行動都在（有記 1949／1975、新芳春 1950／1974、林大村 1977、波麗路 1976、山水亭 1953／1955、十字軒壽桃、廟口攤販）', () => {
    assert.match(postwarText, /王澄清/)
    assert.match(postwarText, /1949年.*重慶北路二段64巷26號/)
    assert.match(postwarText, /1975年.*內銷門市/)
    assert.match(postwarText, /1950年.*兩合公司/)
    assert.match(postwarText, /1974年第三代王國忠接手/)
    assert.match(postwarText, /林大村.*1977年.*孝行楷模/)
    assert.match(postwarText, /1976年在隔壁開了第二店/)
    assert.match(postwarText, /1953年.*1955年歇業/)
    assert.match(postwarText, /壽桃/)
    assert.match(postwarText, /民國50年間/)
    assert.match(postwarText, /迪化街口擺攤/)
    // 掛載理由與「不寫成群體」
    assert.match(postwarText, /為什麼放在林復振/)
    assert.match(postwarText, /不把他們寫成一個群體的行動/)
  })

  test('老屋新生：接班、分家、捐屋、承租、新店與集體活動都在，並說明掛載理由', () => {
    assert.match(revivalText, /林濬彤/)
    assert.match(revivalText, /邱獻德、第三代邱易為/)
    assert.match(revivalText, /李佳陽.*返家接班.*李榮華/)
    assert.match(revivalText, /王連源在2004年/)
    assert.match(revivalText, /王聖鈞2012年接班/)
    assert.match(revivalText, /2011年家族分家.*林茂森/)
    assert.match(revivalText, /王國忠把洋樓捐給臺北市政府/)
    assert.match(revivalText, /唐家後代在2014年把老屋捐給臺北市政府/)
    assert.match(revivalText, /葉守倫/)
    assert.match(revivalText, /周奕成/)
    assert.match(revivalText, /何明瑞/)
    assert.match(revivalText, /1996年起由市府與商家合辦/)
    assert.match(revivalText, /為什麼放在永樂市場/)
    assert.match(revivalText, /不把這些人寫成同一個運動/)
    assert.match(revivalText, /不把他們寫成歷史人物/)
  })

  test('待核標示：各店既有章節標待核的，群像裡同樣標待核或並列', () => {
    const check = (chapter, patterns) => {
      for (const pattern of patterns) {
        const hit = sentences(chapter).filter((s) => pattern.test(s))
        assert.ok(hit.length, `${pattern} 沒有出現`)
        assert.ok(hit.some((s) => /待核|並列|文獻未載|未核實|留空|不寫/.test(s)), `${pattern} 的句子沒有標待核：${hit.join('／')}`)
      }
    }
    check(OPERATORS_POSTWAR_CHAPTER, [/民國50年/, /迪化街口/, /停歇/, /分家的年份/, /各代接手的年份/, /約40年前/])
    check(OPERATORS_REVIVAL_CHAPTER, [/市府首創/, /遷入的年份/, /世代序號/, /民國五十六年|創立年/, /進駐年份/])
    // 爐鍋咖啡的經營者、文史館的營運單位不點名
    assert.match(revivalText, /進駐年份與經營者姓名本站不寫/)
    assert.match(revivalText, /營運單位本站未核實，不點名/)
  })

  test('禁寫：研究紀錄判定不寫的店名與說法、評價與宣傳語、各店之間的傳承、李亭香的世代', () => {
    assert.doesNotMatch(allText, /許仔|葉家|阿桂姨|江家|黃記|賴記|媽祖宮口|魷魚標/)
    assert.doesNotMatch(allText, /意麵王|林合發|呷二嘴|米其林/)
    assert.doesNotMatch(allText, /最好吃|百年傳奇|傳奇|首富|世界第一|最老|最古老|百年傳統|興盛不衰|屹立不搖/)
    // 各店之間的師承／傳承只能出現在否定句裡（「沒有查到」「不寫」）
    for (const chapter of [OPERATORS_POSTWAR_CHAPTER, OPERATORS_REVIVAL_CHAPTER]) {
      for (const s of chapter.paragraphs.flatMap((p) => p.split('。')).filter((s) => /師承|傳承/.test(s))) {
        assert.match(s, /沒有|不寫|不把|不點名|未指明|未載|查無/, s)
      }
    }
    assert.doesNotMatch(allText, /傳承自|承接了|延續了|一脈相承|接棒給/)
    assert.doesNotMatch(allText, /為了|感念|理想|使命|堅持|決心/)
    // 李亭香不寫世代序號、不與滋養串在一起
    for (const s of OPERATORS_REVIVAL_CHAPTER.paragraphs.flatMap((p) => p.split(/[。；]/)).filter((s) => /李亭香|李佳陽/.test(s))) {
      assert.doesNotMatch(s, /第[一二三四五六七八九十\d]+代/, s)
      assert.doesNotMatch(s, /滋養/, s)
    }
    // 庶民生活版不寫「稻舍」與十字軒的店招；廟口只寫「傳了幾代（未指明哪一攤）」
    assert.doesNotMatch(postwarText, /稻舍|Rice & Shine|TEN CAKE|SINCE 1930/)
    for (const s of sentences(OPERATORS_POSTWAR_CHAPTER).filter((s) => /廟口|攤/.test(s))) assert.doesNotMatch(s, /第[二四]代/, s)
    // 現代店家不寫成歷史人物
    assert.doesNotMatch(revivalText, /歷史人物(?!。)|先驅|功臣|推手/)
    // 免責文字只在否定句裡提到這些事
    assert.match(OPERATORS_POSTWAR_DISCLAIMER_TEXT, /一律不寫/)
    assert.match(OPERATORS_REVIVAL_DISCLAIMER_TEXT, /不點名/)
  })
})
