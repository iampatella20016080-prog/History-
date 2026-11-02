import { SHOWA_INSPECT_SPOTS } from './showaLaundryLayout.js'

/**
 * 昭和浪漫洗濯屋可以近看的器物（分層資訊的格式見 data/inspectLayers.js）：
 * 3D 模型在 builders/showaLaundry/showaLaundryInspect.js；查證紀錄見 docs/research/showa-laundry.md。
 *
 * - 「僑隆洗染」舊招牌：使用者現場確認（2026-11-02）是原本洗衣店留下來的招牌；不是文獻出處，寫在句子裡，不拿招牌推年份
 * - 門口的霜淇淋模型：依使用者的照片與媒體描述
 * - 炭火熨斗、木桶與洗衣板：本站放的情境示意，介紹臺灣早年洗衣的工具，不是這家洗衣店的東西
 */

const SHOP = 'showa-laundry'
const FIELD = '（使用者現場確認，2026-11-02）'
const FIELD_EN = ' (confirmed on site by the user, 2 November 2026)'

export const SHOWA_OBJECTS = {
  'qiaolong-sign': {
    id: 'qiaolong-sign',
    title: '「僑隆洗染」舊招牌',
    titleEn: 'The old “Qiaolong Laundry and Dyeing” sign',
    lead: `門口左側紅底白字的直式木牌，寫著「僑隆洗染」——這裡還是洗衣店時留下來的招牌${FIELD}。`,
    leadEn: `The red vertical board with white characters to the left of the door reads “Qiaolong Laundry and Dyeing” (僑隆洗染)—a sign left over from when this was a laundry${FIELD_EN}.`,
    actions: [{ id: 'turn', label: '轉到背面', labelEn: 'Turn it round', doneLabel: '轉回正面', doneLabelEn: 'Turn it back' }],
    paragraphs: [`「僑隆洗染」是原本洗衣店留下來的招牌${FIELD}；2022年的部落客也寫到「門口保留洗衣店當初的招牌」。洗衣店開了多久、由誰經營，本站沒有查到資料。`],
    paragraphsEn: [`“Qiaolong Laundry and Dyeing” is a sign left by the original laundry${FIELD_EN}; a blogger in 2022 also wrote that “the laundry’s original sign has been kept at the door”. This site has found no record of how long the laundry ran or who ran it.`],
    sourceIds: ['kyoko-showa-laundry'],
    layers: {
      form: [
        { text: `紅底的直式木牌，米白色的細邊框，由上而下四個白字「僑隆洗染」${FIELD}。`, textEn: `A red vertical timber board with a thin off-white border and four white characters reading down, “僑隆洗染”${FIELD_EN}.` },
        { text: '模型的尺寸由照片估算；背面的樣子沒有拍到，是示意。', textEn: 'The model’s size is estimated from photographs; the back was not photographed and is illustrative.', status: 'reconstruction' },
      ],
      making: [{ text: '招牌的材料與製作年代本站查無。', textEn: 'This site has not found what the sign is made of or when it was made.', status: 'pending' }],
      use: [
        { text: '「洗染」是洗衣與染衣；招牌告訴路人這裡收衣服洗、染。', textEn: '“洗染” means washing and dyeing; the sign told passers-by that clothes were taken in here to be washed and dyed.' },
        { text: '洗衣店營業的年代與經營者本站查無，不拿招牌推算年份。', textEn: 'The years the laundry traded and who ran it are not found; the sign is not used to work out a date.', status: 'pending' },
      ],
      where: [],
      evidence: [
        { text: `字樣與「原本洗衣店留下來的招牌」${FIELD}；媒體只寫「門口保留洗衣店當初的招牌」，沒有寫字樣。`, textEn: `The wording and “a sign left by the original laundry”${FIELD_EN}; the press says only that “the laundry’s original sign has been kept at the door”, without the wording.`, sourceIds: ['kyoko-showa-laundry'] },
      ],
    },
  },
  'soft-serve-model': {
    id: 'soft-serve-model',
    title: '門口的霜淇淋模型',
    titleEn: 'The soft-serve model at the door',
    lead: '比人還高一點的甜筒模型，是洗濯屋門口最醒目的招牌；外帶的霜淇淋從旁邊的小窗口遞出來。',
    leadEn: 'A cone model a little taller than a person is the most eye-catching sign at the laundry’s door; takeaway soft serve is handed out through a small window nearby.',
    actions: [{ id: 'spin', label: '轉一圈', labelEn: 'Give it a spin', doneLabel: '再轉一圈', doneLabelEn: 'Spin it again' }],
    paragraphs: ['媒體寫門口有日式販賣機與霜淇淋模型，外帶時店員從小窗口遞出霜淇淋，讓人聯想到早期日本的菸草店或報攤（食尚玩家，2022）。模型依使用者的照片建模，尺寸是估算。'],
    paragraphsEn: ['The press notes the Japanese-style vending machine and the soft-serve model at the door, and that staff hand takeaway soft serve through a small window, recalling old Japanese tobacco kiosks or news stands (Supertaste, 2022). The model follows the user’s photographs; its size is estimated.'],
    sourceIds: ['supertaste-showa-laundry', 'pbear-showa-laundry'],
    layers: {
      form: [
        { text: '黑色底座、格紋的餅乾甜筒，上面是一圈圈旋上去的白色霜淇淋（使用者的照片）。', textEn: 'A black base and a criss-crossed wafer cone topped with white soft serve swirled round and round (the user’s photographs).' },
        { text: '尺寸由照片估算。', textEn: 'The size is estimated from the photographs.', status: 'reconstruction' },
      ],
      making: [
        { text: '店裡的霜淇淋口味大約每月更換，一次一到兩款，可以選餅乾甜筒或杯裝。', textEn: 'The shop changes its soft-serve flavour roughly monthly, one or two at a time, in a wafer cone or a cup.', sourceIds: ['funliday-showa-laundry', 'pbear-showa-laundry'] },
      ],
      use: [
        { text: '日本以甜筒販售霜淇淋，一般認為始於1951年7月3日明治神宮外苑的嘉年華（日本一般背景）。', textEn: 'In Japan, selling soft serve in cones is generally traced to a carnival in the outer gardens of the Meiji Shrine on 3 July 1951 (general background from Japan).', sourceIds: ['zatsuneta-softcream-day'] },
      ],
      where: [],
      evidence: [{ text: '門口的模型、販賣機與外帶小窗：食尚玩家（2022）、pbear（2025）。', textEn: 'The model, the vending machine and the takeaway window: Supertaste (2022), pbear (2025).', sourceIds: ['supertaste-showa-laundry', 'pbear-showa-laundry'] }],
    },
  },
  'charcoal-iron': {
    id: 'charcoal-iron',
    title: '炭火熨斗',
    titleEn: 'Charcoal iron',
    lead: '形狀像水瓢的金屬圓筒，接著木柄；把燒紅的炭夾進筒裡，靠金屬的熱與重量把衣服燙平。',
    leadEn: 'A metal drum shaped like a water ladle with a wooden handle; red-hot charcoal is put in with tongs, and the heat and weight of the metal press the clothes flat.',
    actions: [{ id: 'open', label: '掀開蓋子', labelEn: 'Lift the lid', doneLabel: '蓋回去', doneLabelEn: 'Close it' }],
    paragraphs: [
      '台灣民俗文物館的「初期熨斗」：形狀像水瓢，把手接著木棒，用的時候用夾子把燒紅的炭火放進圓筒，透過金屬的傳熱與重量燙平衣服；長37公分、直徑12公分、重1100公克。',
      '碗櫥上的這一件是本站放的情境示意，不是這家洗衣店留下來的東西。',
    ],
    paragraphsEn: [
      'The “Early iron” in the Taiwan Folk Arts Museum is shaped like a water ladle, with a wooden handle; red-hot charcoal is put into the drum with tongs, and the heat and weight of the metal press the clothes flat. It is 37 cm long, 12 cm across and weighs 1,100 g.',
      'The iron on the cupboard is this site’s scenario illustration, not an item left by this laundry.',
    ],
    reconstruction: true,
    sourceIds: ['digitalarchives-charcoal-iron', 'mymkc-laundry-history'],
    layers: {
      form: [
        { text: '圓筒形的金屬身、木柄，筒裡放炭；長37公分、高7.6公分、直徑12公分、重1100公克（館藏紀錄）。', textEn: 'A cylindrical metal body with a wooden handle and charcoal inside; 37 cm long, 7.6 cm high, 12 cm across, 1,100 g (museum record).', sourceIds: ['digitalarchives-charcoal-iron'] },
        { text: '蓋子的樣子是示意；館藏紀錄的材質一處寫鐵、說明寫銅。', textEn: 'The lid is illustrative; the museum record gives the material as iron in one field and copper in its description.', status: 'reconstruction' },
      ],
      making: [{ text: '用夾子把燒紅的炭火放進圓筒裡加熱。', textEn: 'Red-hot charcoal is placed in the drum with tongs to heat it.', sourceIds: ['digitalarchives-charcoal-iron'] }],
      use: [{ text: '熨斗從火烤加熱，演變成自動控溫、控壓（業界文章）。', textEn: 'Irons went from being heated over a fire to automatic temperature and pressure control (industry article).', sourceIds: ['mymkc-laundry-history'], status: 'pending' }],
      where: [{ text: '放在昭和浪漫洗濯屋的碗櫥上是情境示意。', textEn: 'Its place on the Showa Roman Laundry’s cupboard is a scenario illustration.', status: 'reconstruction' }],
      evidence: [{ text: '台灣民俗文物館「初期熨斗」，登錄號0730。', textEn: 'Taiwan Folk Arts Museum, “Early iron”, accession no. 0730.', sourceIds: ['digitalarchives-charcoal-iron'] }],
    },
  },
  'wash-tub': {
    id: 'wash-tub',
    title: '木桶與洗衣板',
    titleEn: 'Wooden tub and washboard',
    lead: '木桶裡泡著肥皂水，衣服在波浪形的洗衣板上搓洗——洗衣機普及以前的洗法。',
    leadEn: 'Soapy water in a wooden tub and clothes scrubbed on a ridged washboard—how washing was done before washing machines spread.',
    actions: [{ id: 'scrub', label: '放進桶裡', labelEn: 'Put it in the tub', doneLabel: '拿出來', doneLabelEn: 'Take it out' }],
    paragraphs: [
      '業界文章整理臺灣洗衣的變化：從河邊、井邊用木棒敲打，到在室內用竹刷、波浪形的洗衣板與木桶泡肥皂水搓洗。這是單一來源，本站標「待核」。',
      '後場的木桶與洗衣板是本站放的情境示意，不是這家洗衣店留下來的東西。',
    ],
    paragraphsEn: [
      'An industry article traces how washing changed in Taiwan: from beating clothes with a stick by the river or well to scrubbing indoors with bamboo brushes, ridged washboards and wooden tubs of soapy water. It is a single source, so this site marks it “to be verified”.',
      'The tub and washboard in the back room are this site’s scenario illustration, not items left by this laundry.',
    ],
    reconstruction: true,
    sourceIds: ['mymkc-laundry-history'],
    layers: {
      form: [{ text: '兩道鐵箍的木桶與波浪形的木洗衣板；樣子是一般的示意。', textEn: 'A wooden tub with two iron hoops and a ridged wooden washboard; their look is a general illustration.', status: 'reconstruction' }],
      making: [{ text: '木桶浸泡肥皂水，衣服在洗衣板上用竹刷搓洗。', textEn: 'Clothes soak in soapy water in the tub and are scrubbed on the washboard with a bamboo brush.', sourceIds: ['mymkc-laundry-history'], status: 'pending' }],
      use: [{ text: '之後有手搖、離心式的脫水機與洗衣機，洗衣店的器材在1960年代以後逐步改良（業界文章）。', textEn: 'Hand-cranked and centrifugal spin-driers and washing machines followed, and laundry equipment improved step by step after the 1960s (industry article).', sourceIds: ['mymkc-laundry-history'], status: 'pending' }],
      where: [{ text: '放在昭和浪漫洗濯屋的後場是情境示意。', textEn: 'Its place in the Showa Roman Laundry’s back room is a scenario illustration.', status: 'reconstruction' }],
      evidence: [{ text: '游忠敏〈細說台灣洗衣業與洗衣技術〉（2014，轉引《洗染知識寶鑑》）；博物館藏品本站沒有查到。', textEn: 'Yu Chung-min, “On Taiwan’s laundry trade and laundry techniques” (2014, citing the Washing and Dyeing Handbook); no museum record found by this site.', sourceIds: ['mymkc-laundry-history'], status: 'pending' }],
    },
  },
}

const spot = (id, objectId, label, labelEn) => ({ id, eraId: 'revival', shopId: SHOP, objectId, label, labelEn, ...SHOWA_INSPECT_SPOTS[id] })

/** 器物在店裡與門口的位置（併進 data/inspectObjects.js 的 STREET_INSPECTABLES） */
export const SHOWA_INSPECTABLES = [
  spot('showa-old-sign', 'qiaolong-sign', '「僑隆洗染」舊招牌', 'The old “Qiaolong” sign'),
  spot('showa-cone', 'soft-serve-model', '門口的霜淇淋模型', 'The soft-serve model'),
  spot('showa-charcoal-iron', 'charcoal-iron', '碗櫥上的炭火熨斗', 'Charcoal iron on the cupboard'),
  spot('showa-washboard', 'wash-tub', '後場的木桶與洗衣板', 'Tub and washboard in the back'),
]
