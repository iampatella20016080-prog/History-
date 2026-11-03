import { JSL_INSPECT_SPOTS } from './jiangShanLouLayout.js'

/**
 * 江山樓室內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/jiangShanLou/jiangShanLouInspect.js；文字與查證見 docs/research/interior-jiang-shan-lou.md 第 3 節。
 * 菜單模型不寫菜名（使用者 2026-11-02 同意）；1923 年的行啟午宴辦在總督官邸，不在江山樓。
 */

const JSL = 'jiang-shan-lou'

export const JSL_OBJECTS = {
  'banquet-menu': {
    id: 'banquet-menu',
    title: '江山樓的菜單',
    titleEn: 'The Jiangshanlou menu',
    lead: '江山樓印過一本菜單，上面有 192 道菜；正式的全席 12 道，半席是一鍋湯加四樣熱炒。',
    leadEn: 'Jiangshanlou printed a menu of 192 dishes; a full banquet ran to twelve courses, a half-banquet to one soup and four stir-fries.',
    actions: [{ id: 'unfold', label: '翻開', labelEn: 'Open it', doneLabel: '合上', doneLabelEn: 'Close it' }],
    paragraphs: ['曾品滄：當時江山樓出了一本菜單，裡面有 192 道菜。菜單原件的圖版本站沒有找到，模型的樣子是示意，不寫菜名。'],
    paragraphsEn: ['Tseng Pin-tsang: Jiangshanlou published a menu listing 192 dishes. This site found no plate of the original; the model is illustrative and shows no dish names.'],
    reconstruction: true,
    sourceIds: ['cna-taiwanese-cuisine-2020'],
    layers: {
      form: [
        {
          text: '直式的摺頁菜單，封面寫店名；模型的樣子是示意，192 道菜的菜單原件圖版本站沒有找到。',
          textEn: 'A vertical folding menu with the house name on the cover; the model is illustrative, and no plate of the 192-dish original was found by this site.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '1923 年皇太子行啟的臺灣料理午宴分上、下半席 12 道，由江山樓與東薈芳挑選，用了燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參；那場宴席辦在總督官邸，不在江山樓。',
          textEn: 'The Taiwanese-cuisine luncheon for the Crown Prince’s 1923 visit ran to twelve courses in two halves, chosen by Jiangshanlou and Donghuifang, using bird’s nest, pigeon egg, turkey, shark’s fin, crab, white fungus, soft-shelled turtle and sea cucumber; it was held at the Governor-General’s residence, not at Jiangshanlou.',
          sourceIds: ['cna-taiwanese-cuisine-2020'],
        },
        {
          text: '收尾是杏仁茶（一說另有八寶飯）。',
          textEn: 'It closed with almond tea (one account adds eight-treasure rice).',
          sourceIds: ['jaung-jiang-shan-lou-2015', 'foodnext-chen-yuchen-2020'],
        },
      ],
      use: [
        {
          text: '全席 12 道；半席是一鍋湯（算兩樣）加四熱炒共六樣，訂半席就可以抵最低消費、免包廂費。半席上甜點、完席上炒飯，是台式宴席的習慣。',
          textEn: 'A full banquet was twelve courses; a half-banquet one soup (counted as two) and four stir-fries, six in all, and ordering a half-banquet met the minimum and waived the room charge. Dessert at the half, fried rice at the end, is the Taiwanese banquet custom.',
          sourceIds: ['cna-taiwanese-cuisine-2020', 'storm-2022-chen-rouchin-jiangshanlou'],
        },
        {
          text: '1927 年底吳江山在報紙連載 23 篇〈臺灣料理之話〉。',
          textEn: 'At the end of 1927 Wu Jiangshan serialised twenty-three pieces, “On Taiwanese cuisine”, in the newspaper.',
          sourceIds: ['jaung-jiang-shan-lou-2015'],
        },
      ],
      where: [{ text: '江山樓一樓門廳的立架。', textEn: 'On a stand in the Jiangshanlou lobby.' }],
      evidence: [
        {
          text: '中央社〈台菜溯源〉2020-12-07（曾品滄）；風傳媒陳柔縉《囍事台灣》摘文；莊永明 2015。',
          textEn: 'CNA, “Tracing Taiwanese cuisine”, 7 Dec 2020 (Tseng Pin-tsang); Chen Rou-chin’s Xishi Taiwan excerpt on Storm Media; Chuang Yung-ming 2015.',
          sourceIds: ['cna-taiwanese-cuisine-2020', 'storm-2022-chen-rouchin-jiangshanlou', 'jaung-jiang-shan-lou-2015'],
        },
        { text: '192 道菜單的原件圖版：查無。', textEn: 'A plate of the 192-dish original: not found.', status: 'pending' },
      ],
    },
  },

  'banquet-course': {
    id: 'banquet-course',
    title: '金錢火雞',
    titleEn: '“Golden coin” turkey',
    lead: '1923 年行啟午宴的 12 道大菜裡有一道金錢火雞；江山樓二樓這桌擺的是它的示意。',
    leadEn: 'Among the twelve courses of the 1923 luncheon was “golden coin” turkey; the dish on this upstairs table is an illustration of it.',
    actions: [{ id: 'lift', label: '掀開盤蓋', labelEn: 'Lift the cover', doneLabel: '蓋回去', doneLabelEn: 'Cover it' }],
    paragraphs: ['菜名出自莊永明列出的行啟宴菜名；做法本站沒有可靠出處，擺盤是重建。行啟宴辦在總督官邸，不在江山樓。'],
    paragraphsEn: ['The name comes from the 1923 luncheon menu as listed by Chuang Yung-ming; this site has no reliable source for the method, and the plating is reconstructed. The luncheon was held at the Governor-General’s residence, not at Jiangshanlou.'],
    reconstruction: true,
    sourceIds: ['jaung-jiang-shan-lou-2015', 'cna-taiwanese-cuisine-2020'],
    layers: {
      form: [
        {
          text: '圓盤上一圈圓形的小塊，像一枚枚錢幣；盤子用青花碗盤的樣式。擺盤是重建，菜的做法本站沒有可靠出處。',
          textEn: 'A ring of small round pieces on a plate, like coins; the plate follows blue-and-white ware. The plating is reconstructed, and this site has no reliable source for the method.',
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '菜名「金錢火雞」「雪白官燕」「水晶鴿蛋」是莊永明列出的行啟宴菜名；火雞、鴿蛋、燕窩是中央社列出的食材。做法查無。',
          textEn: '“Golden coin turkey”, “snow-white bird’s nest” and “crystal pigeon egg” are course names listed by Chuang Yung-ming for the 1923 luncheon; turkey, pigeon egg and bird’s nest are among the ingredients CNA lists. The method: not found.',
          sourceIds: ['jaung-jiang-shan-lou-2015', 'cna-taiwanese-cuisine-2020'],
          status: 'pending',
        },
      ],
      use: [
        {
          text: '開幕時聘福州、上海、廣東名廚；1920 年代後江山樓代表臺灣最高的烹飪水準，是紳商社交的場所。',
          textEn: 'At its opening it hired celebrated cooks from Fuzhou, Shanghai and Canton; from the 1920s Jiangshanlou stood for the highest level of Taiwanese cooking and was where gentry and merchants met.',
          sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008'],
        },
        {
          text: '行啟午宴辦在總督官邸，用的是菊紋的銀餐具（現在是博物館藏品）；江山樓店裡用什麼餐具，查無。',
          textEn: 'The luncheon was served at the Governor-General’s residence on chrysanthemum-crested silver (now in a museum); what Jiangshanlou used in-house is not found.',
          sourceIds: ['commons-taipei-guesthouse-silverware'],
          status: 'pending',
        },
      ],
      where: [{ text: '江山樓二樓宴會廳的圓桌。', textEn: 'The round table in the upstairs banquet room at Jiangshanlou.' }],
      evidence: [
        {
          text: '莊永明 2015；中央社 2020；Commons〈臺北賓館銀製餐具.jpg〉（CC0）。',
          textEn: 'Chuang 2015; CNA 2020; Commons “Taipei Guest House silverware” (CC0).',
          sourceIds: ['jaung-jiang-shan-lou-2015', 'cna-taiwanese-cuisine-2020', 'commons-taipei-guesthouse-silverware'],
        },
      ],
    },
  },

  'congratulatory-plaque': {
    id: 'congratulatory-plaque',
    title: '致贈吳江山的賀匾',
    titleEn: 'Plaques presented to Wu Jiangshan',
    lead: '宴席照片裡，牆上掛著致贈吳江山的賀匾與廣告旗幟。',
    leadEn: 'In the banquet photograph, plaques presented to Wu Jiangshan and advertising banners hang on the wall.',
    actions: [{ id: 'read', label: '抬頭看', labelEn: 'Look up', doneLabel: '低頭', doneLabelEn: 'Look down' }],
    paragraphs: ['宴席照（年份未標）的牆上高處有兩塊深框淺底的題字匾，旁邊掛著有圓形標誌、直書片假名的啤酒廣告旗。匾上的字照片裡讀不出來，模型只畫筆畫。'],
    paragraphsEn: ['High on the wall in the banquet photograph (undated) hang two dark-framed, light-faced inscribed boards, beside beer-advertising banners with a round emblem and vertical katakana. The inscriptions cannot be read in the photograph; the model shows only strokes.'],
    reconstruction: true,
    sourceIds: ['commons-jiangshanlou-banquet'],
    layers: {
      form: [
        {
          text: '〔照片〕Commons 的宴席照：牆上高處兩塊深色木框、淺色底的匾，題字直書；旁邊垂掛白底、上方圓形標誌、直書片假名的啤酒廣告旗。字讀不出來，模型只畫筆畫與一個紅印。',
          textEn: 'In the Commons banquet photograph: two dark-framed, light-faced boards high on the wall, inscribed vertically, and beside them white beer-advertising banners with a round emblem and vertical katakana. The writing cannot be read; the model shows only strokes and a red seal.',
          sourceIds: ['commons-jiangshanlou-banquet'],
        },
        { text: '匾是致贈吳江山的，依照片的檔案說明；匾上寫什麼，查無。', textEn: 'That the boards were presented to Wu Jiangshan follows the file description; what they say is not found.', sourceIds: ['commons-jiangshanlou-banquet'], status: 'pending' },
      ],
      making: [{ text: '不是食物；匾是賀開業或賀壽的禮物。', textEn: 'Not a foodstuff: a plaque is a gift for an opening or a birthday.', status: 'reconstruction' }],
      use: [
        {
          text: '杜聰明、蔡伯毅的祝賀會、國語學校臺籍同窗會十週年都在江山樓辦；連雅堂、廖錫恩有題江山樓的詩。',
          textEn: 'Celebrations for Tu Tsung-ming and Tsai Po-yi and the tenth anniversary of the Taiwanese alumni of the Japanese-language school were all held at Jiangshanlou; Lien Ya-tang and Liao Hsi-en wrote poems on it.',
          sourceIds: ['jaung-jiang-shan-lou-2015'],
        },
      ],
      where: [{ text: '江山樓一樓門廳與二樓宴會廳的牆上（位置是重建）。', textEn: 'On the walls of the lobby and the upstairs banquet room (positions reconstructed).' }],
      evidence: [
        {
          text: 'Wikimedia Commons〈Memorybank2019-大稻埕江山樓酒家宴席.jpg〉（黃榮輝，CC BY-SA 4.0）的照片與檔案說明；風傳媒陳柔縉文引用同一張。',
          textEn: 'The photograph and file description of Commons “Jiangshanlou banquet” (CC BY-SA 4.0); the same photograph is used in Chen Rou-chin’s piece on Storm Media.',
          sourceIds: ['commons-jiangshanlou-banquet', 'storm-2022-chen-rouchin-jiangshanlou'],
        },
      ],
    },
  },
}

const spot = (id, objectId, label, labelEn) => ({ id, eraId: 'banquet', shopId: JSL, objectId, label, labelEn, level: 0, ...JSL_INSPECT_SPOTS[id] })

export const JSL_INSPECTABLES = [
  spot('jsl-menu', 'banquet-menu', '門廳的菜單', 'Menu in the lobby'),
  spot('jsl-plaque', 'congratulatory-plaque', '門廳牆上的賀匾', 'Plaques in the lobby'),
  spot('jsl-course', 'banquet-course', '圓桌上的金錢火雞', '“Golden coin” turkey on the table'),
  spot('jsl-hall-plaque', 'congratulatory-plaque', '宴會廳的題字匾', 'Inscribed boards in the banquet room'),
]
