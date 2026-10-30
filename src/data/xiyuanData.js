/**
 * 大稻埕戲苑（第 7 階段 C）：只加章節與出處，沒有新的 3D 建築、店家、地段或碰撞。
 *
 * 查證紀錄：docs/research/da-dao-cheng-xi-yuan.md。結論：
 * - 戲苑在永樂市場大樓的 8、9 樓（9 樓劇場、8 樓曲藝場），不是 4 樓；由臺北市藝文推廣處管理。
 * - 沿革只有百科與專業雜誌互相支持：1987 延平活動中心 → 2009 更名 → 2010 試營運 → 2011 正式營運，年份並列、開幕年份標待核。
 * - 戲苑是現代公立場館，與淡水戲館、永樂座、第一劇場等歷史戲院沒有承接、同址或同團體關係；
 *   「延續戲窟文化」只是館方的自述宗旨。「戲窟」一節獨立成背景，明寫戲苑並非它們的延續。
 * - 查無而不寫：北投／臺北戲棚遷移、百年傳統、與歷史戲院的傳承、由文化局或市場處營運、二三樓布市的歷史推論、樓上 1985–1987 的用途。
 * - 章節掛在「老屋新生」年代的永樂市場故事裡；不做 3D 與室內探索（沒有空間照片與尺寸）。
 */

/** 戲苑章節掛在這個年代、這家店的故事裡 */
export const XIYUAN_ERA_ID = 'revival'
export const XIYUAN_HOST_SHOP_ID = 'yong-le-market'

const XIYUAN_DISCLAIMER =
  '大稻埕戲苑的位置、樓層、演出類型與現在的管理單位依臺北市政府劇場整合資訊平臺；沿革（1987年延平活動中心、2009年更名、2010年試營運、2011年正式營運、2015年改隸）只有百科條目與《PAR表演藝術》互相支持，沒有官方沿革頁可核對，開幕年份以2010／2011並列、標待核。延平區行政中心與永樂市場大樓的關係、座位數、「大稻埕古城重現專案」的內容、市場大樓8、9樓在1987年以前的用途都查無，不寫。戲苑與永樂座等歷史戲院沒有承接關係，本站只把「延續戲窟文化」寫成館方自述。場景中的市場大樓只做外觀與一樓，8、9樓沒有做出，也不開放探索。'

const XIYUAN_DISCLAIMER_EN =
  'The location, floors, performance types and present managing body of Dadaocheng Xiyuan follow the Taipei City Government’s integrated theatre information platform. Its history (the Yanping Activity Centre in 1987, renaming in 2009, trial operation in 2010, formal operation in 2011, transfer in 2015) is supported only by an encyclopedia entry and PAR Performing Arts Magazine, with no official history page to check, so the opening year is given as 2010/2011 side by side and marked to be verified. The relationship between the Yanping District Administrative Centre and the Yongle Market building, the seating numbers, the content of the “Dadaocheng Old Town Revival Project” and the use of floors 8 and 9 before 1987 could not be found and are not stated. Xiyuan has no succession relationship with historical theatres such as Yongle Theatre; this site presents “continuing the theatre-den culture” only as the venue’s own stated aim. The market building in the scene has only its exterior and ground floor; floors 8 and 9 are not built and not open to exploration.'

/** 第一章：位置、樓層與演出 */
export const XIYUAN_VENUE_CHAPTER = {
  id: 'xiyuan-venue',
  type: 'text',
  tab: '大稻埕戲苑',
  tabEn: 'Dadaocheng Xiyuan',
  title: '市場大樓8、9樓的戲曲場館：大稻埕戲苑',
  titleEn: 'A traditional-opera venue on floors 8 and 9 of the market building: Dadaocheng Xiyuan (Dadaocheng Theatre)',
  lead: '永樂市場大樓的8、9樓是一座公立的傳統戲曲場館「大稻埕戲苑」。這裡只有文字介紹；場景中的大樓沒有做出8、9樓的內部。',
  leadEn: 'Floors 8 and 9 of the Yongle Market building house a public venue for traditional opera, Dadaocheng Xiyuan (Dadaocheng Theatre). This is a text-only introduction; the building in the scene has no interior for floors 8 and 9.',
  paragraphs: [
    '位置｜依臺北市政府劇場整合資訊平臺的場館資料，大稻埕戲苑座落在永樂市場大樓的8、9樓，管理單位是臺北市藝文推廣處。市場處的市場介紹只寫一樓與二、三樓的用途，沒有提到戲苑；本站把戲苑放在永樂市場的故事裡，是因為同在這棟大樓，不表示由市場經營。',
    '9樓劇場｜9樓是鏡框式的劇場。《PAR表演藝術》2011年的報導寫「可容納五百人」，百科條目寫506席，劇場平臺的分類是「501–1000席」；三個數字不一致，本站只寫「約500席」並標待核。演出以歌仔戲、京劇、南管、北管、客家戲與說唱等傳統戲曲為主。',
    '8樓曲藝場與布袋戲展｜8樓是較小的曲藝場，報導與百科都寫約100席（百科另說沒有固定席位），以掌中戲（布袋戲）為主，也演南管與說唱；同一層還有布袋戲的常設展區與排練空間。本站沒有看過內部的照片與尺寸，所以不做3D，也不描述舞臺與座位的樣子。',
    '節目｜臺北市藝文推廣處的活動頁上，戲苑的節目有布袋戲、歌仔戲、崑劇與偶戲展覽；詳細的節目、票價與開放時間以官方公告為準，本站不寫。',
    '說明｜這一節寫的是現代的公立場館，不是市場的歷史。市場大樓1985年開業時各樓層的用途見「市場歷史」一章；8、9樓在1987年以前的用途查無，本站不寫；二、三樓布市的歷史也和戲苑無關，不在這裡推論。',
  ],
  paragraphsEn: [
    'Location | According to the venue data on the Taipei City Government’s integrated theatre information platform, Dadaocheng Xiyuan is on floors 8 and 9 of the Yongle Market building, managed by the Taipei Art Promotion Office. The Market Administration Office’s introduction of the market covers only the ground floor and the second and third floors and does not mention Xiyuan; this site places Xiyuan in the Yongle Market story because it is in the same building, not because the market runs it.',
    '9th-floor theatre | The 9th floor is a proscenium theatre. PAR Performing Arts Magazine reported in 2011 that it “can hold five hundred people”, the encyclopedia entry says 506 seats, and the theatre platform classifies it as “501–1,000 seats”; the three figures do not agree, so this site says only “about 500 seats” and marks it to be verified. Performances are mainly traditional opera: Taiwanese opera (gezaixi), Peking opera, nanguan, beiguan, Hakka opera and storytelling-and-singing.',
    '8th-floor quyi hall and glove-puppetry exhibition | The 8th floor has a smaller quyi hall (performance space for narrative arts), with about 100 seats according to both the reports and the encyclopedia (the encyclopedia adds that there are no fixed seats). It focuses on glove puppetry (budaixi) and also stages nanguan and storytelling-and-singing; the same floor has a permanent glove-puppetry exhibition area and rehearsal space. This site has seen no photographs or dimensions of the interior, so it builds no 3D and does not describe the stage or seating.',
    'Programmes | On the Taipei Art Promotion Office’s events page, Xiyuan’s programmes include glove puppetry, Taiwanese opera, Kunqu and puppetry exhibitions; for detailed programmes, ticket prices and opening hours please rely on official announcements, which this site does not reproduce.',
    'Note | This section describes a modern public venue, not the history of the market. For what each floor was used for when the market building opened in 1985, see the chapter “Market history”; the use of floors 8 and 9 before 1987 could not be found and is not stated; the history of the cloth market on the second and third floors is unrelated to Xiyuan and is not inferred here.',
  ],
  facts: [
    { label: '位置', labelEn: 'Location', value: '永樂市場大樓8、9樓（迪化街一段21號）', valueEn: 'Floors 8 and 9 of the Yongle Market building (No. 21, Section 1, Dihua Street)' },
    { label: '9樓', labelEn: '9th floor', value: '劇場，約500席（500／506／501–1000席三說，待核）；歌仔戲、京劇、南管、北管、客家戲、說唱', valueEn: 'Theatre, about 500 seats (500 / 506 / 501–1,000 in three accounts; to be verified); Taiwanese opera, Peking opera, nanguan, beiguan, Hakka opera, storytelling-and-singing' },
    { label: '8樓', labelEn: '8th floor', value: '曲藝場約100席（有無固定席位兩說）、布袋戲常設展區、排練室', valueEn: 'Quyi hall of about 100 seats (accounts differ on whether seats are fixed), permanent glove-puppetry exhibition area, rehearsal room' },
    { label: '管理單位', labelEn: 'Managing body', value: '臺北市藝文推廣處（劇場整合資訊平臺）', valueEn: 'Taipei Art Promotion Office (integrated theatre information platform)' },
  ],
  sourceIds: ['eculture-taipei-xiyuan', 'par-2011-xiyuan', 'tapo-xiyuan-events', 'wiki-dadaocheng-xiyuan'],
}

/** 第二章：沿革，年份並列 */
export const XIYUAN_HISTORY_CHAPTER = {
  id: 'xiyuan-history',
  type: 'text',
  tab: '從延平活動中心到戲苑',
  tabEn: 'From Yanping Activity Centre to Xiyuan',
  title: '從延平活動中心到大稻埕戲苑（1987—2011，開幕年份待核）',
  titleEn: 'From Yanping Activity Centre to Dadaocheng Xiyuan (1987–2011; opening year to be verified)',
  lead: '戲苑的前身是1987年成立的「延平活動中心」；2009年更名，2010年試營運，2011年正式營運。這幾個年份來自不同的資料，本站並列，不挑其中一個寫成「開幕年」。',
  leadEn: 'Xiyuan’s predecessor was the Yanping Activity Centre, established in 1987; it was renamed in 2009, began trial operation in 2010 and formal operation in 2011. These years come from different sources, so this site lists them side by side rather than choosing one as “the opening year”.',
  paragraphs: [
    '前身｜依百科條目，1987年2月臺北市立社會教育館在「延平區行政中心9樓」成立延平活動中心。《PAR表演藝術》2011年的報導則寫，戲苑由原本「永樂市場內的延平活動中心」改建。兩篇資料對前身所在的寫法不同（延平區行政中心、永樂市場），可能指同一棟大樓，但沒有任何資料直接說明兩者的關係，本站不推論、標待核。',
    '整建與更名｜百科寫2009年3月配合「大稻埕古城重現專案」整建，同年10月31日更名為「大稻埕戲苑」；報導寫整修在「前年」（2009年）完成，由前任社教館館長推動。「大稻埕古城重現專案」的主辦機關與內容查無官方文件，本站只記名稱。',
    '試營運與正式營運｜百科寫2010年3月6日開館試營運；報導寫「去年」（2010年）開始試營運、「本月底」（2011年3月）正式營運；《PAR表演藝術》2014年的另一篇文章則寫戲苑2011年開幕、當年滿三週年。綜合起來是：2010年試營運、2011年正式營運。網路上有的寫2010年成立、有的寫2011年開幕，本站兩個年份並列，沒有官方沿革頁可以核對，標待核。',
    '管理單位｜2011年前後由臺北市立社會教育館經營；百科寫2015年11月6日社教館改制為臺北市藝文推廣處，戲苑改隸其下。改制的日期只有百科一個來源，標待核；現在的管理單位是藝文推廣處，有劇場整合資訊平臺可以核對。本站沒有找到戲苑由文化局或市場處直接營運的資料，不寫。',
    '說明｜這一節的沿革只有百科條目與專業雜誌互相支持，沒有官方沿革頁或公文。網路上另有「戲苑由北投遷來」「由臺北戲棚遷移」的說法，本站查無任何依據，不採用。',
  ],
  paragraphsEn: [
    'Predecessor | According to the encyclopedia entry, in February 1987 the Taipei Municipal Social Education Hall established the Yanping Activity Centre on “the 9th floor of the Yanping District Administrative Centre”. PAR Performing Arts Magazine’s 2011 report instead says Xiyuan was rebuilt from the “Yanping Activity Centre inside Yongle Market”. The two sources describe the predecessor’s location differently (Yanping District Administrative Centre; Yongle Market); they may mean the same building, but no source says so directly, so this site draws no inference and marks it to be verified.',
    'Renovation and renaming | The encyclopedia says that in March 2009 the building was renovated under the “Dadaocheng Old Town Revival Project” and that on 31 October the same year it was renamed “Dadaocheng Xiyuan”; the report says the renovation was completed “the year before last” (2009), driven by the former director of the Social Education Hall. The sponsoring agency and content of the “Dadaocheng Old Town Revival Project” cannot be found in any official document, so this site records only its name.',
    'Trial and formal operation | The encyclopedia says trial operation began on 6 March 2010; the report says trial operation began “last year” (2010) and formal operation would start “at the end of this month” (March 2011); another PAR Performing Arts Magazine article in 2014 says Xiyuan opened in 2011 and was celebrating its third anniversary that year. Taken together: trial operation in 2010, formal operation in 2011. Some websites say it was founded in 2010 and others that it opened in 2011; this site lists both years side by side, with no official history page to check, and marks it to be verified.',
    'Managing body | Around 2011 it was run by the Taipei Municipal Social Education Hall; the encyclopedia says that on 6 November 2015 the Social Education Hall was reorganised into the Taipei Art Promotion Office and Xiyuan came under it. The date of the reorganisation has only the encyclopedia as a source and is marked to be verified; the present managing body is the Art Promotion Office, which can be checked on the theatre information platform. This site found no material saying Xiyuan is run directly by the Department of Cultural Affairs or the Market Administration Office, so it does not state this.',
    'Note | The history in this section is supported only by the encyclopedia entry and a professional magazine, with no official history page or official document. Some websites claim that Xiyuan “moved from Beitou” or “was relocated from the Taipei theatre tent”; this site found no basis for either and does not use them.',
  ],
  facts: [
    { label: '前身', labelEn: 'Predecessor', value: '延平活動中心，1987年2月成立（臺北市立社會教育館；百科）', valueEn: 'Yanping Activity Centre, established February 1987 (Taipei Municipal Social Education Hall; encyclopedia)' },
    { label: '更名', labelEn: 'Renamed', value: '2009年10月31日更名為大稻埕戲苑（百科；報導寫2009年整修完成）', valueEn: '31 October 2009, renamed Dadaocheng Xiyuan (encyclopedia; the report says renovation was completed in 2009)' },
    { label: '試營運', labelEn: 'Trial operation', value: '2010年（百科3月6日；報導「去年」）', valueEn: '2010 (6 March per the encyclopedia; “last year” per the report)' },
    { label: '正式營運', labelEn: 'Formal operation', value: '2011年（報導2011年3月底；2014年報導稱2011年開幕）；開幕年份以2010／2011並列、待核', valueEn: '2011 (end of March 2011 per the report; a 2014 report says it opened in 2011); the opening year is listed as 2010/2011, to be verified' },
    { label: '待核', labelEn: 'To be verified', value: '延平區行政中心與永樂市場大樓的關係、2015年改隸日期、「大稻埕古城重現專案」內容', valueEn: 'The relationship between the Yanping District Administrative Centre and the Yongle Market building, the date of the 2015 reorganisation, and the content of the “Dadaocheng Old Town Revival Project”' },
  ],
  timeline: [
    { place: '1987年2月', placeEn: 'February 1987', text: '臺北市立社會教育館成立延平活動中心（百科寫在「延平區行政中心9樓」，與永樂市場大樓的關係待核）。', textEn: 'The Taipei Municipal Social Education Hall establishes the Yanping Activity Centre (the encyclopedia says on “the 9th floor of the Yanping District Administrative Centre”; its relationship to the Yongle Market building is to be verified).' },
    { place: '2009', text: '整建；10月31日更名為「大稻埕戲苑」（百科；報導寫整修於2009年完成）。', textEn: 'Renovation; renamed “Dadaocheng Xiyuan” on 31 October (encyclopedia; the report says renovation was completed in 2009).' },
    { place: '2010', text: '試營運（百科3月6日；報導寫「去年」）。', textEn: 'Trial operation (6 March per the encyclopedia; “last year” per the report).' },
    { place: '2011', text: '正式營運（報導寫2011年3月底；2014年報導稱2011年開幕）。', textEn: 'Formal operation (end of March 2011 per the report; a 2014 report says it opened in 2011).' },
    { place: '2015', text: '社教館改制為臺北市藝文推廣處，戲苑改隸（只有百科，日期待核）。', textEn: 'The Social Education Hall is reorganised into the Taipei Art Promotion Office and Xiyuan comes under it (encyclopedia only; date to be verified).' },
  ],
  sourceIds: ['par-2011-xiyuan', 'par-2014-xiku', 'wiki-dadaocheng-xiyuan', 'eculture-taipei-xiyuan'],
}

/** 第三章：獨立背景，明寫戲苑並非歷史戲院的延續 */
export const XIKU_BACKGROUND_CHAPTER = {
  id: 'xiku-background',
  type: 'text',
  tab: '大稻埕曾經的戲窟',
  tabEn: 'Dadaocheng’s former theatre dens',
  title: '背景：大稻埕曾經的戲窟（戲苑並非這些戲院的延續）',
  titleEn: 'Background: Dadaocheng’s former theatre dens (Xiyuan is not a continuation of these theatres)',
  lead: '日治時期的大稻埕有好幾座戲院，被稱為「戲窟」。這一節只列有出處的幾座；大稻埕戲苑是2010年代的公立場館，並非它們的延續，兩件事要分開讀。',
  leadEn: 'Under Japanese rule Dadaocheng had several theatres, known as the “theatre dens” (xiku). This section lists only those with sources; Dadaocheng Xiyuan is a public venue of the 2010s and not a continuation of them, so the two matters should be read separately.',
  paragraphs: [
    '淡水戲館｜《PAR表演藝術》2014年的文章寫，淡水戲館1909年建成，後來改名為臺灣新舞臺，1945年在空襲中毀壞。本站只採這幾個節點，經營者、座位數與演出內容沒有另外查證，不寫。',
    '永樂座｜百科條目（引《臺灣大百科全書》等）寫，永樂座1921年起籌設（初名「臺北大舞台」）、1923年改名永樂座、1924年2月17日開幕，位在今迪化街一段46巷、大稻埕市場的對面，1960年5月歇業。2014年的文章也寫永樂座的舊址在市場對面。這些是有出處的位置與年份；永樂座與現在的永樂市場大樓不是同一棟建築，條目裡也沒有提到永樂市場或戲苑。',
    '第一劇場｜2014年的文章寫，第一劇場1935年建於太平町（今延平北路一帶），以電影與新劇為主。本站沒有查到它的拆除年份與後續，不寫。',
    '並非延續｜大稻埕戲苑是1987年延平活動中心改建、2010年代開始營運的公立場館（見「從延平活動中心到戲苑」一章）。它和淡水戲館、永樂座、第一劇場沒有承接、同址或同團體的關係；2014年的文章介紹了這三座戲院，也沒有說戲苑承接其中任何一座。本站因此不寫「歷史戲院重生」「永樂座的後身」或「百年傳統」。',
    '館方自述｜《PAR表演藝術》2011年的報導引述館方，希望「傳承、延續大稻埕古城的戲窟文化」。這是館方的宗旨與自述，不是史實的連結；本站照錄，不把它寫成戲苑與歷史戲院之間的傳承。附近廟宇保有野臺戲的傳統（同一篇報導提到），那是廟會的事，也不是戲苑的沿革。',
    '說明｜網路上流傳「13間消失的戲院」之類的整理，本站沒有逐間核對，只寫上面三座有專業雜誌或百科可查的戲院。永樂座的開幕年份與地點以《臺灣大百科全書》為依據，本站未直接查閱原條目，標待核。',
  ],
  paragraphsEn: [
    'Tamsui Theatre | A 2014 article in PAR Performing Arts Magazine says the Tamsui Theatre (Danshui Xiguan) was built in 1909, later renamed the Taiwan New Stage, and destroyed in an air raid in 1945. This site adopts only these milestones; its operators, seating and programmes have not been separately checked and are not stated.',
    'Yongle Theatre | The encyclopedia entry (citing the Encyclopedia of Taiwan and others) says that Yongle Theatre (Yongle-za) was planned from 1921 (first named the “Taipei Grand Stage”), renamed Yongle-za in 1923 and opened on 17 February 1924, on today’s Lane 46, Section 1, Dihua Street, opposite the Dadaocheng market, and closed in May 1960. The 2014 article also puts the old site opposite the market. These are sourced locations and years; Yongle Theatre is not the same building as today’s Yongle Market building, and the entry mentions neither Yongle Market nor Xiyuan.',
    'First Theatre | The 2014 article says the First Theatre was built in 1935 on Taiping-chō (around today’s Yanping North Road), mainly for film and modern drama. This site could not find the year of its demolition or what followed, so it does not state them.',
    'Not a continuation | Dadaocheng Xiyuan is a public venue rebuilt from the Yanping Activity Centre of 1987 and operating from the 2010s (see the chapter “From Yanping Activity Centre to Xiyuan”). It has no succession, shared site or shared company with the Tamsui Theatre, Yongle Theatre or First Theatre; the 2014 article introduces these three theatres and does not say Xiyuan succeeded any of them. This site therefore does not write “rebirth of a historical theatre”, “successor of Yongle Theatre” or “hundred-year tradition”.',
    'The venue’s own words | PAR Performing Arts Magazine’s 2011 report quotes the venue as hoping to “pass on and continue the theatre-den culture of old Dadaocheng”. This is the venue’s aim and self-description, not a historical link; this site reproduces it without turning it into a succession between Xiyuan and the historical theatres. Nearby temples keep the tradition of open-air opera (mentioned in the same report), which belongs to temple festivals and is not part of Xiyuan’s history either.',
    'Note | Lists such as “13 vanished theatres” circulate online; this site has not checked them one by one and writes only about the three theatres above that can be looked up in a professional magazine or encyclopedia. The opening year and location of Yongle Theatre follow the Encyclopedia of Taiwan, whose original entry this site has not consulted directly, so they are marked to be verified.',
  ],
  facts: [
    { label: '淡水戲館', labelEn: 'Tamsui Theatre', value: '1909年建、後改名臺灣新舞臺、1945年毀於空襲（《PAR表演藝術》2014）', valueEn: 'Built 1909, later renamed the Taiwan New Stage, destroyed in an air raid in 1945 (PAR Performing Arts Magazine, 2014)' },
    { label: '永樂座', labelEn: 'Yongle Theatre', value: '1924年2月17日開幕、1960年5月歇業；今迪化街一段46巷，市場對面（百科引《臺灣大百科全書》，待核）', valueEn: 'Opened 17 February 1924, closed May 1960; today’s Lane 46, Section 1, Dihua Street, opposite the market (encyclopedia citing the Encyclopedia of Taiwan; to be verified)' },
    { label: '第一劇場', labelEn: 'First Theatre', value: '1935年建於太平町，以電影與新劇為主（《PAR表演藝術》2014）', valueEn: 'Built in 1935 on Taiping-chō, mainly for film and modern drama (PAR Performing Arts Magazine, 2014)' },
    { label: '與戲苑的關係', labelEn: 'Relationship to Xiyuan', value: '沒有承接、同址或同團體關係；「延續戲窟文化」為館方自述', valueEn: 'No succession, shared site or shared company; “continuing the theatre-den culture” is the venue’s own statement' },
  ],
  sourceIds: ['par-2014-xiku', 'wiki-yongle-za', 'par-2011-xiyuan'],
}

/** 永樂市場「參考資料」章節要補上的出處 */
export const XIYUAN_SOURCE_IDS = ['eculture-taipei-xiyuan', 'par-2011-xiyuan', 'par-2014-xiku', 'tapo-xiyuan-events', 'wiki-dadaocheng-xiyuan', 'wiki-yongle-za']
export const XIYUAN_DISCLAIMER_TEXT = XIYUAN_DISCLAIMER
export const XIYUAN_DISCLAIMER_TEXT_EN = XIYUAN_DISCLAIMER_EN

/**
 * 年表上的大事：2011 年正式營運（《PAR表演藝術》2011、2014），文字並列 2010 年試營運。
 * 1987 年延平活動中心、2009 年更名只有百科，不上年表。
 */
export const XIYUAN_TIMELINE_EVENT = {
  year: 2011,
  text: '大稻埕戲苑在永樂市場大樓8、9樓正式營運（2010年試營運；前身為1987年的延平活動中心，開幕年份以2010／2011並列、待核）。',
  textEn: 'Dadaocheng Xiyuan begins formal operation on floors 8 and 9 of the Yongle Market building (trial operation in 2010; predecessor the Yanping Activity Centre of 1987; opening year listed as 2010/2011, to be verified).',
  sourceIds: ['par-2011-xiyuan', 'par-2014-xiku', 'eculture-taipei-xiyuan'],
}
