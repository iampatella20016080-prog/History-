/**
 * 探索手記（純邏輯，不依賴 React／Three，可以直接單測）
 *
 * 記下看過的器物、聽過的話、走過的店與年代，可以回頭翻看；不用完成百分比。
 * 條目依記下的順序排列，同一個 id 只記一次（第一次的時間保留）。
 *
 * 條目格式：{ id, kind, eraId, title, text?, label?, sourceIds?, at }
 *   kind   talk（聽過的話）、object（看過的器物）、shop（走過的店）、news（讀過的消息）
 *   label  對話與手記的標示（talk.js 的 TALK_LABELS：sourced／folklore／fiction）
 *   at     記下的時間（毫秒）
 */

const STORAGE_KEY = 'ddc-journal-v1'

export const JOURNAL_KINDS = {
  talk: { text: '聽過的話', textEn: 'Heard' },
  object: { text: '看過的器物', textEn: 'Objects' },
  shop: { text: '走過的店', textEn: 'Visited' },
  news: { text: '讀過的消息', textEn: 'News' },
}

export function newJournal() {
  return { entries: [] }
}

/** 記一筆（同一個 id 已經記過時回傳原本的手記，不改動） */
export function addJournalEntry(journal, entry, now = Date.now()) {
  if (!entry?.id || !JOURNAL_KINDS[entry.kind]) return journal
  if (journal.entries.some((item) => item.id === entry.id)) return journal
  return { entries: [...journal.entries, { ...entry, at: now }] }
}

export function hasJournalEntry(journal, id) {
  return journal.entries.some((item) => item.id === id)
}

/** 依種類翻看（kind 省略時全部，新的在前面） */
export function journalEntries(journal, kind = null) {
  const list = kind ? journal.entries.filter((item) => item.kind === kind) : journal.entries
  return [...list].reverse()
}

/** 走過的年代（依第一次記下的順序） */
export function journalEras(journal) {
  const seen = []
  for (const entry of journal.entries) if (entry.eraId && !seen.includes(entry.eraId)) seen.push(entry.eraId)
  return seen
}

/** 從 localStorage 載入（沒有或壞掉時回傳空的手記） */
export function loadJournal(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return newJournal()
    const data = JSON.parse(raw)
    if (!Array.isArray(data?.entries)) return newJournal()
    return { entries: data.entries.filter((item) => item?.id && JOURNAL_KINDS[item.kind]) }
  } catch {
    return newJournal()
  }
}

export function saveJournal(journal, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(journal))
  } catch {
    /* 隱私模式等寫入失敗：手記只留在這一次的瀏覽裡 */
  }
}
