import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { EXEMPT_KEYS, walk } from '../tools/i18n/walk.mjs'

/** 全部資料檔：每個中文字串欄位都要有非空的 `*En` 對應（招牌、古文原文、台語讀音等刻意保留的欄位除外，見 tools/i18n/walk.mjs） */
function listData(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listData(full)
    return entry.name.endsWith('.js') ? [full] : []
  })
}

for (const file of listData('src/data')) {
  const name = path.relative('src/data', file)
  test(`英文版：${name} 的中文字串都有英文對應`, async () => {
    const mod = await import(pathToFileURL(path.resolve(file)).href)
    const out = []
    for (const [key, value] of Object.entries(mod)) walk(value, key, out)
    const missing = out.filter((item) => !EXEMPT_KEYS.has(item.key) && !item.covered)
    assert.deepEqual(
      missing.slice(0, 10).map((item) => `${item.path}: ${item.text.slice(0, 30)}`),
      [],
      `${name} 缺 ${missing.length} 筆英文`,
    )
  })
}
