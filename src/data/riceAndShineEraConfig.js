/**
 * 迪化街一段329號店屋（稻舍 Rice & Shine）的年代版本：同一棟建築、同一個 ID，隨年代替換立面、招牌、擺設、人物、室內與燈光。
 *
 * 1853 這塊地是一般街屋（不是可以探索的地點）；1895 開始出現米業用途；1930 才完整建立 329 號紅磚店屋的建築語彙；
 * 1945 同一棟店屋老化、米業衰退；2000 起才出現現在的「稻舍 Rice & Shine」。早期年代不出現「稻舍」的品牌。
 * 切換年代時只替換這棟建築的立面、招牌、擺設、人物、室內擺設、燈光與店家狀態；renderer、鏡頭、操作與整個場景都不重建。
 */
export const RICE_AND_SHINE_ID = 'rice-and-shine-329'

export const riceAndShineEraConfig = {
  1853: { era: 'qing-port', active: false, variant: 'earlyStreet' },
  1895: { era: 'banquet', active: true, variant: 'earlyRiceTrade', label: '北街米業逐漸形成', labelEn: 'The rice trade takes shape on North Street', name: '北街米業店屋（迪化街329號）', nameEn: 'North Street rice-trade shophouse (329 Dihua Street)' },
  1930: { era: 'modern', active: true, variant: 'riceMill', label: '米行與碾米產業', labelEn: 'Rice shops and the rice-milling trade', name: '迪化街329號米行／碾米間', nameEn: '329 Dihua Street rice shop and mill' },
  1945: { era: 'postwar', active: true, variant: 'postwarRiceHouse', label: '戰後米業與產業轉變', labelEn: 'The postwar rice trade and industrial change', name: '迪化街329號米行（戰後）', nameEn: '329 Dihua Street rice shop (postwar)' },
  2000: { era: 'revival', active: true, variant: 'riceAndShineModern', label: '老屋再生・稻舍', labelEn: 'Old house reborn: Rice & Shine', name: '稻舍 Rice & Shine', nameEn: 'Rice & Shine' },
}

/** 年代 id → 這個年代的版本設定 */
export const RICE_AND_SHINE_BY_ERA = Object.fromEntries(Object.entries(riceAndShineEraConfig).map(([year, item]) => [item.era, { year: Number(year), ...item }]))

export function riceVariantForEra(eraId) {
  return RICE_AND_SHINE_BY_ERA[eraId] ?? null
}

/** 各版本可以走到的範圍（1895 的街屋不能進去，只有街邊的米業擺設；1930 起可以走進店屋） */
export const VARIANT_SPACES = {
  earlyRiceTrade: ['street'],
  riceMill: ['arcade', 'front', 'courtyard', 'back'],
  postwarRiceHouse: ['arcade', 'front', 'courtyard', 'back'],
  riceAndShineModern: ['arcade', 'front', 'courtyard', 'back', 'stairs', 'upstairs'],
}
