/**
 * 港口商街（1853–1895）的路人對話（第 10 階段「一箱茶的旅程」）
 *
 * 每位路人是不具名的情境人物（npcId 對應街景的人物，見 qingWharfLayout.js 的 PORTERS）。
 * 每句話的標示（label）依 CLAUDE.md 的內容原則：
 *   sourced   有出處（附 sourceIds，對應 sources.js）
 *   folklore  坊間傳說（民間故事、年代不確定的唸謠）
 *   fiction   虛構對白（情境裡的閒聊，不對應任何真實人物）
 * 查證紀錄見 docs/research/tea-journey-qing-port.md 與 qing-wharf.md。
 * 注意：Davidson（1903）的數字與流程是日治初期的記載，用在這個年代為「推定相近」
 * （sources.js 的條目有註明）；1861–1885 的茶業史回顧段則是清末史實。
 */

export const QING_PORT_TALK = [
  {
    id: 'qing-porter-pole',
    npcId: 'qing-wharf-pole-pier',
    role: '挑夫',
    roleEn: 'Tea porter',
    doing: '挑著兩箱茶走向棧橋',
    doingEn: 'Carrying two tea chests to the pier',
    lines: [
      {
        text: '借過、借過——這擔茶趕著上船哪。',
        textEn: 'Make way, make way—this load of tea has a boat to catch.',
        label: 'fiction',
      },
      {
        text: '從茶行挑到河邊，一天來回不知道幾趟，肩頭都磨出繭了。',
        textEn: 'Back and forth between the tea firms and the river all day—my shoulders have grown calluses.',
        label: 'fiction',
      },
    ],
    followUps: [
      {
        id: 'chest',
        question: '箱子裡裝的是什麼？',
        questionEn: 'What is inside the chests?',
        lines: [
          {
            text: '烏龍茶哪。箱子是松木的，裡頭襯著焊好的薄鉛，防潮；外頭裱上花花綠綠的紙，洋人看了歡喜。',
            textEn: 'Oolong tea. The chests are pine, lined with soldered sheet lead against the damp, and pasted over with bright papers that please the foreign buyers.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
          {
            text: '一箱約莫四十磅，兩箱一擔，挑起來正好。',
            textEn: 'Each holds about forty pounds; two chests make one carrying load—just right for the pole.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
        ],
      },
      {
        id: 'where',
        question: '這些茶要運去哪裡？',
        questionEn: 'Where is the tea bound?',
        lines: [
          {
            text: '先用小船接到河道中的大船——大船吃水深，靠不了岸哪。',
            textEn: 'First by sampan out to the big ships anchored midstream—they draw too much water to come alongside.',
            label: 'sourced',
            sourceIds: ['tcmb-dadaocheng-wharf'],
          },
          {
            text: '聽帳房說，同治八年兩艘帆船載了兩千一百三十一擔烏龍直透紐約，叫什麼「福爾摩沙烏龍」，洋人搶著買。',
            textEn: 'The bookkeeper says that in 1869 two clippers carried 2,131 piculs of oolong straight to New York—“Formosa Oolong,” they call it, and the foreigners snap it up.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903', 'taipei-gov-tea-tasting-2017', 'culture-taipei-walk-dadaocheng-2018'],
          },
        ],
      },
      {
        id: 'blockade',
        question: '前幾年法蘭西封港，日子怎麼過？',
        questionEn: 'How did you get by when the French blockaded the port?',
        lines: [
          {
            text: '唉，光緒十年法蘭西人封了港，茶一箱也運不出去，大稻埕堆了兩萬五千箱。',
            textEn: 'Ah, when the French sealed the port in 1884, not a chest could move—twenty-five thousand half-chests piled up in Twatutia.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903', 'dodd-blockade-1888'],
          },
          {
            text: '解圍之後反倒缺鉛襯箱——鉛價一擔從六圓跳到二十圓，收鉛的連燭臺、神桌的鉛飾都收，漁家連網墜仔都賣了。',
            textEn: 'When it lifted, there was no lead for the linings—the price jumped from six to twenty dollars a picul, and the buyers took candlesticks, altar fittings, even the fishermen’s net sinkers.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903'],
          },
        ],
      },
    ],
  },
  {
    id: 'qing-porter-rest',
    npcId: 'qing-wharf-rest-north',
    role: '歇腳的挑夫',
    roleEn: 'Resting porter',
    doing: '放下擔子，在茶箱堆旁歇口氣',
    doingEn: 'Load set down, catching his breath by the tea chests',
    lines: [
      {
        text: '歇口氣、喝口水。你瞧這碼頭，一天到晚都是茶箱跟人。',
        textEn: 'Just catching my breath. Look at this wharf—tea chests and people from dawn to dusk.',
        label: 'fiction',
      },
      {
        text: '我阿爸那輩還說艋舺才是大港，如今大船都往咱大稻埕這邊來囉。',
        textEn: 'My father’s generation still swore by Bangka as the great port—now the ships all come our way.',
        label: 'fiction',
      },
    ],
    followUps: [
      {
        id: 'news',
        question: '最近街上有什麼消息？',
        questionEn: 'Any news on the street?',
        lines: [
          {
            text: '老人家常講，咸豐三年艋舺械鬥，同安人抬著城隍爺一路退到大稻埕，才有了這條街、這座廟。',
            textEn: 'The elders tell how, after the feuds of 1853 in Bangka, the Tong-an people carried their City God here—and that was the beginning of this street and its temple.',
            label: 'sourced',
            sourceIds: ['ith-lin-fu-zhen', 'moi-xiahai-temple'],
          },
          {
            text: '俗話說「一府二鹿三艋舺」——再過些年，怕要把大稻埕也添上去囉。',
            textEn: 'They say “first Tainan, second Lukang, third Bangka”—give it a few more years and they may have to add Twatutia.',
            label: 'folklore',
          },
          {
            text: '這馬設省了，撫臺大人還修鐵路哩——光緒十七年起，火車食煙吐霧，對大稻埕行到基隆。',
            textEn: 'We are a province now, and the governor has built his railway—since 1891 the train puffs its way from Twatutia clear to Keelung.',
            label: 'sourced',
            sourceIds: ['ctee-taipei-station-2021'],
          },
        ],
      },
      {
        id: 'story',
        question: '聽過什麼有趣的故事嗎？',
        questionEn: 'Heard any good stories?',
        lines: [
          {
            text: '茶館裡愛講「周成過臺灣」——說一個安溪人渡海來大稻埕做茶生意，發了財卻負了心，後頭的事，嘖嘖，不好收場。',
            textEn: 'In the teahouses they love the tale of Zhou Cheng of Anxi, who crossed the strait to trade tea in Twatutia, struck it rich, and betrayed his wife—no good came of it, I tell you.',
            label: 'folklore',
            sourceIds: ['cna-goodbook-yaoguai-2019'],
          },
          {
            text: '是真是假沒人說得準——人名、茶行攏查無影跡，你就當個故事聽吧。',
            textEn: 'True or not, nobody can say—no name or tea firm was ever traced. Take it as a story and no more.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
  {
    id: 'qing-porter-stack',
    npcId: 'qing-wharf-stack-south',
    role: '點貨的挑夫',
    roleEn: 'Porter tallying cargo',
    doing: '看著剛卸下的茶箱，等下一趟',
    doingEn: 'Minding the fresh-landed chests, waiting for the next run',
    lines: [
      {
        text: '這幾箱剛從小船卸下來，等行裡的人來點數。',
        textEn: 'These chests just came off the sampan; waiting for the firm’s man to tally them.',
        label: 'fiction',
      },
      {
        text: '箱子可不能碰水——淋了雨，整箱茶就毀啦。',
        textEn: 'Mind the water—one soaking and a whole chest of tea is ruined.',
        label: 'fiction',
      },
    ],
    followUps: [
      {
        id: 'women',
        question: '茶行裡都是誰在做事？',
        questionEn: 'Who does the work in the tea firms?',
        lines: [
          {
            text: '揀茶的多半是婦人家——大稻埕大小茶棧上百五十家，茶季一天僱上萬人，騎樓下坐得滿滿的，鬢邊插著玉蘭花。',
            textEn: 'The tea-picking is mostly women’s work—some hundred and fifty tea hongs here hire over ten thousand hands a day in season, the arcades full of girls with magnolia in their hair.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903', 'panorama-dadaocheng-1981'],
          },
          {
            text: '手腳快的姑娘，一天天光做到日落，也能掙一角半；有人說，女子會揀茶，就能自己掙一口飯吃，不急著嫁人哩。',
            textEn: 'A quick girl, dawn to dusk, can earn fifteen cents—some say a woman who can sort tea earns her own keep, and is in no hurry to marry.',
            label: 'sourced',
            sourceIds: ['davidson-formosa-1903', 'wolf-women-tea-2003'],
          },
        ],
      },
      {
        id: 'taste',
        question: '大稻埕的茶，好喝嗎？',
        questionEn: 'Is the tea here any good?',
        lines: [
          {
            text: '《淡水廳志》的老先生寫過「茶味薄不如武彝」——嘿，唐山客嘴硬！可洋人就愛咱這一味。',
            textEn: 'The old gazetteer sniffed that our tea is “thinner than Wuyi”—hah, mainland snobbery! The foreigners love it all the same.',
            label: 'sourced',
            sourceIds: ['danshui-ting-zhi-1871'],
          },
          {
            text: '書上也寫「估客輳集，以淡為台郡第一」——做生意的都往淡水河口來，咱這碼頭你也看見了。',
            textEn: 'The same book says the merchants gather here like nowhere else in Taiwan—you can see it for yourself on this wharf.',
            label: 'sourced',
            sourceIds: ['danshui-ting-zhi-1871'],
          },
        ],
      },
      {
        id: 'work',
        question: '挑一天能賺多少？',
        questionEn: 'What does a day of carrying pay?',
        lines: [
          {
            text: '看趟數算錢，茶季忙起來，天沒亮就上工。數目嘛……夠一家吃飯，發不了財。',
            textEn: 'We are paid by the trip. In the busy season we start before dawn. Enough to feed a family—never enough to get rich.',
            label: 'fiction',
          },
        ],
      },
    ],
  },
]

/** 這個年代有對話的路人（npcId → 對話） */
export function qingPortTalkOf(npcId) {
  return QING_PORT_TALK.find((talk) => talk.npcId === npcId) ?? null
}
