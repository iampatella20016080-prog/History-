/**
 * 慈聖宮與廟口小吃（第 6 階段 B）：廟與廟埕的沿革，以及「庶民生活」年代廟口的情境示意攤位。
 *
 * 查證紀錄：docs/research/ci-sheng-gong-miaokou.md。結論：
 * - 廟的遷建主線有市區改正圖資可佐證（中研院 GIS 專題），但初建與遷建年份各說不一，一律並列、標待核。
 * - 廟口攤販的形成沒有官方或學術史料；「民國50年間聚集」只是中研院專題的一句說明，標待核。
 * - 各攤的店名、攤主、年份與傳承代數都查無可靠出處，互相矛盾：本站不寫任何具名的老店，描述只限於食物的做法特色，
 *   整體標「歷史情境重建」。老屋新生只寫「現在廟口仍有此類攤販」，不點名。
 *
 * 章節依年代組合（shops.js 的 ci-sheng-gong 用 eras 套用）：
 * - 酒樓繁華、摩登大稻埕：廟的沿革（文化據點）＋資料來源
 * - 庶民生活：廟口小吃（情境）＋四種小吃（食物圖鑑）＋廟的沿革＋資料來源
 * - 老屋新生：現在的廟口＋廟的沿革＋資料來源
 */

export const CI_SHENG_ADDRESS = '保安街49巷17號'
export const CI_SHENG_ADDRESS_EN = 'No. 17, Lane 49, Bao’an Street'

/** 廟與廟埕的沿革：年份並列、標待核 */
export const TEMPLE_HISTORY_CHAPTER = {
  id: 'temple',
  type: 'text',
  tab: '廟與廟埕',
  tabEn: 'Temple and forecourt',
  title: '慈聖宮：從艋舺到日新街',
  titleEn: 'Cisheng Temple: from Bangka to Rixin Street',
  lead: '同安人的媽祖廟隨著頂下郊拚遷到大稻埕，又在日治市區改正時遷到今天保安街49巷的位置；廟埕前的榕樹下，後來成了小吃攤聚集的廟口。',
  leadEn: 'The Mazu temple of the Tong’an people moved to Dadaocheng after the Dingxiajiao feud, then relocated again during the Japanese-era urban improvement to its present site at Lane 49, Bao’an Street. Under the banyan tree in front of the forecourt, a cluster of snack stalls later grew into the “temple front” (Miaokou).',
  paragraphs: [
    '中央研究院人社中心 GIS 專題的說明寫，嘉慶年間泉州同安商人從福建分靈媽祖，先供奉於艋舺八甲庄；咸豐三年（1853年）頂下郊拚後，同安人遷至大稻埕。在大稻埕初建廟的年份各說不一：維基百科的資訊框寫1864年、正文寫1866年遷至今民樂街與民生西路口面對碼頭，中研院專題寫1869年建於中街與南街交界，另有1855年林佑藻籌建一說。本站不寫成單一年份，只寫「約1860年代，各說不一、待核」。',
    '日治時期的市區改正讓廟再遷一次：中研院專題寫1909年6月25日起拆除、遷至日新街的農地，1914年重建完成，改稱「大稻埕慈聖宮」；維基百科寫1910年遷建、1914年完成；另有1914年起建、1916年完工一說。遷建的時間（1909／1910）與完工（1914／1916）本站並列、標待核。中研院專題提到1905年臺北市區改正計畫圖、1907年全圖與1910年地圖可以看到廟址的變化，這是遷建主線可以佐證的部分。',
    '現址是臺北市大同區保安街49巷17號（維基百科）。維基百科寫慈聖宮是直轄市定古蹟（2020年12月22日評定），但本站沒有找到臺北市文化局的公告頁，古蹟身分與日期只有單一來源，標待核、不寫成事實。',
    '說明｜街上這座廟是情境示意：規模、格局、榕樹與廟埕沿用本站的廟宇原型，相對位置也不是精確復原。酒樓繁華（1895–1930）的年代裡，廟在1910年代才遷到這裡，年代前段這塊地的樣子本站沒有史料，不另外重建。',
  ],
  paragraphsEn: [
    'The GIS project of the Research Center for Humanities and Social Sciences, Academia Sinica, says that during the Jiaqing era merchants from Tong’an in Quanzhou brought a branch image of Mazu from Fujian and first enshrined her in Bajia hamlet, Bangka. After the Dingxiajiao feud of the third year of Xianfeng (1853), the Tong’an people moved to Dadaocheng. Accounts differ on the year the temple was first built there: the Wikipedia infobox gives 1864 and its main text says 1866, at today’s corner of Minle Street and Minsheng West Road facing the wharf; the Academia Sinica project says 1869, at the junction of Middle Street and South Street; and another account has Lin Youzao raising funds in 1855. This site does not give a single year, only “around the 1860s; accounts differ, to be verified.”',
    'Urban improvement under Japanese rule moved the temple once more. The Academia Sinica project says demolition began on 25 June 1909 and the temple moved to farmland on Rixin Street, with rebuilding completed in 1914 and the name changed to “Dadaocheng Cisheng Temple”; Wikipedia gives relocation in 1910 and completion in 1914; another account has construction starting in 1914 and finishing in 1916. This site lists the relocation date (1909/1910) and the completion date (1914/1916) side by side, marked to be verified. The Academia Sinica project notes that the 1905 Taipei urban improvement plan map, the 1907 general map and the 1910 map show the change in the temple’s site; this is the part of the main story that maps can corroborate.',
    'The present address is No. 17, Lane 49, Bao’an Street, Datong District, Taipei (Wikipedia). Wikipedia says Cisheng Temple is a municipal historic monument (designated 22 December 2020), but this site could not find a notice from the Taipei Department of Cultural Affairs; the monument status and date rest on a single source, are marked to be verified and are not stated as fact.',
    'Note | The temple on the street is an illustrative scene: its scale, layout, banyan tree and forecourt reuse this site’s temple prototype, and relative positions are not an exact reconstruction. In the Banquet Hall Boom era (1895–1930) the temple only moved here in the 1910s; there is no historical material on how this plot looked earlier in the era, so it is not separately reconstructed.',
  ],
  timeline: [
    { place: '嘉慶年間', placeEn: 'Jiaqing era', text: '同安商人分靈媽祖，先供奉於艋舺八甲庄（中研院 GIS 專題，未附史料）。', textEn: 'Tong’an merchants bring a branch image of Mazu and first enshrine her in Bajia hamlet, Bangka (Academia Sinica GIS project, no historical source cited).' },
    { place: '1853', text: '頂下郊拚後同安人遷至大稻埕。', textEn: 'After the Dingxiajiao feud, the Tong’an people move to Dadaocheng.' },
    { place: '約1860年代', placeEn: 'c. 1860s', text: '在大稻埕建廟：1855／1864／1866／1869各說不一，待核。', textEn: 'The temple is built in Dadaocheng: accounts differ between 1855, 1864, 1866 and 1869; to be verified.' },
    { place: '1909／1910', text: '市區改正拆除、遷建至日新街（兩說並列，待核）。', textEn: 'Urban improvement leads to demolition and relocation to Rixin Street (two accounts listed side by side; to be verified).' },
    { place: '1914／1916', text: '重建完成，稱「大稻埕慈聖宮」（兩說並列，待核）。', textEn: 'Rebuilding completed; the temple is called “Dadaocheng Cisheng Temple” (two accounts listed side by side; to be verified).' },
    { place: '2020（待核）', placeEn: '2020 (to be verified)', text: '維基百科寫評定為直轄市定古蹟；官方公告未核對。', textEn: 'Wikipedia says it was designated a municipal historic monument; the official notice has not been checked.' },
  ],
  glossary: [
    { term: '市區改正', termEn: 'Urban improvement (shiqu gaizheng)', definition: '日治時期以拓寬道路、整理街廓為主的都市改造；大稻埕的市區改正讓慈聖宮從原址遷到日新街。', definitionEn: 'Urban reconstruction under Japanese rule, chiefly road widening and the reorganisation of street blocks; in Dadaocheng it led to Cisheng Temple moving from its original site to Rixin Street.' },
    { term: '頂下郊拚', termEn: 'Dingxiajiao feud', definition: '1853年艋舺的泉州三邑人（頂郊）與同安人（下郊）之間的分類械鬥；同安人落敗後遷往大稻埕。', definitionEn: 'The 1853 communal fight in Bangka between the Sanyi people of Quanzhou (the Upper Jiao, or Shangjiao) and the Tong’an people (the Lower Jiao, or Xiajiao); the defeated Tong’an people moved to Dadaocheng.' },
  ],
  sourceIds: ['sinica-gis-2025-cisheng', 'wiki-ci-sheng-gong'],
}

/** 庶民生活：廟口的情境示意攤位 */
export const MIAOKOU_CHAPTER = {
  id: 'miaokou',
  type: 'text',
  tab: '廟口小吃',
  tabEn: 'Temple-front snacks',
  title: '廟口的小吃攤（歷史情境重建）',
  titleEn: 'Snack stalls at the temple front (reconstructed historical scene)',
  lead: '榕樹下、廟埕前緣的一排攤位：清湯的排骨湯、切塊赤肉的肉粥、白煮豬腳配麵線、豬肚小腸的四神湯。這些是依現在廟口可以看到的食物類型重建的情境，不是某一攤的店史。',
  leadEn: 'A row of stalls under the banyan tree along the front edge of the forecourt: clear pork-rib soup, congee with diced lean pork, boiled pig’s trotter with mian-sian (thin wheat vermicelli), and a four-herb soup of pork tripe and intestine. These are scenes reconstructed from the types of food seen at the temple front today, not the history of any one stall.',
  paragraphs: [
    '說明｜本章是歷史情境重建。慈聖宮廟口的小吃攤什麼時候開始聚集，沒有官方或學術的史料：中研院 GIS 專題只寫「民國50年間，因香火鼎盛，周邊攤販聚集成市集」，沒有附出處，本站只能依此寫「約民國50年代前後（1960年代）聚集，待核」，不寫成「戰後初期」，也不寫更早。1914年廟遷到日新街之後、戰後之前廟埕的飲食形態查無資料。',
    '史料｜現在的廟口（保安街49巷一側）不到100公尺內有十多家攤商（食尚玩家），媒體寫這些攤位「數十年歷史，有些傳到第三代」（ETtoday，未指明哪一攤）；各攤的開業年份、攤主與傳承代數在不同的食記裡互相矛盾，本站一律不寫，也不使用任何現在店家的店名、招牌或商標。',
    '情境設計｜本站把四種食物當作「廟口小吃」的類型來呈現：原汁排骨湯（湯頭清澈，排骨可選肥瘦）、肉粥（赤肉切塊不絞，撒油蔥酥與芹菜）、豬腳麵線（白煮清燉的豬腳，麵線可選湯或乾）、四神湯（豬肚為主，可選小腸、肝連、粉腸）。這些做法特色整理自媒體與臺北市市場處對現在攤位的描述，不代表1945–1980年間的配方、份量或價格。',
    '史料｜臺北市市場處介紹廟口一攤四神湯時寫，攤家早年在迪化街口擺攤、後來才遷到慈聖宮廟口。這是「攤販從街頭遷入廟口」的一個例子，只見於這一份官方稿、年數前後不一，本站標待核，也不點名店家。',
    '史料｜教育部《臺灣台語常用詞辭典》：賣點心小吃的攤販稱「點心擔」，「廟口」是「廟門口、廟前廣場」。',
  ],
  paragraphsEn: [
    'Note | This chapter is a reconstructed historical scene. There is no official or scholarly source on when the snack stalls at the Cisheng Temple front began to gather: the Academia Sinica GIS project says only that “in the Minguo 50s, because incense flourished, surrounding vendors gathered into a market”, without citing a source. This site can only write “gathered around the Minguo 50s (the 1960s), to be verified”, not “the early postwar years”, and nothing earlier. No material survives on the food at the forecourt between the temple’s move to Rixin Street in 1914 and the postwar period.',
    'Sources | The temple front today (the Lane 49, Bao’an Street side) has more than ten vendors within under 100 metres (Supertaste); media write that these stalls have “decades of history, some passed to the third generation” (ETtoday, without saying which stall). The opening years, owners and generations of succession of the stalls contradict each other across food reviews, so this site omits them all and uses no present-day shop’s name, sign or logo.',
    'Scene design | This site presents four foods as types of “temple-front snack”: original-juice pork-rib soup (a clear broth; ribs fatty or lean), meat congee (lean pork cut into pieces rather than minced, topped with fried shallots and celery), pork trotter with mian-sian (plain-boiled, gently stewed trotter; noodles in soup or dry) and four-herb soup (mainly pork tripe, with small intestine, ganlian (a cut near the liver) or fenchang (intestine) as options). These characteristics are compiled from media and Taipei Market Administration Office descriptions of today’s stalls, and do not represent the recipes, portions or prices of 1945–1980.',
    'Sources | Introducing a four-herb soup stall at the temple front, the Taipei Market Administration Office writes that the stallholder first set up on the corner of Dihua Street in earlier years and only later moved to the Cisheng Temple front. This is one example of “vendors moving from the street into the temple front”; it appears only in this one official text, with inconsistent numbers of years, so this site marks it to be verified and names no shop.',
    'Sources | Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese: a vendor who sells snacks is called a “snack carrier” (tiám-sim-tànn), and “temple front” (biō-kháu) means “the temple gate, the open space in front of a temple”.',
  ],
  facts: [
    { label: '位置', labelEn: 'Location', value: '慈聖宮廟埕前緣、榕樹下（場景配置）', valueEn: 'Front edge of the Cisheng Temple forecourt, under the banyan tree (scene layout)' },
    { label: '年代', labelEn: 'Period', value: '約民國50年代前後聚集（1960年代；中研院 GIS 專題，待核）', valueEn: 'Gathered around the Minguo 50s (the 1960s; Academia Sinica GIS project, to be verified)' },
    { label: '性質', labelEn: 'Nature', value: '歷史情境重建：食物類型依現在廟口的攤位，不對應任何實際的店家', valueEn: 'Reconstructed historical scene: the foods follow the stalls at the temple front today and correspond to no actual shop' },
    { label: '不寫', labelEn: 'Not stated', value: '具名老店的店名與招牌、攤主、各攤年份與傳承代數（查無可靠出處）', valueEn: 'Names and signs of named old shops, stallholders, the years of individual stalls and generations of succession (no reliable source)' },
  ],
  glossary: [
    { term: '點心擔', termEn: 'Snack carrier', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'A vendor who sells snacks (Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese).' },
    { term: '廟口', termEn: 'Temple front', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。', definitionEn: 'The temple gate and the open space in front of a temple (same source).' },
  ],
  sourceIds: ['sinica-gis-2025-cisheng', 'tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb', 'moe-tiam-sim-tann', 'moe-biau-khau'],
}

/** 庶民生活：四種小吃的食物圖鑑（只寫做法特色） */
export const MIAOKOU_FOODS_CHAPTER = {
  id: 'miaokou-foods',
  type: 'foods',
  tab: '四種小吃',
  tabEn: 'Four snacks',
  title: '廟口的四種小吃',
  titleEn: 'Four snacks at the temple front',
  intro: '四種在現在廟口可以看到的小吃類型，依媒體與臺北市市場處的描述整理做法特色；不是某一攤的配方，也不代表1945–1980年間的樣子。',
  introEn: 'Four types of snack seen at the temple front today, with preparation characteristics compiled from media and Taipei Market Administration Office descriptions; not any one stall’s recipe, and not how things looked in 1945–1980.',
  items: [
    {
      id: 'temple-pork-rib-soup',
      name: '原汁排骨湯',
      nameEn: 'Original-juice pork-rib soup',
      category: '湯品｜排骨',
      categoryEn: 'Soup | Pork ribs',
      description: '排骨慢燉成清澈的湯頭，不勾芡、不加藥材；排骨可以選肥一點或瘦一點。',
      descriptionEn: 'Pork ribs stewed slowly into a clear broth, not thickened and without medicinal herbs; the ribs can be chosen fattier or leaner.',
      note: '做法特色依食尚玩家對現在攤位的描述；不寫店名、年份與價格。',
      noteEn: 'Preparation characteristics follow Supertaste’s description of present-day stalls; no shop name, year or price is given.',
    },
    {
      id: 'temple-meat-congee',
      name: '肉粥',
      nameEn: 'Meat congee',
      category: '粥品｜赤肉',
      categoryEn: 'Congee | Lean pork',
      description: '米粒煮開的鹹粥，赤肉切成小塊而不絞碎，上桌前撒油蔥酥與芹菜。',
      descriptionEn: 'A savoury congee with the rice grains cooked open; the lean pork is cut into small pieces rather than minced, and fried shallots and celery are sprinkled on before serving.',
      note: '做法特色依食尚玩家的描述；「台北三大」之類的排名是媒體說法，本站不採。',
      noteEn: 'Characteristics follow Supertaste; rankings such as “the top three in Taipei” are media claims that this site does not adopt.',
    },
    {
      id: 'temple-pork-knuckle-noodle',
      name: '豬腳麵線',
      nameEn: 'Pork trotter with mian-sian',
      category: '麵食｜豬腳',
      categoryEn: 'Noodles | Pork trotter',
      description: '白煮清燉的豬腳，不加醬色；配麵線，可以選湯的或乾的。',
      descriptionEn: 'Plain-boiled, gently stewed trotter with no soy colouring; served with mian-sian, in soup or dry.',
      note: '做法特色依食記的描述；某攤自述的創立年份沒有佐證，本站不寫。',
      noteEn: 'Characteristics follow food reviews; one stall’s own claimed founding year has no corroboration, so this site omits it.',
    },
    {
      id: 'temple-four-herb-soup',
      name: '四神湯',
      nameEn: 'Four-herb soup',
      category: '湯品｜藥燉',
      categoryEn: 'Soup | Herbal stew',
      description: '以豬肚為主的藥燉湯，可以換小腸、肝連或粉腸；配著肉包或燒賣一起吃。',
      descriptionEn: 'A herbal stew based on pork tripe, which can be swapped for small intestine, ganlian or fenchang; eaten with meat buns or shaomai.',
      note: '做法特色依臺北市市場處的介紹；同一份介紹裡的經營年數前後不一，本站不寫年數與店名。',
      noteEn: 'Characteristics follow the Taipei Market Administration Office’s introduction; the years in business given in that same text are inconsistent, so this site gives no number of years and no shop name.',
    },
  ],
  footnote: '四種小吃是示意的類型，不代表價格、份量或配方；本站沒有找到1945–1980年間廟口攤位的菜單或照片。',
  footnoteEn: 'These four snacks are illustrative types and do not represent prices, portions or recipes; this site found no menus or photographs of temple-front stalls from 1945–1980.',
  sourceIds: ['tvbs-supertaste-cisheng', 'tcma-cisheng-four-herb'],
}

/** 老屋新生：只寫現況，不點名 */
export const MIAOKOU_TODAY_CHAPTER = {
  id: 'today',
  type: 'text',
  tab: '現在的廟口',
  tabEn: 'The temple front today',
  title: '現在的廟口',
  titleEn: 'The temple front today',
  lead: '保安街49巷的慈聖宮廟口，現在仍有排骨湯、肉粥、豬腳麵線、四神湯這類小吃攤。',
  leadEn: 'At the Cisheng Temple front on Lane 49, Bao’an Street there are still stalls selling pork-rib soup, meat congee, pork trotter with mian-sian and four-herb soup.',
  paragraphs: [
    '史料｜媒體與臺北市市場處的介紹寫，現在廟口不到100公尺內有十多家攤商，賣的有原汁排骨湯、肉粥、豬腳麵線、四神湯等；有些攤位「數十年歷史，有些傳到第三代」（ETtoday，未指明哪一攤）。',
    '說明｜本站不寫任何具名的店家：各攤的年份、攤主與傳承代數在不同的來源裡互相矛盾，沒有可靠的出處。切換到「庶民生活」（1945–1980）可以看到依這些食物類型重建的情境攤位，那是歷史情境重建，不表示現在的任何一攤由它發展而來。',
  ],
  paragraphsEn: [
    'Sources | Media and the Taipei Market Administration Office write that the temple front today has more than ten vendors within under 100 metres, selling original-juice pork-rib soup, meat congee, pork trotter with mian-sian, four-herb soup and so on; some stalls have “decades of history, some passed to the third generation” (ETtoday, without saying which stall).',
    'Note | This site names no shop: the years, owners and generations of succession of the stalls contradict each other across sources and have no reliable provenance. Switch to Everyday Life (1945–1980) to see the scene stalls reconstructed from these types of food; that is a reconstructed historical scene and does not mean any stall today developed from it.',
  ],
  sourceIds: ['tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb'],
}

function sourcesChapter(chapters, disclaimer, disclaimerEn) {
  return {
    id: 'sources',
    type: 'sources',
    tab: '資料來源',
    tabEn: 'Sources',
    title: '資料來源',
    titleEn: 'Sources',
    intro: '本章節整理自下列資料，點選即可開啟原始網頁；查證紀錄見專案的 docs/research/ci-sheng-gong-miaokou.md。',
    introEn: 'This chapter is compiled from the following materials; tap one to open the original web page. The research record is in the project’s docs/research/ci-sheng-gong-miaokou.md.',
    sourceIds: [...new Set(chapters.flatMap((chapter) => chapter.sourceIds))],
    disclaimer,
    disclaimerEn,
  }
}

const TEMPLE_DISCLAIMER =
  '慈聖宮的初建與遷建年份各說不一，本站並列、標待核；古蹟身分只有維基百科一個來源。街上這座廟是情境示意，不是精確復原。'
const MIAOKOU_DISCLAIMER =
  '廟口的小吃攤是「歷史情境重建」：攤販聚集的年代只有中研院 GIS 專題一句未附出處的說明（民國50年間，待核），各攤的店名、攤主、年份與傳承代數查無可靠出處且互相矛盾，本站一律不寫，也不使用任何現在店家的店名、招牌或商標。食物的做法特色整理自媒體與臺北市市場處對現在攤位的描述，不代表1945–1980年間的配方、份量或價格。'
const TEMPLE_DISCLAIMER_EN =
  'The years of Cisheng Temple’s founding and relocation differ between accounts; this site lists them side by side and marks them to be verified, and its monument status rests on Wikipedia alone. The temple on the street is an illustrative scene, not an exact reconstruction.'
const MIAOKOU_DISCLAIMER_EN =
  'The temple-front snack stalls are a “reconstructed historical scene”: the period when vendors gathered rests on a single unsourced line in the Academia Sinica GIS project (Minguo 50s, to be verified), and the names, owners, years and generations of succession of individual stalls have no reliable source and contradict each other, so this site omits all of them and uses no present-day shop’s name, sign or logo. The preparation characteristics of the foods are compiled from media and Taipei Market Administration Office descriptions of today’s stalls and do not represent the recipes, portions or prices of 1945–1980.'

/** 各年代的章節組合 */
export const CI_SHENG_CHAPTERS = {
  heritage: (() => {
    const chapters = [TEMPLE_HISTORY_CHAPTER]
    return [...chapters, sourcesChapter(chapters, TEMPLE_DISCLAIMER, TEMPLE_DISCLAIMER_EN)]
  })(),
  postwar: (() => {
    const chapters = [MIAOKOU_CHAPTER, MIAOKOU_FOODS_CHAPTER, TEMPLE_HISTORY_CHAPTER]
    return [...chapters, sourcesChapter(chapters, MIAOKOU_DISCLAIMER, MIAOKOU_DISCLAIMER_EN)]
  })(),
  revival: (() => {
    const chapters = [MIAOKOU_TODAY_CHAPTER, TEMPLE_HISTORY_CHAPTER]
    return [...chapters, sourcesChapter(chapters, `${MIAOKOU_DISCLAIMER}${TEMPLE_DISCLAIMER}`, `${MIAOKOU_DISCLAIMER_EN} ${TEMPLE_DISCLAIMER_EN}`)]
  })(),
}

export const CI_SHENG_ERA_NOTES = {
  banquet: '慈聖宮在1909／1910年前後因市區改正遷到這裡、1914／1916年重建完成（年份待核）；年代前段這塊地的樣子沒有史料。這座廟是情境示意，不是精確復原。',
  banquetEn: 'Cisheng Temple moved here around 1909/1910 under urban improvement and was rebuilt in 1914/1916 (years to be verified); there is no historical material on how this plot looked earlier in the era. The temple is an illustrative scene, not an exact reconstruction.',
  modern: '日治市區改正後遷建於此的慈聖宮（1914／1916年完成，年份待核）。這座廟是情境示意，不是精確復原；這個年代廟口有沒有小吃攤查無資料，不寫。',
  modernEn: 'Cisheng Temple, moved here after the Japanese-era urban improvement (completed 1914/1916; years to be verified). The temple is an illustrative scene, not an exact reconstruction; whether the temple front had snack stalls in this era is not recorded, so none is stated.',
  postwar:
    '廟口的小吃攤是歷史情境重建：中研院 GIS 專題寫「民國50年間」攤販聚集（待核），各攤的店名、攤主與年份查無可靠出處，本站不寫；攤位依現在廟口可以看到的食物類型（排骨湯、肉粥、豬腳麵線、四神湯）設計，不對應任何實際的店家。',
    postwarEn:
      'The temple-front snack stalls are a reconstructed historical scene: the Academia Sinica GIS project says vendors gathered in the “Minguo 50s” (to be verified), and the names, owners and years of individual stalls have no reliable source, so this site gives none. The stalls are designed after the types of food seen at the temple front today (rib soup, meat congee, pork trotter with mian-sian, four-herb soup) and correspond to no actual shop.',
  revival: '現在保安街49巷的廟口仍有排骨湯、肉粥、豬腳麵線、四神湯這類小吃攤；本站不寫任何具名的店家。',
  revivalEn: 'The temple front on Lane 49, Bao’an Street still has stalls of this kind (rib soup, meat congee, pork trotter with mian-sian, four-herb soup); this site names no shop.',
}

/**
 * 資訊熱點（廟埕本地座標，見 squidSoupLayout.js 的 TEMPLE_COURT：原點在廟埕前緣的中央，+z 朝迪化街）：
 * 站在廟埕前的街邊、中央通道的延長線上看進廟埕。只有一個熱點，連同離開時的緩衝（0.7 m）
 * 都不和兩側前緣的魷魚羹攤（radius 1.75）與米苔目攤（radius 1.6）的互動範圍重疊。
 */
export const CI_SHENG_HOTSPOT = {
  id: 'court',
  point: [0.8, 2.6],
  level: 0,
  radius: 0.9,
  prompt: [0.4, 2.5, 1.2],
  camera: { position: [-0.4, 2.1, 5.2], target: [0.2, 2.9, -3.0] },
}

export function ciShengHotspots(eraId) {
  const chapter = eraId === 'postwar' ? MIAOKOU_CHAPTER.id : eraId === 'revival' ? MIAOKOU_TODAY_CHAPTER.id : TEMPLE_HISTORY_CHAPTER.id
  const label = eraId === 'postwar' ? '慈聖宮廟口小吃' : eraId === 'revival' ? '慈聖宮廟口' : '慈聖宮'
  const note = eraId === 'postwar' ? '歷史情境重建' : eraId === 'revival' ? '現在的廟口小吃，不寫具名店家' : '情境示意，年份待核'
  const labelEn = eraId === 'postwar' ? 'Cisheng Temple front snacks' : eraId === 'revival' ? 'Cisheng Temple front' : 'Cisheng Temple'
  const noteEn = eraId === 'postwar' ? 'Reconstructed historical scene' : eraId === 'revival' ? 'Temple-front snacks today; no shops named' : 'Illustrative scene; years to be verified'
  return [{ ...CI_SHENG_HOTSPOT, chapter, label, labelEn, note, noteEn }]
}
