/**
 * 主題路線「街坊故事」（第 12 階段）：酒樓繁華（1895–1930）的大稻埕，一個虛構的跑腿少年「阿福」的一天。
 * 玩家不會遇見阿福本人：從南北貨行的夥計、揀茶間的阿姨、漢藥行的學徒、廟口找手鐲的阿嬤口中，
 * 拼出他從早到晚跑了哪些腿、最後替阿嬤找回了什麼。
 *
 * 對白全部標「虛構對白」：阿福與四位街坊都是虛構的人物，站在一般的街屋前，不代表任何真實的店家
 * （不把虛構的生意往來安在江山樓、林復振、乾元藥行這些真實店家身上）。
 * 器物的形制依國立臺灣歷史博物館典藏（說明裡附出處）。查證紀錄見 docs/research/neighbour-route.md。
 */

const ERA = 'banquet'

/* ── 情境人物（data/routeFigures.js 合併；都在一般街屋前，離有名字的店家有一段距離） ── */
export const NEIGHBOUR_FIGURES = [
  { id: 'nb-dryshop', eraId: ERA, look: 'banquetShopHand', pose: 'stand', position: [-6.5, 2.2], rotationY: Math.PI - 0.3 },
  { id: 'nb-tea', eraId: ERA, look: 'banquetTeaSorter', pose: 'stand', position: [24.6, -2.2], rotationY: 0.4 },
  { id: 'nb-herb', eraId: ERA, look: 'banquetApprentice', pose: 'stand', position: [-18.6, -2.2], rotationY: 0.2 },
  { id: 'nb-grandma', eraId: ERA, look: 'banquetGrandma', pose: 'stand', position: [6.4, 2.3], rotationY: Math.PI + 0.3 },
]

const route = (id) => `route-${id}`
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

/* ── 路人對話（全部是虛構對白；格式見 game/talk.js） ── */
export const NEIGHBOUR_TALK = [
  {
    id: 'nb-dryshop',
    eraId: ERA,
    npcId: route('nb-dryshop'),
    role: '南北貨行的夥計',
    roleEn: 'A dry-goods shop assistant',
    doing: '一早就在店門口秤香菇',
    doingEn: 'Weighing dried mushrooms at the shop front since dawn',
    objectId: 'glazed-jar',
    lines: [
      fiction('你找阿福？那個跑腿的囝仔，天未光就來過了。', 'Looking for Ah-hok, the errand boy? He was here before sunrise.'),
      fiction('他替巷尾的人家買一斤香菇、半斤金針，錢算得比我還清楚。', 'Bought a catty of mushrooms and half a catty of lily buds for a family down the lane—counted the money better than I do.'),
    ],
    followUps: [
      {
        id: 'who',
        question: '阿福是誰？',
        questionEn: 'Who is Ah-hok?',
        lines: [
          fiction('隔壁巷仔的囝仔，才十二歲，阿爸在碼頭挑貨。整條街的人都叫他跑腿。', 'A boy from the next lane, just twelve, his father a porter at the wharf. The whole street sends him on errands.'),
          fiction('跑得快、記性好，就是愛在廟口看人下棋，常常忘了回家吃飯。', 'Quick on his feet, sharp memory—but he loves watching the chess games by the temple and forgets to go home for dinner.'),
        ],
      },
      {
        id: 'jar',
        question: '香菇都放在哪裡？',
        questionEn: 'Where do you keep the mushrooms?',
        lines: [
          fiction('乾貨最怕潮，香菇、蝦米都收在有蓋的陶罐裡，要賣才打開。', 'Dried goods hate damp—mushrooms and shrimp live in lidded jars, opened only to sell.'),
          fiction('這罐的蓋子上還坐著一隻小獅子，阿福每次來都要摸一下。', 'This one has a little lion sitting on its lid—Ah-hok pats it every time he comes.'),
        ],
      },
    ],
  },
  {
    id: 'nb-tea',
    eraId: ERA,
    npcId: route('nb-tea'),
    role: '揀茶間的阿姨',
    roleEn: 'A tea sorter',
    doing: '揀茶揀到中午，出來透透氣',
    doingEn: 'Out for a breath of air after a morning of sorting tea',
    objectId: 'snack-basket',
    lines: [
      fiction('中午阿福挑點心籃來，我們揀茶的才有得吃。', 'At noon Ah-hok brought the snack basket—that’s how we tea sorters get to eat.'),
      fiction('上層放碗筷，下層是粿，他一路走一路喊「小心燒喔」。', 'Bowls and chopsticks on top, rice cakes below—he called out “careful, it’s hot!” all the way.'),
    ],
    followUps: [
      {
        id: 'work',
        question: '揀茶很辛苦嗎？',
        questionEn: 'Is tea sorting hard work?',
        lines: [
          fiction('坐一整天，把茶梗、黃片一根一根挑掉，眼睛都花了。', 'Sitting all day picking out stalks and yellow leaves one by one—my eyes go blurry.'),
          fiction('阿福說他長大要去洋行當夥計，我笑他先把字認齊再講。', 'Ah-hok says when he grows up he’ll clerk at a foreign hong—I told him to learn his characters first.'),
        ],
      },
      {
        id: 'next',
        question: '阿福接著去哪裡了？',
        questionEn: 'Where did Ah-hok go next?',
        lines: [fiction('好像要去漢藥行，替廟口的阿嬤抓藥。', 'Off to the herbalist, I think—to fetch medicine for the old woman by the temple.')],
      },
    ],
  },
  {
    id: 'nb-herb',
    eraId: ERA,
    npcId: route('nb-herb'),
    role: '漢藥行的學徒',
    roleEn: 'An herbalist’s apprentice',
    doing: '在門口曬藥材',
    doingEn: 'Spreading herbs to dry by the door',
    objectId: 'apothecary-scale',
    lines: [
      fiction('阿福下晡拿藥單來，說阿嬤這幾天腳痠。', 'Ah-hok came by this afternoon with a prescription—says the old woman’s legs have been aching.'),
      fiction('師傅一味一味用戥子秤，我包好，交代他回去先煎一碗。', 'The master weighed each herb on the little scale, I wrapped them, and told him to brew a bowl as soon as he got back.'),
    ],
    followUps: [
      {
        id: 'scale',
        question: '戥子是什麼？',
        questionEn: 'What’s that little scale?',
        lines: [
          fiction('小小的秤，秤桿細得像筷子，秤藥材、秤金銀都用它，差一點都不行。', 'A tiny steelyard, the beam thin as a chopstick—for herbs and for gold and silver alike, where a hair’s difference matters.'),
          fiction('不用的時候收在木盒裡，盒子的形狀像一把琵琶。', 'When it’s not in use it lives in a wooden case shaped like a pipa.'),
        ],
      },
      {
        id: 'worry',
        question: '阿嬤還好嗎？',
        questionEn: 'Is the old woman all right?',
        lines: [fiction('阿福說阿嬤今天心情不好，好像掉了什麼東西，一直在廟口找。', 'Ah-hok says she’s upset today—she seems to have lost something and keeps searching around the temple.')],
      },
    ],
  },
  {
    id: 'nb-grandma',
    eraId: ERA,
    npcId: route('nb-grandma'),
    role: '廟口的阿嬤',
    roleEn: 'The old woman by the temple',
    doing: '手上戴著剛找回來的銀手鐲',
    doingEn: 'Wearing the silver bracelet she just got back',
    objectId: 'silver-bracelet',
    lines: [
      fiction('我的手鐲早上拜拜的時候不見了，找了一整天……', 'My bracelet went missing at the morning prayers, and I searched all day…'),
      fiction('黃昏的時候，阿福在廟埕的石縫裡找到了，一路跑來還給我。', 'At dusk Ah-hok found it in a crack between the paving stones of the temple square, and ran all the way to bring it back.'),
    ],
    followUps: [
      {
        id: 'bracelet',
        question: '這手鐲很重要嗎？',
        questionEn: 'Does the bracelet mean a lot to you?',
        lines: [
          fiction('這是我出嫁的時候阿母給的，幾條銀線絞在一起，大家叫它「索仔環」。', 'My mother gave it to me when I married—strands of silver twisted together; people call it a rope bangle.'),
          fiction('戴了五十年，銀都磨亮了。', 'Fifty years on my wrist, and the silver’s worn bright.'),
        ],
      },
      {
        id: 'thanks',
        question: '阿福呢？',
        questionEn: 'And Ah-hok?',
        lines: [
          fiction('我塞了一個銅錢給他，他不肯收，說跑腿跑習慣了。', 'I pressed a copper coin on him, but he wouldn’t take it—said running errands is just what he does.'),
          fiction('後來還是收了，跑去廟口買零嘴，嘻嘻哈哈地回家了。', 'In the end he took it, ran off to buy a treat by the temple, and went home laughing.'),
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/neighbourObjects.js） ── */
export const NEIGHBOUR_OBJECTS = {
  'glazed-jar': {
    id: 'glazed-jar',
    title: '醬釉帶蓋陶罐',
    titleEn: 'Lidded brown-glazed jar',
    lead: '上寬下窄的直筒陶罐，外面一層醬色的釉，蓋紐是一隻回頭坐著的小獅子——乾貨收在裡面，不怕受潮。',
    leadEn: 'A straight-sided earthenware jar in brown glaze, a little lion looking back over its shoulder on the lid—dry goods stay safe from the damp inside.',
    actions: [{ id: 'lid', label: '打開蓋子', labelEn: 'Lift the lid', doneLabel: '蓋回去', doneLabelEn: 'Close it' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「醬釉帶蓋筒形罐」（2005.010.0340）：日本時代，臺灣南投，陶瓷，高 15.3、徑 15.4 公分，872.8 公克；器身上寬下窄的直筒、上下各兩道陰刻弦紋，橙紅胎拉坯成形、外施醬釉，笠式平沿蓋、蓋紐為回首坐臥的獅形；館方說明多用於儲存食物。',
      '罐裡的乾香菇是示意；南北貨行與阿福都是虛構的，不代表任何真實的店家。是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s lidded brown-glazed jar (2005.010.0340): Japanese era, Nantou, earthenware, 15.3 cm high and 15.4 cm across; straight sides narrowing downward, incised bands, orange body under a brown glaze, a flat-brimmed lid with a seated lion looking back; used for storing food.',
      'The mushrooms are illustrative; the shop and Ah-hok are fictional. A historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-glazed-jar-2005-010-0340'],
  },
  'snack-basket': {
    id: 'snack-basket',
    title: '竹編點心籃',
    titleEn: 'Bamboo snack basket',
    lead: '一組三件的竹籃：頂蓋、放碗筷的中隔層、裝點心的提籃，提把中央的藤環可以穿扁擔挑。',
    leadEn: 'A three-piece bamboo set—lid, a middle tray for bowls and chopsticks, and the basket for food—with a rattan ring on the handle for a carrying pole.',
    actions: [{ id: 'open', label: '掀蓋看點心', labelEn: 'Open it up', doneLabel: '收回去', doneLabelEn: 'Pack it back' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「墨繪竹編點心籃組」（2000.001.0010）：推測日治時期或戰後初期，竹篾編製，長 50.5、寬 40.5、高 74.3 公分，3.3 公斤；頂蓋中央隆起、頂面墨繪多層六邊形；中隔層壁高約 9 公分，底下三支竹條交叉成米字；提籃的提把由 6 條細竹條與 1 條粗竹條組成，頂端藤圈固定、中央藤環可穿扁擔，外壁墨書福祿壽變體字與花卉藤蔓。館方說明：農忙時盛裝點心或飯菜送給工作的人，下層放菜或點心、上層放碗筷。',
      '墨繪的字與花是示意的色塊；揀茶間與阿福的故事是虛構的。是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s ink-painted bamboo snack basket set (2000.001.0010): Japanese era or early postwar, woven bamboo, 50.5 × 40.5 × 74.3 cm, 3.3 kg; a domed lid painted with hexagons, a 9 cm-deep middle tray braced with crossed slats, and a basket whose handle of six thin and one thick strip ends in a rattan ring for a pole, its side inked with characters for fortune, wealth and longevity. It carried snacks and meals to people at work—food below, bowls on top.',
      'The ink painting is shown as blocks; the tea-sorting story is fiction. A historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-snack-basket-2000-001-0010'],
  },
  'apothecary-scale': {
    id: 'apothecary-scale',
    title: '戥子（戥秤組合）',
    titleEn: 'Apothecary steelyard',
    lead: '細得像筷子的秤桿、紫繩吊著的小秤盤、繫紅繩的鐘形秤陀，收在琵琶形的木盒裡——一味藥差一點都不行。',
    leadEn: 'A beam thin as a chopstick, a little pan on purple cords and a bell-shaped weight on a red cord, all kept in a pipa-shaped case—when a pinch of herb matters.',
    actions: [{ id: 'weigh', label: '秤一味藥', labelEn: 'Weigh the herb', doneLabel: '放下', doneLabelEn: 'Set it down' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「戥秤組合」（2011.025.0249）：日本時代，整組 8.1 × 24.7 × 3.5 公分、131.6 公克；琵琶形木盒有兩個凹槽，分別收秤與秤陀；戥秤約 20 公分長、徑約 0.5 公分，一端包金屬、黑色秤星，兩條紫繩提紐，紫繩連接金屬秤盤；秤陀鐘形、頂端小耳繫紅繩。館方說明戥秤又稱厘秤、戥子，秤金銀珠寶或藥材等微量貴重物品，至今仍是中藥行的器具。',
      '盤底的徽紋與秤陀的刻字不畫；漢藥行與學徒是虛構的，不代表任何真實的藥行。是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s steelyard set (2011.025.0249): Japanese era, 8.1 × 24.7 × 3.5 cm overall; a pipa-shaped case with grooves for the beam and weight, a 20 cm beam with a metal cap and black marks, purple cord hangers and pan, and a bell-shaped weight on a red cord. Called a li or deng scale, it weighs precious metals, jewellery and herbs, and is still used in Chinese medicine shops.',
      'The pan’s emblem and the weight’s inscription are omitted; the herbalist is fictional. A historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-apothecary-scale-2011-025-0249'],
  },
  'silver-bracelet': {
    id: 'silver-bracelet',
    title: '繩紋銀手鐲',
    titleEn: 'Twisted silver bangle',
    lead: '幾條銀條交纏繞成的圓環，留一個開口套進手腕——民間叫它「索仔環」。',
    leadEn: 'Strands of silver twisted into a ring with a gap to slip over the wrist—known as a “rope bangle.”',
    actions: [{ id: 'lift', label: '拿起來看', labelEn: 'Pick it up', doneLabel: '放回布上', doneLabelEn: 'Lay it down' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「繩紋銀手鐲」（2003.014.0152.0002）：清代或日本時代，銀，直徑 6.1、高 0.6 公分，17.8 公克；由數條銀條相互交織繞成圓環，開口處可套入手腕，造型簡樸、無紋飾；臺灣民間稱為「繩索環」「索仔環」或「腳車藤」。',
      '阿嬤的故事是虛構的；銀條的股數與交纏的密度是示意，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s twisted silver bangle (2003.014.0152.0002): Qing or Japanese era, silver, 6.1 cm across and 0.6 cm high, 17.8 g; several silver strands twisted into an open ring, plain and undecorated, known in Taiwan as a rope bangle.',
      'The old woman’s story is fiction; the number and twist of the strands are illustrative—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-silver-bracelet-2003-014-0152'],
  },
}

/* ── 路線 ── */
export const NEIGHBOUR_ROUTE = {
  id: 'neighbour',
  title: '街坊故事',
  titleEn: 'Neighbourhood Stories',
  intro: '酒樓繁華的大稻埕，一個虛構的跑腿少年「阿福」的一天：早上買乾貨、中午送點心、下午抓藥，黃昏在廟埕替阿嬤找回了手鐲。你遇不到阿福，只能從街坊的話裡把他的一天拼起來——對白全部是虛構對白，器物的樣子依博物館的典藏。',
  introEn: 'One day in the life of Ah-hok, a fictional errand boy in 1920s Dadaocheng: dry goods at dawn, snacks at noon, medicine in the afternoon, and at dusk a lost bracelet found. You never meet him—only the neighbours’ words, all fiction, while the objects follow museum pieces.',
  closing: '一斤香菇、一籃點心、一帖藥、一只找回來的手鐲——阿福的一天沒有寫進任何報紙，卻是一條街每天都在發生的事。阿福和街坊都是虛構的人物，不代表任何真實的人或店家；器物的樣子依國立臺灣歷史博物館的典藏。',
  closingEn: 'A catty of mushrooms, a basket of snacks, a packet of herbs, a bracelet found—Ah-hok’s day never made the papers, but it is what happened on the street every day. He and the neighbours are fictional; the objects follow the National Museum of Taiwan History’s collection.',
  eraId: ERA,
  nodes: [
    {
      id: 'morning',
      kind: 'talk',
      journalIds: ['talk:nb-dryshop', 'object:glazed-jar'],
      title: '早上：一斤香菇',
      titleEn: 'Morning: a catty of mushrooms',
      hint: '街中段南側的一般街屋前，南北貨行的夥計在秤香菇。',
      hintEn: 'Mid-street on the south side, a dry-goods assistant weighs mushrooms.',
      npcIds: [route('nb-dryshop')],
    },
    {
      id: 'noon',
      kind: 'talk',
      journalIds: ['talk:nb-tea', 'object:snack-basket'],
      title: '中午：一籃點心',
      titleEn: 'Noon: a basket of snacks',
      hint: '街東段北側，揀茶間的阿姨出來透氣。',
      hintEn: 'On the north side of the east end, a tea sorter steps out for air.',
      npcIds: [route('nb-tea')],
    },
    {
      id: 'afternoon',
      kind: 'talk',
      journalIds: ['talk:nb-herb', 'object:apothecary-scale'],
      title: '下午：一帖藥',
      titleEn: 'Afternoon: a packet of herbs',
      hint: '街西段北側，漢藥行的學徒在門口曬藥材。',
      hintEn: 'On the north side of the west end, an herbalist’s apprentice dries herbs.',
      npcIds: [route('nb-herb')],
    },
    {
      id: 'dusk',
      kind: 'talk',
      journalIds: ['talk:nb-grandma', 'object:silver-bracelet'],
      title: '黃昏：找回來的手鐲',
      titleEn: 'Dusk: the bracelet found',
      hint: '廟口的街邊，阿嬤手上戴著剛找回來的手鐲。',
      hintEn: 'By the temple, the old woman wears the bracelet she just got back.',
      npcIds: [route('nb-grandma')],
    },
  ],
}
