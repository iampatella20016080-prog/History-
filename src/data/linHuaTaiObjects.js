import { TEA_SCALE_CLASSIC_NOTE } from './classicsData.js'
import { LHT_ERA_INSPECT_SPOTS } from './linHuaTaiLayout.js'

/**
 * 林華泰茶行各年代室內可以近看的器物（第 11 階段）：分層資訊的第一個完整範例（格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/linHuaTai/linHuaTaiInspect.js；查證紀錄見 docs/research/lin-hua-tai.md 的「室內與器物」。
 *
 * - LHT_OBJECTS：新的器物（四方包、揀茶竹盤、炭焙火坑、磅仔、窨茉莉花、評茶盤、大茶桶）
 * - LHT_OBJECT_LAYERS：林華泰港口商街版原有的器物（桿秤、焙籠）與寶順洋行的茶籌補上的分層資訊
 * - LHT_INSPECTABLES：器物在各年代店裡的位置（併進 data/inspectObjects.js 的 STREET_INSPECTABLES）
 */

const LHT = 'lin-hua-tai'

export const LHT_OBJECTS = {
  'square-packet': {
    id: 'square-packet',
    title: '四方包',
    titleEn: 'Square paper packet',
    lead: '兩張方形毛邊紙內外相襯，放進四兩茶，摺成長方形，外面蓋上茶名與行號的印——「包種」的名字就是這樣來的。',
    leadEn: 'Two square sheets of rough paper, one inside the other, four taels of tea, folded into an oblong and stamped with the tea’s name and the firm’s—this is where “baozhong” (wrapped kind) gets its name.',
    actions: [{ id: 'open', label: '打開紙包', labelEn: 'Unwrap it', doneLabel: '包回去', doneLabelEn: 'Wrap it up' }],
    paragraphs: [
      '包種茶的四方包：方形福建毛邊紙兩張內外相襯，放入茶葉四兩，包成長方形，外面蓋上茶名及行號印章（《農業周刊》）。紙包的大小與印章的樣子是示意。',
    ],
    paragraphsEn: [
      'The baozhong packet: two square sheets of Fujian rough paper, one inside the other, four taels of tea, folded into an oblong and stamped with the tea’s name and the firm’s seal (Agriculture Weekly). The size and the seal are illustrative.',
    ],
    reconstruction: true,
    sourceIds: ['moa-baozhong-weekly'],
    layers: {
      form: [
        {
          text: '外層一張、內襯一張方形的福建毛邊紙，摺成長方形的紙包，包外蓋上茶名與行號的印章。',
          textEn: 'An outer and an inner sheet of square Fujian rough paper folded into an oblong packet, stamped on the outside with the tea’s name and the firm’s seal.',
          sourceIds: ['moa-baozhong-weekly'],
        },
        {
          text: '模型的大小、紙的顏色與印章的樣子是示意，不對應任何一家茶行的實物。',
          textEn: 'The model’s size, the colour of the paper and the look of the seals are illustrative and do not match any particular tea hong’s packet.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '一包放茶葉四兩（臺斤一兩約 37.5 公克，四兩約 150 公克）。',
          textEn: 'Each packet holds four taels of tea (one Taiwanese tael is about 37.5 g, so about 150 g).',
          sourceIds: ['moa-baozhong-weekly'],
        },
        {
          text: '傳統的花香包種茶，是茶葉烘乾後配上茉莉等香花窨製：茶 100 斤配茉莉鮮花 30 斤，靜置約 20 小時，揀掉花再乾燥。',
          textEn: 'Traditional flower-scented baozhong was made by pairing the dried tea with jasmine or other fragrant flowers: 100 catties of tea to 30 catties of fresh jasmine, left about 20 hours, then the flowers picked out and the tea dried again.',
          sourceIds: ['tcmb-jasmine-scenting-196112'],
        },
      ],
      use: [
        {
          text: '日治時期大稻埕外銷南洋的主力茶，幾乎都是坪林的文山包種茶；重慶北路對街一排林華泰系列的茶行，是當時典型銷往華人社會的茶商。',
          textEn: 'In the Japanese era almost all of Dadaocheng’s main tea for Southeast Asia was Wenshan baozhong from Pinglin; the row of Lin Huatai-group hongs across Chongqing North Road were typical merchants selling to Chinese communities.',
          sourceIds: ['ntcri-77-xinfangchun', 'ntcri-73-tea-road'],
        },
        {
          text: '林華泰這個時期是不是用四方包出貨，文獻沒有記載；把包茶桌放在前店是歷史情境重建。林華泰早期的茶葉用報紙等紙材包裝，後來改用印刷紙袋。',
          textEn: 'Whether Lin Huatai shipped in square packets in this period is not recorded; the packing table in the front shop is a reconstructed scene. Lin Huatai’s early tea was wrapped in newspaper and other paper, later in printed paper bags.',
          sourceIds: ['tcmb-linhuatai-601589'],
          status: 'pending',
        },
      ],
      where: [
        {
          text: '老屋新生的新芳春茶行（主題路線「老屋裡的新生活」）也可以近看包種茶罐，打開罐蓋，裡面就是四方包。',
          textEn: 'At the Xinfangchun Tea Hong in the revival era (route “New Lives in Old Houses”) you can examine a baozhong tin; open the lid and a square packet is inside.',
        },
      ],
      evidence: [
        {
          text: '四方包的做法與「包種」名稱的由來：《農業周刊》〈文山包種茶 清香最誘人〉（約 1987）。',
          textEn: 'How the packet is made and where the name “baozhong” comes from: Agriculture Weekly, “Wenshan baozhong tea: its fragrance is the most alluring” (about 1987).',
          sourceIds: ['moa-baozhong-weekly'],
        },
        {
          text: '日治時期的四方包實物照片或典藏條目：本站沒有找到。',
          textEn: 'A photograph or museum record of an actual Japanese-era square packet: not found by this site.',
          status: 'pending',
        },
      ],
    },
  },

  'tea-sorting-tray': {
    id: 'tea-sorting-tray',
    title: '揀茶的竹淺盤',
    titleEn: 'Tea-sorting tray',
    lead: '圓圓的竹編淺盤攤著毛茶，揀茶女圍坐在旁，把茶枝、茶梗和壞葉一片片挑出來。',
    leadEn: 'A round woven-bamboo tray spread with crude tea; the sorters sit round it, picking out twigs, stalks and spoiled leaves one by one.',
    actions: [{ id: 'pick', label: '挑出茶梗', labelEn: 'Pick out the stalks', doneLabel: '放回去', doneLabelEn: 'Put them back' }],
    paragraphs: ['1904 年《福爾摩沙烏龍茶》的圖版〈揀茶女〉：婦女圍坐在盛滿茶葉的竹製淺盤旁，剔除枝、梗與壞葉。淺盤的做法依臺史博的竹編大篩，是歷史情境重建。'],
    paragraphsEn: ['The plate “Tea sorters” in Formosa Oolong Tea (1904): women sit round bamboo trays heaped with tea, removing twigs, stalks and spoiled leaves. The tray’s construction follows a large bamboo sieve in the National Museum of Taiwan History and is a reconstruction.'],
    reconstruction: true,
    sourceIds: ['nmth-1904-tea-sorters', 'nmth-sieve-2002-005-0277'],
    layers: {
      form: [
        {
          text: '竹篾編的圓形淺盤，緣口內外加厚竹片、用藤皮纏繞。做法與尺度借自臺史博的竹編大篩（66.3 × 65 × 18.5 公分）；那件是篩粟、稻穀用的，不是揀茶專用。',
          textEn: 'A round shallow tray of woven bamboo, its rim thickened inside and out with bamboo strips bound in rattan. Construction and scale are borrowed from a large bamboo sieve in the National Museum of Taiwan History (66.3 × 65 × 18.5 cm), which was for millet and paddy, not made for sorting tea.',
          sourceIds: ['nmth-sieve-2002-005-0277'],
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '盤裡是還沒精製的毛茶；揀茶就是把茶枝、茶梗與壞葉挑掉，挑乾淨的茶再去焙。',
          textEn: 'The tray holds unrefined crude tea; sorting means picking out the twigs, stalks and spoiled leaves, and the cleaned tea then goes for firing.',
          sourceIds: ['nmth-1904-tea-sorters'],
        },
      ],
      use: [
        {
          text: '茶季時大稻埕的揀茶女每天超過一萬二千人（Davidson 1903 的估計），孩童與年長者也一起揀。',
          textEn: 'In the tea season more than twelve thousand sorters worked in Dadaocheng each day (Davidson’s 1903 estimate), with children and old people joining in.',
          sourceIds: ['nmth-1904-tea-sorters', 'davidson-formosa-1903'],
        },
        {
          text: '揀茶按件計酬、領茶籌結算的說法來自耆老口述與私人收藏的報導（見「茶籌」）。',
          textEn: 'The account of piece-rate pay settled with tallies comes from elders’ recollections and a report on a private collection (see “Tea tally”).',
          sourceIds: ['nownews-tea-tally-2019'],
          status: 'pending',
        },
      ],
      where: [
        {
          text: '港口商街的寶順洋行室內也有揀茶桌（第 10 階段「一箱茶的旅程」）。',
          textEn: 'The Dodd & Co. interior in the Qing harbour era also has sorting tables (stage 10, “The Journey of a Chest of Tea”).',
        },
      ],
      evidence: [
        {
          text: '照片：國立臺灣歷史博物館典藏的 1904 年圖版〈揀茶女〉（2003.014.0096.0016）。',
          textEn: 'Photograph: the 1904 plate “Tea sorters” in the National Museum of Taiwan History (2003.014.0096.0016).',
          sourceIds: ['nmth-1904-tea-sorters'],
        },
        {
          text: '揀茶專用淺盤的典藏條目：臺史博、台灣民俗文物館都沒有找到。',
          textEn: 'A museum record of a tray made specifically for sorting tea: not found at the National Museum of Taiwan History or the Taiwan Folk Arts Museum.',
          status: 'pending',
        },
      ],
    },
  },

  'charcoal-pit': {
    id: 'charcoal-pit',
    title: '炭焙火坑與焙籠',
    titleEn: 'Charcoal pit and roasting basket',
    lead: '直徑兩尺、深兩尺半的火坑裡，相思木炭蓋著薰黑的稻糠悶燒，沒有一點煙；兩尺高的竹焙籠就架在坑口上。',
    leadEn: 'In a pit two chi across and two and a half deep, acacia charcoal smoulders under blackened rice husk without a wisp of smoke; a bamboo basket two chi tall sits over the mouth.',
    actions: [{ id: 'lift', label: '抬起焙籠', labelEn: 'Lift the basket', doneLabel: '放回火坑', doneLabelEn: 'Set it back' }],
    paragraphs: ['林家的炭焙暖房（官網〈林華泰的歷史 1/5、2/5〉，家族口述）：三十幾個圓火坑排成四長排；模型依文字描述重建。'],
    paragraphsEn: ['The Lin family’s charcoal-roasting room (official website, “The History of Lin Huatai 1/5, 2/5”, family oral history): thirty-odd round pits in four long rows; the model is rebuilt from the description.'],
    reconstruction: true,
    sourceIds: ['linhuatai-site'],
    layers: {
      form: [
        {
          text: '火坑直徑約兩尺、深兩尺半；焙籠是細竹片編的圓筒，高約兩尺，口徑略大於坑口，筒內中央有一片竹編圓盤，把圓筒隔成上下兩半。',
          textEn: 'The pit is about two chi across and two and a half deep; the basket is a cylinder of fine bamboo strips about two chi tall, a little wider than the pit, with a woven bamboo disc across the middle dividing it into upper and lower halves.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '模型依文字描述重建；磚緣與臺面的做法是示意。',
          textEn: 'The model is rebuilt from the written description; the brick rim and platform are illustrative.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '坑裡堆起兩尺高的文火：相思木炭上蓋著厚厚的薰黑稻糠悶燒，所以沒有煙。茶葉先在走道上鋪在焙籠的竹盤上，再把整個焙籠安置到坑上。',
          textEn: 'A gentle fire is banked two chi deep in the pit: acacia charcoal smoulders under a thick layer of blackened rice husk, so there is no smoke. The tea is first spread on the basket’s bamboo disc in the aisle, then the whole basket is set over the pit.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '日治初期的官方圖說也寫炭火覆灰、不冒煙：燒好的炭覆灰後爐溫可維持七到十天，一籠約七斤茶，烘七到八小時。',
          textEn: 'An official caption from the early Japanese era likewise describes banked, smokeless charcoal: once covered with ash the pit stays hot for seven to ten days, and a basket of about seven catties of tea is fired for seven to eight hours.',
          sourceIds: ['nmth-1904-roasting-baskets'],
        },
      ],
      use: [
        {
          text: '暖房是烘焙茶葉用的，不是取暖用的；冬夜親友來訪，女客會待在暖房裡聊天。三十幾個火坑後來縮減到八個、再剩兩個，改用大型乾燥機。',
          textEn: 'The warm room was for firing tea, not for warmth, though on winter nights visiting women would sit and talk there. The thirty-odd pits later shrank to eight, then two, as a large drying machine took over.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '官網的回憶只寫「五十年或一百年前」，沒有寫明年代；本站把三十幾個火坑的暖房放在 1930–1945 是推定。',
          textEn: 'The family recollection says only “fifty or a hundred years ago” and gives no date; placing the thirty-pit room in 1930–1945 is this site’s inference.',
          status: 'pending',
        },
      ],
      where: [
        {
          text: '老屋新生的林華泰店後，最後的兩口火坑封存留作遺址；有記名茶的焙籠間也有四十多個焙窟還在使用（2012 年的報導）。',
          textEn: 'Behind Lin Huatai in the revival era the last two pits are sealed and kept as a relic; at Youji Tea the roasting room’s forty-odd pits were still in use (2012 report).',
          sourceIds: ['discover-taipei-tea-shops-2012'],
        },
      ],
      evidence: [
        {
          text: '文字：官網〈林華泰的歷史 1/5、2/5〉，擷取自第四代林秀全的回憶；照片：〈3/5〉的封存焙坑、〈2/5〉一排排靠牆的焙籠。',
          textEn: 'Text: the official website’s “The History of Lin Huatai 1/5, 2/5”, excerpted from the recollections of Lin Xiuquan of the fourth generation; photographs: the sealed pits in “3/5” and the rows of baskets against the wall in “2/5”.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '對照：1904 年圖版〈烘焙室的焙籠〉（2003.014.0096.0014）。',
          textEn: 'For comparison: the 1904 plate “Roasting baskets in the roasting room” (2003.014.0096.0014).',
          sourceIds: ['nmth-1904-roasting-baskets'],
        },
      ],
    },
  },

  'platform-scale': {
    id: 'platform-scale',
    title: '磅仔（台秤）',
    titleEn: 'Platform scale (bōng-á)',
    lead: '茶袋放上平臺，秤錘在秤桿上滑到平衡——批發的茶一袋一袋過磅。',
    leadEn: 'The sack goes on the platform and the weight slides along the beam until it balances—wholesale tea is weighed sack by sack.',
    actions: [{ id: 'weigh', label: '秤重', labelEn: 'Weigh it', doneLabel: '取下', doneLabelEn: 'Take it off' }],
    paragraphs: ['臺史博「秤陀1組」的館方說明：昭和年間以後開始用磅仔秤重，大型的鐵或銅製、下有四個輪子、上有平臺與秤桿。林華泰店裡有一台用了五十多年的老秤（官網照片）。'],
    paragraphsEn: ['The National Museum of Taiwan History’s note to a steelyard set: weighing with a bōng-á began in the Shōwa years; the large ones are iron or copper, with four wheels, a platform and a beam. Lin Huatai has an old scale in use for more than fifty years (official website photograph).'],
    reconstruction: true,
    sourceIds: ['nmth-steelyard-2002-005-0156', 'linhuatai-site'],
    layers: {
      form: [
        {
          text: '大型的磅仔是鐵或銅製，下有四個輪子，上有平臺與秤桿。',
          textEn: 'A large bōng-á is iron or copper, with four wheels underneath and a platform and beam on top.',
          sourceIds: ['nmth-steelyard-2002-005-0156'],
        },
        {
          text: '林華泰店裡用了五十多年的老秤：木製的底座平臺，加上金屬立柱與秤桿；櫃台尾端另有一台鑄鐵的桿式台秤（官網照片的觀察）。',
          textEn: 'Lin Huatai’s scale of more than fifty years: a wooden base platform with a metal column and beam; a cast-iron beam scale also stands at the end of the counter (observed in the official website’s photographs).',
          sourceIds: ['linhuatai-site'],
        },
        {
          text: '模型的尺寸與零件是示意：摩登年代的版本畫成鐵製、四個輪子，老屋新生的版本畫成木製底座。',
          textEn: 'The model’s size and parts are illustrative: the 1930s version is iron on four wheels, the revival version has a wooden base.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '秤的是茶：茶行收毛茶、出精製茶，都論斤計價；1904 年的烘焙室圖版裡也有一台磅秤，推測用來在茶倒進焙籠之前秤重。',
          textEn: 'What is weighed is tea: a hong buys crude tea and sells refined tea by the catty; the 1904 roasting-room plate also shows a scale, thought to weigh the tea before it goes into the baskets.',
          sourceIds: ['nmth-1904-roasting-room'],
        },
      ],
      use: [
        {
          text: '昭和年間（1926 年起）以後才開始出現用磅仔秤重的方式；之前多用桿秤。',
          textEn: 'Weighing with a bōng-á only began to appear from the Shōwa years (from 1926); before that the steelyard was usual.',
          sourceIds: ['nmth-steelyard-2002-005-0156'],
        },
        {
          text: '林華泰以批發為主：茶季時白天卡車載來買進的粗茶，傍晚貨運卡車出貨到島內各地的茶莊。',
          textEn: 'Lin Huatai dealt mainly in wholesale: in the tea season trucks brought in the crude tea by day, and freight trucks took the tea out to shops across the island in the evening.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
      ],
      where: [],
      evidence: [
        {
          text: '官網〈百年老店林華泰〉的照片與圖說：「店內使用的老秤：50多年的光陰過去仍舊健在」。',
          textEn: 'Photograph and caption on the official website’s “The Century-Old Lin Huatai”: “The old scale used in the shop: more than fifty years on and still going.”',
          sourceIds: ['linhuatai-site'],
        },
        {
          text: '臺史博「秤陀1組」（2002.005.0156）的館方說明；1904 年圖版〈烘焙室內部〉（2003.014.0096.0013）。',
          textEn: 'The National Museum of Taiwan History’s note to “Steelyard and weight, one set” (2002.005.0156); the 1904 plate “Inside the roasting room” (2003.014.0096.0013).',
          sourceIds: ['nmth-steelyard-2002-005-0156', 'nmth-1904-roasting-room'],
        },
        {
          text: '林華泰在 1930–1945 用什麼秤：查無。',
          textEn: 'What scale Lin Huatai used in 1930–1945: not found.',
          status: 'pending',
        },
      ],
    },
  },

  'jasmine-scenting': {
    id: 'jasmine-scenting',
    title: '窨茉莉花',
    titleEn: 'Scenting with jasmine',
    lead: '一層茶、一層茉莉花，層層鋪疊過一夜；半夜起來翻動一兩次，到黎明花謝了，香氣就留在茶裡。',
    leadEn: 'A layer of tea, a layer of jasmine, stacked up overnight; turned once or twice in the night, and by dawn the flowers have faded and their scent is in the tea.',
    actions: [{ id: 'sift', label: '篩出茉莉花', labelEn: 'Sift out the flowers', doneLabel: '放回去', doneLabelEn: 'Put them back' }],
    paragraphs: ['戰後的林華泰（官網〈林華泰的歷史 3/5〉，家族口述）：入夜後茉莉花農騎腳踏車送花來，師傅把茶和花混在一起，半夜翻動一兩次，直到黎明。窨花的器具查無，模型是示意。'],
    paragraphsEn: ['Postwar Lin Huatai (official website, “The History of Lin Huatai 3/5”, family oral history): after dark jasmine growers came by bicycle with flowers; the tea was mixed with them and turned once or twice in the night until dawn. The scenting equipment is not documented; the model is illustrative.'],
    reconstruction: true,
    sourceIds: ['linhuatai-site', 'tcmb-jasmine-scenting-196112'],
    layers: {
      form: [
        {
          text: '日治時期的做法：容器底鋪一層茶、上面鋪鮮花，重複三到四次，最上面再鋪一層茶封住香氣。',
          textEn: 'The Japanese-era method: a layer of tea in the bottom of the container, fresh flowers on top, repeated three or four times, with a last layer of tea to seal in the scent.',
          sourceIds: ['tcmb-jasmine-1900-500865'],
        },
        {
          text: '窨花用的容器與器具（竹蓆、簍、桶）查無；模型把茶與花鋪在竹蓆上是示意。',
          textEn: 'The containers and tools used for scenting (mats, baskets, tubs) are not documented; the model’s bamboo mat is illustrative.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '茶 100 斤配茉莉鮮花 30 斤，靜置約 20 小時，揀掉花再乾燥（《台灣之茶》）。',
          textEn: '100 catties of tea to 30 catties of fresh jasmine, left about 20 hours, then the flowers removed and the tea dried (Taiwan’s Tea).',
          sourceIds: ['tcmb-jasmine-scenting-196112'],
        },
        {
          text: '在花香最濃時把花和茶併堆，每次約 12 小時以上，花香散失前把花篩出；可以重複幾次（單薰、雙薰、三薰）。',
          textEn: 'The flowers are heaped with the tea when most fragrant, each time for 12 hours or more, and sieved out before the scent fades; it can be repeated (single, double, triple scenting).',
          sourceIds: ['tcmb-scenting-329600'],
        },
        {
          text: '各來源寫的時間不一樣（約 20 小時、12 小時以上、7–8 小時再 5 小時、整夜），本站不寫成單一的做法。',
          textEn: 'The sources give different times (about 20 hours, over 12 hours, 7–8 hours then 5 more, overnight), so this site does not present a single method.',
          sourceIds: ['tcmb-jasmine-1900-500865'],
        },
      ],
      use: [
        {
          text: '入夜以後，穿木屐的茉莉花農騎腳踏車送花來，一部車前後載好幾袋；九點多以後師傅把茶和花混在一起，半夜工人起來翻動一兩次，直到黎明。香片是暢銷貨，自己可以佔一個房間。',
          textEn: 'After dark, jasmine growers in wooden clogs arrived by bicycle, each bike loaded front and back with bags; after nine the tea was mixed with the flowers and workers got up in the night to turn it once or twice until dawn. Jasmine tea sold so well it had a room to itself.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
      ],
      where: [
        {
          text: '日治時期淡水河對岸的三重埔是香花產地，約有 38 公頃茉莉花供薰茶。',
          textEn: 'In the Japanese era Sanchongpu across the Tamsui River grew fragrant flowers, with about 38 hectares of jasmine for scenting tea.',
          sourceIds: ['sanchong-district-office-history'],
        },
      ],
      evidence: [
        {
          text: '文字：官網〈林華泰的歷史 3/5〉（家族口述）；國家文化記憶庫的〈臺灣早期茶葉發展主力─茉莉窨花〉、〈薰花茶窨製〉、〈日治時期之茉莉花田影像〉。',
          textEn: 'Text: the official website’s “The History of Lin Huatai 3/5” (family oral history); the Taiwan Cultural Memory Bank entries on jasmine scenting, scenting flower tea and Japanese-era jasmine fields.',
          sourceIds: ['linhuatai-site', 'tcmb-jasmine-scenting-196112', 'tcmb-scenting-329600', 'tcmb-jasmine-1900-500865'],
        },
        {
          text: '林華泰窨花的照片、1930 年代大稻埕窨製茉莉花茶的專門紀錄：查無。',
          textEn: 'Photographs of scenting at Lin Huatai, and a dedicated record of jasmine scenting in 1930s Dadaocheng: not found.',
          status: 'pending',
        },
      ],
    },
  },

  'tasting-tray': {
    id: 'tasting-tray',
    title: '評茶盤',
    titleEn: 'Tea-judging tray',
    lead: '一抓茶放在木盤上：看茶色、聞茶香、掂一掂份量——買茶賣茶，先過這一關。',
    leadEn: 'A handful of tea on a wooden tray: look at the colour, smell the aroma, feel its weight—buying and selling tea starts here.',
    actions: [{ id: 'tilt', label: '倒出茶樣', labelEn: 'Pour out the sample', doneLabel: '放平', doneLabelEn: 'Set it level' }],
    paragraphs: ['審茶盤最早是木製，之後換成鐵製，現在多用塑膠；早期的盤有倒茶樣用的缺口（國家文化記憶庫〈審茶盤演進〉）。模型是示意。'],
    paragraphsEn: ['Judging trays were first wooden, then iron, and are now mostly plastic; early trays had a notch for pouring out the sample (Taiwan Cultural Memory Bank). The model is illustrative.'],
    reconstruction: true,
    sourceIds: ['tcmb-tea-judging-tray-258501'],
    layers: {
      form: [
        {
          text: '長方形或正方形的淺盤，可盛 150 至 200 公克；最早是木製，之後換成鐵製，現在多用塑膠；早期的盤有倒茶樣用的缺口。',
          textEn: 'An oblong or square shallow tray holding 150–200 g; the first were wooden, then iron, now mostly plastic; early trays had a notch for pouring out the sample.',
          sourceIds: ['tcmb-tea-judging-tray-258501'],
        },
        {
          text: '據說林華泰的老闆有一個專用的木製評茶盤，因為常用手抓茶嗅聞，盤面被磨得凹陷。',
          textEn: 'It is said that Lin Huatai’s owner had his own wooden judging tray, worn hollow from his hand scooping up the tea to smell it.',
          sourceIds: ['tcmb-linhuatai-601589'],
          status: 'hearsay',
        },
      ],
      making: [
        {
          text: '盤裡是茶樣：看外觀與茶色、聞香氣，也用手掂茶葉的比重。',
          textEn: 'The tray holds a sample: you look at its appearance and colour, smell the aroma, and judge its density by hand.',
          sourceIds: ['tcmb-linhuatai-601589'],
          status: 'hearsay',
        },
      ],
      use: [
        {
          text: '戰後的林華泰：白天最熱絡的地方，是爸爸向農民買茶葉、看茶色聞茶香的院子。',
          textEn: 'Postwar Lin Huatai: the busiest place by day was the yard where the father bought tea from farmers, looking at its colour and smelling its aroma.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '現在的櫃台上也擺著淺木方盤盛茶樣，旁邊是茶壺與小杯（官網照片的觀察）。',
          textEn: 'Today the counter also has shallow square wooden trays of samples beside a teapot and small cups (observed in the official website’s photographs).',
          sourceIds: ['linhuatai-site'],
        },
      ],
      where: [],
      evidence: [
        {
          text: '國家文化記憶庫〈審茶盤演進〉（茶業改良場評茶室的三種審茶盤）、〈曾經是臺灣最大內銷茶供應商的林華泰茶行〉。',
          textEn: 'Taiwan Cultural Memory Bank: “The evolution of the tea-judging tray” (three trays in the Tea Research and Extension Station’s judging room) and the entry on Lin Huatai as once the largest domestic tea supplier.',
          sourceIds: ['tcmb-tea-judging-tray-258501', 'tcmb-linhuatai-601589'],
        },
        {
          text: '老闆那個凹陷的木盤只見「據說」，沒有照片，模型不畫成它。',
          textEn: 'The owner’s hollowed tray is only “reportedly”, with no photograph, so the model does not depict it.',
          status: 'pending',
        },
      ],
    },
  },

  'tea-drum': {
    id: 'tea-drum',
    title: '大茶桶',
    titleEn: 'Tea drum',
    lead: '灰綠色的大圓鐵桶，桶蓋上用紅漆寫著茶名和價錢——不必問，看蓋子就知道。',
    leadEn: 'A big grey-green iron drum with the tea’s name and price painted in red on the lid—no need to ask, just read the lid.',
    actions: [{ id: 'open', label: '打開桶蓋', labelEn: 'Open the lid', doneLabel: '蓋上', doneLabelEn: 'Close it' }],
    paragraphs: ['官網：批發要用超大號的圓鐵桶，店裡陳列將近百個大小茶桶。顏色、桶蓋的紅字依官網照片；尺寸是照片目測，實測查無。'],
    paragraphsEn: ['Official website: wholesale needs oversized round iron drums, and the shop displays nearly a hundred of various sizes. The colour and red lettering follow the website’s photographs; the size is estimated from photographs, as no measurements were found.'],
    reconstruction: true,
    sourceIds: ['linhuatai-site', 'tcmb-linhuatai-500830'],
    layers: {
      form: [
        {
          text: '圓形直立的金屬桶，桶身灰綠色，平而略凸的桶蓋；蓋面用紅漆手寫茶名與價碼（官網照片的觀察；模型只畫筆畫，不寫字）。',
          textEn: 'An upright round metal drum, grey-green, with a flat, slightly domed lid; the tea’s name and price are hand-painted in red on the lid (observed in the website’s photographs; the model shows strokes, not words).',
          sourceIds: ['linhuatai-site'],
        },
        {
          text: '大小：照片目測桶徑約成人肩寬的兩倍、桶高到胸口；實際尺寸與材質（鍍鋅鐵皮或不鏽鋼）查無。',
          textEn: 'Size: estimated from photographs at about twice an adult’s shoulder width across and chest-high; the actual dimensions and material (galvanised sheet iron or stainless steel) are not found.',
          status: 'pending',
        },
      ],
      making: [
        {
          text: '散茶依種類與等級分桶裝；批發的量大，所以要用超大號的鐵桶。',
          textEn: 'Loose tea is kept in separate drums by kind and grade; wholesale quantities are large, hence the oversized drums.',
          sourceIds: ['linhuatai-site'],
          status: 'oral',
        },
        {
          text: '官網列的茶：臺灣烏龍茶、包種茶、白毫烏龍茶（東方美人）、焙香烏龍茶。',
          textEn: 'Teas listed on the website: Taiwan oolong, baozhong, white-tip oolong (Oriental Beauty) and roasted oolong.',
          sourceIds: ['linhuatai-site'],
        },
      ],
      use: [
        {
          text: '店裡陳列將近百個大小茶桶，裝著各種不同級別的茶；價碼標在桶蓋上，有的桶蓋也拿來放茶盤。',
          textEn: 'Nearly a hundred drums of various sizes hold teas of every grade; the price is on the lid, and some lids double as a surface for tea trays.',
          sourceIds: ['linhuatai-site'],
        },
        {
          text: '早期茶葉用報紙等紙材包裝，後來改用印刷紙袋；1960 年代以後才有鐵罐。大鐵桶什麼時候開始用，查無。',
          textEn: 'Early on tea was wrapped in newspaper and other paper, later in printed paper bags; tins came only from the 1960s. When the big drums came into use is not found.',
          sourceIds: ['tcmb-linhuatai-601589'],
          status: 'pending',
        },
      ],
      where: [
        {
          text: '本站的店裡只畫出其中一部分的茶桶；店面與工廠相接的「前店後廠」是林華泰最著名的地方。',
          textEn: 'The shop on this site shows only some of the drums; the joined shop and factory, “shop in front, factory behind”, is what Lin Huatai is best known for.',
          sourceIds: ['tcmb-linhuatai-500830'],
        },
      ],
      evidence: [
        {
          text: '照片：官網〈過去的採訪紀錄與老照片〉（日本亞細亞航空來店取景的宣傳冊，年份未標）、〈林華泰的歷史 2/5〉林秀全站在大圓鐵桶旁。',
          textEn: 'Photographs: the website’s “Past interviews and old photographs” (a Japan Asia Airways brochure shot in the shop, undated) and “The History of Lin Huatai 2/5”, with Lin Xiuquan beside a big round drum.',
          sourceIds: ['linhuatai-site'],
        },
        {
          text: '國家文化記憶庫〈繼續傳承茶香的百年老店〉：店面擺放巨大的鐵桶盛裝茶葉。茶葉用大鐵桶的博物館典藏條目：查無。',
          textEn: 'Taiwan Cultural Memory Bank: huge iron drums in the shop hold the tea. A museum record of a tea drum: not found.',
          sourceIds: ['tcmb-linhuatai-500830'],
        },
      ],
    },
  },
}

/** 林華泰（與寶順洋行）原有器物補上的分層資訊（併進 INSPECT_OBJECTS 的同一件器物） */
export const LHT_OBJECT_LAYERS = {
  'tea-scale': {
    form: [
      {
        text: '秤桿、秤鉤與滑動的秤錘：秤鉤吊起茶簍，秤錘滑到秤桿平衡的刻度就是重量。清末茶行用秤的形制查無，模型依一般桿秤重建。',
        textEn: 'A beam, a hook and a sliding weight: the hook lifts the basket and the mark where the beam balances gives the weight. The form used in late-Qing tea hongs is not found; the model follows an ordinary steelyard.',
        status: 'reconstruction',
      },
      {
        text: '對照：臺史博的大型桿秤一組長 153.7 公分、重 5.5 公斤。',
        textEn: 'For comparison: a large steelyard set in the National Museum of Taiwan History is 153.7 cm long and weighs 5.5 kg.',
        sourceIds: ['nmth-steelyard-2002-005-0156'],
      },
    ],
    making: [
      {
        text: '茶的買賣與工資以擔、斤計，Davidson 自註一擔＝133 磅。',
        textEn: 'Tea and wages were reckoned in piculs and catties; Davidson notes that one picul is 133 pounds.',
        sourceIds: ['davidson-formosa-1903'],
      },
    ],
    use: [
      {
        text: '清末茶行收毛茶、賣茶都要過秤；昭和年間以後才開始用平臺式的磅仔。',
        textEn: 'Late-Qing hongs weighed tea both buying and selling; the platform bōng-á only came into use from the Shōwa years.',
        sourceIds: ['davidson-formosa-1903', 'nmth-steelyard-2002-005-0156'],
      },
    ],
    where: [],
    evidence: [
      {
        text: 'Davidson《The Island of Formosa, Past and Present》（1903）；臺史博「秤陀1組」（2002.005.0156）。',
        textEn: 'Davidson, The Island of Formosa, Past and Present (1903); the National Museum of Taiwan History’s steelyard set (2002.005.0156).',
        sourceIds: ['davidson-formosa-1903', 'nmth-steelyard-2002-005-0156'],
      },
      {
        text: '清末大稻埕茶行實際用秤的照片：查無。',
        textEn: 'A photograph of the scales actually used in a late-Qing Dadaocheng hong: not found.',
        status: 'pending',
      },
      TEA_SCALE_CLASSIC_NOTE,
    ],
  },
  'roasting-basket': {
    form: [
      {
        text: '高約三呎、形如骰盅的竹籠，腰下有篩為底；焙坑深二呎、徑二呎、相距一呎，周圍是低磚臺。',
        textEn: 'A bamboo basket about three feet tall, shaped like a dice box, with a sieve at the waist; the pits are two feet deep, two feet across and a foot apart, set in a low brick platform.',
        sourceIds: ['davidson-formosa-1903'],
      },
    ],
    making: [
      {
        text: '木炭燒到通紅、覆灰養火，一次可維持一週以上；焙茶工約每小時逐籠翻茶一次，一般焙八到十個小時。',
        textEn: 'The charcoal is burned red and banked with ash, lasting more than a week; the roasters turn each basket about once an hour, usually for eight to ten hours.',
        sourceIds: ['davidson-formosa-1903'],
      },
    ],
    use: [
      {
        text: 'Davidson 寫的是 1890 年代末的做法，用在清末為推定相近；日治初期的官方圖版也畫著兩側擺滿焙籠的烘焙室。',
        textEn: 'Davidson describes practice of the late 1890s, so applying it to the late Qing is an inference; an official plate from the early Japanese era shows a roasting room lined with baskets on both sides.',
        sourceIds: ['davidson-formosa-1903', 'nmth-1904-roasting-baskets'],
      },
    ],
    where: [
      {
        text: '1930 年代以後林家的焙籠是高約兩尺的竹編圓筒，見「炭焙火坑與焙籠」。',
        textEn: 'From the 1930s on, the Lin family’s baskets were bamboo cylinders about two chi tall; see “Charcoal pit and roasting basket”.',
        sourceIds: ['linhuatai-site'],
        status: 'oral',
      },
    ],
    evidence: [
      {
        text: '文字：Davidson（1903）；照片：1904 年圖版〈烘焙室的焙籠〉（2003.014.0096.0014）、〈烘焙室內部〉（2003.014.0096.0013）。',
        textEn: 'Text: Davidson (1903); photographs: the 1904 plates “Roasting baskets in the roasting room” (2003.014.0096.0014) and “Inside the roasting room” (2003.014.0096.0013).',
        sourceIds: ['davidson-formosa-1903', 'nmth-1904-roasting-baskets', 'nmth-1904-roasting-room'],
      },
    ],
  },
  'tea-tally': {
    form: [
      {
        text: '鐵片籌與紙籌：模型依報導的描述想像，不對應任何一枚實際的茶籌。',
        textEn: 'Metal-strip and paper tallies: the model is imagined from the report’s description and matches no actual tally.',
        sourceIds: ['nownews-tea-tally-2019'],
        status: 'reconstruction',
      },
    ],
    making: [
      {
        text: '揀茶按件計酬：做完一份工領一枚籌，定期憑籌結算。',
        textEn: 'Sorting was piece-work: one tally per batch finished, settled at intervals against the tallies.',
        sourceIds: ['nownews-tea-tally-2019'],
        status: 'pending',
      },
    ],
    use: [
      {
        text: '說的是日治以後的揀茶間；清末是否已經使用，查無文獻。',
        textEn: 'The accounts describe sorting rooms from the Japanese era on; whether tallies were used in the late Qing is not documented.',
        sourceIds: ['nownews-tea-tally-2019'],
        status: 'pending',
      },
    ],
    where: [],
    evidence: [
      {
        text: '耆老口述與私人收藏的報導（2019）；博物館的典藏查無。',
        textEn: 'A 2019 report on elders’ recollections and a private collection; no museum record found.',
        sourceIds: ['nownews-tea-tally-2019'],
        status: 'pending',
      },
    ],
  },
}

/** 器物在林華泰各年代店裡的位置（世界座標在 data/linHuaTaiLayout.js 的 LHT_ERA_INSPECT_SPOTS） */
const spot = (id, eraId, objectId, label, labelEn) => ({ id, eraId, shopId: LHT, objectId, label, labelEn, ...LHT_ERA_INSPECT_SPOTS[id] })

export const LHT_INSPECTABLES = [
  spot('lht-banquet-square-packet', 'banquet', 'square-packet', '包茶桌上的四方包', 'Square packets on the packing table'),
  spot('lht-banquet-sorting-tray', 'banquet', 'tea-sorting-tray', '揀茶的竹淺盤', 'Tea-sorting tray'),
  spot('lht-banquet-tea-tally', 'banquet', 'tea-tally', '揀茶的茶籌', 'Tea tallies'),
  spot('lht-modern-charcoal-pit', 'modern', 'charcoal-pit', '炭焙火坑', 'Charcoal pit'),
  spot('lht-modern-platform-scale', 'modern', 'platform-scale', '前店的磅仔', 'Platform scale in the shop'),
  spot('lht-postwar-tasting-tray', 'postwar', 'tasting-tray', '櫃台上的評茶盤', 'Judging tray on the counter'),
  spot('lht-postwar-jasmine', 'postwar', 'jasmine-scenting', '窨茉莉花', 'Scenting with jasmine'),
  spot('lht-revival-tea-drum', 'revival', 'tea-drum', '大茶桶', 'Tea drum'),
  spot('lht-revival-tasting-tray', 'revival', 'tasting-tray', '櫃台上的茶樣', 'Tea samples on the counter'),
  spot('lht-revival-platform-scale', 'revival', 'platform-scale', '用了五十多年的老秤', 'The fifty-year-old scale'),
]
