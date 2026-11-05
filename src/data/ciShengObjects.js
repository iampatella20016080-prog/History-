import { CS_ERAS, CS_ID, CS_INSPECT_SPOTS } from './ciShengLayout.js'

/**
 * 慈聖宮殿內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/ciShengInspect.js；文字與查證見 docs/research/interior-ci-sheng-gong.md 第 3 節。
 * 廟的原則（第 5 階段）：神像、供品、祭祀細節沒有出處就不畫、不寫；殿內的照片都是 2018–2025 年的現況，
 * 日治時期（1914–1945）的殿內照片查無，酒樓繁華與摩登的殿內是依現況回推的歷史情境重建。
 * 香爐是與霞海城隍廟共用的器物（data/xiaHaiObjects.js 的 incense-burner，慈聖宮的 form／where 層已在那裡）。
 * 2026-11-04 Fable 補查（docs/research/interior-ci-sheng-gong.md 第 8 節）更正：匾是「海國陽春」、右柱是「慈孃」、
 * 「惠澤覃敷」是 1920 年稻江平樂社獻的、供桌兩端的金色器物是花瓶不是爐。
 */

const NOT_FOOD = { text: '不是食物。', textEn: 'Not a foodstuff.' }

export const CS_OBJECTS = {
  'mazu-shrine': {
    id: 'mazu-shrine',
    title: '媽祖的神龕',
    titleEn: 'The Mazu shrine',
    lead: '黑、金兩色的木雕神龕，上方一方黑底金字的匾「海國陽春」；龕裡三層階梯坐著好幾尊媽祖金身，正中那尊最大、戴冕旒，其餘戴鳳冠，都披紅底金繡的袍。',
    leadEn: 'A carved shrine in black and gold with a black plaque above reading “Spring over the sea country”; inside, on three stepped tiers, sit several gilt Mazu images, the largest in the centre in a beaded crown, the others in phoenix crowns, all in red robes embroidered in gold.',
    actions: [{ id: 'bow', label: '合掌', labelEn: 'Bow', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['神龕的樣子依 2025 年的現況照片；日治時期殿內的照片查無，酒樓繁華與摩登是依現況回推。模型是簡化的人形，不做臉部細節；龕前的小尊侍神不畫。匾「海國陽春」的款識照片看不到，題獻者與年款查無。'],
    paragraphsEn: ['The shrine follows photographs of its present state (2025); no photograph of the hall in the Japanese period was found, so the banquet and modern eras are projected back from today. The figures are simplified, without facial detail; the small attendants in front are not drawn. The dedication of the plaque “Hai guo yang chun” cannot be read in the photographs, and no donor or date was found.'],
    sourceIds: ['nchdb-cisheng-monument', 'commons-cisheng-interior'],
    layers: {
      form: [
        {
          text: '〔照片〕Commons〈Interior of the Dadaocheng Cisheng Temple-02.2025-01-07.jpg〉（阿道，CC BY-SA 4.0）：龕內三層階梯式排列六、七尊以上媽祖金身，戴冕旒或鳳冠、紅底金繡袍，正中一尊較大；前排小尊侍神；神龕木雕黑、金色。文資網指定理由：「正殿三通五瓜格局雄偉，神龕精美」。',
          textEn: 'In the 2025 Commons photograph: six or seven or more gilt Mazu images on three stepped tiers, in beaded or phoenix crowns and red-and-gold robes, the central one larger; small attendant figures in front; the carving black and gold. The heritage register’s reasons for designation: “the three-through five-melon main hall is grand, and the shrine exquisite”.',
          sourceIds: ['commons-cisheng-interior', 'nchdb-cisheng-monument'],
        },
        {
          text: '〔照片〕神龕上方黑底金字橫匾「海國陽春」（右起），2025 年的照片放大後四字清楚；上下款在匾面兩端，照片太暗看不到，題獻者與年款本站查無。',
          textEn: 'A black plaque with gold characters above the shrine reads, from the right, “Hai guo yang chun” (“Spring over the sea country”); all four characters are legible once the 2025 photograph is enlarged. The dedication at either end is too dark to read, and no donor or date was found.',
          sourceIds: ['commons-cisheng-interior'],
        },
        {
          text: '據說這方匾是同治十一年（1872）的木板拼合匾（單一部落格，待核）。',
          textEn: 'Reportedly a plank-built plaque of 1872 (a single blog, to be verified).',
          sourceIds: ['hsu-blog-2014-cisheng'],
          status: 'hearsay',
        },
        {
          text: '廟方沿革板寫「根據傳說」本尊媽祖是嘉慶年間同安商人自湄洲分靈攜來、先祀艋舺八甲庄；神龕正中那尊大的是不是本尊、鎮殿媽祖的尺寸、材質與造像年代，本站都查無。本站畫 5 尊（使用者 2026-11-02 決定）。',
          textEn: 'The temple’s history board says that “according to tradition” the original image was brought from Meizhou by a Tong’an merchant in the Jiaqing years and first enshrined at Bajiazhuang in Bangka. Whether the large central image is that one, and the size, material and date of the hall image, are not known. This site models five images.',
          sourceIds: ['commons-cisheng-yange-board'],
          status: 'pending',
        },
      ],
      making: [
        {
          text: '不是食物；神像是木雕貼金，神袍是刺繡。',
          textEn: 'Not a foodstuff: the images are gilt carved wood, the robes embroidered.',
          status: 'reconstruction',
        },
      ],
      use: [
        {
          text: '同安人的媽祖：嘉慶年間從福建分靈，先供奉在艋舺八甲庄，1853 年頂下郊拚後隨同安人遷到大稻埕；1866 年已具正殿、前殿、兩廊格局；因市區改正遷到現址，1914 年起建、1916 年落成（廟方；文資網寫 1914），大木工程由陳應彬負責。',
          textEn: 'The Tong’an people’s Mazu: brought from Fujian in the Jiaqing years, first housed at Bajiazhuang in Bangka, moved with the Tong’an people to Dadaocheng after the 1853 feud; by 1866 the temple had a main hall, front hall and two galleries; urban improvement moved it to the present site, begun in 1914 and finished in 1916 (the temple’s account; the heritage register says 1914), with Chen Yingbin in charge of the timber work.',
          sourceIds: ['nchdb-cisheng-monument', 'sinica-gis-2025-cisheng', 'commons-cisheng-yange-board'],
        },
        {
          text: '正殿側牆一排四尊真人高的神將（藍袍、金冠、黑面，最前一尊持羽扇），照片沒有註明身分；據說是謝、范將軍與千里眼、順風耳（遊記與學校網頁，無官方出處）。本站不畫這幾尊，以簾幕示意。',
          textEn: 'Along the side wall of the main hall stand four life-size guardian figures in blue robes and gold crowns, black-faced, the foremost holding a feather fan; the photographs do not say who they are. Reportedly Generals Xie and Fan with Qianliyan and Shunfeng’er (travel blogs and a school web page, no official source). This site does not model them; a curtain stands in their place.',
          sourceIds: ['commons-cisheng-guardians', 'ylps-dadaocheng-cisheng'],
          status: 'hearsay',
        },
        {
          text: '本站讓人物只走到供桌前約一公尺，神龕一帶不能進去（謝宗榮：正殿明間供主神、神龕周圍信眾不進入；示意）。',
          textEn: 'On this site you can walk only to about a metre before the offering table; the shrine area is closed off (after Xie Zongrong: the central bay of the main hall belongs to the chief deity and worshippers do not enter around the shrine; illustrative).',
          sourceIds: ['ntcri-temple-layout-xie'],
          status: 'reconstruction',
        },
      ],
      where: [{ text: '慈聖宮四個年代的正殿（依年代老化）。', textEn: 'The main hall of Cisheng in all four eras, aged with the era.' }],
      evidence: [
        {
          text: '文資網古蹟頁（2020-12-22 指定）；Commons 正殿室內四張（阿道，2025）；中研院 GIS。',
          textEn: 'The heritage register (designated 22 Dec 2020); four Commons interior photographs (Adao, 2025); the Academia Sinica GIS page.',
          sourceIds: ['nchdb-cisheng-monument', 'commons-cisheng-interior', 'sinica-gis-2025-cisheng'],
        },
        {
          text: '光明燈塔、六角宮燈、弧形拱門與供品都只有 2025 年的照片；供桌前堵的年款讀得出「民國甲□年」，供桌是戰後之物。這些器物在日治與戰後初期是否已在殿內，本站查無。',
          textEn: 'The light towers, hexagonal lanterns, curved arch and offerings are known only from the 2025 photographs; the offering table carries a Minguo date (year unread) and is post-war. Whether any of them stood in the hall in the Japanese period or the early post-war years is not known.',
          sourceIds: ['commons-cisheng-interior'],
          status: 'pending',
        },
        {
          text: '1914–1945 年殿內的照片或描述：本站沒有找到。能找到最接近的是 1917 年的〈改築大稻埕慈聖宮捐題碑記〉拓本（國史館臺灣文獻館藏，只有捐題名單）與 1924 年慶成醮的報紙照片（醮壇在廟外）。廟方的沿革板寫 1914 年倡議重建、1916 年四月落成，與文資網的 1914 年不同，本站並列。',
          textEn: 'No photograph or description of the hall between 1914 and 1945 was found. The nearest things are the 1917 rubbing of the rebuilding donors’ stele (Taiwan Historica; a list of donors only) and newspaper photographs of the 1924 consecration festival (altars outside the temple). The temple’s own history board gives 1914 for the start and April 1916 for completion, against 1914 in the heritage register; this site lists both.',
          sourceIds: ['tcmb-cisheng-donation-stele-1917', 'commons-cisheng-yange-board', 'vocus-lefeng-1924-jiao-2', 'nchdb-cisheng-monument'],
          status: 'pending',
        },
      ],
    },
  },

  'tongzhi-stone-pillars': {
    id: 'tongzhi-stone-pillars',
    title: '同治六年的石柱',
    titleEn: 'The stone pillars of 1867',
    lead: '中庭兩廊的黑石柱，上款「同治六年丁卯端午日」，是 1867 年舊廟的柱子，遷廟時搬過來的（推定）——殿裡最老的東西。',
    leadEn: 'The black stone pillars in the galleries are dated “the Duanwu day of the sixth year of Tongzhi, dingmao”: columns of the old temple of 1867, brought here when the temple moved (presumed)—the oldest things in the building.',
    actions: [{ id: 'read', label: '讀柱上的字', labelEn: 'Read the inscription', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['柱上的字依 Commons 的照片：右柱楷書「慈孃印菩薩之心西天衣鉢」可讀，左柱篆書只認得聯首的「慈」；其餘的字本站不補。兩柱各是一副聯的一邊，對面的柱子沒有照片。柱子在哪一進各說不一（學習單：左右廂廊；部落格：天井的柱子是 1916 年新的），本站放在中庭是示意。'],
    paragraphsEn: ['The inscriptions follow the Commons photograph: the regular-script line on the right pillar can be read, while on the left, in seal script, only the opening “Ci” is legible; this site does not supply the rest. Each pillar is one half of a couplet, and the matching pillars have not been photographed. Accounts differ on which part of the temple they stand in (the worksheet: the side galleries; a blog: the courtyard pillars are new ones of 1916); placing them in the court is this site’s illustration.'],
    sourceIds: ['commons-cisheng-pillars', 'nchdb-cisheng-monument'],
    layers: {
      form: [
        {
          text: '〔照片〕Commons〈大稻埕慈聖宮同治六年石柱.jpg〉（Outlookxp，2018，CC BY-SA 4.0）：兩根黑色石柱，右柱陰刻描金楷書「慈孃印菩薩之心西天衣鉢」，上款「同治六年丁卯端午日」；左柱篆書十一字，只認得首字「慈」，上款「同治六年歲在丁卯天中節日」。兩柱各是一副聯的一邊，另一邊的柱子本站沒有照片。文資網：「廟內保有同治、大正年間之石柱與木雕」。',
          textEn: 'In the 2018 Commons photograph: two black stone pillars. The right one, incised and gilt in regular script: “The compassionate mother bears the Bodhisattva’s heart, the robe and bowl of the Western Heaven”, dated the Duanwu day of 1867. The left, in seal script, eleven characters of which only the first, “Ci”, is legible, dated the Tianzhong (Duanwu) festival of the same year. Each is one half of a couplet; this site has no photograph of the matching pillars. The heritage register: “the temple keeps stone pillars and carvings of the Tongzhi and Taishō years”.',
          sourceIds: ['commons-cisheng-pillars', 'nchdb-cisheng-monument'],
        },
        {
          text: '教育局學習單提示：同治五年（1866）與六年（1867）的柱子在左、右廂廊。',
          textEn: 'A Department of Education worksheet notes pillars of 1866 and 1867 in the left and right galleries.',
          sourceIds: ['tpomec-dadaocheng-worksheet'],
        },
        {
          text: '三川殿中門石門框的聯「第一門開觀音山拱秀／數千艇聚奎府水流煇」：兩篇部落格錄文，照片只拍到開頭幾字（據說是同治五年舊廟的石材）。',
          textEn: 'The couplet on the stone door frame of the central entrance, “The first gate opens on the arching beauty of Guanyin Mountain / thousands of boats gather where the Kuifu waters shine”: transcribed by two blogs, only its opening characters visible in the photographs (reportedly stone of the 1866 temple).',
          sourceIds: ['hsu-blog-2014-cisheng', 'commons-cisheng-plaque'],
          status: 'hearsay',
        },
      ],
      making: [
        {
          text: '不是食物。維基引聯合晚報 1990：舊廟的龍柱、石碑、石材與雕花大樑取自廈門港、由同安師傅雕琢（單一報紙來源）。',
          textEn: 'Not a foodstuff. Wikipedia, citing the United Evening News of 1990, says the old temple’s dragon columns, stelae, stone and carved beams came from Xiamen and were worked by Tong’an craftsmen (a single newspaper source).',
          sourceIds: ['wiki-ci-sheng-gong'],
          status: 'pending',
        },
      ],
      use: [
        {
          text: '1909 年舊廟因市區改正開始拆除，1914 年起在日新街重建、1916 年落成（廟方；文資網寫 1914）；同治年的石柱是從舊廟搬來的，所以遷來以後的四個年代都看得到。',
          textEn: 'The old temple was demolished from 1909 for urban improvement and rebuilt on Rixin Street from 1914, finished in 1916 (the temple’s account; the heritage register says 1914); the Tongzhi pillars came from the old temple, so they are there in all four eras since.',
          sourceIds: ['sinica-gis-2025-cisheng', 'nchdb-cisheng-monument'],
        },
        {
          text: '舊廟的石材遷來新廟是維基引 1990 年報紙與部落格的說法；這兩根柱子本身只有年款可證。',
          textEn: 'That the old temple’s stone was moved to the new one rests on Wikipedia citing a 1990 newspaper, and on blogs; the pillars themselves prove only their date.',
          sourceIds: ['wiki-ci-sheng-gong', 'hsu-blog-2014-cisheng'],
          status: 'pending',
        },
      ],
      where: [{ text: '慈聖宮四個年代的中庭兩廊（位置示意）。', textEn: 'The galleries of Cisheng in all four eras (position illustrative).' }],
      evidence: [
        {
          text: 'Commons 2018；文資網；教育局學習單。',
          textEn: 'Commons 2018; the heritage register; the worksheet.',
          sourceIds: ['commons-cisheng-pillars', 'nchdb-cisheng-monument', 'tpomec-dadaocheng-worksheet'],
        },
      ],
    },
  },

  'huize-tanfu-plaque': {
    id: 'huize-tanfu-plaque',
    title: '「惠澤覃敷」匾',
    titleEn: 'The “Grace spreads wide” plaque',
    lead: '三川殿中門上方，廟名額「慈聖宮」下面一方紅底金字的大匾「惠澤覃敷」，大正九年（1920）元月稻江平樂社仝敬獻。',
    leadEn: 'Over the central door of the entrance hall, under the temple’s name board, hangs a big red plaque with gold characters, “Grace spreads wide”, presented in January 1920 by the Pingle Society of Daojiang.',
    actions: [{ id: 'read', label: '抬頭讀', labelEn: 'Read it', doneLabel: '低頭', doneLabelEn: 'Look down' }],
    paragraphs: ['匾的款識依 Commons 的兩張照片放大：右款大正九年元月，左款稻江平樂社與社員姓名（小字未辨讀）。模型只寫看得清楚的款，看不清的姓名用「□」。街景裡的廟名額「慈聖宮」掛在中門外，這方匾在本站掛在中門內側，進門後回頭可讀。'],
    paragraphsEn: ['The dedication follows two enlarged Commons photographs: January 1920 on the right, the Pingle Society of Daojiang and its members’ names (too small to read) on the left. The model writes only the legible part of the dedication, with “□” for the unread names. The name board “Cisheng Gong” hangs outside the central door in the street scene; on this site the plaque hangs on the inner side of the door and can be read by turning around once inside.'],
    sourceIds: ['commons-cisheng-plaque', 'commons-cisheng-pingleshe'],
    layers: {
      form: [
        {
          text: '〔照片〕Commons〈Inscribed board of the Dadaocheng Cisheng Temple 20250107.jpg〉（阿道）與〈Dadaocheng Mazu Temple 02 廟名額、匾額.jpg〉（舟集，2024）：門楣下紅底金字大匾「惠澤覃敷」，金色雕花框，字是陽文貼金行書。',
          textEn: 'In the 2025 and 2024 Commons photographs: below the lintel the big red plaque “Grace spreads wide” in a gilt carved frame, the characters raised and gilt in running script.',
          sourceIds: ['commons-cisheng-plaque'],
        },
        {
          text: '〔照片〕右款「大正九年元月吉日」，左款「稻江平樂社」加三組社員姓名（小字未辨讀）、「仝敬獻」；右款下另有一行更小的字，讀得出「民國」二字，疑為後來重修的年款，未辨讀。',
          textEn: 'On the right the date “an auspicious day, first month, ninth year of Taishō” (1920); on the left “Daojiang Pingle Society”, three blocks of members’ names (too small to read) and “presented together”. Below the date a smaller line beginning “Minguo” is probably a later restoration date, unread.',
          sourceIds: ['commons-cisheng-plaque'],
        },
      ],
      making: [NOT_FOOD],
      use: [
        {
          text: '平樂社是慈聖宮的北管軒社，今社址在廟旁保安街 49 巷 36 號；1920 年的匾是軒社獻給廟的。本站四個年代都掛（酒樓繁華版標「1920 年以後」，年代前段沒有這方匾）。',
          textEn: 'The Pingle Society is a beiguan amateur troupe attached to the temple, today at no. 36 of the same lane; the 1920 plaque was the troupe’s gift to the temple. It hangs in all four eras on this site (marked “after 1920” in the banquet era, whose earlier years lacked it).',
          sourceIds: ['commons-cisheng-pingleshe'],
        },
      ],
      where: [{ text: '慈聖宮三川殿中門上方（本站掛在門內側）。', textEn: 'Over the central door of Cisheng’s entrance hall (on the inner side on this site).' }],
      evidence: [
        {
          text: 'Commons 兩張（2024、2025）；Commons 的平樂社照片（2026）。',
          textEn: 'Two Commons photographs (2024, 2025); the Commons photograph of the Pingle Society (2026).',
          sourceIds: ['commons-cisheng-plaque', 'commons-cisheng-pingleshe'],
        },
      ],
    },
  },
}

const spot = (base, eraId, objectId, label, labelEn) => ({ id: `${base}-${eraId}`, eraId, shopId: CS_ID, objectId, label, labelEn, level: 0, ...CS_INSPECT_SPOTS[base] })

export const CS_INSPECTABLES = CS_ERAS.flatMap((eraId) => [
  spot('cs-shrine', eraId, 'mazu-shrine', '正殿的媽祖神龕', 'The Mazu shrine in the main hall'),
  // 香爐：照片裡在神將前的長案上（深色、只有遠景）；形制待核（使用者 2026-11-05）
  spot('cs-censer', eraId, 'incense-burner', '長案上的深色圓爐（形制待核）', 'The dark round censer on the long table (form to be verified)'),
  spot('cs-pillars', eraId, 'tongzhi-stone-pillars', '中庭的同治六年石柱', 'The Tongzhi stone pillars in the court'),
  eraId === 'banquet'
    ? spot('cs-plaque', eraId, 'huize-tanfu-plaque', '三川殿的「惠澤覃敷」匾（1920 年以後）', 'The “Grace spreads wide” plaque (after 1920)')
    : spot('cs-plaque', eraId, 'huize-tanfu-plaque', '三川殿的「惠澤覃敷」匾', 'The “Grace spreads wide” plaque'),
])
