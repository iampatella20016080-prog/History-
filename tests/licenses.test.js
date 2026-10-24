import test from 'node:test'
import assert from 'node:assert/strict'
import { CODE_LICENSE, CONTENT_LICENSE, OPEN_DATA, PHOTO_CREDITS, countSources, groupSourcesByPublisher } from '../src/data/licenses.js'
import { SOURCES } from '../src/data/sources.js'

test('授權頁：文字與插圖採 CC BY-NC-SA 4.0，列出三項條件', () => {
  assert.match(CONTENT_LICENSE.name, /CC BY-NC-SA 4\.0/)
  assert.match(CONTENT_LICENSE.url, /creativecommons\.org\/licenses\/by-nc-sa\/4\.0/)
  assert.equal(CONTENT_LICENSE.terms.length, 3)
})

test('授權頁：專案沒有 LICENSE 檔時，程式碼授權寫「待決定」', async () => {
  const { existsSync } = await import('node:fs')
  if (!existsSync(new URL('../LICENSE', import.meta.url))) {
    assert.equal(CODE_LICENSE.decided, false)
    assert.match(CODE_LICENSE.text, /待決定/)
  }
})

test('授權頁：列出 sources.js 的所有文獻，每筆都有 citation 與網址', () => {
  const groups = groupSourcesByPublisher()
  const items = groups.flatMap((group) => group.items)
  assert.equal(items.length, countSources())
  assert.equal(items.length, Object.keys(SOURCES).length)
  assert.deepEqual(new Set(items.map((item) => item.id)), new Set(Object.keys(SOURCES)))
  for (const item of items) {
    assert.ok(item.citation, item.id)
    assert.match(item.url ?? '', /^https?:\/\//, item.id)
  }
})

test('授權頁：文獻依 publisher 分組，同一組的出版單位相同', () => {
  const groups = groupSourcesByPublisher()
  assert.equal(new Set(groups.map((group) => group.publisher)).size, groups.length)
  for (const group of groups) {
    for (const item of group.items) assert.equal(SOURCES[item.id].publisher, group.publisher)
  }
})

test('授權頁：記憶庫只標已查證的 CC BY 3.0 TW+，臺灣記憶標不開放授權；老照片如實說明', () => {
  const tcmb = OPEN_DATA.find((item) => item.id === 'tcmb')
  assert.equal(tcmb.license, 'CC BY 3.0 TW+')
  assert.match(tcmb.note, /有記名茶/)
  assert.match(OPEN_DATA.find((item) => item.id === 'tm-ncl').license, /不開放授權/)
  assert.equal(PHOTO_CREDITS.externalPhotos, 0)
})
