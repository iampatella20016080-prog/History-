/**
 * 主題路線「廟口的一餐」（第 12 階段）：庶民生活（1945–1980）的慈聖宮廟埕，
 * 拜完媽祖在廟口吃一頓——榕樹下的一只碗、魷魚羹、米苔目與豆花。
 *
 * 廟口的攤位都是「情境示意」（第 6 階段的結論）：不使用任何現存攤商的店名、攤主與年份，
 * 路人與攤販都是虛構的情境人物。查證紀錄見 docs/research/temple-meal-route.md 與 ci-sheng-gong-miaokou.md。
 *
 * 標示（CLAUDE.md）：
 * - 有出處：辭典、政府統計、博物館典藏、研究與報導的內容（附 sourceIds；專欄作者的說法另外註明）
 * - 坊間傳說：俗諺
 * - 虛構對白：攤販與客人自己的事
 * 米苔目攤與豆花攤沿用攤位裡原本的攤販（templeMiTaiMuStall.js、templeDouhuaStall.js 的 npcs）。
 */

const ERA = 'postwar'

/* ── 情境人物（data/routeFigures.js 合併） ── */
export const TEMPLE_MEAL_FIGURES = [
  // 廟埕東側、米苔目攤與糕粿攤之間（不佔中央通道與看廟門的視線）：拜完媽祖的阿婆
  { id: 'temple-meal-elder', eraId: ERA, look: 'postwarDinerWoman', pose: 'stand', position: [5.6, 7.6], rotationY: Math.PI * 0.6 },
  // 魷魚羹攤旁的街邊：等一碗魷魚羹的南北貨行夥計，面向攤位
  { id: 'temple-meal-squid', eraId: ERA, look: 'postwarCustomer', pose: 'stand', position: [-2.4, 2.0], rotationY: Math.PI * 0.2 },
]

const route = (id) => `route-${id}`

/* ── 路人對話（格式見 game/talk.js） ── */
export const TEMPLE_MEAL_TALK = [
  {
    id: 'temple-meal-elder',
    eraId: ERA,
    npcId: route('temple-meal-elder'),
    role: '拜完媽祖的阿婆',
    roleEn: 'A grandmother after her prayers',
    doing: '在廟埕歇腳，等著吃一碗點心',
    doingEn: 'Resting in the temple square before a snack',
    objectId: 'blue-white-bowl',
    lines: [
      {
        text: '拜完媽祖，腳酸了，在廟口吃一碗再回去——這是我的老習慣。',
        textEn: 'Prayers done, legs tired—a bowl of something at the temple front before heading home. That’s my old habit.',
        label: 'fiction',
      },
      {
        text: '這間媽祖廟是同安人從艋舺帶過來的，日本時代市區改正，才搬到這條街上。',
        textEn: 'The Tong’an people brought this Mazu temple over from Bangka; it only moved to this street when the Japanese replanned the town.',
        label: 'sourced',
        sourceIds: ['sinica-gis-2025-cisheng'],
      },
    ],
    followUps: [
      {
        id: 'stalls',
        question: '廟口怎麼會有這麼多攤子？',
        questionEn: 'Why so many stalls in front of the temple?',
        lines: [
          {
            text: '政府的統計說，攤販本來就是從以前農業社會的市集、廟會延續下來的。',
            textEn: 'The government’s statistics office says street stalls grew out of the markets and temple fairs of the old farming society.',
            label: 'sourced',
            sourceIds: ['stat-gov-hawker-survey'],
          },
          {
            text: '有一份研究寫，這裡大約民國五十年間香火旺，攤子就聚成了市集——不過還要再查證。',
            textEn: 'One study says that around 1961, with the temple so busy, the stalls gathered into a market—though that still needs checking.',
            label: 'sourced',
            sourceIds: ['sinica-gis-2025-cisheng'],
          },
        ],
      },
      {
        id: 'bowl',
        question: '這只碗好漂亮。',
        questionEn: 'What a pretty bowl.',
        lines: [
          {
            text: '白底青花的碗，小吃攤最常見；鶯歌的窯場一九五〇年代還靠手工拉坯、手繪花樣。',
            textEn: 'White bowls with blue painting are what every snack stall uses; in the 1950s the Yingge kilns still threw and painted them by hand.',
            label: 'sourced',
            sourceIds: ['twreporter-2021-snack-bowl', 'taiwanceramics-yingge-bowl'],
          },
          {
            text: '以前圓環那邊的攤子，碗都長一樣，常常拿錯；後來才有人在碗上燒店號。',
            textEn: 'At the stalls round the Circle all the bowls looked alike and got mixed up—later people had the stall’s name fired onto them.',
            label: 'sourced',
            sourceIds: ['twreporter-2021-snack-bowl'],
          },
        ],
      },
      {
        id: 'weather',
        question: '媽祖生快到了嗎？',
        questionEn: 'Is Mazu’s birthday coming up?',
        lines: [
          {
            text: '三月廿三啦。到時候廟口擠得水洩不通，攤子一路擺到街上。',
            textEn: 'The twenty-third of the third month. The temple front will be packed, stalls all the way into the street.',
            label: 'fiction',
          },
          {
            text: '老人講「大道公風，媽祖婆雨」——媽祖生那幾天，常常會落雨。',
            textEn: 'The old saying goes, “Wind for the Great Emperor, rain for Mazu”—her birthday often brings rain.',
            label: 'folklore',
          },
        ],
      },
    ],
  },
  {
    id: 'temple-meal-squid',
    eraId: ERA,
    npcId: route('temple-meal-squid'),
    role: '南北貨行的夥計',
    roleEn: 'A dry-goods shop assistant',
    doing: '午休溜出來，等一碗魷魚羹',
    doingEn: 'Slipped out at lunch for a bowl of squid soup',
    objectId: 'squid-soup-bowl',
    lines: [
      {
        text: '店裡忙到現在，老闆准我出來吃一碗魷魚羹，吃完就要回去搬貨。',
        textEn: 'Busy since dawn. The boss let me out for a bowl of squid soup—then back to hauling crates.',
        label: 'fiction',
      },
      {
        text: '有專欄作者說，魷魚羹大約七〇年代在萬華、大稻埕這一帶興起，乾魷魚的貨源迪化街就在旁邊。',
        textEn: 'One columnist says squid soup took off around Wanhua and Dadaocheng in the 1970s—with Dihua Street, where the dried squid comes from, right next door.',
        label: 'sourced',
        sourceIds: ['mirror-2025-squid'],
      },
    ],
    followUps: [
      {
        id: 'soak',
        question: '乾魷魚怎麼變軟的？',
        questionEn: 'How does dried squid get soft again?',
        lines: [
          {
            text: '要泡發：同一篇專欄訪問的水產行老闆說，祕訣是食用小蘇打；通常泡一次，有的店為了讓魷魚看起來更厚，會泡兩次。',
            textEn: 'It has to be soaked: a seafood dealer in the same column says the secret is food-grade baking soda—usually one soak, though some shops soak twice to make the squid look thicker.',
            label: 'sourced',
            sourceIds: ['mirror-2025-squid'],
          },
        ],
      },
      {
        id: 'kenn',
        question: '「羹」是什麼意思？',
        questionEn: 'What makes it a “geng”?',
        lines: [
          {
            text: '辭典寫，魷魚羹就是用魷魚做成的羹湯——羹是勾了芡、濃稠的湯。',
            textEn: 'The dictionary says squid soup is a geng made with squid—a thick, starch-thickened broth.',
            label: 'sourced',
            sourceIds: ['moe-jiu-hi-kenn', 'moe-kenn'],
          },
          {
            text: '我愛多加一點烏醋，老闆每次都瞪我。',
            textEn: 'I like an extra splash of black vinegar. The cook glares at me every time.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'temple-meal-mitaimu',
    eraId: ERA,
    npcId: 'temple-mi-tai-mu-vendor',
    role: '米苔目攤的攤販',
    roleEn: 'The rice-noodle vendor',
    doing: '一邊招呼客人，一邊撈起剛煮好的米苔目',
    doingEn: 'Calling out to customers while lifting fresh noodles from the pot',
    objectId: 'rice-sieve-board',
    lines: [
      {
        text: '米苔目喔——要冰的還是燒的？熱天吃冰的，退火！',
        textEn: 'Rice noodles here—cold or hot? Cold on a day like this, it cools you right down!',
        label: 'fiction',
      },
      {
        text: '寫作「米篩目」：米篩的網目，也指從篩孔擠出來的米條。',
        textEn: 'It’s written “rice-sieve eyes”: the holes of a sieve, and the rice strands pressed out through them.',
        label: 'sourced',
        sourceIds: ['moe-bi-thai-bak'],
      },
    ],
    followUps: [
      {
        id: 'how',
        question: '米條是怎麼擠出來的？',
        questionEn: 'How do you press out the strands?',
        lines: [
          {
            text: '陳年的在來米漿加番薯粉揉成「米胎」，放在竹製的米篩目板上用力搓，米胎就從孔裡一條一條擠出來。',
            textEn: 'Aged long-grain rice batter and sweet-potato starch kneaded into a dough, rubbed hard across a bamboo board full of holes—out come the strands, one by one.',
            label: 'sourced',
            sourceIds: ['gvm-2017-mitaimu'],
          },
          {
            text: '也有用槓桿壓的、用打了洞的鐵片或瓢子的，各家不一樣。',
            textEn: 'Some press it with a lever, some through a pierced tin sheet or a ladle—every family has its way.',
            label: 'sourced',
            sourceIds: ['gvm-2017-mitaimu'],
          },
        ],
      },
      {
        id: 'name',
        question: '為什麼叫「米苔目」？',
        questionEn: 'Why “mi tai mu”?',
        lines: [
          {
            text: '有作家寫，臺語的「米苔目」是從客家話的「米篩目」音譯來的。',
            textEn: 'One writer says the Taiwanese “bí-thai-ba̍k” is borrowed from the Hakka word for “rice-sieve eyes.”',
            label: 'sourced',
            sourceIds: ['gvm-2017-mitaimu'],
          },
          {
            text: '我阿母教我的時候，只說搓到手痠就對了。',
            textEn: 'When my mother taught me, all she said was: keep rubbing till your arms ache.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'temple-meal-douhua',
    eraId: ERA,
    npcId: 'temple-douhua-vendor',
    role: '豆花攤的攤販',
    roleEn: 'The douhua vendor',
    doing: '用扁平的舀匙，一片一片舀豆花',
    doingEn: 'Scooping douhua slice by slice with a flat ladle',
    objectId: 'douhua-pole',
    lines: [
      {
        text: '豆花——糖水甜甜，一碗吃落去，透心涼！',
        textEn: 'Douhua—sweet syrup, one bowl and you’re cool to the core!',
        label: 'fiction',
      },
      {
        text: '豆漿裡加一點鹽滷或石膏，凝得比豆腐還嫩；通常加糖水和花生當甜食。',
        textEn: 'A little brine or gypsum in the soy milk sets it softer than tofu; usually it’s served sweet, with syrup and peanuts.',
        label: 'sourced',
        sourceIds: ['moe-douhua'],
      },
    ],
    followUps: [
      {
        id: 'pole',
        question: '以前也是這樣擺攤嗎？',
        questionEn: 'Was it always sold from a stall?',
        lines: [
          {
            text: '很多人記得的是挑擔的：扁擔兩頭各一個大桶子，一桶豆花、一桶冰涼糖水，冬天換成熱糖水；孩子捧著碗、拿著湯匙和五圓硬幣跑出來等。',
            textEn: 'Many remember it carried on a pole: a big bucket at each end, one of douhua and one of cold syrup—hot in winter—while children ran out with a bowl, a spoon and a five-dollar coin.',
            label: 'sourced',
            sourceIds: ['stust-2021-douhua'],
          },
          {
            text: '那篇回憶也寫，後來才慢慢改成推車和鈴聲。',
            textEn: 'The same memoir says carts and bells only slowly replaced the pole later on.',
            label: 'sourced',
            sourceIds: ['stust-2021-douhua'],
          },
        ],
      },
      {
        id: 'toppings',
        question: '可以加料嗎？',
        questionEn: 'Can I add toppings?',
        lines: [
          {
            text: '加料？那篇回憶說，豆花剛開始有加料的時候，好像也只有紅豆一種。',
            textEn: 'Toppings? That memoir says when douhua first got toppings, it seems there was only red bean.',
            label: 'sourced',
            sourceIds: ['stust-2021-douhua'],
          },
          {
            text: '我這攤就是糖水，頂多撒一點花生。',
            textEn: 'At my stall it’s syrup, and at most a sprinkle of peanuts.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/templeMealObjects.js） ── */
export const TEMPLE_MEAL_OBJECTS = {
  'blue-white-bowl': {
    id: 'blue-white-bowl',
    title: '白底青花碗公',
    titleEn: 'Blue-and-white bowl',
    lead: '戰後鶯歌燒的日用陶碗：碗心手繪一條魚、碗口一圈花邊——廟口的小吃攤，一碗一碗就這樣端上桌。',
    leadEn: 'An everyday Yingge earthenware bowl from after the war, a fish painted in the well and a scalloped rim—the kind every temple-front stall served from.',
    actions: [{ id: 'flip', label: '翻過來看碗底', labelEn: 'Turn it over', doneLabel: '翻回來', doneLabelEn: 'Turn it back' }],
    paragraphs: [
      '形制依台灣碗盤博物館藏「鶯歌手繪魚紋碗公」（TW-5-01-00-0-B-0030）：陶製，1945–1964 年，口徑 20.5、高 8.5 公分，碗內以藍色與紅褐色手繪鯉魚與水草，碗口飾有花邊。《報導者》書摘寫，白底青花碗是老派小吃裡最常見的食器；鶯歌的日用碗盤在 1950 年代剛起步，靠手工拉坯與手繪。',
      '同一篇書摘提到，早年圓環的小吃攤碗都一樣、容易混淆，後來才有在碗上燒店號的做法。這裡的攤位是情境示意，碗底留空、不畫店號；紋樣是簡化的示意，不是那件典藏的複製。',
    ],
    paragraphsEn: [
      'Modelled on the Taiwan Bowl and Plate Museum’s hand-painted Yingge fish bowl (TW-5-01-00-0-B-0030): earthenware, 1945–1964, 20.5 cm across and 8.5 cm high, a carp and water plants painted in blue and russet, with a scalloped rim. A Reporter book excerpt calls blue-and-white bowls the classic snack-stall tableware, still hand-thrown and hand-painted in 1950s Yingge.',
      'The excerpt adds that stall bowls once looked so alike that names came to be fired onto them. These stalls are illustrative, so the base is left blank; the painting is simplified, not a copy of the museum piece.',
    ],
    reconstruction: true,
    sourceIds: ['taiwanceramics-yingge-bowl', 'twreporter-2021-snack-bowl'],
  },
  'squid-soup-bowl': {
    id: 'squid-soup-bowl',
    title: '一碗魷魚羹',
    titleEn: 'A bowl of squid soup',
    lead: '泡發的魷魚切塊，拌進勾了芡的羹湯，配上竹筍絲；旁邊的竹篩上，還有一隻沒泡過的乾魷魚。',
    leadEn: 'Revived squid cut into pieces in a thickened broth with shredded bamboo shoot—and beside it, a dried squid on a bamboo tray still waiting its turn.',
    actions: [{ id: 'scoop', label: '舀一匙', labelEn: 'Take a spoonful', doneLabel: '放回湯匙', doneLabelEn: 'Put the spoon back' }],
    paragraphs: [
      '教育部辭典：魷魚羹是「用魷魚作成的羹湯」。鏡週刊的專欄（裴偉，2025）訪問的水產行老闆說，乾魷魚泡發的祕訣是食用小蘇打；專欄也寫發好的魷魚切絲拌進魚漿；並認為魷魚羹約在七〇年代於萬華、大稻埕一帶興起，貨源迪化街就在附近——這是專欄作者的說法，不是學術考證。',
      '碗依台灣碗盤博物館藏戰後鶯歌的小碗（口徑約 18.5、高約 5.8 公分）；羹湯的配料（竹筍、九層塔）與乾魷魚的樣子是一般的示意，不代表任何攤商的做法，是歷史情境重建。',
    ],
    paragraphsEn: [
      'The Ministry of Education dictionary defines squid geng as a thick soup made with squid. A 2025 Mirror Media column quotes a seafood dealer on reviving dried squid with baking soda, describes the cut squid mixed into fish paste, and dates the dish’s rise around Wanhua and Dadaocheng to the 1970s—a columnist’s view, not scholarship.',
      'The bowl follows a small postwar Yingge bowl in the Taiwan Bowl and Plate Museum; the toppings and the dried squid are generic, not any stall’s recipe—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['moe-jiu-hi-kenn', 'mirror-2025-squid', 'taiwanceramics-yingge-bowl'],
  },
  'rice-sieve-board': {
    id: 'rice-sieve-board',
    title: '米篩目板',
    titleEn: 'Rice-noodle pressing board',
    lead: '架在滾水鍋上的竹框篩板：米胎在板上來回搓，從一個個小孔擠出米條，直接落進鍋裡。',
    leadEn: 'A framed, holed board set over boiling water: rub the rice dough across it and the strands drop through into the pot.',
    actions: [{ id: 'press', label: '搓一下米胎', labelEn: 'Press the dough', doneLabel: '退回去', doneLabelEn: 'Pull it back' }],
    paragraphs: [
      '魚夫（《遠見》，2017）寫：陳年在來米漿加番薯粉攪和成「米胎」，倒在竹製的米篩目板上用力搓揉，穿過孔洞濾成圓柱狀的米條；傳統器具還有利用槓桿壓榨、以鐵片或瓢器鑽孔等形式。教育部辭典「米篩目」：米篩的網目，也指篩出的米條食品。',
      '米篩目板的博物館典藏、尺寸與孔徑都查無：模型的長寬、孔的大小與鐵片篩面是設計值，是歷史情境重建。',
    ],
    paragraphsEn: [
      'The writer Yu Fu (Global Views, 2017) describes aged long-grain rice batter mixed with sweet-potato starch into a dough, rubbed hard over a bamboo board so it passes through the holes as round strands; other tools pressed it with a lever or through pierced tin or a ladle. The dictionary glosses the name as “the eyes of a rice sieve,” and the noodles sieved through them.',
      'No museum example, size or hole gauge was found, so the board’s dimensions and pierced-tin face are design values—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['gvm-2017-mitaimu', 'moe-bi-thai-bak'],
  },
  'douhua-pole': {
    id: 'douhua-pole',
    title: '豆花擔',
    titleEn: 'Douhua carrying pole',
    lead: '一根竹扁擔挑兩個木桶：一桶豆花、一桶糖水——叫賣聲一到，孩子就捧著碗跑出來。',
    leadEn: 'A bamboo pole with a bucket at each end, one of douhua and one of syrup—at the vendor’s call, children came running with their bowls.',
    actions: [{ id: 'scoop', label: '掀蓋舀豆花', labelEn: 'Lift the lid and scoop', doneLabel: '蓋回去', doneLabelEn: 'Close it' }],
    paragraphs: [
      '方子毓（南台通識電子報，2021）回憶：扁擔上掛著兩個大桶子，分別裝豆花與冰涼糖水（冬天換熱糖水），孩子一手捧碗、一手拿湯匙，手裡握著五圓硬幣或十元紙鈔等著；後來挑擔叫賣才慢慢被推車和鈴聲取代。這是作者的生活回憶，不是特定地方的紀錄。',
      '扁擔的長度依台灣民俗文物館「籮筐擔」（1231）的竹扁擔：長 151.4、寬 7 公分，兩端烤彎略往上翹，免得繩子滑落。豆花桶與舀匙的典藏查無，木桶的大小是設計值，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Fang Tzu-yu (STUST General Education e-Paper, 2021) remembers a pole hung with two big buckets—douhua and cold syrup, hot in winter—while children waited with a bowl, a spoon and a five-dollar coin; carts and bells only later replaced the pole. It is a personal memoir, not a record of one place.',
      'The pole follows the bamboo carrying pole at the Taiwan Folk Arts Museum (1231): 151.4 cm long and 7 cm wide, both ends heat-bent upward to keep the ropes from slipping. No museum douhua bucket or ladle was found; the buckets are design values—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['stust-2021-douhua', 'tfam-carrying-pole-1231', 'moe-douhua'],
  },
}

/* ── 路線 ── */
export const TEMPLE_MEAL_ROUTE = {
  id: 'temple-meal',
  title: '廟口的一餐',
  titleEn: 'A Meal at the Temple Front',
  intro: '1945–1980 年的慈聖宮廟埕：拜完媽祖，在榕樹下坐一坐，叫一碗魷魚羹、一碗米苔目，再來一碗豆花。廟口的攤位都是情境示意，不對應任何真實的攤商。',
  introEn: 'The Cisheng Temple square, 1945–1980: after prayers, sit under the banyan for squid soup, rice noodles and a bowl of douhua. The stalls are illustrative and stand for no real vendor.',
  closing: '一只青花碗、一碗羹、一把米篩目、一擔豆花——廟口的一餐，是從市集與廟會延續下來的庶民日常。老屋新生的年代也還吃得到魷魚羹與米苔目（老潘魷魚羹、永樂米苔目），但那是同一種食物的不同店家，和這裡的情境攤位沒有傳承關係。',
  closingEn: 'A blue-and-white bowl, a bowl of geng, a pressing board and a douhua pole: the temple-front meal carried on everyday life from the old markets and fairs. In the revival era you can still eat squid soup and rice noodles nearby, at different shops with no tie to these illustrative stalls.',
  eraId: ERA,
  nodes: [
    {
      id: 'court',
      kind: 'talk',
      journalIds: ['talk:temple-meal-elder', 'object:blue-white-bowl'],
      title: '拜完媽祖',
      titleEn: 'After the prayers',
      hint: '慈聖宮廟埕的東側，米苔目攤後面，拜完媽祖的阿婆在歇腳。',
      hintEn: 'On the east side of the Cisheng Temple square, behind the rice-noodle stall, a grandmother rests after her prayers.',
      npcIds: [route('temple-meal-elder')],
      shopId: 'ci-sheng-gong',
    },
    {
      id: 'squid',
      kind: 'talk',
      journalIds: ['talk:temple-meal-squid', 'object:squid-soup-bowl'],
      title: '一碗魷魚羹',
      titleEn: 'A bowl of squid soup',
      hint: '廟埕西側前緣的魷魚羹攤，街邊有個夥計在等。',
      hintEn: 'At the squid-soup stall on the west front of the square, a shop assistant is waiting by the street.',
      npcIds: [route('temple-meal-squid')],
      shopId: 'temple-squid-stall',
    },
    {
      id: 'mitaimu',
      kind: 'talk',
      journalIds: ['talk:temple-meal-mitaimu', 'object:rice-sieve-board'],
      title: '米苔目攤',
      titleEn: 'The rice-noodle stall',
      hint: '廟埕東側前緣的米苔目攤：走到攤販身邊跟他說話。',
      hintEn: 'The rice-noodle stall on the east front: walk up beside the vendor to talk.',
      npcIds: ['temple-mi-tai-mu-vendor'],
      shopId: 'temple-mi-tai-mu-stall',
    },
    {
      id: 'douhua',
      kind: 'talk',
      journalIds: ['talk:temple-meal-douhua', 'object:douhua-pole'],
      title: '一碗豆花',
      titleEn: 'A bowl of douhua',
      hint: '廟埕後方的豆花攤：攤販正一片一片舀著豆花。',
      hintEn: 'The douhua stall at the back of the square, where the vendor scoops slice after slice.',
      npcIds: ['temple-douhua-vendor'],
      shopId: 'temple-douhua-stall',
    },
  ],
}
