/**
 * 有記名茶的年代版本（第 11 階段）：同一棟建築、同一個店家 ID、同一個地段，
 * 隨年代替換店內擺設、人物、資訊熱點與可以近看的器物（做法同林華泰，見 linHuaTaiEraConfig.js）。
 * 兩層樓：二樓（酒樓繁華到庶民生活是揀茶樓、老屋新生是清源堂）可以走樓梯上去。
 *
 * - 1895 酒樓繁華：精製茶廠的前店刷嘜頭、外銷泰國的茶箱（有記這時在建昌街，這棟是歷史情境重建）
 * - 1930 摩登：稻殼焙窟（同上，歷史情境重建）
 * - 1945 庶民生活：1949 年遷入重慶北路現址、臺北市第 5 號登記工廠（依現況照片回推）
 * - 2000 老屋新生：2004 年起前面是門市、後面仍是焙籠間，二樓是清源堂（依官網門市頁照片）
 *
 * 查證與室內設計見 docs/research/interior-you-ji.md。
 */
export const YOU_JI_ID = 'you-ji'

export const youJiEraConfig = {
  1895: { era: 'banquet', variant: 'refineryBanquet', label: '刷嘜頭的精製茶廠', labelEn: 'Marking chests in the refinery' },
  1930: { era: 'modern', variant: 'refineryModern', label: '稻殼焙窟', labelEn: 'Rice-husk roasting pits' },
  1945: { era: 'postwar', variant: 'factoryNo5', label: '第 5 號登記工廠', labelEn: 'Registered factory no. 5' },
  2000: { era: 'revival', variant: 'teaHouseToday', label: '門市、焙籠間與清源堂', labelEn: 'Shop, roasting room and Qingyuan Hall' },
}

/** 年代 id → 這個年代的版本設定 */
export const YOU_JI_BY_ERA = Object.fromEntries(Object.entries(youJiEraConfig).map(([year, item]) => [item.era, { year: Number(year), ...item }]))

export function youJiVariantForEra(eraId) {
  return YOU_JI_BY_ERA[eraId] ?? null
}
