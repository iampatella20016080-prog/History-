/**
 * 迪化街 329 號酒樓繁華版前店的人物對話（第 11 階段第 9 項；格式見 game/talk.js；文字見 docs/research/interior-rice-and-shine-329.md 第 4 節）。
 * 人物都不具名，是情境人物；稻舍仍在營業，這裡的人物也不安在唐家或任何真實人物身上。
 * 1907 年建屋以前與 1916 年以前 329 號的使用者查無：「大正五年起是唐家的益興米行」只有臺灣英文新聞一個來源，放在追問裡並明說「現在還說不準」。
 * 「一斗十一斤半」是 2020 年宜蘭米店的戰後換算，不放進 1895–1930 的對白（見 data/riceAndShineObjects.js）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const RICE_TALK = [
  {
    eraId: 'banquet',
    npcId: 'rs-banquet-shopman',
    role: '米店夥計',
    roleEn: 'A rice-shop hand',
    doing: '在米箱前用斗量米',
    doingEn: 'Measuring rice with a dou at the bin',
    objectId: 'rice-bin',
    lines: [
      sourced('買米自己帶袋子來，我用斗量：裝滿、刮平，一斗就是一斗。', 'Bring your own bag and I’ll measure by the dou: fill it, strike it level, and a dou is a dou.', ['tcmb-rice-shop-559158', 'tcmb-rice-measures-260251']),
      sourced('這斗是官製的，印了「官」字、蓋了總督府的火戳，私做的不能賣。', 'This dou is government-made, marked “official” and branded with the Government-General’s stamp—a privately made one can’t be sold.', ['nmth-rice-measure-2000-001-0044', 'nmth-rice-measure-2003-001-0898']),
      fiction('北街這幾年米行一家一家開，船從上游載穀下來。', 'These past years the rice shops on North Street have opened one after another, with boats bringing paddy down from upriver.'),
    ],
    followUps: [
      {
        id: 'shop-name',
        question: '這間店叫什麼？',
        questionEn: 'What is this shop called?',
        lines: [sourced('大正五年起這裡是唐家的益興米行——不過那是以後的事，現在還說不準。', 'From Taisho 5 this is the Tang family’s Yixing rice shop—but that is for later; it’s hard to say for now.', ['taiwannews-2022-rice-shine'])],
      },
    ],
  },
  {
    eraId: 'banquet',
    npcId: 'rs-banquet-customer',
    role: '買米的客人',
    roleEn: 'A customer buying rice',
    doing: '提著米袋等夥計量米',
    doingEn: 'Waiting with a rice bag for the shop hand to measure',
    lines: [
      fiction('兩斗糙米，米袋在這。', 'Two dou of brown rice—here’s my bag.'),
      fiction('白米貴，糙米煮久一點一樣香。', 'White rice is dear; brown rice, cooked a little longer, smells just as good.'),
    ],
    followUps: [],
  },
]
