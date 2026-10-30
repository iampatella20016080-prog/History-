import { ART_YARD, LUGUO_CAFE, LUGUO_HOTSPOTS, artYardToWorld } from './luguoCafeLayout.js'
import {
  LAO_PAN,
  LAO_PAN_HOTSPOTS,
  SQUID_SOUP_THEME,
  TEMPLE_STALL,
  TEMPLE_STALL_HOTSPOTS,
  TEMPLE_STALL_SITE,
  laoPanToWorld,
  templeCourtToWorld,
  templeStallToWorld,
} from './squidSoupLayout.js'
import {
  MI_TAI_MU_STALL,
  MI_TAI_MU_STALL_HOTSPOTS,
  MI_TAI_MU_STALL_SITE,
  MI_TAI_MU_THEME,
  YONGLE_MTM,
  YONGLE_MTM_HOTSPOTS,
  miTaiMuStallToWorld,
  yongleMtmToWorld,
} from './miTaiMuLayout.js'
import { HUANG_YUJIE_HOTSPOTS, MUSEUM, MUSEUM_SITE, museumToWorld } from './huangYujieLayout.js'
import { DODD_HOTSPOTS, doddToWorld } from './doddLayout.js'
import { LHT_HOTSPOTS, lhtToWorld } from './linHuaTaiQingLayout.js'
import { MUSEUM_RECORD, ORGANIZATIONS, PENDING, PHOTO_OBSERVATIONS, SCENARIO_DESIGN } from './huangYujieMuseum.js'
import { ACTION_BAR_SITE } from './actionBarLayout.js'
import { LI_TING_XIANG_ID, LI_TING_XIANG_SOURCE_IDS, LTX_CHAPTERS, LTX_ERA_NOTES, LTX_YEAR_NOTE, LTX_YEAR_NOTE_EN } from './liTingXiangData.js'
import { CI_SHENG_ADDRESS, CI_SHENG_ADDRESS_EN, CI_SHENG_CHAPTERS, CI_SHENG_ERA_NOTES, ciShengHotspots } from './ciShengMiaokouData.js'
import {
  NIANHUO_CHAPTER,
  NIANHUO_DISCLAIMER_TEXT,
  NIANHUO_DISCLAIMER_TEXT_EN,
  NIANHUO_SOURCE_IDS,
  NANBEI_BACKGROUND_CHAPTER,
  XIA_ER_ZUI_CHAPTER,
  XIA_ER_ZUI_DISCLAIMER,
  XIA_ER_ZUI_DISCLAIMER_EN,
} from './dihuaNianhuoData.js'
import {
  XIYUAN_VENUE_CHAPTER,
  XIYUAN_HISTORY_CHAPTER,
  XIKU_BACKGROUND_CHAPTER,
  XIYUAN_SOURCE_IDS,
  XIYUAN_DISCLAIMER_TEXT,
  XIYUAN_DISCLAIMER_TEXT_EN,
} from './xiyuanData.js'
import { LI_CHUNSHENG_DISCLAIMER_TEXT, LI_CHUNSHENG_DISCLAIMER_TEXT_EN, LI_CHUNSHENG_PERSON_CHAPTER, LI_CHUNSHENG_SOURCE_IDS } from './liChunShengData.js'
import { JIANG_WEISHUI_DISCLAIMER_TEXT, JIANG_WEISHUI_DISCLAIMER_TEXT_EN, JIANG_WEISHUI_PERSON_CHAPTER, JIANG_WEISHUI_SOURCE_IDS } from './jiangWeiShuiData.js'
import { WANG_JINGQUAN_DISCLAIMER_TEXT, WANG_JINGQUAN_DISCLAIMER_TEXT_EN, WANG_JINGQUAN_PERSON_CHAPTER, WANG_JINGQUAN_SOURCE_IDS } from './wangJingQuanData.js'
import {
  OPERATORS_POSTWAR_CHAPTER,
  OPERATORS_POSTWAR_DISCLAIMER_TEXT,
  OPERATORS_POSTWAR_DISCLAIMER_TEXT_EN,
  OPERATORS_REVIVAL_CHAPTER,
  OPERATORS_REVIVAL_DISCLAIMER_TEXT,
  OPERATORS_REVIVAL_DISCLAIMER_TEXT_EN,
  OPERATORS_REVIVAL_SOURCE_IDS,
  withOperatorsChapter,
} from './operatorsData.js'

/**
 * 第 8 階段 C：庶民生活的「群像：在地經營者」掛在林復振，只在 postwar 年代版本多一章（eras 覆蓋），
 * 其他四個年代的章節不變。
 */
function withPostwarOperators(chapters) {
  return {
    chapters,
    eras: { postwar: { chapters: withOperatorsChapter(chapters, OPERATORS_POSTWAR_CHAPTER, OPERATORS_POSTWAR_DISCLAIMER_TEXT, OPERATORS_POSTWAR_DISCLAIMER_TEXT_EN) } },
  }
}
import { RICE_AND_SHINE_ID, riceAndShineEraConfig } from './riceAndShineEraConfig.js'
import { RICE_HOTSPOTS, RS, riceToWorld } from './riceAndShineLayout.js'
import { RICE_CHAPTERS, RICE_ERA_NOTES, RICE_RECORD } from './riceAndShineData.js'
import { SHIZIXUAN_ID, shizixuanEraConfig } from './shizixuanEraConfig.js'
import { EARLY, EARLY_SITE, MODERN, POSTWAR, SZX_HOTSPOTS, WIDE_SITE, szxToWorld } from './shizixuanLayout.js'
import { SZX_CHAPTERS, SZX_ERA_NOTES, SZX_RECORD } from './shizixuanData.js'
import {
  DOUHUA_STALL,
  DOUHUA_STALL_HOTSPOTS,
  DOUHUA_STALL_SITE,
  DOUHUA_THEME,
  KUEH_STALL,
  KUEH_STALL_HOTSPOTS,
  KUEH_STALL_SITE,
  KUEH_THEME,
  TEMPLE_DINING,
  douhuaStallToWorld,
  kuehStallToWorld,
} from './templeSnackLayout.js'

/**
 * 店家資料
 *
 * 所有店家共用同一套互動提示、鏡頭運鏡、店家選單與介紹視窗：
 *
 * - 基本資訊：name / year / category / status（open 可探索、coming-soon 即將開放）
 * - 年代：每個年代出現哪些店家由 eras.js 的 availableStores 決定
 * - 場景配置：position（店面立面中心的世界座標，單位：公尺）、facing（店面朝向）、
 *             building（各年代共用的外觀）、buildingByEra（各年代的差異：樣式、新舊、招牌）、
 *             camera（探索時的鏡頭構圖）
 * - 介紹章節：chapters，支援 text / foods / sources 三種版型（open 店家使用）
 *
 * 街道座標：街道沿 X 軸延伸（西側 x < 0 通往淡水河岸碼頭），中心線 z = 0；
 * 北側街屋立面位於 z = -4.5（面南）、南側位於 z = 4.5（面北）。
 * 店家在街上的位置為情境示意，並非實際門牌位置。
 *
 * 店家所在的地段在五個年代都會保留；某年代沒有該店家時（buildingByEra 沒有該年代），
 * 地段改由一般街屋補滿。
 */
const LIN_FU_ZHEN_BASE = {
  archetype: 'minnan',
  width: 7.4,
  depth: 12,
  floors: 2,
  groundHeight: 3.4,
  ground: 'brick',
  upper: 'plaster',
  plasterTint: '#f1e6cd',
  roofTint: '#ffffff',
  woodTint: '#cdb293',
  gable: 'horseback',
  ridge: 'swallowtail',
  storefront: 'open',
  hangingSign: { text: '南北貨', style: 'wood' },
  lanterns: { text: '林' },
  // 店前展示的貨品（對應食物圖鑑的 id）
  display: ['shiitake', 'dried-shrimp', 'mullet-roe', 'dried-goods'],
}

/**
 * 資訊熱點：配置資料的本地座標 → 世界座標（互動位置、提示框、介紹鏡頭）。
 * clickOnly 的熱點不以距離觸發，只能點選那個物件開啟。
 */
function hotspotsToWorld(hotspots, toWorld) {
  const at = ([x, y, z]) => {
    const p = toWorld(x, z)
    return [p.x, y, p.z]
  }
  return hotspots.map((hotspot) => ({
    id: hotspot.id,
    label: hotspot.label,
    labelEn: hotspot.labelEn,
    note: hotspot.note,
    noteEn: hotspot.noteEn,
    chapter: hotspot.chapter,
    level: hotspot.level,
    radius: hotspot.radius,
    ...(hotspot.clickOnly ? { clickOnly: true } : {}),
    point: toWorld(...hotspot.point),
    prompt: at(hotspot.prompt),
    camera: { position: at(hotspot.camera.position), target: at(hotspot.camera.target) },
  }))
}

/** 爐鍋咖啡在二樓：互動點與從店家名錄前往的位置在 level 1（樓層 2） */
const LUGUO_LEVEL = 1

export const SHOPS = [
  {
    id: 'lin-fu-zhen',
    name: '林復振',
    nameEn: 'Lin Fuzhen',
    status: 'open',
    year: 1853,
    category: '南北貨商號',
    categoryEn: 'Dried-goods trading house',
    seal: '南北貨', // 介紹視窗左上角的印章文字
    sealEn: 'Dried goods',
    summary: '「大稻埕開基人物」林右藻及其家族所創設的商號。',
    summaryEn: 'A trading house founded by Lin Youzao (林右藻), known as a "founding figure of Dadaocheng", and his family.',

    // ── 場景配置 ──────────────────────────────
    position: { x: -2, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.4 },
    building: LIN_FU_ZHEN_BASE,
    // 招牌依〈林復振商行〉所載各時期的店號呈現；文獻未載者以營業內容示意
    buildingByEra: {
      'qing-port': { condition: 'new', sign: { text: '林復振', style: 'lacquer' } },
      banquet: { condition: 'mature', sign: { text: '林振源', style: 'gold' } },
      modern: { condition: 'mature', sign: { text: '復振商店', style: 'lacquer' }, lanterns: null },
      postwar: { condition: 'aged', sign: { text: '南北雜貨', style: 'painted' }, lanterns: null, tinAwning: true },
      revival: { condition: 'restored', sign: { text: '林復振', style: 'lacquer' } },
    },
    // 各年代介紹視窗上方的「此時期的林復振」（整理自〈林復振商行〉）
    eraNotes: {
      'qing-port':
        '1853年頂下郊拚後，林右藻率眾移居大稻埕，家族在此開設「復振」、「復源」、「復興」三間商號。',
      'qing-portEn':
        'After the Upper-Lower Jiao Clan Fight (頂下郊拚) of 1853, Lin Youzao (林右藻) led his followers to settle in Dadaocheng, where the family opened three trading houses: Fuzhen (復振), Fuyuan (復源) and Fuxing (復興).',
      banquet:
        '日治時期，家族結合復振、復源兩家店號的第二個字，以「林振源」為商號名稱，從事南北貨及海陸物產進口貿易；1915年，店東林子詵曾致函長崎泰益號，處理冬菇等貨品在海運途中受潮的海損理賠。',
      banquetEn:
        'In the Japanese colonial period the family combined the second characters of the Fuzhen and Fuyuan names to form the trading name Linzhenyuan (林振源), importing dried goods from north and south and other land and sea produce. In 1915 the shop owner, Lin Zishen (林子詵), wrote to the Taiyi firm (泰益號) in Nagasaki to settle a marine-loss claim for shiitake mushrooms and other goods damaged by damp during the sea voyage.',
      modern:
        '昭和年間林子詵過世後，其子林欽英、林欽典分號經營，店名分別為「復振英記」與「復振商店」；1933年，復振英記曾致函泰益號，懇請定期告知海產什貨的行情。',
      modernEn:
        'After Lin Zishen died in the Showa era, his sons Lin Qinying (林欽英) and Lin Qindian (林欽典) ran separate branches, named Fuzhen Yingji (復振英記) and Fuzhen Shangdian (復振商店). In 1933 Fuzhen Yingji wrote to the Taiyi firm asking to be told regularly of market prices for seafood and sundry goods.',
      postwar:
        '林欽典一脈所傳承的商行，向來以南北雜貨為主要營業項目。此時期的招牌樣貌未見於本站引用的文獻，場景以「南北雜貨」示意。',
      postwarEn:
        'The firm passed down through Lin Qindian\'s line had always dealt chiefly in dried goods and groceries. How its sign looked in this period does not appear in the sources cited by this site, so the scene shows a generic "dried goods and groceries" sign as a scenario illustration.',
      revival:
        '今日迪化街上的林復振商行由林欽典所傳承，以南北雜貨為主要營業項目；1980年代也跨足喜餅禮盒，並以祖輩老店號「林振源」成立子公司經營喜餅業務。',
      revivalEn:
        'Today\'s Lin Fuzhen firm on Dihua Street is carried on by the line of Lin Qindian and deals chiefly in dried goods and groceries. In the 1980s it also moved into wedding-cake gift boxes, setting up a subsidiary under the ancestral shop name "Linzhenyuan" (林振源) to run its pastry business.',
    },
    // 按 E 探索時的鏡頭：從店面往街道前進 distance、沿街側移 side、離地 height，
    // 注視店面 lookHeight 的高度（斜角取景，鏡頭留在街道範圍內）
    camera: { distance: 7.6, height: 4.6, side: 11, lookHeight: 3.6 },

    // ── 介紹章節 ──────────────────────────────
    // 庶民生活版本在文獻章前多一章「群像：在地經營者」（operatorsData.js）
    ...withPostwarOperators([
      {
        id: 'formation',
        type: 'text',
        tab: '大稻埕的形成',
        tabEn: 'The Making of Dadaocheng',
        title: '大稻埕的形成',
        titleEn: 'The Making of Dadaocheng',
        lead: '1853年，艋舺發生頂下郊拚，部分泉州同安人遷往大稻埕，逐漸建立新的商業聚落。',
        leadEn: 'In 1853 the Upper-Lower Jiao Clan Fight broke out in Bangka (Wanhua). Some Tong\'an people of Quanzhou origin moved to Dadaocheng and gradually built a new commercial settlement.',
        paragraphs: [
          '「頂下郊拚」是泉州三邑郊商與同安籍郊商之間的械鬥。落敗的下郊同安人，在領袖林右藻的帶領下，輾轉移居當時仍為荒埔村落的大稻埕。',
          '移居者在此落腳並開設商號，原本的荒埔逐漸發展成新的商業聚落。',
        ],
        paragraphsEn: [
          'The "Upper-Lower Jiao Clan Fight" was an armed feud between the Sanyi (三邑) jiao merchants of Quanzhou and the jiao merchants of Tong\'an origin. The defeated Lower Jiao people of Tong\'an, led by Lin Youzao, moved by stages to Dadaocheng, then still a village on open wasteland.',
          'The settlers made their home there and opened trading houses, and the former wasteland gradually grew into a new commercial settlement.',
        ],
        timeline: [
          { place: '艋舺', placeEn: 'Bangka', text: '1853年，泉州三邑郊商與同安籍郊商爆發械鬥「頂下郊拚」。', textEn: 'In 1853 the Sanyi jiao merchants of Quanzhou and the jiao merchants of Tong\'an origin fought the "Upper-Lower Jiao Clan Fight".' },
          { place: '遷徙', placeEn: 'Migration', text: '落敗的下郊同安人，由領袖林右藻率眾輾轉移居。', textEn: 'The defeated Lower Jiao people of Tong\'an, led by Lin Youzao, moved on by stages.' },
          { place: '大稻埕', placeEn: 'Dadaocheng', text: '在仍為荒埔村落的大稻埕開設商號，逐漸形成商業聚落。', textEn: 'They opened trading houses in Dadaocheng, still a village on open wasteland, and a commercial settlement gradually formed.' },
        ],
        glossary: [
          {
            term: '郊',
            termEn: 'Jiao (guild)',
            definition:
              '清代臺灣從事兩岸貿易的商人所組成的同業組織，常依往來地區命名，例如泉郊、廈郊、北郊。',
            definitionEn:
              'Trade guilds of merchants engaged in cross-strait trade in Qing-dynasty Taiwan, often named after the region they traded with, such as the Quan jiao, the Xia jiao and the Bei jiao.',
          },
          { term: '拚', termEn: 'Pin (fight)', definition: '拚鬥、爭鬥之意；「頂下郊拚」即郊商群體之間的械鬥。', definitionEn: 'Meaning to fight or contend; the "Upper-Lower Jiao Clan Fight" was an armed feud between groups of jiao merchants.' },
        ],
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '林復振的歷史',
        tabEn: 'History of Lin Fuzhen',
        title: '林復振的歷史',
        titleEn: 'History of Lin Fuzhen',
        lead: '林右藻家族在大稻埕建立復振、復源、復興等商號，與大稻埕早期商業發展有密切關係。',
        leadEn: 'The Lin Youzao family founded the Fuzhen, Fuyuan and Fuxing trading houses in Dadaocheng, closely tied to the early commercial growth of the district.',
        paragraphs: [
          '林右藻被稱為「大稻埕開基人物」。家族為福建泉州同安籍移民，約於道光年間渡臺，原在艋舺地區經商；頂下郊拚後率眾移居大稻埕，並在此開設「復振」、「復源」、「復興」三間商號。',
          '林右藻曾親往香港、福建、廈門等地招商貿易，在大稻埕組織廈郊「金同順」，其後更聯合艋舺泉郊「金晉順」、北郊「金萬利」等共同經商，並擔任三郊總長。',
          '日治時期，家族商號交由子侄輩打理。由於部分子孫轉業或遷居他處，僅存侄孫輩經營的「林復振商行」延續至今。',
        ],
        paragraphsEn: [
          'Lin Youzao is known as a "founding figure of Dadaocheng". The family were Tong\'an migrants from Quanzhou, Fujian, who crossed to Taiwan around the Daoguang era and first traded in the Bangka area; after the Upper-Lower Jiao Clan Fight he led his followers to Dadaocheng and opened three trading houses there: Fuzhen, Fuyuan and Fuxing.',
          'Lin Youzao travelled in person to Hong Kong, Fujian, Xiamen and elsewhere to seek trade, organised the Xia jiao (廈郊) "Jintongshun" (金同順) in Dadaocheng, and later joined with the Quan jiao "Jinjinshun" (金晉順) and the Bei jiao "Jinwanli" (金萬利) of Bangka to trade together, serving as head of the Three Jiao.',
          'In the Japanese colonial period the family businesses were handed to nephews and the younger generation. As some descendants changed careers or moved away, only the Lin Fuzhen firm, run by the grand-nephews\' generation, has survived to the present.',
        ],
        seals: ['復振', '復源', '復興'],
        sealsEn: ['Fuzhen', 'Fuyuan', 'Fuxing'],
        facts: [
          { label: '創設', labelEn: 'Founded by', value: '林右藻及其家族', valueEn: 'Lin Youzao and his family' },
          { label: '原籍', labelEn: 'Ancestral home', value: '福建泉州同安', valueEn: 'Tong\'an, Quanzhou, Fujian' },
          { label: '商號', labelEn: 'Trading houses', value: '復振．復源．復興', valueEn: 'Fuzhen, Fuyuan, Fuxing' },
          { label: '商業組織', labelEn: 'Trade organisation', value: '組織廈郊「金同順」，並擔任三郊總長', valueEn: 'Organised the Xia jiao "Jintongshun" and served as head of the Three Jiao' },
        ],
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食物',
        title: '代表食物｜南北貨',
        tabEn: 'Signature Foods',
        titleEn: 'Signature Foods | Dried Goods from North and South',
        intro:
          '南北貨泛指來自各地、經乾燥或醃漬處理，便於保存與長途運送的食材與雜貨。以下圖鑑介紹南北貨的代表品項。',
        introEn:
          '"Dried goods from north and south" (南北貨) broadly means ingredients and groceries from many places that are dried or cured so that they keep well and travel long distances. The guide below presents representative items.',
        items: [
          {
            id: 'shiitake',
            name: '香菇',
            category: '山產｜菇類',
            nameEn: 'Shiitake mushrooms',
            categoryEn: 'Mountain produce | Mushrooms',
            description:
              '香菇乾燥後香氣更為濃郁，也更耐保存與運送，是燉湯、滷味與年節料理中常見的提味食材。',
            descriptionEn:
              'Dried shiitake mushrooms have a richer aroma and keep and travel better, and are a common flavouring in soups, braises and festival dishes.',
            note: '1915年，林振源號（林復振家族於日治時期使用的商號）訂購的「對州魷」與「冬菇」在海運途中受潮，店東林子詵因此致函長崎泰益號處理海損理賠。',
            noteEn: 'In 1915 the "Tsushima squid" (對州魷) and "winter mushrooms" (冬菇) ordered by Linzhenyuan (the trading name used by the Lin Fuzhen family in the Japanese colonial period) were damaged by damp on the sea voyage, so the shop owner Lin Zishen wrote to the Taiyi firm in Nagasaki to settle the marine-loss claim.',
          },
          {
            id: 'dried-shrimp',
            name: '蝦米',
            category: '海味｜蝦類',
            nameEn: 'Dried shrimp',
            categoryEn: 'Seafood | Shrimp',
            description:
              '小型的蝦經煮熟、曬乾後去殼製成，體積小而鮮味濃，常用於爆香、炒菜，以及油飯、粽子等料理。',
            descriptionEn:
              'Small shrimp are boiled, sun-dried and shelled. Small but intensely savoury, they are used to flavour stir-fries and in dishes such as oil rice and rice dumplings.',
          },
          {
            id: 'mullet-roe',
            name: '烏魚子',
            category: '海味｜魚卵',
            nameEn: 'Mullet roe',
            categoryEn: 'Seafood | Fish roe',
            description:
              '以烏魚的卵經鹽漬、整形、壓製與日曬製成，色澤琥珀橙紅，是冬季烏魚季的代表性海味，也常作為年節贈禮。',
            descriptionEn:
              'Made from grey mullet roe that is salted, shaped, pressed and sun-dried, it has an amber-orange colour. It is the signature delicacy of the winter mullet season and a popular gift at festivals.',
          },
          {
            id: 'dried-goods',
            name: '乾貨',
            category: '南北貨總稱',
            nameEn: 'Dried goods',
            categoryEn: 'General term for dried goods from north and south',
            description:
              '泛指經日曬、風乾或鹽漬處理的食材，如干貝、魷魚、金針、木耳等，便於長途運送與儲藏。',
            descriptionEn:
              'Ingredients that are sun-dried, air-dried or cured, such as dried scallops, squid, daylily buds and wood-ear fungus, easy to transport over long distances and to store.',
            note: '1933年，復振英記致函長崎泰益號，除說明分號情形，也懇請對方定期告知海產什貨的行情。',
            noteEn: 'In 1933 Fuzhen Yingji wrote to the Taiyi firm in Nagasaki, explaining the arrangement of its branches and asking to be told regularly of market prices for seafood and sundry goods.',
          },
        ],
        footnote:
          '標示「文獻小記」的內容整理自〈林復振商行〉；其餘為南北貨品項的一般介紹，並非林復振的實際貨品清單。',
        footnoteEn:
          'Content marked "Documentary note" is compiled from "Lin Fuzhen Firm" (林復振商行); the rest is a general introduction to dried-goods items and is not an actual list of Lin Fuzhen\'s stock.',
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。',
        tabEn: 'Sources and Historical Basis',
        titleEn: 'Sources and Historical Basis',
        introEn: 'This shop introduction is compiled from the following sources; select one to open the original web page.',
        sourceIds: ['ith-lin-fu-zhen'],
        disclaimer:
          '本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。',
        disclaimerEn:
          'The 3D street scenes on this website are conceptual reconstructions of the atmosphere of Dadaocheng\'s commercial districts in each period; building exteriors, signs, furnishings and shop positions are for imaginative context only and are not precise restorations.',
      },
    ]),
  },

  {
    id: 'zi-yang',
    name: '滋養豆餡舖',
    nameEn: 'Ziyang Bean-Paste Shop',
    status: 'open',
    year: 1953,
    category: '和菓子・糕餅・伴手禮',
    seal: '和菓子',
    categoryEn: 'Wagashi, cakes and pastries, souvenir gifts',
    sealEn: 'Wagashi',
    summary:
      '1953年創立於南京西路的老店，以自家熬煮的豆餡製作和菓子與糕餅；後來才遷入迪化街與涼州街口的紅磚洋樓。',
    summaryEn:
      'A long-established shop founded in 1953 on Nanjing West Road, making wagashi (Japanese confections) and pastries from bean paste it simmers itself; only later did it move into the red-brick Western-style building at the corner of Dihua Street and Liangzhou Street.',

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：街屋列西端（接河岸廣場）改成迪化街與涼州街的轉角，
    // 斜切的轉角立面朝向西南方的路口。position 為轉角店面（一樓斜切店面）的中心。
    position: { x: -30.5, z: -6.3 },
    facing: 'southwest',
    interaction: { radius: 3.6 },
    // 轉角建築的基準點（建築本地座標原點），以及這棟建築取代的一般地段（不影響其他年代的地段切分）
    site: { x: -29.5, z: -4.5, rotationY: 0, replaces: ['north-0', 'north-1', 'plaza--1-1'] },
    building: { archetype: 'ziyang', width: 9, depth: 16.3 },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '滋養1953年創立於南京西路，原址在南西圓環商圈一帶；今日迪化街一段247號的轉角店面，是第三代接手時才承租遷入的。眼前的紅磚洋樓並不是1953年的原始店面。',
      revivalEn:
        'Ziyang was founded in 1953 on Nanjing West Road, in the Nanxi Roundabout (南西圓環) commercial area; the corner shop at 247 Dihua Street, Section 1, was leased and moved into only when the third generation took over. The red-brick Western-style building before you is not the original 1953 shop.',
    },
    // 按 E 探索時的鏡頭：從轉角店面往西南方的路口退開，斜看兩側立面與山牆
    camera: { distance: 18.5, height: 5.8, side: 0, lookHeight: 7.9 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'history',
        type: 'text',
        tab: '品牌歷史',
        title: '品牌歷史｜從南京西路到迪化街',
        lead: '滋養創立於1953年，原址在南京西路；位於迪化街一段247號的現址，是後來才遷入的。',
        tabEn: 'Brand History',
        titleEn: 'Brand History | From Nanjing West Road to Dihua Street',
        leadEn: 'Ziyang was founded in 1953 on Nanjing West Road; its present address at 247 Dihua Street, Section 1, was moved into later.',
        paragraphs: [
          '依滋養官方網站〈商店簡介〉，滋養「創立於1953年 原址為南京西路」，當年以「滋養食品」之名草創，「首開洋食西點之例」。2021年《料理．台灣》的專訪則記載，滋養成立之初「原本是家兼賣雜貨與麵包的小店」。兩份資料的描述角度不同，這裡一併列出。',
          '製菓技術方面，官網記載店家引進日本製菓技術、到京都拜師習藝，鑽研道地的和菓子手藝；專訪則記載，1961年起由第二代接手，開始製作和菓子。',
          '專訪提到，店名取自「食物天然，最宜滋養」的原則；滋養從早年就堅持「餡料親製」，每天早起熬製豆餡，紅豆餡選用屏東萬丹、比平常小一號的8號紅豆。',
          '同一篇專訪（2021年）記載：原址面臨都市更新，原本打算就此收掉，最後一刻得知有機會承租迪化街現在的店面，第三代林濬彤決定接手——滋養因此從經營了六十多年的南西圓環商圈，遷入大稻埕。',
        ],
        paragraphsEn: [
          'According to the "Shop Introduction" (商店簡介) on Ziyang\'s official website, Ziyang was "founded in 1953, originally on Nanjing West Road", set up at the time under the name "Ziyang Foods" (滋養食品) and was "the first to introduce Western-style pastries". A 2021 interview in Ryori Taiwan (《料理．台灣》) records that Ziyang "began as a small shop selling both groceries and bread". The two sources describe it from different angles, so both are given here.',
          'On confectionery technique, the official website records that the shop brought in Japanese confectionery methods and studied under a master in Kyoto to master authentic wagashi craft; the interview records that from 1961, under the second generation, it began making wagashi.',
          'The interview notes that the shop name comes from the principle "natural food is best for nourishment" (食物天然，最宜滋養), and that from early on Ziyang has insisted on making its own fillings, simmering the bean paste every morning; its red-bean paste uses No. 8 red beans from Wandan, Pingtung, a size smaller than usual.',
          'The same interview (2021) records that the original site faced urban renewal and the shop was about to close for good, until at the last moment it learned it could lease its present shopfront on Dihua Street; the third generation, Lin Juntong (林濬彤), decided to take it on, and Ziyang thus moved into Dadaocheng from the Nanxi Roundabout area, where it had traded for over sixty years.',
        ],
        timeline: [
          { place: '南京西路', placeEn: 'Nanjing West Road', text: '1953年創立，以「滋養食品」之名開業，原址位於南京西路（南西圓環商圈一帶）。', textEn: 'Founded in 1953 and opened under the name "Ziyang Foods", at its original site on Nanjing West Road (around the Nanxi Roundabout commercial area).' },
          { place: '和菓子', placeEn: 'Wagashi', text: '引進日本製菓技術；1961年起由第二代接手，開始製作和菓子。', textEn: 'Japanese confectionery techniques were introduced; from 1961, under the second generation, the shop began making wagashi.' },
          { place: '迪化街', placeEn: 'Dihua Street', text: '原址面臨都市更新，第三代林濬彤接手，承租迪化街一段247號的轉角店面。', textEn: 'With the original site facing urban renewal, the third generation, Lin Juntong, took over and leased the corner shop at 247 Dihua Street, Section 1.' },
        ],
        facts: [
          { label: '店名', labelEn: 'Shop name', value: '滋養豆餡舖（滋養製菓）', valueEn: 'Ziyang Bean-Paste Shop (Ziyang Confectionery)' },
          { label: '創立', labelEn: 'Founded', value: '1953年，原址南京西路', valueEn: '1953, originally on Nanjing West Road' },
          { label: '現址', labelEn: 'Present address', value: '臺北市大同區迪化街一段247號（迪化街與涼州街口）', valueEn: '247 Dihua Street, Section 1, Datong District, Taipei (corner of Dihua Street and Liangzhou Street)' },
          { label: '營業', labelEn: 'Business', value: '和菓子、糕餅與伴手禮禮盒', valueEn: 'Wagashi, cakes and pastries, and souvenir gift boxes' },
        ],
        glossary: [
          { term: '和菓子', termEn: 'Wagashi', definition: '日本傳統點心的總稱，常以豆餡、米與糯米製品、寒天等製作，造型與口味隨季節變化。', definitionEn: 'The general term for traditional Japanese confections, often made from sweet bean paste, rice and glutinous-rice products, kanten (agar) and the like, with shapes and flavours that change with the seasons.' },
          { term: '豆餡', termEn: 'Sweet bean paste', definition: '紅豆、白豆等豆類煮熟後加糖熬煉成的內餡，是和菓子與許多糕餅的基礎。', definitionEn: 'A filling made by boiling red beans, white beans and other pulses and simmering them with sugar; it is the foundation of wagashi and many cakes and pastries.' },
        ],
        sourceIds: ['ziyang-about', 'ryori-taiwan-ziyang'],
      },
      {
        id: 'architecture',
        type: 'text',
        tab: '建築特色',
        title: '建築特色｜轉角的紅磚洋樓',
        tabEn: 'Architecture',
        titleEn: 'Architecture | The Red-Brick Corner Building',
        lead: '今日的滋養位在迪化街與涼州街口，是一棟二層樓的轉角街屋：灰色洗石子立面、紅磚柱與水平紅磚飾帶，屋頂上方是有渦卷紋與球形飾物的山牆。',
        leadEn: 'Today\'s Ziyang stands at the corner of Dihua Street and Liangzhou Street, in a two-storey corner shophouse: a grey washed-pebble (terrazzo-style) facade, red-brick pilasters and horizontal red-brick bands, topped by a gable with scrolls and ball finials.',
        // 實地拍攝的照片（3D 建築的建模依據）
        figures: [
          { id: 'zi-yang-corner', caption: '迪化街與涼州街口：轉角立面與沿涼州街延伸的連棟立面（實地拍攝）', captionEn: 'The corner of Dihua Street and Liangzhou Street: the corner facade and the row of linked facades along Liangzhou Street (field photograph)' },
          { id: 'zi-yang-facade', caption: '斜切的轉角立面：紅磚柱、三扇長窗、鐵欄杆與「滋養豆餡舖」橫帶（實地拍攝）', captionEn: 'The chamfered corner facade: red-brick pilasters, three tall windows, iron railings and the "Ziyang Bean-Paste Shop" fascia band (field photograph)' },
          { id: 'zi-yang-storefront', caption: '騎樓下的店面：黑色遮雨棚、淺色木作、石材與玻璃櫥窗（實地拍攝）', captionEn: 'The shopfront under the arcade: black awning, pale woodwork, stone and glass display windows (field photograph)' },
        ],
        paragraphs: [
          '轉角以斜切的立面面向路口，左右兩根紅磚柱一路延伸到屋頂，柱頂立著層疊的圓球裝飾；中央山牆兩側是渦卷紋，最高處是一顆大圓球。二樓三扇長窗配木窗框，窗下是鐵欄杆；灰色牆面與紅磚交錯成一道道水平飾帶，一樓上方的橫帶嵌著「滋養豆餡舖」五個黑字。',
          '一樓是連續的騎樓（亭仔腳），柱與楣樑交接處有弧形托座。騎樓沿著迪化街與涼州街兩側延伸，涼州街一側還連著好幾開間相同風格、各有小山牆的立面。',
          '旅遊媒體形容這裡「店鋪的外觀是相當標準的大稻埕街屋型態，有日治的洋樓古典風格，也有巴洛克浪漫的氣息」，「紅磚牆注入了歷史痕跡，高高牌樓更顯氣派」。',
          '老屋新生之後，一樓以黑色遮雨棚、淺色木作、灰色石材與大片玻璃櫥窗組成現代店面，門口掛著白色暖簾。《料理．台灣》形容店內是「紅磚洋樓和木造空間」，搭配塌塌米矮几、青花瓷茶具與鑄鐵壺。',
          '請注意：本站沒有查到這棟建築的興建年代與文化資產身分，因此不標示建築年代；這棟建築也不是滋養1953年的原始店面——滋養創立時位於南京西路，遷入這裡是後來的事。',
        ],
        paragraphsEn: [
          'The corner faces the junction with a chamfered facade. Two red-brick pilasters on either side run up to the roof, topped with stacked ball ornaments; the central gable is flanked by scrolls, with a large ball at its peak. On the upper floor are three tall windows with timber frames and iron railings beneath them; the grey wall and red brick alternate in horizontal bands, and the fascia above the ground floor carries five black characters reading "Ziyang Bean-Paste Shop".',
          'The ground floor is a continuous arcade (the "tingzijiao", 亭仔腳), with curved brackets where the columns meet the lintels. The arcade runs along both Dihua Street and Liangzhou Street, and on the Liangzhou Street side several more bays in the same style, each with its own small gable, continue the facade.',
          'A travel publication describes the place thus: "the shop front is a very standard Dadaocheng shophouse form, with the classical style of Japanese-era Western buildings as well as a hint of Baroque romance", and "the red-brick walls carry traces of history, and the tall gable makes it all the more imposing".',
          'After its renewal, the ground floor was given a modern shopfront of black awning, pale woodwork, grey stone and large glass display windows, with a white noren curtain at the door. Ryori Taiwan describes the interior as a "red-brick Western-style building and timber space", furnished with tatami, low tables, blue-and-white porcelain tea sets and a cast-iron kettle.',
          'Please note: this site has not found the construction date or heritage status of this building, so no building date is given; nor is this building the original 1953 shop, since Ziyang was founded on Nanjing West Road and the move here came later.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '迪化街與涼州街轉角', valueEn: 'Corner of Dihua Street and Liangzhou Street' },
          { label: '形式', labelEn: 'Form', value: '二層樓轉角街屋，斜切轉角立面', valueEn: 'Two-storey corner shophouse with a chamfered corner facade' },
          { label: '立面', labelEn: 'Facade', value: '灰色洗石子、紅磚柱與水平紅磚飾帶', valueEn: 'Grey washed pebble, red-brick pilasters and horizontal red-brick bands' },
          { label: '裝飾', labelEn: 'Ornament', value: '渦卷紋山牆、球形飾物、鐵欄杆、騎樓弧形托座', valueEn: 'Scrolled gable, ball finials, iron railings, curved arcade brackets' },
          { label: '興建年代', labelEn: 'Date built', value: '未查證（本站未找到可靠資料）', valueEn: 'Not verified (this site found no reliable source)' },
        ],
        sourceIds: ['supertaste-ziyang', 'ryori-taiwan-ziyang'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食品',
        title: '代表食品｜和菓子與糕餅',
        intro: '滋養的商品以自家熬煮的豆餡為核心。以下圖鑑介紹店內的幾樣代表品項。',
        tabEn: 'Signature Foods',
        titleEn: 'Signature Foods | Wagashi and Pastries',
        introEn: 'Ziyang\'s products centre on the bean paste it simmers itself. The guide below presents several signature items.',
        items: [
          {
            id: 'strawberry-daifuku',
            name: '草莓大福',
            category: '季節限定｜麻糬',
            nameEn: 'Strawberry daifuku',
            categoryEn: 'Seasonal | Mochi',
            description: '把紅豆大福從中間切開，在露出的紅豆餡上放半粒鮮紅草莓，是每年冬春之際的期間限定商品。',
            descriptionEn: 'A red-bean daifuku cut open, with half a bright red strawberry set on the exposed bean paste; it is a limited-time product each year around winter and spring.',
            note: '《料理．台灣》（2021）記載：草莓大福是第三代林濬彤推出的新產品，每年只賣約三個月、12月上市，選用「豐香草莓」。',
            noteEn: 'Ryori Taiwan (2021) records that strawberry daifuku is a new product introduced by the third generation, Lin Juntong, sold for only about three months each year from its December launch, and made with "Toyonoka" (豐香) strawberries.',
          },
          {
            id: 'monaka',
            name: '最中',
            category: '和菓子｜米菓皮',
            nameEn: 'Monaka',
            categoryEn: 'Wagashi | Wafer shell',
            description: '以糯米燒製的酥脆餅皮，包入紅豆餡。專訪記載店內四季都有紅豆餡的最中。',
            descriptionEn: 'A crisp wafer shell baked from glutinous rice, filled with red-bean paste. The interview records that the shop offers red-bean monaka in every season.',
            note: '食尚玩家的介紹提到，滋養的最中「每一份都是費心現點現做，而且採用與日本一致的作法」。',
            noteEn: 'The Supertaste (食尚玩家) feature mentions that Ziyang\'s monaka is "made to order with care, every one, in the same way as in Japan".',
          },
          {
            id: 'dorayaki',
            name: '銅鑼燒',
            category: '和菓子｜燒菓子',
            nameEn: 'Dorayaki',
            categoryEn: 'Wagashi | Baked confection',
            description: '兩片鬆軟的餅皮夾入紅豆餡，是一年四季都吃得到的經典和菓子。',
            descriptionEn: 'Two soft pancakes sandwiching red-bean paste, a classic wagashi available all year round.',
            note: '專訪提到，滋養把銅鑼燒「從手掌大縮小成為掌心尺寸」，從吃粗飽變成吃精巧。',
            noteEn: 'The interview mentions that Ziyang shrank its dorayaki "from palm-sized to palm-centre-sized", turning it from a hearty filler into something dainty.',
          },
          {
            id: 'yokan',
            name: '羊羹',
            category: '和菓子｜煉菓子',
            nameEn: 'Yokan',
            categoryEn: 'Wagashi | Nerigashi (kneaded confection)',
            description: '以豆餡加入寒天熬煉、凝固而成的條狀和菓子，切片後口感細緻，耐保存，也常作為伴手禮。',
            descriptionEn: 'A bar-shaped wagashi made by simmering bean paste with kanten (agar) and letting it set; sliced, it has a fine texture and keeps well, and is often given as a souvenir gift.',
          },
          {
            id: 'pineapple-cake',
            name: '鳳梨酥',
            category: '糕餅｜伴手禮',
            nameEn: 'Pineapple cake',
            categoryEn: 'Cakes and pastries | Souvenir gift',
            description: '臺灣代表性的伴手禮糕餅：酥鬆的餅皮包著鳳梨內餡。',
            descriptionEn: 'A signature Taiwanese souvenir pastry: a crumbly crust wrapped around a pineapple filling.',
            note: '專訪記載，滋養堅持混合冬瓜餡的傳統鳳梨餡，但把餅皮解構成兩片長方形酥餅、塗上白巧克力隔絕濕氣，做成「鳳梨夾心餅」。',
            noteEn: 'The interview records that Ziyang keeps the traditional pineapple filling mixed with winter melon, but deconstructs the crust into two rectangular shortbread layers coated with white chocolate to keep out moisture, making a "pineapple sandwich cookie" (鳳梨夾心餅).',
          },
        ],
        footnote: '標示「文獻小記」的內容整理自所列資料；其餘為品項的一般介紹。季節商品與品項以店家實際供應為準。',
        footnoteEn: 'Content marked "Documentary note" is compiled from the sources listed; the rest is a general introduction to the items. Seasonal products and items are subject to what the shop actually offers.',
        sourceIds: ['ryori-taiwan-ziyang', 'supertaste-ziyang', 'ziyang-about'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        title: '參考文獻',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。',
        tabEn: 'References',
        titleEn: 'References',
        introEn: 'This shop introduction is compiled from the following sources; select one to open the original web page.',
        sourceIds: ['ziyang-about', 'ryori-taiwan-ziyang', 'supertaste-ziyang'],
        disclaimer:
          '滋養豆餡舖的 3D 建築依實地拍攝的照片建模：轉角立面、山牆、紅磚柱、窗戶與騎樓的比例由照片估算，並為了配合遊戲街道略為調整，未知的尺寸並非精確測量；涼州街一側只做出三個開間。店內陳設為淺層的示意，並非實際擺設。',
        disclaimerEn:
          'The 3D building of Ziyang Bean-Paste Shop is modelled from field photographs: the proportions of the corner facade, gable, red-brick pilasters, windows and arcade are estimated from the photographs and adjusted slightly to fit the game street, and unknown dimensions are not precise measurements; only three bays are built on the Liangzhou Street side. The interior furnishing is a shallow scenario illustration, not the actual layout.',
      },
    ],
  },

  {
    id: 'yong-le-market',
    name: '永樂市場',
    nameEn: 'Yongle Market',
    status: 'open',
    year: 1908,
    yearLabel: '1908年（現有大樓1985年開業）',
    yearNote: '市場的起源是1908年；現在的市場大樓於1982年拆除舊市場後改建，1985年開業。',
    category: '公有市場・布業商場',
    seal: '市場',
    yearLabelEn: '1908 (present building opened 1985)',
    yearNoteEn: 'The market dates from 1908; the present market building was rebuilt after the old market was demolished in 1982 and opened in 1985.',
    categoryEn: 'Public market, fabric-trade mall',
    sealEn: 'Market',
    summary: '1908年設立的公有市場；現在的大樓於1982年拆除舊市場後改建、1985年開業，一樓是生鮮與日用品攤位，二、三樓是布業商場。',
    summaryEn: 'A public market established in 1908; the present building was rebuilt after the old market was demolished in 1982 and opened in 1985, with fresh produce and daily-goods stalls on the ground floor and a fabric-trade mall on the second and third floors.',

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：迪化街的街底（取代原本街底的一般街屋），大門朝西面向迪化街。
    // position 為一樓大門的外緣中央；一樓市場可以走進去（見 builders/yongleMarket.js）。
    position: { x: 42.2, z: 0 },
    facing: 'west',
    interaction: { radius: 3.0 },
    site: { x: 42.2, z: 0, rotationY: -Math.PI / 2, replaces: ['street-end'] },
    building: { archetype: 'yongle-market', width: 18, depth: 21 },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '永樂市場從1908年開始，現在的市場大樓則是1985年開業的建築。場景中的大樓依實地照片建模；一樓市場可以走進去，裡面的配置是簡化的概念示意。',
      revivalEn:
        'Yongle Market began in 1908, and the present market building opened in 1985. The building in the scene is modelled from field photographs; the ground-floor market can be entered, and its layout inside is a simplified conceptual illustration.',
    },
    camera: { distance: 19, height: 4.6, side: 0, lookHeight: 8.2 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'history',
        type: 'text',
        tab: '市場歷史',
        title: '市場歷史｜從1908年的公營市場到1985年的市場大樓',
        lead: '永樂市場的歷史從1908年開始；現在看到的市場大樓，是1982年拆除舊市場之後改建、1985年開業的建築。',
        tabEn: 'Market History',
        titleEn: 'Market History | From the 1908 Public Market to the 1985 Market Building',
        leadEn: 'The history of Yongle Market begins in 1908; the market building you see today was rebuilt after the old market was demolished in 1982 and opened in 1985.',
        paragraphs: [
          '依《臺北市志》（國家圖書館「臺灣記憶」收錄的說明），1897年位於六館街（今南京西路西端）的大稻埕市場落成，1908年（明治41年）改設於大稻埕蘆竹腳街，1933年（昭和8年）改名為永樂町市場。臺北市市場處的介紹則寫道，市場「民國前4年成立，稱為「公設永樂町食料品小賣市場」」。兩份資料對當時名稱的記載不同，這裡一併列出。',
          '1995年《聯合報》的報導記載，市場成立於1908年12月14日，「最早的永樂市場是純木造的平房，環境衛生條件都差」。',
          '同一篇報導引述市場的資料：「在民國七十一年三月拆除舊建築改建新屋，再於民國七十四年九月完工、同年十月八日重新開業。」臺北市市場處也記載，民國71年原市場拆除，「改建綜合大樓安置原攤商，74年開業」。',
          '新大樓「地上九樓、地下兩層」，開業時一樓經營魚肉、蔬果與雜貨，二、三樓是布匹業者，四樓是飲食類。臺北市政府的市集資訊介紹，現在的永樂市場「1樓生鮮蔬果日用品，2.3樓布匹窗簾飾布買賣縫製，是全台布業零售、批發中心」。',
          '請注意：場景中的建築是現在的市場大樓（1985年開業），依實地照片建模；1908年的市場是另一棟早已拆除的平房建築，並不是眼前這棟大樓。',
        ],
        paragraphsEn: [
          'According to the Taipei City Gazetteer (《臺北市志》, as described in the National Central Library\'s "Taiwan Memory" collection), the Dadaocheng Market opened in 1897 on Liuguan Street (六館街, today the western end of Nanjing West Road); in 1908 (Meiji 41) it was relocated to Luzhujiao Street (蘆竹腳街) in Dadaocheng, and in 1933 (Showa 8) it was renamed Yongle-cho Market (永樂町市場). The Taipei Market Administration Office\'s introduction says that the market "was established in the 4th year before the Republic, called the \'Public Yongle-cho Food Retail Market\'". The two sources record the name at the time differently, so both are given here.',
          'A 1995 report in the United Daily News (《聯合報》) records that the market was established on 14 December 1908, and that "the earliest Yongle Market was a purely timber single-storey building with poor hygiene and conditions".',
          'The same report quotes the market\'s own records: "in March of the 71st year of the Republic the old building was demolished and a new one built, completed in September of the 74th year and reopened on 8 October of the same year". The Taipei Market Administration Office likewise records that in the 71st year of the Republic the original market was demolished and a "composite building was built to rehouse the original stallholders, opening in the 74th year" (1985).',
          'The new building has "nine storeys above ground and two below"; at opening, the ground floor sold fish, meat, vegetables, fruit and groceries, the second and third floors housed fabric traders, and the fourth floor was for food and drink. The Taipei City Government\'s market information describes today\'s Yongle Market as "fresh vegetables, fruit and daily goods on the 1st floor, with cloth, curtains and furnishing fabrics sold and sewn on the 2nd and 3rd floors, the retail and wholesale centre of the fabric trade in all Taiwan".',
          'Please note: the building in the scene is the present market building (opened 1985), modelled from field photographs; the 1908 market was a different single-storey building, long since demolished, and is not the building in front of you.',
        ],
        timeline: [
          { place: '1897', text: '大稻埕市場在六館街（今南京西路西端）落成開張。', textEn: 'The Dadaocheng Market opens on Liuguan Street (today the western end of Nanjing West Road).' },
          { place: '1908', text: '改設於大稻埕蘆竹腳街（市場處記載為「民國前4年成立」）。', textEn: 'Relocated to Luzhujiao Street in Dadaocheng (the Market Administration Office records it as "established in the 4th year before the Republic").' },
          { place: '1933', text: '大稻埕市場改名為永樂町市場（依《臺北市志》）。', textEn: 'The Dadaocheng Market is renamed Yongle-cho Market (according to the Taipei City Gazetteer).' },
          { place: '1982', text: '3月拆除舊市場，原地改建綜合大樓。', textEn: 'In March the old market is demolished and a composite building is built on the site.' },
          { place: '1985', text: '9月完工，10月8日重新開業。', textEn: 'Completed in September; reopened on 8 October.' },
        ],
        facts: [
          { label: '地址', labelEn: 'Address', value: '臺北市大同區迪化街一段21號', valueEn: '21 Dihua Street, Section 1, Datong District, Taipei' },
          { label: '起源', labelEn: 'Origin', value: '1908年（明治41年）', valueEn: '1908 (Meiji 41)' },
          { label: '現有大樓', labelEn: 'Present building', value: '1982年拆除舊市場改建，1985年開業', valueEn: 'Old market demolished and rebuilt in 1982; opened in 1985' },
          { label: '樓層', labelEn: 'Floors', value: '一樓生鮮蔬果日用品；二、三樓布匹窗簾飾布（市集資訊）', valueEn: 'Ground floor: fresh produce and daily goods; second and third floors: cloth, curtains and furnishing fabrics (market information)' },
        ],
        sourceIds: ['ncl-yongle-market', 'tcma-yongle-market', 'udn-1995-yongle-market', 'taipei-market-info-yongle'],
      },
      {
        id: 'building',
        type: 'text',
        tab: '市場大樓',
        title: '市場大樓｜可以走進去的一樓市場',
        lead: '迪化街的街底是永樂市場大樓：一樓的騎樓與大門通往市場，二樓正面是「永樂布業商場」的大招牌。',
        tabEn: 'Market Building',
        titleEn: 'Market Building | The Ground-Floor Market You Can Walk Into',
        leadEn: 'At the end of Dihua Street stands the Yongle Market building: the ground-floor arcade and doors lead into the market, and the second-floor front carries the large "Yongle Fabric Trade Mall" (永樂布業商場) sign.',
        paragraphs: [
          '場景中的大樓依實地照片建模：一樓是粉灰色石材方柱的騎樓與玻璃大門，二樓有紅磚女兒牆與花崗石壓頂，正中央是深色外框的「永樂布業商場」招牌；三樓以上退縮，是深色的玻璃帷幕與紅磚量體。尺寸由照片估算，並非測量。',
          '從迪化街走進大門，就到了一樓市場：中央走道兩側各有四個攤位，天花板上是日光燈、電纜線槽與管線，還有指示門口方向的吊牌。這個平面是簡化的概念配置，並非精確復原；除了好粿緣之外，攤位招牌只用一般的品項字，不代表實際的店家或位置。',
          '好粿緣在走道北側的第二個攤位（攤位編號1020）。走到攤位前，電腦按 E、iPad 點攤位，就能閱讀好粿緣的介紹。二樓以上目前只做出外觀。',
        ],
        paragraphsEn: [
          'The building in the scene is modelled from field photographs: the ground floor is an arcade of pale pink-grey stone square columns with large glass doors; the second floor has a red-brick parapet capped with granite, and at its centre is the "Yongle Fabric Trade Mall" sign in a dark frame; above the third floor the building steps back, with dark glass curtain walling and red-brick volumes. Dimensions are estimated from photographs, not measured.',
          'Walking in through the doors from Dihua Street, you reach the ground-floor market: along the central aisle are four stalls on each side, with fluorescent lights, cable trays and pipework overhead, and hanging signs pointing towards the entrance. This plan is a simplified conceptual layout, not a precise restoration; apart from Haoguoyuan, the stall signs use only generic item names and do not represent actual shops or locations.',
          'Haoguoyuan is the second stall on the north side of the aisle (stall no. 1020). Walk up to the stall and press E on a computer, or tap the stall on an iPad, to read the Haoguoyuan introduction. Above the ground floor, only the exterior is built for now.',
        ],
        facts: [
          { label: '一樓', labelEn: 'Ground floor', value: '門廳、中央走道、八個攤位、走道盡頭（概念配置）', valueEn: 'Lobby, central aisle, eight stalls, end of the aisle (conceptual layout)' },
          { label: '二樓以上', labelEn: 'Second floor and above', value: '只做外觀，尚未開放', valueEn: 'Exterior only; not yet open' },
          { label: '依據', labelEn: 'Basis', value: '2026年實地照片（尺寸為估算）', valueEn: 'Field photographs from 2026 (dimensions estimated)' },
        ],
        sourceIds: ['taipei-market-info-yongle', 'tcma-yongle-market'],
      },
      NIANHUO_CHAPTER,
      NANBEI_BACKGROUND_CHAPTER,
      // 第 8 階段 C：老屋新生的「群像：在地經營者」（operatorsData.js），放在戲苑三章之前
      OPERATORS_REVIVAL_CHAPTER,
      XIYUAN_VENUE_CHAPTER,
      XIYUAN_HISTORY_CHAPTER,
      XIKU_BACKGROUND_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '參考資料',
        title: '參考資料',
        intro: '永樂市場的介紹整理自下列資料，點選即可開啟原始網頁。',
        tabEn: 'References',
        titleEn: 'References',
        introEn: 'The Yongle Market introduction is compiled from the following sources; select one to open the original web page.',
        sourceIds: [
          ...new Set(['tcma-yongle-market', 'taipei-market-info-yongle', 'ncl-yongle-market', 'udn-1995-yongle-market', ...NIANHUO_SOURCE_IDS, ...OPERATORS_REVIVAL_SOURCE_IDS, ...XIYUAN_SOURCE_IDS]),
        ],
        disclaimer:
          `永樂市場大樓的 3D 外觀依實地照片建模，比例為估算；一樓市場的平面是簡化的概念配置，攤位數量、位置與陳設都不是精確復原。${NIANHUO_DISCLAIMER_TEXT}${OPERATORS_REVIVAL_DISCLAIMER_TEXT}${XIYUAN_DISCLAIMER_TEXT}`,
        disclaimerEn:
          `The 3D exterior of the Yongle Market building is modelled from field photographs, with proportions estimated; the ground-floor market plan is a simplified conceptual layout, and the number, positions and furnishing of the stalls are not precise restorations. ${NIANHUO_DISCLAIMER_TEXT_EN}${OPERATORS_REVIVAL_DISCLAIMER_TEXT_EN}${XIYUAN_DISCLAIMER_TEXT_EN}`,
      },
    ],
  },
  {
    id: 'hao-guo-yuan',
    name: '好粿緣',
    nameEn: 'Haoguoyuan (Hao Guo Yuan) kueh shop',
    status: 'open',
    category: '傳統米食・粿',
    categoryEn: 'Traditional rice foods: kueh',
    seal: '粿',
    sealEn: 'Kueh',
    summary: '永樂市場一樓的米食攤位（攤位編號1020），販售草仔粿、紅龜粿、芋粿巧、蘿蔔糕等傳統的粿。',
    summaryEn: 'A rice-food stall on the ground floor of Yongle Market (stall no. 1020), selling traditional kueh (rice cakes) such as cao-zai-guo (mugwort kueh), red turtle kueh, yu-guo-qiao (taro kueh) and turnip cake.',

    // ── 場景配置 ──────────────────────────────
    // 在永樂市場一樓裡面（不是街上的建築）：走道北側的第二個攤位，攤位正面朝南對著走道。
    // position 為攤位正面（走道邊）的中央；攤位模型與遮擋方塊由 builders/yongleMarket.js 產生。
    inside: 'yong-le-market',
    stall: '1020',
    position: { x: 50.05, z: -1.8 },
    facing: 'south',
    // 走道只有 3.6 公尺寬：互動點在攤位前 1.15 公尺（走道中央附近）
    interaction: { radius: 2.4, distance: 1.15 },
    // 從店家名錄前往時，鏡頭偏到走道的方向（窄走道裡不要正對攤位後退）
    travelYawOffset: 1.15,
    eraNotes: {
      revival:
        '好粿緣在永樂市場一樓（攤位編號1020）。本站沒有找到這個攤位的創立年份或店史資料，因此介紹以攤位上看得到的品項，以及傳統粿食的材料、做法與節慶為主。',
      revivalEn:
        'Haoguoyuan is on the ground floor of Yongle Market (stall no. 1020). This site has not found a founding year or shop history for the stall, so the introduction rests on the items visible at the stall and on the ingredients, methods and festivals of traditional kueh.',
    },
    camera: { distance: 3.1, height: 2.05, side: -2.3, lookHeight: 1.55 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'about',
        type: 'text',
        tab: '店家介紹',
        tabEn: 'About the Shop',
        title: '店家介紹｜永樂市場一樓的粿攤',
        titleEn: 'About the Shop | A Kueh Stall on the Ground Floor of Yongle Market',
        lead: '好粿緣是永樂市場一樓的米食攤位，鮮綠色招牌上寫著店名，攤位牌上的編號是1020。',
        leadEn: 'Haoguoyuan is a rice-food stall on the ground floor of Yongle Market. Its bright green sign carries the shop name, and the number on the stall plate is 1020.',
        paragraphs: [
          '永樂市場位在迪化街一段21號，起源於1908年，現在的市場大樓於1985年開業。臺北市政府的市集資訊介紹，市場一樓是「生鮮蔬果日用品」，二、三樓是布匹窗簾飾布的買賣與縫製。好粿緣就在一樓的攤位之間。',
          '依實地拍攝時攤位上的價目表與品名牌：草仔粿有香菇肉、菜脯米等鹹口味，以及芝麻、花生、紅豆等甜口味；另外還有紅龜粿與艾草龜粿、芋粿巧、蘿蔔糕、紫米糕等米食，分裝在透明袋與盒子裡，擺在木製的托盤上。品項與口味會隨時間調整，實際以店家供應為準。',
          '這些粿過去常在家裡為年節與祭祀準備：農業部的〈年糕＆蘿蔔糕〉就記錄了過年前在家做菜頭粿、甜粿、發糕等糕點的情景。今天在市場的粿攤，平日也買得到這些米食。',
          '本站沒有找到介紹好粿緣的新聞報導或店史資料，因此不寫創立年份、創辦人或配方。',
        ],
        paragraphsEn: [
          'Yongle Market stands at 21 Dihua Street, Section 1. Its origins go back to 1908, and the present market building opened in 1985. According to the Taipei City Government’s market information, the ground floor sells “fresh produce and daily necessities”, while the second and third floors trade in cloth, curtains and furnishing fabrics and offer sewing services. Haoguoyuan is among the stalls on the ground floor.',
          'Going by the price list and item labels at the stall when it was photographed on site: cao-zai-guo (mugwort kueh) comes in savoury flavours such as shiitake and pork or dried radish and rice, and in sweet flavours such as sesame, peanut and red bean. There are also red turtle kueh and mugwort turtle kueh, yu-guo-qiao (taro kueh), turnip cake and purple rice cake, packed in clear bags and boxes and set out on wooden trays. Items and flavours change over time; what the stall actually sells is what counts.',
          'In the past these kueh were often prepared at home for festivals and offerings. The Ministry of Agriculture’s “Nian Gao and Turnip Cake” records the scene of making turnip kueh, sweet kueh, fa-gao (steamed sponge cake) and other cakes at home before the Lunar New Year. Today they can also be bought on ordinary days at kueh stalls in the market.',
          'This site has not found any news report or shop history about Haoguoyuan, so it gives no founding year, founder or recipe.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '永樂市場一樓（攤位編號1020）', valueEn: 'Ground floor of Yongle Market (stall no. 1020)' },
          { label: '地址', labelEn: 'Address', value: '臺北市大同區迪化街一段21號（永樂市場）', valueEn: '21 Dihua Street, Section 1, Datong District, Taipei (Yongle Market)' },
          { label: '品項', labelEn: 'Items', value: '草仔粿、紅龜粿、芋粿巧、蘿蔔糕、紫米糕等', valueEn: 'Cao-zai-guo (mugwort kueh), red turtle kueh, yu-guo-qiao (taro kueh), turnip cake, purple rice cake and more' },
          { label: '創立年份', labelEn: 'Year founded', value: '未查得資料', valueEn: 'No information found' },
        ],
        sourceIds: ['taipei-market-info-yongle', 'tcma-yongle-market', 'moa-niangao'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食品',
        tabEn: 'Signature Foods',
        title: '代表食品｜草仔粿、紅龜粿與米食',
        titleEn: 'Signature Foods | Mugwort Kueh, Red Turtle Kueh and Rice Foods',
        intro: '好粿緣攤位上的幾樣代表米食。食物說明整理自教育部《臺灣台語常用詞辭典》與農業部、國立臺灣歷史博物館的資料。',
        introEn: 'A few signature rice foods from the Haoguoyuan stall. The food descriptions are compiled from the Ministry of Education’s Dictionary of Frequently-Used Taiwan Taiwanese and from materials of the Ministry of Agriculture and the National Museum of Taiwan History.',
        items: [
          {
            id: 'cao-guo',
            name: '草仔粿',
            nameEn: 'Cao-zai-guo (mugwort kueh)',
            category: '糯米｜鹹甜內餡',
            categoryEn: 'Glutinous rice | Savoury or sweet filling',
            description: '糯米做的粿：外皮在「粿粞」中加入艾草或鼠麴草揉成，包入內餡，墊上葉片後放進蒸籠蒸熟。',
            descriptionEn: 'A kueh made of glutinous rice: mugwort or cudweed is kneaded into the rice dough (“guo-ci”) to make the skin, which is wrapped around a filling, set on a leaf and steamed in a steamer.',
            note: '好粿緣的價目表上，草仔粿有香菇肉、菜脯米等鹹口味，以及芝麻、花生、紅豆等甜口味。',
            noteEn: 'On Haoguoyuan’s price list, cao-zai-guo comes in savoury flavours such as shiitake and pork or dried radish and rice, and in sweet flavours such as sesame, peanut and red bean.',
          },
          {
            id: 'hong-gui',
            name: '紅龜粿',
            nameEn: 'Red turtle kueh',
            category: '糯米｜印模',
            categoryEn: 'Glutinous rice | Moulded',
            description: '糯米製成：先把粿皮染紅，用模具印上龜形的圖樣再蒸熟；內餡常見豆沙或花生。',
            descriptionEn: 'Made of glutinous rice: the skin is first dyed red, pressed in a mould with a turtle pattern and then steamed; common fillings are sweet bean paste or peanut.',
            note: '攤位上另有綠色的艾草龜粿；價目表寫著兩者都有花生、紅豆的甜餡。',
            noteEn: 'The stall also has green mugwort turtle kueh; the price list shows that both kinds come with sweet peanut or red bean fillings.',
          },
          {
            id: 'luobo-gao',
            name: '蘿蔔糕（菜頭粿）',
            nameEn: 'Turnip cake (cai-tau-guo)',
            category: '在來米｜蘿蔔',
            categoryEn: 'Long-grain rice | Radish',
            description: '在來米漿拌入蘿蔔絲、蝦米等配料蒸製而成，常切片煎來吃。',
            descriptionEn: 'Long-grain rice batter mixed with shredded radish, dried shrimp and other ingredients and steamed; it is often sliced and pan-fried.',
            note: '農業部〈年糕＆蘿蔔糕〉提到，「菜頭」與「彩頭」諧音，因此成為過年餐桌上必備的菜色。',
            noteEn: 'The Ministry of Agriculture’s “Nian Gao and Turnip Cake” notes that “cai-tau” (radish) sounds like “cai-tau” (good fortune) in Taiwanese, which is why it is a must on the Lunar New Year table.',
          },
          {
            id: 'yu-guo-qiao',
            name: '芋粿巧',
            nameEn: 'Yu-guo-qiao (taro kueh)',
            category: '在來米｜芋頭',
            categoryEn: 'Long-grain rice | Taro',
            description: '用芋頭、在來米、紅蔥頭、蝦米等蒸製而成，因為形狀像彎彎的弧形而得名。',
            descriptionEn: 'Steamed from taro, long-grain rice, shallots, dried shrimp and other ingredients; it is named for its shape, which is like a gentle curve.',
            note: '教育部辭典寫作「芋粿曲」；好粿緣的價目表上寫作「芋粿巧」。',
            noteEn: 'The Ministry of Education dictionary writes it as 芋粿曲 (yu-guo-qu); Haoguoyuan’s price list writes it as 芋粿巧 (yu-guo-qiao).',
          },
        ],
        footnote: '「文獻小記」中的攤位品項依實地拍攝時的價目表與品名牌整理；食物的材料與做法為一般說明，並非好粿緣的配方。',
        footnoteEn: 'The stall items in the “Source Notes” follow the price list and item labels at the time of the on-site photographs; the ingredients and methods are general descriptions, not Haoguoyuan’s recipes.',
        sourceIds: ['moe-cao-guo', 'moe-hong-gui', 'moe-cai-tau-guo', 'moe-yu-guo-qiao', 'moa-niangao'],
      },
      {
        id: 'culture',
        type: 'text',
        tab: '食物文化',
        tabEn: 'Food Culture',
        title: '食物文化｜粿的材料、做法與節慶',
        titleEn: 'Food Culture | Ingredients, Methods and Festivals of Kueh',
        lead: '「粿」是糕的總稱，指用糯米或粳米等做成的食品，因為加入的原料不同而有不同的名稱（教育部《臺灣台語常用詞辭典》）。',
        leadEn: '“Kueh” (粿) is a general term for cakes, meaning foods made from glutinous rice, japonica rice and the like; they take different names depending on the ingredients added (Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese).',
        paragraphs: [
          '材料：農業部的資料說明，臺灣傳統的蘿蔔糕、碗粿等是用在來米做的；草仔粿、紅龜粿、菜包等則是把圓糯米磨粉後製成。',
          '做法：以草仔粿為例，外皮是在粿粞中加入艾草或鼠麴草揉成，包餡後用手塑形，墊上黃槿葉或月桃葉，再放進蒸籠蒸熟。紅龜粿則用粿模印出龜形的圖樣——國立臺灣歷史博物館收藏的粿模說明，粿模是早期農業社會居家常見的模具。',
          '節慶：草仔粿常做為清明掃墓或農曆七月普渡的供品；紅龜粿在神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽時都看得到，也會在添丁時分送親友；過年則有「菜頭」諧音「彩頭」的蘿蔔糕，以及俗諺「食甜粿，予你趁家伙」的甜粿。',
        ],
        paragraphsEn: [
          'Ingredients: the Ministry of Agriculture explains that Taiwan’s traditional turnip cake, bowl kueh and the like are made from long-grain rice, while cao-zai-guo, red turtle kueh, cai-bao and the like are made from round glutinous rice ground into flour.',
          'Method: taking cao-zai-guo as an example, the skin is made by kneading mugwort or cudweed into the guo-ci (rice dough); after the filling is wrapped in, the kueh is shaped by hand, set on a hibiscus (Hibiscus tiliaceus) or shell-ginger leaf and steamed in a steamer. Red turtle kueh is pressed in a kueh mould to give it a turtle pattern; the National Museum of Taiwan History, which holds kueh moulds, explains that they were a common household tool in the early agricultural society.',
          'Festivals: cao-zai-guo is often an offering for tomb-sweeping at Qingming or for the Ghost Month rites (Pudu) in the seventh lunar month; red turtle kueh is seen at the birthdays of gods, at festival and New Year sacrifices, at ancestor worship and at the birthday celebrations of elders, and is also given to relatives and friends when a child is born; at the Lunar New Year there is turnip cake, whose “cai-tau” (radish) sounds like “cai-tau” (good fortune), and sweet kueh, from the saying “eat sweet kueh and make a fortune for your family”.',
        ],
        timeline: [
          { place: '過年', placeEn: 'Lunar New Year', text: '蘿蔔糕（菜頭粿，諧音「彩頭」）、甜粿（「食甜粿，予你趁家伙」）。', textEn: 'Turnip cake (cai-tau-guo, which sounds like “good fortune”) and sweet kueh (“eat sweet kueh and make a fortune for your family”).' },
          { place: '清明', placeEn: 'Qingming', text: '草仔粿是掃墓祭祖時常見的供品。', textEn: 'Cao-zai-guo is a common offering when sweeping tombs and honouring ancestors.' },
          { place: '普渡', placeEn: 'Pudu', text: '農曆七月普渡，也常以草仔粿為供品。', textEn: 'At the Pudu rites in the seventh lunar month, cao-zai-guo is also a common offering.' },
          { place: '慶典', placeEn: 'Celebrations', text: '紅龜粿：神明誕辰、祭祀、長輩做壽，添丁時分送親友。', textEn: 'Red turtle kueh: gods’ birthdays, sacrifices and elders’ birthdays, and given to relatives and friends when a child is born.' },
        ],
        glossary: [
          { term: '粿', termEn: 'Kueh (guo)', taiwanese: 'kué', taiwaneseSource: 'moe-guo', definition: '糕的總稱，指用糯米或粳米等做成的食品（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'A general term for cakes, meaning foods made from glutinous rice, japonica rice and the like (Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese).' },
          { term: '在來米', termEn: 'Long-grain rice (zai-lai rice)', definition: '臺灣傳統的蘿蔔糕、碗粿等所用的米（依農業部資料）。', definitionEn: 'The rice used for Taiwan’s traditional turnip cake, bowl kueh and the like (according to the Ministry of Agriculture).' },
          { term: '粿模', termEn: 'Kueh mould', definition: '用來製作紅龜粿與紅桃粿的模具，是早期農業社會居家常見的用具（國立臺灣歷史博物館）。', definitionEn: 'The mould used to make red turtle kueh and red peach kueh, a common household tool in the early agricultural society (National Museum of Taiwan History).' },
        ],
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moa-cao-guo', 'moa-niangao'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考資料',
        tabEn: 'References',
        title: '參考資料',
        titleEn: 'References',
        intro: '好粿緣與粿食文化的介紹整理自下列資料，點選即可開啟原始網頁。',
        introEn: 'The introduction to Haoguoyuan and kueh food culture is compiled from the sources below; select one to open the original web page.',
        sourceIds: [
          'taipei-market-info-yongle',
          'tcma-yongle-market',
          'moe-guo',
          'moe-cao-guo',
          'moe-hong-gui',
          'moe-cai-tau-guo',
          'moe-yu-guo-qiao',
          'nmth-hong-gui-mold',
          'moa-guo-rice',
          'moa-cao-guo',
          'moa-niangao',
        ],
        disclaimer:
          '本站沒有找到介紹好粿緣的新聞報導或店史資料；攤位品項依實地拍攝時的價目表與品名牌整理。3D 攤位依實地照片建模，商品為示意，並非實際陳列。',
        disclaimerEn:
          'This site has not found any news report or shop history about Haoguoyuan; the stall items follow the price list and item labels at the time of the on-site photographs. The 3D stall is modelled from on-site photographs, and the goods are illustrative, not the actual display.',
      },
    ],
  },

  {
    id: 'action-bar',
    name: '導演的豆花店 Action! Bar',
    nameEn: 'Action! Bar',
    status: 'open',
    year: 2021,
    yearLabel: '2021年（豆花車2019年登場）',
    yearLabelEn: '2021 (the douhua truck debuted in 2019)',
    yearNote: '2019年7月導演的豆花車登場；2021年豆花車延伸為迪化街巷內的實體店面（商工登記2021年3月12日核准設立）。',
    yearNoteEn: 'The Director’s Douhua Truck debuted in July 2019; in 2021 the truck grew into a physical shop in a Dihua Street lane (registered and approved on 12 March 2021 in the commercial registry).',
    category: '傳統豆花・紀錄片與兒童影像教育',
    categoryEn: 'Traditional douhua; documentary film and children’s media education',
    seal: '豆花',
    sealEn: 'Douhua',
    summary:
      '紀錄片導演何明瑞從公益豆花車出發，2021年在迪化街一段224巷落腳的「夢想基地」：一樓賣傳統豆花，也推廣兒童影像教育。',
    summaryEn:
      'Documentary director He Mingrui started with a charitable douhua truck and in 2021 settled at the “Dream Base” on Lane 224, Section 1, Dihua Street: the ground floor sells traditional douhua (tofu pudding), and the shop also promotes media education for children.',

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：迪化街南側的一個地段改成通往224巷的巷口，巷子往南延伸，
    // 店面在巷子東側、朝西面對巷子（建築與巷子見 builders/actionBar.js，店內見 actionBarInterior.js）。
    // position 為店內豆花櫃台的正面中央（互動點）；店門口就在巷子裡，可以直接走進店內。
    position: { x: 32.7, z: 23.45 },
    facing: 'west',
    // 店內只有約 4 公尺深：互動點在櫃台前 1.1 公尺
    interaction: { radius: 2.4, distance: 1.1 },
    // 從店家名錄前往時，鏡頭偏向店門口的方向（窄店裡不要正對櫃台後退）
    travelYawOffset: 0.35,
    // 巷口的基準點（建築本地座標原點：迪化街南側的立面線），以及這個巷口取代的一般地段
    site: { ...ACTION_BAR_SITE, replaces: [...ACTION_BAR_SITE.replaces] },
    building: { archetype: 'action-bar', width: 7, depth: 9 },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '導演的豆花店2021年在迪化街一段224巷開店，只出現在「老屋新生」。巷子與建築依實地照片建模，尺寸為估算；店內可以走進去，牆上的留言、兒童圖畫與獎項都是原創的示意內容。',
      revivalEn:
        'Action! Bar opened in 2021 on Lane 224, Section 1, Dihua Street, and appears only in “Old Houses, New Life”. The lane and building are modelled from on-site photographs, with estimated dimensions; you can walk into the shop, and the messages, children’s drawings and awards on the walls are original scenario illustrations.',
    },
    // 介紹的鏡頭從櫃台後方（老闆的位置）往店門看：前景是櫃台上的豆花，人物站在櫃台前，後面是兩側的展示牆
    camera: { distance: -1.55, height: 2.0, side: -0.7, lookHeight: 1.1 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'truck',
        type: 'text',
        tab: '豆花車',
        tabEn: 'The Douhua Truck',
        title: '第一章｜一台豆花車的誕生',
        titleEn: 'Chapter 1 | The Birth of a Douhua Truck',
        lead: '導演的豆花店的故事，從一台開往偏鄉的豆花車開始。',
        leadEn: 'The story of Action! Bar begins with a douhua truck bound for remote villages.',
        paragraphs: [
          '何明瑞是紀錄片導演。金門縣政府2019年的報導介紹他是「瑞齊傳播有限公司負責人、製作人」，從事影像工作近三十年，2019年入圍電視金鐘獎非戲劇類節目攝影獎；聯合報系《500輯》2024年的專文則記載，他和導演劉嵩合作拍攝《農村的遠見Ⅱ》、《南國啟示錄》，「兩度入圍金鐘獎最佳攝影」。',
          '同一篇專文寫道，何明瑞與《看見台灣》的導演齊柏林交情深厚，兩人相約「你在天上飛、我在地上跑」，一起投入影像教育。2017年齊柏林空拍飛機失事；何明瑞決心，「齊柏林永遠飛在天上，輪到自己實踐約定」。',
          '「2019年7月，導演的豆花車登場，這是何明瑞『地上跑』的影像教室。」每到一處偏鄉，他先帶小朋友手作豆花——從磨豆、煮豆漿到凝結，再加上小朋友找來的當地食材，做一碗自己家鄉的豆花；然後讓小朋友學習空拍機，從不同的角度看見家鄉。',
          '金門縣政府2019年12月報導，何明瑞以「導演的豆花車」巡迴金門的古寧國小，並進行「兒童影像記錄工作坊」，帶領師生三十人到戶外拍攝實作。臺北市商業處刊載的品牌故事這樣寫：「導演開著豆花車，深入偏鄉離島，帶著當地小學生，用赤心紀錄家園。」',
          '巷子裡停著的白色豆花車，是依實地照片簡化的示意模型；車身上的圖樣改成原創的場記板與攝影機圖示。',
        ],
        paragraphsEn: [
          'He Mingrui is a documentary director. A 2019 report by the Kinmen County Government introduces him as “head and producer of Ruiqi Communications Co., Ltd.”, someone who has worked in moving images for nearly thirty years and was nominated in 2019 for the Golden Bell Award for cinematography in a non-drama programme. A 2024 feature in the United Daily News group’s 500 Anthology records that, working with director Liu Song, he shot Vision of the Countryside II and Revelations of the Southern Land, and was “twice nominated for best cinematography at the Golden Bell Awards”.',
          'The same feature writes that He Mingrui was close to Chi Po-lin (齊柏林), director of Beyond Beauty: Taiwan from Above (《看見台灣》); the two agreed, “you fly in the sky, I run on the ground”, and devoted themselves together to media education. In 2017 Chi’s aerial-survey aircraft crashed; He Mingrui resolved that “Chi Po-lin will fly in the sky for ever, and it is my turn to keep our promise”.',
          '“In July 2019 the Director’s Douhua Truck made its debut, He Mingrui’s ‘run on the ground’ classroom for moving images.” In each remote village he first has the children make douhua by hand, from grinding the beans and cooking the soy milk to setting it, adding local ingredients the children have found, to make a bowl of douhua from their own hometown; then he lets the children learn to use a drone, to see their home from different angles.',
          'The Kinmen County Government reported in December 2019 that He Mingrui toured Guning Primary School in Kinmen with the “Director’s Douhua Truck” and held a “Children’s Media Recording Workshop”, leading thirty teachers and pupils on a hands-on shoot outdoors. The brand story published by the Taipei City Commerce Office puts it this way: “The director drives the douhua truck deep into remote villages and outlying islands, taking local primary-school pupils to record their home with sincere hearts.”',
          'The white douhua truck parked in the lane is a scenario model simplified from on-site photographs; the pattern on its body has been replaced with an original clapperboard and camera icon.',
        ],
        timeline: [
          { place: '2017', placeEn: '2017', text: '齊柏林空拍飛機失事；何明瑞決心實踐「你在天上飛、我在地上跑」的約定。', textEn: 'Chi Po-lin’s aerial-survey aircraft crashes; He Mingrui resolves to keep the promise “you fly in the sky, I run on the ground”.' },
          { place: '2019.7', placeEn: 'July 2019', text: '導演的豆花車登場，成為「地上跑」的影像教室。', textEn: 'The Director’s Douhua Truck makes its debut, becoming the “run on the ground” classroom for moving images.' },
          { place: '2019.12', placeEn: 'December 2019', text: '豆花車巡迴金門古寧國小，舉辦兒童影像記錄工作坊。', textEn: 'The truck tours Guning Primary School in Kinmen and holds a children’s media recording workshop.' },
          { place: '2021', placeEn: '2021', text: '豆花車延伸為迪化街巷內的豆花店。', textEn: 'The douhua truck grows into a douhua shop in a Dihua Street lane.' },
        ],
        facts: [
          { label: '創辦人', labelEn: 'Founder', value: '何明瑞（紀錄片導演）', valueEn: 'He Mingrui (documentary director)' },
          { label: '豆花車', labelEn: 'Douhua truck', value: '2019年7月登場', valueEn: 'Debuted in July 2019' },
          { label: '約定', labelEn: 'The promise', value: '「你在天上飛、我在地上跑」', valueEn: '“You fly in the sky, I run on the ground”' },
        ],
        sourceIds: ['udn-500-action-bar', 'kinmen-2019-douhua-truck', 'tcooc-action-bar'],
      },
      {
        id: 'base',
        type: 'text',
        tab: '夢想基地',
        tabEn: 'The Dream Base',
        title: '第二章｜夢想基地',
        titleEn: 'Chapter 2 | The Dream Base',
        lead: '2021年，「豆花車延伸為豆花店，在迪化街小巷裡，與夢想一同落腳」（臺北市商業處刊載的品牌故事）。',
        leadEn: 'In 2021 “the douhua truck grew into a douhua shop, settling in a small Dihua Street lane together with a dream” (brand story published by the Taipei City Commerce Office).',
        paragraphs: [
          '經濟部商工登記資料顯示，「導演的豆花店」在2021年（民國110年）3月12日核准設立，地址是臺北市大同區迪化街一段224巷24號1樓。',
          '《500輯》記載：「為了推廣影像教育，何明瑞在迪化街區創辦『夢想基地』，一樓就是豆花店。」店名原本是「夢想基地－導演的豆花店」。臺北市商業處的店家輕改造介紹寫道，店家「更名為『導演的豆花店Action! Bar』，品牌定位『稻埕夢想會客廳』」，口號是「來一碗真情實料, cut!」，店面也「以影像為主題重新設計布置，打造夢想基地」。',
          '兒童影像教育也持續進行。2025年《馬祖日報》報導，由「夢想基地-導演的豆花店」舉辦的兒童影像紀錄學習營「為公益性質，完全免費」，「每年暑期巡迴不同的偏鄉與離島」，那年7月移到馬祖，招收國小四至六年級的學童。',
          '《500輯》也記載，何明瑞延續空間提供者「財團法人台北市至善堂」的公益精神，每月送六百碗豆花給附近「讀好書、做好事」的國小學生，開幕三年已經送出一萬五千碗。',
          '場景中的店依實地照片建模：灰色洗石子的二層樓、騎樓下兩根圓形石柱、木作的入口，正面是藍白色的「導演的豆花店 ACTION! BAR」招牌，側邊突出一塊藍色的膠卷招牌。走進店裡，左牆是影像教育的展板、一排排懸掛的手寫留言本與裝框的獎項，右牆貼滿小朋友的畫。牆上的留言、圖畫與獎項都是原創的示意內容，並不是店內實際的作品、照片或獎項。',
        ],
        paragraphsEn: [
          'The Ministry of Economic Affairs’ commercial registry shows that “Director’s Douhua Shop” was approved for establishment on 12 March 2021 (ROC year 110), at 1F, No. 24, Lane 224, Section 1, Dihua Street, Datong District, Taipei.',
          'The 500 Anthology records: “To promote media education, He Mingrui founded the ‘Dream Base’ in the Dihua Street district, and the ground floor is the douhua shop.” The shop was originally named “Dream Base: Director’s Douhua Shop”. The Taipei City Commerce Office’s introduction to its light makeover of the shop writes that it was “renamed ‘Director’s Douhua Shop Action! Bar’, with the brand positioning ‘Dadaocheng Dream Salon’”; its slogan is “Come and have a bowl of honest ingredients, cut!”, and the shop front was “redesigned and decorated around the theme of moving images, creating the Dream Base”.',
          'Media education for children continues too. A 2025 report in the Matsu Daily says that the children’s video-recording learning camp run by “Dream Base: Director’s Douhua Shop” is “charitable and entirely free” and “tours different remote villages and outlying islands every summer”; that July it moved to Matsu, recruiting pupils in grades four to six of primary school.',
          'The 500 Anthology also records that, continuing the public-spirited approach of the space’s provider, the Taipei Zhishantang Foundation, He Mingrui gives six hundred bowls of douhua a month to nearby primary-school pupils who “read good books and do good deeds”; in the three years since opening, fifteen thousand bowls have been given away.',
          'The shop in the scene is modelled from on-site photographs: a two-storey building in grey washed-stone finish, two round stone pillars under the arcade, and a wooden entrance, with a blue-and-white “Director’s Douhua Shop ACTION! BAR” sign on the front and a blue film-strip sign projecting from the side. Inside, the left wall holds media-education display boards, rows of hanging handwritten message books and framed awards, and the right wall is covered with children’s drawings. The messages, drawings and awards on the walls are original scenario illustrations, not actual works, photographs or awards from the shop.',
        ],
        facts: [
          { label: '店名', labelEn: 'Shop name', value: '導演的豆花店 Action! Bar（原名「夢想基地－導演的豆花店」）', valueEn: 'Action! Bar (originally “Dream Base: Director’s Douhua Shop”)' },
          { label: '地址', labelEn: 'Address', value: '臺北市大同區迪化街一段224巷24號', valueEn: 'No. 24, Lane 224, Section 1, Dihua Street, Datong District, Taipei' },
          { label: '核准設立', labelEn: 'Approved for establishment', value: '2021年3月12日（經濟部商工登記）', valueEn: '12 March 2021 (Ministry of Economic Affairs commercial registry)' },
          { label: '品牌定位', labelEn: 'Brand positioning', value: '「稻埕夢想會客廳」', valueEn: '“Dadaocheng Dream Salon”' },
        ],
        sourceIds: ['gcis-action-bar', 'tcooc-action-bar', 'udn-500-action-bar', 'matsu-2025-action-bar-camp'],
      },
      {
        id: 'douhua',
        type: 'foods',
        tab: '一碗豆花',
        tabEn: 'A Bowl of Douhua',
        title: '第三章｜一碗豆花',
        titleEn: 'Chapter 3 | A Bowl of Douhua',
        intro:
          '「拍紀錄片求真求善，配料亦然。」（臺北市商業處刊載的品牌故事）依資料記載，店裡的豆花與配料都以天然食材手工製作。以下是一碗豆花裡的幾樣主角；食物說明整理自教育部《臺灣台語常用詞辭典》與農業部的資料。',
        introEn:
          '“A documentary seeks truth and goodness, and so do the toppings.” (brand story published by the Taipei City Commerce Office) According to the sources, the shop’s douhua and toppings are all handmade from natural ingredients. Below are a few of the stars of a bowl of douhua; the food descriptions are compiled from the Ministry of Education’s Dictionary of Frequently-Used Taiwan Taiwanese and Ministry of Agriculture materials.',
        items: [
          {
            id: 'douhua',
            name: '傳統豆花',
            nameEn: 'Traditional douhua (tofu pudding)',
            category: '黃豆｜鹽滷',
            categoryEn: 'Soybeans | Bittern',
            description: '在豆漿中加入少量的鹽滷或石膏，凝結成比豆腐還嫩的食品，通常加糖水和花生，當作甜食（教育部辭典）。',
            descriptionEn: 'A food made by adding a little bittern or gypsum to soy milk so that it sets more tenderly than tofu; it is usually served with syrup and peanuts as a sweet dish (Ministry of Education dictionary).',
            note: '《500輯》記載，何明瑞向大溪豆乾老店學來用鹽滷製作豆花的傳統方法，並用美國有機黃豆製作豆花。',
            noteEn: 'The 500 Anthology records that He Mingrui learned the traditional bittern method of making douhua from an old dried-tofu shop in Daxi, and makes the douhua with American organic soybeans.',
          },
          {
            id: 'maltose-syrup',
            name: '麥芽糖水',
            nameEn: 'Maltose syrup',
            category: '麥芽糖｜糖水',
            categoryEn: 'Maltose | Syrup',
            description: '麥芽糖（台語「麥芽膏」）是由含澱粉酶的麥芽使澱粉水解而成、金黃色有黏性的糖；調成糖水淋在豆花上。',
            descriptionEn: 'Maltose (called “be-gê-ko” in Taiwanese) is a golden, sticky sugar made when malt containing amylase breaks starch down; it is made into a syrup and poured over the douhua.',
            note: '臺北市商業處刊載的品牌故事寫道，店裡的配料「重現導演童年回憶裡的麥芽糖水」。',
            noteEn: 'The brand story published by the Taipei City Commerce Office writes that the shop’s toppings “recreate the maltose syrup of the director’s childhood memories”.',
          },
          {
            id: 'sweet-potato-balls',
            name: '地瓜粉圓',
            nameEn: 'Sweet-potato tapioca-style balls (fen-yuan)',
            category: '地瓜・芋頭｜粉圓',
            categoryEn: 'Sweet potato and taro | Fen-yuan balls',
            description: '粉圓是用番薯粉和紅糖做成的圓形食品，煮熟後變透明，夏天可以涼食、冬天可以熱食（教育部辭典）。',
            descriptionEn: 'Fen-yuan are round foods made from sweet-potato starch and brown sugar that turn translucent when cooked and can be eaten cold in summer or hot in winter (Ministry of Education dictionary).',
            note: '《500輯》記載，店裡「用地瓜和芋頭製作粉圓」，配料每天新鮮製作。',
            noteEn: 'The 500 Anthology records that the shop “makes fen-yuan from sweet potato and taro”, with the toppings made fresh every day.',
          },
          {
            id: 'fen-guo',
            name: '粉粿',
            nameEn: 'Fen-guo (starch kueh)',
            category: '山梔子｜粿',
            categoryEn: 'Gardenia | Kueh',
            description: '用番薯粉等澱粉做成的粿類食品（教育部辭典）。農業部的資料說明，粉粿黃黃的顏色來自天然色素「山梔子」，又名黃梔。',
            descriptionEn: 'A kueh-type food made from starches such as sweet-potato starch (Ministry of Education dictionary). Ministry of Agriculture material explains that the yellow colour of fen-guo comes from the natural pigment of the gardenia (shan-zhi-zi, also called huang-zhi).',
            note: '《500輯》記載，店裡用「山梔子製作粉粿」；商業處的介紹也提到「山梔子粉粿」。',
            noteEn: 'The 500 Anthology records that the shop makes fen-guo “with gardenia”; the Commerce Office’s introduction also mentions “gardenia fen-guo”.',
          },
          {
            id: 'red-green-beans',
            name: '紅豆・綠豆',
            nameEn: 'Red beans and mung beans',
            category: '豆類｜傳統配料',
            categoryEn: 'Beans | Traditional toppings',
            description: '煮到鬆軟、帶著甜味的紅豆與綠豆，是豆花和剉冰常見的傳統配料。',
            descriptionEn: 'Red beans and mung beans cooked until soft and lightly sweet are traditional toppings for douhua and shaved ice.',
            note: '《500輯》描寫在店裡吃到的是「白嫩豆花搭配甜蜜紅豆及軟彈粉粿」。',
            noteEn: 'The 500 Anthology describes what is eaten in the shop as “tender white douhua with sweet red beans and soft, springy fen-guo”.',
          },
        ],
        footnote: '標示「文獻小記」的內容整理自所列資料；其餘為一般介紹，並非店家的配方。實際供應的配料以店家為準。',
        footnoteEn: 'Content labelled “Source Notes” is compiled from the sources listed; the rest is general introduction, not the shop’s recipes. The toppings actually served are as the shop offers them.',
        sourceIds: ['moe-douhua', 'moe-maltose', 'moe-fun-inn', 'moe-fun-kue', 'moa-douhua-gel', 'moa-ice-toppings', 'udn-500-action-bar', 'tcooc-action-bar'],
      },
      {
        id: 'film',
        type: 'text',
        tab: '影像記錄',
        tabEn: 'Recording with Film',
        title: '第四章｜用影像記錄臺灣',
        titleEn: 'Chapter 4 | Recording Taiwan on Film',
        lead: '「拍攝影像為了『看見』、製作豆花為了『吃到』」——何明瑞說，看到或吃到，都是人用感官和世界連結的方法（《500輯》）。',
        leadEn: '“We shoot images in order to ‘see’, and make douhua in order to ‘taste’”: He Mingrui says that seeing and tasting are both ways in which people connect with the world through the senses (500 Anthology).',
        paragraphs: [
          '影像教育：《馬祖日報》報導，學習營由何明瑞導演講述故事的構成、影像拍攝、剪輯方法與技巧，讓孩子學習利用影像傳達故事內容，「透過實作與紀錄，學習如何用影像捕捉生活、表達自我」。報導也寫道，他「透過豆花的飲食、體驗、教學，再由影像紀錄學習營培育影像紀錄人才」。',
          '地方關懷：金門縣政府的報導記載，何明瑞曾在金門拍攝《鞠。麴》金門產業文創紀錄片；《500輯》描寫，在豆花店裡，一邊吃豆花，一邊可以看著現場播放、何明瑞「以十年時間完成的金門輦轎紀錄片」。',
          '電影文化：店名裡的「Action!」是開拍時的口令，口號「來一碗真情實料, cut!」的「cut」則是喊停的口令。臺北市商業處記載，店家的品牌識別與店面「以影像為主題重新設計布置」——場景裡的場記板、攝影機、膠卷招牌與影像展板，都是依實地照片做成的示意道具。',
          '請注意：牆上的獎項框、留言本與兒童圖畫都是原創的示意圖樣，不代表任何實際的獎項、影展或個人作品。何明瑞的獎項，本站只採用報導中可以查證的「入圍金鐘獎」紀錄。',
        ],
        paragraphsEn: [
          'Media education: the Matsu Daily reports that in the learning camp director He Mingrui talks about how a story is constructed, filming and editing methods and techniques, so that children learn to use moving images to convey a story, “learning through hands-on practice and recording how to capture life and express themselves in images”. The report also writes that he “trains talent in video recording through the eating, experience and teaching of douhua, followed by the video-recording learning camp”.',
          'Care for local communities: the Kinmen County Government’s report records that He Mingrui shot the Kinmen industry and cultural-creative documentary Ju. Qu (《鞠。麴》) in Kinmen; the 500 Anthology describes how, in the douhua shop, one can eat douhua while watching, played on the spot, He Mingrui’s “documentary on Kinmen sedan chairs, completed over ten years”.',
          'Film culture: the “Action!” in the shop’s name is the command given when filming begins, while the “cut” in the slogan “Come and have a bowl of honest ingredients, cut!” is the command to stop. The Taipei City Commerce Office records that the shop’s brand identity and shop front were “redesigned and decorated around the theme of moving images”; the clapperboard, cameras, film-strip sign and display boards in the scene are all scenario props made from on-site photographs.',
          'Please note: the award frames, message books and children’s drawings on the walls are original scenario illustrations and do not represent any actual award, film festival or individual work. As for He Mingrui’s awards, this site uses only the verifiable record of Golden Bell Award nominations given in the reports.',
        ],
        glossary: [
          { term: 'Action!', termEn: 'Action!', definition: '電影或電視拍攝時，導演喊「開拍」的口令。', definitionEn: 'The command a director calls to start shooting a film or television scene.' },
          { term: 'Cut!', termEn: 'Cut!', definition: '導演喊「停」、結束這一個鏡頭的口令。', definitionEn: 'The command a director calls to stop and end the current shot.' },
          { term: '場記板', termEn: 'Clapperboard', definition: '拍攝前在鏡頭前打板的板子，寫著片名、場次與鏡次，拍板聲也用來對齊畫面與聲音。', definitionEn: 'The board clapped in front of the camera before a take, marked with the film title, scene and take numbers; the clap is also used to line up picture and sound.' },
          { term: '空拍機', termEn: 'Drone', definition: '可以遙控飛行、從空中拍攝的無人機；豆花車的影像教室用它帶孩子從不同角度看家鄉。', definitionEn: 'An unmanned aircraft flown by remote control that films from the air; the douhua truck’s moving-image classroom uses it to let children see their home from different angles.' },
        ],
        sourceIds: ['matsu-2025-action-bar-camp', 'kinmen-2019-douhua-truck', 'udn-500-action-bar', 'tcooc-action-bar'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        tabEn: 'References',
        title: '第五章｜參考文獻',
        titleEn: 'Chapter 5 | References',
        intro: '導演的豆花店與豆花文化的介紹整理自下列資料，點選即可開啟原始網頁。',
        introEn: 'The introduction to Action! Bar and douhua culture is compiled from the sources below; select one to open the original web page.',
        sourceIds: [
          'tcooc-action-bar',
          'gcis-action-bar',
          'udn-500-action-bar',
          'kinmen-2019-douhua-truck',
          'matsu-2025-action-bar-camp',
          'moe-douhua',
          'moe-maltose',
          'moe-fun-inn',
          'moe-fun-kue',
          'moa-douhua-gel',
          'moa-ice-toppings',
        ],
        disclaimer:
          '店面、巷子與豆花車的 3D 模型依實地照片建模，尺寸與比例為估算；店內的留言本、兒童圖畫、獎項框與展板都是原創的示意內容，並非店內實際的作品、照片、獎項或影展標誌。本站沒有查證建築的興建年代，也不列出營業時間與價格。',
        disclaimerEn:
          'The 3D models of the shop, the lane and the douhua truck are built from on-site photographs, with estimated dimensions and proportions; the message books, children’s drawings, award frames and display boards inside are original scenario illustrations, not actual works, photographs, awards or film-festival logos from the shop. This site has not verified when the building was constructed, and does not list opening hours or prices.',
      },
    ],
  },
  {
    id: 'huang-yujie-museum',
    name: '黃玉階文史館',
    nameEn: 'Huang Yujie Museum of Culture and History',
    // 文化據點（文化展示／歷史街屋）：不是餐廳，沒有點餐或食物圖鑑
    kind: MUSEUM_RECORD.kind,
    status: 'open',
    // 老屋的興建年與文史館的開館日都未核實：留空（不以黃玉階的遷居年份或協會的登記日代替）
    year: null,
    yearLabel: '',
    yearLabelEn: '',
    yearNote: '老屋的興建年、文史館的開館日、詳細門牌與開放時間都未核實，資料留空。歷史商號「元珍豆醬店」的說法見《人間福報》2026年的文章。',
    yearNoteEn: 'The year the old house was built, the museum’s opening date, its full street number and its opening hours have not been verified, so these entries are left blank. The claim about the historic business “Yuanzhen Bean Sauce Shop” comes from a 2026 article in Merit Times (《人間福報》).',
    category: '文化據點｜文化展示・歷史街屋',
    categoryEn: 'Cultural site | Cultural exhibition and historic shophouse',
    seal: '文史',
    sealEn: 'Museum',
    summary: '紅磚拱窗的二層街屋，百年前是黃玉階的元珍豆醬店，如今是黃玉階文史館：保留老屋的木梁，展示醬缸、商號器物與大稻埕的人物、社會改革與教育史。',
    summaryEn: 'A two-storey red-brick shophouse with arched windows. A century ago it was Huang Yujie’s Yuanzhen Bean Sauce Shop; today it is the Huang Yujie Museum of Culture and History, which keeps the old timber beams and displays soy-sauce jars, objects from the shop and the history of Dadaocheng’s people, social reform and education.',
    sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie'],
    hasInterior: true,

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：224巷東側、導演的豆花店的北鄰（從巷子看是豆花店的左邊），依豆花店的位置、朝向與面寬定位。
    // 位置、入口、展間配置、資訊熱點與鏡頭都在 data/huangYujieLayout.js（外觀見 builders/huangYujieExterior.js，展間見 huangYujieInterior.js）。
    // position 為騎樓下的入口前；從店家名錄前往時站在騎樓下、面向大門，再自己走進去。
    position: museumToWorld(HUANG_YUJIE_HOTSPOTS[0].point[0], 0),
    facing: 'west',
    // 店面朝西（巷子）；入口前的互動點在騎樓裡，也就是立面線往室內 0.95 m（距離為負）
    interaction: { radius: 1.0, distance: HUANG_YUJIE_HOTSPOTS[0].point[1] },
    travelYawOffset: 0.4,
    site: { ...MUSEUM_SITE },
    building: { archetype: 'huang-yujie-museum', width: MUSEUM.half * 2, depth: -MUSEUM.back },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '黃玉階文史館只出現在「老屋新生」（2000–現在）。外觀與一樓展間依使用者提供的實地照片建模（尺寸為估算），一樓可以走進去，二樓只做外觀。館內可以讀到清末與日治的歷史，但現代的展板、協會與設備不會出現在其他年代；本站也沒有替其他年代另外做歷史版本。',
      revivalEn:
        'The Huang Yujie Museum of Culture and History appears only in “Old Houses, New Life” (2000–present). The exterior and the ground-floor gallery are modelled from on-site photographs supplied by the user (dimensions are estimates). The ground floor can be entered; the upper floor is modelled as exterior only. Inside, you can read about the late Qing and Japanese periods, but the modern display panels, association and equipment do not appear in other eras, and this site has not made separate historical versions for other eras.',
    },
    // 從店家名錄開啟介紹：在巷子裡斜看紅磚立面、拱窗與騎樓
    camera: { distance: 3.4, height: 1.8, side: -1.3, lookHeight: 3.5 },
    hotspots: hotspotsToWorld(HUANG_YUJIE_HOTSPOTS, museumToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'museum',
        type: 'text',
        tab: '場館與老屋',
        tabEn: 'The Museum and the Old House',
        title: '黃玉階文史館｜元珍豆醬店',
        titleEn: 'Huang Yujie Museum of Culture and History | Yuanzhen Bean Sauce Shop',
        lead: '224巷裡一棟紅磚拱窗的二層街屋：百年前的「元珍豆醬店」，如今是黃玉階文史館（《人間福報》2026年的文章）。',
        leadEn: 'A two-storey red-brick shophouse with arched windows in Lane 224: a century ago the “Yuanzhen Bean Sauce Shop” (元珍豆醬店), today the Huang Yujie Museum of Culture and History (from a 2026 article in Merit Times).',
        summary: {
          text: '文史館保留老屋的紅磚立面與裸露的木梁，一樓展示陶醬缸、舊商號的器物，以及黃玉階的生平、日治初期的社會改革與大稻埕的教育史。站在巷子裡正對立面時，左邊是文史館、右邊是導演的豆花店，兩棟的騎樓由拱門相連。老屋的興建年、開館日與開放時間尚未核實。',
          textEn: 'The museum keeps the old house’s red-brick façade and exposed timber beams. The ground floor displays ceramic sauce jars and objects from the old shop, together with Huang Yujie’s life, the social reforms of the early Japanese period and the history of education in Dadaocheng. Standing in the lane facing the façade, the museum is on the left and the Action! Bar is on the right; the arcades of the two buildings are joined by an arch. The year the house was built, the opening date and the opening hours have not yet been verified.',
        },
        paragraphs: [
          '場館與商號分開看｜「黃玉階文史館」是現代的文化展示空間；「元珍豆醬店」是這棟老屋過去的商號。《人間福報》的文章寫到，門口掛著「元珍」與「源珍」兩塊招牌，地方耆老說的是「源珍」，帳冊上寫的是「元珍」。場景照原樣保留兩塊匾額，不把兩種寫法改成同一種。',
          '外觀（依使用者照片）｜二樓三組拱形窗，中央較寬、兩側較窄，拱頂是放射狀的磚紋，窗間是四道磚柱（文章的圖說稱為「三窗四柱」）；窗下中央是黑底金字、由右往左讀的「元珍」匾額，左右兩塊有淺色邊框的彩色陶飾板。一樓兩根紅磚圓柱、灰色柱頭，後面是退縮的木造門面，門前是木質花槽。',
          '老屋的構造｜騎樓與展間的頂部都露出深褐色的木梁與木板，色澤不均、有剝落的痕跡，也看得到修補過的木料與金屬固定構件（照片觀察）。點天花的木梁可以近看。',
          '尚未核實的資料｜老屋的興建年、文史館的開館日、詳細門牌、開放時間與營運單位都沒有查到可靠的資料，所以留空；本站不以黃玉階遷居大稻埕的年份或其他組織的登記日期代替。',
        ],
        paragraphsEn: [
          'The museum and the shop, seen separately | The Huang Yujie Museum of Culture and History is a modern cultural exhibition space; the Yuanzhen Bean Sauce Shop was the business that once occupied this old house. The Merit Times article says that two signs hang at the door, reading “元珍” and “源珍” (both pronounced Yuanzhen): local elders say “源珍”, while the account books write “元珍”. The scene keeps both plaques as they are and does not merge the two spellings into one.',
          'The exterior (from the user’s photographs) | The second floor has three arched windows, the central one wider and the two at the sides narrower, with radiating brickwork in the arches and four brick piers between the windows (the article’s caption calls this “three windows, four piers”). Under the windows, at the centre, is a black plaque with gold characters reading “元珍” from right to left, flanked by two coloured ceramic panels with pale borders. On the ground floor are two round red-brick columns with grey capitals, behind which is a recessed timber frontage with a wooden planter in front of it.',
          'The structure of the old house | Dark brown timber beams and boards are exposed in the roofs of both the arcade and the gallery. Their colour is uneven and shows signs of flaking, and repaired timber and metal fixings can also be seen (photographic observation). You can take a closer look at the ceiling beams.',
          'Information not yet verified | No reliable sources have been found for the year the old house was built, the museum’s opening date, its full street number, its opening hours or its operator, so these are left blank. This site does not substitute the year Huang Yujie moved to Dadaocheng or the registration date of another organisation.',
        ],
        facts: [
          { label: '場館', labelEn: 'Museum', value: '黃玉階文史館（文化展示／歷史街屋）', valueEn: 'Huang Yujie Museum of Culture and History (cultural exhibition / historic shophouse)' },
          { label: '歷史商號', labelEn: 'Historic business', value: '元珍豆醬店（另有「源珍」的說法）', valueEn: 'Yuanzhen Bean Sauce Shop (also given as “源珍”)' },
          { label: '位置', labelEn: 'Location', value: '迪化街一段224巷，導演的豆花店北鄰（依照片）；門牌未核實', valueEn: 'Lane 224, Section 1, Dihua Street, next door to the north of the Action! Bar (from photographs); street number not verified' },
          { label: '興建年／開館日', labelEn: 'Year built / opening date', value: '未核實（留空）', valueEn: 'Not verified (left blank)' },
        ],
        lists: [
          { title: '使用者照片觀察', titleEn: 'Observations from the user’s photographs', kind: 'observation', items: PHOTO_OBSERVATIONS.filter((o) => ['neighbour', 'facade', 'columns', 'arcade', 'beams'].includes(o.id)).map((o) => o.text), itemsEn: PHOTO_OBSERVATIONS.filter((o) => ['neighbour', 'facade', 'columns', 'arcade', 'beams'].includes(o.id)).map((o) => o.textEn) },
          { title: '3D 場景的情境設計', titleEn: 'Scenario design of the 3D scene', kind: 'scenario', items: SCENARIO_DESIGN.filter((o) => ['size', 'ceramics', 'omitted', 'upstairs'].includes(o.id)).map((o) => o.text), itemsEn: SCENARIO_DESIGN.filter((o) => ['size', 'ceramics', 'omitted', 'upstairs'].includes(o.id)).map((o) => o.textEn) },
        ],
        sourceIds: ['merit-2026-huang-yujie'],
      },
      {
        id: 'huang',
        type: 'text',
        tab: '黃玉階與大稻埕',
        tabEn: 'Huang Yujie and Dadaocheng',
        title: 'A｜黃玉階與大稻埕',
        titleEn: 'A | Huang Yujie and Dadaocheng',
        lead: '一位經營醬菜坊、也行醫的大稻埕仕紳。',
        leadEn: 'A Dadaocheng gentleman who ran a pickle workshop and also practised medicine.',
        summary: {
          text: '黃玉階（1850–1918）生於彰化大肚堡，1882年遷居大稻埕，經營醬菜坊，也以漢醫行醫。日治初期霍亂、鼠疫流行時，他奔走救治、不收謝禮，並取得官方核發的醫生執照（有1897、1901年兩種記載）。1900–1917年任大稻埕區長。',
          textEn: 'Huang Yujie (1850–1918) was born in Dadu Bao, Changhua, and moved to Dadaocheng in 1882, where he ran a pickle workshop and also practised Chinese medicine. During the cholera and plague epidemics of the early Japanese period he worked tirelessly to treat patients without accepting thanks gifts, and obtained an officially issued physician’s licence (sources give two years, 1897 and 1901). From 1900 to 1917 he served as head of the Dadaocheng district.',
        },
        paragraphs: [
          '本章是本站依國家文化記憶庫（國家中醫藥研究所建檔）與國家圖書館「臺灣記憶」整理的摘要，不是館方展板的原文。',
          '醫療的記載是歷史資料：它說明黃玉階在疫病流行時的角色，不代表任何療法在今天的效果，本站也不提供任何藥方或配方。',
          '館內的人物展示牆有肖像看板、醫療公衛與社會參與的說明與裝框的文件（照片觀察）；後牆掛著「學貫中西」匾額與人體解剖圖（《人間福報》的文章也寫到）。場景中的看板只做版面示意，不重製照片中的肖像與文件。',
        ],
        paragraphsEn: [
          'This chapter is a summary compiled by this site from the National Cultural Memory Bank (records held by the National Research Institute of Chinese Medicine) and the National Central Library’s “Taiwan Memory”; it is not the text of the museum’s display panels.',
          'The medical accounts are historical records: they describe Huang Yujie’s role during epidemics and say nothing about the effectiveness of any treatment today. This site does not provide any prescription or formula.',
          'The display wall on Huang Yujie inside the museum has a portrait panel, explanations of his work in medicine, public health and social engagement, and framed documents (photographic observation). On the back wall hang a plaque reading “學貫中西” (“learned in both Chinese and Western knowledge”) and an anatomical chart of the human body (also mentioned in the Merit Times article). The panels in the scene are layout illustrations only and do not reproduce the portraits and documents in the photographs.',
        ],
        timeline: [
          { place: '1850', placeEn: '1850', text: '生於彰化大肚堡五汊港（今臺中市梧棲區）。', textEn: 'Born at Wucha Port, Dadu Bao, Changhua (now Wuqi District, Taichung).' },
          { place: '1882', placeEn: '1882', text: '遷居大稻埕，經營醬菜坊並行醫。', textEn: 'Moved to Dadaocheng, ran a pickle workshop and practised medicine.' },
          { place: '1897／1901', placeEn: '1897 / 1901', text: '取得官方核發的醫生執照（兩種記載）。', textEn: 'Obtained an officially issued physician’s licence (two accounts).' },
          { place: '1900–1917', placeEn: '1900–1917', text: '擔任大稻埕區長。', textEn: 'Served as head of the Dadaocheng district.' },
          { place: '1918', placeEn: '1918', text: '逝世。', textEn: 'Died.' },
        ],
        facts: [
          { label: '生卒', labelEn: 'Life dates', value: '1850–1918', valueEn: '1850–1918' },
          { label: '遷居大稻埕', labelEn: 'Moved to Dadaocheng', value: '1882年（光緒八年）', valueEn: '1882 (the 8th year of the Guangxu reign)' },
          { label: '行業', labelEn: 'Trades', value: '醬菜業（醬菜坊）、漢醫', valueEn: 'Pickle trade (pickle workshop); Chinese medicine' },
          { label: '執照年份', labelEn: 'Licence year', value: '1897年（臺灣記憶）／1901年（國家文化記憶庫）', valueEn: '1897 (Taiwan Memory) / 1901 (National Cultural Memory Bank)' },
        ],
        sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie', 'merit-2026-huang-yujie'],
      },
      {
        id: 'yuanzhen',
        type: 'text',
        tab: '元珍豆醬店',
        tabEn: 'Yuanzhen Bean Sauce Shop',
        title: 'B｜元珍豆醬店與飲食生活',
        titleEn: 'B | The Yuanzhen Bean Sauce Shop and Food Life',
        lead: '醬缸、包裝與商號名稱，留下了一家醬料商號的記憶。',
        leadEn: 'Sauce jars, packaging and the names on the signs preserve the memory of a sauce merchant.',
        summary: {
          text: '國家文化記憶庫與臺灣記憶都記載黃玉階經營醬菜業。《人間福報》2026年的文章寫到，百年前的「元珍豆醬店」如今是黃玉階文史館，門口掛著「元珍」與「源珍」兩塊招牌：耆老口述稱「源珍」，帳冊寫「元珍」。館內的醬缸與陳設留下醬料商號的記憶。',
          textEn: 'Both the National Cultural Memory Bank and Taiwan Memory record that Huang Yujie ran a pickle business. A 2026 article in Merit Times says that the “Yuanzhen Bean Sauce Shop” of a century ago is now the Huang Yujie Museum of Culture and History, with two signs at the door reading “元珍” and “源珍”: elders’ oral accounts say “源珍”, while the account books write “元珍”. The sauce jars and furnishings inside preserve the memory of a sauce merchant.',
        },
        paragraphs: [
          '兩種名稱｜二樓窗下的黑底金字匾額是「元珍」，騎樓斜掛的綠色匾額與室內的布旗是「源珍」（照片觀察）。兩種寫法都出自同一篇文章的記載，本站照原樣保留，沒有自動改成同一種。',
          '醬缸與陳列（照片觀察）｜入口一側與右前方的陳列區擺著深褐色的陶醬缸，有的加木蓋、有的用紅布或麻布封口，缸身貼著「醬」「醋」的紅色菱形紙；陳列區的木架上掛著秤與繩索，地上靠著大型竹篩。場景中的醬缸是展示物的示意。',
          '本站沒有查到的事｜商號的創立年、配方、販售過的產品與醬缸的確切年代都沒有可靠的資料，所以不寫；場景也沒有點餐或販售的功能。',
        ],
        paragraphsEn: [
          'Two names | The black plaque with gold characters under the second-floor window reads “元珍”; the green plaque hanging at an angle in the arcade and the cloth banner inside read “源珍” (photographic observation). Both spellings come from the same article, and this site keeps them as they are rather than automatically changing them to one.',
          'Sauce jars and displays (photographic observation) | Dark brown ceramic sauce jars stand at one side of the entrance and in the display area at the front right; some have wooden lids, others are sealed with red or hessian cloth, and the jars carry red diamond-shaped paper labels reading “醬” (soy sauce) and “醋” (vinegar). On the wooden shelves of the display area hang steelyards and ropes, and large bamboo sieves lean against the floor. The jars in the scene are illustrative stand-ins for the exhibits.',
          'What this site has not found | No reliable sources exist for the year the shop was founded, its recipes, the products it sold or the exact age of the jars, so none of these is stated; the scene also has no ordering or selling function.',
        ],
        facts: [
          { label: '商號', labelEn: 'Business', value: '元珍豆醬店（「源珍」為另一種說法）', valueEn: 'Yuanzhen Bean Sauce Shop (“源珍” is an alternative version)' },
          { label: '行業', labelEn: 'Trade', value: '醬菜業（國家文化記憶庫、臺灣記憶）', valueEn: 'Pickle trade (National Cultural Memory Bank, Taiwan Memory)' },
          { label: '創立年', labelEn: 'Year founded', value: '未核實（留空）', valueEn: 'Not verified (left blank)' },
        ],
        sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie'],
      },
      {
        id: 'reform',
        type: 'text',
        tab: '社會改革與教育',
        tabEn: 'Social Reform and Education',
        title: 'C｜社會改革與初等教育',
        titleEn: 'C | Social Reform and Elementary Education',
        lead: '放足、斷髮與新式學校：日治初期大稻埕的變化。',
        leadEn: 'Unbinding feet, cutting queues and new-style schools: changes in Dadaocheng in the early Japanese period.',
        summary: {
          text: '日治初期，纏足與辮髮成為社會改革的議題；臺灣記憶記載，黃玉階被推為臺北天然足會與斷髮不改裝會的會長。館內有「日治初期大稻埕的初等教育發展」展板（照片觀察）。依中研院臺史所整理，1898年國語傳習所改為公學校與小學校，1941年改稱國民學校。',
          textEn: 'In the early Japanese period, foot-binding and the queue became issues of social reform; Taiwan Memory records that Huang Yujie was chosen as president of the Taipei Natural Foot Society and the Queue-Cutting Society (which did not require a change of dress). The museum has a panel on “The Development of Elementary Education in Dadaocheng in the Early Japanese Period” (photographic observation). According to the Institute of Taiwan History, Academia Sinica, in 1898 the national-language training institutes were reorganised into public schools and elementary schools, and in 1941 these were renamed national schools.',
        },
        paragraphs: [
          '本章是本站整理的延伸說明，不是館方展板的原文。展板上的小字在場景中只做版面示意（標題、年代軸、段落、圖片與城市剪影）；點選展板可以閱讀這一章的文字。',
          '教育制度的背景｜中研院臺史所檔案館把日治時期的初等教育分成三個時期：1895–1922年日臺分離、1922–1941年日臺共學制、1941–1945年國民學校時期。領臺之初先設國語傳習所，1898年改為收臺籍兒童的公學校與收日籍兒童的小學校。',
          '館內有教育主題的展覽，不代表這棟建築以前是學校；展板上的校名與年份本站沒有逐一核對，因此不轉載。',
        ],
        paragraphsEn: [
          'This chapter is an extended explanation compiled by this site; it is not the text of the museum’s display panels. The small print on the panels is shown in the scene as layout illustration only (a title, a timeline, paragraphs, pictures and a city silhouette); select a panel to read the text of this chapter.',
          'Background on the education system | The Archives of the Institute of Taiwan History, Academia Sinica, divide elementary education in the Japanese period into three phases: 1895–1922, with separate schooling for Japanese and Taiwanese children; 1922–1941, with joint schooling; and 1941–1945, the national school period. At the start of Japanese rule, national-language training institutes were set up first; in 1898 they were reorganised into public schools for Taiwanese children and elementary schools for Japanese children.',
          'An exhibition on education inside the museum does not mean this building was once a school. This site has not checked the school names and years on the panels one by one, and therefore does not reproduce them.',
        ],
        glossary: [
          { term: '國語傳習所', termEn: 'National-language training institute', definition: '日治初期教臺灣人學日語的學校，1898年改為公學校（中研院臺史所）。', definitionEn: 'A school in the early Japanese period that taught Taiwanese people the Japanese language; in 1898 it was reorganised as the public school (Institute of Taiwan History, Academia Sinica).' },
          { term: '公學校', termEn: 'Public school (gongxuexiao)', definition: '日治時期收臺籍兒童的初等學校；日籍兒童讀小學校（中研院臺史所）。', definitionEn: 'An elementary school for Taiwanese children in the Japanese period; Japanese children attended the elementary school (shogakko) instead (Institute of Taiwan History, Academia Sinica).' },
          { term: '放足', termEn: 'Foot unbinding', definition: '解開纏足，讓女子的腳自然生長。', definitionEn: 'Removing the bindings from bound feet so that women’s feet could grow naturally.' },
          { term: '斷髮不改裝', termEn: 'Queue-cutting without change of dress', definition: '剪去辮髮、但不必改穿和服或西服的主張。', definitionEn: 'The position that men should cut off the queue but need not change to kimono or Western dress.' },
        ],
        lists: [
          { title: '待核實', titleEn: 'To be verified', kind: 'pending', items: PENDING.filter((p) => ['girls-school', 'board-schools'].includes(p.id)).map((p) => `${p.field}：${p.note}`), itemsEn: PENDING.filter((p) => ['girls-school', 'board-schools'].includes(p.id)).map((p) => `${p.fieldEn}: ${p.noteEn}`) },
        ],
        sourceIds: ['ncl-huang-yujie', 'tcmb-huang-yujie', 'ith-primary-education'],
      },
      {
        id: 'objects',
        type: 'text',
        tab: '日常器物',
        tabEn: 'Everyday Objects',
        title: '日常器物與商號生活',
        titleEn: 'Everyday Objects and Life in a Shop',
        lead: '層架上的包裝、提籃與茶具，把舊商號的日常帶進老屋裡。',
        leadEn: 'Packaging, baskets and tea sets on the shelves bring the everyday life of an old shop into the house.',
        summary: {
          label: '使用者照片觀察',
          labelEn: 'Observations from the user’s photographs',
          text: '展間右側是高到天花的深色木製層架：牛皮紙包裝與紅紙封條、竹編與藤編提籃、綁紅繩的小陶甕、茶具與鍋具、便當提盒、書籍、舊式電視與玻璃燈具。後方的茶席在圓形竹托盤上擺著黑色茶壺與杯底朝上的茶杯，上方掛著紅色紋樣的布旗。',
          textEn: 'On the right of the gallery are dark timber shelves rising to the ceiling, holding kraft-paper packages with red paper seals, bamboo and rattan baskets, small ceramic jars tied with red cord, tea sets and cooking pots, tiered lunch boxes, books, an old-style television and glass lamps. At the back, a tea table has a black teapot and upturned teacups on a round bamboo tray, with a cloth banner with a red pattern hanging above.',
        },
        paragraphs: [
          '這些器物是文史館的陳設，用來呈現舊商號與日常生活的氣氛。本站沒有查證每一件器物的年代與來歷，所以不寫成某個年代的文物。',
          '場景中的層架、器物與茶具是依照片簡化的示意，不是館藏的複製；每一層的擺設各不相同，但數量與細節做了精簡。',
        ],
        paragraphsEn: [
          'These objects are part of the museum’s display and evoke the atmosphere of an old shop and everyday life. This site has not verified the date or provenance of each object, so none is described as an artefact of a particular period.',
          'The shelves, objects and tea sets in the scene are simplified illustrations based on photographs, not copies of the museum’s collection; each shelf is arranged differently, but the quantity and detail have been reduced.',
        ],
        sourceIds: ['merit-2026-huang-yujie'],
      },
      {
        id: 'association',
        type: 'text',
        tab: '相關組織資料',
        tabEn: 'Related Organisation',
        title: 'D｜相關組織資料：社團法人臺灣文化事業發展協會',
        titleEn: 'D | Related Organisation: Taiwan Cultural Development Association',
        lead: '以公開的法院公告為準；與文史館的關係尚待核實。',
        leadEn: 'Based on public court notices; its relationship to the museum is still to be verified.',
        summary: {
          text: '社團法人臺灣文化事業發展協會經內政部2023年10月18日許可設立，2024年5月16日完成法人設立登記（臺灣桃園地方法院公告），宗旨是文化記憶保存、文化調查、人才培訓及教育推廣。公開資料沒有說明它與本館的關係，因此只列為相關組織資料。',
          textEn: 'The Taiwan Cultural Development Association (an incorporated association) was permitted to be established by the Ministry of the Interior on 18 October 2023 and completed its registration as a legal person on 16 May 2024 (notice of the Taiwan Taoyuan District Court). Its stated purposes are preserving cultural memory, cultural surveys, training and educational outreach. Public sources do not explain its relationship to the museum, so it is listed only as related organisation information.',
        },
        paragraphs: [
          '這一章是協會本身的資料，不是文史館的介紹；在營運關係確認以前，本站不把協會標示為文史館的主辦、館方或所有權人，場景裡也沒有放協會的招牌或標誌。',
        ],
        paragraphsEn: [
          'This chapter gives information about the association itself, not an introduction to the museum. Until the operational relationship is confirmed, this site does not identify the association as the museum’s organiser, operator or owner, and the scene contains no sign or emblem of the association.',
        ],
        facts: [
          { label: '名稱', labelEn: 'Name', value: ORGANIZATIONS[0].name, valueEn: ORGANIZATIONS[0].nameEn },
          { label: '許可設立', labelEn: 'Permission to establish', value: '2023年10月18日（內政部）', valueEn: '18 October 2023 (Ministry of the Interior)' },
          { label: '法人設立登記', labelEn: 'Registration as a legal person', value: '2024年5月16日（臺灣桃園地方法院）', valueEn: '16 May 2024 (Taiwan Taoyuan District Court)' },
          { label: '與文史館的關係', labelEn: 'Relationship to the museum', value: '待核實', valueEn: 'To be verified' },
        ],
        sourceIds: ['judicial-2024-tcda'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        tabEn: 'References',
        title: '參考文獻',
        titleEn: 'References',
        intro: '文史館、元珍豆醬店、黃玉階與相關組織的介紹整理自下列資料，點選即可開啟原始網頁。每一筆都註明出版時間與用途。',
        introEn: 'The introductions to the museum, the Yuanzhen Bean Sauce Shop, Huang Yujie and the related organisation are compiled from the sources below; select one to open the original web page. Each entry notes its publication date and use.',
        sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie', 'ith-primary-education', 'judicial-2024-tcda'],
        disclaimer:
          '外觀與一樓展間依使用者提供的實地照片建模，尺寸為估算；展板、肖像看板與文件框只做版面示意，器物是簡化的示意，不是館藏的複製。來源對細節記載不一時（例如執照的年份）並列說明，不自行選定一種。' +
          '尚未核實而留空的資料：' +
          PENDING.map((p) => p.field).join('、') +
          '。',
        disclaimerEn:
          'The exterior and the ground-floor gallery are modelled from on-site photographs supplied by the user, with dimensions estimated; the display panels, portrait panel and document frames are layout illustrations only, and the objects are simplified illustrations, not copies of the museum’s collection. Where sources differ on a detail (for example the year of the licence), both are given and this site does not choose one. ' +
          'Information left blank because it has not been verified: ' +
          PENDING.map((p) => p.fieldEn).join(', ') +
          '.',
      },
    ],
  },

  {
    id: 'luguo-cafe',
    name: '爐鍋咖啡',
    nameEn: 'Luguo Cafe',
    status: 'open',
    year: 2004,
    yearLabel: '品牌 2004年（店門口的海報「since 2004」）',
    yearLabelEn: 'Brand: 2004 (the poster at the shop door reads “since 2004”)',
    yearNote:
      '品牌：店門口的海報印著「since 2004」；建築：屈臣氏大藥房大樓1928年（一說1917年）興建；小藝埕：2011年開幕。爐鍋咖啡進駐小藝埕的年份未能查證（2014年的資料已記載二樓是爐鍋咖啡）。',
    yearNoteEn:
      'Brand: the poster at the shop door reads “since 2004”. Building: the Watson’s Pharmacy (屈臣氏大藥房) building was built in 1928 (one source says 1917). Xiaoyicheng (小藝埕): opened in 2011. The year Luguo Cafe moved into Xiaoyicheng could not be verified (a 2014 source already records Luguo Cafe on the second floor).',
    category: '咖啡館・小藝埕二樓',
    categoryEn: 'Cafe | Second floor of Xiaoyicheng',
    seal: '咖啡',
    sealEn: 'Coffee',
    summary: '小藝埕（屈臣氏大藥房舊址）二樓的咖啡館：從巷子側的騎樓走上樓梯，窗邊是面向小巷的木格窗。',
    summaryEn: 'A cafe on the second floor of Xiaoyicheng (the former Watson’s Pharmacy): climb the stairs from the arcade on the lane side, and by the window are timber lattice windows facing the small lane.',
    // 所在的建築與樓層（二樓，碰撞與鏡頭的 level 1）；可以走進去的室內
    // 店家名錄「年份與資料來源」：建築的興建年份、小藝埕的開幕年份與2014年的樓層資料
    sourceIds: ['taipei-pictorial-watson', 'artyard-about', 'businesstoday-2012-watson', 'ntpu-2014-dadaocheng'],
    buildingId: 'art-yard',
    floor: 2,
    hasInterior: true,

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：小藝埕取代迪化街北側街尾的兩個一般地段，面向永樂市場前廣場北邊的小巷（32巷）；
    // 位置、樓梯、房間、資訊熱點與鏡頭都在 data/luguoCafeLayout.js（建築與室內見 builders/luguoCafe*.js）。
    // position 為二樓咖啡吧檯的正面中央（互動點與店家名錄前往的位置在二樓）。
    position: artYardToWorld(LUGUO_CAFE.bar.counterX + 0.35, -1.0),
    facing: 'east',
    interaction: { radius: 2.0, distance: 0.85, level: LUGUO_LEVEL },
    site: { ...ART_YARD.site },
    building: { archetype: 'luguo-cafe', width: ART_YARD.half * 2, depth: -ART_YARD.back },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '小藝埕（屈臣氏大藥房舊址）與二樓的爐鍋咖啡只出現在「老屋新生」。建築、巷子與店內依實地照片建模，尺寸為估算；巷子的位置是情境示意。店內的畫作、海報、春聯與貼紙都是原創的簡化圖樣。',
      revivalEn:
        'Xiaoyicheng (the former Watson’s Pharmacy) and the second-floor Luguo Cafe appear only in “Old Houses, New Life”. The building, the lane and the interior are modelled from on-site photographs, with dimensions estimated; the position of the lane is a scenario illustration. The paintings, posters, spring couplets and stickers inside are original simplified designs.',
    },
    // 介紹的鏡頭（從店家名錄開啟時）：在店裡看吧檯與後方的大木櫃
    camera: { distance: 2.9, height: ART_YARD.floor2 + 1.95, side: -0.8, lookHeight: ART_YARD.floor2 + 1.0 },
    // 資訊熱點：小藝埕外觀、樓梯入口、窗邊座位、咖啡吧檯、紅色扭蛋機（世界座標）
    hotspots: LUGUO_HOTSPOTS.map((hotspot) => {
      const point = artYardToWorld(...hotspot.point)
      const at = ([x, y, z]) => {
        const p = artYardToWorld(x, z)
        return [p.x, y, p.z]
      }
      return {
        id: hotspot.id,
        label: hotspot.label,
        labelEn: hotspot.labelEn,
        note: hotspot.note,
        noteEn: hotspot.noteEn,
        chapter: hotspot.chapter,
        level: hotspot.level,
        radius: hotspot.radius,
        point,
        prompt: at(hotspot.prompt),
        camera: { position: at(hotspot.camera.position), target: at(hotspot.camera.target) },
      }
    }),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'building',
        type: 'text',
        tab: '屈臣氏大藥房',
        tabEn: 'Watson’s Pharmacy',
        title: '第一章｜屈臣氏大藥房與歷史建築',
        titleEn: 'Chapter 1 | Watson’s Pharmacy and the Historic Building',
        lead: '小藝埕所在的轉角大樓，是日治時期大稻埕的「屈臣氏大藥房」。',
        leadEn: 'The corner building that houses Xiaoyicheng was the “Watson’s Pharmacy” (屈臣氏大藥房) of Dadaocheng in the Japanese period.',
        paragraphs: [
          '魚夫2017年在《台北畫刊》發表的〈屈臣氏大樓的興衰起落〉記載：「最早屈臣氏是臺中實業家李俊啟全權負責經營，他本來在彰化員林開設「德壽堂」」；文章也提到，1926年時的報紙報導，香港屈臣氏的藥品由李俊啟在全臺專營。',
          '同一篇文章寫道，李俊啟在「1928 年（一說為1917 年）興建了這棟位於臺北大稻埕的屈臣氏大樓，以批發進口西藥為主，也代理英國史谷脫（Scott）魚肝油」。各資料記載的興建年份不一，這裡兩者並列。',
          '立面上的圖案也有故事。1934年，香港屈臣氏本店控告李俊啟擅自使用商標，李俊啟最終敗訴。文章記載，現存立面三樓外牆鑲著「飛龍與麒麟護衛七層寶塔圖騰」，兩旁寫著「龍麟伴塔為記，別人不得冒效」。',
          '《台北畫刊》也記載，大樓「1996 年遭逢大火，直至2005年由市府列為巿定古蹟後，交由李家後代李永崇建築師修復完成」。不過，我們在文化部文化資產局的開放資料中，沒有找到以「屈臣氏」或這個地址登錄的古蹟或歷史建築，文化資產的身分還需要查證。',
          '2012年《今周刊》形容這棟樓是「洗石子外牆的三層樓平樑式結構，坐落在街角」。場景中的建築依實地照片建模：灰色洗石子立面、連續的木格窗、轉角的塔樓與圓球柱頭、「屈臣氏大藥房」的店號與「A.S. WATSON & CO.」字樣；寶塔與龍、麒麟的浮雕是簡化的示意，尺寸為估算。',
        ],
        paragraphsEn: [
          'In “The Rise and Fall of the Watson Building” (屈臣氏大樓的興衰起落), published by Yu Fu (魚夫) in Taipei Pictorial (《台北畫刊》) in 2017, the author records: “At first Watson’s was run with full authority by the Taichung industrialist Li Junqi, who had originally opened the ‘Deshoutang’ in Yuanlin, Changhua” (translation by this site). The article also mentions that, according to a 1926 newspaper report, Li Junqi held the exclusive rights across Taiwan to Hong Kong Watson’s medicines.',
          'The same article says that Li Junqi “built this Watson building in Dadaocheng, Taipei, in 1928 (one source says 1917), mainly wholesaling imported Western medicines and also acting as agent for the British Scott’s cod liver oil” (translation by this site). Sources disagree on the year of construction, so both are given here.',
          'The patterns on the façade also have a story. In 1934, the Hong Kong head office of Watson’s sued Li Junqi for using its trademark without permission, and Li Junqi eventually lost. The article records that the third-floor wall of the surviving façade is inlaid with “a totem of a flying dragon and a qilin guarding a seven-storey pagoda”, flanked by the words “the dragon and qilin accompanying the pagoda are our mark; others may not imitate it” (translation by this site).',
          'Taipei Pictorial also records that the building “was hit by a major fire in 1996, and only in 2005, after the city government designated it a municipal historic site, was it handed to Li Yongchong, an architect and descendant of the Li family, who completed its restoration” (translation by this site). However, we found no historic site or historic building registered under the name “Watson’s” or this address in the open data of the Bureau of Cultural Heritage, Ministry of Culture, so its cultural-heritage status still needs to be verified.',
          'In 2012, Business Today (《今周刊》) described the building as “a three-storey flat-beam structure with washed-stone walls, standing on a street corner” (translation by this site). The building in the scene is modelled from on-site photographs: a grey washed-stone façade, continuous timber lattice windows, a corner tower with ball-shaped column capitals, the shop name “屈臣氏大藥房” and the lettering “A.S. WATSON & CO.”. The reliefs of the pagoda, dragon and qilin are simplified illustrations, and the dimensions are estimates.',
        ],
        timeline: [
          { place: '1926', placeEn: '1926', text: '據《台北畫刊》，當時的報紙報導香港屈臣氏的藥品由李俊啟在全臺專營。', textEn: 'According to Taipei Pictorial, a newspaper of the time reported that Li Junqi held the exclusive rights across Taiwan to Hong Kong Watson’s medicines.' },
          { place: '1928', placeEn: '1928', text: '屈臣氏大樓興建（一說1917年）。', textEn: 'The Watson building was built (one source says 1917).' },
          { place: '1934', placeEn: '1934', text: '香港屈臣氏本店控告商標被擅自使用。', textEn: 'The Hong Kong head office of Watson’s sued over the unauthorised use of its trademark.' },
          { place: '1996', placeEn: '1996', text: '大樓遭逢大火。', textEn: 'The building was hit by a major fire.' },
          { place: '2005', placeEn: '2005', text: '《台北畫刊》記載市府列為市定古蹟，之後修復完成。', textEn: 'Taipei Pictorial records that the city government designated it a municipal historic site; it was restored afterwards.' },
        ],
        facts: [
          { label: '店號', labelEn: 'Shop name', value: '屈臣氏大藥房（A.S. WATSON & CO.）', valueEn: 'Watson’s Pharmacy (屈臣氏大藥房, A.S. WATSON & CO.)' },
          { label: '經營者', labelEn: 'Operator', value: '李俊啟（臺中實業家）', valueEn: 'Li Junqi (a Taichung industrialist)' },
          { label: '興建', labelEn: 'Built', value: '1928年（一說1917年）', valueEn: '1928 (one source says 1917)' },
          { label: '位置', labelEn: 'Location', value: '迪化街一段與32巷的轉角', valueEn: 'The corner of Section 1, Dihua Street and Lane 32' },
        ],
        sourceIds: ['taipei-pictorial-watson', 'businesstoday-2012-watson', 'boch-opendata-assets', 'boch-opendata-historic'],
      },
      {
        id: 'art-yard',
        type: 'text',
        tab: '小藝埕',
        tabEn: 'Xiaoyicheng',
        title: '第二章｜小藝埕與老屋再利用',
        titleEn: 'Chapter 2 | Xiaoyicheng and the Reuse of Old Buildings',
        lead: '「大稻埕上賣小藝」：2011年，屈臣氏大藥房的大樓成了小藝埕。',
        leadEn: '“Selling small arts in Dadaocheng”: in 2011 the Watson’s Pharmacy building became Xiaoyicheng (小藝埕).',
        paragraphs: [
          '《遠見雜誌》2013年報導：「2010年周奕成好不容易獲得…「屈臣氏大藥房」屋主點頭出租，以「大稻埕上賣小藝」發想創立小藝埕，展開他的文化復興大計。」報導稱周奕成是「世代文化創業群負責人」。',
          '2012年《今周刊》記載：「二○一一年右翼內棟作為「小藝埕」，內有…藝術設計品鋪、獨立書店、咖啡店及劇場。」大藝埕的官方網站寫道：「自 2011 年的「小藝埕」至今，世代群在大稻埕經營了 10 棟藝埕系列街屋」。2015年的《今周刊》以「這波大稻埕文藝復興風潮」形容這一帶的老屋再利用。',
          '2014年國立臺北大學的報告引用小藝埕官網，記載當時「一樓：「Bookstore 1920s」及「印花樂」 二樓：「爐鍋咖啡」 三樓：展示和聚會場所」；TVBS《食尚玩家》的介紹則寫「3樓是思劇場」。各樓層的店家會隨時間調整。',
          '老屋再利用保留了老建築的外觀：二樓臨巷的三組深棕色木格窗，上方還有小氣窗。場景中只呈現一樓的騎樓、店面與樓梯入口，以及二樓的爐鍋咖啡；其他樓層沒有室內，一樓轉角的店只用一般的「BOOK CAFE」字樣，不使用實際店家的商標。',
          '營運模式（官方自述）：大藝埕的官方網站寫，世代群以「創業助成、街區營造、文化運動」三大主軸，把歷史街屋規劃為創業商場，至今約50組創業團隊進駐；官方的「HOUSES」頁稱小藝埕「位於迪化街入口的百年洋樓，是藝埕的第一棟街屋」，並列出小藝埕、民藝埕、眾藝埕、學藝埕、聯藝埕、青藝埕、合藝埕、同藝埕、鄉藝埕、婉藝埕十棟。這些是營運單位的自述，不是第三方的評估。本站讀到的來源都顯示這是民間向屋主承租的老屋再利用（《遠見雜誌》：2010年屋主點頭出租）；沒有查到它是政府的計畫，承租的年限與條件也沒有公開資料，不寫。',
          '兩棟相鄰的藝埕：2012年《今周刊》同時寫到小藝埕與斜對面的民藝埕（迪化街一段67號）。民藝埕是迪化街的店屋，二樓是狹長的三進格局、有天井，歷經茂元中藥行、郭火焱事務所、侯雨利店鋪，後由蘇家擁有；官方頁稱它是霞海城隍廟旁的「百年三進式街屋」，報導寫2012年時有「近九十年的屋齡」。小藝埕則是街角的洋樓（屈臣氏大藥房舊址）。一棟洋樓、一棟三進街屋，正好是大稻埕老屋的兩種型態；民藝埕不在本站的場景裡，兩棟是不同的建築，不要混為一談。',
          '從屈臣氏大藥房到小藝埕，有出處的只有幾個節點：日治時期批發西藥的洋樓（1928年，一說1917年）、1996年的大火、之後的修復、2010年屋主答應出租、2011年小藝埕開幕、2014年的資料記載二樓是爐鍋咖啡。這些節點之間有沒有因果——修復是否促成出租、屋主為何在2010年點頭——本站沒有查到，不推論；各樓層的業者也會隨時間調整，本站不列現在的入駐名單。',
        ],
        paragraphsEn: [
          'Global Views Monthly (《遠見雜誌》) reported in 2013: “In 2010 Zhou Yicheng finally got the owner of the ‘Watson’s Pharmacy’ to agree to lease it, and conceived Xiaoyicheng under the idea of ‘selling small arts in Dadaocheng’, launching his grand plan for cultural revival” (translation by this site). The report calls Zhou Yicheng (周奕成) the “head of the Generation Cultural Entrepreneur Group” (世代文化創業群).',
          'Business Today recorded in 2012: “In 2011 the inner block on the right wing became ‘Xiaoyicheng’, housing … an art and design shop, an independent bookshop, a cafe and a theatre” (translation by this site). The official website of Daiyicheng (大藝埕, ArtYard) says: “From ‘Xiaoyicheng’ in 2011 until today, the Generation Group has run 10 buildings of the Yicheng series of shophouses in Dadaocheng” (translation by this site). In 2015 Business Today used the phrase “this wave of cultural renaissance in Dadaocheng” to describe the reuse of old houses in the area.',
          'A 2014 report by National Taipei University, citing the Xiaoyicheng website, records the floors at that time as “first floor: ‘Bookstore 1920s’ and ‘Inblooom’; second floor: ‘Luguo Cafe’; third floor: exhibition and meeting space” (translation by this site); the TVBS programme Taste Seekers (《食尚玩家》) writes instead that “the third floor is the Si Theatre”. The businesses on each floor change over time.',
          'The reuse kept the old building’s exterior: on the second floor facing the lane are three sets of dark brown timber lattice windows, with small transom windows above. The scene shows only the ground-floor arcade, shopfronts and staircase entrance, and the second-floor Luguo Cafe; the other floors have no interior, and the corner shop on the ground floor carries only the generic lettering “BOOK CAFE”, without any real shop’s logo.',
          'Operating model (the operator’s own account): the Daiyicheng official website says that the Generation Group, under three main strands of “start-up support, neighbourhood building and cultural movement”, has turned historic shophouses into a start-up marketplace, with about 50 start-up teams moved in so far. The official “HOUSES” page describes Xiaoyicheng as “a century-old Western-style house at the entrance to Dihua Street and the first shophouse of Yicheng”, and lists ten buildings: Xiaoyicheng, Minyicheng, Zhongyicheng, Xueyicheng, Lianyicheng, Qingyicheng, Heyicheng, Tongyicheng, Xiangyicheng and Wanyicheng. These are the operator’s own descriptions, not a third-party assessment. All the sources this site has read show that this was a private reuse of an old house leased from its owner (Global Views Monthly: the owner agreed to lease it in 2010); we found no evidence that it was a government project, and no public information on the lease term or conditions, so none is stated.',
          'Two neighbouring Yicheng buildings: in 2012 Business Today wrote about both Xiaoyicheng and Minyicheng (民藝埕, No. 67, Section 1, Dihua Street) diagonally opposite. Minyicheng is a shophouse on Dihua Street; its second floor has a long, narrow three-bay layout with a courtyard, and it passed through the Maoyuan Chinese Medicine Hong, the Guo Huoyan office and the Hou Yuli shop before being owned by the Su family. The official page calls it a “century-old three-bay shophouse” beside the Xiahai City God Temple, and the report says that in 2012 it was “nearly ninety years old”. Xiaoyicheng, by contrast, is a Western-style house on the corner (the former Watson’s Pharmacy). A Western-style house and a three-bay shophouse are exactly two types of old building in Dadaocheng; Minyicheng is not in this site’s scene, and the two are different buildings that should not be confused.',
          'From Watson’s Pharmacy to Xiaoyicheng, only a few points are sourced: the Western-style house wholesaling Western medicines in the Japanese period (1928, one source says 1917), the 1996 fire, the restoration afterwards, the owner’s agreement to lease in 2010, the opening of Xiaoyicheng in 2011, and the 2014 source recording Luguo Cafe on the second floor. Whether these points are causally connected — whether the restoration led to the lease, or why the owner agreed in 2010 — this site has not found out and does not infer; the businesses on each floor also change over time, so this site does not list the current tenants.',
        ],
        facts: [
          { label: '開幕', labelEn: 'Opened', value: '2011年', valueEn: '2011' },
          { label: '經營', labelEn: 'Operator', value: '世代群（世代文化創業群）', valueEn: 'Generation Group (Generation Cultural Entrepreneur Group)' },
          { label: '概念', labelEn: 'Concept', value: '「大稻埕上賣小藝」', valueEn: '“Selling small arts in Dadaocheng”' },
          { label: '定位', labelEn: 'Standing', value: '藝埕系列的第一棟，共十棟（官方自述）', valueEn: 'The first building of the Yicheng series, ten in all (official account)' },
          { label: '地址', labelEn: 'Address', value: '報導寫迪化街一段32巷1號；官方編號AY34、旅遊文章另寫34號，未核對地政資料（待核）', valueEn: 'Reports give No. 1, Lane 32, Section 1, Dihua Street; the official number is AY34 and a travel article gives No. 34; land-registry records not checked (to be verified)' },
        ],
        sourceIds: ['gvm-2013-artyard', 'businesstoday-2012-watson', 'artyard-about', 'artyard-houses', 'businesstoday-2015-dadaocheng', 'ntpu-2014-dadaocheng', 'supertaste-artyard', 'storm-2018-luguo'],
      },
      {
        id: 'luguo',
        type: 'text',
        tab: '爐鍋咖啡',
        tabEn: 'Luguo Cafe',
        title: '第三章｜爐鍋咖啡的創立及進駐',
        titleEn: 'Chapter 3 | The Founding and Move-in of Luguo Cafe',
        lead: '從巷子側的騎樓走上樓梯，二樓就是爐鍋咖啡。',
        leadEn: 'Climb the stairs from the arcade on the lane side, and the second floor is Luguo Cafe (爐鍋咖啡).',
        paragraphs: [
          '2018年《風傳媒》的報導寫道：「屈臣氏大藥房的二樓，有間網路上頗具知名度的爐鍋咖啡」，地址是臺北市大同區迪化街一段32巷1號。',
          '創立：店門口的海報印著「since 2004」（依實地照片）。2015年《風傳媒》（欣台灣）也介紹了「位於台北藝術大學關渡校區的爐鍋咖啡」。',
          '進駐：2012年的《今周刊》寫到小藝埕「內有…咖啡店」，但沒有寫出店名，也沒有寫咖啡店是哪一年進駐的；我們查到最早明確寫出「二樓：「爐鍋咖啡」」的資料，是2014年臺北大學的報告。因此這裡不寫確切的進駐年份。',
          'TVBS《食尚玩家》記載：「2樓的「爐鍋咖啡」主打來自各產區、莊園的單品咖啡，還有義式濃縮和拿鐵。」《風傳媒》也寫道：「所有的咖啡豆都是老闆精選各國的豆子，而且每杯咖啡強調不加糖、不加奶精」。',
          '場景中的二樓依實地照片建模：臨巷的窗邊座位、靠牆的大木櫃與咖啡吧檯、書架與閱讀角、門口的紅色扭蛋機與冰滴咖啡架。牆上的畫作、海報、春聯與貼紙都換成原創的簡化圖樣，不複製店內實際的作品；也不列出營業時間、價格與經營者的姓名。',
        ],
        paragraphsEn: [
          'A 2018 report in Storm Media (《風傳媒》) says: “On the second floor of the Watson’s Pharmacy is a fairly well-known online cafe, Luguo Cafe” (translation by this site), with the address No. 1, Lane 32, Section 1, Dihua Street, Datong District, Taipei.',
          'Founding: the poster at the shop door reads “since 2004” (from on-site photographs). In 2015 Storm Media (by Xin Taiwan) also introduced “Luguo Cafe at the Guandu campus of Taipei National University of the Arts” (translation by this site).',
          'Move-in: a 2012 Business Today article says that Xiaoyicheng “houses … a cafe” (translation by this site), but does not give the cafe’s name or say in which year it moved in; the earliest source we found that explicitly writes “second floor: ‘Luguo Cafe’” is the 2014 National Taipei University report. This site therefore does not state an exact move-in year.',
          'TVBS’s Taste Seekers records: “The ‘Luguo Cafe’ on the second floor mainly serves single-origin coffees from various regions and estates, as well as espresso and latte” (translation by this site). Storm Media also writes: “All the coffee beans are selected by the owner from various countries, and every cup of coffee is served with no sugar and no creamer” (translation by this site).',
          'The second floor in the scene is modelled from on-site photographs: window seats facing the lane, a large timber cabinet and the coffee bar against the wall, a bookshelf and reading corner, and, at the door, a red capsule-toy machine and a cold-drip coffee stand. The paintings, posters, spring couplets and stickers on the walls have been replaced with original simplified designs and do not copy the shop’s actual works; opening hours, prices and the operator’s name are not listed.',
        ],
        facts: [
          { label: '店名', labelEn: 'Shop name', value: '爐鍋咖啡 LUGUO CAFE', valueEn: 'Luguo Cafe (爐鍋咖啡, LUGUO CAFE)' },
          { label: '位置', labelEn: 'Location', value: '小藝埕二樓（迪化街一段32巷1號）', valueEn: 'Second floor of Xiaoyicheng (No. 1, Lane 32, Section 1, Dihua Street)' },
          { label: '品牌', labelEn: 'Brand', value: '海報上的「since 2004」', valueEn: '“since 2004” on the poster' },
          { label: '進駐小藝埕', labelEn: 'Move-in to Xiaoyicheng', value: '年份未能查證（2014年的資料已記載在二樓）', valueEn: 'Year could not be verified (a 2014 source already records it on the second floor)' },
        ],
        sourceIds: ['storm-2018-luguo', 'storm-2015-luguo-guandu', 'businesstoday-2012-watson', 'ntpu-2014-dadaocheng', 'supertaste-artyard'],
      },
      {
        id: 'coffee',
        type: 'foods',
        tab: '一杯咖啡',
        tabEn: 'A Cup of Coffee',
        title: '第四章｜咖啡製作與飲食文化',
        titleEn: 'Chapter 4 | Making Coffee and Food Culture',
        intro:
          '依農業部〈台灣咖啡沿革〉，臺灣栽培咖啡最早的紀錄是1884年英國茶商自馬尼拉引進一百株阿拉比卡咖啡，在台北三峽種植；日治時期在恆春與嘉義試種推廣，1942年全臺栽培面積達1,000公頃，戰後大多荒蕪。1930年代的大稻埕也有西洋飲食的身影：1934年開業的「波麗路」是「臺北市1930年代最著名的西餐廳」（臺北市歷史建築）。以下是吧檯上常見的幾種做法；門口的紅色扭蛋機，裝的則是咖啡器具造型的迷你模型（依實地照片）。',
        introEn:
          'According to the Ministry of Agriculture’s “History of Coffee in Taiwan”, the earliest record of coffee cultivation in Taiwan is from 1884, when a British tea merchant brought in one hundred Arabica plants from Manila and planted them at Sanxia in Taipei; in the Japanese period trial planting was promoted in Hengchun and Chiayi, and by 1942 the planted area across Taiwan reached 1,000 hectares, most of which fell into neglect after the war. Western food also had a presence in Dadaocheng in the 1930s: Bolero (波麗路), which opened in 1934, was “the most famous Western restaurant in Taipei in the 1930s” (Taipei City historic building). Below are several methods commonly seen at the bar; the red capsule-toy machine at the door holds miniature models in the shape of coffee equipment (from on-site photographs).',
        items: [
          {
            id: 'coffee-beans',
            name: '咖啡豆',
            nameEn: 'Coffee beans',
            category: '咖啡樹的種子｜烘焙',
            categoryEn: 'Seeds of the coffee tree | Roasting',
            description: '咖啡樹的「種子為咖啡原料，焙乾後研成細末可沖泡為飲料」（教育部《國語辭典簡編本》）。',
            descriptionEn: 'The “seeds of the coffee tree are the raw material of coffee; after roasting and drying they are ground into a fine powder that can be brewed as a drink” (Ministry of Education, Concise Dictionary of Mandarin; translation by this site).',
            note: '《食尚玩家》記載，爐鍋咖啡主打來自各產區、莊園的單品咖啡。',
            noteEn: 'Taste Seekers records that Luguo Cafe mainly serves single-origin coffees from various regions and estates.',
          },
          {
            id: 'pour-over',
            name: '手沖咖啡',
            nameEn: 'Pour-over coffee',
            category: '濾杯｜細口壺',
            categoryEn: 'Dripper | Gooseneck kettle',
            description: '用手把熱水緩緩倒在濾杯裡的咖啡粉上，讓咖啡液滴進下方的壺中（美國國家咖啡協會："hand-pour water over coffee grounds in a filter"）。',
            descriptionEn: 'Hot water is poured slowly by hand over the coffee grounds in a dripper, so that the coffee drips into the pot below (National Coffee Association USA: "hand-pour water over coffee grounds in a filter").',
            note: '吧檯上有濾杯、細口壺與分享壺（依實地照片）。',
            noteEn: 'On the bar are drippers, gooseneck kettles and sharing pots (from on-site photographs).',
          },
          {
            id: 'espresso',
            name: '義式濃縮',
            nameEn: 'Espresso',
            category: '高壓萃取',
            categoryEn: 'High-pressure extraction',
            description: '用高壓讓接近沸騰的熱水在約20–30秒內通過細研磨的咖啡粉（美國國家咖啡協會）。',
            descriptionEn: 'Near-boiling water is forced under high pressure through finely ground coffee in about 20–30 seconds (National Coffee Association USA).',
            note: '加入牛奶就成了拿鐵；《食尚玩家》記載店裡有義式濃縮和拿鐵。',
            noteEn: 'Add milk and it becomes a latte; Taste Seekers records that the cafe serves espresso and latte.',
          },
          {
            id: 'cold-drip',
            name: '冰滴咖啡',
            nameEn: 'Cold-drip coffee',
            category: '冰水｜慢慢滴漏',
            categoryEn: 'Iced water | Slow dripping',
            description: '「利用5度C以下的冰水混合物」一滴一滴滴入咖啡粉，「一點一點滴漏出萃取液」（《食力》）。',
            descriptionEn: '“An ice-water mixture below 5°C” drips drop by drop onto the coffee grounds, and the extract “drips out little by little” (FoodNext《食力》; translation by this site).',
            note: '店門口旁有一座木架的冰滴咖啡器（依實地照片）。',
            noteEn: 'Beside the shop door stands a timber-framed cold-drip coffee maker (from on-site photographs).',
          },
          {
            id: 'cold-brew',
            name: '冷萃咖啡',
            nameEn: 'Cold-brew coffee',
            category: '冷水｜長時間浸泡',
            categoryEn: 'Cold water | Long steeping',
            description: '咖啡粉「注入冷水，於低溫環境中浸泡至少約12小時」（《食力》）；和先熱沖、再冰鎮的冰咖啡不同（美國國家咖啡協會）。',
            descriptionEn: 'Cold water is poured onto the coffee grounds, which are then “steeped in a low-temperature environment for at least about 12 hours” (FoodNext《食力》; translation by this site); it differs from iced coffee, which is brewed hot and then chilled (National Coffee Association USA).',
            note: '冷萃與冰滴都是低溫萃取：一個浸泡，一個滴漏。',
            noteEn: 'Cold brew and cold drip are both low-temperature extraction: one steeps, the other drips.',
          },
        ],
        sourceIds: ['moa-taiwan-coffee', 'boch-bolero', 'moe-coffee', 'nca-pour-over', 'nca-espresso', 'nca-cold-brew', 'foodnext-cold-brew', 'supertaste-artyard'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        tabEn: 'References',
        title: '第五章｜參考文獻',
        titleEn: 'Chapter 5 | References',
        intro: '小藝埕、屈臣氏大藥房與爐鍋咖啡的介紹整理自下列資料，點選即可開啟原始網頁。',
        introEn: 'The introductions to Xiaoyicheng, Watson’s Pharmacy and Luguo Cafe are compiled from the sources below; select one to open the original web page.',
        sourceIds: [
          'taipei-pictorial-watson',
          'businesstoday-2012-watson',
          'boch-opendata-assets',
          'boch-opendata-historic',
          'gvm-2013-artyard',
          'artyard-about',
          'artyard-houses',
          'businesstoday-2015-dadaocheng',
          'ntpu-2014-dadaocheng',
          'supertaste-artyard',
          'storm-2018-luguo',
          'storm-2015-luguo-guandu',
          'moa-taiwan-coffee',
          'boch-bolero',
          'moe-coffee',
          'nca-pour-over',
          'nca-espresso',
          'nca-cold-brew',
          'foodnext-cold-brew',
        ],
        disclaimer:
          '建築、巷子、樓梯與店內的 3D 模型依實地照片建模，尺寸與比例為估算；巷子在遊戲街道上的位置是情境示意。店內的畫作、海報、春聯、貼紙與扭蛋機的圖樣都是原創的簡化內容，並非店內實際的作品或商標。建築的興建年份資料不一（1928年，一說1917年），文化資產身分與爐鍋咖啡進駐小藝埕的年份未能查證；本站不列出營業時間、價格與經營者姓名。',
        disclaimerEn:
          'The 3D models of the building, the lane, the staircase and the interior are modelled from on-site photographs, with dimensions and proportions estimated; the position of the lane on the game street is a scenario illustration. The paintings, posters, spring couplets, stickers and capsule-toy designs inside are original simplified content, not the shop’s actual works or trademarks. Sources disagree on the year the building was built (1928, one source says 1917), and its cultural-heritage status and the year Luguo Cafe moved into Xiaoyicheng could not be verified; this site does not list opening hours, prices or the operator’s name.',
      },
    ],
  },

  /* ── 魷魚羹飲食文化：兩個年代各一個版本（位置、模型、碰撞、互動與故事各自獨立，見 data/squidSoupLayout.js） ── */
  {
    id: 'temple-squid-stall',
    name: '廟口魷魚羹攤',
    nameEn: 'Temple-front squid soup stall',
    status: 'open',
    category: '廟口小吃・魷魚羹',
    categoryEn: 'Temple-front snacks · squid soup',
    seal: '羹',
    sealEn: 'Soup',
    // 與 2000–現在的老潘魷魚羹同一個飲食主題（只以主題串連，沒有傳承關係）
    theme: SQUID_SOUP_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    scenarioNoteEn: 'Food-culture scenario illustration',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    yearNoteEn: 'Food-culture scenario illustration: this stall does not correspond to any real business and has no founding year or shop history.',
    sourceIds: ['wiki-ci-sheng-gong', 'moe-jiu-hi-kenn', 'mirror-2025-squid'],
    summary:
      '慈聖宮廟埕旁、與其他小吃攤相鄰的魷魚羹攤：木框攤台、帆布棚、大湯鍋與兩張小桌。這是飲食文化的情境示意，不是特定的店家。',
    summaryEn:
      'A squid soup stall beside the Cisheng Temple forecourt, next to other snack stalls: a wooden-framed counter, a canvas awning, a large soup pot and two small tables. This is a food-culture scenario illustration, not a particular business.',

    // ── 場景配置 ──────────────────────────────
    // 只在「庶民生活」出現：慈聖宮廟埕西側的前緣（廟門與中央通道不佔用），攤台朝向迪化街。
    // position 為兩張小桌之間的攤台正面；攤位、桌椅與碰撞由 builders/templeSquidStall.js 產生。
    position: templeStallToWorld(TEMPLE_STALL_HOTSPOTS[0].point[0], 0),
    facing: 'north',
    // 從店家名錄前往：站在兩張小桌之間的街邊，面向攤台
    interaction: { radius: 2.0, distance: 2.2 },
    site: { ...TEMPLE_STALL_SITE },
    building: { archetype: 'temple-squid-stall', width: 2.6, depth: 3.2 },
    buildingByEra: {
      postwar: { condition: 'aged' },
    },
    eraNotes: {
      postwar:
        '廟口的魷魚羹攤只出現在「庶民生活」（1945–1980），是飲食文化的情境示意：攤位的樣子、位置與桌椅依一般的小吃攤設計，不代表某一家實際的攤位，也不是2000年之後老潘魷魚羹的前身。',
      postwarEn:
        'The temple-front squid soup stall appears only in “Everyday Life” (1945–1980) and is a food-culture scenario illustration: its look, position and tables follow a generic snack stall and do not represent any real stall, nor is it the forerunner of Lao Pan Squid Soup after 2000.',
    },
    camera: { distance: 4.6, height: 2.1, side: -2.7, lookHeight: 1.15 },
    hotspots: hotspotsToWorld(TEMPLE_STALL_HOTSPOTS, templeStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'temple-food',
        type: 'text',
        tab: '廟口飲食',
        tabEn: 'Temple-front food',
        title: '魷魚羹與廟口飲食',
        titleEn: 'Squid soup and temple-front food',
        lead: '慈聖宮的廟埕旁，一座木框攤台、一口大湯鍋與兩張小桌：這是「魷魚羹」與廟口飲食的情境示意。下面分開標示史料與情境設計。',
        leadEn: 'Beside the forecourt of Cisheng Temple stand a wooden-framed counter, a large soup pot and two small tables: a scenario illustration of squid soup and temple-front food. Historical sources and scenario design are labelled separately below.',
        paragraphs: [
          '史料｜教育部《臺灣台語常用詞辭典》收錄「鰇魚羹」（jiû-hî-kenn），釋義是「一種小吃，用魷魚作成的羹湯」；「羹」則是「芶芡而成的濃稠湯汁」。',
          '史料｜辭典裡的「廟口」是「廟門口、廟前廣場」，用例寫著廟口的榕樹下經常有人泡茶、聊天；賣點心小吃的攤販稱為「點心擔」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮在1910年因市區改正遷移、1914年重建完成，今址在保安街49巷17號，「廟前則是一排老牌的小吃攤」。',
          '專欄的說法｜《鏡週刊》裴偉的專欄〈萬華大稻埕的魷魚美食〉（2025年）寫道：「魷魚羹在70年代於萬華、大稻埕一帶興起」，原因之一是「供貨源頭迪化街就在附近」。這是專欄作者的看法，不是學術考證；本站沒有找到更早的文獻可以核對，所以不寫這個年代的哪一年開始有魷魚羹攤。',
          '情境設計｜場景中的攤位：木框攤台與金屬工作面、簡單的帆布棚、大湯鍋與長柄湯勺、疊放的碗、配料盤，以及兩張小桌與木凳；鍋口冒著少量蒸氣，攤台上展示一碗魷魚羹。招牌只寫「魷魚羹」，沒有店名或商標。攤位的樣子、擺放的位置都是依一般小吃攤設計的示意，不是某一家實際的攤位，也沒有店史或傳承關係。',
          '同一個飲食主題｜切換到「2000–現在」，可以在永樂市場對面走進老潘魷魚羹。兩者只是同樣以魷魚羹為主題：場景沒有表示這個攤位是老潘的前身，也不表示老潘從廟口遷出。',
        ],
        paragraphsEn: [
          'Historical source | The Ministry of Education’s Dictionary of Frequently-Used Taiwanese Southern Min lists “jiû-hî-kenn” (squid soup), defined as “a snack: a thick soup made with squid”; “kenn” (soup) is “a thick soup thickened with starch”.',
          'Historical source | In the dictionary, “biō-kháu” (temple front) means “the entrance of a temple, the square in front of a temple”, and its example sentence describes people often making tea and chatting under the banyan tree at the temple front; vendors selling light snacks are called “tiám-sim-tànn” (snack-carrying-pole sellers). Wikipedia’s entry on Dadaocheng Cisheng Temple records that the temple was moved in 1910 under urban improvement and rebuilt by 1914, that it now stands at 17 Lane 49, Baoan Street, and that “in front of the temple is a row of long-established snack stalls”.',
          'A columnist’s view | In his column “Squid Delicacies of Wanhua and Dadaocheng” (2025), Pei Wei of Mirror Media writes that “squid soup rose in the Wanhua and Dadaocheng area in the 1970s”, partly because “Dihua Street, the source of supply, is close by”. This is the columnist’s own opinion, not scholarly verification; this site has found no earlier source to check it against, so it does not say in which year of that decade squid soup stalls began.',
          'Scenario design | The stall in the scene has a wooden-framed counter with a metal work surface, a simple canvas awning, a large soup pot with a long-handled ladle, stacked bowls, trays of toppings, and two small tables with wooden stools; a little steam rises from the pot, and a bowl of squid soup is displayed on the counter. The sign reads only “squid soup”, with no shop name or trademark. The stall’s look and placement are an illustration based on a generic snack stall, not any real stall, and carry no shop history or line of succession.',
          'The same food theme | Switch to “2000–present” and you can walk into Lao Pan Squid Soup, opposite Yongle Market. The two share only the theme of squid soup: the scene does not suggest that this stall was Lao Pan’s forerunner, nor that Lao Pan moved out of the temple front.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '慈聖宮廟埕旁、其他小吃攤的旁邊（場景配置）', valueEn: 'Beside the Cisheng Temple forecourt, next to the other snack stalls (scene layout)' },
          { label: '年代', labelEn: 'Era', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）', valueEn: '1945–1980, “Everyday Life” (the stall itself has no corresponding year)' },
          { label: '性質', labelEn: 'Nature', value: '飲食文化情境示意，不是特定的店家', valueEn: 'A food-culture scenario illustration, not a particular business' },
          { label: '招牌', labelEn: 'Shop sign', value: '只寫「魷魚羹」', valueEn: 'Reads only “squid soup” (魷魚羹)' },
        ],
        glossary: [
          { term: '鰇魚羹', termEn: 'Squid soup (jiû-hî-kenn)', taiwanese: 'jiû-hî-kenn', taiwaneseSource: 'moe-jiu-hi-kenn', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'A snack: a thick soup made with squid (Ministry of Education, Dictionary of Frequently-Used Taiwanese Southern Min).' },
          { term: '羹', termEn: 'Thick soup (kenn)', taiwanese: 'kenn', taiwaneseSource: 'moe-kenn', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。', definitionEn: 'A thick soup thickened with starch; the variant character 焿 is also used (same source).' },
          { term: '廟口', termEn: 'Temple front (biō-kháu)', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。', definitionEn: 'The entrance of a temple, the square in front of a temple (same source).' },
          { term: '點心擔', termEn: 'Snack seller’s carrying-pole stall (tiám-sim-tànn)', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。', definitionEn: 'A vendor who sells light snacks (same source).' },
        ],
        sourceIds: ['moe-jiu-hi-kenn', 'moe-kenn', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong', 'mirror-2025-squid'],
      },
      {
        id: 'bowl',
        type: 'foods',
        tab: '一碗魷魚羹',
        tabEn: 'A bowl of squid soup',
        title: '一碗魷魚羹',
        titleEn: 'A bowl of squid soup',
        intro: '攤台上展示的一碗魷魚羹與它的主要材料。材料與做法是一般的說明，不是某一家的配方。',
        introEn: 'A bowl of squid soup on display on the counter, with its main ingredients. Ingredients and method are given in general terms and are not any one shop’s recipe.',
        items: [
          {
            id: 'squid-geng',
            name: '魷魚羹',
            nameEn: 'Squid soup (youyu geng)',
            category: '羹湯｜魷魚',
            categoryEn: 'Thick soup | Squid',
            description: '用魷魚作成的羹湯（教育部辭典）；湯汁勾芡而成，濃稠滑順。',
            descriptionEn: 'A thick soup made with squid (Ministry of Education dictionary); the broth is thickened with starch and is rich and smooth.',
            note: '《鏡週刊》的專欄提到，「會把發泡好的魷魚，切絲拌進魚漿中」。場景中的一碗是示意，不代表配方或份量。',
            noteEn: 'The Mirror Media column mentions that “soaked squid is cut into strips and mixed into the fish paste”. The bowl in the scene is an illustration and does not represent a recipe or a portion size.',
          },
          {
            id: 'dried-squid',
            name: '乾魷魚（鰇魚）',
            nameEn: 'Dried squid',
            category: '乾貨｜提鮮食材',
            categoryEn: 'Dried goods | Flavour enhancer',
            description: '魷魚「時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一」（教育部辭典）。',
            descriptionEn: 'Squid is “often split open along the body cavity, gutted and sun-dried, to serve as one of the ingredients that bring out flavour in cooking” (Ministry of Education dictionary).',
            note: '《鏡週刊》的專欄寫到，迪化街一帶的南北貨裡，進口的大魷魚乾是重要的商品之一。',
            noteEn: 'The Mirror Media column notes that among the dried goods from north and south sold around Dihua Street, large imported dried squid was one of the important commodities.',
          },
        ],
        footnote: '展示的一碗是示意模型，不代表價格、份量或配方。',
        footnoteEn: 'The bowl on display is an illustrative model and does not represent a price, portion size or recipe.',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-jiu-hi', 'moe-kenn', 'mirror-2025-squid', 'mirror-2026-squid'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '廟口魷魚羹攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        introEn: 'The introduction to the temple-front squid soup stall draws on the sources below; select one to open the original web page. Each entry gives its publication date and how it was used.',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-jiu-hi', 'moe-kenn', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong', 'mirror-2025-squid', 'mirror-2026-squid'],
        disclaimer:
          '廟口的魷魚羹攤是「飲食文化情境示意」：攤位的樣子、位置、桌椅都是依一般小吃攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。招牌只寫「魷魚羹」，沒有使用任何店名、商標或現代店面的照片。',
        disclaimerEn:
          'The temple-front squid soup stall is a “food-culture scenario illustration”: its look, position and tables follow a generic snack stall and do not represent any real stall; unverified dates, shop histories and lines of succession are not included. The sign reads only “squid soup”, and no shop name, trademark or photograph of a modern shopfront is used.',
      },
    ],
  },
  {
    id: 'lao-pan-squid-soup',
    name: '老潘魷魚羹',
    nameEn: 'Lao Pan Squid Soup',
    status: 'open',
    category: '傳統小吃・羹湯',
    categoryEn: 'Traditional snacks · thick soups',
    seal: '羹',
    sealEn: 'Soup',
    theme: SQUID_SOUP_THEME.id,
    address: '臺北市大同區迪化街一段30號',
    addressEn: '30 Dihua Street, Section 1, Datong District, Taipei',
    // 創立年份未核實：留空（也不因為是傳統小吃就放進 1945–1980 的年代）
    yearNote: '創立年份未核實，資料留空。',
    yearNoteEn: 'Founding year not verified; left blank.',
    sourceIds: ['fb-pannoodles', 'puddings-2023-pannoodles', 'walkerland-2021-laopan', 'andrewplus-laopan'],
    hasInterior: true,
    summary:
      '迪化街一段30號、永樂市場對面的羹湯小吃店：褪色的黃色招牌、紅色波浪邊的雨棚，騎樓下是不鏽鋼攤車；一樓的用餐區可以走進去。',
    summaryEn:
      'A thick-soup snack shop at 30 Dihua Street, Section 1, opposite Yongle Market: a faded yellow signboard, a red awning with a wavy edge, and a stainless-steel cart under the arcade; the ground-floor dining area can be entered.',

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：取代迪化街南側街尾、永樂市場前廣場旁的一般地段（south-18）。
    // 位置、入口、料理檯、座位、貓、資訊熱點與鏡頭都在 data/squidSoupLayout.js
    // （外觀見 builders/laoPanExterior.js，店內見 laoPanInterior.js，食品見 squidSoupWares.js，貓見 components/LaoPanCat.jsx）。
    // position 為店門口（入口的店面線）；從店家名錄前往時站在騎樓下、面向店門，再自己走進去。
    position: laoPanToWorld(LAO_PAN_HOTSPOTS[0].point[0], 0),
    facing: 'north',
    interaction: { radius: 1.1, distance: LAO_PAN_HOTSPOTS[0].point[1] },
    travelYawOffset: 0.35,
    site: { ...LAO_PAN.site },
    building: { archetype: 'lao-pan', width: LAO_PAN.half * 2, depth: -LAO_PAN.back },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '老潘魷魚羹只出現在「老屋新生」（2000–現在）。店面依實地照片的文字描述重建（開發時沒有直接取得照片），未拍攝的部分是示意；一樓可以走進去，樓上只做外觀。創立年份未核實，沒有把它放進其他年代。',
      revivalEn:
        'Lao Pan Squid Soup appears only in “Old Houses, New Life” (2000–present). The shopfront is reconstructed from written descriptions of on-site photographs (no photographs were obtained directly during development), and the parts that were not photographed are illustrative; the ground floor can be entered, while the upper floors are exterior only. The founding year is not verified, so the shop has not been placed in any other era.',
    },
    // 從店家名錄開啟介紹：在迪化街上看騎樓、攤車與招牌（視線從雨棚下方穿過，看得到騎樓裡）
    camera: { distance: 6.4, height: 2.4, side: -1.6, lookHeight: 2.15 },
    hotspots: hotspotsToWorld(LAO_PAN_HOTSPOTS, laoPanToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'shop',
        type: 'text',
        tab: '店家與位置',
        tabEn: 'The shop and its location',
        title: '店家與位置｜永樂市場對面的老潘魷魚羹',
        titleEn: 'The shop and its location | Lao Pan Squid Soup, opposite Yongle Market',
        lead: '老潘魷魚羹在臺北市大同區迪化街一段30號；Facebook 粉絲專頁的名稱是「老潘魷魚羹 Pannoodles house」。',
        leadEn: 'Lao Pan Squid Soup is at 30 Dihua Street, Section 1, Datong District, Taipei; its Facebook page is named “老潘魷魚羹 Pannoodles house”.',
        paragraphs: [
          '位置：2023年的實訪紀錄在標題寫著店在「大稻埕永樂市場對面」。場景裡，老潘在迪化街南側的街尾、永樂市場前廣場的旁邊，隔著街道與廣場面對市場；街道是敘事式的配置，只保留「市場外、街道對面」的相對關係，不是精確的地籍位置。',
          '店面依實地照片的文字描述重建（開發時沒有直接取得照片）：褪色的黃色長方形主招牌上是紅色與深藍色的字，右側是紅底、有裝飾框的直立招牌；紅色帆布雨棚有波浪形的下緣與「冷氣開放」字樣；老街屋的紅磚、灰色牆面、窗框與少量外露的管線。2021年的食記也寫到「招牌顏色已褪去」。主招牌上的品名依食記核對，照片上的舊價格沒有放進場景。',
          '騎樓下、店門口是不鏽鋼攤車（2024年的食記寫到「攤車在外頭」）：玻璃展示罩、疊放的碗與兩口湯鍋。入口在攤車旁邊，一樓是狹長的用餐區：米色方形地磚、靠牆的桌子與紅色、深綠色的塑膠凳，中央留出走道；桌上有醋、胡椒粉與辣椒醬等調味料。',
          '未拍到的部分是示意：店內深處的尺寸與配置、後場與樓上都沒有照片依據，場景以簡化的方式呈現，樓上只做外觀。需求說明提到的一張室內照片標示為「內湖店」，那不是大稻埕這家店的室內，場景沒有依它重建平面。',
          '店裡的黑白貓是依照片的描述加入的情境角色：坐在座位區邊緣的桌腳旁，只會眨眼、轉頭與輕輕擺尾。本站不知道牠的名字，也不表示牠是店家飼養的貓。',
          '創立年份：本站沒有找到可以核實的資料，因此留空，也不把這家店放進其他年代。',
        ],
        paragraphsEn: [
          'Location: the title of a 2023 on-site visit record places the shop “opposite Yongle Market in Dadaocheng”. In the scene, Lao Pan stands at the south end of Dihua Street, beside the forecourt in front of Yongle Market, facing the market across the street and the forecourt; the street is a narrative layout that keeps only the relative position of “outside the market, across the street” and is not a precise cadastral location.',
          'The shopfront is reconstructed from written descriptions of on-site photographs (no photographs were obtained directly during development): a faded yellow rectangular main signboard with red and dark blue lettering, and on the right a vertical red signboard with a decorative frame; a red canvas awning with a wavy lower edge and the words “air-conditioned” (冷氣開放); and the red brick, grey walls, window frames and a few exposed pipes of the old shophouse. A 2021 food blog also notes that “the colours of the sign have faded”. The dish names on the main signboard were checked against food blogs; the old prices seen in the photographs are not included in the scene.',
          'Under the arcade, at the shop door, stands a stainless-steel cart (a 2024 food blog notes that “the cart is outside”): a glass display cover, stacked bowls and two soup pots. The entrance is beside the cart, and the ground floor is a long, narrow dining area: beige square floor tiles, tables along the wall with red and dark green plastic stools, and an aisle left down the middle; the tables carry condiments such as vinegar, pepper and chilli sauce.',
          'The parts that were not photographed are illustrative: the size and layout of the deeper interior, the back of house and the upper floors have no photographic basis, so the scene presents them in simplified form and the upper floors are exterior only. An interior photograph mentioned in the brief was labelled “Neihu branch”; that is not the interior of this Dadaocheng shop, and the scene does not reconstruct the floor plan from it.',
          'The black-and-white cat in the shop is a scenario character added from the descriptions of the photographs: it sits by a table leg at the edge of the seating area and can only blink, turn its head and gently swish its tail. This site does not know its name, nor does it imply that the cat is kept by the shop.',
          'Founding year: this site has found no material that can verify it, so it is left blank, and the shop is not placed in any other era.',
        ],
        facts: [
          { label: '地址', labelEn: 'Address', value: '臺北市大同區迪化街一段30號', valueEn: '30 Dihua Street, Section 1, Datong District, Taipei' },
          { label: '位置', labelEn: 'Location', value: '永樂市場對面（場景為敘事式配置）', valueEn: 'Opposite Yongle Market (the scene is a narrative layout)' },
          { label: '類型', labelEn: 'Type', value: '傳統小吃・羹湯', valueEn: 'Traditional snacks · thick soups' },
          { label: '創立年份', labelEn: 'Founding year', value: '未核實（留空）', valueEn: 'Not verified (left blank)' },
          { label: '場景', labelEn: 'In the scene', value: '一樓用餐區可以走進去；樓上只做外觀', valueEn: 'The ground-floor dining area can be entered; the upper floors are exterior only' },
        ],
        sourceIds: ['fb-pannoodles', 'puddings-2023-pannoodles', 'walkerland-2021-laopan', 'andrewplus-laopan'],
      },
      {
        id: 'market',
        type: 'text',
        tab: '市場周邊飲食',
        tabEn: 'Food around the market',
        title: '市場周邊飲食｜永樂市場、南北貨與一碗羹',
        titleEn: 'Food around the market | Yongle Market, dried goods and a bowl of soup',
        lead: '老潘對面的永樂市場起源於1908年，現在的市場大樓於1985年開業；市場與迪化街的南北貨，構成這一帶的日常飲食。',
        leadEn: 'Yongle Market, opposite Lao Pan, dates from 1908, and the present market building opened in 1985; the market and the dried goods of Dihua Street make up the everyday food of this neighbourhood.',
        paragraphs: [
          '永樂市場：臺北市市場處記載，市場「民國前4年成立」，民國71年拆除舊市場，「改建綜合大樓安置原攤商，74年開業」；臺北市政府的市集資訊介紹，市場一樓是「生鮮蔬果日用品」。',
          '南北貨與乾魷魚：魷魚「時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一」（教育部辭典）。《鏡週刊》裴偉的專欄寫道，早期的大稻埕「成為北部南北貨的集散地」，進口的大魷魚乾「當然是其中的重要商品」；另一篇專欄認為魷魚羹在1970年代於萬華、大稻埕一帶興起，「供貨源頭迪化街就在附近也是原因」。這些是專欄作者的看法，不是學術考證。',
          '羹與沙茶：「羹」是「芶芡而成的濃稠湯汁」；「沙茶」是「用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料」（教育部辭典）。2021年的食記寫到，老潘「整體就是以沙茶最為主要的調味」。',
          '同一個飲食主題：切換到「1945–1980」，慈聖宮的廟口有一個魷魚羹攤的情境示意。那個攤位不是老潘的前身，老潘也不是從廟口遷出；兩者只是一起呈現魷魚羹這種小吃。',
        ],
        paragraphsEn: [
          'Yongle Market: the Taipei Market Administration records that the market was “established 4 years before the Republic (ROC)” (1908), that the old market was demolished in ROC year 71 (1982), and that “a composite building was rebuilt to rehouse the original stallholders and opened in year 74” (1985); the Taipei City Government’s market information says the ground floor of the market sells “fresh vegetables, fruit and daily necessities”.',
          'Dried goods and dried squid: squid is “often split open along the body cavity, gutted and sun-dried, to serve as one of the ingredients that bring out flavour in cooking” (Ministry of Education dictionary). Pei Wei’s Mirror Media column says that early Dadaocheng “became the distribution centre for dried goods from north and south in northern Taiwan”, and that large imported dried squid was “of course one of the important commodities”; another column holds that squid soup rose in the Wanhua and Dadaocheng area in the 1970s, partly because “Dihua Street, the source of supply, is close by”. These are the columnist’s own opinions, not scholarly verification.',
          'Thick soup and shacha: “kenn” (羹) is “a thick soup thickened with starch”; “shacha” (沙茶, sa-te) is “a condiment made from flatfish, fried garlic, ground sesame and various spices” (Ministry of Education dictionary). A 2021 food blog notes that at Lao Pan “the seasoning as a whole is mainly shacha”.',
          'The same food theme: switch to “1945–1980” and the temple front of Cisheng Temple has a scenario illustration of a squid soup stall. That stall is not Lao Pan’s forerunner, nor did Lao Pan move out of the temple front; the two are presented together only because both serve squid soup.',
        ],
        glossary: [
          { term: '鰇魚羹', termEn: 'Squid soup (jiû-hî-kenn)', taiwanese: 'jiû-hî-kenn', taiwaneseSource: 'moe-jiu-hi-kenn', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'A snack: a thick soup made with squid (Ministry of Education, Dictionary of Frequently-Used Taiwanese Southern Min).' },
          { term: '羹', termEn: 'Thick soup (kenn)', taiwanese: 'kenn', taiwaneseSource: 'moe-kenn', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。', definitionEn: 'A thick soup thickened with starch; the variant character 焿 is also used (same source).' },
          { term: '沙茶', termEn: 'Shacha (sa-te)', taiwanese: 'sa-te', taiwaneseSource: 'moe-sa-te', definition: '用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料（同上）。', definitionEn: 'A condiment made from flatfish, fried garlic, ground sesame and various spices (same source).' },
        ],
        sourceIds: ['tcma-yongle-market', 'taipei-market-info-yongle', 'moe-jiu-hi', 'moe-kenn', 'moe-sa-te', 'mirror-2026-squid', 'mirror-2025-squid', 'walkerland-2021-laopan'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表餐點',
        tabEn: 'Signature dishes',
        title: '代表餐點｜四道展示餐點',
        titleEn: 'Signature dishes | Four dishes on display',
        intro:
          '入口旁第一張桌子上的四道展示餐點。品名依網路食記與實訪紀錄核對；這些是展示用的模型，不代表完整或即時的菜單，也不寫配方、份量與售價。',
        introEn:
          'Four dishes on display on the first table beside the entrance. Dish names were checked against online food blogs and on-site visit records; these are display models and do not represent a complete or current menu, and no recipes, portion sizes or prices are given.',
        items: [
          {
            id: 'shacha-squid-geng',
            name: '沙茶魷魚羹',
            nameEn: 'Shacha squid soup',
            category: '羹湯｜沙茶',
            categoryEn: 'Thick soup | Shacha',
            description: '用魷魚作成的羹湯（教育部辭典）。厚實的白碗裡是褐色的羹湯、看得出形狀的魷魚片與少量葉菜。',
            descriptionEn: 'A thick soup made with squid (Ministry of Education dictionary). In a thick white bowl are a brown soup, slices of squid whose shape can be made out, and a little leafy greens.',
            note: '2023年的實訪紀錄在標題寫著「沙茶魷魚焿」；2024年的食記有「沙茶魷魚羹米粉」。',
            noteEn: 'The title of a 2023 on-site visit record reads “shacha squid geng” (沙茶魷魚焿); a 2024 food blog mentions “shacha squid soup with rice vermicelli”.',
          },
          {
            id: 'fish-crisp-geng',
            name: '魚酥羹',
            nameEn: 'Fish-crisp soup',
            category: '羹湯｜魚酥',
            categoryEn: 'Thick soup | Fish crisps',
            description: '魚酥是把魚漿加入麵粉、地瓜粉等，切成條狀或片狀，油炸成的酥脆食品（教育部辭典）；不規則的金黃魚酥片有一部分露出湯面。',
            descriptionEn: 'Fish crisps are a crunchy food made by adding flour, sweet potato starch and the like to fish paste, cutting it into strips or slices and deep-frying it (Ministry of Education dictionary); irregular golden slices of fish crisp partly break the surface of the soup.',
            note: '品名「魚酥羮」見於美食網站彙整的食記摘錄；2021年的食記寫到「魚酥很新鮮的酥脆」。',
            noteEn: 'The name “魚酥羮” appears in food-blog excerpts compiled by a food website; a 2021 food blog notes that “the fish crisps are fresh and crunchy”.',
          },
          {
            id: 'tempura',
            name: '甜不辣',
            nameEn: 'Tianbula (Taiwanese fried fish paste)',
            category: '魚漿製品｜蘿蔔',
            categoryEn: 'Fish-paste products | Radish',
            description: '今日臺灣一般所指的甜不辣，「是指條狀或扁平狀的炸魚漿」（教育部辭典）。盤子裡是不同形狀的魚漿製品、蘿蔔塊與醬汁。',
            descriptionEn: 'What is generally meant by tianbula in Taiwan today “refers to fried fish paste in strips or flat pieces” (Ministry of Education dictionary). On the plate are fish-paste products of different shapes, chunks of radish and sauce.',
            note: '2011到2024年的多篇食記都寫到老潘的甜不辣；盤中的樣子是示意。',
            noteEn: 'Several food blogs from 2011 to 2024 mention Lao Pan’s tianbula; how it looks on the plate is an illustration.',
          },
          {
            id: 'dry-shacha-squid',
            name: '乾拌沙茶生魷魚',
            nameEn: 'Dry-tossed shacha raw squid',
            category: '乾拌｜沙茶',
            categoryEn: 'Dry-tossed | Shacha',
            description: '不加湯的乾拌：魷魚片、豆芽、深色的沙茶醬與綠色的葉片（示意的造型）。',
            descriptionEn: 'Tossed dry, without soup: slices of squid, bean sprouts, dark shacha sauce and green leaves (an illustrative rendering).',
            note: '2024年的食記寫到「乾拌沙茶生魷魚」是限量款。',
            noteEn: 'A 2024 food blog notes that the “dry-tossed shacha raw squid” is a limited-quantity item.',
          },
        ],
        footnote: '品名依2021–2024年的網路食記與2023年的實訪紀錄核對，只代表那些記錄；照片上的舊價格沒有使用。',
        footnoteEn: 'Dish names were checked against online food blogs from 2021–2024 and a 2023 on-site visit record, and represent only those records; the old prices seen in the photographs are not used.',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-hi-soo', 'moe-tian-bu-la', 'moe-sa-te', 'puddings-2023-pannoodles', 'andrewplus-laopan', 'walkerland-2021-laopan', 'fonfood-laopan'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '老潘魷魚羹與魷魚羹飲食文化的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        introEn: 'The introduction to Lao Pan Squid Soup and the food culture of squid soup draws on the sources below; select one to open the original web page. Each entry gives its publication date and how it was used.',
        sourceIds: [
          'fb-pannoodles',
          'puddings-2023-pannoodles',
          'walkerland-2021-laopan',
          'andrewplus-laopan',
          'fonfood-laopan',
          'tcma-yongle-market',
          'taipei-market-info-yongle',
          'moe-jiu-hi-kenn',
          'moe-jiu-hi',
          'moe-kenn',
          'moe-sa-te',
          'moe-hi-soo',
          'moe-tian-bu-la',
          'mirror-2025-squid',
          'mirror-2026-squid',
        ],
        disclaimer:
          '店面依實地照片的文字描述重建（開發時沒有直接取得照片），未拍攝的部分（店內深處、後場、樓上）是示意；需求說明提到的「內湖店」室內照片沒有用來重建大稻埕店的平面。第三方網站的圖片未確認使用權，本站沒有直接使用。實訪紀錄與食記只代表當次的記錄，不當成最新的價格、營業時間或歷史文獻；創立年份未核實，留空。店裡的黑白貓是照片參考的情境角色，沒有名字，也不表示由店家飼養。',
        disclaimerEn:
          'The shopfront is reconstructed from written descriptions of on-site photographs (no photographs were obtained directly during development), and the parts that were not photographed (the deeper interior, the back of house and the upper floors) are illustrative; the “Neihu branch” interior photograph mentioned in the brief was not used to reconstruct the floor plan of the Dadaocheng shop. Rights to images on third-party websites have not been confirmed, so this site does not use them directly. On-site visit records and food blogs represent only the visit or post in question and are not treated as current prices, opening hours or historical documents; the founding year is not verified and is left blank. The black-and-white cat in the shop is a scenario character drawn from the photograph references; it has no name and does not imply that it is kept by the shop.',
      },
    ],
  },

  /* ── 以下店家先作為街景中的可見建築（即將開放），詳細故事與文獻於後續版本補上 ── */
  {
    id: 'temple-mi-tai-mu-stall',
    name: '廟口米苔目攤',
    nameEn: 'Temple-front mi-tai-mu stall',
    status: 'open',
    category: '廟口小吃・米苔目',
    categoryEn: 'Temple-front snacks · mi-tai-mu',
    seal: '米',
    sealEn: 'Rice',
    // 與 2000–現在的永樂米苔目同一個飲食主題（只以主題串連，沒有傳承關係）
    theme: MI_TAI_MU_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    scenarioNoteEn: 'Food-culture scenario illustration',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    yearNoteEn: 'Food-culture scenario illustration: this stall does not correspond to any real business and has no founding year or shop history.',
    sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
    summary:
      '慈聖宮廟口小吃群裡的一攤米苔目：木攤台、帆布棚、煤球爐上的湯鍋與兩張小桌，攤販在攤台後招呼客人。這是飲食文化的情境示意，不是特定的店家。',
    summaryEn:
      'A mi-tai-mu stall among the snack stalls at the front of Cisheng Temple: a wooden counter, a canvas awning, a soup pot on a coal-briquette stove and two small tables, with the vendor greeting customers from behind the counter. This is a food-culture scenario illustration, not a particular business.',

    // ── 場景配置 ──────────────────────────────
    // 只在「庶民生活」出現：慈聖宮廟埕東側的前緣（取代這個年代原本在那裡的一般小吃攤），攤台朝向迪化街。
    // position 為兩張小桌之間的攤台正面；攤位、桌椅、人物與碰撞由 builders/templeMiTaiMuStall.js 產生。
    position: miTaiMuStallToWorld(MI_TAI_MU_STALL_HOTSPOTS[0].point[0], 0),
    facing: 'north',
    // 從店家名錄前往：站在兩張小桌之間的街邊，面向攤台
    interaction: { radius: 1.8, distance: 2.0 },
    site: { ...MI_TAI_MU_STALL_SITE },
    building: { archetype: 'temple-mi-tai-mu-stall', width: 2.6, depth: 3.2 },
    buildingByEra: {
      postwar: { condition: 'aged' },
    },
    eraNotes: {
      postwar:
        '廟口的米苔目攤只出現在「庶民生活」（1945–1980），是飲食文化的情境示意：攤位的樣子、位置、桌椅與人物依一般的廟口小吃攤設計，不代表某一家實際的攤位，也不是2000年之後永樂米苔目的前身。',
      postwarEn:
        'The temple-front mi-tai-mu stall appears only in “Everyday Life” (1945–1980) and is a food-culture scenario illustration: its look, position, tables and figures follow a generic temple-front snack stall and do not represent any real stall, nor is it the forerunner of Yongle Mi-tai-mu after 2000.',
    },
    camera: { distance: 4.4, height: 2.0, side: 2.6, lookHeight: 1.1 },
    hotspots: hotspotsToWorld(MI_TAI_MU_STALL_HOTSPOTS, miTaiMuStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'temple-food',
        type: 'text',
        tab: '廟口的米苔目',
        tabEn: 'Mi-tai-mu at the temple front',
        title: '廟口的米苔目',
        titleEn: 'Mi-tai-mu at the temple front',
        lead: '米苔目是台灣常見的庶民小吃，在戰後至1980年代的大稻埕，也屬於廟口與街邊常見的日常飲食之一。',
        leadEn: 'Mi-tai-mu is a common everyday snack in Taiwan, and in Dadaocheng from the postwar years to the 1980s it was likewise one of the ordinary foods found at temple fronts and on the street.',
        paragraphs: [
          '說明｜上面這一段是本站對米苔目作為庶民小吃的一般介紹。本站沒有找到記錄戰後大稻埕廟口米苔目攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰。',
          '史料｜教育部《臺灣台語常用詞辭典》在「目」（ba̍k，細孔）的用例裡收錄「米篩目」（bí-thai-ba̍k）：「米篩的網目，也指篩出的米條食品」。華語常寫作「米苔目」。',
          '史料｜辭典裡的「廟口」是「廟門口、廟前廣場」，賣點心小吃的攤販稱為「點心擔」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮「廟前則是一排老牌的小吃攤」。',
          '情境設計｜場景中的攤位：淡綠色油漆、磨舊的木攤台與金屬工作面，淡藍色的帆布棚，煤球爐上的大湯鍋（掀開一半的木鍋蓋、少量蒸氣），一盆生的米苔目、疊碗、展示的一碗湯米苔目與兩碟小菜，以及兩張小方桌與木凳。攤販在攤台後招呼客人，兩位客人坐著吃，一位站在旁邊等。招牌只寫「米苔目」，沒有店名或商標。攤位與人物都是依一般的廟口小吃攤設計的示意。',
          '同一個飲食主題｜切換到「2000–現在」，可以在迪化街北側走進永樂米苔目的店面。兩者只是同樣以米苔目為主題：場景沒有表示這個攤位是永樂米苔目的前身，也不表示永樂米苔目當時已經在這裡擺攤。',
        ],
        paragraphsEn: [
          'Note | The paragraph above is this site’s general introduction to mi-tai-mu as an everyday snack. This site has found no document or photograph recording a mi-tai-mu stall at the temple front in postwar Dadaocheng, so it does not say which year or which stall, nor who the vendor was.',
          'Historical source | Among the example entries under “目” (ba̍k, a fine hole), the Ministry of Education’s Dictionary of Frequently-Used Taiwanese Southern Min lists “bí-thai-ba̍k” (米篩目): “the mesh of a rice sieve; also the rice-strip food that is sieved out”. In Mandarin it is often written 米苔目.',
          'Historical source | In the dictionary, “biō-kháu” (temple front) means “the entrance of a temple, the square in front of a temple”, and vendors selling light snacks are called “tiám-sim-tànn”. Wikipedia’s entry on Dadaocheng Cisheng Temple records that “in front of the temple is a row of long-established snack stalls”.',
          'Scenario design | The stall in the scene has a worn wooden counter painted pale green with a metal work surface, a pale blue canvas awning, a large soup pot on a coal-briquette stove (its wooden lid half lifted, a little steam rising), a basin of raw mi-tai-mu, stacked bowls, a displayed bowl of mi-tai-mu soup and two small side dishes, and two small square tables with wooden stools. The vendor greets customers from behind the counter; two customers sit eating and one stands waiting beside them. The sign reads only “mi-tai-mu” (米苔目), with no shop name or trademark. The stall and its figures are an illustration based on a generic temple-front snack stall.',
          'The same food theme | Switch to “2000–present” and you can walk into the shopfront of Yongle Mi-tai-mu on the north side of Dihua Street. The two share only the theme of mi-tai-mu: the scene does not suggest that this stall was the forerunner of Yongle Mi-tai-mu, nor that Yongle Mi-tai-mu already kept a stall here at that time.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '慈聖宮廟埕東側的前緣、廟口小吃群裡（場景配置）', valueEn: 'Front edge of the east side of the Cisheng Temple forecourt, among the temple-front snack stalls (scene layout)' },
          { label: '年代', labelEn: 'Era', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）', valueEn: '1945–1980, “Everyday Life” (the stall itself has no corresponding year)' },
          { label: '性質', labelEn: 'Nature', value: '飲食文化情境示意，不是特定的店家', valueEn: 'A food-culture scenario illustration, not a particular business' },
          { label: '招牌', labelEn: 'Shop sign', value: '只寫「米苔目」', valueEn: 'Reads only “mi-tai-mu” (米苔目)' },
        ],
        glossary: [
          { term: '米篩目（米苔目）', termEn: 'Mi-tai-mu (bí-thai-ba̍k, rice noodle strips)', taiwanese: 'bí-thai-ba̍k', taiwaneseSource: 'moe-bi-thai-bak-entry', definition: '米篩的網目，也指篩出的米條食品（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'The mesh of a rice sieve; also the rice-strip food that is sieved out (Ministry of Education, Dictionary of Frequently-Used Taiwanese Southern Min).' },
          { term: '廟口', termEn: 'Temple front (biō-kháu)', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。', definitionEn: 'The entrance of a temple, the square in front of a temple (same source).' },
          { term: '點心擔', termEn: 'Snack seller’s carrying-pole stall (tiám-sim-tànn)', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。', definitionEn: 'A vendor who sells light snacks (same source).' },
        ],
        sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
      },
      {
        id: 'bowl',
        type: 'foods',
        tab: '一碗米苔目',
        tabEn: 'A bowl of mi-tai-mu',
        title: '一碗米苔目',
        titleEn: 'A bowl of mi-tai-mu',
        intro: '攤台上展示的一碗湯米苔目與兩碟小菜，強調庶民的日常飲食。材料與做法是一般的說明，不是某一家的配方。',
        introEn: 'A bowl of mi-tai-mu soup and two small side dishes on display on the counter, emphasising everyday ordinary food. Ingredients and method are given in general terms and are not any one shop’s recipe.',
        items: [
          {
            id: 'temple-mi-tai-mu',
            name: '湯米苔目',
            nameEn: 'Mi-tai-mu soup',
            category: '米食｜湯',
            categoryEn: 'Rice food | Soup',
            description: '「米篩目」是篩出的米條食品（教育部辭典）：短短的、兩端略尖的白色米條，盛在湯裡，撒上韭菜與油蔥酥。',
            descriptionEn: '“Bí-thai-ba̍k” is a rice-strip food that is sieved out (Ministry of Education dictionary): short white rice strips with slightly pointed ends, served in soup and sprinkled with Chinese chives and fried shallots.',
            note: '場景中的一碗是示意，不代表配方或份量；這個攤位不對應任何實際的店家。',
            noteEn: 'The bowl in the scene is an illustration and does not represent a recipe or a portion size; this stall does not correspond to any real business.',
          },
          {
            id: 'side-dishes',
            name: '小菜（示意）',
            nameEn: 'Side dishes (illustrative)',
            category: '配菜',
            categoryEn: 'Side dishes',
            description: '攤台上兩碟簡單的小菜：油豆腐與燙青菜。',
            descriptionEn: 'Two simple side dishes on the counter: fried tofu and blanched greens.',
            note: '本站沒有查到戰後廟口米苔目攤的菜色紀錄；這兩碟只是一般小吃攤的示意。',
            noteEn: 'This site has found no record of the dishes at postwar temple-front mi-tai-mu stalls; these two plates are only an illustration of a generic snack stall.',
          },
        ],
        footnote: '展示的一碗與小菜是示意模型，不代表價格、份量或配方。',
        footnoteEn: 'The bowl and side dishes on display are illustrative models and do not represent a price, portion size or recipe.',
        sourceIds: ['moe-bi-thai-bak'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '廟口米苔目攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        introEn: 'The introduction to the temple-front mi-tai-mu stall draws on the sources below; select one to open the original web page. Each entry gives its publication date and how it was used.',
        sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
        disclaimer:
          '廟口的米苔目攤是「飲食文化情境示意」：攤位的樣子、位置、桌椅與人物都是依一般的廟口小吃攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。招牌只寫「米苔目」，沒有使用任何店名、商標或現代店面的照片。',
        disclaimerEn:
          'The temple-front mi-tai-mu stall is a “food-culture scenario illustration”: its look, position, tables and figures follow a generic temple-front snack stall and do not represent any real stall; unverified dates, shop histories and lines of succession are not included. The sign reads only “mi-tai-mu” (米苔目), and no shop name, trademark or photograph of a modern shopfront is used.',
      },
    ],
  },
  {
    id: 'temple-douhua-stall',
    name: '廟口豆花攤',
    nameEn: 'Temple-front douhua stall',
    status: 'open',
    category: '廟口甜食・豆花',
    categoryEn: 'Temple-front sweets · douhua',
    seal: '豆',
    sealEn: 'Dou',
    // 飲食主題：只以食物主題連結 2000–現在的導演的豆花店（參訪對照，沒有品牌傳承關係）
    theme: DOUHUA_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    scenarioNoteEn: 'Food-culture scenario illustration',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    yearNoteEn: 'Food-culture scenario illustration: this stall does not correspond to any actual shop, and has no founding year or shop history.',
    sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
    summary:
      '慈聖宮廟口小吃區裡的一攤豆花：木框推車、有蓋的豆花桶、糖水壺與兩張木凳，攤販用扁平的舀匙舀豆花。這是飲食文化的情境示意，不是特定的店家。',
    summaryEn:
      'A douhua (tofu pudding) stall in the snack area in front of Cisheng Temple: a wooden-framed cart, a lidded douhua tub, a syrup pot and two wooden stools, with the vendor scooping the douhua with a flat ladle. This is a food-culture scenario illustration, not a specific shop.',

    // ── 場景配置 ──────────────────────────────
    // 只在「庶民生活」出現：慈聖宮廟埕西側的後段、天公爐與榕樹之間（取代這個年代原本在榕樹後方的一般小吃攤），推車朝向廟埕中央的通道。
    // position 為推車前的互動點；推車、布棚、木凳、人物與碰撞由 builders/templeDouhuaStall.js 產生。
    position: douhuaStallToWorld(DOUHUA_STALL_HOTSPOTS[0].point[0], 0),
    facing: 'east',
    // 從店家名錄前往：站在推車前的通道邊，面向推車
    interaction: { radius: 1.6, distance: 1.6 },
    site: { ...DOUHUA_STALL_SITE },
    building: { archetype: 'temple-douhua-stall', width: 2.0, depth: 2.4 },
    buildingByEra: {
      postwar: { condition: 'aged' },
    },
    eraNotes: {
      postwar:
        '廟口的豆花攤只出現在「庶民生活」（1945–1980），是飲食文化的情境示意：攤位的樣子、位置與人物依一般的推車式甜食攤設計，不代表某一家實際的攤位，也不是2000年之後導演的豆花店的前身；展示在這個年代也不代表豆花起源於1945年。',
      postwarEn:
        'The temple-front douhua stall appears only in “Everyday Life” (1945–1980). It is a food-culture scenario illustration: the stall’s look, position and figures follow a generic cart-style sweets stall. It does not represent any actual stall, and it is not the predecessor of Action! Bar, the douhua shop of the 2000s; showing it in this era does not mean douhua originated in 1945.',
    },
    camera: { distance: 3.8, height: 1.9, side: 2.0, lookHeight: 1.0 },
    hotspots: hotspotsToWorld(DOUHUA_STALL_HOTSPOTS, douhuaStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'douhua-stall',
        type: 'text',
        tab: '豆花與甜食攤',
        tabEn: 'Douhua and sweets stall',
        title: '豆花與甜食攤',
        titleEn: 'Douhua and sweets stall',
        lead: '廟口小吃區裡的一攤豆花：木框推車上放著有蓋的豆花桶與糖水壺，攤販用扁平的舀匙把豆花一片一片舀進碗裡，淋上糖水，喜歡的話再加一小撮花生。',
        leadEn: 'A douhua stall in the temple-front snack area: on a wooden-framed cart sit a lidded douhua tub and a syrup pot. The vendor scoops the douhua into a bowl, slice by slice, with a flat ladle, pours over the syrup and, if you like, adds a small pinch of peanuts.',
        paragraphs: [
          '說明｜這是本站依一般的推車式甜食攤設計的飲食文化情境示意。本站沒有找到記錄戰後大稻埕慈聖宮廟口豆花攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰；攤位出現在1945–1980，也不表示豆花是從這個時期才有的。',
          '史料｜教育部《臺灣台語常用詞辭典》的「豆花」（tāu-hue）：「在豆漿中加入少量的鹽滷或石膏，使能凝結成比豆腐還嫩的食品。通常加糖水和花生，當作甜食。」',
          '史料｜農業部〈豆花凝膠機制的介紹〉說明，豆漿中的大豆蛋白和凝固劑作用，形成凝膠的結構；凝固劑不同，口感也不同，例如以鹽滷凝結的豆花口感偏硬脆。',
          '史料｜辭典裡賣點心小吃的攤販稱為「點心擔」，「廟口」是「廟門口、廟前廣場」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮「廟前則是一排老牌的小吃攤」；這段記載沒有提到豆花，本站也不據此推定當時的攤位。',
          '情境設計｜木框推車（一端兩個木輪，另一端是腳架與推把）、推車背面兩根木柱撐起的小布棚，棚角掛著只寫「豆花」的米白布幌；推車上是有蓋的圓形木豆花桶與扁平的舀匙、糖水壺、一小盆花生、泡著湯匙的水盆與疊碗，以及展示的兩碗豆花；推車前兩張木凳，推車後是攤販舀豆花的空間。攤販是沒有名字的情境人物。',
          '現代相關店家｜切換到「2000–現在」，迪化街一段224巷裡有導演的豆花店。它和這個攤位只是同類食物的參訪對照：導演的豆花店有自己的店史（2019年的豆花車、2021年的店面），場景與介紹都不表示它由廟口的豆花攤發展而來，兩者也沒有品牌的傳承關係。',
        ],
        paragraphsEn: [
          'Note | This is a food-culture scenario illustration that this site designed on the model of a generic cart-style sweets stall. We found no document or photograph recording a douhua stall in front of Cisheng Temple in post-war Dadaocheng, so we give no year, name no particular stall and do not say who the vendor was; that the stall appears in 1945–1980 also does not mean douhua only existed from this period.',
          'Source | The entry for “douhua” (tāu-hue) in the Ministry of Education’s Dictionary of Frequently-Used Taiwan Taiwanese: “Food made by adding a small amount of bittern or gypsum to soy milk so that it sets more tenderly than tofu. Usually served with syrup and peanuts as a sweet treat.” (Translation by this site.)',
          'Source | The Ministry of Agriculture’s introduction to the gel mechanism of douhua explains that the soy proteins in soy milk react with the coagulant to form a gel structure; different coagulants give different textures, for example douhua set with bittern tends to be firmer and crisper.',
          'Source | The dictionary calls a vendor who sells snacks a “dim-sum carrier” (tiám-sim-tànn), and defines “temple-front” (biō-kháu) as “the entrance of a temple, the square in front of a temple”. Wikipedia’s entry on Cisheng Temple in Dadaocheng records that in front of the temple “is a row of long-established snack stalls”; this passage does not mention douhua, and this site does not use it to infer what stalls stood there at the time.',
          'Scenario design | A wooden-framed cart (two wooden wheels at one end, a prop leg and handles at the other); a small cloth awning held up by two wooden posts at the back of the cart, with an off-white cloth banner at the corner of the awning that reads only “豆花” (douhua); on the cart, a lidded round wooden douhua tub, a flat ladle, a syrup pot, a small basin of peanuts, a water basin with spoons soaking in it, a stack of bowls and two bowls of douhua on display; two wooden stools in front of the cart, and behind it the space where the vendor scoops the douhua. The vendor is an unnamed scenario figure.',
          'Related modern shop | Switch to “2000–present” and you will find Action! Bar, a douhua shop in Lane 224, Section 1, Dihua Street. It is only a comparison visit for the same kind of food: Action! Bar has its own history (a douhua cart in 2019, a shopfront in 2021), and neither the scene nor the text suggests that it grew out of the temple-front douhua stall; the two have no brand lineage.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '慈聖宮廟埕西側的後段、天公爐與榕樹之間（場景配置）', valueEn: 'Rear section of the west side of Cisheng Temple’s forecourt, between the Tiangong incense burner and the banyan tree (scene layout)' },
          { label: '年代', labelEn: 'Era', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）', valueEn: '1945–1980 “Everyday Life” (the stall itself has no corresponding year)' },
          { label: '性質', labelEn: 'Nature', value: '飲食文化情境示意，不是特定的店家', valueEn: 'Food-culture scenario illustration, not a specific shop' },
          { label: '招牌', labelEn: 'Shop sign', value: '只寫「豆花」的米白布幌', valueEn: 'An off-white cloth banner reading only “豆花” (douhua)' },
          { label: '現代相關店家', labelEn: 'Related modern shop', value: '導演的豆花店（2000–現在；同類食物的參訪對照，沒有品牌傳承關係）', valueEn: 'Action! Bar (2000–present; a comparison visit for the same kind of food, with no brand lineage)' },
        ],
        glossary: [
          { term: '豆花', termEn: 'Douhua (tofu pudding)', taiwanese: 'tāu-hue', taiwaneseSource: 'moe-douhua', definition: '豆漿加入少量的鹽滷或石膏凝結成比豆腐還嫩的食品，通常加糖水和花生當作甜食（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'Food made by setting soy milk with a small amount of bittern or gypsum, more tender than tofu; usually served with syrup and peanuts as a sweet treat (Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese).' },
          { term: '點心擔', termEn: 'Dim-sum carrier (dian-xin dan)', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。', definitionEn: 'A vendor who sells snacks and light refreshments (same source).' },
          { term: '廟口', termEn: 'Temple-front (miao kou)', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。', definitionEn: 'The entrance of a temple, the square in front of a temple (same source).' },
        ],
        sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
      },
      {
        id: 'douhua-bowls',
        type: 'foods',
        tab: '兩碗豆花',
        tabEn: 'Two bowls of douhua',
        title: '兩碗豆花',
        titleEn: 'Two bowls of douhua',
        intro: '推車上展示的兩碗豆花：米白色、薄而柔軟的豆花片浮在淡琥珀色的糖水裡。材料是辭典的一般說明，不是某一家的配方。',
        introEn: 'Two bowls of douhua on display on the cart: thin, soft, off-white slices floating in pale amber syrup. The ingredients follow the dictionary’s general description and are not any one shop’s recipe.',
        items: [
          {
            id: 'temple-plain-douhua',
            name: '原味糖水豆花',
            nameEn: 'Plain douhua in syrup',
            category: '甜食｜豆花',
            categoryEn: 'Sweets | Douhua',
            description: '用扁平的舀匙一片一片舀起的豆花，淋上淡琥珀色的糖水。豆花是豆漿加少量鹽滷或石膏凝結而成，比豆腐還嫩（教育部辭典）。',
            descriptionEn: 'Douhua scooped slice by slice with a flat ladle and topped with pale amber syrup. Douhua is soy milk set with a small amount of bittern or gypsum, more tender than tofu (Ministry of Education dictionary).',
            note: '場景中的一碗是示意，不代表配方、甜度或份量；這個攤位不對應任何實際的店家。',
            noteEn: 'The bowl in the scene is an illustration and does not represent a recipe, sweetness or portion size; this stall does not correspond to any actual shop.',
          },
          {
            id: 'temple-peanut-douhua',
            name: '花生豆花',
            nameEn: 'Peanut douhua',
            category: '甜食｜豆花',
            categoryEn: 'Sweets | Douhua',
            description: '同樣的豆花與糖水，再加一小撮花生。教育部辭典的說明：豆花「通常加糖水和花生，當作甜食」。',
            descriptionEn: 'The same douhua and syrup, with a small pinch of peanuts added. The Ministry of Education dictionary says douhua is “usually served with syrup and peanuts as a sweet treat” (translation by this site).',
            note: '花生做成小小的橢圓顆粒；本站沒有查到戰後廟口豆花攤的配料紀錄，這一碗只是一般的示意。',
            noteEn: 'The peanuts are modelled as small oval grains; this site found no record of the toppings at post-war temple-front douhua stalls, so this bowl is only a general illustration.',
          },
        ],
        footnote: '展示的兩碗是示意模型，不代表價格、份量或配方。',
        footnoteEn: 'The two bowls on display are illustrative models and do not represent prices, portions or recipes.',
        sourceIds: ['moe-douhua'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '廟口豆花攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        introEn: 'The introduction to the temple-front douhua stall is compiled from the sources below. Select one to open the original web page; each entry shows its publication date and how it was used.',
        sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
        disclaimer:
          '廟口的豆花攤是「飲食文化情境示意」：攤位的樣子、位置與人物都是依一般的推車式甜食攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。布幌只寫「豆花」，沒有使用導演的豆花店或任何店家的店名、商標、包裝與裝潢。',
        disclaimerEn:
          'The temple-front douhua stall is a “food-culture scenario illustration”: its look, position and figures were designed on the model of a generic cart-style sweets stall and do not represent any actual stall. Unverified eras, shop histories and lineages have not been included. The cloth banner reads only “豆花” (douhua); it does not use the name, logo, packaging or decor of Action! Bar or any other shop.',
      },
    ],
  },
  {
    id: 'temple-kueh-stall',
    name: '廟口糕粿攤',
    nameEn: 'Temple-front kueh stall',
    status: 'open',
    category: '廟口小吃・糕粿',
    categoryEn: 'Temple-front snacks · kueh (rice cakes)',
    seal: '粿',
    sealEn: 'Kueh',
    // 飲食主題：只以食物主題連結 2000–現在永樂市場的好粿緣（參訪對照，沒有品牌傳承關係）
    theme: KUEH_THEME.id,
    scenarioNote: '飲食文化情境示意',
    scenarioNoteEn: 'Food-culture scenario illustration',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    yearNoteEn: 'Food-culture scenario illustration: this stall does not correspond to any actual shop, and has no founding year or shop history.',
    sourceIds: ['moe-guo', 'moe-cao-guo', 'moe-hong-gui', 'moe-oo-kue', 'moe-cai-tau-guo', 'nmth-hong-gui-mold'],
    summary:
      '慈聖宮廟口小吃區裡的一攤糕粿：低矮的木桌上有竹蒸籠與分區的木托盤，擺著草仔粿、紅龜粿、芋粿與蘿蔔糕。這是飲食文化的情境示意，不是特定的店家。',
    summaryEn:
      'A kueh (rice cake) stall in the snack area in front of Cisheng Temple: on a low wooden table stand bamboo steamers and wooden trays with separate sections, holding cao-a-kueh, ang-ku-kueh, taro cake and radish cake. This is a food-culture scenario illustration, not a specific shop.',

    // ── 場景配置 ──────────────────────────────
    // 只在「庶民生活」出現：慈聖宮廟埕東側的後段、天公爐與榕樹之間（取代這個年代原本在榕樹後方的一般小吃攤），矮桌朝向廟埕中央的通道。
    // position 為矮桌前的互動點；矮桌、橫牌、器具、人物與碰撞由 builders/templeKuehStall.js 產生。
    position: kuehStallToWorld(KUEH_STALL_HOTSPOTS[0].point[0], 0),
    facing: 'west',
    interaction: { radius: 1.6, distance: 1.6 },
    site: { ...KUEH_STALL_SITE },
    building: { archetype: 'temple-kueh-stall', width: 2.0, depth: 2.4 },
    buildingByEra: {
      postwar: { condition: 'aged' },
    },
    eraNotes: {
      postwar:
        '廟口的糕粿攤只出現在「庶民生活」（1945–1980），是飲食文化的情境示意：攤位的樣子、位置與人物依一般的矮桌式糕粿攤設計，不代表某一家實際的攤位，也不是2000年之後好粿緣的前身；展示在這個年代也不代表這些米食起源於1945年。',
      postwarEn:
        'The temple-front kueh stall appears only in “Everyday Life” (1945–1980). It is a food-culture scenario illustration: the stall’s look, position and figures follow a generic low-table kueh stall. It does not represent any actual stall, and it is not the predecessor of Haoguoyuan, the kueh shop of the 2000s; showing it in this era does not mean these rice foods originated in 1945.',
    },
    camera: { distance: 3.8, height: 1.9, side: -2.0, lookHeight: 0.9 },
    hotspots: hotspotsToWorld(KUEH_STALL_HOTSPOTS, kuehStallToWorld),

    chapters: [
      {
        id: 'kueh-stall',
        type: 'text',
        tab: '糕粿與米食',
        tabEn: 'Kueh and rice foods',
        title: '糕粿與日常／節慶米食',
        titleEn: 'Kueh: everyday and festival rice foods',
        lead: '廟口小吃區裡的一攤糕粿：低矮的木桌上擺著竹蒸籠與分區的木托盤，草仔粿與紅龜粿墊著葉子，旁邊的木板上是芋粿與蘿蔔糕，一部分用乾淨的布巾蓋著。',
        leadEn: 'A kueh stall in the temple-front snack area: on a low wooden table stand bamboo steamers and wooden trays with separate sections. The cao-a-kueh and ang-ku-kueh rest on leaves, and on the board beside them are taro cake and radish cake, some of it covered with a clean cloth.',
        paragraphs: [
          '說明｜這是本站依一般的矮桌式糕粿攤設計的飲食文化情境示意。本站沒有找到記錄戰後大稻埕慈聖宮廟口糕粿攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰；攤位出現在1945–1980，也不表示這些米食是從這個時期才有的。',
          '史料｜教育部《臺灣台語常用詞辭典》的「粿」：「糕的總稱，指用糯米或粳米等做成的食品。因所加的原料不同而有不同的稱法。」農業部〈「粿」然如此製粿稻米品種介紹〉說明，蘿蔔糕、碗粿等以在來米製成，圓糯米磨粉後則製成草仔粿、紅龜粿、菜包等。',
          '節慶的米食｜辭典的「草仔粿」：外皮以「粿粞」加入艾草或鼠麴草揉成，外墊黃槿葉或月桃葉等，以蒸籠蒸熟，常做為農曆七月普渡或清明掃墓時的供品。「紅龜粿」：粿皮染紅、以模具印上龜型的圖樣後蒸製，經常用來祭拜神明、酬神，或在添丁時分送親友。國立臺灣歷史博物館的粿模藏品說明，神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽都可見到紅龜粿。',
          '日常與年節的米食｜辭典的「芋粿」是「臺灣小吃的一種。以米漿和芋頭為主要材料，蒸熟後食用」；「菜頭粿」就是蘿蔔糕，是在來米漿拌入炒過的蘿蔔絲、蝦米等配料蒸製而成。農業部的〈年糕＆蘿蔔糕〉提到，「菜頭」與「彩頭」諧音，蘿蔔糕因此成為過年必備的菜色。',
          '情境設計｜兩組木架腳撐起的矮木桌、桌後兩根木柱撐著的木製橫牌「傳統糕粿」；桌上一疊竹蒸籠（少量蒸氣）、分區的木托盤（草仔粿、紅龜粿，墊著葉子，後排用布巾蓋著）、木板上的芋粿與蘿蔔糕（整塊與切片）與食品夾；桌後是少量備用的籃筐與糕模。攤販是沒有名字的情境人物。草仔粿與紅龜粿是主要的展示，芋粿與蘿蔔糕是傳統米食的示意。',
          '現代相關店家｜切換到「2000–現在」，永樂市場一樓有好粿緣的粿攤。它和這個攤位只是同類食物的參訪對照：場景與介紹都不表示好粿緣由廟口的糕粿攤發展而來，兩者沒有品牌的傳承關係；這裡的四種米食也不是好粿緣的菜單。',
        ],
        paragraphsEn: [
          'Note | This is a food-culture scenario illustration that this site designed on the model of a generic low-table kueh stall. We found no document or photograph recording a kueh stall in front of Cisheng Temple in post-war Dadaocheng, so we give no year, name no particular stall and do not say who the vendor was; that the stall appears in 1945–1980 also does not mean these rice foods only existed from this period.',
          'Source | The entry for “kueh” (粿) in the Ministry of Education’s Dictionary of Frequently-Used Taiwan Taiwanese: “A general term for cakes, referring to foods made from glutinous or japonica rice and the like. Different added ingredients give different names.” (Translation by this site.) The Ministry of Agriculture’s introduction to rice varieties for making kueh explains that radish cake, bowl-shaped savoury rice cake and the like are made from long-grain (zai-lai) rice, while round glutinous rice ground into flour is made into cao-a-kueh, ang-ku-kueh, vegetable buns and so on.',
          'Festival rice foods | The dictionary’s “cao-a-kueh” (herb kueh): the skin is kneaded from “kueh-tshè” (rice dough) with mugwort or cudweed, set on a leaf such as hibiscus tiliaceus or shell ginger, and steamed in a steamer; it is often an offering at the Ghost Festival in the seventh lunar month or when sweeping graves at Qingming. “Ang-ku-kueh” (red tortoise kueh): the skin is dyed red, pressed with a mould into a tortoise pattern and then steamed; it is often used to worship the gods and give thanks to them, or to share with relatives and friends when a son is born. The National Museum of Taiwan History’s note on its kueh moulds says ang-ku-kueh can be seen at the birthdays of deities, festival offerings, ancestor worship and elders’ birthday celebrations.',
          'Everyday and New Year rice foods | The dictionary’s “taro kueh” is “a kind of Taiwanese snack made mainly from rice batter and taro, eaten steamed”; “cai-tau-kueh” is radish cake, made by steaming long-grain rice batter mixed with stir-fried shredded radish, dried shrimp and other ingredients. The Ministry of Agriculture’s piece on New Year cake and radish cake notes that “cai-tau” (radish) sounds like “cai-tou” (good fortune), which is why radish cake became a must-have dish for the New Year. (Translation by this site.)',
          'Scenario design | A low wooden table on two sets of wooden trestle legs, with a wooden signboard reading “傳統糕粿” (traditional kueh) held up by two wooden posts behind the table; on the table, a stack of bamboo steamers (with a little steam), wooden trays with separate sections (cao-a-kueh and ang-ku-kueh on leaves, the back row covered with a cloth), taro cake and radish cake on a board (whole and sliced) with food tongs; behind the table, a few spare baskets and kueh moulds. The vendor is an unnamed scenario figure. The cao-a-kueh and ang-ku-kueh are the main display; the taro cake and radish cake are illustrations of traditional rice foods.',
          'Related modern shop | Switch to “2000–present” and you will find the kueh stall of Haoguoyuan on the ground floor of Yongle Market. It is only a comparison visit for the same kind of food: neither the scene nor the text suggests that Haoguoyuan grew out of the temple-front kueh stall, and the two have no brand lineage; nor are the four rice foods here Haoguoyuan’s menu.',
        ],
        facts: [
          { label: '位置', labelEn: 'Location', value: '慈聖宮廟埕東側的後段、天公爐與榕樹之間（場景配置）', valueEn: 'Rear section of the east side of Cisheng Temple’s forecourt, between the Tiangong incense burner and the banyan tree (scene layout)' },
          { label: '年代', labelEn: 'Era', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）', valueEn: '1945–1980 “Everyday Life” (the stall itself has no corresponding year)' },
          { label: '性質', labelEn: 'Nature', value: '飲食文化情境示意，不是特定的店家', valueEn: 'Food-culture scenario illustration, not a specific shop' },
          { label: '招牌', labelEn: 'Shop sign', value: '木製橫牌「傳統糕粿」', valueEn: 'A wooden signboard reading “傳統糕粿” (traditional kueh)' },
          { label: '現代相關店家', labelEn: 'Related modern shop', value: '好粿緣（2000–現在，永樂市場一樓；同類食物的參訪對照，沒有品牌傳承關係）', valueEn: 'Haoguoyuan (2000–present, ground floor of Yongle Market; a comparison visit for the same kind of food, with no brand lineage)' },
        ],
        glossary: [
          { term: '粿', termEn: 'Kueh (rice cake)', taiwanese: 'kué', taiwaneseSource: 'moe-guo', definition: '糕的總稱，指用糯米或粳米等做成的食品（教育部《臺灣台語常用詞辭典》）。', definitionEn: 'A general term for cakes, referring to foods made from glutinous or japonica rice and the like (Ministry of Education, Dictionary of Frequently-Used Taiwan Taiwanese).' },
          { term: '粿粞', termEn: 'Kueh-tshè (rice dough)', taiwanese: 'kué-tshè', taiwaneseSource: 'moe-kue-tshe', definition: '草仔粿的外皮材料：加入艾草或鼠麴草揉成（同上，「草仔粿」）。', definitionEn: 'The material for the skin of cao-a-kueh: kneaded with mugwort or cudweed (same source, entry for “cao-a-kueh”).' },
          { term: '粿模', termEn: 'Kueh mould', definition: '印出紅龜粿龜甲紋路的木模；早期農業社會居家常見（國立臺灣歷史博物館）。', definitionEn: 'A wooden mould that presses the tortoise-shell pattern onto ang-ku-kueh; common in homes in the early agricultural society (National Museum of Taiwan History).' },
        ],
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moa-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
      },
      {
        id: 'kueh-foods',
        type: 'foods',
        tab: '四種米食',
        tabEn: 'Four rice foods',
        title: '四種傳統米食',
        titleEn: 'Four traditional rice foods',
        intro: '托盤與木板上分盤陳列的四種米食：形狀、顏色與厚度各不相同。說明整理自教育部辭典、農業部與國立臺灣歷史博物館的資料，是一般的說明，不是某一家的配方或菜單。',
        introEn: 'Four rice foods displayed on separate trays and boards, each with a different shape, colour and thickness. The descriptions are compiled from the Ministry of Education dictionary, the Ministry of Agriculture and the National Museum of Taiwan History; they are general descriptions, not any one shop’s recipe or menu.',
        items: [
          {
            id: 'temple-cao-a-kue',
            name: '草仔粿',
            nameEn: 'Cao-a-kueh (herb kueh)',
            category: '米食｜節慶（主要展示）',
            categoryEn: 'Rice food | Festival (main display)',
            description: '深綠色、扁圓的粿，表面略有手捏的起伏，墊著葉子。外皮以粿粞加入艾草或鼠麴草揉成，以蒸籠蒸熟；常做為農曆七月普渡或清明掃墓時的供品（教育部辭典）。',
            descriptionEn: 'A dark green, flat round kueh whose surface has slight undulations from hand-shaping, set on a leaf. The skin is kneaded from rice dough with mugwort or cudweed and steamed in a steamer; it is often an offering at the Ghost Festival in the seventh lunar month or when sweeping graves at Qingming (Ministry of Education dictionary).',
            note: '內餡沒有切開展示；場景中的模型不代表口味、配方或份量。',
            noteEn: 'The filling is not shown cut open; the model in the scene does not represent flavour, recipe or portion size.',
          },
          {
            id: 'temple-ang-ku-kue',
            name: '紅龜粿',
            nameEn: 'Ang-ku-kueh (red tortoise kueh)',
            category: '米食｜節慶（主要展示）',
            categoryEn: 'Rice food | Festival (main display)',
            description: '紅色、扁橢圓的粿，表面是印模壓出的龜甲紋——中央的六角形與外圈的龜殼紋路（國立臺灣歷史博物館的粿模藏品）。用來祭拜神明、酬神，或在添丁時分送親友（教育部辭典）。',
            descriptionEn: 'A red, flat oval kueh whose surface bears a tortoise-shell pattern pressed by a mould: a hexagon in the centre and the markings of the shell around it (from the kueh moulds in the National Museum of Taiwan History). It is used to worship the gods and give thanks to them, or to share with relatives and friends when a son is born (Ministry of Education dictionary).',
            note: '龜甲紋是簡化的示意，沒有複製特定的粿模。',
            noteEn: 'The tortoise-shell pattern is a simplified illustration and does not copy any particular kueh mould.',
          },
          {
            id: 'temple-oo-kue',
            name: '芋粿',
            nameEn: 'Taro kueh',
            category: '米食｜日常（示意）',
            categoryEn: 'Rice food | Everyday (illustration)',
            description: '灰白色的厚片，切面看得到少量紫灰色的芋頭顆粒。辭典的說明：「以米漿和芋頭為主要材料，蒸熟後食用」的臺灣小吃。',
            descriptionEn: 'A thick, greyish-white slice whose cut face shows a few purplish-grey grains of taro. The dictionary describes it as a Taiwanese snack “made mainly from rice batter and taro, eaten steamed” (translation by this site).',
            note: '傳統米食的示意，不代表任何店家現行的菜單。',
            noteEn: 'An illustration of a traditional rice food; it does not represent any shop’s current menu.',
          },
          {
            id: 'temple-cai-tau-kue',
            name: '蘿蔔糕（菜頭粿）',
            nameEn: 'Radish cake (cai-tau-kueh)',
            category: '米食｜年節（示意）',
            categoryEn: 'Rice food | New Year (illustration)',
            description: '米白色的長方塊，展示整塊與切片兩種樣子。在來米漿拌入炒過的蘿蔔絲、蝦米等配料蒸製而成（教育部辭典）；「菜頭」與「彩頭」諧音，是過年必備的菜色（農業部）。',
            descriptionEn: 'Off-white rectangular blocks, shown both whole and sliced. It is made by steaming long-grain rice batter mixed with stir-fried shredded radish, dried shrimp and other ingredients (Ministry of Education dictionary); “cai-tau” (radish) sounds like “cai-tou” (good fortune), so it is a must-have dish for the New Year (Ministry of Agriculture).',
            note: '傳統米食的示意，不代表任何店家現行的菜單。',
            noteEn: 'An illustration of a traditional rice food; it does not represent any shop’s current menu.',
          },
        ],
        footnote: '展示的米食是示意模型，不代表價格、份量或配方；草仔粿與紅龜粿是主要的展示，芋粿與蘿蔔糕是傳統米食的示意，不是好粿緣的菜單。',
        footnoteEn: 'The rice foods on display are illustrative models and do not represent prices, portions or recipes. Cao-a-kueh and ang-ku-kueh are the main display; taro kueh and radish cake are illustrations of traditional rice foods, not Haoguoyuan’s menu.',
        sourceIds: ['moe-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '廟口糕粿攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        introEn: 'The introduction to the temple-front kueh stall is compiled from the sources below. Select one to open the original web page; each entry shows its publication date and how it was used.',
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moa-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
        disclaimer:
          '廟口的糕粿攤是「飲食文化情境示意」：攤位的樣子、位置與人物都是依一般的矮桌式糕粿攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。橫牌只寫「傳統糕粿」，沒有使用好粿緣或任何店家的店名、招牌、包裝與售價。',
        disclaimerEn:
          'The temple-front kueh stall is a “food-culture scenario illustration”: its look, position and figures were designed on the model of a generic low-table kueh stall and do not represent any actual stall. Unverified eras, shop histories and lineages have not been included. The signboard reads only “傳統糕粿” (traditional kueh); it does not use the name, shop sign, packaging or prices of Haoguoyuan or any other shop.',
      },
    ],
  },
  {
    id: 'yong-le-mi-tai-mu',
    name: '永樂米苔目',
    nameEn: 'Yongle Mi-tai-mu',
    status: 'open',
    category: '傳統小吃・米苔目',
    categoryEn: 'Traditional snacks · mi-tai-mu',
    seal: '米',
    sealEn: 'Mi',
    theme: MI_TAI_MU_THEME.id,
    address: '臺北市大同區民樂街111號',
    addressEn: 'No. 111, Minle Street, Datong District, Taipei',
    // 創立年份未核實：留空（招牌上的「50年老店」與媒體的說法見介紹，不當成查證過的年份）
    yearNote: '創立年份未核實，資料留空。',
    yearNoteEn: 'Founding year not verified; left blank.',
    sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang'],
    hasInterior: true,
    summary:
      '永樂市場一帶的米苔目小吃店：白色小方磚的狹長街屋、紅色直條紋主招牌上的金色立體字；一樓狹長、明亮的用餐區可以走進去。',
    summaryEn:
      'A mi-tai-mu (rice noodle strips) snack shop near Yongle Market: a long, narrow shophouse faced with small white square tiles, with raised gold characters on a red, vertically ribbed main sign. You can walk into its long, bright ground-floor dining area.',

    // ── 場景配置 ──────────────────────────────
    // 只在「老屋新生」出現：取代迪化街北側的一般地段 north-6（實際的店在民樂街，場景只保留商圈的關係）。
    // 位置、入口、外帶區、座位、人物、資訊熱點與鏡頭都在 data/miTaiMuLayout.js
    // （外觀見 builders/yongleMiTaiMuExterior.js，店內見 yongleMiTaiMuInterior.js，食品見 miTaiMuWares.js，人物見 components/NpcLayer.jsx）。
    // position 為店門口（入口的店面線）；從店家名錄前往時站在騎樓下、面向店門，再自己走進去。
    position: yongleMtmToWorld(YONGLE_MTM_HOTSPOTS[0].point[0], 0),
    facing: 'south',
    interaction: { radius: 1.1, distance: YONGLE_MTM_HOTSPOTS[0].point[1] },
    travelYawOffset: -0.3,
    site: { ...YONGLE_MTM.site },
    building: { archetype: 'yong-le-mi-tai-mu', width: YONGLE_MTM.half * 2, depth: -YONGLE_MTM.back },
    buildingByEra: {
      revival: { condition: 'restored' },
    },
    eraNotes: {
      revival:
        '永樂米苔目只出現在「老屋新生」（2000–現在）。店面與店內依使用者提供的實地照片建模（尺寸為估算），照片沒有拍到的部分是示意；一樓可以走進去，樓上只做外觀。招牌上的「50年老店」只當作招牌文字，創立年份未核實，沒有把這家店放進其他年代。',
      revivalEn:
        'Yongle Mi-tai-mu appears only in “Old Houses, New Life” (2000–present). The shopfront and interior are modelled from on-site photographs supplied by the user (dimensions are estimated); anything the photographs did not capture is illustrative. The ground floor can be entered; the upper floors are modelled as exterior only. The “50-year-old shop” on the sign is treated only as signboard text; the founding year has not been verified, and the shop has not been placed in any other era.',
    },
    // 從店家名錄開啟介紹：在迪化街上看狹長的立面與主招牌
    camera: { distance: 7.0, height: 2.4, side: -1.8, lookHeight: 2.9 },
    hotspots: hotspotsToWorld(YONGLE_MTM_HOTSPOTS, yongleMtmToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'shop',
        type: 'text',
        tab: '店家與店面',
        tabEn: 'The shop and its front',
        title: '永樂米苔目',
        titleEn: 'Yongle Mi-tai-mu',
        lead: '到了現代，大稻埕的傳統庶民飲食不只留在記憶裡，也以具體店家的形式延續下來。永樂米苔目就是其中一種代表性的小吃場景。',
        leadEn: 'In the modern day, Dadaocheng’s traditional everyday food lives on not only in memory but also in actual shops. Yongle Mi-tai-mu is one representative snack scene.',
        paragraphs: [
          '位置｜永樂米苔目在臺北市大同區民樂街111號，永樂市場一帶（Bella儂儂2021年、2025年的美食整理）。2013年食尚玩家的報導寫的是舊址永昌街7號，「在永樂市場與霞海城隍廟間的巷子中」；2025年的整理寫到店家「搬遷到民樂街」。場景的街道是敘事式配置，店放在迪化街北側，只保留「永樂市場／迪化街商圈」的關係，不是精確的地籍位置。',
          '店面（依照片）｜白色小方磚的狹長街屋，垂直感明顯；紅色橫式主招牌有一條一條直向的凸條，金色立體字寫「永樂米苔目」，右側直寫小字「50年老店」；左右兩側各有一面紅色的直立招牌。一樓入口內縮成騎樓：右邊是開放的入口，左邊是外帶區的櫃檯與大排煙罩，排煙管沿著騎樓天花接到地上的鼓風機，騎樓吊著兩盞藤編吊燈、停著機車。',
          '年份｜招牌上寫著「50年老店」。媒體的說法有：2013年食尚玩家寫「40年老店」，2025年Bella儂儂寫「從民國五十六年創立至今，已傳承三代」。這些說法彼此大致相符，但本站沒有找到店家或文史資料可以核實，所以創立年份留空，只把「50年老店」當成招牌上的文字，也沒有把這家店放進1945–1980的年代。',
          '同一個飲食主題｜切換到「1945–1980」，可以在慈聖宮的廟口小吃群看到一攤米苔目。那是飲食文化的情境示意，不是這家店的前身，場景也不表示兩者有傳承關係。',
        ],
        paragraphsEn: [
          'Location | Yongle Mi-tai-mu is at No. 111, Minle Street, Datong District, Taipei, near Yongle Market (food round-ups by Bella Nongnong (Bella儂儂), 2021 and 2025). A 2013 report by Shishang Wanjia (食尚玩家) gives its former address as No. 7, Yongchang Street, “in the lane between Yongle Market and Xiahai City God Temple”; the 2025 round-up says the shop “moved to Minle Street”. The streets in the scene are a narrative layout: the shop is placed on the north side of Dihua Street, keeping only its connection to the “Yongle Market / Dihua Street district”, not its exact cadastral position.',
          'Shopfront (from photographs) | A long, narrow shophouse faced with small white square tiles, with a strong vertical feel. The red horizontal main sign has raised vertical ribs, with raised gold characters reading “永樂米苔目” (Yongle Mi-tai-mu) and, on the right, small vertical characters reading “50年老店” (a 50-year-old shop); on the left and right there is a red vertical sign on each side. The ground-floor entrance is set back to form an arcade (qilou): on the right is the open entrance, and on the left the takeaway counter and a large extractor hood, with the flue running along the arcade ceiling to a blower on the ground; two rattan pendant lamps hang in the arcade, and scooters are parked there.',
          'Year | The sign reads “50年老店” (a 50-year-old shop). Media accounts include: in 2013 Shishang Wanjia wrote “a 40-year-old shop”, and in 2025 Bella Nongnong wrote “founded in the 56th year of the Republic (1967) and passed down three generations”. These accounts roughly agree with one another, but this site found no shop or local-history material to verify them. The founding year is therefore left blank, “50 years old” is treated only as text on the sign, and the shop has not been placed in the 1945–1980 era.',
          'The same food theme | Switch to “1945–1980” and you can see a mi-tai-mu stall among the snack stalls in front of Cisheng Temple. It is a food-culture scenario illustration, not this shop’s predecessor, and the scene does not suggest any lineage between the two.',
        ],
        facts: [
          { label: '地址', labelEn: 'Address', value: '臺北市大同區民樂街111號（2021、2025年的媒體整理）', valueEn: 'No. 111, Minle Street, Datong District, Taipei (media round-ups of 2021 and 2025)' },
          { label: '舊址', labelEn: 'Former address', value: '永昌街7號（2013年的報導）', valueEn: 'No. 7, Yongchang Street (2013 report)' },
          { label: '創立年份', labelEn: 'Founding year', value: '未核實（招牌寫「50年老店」）', valueEn: 'Not verified (the sign reads “50年老店”, a 50-year-old shop)' },
          { label: '年代', labelEn: 'Era', value: '2000–現在「老屋新生」', valueEn: '2000–present “Old Houses, New Life”' },
        ],
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food'],
      },
      {
        id: 'dining',
        type: 'text',
        tab: '店內的用餐空間',
        tabEn: 'The dining space inside',
        title: '店內的用餐空間',
        titleEn: 'The dining space inside',
        lead: '狹長的一樓從門口一路通到後方：明亮、熱鬧、翻桌很快的米苔目小吃店。',
        leadEn: 'The long, narrow ground floor runs from the door all the way to the back: a bright, lively mi-tai-mu snack shop with quick table turnover.',
        paragraphs: [
          '依照片｜淺色的亮面大地磚、白色天花與圓形嵌燈、牆上的壁扇；右牆是一大片菜單板與紅色的桌號牌，中間與靠右牆兩排淺色木紋的方桌，配黑色的圓凳；左邊沿牆是調味料與筷筒的長櫃，後方是木作櫃台與藍色的牆面。',
          '情境人物｜店裡坐著幾位吃米苔目的客人，門口有人排隊、有人點外帶，外帶區與後方櫃台各有一位店員。他們是簡化的情境人物，不對應照片裡的任何人，也沒有名字或身分。',
          '示意｜菜單板只畫菜色的圓形圖，不寫品名與價格；告示與桌號牌只做樣子。桌椅的數量與間距、後方的配置是簡化的示意，不是精確的平面；照片裡的路人、價目與告示的文字都沒有放進場景。',
        ],
        paragraphsEn: [
          'From photographs | Light-coloured glossy large floor tiles, a white ceiling with round recessed lights, and wall fans; on the right wall is a large menu board and red table-number plates; two rows of light wood-grain square tables, one down the middle and one along the right wall, with black round stools; along the left wall is a long cabinet of condiments and chopstick holders, and at the back a wooden counter and a blue wall.',
          'Scenario figures | A few customers sit eating mi-tai-mu, some people queue at the door and some order takeaway, and there is one staff member at the takeaway area and one at the back counter. They are simplified scenario figures who do not correspond to anyone in the photographs and have no names or identities.',
          'Illustration | The menu board shows only round pictures of dishes, with no dish names or prices; the notices and table-number plates are only for show. The number and spacing of tables and chairs and the layout at the back are simplified illustrations, not an exact plan; the passers-by in the photographs and the wording of price lists and notices have not been placed in the scene.',
        ],
        facts: [
          { label: '空間', labelEn: 'Space', value: '狹長的一樓用餐區（依照片簡化）', valueEn: 'A long, narrow ground-floor dining area (simplified from photographs)' },
          { label: '座位', labelEn: 'Seating', value: '方桌與黑色圓凳，中間一排、靠右牆一排', valueEn: 'Square tables and black round stools, one row down the middle and one along the right wall' },
          { label: '人物', labelEn: 'Figures', value: '情境人物，不對應照片裡的任何人', valueEn: 'Scenario figures who do not correspond to anyone in the photographs' },
        ],
        sourceIds: ['bella-2025-dadaocheng'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '一碗米苔目',
        tabEn: 'A bowl of mi-tai-mu',
        title: '一碗米苔目',
        titleEn: 'A bowl of mi-tai-mu',
        intro: '走道邊第一張桌子上：一碗湯米苔目與幾樣小菜。品項依食記與媒體的整理核對；這是展示用的示意，不代表完整或即時的菜單，也不寫價格。',
        introEn: 'On the first table beside the aisle: a bowl of mi-tai-mu in soup and a few side dishes. The items were checked against food blogs and media round-ups; this is a display illustration, not a complete or current menu, and no prices are given.',
        items: [
          {
            id: 'mi-tai-mu-soup',
            name: '湯米苔目',
            nameEn: 'Mi-tai-mu in soup',
            category: '米食｜湯',
            categoryEn: 'Rice food | Soup',
            description: '短而粗的米條盛在大骨湯裡，帶著油蔥與韭菜的香氣（Bella儂儂2021年、2025年的整理）。',
            descriptionEn: 'Short, thick rice strips served in pork-bone broth, fragrant with fried shallots and chives (Bella Nongnong round-ups of 2021 and 2025).',
            note: '2025年的整理也提到乾米苔目（甜辣醬、醬油膏與韭菜蔥花）；場景只展示湯的。',
            noteEn: 'The 2025 round-up also mentions dry mi-tai-mu (with sweet chilli sauce, soy paste, chives and spring onion); the scene shows only the soup version.',
          },
          {
            id: 'pork-cheek',
            name: '嘴邊肉',
            nameEn: 'Pork cheek',
            category: '黑白切',
            categoryEn: 'Hei-bai-qie (assorted sliced cold cuts)',
            description: '豬嘴邊的肉切片；2013年食尚玩家與2021、2025年Bella儂儂的整理都提到。',
            descriptionEn: 'Sliced meat from the pig’s cheek; mentioned in Shishang Wanjia’s 2013 report and in Bella Nongnong’s round-ups of 2021 and 2025.',
            note: '場景中淋醬油膏、放薑絲是一般黑白切的示意，不代表店家的做法。',
            noteEn: 'The soy paste and shredded ginger in the scene are a generic illustration of hei-bai-qie and do not represent how the shop serves it.',
          },
          {
            id: 'fried-tofu',
            name: '油豆腐',
            nameEn: 'Fried tofu',
            category: '小菜',
            categoryEn: 'Side dish',
            description: '炸過的豆腐塊，2021年的整理提到的小菜之一。',
            descriptionEn: 'Deep-fried blocks of tofu, one of the side dishes mentioned in the 2021 round-up.',
          },
          {
            id: 'daikon',
            name: '菜頭',
            nameEn: 'Daikon (cai-tau)',
            category: '小菜',
            categoryEn: 'Side dish',
            description: '白蘿蔔（台語「菜頭」）煮成的小菜，2021年的整理提到的小菜之一。',
            descriptionEn: 'A side dish of cooked white radish (“cai-tau” in Taiwanese), one of the side dishes mentioned in the 2021 round-up.',
          },
        ],
        footnote: '展示的餐點是示意模型，不代表價格、份量或配方；店家的菜色以現場為準。',
        footnoteEn: 'The dishes on display are illustrative models and do not represent prices, portions or recipes; for what the shop serves, go by what is offered on the day.',
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-apang'],
      },
      XIA_ER_ZUI_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        tabEn: 'Sources',
        title: '資料來源',
        titleEn: 'Sources',
        intro: '永樂米苔目的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。店面與店內的 3D 模型另外依使用者提供的實地照片建模。',
        introEn: 'The introduction to Yongle Mi-tai-mu is compiled from the sources below. Select one to open the original web page; each entry shows its publication date and how it was used. The 3D models of the shopfront and interior are additionally based on on-site photographs supplied by the user.',
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang', 'moe-bi-thai-bak', ...XIA_ER_ZUI_CHAPTER.sourceIds],
        disclaimer:
          `媒體與食記只支持當次的記錄，不當成最新的價格、營業時間或店史；創立年份、店史與傳承關係沒有可以核實的資料，都沒有寫成事實。照片裡的路人、隔壁店家的招牌與廣告沒有放進場景，店裡的人物是簡化的情境人物。${XIA_ER_ZUI_DISCLAIMER}`,
        disclaimerEn:
          `Media reports and food blogs support only the record of that visit; they are not treated as current prices, opening hours or shop history. There are no verifiable materials for the founding year, shop history or lineage, so none has been written as fact. The passers-by in the photographs and the signs and advertisements of neighbouring shops have not been placed in the scene, and the figures in the shop are simplified scenario figures. ${XIA_ER_ZUI_DISCLAIMER_EN}`,
      },
    ],
  },
  {
    id: 'dodd-tea-house',
    name: '寶順洋行與李春生',
    nameEn: 'Dodd & Co. (Boshun hong) and Lee Chun-sheng',
    theme: 'tea',
    // 文化據點（茶葉外銷的起點）：不是餐廳，沒有食物圖鑑；只出現在「港口商街」
    kind: 'heritage',
    status: 'open',
    year: 1866,
    yearLabel: '1860年代（陶德來臺、設洋行的年份各資料記載不一）',
    yearLabelEn: '1860s (sources differ on the years Dodd came to Taiwan and set up his hong)',
    yearNote: '陶德（John Dodd）來臺的年份有1860、1864、1865三種記載；寶順洋行（Dodd & Co.）設立的年份有1865、1866、1869三種記載。李春生1895年的自敘寫「迨三十歲（1866年），復受英商寶順行重盟，東渡在台北」。',
    yearNoteEn: 'Three years are recorded for John Dodd’s arrival in Taiwan: 1860, 1864 and 1865; three are recorded for the founding of Dodd & Co.: 1865, 1866 and 1869. Lee Chun-sheng’s 1895 memoir says: “At the age of thirty (1866), I was again engaged by the English firm of Dodd, and crossed over to Taipei.” (Translation by this site.)',
    sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'ntcri-73-tea-road'],
    category: '文化據點｜洋行・茶葉外銷',
    categoryEn: 'Cultural site | Foreign hong · tea export',
    seal: '洋行',
    sealEn: 'Hong',
    summary: '英商陶德的寶順洋行與買辦李春生把臺灣烏龍茶賣到紐約：自安溪引進茶苗、在大稻埕設精製茶廠，1869年「Formosa Oolong」打開美國市場，大稻埕從此成為茶葉外銷的中心。',
    summaryEn: 'The English merchant John Dodd’s firm, Dodd & Co. (Boshun hong), and its compador Lee Chun-sheng sold Taiwan oolong tea in New York: tea plants were brought from Anxi and a tea-refining factory was set up in Dadaocheng, and in 1869 “Formosa Oolong” opened the American market, making Dadaocheng the centre of the tea export trade.',
    note: '寶順洋行與李春生的茶行都在淡水河邊的建昌街、千秋街（今貴德街）一帶，不在迪化街；街上這棟兩層的洋樓是情境示意，依文獻「臺北第一條洋樓街」的描述設計，並非精確復原。',
    noteEn: 'Dodd & Co. and Lee Chun-sheng’s tea firms were both along the Tamsui River, around Jianchang Street and Qianqiu Street (today’s Guide Street), not on Dihua Street. The two-storey foreign-style building on the street is a scenario illustration, designed from the literature’s description of “Taipei’s first street of foreign-style buildings”, and is not an exact restoration.',
    // 用 site 取代北側林復振與有記之間的一般地段 north-5（只在港口商街），不另外預留店面地段：
    // 預留會改變五個年代共用的地段編號與其他建築的種子
    position: { x: 5.15, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.4 },
    site: { x:  5.15, z: -4.5, rotationY: 0, replaces: ['north-5'] },
    // 第 10 階段：可以走進去的精製茶廠（揀茶、焙茶、裝箱；歷史情境重建）。
    // 立面沿用原本 baroque 的語彙（builders/doddTeaHouse.js），門面改成敞開的大門。
    building: {
      archetype: 'dodd-tea-house',
      width: 6.9,
      depth: 11,
      floors: 2,
      plasterTint: '#f1e9d8',
      trimTint: '#fbf7ee',
      sign: { text: 'Dodd & Co. 寶順洋行', style: 'wood' },
      parapet: 'scroll',
    },
    hotspots: hotspotsToWorld(DODD_HOTSPOTS, doddToWorld),
    buildingByEra: {
      'qing-port': { condition: 'new' },
    },
    eraNotes: {
      'qing-port':
        '只出現在「港口商街」。1860年代淡水開港後，英商陶德在臺灣北部收茶、引進安溪茶苗，1868年把精製茶廠設在大稻埕，1869年把烏龍茶運往紐約。廈門人李春生是他的買辦，後來自營茶業，被稱為「臺灣茶業之父」。這棟洋樓是情境示意：洋行與李春生的事業都在河邊的建昌街、千秋街。',
      'qing-portEn':
        'Appears only in “Harbour Merchant Street”. After Tamsui opened as a port in the 1860s, the English merchant John Dodd bought tea in northern Taiwan and brought in tea plants from Anxi; in 1868 he set up a tea-refining factory in Dadaocheng, and in 1869 he shipped oolong tea to New York. Lee Chun-sheng, from Xiamen, was his compador and later ran his own tea business; he is known as the “Father of Taiwan’s Tea Industry”. This foreign-style building is a scenario illustration: the businesses of the hong and of Lee Chun-sheng were both on the riverside, on Jianchang Street and Qianqiu Street.',
    },
    camera: { distance: 6.6, height: 4.2, side: 5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'dodd',
        type: 'text',
        tab: '洋行與茶',
        tabEn: 'The hong and tea',
        title: '陶德與寶順洋行',
        titleEn: 'John Dodd and Dodd & Co.',
        lead: '一位英國商人看見臺灣茶的潛力：引進茶苗、貸款茶農、在大稻埕設廠精製，再把烏龍茶賣到紐約。',
        leadEn: 'An English merchant saw the potential of Taiwan tea: he brought in tea plants, lent money to tea farmers, set up a refining factory in Dadaocheng, and then sold the oolong tea in New York.',
        paragraphs: [
          '淡水開港後，英國商人陶德（John Dodd）來到臺灣北部。學者陳慈玉記載他1865年來臺、翌年設立寶順洋行（Dodd & Co.）試購茶葉；國史館的編者說明則寫寶順行1869年創設於大稻埕，到1890年3月陶德離臺返國為止。各資料的年份不一，本站並列。',
          '1866年，陶德自福建安溪移植烏龍茶的茶樹，貸款給農民、教授製法（陳慈玉）；李春生的自敘也寫到陶德派他到安溪採辦茶苗。1867年輸往澳門的臺灣茶獲得好評。1868年，精製茶廠設在大稻埕——臺北市政府文化局的手冊寫陶德與李春生放棄艋舺的據點、改在大稻埕設廠，《臺北畫刊》則寫「艋舺人仍保守地排拒洋人的時候，大稻埕卻開設了洋行」。',
          '1869年，寶順洋行把烏龍茶運往美國紐約，大受歡迎。臺北市政府的英文報導寫兩艘大帆船載了將近十三萬公斤的茶；運量在各資料裡的數字不一，本站只寫「約十三萬公斤」。這批茶以「Formosa Oolong」為名，奠定臺茶外銷的基礎。1872年以後，寶順、德記、怡記、和記、水陸五家洋行在北臺灣競爭茶葉外銷。',
        ],
        paragraphsEn: [
          'After Tamsui opened as a port, the English merchant John Dodd (陶德) came to northern Taiwan. The scholar Chen Ciyu records that he came to Taiwan in 1865 and, the following year, set up Dodd & Co. (Boshun hong, 寶順洋行) to trial-purchase tea; the editors’ note of the Academia Historica instead says Boshun was founded in Dadaocheng in 1869 and ran until Dodd left Taiwan for home in March 1890. The years differ between sources, so this site gives them side by side.',
          'In 1866 Dodd transplanted oolong tea plants from Anxi in Fujian, lent money to farmers and taught them the processing method (Chen Ciyu); Lee Chun-sheng’s memoir also records that Dodd sent him to Anxi to buy tea plants. In 1867 Taiwan tea shipped to Macao was well received. In 1868 a tea-refining factory was set up in Dadaocheng: the Taipei City Government Department of Cultural Affairs’ booklet says Dodd and Lee Chun-sheng gave up their base in Bangka and set up the factory in Dadaocheng, while Taipei Pictorial writes that “when the people of Bangka were still conservatively shutting out foreigners, Dadaocheng opened foreign hongs” (translation by this site).',
          'In 1869 Dodd & Co. shipped oolong tea to New York in the United States, where it was a great success. The Taipei City Government’s English-language report says two large sailing ships carried nearly 130,000 kilograms of tea; the figure for the cargo differs between sources, so this site writes only “about 130,000 kilograms”. The tea went under the name “Formosa Oolong”, laying the foundation of Taiwan tea exports. After 1872 five foreign hongs in northern Taiwan, Boshun, Deji, Yiji, Heji and Shuilu, competed in the tea export trade.',
        ],
        timeline: [
          { place: '1862', placeEn: '1862', text: '滬尾正式設關開埠（通稱1860年淡水開港）。', textEn: 'Tamsui (Huwei) formally opens a customs house and becomes a treaty port (commonly called the 1860 opening of Tamsui).' },
          { place: '1866', placeEn: '1866', text: '陶德自安溪引進茶苗，貸款給茶農種植。', textEn: 'Dodd brings tea plants from Anxi and lends money to tea farmers to plant them.' },
          { place: '1868', placeEn: '1868', text: '精製茶廠設在大稻埕。', textEn: 'The tea-refining factory is set up in Dadaocheng.' },
          { place: '1869', placeEn: '1869', text: '烏龍茶運往紐約，「Formosa Oolong」打開美國市場。', textEn: 'Oolong tea is shipped to New York, and “Formosa Oolong” opens the American market.' },
          { place: '1872 後', placeEn: 'After 1872', text: '五家洋行在北臺灣競爭茶葉外銷。', textEn: 'Five foreign hongs compete in the tea export trade in northern Taiwan.' },
          { place: '1890', placeEn: '1890', text: '陶德離臺返國。', textEn: 'Dodd leaves Taiwan for home.' },
        ],
        glossary: [
          { term: '洋行', termEn: 'Foreign firm (hong)', definition: '外國商人在開港口岸設立的貿易商號。', definitionEn: 'A trading house set up by foreign merchants in a treaty port.' },
          { term: '買辦', termEn: 'Compador', definition: '洋行雇用的本地商人，替洋行與本地的茶農、茶販交易；李春生就是寶順洋行的買辦。', definitionEn: 'A local merchant employed by a foreign hong to deal on its behalf with local tea farmers and tea traders; Lee Chun-sheng was the compador of Dodd & Co.' },
          { term: '精製', termEn: 'Refining', definition: '茶農初製的毛茶運到茶廠再篩選、烘焙、分級，才能裝箱外銷。以前要運到福州、廈門精製，大稻埕設廠後就地完成。', definitionEn: 'The rough tea first processed by farmers is taken to a factory to be sorted, fired and graded before it can be packed for export. It used to be shipped to Fuzhou or Xiamen for refining; once factories were set up in Dadaocheng, this was done on the spot.' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'taipei-gov-tea-tasting-2017', 'tshs-tamsui-customs-lesson', 'tshs-zhang-tamsui-port'],
        // 探索手記：讀過這一章就記下這則有出處的外銷消息（主題路線「一箱茶的旅程」的節點）
        journal: {
          id: 'news:oolong-1869',
          kind: 'news',
          title: '1869：烏龍茶運往紐約',
          titleEn: '1869: Oolong tea shipped to New York',
          text: '1869年，寶順洋行以兩艘帆船把約十三萬公斤的烏龍茶運往美國紐約，以「Formosa Oolong」為名大受歡迎，奠定臺茶外銷的基礎。',
          textEn: 'In 1869 Dodd & Co. shipped about 130,000 kilograms of oolong tea to New York on two sailing ships; under the name “Formosa Oolong” it was a great success, laying the foundation of Taiwan tea exports.',
        },
      },
      {
        id: 'li',
        type: 'text',
        tab: '買辦李春生',
        tabEn: 'The compador Lee Chun-sheng',
        title: '買辦李春生',
        titleEn: 'The compador Lee Chun-sheng',
        lead: '廈門來的基督徒商人，先當洋行的買辦，再自營茶業，被稱為「臺灣茶業之父」。',
        leadEn: 'A Christian merchant from Xiamen who first served as a foreign hong’s compador and then ran his own tea business; he is known as the “Father of Taiwan’s Tea Industry”.',
        paragraphs: [
          '李春生1838年生於福建廈門，父親是船員。他1851年在廈門受洗，是長老教會的信徒；自敘寫「自幼奉耶穌教，年十五學商業，兼習英國語文」。1857年起受雇於廈門的英商怡記洋行（Elles & Co.），從事洋貨與茶的貿易。',
          '1866年（自敘「迨三十歲」；陳慈玉記為1865年），他受英商寶順行之聘來到臺北，擔任買辦。他和陶德到大溪調查樟腦時發現野生茶樹，提議自安溪移植茶樹獎勵農民栽種（陳慈玉）。寶順行結束後，他續任英商和記行的買辦，自敘寫他在臺灣住了二十九年。',
          '李春生後來自營茶商，烏龍茶經廈門輸往美國而致富，並改良烏龍茶的製法與品牌（陳慈玉）。1896年1月日本人的調查，大稻埕的茶商有252店，李春生的「李節記」資本四萬円、店員二十三人，資本額排第三，僅次於林本源的建祥號與黃爾仰的聯成行。國史館稱他是「清季台灣北部最有名富紳」。2002年臺北市文獻會的座談會上，與會者認為他打出了「福爾摩莎烏龍茶」的品牌。',
        ],
        paragraphsEn: [
          'Lee Chun-sheng was born in Xiamen, Fujian, in 1838; his father was a seaman. He was baptised in Xiamen in 1851 and was a member of the Presbyterian Church; his memoir says: “From childhood I followed the religion of Jesus; at fifteen I studied commerce, and also learned the English language” (translation by this site). From 1857 he was employed by the English firm Elles & Co. (怡記洋行) in Xiamen, trading in foreign goods and tea.',
          'In 1866 (the memoir says “at the age of thirty”; Chen Ciyu gives 1865) he came to Taipei, engaged by the English firm Dodd, as its compador. While investigating camphor in Daxi with Dodd, he discovered wild tea trees and proposed transplanting tea plants from Anxi to encourage farmers to grow them (Chen Ciyu). After Dodd’s firm closed, he went on to serve as compador of the English firm Heji, and his memoir says he lived in Taiwan for twenty-nine years.',
          'Lee later ran his own tea business and grew rich as oolong tea went to the United States by way of Xiamen; he also improved the processing and branding of oolong tea (Chen Ciyu). In a Japanese survey of January 1896, Dadaocheng had 252 tea shops, and Lee’s “Li Jieji” (李節記) had capital of 40,000 yen and twenty-three staff, ranking third by capital, behind the Jianxiang firm of Lin Benyuan and the Liancheng hong of Huang Eryang. The Academia Historica calls him “the most famous wealthy gentleman of northern Taiwan in the late Qing” (translation by this site). At a 2002 symposium held by the Taipei City Committee of Historical Research, participants held that he established the “Formosa oolong tea” brand.',
        ],
        facts: [
          { label: '生卒', labelEn: 'Born and died', value: '1838年1月12日，福建廈門；1924年9月7日', valueEn: '12 January 1838, Xiamen, Fujian; 7 September 1924' },
          { label: '信仰', labelEn: 'Faith', value: '1851年在廈門受洗，長老教會', valueEn: 'Baptised in Xiamen in 1851; Presbyterian Church' },
          { label: '洋行', labelEn: 'Foreign hongs', value: '1857年廈門怡記洋行；1866年臺北寶順洋行買辦；後任和記洋行買辦', valueEn: 'Elles & Co. in Xiamen from 1857; compador of Dodd & Co. in Taipei from 1866; later compador of the Heji hong' },
          { label: '茶行', labelEn: 'Tea firm', value: '李節記（1896年資本額居大稻埕茶商第三）', valueEn: 'Li Jieji (third by capital among Dadaocheng tea merchants in 1896)' },
          { label: '稱號', labelEn: 'Title', value: '臺灣茶業之父（杜聰明的定位）', valueEn: 'Father of Taiwan’s Tea Industry (as characterised by Tu Tsong-ming)' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-2002-events', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'street',
        type: 'text',
        tab: '建昌街與揀茶女',
        tabEn: 'Jianchang Street and the tea sorters',
        title: '洋樓街、教會與揀茶女',
        titleEn: 'The street of foreign-style buildings, the church and the tea sorters',
        lead: '李春生和林維源在河邊蓋起臺北第一條洋樓街；茶行的騎樓下，揀茶的婦女在茶袋與茶箱之間穿梭。',
        leadEn: 'Lee Chun-sheng and Lin Weiyuan built Taipei’s first street of foreign-style buildings by the river; under the arcades of the tea firms, women tea sorters moved among the tea sacks and tea chests.',
        paragraphs: [
          '1878年，李春生與林維源捐出巨款並督造臺北城；1887年他資助劉銘傳的鐵路並參與監督，竣工後獲「五品同知」。1889年，劉銘傳把大稻埕沿岸的河灘地交給林維源開發，林維源邀李春生合作成立建昌公司，在建昌街與千秋街蓋店屋出租給洋商，這一帶成為臺北第一條洋樓街，也就是戰後的貴德街；寶順、怡和、德記等洋行與數十家茶行聚集在這條「茶街」。',
          '李春生獨資捐建甘州街的大稻埕教會；1935年，孫輩在貴德街44號建李春生紀念教會紀念他（國史館寫教堂為他捐建，與其他來源不同，本站採後代所建）。',
          '茶業也改變了大稻埕婦女的生活。1981年的《光華》雜誌描述，揀茶的婦女熙來攘往，在堆塞街衢廊下的茶袋、茶箱中穿梭；《臺灣史研究》的論文指出，茶業給予婦女婚姻以外的選擇，大稻埕婦女的結婚比例因此低於臺北盆地的邊緣。揀茶女的人數沒有查到統計，本站不寫數字。',
        ],
        paragraphsEn: [
          'In 1878 Lee Chun-sheng and Lin Weiyuan donated large sums and oversaw the building of Taipei City; in 1887 he funded and helped supervise Liu Mingchuan’s railway, and on its completion was granted the title “tongzhi of the fifth rank” (五品同知). In 1889 Liu Mingchuan handed the riverbank flats along Dadaocheng to Lin Weiyuan to develop, and Lin invited Lee to co-found the Jianchang Company, which built shophouses on Jianchang Street and Qianqiu Street to rent to foreign merchants. This area became Taipei’s first street of foreign-style buildings, which is Guide Street of the post-war years; foreign hongs such as Boshun, Yihe and Deji, and dozens of tea firms, gathered on this “tea street”.',
          'Lee Chun-sheng donated the full cost of the Dadaocheng Church on Ganzhou Street; in 1935 his grandchildren built the Lee Chun-sheng Memorial Church at No. 44, Guide Street, in his memory (the Academia Historica writes that he donated the church himself, which differs from other sources; this site follows the account that his descendants built it).',
          'The tea trade also changed the lives of Dadaocheng’s women. A 1981 article in Panorama (《光華》) describes tea-sorting women bustling to and fro, threading among the tea sacks and tea chests piled under the arcades of the streets; a paper in Taiwan Historical Research notes that the tea trade gave women choices beyond marriage, so that the proportion of married women in Dadaocheng was lower than on the edges of the Taipei Basin. No statistics for the number of tea sorters were found, so this site gives no figure.',
        ],
        facts: [
          { label: '1878', labelEn: '1878', value: '與林維源捐款並督造臺北城', valueEn: 'Donated funds with Lin Weiyuan and oversaw the building of Taipei City' },
          { label: '1889', labelEn: '1889', value: '建昌公司：建昌街、千秋街（今貴德街）的洋樓街', valueEn: 'The Jianchang Company: the street of foreign-style buildings on Jianchang Street and Qianqiu Street (today’s Guide Street)' },
          { label: '教會', labelEn: 'Churches', value: '大稻埕教會（甘州街，李春生捐建）；李春生紀念教會（貴德街44號，1935年5月5日設立）', valueEn: 'Dadaocheng Church (Ganzhou Street, donated by Lee Chun-sheng); Lee Chun-sheng Memorial Church (No. 44, Guide Street, established 5 May 1935)' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'pct-li-chunsheng-church', 'panorama-dadaocheng-1981', 'wolf-women-tea-2003'],
      },
      // 第 8 階段：人物小節（純文字，資料在 liChunShengData.js）
      LI_CHUNSHENG_PERSON_CHAPTER,
      // 第 10 階段：室內（揀茶、焙茶、裝箱）的介紹章節
      {
        id: 'refinery',
        type: 'text',
        tab: '精製茶廠',
        tabEn: 'The tea-refining factory',
        title: '精製茶廠：揀茶、焙茶、裝箱',
        titleEn: 'The tea-refining factory: sorting, firing and packing',
        lead: '茶農初製的毛茶運進茶廠，揀去茶梗、以炭火慢焙、趁熱裝進鉛襯的木箱——這一箱茶才算準備好出海。',
        leadEn: 'Rough tea first processed by farmers is brought into the factory, picked free of stalks, slowly fired over charcoal and packed hot into lead-lined wooden chests; only then is a chest of tea ready to go to sea.',
        paragraphs: [
          '揀茶：毛茶入棧後，揀茶女坐在大竹篩前，用手挑出茶枝、茶梗與壞葉，按件計酬。Davidson（1903）記載，大稻埕大小茶棧約一百五十家，茶季每日僱用的揀茶工逾一萬二千人；手快的女孩從清晨做到傍晚，一天可賺一角五分。',
          '焙茶：焙茶間裡一排排圓形的焙坑——深二呎、徑二呎、相距一呎，周圍是低磚臺，坑口與臺面齊平。木炭燒到通紅、覆灰養火，一次可以維持一週以上；茶放在「高約三呎、形如骰盅」的焙籠裡，籠腰有篩為底，焙茶工約每小時逐籠翻茶一次，一般焙八到十個小時。',
          '裝箱：焙好的茶趁熱裝進內襯薄鉛的松木箱，鉛襯焊封防潮，箱外裱上彩色印花紙。裝好的茶箱由挑夫挑到碼頭，小船接駁到河道中的大船。',
          '這個室內是依 Davidson 記載的流程重建的情境（他寫的是1890年代末的做法，用在這個年代為推定相近）；寶順洋行精製茶廠實際的格局查無。',
        ],
        paragraphsEn: [
          'Sorting: once the rough tea was taken into the godown, women sorters sat before large bamboo sieves and picked out twigs, stalks and bad leaves by hand, paid by the piece. Davidson (1903) records about 150 tea godowns, large and small, in Dadaocheng, employing more than 12,000 sorters a day in the tea season; a quick-handed girl worked from early morning until evening and could earn fifteen cents (one jiao and five fen) a day.',
          'Firing: in the firing room stood rows of round firing pits, two feet deep, two feet across and one foot apart, surrounded by a low brick platform with the mouths of the pits level with its surface. Charcoal was burned until red-hot and banked under ash, and a fire could last for more than a week; the tea was placed in firing baskets “about three feet high, shaped like a dice cup”, each with a sieve as its base halfway up, and the firers turned the tea in each basket roughly once an hour, usually firing for eight to ten hours.',
          'Packing: the fired tea was packed hot into pine chests lined with thin lead, the lead lining soldered shut against damp and the outside of the chest pasted with coloured printed paper. Porters carried the packed chests to the wharf, where small boats took them out to the large ships in the river.',
          'This interior is a reconstructed scene based on the process Davidson records (he describes practice of the late 1890s; applying it to this era is an assumption of similarity); the actual layout of the Dodd & Co. tea-refining factory is not known.',
        ],
        sourceIds: ['davidson-formosa-1903', 'tcmb-dadaocheng-wharf'],
      },
      // 第 10 階段：器物 3D 檢視（茶箱；街上碼頭邊的茶箱也可以近看）
      {
        id: 'tea-chest',
        type: 'object',
        tab: '器物：茶箱',
        tabEn: 'Object: the tea chest',
        title: '外銷茶箱',
        titleEn: 'The export tea chest',
        lead: '松木箱裡襯焊封的薄鉛防潮、外頭裱上彩色印花紙——一箱約四十磅的烏龍茶，就這樣從大稻埕的碼頭飄洋過海。',
        leadEn: 'A pine chest lined with soldered thin lead against damp and pasted outside with coloured printed paper: a chest of about forty pounds of oolong tea, and so it crossed the seas from the Dadaocheng wharf.',
        object: 'tea-chest',
        summary: {
          label: '歷史情境重建',
          labelEn: 'Reconstructed historical scene',
          text: 'Davidson（1903）記載外銷茶箱內襯薄鉛、外裱印花紙，半箱約裝四十磅茶；箱子的實際長寬高查無，模型是依重量估的比例，外箱圖案依「德記洋行茶箱籤」的風格設計。',
          textEn: 'Davidson (1903) records that export tea chests were lined with thin lead and pasted outside with printed paper, a half chest holding about forty pounds of tea. The actual length, width and height of the chest are not known; the model uses proportions estimated from the weight, and the pattern on the outer chest is designed in the style of the “Tait & Co. tea-chest label” (德記洋行茶箱籤).',
        },
        paragraphs: ['模型（3D 檢視）：可以旋轉、縮放，打開箱蓋看看裡面的薄鉛內襯與烏龍茶。碼頭邊剛卸下的茶箱也可以走近打開。'],
        paragraphsEn: ['Model (3D view): you can rotate and zoom, and open the lid to look at the thin lead lining and the oolong tea inside. You can also walk up to the tea chests just unloaded at the wharf and open them.'],
        sourceIds: ['davidson-formosa-1903', 'demomy-tait-tea-label'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Literature and historical basis',
        title: '文獻與歷史依據',
        titleEn: 'Literature and historical basis',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/tea-export-origins.md 與 docs/research/li-chun-sheng.md。',
        introEn: 'The introduction to this site is compiled from the sources below. Select one to open the original web page. The verification records (including contradictions in years and items not found) are in the project’s docs/research/tea-export-origins.md and docs/research/li-chun-sheng.md.',
        sourceIds: [
          'chen-ciyu-li-family-2015',
          'th-li-chunsheng-memoir',
          'tshs-zhang-tamsui-port',
          'tshs-tamsui-customs-lesson',
          'ntcri-73-tea-road',
          'culture-taipei-walk-dadaocheng-2018',
          'taipei-pictorial-480-dihua',
          'taipei-gov-tea-tasting-2017',
          'culture-taipei-2002-events',
          'pct-li-chunsheng-church',
          'panorama-dadaocheng-1981',
          'wolf-women-tea-2003',
          'davidson-formosa-1903',
          'demomy-tait-tea-label',
          'tcmb-dadaocheng-wharf',
          ...LI_CHUNSHENG_SOURCE_IDS.filter((id) => !['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'pct-li-chunsheng-church', 'culture-taipei-2002-events'].includes(id)),
        ],
        disclaimer:
          `陶德來臺、設洋行與1869年運量的數字各資料不一，本站並列或只寫約數；「首富」一詞只見於單一來源，本站不用。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；這棟洋樓是情境示意，寶順洋行與李春生的事業在河邊的建昌街、千秋街。${LI_CHUNSHENG_DISCLAIMER_TEXT}`,
        disclaimerEn:
          `Sources differ on the year Dodd came to Taiwan, the year he set up his hong and the 1869 shipment figure, so this site gives them side by side or writes only approximate figures; the term “richest man” appears in only a single source and is not used here. The 3D streetscape on this website is a conceptual reconstruction of the atmosphere of Dadaocheng’s commercial districts in each period; this foreign-style building is a scenario illustration, and the businesses of Dodd & Co. and Lee Chun-sheng were on the riverside, on Jianchang Street and Qianqiu Street. ${LI_CHUNSHENG_DISCLAIMER_TEXT_EN}`,
      },
    ],
  },
  {
    id: 'xia-hai-cheng-huang',
    name: '霞海城隍廟',
    nameEn: 'Xiahai City God Temple',
    // 文化據點（同安人的信仰中心）：不是餐廳，沒有食物圖鑑；只出現在「港口商街」
    kind: 'heritage',
    status: 'open',
    year: 1859,
    yearLabel: '1859年（1856年籌建現址，1859年完工）',
    yearLabelEn: '1859 (construction of the present temple planned in 1856, completed in 1859)',
    yearNote: '神像渡臺的年份，內政部臺灣宗教百景寫清道光元年（1821），臺灣宗教文化地圖只寫「道光初年」；1821年僅此一源。現址1856年籌建、1859年完工依內政部臺灣宗教文化地圖（單一官方網站出處）。',
    yearNoteEn: 'Year the divine image crossed to Taiwan: the Ministry of the Interior’s Taiwan Religious Landscapes gives the first year of the Daoguang reign (1821), while the Taiwan Religious Culture Map says only “the early Daoguang years”; the year 1821 rests on this one source. The planning of the present site in 1856 and its completion in 1859 follow the Ministry of the Interior’s Taiwan Religious Culture Map (a single official website).',
    sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape'],
    category: '文化據點｜城隍廟・民俗祭典',
    categoryEn: 'Cultural site | City God temple and folk festival',
    seal: '城隍',
    sealEn: 'City God',
    address: '迪化街一段61號',
    addressEn: '61 Dihua Street, Section 1',
    summary: '1853年頂下郊拚後，同安人把霞海城隍的神像從艋舺迎到大稻埕，1859年在迪化街一段61號完工建廟；1879年起源的「五月十三迎城隍」曾是北臺灣最大的遶境。',
    summaryEn: 'After the 1853 Dingxia Jiaopin feud, the Tong’an people brought the Xiahai City God image from Bangka to Dadaocheng and completed the temple at 61 Dihua Street, Section 1, in 1859. The “13th of the fifth month City God procession”, traced back to 1879, was once the largest procession in northern Taiwan.',
    note: '實際的霞海城隍廟在迪化街一段61號。街上這座廟是情境示意：規模、格局與相對位置都不是精確復原，廟埕與榕樹沿用本站的廟宇原型。祭祀的供品與廟口飲食查無可靠出處，本站不寫。',
    noteEn: 'The real Xiahai City God Temple stands at 61 Dihua Street, Section 1. The temple on the street here is a scenario illustration: its size, layout and relative position are not an exact reconstruction, and the forecourt and banyan tree reuse this site’s temple archetype. No reliable source exists for the offerings made there or for food at the temple forecourt, so this site does not describe them.',
    // 用 site 取代北側的一般地段 north-6 與波麗路地段上的一般街屋（只在港口商街；
    // 波麗路本身1934年才出現在「摩登大稻埕」）。不用 position 預留，避免改變共用地段的切分
    position: { x: 21.1, z: -4.5 },
    facing: 'south',
    interaction: { radius: 5 },
    site: { x: 21.1, z: -4.5, rotationY: 0, replaces: ['north-6', 'store-bolero'] },
    building: {
      archetype: 'temple',
      width: 12,
      depth: 16,
      sign: { text: '霞海城隍廟', style: 'gold' },
    },
    buildingByEra: {
      'qing-port': { condition: 'new', stalls: false },
    },
    eraNotes: {
      'qing-port':
        '只出現在「港口商街」。1853年頂下郊拚後，同安人把霞海城隍的神像從艋舺八甲庄迎到大稻埕，1856年在現址籌建、1859年完工；廟至今仍在迪化街一段61號。這座廟是情境示意，不是精確復原。',
      'qing-portEn':
        'Appears only in Harbour Merchant Street. After the 1853 Dingxia Jiaopin feud, the Tong’an people brought the Xiahai City God image from Bangka’s Bajiazhuang to Dadaocheng; a new temple was planned on the present site in 1856 and completed in 1859, and it still stands at 61 Dihua Street, Section 1. This temple is a scenario illustration, not an exact reconstruction.',
    },
    camera: { distance: 6.6, height: 4.6, side: 5, lookHeight: 3.4 },
    chapters: [
      {
        id: 'origin',
        type: 'text',
        tab: '從艋舺到大稻埕',
        tabEn: 'From Bangka to Dadaocheng',
        title: '從同安、艋舺到大稻埕',
        titleEn: 'From Tong’an and Bangka to Dadaocheng',
        lead: '一尊從福建同安渡海而來的城隍神像，在械鬥的火光中遷到大稻埕，成為同安人的精神支柱。',
        leadEn: 'A City God image that crossed the sea from Tong’an in Fujian moved to Dadaocheng amid the flames of a communal feud, and became the spiritual mainstay of the Tong’an people.',
        paragraphs: [
          '霞海城隍源自福建泉州府同安縣后溪的霞城。內政部的臺灣宗教百景寫，清道光元年（1821年）一百多名同安人搭船到艋舺，商人陳金絨供奉從同安帶來的霞海城隍神尊；臺灣宗教文化地圖則只寫「道光初年」由陳金絨迎奉金身來臺，1821年這個年份只有一個來源。「霞海」名稱的由來有兩說：一說源自同安霞城的城隍廟，另一說「霞海」即「海內」之意，本站並列不下結論。',
          '同安人早期在艋舺東邊的八甲庄（約今老松國小附近）建廟。咸豐三年（1853年）艋舺發生頂下郊拚，同安人落敗，八甲庄的廟毀於械鬥後的火災，信徒救出神像、遷往大稻埕。NOWnews 的專訪寫神像起初安奉在糕餅舖中（單一來源）。',
          '咸豐六年（1856年）起，信徒在現址籌建新廟，咸豐九年（1859年）完工，也就是今天迪化街一段61號的霞海城隍廟。NOWnews 的專訪寫建廟由海內會陳姓族人與地方善信發起（發起人各資料記載不一，本站標明出處）。同安人在大稻埕的發展依靠商業，霞海城隍是他們的守護神與精神支柱。',
        ],
        paragraphsEn: [
          'The Xiahai City God originates from Xiacheng in Houxi, Tong’an County, Quanzhou Prefecture, Fujian. The Ministry of the Interior’s Taiwan Religious Landscapes states that in the first year of the Daoguang reign (1821) more than a hundred Tong’an people sailed to Bangka, where the merchant Chen Jinrong enshrined the Xiahai City God image brought from Tong’an. The Taiwan Religious Culture Map says only “the early Daoguang years”, when Chen Jinrong welcomed the divine image to Taiwan, so the year 1821 has just one source. There are two explanations for the name “Xiahai”: one derives it from the City God temple at Xiacheng in Tong’an, the other takes “Xiahai” to mean “within the seas” (海內). This site lists both and draws no conclusion.',
          'The Tong’an people first built a temple at Bajiazhuang, east of Bangka (around today’s Laosong Elementary School). In 1853 (the third year of the Xianfeng reign) the Dingxia Jiaopin feud broke out in Bangka and the Tong’an side was defeated; the temple at Bajiazhuang was destroyed by a fire after the fighting, and the worshippers rescued the image and moved it to Dadaocheng. An NOWnews interview says the image was at first enshrined in a cake shop (a single source).',
          'From 1856 (the sixth year of the Xianfeng reign) the worshippers planned a new temple on the present site, and it was completed in 1859 (the ninth year of the Xianfeng reign): today’s Xiahai City God Temple at 61 Dihua Street, Section 1. The NOWnews interview says the building of the temple was initiated by members of the Chen family of the Haine Association together with local devotees (sources differ on who the initiators were, and this site cites its source). The Tong’an people’s prosperity in Dadaocheng rested on commerce, and the Xiahai City God was their guardian deity and spiritual mainstay.',
        ],
        timeline: [
          { place: '1821（一說）', placeEn: '1821 (one account)', text: '同安人渡海到艋舺，陳金絨供奉霞海城隍神尊（年份僅見內政部臺灣宗教百景）。', textEn: 'Tong’an people cross the sea to Bangka, and Chen Jinrong enshrines the Xiahai City God image (the year appears only in Taiwan Religious Landscapes of the Ministry of the Interior).' },
          { place: '1853', placeEn: '1853', text: '頂下郊拚，八甲庄的廟毀於火災，神像遷往大稻埕。', textEn: 'The Dingxia Jiaopin feud: the temple at Bajiazhuang is destroyed by fire and the image moves to Dadaocheng.' },
          { place: '1856', placeEn: '1856', text: '在現址籌建新廟。', textEn: 'A new temple is planned on the present site.' },
          { place: '1859', placeEn: '1859', text: '新廟完工（迪化街一段61號）。', textEn: 'The new temple is completed (61 Dihua Street, Section 1).' },
        ],
        glossary: [
          { term: '城隍', termEn: 'City God (Chenghuang)', definition: '守護城池的神祇，民間信仰中也掌理陰間的司法；各地的城隍廟常是移民原鄉信仰的延伸。', definitionEn: 'A deity who guards a walled city and, in folk belief, also presides over justice in the underworld; City God temples are often an extension of the faith of the immigrants’ home region.' },
          { term: '頂下郊拚', termEn: 'Dingxia Jiaopin (the Upper–Lower Jiao feud)', definition: '1853年艋舺的泉州三邑人（頂郊）與同安人（下郊）之間的分類械鬥；同安人落敗後遷往大稻埕，成為大稻埕發展的起點。', definitionEn: 'The communal armed feud of 1853 in Bangka between the Sanyi people of Quanzhou (the Upper Jiao) and the Tong’an people (the Lower Jiao). The defeated Tong’an people moved to Dadaocheng, which became the starting point of its development.' },
        ],
        sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape', 'gvm-city-2025-temples', 'nownews-2020-xiahai'],
      },
      {
        id: 'pilgrimage',
        type: 'text',
        tab: '五月十三迎城隍',
        tabEn: '13th of the Fifth Month',
        title: '五月十三迎城隍',
        titleEn: 'The 13th of the Fifth Month City God procession',
        lead: '「五月十三人看人，迎神賽會甲天下」——起源於1879年的迎城隍，曾是北臺灣最大的遶境。',
        leadEn: '“On the thirteenth of the fifth month, people watch people; the procession is the finest under heaven.” Dating from 1879, the City God procession was once the largest in northern Taiwan.',
        paragraphs: [
          '「台北霞海城隍廟五月十三迎城隍」是臺北市登錄的民俗類文化資產（2010年7月26日公告），官方登錄頁記起源年代為清光緒5年（1879年）。鏡週刊的報導寫它過去是北臺灣最大的遶境；俗諺說「三月痟媽祖、五月迎城隍」「五月十三人看人，迎神賽會甲天下」。',
          '依官方登錄頁的記載，祭典的流程橫跨半個月：農曆五月初六「放軍」，紙糊的營厝開光後送到五座福德祠鎮守地方；五月十一夜間「暗訪」，驅逐邪祟；五月十三城隍聖誕遶境，下午出發、抵廟多已傍晚，駕前的謝將軍、范將軍白晝右手持扇、左手持手絹，不持釘棍鎖鍊，隨行有北管軒社、金獅團等陣頭；五月十八「收軍」。迎城隍期間廟內舉辦祝壽法會，沿途民眾設香案迎駕。',
          '依官方登錄頁，迎城隍過去每年舉行，現已改為三年一次；鏡週刊2024年的報導則寫，現今由在地的軒社自行發起夜間暗訪與迎城隍。祭典的牲禮與供品的內容，本站查無可靠出處，不寫。',
        ],
        paragraphsEn: [
          'The “Taipei Xiahai City God Temple 13th of the Fifth Month City God Procession” is a folk-custom cultural asset registered by Taipei City (announced on 26 July 2010); the official registration page gives its origin as the fifth year of the Guangxu reign (1879). A Mirror Media report says that it was once the largest procession in northern Taiwan, and a proverb says: “In the third month, mad for Mazu; in the fifth month, welcome the City God”, and “On the thirteenth of the fifth month, people watch people; the procession is the finest under heaven.”',
          'According to the official registration page, the festival spans half a month. On the sixth day of the fifth lunar month comes “releasing the troops” (fangjun): paper-made barracks are consecrated and sent to five Earth God shrines to guard the district. On the night of the eleventh comes the “night patrol” (anfang), which drives out evil spirits. On the thirteenth, the City God’s birthday, the procession sets out in the afternoon and often reaches the temple by dusk; the generals Xie and Fan before the deity’s sedan chair hold a fan in the right hand and a handkerchief in the left by day, and carry no spiked clubs or chains, and the procession includes Beiguan xuanshe music clubs, golden-lion troupes and other troupes. On the eighteenth comes “recalling the troops” (shoujun). During the procession the temple holds birthday-greeting rites, and people along the route set up incense tables to welcome the deity.',
          'According to the official registration page, the procession was once held every year and is now held every three years; a 2024 Mirror Media report says that today local xuanshe clubs themselves start the night patrol and the procession. This site has found no reliable source for the animal sacrifices and offerings of the festival and does not describe them.',
        ],
        timeline: [
          { place: '農曆五月初六', placeEn: 'Sixth day of the fifth lunar month', text: '放軍：紙糊營厝開光後送五座福德祠，鎮守地方。', textEn: 'Releasing the troops: paper-made barracks are consecrated and sent to five Earth God shrines to guard the district.' },
          { place: '五月十一', placeEn: 'Eleventh day', text: '夜間暗訪，驅逐邪祟。', textEn: 'Night patrol, driving out evil spirits.' },
          { place: '五月十三', placeEn: 'Thirteenth day', text: '城隍聖誕遶境，下午出發；北管軒社、金獅團等陣頭隨行。', textEn: 'The City God’s birthday procession sets out in the afternoon, joined by Beiguan xuanshe music clubs, golden-lion troupes and other troupes.' },
          { place: '五月十八', placeEn: 'Eighteenth day', text: '收軍。', textEn: 'Recalling the troops.' },
        ],
        glossary: [
          { term: '暗訪', termEn: 'Anfang (night patrol)', definition: '神明在夜間出巡，驅逐轄區內的邪祟；迎城隍的暗訪在聖誕遶境前兩天的夜裡舉行。', definitionEn: 'The deity tours the district at night to drive out evil spirits; the night patrol of the City God procession is held on the night two days before the birthday procession.' },
          { term: '軒社', termEn: 'Xuanshe (Beiguan music club)', definition: '地方的北管音樂社團，迎神賽會時組成陣頭隨駕演奏。', definitionEn: 'A local Beiguan music society that forms a troupe to play in attendance on the deity during festival processions.' },
        ],
        sourceIds: ['moi-xiahai-folklore', 'moi-xiahai-landscape', 'mirror-2024-xiahai', 'pts-2024-xiahai'],
      },
      {
        id: 'matchmaker',
        type: 'text',
        tab: '月老與古蹟',
        tabEn: 'The Matchmaker and the Monument',
        title: '月下老人與古蹟',
        titleEn: 'The Old Man under the Moon and a historic monument',
        lead: '1971年才增祀的月下老人，讓這座一百多年的城隍廟成了求姻緣的名所；廟本身在1985年被指定為古蹟。',
        leadEn: 'The Old Man under the Moon (the matchmaker deity) was added only in 1971, making this temple of more than a century a famous place to pray for a good marriage; the temple itself was designated a monument in 1985.',
        paragraphs: [
          '霞海城隍廟的月下老人是1971年（民國60年）才增祀的：內政部臺灣宗教文化地圖寫，一位老太太捐獻月下老人神像，此後成為廟中神祇之一；臺灣宗教百景與媒體專欄也都記1971年增祀。捐獻者的姓名與動機，本站查無可靠出處，只依官方網站寫「一位老太太」。',
          '臺灣宗教百景稱它是「臺灣最紅的月老廟」。民間通說月老掌管姻緣簿；至於「撮合了幾萬對」之類的統計，來源不明，本站不寫。',
          '廟本身在1985年8月19日被指定為古蹟（內政部頁面記公告文號臺內民字第338095號，並寫當年指定為第3級古蹟），現為直轄市定（臺北市定）古蹟。官方公告原件與國家文化資產網的原頁，本站未能開啟核對，級別沿革標「待核」。',
        ],
        paragraphsEn: [
          'The Old Man under the Moon at the Xiahai City God Temple was added to worship only in 1971 (the 60th year of the Republic). The Ministry of the Interior’s Taiwan Religious Culture Map says that an elderly woman donated an image of the Old Man under the Moon, who has since been one of the temple’s deities; Taiwan Religious Landscapes and media columns likewise record the addition in 1971. This site has found no reliable source for the donor’s name or motive, and follows the official website in saying only “an elderly woman”.',
          'Taiwan Religious Landscapes calls it “the most famous matchmaker temple in Taiwan”. Folk belief holds that the Old Man under the Moon keeps the register of marriages; as for statistics such as “has brought together tens of thousands of couples”, the source is unknown and this site does not state them.',
          'The temple itself was designated a monument on 19 August 1985 (the Ministry of the Interior’s page records the announcement document no. Tai-Nei-Min-Zi 338095 and says it was designated a Grade 3 monument that year), and it is now a municipal (Taipei City) monument. This site could not open the original official announcement or the original page of the National Cultural Heritage Database to check them, so the history of its grade is marked “to be verified”.',
        ],
        facts: [
          { label: '1971', labelEn: '1971', value: '一位老太太捐獻月下老人神像，廟中增祀月老（官方網站記載）', valueEn: 'An elderly woman donates an image of the Old Man under the Moon, and the temple adds him to its worship (as recorded on the official website)' },
          { label: '1985', labelEn: '1985', value: '指定為古蹟（公告文號臺內民字第338095號；級別沿革待核）', valueEn: 'Designated a monument (announcement document no. Tai-Nei-Min-Zi 338095; history of grade to be verified)' },
          { label: '2010', labelEn: '2010', value: '「五月十三迎城隍」登錄為臺北市民俗類文化資產', valueEn: 'The “13th of the Fifth Month City God Procession” is registered as a Taipei City folk-custom cultural asset' },
        ],
        sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape', 'gvm-city-2025-temples'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and Historical Basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and historical basis',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/xia-hai-cheng-huang.md。',
        introEn: 'This cultural site’s introduction is compiled from the sources below; select one to open the original web page. The verification record (including contradictory years and what could not be found) is in the project’s docs/research/xia-hai-cheng-huang.md.',
        sourceIds: [
          'moi-xiahai-temple',
          'moi-xiahai-folklore',
          'moi-xiahai-landscape',
          'nownews-2020-xiahai',
          'gvm-city-2025-temples',
          'pts-2024-xiahai',
          'mirror-2024-xiahai',
        ],
        disclaimer:
          '祭祀的牲禮、供品與廟口飲食查無可靠出處，本站一律不寫；廟的坪數兩說矛盾，不寫；聖誕日期依官方登錄的「五月十三」，異說不採；月老捐獻者的身分只依官方網站。國家文化資產網與廟方官網的原頁未能開啟，古蹟級別沿革標「待核」。街上這座廟是情境示意，規模、格局與相對位置並非精確復原。',
        disclaimerEn:
          'This site does not describe the animal sacrifices, offerings or food at the temple forecourt, as no reliable source exists. The two accounts of the temple’s floor area contradict each other, so neither is given. The birthday follows the officially registered “thirteenth of the fifth month”, and differing accounts are not adopted. The donor of the Old Man under the Moon is described only as the official website describes her. The original pages of the National Cultural Heritage Database and the temple’s own website could not be opened, so the history of the monument’s grade is marked “to be verified”. The temple on the street here is a scenario illustration; its size, layout and relative position are not an exact reconstruction.',
      },
    ],
  },
  {
    id: 'qian-yuan-yao-hang',
    name: '乾元藥行',
    nameEn: 'Qianyuan Medicine Hong',
    // 文化據點（迪化街的百年藥行）：中藥行不屬於飲食圖鑑的範疇，不加食物圖鑑或點餐；只出現在「酒樓繁華」
    kind: 'heritage',
    status: 'open',
    year: 1896,
    yearLabel: '1896年（一說1875年）',
    yearLabelEn: '1896 (by one account, 1875)',
    yearNote: '中研院臺史所依1929年《臺灣日日新報》〈乾元藥行三十年開業記念披露〉報導採1896年（明治29年）；維基百科與部落格另記1875年一說。本站以1896年為主、並列1875年。',
    yearNoteEn: 'The Institute of Taiwan History, Academia Sinica, adopts 1896 (the 29th year of Meiji) on the basis of the 1929 Taiwan Nichinichi Shimpo report “Announcement of the Thirtieth Anniversary of the Opening of Qianyuan Medicine Hong”; Wikipedia and a blog also give 1875 as another account. This site takes 1896 as the main year and lists 1875 alongside.',
    sourceIds: ['ith-qian-yuan', 'wiki-qian-yuan'],
    category: '文化據點｜漢藥・百年藥行',
    categoryEn: 'Cultural site | Chinese medicine and a century-old medicine hong',
    seal: '藥行',
    sealEn: 'Medicine',
    summary: '創立於1896年（一說1875年）的中藥行，創辦人張清河；歷經陳茂通等多位經營者傳承至今，是迪化街藥材街的代表老店之一。',
    summaryEn: 'A Chinese medicine shop founded in 1896 (by one account, 1875) by Zhang Qinghe; passed down through several proprietors, including Chen Maotong, to the present day, it is one of the representative old shops of Dihua Street’s medicine trade.',
    note: '乾元藥行在迪化街一段71號（門牌僅見部落格與公會名錄的摘要，未核實）。街屋的興建年代與是否登錄文化資產，本站查無可靠出處；這棟立面是依文獻描述設計的「歷史情境重建」，並非精確復原。',
    noteEn: 'Qianyuan Medicine Hong is at 71 Dihua Street, Section 1 (the number appears only in summaries from a blog and a trade directory and has not been verified). This site has found no reliable source for when the shophouse was built or whether it is a registered cultural asset; the façade here is a “reconstructed historical scene” designed from written descriptions, not an exact reconstruction.',
    // 用 site 取代北側的一般地段 north-6（只在酒樓繁華；港口商街這塊地是城隍廟、
    // 老屋新生是永樂米苔目，各在自己的年代取代，互不影響）。不用 position 預留，避免改變共用地段的切分
    position: { x: 17.8, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.2 },
    site: { x: 17.8, z: -4.5, rotationY: 0, replaces: ['north-6'] },
    building: {
      archetype: 'baroque',
      width: 6.4,
      depth: 11,
      floors: 2,
      plasterTint: '#ece0c8',
      trimTint: '#f7f0e0',
      storefront: 'open',
      sign: { text: '乾元藥行', style: 'gold' },
      parapet: 'arch',
    },
    buildingByEra: {
      // 展示櫥窗（shopfront/shopType）是摩登年代限定的立面樣式，酒樓繁華用一般的開放店面
      banquet: { condition: 'new' },
    },
    eraNotes: {
      banquet:
        '只出現在「酒樓繁華」。乾元藥行創立於1896年（一說1875年），創辦人張清河1917年過世後由陳茂通接手；陳茂通曾任臺北本島人藥業組合長、藥郊聯合會會長。文獻記它的立面山牆有牛眼窗、窗框飾人蔘圖案；這棟街屋是依描述設計的歷史情境重建。',
      banquetEn:
        'Appears only in Banquet Hall Boom. Qianyuan Medicine Hong was founded in 1896 (by one account, 1875) by Zhang Qinghe; after he died in 1917 Chen Maotong took it over, and Chen served as head of the Taipei Association of Local Medicine Traders and president of the Medicine Jiao Federation. Written sources record a gable with an ox-eye window and ginseng motifs on the window frame; this shophouse is a reconstructed historical scene designed from those descriptions.',
    },
    camera: { distance: 6, height: 4.2, side: -4, lookHeight: 3.2 },
    chapters: [
      {
        id: 'founding',
        type: 'text',
        tab: '創立與傳承',
        tabEn: 'Founding and Succession',
        title: '張清河與乾元藥行',
        titleEn: 'Zhang Qinghe and Qianyuan Medicine Hong',
        lead: '一家創立於十九世紀末的中藥行，一百多年間歷經多位經營者，至今仍由家族後人延續。',
        leadEn: 'A Chinese medicine shop founded in the late nineteenth century, run by several proprietors over more than a hundred years and still carried on by the family’s descendants.',
        paragraphs: [
          '乾元藥行的創立年份有兩說：中研院臺灣史研究所檔案館依1929年《臺灣日日新報》的〈乾元藥行三十年開業記念披露〉報導，採1896年（明治29年）；維基百科與部落格另記1875年一說。本站以1896年為主、並列1875年。創辦人是張清河，1917年過世。',
          '張清河過世後，原為股東兼學徒的陳茂通在1917年接手。陳茂通曾任臺北本島人藥業組合長、藥郊聯合會的會長，1936年8月病逝；其後藥行由股東朱樹勳、陳福經營。1960年陳金清富接手，家族後人延續至今。部落格另記陳鳳鎮1994年、陳建忠1998年先後接手，2011年陳建國另創「上乾元蔘藥行」（單一來源）。',
          '乾元藥行與長崎的貿易商泰益號有生意往來，委辦報關納稅與轉運；1928年曾向香港的協元順訂購13件藥材。主要產品包括治霍亂的「平安散」，1932年曾寄贈一千包到廈門。',
        ],
        paragraphsEn: [
          'There are two accounts of the year Qianyuan Medicine Hong was founded. The Archives of the Institute of Taiwan History, Academia Sinica, adopts 1896 (the 29th year of Meiji) on the basis of the 1929 Taiwan Nichinichi Shimpo report “Announcement of the Thirtieth Anniversary of the Opening of Qianyuan Medicine Hong”; Wikipedia and a blog also give 1875 as another account. This site takes 1896 as the main year and lists 1875 alongside. The founder was Zhang Qinghe, who died in 1917.',
          'After Zhang Qinghe’s death, Chen Maotong, who had been both a shareholder and an apprentice, took over in 1917. Chen served as head of the Taipei Association of Local Medicine Traders and president of the Medicine Jiao Federation, and died of illness in August 1936; the shop was then run by the shareholders Zhu Shuxun and Chen Fu. In 1960 Chen Jinqingfu took over, and the family’s descendants have carried it on to the present. The blog also records that Chen Fengzhen took over in 1994 and Chen Jianzhong in 1998, and that in 2011 Chen Jianguo founded a separate “Shang Qianyuan Ginseng and Medicine Hong” (a single source).',
          'Qianyuan did business with Taiyi Hao, a trading firm in Nagasaki, which handled customs declarations, tax payment and transshipment on its behalf; in 1928 it ordered 13 items of medicinal materials from Xieyuanshun in Hong Kong. Its main products included “Ping’an San”, a remedy for cholera, of which it donated a thousand packets to Xiamen in 1932.',
        ],
        timeline: [
          { place: '1896（一說1875）', placeEn: '1896 (by one account, 1875)', text: '乾元藥行創立，創辦人張清河。', textEn: 'Qianyuan Medicine Hong is founded by Zhang Qinghe.' },
          { place: '1917', placeEn: '1917', text: '張清河過世，股東兼學徒陳茂通接手。', textEn: 'Zhang Qinghe dies, and Chen Maotong, shareholder and apprentice, takes over.' },
          { place: '1936', placeEn: '1936', text: '陳茂通病逝，其後由股東朱樹勳、陳福經營。', textEn: 'Chen Maotong dies of illness; the shop is then run by the shareholders Zhu Shuxun and Chen Fu.' },
          { place: '1960', placeEn: '1960', text: '陳金清富接手，家族後人延續至今。', textEn: 'Chen Jinqingfu takes over, and the family’s descendants carry it on to the present.' },
        ],
        glossary: [
          { term: '藥郊', termEn: 'Yaojiao (medicine jiao)', definition: '中藥材商人的同業組織；「郊」是清代以來臺灣商人依貿易地或行業組成的公會，陳茂通曾任藥郊聯合會會長。', definitionEn: 'The trade association of Chinese-medicine merchants; a “jiao” was a guild that Taiwanese merchants formed from the Qing dynasty onward by trading region or trade, and Chen Maotong served as president of the Medicine Jiao Federation.' },
        ],
        sourceIds: ['ith-qian-yuan', 'wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'medicine-street',
        type: 'text',
        tab: '藥材街',
        tabEn: 'Medicine Street',
        title: '迪化街的中藥材',
        titleEn: 'Chinese medicinal materials on Dihua Street',
        lead: '中藥材、南北乾貨與布料，是迪化街商業的三大支柱；乾元專賣中藥材，走出和南北貨商號不同的路。',
        leadEn: 'Chinese medicinal materials, dried goods from north and south, and cloth were the three pillars of Dihua Street’s commerce; Qianyuan sold only medicinal materials, taking a different path from the north-and-south goods firms.',
        paragraphs: [
          '中研院臺史所的專文寫，迪化街以中藥材、南北乾貨、布料商的聚集著稱；1860年淡水開港後外商設洋行經營茶葉，19世紀末大稻埕成為臺灣北部的貨物集散中心，日治時期仍是本島人南北雜貨批發的重鎮。',
          '乾元藥行「專賣中藥材，不賣其它南北貨」（部落格的觀察），與同一條街上經營南北雜貨的林復振商行是不同的路線。兩家同為迪化街的百年老店、各自經營；它們之間有沒有股權或親屬關係，文獻沒有明文，本站不寫。',
          '藥業也有自己的同業組織：陳茂通擔任過臺北本島人藥業組合長與藥郊聯合會會長，顯示日治時期大稻埕的藥材商已有組織化的公會。',
        ],
        paragraphsEn: [
          'A study by the Institute of Taiwan History, Academia Sinica, says that Dihua Street is known for its concentration of dealers in Chinese medicinal materials, dried goods from north and south, and cloth. After Tamsui opened as a port in 1860, foreign firms set up hongs to trade in tea; by the end of the nineteenth century Dadaocheng had become the goods distribution centre of northern Taiwan, and in the Japanese period it remained a major centre of wholesale general goods for Taiwanese-born merchants, both north and south.',
          'Qianyuan “sold only Chinese medicinal materials and no other goods from north and south” (the blog’s observation), a different line from Lin Fuzhen, the firm on the same street that dealt in general goods from north and south. Both are century-old shops of Dihua Street, each run on its own; the written sources say nothing explicit about any shareholding or family relationship between them, and this site does not state one.',
          'The medicine trade also had its own trade organisations: Chen Maotong served as head of the Taipei Association of Local Medicine Traders and as president of the Medicine Jiao Federation, which shows that by the Japanese period Dadaocheng’s medicine merchants already had organised guilds.',
        ],
        sourceIds: ['ith-dihua-stores-intro', 'ith-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'shophouse',
        type: 'text',
        tab: '店屋與立面',
        tabEn: 'Shophouse and Façade',
        title: '三進的藥行店屋',
        titleEn: 'A three-courtyard medicine-shop shophouse',
        lead: '山牆下的牛眼窗、窗框上的人蔘圖案——文獻裡的乾元立面；店身縱深三進，天井之間煮藥、晾曬。',
        leadEn: 'An ox-eye window under the gable and ginseng motifs on the window frame: Qianyuan’s façade as the written sources describe it. The shop runs three courtyards deep, with decoctions boiled and herbs dried between the skywells.',
        paragraphs: [
          '維基百科描述乾元的立面：頂端凸出山牆，以水平檐板取代常見的巴洛克花草紋飾，山牆下有牛眼窗，窗框飾人蔘圖案；部落格則寫水平直線的屋簷與竹節式壁柱，認為是日治時期常見的樣式。',
          '部落格記店面縱深約60公尺、共三進，進與進之間有天井，供煮藥、晾曬、倉庫與生活；曾因煮藥失火，前兩進的木樓板燒毀後改建（以上為單一來源）。',
          '這棟街屋的興建年代，本站查無文獻明載；有沒有文化資產的身分，也查無資料，本站都不寫成事實。場景中的立面是依上述描述設計的「歷史情境重建」：牛眼窗與人蔘圖案等細節沒有重現，寬度也配合街上的地段，並非精確復原。',
        ],
        paragraphsEn: [
          'Wikipedia describes Qianyuan’s façade: a gable projecting at the top, with a horizontal cornice board in place of the usual Baroque floral ornament, an ox-eye window below the gable, and ginseng motifs on the window frame. The blog describes horizontal straight eaves and bamboo-joint pilasters, and considers this a style common in the Japanese period.',
          'The blog records that the shop is about 60 metres deep and has three courtyards, with skywells between them used for boiling medicine, drying, storage and daily life; a fire from boiling medicine burned the timber floors of the first two courtyards, which were then rebuilt (all of this is from a single source).',
          'This site has found no source that states when the shophouse was built, and no information on whether it has cultural-asset status, so neither is stated as fact. The façade in the scene is a “reconstructed historical scene” designed from the descriptions above: details such as the ox-eye window and ginseng motifs are not reproduced, and the width is fitted to the lots on the street, so it is not an exact reconstruction.',
        ],
        sourceIds: ['wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and Historical Basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and historical basis',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/qian-yuan-yao-hang.md。',
        introEn: 'This cultural site’s introduction is compiled from the sources below; select one to open the original web page. The verification record (including contradictory years and what could not be found) is in the project’s docs/research/qian-yuan-yao-hang.md.',
        sourceIds: ['ith-qian-yuan', 'ith-dihua-stores-intro', 'wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
        disclaimer:
          '創立年份1896／1875兩說並列；門牌迪化街一段71號僅見部落格與公會名錄的摘要，未核實，對照地圖上標為示意；街屋的興建年代與文化資產登錄查無，不寫成事實；近年的營業現況未取得直接證據。店屋立面為歷史情境重建，並非精確復原。',
        disclaimerEn:
          'The two accounts of the founding year, 1896 and 1875, are listed side by side. The address 71 Dihua Street, Section 1, appears only in summaries from a blog and a trade directory and has not been verified, so it is shown on the map as approximate. The building’s construction date and any cultural-asset registration could not be found and are not stated as fact; no direct evidence of its current business was obtained. The shophouse façade is a reconstructed historical scene, not an exact reconstruction.',
      },
    ],
  },
  {
    id: 'lin-hua-tai',
    name: '林華泰茶行',
    nameEn: 'Lin Huatai Tea Hong',
    theme: 'tea',
    status: 'open',
    year: 1883,
    category: '茶行',
    categoryEn: 'Tea hong',
    seal: '茶行',
    sealEn: 'Tea Hong',
    summary: '1883年起做毛茶的篩選與精製，是臺北最老的茶行之一；重慶北路的「前店後廠」至今以大鐵桶陳列茶葉、批發為主。',
    summaryEn: 'Since 1883 it has sorted and refined rough tea, making it one of the oldest tea hongs in Taipei; its “shop in front, factory behind” on Chongqing North Road still displays tea in large iron drums and deals mainly in wholesale.',
    note: '林華泰最初的店址與遷到重慶北路現址的年份，本站引用的文獻沒有記載；街上的店面與各年代的招牌都是情境示意。',
    noteEn: 'The literature this site cites does not record Lin Huatai’s first location or the year it moved to its present site on Chongqing North Road; the shopfront on the street and the signs of each era are scenario illustrations.',
    position: { x: -22, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.2 },
    building: {
      archetype: 'minnan',
      width: 6,
      depth: 11,
      floors: 2,
      groundHeight: 3.3,
      ground: 'brick',
      upper: 'plaster',
      plasterTint: '#ecdfc2',
      woodTint: '#c9ad8a',
      gable: 'horseback',
      ridge: 'curved',
      storefront: 'open',
      goods: 'tea',
      sign: { text: '林華泰茶行', style: 'wood' },
    },
    buildingByEra: {
      // 第 10 階段：港口商街版可以走進去（前店、秤茶桌、焙茶區；歷史情境重建，builders/linHuaTaiQing.js）
      'qing-port': { condition: 'new', archetype: 'lin-hua-tai-qing' },
      banquet: { condition: 'mature', sign: { text: '林華泰茶行', style: 'gold' } },
      modern: { condition: 'mature', sign: { text: '林華泰茶行', style: 'lacquer' } },
      postwar: { condition: 'aged', sign: { text: '林華泰茶行', style: 'painted' } },
      revival: { condition: 'restored', sign: { text: '林華泰茶行', style: 'lacquer' } },
    },
    // 只有港口商街的版本有室內的資訊熱點（秤茶桌、焙茶區；其他年代仍是一般店面）
    eras: { 'qing-port': { hotspots: hotspotsToWorld(LHT_HOTSPOTS, lhtToWorld) } },
    // 各年代介紹視窗上方的「此時期的林華泰茶行」；家族口述整理自官網〈林華泰的歷史〉
    eraNotes: {
      'qing-port':
        '1883年，林華泰開始做毛茶的篩選與精製（官網）。創辦人的姓名與最初的店址，本站引用的文獻沒有記載；這個年代的店面是情境示意。',
      'qing-portEn':
        'In 1883 Lin Huatai began sorting and refining rough tea (official website). The literature this site cites does not record the founder’s name or the first location; the shopfront in this era is a scenario illustration.',
      banquet:
        '日治時期大稻埕茶業鼎盛，全盛時期有兩百多家茶行。《臺灣工藝》記載重慶北路對街一排數家茶行均為林華泰系列，是「典型銷華人社會的茶商」；林華泰本身這個時期的外銷紀錄，文獻未載。',
      banquetEn:
        'In the Japanese period Dadaocheng’s tea trade flourished, with more than two hundred tea hongs at its height. Taiwan Crafts records that the row of several tea hongs across Chongqing North Road were all part of the Lin Huatai group, “typical tea merchants selling to Chinese communities”; the literature does not record Lin Huatai’s own exports in this period.',
      modern:
        '家族口述：1930年代的炭焙暖房有三十幾個直徑約兩尺的圓火坑分成四排，茶葉在竹焙籠上以炭火烘焙。這個年代的店面是情境示意。',
      modernEn:
        'Family oral history: the charcoal-roasting warm room of the 1930s had thirty-odd round fire pits, each about two chi across, in four rows, where tea was roasted over charcoal in bamboo roasting baskets. The shopfront in this era is a scenario illustration.',
      postwar:
        '家族口述：戰後的林華泰以批發為主，茶季的早上院子裡有幾十上百位茶農背著茶包進出，傍晚貨運卡車把茶出貨到島內各地的茶莊；入夜後茉莉花農騎腳踏車送花來薰製花茶。炭焙坑從三十幾個縮減到八個、再剩兩個，改用大型乾燥機。',
      postwarEn:
        'Family oral history: after the war Lin Huatai dealt mainly in wholesale. On tea-season mornings dozens or even a hundred tea farmers came and went in the yard with bags of tea on their backs, and in the evening freight trucks shipped the tea to tea shops across the island; after dark, jasmine growers came on bicycles to deliver flowers for scenting jasmine tea. The charcoal roasting pits were reduced from thirty-odd to eight, then to two, and large drying machines were adopted.',
      revival:
        '重慶北路二段193號的「前店後廠」：店裡陳列近百個大小茶桶，用老秤計量；店後的大型乾燥機仍在使用，炭焙坑封存留作遺址。2011年家族分家，老二林茂森在隔壁另開林茂森茶行；林華泰接受學校的校外教學申請。',
      revivalEn:
        'The “shop in front, factory behind” at 193 Chongqing North Road, Section 2: the shop displays nearly a hundred tea drums of various sizes, with tea weighed on an old steelyard; the large drying machine behind the shop is still in use, and the charcoal roasting pits are sealed and kept as a relic. In 2011 the family divided, and the second son, Lin Maosen, opened Lin Maosen Tea Hong next door; Lin Huatai accepts applications from schools for field trips.',
    },
    // 按 E 探索時的鏡頭：斜角取景，留在街道的路面上（路面 z ±2.8，不進對面的騎樓）
    camera: { distance: 6.6, height: 4.2, side: 5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'tea-port',
        type: 'text',
        tab: '茶與開港',
        tabEn: 'Tea and the Opening of the Port',
        title: '淡水開港與大稻埕的茶',
        titleEn: 'The opening of Tamsui and Dadaocheng’s tea',
        lead: '1858年天津條約開放臺灣通商，1862年滬尾正式設關；外商在大稻埕設精製茶廠，臺灣烏龍茶從此走向世界。',
        leadEn: 'The 1858 Treaty of Tianjin opened Taiwan to trade, and a customs house formally opened at Huwei in 1862; foreign firms set up refining factories in Dadaocheng, and Taiwan oolong went out to the world.',
        paragraphs: [
          '清咸豐年間，清廷與英法簽訂天津條約（1858年）與北京條約（1860年），臺灣依約開港通商。淡水河口的滬尾被定為開埠地點，同治元年（1862年7月）正式開關徵稅，這是通稱「淡水開港」的由來。',
          '英商陶德（John Dodd）在臺灣發現茶的潛力，自福建安溪引進茶苗、貸款給茶農種植，並在1868年把精製茶廠設在大稻埕；1869年臺灣烏龍茶以「Formosa Oolong」之名運往美國紐約，大受歡迎，奠定臺茶外銷的基礎。',
          '茶葉從淡水河沿岸的碼頭卸下，送進大稻埕的茶行精製，再裝箱出口。臺茶外銷量從1865年的一百三十餘公噸增加到1885年的近七千五百公噸；1878年茶葉的出口額超過蔗糖，成為臺灣最重要的出口商品。大稻埕因此從河岸的村落變成北臺灣的商業中心。',
        ],
        paragraphsEn: [
          'In the Xianfeng years the Qing court signed the Treaty of Tianjin (1858) and the Convention of Peking (1860) with Britain and France, and under them Taiwan was opened to trade. Huwei, at the mouth of the Tamsui River, was designated the port, and in the first year of the Tongzhi reign (July 1862) its customs house formally opened and began collecting duties; this is the origin of what is commonly called the “opening of Tamsui”.',
          'The British merchant John Dodd saw the potential of tea in Taiwan, brought in tea seedlings from Anxi in Fujian, lent money to tea farmers to plant them, and in 1868 set up his refining factory in Dadaocheng. In 1869 Taiwan oolong was shipped to New York under the name “Formosa Oolong” and was well received, laying the foundation for Taiwan’s tea exports.',
          'Tea was unloaded at the wharves along the Tamsui River, taken to Dadaocheng’s tea hongs for refining, and then packed for export. Taiwan’s tea exports rose from a little over a hundred and thirty tonnes in 1865 to nearly seven thousand five hundred tonnes in 1885; in 1878 the value of tea exports exceeded that of sugar, making tea Taiwan’s most important export. Dadaocheng thus changed from a riverside village into the commercial centre of northern Taiwan.',
        ],
        timeline: [
          { place: '1858', placeEn: '1858', text: '天津條約開放臺灣通商；淡水河口的滬尾被定為開埠地點。', textEn: 'The Treaty of Tianjin opens Taiwan to trade; Huwei, at the mouth of the Tamsui River, is designated the port.' },
          { place: '1862', placeEn: '1862', text: '滬尾正式開關徵稅，洋行陸續進駐。', textEn: 'The customs house at Huwei formally opens and begins collecting duties, and foreign firms move in one after another.' },
          { place: '1865', placeEn: '1865', text: '臺茶有正式出口紀錄，被茶葉輸出業公會定為臺茶出口元年。', textEn: 'Taiwan tea has its first official export record, which the tea exporters’ association later designates the first year of Taiwan tea exports.' },
          { place: '1868', placeEn: '1868', text: '陶德把精製茶廠設在大稻埕。', textEn: 'Dodd sets up his refining factory in Dadaocheng.' },
          { place: '1869', placeEn: '1869', text: '臺灣烏龍茶運往紐約，「Formosa Oolong」打開美國市場。', textEn: 'Taiwan oolong is shipped to New York, and “Formosa Oolong” opens the American market.' },
          { place: '1883', placeEn: '1883', text: '林華泰開始做毛茶的篩選與精製。', textEn: 'Lin Huatai begins sorting and refining rough tea.' },
        ],
        glossary: [
          { term: '開港', termEn: 'Opening of the port (kaigang)', definition: '依條約開放港口與外國通商。淡水在1858年的條約中被開放，1862年設海關後正式運作，所以文獻有「1858」、「1860」、「1862」三種寫法。', definitionEn: 'Opening a port to trade with foreign countries under a treaty. Tamsui was opened by the treaties of 1858 and began operating formally after the customs house was set up in 1862, which is why the literature gives three dates: 1858, 1860 and 1862.' },
          { term: '毛茶', termEn: 'Rough tea (maocha)', definition: '茶農初製完成、還沒有經過篩選分級與烘焙的茶葉；茶行把毛茶「精製」之後才出售或外銷。', definitionEn: 'Tea that the farmer has finished first-stage processing but that has not yet been sorted, graded or roasted; a tea hong “refines” rough tea before selling or exporting it.' },
          { term: '洋行', termEn: 'Foreign firm (yanghang, hong)', definition: '外國商人在開港口岸設立的貿易商號，例如陶德的寶順洋行；清末大稻埕先後有寶順、德記、怡記、和記、水陸等洋行經營茶葉。', definitionEn: 'A trading house set up by foreign merchants at a treaty port, such as Dodd’s Boshun hong; in late-Qing Dadaocheng the Boshun, Deji, Yiji, Heji and Shuilu hongs, among others, all traded in tea.' },
        ],
        sourceIds: ['tshs-zhang-tamsui-port', 'ntcri-73-tea-road', 'twcenter-muzha-tea-2001', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '百年茶行',
        tabEn: 'A Century-Old Tea Hong',
        title: '林華泰的一百四十年',
        titleEn: 'Lin Huatai’s one hundred and forty years',
        lead: '1883年起做毛茶的篩選與精製，是臺北最老的茶行之一；家族來自臺北近郊的茶山。',
        leadEn: 'Since 1883 it has sorted and refined rough tea, making it one of the oldest tea hongs in Taipei; the family comes from the tea hills on the outskirts of the city.',
        paragraphs: [
          '林華泰茶行的商標寫著「THE OLDEST TEASHOP LIN HUATAI 1883」。官網記載，林華泰從1883年開始就扮演把初製毛茶再篩選、精製的角色；臺北市政府觀光傳播局的刊物也把它列為1883年開業、臺北茶業最老的字號之一。',
          '家族的根在臺北近郊的茶山：第三代林大村在石碇楓仔林的茶山長大，店裡的舊茶鏟中央蓋著一個「楓」字。臺北市政府的刊物則寫家族最早在深坑種茶製茶，之後才到大稻埕開店；深坑與石碇相鄰，本站把兩種記載都列出。',
          '第三代林大村在五兄弟中排行第二，兄弟分家時接下以批發為主的林華泰，伯父與三叔各自掌管全泰與全祥茶莊（家族口述）。林大村在1977年獲臺北市政府頒贈「孝行楷模紀念」匾額，2003年過世。第四代有林秀峰、林茂森、林秀全、林茂祥四兄弟；2011年家族分家，林茂森在原店隔壁另開林茂森茶行，林華泰則由林秀全、林茂祥等人經營，官網聲明「僅此一家，沒有分店」。',
        ],
        paragraphsEn: [
          'The Lin Huatai Tea Hong trademark reads “THE OLDEST TEASHOP LIN HUATAI 1883”. The official website records that from 1883 Lin Huatai played the role of sorting and refining rough tea after its first processing; a publication of the Taipei City Government Department of Information and Tourism likewise lists it as one of the oldest tea firms in Taipei, opened in 1883.',
          'The family’s roots are in the tea hills on the outskirts of Taipei: Lin Dacun, of the third generation, grew up in the tea hills at Fengzailin in Shiding, and an old tea shovel in the shop has the character “楓” (feng) stamped in its centre. The Taipei City Government publication, however, says that the family first grew and made tea in Shenkeng before opening a shop in Dadaocheng; Shenkeng and Shiding are neighbouring districts, and this site lists both accounts.',
          'Lin Dacun, of the third generation, was the second of five brothers; when the brothers divided the family property he took over Lin Huatai, which was mainly wholesale, while his uncle and his third uncle each ran the Quantai and Quanxiang tea shops (family oral history). In 1977 Lin Dacun received a “Model of Filial Conduct” commemorative plaque from the Taipei City Government, and he died in 2003. The fourth generation comprised four brothers: Lin Xiufeng, Lin Maosen, Lin Xiuquan and Lin Maoxiang. In 2011 the family divided, and Lin Maosen opened Lin Maosen Tea Hong next to the original shop, while Lin Huatai is run by Lin Xiuquan, Lin Maoxiang and others; the official website states: “Only this one shop, no branches.”',
        ],
        summary: {
          label: '家族口述',
          labelEn: 'Family oral history',
          text: '官網〈林華泰的歷史〉標明擷取自第四代林秀全的《林華泰茶行老三的故事》，是家族的回憶；本章標「家族口述」的段落都出自這裡，沒有其他文獻可以核對。',
          textEn: 'The official website’s “The History of Lin Huatai” says it is excerpted from The Story of the Third Brother of Lin Huatai Tea Hong by Lin Xiuquan of the fourth generation; it is the family’s recollection. The passages in this chapter marked “family oral history” all come from it, and there is no other source to check them against.',
        },
        facts: [
          { label: '創立', labelEn: 'Founded', value: '1883年（官網商標與臺北市政府觀光傳播局刊物）', valueEn: '1883 (the official website’s trademark and a Taipei City Government Department of Information and Tourism publication)' },
          { label: '創辦人', labelEn: 'Founder', value: '本站引用的文獻未載', valueEn: 'Not recorded in the literature this site cites' },
          { label: '家族淵源', labelEn: 'Family origins', value: '石碇楓仔林（官網）；深坑（Discover Taipei）', valueEn: 'Fengzailin in Shiding (official website); Shenkeng (Discover Taipei)' },
          { label: '現址', labelEn: 'Present address', value: '臺北市重慶北路二段193號', valueEn: '193 Chongqing North Road, Section 2, Taipei' },
          { label: '傳承', labelEn: 'Succession', value: '第三代林大村（1977年獲孝行楷模匾額）、第四代林秀全等人', valueEn: 'Lin Dacun of the third generation (received the Model of Filial Conduct plaque in 1977); Lin Xiuquan and others of the fourth generation' },
        ],
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'ltn-linhuatai-2014'],
      },
      {
        id: 'workshop',
        type: 'text',
        tab: '前店後廠',
        tabEn: 'Shop in Front, Factory Behind',
        title: '前店後廠與大茶桶',
        titleEn: 'The shop in front, the factory behind, and the big tea drums',
        lead: '店面是批發茶行，店後是精製茶廠：近百個大鐵桶裝著各種茶葉與等級，用老秤計量、金屬鏟裝袋。',
        leadEn: 'The shopfront is a wholesale tea hong and behind it is a tea-refining factory: nearly a hundred large iron drums hold teas of every kind and grade, weighed on an old steelyard and scooped into bags with a metal shovel.',
        paragraphs: [
          '林華泰自稱是全臺唯一僅存的「前店後廠」。走進店裡，看到的是近百個大小茶桶排在四周，裝著不同種類與等級的茶葉；因為是批發商，散茶用的是超大號的圓鐵桶。茶葉用老式的秤計量、金屬鏟裝進簡單的袋子，店裡的老秤已經用了五十多年。',
          '店後的工廠把農家送來的茶葉分類，送進大型烘茶機烘焙、篩選、曬涼。運作了半個世紀的大型乾燥機仍在使用；1930年代以炭火烘焙的暖房有三十幾個圓火坑，後來縮減到八個、再剩兩個，現在封存留作遺址（家族口述）。',
          '《臺灣工藝》記載，重慶北路對街一排數家茶行均為林華泰系列，是當時典型銷往華人社會的茶商，至今仍保留大部分精製茶的設備；重慶北路二段的茶葉公園，過去是閩客茶商與茶農交易的場所。',
        ],
        paragraphsEn: [
          'Lin Huatai describes itself as the only remaining “shop in front, factory behind” in Taiwan. Walking into the shop, you see nearly a hundred tea drums of various sizes ranged around the walls, holding different kinds and grades of tea; because it is a wholesaler, loose tea is kept in extra-large round iron drums. Tea is weighed on an old-style steelyard and scooped into plain bags with a metal shovel, and the old steelyard in the shop has been in use for more than fifty years.',
          'In the factory behind the shop, tea delivered by farms is sorted, then roasted, sieved and left to cool in large tea-roasting machines. The large drying machine, which has run for half a century, is still in use; the warm room where tea was roasted over charcoal in the 1930s had thirty-odd round fire pits, later reduced to eight and then two, and today they are sealed and kept as a relic (family oral history).',
          'Taiwan Crafts records that the row of several tea hongs across Chongqing North Road were all part of the Lin Huatai group, typical tea merchants of the time selling to Chinese communities, and that most of their tea-refining equipment is still preserved; the Tea Park on Chongqing North Road, Section 2, was formerly a place where Hokkien and Hakka tea merchants traded with tea farmers.',
        ],
        lists: [
          {
            title: '精製茶行的一天（家族口述）',
            titleEn: 'A day at a tea-refining hong (family oral history)',
            kind: 'plain',
            items: [
              '早上：茶季時院子裡有幾十上百位茶農背著茶包進出。',
              '白天：卡車載來粗茶，分類後送進烘茶機烘焙、篩選。',
              '傍晚：貨運卡車把精製好的茶出貨到島內各地的茶莊。',
              '入夜：茉莉花農穿木屐騎腳踏車送花來，薰製茉莉花茶。',
            ],
            itemsEn: [
              'Morning: in the tea season dozens or even a hundred tea farmers come and go in the yard with bags of tea on their backs.',
              'Daytime: trucks bring in coarse tea, which is sorted and then roasted and sieved in the roasting machines.',
              'Evening: freight trucks ship the refined tea to tea shops across the island.',
              'Night: jasmine growers arrive on bicycles in wooden clogs, delivering flowers for scenting jasmine tea.',
            ],
          },
        ],
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'ntcri-73-tea-road'],
      },
      // 第 10 階段：器物 3D 檢視（桿秤；港口商街版的秤茶桌也可以走近近看）
      {
        id: 'tea-scale',
        type: 'object',
        tab: '器物：桿秤',
        tabEn: 'Object: Steelyard',
        title: '桿秤：秤茶論擔論斤',
        titleEn: 'The steelyard: weighing tea by the dan and the jin',
        lead: '秤鉤吊起茶簍、秤錘沿著秤桿滑到平衡，刻度就是重量——茶行的買賣，從一桿秤開始。',
        leadEn: 'The hook lifts the tea basket, the weight slides along the beam until it balances, and the mark is the weight: dealing in tea at a tea hong begins with a steelyard.',
        object: 'tea-scale',
        summary: {
          label: '歷史情境重建',
          labelEn: 'Reconstructed historical scene',
          text: 'Davidson（1903）記載茶的交易以擔、斤計（他自註一擔＝133磅）；清末茶行用秤的形制查無，模型依一般桿秤的樣式重建。林華泰店裡用了五十多年的老秤是戰後的事（家族口述），不是這一桿。',
          textEn: 'Davidson (1903) records that tea was traded by the dan and the jin (he notes that one dan equals 133 pounds); no source exists for the form of the scales used in a late-Qing tea hong, so the model is reconstructed from the style of an ordinary steelyard. The old steelyard that Lin Huatai has used in its shop for more than fifty years dates from after the war (family oral history) and is not this one.',
        },
        paragraphs: ['模型（3D 檢視）：可以旋轉、縮放，按「秤重」把秤錘滑到平衡。港口商街版店內的秤茶桌也可以走近近看。'],
        paragraphsEn: ['Model (3D viewer): you can rotate and zoom it, and press “Weigh” to slide the weight until it balances. The tea-weighing table inside the Harbour Merchant Street version of the shop can also be examined up close.'],
        sourceIds: ['davidson-formosa-1903', 'linhuatai-site'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表茶品',
        tabEn: 'Signature Teas',
        title: '代表茶品｜臺灣的茶',
        titleEn: 'Signature teas | Taiwan’s teas',
        intro: '林華泰官網的〈台灣的茶〉介紹臺灣烏龍茶、包種茶、白毫烏龍茶（東方美人）與焙香烏龍茶；報導裡另提到鐵觀音、凍頂烏龍與茉莉花茶。以下圖鑑介紹其中幾種。',
        introEn: 'The Lin Huatai website’s “Taiwan’s Tea” introduces Taiwan oolong, Baozhong, Baihao oolong (Oriental Beauty) and roasted oolong; press reports also mention Tieguanyin, Dongding oolong and jasmine tea. The guide below introduces several of them.',
        items: [
          {
            id: 'baozhong-tea',
            name: '包種茶',
            nameEn: 'Baozhong tea',
            category: '輕發酵｜條形',
            categoryEn: 'Lightly fermented | strip-shaped',
            description: '條形的輕發酵烏龍茶，茶湯清香。1881年同安茶商在大稻埕設源隆行專製包種茶，大稻埕外銷南洋的主力茶幾乎都是坪林的文山包種茶。',
            descriptionEn: 'A lightly fermented, strip-shaped oolong with a clear, fragrant liquor. In 1881 a Tong’an tea merchant set up Yuanlong Hong in Dadaocheng to make Baozhong exclusively, and nearly all the tea that Dadaocheng exported to Southeast Asia was Wenshan Baozhong from Pinglin.',
          },
          {
            id: 'oolong-tea',
            name: '烏龍茶',
            nameEn: 'Oolong tea',
            category: '部分發酵｜球形或條形',
            categoryEn: 'Partly fermented | ball-shaped or strip-shaped',
            description: '臺灣最具代表性的茶類。1869年陶德把臺灣烏龍茶運往紐約，「Formosa Oolong」成為臺茶外銷的起點。',
            descriptionEn: 'Taiwan’s most representative type of tea. In 1869 Dodd shipped Taiwan oolong to New York, and “Formosa Oolong” became the starting point of Taiwan tea exports.',
            note: '臺北市政府觀光傳播局的刊物記載，林華泰推薦的凍頂烏龍特別受日本客人歡迎。',
            noteEn: 'A publication of the Taipei City Government Department of Information and Tourism records that the Dongding oolong that Lin Huatai recommends is especially popular with Japanese customers.',
          },
          {
            id: 'tieguanyin',
            name: '鐵觀音',
            nameEn: 'Tieguanyin',
            category: '重發酵｜焙火',
            categoryEn: 'Heavily fermented | charcoal-roasted',
            description: '原產福建安溪，焙火較重、滋味醇厚。外交部《Taiwan Today》2010年的報導寫店裡有鐵觀音等數十種不同等級的茶葉。',
            descriptionEn: 'Originally from Anxi in Fujian, it is roasted more heavily and has a mellow, full flavour. A 2010 report in the Ministry of Foreign Affairs’ Taiwan Today says the shop stocks dozens of teas of different grades, Tieguanyin among them.',
          },
          {
            id: 'jasmine-tea',
            name: '茉莉花茶',
            nameEn: 'Jasmine tea',
            category: '薰花茶',
            categoryEn: 'Scented tea',
            description: '把新鮮茉莉花與茶葉層層堆疊，讓茶吸收花香再把花篩掉，稱為「薰花」。',
            descriptionEn: 'Fresh jasmine flowers are layered with tea so that the tea absorbs their fragrance, and the flowers are then sieved out; this is called “scenting” (xunhua).',
            note: '家族口述：茶季入夜後，茉莉花農穿木屐騎腳踏車送花到店裡薰製花茶。',
            noteEn: 'Family oral history: in the tea season, after dark, jasmine growers in wooden clogs came by bicycle to deliver flowers to the shop for scenting jasmine tea.',
          },
        ],
        footnote: '品名整理自官網〈台灣的茶〉與報導，不是林華泰的價目表或完整貨單；茶類的一般介紹不出自林華泰。',
        footnoteEn: 'The names are compiled from the official website’s “Taiwan’s Tea” and press reports; this is not Lin Huatai’s price list or a complete stock list, and the general descriptions of each tea type do not come from Lin Huatai.',
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'tcmb-tea-trade', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and Historical Basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and historical basis',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/lin-hua-tai.md。',
        introEn: 'This shop’s introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project’s docs/research/lin-hua-tai.md.',
        sourceIds: [
          'linhuatai-site',
          'ltn-linhuatai-2014',
          'discover-taipei-tea-shops-2012',
          'ntcri-73-tea-road',
          'tshs-zhang-tamsui-port',
          'twcenter-muzha-tea-2001',
          'culture-taipei-walk-dadaocheng-2018',
          'tcmb-tea-trade',
          'ntcri-77-xinfangchun',
          'davidson-formosa-1903',
        ],
        disclaimer:
          '林華泰官網只能以 http 開啟，內容多為圖片；〈林華泰的歷史〉是第四代的家族回憶，本站標為「家族口述」。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。港口商街版的室內（前店、秤茶桌、焙茶區）格局查無，為歷史情境重建；焙坑與焙籠的形制依 Davidson（1903，日治初期記載，推定相近）。',
        disclaimerEn:
          'The Lin Huatai website can be opened only over http, and its content is mostly images; “The History of Lin Huatai” is the fourth generation’s family recollection, which this site marks as “family oral history”. The 3D street scene on this website is a conceptual reconstruction of the atmosphere of Dadaocheng’s commercial district in each period; building exteriors, signs, furnishings and shop locations are for imaginative context only and are not exact reconstructions. The layout of the interior in the Harbour Merchant Street version (front shop, tea-weighing table, roasting area) is not documented and is a reconstructed historical scene; the form of the roasting pits and baskets follows Davidson (1903, an early Japanese-period account, presumed to be similar).',
      },
    ],
  },
  {
    id: 'you-ji',
    name: '有記名茶',
    nameEn: 'Youji Tea',
    theme: 'tea',
    status: 'open',
    year: 1890,
    yearLabel: '1890年（廈門創立，1907年來臺）',
    yearLabelEn: '1890 (founded in Xiamen; came to Taiwan in 1907)',
    category: '茶行',
    categoryEn: 'Tea hong',
    seal: '茶行',
    sealEn: 'Tea hong',
    summary: '1890年王敬輝在廈門創立「王有記茶莊」，1907年第二代來到大稻埕設精製茶廠，包種茶外銷泰國；重慶北路的老茶廠至今仍以木炭焙茶。',
    summaryEn: 'In 1890 Wang Jinghui founded the Wang Youji Tea House (王有記茶莊) in Xiamen. In 1907 the second generation came to Dadaocheng and set up a tea refining factory, exporting Baozhong tea to Thailand. The old factory on Chongqing North Road still roasts tea over charcoal today.',
    note: '有記1907年來臺時的茶行在民生西路口附近、精製茶廠在建昌街11號（今貴德街），1949年才遷到重慶北路現址；街上的建築與各年代的招牌都是情境示意。',
    noteEn: 'When Youji came to Taiwan in 1907, its tea hong stood near the Minsheng West Road junction and its refining factory was at 11 Jianchang Street (today\'s Guide Street); it moved to its present site on Chongqing North Road only in 1949. The buildings on the street and the signboards of every era are scenario illustrations.',
    position: { x: 11.6, z: -4.5 },
    facing: 'south',
    // 互動位置稍微往路面退（戰後年代騎樓邊有道具）
    interaction: { radius: 3.2, distance: 3.1 },
    building: {
      archetype: 'baroque',
      width: 6,
      depth: 11,
      floors: 2,
      plasterTint: '#ebdcc0',
      trimTint: '#f6efe0',
      storefront: 'open',
      goods: 'tea',
      sign: { text: '王有記茶行', style: 'gold' },
      parapet: 'scroll',
    },
    buildingByEra: {
      banquet: { condition: 'new' },
      modern: { condition: 'mature', shopfront: 'display', shopType: 'tea' },
      postwar: { condition: 'aged', sign: { text: '王有記茶行', style: 'painted' } },
      revival: { condition: 'restored', sign: { text: '有記名茶', style: 'modern' } },
    },
    // 各年代介紹視窗上方的「此時期的有記名茶」（整理自官網沿革與國家文化記憶庫）
    eraNotes: {
      banquet:
        '1890年，王敬輝在廈門開設「王有記茶莊」；1907年第二代王孝謹渡海來臺，在民生西路口附近設茶行經營出口、在建昌街11號（今貴德街）設精製茶廠，看中的是淡水河的水運之便。王孝謹曾赴泰國曼谷拓銷臺茶。這個年代的建築是情境示意。',
      banquetEn:
        'In 1890 Wang Jinghui opened the Wang Youji Tea House (王有記茶莊) in Xiamen. In 1907 the second generation, Wang Xiaojin, crossed the sea to Taiwan. He set up a tea hong for exporting near the Minsheng West Road junction and a refining factory at 11 Jianchang Street (today\'s Guide Street), drawn by the convenience of shipping on the Tamsui River. Wang Xiaojin also travelled to Bangkok, Thailand, to promote Taiwan tea. The building in this era is a scenario illustration.',
      modern:
        '日治時期臺灣茶商派人駐曼谷，包種茶出口曼谷的量很大；有記有日治時期出口茶葉到泰國的紀錄，店裡至今保留早年外銷泰國的英文、泰文商標與木箱。',
      modernEn:
        'In the Japanese colonial period, Taiwanese tea merchants stationed agents in Bangkok, and large quantities of Baozhong tea were exported there. Youji has records of exporting tea to Thailand in this period, and the shop still keeps the English and Thai trademarks and wooden crates from its early exports to Thailand.',
      postwar:
        '因泰國外銷業務激增，1949年遷到重慶北路二段64巷26號現址，當時是臺北市登記的第五家工廠。1980年代後外銷逐漸萎縮，有記轉為自創品牌內銷：1975年在濟南路設第一家內銷門市，首創烏龍茶配漢餅的禮盒。',
      postwarEn:
        'As its export business to Thailand surged, Youji moved in 1949 to its present site at No. 26, Lane 64, Section 2, Chongqing North Road, then the fifth factory registered in Taipei City. After the 1980s exports gradually shrank, and Youji turned to domestic sales under its own brand: in 1975 it opened its first domestic retail shop on Jinan Road, where it pioneered a gift box pairing oolong tea with Chinese-style pastries.',
      revival:
        '2004年廠房前半部整理為門市、二樓的揀茶樓改為藝文空間「清源堂」；一樓後方的焙籠間仍以木炭焙茶，四十多個焙窟還在使用。2008年起清源堂每週六下午有南管演奏；第五代王聖鈞2012年接班，2020年底在隔壁開了 WANGTEA LAB。',
      revivalEn:
        'In 2004 the front half of the factory was converted into a retail shop, and the second-floor tea-sorting hall became the arts space Qingyuan Hall (清源堂). At the back of the ground floor the roasting room still roasts tea over charcoal, and more than forty roasting pits are still in use. Since 2008 Qingyuan Hall has hosted nanguan music performances on Saturday afternoons. The fifth generation, Wang Shengjun, took over in 2012 and at the end of 2020 opened WANGTEA LAB next door.',
    },
    camera: { distance: 6, height: 4.2, side: -4, lookHeight: 3.2 },
    chapters: [
      {
        id: 'baozhong-nanyang',
        type: 'text',
        tab: '包種茶與南洋',
        tabEn: 'Baozhong Tea and the South Seas',
        title: '包種茶與南洋市場',
        titleEn: 'Baozhong Tea and the South Seas Market',
        lead: '烏龍茶銷往美國，包種茶銷往華南與南洋：日治時期的大稻埕茶行，靠著包種茶和泰國、安南連在一起。',
        leadEn: 'Oolong went to the United States, while Baozhong went to South China and the South Seas: in the Japanese colonial period, Dadaocheng\'s tea hongs were tied to Thailand and Annam by Baozhong tea.',
        paragraphs: [
          '1873年洋行一度停止收購臺茶，部分茶商把烏龍茶運到福建薰花，改製成包種茶；1881年，泉州同安的茶商在大稻埕設源隆行，就地製作包種茶外銷，開啟了臺灣茶的南洋市場。1885年安溪人王水錦、魏靜時到南港研製，約1912年條形包種茶的製法成功，再傳到文山一帶。',
          '日治時期，臺灣對美國輸出烏龍茶，對華南與南洋輸出包種茶；日商抵斥洋行勢力，轉以日本、東南亞為主要市場。茶商派人駐曼谷，包種茶出口曼谷的量很大；大稻埕外銷南洋的主力茶，幾乎都是坪林的文山包種茶。',
          '1896年1月日本人的調查，大稻埕的茶商有252店、從業三千六百多人；大稻埕全盛時期有兩百多家茶行。1885到1893年間，由大稻埕輸出的茶葉占臺灣外銷金額六成以上，1886年達到74.9%。',
        ],
        paragraphsEn: [
          'In 1873 the foreign firms (hongs) briefly stopped buying Taiwan tea, and some tea merchants shipped oolong to Fujian to be scented with flowers and remade as Baozhong tea. In 1881 tea merchants from Tong\'an in Quanzhou set up the Yuanlong Hong in Dadaocheng to make Baozhong on the spot for export, opening the South Seas market for Taiwan tea. In 1885 Wang Shuijin and Wei Jingshi, both from Anxi, went to Nangang to develop the tea, and around 1912 the method for strip-shaped Baozhong succeeded and then spread to the Wenshan area.',
          'In the Japanese colonial period Taiwan exported oolong to the United States and Baozhong to South China and the South Seas. Japanese merchants, seeking to push back the influence of the foreign firms, turned mainly to Japan and Southeast Asia as markets. Tea merchants stationed agents in Bangkok, and large quantities of Baozhong were exported there; the main tea that Dadaocheng exported to the South Seas was almost entirely Wenshan Baozhong from Pinglin.',
          'A Japanese survey of January 1896 counted 252 tea merchants in Dadaocheng, employing more than 3,600 people; at its height Dadaocheng had over two hundred tea hongs. Between 1885 and 1893, tea exported from Dadaocheng accounted for more than 60% of Taiwan\'s export value, reaching 74.9% in 1886.',
        ],
        timeline: [
          { place: '1881', text: '同安茶商在大稻埕設源隆行，專製包種茶外銷。', placeEn: '1881', textEn: 'Tea merchants from Tong\'an set up the Yuanlong Hong in Dadaocheng, making Baozhong tea solely for export.' },
          { place: '1890', text: '王敬輝在廈門開設王有記茶莊。', placeEn: '1890', textEn: 'Wang Jinghui opened the Wang Youji Tea House in Xiamen.' },
          { place: '1907', text: '王孝謹來臺，在大稻埕設茶行與精製茶廠，包種茶外銷泰國。', placeEn: '1907', textEn: 'Wang Xiaojin came to Taiwan and set up a tea hong and refining factory in Dadaocheng, exporting Baozhong tea to Thailand.' },
          { place: '1949', text: '因泰國外銷業務激增，遷到重慶北路現址。', placeEn: '1949', textEn: 'With exports to Thailand surging, the business moved to its present site on Chongqing North Road.' },
          { place: '1980年代', text: '外銷萎縮，轉為內銷與自創品牌。', placeEn: '1980s', textEn: 'Exports shrank and the business turned to domestic sales and its own brand.' },
        ],
        glossary: [
          { term: '包種茶', definition: '輕發酵的條形烏龍茶。名稱來自早期用方形的紙包成「四兩包」出售的包裝方式。', termEn: 'Baozhong tea', definitionEn: 'A lightly fermented, strip-shaped oolong. The name comes from the early practice of selling it wrapped in square paper packets of four liang.' },
          { term: '南洋', definition: '東南亞的舊稱。文獻裡的「暹羅」是今天的泰國，「安南」是越南。', termEn: 'South Seas (Nanyang)', definitionEn: 'An old term for Southeast Asia. In the sources, "Siam" is present-day Thailand and "Annam" is Vietnam.' },
        ],
        sourceIds: ['tcmb-tea-trade', 'tcmb-baozhong-tea', 'chen-ciyu-li-family-2015', 'cna-tea-thailand-2025', 'curation-dadaocheng-tea', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '從廈門到大稻埕',
        tabEn: 'From Xiamen to Dadaocheng',
        title: '從廈門到大稻埕',
        titleEn: 'From Xiamen to Dadaocheng',
        lead: '來自福建安溪產茶世家的王家，1890年在廈門開店，1907年第二代跨海來到大稻埕，到現在是第五代。',
        leadEn: 'The Wang family, a tea-producing family from Anxi in Fujian, opened a shop in Xiamen in 1890; in 1907 the second generation crossed the sea to Dadaocheng, and today the fifth generation runs it.',
        paragraphs: [
          '有記名茶來自福建安溪的產茶世家。1890年，第十四世的王敬輝在廈門開設「王有記茶莊」。1907年，因為臺灣茶葉出口興盛，第二代王孝謹渡海來臺，在大稻埕的民生西路口附近設茶行經營出口，並在建昌街11號（今貴德街）設立精製茶廠；選在大稻埕，是看中淡水河的水運之便。王孝謹也曾到泰國曼谷拓銷臺茶。',
          '第三代王澄清十七歲就來臺，負責精製廠與外銷。因為泰國的外銷業務激增，原來的廠房不敷使用，1949年遷到重慶北路二段64巷26號現址，當時是臺北市登記的第五家工廠。門前的朝陽茶葉公園，過去是茶葉仲介聚集的交易中心。',
          '1980年代以後外銷逐漸萎縮，有記轉為內銷與自創品牌：1975年在濟南路設立第一家內銷門市，首創烏龍茶配漢餅的禮盒。第四代王連源在2004年把廠房前半部整理為門市、二樓改為藝文空間，把老工廠變成小型的茶博物館；第五代王聖鈞2012年接班，2020年底在隔壁的老屋開了 WANGTEA LAB。中央社的報導寫，曼谷老城區至今還有王家第四代經營的「三罐標有記茶行」。',
        ],
        paragraphsEn: [
          'Youji Tea comes from a tea-producing family of Anxi, Fujian. In 1890 Wang Jinghui, of the fourteenth generation, opened the Wang Youji Tea House (王有記茶莊) in Xiamen. In 1907, with Taiwan\'s tea exports booming, the second generation, Wang Xiaojin, crossed the sea to Taiwan. He set up an export tea hong near the Minsheng West Road junction in Dadaocheng and a refining factory at 11 Jianchang Street (today\'s Guide Street); he chose Dadaocheng for the convenience of shipping on the Tamsui River. Wang Xiaojin also travelled to Bangkok, Thailand, to promote Taiwan tea.',
          'The third generation, Wang Chengqing, came to Taiwan at seventeen and took charge of the refining factory and exports. As exports to Thailand surged, the old factory became too small, and in 1949 the business moved to its present site at No. 26, Lane 64, Section 2, Chongqing North Road, then the fifth factory registered in Taipei City. The Chaoyang Tea Park in front of the building was once a trading centre where tea brokers gathered.',
          'From the 1980s exports gradually shrank, and Youji turned to domestic sales and its own brand: in 1975 it opened its first domestic retail shop on Jinan Road, where it pioneered a gift box pairing oolong tea with Chinese-style pastries. In 2004 the fourth generation, Wang Lianyuan, converted the front half of the factory into a shop and the second floor into an arts space, turning the old factory into a small tea museum. The fifth generation, Wang Shengjun, took over in 2012 and at the end of 2020 opened WANGTEA LAB in the old house next door. Central News Agency reporting notes that in Bangkok\'s old town there is still a "Three Cans Youji Tea Shop" run by the family\'s fourth generation.',
        ],
        seals: ['有記'],
        facts: [
          { label: '創立', value: '1890年，廈門「王有記茶莊」', labelEn: 'Founded', valueEn: '1890, Wang Youji Tea House, Xiamen' },
          { label: '來臺', value: '1907年，第二代王孝謹', labelEn: 'Came to Taiwan', valueEn: '1907, second generation Wang Xiaojin' },
          { label: '現址', value: '1949年起，重慶北路二段64巷26號', labelEn: 'Present site', valueEn: 'Since 1949: No. 26, Lane 64, Section 2, Chongqing North Road' },
          { label: '傳承', value: '王敬輝、王孝謹、王澄清、王連源、王聖鈞，五代', labelEn: 'Succession', valueEn: 'Wang Jinghui, Wang Xiaojin, Wang Chengqing, Wang Lianyuan, Wang Shengjun: five generations' },
          { label: '外銷', value: '早年以泰國為主，另有日本、歐美', labelEn: 'Exports', valueEn: 'Mainly Thailand in the early years, also Japan, Europe and the United States' },
        ],
        sourceIds: ['wangtea-story', 'wangtea-transformation', 'tcmb-wangtea', 'cna-tea-thailand-2025', 'tcmb-chaoyang-tea-park'],
      },
      {
        id: 'workshop',
        type: 'text',
        tab: '焙籠間與清源堂',
        tabEn: 'Roasting Room and Qingyuan Hall',
        title: '焙籠間與清源堂',
        titleEn: 'Roasting Room and Qingyuan Hall',
        lead: '一樓後方的焙籠間仍以木炭焙茶，四十多個焙窟還在使用；二樓的揀茶樓現在是南管的演奏場所。',
        leadEn: 'The roasting room at the back of the ground floor still roasts tea over charcoal, with more than forty roasting pits in use; the second-floor tea-sorting hall is now a venue for nanguan music.',
        paragraphs: [
          '有記的焙籠間建於日治時期，是大稻埕現存仍在使用的炭焙工場。紅磚砌成的焙窟成排排列，深五十八公分；窟裡放木炭、鋪上炭化的稻殼點火燒成白灰當熱源，上面架著竹編的焙籠，茶葉日夜不休地烘焙二十天（《臺灣工藝》；今周刊寫兩到三週）。王家稱自家的工法為「清源焙茶法」。',
          '精製茶要經過分級、揀梗、焙火、拼配、風選幾道工序；有記把「烘焙、沖泡、拼配」視為三大關鍵。店裡還保留舊的風選機，以及早年外銷泰國時印在竹編茶箱上的英文、泰文商標。',
          '二樓原本是「揀茶樓」：第四代回憶小時候每天有四十多名女工在二樓揀茶。2004年改為藝文空間「清源堂」，2008年起每週六下午有南管演奏，是臺北少數南管樂團的演奏場所之一。',
        ],
        paragraphsEn: [
          'Youji\'s roasting room dates from the Japanese colonial period and is a charcoal-roasting workshop still in use in Dadaocheng. Red-brick roasting pits stand in rows, each fifty-eight centimetres deep; charcoal is laid in the pit and covered with carbonised rice husks, lit and burned down to white ash as the heat source, and bamboo roasting baskets are set above. The tea is roasted day and night for twenty days (Taiwan Crafts; Business Today says two to three weeks). The Wang family calls its own method the "Qingyuan roasting method".',
          'Refined tea passes through grading, stalk picking, roasting, blending and winnowing; Youji regards "roasting, brewing and blending" as the three keys. The shop also keeps an old winnowing machine and the English and Thai trademarks that were printed on bamboo tea crates for the early exports to Thailand.',
          'The second floor was originally the "tea-sorting hall": the fourth generation recalls forty-odd women workers sorting tea there every day when he was a child. In 2004 it became the arts space Qingyuan Hall, and since 2008 nanguan music has been performed there on Saturday afternoons, making it one of the few nanguan performance venues in Taipei.',
        ],
        lists: [
          {
            title: '精製茶的工序',
            titleEn: 'Steps in refining tea',
            kind: 'plain',
            items: ['分級：依茶葉的外形與等級分開。', '揀梗：挑掉茶梗與雜物。', '焙火：炭焙去除水分、形成焙香。', '拼配：把不同批的茶拼配成穩定的風味。', '風選：用風力吹去碎末與輕片。'],
            itemsEn: ['Grading: separating the leaves by shape and grade.', 'Stalk picking: removing stalks and impurities.', 'Roasting: charcoal roasting removes moisture and builds the roasted aroma.', 'Blending: combining different batches into a stable flavour.', 'Winnowing: using air to blow away fragments and light flakes.'],
          },
        ],
        sourceIds: ['wangtea-store', 'wangtea-story', 'ntcri-80-wangtea-lab', 'businesstoday-wangtea-2018', 'wangtea-transformation', 'discover-taipei-tea-shops-2012'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表茶品',
        tabEn: 'Signature Teas',
        title: '代表茶品｜炭焙的茶',
        titleEn: 'Signature Teas | Charcoal-Roasted Tea',
        intro: '有記自稱「專業的烏龍茶與包種茶商」。門市現售文山包種茶、高山烏龍茶、奇種烏龍茶、鐵觀音、東方美人、綠茶與紅茶；以下圖鑑介紹其中幾種與炭焙的工法。',
        introEn: 'Youji calls itself a "specialist in oolong and Baozhong tea". Its shop currently sells Wenshan Baozhong, high-mountain oolong, Qizhong oolong, Tieguanyin, Oriental Beauty, green tea and black tea; the guide below presents a few of these and the charcoal-roasting method.',
        items: [
          {
            id: 'oolong-tea',
            name: '奇種烏龍',
            nameEn: 'Qizhong Oolong',
            category: '炭焙｜招牌',
            categoryEn: 'Charcoal-roasted | Signature',
            description: '有記的招牌茶之一。臺北市政府觀光傳播局的刊物寫它以文山包種茶為底，用低溫長時間的炭焙而成。',
            descriptionEn: 'One of Youji\'s signature teas. A publication of the Taipei City Government\'s Department of Information and Tourism describes it as made from Wenshan Baozhong tea, charcoal-roasted slowly at a low temperature.',
          },
          {
            id: 'baozhong-tea',
            name: '文山包種茶',
            nameEn: 'Wenshan Baozhong',
            category: '輕發酵｜條形',
            categoryEn: 'Lightly fermented | Strip-shaped',
            description: '條形的輕發酵茶，是大稻埕外銷南洋的主力；有記早年外銷泰國的，就是包種茶。',
            descriptionEn: 'A strip-shaped, lightly fermented tea and the mainstay of Dadaocheng\'s exports to the South Seas; the tea Youji exported to Thailand in the early years was Baozhong.',
          },
          {
            id: 'tieguanyin',
            name: '鐵觀音',
            nameEn: 'Tieguanyin',
            category: '重發酵｜焙火',
            categoryEn: 'Heavily fermented | Roasted',
            description: '原產福建安溪，和王家的故鄉同一個地方；焙火較重、滋味醇厚。鏡週刊的報導把鐵觀音、奇種烏龍與文山包種列為有記的招牌。',
            descriptionEn: 'Originally from Anxi in Fujian, the same place as the Wang family\'s home; it is roasted more heavily and has a mellow, full flavour. A Mirror Media report lists Tieguanyin, Qizhong oolong and Wenshan Baozhong as Youji\'s signature teas.',
          },
          {
            id: 'roasting-basket',
            name: '焙籠',
            nameEn: 'Roasting basket',
            category: '工法｜炭焙',
            categoryEn: 'Method | Charcoal roasting',
            description: '竹編的焙籠架在紅磚砌的焙窟上，窟裡的木炭與炭化稻殼燒成白灰，低溫把茶葉烘乾、烘出焙香。',
            descriptionEn: 'A bamboo roasting basket is set over a red-brick roasting pit; the charcoal and carbonised rice husks in the pit burn down to white ash, and its low heat dries the tea and brings out the roasted aroma.',
            note: '《臺灣工藝》記載焙窟深五十八公分，茶葉日夜不休烘焙二十天；焙籠間昔日還曾替對街的洗衣店烘衣服，衣服因而茶香四溢。',
            noteEn: 'Taiwan Crafts records that the roasting pits are fifty-eight centimetres deep and that tea is roasted day and night for twenty days; the roasting room even used to dry clothes for the laundry across the street, and the clothes came out smelling of tea.',
          },
        ],
        footnote: '品名整理自官網門市頁與報導，不是價目表；茶類的一般介紹不出自有記。',
        footnoteEn: 'Product names are compiled from the official website\'s shop page and press reports; this is not a price list, and the general descriptions of tea types do not come from Youji.',
        sourceIds: ['wangtea-store', 'wangtea-transformation', 'discover-taipei-tea-shops-2012', 'ntcri-80-wangtea-lab', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and Historical Basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and Historical Basis',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/you-ji.md。',
        introEn: 'This shop introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project\'s docs/research/you-ji.md.',
        sourceIds: [
          'wangtea-story',
          'wangtea-transformation',
          'wangtea-store',
          'tcmb-wangtea',
          'ntcri-80-wangtea-lab',
          'businesstoday-wangtea-2018',
          'cna-tea-thailand-2025',
          'discover-taipei-tea-shops-2012',
          'tcmb-tea-trade',
          'tcmb-baozhong-tea',
          'chen-ciyu-li-family-2015',
          'curation-dadaocheng-tea',
          'tcmb-chaoyang-tea-park',
          'ntcri-77-xinfangchun',
        ],
        disclaimer:
          '媒體曾稱有記的老茶廠為市定古蹟，但官方的文化資產登錄查無紀錄，本站不寫成古蹟。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。',
        disclaimerEn:
          'Media have called Youji\'s old tea factory a municipal historic site, but the official cultural heritage register has no such record, so this site does not describe it as a historic monument. The 3D streetscape on this website is a conceptual reconstruction of the commercial street\'s atmosphere in each period; building facades, signboards, furnishings and shop positions are for imaginative context only and are not precise restorations.',
      },
    ],
  },
  // 李亭香（第 7 階段 B）：只在「老屋新生」開放探索；日治、戰後的店址查無（最具體的說法是早年在蘆洲），
  // 所以那三個年代不列名錄，同一地段的店屋保留為一般「餅舖」（情境示意），地段與建築不變。
  // 章節在 liTingXiangData.js；查證紀錄 docs/research/li-ting-xiang.md。
  {
    id: LI_TING_XIANG_ID,
    name: '李亭香',
    nameEn: 'Li Tingxiang',
    status: 'open',
    year: 1895,
    yearLabel: '店家自述1895年創立（待核）',
    yearLabelEn: 'Founded in 1895 by the shop\'s own account (to be verified)',
    yearNote: LTX_YEAR_NOTE,
    yearNoteEn: LTX_YEAR_NOTE_EN,
    sourceIds: LI_TING_XIANG_SOURCE_IDS,
    category: '糕餅店',
    categoryEn: 'Cake and pastry shop',
    seal: '糕餅',
    sealEn: 'Pastries',
    summary: '迪化街上的糕餅店：店家自述1895年創立（待核），招牌是平西餅；現任經營者從面板工程師返家接班。只在老屋新生開放探索。',
    summaryEn: 'A cake and pastry shop on Dihua Street: it says it was founded in 1895 (to be verified), and its signature product is the Pingxi cake (平西餅); the current owner came home from a career as a display-panel engineer to take over. Open to explore only in Old Houses, New Life.',
    position: { x: 16.7, z: 4.5 },
    facing: 'north',
    interaction: { radius: 3.2 },
    camera: { distance: 6.4, height: 2.4, side: 2.2, lookHeight: 2.6 },
    chapters: LTX_CHAPTERS,
    eraNotes: LTX_ERA_NOTES,
    building: {
      archetype: 'minnan',
      width: 5.4,
      depth: 11,
      floors: 2,
      groundHeight: 3.3,
      ground: 'plaster',
      upper: 'plaster',
      plasterTint: '#f0e2c8',
      woodTint: '#c7a986',
      gable: 'gable',
      ridge: 'curved',
      storefront: 'open',
      goods: 'pastry',
      sign: { text: '李亭香', style: 'red' },
    },
    // 日治、戰後的招牌只寫一般行業字「餅舖」（與背景街屋相同），不寫店名
    buildingByEra: {
      banquet: { condition: 'new', sign: { text: '餅舖', style: 'gold' } },
      modern: { condition: 'mature', sign: { text: '餅舖', style: 'red' } },
      postwar: { condition: 'aged', sign: { text: '餅舖', style: 'painted' } },
      revival: { condition: 'restored', sign: { text: '李亭香', style: 'modern' } },
    },
  },
  {
    id: 'jiang-shan-lou',
    name: '江山樓',
    nameEn: 'Jiangshanlou',
    status: 'open',
    year: 1921,
    // 創立年份記載不一：莊永明記1921年11月20日開業（政大碩士論文題名年段1921–1940亦同），
    // 國立臺灣歷史博物館典藏說明與維基百科記為1917年
    yearLabel: '1921年開業（一說1917年）',
    yearLabelEn: 'Opened 1921 (some sources say 1917)',
    yearNote: '開業年份記載不一：莊永明〈大稻埕名酒樓之三：江山樓〉記1921年11月17日起辦披露宴三天、20日正式營業，簡伃君的碩士論文題名年段（1921–1940）亦同；國立臺灣歷史博物館典藏說明與維基百科則記為1917年（大正6年）。',
    yearNoteEn: 'Sources differ on the opening year: Zhuang Yongming\'s "Famous Banquet Houses of Dadaocheng, No. 3: Jiangshanlou" records three days of opening banquets from 17 November 1921 and formal business from the 20th, and the period in the title of Jian Yujun\'s master\'s thesis (1921-1940) agrees; the National Museum of Taiwan History\'s collection description and Wikipedia give 1917 (Taisho 6).',
    sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
    category: '酒樓',
    categoryEn: 'Banquet house',
    seal: '酒樓',
    sealEn: 'Banquet house',
    reconstruction: true,
    summary: '吳江山創立的臺灣料理酒樓，紅磚四層樓、十四間宴會廳；1923年與東薈芳承辦皇太子的臺灣料理午宴，是日治時期紳商社交的場所，1970年代拆除。',
    summaryEn: 'A banquet house for Taiwanese cuisine founded by Wu Jiangshan (吳江山): a four-storey red-brick building with fourteen banquet halls. In 1923, together with Dong Hui Fang (東薈芳), it catered the Taiwanese-cuisine luncheon for the Crown Prince. It was a social venue for gentry and merchants in the Japanese colonial period and was demolished in the 1970s.',
    note: '江山樓建築今已不存（1970年代拆除，維基百科記1976年）。原址在日新町二丁目、近歸綏街與甘州街，不在迪化街；場景依「紅磚四層連棟街屋」的記載，在這條街上作歷史情境重建，並非精確復原。',
    noteEn: 'The Jiangshanlou building no longer exists (demolished in the 1970s; Wikipedia says 1976). Its original site was in Nisshin-chō 2-chome (日新町二丁目), near Guisui Street and Ganzhou Street, not on Dihua Street; the scene is a reconstructed historical scene on this street based on the record of a "four-storey row of red-brick shophouses", not a precise restoration.',
    position: { x: -13.5, z: 4.5 },
    facing: 'north',
    interaction: { radius: 4.2 },
    building: {
      archetype: 'grand-restaurant',
      width: 11,
      depth: 12,
      floors: 4,
      sign: { text: '江山樓', style: 'gold' },
    },
    buildingByEra: {
      banquet: { condition: 'new' },
    },
    // 介紹視窗上方的「此時期的江山樓」（整理自莊永明、簡伃君論文摘要）
    eraNotes: {
      banquet:
        '1921年開業的紅磚四層樓酒樓（一說1917年）：宴會廳十四間、約容五百人，有廚房、浴室、理髮室，樓頂還有庭園假山（莊永明）。開幕時聘福州、上海、廣東的名廚；1920年代以後被研究者視為代表臺灣最高烹飪水準的餐廳，也是紳商聚會、詩人題詠的場所。',
      banquetEn:
        'A red-brick, four-storey banquet house that opened in 1921 (some sources say 1917): fourteen banquet halls holding about five hundred people, with a kitchen, bathrooms and a barber\'s room, and a roof garden with an artificial hill (Zhuang Yongming). At its opening it hired chefs from Fuzhou, Shanghai and Guangdong; from the 1920s researchers regard it as the restaurant that represented the highest standard of Taiwanese cooking, and it was a gathering place for gentry and merchants and a subject for poets.',
    },
    // 四層樓比茶行高：街道只有約 5.6 m 寬，鏡頭退到路緣、往側邊拉開，再抬高注視點
    camera: { distance: 6.8, height: 5.4, side: 8, lookHeight: 4.8 },
    chapters: [
      {
        id: 'background',
        type: 'text',
        tab: '酒樓的年代',
        tabEn: 'The Banquet House Era',
        title: '大稻埕的酒樓年代',
        titleEn: 'Dadaocheng\'s Banquet House Era',
        lead: '日治時期的大稻埕，茶商與仕紳的宴席集中在幾家大酒樓；江山樓與東薈芳、春風得意樓、蓬萊閣常被並稱，本站只做資料最充分的江山樓。',
        leadEn: 'In Dadaocheng in the Japanese colonial period, the banquets of tea merchants and gentry centred on a few great banquet houses; Jiangshanlou is often named together with Dong Hui Fang, Chunfeng Deyi Lou and Penglai Pavilion, and this site covers only Jiangshanlou, for which the documentation is fullest.',
        paragraphs: [
          '大稻埕因茶葉外銷而富裕，宴客與社交的需求養出了酒樓。東薈芳是其中最早的一家，1884年開設，1911年梁啟超應林獻堂之邀來臺時曾在這裡聚餐；春風得意樓1914年設立，蔣渭水1920年入股、後來接手，1922年歇業；蓬萊閣則是1927年在東薈芳原址另起的新名號。四家常被報導並稱為大稻埕的「四大旗亭」。',
          '以上三家的創辦人、確切年份、門牌與菜色，各家媒體與維基百科的說法互相矛盾，官方與學術的佐證本站沒有查到，所以暫不做成可探索的店家，只在這裡交代背景。常見的「蓬萊閣由陳天來創辦」、「春風得意樓由蔣渭水創辦」兩種說法，本站讀到的來源都不支持：前者只寫陳天來「接手」，後者寫蔣渭水1920年才入股。',
          '江山樓是四家裡留下最多記載的一家：有莊永明整理日治報刊寫成的專文，有政治大學以它為題的碩士論文，1923年的皇太子午宴也有研究者整理過菜單。這座四層紅磚樓在1970年代拆除，原址不在迪化街，而在日新町二丁目、今歸綏街與甘州街一帶；本站把它搬到這條街上，是情境重建。',
        ],
        paragraphsEn: [
          'Dadaocheng grew rich on tea exports, and the demand for entertaining and socialising nurtured its banquet houses. Dong Hui Fang was the earliest of them, opened in 1884; when Liang Qichao visited Taiwan at Lin Xiantang\'s invitation in 1911, he dined there. Chunfeng Deyi Lou was established in 1914; Jiang Weishui bought into it in 1920 and later took it over, and it closed in 1922. Penglai Pavilion was a new name taken in 1927 on the former site of Dong Hui Fang. The four are often reported together as Dadaocheng\'s "four great qiting (banquet pavilions)".',
          'For the other three, accounts of the founders, exact dates, addresses and dishes contradict one another across media and Wikipedia, and this site has found no official or scholarly corroboration, so for now it has not made them explorable shops and gives only background here. Of the common claims that "Penglai Pavilion was founded by Chen Tianlai" and "Chunfeng Deyi Lou was founded by Jiang Weishui", none of the sources this site has read supports either: the former says only that Chen Tianlai "took it over", and the latter says Jiang Weishui bought in only in 1920.',
          'Jiangshanlou is the one of the four with the most surviving records: there is a feature by Zhuang Yongming drawn from Japanese-period newspapers, a master\'s thesis on it from National Chengchi University, and researchers have also compiled the menu of the 1923 Crown Prince\'s luncheon. The four-storey red-brick building was demolished in the 1970s; its original site was not on Dihua Street but in Nisshin-chō 2-chome, around today\'s Guisui Street and Ganzhou Street. This site moves it onto this street as a reconstructed historical scene.',
        ],
        facts: [
          { label: '東薈芳', value: '1884年開設；1925或1926年歇業（來源不一）', labelEn: 'Dong Hui Fang', valueEn: 'Opened 1884; closed 1925 or 1926 (sources differ)' },
          { label: '春風得意樓', value: '1914年設立；蔣渭水1920年入股、1922年買下全部，同年歇業', labelEn: 'Chunfeng Deyi Lou', valueEn: 'Established 1914; Jiang Weishui bought in in 1920 and bought it outright in 1922, the year it closed' },
          { label: '蓬萊閣', value: '1927年於東薈芳原址另起；陳天來接手的時間來源不一', labelEn: 'Penglai Pavilion', valueEn: 'Started in 1927 on the former site of Dong Hui Fang; sources differ on when Chen Tianlai took it over' },
          { label: '江山樓', value: '1921年開業（一說1917年）；1970年代拆除', labelEn: 'Jiangshanlou', valueEn: 'Opened 1921 (some sources say 1917); demolished in the 1970s' },
        ],
        sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '吳江山',
        tabEn: 'Wu Jiangshan',
        title: '吳江山與他的四層紅磚樓',
        titleEn: 'Wu Jiangshan and His Four-Storey Red-Brick Building',
        lead: '吳江山原是東薈芳的合夥人，退出後到廈門、福州、上海看酒樓，回臺蓋起以自己名字命名的江山樓（莊永明）。',
        leadEn: 'Wu Jiangshan was originally a partner in Dong Hui Fang; after leaving it he went to see banquet houses in Xiamen, Fuzhou and Shanghai, then returned to Taiwan to build Jiangshanlou, named after himself (Zhuang Yongming).',
        paragraphs: [
          '莊永明的專文寫到，吳江山退出東薈芳後，赴廈門、福州、上海考察酒樓，回來後在日新街東市二丁目（1922年改稱日新町二丁目，近今歸綏街、甘州街）蓋起紅磚造的四層連棟街屋，耗資十數萬元。樓內有宴會廳十四間，約可容納五百人，另有廚房、浴室、理髮室，樓頂還闢了庭園假山。1921年11月17日起辦披露宴三天，20日正式營業。開幕時聘請福州、上海、廣東的名廚掌勺。',
          '開業年份有兩種說法。莊永明與政治大學簡伃君的碩士論文（題名年段1921到1940年）都以1921年為準；國立臺灣歷史博物館的老照片藏品說明與維基百科則記為1917年。本站以1921年為主，並列1917年一說。門牌號碼沒有查到。',
          '吳江山1928年出任北區料理屋飲食店組合副組合長，後來升任組合長，1935年病逝，享年六十歲（莊永明，單一來源）。江山樓本身一直營業到戰後；維基百科寫1946年歇業、1976年拆除，莊永明只寫「1970年代拆除」，本站寫1970年代。',
        ],
        paragraphsEn: [
          'Zhuang Yongming\'s feature records that after leaving Dong Hui Fang, Wu Jiangshan travelled to Xiamen, Fuzhou and Shanghai to study banquet houses. On his return he built a four-storey row of red-brick shophouses in Dongshi 2-chome, Rixin Street (renamed Nisshin-chō 2-chome in 1922, near today\'s Guisui Street and Ganzhou Street), at a cost of over a hundred thousand yuan. The building held fourteen banquet halls with room for about five hundred people, as well as a kitchen, bathrooms and a barber\'s room, and a roof garden with an artificial hill. Opening banquets ran for three days from 17 November 1921, and formal business began on the 20th. At the opening it hired chefs from Fuzhou, Shanghai and Guangdong to run the kitchen.',
          'There are two accounts of the opening year. Zhuang Yongming and Jian Yujun\'s master\'s thesis at National Chengchi University (the period in its title is 1921 to 1940) both take 1921; the photo collection description of the National Museum of Taiwan History and Wikipedia give 1917. This site takes 1921 as the main date and lists the 1917 account alongside it. No street number has been found.',
          'In 1928 Wu Jiangshan became deputy chairman of the Northern District Restaurant and Eatery Association, later rising to chairman, and died of illness in 1935 at the age of sixty (Zhuang Yongming, single source). Jiangshanlou itself stayed in business until after the war; Wikipedia says it closed in 1946 and was demolished in 1976, while Zhuang Yongming says only "demolished in the 1970s", and this site says the 1970s.',
        ],
        facts: [
          { label: '創辦人', value: '吳江山，原東薈芳合夥人', labelEn: 'Founder', valueEn: 'Wu Jiangshan, formerly a partner in Dong Hui Fang' },
          { label: '開業', value: '1921年11月20日（一說1917年）', labelEn: 'Opened', valueEn: '20 November 1921 (some sources say 1917)' },
          { label: '建築', value: '紅磚四層連棟街屋；宴會廳14間，約容500人', labelEn: 'Building', valueEn: 'Four-storey red-brick row of shophouses; 14 banquet halls holding about 500 people' },
          { label: '位置', value: '日新町二丁目，近今歸綏街、甘州街；門牌未查到', labelEn: 'Location', valueEn: 'Nisshin-chō 2-chome, near today\'s Guisui Street and Ganzhou Street; street number not found' },
          { label: '拆除', value: '1970年代（維基百科記1976年）', labelEn: 'Demolished', valueEn: '1970s (Wikipedia says 1976)' },
        ],
        sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'banquet',
        type: 'text',
        tab: '宴席與藝旦',
        tabEn: 'Banquets and Yidan',
        title: '臺灣料理的宴席、皇太子的午宴與藝旦',
        titleEn: 'Taiwanese Banquets, the Crown Prince\'s Luncheon and the Yidan',
        lead: '1923年4月24日，總督府在官邸以臺灣料理款待來臺行啟的皇太子裕仁，承辦的是江山樓與東薈芳；菜單十二道大菜，研究者整理過。',
        leadEn: 'On 24 April 1923 the Governor-General\'s Office entertained Crown Prince Hirohito, on his visit to Taiwan, with Taiwanese cuisine at its official residence; the caterers were Jiangshanlou and Dong Hui Fang. The menu of twelve main dishes has been compiled by researchers.',
        paragraphs: [
          '皇太子的午宴｜陳玉箴的文章寫到，1923年4月24日中午，總督官邸（今臺北賓館）的大食堂辦了一場「臺灣料理」午宴，總督府選定江山樓與東薈芳承辦，事前還派人到日本試菜。菜單共十二道大菜，用上燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參（中央社引曾品滄；陳玉箴）；莊永明另列出雪白官燕、金錢火雞、水晶鴿蛋等菜名，陳玉箴提到第七道是炸春餅。收尾的點心兩說並列：莊永明寫杏仁茶，陳玉箴寫八寶飯與杏仁茶。陳玉箴稱吳江山為這場「御宴」的主廚，莊永明則寫由江山樓與東薈芳共同負責。這些都是二手整理，本站沒有讀到《臺灣日日新報》原報。',
          '臺灣料理｜簡伃君的論文摘要稱江山樓是推廣臺灣菜的重要餐廳，1920年代以後代表臺灣最高的烹飪水準。1927年底，吳江山在報紙上連載了二十三篇〈臺灣料理之話〉（莊永明）；江山樓後來印出一份列有192道菜的菜單（中央社引曾品滄）。莊永明寫到，皇太子午宴之後到1927年，類似的官方餐宴江山樓又辦了五場，獲總督府頒發獎狀。至於日常宴席的出菜順序、桌數與價目，本站沒有查到可靠記載。',
          '藝旦｜民間流傳「登江山樓，吃臺灣菜，聽藝旦唱曲」的說法（維基百科；本站只作「相傳」）。莊永明寫到，江山樓附近歸綏街的巷弄因藝旦聚集而發展，今天只剩文萌樓一棟。1958年吳瀛濤曾寫過〈江山樓．臺灣菜．藝妲〉一文，本站只讀到題名。藝旦在席間是否固定演出、江山樓與藝旦間的實際關係，仍待學術全文查證，本站不多寫。',
          '聚會與題詠｜莊永明記載，杜聰明與蔡伯毅的祝賀會、國語學校臺籍同窗會十週年都在江山樓舉行；連雅堂寫過〈江山樓題壁〉，廖錫恩有〈題江山樓〉，鄭述公也有詩。簡伃君的論文以「紳商社交生活」為題，正是看中它作為聚會場所的角色。',
        ],
        paragraphsEn: [
          'The Crown Prince\'s luncheon | Chen Yuzhen\'s article records that at noon on 24 April 1923 a "Taiwanese cuisine" luncheon was held in the large dining hall of the Governor-General\'s residence (today\'s Taipei Guest House). The Governor-General\'s Office chose Jiangshanlou and Dong Hui Fang as caterers and even sent people to Japan beforehand to test the dishes. The menu had twelve main dishes, using bird\'s nest, pigeon eggs, turkey, shark\'s fin, crab, white fungus, soft-shelled turtle and sea cucumber (Central News Agency, citing Zeng Pincang; Chen Yuzhen); Zhuang Yongming additionally lists dish names such as snow-white imperial bird\'s nest, golden-coin turkey and crystal pigeon eggs, and Chen Yuzhen mentions that the seventh course was fried spring rolls. For the closing dessert two accounts are given side by side: Zhuang Yongming says almond tea, while Chen Yuzhen says eight-treasure rice and almond tea. Chen Yuzhen calls Wu Jiangshan the head chef of this "imperial banquet", while Zhuang Yongming says Jiangshanlou and Dong Hui Fang were jointly responsible. All of this is secondary compilation; this site has not read the original reports in the Taiwan Daily News.',
          'Taiwanese cuisine | The abstract of Jian Yujun\'s thesis calls Jiangshanlou an important restaurant for promoting Taiwanese cuisine, representing the highest standard of Taiwanese cooking from the 1920s onward. At the end of 1927 Wu Jiangshan serialised twenty-three articles in a newspaper under the title "Talks on Taiwanese Cuisine" (Zhuang Yongming); Jiangshanlou later printed a menu listing 192 dishes (Central News Agency, citing Zeng Pincang). Zhuang Yongming records that between the Crown Prince\'s luncheon and 1927, Jiangshanlou hosted five more official banquets of the kind and received commendation certificates from the Governor-General\'s Office. As for the order of courses, the number of tables and the prices at everyday banquets, this site has found no reliable record.',
          'Yidan (female entertainers) | A saying circulates that you could "climb Jiangshanlou, eat Taiwanese food and hear a yidan sing" (Wikipedia; this site treats it only as "said to be"). Zhuang Yongming writes that the alleys of nearby Guisui Street developed because yidan gathered there, and only one building, Wenmeng Lou, survives today. In 1958 Wu Yingtao wrote an essay titled "Jiangshanlou, Taiwanese Cuisine, Yidan"; this site has read only its title. Whether yidan regularly performed at the table, and the actual relationship between Jiangshanlou and the yidan, still await verification from full scholarly texts, so this site says no more.',
          'Gatherings and poems | Zhuang Yongming records that the congratulatory party for Du Congming and Cai Boyi, and the tenth-anniversary reunion of Taiwanese alumni of the National Language School, were both held at Jiangshanlou; Lian Yatang wrote "Inscription on the Wall of Jiangshanlou", Liao Xi\'en has "On Jiangshanlou", and Zheng Shugong also wrote a poem. Jian Yujun\'s thesis takes "the social life of gentry and merchants" as its theme precisely because of the venue\'s role as a gathering place.',
        ],
        facts: [
          { label: '皇太子午宴', value: '1923年4月24日中午，總督官邸；江山樓與東薈芳承辦', labelEn: 'Crown Prince\'s luncheon', valueEn: 'Noon, 24 April 1923, at the Governor-General\'s residence; catered by Jiangshanlou and Dong Hui Fang' },
          { label: '菜單', value: '十二道大菜：燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參', labelEn: 'Menu', valueEn: 'Twelve main dishes: bird\'s nest, pigeon eggs, turkey, shark\'s fin, crab, white fungus, soft-shelled turtle, sea cucumber' },
          { label: '收尾', value: '杏仁茶（陳玉箴另記八寶飯）', labelEn: 'Closing dessert', valueEn: 'Almond tea (Chen Yuzhen also records eight-treasure rice)' },
          { label: '〈臺灣料理之話〉', value: '1927年底，吳江山連載23篇', labelEn: '"Talks on Taiwanese Cuisine"', valueEn: 'Late 1927, serialised by Wu Jiangshan in 23 articles' },
          { label: '菜單', value: '後印有192道菜（曾品滄）', labelEn: 'Menu', valueEn: 'Later printed with 192 dishes (Zeng Pincang)' },
        ],
        sourceIds: ['foodnext-chen-yuchen-2020', 'cna-taiwanese-cuisine-2020', 'jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '宴席菜',
        tabEn: 'Banquet Dishes',
        title: '代表食物｜皇太子午宴的大菜',
        titleEn: 'Signature Dishes | Main Dishes of the Crown Prince\'s Luncheon',
        intro: '依1923年皇太子午宴的記載選出四道：三道大菜加收尾的杏仁茶。菜名出自莊永明與陳玉箴的整理，作法與盛裝方式是本站依菜名與食材推想的示意。',
        introEn: 'Four dishes chosen from the 1923 Crown Prince\'s luncheon record: three main dishes plus almond tea to close. The dish names come from the compilations of Zhuang Yongming and Chen Yuzhen; the preparation and serving are this site\'s scenario illustrations inferred from the names and ingredients.',
        items: [
          {
            id: 'bird-nest-soup',
            name: '雪白官燕',
            nameEn: 'Snow-white imperial bird\'s nest',
            category: '大菜｜燕窩',
            categoryEn: 'Main banquet dish | Bird\'s nest',
            description: '以燕窩燉成的清湯，是午宴菜單上的第一類高價食材。莊永明列出「雪白官燕」一名，中央社引曾品滄也寫菜單用了燕窩。',
            descriptionEn: 'A clear soup of stewed bird\'s nest, the first of the costly ingredients on the luncheon menu. Zhuang Yongming lists the name "snow-white imperial bird\'s nest", and Central News Agency, citing Zeng Pincang, also writes that the menu used bird\'s nest.',
          },
          {
            id: 'golden-turkey',
            name: '金錢火雞',
            nameEn: 'Golden-coin turkey',
            category: '大菜｜火雞',
            categoryEn: 'Main banquet dish | Turkey',
            description: '火雞是十二道大菜用到的食材之一。「金錢火雞」一名出自莊永明；圓片的形狀依菜名推想，不是當年的作法記載。',
            descriptionEn: 'Turkey is one of the ingredients used in the twelve main dishes. The name "golden-coin turkey" comes from Zhuang Yongming; the round-slice shape is inferred from the name and is not a record of the original preparation.',
            note: '火雞在1920年代的臺灣宴席上並不常見，可能是為日本皇室的西式口味而加入；這是推測，不是記載。',
            noteEn: 'Turkey was not common at Taiwanese banquets in the 1920s and may have been added for the Western tastes of the Japanese imperial family; this is conjecture, not a record.',
          },
          {
            id: 'crystal-pigeon-egg',
            name: '水晶鴿蛋',
            nameEn: 'Crystal pigeon eggs',
            category: '大菜｜鴿蛋',
            categoryEn: 'Main banquet dish | Pigeon eggs',
            description: '鴿蛋是菜單上的食材之一，莊永明列出「水晶鴿蛋」的菜名；「水晶」通常指清透的蛋白或凍，這裡依菜名畫成透亮的蛋。',
            descriptionEn: 'Pigeon eggs are one of the ingredients on the menu, and Zhuang Yongming lists the dish name "crystal pigeon eggs"; "crystal" usually refers to clear egg white or jelly, and here the eggs are drawn as translucent according to the name.',
          },
          {
            id: 'almond-tea',
            name: '杏仁茶',
            nameEn: 'Almond tea',
            category: '收尾｜甜湯',
            categoryEn: 'Finale | Sweet soup',
            description: '午宴的收尾點心。莊永明寫以杏仁茶作結，陳玉箴則寫八寶飯與杏仁茶；兩種說法都有杏仁茶。',
            descriptionEn: 'The closing dessert of the luncheon. Zhuang Yongming says it ended with almond tea, while Chen Yuzhen says eight-treasure rice and almond tea; both accounts include almond tea.',
          },
        ],
        footnote: '四道菜只有菜名與食材見於文獻，作法、盛器與顏色都是本站的示意；江山樓日常宴席的菜單沒有查到，不要把這四道當成店內常備的菜。',
        footnoteEn: 'Only the names and ingredients of the four dishes appear in the sources; the preparation, serving ware and colours are this site\'s illustrations. The menu for everyday banquets at Jiangshanlou has not been found, so do not take these four as dishes the house always served.',
        sourceIds: ['jaung-jiang-shan-lou-2015', 'foodnext-chen-yuchen-2020', 'cna-taiwanese-cuisine-2020'],
      },
      // 第 8 階段：人物小節（純文字，資料在 jiangWeiShuiData.js）
      JIANG_WEISHUI_PERSON_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and Historical Basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and Historical Basis',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/jiang-shan-lou.md；其中東薈芳、春風得意樓、蓬萊閣的資料也在同一份紀錄裡；蔣渭水的查證見 docs/research/jiang-wei-shui.md。',
        introEn: 'This shop introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project\'s docs/research/jiang-shan-lou.md, which also holds the material on Dong Hui Fang, Chunfeng Deyi Lou and Penglai Pavilion; the verification on Jiang Weishui is in docs/research/jiang-wei-shui.md.',
        sourceIds: [
          'jaung-jiang-shan-lou-2015',
          'nccu-thesis-jiang-shan-lou-2008',
          'foodnext-chen-yuchen-2020',
          'cna-taiwanese-cuisine-2020',
          'nmth-jiang-shan-lou',
          'wiki-jiang-shan-lou',
          'factpedia-jiang-shan-lou',
          ...JIANG_WEISHUI_SOURCE_IDS,
        ],
        disclaimer:
          `江山樓的開業年份與拆除年份各資料記載不一，本站並列出處；皇太子午宴的記載都是研究者的二手整理，本站沒有讀到當年的報紙原件。江山樓原址在日新町（今歸綏街一帶），不在迪化街；本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建，建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。${JIANG_WEISHUI_DISCLAIMER_TEXT}`,
        disclaimerEn:
          `The opening and demolition years of Jiangshanlou are recorded differently across sources, and this site lists the sources side by side; the accounts of the Crown Prince's luncheon are all secondary compilations by researchers, and this site has not read the original newspapers of the time. Jiangshanlou's original site was in Nisshin-chō (around today's Guisui Street), not on Dihua Street; the 3D streetscape on this website is a conceptual reconstruction of the commercial street's atmosphere in each period, and building facades, signboards, furnishings and shop positions are for imaginative context only and are not precise restorations. ${JIANG_WEISHUI_DISCLAIMER_TEXT_EN}`,
      },
    ],
  },
  {
    id: 'xin-fang-chun',
    name: '新芳春茶行',
    nameEn: 'Xinfangchun Tea Hong',
    theme: 'tea',
    status: 'open',
    year: 1934,
    yearLabel: '1934年落成（茶行創立年份有多種說法）',
    yearLabelEn: 'Completed in 1934 (accounts differ on when the tea hong was founded)',
    yearNote: '建築落成於1934年（官方古蹟登錄寫「約創建於1930年代」）。茶行本身的創立年份各資料記載不一：國家文化記憶庫記1918年王芳群來臺設立、1932年改組為合資會社；大紀元記1919年王連河獨資經營。',
    yearNoteEn: 'The building was completed in 1934 (the official heritage registration says "built around the 1930s"). Sources disagree on when the tea hong itself was founded: the National Cultural Memory Bank records that Wang Fangqun (王芳群) came to Taiwan in 1918 to set it up and that it was reorganised as a joint company in 1932, while The Epoch Times records that Wang Lianhe (王連河) began running it alone in 1919.',
    sourceIds: ['nchdb-xinfangchun', 'tcmb-xinfangchun', 'epochtimes-xinfangchun-2022'],
    category: '茶行',
    categoryEn: 'Tea hong',
    seal: '茶行',
    sealEn: 'Tea',
    summary: '安溪茶商王連河1934年落成的三層洋樓，茶行、烘焙茶工廠、倉庫與住宅合一，是當時臺北最大的茶工廠；包種茶外銷南洋，2009年指定為市定古蹟，現在免費開放。',
    summaryEn: 'A three-storey Western-style building completed in 1934 by Wang Lianhe (王連河), a tea merchant from Anxi. Tea shop, tea-roasting factory, warehouse and home in one, it was then the largest tea factory in Taipei; its Baozhong tea was exported to Southeast Asia. It became a municipal historic site in 2009 and is now open free of charge.',
    note: '新芳春茶行在民生西路309號；街上的建築依「三開間、三層、水平帶狀女兒牆與三角形山頭」的記載示意，並非精確復原。',
    noteEn: 'Xinfangchun Tea Hong stands at No. 309 Minsheng West Road. The building in the street scene is a scenario illustration based on the recorded description of "three bays, three storeys, a horizontal band parapet and a triangular pediment"; it is not an exact reconstruction.',
    position: { x: -27, z: 4.5 },
    facing: 'north',
    // 互動位置稍微往路面退（戰後年代騎樓邊有道具）
    interaction: { radius: 3.4, distance: 3.1 },
    building: {
      archetype: 'tea-mansion',
      width: 7.2,
      depth: 12,
      floors: 3,
      sign: { text: '新芳春茶行', style: 'gold' },
      goods: 'tea',
    },
    buildingByEra: {
      modern: { condition: 'new' },
      postwar: { condition: 'aged' },
      revival: { condition: 'restored' },
    },
    // 各年代介紹視窗上方的「此時期的新芳春茶行」（整理自官方古蹟登錄、國家文化記憶庫與報導）
    eraNotes: {
      modern:
        '1934年落成的三層洋樓（官方登錄寫「約創建於1930年代」）：一樓是茶行與帳房，後進是精製茶的倉庫與加工廠，二樓是揀茶間與辦公室，三樓是王家的住家。它結合茶行、烘焙茶工廠、倉庫與住宅四種機能，是當時臺北最大的茶工廠，以包種茶外銷安南、暹羅、井裡汶。',
      modernEn:
        'A three-storey Western-style building completed in 1934 (the official registration says "built around the 1930s"). The ground floor held the tea hong and the accounts office; the rear section was a warehouse and processing factory for refined tea; the second floor held the tea-sorting rooms and offices; the third floor was the Wang family home. Combining tea shop, tea-roasting factory, warehouse and residence, it was then the largest tea factory in Taipei, exporting Baozhong tea to Annam, Siam and Cheribon.',
      postwar:
        '官方登錄記載，民國40年以後這裡也是財團法人王氏宗親會的籌備設立處。1974年第三代王國忠接手，仍外銷東南亞；1970年代末起受競爭影響業務萎縮，1990年代以後幾乎停滯（國家文化記憶庫）。大紀元則寫1960年代後逐漸收起事業、部分空間出租；停歇的確切時間各來源不一。',
      postwarEn:
        'The official registration records that from ROC year 40 (1951) the building was also the preparatory office of the Wang Clan Association (a registered foundation). In 1974 the third generation, Wang Guozhong (王國忠), took over and still exported to Southeast Asia; from the late 1970s competition caused business to shrink, and from the 1990s it almost came to a halt (National Cultural Memory Bank). The Epoch Times instead says the business was gradually wound down after the 1960s and part of the space rented out; sources differ on exactly when it stopped.',
      revival:
        '2005年登錄歷史建築、2009年指定市定古蹟；2011到2015年修復後，王國忠把建築捐給臺北市政府，2016年9月20日開放參觀，2018年起由台灣文創發展基金會經營為「活的茶葉故事館」。免費參觀，週三至週日開放。',
      revivalEn:
        'It was registered as a historic building in 2005 and designated a municipal historic site in 2009. After restoration from 2011 to 2015, Wang Guozhong donated the building to the Taipei City Government; it opened to visitors on 20 September 2016, and since 2018 it has been run by the Taiwan Cultural Creative Development Foundation as the "Living Tea Story House". Admission is free; it is open Wednesday to Sunday.',
    },
    camera: { distance: 6.6, height: 5.2, side: 5.5, lookHeight: 4.2 },
    chapters: [
      {
        id: 'history',
        type: 'text',
        tab: '安溪茶商',
        tabEn: 'Anxi tea merchants',
        title: '安溪茶商的起家厝',
        titleEn: 'The ancestral home of an Anxi tea merchant family',
        lead: '來自福建安溪的王家在大稻埕經營茶行，王連河1934年蓋起這棟三層洋樓；茶行的創立年份各資料記載不一。',
        leadEn: 'The Wang family from Anxi in Fujian ran a tea hong in Dadaocheng, and in 1934 Wang Lianhe built this three-storey Western-style building; sources differ on the year the tea hong was founded.',
        paragraphs: [
          '國家文化記憶庫記載，1918年王連河的父親王芳群由泉州安溪舉家遷臺，設立經營「芳春茶行」與「新芳春茶行」；大紀元的報導則寫芳春茶行是王芳群與王珍春合資，1919年王連河開始獨資經營新芳春茶行。王連河接手後，1932年改組為「合資會社新芳春茶行」，1950年再改組為「新芳春茶行兩合公司」。',
          '新芳春向文山、南港的茶農收購包種茶精製，銷往泰國而致富。王連河經營時期，新芳春是臺灣包種茶外銷南洋、尤其是泰國與安南地區的重要茶葉公司之一；第三代王國忠回憶「台灣的包種茶，我父親是推手」，父親曾被派往泰國推銷茶葉。',
          '1934年春天，王連河在民生西路蓋起三層洋樓，門牌原為303到309號；今天留下的是309號的古蹟，303到307號已改建。官方的古蹟登錄寫這棟建物「約創建於1930年代」，報導與國家文化記憶庫都記為1934年落成。',
        ],
        paragraphsEn: [
          'The National Cultural Memory Bank records that in 1918 Wang Lianhe’s father Wang Fangqun moved his whole family from Anxi, Quanzhou, to Taiwan and set up and ran the "Fangchun Tea Hong" and the "Xinfangchun Tea Hong". The Epoch Times instead writes that Fangchun was a joint venture between Wang Fangqun and Wang Zhenchun (王珍春), and that in 1919 Wang Lianhe began running Xinfangchun on his own. After Wang Lianhe took over, it was reorganised in 1932 as the "Xinfangchun Tea Hong Joint Company (gōshi kaisha)", and again in 1950 as the "Xinfangchun Tea Hong Limited Partnership".',
          'Xinfangchun bought Baozhong tea from tea growers in Wenshan and Nangang, refined it, and grew wealthy selling it to Thailand. During Wang Lianhe’s time it was one of the important tea companies exporting Taiwan’s Baozhong tea to Southeast Asia, especially Thailand and Annam; the third generation, Wang Guozhong, recalled that "for Taiwan’s Baozhong tea, my father was the driving force", and his father was once sent to Thailand to sell tea.',
          'In spring 1934 Wang Lianhe built a three-storey Western-style building on Minsheng West Road, originally numbered 303 to 309; what survives today as a historic site is No. 309, while Nos. 303 to 307 have been rebuilt. The official heritage registration says the building was "built around the 1930s", while press reports and the National Cultural Memory Bank both give 1934 as the year of completion.',
        ],
        facts: [
          { label: '家族', labelEn: 'Family', value: '福建安溪，王芳群、王連河、王國忠三代', valueEn: 'From Anxi, Fujian; three generations: Wang Fangqun, Wang Lianhe and Wang Guozhong' },
          { label: '茶行創立', labelEn: 'Tea hong founded', value: '1918年（國家文化記憶庫）或1919年（大紀元）；1932年改組為合資會社', valueEn: '1918 (National Cultural Memory Bank) or 1919 (The Epoch Times); reorganised as a joint company in 1932' },
          { label: '洋樓落成', labelEn: 'Building completed', value: '1934年（官方登錄：約1930年代）', valueEn: '1934 (official registration: around the 1930s)' },
          { label: '地址', labelEn: 'Address', value: '臺北市大同區民生西路309號', valueEn: 'No. 309 Minsheng West Road, Datong District, Taipei' },
          { label: '主力商品', labelEn: 'Main product', value: '包種茶，外銷泰國、安南等地', valueEn: 'Baozhong tea, exported to Thailand, Annam and elsewhere' },
        ],
        sourceIds: ['tcmb-xinfangchun', 'epochtimes-xinfangchun-2022', 'nchdb-xinfangchun', 'ltn-xinfangchun-2015', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'architecture',
        type: 'text',
        tab: '臺北最大的茶工廠',
        tabEn: 'Taipei’s largest tea factory',
        title: '臺北最大的茶工廠',
        titleEn: 'Taipei’s largest tea factory',
        lead: '三開間、三進、三層的洋樓，把茶行、烘焙茶工廠、倉庫與主人住宅放在同一棟建築裡；2009年指定為市定古蹟。',
        leadEn: 'A three-bay, three-section, three-storey Western-style building that put the tea hong, tea-roasting factory, warehouse and the owner’s home under one roof; it was designated a municipal historic site in 2009.',
        paragraphs: [
          '官方登錄描述：三樓店屋形式，連續三崁街屋，水平帶狀的女兒牆，屋頂突出三角形山頭，裝飾花草圖樣的泥塑，中間牌樓面退縮作陽台；正立面的泥塑出自大稻埕名匠郭三川之手。《臺灣工藝》形容它是融合中西特色的日治時期洋樓，有穿心廊與日月雙井，門楣山牆飾有勳章與忍冬草的花紋。',
          '一樓的正廳是茶行、帳房與銷售空間，後進是精製茶的倉庫與加工廠，紅磚砌的焙籠間保留數十個焙籠坑與竹籠，還留著乾燥機、風選機等機具；二樓是揀茶間、辦公室與會客廳，當年女工們在這裡人工揀茶；三樓是王家的起居空間與公媽廳，前廳至今仍是祖廳。古蹟登錄的理由寫它結合四種空間機能，是當時臺北最大的茶工廠，也是建築類型的孤例。',
          '2005年3月登錄為歷史建築，2009年9月29日指定為直轄市定古蹟。2007年屋主陸續搬出後，2011年到2015年由興富發建設出資修復，恢復九成原貌；2015年12月18日舉行落成典禮，王國忠把建築捐贈給臺北市政府。',
        ],
        paragraphsEn: [
          'The official registration describes it as a three-storey shophouse of three continuous bays with a horizontal band parapet and a triangular pediment projecting from the roof, decorated with floral stucco, and with the middle of the arcade façade set back as a balcony; the stucco on the main façade is the work of the Dadaocheng master craftsman Guo Sanchuan (郭三川). Taiwan Crafts describes it as a Japanese-period Western-style building blending Chinese and Western features, with a through-corridor and twin "sun and moon" wells, and with medals and honeysuckle patterns on the lintel pediment.',
          'The main hall on the ground floor was the tea hong, accounts office and sales space; the rear section was the warehouse and processing factory for refined tea. The red-brick roasting room keeps dozens of roasting pits and bamboo baskets, along with machines such as a drying machine and a wind-sorting machine. The second floor held the tea-sorting room, offices and reception hall, where women workers once sorted tea by hand; the third floor was the Wang family’s living space and ancestral hall, and its front hall is still the ancestral hall today. The reasons for its heritage listing say it combined four kinds of space, was the largest tea factory in Taipei at the time, and is the only example of its building type.',
          'It was registered as a historic building in March 2005 and designated a municipal historic site on 29 September 2009. After the owners gradually moved out in 2007, it was restored from 2011 to 2015 with funding from Hsin Fu Fa Construction (興富發建設), recovering ninety percent of its original appearance; at the completion ceremony on 18 December 2015, Wang Guozhong donated the building to the Taipei City Government.',
        ],
        facts: [
          { label: '文化資產', labelEn: 'Cultural heritage', value: '直轄市定古蹟（宅第、產業），2009年9月29日公告，北市文化二字第09830231500號', valueEn: 'Municipal historic site (residence and industrial property), announced on 29 September 2009, Taipei City Culture Official Letter No. 09830231500' },
          { label: '規模', labelEn: 'Scale', value: '三開間、三進、三層；樓地板約五百坪', valueEn: 'Three bays, three sections, three storeys; floor area of about 500 ping' },
          { label: '泥塑', labelEn: 'Stucco', value: '大稻埕名匠郭三川', valueEn: 'Guo Sanchuan, a master craftsman of Dadaocheng' },
          { label: '修復', labelEn: 'Restoration', value: '2011–2015年，興富發建設出資', valueEn: '2011–2015, funded by Hsin Fu Fa Construction' },
          { label: '古物', labelEn: 'Antique', value: '紫地「新芳春行」大八仙彩，2019年指定為一般古物', valueEn: 'A large purple-ground "Xinfangchun Hong" eight-immortals festival banner, designated a general antique in 2019' },
        ],
        sourceIds: ['nchdb-xinfangchun', 'ntcri-77-xinfangchun', 'ntcri-77-xinfangchun-restoration', 'ltn-xinfangchun-2015', 'pts-xinfangchun-2016', 'epochtimes-xinfangchun-2022'],
      },
      {
        id: 'museum',
        type: 'text',
        tab: '活的茶葉故事館',
        tabEn: 'The Living Tea Story House',
        title: '從停歇到活的茶葉故事館',
        titleEn: 'From closure to the Living Tea Story House',
        lead: '茶業外銷在戰後逐漸式微，新芳春停止製茶；修復後的洋樓在2016年開放，成為免費參觀的茶葉故事館。',
        leadEn: 'Tea exports gradually declined after the war and Xinfangchun stopped making tea; the restored building opened in 2016 as a Tea Story House that is free to visit.',
        paragraphs: [
          '戰後，臺灣的包種茶仍出口到泰國、馬來西亞、新加坡與印尼等華人聚居的地方；但1970年代末起受到競爭，新芳春的業務日漸萎縮，1990年代以後幾乎停滯（國家文化記憶庫）。大紀元寫1960年代後大稻埕許多茶商轉業，新芳春逐漸收起事業、部分空間出租；王國忠在2016年受訪時說「12年前乾脆不做了」。三種說法的時間不同，本站只寫「逐漸停歇」。',
          '臺北市政府文化局2016年5月接管，9月20日推出特展並對外開放，展區保存近三千件文物；2018年起委由台灣文創發展基金會經營，以「活的茶葉故事館」、「茶文創發展平台」、「以茶會友」為三大主軸。二樓有王家生活展、茶貿易文物與建築修復展，一樓有「記憶的磚瓦」常設展。',
          '今天的新芳春茶行免費參觀，週三至週日10:00到18:00開放，週一、二休館（臺北旅遊網，2026年10月）。走進去，可以看到焙籠間的焙籠坑、揀茶間，以及當年外銷用的茶樣與獎狀。',
        ],
        paragraphsEn: [
          'After the war, Taiwan’s Baozhong tea was still exported to places with Chinese communities such as Thailand, Malaysia, Singapore and Indonesia; but from the late 1970s competition set in, Xinfangchun’s business shrank, and from the 1990s it almost came to a halt (National Cultural Memory Bank). The Epoch Times writes that after the 1960s many Dadaocheng tea merchants changed trades, and Xinfangchun gradually wound down its business and rented out part of its space; in a 2016 interview Wang Guozhong said, "Twelve years ago we simply stopped." The three accounts give different dates, so this site says only that it "gradually came to a stop".',
          'The Taipei City Government Department of Cultural Affairs took over in May 2016 and opened it to the public on 20 September with a special exhibition; the galleries preserve nearly three thousand objects. Since 2018 it has been entrusted to the Taiwan Cultural Creative Development Foundation, with three main themes: the "Living Tea Story House", the "Tea Culture and Creativity Platform" and "Making Friends over Tea". The second floor has an exhibition on the Wang family’s life, tea-trade artefacts and the building’s restoration, and the ground floor has the permanent exhibition "Bricks and Tiles of Memory".',
          'Today Xinfangchun Tea Hong is free to visit, open Wednesday to Sunday from 10:00 to 18:00 and closed on Mondays and Tuesdays (Taipei Travel Net, October 2026). Inside you can see the roasting pits of the roasting room, the tea-sorting room, and the tea samples and certificates from the export days.',
        ],
        facts: [
          { label: '捐贈', labelEn: 'Donation', value: '2015年，第三代王國忠捐贈臺北市政府', valueEn: '2015: the third generation, Wang Guozhong, donated it to the Taipei City Government' },
          { label: '開放', labelEn: 'Opened', value: '2016年9月20日', valueEn: '20 September 2016' },
          { label: '經營', labelEn: 'Operator', value: '2018年起，台灣文創發展基金會', valueEn: 'Since 2018, the Taiwan Cultural Creative Development Foundation' },
          { label: '參觀', labelEn: 'Visiting', value: '免費；週三至週日 10:00–18:00', valueEn: 'Free; Wednesday to Sunday, 10:00–18:00' },
        ],
        sourceIds: ['tcmb-xinfangchun', 'epochtimes-xinfangchun-2022', 'zsdo-xinfangchun-2020', 'pts-xinfangchun-2016', 'travel-taipei-xinfangchun', 'curation-dadaocheng-tea'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '包種茶外銷南洋',
        tabEn: 'Baozhong tea for Southeast Asia',
        title: '代表茶品｜外銷南洋的包種茶',
        titleEn: 'Signature tea | Baozhong tea exported to Southeast Asia',
        intro: '新芳春以包種茶為主力商品，外銷安南、暹羅、井裡汶等地。以下圖鑑介紹包種茶，以及茶行裡製茶與外銷的器物。',
        introEn: 'Xinfangchun’s main product was Baozhong tea, exported to Annam, Siam, Cheribon and elsewhere. The guide below introduces Baozhong tea and the tea-making and export objects found in the tea hong.',
        items: [
          {
            id: 'baozhong-tea',
            name: '文山包種茶',
            nameEn: 'Wenshan Baozhong tea',
            category: '輕發酵｜條形',
            categoryEn: 'Lightly oxidised | strip-shaped',
            description: '條形的輕發酵茶，茶湯清香。大稻埕外銷南洋的主力茶幾乎都是坪林的文山包種茶；新芳春向文山、南港的茶農收購包種茶精製。',
            descriptionEn: 'A strip-shaped, lightly oxidised tea with a clear, fragrant liquor. Almost all of the tea Dadaocheng exported to Southeast Asia was Wenshan Baozhong from Pinglin; Xinfangchun bought Baozhong from tea growers in Wenshan and Nangang and refined it.',
            note: '店內展出新芳春在「全臺省優良茶比賽」得獎的獎狀（《臺灣工藝》圖說）。',
            noteEn: 'The shop displays certificates Xinfangchun won in the "Taiwan Province Fine Tea Competition" (from a caption in Taiwan Crafts).',
          },
          {
            id: 'roasting-basket',
            name: '焙籠坑',
            nameEn: 'Roasting pits',
            category: '製茶｜一樓後進',
            categoryEn: 'Tea making | rear section, ground floor',
            description: '紅磚砌的焙籠間排著成排的焙籠坑，上面架竹焙籠以炭火低溫烘焙。報導寫這裡曾布滿一百個坑穴，一天二十四小時都在高溫烘焙中。',
            descriptionEn: 'The red-brick roasting room holds rows of roasting pits, over which bamboo roasting baskets were set to roast tea slowly over charcoal. A report says the room was once packed with a hundred pits, roasting at high heat twenty-four hours a day.',
          },
          {
            id: 'tea-chest',
            name: '外銷茶箱',
            nameEn: 'Export tea chests',
            category: '外銷｜倉庫',
            categoryEn: 'Export | warehouse',
            description: '精製好的茶裝進茶箱，從大稻埕碼頭運出；茶箱上印著商號與目的地的標記。二樓的常設展有外銷茶的茶樣與貿易文物。',
            descriptionEn: 'Refined tea was packed into chests and shipped out from the Dadaocheng wharf; the chests were printed with the firm’s name and destination marks. The permanent exhibition on the second floor has tea samples and trade artefacts from the export business.',
          },
        ],
        footnote: '包種茶的一般介紹不出自新芳春；器物依《臺灣工藝》與報導描述繪製，不是館藏的精確圖像。',
        footnoteEn: 'The general introduction to Baozhong tea does not come from Xinfangchun; the objects are drawn from descriptions in Taiwan Crafts and press reports and are not exact images of the museum’s collection.',
        sourceIds: ['ntcri-77-xinfangchun', 'epochtimes-xinfangchun-2022', 'tcmb-xinfangchun', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and historical basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and historical basis',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/xin-fang-chun.md。',
        introEn: 'This shop introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project’s docs/research/xin-fang-chun.md.',
        sourceIds: [
          'nchdb-xinfangchun',
          'tcmb-xinfangchun',
          'ntcri-77-xinfangchun',
          'ntcri-77-xinfangchun-restoration',
          'ltn-xinfangchun-2015',
          'pts-xinfangchun-2016',
          'zsdo-xinfangchun-2020',
          'travel-taipei-xinfangchun',
          'epochtimes-xinfangchun-2022',
          'curation-dadaocheng-tea',
          'culture-taipei-walk-dadaocheng-2018',
        ],
        disclaimer:
          '新芳春茶行的創立年份與停止製茶的時間各資料記載不一，本站並列出處。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。',
        disclaimerEn:
          'Sources disagree on when Xinfangchun Tea Hong was founded and when it stopped making tea, and this site lists the sources side by side. The 3D street scene on this website is a conceptual reconstruction of the atmosphere of Dadaocheng’s commercial district in each era; building exteriors, signboards, furnishings and shop locations are for imaginative purposes only and are not exact reconstructions.',
      },
    ],
  },
  {
    id: 'bolero',
    name: '波麗路',
    nameEn: 'Bolero',
    status: 'open',
    year: 1934,
    yearLabel: '1934年開業',
    yearLabelEn: 'Opened in 1934',
    yearNote: '1934年開業：官方歷史建築登錄、鏡週刊、食力、維基百科一致；遠見2011年以「營業77年」推算亦同。建物本身官方登錄寫「初建於1920年代」。',
    yearNoteEn: 'Opened in 1934: the official historic-building registration, Mirror Media, FoodNext and Wikipedia all agree, and Global Views Monthly’s 2011 count of "77 years in business" gives the same date. The official registration says the building itself was "first built in the 1920s".',
    sourceIds: ['boch-bolero', 'mirror-2025-bolero', 'foodnext-2020-bolero', 'gvm-2011-bolero'],
    category: '西餐廳',
    categoryEn: 'Western-style restaurant',
    seal: '西餐',
    sealEn: 'Western',
    summary: '1934年廖水來在民生西路開設的西餐廳，官方登錄稱它是「臺北市1930年代最著名的西餐廳」；畫家常聚、年輕人相親，招牌是法國鴨子飯與咖哩飯，至今仍在原址營業。',
    summaryEn: 'A Western-style restaurant opened in 1934 by Liao Shuilai (廖水來) on Minsheng West Road. The official heritage registration calls it "the most famous Western restaurant in 1930s Taipei". Painters gathered here and young people came for matchmaking meetings; its signature dishes are French-style duck rice and curry rice, and it still operates at the original site.',
    note: '波麗路在民生西路314號（官方歷史建築登錄）；街上的建築依「Art Deco 二層街屋、西餐廳櫥窗」示意，並非精確復原。店內的座位、裝潢與菜單只在章節文字裡。',
    noteEn: 'Bolero is at No. 314 Minsheng West Road (official historic-building registration). The building in the street scene is a scenario illustration based on "a two-storey Art Deco shophouse with a Western restaurant display window"; it is not an exact reconstruction. The seating, decor and menu inside appear only in the chapter text.',
    position: { x: 24.3, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.2 },
    building: {
      archetype: 'deco',
      width: 6.6,
      depth: 11,
      floors: 2,
      wallTint: '#f1e8d6',
      trimTint: '#2f6b5a',
      awningTint: '#7a2e33',
      sign: { text: '波麗路', style: 'letters' },
      smallSign: { text: '西餐', style: 'deco' },
      cafe: true,
    },
    buildingByEra: {
      modern: { condition: 'new', shopfront: 'display', shopType: 'restaurant', decoDetail: 'fins' },
      postwar: { condition: 'aged' },
      revival: { condition: 'restored' },
    },
    // 各年代介紹視窗上方的「此時期的波麗路」（整理自官方登錄、遠見、食力、鏡週刊）
    eraNotes: {
      modern:
        '1934年，曾在維特咖啡擔任主廚的廖水來（鏡週刊）在太平町、今民生西路開了這家西餐廳；官方登錄稱它是「臺北市1930年代最著名的西餐廳，是沙龍文化的先鋒」。遠見2011年的報導寫初開時就有進口磁磚、沙發椅、吊扇、冷氣，78轉的電唱機放著古典樂，服務員穿黑西裝打領結。',
      modernEn:
        'In 1934 Liao Shuilai (廖水來), who had been head chef at the Vite Cafe (Mirror Media), opened this Western-style restaurant on Taiping Street, today’s Minsheng West Road; the official registration calls it "the most famous Western restaurant in 1930s Taipei and a pioneer of salon culture". Global Views Monthly’s 2011 report says that when it first opened it already had imported tiles, sofa chairs, ceiling fans and air conditioning, a 78-rpm gramophone played classical music, and the waiters wore black suits and bow ties.',
      postwar:
        '戰後波麗路一直在原址營業，後來買下了這棟建物；1976年在隔壁開了第二店（遠見2011）。鏡週刊寫張萬傳、楊三郎、郭雪湖等畫家常在這裡出入；食力與遠見城市都寫它是年輕人相親的地方。1961年一份法國鴨子飯25元（遠見2011）。',
      postwarEn:
        'After the war Bolero kept trading on its original site and later bought the building; in 1976 it opened a second shop next door (Global Views Monthly, 2011). Mirror Media writes that painters such as Zhang Wanchuan (張萬傳), Yang Sanlang (楊三郎) and Guo Xuehu (郭雪湖) were frequent visitors; FoodNext and Global Views City both write that it was a place for young people to meet for matchmaking. In 1961 a plate of French-style duck rice cost 25 yuan (Global Views Monthly, 2011).',
      revival:
        '2006年5月17日登錄為臺北市歷史建築（文化部國家文化資產網）。餐廳仍由家族經營，招牌的法國鴨子飯、咖哩飯與牛排還在菜單上（食力、鏡週刊）；本站不列營業時間與價格。',
      revivalEn:
        'On 17 May 2006 it was registered as a Taipei City historic building (Ministry of Culture, National Cultural Heritage database). The restaurant is still run by the family, and its signature French-style duck rice, curry rice and steak are still on the menu (FoodNext, Mirror Media); this site does not list opening hours or prices.',
    },
    // 二層的 Art Deco 樓：鏡頭在街道上往側邊拉開一點，看得到櫥窗與樓上的鋼框窗
    camera: { distance: 6.4, height: 4.4, side: 4.5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'background',
        type: 'text',
        tab: '西餐與咖啡的年代',
        tabEn: 'The age of Western food and coffee',
        title: '1930年代大稻埕的西餐與咖啡館',
        titleEn: 'Western food and coffee houses in 1930s Dadaocheng',
        lead: '1930年代的太平町（今延平北路、民生西路一帶）出現了喫茶店與西餐廳；波麗路是其中留下最多記載、至今還在營業的一家。',
        leadEn: 'In the 1930s tea houses and Western-style restaurants appeared on Taiping Street (around today’s Yanping North Road and Minsheng West Road); Bolero is the one with the most records and is still in business.',
        paragraphs: [
          '日治時期的大稻埕以茶葉致富，1930年代的太平町已經是臺灣人聚居的鬧區。魚夫在遠見城市的文章寫到，1931年維特咖啡在太平町三丁目開業；三立新聞網的報導則寫它由楊三郎的兄長楊承基經營，開在今延平北路與南京西路口的二樓，1932年起引進「女給」（女服務生）。這些關於維特咖啡的記載本站只讀到媒體層級，所以只在這裡交代背景，不做成可探索的店家。',
          '鏡週刊寫到，廖水來原本在維特咖啡擔任主廚，1934年自立門戶開了波麗路。文化部國家文化資產網的歷史建築登錄稱波麗路是「臺北市1930年代最著名的西餐廳，是沙龍文化的先鋒，為生活西化重要見證」。這一年大稻埕的民生西路上也落成了新芳春茶行的三層洋樓；茶商的財富、西洋的飲食與音樂，在同一條街上並存。',
          '同一時期以文人聚會聞名的山水亭（王井泉經營的臺菜餐廳，常客有陳逸松、張文環、呂赫若、吳新榮等），開業年各資料不一（1937、1938、1939三說）、門牌查無，所以暫不做成店家、也不對應街景裡的任何一棟；王井泉與山水亭的事見「人物：王井泉」一章。',
        ],
        paragraphsEn: [
          'Dadaocheng grew rich on tea in the Japanese colonial period, and by the 1930s Taiping Street was already a busy district where Taiwanese lived. Yufu (魚夫) writes in Global Views City that the Vite Cafe opened in 1931 at Taiping-chō 3-chōme; a SETN report says it was run by Yang Chengji (楊承基), elder brother of Yang Sanlang, on the second floor at the corner of today’s Yanping North Road and Nanjing West Road, and that from 1932 it brought in "jokyū" (waitresses). This site has read these records on the Vite Cafe only at media level, so it gives them here as background and does not make the cafe an explorable shop.',
          'Mirror Media writes that Liao Shuilai was originally head chef at the Vite Cafe and struck out on his own in 1934 to open Bolero. The historic-building registration on the Ministry of Culture’s National Cultural Heritage database calls Bolero "the most famous Western restaurant in 1930s Taipei, a pioneer of salon culture and an important witness to the Westernisation of daily life". That same year the three-storey Western-style building of Xinfangchun Tea Hong was also completed on Minsheng West Road; the wealth of tea merchants and Western food and music coexisted on the same street.',
          'Shanshuiting (山水亭), famed in the same period as a gathering place for writers (a Taiwanese-cuisine restaurant run by Wang Jingquan (王井泉), whose regulars included Chen Yisong, Zhang Wenhuan, Lü Heruo and Wu Xinrong), has sources that disagree on its opening year (three accounts: 1937, 1938 and 1939) and no street address on record, so for now it is not made a shop or matched to any building in the street scene; Wang Jingquan and Shanshuiting are covered in the chapter "Person: Wang Jingquan".',
        ],
        facts: [
          { label: '維特咖啡', labelEn: 'Vite Cafe', value: '1931年開於太平町三丁目（遠見城市、三立新聞網）；1932年引進女給（三立，單一來源）', valueEn: 'Opened in 1931 at Taiping-chō 3-chōme (Global Views City, SETN); brought in waitresses (jokyū) in 1932 (SETN, single source)' },
          { label: '波麗路', labelEn: 'Bolero', value: '1934年開業，民生西路314號；臺北市歷史建築', valueEn: 'Opened in 1934, No. 314 Minsheng West Road; a Taipei City historic building' },
          { label: '新芳春茶行', labelEn: 'Xinfangchun Tea Hong', value: '1934年落成，民生西路309號', valueEn: 'Completed in 1934, No. 309 Minsheng West Road' },
          { label: '山水亭', labelEn: 'Shanshuiting', value: '王井泉經營的臺菜餐廳，延平北路一帶街屋二樓；開業年三說、門牌查無（見「人物：王井泉」）', valueEn: 'A Taiwanese-cuisine restaurant run by Wang Jingquan, on the upper floor of a shophouse around Yanping North Road; three accounts of its opening year and no street address on record (see "Person: Wang Jingquan")' },
        ],
        sourceIds: ['boch-bolero', 'mirror-2025-bolero', 'gvm-city-2024-bolero', 'setn-2020-vite-cafe', 'newtalk-2024-shanshuiting', 'sinica-newsletter-1584-shanshuiting', 'nchdb-xinfangchun'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '廖水來',
        tabEn: 'Liao Shuilai',
        title: '廖水來與九十年的西餐廳',
        titleEn: 'Liao Shuilai and ninety years of a Western restaurant',
        lead: '廖水來赴日學西餐，1934年在朋友鼓勵下租下小店面開業（遠見2011）；波麗路至今仍在民生西路的原址營業。',
        leadEn: 'Liao Shuilai went to Japan to learn Western cooking and in 1934, encouraged by friends, rented a small shopfront and opened (Global Views Monthly, 2011); Bolero still trades at its original site on Minsheng West Road.',
        paragraphs: [
          '遠見雜誌2011年的報導寫到，廖水來年輕時到日本學西餐，回來後在朋友鼓勵下租了一間小店面開業；後來生意穩定，買下了這棟建物。鏡週刊補充他原在維特咖啡任主廚。店名「波麗路」相傳取自法國作曲家拉威爾的樂曲〈Boléro〉（鏡週刊、維基百科；食力與遠見的文章沒有說明由來，本站只寫「相傳」）。',
          '官方的歷史建築登錄寫這棟建物「初建於1920年代，後於1934年餐廳開業後進行裝修」，門牌是民生西路314號；魚夫寫它在日治時期屬於太平町三丁目，約今民生西路與延平北路口。鏡週刊同一篇文章把門牌寫成134號又寫成314號，本站依官方登錄採314號。',
          '遠見2011年的報導寫本店從開業起一直在原址，沒有搬過；1976年在隔壁開了第二店。維基百科另寫1947年由畫家顏雲連重新設計改建、1976年兄弟分家另一店在308號，這兩點只有維基一個來源，本站不採用。2006年5月17日，臺北市政府把314號的建物登錄為歷史建築。',
        ],
        paragraphsEn: [
          'Global Views Monthly’s 2011 report says that Liao Shuilai went to Japan in his youth to learn Western cooking, and on returning rented a small shopfront and opened a restaurant, encouraged by friends; once business was steady he bought the building. Mirror Media adds that he had been head chef at the Vite Cafe. The name "Bolero" is said to come from the French composer Ravel’s piece Boléro (Mirror Media, Wikipedia; the FoodNext and Global Views articles do not explain the origin, so this site says only "is said to").',
          'The official historic-building registration says the building was "first built in the 1920s and refitted after the restaurant opened in 1934", with the address No. 314 Minsheng West Road; Yufu writes that in the Japanese colonial period it fell within Taiping-chō 3-chōme, roughly the corner of today’s Minsheng West Road and Yanping North Road. The same Mirror Media article gives the number as both 134 and 314, and this site follows the official registration in using 314.',
          'Global Views Monthly’s 2011 report says the restaurant has stayed on its original site since opening and has never moved; in 1976 it opened a second shop next door. Wikipedia further says it was redesigned and rebuilt in 1947 by the painter Yan Yunlian (顏雲連) and that in 1976 the brothers split and another shop opened at No. 308; these two points have only Wikipedia as a source and this site does not use them. On 17 May 2006 the Taipei City Government registered the building at No. 314 as a historic building.',
        ],
        facts: [
          { label: '創辦人', labelEn: 'Founder', value: '廖水來，赴日學西餐；原在維特咖啡任主廚（鏡週刊）', valueEn: 'Liao Shuilai, who went to Japan to learn Western cooking; formerly head chef at the Vite Cafe (Mirror Media)' },
          { label: '開業', labelEn: 'Opened', value: '1934年', valueEn: '1934' },
          { label: '店名', labelEn: 'Name', value: '相傳取自拉威爾的〈Boléro〉（鏡週刊、維基百科）', valueEn: 'Said to be taken from Ravel’s Boléro (Mirror Media, Wikipedia)' },
          { label: '地址', labelEn: 'Address', value: '臺北市大同區民生西路314號（官方登錄）', valueEn: 'No. 314 Minsheng West Road, Datong District, Taipei (official registration)' },
          { label: '文化資產', labelEn: 'Cultural heritage', value: '臺北市歷史建築，2006年5月17日登錄', valueEn: 'Taipei City historic building, registered on 17 May 2006' },
          { label: '第二店', labelEn: 'Second shop', value: '1976年在隔壁開設（遠見2011）', valueEn: 'Opened next door in 1976 (Global Views Monthly, 2011)' },
        ],
        sourceIds: ['gvm-2011-bolero', 'mirror-2025-bolero', 'boch-bolero', 'gvm-city-2024-bolero', 'wiki-bolero'],
      },
      {
        id: 'salon',
        type: 'text',
        tab: '沙龍與相親',
        tabEn: 'Salon and matchmaking',
        title: '畫家的沙龍、年輕人的相親桌',
        titleEn: 'A painters’ salon and a matchmaking table for the young',
        lead: '進口磁磚、沙發椅與播著古典樂的電唱機，讓波麗路成了官方登錄所稱的「沙龍文化先鋒」；畫家在這裡聚會，年輕人在這裡相親。',
        leadEn: 'Imported tiles, sofa chairs and a gramophone playing classical music made Bolero a "pioneer of salon culture", as the official registration puts it; painters gathered here and young people met for matchmaking.',
        paragraphs: [
          '空間｜遠見2011年的報導描述初開時的裝潢：進口的磁磚、沙發椅、吊扇與冷氣，店裡用78轉的電唱機播放古典音樂，服務員穿黑西裝、打領結。食力的文章寫廖水來設計了多層的鋼製圓飯盒（文中寫「據說」）；維基百科稱不鏽鋼餐具與牛排盤從創立就訂製，這一點只有維基一個來源，本站不採用。',
          '畫家｜鏡週刊寫到，張萬傳、楊三郎、陳德旺、洪瑞麟、郭雪湖等畫家常在波麗路出入，音樂家呂泉生、文史學者林衡道也常來（單一來源）。魚夫在遠見城市寫到，畫家陳清汾從巴黎回臺後與廖水來聊天，激發了鴨子飯的研發——這也是單一來源，本站寫成「文章提到」。',
          '相親｜食力與遠見城市都寫波麗路是年輕人相親的地方，魚夫用「相親定終身」形容。至於婚宴、在這裡辦過的展覽或聚會的具體年份，本站沒有查到可靠記載，不多寫。',
        ],
        paragraphsEn: [
          'Space | Global Views Monthly’s 2011 report describes the decor when it first opened: imported tiles, sofa chairs, ceiling fans and air conditioning, with a 78-rpm gramophone playing classical music and waiters in black suits and bow ties. FoodNext writes that Liao Shuilai designed multi-tiered steel round lunch boxes (the article says "it is said"); Wikipedia says stainless-steel cutlery and steak plates were custom-made from the founding, but this has only Wikipedia as a source and this site does not use it.',
          'Painters | Mirror Media writes that painters such as Zhang Wanchuan, Yang Sanlang, Chen Dewang (陳德旺), Hong Ruilin (洪瑞麟) and Guo Xuehu often came and went at Bolero, and that the musician Lü Quansheng (呂泉生) and the local historian Lin Hengdao (林衡道) also visited often (single source). Yufu writes in Global Views City that after the painter Chen Qingfen (陳清汾) returned from Paris, his conversations with Liao Shuilai sparked the development of the duck rice; this too is a single source, so this site writes it as "an article mentions".',
          'Matchmaking | FoodNext and Global Views City both write that Bolero was a place for young people to meet for matchmaking, and Yufu describes it as "deciding a lifetime over a matchmaking meal". As for specific years of weddings, exhibitions or gatherings held here, this site has found no reliable record and does not say more.',
        ],
        facts: [
          { label: '裝潢', labelEn: 'Decor', value: '進口磁磚、沙發椅、吊扇、冷氣、78轉電唱機（遠見2011）', valueEn: 'Imported tiles, sofa chairs, ceiling fans, air conditioning, a 78-rpm gramophone (Global Views Monthly, 2011)' },
          { label: '服務員', labelEn: 'Waiters', value: '黑西裝、領結（遠見2011）', valueEn: 'Black suits and bow ties (Global Views Monthly, 2011)' },
          { label: '常客', labelEn: 'Regulars', value: '張萬傳、楊三郎、陳德旺、洪瑞麟、郭雪湖、呂泉生、林衡道（鏡週刊，單一來源）', valueEn: 'Zhang Wanchuan, Yang Sanlang, Chen Dewang, Hong Ruilin, Guo Xuehu, Lü Quansheng, Lin Hengdao (Mirror Media, single source)' },
          { label: '相親', labelEn: 'Matchmaking', value: '食力、遠見城市均記載', valueEn: 'Recorded by both FoodNext and Global Views City' },
        ],
        sourceIds: ['gvm-2011-bolero', 'mirror-2025-bolero', 'foodnext-2020-bolero', 'gvm-city-2024-bolero', 'boch-bolero'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表菜',
        tabEn: 'Signature dishes',
        title: '代表食物｜鴨子飯、咖哩飯與牛排',
        titleEn: 'Signature foods | duck rice, curry rice and steak',
        intro: '依食力、鏡週刊與遠見的報導選出三道店裡的代表菜。文獻沒有寫到每一道菜開始販售的年份，所以本站只寫「代表菜」，不說1934年就有；造型是本站依菜名與描述的示意。',
        introEn: 'Three signature dishes chosen from reports by FoodNext, Mirror Media and Global Views Monthly. The sources do not say in which year each dish went on sale, so this site says only "signature dish" and does not claim it existed in 1934; the appearance is this site’s scenario illustration based on the dish names and descriptions.',
        items: [
          {
            id: 'duck-rice',
            name: '法國鴨子飯',
            nameEn: 'French-style duck rice',
            category: '主菜｜飯',
            categoryEn: 'Main course | rice',
            description: '食力與鏡週刊都寫它是波麗路的招牌：鴨肉配醬汁與飯。遠見2011年的報導記1961年一份25元。魚夫的文章提到畫家陳清汾從巴黎回來後與廖水來的談話激發了這道菜的研發（單一來源）。',
            descriptionEn: 'FoodNext and Mirror Media both call it Bolero’s signature: duck with sauce and rice. Global Views Monthly’s 2011 report records a price of 25 yuan a plate in 1961. Yufu’s article mentions that a conversation between the painter Chen Qingfen and Liao Shuilai after Chen returned from Paris sparked the development of this dish (single source).',
            note: '開始販售的年份文獻未載。鴨肉的部位、醬汁與配菜都是示意。',
            noteEn: 'The year it went on sale is not recorded in the sources. The cut of duck, the sauce and the side dishes are all scenario illustration.',
          },
          {
            id: 'curry-rice',
            name: '咖哩飯',
            nameEn: 'Curry rice',
            category: '主菜｜飯',
            categoryEn: 'Main course | rice',
            description: '食力寫波麗路的咖哩飯附魚鬆，鏡週刊寫菜單上有牛肉咖哩飯。咖哩是日治時期經由日本傳入臺灣的西式料理。',
            descriptionEn: 'FoodNext writes that Bolero’s curry rice comes with fish floss, and Mirror Media writes that the menu has beef curry rice. Curry is a Western-style dish that reached Taiwan via Japan in the Japanese colonial period.',
            note: '維基百科稱1934年開業時就有「鄉村咖哩飯」，只有這一個來源，本站不採用。',
            noteEn: 'Wikipedia says "country curry rice" was already served when it opened in 1934, but this has only that one source and this site does not use it.',
          },
          {
            id: 'bolero-steak',
            name: '牛排',
            nameEn: 'Steak',
            category: '主菜｜鐵盤',
            categoryEn: 'Main course | iron plate',
            description: '鏡週刊寫波麗路的牛排先醃再煎。盛在金屬盤上的畫法對應食力所寫廖水來設計鋼製餐具的記載（「據說」），不是當年牛排盤的實際形狀。',
            descriptionEn: 'Mirror Media writes that Bolero’s steak is marinated and then pan-fried. The depiction on a metal plate corresponds to FoodNext’s record that Liao Shuilai designed steel tableware ("it is said"); it is not the actual shape of the steak plate of the time.',
            note: '開始販售的年份文獻未載。',
            noteEn: 'The year it went on sale is not recorded in the sources.',
          },
        ],
        footnote: '三道菜只有菜名與簡短描述見於媒體報導，作法、份量與盛器都是本站的示意；本站不列價格（1961年的25元是歷史記載，不是現價）。',
        footnoteEn: 'Only the names and brief descriptions of the three dishes appear in media reports; the method, portion and serving ware are all this site’s scenario illustration, and this site lists no prices (the 25 yuan in 1961 is a historical record, not a current price).',
        sourceIds: ['foodnext-2020-bolero', 'mirror-2025-bolero', 'gvm-2011-bolero', 'gvm-city-2024-bolero'],
      },
      // 第 8 階段：人物小節（純文字，資料在 wangJingQuanData.js；專案沒有山水亭店家，所以掛在同年代、同一條街的波麗路）
      WANG_JINGQUAN_PERSON_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        tabEn: 'Sources and historical basis',
        title: '文獻與歷史依據',
        titleEn: 'Sources and historical basis',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/bolero.md；維特咖啡與山水亭的資料也在同一份紀錄裡，王井泉與山水亭的查證見 docs/research/wang-jing-quan.md。',
        introEn: 'This shop introduction is compiled from the sources below; select one to open the original web page. The verification record is in the project’s docs/research/bolero.md; the material on the Vite Cafe and Shanshuiting is in the same record, and the verification of Wang Jingquan and Shanshuiting is in docs/research/wang-jing-quan.md.',
        sourceIds: [
          'boch-bolero',
          'gvm-2011-bolero',
          'foodnext-2020-bolero',
          'gvm-city-2024-bolero',
          'mirror-2025-bolero',
          'setn-2020-vite-cafe',
          'newtalk-2024-shanshuiting',
          'nchdb-xinfangchun',
          'wiki-bolero',
          ...WANG_JINGQUAN_SOURCE_IDS.filter((id) => !['newtalk-2024-shanshuiting', 'setn-2020-vite-cafe'].includes(id)),
        ],
        disclaimer:
          `波麗路的店名由來、常客畫家與鴨子飯的研發經過各只有一個來源，本站標明出處並寫「相傳」或「文章提到」；三道代表菜開始販售的年份文獻未載。官方歷史建築登錄的頁面本次未能重新開啟，沿用先前的摘錄。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建，建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。${WANG_JINGQUAN_DISCLAIMER_TEXT}`,
        disclaimerEn:
          `The origin of Bolero’s name, its painter regulars and the development of the duck rice each rest on a single source; this site marks the sources and writes "is said to" or "an article mentions". The years the three signature dishes went on sale are not recorded. The page of the official historic-building registration could not be reopened this time, and the earlier excerpt is used. The 3D street scene on this website is a conceptual reconstruction of the atmosphere of Dadaocheng’s commercial district in each era; building exteriors, signboards, furnishings and shop locations are for imaginative purposes only and are not exact reconstructions. ${WANG_JINGQUAN_DISCLAIMER_TEXT_EN}`,
      },
    ],
  },
  // 慈聖宮：同一座廟、同一個 ID，各年代的名稱、章節、熱點與類型見 eras（由 getShop(id, eraId) 套用）。
  // 酒樓繁華、摩登大稻埕是文化據點（廟的沿革）；庶民生活是廟口的情境示意攤位與四種小吃；老屋新生只寫現況。
  // 查證紀錄：docs/research/ci-sheng-gong-miaokou.md；章節內容在 ciShengMiaokouData.js。
  {
    id: 'ci-sheng-gong',
    name: '慈聖宮',
    nameEn: 'Cisheng Temple',
    kind: 'heritage',

    status: 'open',
    category: '文化據點｜媽祖廟・同安人信仰',
    categoryEn: 'Cultural site | Mazu temple and Tong\'an belief',
    seal: '慈聖',
    sealEn: 'Cisheng',
    address: CI_SHENG_ADDRESS,
    addressEn: CI_SHENG_ADDRESS_EN,
    yearNote: '初建年份各說不一（1855／1864／1866／1869），日治市區改正遷建（1909／1910）、重建完成（1914／1916）兩說並列，一律待核；古蹟身分只有維基百科一個來源，不寫成事實。',
    yearNoteEn: 'Accounts of the temple\'s original founding differ (1855 / 1864 / 1866 / 1869). Two versions are given for the Japanese-era urban-improvement relocation (1909 / 1910) and for the completion of the rebuilding (1914 / 1916); all are to be verified. Its status as a designated monument rests on a single source, Wikipedia, so it is not stated as fact.',
    scenarioNote: '情境示意',
    scenarioNoteEn: 'Scenario illustration',
    sourceIds: ['sinica-gis-2025-cisheng', 'wiki-ci-sheng-gong'],
    summary: '同安人的媽祖廟：1853年頂下郊拚後遷到大稻埕，日治市區改正時再遷到今天保安街49巷的位置（年份各說不一，待核）。街上這座廟是情境示意。',
    summaryEn: 'The Mazu temple of the Tong\'an people. After the Xiajiao clan fight of 1853 they moved to Dadaocheng, and during the Japanese-era urban improvement the temple moved again to its present site on Lane 49, Baoan Street (the years differ between accounts and are to be verified). The temple on the street is a scenario illustration.',
    note: '街上這座廟是情境示意：規模、格局、榕樹與廟埕沿用本站的廟宇原型，相對位置不是精確復原。',
    noteEn: 'The temple on the street is a scenario illustration: its scale, layout, banyan trees and temple forecourt follow this site\'s temple prototype, and relative positions are not an exact reconstruction.',
    position: { x: 4, z: 4.5 },
    facing: 'north',
    interaction: { radius: 5 },
    chapters: CI_SHENG_CHAPTERS.heritage,
    hotspots: hotspotsToWorld(ciShengHotspots('banquet'), templeCourtToWorld),
    eraNotes: CI_SHENG_ERA_NOTES,
    eras: {
      postwar: {
        name: '慈聖宮廟口小吃',
        nameEn: 'Cisheng Temple Forecourt Snacks',
        kind: null,
        category: '廟口小吃｜排骨湯・肉粥・豬腳麵線・四神湯',
        categoryEn: 'Temple-front snacks | pork rib soup, meat congee, pig\'s trotter noodles, Four Herb soup',
        seal: '廟口',
        sealEn: 'Temple front',
        scenarioNote: '歷史情境重建',
        scenarioNoteEn: 'Reconstructed historical scene',
        yearNote: '廟口攤販聚集的年代只有中研院 GIS 專題一句「民國50年間」的說明（待核）；各攤的店名、攤主、年份與傳承代數查無可靠出處，本站不寫。',
        yearNoteEn: 'The period when food stalls gathered at the temple front rests on a single line in the Academia Sinica GIS project, "around the 50th year of the Republic" (to be verified). No reliable source exists for individual stalls\' names, owners, founding years or generations of succession, so this site does not state them.',
        sourceIds: ['sinica-gis-2025-cisheng', 'tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb'],
        summary: '慈聖宮廟埕前的小吃攤（歷史情境重建）：原汁排骨湯、肉粥、豬腳麵線、四神湯四種食物類型，依現在廟口的攤位整理做法特色，不對應任何實際的店家。',
        summaryEn: 'Snack stalls in front of the Cisheng Temple forecourt (reconstructed historical scene): four kinds of food, namely pork rib soup, meat congee, pig\'s trotter noodles and Four Herb soup, with the characteristics of each drawn from the stalls at the temple front today. They do not correspond to any actual shop.',
        chapters: CI_SHENG_CHAPTERS.postwar,
        hotspots: hotspotsToWorld(ciShengHotspots('postwar'), templeCourtToWorld),
      },
      revival: {
        name: '慈聖宮廟口',
        nameEn: 'Cisheng Temple Forecourt',
        kind: null,
        category: '廟口小吃',
        categoryEn: 'Temple-front snacks',
        seal: '廟口',
        sealEn: 'Temple front',
        scenarioNote: null,
        yearNote: '現在廟口的各攤年份、攤主與傳承代數在不同來源裡互相矛盾，本站不寫具名店家。',
        yearNoteEn: 'The founding years, owners and generations of succession of today\'s stalls contradict one another across sources, so this site does not name individual shops.',
        sourceIds: ['tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb'],
        summary: '保安街49巷的慈聖宮廟口，現在仍有排骨湯、肉粥、豬腳麵線、四神湯這類小吃攤；本站不寫任何具名的店家。',
        summaryEn: 'At Cisheng Temple on Lane 49, Baoan Street, snack stalls selling pork rib soup, meat congee, pig\'s trotter noodles and Four Herb soup can still be found today; this site does not name any individual shop.',
        chapters: CI_SHENG_CHAPTERS.revival,
        hotspots: hotspotsToWorld(ciShengHotspots('revival'), templeCourtToWorld),
      },
    },
    building: {
      archetype: 'temple',
      width: 12,
      depth: 16,
      sign: { text: '慈聖宮', style: 'gold' },
    },
    // 慈聖宮於日治時期遷建於此，因此清末時期這個地段仍是一般街屋
    buildingByEra: {
      banquet: { condition: 'mature', stalls: false },
      modern: { condition: 'mature', stalls: false },
      // 戰後：廟埕西側的前緣另有魷魚羹攤（temple-squid-stall），西側榕樹在攤位上方留出空間；
      // 東側的前緣是米苔目攤（temple-mi-tai-mu-stall，取代那裡原本的一般小吃攤），東側榕樹也讓出空間；
      // 廟埕後段、天公爐兩側是豆花攤（西，temple-douhua-stall）與糕粿攤（東，temple-kueh-stall），取代榕樹後方原本的兩個一般小吃攤
      postwar: {
        condition: 'aged',
        stalls: true,
        clearing: [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing],
        eastClearing: [MI_TAI_MU_STALL.clearing, KUEH_STALL.clearing],
        frontStall: false,
        sideStalls: false,
        // 共用桌椅集中在中央通道西側的用餐區（豆花攤的客人也坐這裡），天公爐與桌椅之間留出走到豆花攤的路
        sharedTables: TEMPLE_DINING.tables,
        // 廟埕後段的跟隨鏡頭與觀賞模式的範圍（見 builders/specials.js）
        courtCamera: true,
      },
      revival: { condition: 'restored', stalls: true },
    },
  },
  // 迪化街一段329號店屋：同一棟建築、同一個 ID，各年代的名稱、章節、熱點與狀態見 eras（由 getShop(id, eraId) 套用）
  {
    id: RICE_AND_SHINE_ID,
    name: '迪化街329號店屋',
    nameEn: '329 Dihua Street Shophouse',
    status: 'open',
    category: '米業店屋・歷史建築',
    categoryEn: 'Rice-trade shophouse | Historic building',
    seal: '稻米',
    sealEn: 'Rice',
    address: RICE_RECORD.address,
    addressEn: RICE_RECORD.addressEn,
    summary: '大稻埕北街的米業店屋：同一棟建築從米行、碾米間、戰後的住家與倉庫，到老屋再生的稻舍。',
    summaryEn: {
      banquet: '1895–1930: Shophouses at the north end of the street begin to be used for the rice trade (historical scene illustration). There is no "Rice & Shine" (稻舍) yet, and the building does not yet have today\'s red-brick arcade facade.',
      modern: '1930–1945: No. 329, with its red-brick arches, serves as a rice shop and rice mill (historical scene illustration).',
      postwar: '1945–1980: The same shophouse ages as the rice trade changes; part of it becomes a home and warehouse (historical scene illustration).',
      revival: '2000–present: The historic building is revitalised as Rice & Shine (稻舍). Its exterior and interior are modelled from supplied photographs, with estimated dimensions.',
    },
    sourceIds: ['moc-329-shophouse', 'taiwannews-2022-rice-shine'],
    hasInterior: true,
    position: { ...RS.position },
    facing: 'north',
    interaction: { radius: 1.0, distance: 1.0 },
    travelYawOffset: 0.35,
    camera: { distance: 6.2, height: 2.2, side: -1.4, lookHeight: 3.2 },
    building: { archetype: 'rice-and-shine', width: RS.half * 2, depth: RS.depth },
    // 1853 不設定（這塊地是一般街屋）；1895 起才有米業的版本
    buildingByEra: {
      banquet: { variant: 'earlyRiceTrade', condition: 'mature' },
      modern: { variant: 'riceMill', condition: 'mature' },
      postwar: { variant: 'postwarRiceHouse', condition: 'aged' },
      revival: { variant: 'riceAndShineModern', condition: 'restored' },
    },
    eraNotes: RICE_ERA_NOTES,
    eras: Object.fromEntries(
      Object.values(riceAndShineEraConfig)
        .filter((item) => item.active)
        .map((item) => [
          item.era,
          {
            name: item.name,
            nameEn: item.nameEn,
            eraLabel: item.label,
            eraLabelEn: item.labelEn,
            scenarioNote: item.era === 'revival' ? null : '歷史情境示意',
            scenarioNoteEn: item.era === 'revival' ? null : 'Historical scenario illustration',
            variant: item.variant,
            category: item.era === 'revival' ? '米食料理・稻米文化・歷史建築' : item.era === 'banquet' ? '北街米業（米商・碾米）' : item.era === 'modern' ? '米行・碾米間' : '米行・住家與倉庫',
            categoryEn: item.era === 'revival' ? 'Rice dishes | Rice culture | Historic building' : item.era === 'banquet' ? 'North Street rice trade (rice merchants and milling)' : item.era === 'modern' ? 'Rice shop and rice mill' : 'Rice shop, home and warehouse',
            seal: item.era === 'revival' ? '稻舍' : '米',
            sealEn: item.era === 'revival' ? 'Rice & Shine' : 'Rice',
            summary: RICE_ERA_NOTES[item.era],
            summaryEn: RICE_ERA_NOTES[item.era + 'En'],
            yearLabel: item.era === 'revival' ? '2020年登錄歷史建築' : '',
            yearLabelEn: item.era === 'revival' ? 'Registered as a historic building in 2020' : '',
            yearNote: '資料記載的建立年代是1907年，2020年4月28日登錄為臺北市歷史建築；唐益興米行1916年創立（2022年報導）。',
            yearNoteEn: 'Records give the construction date as 1907, and it was registered as a Taipei City historic building on 28 April 2020; the Tang Yixing rice shop was founded in 1916 (per a 2022 report).',
            chapters: RICE_CHAPTERS[item.era],
            hotspots: hotspotsToWorld(RICE_HOTSPOTS[item.variant], riceToWorld),
            position: riceToWorld(RICE_HOTSPOTS[item.variant][0].point[0], 0),
            interaction: { radius: 1.0, distance: RICE_HOTSPOTS[item.variant][0].point[1] },
          },
        ]),
    ),
  },
  // 十字軒糕餅舖（延平北路二段68號）：同一個店家 ID、同一個地段，隨年代替換立面、招牌、擺設與室內（見 getShop(id, eraId)）
  {
    id: SHIZIXUAN_ID,
    name: '十字軒糕餅舖',
    nameEn: 'Shizixuan Pastry Shop',
    status: 'open',
    category: '糕餅鋪・歷史老店',
    categoryEn: 'Pastry shop | Long-established shop',
    seal: '十字軒',
    sealEn: 'Shizixuan',
    address: SZX_RECORD.address,
    addressEn: SZX_RECORD.addressEn,
    summary: '延平北路二段的糕餅老店：從窄身的糕餅店初創、戰後擴大為兩個店面寬的餅舖，到現在三層樓的十字軒糕餅舖。',
    summaryEn: 'A long-established pastry shop on Section 2 of Yanping North Road: from a narrow pastry shop at its beginning, through a postwar expansion to a cake shop two shopfronts wide, to today\'s three-storey Shizixuan Pastry Shop.',
    sourceIds: SZX_RECORD.sourceIds,
    hasInterior: true,
    site: { ...WIDE_SITE },
    facing: 'south',
    position: szxToWorld(WIDE_SITE, 0, 0),
    interaction: { radius: 1.0, distance: 1.0 },
    travelYawOffset: 0.3,
    camera: { distance: 6.0, height: 2.0, side: 0, lookHeight: 2.4 },
    building: { archetype: 'shizixuan', width: MODERN.half * 2, depth: MODERN.depth },
    buildingByEra: {
      modern: { variant: 'earlyShop', condition: 'mature', width: EARLY.half * 2, depth: EARLY.depth },
      postwar: { variant: 'postwarShop', condition: 'aged', width: POSTWAR.half * 2, depth: POSTWAR.depth },
      revival: { variant: 'modernShop', condition: 'restored', width: MODERN.half * 2, depth: MODERN.depth },
    },
    eraNotes: SZX_ERA_NOTES,
    eras: Object.fromEntries(
      Object.values(shizixuanEraConfig)
        .filter((item) => item.active)
        .map((item) => {
          const site = item.variant === 'earlyShop' ? EARLY_SITE : WIDE_SITE
          const toWorld = (x, z) => szxToWorld(site, x, z)
          return [
            item.era,
            {
              name: item.name,
              nameEn: item.nameEn,
              eraLabel: item.label,
              eraLabelEn: item.labelEn,
              scenarioNote: item.era === 'revival' ? null : '歷史情境示意',
              scenarioNoteEn: item.era === 'revival' ? null : 'Historical scenario illustration',
              variant: item.variant,
              category: item.era === 'revival' ? '糕餅鋪・歷史老店' : item.era === 'modern' ? '糕餅店（初創）' : '漢餅・祭祀糕點',
              categoryEn: item.era === 'revival' ? 'Pastry shop | Long-established shop' : item.era === 'modern' ? 'Pastry shop (early years)' : 'Han-style cakes and ritual pastries',
              seal: item.era === 'revival' ? '十字軒' : '餅',
              sealEn: item.era === 'revival' ? 'Shizixuan' : 'Cakes',
              summary: SZX_ERA_NOTES[item.era],
              summaryEn: SZX_ERA_NOTES[item.era + 'En'],
              chapters: SZX_CHAPTERS[item.era],
              hotspots: hotspotsToWorld(SZX_HOTSPOTS[item.variant], toWorld),
              site,
              position: toWorld(SZX_HOTSPOTS[item.variant][0].point[0], 0),
              interaction: { radius: 1.0, distance: 1.0 },
            },
          ]
        }),
    ),
  },
]

/**
 * 介面上顯示的年份：史料記載不一時使用 yearLabel（例如「1917年（一說1921年）」），
 * 不自行認定單一年份。
 */
export function shopYearText(shop, lang = 'zh-Hant') {
  if (lang === 'en') return shop?.yearLabelEn || (shop?.yearLabel && !/[\u3400-\u9fff]/.test(shop.yearLabel) ? shop.yearLabel : '') || (shop?.year ? String(shop.year) : '')
  if (shop?.yearLabel) return shop.yearLabel
  return shop?.year ? `${shop.year}年` : ''
}

/**
 * 店家在某個年代的樣子：有 eras 的店家（例如迪化街329號店屋）在不同年代有不同的名稱、章節、熱點與狀態，
 * 同一個 ID、同一棟建築。回傳的物件會快取，同一個年代每次都是同一個物件（互動位置的快取依物件區分）。
 */
const eraShopCache = new Map()
export function shopForEra(shop, eraId) {
  if (!shop?.eras || !eraId) return shop
  const key = `${shop.id}@${eraId}`
  if (!eraShopCache.has(key)) {
    const override = shop.eras[eraId]
    eraShopCache.set(key, override ? { ...shop, ...override, era: eraId } : shop)
  }
  return eraShopCache.get(key)
}

export function getShop(id, eraId = null) {
  const shop = SHOPS.find((item) => item.id === id) ?? null
  return eraId ? shopForEra(shop, eraId) : shop
}

/** 飲食主題（例如「魷魚羹飲食文化」：兩個年代各一個版本，只以主題串連） */
/**
 * 茶的主線：貫穿五個年代的主題。versions 是每個年代的代表店家（清末的外銷起點、日治的包種茶外銷、
 * 1930 年代的茶工廠、戰後的批發茶行、現在的古蹟茶葉故事館）；members 列出所有屬於這條主線的店家，
 * 同一家店可以出現在好幾個年代（例如林華泰在五個年代都有）。
 */
export const TEA_THEME = {
  id: 'tea',
  title: '大稻埕的茶',
  titleEn: 'Tea of Dadaocheng',
  versions: {
    'qing-port': 'dodd-tea-house',
    banquet: 'you-ji',
    modern: 'xin-fang-chun',
    postwar: 'lin-hua-tai',
    revival: 'xin-fang-chun',
  },
  members: ['dodd-tea-house', 'lin-hua-tai', 'you-ji', 'xin-fang-chun'],
}

const THEMES = {
  [TEA_THEME.id]: TEA_THEME,
  [SQUID_SOUP_THEME.id]: SQUID_SOUP_THEME,
  [MI_TAI_MU_THEME.id]: MI_TAI_MU_THEME,
  [DOUHUA_THEME.id]: DOUHUA_THEME,
  [KUEH_THEME.id]: KUEH_THEME,
}

export function getTheme(id) {
  return THEMES[id] ?? null
}

/** 同一個飲食主題在其他年代的版本（年代 id 與店家），不包含自己 */
export function getThemeVersions(shop) {
  const theme = getTheme(shop?.theme)
  if (!theme) return []
  return Object.entries(theme.versions)
    .filter(([, id]) => id !== shop.id)
    .map(([eraId, id]) => ({ eraId, shop: getShop(id) }))
}

/**
 * 同一個飲食主題的現代相關店家（例如廟口豆花攤 → 2000–現在的導演的豆花店）：只是同類食物的參訪對照，
 * 沒有品牌傳承關係；回傳年代 id、店家與關係的說明
 */
export function getThemeRelated(shop) {
  const theme = getTheme(shop?.theme)
  return (theme?.related ?? []).map(({ eraId, shopId, place, relation }) => ({
    eraId,
    shop: shopId ? getShop(shopId) : null,
    // 沒有店家條目、也沒有 3D 模型的現代店家（只有文字介紹）
    place: place ?? null,
    relation,
  }))
}

/**
 * 同一條主線的其他成員店家（例如茶的主線：寶順洋行、林華泰、有記、新芳春），不包含自己；
 * 每一家附上它出現的年代（buildingByEra 的年代順序）。沒有 members 的主題回傳空陣列。
 */
export function getThemeMembers(shop) {
  const theme = getTheme(shop?.theme)
  if (!theme?.members) return []
  return theme.members
    .filter((id) => id !== shop.id)
    .map((id) => ({ shop: getShop(id), eraIds: Object.keys(getShop(id)?.buildingByEra ?? {}) }))
    .filter((item) => item.shop)
}

/** 某個年代出現在街上的店家（依 eras.js 的 availableStores 排序） */
export function getShopsByEra(era) {
  return (era?.availableStores ?? []).map((id) => getShop(id, era.id)).filter(Boolean)
}

/** 店家在某個年代的建築設定（共用外觀＋該年代差異）；該年代沒有特殊建築時回傳 null */
export function getShopBuilding(shop, eraId) {
  const override = shop.buildingByEra?.[eraId]
  if (!override) return null
  return { ...shop.building, ...override }
}
