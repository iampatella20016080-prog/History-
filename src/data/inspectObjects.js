import { DODD_INSPECT_SPOTS } from './doddLayout.js'
import { LHT_INSPECT_SPOTS } from './linHuaTaiQingLayout.js'
import { PASTRY_OBJECTS } from './routes/pastryRoute.js'
import { TEMPLE_MEAL_OBJECTS } from './routes/templeMealRoute.js'
import { OLD_HOUSE_OBJECTS } from './routes/oldHouseRoute.js'
import { NEWS_OBJECTS } from './routes/newsRoute.js'

/**
 * 器物 3D 檢視的器物資料（第 10 階段）：標題、說明、小動作與出處。
 * 3D 模型在 game/builders/inspectObjects.js（程式建模，對照照片與文獻，不用 AI 生成的模型）；
 * 檢視的狀態在 game/objectInspect.js。
 *
 * reconstruction：形制查無、依文獻描述與一般樣式重建的器物，介面標「歷史情境重建」。
 * 第 12 階段主題路線的器物寫在各路線的資料檔（data/routes/*.js 的 OBJECTS），合併進這張表。
 */

export const INSPECT_OBJECTS = {
  'tea-chest': {
    id: 'tea-chest',
    title: '外銷茶箱',
    titleEn: 'Export tea chest',
    lead: '松木箱裡襯焊封的薄鉛防潮，外頭裱上彩色印花紙——一箱約四十磅的烏龍茶，就這樣飄洋過海。',
    leadEn: 'A pine chest lined with soldered lead against the damp, pasted over with colourful papers—about forty pounds of oolong, bound across the sea.',
    actions: [{ id: 'lid', label: '打開箱蓋', labelEn: 'Open the lid', doneLabel: '蓋上箱蓋', doneLabelEn: 'Close the lid' }],
    paragraphs: [
      'Davidson（1903）記載，外銷的茶裝在內襯薄鉛的木箱裡，鉛襯焊封防潮；箱外裱紙、印上商號與圖案，半箱（half-chest）約裝四十磅茶。',
      '箱子的實際長寬高查無：模型是依約四十磅茶葉估的比例，外箱圖案依「德記洋行茶箱籤」的風格設計，都是歷史情境重建。',
    ],
    reconstruction: true,
    sourceIds: ['davidson-formosa-1903', 'demomy-tait-tea-label'],
  },
  'rice-measure': {
    id: 'rice-measure',
    title: '米斗',
    titleEn: 'Rice measure',
    lead: '上寬下窄的木斗，四片木板拼接、角上包著金屬角件；量米時倒滿再刮平，一斗就是一個固定的量。',
    leadEn: 'A wooden measure, wider at the mouth, four boards joined with metal corner fittings; filled and struck level, one dou is one fixed amount.',
    actions: [{ id: 'flip', label: '翻過來看斗底', labelEn: 'Turn it over', doneLabel: '翻回正面', doneLabelEn: 'Turn it back' }],
    paragraphs: [
      '「斗」是計算容量的單位，十升為一斗、十斗為一石；「米斗」是形狀像斗、用來量米的木器（教育部《重編國語辭典修訂本》）。',
      '場景中的米斗是示意的模型，不代表某一件實際的器物或容量。',
    ],
    reconstruction: true,
    sourceIds: ['moe-dou'],
  },
  'tea-tally': {
    id: 'tea-tally',
    title: '茶籌',
    titleEn: 'Tea tally',
    lead: '揀茶按件計酬：做完一份工，領一枚籌仔，結帳時憑籌換錢——翻過來看看背面的記號。',
    leadEn: 'Tea sorting was piece-work: finish a batch, take a tally, and settle up against your tallies—turn it over to see the mark.',
    actions: [{ id: 'flip', label: '翻面', labelEn: 'Flip it over', doneLabel: '翻回正面', doneLabelEn: 'Turn it back' }],
    paragraphs: [
      '茶籌的說法來自耆老口述與私人收藏的報導（揀茶以茶籌暫代薪資憑證、定期結算），講的是日治以後的揀茶間；清末是否已經使用，查無文獻，博物館的典藏也查無——本站標「口述來源、待核」。',
      '模型是依報導描述（鐵片籌與紙籌）想像的示意，不對應任何一枚實際的茶籌，也不把它安在任何真實店家上。',
    ],
    reconstruction: true,
    sourceIds: ['nownews-tea-tally-2019', 'davidson-formosa-1903'],
  },
  'tea-scale': {
    id: 'tea-scale',
    title: '桿秤',
    titleEn: 'Steelyard scale',
    lead: '秤鉤吊起茶簍，秤錘沿著秤桿滑到平衡——茶的買賣論擔論斤，一擔約一百三十三磅。',
    leadEn: 'The hook lifts the tea basket and the weight slides along the beam to balance—tea was traded by the picul, about 133 pounds.',
    actions: [{ id: 'weigh', label: '秤重', labelEn: 'Weigh it', doneLabel: '放下', doneLabelEn: 'Set it down' }],
    paragraphs: [
      'Davidson（1903）記載茶的交易與工資以擔（picul）、斤（catty）計，他自註一擔＝133磅；擔與斤是清末茶行日常的計量單位。',
      '清末茶行用秤的形制查無：模型依一般桿秤（秤桿、秤鉤、秤錘）的樣式重建，是歷史情境重建。',
    ],
    reconstruction: true,
    sourceIds: ['davidson-formosa-1903'],
  },
  'roasting-basket': {
    id: 'roasting-basket',
    title: '焙籠',
    titleEn: 'Roasting basket',
    lead: '高約三呎、形如骰盅的竹籠，腰下有篩為底；茶放在篩上、架在炭火的焙坑口，焙上八到十個小時。',
    leadEn: 'A bamboo basket about three feet tall, shaped like a dice box with a sieve at the waist; the tea sits on the sieve over a charcoal pit for eight to ten hours.',
    actions: [{ id: 'lift', label: '抬起來看焙坑', labelEn: 'Lift it off the pit', doneLabel: '放回焙坑', doneLabelEn: 'Set it back' }],
    paragraphs: [
      'Davidson（1903）記載：焙坑深二呎、徑二呎、相距一呎，周圍是低磚臺；木炭燒到通紅、覆灰養火，一次可維持一週以上；焙茶工約每小時逐籠翻茶一次，一般焙八到十個小時。',
      '他寫的是1890年代末的做法，用在這個年代為推定相近；模型依文字描述重建，是歷史情境重建。',
    ],
    reconstruction: true,
    sourceIds: ['davidson-formosa-1903'],
  },
  ...PASTRY_OBJECTS,
  ...TEMPLE_MEAL_OBJECTS,
  ...OLD_HOUSE_OBJECTS,
  ...NEWS_OBJECTS,
}

export function getInspectObject(id) {
  return INSPECT_OBJECTS[id] ?? null
}

/**
 * 街上可以近看的器物（不屬於店家介紹的章節）：走近出現提示，點開 3D 檢視。
 * position 是世界座標；只在 eraId 的年代出現。
 */
export const STREET_INSPECTABLES = [
  {
    id: 'wharf-tea-chest',
    eraId: 'qing-port',
    objectId: 'tea-chest',
    label: '剛卸下的茶箱',
    labelEn: 'Fresh-landed tea chest',
    // 碼頭南側榕樹旁剛卸下的一小堆（qingWharfLayout.js 的 TEA_STACKS south）
    position: [-43.0, 0.5, -4.2],
    prompt: [-43.0, 1.3, -4.2],
    radius: 2.4,
  },
  // 寶順洋行室內（位置在 data/doddLayout.js 的 DODD_INSPECT_SPOTS）
  {
    id: 'dodd-tea-tally',
    eraId: 'qing-port',
    objectId: 'tea-tally',
    label: '揀茶的茶籌',
    labelEn: 'Tea tallies',
    ...DODD_INSPECT_SPOTS['dodd-tea-tally'],
  },
  {
    id: 'dodd-roasting-basket',
    eraId: 'qing-port',
    objectId: 'roasting-basket',
    label: '待用的焙籠',
    labelEn: 'Roasting basket',
    ...DODD_INSPECT_SPOTS['dodd-roasting-basket'],
  },
  // 林華泰茶行・港口商街版室內（data/linHuaTaiQingLayout.js 的 LHT_INSPECT_SPOTS）
  {
    id: 'lht-tea-scale',
    eraId: 'qing-port',
    objectId: 'tea-scale',
    label: '秤茶桌上的桿秤',
    labelEn: 'Steelyard on the weighing table',
    ...LHT_INSPECT_SPOTS['lht-tea-scale'],
  },
  {
    id: 'lht-roasting-basket',
    eraId: 'qing-port',
    objectId: 'roasting-basket',
    label: '待用的焙籠',
    labelEn: 'Roasting basket',
    ...LHT_INSPECT_SPOTS['lht-roasting-basket'],
  },
]

export function inspectablesOfEra(eraId) {
  return STREET_INSPECTABLES.filter((item) => item.eraId === eraId)
}

export function getInspectable(id) {
  return STREET_INSPECTABLES.find((item) => item.id === id) ?? null
}
