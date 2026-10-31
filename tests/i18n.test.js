import test from 'node:test'
import assert from 'node:assert/strict'
import { STRINGS } from '../src/i18n/strings.js'
import { DEFAULT_LANG, LANGS, initialLang, langFromSearch, loadLang, saveLang, shopSummary, translate } from '../src/i18n/lang.js'
import { SHOPS, getShop } from '../src/data/shops.js'
import { ERAS } from '../src/data/eras.js'

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

test('字串表：兩種語言的鍵一致，且沒有空字串', () => {
  const zh = Object.keys(STRINGS['zh-Hant']).sort()
  const en = Object.keys(STRINGS.en).sort()
  assert.deepEqual(en, zh)
  for (const lang of LANGS) for (const [key, text] of Object.entries(STRINGS[lang])) assert.ok(text.length > 0, `${lang}:${key}`)
})

test('字串表：兩種語言的佔位符相同', () => {
  for (const key of Object.keys(STRINGS['zh-Hant'])) {
    assert.deepEqual(placeholders(STRINGS.en[key]), placeholders(STRINGS['zh-Hant'][key]), key)
  }
})

test('translate：代入佔位符，缺鍵時退回中文再退回鍵名', () => {
  assert.equal(translate('en', 'directory.count', { total: 3, open: 2 }), '3 shops · 2 to explore')
  assert.equal(translate('zh-Hant', 'directory.count', { total: 3, open: 2 }), '3 間店家・2 間可探索')
  assert.equal(translate('en', 'no.such.key'), 'no.such.key')
})

test('語言設定：預設 zh-Hant；存取失敗不丟錯；不認得的值退回預設', () => {
  assert.equal(DEFAULT_LANG, 'zh-Hant')
  const memory = new Map()
  const storage = { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) }
  assert.equal(loadLang(storage), 'zh-Hant')
  saveLang('en', storage)
  assert.equal(loadLang(storage), 'en')
  memory.set('ddc-lang', 'fr')
  assert.equal(loadLang(storage), 'zh-Hant')
  const broken = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('blocked')
    },
  }
  assert.equal(loadLang(broken), 'zh-Hant')
  assert.doesNotThrow(() => saveLang('en', broken))
})

const EN_SHOPS = ['lin-fu-zhen', 'xin-fang-chun', 'jiang-shan-lou', 'bolero', 'rice-and-shine']

test('summaryEn：5 家代表店家都有英文摘要，且對應到真實的中文店家', () => {
  for (const id of EN_SHOPS) {
    const shop = SHOPS.find((item) => item.id === id) ?? SHOPS.find((item) => item.id.includes(id.split('-')[0]))
    assert.ok(shop, id)
    assert.equal(shop.status, 'open')
    assert.ok(shop.summaryEn, id)
  }
  for (const shop of SHOPS) {
    if (!shop.summaryEn) continue
    assert.ok(shop.summary, `${shop.id} 有英文摘要就要有中文摘要`)
    const values = typeof shop.summaryEn === 'string' ? [shop.summaryEn] : Object.values(shop.summaryEn)
    for (const text of values) assert.ok(text.length > 20, shop.id)
  }
})

test('summaryEn：以年代分開的店家（稻舍）每個啟用的年代都有英文', () => {
  const rice = SHOPS.find((shop) => shop.eras && shop.summaryEn && typeof shop.summaryEn === 'object')
  assert.ok(rice)
  for (const eraId of Object.keys(rice.eras)) assert.ok(rice.summaryEn[eraId], eraId)
  for (const eraId of Object.keys(rice.eras)) {
    const { text, fallback } = shopSummary(getShop(rice.id, eraId), 'en')
    assert.equal(fallback, false)
    // 年代版本自己的 summary（年代說明）有對應的 summaryEn；沒有時才退回依年代分開的摘要
    const era = getShop(rice.id, eraId)
    assert.equal(text, typeof era.summaryEn === 'string' ? era.summaryEn : rice.summaryEn[eraId])
  }
})

test('shopSummary：中文模式用中文；英文模式沒有 summaryEn 時退回中文並標 fallback', () => {
  const withEn = SHOPS.find((shop) => typeof shop.summaryEn === 'string')
  const without = { id: 'x', summary: '只有中文的摘要' }
  assert.deepEqual(shopSummary(withEn, 'zh-Hant'), { text: withEn.summary, fallback: false })
  assert.deepEqual(shopSummary(withEn, 'en'), { text: withEn.summaryEn, fallback: false })
  assert.deepEqual(shopSummary(without, 'en'), { text: without.summary, fallback: true })
})

test('英文介面：代表店家出現的年代都不會漏掉英文摘要', () => {
  for (const era of ERAS) {
    for (const id of era.availableStores) {
      const shop = getShop(id, era.id)
      if (EN_SHOPS.includes(id) || shop.summaryEn) assert.equal(shopSummary(shop, 'en').fallback, false, `${era.id}/${id}`)
    }
  }
})

test('?lang=：en／zh 指定語言，優先於記住的選擇；不認得的值忽略', () => {
  assert.equal(langFromSearch('?lang=en'), 'en')
  assert.equal(langFromSearch('?era=modern&lang=zh'), 'zh-Hant')
  assert.equal(langFromSearch('?lang=fr'), null)
  assert.equal(langFromSearch(''), null)
  assert.equal(langFromSearch(undefined), null)
  assert.equal(initialLang('?lang=en'), 'en')
  assert.equal(initialLang('?foo=1'), 'zh-Hant')
})

import { localize } from '../src/i18n/lang.js'

test('localize：英文模式把 key 換成 keyEn（字串、陣列），中文模式原樣回傳；不改動原物件', () => {
  const data = { title: '港口', titleEn: 'Harbour', lines: ['甲', '乙'], linesEn: ['A', 'B'], only: '中', nested: [{ label: '標', labelEn: 'Label' }], sign: '招牌', n: 3 }
  const en = localize(data, 'en')
  assert.equal(en.title, 'Harbour')
  assert.deepEqual(en.lines, ['A', 'B'])
  assert.equal(en.only, '中')
  assert.equal(en.nested[0].label, 'Label')
  assert.equal(en.sign, '招牌')
  assert.equal(en.n, 3)
  assert.ok(!('titleEn' in en))
  assert.equal(data.title, '港口')
  assert.equal(localize(data, 'zh-Hant'), data)
  assert.equal(localize(data, 'en'), en)
})

test('localize：年代資料換成英文後，所有年代都有英文名稱與說明', () => {
  for (const era of ERAS) {
    const en = localize(era, 'en')
    assert.match(en.title, /^[\x20-\x7e]+$/, era.id)
    assert.match(en.description, /^[\x20-\x7e]+$/, era.id)
  }
})

test('app.title：兩種語言都有分頁標題，中文與 index.html 的標題一致', async () => {
  const { readFileSync } = await import('node:fs')
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.ok(html.includes(`<title>${translate('zh-Hant', 'app.title')}</title>`))
  assert.match(translate('en', 'app.title'), /^[\x20-\x7e|]+$/)
})
