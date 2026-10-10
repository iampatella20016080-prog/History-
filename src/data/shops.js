/**
 * 店家資料
 *
 * 每一間店家都是一筆資料，互動提示、鏡頭運鏡與店家介紹視窗全部共用：
 *
 * - 基本資訊：name / year / category / eraId
 * - 場景配置：position（店面立面中心的世界座標，單位：公尺）、facing（店面朝向）、
 *             building（交給共用建築產生器的外觀參數）、camera（探索時的鏡頭構圖）
 * - 介紹章節：chapters，支援三種版型
 *     text    ── 歷史敘述（lead、paragraphs、timeline、glossary、seals、facts）
 *     foods   ── 代表食物圖鑑卡片
 *     sources ── 文獻與歷史依據（以 id 參照 sources.js）
 *
 * 新增店家時，只要在 SHOPS 加入一筆資料：街景會自動在該座標預留店面，
 * 並套用同一套互動、鏡頭與介紹介面，不需要改寫系統。
 *
 * 街道座標說明：街道沿 X 軸延伸（西側 x < 0 通往淡水河岸碼頭），
 * 街道中心線為 z = 0，北側街屋立面位於 z = -4.5、南側位於 z = 4.5。
 */
export const SHOPS = [
  {
    id: 'lin-fu-zhen',
    name: '林復振',
    eraId: 'qing-port',
    year: 1853,
    category: '南北貨商號',
    seal: '南北貨', // 介紹視窗左上角的印章文字
    summary: '「大稻埕開基人物」林右藻及其家族所創設的商號。',

    // ── 場景配置 ──────────────────────────────
    position: { x: -2, z: -4.5 },
    facing: 'south',
    interaction: { radius: 3.4 },
    building: {
      type: 'shophouse',
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
      sign: { text: '林復振', style: 'lacquer' },
      hangingSign: { text: '南北貨', style: 'wood' },
      lanterns: { text: '林' },
      // 店前展示的貨品（對應食物圖鑑的 id）
      display: ['shiitake', 'dried-shrimp', 'mullet-roe', 'dried-goods'],
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
          '本網站的 3D 街景為 19 世紀大稻埕商業街區氛圍的概念性重建；建築外觀、招牌與擺設僅供情境想像，並非精確復原。',
      },
    ],
  },
]

export function getShop(id) {
  return SHOPS.find((shop) => shop.id === id) ?? null
}

export function getShopsByEra(eraId) {
  return SHOPS.filter((shop) => shop.eraId === eraId)
}
