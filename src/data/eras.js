/**
 * 歷史時期設定
 *
 * 網站最終規劃五個時期；第一階段只開放第一個時期（status: 'open'）。
 * 其餘時期先保留主題文字，之後新增店家、街景時再補上名稱與內容。
 */
export const ERAS = [
  {
    id: 'qing-port',
    order: 1,
    years: '1853–1895',
    name: '港口商街',
    theme: '清末移民、南北貨與茶葉貿易',
    status: 'open',
  },
  {
    id: 'japanese-early',
    order: 2,
    years: '1895–1930',
    name: null,
    theme: '日治初期、酒樓宴席文化',
    status: 'planned',
  },
  {
    id: 'modern-city',
    order: 3,
    years: '1930–1945',
    name: null,
    theme: '都市現代化、西餐與咖啡文化',
    status: 'planned',
  },
  {
    id: 'postwar-market',
    order: 4,
    years: '1945–1980',
    name: null,
    theme: '戰後市場與庶民飲食',
    status: 'planned',
  },
  {
    id: 'revival',
    order: 5,
    years: '2000–現在',
    name: null,
    theme: '老屋再生與當代飲食文化',
    status: 'planned',
  },
]

export const DEFAULT_ERA_ID = 'qing-port'

export function getEra(id) {
  return ERAS.find((era) => era.id === id) ?? null
}
