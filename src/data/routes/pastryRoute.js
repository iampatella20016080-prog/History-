/**
 * 主題路線「一塊糕餅的人生」（第 12 階段）：老屋新生的四家糕餅店與粿攤，
 * 各自對應一個生命禮俗——做壽的壽桃（十字軒）、添丁與週歲的紅龜粿（好粿緣）、
 * 四個月的收涎餅與訂婚的大餅（李亭香）、日治時期傳進來的和菓子（滋養豆餡舖）。
 *
 * 依第 7 階段的結論，四家店只依主題並列：彼此沒有傳承、師承或合作關係，對白與說明都不寫成傳承線。
 * 查證紀錄見 docs/research/pastry-life-route.md；出處都在 sources.js。
 *
 * 標示（CLAUDE.md）：
 * - 有出處：辭典、博物館典藏、論文與報導的內容（附 sourceIds）；店家的事只用公開報導，店家說法另外註明
 * - 坊間傳說：民間傳說與年代不確定的俗諺
 * - 虛構對白：路人自己的事（替阿嬤訂壽桃、外孫滿四個月……），不對應任何真實人物
 * 路人不具名，也不是店家的人。
 */

const ERA = 'revival'

/* ── 情境人物（data/routeFigures.js 合併；位置在店門口的街上或市場走道，不擋門與互動點） ── */
export const PASTRY_FIGURES = [
  // 十字軒（北側街屋）門前：來訂壽桃的孫女，面向店面
  { id: 'pastry-peach', eraId: ERA, look: 'revivalShopper', pose: 'stand', position: [-11.7, -2.2], rotationY: Math.PI + 0.35 },
  // 永樂市場一樓走道中線偏南（不擋直走的人，也和南側攤位留一人寬）：替孫子準備度晬的阿伯，面向北側的好粿緣
  { id: 'pastry-kueh', eraId: ERA, look: 'revivalElder', pose: 'stand', position: [48.7, 0.84], rotationY: Math.PI - 0.4 },
  // 李亭香（南側街屋）門前：來買收涎餅的外婆，面向店面
  { id: 'pastry-shouxian', eraId: ERA, look: 'revivalElderWoman', pose: 'stand', position: [15.0, 2.2], rotationY: 0.35 },
  // 滋養豆餡舖的轉角前（河岸廣場一側）：挑伴手禮的年輕人
  { id: 'pastry-wagashi', eraId: ERA, look: 'revivalYoung', pose: 'phone', position: [-35.4, -2.6], rotationY: Math.PI * 0.75 },
]

const npc = (id) => `route-${id}`

/* ── 路人對話（格式見 game/talk.js；objectId 是路人拿給你看的器物） ── */
export const PASTRY_TALK = [
  {
    id: 'pastry-peach',
    eraId: ERA,
    npcId: npc('pastry-peach'),
    role: '來訂壽桃的孫女',
    roleEn: 'A granddaughter ordering longevity peaches',
    doing: '在十字軒門口算著要訂幾顆壽桃',
    doingEn: 'Counting how many longevity buns to order outside Shizixuan',
    objectId: 'longevity-peach',
    lines: [
      {
        text: '阿嬤下個月八十歲。家裡說，壽桃要由孫女來送——所以我來訂了。',
        textEn: 'Grandma turns eighty next month. The family says the peaches should come from a granddaughter—so here I am.',
        label: 'fiction',
      },
      {
        text: '照禮俗，壽桃要由孫女贈賀，數目也要取吉祥的數字，像十二、十六、八十、一百零八；壽宴過後，再分送親友沾沾喜氣。',
        textEn: 'By custom the granddaughter presents the peaches, in an auspicious number—twelve, sixteen, eighty, a hundred and eight—and after the feast they are shared out so everyone takes home some of the luck.',
        label: 'sourced',
        sourceIds: ['th-dict-shoutao'],
      },
    ],
    followUps: [
      {
        id: 'why',
        question: '為什麼做壽要送桃子？',
        questionEn: 'Why peaches for a birthday?',
        lines: [
          {
            text: '臺灣民間從五十歲開始，每十年做一次比較完整的大生日，叫「做壽」；壽堂上擺的就是壽桃和紅龜粿。',
            textEn: 'From fifty onward, every ten years brings a fuller birthday celebration—“doing longevity”—with longevity peaches and red turtle cakes laid out in the hall.',
            label: 'sourced',
            sourceIds: ['th-dict-shoutao'],
          },
          {
            text: '老一輩講，孫臏把鬼谷子送的桃子帶回家給母親吃，母親的白髮就轉黑了——這是傳說啦。',
            textEn: 'The old folks say Sun Bin brought home a peach from his master Guiguzi, and when his mother ate it her white hair turned black again—just a legend, of course.',
            label: 'folklore',
            sourceIds: ['th-dict-shoutao'],
          },
        ],
      },
      {
        id: 'shop',
        question: '這家店的壽桃有名嗎？',
        questionEn: 'Is this shop known for its peaches?',
        lines: [
          {
            text: '報導寫，壽桃是十字軒賣得最多的供品，廟裡一訂就是幾千顆；蒸好之後一顆一顆壓出桃形、再噴上顏色，多的時候一天要做一萬多顆。',
            textEn: 'Reports say longevity peaches are the offering Shizixuan sells most—temples order thousands at a time; each one is pressed into a peach after steaming, then sprayed with colour, more than ten thousand on a busy day.',
            label: 'sourced',
            sourceIds: ['mirrormedia-2024-shizixuan'],
          },
          {
            text: '也有報導說，這裡的糕點常常擺上霞海城隍廟的供桌。',
            textEn: 'Another report says its cakes often end up on the offering tables of the Xiahai City God Temple.',
            label: 'sourced',
            sourceIds: ['ltn-2021-shizixuan'],
          },
        ],
      },
      {
        id: 'turtle',
        question: '除了壽桃，做壽還吃什麼？',
        questionEn: 'What else goes with a birthday?',
        lines: [
          {
            text: '還有麵龜——麵粉做的龜，外皮染紅；神明生日、長輩做壽都用得上，嬰兒週歲還會拿大麵龜讓孩子踩。',
            textEn: 'Flour turtles, too—red-skinned buns in the shape of a turtle, for gods’ birthdays and elders’ birthdays alike; at a first birthday the baby is even stood on a big one.',
            label: 'sourced',
            sourceIds: ['th-dict-mian-gui'],
          },
          {
            text: '我只負責壽桃，麵龜交給我表哥去煩惱。',
            textEn: 'I’m only in charge of the peaches. The turtles are my cousin’s problem.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'pastry-kueh',
    eraId: ERA,
    npcId: npc('pastry-kueh'),
    role: '替孫子準備度晬的阿伯',
    roleEn: 'A grandfather shopping for a first birthday',
    doing: '在市場的粿攤前挑紅龜粿',
    doingEn: 'Choosing red turtle cakes at the market’s kueh stall',
    objectId: 'kueh-mold',
    lines: [
      {
        text: '孫仔下禮拜度晬，我先來看看紅龜粿——拜拜要用，也要分給厝邊。',
        textEn: 'My grandson turns one next week, so I’m looking at red turtle cakes—some for the offerings, some for the neighbours.',
        label: 'fiction',
      },
      {
        text: '紅龜粿是糯米做的，粿皮染紅、用印模印上龜紋再蒸；拜神、酬神用它，家裡添了丁，也拿它分送親友。',
        textEn: 'Red turtle cake is glutinous rice, the skin dyed red, pressed with a turtle mould and steamed—offered to the gods, and handed round to friends when a child is born.',
        label: 'sourced',
        sourceIds: ['moe-hong-gui'],
      },
    ],
    followUps: [
      {
        id: 'mold',
        question: '粿上的龜紋是怎麼印的？',
        questionEn: 'How is the turtle pattern made?',
        lines: [
          {
            text: '用粿印。木頭刻的印模，常常一面刻桃、一面刻龜，都是長壽的意思。',
            textEn: 'With a kueh mould—carved wood, often a peach on one face and a turtle on the other, both meaning long life.',
            label: 'sourced',
            sourceIds: ['moe-gui-yin'],
          },
          {
            text: '歷史博物館收著一件塗朱漆的老粿印：連柄三十六公分長，龜甲刻了兩圈、中間一個「壽」字，側邊還有七枚連錢，握柄底下鑽了鐵圈可以掛起來。',
            textEn: 'The history museum keeps an old red-lacquered one: thirty-six centimetres with the handle, two rings of shell with “longevity” in the middle, seven linked coins along the edge, and an iron ring under the handle to hang it by.',
            label: 'sourced',
            sourceIds: ['nmth-kueh-mold-0563'],
          },
        ],
      },
      {
        id: 'seasons',
        question: '還有什麼時候吃粿？',
        questionEn: 'When else do people eat kueh?',
        lines: [
          {
            text: '清明掃墓、七月普渡，常用草仔粿；過年有菜頭粿，「菜頭」跟「彩頭」同音。',
            textEn: 'Mugwort kueh for tomb-sweeping and the Ghost Festival; radish cake at New Year, because “radish” sounds like “good fortune.”',
            label: 'sourced',
            sourceIds: ['moe-cao-guo', 'moa-niangao'],
          },
          {
            text: '俗語講「食甜粿，予你趁家伙」——吃了甜粿，賺大錢。',
            textEn: 'As the saying goes, “Eat sweet kueh and you’ll make a fortune.”',
            label: 'folklore',
            sourceIds: ['moa-niangao'],
          },
        ],
      },
      {
        id: 'mourning',
        question: '辦喪事也用紅龜粿嗎？',
        questionEn: 'Are red turtle cakes used at funerals too?',
        lines: [
          {
            text: '各地不一樣。像彰化二林，喪禮只把紅龜粿當祭品，常和鼠麴粿一起；芳苑王功那邊的龜粿皮不染紅，只在頂上點一點紅。',
            textEn: 'It depends on the place. In Erlin, Changhua, red turtle cakes appear at funerals only as offerings, often with cudweed kueh; around Wanggong the skins are left white with just a red dot on top.',
            label: 'sourced',
            sourceIds: ['tcmb-erlin-red-turtle'],
          },
          {
            text: '所以啊，規矩要問自己家裡的長輩，沒有一定的。',
            textEn: 'So the rule is: ask your own elders. There’s no single right answer.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'pastry-shouxian',
    eraId: ERA,
    npcId: npc('pastry-shouxian'),
    role: '來買收涎餅的外婆',
    roleEn: 'A grandmother buying drool-catching biscuits',
    doing: '在餅店門口等著包收涎餅',
    doingEn: 'Waiting outside the bakery for her biscuits to be wrapped',
    objectId: 'shouxian-cakes',
    lines: [
      {
        text: '外孫滿四個月囉，外婆家要送收涎餅。',
        textEn: 'My grandson is four months old—and the mother’s family brings the drool-catching biscuits.',
        label: 'fiction',
      },
      {
        text: '中間有孔的小餅，用紅線串起來掛在嬰仔胸前，象徵把口水收起來；一邊收，一邊說吉祥話。',
        textEn: 'Little biscuits with a hole in the middle, strung on red thread and hung on the baby’s chest to “gather up the drool,” with a lucky phrase for each one.',
        label: 'sourced',
        sourceIds: ['moe-shou-lan'],
      },
    ],
    followUps: [
      {
        id: 'how',
        question: '收涎要怎麼做？',
        questionEn: 'How is it done?',
        lines: [
          {
            text: '客家人「做四個月」也收涎：餅的數目取雙數，十二、二十四、三十六片，請長輩拿餅在嬰兒嘴邊抹一抹。',
            textEn: 'Hakka families do it too, at the fourth month: an even number of biscuits—twelve, twenty-four, thirty-six—and an elder brushes each one past the baby’s lips.',
            label: 'sourced',
            sourceIds: ['hakka-four-months'],
          },
          {
            text: '我們家是阿祖來抹，抹一下、講一句，孫仔笑得口水更多。',
            textEn: 'In our family the great-grandmother does the brushing—one biscuit, one blessing—and the baby laughs and drools all the more.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'engagement',
        question: '訂婚的大餅也是這種餅嗎？',
        questionEn: 'Is the engagement cake the same sort of thing?',
        lines: [
          {
            text: '大餅就是喜餅，訂婚時女方拿來分送親友。清代的方志就記載，納采要備大餅、豬肉和糖品。',
            textEn: 'The big cake is the wedding cake the bride’s family hands out at the engagement. Qing gazetteers already list big cakes, pork and sweets among the betrothal gifts.',
            label: 'sourced',
            sourceIds: ['moe-da-bing', 'chen-jingkuan-2022-xingang', 'chen-yuzhen-2021-kamatiam'],
          },
          {
            text: '一九七〇年代後期，港式的奶酥西餅進來，西式喜餅越來越多；二〇一一年的報導說，已經是西式八、漢式二了。',
            textEn: 'In the late 1970s Hong Kong–style butter cakes arrived and Western wedding cakes took off; by a 2011 report they outsold the Chinese kind eight to two.',
            label: 'sourced',
            sourceIds: ['ltn-2011-wedding-cakes'],
          },
        ],
      },
      {
        id: 'shop',
        question: '這家餅店有什麼故事？',
        questionEn: 'What’s the story of this bakery?',
        lines: [
          {
            text: '店家說是一八九五年創立的——這是店家自己的說法。報導提到，他們的糕餅文化館有一面牆，擺著壽桃、發糕，還有四個月大的嬰兒要吃的收涎餅。',
            textEn: 'The family says the shop dates from 1895—that is their own account. A report mentions a wall in their pastry museum showing longevity peaches, prosperity cakes, and the biscuits for four-month-old babies.',
            label: 'sourced',
            sourceIds: ['ettoday-2019-litingxiang'],
          },
        ],
      },
    ],
  },
  {
    id: 'pastry-wagashi',
    eraId: ERA,
    npcId: npc('pastry-wagashi'),
    role: '挑伴手禮的年輕人',
    roleEn: 'A young man choosing a gift',
    doing: '在轉角的和菓子店前查著地圖',
    doingEn: 'Checking a map outside the corner wagashi shop',
    objectId: 'monaka',
    lines: [
      {
        text: '第一次去女朋友家拜訪，總不能空著手——我想挑一盒和菓子。',
        textEn: 'First visit to my girlfriend’s parents—can’t go empty-handed. I’m thinking a box of wagashi.',
        label: 'fiction',
      },
      {
        text: '日治時期，日本人把羊羹、饅頭、煎餅這些菓子的做法帶來臺灣，後來很多都成了送人的伴手禮。',
        textEn: 'In the Japanese era, recipes for yōkan, manjū and senbei came to Taiwan, and many of them became the gifts people bring when they visit.',
        label: 'sourced',
        sourceIds: ['chen-jingkuan-2022-xingang'],
      },
    ],
    followUps: [
      {
        id: 'wedding',
        question: '和菓子也用在喜事嗎？',
        questionEn: 'Is wagashi used for weddings?',
        lines: [
          {
            text: '在日本，婚禮常送紅白饅頭這類慶事的菓子，不送喜餅。',
            textEn: 'In Japan, weddings often call for red-and-white manjū and other celebration sweets rather than wedding cakes.',
            label: 'sourced',
            sourceIds: ['foodnext-2023-japan-wedding'],
          },
          {
            text: '臺灣有沒有用和菓子辦喜事的老規矩？我查了半天，倒是沒查到。',
            textEn: 'Was there ever a custom of wagashi at Taiwanese weddings? I searched for ages and found nothing.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'history',
        question: '大稻埕以前就有和菓子嗎？',
        questionEn: 'Did Dadaocheng have wagashi in the old days?',
        lines: [
          {
            text: '有研究查到，一九三四年的商工名錄裡，大稻埕就有一家餅店登記成「和洋菓子店」。',
            textEn: 'One study found a Dadaocheng bakery listed in the 1934 trade directory as a “Japanese and Western confectioner.”',
            label: 'sourced',
            sourceIds: ['chen-yuzhen-2021-kamatiam'],
          },
          {
            text: '這家店是一九五三年在南京西路開的，後來才搬來迪化街——跟那家不是同一家。',
            textEn: 'This shop opened on Nanjing West Road in 1953 and only moved to Dihua Street later—it isn’t that old bakery.',
            label: 'sourced',
            sourceIds: ['ziyang-about', 'ryori-taiwan-ziyang'],
          },
        ],
      },
      {
        id: 'monaka',
        question: '你手上那個是什麼？',
        questionEn: 'What’s that you’re holding?',
        lines: [
          {
            text: '最中——糯米燒成的薄脆餅皮，夾著紅豆餡。專訪說，這家店一年四季都有紅豆餡的最中。',
            textEn: 'Monaka—crisp wafers of baked glutinous rice around red bean paste. An interview says this shop makes red-bean monaka all year round.',
            label: 'sourced',
            sourceIds: ['ryori-taiwan-ziyang'],
          },
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/pastryObjects.js） ── */
export const PASTRY_OBJECTS = {
  'longevity-peach': {
    id: 'longevity-peach',
    title: '壽桃',
    titleEn: 'Longevity peach bun',
    lead: '發麵包餡、捏成桃形，蒸熟後壓出紋路、噴上粉紅——做壽的時候，由孫女送給長輩。',
    leadEn: 'Leavened dough wrapped round a filling, shaped like a peach, steamed, scored and blushed pink—presented to an elder at a birthday by a granddaughter.',
    actions: [{ id: 'split', label: '掰開看餡', labelEn: 'Break it open', doneLabel: '合起來', doneLabelEn: 'Put it back together' }],
    paragraphs: [
      '《臺灣民俗文物辭典》記載：臺灣民間從五十歲起每十年做一次大壽；壽桃依禮俗由孫女贈賀，數量取九、十二、十六、十八、六十、八十、一〇八等吉祥數，壽宴後分送親友。家庭做法是發麵包入棗泥，捏成桃形蒸約十二分鐘，再壓紋、噴上紅色素水。',
      '模型依這段做法與一般壽桃的樣式重建（底下的兩片葉形麵皮、桃尖的紅暈），標準尺寸查無，是歷史情境重建；餡料示意為棗泥，不代表任何店家的配方。',
    ],
    paragraphsEn: [
      'The Dictionary of Taiwanese Folk Culture records that a fuller birthday is held every ten years from fifty; the granddaughter presents the peaches, in auspicious numbers, and they are shared out after the feast. At home the dough is filled with jujube paste, shaped, steamed for about twelve minutes, scored and sprayed pink.',
      'The model follows that description and the usual form of the bun; no standard size is recorded, so it is a historical reconstruction, and the filling shown is not any shop’s recipe.',
    ],
    reconstruction: true,
    sourceIds: ['th-dict-shoutao', 'mirrormedia-2024-shizixuan'],
  },
  'kueh-mold': {
    id: 'kueh-mold',
    title: '龜粿印',
    titleEn: 'Turtle kueh mould',
    lead: '塗朱漆的木刻粿印：一面刻龜、一面刻桃與銀圓、側邊七枚連錢——印在紅龜粿上，就是長壽與富足的祝福。',
    leadEn: 'A red-lacquered wooden mould: a turtle on one face, a peach and a silver dollar on the other, seven linked coins along the side—pressed into the cake as a wish for long life and plenty.',
    actions: [{ id: 'press', label: '掀起粿印', labelEn: 'Lift the mould', doneLabel: '蓋回去', doneLabelEn: 'Press it back' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「朱漆三面龜桃連錢紋帶柄粿印」（2003.001.0563）：木質，連柄長36.1、寬17.3、高3.3公分；龜甲由外到內兩圈、中央六角框裡刻「壽」，另一面是桃紋與銀圓紋，側面七枚連錢，握柄底部鑽有鐵圈；雕紋殘留朱紅、有蟲蛀，館方判斷曾經實際使用，年代沒有標明。',
      '教育部辭典寫粿印「一面桃、一面龜」，有長壽之意。模型的紋樣是簡化的示意，不是那件典藏的複製；底下的紅龜粿依辭典的做法（糯米、粿皮染紅、印上龜紋蒸熟）重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s red-lacquered three-faced kueh mould (2003.001.0563): wood, 36.1 × 17.3 × 3.3 cm with handle, two rings of turtle shell around a hexagon carved “longevity,” a peach and silver dollar on the reverse, seven coins on the side and an iron ring under the handle. Traces of red and insect holes show it was used; no date is given.',
      'The Ministry of Education dictionary describes kueh moulds with a peach on one side and a turtle on the other, both for long life. The carving here is simplified, not a copy; the red turtle cake follows the dictionary’s description.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-kueh-mold-0563', 'moe-gui-yin', 'moe-hong-gui', 'kmh-kueh-mold'],
  },
  'shouxian-cakes': {
    id: 'shouxian-cakes',
    title: '收涎餅',
    titleEn: 'Drool-catching biscuits',
    lead: '十二片中間有孔的小圓餅，串在一條紅絲線上——嬰兒滿四個月，外婆家送來掛在胸前，把口水「收」起來。',
    leadEn: 'Twelve little biscuits with holes, strung on red thread—brought by the mother’s family at four months and hung on the baby’s chest to “gather up the drool.”',
    actions: [{ id: 'lift', label: '提起紅線', labelEn: 'Lift the string', doneLabel: '放回紅紙上', doneLabelEn: 'Lay it down' }],
    paragraphs: [
      '教育部《臺灣台語常用詞辭典》「收瀾」：嬰兒滿四個月時，外婆家送來中間有孔的口酥餅，用紅絲線串起掛在嬰兒胸前，象徵收口水。客家「做四個月」也有收涎，餅數取十二、二十四、三十六片的雙數，請長輩拿餅在嬰兒嘴邊抹一抹。',
      '餅的大小、顏色與紅線的打法查無統一的形制，模型是依辭典描述的歷史情境重建，不代表任何店家的產品。',
    ],
    paragraphsEn: [
      'The Ministry of Education dictionary describes the four-month custom: the mother’s family brings biscuits with a hole in the middle, strung on red thread and hung on the baby’s chest to stop the drooling. Hakka families do the same, with twelve, twenty-four or thirty-six biscuits brushed past the baby’s lips by an elder.',
      'There is no fixed size or style for the biscuits or the knot; the model is a historical reconstruction from the dictionary, not any shop’s product.',
    ],
    reconstruction: true,
    sourceIds: ['moe-shou-lan', 'hakka-four-months', 'ettoday-2019-litingxiang'],
  },
  monaka: {
    id: 'monaka',
    title: '最中',
    titleEn: 'Monaka',
    lead: '糯米燒成的花形薄脆餅皮，中間夾著紅豆餡——掀開上片，看看裡頭的豆粒。',
    leadEn: 'Flower-shaped wafers of baked glutinous rice around red bean paste—lift the top to see the beans inside.',
    actions: [{ id: 'fill', label: '掀開餅皮', labelEn: 'Lift the wafer', doneLabel: '合起來', doneLabelEn: 'Close it' }],
    paragraphs: [
      '最中是以糯米燒成的酥脆餅皮包入豆餡的和菓子。《料理．台灣》（2021）的專訪記載，滋養四季都有紅豆餡的最中；日治時期，日本人把羊羹、饅頭、煎餅等菓子的做法帶進臺灣，在臺灣多成為伴手禮。',
      '模型依一般最中的樣式（兩片花形餅皮、顆粒紅豆餡）重建，不是滋養產品的複製，也不代表店家的配方或包裝。',
    ],
    paragraphsEn: [
      'Monaka is a Japanese confection of crisp glutinous-rice wafers filled with bean paste; a 2021 interview notes that Ziyang makes red-bean monaka all year. Japanese-era recipes for sweets such as yōkan, manjū and senbei often became visiting gifts in Taiwan.',
      'The model follows the usual form—two flower-shaped wafers and chunky red bean paste—and is not a copy of the shop’s product, recipe or packaging.',
    ],
    reconstruction: true,
    sourceIds: ['ryori-taiwan-ziyang', 'chen-jingkuan-2022-xingang'],
  },
}

/* ── 路線 ── */
export const PASTRY_ROUTE = {
  id: 'pastry',
  title: '一塊糕餅的人生',
  titleEn: 'A Life in Pastries',
  intro: '老屋新生的大稻埕，糕餅店與粿攤還做著人生大事的點心：做壽的壽桃、週歲的紅龜粿、四個月的收涎餅與訂婚的大餅，還有日治時期傳進來的和菓子。四家店各有來歷，只依主題並列，彼此沒有傳承關係。',
  introEn: 'In revived Dadaocheng, bakeries and kueh stalls still make the sweets of life’s milestones: birthday peaches, first-birthday turtle cakes, four-month biscuits and engagement cakes, and wagashi from the Japanese era. The four shops are unrelated; they are grouped here by theme alone.',
  closing: '從四個月的收涎餅、週歲的紅龜粿，到訂婚的大餅與八十歲的壽桃——糕餅陪著一個人走過一生。同一個禮俗常常因地方、因家庭而不同；這四家店也各有各的來歷，彼此沒有傳承關係。',
  closingEn: 'From the four-month biscuits and first-birthday turtles to the engagement cake and the eightieth-birthday peaches, pastries keep company with a whole life. The same custom differs from place to place and family to family, and the four shops each have their own, unrelated story.',
  eraId: ERA,
  nodes: [
    {
      id: 'peach',
      kind: 'talk',
      journalIds: ['talk:pastry-peach', 'object:longevity-peach'],
      title: '做壽：十字軒的壽桃',
      titleEn: 'A birthday: longevity peaches at Shizixuan',
      hint: '北側街屋的十字軒門口，有人在算要訂幾顆壽桃。',
      hintEn: 'Outside Shizixuan on the north side, someone is counting out an order of longevity peaches.',
      npcIds: [npc('pastry-peach')],
      shopId: 'shizixuan',
    },
    {
      id: 'kueh',
      kind: 'talk',
      journalIds: ['talk:pastry-kueh', 'object:kueh-mold'],
      title: '添丁與週歲：好粿緣的紅龜粿',
      titleEn: 'A new child: red turtle cakes at Hao Guo Yuan',
      hint: '走進永樂市場一樓，好粿緣的攤位前有位阿伯在挑紅龜粿。',
      hintEn: 'Inside the ground floor of Yongle Market, a grandfather is choosing red turtle cakes at Hao Guo Yuan.',
      npcIds: [npc('pastry-kueh')],
      shopId: 'hao-guo-yuan',
    },
    {
      id: 'shouxian',
      kind: 'talk',
      journalIds: ['talk:pastry-shouxian', 'object:shouxian-cakes'],
      title: '四個月與訂婚：李亭香的收涎餅與大餅',
      titleEn: 'Four months and an engagement: Li Ting Xiang',
      hint: '南側街屋的李亭香門口，外婆在等著包收涎餅。',
      hintEn: 'Outside Li Ting Xiang on the south side, a grandmother waits for her biscuits.',
      npcIds: [npc('pastry-shouxian')],
      shopId: 'li-ting-xiang',
    },
    {
      id: 'wagashi',
      kind: 'talk',
      journalIds: ['talk:pastry-wagashi', 'object:monaka'],
      title: '送禮：滋養的和菓子',
      titleEn: 'A visiting gift: wagashi at Ziyang',
      hint: '街的西端、河岸廣場旁的紅磚轉角樓，有人在挑伴手禮。',
      hintEn: 'At the red-brick corner building by the riverside plaza, someone is choosing a gift.',
      npcIds: [npc('pastry-wagashi')],
      shopId: 'zi-yang',
    },
  ],
}
