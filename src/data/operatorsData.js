/**
 * 「在地經營者群像」小節（第 8 階段 C）：庶民生活（1945–1980）與老屋新生（2000–現在）沒有單一人物可寫
 * （黃玉階的活動不在庶民生活年代，見 docs/research/huang-yu-jie.md；使用者同意改做群像），
 * 所以各加一章純文字，把街上各家店章節裡**已有出處**的經營者行動收在一起：誰接手、誰搬廠、誰開第二家店、誰捐出老屋。
 *
 * 作法同人物小節（方案 1）：不新增 3D 人物、店家、建築、地段或碰撞；只用 sources.js 既有的出處；年表與地圖不加。
 * 敘事視角是「這條街上，是誰在把飲食留下來」——只寫文獻記下的行動、傳承與轉變，不評價、不推論動機；
 * 現代店家不寫成歷史人物；沒有經營者姓名出處的不點名；各店既有章節標待核的，這裡同樣標待核。
 *
 * 掛載：
 * - 庶民生活 → 林復振（lin-fu-zhen）的 postwar 年代版本（用 eras.postwar.chapters 覆蓋，其他年代不變）。
 *   理由：林復振是五個年代都在街上的南北貨商號，〈林復振商行〉記家族商號交由子侄輩、侄孫輩延續至今，
 *   正是「把店留下來」的題目；而且它沒有被章節數測試鎖死，不用改動其他店家的測試。
 * - 老屋新生 → 永樂市場（yong-le-market），放在「背景：年前買南北貨」之後、戲苑三章之前。
 *   理由：永樂市場的故事已經承擔年貨大街、大稻埕戲苑這類跨店家、跨街區的章節；市場本身是公有市場，沒有單一經營者。
 *
 * 不點名（研究紀錄已判定不寫）：廟口具名老店（許仔、葉家、阿桂姨、江家、黃記、賴記、媽祖宮口）、李亭香與滋養的傳承、
 * 林合發、意麵王、呷二嘴的創辦人與世代、永樂米苔目與老潘、好粿緣的店史、爐鍋咖啡的經營者、黃玉階文史館的營運單位。
 * 素材盤點見 docs/research/operators-group-portrait.md。
 */

export const OPERATORS_POSTWAR_HOST_SHOP_ID = 'lin-fu-zhen'
export const OPERATORS_POSTWAR_ERA_ID = 'postwar'
export const OPERATORS_REVIVAL_HOST_SHOP_ID = 'yong-le-market'
export const OPERATORS_REVIVAL_ERA_ID = 'revival'

/** 庶民生活群像引用的出處（全部沿用既有條目） */
export const OPERATORS_POSTWAR_SOURCE_IDS = [
  'ith-lin-fu-zhen',
  'wangtea-story',
  'wangtea-transformation',
  'tcmb-wangtea',
  'tcmb-xinfangchun',
  'epochtimes-xinfangchun-2022',
  'linhuatai-site',
  'ltn-linhuatai-2014',
  'gvm-2011-bolero',
  'sinica-newsletter-1584-shanshuiting',
  'ntmofa-lin-zhenjing-2013-wang-jingquan',
  'mirrormedia-2024-shizixuan',
  'sinica-gis-2025-cisheng',
  'tcma-cisheng-four-herb',
  'ettoday-2018-cisheng',
  'moc-329-shophouse',
  'businesstoday-2020-litingxiang',
]

export const OPERATORS_POSTWAR_CHAPTER = {
  id: 'operators-postwar',
  type: 'text',
  tab: '群像：在地經營者', tabEn: 'Portrait: Local Operators',
  title: '群像：1945–1980，這條街上是誰在把飲食留下來', titleEn: 'Portrait: 1945–1980, Who Kept the Street’s Food Alive',
  lead: '這個年代本站沒有單一人物可寫，改把街上各家店章節裡已經有出處的經營者行動收在一起：誰接手、誰搬廠、誰開了第二家店、誰的攤子從街口搬進廟口。只寫文獻記下的事，不評價，也不替他們解釋為什麼。', leadEn: 'For this era the site has no single figure to write about. Instead it gathers, from the shop chapters already supported by sources, the actions of the people who ran the street’s businesses: who took over, who moved a factory, who opened a second shop, whose stall moved from the street corner into the temple forecourt. It records only what the documents record, without judgement and without explaining why they did it.',
  paragraphs: [
    '為什麼放在林復振｜林復振是五個年代都在這條街上的南北貨商號；中研院臺史所檔案館的〈林復振商行〉記載，日治時期家族商號交由子侄輩打理，部分子孫轉業或遷居，僅存侄孫輩經營的「林復振商行」延續至今；但1945到1980年間這家店本身由誰經營、店況如何，本站引用的文獻沒有記載。所以本站只借它的位置，把同一條街上其他店家有出處的紀錄放在一起。各家店之間有沒有師承或合作，文獻沒有寫，本站不把他們寫成一個群體的行動。',
    '茶行：第三代與搬廠｜有記名茶的官網沿革與國家文化記憶庫記載，第三代王澄清十七歲就來臺，負責精製廠與外銷；因為泰國的外銷業務激增，1949年把廠遷到重慶北路二段64巷26號，當時是臺北市登記的第五家工廠；1975年在濟南路設第一家內銷門市，首創烏龍茶配漢餅的禮盒；1980年代以後外銷萎縮，轉為內銷與自創品牌（有記官網、國家文化記憶庫）。新芳春茶行方面，國家文化記憶庫記載王連河在1950年把公司改組為「新芳春茶行兩合公司」，1974年第三代王國忠接手，仍外銷東南亞，1970年代末起業務萎縮；大紀元則寫1960年代後逐漸收起事業、部分空間出租——停歇的時間各來源不一，本站並列、標待核。林華泰茶行的官網〈林華泰的歷史〉（第四代林秀全的回憶，家族口述，沒有其他文獻可以核對）寫第三代林大村在兄弟分家時接下以批發為主的林華泰，分家的年份文獻未載；官網另記林大村在1977年獲臺北市政府頒贈「孝行楷模紀念」匾額。',
    '餐廳與餅舖｜波麗路的廖水來戰後一直在民生西路原址營業，1976年在隔壁開了第二店（《遠見雜誌》2011年）；維基百科寫的1947年改建與兄弟分家只有一個來源，本站不採用。山水亭的王井泉在1953年因房租上漲把店遷到民生西路一帶、規模縮小，1955年歇業（曾品滄、林振莖；他的事見「摩登大稻埕」波麗路故事裡的「人物：王井泉」）。十字軒方面，《鏡週刊》2024年的報導記載戰後店面擴大為兩個店面寬，因鄰近霞海城隍廟做起壽桃生意，全盛時期一天可賣超過一萬顆，漢餅、西點、包子分開設廠、師傅將近二十位（單一來源）；同一篇寫創辦人邱炳星之後由第二代邱獻德、第三代邱易為接手，但各代接手的年份文獻未載，本站不把哪一代放進這個年代。',
    '不具名的攤販｜慈聖宮廟口的小吃攤，中研院 GIS 專題只寫「民國50年間，因香火鼎盛，周邊攤販聚集成市集」，沒有附出處，本站標待核。臺北市市場處介紹廟口一攤四神湯時寫，攤家早年在迪化街口擺攤、後來才遷到廟口——這是「攤販從街頭搬進廟口」的一個例子，只見於這一份官方稿、年數前後不一，本站標待核，也不點名。媒體寫有些攤位已經傳了幾代（ETtoday，未指明哪一攤）；各攤的店名、攤主、年份與傳承代數在不同的食記裡互相矛盾，本站一律不寫。',
    '查無而不寫｜林復振在這段時間的經營者，文獻未載。迪化街一段329號的店屋，文化部的資料只記1907年建、日治時期是唐家的米行，戰後到2014年之間的使用紀錄查無，場景裡那段「住家與倉庫」是情境示意。場景裡廟口的魷魚羹、米苔目、豆花、糕粿四攤是本站做的飲食文化情境示意，不對應任何店家。李亭香「大稻埕沒落時期兼賣雜貨」的說法只有「約40年前」（《今周刊》2020年），年代落在這個年代的末尾或之後、待核，所以只寫在老屋新生的章節，這裡不重複。這些空白本站照實留著，不用想像補。',
  ],
  paragraphsEn: [
    'Why Lin Fuzhen｜Lin Fuzhen is a dried-goods hong present on this street in all five eras. The entry “Lin Fuzhen Firm” in the archive of the Institute of Taiwan History, Academia Sinica, records that in the Japanese period the family firm was left in the care of the next generation of sons and nephews; some descendants changed careers or moved away, and only the “Lin Fuzhen Firm” run by a grand-nephew continues today. But the documents this site draws on do not say who ran the shop, or how it fared, between 1945 and 1980. So the site borrows only its location, to bring together the sourced records of other shops on the same street. Whether these shops had teacher-apprentice ties or cooperated, the documents do not say, and the site does not write them up as the action of one group.',
    'Tea hongs: the third generation and a move of the factory｜The official website history of Youji Tea and the National Cultural Memory Bank record that Wang Chengqing, of the third generation, came to Taiwan at seventeen and took charge of the refining factory and exports; as exports to Thailand surged, in 1949 the factory moved to No. 26, Lane 64, Section 2, Chongqing North Road, then the fifth factory registered in Taipei City. In 1975 he opened the first domestic retail outlet on Jinan Road, pioneering a gift box pairing oolong tea with Han-style pastries; from the 1980s exports shrank and the business turned to domestic sales and its own brand (Youji website, National Cultural Memory Bank). As for Xinfangchun Tea Hong, the National Cultural Memory Bank records that in 1950 Wang Lianhe reorganised the company as the “Xinfangchun Tea Hong Limited Partnership”; in 1974 the third generation, Wang Guozhong, took over, still exporting to Southeast Asia, and business shrank from the late 1970s. The Epoch Times, however, writes that the business was gradually wound down after the 1960s with part of the space let out; the sources differ on when it fell idle, so the site gives both and marks it as to be verified. The Lin Huatai Tea Hong website, in “The History of Lin Huatai” (recollections of the fourth generation, Lin Xiuquan; family oral history with no other document to check against), says that when the brothers divided the family property, the third generation, Lin Dacun, took over Lin Huatai, which was mainly wholesale; the year of the division is not recorded. The website also notes that in 1977 Lin Dacun received a “Model of Filial Conduct” commemorative plaque from the Taipei City Government.',
    'Restaurants and a pastry shop｜After the war Liao Shuilai of Bolero kept trading on its original site on Minsheng West Road, and in 1976 opened a second shop next door (Global Views Monthly, 2011); Wikipedia’s account of a 1947 rebuilding and a split among brothers has only one source and is not used here. Wang Jingquan of Shanshuiting moved the restaurant in 1953, when the rent rose, to the Minsheng West Road area on a smaller scale, and closed it in 1955 (Zeng Pincang; Lin Zhenjing; his story is in the chapter “Portrait: Wang Jingquan” within the Bolero story of Modern Dadaocheng). At Shizixuan, the 2024 report in Mirror Media records that after the war the shop grew to two shopfronts wide and, being near the Xiahai City God Temple, took up the longevity-peach bun trade, selling more than ten thousand a day at its peak, with Han pastries, Western cakes and steamed buns made in separate workshops by nearly twenty chefs (single source). The same article says that after the founder Qiu Bingxing, the second generation Qiu Xiande and the third generation Qiu Yiwei took over, but the years of each succession are not recorded, so the site does not place any generation in this era.',
    'Unnamed stallholders｜For the snack stalls at the forecourt of Cisheng Temple, the Academia Sinica GIS feature says only that “around ROC year 50 (c. 1961), because incense was flourishing, surrounding vendors gathered into a market”, with no source cited; the site marks it as to be verified. In introducing a four-herb soup stall at the temple forecourt, the Taipei City Market Administration says the stallholders used to set up at the mouth of Dihua Street before moving to the forecourt – one example of vendors moving from the street into the temple forecourt, found only in this one official text, with the number of years inconsistent, so the site marks it as to be verified and names no one. The media say some stalls have been passed down several generations (ETtoday, without saying which stall); shop names, stallholders, years and numbers of generations contradict one another across food blogs, so the site writes none of them.',
    'Not written because not found｜Who ran Lin Fuzhen during this period is not recorded. For the shophouse at No. 329, Section 1, Dihua Street, Ministry of Culture data record only that it was built in 1907 and in the Japanese period was a rice shop of the Tang family; no records of its use between the postwar years and 2014 can be found, and the “residence and storeroom” in the scene is an illustrative scenario. The four temple-front stalls in the scene (squid soup, mi-tai-mu, douhua and kueh) are illustrative scenes of food culture made by this site and correspond to no actual shop. The claim that Li Tingxiang “sold groceries on the side during Dadaocheng’s decline” rests only on “about 40 years ago” (Business Today, 2020), which falls at the end of this era or after it and is to be verified, so it is written only in the Old Houses, New Life chapter and not repeated here. The site leaves these gaps as they are and does not fill them with imagination.',
  ],
  timeline: [
    { place: '1949', text: '有記名茶遷廠到重慶北路二段64巷26號（官網沿革、國家文化記憶庫）。', textEn: 'Youji Tea moves its factory to No. 26, Lane 64, Section 2, Chongqing North Road (website history; National Cultural Memory Bank).' },
    { place: '1950', text: '新芳春茶行改組為兩合公司（國家文化記憶庫）。', textEn: 'Xinfangchun Tea Hong is reorganised as a limited partnership (National Cultural Memory Bank).' },
    { place: '1953／1955', text: '山水亭遷到民生西路一帶、規模縮小，1955年歇業（曾品滄、林振莖）。', textEn: 'Shanshuiting moves to the Minsheng West Road area on a smaller scale, and closes in 1955 (Zeng Pincang; Lin Zhenjing).' },
    { place: '民國50年間', placeEn: 'ROC year 50 (c. 1961)', text: '慈聖宮廟口攤販聚集成市集（中研院 GIS 專題，未附出處，待核）。', textEn: 'The stalls at the forecourt of Cisheng Temple gather into a market (Academia Sinica GIS feature, no source cited; to be verified).' },
    { place: '1974', text: '新芳春第三代王國忠接手（國家文化記憶庫）。', textEn: 'Wang Guozhong, third generation of Xinfangchun, takes over (National Cultural Memory Bank).' },
    { place: '1975', text: '有記在濟南路設第一家內銷門市（官網沿革）。', textEn: 'Youji opens its first domestic retail outlet on Jinan Road (website history).' },
    { place: '1976', text: '波麗路在隔壁開第二店（《遠見雜誌》2011年）。', textEn: 'Bolero opens a second shop next door (Global Views Monthly, 2011).' },
    { place: '1977', text: '林華泰第三代林大村獲孝行楷模匾額（官網，家族口述）。', textEn: 'Lin Dacun, third generation of Lin Huatai, receives a Model of Filial Conduct plaque (website; family oral history).' },
  ],
  facts: [
    { label: '有姓名出處的經營者', labelEn: 'Operators named in sources', value: '王澄清（有記）、王連河與王國忠（新芳春）、林大村（林華泰）、廖水來（波麗路）、王井泉（山水亭）', valueEn: 'Wang Chengqing (Youji), Wang Lianhe and Wang Guozhong (Xinfangchun), Lin Dacun (Lin Huatai), Liao Shuilai (Bolero), Wang Jingquan (Shanshuiting)' },
    { label: '只寫行動、不點名', labelEn: 'Actions only, no names', value: '慈聖宮廟口各攤（店名、攤主、年份、代數一律不寫）', valueEn: 'The stalls at the forecourt of Cisheng Temple (shop names, stallholders, years and numbers of generations are all left unwritten)' },
    { label: '待核', labelEn: 'To be verified', value: '廟口「民國50年間」聚集；四神湯攤從迪化街口遷入；新芳春停歇的時間；林華泰分家的年份；十字軒各代接手的年份', valueEn: 'The “ROC year 50” gathering at the temple forecourt; the four-herb soup stall’s move from the mouth of Dihua Street; when Xinfangchun fell idle; the year of the Lin Huatai division; the years of each Shizixuan succession' },
    { label: '不寫', labelEn: 'Not written', value: '各店之間的師承或合作；經營者的動機；林復振、329號店屋與李亭香在這段時間的店況（查無）', valueEn: 'Teacher-apprentice ties or cooperation between shops; operators’ motives; the state of Lin Fuzhen, the No. 329 shophouse and Li Tingxiang during this period (nothing found)' },
  ],
  sourceIds: OPERATORS_POSTWAR_SOURCE_IDS,
}

/** 接在林復振（庶民生活版）文獻章免責文字後面 */
export const OPERATORS_POSTWAR_DISCLAIMER_TEXT =
  '「群像：在地經營者」一節只收各店章節裡已有出處的行動與年份，不評價、不推論動機，也不把各店寫成同一個群體；林復振本身在1945–1980年間的經營者文獻未載。廟口攤販的聚集年代、四神湯攤的遷入、新芳春停歇的時間、林華泰分家與十字軒各代接手的年份都標待核；廟口具名老店、攤主與代數一律不寫。'
export const OPERATORS_POSTWAR_DISCLAIMER_TEXT_EN =
  'The “Portrait: Local Operators” section includes only actions and years already sourced in the shop chapters. It does not judge, infer motives, or write the shops up as a single group; who ran Lin Fuzhen itself between 1945 and 1980 is not documented. The years the temple-forecourt stalls gathered, the four-herb soup stall’s move in, when Xinfangchun fell idle, the Lin Huatai division and each Shizixuan succession are all marked to be verified; named old shops at the temple forecourt, stallholders and numbers of generations are never written.'

/** 老屋新生群像引用的出處（全部沿用既有條目） */
export const OPERATORS_REVIVAL_SOURCE_IDS = [
  'ryori-taiwan-ziyang',
  'ziyang-about',
  'mirrormedia-2024-shizixuan',
  'businesstoday-2020-litingxiang',
  'ettoday-2019-litingxiang',
  'wangtea-transformation',
  'tcmb-wangtea',
  'ntcri-80-wangtea-lab',
  'ltn-linhuatai-2014',
  'foodnext-2020-bolero',
  'mirror-2025-bolero',
  'pts-xinfangchun-2016',
  'zsdo-xinfangchun-2020',
  'tcmb-xinfangchun',
  'moc-329-shophouse',
  'taiwannews-2022-rice-shine',
  'traveler-2019-rice-shine',
  'gvm-2013-artyard',
  'artyard-about',
  'ntpu-2014-dadaocheng',
  'udn-500-action-bar',
  'gcis-action-bar',
  'tcooc-action-bar',
  'taipei-gov-2025-nianhuo',
  'udn-time-2023-nianhuo',
  'merit-2026-huang-yujie',
  'ith-lin-fu-zhen',
  'bella-2025-dadaocheng',
  'ettoday-2018-cisheng',
]

export const OPERATORS_REVIVAL_CHAPTER = {
  id: 'operators-revival',
  type: 'text',
  tab: '群像：在地經營者', tabEn: 'Portrait: Local Operators',
  title: '群像：2000年以後，這條街上是誰在把飲食留下來', titleEn: 'Portrait: After 2000, Who Kept the Street’s Food Alive',
  lead: '老屋新生這個年代也沒有單一人物可寫，本站把街上各家店章節裡已經有出處的經營者行動收在一起：誰返家接班、誰分家、誰把老屋捐給市府、誰承租老屋開店。只寫報導與官方資料記下的事，不評價；現在還在營業的店家，本站不把他們寫成歷史人物。', leadEn: 'The Old Houses, New Life era likewise has no single figure to write about, so the site gathers, from the shop chapters already supported by sources, the actions of the people who ran the street’s businesses: who came home to take over, who split the family business, who donated an old house to the city government, who leased an old house to open a shop. It records only what reports and official data record, without judgement; shops still trading are not written up as historical figures.',
  paragraphs: [
    '為什麼放在永樂市場｜永樂市場的故事已經承擔了年貨大街、大稻埕戲苑這類跨店家、跨街區的章節，所以本站把群像也放在這裡；市場本身是公有市場，沒有單一的經營者可寫。下面各家店只寫各自的紀錄：彼此之間有沒有師承、合作或傳承，本站沒有查到，也不把這些人寫成同一個運動。',
    '返家接班｜滋養豆餡舖：《料理．台灣》2021年的專訪記載，原址面臨都市更新，第三代林濬彤決定接手，承租迪化街一段247號的轉角店面，把店從南京西路一帶遷進大稻埕；遷入的年份專訪沒有寫、文獻未載。十字軒：《鏡週刊》2024年的報導記載第二代邱獻德、第三代邱易為接手經營（單一來源）。李亭香：《今周刊》2020年與 ETtoday 2019年都寫現任經營者李佳陽原是面板工程師，返家接班，其父李榮華經營店務（店家自述）；兩篇對他是第幾代、哪一年接班的說法不一致，本站不寫世代序號與接班年份。ETtoday 另記李亭香曾有九家門市，2019年時剩大稻埕店與兩家由堂兄弟在新北經營的店。',
    '茶行的第四、五代與分家｜有記名茶的官網沿革記載，第四代王連源在2004年把廠房前半部整理為門市、二樓改為藝文空間「清源堂」，2008年起每週六下午有南管演奏（國家文化記憶庫同記2004年整修廠房並保留整套精製系統）；第五代王聖鈞2012年接班，2020年底在隔壁的老屋開了 WANGTEA LAB（《臺灣工藝》第80期）。林華泰茶行：自由時報2014年報導，2011年家族分家，第四代林茂森在原店隔壁另開林茂森茶行，林華泰由林秀全、林茂祥等人經營（分家的經過見林華泰茶行的故事）。波麗路：餐廳仍由廖家家族經營，招牌菜還在菜單上（食力、鏡週刊；建物的登錄見波麗路的故事）。',
    '把老屋交出去，或租回來｜新芳春茶行：2011到2015年修復，第三代王國忠把洋樓捐給臺北市政府（公視新聞2016年；中山區公所頁寫「原屋主捐贈」），文化局2016年9月20日對外開放，2018年起委由台灣文創發展基金會經營（中山區公所）。迪化街一段329號：唐家後代在2014年把老屋捐給臺北市政府，2020年登錄為歷史建築（文化部資料）；葉守倫——1923年創立的葉晉發米行的後代（《旅人誌》2019年）——接手維護經營，改為米食文化餐館，2022年6月8日以「稻舍」加入臺北市的老房子文化運動（中央社稿）。唐家的米行與葉守倫的家族商號不同，本站分開寫。小藝埕：《遠見雜誌》2013年報導，2010年屈臣氏大藥房的屋主點頭出租，周奕成（報導稱「世代文化創業群負責人」）以「大稻埕上賣小藝」創立小藝埕；大藝埕官網自述2011年起經營藝埕系列街屋。二樓的爐鍋咖啡，最早明確記載在那裡的是2014年臺北大學的報告，進駐年份與經營者姓名本站不寫。',
    '新店與集體的活動｜導演的豆花店：紀錄片導演何明瑞2019年7月開著「導演的豆花車」到偏鄉做兒童影像教育（《500輯》2024年）；2021年3月12日「導演的豆花店」在迪化街一段224巷24號核准設立（經濟部商工登記），店名後來改為「導演的豆花店 Action! Bar」（臺北市商業處）。年貨大街：1996年起由市府與商家合辦，構想由民間的「迪化街工作室」提出（依報時光重現的1995年報導；官方稿寫「市府首創」，兩說並列、原報紙未查閱、待核）——這是集體的活動，本站不把任何一家店寫成創辦者。黃玉階文史館：224巷裡的「元珍豆醬店」老屋現在是文史館（《人間福報》2026年），營運單位本站未核實，不點名。',
    '不點名與查無｜永樂米苔目：媒體整理寫「民國五十六年創立、傳承三代」（Bella儂儂2025年），本站找不到店家或文史資料核實，創立年留空，也不寫哪一代。老潘魷魚羹、好粿緣：店史與創辦人查無，不寫。慈聖宮廟口：媒體寫有些攤位傳了幾代（ETtoday，未指明哪一攤），具名老店一律不寫。林復振：〈林復振商行〉記今日的商行由林欽典一脈傳承、1980年代跨足喜餅禮盒並以祖輩店號「林振源」成立子公司，但沒有現任經營者的姓名，本站不點名。',
  ],
  paragraphsEn: [
    'Why Yongle Market｜The Yongle Market story already carries chapters that cross shops and neighbourhoods, such as the Lunar New Year goods street and the Dadaocheng theatre, so the site places the portrait here too; the market itself is a public market with no single operator to write about. Below, each shop is given only its own record: whether there were teacher-apprentice ties, cooperation or succession between them, the site has not found, and it does not write these people up as one movement.',
    'Coming home to take over｜Ziyang Bean-Paste Shop: a 2021 interview in Ryori Taiwan records that the original site faced urban renewal, and the third generation, Lin Juntong, decided to take over, leasing the corner shopfront at No. 247, Section 1, Dihua Street and moving the shop from the Nanjing West Road area into Dadaocheng; the interview does not give the year of the move, and the documents do not record it. Shizixuan: a 2024 Mirror Media report records that the second generation Qiu Xiande and the third generation Qiu Yiwei took over (single source). Li Tingxiang: Business Today (2020) and ETtoday (2019) both write that the current operator Li Jiayang was originally a panel engineer who came home to take over, with his father Li Ronghua running the shop (the shop’s own account); the two articles disagree on which generation he is and in which year he took over, so the site writes neither a generation number nor a year. ETtoday also records that Li Tingxiang once had nine outlets, and that by 2019 it was left with the Dadaocheng shop and two run by cousins in New Taipei.',
    'The tea hongs’ fourth and fifth generations, and a division｜The Youji Tea website history records that the fourth generation, Wang Lianyuan, in 2004 converted the front of the factory into a shop and the second floor into an arts space, “Qingyuan Hall”, and from 2008 has held Nanguan music performances every Saturday afternoon (the National Cultural Memory Bank likewise records that the factory was renovated in 2004 with its whole refining system retained); the fifth generation, Wang Shengjun, took over in 2012 and at the end of 2020 opened WANGTEA LAB in the old house next door (Taiwan Crafts, issue 80). Lin Huatai Tea Hong: Liberty Times reported in 2014 that the family divided in 2011, the fourth generation Lin Maosen opening Lin Maosen Tea Hong next door to the original shop, while Lin Huatai is run by Lin Xiuquan, Lin Maoxiang and others (for the division see the Lin Huatai Tea Hong story). Bolero: the restaurant is still run by the Liao family, and its signature dishes remain on the menu (Foodnext, Mirror Media; for the building’s registration see the Bolero story).',
    'Handing the old house over, or renting it back｜Xinfangchun Tea Hong: restored from 2011 to 2015, with the third generation, Wang Guozhong, donating the Western-style building to the Taipei City Government (PTS News, 2016; the Zhongshan District Office page says “donated by the original owner”); the Department of Cultural Affairs opened it to the public on 20 September 2016, and from 2018 it has been entrusted to the Taiwan Cultural Creative Development Foundation (Zhongshan District Office). No. 329, Section 1, Dihua Street: descendants of the Tang family donated the old house to the Taipei City Government in 2014 and it was registered as a historic building in 2020 (Ministry of Culture data); Ye Shoulun – a descendant of the Ye Jinfa rice shop founded in 1923 (Traveler, 2019) – took over its upkeep and operation, converted it into a rice-food restaurant, and on 8 June 2022 joined Taipei’s old-house culture movement as “Rice & Shine” (Central News Agency). The Tang family’s rice shop and Ye Shoulun’s family firm are different, and the site writes them separately. Little Artyard: Global Views Monthly reported in 2013 that in 2010 the owner of the Watson’s Pharmacy building agreed to lease it, and Zhou Yicheng (the report calls him head of the Generation Culture Entrepreneurship Group) founded Little Artyard under the banner of “selling small art in Dadaocheng”; the Artyard website says it has run its series of Artyard shophouses since 2011. The Luguo Cafe upstairs is first clearly recorded there in a 2014 National Taipei University report; the year it moved in and the operator’s name the site does not write.',
    'New shops and collective events｜Action! Bar: the documentary director He Mingrui in July 2019 drove the “Director’s Douhua Truck” to remote areas for children’s film education (500 Anthology, 2024); on 12 March 2021 “Director’s Douhua Shop” was registered at No. 24, Lane 224, Section 1, Dihua Street (Ministry of Economic Affairs commercial registration), and the name was later changed to “Director’s Douhua Shop Action! Bar” (Taipei City Department of Commerce). The Lunar New Year goods street: run jointly by the city government and merchants since 1996, with the idea put forward by the private “Dihua Street Studio” (according to a 1995 report reproduced in Time Revisited; the official text says “a first by the city government”; the two accounts are given side by side, the original newspaper has not been consulted, and the point is to be verified) – this is a collective event, and the site does not write any one shop up as its founder. Huang Yujie Museum of Culture and History: the old house of the Yuanzhen Bean-Paste Shop in Lane 224 is now the museum (Merit Times, 2026); the site has not verified its operating body and does not name it.',
    'Not named, and not found｜Yongle Mi-tai-mu: media summaries write “founded in ROC year 56 (1967), passed down three generations” (Bella, 2025); the site could not verify this from the shop or from local-history material, leaves the founding year blank, and does not say which generation. Lao Pan Squid Soup and Haoguoyuan (Hao Guo Yuan): shop history and founders not found, not written. Cisheng Temple forecourt: media write that some stalls have been passed down several generations (ETtoday, without saying which stall); named old shops are never written. Lin Fuzhen: the entry “Lin Fuzhen Firm” records that today’s firm is carried on by the line of Lin Qindian, and that in the 1980s it moved into wedding-cake gift boxes and set up a subsidiary under the ancestral shop name “Lin Zhenyuan”, but it gives no name for a current operator, and the site names none.',
  ],
  timeline: [
    { place: '2004', text: '有記第四代王連源整理門市、二樓改清源堂（官網沿革）。', textEn: 'Wang Lianyuan, fourth generation of Youji, converts the shop front and turns the second floor into Qingyuan Hall (website history).' },
    { place: '2010／2011', text: '屈臣氏大藥房屋主答應出租，周奕成創立小藝埕、2011年開幕（《遠見雜誌》2013年、大藝埕官網）。', textEn: 'The owner of the Watson’s Pharmacy building agrees to lease it; Zhou Yicheng founds Little Artyard, which opens in 2011 (Global Views Monthly, 2013; Artyard website).' },
    { place: '2011', text: '林華泰家族分家，林茂森在隔壁另開茶行（自由時報2014年）。', textEn: 'The Lin Huatai family divides; Lin Maosen opens another tea hong next door (Liberty Times, 2014).' },
    { place: '2012', text: '有記第五代王聖鈞接班（官網沿革）。', textEn: 'Wang Shengjun, fifth generation of Youji, takes over (website history).' },
    { place: '2014', text: '唐家後代把迪化街一段329號老屋捐給臺北市政府（中央社稿）。', textEn: 'Descendants of the Tang family donate the old house at No. 329, Section 1, Dihua Street to the Taipei City Government (Central News Agency).' },
    { place: '2015／2016', text: '新芳春修復完成、王國忠捐贈市府；2016年9月20日開放（公視、中山區公所）。', textEn: 'The restoration of Xinfangchun is completed and Wang Guozhong donates it to the city government; it opens on 20 September 2016 (PTS; Zhongshan District Office).' },
    { place: '2019', text: '何明瑞的導演的豆花車登場（《500輯》）。', textEn: 'He Mingrui’s Director’s Douhua Truck begins its rounds (500 Anthology).' },
    { place: '2020', text: '329號登錄歷史建築（文化部）；WANGTEA LAB 開幕（《臺灣工藝》）。', textEn: 'No. 329 is registered as a historic building (Ministry of Culture); WANGTEA LAB opens (Taiwan Crafts).' },
    { place: '2021', text: '導演的豆花店核准設立（商工登記）。', textEn: 'Director’s Douhua Shop is registered (commercial registration).' },
    { place: '2022', text: '稻舍加入老房子文化運動（中央社稿）。', textEn: 'Rice & Shine joins the old-house culture movement (Central News Agency).' },
  ],
  facts: [
    { label: '有姓名出處的經營者', labelEn: 'Operators named in sources', value: '林濬彤（滋養）、邱獻德與邱易為（十字軒）、李佳陽與李榮華（李亭香）、王連源與王聖鈞（有記）、林茂森、林秀全、林茂祥（林華泰）、王國忠（新芳春）、葉守倫（稻舍）、周奕成（小藝埕）、何明瑞（導演的豆花店）', valueEn: 'Lin Juntong (Ziyang), Qiu Xiande and Qiu Yiwei (Shizixuan), Li Jiayang and Li Ronghua (Li Tingxiang), Wang Lianyuan and Wang Shengjun (Youji), Lin Maosen, Lin Xiuquan and Lin Maoxiang (Lin Huatai), Wang Guozhong (Xinfangchun), Ye Shoulun (Rice & Shine), Zhou Yicheng (Little Artyard), He Mingrui (Action! Bar)' },
    { label: '只寫行動、不點名', labelEn: 'Actions only, no names', value: '爐鍋咖啡的經營者；黃玉階文史館的營運單位；慈聖宮廟口各攤；年貨大街的個別商家', valueEn: 'The operator of Luguo Cafe; the operating body of the Huang Yujie Museum; the stalls at the forecourt of Cisheng Temple; individual merchants of the Lunar New Year goods street' },
    { label: '待核', labelEn: 'To be verified', value: '年貨大街的構想由來（官方稿與報導並列）；滋養遷入的年份；李亭香的世代與接班年；永樂米苔目的創立年', valueEn: 'Where the Lunar New Year goods street idea came from (official text and report given side by side); the year Ziyang moved in; Li Tingxiang’s generation and year of succession; the founding year of Yongle Mi-tai-mu' },
    { label: '不寫', labelEn: 'Not written', value: '各店之間的師承、合作或傳承；經營者的動機；老潘魷魚羹、好粿緣、林復振的現任經營者（查無）', valueEn: 'Teacher-apprentice ties, cooperation or succession between shops; operators’ motives; the current operators of Lao Pan Squid Soup, Haoguoyuan and Lin Fuzhen (nothing found)' },
  ],
  sourceIds: OPERATORS_REVIVAL_SOURCE_IDS,
}

/** 接在永樂市場文獻章免責文字後面 */
export const OPERATORS_REVIVAL_DISCLAIMER_TEXT =
  '「群像：在地經營者」一節只收各店章節裡已有出處的行動與年份，不評價、不推論動機，也不把各店寫成同一個運動；現在營業中的店家不寫成歷史人物。李亭香的世代與接班年、滋養遷入的年份、永樂米苔目的創立年、年貨大街的構想由來都標待核或留空；爐鍋咖啡的經營者、黃玉階文史館的營運單位、廟口各攤與其他查無店史的店家不點名。'
export const OPERATORS_REVIVAL_DISCLAIMER_TEXT_EN =
  'The “Portrait: Local Operators” section includes only actions and years already sourced in the shop chapters. It does not judge, infer motives, or write the shops up as a single movement; shops still trading are not written up as historical figures. Li Tingxiang’s generation and year of succession, the year Ziyang moved in, the founding year of Yongle Mi-tai-mu and the origin of the Lunar New Year goods street are marked to be verified or left blank; the operator of Luguo Cafe, the operating body of the Huang Yujie Museum, the temple-forecourt stalls and other shops with no findable history are not named.'

/**
 * 把群像章插在文獻章之前，並把它的出處與免責文字併進文獻章（用於林復振的 postwar 年代覆蓋）。
 * 回傳新的陣列，不改動原本的章節。
 */
export function withOperatorsChapter(chapters, chapter, disclaimerText, disclaimerTextEn) {
  const sources = chapters.at(-1)
  if (sources?.type !== 'sources') throw new Error('最後一章必須是文獻章')
  const sourceIds = [...sources.sourceIds, ...chapter.sourceIds.filter((id) => !sources.sourceIds.includes(id))]
  return [
    ...chapters.slice(0, -1),
    chapter,
    { ...sources, sourceIds, disclaimer: `${sources.disclaimer ?? ''}${disclaimerText}`,
      ...(sources.disclaimerEn || disclaimerTextEn ? { disclaimerEn: `${sources.disclaimerEn ?? ''}${disclaimerTextEn ?? ''}` } : {}) },
  ]
}
