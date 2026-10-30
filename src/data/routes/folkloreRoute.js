/**
 * 主題路線「軼事系列」（第 12 階段）：大稻埕的坊間傳說與民間故事。
 * 每段傳說都標「坊間傳說」；可以查證的背景（廟的沿革、地名的記載、歌仔冊的出版）另外標「有出處」，
 * 路人自己的話標「虛構對白」。跨三個年代：
 * - 港口商街：霞海城隍廟——廟為什麼一直這麼小、五月十三人看人
 * - 酒樓繁華：法主公的乞龜還龜；「稻埕」這個地名
 * - 庶民生活：歌仔冊《周成過臺灣》
 *
 * 不把傳說安在真實人物身上：廟方的管理人、捐神像的人、開基的家族都不出現；
 * 周成、月裡、郭仔麵是歌仔冊裡的角色，查無其人。查證紀錄見 docs/research/folklore-route.md。
 */

/* ── 情境人物（data/routeFigures.js 合併） ── */
export const FOLKLORE_FIGURES = [
  // 港口商街：霞海城隍廟前，來拜城隍的婦人
  { id: 'folk-xiahai', eraId: 'qing-port', look: 'qingPickerBlue', pose: 'stand', position: [19.3, -2.2], rotationY: Math.PI + 0.5 },
  // 酒樓繁華：街西段北側，從安溪來的茶工
  { id: 'folk-fazhu', eraId: 'banquet', look: 'riceMiller', pose: 'stand', position: [-8.5, -2.2], rotationY: 0.4 },
  // 庶民生活：街西段北側，賣歌仔冊的人
  { id: 'folk-kua', eraId: 'postwar', look: 'postwarKuehVendor', pose: 'wave', position: [-24.0, -2.2], rotationY: 0.3 },
]

const route = (id) => `route-${id}`

/* ── 路人對話（格式見 game/talk.js） ── */
export const FOLKLORE_TALK = [
  {
    id: 'folk-xiahai',
    eraId: 'qing-port',
    npcId: route('folk-xiahai'),
    role: '來拜城隍的婦人',
    roleEn: 'A woman come to pray to the City God',
    doing: '剛從城隍廟出來，手裡還拿著香',
    doingEn: 'Just out of the City God temple, incense still in hand',
    objectId: 'bowed-shoes',
    lines: [
      {
        text: '城隍爺真靈驗，我每個月初一十五都來拜。',
        textEn: 'The City God truly answers prayers—I come on the first and fifteenth of every month.',
        label: 'fiction',
      },
      {
        text: '咸豐三年艋舺頂下郊拚，同安人帶著城隍爺落腳大稻埕，先供在信徒的糕餅舖裡，咸豐九年才在這裡蓋好廟。',
        textEn: 'After the feud of 1853 in Bangka, the Tong’an people brought the City God to Twatutia and kept him first in a worshipper’s cake shop; the temple here was finished in 1859.',
        label: 'sourced',
        sourceIds: ['culture-taipei-walk-dadaocheng-2018', 'moi-xiahai-temple'],
      },
    ],
    followUps: [
      {
        id: 'small',
        question: '香火這麼旺，廟怎麼這麼小？',
        questionEn: 'With so many worshippers, why is the temple so small?',
        lines: [
          {
            text: '老人家講，這塊地是「雞母穴」，動不得；也有人說，要擴建，擲筊城隍爺都不允。',
            textEn: 'The elders say the ground is a “mother hen’s nest” that must not be disturbed—others say that whenever rebuilding was asked, the City God’s divination blocks always said no.',
            label: 'folklore',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
          {
            text: '我是想，小小的廟擠滿了人，城隍爺才看得到大家。',
            textEn: 'If you ask me, a small temple packed with people means the City God can see everyone.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'festival',
        question: '五月十三有什麼熱鬧？',
        questionEn: 'What happens on the thirteenth of the fifth month?',
        lines: [
          {
            text: '迎城隍啊！光緒五年頭一次遶境，以後一年比一年熱鬧。',
            textEn: 'The City God procession! The first one went round in 1879, and it grows livelier every year.',
            label: 'sourced',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
          {
            text: '俗話說「五月十三人看人，迎神賽會甲天下」——街上人比神轎還多。',
            textEn: 'As the saying goes, “On the thirteenth of the fifth month, people come to watch people”—more of them than palanquins.',
            label: 'folklore',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
        ],
      },
      {
        id: 'shoes',
        question: '你的鞋子好細緻。',
        questionEn: 'Your shoes are so fine.',
        lines: [
          {
            text: '這雙弓鞋，鞋面的花是我自己繡的。纏腳的福建婦人家，都穿這樣的鞋。',
            textEn: 'These bow shoes—I embroidered the flowers myself. Women from Fujian with bound feet all wear shoes like these.',
            label: 'sourced',
            sourceIds: ['tfam-bowed-shoes-0346'],
          },
          {
            text: '聽說城隍爺也有夫人，婦人家有心事，都可以去跟夫人說。',
            textEn: 'They say the City God has a wife, too—women with troubles can go and tell her.',
            label: 'folklore',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
        ],
      },
    ],
  },
  {
    id: 'folk-fazhu',
    eraId: 'banquet',
    npcId: route('folk-fazhu'),
    role: '從安溪來的茶工',
    roleEn: 'A tea worker from Anxi',
    doing: '要去法主公廟乞龜',
    doingEn: 'On his way to beg a turtle at the Fazhu Temple',
    objectId: 'red-turtle-buns',
    lines: [
      {
        text: '法主公生快到了，我要去乞一隻龜，保佑今年做茶順利。',
        textEn: 'Fazhu’s birthday is coming—I’m off to beg a turtle so the tea season goes well.',
        label: 'fiction',
      },
      {
        text: '法主公廟拜的是法主聖君，是安溪的茶商從家鄉分靈來的；聖誕的時候有「乞龜、還龜」，龜是紅麵團包紅豆餡、印上烏龜的圖樣。',
        textEn: 'The Fazhu Temple honours the Holy Lord Fazhu, brought by Anxi tea merchants from their hometown; at his birthday people “beg and return turtles”—red dough filled with red bean, printed with a turtle.',
        label: 'sourced',
        sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
      },
    ],
    followUps: [
      {
        id: 'return',
        question: '乞了龜，要怎麼還？',
        questionEn: 'How do you return a turtle?',
        lines: [
          {
            text: '人家講，今年乞一隻，明年要連本帶利、一隻還兩隻；三年都沒還的，名字會被寫在紅紙上貼出來，叫做「龜上壁」。',
            textEn: 'They say: beg one this year, and next year repay it with interest—two for one. Go three years without returning it and your name goes up on red paper: “the turtle on the wall.”',
            label: 'folklore',
            sourceIds: ['ylps-fazhugong', 'zhao-1992-taipei-streets'],
          },
          {
            text: '我去年乞的那隻，今年要還兩隻，所以要更打拚做茶。',
            textEn: 'Last year I begged one, so this year I owe two—better work hard at the tea.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'legend',
        question: '法主公是什麼樣的神？',
        questionEn: 'What kind of god is Fazhu?',
        lines: [
          {
            text: '故鄉的老人講，宋朝的時候，永春的石牛洞裡有一條會變成人形的千年大蛇，張家三兄弟進洞把牠制服了。',
            textEn: 'The old folks back home tell how, in the Song dynasty, a thousand-year serpent that could take human form lived in the Stone Ox Cave at Yongchun, until three Zhang brothers went in and subdued it.',
            label: 'folklore',
            sourceIds: ['ylps-fazhugong'],
          },
          {
            text: '所以安溪人出外，都要請法主公保佑。',
            textEn: 'That’s why Anxi people far from home still ask Fazhu to watch over them.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'name',
        question: '「大稻埕」這個名字怎麼來的？',
        questionEn: 'Where does the name “Twatutia” come from?',
        lines: [
          {
            text: '文化局的手冊寫，十七世紀荷蘭人的地圖上，這一帶是巴賽族的圭武卒社；漢人來開墾以後，闢了一片「曬稻穀的廣場」，就叫大稻埕。',
            textEn: 'The city’s guidebook says seventeenth-century Dutch maps show the Basay village of Kimotsi here; Han settlers later cleared a great ground for drying rice—the “big rice-drying yard,” Twatutia.',
            label: 'sourced',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
          {
            text: '那片曬穀場到底在哪裡？今天已經沒人說得準了。',
            textEn: 'Where exactly the drying yard lay, no one can say for sure anymore.',
            label: 'sourced',
            sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
          },
        ],
      },
    ],
  },
  {
    id: 'folk-sieve',
    eraId: 'banquet',
    npcId: 'street-banquet-rickshaw-street-0',
    role: '等客的人力車夫',
    roleEn: 'A rickshaw puller waiting for fares',
    doing: '坐在車前歇腳，跟人講古',
    doingEn: 'Resting on his rickshaw, telling old tales',
    objectId: 'rice-sieve',
    lines: [
      {
        text: '坐車嗎？不坐也沒關係，坐下來聽我講古。',
        textEn: 'Need a ride? No? Then sit a while and hear an old tale.',
        label: 'fiction',
      },
      {
        text: '你知道嗎，「稻埕」就是曬稻穀的埕——以前這裡是一片曬穀場。',
        textEn: 'Did you know “tiū-tiânn” means a yard for drying rice? Once all this was a threshing ground.',
        label: 'sourced',
        sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
      },
    ],
    followUps: [
      {
        id: 'saying',
        question: '還有什麼老話？',
        questionEn: 'Any other old sayings?',
        lines: [
          {
            text: '「一府二鹿三艋舺」——府城、鹿港、艋舺，是以前最熱鬧的三個港。',
            textEn: '“First the prefecture, second Lukang, third Bangka”—the three busiest ports of old.',
            label: 'folklore',
          },
          {
            text: '我阿公常說，要是那句話晚一點才出來，排第三的就是大稻埕了。',
            textEn: 'My grandfather always said if that saying had come along a bit later, Twatutia would be number three.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'sieve',
        question: '曬好的稻穀怎麼篩？',
        questionEn: 'How do they sift the dried grain?',
        lines: [
          {
            text: '用米篩：竹篾編的大圓盤，篩米穀、豆子；收成以後，把混在稻穗裡的稻穀篩出來。',
            textEn: 'With a rice sieve—a great round tray of woven bamboo for sifting grain and beans, picking the grain out of the threshed straw after harvest.',
            label: 'sourced',
            sourceIds: ['nmth-rice-sieve-2005-008-1708'],
          },
          {
            text: '娶新娘的時候，還有一種畫了八卦的米篩，遮在新娘頭上避邪。',
            textEn: 'At weddings there’s another kind, painted with the eight trigrams, held over the bride’s head to ward off evil.',
            label: 'sourced',
            sourceIds: ['nmth-rice-sieve-2005-008-1708'],
          },
        ],
      },
    ],
  },
  {
    id: 'folk-kua',
    eraId: 'postwar',
    npcId: route('folk-kua'),
    role: '賣歌仔冊的人',
    roleEn: 'A songbook seller',
    doing: '一邊唸歌，一邊兜售新印的歌仔冊',
    doingEn: 'Chanting verses and hawking newly printed songbooks',
    objectId: 'zhou-cheng-songbook',
    lines: [
      {
        text: '來喔——新印的歌仔冊，《周成過臺灣》，一本唱到你流目屎！',
        textEn: 'Come see—freshly printed songbooks! “Zhou Cheng Crosses to Taiwan”—it’ll have you in tears!',
        label: 'fiction',
      },
      {
        text: '竹林書局民國四十年出版的《周成過臺灣歌》，上本只有四葉、十六公分，臺大圖書館把它歸在「時事新編」。',
        textEn: 'The Bamboo Grove Press edition of 1951 runs just four leaves, sixteen centimetres tall in its first volume; National Taiwan University Library files it under “new songs of current events.”',
        label: 'sourced',
        sourceIds: ['ntu-kua-zhou-cheng-1951'],
      },
    ],
    followUps: [
      {
        id: 'story',
        question: '在唱什麼故事？',
        questionEn: 'What’s the story?',
        lines: [
          {
            text: '泉州人周成家裡窮，妻子月裡四處借錢讓他坐船來臺灣；他在臺北做茶行生意發了，卻迷上了郭仔麵，忘了家鄉的人。',
            textEn: 'Zhou Cheng of Quanzhou is poor, so his wife Yueli borrows everywhere to pay his passage; in Taipei he prospers in the tea trade, falls for Guo Ah-mian and forgets everyone back home.',
            label: 'folklore',
            sourceIds: ['ntu-kua-zhou-cheng-1951'],
          },
          {
            text: '月裡來臺灣尋夫，周成聽信郭仔麵，竟把妻子毒死；月裡向閻王告狀，兇手一個一個遭到報應。',
            textEn: 'Yueli crosses to find him; urged on by Guo Ah-mian, he poisons her. She takes her case to the King of Hell, and one by one the guilty meet their retribution.',
            label: 'folklore',
            sourceIds: ['ntu-kua-zhou-cheng-1951'],
          },
        ],
      },
      {
        id: 'real',
        question: '真的有周成這個人嗎？',
        questionEn: 'Was there really a Zhou Cheng?',
        lines: [
          {
            text: '大家都當真事在唱，故事裡的茶行就在大稻埕。可是周成住哪裡、哪一年的事，誰也拿不出證據。',
            textEn: 'Everyone sings it as if it were true, and the tea shop in the story is right here in Twatutia. But where Zhou Cheng lived, or when—nobody has any proof.',
            label: 'folklore',
          },
          {
            text: '我只管唱，聽的人哭了，歌仔冊就賣得出去。',
            textEn: 'I just sing it—when the listeners cry, the songbooks sell.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/folkloreObjects.js） ── */
export const FOLKLORE_OBJECTS = {
  'bowed-shoes': {
    id: 'bowed-shoes',
    title: '弓鞋',
    titleEn: 'Bow shoes',
    lead: '紅布繡花、尖頭高跟的小鞋：清末纏足的閩南婦女穿的鞋，一隻只有手掌那麼長。',
    leadEn: 'Tiny embroidered shoes of red cloth with pointed toes and high heels, worn by late-Qing Hokkien women with bound feet—no longer than a palm.',
    actions: [{ id: 'flip', label: '翻過來看鞋底', labelEn: 'Turn one over', doneLabel: '放回去', doneLabelEn: 'Put it back' }],
    paragraphs: [
      '形制依台灣民俗文物館（臺中市民俗公園）典藏「弓鞋」（登錄號 0346）：清末民初，布製，長 11、寬 4.8、高 5 公分，尖頭、高跟、高鞋面；中英文說明記為紅布繡花（日文說明寫黑布，記載不一）；是纏足的閩南籍婦女所穿，主要是富裕人家。',
      '刺繡的花樣是示意，不是那件典藏的複製；路人說城隍爺也有夫人，是坊間的說法。文化局手冊另記載，今天已婚的人可以到側殿向城隍夫人求鞋——那是今天的做法，不放進這個年代的對話。',
    ],
    paragraphsEn: [
      'Modelled on the Taiwan Folk Arts Museum’s bow shoes (no. 0346): late Qing to early Republic, cloth, 11 × 4.8 × 5 cm, pointed toes, high heels and tall uppers, described as red cloth with flower embroidery (the Japanese note says black); worn by Hokkien women with bound feet, mostly from wealthy families.',
      'The embroidery is illustrative, not a copy. The City God’s wife is folklore; the guidebook notes that today married visitors ask her for shoes—a present-day practice left out of this era’s talk.',
    ],
    reconstruction: true,
    sourceIds: ['tfam-bowed-shoes-0346', 'culture-taipei-walk-dadaocheng-2018'],
  },
  'red-turtle-buns': {
    id: 'red-turtle-buns',
    title: '乞龜的紅麵龜',
    titleEn: 'Red turtle buns for begging',
    lead: '紅麵團包紅豆餡、印上烏龜的圖樣——法主公生日那天乞一隻回家，明年再加倍還回來。',
    leadEn: 'Red dough round red bean paste, printed with a turtle—beg one on Fazhu’s birthday and return it doubled next year.',
    actions: [{ id: 'lift', label: '乞一隻龜', labelEn: 'Beg a turtle', doneLabel: '放回去', doneLabelEn: 'Put it back' }],
    paragraphs: [
      '文化局《走讀大稻埕》（2018）：法主公廟主祀法主聖君，由安溪茶商自家鄉分靈而來；「乞龜、還龜」是法主公聖誕時的獨特祭典，龜是紅麵團內包紅豆餡、印上烏龜圖樣。《臺灣民俗文物辭典》「麵龜」：麵粉做成龜形、外皮染紅，用於神誕、慶壽等。',
      '「一隻還兩隻、三年不還就龜上壁」（永樂國小網頁；趙莒玲 1992，經維基百科轉引）與法主公降伏蛇妖都是坊間說法。麵龜的大小與印紋是示意，不代表任何店家或廟方的做法，是歷史情境重建。',
    ],
    paragraphsEn: [
      'The city’s 2018 guidebook says the Fazhu Temple was founded by Anxi tea merchants from their hometown shrine, and that at his birthday people beg and return turtles made of red dough with red bean filling and a turtle print. The Dictionary of Taiwanese Folk Culture describes red flour turtles used for gods’ birthdays and longevity celebrations.',
      'The “turtle on the wall” for unpaid debts and Fazhu’s serpent demon are folklore. Size and pattern are illustrative—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['culture-taipei-walk-dadaocheng-2018', 'th-dict-mian-gui', 'ylps-fazhugong', 'zhao-1992-taipei-streets'],
  },
  'rice-sieve': {
    id: 'rice-sieve',
    title: '米篩',
    titleEn: 'Rice sieve',
    lead: '竹篾「壓一挑一」編成的大圓盤：曬好的稻穀倒上去一篩，雜草籽與碎屑就分開了。',
    leadEn: 'A great round tray of over-under woven bamboo: tip in the dried grain, give it a shake, and the weed seeds and chaff fall away.',
    actions: [{ id: 'sift', label: '篩一下', labelEn: 'Give it a shake', doneLabel: '放平', doneLabelEn: 'Set it level' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「米篩」（2005.008.1708）：竹篾與厚竹片編製，長 74.2、寬 73.6、高 7.4 公分，日本時代至戰後；圓盤狀、面大而淺，主體「壓一挑一」編出四角孔，口緣以粗竹條夾住內外兩側、尾端以籐皮返折纏繞。館方說明：用於篩選米穀、豆類等雜糧，收成後篩出混在稻穗中的稻穀；婚俗用的「八卦米篩」孔目較細、底部漆紅色八卦，迎娶時遮在新娘頭頂避邪。',
      '大稻埕名稱的由來依文化局《走讀大稻埕》；曬穀場的確切位置已難確認。篩面上的稻穀是示意，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s rice sieve (2005.008.1708): bamboo strips and slats, 74.2 × 73.6 × 7.4 cm, Japanese era to postwar; a broad shallow disc woven over-under with square holes, the rim clamped by thick bamboo and bound with rattan. It sifted grain and beans; a finer “eight-trigram” sieve painted red was held over brides to ward off evil.',
      'The origin of the name follows the city guidebook; the drying yard’s location is no longer known. The grain on the sieve is illustrative—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-rice-sieve-2005-008-1708', 'culture-taipei-walk-dadaocheng-2018'],
  },
  'zhou-cheng-songbook': {
    id: 'zhou-cheng-songbook',
    title: '歌仔冊《周成過臺灣歌》',
    titleEn: 'Songbook: Zhou Cheng Crosses to Taiwan',
    lead: '薄薄的四葉小冊，一頁一頁是七字一句的唱詞——唸歌的人在街頭唱，聽的人買一本回家自己唸。',
    leadEn: 'A slim four-leaf booklet of seven-syllable verses—sung on the street by the chanter, taken home by listeners to read for themselves.',
    actions: [{ id: 'open', label: '翻開', labelEn: 'Open it', doneLabel: '闔上', doneLabelEn: 'Close it' }],
    paragraphs: [
      '形制依國立臺灣大學圖書館「歌仔冊與唸歌」典藏的竹林書局《周成過臺灣歌 上本》（新竹，民國 40 年 6 月）：4 葉、16 公分，楊雲萍文庫；館方把它歸在「時事新編」，內容時代標為清代，摘要記主角是泉州人周成、妻子月裡、郭仔麵與王根。館方的影像與全文限非營利學術研究使用，這裡不轉載，只依館方的詮釋資料重建外形。',
      '周成的故事是坊間傳說：查無周成其人的契約、戶籍或檔案。冊子的寬度與封面的樣子查無，是歷史情境重建；唱詞以色塊示意，不寫字。',
    ],
    paragraphsEn: [
      'Modelled on the Bamboo Grove Press first volume of Zhou Cheng Crosses to Taiwan (Hsinchu, June 1951) in National Taiwan University Library’s songbook collection: four leaves, 16 cm tall, from the Yang Yun-ping collection, catalogued as a “current events” song set in the Qing, with Zhou Cheng, his wife Yueli, Guo Ah-mian and Wang Gen. The library’s images and text are for non-profit research only and are not reproduced.',
      'Zhou Cheng is a figure of folklore—no record of him exists. The booklet’s width and cover are not recorded; verses are shown as blocks—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['ntu-kua-zhou-cheng-1951'],
  },
}

/* ── 路線 ── */
export const FOLKLORE_ROUTE = {
  id: 'folklore',
  title: '軼事系列',
  titleEn: 'Tales of the Street',
  intro: '大稻埕的坊間傳說：城隍廟為什麼一直這麼小、五月十三人看人、法主公的乞龜還龜、「稻埕」這個名字，還有唱遍街頭的《周成過臺灣》。傳說都標「坊間傳說」，可以查證的背景另外附出處。',
  introEn: 'The folklore of Dadaocheng: why the City God temple stays small, the festival crowds, begging turtles from Fazhu, the name “Twatutia,” and the street-sung tale of Zhou Cheng. Legends are marked as folklore; what can be checked carries a source.',
  closing: '雞母穴、龜上壁、曬穀場、周成與月裡——傳說不一定是真的，卻記下了大家在意什麼：神明靈不靈、欠的要不要還、從哪裡來、做人不能忘本。這些故事都標了「坊間傳說」，沒有安在任何真實的人身上。',
  closingEn: 'The mother hen’s nest, the turtle on the wall, the drying yard, Zhou Cheng and Yueli—legends need not be true to show what people cared about: whether the gods answer, whether debts are repaid, where we came from, and not forgetting home. All are marked as folklore and pinned on no real person.',
  eraId: 'qing-port',
  nodes: [
    {
      id: 'xiahai',
      kind: 'talk',
      eraId: 'qing-port',
      journalIds: ['talk:folk-xiahai', 'object:bowed-shoes'],
      title: '城隍廟的小與大',
      titleEn: 'The small temple and its great festival',
      hint: '港口商街：街東段北側的霞海城隍廟前，有位婦人剛拜完出來。',
      hintEn: 'Treaty-port years: outside the Xiahai City God Temple on the north side, a woman has just finished her prayers.',
      npcIds: [route('folk-xiahai')],
      shopId: 'xia-hai-cheng-huang',
    },
    {
      id: 'fazhu',
      kind: 'talk',
      eraId: 'banquet',
      journalIds: ['talk:folk-fazhu', 'object:red-turtle-buns'],
      title: '法主公的乞龜',
      titleEn: 'Begging a turtle from Fazhu',
      hint: '酒樓繁華：街西段北側，安溪來的茶工正要去乞龜。',
      hintEn: 'The banquet years: on the north side of the west end, a tea worker from Anxi is off to beg a turtle.',
      npcIds: [route('folk-fazhu')],
    },
    {
      id: 'name',
      kind: 'talk',
      eraId: 'banquet',
      journalIds: ['talk:folk-sieve', 'object:rice-sieve'],
      title: '「稻埕」這個名字',
      titleEn: 'The name “Twatutia”',
      hint: '酒樓繁華：街中段等客的人力車夫，最愛跟人講古。',
      hintEn: 'The banquet years: the rickshaw puller waiting mid-street loves to tell old tales.',
      npcIds: ['street-banquet-rickshaw-street-0'],
      mapAt: [10.1, 2.0],
    },
    {
      id: 'zhoucheng',
      kind: 'talk',
      eraId: 'postwar',
      journalIds: ['talk:folk-kua', 'object:zhou-cheng-songbook'],
      title: '周成過臺灣',
      titleEn: 'Zhou Cheng crosses to Taiwan',
      hint: '庶民生活：街西段北側，賣歌仔冊的人正在唸歌。',
      hintEn: 'Postwar: on the north side of the west end, a songbook seller is chanting.',
      npcIds: [route('folk-kua')],
    },
  ],
}
