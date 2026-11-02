/**
 * 昭和浪漫洗濯屋（老屋新生）的路人對話（格式見 game/talk.js）：三位不具名的情境人物，都是客人或路人，
 * 不替仍在營業的店家說話、不扮演店員。有出處的句子附出處；只有一篇媒體的說法在句子裡說「聽說」；
 * 情境閒聊標「虛構對白」。說完可以近看一件器物（objectId）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const folklore = (text, textEn) => ({ text, textEn, label: 'folklore' })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const SHOWA_TALK = [
  {
    eraId: 'revival',
    npcId: 'showa-queue-visitor',
    role: '排隊的遊客',
    roleEn: 'A visitor in the queue',
    doing: '在門口滑手機等霜淇淋',
    doingEn: 'Scrolling on a phone while waiting for soft serve',
    objectId: 'qiaolong-sign',
    lines: [
      sourced('網路上都說這裡以前是開了八十年的洗衣店。', 'Everyone online says this used to be a laundry that ran for eighty years.', ['supertaste-showa-laundry']),
      fiction('可是我找了半天，沒有人寫出洗衣店叫什麼。', 'But I’ve searched and searched, and nobody says what the laundry was called.'),
      fiction('欸，門邊那塊紅色的直招牌，寫的是「僑隆洗染」耶。', 'Hey—that red vertical sign by the door says “Qiaolong Laundry and Dyeing”.'),
    ],
    followUps: [
      {
        id: 'year',
        question: '那這間房子到底幾年了？',
        questionEn: 'So how old is the house, really?',
        lines: [
          sourced('有一篇市府刊物寫是1937年的老宅，不過只有那一篇這樣寫。', 'One city magazine says it was a house built in 1937—but that’s the only one that says so.', ['taipei-pictorial-showa-laundry']),
          fiction('所以我就當作「聽說」囉。', 'So I’ll just file it under “reportedly”.'),
        ],
      },
      {
        id: 'flavour',
        question: '今天是什麼口味？',
        questionEn: 'What flavour is it today?',
        lines: [sourced('口味差不多一個月換一次，要看當月的菜單。', 'The flavour changes about once a month—you have to check that month’s menu.', ['funliday-showa-laundry', 'pbear-showa-laundry'])],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'showa-bench-elder',
    role: '坐在長凳上的阿伯',
    roleEn: 'An old man on the bench',
    doing: '在山牆下的長凳上乘涼',
    doingEn: 'Taking the air on the bench under the gable',
    objectId: 'soft-serve-model',
    lines: [
      sourced('有人寫這條街清朝的時候叫「震和街」，日本時代才拉直的。', 'Someone wrote that in the Qing this street was called Zhenhe Street, and it was only straightened in the Japanese era.', ['justabalcony-anxi-street']),
      sourced('對面那個公園，戰爭末期劃成防空的疏開空地。', 'The park over the road was marked out as an air-raid clearance space at the end of the war.', ['hung-2014-air-defense-open-space']),
      fiction('以前哪有人排隊吃冰排到街角。', 'In my day nobody queued round the corner for an ice cream.'),
    ],
    followUps: [
      {
        id: 'dango',
        question: '暖簾上的三色糰子是什麼意思？',
        questionEn: 'What do the three-colour dango on the curtain mean?',
        lines: [
          folklore('聽說是豐臣秀吉賞花的時候開始的，粉紅、白、綠，是花、雪和新綠。', 'They say it started with Toyotomi Hideyoshi’s blossom-viewing—pink, white and green, for blossom, snow and fresh leaves.'),
          fiction('我是比較愛吃烤的啦。', 'Me, I just like them grilled.'),
        ],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'showa-collector',
    role: '看老物件的客人',
    roleEn: 'A customer looking at old things',
    doing: '看碗櫥上的老物件',
    doingEn: 'Looking at the old things on the cupboard',
    objectId: 'charcoal-iron',
    lines: [
      sourced('這種炭火熨斗，是把燒紅的炭夾進圓筒裡，靠金屬的熱和重量把衣服燙平。', 'With a charcoal iron like this you tong red-hot coals into the drum, and the heat and weight of the metal press the clothes flat.', ['digitalarchives-charcoal-iron']),
      fiction('放在這裡是擺設啦，不知道是不是洗衣店本來的。', 'It’s here for display—who knows if it came from the laundry.'),
    ],
    followUps: [
      {
        id: 'back',
        question: '後面那個木桶呢？',
        questionEn: 'And the wooden tub at the back?',
        lines: [
          sourced('洗衣機普及以前，衣服泡在木桶的肥皂水裡，在洗衣板上用竹刷搓。', 'Before washing machines, clothes soaked in soapy water in a tub and were scrubbed on a washboard with a bamboo brush.', ['mymkc-laundry-history']),
          fiction('二樓聽說還有榻榻米，不過今天不開放。', 'They say there’s tatami upstairs, but it’s closed today.'),
        ],
      },
    ],
  },
]
