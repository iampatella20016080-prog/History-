/**
 * 主題路線「今日報紙」（第 12 階段）：同一件事、不同人怎麼看。五個年代各一則有出處的報導或公告，
 * 加上街坊的反應（標「虛構對白」）。清末臺灣北部還沒有在地報紙，改用香港的英文報紙。
 *
 * - 港口商街 1890：英國代理領事搬進大稻埕，外國人能不能住在這裡（《Hong Kong Daily Press》社論）
 * - 酒樓繁華 1917–1929：迎城隍的藝閣——商人的廣告、《臺灣日日新報》的盛況、《臺灣民報》的批評
 * - 摩登 1935：臺灣博覽會在大稻埕的會場，由本地商人倡議、經營
 * - 庶民生活 1968：臺北市禁行人力三輪車（《聯合報》）——避開 1947 年的事件（使用者還沒決定）
 * - 老屋新生 2000：大稻埕歷史風貌特定專用區與容積移轉（臺北市政府公告）
 *
 * 查證紀錄見 docs/research/news-route.md；出處都在 sources.js。街坊不具名，不把反應安在真實人物身上。
 */

/* ── 情境人物（data/routeFigures.js 合併） ── */
export const NEWS_FIGURES = [
  { id: 'news-qing', eraId: 'qing-port', look: 'qingClerk', pose: 'stand', position: [2.6, -2.2], rotationY: 0.3 },
  { id: 'news-banquet', eraId: 'banquet', look: 'riceMerchant', pose: 'stand', position: [0.4, -2.2], rotationY: 0.5 },
  { id: 'news-modern', eraId: 'modern', look: 'modernCyclist', pose: 'stand', position: [-6.5, 2.2], rotationY: Math.PI - 0.3 },
  { id: 'news-revival', eraId: 'revival', look: 'revivalElder', pose: 'stand', position: [-5.5, -2.2], rotationY: 0.4 },
]

const route = (id) => `route-${id}`

/* ── 路人對話（格式見 game/talk.js） ── */
export const NEWS_TALK = [
  {
    id: 'news-qing',
    eraId: 'qing-port',
    npcId: route('news-qing'),
    role: '茶行的帳房',
    roleEn: 'A tea firm’s bookkeeper',
    doing: '拿著一份從香港寄來的英文報紙',
    doingEn: 'Holding an English paper sent over from Hong Kong',
    objectId: 'hkdp-1890',
    lines: [
      {
        text: '洋行的人拿來一份香港的報紙，說上面寫到咱大稻埕哩。',
        textEn: 'Someone at the hong brought over a Hong Kong paper—says it’s writing about Twatutia.',
        label: 'fiction',
      },
      {
        text: '光緒十六年冬天，香港的英文報紙寫社論：英國的代理領事因為淡水的住處整修，在大稻埕租了房子、升起英國旗，還照會了巡撫。',
        textEn: 'In the winter of 1890 a Hong Kong English paper ran an editorial: the acting British consul, his Tamsui residence under repair, had rented a house in Twatutia, raised the Union flag and notified the governor.',
        label: 'sourced',
        sourceIds: ['hkdp-1890-11-29'],
      },
    ],
    followUps: [
      {
        id: 'views',
        question: '那官府怎麼說？',
        questionEn: 'And what do the officials say?',
        lines: [
          {
            text: '同一篇社論寫，這邊的官員認為淡水才是北部的通商口岸，洋人住在大稻埕、在這裡做生意，只是被默許的。',
            textEn: 'The same editorial says local officials hold that Tamsui is the treaty port of the north, and that foreigners living and trading in Twatutia are merely tolerated.',
            label: 'sourced',
            sourceIds: ['hkdp-1890-11-29'],
          },
          {
            text: '社論說，這面旗一升，兩邊都得表態了。',
            textEn: 'With that flag up, the editorial says, both sides will have to show their hand.',
            label: 'sourced',
            sourceIds: ['hkdp-1890-11-29'],
          },
        ],
      },
      {
        id: 'street',
        question: '街上的人怎麼看？',
        questionEn: 'What do people on the street think?',
        lines: [
          {
            text: '茶商高興啊，洋行就在眼前，茶價談起來方便。',
            textEn: 'The tea merchants are pleased—the hongs are right here, so haggling over prices is easy.',
            label: 'fiction',
          },
          {
            text: '巷口的阿婆就不太歡喜，說洋旗插在厝頂，看了心驚驚。',
            textEn: 'The old woman at the end of the lane is less happy—a foreign flag on a rooftop gives her the jitters.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'news-banquet',
    eraId: 'banquet',
    npcId: route('news-banquet'),
    role: '看報的米商',
    roleEn: 'A rice merchant reading the papers',
    doing: '一手一份報紙，比較兩邊怎麼寫迎城隍',
    doingEn: 'A paper in each hand, comparing their coverage of the City God festival',
    objectId: 'minpao-1929',
    lines: [
      {
        text: '五月十三迎城隍，兩份報紙寫得完全不一樣，你看看。',
        textEn: 'The City God procession on the thirteenth of the fifth month—and the two papers write it up completely differently. Have a look.',
        label: 'fiction',
      },
      {
        text: '有研究寫，一九一七年六月，大稻埕的商人辦化妝遊行，各商號用藝閣替自己的商品宣傳，隊伍多到五千人。',
        textEn: 'One study notes that in June 1917 Dadaocheng merchants staged a costume parade, each firm using its floats to advertise its goods—five thousand marchers in all.',
        label: 'sourced',
        sourceIds: ['song-2012-yingshen', 'cai-2019-chenghuang'],
      },
    ],
    followUps: [
      {
        id: 'nichinichi',
        question: '日日新報怎麼寫？',
        questionEn: 'What does the Nichi Nichi say?',
        lines: [
          {
            text: '一九一八年就有人投書，建議城隍祭也請商號贊助藝閣；一九二七年的標題寫：久違的晴天，城隍廟祭大熱鬧，每班火車都客滿。',
            textEn: 'In 1918 a letter urged that firms sponsor floats for the festival; a 1927 headline cheered a long-awaited sunny day, a grand City God festival and every train packed.',
            label: 'sourced',
            sourceIds: ['cai-2019-chenghuang'],
          },
        ],
      },
      {
        id: 'minpao',
        question: '臺灣民報呢？',
        questionEn: 'And the Taiwan Minpao?',
        lines: [
          {
            text: '一九二九年的《臺灣民報》罵得兇，說迎城隍「其行列的低級單純」，喚不起識者的興味。',
            textEn: 'The Taiwan Minpao in 1929 was scathing—calling the procession crude and simple, of no interest to thinking people.',
            label: 'sourced',
            sourceIds: ['cai-2019-chenghuang'],
          },
          {
            text: '同一天的短評寫藝閣上的少女將近二百人，從正午被扛著遊行到七點多，熱度有九十六、七度。',
            textEn: 'A short column the same day counted nearly two hundred girls on the floats, carried from noon until past seven in heat of ninety-six or ninety-seven degrees.',
            label: 'sourced',
            sourceIds: ['cai-2019-chenghuang'],
          },
        ],
      },
      {
        id: 'me',
        question: '那你怎麼看？',
        questionEn: 'And what do you think?',
        lines: [
          {
            text: '我嘛……生意人愛熱鬧，熱鬧才有人潮；可是扛藝閣的查某囝仔，看了也真不忍心。',
            textEn: 'Me? A businessman loves a crowd—crowds mean trade. But those girls on the floats… it’s hard to watch.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'news-modern',
    eraId: 'modern',
    npcId: route('news-modern'),
    role: '剛逛完博覽會的店員',
    roleEn: 'A shop clerk back from the Exposition',
    doing: '手裡還捏著入場券，跟人說會場有多熱鬧',
    doingEn: 'Still clutching his ticket, telling everyone how lively it was',
    objectId: 'expo-ticket-1935',
    lines: [
      {
        text: '我今天去博覽會了！大稻埕這邊也有一個會場，人擠人。',
        textEn: 'I went to the Exposition today! There’s a site right here in Dadaocheng too—packed shoulder to shoulder.',
        label: 'fiction',
      },
      {
        text: '研究寫，一九三五年的臺灣博覽會原本只有幾個會場，後來在大稻埕多了一個，是本地商界倡議、由臺灣人商人組織經營的。',
        textEn: 'Research notes that the 1935 Taiwan Exposition first had its sites elsewhere; a further one in Dadaocheng came at the initiative of local business leaders and was run by Taiwanese merchants.',
        label: 'sourced',
        sourceIds: ['allen-2005-expo'],
      },
    ],
    followUps: [
      {
        id: 'south',
        question: '大稻埕的會場有什麼？',
        questionEn: 'What was at the Dadaocheng site?',
        lines: [
          {
            text: '有南方館、暹邏館、菲律賓館，還有演藝館；本地商家請了京劇團來，分幾輪演出。',
            textEn: 'A South Pavilion, Siam and Philippine halls, and a performance hall—local merchants hired a Peking opera troupe for several runs.',
            label: 'sourced',
            sourceIds: ['wiki-1935-expo'],
          },
          {
            text: '同一篇研究也指出，介紹南方的館都集中在大稻埕這個會場。',
            textEn: 'The same study points out that the halls about the South were all gathered at the Dadaocheng site.',
            label: 'sourced',
            sourceIds: ['allen-2005-expo'],
          },
        ],
      },
      {
        id: 'views',
        question: '大家都喜歡嗎？',
        questionEn: 'Did everyone like it?',
        lines: [
          {
            text: '頭家說，這是做南洋生意的好機會；隔壁的老師傅只嫌票價太貴，說看一趟要做好幾天的工。',
            textEn: 'My boss calls it a chance to trade with the South Seas; the old craftsman next door just grumbles that a ticket costs days of work.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'news-postwar',
    eraId: 'postwar',
    npcId: 'street-postwar-pedicab-0',
    role: '等客的三輪車夫',
    roleEn: 'A pedicab driver waiting for fares',
    doing: '坐在車上，把報紙摺了又摺',
    doingEn: 'Sitting in his cab, folding and refolding the newspaper',
    objectId: 'udn-1968',
    lines: [
      {
        text: '報紙寫的是我們啊——三輪車要禁了。',
        textEn: 'The paper’s writing about us—pedicabs are being banned.',
        label: 'fiction',
      },
      {
        text: '一九六八年六月二十五日的《聯合報》：人力三輪客車從這天起全面禁止在臺北市區行駛；截止前全市還剩八百九十一輛營業的三輪車。',
        textEn: 'The United Daily News of 25 June 1968: from that day human-powered pedicabs were banned from Taipei’s streets; 891 licensed cabs had still been on the road.',
        label: 'sourced',
        sourceIds: ['udn-1968-pedicab'],
      },
    ],
    followUps: [
      {
        id: 'buyback',
        question: '車子怎麼辦？',
        questionEn: 'What happens to the cabs?',
        lines: [
          {
            text: '政府收購：一九六四年八月起一輛六千元；最後一天自己轉業的，連補助和救濟金一共可以領一萬二。',
            textEn: 'The government buys them: six thousand dollars a cab since August 1964, and twelve thousand all told for those who find new work themselves by the last day.',
            label: 'sourced',
            sourceIds: ['udn-1968-pedicab'],
          },
          {
            text: '報紙也寫，大約八百人已經輔導去開計程車，另外七百人等著受訓。',
            textEn: 'The paper also says about eight hundred have been helped into taxi driving, with seven hundred more waiting for training.',
            label: 'sourced',
            sourceIds: ['udn-1968-pedicab'],
          },
        ],
      },
      {
        id: 'views',
        question: '你要去開計程車嗎？',
        questionEn: 'Will you drive a taxi?',
        lines: [
          {
            text: '我這雙腳踩了二十年，換成手握方向盤……少年的學得快，我是怕學不來。',
            textEn: 'Twenty years on these pedals, and now a steering wheel… the young ones pick it up fast. I’m afraid I won’t.',
            label: 'fiction',
          },
          {
            text: '坐車的太太倒是說，計程車快，下雨天也不會淋濕。',
            textEn: 'The lady who rides with me says a taxi is quicker, and she won’t get wet in the rain.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'news-revival',
    eraId: 'revival',
    npcId: route('news-revival'),
    role: '迪化街的老住戶',
    roleEn: 'A long-time Dihua Street resident',
    doing: '站在公告欄前看市政府的公告',
    doingEn: 'Reading a city notice on the board',
    objectId: 'notice-2000',
    lines: [
      {
        text: '我住這條街幾十年了，這張公告，關係到每一間老厝。',
        textEn: 'I’ve lived on this street for decades. This notice concerns every old house here.',
        label: 'fiction',
      },
      {
        text: '市政府的公告寫：大稻埕歷史風貌特定專用區在民國八十九年一月二十七日公告實施，二月一日零時起生效。',
        textEn: 'The city notice says the Dadaocheng Historic District special zone was announced on 27 January 2000 and took effect at midnight on 1 February.',
        label: 'sourced',
        sourceIds: ['taipei-gov-2009-p098018'],
      },
    ],
    followUps: [
      {
        id: 'transfer',
        question: '「容積移轉」是什麼？',
        questionEn: 'What is “floor-area transfer”?',
        lines: [
          {
            text: '保存歷史建築與街區風貌的基地，可以把能蓋的容積一部分或全部移到別的基地去，保障地主的權益。',
            textEn: 'A plot that preserves a historic building and the street’s character may transfer some or all of its buildable floor area to another plot, protecting the owner’s interests.',
            label: 'sourced',
            sourceIds: ['taipei-gov-2009-p098018'],
          },
          {
            text: '二〇〇九年的公告寫，到那年三月底一共申請了二百四十件，但還有大約七成可以移轉的容積沒有人申請。',
            textEn: 'A 2009 notice reports 240 applications by the end of that March, with about seventy percent of the transferable floor area still unclaimed.',
            label: 'sourced',
            sourceIds: ['taipei-gov-2009-p098018'],
          },
        ],
      },
      {
        id: 'views',
        question: '大家都贊成嗎？',
        questionEn: 'Is everyone in favour?',
        lines: [
          {
            text: '有人說老厝留下來是街的面子；也有人說，修老厝的錢比蓋新的還多。',
            textEn: 'Some say keeping the old houses is the street’s pride; others say restoring one costs more than building new.',
            label: 'fiction',
          },
          {
            text: '我是覺得，房子留得住，人也要住得下去才算數。',
            textEn: 'To me, saving the houses only counts if people can still live in them.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
]

/* ── 器物（3D 模型在 game/builders/routeObjects/newsObjects.js） ── */
export const NEWS_OBJECTS = {
  'hkdp-1890': {
    id: 'hkdp-1890',
    title: '香港的英文報紙（1890）',
    titleEn: 'A Hong Kong English paper (1890)',
    lead: '大張的英文報紙，橫排的密密麻麻好幾欄——清末北臺灣還沒有在地報紙，大稻埕的消息要從香港的報紙讀。',
    leadEn: 'A large English broadsheet packed with columns—with no local paper yet in northern Taiwan, Twatutia’s news was read in Hong Kong’s press.',
    actions: [{ id: 'unfold', label: '攤開報紙', labelEn: 'Unfold it', doneLabel: '摺起來', doneLabelEn: 'Fold it up' }],
    paragraphs: [
      '《Hong Kong Daily Press》1890 年 11 月 29 日的社論，討論英國代理領事在大稻埕租屋、升英國旗並照會巡撫的事，以及清方「淡水才是通商口岸、外國人在大稻埕只是被默許」的立場。Internet Archive 有這一天報紙的逐頁掃描與自動辨識文字（辨識有錯字，引用前要對照掃描）。',
      '模型是一份摺起來的大張報紙，版面用色塊示意欄位與報頭，不複製任何一頁的文字；報紙的實際尺寸查無，是歷史情境重建。',
    ],
    paragraphsEn: [
      'The Hong Kong Daily Press of 29 November 1890 carried an editorial on the acting British consul renting a house in Twatutia, raising the flag and notifying the governor, and on the Qing view that Tamsui alone was the treaty port and foreigners in Twatutia were merely tolerated. The Internet Archive holds page scans and machine-read text of that day (the OCR has errors).',
      'The model is a folded broadsheet with blocks for columns and masthead; no page text is copied and the paper’s real size is unrecorded—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['hkdp-1890-11-29'],
  },
  'minpao-1929': {
    id: 'minpao-1929',
    title: '週刊報紙（1929）',
    titleEn: 'A weekly paper (1929)',
    lead: '直排的漢文報紙：右上角是報頭，一欄一欄由右讀到左——同一場迎城隍，在這裡被寫成一件值得反省的事。',
    leadEn: 'A Chinese-language paper set in vertical columns, masthead at top right, read from right to left—where the same festival became something to criticise.',
    actions: [{ id: 'unfold', label: '攤開報紙', labelEn: 'Unfold it', doneLabel: '摺起來', doneLabelEn: 'Fold it up' }],
    paragraphs: [
      '蔡孟儒（臺大臺文所碩士論文，2019）整理了《臺灣民報》1929 年 6 月 23 日的〈迷信趣談〉與小言欄〈可憐的少女們〉；同一篇論文也轉引《臺灣日日新報》1918 年 6 月 19 日的投書、1927 年 6 月 13 日的盛況報導，以及宋光宇（2012）對 1917 年大稻埕商人化妝遊行的研究。',
      '模型是一份摺起來的直排報紙，報頭與欄位都是色塊示意，不複製任何一頁；版面尺寸查無，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Tsai Meng-ju’s 2019 NTU thesis gathers the Taiwan Minpao pieces of 23 June 1929 and cites the Taiwan Nichi Nichi Shimpō letter of 19 June 1918 and festival report of 13 June 1927, together with Song Guangyu’s 2012 study of the merchants’ 1917 costume parade.',
      'The model is a folded paper in vertical columns, masthead and text shown as blocks; size unrecorded—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['cai-2019-chenghuang', 'song-2012-yingshen'],
  },
  'expo-ticket-1935': {
    id: 'expo-ticket-1935',
    title: '博覽會的團體入場券（1935）',
    titleEn: 'Group admission ticket (1935)',
    lead: '一張巴掌大的紙票：正面印著編號、大人小人和費用，背面是注意事項——每到一個會場，就打一個洞。',
    leadEn: 'A palm-sized paper ticket: number, adult and child rates and fees on the front, rules on the back—and a punch for every venue visited.',
    actions: [{ id: 'flip', label: '翻到背面', labelEn: 'Turn it over', doneLabel: '翻回正面', doneLabelEn: 'Turn it back' }],
    paragraphs: [
      '形制依國立臺灣歷史博物館典藏「始政四十周年記念臺灣博覽會團體入場券」（2009.011.0281）：紙質，9.1 × 13.6 公分；正面印編號、大人小人的類別與費用，背面印注意事項，各會場有打洞的記號，第一、第二會場、分場與夜間會場都可以用。館方說明博覽會在 1935 年 10 月 10 日到 11 月 28 日舉行，分場之一在大稻埕迪化街附近。',
      '票面的字與圖樣不畫，以色塊示意；打洞的位置是示意，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Modelled on the National Museum of Taiwan History’s group admission ticket for the 1935 Exposition (2009.011.0281): paper, 9.1 × 13.6 cm, numbered, with adult and child rates and fees on the front and rules on the back; punched at each venue and valid at the main, branch and night sites. The museum notes the Exposition ran from 10 October to 28 November 1935, with a branch site near Dihua Street.',
      'The printing is shown as blocks and the punch positions are illustrative—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['nmth-expo-ticket-2009-011-0281'],
  },
  'udn-1968': {
    id: 'udn-1968',
    title: '戰後的日報（1968）',
    titleEn: 'A daily paper (1968)',
    lead: '直排的大標題、一張新聞照片：三輪車夫把它摺了又摺，上面寫的是他們這一行的最後一天。',
    leadEn: 'A big vertical headline and a news photo: the pedicab driver keeps folding it—it announces the last day of his trade.',
    actions: [{ id: 'unfold', label: '攤開報紙', labelEn: 'Unfold it', doneLabel: '摺起來', doneLabelEn: 'Fold it up' }],
    paragraphs: [
      '《聯合報》1968 年 6 月 25 日第 3 版〈人力三輪客車 今起禁行北市〉（「報時光」2022 年轉載）：從這天起人力三輪客車全面禁止在臺北市區行駛；營業三輪車的收購價從每輛三千元、1964 年 8 月提高到六千元，最後一天自行轉業的每輛共可領一萬二千元；約八百人已輔導轉為計程車司機、另約七百人等待訓練；全市原剩 891 輛，已收購 826 輛。',
      '模型是一份摺起來的報紙，標題、照片與欄位都是色塊示意，不複製版面；是歷史情境重建。',
    ],
    paragraphsEn: [
      'United Daily News, 25 June 1968, page 3 (republished by UDN Time in 2022): from that day pedicabs were banned in Taipei; the buy-back price rose from NT$3,000 to NT$6,000 a cab in August 1964, and drivers who found new work by the last day received NT$12,000 in all; about 800 had become taxi drivers with 700 more awaiting training; of 891 remaining cabs, 826 had been bought.',
      'The model is a folded paper with headline, photo and columns as blocks—no page is copied; a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['udn-1968-pedicab'],
  },
  'notice-2000': {
    id: 'notice-2000',
    title: '公告欄上的市府公告',
    titleEn: 'A city notice on the board',
    lead: '釘在軟木公告欄上的一張公告：主旨、依據、公告事項，右下角蓋著紅色的印——掀起來，下面附著計畫範圍的圖。',
    leadEn: 'A notice pinned to a cork board—subject, basis, items, a red seal at the corner; lift it to see the zoning map beneath.',
    actions: [{ id: 'lift', label: '掀起公告', labelEn: 'Lift the notice', doneLabel: '放下', doneLabelEn: 'Let it fall' }],
    paragraphs: [
      '臺北市政府民國 98 年 8 月 11 日府都規字第 09803474000 號公告（修訂大稻埕歷史風貌特定專用區容積移轉作業要點）的計畫緣起寫：專用區都市計畫在民國 89 年 1 月 27 日公告實施、2 月 1 日零時起生效，作業要點允許配合歷史性建築與傳統街區風貌保存的基地，把可建築容積的一部分或全部移轉到另一宗基地；到 98 年 3 月底共申請 240 件、移出 101,739.64 平方公尺，但約七成可移轉的容積還沒有申請。',
      '模型的版式依公告的格式（主旨、依據、公告事項、機關印信），字不畫；附圖的街廓是示意，不是真正的計畫圖，是歷史情境重建。',
    ],
    paragraphsEn: [
      'Taipei City Government notice of 11 August 2009 (revising the district’s floor-area transfer rules) recalls that the special zone took effect on 1 February 2000 after being announced on 27 January, allowing plots that preserve historic buildings to transfer buildable floor area elsewhere; by March 2009 there had been 240 applications moving 101,739.64 m², with about seventy percent still unclaimed.',
      'The layout follows the notice format—subject, basis, items, official seal—without text; the attached map is illustrative, not the real plan—a historical reconstruction.',
    ],
    reconstruction: true,
    sourceIds: ['taipei-gov-2009-p098018'],
  },
}

/* ── 路線 ── */
export const NEWS_ROUTE = {
  id: 'news',
  title: '今日報紙',
  titleEn: 'Today’s Paper',
  intro: '同一件事，不同人怎麼看？走過五個年代，各讀一則有出處的報導或公告，再聽聽街坊怎麼說——街坊的話都是虛構對白。清末臺灣北部還沒有在地報紙，就讀香港寄來的英文報紙。',
  introEn: 'One event, many views: across five eras, read a documented report or notice and hear what the neighbours say (their words are fictional). With no local paper in late-Qing northern Taiwan, we read one sent from Hong Kong.',
  closing: '領事的一面旗、迎城隍的藝閣、博覽會的會場、最後一天的三輪車、一張保存老屋的公告——報紙寫下一種說法，街上永遠有好幾種。報導都附了出處；街坊的反應是虛構的，只是提醒我們，同一件事總有不同的人在看。',
  closingEn: 'A consul’s flag, festival floats, an Exposition site, the pedicabs’ last day, a notice to save old houses—the paper records one account, the street always holds several. The reports are sourced; the neighbours’ reactions are fiction, a reminder that every event has many onlookers.',
  eraId: 'qing-port',
  nodes: [
    {
      id: 'qing',
      kind: 'talk',
      eraId: 'qing-port',
      journalIds: ['talk:news-qing', 'object:hkdp-1890'],
      title: '1890：洋旗升在大稻埕',
      titleEn: '1890: a foreign flag in Twatutia',
      hint: '港口商街：街中段北側，茶行的帳房拿著香港寄來的報紙。',
      hintEn: 'Treaty-port years: mid-street on the north side, a bookkeeper holds a paper from Hong Kong.',
      npcIds: [route('news-qing')],
    },
    {
      id: 'banquet',
      kind: 'talk',
      eraId: 'banquet',
      journalIds: ['talk:news-banquet', 'object:minpao-1929'],
      title: '1917–1929：迎城隍的兩種寫法',
      titleEn: '1917–1929: two takes on the City God festival',
      hint: '酒樓繁華：林復振門前的街上，有個米商一手一份報紙。',
      hintEn: 'The banquet years: in the street by Lin Fu Zhen, a rice merchant holds a paper in each hand.',
      npcIds: [route('news-banquet')],
    },
    {
      id: 'modern',
      kind: 'talk',
      eraId: 'modern',
      journalIds: ['talk:news-modern', 'object:expo-ticket-1935'],
      title: '1935：博覽會的大稻埕會場',
      titleEn: '1935: the Exposition’s Dadaocheng site',
      hint: '摩登大稻埕：街中段南側，剛逛完博覽會的店員還捏著入場券。',
      hintEn: 'The modern years: mid-street on the south side, a clerk back from the Exposition still has his ticket.',
      npcIds: [route('news-modern')],
    },
    {
      id: 'postwar',
      kind: 'talk',
      eraId: 'postwar',
      journalIds: ['talk:news-postwar', 'object:udn-1968'],
      title: '1968：三輪車的最後一天',
      titleEn: '1968: the pedicabs’ last day',
      hint: '庶民生活：林復振附近等客的三輪車夫，正把報紙摺了又摺。',
      hintEn: 'Postwar: the pedicab driver waiting near Lin Fu Zhen keeps folding his newspaper.',
      npcIds: ['street-postwar-pedicab-0'],
      // 路線地圖上的位置（三輪車的位置見 streetPropsLayout.js 的 postwar-pedicab）
      mapAt: [2.5, -2.0],
    },
    {
      id: 'revival',
      kind: 'talk',
      eraId: 'revival',
      journalIds: ['talk:news-revival', 'object:notice-2000'],
      title: '2000：保存老屋的公告',
      titleEn: '2000: a notice to save the old houses',
      hint: '老屋新生：街中段北側，老住戶站在公告前。',
      hintEn: 'Today: mid-street on the north side, a long-time resident reads a notice.',
      npcIds: [route('news-revival')],
    },
  ],
}
