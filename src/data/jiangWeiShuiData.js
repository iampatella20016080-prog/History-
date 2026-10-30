/**
 * 蔣渭水的「人物」小節（第 8 階段，方案 1）：不新增 3D 人物、不新增店家，只加一章文字、出處、年表與地圖，
 * 掛在「酒樓繁華」江山樓（jiang-shan-lou）的故事裡，排在食物圖鑑之後、文獻章之前（與李春生相同）。
 *
 * 查證紀錄：docs/research/jiang-wei-shui.md（含「補查」一節；春風得意樓沿用 jiang-shan-lou.md）。結論：
 * - 可寫：大安醫院 1916 年在太平町設立（碑記摘要＋國家文化記憶庫已讀頁，兩個獨立來源）、也是《臺灣民報》的總批發處；
 *   春風得意樓 1920 年入股、1922 年買下全部、同年歇業（莊永明，單一詳細來源；與大安醫院「對街」亦引莊永明）；
 *   臺灣文化協會 1921 年 10 月成立；渭水驛站（延平北路二段 27 號，2020-10-07 開幕，文化局館所，前身 URS27W，緊鄰大安醫院舊址）
 *   作為「今日可去的地方」，有文化局新聞稿原文。
 * - 年代：人物的活動多在「酒樓繁華」1895–1930 的後半（1916–1930），章節裡明寫。
 * - 待核：生年（1888／1890／1891 並列）、文協成立日 17 日與靜修女學校地點、大安醫院門牌（27／31／33／35 號各說，網站只寫太平町不寫門牌）。
 * - 不寫：墓地遷葬與登錄、紀念公園、路線之爭、政治或歷史評價、稱號；〈臨床講義〉原文查無不寫。語氣只寫行動與事件。
 */

export const JIANG_WEISHUI_HOST_SHOP_ID = 'jiang-shan-lou'
export const JIANG_WEISHUI_ERA_ID = 'banquet'

/** 人物小節引用的出處（既有的優先沿用；新增的都有檢核欄位） */
export const JIANG_WEISHUI_SOURCE_IDS = [
  'tcmb-jiang-wei-shui',
  'culture-taipei-2020-weishui-station',
  'jaung-chunfeng-deyilou-2015',
  'tcmb-taiping-shophouse-27',
  'taiwannews-2020-weishui-station',
  'taiwannews-2021-tca-where',
  'taiwannews-2021-daan-model',
  'moc-jiang-wei-shui-monument',
  'wiki-jiang-wei-shui',
]

export const JIANG_WEISHUI_PERSON_CHAPTER = {
  id: 'jiang-person',
  type: 'text',
  tab: '人物：蔣渭水',
  tabEn: 'Person: Jiang Weishui',
  title: '人物：蔣渭水——太平町的醫師、酒樓股東與文化協會的發起人',
  titleEn: 'Person: Jiang Weishui — physician of Taiping-chō, restaurant shareholder and founder of the Cultural Association',
  lead: '前一章提到春風得意樓的股東蔣渭水，這一節把他在大稻埕的行動按年份排出來：開醫院、入股酒樓、發起文化協會。他的活動多在「酒樓繁華」年代的後半（1916–1930年），本節只寫文獻記下的事件，不作評價。',
  leadEn: 'The previous chapter mentioned Jiang Weishui, a shareholder of the Chunfeng Deyi Lou restaurant. This section sets out his actions in Dadaocheng year by year: opening a hospital, taking a stake in the restaurant, and helping to found the Taiwan Cultural Association. His activity falls mostly in the second half of the Banquet Hall Boom era (1916–1930); this section records only events found in the sources and offers no judgement.',
  paragraphs: [
    '年份｜他的生年各資料不一：國家文化記憶庫寫1888年，台灣文學辭典的條目標題寫1891年，文化部英文頁的摘要寫1890年；本站三說並列、標待核，不挑其中一個。卒年比較一致：1931年8月5日因傷寒病逝（國家文化記憶庫）。他的大稻埕年份從1916年開始，因此本章放在酒樓年代的後半，不代表整個1895–1930年的街景。',
    '大安醫院｜1916年，他在大稻埕太平町（今延平北路二段）開設大安醫院（國家文化記憶庫；文化部〈蔣渭水紀念碑碑記〉的摘要同寫1916年）。這裡是他行醫的地方，也是《臺灣民報》在臺灣的總批發處（臺北市政府文化局新聞稿、國家文化記憶庫）。大安醫院的門牌各說不一（27、31、33、35號都有人寫），官方新聞稿與國家文化記憶庫都沒有寫門牌，本站只寫「太平町」，門牌標待核。醫院建築今已不存。',
    '春風得意樓｜1914年開業的春風得意樓，1916年遷到太平橫街的新建街屋。莊永明的專文寫，1920年3月酒樓改組增資，蔣渭水成為大股東；1922年2月他買下全部股份，同年夏天前後關店；莊永明並寫大安醫院「就在春風得意樓對街」。這些細節只有莊永明一篇寫到，本站照引、標出處。他不是春風得意樓的創辦人（見「酒樓的年代」一章），維基條目寫「1921年起經營」，與莊永明的1920年入股不同，本站採莊永明。',
    '臺灣文化協會｜1921年10月，臺灣文化協會成立，蔣渭水是重要成員之一（國家文化記憶庫）。成立日期「10月17日」只見台灣英文新聞引蔣渭水文化基金會年表的二手報導，成立地點「靜修女學校」也只有同一篇報導，兩者都標待核。1927年協會分裂，他與林獻堂退出協會運作（國家文化記憶庫）。協會與大安醫院的關係，報導寫大安醫院「實際上也就是文協本部」，沒有說明時間點，本站標待核、不寫成事實。',
    '今日可去的地方｜延平北路二段27號的「渭水驛站」是臺北市政府文化局的文化館所，前身是臺北市都市更新處的都市再生基地「城市影像實驗室（URS27W）」，完成階段性任務後改為文化館所，因為緊鄰大安醫院舊址而更名；2020年10月7日常設展《你好，渭水》開幕（臺北市政府文化局新聞稿）。國家文化記憶庫的〈太平町店屋－延平北路2段27號〉條目也寫這棟店屋緊鄰原大安醫院。2021年10月，文化協會成立一百年，大安醫院的立體袖珍模型在這裡展出（台灣英文新聞）。新聞稿稱這棟店屋為歷史建築，但登錄年份本站未查到公告，不寫。',
  ],
  paragraphsEn: [
    'Years | Sources disagree on his birth year: the National Cultural Memory Bank gives 1888, the entry title in the Dictionary of Taiwanese Literature gives 1891, and the summary on the Ministry of Culture’s English page gives 1890. This site shows all three side by side, marks them to be verified, and picks none. The year of death is more consistent: he died of typhoid on 5 August 1931 (National Cultural Memory Bank). His years in Dadaocheng begin in 1916, so this chapter sits in the second half of the banquet-hall era and does not represent the street scene of the whole 1895–1930 period.',
    'Daan Hospital | In 1916 he opened Daan Hospital in Taiping-chō, Dadaocheng (today Section 2 of Yanping North Road) (National Cultural Memory Bank; the summary of the Ministry of Culture’s “Inscription of the Jiang Weishui Monument” also gives 1916). It was where he practised medicine, and also the main distribution point in Taiwan for the Taiwan Minpao (press release of the Department of Cultural Affairs, Taipei City Government; National Cultural Memory Bank). Sources disagree on the hospital’s street number (Nos. 27, 31, 33 and 35 have all been given); neither the official press release nor the National Cultural Memory Bank states a number, so this site writes only “Taiping-chō” and marks the number as to be verified. The hospital building no longer exists.',
    'Chunfeng Deyi Lou | The Chunfeng Deyi Lou restaurant opened in 1914 and in 1916 moved to a newly built shophouse on Taiping Hengjie. Zhuang Yongming’s essay says that in March 1920 the restaurant was reorganised and its capital increased, making Jiang Weishui a major shareholder; in February 1922 he bought all the shares, and the restaurant closed around the summer of that year; Zhuang also writes that Daan Hospital stood “just across the street from Chunfeng Deyi Lou”. These details appear only in Zhuang’s one essay, so this site quotes them as they stand and gives the source. He was not the founder of the restaurant (see the chapter “The banquet-hall era”). The Wikipedia entry says he “ran it from 1921”, which differs from Zhuang’s 1920 stake; this site follows Zhuang.',
    'Taiwan Cultural Association | In October 1921 the Taiwan Cultural Association was founded, and Jiang Weishui was one of its key members (National Cultural Memory Bank). The founding date of “17 October” appears only in a secondary Taiwan News report citing the chronology of the Jiang Wei-shui Cultural Foundation, and the founding place, “Jingxiu Girls’ School”, likewise only in the same report; both are marked to be verified. In 1927 the association split, and he and Lin Xiantang withdrew from its operation (National Cultural Memory Bank). As for the association’s relationship with Daan Hospital, the report says the hospital “was in effect the association’s headquarters”, without giving a time; this site marks that as to be verified and does not state it as fact.',
    'A place to visit today | Weishui Station, at No. 27, Section 2, Yanping North Road, is a cultural venue of the Department of Cultural Affairs, Taipei City Government. It was formerly the urban regeneration site “City Image Lab (URS27W)” of the Taipei City Urban Regeneration Office; after completing its phase of work it became a cultural venue and was renamed because it stands right beside the site of Daan Hospital. The permanent exhibition “Hello, Weishui” opened on 7 October 2020 (press release of the Department of Cultural Affairs, Taipei City Government). The National Cultural Memory Bank entry “Taiping-chō shophouse – No. 27, Section 2, Yanping North Road” likewise says the shophouse stands next to the former Daan Hospital. In October 2021, the centenary of the Cultural Association, a three-dimensional miniature model of Daan Hospital was exhibited here (Taiwan News). The press release calls the shophouse a historic building, but this site found no announcement of the year it was designated, so none is given.',
  ],
  timeline: [
    { place: '1888／1890／1891', text: '出生，各資料不一：國家文化記憶庫1888年、文化部英文頁摘要1890年、台灣文學辭典1891年，三說並列，待核。', textEn: 'Born; sources disagree: 1888 (National Cultural Memory Bank), 1890 (summary on the Ministry of Culture’s English page), 1891 (Dictionary of Taiwanese Literature). All three shown, to be verified.' },
    { place: '1916', text: '在大稻埕太平町開設大安醫院（門牌各說不一，待核）。', textEn: 'Opens Daan Hospital in Taiping-chō, Dadaocheng (street number disputed, to be verified).' },
    { place: '1920', text: '春風得意樓改組增資，成為大股東（莊永明）。', textEn: 'Chunfeng Deyi Lou is reorganised and recapitalised; he becomes a major shareholder (Zhuang Yongming).' },
    { place: '1921', text: '10月，臺灣文化協會成立（17日與靜修女學校地點只見二手報導，待核）。', textEn: 'October: the Taiwan Cultural Association is founded (the 17th and the Jingxiu Girls’ School location appear only in a secondary report; to be verified).' },
    { place: '1922', text: '2月買下春風得意樓全部股份，同年歇業（莊永明）。', textEn: 'February: buys all the shares of Chunfeng Deyi Lou, which closes the same year (Zhuang Yongming).' },
    { place: '1927', text: '文化協會分裂，與林獻堂退出協會運作（國家文化記憶庫）。', textEn: 'The Cultural Association splits; he and Lin Xiantang withdraw from its operation (National Cultural Memory Bank).' },
    { place: '1931', text: '8月5日病逝（國家文化記憶庫）。', textEn: 'Dies on 5 August (National Cultural Memory Bank).' },
    { place: '2020', text: '10月7日，延平北路二段27號「渭水驛站」常設展《你好，渭水》開幕（臺北市政府文化局）。', textEn: '7 October: the permanent exhibition “Hello, Weishui” opens at Weishui Station, No. 27, Section 2, Yanping North Road (Department of Cultural Affairs, Taipei City Government).' },
  ],
  facts: [
    { label: '生年', labelEn: 'Birth year', value: '1888（國家文化記憶庫）／1890（文化部英文頁摘要）／1891（台灣文學辭典）並列，待核；卒年1931年8月5日', valueEn: '1888 (National Cultural Memory Bank) / 1890 (summary on the Ministry of Culture’s English page) / 1891 (Dictionary of Taiwanese Literature), shown side by side, to be verified; died 5 August 1931' },
    { label: '大安醫院', labelEn: 'Daan Hospital', value: '1916年設於太平町（今延平北路二段）；《臺灣民報》總批發處；門牌27／31／33／35號各說不一，待核，本站不寫', valueEn: 'Opened in 1916 in Taiping-chō (today Section 2 of Yanping North Road); main distribution point of the Taiwan Minpao; street number given variously as 27/31/33/35, to be verified and not stated here' },
    { label: '春風得意樓', labelEn: 'Chunfeng Deyi Lou', value: '1920年入股成為大股東、1922年買下全部，同年歇業；大安醫院在對街（莊永明，單一詳細來源）；非創辦人', valueEn: 'Became a major shareholder in 1920 and bought all of it in 1922, closing the same year; Daan Hospital was across the street (Zhuang Yongming, single detailed source); not the founder' },
    { label: '臺灣文化協會', labelEn: 'Taiwan Cultural Association', value: '1921年10月成立；成立日17日與靜修女學校地點待核', valueEn: 'Founded October 1921; the 17th and the Jingxiu Girls’ School location to be verified' },
    { label: '渭水驛站', labelEn: 'Weishui Station', value: '延平北路二段27號；臺北市政府文化局館所，前身URS27W；2020年10月7日開幕；緊鄰大安醫院舊址', valueEn: 'No. 27, Section 2, Yanping North Road; venue of the Department of Cultural Affairs, Taipei City Government, formerly URS27W; opened 7 October 2020; beside the site of Daan Hospital' },
    { label: '年代對應', labelEn: 'Era', value: '活動年份1916–1931，落在「酒樓繁華」1895–1930的後半', valueEn: 'Active 1916–1931, in the second half of the Banquet Hall Boom (1895–1930)' },
  ],
  sourceIds: JIANG_WEISHUI_SOURCE_IDS,
}

/** 接在江山樓文獻章免責文字後面 */
export const JIANG_WEISHUI_DISCLAIMER_TEXT =
  '「人物：蔣渭水」一節只寫文獻記下的行動與事件，不作政治或歷史評價，也不用後人給的稱號；生年三說並列、大安醫院門牌、文化協會成立日與地點都標待核。春風得意樓的入股與歇業細節只有莊永明一篇，本站照引出處。查無或與大稻埕街景無關而不寫：墓地的遷葬與登錄、紀念公園、〈臨床講義〉原文、渭水驛站的歷史建築登錄年份。'

/**
 * 年表上的大事（只加有出處的年份）：
 * - 1916 大安醫院（國家文化記憶庫已讀頁；碑記摘要同）
 * - 1921 臺灣文化協會成立（國家文化記憶庫）
 * - 2020 渭水驛站開幕（文化局新聞稿）
 * 春風得意樓 1920／1922 只有莊永明一篇，已在背景章與人物章並列，不上年表。
 */
export const JIANG_WEISHUI_TIMELINE_EVENTS = [
  { year: 1916, text: '蔣渭水在大稻埕太平町開設大安醫院，後來也是《臺灣民報》的總批發處（門牌待核）。', textEn: 'Jiang Weishui opens Daan Hospital in Taiping-chō, Dadaocheng; it later also serves as the main distribution point of the Taiwan Minpao (street number to be verified).', sourceIds: ['tcmb-jiang-wei-shui', 'culture-taipei-2020-weishui-station'] },
  { year: 1921, text: '臺灣文化協會成立（10月），蔣渭水是重要成員之一；成立日與地點待核。', textEn: 'The Taiwan Cultural Association is founded (October); Jiang Weishui is one of its key members. Date and place to be verified.', sourceIds: ['tcmb-jiang-wei-shui', 'taiwannews-2021-tca-where'] },
  { year: 2020, text: '延平北路二段27號「渭水驛站」常設展《你好，渭水》開幕（10月7日），館所緊鄰大安醫院舊址。', textEn: 'The permanent exhibition “Hello, Weishui” opens at Weishui Station, No. 27, Section 2, Yanping North Road (7 October), beside the site of Daan Hospital.', sourceIds: ['culture-taipei-2020-weishui-station'] },
]

/**
 * 對照地圖：渭水驛站（延平北路二段 27 號，有官方新聞稿）。大安醫院、春風得意樓的門牌各說不一，不標。
 * 它不是店家，shopIds 留空：江山樓本身仍列在「地圖上沒有標示」。
 */
export const JIANG_WEISHUI_MAP_PLACE = {
  id: 'weishui-station',
  shopIds: [],
  name: '渭水驛站（緊鄰大安醫院舊址）',
  nameEn: 'Weishui Station (beside the site of Daan Hospital)',
  address: '延平北路二段27號',
  addressEn: 'No. 27, Section 2, Yanping North Road',
  x: 56,
  y: 50,
  precision: 'address',
  sourceIds: ['culture-taipei-2020-weishui-station', 'tcmb-taiping-shophouse-27'],
}

/** 英文版：免責文字（對應 JIANG_WEISHUI_DISCLAIMER_TEXT） */
export const JIANG_WEISHUI_DISCLAIMER_TEXT_EN =
  'The section “Person: Jiang Weishui” records only actions and events found in the sources, without political or historical judgement and without the titles later given to him. The three birth years are shown side by side; the street number of Daan Hospital and the date and place of the Cultural Association’s founding are marked to be verified. The details of his stake in and the closure of Chunfeng Deyi Lou come from a single essay by Zhuang Yongming, and this site quotes the source as it stands. Left out because no source was found or because they are unrelated to the Dadaocheng street scene: the reburial and registration of his grave, the memorial park, the original text of “Clinical Lectures”, and the year Weishui Station was designated a historic building.'
