/**
 * 李春生的「人物」小節（第 8 階段，方案 1）：不新增 3D 人物、不新增店家，只加一章文字、出處、年表與地圖，
 * 掛在「港口商街」寶順洋行（dodd-tea-house）的故事裡，排在「建昌街與揀茶女」之後、文獻章之前。
 *
 * 查證紀錄：docs/research/li-chun-sheng.md（沿用 docs/research/tea-export-origins.md）。結論：
 * - 可寫：廈門長大、受洗、學英語 → 寶順行買辦 → 安溪茶苗 → 自營茶商；建昌公司與貴德街；大稻埕教會（甘州街 40 號，
 *   1915 年遷建禮拜堂由他出資規劃監造）與李春生紀念教會（貴德街 44 號，孫輩 1935 年所建）；稱號只寫當時的稱呼並標出處。
 * - 視角：買辦夾在洋行與茶農之間，只寫文獻記下的行動，不推論動機；後代建教會也只寫「誰建、哪一年、以誰為名」。
 * - 待核：來臺年（1865／1866／1868 並列）、建昌公司年份（1886 只見央廣）、四達商行（央廣）、1896 年赴日細節（維基）、
 *   各著作出版年、1901 年任長老（維基）。
 * - 不寫：住址／故居、紀念教會的文資身分與設計者、「首富」「總辦」、思想評價與「第一位思想家」。
 */

export const LI_CHUNSHENG_HOST_SHOP_ID = 'dodd-tea-house'
export const LI_CHUNSHENG_ERA_ID = 'qing-port'

/** 人物小節引用的出處（既有的優先沿用；新增的都有檢核欄位） */
export const LI_CHUNSHENG_SOURCE_IDS = [
  'chen-ciyu-li-family-2015',
  'th-li-chunsheng-memoir',
  'culture-taipei-walk-dadaocheng-2018',
  'taipei-pictorial-480-dihua',
  'pct-li-chunsheng-church',
  'culture-taipei-2002-events',
  'cosmiccare-li-chunsheng-church',
  'culture-taipei-jp-spots',
  'pts-2024-li-chunsheng',
  'ntu-li-chunsheng-works-2004',
  'rti-li-chunsheng-tea',
  'wiki-li-chunsheng',
]

export const LI_CHUNSHENG_PERSON_CHAPTER = {
  id: 'li-person',
  type: 'text',
  tab: '人物：李春生',
  tabEn: 'Person: Lee Chun-sheng',
  title: '人物：李春生——夾在洋行與茶農之間的買辦',
  titleEn: 'Person: Lee Chun-sheng, the comprador between the foreign firm and the tea growers',
  lead: '這一節把前面幾章散開的年份收回到一個人身上：一位在廈門長大的基督徒少年，怎麼成為洋行的買辦，再成為自己開茶行的茶商。只寫文獻記下的行動與當時的稱呼，不替他解釋動機。',
  leadEn: 'This section gathers the years scattered across the earlier chapters into one person: how a Christian youth who grew up in Xiamen became a comprador for a foreign firm, and then a tea merchant running his own tea hong. It records only the actions and the titles of the time that the documents give, and does not explain his motives.',
  paragraphs: [
    '廈門｜1838年1月12日，李春生生在福建廈門，父親是船員（陳慈玉）。他的自敘寫「自幼奉耶穌教，年十五學商業，兼習英國語文」；1851年他在廈門受洗，是長老教會的信徒。1857年起，他在廈門的英商怡記洋行（Elles & Co.）做事，經手洋貨與茶（陳慈玉）。會講英語、懂茶、也懂洋行規矩的廈門人，正是開港後洋行要找的人。中央廣播電臺的報導寫他1861年在廈門自立「四達商行」，只有這一篇媒體提到，本站標待核。',
    '買辦｜來臺的年份有幾種記載：自敘寫「迨三十歲（1866年），復受英商寶順行重盟，東渡在台北」，陳慈玉記1865年，維基條目寫1868年移居大稻埕；本站並列，不挑其中一個。他在寶順洋行的身分是買辦——洋行雇用的本地商人，替洋行向茶農、茶販收茶，也替洋行把資金與要求帶到產地。買辦站在兩邊的中間：一邊是出資、要茶、要品質的洋行，一邊是種茶、賣毛茶的農民與茶販。1866年陶德派他到安溪採辦茶苗（自敘）；他和陶德到大溪調查樟腦時發現野生茶樹，提議自安溪移植茶樹、獎勵農民栽種（陳慈玉）。這些是文獻記下的行動；他當時怎麼想，文獻沒有寫，本站也不替他補。',
    '茶商｜寶順行結束後，他續任英商和記行的買辦；自敘寫他在臺灣住了二十九年。他後來自己經營茶業，烏龍茶經廈門輸往美國，並改良製法與品牌（陳慈玉）。1896年1月日本人的調查裡，他的「李節記」資本四萬円、店員二十三人，在大稻埕252家茶商裡資本額排第三。從替洋行收茶的人，到自己也向農民收茶、自己出口的茶商，這是文獻裡看得到的一條路；為什麼走這條路，不在文獻裡。',
    '人與街｜1878年，他與林維源捐出巨款並督造臺北城（國史館、陳慈玉）。1889年，劉銘傳把大稻埕沿岸的河灘地交給林維源開發，林維源邀李春生合作成立建昌公司，在建昌街與千秋街（戰後的貴德街）蓋店屋出租給洋商；這一帶成為臺北第一條洋樓街，《臺北畫刊》稱它是聚集數十家茶行的「茶街」。中央廣播電臺寫建昌公司成立於1886年，與陳慈玉等多數來源的1889年不同，本站採1889年、把1886年標待核。走在這條街上的，除了洋行的人與茶商，還有騎樓下揀茶的婦女（見「建昌街與揀茶女」一章）。',
    '人與教會｜他一生是長老教會的信徒。慈聖宮旁、甘州街40號的大稻埕教會，1915年遷建的禮拜堂由他出資、規劃並監造（《宇宙光》雜誌、臺北市政府文化局）；前一章寫「獨資捐建」，兩種寫法並列。維基條目寫他1901年被推為大稻埕教會長老，只有這一個來源，標待核。他1924年過世（國史館引賴永祥記9月7日，維基條目寫10月5日，本站只寫1924年）。1935年5月5日，貴德街44號設立「李春生紀念教會」（台灣基督長老教會教會資料）；陳慈玉、《走讀大稻埕》與《臺北畫刊》都寫這座教會由他的孫輩李延旭、李延弼與信徒所建。文獻只記了誰建、哪一年、以誰為名，沒有記建教會的理由，本站照錄，不替後人補上動機。',
    '當時的稱呼｜國史館的編者稱他是「清季台灣北部最有名富紳」；陳慈玉引杜聰明的定位，稱他為「台灣茶業之父」，臺北市政府文化局《走讀大稻埕》與公視台語新聞也用這個稱號。這些都是別人給的稱呼，本站照引、標出處，不另外加評語。1895年他參與申請設保良局，1896年獲勳六等旭日章（國史館）；同年赴日本參觀、寫成《東遊六十四日隨筆》（中央廣播電臺、維基條目），陪同哪位官員、哪個月出發只有維基一個來源，待核。他的其他著作（《主津新集》、《天演論書後》、《東西哲衡》等）由黃俊傑、李明輝、黎漢基編成《李春生著作集》（南天書局，2004）；各書原本的出版年各來源不一，本站只寫書名、不寫年份，也不評價他的思想。',
  ],
  paragraphsEn: [
    'Xiamen | Lee Chun-sheng was born in Xiamen, Fujian, on 12 January 1838, the son of a seaman (Chen Ciyu). His autobiography says he "followed the Jesus religion from childhood, studied commerce at fifteen, and also learned English"; he was baptised in Xiamen in 1851 and was a member of the Presbyterian church. From 1857 he worked in Xiamen for the British firm Elles & Co., handling foreign goods and tea (Chen Ciyu). A man from Xiamen who spoke English, knew tea and understood how a foreign firm worked was exactly whom the hongs looked for after the ports opened. A Radio Taiwan International report says he set up his own firm, "Sida Trading House", in Xiamen in 1861; only this one media report mentions it, so this site marks it as to be verified.',
    'Comprador | The sources give several years for his arrival in Taiwan: his autobiography says "at thirty (1866) I was re-engaged by the British firm Dodd & Co. (Boshun hong) and went east to Taipei"; Chen Ciyu gives 1865; the Wikipedia entry says he moved to Dadaocheng in 1868. This site lists them side by side and does not pick one. At Dodd & Co. he was a comprador: a local merchant employed by the foreign firm, who bought tea from growers and dealers for it and carried the firm’s capital and demands to the producing areas. A comprador stood in the middle between two sides: the foreign firm that put up the money and wanted tea of a certain quality, and the farmers and dealers who grew and sold the crude tea. In 1866 John Dodd sent him to Anxi to buy tea seedlings (autobiography); when he and Dodd surveyed camphor in Daxi they found wild tea trees, and he proposed bringing tea plants from Anxi and encouraging farmers to grow them (Chen Ciyu). These are actions the documents record; what he thought at the time the documents do not say, and this site does not fill it in.',
    'Tea merchant | After Dodd & Co. closed he continued as comprador for the British firm Heji; his autobiography says he lived in Taiwan for twenty-nine years. He later ran tea businesses of his own, shipping oolong tea to the United States by way of Xiamen and improving its processing and branding (Chen Ciyu). In a Japanese survey of January 1896, his firm "Li Jieji" had capital of 40,000 yen and 23 employees, third by capital among the 252 tea merchants of Dadaocheng. From a man who bought tea for a foreign firm to a merchant who bought from the farmers himself and exported it himself, this is a path the documents let us see; why he took it is not in the documents.',
    'The man and the street | In 1878 he and Lin Weiyuan donated large sums and supervised the building of the Taipei city wall (Academia Historica, Chen Ciyu). In 1889 Liu Mingchuan handed the river-bank land along Dadaocheng to Lin Weiyuan to develop, and Lin invited Lee Chun-sheng to join him in founding the Jianchang Company, which built shophouses on Jianchang Street and Qianqiu Street (the later Guide Street) to rent to foreign merchants. The area became Taipei’s first street of Western-style buildings, which Taipei Pictorial calls a "tea street" with dozens of tea hongs. Radio Taiwan International says the Jianchang Company was founded in 1886, which differs from the 1889 given by Chen Ciyu and most other sources; this site uses 1889 and marks 1886 as to be verified. Walking this street, besides the foreign-firm staff and tea merchants, were the women who sorted tea under the arcades (see the chapter "Jianchang Street and the Tea Sorters").',
    'The man and the church | He was a lifelong Presbyterian. The Dadaocheng Church at 40 Ganzhou Street, next to Cisheng Temple, rebuilt its chapel in 1915; he funded, planned and supervised that work (Cosmic Care magazine, Taipei City Government Department of Cultural Affairs). The previous chapter says he "donated it alone", and the two wordings are listed side by side. The Wikipedia entry says he was recommended as an elder of the Dadaocheng Church in 1901; this is the only source, so it is marked to be verified. He died in 1924 (Academia Historica, citing Lai Yongxiang, says 7 September; the Wikipedia entry says 5 October; this site gives only the year). On 5 May 1935 the "Lee Chun-sheng Memorial Church" was established at 44 Guide Street (Presbyterian Church in Taiwan records); Chen Ciyu, Walking Dadaocheng and Taipei Pictorial all say it was built by his grandsons Li Yanxu and Li Yanbi together with congregants. The documents record only who built it, in what year, and in whose name; they give no reason for building the church, and this site reproduces that without supplying a motive on anyone’s behalf.',
    'Titles of the time | The Academia Historica editors call him "the most famous wealthy gentleman of northern Taiwan in the late Qing"; Chen Ciyu, citing Du Congming, calls him "the father of the Taiwan tea industry", a title also used by the Taipei Department of Cultural Affairs’ Walking Dadaocheng and by PTS Taiwanese-language news. These are titles that others gave him; this site quotes them with their sources and adds no comment. In 1895 he took part in applying to set up a Baoliang Bureau, and in 1896 he received the Order of the Rising Sun, sixth class (Academia Historica); in the same year he visited Japan and wrote "Dongyou liushisi ri suibi" (Sketches from Sixty-Four Days Travelling East) (Radio Taiwan International, Wikipedia). Which official he accompanied and in which month he left rest on the Wikipedia entry alone and are to be verified. His other writings (Zhujin xinji, Tianyanlun shuhou, Dongxi zheheng and others) were compiled by Huang Junjie, Li Minghui and Li Hanji as the Collected Works of Lee Chun-sheng (Nantian Book Co., 2004). The sources differ on the original publication year of each book, so this site gives only the titles, not the years, and does not assess his thought.',
  ],
  timeline: [
    { place: '1838', text: '生於福建廈門，父親是船員。', textEn: 'Born in Xiamen, Fujian; his father was a seaman.' },
    { place: '1851', text: '在廈門受洗。自敘「年十五學商業，兼習英國語文」。', textEn: 'Baptised in Xiamen. His autobiography says he "studied commerce at fifteen and also learned English".' },
    { place: '1857', text: '受雇於廈門英商怡記洋行。', textEn: 'Employed by the British firm Elles & Co. in Xiamen.' },
    { place: '1865／1866', text: '受英商寶順行之聘來臺北任買辦（陳慈玉記1865年，自敘「迨三十歲」即1866年；維基寫1868年移居大稻埕；並列，待核）。1866年到安溪採辦茶苗。', textEn: 'Came to Taipei as comprador at the invitation of the British firm Dodd & Co. (Chen Ciyu gives 1865; his autobiography says "at thirty", which is 1866; Wikipedia says he moved to Dadaocheng in 1868; listed side by side, to be verified). In 1866 he went to Anxi to buy tea seedlings.' },
    { place: '1878', text: '與林維源捐款並督造臺北城。', textEn: 'With Lin Weiyuan, donated funds and supervised the building of the Taipei city wall.' },
    { place: '1889', text: '與林維源成立建昌公司，建昌街、千秋街成為洋樓街（央廣寫1886年，待核）。', textEn: 'With Lin Weiyuan, founded the Jianchang Company; Jianchang Street and Qianqiu Street became a street of Western-style buildings (Radio Taiwan International says 1886; to be verified).' },
    { place: '1896', text: '「李節記」資本額居大稻埕茶商第三；獲勳六等旭日章；赴日本參觀，寫成《東遊六十四日隨筆》（赴日細節待核）。', textEn: 'His firm "Li Jieji" ranked third among Dadaocheng tea merchants by capital; he received the Order of the Rising Sun, sixth class; he visited Japan and wrote "Dongyou liushisi ri suibi" (details of the trip to be verified).' },
    { place: '1915', text: '大稻埕教會遷建禮拜堂（甘州街40號），由他出資、規劃並監造。', textEn: 'The Dadaocheng Church rebuilt its chapel (40 Ganzhou Street); he funded, planned and supervised it.' },
    { place: '1924', text: '過世（9月7日與10月5日兩說，本站只寫年份）。', textEn: 'Died (7 September and 5 October are both recorded; this site gives only the year).' },
    { place: '1935', text: '孫輩李延旭、李延弼與信徒在貴德街44號建李春生紀念教會（5月5日設立）。', textEn: 'His grandsons Li Yanxu and Li Yanbi and the congregants built the Lee Chun-sheng Memorial Church at 44 Guide Street (established 5 May).' },
  ],
  facts: [
    { label: '來臺年', labelEn: 'Year of arrival in Taiwan', value: '1865（陳慈玉）／1866（自敘「迨三十歲」）／1868（維基）並列，待核', valueEn: '1865 (Chen Ciyu) / 1866 (autobiography, "at thirty") / 1868 (Wikipedia), listed side by side, to be verified' },
    { label: '身分', labelEn: 'Role', value: '寶順洋行、和記洋行的買辦；後自營茶商（李節記）', valueEn: 'Comprador of Dodd & Co. and Heji; later an independent tea merchant (Li Jieji)' },
    { label: '大稻埕教會', labelEn: 'Dadaocheng Church', value: '甘州街40號；1915年遷建禮拜堂，李春生出資、規劃並監造；1901年任長老只見維基，待核', valueEn: '40 Ganzhou Street; chapel rebuilt in 1915, funded, planned and supervised by Lee Chun-sheng; his appointment as elder in 1901 appears only in Wikipedia, to be verified' },
    { label: '李春生紀念教會', labelEn: 'Lee Chun-sheng Memorial Church', value: '貴德街44號；1935年5月5日設立；孫輩李延旭、李延弼與信徒所建', valueEn: '44 Guide Street; established 5 May 1935; built by his grandsons Li Yanxu and Li Yanbi and the congregants' },
    { label: '當時的稱呼', labelEn: 'Titles of the time', value: '「清季台灣北部最有名富紳」（國史館）；「台灣茶業之父」（陳慈玉引杜聰明；《走讀大稻埕》；公視台語）', valueEn: '"The most famous wealthy gentleman of northern Taiwan in the late Qing" (Academia Historica); "the father of the Taiwan tea industry" (Chen Ciyu citing Du Congming; Walking Dadaocheng; PTS Taiwanese-language news)' },
    { label: '待核', labelEn: 'To be verified', value: '四達商行（1861，央廣）；建昌公司1886年（央廣）；1896年赴日細節（維基）；1901年長老（維基）；各著作出版年', valueEn: 'Sida Trading House (1861, Radio Taiwan International); Jianchang Company in 1886 (Radio Taiwan International); details of the 1896 trip to Japan (Wikipedia); elder in 1901 (Wikipedia); publication years of his works' },
  ],
  sourceIds: LI_CHUNSHENG_SOURCE_IDS,
}

/** 接在寶順洋行文獻章免責文字後面 */
export const LI_CHUNSHENG_DISCLAIMER_TEXT =
  '「人物：李春生」一節只寫文獻記下的行動與當時的稱呼，不推論他或他後代的動機；來臺年、建昌公司年份、四達商行、1896年赴日細節、1901年任長老與各著作的出版年都標待核。查無而不寫：他的住址或故居、李春生紀念教會的文化資產身分與設計者；只見於單一媒體的「總辦」職稱與只見於單一來源的「首富」不用；不寫思想評價。'

export const LI_CHUNSHENG_DISCLAIMER_TEXT_EN =
  'The section "Person: Lee Chun-sheng" records only the actions documented in sources and the titles of the time, and does not infer his motives or those of his descendants. His year of arrival in Taiwan, the founding year of the Jianchang Company, Sida Trading House, the details of his 1896 trip to Japan, his appointment as elder in 1901 and the publication years of his works are all marked as to be verified. Not found, and so not written: his address or former residence, and the cultural-heritage status and designer of the Lee Chun-sheng Memorial Church. The title "general manager" (found in a single outlet) and "richest man" (found in a single source) are not used, and no assessment of his thought is given.'

/**
 * 年表上的大事（只加有出處的年份）：
 * - 1866 受寶順行之聘來臺（自敘；陳慈玉記 1865，並列）
 * - 1915 大稻埕教會遷建禮拜堂（《宇宙光》、文化局日文頁）
 * 1861 四達商行、1886 建昌公司、1901 長老只有單一來源，不上年表。
 */
export const LI_CHUNSHENG_TIMELINE_EVENTS = [
  { year: 1866, text: '李春生受英商寶順行之聘來臺北任買辦，同年到安溪採辦茶苗（自敘「迨三十歲」；陳慈玉記1865年，並列）。', textEn: 'Lee Chun-sheng came to Taipei as comprador at the invitation of the British firm Dodd & Co., and in the same year went to Anxi to buy tea seedlings (autobiography, "at thirty"; Chen Ciyu gives 1865; listed side by side).', sourceIds: ['th-li-chunsheng-memoir', 'chen-ciyu-li-family-2015'] },
  { year: 1915, text: '大稻埕教會在甘州街遷建禮拜堂，由李春生出資、規劃並監造。', textEn: 'The Dadaocheng Church rebuilt its chapel on Ganzhou Street; Lee Chun-sheng funded, planned and supervised the work.', sourceIds: ['cosmiccare-li-chunsheng-church', 'culture-taipei-jp-spots'] },
]

/** 對照地圖：大稻埕教會（甘州街 40 號，慈聖宮旁）。李春生的住處查無門牌，不標 */
export const LI_CHUNSHENG_MAP_PLACE = {
  id: 'dadaocheng-church',
  shopIds: ['dodd-tea-house'],
  name: '大稻埕教會',
  nameEn: 'Dadaocheng Church',
  address: '甘州街40號',
  addressEn: '40 Ganzhou Street',
  x: 61,
  y: 38,
  precision: 'address',
  sourceIds: ['cosmiccare-li-chunsheng-church', 'culture-taipei-jp-spots'],
}
