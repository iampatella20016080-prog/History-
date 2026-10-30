/**
 * 十字軒糕餅舖（延平北路二段68號）的資料與介紹章節
 *
 * 已查證史實（附 sourceIds）附在〈鏡週刊〉2024年8月的報導；店內擺設、人物與尺寸是依報導描述與
 * 一般糕餅店樣貌的情境示意，並非測繪或實際陳設。五個生命禮俗的文化節點（滿月、收涎、婚嫁、祝壽、祭祀）
 * 是教育部辭典的通用釋義，不代表十字軒特定商品的實際配方或包裝。
 */

export const SZX_RECORD = {
  id: 'shizixuan',
  address: '臺北市大同區延平北路二段68號', addressEn: 'No. 68, Section 2, Yanping North Road, Datong District, Taipei',
  founder: { name: '邱炳星', nameEn: 'Qiu Bingxing', note: '12歲到日本人開的麵包店學藝，先做西點麵包，後來接做婚嫁用的漢餅，再因鄰近霞海城隍廟做起壽桃生意。', noteEn: 'At the age of 12 he went to learn the trade at a bakery run by a Japanese owner; he first made Western-style pastries and bread, later took on Han-style cakes (hanbing) for weddings, and then, because of the shop\'s closeness to the Xiahai City God Temple, went into the longevity-peach (shoutao) business.' },
  generations: ['邱炳星（創辦人）', '邱獻德（第二代）', '邱易為（第三代）'], generationsEn: ['Qiu Bingxing (founder)', 'Qiu Xiande (second generation)', 'Qiu Yiwei (third generation)'],
  sourceIds: ['mirrormedia-2024-shizixuan'],
}

export const SZX_FACTS = [
  { id: 'founding', text: '十字軒糕餅舖創辦於1920年代，店招寫「TEN CAKE SINCE 1930」；報導中以2024年計已經營94年。', textEn: 'Shizixuan Pastry Shop was founded in the 1920s; its shop sign reads "TEN CAKE SINCE 1930", and the report counts 94 years in business as of 2024.', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'founder', text: '創辦人邱炳星12歲到日本人開的麵包店學藝，先賣西點麵包，後來接做婚嫁用的漢餅。', textEn: 'The founder, Qiu Bingxing, went at the age of 12 to learn the trade at a bakery run by a Japanese owner; he first sold Western-style pastries and bread, and later took on Han-style cakes (hanbing) for weddings.', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'temple', text: '因為鄰近霞海城隍廟，十字軒也做起壽桃生意，壽桃是全盛時期銷量最好的商品，一天可賣超過一萬顆。', textEn: 'Because it stands close to the Xiahai City God Temple, Shizixuan also went into the longevity-peach (shoutao) business; the peaches were its best-selling product at its peak, selling more than ten thousand in a day.', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'peak', text: '全盛時期漢餅、西點、包子分開設廠，師傅將近20位；第二代邱獻德、第三代邱易為接手經營。', textEn: 'At its peak, Han-style cakes, Western-style pastries and steamed buns were made in separate workshops, with nearly 20 master bakers; the second generation, Qiu Xiande, and the third, Qiu Yiwei, then took over the business.', sourceIds: ['mirrormedia-2024-shizixuan'] },
]

export const SZX_SCENARIO = [
  { id: 'eras', text: '報導沒有記載1930–1980之間店面的實際樣貌；1930的窄身店屋與1945的戰後店面是依一般糕餅店的樣貌重建的歷史情境示意。', textEn: 'The report does not record what the shopfront actually looked like between 1930 and 1980; the narrow 1930 shophouse and the 1945 postwar shopfront are reconstructed historical scenes based on how pastry shops generally looked.' },
  { id: 'facade2000', text: '2000–現在的外觀依實地照片的立面語彙（三層樓米色建築、兩個騎樓開間、紅底金字招牌）重建，不是逐一測繪。', textEn: 'The exterior for 2000–present is rebuilt from the facade vocabulary seen in on-site photographs (a three-storey cream-coloured building, two arcade bays, a red sign with gold lettering), not surveyed measurement by measurement.' },
  { id: 'culture', text: '滿月、收涎、婚嫁、祝壽、祭祀五個文化節點是教育部辭典的通用釋義，說明這些糕餅在人生禮俗中的用途，不是十字軒特定商品的配方或包裝紀錄。', textEn: 'The five cultural points — the full-month celebration, shouyan, weddings, birthdays and ritual offerings — are general definitions from the Ministry of Education dictionary, explaining what these cakes are used for in life-cycle customs; they are not records of any specific Shizixuan product\'s recipe or packaging.' },
]

const SOURCES_ALL = ['mirrormedia-2024-shizixuan', 'moe-man-yue', 'moe-shou-yan', 'moe-xi-bing', 'moe-shou-tao', 'moe-hong-gui']

const sourcesChapter = {
  id: 'sources',
  type: 'sources',
  tab: '參考文獻', tabEn: 'References',
  title: '參考文獻', titleEn: 'References',
  intro: '十字軒糕餅舖與糕餅禮俗的介紹整理自下列資料，點選即可開啟原始網頁。每一筆都註明出版時間與用途。', introEn: 'The introductions to Shizixuan Pastry Shop and to pastry customs are compiled from the sources below; select one to open the original web page. Each entry notes its publication date and how it was used.',
  sourceIds: SOURCES_ALL,
  disclaimer: '1930、1945的店面與擺設是依報導描述與一般糕餅店樣貌重建的歷史情境示意；2000–現在的外觀依實地照片重建，尺寸為估算。', disclaimerEn: 'The 1930 and 1945 shopfronts and furnishings are reconstructed historical scenes based on the report\'s descriptions and the general look of pastry shops; the exterior for 2000–present is rebuilt from on-site photographs, and dimensions are estimated.',
}

/* ═══════════ 五個生命禮俗的文化節點（各年代共用） ═══════════ */

const cultureChapter = (id, [tab, tabEn], [title, titleEn], [lead, leadEn], [paragraphs, paragraphsEn], sourceIds) => ({
  id,
  type: 'text',
  tab,
  tabEn,
  title,
  titleEn,
  lead,
  leadEn,
  paragraphs,
  paragraphsEn,
  sourceIds,
})

const CULTURE_CHAPTERS = [
  cultureChapter(
    'culture-man-yue',
    ['滿月', 'Full Month'],
    ['滿月：彌月紅圓', 'Full Month: Red Rice Balls for the Baby\'s First Month'],
    ['嬰兒出生滿一個月稱為「滿月」，也稱「彌月」，親友會分送紅圓等糕點誌喜。', 'A baby who has reached one month old is said to have reached "manyue" (full month), also called "miyue"; relatives and friends share cakes such as red rice balls to mark the joy.'],
    [['辭典釋義：初生的嬰兒滿一個月，稱為「滿月」，也稱為「彌月」。'], ['Dictionary definition: when a newborn baby reaches one month, it is called "manyue" (full month), also called "miyue".']],
    ['moe-man-yue'],
  ),
  cultureChapter(
    'culture-shou-yan',
    ['收涎', 'Shouyan'],
    ['收涎：收瀾鹹光餅', 'Shouyan: Biscuits for "Gathering the Drool"'],
    ['嬰兒滿四個月時，用紅絲線串起口酥餅掛在脖子上，逐一咬餅，祈求「收瀾收離離，囡仔好育飼」。', 'When a baby reaches four months, shortbread biscuits are strung on red thread and hung round its neck, and the biscuits are bitten in turn while a Taiwanese blessing is spoken, wishing that the drooling will stop and the child will be easy to raise.'],
    [['台語稱「收瀾」；辭典釋義提到這個習俗與吉祥話。'], ['In Taiwanese the custom is called "siu-nua" (shouyan, "gathering the drool"); the dictionary definition mentions this custom and its auspicious saying.']],
    ['moe-shou-yan'],
  ),
  cultureChapter(
    'culture-hun-jia',
    ['婚嫁', 'Weddings'],
    ['婚嫁：訂婚喜餅', 'Weddings: Engagement Cakes'],
    ['訂婚時男方贈送女方喜餅，女方再分贈親友，以糕餅告知婚事將近。', 'At an engagement the groom\'s side gives the bride\'s side wedding cakes, which the bride\'s side in turn shares among relatives and friends, announcing through cakes that the marriage is near.'],
    [['辭典釋義：訂婚時，男方贈送女方的禮餅，分贈親友以示告知婚事。'], ['Dictionary definition: at an engagement, the cakes given by the groom\'s side to the bride\'s side, which are shared among relatives and friends to announce the marriage.']],
    ['moe-xi-bing'],
  ),
  cultureChapter(
    'culture-zhu-shou',
    ['祝壽', 'Birthdays'],
    ['祝壽：做壽壽桃', 'Birthdays: Longevity Peaches'],
    ['長輩做壽時以壽桃祝賀，壽桃是鮮桃或麵製的桃形食品，象徵長壽。', 'When an elder celebrates a birthday, longevity peaches are offered in congratulation; a longevity peach is a fresh peach or a peach-shaped food made of dough, symbolising long life.'],
    [['辭典釋義：祝壽時所用的鮮桃，或麵粉製成桃形、象徵長壽的食品。'], ['Dictionary definition: the fresh peaches used at birthday celebrations, or peach-shaped food made of flour that symbolises long life.']],
    ['moe-shou-tao'],
  ),
  cultureChapter(
    'culture-ji-si',
    ['祭祀', 'Ritual Offerings'],
    ['祭祀：祭祀紅龜粿', 'Ritual Offerings: Red Turtle Kueh'],
    ['紅龜粿的粿皮染紅、印上龜型圖樣後蒸製，常用來祭拜神明、酬神或添丁分贈親友。', 'Red turtle kueh has a red-dyed skin, is stamped with a turtle pattern and steamed; it is often used to worship the gods, to give thanks to a deity, or to share with relatives and friends on the birth of a son.'],
    [['辭典釋義：由糯米製成，粿皮染紅、以模具印上龜型圖樣後蒸製；常用來祭拜神明、酬神，或在添丁時分送親友。'], ['Dictionary definition: made of glutinous rice, with a red-dyed skin stamped with a turtle pattern from a mould and then steamed; often used to worship the gods, to give thanks to a deity, or to give to relatives and friends on the birth of a son.']],
    ['moe-hong-gui'],
  ),
]

/* ═══════════ 各年代的介紹章節 ═══════════ */

export const SZX_CHAPTERS = {
  modern: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史', tabEn: 'Shop History',
      title: '十字軒（糕餅店初創）', titleEn: 'Shizixuan (The Pastry Shop\'s Early Days)',
      lead: '窄身的街屋糕餅店：前舖賣西點麵包與傳統糕餅，後坊是製餅的工作間。', leadEn: 'A narrow shophouse pastry shop: Western-style pastries, bread and traditional cakes are sold at the front, and the workshop for making cakes is at the back.',
      summary: { text: '報導記載創辦人邱炳星12歲到日本人開的麵包店學藝，先賣西點麵包，後來接做婚嫁用的漢餅。報導中提及創業於「1920年代」。', textEn: 'The report records that the founder, Qiu Bingxing, went at the age of 12 to learn the trade at a bakery run by a Japanese owner, first sold Western-style pastries and bread, and later took on Han-style cakes (hanbing) for weddings. The report places the founding in the "1920s".' },
      paragraphs: ['場景把紅磚木構的窄身街屋放在這個年代，表現糕餅店初創時的樣貌；店內陳設是依一般糕餅店的樣貌重建的歷史情境示意。'], paragraphsEn: ['The scene places a narrow red-brick and timber-framed shophouse in this era to show the pastry shop in its early days; the interior furnishings are a reconstructed historical scene based on how pastry shops generally looked.'],
      facts: [
        { label: '創辦人', labelEn: 'Founder', value: '邱炳星', valueEn: 'Qiu Bingxing' },
        { label: '品項', labelEn: 'Products', value: '西點麵包、傳統糕餅、初期漢餅', valueEn: 'Western-style pastries and bread, traditional cakes, early Han-style cakes' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項', tabEn: 'Products',
      title: '西點麵包與初期漢餅', titleEn: 'Western-Style Pastries and Early Han-Style Cakes',
      lead: '帳桌上擺著剛出爐的西點麵包，也開始接做婚嫁用的漢餅。', leadEn: 'Freshly baked Western-style pastries and bread sit on the counter, and the shop has begun to take on Han-style cakes for weddings.',
      paragraphs: ['報導記載創辦人先以西點麵包起家，後來因應婚嫁需求開始製作漢餅，是十字軒最早的兩類商品。'], paragraphsEn: ['The report records that the founder started out with Western-style pastries and bread and later began making Han-style cakes to meet the demand for weddings; these were Shizixuan\'s earliest two kinds of product.'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
  postwar: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史', tabEn: 'Shop History',
      title: '十字軒餅舖（戰後）', titleEn: 'Shizixuan Pastry Shop (Postwar)',
      lead: '戰後的十字軒擴大為兩個店面寬，漢餅、壽桃與祭祀糕點是主力商品。', leadEn: 'After the war Shizixuan expanded to two shopfronts wide, with Han-style cakes, longevity peaches and ritual cakes as its main products.',
      summary: { text: '報導記載十字軒因鄰近霞海城隍廟做起壽桃生意，壽桃是全盛時期銷量最好的商品，一天可賣超過一萬顆；全盛時期漢餅、西點、包子分開設廠，師傅將近20位。', textEn: 'The report records that Shizixuan went into the longevity-peach business because of its closeness to the Xiahai City God Temple; the peaches were its best-selling product at its peak, selling more than ten thousand in a day, and at that peak Han-style cakes, Western-style pastries and steamed buns were made in separate workshops with nearly 20 master bakers.' },
      paragraphs: ['場景把土黃色的戰後店面放在這個年代，木製餅櫃、紙盒與竹籮是當時常見的包裝與陳設方式，依一般糕餅店樣貌重建的歷史情境示意。'], paragraphsEn: ['The scene places an ochre-coloured postwar shopfront in this era; wooden cake cabinets, paper boxes and bamboo baskets were common packaging and display methods of the time. This is a reconstructed historical scene based on how pastry shops generally looked.'],
      facts: [
        { label: '主力商品', labelEn: 'Main products', value: '漢餅、喜餅、壽桃、紅龜、祭祀糕餅、節慶糕點', valueEn: 'Han-style cakes, wedding cakes, longevity peaches, red turtle kueh, ritual cakes, festival pastries' },
        { label: '全盛時期', labelEn: 'At its peak', value: '漢餅、西點、包子分開設廠，師傅近20位', valueEn: 'Han-style cakes, Western-style pastries and steamed buns made in separate workshops, with nearly 20 master bakers' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項', tabEn: 'Products',
      title: '漢餅、壽桃與祭祀糕點', titleEn: 'Han-Style Cakes, Longevity Peaches and Ritual Cakes',
      lead: '木製餅櫃裡是漢餅與喜餅，紙盒與竹籮裝著壽桃、紅龜與節慶糕點。', leadEn: 'The wooden cabinets hold Han-style cakes and wedding cakes, while paper boxes and bamboo baskets hold longevity peaches, red turtle kueh and festival pastries.',
      paragraphs: ['壽桃因鄰近霞海城隍廟而成為主力商品；紅龜、祭祀糕餅則配合祭祀與節慶需求製作。'], paragraphsEn: ['Longevity peaches became a main product because of the shop\'s closeness to the Xiahai City God Temple; red turtle kueh and ritual cakes were made to meet the needs of ritual offerings and festivals.'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
  revival: [
    {
      id: 'szx-intro',
      type: 'text',
      tab: '店史', tabEn: 'Shop History',
      title: '十字軒糕餅舖', titleEn: 'Shizixuan Pastry Shop',
      lead: '延平北路二段68號的老字號：三層樓米色建築，紅底金字招牌寫著「TEN CAKE SINCE 1930」。', leadEn: 'A long-established shop at No. 68, Section 2, Yanping North Road: a three-storey cream-coloured building with a red-and-gold sign reading "TEN CAKE SINCE 1930".',
      summary: { text: '報導記載第二代邱獻德、第三代邱易為接手經營；店招上的「TEN CAKE SINCE 1930」呼應報導所述約1920年代創業、經營94年（以2024年計）的歷史。', textEn: 'The report records that the second generation, Qiu Xiande, and the third, Qiu Yiwei, took over the business; the "TEN CAKE SINCE 1930" on the shop sign echoes the history described in the report: founded around the 1920s and in business for 94 years (counted as of 2024).' },
      paragraphs: ['外觀依實地照片的立面語彙重建：三層樓米色建築、兩個騎樓開間、木框窗與紅底金字招牌；店內有木作天花、玻璃展示櫃、紅色禮盒牆與歷史展示角，陳列老照片、獎狀與老物件。'], paragraphsEn: ['The exterior is rebuilt from the facade vocabulary seen in on-site photographs: a three-storey cream-coloured building, two arcade bays, timber-framed windows and a red-and-gold sign. Inside are a timber ceiling, glass display cases, a wall of red gift boxes and a history corner showing old photographs, certificates and old objects.'],
      facts: [
        { label: '地址', labelEn: 'Address', value: '延平北路二段68號', valueEn: 'No. 68, Section 2, Yanping North Road' },
        { label: '傳承', labelEn: 'Succession', value: '邱炳星 → 邱獻德 → 邱易為', valueEn: 'Qiu Bingxing → Qiu Xiande → Qiu Yiwei' },
      ],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-products',
      type: 'text',
      tab: '品項', tabEn: 'Products',
      title: '紅色禮盒與包裝糕餅', titleEn: 'Red Gift Boxes and Packaged Cakes',
      lead: '玻璃展示櫃與牆面的包裝糕餅，紅色禮盒延續訂婚喜餅與節慶送禮的傳統。', leadEn: 'Packaged cakes fill the glass display cases and the walls, and the red gift boxes carry on the tradition of engagement cakes and festival gifts.',
      paragraphs: ['現在的十字軒仍延續漢餅、壽桃等傳統品項，以紅色禮盒與包裝糕餅因應現代送禮的需求。'], paragraphsEn: ['Today Shizixuan still carries on traditional products such as Han-style cakes and longevity peaches, using red gift boxes and packaged cakes to meet modern gift-giving needs.'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    {
      id: 'szx-history',
      type: 'text',
      tab: '歷史展示', tabEn: 'History Display',
      title: '老照片與獎狀', titleEn: 'Old Photographs and Certificates',
      lead: '展示角陳列老照片、獎狀、老電話與擺件，記錄三代人的經營歷程。', leadEn: 'The display corner shows old photographs, certificates, an old telephone and ornaments, recording three generations of running the shop.',
      paragraphs: ['報導記載第二代邱獻德、第三代邱易為接手經營；展示角的老照片、獎狀與老物件是呼應這段傳承歷史的情境陳設，並非逐一複製報導中的實際物件。'], paragraphsEn: ['The report records that the second generation, Qiu Xiande, and the third, Qiu Yiwei, took over the business; the old photographs, certificates and objects in the display corner are a staged scene echoing this history of succession, and are not copies of the actual objects in the report.'],
      sourceIds: ['mirrormedia-2024-shizixuan'],
    },
    ...CULTURE_CHAPTERS,
    sourcesChapter,
  ],
}

export const SZX_ERA_NOTES = {
  modern: '窄身的街屋糕餅店：前舖賣西點麵包與傳統糕餅，後坊是製餅的工作間；報導記載創辦人邱炳星約在1920年代創業。', modernEn: 'A narrow shophouse pastry shop: Western-style pastries, bread and traditional cakes are sold at the front, and the cake-making workshop is at the back; the report records that the founder, Qiu Bingxing, started the business around the 1920s.',
  postwar: '戰後擴大為兩個店面寬的餅舖：木製餅櫃、紙盒與竹籮裝著漢餅、壽桃與祭祀糕點，因鄰近霞海城隍廟而主打壽桃。', postwarEn: 'A pastry shop expanded after the war to two shopfronts wide: wooden cabinets, paper boxes and bamboo baskets hold Han-style cakes, longevity peaches and ritual cakes, with longevity peaches as the speciality because of the shop\'s closeness to the Xiahai City God Temple.',
  revival: '延平北路二段68號的老字號：三層樓米色建築、紅底金字招牌，店內有玻璃展示櫃、紅色禮盒牆與記錄三代傳承的歷史展示角。', revivalEn: 'A long-established shop at No. 68, Section 2, Yanping North Road: a three-storey cream-coloured building with a red-and-gold sign, and inside, glass display cases, a wall of red gift boxes and a history corner recording three generations of succession.',
}
