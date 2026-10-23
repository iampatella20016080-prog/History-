/**
 * 迪化街一段329號店屋（稻舍 Rice & Shine）的資料與介紹章節
 *
 * 已查證史實（附 sourceIds）、使用者照片觀察、情境設計與待核資料分開存放。
 * 1895–1980 的店內與街邊是「歷史情境示意」：依米業的一般樣貌與報導中的空間描述重建，不代表某一年的實際陳設。
 * 早期年代不使用「稻舍」的名稱與招牌。
 */

export const RICE_RECORD = {
  id: 'rice-and-shine-329',
  address: '臺北市大同區迪化街一段329號',
  heritage: { name: '迪化街一段329號店屋', category: '歷史建築', listedAt: '2020-04-28', builtYear: 1907, sourceIds: ['moc-329-shophouse'] },
  historicShop: { name: '唐益興米行', founder: '唐塗薩', foundedYear: 1916, sourceIds: ['taiwannews-2022-rice-shine'] },
  modern: { name: '稻舍 Rice & Shine', operator: '葉守倫', sourceIds: ['taiwannews-2022-rice-shine', 'traveler-2019-rice-shine'] },
  linkedTo: { address: '迪化街一段331號', note: '原與329號相通', sourceIds: ['moc-329-shophouse'] },
}

export const RICE_FACTS = [
  { id: 'heritage', text: '迪化街一段329號店屋是臺北市的歷史建築，2020年4月28日登錄，資料記載的建立年代是1907年。', sourceIds: ['moc-329-shophouse'] },
  { id: 'north-street', text: '大稻埕北段在日治時期是米產業的中心；329號與鄰房331號原本相通，當時是唐家經營的米行。', sourceIds: ['moc-329-shophouse'] },
  { id: 'mills', text: '迪化街北段是碾米行聚集的地方，全盛時期將近五十家。', sourceIds: ['traveler-2019-rice-shine'] },
  { id: 'tang', text: '稻舍的負責人介紹，這裡的前身是1916年（大正五年）唐塗薩創立的唐益興米行；唐家後代在2014年把老屋捐給臺北市政府。', sourceIds: ['taiwannews-2022-rice-shine'] },
  { id: 'layout', text: '建築是兩進、兩層樓，兩進之間有過廊相通，各有木梯；第一進的一樓過去左邊擺大型碾米機、右邊堆白米。', sourceIds: ['traveler-2019-rice-shine'] },
  { id: 'reuse', text: '營運團隊修復老屋，保留碾米廠的氛圍，屋內陳列碾米機等器物，規畫稻米文化策展與米食餐飲。', sourceIds: ['pts-2022-rice-shine', 'taiwannews-2022-rice-shine'] },
  { id: 'urs', text: '稻舍原是臺北市「都市再生前進基地」（URS）的示範基地，之後加入「老房子文化運動」，2022年6月8日剪綵。', sourceIds: ['taiwannews-2022-rice-shine'] },
  { id: 'nanjie', text: '郭雪湖1930年的《南街殷賑》描繪迪化街霞海城隍廟口的中元普渡，在當年的臺展得獎，現由臺北市立美術館典藏。', sourceIds: ['cna-2020-kuo-hsueh-hu'] },
]

export const RICE_OBSERVATIONS = [
  { id: 'facade', text: '二層紅磚店屋：一樓三個紅磚拱券（中央較寬）與四道磚柱，二樓三組木框窗（中央是格子窗），窗下三塊白色飾板，中間寫著「稻舍」，頂上是連續的磚砌女兒牆與綠色的花磚。' },
  { id: 'entrance', text: '騎樓鋪紅色地磚，中央是玻璃入口，上方有金色的「稻舍」店招；騎樓掛著黑底的「稻舍米糧行」牌子，騎樓牆上有大稻埕街景的壁畫。' },
  { id: 'dining', text: '店內是大面積裸露的紅磚牆、深色木梁與木質天花、紅陶地磚、深色木桌與藤編椅背的木椅，暖色的軌道燈。' },
  { id: 'exhibit', text: '牆邊陳列土礱、蓑衣、斗笠與竹器等米業器具，乾燥花與稻田的照片。' },
  { id: 'courtyard', text: '天井是紅磚圍牆，有植物、小樹與壁畫，燈光從上方照下來。' },
  { id: 'upstairs', text: '二樓有陡的木樓梯、紅磚牆、木框大窗、長木桌與藤編木椅，可以辦小型展覽與講座。' },
  { id: 'meals', text: '米食套餐放在木托盤上：淺綠色碗的白飯、青花碗的控肉或雞腿、小碟的青菜、豆腐與小菜、有蓋的湯盅，筷子與湯匙。' },
]

export const RICE_SCENARIO = [
  { id: 'eras', text: '1895–1980 的店內、街邊與人物是歷史情境示意。資料記載這棟紅磚店屋建於1907年；場景把完整的紅磚拱券立面放在1930–1945，1895–1930 用初期的木構街屋表現「米業開始形成」，讓同一塊地的變化更清楚。' },
  { id: 'brand', text: '「稻舍 Rice & Shine」的名稱、招牌、玻璃門、軌道燈與餐桌只出現在2000–現在。' },
  { id: 'murals', text: '騎樓與天井的壁畫、展板與老照片是本站原創的簡化圖樣，不複製照片裡的壁畫或任何畫作。' },
  { id: 'meals', text: '料理與餐具依照片簡化建模，每張桌子的狀態與套餐略有不同；不代表現在的菜單，也不寫價格。' },
  { id: 'size', text: '尺寸依照片估算；照片沒有拍到的後進與二樓細部是簡化的配置。' },
]

export const RICE_PENDING = [
  { id: 'families', field: '唐家與葉家', note: '文化部資料與報導都說這裡是唐家的米行；現在的經營者葉守倫是另一家米行（葉晉發米行，1923年創立）的後代。兩個家族的商號不同，本站分開寫，不混為一談。' },
  { id: 'why', field: '米行為什麼聚集在北街', note: '查到的資料記載北段是米產業的中心、碾米行近五十家，但沒有說明聚集的原因，本站不推測。' },
  { id: 'postwar', field: '329號在戰後的使用', note: '沒有查到戰後到2014年之間的使用紀錄；1945–1980 的住家與倉庫是情境示意。' },
  { id: 'opening', field: '稻舍的開幕年份', note: '報導寫到2014年唐家捐贈、URS 示範基地與2022年加入老房子文化運動，沒有明確的開幕日期。' },
]

/* ═══════════ 介紹章節 ═══════════ */

const SOURCES_ALL = ['moc-329-shophouse', 'taiwannews-2022-rice-shine', 'pts-2022-rice-shine', 'traveler-2019-rice-shine', 'cna-2020-kuo-hsueh-hu', 'moe-dou', 'moe-long', 'moe-caomi', 'moe-jingmiji']

const tradeChapter = {
  id: 'dadaocheng-rice-trade',
  type: 'text',
  tab: '北街米業',
  title: '北街為什麼曾經都是米行？',
  lead: '迪化街的北段，日治時期是大稻埕的米業中心。',
  summary: {
    text: '文化部的歷史建築資料記載，大稻埕北段在日治時期是米產業的中心；329號和鄰房331號原本相通，當時是唐家經營的米行。2019年的報導寫到，迪化街北段是碾米行聚集的地方，全盛時期將近五十家。米從這裡經過碾製、秤量，再賣到各地。',
  },
  paragraphs: [
    '從一棟店屋看一條街：329號的紅磚店屋是那段米業歷史留下來的見證之一。文化部的資料把它和331號放在一起說明——兩棟原本相通，是同一家米行使用的空間。',
    '米行聚集的原因：查到的資料只記載了「米產業中心」與「近五十家碾米行」，沒有說明為什麼聚集在北段，所以本站不推測原因，留待補充。',
  ],
  facts: [
    { label: '位置', value: '迪化街北段（昔日稱「北街」）' },
    { label: '全盛時期', value: '碾米行將近五十家（2019年報導）' },
    { label: '329號', value: '與331號原相通，唐家米行（文化部資料）' },
  ],
  sourceIds: ['moc-329-shophouse', 'traveler-2019-rice-shine'],
}

const measureChapter = {
  id: 'rice-measure',
  type: 'object',
  tab: '米斗',
  title: '米斗：量米的木斗',
  lead: '在用秤以前，米常常是「量」的：用斗、升計算米的多少。',
  object: 'rice-measure',
  summary: {
    label: '辭典與一般說明',
    text: '「斗」是計算容量的單位，十升為一斗、十斗為一石；「米斗」是形狀像斗、用來量米的木器（教育部《重編國語辭典修訂本》）。量米時把米倒滿木斗，再用刮板沿著斗口刮平，一斗就是一個固定的量；米行與買米的人用同樣的斗計量，交易才有共同的標準。',
  },
  paragraphs: [
    '模型（可以拖曳旋轉）：上寬下窄的木斗，四片木板拼接，角上包著金屬角件，斗口有磨損的痕跡，裡面還留著一點米粒。',
    '說明：「刮平」與交易標準是一般說明，沒有附特定的文獻；場景中的米斗是示意的模型，不代表某一件實際的器物或容量。',
  ],
  sourceIds: ['moe-dou'],
}

const millingChapter = {
  id: 'rice-milling',
  type: 'process',
  tab: '碾米',
  title: '碾米：從稻穀到白米',
  lead: '碾米間把剛收成的稻穀，變成米行賣的白米。',
  steps: [
    { id: 'paddy', label: '稻穀', text: '帶著外殼的稻。' },
    { id: 'husk', label: '脫殼', text: '用礱把穀殼磨去。「礱」是形狀像磨、有齒痕的器具，多用木料製成。' },
    { id: 'brown', label: '糙米', text: '稻去殼後、碾得不精的米。' },
    { id: 'white', label: '精米', text: '精米機去除糙米外層的米糠，成為白米。' },
  ],
  paragraphs: [
    '名詞的說明整理自教育部《重編國語辭典修訂本》的「礱」「糙米」與「精米機」。',
    '2019年的報導寫到，這棟店屋第一進的一樓過去左邊擺著大型碾米機、右邊堆白米；現在的稻舍保留碾米的器物與體驗。場景中的碾米機是依一般樣式簡化的示意模型。',
  ],
  sourceIds: ['moe-long', 'moe-caomi', 'moe-jingmiji', 'traveler-2019-rice-shine'],
}

const sourcesChapter = (disclaimer) => ({
  id: 'sources',
  type: 'sources',
  tab: '參考文獻',
  title: '參考文獻',
  intro: '迪化街一段329號店屋、北街米業與稻舍的介紹整理自下列資料，點選即可開啟原始網頁。每一筆都註明出版時間與用途。',
  sourceIds: SOURCES_ALL,
  disclaimer,
})

const SCENARIO_NOTE = RICE_SCENARIO.map((item) => item.text).join('')

export const RICE_CHAPTERS = {
  banquet: [
    {
      id: 'early',
      type: 'text',
      tab: '米業店屋',
      title: '北街米業逐漸形成',
      lead: '1895–1930：北街的街屋裡開始出現米袋、竹籮與「米」字木牌。',
      summary: {
        label: '歷史情境示意',
        text: '依文化部的資料，大稻埕北段在日治時期成為米產業的中心；稻舍負責人介紹，329號的前身唐益興米行由唐塗薩在1916年創立。這個年代的場景用木構、紅磚與瓦屋頂的初期街屋，加上米袋、竹籮、木桶、米斗、扁擔與手推車，表現北街米業開始形成。',
      },
      paragraphs: [
        '人物：店門口的米商、扛米袋的搬運工與篩米的碾米工人，都是情境人物，不對應任何實際的人。',
        '界線：資料記載這棟紅磚店屋建於1907年；場景把完整的紅磚拱券立面放在1930–1945，是為了讓同一塊地的變化更清楚。這裡沒有「稻舍」的名稱或招牌。',
      ],
      lists: [{ title: '情境設計', kind: 'scenario', items: [RICE_SCENARIO[0].text] }],
      sourceIds: ['moc-329-shophouse', 'taiwannews-2022-rice-shine'],
    },
    tradeChapter,
    measureChapter,
    sourcesChapter(SCENARIO_NOTE),
  ],
  modern: [
    {
      id: 'rice-mill',
      type: 'text',
      tab: '米行與碾米間',
      title: '迪化街329號米行／碾米間',
      lead: '1930–1945：紅磚拱券的店屋裡，前店賣米、中段碾米、天井透光，後進是米倉。',
      summary: {
        label: '歷史情境示意',
        text: '文化部的資料記載，329號與331號原本相通，是唐家經營的米行，見證北段米產業的發展。2019年的報導描述，這棟兩進兩層的店屋，第一進一樓過去左邊擺大型碾米機、右邊堆白米。場景依這樣的配置，重建前店（帳桌、秤、算盤、米斗）、碾米區、天井與米倉。',
      },
      paragraphs: [
        '前店：米袋、米斗、木櫃與帳桌，桌上是秤、算盤與帳本。',
        '中段：左邊的大型碾米機（漏斗、機身、皮帶輪）、木製農具、竹籮、米篩與稻穀堆；右邊堆著白米。',
        '後段：天井的自然光、米倉裡堆疊的米袋、木梯與木桁架。燈光偏暗，只有暖色燈泡與天井的日光，沒有現代的軌道燈。',
      ],
      lists: [{ title: '情境設計', kind: 'scenario', items: [RICE_SCENARIO[0].text, RICE_SCENARIO[2].text] }],
      sourceIds: ['moc-329-shophouse', 'traveler-2019-rice-shine'],
    },
    tradeChapter,
    measureChapter,
    millingChapter,
    sourcesChapter(SCENARIO_NOTE),
  ],
  postwar: [
    {
      id: 'decline',
      type: 'text',
      tab: '戰後的轉變',
      title: '戰後米業與產業轉變',
      lead: '1945–1980：同一棟紅磚店屋老了，米袋少了，店裡的一部分變成住家與倉庫。',
      summary: {
        label: '歷史情境示意',
        text: '這個年代沿用同一棟紅磚店屋，磚色變深、牆面有使用的痕跡，木門窗也舊了。米袋的數量減少，後進的一部分成為住家與倉庫，碾米器具蓋著布留在原處。本站沒有查到329號在這段時間的使用紀錄，這裡呈現的是大稻埕米業逐漸轉變的情境，不是這棟店屋的實際歷史。',
      },
      paragraphs: [
        '留下來的器物：舊米斗、米篩、木櫃與碾米器具——它們也是今天稻舍展示器物的來源想像。',
        '戰後的生活用品：方桌與板凳、碗櫃、熱水瓶、鋁盆與收音機，都是簡化的示意。',
      ],
      lists: [{ title: '待核實', kind: 'pending', items: [RICE_PENDING[2].note] }],
      sourceIds: ['moc-329-shophouse'],
    },
    millingChapter,
    sourcesChapter(SCENARIO_NOTE),
  ],
  revival: [
    {
      id: 'rice-shine',
      type: 'text',
      tab: '稻舍',
      title: '稻舍 Rice & Shine',
      lead: '百年米業空間被重新利用：米行的紅磚店屋，現在是米食料理與稻米文化的餐館。',
      summary: {
        text: '迪化街一段329號店屋是2020年登錄的臺北市歷史建築。稻舍負責人葉守倫介紹，前身是1916年唐塗薩創立的唐益興米行，唐家後代在2014年把老屋捐給市府。團隊修復老屋、保留碾米廠的氛圍，陳列碾米機等器物，以米食料理介紹稻米文化。',
      },
      paragraphs: [
        '空間（依報導與照片）：兩進、兩層樓，兩進之間有過廊相通。一樓前進是餐廳與米業文化展示，穿過天井到後進，再從木樓梯上二樓；二樓臨街的木框大窗下是長桌，可以辦小型展覽與講座。',
        '唐家與葉家：這棟店屋是唐家的米行；葉守倫是另一家米行（1923年創立的葉晉發米行）的後代（2019年報導）。兩家的商號不同，本站分開寫。',
      ],
      lists: [
        { title: '使用者照片觀察', kind: 'observation', items: RICE_OBSERVATIONS.filter((o) => ['facade', 'entrance', 'dining', 'upstairs'].includes(o.id)).map((o) => o.text) },
        { title: '情境設計', kind: 'scenario', items: [RICE_SCENARIO[1].text, RICE_SCENARIO[2].text, RICE_SCENARIO[4].text] },
      ],
      sourceIds: ['moc-329-shophouse', 'taiwannews-2022-rice-shine', 'pts-2022-rice-shine', 'traveler-2019-rice-shine'],
    },
    {
      id: 'meals',
      type: 'text',
      tab: '米食料理',
      title: '米食料理：木托盤上的一份套餐',
      lead: '稻舍不是咖啡廳：主角是米飯，以及配飯的台式料理。',
      summary: {
        label: '使用者照片觀察',
        text: '套餐放在木托盤上：淺綠色碗裡的白飯撒著油蔥酥，青花碗裝著控肉或雞腿，旁邊是青菜、淋醬油的豆腐與小菜，有蓋的湯盅、茶杯，筷子放在筷架上。每張桌子的狀態不同：有的剛上菜、有的吃到一半、有的已經吃完。',
      },
      paragraphs: [
        '2022年的報導寫到，老屋改造為「米食文化餐館」。場景中的料理與餐具依照片簡化建模，不代表現在的菜單，也不寫價格。',
      ],
      sourceIds: ['taiwannews-2022-rice-shine'],
    },
    tradeChapter,
    measureChapter,
    millingChapter,
    {
      id: 'rice-basket',
      type: 'text',
      tab: '竹籮與竹篩',
      title: '竹籮、竹篩與米業的器具',
      lead: '展示架上，每一層都是不同的器物：米斗、竹編、陶甕、帳本與小工具。',
      summary: {
        label: '使用者照片觀察',
        text: '展示區陳列土礱、蓑衣、斗笠、竹籮與竹篩等器具。竹籮用來盛裝、搬運穀物，竹篩用來篩去雜物；竹編的紋路、外圈的竹框與使用留下的變形，都是器物曾經被使用的痕跡。',
      },
      paragraphs: ['器具用途是一般說明，沒有附特定的文獻；場景中的器物是簡化的示意，不是館藏或店內器物的複製。'],
      sourceIds: ['pts-2022-rice-shine'],
    },
    {
      id: 'courtyard',
      type: 'text',
      tab: '天井',
      title: '天井：老屋裡的光',
      lead: '穿過前進，來到兩進之間的天井：日光從上方灑下來。',
      summary: {
        label: '使用者照片觀察',
        text: '天井是紅磚圍牆，種著植物與小樹，牆面因為潮濕顏色較深，燈光與日光從上方照下來。2019年的報導寫到，天井牆上有描繪碾米流程的插畫。場景中的壁畫是本站原創的大稻埕生活與稻作圖樣，不複製照片裡的壁畫。',
      },
      paragraphs: [],
      sourceIds: ['traveler-2019-rice-shine'],
    },
    {
      id: 'nanjie',
      type: 'text',
      tab: '南街殷賑',
      title: '郭雪湖《南街殷賑》與大稻埕街景',
      lead: '1930年，郭雪湖畫下南街（今天的迪化街）最熱鬧的一天。',
      summary: {
        text: '郭雪湖1930年的作品《南街殷賑》，描繪迪化街霞海城隍廟口的中元普渡，在當年的臺展得獎，現由臺北市立美術館典藏。「南街」就是今天的迪化街，「殷賑」是熱鬧繁榮的意思；畫中可以看到乾元藥行、寶香齋等商號的招牌。',
      },
      paragraphs: [
        '畫家的視角：中央社的報導寫到，郭雪湖和寶香齋的第二代是同學，常到寶香齋二樓，從窗戶望出去看整條南街。',
        '展示說明：二樓的展示板只放文字說明與原創的街景線條，不重製畫作的圖像；作品請到臺北市立美術館的資料查看。',
      ],
      sourceIds: ['cna-2020-kuo-hsueh-hu'],
    },
    {
      id: 'renewal',
      type: 'text',
      tab: '老屋再生',
      title: '老屋再生：從米行到稻舍',
      lead: '你現在看到的餐館，是在舊米業空間上重新活化的結果。',
      summary: {
        text: '米行 → 產業衰退 → 歷史建築保存 → 稻舍 Rice & Shine。資料記載這棟店屋建於1907年，1916年唐益興米行在這裡創立；戰後米業逐漸轉變，2014年唐家後代把老屋捐給市府，2020年登錄為歷史建築，之後由稻舍修復活化，2022年加入臺北市的老房子文化運動。',
      },
      timeline: [
        { place: '1907', text: '店屋建立（文化部資料）。' },
        { place: '1916', text: '唐塗薩創立唐益興米行（2022年報導）。' },
        { place: '戰後', text: '米業逐漸轉變（情境示意，沒有查到329號的使用紀錄）。' },
        { place: '2014', text: '唐家後代把老屋捐給臺北市政府（2022年報導）。' },
        { place: '2020.4.28', text: '登錄為臺北市歷史建築（文化部資料）。' },
        { place: '2022.6.8', text: '以稻舍加入老房子文化運動，剪綵（2022年報導）。' },
      ],
      paragraphs: [],
      sourceIds: ['moc-329-shophouse', 'taiwannews-2022-rice-shine'],
    },
    sourcesChapter(SCENARIO_NOTE),
  ],
}

/** 各年代在店家名錄與介紹視窗的說明 */
export const RICE_ERA_NOTES = {
  banquet: '1895–1930：北街的街屋開始出現米業用途（歷史情境示意）。這裡還沒有「稻舍」，也還不是現在的紅磚拱券立面。',
  modern: '1930–1945：紅磚拱券的329號店屋作為米行與碾米間（歷史情境示意）。',
  postwar: '1945–1980：同一棟店屋老化，米業逐漸轉變，部分空間成為住家與倉庫（歷史情境示意）。',
  revival: '2000–現在：歷史建築活化為「稻舍 Rice & Shine」。外觀與店內依使用者提供的照片建模，尺寸為估算。',
}
