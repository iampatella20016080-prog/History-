import { LTX_INSPECT_SPOTS } from './liTingXiangLayout.js'

/**
 * 李亭香（老屋新生）店內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/liTingXiang/liTingXiangInspect.js；文字與查證見 docs/research/interior-li-ting-xiang.md 第 3 節。
 * 李亭香仍在營業：只寫報導公開的事，不寫店家沒有公開的經營細節；模型的大小與層數是示意。
 * 沿用的器物：收涎餅（糕餅路線，店內櫃台再放一份）、壽字桃形餅印（老屋路線）。兩件是路線器物，沒有分層資訊，
 * 不另加 where 層（加了會把它們的卡片變成只有一個分頁的分層檢視）；餅印牆是示意，寫在近看的標籤上。
 */

const LTX = 'li-ting-xiang'

export const LTX_OBJECTS = {
  'pingxi-cake': {
    id: 'pingxi-cake',
    title: '平西餅',
    titleEn: 'Pingxi cake',
    lead: '掌心大的圓餅，一層層的酥皮包著白鳳豆沙；店家說從第一代就在賣，名字來自薛平貴西征的故事。',
    leadEn: 'A palm-sized round pastry, layer on layer of flaky skin round white kidney-bean paste; the shop says it has sold it since the first generation, and the name comes from the tale of Xue Pinggui’s western campaign.',
    actions: [{ id: 'split', label: '剝開看層', labelEn: 'Break it open', doneLabel: '合起來', doneLabelEn: 'Put it together' }],
    paragraphs: ['店家說法與口味依報導；層數有兩說，本站寫今周刊的 27 層、註另一說。模型的大小與層數是示意。'],
    paragraphsEn: ['The shop’s account and the flavours follow press reports; the layer count is given two ways, and this site gives Business Today’s 27 and notes the other. Size and layers in the model are illustrative.'],
    sourceIds: ['businesstoday-2020-litingxiang', 'ettoday-2019-litingxiang'],
    layers: {
      form: [
        {
          text: '掌心大小、渾圓，表面淡金色；剖面是多層酥皮。層數有兩說：今周刊 2020 寫 27 層，另一篇搜尋摘要寫 30 層（原頁未讀到）。',
          textEn: 'Palm-sized and round, pale gold on top; the cut face shows many flaky layers. Two counts are given: 27 in Business Today 2020, 30 in another report whose page could not be opened.',
          sourceIds: ['businesstoday-2020-litingxiang'],
          status: 'pending',
        },
        { text: '模型的大小與層數是示意。', textEn: 'Size and layer count in the model are illustrative.', status: 'reconstruction' },
      ],
      making: [
        {
          text: '內餡是白鳳豆沙；小島裡專欄說白鳳豆曾產於三重、蘆洲（可信度低）。口味後來多了咖哩（炒肉入餡）、香菇、白玉——口味與世代的對應只有今周刊一篇，標待核。',
          textEn: 'The filling is white kidney-bean paste; a podcast column says the beans were once grown in Sanchong and Luzhou (low reliability). Curry (with stir-fried pork), mushroom and “white jade” flavours came later; which generation added which rests on one Business Today piece and is marked to be verified.',
          sourceIds: ['sidoli-litingxiang', 'businesstoday-2020-litingxiang'],
          status: 'pending',
        },
      ],
      use: [
        {
          text: '店家說 1895 年創立，創立地有蘆洲、大稻埕兩說；本站只在老屋新生開放這家店。約 1980 年大稻埕沒落時，店裡曾兼賣香菸、罐頭等雜貨。',
          textEn: 'The shop dates itself to 1895, with Luzhou and Dadaocheng both given as its birthplace; this site opens the shop only in the revival era. Around 1980, when Dadaocheng declined, it sold cigarettes and tinned goods on the side.',
          sourceIds: ['businesstoday-2020-litingxiang', 'ettoday-2019-litingxiang'],
          status: 'pending',
        },
      ],
      where: [{ text: '李亭香老屋新生的展示櫃。', textEn: 'The display case at Li Tingxiang in the revival era.' }],
      evidence: [
        {
          text: '今周刊 2020；ETtoday 2019；鏡週刊 2018。平西餅的照片：本站沒有找到可用授權的照片（Commons 只有綠豆糕與小泡芙）。',
          textEn: 'Business Today 2020; ETtoday 2019; Mirror Media 2018. A usable photograph of the cake: not found (Commons has only the mung-bean cake and the cream puffs).',
          sourceIds: ['businesstoday-2020-litingxiang', 'ettoday-2019-litingxiang', 'mirror-2018-litingxiang', 'commons-litingxiang-mungbean-cake'],
          status: 'pending',
        },
      ],
    },
  },

  'peace-turtle': {
    id: 'peace-turtle',
    title: '平安龜',
    titleEn: 'Peace turtle',
    lead: '龜形的小餅，包著壓紋的金箔紙；借的是台灣「乞龜」的習俗，「金龜」也念成「金歸」。',
    leadEn: 'A small turtle-shaped pastry wrapped in embossed gold paper; it borrows the Taiwanese custom of “begging a turtle”, and “gold turtle” sounds like “gold returns”.',
    actions: [{ id: 'unwrap', label: '拆開金紙', labelEn: 'Unwrap it', doneLabel: '包回去', doneLabelEn: 'Wrap it up' }],
    paragraphs: ['形制依鏡週刊 2023；餡有兩種說法，本站並列、標待核。模型的大小是示意。'],
    paragraphsEn: ['The form follows Mirror Media 2023; the filling is described two ways, and this site lists both, marked to be verified. The model’s size is illustrative.'],
    sourceIds: ['mirror-2023-litingxiang', 'rurubu-litingxiang'],
    layers: {
      form: [
        {
          text: '龜形、覆壓紋金箔紙（鏡週刊 2023）；模型的大小是示意。',
          textEn: 'Turtle-shaped, covered in embossed gold foil paper (Mirror Media 2023); the model’s size is illustrative.',
          sourceIds: ['mirror-2023-litingxiang'],
          status: 'reconstruction',
        },
      ],
      making: [
        {
          text: '餡有兩種說法：鏡週刊寫「拌有麥芽糖、花生粉的奶香內餡」，るるぶ寫「花生味外皮包黑芝麻餡」；可能是不同年份或口味，本站並列。',
          textEn: 'Two accounts of the filling: Mirror Media says a milky filling with maltose and peanut powder; Rurubu says a peanut-flavoured skin round black-sesame paste. They may be different years or flavours; this site lists both.',
          sourceIds: ['mirror-2023-litingxiang', 'rurubu-litingxiang'],
          status: 'pending',
        },
      ],
      use: [
        {
          text: '乞龜：廟會時向神明「乞」一隻龜形的粿或餅帶回家，明年加倍還——本站的紅龜粿、龜粿印已有說明；平安龜把它做成小餅。',
          textEn: '“Begging a turtle”: at a temple festival one asks the god for a turtle-shaped cake to take home, returning double next year—see this site’s red turtle cake and turtle moulds; the peace turtle makes it a small pastry.',
          sourceIds: ['mirror-2023-litingxiang'],
        },
      ],
      where: [{ text: '李亭香老屋新生的展示櫃；龜粿印在永樂市場。', textEn: 'The display case at Li Tingxiang; the turtle mould is at Yongle Market.' }],
      evidence: [
        {
          text: '鏡週刊 2023-05-11；るるぶ。',
          textEn: 'Mirror Media, 11 May 2023; Rurubu.',
          sourceIds: ['mirror-2023-litingxiang', 'rurubu-litingxiang'],
        },
      ],
    },
  },
}

const spot = (id, objectId, label, labelEn) => ({ id, eraId: 'revival', shopId: LTX, objectId, label, labelEn, level: 0, ...LTX_INSPECT_SPOTS[id] })

export const LTX_INSPECTABLES = [
  spot('ltx-pingxi', 'pingxi-cake', '展示櫃裡的平西餅', 'Pingxi cakes in the case'),
  spot('ltx-turtle', 'peace-turtle', '展示櫃裡的平安龜', 'Peace turtles in the case'),
  spot('ltx-shouxian', 'shouxian-cakes', '櫃台上的收涎餅', 'Drool-catching biscuits on the counter'),
  spot('ltx-mould', 'longevity-cake-mould', '牆上的餅印（示意）', 'Cake moulds on the wall (illustrative)'),
]
