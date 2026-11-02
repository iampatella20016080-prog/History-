/**
 * 清末搭船（港口商街）的三位情境人物：棧橋頭的駁船船夫、帆船上的舵工與水手（都不具名）。
 * 標示依 CLAUDE.md：sourced 有出處（附 sourceIds）、folklore 坊間傳說、fiction 虛構對白。
 * 查證紀錄見 docs/research/qing-boarding.md。不寫口音、族群、工錢、船主姓名與任何真實商號的貨主；
 * 船夫的穿著與船上的作息都是歷史情境重建。Davidson（1903）是日治初期的記載，用在清末為「推定相近」。
 */
export const QING_BOARDING_TALK = [
  {
    id: 'qing-boatman',
    eraId: 'qing-port',
    npcId: 'qing-boatman',
    role: '駁船船夫',
    roleEn: 'Cargo-boat boatman',
    doing: '守著棧橋邊的駁船，等人等貨',
    doingEn: 'Minding the cargo boat at the pier, waiting for passengers and freight',
    lines: [
      {
        text: '要上大船？坐我這艘駁船去，河心那艘吃水深，靠不了岸。',
        textEn: 'Going out to the big boat? Take my cargo boat—she draws too much to come in to the bank.',
        label: 'sourced',
        sourceIds: ['tcmb-dadaocheng-wharf', 'tamsui-trade-report-1879'],
      },
      {
        text: '坐穩哪，別站在船邊——這條河看著平，船一晃人就下去了。',
        textEn: 'Sit tight and keep off the gunwale—the river looks calm, but one lurch and you are in it.',
        label: 'fiction',
      },
    ],
    followUps: [
      {
        id: 'fare',
        question: '搭一趟要多少錢？',
        questionEn: 'What does a crossing cost?',
        lines: [
          {
            text: '滬尾那邊的渡口，載人載貨都有公定的價錢，衙門定的；咱這裡載人上船，就看貨主怎麼算。',
            textEn: 'At the Hobe crossing there is a fixed fare for people and goods, set by the yamen; here, taking a man out to the ship, it depends on how the shipper reckons it.',
            label: 'sourced',
            sourceIds: ['danshui-ting-zhi-1871'],
          },
          {
            text: '駁船的工錢多少、怎麼算，書上沒寫——這一句是我編的。',
            textEn: 'What a cargo-boat man earned, and how it was reckoned, the books do not say—that part I made up.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'draft',
        question: '大船為什麼進不來？',
        questionEn: 'Why can the big boats not come in?',
        lines: [
          {
            text: '光緒五年海關的港務長說過：從大稻埕到港口，趕時候的話，吃水三尺以上的船一概走不得。',
            textEn: 'In 1879 the customs harbour master said that between Twatutia and the port, when speed matters, no boat drawing more than three feet can be used.',
            label: 'sourced',
            sourceIds: ['tamsui-trade-report-1879'],
          },
          {
            text: '出海的大戎克船都停在滬尾或沙洲外頭；茶裝了箱，用貨船順河送下去報關，再轉火輪船去廈門。',
            textEn: 'The seagoing junks lie at Hobe or outside the bar; the tea, once chested, goes down in cargo boats to clear customs, then onto the steamer for Amoy.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
        ],
      },
      {
        id: 'blockade',
        question: '法蘭西封港那時候呢？',
        questionEn: 'And during the French blockade?',
        lines: [
          {
            text: '光緒十一年四月，茶照樣從沙洲外頭裝船；五月風一起，駁船就過不了沙洲，有人連大船邊都不敢靠。',
            textEn: 'In April 1885 tea was still being shipped over the bar; by May, once the wind got up, the cargo boats could not cross it, and some would not go alongside the big ships at all.',
            label: 'sourced',
            sourceIds: ['dodd-blockade-1888'],
          },
        ],
      },
    ],
  },
  {
    id: 'qing-helmsman',
    eraId: 'qing-port',
    npcId: 'qing-junk-helmsman',
    role: '舵工',
    roleEn: 'Helmsman',
    doing: '站在艄棚邊看天色、等潮水',
    doingEn: 'Standing by the stern shelter, watching the sky and waiting for the tide',
    lines: [
      {
        text: '上來啦？小心腳下，甲板濕。這船是平底的，走河用的，出不了海。',
        textEn: 'Up you come. Mind your feet, the deck is wet. She is flat-bottomed, a river boat—no good at sea.',
        label: 'fiction',
      },
      {
        text: '要等潮水漲了才走得動。這河一年比一年淺，出海的大船倒壓艙石，把河都倒淺了。',
        textEn: 'We wait for the tide. This river gets shallower every year—the seagoing junks dump their ballast stones and fill it up.',
        label: 'sourced',
        sourceIds: ['tamsui-trade-report-1867', 'tamsui-trade-report-1879'],
      },
    ],
    followUps: [
      {
        id: 'routes',
        question: '船都跑哪些航線？',
        questionEn: 'Which routes do the junks run?',
        lines: [
          {
            text: '跑廈門、跑上海寧波、跑天津山東的，各有一路。每一路的船主每年推一個人出來當代理，拿一只香爐做憑據。',
            textEn: 'There is a line to Amoy, one to Shanghai and Ningpo, one to Shantung and Tientsin. Each year the shipowners on a line pick one man as their agent, with an incense urn as his token.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
          {
            text: '那個名目書上怎麼拼的，我沒看清楚——說是「爐主」，待核。',
            textEn: 'How the book spells that title I could not make out—said to be “lu-chu”, the keeper of the urn; to be verified.',
            label: 'fiction',
          },
        ],
      },
      {
        id: 'bridge',
        question: '橋會擋到船嗎？',
        questionEn: 'Does the bridge get in the way?',
        lines: [
          {
            text: '光緒十五年起大稻埕有一座鐵路木橋，中間一段每天都會打開幾次，讓咱這種船跟大河船過去。',
            textEn: 'Since 1889 there is a wooden railway bridge at Twatutia; a span in the middle opens several times a day to let junks like ours and the big river boats through.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
        ],
      },
      {
        id: 'eye',
        question: '船頭的眼睛是做什麼的？',
        questionEn: 'What are the eyes on the bow for?',
        lines: [
          {
            text: '河船船頭兩隻凸眼、眼周塗紅，大家叫「紅頭仔」。眼睛做什麼用，各人有各人的講法。',
            textEn: 'River boats have two bulging eyes on the bow, ringed in red—folk call them “red-heads”. What the eyes are for, everyone has their own story.',
            label: 'sourced',
            sourceIds: ['tcmb-junk-keelung'],
          },
          {
            text: '出海的大船船頭漆什麼色，朝廷有規矩：福建綠、廣東紅、江南青。咱河船沒人管。',
            textEn: 'For seagoing junks the court lays down the bow colour—green for Fukien, red for Kwangtung, blue for Kiangnan. Nobody bothers about river boats.',
            label: 'sourced',
            sourceIds: ['zhu-qinbin-ship-paint-2018'],
          },
        ],
      },
    ],
  },
  {
    id: 'qing-deckhand',
    eraId: 'qing-port',
    npcId: 'qing-junk-deckhand',
    role: '水手',
    roleEn: 'Deckhand',
    doing: '在貨艙口疊茶箱',
    doingEn: 'Stacking tea chests at the hatch',
    objectId: 'camphor-box',
    lines: [
      {
        text: '哎喲重——這些箱子一箱四十磅，疊到第三層手就抖。',
        textEn: 'Heavy, these—forty pounds a chest, and by the third layer my arms are shaking.',
        label: 'sourced',
        sourceIds: ['davidson-formosa-1903'],
      },
      {
        text: '茶箱從駁船怎麼搬上來的？抬的、吊的都有人說，書上沒寫——就當是抬上來的。',
        textEn: 'How the chests come up from the cargo boat? Some say carried, some say hoisted; the books do not say—let us call it carried.',
        label: 'fiction',
      },
    ],
    followUps: [
      {
        id: 'lead',
        question: '箱子裡怎麼都襯鉛？',
        questionEn: 'Why are the boxes all lined with lead?',
        lines: [
          {
            text: '茶箱襯鉛防潮；樟腦也一樣——以前經香港出口的樟腦，就裝在襯鉛的木箱裡，不然會跑掉。',
            textEn: 'Tea chests are lead-lined against damp; camphor too—camphor shipped out through Hongkong used to go in lead-lined wooden boxes, or it would evaporate away.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
          {
            text: '茶箱的木板從廈門運來，在大稻埕釘箱、襯鉛片——美國領事都寫進報告了。',
            textEn: 'The chest boards come from Amoy and are nailed up and lead-lined here in Twatutia—even the American minister put that in his report.',
            label: 'sourced',
            sourceIds: ['denby-frus-1888'],
          },
        ],
      },
      {
        id: 'coolies',
        question: '挑夫跟你們是一夥的嗎？',
        questionEn: 'Are the porters your crew?',
        lines: [
          {
            text: '不是。挑夫歸挑夫、船歸船——陶德那個洋人寫封鎖的日記，也是「苦力跟船」分開算。',
            textEn: 'No. Porters are porters and boats are boats—even Dodd, the foreigner who kept the blockade journal, counted “coolies and boats” separately.',
            label: 'sourced',
            sourceIds: ['dodd-blockade-1888'],
          },
          {
            text: '下大雨的時候，種田的跟我們撐船的都披棕蓑衣——馬偕牧師看過，寫在書裡。',
            textEn: 'When the heavy rains come, the farmers and we boatmen all wear palm-fibre rain capes—the missionary Mackay saw it and wrote it down.',
            label: 'sourced',
            sourceIds: ['mackay-from-far-formosa-1896'],
          },
        ],
      },
    ],
  },
]
