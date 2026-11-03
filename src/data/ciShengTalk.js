/**
 * 慈聖宮殿內的人物對話（第 11 階段；格式見 game/talk.js；文字見 docs/research/interior-ci-sheng-gong.md 第 4 節）。
 * 人物都不具名；每個年代一位。有出處的句子附出處，通說與閒聊標「虛構對白」。
 */
const sourced = (text, textEn, sourceIds) => ({ text, textEn, label: 'sourced', sourceIds })
const fiction = (text, textEn) => ({ text, textEn, label: 'fiction' })

export const CS_TALK = [
  {
    eraId: 'banquet',
    npcId: 'cs-banquet-caretaker',
    role: '廟方的人',
    roleEn: 'A temple caretaker',
    doing: '站在中庭的石柱旁',
    doingEn: 'Standing by the stone pillars in the court',
    objectId: 'tongzhi-stone-pillars',
    lines: [
      sourced('舊廟在中街、南街那邊，明治四十二年（1909）市區改正拆了，大正三年（1914）在這裡蓋好。', 'The old temple stood near Zhongjie and Nanjie; it was pulled down for urban improvement in 1909, and the new one was finished here in 1914.', ['sinica-gis-2025-cisheng']),
      sourced('大木是陳應彬師傅做的。', 'The timber work was done by Master Chen Yingbin.', ['nchdb-cisheng-monument']),
      sourced('這兩根柱子是同治六年端午刻的。', 'These two pillars were cut on the Duanwu day of 1867.', ['commons-cisheng-pillars']),
      sourced('說是舊廟搬來的——大家都這麼說，報紙也這麼寫。', 'They say they came over from the old temple—everyone says so, and so did a newspaper.', ['wiki-ci-sheng-gong']),
      fiction('新廟的木頭還香。', 'The wood of the new temple still smells fresh.'),
    ],
    followUps: [
      {
        id: 'before-1914',
        question: '一九一四年以前這裡有廟嗎？',
        questionEn: 'Was there a temple here before 1914?',
        lines: [
          sourced('沒有，那時廟在舊址；街上這座是情境示意。', 'No—back then the temple was at its old site; the one on the street here is an illustration.', ['sinica-gis-2025-cisheng']),
        ],
      },
    ],
  },
  {
    eraId: 'modern',
    npcId: 'cs-modern-worshipper',
    role: '街坊',
    roleEn: 'A neighbour',
    doing: '在正殿的蒲團旁',
    doingEn: 'Beside the kneeling cushions in the main hall',
    objectId: 'mazu-shrine',
    lines: [
      sourced('正殿三通五瓜，神龕精美——這是文資的話，我只知道媽祖在裡面。', 'The main hall is “three-through five-melon” and the shrine exquisite—that is the heritage people’s wording; all I know is that Mazu is inside.', ['nchdb-cisheng-monument']),
      sourced('三月二十三媽祖生，廟裡最熱鬧。', 'On the twenty-third of the third month, Mazu’s birthday, the temple is at its liveliest.', ['commons-cisheng-yange-board']),
      fiction('煙燻得柱子都黑了。', 'The smoke has blackened the pillars.'),
    ],
  },
  {
    eraId: 'postwar',
    npcId: 'cs-postwar-grandma',
    role: '來拜的阿婆',
    roleEn: 'An old woman come to pray',
    doing: '在正殿的蒲團旁',
    doingEn: 'Beside the kneeling cushions in the main hall',
    objectId: 'mazu-shrine',
    lines: [
      sourced('民國五十年前後，廟口攤仔一攤一攤來，拜完就在外面吃——這只有一個來源，待核。', 'Around 1961 the stalls came to the temple front one by one, and after praying people ate outside—this rests on a single source, to be verified.', ['sinica-gis-2025-cisheng']),
      fiction('光明燈點一盞，一年平安。', 'Light one lamp, and the year is peaceful.'),
      fiction('排骨湯那攤，拜完去吃。', 'The pork-rib soup stall—go and eat after praying.'),
    ],
  },
  {
    eraId: 'revival',
    npcId: 'cs-revival-visitor',
    role: '參觀者',
    roleEn: 'A visitor',
    doing: '站在三川殿的門內',
    doingEn: 'Standing just inside the entrance hall',
    objectId: 'huize-tanfu-plaque',
    lines: [
      sourced('2020 年底指定為直轄市定古蹟。', 'It was designated a municipal historic monument at the end of 2020.', ['nchdb-cisheng-monument']),
      sourced('同治、大正年間的石柱與木雕都還在。', 'Stone pillars and carvings of the Tongzhi and Taishō years are still here.', ['nchdb-cisheng-monument']),
      sourced('遊記說水車堵和屋頂的剪黏也是重點——這句還沒核對。', 'A travel post says the water-wheel panels and the cut-and-paste work on the roof are highlights too—not yet checked.', ['ptt-datong-2020-cisheng']),
      sourced('匾是大正九年（1920）平樂社獻的——就是巷子裡那個北管的社。', 'The plaque was presented in 1920 by the Pingle Society—the beiguan troupe down the lane.', ['commons-cisheng-plaque', 'commons-cisheng-pingleshe']),
    ],
  },
]
