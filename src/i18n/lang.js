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
    return { text: shop?.summary ?? '', fallback: true }
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
