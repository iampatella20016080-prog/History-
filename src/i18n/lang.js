import { STRINGS } from './strings.js'

export const LANGS = ['zh-Hant', 'en']
export const DEFAULT_LANG = 'zh-Hant'
const STORAGE_KEY = 'ddc-lang'

export function isLang(value) {
  return LANGS.includes(value)
}

/** 讀取記在這台裝置上的語言；讀不到（私密模式、被封鎖）就用預設 */
export function loadLang(storage = typeof window === 'undefined' ? null : window.localStorage) {
  try {
    const value = storage?.getItem(STORAGE_KEY)
    return isLang(value) ? value : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

/** 網址 ?lang=en（或 zh）優先於記住的選擇；不認得的值忽略 */
export function langFromSearch(search) {
  try {
    const value = new URLSearchParams(search ?? '').get('lang')
    if (value === 'zh' || value === 'zh-Hant' || value === 'zh-TW') return 'zh-Hant'
    return value === 'en' ? 'en' : null
  } catch {
    return null
  }
}

export function initialLang(search = typeof window === 'undefined' ? '' : window.location.search) {
  return langFromSearch(search) ?? loadLang()
}

/** 把 <html lang> 與分頁標題同步成目前語言 */
export function applyDocumentLang(lang) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang
  document.title = translate(lang, 'app.title')
}

export function saveLang(lang, storage = typeof window === 'undefined' ? null : window.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, lang)
  } catch {
    /* 寫不進去也不影響使用 */
  }
}

/** 取字串；缺鍵時退回中文，再退回鍵名。{name} 佔位符以 params 代入 */
export function translate(lang, key, params) {
  const text = STRINGS[lang]?.[key] ?? STRINGS[DEFAULT_LANG][key] ?? key
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text
}

/**
 * 店家摘要：英文模式優先用 summaryEn（字串，或像 summaryEn 那樣依年代 id 分開的物件）；
 * 沒有英文時退回中文並標 fallback，介面顯示「中文內容」。
 */
export function shopSummary(shop, lang) {
  if (lang === 'en') {
    const en = typeof shop?.summaryEn === 'object' && shop.summaryEn ? shop.summaryEn[shop.era] : shop?.summaryEn
    if (en) return { text: en, fallback: false }
    const text = shop?.summary ?? ''
    // 店家已經過 localize()：summaryEn 換成了 summary，沒有中文就不算退回
    return { text, fallback: /[\u3400-\u9fff]/.test(text) }
  }
  return { text: shop?.summary ?? '', fallback: false }
}

/** 資料欄位的在地化：英文模式取 `${key}En`，沒有時退回中文欄位 */
export function pick(obj, key, lang) {
  if (!obj) return ''
  if (lang === 'en') {
    const en = obj[`${key}En`]
    if (en != null && en !== '') return en
  }
  return obj[key] ?? ''
}

const localizeCache = { en: new WeakMap() }

/**
 * 整份資料的在地化：英文模式下，把每個 `key` 換成同層的 `keyEn`（字串對字串、陣列對陣列），
 * 並移除 `keyEn` 欄位本身。回傳新物件（依物件快取，同一份資料同一語言只算一次）；
 * 中文模式直接回傳原物件。只用在純資料（店家、年代、路線節點），不要用在含 Three 物件的結構。
 */
export function localize(data, lang) {
  if (lang !== 'en' || data == null || typeof data !== 'object') return data
  const cached = localizeCache.en.get(data)
  if (cached) return cached
  let result
  if (Array.isArray(data)) {
    result = data.map((item) => localize(item, lang))
  } else if (Object.getPrototypeOf(data) !== Object.prototype) {
    return data
  } else {
    result = {}
    for (const [key, value] of Object.entries(data)) {
      if (key.endsWith('En') && key.length > 2 && sameShape(data[key.slice(0, -2)], value)) continue
      const en = data[`${key}En`]
      if (en !== undefined && en !== '' && sameShape(value, en)) result[key] = en
      else result[key] = localize(value, lang)
    }
  }
  localizeCache.en.set(data, result)
  return result
}

function sameShape(zh, en) {
  if (typeof zh === 'string') return typeof en === 'string'
  if (Array.isArray(zh)) return Array.isArray(en) && en.every((item) => typeof item === 'string') && zh.every((item) => typeof item === 'string')
  return false
}
