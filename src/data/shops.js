import { ART_YARD, LUGUO_CAFE, LUGUO_HOTSPOTS, artYardToWorld } from './luguoCafeLayout.js'
import {
  LAO_PAN,
  LAO_PAN_HOTSPOTS,
  SQUID_SOUP_THEME,
  TEMPLE_STALL,
  TEMPLE_STALL_HOTSPOTS,
  TEMPLE_STALL_SITE,
  laoPanToWorld,
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
    chapters: [
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
    ],
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
      {
        id: 'sources',
        type: 'sources',
        tab: '參考資料',
        title: '參考資料',
        intro: '永樂市場的介紹整理自下列資料，點選即可開啟原始網頁。',
        sourceIds: ['tcma-yongle-market', 'taipei-market-info-yongle', 'ncl-yongle-market', 'udn-1995-yongle-market'],
        disclaimer:
          '永樂市場大樓的 3D 外觀依實地照片建模，比例為估算；一樓市場的平面是簡化的概念配置，攤位數量、位置與陳設都不是精確復原。',
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
          { term: '粿', definition: '糕的總稱，指用糯米或粳米等做成的食品（教育部《臺灣台語常用詞辭典》）。' },
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
    site: { x: 22.9, z: 4.5, rotationY: 0, replaces: ['south-17'] },
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
        ],
        facts: [
          { label: '開幕', value: '2011年' },
          { label: '經營', value: '世代群（世代文化創業群）' },
          { label: '概念', value: '「大稻埕上賣小藝」' },
        ],
        sourceIds: ['gvm-2013-artyard', 'businesstoday-2012-watson', 'artyard-about', 'businesstoday-2015-dadaocheng', 'ntpu-2014-dadaocheng', 'supertaste-artyard'],
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
          { term: '鰇魚羹', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。' },
          { term: '羹', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。' },
          { term: '廟口', definition: '廟門口、廟前廣場（同上）。' },
          { term: '點心擔', definition: '賣點心小吃的攤販（同上）。' },
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
          { term: '鰇魚羹', definition: '一種小吃，用魷魚作成的羹湯（教育部《臺灣台語常用詞辭典》）。' },
          { term: '羹', definition: '芶芡而成的濃稠湯汁；異用字「焿」（同上）。' },
          { term: '沙茶', definition: '用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料（同上）。' },
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
          { term: '米篩目（米苔目）', definition: '米篩的網目，也指篩出的米條食品（教育部《臺灣台語常用詞辭典》）。' },
          { term: '廟口', definition: '廟門口、廟前廣場（同上）。' },
          { term: '點心擔', definition: '賣點心小吃的攤販（同上）。' },
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
      {
        id: 'sources',
        type: 'sources',
        tab: '資料來源',
        title: '資料來源',
        intro: '永樂米苔目的介紹整理自下列資料，點選即可開啟原始網頁；每一筆都標示出版時間與用途。店面與店內的 3D 模型另外依使用者提供的實地照片建模。',
        sourceIds: ['bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang', 'moe-bi-thai-bak'],
        disclaimer:
          '媒體與食記只支持當次的記錄，不當成最新的價格、營業時間或店史；創立年份、店史與傳承關係沒有可以核實的資料，都沒有寫成事實。照片裡的路人、隔壁店家的招牌與廣告沒有放進場景，店裡的人物是簡化的情境人物。',
      },
    ],
  },
  {
    id: 'lin-hua-tai',
    name: '林華泰茶行',
    status: 'coming-soon',
    year: 1883,
    category: '茶行',
    seal: '茶行',
    summary: '創立於1883年，是大稻埕歷史悠久的茶行之一。',
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
  },
  {
    id: 'you-ji',
    name: '有記名茶',
    status: 'coming-soon',
    year: 1890,
    category: '茶行',
    seal: '茶行',
    summary: '前身為王有記茶行，1890年創立的製茶老字號，至今仍在大稻埕營業。',
    position: { x: 11.6, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.2 },
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
  },
  {
    id: 'li-ting-xiang',
    name: '李亭香',
    status: 'coming-soon',
    year: 1895,
    category: '餅店',
    seal: '糕餅',
    summary: '創立於1895年的糕餅老店，大稻埕的創始店至今仍在營業。',
    position: { x: 16.7, z: 4.5 },
    facing: 'north',
    interaction: { radius: 3.2 },
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
    buildingByEra: {
      banquet: { condition: 'new', sign: { text: '李亭香', style: 'gold' } },
      modern: { condition: 'mature' },
      postwar: { condition: 'aged', sign: { text: '李亭香', style: 'painted' } },
      revival: { condition: 'restored', sign: { text: '李亭香', style: 'modern' } },
    },
  },
  {
    id: 'jiang-shan-lou',
    name: '江山樓',
    status: 'coming-soon',
    year: 1917,
    // 創立年份記載不一：國立臺灣歷史博物館與維基百科記為1917年，求真百科記為1921年開幕
    yearLabel: '1917年（一說1921年）',
    yearNote: '創立年份記載不一：國立臺灣歷史博物館典藏說明與維基百科記為1917年（大正6年），求真百科則記為1921年11月20日開幕。',
    sourceIds: ['nmth-jiang-shan-lou', 'wiki-jiang-shan-lou', 'factpedia-jiang-shan-lou'],
    category: '酒樓',
    seal: '酒樓',
    reconstruction: true,
    summary: '日治時期大稻埕著名的臺灣料理酒樓，以經營者吳江山之名命名，是四層樓的紅磚建築，也是仕紳社交的重要場所。',
    note: '江山樓建築今已不存（1976年拆除），場景依史料記載的「四層樓紅磚建築」重建，為歷史情境重建，並非精確復原。',
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
  },
  {
    id: 'xin-fang-chun',
    name: '新芳春茶行',
    status: 'coming-soon',
    year: 1934,
    category: '茶行',
    seal: '茶行',
    summary: '1934年落成的住商合一洋樓，結合閩南式與仿洋式建築，2009年列為臺北市定古蹟。',
    position: { x: -27, z: 4.5 },
    facing: 'north',
    interaction: { radius: 3.4 },
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
  },
  {
    id: 'bolero',
    name: '波麗路',
    status: 'coming-soon',
    year: 1934,
    category: '西餐廳',
    seal: '西餐',
    summary: '1934年由廖水來創立的西餐廳，店名取自他喜愛的樂曲〈Bolero〉。',
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
  },
  {
    id: 'ci-sheng-gong',
    name: '慈聖宮廟口小吃',
    status: 'coming-soon',
    category: '廟口小吃',
    seal: '小吃',
    summary: '慈聖宮前榕樹下的小吃攤，是老台北熟悉的庶民味道。',
    position: { x: 4, z: 4.5 },
    facing: 'north',
    interaction: { radius: 5 },
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
      // 東側的前緣是米苔目攤（temple-mi-tai-mu-stall，取代那裡原本的一般小吃攤），東側榕樹也讓出空間
      postwar: { condition: 'aged', stalls: true, clearing: TEMPLE_STALL.clearing, eastClearing: MI_TAI_MU_STALL.clearing, frontStall: false },
      revival: { condition: 'restored', stalls: true },
    },
  },
  {
    id: 'dao-she',
    name: '稻舍',
    status: 'coming-soon',
    category: '食堂',
    seal: '稻米',
    summary: '由迪化街北段的老米行整修而成的食堂與稻米文化空間。',
    position: { x: 29.2, z: 4.5 },
    facing: 'north',
    interaction: { radius: 3.2 },
    building: {
      archetype: 'minnan',
      width: 5.6,
      depth: 11,
      floors: 2,
      groundHeight: 3.3,
      ground: 'brick',
      upper: 'plaster',
      plasterTint: '#eadcc0',
      gable: 'horseback',
      ridge: 'plain',
      storefront: 'open',
      goods: 'rice',
      sign: { text: '米', style: 'wood' },
    },
    // 清末之後這裡是米行（以一般「米」字招牌示意），今日成為稻舍
    buildingByEra: {
      banquet: { condition: 'mature' },
      modern: { condition: 'mature' },
      postwar: { condition: 'aged', sign: { text: '米', style: 'painted' } },
      revival: { condition: 'restored', modernFront: true, sign: { text: '稻舍', style: 'modern' } },
    },
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

export function getShop(id) {
  return SHOPS.find((shop) => shop.id === id) ?? null
}

/** 飲食主題（例如「魷魚羹飲食文化」：兩個年代各一個版本，只以主題串連） */
const THEMES = { [SQUID_SOUP_THEME.id]: SQUID_SOUP_THEME, [MI_TAI_MU_THEME.id]: MI_TAI_MU_THEME }

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

/** 某個年代出現在街上的店家（依 eras.js 的 availableStores 排序） */
export function getShopsByEra(era) {
  return (era?.availableStores ?? []).map(getShop).filter(Boolean)
}

/** 店家在某個年代的建築設定（共用外觀＋該年代差異）；該年代沒有特殊建築時回傳 null */
export function getShopBuilding(shop, eraId) {
  const override = shop.buildingByEra?.[eraId]
  if (!override) return null
  return { ...shop.building, ...override }
}
