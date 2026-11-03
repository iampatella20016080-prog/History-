/**
 * 江山樓三樓與樓頂庭園的器物（第 11 階段第 2 段補充；查證 2026-11-03，見 docs/research/interior-jiang-shan-lou.md「第 2 段補充」）：
 * 宴席上的啤酒瓶、宴廳的木板門屏、樓頂庭園的假山、樓頂的盆栽、屋頂的大理石圓桌座。
 * 錫酒壺、圓桌轉台、帳簿與電話不做（查無或待使用者決定）。
 */
export const JSL_OBJECTS_2 = {
  'beer-bottle': {
    id: 'beer-bottle',
    title: '宴席上的啤酒瓶',
    titleEn: 'A beer bottle at the banquet',
    lead: '江山樓的塔樓掛著「ライトビール」、側牆寫「高砂麥酒」，宴席照的牆上也垂著啤酒廣告旗——酒樓的臺灣菜桌上，啤酒是常見的酒。',
    leadEn: '“Light beer” hung on Jiangshanlou’s tower and “Takasago Beer” on its side wall, and beer banners hang in the banquet photograph: on a restaurant’s Taiwanese-cuisine table, beer was an ordinary drink.',
    actions: [{ id: 'pour', label: '斟一杯', labelEn: 'Pour a glass', doneLabel: '放下酒瓶', doneLabelEn: 'Put the bottle down' }],
    paragraphs: ['瓶形依臺史博的高砂麥酒海報；酒標畫得太小讀不出，是示意。桌上擺的是啤酒、紅酒還是老酒查無，這瓶啤酒是依招牌的推想。'],
    paragraphsEn: ['The bottle follows the Takasago Beer posters in the National Museum of Taiwan History; the labels are too small to read and are illustrative. Whether beer, red rice wine or aged wine stood on the tables is not found; this bottle is inferred from the signs.'],
    reconstruction: true,
    sourceIds: ['nmth-takasago-beer-poster-2005-008-1369', 'nmth-jiang-shan-lou'],
    layers: {
      form: [
        {
          text: '〔照片〕臺史博兩張高砂麥酒海報裡，桌上擺著同款的深色長頸瓶，和服女子替旗袍女子斟酒；海報上有紅字「タカサゴビール」、白字「TAKASAGO BEER 高砂麥酒株式會社」。瓶上的酒標畫得太小，本站讀不出；模型的瓶形依海報，酒標是示意。',
          textEn: 'In two Takasago Beer posters at the National Museum of Taiwan History, matching dark long-necked bottles stand on the table while a woman in kimono pours for a woman in a qipao; the posters read “タカサゴビール” in red and “TAKASAGO BEER 高砂麥酒株式會社” in white. The labels are too small to read; the model’s bottle follows the posters and its label is illustrative.',
          sourceIds: ['nmth-takasago-beer-poster-2005-008-1369', 'nmth-takasago-beer-poster-t2018-001-7187'],
          status: 'reconstruction',
        },
        { text: '1920 年代高砂麥酒的實物瓶、酒標：本站沒有找到典藏。', textEn: 'A surviving 1920s Takasago bottle or label: not found by this site.', status: 'pending' },
      ],
      making: [
        {
          text: '高砂麥酒株式會社 1919 年成立，工廠在臺北三板橋大竹圍（今中山區），是日治時期臺灣唯一的啤酒廠；1920 年 6 月首次釀出，是上面發酵的愛爾，分淡色與深色兩種。1933 年啤酒納入專賣。',
          textEn: 'Takasago Brewery was founded in 1919 with its plant at Sanbanqiao, Taipei (today’s Zhongshan District), the only brewery in Japanese-era Taiwan; its first brew, in June 1920, was an ale in a light and a dark style. Beer came under the monopoly in 1933.',
          sourceIds: ['nmth-takasago-beer-poster-2005-008-1369', 'wiki-taiwan-beer'],
        },
        {
          text: '據說江山樓立面的「ライト麥酒」是高砂麥酒的主力產品之一（只有一個部落格這樣寫；「ライト」是哪家的淡色啤酒，本站查無）。',
          textEn: 'Reportedly the “Light Beer” on Jiangshanlou’s facade was one of Takasago’s main products (a single blog says so; which brewery’s light beer it was is not found by this site).',
          sourceIds: ['huggecafe-jiangshanlou'],
          status: 'hearsay',
        },
      ],
      use: [
        {
          text: '江山樓的塔樓立面由上而下是「江山樓」「KANG SAN LAU」「ライトビール」，側牆直書「ライト麥酒」，另一側有「高砂麥酒」；1922 年（大正 11 年）鹿津同鄉會在江山樓前的紀念照裡，樓上已經掛著「高砂麥酒」。',
          textEn: 'On the tower facade, from the top: “江山樓”, “KANG SAN LAU”, “ライトビール”; “ライト麥酒” runs down one side wall and “高砂麥酒” appears on another. In the 1922 commemorative photograph of the Taipei Lukang Association in front of Jiangshanlou, “高砂麥酒” already hangs on the building.',
          sourceIds: ['nmth-jiang-shan-lou', 'nmth-jsl-panorama-postcard', 'nmth-jsl-lukang-photo-t2018-002-0342'],
        },
        {
          text: '宴席照片的牆上垂掛白底、圓形標誌、直書片假名的啤酒廣告旗。',
          textEn: 'Beer-advertising banners, white with a round emblem and vertical katakana, hang on the wall in the banquet photograph.',
          sourceIds: ['commons-jiangshanlou-banquet'],
        },
        {
          text: '據說黃旺成 1919 年 9 月 20 日的日記寫，從味珍樓叫臺灣料理、從西洋料理店叫菜配啤酒，在自家商行和朋友吃；這是部落格轉述陳玉箴的研究，本站沒有讀到日記原文。',
          textEn: 'Reportedly Huang Wang-cheng’s diary for 20 September 1919 records ordering Taiwanese cuisine from one restaurant and Western dishes with beer from another, to eat with friends at his own firm; this is a blog relaying Chen Yu-jen’s research, and this site has not read the diary.',
          sourceIds: ['vocus-yidan-delivery'],
          status: 'hearsay',
        },
        {
          text: '吳瀛濤說江山樓「以佳餚美酒著稱」；桌上擺的是啤酒、紅酒還是老酒，本站查無，這瓶啤酒是依招牌的推想。（轉引自張愛敏 2008）',
          textEn: 'Wu Ying-tao says Jiangshanlou was known for fine food and wine; whether beer, red rice wine or aged wine stood on the tables is not found, so this bottle is inferred from the signs. (cited via Chang Ai-min 2008)',
          sourceIds: ['chang-aimin-thesis-2008'],
          status: 'reconstruction',
        },
      ],
      where: [{ text: '江山樓三樓宴會場的圓桌與備餐桌。', textEn: 'On the round tables and the sideboard of the third-floor banquet room at Jiangshanlou.' }],
      evidence: [
        {
          text: '臺史博「江山樓」2004.055.0002（外觀照）、「臺北市日新町江山樓全景」2020.006.0807.0002（明信片）、「江山樓臺北鹿津同鄉會紀念照片」T2018.002.0342（大正 11 年）；高砂麥酒海報 2005.008.1369（PDM）、T2018.001.7187（秋惠文庫）；Commons 宴席照。',
          textEn: 'NMTH “Jiangshanlou” 2004.055.0002, the panorama postcard 2020.006.0807.0002 and the 1922 Lukang Association photograph T2018.002.0342; Takasago Beer posters 2005.008.1369 (PDM) and T2018.001.7187 (Qiuhui Collection); the Commons banquet photograph.',
          sourceIds: ['nmth-jiang-shan-lou', 'nmth-jsl-panorama-postcard', 'nmth-jsl-lukang-photo-t2018-002-0342', 'nmth-takasago-beer-poster-2005-008-1369', 'nmth-takasago-beer-poster-t2018-001-7187', 'commons-jiangshanlou-banquet'],
        },
        { text: '日治時期的啤酒瓶實物、江山樓的酒單：查無。', textEn: 'A surviving Japanese-era beer bottle or a Jiangshanlou drinks list: not found.', status: 'pending' },
      ],
    },
  },

  'partition-screen': {
    id: 'partition-screen',
    title: '宴廳的木板門屏',
    titleEn: 'The banquet-room partition screens',
    lead: '吳瀛濤回憶，江山樓二、三樓各有七間宴廳，每間用木板門屏隔開，牆上掛著一二十幅名流的筆墨。（轉引自張愛敏 2008）',
    leadEn: 'Wu Ying-tao recalled that the second and third floors each had seven banquet rooms, divided by wooden door-screens, with ten or twenty pieces of calligraphy by notable guests on the walls. (cited via Chang Ai-min 2008)',
    actions: [{ id: 'open', label: '推開門屏', labelEn: 'Slide the screens open', doneLabel: '合上', doneLabelEn: 'Close them' }],
    paragraphs: ['板面、格心與高度本站沒有找到照片或描述，模型的樣子是示意。'],
    paragraphsEn: ['No photograph or description of the panels, lattice or height was found; the model is illustrative.'],
    reconstruction: true,
    sourceIds: ['chang-aimin-thesis-2008', 'wu-yingtao-1958-jiangshanlou'],
    layers: {
      form: [
        { text: '可開合的木板門屏；板面、格心與高度本站沒有找到照片或描述，模型的樣子是示意。', textEn: 'Wooden door-screens that open and close; no photograph or description of the panels, lattice or height was found, so the model is illustrative.', status: 'reconstruction' },
        {
          text: '〔照片〕臺史博明信片〈臺灣料理江山樓三樓宴會場〉：一整片大廳，深色方柱、白桌布的圓桌與方桌、有坐墊的直條靠背木椅，左牆邊一排長桌長凳；高處有橫匾（其中一面可以讀出「得少佳趣」）、裱框的扇面畫、一框三面團扇；上方有欄杆的迴廊；白玻璃球形吊燈；最裡面有備餐櫃和一個站著的人。照片裡沒看到門屏——把七間打通成一廳，正合吳瀛濤說的「門屏隔開」，但這是本站的推測。（轉引自張愛敏 2008）',
          textEn: 'In the NMTH postcard “Jiangshanlou third-floor banquet hall”: one large hall with dark square columns, round and square tables under white cloths, slat-back wooden chairs with cushions, a row of long tables and benches along the left wall; high up, horizontal inscribed boards (one reads 「得少佳趣」), framed fan paintings and a frame of three round fans; a railed gallery above; white globe pendant lamps; a sideboard and a standing figure at the far end. No screens are visible—seven rooms opened into one hall fits Wu’s “divided by door-screens”, but that is this site’s inference.',
          sourceIds: ['nmth-jsl-banquet-hall-postcard'],
          status: 'reconstruction',
        },
      ],
      making: [{ text: '不是食物。木板門屏是分隔或合併宴廳的隔扇。', textEn: 'Not a foodstuff: door-screens are the panels that divide or join banquet rooms.', status: 'reconstruction' }],
      use: [
        {
          text: '二、三樓各七間精緻宴廳，各樓樓梯裝美術玻璃鏡；每間以木板門屏隔開，各間懸掛當時文人墨客名流的筆墨一二十幅。',
          textEn: 'Seven fine banquet rooms on each of the second and third floors, art-glass mirrors on every staircase; each room divided by wooden door-screens and hung with ten or twenty pieces by the writers and notables of the day.',
          sourceIds: ['chang-aimin-thesis-2008', 'wu-yingtao-1958-jiangshanlou'],
        },
        {
          text: '莊永明寫宴會廳 14 間、約容 500 人；1936 年經理吳溪水說可辦三百人的宴席。',
          textEn: 'Chuang Yung-ming gives fourteen banquet rooms for about five hundred; in 1936 the manager Wu Xishui said banquets for three hundred could be held.',
          sourceIds: ['jaung-jiang-shan-lou-2015', 'storm-2022-chen-rouchin-jiangshanlou'],
        },
      ],
      where: [{ text: '江山樓三樓宴會場，廳與走廊之間（位置是重建）。', textEn: 'Between the third-floor banquet room and the corridor at Jiangshanlou (position reconstructed).' }],
      evidence: [
        {
          text: '吳瀛濤〈江山樓．臺灣菜．藝旦〉（《臺北文物》7 卷 2 期，1958；收入黃武忠編《美人心事》1987 頁 179），本站經張愛敏 2008 政大論文頁 16–17 轉引，原文未讀；臺史博明信片 2020.006.0807.0003（2026-11-03 目視，授權欄空白）。',
          textEn: 'Wu Ying-tao, “Jiangshanlou, Taiwanese cuisine, yidan” (Taipei Wenwu 7:2, 1958; reprinted in Huang Wu-chung ed., Meiren Xinshi, 1987, p. 179), read here through Chang Ai-min’s 2008 NCCU thesis, pp. 16–17, not in the original; NMTH postcard 2020.006.0807.0003 (viewed 3 Nov 2026; no licence stated).',
          sourceIds: ['wu-yingtao-1958-jiangshanlou', 'chang-aimin-thesis-2008', 'nmth-jsl-banquet-hall-postcard'],
        },
        { text: '門屏本身的照片或尺寸：查無。', textEn: 'A photograph or measurements of the screens themselves: not found.', status: 'pending' },
      ],
    },
  },

  'roof-rockery': {
    id: 'roof-rockery',
    title: '樓頂庭園的假山',
    titleEn: 'The roof-garden rockery',
    lead: '江山樓的樓頂有庭園，莊永明寫「庭園假山」；明信片裡看得到花壇和樹，假山的石頭卻看不清。',
    leadEn: 'Jiangshanlou had a garden on its roof; Chuang Yung-ming writes of “a garden with rockery”, and the postcard shows planted beds and trees, though no clear rocks.',
    actions: [{ id: 'look', label: '繞一圈看', labelEn: 'Walk round it', doneLabel: '回來', doneLabelEn: 'Come back' }],
    paragraphs: ['明信片裡看不出堆石，假山的形狀與尺寸是重建。'],
    paragraphsEn: ['The postcard shows no piled stones; the rockery’s shape and size are reconstructed.'],
    reconstruction: true,
    sourceIds: ['jaung-jiang-shan-lou-2015', 'nmth-jsl-roof-garden-postcard'],
    layers: {
      form: [
        {
          text: '〔照片〕臺史博明信片〈臺灣料理江山樓屋上庭園〉（2026-11-03 目視）：平屋頂、矮女兒牆；庭園中段有一片用矮緣圍起、種著樹和灌木的花壇；旁邊一面牆開著大圓洞；後方一根高聳的煙囪狀塔柱；左邊是有圓窗和老虎窗、四面坡頂的角樓（可能是吳瀛濤說的「四五樓展望台」）；右邊是一排有窗的單層磚屋（可能是浴場或接應室）。照片小，看不出堆石，假山的形狀是重建。（轉引自張愛敏 2008）',
          textEn: 'In the NMTH postcard “Jiangshanlou roof garden” (viewed 3 Nov 2026): a flat roof with a low parapet; mid-way a bed edged with a low kerb and planted with trees and shrubs; beside it a wall pierced by a large round opening; behind, a tall chimney-like tower; on the left a corner turret with a round window, dormers and a hipped roof (perhaps Wu Ying-tao’s “fourth- and fifth-floor lookout”); on the right a single-storey brick range with windows (perhaps the bathhouse or reception room). The print is small and shows no piled stones, so the rockery’s shape is reconstructed. (cited via Chang Ai-min 2008)',
          sourceIds: ['nmth-jsl-roof-garden-postcard'],
          status: 'pending',
        },
        { text: '模型的假山用幾塊灰石與矮樹堆成，尺寸是設計值。', textEn: 'The model builds the rockery from a few grey stones and low trees; its size is a design value.', status: 'reconstruction' },
      ],
      making: [{ text: '不是食物。樓頂庭園是紅磚四層樓的屋頂花園。', textEn: 'Not a foodstuff: a roof garden on top of the four-storey red-brick building.', status: 'reconstruction' }],
      use: [
        { text: '莊永明：紅磚四層連棟街屋，有宴會廳、廚房、浴室、理髮室，樓頂有庭園假山。', textEn: 'Chuang Yung-ming: a four-storey red-brick row with banquet rooms, kitchens, baths and a barber’s, and a roof garden with rockery.', sourceIds: ['jaung-jiang-shan-lou-2015'] },
        { text: '陳柔縉：「一樓有廚房和辦公室，二、三樓才是宴會場，四樓則有花園。」', textEn: 'Chen Rou-chin: kitchen and office on the ground floor, banquet rooms on the second and third, a garden on the fourth.', sourceIds: ['storm-2022-chen-rouchin-jiangshanlou'] },
        {
          text: '吳瀛濤：四樓另闢特別接應室一間、洋式洗澡房十房、理髮室、屋頂庭園，還有四五樓展望台。（轉引自張愛敏 2008）',
          textEn: 'Wu Ying-tao: on the fourth floor a special reception room, ten Western-style bathrooms, a barber’s and the roof garden, with a lookout on the fourth and fifth floors. (cited via Chang Ai-min 2008)',
          sourceIds: ['chang-aimin-thesis-2008', 'wu-yingtao-1958-jiangshanlou'],
        },
        {
          text: '李火增拍過〈絕美藝旦攝於江山樓屋頂庭院〉（《看見李火增 III》）；照片版權在出版社，本站不依它畫，也不描述內容。',
          textEn: 'Li Huo-tseng photographed “A yidan on the Jiangshanlou roof garden” (Seeing Li Huo-tseng III); the copyright lies with the publisher, and this site neither draws from it nor describes it.',
          sourceIds: ['setn-li-huozeng-photos'],
        },
      ],
      where: [{ text: '江山樓四樓樓頂庭園的中段。', textEn: 'The middle of the roof garden on Jiangshanlou’s fourth floor.' }],
      evidence: [
        {
          text: '臺史博明信片 2020.006.0807.0005（秋惠文庫同組 T2018.001.9062）；莊永明 2015；風傳媒陳柔縉文；吳瀛濤 1958（經張愛敏 2008 轉引）。',
          textEn: 'NMTH postcard 2020.006.0807.0005 (the Qiuhui Collection set T2018.001.9062 is the same); Chuang 2015; Chen Rou-chin on Storm Media; Wu Ying-tao 1958 via Chang Ai-min 2008.',
          sourceIds: ['nmth-jsl-roof-garden-postcard', 'jaung-jiang-shan-lou-2015', 'storm-2022-chen-rouchin-jiangshanlou', 'chang-aimin-thesis-2008'],
        },
        { text: '假山的石材、高度與《臺灣日日新報》對庭園的報導：查無。', textEn: 'The rockery’s stone, height and any Taiwan Nichinichi Shimpō report on the garden: not found.', status: 'pending' },
      ],
    },
  },

  'roof-bonsai': {
    id: 'roof-bonsai',
    title: '樓頂的盆栽',
    titleEn: 'Potted plants on the roof',
    lead: '明信片裡，江山樓樓頂的女兒牆邊擺著一排排盆栽，矮樹一盆一盆立在架上。',
    leadEn: 'In the postcard, rows of potted plants line the parapet of Jiangshanlou’s roof, small trees standing one to a pot on stands.',
    actions: [{ id: 'turn', label: '轉一轉盆', labelEn: 'Turn the pot', doneLabel: '轉回去', doneLabelEn: 'Turn it back' }],
    paragraphs: ['樹種、盆的材質與花紋看不清；模型用陶盆與示意的矮樹，尺寸與數量是設計值。'],
    paragraphsEn: ['Species, pot material and pattern cannot be made out; the model uses earthenware pots and illustrative small trees, their size and number design values.'],
    reconstruction: true,
    sourceIds: ['nmth-jsl-roof-garden-postcard'],
    layers: {
      form: [
        {
          text: '〔照片〕明信片〈臺灣料理江山樓屋上庭園〉：沿著女兒牆和花壇邊緣，幾十盆矮樹排成行，盆下有矮架；樹種、盆的材質與花紋看不清。模型用陶盆與示意的矮樹。',
          textEn: 'In the roof-garden postcard: along the parapet and the bed edges, dozens of small trees in a row, each pot on a low stand; species, pot material and pattern cannot be made out. The model uses earthenware pots and illustrative small trees.',
          sourceIds: ['nmth-jsl-roof-garden-postcard'],
          status: 'reconstruction',
        },
        { text: '盆栽的尺寸與數量是設計值。', textEn: 'Pot size and number are design values.', status: 'reconstruction' },
      ],
      making: [
        { text: '不是食物。', textEn: 'Not a foodstuff.' },
        { text: '1920 年代臺北盆栽的種類與來源：本站查無。', textEn: 'What was grown in Taipei pots in the 1920s, and where the plants came from: not found.', status: 'pending' },
      ],
      use: [
        {
          text: '樓頂庭園是四樓的花園，和洋式洗澡房、理髮室、特別接應室同一層；客人宴前先整理、宴後上樓賞景，是本站依設施的推想。',
          textEn: 'The roof garden shares the fourth floor with the Western-style baths, the barber’s and the special reception room; that guests tidied up before a banquet and came up afterwards for the view is this site’s inference from the facilities.',
          sourceIds: ['chang-aimin-thesis-2008', 'jaung-jiang-shan-lou-2015'],
          status: 'reconstruction',
        },
      ],
      where: [{ text: '江山樓四樓樓頂庭園的女兒牆邊。', textEn: 'Along the parapet of the roof garden at Jiangshanlou.' }],
      evidence: [
        { text: '臺史博明信片 2020.006.0807.0005（2026-11-03 目視，授權欄空白，只能瀏覽）。', textEn: 'NMTH postcard 2020.006.0807.0005 (viewed 3 Nov 2026; no licence stated, view only).', sourceIds: ['nmth-jsl-roof-garden-postcard'] },
        { text: '盆栽的近照、日治時期臺北盆栽風氣的文獻：查無（搜尋只找到花卉教育與現代盆栽展）。', textEn: 'Close-up photographs or literature on Taipei’s Japanese-era bonsai fashion: not found (searches gave only flower education and modern shows).', status: 'pending' },
      ],
    },
  },

  'marble-round-table': {
    id: 'marble-round-table',
    title: '屋頂的大理石圓桌座',
    titleEn: 'Marble round tables on the roof',
    lead: '吳瀛濤回憶，江山樓的屋頂庭園有「可容納五七十人的大理圓石桌座」。（轉引自張愛敏 2008）',
    leadEn: 'Wu Ying-tao recalled that the roof garden had marble round-table seating for fifty to seventy people. (cited via Chang Ai-min 2008)',
    actions: [{ id: 'touch', label: '摸一下石面', labelEn: 'Feel the stone top', doneLabel: '收手', doneLabelEn: 'Let go' }],
    paragraphs: ['一桌幾人、幾桌、桌面大小都查無；模型做直徑約 1 公尺的石桌配四張石凳，是設計值。'],
    paragraphsEn: ['How many sat at one, how many there were and their size are not found; the model uses tops about 1 m across with four stools, a design value.'],
    reconstruction: true,
    sourceIds: ['chang-aimin-thesis-2008', 'wu-yingtao-1958-jiangshanlou'],
    layers: {
      form: [
        {
          text: '圓形的大理石桌面、石凳；一桌幾人、幾桌、桌面大小都查無，模型做直徑約 1 公尺的石桌配四張石凳，是設計值。明信片裡看不出桌座在哪。',
          textEn: 'Round marble tops with stone stools; how many sat at one, how many there were and their size are not found, so the model uses tops about 1 m across with four stools, a design value. The postcard does not show where they stood.',
          sourceIds: ['chang-aimin-thesis-2008'],
          status: 'reconstruction',
        },
      ],
      making: [{ text: '不是食物。「大理圓石桌」是吳瀛濤的用詞，石材產地查無。（轉引自張愛敏 2008）', textEn: 'Not a foodstuff. “Marble round stone tables” is Wu Ying-tao’s phrase; the stone’s origin is not found. (cited via Chang Ai-min 2008)', status: 'pending' }],
      use: [
        {
          text: '吳瀛濤：屋頂庭園可容納五七十人的大理圓石桌座；江山樓竣工時是全臺首屈一指的高樓，設備十分可觀。（轉引自張愛敏 2008）',
          textEn: 'Wu Ying-tao: marble round-table seating for fifty to seventy in the roof garden; when completed, Jiangshanlou was the foremost tall building in Taiwan and remarkably equipped. (cited via Chang Ai-min 2008)',
          sourceIds: ['chang-aimin-thesis-2008', 'wu-yingtao-1958-jiangshanlou'],
        },
        { text: '屋頂的桌座是喝茶、納涼還是開席，查無；本站放茶具不放菜，是歷史情境重建。', textEn: 'Whether the roof tables served tea, cool evenings or full banquets is not found; the model sets tea things, not dishes—a reconstructed scene.', status: 'reconstruction' },
      ],
      where: [{ text: '江山樓四樓樓頂庭園靠角樓的一側。', textEn: 'On the turret side of the roof garden at Jiangshanlou.' }],
      evidence: [
        { text: '吳瀛濤 1958（經張愛敏 2008 頁 16 轉引）。', textEn: 'Wu Ying-tao 1958, via Chang Ai-min 2008, p. 16.', sourceIds: ['wu-yingtao-1958-jiangshanlou', 'chang-aimin-thesis-2008'] },
        { text: '石桌的照片：查無；明信片太小，無法辨認。', textEn: 'A photograph of the stone tables: not found; the postcard is too small to tell.', sourceIds: ['nmth-jsl-roof-garden-postcard'], status: 'pending' },
      ],
    },
  },
}
