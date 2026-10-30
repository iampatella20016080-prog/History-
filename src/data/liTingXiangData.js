/**
 * 李亭香（第 7 階段 B）：章節內容與年代說明。
 *
 * 查證紀錄：docs/research/li-ting-xiang.md。能查到的全是商業媒體與部落格，沒有官方或學術來源；
 * 「1895」多篇互相轉述、創立地點（蘆洲 vs 大稻埕）與世代數（第五代 vs 第二代）互相矛盾。
 * 因此只寫現代與店家自述：現況與傳承、店名由來、大稻埕沒落時期兼賣雜貨；
 * 不寫「1895 年創於迪化街」、不寫世代序號、不寫綠豆糕／牡丹餅是老味、不寫與其他店家的傳承或師承、
 * 不寫與年貨大街的關係、不寫建築的年代與登錄身分。店家只在「老屋新生」開放探索。
 */

export const LI_TING_XIANG_ID = 'li-ting-xiang'

export const LI_TING_XIANG_SOURCE_IDS = [
  'businesstoday-2020-litingxiang',
  'ettoday-2019-litingxiang',
  'mirror-2018-litingxiang',
  'sidoli-litingxiang',
  'walkerland-2021-litingxiang',
]

export const LTX_TODAY_CHAPTER = {
  id: 'today',
  type: 'text',
  tab: '現況與傳承',
  tabEn: 'Today and lineage',
  title: '第一章｜現況與傳承（店家自述）',
  titleEn: 'Chapter 1 | Today and lineage (the shop’s own account)',
  lead: '李亭香是現在迪化街上的一家糕餅店；關於它的歷史，本站查到的都是店家說法與媒體轉述，這裡照實標示。',
  leadEn: 'Li Tingxiang (李亭香) is a pastry shop on Dihua Street today. What this site found about its history is the shop’s own account and media retelling, and it is labelled as such here.',
  paragraphs: [
    '創立年份：ETtoday（2019年）、鏡週刊（2018年）與多篇食記都寫「創立於1895年」，彼此多半互相轉述，沒有一篇附上帳冊、登記或其他文件；《今周刊》2020年的專題寫「126年歷史」，推算約1894年，與1895年差一年，文中也沒有寫確切年份。本站把1895年當成店家自述，標「待核」，不寫成已查證的史實。',
    '創立地點：各來源互相矛盾。《今周刊》與小島裡的專欄寫創店的那一代先在大稻埕的餅店學做餅，回家鄉蘆洲開店；ETtoday 寫「創始的大稻埕店」、鏡週刊寫「大稻埕迪化街」。前者有地點、學藝經過等具體細節，後者只是籠統描述，但兩種說法都沒有文件佐證。本站兩說並列，不寫成創立時就在迪化街。',
    '現在的店在大稻埕迪化街（媒體報導）；門牌本站沒有從可以開啟的來源核對，因此對照地圖上不標這家店。ETtoday 記載，李亭香曾有九家門市，2019年時剩大稻埕店與兩家由堂兄弟在新北經營的店；《今周刊》寫到2020年疫情後再調整門市。',
    '經營者：《今周刊》與 ETtoday 都寫現任經營者李佳陽原是面板工程師（友達光電），返家接班，其父李榮華經營店務。兩篇對他是第幾代的算法不同（相差三代），接班的年份也不一致，所以本站不寫世代序號，也不寫接班年份。ETtoday 另寫到2010年代曾在華山文創園區設糕餅文化館。',
    '為什麼只在「老屋新生」出現：日治時期與戰後初期這家店的店址、產品與營業情況，本站查無任何資料；最具體的說法反而是「創立於蘆洲」，小島裡的專欄還寫1951年才拓點到大稻埕（單一來源、可信度低、待核）。因此街上這家店只在2000年之後的年代開放探索；其他年代同一個位置的店屋是一般的餅舖，是情境示意，不代表李亭香當時在這裡。',
  ],
  paragraphsEn: [
    'Year of founding: ETtoday (2019), Mirror Media (2018) and many food blogs say "founded in 1895". They mostly repeat one another, and none attaches account books, registration or other documents. A 2020 Business Today feature says "126 years of history", which works out to about 1894, a year off from 1895, and it gives no exact year either. This site treats 1895 as the shop’s own account, marks it "to be verified", and does not state it as verified history.',
    'Place of founding: the sources contradict one another. Business Today and a column by Sidoli say the founder’s generation first learned pastry-making at a bakery in Dadaocheng, then went home to Luzhou to open a shop; ETtoday writes of "the original Dadaocheng shop" and Mirror Media of "Dihua Street, Dadaocheng". The former has concrete details such as place and apprenticeship, the latter is only a general description, but neither is backed by documents. This site gives both accounts side by side and does not say that it stood on Dihua Street from the start.',
    'The present shop is on Dihua Street in Dadaocheng (media reports). This site could not check the street number against any source that can be opened, so the shop is not marked on the comparison map. ETtoday records that Li Tingxiang once had nine outlets and by 2019 was down to the Dadaocheng shop and two run by cousins in New Taipei; Business Today mentions that the outlets were adjusted again after the pandemic in 2020.',
    'Management: Business Today and ETtoday both say the present operator, Li Jiayang, was a display-panel engineer (at AUO) who returned home to take over, while his father Li Ronghua runs the shop. The two articles count his generation differently (three generations apart) and also disagree on the year he took over, so this site gives neither a generation number nor a year. ETtoday also mentions that in the 2010s the shop ran a pastry culture hall at the Huashan Creative Park.',
    'Why it appears only in "Old Houses, New Life": for the Japanese period and the early postwar years, this site found no information on the shop’s location, products or trading. The most concrete account, in fact, is that it was founded in Luzhou, and Sidoli’s column adds that it expanded to Dadaocheng only in 1951 (single source, low reliability, to be verified). So this shop is open for exploration only in the eras from 2000 onward; the shophouse at the same spot in other eras is an ordinary pastry shop, a scenario illustration, and does not mean that Li Tingxiang was here at the time.',
  ],
  facts: [
    { label: '創立', labelEn: 'Founded', value: '店家自述1895年（待核；《今周刊》推算約1894年）', valueEn: 'The shop’s own account says 1895 (to be verified; Business Today’s figure works out to about 1894)' },
    { label: '創立地點', labelEn: 'Place of founding', value: '蘆洲（《今周刊》、小島裡）或大稻埕（ETtoday、鏡週刊），來源矛盾、並列', valueEn: 'Luzhou (Business Today, Sidoli) or Dadaocheng (ETtoday, Mirror Media); the sources contradict one another, so both are listed' },
    { label: '現址', labelEn: 'Present address', value: '大稻埕迪化街（門牌未能核對，地圖不標）', valueEn: 'Dihua Street, Dadaocheng (street number not checked, not marked on the map)' },
    { label: '經營者', labelEn: 'Operator', value: '李佳陽（曾任面板工程師，返家接班；世代序號不寫）', valueEn: 'Li Jiayang (formerly a display-panel engineer, returned home to take over; no generation number given)' },
  ],
  sourceIds: ['businesstoday-2020-litingxiang', 'ettoday-2019-litingxiang', 'mirror-2018-litingxiang', 'sidoli-litingxiang', 'walkerland-2021-litingxiang'],
}

export const LTX_NAME_CHAPTER = {
  id: 'name',
  type: 'text',
  tab: '店名與平西餅',
  tabEn: 'Name and Pingxi cakes',
  title: '第二章｜店名由來與招牌餅（店家說法）',
  titleEn: 'Chapter 2 | Origin of the name and the signature cake (the shop’s account)',
  lead: '「亭」是騎樓的亭仔腳：店家說，餅香從騎樓飄出去，店名就這麼來的。',
  leadEn: 'The "ting" is the tingzaijiao, the arcade walkway: the shop says the fragrance of baking drifted out from the arcade, and that is how the name came about.',
  paragraphs: [
    '店名由來：《今周刊》與小島裡的專欄都寫，早年店面的騎樓（臺語「亭仔腳」）常飄出餅香，店名的「亭香」由此而來。兩篇說法一致，但都是轉述店家，本站標為店家說法。',
    '平西餅：《今周刊》、鏡週刊、小島裡與食記都提到平西餅是李亭香的長銷商品；《今周刊》寫它有「27層餅皮」，並把後來的咖哩、香菇、白玉等口味對應到不同世代——口味與世代的對應只有這一篇，標待核。小島裡的專欄另寫內餡白豆沙的原料白鳳豆曾產於三重、蘆洲（單一來源）。',
    'ETtoday 與鏡週刊也提到造型糕餅「平安龜」；食記裡的金錢龜、綠豆糕禮盒等是現在販售的商品，沒有任何來源說它們是早年的產品，本站不把現售商品寫成老味道。',
    '場景中的店屋只用一般的「餅舖」陳設與招牌，不複製店內實際的裝潢、包裝與商標；不列價格與營業時間。',
  ],
  paragraphsEn: [
    'Origin of the name: Business Today and a column by Sidoli both say that the arcade of the early shopfront (called tingzaijiao in Taiwanese) was often filled with the smell of baking, which gave the shop the "ting xiang" ("arcade fragrance") of its name. The two accounts agree, but both retell the shop, so this site labels it the shop’s account.',
    'Pingxi cakes: Business Today, Mirror Media, Sidoli and food blogs all mention Pingxi cakes as a long-selling product of Li Tingxiang. Business Today says it has "27 layers of pastry" and matches later flavours such as curry, shiitake and white jade to different generations; that matching appears only in this one article and is to be verified. Sidoli’s column adds that the white-phoenix beans used for the white bean-paste filling were once grown in Sanchong and Luzhou (single source).',
    'ETtoday and Mirror Media also mention the shaped pastry "Ping’an turtle"; the money-turtle cakes and mung bean cake gift boxes in the food blogs are products on sale today, and no source says they were products of the early days, so this site does not present current products as the old flavours.',
    'The shophouse in the scene uses only the furnishings and sign of an ordinary "pastry shop". It does not copy the shop’s actual interior, packaging or logo, and lists neither prices nor opening hours.',
  ],
  facts: [
    { label: '店名', labelEn: 'Name', value: '騎樓（亭仔腳）飄出餅香（店家說法）', valueEn: 'The fragrance of baking drifting from the arcade (tingzaijiao) (the shop’s account)' },
    { label: '招牌餅', labelEn: 'Signature cake', value: '平西餅（「27層餅皮」僅《今周刊》一篇）', valueEn: 'Pingxi cakes ("27 layers of pastry" appears in only one Business Today article)' },
    { label: '造型餅', labelEn: 'Shaped pastry', value: '平安龜（ETtoday、鏡週刊）', valueEn: 'Ping’an turtle (ETtoday, Mirror Media)' },
  ],
  sourceIds: ['businesstoday-2020-litingxiang', 'sidoli-litingxiang', 'ettoday-2019-litingxiang', 'mirror-2018-litingxiang', 'walkerland-2021-litingxiang'],
}

export const LTX_DECLINE_CHAPTER = {
  id: 'decline',
  type: 'text',
  tab: '兼賣雜貨',
  tabEn: 'Selling groceries on the side',
  title: '第三章｜大稻埕沒落時期兼賣雜貨',
  titleEn: 'Chapter 3 | Selling groceries on the side during Dadaocheng’s decline',
  lead: '餅店不只賣餅：兩篇報導都提到，大稻埕人潮散去的那些年，店裡曾兼賣香菸與雜貨。',
  leadEn: 'A pastry shop did more than sell pastries: two reports mention that in the years when the crowds left Dadaocheng, the shop also sold cigarettes and groceries.',
  paragraphs: [
    '《今周刊》寫，約40年前大稻埕沒落，家中一度兼賣香菸、罐頭等雜貨；ETtoday 也寫平西餅之外曾賣杏仁霜、白脫糖到香菸。兩篇互相印證「兼賣雜貨」這件事，但年代只有「約40年前」（以2020年的報導推算約1980年代，待核），沒有確切年份。',
    '這段經歷說明了舊市街的商業起落怎麼落到一家店上：批發與人潮離開迪化街後，老店靠多樣的商品撐過去，再在近二十年的老屋新生裡回到以糕餅為主。本站只寫到這裡；沒落的起訖年份、當時的店址與營業額，各來源都沒有寫。',
  ],
  paragraphsEn: [
    'Business Today writes that about 40 years ago, when Dadaocheng declined, the family for a time also sold groceries such as cigarettes and canned food; ETtoday likewise says that besides Pingxi cakes the shop sold everything from almond powder and butter candy to cigarettes. The two articles corroborate each other on the sideline in groceries, but the date is only "about 40 years ago" (about the 1980s, counting back from a 2020 article, to be verified), with no exact year.',
    'This episode shows how the rise and fall of the old commercial district landed on a single shop: once wholesale trade and crowds left Dihua Street, the old shop got through on a variety of goods, and in the revival of old houses over the past twenty years it returned to being mainly a pastry shop. This site goes no further than that; none of the sources gives the start and end years of the decline, the shop’s address at the time, or its turnover.',
  ],
  facts: [
    { label: '時期', labelEn: 'Period', value: '「約40年前」（約1980年代，待核）', valueEn: '"About 40 years ago" (about the 1980s, to be verified)' },
    { label: '兼賣', labelEn: 'Also sold', value: '香菸、罐頭、杏仁霜、白脫糖等（兩篇報導）', valueEn: 'Cigarettes, canned food, almond powder, butter candy and so on (two reports)' },
  ],
  sourceIds: ['businesstoday-2020-litingxiang', 'ettoday-2019-litingxiang'],
}

export const LTX_SOURCES_CHAPTER = {
  id: 'sources',
  type: 'sources',
  tab: '參考文獻',
  tabEn: 'References',
  title: '第四章｜參考文獻',
  titleEn: 'Chapter 4 | References',
  intro: '李亭香的介紹整理自下列媒體報導與部落格，點選即可開啟原始網頁。沒有官方或學術來源。',
  introEn: 'The introduction to Li Tingxiang is compiled from the media reports and blogs below; select one to open the original page. There are no official or scholarly sources.',
  sourceIds: LI_TING_XIANG_SOURCE_IDS,
  disclaimer:
    '本站查到的全是商業媒體與部落格，多篇「1895年」互相轉述、沒有文件佐證；創立地點（蘆洲或大稻埕）與世代數在來源之間互相矛盾，本站並列、不寫世代序號。建築的年代、營造者與登錄身分查無，不寫。街上這棟店屋是情境示意，不是依實地照片建模；其他年代同一個位置的餅舖不代表李亭香當時在此。本站不列價格與營業時間，也不寫這家店與其他店家的傳承關係。',
  disclaimerEn:
    'Everything this site found is commercial media and blogs; the many "1895" claims repeat one another and no document supports them. The place of founding (Luzhou or Dadaocheng) and the number of generations contradict one another across the sources, so this site lists them side by side and gives no generation number. The date, builder and registered status of the building could not be found and are not stated. The shophouse on the street is a scenario illustration, not modelled from on-site photographs; the pastry shop at the same spot in other eras does not mean Li Tingxiang was here at the time. This site lists no prices or opening hours, and does not describe any lineage between this shop and other shops.',
}

export const LTX_CHAPTERS = [LTX_TODAY_CHAPTER, LTX_NAME_CHAPTER, LTX_DECLINE_CHAPTER, LTX_SOURCES_CHAPTER]

export const LTX_ERA_NOTES = {
  revival:
    '李亭香只在「老屋新生」開放探索：現在迪化街上的糕餅店，1895年創立是店家自述（待核）。其他年代同一個位置的店屋是一般的餅舖（情境示意），因為日治與戰後的店址查無，最具體的說法是早年在蘆洲。',
  revivalEn:
    'Li Tingxiang is open for exploration only in "Old Houses, New Life": it is the pastry shop on Dihua Street today, and its founding in 1895 is the shop’s own account (to be verified). The shophouse at the same spot in other eras is an ordinary pastry shop (a scenario illustration), because its Japanese-period and postwar addresses could not be found and the most concrete account is that it started in Luzhou.',
}

export const LTX_YEAR_NOTE =
  '1895年創立是店家自述：媒體與食記多篇相同但互相轉述，沒有文件佐證；《今周刊》2020年寫「126年歷史」（約1894年）。創立地點（蘆洲或大稻埕）來源矛盾。日治與戰後的店況查無，因此只在老屋新生開放探索。'

export const LTX_YEAR_NOTE_EN =
  'Founding in 1895 is the shop’s own account: several media reports and food blogs say the same, but they repeat one another and no document supports it; Business Today (2020) writes "126 years of history" (about 1894). The place of founding (Luzhou or Dadaocheng) is contradicted by the sources. The shop’s situation in the Japanese period and after the war could not be found, so it is open for exploration only in Old Houses, New Life.'
