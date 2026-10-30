/**
 * 迪化街年貨大街與呷二嘴（第 6 階段 C）：只加章節與出處，沒有新的 3D 建築或店家。
 *
 * 查證紀錄：docs/research/dihua-nianhuo.md、docs/research/xia-er-zui.md。結論：
 * - 年貨大街：1996 年起、市府與商家合辦有官方稿與重現 1995 年報導的文章可佐證，但構想由來（官方稿說市府首創、報導說民間提出）並列；
 *   主辦局處、1996 年實際日期與範圍、各年日期規則、遊客與交易額數字查無可靠出處，不寫。
 *   更早的南北貨只有二手整理，獨立成一節當背景，明說與 1996 年的活動無關。
 *   章節放在「老屋新生」年代迪化街底的永樂市場（迪化街一段21號）：不新增建築，也不用 position 預留地段。
 * - 呷二嘴：只在米苔目主題的 related 當現代相關店家，寫現況與位置；1954 是店家與食記的說法、未見文件佐證；
 *   創辦人、世代、早期攤位位置、各階段經營都查無，不寫；不使用店家的商標，也不做模型。
 */

/** 年貨大街章節掛在這個年代、這家店的故事裡 */
export const NIANHUO_ERA_ID = 'revival'
export const NIANHUO_HOST_SHOP_ID = 'yong-le-market'

const NIANHUO_DISCLAIMER =
  '年貨大街的起始年份有市府新聞稿，構想由來與1996年的預定做法只見於重現1995年報導的二手文章（原報紙本站未直接查閱），官方稿與報導的說法並列。主辦與承辦單位、1996年實際的日期與範圍、各年日期、遊客與交易額數字查無可靠出處，本站不寫；各年活動請以當年市府公告為準。更早的南北貨歷史是二手整理，《臺北文獻》110期的座談會紀錄本站未能取得，待補。永樂市場只是這一節的所在，不表示活動由市場舉辦。'

/** 年貨大街的緣起與現況 */
export const NIANHUO_CHAPTER = {
  id: 'nianhuo',
  type: 'text',
  tab: '迪化街年貨大街',
  tabEn: 'Dihua Street Lunar New Year Market',
  title: '迪化街年貨大街：1996年起的春節前活動',
  titleEn: 'The Dihua Street Lunar New Year Market: a pre-festival event since 1996',
  lead: '每年農曆春節前，迪化街一帶會辦起「年貨大街」。這是一項有起始年份的活動，而不是一條古老的街市傳統。',
  leadEn: 'Every year before Lunar New Year, the Dihua Street area holds its “Lunar New Year Market” (nianhuo dajie). It is an event with a known starting year, not an ancient market tradition.',
  paragraphs: [
    '史料｜臺北市政府工務局的新聞稿寫，迪化街年貨大街「起源於1996年農曆春節前半個月舉辦」，並說這是臺北市政府首創。這是目前找到最直接的官方說法，稿件的日期與主辦局處在稿裡沒有交代。',
    '報導｜報時光2023年的文章重現了民生報1995年12月23日的報導：構想由民間的「迪化街工作室」提出，約有50家商戶表示支持，市政府（時任都市發展局長張景森）答應協辦。1996年預定的做法有市府與商家聯合促銷、迪化街劃為徒步區、藝術學校學生布置街道、民俗攤位與遊街表演。這些是當年報導裡的「預定」，不是活動實際舉辦的紀錄；原報紙本站沒有直接查閱，標待核。',
    '並列｜官方稿強調「市府首創」，報導則顯示構想來自民間、市府協辦。兩種說法本站並列，不替它們統一；比較穩妥的寫法是：1996年起，由市府與商家合辦，構想由民間團體提出（依報導）。',
    '現況｜活動大約在農曆春節前半個月舉辦，詳細的日期、範圍與串聯的商圈每年不同；本站沒有逐年核對，所以不寫日期，行程以當年市府公告為準。本站也不把任何一家店寫成活動的創辦者。',
    '說明｜年貨大街是市府與商家自1996年起辦理的活動。網路上有宣傳性的「第一」「百年」之類說法，本站沒有找到支持的證據，不採用；遊客人次與交易額的數字也查無可靠出處，不寫。這一節放在「老屋新生」年代，是因為活動至今仍在舉辦；街景是情境示意，不表示活動在街上的實際範圍。',
  ],
  paragraphsEn: [
    'Record | A press release from the Public Works Department of the Taipei City Government says the Dihua Street Lunar New Year Market “began in 1996, held in the half-month before Lunar New Year”, and calls it a first by the Taipei City Government. This is the most direct official statement found; the release does not give its own date or the organising department.',
    'Press report | A 2023 article from Bao Shiguang reproduces a Minsheng Daily report of 23 December 1995: the idea was put forward by a civic group, the “Dihua Street Studio”; about 50 merchants voiced support, and the city government (then Director of the Department of Urban Development, Zhang Jingsen) agreed to co-organise. The plans for 1996 included joint promotions by the city and merchants, turning Dihua Street into a pedestrian zone, street decoration by art-school students, folk-custom stalls and a parade. These were plans in the report of the time, not a record of what actually took place; this site has not consulted the original newspaper, so the point is marked as to be verified.',
    'Side by side | The official release stresses that the city government came up with it first, while the press report shows the idea coming from civic groups with the city co-organising. This site sets the two accounts side by side without reconciling them; the safer wording is: since 1996, run jointly by the city and merchants, with the idea put forward by a civic group (according to the report).',
    'Today | The event is held roughly in the half-month before Lunar New Year; exact dates, extent and linked shopping areas differ from year to year. This site has not checked each year, so it gives no dates; for the schedule, follow the city government’s announcement for that year. Nor does this site name any single shop as the founder of the event.',
    'Note | The Lunar New Year Market is an event run by the city government and merchants since 1996. Promotional claims online such as “the first” or “a hundred years old” have no supporting evidence that this site could find, and are not used; visitor numbers and turnover figures also have no reliable source and are left out. This section sits in the “Old Houses, New Life” era because the event is still held today; the street scene is illustrative and does not show the actual extent of the event.',
  ],
  facts: [
    { label: '起始', labelEn: 'Start', value: '1996年（臺北市政府新聞稿）', valueEn: '1996 (Taipei City Government press release)' },
    { label: '構想由來', labelEn: 'Origin of the idea', value: '官方稿：市府首創；報導：民間迪化街工作室提出、市府協辦（並列）', valueEn: 'Official release: first by the city government; press report: proposed by the civic Dihua Street Studio, co-organised by the city (shown side by side)' },
    { label: '時間', labelEn: 'Timing', value: '農曆春節前約半個月（各年日期不同，不寫死）', valueEn: 'About half a month before Lunar New Year (dates differ each year and are not fixed here)' },
    { label: '待核', labelEn: 'To be verified', value: '主辦與承辦單位、1996年實際日期與範圍、各年規模與數字', valueEn: 'Organising and executing bodies, the actual dates and extent in 1996, and the scale and figures of each year' },
  ],
  timeline: [
    { place: '1995年12月', placeEn: 'December 1995', text: '民生報報導：民間迪化街工作室提出構想，約50家商戶支持，市府協辦（報時光2023年重現，原報未查閱，待核）。', textEn: 'Minsheng Daily reports: the civic Dihua Street Studio puts forward the idea, about 50 merchants support it, and the city government agrees to co-organise (reproduced by Bao Shiguang in 2023; original newspaper not consulted; to be verified).' },
    { place: '1996', text: '迪化街年貨大街在農曆春節前半個月首次舉辦（臺北市政府新聞稿）。', textEn: 'The first Dihua Street Lunar New Year Market is held in the half-month before Lunar New Year (Taipei City Government press release).' },
    { place: '現在', placeEn: 'Today', text: '每年春節前仍舉辦；各年日期與範圍以當年市府公告為準。', textEn: 'Still held every year before Lunar New Year; for the dates and extent of each year, follow the city government’s announcement for that year.' },
  ],
  sourceIds: ['taipei-gov-2025-nianhuo', 'udn-time-2023-nianhuo'],
}

/** 年前買南北貨的長期習慣：與 1996 年的活動分開 */
export const NANBEI_BACKGROUND_CHAPTER = {
  id: 'nanbei-background',
  type: 'text',
  tab: '過年前買南北貨',
  tabEn: 'Buying dried goods before the New Year',
  title: '背景：年前買南北貨的習慣（與1996年的活動無關）',
  titleEn: 'Background: the custom of buying dried goods before the New Year (unrelated to the 1996 event)',
  lead: '年前到迪化街買南北貨，是比年貨大街更早的習慣；這一節只當背景，兩件事不能連在一起讀。',
  leadEn: 'Going to Dihua Street to buy dried goods from north and south before the New Year is an older habit than the Lunar New Year Market; this section serves only as background, and the two must not be read as one story.',
  paragraphs: [
    '背景｜BIOS monthly 2016年的文章整理：清咸豐年間移民增多、兩岸貿易熱絡，臺灣輸出米糖茶，輸入南北乾貨與建材；帆船改在大稻埕碼頭卸貨之後，迪化街成為南北貨的大宗批發中心。文章也提到，過年前要囤貨，是因為節慶期間菜市場休市。這是一篇二手整理，沒有逐項附史料，本站標待核。',
    '分開讀｜這一節說的是年前辦年貨的習慣與迪化街的批發角色；1996年的年貨大街則是市府與商家辦的活動。本站沒有找到任何證據顯示1996年以前就有「年貨大街」這個活動，也不把兩者寫成同一件事的延續。',
    '待補｜文章列為參考的〈大稻埕南北貨座談會紀錄〉（《臺北文獻》110期，1994年12月）本站未能取得，取得之前，戰前至戰後有哪些南北貨商家、各自的經營情形，本站不寫。',
  ],
  paragraphsEn: [
    'Background | A 2016 article in BIOS monthly summarises: in the Xianfeng reign of the Qing, immigration grew and cross-strait trade flourished; Taiwan exported rice, sugar and tea and imported dried goods from north and south and building materials; once sailing ships began unloading at the Dadaocheng wharf, Dihua Street became the main wholesale centre for dried goods from north and south. The article also says people stocked up before the New Year because the wet markets closed over the festival. This is a secondary summary that does not cite sources item by item, so this site marks it as to be verified.',
    'Read apart | This section is about the custom of buying festive goods before the New Year and Dihua Street’s wholesale role; the 1996 Lunar New Year Market is an event run by the city government and merchants. This site has found no evidence that an event called the “Lunar New Year Market” existed before 1996, and does not present the two as one continuous story.',
    'Still to add | The article lists as a reference the “Record of the Dadaocheng Dried-Goods Symposium” (Taipei Wenxian, issue 110, December 1994), which this site has not been able to obtain. Until it does, this site will not say which dried-goods merchants operated from before the war to after it, or how each was run.',
  ],
  facts: [
    { label: '性質', labelEn: 'Nature', value: '二手整理的背景介紹，標待核', valueEn: 'Background from a secondary summary, marked to be verified' },
    { label: '不寫', labelEn: 'Left out', value: '戰前至戰後的南北貨商家名單與店史（查無可靠出處）', valueEn: 'Lists and histories of dried-goods merchants from before the war to after it (no reliable source found)' },
    { label: '待補', labelEn: 'Still to add', value: '《臺北文獻》110期〈大稻埕南北貨座談會紀錄〉（1994）', valueEn: 'Taipei Wenxian, issue 110, “Record of the Dadaocheng Dried-Goods Symposium” (1994)' },
  ],
  sourceIds: ['bios-2016-dihua-nianhuo'],
}

/** 永樂市場「參考資料」章節要補上的出處 */
export const NIANHUO_SOURCE_IDS = ['taipei-gov-2025-nianhuo', 'udn-time-2023-nianhuo', 'bios-2016-dihua-nianhuo']
export const NIANHUO_DISCLAIMER_TEXT = NIANHUO_DISCLAIMER

/**
 * 年表上的大事：1996 年首次舉辦（有官方稿出處）。1980–2000 之間沒有年代，會落在年表的「年代之間」。
 */
export const NIANHUO_TIMELINE_EVENT = {
  year: 1996,
  text: '迪化街年貨大街首次在農曆春節前半個月舉辦（市府新聞稿；構想由來與實際日期、範圍待核）。',
  textEn: 'The first Dihua Street Lunar New Year Market is held in the half-month before Lunar New Year (city press release; origin of the idea, actual dates and extent to be verified).',
  sourceIds: ['taipei-gov-2025-nianhuo', 'udn-time-2023-nianhuo'],
}

/* ═══════════ 呷二嘴：米苔目主題的現代相關店家 ═══════════ */

/**
 * 米苔目主題的 related 資料（不是店家條目、沒有 3D 模型）：現代店家的文字介紹。
 * 名稱只用文字，不使用店家的商標或裝潢；1954 是店家與食記的說法，未見文件佐證。
 */
export const XIA_ER_ZUI_RELATED = {
  eraId: 'revival',
  place: {
    id: 'xia-er-zui',
    name: '呷二嘴',
    nameEn: 'Xia Er Zui',
    address: '臺北市大同區甘州街34號',
    addressEn: 'No. 34, Ganzhou Street, Datong District, Taipei',
    summary: '大稻埕的米苔目小吃店，夏季賣米苔目冰，冬季賣熱食。',
    summaryEn: 'A mi-tai-mu snack shop in Dadaocheng: mi-tai-mu ice in summer, hot dishes in winter.',
    sourceIds: ['ettoday-2026-xia-er-zui', 'lordcat-2022-xia-er-zui', 'tenjo-2026-xia-er-zui'],
  },
  relation: '同類食物的參訪對照，沒有品牌傳承關係',
  relationEn: 'A visit-and-compare example of the same kind of food, with no brand lineage',
}

export const XIA_ER_ZUI_CHAPTER = {
  id: 'related-xia-er-zui',
  type: 'text',
  tab: '相關店家：呷二嘴',
  tabEn: 'Related shop: Xia Er Zui',
  title: '同樣賣米苔目的店：呷二嘴',
  titleEn: 'Another mi-tai-mu shop: Xia Er Zui',
  lead: '甘州街上另一家賣米苔目的小吃店，只是同一種食物的參訪對照；它和永樂米苔目、也和廟口的情境攤位都沒有傳承關係。',
  leadEn: 'Another mi-tai-mu snack shop on Ganzhou Street, shown only as a visit-and-compare example of the same food; it has no lineage link to Yongle Mi-tai-mu or to the scenario stalls at the temple front.',
  paragraphs: [
    '位置｜呷二嘴在臺北市大同區甘州街34號（ETtoday 旅遊雲2026年、貓大爺2022年的食記）。本站沒有為它做 3D 模型，也不使用它的招牌、商標或裝潢，這裡只有文字介紹。',
    '現況與做法｜食記寫，夏季賣米苔目冰，可以自選米苔目、粉粿、紅豆、仙草等四種配料；冬季改賣熱食，有米苔目、筒仔米糕與丸子湯。店內用餐區重現紅磚人行道與紅色大門的樣子，那是現代的裝潢，不是史料。菜色與營業情形以現場為準。',
    '年份｜三篇食記都寫「1954年創立」，但各篇沒有引用文件，也沒有執照、登記或口述歷史可以核實，所以這個年份是店家與食記的說法，未見文件佐證，本站不當成查證過的年份。創辦人、傳承的世代、早期攤位的位置與各階段的經營變化，都查無可靠出處，不寫。另有部落格提到早期在街口擺攤，只有單一來源，也不採用。',
    '說明｜食記的排名與「推薦」一類說法，本站沒有找到官方頁面可以核對，不採用。這家店和廟口小吃群裡的米苔目攤是兩件事：廟口的攤位是不具名的歷史情境重建，不是呷二嘴的前身；本站也沒有找到呷二嘴與其他店家或廟口之間有歷史關係的資料，不寫。',
  ],
  paragraphsEn: [
    'Location | Xia Er Zui is at No. 34, Ganzhou Street, Datong District, Taipei (food write-ups by ETtoday Travel Cloud, 2026, and Lord Cat, 2022). This site has built no 3D model of it and does not use its signboard, logo or decor; here there is only a written introduction.',
    'Today and how it is done | The write-ups say that in summer it sells mi-tai-mu ice, for which you choose four toppings such as mi-tai-mu, fen guo (starch dumplings), red beans and grass jelly; in winter it switches to hot food, with mi-tai-mu, tube-shaped sticky rice (tongzai mi gao) and meatball soup. The dining area recreates a red-brick pavement and a red gate; that is modern decor, not historical evidence. For the menu and opening hours, go by what you find on site.',
    'Year | All three write-ups say it was “founded in 1954”, but none cites a document, and there is no licence, registration or oral history to check it against, so the year is the shop’s and the write-ups’ own account, with no documentary support; this site does not treat it as a verified year. The founder, the generations that carried it on, the early stall’s location and changes in operation over the years have no reliable source and are left out. One blog mentions an early stall at a street corner, but from a single source only, so it is not used either.',
    'Note | Rankings and “recommended” claims in food write-ups could not be checked against any official page and are not used. This shop and the mi-tai-mu stall among the temple-front snack stalls are two separate things: the temple-front stall is an unnamed reconstruction of a historical scene, not Xia Er Zui’s predecessor; nor has this site found any material linking Xia Er Zui historically to other shops or to the temple front, so none is given.',
  ],
  facts: [
    { label: '地址', labelEn: 'Address', value: '臺北市大同區甘州街34號（食記）', valueEn: 'No. 34, Ganzhou Street, Datong District, Taipei (food write-ups)' },
    { label: '創立年', labelEn: 'Year founded', value: '1954（店家與食記的說法，未見文件佐證）', valueEn: '1954 (the shop’s and the write-ups’ account; no documentary support)' },
    { label: '季節', labelEn: 'Season', value: '夏季米苔目冰、冬季熱食（食記）', valueEn: 'Mi-tai-mu ice in summer, hot food in winter (food write-ups)' },
    { label: '關係', labelEn: 'Relationship', value: '米苔目主題的現代相關店家，同類食物的參訪對照，沒有品牌傳承關係', valueEn: 'A modern related shop under the mi-tai-mu theme: a visit-and-compare example of the same food, with no brand lineage' },
  ],
  sourceIds: ['ettoday-2026-xia-er-zui', 'lordcat-2022-xia-er-zui', 'tenjo-2026-xia-er-zui'],
}

export const XIA_ER_ZUI_DISCLAIMER =
  '呷二嘴的資料全部來自食記與部落格，沒有官方文資資料、學術論文或地方志；1954年創立是店家與食記的說法，未見文件佐證。創辦人、世代、早期攤位位置與各階段經營查無可靠出處，本站不寫，也不使用店家的商標，沒有為它建模。'

/** 英文版：免責文字（對應 NIANHUO_DISCLAIMER_TEXT／XIA_ER_ZUI_DISCLAIMER） */
export const NIANHUO_DISCLAIMER_TEXT_EN =
  'The starting year of the Lunar New Year Market rests on a city government press release; the origin of the idea and the plans for 1996 appear only in a secondary article reproducing a 1995 report (this site has not consulted the original newspaper), so the official release and the report are shown side by side. The organising and executing bodies, the actual dates and extent in 1996, the dates of each year, and visitor and turnover figures have no reliable source and are not given here; for each year’s event, follow the city government’s announcement. The history of dried goods from north and south is a secondary summary, and the record of the Taipei Wenxian issue 110 symposium could not be obtained and is still to be added. Yongle Market is merely where this section is placed and does not mean the market runs the event.'

export const XIA_ER_ZUI_DISCLAIMER_EN =
  'All the information on Xia Er Zui comes from food write-ups and blogs; there are no official cultural-heritage materials, academic papers or gazetteers. Its founding in 1954 is the shop’s and the write-ups’ account, with no documentary support. The founder, the generations, the early stall’s location and the changes in operation over the years have no reliable source and are not given here; the shop’s logo is not used and no model was built of it.'
