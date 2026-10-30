/**
 * 主題路線「老屋裡的新生活」（第 12 階段）：同一棟房子怎麼換了用途。跨年代的路線（節點各自指定 eraId）：
 * - 迪化街 329 號：1930 年代的米行碾米間（摩登）→ 今天的稻舍（老屋新生）
 * - 十字軒：戰後的糕餅店（庶民生活）
 * - 新芳春：從茶行到文化館（老屋新生）
 * - 小藝埕：從屈臣氏大藥房到藝埕系列的第一棟（老屋新生）
 *
 * 史實沿用各店家的查證（docs/research/xin-fang-chun.md、xiao-yi-cheng.md、riceAndShineData.js 的 RICE_FACTS、
 * shizixuanData.js），器物的形制依臺史博典藏；查證紀錄見 docs/research/old-house-route.md。
 * 路人不具名、不是店家的人；329 號的兩個年代沿用店屋裡原本的人物（riceAndShineExterior.js 的 RICE_NPCS）。
 */

/* ── 情境人物（data/routeFigures.js 合併） ── */
export const OLD_HOUSE_FIGURES = [
  // 戰後的十字軒（北側街屋）門前：來買餅的鄰居，面向店面
  { id: 'old-house-szx', eraId: 'postwar', look: 'postwarDiner', pose: 'stand', position: [-11.0, -2.3], rotationY: Math.PI + 0.4 },
  // 老屋新生的新芳春（南側街屋）門前：來參觀的人，面向店面
  { id: 'old-house-xfc', eraId: 'revival', look: 'revivalCustomer', pose: 'phone', position: [-25.2, 2.3], rotationY: -0.4 },
  // 老屋新生的小藝埕轉角（迪化街入口）：看著洋樓立面的人
  { id: 'old-house-artyard', eraId: 'revival', look: 'revivalDinerBackpack', pose: 'stand', position: [32.6, -0.9], rotationY: Math.PI + 0.5 },
]

const route = (id) => `route-${id}`

/* ── 路人對話（格式見 game/talk.js） ── */
export const OLD_HOUSE_TALK = [
  {
    id: 'old-house-mill',
    eraId: 'modern',
    npcId: 'rice-riceMill-miller',
    role: '碾米間的工人',
    roleEn: 'A rice-mill hand',
    doing: '滿身米糠，正在顧碾好的米',
    doingEn: 'Covered in bran, minding the freshly milled rice',
    objectId: 'winnowing-fan',
    lines: [
      {
        text: '米糠飛得滿頭都是——碾米間就是這樣，咳兩聲就習慣了。',
        textEn: 'Bran in my hair, bran everywhere—that’s a rice mill for you. You cough a bit and get used to it.',
        label: 'fiction',
      },
      {
        text: '迪化街北段是碾米行聚集的地方，全盛的時候將近五十家。',
        textEn: 'The north end of Dihua Street is where the rice mills cluster—nearly fifty of them at the peak.',
        label: 'sourced',
        sourceIds: ['traveler-2019-rice-shine'],
      },
    ],
    followUps: [
      {
        id: 'fan',
        question: '那個木頭大箱子是做什麼的？',
        questionEn: 'What’s that big wooden box?',
        lines: [
          {
            text: '風鼓啊。稻穀從上面的斗倒進去，一手搖風鼓手、一手抽開擋板，飽滿的穀粒從底下的出口流出來，空殼和雜物被風吹走。',
            textEn: 'A winnower. Pour the grain into the hopper, turn the crank with one hand and pull the gate with the other—the full grains run out below and the wind blows the husks and chaff away.',
            label: 'sourced',
            sourceIds: ['nmth-winnower-2000-003-0001'],
          },
          {
            text: '傳統的風鼓靠人力搖把手；歷史博物館有一張 1960 年代前期的照片，拍的才是外面裝了馬達、齒輪和皮帶的改良風鼓車。',
            textEn: 'A traditional winnower is cranked by hand; a museum photograph from the early 1960s shows an improved one driven by a motor, gears and a belt.',
            label: 'sourced',
            sourceIds: ['nmth-motor-winnower'],
          },
        ],
      },
      {
        id: 'house',
        question: '這間米行開很久了嗎？',
        questionEn: 'Has this rice shop been here long?',
        lines: [
          {
            text: '這棟店屋是明治年間蓋的，和隔壁 331 號原本是相通的，做的是米的生意。',
            textEn: 'The shophouse went up in the Meiji years, and it used to open through to No. 331 next door—all of it in the rice trade.',
            label: 'sourced',
            sourceIds: ['moc-329-shophouse'],
          },
          {
            text: '前面一進的一樓，左邊擺大型碾米機，右邊堆白米。',
            textEn: 'On the ground floor of the front hall, the big milling machine stands on the left and the white rice is piled on the right.',
            label: 'sourced',
            sourceIds: ['traveler-2019-rice-shine'],
          },
        ],
      },
    ],
  },
  {
    id: 'old-house-shine',
    eraId: 'revival',
    npcId: 'rice-riceAndShineModern-diner-a',
    role: '在老米行裡吃飯的客人',
    roleEn: 'A diner in the old rice shop',
    doing: '一邊吃飯，一邊看牆上的說明',
    doingEn: 'Reading the wall notes between mouthfuls',
    objectId: 'rice-ledger',
    lines: [
      {
        text: '第一次在米行的老房子裡吃飯，連碗裡的米都覺得特別香。',
        textEn: 'My first meal inside an old rice shop—even the rice in my bowl tastes better.',
        label: 'fiction',
      },
      {
        text: '牆上寫，這棟店屋是臺北市的歷史建築，二〇二〇年登錄，資料記的建立年代是一九〇七年。',
        textEn: 'The notes say this shophouse is a listed historic building of Taipei, registered in 2020, with a recorded construction date of 1907.',
        label: 'sourced',
        sourceIds: ['moc-329-shophouse'],
      },
    ],
    followUps: [
      {
        id: 'reuse',
        question: '米行怎麼變成餐廳的？',
        questionEn: 'How did a rice shop become a restaurant?',
        lines: [
          {
            text: '報導說，負責人介紹這裡的前身是一九一六年開的米行；後代在二〇一四年把老屋捐給臺北市政府。',
            textEn: 'Reports quote the manager: it began as a rice shop founded in 1916, and the family’s descendants gave the house to the city in 2014.',
            label: 'sourced',
            sourceIds: ['taiwannews-2022-rice-shine'],
          },
          {
            text: '營運團隊修復老屋，保留碾米廠的氛圍，陳列碾米機，做稻米文化的展覽和米食餐飲。',
            textEn: 'The team restored the house, kept the mill’s atmosphere, put the milling machines on show, and runs rice-culture exhibitions and rice dishes.',
            label: 'sourced',
            sourceIds: ['pts-2022-rice-shine', 'taiwannews-2022-rice-shine'],
          },
        ],
      },
      {
        id: 'ledger',
        question: '以前的米行怎麼記帳？',
        questionEn: 'How did the old rice shops keep accounts?',
        lines: [
          {
            text: '歷史博物館收著臺北兩家米店的帳冊，一套七十二冊；其中一本藍色封面、棉線裝訂，大概是大正年間的。',
            textEn: 'The history museum keeps the ledgers of two Taipei rice shops, seventy-two volumes in all; one has a blue cover and cotton-thread binding, from around the Taishō years.',
            label: 'sourced',
            sourceIds: ['nmth-rice-ledger'],
          },
          {
            text: '這裡當年的帳本還在不在，我就不知道了。',
            textEn: 'Whether this shop’s own books survived, I couldn’t tell you.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'old-house-szx',
    eraId: 'postwar',
    npcId: route('old-house-szx'),
    role: '來買餅的鄰居',
    roleEn: 'A neighbour buying cakes',
    doing: '在十字軒門口等著包餅',
    doingEn: 'Waiting outside Shizixuan for his cakes to be wrapped',
    objectId: 'longevity-cake-mould',
    lines: [
      {
        text: '對面阿伯下禮拜做壽，我來幫忙訂糕餅。',
        textEn: 'The old man across the way has his birthday next week—I’m here to order the cakes for him.',
        label: 'fiction',
      },
      {
        text: '報導寫，這家店的創辦人十二歲就到日本人開的麵包店學藝，先賣西點麵包，後來才接做婚嫁用的漢餅。',
        textEn: 'A report says the founder learned the trade at twelve in a Japanese-run bakery, sold Western bread and pastries first, and only later took on Han-style wedding cakes.',
        label: 'sourced',
        sourceIds: ['mirrormedia-2024-shizixuan'],
      },
    ],
    followUps: [
      {
        id: 'peak',
        question: '生意一直都這麼好嗎？',
        questionEn: 'Has business always been this good?',
        lines: [
          {
            text: '同一篇報導說，全盛的時候漢餅、西點、包子分開設廠，師傅將近二十位。',
            textEn: 'The same report says that at its height the Han cakes, Western pastries and buns each had their own workshop, with nearly twenty bakers.',
            label: 'sourced',
            sourceIds: ['mirrormedia-2024-shizixuan'],
          },
          {
            text: '從麵包到漢餅、壽桃，店還是那間店，賣的東西跟著街坊的需要在變。',
            textEn: 'From bread to Han cakes and longevity buns—same shop, but what it sells keeps changing with what the neighbourhood needs.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'mould',
        question: '做壽的糕餅是怎麼印花樣的？',
        questionEn: 'How do they print the patterns on birthday cakes?',
        lines: [
          {
            text: '用木頭刻的餅印。歷史博物館有一件桃形、中間刻「壽」字的，大概是一九六〇到八〇年代的，專門做神明生日或做壽的糕餅。',
            textEn: 'With carved wooden moulds. The history museum has a peach-shaped one with “longevity” in the middle, from around the 1960s–80s, made for gods’ birthdays and elders’ birthday cakes.',
            label: 'sourced',
            sourceIds: ['nmth-cake-mould-2012-019-0010'],
          },
        ],
      },
    ],
  },
  {
    id: 'old-house-xfc',
    eraId: 'revival',
    npcId: route('old-house-xfc'),
    role: '來參觀老茶行的人',
    roleEn: 'A visitor to the old tea house',
    doing: '在新芳春門口查開放時間',
    doingEn: 'Checking the opening hours outside Xinfangchun',
    objectId: 'baozhong-tin',
    lines: [
      {
        text: '以前這裡是做茶的，現在變成可以免費進去看的老茶行。',
        textEn: 'This used to be a working tea house—now it’s an old tea firm you can walk into for free.',
        label: 'fiction',
      },
      {
        text: '官方登錄寫，這棟約建於一九三〇年代，是大稻埕茶外銷南洋的地點之一，茶行、烘焙茶工廠、倉庫和主人住宅都在同一棟裡。',
        textEn: 'The heritage record says it dates from about the 1930s, one of Dadaocheng’s tea exporters to Southeast Asia—shop, roasting works, warehouse and family home all under one roof.',
        label: 'sourced',
        sourceIds: ['nchdb-xinfangchun'],
      },
    ],
    followUps: [
      {
        id: 'museum',
        question: '茶行怎麼變成可以參觀的地方？',
        questionEn: 'How did a tea firm become a place to visit?',
        lines: [
          {
            text: '報導寫，二〇一一到二〇一五年修復，原屋主把它捐給臺北市政府；文化局二〇一六年接管，九月起對外開放。',
            textEn: 'Reports say it was restored from 2011 to 2015 and donated to the city by its owner; the Department of Cultural Affairs took it over in 2016 and opened it that September.',
            label: 'sourced',
            sourceIds: ['zsdo-xinfangchun-2020', 'pts-xinfangchun-2016'],
          },
        ],
      },
      {
        id: 'baozhong',
        question: '「包種茶」為什麼叫包種？',
        questionEn: 'Why is it called “baozhong”—“wrapped kind”?',
        lines: [
          {
            text: '農業周刊寫，從前用兩張方形的毛邊紙內外相襯，包進四兩茶葉，包成長方形的四方包，外面蓋上茶名和行號的印章，所以叫「包種」。',
            textEn: 'The Agriculture Weekly explains: two square sheets of rough paper, one inside the other, wrapped round four taels of tea into an oblong packet, stamped with the tea’s name and the firm’s seal—hence “baozhong.”',
            label: 'sourced',
            sourceIds: ['moa-baozhong-weekly'],
          },
          {
            text: '歷史博物館還收著一只這家茶行的包種茶罐：金屬方罐，貼紙上印著行號，手寫「包種茶」。',
            textEn: 'The history museum even has one of this firm’s baozhong tins: a square metal can with the firm’s printed label and “baozhong” written by hand.',
            label: 'sourced',
            sourceIds: ['nmth-xfc-tea-tin'],
          },
        ],
      },
    ],
  },
  {
    id: 'old-house-artyard',
    eraId: 'revival',
    npcId: route('old-house-artyard'),
    role: '看著洋樓立面的人',
    roleEn: 'Someone admiring the corner building',
    doing: '站在迪化街口，抬頭看轉角的洋樓',
    doingEn: 'Standing at the mouth of Dihua Street, looking up at the corner building',
    objectId: 'pharmacy-bottles',
    lines: [
      {
        text: '你看這棟洗石子的洋樓——聽說以前是賣西藥的。',
        textEn: 'Look at this washed-stone building—they say it used to sell Western medicine.',
        label: 'fiction',
      },
      {
        text: '《台北畫刊》寫，這是日治時期的屈臣氏大藥房，一九二八年（一說一九一七年）興建，以批發進口西藥為主。',
        textEn: 'Taipei Pictorial says this was the Watson’s pharmacy of the Japanese era, built in 1928 (some say 1917), mainly wholesaling imported Western medicine.',
        label: 'sourced',
        sourceIds: ['taipei-pictorial-watson'],
      },
    ],
    followUps: [
      {
        id: 'artyard',
        question: '現在變成什麼了？',
        questionEn: 'What is it now?',
        lines: [
          {
            text: '報導說，二〇一〇年屋主點頭出租，二〇一一年這裡成了「小藝埕」，是藝埕系列的第一棟，裡頭有設計品店、書店、咖啡店和劇場。',
            textEn: 'Reports say the owner agreed to lease it in 2010, and in 2011 it became Xiao Yi Cheng—the first of the ArtYard houses, with design shops, a bookshop, a café and a theatre.',
            label: 'sourced',
            sourceIds: ['gvm-2013-artyard', 'businesstoday-2012-watson', 'artyard-about'],
          },
          {
            text: '樓上樓下的店，隔幾年就換一換——房子還是那棟房子。',
            textEn: 'The shops upstairs and down change every few years—the building stays the same.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'pharmacy',
        question: '日本時代的藥房是什麼樣子？',
        questionEn: 'What was a pharmacy like in the Japanese era?',
        lines: [
          {
            text: '歷史博物館的說明寫，依一八九六年的規則，「藥局」要有藥劑師才能調劑；「藥房」向官廳申請就能賣洋藥和漢藥的成藥，門口要掛寫著店名、地址的牌子。',
            textEn: 'A museum note explains that under the 1896 rules a “pharmacy” needed a licensed pharmacist to dispense, while a “drugstore” only needed a permit to sell Western and Chinese patent medicines—and had to hang a sign with its name and address by the door.',
            label: 'sourced',
            sourceIds: ['nmth-pharmacy-flyer'],
          },
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/oldHouseObjects.js） ── */
export const OLD_HOUSE_OBJECTS = {
  'winnowing-fan': {
    id: 'winnowing-fan',
    title: '風鼓',
    titleEn: 'Winnowing fan',
    lead: '倒梯形的斗、方形的櫃、圓形的風鼓肚與一支搖柄：搖起來，空殼與雜物被風吹走，飽滿的穀粒從底下流出來。',
    leadEn: 'A wedge-shaped hopper, a square box, a round drum and a crank: turn it, and the wind carries off the husks while the full grains run out below.',
    actions: [{ id: 'crank', label: '搖風鼓', labelEn: 'Turn the crank', doneLabel: '停下來', doneLabelEn: 'Stop' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「風鼓車」（2000.003.0001）：木質，長 77.2、寬 139.8、高 129.1 公分，重 36 公斤。先把風乾的穀粒倒進上方的風鼓斗，一手搖動風鼓手、一手抽開風鼓掩，讓穀粒落進風鼓櫃；風鼓葉轉動起風，結實的穀粒從頭皂、二皂流出，空殼與雜物被吹出風鼓口。館方引臺灣總督府殖產局《臺灣之農具》（1921）。',
      '同館另一筆「風鼓車製造情形」照片（推測 1961–1965 年）的說明：傳統風鼓車的把手是人力手搖，改良的風鼓車在外面裝設馬達、齒輪及皮帶。原件斗上的店號與紅紙不畫；各部位的比例是依尺寸與文字重建，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s winnowing cart (2000.003.0001): wood, 77.2 × 139.8 × 129.1 cm, 36 kg. Dried grain goes into the hopper; one hand turns the crank while the other opens the gate, the fan raises a wind, full grains flow from the two outlets and husks and chaff blow out of the mouth. The museum cites the 1921 Government-General survey of Taiwanese farm tools.',
      'A museum photograph of winnower-making (about 1961–1965) notes that traditional winnowers were hand-cranked while improved ones added a motor, gears and a belt. The shop name and red paper on the original are left off; proportions are reconstructed from the measurements and text.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-winnower-2000-003-0001', 'nmth-motor-winnower'],
  },
  'rice-ledger': {
    id: 'rice-ledger',
    title: '米店的帳冊',
    titleEn: 'A rice shop’s ledger',
    lead: '藍色封面、棉線裝訂的帳本：每天進了多少米、賣了多少，一行一行直著寫。',
    leadEn: 'A thread-bound ledger in a blue cover: how much rice came in and went out each day, written in vertical columns.',
    actions: [{ id: 'open', label: '翻開帳冊', labelEn: 'Open the ledger', doneLabel: '闔上', doneLabelEn: 'Close it' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏的瑞興號米店帳冊（2010.015.0220.0067；瑞興號與錦瑞號米店帳冊全套 72 冊）：19.8 × 19.1 × 1.4 公分，棉線裝訂、前後藍色封面，日本時代，內頁有「庚申」字樣（館方對照同套的「大正九年庚申」，約 1920 年）。',
      '那是另一家米店的帳冊，不是迪化街 329 號的；329 號當年的帳冊有沒有留下來，查無。內頁的帳目是示意的色塊，不寫字，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on a Ruixing rice shop ledger in the National Museum of Taiwan History (2010.015.0220.0067, part of a 72-volume set from two Taipei rice shops): 19.8 × 19.1 × 1.4 cm, cotton-thread binding, blue covers, Japanese era, marked with a year the museum dates to about 1920.',
      'It belongs to a different shop, not No. 329, whose own books are not known to survive. The entries are shown as blank marks, not text—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-rice-ledger'],
  },
  'longevity-cake-mould': {
    id: 'longevity-cake-mould',
    title: '壽字桃形餅印',
    titleEn: 'Peach-shaped longevity cake mould',
    lead: '酒瓶形的木頭餅印：桃形的外圈、中央一個「壽」字——印在糕餅上，就是給神明或長輩祝壽的點心。',
    leadEn: 'A bottle-shaped wooden mould: a peach outline with “longevity” at its heart—pressed into a cake for a god’s or an elder’s birthday.',
    actions: [{ id: 'press', label: '掀起餅印', labelEn: 'Lift the mould', doneLabel: '蓋回去', doneLabelEn: 'Press it back' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「酒瓶形單面雕桃形壽字紋帶柄餅印」（2012.019.0010）：木質，22.1 × 11.7 × 3.1 公分，推測 1960–1980 年；桃形外圈、中央刻「壽」字、周圍是桃葉花草，館方說明是製作神誕或壽慶糕餅的模具。',
      '這件餅印不是十字軒的器物；十字軒戰後店面的樣子，報導沒有記載，場景是依一般糕餅店重建的情境示意。柄尾的紅絲帶是捐贈者後加的，不畫；紋樣簡化，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s bottle-shaped single-faced longevity peach mould (2012.019.0010): wood, 22.1 × 11.7 × 3.1 cm, about 1960–1980, a peach outline around the character “longevity” with leaves and flowers, made for cakes for gods’ and elders’ birthdays.',
      'It is not Shizixuan’s own mould; the shop’s postwar interior is not recorded, so the scene is a general bakery. The donor’s red ribbon is omitted and the carving simplified—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-cake-mould-2012-019-0010', 'mirrormedia-2024-shizixuan'],
  },
  'baozhong-tin': {
    id: 'baozhong-tin',
    title: '包種茶罐與四方包',
    titleEn: 'Baozhong tin and paper packet',
    lead: '金屬方罐、一面貼著表格的標籤；打開罐蓋，裡頭是用毛邊紙包成、蓋了紅印的四方包。',
    leadEn: 'A square metal tin with a ruled label; open it and inside is the paper-wrapped, red-stamped packet that gave baozhong its name.',
    actions: [{ id: 'open', label: '打開罐蓋', labelEn: 'Open the tin', doneLabel: '蓋回去', doneLabelEn: 'Close it' }],
    paragraphs: [
      '茶罐依國立臺灣歷史博物館典藏「新芳春茶行包種茶茶罐」（2019.031.0393）：金屬方罐，8.6 × 8.5 × 9.5 公分，推測 1932–1945 年，一面貼紙印著「合資會社新芳春茶行」與「品名」，手寫「包種茶」。館方編目說明，1932 年改組為合資會社，主要經營包種茶外銷東南亞。標籤上的字在模型裡不畫。',
      '四方包依《農業周刊》第 15 卷第 34 期〈文山包種茶 清香最誘人〉：用方形福建毛邊紙兩張內外相襯，放入茶葉四兩，包成長方形的四方包，外面蓋上茶名及行號印章，因此稱為「包種」。紙包的大小與印章的樣子是示意，是歷史情境重建。',
    ],
    paragraphsEn: [
      'The tin follows the National Museum of Taiwan History’s Xinfangchun baozhong tin (2019.031.0393): metal, 8.6 × 8.5 × 9.5 cm, about 1932–1945, with a label printed with the firm’s name and “product” and “baozhong” added by hand. The museum notes the firm became a limited partnership in 1932 exporting baozhong to Southeast Asia. The label text is not reproduced.',
      'The packet follows Agriculture Weekly (vol. 15, no. 34): two square sheets of Fujian rough paper, four taels of tea, folded into an oblong packet stamped with the tea’s name and the firm’s seal—hence “baozhong.” Size and stamp are illustrative—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-xfc-tea-tin', 'moa-baozhong-weekly', 'nchdb-xinfangchun'],
  },
  'pharmacy-bottles': {
    id: 'pharmacy-bottles',
    title: '藥房的玻璃藥瓶',
    titleEn: 'Pharmacy bottles',
    lead: '透明的方瓶配木蓋、褐色的小藥瓶、塞著軟木塞的細瓶——標籤空白，裝的是什麼藥，就要問藥房了。',
    leadEn: 'A clear square bottle with a wooden cap, a small brown phial and a slim clear vial with a cork—the labels are blank; ask the pharmacist what’s inside.',
    actions: [{ id: 'uncork', label: '拔起瓶塞', labelEn: 'Pull the stoppers', doneLabel: '塞回去', doneLabelEn: 'Put them back' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏的藥瓶：透明玻璃瓶配木蓋（2004.028.5685，3.6 × 3.6 × 7.9 公分，年代不明）、褐色玻璃小藥瓶附蓋（2019.036.0022.0002，2.6 × 2.6 × 4.4 公分，1926–1965 年間）；第三只軟木塞細瓶依藝術與建築索引典「藥鋪瓶」的一般形制：藥舖用的瓶子多為玻璃製，配玻璃塞或軟木塞，內容物的名稱用標籤或鑄在玻璃上。',
      '這幾只藥瓶不是屈臣氏大藥房的器物；商標與包裝都不複製，標籤留白，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on bottles in the National Museum of Taiwan History: a clear bottle with a wooden cap (2004.028.5685, 3.6 × 3.6 × 7.9 cm, undated) and a small brown capped bottle (2019.036.0022.0002, 2.6 × 2.6 × 4.4 cm, 1926–1965); the corked vial follows the Art & Architecture Thesaurus entry for apothecary bottles—mostly glass, with glass or cork stoppers and contents named on a label or cast into the glass.',
      'None of these came from the Watson’s pharmacy; no trademarks or packaging are copied and the labels are blank—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-medicine-bottles', 'aat-apothecary-bottle'],
  },
}

/* ── 路線 ── */
export const OLD_HOUSE_ROUTE = {
  id: 'old-house',
  title: '老屋裡的新生活',
  titleEn: 'New Lives in Old Houses',
  intro: '同一棟房子，換了好幾種用途：迪化街 329 號從碾米的米行到今天的餐廳，十字軒的糕餅跟著街坊的需要在變，新芳春從茶行變成可以參觀的老茶行，屈臣氏大藥房的洋樓變成了小藝埕。這條路線要走過三個年代。',
  introEn: 'One building, many lives: No. 329 Dihua Street from rice mill to restaurant, Shizixuan’s cakes changing with its neighbours, Xinfangchun from tea firm to open house, and the Watson’s pharmacy building turned Xiao Yi Cheng. This route crosses three eras.',
  closing: '米行的風鼓、帳冊，糕餅店的餅印，茶行的茶罐，藥房的藥瓶——房子還在，裡頭的生活換了好幾輪。老屋新生不是回到從前，而是讓下一種生活住進來；每一棟的來歷都各有出處，彼此沒有關係。',
  closingEn: 'A rice mill’s winnower and ledger, a bakery’s mould, a tea firm’s tin, a pharmacy’s bottles: the buildings remain while the lives inside them change. Renewal is not a return to the past but room for the next life—each building with its own, separate story.',
  eraId: 'modern',
  nodes: [
    {
      id: 'mill',
      kind: 'talk',
      eraId: 'modern',
      journalIds: ['talk:old-house-mill', 'object:winnowing-fan'],
      title: '329 號：碾米間',
      titleEn: 'No. 329: the rice mill',
      hint: '摩登大稻埕：街東段南側的米行碾米間，走進去找滿身米糠的工人。',
      hintEn: 'In the 1930s: step into the rice mill on the south side of the east end and find the bran-covered hand.',
      npcIds: ['rice-riceMill-miller'],
      shopId: 'rice-and-shine-329',
    },
    {
      id: 'shine',
      kind: 'talk',
      eraId: 'revival',
      journalIds: ['talk:old-house-shine', 'object:rice-ledger'],
      title: '329 號：稻舍',
      titleEn: 'No. 329: Rice & Shine',
      hint: '老屋新生：同一棟店屋現在是稻舍，跟在裡頭吃飯的客人聊聊。',
      hintEn: 'Today the same shophouse is Rice & Shine—chat with a diner inside.',
      npcIds: ['rice-riceAndShineModern-diner-a'],
      shopId: 'rice-and-shine-329',
    },
    {
      id: 'szx',
      kind: 'talk',
      eraId: 'postwar',
      journalIds: ['talk:old-house-szx', 'object:longevity-cake-mould'],
      title: '十字軒：跟著街坊變的糕餅',
      titleEn: 'Shizixuan: cakes that change with the street',
      hint: '庶民生活：北側街屋的十字軒門口，鄰居在等著包餅。',
      hintEn: 'Postwar: outside Shizixuan on the north side, a neighbour waits for his cakes.',
      npcIds: [route('old-house-szx')],
      shopId: 'shizixuan',
    },
    {
      id: 'xfc',
      kind: 'talk',
      eraId: 'revival',
      journalIds: ['talk:old-house-xfc', 'object:baozhong-tin'],
      title: '新芳春：從茶行到文化館',
      titleEn: 'Xinfangchun: from tea firm to open house',
      hint: '老屋新生：街西段南側的新芳春門口，有人在查開放時間。',
      hintEn: 'Today: outside Xinfangchun on the south side of the west end, someone checks the opening hours.',
      npcIds: [route('old-house-xfc')],
      shopId: 'xin-fang-chun',
    },
    {
      id: 'artyard',
      kind: 'talk',
      eraId: 'revival',
      journalIds: ['talk:old-house-artyard', 'object:pharmacy-bottles'],
      title: '小藝埕：從藥房到藝埕',
      titleEn: 'Xiao Yi Cheng: from pharmacy to ArtYard',
      hint: '老屋新生：街的東端、迪化街口的轉角洋樓前，有人抬頭在看。',
      hintEn: 'Today: at the corner building where Dihua Street begins, someone is looking up.',
      npcIds: [route('old-house-artyard')],
      shopId: 'luguo-cafe',
    },
  ],
}
