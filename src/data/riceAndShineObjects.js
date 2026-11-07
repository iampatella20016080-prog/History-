import { RB_INSPECT_SPOTS } from './riceAndShineBanquetLayout.js'
import { RICE_AND_SHINE_ID } from './riceAndShineEraConfig.js'

/**
 * 迪化街 329 號酒樓繁華版店內可以近看的器物（第 11 階段第 9 項；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/riceAndShine/riceInspect.js（米箱、麻袋、米籮）與既有的器物模型（米斗、米篩、桿秤、算盤）；
 * 文字與查證見 docs/research/interior-rice-and-shine-329.md 第 3 節與「第 2 段補充」。
 *
 * - RICE_OBJECTS：新的器物（米箱、麻袋、米籮）
 * - RICE_LAYERS：米斗與米篩原本只有「說明與出處」，這裡補上五層分層資訊
 * - RICE_EXTRA_NOTES：共用器物（桿秤、算盤）用在米店的補充說明，併進該器物的分層
 * - RICE_INSPECTABLES：器物在酒樓繁華前店裡的位置（併進 data/inspectObjects.js 的 STREET_INSPECTABLES）
 *
 * 1907 年建屋以前與 1916 年以前 329 號的使用者查無；整間店的格局與擺設是歷史情境重建，只有各件器物自己的形制有典藏或照片依據。
 * 記憶庫「傳統米店」的 1 斗＝11.5 台斤是 2020 年宜蘭一家店的戰後台制斗，和日治官斗（五升約 9000 毫升）不是同一個斗：
 * 只在米斗的「使用場合」拆開說明，1895–1930 的對白與其他器物都不用這個換算。
 */

export const RICE_OBJECTS = {
  'rice-bin': {
    id: 'rice-bin',
    title: '米箱',
    titleEn: 'Rice bin',
    lead: '木板釘的大箱子，斜開的蓋，裡面分格裝白米、糙米；客人自己帶米袋來，夥計用斗量、用秤秤。',
    leadEn: 'A big box of nailed boards with a sloping lid, divided inside for white and brown rice; customers brought their own bags, and the shopman measured by the dou and weighed on the steelyard.',
    actions: [{ id: 'scoop', label: '舀一斗', labelEn: 'Scoop a dou', doneLabel: '倒回去', doneLabelEn: 'Pour it back' }],
    paragraphs: [
      '依國家文化記憶庫「傳統米店」（宜蘭南館市場，2020 年攝）的說明：木製大米箱盛米，早期以升、斗計價，買米自備米袋。',
      '模型分兩格、斜蓋，尺寸是示意；日治時期北街米店的米箱照片本站沒有找到，是歷史情境重建。',
    ],
    paragraphsEn: [
      'After the National Memory Bank entry “A traditional rice shop” (Nanguan market, Yilan, photographed 2020): rice was kept in large wooden bins, priced by the sheng and the dou, and buyers brought their own bags.',
      'The model has two compartments and a sloping lid, sizes illustrative; no photograph of a Japanese-era North Street rice shop’s bin was found, so it is a reconstructed historical scene.',
    ],
    reconstruction: true,
    sourceIds: ['tcmb-rice-shop-559158', 'nmth-rice-measure-2000-001-0044'],
    layers: {
      form: [
        {
          text: '依國家文化記憶庫「傳統米店」（宜蘭南館市場，2020 年攝）的說明：木製大米箱盛米。模型分兩格、斜蓋，尺寸是示意；日治時期北街米店的米箱照片本站沒有找到。',
          textEn: 'After the National Memory Bank entry “A traditional rice shop” (Nanguan market, Yilan, photographed 2020): rice kept in large wooden bins. The model has two compartments and a sloping lid, sizes illustrative; no photograph of a Japanese-era North Street rice shop’s bin was found.',
          sourceIds: ['tcmb-rice-shop-559158'],
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '稻穀碾成糙米、再碾成白米；北街後來是碾米廠聚集的地段，329 號 1916 年起是唐益興米行、後來是益興碾米工廠。',
          textEn: 'Paddy is milled to brown rice and again to white; North Street later became the rice-mill quarter, and no. 329 was the Tang Yixing rice shop from 1916 and later the Yixing rice mill.',
          sourceIds: ['taiwannews-2022-rice-shine', 'culture-taipei-2022-rice-shine'],
          status: 'pending',
        },
      ],
      use: [
        {
          text: '早期以升、斗計價，買米自備米袋。',
          textEn: 'Rice was priced by the sheng and the dou, and buyers brought their own bags.',
          sourceIds: ['tcmb-rice-shop-559158'],
        },
        {
          text: '日治時期的米斗是官製官賣的度量衡器，販賣要領總督府許可。',
          textEn: 'In the Japanese era the dou measure was made and sold under government monopoly, and selling one needed a Government-General licence.',
          sourceIds: ['nmth-rice-measure-2000-001-0044'],
        },
      ],
      where: [
        {
          text: '329 號米店酒樓繁華的前店；摩登以後的碾米間與戰後米行是另一套擺設。',
          textEn: 'The front shop of no. 329 in the banquet era; the mill and the postwar rice shop in later eras are a different set.',
        },
      ],
      evidence: [
        {
          text: '記憶庫 559158（照片 CC BY-NC 3.0 TW+）；臺史博米斗 2000.001.0044、2003.001.0898；文化局 2022-06-08 新聞稿；臺灣英文新聞 2022。',
          textEn: 'Memory Bank 559158 (photograph CC BY-NC 3.0 TW+); NMTH dou measures 2000.001.0044 and 2003.001.0898; Taipei Department of Cultural Affairs press release, 8 Jun 2022; Taiwan News 2022.',
          sourceIds: ['tcmb-rice-shop-559158', 'nmth-rice-measure-2000-001-0044', 'nmth-rice-measure-2003-001-0898', 'culture-taipei-2022-rice-shine', 'taiwannews-2022-rice-shine'],
        },
        {
          text: '329 號 1907 年建屋以前與 1916 年以前的使用者：查無。',
          textEn: 'Who used no. 329 before the house was built in 1907, or before 1916: not found.',
          sourceIds: ['moc-329-shophouse'],
          status: 'pending',
        },
      ],
    },
  },

  'jute-sack': {
    id: 'jute-sack',
    title: '麻袋',
    titleEn: 'Jute sack',
    lead: '粗麻織的大袋子，中間一條綠線；稻穀、白米裝進去，扛進店裡堆在門邊。',
    leadEn: 'A big bag of coarse jute with a green line down the middle; paddy and milled rice went in, were carried in on a shoulder and stacked by the door.',
    actions: [{ id: 'open', label: '解開袋口', labelEn: 'Untie the mouth', doneLabel: '綁回去', doneLabelEn: 'Tie it up' }],
    paragraphs: ['依臺史博典藏「麻袋」2002.005.0289：麻布縫成的大口袋，中間印一條綠色粗線。模型的袋口綁法、鼓起的形狀與堆疊是示意。'],
    paragraphsEn: ['After NMTH “Jute sack” 2002.005.0289: a large bag sewn from jute cloth with a thick green line printed down the middle. How the mouth is tied, the bulge and the stacking in the model are illustrative.'],
    reconstruction: true,
    sourceIds: ['nmth-jute-sack-2002-005-0289'],
    layers: {
      form: [
        {
          text: '麻布縫成的大口袋，攤平約 107 × 74.5 公分、1.07 公斤，麻布中間印一條綠色粗線，整體有些髒汙（臺史博 2002.005.0289；歷史分期「無法判斷」）。',
          textEn: 'A large bag sewn from jute cloth, about 107 × 74.5 cm laid flat and 1.07 kg, with a thick green line printed down the middle and some soiling (NMTH 2002.005.0289; period “undeterminable”).',
          sourceIds: ['nmth-jute-sack-2002-005-0289'],
        },
        { text: '模型的袋口綁法、鼓起的形狀與堆疊是示意。', textEn: 'How the mouth is tied, the bulge and the stacking in the model are illustrative.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '館方說明：1902 年總督府引進黃麻種子試種，豐原一帶栽培風氣盛，當時臺灣麻袋不夠用，要從中國輸入；1905 年 9 月豐原成立黃麻紡績工場，是臺灣麻袋工業的開始；1912 年 12 月成立臺灣製麻株式會社，製麻程序用了大量女工；為了便利米、糖外運，做的麻袋以米袋和砂糖袋為主。',
          textEn: 'The museum’s note: the Government-General introduced jute seed for trial planting in 1902, and the Fengyuan area took it up widely; Taiwan then had too few sacks and imported them from China; a jute spinning works opened at Fengyuan in September 1905, the start of Taiwan’s sack industry; the Taiwan Hemp Manufacturing Company followed in December 1912, its processes employing many women; to ease the export of rice and sugar, the sacks made were mainly rice and sugar sacks.',
          sourceIds: ['nmth-jute-sack-2002-005-0289'],
        },
      ],
      use: [
        {
          text: '1905 年以前店裡的麻袋多半是進口的，1912 年以後臺灣自己做的米袋多起來——本站這個年代（1895–1930）兩種都可能有，不分別建模。',
          textEn: 'Before 1905 a shop’s sacks were mostly imported; after 1912 Taiwan-made rice sacks became common. This era (1895–1930) could have had both, and the site does not model them separately.',
          sourceIds: ['nmth-jute-sack-2002-005-0289'],
          status: 'reconstruction',
        },
        { text: '麻袋可以扛、可以疊，卸下來就直接當店裡的陳列與存貨。', textEn: 'A sack could be carried and stacked, and once set down it served as both display and stock.', status: 'reconstruction' },
      ],
      where: [{ text: '329 號米店酒樓繁華前店的門邊與靠後牆的地方（稻穀）。', textEn: 'By the door and near the back wall of the no. 329 front shop in the banquet era (paddy).' }],
      evidence: [
        {
          text: '臺史博典藏「麻袋」2002.005.0289；館方引中研院臺史所「從家庭到職場：圖像資料中的臺灣女性社會角色」。',
          textEn: 'NMTH “Jute sack” 2002.005.0289; the museum cites the Institute of Taiwan History’s “From Home to Workplace: Taiwanese Women’s Social Roles in Pictorial Sources”.',
          sourceIds: ['nmth-jute-sack-2002-005-0289'],
        },
        { text: '日治時期北街米店堆麻袋的照片：查無。', textEn: 'A photograph of sacks stacked in a Japanese-era North Street rice shop: not found.', status: 'pending' },
      ],
    },
  },

  'carrying-basket': {
    id: 'carrying-basket',
    title: '米籮',
    titleEn: 'Carrying basket',
    lead: '方底圓口的竹籮，口上繫兩條繩，一根扁擔挑一對；稻穀就這樣從碼頭挑進店裡。',
    leadEn: 'A bamboo basket with a square base and round mouth, two cords at the rim, a pair to one carrying pole; paddy came from the wharf into the shop this way.',
    actions: [{ id: 'lift', label: '掂掂重量', labelEn: 'Heft it', doneLabel: '放下', doneLabelEn: 'Set it down' }],
    paragraphs: ['依臺史博典藏「米籮」2003.001.0530：底方口圓、上闊下窄、圓腹，竹篾平編，口框繫兩條繩索供扁擔挑運。門內兩只籮的大小、裝多少、繩子的綁法是示意。'],
    paragraphsEn: ['After NMTH “Rice basket” 2003.001.0530: square base, round mouth, wider above than below with a rounded belly, plain-woven bamboo strips, two cords at the rim for a carrying pole. The size, fill and cord-ties of the two baskets inside the door are illustrative.'],
    reconstruction: true,
    sourceIds: ['nmth-rice-basket-2003-001-0530'],
    layers: {
      form: [
        {
          text: '底四方、口圓、上闊下窄、圓腹；籮身用一寬一窄的竹篾片壓一挑一平編，紋路像玉米粒；上口圓框繫兩條繩索供扁擔挑運。典藏品 54.8 × 54.5 × 34.7 公分、1.9 公斤（臺史博 2003.001.0530；材質欄寫木質、類別歸交通運輸，與竹篾的描述不一）。',
          textEn: 'Square base, round mouth, wider above than below, with a rounded belly; the body is plain-woven from alternating wide and narrow bamboo strips, press one lift one, in a pattern like maize kernels; two cords at the round rim take a carrying pole. The museum piece is 54.8 × 54.5 × 34.7 cm and 1.9 kg (NMTH 2003.001.0530; the material field says wood and the class is “transport”, at odds with the bamboo-strip description).',
          sourceIds: ['nmth-rice-basket-2003-001-0530'],
        },
        { text: '門內兩只籮的大小、裝多少、繩子的綁法是示意。', textEn: 'The size, fill and cord-ties of the two baskets inside the door are illustrative.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '館方說明：米籮是農家用來盛放稻米、其他穀物或白米的器具；臺灣竹材易得，漢人移入後就自製竹器，清末臺南、嘉義、鹿港都有竹器店聚集成市。',
          textEn: 'The museum’s note: the rice basket was a farm vessel for paddy, other grains or milled rice; bamboo was plentiful in Taiwan, Han settlers made their own bamboo ware, and by the late Qing bamboo-ware shops clustered into streets in Tainan, Chiayi and Lukang.',
          sourceIds: ['nmth-rice-basket-2003-001-0530'],
        },
      ],
      use: [
        { text: '挑擔的人把一對籮放在店門口，夥計用斗量、記帳，再搬到後面——這是情境推想。', textEn: 'The porter sets a pair down at the shop door; the hand measures with the dou, enters it in the book and carries it to the back—an inference for the scene.', status: 'reconstruction' },
        {
          text: '館方推測這類竹籮用到 1960–1970 年代塑膠製品普及為止。',
          textEn: 'The museum reckons such baskets stayed in use until plastics spread in the 1960s–70s.',
          sourceIds: ['nmth-rice-basket-2003-001-0530'],
        },
      ],
      where: [{ text: '329 號米店酒樓繁華前店的門內。', textEn: 'Inside the door of the no. 329 front shop in the banquet era.' }],
      evidence: [
        {
          text: '臺史博典藏「米籮」2003.001.0530（推測年份 1661–1970）；館方引傳統工藝數位博物館「米籮」與工藝中心「工藝基因庫：竹編」。',
          textEn: 'NMTH “Rice basket” 2003.001.0530 (thought to date 1661–1970); the museum cites the Digital Museum of Traditional Crafts, “Rice basket”, and the NTCRI “Craft Gene Bank: Bamboo weaving”.',
          sourceIds: ['nmth-rice-basket-2003-001-0530'],
        },
        { text: '日治時期米店門口放米籮的照片：查無。', textEn: 'A photograph of baskets at a Japanese-era rice shop’s door: not found.', status: 'pending' },
      ],
    },
  },
}

/** 米斗與米篩（原本只有說明與出處）的五層分層資訊 */
export const RICE_LAYERS = {
  'rice-measure': {
    form: [
      {
        text: '日治圓形官斗：木製，上面記「官」、「五升」和一個已經模糊的字樣（館方推測是「穀類用」）；容量五升，依日制約 9000 毫升。1906 年總督府頒《臺灣度量衡規則》，除特許外，度衡量器的製作、修復與販賣都是官製官營，賣斗的人要有總督府核發的販賣量器許可證（臺史博 2000.001.0044，25.7 × 25.3 × 24.9 公分，推測 1906–1945，製造者臺灣總督府）。',
        textEn: 'A Japanese-era round official dou: wood, marked “官” (official), “五升” (five sheng) and a third, now faint, mark the museum reads as “for grain”; it holds five sheng, about 9,000 ml by the Japanese standard. Under the 1906 Weights and Measures Regulations, measures were made, repaired and sold by the state except under special licence, and a seller of measures needed a Government-General permit (NMTH 2000.001.0044, 25.7 × 25.3 × 24.9 cm, thought to date 1906–1945, made by the Government-General).',
        sourceIds: ['nmth-rice-measure-2000-001-0044'],
      },
      {
        text: '另一件同型官斗記「五升」「穀類用」，蓋了總督府認可量器的火戳——兩個倒三角形各立四腳的圖徽；25.8 × 25.8 × 24.5 公分、1.98 公斤。館方說明：米斗有木、竹、籐編的，邊角有時另外鑲銅皮防磨；在某些地區也是財富地位的象徵。',
        textEn: 'A second official dou of the same type is marked “five sheng” and “for grain” and bears the Government-General’s branded stamp, an emblem of two inverted triangles each on four legs; 25.8 × 25.8 × 24.5 cm, 1.98 kg. The museum notes that measures were made of wood, bamboo or rattan, the corners sometimes fitted with copper sheet against wear, and that in some districts a dou was also a token of wealth and standing.',
        sourceIds: ['nmth-rice-measure-2003-001-0898'],
      },
      {
        text: '場景裡的米斗是上寬下窄、四片木板拼成的示意模型，與館藏的圓形官斗形制不同。',
        textEn: 'The dou in the scene is an illustrative model, wider at the mouth and made of four boards, and differs in form from the museum’s round official measures.',
        status: 'reconstruction',
      },
    ],
    making: [
      {
        text: '量的是稻穀、米和雜糧：裝到滿，再用斗界沿斗邊把多出來的去掉；米升方形、小巧，多用來量糯米等少量的材料（國家文化記憶庫「米升、米斗」，屏科大農機具陳列館藏，2019 年攝）。',
        textEn: 'It measured paddy, rice and other grains: fill it full, then draw the strickle along the rim to take off the excess; the smaller, square sheng was mostly for small quantities such as glutinous rice (National Cultural Memory Bank, “Rice sheng and dou”, NPUST Agricultural Machinery Exhibition Hall, photographed 2019).',
        sourceIds: ['tcmb-rice-measures-260251'],
      },
    ],
    use: [
      {
        text: '「10 合為 1 升，10 升為 1 斗」；記憶庫寫米升、米斗是「傳統社會沒有秤子時」計算米穀數量的容器。',
        textEn: '“Ten ge make one sheng, ten sheng one dou”; the Memory Bank entry calls the sheng and dou the vessels for reckoning grain “in traditional society, before there were scales”.',
        sourceIds: ['tcmb-rice-measures-260251'],
      },
      {
        text: '早期買米以升、斗計價，客人自備米袋。2020 年宜蘭南館市場一家米店的換算是 1 斗米＝10 升＝11.5 台斤（6.9 公斤），這是戰後台制的斗；日治官斗「五升約 9000 毫升」，一斗約 18 公升，兩者不是同一個斗，本站不混用。',
        textEn: 'Rice was once priced by the sheng and the dou, and buyers brought their own bags. A rice shop in Yilan’s Nanguan market gave the conversion in 2020 as one dou = ten sheng = 11.5 Taiwanese catties (6.9 kg), which is the postwar Taiwanese dou; the Japanese-era official measure, at “five sheng, about 9,000 ml”, implies a dou of about 18 litres, so the two are not the same unit and this site keeps them apart.',
        sourceIds: ['tcmb-rice-shop-559158', 'nmth-rice-measure-2000-001-0044'],
      },
    ],
    where: [
      {
        text: '329 號米店（酒樓繁華、摩登）的櫃台；今天稻舍保留展示的早期米斗（文化局 2022 新聞稿）。本站的林復振不放米斗。',
        textEn: 'The counter of the no. 329 rice shop (banquet and modern eras); the early rice measures that Rice & Shine keeps on display today (Department of Cultural Affairs press release, 2022). This site does not place a dou at Lin Fuzhen.',
        sourceIds: ['culture-taipei-2022-rice-shine'],
      },
    ],
    evidence: [
      {
        text: '臺史博典藏「圓形米斗」2000.001.0044、2003.001.0898（兩件都標製造者臺灣總督府、推測 1906–1945）；國家文化記憶庫「米升、米斗」260251、「傳統米店」559158；教育部《重編國語辭典修訂本》「斗」。',
        textEn: 'NMTH “Round rice measure” 2000.001.0044 and 2003.001.0898 (both attributed to the Government-General, thought to date 1906–1945); National Cultural Memory Bank “Rice sheng and dou” 260251 and “A traditional rice shop” 559158; Ministry of Education, Revised Mandarin Dictionary, “dou”.',
        sourceIds: ['nmth-rice-measure-2000-001-0044', 'nmth-rice-measure-2003-001-0898', 'tcmb-rice-measures-260251', 'tcmb-rice-shop-559158', 'moe-dou'],
      },
      {
        text: '2000.001.0044 的重量欄寫「2.17g」，疑為登錄筆誤，本站不引用；兩件典藏頁的授權欄是動態載入，本次沒有讀到，研究文件記的 CC BY-NC 4.0 與 PDM 待核。',
        textEn: 'The weight field of 2000.001.0044 reads “2.17 g”, probably a cataloguing slip, and is not cited here; the licence fields of both records load dynamically and were not read this time, so the CC BY-NC 4.0 and PDM noted in the research file remain to be verified.',
        status: 'pending',
      },
      { text: '1906 年以前大稻埕米店實際用的斗：查無照片或實物。', textEn: 'A measure actually used by a Dadaocheng rice shop before 1906: no photograph or object found.', status: 'pending' },
    ],
  },

  'rice-sieve': {
    form: [
      {
        text: '竹篾與厚竹片編成的圓盤，面大而淺：長 74.2、寬 73.6、高 7.4 公分，1.53 公斤；主體「壓一挑一」編出四角孔，口緣用粗竹條夾住內外兩側，尾端以籐皮返折纏繞（臺史博 2005.008.1708，日本時代至戰後；登錄的材質欄寫木質，與描述不一）。',
        textEn: 'A broad, shallow disc woven from bamboo strips and thick slats: 74.2 × 73.6 × 7.4 cm, 1.53 kg; the body is woven “press one, lift one” into square holes, the rim clamped between thick bamboo strips inside and out and finished with folded-back rattan skin (NMTH 2005.008.1708, Japanese period to postwar; the catalogue’s material field says wood, which differs from the description).',
        sourceIds: ['nmth-rice-sieve-2005-008-1708'],
      },
      { text: '掛在 329 號前店牆上的三面米篩，直徑、孔目與掛法是示意。', textEn: 'The three sieves hung on the wall of the no. 329 front shop are illustrative in diameter, mesh and hanging.', status: 'reconstruction' },
    ],
    making: [
      {
        text: '館方說明：用來篩選米穀、豆類等雜糧，收成後篩出混在稻穗裡的稻穀。',
        textEn: 'The museum’s note: used to sift rice, grain and beans, and after harvest to sieve out the paddy mixed in with the ears.',
        sourceIds: ['nmth-rice-sieve-2005-008-1708'],
      },
      { text: '米店裡拿它篩掉碎米與糠屑、挑掉石子——這是情境推想，沒有找到米店用篩的記載。', textEn: 'In a rice shop it would sift out broken grains and bran and pick out grit—an inference for the scene; no record of a rice shop’s sieving was found.', status: 'reconstruction' },
    ],
    use: [
      {
        text: '篩穀、篩米、篩豆是日常；婚俗另有孔目較細、底部漆紅色八卦的「八卦米篩」，迎娶時遮在新娘頭頂避邪。',
        textEn: 'Sifting grain, rice and beans was everyday work; in wedding custom a finer “eight-trigram sieve”, its underside painted with a red bagua, was held over the bride’s head during the escort to ward off evil.',
        sourceIds: ['nmth-rice-sieve-2005-008-1708'],
      },
    ],
    where: [
      {
        text: '329 號米店酒樓繁華前店的牆上；民俗路線的曬穀場（大稻埕地名由來）。',
        textEn: 'On the wall of the no. 329 front shop in the banquet era; the drying yard on the folklore route (the origin of the name Dadaocheng).',
        sourceIds: ['culture-taipei-walk-dadaocheng-2018'],
      },
    ],
    evidence: [
      { text: '臺史博典藏「米篩」2005.008.1708。', textEn: 'NMTH “Rice sieve” 2005.008.1708.', sourceIds: ['nmth-rice-sieve-2005-008-1708'] },
      { text: '日治時期米店掛米篩的照片：查無。', textEn: 'A photograph of sieves hung in a Japanese-era rice shop: not found.', status: 'pending' },
    ],
  },
}

/** 共用器物用在 329 號酒樓繁華米店的補充說明（併進該器物的分層） */
export const RICE_EXTRA_NOTES = {
  'tea-scale': {
    use: [
      {
        text: '1906 年總督府頒《臺灣度量衡規則》之後，秤和斗一樣，除特許外製作、修理、販賣都官製官營——米店櫃台上的秤，在這個年代也是官製的度量衡器。',
        textEn: 'After the Government-General’s 1906 Weights and Measures Regulations, scales like measures were made, repaired and sold by the state except under licence, so the scale on a rice-shop counter in this era was likewise an official instrument.',
        sourceIds: ['nmth-rice-measure-2000-001-0044'],
      },
      {
        text: '早期零售米以升、斗量，用秤的時候是整袋的米穀或按斤計的買賣；記憶庫寫宜蘭的米店是後來才「改用重量計價」。櫃台上這把秤秤什麼，是情境設定。',
        textEn: 'Retail rice was once measured by the sheng and dou; the scale came out for whole sacks of grain or for sales reckoned by the catty, and the Memory Bank notes that the Yilan shop only later “switched to pricing by weight”. What this scale weighs on the counter is a scene setting.',
        sourceIds: ['tcmb-rice-shop-559158'],
        status: 'reconstruction',
      },
    ],
    where: [
      {
        text: '329 號酒樓繁華米店前店的櫃台（歷史情境重建：本站沒有找到這間店的照片）。',
        textEn: 'On the counter in the front shop of the no. 329 rice shop in the banquet era (a reconstructed scene; no photograph of this shop was found).',
        status: 'reconstruction',
      },
    ],
  },
  abacus: {
    evidence: [
      {
        text: '米店記帳有實物：臺史博「瑞興號米店帳冊」（約 1920 年，一套 72 冊）。帳冊旁放算盤是推想，沒有照片。',
        textEn: 'Rice-shop bookkeeping is attested by the NMTH “Account books of the Ruixing rice shop” (about 1920, a set of 72 volumes). An abacus beside the ledger is an inference; no photograph.',
        sourceIds: ['nmth-rice-ledger'],
        status: 'reconstruction',
      },
    ],
  },
}

/** 器物在酒樓繁華前店裡的位置（世界座標在 data/riceAndShineBanquetLayout.js 的 RB_INSPECT_SPOTS） */
const spot = (id, objectId, label, labelEn) => ({ id, eraId: 'banquet', shopId: RICE_AND_SHINE_ID, objectId, label, labelEn, level: 0, ...RB_INSPECT_SPOTS[id] })

export const RICE_INSPECTABLES = [
  spot('rs-banquet-rice-bin', 'rice-bin', '前店的米箱', 'The rice bin in the front shop'),
  spot('rs-banquet-rice-measure', 'rice-measure', '櫃台上的米斗', 'Rice measure on the counter'),
  spot('rs-banquet-steelyard', 'tea-scale', '櫃台上的桿秤', 'Steelyard on the counter'),
  spot('rs-banquet-abacus', 'abacus', '櫃台上的算盤', 'Abacus on the counter'),
  spot('rs-banquet-rice-sieve', 'rice-sieve', '牆上掛的米篩', 'Rice sieves on the wall'),
  spot('rs-banquet-jute-sack', 'jute-sack', '門邊的麻袋', 'Jute sacks by the door'),
  spot('rs-banquet-carrying-basket', 'carrying-basket', '門內的米籮', 'Rice baskets inside the door'),
]
