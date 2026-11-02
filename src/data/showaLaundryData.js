/**
 * 昭和浪漫洗濯屋（安西街3號；只在 2000–現在「老屋新生」）的介紹章節
 *
 * 查證紀錄見 docs/research/showa-laundry.md。寫法：
 * - 店家沒有公開的經營細節不寫；經營者不點名。
 * - 屋齡「約80年」（媒體互相轉述，最早見於2022年食尚玩家）與「1937年老宅」（只有《台北畫刊》一篇）都寫成「據說」，不寫成事實。
 * - 洗衣店的年代、經營者本站查無；門口的「僑隆洗染」舊招牌是使用者現場確認（2026-11-02），不拿招牌推年份。
 * - 洗衣業的背景只寫臺灣一般的情形，並寫明不是這家店的史料。
 * - 口味與價格會變，章節只寫品項類型。
 */

export const SHOWA_LAUNDRY_ID = 'showa-laundry'

/** 使用者現場確認的事（不是文獻出處；比照研究文件的「〔照片〕觀察」寫法，直接寫在句子裡） */
const FIELD = '（使用者現場確認，2026-11-02）'
const FIELD_EN = ' (confirmed on site by the user, 2 November 2026)'

export const SHOWA_SOURCE_IDS = [
  'supertaste-showa-laundry',
  'beauty321-showa-laundry',
  'kyoko-showa-laundry',
  'upssmile-showa-laundry',
  'bella-showa-laundry',
  'taipei-pictorial-showa-laundry',
  'funliday-showa-laundry',
  'pbear-showa-laundry',
  'justabalcony-anxi-street',
  'hung-2014-air-defense-open-space',
  'mymkc-laundry-history',
  'digitalarchives-charcoal-iron',
  'zatsuneta-softcream-day',
  'delishkitchen-sanshoku-dango',
  'hamburg-embassy-sanshoku-dango',
]

export const SHOWA_ERA_NOTE =
  '昭和浪漫洗濯屋只出現在「老屋新生」（2000–現在）。真實的店在安西街3號的街角，本站把它放在河岸廣場東南角的轉角，只保留「轉角老屋、長立面加短山牆」的樣子，不是精確的位置。外觀與一樓依使用者提供的照片建模（尺寸是估算），一樓可以走進去，二樓閣樓不開放。洗衣店的年代查無，所以沒有做其他年代的版本。'
export const SHOWA_ERA_NOTE_EN =
  'The Showa Roman Laundry appears only in “Old Houses, New Life” (2000–present). The real shop stands on the corner at 3 Anxi Street; this site places it on the south-east corner of the riverside plaza, keeping only its form as a corner old house with a long frontage and a short gable—not its exact location. The exterior and ground floor are modelled from photographs supplied by the user (dimensions are estimates); the ground floor can be entered, while the upstairs loft is closed. The laundry’s dates have not been found, so no versions have been made for other eras.'

export const SHOWA_CHAPTERS = [
  {
    id: 'shop',
    type: 'text',
    tab: '店家與位置',
    tabEn: 'The shop and its location',
    title: '店家與位置｜安西街角的霜淇淋專賣店',
    titleEn: 'The shop and its location | A soft-serve shop on the corner of Anxi Street',
    lead: '昭和浪漫洗濯屋在臺北市大同區安西街3號，是老屋改成的霜淇淋專賣店；媒體報導寫它2022年6月試營運、7月30日正式開幕。',
    leadEn: 'The Showa Roman Laundry, at 3 Anxi Street, Datong District, Taipei, is a soft-serve shop in a converted old house; press reports say it opened for trial trading in June 2022 and officially on 30 July.',
    paragraphs: [
      '位置：報導寫店在「迪化街尾端」、靠近大橋頭捷運站，部落客寫它在巷弄轉角、對面是大稻埕公園。本站的街道是敘事式的配置，把店放在河岸廣場東南角的轉角，只保留「轉角的老屋」這個樣子。',
      '和「昭和浪漫冰室」的關係：Bella 儂儂（2023）與 Funliday（2023）都寫洗濯屋是文昌街人氣冰店「昭和浪漫冰室」的第二間店；冰室以雪花冰為主，洗濯屋以霜淇淋、烤糰子與布丁為主。據說店名的「昭和」指店裡的日式懷舊風，「浪漫」是老闆的浪漫性格（只有 Bella 儂儂一篇這樣寫）。',
      '店面（依使用者提供的照片）：沿街的長立面是灰白斑駁的水泥牆、綠色木框窗與白框玻璃門，牆上兩行大字「昭和浪漫洗濯屋」「アイスクリーム專売店」；轉角的山牆掛著紫色暖簾，寫著「台北・大稻埕」與「隱身於街角的霜淇淋專賣店」。門口有大型霜淇淋模型、嵌在牆上的紅色販賣機、長凳與老腳踏車。',
      '一樓（依照片與媒體描述）：進門右手邊是長吧台，點餐與取餐都在這裡；靠窗只有幾個座位；左手邊是往閣樓的窄木梯。媒體寫二樓是木樑與三角屋頂下的閣樓座位，盡頭有榻榻米；本站只做一樓，樓梯口封住。外帶的霜淇淋從小窗口遞出來（食尚玩家，2022）。',
    ],
    paragraphsEn: [
      'Location: reports place it “at the end of Dihua Street”, near Daqiaotou MRT station, and a blogger writes that it is on a lane corner opposite Dadaocheng Park. This site’s street is a narrative layout: the shop is placed on the south-east corner of the riverside plaza, keeping only its character as a corner old house.',
      'Its relation to the “Showa Roman Ice Room”: Bella (2023) and Funliday (2023) both describe the laundry as the second shop of the popular Wenchang Street ice shop “Showa Roman Ice Room” (昭和浪漫冰室); the ice room mainly serves shaved snow ice, while the laundry mainly serves soft serve, grilled dango and pudding. Reportedly, the “Showa” in the name refers to the shop’s Japanese nostalgic style and the “Roman” (romance) to the owner’s romantic nature (only Bella says so).',
      'The shopfront (from the user’s photographs): the long frontage on the street is a mottled grey-white concrete wall with green timber-framed windows and a white-framed glass door, with two lines of large lettering on the wall, “Showa Roman Laundry” and “Ice-cream shop” (in Japanese); the corner gable hangs purple noren curtains and reads “Taipei · Dadaocheng” and “the soft-serve shop hidden on the street corner”. At the door stand a large soft-serve model, a red vending machine set into the wall, benches and an old bicycle.',
      'The ground floor (from the photographs and press descriptions): to the right of the door is a long counter where you order and collect; there are only a few seats by the windows; to the left a narrow timber stair climbs to the loft. The press describes the upper floor as loft seating under timber beams and the pitched roof, with tatami at the far end; this site builds only the ground floor and the stair is closed off. Takeaway soft serve is handed out through a small window (Supertaste, 2022).',
    ],
    facts: [
      { label: '地址', labelEn: 'Address', value: '臺北市大同區安西街3號', valueEn: '3 Anxi Street, Datong District, Taipei' },
      { label: '開幕', labelEn: 'Opened', value: '2022年6月試營運、7月30日正式開幕（媒體報導）', valueEn: 'Trial trading June 2022, officially opened 30 July (press reports)' },
      { label: '第一間店', labelEn: 'First shop', value: '昭和浪漫冰室（大安區文昌街）', valueEn: 'Showa Roman Ice Room (Wenchang Street, Da’an District)' },
      { label: '建築', labelEn: 'Building', value: '兩層樓、鐵皮兩坡頂的轉角老屋', valueEn: 'A two-storey corner old house with a pitched tin roof' },
    ],
    sourceIds: ['supertaste-showa-laundry', 'beauty321-showa-laundry', 'kyoko-showa-laundry', 'upssmile-showa-laundry', 'bella-showa-laundry', 'funliday-showa-laundry'],
  },
  {
    id: 'laundry',
    type: 'text',
    tab: '老洗衣店',
    tabEn: 'The old laundry',
    title: '老洗衣店｜「僑隆洗染」的舊招牌',
    titleEn: 'The old laundry | The old “Qiaolong” laundry sign',
    lead: `店門口左側保留一面紅底白字的直式舊招牌，寫著「僑隆洗染」，是這裡還是洗衣店時留下來的${FIELD}。這家洗衣店開了多久、由誰經營，本站沒有查到資料。`,
    leadEn: `To the left of the door hangs an old red vertical sign with white characters reading “Qiaolong Laundry and Dyeing” (僑隆洗染), left over from when this was a laundry${FIELD_EN}. This site has found no record of how long the laundry ran or who ran it.`,
    paragraphs: [
      '據說這棟房子是一間約八十年的老洗衣店改建的：2022年食尚玩家轉載的部落客文章最早這樣寫，之後的報導多半沿用，但沒有一篇寫出依據，也沒有一篇說是店家講的。',
      '據說改建自1937年的老宅：只有2023年《台北畫刊》（鏡週刊轉載）一篇這樣寫，同樣沒有寫依據。兩種說法本站都還沒有核對到使用執照、地政資料或舊航照，所以不寫成屋齡。',
      `可以確定的是門口那面「僑隆洗染」舊招牌${FIELD}，2022年的部落客也寫到「門口保留洗衣店當初的招牌」。招牌只告訴我們洗衣店的店號，不能用來推算年份。`,
      '部落客的觀察：改建保留了木窗框與木門窗，二樓是木地板與木樑（2022）；報導寫店裡「保留了原本的建築外觀與內部架構」（2023）。哪些是原物、哪些是新做的，店家沒有公開說明。',
      '店裡後場的木桶、洗衣板與碗櫥上的炭火熨斗，是本站放的情境示意，介紹臺灣早年洗衣的工具，不是這家洗衣店留下來的東西。',
    ],
    paragraphsEn: [
      'Reportedly, the building is a converted laundry about eighty years old: a blogger’s post reprinted by Supertaste in 2022 is the earliest to say so, and later reports mostly repeat it, but none gives a basis for the figure and none says the shop itself said so.',
      'Reportedly, it was converted from a house built in 1937: only one article, in Taipei Pictorial in 2023 (reprinted by Mirror Media), says so, again without a basis. This site has not yet checked either claim against a use permit, land records or old aerial photographs, so neither is given as the building’s age.',
      `What is certain is the old “Qiaolong Laundry and Dyeing” sign at the door${FIELD_EN}; a blogger in 2022 also wrote that “the laundry’s original sign has been kept at the door”. The sign gives only the laundry’s trade name and cannot be used to work out a date.`,
      'Bloggers’ observations: the conversion kept the timber window frames and timber doors and windows, and the upper floor has timber floors and beams (2022); a report says the shop “kept the original exterior and internal structure” (2023). The shop has not said publicly which parts are original and which are new.',
      'The wooden tub and washboard in the back room and the charcoal iron on the cupboard are this site’s scenario illustration, introducing the tools of laundry work in Taiwan in earlier times; they are not items left by this laundry.',
    ],
    facts: [
      { label: '舊招牌', labelEn: 'Old sign', value: `「僑隆洗染」${FIELD}`, valueEn: `“Qiaolong Laundry and Dyeing” (僑隆洗染)${FIELD_EN}` },
      { label: '屋齡', labelEn: 'Age of the house', value: '據說約80年；據說1937年（待核）', valueEn: 'Reportedly about 80 years; reportedly 1937 (to be verified)' },
      { label: '洗衣店的年代', labelEn: 'Dates of the laundry', value: '本站查無', valueEn: 'Not found by this site' },
      { label: '經營者', labelEn: 'Operator', value: '本站查無，不寫', valueEn: 'Not found by this site; not given' },
    ],
    sourceIds: ['supertaste-showa-laundry', 'taipei-pictorial-showa-laundry', 'kyoko-showa-laundry', 'upssmile-showa-laundry', 'bella-showa-laundry'],
  },
  {
    id: 'washing',
    type: 'text',
    tab: '洗衣這件事',
    tabEn: 'Doing the laundry',
    title: '洗衣這件事｜臺灣早年的洗衣店與工具',
    titleEn: 'Doing the laundry | Laundries and their tools in earlier Taiwan',
    lead: '這一章寫的是臺灣一般的情形，不是這家洗衣店的史料。',
    leadEn: 'This chapter describes the general picture in Taiwan; it is not the history of this particular laundry.',
    paragraphs: [
      '業界文章轉引《洗染知識寶鑑》：1895年日本官員來臺時帶來洗衣的技術員，臺灣第一家洗衣店在當時的鐵路飯店附近，由日本人經營，本地的學徒要先學五年、再到日本實習兩年才能出師。這些說法只有這一個轉述的來源，本站標「待核」。',
      '同一篇文章整理了洗衣工具的變化：從河邊、井邊用木棒敲打，到在室內用竹刷、波浪形的洗衣板與木桶泡肥皂水搓洗；熨斗從火烤加熱，演變成自動控溫；脫水從手擰到手搖、再到離心式的脫水機。',
      '炭火熨斗：台灣民俗文物館的藏品「初期熨斗」形狀像水瓢、把手接著木棒，用夾子把燒紅的炭火放進圓筒裡，靠金屬的熱與重量燙平衣服；長約37公分、重約1.1公斤。',
    ],
    paragraphsEn: [
      'An industry article citing the Washing and Dyeing Handbook (《洗染知識寶鑑》) says that when Japanese officials came to Taiwan in 1895 they brought laundry technicians with them, that Taiwan’s first laundry stood near the Railway Hotel of the day and was run by a Japanese, and that local apprentices trained for five years and then two more in Japan before qualifying. These claims come from this single secondhand source, so this site marks them “to be verified”.',
      'The same article traces how the tools changed: from beating clothes with a stick by the river or well, to scrubbing indoors with bamboo brushes, ridged washboards and wooden tubs of soapy water; from irons heated over a fire to irons with automatic temperature control; and from wringing by hand to hand-cranked and then centrifugal spin-driers.',
      'The charcoal iron: the “Early iron” (初期熨斗) in the Taiwan Folk Arts Museum is shaped like a water ladle with a wooden handle; red-hot charcoal is put into the drum with tongs, and the heat and weight of the metal press the clothes flat. It is about 37 cm long and weighs about 1.1 kg.',
    ],
    sourceIds: ['mymkc-laundry-history', 'digitalarchives-charcoal-iron'],
  },
  {
    id: 'street',
    type: 'text',
    tab: '安西街',
    tabEn: 'Anxi Street',
    title: '安西街｜從震和街到疏開空地',
    titleEn: 'Anxi Street | From Zhenhe Street to an air-raid clearance',
    lead: '安西街在大稻埕市街的北邊；「安西」這個街名的由來與命名年份，本站沒有查到資料。',
    leadEn: 'Anxi Street lies at the northern edge of the Dadaocheng town; this site has found no record of where the name “Anxi” comes from or when it was given.',
    paragraphs: [
      '一篇2019年的街屋踏查（部落格）研判，安西街在清代就已經存在，當時叫「震和街」，北端連著一座埤塘（今永樂國小一帶）；日治時期整理成筆直、路幅固定的街道。這是單一部落格的研判，本站標「待核」。',
      '戰爭末期，臺北市在1944年11月7日劃定防空的「疎開空地」，其中一處是「永樂町地內 大稻埕公園」（洪致文2014年的研究）。同一篇踏查也寫到，安西街南端在二戰末期拆除大量民房、準備設置公園。今天洗濯屋的對面就是大稻埕公園。',
    ],
    paragraphsEn: [
      'A 2019 survey of the street’s shophouses (a blog) judges that Anxi Street already existed in the Qing period, when it was called Zhenhe Street (震和街), its northern end meeting a pond (around today’s Yongle Elementary School), and that in the Japanese era it was straightened to a fixed width. This is a single blog’s judgement, so this site marks it “to be verified”.',
      'Late in the war, on 7 November 1944, Taipei City designated air-raid “clearance spaces” (疎開空地), one of which was “Dadaocheng Park, within Eiraku-chō” (永樂町地內 大稻埕公園) (Hung Chih-wen’s 2014 study). The same survey notes that at the end of the Second World War many houses at the southern end of Anxi Street were demolished to make way for a park. Dadaocheng Park lies opposite the laundry today.',
    ],
    sourceIds: ['justabalcony-anxi-street', 'hung-2014-air-defense-open-space'],
  },
  {
    id: 'foods',
    type: 'foods',
    tab: '代表食品',
    tabEn: 'Signature foods',
    title: '代表食品｜霜淇淋、三色烤糰子與苦甜布丁',
    titleEn: 'Signature foods | Soft serve, grilled three-colour dango and bittersweet pudding',
    intro: '以下依媒體報導整理店裡常見的品項；口味會隨季節更換，價格與品項以店家實際供應為準。',
    introEn: 'The items below are compiled from press reports of what the shop commonly serves; flavours change with the seasons, and prices and items are subject to what the shop actually offers.',
    items: [
      {
        id: 'soft-serve',
        name: '季節霜淇淋',
        category: '霜淇淋｜每月更換',
        nameEn: 'Seasonal soft serve',
        categoryEn: 'Soft serve | Changes monthly',
        description: '店裡的主角：口味大約每月更換，一次一到兩款，可以選餅乾甜筒或杯裝。報導提過芒果、紅心芭樂、草莓、藍莓等季節水果口味，以及加了威士忌的巧克力「大人口味」。',
        descriptionEn: 'The star of the shop: the flavour changes roughly monthly, one or two at a time, in a wafer cone or a cup. Reports mention seasonal fruit flavours such as mango, red guava, strawberry and blueberry, and an “adult” chocolate flavour with whisky.',
        note: '日本以甜筒販售霜淇淋，一般認為始於1951年7月3日明治神宮外苑的嘉年華，日本的業界團體後來把這天定為「霜淇淋之日」（日本一般背景）。',
        noteEn: 'In Japan, selling soft serve in cones is generally traced to a carnival in the outer gardens of the Meiji Shrine on 3 July 1951; a Japanese industry body later named the day “Soft Cream Day” (general background from Japan).',
      },
      {
        id: 'sanshoku-dango',
        name: '三色烤糰子',
        category: '和菓子｜每日現烤',
        nameEn: 'Grilled three-colour dango',
        categoryEn: 'Wagashi | Grilled daily',
        description: '粉紅、白、綠三色的糰子串，烤過上桌；報導寫店裡每天現烤。山牆的暖簾上寫著「みたらし団子」「だんご」與「火男烤団子」。',
        descriptionEn: 'A skewer of pink, white and green dumplings, grilled before serving; reports say the shop grills them fresh each day. The noren on the gable read “mitarashi dango”, “dango” and “Hyottoko grilled dango”.',
        note: '三色糰子又叫花見糰子：一說三色是櫻花、雪與新綠，另一說是花、雪與新綠；起源常連到豐臣秀吉的醍醐賞花，屬於坊間傳說。',
        noteEn: 'Three-colour dango are also called hanami dango: one account says the colours stand for cherry blossom, snow and fresh green, another for flowers, snow and fresh green; their origin is often linked to Toyotomi Hideyoshi’s blossom-viewing party at Daigo, which is folklore.',
      },
      {
        id: 'bittersweet-pudding',
        name: '昭和苦甜布丁',
        category: '甜點｜焦糖布丁',
        nameEn: 'Showa bittersweet pudding',
        categoryEn: 'Dessert | Caramel pudding',
        description: '媒體形容是「大人口味」的布丁，淋上深色的焦糖醬，也有外帶的禮盒。做法店家沒有公開，本站不寫。',
        descriptionEn: 'Described in the press as an “adult-flavoured” pudding topped with dark caramel sauce, also sold in takeaway gift boxes. The shop has not published how it is made, so this site does not say.',
      },
    ],
    footnote: '標示「文獻小記」的內容整理自所列資料；三色糰子的起源屬於坊間傳說。季節口味、價格與品項以店家實際供應為準。',
    footnoteEn: 'Content marked “Documentary note” is compiled from the sources listed; the origin of three-colour dango is folklore. Seasonal flavours, prices and items are subject to what the shop actually offers.',
    sourceIds: ['funliday-showa-laundry', 'bella-showa-laundry', 'upssmile-showa-laundry', 'pbear-showa-laundry', 'zatsuneta-softcream-day', 'delishkitchen-sanshoku-dango', 'hamburg-embassy-sanshoku-dango'],
  },
  {
    id: 'sources',
    type: 'sources',
    tab: '參考文獻',
    tabEn: 'References',
    title: '參考文獻',
    titleEn: 'References',
    intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/showa-laundry.md。',
    introEn: 'This shop’s introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project’s docs/research/showa-laundry.md.',
    sourceIds: SHOWA_SOURCE_IDS,
    disclaimer:
      '昭和浪漫洗濯屋的外觀與一樓依使用者提供的照片建模，尺寸由照片估算，長立面比真實少一個開間；二樓閣樓不開放。店的位置是配合本站街道的敘事安排。後場的木桶、洗衣板與碗櫥上的炭火熨斗是情境示意。「僑隆洗染」舊招牌是使用者現場確認（2026-11-02），不是文獻出處。店裡的人物不具名，對白標示「有出處」「坊間傳說」或「虛構對白」，不代表店家。',
    disclaimerEn:
      'The exterior and ground floor of the Showa Roman Laundry are modelled from photographs supplied by the user; dimensions are estimated from the photographs and the long frontage has one bay fewer than the real one; the upstairs loft is closed. The shop’s location is a narrative arrangement to fit this site’s street. The wooden tub, washboard and the charcoal iron on the cupboard are scenario illustrations. The old “Qiaolong Laundry and Dyeing” sign was confirmed on site by the user (2 November 2026) and is not a documentary source. The people in the shop are unnamed and their lines are labelled “sourced”, “folklore” or “fictional dialogue”; they do not speak for the shop.',
  },
]
