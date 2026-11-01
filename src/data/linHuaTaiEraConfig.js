/**
 * 林華泰茶行的年代版本（第 11 階段）：同一棟建築、同一個店家 ID、同一個地段，
 * 隨年代替換招牌、店內擺設、人物、資訊熱點與可以近看的器物（做法同稻舍，見 riceAndShineEraConfig.js）。
 *
 * - 1853 港口商街：毛茶的篩選與精製（第 10 階段已建，配置在 linHuaTaiQingLayout.js）
 * - 1895 酒樓繁華：揀茶與包種茶的四方包（日治時期大稻埕茶業的一般情形；林華泰本身這個時期的紀錄查無）
 * - 1930 摩登：炭焙暖房（家族口述：三十幾個圓火坑分四排）
 * - 1945 庶民生活：批發茶行、大型乾燥機與縮減的焙坑、茉莉花薰茶（家族口述）
 * - 2000 老屋新生：重慶北路的「前店後廠」，近百個大茶桶（官網、Discover Taipei 等公開資料）
 *
 * 店面與各年代的格局都是歷史情境重建；店址的遷移與建築年代查無（docs/research/lin-hua-tai.md）。
 */
export const LIN_HUA_TAI_ID = 'lin-hua-tai'

export const linHuaTaiEraConfig = {
  1853: { era: 'qing-port', variant: 'qingPort', label: '毛茶的篩選與精製', labelEn: 'Sorting and refining crude tea' },
  1895: { era: 'banquet', variant: 'baozhongHong', label: '揀茶與包種茶', labelEn: 'Tea sorting and baozhong packets' },
  1930: { era: 'modern', variant: 'charcoalRoastery', label: '炭焙暖房', labelEn: 'The charcoal-roasting room' },
  1945: { era: 'postwar', variant: 'wholesaleHong', label: '批發茶行與乾燥機', labelEn: 'Wholesale hong and drying machine' },
  2000: { era: 'revival', variant: 'heritageHong', label: '前店後廠', labelEn: 'Shop in front, factory behind' },
}

/** 年代 id → 這個年代的版本設定 */
export const LIN_HUA_TAI_BY_ERA = Object.fromEntries(Object.entries(linHuaTaiEraConfig).map(([year, item]) => [item.era, { year: Number(year), ...item }]))

export function linHuaTaiVariantForEra(eraId) {
  return LIN_HUA_TAI_BY_ERA[eraId] ?? null
}
