import { SOURCES } from './sources.js'

/**
 * 「授權與出處」視窗的資料（純邏輯，不依賴 React）。
 * 只寫已經查證、或專案現況確定的事；還沒決定的項目明寫「待決定」，不替使用者挑。
 */

/** 本站自己的文字與插圖 */
export const CONTENT_LICENSE = {
  id: 'cc-by-nc-sa-4.0',
  name: '創用 CC 姓名標示—非商業性—相同方式分享 4.0 國際（CC BY-NC-SA 4.0）',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant',
  terms: ['姓名標示：使用時請標示本站名稱與作者', '非商業性：不得用於商業目的', '相同方式分享：改作後須以相同授權散布'],
  scope: '本站撰寫的文字與繪製的插圖。引用的文獻、國家文化記憶庫等第三方內容不在此授權範圍，各依其原授權。',
}

/** 程式碼授權：專案目前沒有 LICENSE 檔，授權尚未決定 */
export const CODE_LICENSE = {
  decided: false,
  text: '程式碼授權：待決定（專案目前沒有 LICENSE 檔）。',
}

/** 開放資料與第三方內容 */
export const OPEN_DATA = [
  {
    id: 'tcmb',
    name: '文化部國家文化記憶庫',
    license: 'CC BY 3.0 TW+',
    note: '已在查證紀錄中確認的條目：〈有記名茶〉（阮素芬；國立臺灣工藝研究發展中心建檔）標示為 CC BY 3.0 TW+。其他條目請以各條目頁面標示的授權為準；本站只以改寫的方式摘要。',
  },
  {
    id: 'tm-ncl',
    name: '國家圖書館「臺灣記憶」',
    license: '頁面標示「不開放授權」',
    note: '本站只引用事實，不引用原文。',
  },
]

/** 照片：目前沒有使用外部老照片 */
export const PHOTO_CREDITS = {
  externalPhotos: 0,
  text: '本站目前沒有使用外部老照片。街景與室內的圖樣都是程式產生的原創示意；章節中的實地照片是專案自行取得的拍攝，並非外部老照片。日後若加入老照片，會逐張標示來源與授權。',
}

/** 文獻依 publisher 分組（組內維持 sources.js 的順序） */
export function groupSourcesByPublisher(sources = SOURCES) {
  const groups = new Map()
  for (const source of Object.values(sources)) {
    const key = source.publisher ?? '其他'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ id: source.id, citation: source.citation, url: source.url ?? null })
  }
  return [...groups.entries()]
    .map(([publisher, items]) => ({ publisher, items }))
    .sort((a, b) => b.items.length - a.items.length || a.publisher.localeCompare(b.publisher, 'zh-Hant'))
}

export function countSources(sources = SOURCES) {
  return Object.keys(sources).length
}
