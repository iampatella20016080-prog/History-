/**
 * 王井泉的「人物」小節（第 8 階段，方案 1）：不新增 3D 人物、不新增店家（山水亭門牌查無，無法對應街景地段），
 * 只加一章文字、出處與年表，掛在「摩登大稻埕」波麗路（bolero）的故事裡，排在食物圖鑑之後、文獻章之前（與李春生相同）。
 *
 * 為什麼掛在波麗路：專案沒有山水亭店家；波麗路的背景章本來就提到山水亭與維特咖啡，而曾品滄（中研院）記王井泉協助好友
 * 廖水來創設波麗路，兩家在同一條太平町上、同一個年代（1930–1945）。
 *
 * 查證紀錄：docs/research/wang-jing-quan.md（含第二輪補查；原始摘錄在 shanshuiting-vite-raw.md）。結論：
 * - 可寫：1905 年生於大龍峒；1931–1934 任維特酒家經理；協助廖水來創設波麗路；1930 年代末在延平北路一帶的街屋二樓開設
 *   「純臺灣菜」的山水亭，樓上供文藝界人士食宿；1941 年與張文環等組啟文社創刊《台灣文學》、社址設於山水亭；
 *   1943 年厚生演劇研究會會址設於山水亭；戰時仍營業；代表菜（曾品滄一篇，註明單一來源）；文人往來只列有出處者。
 * - 待核／並列：開業年 1937（曾品滄）／1938-03-03（林振莖引其子王古勳回憶）／1939（臺灣記憶）；町名太平町（曾品滄、莊永明）
 *   vs 永樂町（林振莖）；維特的經營者與王井泉的角色；享年 59／61 不寫。
 * - 不寫：門牌（查無）；1940 年照片（授權未確認）；「樓下是日光堂書局」「前身錦茂行」（只見單一摘要）；
 *   「梁山泊」只能寫「後人稱」；戰後政治立場評價、二二八細節、陳逸松出資的說法（個人回憶）；山水亭對應哪一棟街景。
 * - 1945 年以後（1953 遷址、1955 歇業、榮星花園）屬下一個年代，只寫一句並明說「1945 年以後」。
 */

export const WANG_JINGQUAN_HOST_SHOP_ID = 'bolero'
export const WANG_JINGQUAN_ERA_ID = 'modern'

/** 人物小節引用的出處（既有的優先沿用；新增的都有檢核欄位） */
export const WANG_JINGQUAN_SOURCE_IDS = [
  'sinica-newsletter-1584-shanshuiting',
  'ntmofa-lin-zhenjing-2013-wang-jingquan',
  'ncl-tm-wang-jingquan',
  'jaung-wang-jingquan-2015',
  'newtalk-2024-shanshuiting',
  'setn-2020-vite-cafe',
  'wiki-wang-jingquan',
]

export const WANG_JINGQUAN_PERSON_CHAPTER = {
  id: 'wang-person',
  type: 'text',
  tab: '人物：王井泉',
  tabEn: 'Person: Wang Jingquan',
  title: '人物：王井泉——從維特的經理到山水亭的主人',
  titleEn: 'Person: Wang Jingquan — from manager of the Vite Cafe to owner of Shanshuiting',
  lead: '背景章提到的山水亭，主人是王井泉。這一節把他在1930–1945年之間的行動排出來：維特酒家的經理、波麗路開店時的幫手、山水亭的經營者，以及這家臺菜餐館樓上樓下進出的作家與畫家。只寫有出處的事件，稱號只作引述。',
  leadEn: 'Shanshuiting, mentioned in the background chapter, was run by Wang Jingquan. This section sets out his actions between 1930 and 1945: manager of the Vite Cafe, helper when Bolero opened, proprietor of Shanshuiting, and the writers and painters who came and went upstairs and down in this Taiwanese restaurant. Only events with sources are given, and titles are given only as quotations.',
  paragraphs: [
    '出身｜1905年6月4日，王井泉生於臺北大龍峒的商人家庭（林振莖；曾品滄記大龍峒商人家庭）。1918年太平公學校畢業後考入臺北商工學校（林振莖）。1931年他擔任維特酒家（カフェー・ヱルテル）的經理，簽了三年服務合約，1934年期滿離開（林振莖；臺灣記憶寫「1931年曾任維特酒家經理」）。曾品滄寫他參與大稻埕第一家臺灣人開設的喫茶店維特的經營，並在他主導下從喫茶店改為酒家；三立新聞網則寫維特由楊承基經營。維特的開設主體與他的角色各說不同，本站並列、標待核。',
    '波麗路｜離開維特後他到日本考察餐飲業；1935年與廖水來、藍火樹在迪化街開設西式茶室（林振莖）。曾品滄寫他協助好友廖水來創設波麗路西餐館——也就是你現在站在門口的這家店。這是本站把他的小節放在波麗路故事裡的原因之一：兩家店在同一條太平町上，主人也相識。',
    '山水亭｜1930年代末，他在延平北路一帶一幢街屋的二樓開設臺菜餐館「山水亭」。開業年各資料不一：曾品滄寫1937年；林振莖引其子王古勳的回憶寫1938年3月3日；國家圖書館「臺灣記憶」寫1939年；本站三說並列、不定案。町名也有兩種寫法：曾品滄與莊永明寫太平町，林振莖寫永樂町（兩者相鄰，都在今延平北路沿線），本站只寫「延平北路一帶」，門牌查無、不寫。曾品滄描述店面「不算十分寬敞」，擺方桌與圓桌，桌上插花，有唱機播放樂曲；樓上供文藝界人士食宿，作曲家呂泉生曾寄宿樓上。菜以「純臺灣菜」為取向，名菜有掛爐烤鴨、羔燒羊肉、紅燒魚，受歡迎的小吃有東坡刈包、鳳尾蝦、雞腳凍、椰子餅、菜脯蛋、醬冬瓜、滷肝，店裡設有調酒吧台（曾品滄引陳逸松口述；代表菜只有這一篇來源）。',
    '文人往來｜曾品滄列出的常客有陳逸松、張文環、楊三郎、楊千鶴、國分直一、池田敏雄、吳新榮、王育德，呂赫若「幾乎每日在山水亭閒待著」；林振莖引《呂赫若日記》補上陳夏雨、李石樵、吳天賞等美術界人士的聚會。1941年，王井泉與張文環、陳逸松、黃得時等人組啟文社，創刊《台灣文學》季刊，王井泉任啟文社負責人、張文環任編輯（林振莖），啟文社的社址就設在山水亭（曾品滄）；創刊號的批評座談會同年在山水亭召開（林振莖）。畫家楊三郎擔任《台灣文學》的編輯委員並協助美編（林振莖）。1943年厚生演劇研究會成立，9月在永樂座演出《閹雞》等劇（林振莖、臺灣記憶），會址也設於山水亭（曾品滄）。曾品滄與臺灣記憶都寫到後人稱山水亭為「梁山泊」，這是稱號，本站只作引述。',
    '戰時與之後｜1943年5月黃旺成的日記記載，節米日山水亭的1.5元定食仍有飯；1944到1945年空襲頻繁、許多餐館關門，山水亭仍營業（曾品滄）。1945年以後的事屬於下一個年代，這裡只記一句：1953年因房租上漲，山水亭遷到民生西路一帶、規模縮小，1955年歇業（曾品滄、林振莖）；之後他應辜偉甫之邀到榮星花園擔任園丁，1965年5月19日病逝（臺灣記憶、曾品滄、林振莖）。',
  ],
  paragraphsEn: [
    'Background | Wang Jingquan was born on 4 June 1905 into a merchant family in Dalongdong, Taipei (Lin Zhenjing; Zeng Pincang also records a Dalongdong merchant family). After graduating from Taiping Public School in 1918 he entered the Taipei Commercial and Industrial School (Lin Zhenjing). In 1931 he became manager of the Vite Cafe (カフェー・ヱルテル), signing a three-year service contract and leaving when it ended in 1934 (Lin Zhenjing; Taiwan Memory says “served as manager of the Vite Cafe in 1931”). Zeng Pincang writes that he took part in running Vite, the first coffee house opened by Taiwanese in Dadaocheng, and that under his lead it changed from a coffee house into a cafe-bar; SETN writes instead that Vite was run by Yang Chengji. Accounts differ on who set Vite up and on his role, so this site shows them side by side and marks them to be verified.',
    'Bolero | After leaving Vite he went to Japan to study the restaurant trade; in 1935 he opened a Western-style tea room on Dihua Street with Liao Shuilai and Lan Huoshu (Lin Zhenjing). Zeng Pincang writes that he helped his good friend Liao Shuilai set up the Bolero Western restaurant — the very shop at whose door you now stand. This is one reason this site places his section in the Bolero story: the two places stood on the same Taiping-chō, and their owners knew each other.',
    'Shanshuiting | In the late 1930s he opened the Taiwanese restaurant Shanshuiting (Landscape Pavilion) on the upper floor of a shophouse somewhere along Yanping North Road. Sources disagree on the opening year: Zeng Pincang gives 1937; Lin Zhenjing, citing the recollection of his son Wang Guxun, gives 3 March 1938; the National Central Library’s Taiwan Memory gives 1939. This site shows all three side by side and settles on none. The name of the district is also written two ways: Zeng Pincang and Zhuang Yongming say Taiping-chō, Lin Zhenjing says Yongle-chō (the two are adjacent, both along today’s Yanping North Road), so this site says only “along Yanping North Road”; no street number has been found, so none is given. Zeng describes the dining room as “not very spacious”, with square and round tables, flowers on the tables and a gramophone playing music; the upper floor provided board and lodging for people from the literary and artistic world, and the composer Lü Quansheng once lodged upstairs. The cooking was oriented towards “purely Taiwanese cuisine”: famous dishes included hung-oven roast duck, braised lamb and braised fish, and popular snacks included Dongpo gua bao (braised pork buns), phoenix-tail prawns, chicken-feet jelly, coconut biscuits, preserved-radish omelette, pickled winter melon and braised liver; the restaurant also had a cocktail bar (Zeng Pincang, citing Chen Yisong’s oral account; the signature dishes have only this one source).',
    'Writers and artists | The regulars listed by Zeng Pincang were Chen Yisong, Zhang Wenhuan, Yang Sanlang, Yang Qianhe, Kokubu Naoichi, Ikeda Toshio, Wu Xinrong and Wang Yude, while Lü Heruo “hung about at Shanshuiting almost every day”; Lin Zhenjing, citing the Diary of Lü Heruo, adds gatherings of art-world figures such as Chen Xiayu, Li Shiqiao and Wu Tianshang. In 1941 Wang Jingquan, with Zhang Wenhuan, Chen Yisong, Huang Deshi and others, formed the Qiwen Society and launched the quarterly Taiwan Literature, with Wang as head of the society and Zhang as editor (Lin Zhenjing); the society’s office was at Shanshuiting (Zeng Pincang), and the critics’ symposium for the first issue was held there the same year (Lin Zhenjing). The painter Yang Sanlang served on the editorial board of Taiwan Literature and helped with the art editing (Lin Zhenjing). In 1943 the Kōsei Theatre Research Society was founded and in September staged plays including The Capon at the Yongle Theatre (Lin Zhenjing, Taiwan Memory); its base too was at Shanshuiting (Zeng Pincang). Both Zeng Pincang and Taiwan Memory report that later generations called Shanshuiting the “Liangshan Marsh” (hideout of the heroes in Water Margin); that is a nickname, which this site gives only as a quotation.',
    'During the war and after | Huang Wangcheng’s diary for May 1943 records that on a rice-saving day Shanshuiting’s 1.5-yuan set meal still came with rice; in 1944–1945, with air raids frequent and many restaurants shut, Shanshuiting stayed open (Zeng Pincang). What happened after 1945 belongs to the next era, so just one sentence here: in 1953, because of rising rent, Shanshuiting moved to the Minsheng West Road area on a smaller scale, and in 1955 it closed (Zeng Pincang, Lin Zhenjing); afterwards, at the invitation of Gu Weifu, he worked as a gardener at Rongxing Garden, and died on 19 May 1965 (Taiwan Memory, Zeng Pincang, Lin Zhenjing).',
  ],
  timeline: [
    { place: '1905', text: '6月4日生於臺北大龍峒（林振莖）。', textEn: 'Born on 4 June in Dalongdong, Taipei (Lin Zhenjing).' },
    { place: '1931–1934', text: '任維特酒家經理（林振莖、臺灣記憶；維特的經營者與他的角色各說不同，待核）。', textEn: 'Manager of the Vite Cafe (Lin Zhenjing, Taiwan Memory; accounts differ on who ran Vite and on his role; to be verified).' },
    { place: '1935', text: '與廖水來、藍火樹在迪化街開設西式茶室；協助廖水來創設波麗路（曾品滄）。', textEn: 'Opens a Western-style tea room on Dihua Street with Liao Shuilai and Lan Huoshu; helps Liao Shuilai set up Bolero (Zeng Pincang).' },
    { place: '1937／1938／1939', text: '開設山水亭（曾品滄1937年；林振莖引王古勳回憶1938年3月3日；臺灣記憶1939年；三說並列，待核）。', textEn: 'Opens Shanshuiting (1937 per Zeng Pincang; 3 March 1938 per Lin Zhenjing citing Wang Guxun’s recollection; 1939 per Taiwan Memory; all three shown, to be verified).' },
    { place: '1941', text: '與張文環、陳逸松、黃得時等組啟文社，創刊《台灣文學》，社址設於山水亭。', textEn: 'Forms the Qiwen Society with Zhang Wenhuan, Chen Yisong, Huang Deshi and others and launches Taiwan Literature; the society’s office is at Shanshuiting.' },
    { place: '1943', text: '厚生演劇研究會成立，會址設於山水亭；9月在永樂座演出《閹雞》。', textEn: 'The Kōsei Theatre Research Society is founded, based at Shanshuiting; in September it stages The Capon at the Yongle Theatre.' },
    { place: '1944–1945', text: '空襲期間山水亭仍營業（曾品滄）。', textEn: 'Shanshuiting stays open during the air raids (Zeng Pincang).' },
    { place: '1953／1955', text: '1945年以後：山水亭遷至民生西路一帶、規模縮小；1955年歇業。', textEn: 'After 1945: Shanshuiting moves to the Minsheng West Road area on a smaller scale; it closes in 1955.' },
    { place: '1965', text: '5月19日病逝（臺灣記憶）。', textEn: 'Dies on 19 May (Taiwan Memory).' },
  ],
  facts: [
    { label: '生卒', labelEn: 'Life dates', value: '1905年6月4日—1965年5月19日（享年兩說不同，本站不寫）', valueEn: '4 June 1905 – 19 May 1965 (his age at death is given two ways; not stated here)' },
    { label: '維特酒家', labelEn: 'Vite Cafe', value: '1931–1934年任經理（林振莖、臺灣記憶）；開設主體與王井泉的角色各說不同，待核', valueEn: 'Manager 1931–1934 (Lin Zhenjing, Taiwan Memory); accounts differ on who set it up and on Wang Jingquan’s role; to be verified' },
    { label: '山水亭開業年', labelEn: 'Shanshuiting opening year', value: '1937（曾品滄）／1938年3月3日（林振莖引王古勳回憶）／1939（臺灣記憶）並列，待核', valueEn: '1937 (Zeng Pincang) / 3 March 1938 (Lin Zhenjing, citing Wang Guxun’s recollection) / 1939 (Taiwan Memory), shown side by side, to be verified' },
    { label: '山水亭位置', labelEn: 'Shanshuiting location', value: '延平北路一帶街屋二樓；町名太平町（曾品滄、莊永明）／永樂町（林振莖）並列；門牌查無，不寫', valueEn: 'Upper floor of a shophouse along Yanping North Road; district given as Taiping-chō (Zeng Pincang, Zhuang Yongming) or Yongle-chō (Lin Zhenjing), shown side by side; no street number found, none given' },
    { label: '《台灣文學》', labelEn: 'Taiwan Literature', value: '1941年啟文社創刊，王井泉任負責人、張文環任編輯；社址設於山水亭', valueEn: 'Launched by the Qiwen Society in 1941, with Wang Jingquan as head and Zhang Wenhuan as editor; office at Shanshuiting' },
    { label: '代表菜', labelEn: 'Signature dishes', value: '東坡刈包、鳳尾蝦、雞腳凍、椰子餅、菜脯蛋、醬冬瓜、滷肝；掛爐烤鴨、羔燒羊肉、紅燒魚（曾品滄一篇，單一來源）', valueEn: 'Dongpo gua bao (braised pork buns), phoenix-tail prawns, chicken-feet jelly, coconut biscuits, preserved-radish omelette, pickled winter melon, braised liver; hung-oven roast duck, braised lamb, braised fish (Zeng Pincang only; single source)' },
  ],
  sourceIds: WANG_JINGQUAN_SOURCE_IDS,
}

/** 接在波麗路文獻章免責文字後面 */
export const WANG_JINGQUAN_DISCLAIMER_TEXT =
  '「人物：王井泉」一節只寫有出處的行動與事件；山水亭的開業年（1937／1938／1939）與町名（太平町／永樂町）並列、不定案，門牌查無，所以山水亭不做成店家、也不對應街景裡的任何一棟建築。「梁山泊」只作後人稱號引述。查無或單一來源而不寫：樓下的書局與前身、1940年的照片（授權未確認）、陳逸松出資的說法、享年、戰後的政治立場。'

/**
 * 年表上的大事（只加有兩個以上出處的年份）：
 * - 1941 《台灣文學》創刊、啟文社設於山水亭（林振莖、曾品滄）
 * - 1943 厚生演劇研究會成立、會址設於山水亭（林振莖、臺灣記憶、曾品滄）
 * 山水亭開業年三說、維特 1931 的經營者各說不同，不上年表。
 */
export const WANG_JINGQUAN_TIMELINE_EVENTS = [
  { year: 1941, text: '王井泉與張文環、陳逸松、黃得時等組啟文社，創刊《台灣文學》季刊，社址設於山水亭。', textEn: 'Wang Jingquan, with Zhang Wenhuan, Chen Yisong, Huang Deshi and others, forms the Qiwen Society and launches the quarterly Taiwan Literature; the society’s office is at Shanshuiting.', sourceIds: ['ntmofa-lin-zhenjing-2013-wang-jingquan', 'sinica-newsletter-1584-shanshuiting'] },
  { year: 1943, text: '厚生演劇研究會成立，會址設於山水亭；9月在永樂座演出《閹雞》等劇。', textEn: 'The Kōsei Theatre Research Society is founded, based at Shanshuiting; in September it stages plays including The Capon at the Yongle Theatre.', sourceIds: ['ntmofa-lin-zhenjing-2013-wang-jingquan', 'ncl-tm-wang-jingquan', 'sinica-newsletter-1584-shanshuiting'] },
]

/** 英文版：免責文字（對應 WANG_JINGQUAN_DISCLAIMER_TEXT） */
export const WANG_JINGQUAN_DISCLAIMER_TEXT_EN =
  'The section “Person: Wang Jingquan” records only actions and events with sources. The opening year of Shanshuiting (1937/1938/1939) and the district name (Taiping-chō/Yongle-chō) are shown side by side and not settled, and no street number was found, so Shanshuiting is not built as a shop and is not matched to any building in the street scene. “Liangshan Marsh” is quoted only as a nickname given by later generations. Left out because no source was found or because there is only a single source: the bookshop downstairs and the earlier business, the 1940 photograph (licence unconfirmed), the claim that Chen Yisong put up the money, his age at death, and his postwar political stance.'
