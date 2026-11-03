/**
 * 江山樓室內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-jiang-shan-lou.md 第 4 節）。
 * 人物都不具名；吳江山是真實人物，不出現、不替他說話。藝旦不做人物，只在追問裡用一句「坊間傳說」帶過，
 * 再補一句有出處的「藝旦由藝旦間應召而來」（使用者 2026-11-02 同意）。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })
const folklore = (text, textEn, sourceIds) => ({ text, textEn, label: 'folklore', sourceIds })

export const JSL_TALK = [
  {
    eraId: 'banquet',
    npcId: 'jsl-waiter',
    role: '跑堂',
    roleEn: 'A waiter',
    doing: '在門廳招呼客人',
    doingEn: 'Greeting guests in the lobby',
    objectId: 'banquet-menu',
    lines: [
      sourced('一樓是廚房和辦公室，宴會廳在二樓、三樓，四樓是花園。', 'Down here are the kitchen and the office; the banquet rooms are on the second and third floors, and the fourth is a garden.', ['storm-2022-chen-rouchin-jiangshanlou']),
      sourced('廚房裡是福州、上海、廣東請來的師傅。', 'The cooks in the kitchen were brought in from Fuzhou, Shanghai and Canton.', ['jaung-jiang-shan-lou-2015']),
      fiction('半席六樣，一鍋湯算兩樣；要包廂的話點半席就免費。', 'A half-banquet is six dishes, the soup counts as two; order a half and the private room comes free.'),
    ],
    followUps: [
      {
        id: 'geisha',
        question: '聽說有藝旦唱曲？',
        questionEn: 'I hear there are geisha singing?',
        lines: [
          folklore('相傳「登江山樓，吃臺灣菜，聽藝旦唱曲」。', 'The saying goes: “Climb Jiangshanlou, eat Taiwanese food, hear the yidan sing.”', ['wiki-jiang-shan-lou']),
          sourced('藝旦不住樓裡，客人要，才從藝旦間請來；我們只管場地、酒和菜。', 'The yidan don’t live here—if a guest asks, they’re sent for from their houses; we only provide the room, the wine and the food.', ['setn-li-huozeng-photos']),
        ],
      },
    ],
  },
  {
    eraId: 'banquet',
    npcId: 'jsl-waiter-upstairs',
    role: '女侍',
    roleEn: 'A waitress',
    doing: '在備餐桌旁等著上菜',
    doingEn: 'Waiting by the sideboard to serve',
    objectId: 'banquet-course',
    lines: [
      sourced('這樓十四間廳，全開可以坐五百人。', 'There are fourteen rooms in the house—five hundred guests when they’re all open.', ['jaung-jiang-shan-lou-2015']),
      fiction('先上湯，再上乾菜；甜的上來就是半席到了。', 'Soup first, then the dry dishes; when the sweet comes, that’s the half-way mark.'),
      fiction('樓上還有浴室和理髮室，客人宴前先整理。', 'There’s a bathroom and a barber upstairs too—guests tidy up before the banquet.'),
    ],
    followUps: [],
  },
  {
    eraId: 'banquet',
    npcId: 'jsl-guest-a',
    role: '入座的客人',
    roleEn: 'A seated guest',
    doing: '在圓桌邊等開席',
    doingEn: 'Waiting at the round table for the banquet to begin',
    objectId: 'congratulatory-plaque',
    lines: [
      sourced('1923 年皇太子來臺，臺灣料理的午宴就是江山樓和東薈芳辦的——不過是在總督官邸。', 'When the Crown Prince came in 1923, the Taiwanese luncheon was done by Jiangshanlou and Donghuifang—though it was held at the Governor-General’s residence.', ['cna-taiwanese-cuisine-2020']),
      fiction('今天是同窗會，十年了。', 'It’s our class reunion today—ten years.'),
    ],
    followUps: [],
  },
]
