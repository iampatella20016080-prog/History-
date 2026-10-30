/**
 * 十字軒糕餅舖（延平北路二段68號）的年代版本：同一個店家 ID、同一個地段，隨年代替換立面、招牌、擺設與室內。
 *
 * 招牌寫「TEN CAKE SINCE 1930」，報導稱創辦人邱炳星約在「1920年代」學做餅、後來創立十字軒；
 * 1853–1895 這塊地還沒有十字軒（只是一般街屋），1930 起才出現，所以只有摩登大稻埕、庶民生活、老屋新生
 * 三個年代。切換年代時只替換這棟建築的立面、招牌、擺設與室內，renderer、鏡頭、操作與整個場景都不重建。
 */
export const SHIZIXUAN_ID = 'shizixuan'

export const shizixuanEraConfig = {
  qingPort: { era: 'qing-port', active: false },
  banquet: { era: 'banquet', active: false },
  1930: { era: 'modern', active: true, variant: 'earlyShop', label: '糕餅店初創', labelEn: 'The pastry shop begins', name: '十字軒（糕餅店）', nameEn: 'Shizixuan (pastry shop)' },
  1945: { era: 'postwar', active: true, variant: 'postwarShop', label: '漢餅與喜慶糕點', labelEn: 'Han-style cakes and celebration pastries', name: '十字軒餅舖', nameEn: 'Shizixuan Cake Shop' },
  2000: { era: 'revival', active: true, variant: 'modernShop', label: '延平北路的老字號', labelEn: 'A long-established shop on Yanping North Road', name: '十字軒糕餅舖', nameEn: 'Shizixuan Pastry Shop' },
}

/** 年代 id → 這個年代的版本設定 */
export const SHIZIXUAN_BY_ERA = Object.fromEntries(
  Object.entries(shizixuanEraConfig)
    .filter(([, item]) => item.active)
    .map(([year, item]) => [item.era, { year: Number(year), ...item }]),
)

export function shizixuanVariantForEra(eraId) {
  return SHIZIXUAN_BY_ERA[eraId] ?? null
}
