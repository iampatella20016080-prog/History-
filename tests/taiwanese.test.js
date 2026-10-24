import test from 'node:test'
import assert from 'node:assert/strict'
import { SHOPS } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'

function glossaryEntries() {
  const out = []
  for (const shop of SHOPS) {
    const chapters = [...(shop.chapters ?? []), ...Object.values(shop.eras ?? {}).flatMap((era) => era.chapters ?? [])]
    for (const chapter of chapters) for (const entry of chapter.glossary ?? []) out.push({ shop: shop.id, entry })
  }
  return out
}

test('台語讀音：有 taiwanese 的名詞都有教育部辭典的來源，網址是 sutian.moe.edu.tw 的詞條', () => {
  const withReading = glossaryEntries().filter(({ entry }) => entry.taiwanese)
  assert.ok(withReading.length >= 9)
  for (const { shop, entry } of withReading) {
    const source = getSource(entry.taiwaneseSource)
    assert.ok(source, `${shop}/${entry.term} 缺少來源`)
    assert.equal(source.publisher, '教育部')
    assert.match(source.url, /^https:\/\/sutian\.moe\.edu\.tw\/zh-hant\/su\/\d+\/$/)
  }
})

test('台語讀音：是台羅（小寫字母、連字號與調符），不含漢字或空白', () => {
  for (const { entry } of glossaryEntries()) {
    if (!entry.taiwanese) continue
    assert.match(entry.taiwanese.normalize('NFD'), /^[a-z̀-̍͘-]+$/, entry.term)
  }
})

test('台語讀音：同一個詞在各店家的讀音一致', () => {
  const seen = new Map()
  for (const { entry } of glossaryEntries()) {
    if (!entry.taiwanese) continue
    if (seen.has(entry.term)) assert.equal(entry.taiwanese, seen.get(entry.term), entry.term)
    seen.set(entry.term, entry.taiwanese)
  }
})
