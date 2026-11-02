import { YJ_INSPECT_SPOTS } from './youJiLayout.js'

/**
 * 有記名茶各年代室內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/youJi/youJiInspect.js；文字與查證見 docs/research/interior-you-ji.md 第 3 節。
 *
 * - YJ_OBJECTS：新的器物（嘜頭、稻殼焙窟、風選機〔與新芳春共用〕、南管樂器）
 * - YJ_WHERE：共用器物（揀茶竹淺盤、焙籠）在有記的補充說明（併進該器物的「在哪家店」）
 * - YJ_INSPECTABLES：器物在各年代店裡的位置（併進 data/inspectObjects.js 的 STREET_INSPECTABLES）
 */

const YJ = 'you-ji'

export const YJ_OBJECTS = {
  'mark-stencil': {
    id: 'mark-stencil',
    title: '嘜頭',
    titleEn: 'Shipping-mark stencil',
    lead: '竹篾編的茶箱印不上字，就把「有記」、收貨店號、品名、重量刻成一塊塊鏤空的木板，蘸漆刷上去——這塊板叫嘜頭。',
    leadEn: 'A bamboo-wrapped tea chest will not take print, so the firm’s name, the consignee, the tea and the weight were cut as stencils into boards and brushed on in paint—each board is a “mark”.',
    actions: [{ id: 'brush', label: '刷一箱', labelEn: 'Brush a chest', doneLabel: '收起來', doneLabelEn: 'Put it away' }],
    paragraphs: ['有記官網部落格〈Ewkee〉：竹編的茶箱不能印刷，寄件、收件、品名、重量做成嘜頭，用漆逐一刷上；字形留「斷點」，鏤空的字才不會散掉。板上的字樣是示意。'],
    paragraphsEn: ['Youji’s blog post “Ewkee”: bamboo-jacketed chests could not be printed, so sender, consignee, tea and weight were made into stencils and brushed on in paint; the letterforms keep “bridges” so the cut-out does not fall apart. The lettering on the model is illustrative.'],
    reconstruction: true,
    sourceIds: ['wangtea-ewkee-blog', 'ntcri-80-wangtea-lab'],
    layers: {
      form: [
        {
          text: '深色矩形木板，刻鏤空的字與菱形框，中英文都有，約 A4 到 A3 大；字形保留「斷點」，鏤空的字才不會散掉。〔照片〕《臺灣工藝》80 期 p.49：老店文物區一面木板牆釘掛十餘塊。',
          textEn: 'Dark rectangular boards with the characters and a diamond frame cut through, in Chinese and English, roughly A4 to A3; the letterforms keep “bridges” so the cut-out does not fall apart. Seen in Taiwan Crafts no. 80, p. 49: a dozen or more hung on a board wall in the old shop’s display area.',
          sourceIds: ['ntcri-80-wangtea-lab', 'wangtea-ewkee-blog'],
        },
        { text: '板上的字樣是示意，不是任何一塊實物的摹本。', textEn: 'The lettering on the model is illustrative, not a copy of any one board.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '茶箱：內層木板釘製，外層竹篾編織護罩，為了防潮；四兩的紙包本身不防潮。',
          textEn: 'The chest: an inner box of nailed boards and an outer woven-bamboo jacket, for damp-proofing; the four-tael paper packet inside is not damp-proof on its own.',
          sourceIds: ['wangtea-ewkee-blog'],
        },
      ],
      use: [
        {
          text: '有記的英文名「Ong Ew Kee Tea Hong」是閩南語音譯；當年約佔泰國茶葉市場一半以上，茶箱上的嘜頭寫的就是寄給曼谷收貨店的資訊。',
          textEn: 'The firm’s English name “Ong Ew Kee Tea Hong” is a Hokkien transliteration; in its day it held about half the Thai tea market, and the marks on the chests carried the consignment details for Bangkok.',
          sourceIds: ['wangtea-ewkee-blog'],
        },
        {
          text: '日治時期有記出口茶到泰國有紀錄；1949 年因泰國外銷激增遷到現址。',
          textEn: 'Youji’s exports to Thailand in the Japanese era are recorded; in 1949 the surge in Thai exports made it move to the present site.',
          sourceIds: ['cna-tea-thailand-2025', 'wangtea-transformation'],
        },
      ],
      where: [{ text: '有記四個年代的前店；老屋新生的文物區。', textEn: 'The front shop of Youji in all four eras; the display area in the revival era.' }],
      evidence: [
        {
          text: '有記官網部落格〈Ewkee〉（2017-01-18）；《臺灣工藝》80 期 p.49 圖 1 與圖說。',
          textEn: 'Youji’s blog post “Ewkee” (18 Jan 2017); Taiwan Crafts no. 80, p. 49, plate 1 and caption.',
          sourceIds: ['wangtea-ewkee-blog', 'ntcri-80-wangtea-lab'],
        },
        { text: '英文、泰文商標本身的照片：本站沒有找到。', textEn: 'Photographs of the English and Thai labels themselves: not found by this site.', status: 'pending' },
      ],
    },
  },

  'husk-ash-pit': {
    id: 'husk-ash-pit',
    title: '稻殼焙窟',
    titleEn: 'Rice-husk roasting pit',
    lead: '深 58 公分的圓坑，碳化的黑稻殼點火燒成白灰當熱源，上面架焙籠，日夜不停焙 20 天。',
    leadEn: 'A round pit 58 cm deep: carbonised black rice husk lit and burnt down to white ash for heat, a basket set over it, firing day and night for twenty days.',
    actions: [{ id: 'rake', label: '撥一下灰', labelEn: 'Rake the ash', doneLabel: '放下耙子', doneLabelEn: 'Put the rake down' }],
    paragraphs: ['《臺灣工藝》80 期：沒有電窯的時代，把炭化的黑色稻殼點火燒成白灰做熱源，放在深 58 公分的炭焙窟中，上方再置焙籠，日夜不休烘焙 20 天。'],
    paragraphsEn: ['Taiwan Crafts no. 80: before electric kilns, carbonised black rice husk was lit and burnt to white ash for heat in charcoal pits 58 cm deep, a basket set above, firing day and night for twenty days.'],
    reconstruction: true,
    sourceIds: ['ntcri-80-wangtea-lab', 'yam-2025-wangtea'],
    layers: {
      form: [
        {
          text: '圓形的坑，坑內鋪滿灰色細粉狀的灰，邊緣有碎木炭；坑間是水泥地。〔照片〕官網 Z62A0078 俯拍一坑。坑口的尺寸照片無法量，模型依林華泰的「直徑約兩尺」。',
          textEn: 'A round pit full of fine grey ash with bits of charcoal at the rim, cement floor between pits (seen in the shop’s photo Z62A0078, shot from above). The mouth cannot be measured from the photo; the model uses Lin Huatai’s “about two feet across”.',
          sourceIds: ['wangtea-store'],
          status: 'reconstruction',
        },
        {
          text: '微笑台灣寫焙籠間「以紅磚搭出成排的坑」；官網照片裡坑間看起來是水泥。模型用磚砌邊、水泥面。',
          textEn: 'Smile Taiwan says the pits are built in rows of red brick; in the shop’s photo the ground between them looks like cement. The model uses brick edges and a cement surface.',
          sourceIds: ['smiletaiwan-3760-wangtea'],
        },
      ],
      making: [
        {
          text: '木炭敲碎、鋪上碳化稻殼：稻殼隔熱又擋煙，茶只吸熱氣不帶火氣；熱氣足夠才放焙籠。',
          textEn: 'Crush the charcoal, spread carbonised husk over it: the husk insulates and holds back smoke, so the tea takes heat without fire-taint; the basket goes on only when the heat is right.',
          sourceIds: ['yam-2025-wangtea'],
        },
        {
          text: '深達 58 公分的炭焙窟，日夜不休烘焙 20 天（《臺灣工藝》80 期）；今周刊寫 2–3 週。',
          textEn: 'Pits 58 cm deep, fired day and night for 20 days (Taiwan Crafts no. 80); Business Today says two to three weeks.',
          sourceIds: ['ntcri-80-wangtea-lab', 'businesstoday-wangtea-2018'],
        },
      ],
      use: [
        {
          text: '焙籠間建於日治時期，仍有約 40 個焙籠在焙窟上運作，是大稻埕僅存仍在運作的焙窟。',
          textEn: 'The roasting room dates from the Japanese era; about forty baskets are still at work over the pits, the last working pits in Dadaocheng.',
          sourceIds: ['wangtea-story', 'yam-2025-wangtea'],
        },
        {
          text: '早年對街的洗衣店會把衣服送來焙籠間烘乾，衣服因而茶香四溢。',
          textEn: 'In the old days the laundry across the street sent clothes over to dry in the roasting room, and they came back smelling of tea.',
          sourceIds: ['ntcri-80-wangtea-lab'],
        },
        {
          text: '1949 年以前有記的精製廠在建昌街，本站把焙窟放進摩登年代的這棟是歷史情境重建。',
          textEn: 'Before 1949 Youji’s refinery was on Jianchang Street; placing the pits in this building in the modern era is a reconstructed scene.',
          status: 'reconstruction',
        },
      ],
      where: [
        {
          text: '有記摩登、庶民生活、老屋新生的焙籠間。林華泰摩登的「炭焙火坑」用相思木炭蓋稻糠，是另一種做法。',
          textEn: 'Youji’s roasting room in the modern, postwar and revival eras. Lin Huatai’s modern-era charcoal pits, acacia charcoal under rice husk, are a different method.',
        },
      ],
      evidence: [
        {
          text: '《臺灣工藝》80 期 p.48 原文；官網門市頁照片 Z62A0078、Z62A0042（工具）、Z62A0087（焙籠）；蕃薯藤 2025-12-18；微笑台灣。',
          textEn: 'Taiwan Crafts no. 80, p. 48; the shop’s photos Z62A0078, Z62A0042 and Z62A0087; Yam News 18 Dec 2025; Smile Taiwan.',
          sourceIds: ['ntcri-80-wangtea-lab', 'wangtea-store', 'yam-2025-wangtea', 'smiletaiwan-3760-wangtea'],
        },
        { text: '焙窟的確切數量與排列：查無（只有「約 40 個焙籠」）。', textEn: 'The exact number and layout of the pits: not found (only “about forty baskets”).', status: 'pending' },
      ],
    },
  },

  'winnowing-machine': {
    id: 'winnowing-machine',
    title: '風選機',
    titleEn: 'Tea winnowing machine',
    lead: '木作的風車機：茶從上面倒進去，風把輕的碎末吹遠、重的茶往近處落，下緣一排出料斗各接一等。',
    leadEn: 'A wooden fan machine: tea goes in at the top, the wind carries the light dust far and drops the heavy leaf near, and a row of chutes along the bottom catches each grade.',
    actions: [{ id: 'crank', label: '搖一下', labelEn: 'Turn the crank', doneLabel: '停下來', doneLabelEn: 'Stop it' }],
    paragraphs: ['有記官網：仍使用老木作風選機。精製茶的最後一道是風選，把碎末、茶角和整葉分開。模型依官網照片的局部，尺寸是目測。'],
    paragraphsEn: ['Youji’s website: the old wooden winnower is still in use. Winnowing is the last step of refining, separating dust, broken leaf and whole leaf. The model follows a detail in the shop’s photo; sizes are estimated by eye.'],
    reconstruction: true,
    sourceIds: ['wangtea-store', 'wangtea-story'],
    layers: {
      form: [
        {
          text: '有記：直立木格框，上方垂下皮帶或拉繩，下緣斜向伸出一排 4–5 個木製出料斗（每個約 20 公分寬），竹簍在下面承接（〔照片〕官網 Z62A0031，只拍到局部）。',
          textEn: 'Youji: an upright wooden lattice frame, a belt or cord hanging from above, a row of four or five wooden chutes (each about 20 cm wide) sloping out at the bottom, a bamboo basket underneath (the shop’s photo Z62A0031, a detail only).',
          sourceIds: ['wangtea-store'],
        },
        {
          text: '新芳春：「大稻埕現存最大的風選機」，木作斜槽（帆布帶）從高處木格箱斜下到地面，連到一具深色鐵漏斗，大鐵飛輪、皮帶，主體深灰藍漆，長約 4–5 公尺（〔照片〕Wikimedia Commons〈新芳春茶行風選機.jpg〉，氏子，CC BY-SA 4.0）。',
          textEn: 'Xinfangchun: “the largest surviving winnower in Dadaocheng”, a wooden chute (canvas belt) sloping from a high lattice box to the floor, joined to a dark iron hopper, a big iron flywheel and belt, the body painted grey-blue, about 4–5 m long (Wikimedia Commons, “Xinfangchun winnowing machine”, CC BY-SA 4.0).',
          sourceIds: ['commons-xfc-winnower'],
        },
        { text: '本站兩間店各依自己的照片建模；尺寸是目測。', textEn: 'Each shop’s model follows its own photograph; sizes are estimated by eye.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '精製茶的流程：分級、揀梗、焙火、拼配、風選；風選是最後一道，把碎末、茶角和整葉分開。',
          textEn: 'Refining: grading, stalk-picking, firing, blending and winnowing; winnowing is the last step, separating dust, broken leaf and whole leaf.',
          sourceIds: ['businesstoday-wangtea-2018'],
        },
      ],
      use: [
        {
          text: '有記仍使用老木作風選機（官網）；新芳春的機具在 2016 年起的茶葉故事館裡展示。',
          textEn: 'Youji still uses its old wooden winnower (its website); Xinfangchun’s machines are on show in the tea story house opened in 2016.',
          sourceIds: ['wangtea-story', 'ntcri-77-xinfangchun'],
        },
      ],
      where: [{ text: '有記庶民生活、老屋新生的焙籠間前段；新芳春三個年代的後進加工廠。', textEn: 'At the front of Youji’s roasting room in the postwar and revival eras; the rear-bay factory of Xinfangchun in all three eras.' }],
      evidence: [
        {
          text: '官網門市頁 Z62A0031；Wikimedia Commons〈新芳春茶行風選機.jpg〉；《臺灣工藝》77 期 p.54 原文「保留了乾燥機和風選機等機具」。',
          textEn: 'Youji’s photo Z62A0031; Commons “Xinfangchun winnowing machine”; Taiwan Crafts no. 77, p. 54.',
          sourceIds: ['wangtea-store', 'commons-xfc-winnower', 'ntcri-77-xinfangchun'],
        },
        { text: '臺史博的風選機典藏條目：本站沒有找到。', textEn: 'An NMTH record of a tea winnower: not found by this site.', status: 'pending' },
      ],
    },
  },

  'nanguan-instruments': {
    id: 'nanguan-instruments',
    title: '清源堂的南管樂器',
    titleEn: 'Nanguan instruments at Qingyuan Hall',
    lead: '二樓的揀茶樓現在是清源堂：牆上掛著琵琶、三絃、洞簫，每週六下午有南管演奏，預約就能免費聽。',
    leadEn: 'The upstairs sorting loft is now Qingyuan Hall: a pipa, a sanxian and a dongxiao hang on the wall, and there is nanguan music every Saturday afternoon, free with a booking.',
    actions: [{ id: 'look', label: '走近看', labelEn: 'Take a closer look', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['官網門市頁照片：清源堂的牆上掛著幾件南管樂器。本站只畫照片看得到的四件，名稱以照片可辨為限。'],
    paragraphsEn: ['The shop’s photo of Qingyuan Hall shows several nanguan instruments on the wall. This site models only the four that can be seen, named only as far as the photo allows.'],
    reconstruction: true,
    sourceIds: ['wangtea-store', 'wangtea-transformation'],
    layers: {
      form: [
        {
          text: '〔照片〕官網 IMG_0923：牆上掛數件樂器，可辨一把梨形琵琶、一把長頸小身的三絃或二絃、一件圓身的月琴形樂器、一支細長的管子（疑似洞簫）與紅穗。本站只畫看得到的四件，名稱以照片可辨為限。',
          textEn: 'In the shop’s photo IMG_0923 several instruments hang on the wall: a pear-shaped pipa, a long-necked small-bodied sanxian or erxian, a round-bodied yueqin-like instrument, and a slender pipe (probably a dongxiao) with a red tassel. This site models only the four that can be seen, named only as far as the photo allows.',
          sourceIds: ['wangtea-store'],
          status: 'pending',
        },
      ],
      making: [
        {
          text: '不是食物；南管是這間茶行選來配茶的音樂，官網說「南管演奏伴訪客喝茶的下午」。',
          textEn: 'Not a foodstuff: nanguan is the music this tea house chose to go with tea; the website speaks of nanguan accompanying visitors’ tea-drinking afternoons.',
          sourceIds: ['wangtea-story'],
        },
      ],
      use: [
        {
          text: '二樓原是揀茶樓，每天約四十多名女工；2004 年改成藝文空間清源堂，2008 年起每週六下午定期南管演奏（2020 年疫情曾暫停）。',
          textEn: 'Upstairs was the sorting loft, about forty women a day; in 2004 it became the arts space Qingyuan Hall, and from 2008 there has been nanguan every Saturday afternoon (paused in 2020).',
          sourceIds: ['wangtea-store', 'wangtea-transformation'],
        },
        {
          text: '舞台上方的「御前清客」匾照片可見；本站沒有找到說明這塊匾由來的文字，所以只照抄、不解釋。',
          textEn: 'The board reading “Yuqian Qingke” above the stage is visible in the photo; this site found no text on where it came from, so it is copied without explanation.',
          sourceIds: ['wangtea-store'],
          status: 'pending',
        },
      ],
      where: [{ text: '有記老屋新生的二樓（走店後的木樓梯上去）。', textEn: 'Upstairs at Youji in the revival era (up the wooden stairs at the back).' }],
      evidence: [
        {
          text: '官網門市頁 IMG_0923；年表〈轉型〉；蕃薯藤 2025（預約免費）。',
          textEn: 'The shop’s photo IMG_0923; the “Transformation” timeline; Yam News 2025.',
          sourceIds: ['wangtea-store', 'wangtea-transformation', 'yam-2025-wangtea'],
        },
      ],
    },
  },
}

/** 共用器物在有記的補充說明（「在哪家店可以接觸到」這一層） */
export const YJ_WHERE = {
  'tea-sorting-tray': [
    {
      text: '有記酒樓繁華到庶民生活的二樓揀茶樓；官網說每天約四十多名女工。',
      textEn: 'Youji’s upstairs sorting loft from the banquet era to the postwar era; the website says about forty-odd women a day.',
      sourceIds: ['wangtea-store', 'wangtea-story'],
    },
  ],
  'roasting-basket': [
    {
      text: '有記焙籠間的焙籠側面墨書「有記」，口徑約 60–70 公分、高約 50 公分（〔照片〕官網 Z62A0087）；約 40 個仍在焙窟上運作（官網）。',
      textEn: 'The baskets in Youji’s roasting room have “Youji” brushed on the side, about 60–70 cm across and 50 cm tall (the shop’s photo Z62A0087); about forty are still at work over the pits (website).',
      sourceIds: ['wangtea-store', 'wangtea-story'],
    },
  ],
}

/** 器物在有記各年代店裡的位置（世界座標在 data/youJiLayout.js 的 YJ_INSPECT_SPOTS；level 1 在二樓） */
const spot = (id, eraId, objectId, label, labelEn) => ({ id, eraId, shopId: YJ, objectId, label, labelEn, level: 0, ...YJ_INSPECT_SPOTS[id] })

export const YJ_INSPECTABLES = [
  spot('yj-banquet-mark-stencil', 'banquet', 'mark-stencil', '牆上的嘜頭板', 'Stencil boards on the wall'),
  spot('yj-banquet-sorting-tray', 'banquet', 'tea-sorting-tray', '揀茶樓的竹淺盤', 'Sorting tray in the loft'),
  spot('yj-modern-husk-pit', 'modern', 'husk-ash-pit', '稻殼焙窟', 'Rice-husk pit'),
  spot('yj-modern-mark-stencil', 'modern', 'mark-stencil', '牆上的嘜頭板', 'Stencil boards on the wall'),
  spot('yj-modern-sorting-tray', 'modern', 'tea-sorting-tray', '揀茶樓的竹淺盤', 'Sorting tray in the loft'),
  spot('yj-postwar-winnower', 'postwar', 'winnowing-machine', '老木作風選機', 'The old wooden winnower'),
  spot('yj-postwar-husk-pit', 'postwar', 'husk-ash-pit', '稻殼焙窟', 'Rice-husk pit'),
  spot('yj-postwar-sorting-tray', 'postwar', 'tea-sorting-tray', '揀茶樓的竹淺盤', 'Sorting tray in the loft'),
  spot('yj-revival-winnower', 'revival', 'winnowing-machine', '仍在用的風選機', 'The winnower still in use'),
  spot('yj-revival-husk-pit', 'revival', 'husk-ash-pit', '焙籠間的焙窟', 'Pit in the roasting room'),
  spot('yj-revival-mark-stencil', 'revival', 'mark-stencil', '文物區的嘜頭板', 'Stencil boards in the display'),
  spot('yj-revival-roasting-basket', 'revival', 'roasting-basket', '疊放的焙籠', 'Stacked roasting baskets'),
  spot('yj-revival-nanguan', 'revival', 'nanguan-instruments', '清源堂的南管樂器', 'Nanguan instruments'),
]
