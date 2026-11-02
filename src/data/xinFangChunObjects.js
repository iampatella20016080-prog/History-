import { XFC_INSPECT_SPOTS } from './xinFangChunLayout.js'

/**
 * 新芳春茶行各年代室內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/xinFangChun/xinFangChunInspect.js；文字與查證見 docs/research/interior-xin-fang-chun.md 第 3 節，
 * 算盤的文字見 docs/research/interior-lin-fu-zhen.md（跨店共用，這裡先建）。
 *
 * - XFC_OBJECTS：新的器物（切茶機、優良茶比賽獎狀、外銷鐵罐、算盤〔共用〕）
 * - XFC_EXTRA_NOTES：共用器物（炭焙火坑、焙籠、磅仔）在新芳春的補充說明（併進該器物的同一層）
 * - XFC_INSPECTABLES：器物在各年代店裡的位置
 */

const XFC = 'xin-fang-chun'

export const XFC_OBJECTS = {
  'tea-cutter': {
    id: 'tea-cutter',
    title: '切茶機',
    titleEn: 'Tea-cutting machine',
    lead: '鑄鐵的機器：茶從上面的漏斗倒進去，大齒輪帶著飛輪轉，把長條的茶葉切短，好分級、好裝罐。',
    leadEn: 'A cast-iron machine: tea goes into the hopper on top, the big gear turns the flywheel, and long leaf is cut short, ready to grade and tin.',
    actions: [{ id: 'turn', label: '轉一下飛輪', labelEn: 'Turn the flywheel', doneLabel: '停下來', doneLabelEn: 'Stop it' }],
    paragraphs: ['新芳春一樓後進的加工廠保留了切茶機、抖篩機、篩機與貫穿整室的天軸。模型依 Wikimedia Commons 的照片，尺寸是目測。'],
    paragraphsEn: ['The rear factory on Xinfangchun’s ground floor keeps its tea cutter, shaker-sieve, sieving machine and the line shaft that runs the length of the room. The model follows a Wikimedia Commons photograph; sizes are estimated by eye.'],
    reconstruction: true,
    sourceIds: ['commons-xfc-cutter', 'ntcri-77-xinfangchun'],
    layers: {
      form: [
        {
          text: '鑄鐵機身，上方梯形鐵漏斗，側面大齒輪與飛輪（直徑約 50 公分），皮帶連到屋頂的天軸；菱形鑄字銘牌（隱約可見「…製作所」）；A 形鑄鐵腳架；地上放兩個圓筒網狀滾筒；高約 1.5 公尺。〔照片〕Commons〈新芳春茶行切茶機.jpg〉',
          textEn: 'A cast-iron body, a trapezoid iron hopper on top, a large gear and flywheel (about 50 cm across) on one side belted to the overhead line shaft; a diamond-shaped cast nameplate (“…Works” just legible); A-frame cast-iron legs; two cylindrical mesh drums on the floor; about 1.5 m tall (Commons, “Xinfangchun tea cutter”).',
          sourceIds: ['commons-xfc-cutter'],
        },
        { text: '製造者與年代：銘牌字不可辨，查無。', textEn: 'Maker and date: the nameplate is illegible; not found.', status: 'pending' },
      ],
      making: [
        {
          text: '精製茶的機器化工序：切茶、抖篩、揀梗、風選；同一間加工廠還留著抖篩機、綠漆的篩機與貫穿整室的天軸與皮帶輪。',
          textEn: 'The mechanised refining steps: cutting, shaking-sieving, stalk-picking and winnowing; the same factory keeps a shaker-sieve, a green-painted sieving machine and the line shaft and belt wheels that run the length of the room.',
          sourceIds: ['commons-xfc-sieve', 'ntcri-77-xinfangchun'],
        },
      ],
      use: [
        {
          text: '新芳春以包種茶為主銷商品，外銷安南、暹羅、井裡汶；1934 年落成時是臺北最大的茶工廠，倉庫與加工廠保留乾燥機、風選機等機具。',
          textEn: 'Xinfangchun sold mainly baozhong, exported to Annam, Siam and Cirebon; when completed in 1934 it was the largest tea factory in Taipei, and the warehouse and factory keep the dryer, winnower and other machines.',
          sourceIds: ['ntcri-77-xinfangchun', 'nchdb-xinfangchun'],
        },
        { text: '這台機器是不是 1934 年就在：查無，本站三個年代都放。', textEn: 'Whether this machine was there in 1934: not found; this site places it in all three eras.', status: 'pending' },
      ],
      where: [{ text: '新芳春三個年代的一樓後進加工廠。', textEn: 'The ground-floor rear factory of Xinfangchun in all three eras.' }],
      evidence: [
        {
          text: 'Wikimedia Commons〈新芳春茶行切茶機.jpg〉（氏子，2022-11-03，CC BY-SA 4.0）；《臺灣工藝》77 期 p.54。',
          textEn: 'Commons “Xinfangchun tea cutter” (2022-11-03, CC BY-SA 4.0); Taiwan Crafts no. 77, p. 54.',
          sourceIds: ['commons-xfc-cutter', 'ntcri-77-xinfangchun'],
        },
      ],
    },
  },

  'tea-award-certificate': {
    id: 'tea-award-certificate',
    title: '優良茶比賽的獎狀',
    titleEn: 'Tea-competition certificate',
    lead: '一張泛黃的直式獎狀，上緣國徽、下方紅印：王連河參加全臺省優良茶比賽得的獎，現在放在二樓的玻璃櫃裡。',
    leadEn: 'A yellowed vertical certificate with the national emblem at the top and a red seal below: Wang Lianhe’s award from the all-Taiwan fine tea competition, now in a glass case upstairs.',
    actions: [{ id: 'read', label: '湊近讀', labelEn: 'Read it', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['《臺灣工藝》77 期 p.56 圖 1 的圖說：「王連河參加全臺省優良茶比賽的得獎獎狀」。年份與頒發單位圖說沒寫；模型上的字是示意。'],
    paragraphsEn: ['The caption of Taiwan Crafts no. 77, p. 56, plate 1: “Wang Lianhe’s award certificate from the all-Taiwan fine tea competition”. The caption gives no year or issuing body; the lettering on the model is illustrative.'],
    reconstruction: true,
    sourceIds: ['ntcri-77-xinfangchun'],
    layers: {
      form: [
        {
          text: '〔照片〕《臺灣工藝》77 期 p.56 圖 1：玻璃櫃內一張泛黃直式獎狀，上緣青天白日國徽與紅印，旁邊放數個圓形鐵罐。字太小不可辨，年份與頒發單位圖說沒寫。',
          textEn: 'Taiwan Crafts no. 77, p. 56: a yellowed vertical certificate in a glass case, the Blue Sky White Sun emblem and a red seal at the top, several round tins beside it. The text is too small to read; the caption gives no year or issuing body.',
          sourceIds: ['ntcri-77-xinfangchun'],
          status: 'pending',
        },
        { text: '模型上的字是示意，不是原件的文字。', textEn: 'The lettering on the model is illustrative, not the original wording.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '比的是精製好的茶：分級、揀梗、焙火、拼配、風選之後的成品。',
          textEn: 'What is judged is the finished refined tea: after grading, stalk-picking, firing, blending and winnowing.',
          sourceIds: ['businesstoday-wangtea-2018'],
        },
      ],
      use: [
        {
          text: '「全臺省優良茶比賽」是戰後的比賽（國徽可證），所以本站放在庶民生活與老屋新生，不放 1934 年。',
          textEn: 'The “all-Taiwan fine tea competition” is a postwar event (the emblem shows it), so this site places the certificate in the postwar and revival eras, not in 1934.',
          status: 'reconstruction',
        },
      ],
      where: [{ text: '新芳春庶民生活的帳房隔間牆上、老屋新生二樓的「王家生活展」。', textEn: 'On the counting-room partition of Xinfangchun in the postwar era, and in the “Wang family life” exhibition upstairs in the revival era.' }],
      evidence: [
        { text: '《臺灣工藝》77 期 p.56 圖 1 與圖說「王連河參加全臺省優良茶比賽的得獎獎狀」。', textEn: 'Taiwan Crafts no. 77, p. 56, plate 1 and caption.', sourceIds: ['ntcri-77-xinfangchun'] },
        { text: '年份與頒發單位：查無。', textEn: 'Year and issuing body: not found.', status: 'pending' },
      ],
    },
  },

  'export-tea-tin': {
    id: 'export-tea-tin',
    title: '外銷烏龍茶的鐵罐',
    titleEn: 'Export oolong tin',
    lead: '兩個 20 世紀初的方鐵罐並排：紅色的印美國 Chase & Sanborn 的 FORMOSA OOLONG，綠色的印新芳春選庄。',
    leadEn: 'Two square tins from the early twentieth century side by side: a red one printed for Chase & Sanborn of America, FORMOSA OOLONG, and a green one for Xinfangchun’s own selection.',
    actions: [{ id: 'turn', label: '轉過來看', labelEn: 'Turn it round', doneLabel: '放回去', doneLabelEn: 'Put it back' }],
    paragraphs: ['《臺灣工藝》77 期 p.57 圖 1：20 世紀初的外銷包裝罐。罐上的字樣模型只畫色塊，尺寸是目測。'],
    paragraphsEn: ['Taiwan Crafts no. 77, p. 57, plate 1: export tins from the early twentieth century. The model shows the lettering only as colour bands; sizes are estimated.'],
    reconstruction: true,
    sourceIds: ['ntcri-77-xinfangchun'],
    layers: {
      form: [
        {
          text: '〔照片〕《臺灣工藝》77 期 p.57 圖 1：左是紅色方鐵罐「CHASE & SANBORN\'S … FORMOSA OOLONG」，右是綠色方鐵罐「HUNG KEE … FORMOSA OOLONG」（圖說寫新芳春選庄）。模型的尺寸是目測。',
          textEn: 'Taiwan Crafts no. 77, p. 57: on the left a red square tin “CHASE & SANBORN’S … FORMOSA OOLONG”, on the right a green one “HUNG KEE … FORMOSA OOLONG” (captioned as Xinfangchun’s selection). Sizes are estimated.',
          sourceIds: ['ntcri-77-xinfangchun'],
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '罐裡是精製後的烏龍或包種；日治時期日商抵斥洋行，市場轉向日本與東南亞，戰後出口泰、馬、新、印尼僑鄉。',
          textEn: 'Inside is refined oolong or baozhong; in the Japanese era Japanese firms squeezed out the Western hongs and the market turned to Japan and Southeast Asia, and after the war to Thailand, Malaya, Singapore and Indonesia.',
          sourceIds: ['curation-dadaocheng-tea'],
        },
      ],
      use: [
        {
          text: '二樓最後段的茶貿易文物展：大量外銷茶罐、宣傳海報與飲茶用具。',
          textEn: 'The tea-trade exhibition at the far end of the upper floor: export tins, posters and tea ware.',
          sourceIds: ['ntcri-77-xinfangchun'],
        },
      ],
      where: [{ text: '新芳春庶民生活的鐵罐架、老屋新生二樓；臺史博典藏的包種茶罐是另一件。', textEn: 'Xinfangchun’s tin shelf in the postwar era and upstairs in the revival era; the NMTH baozhong tin is a separate object.' }],
      evidence: [
        { text: '《臺灣工藝》77 期 p.57 圖 1 與圖說。', textEn: 'Taiwan Crafts no. 77, p. 57, plate 1 and caption.', sourceIds: ['ntcri-77-xinfangchun'] },
        {
          text: '「HUNG KEE」是哪個字號、與新芳春的關係：圖說只寫「新芳春選庄鐵罐」，查無。',
          textEn: 'Which firm “HUNG KEE” is and how it relates to Xinfangchun: the caption says only “Xinfangchun selection tin”; not found.',
          status: 'pending',
        },
      ],
    },
  },

  abacus: {
    id: 'abacus',
    title: '算盤',
    titleEn: 'Abacus',
    lead: '上二下五的珠算盤，帳房先生撥得比人說話快；乾元藥行早年用的那一把，現在有照片可以看。',
    leadEn: 'A two-above, five-below abacus; the bookkeeper’s fingers moved faster than speech. The one Qianyuan Medicine Hong used in its early years survives in a photograph.',
    actions: [{ id: 'count', label: '撥一筆帳', labelEn: 'Work a sum', doneLabel: '歸零', doneLabelEn: 'Clear it' }],
    paragraphs: ['上二下五的珠算盤。形制借自乾元藥行早年使用、現存照片的算盤；新芳春二樓也展出兩把。檔數、顏色與磨損是示意。'],
    paragraphsEn: ['A two-above, five-below abacus. The form follows the early abacus of Qianyuan Medicine Hong, known from a photograph; two are also on show upstairs at Xinfangchun. The number of rods, colour and wear are illustrative.'],
    reconstruction: true,
    sourceIds: ['commons-qianyuan-abacus', 'commons-xfc-abacus'],
    layers: {
      form: [
        {
          text: '木框、橫樑把算珠分成上二下五；乾元藥行的「二五分珠算盤」是迪化街老店實物的照片，本站借它的形制。',
          textEn: 'A wooden frame with a beam dividing the beads two above and five below; the “2/5 abacus” of Qianyuan Medicine Hong is a photographed object from a Dihua Street shop, and this site borrows its form.',
          sourceIds: ['commons-qianyuan-abacus'],
        },
        {
          text: '新芳春二樓展出的兩把算盤：約 60 與 45 公分，上二下五珠，放在深色木桌上。〔照片〕Commons〈新芳春茶行算盤.jpg〉',
          textEn: 'The two abacuses on show upstairs at Xinfangchun: about 60 and 45 cm, two above and five below, on a dark wooden table (Commons, “Xinfangchun abacus”).',
          sourceIds: ['commons-xfc-abacus'],
        },
        { text: '檔數、顏色與磨損是示意。', textEn: 'The number of rods, the colour and the wear are illustrative.', status: 'reconstruction' },
      ],
      making: [{ text: '算盤本身不是食物；它算的是秤出來的斤兩與價錢。', textEn: 'Not a foodstuff: what it reckons are the catties and the prices on the scale.', status: 'reconstruction' }],
      use: [
        {
          text: '南北貨、藥材、米、茶都按斤兩賣，櫃台邊一把算盤、一本帳，是這些店的日常。',
          textEn: 'Dried goods, medicine, rice and tea were all sold by weight; an abacus and a ledger at the counter were everyday life in these shops.',
          status: 'reconstruction',
        },
      ],
      where: [{ text: '新芳春摩登的帳房、老屋新生二樓的「王家生活展」；林復振、乾元藥行、329 號米店、有記名茶的帳房（陸續加上）。', textEn: 'The counting room of Xinfangchun in the modern era and its upstairs exhibition today; Lin Fuzhen, Qianyuan, the 329 rice shop and Youji’s counting room (being added).' }],
      evidence: [
        {
          text: 'Wikimedia Commons〈大稻埕乾元參藥行二五分珠算盤.jpg〉（氏子，2022-10-14，CC BY-SA 4.0），說明「乾元行早期使用的算盤」；Commons〈新芳春茶行算盤.jpg〉。',
          textEn: 'Wikimedia Commons, “Qianyuan Apothecary 2/5 abacus” (2022-10-14, CC BY-SA 4.0), captioned as the abacus the firm used in its early years; Commons “Xinfangchun abacus”.',
          sourceIds: ['commons-qianyuan-abacus', 'commons-xfc-abacus'],
        },
      ],
    },
  },
}

/** 共用器物在新芳春的補充說明（併進該器物的同一層） */
export const XFC_EXTRA_NOTES = {
  'charcoal-pit': {
    form: [
      {
        text: '新芳春的焙籠坑砌在紅磚低台上（高約 15–20 公分），坑壁用紅磚砌成圓筒、坑徑約 60 公分；《臺灣工藝》寫「數十個」，維基寫「約一百個」，照片可見約 20–30 個；本站畫 12 個。〔照片〕Commons〈新芳春茶行焙籠間.jpg〉',
        textEn: 'At Xinfangchun the pits are set in a low red-brick platform (about 15–20 cm high), each pit a brick-lined cylinder about 60 cm across; Taiwan Crafts says “dozens”, Wikipedia “about a hundred”, and some 20–30 are visible in photographs; this site shows twelve (Commons, “Xinfangchun roasting room”).',
        sourceIds: ['commons-xfc-roasting-room', 'ntcri-77-xinfangchun'],
      },
    ],
    making: [{ text: '三立新聞寫新芳春的焙籠間「烘池底下燒炭，並放入米麩」。', textEn: 'SET News says that in Xinfangchun’s roasting room charcoal was burnt under the pits with rice bran added.', sourceIds: ['setn-2016-xinfangchun'] }],
    where: [{ text: '新芳春三個年代的一樓後進焙籠間。', textEn: 'The ground-floor rear roasting room of Xinfangchun in all three eras.' }],
  },
  'roasting-basket': {
    where: [{ text: '新芳春的焙籠：圓筒、兩道箍、口徑約 60 公分、高約 50 公分（〔照片〕Commons〈新芳春茶行焙籠間.jpg〉）。', textEn: 'Xinfangchun’s baskets: cylinders with two hoops, about 60 cm across and 50 cm tall (Commons, “Xinfangchun roasting room”).', sourceIds: ['commons-xfc-roasting-room'] }],
  },
  'platform-scale': {
    where: [{ text: '新芳春的鑄鐵台秤：藍漆立柱約 1.2 公尺、方形鐵平台約 60 × 50 公分、四個小輪、前有提把（〔照片〕Commons〈新芳春茶行秤台.jpg〉）。', textEn: 'Xinfangchun’s cast-iron platform scale: a blue-painted column about 1.2 m, a square iron platform about 60 × 50 cm, four small wheels and a handle in front (Commons, “Xinfangchun scale”).', sourceIds: ['commons-xfc-scale'] }],
  },
}

/** 器物在新芳春各年代店裡的位置（世界座標在 data/xinFangChunLayout.js 的 XFC_INSPECT_SPOTS；level 1 在二樓） */
const spot = (id, eraId, objectId, label, labelEn) => ({ id, eraId, shopId: XFC, objectId, label, labelEn, level: 0, ...XFC_INSPECT_SPOTS[id] })

export const XFC_INSPECTABLES = [
  spot('xfc-modern-abacus', 'modern', 'abacus', '帳房的算盤', 'Abacus in the counting room'),
  spot('xfc-modern-cutter', 'modern', 'tea-cutter', '加工廠的切茶機', 'Tea cutter in the factory'),
  spot('xfc-modern-pit', 'modern', 'charcoal-pit', '焙籠坑', 'Roasting pit'),
  spot('xfc-modern-sorting-tray', 'modern', 'tea-sorting-tray', '揀茶間的竹淺盤', 'Sorting tray upstairs'),
  spot('xfc-postwar-certificate', 'postwar', 'tea-award-certificate', '牆上的優良茶獎狀', 'Fine-tea certificate on the wall'),
  spot('xfc-postwar-tins', 'postwar', 'export-tea-tin', '外銷鐵罐架', 'Shelf of export tins'),
  spot('xfc-postwar-cutter', 'postwar', 'tea-cutter', '加工廠的切茶機', 'Tea cutter in the factory'),
  spot('xfc-postwar-sorting-tray', 'postwar', 'tea-sorting-tray', '揀茶間的竹淺盤', 'Sorting tray upstairs'),
  spot('xfc-revival-cutter', 'revival', 'tea-cutter', '保留下來的切茶機', 'The preserved tea cutter'),
  spot('xfc-revival-winnower', 'revival', 'winnowing-machine', '大稻埕最大的風選機', 'Dadaocheng’s largest winnower'),
  spot('xfc-revival-pit', 'revival', 'charcoal-pit', '焙籠坑', 'Roasting pit'),
  spot('xfc-revival-certificate', 'revival', 'tea-award-certificate', '玻璃櫃裡的獎狀', 'Certificate in the glass case'),
  spot('xfc-revival-tins', 'revival', 'export-tea-tin', '外銷茶罐', 'Export tins'),
  spot('xfc-revival-abacus', 'revival', 'abacus', '王家生活展的算盤', 'Abacus in the family exhibition'),
]
