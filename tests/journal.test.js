import test from 'node:test'
import assert from 'node:assert/strict'
import { JOURNAL_KINDS, addJournalEntry, hasJournalEntry, journalEntries, journalEras, loadJournal, newJournal, saveJournal } from '../src/game/journal.js'

function fakeStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => (data[key] = value),
    data,
  }
}

test('探索手記：同一個 id 只記一次，第一次的時間保留', () => {
  let journal = newJournal()
  journal = addJournalEntry(journal, { id: 'talk:a', kind: 'talk', eraId: 'qing-port', title: '挑夫' }, 100)
  const again = addJournalEntry(journal, { id: 'talk:a', kind: 'talk', eraId: 'qing-port', title: '挑夫' }, 200)
  assert.equal(again, journal)
  assert.equal(journal.entries[0].at, 100)
  assert.ok(hasJournalEntry(journal, 'talk:a'))
})

test('探索手記：沒有 id 或種類無效的條目不記', () => {
  const journal = newJournal()
  assert.equal(addJournalEntry(journal, { kind: 'talk', title: 'x' }), journal)
  assert.equal(addJournalEntry(journal, { id: 'x', kind: '不存在', title: 'x' }), journal)
})

test('探索手記：依種類翻看（新的在前面）、走過的年代', () => {
  let journal = newJournal()
  journal = addJournalEntry(journal, { id: 'talk:a', kind: 'talk', eraId: 'qing-port', title: 'a' }, 1)
  journal = addJournalEntry(journal, { id: 'object:b', kind: 'object', eraId: 'qing-port', title: 'b' }, 2)
  journal = addJournalEntry(journal, { id: 'talk:c', kind: 'talk', eraId: 'revival', title: 'c' }, 3)
  assert.deepEqual(journalEntries(journal, 'talk').map((entry) => entry.id), ['talk:c', 'talk:a'])
  assert.equal(journalEntries(journal).length, 3)
  assert.deepEqual(journalEras(journal), ['qing-port', 'revival'])
  for (const entry of journal.entries) assert.ok(JOURNAL_KINDS[entry.kind])
})

test('探索手記：localStorage 的載入與寫回（壞資料退回空手記）', () => {
  const storage = fakeStorage()
  let journal = newJournal()
  journal = addJournalEntry(journal, { id: 'shop:x@qing-port', kind: 'shop', eraId: 'qing-port', title: 'x' }, 5)
  saveJournal(journal, storage)
  assert.deepEqual(loadJournal(storage), journal)
  assert.deepEqual(loadJournal(fakeStorage({ 'ddc-journal-v1': '垃圾{' })), newJournal())
  assert.deepEqual(loadJournal(fakeStorage({ 'ddc-journal-v1': '{"entries":[{"id":"a","kind":"怪"},{"id":"b","kind":"talk"}]}' })).entries.length, 1)
  assert.deepEqual(loadJournal(null), newJournal())
})
