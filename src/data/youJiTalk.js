/**
 * 有記名茶各年代室內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-you-ji.md 第 4 節）。
 * 人物都不具名；仍在營業的店家只用官網與公開報導寫得出來的事，虛構的閒聊標「虛構對白」，不安在王家人身上。
 * 說完可以近看一件器物（objectId）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const YJ_TALK = [
  {
    eraId: 'banquet',
    npcId: 'yj-banquet-marker',
    role: '刷嘜頭的夥計',
    roleEn: 'A chest marker',
    doing: '在工作桌上給茶箱刷嘜頭',
    doingEn: 'Brushing shipping marks on a chest at the work table',
    objectId: 'mark-stencil',
    lines: [
      sourced('竹篾箱印不上字，就拿這塊板蘸漆刷：有記、收貨的店、茶名、斤兩，一箱一箱來。', 'You can’t print on a bamboo chest, so you dip this board in paint and brush: Youji, the consignee, the tea, the weight—one chest at a time.', ['wangtea-ewkee-blog']),
      sourced('箱子裡面是木板釘的，外面罩竹篾，怕潮。', 'Inside it’s nailed boards, outside a bamboo jacket—damp is the enemy.', ['wangtea-ewkee-blog']),
      fiction('刷歪了可不行，到曼谷人家認不出是誰的。', 'Brush it crooked and in Bangkok nobody will know whose it is.'),
    ],
    followUps: [
      {
        id: 'bangkok',
        question: '這些箱子去哪裡？',
        questionEn: 'Where are these chests going?',
        lines: [sourced('曼谷。那邊的茶，一半以上是我們的。', 'Bangkok. Over half the tea there is ours.', ['wangtea-ewkee-blog'])],
      },
    ],
  },
  {
    eraId: 'modern',
    npcId: 'yj-modern-roaster',
    role: '焙茶師傅',
    roleEn: 'A tea roaster',
    doing: '在焙窟之間照看焙籠',
    doingEn: 'Tending the baskets between the pits',
    objectId: 'husk-ash-pit',
    lines: [
      sourced('坑深五十八公分，稻殼燒成白灰當火，上面架焙籠，日夜不停二十天。', 'The pits are fifty-eight centimetres deep; husk burnt to white ash is the fire, the basket sits on top, day and night for twenty days.', ['ntcri-80-wangtea-lab']),
      sourced('稻殼隔熱也擋煙，茶只吃熱氣，不帶火氣。', 'The husk keeps the heat in and the smoke down—the tea takes the warmth, not the fire.', ['yam-2025-wangtea']),
      fiction('灰還不夠白，再等等。', 'The ash isn’t white enough yet—give it a while.'),
    ],
    followUps: [
      {
        id: 'laundry',
        question: '對街的人在這裡做什麼？',
        questionEn: 'What are the people from across the street doing here?',
        lines: [sourced('洗衣店送衣服來烘，烘完一身茶香。', 'The laundry sends clothes over to dry—they go back smelling of tea.', ['ntcri-80-wangtea-lab'])],
      },
    ],
  },
  {
    eraId: 'postwar',
    npcId: 'yj-postwar-sorter',
    role: '揀茶女',
    roleEn: 'A tea sorter',
    doing: '在二樓揀茶樓挑茶枝',
    doingEn: 'Picking out stalks in the upstairs loft',
    objectId: 'tea-sorting-tray',
    lines: [
      sourced('這樓上是揀茶樓，一天四十幾個人坐在這裡挑茶枝。', 'Up here is the sorting loft—forty-odd of us a day, sitting here picking out stalks.', ['wangtea-store', 'wangtea-story']),
      sourced('民國三十八年搬來這裡，那時是台北市登記的第五家工廠。', 'We moved here in 1949—it was the fifth factory on the Taipei register.', ['wangtea-transformation']),
      fiction('樓下熱，樓上風比較涼，就是腰痠。', 'It’s hot downstairs; the breeze is cooler up here—it’s just hard on the back.'),
    ],
    followUps: [],
  },
  {
    eraId: 'revival',
    npcId: 'yj-revival-staff',
    role: '茶行店員',
    roleEn: 'A shop assistant',
    doing: '在弧形櫃台招呼客人',
    doingEn: 'Serving customers at the curved counter',
    objectId: 'winnowing-machine',
    lines: [
      sourced('前面 2004 年改成門市，後面還是茶廠；焙籠間還在用炭焙。', 'The front became a shop in 2004; the back is still the factory, and the roasting room still fires over charcoal.', ['wangtea-store']),
      sourced('那台木頭的風選機是老的，現在還在用。', 'That wooden winnower is an old one, and it’s still in use.', ['wangtea-story']),
      fiction('想看後面的話，導覽二、三十分鐘就夠。', 'If you want to see the back, a twenty- or thirty-minute tour will do it.'),
    ],
    followUps: [
      {
        id: 'upstairs',
        question: '樓上是什麼？',
        questionEn: 'What’s upstairs?',
        lines: [sourced('清源堂，以前的揀茶樓。禮拜六下午有南管，先預約就能免費聽。', 'Qingyuan Hall—the old sorting loft. There’s nanguan on Saturday afternoons, free if you book ahead.', ['yam-2025-wangtea', 'wangtea-store'])],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'yj-revival-musician',
    role: '南管樂人',
    roleEn: 'A nanguan musician',
    doing: '坐在舞台上調絃',
    doingEn: 'Tuning up on the stage',
    objectId: 'nanguan-instruments',
    lines: [
      sourced('2008 年開始，每個禮拜六下午在這裡演奏。', 'Since 2008 there’s been playing here every Saturday afternoon.', ['wangtea-transformation']),
      fiction('琵琶橫抱、洞簫豎吹，南管就是慢。', 'The pipa held across, the dongxiao played upright—nanguan takes its time.'),
      fiction('坐，喝杯茶再聽。', 'Sit, have some tea, then listen.'),
    ],
    followUps: [],
  },
]
