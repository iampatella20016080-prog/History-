/**
 * 霞海城隍廟殿內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-xia-hai-cheng-huang.md 第 4 節）。
 * 人物都不具名；城隍夫人（1893 年起）的追問標年份。迎城隍的流程是光緒五年（1879）起的事。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })
const folklore = (text, textEn, sourceIds) => ({ text, textEn, label: 'folklore', sourceIds })

export const XH_TALK = [
  {
    eraId: 'qing-port',
    npcId: 'xh-keeper',
    role: '廟祝',
    roleEn: 'The temple keeper',
    doing: '在拜殿左側的櫃台後面',
    doingEn: 'Behind the counter on the left of the vestibule',
    objectId: 'qing-plaques',
    lines: [
      sourced('咸豐三年在艋舺拚輸了，廟燒了，神像是大家救出來搬到大稻埕的；咸豐六年起廟，九年蓋好。', 'We lost the fight in Bangka in 1853 and the temple burned; people saved the image and carried it to Dadaocheng. Building started in 1856 and it was done in 1859.', ['moi-xiahai-temple', 'nchdb-xiahai-monument']),
      sourced('廟不大，就正殿和拜亭。', 'It isn’t a big temple—just the main hall and the pavilion in front.', ['nchdb-xiahai-monument']),
      sourced('「天眼時開」那方匾是咸豐六年題的，廟還沒蓋好就先有匾。', 'The “Heaven’s eye opens in time” plaque was written in 1856—the plaque came before the temple was finished.', ['tpecitygod-art-06']),
      sourced('廟蓋好以後沒大修過，彩繪都剝了。', 'There’s been no big repair since it was built—the paintwork has all peeled.', ['xiahai-stele-1935']),
      fiction('香灰我早晚清一次。', 'I clear the ash morning and evening.'),
    ],
    followUps: [
      {
        id: 'procession',
        question: '五月十三是什麼？',
        questionEn: 'What happens on the thirteenth of the fifth month?',
        lines: [
          sourced('光緒五年起的迎城隍：五月初六放軍，紙糊的營厝開光以後送去五座福德祠，十一暗訪，十三遶境，十八收軍。', 'The City God procession, held since 1879: on the sixth the troops are released and paper camp-houses are consecrated and taken to five earth-god shrines; the night patrol on the eleventh, the procession on the thirteenth, and the recall on the eighteenth.', ['moi-xiahai-folklore', 'tpecitygod-ceremony-01']),
        ],
      },
      {
        id: 'names',
        question: '牌位上的名字？',
        questionEn: 'Whose names are on the tablet?',
        lines: [
          sourced('三十八位義勇公，拚的時候為了護神像死的；不雕像，立祿位。', 'The thirty-eight Righteous and Brave, who died protecting the image in the feud; no statues for them, only the tablet.', ['tpecitygod-god-04', 'nchdb-xiahai-monument']),
        ],
      },
    ],
  },
  {
    eraId: 'qing-port',
    npcId: 'xh-worshipper',
    role: '來拜的街坊婦人',
    roleEn: 'A neighbourhood woman come to pray',
    doing: '在正殿的蒲團旁',
    doingEn: 'Beside the kneeling cushions in the main hall',
    objectId: 'chenghuang-shrine',
    lines: [
      sourced('鎮殿的城隍是起廟時雕的；開基那尊嵌在牆裡，看不到。', 'The City God in the shrine was carved when the temple was built; the founding image is sealed in the wall, and nobody can see it.', ['tpecitygod-art-04']),
      folklore('謝將軍、范將軍的大神偶是靈安社同治九年塑的，比人還高。', 'The big figures of General Xie and General Fan were made by the Ling’an Society in 1870—taller than a man.', ['tpecitygod-art-04']),
      fiction('我來求的事，不能跟你說。', 'What I came to ask for, I can’t tell you.'),
    ],
    followUps: [
      {
        id: 'consort',
        question: '旁邊那間供誰？',
        questionEn: 'Who is in the room at the side?',
        lines: [
          sourced('城隍娘，光緒十九年（1893 年）九間仔街阿仙舍立的，兩邊有宮娥。', 'The City God’s consort, installed in 1893 by Ah-sian of Kau-king-a Street, with palace maids at either side.', ['tpecitygod-god-02']),
        ],
      },
    ],
  },
]
