/**
 * 新芳春茶行各年代室內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-xin-fang-chun.md 第 4 節）。
 * 人物都不具名（導覽員不用館長姓名）；有出處的句子附出處，情境閒聊標「虛構對白」。說完可以近看一件器物（objectId）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const XFC_TALK = [
  {
    eraId: 'modern',
    npcId: 'xfc-modern-bookkeeper',
    role: '帳房夥計',
    roleEn: 'A bookkeeper',
    doing: '在帳房櫃台撥算盤',
    doingEn: 'Working the abacus at the counting-room counter',
    objectId: 'abacus',
    lines: [
      sourced('這棟是今年才落成的，三間併成一間，樓高三層、深三進，台北最大的茶工廠。', 'This building was finished only this year—three bays made one, three storeys high and three deep, the biggest tea factory in Taipei.', ['ntcri-77-xinfangchun', 'nchdb-xinfangchun']),
      sourced('前面是茶行跟帳房，後面是倉庫和加工廠；樓上揀茶，三樓是頭家一家人住。', 'The shop and the counting room are in front, the warehouse and factory behind; upstairs they sort tea, and the boss’s family lives on the third floor.', ['ntcri-77-xinfangchun']),
      fiction('暹羅那批的帳我還沒結完，先別吵我。', 'I haven’t finished the accounts for the Siam shipment—don’t distract me.'),
    ],
    followUps: [
      {
        id: 'couplet',
        question: '門上那副對聯寫什麼？',
        questionEn: 'What does the couplet on the door say?',
        lines: [sourced('芳尋顧渚、春採蒙山——顧渚、蒙山都是出名的產茶地方。', '“Seek fragrance at Guzhu, pick spring at Mengshan”—Guzhu and Mengshan are both famous tea places.', ['commons-xfc-hall'])],
      },
    ],
  },
  {
    eraId: 'modern',
    npcId: 'xfc-modern-sorter-a',
    role: '揀茶女工',
    roleEn: 'A tea sorter',
    doing: '在二樓揀茶間挑茶枝',
    doingEn: 'Picking out stalks in the upstairs sorting room',
    objectId: 'tea-sorting-tray',
    lines: [
      sourced('二樓前面這塊石磚地就是挑茶的地方，一整天坐在這裡。', 'This stone-floored front part of the upper floor is where we pick tea—we sit here all day.', ['ntcri-77-xinfangchun']),
      fiction('天井的風從下面吹上來，比樓下涼。', 'The breeze comes up through the light well—cooler than downstairs.'),
      fiction('挑乾淨了才送下去焙。', 'Only clean tea goes down to be fired.'),
    ],
    followUps: [],
  },
  {
    eraId: 'postwar',
    npcId: 'xfc-postwar-clerk',
    role: '茶行夥計',
    roleEn: 'A tea-hong clerk',
    doing: '在櫃台後面整理茶樣',
    doingEn: 'Sorting tea samples behind the counter',
    objectId: 'tea-award-certificate',
    lines: [
      sourced('民國三十九年改組成兩合公司；這幾年茶賣得不如從前，有幾間房租出去了。', 'In 1950 it was reorganised as a partnership; tea hasn’t sold as it used to these last years, and some rooms have been let.', ['tcmb-xinfangchun', 'epochtimes-xinfangchun-2022']),
      sourced('牆上那張是頭家參加全省優良茶比賽得的獎狀。', 'That on the wall is the certificate the boss won at the province-wide fine tea competition.', ['ntcri-77-xinfangchun']),
      fiction('後面的機器還是每天開。', 'The machines out back still run every day.'),
    ],
    followUps: [
      {
        id: 'upstairs',
        question: '樓上現在做什麼？',
        questionEn: 'What’s upstairs these days?',
        lines: [sourced('民國四十年以後是王氏宗親會的籌備處。', 'Since 1951 it’s been the preparatory office of the Wang clan association.', ['nchdb-xinfangchun'])],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'xfc-revival-guide',
    role: '導覽員',
    roleEn: 'A guide',
    doing: '在正廳的說明板旁導覽',
    doingEn: 'Guiding visitors beside a panel in the hall',
    objectId: 'tea-cutter',
    lines: [
      sourced('2011 到 2015 年修復，恢復了九成原貌；屋主把房子捐給市政府，2016 年 9 月開放。', 'It was restored from 2011 to 2015 to about nine-tenths of its original state; the owner gave it to the city and it opened in September 2016.', ['ntcri-77-xinfangchun-restoration', 'zsdo-xinfangchun-2020']),
      sourced('後面的焙籠間、風選機、切茶機都是原來的，牆上的木烙畫畫的是焙茶的步驟。', 'The roasting room, the winnower and the tea cutter out back are all original; the pokerwork pictures on the wall show the roasting steps.', ['ntcri-77-xinfangchun']),
      fiction('樓梯牆上的六角磚是一塊塊拆下編號再貼回去的。', 'The hexagonal tiles on the stair wall were taken down, numbered and put back one by one.'),
    ],
    followUps: [
      {
        id: 'third-floor',
        question: '三樓可以上去嗎？',
        questionEn: 'Can I go up to the third floor?',
        lines: [sourced('三樓是王家的住家和公媽廳，不開放。', 'The third floor is the Wang family’s home and ancestral hall—it isn’t open.', ['ntcri-77-xinfangchun'])],
      },
    ],
  },
]
