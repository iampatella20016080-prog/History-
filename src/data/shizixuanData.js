/**
 * 十字軒糕餅舖（延平北路二段68號）的資料與介紹章節
 *
 * 已查證史實（附 sourceIds）附在〈鏡週刊〉2024年8月的報導；店內擺設、人物與尺寸是依報導描述與
 * 一般糕餅店樣貌的情境示意，並非測繪或實際陳設。五個生命禮俗的文化節點（滿月、收涎、婚嫁、祝壽、祭祀）
 * 是教育部辭典的通用釋義，不代表十字軒特定商品的實際配方或包裝。
 */

export const SZX_RECORD = {
  id: 'shizixuan',
  address: '臺北市大同區延平北路二段68號',
  founder: { name: '邱炳星', note: '12歲到日本人開的麵包店學藝，先做西點麵包，後來接做婚嫁用的漢餅，再因鄰近霞海城隍廟做起壽桃生意。' },
  generations: ['邱炳星（創辦人）', '邱獻德（第二代）', '邱易為（第三代）'],
  sourceIds: ['mirrormedia-2024-shizixuan'],
}

export const SZX_FACTS = [
  { id: 'founding', text: '十字軒糕餅舖創辦於1920年代，店招寫「TEN CAKE SINCE 1930」；報導中以2024年計已經營94年。', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'founder', text: '創辦人邱炳星12歲到日本人開的麵包店學藝，先賣西點麵包，後來接做婚嫁用的漢餅。', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'temple', text: '因為鄰近霞海城隍廟，十字軒也做起壽桃生意，壽桃是全盛時期銷量最好的商品，一天可賣超過一萬顆。', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'peak', text: '全盛時期漢餅、西點、包子分開設廠，師傅將近20位；第二代邱獻德、第三代邱易為接手經營。', sourceIds: ['mirrormedia-2024-shizixuan'] },
]

export const SZX_SCENARIO = [
  { id: 'eras', text: '報導沒有記載1930–1980之間店面的實際樣貌；1930的窄身店屋與1945的戰後店面是依一般糕餅店的樣貌重建的歷史情境示意。' },
  { id: 'facade2000', text: '2000–現在的外觀依實地照片的立面語彙（三層樓米色建築、兩個騎樓開間、紅底金字招牌）重建，不是逐一測繪。' },
  { id: 'culture', text: '滿月、收涎、婚嫁、祝壽、祭祀五個文化節點是教育部辭典的通用釋義，說明這些糕餅在人生禮俗中的用途，不是十字軒特定商品的配方或包裝紀錄。' },
]

const SOURCES_ALL = ['mirrormedia-2024-shizixuan', 'moe-man-yue', 'moe-shou-yan', 'moe-xi-bing', 'moe-shou-tao', 'moe-hong-gui']

const sourcesChapter = {
  id: 'sources',
  type: 'sources',
  tab: '參考文獻',
  title: '參考文獻',
  intro: '十字軒糕餅舖與糕餅禮俗的介紹整理自下列資料，點選即可開啟原始網頁。每一筆都註明出版時間與用途。',
  sourceIds: SOURCES_ALL,
  disclaimer: '1930、1945的店面與擺設是依報導描述與一般糕餅店樣貌重建的歷史情境示意；2000–現在的外觀依實地照片重建，尺寸為估算。',
}

/* ═══════════ 五個生命禮俗的文化節點（各年代共用） ═══════════ */

const cultureChapter = (id, tab, title, lead, paragraphs, sourceIds) => ({
  id,
  type: 'text',
  tab,
  title,
  lead,
  paragraphs,
  sourceIds,
})

const CULTURE_CHAPTERS = [
  cultureChapter(
    'culture-man-yue',
    '滿月',
    '滿月：彌月紅圓',
    '嬰兒出生滿一個月稱為「滿月」，也稱「彌月」，親友會分送紅圓等糕點誌喜。',
    ['辭典釋義：初生的嬰兒滿一個月，稱為「滿月」，也稱為「彌月」。'],
    ['moe-man-yue'],
  ),
  cultureChapter(
    'culture-shou-yan',
    '收涎',
    '收涎：收瀾鹹光餅',
    '嬰兒滿四個月時，用紅絲線串起口酥餅掛在脖子上，逐一咬餅，祈求「收瀾收離離，囡仔好育飼」。',
    ['台語稱「收瀾」；辭典釋義提到這個習俗與吉祥話。'],
    ['moe-shou-yan'],
  ),
  cultureChapter(
    'culture-hun-jia',
    '婚嫁',
    '婚嫁：訂婚喜餅',
    '訂婚時男方贈送女方喜餅，女方再分贈親友，以糕餅告知婚事將近。',
    ['辭典釋義：訂婚時，男方贈送女方的禮餅，分贈親友以示告知婚事。'],
    ['moe-xi-bing'],
  ),
  cultureChapter(
    'culture-zhu-shou',
    '祝壽',
    '祝壽：做壽壽桃',
    '長輩做壽時以壽桃祝賀，壽桃是鮮桃或麵製的桃形食品，象徵長壽。',
    ['辭典釋義：祝壽時所用的鮮桃，或麵粉製成桃形、象徵長壽的食品。'],
    ['moe-shou-tao'],
  ),
  cultureChapter(
    'culture-ji-si',
    '祭祀',
    '祭祀：祭祀紅龜粿',
    '紅龜粿的粿皮染紅、印上龜型圖樣後蒸製，常用來祭拜神明、酬神或添丁分贈親友。',
    ['辭典釋義：由糯米製成，粿皮染紅、以模具印上龜型圖樣後蒸製；常用來祭拜神明、酬神，或在添丁時分送親友。'],
    ['moe-hong-gui'],
  ),
]

/* ═══════════ 各年代的介紹章節 ═══════════ */

export const SZX_CHAPTERS = {
  modern: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史',
      title: '十字軒（糕餅店初創）',
      lead: '窄身的街屋糕餅店：前舖賣西點麵包與傳統糕餅，後坊是製餅的工作間。',
      summary: { text: '報導記載創辦人邱炳星12歲到日本人開的麵包店學藝，先賣西點麵包，後來接做婚嫁用的漢餅。報導中提及創業於「1920年代」。' },
      paragraphs: ['場景把紅磚木構的窄身街屋放在這個年代，表現糕餅店初創時的樣貌；店內陳設是依一般糕餅店的樣貌重建的歷史情境示意。'],
      facts: [
        { label: '創辦人', value: '邱炳星' },
        { label: '品項', value: '西點麵包、傳統糕餅、初期漢餅' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項',
      title: '西點麵包與初期漢餅',
      lead: '帳桌上擺著剛出爐的西點麵包，也開始接做婚嫁用的漢餅。',
      paragraphs: ['報導記載創辦人先以西點麵包起家，後來因應婚嫁需求開始製作漢餅，是十字軒最早的兩類商品。'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
  postwar: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史',
      title: '十字軒餅舖（戰後）',
      lead: '戰後的十字軒擴大為兩個店面寬，漢餅、壽桃與祭祀糕點是主力商品。',
      summary: { text: '報導記載十字軒因鄰近霞海城隍廟做起壽桃生意，壽桃是全盛時期銷量最好的商品，一天可賣超過一萬顆；全盛時期漢餅、西點、包子分開設廠，師傅將近20位。' },
      paragraphs: ['場景把土黃色的戰後店面放在這個年代，木製餅櫃、紙盒與竹籮是當時常見的包裝與陳設方式，依一般糕餅店樣貌重建的歷史情境示意。'],
      facts: [
        { label: '主力商品', value: '漢餅、喜餅、壽桃、紅龜、祭祀糕餅、節慶糕點' },
        { label: '全盛時期', value: '漢餅、西點、包子分開設廠，師傅近20位' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項',
      title: '漢餅、壽桃與祭祀糕點',
      lead: '木製餅櫃裡是漢餅與喜餅，紙盒與竹籮裝著壽桃、紅龜與節慶糕點。',
      paragraphs: ['壽桃因鄰近霞海城隍廟而成為主力商品；紅龜、祭祀糕餅則配合祭祀與節慶需求製作。'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
  revival: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史',
      title: '十字軒糕餅舖',
      lead: '延平北路二段68號的老字號：三層樓米色建築，紅底金字招牌寫著「TEN CAKE SINCE 1930」。',
      summary: { text: '報導記載第二代邱獻德、第三代邱易為接手經營；店招上的「TEN CAKE SINCE 1930」呼應報導所述約1920年代創業、經營94年（以2024年計）的歷史。' },
      paragraphs: ['外觀依實地照片的立面語彙重建：三層樓米色建築、兩個騎樓開間、木框窗與紅底金字招牌；店內有木作天花、玻璃展示櫃、紅色禮盒牆與歷史展示角，陳列老照片、獎狀與老物件。'],
      facts: [
        { label: '地址', value: '延平北路二段68號' },
        { label: '傳承', value: '邱炳星 → 邱獻德 → 邱易為' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項',
      title: '紅色禮盒與包裝糕餅',
      lead: '玻璃展示櫃與牆面的包裝糕餅，紅色禮盒延續訂婚喜餅與節慶送禮的傳統。',
      paragraphs: ['現在的十字軒仍延續漢餅、壽桃等傳統品項，以紅色禮盒與包裝糕餅因應現代送禮的需求。'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-history',
      type: 'text',
      tab: '歷史展示',
      title: '老照片與獎狀',
      lead: '展示角陳列老照片、獎狀、老電話與擺件，記錄三代人的經營歷程。',
      paragraphs: ['報導記載第二代邱獻德、第三代邱易為接手經營；展示角的老照片、獎狀與老物件是呼應這段傳承歷史的情境陳設，並非逐一複製報導中的實際物件。'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
}

export const SZX_ERA_NOTES = {
  modern: '窄身的街屋糕餅店：前舖賣西點麵包與傳統糕餅，後坊是製餅的工作間；報導記載創辦人邱炳星約在1920年代創業。',
  postwar: '戰後擴大為兩個店面寬的餅舖：木製餅櫃、紙盒與竹籮裝著漢餅、壽桃與祭祀糕點，因鄰近霞海城隍廟而主打壽桃。',
  revival: '延平北路二段68號的老字號：三層樓米色建築、紅底金字招牌，店內有玻璃展示櫃、紅色禮盒牆與記錄三代傳承的歷史展示角。',
}
