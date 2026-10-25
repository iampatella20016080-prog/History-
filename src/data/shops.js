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
import { MUSEUM_RECORD, ORGANIZATIONS, PENDING, PHOTO_OBSERVATIONS, SCENARIO_DESIGN } from './huangYujieMuseum.js'
import { ACTION_BAR_SITE } from './actionBarLayout.js'
import { LI_TING_XIANG_ID, LI_TING_XIANG_SOURCE_IDS, LTX_CHAPTERS, LTX_ERA_NOTES, LTX_YEAR_NOTE } from './liTingXiangData.js'
import { CI_SHENG_ADDRESS, CI_SHENG_CHAPTERS, CI_SHENG_ERA_NOTES, ciShengHotspots } from './ciShengMiaokouData.js'
import {
  NIANHUO_CHAPTER,
  NIANHUO_DISCLAIMER_TEXT,
  NIANHUO_SOURCE_IDS,
  NANBEI_BACKGROUND_CHAPTER,
  XIA_ER_ZUI_CHAPTER,
  XIA_ER_ZUI_DISCLAIMER,
} from './dihuaNianhuoData.js'
import {
  XIYUAN_VENUE_CHAPTER,
  XIYUAN_HISTORY_CHAPTER,
  XIKU_BACKGROUND_CHAPTER,
  XIYUAN_SOURCE_IDS,
  XIYUAN_DISCLAIMER_TEXT,
} from './xiyuanData.js'
import { LI_CHUNSHENG_DISCLAIMER_TEXT, LI_CHUNSHENG_PERSON_CHAPTER, LI_CHUNSHENG_SOURCE_IDS } from './liChunShengData.js'
import { JIANG_WEISHUI_DISCLAIMER_TEXT, JIANG_WEISHUI_PERSON_CHAPTER, JIANG_WEISHUI_SOURCE_IDS } from './jiangWeiShuiData.js'
import { WANG_JINGQUAN_DISCLAIMER_TEXT, WANG_JINGQUAN_PERSON_CHAPTER, WANG_JINGQUAN_SOURCE_IDS } from './wangJingQuanData.js'
import {
  OPERATORS_POSTWAR_CHAPTER,
  OPERATORS_POSTWAR_DISCLAIMER_TEXT,
  OPERATORS_REVIVAL_CHAPTER,
  OPERATORS_REVIVAL_DISCLAIMER_TEXT,
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
    eras: { postwar: { chapters: withOperatorsChapter(chapters, OPERATORS_POSTWAR_CHAPTER, OPERATORS_POSTWAR_DISCLAIMER_TEXT) } },
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
    note: hotspot.note,
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
    status: 'open',
    year: 1853,
    category: '南北貨商號',
    seal: '南北貨', // 介紹視窗左上角的印章文字
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
      banquet:
        '日治時期，家族結合復振、復源兩家店號的第二個字，以「林振源」為商號名稱，從事南北貨及海陸物產進口貿易；1915年，店東林子詵曾致函長崎泰益號，處理冬菇等貨品在海運途中受潮的海損理賠。',
      modern:
        '昭和年間林子詵過世後，其子林欽英、林欽典分號經營，店名分別為「復振英記」與「復振商店」；1933年，復振英記曾致函泰益號，懇請定期告知海產什貨的行情。',
      postwar:
        '林欽典一脈所傳承的商行，向來以南北雜貨為主要營業項目。此時期的招牌樣貌未見於本站引用的文獻，場景以「南北雜貨」示意。',
      revival:
        '今日迪化街上的林復振商行由林欽典所傳承，以南北雜貨為主要營業項目；1980年代也跨足喜餅禮盒，並以祖輩老店號「林振源」成立子公司經營喜餅業務。',
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
        title: '大稻埕的形成',
        lead: '1853年，艋舺發生頂下郊拚，部分泉州同安人遷往大稻埕，逐漸建立新的商業聚落。',
        paragraphs: [
          '「頂下郊拚」是泉州三邑郊商與同安籍郊商之間的械鬥。落敗的下郊同安人，在領袖林右藻的帶領下，輾轉移居當時仍為荒埔村落的大稻埕。',
          '移居者在此落腳並開設商號，原本的荒埔逐漸發展成新的商業聚落。',
        ],
        timeline: [
          { place: '艋舺', text: '1853年，泉州三邑郊商與同安籍郊商爆發械鬥「頂下郊拚」。' },
          { place: '遷徙', text: '落敗的下郊同安人，由領袖林右藻率眾輾轉移居。' },
          { place: '大稻埕', text: '在仍為荒埔村落的大稻埕開設商號，逐漸形成商業聚落。' },
        ],
        glossary: [
          {
            term: '郊',
            definition:
              '清代臺灣從事兩岸貿易的商人所組成的同業組織，常依往來地區命名，例如泉郊、廈郊、北郊。',
          },
          { term: '拚', definition: '拚鬥、爭鬥之意；「頂下郊拚」即郊商群體之間的械鬥。' },
        ],
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '林復振的歷史',
        title: '林復振的歷史',
        lead: '林右藻家族在大稻埕建立復振、復源、復興等商號，與大稻埕早期商業發展有密切關係。',
        paragraphs: [
          '林右藻被稱為「大稻埕開基人物」。家族為福建泉州同安籍移民，約於道光年間渡臺，原在艋舺地區經商；頂下郊拚後率眾移居大稻埕，並在此開設「復振」、「復源」、「復興」三間商號。',
          '林右藻曾親往香港、福建、廈門等地招商貿易，在大稻埕組織廈郊「金同順」，其後更聯合艋舺泉郊「金晉順」、北郊「金萬利」等共同經商，並擔任三郊總長。',
          '日治時期，家族商號交由子侄輩打理。由於部分子孫轉業或遷居他處，僅存侄孫輩經營的「林復振商行」延續至今。',
        ],
        seals: ['復振', '復源', '復興'],
        facts: [
          { label: '創設', value: '林右藻及其家族' },
          { label: '原籍', value: '福建泉州同安' },
          { label: '商號', value: '復振．復源．復興' },
          { label: '商業組織', value: '組織廈郊「金同順」，並擔任三郊總長' },
        ],
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食物',
        title: '代表食物｜南北貨',
        intro:
          '南北貨泛指來自各地、經乾燥或醃漬處理，便於保存與長途運送的食材與雜貨。以下圖鑑介紹南北貨的代表品項。',
        items: [
          {
            id: 'shiitake',
            name: '香菇',
            category: '山產｜菇類',
            description:
              '香菇乾燥後香氣更為濃郁，也更耐保存與運送，是燉湯、滷味與年節料理中常見的提味食材。',
            note: '1915年，林振源號（林復振家族於日治時期使用的商號）訂購的「對州魷」與「冬菇」在海運途中受潮，店東林子詵因此致函長崎泰益號處理海損理賠。',
          },
          {
            id: 'dried-shrimp',
            name: '蝦米',
            category: '海味｜蝦類',
            description:
              '小型的蝦經煮熟、曬乾後去殼製成，體積小而鮮味濃，常用於爆香、炒菜，以及油飯、粽子等料理。',
          },
          {
            id: 'mullet-roe',
            name: '烏魚子',
            category: '海味｜魚卵',
            description:
              '以烏魚的卵經鹽漬、整形、壓製與日曬製成，色澤琥珀橙紅，是冬季烏魚季的代表性海味，也常作為年節贈禮。',
          },
          {
            id: 'dried-goods',
            name: '乾貨',
            category: '南北貨總稱',
            description:
              '泛指經日曬、風乾或鹽漬處理的食材，如干貝、魷魚、金針、木耳等，便於長途運送與儲藏。',
            note: '1933年，復振英記致函長崎泰益號，除說明分號情形，也懇請對方定期告知海產什貨的行情。',
          },
        ],
        footnote:
          '標示「文獻小記」的內容整理自〈林復振商行〉；其餘為南北貨品項的一般介紹，並非林復振的實際貨品清單。',
        sourceIds: ['ith-lin-fu-zhen'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。',
        sourceIds: ['ith-lin-fu-zhen'],
        disclaimer:
          '本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。',
      },
    ]),
  },

  {
    id: 'zi-yang',
    name: '滋養豆餡舖',
    status: 'open',
    year: 1953,
    category: '和菓子・糕餅・伴手禮',
    seal: '和菓子',
    summary:
      '1953年創立於南京西路的老店，以自家熬煮的豆餡製作和菓子與糕餅；後來才遷入迪化街與涼州街口的紅磚洋樓。',

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
        paragraphs: [
          '依滋養官方網站〈商店簡介〉，滋養「創立於1953年 原址為南京西路」，當年以「滋養食品」之名草創，「首開洋食西點之例」。2021年《料理．台灣》的專訪則記載，滋養成立之初「原本是家兼賣雜貨與麵包的小店」。兩份資料的描述角度不同，這裡一併列出。',
          '製菓技術方面，官網記載店家引進日本製菓技術、到京都拜師習藝，鑽研道地的和菓子手藝；專訪則記載，1961年起由第二代接手，開始製作和菓子。',
          '專訪提到，店名取自「食物天然，最宜滋養」的原則；滋養從早年就堅持「餡料親製」，每天早起熬製豆餡，紅豆餡選用屏東萬丹、比平常小一號的8號紅豆。',
          '同一篇專訪（2021年）記載：原址面臨都市更新，原本打算就此收掉，最後一刻得知有機會承租迪化街現在的店面，第三代林濬彤決定接手——滋養因此從經營了六十多年的南西圓環商圈，遷入大稻埕。',
        ],
        timeline: [
          { place: '南京西路', text: '1953年創立，以「滋養食品」之名開業，原址位於南京西路（南西圓環商圈一帶）。' },
          { place: '和菓子', text: '引進日本製菓技術；1961年起由第二代接手，開始製作和菓子。' },
          { place: '迪化街', text: '原址面臨都市更新，第三代林濬彤接手，承租迪化街一段247號的轉角店面。' },
        ],
        facts: [
          { label: '店名', value: '滋養豆餡舖（滋養製菓）' },
          { label: '創立', value: '1953年，原址南京西路' },
          { label: '現址', value: '臺北市大同區迪化街一段247號（迪化街與涼州街口）' },
          { label: '營業', value: '和菓子、糕餅與伴手禮禮盒' },
        ],
        glossary: [
          { term: '和菓子', definition: '日本傳統點心的總稱，常以豆餡、米與糯米製品、寒天等製作，造型與口味隨季節變化。' },
          { term: '豆餡', definition: '紅豆、白豆等豆類煮熟後加糖熬煉成的內餡，是和菓子與許多糕餅的基礎。' },
        ],
        sourceIds: ['ziyang-about', 'ryori-taiwan-ziyang'],
      },
      {
        id: 'architecture',
        type: 'text',
        tab: '建築特色',
        title: '建築特色｜轉角的紅磚洋樓',
        lead: '今日的滋養位在迪化街與涼州街口，是一棟二層樓的轉角街屋：灰色洗石子立面、紅磚柱與水平紅磚飾帶，屋頂上方是有渦卷紋與球形飾物的山牆。',
        // 實地拍攝的照片（3D 建築的建模依據）
        figures: [
          { id: 'zi-yang-corner', caption: '迪化街與涼州街口：轉角立面與沿涼州街延伸的連棟立面（實地拍攝）' },
          { id: 'zi-yang-facade', caption: '斜切的轉角立面：紅磚柱、三扇長窗、鐵欄杆與「滋養豆餡舖」橫帶（實地拍攝）' },
          { id: 'zi-yang-storefront', caption: '騎樓下的店面：黑色遮雨棚、淺色木作、石材與玻璃櫥窗（實地拍攝）' },
        ],
        paragraphs: [
          '轉角以斜切的立面面向路口，左右兩根紅磚柱一路延伸到屋頂，柱頂立著層疊的圓球裝飾；中央山牆兩側是渦卷紋，最高處是一顆大圓球。二樓三扇長窗配木窗框，窗下是鐵欄杆；灰色牆面與紅磚交錯成一道道水平飾帶，一樓上方的橫帶嵌著「滋養豆餡舖」五個黑字。',
          '一樓是連續的騎樓（亭仔腳），柱與楣樑交接處有弧形托座。騎樓沿著迪化街與涼州街兩側延伸，涼州街一側還連著好幾開間相同風格、各有小山牆的立面。',
          '旅遊媒體形容這裡「店鋪的外觀是相當標準的大稻埕街屋型態，有日治的洋樓古典風格，也有巴洛克浪漫的氣息」，「紅磚牆注入了歷史痕跡，高高牌樓更顯氣派」。',
          '老屋新生之後，一樓以黑色遮雨棚、淺色木作、灰色石材與大片玻璃櫥窗組成現代店面，門口掛著白色暖簾。《料理．台灣》形容店內是「紅磚洋樓和木造空間」，搭配塌塌米矮几、青花瓷茶具與鑄鐵壺。',
          '請注意：本站沒有查到這棟建築的興建年代與文化資產身分，因此不標示建築年代；這棟建築也不是滋養1953年的原始店面——滋養創立時位於南京西路，遷入這裡是後來的事。',
        ],
        facts: [
          { label: '位置', value: '迪化街與涼州街轉角' },
          { label: '形式', value: '二層樓轉角街屋，斜切轉角立面' },
          { label: '立面', value: '灰色洗石子、紅磚柱與水平紅磚飾帶' },
          { label: '裝飾', value: '渦卷紋山牆、球形飾物、鐵欄杆、騎樓弧形托座' },
          { label: '興建年代', value: '未查證（本站未找到可靠資料）' },
        ],
        sourceIds: ['supertaste-ziyang', 'ryori-taiwan-ziyang'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食品',
        title: '代表食品｜和菓子與糕餅',
        intro: '滋養的商品以自家熬煮的豆餡為核心。以下圖鑑介紹店內的幾樣代表品項。',
        items: [
          {
            id: 'strawberry-daifuku',
            name: '草莓大福',
            category: '季節限定｜麻糬',
            description: '把紅豆大福從中間切開，在露出的紅豆餡上放半粒鮮紅草莓，是每年冬春之際的期間限定商品。',
            note: '《料理．台灣》（2021）記載：草莓大福是第三代林濬彤推出的新產品，每年只賣約三個月、12月上市，選用「豐香草莓」。',
          },
          {
            id: 'monaka',
            name: '最中',
            category: '和菓子｜米菓皮',
            description: '以糯米燒製的酥脆餅皮，包入紅豆餡。專訪記載店內四季都有紅豆餡的最中。',
            note: '食尚玩家的介紹提到，滋養的最中「每一份都是費心現點現做，而且採用與日本一致的作法」。',
          },
          {
            id: 'dorayaki',
            name: '銅鑼燒',
            category: '和菓子｜燒菓子',
            description: '兩片鬆軟的餅皮夾入紅豆餡，是一年四季都吃得到的經典和菓子。',
            note: '專訪提到，滋養把銅鑼燒「從手掌大縮小成為掌心尺寸」，從吃粗飽變成吃精巧。',
          },
          {
            id: 'yokan',
            name: '羊羹',
            category: '和菓子｜煉菓子',
            description: '以豆餡加入寒天熬煉、凝固而成的條狀和菓子，切片後口感細緻，耐保存，也常作為伴手禮。',
          },
          {
            id: 'pineapple-cake',
            name: '鳳梨酥',
            category: '糕餅｜伴手禮',
            description: '臺灣代表性的伴手禮糕餅：酥鬆的餅皮包著鳳梨內餡。',
            note: '專訪記載，滋養堅持混合冬瓜餡的傳統鳳梨餡，但把餅皮解構成兩片長方形酥餅、塗上白巧克力隔絕濕氣，做成「鳳梨夾心餅」。',
          },
        ],
        footnote: '標示「文獻小記」的內容整理自所列資料；其餘為品項的一般介紹。季節商品與品項以店家實際供應為準。',
        sourceIds: ['ryori-taiwan-ziyang', 'supertaste-ziyang', 'ziyang-about'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        title: '參考文獻',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。',
        sourceIds: ['ziyang-about', 'ryori-taiwan-ziyang', 'supertaste-ziyang'],
        disclaimer:
          '滋養豆餡舖的 3D 建築依實地拍攝的照片建模：轉角立面、山牆、紅磚柱、窗戶與騎樓的比例由照片估算，並為了配合遊戲街道略為調整，未知的尺寸並非精確測量；涼州街一側只做出三個開間。店內陳設為淺層的示意，並非實際擺設。',
      },
    ],
  },

  {
    id: 'yong-le-market',
    name: '永樂市場',
    status: 'open',
    year: 1908,
    yearLabel: '1908年（現有大樓1985年開業）',
    yearNote: '市場的起源是1908年；現在的市場大樓於1982年拆除舊市場後改建，1985年開業。',
    category: '公有市場・布業商場',
    seal: '市場',
    summary: '1908年設立的公有市場；現在的大樓於1982年拆除舊市場後改建、1985年開業，一樓是生鮮與日用品攤位，二、三樓是布業商場。',

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
        paragraphs: [
          '依《臺北市志》（國家圖書館「臺灣記憶」收錄的說明），1897年位於六館街（今南京西路西端）的大稻埕市場落成，1908年（明治41年）改設於大稻埕蘆竹腳街，1933年（昭和8年）改名為永樂町市場。臺北市市場處的介紹則寫道，市場「民國前4年成立，稱為「公設永樂町食料品小賣市場」」。兩份資料對當時名稱的記載不同，這裡一併列出。',
          '1995年《聯合報》的報導記載，市場成立於1908年12月14日，「最早的永樂市場是純木造的平房，環境衛生條件都差」。',
          '同一篇報導引述市場的資料：「在民國七十一年三月拆除舊建築改建新屋，再於民國七十四年九月完工、同年十月八日重新開業。」臺北市市場處也記載，民國71年原市場拆除，「改建綜合大樓安置原攤商，74年開業」。',
          '新大樓「地上九樓、地下兩層」，開業時一樓經營魚肉、蔬果與雜貨，二、三樓是布匹業者，四樓是飲食類。臺北市政府的市集資訊介紹，現在的永樂市場「1樓生鮮蔬果日用品，2.3樓布匹窗簾飾布買賣縫製，是全台布業零售、批發中心」。',
          '請注意：場景中的建築是現在的市場大樓（1985年開業），依實地照片建模；1908年的市場是另一棟早已拆除的平房建築，並不是眼前這棟大樓。',
        ],
        timeline: [
          { place: '1897', text: '大稻埕市場在六館街（今南京西路西端）落成開張。' },
          { place: '1908', text: '改設於大稻埕蘆竹腳街（市場處記載為「民國前4年成立」）。' },
          { place: '1933', text: '大稻埕市場改名為永樂町市場（依《臺北市志》）。' },
          { place: '1982', text: '3月拆除舊市場，原地改建綜合大樓。' },
          { place: '1985', text: '9月完工，10月8日重新開業。' },
        ],
        facts: [
          { label: '地址', value: '臺北市大同區迪化街一段21號' },
          { label: '起源', value: '1908年（明治41年）' },
          { label: '現有大樓', value: '1982年拆除舊市場改建，1985年開業' },
          { label: '樓層', value: '一樓生鮮蔬果日用品；二、三樓布匹窗簾飾布（市集資訊）' },
        ],
        sourceIds: ['ncl-yongle-market', 'tcma-yongle-market', 'udn-1995-yongle-market', 'taipei-market-info-yongle'],
      },
      {
        id: 'building',
        type: 'text',
        tab: '市場大樓',
        title: '市場大樓｜可以走進去的一樓市場',
        lead: '迪化街的街底是永樂市場大樓：一樓的騎樓與大門通往市場，二樓正面是「永樂布業商場」的大招牌。',
        paragraphs: [
          '場景中的大樓依實地照片建模：一樓是粉灰色石材方柱的騎樓與玻璃大門，二樓有紅磚女兒牆與花崗石壓頂，正中央是深色外框的「永樂布業商場」招牌；三樓以上退縮，是深色的玻璃帷幕與紅磚量體。尺寸由照片估算，並非測量。',
          '從迪化街走進大門，就到了一樓市場：中央走道兩側各有四個攤位，天花板上是日光燈、電纜線槽與管線，還有指示門口方向的吊牌。這個平面是簡化的概念配置，並非精確復原；除了好粿緣之外，攤位招牌只用一般的品項字，不代表實際的店家或位置。',
          '好粿緣在走道北側的第二個攤位（攤位編號1020）。走到攤位前，電腦按 E、iPad 點攤位，就能閱讀好粿緣的介紹。二樓以上目前只做出外觀。',
        ],
        facts: [
          { label: '一樓', value: '門廳、中央走道、八個攤位、走道盡頭（概念配置）' },
          { label: '二樓以上', value: '只做外觀，尚未開放' },
          { label: '依據', value: '2026年實地照片（尺寸為估算）' },
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
        sourceIds: [
          ...new Set(['tcma-yongle-market', 'taipei-market-info-yongle', 'ncl-yongle-market', 'udn-1995-yongle-market', ...NIANHUO_SOURCE_IDS, ...OPERATORS_REVIVAL_SOURCE_IDS, ...XIYUAN_SOURCE_IDS]),
        ],
        disclaimer:
          `永樂市場大樓的 3D 外觀依實地照片建模，比例為估算；一樓市場的平面是簡化的概念配置，攤位數量、位置與陳設都不是精確復原。${NIANHUO_DISCLAIMER_TEXT}${OPERATORS_REVIVAL_DISCLAIMER_TEXT}${XIYUAN_DISCLAIMER_TEXT}`,
      },
    ],
  },
  {
    id: 'hao-guo-yuan',
    name: '好粿緣',
    status: 'open',
    category: '傳統米食・粿',
    seal: '粿',
    summary: '永樂市場一樓的米食攤位（攤位編號1020），販售草仔粿、紅龜粿、芋粿巧、蘿蔔糕等傳統的粿。',

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
    },
    camera: { distance: 3.1, height: 2.05, side: -2.3, lookHeight: 1.55 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'about',
        type: 'text',
        tab: '店家介紹',
        title: '店家介紹｜永樂市場一樓的粿攤',
        lead: '好粿緣是永樂市場一樓的米食攤位，鮮綠色招牌上寫著店名，攤位牌上的編號是1020。',
        paragraphs: [
          '永樂市場位在迪化街一段21號，起源於1908年，現在的市場大樓於1985年開業。臺北市政府的市集資訊介紹，市場一樓是「生鮮蔬果日用品」，二、三樓是布匹窗簾飾布的買賣與縫製。好粿緣就在一樓的攤位之間。',
          '依實地拍攝時攤位上的價目表與品名牌：草仔粿有香菇肉、菜脯米等鹹口味，以及芝麻、花生、紅豆等甜口味；另外還有紅龜粿與艾草龜粿、芋粿巧、蘿蔔糕、紫米糕等米食，分裝在透明袋與盒子裡，擺在木製的托盤上。品項與口味會隨時間調整，實際以店家供應為準。',
          '這些粿過去常在家裡為年節與祭祀準備：農業部的〈年糕＆蘿蔔糕〉就記錄了過年前在家做菜頭粿、甜粿、發糕等糕點的情景。今天在市場的粿攤，平日也買得到這些米食。',
          '本站沒有找到介紹好粿緣的新聞報導或店史資料，因此不寫創立年份、創辦人或配方。',
        ],
        facts: [
          { label: '位置', value: '永樂市場一樓（攤位編號1020）' },
          { label: '地址', value: '臺北市大同區迪化街一段21號（永樂市場）' },
          { label: '品項', value: '草仔粿、紅龜粿、芋粿巧、蘿蔔糕、紫米糕等' },
          { label: '創立年份', value: '未查得資料' },
        ],
        sourceIds: ['taipei-market-info-yongle', 'tcma-yongle-market', 'moa-niangao'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表食品',
        title: '代表食品｜草仔粿、紅龜粿與米食',
        intro: '好粿緣攤位上的幾樣代表米食。食物說明整理自教育部《臺灣台語常用詞辭典》與農業部、國立臺灣歷史博物館的資料。',
        items: [
          {
            id: 'cao-guo',
            name: '草仔粿',
            category: '糯米｜鹹甜內餡',
            description: '糯米做的粿：外皮在「粿粞」中加入艾草或鼠麴草揉成，包入內餡，墊上葉片後放進蒸籠蒸熟。',
            note: '好粿緣的價目表上，草仔粿有香菇肉、菜脯米等鹹口味，以及芝麻、花生、紅豆等甜口味。',
          },
          {
            id: 'hong-gui',
            name: '紅龜粿',
            category: '糯米｜印模',
            description: '糯米製成：先把粿皮染紅，用模具印上龜形的圖樣再蒸熟；內餡常見豆沙或花生。',
            note: '攤位上另有綠色的艾草龜粿；價目表寫著兩者都有花生、紅豆的甜餡。',
          },
          {
            id: 'luobo-gao',
            name: '蘿蔔糕（菜頭粿）',
            category: '在來米｜蘿蔔',
            description: '在來米漿拌入蘿蔔絲、蝦米等配料蒸製而成，常切片煎來吃。',
            note: '農業部〈年糕＆蘿蔔糕〉提到，「菜頭」與「彩頭」諧音，因此成為過年餐桌上必備的菜色。',
          },
          {
            id: 'yu-guo-qiao',
            name: '芋粿巧',
            category: '在來米｜芋頭',
            description: '用芋頭、在來米、紅蔥頭、蝦米等蒸製而成，因為形狀像彎彎的弧形而得名。',
            note: '教育部辭典寫作「芋粿曲」；好粿緣的價目表上寫作「芋粿巧」。',
          },
        ],
        footnote: '「文獻小記」中的攤位品項依實地拍攝時的價目表與品名牌整理；食物的材料與做法為一般說明，並非好粿緣的配方。',
        sourceIds: ['moe-cao-guo', 'moe-hong-gui', 'moe-cai-tau-guo', 'moe-yu-guo-qiao', 'moa-niangao'],
      },
      {
        id: 'culture',
        type: 'text',
        tab: '食物文化',
        title: '食物文化｜粿的材料、做法與節慶',
        lead: '「粿」是糕的總稱，指用糯米或粳米等做成的食品，因為加入的原料不同而有不同的名稱（教育部《臺灣台語常用詞辭典》）。',
        paragraphs: [
          '材料：農業部的資料說明，臺灣傳統的蘿蔔糕、碗粿等是用在來米做的；草仔粿、紅龜粿、菜包等則是把圓糯米磨粉後製成。',
          '做法：以草仔粿為例，外皮是在粿粞中加入艾草或鼠麴草揉成，包餡後用手塑形，墊上黃槿葉或月桃葉，再放進蒸籠蒸熟。紅龜粿則用粿模印出龜形的圖樣——國立臺灣歷史博物館收藏的粿模說明，粿模是早期農業社會居家常見的模具。',
          '節慶：草仔粿常做為清明掃墓或農曆七月普渡的供品；紅龜粿在神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽時都看得到，也會在添丁時分送親友；過年則有「菜頭」諧音「彩頭」的蘿蔔糕，以及俗諺「食甜粿，予你趁家伙」的甜粿。',
        ],
        timeline: [
          { place: '過年', text: '蘿蔔糕（菜頭粿，諧音「彩頭」）、甜粿（「食甜粿，予你趁家伙」）。' },
          { place: '清明', text: '草仔粿是掃墓祭祖時常見的供品。' },
          { place: '普渡', text: '農曆七月普渡，也常以草仔粿為供品。' },
          { place: '慶典', text: '紅龜粿：神明誕辰、祭祀、長輩做壽，添丁時分送親友。' },
        ],
        glossary: [
          { term: '粿', taiwanese: 'kué', taiwaneseSource: 'moe-guo', definition: '糕的總稱，指用糯米或粳米等做成的食品（教育部《臺灣台語常用詞辭典》）。' },
          { term: '在來米', definition: '臺灣傳統的蘿蔔糕、碗粿等所用的米（依農業部資料）。' },
          { term: '粿模', definition: '用來製作紅龜粿與紅桃粿的模具，是早期農業社會居家常見的用具（國立臺灣歷史博物館）。' },
        ],
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moa-cao-guo', 'moa-niangao'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考資料',
        title: '參考資料',
        intro: '好粿緣與粿食文化的介紹整理自下列資料，點選即可開啟原始網頁。',
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
      },
    ],
  },

  {
    id: 'action-bar',
    name: '導演的豆花店 Action! Bar',
    status: 'open',
    year: 2021,
    yearLabel: '2021年（豆花車2019年登場）',
    yearNote: '2019年7月導演的豆花車登場；2021年豆花車延伸為迪化街巷內的實體店面（商工登記2021年3月12日核准設立）。',
    category: '傳統豆花・紀錄片與兒童影像教育',
    seal: '豆花',
    summary:
      '紀錄片導演何明瑞從公益豆花車出發，2021年在迪化街一段224巷落腳的「夢想基地」：一樓賣傳統豆花，也推廣兒童影像教育。',

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
    },
    // 介紹的鏡頭從櫃台後方（老闆的位置）往店門看：前景是櫃台上的豆花，人物站在櫃台前，後面是兩側的展示牆
    camera: { distance: -1.55, height: 2.0, side: -0.7, lookHeight: 1.1 },

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'truck',
        type: 'text',
        tab: '豆花車',
        title: '第一章｜一台豆花車的誕生',
        lead: '導演的豆花店的故事，從一台開往偏鄉的豆花車開始。',
        paragraphs: [
          '何明瑞是紀錄片導演。金門縣政府2019年的報導介紹他是「瑞齊傳播有限公司負責人、製作人」，從事影像工作近三十年，2019年入圍電視金鐘獎非戲劇類節目攝影獎；聯合報系《500輯》2024年的專文則記載，他和導演劉嵩合作拍攝《農村的遠見Ⅱ》、《南國啟示錄》，「兩度入圍金鐘獎最佳攝影」。',
          '同一篇專文寫道，何明瑞與《看見台灣》的導演齊柏林交情深厚，兩人相約「你在天上飛、我在地上跑」，一起投入影像教育。2017年齊柏林空拍飛機失事；何明瑞決心，「齊柏林永遠飛在天上，輪到自己實踐約定」。',
          '「2019年7月，導演的豆花車登場，這是何明瑞『地上跑』的影像教室。」每到一處偏鄉，他先帶小朋友手作豆花——從磨豆、煮豆漿到凝結，再加上小朋友找來的當地食材，做一碗自己家鄉的豆花；然後讓小朋友學習空拍機，從不同的角度看見家鄉。',
          '金門縣政府2019年12月報導，何明瑞以「導演的豆花車」巡迴金門的古寧國小，並進行「兒童影像記錄工作坊」，帶領師生三十人到戶外拍攝實作。臺北市商業處刊載的品牌故事這樣寫：「導演開著豆花車，深入偏鄉離島，帶著當地小學生，用赤心紀錄家園。」',
          '巷子裡停著的白色豆花車，是依實地照片簡化的示意模型；車身上的圖樣改成原創的場記板與攝影機圖示。',
        ],
        timeline: [
          { place: '2017', text: '齊柏林空拍飛機失事；何明瑞決心實踐「你在天上飛、我在地上跑」的約定。' },
          { place: '2019.7', text: '導演的豆花車登場，成為「地上跑」的影像教室。' },
          { place: '2019.12', text: '豆花車巡迴金門古寧國小，舉辦兒童影像記錄工作坊。' },
          { place: '2021', text: '豆花車延伸為迪化街巷內的豆花店。' },
        ],
        facts: [
          { label: '創辦人', value: '何明瑞（紀錄片導演）' },
          { label: '豆花車', value: '2019年7月登場' },
          { label: '約定', value: '「你在天上飛、我在地上跑」' },
        ],
        sourceIds: ['udn-500-action-bar', 'kinmen-2019-douhua-truck', 'tcooc-action-bar'],
      },
      {
        id: 'base',
        type: 'text',
        tab: '夢想基地',
        title: '第二章｜夢想基地',
        lead: '2021年，「豆花車延伸為豆花店，在迪化街小巷裡，與夢想一同落腳」（臺北市商業處刊載的品牌故事）。',
        paragraphs: [
          '經濟部商工登記資料顯示，「導演的豆花店」在2021年（民國110年）3月12日核准設立，地址是臺北市大同區迪化街一段224巷24號1樓。',
          '《500輯》記載：「為了推廣影像教育，何明瑞在迪化街區創辦『夢想基地』，一樓就是豆花店。」店名原本是「夢想基地－導演的豆花店」。臺北市商業處的店家輕改造介紹寫道，店家「更名為『導演的豆花店Action! Bar』，品牌定位『稻埕夢想會客廳』」，口號是「來一碗真情實料, cut!」，店面也「以影像為主題重新設計布置，打造夢想基地」。',
          '兒童影像教育也持續進行。2025年《馬祖日報》報導，由「夢想基地-導演的豆花店」舉辦的兒童影像紀錄學習營「為公益性質，完全免費」，「每年暑期巡迴不同的偏鄉與離島」，那年7月移到馬祖，招收國小四至六年級的學童。',
          '《500輯》也記載，何明瑞延續空間提供者「財團法人台北市至善堂」的公益精神，每月送六百碗豆花給附近「讀好書、做好事」的國小學生，開幕三年已經送出一萬五千碗。',
          '場景中的店依實地照片建模：灰色洗石子的二層樓、騎樓下兩根圓形石柱、木作的入口，正面是藍白色的「導演的豆花店 ACTION! BAR」招牌，側邊突出一塊藍色的膠卷招牌。走進店裡，左牆是影像教育的展板、一排排懸掛的手寫留言本與裝框的獎項，右牆貼滿小朋友的畫。牆上的留言、圖畫與獎項都是原創的示意內容，並不是店內實際的作品、照片或獎項。',
        ],
        facts: [
          { label: '店名', value: '導演的豆花店 Action! Bar（原名「夢想基地－導演的豆花店」）' },
          { label: '地址', value: '臺北市大同區迪化街一段224巷24號' },
          { label: '核准設立', value: '2021年3月12日（經濟部商工登記）' },
          { label: '品牌定位', value: '「稻埕夢想會客廳」' },
        ],
        sourceIds: ['gcis-action-bar', 'tcooc-action-bar', 'udn-500-action-bar', 'matsu-2025-action-bar-camp'],
      },
      {
        id: 'douhua',
        type: 'foods',
        tab: '一碗豆花',
        title: '第三章｜一碗豆花',
        intro:
          '「拍紀錄片求真求善，配料亦然。」（臺北市商業處刊載的品牌故事）依資料記載，店裡的豆花與配料都以天然食材手工製作。以下是一碗豆花裡的幾樣主角；食物說明整理自教育部《臺灣台語常用詞辭典》與農業部的資料。',
        items: [
          {
            id: 'douhua',
            name: '傳統豆花',
            category: '黃豆｜鹽滷',
            description: '在豆漿中加入少量的鹽滷或石膏，凝結成比豆腐還嫩的食品，通常加糖水和花生，當作甜食（教育部辭典）。',
            note: '《500輯》記載，何明瑞向大溪豆乾老店學來用鹽滷製作豆花的傳統方法，並用美國有機黃豆製作豆花。',
          },
          {
            id: 'maltose-syrup',
            name: '麥芽糖水',
            category: '麥芽糖｜糖水',
            description: '麥芽糖（台語「麥芽膏」）是由含澱粉酶的麥芽使澱粉水解而成、金黃色有黏性的糖；調成糖水淋在豆花上。',
            note: '臺北市商業處刊載的品牌故事寫道，店裡的配料「重現導演童年回憶裡的麥芽糖水」。',
          },
          {
            id: 'sweet-potato-balls',
            name: '地瓜粉圓',
            category: '地瓜・芋頭｜粉圓',
            description: '粉圓是用番薯粉和紅糖做成的圓形食品，煮熟後變透明，夏天可以涼食、冬天可以熱食（教育部辭典）。',
            note: '《500輯》記載，店裡「用地瓜和芋頭製作粉圓」，配料每天新鮮製作。',
          },
          {
            id: 'fen-guo',
            name: '粉粿',
            category: '山梔子｜粿',
            description: '用番薯粉等澱粉做成的粿類食品（教育部辭典）。農業部的資料說明，粉粿黃黃的顏色來自天然色素「山梔子」，又名黃梔。',
            note: '《500輯》記載，店裡用「山梔子製作粉粿」；商業處的介紹也提到「山梔子粉粿」。',
          },
          {
            id: 'red-green-beans',
            name: '紅豆・綠豆',
            category: '豆類｜傳統配料',
            description: '煮到鬆軟、帶著甜味的紅豆與綠豆，是豆花和剉冰常見的傳統配料。',
            note: '《500輯》描寫在店裡吃到的是「白嫩豆花搭配甜蜜紅豆及軟彈粉粿」。',
          },
        ],
        footnote: '標示「文獻小記」的內容整理自所列資料；其餘為一般介紹，並非店家的配方。實際供應的配料以店家為準。',
        sourceIds: ['moe-douhua', 'moe-maltose', 'moe-fun-inn', 'moe-fun-kue', 'moa-douhua-gel', 'moa-ice-toppings', 'udn-500-action-bar', 'tcooc-action-bar'],
      },
      {
        id: 'film',
        type: 'text',
        tab: '影像記錄',
        title: '第四章｜用影像記錄臺灣',
        lead: '「拍攝影像為了『看見』、製作豆花為了『吃到』」——何明瑞說，看到或吃到，都是人用感官和世界連結的方法（《500輯》）。',
        paragraphs: [
          '影像教育：《馬祖日報》報導，學習營由何明瑞導演講述故事的構成、影像拍攝、剪輯方法與技巧，讓孩子學習利用影像傳達故事內容，「透過實作與紀錄，學習如何用影像捕捉生活、表達自我」。報導也寫道，他「透過豆花的飲食、體驗、教學，再由影像紀錄學習營培育影像紀錄人才」。',
          '地方關懷：金門縣政府的報導記載，何明瑞曾在金門拍攝《鞠。麴》金門產業文創紀錄片；《500輯》描寫，在豆花店裡，一邊吃豆花，一邊可以看著現場播放、何明瑞「以十年時間完成的金門輦轎紀錄片」。',
          '電影文化：店名裡的「Action!」是開拍時的口令，口號「來一碗真情實料, cut!」的「cut」則是喊停的口令。臺北市商業處記載，店家的品牌識別與店面「以影像為主題重新設計布置」——場景裡的場記板、攝影機、膠卷招牌與影像展板，都是依實地照片做成的示意道具。',
          '請注意：牆上的獎項框、留言本與兒童圖畫都是原創的示意圖樣，不代表任何實際的獎項、影展或個人作品。何明瑞的獎項，本站只採用報導中可以查證的「入圍金鐘獎」紀錄。',
        ],
        glossary: [
          { term: 'Action!', definition: '電影或電視拍攝時，導演喊「開拍」的口令。' },
          { term: 'Cut!', definition: '導演喊「停」、結束這一個鏡頭的口令。' },
          { term: '場記板', definition: '拍攝前在鏡頭前打板的板子，寫著片名、場次與鏡次，拍板聲也用來對齊畫面與聲音。' },
          { term: '空拍機', definition: '可以遙控飛行、從空中拍攝的無人機；豆花車的影像教室用它帶孩子從不同角度看家鄉。' },
        ],
        sourceIds: ['matsu-2025-action-bar-camp', 'kinmen-2019-douhua-truck', 'udn-500-action-bar', 'tcooc-action-bar'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        title: '第五章｜參考文獻',
        intro: '導演的豆花店與豆花文化的介紹整理自下列資料，點選即可開啟原始網頁。',
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
      },
    ],
  },

  {
    id: 'huang-yujie-museum',
    name: '黃玉階文史館',
    // 文化據點（文化展示／歷史街屋）：不是餐廳，沒有點餐或食物圖鑑
    kind: MUSEUM_RECORD.kind,
    status: 'open',
    // 老屋的興建年與文史館的開館日都未核實：留空（不以黃玉階的遷居年份或協會的登記日代替）
    year: null,
    yearLabel: '',
    yearNote: '老屋的興建年、文史館的開館日、詳細門牌與開放時間都未核實，資料留空。歷史商號「元珍豆醬店」的說法見《人間福報》2026年的文章。',
    category: '文化據點｜文化展示・歷史街屋',
    seal: '文史',
    summary: '紅磚拱窗的二層街屋，百年前是黃玉階的元珍豆醬店，如今是黃玉階文史館：保留老屋的木梁，展示醬缸、商號器物與大稻埕的人物、社會改革與教育史。',
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
        title: '黃玉階文史館｜元珍豆醬店',
        lead: '224巷裡一棟紅磚拱窗的二層街屋：百年前的「元珍豆醬店」，如今是黃玉階文史館（《人間福報》2026年的文章）。',
        summary: {
          text: '文史館保留老屋的紅磚立面與裸露的木梁，一樓展示陶醬缸、舊商號的器物，以及黃玉階的生平、日治初期的社會改革與大稻埕的教育史。站在巷子裡正對立面時，左邊是文史館、右邊是導演的豆花店，兩棟的騎樓由拱門相連。老屋的興建年、開館日與開放時間尚未核實。',
        },
        paragraphs: [
          '場館與商號分開看｜「黃玉階文史館」是現代的文化展示空間；「元珍豆醬店」是這棟老屋過去的商號。《人間福報》的文章寫到，門口掛著「元珍」與「源珍」兩塊招牌，地方耆老說的是「源珍」，帳冊上寫的是「元珍」。場景照原樣保留兩塊匾額，不把兩種寫法改成同一種。',
          '外觀（依使用者照片）｜二樓三組拱形窗，中央較寬、兩側較窄，拱頂是放射狀的磚紋，窗間是四道磚柱（文章的圖說稱為「三窗四柱」）；窗下中央是黑底金字、由右往左讀的「元珍」匾額，左右兩塊有淺色邊框的彩色陶飾板。一樓兩根紅磚圓柱、灰色柱頭，後面是退縮的木造門面，門前是木質花槽。',
          '老屋的構造｜騎樓與展間的頂部都露出深褐色的木梁與木板，色澤不均、有剝落的痕跡，也看得到修補過的木料與金屬固定構件（照片觀察）。點天花的木梁可以近看。',
          '尚未核實的資料｜老屋的興建年、文史館的開館日、詳細門牌、開放時間與營運單位都沒有查到可靠的資料，所以留空；本站不以黃玉階遷居大稻埕的年份或其他組織的登記日期代替。',
        ],
        facts: [
          { label: '場館', value: '黃玉階文史館（文化展示／歷史街屋）' },
          { label: '歷史商號', value: '元珍豆醬店（另有「源珍」的說法）' },
          { label: '位置', value: '迪化街一段224巷，導演的豆花店北鄰（依照片）；門牌未核實' },
          { label: '興建年／開館日', value: '未核實（留空）' },
        ],
        lists: [
          { title: '使用者照片觀察', kind: 'observation', items: PHOTO_OBSERVATIONS.filter((o) => ['neighbour', 'facade', 'columns', 'arcade', 'beams'].includes(o.id)).map((o) => o.text) },
          { title: '3D 場景的情境設計', kind: 'scenario', items: SCENARIO_DESIGN.filter((o) => ['size', 'ceramics', 'omitted', 'upstairs'].includes(o.id)).map((o) => o.text) },
        ],
        sourceIds: ['merit-2026-huang-yujie'],
      },
      {
        id: 'huang',
        type: 'text',
        tab: '黃玉階與大稻埕',
        title: 'A｜黃玉階與大稻埕',
        lead: '一位經營醬菜坊、也行醫的大稻埕仕紳。',
        summary: {
          text: '黃玉階（1850–1918）生於彰化大肚堡，1882年遷居大稻埕，經營醬菜坊，也以漢醫行醫。日治初期霍亂、鼠疫流行時，他奔走救治、不收謝禮，並取得官方核發的醫生執照（有1897、1901年兩種記載）。1900–1917年任大稻埕區長。',
        },
        paragraphs: [
          '本章是本站依國家文化記憶庫（國家中醫藥研究所建檔）與國家圖書館「臺灣記憶」整理的摘要，不是館方展板的原文。',
          '醫療的記載是歷史資料：它說明黃玉階在疫病流行時的角色，不代表任何療法在今天的效果，本站也不提供任何藥方或配方。',
          '館內的人物展示牆有肖像看板、醫療公衛與社會參與的說明與裝框的文件（照片觀察）；後牆掛著「學貫中西」匾額與人體解剖圖（《人間福報》的文章也寫到）。場景中的看板只做版面示意，不重製照片中的肖像與文件。',
        ],
        timeline: [
          { place: '1850', text: '生於彰化大肚堡五汊港（今臺中市梧棲區）。' },
          { place: '1882', text: '遷居大稻埕，經營醬菜坊並行醫。' },
          { place: '1897／1901', text: '取得官方核發的醫生執照（兩種記載）。' },
          { place: '1900–1917', text: '擔任大稻埕區長。' },
          { place: '1918', text: '逝世。' },
        ],
        facts: [
          { label: '生卒', value: '1850–1918' },
          { label: '遷居大稻埕', value: '1882年（光緒八年）' },
          { label: '行業', value: '醬菜業（醬菜坊）、漢醫' },
          { label: '執照年份', value: '1897年（臺灣記憶）／1901年（國家文化記憶庫）' },
        ],
        sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie', 'merit-2026-huang-yujie'],
      },
      {
        id: 'yuanzhen',
        type: 'text',
        tab: '元珍豆醬店',
        title: 'B｜元珍豆醬店與飲食生活',
        lead: '醬缸、包裝與商號名稱，留下了一家醬料商號的記憶。',
        summary: {
          text: '國家文化記憶庫與臺灣記憶都記載黃玉階經營醬菜業。《人間福報》2026年的文章寫到，百年前的「元珍豆醬店」如今是黃玉階文史館，門口掛著「元珍」與「源珍」兩塊招牌：耆老口述稱「源珍」，帳冊寫「元珍」。館內的醬缸與陳設留下醬料商號的記憶。',
        },
        paragraphs: [
          '兩種名稱｜二樓窗下的黑底金字匾額是「元珍」，騎樓斜掛的綠色匾額與室內的布旗是「源珍」（照片觀察）。兩種寫法都出自同一篇文章的記載，本站照原樣保留，沒有自動改成同一種。',
          '醬缸與陳列（照片觀察）｜入口一側與右前方的陳列區擺著深褐色的陶醬缸，有的加木蓋、有的用紅布或麻布封口，缸身貼著「醬」「醋」的紅色菱形紙；陳列區的木架上掛著秤與繩索，地上靠著大型竹篩。場景中的醬缸是展示物的示意。',
          '本站沒有查到的事｜商號的創立年、配方、販售過的產品與醬缸的確切年代都沒有可靠的資料，所以不寫；場景也沒有點餐或販售的功能。',
        ],
        facts: [
          { label: '商號', value: '元珍豆醬店（「源珍」為另一種說法）' },
          { label: '行業', value: '醬菜業（國家文化記憶庫、臺灣記憶）' },
          { label: '創立年', value: '未核實（留空）' },
        ],
        sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie'],
      },
      {
        id: 'reform',
        type: 'text',
        tab: '社會改革與教育',
        title: 'C｜社會改革與初等教育',
        lead: '放足、斷髮與新式學校：日治初期大稻埕的變化。',
        summary: {
          text: '日治初期，纏足與辮髮成為社會改革的議題；臺灣記憶記載，黃玉階被推為臺北天然足會與斷髮不改裝會的會長。館內有「日治初期大稻埕的初等教育發展」展板（照片觀察）。依中研院臺史所整理，1898年國語傳習所改為公學校與小學校，1941年改稱國民學校。',
        },
        paragraphs: [
          '本章是本站整理的延伸說明，不是館方展板的原文。展板上的小字在場景中只做版面示意（標題、年代軸、段落、圖片與城市剪影）；點選展板可以閱讀這一章的文字。',
          '教育制度的背景｜中研院臺史所檔案館把日治時期的初等教育分成三個時期：1895–1922年日臺分離、1922–1941年日臺共學制、1941–1945年國民學校時期。領臺之初先設國語傳習所，1898年改為收臺籍兒童的公學校與收日籍兒童的小學校。',
          '館內有教育主題的展覽，不代表這棟建築以前是學校；展板上的校名與年份本站沒有逐一核對，因此不轉載。',
        ],
        glossary: [
          { term: '國語傳習所', definition: '日治初期教臺灣人學日語的學校，1898年改為公學校（中研院臺史所）。' },
          { term: '公學校', definition: '日治時期收臺籍兒童的初等學校；日籍兒童讀小學校（中研院臺史所）。' },
          { term: '放足', definition: '解開纏足，讓女子的腳自然生長。' },
          { term: '斷髮不改裝', definition: '剪去辮髮、但不必改穿和服或西服的主張。' },
        ],
        lists: [
          { title: '待核實', kind: 'pending', items: PENDING.filter((p) => ['girls-school', 'board-schools'].includes(p.id)).map((p) => `${p.field}：${p.note}`) },
        ],
        sourceIds: ['ncl-huang-yujie', 'tcmb-huang-yujie', 'ith-primary-education'],
      },
      {
        id: 'objects',
        type: 'text',
        tab: '日常器物',
        title: '日常器物與商號生活',
        lead: '層架上的包裝、提籃與茶具，把舊商號的日常帶進老屋裡。',
        summary: {
          label: '使用者照片觀察',
          text: '展間右側是高到天花的深色木製層架：牛皮紙包裝與紅紙封條、竹編與藤編提籃、綁紅繩的小陶甕、茶具與鍋具、便當提盒、書籍、舊式電視與玻璃燈具。後方的茶席在圓形竹托盤上擺著黑色茶壺與杯底朝上的茶杯，上方掛著紅色紋樣的布旗。',
        },
        paragraphs: [
          '這些器物是文史館的陳設，用來呈現舊商號與日常生活的氣氛。本站沒有查證每一件器物的年代與來歷，所以不寫成某個年代的文物。',
          '場景中的層架、器物與茶具是依照片簡化的示意，不是館藏的複製；每一層的擺設各不相同，但數量與細節做了精簡。',
        ],
        sourceIds: ['merit-2026-huang-yujie'],
      },
      {
        id: 'association',
        type: 'text',
        tab: '相關組織資料',
        title: 'D｜相關組織資料：社團法人臺灣文化事業發展協會',
        lead: '以公開的法院公告為準；與文史館的關係尚待核實。',
        summary: {
          text: '社團法人臺灣文化事業發展協會經內政部2023年10月18日許可設立，2024年5月16日完成法人設立登記（臺灣桃園地方法院公告），宗旨是文化記憶保存、文化調查、人才培訓及教育推廣。公開資料沒有說明它與本館的關係，因此只列為相關組織資料。',
        },
        paragraphs: [
          '這一章是協會本身的資料，不是文史館的介紹；在營運關係確認以前，本站不把協會標示為文史館的主辦、館方或所有權人，場景裡也沒有放協會的招牌或標誌。',
        ],
        facts: [
          { label: '名稱', value: ORGANIZATIONS[0].name },
          { label: '許可設立', value: '2023年10月18日（內政部）' },
          { label: '法人設立登記', value: '2024年5月16日（臺灣桃園地方法院）' },
          { label: '與文史館的關係', value: '待核實' },
        ],
        sourceIds: ['judicial-2024-tcda'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        title: '參考文獻',
        intro: '文史館、元珍豆醬店、黃玉階與相關組織的介紹整理自下列資料，點選即可開啟原始網頁。每一筆都註明出版時間與用途。',
        sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie', 'ith-primary-education', 'judicial-2024-tcda'],
        disclaimer:
          '外觀與一樓展間依使用者提供的實地照片建模，尺寸為估算；展板、肖像看板與文件框只做版面示意，器物是簡化的示意，不是館藏的複製。來源對細節記載不一時（例如執照的年份）並列說明，不自行選定一種。' +
          '尚未核實而留空的資料：' +
          PENDING.map((p) => p.field).join('、') +
          '。',
      },
    ],
  },

  {
    id: 'luguo-cafe',
    name: '爐鍋咖啡',
    status: 'open',
    year: 2004,
    yearLabel: '品牌 2004年（店門口的海報「since 2004」）',
    yearNote:
      '品牌：店門口的海報印著「since 2004」；建築：屈臣氏大藥房大樓1928年（一說1917年）興建；小藝埕：2011年開幕。爐鍋咖啡進駐小藝埕的年份未能查證（2014年的資料已記載二樓是爐鍋咖啡）。',
    category: '咖啡館・小藝埕二樓',
    seal: '咖啡',
    summary: '小藝埕（屈臣氏大藥房舊址）二樓的咖啡館：從巷子側的騎樓走上樓梯，窗邊是面向小巷的木格窗。',
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
        note: hotspot.note,
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
        title: '第一章｜屈臣氏大藥房與歷史建築',
        lead: '小藝埕所在的轉角大樓，是日治時期大稻埕的「屈臣氏大藥房」。',
        paragraphs: [
          '魚夫2017年在《台北畫刊》發表的〈屈臣氏大樓的興衰起落〉記載：「最早屈臣氏是臺中實業家李俊啟全權負責經營，他本來在彰化員林開設「德壽堂」」；文章也提到，1926年時的報紙報導，香港屈臣氏的藥品由李俊啟在全臺專營。',
          '同一篇文章寫道，李俊啟在「1928 年（一說為1917 年）興建了這棟位於臺北大稻埕的屈臣氏大樓，以批發進口西藥為主，也代理英國史谷脫（Scott）魚肝油」。各資料記載的興建年份不一，這裡兩者並列。',
          '立面上的圖案也有故事。1934年，香港屈臣氏本店控告李俊啟擅自使用商標，李俊啟最終敗訴。文章記載，現存立面三樓外牆鑲著「飛龍與麒麟護衛七層寶塔圖騰」，兩旁寫著「龍麟伴塔為記，別人不得冒效」。',
          '《台北畫刊》也記載，大樓「1996 年遭逢大火，直至2005年由市府列為巿定古蹟後，交由李家後代李永崇建築師修復完成」。不過，我們在文化部文化資產局的開放資料中，沒有找到以「屈臣氏」或這個地址登錄的古蹟或歷史建築，文化資產的身分還需要查證。',
          '2012年《今周刊》形容這棟樓是「洗石子外牆的三層樓平樑式結構，坐落在街角」。場景中的建築依實地照片建模：灰色洗石子立面、連續的木格窗、轉角的塔樓與圓球柱頭、「屈臣氏大藥房」的店號與「A.S. WATSON & CO.」字樣；寶塔與龍、麒麟的浮雕是簡化的示意，尺寸為估算。',
        ],
        timeline: [
          { place: '1926', text: '據《台北畫刊》，當時的報紙報導香港屈臣氏的藥品由李俊啟在全臺專營。' },
          { place: '1928', text: '屈臣氏大樓興建（一說1917年）。' },
          { place: '1934', text: '香港屈臣氏本店控告商標被擅自使用。' },
          { place: '1996', text: '大樓遭逢大火。' },
          { place: '2005', text: '《台北畫刊》記載市府列為市定古蹟，之後修復完成。' },
        ],
        facts: [
          { label: '店號', value: '屈臣氏大藥房（A.S. WATSON & CO.）' },
          { label: '經營者', value: '李俊啟（臺中實業家）' },
          { label: '興建', value: '1928年（一說1917年）' },
          { label: '位置', value: '迪化街一段與32巷的轉角' },
        ],
        sourceIds: ['taipei-pictorial-watson', 'businesstoday-2012-watson', 'boch-opendata-assets', 'boch-opendata-historic'],
      },
      {
        id: 'art-yard',
        type: 'text',
        tab: '小藝埕',
        title: '第二章｜小藝埕與老屋再利用',
        lead: '「大稻埕上賣小藝」：2011年，屈臣氏大藥房的大樓成了小藝埕。',
        paragraphs: [
          '《遠見雜誌》2013年報導：「2010年周奕成好不容易獲得…「屈臣氏大藥房」屋主點頭出租，以「大稻埕上賣小藝」發想創立小藝埕，展開他的文化復興大計。」報導稱周奕成是「世代文化創業群負責人」。',
          '2012年《今周刊》記載：「二○一一年右翼內棟作為「小藝埕」，內有…藝術設計品鋪、獨立書店、咖啡店及劇場。」大藝埕的官方網站寫道：「自 2011 年的「小藝埕」至今，世代群在大稻埕經營了 10 棟藝埕系列街屋」。2015年的《今周刊》以「這波大稻埕文藝復興風潮」形容這一帶的老屋再利用。',
          '2014年國立臺北大學的報告引用小藝埕官網，記載當時「一樓：「Bookstore 1920s」及「印花樂」 二樓：「爐鍋咖啡」 三樓：展示和聚會場所」；TVBS《食尚玩家》的介紹則寫「3樓是思劇場」。各樓層的店家會隨時間調整。',
          '老屋再利用保留了老建築的外觀：二樓臨巷的三組深棕色木格窗，上方還有小氣窗。場景中只呈現一樓的騎樓、店面與樓梯入口，以及二樓的爐鍋咖啡；其他樓層沒有室內，一樓轉角的店只用一般的「BOOK CAFE」字樣，不使用實際店家的商標。',
          '營運模式（官方自述）：大藝埕的官方網站寫，世代群以「創業助成、街區營造、文化運動」三大主軸，把歷史街屋規劃為創業商場，至今約50組創業團隊進駐；官方的「HOUSES」頁稱小藝埕「位於迪化街入口的百年洋樓，是藝埕的第一棟街屋」，並列出小藝埕、民藝埕、眾藝埕、學藝埕、聯藝埕、青藝埕、合藝埕、同藝埕、鄉藝埕、婉藝埕十棟。這些是營運單位的自述，不是第三方的評估。本站讀到的來源都顯示這是民間向屋主承租的老屋再利用（《遠見雜誌》：2010年屋主點頭出租）；沒有查到它是政府的計畫，承租的年限與條件也沒有公開資料，不寫。',
          '兩棟相鄰的藝埕：2012年《今周刊》同時寫到小藝埕與斜對面的民藝埕（迪化街一段67號）。民藝埕是迪化街的店屋，二樓是狹長的三進格局、有天井，歷經茂元中藥行、郭火焱事務所、侯雨利店鋪，後由蘇家擁有；官方頁稱它是霞海城隍廟旁的「百年三進式街屋」，報導寫2012年時有「近九十年的屋齡」。小藝埕則是街角的洋樓（屈臣氏大藥房舊址）。一棟洋樓、一棟三進街屋，正好是大稻埕老屋的兩種型態；民藝埕不在本站的場景裡，兩棟是不同的建築，不要混為一談。',
          '從屈臣氏大藥房到小藝埕，有出處的只有幾個節點：日治時期批發西藥的洋樓（1928年，一說1917年）、1996年的大火、之後的修復、2010年屋主答應出租、2011年小藝埕開幕、2014年的資料記載二樓是爐鍋咖啡。這些節點之間有沒有因果——修復是否促成出租、屋主為何在2010年點頭——本站沒有查到，不推論；各樓層的業者也會隨時間調整，本站不列現在的入駐名單。',
        ],
        facts: [
          { label: '開幕', value: '2011年' },
          { label: '經營', value: '世代群（世代文化創業群）' },
          { label: '概念', value: '「大稻埕上賣小藝」' },
          { label: '定位', value: '藝埕系列的第一棟，共十棟（官方自述）' },
          { label: '地址', value: '報導寫迪化街一段32巷1號；官方編號AY34、旅遊文章另寫34號，未核對地政資料（待核）' },
        ],
        sourceIds: ['gvm-2013-artyard', 'businesstoday-2012-watson', 'artyard-about', 'artyard-houses', 'businesstoday-2015-dadaocheng', 'ntpu-2014-dadaocheng', 'supertaste-artyard', 'storm-2018-luguo'],
      },
      {
        id: 'luguo',
        type: 'text',
        tab: '爐鍋咖啡',
        title: '第三章｜爐鍋咖啡的創立及進駐',
        lead: '從巷子側的騎樓走上樓梯，二樓就是爐鍋咖啡。',
        paragraphs: [
          '2018年《風傳媒》的報導寫道：「屈臣氏大藥房的二樓，有間網路上頗具知名度的爐鍋咖啡」，地址是臺北市大同區迪化街一段32巷1號。',
          '創立：店門口的海報印著「since 2004」（依實地照片）。2015年《風傳媒》（欣台灣）也介紹了「位於台北藝術大學關渡校區的爐鍋咖啡」。',
          '進駐：2012年的《今周刊》寫到小藝埕「內有…咖啡店」，但沒有寫出店名，也沒有寫咖啡店是哪一年進駐的；我們查到最早明確寫出「二樓：「爐鍋咖啡」」的資料，是2014年臺北大學的報告。因此這裡不寫確切的進駐年份。',
          'TVBS《食尚玩家》記載：「2樓的「爐鍋咖啡」主打來自各產區、莊園的單品咖啡，還有義式濃縮和拿鐵。」《風傳媒》也寫道：「所有的咖啡豆都是老闆精選各國的豆子，而且每杯咖啡強調不加糖、不加奶精」。',
          '場景中的二樓依實地照片建模：臨巷的窗邊座位、靠牆的大木櫃與咖啡吧檯、書架與閱讀角、門口的紅色扭蛋機與冰滴咖啡架。牆上的畫作、海報、春聯與貼紙都換成原創的簡化圖樣，不複製店內實際的作品；也不列出營業時間、價格與經營者的姓名。',
        ],
        facts: [
          { label: '店名', value: '爐鍋咖啡 LUGUO CAFE' },
          { label: '位置', value: '小藝埕二樓（迪化街一段32巷1號）' },
          { label: '品牌', value: '海報上的「since 2004」' },
          { label: '進駐小藝埕', value: '年份未能查證（2014年的資料已記載在二樓）' },
        ],
        sourceIds: ['storm-2018-luguo', 'storm-2015-luguo-guandu', 'businesstoday-2012-watson', 'ntpu-2014-dadaocheng', 'supertaste-artyard'],
      },
      {
        id: 'coffee',
        type: 'foods',
        tab: '一杯咖啡',
        title: '第四章｜咖啡製作與飲食文化',
        intro:
          '依農業部〈台灣咖啡沿革〉，臺灣栽培咖啡最早的紀錄是1884年英國茶商自馬尼拉引進一百株阿拉比卡咖啡，在台北三峽種植；日治時期在恆春與嘉義試種推廣，1942年全臺栽培面積達1,000公頃，戰後大多荒蕪。1930年代的大稻埕也有西洋飲食的身影：1934年開業的「波麗路」是「臺北市1930年代最著名的西餐廳」（臺北市歷史建築）。以下是吧檯上常見的幾種做法；門口的紅色扭蛋機，裝的則是咖啡器具造型的迷你模型（依實地照片）。',
        items: [
          {
            id: 'coffee-beans',
            name: '咖啡豆',
            category: '咖啡樹的種子｜烘焙',
            description: '咖啡樹的「種子為咖啡原料，焙乾後研成細末可沖泡為飲料」（教育部《國語辭典簡編本》）。',
            note: '《食尚玩家》記載，爐鍋咖啡主打來自各產區、莊園的單品咖啡。',
          },
          {
            id: 'pour-over',
            name: '手沖咖啡',
            category: '濾杯｜細口壺',
            description: '用手把熱水緩緩倒在濾杯裡的咖啡粉上，讓咖啡液滴進下方的壺中（美國國家咖啡協會："hand-pour water over coffee grounds in a filter"）。',
            note: '吧檯上有濾杯、細口壺與分享壺（依實地照片）。',
          },
          {
            id: 'espresso',
            name: '義式濃縮',
            category: '高壓萃取',
            description: '用高壓讓接近沸騰的熱水在約20–30秒內通過細研磨的咖啡粉（美國國家咖啡協會）。',
            note: '加入牛奶就成了拿鐵；《食尚玩家》記載店裡有義式濃縮和拿鐵。',
          },
          {
            id: 'cold-drip',
            name: '冰滴咖啡',
            category: '冰水｜慢慢滴漏',
            description: '「利用5度C以下的冰水混合物」一滴一滴滴入咖啡粉，「一點一點滴漏出萃取液」（《食力》）。',
            note: '店門口旁有一座木架的冰滴咖啡器（依實地照片）。',
          },
          {
            id: 'cold-brew',
            name: '冷萃咖啡',
            category: '冷水｜長時間浸泡',
            description: '咖啡粉「注入冷水，於低溫環境中浸泡至少約12小時」（《食力》）；和先熱沖、再冰鎮的冰咖啡不同（美國國家咖啡協會）。',
            note: '冷萃與冰滴都是低溫萃取：一個浸泡，一個滴漏。',
          },
        ],
        sourceIds: ['moa-taiwan-coffee', 'boch-bolero', 'moe-coffee', 'nca-pour-over', 'nca-espresso', 'nca-cold-brew', 'foodnext-cold-brew', 'supertaste-artyard'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '參考文獻',
        title: '第五章｜參考文獻',
        intro: '小藝埕、屈臣氏大藥房與爐鍋咖啡的介紹整理自下列資料，點選即可開啟原始網頁。',
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
      },
    ],
  },

  /* ── 魷魚羹飲食文化：兩個年代各一個版本（位置、模型、碰撞、互動與故事各自獨立，見 data/squidSoupLayout.js） ── */
  {
    id: 'temple-squid-stall',
    name: '廟口魷魚羹攤',
    status: 'open',
    category: '廟口小吃・魷魚羹',
    seal: '羹',
    // 與 2000–現在的老潘魷魚羹同一個飲食主題（只以主題串連，沒有傳承關係）
    theme: SQUID_SOUP_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    sourceIds: ['wiki-ci-sheng-gong', 'moe-jiu-hi-kenn', 'mirror-2025-squid'],
    summary:
      '慈聖宮廟埕旁、與其他小吃攤相鄰的魷魚羹攤：木框攤台、帆布棚、大湯鍋與兩張小桌。這是飲食文化的情境示意，不是特定的店家。',

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
    },
    camera: { distance: 4.6, height: 2.1, side: -2.7, lookHeight: 1.15 },
    hotspots: hotspotsToWorld(TEMPLE_STALL_HOTSPOTS, templeStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'temple-food',
        type: 'text',
        tab: '廟口飲食',
        title: '魷魚羹與廟口飲食',
        lead: '慈聖宮的廟埕旁，一座木框攤台、一口大湯鍋與兩張小桌：這是「魷魚羹」與廟口飲食的情境示意。下面分開標示史料與情境設計。',
        paragraphs: [
          '史料｜教育部《臺灣台語常用詞辭典》收錄「鰇魚羹」（jiû-hî-kenn），釋義是「一種小吃，用魷魚作成的羹湯」；「羹」則是「芶芡而成的濃稠湯汁」。',
          '史料｜辭典裡的「廟口」是「廟門口、廟前廣場」，用例寫著廟口的榕樹下經常有人泡茶、聊天；賣點心小吃的攤販稱為「點心擔」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮在1910年因市區改正遷移、1914年重建完成，今址在保安街49巷17號，「廟前則是一排老牌的小吃攤」。',
          '專欄的說法｜《鏡週刊》裴偉的專欄〈萬華大稻埕的魷魚美食〉（2025年）寫道：「魷魚羹在70年代於萬華、大稻埕一帶興起」，原因之一是「供貨源頭迪化街就在附近」。這是專欄作者的看法，不是學術考證；本站沒有找到更早的文獻可以核對，所以不寫這個年代的哪一年開始有魷魚羹攤。',
          '情境設計｜場景中的攤位：木框攤台與金屬工作面、簡單的帆布棚、大湯鍋與長柄湯勺、疊放的碗、配料盤，以及兩張小桌與木凳；鍋口冒著少量蒸氣，攤台上展示一碗魷魚羹。招牌只寫「魷魚羹」，沒有店名或商標。攤位的樣子、擺放的位置都是依一般小吃攤設計的示意，不是某一家實際的攤位，也沒有店史或傳承關係。',
          '同一個飲食主題｜切換到「2000–現在」，可以在永樂市場對面走進老潘魷魚羹。兩者只是同樣以魷魚羹為主題：場景沒有表示這個攤位是老潘的前身，也不表示老潘從廟口遷出。',
        ],
        facts: [
          { label: '位置', value: '慈聖宮廟埕旁、其他小吃攤的旁邊（場景配置）' },
          { label: '年代', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）' },
          { label: '性質', value: '飲食文化情境示意，不是特定的店家' },
          { label: '招牌', value: '只寫「魷魚羹」' },
        ],
        glossary: [
          { term: '鰇魚羹', taiwanese: 'jiû-hî-kenn', taiwaneseSource: 'moe-jiu-hi-kenn', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。' },
          { term: '羹', taiwanese: 'kenn', taiwaneseSource: 'moe-kenn', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。' },
          { term: '廟口', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。' },
          { term: '點心擔', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。' },
        ],
        sourceIds: ['moe-jiu-hi-kenn', 'moe-kenn', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong', 'mirror-2025-squid'],
      },
      {
        id: 'bowl',
        type: 'foods',
        tab: '一碗魷魚羹',
        title: '一碗魷魚羹',
        intro: '攤台上展示的一碗魷魚羹與它的主要材料。材料與做法是一般的說明，不是某一家的配方。',
        items: [
          {
            id: 'squid-geng',
            name: '魷魚羹',
            category: '羹湯｜魷魚',
            description: '用魷魚作成的羹湯（教育部辭典）；湯汁勾芡而成，濃稠滑順。',
            note: '《鏡週刊》的專欄提到，「會把發泡好的魷魚，切絲拌進魚漿中」。場景中的一碗是示意，不代表配方或份量。',
          },
          {
            id: 'dried-squid',
            name: '乾魷魚（鰇魚）',
            category: '乾貨｜提鮮食材',
            description: '魷魚「時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一」（教育部辭典）。',
            note: '《鏡週刊》的專欄寫到，迪化街一帶的南北貨裡，進口的大魷魚乾是重要的商品之一。',
          },
        ],
        footnote: '展示的一碗是示意模型，不代表價格、份量或配方。',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-jiu-hi', 'moe-kenn', 'mirror-2025-squid', 'mirror-2026-squid'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '廟口魷魚羹攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-jiu-hi', 'moe-kenn', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong', 'mirror-2025-squid', 'mirror-2026-squid'],
        disclaimer:
          '廟口的魷魚羹攤是「飲食文化情境示意」：攤位的樣子、位置、桌椅都是依一般小吃攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。招牌只寫「魷魚羹」，沒有使用任何店名、商標或現代店面的照片。',
      },
    ],
  },
  {
    id: 'lao-pan-squid-soup',
    name: '老潘魷魚羹',
    status: 'open',
    category: '傳統小吃・羹湯',
    seal: '羹',
    theme: SQUID_SOUP_THEME.id,
    address: '臺北市大同區迪化街一段30號',
    // 創立年份未核實：留空（也不因為是傳統小吃就放進 1945–1980 的年代）
    yearNote: '創立年份未核實，資料留空。',
    sourceIds: ['fb-pannoodles', 'puddings-2023-pannoodles', 'walkerland-2021-laopan', 'andrewplus-laopan'],
    hasInterior: true,
    summary:
      '迪化街一段30號、永樂市場對面的羹湯小吃店：褪色的黃色招牌、紅色波浪邊的雨棚，騎樓下是不鏽鋼攤車；一樓的用餐區可以走進去。',

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
        title: '店家與位置｜永樂市場對面的老潘魷魚羹',
        lead: '老潘魷魚羹在臺北市大同區迪化街一段30號；Facebook 粉絲專頁的名稱是「老潘魷魚羹 Pannoodles house」。',
        paragraphs: [
          '位置：2023年的實訪紀錄在標題寫著店在「大稻埕永樂市場對面」。場景裡，老潘在迪化街南側的街尾、永樂市場前廣場的旁邊，隔著街道與廣場面對市場；街道是敘事式的配置，只保留「市場外、街道對面」的相對關係，不是精確的地籍位置。',
          '店面依實地照片的文字描述重建（開發時沒有直接取得照片）：褪色的黃色長方形主招牌上是紅色與深藍色的字，右側是紅底、有裝飾框的直立招牌；紅色帆布雨棚有波浪形的下緣與「冷氣開放」字樣；老街屋的紅磚、灰色牆面、窗框與少量外露的管線。2021年的食記也寫到「招牌顏色已褪去」。主招牌上的品名依食記核對，照片上的舊價格沒有放進場景。',
          '騎樓下、店門口是不鏽鋼攤車（2024年的食記寫到「攤車在外頭」）：玻璃展示罩、疊放的碗與兩口湯鍋。入口在攤車旁邊，一樓是狹長的用餐區：米色方形地磚、靠牆的桌子與紅色、深綠色的塑膠凳，中央留出走道；桌上有醋、胡椒粉與辣椒醬等調味料。',
          '未拍到的部分是示意：店內深處的尺寸與配置、後場與樓上都沒有照片依據，場景以簡化的方式呈現，樓上只做外觀。需求說明提到的一張室內照片標示為「內湖店」，那不是大稻埕這家店的室內，場景沒有依它重建平面。',
          '店裡的黑白貓是依照片的描述加入的情境角色：坐在座位區邊緣的桌腳旁，只會眨眼、轉頭與輕輕擺尾。本站不知道牠的名字，也不表示牠是店家飼養的貓。',
          '創立年份：本站沒有找到可以核實的資料，因此留空，也不把這家店放進其他年代。',
        ],
        facts: [
          { label: '地址', value: '臺北市大同區迪化街一段30號' },
          { label: '位置', value: '永樂市場對面（場景為敘事式配置）' },
          { label: '類型', value: '傳統小吃・羹湯' },
          { label: '創立年份', value: '未核實（留空）' },
          { label: '場景', value: '一樓用餐區可以走進去；樓上只做外觀' },
        ],
        sourceIds: ['fb-pannoodles', 'puddings-2023-pannoodles', 'walkerland-2021-laopan', 'andrewplus-laopan'],
      },
      {
        id: 'market',
        type: 'text',
        tab: '市場周邊飲食',
        title: '市場周邊飲食｜永樂市場、南北貨與一碗羹',
        lead: '老潘對面的永樂市場起源於1908年，現在的市場大樓於1985年開業；市場與迪化街的南北貨，構成這一帶的日常飲食。',
        paragraphs: [
          '永樂市場：臺北市市場處記載，市場「民國前4年成立」，民國71年拆除舊市場，「改建綜合大樓安置原攤商，74年開業」；臺北市政府的市集資訊介紹，市場一樓是「生鮮蔬果日用品」。',
          '南北貨與乾魷魚：魷魚「時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一」（教育部辭典）。《鏡週刊》裴偉的專欄寫道，早期的大稻埕「成為北部南北貨的集散地」，進口的大魷魚乾「當然是其中的重要商品」；另一篇專欄認為魷魚羹在1970年代於萬華、大稻埕一帶興起，「供貨源頭迪化街就在附近也是原因」。這些是專欄作者的看法，不是學術考證。',
          '羹與沙茶：「羹」是「芶芡而成的濃稠湯汁」；「沙茶」是「用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料」（教育部辭典）。2021年的食記寫到，老潘「整體就是以沙茶最為主要的調味」。',
          '同一個飲食主題：切換到「1945–1980」，慈聖宮的廟口有一個魷魚羹攤的情境示意。那個攤位不是老潘的前身，老潘也不是從廟口遷出；兩者只是一起呈現魷魚羹這種小吃。',
        ],
        glossary: [
          { term: '鰇魚羹', taiwanese: 'jiû-hî-kenn', taiwaneseSource: 'moe-jiu-hi-kenn', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。' },
          { term: '羹', taiwanese: 'kenn', taiwaneseSource: 'moe-kenn', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。' },
          { term: '沙茶', taiwanese: 'sa-te', taiwaneseSource: 'moe-sa-te', definition: '用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料（同上）。' },
        ],
        sourceIds: ['tcma-yongle-market', 'taipei-market-info-yongle', 'moe-jiu-hi', 'moe-kenn', 'moe-sa-te', 'mirror-2026-squid', 'mirror-2025-squid', 'walkerland-2021-laopan'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表餐點',
        title: '代表餐點｜四道展示餐點',
        intro:
          '入口旁第一張桌子上的四道展示餐點。品名依網路食記與實訪紀錄核對；這些是展示用的模型，不代表完整或即時的菜單，也不寫配方、份量與售價。',
        items: [
          {
            id: 'shacha-squid-geng',
            name: '沙茶魷魚羹',
            category: '羹湯｜沙茶',
            description: '用魷魚作成的羹湯（教育部辭典）。厚實的白碗裡是褐色的羹湯、看得出形狀的魷魚片與少量葉菜。',
            note: '2023年的實訪紀錄在標題寫著「沙茶魷魚焿」；2024年的食記有「沙茶魷魚羹米粉」。',
          },
          {
            id: 'fish-crisp-geng',
            name: '魚酥羹',
            category: '羹湯｜魚酥',
            description: '魚酥是把魚漿加入麵粉、地瓜粉等，切成條狀或片狀，油炸成的酥脆食品（教育部辭典）；不規則的金黃魚酥片有一部分露出湯面。',
            note: '品名「魚酥羮」見於美食網站彙整的食記摘錄；2021年的食記寫到「魚酥很新鮮的酥脆」。',
          },
          {
            id: 'tempura',
            name: '甜不辣',
            category: '魚漿製品｜蘿蔔',
            description: '今日臺灣一般所指的甜不辣，「是指條狀或扁平狀的炸魚漿」（教育部辭典）。盤子裡是不同形狀的魚漿製品、蘿蔔塊與醬汁。',
            note: '2011到2024年的多篇食記都寫到老潘的甜不辣；盤中的樣子是示意。',
          },
          {
            id: 'dry-shacha-squid',
            name: '乾拌沙茶生魷魚',
            category: '乾拌｜沙茶',
            description: '不加湯的乾拌：魷魚片、豆芽、深色的沙茶醬與綠色的葉片（示意的造型）。',
            note: '2024年的食記寫到「乾拌沙茶生魷魚」是限量款。',
          },
        ],
        footnote: '品名依2021–2024年的網路食記與2023年的實訪紀錄核對，只代表那些記錄；照片上的舊價格沒有使用。',
        sourceIds: ['moe-jiu-hi-kenn', 'moe-hi-soo', 'moe-tian-bu-la', 'moe-sa-te', 'puddings-2023-pannoodles', 'andrewplus-laopan', 'walkerland-2021-laopan', 'fonfood-laopan'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '老潘魷魚羹與魷魚羹飲食文化的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
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
      },
    ],
  },

  /* ── 以下店家先作為街景中的可見建築（即將開放），詳細故事與文獻於後續版本補上 ── */
  {
    id: 'temple-mi-tai-mu-stall',
    name: '廟口米苔目攤',
    status: 'open',
    category: '廟口小吃・米苔目',
    seal: '米',
    // 與 2000–現在的永樂米苔目同一個飲食主題（只以主題串連，沒有傳承關係）
    theme: MI_TAI_MU_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
    summary:
      '慈聖宮廟口小吃群裡的一攤米苔目：木攤台、帆布棚、煤球爐上的湯鍋與兩張小桌，攤販在攤台後招呼客人。這是飲食文化的情境示意，不是特定的店家。',

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
    },
    camera: { distance: 4.4, height: 2.0, side: 2.6, lookHeight: 1.1 },
    hotspots: hotspotsToWorld(MI_TAI_MU_STALL_HOTSPOTS, miTaiMuStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'temple-food',
        type: 'text',
        tab: '廟口的米苔目',
        title: '廟口的米苔目',
        lead: '米苔目是台灣常見的庶民小吃，在戰後至1980年代的大稻埕，也屬於廟口與街邊常見的日常飲食之一。',
        paragraphs: [
          '說明｜上面這一段是本站對米苔目作為庶民小吃的一般介紹。本站沒有找到記錄戰後大稻埕廟口米苔目攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰。',
          '史料｜教育部《臺灣台語常用詞辭典》在「目」（ba̍k，細孔）的用例裡收錄「米篩目」（bí-thai-ba̍k）：「米篩的網目，也指篩出的米條食品」。華語常寫作「米苔目」。',
          '史料｜辭典裡的「廟口」是「廟門口、廟前廣場」，賣點心小吃的攤販稱為「點心擔」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮「廟前則是一排老牌的小吃攤」。',
          '情境設計｜場景中的攤位：淡綠色油漆、磨舊的木攤台與金屬工作面，淡藍色的帆布棚，煤球爐上的大湯鍋（掀開一半的木鍋蓋、少量蒸氣），一盆生的米苔目、疊碗、展示的一碗湯米苔目與兩碟小菜，以及兩張小方桌與木凳。攤販在攤台後招呼客人，兩位客人坐著吃，一位站在旁邊等。招牌只寫「米苔目」，沒有店名或商標。攤位與人物都是依一般的廟口小吃攤設計的示意。',
          '同一個飲食主題｜切換到「2000–現在」，可以在迪化街北側走進永樂米苔目的店面。兩者只是同樣以米苔目為主題：場景沒有表示這個攤位是永樂米苔目的前身，也不表示永樂米苔目當時已經在這裡擺攤。',
        ],
        facts: [
          { label: '位置', value: '慈聖宮廟埕東側的前緣、廟口小吃群裡（場景配置）' },
          { label: '年代', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）' },
          { label: '性質', value: '飲食文化情境示意，不是特定的店家' },
          { label: '招牌', value: '只寫「米苔目」' },
        ],
        glossary: [
          { term: '米篩目（米苔目）', taiwanese: 'bí-thai-ba̍k', taiwaneseSource: 'moe-bi-thai-bak-entry', definition: '米篩的網目，也指篩出的米條食品（教育部《臺灣台語常用詞辭典》）。' },
          { term: '廟口', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。' },
          { term: '點心擔', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。' },
        ],
        sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
      },
      {
        id: 'bowl',
        type: 'foods',
        tab: '一碗米苔目',
        title: '一碗米苔目',
        intro: '攤台上展示的一碗湯米苔目與兩碟小菜，強調庶民的日常飲食。材料與做法是一般的說明，不是某一家的配方。',
        items: [
          {
            id: 'temple-mi-tai-mu',
            name: '湯米苔目',
            category: '米食｜湯',
            description: '「米篩目」是篩出的米條食品（教育部辭典）：短短的、兩端略尖的白色米條，盛在湯裡，撒上韭菜與油蔥酥。',
            note: '場景中的一碗是示意，不代表配方或份量；這個攤位不對應任何實際的店家。',
          },
          {
            id: 'side-dishes',
            name: '小菜（示意）',
            category: '配菜',
            description: '攤台上兩碟簡單的小菜：油豆腐與燙青菜。',
            note: '本站沒有查到戰後廟口米苔目攤的菜色紀錄；這兩碟只是一般小吃攤的示意。',
          },
        ],
        footnote: '展示的一碗與小菜是示意模型，不代表價格、份量或配方。',
        sourceIds: ['moe-bi-thai-bak'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '廟口米苔目攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        sourceIds: ['moe-bi-thai-bak', 'moe-biau-khau', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
        disclaimer:
          '廟口的米苔目攤是「飲食文化情境示意」：攤位的樣子、位置、桌椅與人物都是依一般的廟口小吃攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。招牌只寫「米苔目」，沒有使用任何店名、商標或現代店面的照片。',
      },
    ],
  },
  {
    id: 'temple-douhua-stall',
    name: '廟口豆花攤',
    status: 'open',
    category: '廟口甜食・豆花',
    seal: '豆',
    // 飲食主題：只以食物主題連結 2000–現在的導演的豆花店（參訪對照，沒有品牌傳承關係）
    theme: DOUHUA_THEME.id,
    // 飲食文化的情境示意：不是特定的攤位，沒有店名、年份與店史
    scenarioNote: '飲食文化情境示意',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'wiki-ci-sheng-gong'],
    summary:
      '慈聖宮廟口小吃區裡的一攤豆花：木框推車、有蓋的豆花桶、糖水壺與兩張木凳，攤販用扁平的舀匙舀豆花。這是飲食文化的情境示意，不是特定的店家。',

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
    },
    camera: { distance: 3.8, height: 1.9, side: 2.0, lookHeight: 1.0 },
    hotspots: hotspotsToWorld(DOUHUA_STALL_HOTSPOTS, douhuaStallToWorld),

    // ── 介紹章節 ──────────────────────────────
    chapters: [
      {
        id: 'douhua-stall',
        type: 'text',
        tab: '豆花與甜食攤',
        title: '豆花與甜食攤',
        lead: '廟口小吃區裡的一攤豆花：木框推車上放著有蓋的豆花桶與糖水壺，攤販用扁平的舀匙把豆花一片一片舀進碗裡，淋上糖水，喜歡的話再加一小撮花生。',
        paragraphs: [
          '說明｜這是本站依一般的推車式甜食攤設計的飲食文化情境示意。本站沒有找到記錄戰後大稻埕慈聖宮廟口豆花攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰；攤位出現在1945–1980，也不表示豆花是從這個時期才有的。',
          '史料｜教育部《臺灣台語常用詞辭典》的「豆花」（tāu-hue）：「在豆漿中加入少量的鹽滷或石膏，使能凝結成比豆腐還嫩的食品。通常加糖水和花生，當作甜食。」',
          '史料｜農業部〈豆花凝膠機制的介紹〉說明，豆漿中的大豆蛋白和凝固劑作用，形成凝膠的結構；凝固劑不同，口感也不同，例如以鹽滷凝結的豆花口感偏硬脆。',
          '史料｜辭典裡賣點心小吃的攤販稱為「點心擔」，「廟口」是「廟門口、廟前廣場」。維基百科〈大稻埕慈聖宮〉記載，慈聖宮「廟前則是一排老牌的小吃攤」；這段記載沒有提到豆花，本站也不據此推定當時的攤位。',
          '情境設計｜木框推車（一端兩個木輪，另一端是腳架與推把）、推車背面兩根木柱撐起的小布棚，棚角掛著只寫「豆花」的米白布幌；推車上是有蓋的圓形木豆花桶與扁平的舀匙、糖水壺、一小盆花生、泡著湯匙的水盆與疊碗，以及展示的兩碗豆花；推車前兩張木凳，推車後是攤販舀豆花的空間。攤販是沒有名字的情境人物。',
          '現代相關店家｜切換到「2000–現在」，迪化街一段224巷裡有導演的豆花店。它和這個攤位只是同類食物的參訪對照：導演的豆花店有自己的店史（2019年的豆花車、2021年的店面），場景與介紹都不表示它由廟口的豆花攤發展而來，兩者也沒有品牌的傳承關係。',
        ],
        facts: [
          { label: '位置', value: '慈聖宮廟埕西側的後段、天公爐與榕樹之間（場景配置）' },
          { label: '年代', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）' },
          { label: '性質', value: '飲食文化情境示意，不是特定的店家' },
          { label: '招牌', value: '只寫「豆花」的米白布幌' },
          { label: '現代相關店家', value: '導演的豆花店（2000–現在；同類食物的參訪對照，沒有品牌傳承關係）' },
        ],
        glossary: [
          { term: '豆花', taiwanese: 'tāu-hue', taiwaneseSource: 'moe-douhua', definition: '豆漿加入少量的鹽滷或石膏凝結成比豆腐還嫩的食品，通常加糖水和花生當作甜食（教育部《臺灣台語常用詞辭典》）。' },
          { term: '點心擔', taiwanese: 'tiám-sim-tànn', taiwaneseSource: 'moe-tiam-sim-tann', definition: '賣點心小吃的攤販（同上）。' },
          { term: '廟口', taiwanese: 'biō-kháu', taiwaneseSource: 'moe-biau-khau', definition: '廟門口、廟前廣場（同上）。' },
        ],
        sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
      },
      {
        id: 'douhua-bowls',
        type: 'foods',
        tab: '兩碗豆花',
        title: '兩碗豆花',
        intro: '推車上展示的兩碗豆花：米白色、薄而柔軟的豆花片浮在淡琥珀色的糖水裡。材料是辭典的一般說明，不是某一家的配方。',
        items: [
          {
            id: 'temple-plain-douhua',
            name: '原味糖水豆花',
            category: '甜食｜豆花',
            description: '用扁平的舀匙一片一片舀起的豆花，淋上淡琥珀色的糖水。豆花是豆漿加少量鹽滷或石膏凝結而成，比豆腐還嫩（教育部辭典）。',
            note: '場景中的一碗是示意，不代表配方、甜度或份量；這個攤位不對應任何實際的店家。',
          },
          {
            id: 'temple-peanut-douhua',
            name: '花生豆花',
            category: '甜食｜豆花',
            description: '同樣的豆花與糖水，再加一小撮花生。教育部辭典的說明：豆花「通常加糖水和花生，當作甜食」。',
            note: '花生做成小小的橢圓顆粒；本站沒有查到戰後廟口豆花攤的配料紀錄，這一碗只是一般的示意。',
          },
        ],
        footnote: '展示的兩碗是示意模型，不代表價格、份量或配方。',
        sourceIds: ['moe-douhua'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '廟口豆花攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        sourceIds: ['moe-douhua', 'moa-douhua-gel', 'moe-tiam-sim-tann', 'moe-biau-khau', 'wiki-ci-sheng-gong'],
        disclaimer:
          '廟口的豆花攤是「飲食文化情境示意」：攤位的樣子、位置與人物都是依一般的推車式甜食攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。布幌只寫「豆花」，沒有使用導演的豆花店或任何店家的店名、商標、包裝與裝潢。',
      },
    ],
  },
  {
    id: 'temple-kueh-stall',
    name: '廟口糕粿攤',
    status: 'open',
    category: '廟口小吃・糕粿',
    seal: '粿',
    // 飲食主題：只以食物主題連結 2000–現在永樂市場的好粿緣（參訪對照，沒有品牌傳承關係）
    theme: KUEH_THEME.id,
    scenarioNote: '飲食文化情境示意',
    yearNote: '飲食文化情境示意：這個攤位不對應任何實際的店家，沒有創立年份或店史。',
    sourceIds: ['moe-guo', 'moe-cao-guo', 'moe-hong-gui', 'moe-oo-kue', 'moe-cai-tau-guo', 'nmth-hong-gui-mold'],
    summary:
      '慈聖宮廟口小吃區裡的一攤糕粿：低矮的木桌上有竹蒸籠與分區的木托盤，擺著草仔粿、紅龜粿、芋粿與蘿蔔糕。這是飲食文化的情境示意，不是特定的店家。',

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
    },
    camera: { distance: 3.8, height: 1.9, side: -2.0, lookHeight: 0.9 },
    hotspots: hotspotsToWorld(KUEH_STALL_HOTSPOTS, kuehStallToWorld),

    chapters: [
      {
        id: 'kueh-stall',
        type: 'text',
        tab: '糕粿與米食',
        title: '糕粿與日常／節慶米食',
        lead: '廟口小吃區裡的一攤糕粿：低矮的木桌上擺著竹蒸籠與分區的木托盤，草仔粿與紅龜粿墊著葉子，旁邊的木板上是芋粿與蘿蔔糕，一部分用乾淨的布巾蓋著。',
        paragraphs: [
          '說明｜這是本站依一般的矮桌式糕粿攤設計的飲食文化情境示意。本站沒有找到記錄戰後大稻埕慈聖宮廟口糕粿攤的文獻或照片，所以不寫哪一年、哪一攤，也不寫攤販是誰；攤位出現在1945–1980，也不表示這些米食是從這個時期才有的。',
          '史料｜教育部《臺灣台語常用詞辭典》的「粿」：「糕的總稱，指用糯米或粳米等做成的食品。因所加的原料不同而有不同的稱法。」農業部〈「粿」然如此製粿稻米品種介紹〉說明，蘿蔔糕、碗粿等以在來米製成，圓糯米磨粉後則製成草仔粿、紅龜粿、菜包等。',
          '節慶的米食｜辭典的「草仔粿」：外皮以「粿粞」加入艾草或鼠麴草揉成，外墊黃槿葉或月桃葉等，以蒸籠蒸熟，常做為農曆七月普渡或清明掃墓時的供品。「紅龜粿」：粿皮染紅、以模具印上龜型的圖樣後蒸製，經常用來祭拜神明、酬神，或在添丁時分送親友。國立臺灣歷史博物館的粿模藏品說明，神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽都可見到紅龜粿。',
          '日常與年節的米食｜辭典的「芋粿」是「臺灣小吃的一種。以米漿和芋頭為主要材料，蒸熟後食用」；「菜頭粿」就是蘿蔔糕，是在來米漿拌入炒過的蘿蔔絲、蝦米等配料蒸製而成。農業部的〈年糕＆蘿蔔糕〉提到，「菜頭」與「彩頭」諧音，蘿蔔糕因此成為過年必備的菜色。',
          '情境設計｜兩組木架腳撐起的矮木桌、桌後兩根木柱撐著的木製橫牌「傳統糕粿」；桌上一疊竹蒸籠（少量蒸氣）、分區的木托盤（草仔粿、紅龜粿，墊著葉子，後排用布巾蓋著）、木板上的芋粿與蘿蔔糕（整塊與切片）與食品夾；桌後是少量備用的籃筐與糕模。攤販是沒有名字的情境人物。草仔粿與紅龜粿是主要的展示，芋粿與蘿蔔糕是傳統米食的示意。',
          '現代相關店家｜切換到「2000–現在」，永樂市場一樓有好粿緣的粿攤。它和這個攤位只是同類食物的參訪對照：場景與介紹都不表示好粿緣由廟口的糕粿攤發展而來，兩者沒有品牌的傳承關係；這裡的四種米食也不是好粿緣的菜單。',
        ],
        facts: [
          { label: '位置', value: '慈聖宮廟埕東側的後段、天公爐與榕樹之間（場景配置）' },
          { label: '年代', value: '1945–1980「庶民生活」（攤位本身沒有對應的年份）' },
          { label: '性質', value: '飲食文化情境示意，不是特定的店家' },
          { label: '招牌', value: '木製橫牌「傳統糕粿」' },
          { label: '現代相關店家', value: '好粿緣（2000–現在，永樂市場一樓；同類食物的參訪對照，沒有品牌傳承關係）' },
        ],
        glossary: [
          { term: '粿', taiwanese: 'kué', taiwaneseSource: 'moe-guo', definition: '糕的總稱，指用糯米或粳米等做成的食品（教育部《臺灣台語常用詞辭典》）。' },
          { term: '粿粞', taiwanese: 'kué-tshè', taiwaneseSource: 'moe-kue-tshe', definition: '草仔粿的外皮材料：加入艾草或鼠麴草揉成（同上，「草仔粿」）。' },
          { term: '粿模', definition: '印出紅龜粿龜甲紋路的木模；早期農業社會居家常見（國立臺灣歷史博物館）。' },
        ],
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moa-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
      },
      {
        id: 'kueh-foods',
        type: 'foods',
        tab: '四種米食',
        title: '四種傳統米食',
        intro: '托盤與木板上分盤陳列的四種米食：形狀、顏色與厚度各不相同。說明整理自教育部辭典、農業部與國立臺灣歷史博物館的資料，是一般的說明，不是某一家的配方或菜單。',
        items: [
          {
            id: 'temple-cao-a-kue',
            name: '草仔粿',
            category: '米食｜節慶（主要展示）',
            description: '深綠色、扁圓的粿，表面略有手捏的起伏，墊著葉子。外皮以粿粞加入艾草或鼠麴草揉成，以蒸籠蒸熟；常做為農曆七月普渡或清明掃墓時的供品（教育部辭典）。',
            note: '內餡沒有切開展示；場景中的模型不代表口味、配方或份量。',
          },
          {
            id: 'temple-ang-ku-kue',
            name: '紅龜粿',
            category: '米食｜節慶（主要展示）',
            description: '紅色、扁橢圓的粿，表面是印模壓出的龜甲紋——中央的六角形與外圈的龜殼紋路（國立臺灣歷史博物館的粿模藏品）。用來祭拜神明、酬神，或在添丁時分送親友（教育部辭典）。',
            note: '龜甲紋是簡化的示意，沒有複製特定的粿模。',
          },
          {
            id: 'temple-oo-kue',
            name: '芋粿',
            category: '米食｜日常（示意）',
            description: '灰白色的厚片，切面看得到少量紫灰色的芋頭顆粒。辭典的說明：「以米漿和芋頭為主要材料，蒸熟後食用」的臺灣小吃。',
            note: '傳統米食的示意，不代表任何店家現行的菜單。',
          },
          {
            id: 'temple-cai-tau-kue',
            name: '蘿蔔糕（菜頭粿）',
            category: '米食｜年節（示意）',
            description: '米白色的長方塊，展示整塊與切片兩種樣子。在來米漿拌入炒過的蘿蔔絲、蝦米等配料蒸製而成（教育部辭典）；「菜頭」與「彩頭」諧音，是過年必備的菜色（農業部）。',
            note: '傳統米食的示意，不代表任何店家現行的菜單。',
          },
        ],
        footnote: '展示的米食是示意模型，不代表價格、份量或配方；草仔粿與紅龜粿是主要的展示，芋粿與蘿蔔糕是傳統米食的示意，不是好粿緣的菜單。',
        sourceIds: ['moe-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '廟口糕粿攤的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。',
        sourceIds: ['moe-guo', 'moa-guo-rice', 'moe-cao-guo', 'moa-cao-guo', 'moe-hong-gui', 'nmth-hong-gui-mold', 'moe-oo-kue', 'moe-cai-tau-guo', 'moa-niangao'],
        disclaimer:
          '廟口的糕粿攤是「飲食文化情境示意」：攤位的樣子、位置與人物都是依一般的矮桌式糕粿攤設計的，不代表某一家實際的攤位；未查證的年代、店史與傳承關係都沒有寫入。橫牌只寫「傳統糕粿」，沒有使用好粿緣或任何店家的店名、招牌、包裝與售價。',
      },
    ],
  },
  {
    id: 'yong-le-mi-tai-mu',
    name: '永樂米苔目',
    status: 'open',
    category: '傳統小吃・米苔目',
    seal: '米',
    theme: MI_TAI_MU_THEME.id,
    address: '臺北市大同區民樂街111號',
    // 創立年份未核實：留空（招牌上的「50年老店」與媒體的說法見介紹，不當成查證過的年份）
    yearNote: '創立年份未核實，資料留空。',
    sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang'],
    hasInterior: true,
    summary:
      '永樂市場一帶的米苔目小吃店：白色小方磚的狹長街屋、紅色直條紋主招牌上的金色立體字；一樓狹長、明亮的用餐區可以走進去。',

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
        title: '永樂米苔目',
        lead: '到了現代，大稻埕的傳統庶民飲食不只留在記憶裡，也以具體店家的形式延續下來。永樂米苔目就是其中一種代表性的小吃場景。',
        paragraphs: [
          '位置｜永樂米苔目在臺北市大同區民樂街111號，永樂市場一帶（Bella儂儂2021年、2025年的美食整理）。2013年食尚玩家的報導寫的是舊址永昌街7號，「在永樂市場與霞海城隍廟間的巷子中」；2025年的整理寫到店家「搬遷到民樂街」。場景的街道是敘事式配置，店放在迪化街北側，只保留「永樂市場／迪化街商圈」的關係，不是精確的地籍位置。',
          '店面（依照片）｜白色小方磚的狹長街屋，垂直感明顯；紅色橫式主招牌有一條一條直向的凸條，金色立體字寫「永樂米苔目」，右側直寫小字「50年老店」；左右兩側各有一面紅色的直立招牌。一樓入口內縮成騎樓：右邊是開放的入口，左邊是外帶區的櫃檯與大排煙罩，排煙管沿著騎樓天花接到地上的鼓風機，騎樓吊著兩盞藤編吊燈、停著機車。',
          '年份｜招牌上寫著「50年老店」。媒體的說法有：2013年食尚玩家寫「40年老店」，2025年Bella儂儂寫「從民國五十六年創立至今，已傳承三代」。這些說法彼此大致相符，但本站沒有找到店家或文史資料可以核實，所以創立年份留空，只把「50年老店」當成招牌上的文字，也沒有把這家店放進1945–1980的年代。',
          '同一個飲食主題｜切換到「1945–1980」，可以在慈聖宮的廟口小吃群看到一攤米苔目。那是飲食文化的情境示意，不是這家店的前身，場景也不表示兩者有傳承關係。',
        ],
        facts: [
          { label: '地址', value: '臺北市大同區民樂街111號（2021、2025年的媒體整理）' },
          { label: '舊址', value: '永昌街7號（2013年的報導）' },
          { label: '創立年份', value: '未核實（招牌寫「50年老店」）' },
          { label: '年代', value: '2000–現在「老屋新生」' },
        ],
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food'],
      },
      {
        id: 'dining',
        type: 'text',
        tab: '店內的用餐空間',
        title: '店內的用餐空間',
        lead: '狹長的一樓從門口一路通到後方：明亮、熱鬧、翻桌很快的米苔目小吃店。',
        paragraphs: [
          '依照片｜淺色的亮面大地磚、白色天花與圓形嵌燈、牆上的壁扇；右牆是一大片菜單板與紅色的桌號牌，中間與靠右牆兩排淺色木紋的方桌，配黑色的圓凳；左邊沿牆是調味料與筷筒的長櫃，後方是木作櫃台與藍色的牆面。',
          '情境人物｜店裡坐著幾位吃米苔目的客人，門口有人排隊、有人點外帶，外帶區與後方櫃台各有一位店員。他們是簡化的情境人物，不對應照片裡的任何人，也沒有名字或身分。',
          '示意｜菜單板只畫菜色的圓形圖，不寫品名與價格；告示與桌號牌只做樣子。桌椅的數量與間距、後方的配置是簡化的示意，不是精確的平面；照片裡的路人、價目與告示的文字都沒有放進場景。',
        ],
        facts: [
          { label: '空間', value: '狹長的一樓用餐區（依照片簡化）' },
          { label: '座位', value: '方桌與黑色圓凳，中間一排、靠右牆一排' },
          { label: '人物', value: '情境人物，不對應照片裡的任何人' },
        ],
        sourceIds: ['bella-2025-dadaocheng'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '一碗米苔目',
        title: '一碗米苔目',
        intro: '走道邊第一張桌子上：一碗湯米苔目與幾樣小菜。品項依食記與媒體的整理核對；這是展示用的示意，不代表完整或即時的菜單，也不寫價格。',
        items: [
          {
            id: 'mi-tai-mu-soup',
            name: '湯米苔目',
            category: '米食｜湯',
            description: '短而粗的米條盛在大骨湯裡，帶著油蔥與韭菜的香氣（Bella儂儂2021年、2025年的整理）。',
            note: '2025年的整理也提到乾米苔目（甜辣醬、醬油膏與韭菜蔥花）；場景只展示湯的。',
          },
          {
            id: 'pork-cheek',
            name: '嘴邊肉',
            category: '黑白切',
            description: '豬嘴邊的肉切片；2013年食尚玩家與2021、2025年Bella儂儂的整理都提到。',
            note: '場景中淋醬油膏、放薑絲是一般黑白切的示意，不代表店家的做法。',
          },
          {
            id: 'fried-tofu',
            name: '油豆腐',
            category: '小菜',
            description: '炸過的豆腐塊，2021年的整理提到的小菜之一。',
          },
          {
            id: 'daikon',
            name: '菜頭',
            category: '小菜',
            description: '白蘿蔔（台語「菜頭」）煮成的小菜，2021年的整理提到的小菜之一。',
          },
        ],
        footnote: '展示的餐點是示意模型，不代表價格、份量或配方；店家的菜色以現場為準。',
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-apang'],
      },
      XIA_ER_ZUI_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '永樂米苔目的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。店面與店內的 3D 模型另外依使用者提供的實地照片建模。',
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang', 'moe-bi-thai-bak', ...XIA_ER_ZUI_CHAPTER.sourceIds],
        disclaimer:
          `媒體與食記只支持當次的記錄，不當成最新的價格、營業時間或店史；創立年份、店史與傳承關係沒有可以核實的資料，都沒有寫成事實。照片裡的路人、隔壁店家的招牌與廣告沒有放進場景，店裡的人物是簡化的情境人物。${XIA_ER_ZUI_DISCLAIMER}`,
      },
    ],
  },
  {
    id: 'dodd-tea-house',
    name: '寶順洋行與李春生',
    theme: 'tea',
    // 文化據點（茶葉外銷的起點）：不是餐廳，沒有食物圖鑑；只出現在「港口商街」
    kind: 'heritage',
    status: 'open',
    year: 1866,
    yearLabel: '1860年代（陶德來臺、設洋行的年份各資料記載不一）',
    yearNote: '陶德（John Dodd）來臺的年份有1860、1864、1865三種記載；寶順洋行（Dodd & Co.）設立的年份有1865、1866、1869三種記載。李春生1895年的自敘寫「迨三十歲（1866年），復受英商寶順行重盟，東渡在台北」。',
    sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'ntcri-73-tea-road'],
    category: '文化據點｜洋行・茶葉外銷',
    seal: '洋行',
    summary: '英商陶德的寶順洋行與買辦李春生把臺灣烏龍茶賣到紐約：自安溪引進茶苗、在大稻埕設精製茶廠，1869年「Formosa Oolong」打開美國市場，大稻埕從此成為茶葉外銷的中心。',
    note: '寶順洋行與李春生的茶行都在淡水河邊的建昌街、千秋街（今貴德街）一帶，不在迪化街；街上這棟兩層的洋樓是情境示意，依文獻「臺北第一條洋樓街」的描述設計，並非精確復原。',
    // 用 site 取代北側林復振與有記之間的一般地段 north-5（只在港口商街），不另外預留店面地段：
    // 預留會改變五個年代共用的地段編號與其他建築的種子
    position: { x: 5.15, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.4 },
    site: { x:  5.15, z: -4.5, rotationY: 0, replaces: ['north-5'] },
    building: {
      archetype: 'baroque',
      width: 6.9,
      depth: 11,
      floors: 2,
      plasterTint: '#f1e9d8',
      trimTint: '#fbf7ee',
      storefront: 'half',
      sign: { text: 'Dodd & Co. 寶順洋行', style: 'wood' },
      parapet: 'scroll',
    },
    buildingByEra: {
      'qing-port': { condition: 'new' },
    },
    eraNotes: {
      'qing-port':
        '只出現在「港口商街」。1860年代淡水開港後，英商陶德在臺灣北部收茶、引進安溪茶苗，1868年把精製茶廠設在大稻埕，1869年把烏龍茶運往紐約。廈門人李春生是他的買辦，後來自營茶業，被稱為「臺灣茶業之父」。這棟洋樓是情境示意：洋行與李春生的事業都在河邊的建昌街、千秋街。',
    },
    camera: { distance: 6.6, height: 4.2, side: 5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'dodd',
        type: 'text',
        tab: '洋行與茶',
        title: '陶德與寶順洋行',
        lead: '一位英國商人看見臺灣茶的潛力：引進茶苗、貸款茶農、在大稻埕設廠精製，再把烏龍茶賣到紐約。',
        paragraphs: [
          '淡水開港後，英國商人陶德（John Dodd）來到臺灣北部。學者陳慈玉記載他1865年來臺、翌年設立寶順洋行（Dodd & Co.）試購茶葉；國史館的編者說明則寫寶順行1869年創設於大稻埕，到1890年3月陶德離臺返國為止。各資料的年份不一，本站並列。',
          '1866年，陶德自福建安溪移植烏龍茶的茶樹，貸款給農民、教授製法（陳慈玉）；李春生的自敘也寫到陶德派他到安溪採辦茶苗。1867年輸往澳門的臺灣茶獲得好評。1868年，精製茶廠設在大稻埕——臺北市政府文化局的手冊寫陶德與李春生放棄艋舺的據點、改在大稻埕設廠，《臺北畫刊》則寫「艋舺人仍保守地排拒洋人的時候，大稻埕卻開設了洋行」。',
          '1869年，寶順洋行把烏龍茶運往美國紐約，大受歡迎。臺北市政府的英文報導寫兩艘大帆船載了將近十三萬公斤的茶；運量在各資料裡的數字不一，本站只寫「約十三萬公斤」。這批茶以「Formosa Oolong」為名，奠定臺茶外銷的基礎。1872年以後，寶順、德記、怡記、和記、水陸五家洋行在北臺灣競爭茶葉外銷。',
        ],
        timeline: [
          { place: '1862', text: '滬尾正式設關開埠（通稱1860年淡水開港）。' },
          { place: '1866', text: '陶德自安溪引進茶苗，貸款給茶農種植。' },
          { place: '1868', text: '精製茶廠設在大稻埕。' },
          { place: '1869', text: '烏龍茶運往紐約，「Formosa Oolong」打開美國市場。' },
          { place: '1872 後', text: '五家洋行在北臺灣競爭茶葉外銷。' },
          { place: '1890', text: '陶德離臺返國。' },
        ],
        glossary: [
          { term: '洋行', definition: '外國商人在開港口岸設立的貿易商號。' },
          { term: '買辦', definition: '洋行雇用的本地商人，替洋行與本地的茶農、茶販交易；李春生就是寶順洋行的買辦。' },
          { term: '精製', definition: '茶農初製的毛茶運到茶廠再篩選、烘焙、分級，才能裝箱外銷。以前要運到福州、廈門精製，大稻埕設廠後就地完成。' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'taipei-gov-tea-tasting-2017', 'tshs-tamsui-customs-lesson', 'tshs-zhang-tamsui-port'],
      },
      {
        id: 'li',
        type: 'text',
        tab: '買辦李春生',
        title: '買辦李春生',
        lead: '廈門來的基督徒商人，先當洋行的買辦，再自營茶業，被稱為「臺灣茶業之父」。',
        paragraphs: [
          '李春生1838年生於福建廈門，父親是船員。他1851年在廈門受洗，是長老教會的信徒；自敘寫「自幼奉耶穌教，年十五學商業，兼習英國語文」。1857年起受雇於廈門的英商怡記洋行（Elles & Co.），從事洋貨與茶的貿易。',
          '1866年（自敘「迨三十歲」；陳慈玉記為1865年），他受英商寶順行之聘來到臺北，擔任買辦。他和陶德到大溪調查樟腦時發現野生茶樹，提議自安溪移植茶樹獎勵農民栽種（陳慈玉）。寶順行結束後，他續任英商和記行的買辦，自敘寫他在臺灣住了二十九年。',
          '李春生後來自營茶商，烏龍茶經廈門輸往美國而致富，並改良烏龍茶的製法與品牌（陳慈玉）。1896年1月日本人的調查，大稻埕的茶商有252店，李春生的「李節記」資本四萬円、店員二十三人，資本額排第三，僅次於林本源的建祥號與黃爾仰的聯成行。國史館稱他是「清季台灣北部最有名富紳」。2002年臺北市文獻會的座談會上，與會者認為他打出了「福爾摩莎烏龍茶」的品牌。',
        ],
        facts: [
          { label: '生卒', value: '1838年1月12日，福建廈門；1924年9月7日' },
          { label: '信仰', value: '1851年在廈門受洗，長老教會' },
          { label: '洋行', value: '1857年廈門怡記洋行；1866年臺北寶順洋行買辦；後任和記洋行買辦' },
          { label: '茶行', value: '李節記（1896年資本額居大稻埕茶商第三）' },
          { label: '稱號', value: '臺灣茶業之父（杜聰明的定位）' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-2002-events', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'street',
        type: 'text',
        tab: '建昌街與揀茶女',
        title: '洋樓街、教會與揀茶女',
        lead: '李春生和林維源在河邊蓋起臺北第一條洋樓街；茶行的騎樓下，揀茶的婦女在茶袋與茶箱之間穿梭。',
        paragraphs: [
          '1878年，李春生與林維源捐出巨款並督造臺北城；1887年他資助劉銘傳的鐵路並參與監督，竣工後獲「五品同知」。1889年，劉銘傳把大稻埕沿岸的河灘地交給林維源開發，林維源邀李春生合作成立建昌公司，在建昌街與千秋街蓋店屋出租給洋商，這一帶成為臺北第一條洋樓街，也就是戰後的貴德街；寶順、怡和、德記等洋行與數十家茶行聚集在這條「茶街」。',
          '李春生獨資捐建甘州街的大稻埕教會；1935年，孫輩在貴德街44號建李春生紀念教會紀念他（國史館寫教堂為他捐建，與其他來源不同，本站採後代所建）。',
          '茶業也改變了大稻埕婦女的生活。1981年的《光華》雜誌描述，揀茶的婦女熙來攘往，在堆塞街衢廊下的茶袋、茶箱中穿梭；《臺灣史研究》的論文指出，茶業給予婦女婚姻以外的選擇，大稻埕婦女的結婚比例因此低於臺北盆地的邊緣。揀茶女的人數沒有查到統計，本站不寫數字。',
        ],
        facts: [
          { label: '1878', value: '與林維源捐款並督造臺北城' },
          { label: '1889', value: '建昌公司：建昌街、千秋街（今貴德街）的洋樓街' },
          { label: '教會', value: '大稻埕教會（甘州街，李春生捐建）；李春生紀念教會（貴德街44號，1935年5月5日設立）' },
        ],
        sourceIds: ['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'pct-li-chunsheng-church', 'panorama-dadaocheng-1981', 'wolf-women-tea-2003'],
      },
      // 第 8 階段：人物小節（純文字，資料在 liChunShengData.js）
      LI_CHUNSHENG_PERSON_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/tea-export-origins.md 與 docs/research/li-chun-sheng.md。',
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
          ...LI_CHUNSHENG_SOURCE_IDS.filter((id) => !['chen-ciyu-li-family-2015', 'th-li-chunsheng-memoir', 'culture-taipei-walk-dadaocheng-2018', 'taipei-pictorial-480-dihua', 'pct-li-chunsheng-church', 'culture-taipei-2002-events'].includes(id)),
        ],
        disclaimer:
          `陶德來臺、設洋行與1869年運量的數字各資料不一，本站並列或只寫約數；「首富」一詞只見於單一來源，本站不用。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；這棟洋樓是情境示意，寶順洋行與李春生的事業在河邊的建昌街、千秋街。${LI_CHUNSHENG_DISCLAIMER_TEXT}`,
      },
    ],
  },
  {
    id: 'xia-hai-cheng-huang',
    name: '霞海城隍廟',
    // 文化據點（同安人的信仰中心）：不是餐廳，沒有食物圖鑑；只出現在「港口商街」
    kind: 'heritage',
    status: 'open',
    year: 1859,
    yearLabel: '1859年（1856年籌建現址，1859年完工）',
    yearNote: '神像渡臺的年份，內政部臺灣宗教百景寫清道光元年（1821），臺灣宗教文化地圖只寫「道光初年」；1821年僅此一源。現址1856年籌建、1859年完工依內政部臺灣宗教文化地圖（單一官方網站出處）。',
    sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape'],
    category: '文化據點｜城隍廟・民俗祭典',
    seal: '城隍',
    address: '迪化街一段61號',
    summary: '1853年頂下郊拚後，同安人把霞海城隍的神像從艋舺迎到大稻埕，1859年在迪化街一段61號完工建廟；1879年起源的「五月十三迎城隍」曾是北臺灣最大的遶境。',
    note: '實際的霞海城隍廟在迪化街一段61號。街上這座廟是情境示意：規模、格局與相對位置都不是精確復原，廟埕與榕樹沿用本站的廟宇原型。祭祀的供品與廟口飲食查無可靠出處，本站不寫。',
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
    },
    camera: { distance: 6.6, height: 4.6, side: 5, lookHeight: 3.4 },
    chapters: [
      {
        id: 'origin',
        type: 'text',
        tab: '從艋舺到大稻埕',
        title: '從同安、艋舺到大稻埕',
        lead: '一尊從福建同安渡海而來的城隍神像，在械鬥的火光中遷到大稻埕，成為同安人的精神支柱。',
        paragraphs: [
          '霞海城隍源自福建泉州府同安縣后溪的霞城。內政部的臺灣宗教百景寫，清道光元年（1821年）一百多名同安人搭船到艋舺，商人陳金絨供奉從同安帶來的霞海城隍神尊；臺灣宗教文化地圖則只寫「道光初年」由陳金絨迎奉金身來臺，1821年這個年份只有一個來源。「霞海」名稱的由來有兩說：一說源自同安霞城的城隍廟，另一說「霞海」即「海內」之意，本站並列不下結論。',
          '同安人早期在艋舺東邊的八甲庄（約今老松國小附近）建廟。咸豐三年（1853年）艋舺發生頂下郊拚，同安人落敗，八甲庄的廟毀於械鬥後的火災，信徒救出神像、遷往大稻埕。NOWnews 的專訪寫神像起初安奉在糕餅舖中（單一來源）。',
          '咸豐六年（1856年）起，信徒在現址籌建新廟，咸豐九年（1859年）完工，也就是今天迪化街一段61號的霞海城隍廟。NOWnews 的專訪寫建廟由海內會陳姓族人與地方善信發起（發起人各資料記載不一，本站標明出處）。同安人在大稻埕的發展依靠商業，霞海城隍是他們的守護神與精神支柱。',
        ],
        timeline: [
          { place: '1821（一說）', text: '同安人渡海到艋舺，陳金絨供奉霞海城隍神尊（年份僅見內政部臺灣宗教百景）。' },
          { place: '1853', text: '頂下郊拚，八甲庄的廟毀於火災，神像遷往大稻埕。' },
          { place: '1856', text: '在現址籌建新廟。' },
          { place: '1859', text: '新廟完工（迪化街一段61號）。' },
        ],
        glossary: [
          { term: '城隍', definition: '守護城池的神祇，民間信仰中也掌理陰間的司法；各地的城隍廟常是移民原鄉信仰的延伸。' },
          { term: '頂下郊拚', definition: '1853年艋舺的泉州三邑人（頂郊）與同安人（下郊）之間的分類械鬥；同安人落敗後遷往大稻埕，成為大稻埕發展的起點。' },
        ],
        sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape', 'gvm-city-2025-temples', 'nownews-2020-xiahai'],
      },
      {
        id: 'pilgrimage',
        type: 'text',
        tab: '五月十三迎城隍',
        title: '五月十三迎城隍',
        lead: '「五月十三人看人，迎神賽會甲天下」——起源於1879年的迎城隍，曾是北臺灣最大的遶境。',
        paragraphs: [
          '「台北霞海城隍廟五月十三迎城隍」是臺北市登錄的民俗類文化資產（2010年7月26日公告），官方登錄頁記起源年代為清光緒5年（1879年）。鏡週刊的報導寫它過去是北臺灣最大的遶境；俗諺說「三月痟媽祖、五月迎城隍」「五月十三人看人，迎神賽會甲天下」。',
          '依官方登錄頁的記載，祭典的流程橫跨半個月：農曆五月初六「放軍」，紙糊的營厝開光後送到五座福德祠鎮守地方；五月十一夜間「暗訪」，驅逐邪祟；五月十三城隍聖誕遶境，下午出發、抵廟多已傍晚，駕前的謝將軍、范將軍白晝右手持扇、左手持手絹，不持釘棍鎖鍊，隨行有北管軒社、金獅團等陣頭；五月十八「收軍」。迎城隍期間廟內舉辦祝壽法會，沿途民眾設香案迎駕。',
          '依官方登錄頁，迎城隍過去每年舉行，現已改為三年一次；鏡週刊2024年的報導則寫，現今由在地的軒社自行發起夜間暗訪與迎城隍。祭典的牲禮與供品的內容，本站查無可靠出處，不寫。',
        ],
        timeline: [
          { place: '農曆五月初六', text: '放軍：紙糊營厝開光後送五座福德祠，鎮守地方。' },
          { place: '五月十一', text: '夜間暗訪，驅逐邪祟。' },
          { place: '五月十三', text: '城隍聖誕遶境，下午出發；北管軒社、金獅團等陣頭隨行。' },
          { place: '五月十八', text: '收軍。' },
        ],
        glossary: [
          { term: '暗訪', definition: '神明在夜間出巡，驅逐轄區內的邪祟；迎城隍的暗訪在聖誕遶境前兩天的夜裡舉行。' },
          { term: '軒社', definition: '地方的北管音樂社團，迎神賽會時組成陣頭隨駕演奏。' },
        ],
        sourceIds: ['moi-xiahai-folklore', 'moi-xiahai-landscape', 'mirror-2024-xiahai', 'pts-2024-xiahai'],
      },
      {
        id: 'matchmaker',
        type: 'text',
        tab: '月老與古蹟',
        title: '月下老人與古蹟',
        lead: '1971年才增祀的月下老人，讓這座一百多年的城隍廟成了求姻緣的名所；廟本身在1985年被指定為古蹟。',
        paragraphs: [
          '霞海城隍廟的月下老人是1971年（民國60年）才增祀的：內政部臺灣宗教文化地圖寫，一位老太太捐獻月下老人神像，此後成為廟中神祇之一；臺灣宗教百景與媒體專欄也都記1971年增祀。捐獻者的姓名與動機，本站查無可靠出處，只依官方網站寫「一位老太太」。',
          '臺灣宗教百景稱它是「臺灣最紅的月老廟」。民間通說月老掌管姻緣簿；至於「撮合了幾萬對」之類的統計，來源不明，本站不寫。',
          '廟本身在1985年8月19日被指定為古蹟（內政部頁面記公告文號臺內民字第338095號，並寫當年指定為第3級古蹟），現為直轄市定（臺北市定）古蹟。官方公告原件與國家文化資產網的原頁，本站未能開啟核對，級別沿革標「待核」。',
        ],
        facts: [
          { label: '1971', value: '一位老太太捐獻月下老人神像，廟中增祀月老（官方網站記載）' },
          { label: '1985', value: '指定為古蹟（公告文號臺內民字第338095號；級別沿革待核）' },
          { label: '2010', value: '「五月十三迎城隍」登錄為臺北市民俗類文化資產' },
        ],
        sourceIds: ['moi-xiahai-temple', 'moi-xiahai-landscape', 'gvm-city-2025-temples'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/xia-hai-cheng-huang.md。',
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
      },
    ],
  },
  {
    id: 'qian-yuan-yao-hang',
    name: '乾元藥行',
    // 文化據點（迪化街的百年藥行）：中藥行不屬於飲食圖鑑的範疇，不加食物圖鑑或點餐；只出現在「酒樓繁華」
    kind: 'heritage',
    status: 'open',
    year: 1896,
    yearLabel: '1896年（一說1875年）',
    yearNote: '中研院臺史所依1929年《臺灣日日新報》〈乾元藥行三十年開業記念披露〉報導採1896年（明治29年）；維基百科與部落格另記1875年一說。本站以1896年為主、並列1875年。',
    sourceIds: ['ith-qian-yuan', 'wiki-qian-yuan'],
    category: '文化據點｜漢藥・百年藥行',
    seal: '藥行',
    summary: '創立於1896年（一說1875年）的中藥行，創辦人張清河；歷經陳茂通等多位經營者傳承至今，是迪化街藥材街的代表老店之一。',
    note: '乾元藥行在迪化街一段71號（門牌僅見部落格與公會名錄的摘要，未核實）。街屋的興建年代與是否登錄文化資產，本站查無可靠出處；這棟立面是依文獻描述設計的「歷史情境重建」，並非精確復原。',
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
    },
    camera: { distance: 6, height: 4.2, side: -4, lookHeight: 3.2 },
    chapters: [
      {
        id: 'founding',
        type: 'text',
        tab: '創立與傳承',
        title: '張清河與乾元藥行',
        lead: '一家創立於十九世紀末的中藥行，一百多年間歷經多位經營者，至今仍由家族後人延續。',
        paragraphs: [
          '乾元藥行的創立年份有兩說：中研院臺灣史研究所檔案館依1929年《臺灣日日新報》的〈乾元藥行三十年開業記念披露〉報導，採1896年（明治29年）；維基百科與部落格另記1875年一說。本站以1896年為主、並列1875年。創辦人是張清河，1917年過世。',
          '張清河過世後，原為股東兼學徒的陳茂通在1917年接手。陳茂通曾任臺北本島人藥業組合長、藥郊聯合會的會長，1936年8月病逝；其後藥行由股東朱樹勳、陳福經營。1960年陳金清富接手，家族後人延續至今。部落格另記陳鳳鎮1994年、陳建忠1998年先後接手，2011年陳建國另創「上乾元蔘藥行」（單一來源）。',
          '乾元藥行與長崎的貿易商泰益號有生意往來，委辦報關納稅與轉運；1928年曾向香港的協元順訂購13件藥材。主要產品包括治霍亂的「平安散」，1932年曾寄贈一千包到廈門。',
        ],
        timeline: [
          { place: '1896（一說1875）', text: '乾元藥行創立，創辦人張清河。' },
          { place: '1917', text: '張清河過世，股東兼學徒陳茂通接手。' },
          { place: '1936', text: '陳茂通病逝，其後由股東朱樹勳、陳福經營。' },
          { place: '1960', text: '陳金清富接手，家族後人延續至今。' },
        ],
        glossary: [
          { term: '藥郊', definition: '中藥材商人的同業組織；「郊」是清代以來臺灣商人依貿易地或行業組成的公會，陳茂通曾任藥郊聯合會會長。' },
        ],
        sourceIds: ['ith-qian-yuan', 'wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'medicine-street',
        type: 'text',
        tab: '藥材街',
        title: '迪化街的中藥材',
        lead: '中藥材、南北乾貨與布料，是迪化街商業的三大支柱；乾元專賣中藥材，走出和南北貨商號不同的路。',
        paragraphs: [
          '中研院臺史所的專文寫，迪化街以中藥材、南北乾貨、布料商的聚集著稱；1860年淡水開港後外商設洋行經營茶葉，19世紀末大稻埕成為臺灣北部的貨物集散中心，日治時期仍是本島人南北雜貨批發的重鎮。',
          '乾元藥行「專賣中藥材，不賣其它南北貨」（部落格的觀察），與同一條街上經營南北雜貨的林復振商行是不同的路線。兩家同為迪化街的百年老店、各自經營；它們之間有沒有股權或親屬關係，文獻沒有明文，本站不寫。',
          '藥業也有自己的同業組織：陳茂通擔任過臺北本島人藥業組合長與藥郊聯合會會長，顯示日治時期大稻埕的藥材商已有組織化的公會。',
        ],
        sourceIds: ['ith-dihua-stores-intro', 'ith-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'shophouse',
        type: 'text',
        tab: '店屋與立面',
        title: '三進的藥行店屋',
        lead: '山牆下的牛眼窗、窗框上的人蔘圖案——文獻裡的乾元立面；店身縱深三進，天井之間煮藥、晾曬。',
        paragraphs: [
          '維基百科描述乾元的立面：頂端凸出山牆，以水平檐板取代常見的巴洛克花草紋飾，山牆下有牛眼窗，窗框飾人蔘圖案；部落格則寫水平直線的屋簷與竹節式壁柱，認為是日治時期常見的樣式。',
          '部落格記店面縱深約60公尺、共三進，進與進之間有天井，供煮藥、晾曬、倉庫與生活；曾因煮藥失火，前兩進的木樓板燒毀後改建（以上為單一來源）。',
          '這棟街屋的興建年代，本站查無文獻明載；有沒有文化資產的身分，也查無資料，本站都不寫成事實。場景中的立面是依上述描述設計的「歷史情境重建」：牛眼窗與人蔘圖案等細節沒有重現，寬度也配合街上的地段，並非精確復原。',
        ],
        sourceIds: ['wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本據點的介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄（含年份的矛盾與查無）見專案的 docs/research/qian-yuan-yao-hang.md。',
        sourceIds: ['ith-qian-yuan', 'ith-dihua-stores-intro', 'wiki-qian-yuan', 'trip-writers-2008-qianyuan'],
        disclaimer:
          '創立年份1896／1875兩說並列；門牌迪化街一段71號僅見部落格與公會名錄的摘要，未核實，對照地圖上標為示意；街屋的興建年代與文化資產登錄查無，不寫成事實；近年的營業現況未取得直接證據。店屋立面為歷史情境重建，並非精確復原。',
      },
    ],
  },
  {
    id: 'lin-hua-tai',
    name: '林華泰茶行',
    theme: 'tea',
    status: 'open',
    year: 1883,
    category: '茶行',
    seal: '茶行',
    summary: '1883年起做毛茶的篩選與精製，是臺北最老的茶行之一；重慶北路的「前店後廠」至今以大鐵桶陳列茶葉、批發為主。',
    note: '林華泰最初的店址與遷到重慶北路現址的年份，本站引用的文獻沒有記載；街上的店面與各年代的招牌都是情境示意。',
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
      'qing-port': { condition: 'new' },
      banquet: { condition: 'mature', sign: { text: '林華泰茶行', style: 'gold' } },
      modern: { condition: 'mature', sign: { text: '林華泰茶行', style: 'lacquer' } },
      postwar: { condition: 'aged', sign: { text: '林華泰茶行', style: 'painted' } },
      revival: { condition: 'restored', sign: { text: '林華泰茶行', style: 'lacquer' } },
    },
    // 各年代介紹視窗上方的「此時期的林華泰茶行」；家族口述整理自官網〈林華泰的歷史〉
    eraNotes: {
      'qing-port':
        '1883年，林華泰開始做毛茶的篩選與精製（官網）。創辦人的姓名與最初的店址，本站引用的文獻沒有記載；這個年代的店面是情境示意。',
      banquet:
        '日治時期大稻埕茶業鼎盛，全盛時期有兩百多家茶行。《臺灣工藝》記載重慶北路對街一排數家茶行均為林華泰系列，是「典型銷華人社會的茶商」；林華泰本身這個時期的外銷紀錄，文獻未載。',
      modern:
        '家族口述：1930年代的炭焙暖房有三十幾個直徑約兩尺的圓火坑分成四排，茶葉在竹焙籠上以炭火烘焙。這個年代的店面是情境示意。',
      postwar:
        '家族口述：戰後的林華泰以批發為主，茶季的早上院子裡有幾十上百位茶農背著茶包進出，傍晚貨運卡車把茶出貨到島內各地的茶莊；入夜後茉莉花農騎腳踏車送花來薰製花茶。炭焙坑從三十幾個縮減到八個、再剩兩個，改用大型乾燥機。',
      revival:
        '重慶北路二段193號的「前店後廠」：店裡陳列近百個大小茶桶，用老秤計量；店後的大型乾燥機仍在使用，炭焙坑封存留作遺址。2011年家族分家，老二林茂森在隔壁另開林茂森茶行；林華泰接受學校的校外教學申請。',
    },
    // 按 E 探索時的鏡頭：斜角取景，留在街道的路面上（路面 z ±2.8，不進對面的騎樓）
    camera: { distance: 6.6, height: 4.2, side: 5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'tea-port',
        type: 'text',
        tab: '茶與開港',
        title: '淡水開港與大稻埕的茶',
        lead: '1858年天津條約開放臺灣通商，1862年滬尾正式設關；外商在大稻埕設精製茶廠，臺灣烏龍茶從此走向世界。',
        paragraphs: [
          '清咸豐年間，清廷與英法簽訂天津條約（1858年）與北京條約（1860年），臺灣依約開港通商。淡水河口的滬尾被定為開埠地點，同治元年（1862年7月）正式開關徵稅，這是通稱「淡水開港」的由來。',
          '英商陶德（John Dodd）在臺灣發現茶的潛力，自福建安溪引進茶苗、貸款給茶農種植，並在1868年把精製茶廠設在大稻埕；1869年臺灣烏龍茶以「Formosa Oolong」之名運往美國紐約，大受歡迎，奠定臺茶外銷的基礎。',
          '茶葉從淡水河沿岸的碼頭卸下，送進大稻埕的茶行精製，再裝箱出口。臺茶外銷量從1865年的一百三十餘公噸增加到1885年的近七千五百公噸；1878年茶葉的出口額超過蔗糖，成為臺灣最重要的出口商品。大稻埕因此從河岸的村落變成北臺灣的商業中心。',
        ],
        timeline: [
          { place: '1858', text: '天津條約開放臺灣通商；淡水河口的滬尾被定為開埠地點。' },
          { place: '1862', text: '滬尾正式開關徵稅，洋行陸續進駐。' },
          { place: '1865', text: '臺茶有正式出口紀錄，被茶葉輸出業公會定為臺茶出口元年。' },
          { place: '1868', text: '陶德把精製茶廠設在大稻埕。' },
          { place: '1869', text: '臺灣烏龍茶運往紐約，「Formosa Oolong」打開美國市場。' },
          { place: '1883', text: '林華泰開始做毛茶的篩選與精製。' },
        ],
        glossary: [
          { term: '開港', definition: '依條約開放港口與外國通商。淡水在1858年的條約中被開放，1862年設海關後正式運作，所以文獻有「1858」、「1860」、「1862」三種寫法。' },
          { term: '毛茶', definition: '茶農初製完成、還沒有經過篩選分級與烘焙的茶葉；茶行把毛茶「精製」之後才出售或外銷。' },
          { term: '洋行', definition: '外國商人在開港口岸設立的貿易商號，例如陶德的寶順洋行；清末大稻埕先後有寶順、德記、怡記、和記、水陸等洋行經營茶葉。' },
        ],
        sourceIds: ['tshs-zhang-tamsui-port', 'ntcri-73-tea-road', 'twcenter-muzha-tea-2001', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '百年茶行',
        title: '林華泰的一百四十年',
        lead: '1883年起做毛茶的篩選與精製，是臺北最老的茶行之一；家族來自臺北近郊的茶山。',
        paragraphs: [
          '林華泰茶行的商標寫著「THE OLDEST TEASHOP LIN HUATAI 1883」。官網記載，林華泰從1883年開始就扮演把初製毛茶再篩選、精製的角色；臺北市政府觀光傳播局的刊物也把它列為1883年開業、臺北茶業最老的字號之一。',
          '家族的根在臺北近郊的茶山：第三代林大村在石碇楓仔林的茶山長大，店裡的舊茶鏟中央蓋著一個「楓」字。臺北市政府的刊物則寫家族最早在深坑種茶製茶，之後才到大稻埕開店；深坑與石碇相鄰，本站把兩種記載都列出。',
          '第三代林大村在五兄弟中排行第二，兄弟分家時接下以批發為主的林華泰，伯父與三叔各自掌管全泰與全祥茶莊（家族口述）。林大村在1977年獲臺北市政府頒贈「孝行楷模紀念」匾額，2003年過世。第四代有林秀峰、林茂森、林秀全、林茂祥四兄弟；2011年家族分家，林茂森在原店隔壁另開林茂森茶行，林華泰則由林秀全、林茂祥等人經營，官網聲明「僅此一家，沒有分店」。',
        ],
        summary: {
          label: '家族口述',
          text: '官網〈林華泰的歷史〉標明擷取自第四代林秀全的《林華泰茶行老三的故事》，是家族的回憶；本章標「家族口述」的段落都出自這裡，沒有其他文獻可以核對。',
        },
        facts: [
          { label: '創立', value: '1883年（官網商標與臺北市政府觀光傳播局刊物）' },
          { label: '創辦人', value: '本站引用的文獻未載' },
          { label: '家族淵源', value: '石碇楓仔林（官網）；深坑（Discover Taipei）' },
          { label: '現址', value: '臺北市重慶北路二段193號' },
          { label: '傳承', value: '第三代林大村（1977年獲孝行楷模匾額）、第四代林秀全等人' },
        ],
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'ltn-linhuatai-2014'],
      },
      {
        id: 'workshop',
        type: 'text',
        tab: '前店後廠',
        title: '前店後廠與大茶桶',
        lead: '店面是批發茶行，店後是精製茶廠：近百個大鐵桶裝著各種茶葉與等級，用老秤計量、金屬鏟裝袋。',
        paragraphs: [
          '林華泰自稱是全臺唯一僅存的「前店後廠」。走進店裡，看到的是近百個大小茶桶排在四周，裝著不同種類與等級的茶葉；因為是批發商，散茶用的是超大號的圓鐵桶。茶葉用老式的秤計量、金屬鏟裝進簡單的袋子，店裡的老秤已經用了五十多年。',
          '店後的工廠把農家送來的茶葉分類，送進大型烘茶機烘焙、篩選、曬涼。運作了半個世紀的大型乾燥機仍在使用；1930年代以炭火烘焙的暖房有三十幾個圓火坑，後來縮減到八個、再剩兩個，現在封存留作遺址（家族口述）。',
          '《臺灣工藝》記載，重慶北路對街一排數家茶行均為林華泰系列，是當時典型銷往華人社會的茶商，至今仍保留大部分精製茶的設備；重慶北路二段的茶葉公園，過去是閩客茶商與茶農交易的場所。',
        ],
        lists: [
          {
            title: '精製茶行的一天（家族口述）',
            kind: 'plain',
            items: [
              '早上：茶季時院子裡有幾十上百位茶農背著茶包進出。',
              '白天：卡車載來粗茶，分類後送進烘茶機烘焙、篩選。',
              '傍晚：貨運卡車把精製好的茶出貨到島內各地的茶莊。',
              '入夜：茉莉花農穿木屐騎腳踏車送花來，薰製茉莉花茶。',
            ],
          },
        ],
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'ntcri-73-tea-road'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表茶品',
        title: '代表茶品｜臺灣的茶',
        intro: '林華泰官網的〈台灣的茶〉介紹臺灣烏龍茶、包種茶、白毫烏龍茶（東方美人）與焙香烏龍茶；報導裡另提到鐵觀音、凍頂烏龍與茉莉花茶。以下圖鑑介紹其中幾種。',
        items: [
          {
            id: 'baozhong-tea',
            name: '包種茶',
            category: '輕發酵｜條形',
            description: '條形的輕發酵烏龍茶，茶湯清香。1881年同安茶商在大稻埕設源隆行專製包種茶，大稻埕外銷南洋的主力茶幾乎都是坪林的文山包種茶。',
          },
          {
            id: 'oolong-tea',
            name: '烏龍茶',
            category: '部分發酵｜球形或條形',
            description: '臺灣最具代表性的茶類。1869年陶德把臺灣烏龍茶運往紐約，「Formosa Oolong」成為臺茶外銷的起點。',
            note: '臺北市政府觀光傳播局的刊物記載，林華泰推薦的凍頂烏龍特別受日本客人歡迎。',
          },
          {
            id: 'tieguanyin',
            name: '鐵觀音',
            category: '重發酵｜焙火',
            description: '原產福建安溪，焙火較重、滋味醇厚。外交部《Taiwan Today》2010年的報導寫店裡有鐵觀音等數十種不同等級的茶葉。',
          },
          {
            id: 'jasmine-tea',
            name: '茉莉花茶',
            category: '薰花茶',
            description: '把新鮮茉莉花與茶葉層層堆疊，讓茶吸收花香再把花篩掉，稱為「薰花」。',
            note: '家族口述：茶季入夜後，茉莉花農穿木屐騎腳踏車送花到店裡薰製花茶。',
          },
        ],
        footnote: '品名整理自官網〈台灣的茶〉與報導，不是林華泰的價目表或完整貨單；茶類的一般介紹不出自林華泰。',
        sourceIds: ['linhuatai-site', 'discover-taipei-tea-shops-2012', 'tcmb-tea-trade', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/lin-hua-tai.md。',
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
        ],
        disclaimer:
          '林華泰官網只能以 http 開啟，內容多為圖片；〈林華泰的歷史〉是第四代的家族回憶，本站標為「家族口述」。本網站的 3D 街景為大稻埕各時期商業街區氛圍的概念性重建；建築外觀、招牌、擺設與店家位置僅供情境想像，並非精確復原。',
      },
    ],
  },
  {
    id: 'you-ji',
    name: '有記名茶',
    theme: 'tea',
    status: 'open',
    year: 1890,
    yearLabel: '1890年（廈門創立，1907年來臺）',
    category: '茶行',
    seal: '茶行',
    summary: '1890年王敬輝在廈門創立「王有記茶莊」，1907年第二代來到大稻埕設精製茶廠，包種茶外銷泰國；重慶北路的老茶廠至今仍以木炭焙茶。',
    note: '有記1907年來臺時的茶行在民生西路口附近、精製茶廠在建昌街11號（今貴德街），1949年才遷到重慶北路現址；街上的建築與各年代的招牌都是情境示意。',
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
      modern:
        '日治時期臺灣茶商派人駐曼谷，包種茶出口曼谷的量很大；有記有日治時期出口茶葉到泰國的紀錄，店裡至今保留早年外銷泰國的英文、泰文商標與木箱。',
      postwar:
        '因泰國外銷業務激增，1949年遷到重慶北路二段64巷26號現址，當時是臺北市登記的第五家工廠。1980年代後外銷逐漸萎縮，有記轉為自創品牌內銷：1975年在濟南路設第一家內銷門市，首創烏龍茶配漢餅的禮盒。',
      revival:
        '2004年廠房前半部整理為門市、二樓的揀茶樓改為藝文空間「清源堂」；一樓後方的焙籠間仍以木炭焙茶，四十多個焙窟還在使用。2008年起清源堂每週六下午有南管演奏；第五代王聖鈞2012年接班，2020年底在隔壁開了 WANGTEA LAB。',
    },
    camera: { distance: 6, height: 4.2, side: -4, lookHeight: 3.2 },
    chapters: [
      {
        id: 'baozhong-nanyang',
        type: 'text',
        tab: '包種茶與南洋',
        title: '包種茶與南洋市場',
        lead: '烏龍茶銷往美國，包種茶銷往華南與南洋：日治時期的大稻埕茶行，靠著包種茶和泰國、安南連在一起。',
        paragraphs: [
          '1873年洋行一度停止收購臺茶，部分茶商把烏龍茶運到福建薰花，改製成包種茶；1881年，泉州同安的茶商在大稻埕設源隆行，就地製作包種茶外銷，開啟了臺灣茶的南洋市場。1885年安溪人王水錦、魏靜時到南港研製，約1912年條形包種茶的製法成功，再傳到文山一帶。',
          '日治時期，臺灣對美國輸出烏龍茶，對華南與南洋輸出包種茶；日商抵斥洋行勢力，轉以日本、東南亞為主要市場。茶商派人駐曼谷，包種茶出口曼谷的量很大；大稻埕外銷南洋的主力茶，幾乎都是坪林的文山包種茶。',
          '1896年1月日本人的調查，大稻埕的茶商有252店、從業三千六百多人；大稻埕全盛時期有兩百多家茶行。1885到1893年間，由大稻埕輸出的茶葉占臺灣外銷金額六成以上，1886年達到74.9%。',
        ],
        timeline: [
          { place: '1881', text: '同安茶商在大稻埕設源隆行，專製包種茶外銷。' },
          { place: '1890', text: '王敬輝在廈門開設王有記茶莊。' },
          { place: '1907', text: '王孝謹來臺，在大稻埕設茶行與精製茶廠，包種茶外銷泰國。' },
          { place: '1949', text: '因泰國外銷業務激增，遷到重慶北路現址。' },
          { place: '1980年代', text: '外銷萎縮，轉為內銷與自創品牌。' },
        ],
        glossary: [
          { term: '包種茶', definition: '輕發酵的條形烏龍茶。名稱來自早期用方形的紙包成「四兩包」出售的包裝方式。' },
          { term: '南洋', definition: '東南亞的舊稱。文獻裡的「暹羅」是今天的泰國，「安南」是越南。' },
        ],
        sourceIds: ['tcmb-tea-trade', 'tcmb-baozhong-tea', 'chen-ciyu-li-family-2015', 'cna-tea-thailand-2025', 'curation-dadaocheng-tea', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '從廈門到大稻埕',
        title: '從廈門到大稻埕',
        lead: '來自福建安溪產茶世家的王家，1890年在廈門開店，1907年第二代跨海來到大稻埕，到現在是第五代。',
        paragraphs: [
          '有記名茶來自福建安溪的產茶世家。1890年，第十四世的王敬輝在廈門開設「王有記茶莊」。1907年，因為臺灣茶葉出口興盛，第二代王孝謹渡海來臺，在大稻埕的民生西路口附近設茶行經營出口，並在建昌街11號（今貴德街）設立精製茶廠；選在大稻埕，是看中淡水河的水運之便。王孝謹也曾到泰國曼谷拓銷臺茶。',
          '第三代王澄清十七歲就來臺，負責精製廠與外銷。因為泰國的外銷業務激增，原來的廠房不敷使用，1949年遷到重慶北路二段64巷26號現址，當時是臺北市登記的第五家工廠。門前的朝陽茶葉公園，過去是茶葉仲介聚集的交易中心。',
          '1980年代以後外銷逐漸萎縮，有記轉為內銷與自創品牌：1975年在濟南路設立第一家內銷門市，首創烏龍茶配漢餅的禮盒。第四代王連源在2004年把廠房前半部整理為門市、二樓改為藝文空間，把老工廠變成小型的茶博物館；第五代王聖鈞2012年接班，2020年底在隔壁的老屋開了 WANGTEA LAB。中央社的報導寫，曼谷老城區至今還有王家第四代經營的「三罐標有記茶行」。',
        ],
        seals: ['有記'],
        facts: [
          { label: '創立', value: '1890年，廈門「王有記茶莊」' },
          { label: '來臺', value: '1907年，第二代王孝謹' },
          { label: '現址', value: '1949年起，重慶北路二段64巷26號' },
          { label: '傳承', value: '王敬輝、王孝謹、王澄清、王連源、王聖鈞，五代' },
          { label: '外銷', value: '早年以泰國為主，另有日本、歐美' },
        ],
        sourceIds: ['wangtea-story', 'wangtea-transformation', 'tcmb-wangtea', 'cna-tea-thailand-2025', 'tcmb-chaoyang-tea-park'],
      },
      {
        id: 'workshop',
        type: 'text',
        tab: '焙籠間與清源堂',
        title: '焙籠間與清源堂',
        lead: '一樓後方的焙籠間仍以木炭焙茶，四十多個焙窟還在使用；二樓的揀茶樓現在是南管的演奏場所。',
        paragraphs: [
          '有記的焙籠間建於日治時期，是大稻埕現存仍在使用的炭焙工場。紅磚砌成的焙窟成排排列，深五十八公分；窟裡放木炭、鋪上炭化的稻殼點火燒成白灰當熱源，上面架著竹編的焙籠，茶葉日夜不休地烘焙二十天（《臺灣工藝》；今周刊寫兩到三週）。王家稱自家的工法為「清源焙茶法」。',
          '精製茶要經過分級、揀梗、焙火、拼配、風選幾道工序；有記把「烘焙、沖泡、拼配」視為三大關鍵。店裡還保留舊的風選機，以及早年外銷泰國時印在竹編茶箱上的英文、泰文商標。',
          '二樓原本是「揀茶樓」：第四代回憶小時候每天有四十多名女工在二樓揀茶。2004年改為藝文空間「清源堂」，2008年起每週六下午有南管演奏，是臺北少數南管樂團的演奏場所之一。',
        ],
        lists: [
          {
            title: '精製茶的工序',
            kind: 'plain',
            items: ['分級：依茶葉的外形與等級分開。', '揀梗：挑掉茶梗與雜物。', '焙火：炭焙去除水分、形成焙香。', '拼配：把不同批的茶拼配成穩定的風味。', '風選：用風力吹去碎末與輕片。'],
          },
        ],
        sourceIds: ['wangtea-store', 'wangtea-story', 'ntcri-80-wangtea-lab', 'businesstoday-wangtea-2018', 'wangtea-transformation', 'discover-taipei-tea-shops-2012'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表茶品',
        title: '代表茶品｜炭焙的茶',
        intro: '有記自稱「專業的烏龍茶與包種茶商」。門市現售文山包種茶、高山烏龍茶、奇種烏龍茶、鐵觀音、東方美人、綠茶與紅茶；以下圖鑑介紹其中幾種與炭焙的工法。',
        items: [
          {
            id: 'oolong-tea',
            name: '奇種烏龍',
            category: '炭焙｜招牌',
            description: '有記的招牌茶之一。臺北市政府觀光傳播局的刊物寫它以文山包種茶為底，用低溫長時間的炭焙而成。',
          },
          {
            id: 'baozhong-tea',
            name: '文山包種茶',
            category: '輕發酵｜條形',
            description: '條形的輕發酵茶，是大稻埕外銷南洋的主力；有記早年外銷泰國的，就是包種茶。',
          },
          {
            id: 'tieguanyin',
            name: '鐵觀音',
            category: '重發酵｜焙火',
            description: '原產福建安溪，和王家的故鄉同一個地方；焙火較重、滋味醇厚。鏡週刊的報導把鐵觀音、奇種烏龍與文山包種列為有記的招牌。',
          },
          {
            id: 'roasting-basket',
            name: '焙籠',
            category: '工法｜炭焙',
            description: '竹編的焙籠架在紅磚砌的焙窟上，窟裡的木炭與炭化稻殼燒成白灰，低溫把茶葉烘乾、烘出焙香。',
            note: '《臺灣工藝》記載焙窟深五十八公分，茶葉日夜不休烘焙二十天；焙籠間昔日還曾替對街的洗衣店烘衣服，衣服因而茶香四溢。',
          },
        ],
        footnote: '品名整理自官網門市頁與報導，不是價目表；茶類的一般介紹不出自有記。',
        sourceIds: ['wangtea-store', 'wangtea-transformation', 'discover-taipei-tea-shops-2012', 'ntcri-80-wangtea-lab', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/you-ji.md。',
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
      },
    ],
  },
  // 李亭香（第 7 階段 B）：只在「老屋新生」開放探索；日治、戰後的店址查無（最具體的說法是早年在蘆洲），
  // 所以那三個年代不列名錄，同一地段的店屋保留為一般「餅舖」（情境示意），地段與建築不變。
  // 章節在 liTingXiangData.js；查證紀錄 docs/research/li-ting-xiang.md。
  {
    id: LI_TING_XIANG_ID,
    name: '李亭香',
    status: 'open',
    year: 1895,
    yearLabel: '店家自述1895年創立（待核）',
    yearNote: LTX_YEAR_NOTE,
    sourceIds: LI_TING_XIANG_SOURCE_IDS,
    category: '糕餅店',
    seal: '糕餅',
    summary: '迪化街上的糕餅店：店家自述1895年創立（待核），招牌是平西餅；現任經營者從面板工程師返家接班。只在老屋新生開放探索。',
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
    status: 'open',
    year: 1921,
    // 創立年份記載不一：莊永明記1921年11月20日開業（政大碩士論文題名年段1921–1940亦同），
    // 國立臺灣歷史博物館典藏說明與維基百科記為1917年
    yearLabel: '1921年開業（一說1917年）',
    yearNote: '開業年份記載不一：莊永明〈大稻埕名酒樓之三：江山樓〉記1921年11月17日起辦披露宴三天、20日正式營業，簡伃君的碩士論文題名年段（1921–1940）亦同；國立臺灣歷史博物館典藏說明與維基百科則記為1917年（大正6年）。',
    sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
    category: '酒樓',
    seal: '酒樓',
    reconstruction: true,
    summary: '吳江山創立的臺灣料理酒樓，紅磚四層樓、十四間宴會廳；1923年與東薈芳承辦皇太子的臺灣料理午宴，是日治時期紳商社交的場所，1970年代拆除。',
    summaryEn: 'A banquet house for Taiwanese cuisine founded by Wu Jiangshan (吳江山): a four-storey red-brick building with fourteen banquet halls. In 1923, together with Dong Hui Fang (東薈芳), it catered the Taiwanese-cuisine luncheon for the Crown Prince. It was a social venue for gentry and merchants in the Japanese colonial period and was demolished in the 1970s.',
    note: '江山樓建築今已不存（1970年代拆除，維基百科記1976年）。原址在日新町二丁目、近歸綏街與甘州街，不在迪化街；場景依「紅磚四層連棟街屋」的記載，在這條街上作歷史情境重建，並非精確復原。',
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
    },
    // 四層樓比茶行高：街道只有約 5.6 m 寬，鏡頭退到路緣、往側邊拉開，再抬高注視點
    camera: { distance: 6.8, height: 5.4, side: 8, lookHeight: 4.8 },
    chapters: [
      {
        id: 'background',
        type: 'text',
        tab: '酒樓的年代',
        title: '大稻埕的酒樓年代',
        lead: '日治時期的大稻埕，茶商與仕紳的宴席集中在幾家大酒樓；江山樓與東薈芳、春風得意樓、蓬萊閣常被並稱，本站只做資料最充分的江山樓。',
        paragraphs: [
          '大稻埕因茶葉外銷而富裕，宴客與社交的需求養出了酒樓。東薈芳是其中最早的一家，1884年開設，1911年梁啟超應林獻堂之邀來臺時曾在這裡聚餐；春風得意樓1914年設立，蔣渭水1920年入股、後來接手，1922年歇業；蓬萊閣則是1927年在東薈芳原址另起的新名號。四家常被報導並稱為大稻埕的「四大旗亭」。',
          '以上三家的創辦人、確切年份、門牌與菜色，各家媒體與維基百科的說法互相矛盾，官方與學術的佐證本站沒有查到，所以暫不做成可探索的店家，只在這裡交代背景。常見的「蓬萊閣由陳天來創辦」、「春風得意樓由蔣渭水創辦」兩種說法，本站讀到的來源都不支持：前者只寫陳天來「接手」，後者寫蔣渭水1920年才入股。',
          '江山樓是四家裡留下最多記載的一家：有莊永明整理日治報刊寫成的專文，有政治大學以它為題的碩士論文，1923年的皇太子午宴也有研究者整理過菜單。這座四層紅磚樓在1970年代拆除，原址不在迪化街，而在日新町二丁目、今歸綏街與甘州街一帶；本站把它搬到這條街上，是情境重建。',
        ],
        facts: [
          { label: '東薈芳', value: '1884年開設；1925或1926年歇業（來源不一）' },
          { label: '春風得意樓', value: '1914年設立；蔣渭水1920年入股、1922年買下全部，同年歇業' },
          { label: '蓬萊閣', value: '1927年於東薈芳原址另起；陳天來接手的時間來源不一' },
          { label: '江山樓', value: '1921年開業（一說1917年）；1970年代拆除' },
        ],
        sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '吳江山',
        title: '吳江山與他的四層紅磚樓',
        lead: '吳江山原是東薈芳的合夥人，退出後到廈門、福州、上海看酒樓，回臺蓋起以自己名字命名的江山樓（莊永明）。',
        paragraphs: [
          '莊永明的專文寫到，吳江山退出東薈芳後，赴廈門、福州、上海考察酒樓，回來後在日新街東市二丁目（1922年改稱日新町二丁目，近今歸綏街、甘州街）蓋起紅磚造的四層連棟街屋，耗資十數萬元。樓內有宴會廳十四間，約可容納五百人，另有廚房、浴室、理髮室，樓頂還闢了庭園假山。1921年11月17日起辦披露宴三天，20日正式營業。開幕時聘請福州、上海、廣東的名廚掌勺。',
          '開業年份有兩種說法。莊永明與政治大學簡伃君的碩士論文（題名年段1921到1940年）都以1921年為準；國立臺灣歷史博物館的老照片藏品說明與維基百科則記為1917年。本站以1921年為主，並列1917年一說。門牌號碼沒有查到。',
          '吳江山1928年出任北區料理屋飲食店組合副組合長，後來升任組合長，1935年病逝，享年六十歲（莊永明，單一來源）。江山樓本身一直營業到戰後；維基百科寫1946年歇業、1976年拆除，莊永明只寫「1970年代拆除」，本站寫1970年代。',
        ],
        facts: [
          { label: '創辦人', value: '吳江山，原東薈芳合夥人' },
          { label: '開業', value: '1921年11月20日（一說1917年）' },
          { label: '建築', value: '紅磚四層連棟街屋；宴會廳14間，約容500人' },
          { label: '位置', value: '日新町二丁目，近今歸綏街、甘州街；門牌未查到' },
          { label: '拆除', value: '1970年代（維基百科記1976年）' },
        ],
        sourceIds: ['jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'nmth-jiang-shan-lou', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'banquet',
        type: 'text',
        tab: '宴席與藝旦',
        title: '臺灣料理的宴席、皇太子的午宴與藝旦',
        lead: '1923年4月24日，總督府在官邸以臺灣料理款待來臺行啟的皇太子裕仁，承辦的是江山樓與東薈芳；菜單十二道大菜，研究者整理過。',
        paragraphs: [
          '皇太子的午宴｜陳玉箴的文章寫到，1923年4月24日中午，總督官邸（今臺北賓館）的大食堂辦了一場「臺灣料理」午宴，總督府選定江山樓與東薈芳承辦，事前還派人到日本試菜。菜單共十二道大菜，用上燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參（中央社引曾品滄；陳玉箴）；莊永明另列出雪白官燕、金錢火雞、水晶鴿蛋等菜名，陳玉箴提到第七道是炸春餅。收尾的點心兩說並列：莊永明寫杏仁茶，陳玉箴寫八寶飯與杏仁茶。陳玉箴稱吳江山為這場「御宴」的主廚，莊永明則寫由江山樓與東薈芳共同負責。這些都是二手整理，本站沒有讀到《臺灣日日新報》原報。',
          '臺灣料理｜簡伃君的論文摘要稱江山樓是推廣臺灣菜的重要餐廳，1920年代以後代表臺灣最高的烹飪水準。1927年底，吳江山在報紙上連載了二十三篇〈臺灣料理之話〉（莊永明）；江山樓後來印出一份列有192道菜的菜單（中央社引曾品滄）。莊永明寫到，皇太子午宴之後到1927年，類似的官方餐宴江山樓又辦了五場，獲總督府頒發獎狀。至於日常宴席的出菜順序、桌數與價目，本站沒有查到可靠記載。',
          '藝旦｜民間流傳「登江山樓，吃臺灣菜，聽藝旦唱曲」的說法（維基百科；本站只作「相傳」）。莊永明寫到，江山樓附近歸綏街的巷弄因藝旦聚集而發展，今天只剩文萌樓一棟。1958年吳瀛濤曾寫過〈江山樓．臺灣菜．藝妲〉一文，本站只讀到題名。藝旦在席間是否固定演出、江山樓與藝旦間的實際關係，仍待學術全文查證，本站不多寫。',
          '聚會與題詠｜莊永明記載，杜聰明與蔡伯毅的祝賀會、國語學校臺籍同窗會十週年都在江山樓舉行；連雅堂寫過〈江山樓題壁〉，廖錫恩有〈題江山樓〉，鄭述公也有詩。簡伃君的論文以「紳商社交生活」為題，正是看中它作為聚會場所的角色。',
        ],
        facts: [
          { label: '皇太子午宴', value: '1923年4月24日中午，總督官邸；江山樓與東薈芳承辦' },
          { label: '菜單', value: '十二道大菜：燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參' },
          { label: '收尾', value: '杏仁茶（陳玉箴另記八寶飯）' },
          { label: '〈臺灣料理之話〉', value: '1927年底，吳江山連載23篇' },
          { label: '菜單', value: '後印有192道菜（曾品滄）' },
        ],
        sourceIds: ['foodnext-chen-yuchen-2020', 'cna-taiwanese-cuisine-2020', 'jaung-jiang-shan-lou-2015', 'nccu-thesis-jiang-shan-lou-2008', 'wiki-jiang-shan-lou'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '宴席菜',
        title: '代表食物｜皇太子午宴的大菜',
        intro: '依1923年皇太子午宴的記載選出四道：三道大菜加收尾的杏仁茶。菜名出自莊永明與陳玉箴的整理，作法與盛裝方式是本站依菜名與食材推想的示意。',
        items: [
          {
            id: 'bird-nest-soup',
            name: '雪白官燕',
            category: '大菜｜燕窩',
            description: '以燕窩燉成的清湯，是午宴菜單上的第一類高價食材。莊永明列出「雪白官燕」一名，中央社引曾品滄也寫菜單用了燕窩。',
          },
          {
            id: 'golden-turkey',
            name: '金錢火雞',
            category: '大菜｜火雞',
            description: '火雞是十二道大菜用到的食材之一。「金錢火雞」一名出自莊永明；圓片的形狀依菜名推想，不是當年的作法記載。',
            note: '火雞在1920年代的臺灣宴席上並不常見，可能是為日本皇室的西式口味而加入；這是推測，不是記載。',
          },
          {
            id: 'crystal-pigeon-egg',
            name: '水晶鴿蛋',
            category: '大菜｜鴿蛋',
            description: '鴿蛋是菜單上的食材之一，莊永明列出「水晶鴿蛋」的菜名；「水晶」通常指清透的蛋白或凍，這裡依菜名畫成透亮的蛋。',
          },
          {
            id: 'almond-tea',
            name: '杏仁茶',
            category: '收尾｜甜湯',
            description: '午宴的收尾點心。莊永明寫以杏仁茶作結，陳玉箴則寫八寶飯與杏仁茶；兩種說法都有杏仁茶。',
          },
        ],
        footnote: '四道菜只有菜名與食材見於文獻，作法、盛器與顏色都是本站的示意；江山樓日常宴席的菜單沒有查到，不要把這四道當成店內常備的菜。',
        sourceIds: ['jaung-jiang-shan-lou-2015', 'foodnext-chen-yuchen-2020', 'cna-taiwanese-cuisine-2020'],
      },
      // 第 8 階段：人物小節（純文字，資料在 jiangWeiShuiData.js）
      JIANG_WEISHUI_PERSON_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/jiang-shan-lou.md；其中東薈芳、春風得意樓、蓬萊閣的資料也在同一份紀錄裡；蔣渭水的查證見 docs/research/jiang-wei-shui.md。',
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
      },
    ],
  },
  {
    id: 'xin-fang-chun',
    name: '新芳春茶行',
    theme: 'tea',
    status: 'open',
    year: 1934,
    yearLabel: '1934年落成（茶行創立年份有多種說法）',
    yearNote: '建築落成於1934年（官方古蹟登錄寫「約創建於1930年代」）。茶行本身的創立年份各資料記載不一：國家文化記憶庫記1918年王芳群來臺設立、1932年改組為合資會社；大紀元記1919年王連河獨資經營。',
    sourceIds: ['nchdb-xinfangchun', 'tcmb-xinfangchun', 'epochtimes-xinfangchun-2022'],
    category: '茶行',
    seal: '茶行',
    summary: '安溪茶商王連河1934年落成的三層洋樓，茶行、烘焙茶工廠、倉庫與住宅合一，是當時臺北最大的茶工廠；包種茶外銷南洋，2009年指定為市定古蹟，現在免費開放。',
    summaryEn: 'A three-storey Western-style building completed in 1934 by Wang Lianhe (王連河), a tea merchant from Anxi. Tea shop, tea-roasting factory, warehouse and home in one, it was then the largest tea factory in Taipei; its Baozhong tea was exported to Southeast Asia. It became a municipal historic site in 2009 and is now open free of charge.',
    note: '新芳春茶行在民生西路309號；街上的建築依「三開間、三層、水平帶狀女兒牆與三角形山頭」的記載示意，並非精確復原。',
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
      postwar:
        '官方登錄記載，民國40年以後這裡也是財團法人王氏宗親會的籌備設立處。1974年第三代王國忠接手，仍外銷東南亞；1970年代末起受競爭影響業務萎縮，1990年代以後幾乎停滯（國家文化記憶庫）。大紀元則寫1960年代後逐漸收起事業、部分空間出租；停歇的確切時間各來源不一。',
      revival:
        '2005年登錄歷史建築、2009年指定市定古蹟；2011到2015年修復後，王國忠把建築捐給臺北市政府，2016年9月20日開放參觀，2018年起由台灣文創發展基金會經營為「活的茶葉故事館」。免費參觀，週三至週日開放。',
    },
    camera: { distance: 6.6, height: 5.2, side: 5.5, lookHeight: 4.2 },
    chapters: [
      {
        id: 'history',
        type: 'text',
        tab: '安溪茶商',
        title: '安溪茶商的起家厝',
        lead: '來自福建安溪的王家在大稻埕經營茶行，王連河1934年蓋起這棟三層洋樓；茶行的創立年份各資料記載不一。',
        paragraphs: [
          '國家文化記憶庫記載，1918年王連河的父親王芳群由泉州安溪舉家遷臺，設立經營「芳春茶行」與「新芳春茶行」；大紀元的報導則寫芳春茶行是王芳群與王珍春合資，1919年王連河開始獨資經營新芳春茶行。王連河接手後，1932年改組為「合資會社新芳春茶行」，1950年再改組為「新芳春茶行兩合公司」。',
          '新芳春向文山、南港的茶農收購包種茶精製，銷往泰國而致富。王連河經營時期，新芳春是臺灣包種茶外銷南洋、尤其是泰國與安南地區的重要茶葉公司之一；第三代王國忠回憶「台灣的包種茶，我父親是推手」，父親曾被派往泰國推銷茶葉。',
          '1934年春天，王連河在民生西路蓋起三層洋樓，門牌原為303到309號；今天留下的是309號的古蹟，303到307號已改建。官方的古蹟登錄寫這棟建物「約創建於1930年代」，報導與國家文化記憶庫都記為1934年落成。',
        ],
        facts: [
          { label: '家族', value: '福建安溪，王芳群、王連河、王國忠三代' },
          { label: '茶行創立', value: '1918年（國家文化記憶庫）或1919年（大紀元）；1932年改組為合資會社' },
          { label: '洋樓落成', value: '1934年（官方登錄：約1930年代）' },
          { label: '地址', value: '臺北市大同區民生西路309號' },
          { label: '主力商品', value: '包種茶，外銷泰國、安南等地' },
        ],
        sourceIds: ['tcmb-xinfangchun', 'epochtimes-xinfangchun-2022', 'nchdb-xinfangchun', 'ltn-xinfangchun-2015', 'ntcri-77-xinfangchun'],
      },
      {
        id: 'architecture',
        type: 'text',
        tab: '臺北最大的茶工廠',
        title: '臺北最大的茶工廠',
        lead: '三開間、三進、三層的洋樓，把茶行、烘焙茶工廠、倉庫與主人住宅放在同一棟建築裡；2009年指定為市定古蹟。',
        paragraphs: [
          '官方登錄描述：三樓店屋形式，連續三崁街屋，水平帶狀的女兒牆，屋頂突出三角形山頭，裝飾花草圖樣的泥塑，中間牌樓面退縮作陽台；正立面的泥塑出自大稻埕名匠郭三川之手。《臺灣工藝》形容它是融合中西特色的日治時期洋樓，有穿心廊與日月雙井，門楣山牆飾有勳章與忍冬草的花紋。',
          '一樓的正廳是茶行、帳房與銷售空間，後進是精製茶的倉庫與加工廠，紅磚砌的焙籠間保留數十個焙籠坑與竹籠，還留著乾燥機、風選機等機具；二樓是揀茶間、辦公室與會客廳，當年女工們在這裡人工揀茶；三樓是王家的起居空間與公媽廳，前廳至今仍是祖廳。古蹟登錄的理由寫它結合四種空間機能，是當時臺北最大的茶工廠，也是建築類型的孤例。',
          '2005年3月登錄為歷史建築，2009年9月29日指定為直轄市定古蹟。2007年屋主陸續搬出後，2011年到2015年由興富發建設出資修復，恢復九成原貌；2015年12月18日舉行落成典禮，王國忠把建築捐贈給臺北市政府。',
        ],
        facts: [
          { label: '文化資產', value: '直轄市定古蹟（宅第、產業），2009年9月29日公告，北市文化二字第09830231500號' },
          { label: '規模', value: '三開間、三進、三層；樓地板約五百坪' },
          { label: '泥塑', value: '大稻埕名匠郭三川' },
          { label: '修復', value: '2011–2015年，興富發建設出資' },
          { label: '古物', value: '紫地「新芳春行」大八仙彩，2019年指定為一般古物' },
        ],
        sourceIds: ['nchdb-xinfangchun', 'ntcri-77-xinfangchun', 'ntcri-77-xinfangchun-restoration', 'ltn-xinfangchun-2015', 'pts-xinfangchun-2016', 'epochtimes-xinfangchun-2022'],
      },
      {
        id: 'museum',
        type: 'text',
        tab: '活的茶葉故事館',
        title: '從停歇到活的茶葉故事館',
        lead: '茶業外銷在戰後逐漸式微，新芳春停止製茶；修復後的洋樓在2016年開放，成為免費參觀的茶葉故事館。',
        paragraphs: [
          '戰後，臺灣的包種茶仍出口到泰國、馬來西亞、新加坡與印尼等華人聚居的地方；但1970年代末起受到競爭，新芳春的業務日漸萎縮，1990年代以後幾乎停滯（國家文化記憶庫）。大紀元寫1960年代後大稻埕許多茶商轉業，新芳春逐漸收起事業、部分空間出租；王國忠在2016年受訪時說「12年前乾脆不做了」。三種說法的時間不同，本站只寫「逐漸停歇」。',
          '臺北市政府文化局2016年5月接管，9月20日推出特展並對外開放，展區保存近三千件文物；2018年起委由台灣文創發展基金會經營，以「活的茶葉故事館」、「茶文創發展平台」、「以茶會友」為三大主軸。二樓有王家生活展、茶貿易文物與建築修復展，一樓有「記憶的磚瓦」常設展。',
          '今天的新芳春茶行免費參觀，週三至週日10:00到18:00開放，週一、二休館（臺北旅遊網，2026年10月）。走進去，可以看到焙籠間的焙籠坑、揀茶間，以及當年外銷用的茶樣與獎狀。',
        ],
        facts: [
          { label: '捐贈', value: '2015年，第三代王國忠捐贈臺北市政府' },
          { label: '開放', value: '2016年9月20日' },
          { label: '經營', value: '2018年起，台灣文創發展基金會' },
          { label: '參觀', value: '免費；週三至週日 10:00–18:00' },
        ],
        sourceIds: ['tcmb-xinfangchun', 'epochtimes-xinfangchun-2022', 'zsdo-xinfangchun-2020', 'pts-xinfangchun-2016', 'travel-taipei-xinfangchun', 'curation-dadaocheng-tea'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '包種茶外銷南洋',
        title: '代表茶品｜外銷南洋的包種茶',
        intro: '新芳春以包種茶為主力商品，外銷安南、暹羅、井裡汶等地。以下圖鑑介紹包種茶，以及茶行裡製茶與外銷的器物。',
        items: [
          {
            id: 'baozhong-tea',
            name: '文山包種茶',
            category: '輕發酵｜條形',
            description: '條形的輕發酵茶，茶湯清香。大稻埕外銷南洋的主力茶幾乎都是坪林的文山包種茶；新芳春向文山、南港的茶農收購包種茶精製。',
            note: '店內展出新芳春在「全臺省優良茶比賽」得獎的獎狀（《臺灣工藝》圖說）。',
          },
          {
            id: 'roasting-basket',
            name: '焙籠坑',
            category: '製茶｜一樓後進',
            description: '紅磚砌的焙籠間排著成排的焙籠坑，上面架竹焙籠以炭火低溫烘焙。報導寫這裡曾布滿一百個坑穴，一天二十四小時都在高溫烘焙中。',
          },
          {
            id: 'tea-chest',
            name: '外銷茶箱',
            category: '外銷｜倉庫',
            description: '精製好的茶裝進茶箱，從大稻埕碼頭運出；茶箱上印著商號與目的地的標記。二樓的常設展有外銷茶的茶樣與貿易文物。',
          },
        ],
        footnote: '包種茶的一般介紹不出自新芳春；器物依《臺灣工藝》與報導描述繪製，不是館藏的精確圖像。',
        sourceIds: ['ntcri-77-xinfangchun', 'epochtimes-xinfangchun-2022', 'tcmb-xinfangchun', 'culture-taipei-walk-dadaocheng-2018'],
      },
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/xin-fang-chun.md。',
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
      },
    ],
  },
  {
    id: 'bolero',
    name: '波麗路',
    status: 'open',
    year: 1934,
    yearLabel: '1934年開業',
    yearNote: '1934年開業：官方歷史建築登錄、鏡週刊、食力、維基百科一致；遠見2011年以「營業77年」推算亦同。建物本身官方登錄寫「初建於1920年代」。',
    sourceIds: ['boch-bolero', 'mirror-2025-bolero', 'foodnext-2020-bolero', 'gvm-2011-bolero'],
    category: '西餐廳',
    seal: '西餐',
    summary: '1934年廖水來在民生西路開設的西餐廳，官方登錄稱它是「臺北市1930年代最著名的西餐廳」；畫家常聚、年輕人相親，招牌是法國鴨子飯與咖哩飯，至今仍在原址營業。',
    summaryEn: 'A Western-style restaurant opened in 1934 by Liao Shuilai (廖水來) on Minsheng West Road. The official heritage registration calls it "the most famous Western restaurant in 1930s Taipei". Painters gathered here and young people came for matchmaking meetings; its signature dishes are French-style duck rice and curry rice, and it still operates at the original site.',
    note: '波麗路在民生西路314號（官方歷史建築登錄）；街上的建築依「Art Deco 二層街屋、西餐廳櫥窗」示意，並非精確復原。店內的座位、裝潢與菜單只在章節文字裡。',
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
      postwar:
        '戰後波麗路一直在原址營業，後來買下了這棟建物；1976年在隔壁開了第二店（遠見2011）。鏡週刊寫張萬傳、楊三郎、郭雪湖等畫家常在這裡出入；食力與遠見城市都寫它是年輕人相親的地方。1961年一份法國鴨子飯25元（遠見2011）。',
      revival:
        '2006年5月17日登錄為臺北市歷史建築（文化部國家文化資產網）。餐廳仍由家族經營，招牌的法國鴨子飯、咖哩飯與牛排還在菜單上（食力、鏡週刊）；本站不列營業時間與價格。',
    },
    // 二層的 Art Deco 樓：鏡頭在街道上往側邊拉開一點，看得到櫥窗與樓上的鋼框窗
    camera: { distance: 6.4, height: 4.4, side: 4.5, lookHeight: 3.2 },
    chapters: [
      {
        id: 'background',
        type: 'text',
        tab: '西餐與咖啡的年代',
        title: '1930年代大稻埕的西餐與咖啡館',
        lead: '1930年代的太平町（今延平北路、民生西路一帶）出現了喫茶店與西餐廳；波麗路是其中留下最多記載、至今還在營業的一家。',
        paragraphs: [
          '日治時期的大稻埕以茶葉致富，1930年代的太平町已經是臺灣人聚居的鬧區。魚夫在遠見城市的文章寫到，1931年維特咖啡在太平町三丁目開業；三立新聞網的報導則寫它由楊三郎的兄長楊承基經營，開在今延平北路與南京西路口的二樓，1932年起引進「女給」（女服務生）。這些關於維特咖啡的記載本站只讀到媒體層級，所以只在這裡交代背景，不做成可探索的店家。',
          '鏡週刊寫到，廖水來原本在維特咖啡擔任主廚，1934年自立門戶開了波麗路。文化部國家文化資產網的歷史建築登錄稱波麗路是「臺北市1930年代最著名的西餐廳，是沙龍文化的先鋒，為生活西化重要見證」。這一年大稻埕的民生西路上也落成了新芳春茶行的三層洋樓；茶商的財富、西洋的飲食與音樂，在同一條街上並存。',
          '同一時期以文人聚會聞名的山水亭（王井泉經營的臺菜餐廳，常客有陳逸松、張文環、呂赫若、吳新榮等），開業年各資料不一（1937、1938、1939三說）、門牌查無，所以暫不做成店家、也不對應街景裡的任何一棟；王井泉與山水亭的事見「人物：王井泉」一章。',
        ],
        facts: [
          { label: '維特咖啡', value: '1931年開於太平町三丁目（遠見城市、三立新聞網）；1932年引進女給（三立，單一來源）' },
          { label: '波麗路', value: '1934年開業，民生西路314號；臺北市歷史建築' },
          { label: '新芳春茶行', value: '1934年落成，民生西路309號' },
          { label: '山水亭', value: '王井泉經營的臺菜餐廳，延平北路一帶街屋二樓；開業年三說、門牌查無（見「人物：王井泉」）' },
        ],
        sourceIds: ['boch-bolero', 'mirror-2025-bolero', 'gvm-city-2024-bolero', 'setn-2020-vite-cafe', 'newtalk-2024-shanshuiting', 'sinica-newsletter-1584-shanshuiting', 'nchdb-xinfangchun'],
      },
      {
        id: 'history',
        type: 'text',
        tab: '廖水來',
        title: '廖水來與九十年的西餐廳',
        lead: '廖水來赴日學西餐，1934年在朋友鼓勵下租下小店面開業（遠見2011）；波麗路至今仍在民生西路的原址營業。',
        paragraphs: [
          '遠見雜誌2011年的報導寫到，廖水來年輕時到日本學西餐，回來後在朋友鼓勵下租了一間小店面開業；後來生意穩定，買下了這棟建物。鏡週刊補充他原在維特咖啡任主廚。店名「波麗路」相傳取自法國作曲家拉威爾的樂曲〈Boléro〉（鏡週刊、維基百科；食力與遠見的文章沒有說明由來，本站只寫「相傳」）。',
          '官方的歷史建築登錄寫這棟建物「初建於1920年代，後於1934年餐廳開業後進行裝修」，門牌是民生西路314號；魚夫寫它在日治時期屬於太平町三丁目，約今民生西路與延平北路口。鏡週刊同一篇文章把門牌寫成134號又寫成314號，本站依官方登錄採314號。',
          '遠見2011年的報導寫本店從開業起一直在原址，沒有搬過；1976年在隔壁開了第二店。維基百科另寫1947年由畫家顏雲連重新設計改建、1976年兄弟分家另一店在308號，這兩點只有維基一個來源，本站不採用。2006年5月17日，臺北市政府把314號的建物登錄為歷史建築。',
        ],
        facts: [
          { label: '創辦人', value: '廖水來，赴日學西餐；原在維特咖啡任主廚（鏡週刊）' },
          { label: '開業', value: '1934年' },
          { label: '店名', value: '相傳取自拉威爾的〈Boléro〉（鏡週刊、維基百科）' },
          { label: '地址', value: '臺北市大同區民生西路314號（官方登錄）' },
          { label: '文化資產', value: '臺北市歷史建築，2006年5月17日登錄' },
          { label: '第二店', value: '1976年在隔壁開設（遠見2011）' },
        ],
        sourceIds: ['gvm-2011-bolero', 'mirror-2025-bolero', 'boch-bolero', 'gvm-city-2024-bolero', 'wiki-bolero'],
      },
      {
        id: 'salon',
        type: 'text',
        tab: '沙龍與相親',
        title: '畫家的沙龍、年輕人的相親桌',
        lead: '進口磁磚、沙發椅與播著古典樂的電唱機，讓波麗路成了官方登錄所稱的「沙龍文化先鋒」；畫家在這裡聚會，年輕人在這裡相親。',
        paragraphs: [
          '空間｜遠見2011年的報導描述初開時的裝潢：進口的磁磚、沙發椅、吊扇與冷氣，店裡用78轉的電唱機播放古典音樂，服務員穿黑西裝、打領結。食力的文章寫廖水來設計了多層的鋼製圓飯盒（文中寫「據說」）；維基百科稱不鏽鋼餐具與牛排盤從創立就訂製，這一點只有維基一個來源，本站不採用。',
          '畫家｜鏡週刊寫到，張萬傳、楊三郎、陳德旺、洪瑞麟、郭雪湖等畫家常在波麗路出入，音樂家呂泉生、文史學者林衡道也常來（單一來源）。魚夫在遠見城市寫到，畫家陳清汾從巴黎回臺後與廖水來聊天，激發了鴨子飯的研發——這也是單一來源，本站寫成「文章提到」。',
          '相親｜食力與遠見城市都寫波麗路是年輕人相親的地方，魚夫用「相親定終身」形容。至於婚宴、在這裡辦過的展覽或聚會的具體年份，本站沒有查到可靠記載，不多寫。',
        ],
        facts: [
          { label: '裝潢', value: '進口磁磚、沙發椅、吊扇、冷氣、78轉電唱機（遠見2011）' },
          { label: '服務員', value: '黑西裝、領結（遠見2011）' },
          { label: '常客', value: '張萬傳、楊三郎、陳德旺、洪瑞麟、郭雪湖、呂泉生、林衡道（鏡週刊，單一來源）' },
          { label: '相親', value: '食力、遠見城市均記載' },
        ],
        sourceIds: ['gvm-2011-bolero', 'mirror-2025-bolero', 'foodnext-2020-bolero', 'gvm-city-2024-bolero', 'boch-bolero'],
      },
      {
        id: 'foods',
        type: 'foods',
        tab: '代表菜',
        title: '代表食物｜鴨子飯、咖哩飯與牛排',
        intro: '依食力、鏡週刊與遠見的報導選出三道店裡的代表菜。文獻沒有寫到每一道菜開始販售的年份，所以本站只寫「代表菜」，不說1934年就有；造型是本站依菜名與描述的示意。',
        items: [
          {
            id: 'duck-rice',
            name: '法國鴨子飯',
            category: '主菜｜飯',
            description: '食力與鏡週刊都寫它是波麗路的招牌：鴨肉配醬汁與飯。遠見2011年的報導記1961年一份25元。魚夫的文章提到畫家陳清汾從巴黎回來後與廖水來的談話激發了這道菜的研發（單一來源）。',
            note: '開始販售的年份文獻未載。鴨肉的部位、醬汁與配菜都是示意。',
          },
          {
            id: 'curry-rice',
            name: '咖哩飯',
            category: '主菜｜飯',
            description: '食力寫波麗路的咖哩飯附魚鬆，鏡週刊寫菜單上有牛肉咖哩飯。咖哩是日治時期經由日本傳入臺灣的西式料理。',
            note: '維基百科稱1934年開業時就有「鄉村咖哩飯」，只有這一個來源，本站不採用。',
          },
          {
            id: 'bolero-steak',
            name: '牛排',
            category: '主菜｜鐵盤',
            description: '鏡週刊寫波麗路的牛排先醃再煎。盛在金屬盤上的畫法對應食力所寫廖水來設計鋼製餐具的記載（「據說」），不是當年牛排盤的實際形狀。',
            note: '開始販售的年份文獻未載。',
          },
        ],
        footnote: '三道菜只有菜名與簡短描述見於媒體報導，作法、份量與盛器都是本站的示意；本站不列價格（1961年的25元是歷史記載，不是現價）。',
        sourceIds: ['foodnext-2020-bolero', 'mirror-2025-bolero', 'gvm-2011-bolero', 'gvm-city-2024-bolero'],
      },
      // 第 8 階段：人物小節（純文字，資料在 wangJingQuanData.js；專案沒有山水亭店家，所以掛在同年代、同一條街的波麗路）
      WANG_JINGQUAN_PERSON_CHAPTER,
      {
        id: 'sources',
        type: 'sources',
        tab: '文獻與歷史依據',
        title: '文獻與歷史依據',
        intro: '本店家介紹整理自下列資料，點選即可開啟原始網頁。查證紀錄見專案的 docs/research/bolero.md；維特咖啡與山水亭的資料也在同一份紀錄裡，王井泉與山水亭的查證見 docs/research/wang-jing-quan.md。',
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
      },
    ],
  },
  // 慈聖宮：同一座廟、同一個 ID，各年代的名稱、章節、熱點與類型見 eras（由 getShop(id, eraId) 套用）。
  // 酒樓繁華、摩登大稻埕是文化據點（廟的沿革）；庶民生活是廟口的情境示意攤位與四種小吃；老屋新生只寫現況。
  // 查證紀錄：docs/research/ci-sheng-gong-miaokou.md；章節內容在 ciShengMiaokouData.js。
  {
    id: 'ci-sheng-gong',
    name: '慈聖宮',
    kind: 'heritage',
    status: 'open',
    category: '文化據點｜媽祖廟・同安人信仰',
    seal: '慈聖',
    address: CI_SHENG_ADDRESS,
    yearNote: '初建年份各說不一（1855／1864／1866／1869），日治市區改正遷建（1909／1910）、重建完成（1914／1916）兩說並列，一律待核；古蹟身分只有維基百科一個來源，不寫成事實。',
    scenarioNote: '情境示意',
    sourceIds: ['sinica-gis-2025-cisheng', 'wiki-ci-sheng-gong'],
    summary: '同安人的媽祖廟：1853年頂下郊拚後遷到大稻埕，日治市區改正時再遷到今天保安街49巷的位置（年份各說不一，待核）。街上這座廟是情境示意。',
    note: '街上這座廟是情境示意：規模、格局、榕樹與廟埕沿用本站的廟宇原型，相對位置不是精確復原。',
    position: { x: 4, z: 4.5 },
    facing: 'north',
    interaction: { radius: 5 },
    chapters: CI_SHENG_CHAPTERS.heritage,
    hotspots: hotspotsToWorld(ciShengHotspots('banquet'), templeCourtToWorld),
    eraNotes: CI_SHENG_ERA_NOTES,
    eras: {
      postwar: {
        name: '慈聖宮廟口小吃',
        kind: null,
        category: '廟口小吃｜排骨湯・肉粥・豬腳麵線・四神湯',
        seal: '廟口',
        scenarioNote: '歷史情境重建',
        yearNote: '廟口攤販聚集的年代只有中研院 GIS 專題一句「民國50年間」的說明（待核）；各攤的店名、攤主、年份與傳承代數查無可靠出處，本站不寫。',
        sourceIds: ['sinica-gis-2025-cisheng', 'tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb'],
        summary: '慈聖宮廟埕前的小吃攤（歷史情境重建）：原汁排骨湯、肉粥、豬腳麵線、四神湯四種食物類型，依現在廟口的攤位整理做法特色，不對應任何實際的店家。',
        chapters: CI_SHENG_CHAPTERS.postwar,
        hotspots: hotspotsToWorld(ciShengHotspots('postwar'), templeCourtToWorld),
      },
      revival: {
        name: '慈聖宮廟口',
        kind: null,
        category: '廟口小吃',
        seal: '廟口',
        scenarioNote: null,
        yearNote: '現在廟口的各攤年份、攤主與傳承代數在不同來源裡互相矛盾，本站不寫具名店家。',
        sourceIds: ['tvbs-supertaste-cisheng', 'ettoday-2018-cisheng', 'tcma-cisheng-four-herb'],
        summary: '保安街49巷的慈聖宮廟口，現在仍有排骨湯、肉粥、豬腳麵線、四神湯這類小吃攤；本站不寫任何具名的店家。',
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
    status: 'open',
    category: '米業店屋・歷史建築',
    seal: '稻米',
    address: RICE_RECORD.address,
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
            eraLabel: item.label,
            scenarioNote: item.era === 'revival' ? null : '歷史情境示意',
            variant: item.variant,
            category: item.era === 'revival' ? '米食料理・稻米文化・歷史建築' : item.era === 'banquet' ? '北街米業（米商・碾米）' : item.era === 'modern' ? '米行・碾米間' : '米行・住家與倉庫',
            seal: item.era === 'revival' ? '稻舍' : '米',
            summary: RICE_ERA_NOTES[item.era],
            yearLabel: item.era === 'revival' ? '2020年登錄歷史建築' : '',
            yearNote: '資料記載的建立年代是1907年，2020年4月28日登錄為臺北市歷史建築；唐益興米行1916年創立（2022年報導）。',
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
    status: 'open',
    category: '糕餅鋪・歷史老店',
    seal: '十字軒',
    address: SZX_RECORD.address,
    summary: '延平北路二段的糕餅老店：從窄身的糕餅店初創、戰後擴大為兩個店面寬的餅舖，到現在三層樓的十字軒糕餅舖。',
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
              eraLabel: item.label,
              scenarioNote: item.era === 'revival' ? null : '歷史情境示意',
              variant: item.variant,
              category: item.era === 'revival' ? '糕餅鋪・歷史老店' : item.era === 'modern' ? '糕餅店（初創）' : '漢餅・祭祀糕點',
              seal: item.era === 'revival' ? '十字軒' : '餅',
              summary: SZX_ERA_NOTES[item.era],
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
export function shopYearText(shop) {
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
