/**
 * 李亭香（老屋新生）店內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-li-ting-xiang.md 第 4 節）。
 * 李亭香仍在營業：人物不具名，不把虛構對白安在李家人身上；「店家說」的事都附報導出處。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const LTX_TALK = [
  {
    eraId: 'revival',
    npcId: 'ltx-staff',
    role: '門市店員',
    roleEn: 'A shop assistant',
    doing: '在櫃台後面包餅',
    doingEn: 'Boxing pastries behind the counter',
    objectId: 'pingxi-cake',
    lines: [
      sourced('店家說是 1895 年開的；平西餅從第一代就在賣。', 'The shop says it opened in 1895; the Pingxi cake has been sold since the first generation.', ['businesstoday-2020-litingxiang']),
      sourced('店名的由來，店家說是因為騎樓常飄出餅香——亭仔腳的香。', 'As for the name, the shop says it is because the smell of baking drifted out from the arcade—the scent of the “pavilion foot”.', ['businesstoday-2020-litingxiang', 'sidoli-litingxiang']),
      fiction('裡面有座位，台式下午茶，配一壺茶。', 'There are seats inside—Taiwanese afternoon tea, with a pot of tea.'),
    ],
    followUps: [
      {
        id: 'turtle',
        question: '平安龜是什麼？',
        questionEn: 'What is the peace turtle?',
        lines: [sourced('借乞龜的習俗做的小餅，包金紙；金龜，也是金歸。', 'A small pastry made after the custom of begging a turtle, wrapped in gold paper; gold turtle—gold returns.', ['mirror-2023-litingxiang'])],
      },
    ],
  },
  {
    eraId: 'revival',
    npcId: 'ltx-customer',
    role: '內用的客人',
    roleEn: 'A customer at a table',
    doing: '坐在內用座位喝茶',
    doingEn: 'Having tea at one of the tables',
    objectId: 'longevity-cake-mould',
    lines: [
      fiction('平西餅一剝就掉屑，要接著。', 'The Pingxi cake sheds crumbs the moment you break it—hold a hand under it.'),
      sourced('華山那邊有他們的糕餅文化館，餅模可以拓印。', 'Over at Huashan they have a pastry culture hall, where you can take rubbings from the cake moulds.', ['ettoday-2019-litingxiang']),
    ],
    followUps: [],
  },
]
