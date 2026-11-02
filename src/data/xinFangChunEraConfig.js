/**
 * 新芳春茶行的年代版本（第 11 階段）：同一棟三層洋樓、同一個店家 ID、同一個地段，
 * 隨年代替換店內擺設、人物、資訊熱點與可以近看的器物（做法同有記名茶，見 youJiEraConfig.js）。
 * 一樓與二樓可以走（正廳右後的樓梯上二樓）；三樓是王家住家與公媽廳，不開放、不畫。
 *
 * - 1930 摩登：1934 年落成、營運中的茶行（擺設依文獻與現存機具回推）
 * - 1945 庶民生活：1950 年改組兩合公司，之後逐漸收起、部分出租；二樓有王氏宗親會籌備處
 * - 2000 老屋新生：2016 年起的茶葉故事館（依 Wikimedia Commons 與《臺灣工藝》77 期的照片）
 *
 * 查證與室內設計見 docs/research/interior-xin-fang-chun.md。
 */
export const XIN_FANG_CHUN_ID = 'xin-fang-chun'

export const xinFangChunEraConfig = {
  1930: { era: 'modern', variant: 'teaMansion1934', label: '臺北最大的茶工廠', labelEn: 'The largest tea factory in Taipei' },
  1945: { era: 'postwar', variant: 'limitedPartnership', label: '兩合公司與王氏宗親會', labelEn: 'The partnership and the clan association' },
  2000: { era: 'revival', variant: 'teaStoryHouse', label: '茶葉故事館', labelEn: 'The tea story house' },
}

/** 年代 id → 這個年代的版本設定 */
export const XIN_FANG_CHUN_BY_ERA = Object.fromEntries(Object.entries(xinFangChunEraConfig).map(([year, item]) => [item.era, { year: Number(year), ...item }]))

export function xinFangChunVariantForEra(eraId) {
  return XIN_FANG_CHUN_BY_ERA[eraId] ?? null
}
