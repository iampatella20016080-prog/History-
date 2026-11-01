import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EXEMPT_KEYS, walk } from '../tools/i18n/walk.mjs'
import {
  CLASSICS,
  CLASSIC_STATUS,
  CLINICAL_LECTURE_CHAPTER,
  QUAN_HE_LUN_CHAPTER,
  TEA_SCALE_CLASSIC_NOTE,
  YI_GAN_CHENG_ZAI_CHAPTER,
} from '../src/data/classicsData.js'
import { ERAS } from '../src/data/eras.js'
import { getInspectObject } from '../src/data/inspectObjects.js'
import { layerSourceIds } from '../src/data/inspectLayers.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { localize } from '../src/i18n/lang.js'

/**
 * 經典閱讀三篇：鄭用錫〈勸和論〉（霞海城隍廟）、蔣渭水〈臨床講義〉（江山樓）、賴和〈一桿「稱仔」〉（林華泰茶行酒樓繁華版）。
 * 查證紀錄：docs/research/classics-three.md。原文節選要逐字出自 tests/fixtures/classics/ 的維基文庫轉錄全文。
 */
const fixture = (name) => readFileSync(new URL(`./fixtures/classics/${name}.txt`, import.meta.url), 'utf8')
const compact = (text) => text.replace(/\s+/g, '')
const chapterText = (chapter) => JSON.stringify(chapter)
/** 章節文字，去掉「查證狀態」（那裡才會用否定句提到查無的說法） */
const claimsText = (chapter) => JSON.stringify({ ...chapter, checks: undefined, checksEn: undefined })

const byId = Object.fromEntries(CLASSICS.map((item) => [item.id, item]))
const CHAPTERS = [QUAN_HE_LUN_CHAPTER, CLINICAL_LECTURE_CHAPTER, YI_GAN_CHENG_ZAI_CHAPTER]

test('經典閱讀：三篇都存在，是 classic 章節，且各自掛在指定的店家與年代', () => {
  assert.equal(CLASSICS.length, 3)
  for (const { id, shopId, eraId, chapter } of CLASSICS) {
    assert.equal(chapter.type, 'classic')
    assert.equal(chapter.id, id)
    const shop = getShop(shopId, eraId)
    assert.ok(shop.chapters.some((item) => item.id === id), `${shopId}@${eraId} 缺 ${id}`)
    // 插在文獻章之前
    const index = shop.chapters.findIndex((item) => item.id === id)
    assert.equal(shop.chapters[index + 1].type, 'sources', id)
  }
  assert.deepEqual(
    CLASSICS.map((item) => [item.shopId, item.eraId]),
    [
      ['xia-hai-cheng-huang', 'qing-port'],
      ['jiang-shan-lou', 'banquet'],
      ['lin-hua-tai', 'banquet'],
    ],
  )
})

test('經典閱讀：只出現在指定年代，其他年代的店家章節不受影響', () => {
  for (const era of ERAS) {
    const shop = getShop('lin-hua-tai', era.id)
    assert.equal(shop.chapters.some((item) => item.id === 'classic-yi-gan-cheng-zai'), era.id === 'banquet', era.id)
    assert.ok(!shop.chapters.some((item) => item.id === 'classic-quan-he-lun' || item.id === 'classic-clinical-lecture'), era.id)
  }
  // 霞海城隍廟與江山樓本來就只在一個年代（沒有年代版本，章節跟著店家走）
  for (const era of ERAS) {
    assert.equal(era.availableStores.includes('xia-hai-cheng-huang'), era.id === 'qing-port')
    assert.equal(era.availableStores.includes('jiang-shan-lou'), era.id === 'banquet')
  }
  // 林華泰五個年代都有，只有酒樓繁華多一章；其他年代的章節順序和港口商街版相同
  const base = getShop('lin-hua-tai', 'qing-port').chapters.map((item) => item.id)
  for (const era of ERAS.filter((item) => item.id !== 'banquet')) {
    assert.deepEqual(getShop('lin-hua-tai', era.id).chapters.map((item) => item.id), base, era.id)
  }
  const banquet = getShop('lin-hua-tai', 'banquet').chapters.map((item) => item.id)
  assert.deepEqual(banquet, [...base.slice(0, -1), 'classic-yi-gan-cheng-zai', 'sources'])
  // 沒有新的店家
  assert.ok(!getShop('classic-quan-he-lun') && !getShop('classic-clinical-lecture'))
})

test('經典閱讀：每篇都有原文（或說明為什麼沒有）、白話、反思問題、背景、連結與查證狀態', () => {
  for (const chapter of CHAPTERS) {
    assert.ok(chapter.work.length >= 4, chapter.id)
    assert.ok(chapter.background.length >= 3, chapter.id)
    assert.ok(chapter.connect.length >= 2, chapter.id)
    assert.ok(chapter.glossary.length >= 3, chapter.id)
    assert.match(chapter.reflection.question, /？$/, chapter.id)
    assert.ok(chapter.reflection.prompts.length >= 3, chapter.id)
    assert.ok(chapter.checks.length >= 5, chapter.id)
    assert.ok(chapter.edition, chapter.id)
    for (const check of chapter.checks) assert.ok(CLASSIC_STATUS[check.status], `${chapter.id} ${check.status}`)
    // 每篇都有有出處的事實，也有標待核或不寫的部分
    assert.ok(chapter.checks.some((item) => item.status === 'sourced'), chapter.id)
    assert.ok(chapter.checks.some((item) => item.status === 'pending'), chapter.id)
    assert.ok(chapter.checks.some((item) => item.status === 'omitted'), chapter.id)
  }
  for (const chapter of [QUAN_HE_LUN_CHAPTER, YI_GAN_CHENG_ZAI_CHAPTER]) {
    assert.ok(chapter.excerpts.length >= 3, chapter.id)
    for (const excerpt of chapter.excerpts) {
      assert.ok(excerpt.original && excerpt.plain && excerpt.plainEn, `${chapter.id}/${excerpt.id}`)
      assert.ok(excerpt.note && excerpt.noteEn, `${chapter.id}/${excerpt.id}`)
    }
  }
})

test('經典閱讀：原文節選逐字出自維基文庫轉錄全文（〈勸和論〉、〈一桿稱仔〉）', () => {
  const quanHe = compact(fixture('quan-he-lun'))
  for (const excerpt of QUAN_HE_LUN_CHAPTER.excerpts) assert.ok(quanHe.includes(compact(excerpt.original)), excerpt.id)
  const yiGan = compact(fixture('yi-gan-cheng-zai'))
  for (const excerpt of YI_GAN_CHENG_ZAI_CHAPTER.excerpts) assert.ok(yiGan.includes(compact(excerpt.original)), excerpt.id)
  // 節選不重複
  for (const chapter of [QUAN_HE_LUN_CHAPTER, YI_GAN_CHENG_ZAI_CHAPTER]) {
    assert.equal(new Set(chapter.excerpts.map((item) => item.original)).size, chapter.excerpts.length)
  }
})

test('經典閱讀：〈臨床講義〉原文是日文、沒有可核對的版本，所以不放原文節選，只放摘要並說明原因', () => {
  const chapter = CLINICAL_LECTURE_CHAPTER
  assert.deepEqual(chapter.excerpts, [])
  assert.match(chapter.excerptNote, /日文/)
  assert.match(chapter.excerptNote, /譯本/)
  assert.match(chapter.excerptNote, /不引用/)
  assert.match(chapter.excerptNoteEn, /Japanese/)
  assert.equal(chapter.points.length, 4)
  assert.ok(chapter.points.every((item) => item.text && item.textEn))
  // 五項處方都寫了
  const text = chapterText(chapter)
  for (const item of ['正規學校教育', '補習教育', '幼稚園', '圖書館', '讀報社']) assert.ok(text.includes(item), item)
  // 沒有任何「原文」欄位，也沒有把中文譯本的句子當成引文
  assert.ok(!('original' in chapter) && chapter.points.every((item) => !('original' in item)))
  // 日期與版本的矛盾並列、標待核
  assert.match(chapter.work[2].value, /1921年11月/)
  assert.match(chapter.work[2].value, /28日/)
  assert.match(chapter.work[2].value, /30日/)
  assert.ok(chapter.checks.some((item) => item.status === 'pending' && /28日/.test(item.text) && /30日/.test(item.text)))
  assert.ok(chapter.checks.some((item) => item.status === 'omitted' && /中文全文/.test(item.text)))
})

test('經典閱讀：〈勸和論〉不把沒有證據的事寫成事實（鄭用錫是竹塹人、沒有到過大稻埕、不專指頂下郊拚）', () => {
  const chapter = QUAN_HE_LUN_CHAPTER
  const text = claimsText(chapter)
  assert.match(text, /竹塹/)
  assert.doesNotMatch(text, /鄭用錫(曾|親自|來到|到過|前往)[^。]{0,8}大稻埕/)
  assert.doesNotMatch(text, /鄭用錫[^。]{0,10}參與[^。]{0,6}頂下郊拚/)
  assert.ok(chapter.checks.some((item) => item.status === 'omitted' && /大稻埕/.test(item.text) && /頂下郊拚/.test(item.text)))
  // 成文年份兩說並列、是否專指頂下郊拚標待核
  assert.match(chapter.work[2].value, /咸豐三年/)
  assert.match(chapter.work[2].value, /咸豐四年/)
  assert.ok(chapter.checks.some((item) => item.status === 'pending' && /咸豐三年/.test(item.text) && /咸豐四年/.test(item.text)))
  assert.ok(chapter.checks.some((item) => item.status === 'pending' && /專為頂下郊拚/.test(item.text)))
  // 原文確實沒有點名這些詞（本站「原文沒有點名」的說法以全文為據）
  const original = fixture('quan-he-lun')
  for (const word of ['頂下郊', '同安', '三邑', '大稻埕', '商業', '利益']) assert.ok(!original.includes(word), word)
  for (const word of ['新、艋', '漳、泉', '閩、粵']) assert.ok(original.includes(word), word)
})

test('經典閱讀：〈一桿「稱仔」〉只是「同時代的秤」，不寫成發生在大稻埕或彰化；連載兩期', () => {
  const chapter = YI_GAN_CHENG_ZAI_CHAPTER
  const text = claimsText(chapter)
  assert.match(chapter.work[3].value, /鎮南威麗村/)
  assert.match(chapter.work[3].value, /不是大稻埕/)
  assert.doesNotMatch(text, /(發生|設定|位)在(大稻埕|彰化)/)
  assert.match(chapter.work[2].value, /第92、93號/)
  assert.match(chapter.work[2].value, /2月14日、21日/)
  assert.ok(chapter.checks.some((item) => item.status === 'omitted' && /彰化/.test(item.text)))
  // 原文全文確實沒有「彰化」「大稻埕」，有「鎮南威麗村」
  const original = fixture('yi-gan-cheng-zai')
  assert.ok(!original.includes('彰化') && !original.includes('大稻埕'))
  assert.ok(original.includes('鎮南威麗村'))
  // 賴和是醫師、與文協的關係沒有可靠出處：只在「待核」裡出現，不寫成事實
  assert.ok(chapter.checks.some((item) => item.status === 'pending' && /醫師/.test(item.text)))
  assert.doesNotMatch(chapter.background.join(''), /醫師/)
  // 結局不補完、後記的案件不指認
  assert.match(chapter.background.join(''), /不替它補完/)
  assert.ok(chapter.checks.some((item) => item.status === 'omitted' && /真實案件/.test(item.text)))
})

test('經典閱讀：桿秤器物的「照片與文獻」層有一則延伸閱讀的指引，連到賴和這篇', () => {
  const scale = getInspectObject('tea-scale')
  assert.ok(scale.layers.evidence.includes(TEA_SCALE_CLASSIC_NOTE))
  assert.match(TEA_SCALE_CLASSIC_NOTE.text, /鎮南威麗村/)
  assert.match(TEA_SCALE_CLASSIC_NOTE.text, /不是大稻埕/)
  assert.ok(layerSourceIds(scale).includes('wikisource-yi-gan-cheng-zai'))
  assert.ok(TEA_SCALE_CLASSIC_NOTE.textEn)
})

test('經典閱讀：出處都存在於 sources.js，有網址與中英文引用，並在店家的文獻章列出', () => {
  for (const chapter of CHAPTERS) {
    assert.ok(chapter.sourceIds.length >= 3, chapter.id)
    for (const id of chapter.sourceIds) {
      const source = getSource(id)
      assert.ok(source, `${chapter.id} 缺出處 ${id}`)
      assert.match(source.url, /^https:\/\//, id)
      assert.ok(source.citation && source.citationEn && source.title && source.titleEn, id)
    }
  }
  for (const { chapter, shopId, eraId } of CLASSICS) {
    const sources = getShop(shopId, eraId).chapters.find((item) => item.type === 'sources')
    for (const id of chapter.sourceIds) assert.ok(sources.sourceIds.includes(id), `${shopId}@${eraId} 文獻章缺 ${id}`)
  }
  // 林華泰其他年代的文獻章不列賴和的出處
  for (const era of ERAS.filter((item) => item.id !== 'banquet')) {
    const sources = getShop('lin-hua-tai', era.id).chapters.find((item) => item.type === 'sources')
    assert.ok(!sources.sourceIds.includes('wikisource-yi-gan-cheng-zai'), era.id)
  }
})

test('經典閱讀：英文欄位齊全（每個中文字串同層都有英文），英文模式下白話換成英文翻譯', () => {
  for (const chapter of CHAPTERS) {
    const out = []
    walk(chapter, chapter.id, out)
    const missing = out.filter((item) => !EXEMPT_KEYS.has(item.key) && !item.covered)
    assert.deepEqual(missing.map((item) => item.path), [], chapter.id)
  }
  const en = localize(QUAN_HE_LUN_CHAPTER, 'en')
  assert.match(en.title, /Zheng Yongxi/)
  assert.match(en.excerpts[0].plain, /Human beings and beasts/)
  assert.equal(en.excerpts[0].original, QUAN_HE_LUN_CHAPTER.excerpts[0].original)
  assert.ok(en.reflection.prompts.every((item) => !/[㐀-鿿]/.test(item)))
  // 英文陣列與中文陣列等長
  for (const chapter of CHAPTERS) {
    assert.equal(chapter.backgroundEn.length, chapter.background.length, chapter.id)
    assert.equal(chapter.connectEn.length, chapter.connect.length, chapter.id)
    assert.equal(chapter.reflection.promptsEn.length, chapter.reflection.prompts.length, chapter.id)
  }
  for (const status of Object.values(CLASSIC_STATUS)) assert.ok(status.label && status.labelEn)
})

test('經典閱讀：白話與英文翻譯不是原文（沒有直接抄原文當翻譯）', () => {
  for (const chapter of [QUAN_HE_LUN_CHAPTER, YI_GAN_CHENG_ZAI_CHAPTER]) {
    for (const excerpt of chapter.excerpts) {
      assert.notEqual(compact(excerpt.plain), compact(excerpt.original), excerpt.id)
      assert.ok(excerpt.plainEn.length > 80, excerpt.id)
      assert.doesNotMatch(excerpt.plainEn.replace(/[「」『』“”‘’.…\s\d,;:!?()—-]/g, '').slice(0, 20), /[㐀-鿿]{6}/, excerpt.id)
    }
  }
})
