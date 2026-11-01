/**
 * 林華泰茶行各年代室內的人物對話（第 11 階段；格式見 game/talk.js）：每個年代一位不具名的情境人物。
 * 有出處的句子附出處（家族口述出自官網〈林華泰的歷史〉，也算有出處的敘述）；情境閒聊標「虛構對白」，
 * 不把沒有證據的事安在林家或店裡的真實人物身上。說完可以近看一件器物（objectId）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const LHT_TALK = [
  {
    eraId: 'banquet',
    npcId: 'lht-banquet-sorter-a',
    role: '揀茶女',
    roleEn: 'A tea sorter',
    doing: '圍著竹淺盤揀茶',
    doingEn: 'Sorting tea round a bamboo tray',
    objectId: 'tea-sorting-tray',
    lines: [
      sourced('茶季一到，揀茶的人坐滿店裡，連囝仔和老人家都來幫忙揀。', 'When the tea season comes the shop fills with sorters—even the children and the old folk come to help.', ['nmth-1904-tea-sorters']),
      sourced('茶枝、茶梗、壞葉仔，一片一片挑掉，挑清氣了才送去焙。', 'Twigs, stalks, bad leaves—out they come one by one, and only clean tea goes to the fire.', ['nmth-1904-tea-sorters']),
      fiction('你看我這盤，挑得比旁邊那盤還乾淨。', 'Look at my tray—cleaner than the one next to it.'),
    ],
    followUps: [
      {
        id: 'packet',
        question: '前面那桌在包什麼？',
        questionEn: 'What are they wrapping at the front?',
        lines: [sourced('那是四方包：兩張毛邊紙包四兩茶，外面蓋茶名和行號的印，所以叫「包種」。', 'Square packets: four taels of tea in two sheets of rough paper, stamped with the tea’s name and the firm’s—that’s why it’s called “baozhong”.', ['moa-baozhong-weekly'])],
      },
    ],
  },
  {
    eraId: 'modern',
    npcId: 'lht-modern-roaster',
    role: '焙茶師傅',
    roleEn: 'A tea roaster',
    doing: '在火坑之間的走道照看焙籠',
    doingEn: 'Tending the baskets in the aisle between the pits',
    objectId: 'charcoal-pit',
    lines: [
      sourced('火坑裡是相思木炭，上面蓋著厚厚的稻糠悶燒，一點煙都沒有。', 'The pits hold acacia charcoal smouldering under a thick layer of rice husk—not a wisp of smoke.', ['linhuatai-site']),
      sourced('茶先在走道上鋪在焙籠的竹盤上，再整籠捧去放在火坑上。', 'The tea is spread on the basket’s bamboo disc out here in the aisle, then the whole basket goes over the pit.', ['linhuatai-site']),
      fiction('走路看腳下，這裡一排一排都是火坑。', 'Mind your step—it’s rows of fire pits all the way.'),
    ],
    followUps: [
      {
        id: 'warm',
        question: '這間這麼熱，冬天很好待吧？',
        questionEn: 'It must be cosy in here in winter?',
        lines: [sourced('暖房是焙茶用的，不是給人取暖的；不過冬夜有女客來，常待在這裡聊天。', 'The warm room is for firing tea, not for warming people—though on winter nights the women visitors like to sit and chat in here.', ['linhuatai-site'])],
      },
    ],
  },
  {
    eraId: 'postwar',
    npcId: 'lht-postwar-worker',
    role: '茶行工人',
    roleEn: 'A tea-hong worker',
    doing: '照看鋪疊的茶與茉莉花',
    doingEn: 'Keeping an eye on the layers of tea and jasmine',
    objectId: 'jasmine-scenting',
    lines: [
      sourced('天黑以後，茉莉花農騎腳踏車載花來，一台車前後掛好幾袋。', 'After dark the jasmine growers ride in on bicycles, bags of flowers hung front and back.', ['linhuatai-site']),
      sourced('茶和花混在一起過夜，半夜要起來翻一兩次，到天亮花謝了，香氣都進到茶裡。', 'Tea and flowers sit together overnight; we get up to turn them once or twice, and by dawn the flowers have faded and the scent is in the tea.', ['linhuatai-site']),
      fiction('今晚又要睡不飽囉。', 'Another short night’s sleep for me.'),
    ],
    followUps: [
      {
        id: 'dryer',
        question: '旁邊那台大機器是什麼？',
        questionEn: 'What’s that big machine?',
        lines: [sourced('大型乾燥機。火坑從三十幾個減到八個，焙茶多半交給它了。', 'The big drying machine. The pits have gone from thirty-odd down to eight; most of the firing is its job now.', ['linhuatai-site'])],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'lht-revival-staff',
    role: '茶行店員',
    roleEn: 'A shop assistant',
    doing: '在櫃台招呼客人',
    doingEn: 'Serving customers at the counter',
    objectId: 'tea-drum',
    lines: [
      sourced('價錢都寫在桶蓋上，不用問，看蓋子就知道。', 'The prices are on the lids—no need to ask, just read them.', ['linhuatai-site']),
      sourced('店後那台乾燥機運作半個世紀了，現在還在用。', 'The drying machine out back has been running for half a century and it’s still in use.', ['linhuatai-site']),
      fiction('要買多少？我用秤秤給你。', 'How much would you like? I’ll weigh it out for you.'),
    ],
    followUps: [
      {
        id: 'pits',
        question: '後面那兩個坑是什麼？',
        questionEn: 'What are the two pits at the back?',
        lines: [sourced('以前炭焙的火坑，最後剩這兩個，留著當遺址。', 'The old charcoal-roasting pits—these last two are kept as a relic.', ['linhuatai-site', 'tcmb-linhuatai-500830'])],
      },
    ],
  },
]
