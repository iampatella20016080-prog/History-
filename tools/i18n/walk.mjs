// 英文版盤點與覆蓋率測試共用的遍歷邏輯
export const CJK = /[㐀-鿿]/
export const hasCjk = (s) => typeof s === 'string' && CJK.test(s)
/** 不需要英文的欄位：內部識別、招牌圖集上的原樣文字、台語／羅馬拼音原文 */
export const EXEMPT_KEYS = new Set(['url', 'seals', 'smallSign', 'hangingSign', 'lanterns', 'sign', 'signText', 'signLines', 'original', 'quote', 'taiwanese', 'romanization', 'zh', 'hanzi', 'script'])

/** 遍歷資料物件：每個含中文的字串，檢查同層有沒有 `${key}En` */
const SIGN_KEYS = new Set(['sign', 'smallSign', 'hangingSign', 'lanterns'])

export function walk(value, trail, out, seen = new Set(), parent = null, pkey = '') {
  if (value == null || typeof value === 'function') return
  if (typeof value === 'object') {
    if (seen.has(value)) return
    seen.add(value)
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'string' && hasCjk(item)) out.push({ path: `${trail}[${i}]`, text: item, key: trail.split('.').pop(), covered: coveredArray(parent, pkey, i) })
        else walk(item, `${trail}[${i}]`, out, seen, null, '')
      })
      return
    }
    for (const [k, v] of Object.entries(value)) {
      if (/En$/.test(k) || SIGN_KEYS.has(k)) continue // 英文欄位本身（可以夾中文原名）與招牌字樣不檢查
      if (typeof v === 'string' && hasCjk(v)) {
        out.push({ path: `${trail}.${k}`, text: v, key: k, parent: value, covered: coveredKey(value, k) })
      } else walk(v, `${trail}.${k}`, out, seen, value, k)
    }
  }
}
const coveredKey = (obj, k) => {
  if (/En$/.test(k)) return true // 英文欄位本身
  const en = obj[`${k}En`]
  return Boolean(en && (typeof en !== 'string' || en.trim()))
}
// 字串陣列：英文放在同層 `${name}En` 陣列的同一個位置
const coveredArray = (parent, key, i) => Boolean(parent && Array.isArray(parent[`${key}En`]) && parent[`${key}En`][i])

