/**
 * 文獻與歷史依據
 *
 * 所有店家共用同一份文獻清單，店家資料以 id 參照。
 * 每一筆都必須是可以公開查證的真實來源；請勿填入未經查證的引文。
 */
export const SOURCES = {
  'ith-lin-fu-zhen': {
    id: 'ith-lin-fu-zhen',
    // 依使用者指定的引用格式
    citation: '中央研究院臺灣史研究所檔案館，〈林復振商行〉。',
    publisher: '中央研究院臺灣史研究所檔案館',
    title: '林復振商行',
    url: 'https://archives.ith.sinica.edu.tw/collections_con.php?no=134',
    context:
      '收錄於該館「館藏選粹」專文〈追溯迪化街百年老店林復振商行與乾元藥行〉。',
    // 原頁面中刊載的史料圖像（名稱照錄原頁面圖說）
    records: [
      '1915年11月2日淡水林振源號致泰益號書信',
      '1933年9月17日臺北復振英記致泰益號書信',
    ],
    recordsNote:
      '上列書信圖像見於原頁面，圖像來源標示為「長崎泰益號文書，中研院臺史所檔案館數位典藏」。',
  },
}

// 江山樓：創立年份各資料記載不一（1917 年或 1921 年），介面同時列出並標示來源
SOURCES['nmth-jiang-shan-lou'] = {
  id: 'nmth-jiang-shan-lou',
  citation: '國立臺灣歷史博物館典藏網，〈江山樓〉（典藏號 2004.055.0002）。',
  publisher: '國立臺灣歷史博物館',
  title: '江山樓',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2004.055.0002',
  context: '老照片藏品說明：江山樓由吳江山於1917年創立，為四層樓高的紅磚建築。',
}
SOURCES['wiki-jiang-shan-lou'] = {
  id: 'wiki-jiang-shan-lou',
  citation: '維基百科，〈江山樓〉。',
  publisher: '維基百科',
  title: '江山樓',
  url: 'https://zh.wikipedia.org/zh-tw/%E6%B1%9F%E5%B1%B1%E6%A8%93',
  context: '記為1917年（大正6年）由吳江山獨資設立，四層紅磚建築，1976年拆除。',
}
SOURCES['factpedia-jiang-shan-lou'] = {
  id: 'factpedia-jiang-shan-lou',
  citation: '求真百科，〈江山樓〉。',
  publisher: '求真百科',
  title: '江山樓',
  url: 'https://factpedia.org/wiki/%E6%B1%9F%E5%B1%B1%E6%A8%93',
  context: '記為1921年成立，同年11月20日開幕；描述為紅磚造四層樓連棟街屋（同頁詩作註解則記為1917年創立）。',
}
// 第 3 階段補的江山樓文獻（查證紀錄：docs/research/jiang-shan-lou.md）
SOURCES['jaung-jiang-shan-lou-2015'] = {
  id: 'jaung-jiang-shan-lou-2015',
  citation: '莊永明，〈大稻埕名酒樓之三：江山樓〉，莊永明書坊，2015年8月31日。',
  publisher: '莊永明書坊（個人部落格，作者為臺灣史作者；文末列有書名與日治報刊出處）',
  title: '大稻埕名酒樓之三：江山樓',
  url: 'http://jaungyoungming-club.blogspot.com/2015/08/blog-post_31.html',
  context: '記1921年11月20日開業、披露宴三天；吳江山原為東薈芳合夥人，赴廈門、福州、上海考察後創立。紅磚四層連棟街屋，宴會廳14間約容500人，樓頂有庭園假山。位置日新街東市二丁目（後為日新町二丁目），近歸綏街、甘州街。1923年與東薈芳承辦皇太子臺灣料理午宴；1927年底吳江山連載〈臺灣料理之話〉；1935年吳江山病逝；1970年代拆除。',
}
SOURCES['nccu-thesis-jiang-shan-lou-2008'] = {
  id: 'nccu-thesis-jiang-shan-lou-2008',
  citation: '簡伃君，《江山樓及其在日治時期紳商社交生活中所扮演的角色（1921–1940）》，國立政治大學歷史學系碩士論文，2008年。',
  publisher: '國立政治大學',
  title: '江山樓及其在日治時期紳商社交生活中所扮演的角色（1921–1940）',
  url: 'https://thesis.lib.nccu.edu.tw/detail/30cf32714ba6debfdd04e8e4822ae948/',
  context: '摘要稱江山樓是推廣臺灣菜的重要餐廳，1920年代後代表臺灣最高烹飪水準，也是紳商社交的場所。本站只讀到摘要與參考文獻。',
}
SOURCES['cna-taiwanese-cuisine-2020'] = {
  id: 'cna-taiwanese-cuisine-2020',
  citation: '陳凱棠，〈台菜的身世〉（引曾品滄），中央社文化+，2020年12月7日。',
  publisher: '中央通訊社',
  title: '台菜的身世',
  url: 'https://www.cna.com.tw/culture/article/20201207w001',
  context: '1923年皇太子午宴十二道大菜用燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參；江山樓後來印出列有192道菜的菜單。',
}
SOURCES['foodnext-chen-yuchen-2020'] = {
  id: 'foodnext-chen-yuchen-2020',
  citation: '陳玉箴，〈1923年皇太子的臺灣料理宴〉，食力 Foodnext，2020年10月18日。',
  publisher: '食力 Foodnext（作者為國立臺灣師範大學副教授）',
  title: '1923年皇太子的臺灣料理宴',
  url: 'https://www.foodnext.net/life/culture/paper/5470493786',
  context: '1923年4月24日中午在總督官邸大食堂辦臺灣料理午宴，總督府曾派人赴日試菜；十二道大菜，第七道炸春餅，以八寶飯與杏仁茶作結；稱吳江山為御宴主廚。',
}

// 滋養豆餡舖
SOURCES['ziyang-about'] = {
  id: 'ziyang-about',
  citation: '滋養和菓子官方網站，〈商店簡介〉。',
  publisher: '滋養和菓子',
  title: '商店簡介',
  url: 'https://www.wagashi.com.tw/pages/about-us',
  context: '記載「創立於1953年 原址為南京西路」、1953年草創「滋養食品」，以及引進日本製菓技術、迪化街一段247號門市等資訊。',
}
SOURCES['ryori-taiwan-ziyang'] = {
  id: 'ryori-taiwan-ziyang',
  citation: '朱荔詡，〈滋養配方不變 大膽解構甜點〉，《料理．台灣》第55期，中華飲食文化基金會，2021年1月4日。',
  publisher: '財團法人中華飲食文化基金會',
  title: '滋養配方不變 大膽解構甜點',
  url: 'https://ryoritaiwan.fcdc.org.tw/columns/6457',
  context: '專訪第三代林濬彤：1953年成立之初的樣貌、1961年第二代開始製作和菓子、原址都市更新後遷入迪化街，以及草莓大福、銅鑼燒、鳳梨夾心餅等商品。',
}
SOURCES['supertaste-ziyang'] = {
  id: 'supertaste-ziyang',
  citation: '食尚玩家（食尚編輯部），〈IG必收！大稻埕7家美拍老屋餐廳，日治洋樓吃和菓子、中藥房喝凍檸茶〉。',
  publisher: '食尚玩家',
  title: 'IG必收！大稻埕7家美拍老屋餐廳，日治洋樓吃和菓子、中藥房喝凍檸茶',
  url: 'https://supertaste.tvbs.com.tw/hot/321416',
  context: '描述滋養豆餡舖的街屋外觀（洋樓古典風格、紅磚牆、高高的牌樓）與現點現做的最中；原頁面未標示刊登日期。',
}

// 永樂市場
SOURCES['tcma-yongle-market'] = {
  id: 'tcma-yongle-market',
  citation: '臺北市市場處，〈臺北市公有永樂市場〉（資料更新：民國113年8月7日）。',
  publisher: '臺北市市場處',
  title: '臺北市公有永樂市場',
  url: 'https://www.tcma.gov.taipei/News_Content.aspx?n=1A4C7120ABFD0F9F&sms=26C5BF03E7963F4E&s=C58B40D5621B5A00',
  published: '資料更新：民國113年8月7日（2024年）',
  usage: '永樂市場的成立、改建與開業年份（臺北市市場處的官方網頁）。',
  context: '沿革：「民國前4年成立，稱為「公設永樂町食料品小賣市場」，民國71年原市場拆除，改建綜合大樓安置原攤商，74年開業。」地址為迪化街一段21號。',
}
SOURCES['taipei-market-info-yongle'] = {
  id: 'taipei-market-info-yongle',
  citation: '臺北市政府全球資訊網，市集資訊〈臺北市公有永樂市場〉（資料更新：民國108年2月18日）。',
  publisher: '臺北市政府',
  title: '臺北市公有永樂市場',
  url: 'https://www.gov.taipei/News_Content.aspx?n=9F394A83D9DF4A19&s=500622DD41A6B6A3',
  published: '資料更新：民國108年2月18日（2019年）',
  usage: '永樂市場各樓層的用途（臺北市政府的市集資訊）。',
  context: '介紹：「1樓生鮮蔬果日用品，2.3樓布匹窗簾飾布買賣縫製，是全台布業零售、批發中心。」',
}
SOURCES['ncl-yongle-market'] = {
  id: 'ncl-yongle-market',
  citation: '國家圖書館「臺灣記憶」，〈永樂町市場攤販〉（臺北市文獻委員會提供；說明引自《臺北市志：卷六經濟志商業篇》，1988）。',
  publisher: '國家圖書館',
  title: '永樂町市場攤販',
  url: 'https://tm.ncl.edu.tw/article?u=005_001_0000358637',
  context: '說明：1897年六館街的大稻埕市場落成，1908年（明治41年）改設於大稻埕蘆竹腳街，1933年（昭和8年）改名為永樂町市場。',
}
SOURCES['udn-1995-yongle-market'] = {
  id: 'udn-1995-yongle-market',
  citation: '景小佩，〈平民的永樂市場布出名〉，《聯合報》1995年4月4日第30版（聯合報系「報時光」2024年7月1日轉載）。',
  publisher: '聯合報系 報時光',
  title: '迪化街永樂市場 從日治時期到現代的百年布料集散地',
  url: 'https://time.udn.com/udntime/story/122835/6045015',
  context: '記載市場成立於1908年12月14日；民國71年3月拆除舊建築改建，74年9月完工、10月8日重新開業；新大樓地上九樓、地下兩層。',
}

// 好粿緣與粿食文化
SOURCES['moe-guo'] = {
  id: 'moe-guo',
  citation: '教育部《臺灣台語常用詞辭典》，「粿」。',
  publisher: '教育部',
  title: '粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/10694/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「粿」的定義（糯米或粳米等做成的食品的總稱）。',
  context: '釋義：「糕的總稱，指用糯米或粳米等做成的食品。因所加的原料不同而有不同的稱法。」',
}
SOURCES['moe-cao-guo'] = {
  id: 'moe-cao-guo',
  citation: '教育部《臺灣台語常用詞辭典》，「草仔粿」。',
  publisher: '教育部',
  title: '草仔粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/13709/',
  published: '線上辭典（2026年10月查閱）',
  usage: '草仔粿的材料、做法（外墊葉片、蒸籠蒸熟）與普渡、清明的用途。',
  context: '釋義：外皮以「粿粞」加入艾草或鼠麴草揉成，外墊黃槿葉或月桃葉等，以蒸籠蒸熟；常做為農曆七月普渡或清明掃墓時的供品。',
}
SOURCES['moe-hong-gui'] = {
  id: 'moe-hong-gui',
  citation: '教育部《臺灣台語常用詞辭典》，「紅龜粿」。',
  publisher: '教育部',
  title: '紅龜粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/5433/',
  published: '線上辭典（2026年10月查閱）',
  usage: '紅龜粿的做法（染紅、以模具印上龜型圖樣後蒸製）與祭祀、添丁的用途。',
  context: '釋義：由糯米製成，粿皮染紅、以模具印上龜型圖樣後蒸製；常用來祭拜神明、酬神，或在添丁時分送親友。',
}
SOURCES['moe-cai-tau-guo'] = {
  id: 'moe-cai-tau-guo',
  citation: '教育部《臺灣台語常用詞辭典》，「菜頭粿」。',
  publisher: '教育部',
  title: '菜頭粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/8972/',
  published: '線上辭典（2026年10月查閱）',
  usage: '菜頭粿（蘿蔔糕）的材料與做法。',
  context: '釋義：「蘿蔔糕。在來米漿拌入炒過的蘿蔔絲、蝦米等配料，蒸製而成的食品。」',
}
SOURCES['moe-yu-guo-qiao'] = {
  id: 'moe-yu-guo-qiao',
  citation: '教育部《臺灣台語常用詞辭典》，「芋粿曲」。',
  publisher: '教育部',
  title: '芋粿曲',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/3489/',
  context: '釋義：「用芋頭、在來米、紅蔥頭、蝦米等，蒸製而成的一種食品。形狀如弧形而得名。」',
}
SOURCES['nmth-hong-gui-mold'] = {
  id: 'nmth-hong-gui-mold',
  citation: '國立臺灣歷史博物館典藏網，〈紅龜粿印模轉印紙張〉（登錄號 2010.003.0248）。',
  publisher: '國立臺灣歷史博物館',
  title: '紅龜粿印模轉印紙張',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2010.003.0248',
  published: '典藏網頁（未標示日期；2026年10月查閱）',
  usage: '粿模的龜甲紋樣，以及紅龜粿在祭祀、年節與做壽的用途。',
  context: '說明：粿模為早期農業社會居家常見之模具；紅龜粿與紅桃粿在神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽都可見到。',
}
SOURCES['moa-guo-rice'] = {
  id: 'moa-guo-rice',
  citation: '李誠紘、吳以健、王柏蓉、鄭佳綺，〈「粿」然如此製粿稻米品種介紹〉，《臺中區農情月刊》第285期，2023年5月29日（農業知識入口網）。',
  publisher: '農業部 農業知識入口網',
  title: '「粿」然如此製粿稻米品種介紹',
  url: 'https://kmweb.moa.gov.tw/knowledgebase.php?type=13259&id=420096',
  published: '2023年5月29日（《臺中區農情月刊》第285期）',
  usage: '製粿的米：在來米（蘿蔔糕等）與圓糯米（草仔粿、紅龜粿等）。',
  context: '說明蘿蔔糕、碗粿等以在來米製成；圓糯米磨粉後製成草仔粿、紅龜粿、菜包等。',
}
SOURCES['moa-cao-guo'] = {
  id: 'moa-cao-guo',
  citation: '農業部食農教育資訊整合平臺，〈美味與傳統完美結合的草仔粿〉（資料來源：臺南區農業改良場，2023年4月4日）。',
  publisher: '農業部',
  title: '美味與傳統完美結合的草仔粿',
  url: 'https://fae.moa.gov.tw/theme_data.php?theme=news&sub_theme=hot_news&id=1294',
  published: '2023年4月4日',
  usage: '草仔粿在清明節掃墓祭祖的用途。',
  context: '說明草仔粿「是閩南人與客家人在清明節掃墓祭祖時的經典糕點」。',
}
SOURCES['moa-niangao'] = {
  id: 'moa-niangao',
  citation: '林書帆，〈年糕＆蘿蔔糕〉，《鄉間小路》（農業知識入口網，2019年3月8日）。',
  publisher: '農業部 農業知識入口網',
  title: '年糕＆蘿蔔糕',
  url: 'https://kmweb.moa.gov.tw/theme_data.php?theme=news&sub_theme=agri_life&id=55163',
  published: '2019年3月8日',
  usage: '蘿蔔糕「菜頭」與「彩頭」的諧音與過年的習俗。',
  context: '提到「菜頭」與「彩頭」諧音，蘿蔔糕成為過年必備菜色；臺語俗諺「食甜粿，予你趁家伙」；過年前在家做菜頭粿、甜粿、發糕等糕點。',
}

// 導演的豆花店 Action! Bar 與豆花文化
SOURCES['tcooc-action-bar'] = {
  id: 'tcooc-action-bar',
  citation: '臺北市商業處，〈探索再造店家（依類型）－茶飲冰品〉：導演的豆花店Action! Bar（資料更新：民國115年1月30日）。',
  publisher: '臺北市政府商業處',
  title: '探索再造店家（依類型）－茶飲冰品',
  url: 'https://www.tcooc.gov.taipei/cp.aspx?n=8D0974959002A45D&s=D9B4B5182196CDA3',
  context:
    '品牌故事：「2021年，豆花車延伸為豆花店，在迪化街小巷裡，與夢想一同落腳」；改造重點：原名「夢想基地-導演的豆花店」，透過輕改造更名為「導演的豆花店Action! Bar」，品牌定位「稻埕夢想會客廳」；店家地址：臺北市大同區迪化街1段224巷24號。',
}
SOURCES['gcis-action-bar'] = {
  id: 'gcis-action-bar',
  citation: '經濟部商工登記公示資料，「導演的豆花店」（商業登記，登記機關：臺北市商業處）。',
  publisher: '經濟部 商工登記公示資料（政府資料開放平臺 API）',
  title: '導演的豆花店：商業登記基本資料',
  url: 'https://data.gcis.nat.gov.tw/od/data/api/426D5542-5F05-43EB-83F9-F1300F14E1F1?$format=json&$filter=President_No%20eq%2088138249&$skip=0&$top=10',
  context: '核准設立日期：民國110年3月12日；地址：臺北市大同區迪化街1段224巷24號1樓；營業項目：飲料店業。',
}
SOURCES['udn-500-action-bar'] = {
  id: 'udn-500-action-bar',
  citation: '于國華，〈文化觀察者于國華／導演的豆花：認識自己、看見家園〉，聯合報系《500輯》，2024年1月22日。',
  publisher: '聯合報系 500輯',
  title: '導演的豆花：認識自己、看見家園',
  url: 'https://500times.udn.com/wtimes/story/120840/7724585',
  context:
    '記載何明瑞與齊柏林相約「你在天上飛、我在地上跑」；2019年7月導演的豆花車登場；在迪化街區創辦「夢想基地」，一樓就是豆花店；向大溪豆乾老店學來鹽滷製作豆花，用地瓜和芋頭製作粉圓、山梔子製作粉粿。',
}
SOURCES['kinmen-2019-douhua-truck'] = {
  id: 'kinmen-2019-douhua-truck',
  citation: '李金鎗，〈導演的豆花車巡迴古寧國小〉，金門縣政府全球資訊網（轉載金門日報），2019年12月5日。',
  publisher: '金門縣政府',
  title: '導演的豆花車巡迴古寧國小',
  url: 'https://www.kinmen.gov.tw/News_Content2.aspx?n=98E3CA7358C89100&sms=BF7D6D478B935644&s=18D4878A9202442E&Create=1',
  context: '介紹何明瑞是紀錄片導演、瑞齊傳播有限公司負責人與製作人，2019年入圍電視金鐘獎非戲劇類節目攝影獎；以「導演的豆花車」巡迴古寧國小，進行兒童影像記錄工作坊。',
}
SOURCES['matsu-2025-action-bar-camp'] = {
  id: 'matsu-2025-action-bar-camp',
  citation: '〈「導演的豆花店」暑期兒童影像紀錄學習營7月到馬祖　21日起報名〉，《馬祖日報》，2025年3月19日。',
  publisher: '馬祖日報',
  title: '「導演的豆花店」暑期兒童影像紀錄學習營7月到馬祖',
  url: 'https://www.matsu-news.gov.tw/news/article/230291',
  context: '學習營為公益性質、完全免費，每年暑期巡迴不同的偏鄉與離島；招收國小四至六年級學童，學習用影像捕捉生活、表達自我。',
}
SOURCES['moe-douhua'] = {
  id: 'moe-douhua',
  citation: '教育部《臺灣台語常用詞辭典》，「豆花」。',
  publisher: '教育部',
  title: '豆花',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/3437/',
  published: '線上辭典（2026年10月查閱）',
  usage: '豆花的定義（豆漿加鹽滷或石膏凝結；通常加糖水和花生）。',
  context: '釋義：「在豆漿中加入少量的鹽滷或石膏，使能凝結成比豆腐還嫩的食品。通常加糖水和花生，當作甜食。」',
}
SOURCES['moe-maltose'] = {
  id: 'moe-maltose',
  citation: '教育部《臺灣台語常用詞辭典》，「麥芽膏」。',
  publisher: '教育部',
  title: '麥芽膏',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/8112/',
  context: '釋義：「麥芽糖。由含澱粉酶的麥芽使澱粉水解而成，是一種金黃色，有黏性的糖品。」',
}
SOURCES['moe-fun-inn'] = {
  id: 'moe-fun-inn',
  citation: '教育部《臺灣台語常用詞辭典》，「粉圓」。',
  publisher: '教育部',
  title: '粉圓',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/6456/',
  context: '釋義：「一種用番薯粉和紅糖做成的食品。外表為圓形，煮熟後變透明狀。夏天可以涼食，冬天可以熱食。」',
}
SOURCES['moe-fun-kue'] = {
  id: 'moe-fun-kue',
  citation: '教育部《臺灣台語常用詞辭典》，「粉粿」。',
  publisher: '教育部',
  title: '粉粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/6465/',
  context: '釋義：「涼粉。用番薯粉做成的粿類食品。」',
}
SOURCES['moa-douhua-gel'] = {
  id: 'moa-douhua-gel',
  citation: '任珮君、何昱圻，〈豆花凝膠機制的介紹〉，《桃園區農情月刊》第285期（農業部食農教育資訊整合平臺，2023年4月15日）。',
  publisher: '農業部',
  title: '豆花凝膠機制的介紹',
  url: 'https://fae.moa.gov.tw/theme_data.php?theme=topics&sub_theme=knowledge&id=3484',
  published: '2023年4月15日（《桃園區農情月刊》第285期）',
  usage: '豆花凝結的原理（大豆蛋白與凝固劑形成凝膠）與鹽滷豆花的口感。',
  context: '說明豆漿中的大豆蛋白和凝固劑作用形成凝膠結構；以鹽滷作為凝固劑凝結的豆花口感偏硬脆。',
}
SOURCES['moa-ice-toppings'] = {
  id: 'moa-ice-toppings',
  citation: '農業部食農教育資訊整合平臺，〈美食剉冰，你要加什麼料！〉，2023年8月2日。',
  publisher: '農業部',
  title: '美食剉冰，你要加什麼料！',
  url: 'https://fae.moa.gov.tw/theme_data.php?theme=topics&sub_theme=knowledge&id=4285',
  context: '說明粉粿是粉漿加上山梔子煮過的水攪拌後蒸熟；粉粿黃黃的顏色來自天然色素「山梔子」，又名黃梔。',
}

// 爐鍋咖啡與小藝埕（屈臣氏大藥房舊址）：建築興建年份各資料記載不一（1928年，一說1917年），介紹中並列
SOURCES['taipei-pictorial-watson'] = {
  id: 'taipei-pictorial-watson',
  citation: '魚夫，〈屈臣氏大樓的興衰起落〉，《台北畫刊》2017年2月號，頁56–57。',
  publisher: '臺北市政府',
  title: '屈臣氏大樓的興衰起落',
  url: 'http://www-ws.gov.taipei/001/Upload/public/MMO/READ/589-09.pdf',
  context:
    '「最早屈臣氏是臺中實業家李俊啟全權負責經營，他本來在彰化員林開設「德壽堂」」；「1928 年（一說為1917 年）興建了這棟位於臺北大稻埕的屈臣氏大樓，以批發進口西藥為主，也代理英國史谷脫（Scott）魚肝油」；「直到 1926 年時，李俊啟的名聲也不遑多讓，當時報載香港屈臣氏的藥品非常有效，適合華人體質，且全臺歸李俊啟氏專營」；1934年香港屈臣氏本店控告李俊啟擅自使用商標；「現存建築立面3 樓外牆所鑲鐫的飛龍與麒麟護衛七層寶塔圖騰」，兩旁書有「龍麟伴塔為記，別人不得冒效」；「1996 年遭逢大火，直至2005年由市府列為巿定古蹟後，交由李家後代李永崇建築師修復完成」。',
}
SOURCES['boch-opendata-assets'] = {
  id: 'boch-opendata-assets',
  citation: '文化部文化資產局，文化資產開放資料：古蹟（1.1）案件清單。',
  publisher: '文化部文化資產局',
  title: '文化資產開放資料（古蹟）',
  url: 'https://data.boch.gov.tw/opendata/v2/assetsCase/1.1.json',
  context: '2026年10月查詢古蹟（1.1.json）的案件清單，沒有找到名稱含「屈臣氏」「李俊啟」或地址為迪化街一段34號、32巷的案件；附近的兩江醫院（迪化街1段28號）是另一棟直轄市定古蹟。',
}
SOURCES['boch-opendata-historic'] = {
  id: 'boch-opendata-historic',
  citation: '文化部文化資產局，文化資產開放資料：歷史建築（1.2）案件清單。',
  publisher: '文化部文化資產局',
  title: '文化資產開放資料（歷史建築）',
  url: 'https://data.boch.gov.tw/opendata/v2/assetsCase/1.2.json',
  context: '2026年10月查詢歷史建築（1.2.json）的案件清單，同樣沒有找到名稱含「屈臣氏」「李俊啟」或地址為迪化街一段34號、32巷的案件。',
}
SOURCES['businesstoday-2012-watson'] = {
  id: 'businesstoday-2012-watson',
  citation: '《今周刊》，2012年10月25日報導（小藝埕與屈臣氏大藥房）。',
  publisher: '今周刊',
  title: '今周刊 2012年10月25日報導',
  url: 'https://www.businesstoday.com.tw/article/category/80392/post/201210250013/',
  context: '「這棟洗石子外牆的三層樓平樑式結構，坐落在街角」；「二○一一年右翼內棟作為「小藝埕」，內有…藝術設計品鋪、獨立書店、咖啡店及劇場」（「內有」描述的是2012年報導時的情形）。',
}
SOURCES['businesstoday-2015-dadaocheng'] = {
  id: 'businesstoday-2015-dadaocheng',
  citation: '《今周刊》，2015年6月25日報導（大稻埕的老屋新生）。',
  publisher: '今周刊',
  title: '今周刊 2015年6月25日報導',
  url: 'https://www.businesstoday.com.tw/article/category/183016/post/201506250043/',
  context: '報導以「這波大稻埕文藝復興風潮」形容迪化街一帶的老屋再利用。',
}
SOURCES['gvm-2013-artyard'] = {
  id: 'gvm-2013-artyard',
  citation: '《遠見雜誌》，2013年8月28日報導（周奕成與小藝埕）。',
  publisher: '遠見雜誌',
  title: '遠見雜誌 2013年8月28日報導',
  url: 'https://www.gvm.com.tw/article/18274',
  context: '「2010年周奕成好不容易獲得…「屈臣氏大藥房」屋主點頭出租，以「大稻埕上賣小藝」發想創立小藝埕，展開他的文化復興大計。」報導稱周奕成為「世代文化創業群負責人」。（報導原文另稱這棟樓是「大稻埕最古老的建築物」，與興建年份及大稻埕更早的古蹟不符，本站不引用。）',
}
SOURCES['artyard-about'] = {
  id: 'artyard-about',
  citation: '大藝埕 ArtYard 官方網站，〈關於〉。',
  publisher: '世代群 Sedai Group',
  title: '大藝埕 ArtYard：關於',
  url: 'https://www.artyard.tw/about',
  context: '「自 2011 年的「小藝埕」至今，世代群在大稻埕經營了 10 棟藝埕系列街屋」；「大藝埕 ArtYard.tw 是由世代群 Sedai Group 建置」。',
}
SOURCES['ntpu-2014-dadaocheng'] = {
  id: 'ntpu-2014-dadaocheng',
  citation: '國立臺北大學都市計劃研究所，〈大稻埕歷史風貌特定專用區之街區再生計畫〉，2014年6月13日。',
  publisher: '國立臺北大學',
  title: '大稻埕歷史風貌特定專用區之街區再生計畫',
  url: 'https://urbanplanning.ntpu.edu.tw/wp-content/uploads/2018/07/%E5%A4%A7%E7%A8%BB%E5%9F%95%E6%AD%B7%E5%8F%B2%E9%A2%A8%E8%B2%8C%E7%89%B9%E5%AE%9A%E5%B0%88%E7%94%A8%E5%8D%80%E4%B9%8B%E8%A1%97%E5%8D%80%E5%86%8D%E7%94%9F%E8%A8%88%E7%95%AB.pdf',
  context: '報告引用小藝埕官網：「一樓：「Bookstore 1920s」及「印花樂」 二樓：「爐鍋咖啡」 三樓：展示和聚會場所」。',
}
SOURCES['supertaste-artyard'] = {
  id: 'supertaste-artyard',
  citation: 'TVBS《食尚玩家》，大稻埕小藝埕介紹。',
  publisher: 'TVBS 食尚玩家',
  title: '食尚玩家：小藝埕',
  url: 'https://supertaste.tvbs.com.tw/travel/313760',
  context: '「2樓的「爐鍋咖啡」主打來自各產區、莊園的單品咖啡，還有義式濃縮和拿鐵。」；「3樓是思劇場」。',
}
SOURCES['storm-2018-luguo'] = {
  id: 'storm-2018-luguo',
  citation: '《風傳媒》，2018年12月26日報導（迪化街的屈臣氏大藥房與爐鍋咖啡）。',
  publisher: '風傳媒',
  title: '風傳媒 2018年12月26日報導',
  url: 'https://www.storm.mg/lifestyle/721968',
  context: '「屈臣氏大藥房的二樓，有間網路上頗具知名度的爐鍋咖啡」；「所有的咖啡豆都是老闆精選各國的豆子，而且每杯咖啡強調不加糖、不加奶精」；「地址：台北市大同區迪化街一段32巷1號」。',
}
SOURCES['storm-2015-luguo-guandu'] = {
  id: 'storm-2015-luguo-guandu',
  citation: '欣台灣，〈居高臨下的窗景令人心醉！五家藏在二樓的好咖啡〉，《風傳媒》，2015年10月10日。',
  publisher: '風傳媒',
  title: '居高臨下的窗景令人心醉！五家藏在二樓的好咖啡',
  url: 'https://www.storm.mg/lifestyle/68081',
  context: '「位於台北藝術大學關渡校區的爐鍋咖啡，基本上是開外掛形式的二樓咖啡」。',
}
SOURCES['moa-taiwan-coffee'] = {
  id: 'moa-taiwan-coffee',
  citation: '農業部農業知識入口網（農業試驗所），〈台灣咖啡沿革〉。',
  publisher: '農業部',
  title: '台灣咖啡沿革',
  url: 'https://kmweb.moa.gov.tw/subject/subject.php?id=45295',
  context:
    '「西元1884年(清光緒10年)臺灣咖啡樹栽培最早紀錄，始於英國茶商自馬尼拉引進一百株阿拉比卡咖啡在台北三峽種植。」；1902年在恆春設立熱帶植物殖育場；1917年嘉義試驗支場研究阿拉比卡種；「1942年時全台栽培面積已達1,000公頃之多」；戰後「全台栽培咖啡產地因此大多荒蕪」。',
}
SOURCES['boch-bolero'] = {
  id: 'boch-bolero',
  citation: '文化部文化資產局，國家文化資產網：歷史建築「波麗路餐廳」（2006年5月17日登錄）。',
  publisher: '文化部文化資產局',
  title: '波麗路餐廳（歷史建築）',
  url: 'http://nchdb.boch.gov.tw/assets/advanceSearch/historicalBuilding/20060517000001',
  context: '「本店位於本市民生西路314號，初建於1920年代，後於1934年餐廳開業後進行裝修」；「「波麗路」為臺北市1930年代最著名的西餐廳，是「沙龍文化」的先鋒，為生活西化重要見證。」',
}
/* ── 波麗路（第 4 階段，查證紀錄 docs/research/bolero.md） ── */
SOURCES['mirror-2025-bolero'] = {
  id: 'mirror-2025-bolero',
  citation: '林亦君（文）、何宗昇（攝），〈波麗路西餐廳〉，鏡週刊，2025年5月4日更新。',
  publisher: '鏡週刊',
  title: '波麗路西餐廳',
  url: 'https://www.mirrormedia.mg/story/20250504food001',
  context: '1934年（昭和9年）廖水來自立門戶，原在楊承基的「維特咖啡」任主廚；店名取自樂曲〈BOLERO〉；畫家張萬傳、楊三郎、陳德旺、洪瑞麟、郭雪湖常出入，呂泉生、林衡道亦常來；菜單有法國鴨子飯、牛肉咖哩飯，牛排先醃再煎。同文門牌寫134號與314號、「歷史建築」與「市定古蹟」並見，本站不採用134號與市定古蹟。',
}
SOURCES['foodnext-2020-bolero'] = {
  id: 'foodnext-2020-bolero',
  citation: '魚夫，〈波麗路〉，食力 foodNEXT，2020年7月5日。',
  publisher: '食力 foodNEXT',
  title: '波麗路',
  url: 'https://www.foodnext.net/life/culture/paper/5098473425',
  context: '1934年開幕，民生西路314號；招牌法國鴨子飯、附魚鬆的咖哩飯；年輕人相親的場所；廖水來設計多層鋼製圓飯盒（文中寫「據說」）。',
}
SOURCES['gvm-city-2024-bolero'] = {
  id: 'gvm-city-2024-bolero',
  citation: '魚夫，〈波麗路與維特咖啡〉，遠見城市，2024年11月21日。',
  publisher: '遠見城市',
  title: '波麗路與維特咖啡',
  url: 'https://city.gvm.com.tw/article/117285',
  context: '波麗路位於日治時期的太平町三丁目（約今民生西路與延平北路口）；維特咖啡1931年開於太平町三丁目；畫家陳清汾自巴黎返臺與廖水來聊天，激發鴨子飯的研發；「相親定終身」。文中創辦人名字「廖水來」「廖永來」並用。',
}
SOURCES['gvm-2011-bolero'] = {
  id: 'gvm-2011-bolero',
  citation: '王思涵，〈波麗路：保留1934年的菜色與空間〉，《遠見雜誌》2011年8月號（網頁2011年7月29日）。',
  publisher: '遠見雜誌',
  title: '波麗路：保留1934年的菜色與空間',
  url: 'https://www.gvm.com.tw/article/15728',
  context: '廖水來赴日學西餐，朋友鼓勵租小店面開業；後來買下該建物，1976年於隔壁開第二店，本店一直在原址；1961年法國鴨子飯一份25元；初開裝潢有進口磁磚、沙發椅、吊扇、冷氣、78轉電唱機播放古典樂，服務員穿黑西裝打領結。',
}
SOURCES['setn-2020-vite-cafe'] = {
  id: 'setn-2020-vite-cafe',
  citation: '鍾志鵬，〈維特咖啡〉，三立新聞網，2020年10月22日。',
  publisher: '三立新聞網',
  title: '維特咖啡',
  url: 'https://www.setn.com/news/835067',
  context: '維特咖啡1931年開設，經營者楊承基（楊三郎之兄），位於太平町三丁目路口二樓（今延平北路與南京西路口），1932年引進女給。單一來源。',
}
SOURCES['newtalk-2024-shanshuiting'] = {
  id: 'newtalk-2024-shanshuiting',
  citation: '林衡哲，〈王井泉與山水亭〉，新頭殼 Newtalk，2024年4月26日。',
  publisher: '新頭殼 Newtalk',
  title: '王井泉與山水亭',
  url: 'https://newtalk.tw/news/view/2024-04-26/917548',
  context: '王井泉在大稻埕經營山水亭臺菜餐廳，常客有林茂生、陳逸松、張文環、呂赫若、吳新榮等，陳逸松出資協助創辦《臺灣文學》。未載創立年、門牌與菜色；回憶性質的評論稿，單一來源。',
}
SOURCES['wiki-bolero'] = {
  id: 'wiki-bolero',
  citation: '維基百科，〈波麗路西餐廳〉（無腳註，只作對照）。',
  publisher: '維基百科',
  title: '波麗路西餐廳',
  url: 'https://zh.wikipedia.org/wiki/%E6%B3%A2%E9%BA%97%E8%B7%AF%E8%A5%BF%E9%A4%90%E5%BB%B3',
  context: '1934年創立，民生西路314號；店名取自拉威爾〈Boléro〉；1947年畫家顏雲連重新設計改建；1976年兄弟分家另一店在308號；2006年5月17日公告為歷史建築。改建與分家只有這一個來源，本站不採用。',
}
SOURCES['moe-coffee'] = {
  id: 'moe-coffee',
  citation: '教育部《國語辭典簡編本》，「咖啡」。',
  publisher: '教育部',
  title: '咖啡',
  url: 'https://dict.concised.moe.edu.tw/dictView.jsp?ID=17911&q=1',
  context: '「種子為咖啡原料，焙乾後研成細末可沖泡為飲料，有興奮神經的效果。」',
}
SOURCES['nca-pour-over'] = {
  id: 'nca-pour-over',
  citation: 'National Coffee Association USA, "Pour Over Coffee."',
  publisher: 'National Coffee Association USA',
  title: 'Pour Over Coffee',
  url: 'https://www.aboutcoffee.org/brewing/pour-over/',
  context: '"hand-pour water over coffee grounds in a filter"（手沖：用手把水倒在濾器裡的咖啡粉上）。',
}
SOURCES['nca-espresso'] = {
  id: 'nca-espresso',
  citation: 'National Coffee Association USA, "Espresso."',
  publisher: 'National Coffee Association USA',
  title: 'Espresso',
  url: 'https://www.aboutcoffee.org/brewing/espresso/',
  context: '"uses high pressure to force nearly boiling water through finely ground coffee in about 20–30 seconds"（以高壓讓接近沸騰的水在約20–30秒內通過細研磨的咖啡粉）。',
}
SOURCES['nca-cold-brew'] = {
  id: 'nca-cold-brew',
  citation: 'National Coffee Association USA, "Cold Brew."',
  publisher: 'National Coffee Association USA',
  title: 'Cold Brew',
  url: 'https://www.aboutcoffee.org/brewing/cold-brew/',
  context: '"coffee made using room-temperature or cooler water"，浸泡「12–18+ hours」；冰咖啡則是 "brewed hot…then cooled"。',
}
SOURCES['foodnext-cold-brew'] = {
  id: 'foodnext-cold-brew',
  citation: '《食力 foodNEXT》，2017年10月20日（冷萃咖啡與冰滴咖啡的差別）。',
  publisher: '食力 foodNEXT',
  title: '食力 2017年10月20日報導',
  url: 'https://www.foodnext.net/life/lifesafe/paper/4357992699',
  context: '冷萃：「注入冷水，於低溫環境中浸泡至少約12小時」；冰滴：「利用5度C以下的冰水混合物…滴入咖啡粉…一點一點滴漏出萃取液」。',
}

// 魷魚羹飲食文化（1945–1980 廟口的魷魚羹攤、2000–現在的老潘魷魚羹）
// published：出版或更新時間；usage：這筆資料在本站支持哪些內容（實訪與食記只支持該次的記錄）
SOURCES['moe-jiu-hi-kenn'] = {
  id: 'moe-jiu-hi-kenn',
  citation: '教育部《臺灣台語常用詞辭典》，「鰇魚羹」。',
  publisher: '教育部',
  title: '鰇魚羹',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/13049/',
  published: '線上辭典（2026年10月查閱）',
  usage: '魷魚羹的定義與台語讀音（jiû-hî-kenn）。',
  context: '釋義：「一種小吃，用魷魚作成的羹湯。」',
}
SOURCES['moe-jiu-hi'] = {
  id: 'moe-jiu-hi',
  citation: '教育部《臺灣台語常用詞辭典》，「鰇魚」。',
  publisher: '教育部',
  title: '鰇魚',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/13048/',
  published: '線上辭典（2026年10月查閱）',
  usage: '魷魚曬成乾、做為提鮮食材的說明。',
  context: '釋義：「魷魚。……時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一。」',
}
SOURCES['moe-kenn'] = {
  id: 'moe-kenn',
  citation: '教育部《臺灣台語常用詞辭典》，「羹」。',
  publisher: '教育部',
  title: '羹',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/12816/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「羹」的定義（異用字「焿」）。',
  context: '釋義：「芶芡而成的濃稠湯汁。」用例「花枝羹」；異用字「焿」。',
}
SOURCES['moe-biau-khau'] = {
  id: 'moe-biau-khau',
  citation: '教育部《臺灣台語常用詞辭典》，「廟口」。',
  publisher: '教育部',
  title: '廟口',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/19448/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「廟口」的定義與用例。',
  context: '釋義：「廟門口、廟前廣場。」用例：「廟口的榕樹跤不時都有一寡人佇遐泡茶、開講。」（廟口的榕樹下經常都有一些人在那裡泡茶、聊天。）',
}
SOURCES['moe-tiam-sim-tann'] = {
  id: 'moe-tiam-sim-tann',
  citation: '教育部《臺灣台語常用詞辭典》，「點心擔」。',
  publisher: '教育部',
  title: '點心擔',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/12456/',
  published: '線上辭典（2026年10月查閱）',
  usage: '小吃攤的台語說法。',
  context: '釋義：「賣點心小吃的攤販。」',
}
SOURCES['moe-sa-te'] = {
  id: 'moe-sa-te',
  citation: '教育部《臺灣台語常用詞辭典》，「沙茶」。',
  publisher: '教育部',
  title: '沙茶',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/3313/',
  published: '線上辭典（2026年10月查閱）',
  usage: '沙茶醬的一般說明（不是老潘的配方）。',
  context: '釋義：「用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料。多用於吃火鍋時的沾醬。」',
}
SOURCES['moe-hi-soo'] = {
  id: 'moe-hi-soo',
  citation: '教育部《臺灣台語常用詞辭典》，「魚酥」。',
  publisher: '教育部',
  title: '魚酥',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/14303/',
  published: '線上辭典（2026年10月查閱）',
  usage: '魚酥的一般說明（不是老潘的配方）。',
  context: '釋義之一：「一種臺灣常見的魚肉加工食品。將魚肉、魚骨打成漿，加入麵粉、地瓜粉和其他醬料混合，再切成條狀或片狀，油炸成酥脆的食品。」',
}
SOURCES['moe-tian-bu-la'] = {
  id: 'moe-tian-bu-la',
  citation: '教育部《重編國語辭典修訂本》，「甜不辣」。',
  publisher: '教育部',
  title: '甜不辣',
  url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=53563',
  published: '線上辭典（2026年10月查閱）',
  usage: '甜不辣的一般說明（不是老潘的配方）。',
  context: '釋義：「一種日式食品。為日語てんぷら的音譯。……今日臺灣一般所指的甜不辣，是指條狀或扁平狀的炸魚漿。」',
}
SOURCES['wiki-ci-sheng-gong'] = {
  id: 'wiki-ci-sheng-gong',
  citation: '維基百科，〈大稻埕慈聖宮〉。',
  publisher: '維基百科',
  title: '大稻埕慈聖宮',
  url: 'https://zh.wikipedia.org/zh-tw/%E5%A4%A7%E7%A8%BB%E5%9F%95%E6%85%88%E8%81%96%E5%AE%AE',
  published: '2026年9月25日修訂的版本',
  usage: '慈聖宮的現址、1910年遷建，以及廟前的小吃攤。',
  context: '「1910年，日本政府實施市區改正，廟宇遷移」，1914年重建完成；「今址位於保安街49巷17號」；「廟前則是一排老牌的小吃攤，如魩仔魚炒飯、原汁排骨湯、鯊魚煙（煙薰鯊魚肉）、毛蟹、汕頭包子、四神湯」。',
}
SOURCES['mirror-2025-squid'] = {
  id: 'mirror-2025-squid',
  citation: '裴偉，〈裴社長小吃手記6／萬華大稻埕的魷魚美食〉，《鏡週刊》，2025年8月。',
  publisher: '鏡週刊',
  title: '裴社長小吃手記6／萬華大稻埕的魷魚美食',
  url: 'https://www.mirrormedia.mg/story/20250820food002',
  published: '2025年8月（網頁顯示2025年8月28日最後更新）',
  usage: '專欄作者對魷魚羹興起的說法（不是學術考證）。',
  context: '「魷魚羹在70年代於萬華、大稻埕一帶興起，除了因為港口聚眾、喜歡這一味的人多，供貨源頭迪化街就在附近也是原因。」；「會把發泡好的魷魚，切絲拌進魚漿中，增加口感，慢慢促成如今魷魚羹的誕生。」',
}
SOURCES['mirror-2026-squid'] = {
  id: 'mirror-2026-squid',
  citation: '裴偉，〈裴社長小吃手記／老台北才懂的魷刃有魚〉，《鏡週刊》，2026年1月2日。',
  publisher: '鏡週刊',
  title: '裴社長小吃手記／老台北才懂的魷刃有魚',
  url: 'https://www.mirrormedia.mg/story/20251216food001',
  published: '2026年1月2日（網頁顯示的發布時間）',
  usage: '專欄作者對迪化街南北貨與乾魷魚的說法（不是學術考證）。',
  context: '「早期的大稻埕是航運港口，因為河港的條件，成為北部南北貨的集散地。」；「來自日本北海道、韓國，後來是阿根廷的大魷魚乾，當然是其中的重要商品。」',
}
SOURCES['fb-pannoodles'] = {
  id: 'fb-pannoodles',
  citation: '老潘魷魚羹 Pannoodles house，Facebook 粉絲專頁「關於」。',
  publisher: 'Facebook',
  title: '老潘魷魚羹 Pannoodles house',
  url: 'https://www.facebook.com/pannoodles/about/',
  published: '店家頁面（未標示日期；2026年10月查閱）',
  usage: '店家頁面的名稱。頁面上沒有創立年份，本站不填寫。',
  context: '頁面名稱：「老潘魷魚羹 Pannoodles house」。',
}
SOURCES['puddings-2023-pannoodles'] = {
  id: 'puddings-2023-pannoodles',
  citation: 'Pudding’s Life，〈台北迪化街美食│老潘魷魚羮》老店口味沙茶魷魚焿.甜不辣~大稻埕永樂市場對面〉，2023年實訪紀錄。',
  publisher: 'Pudding’s Life',
  title: '台北迪化街美食│老潘魷魚羮》老店口味沙茶魷魚焿.甜不辣~大稻埕永樂市場對面',
  url: 'https://puddings.tw/pannoodles/',
  published: '2023年（使用者提供的實訪年份；本次無法開啟頁面核對發表日期）',
  usage: '只支持該次實訪的記錄：店在「大稻埕永樂市場對面」，品項有沙茶魷魚羹與甜不辣。不當成最新的價格、營業時間或歷史文獻。',
  context: '依文章標題。本次開發時網站阻擋自動讀取，沒有逐句核對內文；文中的圖片未確認使用權，本站沒有使用。',
}
SOURCES['walkerland-2021-laopan'] = {
  id: 'walkerland-2021-laopan',
  citation: 'WalkerLand窩客島，〈【台北美食￭大同區】老潘魷魚羹 x 肉羹麵、魚酥麵&甜不辣〉，2021年2月19日。',
  publisher: 'WalkerLand窩客島',
  title: '老潘魷魚羹 x 肉羹麵、魚酥麵&甜不辣',
  url: 'https://www.walkerland.com.tw/article/view/288147',
  published: '2021年2月19日',
  usage: '只支持該次的食記：地址、魚酥、甜不辣、沙茶調味與褪色的招牌。',
  context: '地址「台北市大同區迪化街一段30號」；「整體就是以沙茶最為主要的調味」；「魚酥很新鮮的酥脆」；「招牌顏色已褪去」。',
}
SOURCES['andrewplus-laopan'] = {
  id: 'andrewplus-laopan',
  citation: '安魯魯的筆記本，〈老潘魷魚羹 迪化街美食〉。',
  publisher: '安魯魯的筆記本',
  title: '老潘魷魚羹 迪化街美食',
  url: 'https://blog.andrewplus.com/pannoodles/',
  published: '2024年1月26日發表（2026年9月19日更新）',
  usage: '只支持該篇食記：門口的攤車、桌上的調味料、品名「乾拌沙茶生魷魚」「沙茶魷魚羹米粉」與「內用區有冷氣開放」。文章標題提到的經營年數沒有其他資料可以核實，本站不採用；文中的營業時間與價格也不採用。',
  context: '地址「103台北市大同區迪化街一段30號」；「攤車在外頭」；「內用區有冷氣開放」；「桌子上的醋、胡椒粉、辣椒醬和餐具」；「「乾拌沙茶生魷魚」是限量款」；「沙茶魷魚羹米粉」。',
}
SOURCES['fonfood-laopan'] = {
  id: 'fonfood-laopan',
  citation: '瘋美食 FonFood，「老潘魷魚羹」店家頁面（網友食記摘錄）。',
  publisher: '瘋美食 FonFood',
  title: '老潘魷魚羹',
  url: 'https://www.fonfood.com/store/204261',
  published: '頁面彙整的食記多為2017年前後',
  usage: '只用來核對品名「魚酥羮」「魷魚羮」（網友食記的摘錄，不是店家公告的菜單）。',
  context: '頁面的官方菜單欄「目前沒有資訊」；彙整的食記摘錄中出現「魚酥羮」「肉羮湯」「魷魚羮」等品名。',
}

/* ── 米苔目的兩個年代版本：廟口的米苔目攤（1945–1980）與永樂米苔目（2000–現在） ── */
SOURCES['moe-bi-thai-bak'] = {
  id: 'moe-bi-thai-bak',
  citation: '教育部《臺灣台語常用詞辭典》，「目」（ba̍k）。',
  publisher: '教育部',
  title: '目',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/1854/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「米篩目」（米苔目）的台語寫法、讀音與詞義。',
  context: '「目」的第三個義項是「細孔」，用例：「米篩目」（bí-thai-ba̍k），「米篩的網目，也指篩出的米條食品」。',
}
SOURCES['tvbs-2013-temple-food'] = {
  id: 'tvbs-2013-temple-food',
  citation: '食尚玩家編輯部，〈美食雙雄廟口大飽走!大稻埕-霞海城隍廟.慈聖宮〉，《食尚玩家》，2013年4月26日。',
  publisher: '食尚玩家（TVBS）',
  title: '美食雙雄廟口大飽走!大稻埕-霞海城隍廟.慈聖宮',
  url: 'https://supertaste.tvbs.com.tw/review/322447',
  published: '2013年4月26日（網頁的店家資訊卡另有較新的地址）',
  usage: '只支持該次的報導：舊址、位置的描述與當時「40年老店」的說法（不當成查證過的開業年份）。',
  context: '「在永樂市場與霞海城隍廟間的巷子中，每到假日必排隊的40年老店「永樂米苔目」」；文中的地址是「台北市大同區永昌街7號」，頁面下方的店家資訊卡寫「台北市大同區民樂街111號」。',
}
SOURCES['tvbs-2013-apang'] = {
  id: 'tvbs-2013-apang',
  citation: '食尚玩家編輯部，〈一日北高 阿龐ㄟ國定呷飽日(上)〉，《食尚玩家》，2013年11月27日。',
  publisher: '食尚玩家（TVBS）',
  title: '一日北高 阿龐ㄟ國定呷飽日(上)',
  url: 'https://supertaste.tvbs.com.tw/review/323392',
  published: '2013年11月27日',
  usage: '只支持該次節目整理的品項：米苔目、嘴邊肉、脆腸（不代表現在的菜單）。',
  context: '標題「正宗古早味 手作米苔目」；店家「永樂米苔目」，標籤與描述「米苔目,嘴邊肉,脆腸」。',
}
SOURCES['bella-2021-yongle-market'] = {
  id: 'bella-2021-yongle-market',
  citation: 'Bella儂儂，〈大稻埕美食數不完！8間永樂市場美食，不只生魚片連雞捲都有，澎湃的道地好料都在這！〉，2021年10月2日（2024年7月16日更新）。',
  publisher: 'Bella儂儂',
  title: '大稻埕美食數不完！8間永樂市場美食',
  url: 'https://www.bella.tw/articles/travel&foodies/31577',
  published: '2021年10月2日（網頁顯示2024年7月16日更新）',
  usage: '只支持該次的整理：民樂街的地址、湯頭與小菜的品項（不當成最新的價格或菜單）。',
  context: '「帶點油蔥和韭菜香的米苔目，配上嘴邊肉、豬皮、油豆腐、菜頭…一堆小菜」；「吃完還能無限加大骨湯」；地址「臺北市大同區民樂街111號」。',
}
SOURCES['bella-2025-dadaocheng'] = {
  id: 'bella-2025-dadaocheng',
  citation: 'Bella儂儂，〈大稻埕美食地圖！8間「必吃老店」懶人包，從永樂市場吃到迪化街，一篇就夠〉，2025年8月10日。',
  publisher: 'Bella儂儂',
  title: '大稻埕美食地圖！8間「必吃老店」懶人包',
  url: 'https://www.bella.tw/articles/travel&foodies/53084/dadaocheng-food-guide',
  published: '2025年8月10日',
  usage: '媒體對店史的說法（創立年份、搬遷）與當次提到的品項；創立年份本站未核實。',
  context: '「從民國五十六年創立至今，已傳承三代」；「搬遷到民樂街後，永樂米苔目的環境更加寬敞明亮」；「湯頭以大骨熬製、加入油蔥提香」；「乾米苔目用的是經典甜辣醬＋醬油膏，再拌上韭菜蔥花」；黑白切有「腿庫皮、水煮三層肉、大腸頭、嘴邊肉」；地址「台北市大同區民樂街111號」。',
}

/* ── 黃玉階文史館（歷史商號：元珍豆醬店）與社團法人臺灣文化事業發展協會（2000–現在） ──
 * 每一筆另外記下 sourceDate（頁面標示的日期；沒有標示時為 null）、accessedAt（查閱日期）與 supports（這份資料支持的內容）。
 * 內文一律改寫摘要，不整段複製；臺灣記憶的頁面標示「不開放授權」，只引用事實、不引用原文。 */
const ACCESSED = '2026-10-23'

SOURCES['judicial-2024-tcda'] = {
  id: 'judicial-2024-tcda',
  citation: '臺灣桃園地方法院，〈公告臺灣桃園地方法院113年度法登社字第35號社團法人臺灣文化事業發展協會設立登記〉，司法院網站，2024年5月16日。',
  title: '公告臺灣桃園地方法院113年度法登社字第35號社團法人臺灣文化事業發展協會設立登記',
  publisher: '臺灣桃園地方法院（司法院網站刊登）',
  url: 'https://www.judicial.gov.tw/tw/cp-144-1090248-5ae66-1.html',
  sourceDate: '2024-05-16',
  accessedAt: ACCESSED,
  published: '2024年5月16日（民國113年5月16日）',
  supports: ['協會正式名稱', '內政部許可設立日期 2023-10-18', '法人設立登記日期 2024-05-16', '宗旨摘要'],
  usage: '只支持協會的名稱、許可與登記日期及宗旨。公告沒有提到黃玉階、元珍豆醬店或文史館，不能用來說明協會與文史館的關係。',
  context: '登記事項：內政部112年10月18日台內團字第1120044388號函許可；113年5月16日登記於法人登記簿。宗旨大意為保存臺灣文化記憶、推展文化基礎調研、人才培訓與教育推廣。公告另列有事務所地址與理監事姓名，本站不轉載。',
}
SOURCES['tcmb-huang-yujie'] = {
  id: 'tcmb-huang-yujie',
  citation: '國家文化記憶庫，〈黃玉階〉（建檔單位：衛生福利部國家中醫藥研究所）。',
  title: '黃玉階',
  publisher: '文化部國家文化記憶庫；建檔單位：衛生福利部國家中醫藥研究所',
  url: 'https://tcmb.culture.tw/zh-tw/detail?id=488078&indexCode=Culture_People',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '頁面未標示日期（2026年10月查閱）',
  supports: ['生卒年 1850–1918', '1882年遷居大稻埕', '經營醬菜業', '漢醫救治霍亂、鼠疫等疫病', '推廣放足、斷髮', '首張漢醫執照（記為1901年）'],
  usage: '人物的基本經歷。首張執照的年份與臺灣記憶不同，本站並列兩種記載。',
  context: '人物條目：生於彰化大肚堡五汊港（今臺中市梧棲區），1882年遷居大稻埕；除經營醬菜業外，精通漢醫，日治時期奔走救治霍亂、鼠疫，不收謝禮；推動放足、斷髮等社會革新；先天道耆宿。',
}
SOURCES['ncl-huang-yujie'] = {
  id: 'ncl-huang-yujie',
  citation: '張子文，〈黃玉階〉，《臺灣歷史人物小傳—明清暨日治時期》（國家圖書館，2003年12月），國家圖書館「臺灣記憶」網站。',
  title: '黃玉階',
  publisher: '國家圖書館（臺灣記憶）',
  url: 'https://tm.ncl.edu.tw/article?u=016_002_0000295900',
  sourceDate: '2003-12',
  accessedAt: ACCESSED,
  published: '紙本書2003年12月出版（網頁未標示日期）',
  supports: ['1882年（光緒八年）遷居大稻埕', '經營醬菜坊', '1897年取得中醫師執照', '臺北天然足會、斷髮不改裝會會長', '1900–1917年任大稻埕區長'],
  usage: '人物的經歷與社會改革。頁面標示「不開放授權」，本站只摘要事實，不引用原文。',
  context: '人物小傳：光緒八年遷居臺北大稻埕，經營醬菜坊並行醫；1897年獲總督府頒發執照；被奉為臺北天然足會、斷髮不改裝會的會長；1900至1917年間擔任大稻埕區長。',
}
SOURCES['ith-primary-education'] = {
  id: 'ith-primary-education',
  citation: '中央研究院臺灣史研究所檔案館，〈初等教育〉（館藏選粹：日治時期臺灣影像紀實）。',
  title: '初等教育',
  publisher: '中央研究院臺灣史研究所檔案館',
  url: 'https://archives.ith.sinica.edu.tw/collections_con.php?no=34',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '頁面未標示日期（2026年10月查閱）',
  supports: ['日治時期初等教育的三個時期', '1898年國語傳習所改為公學校與小學校', '1922年修訂臺灣教育令', '1941年改為國民學校'],
  usage: '日治時期初等教育制度的背景。頁面沒有提到大稻埕的學校或黃玉階。',
  context: '分期：1895–1922年日臺分離、1922–1941年日臺共學制、1941–1945年國民學校時期。領臺之初設國語傳習所；1898年改為公學校（臺籍兒童）與小學校（日籍兒童）。',
}
SOURCES['merit-2026-huang-yujie'] = {
  id: 'merit-2026-huang-yujie',
  citation: '莊曉明，〈【醫者仁心】黃玉階文史館〉，《人間福報》，2026年7月13日。',
  title: '【醫者仁心】黃玉階文史館',
  publisher: '人間福報',
  url: 'https://www.merit-times.com.tw/NewsPage.aspx?unid=938353',
  sourceDate: '2026-07-13',
  accessedAt: ACCESSED,
  published: '2026年7月13日',
  supports: ['元珍豆醬店如今成為黃玉階文史館', '門口掛「元珍」與「源珍」兩塊招牌', '醬缸、「學貫中西」匾額與人體解剖圖', '三窗四柱的立面'],
  usage: '文史館與歷史商號的關係、兩種店名的說法與館內陳設。文章沒有寫營運單位、開館日、門牌與開放時間；文中只出現一次的說法（例如請願設立女子分校）本站列為待核實。',
  context: '文章寫到：文史館位在大稻埕靠近碼頭的巷弄；百年前的元珍豆醬店如今是黃玉階文史館；門口有「元珍」「源珍」兩塊招牌，耆老口述稱「源珍」、帳冊上寫「元珍」；館內有醬缸、「學貫中西」匾額與人體解剖圖。',
}

/* ── 迪化街一段329號店屋（稻舍 Rice & Shine）與北街米業 ── */
SOURCES['moc-329-shophouse'] = {
  id: 'moc-329-shophouse',
  citation: '文化部文化資產開放資料，〈迪化街一段329號店屋〉（歷史建築；國家文化資產網紀錄 20200514000006，經「諸彼特開放資料閱讀網」轉載）。',
  title: '迪化街一段329號店屋',
  publisher: '文化部（開放資料；管理單位臺北市政府）',
  url: 'https://data.zhupiter.com/oddt/11362669/%E8%BF%AA%E5%8C%96%E8%A1%97%E4%B8%80%E6%AE%B5329%E8%99%9F%E5%BA%97%E5%B1%8B/',
  sourceDate: '2020-04-28',
  accessedAt: ACCESSED,
  published: '登錄（註冊）時間 2020年4月28日',
  supports: ['歷史建築', '建立年代 1907 年', '2020-04-28 登錄', '大稻埕北段日治時期為米產業中心', '與331號原相通、唐家米行'],
  usage: '只支持建築的身分、建立年代、登錄日期與簡介；頁面沒有建築形式的描述與後來的用途。',
  context: '簡介大意：大稻埕北段於日治時期為米產業中心，本建物與鄰房331號原相通，當時為唐家米行。',
}
SOURCES['taiwannews-2022-rice-shine'] = {
  id: 'taiwannews-2022-rice-shine',
  citation: '台灣英文新聞（中央社稿），〈北市「老房子文化運動」活化22處文資　台灣大稻埕百年店屋重生〉，2022年6月8日。',
  title: '北市「老房子文化運動」活化22處文資　台灣大稻埕百年店屋重生',
  publisher: '台灣英文新聞（引述中央社）',
  url: 'https://www.taiwannews.com.tw/ch/news/4563917',
  sourceDate: '2022-06-08',
  accessedAt: ACCESSED,
  published: '2022年6月8日',
  supports: ['唐益興米行 1916 年由唐塗薩創立', '2014 年唐家後代捐贈市府', '負責人葉守倫、改造為米食文化餐館', 'URS 示範基地、老房子文化運動剪綵'],
  usage: '稻舍的由來與活化經過（負責人的介紹）。',
  context: '副市長為稻舍與貝殼好室剪綵；稻舍前身為大正五年唐塗薩創立的唐益興米行，唐家後代2014年捐給北市府，由葉守倫接手維護經營。',
}
SOURCES['pts-2022-rice-shine'] = {
  id: 'pts-2022-rice-shine',
  citation: '公視新聞網，〈迪化街老屋活化再利用 餐飲文化延續米行精神〉，2022年6月8日。',
  title: '迪化街老屋活化再利用 餐飲文化延續米行精神',
  publisher: '公共電視（公視新聞網）',
  url: 'https://news.pts.org.tw/article/584613',
  sourceDate: '2022-06-08',
  accessedAt: ACCESSED,
  published: '2022年6月8日',
  supports: ['老屋曾是碾米廠、約2020年列為歷史建築', '保留碾米廠氛圍、陳列碾米機等器物', '稻米文化策展與米食餐飲'],
  usage: '稻舍的空間與展示（碾米器物、策展）。',
  context: '營運團隊修復老屋，保留碾米廠的歷史氛圍，屋內陳列碾米機等器物，並規畫稻米文化策展。',
}
SOURCES['traveler-2019-rice-shine'] = {
  id: 'traveler-2019-rice-shine',
  citation: '洪禎璐，〈看台北迪化街紅磚洋樓的華麗變身，現在老碾米行也能「麻雀變鳳凰」〉，《TRAVELER Luxe 旅人誌》，2019年7月21日。',
  title: '看台北迪化街紅磚洋樓的華麗變身，現在老碾米行也能「麻雀變鳳凰」',
  publisher: 'TRAVELER Luxe 旅人誌',
  url: 'https://www.travelerluxe.com/article/desc/190002766',
  sourceDate: '2019-07-21',
  accessedAt: ACCESSED,
  published: '2019年7月21日',
  supports: ['迪化街北段碾米行全盛近五十家', '兩進兩層、過廊相通、各有木梯', '第一進一樓左邊碾米機、右邊堆白米', '天井的碾米流程插畫', '葉守倫為葉晉發米行（1923）後代'],
  usage: '北街碾米行的數量與這棟店屋的空間配置；文中的營業時間與價格本站不採用。',
  context: '迪化街北段為碾米行聚集地，全盛時期將近五十家；建築為兩進兩層樓，第一進與第二進之間有過廊相通。',
}
SOURCES['cna-2020-kuo-hsueh-hu'] = {
  id: 'cna-2020-kuo-hsueh-hu',
  citation: '趙靜瑜，〈104歲的時光旅人 郭雪湖的心靈風景〉，中央社《文化+》，2020年6月20日。',
  title: '104歲的時光旅人 郭雪湖的心靈風景',
  publisher: '中央通訊社',
  url: 'https://www.cna.com.tw/culture/article/20200620w004',
  sourceDate: '2020-06-20',
  accessedAt: ACCESSED,
  published: '2020年6月20日',
  supports: ['《南街殷賑》1930 年', '描繪迪化街霞海城隍廟口的中元普渡', '臺展得獎、臺北市立美術館典藏', '從寶香齋二樓的窗戶看南街'],
  usage: '只用來介紹作品的年份、題材與典藏；本站不重製畫作的圖像。',
  context: '南街即今日迪化街，「殷賑」取日語熱鬧繁榮之意；畫中有乾元藥行、寶香齋等招牌。',
}
SOURCES['moe-dou'] = {
  id: 'moe-dou',
  citation: '教育部《重編國語辭典修訂本》，「斗」。',
  title: '斗',
  publisher: '教育部',
  url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=1989&q=1&word=%E6%96%97',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '線上辭典（2026年10月查閱）',
  supports: ['斗是計算容量的單位，十升為一斗', '「米斗」為形狀像斗的器具'],
  usage: '米斗與斗、升的計量。',
  context: '量詞：計算容量的單位，十升為一斗、十斗為一石；另一義項為形狀像斗的器具，例詞「米斗」。',
}
SOURCES['moe-long'] = {
  id: 'moe-long',
  citation: '教育部《重編國語辭典修訂本》，「礱」。',
  title: '礱',
  publisher: '教育部',
  url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=3875&q=1&word=%E7%A4%B1',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '線上辭典（2026年10月查閱）',
  supports: ['礱是磨去穀殼的器具'],
  usage: '碾米的「脫殼」。',
  context: '一種用來磨去穀殼的器具，形狀似磨，具有齒痕，多以木料製成。',
}
SOURCES['moe-caomi'] = {
  id: 'moe-caomi',
  citation: '教育部《重編國語辭典修訂本》，「糙米」。',
  title: '糙米',
  publisher: '教育部',
  url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=141450&q=1&word=%E7%B3%99%E7%B1%B3',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '線上辭典（2026年10月查閱）',
  supports: ['糙米是稻去殼後碾得不精的米'],
  usage: '碾米的「糙米」。',
  context: '稻去殼後，碾得不精的米。',
}
SOURCES['moe-jingmiji'] = {
  id: 'moe-jingmiji',
  citation: '教育部《重編國語辭典修訂本》，「精米機」（以「精米」檢索）。',
  title: '精米機',
  publisher: '教育部',
  url: 'https://dict.revised.moe.edu.tw/search.jsp?md=1&word=%E7%B2%BE%E7%B1%B3',
  sourceDate: null,
  accessedAt: ACCESSED,
  published: '線上辭典（2026年10月查閱）',
  supports: ['精米機去除糙米的米糠層，使成為白米'],
  usage: '碾米的「精米」。',
  context: '一種農業機械，用來去除糙米的米糠層，使成為白米。',
}
/* ── 廟口的豆花攤與糕粿攤（1945–1980，飲食文化情境示意） ── */
SOURCES['moe-oo-kue'] = {
  id: 'moe-oo-kue',
  citation: '教育部《臺灣台語常用詞辭典》，「芋粿」。',
  publisher: '教育部',
  title: '芋粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/3486/',
  published: '線上辭典（2026年10月查閱）',
  usage: '芋粿的定義與台語讀音（ōo-kué）。',
  context: '釋義：「臺灣小吃的一種。以米漿和芋頭為主要材料，蒸熟後食用。」',
}

/* ── 十字軒糕餅舖（延平北路二段68號） ── */
SOURCES['mirrormedia-2024-shizixuan'] = {
  id: 'mirrormedia-2024-shizixuan',
  citation: '呂明潔報導，《鏡週刊》，2024年8月1日。',
  publisher: '鏡週刊',
  title: '十字軒糕餅舖創業與傳承報導',
  url: 'https://www.mirrormedia.mg/story/20240801bus001',
  published: '2024年8月1日',
  usage: '創辦人邱炳星的學藝與創業經過、家族傳承、全盛時期的經營規模，與壽桃、漢餅的銷售。',
  context:
    '記載創辦人邱炳星12歲到日本人開的麵包店學藝，先做西點麵包，後來接做婚嫁用的漢餅，再因鄰近霞海城隍廟做起壽桃生意；第二代邱獻德、第三代邱易為接手；全盛時期漢餅、西點、包子分開設廠，師傅近20位；壽桃是銷量最好的商品，全盛時期一天可賣超過一萬顆；文中提及「1920年代」創業，店招寫經營94年（以2024年計）。',
}
SOURCES['moe-man-yue'] = {
  id: 'moe-man-yue',
  citation: '教育部《重編國語辭典修訂本》，「滿月」。',
  publisher: '教育部',
  title: '滿月',
  url: 'https://www.moedict.tw/a/%E6%BB%BF%E6%9C%88.json',
  published: '線上辭典（2026年10月查閱）',
  usage: '「滿月」的定義：嬰兒出生滿一個月，也稱「彌月」。',
  context: '釋義：初生的嬰兒滿一個月，稱為「滿月」，也稱為「彌月」。',
}
SOURCES['moe-shou-yan'] = {
  id: 'moe-shou-yan',
  citation: '教育部《臺灣台語常用詞辭典》，「收瀾」。',
  publisher: '教育部',
  title: '收瀾',
  url: 'https://www.moedict.tw/t/%E6%94%B6%E7%80%9E.json',
  published: '線上辭典（2026年10月查閱）',
  usage: '「收瀾」（收涎）的做法：嬰兒滿四個月時以紅絲線串口酥餅在脖子上，一一咬餅，祈求好養育。',
  context: '釋義提到台灣習俗：嬰兒滿四個月時，用紅絲線串起口酥餅掛在脖子上，讓嬰兒逐一咬餅，並有「收瀾收離離，囡仔好育飼」的吉祥話。',
}
SOURCES['moe-xi-bing'] = {
  id: 'moe-xi-bing',
  citation: '教育部《重編國語辭典修訂本》，「喜餅」。',
  publisher: '教育部',
  title: '喜餅',
  url: 'https://www.moedict.tw/a/%E5%96%9C%E9%A4%A0.json',
  published: '線上辭典（2026年10月查閱）',
  usage: '「喜餅」的定義：訂婚時男方贈送女方的禮餅。',
  context: '釋義：訂婚時，男方贈送女方的禮餅，分贈親友以示告知婚事。',
}
SOURCES['moe-shou-tao'] = {
  id: 'moe-shou-tao',
  citation: '教育部《重編國語辭典修訂本》，「壽桃」。',
  publisher: '教育部',
  title: '壽桃',
  url: 'https://www.moedict.tw/a/%E5%A3%BD%E6%A1%83.json',
  published: '線上辭典（2026年10月查閱）',
  usage: '「壽桃」的定義：祝壽時所用的鮮桃或麵製桃形食品。',
  context: '釋義：祝壽時所用的鮮桃，或麵粉製成桃形、象徵長壽的食品。',
}

/* ── 茶的主線：大稻埕茶業背景（查證紀錄見 docs/research/tea-export-origins.md） ── */
SOURCES['tshs-zhang-tamsui-port'] = {
  id: 'tshs-zhang-tamsui-port',
  citation: '張建隆，〈淡水港史話：從早期淡水港到滬尾設關開埠〉，新北市立淡水古蹟博物館館學刊。',
  publisher: '新北市立淡水古蹟博物館',
  title: '淡水港史話：從早期淡水港到滬尾設關開埠',
  url: 'https://www.tshs.ntpc.gov.tw/files/file_pool/1/0G258614562811657139/36%E5%BC%B5%E5%BB%BA%E9%9A%86%E3%80%88%E6%B7%A1%E6%B0%B4%E6%B8%AF%E5%8F%B2%E8%A9%B1%EF%BC%9A%E5%BE%9E%E6%97%A9%E6%9C%9F%E6%B7%A1%E6%B0%B4%E6%B8%AF%E5%88%B0%E6%BB%AC%E5%B0%BE%E8%A8%AD%E9%97%9C%E9%96%8B%E5%9F%A0%E3%80%89.pdf',
  published: '館學刊論文（PDF，無出版日期；2026年10月查閱）',
  context: '1858年天津條約後以淡水河口的滬尾為開埠地點；同治元年6月22日（1862年7月）滬尾正式開關徵稅；1861年12月怡和檔記有800擔茶自滬尾出口。',
}
SOURCES['ntcri-73-tea-road'] = {
  id: 'ntcri-73-tea-road',
  citation: '陳右人，〈臺灣茶都巡禮—茶的第一條文化路徑〉，《臺灣工藝》第73期，國立臺灣工藝研究發展中心，2019年6月。',
  publisher: '國立臺灣工藝研究發展中心',
  title: '臺灣茶都巡禮—茶的第一條文化路徑',
  url: 'https://themefile.culture.tw/ntcri/quarterly/files/b325c31d-22be-4963-9590-769b90ab91e0.pdf',
  published: '2019年6月',
  context: '1860年淡水開港；陶德（John Dodd）1868年將茶廠遷到大稻埕；1865年定為臺茶出口元年；臺茶外銷量由1865年130餘公噸增至1885年近7,500公噸，1878年茶葉出口額超過蔗糖；重慶北路對街數家茶行均為林華泰系列；重慶北路二段的茶葉公園是閩客茶商與茶農交易的場所。',
}
SOURCES['chen-ciyu-li-family-2015'] = {
  id: 'chen-ciyu-li-family-2015',
  citation: '陳慈玉，〈買辦から資本家へ：日本統治期台北・大稲埕の李家〉，《立命館経済学》第63卷第5・6號，2015年3月。',
  publisher: '立命館大学経済学会',
  title: '買辦から資本家へ：日本統治期台北・大稲埕の李家',
  url: 'https://ritsumei.repo.nii.ac.jp/record/1883/files/E63_56chen.pdf',
  published: '2015年3月',
  context: '李春生生平；陶德1866年自安溪移植茶樹、貸款農民；1896年1月日人調查大稻埕茶商252店、從業3,612人；日治時期對美輸出烏龍茶、對華南與南洋輸出包種茶。',
}
SOURCES['th-li-chunsheng-memoir'] = {
  id: 'th-li-chunsheng-memoir',
  citation: '國史館臺灣文獻館電子報，〈李春生之生平自敘〉，第238期。',
  publisher: '國史館臺灣文獻館',
  title: '李春生之生平自敘',
  url: 'https://www.th.gov.tw/Epaper_Content/238/5615/',
  published: '電子報（無日期；2026年10月查閱）',
  context: '收錄1895年李春生履歷原文：「迨三十歲（1866年），復受英商寶順行（Dodd & Co.）重盟，東渡在台北」；1866年陶德派李春生自安溪採辦茶苗。',
}
SOURCES['culture-taipei-walk-dadaocheng-2018'] = {
  id: 'culture-taipei-walk-dadaocheng-2018',
  citation: '臺北市政府文化局，《文化臺北─走讀大稻埕》行旅手冊，2018年3月。',
  publisher: '臺北市政府文化局',
  title: '文化臺北─走讀大稻埕',
  url: 'https://www-ws.gov.taipei/001/Upload/686/relfile/55437/8338380/6ff7fc16-9086-4ab7-9f54-6a69cc045c5f.pdf',
  published: '2018年3月',
  context: '1868年杜德與李春生改在大稻埕設精製廠，隔年送茶至紐約；粗茶自大稻埕碼頭卸下、人力載往茶行精製，再以 Formosa 之名出口；全盛時期超過250間茶行。',
}
SOURCES['tcmb-tea-trade'] = {
  id: 'tcmb-tea-trade',
  citation: '國家文化記憶庫，〈臺灣茶葉進出口脈絡〉。',
  publisher: '文化部國家文化記憶庫',
  title: '臺灣茶葉進出口脈絡',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Object&id=501798',
  published: '2020年6月登入',
  context: '1869年臺灣烏龍茶開始直銷美國；1881年吳福元在大稻埕設源隆行專製包種茶；1889年劉銘傳命組「茶郊永和興」；臺茶至1980年前仍為重要外銷農產，之後因新台幣升值、工資上漲轉為內銷。',
}
SOURCES['curation-dadaocheng-tea'] = {
  id: 'curation-dadaocheng-tea',
  citation: '國家文化記憶庫線上策展，〈大稻埕茶葉與台灣的過去〉。',
  publisher: '文化部國家文化記憶庫',
  title: '大稻埕茶葉與台灣的過去',
  url: 'https://curation.culture.tw/curation/public?id=3864',
  published: '線上策展（無日期；2026年10月查閱）',
  context: '1885至1893年間由大稻埕輸出的茶葉占臺灣外銷金額60%以上，1886年達74.9%；日治時期日商轉以日本、東南亞為主要市場；戰後出口泰國、馬來西亞、新加坡、印尼等僑鄉。',
}
SOURCES['tcmb-baozhong-tea'] = {
  id: 'tcmb-baozhong-tea',
  citation: '國家文化記憶庫，〈臺灣條形包種茶發展介紹〉。',
  publisher: '文化部國家文化記憶庫',
  title: '臺灣條形包種茶發展介紹',
  url: 'https://tcmb.culture.tw/zh-tw/detail?id=222639',
  published: '線上典藏（無日期；2026年10月查閱）',
  context: '1885年安溪人王水錦、魏靜時至南港研製，約1912年條形包種茶製法成功，為南港包種茶起源，後傳至文山區。',
}
SOURCES['tcmb-chaoyang-tea-park'] = {
  id: 'tcmb-chaoyang-tea-park',
  citation: '阮素芬，國家文化記憶庫，〈大稻埕最重要的茶葉交易市場-朝陽茶葉公園〉。',
  publisher: '文化部國家文化記憶庫',
  title: '大稻埕最重要的茶葉交易市場-朝陽茶葉公園',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Place&id=463916',
  published: '線上典藏（無日期；2026年10月查閱）',
  context: '清代茶葉靠淡水河船運集散，茶廠集中淡水河與河頭溝（今西寧北路）之間，外銷激增後沿民生西路東擴；朝陽茶葉公園昔日為茶葉仲介（茶猴）聚集的交易中心。',
}
SOURCES['twcenter-muzha-tea-2001'] = {
  id: 'twcenter-muzha-tea-2001',
  citation: '溫振華，〈木柵茶史〉，吳三連台灣史料基金會，2001年7月9日。',
  publisher: '吳三連台灣史料基金會',
  title: '木柵茶史',
  url: 'https://www.twcenter.org.tw/?p=1678',
  published: '2001年7月9日',
  context: '1860年淡水開放為通商口岸；1869年名茶由淡水出口運銷美國；日本統治後透過株式會社貸款茶農驅逐洋行資本。',
}
SOURCES['cna-tea-thailand-2025'] = {
  id: 'cna-tea-thailand-2025',
  citation: '呂欣憓，〈台灣茶葉飄香過海 串連台泰百年貿易史〉，中央社，2025年2月22日。',
  publisher: '中央通訊社',
  title: '台灣茶葉飄香過海 串連台泰百年貿易史',
  url: 'https://www.cna.com.tw/news/ahel/202502220105.aspx',
  published: '2025年2月22日',
  context: '日治時期台灣茶商派人駐曼谷，包種茶出口曼谷量大；有記名茶有日治時期出口泰國的紀錄；曼谷老城區「三罐標有記茶行」由王家第四代經營。',
}
SOURCES['panorama-dadaocheng-1981'] = {
  id: 'panorama-dadaocheng-1981',
  citation: '王春謀，〈大稻埕〉，《台灣光華雜誌》，1981年3月。',
  publisher: '台灣光華雜誌',
  title: '大稻埕',
  url: 'https://www.taiwan-panorama.com/Articles/Details?Guid=2bd283f2-8b5d-4264-91b4-33b742bfe082',
  published: '1981年3月',
  context: '淡水河淤積使艋舺碼頭水道變淺，大稻埕碼頭取代艋舺；1887年劉銘傳指定大稻埕為外商居留地；揀茶的婦女在堆塞街衢廊下的茶袋、茶箱中穿梭。',
}

/* ── 林華泰茶行（查證紀錄見 docs/research/lin-hua-tai.md） ── */
SOURCES['linhuatai-site'] = {
  id: 'linhuatai-site',
  citation: '林華泰茶行官方網站，〈基本簡介〉、〈百年老店林華泰〉、〈下一個百年〉、〈林華泰的歷史 1/5–5/5〉，2016年1月。',
  publisher: '林華泰茶行',
  title: '林華泰茶行官方網站',
  url: 'http://www.linhuatai-tw.com/zh/',
  published: '2016年1月（各篇張貼日）',
  context: '商標「THE OLDEST TEASHOP LIN HUATAI 1883」；自1883年起做毛茶再篩選、精製；現址重慶北路二段193號；「前店後廠」；茶葉以超大號圓鐵桶陳列、店裡近百個茶桶；第三代林大村1977年獲孝行楷模匾額。〈林華泰的歷史〉標明擷取自《林華泰茶行老三的故事》，是第四代林秀全的回憶，屬家族口述。',
}
SOURCES['ltn-linhuatai-2014'] = {
  id: 'ltn-linhuatai-2014',
  citation: '金仁晧，〈百年林華泰茶行鬧家變〉，自由時報，2014年11月16日。',
  publisher: '自由時報',
  title: '百年林華泰茶行鬧家變',
  url: 'https://news.ltn.com.tw/news/life/paper/830512',
  published: '2014年11月16日',
  context: '第三代林大村2003年過世；第四代四兄弟林秀峰、林茂森、林秀全、林茂祥；2011年林茂森在原店隔壁另開林茂森茶行；林華泰曾獲台北市觀光傳播局推薦為「百年老店」。',
}
SOURCES['discover-taipei-tea-shops-2012'] = {
  id: 'discover-taipei-tea-shops-2012',
  citation: 'Discover Taipei（臺北市政府觀光傳播局），"Your Guide to Taipei\'s Heritage Tea Shops"，2012年5月24日（聯合報電子報轉載）。',
  publisher: '臺北市政府觀光傳播局',
  title: "Your Guide to Taipei's Heritage Tea Shops",
  url: 'http://paper.udn.com/udnpaper/POH0056/216953/web/',
  published: '2012年5月24日',
  context: '林華泰1883年開業，是台北茶業最老字號之一；茶葉裝在大鐵桶裡、用老式秤量；全盛期大稻埕有200家茶業者；有記的奇種烏龍以文山包種炭焙而成；有記焙籠間40多個焙窟仍在使用。',
}

/* ── 有記名茶（查證紀錄見 docs/research/you-ji.md） ── */
SOURCES['wangtea-story'] = {
  id: 'wangtea-story',
  citation: '有記名茶官方網站，〈有記名茶的故事〉。',
  publisher: '有記名茶',
  title: '有記名茶的故事',
  url: 'https://wangtea.com.tw/long-story',
  published: '官方網站（無日期；2026年10月查閱）',
  context: '來自福建安溪產茶世家；1890年王敬輝在廈門開設「王有記茶莊」；1907年因台灣茶葉出口盛行來台，得淡水河水運之便；茶廠仍維持四十多個焙籠；小時候二樓是揀茶場，每天約四十多名女工揀茶；店內保留早年外銷泰國的英文、泰文商標與木箱。',
}
SOURCES['wangtea-transformation'] = {
  id: 'wangtea-transformation',
  citation: '有記名茶官方網站，〈轉型〉沿革年表。',
  publisher: '有記名茶',
  title: '轉型',
  url: 'https://wangtea.com.tw/transformation-zh',
  published: '官方網站（年表到2022年；2026年10月查閱）',
  context: '1907年孝謹公渡海來台；1948年以前建廠於建昌街11號（今貴德街）；1949年遷廠重慶北路二段64巷26號，為台北市登記第五家工廠；1975年設第一個內銷門市；2004年二樓改為藝文空間「清源堂」；2008年起清源堂每週六下午定期南管演奏。',
}
SOURCES['wangtea-store'] = {
  id: 'wangtea-store',
  citation: '有記名茶官方網站，〈台北大稻埕門市〉。',
  publisher: '有記名茶',
  title: '台北大稻埕門市',
  url: 'https://wangtea.com.tw/wangtea-dadaocheng-factory-zh',
  published: '官方網站（無日期；2026年10月查閱）',
  context: '一樓後方仍為精製茶廠，前半部2004年起整理為門市；二樓原為「揀茶樓」；仍在使用傳統木炭烘焙茶葉；現售文山包種茶、高山烏龍茶、奇種烏龍茶、鐵觀音、東方美人、綠茶、紅茶；早年主要外銷泰國、日本、歐美。',
}
SOURCES['tcmb-wangtea'] = {
  id: 'tcmb-wangtea',
  citation: '阮素芬，國家文化記憶庫，〈有記名茶〉（國立臺灣工藝研究發展中心建檔）。',
  publisher: '文化部國家文化記憶庫',
  title: '有記名茶',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Place&id=463821',
  published: '線上典藏（無日期；2026年10月查閱）',
  context: '1890年廈門「王有記茶莊」；1907年王孝謹來臺，在民生西路口附近設茶行經營出口、建昌街11號設精製茶廠；因泰國外銷業務激增，1949年遷現址；2004年整修廠房並保留整套茶葉精製的乾燥烘焙系統；1980年代後外銷逐漸萎縮，轉為自創品牌內銷。',
}
SOURCES['ntcri-80-wangtea-lab'] = {
  id: 'ntcri-80-wangtea-lab',
  citation: '賴佩君，〈持續烘、沖、拼？WANGTEA LAB將百年品牌基因玩出新風味〉，《臺灣工藝》第80期，國立臺灣工藝研究發展中心，頁46–51。',
  publisher: '國立臺灣工藝研究發展中心',
  title: '持續烘、沖、拼？WANGTEA LAB將百年品牌基因玩出新風味',
  url: 'https://themefile.culture.tw/ntcri/quarterly/files/5885213d-f33f-46cd-aaf1-3212819c251f.pdf',
  published: '《臺灣工藝》第80期（期刊日期未標示）',
  context: '炭焙工法：焙窟深58公分，以炭化稻殼點火燒成白灰為熱源，上置焙籠，日夜烘焙20天；「烘焙、沖泡、拼配」為三大關鍵；焙籠間昔日曾替對街洗衣店烘衣；竹編茶箱印有外銷的嘜頭。',
}
SOURCES['businesstoday-wangtea-2018'] = {
  id: 'businesstoday-wangtea-2018',
  citation: '邱璟綾，〈百工職人 大稻埕百年茶行 有記名茶〉，今周刊，2018年6月27日。',
  publisher: '今周刊',
  title: '百工職人 大稻埕百年茶行 有記名茶',
  url: 'https://www.businesstoday.com.tw/article/category/80392/post/201806260047/',
  published: '2018年6月27日',
  context: '精製流程：分級、揀梗、焙火、拼配、風選；焙窟以紅磚搭出成排的坑，以木炭和稻殼焙烤成炭灰；全盛時期大稻埕有超過200間茶行。',
}

/* ── 新芳春茶行（查證紀錄見 docs/research/xin-fang-chun.md） ── */
SOURCES['nchdb-xinfangchun'] = {
  id: 'nchdb-xinfangchun',
  citation: '文化部文化資產局國家文化資產網，〈新芳春茶行〉（直轄市定古蹟，2009年9月29日公告，北市文化二字第09830231500號）。',
  publisher: '文化部文化資產局',
  title: '新芳春茶行',
  url: 'https://nchdb.boch.gov.tw/assets/advanceSearch/monument/20090929000001',
  published: '2009年9月29日公告',
  context: '官方登錄：建物約創建於1930年代，是大稻埕茶外銷南洋的地點之一；三樓店屋、連續三崁街屋、水平帶狀女兒牆、三角形山頭與花草泥塑；結合茶行、烘焙茶工廠、倉庫、主人住宅四種機能，為當時臺北最大的茶工廠；正立面泥塑出自大稻埕名匠郭三川；族群以安溪人為主；是否收費：否。',
}
SOURCES['tcmb-xinfangchun'] = {
  id: 'tcmb-xinfangchun',
  citation: '阮素芬，國家文化記憶庫，〈新芳春茶行〉（國立臺灣工藝研究發展中心建檔）。',
  publisher: '文化部國家文化記憶庫',
  title: '新芳春茶行',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Place&id=475691',
  published: '線上典藏（無日期；2026年10月查閱）',
  context: '1918年王連河之父王芳群由泉州安溪舉家遷臺；1932年改組為「合資會社新芳春茶行」，1950年改組為「新芳春茶行兩合公司」；現址建築落成於1934年；王連河經營時期是包種茶外銷南洋（尤其泰國與安南）的重要茶葉公司之一；1974年王國忠接手；1970年代末受競爭業務萎縮，1990年代以後幾乎停滯；2005年3月登錄歷史建築、2009年9月指定市定古蹟；王國忠將洋樓捐贈臺北市政府。',
}
SOURCES['ntcri-77-xinfangchun'] = {
  id: 'ntcri-77-xinfangchun',
  citation: '賴佩君，〈活的茶葉故事館—新芳春茶行見證大稻埕茶業貿易風華〉，《臺灣工藝》第77期，國立臺灣工藝研究發展中心，頁52–57。',
  publisher: '國立臺灣工藝研究發展中心',
  title: '活的茶葉故事館—新芳春茶行見證大稻埕茶業貿易風華',
  url: 'https://themefile.culture.tw/ntcri/quarterly/files/d9a435c1-9d4e-4e5a-bddb-46a880f4fbc5.pdf',
  published: '《臺灣工藝》第77期（期刊日期未標示）',
  context: '三開間、三進、三層：一樓正廳是茶行、帳房與銷售空間，後進是精製茶的倉庫與加工廠；二樓是揀茶間、辦公室與會客廳；三樓是王家起居與公媽廳；一樓後進紅磚焙籠間保留數十個焙籠坑與竹籠；保留乾燥機、風選機；以包種茶外銷安南、暹羅、井裡汶；大稻埕外銷南洋的主力茶幾乎都是坪林的文山包種茶；總樓地板面積492坪。',
}
SOURCES['ntcri-77-xinfangchun-restoration'] = {
  id: 'ntcri-77-xinfangchun-restoration',
  citation: '賴佩君，〈新芳春茶行修復〉，《臺灣工藝》第77期，國立臺灣工藝研究發展中心，頁58–59。',
  publisher: '國立臺灣工藝研究發展中心',
  title: '新芳春茶行修復',
  url: 'https://themefile.culture.tw/ntcri/quarterly/files/3daec8d1-84dd-4a4d-9610-34fd6e7c592c.pdf',
  published: '《臺灣工藝》第77期（期刊日期未標示）',
  context: '融合中西特色的日治時期洋樓，穿心廊及日月雙井；門楣山牆的勳章與忍冬草泥塑出自郭三川；2011–2015年由興富發建設修復，恢復九成原貌。',
}
SOURCES['ltn-xinfangchun-2015'] = {
  id: 'ltn-xinfangchun-2015',
  citation: '游蓓茹，〈新芳春茶行古蹟修復落成〉，自由時報，2015年12月19日。',
  publisher: '自由時報',
  title: '新芳春茶行古蹟修復落成',
  url: 'https://news.ltn.com.tw/news/local/paper/941958',
  published: '2015年12月19日',
  context: '來自福建安溪的大稻埕茶商王連河自建，1934年興建，當時台北最大茶工廠；門牌原為民生西路303–309號，只留309號古蹟；2005年指定歷史建築、2009年改指定市定古蹟；2007年屋主陸續搬出；建商出資八千萬元、歷經四年修復；2015年12月18日落成典禮。',
}
SOURCES['pts-xinfangchun-2016'] = {
  id: 'pts-xinfangchun-2016',
  citation: '公視新聞，〈新芳春茶行開放參觀〉，2016年9月20日。',
  publisher: '公共電視',
  title: '新芳春茶行開放參觀',
  url: 'https://news.pts.org.tw/article/335377',
  published: '2016年9月20日',
  context: '混合閩南長屋型態與西洋立面外觀的洋樓；第三代王國忠將茶行產權捐贈北市府；展區保存近3000件文物；2016年9月20日起對外開放。',
}
SOURCES['zsdo-xinfangchun-2020'] = {
  id: 'zsdo-xinfangchun-2020',
  citation: '臺北市中山區公所，〈新芳春茶行〉，資料更新2020年12月25日。',
  publisher: '臺北市中山區公所',
  title: '新芳春茶行',
  url: 'https://zsdo.gov.taipei/News_Content.aspx?n=C2C1165AA5DF44C1&sms=C04230CB75259A56&s=85FB122CDF820142',
  published: '2020年12月25日更新',
  context: '2011至2015年修復，原屋主捐贈臺北市政府；文化局2016年5月接管、2016年9月20日推出特展；2018年委由台灣文創發展基金會經營，主軸為「活的茶葉故事館」、「茶文創發展平台」、「以茶會友」。',
}
SOURCES['travel-taipei-xinfangchun'] = {
  id: 'travel-taipei-xinfangchun',
  citation: '臺北旅遊網（臺北市政府觀光傳播局），"Sin Hong Choon"，2026年10月24日更新。',
  publisher: '臺北市政府觀光傳播局',
  title: 'Sin Hong Choon',
  url: 'https://www.travel.taipei/en/attraction/details/2430',
  published: '2026年10月24日更新',
  context: '1934年興建；免票進場；開放時間週三至週日10:00–18:00，週一、二休館。',
}
SOURCES['epochtimes-xinfangchun-2022'] = {
  id: 'epochtimes-xinfangchun-2022',
  citation: '鄧玫玲，〈沏一壺茶 聽古宅訴說茶行老故事〉，大紀元時報，2022年5月2日。',
  publisher: '大紀元時報',
  title: '沏一壺茶 聽古宅訴說茶行老故事',
  url: 'https://www.epochtimes.com.tw/n373347/',
  published: '2022年5月2日',
  context: '前身「芳春茶行」為王芳群與王珍春合資；向文山、南港茶農收購包種茶精製，銷往泰國；焙籠間曾布滿一百個坑穴，一天24小時高溫烘焙；二樓是女工揀茶的場所；1960年代後受進口茶競爭逐漸收起事業；大門對聯「芳尋顧渚 春採蒙山」。',
}

/* ── 寶順洋行與李春生（文化據點；查證紀錄見 docs/research/tea-export-origins.md） ── */
SOURCES['tshs-tamsui-customs-lesson'] = {
  id: 'tshs-tamsui-customs-lesson',
  citation: '新北市立淡水古蹟博物館，《行動展示教具 開港設關拚貿易-海關碼頭》教案。',
  publisher: '新北市立淡水古蹟博物館',
  title: '開港設關拚貿易-海關碼頭',
  url: 'https://www.tshs.ntpc.gov.tw/files/file_pool/1/0N088508798468306680/%E9%96%8B%E6%B8%AF%E8%A8%AD%E9%97%9C%E6%8B%9A%E8%B2%BF%E6%98%93%E6%95%99%E6%A1%88.pdf',
  published: '教案（PDF，無日期；2026年10月查閱）',
  context: '1858天津條約與1860北京條約開放安平、打狗、滬尾、雞籠；1861年英國副領事郇和決定以滬尾為最主要通商口岸；1872年後北臺有寶順、德記、怡記、和記、水陸五大洋行競爭茶葉外銷（轉錄臺灣大百科《外商洋行》）。',
}
SOURCES['taipei-gov-tea-tasting-2017'] = {
  id: 'taipei-gov-tea-tasting-2017',
  citation: 'Wang Rui-fen, "Tea Tasting in Taipei -- Savor a Sip in Dadaocheng", Taipei City Government, 2017年8月30日。',
  publisher: '臺北市政府',
  title: 'Tea Tasting in Taipei -- Savor a Sip in Dadaocheng',
  url: 'https://english.gov.taipei/News_Content.aspx?n=4FF938C7E036410F&s=3DB65D2882378503',
  published: '2017年8月30日',
  context: '1860年淡水開港；陶德雇用曾在廈門從事茶業的李春生為買辦；1869年兩艘大帆船載了將近13萬公斤的茶運往紐約；貴德街由李春生與林維源所建。',
}
SOURCES['taipei-pictorial-480-dihua'] = {
  id: 'taipei-pictorial-480-dihua',
  citation: '宋祖慈，〈臺北唯一老街 迪化街與大稻埕的歷史散步〉，《臺北畫刊》第480期。',
  publisher: '臺北市政府觀光傳播局',
  title: '臺北唯一老街 迪化街與大稻埕的歷史散步',
  url: 'http://www-ws.gov.taipei/001/Upload/public/MMO/READ/480_05.pdf',
  published: '《臺北畫刊》第480期（約2008年）',
  context: '艋舺人仍保守地排拒洋人時，大稻埕開設了洋行；劉銘傳劃定千秋、建昌街（今貴德街）為外僑區，是臺北第一條洋樓街；貴德街是聚集數十家茶行的「茶街」；李春生紀念教堂由李家後人所建。',
}
SOURCES['pct-li-chunsheng-church'] = {
  id: 'pct-li-chunsheng-church',
  citation: '台灣基督長老教會教會資料，〈李春生紀念教會〉。',
  publisher: '台灣基督長老教會',
  title: '李春生紀念教會',
  url: 'https://www.pct.org.tw/churchdata.aspx?strOrgNo=C03001',
  published: '2025年度資料',
  context: '李春生紀念教會：臺北市貴德街44號，設立日期1935年5月5日，隸屬台北中會。',
}
SOURCES['culture-taipei-2002-events'] = {
  id: 'culture-taipei-2002-events',
  citation: '臺北市政府文化局，〈2002年大事紀〉，資料更新2020年11月27日。',
  publisher: '臺北市政府文化局',
  title: '2002年大事紀',
  url: 'https://culture.gov.taipei/News_Content.aspx?n=FD864505B018E5BC&s=509246DB9BE516F8',
  published: '2020年11月27日更新',
  context: '2002年7月12日文獻會在貴德街李春生紀念教會舉辦「李春生與大稻埕茶商發展」座談會，與會者認為李春生打出「福爾摩莎烏龍茶」品牌外銷國際，使臺灣經濟重心由南往北發展。',
}
SOURCES['wolf-women-tea-2003'] = {
  id: 'wolf-women-tea-2003',
  citation: 'Arthur P. Wolf, "Women and Tea in the Taipei Basin",《臺灣史研究》第10卷第2期，2003年（摘要）。',
  publisher: '中央研究院臺灣史研究所',
  title: 'Women and Tea in the Taipei Basin',
  url: 'https://lawdata.com.tw/tw/detail.aspx?no=214265',
  published: '2003年',
  context: '茶業給予婦女婚姻以外的選擇，大稻埕婦女的結婚比例低於臺北盆地邊緣。',
}

// 台語讀音（glossary 的 taiwanese 欄位）：只加辭典有詞條、已實際開啟詞條頁核對的詞
SOURCES['moe-bi-thai-bak-entry'] = {
  id: 'moe-bi-thai-bak-entry',
  citation: '教育部《臺灣台語常用詞辭典》，「米篩目」。',
  publisher: '教育部',
  title: '米篩目',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/2798/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「米篩目」（米苔目）的台羅讀音 bí-thai-ba̍k。',
  context: '詞目「米篩目」，台羅 bí-thai-ba̍k；釋義為米苔目，一種臺灣傳統米食。',
}
SOURCES['moe-kue-tshe'] = {
  id: 'moe-kue-tshe',
  citation: '教育部《臺灣台語常用詞辭典》，「粿粞」。',
  publisher: '教育部',
  title: '粿粞',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/10732/',
  published: '線上辭典（2026年10月查閱）',
  usage: '「粿粞」的台羅讀音 kué-tshè（另有 ké-tshuè 的讀法）。',
  context: '詞目「粿粞」，名詞：糯米磨成漿後裝袋壓去水分成固體狀，可用來搓湯圓或做年糕的材料。',
}

// 第 5 階段 B：霞海城隍廟（查證紀錄：docs/research/xia-hai-cheng-huang.md）
// 內政部頁面無署名；nchdb 與廟方官網原頁未能開啟（憑證錯誤），引用時相關細節標「待核」
SOURCES['moi-xiahai-temple'] = {
  id: 'moi-xiahai-temple',
  citation: '內政部臺灣宗教文化地圖，〈大稻埕霞海城隍廟〉（文化資產）。',
  publisher: '內政部',
  title: '大稻埕霞海城隍廟',
  url: 'https://taiwangods.moi.gov.tw/html/cultural/3_0011.aspx?i=58',
  published: '無署名（2026年10月查閱，WebFetch 摘要讀取）',
  context: '源自泉州同安霞城；道光初年陳金絨迎奉金身來臺；早期在艋舺八甲庄建廟；咸豐三年（1853）頂下郊拚廟毀於火災、神像遷大稻埕；咸豐六年（1856）在現址籌建、咸豐九年（1859）完工；地址迪化街一段61號；1985年8月19日公告為古蹟（臺內民字第338095號）；民國60年（1971）一位老太太捐獻月下老人神像。',
}
SOURCES['moi-xiahai-folklore'] = {
  id: 'moi-xiahai-folklore',
  citation: '內政部臺灣宗教文化地圖，〈台北霞海城隍廟五月十三迎城隍〉（文化資產）。',
  publisher: '內政部',
  title: '台北霞海城隍廟五月十三迎城隍',
  url: 'https://taiwangods.moi.gov.tw/html/cultural/3_0011.aspx?i=212',
  published: '無署名（2026年10月查閱，WebFetch 摘要讀取；國家文化資產網原頁未能開啟）',
  context: '臺北市2010年7月26日公告登錄民俗（北市文化二字第09930815902號函），起源年代清光緒5年（1879）；流程：農曆五月初六放軍、五月十一夜間暗訪、五月十三聖誕遶境、五月十八收軍；駕前謝將軍、范將軍白晝右手持扇、左手持手絹；北管軒社、金獅團等陣頭；過去每年舉行，現改為三年一次。',
}
SOURCES['moi-xiahai-landscape'] = {
  id: 'moi-xiahai-landscape',
  citation: '內政部臺灣宗教百景，〈台北霞海城隍廟．五月十三迎城隍〉。',
  publisher: '內政部',
  title: '台北霞海城隍廟．五月十三迎城隍',
  url: 'https://taiwangods.moi.gov.tw/html/landscape/1_0011.aspx?i=13',
  published: '無署名（2026年10月查閱，WebFetch 摘要讀取）',
  context: '清道光元年（1821）一百多名泉州同安人搭船到艋舺，商人陳金絨供奉從同安帶來的霞海城隍神尊（1821年僅此一源）；1856年在現址籌建；慶典起源1879年；俗諺「五月十三人看人，迎神賽會甲天下」；民國60年（1971）增祀月下老人；現列臺北市定古蹟。',
}
SOURCES['nownews-2020-xiahai'] = {
  id: 'nownews-2020-xiahai',
  citation: '賴志昶，〈台北霞海城隍廟〉專訪報導，NOWnews，2020年12月29日發布、2021年12月23日更新。',
  publisher: 'NOWnews 今日新聞',
  title: '台北霞海城隍廟專訪報導',
  url: 'https://www.nownews.com/news/5149427',
  published: '2020年12月29日（2021年12月23日更新）',
  context: '咸豐六年由海內會陳姓族人與地方善信發起建廟，三年後落成；因械鬥自艋舺遷往大稻埕，起初安奉在糕餅舖中（單一來源）。',
}
SOURCES['gvm-city-2025-temples'] = {
  id: 'gvm-city-2025-temples',
  citation: 'Somebody Sue（普通人），〈見證近代台灣風起雲湧……三大廟宇由來〉，遠見《城市學》專欄，2025年5月25日。',
  publisher: '遠見《城市學》（媒體專欄，非學術文獻）',
  title: '見證近代台灣風起雲湧……三大廟宇由來',
  url: 'https://city.gvm.com.tw/article/121550',
  published: '2025年5月25日',
  context: '同安人早期在艋舺八甲庄（約今老松國小附近）建廟；頂下郊拚同安人落敗、廟付之一炬，神像被迫遷出；「霞海」名稱一說源自同安霞城城隍廟、另一說即「海內」之意（兩說並列）；1971年才開始供奉月老。',
}
SOURCES['pts-2024-xiahai'] = {
  id: 'pts-2024-xiahai',
  citation: '呂尚儒、莊浚佑，公視新聞網報導，2024年5月27日。',
  publisher: '公視新聞網',
  title: '霞海城隍廟迎城隍報導',
  url: 'https://news.pts.org.tw/article/697098',
  published: '2024年5月27日',
  context: '俗諺「三月痟媽祖、五月迎城隍」「五月十三人看人」。',
}
SOURCES['mirror-2024-xiahai'] = {
  id: 'mirror-2024-xiahai',
  citation: '楊越涵，〈傳統慶典創新再現〉，鏡週刊（台北畫刊性質稿件），2024年5月15日。',
  publisher: '鏡週刊',
  title: '傳統慶典創新再現',
  url: 'https://www.mirrormedia.mg/story/20240515cnt005',
  published: '2024年5月15日',
  context: '迎城隍可追溯至1879年，過去是北臺灣最大的遶境；農曆五月十一暗訪、五月十三遶境；現今由在地軒社自行發起夜間暗訪與迎城隍。',
}

// 第 5 階段 B：乾元藥行（查證紀錄：docs/research/qian-yuan-yao-hang.md）
SOURCES['ith-qian-yuan'] = {
  id: 'ith-qian-yuan',
  citation: '中央研究院臺灣史研究所檔案館，〈追溯迪化街百年老店林復振商行與乾元藥行〉之「二、乾元藥行」，2013年。',
  publisher: '中央研究院臺灣史研究所檔案館',
  title: '乾元藥行（館藏選粹）',
  url: 'https://archives.ith.sinica.edu.tw/collections_con.php?no=133',
  published: '2013年（2026年10月查閱，WebFetch 摘要讀取）',
  context: '創立於1896年（依1929年《臺灣日日新報》〈乾元藥行三十年開業記念披露〉報導）；創辦人張清河1917年過世；陳茂通（原為股東兼學徒）1917年接手、1936年8月病逝，曾任臺北本島人藥業組合長、藥郊聯合會會長；其後由股東朱樹勳、陳福經營；1960年陳金清富接手，家族後人延續至今；與長崎泰益號有生意往來；1928年向香港協元順訂購13件藥材；主要產品含平安散（治霍亂），1932年寄贈一千包到廈門。',
}
SOURCES['ith-dihua-stores-intro'] = {
  id: 'ith-dihua-stores-intro',
  citation: '陳秋瑾，〈追溯迪化街百年老店林復振商行與乾元藥行〉導言，中央研究院臺灣史研究所檔案館，2013年。',
  publisher: '中央研究院臺灣史研究所檔案館',
  title: '追溯迪化街百年老店林復振商行與乾元藥行（導言）',
  url: 'https://archives.ith.sinica.edu.tw/collections_list_02.php?no=23',
  published: '2013年',
  context: '迪化街以中藥材、南北乾貨、布料商聚集著稱；1860年淡水開港後外商設洋行經營茶葉；19世紀末大稻埕成為臺灣北部貨物集散中心；日治時期仍是本島人南北雜貨批發重鎮。',
}
SOURCES['wiki-qian-yuan'] = {
  id: 'wiki-qian-yuan',
  citation: '維基百科，〈乾元蔘藥行〉，最後修訂2023年2月14日。',
  publisher: '維基百科',
  title: '乾元蔘藥行',
  url: 'https://zh.wikipedia.org/wiki/%E4%B9%BE%E5%85%83%E8%94%98%E8%97%A5%E8%A1%8C',
  published: '2023年2月14日最後修訂',
  context: '創立年份記有1875年一說；創辦人張清河；立面頂端凸出山牆，以水平檐板取代常見的巴洛克花草紋飾，山牆下有牛眼窗，窗框飾人蔘圖案。',
}
SOURCES['trip-writers-2008-qianyuan'] = {
  id: 'trip-writers-2008-qianyuan',
  citation: '水瓶子，〈乾元蔘藥行百年風華盡在其中〉，水瓶子的城市慢步（個人部落格），2008年1月。',
  publisher: '水瓶子的城市慢步（個人部落格）',
  title: '乾元蔘藥行百年風華盡在其中',
  url: 'http://trip.writers.idv.tw/2008/01/blog-post_13.html',
  published: '2008年1月',
  context: '寫「1875(1896?)年成立」；位置迪化街一段71號；店面縱深約60公尺、三進，進與進之間有天井，供煮藥、晾曬、倉庫與生活；曾因煮藥失火，前兩進木樓板燒毀後改建；水平直線屋簷與竹節式壁柱為日治常見樣式；陳鳳鎮1994年接手、陳建忠1998年接手、陳建國2011年另創「上乾元蔘藥行」（以上皆單一來源）。',
}

// 第 6 階段 B：慈聖宮廟口（查證紀錄：docs/research/ci-sheng-gong-miaokou.md）
// 檢核：廟的遷建主線有圖資可佐證；廟口攤販的形成與各攤年代沒有官方或學術史料，只採「食物類型」的現況描述，不採店名、攤主與年份。
SOURCES['sinica-gis-2025-cisheng'] = {
  id: 'sinica-gis-2025-cisheng',
  citation: '中央研究院人社中心 GIS 專題中心，〈臺北天后宮及大稻埕慈聖宮搬遷歷程〉，2025年4月18日。',
  publisher: '中央研究院人社中心 GIS 專題中心',
  title: '臺北天后宮及大稻埕慈聖宮搬遷歷程',
  url: 'https://gis.rchss.sinica.edu.tw/mapclub_20250418/',
  published: '2025年4月18日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '慈聖宮從艋舺到大稻埕、再因市區改正遷至日新街的主線；「民國50年間」廟口攤販聚集的說法（待核）。',
  context:
    '嘉慶年間同安商人分靈媽祖、先供奉於艋舺八甲庄；1853年頂下郊拚後遷至大稻埕，文中寫1869年（同治八年）建於中街與南街交界；1909年6月25日起因市區改正拆除、遷至日新街農地，1914年重建完成改稱「大稻埕慈聖宮」；1905、1907、1910年的市區改正圖與全圖顯示廟址的變化。文中寫「民國50年間，因香火鼎盛，周邊攤販聚集成市集」，但沒有附史料。學術機構網頁，參考資料只列兩篇部落格／新聞專欄，各年份未附史料；本站標「待核」。',
}
SOURCES['tcma-cisheng-four-herb'] = {
  id: 'tcma-cisheng-four-herb',
  citation: '臺北市市場處，〈慈聖宮美食街——四神湯〉。',
  publisher: '臺北市市場處',
  title: '慈聖宮美食街——四神湯',
  url: 'https://www.tcma.gov.taipei/News_Content.aspx?n=19DD8FBEECB25BCF&sms=35E20F60B9AD033F&s=16E593A2A0980221',
  published: '官方網頁（未標示日期；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '四神湯攤的做法特色（豬肚為主、可選小腸、肝連、粉腸）；「攤家早年在迪化街口擺攤、後遷廟口」只當單一官方稿的待核例子，不點名店家。',
  context: '介紹廟口一攤四神湯：家族經營超過50年（同文另寫「70年來」，年數自相矛盾，本站不採）；第二代接手，父親的攤原在迪化街口，約近20年前遷至慈聖宮；招牌豬肚四神湯，可選肝連、粉腸、小腸。本站只採食物做法，不寫店名、攤主與年數。',
}
SOURCES['tvbs-supertaste-cisheng'] = {
  id: 'tvbs-supertaste-cisheng',
  citation: '食尚玩家編輯部，〈廟口榕樹下開吃！大稻埕慈聖宮5攤老店美食〉，《食尚玩家》（TVBS）。',
  publisher: '食尚玩家（TVBS）',
  title: '廟口榕樹下開吃！大稻埕慈聖宮5攤老店美食',
  url: 'https://supertaste.tvbs.com.tw/pack/347150',
  published: '媒體專題（未標示日期；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '廟口攤位的食物類型與做法特色：原汁排骨湯（湯清、排骨可選肥瘦）、肉粥（赤肉切塊、油蔥酥與芹菜）、白煮豬腳配麵線（湯或乾）；保安街49巷不到100公尺有十多家攤商。',
  context: '媒體食記，介紹廟口五攤的現況，各攤「超過50年」等年數沒有佐證；本站只採食物的做法特色，不採店名、年數與排名。',
}
SOURCES['ettoday-2018-cisheng'] = {
  id: 'ettoday-2018-cisheng',
  citation: '黃士原，〈大稻埕慈聖宮廟口小吃〉報導，ETtoday 旅遊雲，2018年7月10日。',
  publisher: 'ETtoday 旅遊雲',
  title: '大稻埕慈聖宮廟口小吃報導',
  url: 'https://travel.ettoday.net/article/1209337.htm',
  published: '2018年7月10日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '廟口攤位「數十年歷史，有些傳到第三代」的概述（未指明哪一攤）；現在廟口仍有排骨湯、肉粥、豬腳麵線、四神湯等攤。',
  context: '媒體食記；各攤的傳承代數與其他食記互相矛盾，本站不寫代數，也不採店名。',
}

// 第 6 階段 C：迪化街年貨大街與呷二嘴（查證紀錄：docs/research/dihua-nianhuo.md、docs/research/xia-er-zui.md）
// 檢核：年貨大街的起始年有市府新聞稿，構想由來與當年做法只見於重現 1995 年報導的二手文章，原報紙未直接查閱；
// 更早的南北貨史是二手整理；遊客與交易額數字、主辦局處、各年日期查無可靠出處，不採。
// 呷二嘴全為食記與部落格，1954 年各篇一致但皆無文件佐證，只當現況介紹。
SOURCES['taipei-gov-2025-nianhuo'] = {
  id: 'taipei-gov-2025-nianhuo',
  citation: '臺北市政府工務局，〈南北貨與藥材飄香 細品迪化街歷史軌跡〉，臺北市政府全球資訊網新聞稿（稿件日期未見）。',
  publisher: '臺北市政府全球資訊網',
  title: '南北貨與藥材飄香 細品迪化街歷史軌跡',
  url: 'https://www.gov.taipei/News_Content.aspx?n=F0DDAF49B89E9413&sms=72544237BBE4C5F6&s=75E1722AB7323206',
  published: '官方新聞稿（稿件日期未見；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '迪化街年貨大街「起源於1996年農曆春節前半個月舉辦」、「為臺北市政府首創」的官方說法。',
  context: '官方稿，發布機關為工務局；沒有說明主辦局處、範圍與各年起訖日，也沒有獨立的南北貨史。「市府首創」與報導所寫「構想由民間提出」並列，不統一。',
}
SOURCES['udn-time-2023-nianhuo'] = {
  id: 'udn-time-2023-nianhuo',
  citation: '報時光（UDN Time），〈辦年貨必去！迪化街蛻變為「年貨大街」的歷史〉，2023年1月7日。',
  publisher: '報時光（聯合報系）',
  title: '辦年貨必去！迪化街蛻變為「年貨大街」的歷史',
  url: 'https://time.udn.com/udntime/story/122835/6893431',
  published: '2023年1月7日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '1996年緣起的報導：構想由民間「迪化街工作室」提出、約50家商戶支持、市府協辦；1996年的預定做法（徒步區、布置、民俗攤位）。',
  context: '媒體文章，文中重現民生報1995年12月23日第22版報導（記者黃士榮）；原報紙本身未能直接查閱。1996年的日期與範圍是當年的「預定」，不是實際舉辦的紀錄。',
}
SOURCES['bios-2016-dihua-nianhuo'] = {
  id: 'bios-2016-dihua-nianhuo',
  citation: '莊祐端，〈大稻埕的那些小事（一）：迪化街過年前的那幾天〉，BIOS monthly，2016年2月3日。',
  publisher: 'BIOS monthly',
  title: '大稻埕的那些小事（一）：迪化街過年前的那幾天',
  url: 'https://www.biosmonthly.com/article/7086',
  published: '2016年2月3日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '南北貨在迪化街批發的概述，以及年前囤貨的習慣（節慶期間菜市場休市）；只當背景，與1996年的活動分開寫。',
  context: '媒體文章，二手整理；沒有寫年貨大街的起源。文末參考文獻列〈大稻埕南北貨座談會紀錄〉（卞鳳奎，《臺北文獻》110期，1994年12月），該文內容本站未能取得，待補。',
}
SOURCES['ettoday-2026-xia-er-zui'] = {
  id: 'ettoday-2026-xia-er-zui',
  citation: 'DARREN 蘋果樹，〈大稻埕1954年創立米苔目老店！剉冰底下全是料 開賣就排隊〉，ETtoday 旅遊雲（頁面標示2026年8月12日）。',
  publisher: 'ETtoday 旅遊雲',
  title: '大稻埕1954年創立米苔目老店！剉冰底下全是料 開賣就排隊',
  url: 'https://travel.ettoday.net/article/3214322.htm',
  published: '頁面標示2026年8月12日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '呷二嘴的地址（大同區甘州街34號）與「1954年創立」的店家說法；從小攤販發展到店面。',
  context: '媒體轉載的食記；創辦人與傳承皆未提。1954年沒有文件佐證。店內紅磚人行道與紅色大門是現代裝潢，不是史料。',
}
SOURCES['lordcat-2022-xia-er-zui'] = {
  id: 'lordcat-2022-xia-er-zui',
  citation: '貓大爺，〈呷二嘴：1954年創業…〉，個人部落格，2022年4月13日。',
  publisher: '貓大爺（個人部落格）',
  title: '呷二嘴',
  url: 'https://lordcat.net/archives/2610',
  published: '2022年4月13日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '呷二嘴「1954年成立、以前是路邊攤」的說法；夏季米苔目冰（米苔目、粉粿、紅豆、仙草自選）、冬季熱食。',
  context: '個人部落格食記，單一來源；與其他食記的1954相同但很可能互相引用。創辦人與傳承未提。',
}
SOURCES['tenjo-2026-xia-er-zui'] = {
  id: 'tenjo-2026-xia-er-zui',
  citation: '周花花，〈呷二嘴〉，甲飽沒（個人部落格，頁面標示2026年7月18日）。',
  publisher: '甲飽沒（個人部落格）',
  title: '呷二嘴',
  url: 'https://tenjo.tw/gaerzui/',
  published: '頁面標示2026年7月18日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '「西元1954年創立」的店家說法（與上兩篇一致，皆無文件佐證）。',
  context: '個人部落格食記；未提攤位位置與世代。',
}

// 第 7 階段 B：小藝埕補章節與李亭香（查證紀錄：docs/research/xiao-yi-cheng.md、docs/research/li-ting-xiang.md）
// 檢核：小藝埕的營運模式與「第一棟藝埕」只有營運單位官方自述，標「官方自述」；民藝埕只有 2012 年一篇報導與官方簡介，不做 3D。
// 李亭香全部是商業媒體與部落格，沒有官方或學術來源；多篇「1895」互相轉述，不構成獨立證據；創立地點與世代數來源矛盾，
// 章節只寫現代與店家自述，不寫世代序號、不寫成「1895 年創於迪化街」，建築年代與登錄身分查無、不寫。
SOURCES['artyard-houses'] = {
  id: 'artyard-houses',
  citation: '大藝埕 ArtYard 官方網站，〈HOUSES（文化街屋）〉。',
  publisher: '世代群 Sedai Group',
  title: '大藝埕 ArtYard：HOUSES',
  url: 'https://www.artyard.tw/houses',
  published: '官方網頁（未標示日期；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '小藝埕是「位於迪化街入口的百年洋樓，是藝埕的第一棟街屋」、民藝埕「位於迪化街霞海城隍廟旁」的「百年三進式街屋」；藝埕系列共十棟的名單（小藝埕、民藝埕、眾藝埕、學藝埕、聯藝埕、青藝埕、合藝埕、同藝埕、鄉藝埕、婉藝埕）。',
  context: '營運單位的官方自述，不是第三方史料。各棟未標地址（同藝埕除外）、未標開幕年份、未列入駐業者；頁面的編號有疑似重複（鄉藝埕、婉藝埕皆標 AY196），本站不以編號當門牌。',
}
SOURCES['businesstoday-2020-litingxiang'] = {
  id: 'businesstoday-2020-litingxiang',
  citation: '《今周刊》，2020年11月5日報導（李亭香餅店的傳承與轉型）。',
  publisher: '今周刊',
  title: '今周刊 2020年11月5日報導',
  url: 'https://www.businesstoday.com.tw/article/category/80392/post/202011050029/',
  published: '2020年11月5日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '店家自述的傳承敘述：第一代先在大稻埕的餅店學做餅，回家鄉蘆洲開店；店名由騎樓（亭仔腳）飄出餅香而來；平西餅是長銷商品（「27層餅皮」）；約40年前大稻埕沒落、家中一度兼賣香菸、罐頭等雜貨；現任經營者李佳陽曾任職友達光電、返家接班；2020年疫情後調整門市。',
  context: '雜誌專題，自稱「126年歷史」，與其他媒體寫的1895年差一年，文中未寫確切創立年。創辦人與第二代的姓名、各代推出的平西餅口味、「蘆洲創立」都只見於這一篇（蘆洲另有一篇專欄相同，但未寫姓名），本站標待核或不寫。',
}
SOURCES['ettoday-2019-litingxiang'] = {
  id: 'ettoday-2019-litingxiang',
  citation: '〈「從面板到麵粉、放棄百萬年薪！」工程師接班百年餅店李亭香〉，ETtoday 財經雲，2019年2月5日。',
  publisher: 'ETtoday 財經雲',
  title: '「從面板到麵粉、放棄百萬年薪！」工程師接班百年餅店李亭香',
  url: 'https://finance.ettoday.net/news/1373439',
  published: '2019年2月5日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '「創立於1895年」的店家說法；李佳陽曾任面板工程師、返家接班，其父李榮華經營店務；曾有九家門市、報導時剩大稻埕店與兩家由堂兄弟在新北經營的店；平西餅之外曾賣杏仁霜、白脫糖到香菸；平安龜；2010年代於華山文創園區設糕餅文化館。',
  context: '媒體報導。對李佳陽是第幾代的算法與《今周刊》、鏡週刊相差三代，本站不寫世代序號；「創始的大稻埕店」與《今周刊》的「蘆洲創店」矛盾，本站並列。',
}
SOURCES['mirror-2018-litingxiang'] = {
  id: 'mirror-2018-litingxiang',
  citation: '鏡週刊，李亭香報導，2018年10月19日發布（2023年9月12日更新）。',
  publisher: '鏡週刊',
  title: '鏡週刊 2018年10月19日報導',
  url: 'https://www.mirrormedia.mg/story/20181003cnt001',
  published: '2018年10月19日發布、2023年9月12日更新（2026年10月查閱，WebFetch 摘要讀取，全文未完整讀到）',
  usage: '「創立於1895年」的店家說法；店在大稻埕迪化街；平西餅、平安龜；曾進駐永樂春風茶館一樓一角。',
  context: '媒體報導，標題與全文未完整讀到；文中的世代算法與 ETtoday 不同（相差三代），本站不寫世代序號。',
}
SOURCES['sidoli-litingxiang'] = {
  id: 'sidoli-litingxiang',
  citation: '阿潼（品牌顧問），〈台北糕餅〉專欄，SIDOLI RADIO 小島裡（日期未標示）。',
  publisher: 'SIDOLI RADIO 小島裡（個人專欄／Podcast 逐字稿）',
  title: '台北糕餅',
  url: 'https://sidoli.tw/stories/25',
  published: '日期未標示（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '店名由騎樓飄出餅香而來（與《今周刊》一致，標店家說法）；第一代先在大稻埕學做餅、創立於蘆洲（未寫姓名）。',
  context: '個人專欄，可信度低。文中「第二代1951年拓點到大稻埕」只有這一篇，本站只在說明年代取捨時提到、標待核，不寫成史實；「糕餅送禮的意義」不採。',
}
SOURCES['walkerland-2021-litingxiang'] = {
  id: 'walkerland-2021-litingxiang',
  citation: '哈姆湘，〈李亭香〉食記，窩客島 WalkerLand，2021年12月27日。',
  publisher: '窩客島 WalkerLand（部落格）',
  title: '李亭香食記',
  url: 'https://www.walkerland.com.tw/article/view/314959',
  published: '2021年12月27日（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '「創立於1895年」的店家說法，文中明說來源不明；平西餅、金錢龜等現售商品。',
  context: '部落格食記，可信度低；「百年建築」「融合日式與西式風格」是部落格用語，不是史料，本站不採建築年代。文中的綠豆糕禮盒是現代商品，不是早年的產品。',
}

// 第 7 階段 C：大稻埕戲苑（查證紀錄：docs/research/da-dao-cheng-xi-yuan.md）
// 檢核：位置、樓層、演出類型與管理單位有官方劇場平臺；沿革只有百科與《PAR表演藝術》互相支持，沒有官方沿革頁，
// 開幕年份以 2010／2011 並列、標待核；座位數三說並列；北投／臺北戲棚遷移、與歷史戲院的傳承查無，不採。
SOURCES['eculture-taipei-xiyuan'] = {
  id: 'eculture-taipei-xiyuan',
  citation: '臺北市政府，〈大稻埕戲苑（9樓劇場）〉場館資料，臺北市政府劇場整合資訊平臺。',
  publisher: '臺北市政府劇場整合資訊平臺（eculture.gov.taipei）',
  title: '大稻埕戲苑（9樓劇場）',
  url: 'https://eculture.gov.taipei/theatre/zh-tw/theatreInfo/25',
  published: '官方場館資料（頁面日期未見；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '戲苑座落永樂市場8、9樓；9樓劇場、8樓曲藝場與布袋戲常設展區；固定席位分類501–1000席；管理單位臺北市藝文推廣處；演出類型。',
  context: '官方頁面，可信度高；頁面沒有沿革與啟用年份，也沒有完整地址。席位只給區間，與報導「五百人」、百科「506席」並列，本站寫「約500席」標待核。',
}
SOURCES['par-2011-xiyuan'] = {
  id: 'par-2011-xiyuan',
  citation: '廖俊逞，〈大稻埕戲苑 重現精采戲窟文化〉，《PAR表演藝術》第219期，2011年3月。',
  publisher: '《PAR表演藝術》（國家兩廳院）',
  title: '大稻埕戲苑 重現精采戲窟文化',
  url: 'https://par.npac-ntch.org/tw/article/doc/D99EPH3P80',
  published: '2011年3月（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '由永樂市場內的「延平活動中心」改建；「前年」整修完成、「去年」試營運、「本月底」正式營運（即2009／2010／2011）；九樓約500人劇場、八樓約100席曲藝場（掌中戲為主）；館方「傳承、延續大稻埕古城的戲窟文化」的自述。',
  context: '專業雜誌，可信度中高。年份以相對語（前年、去年）寫成，本站依刊出月份換算並與百科、2014年文章並列；「延續戲窟文化」只當館方自述，不寫成與歷史戲院的傳承。文中「附近廟宇保有野臺戲傳統」不是戲苑的沿革。',
}
SOURCES['par-2014-xiku'] = {
  id: 'par-2014-xiku',
  citation: '劉美芳，〈昔時聚百戲 戲窟再回春〉，《PAR表演藝術》第255期，2014年3月。',
  publisher: '《PAR表演藝術》（國家兩廳院）',
  title: '昔時聚百戲 戲窟再回春',
  url: 'https://par.npac-ntch.org/tw/article/doc/DQ3OD3SS5O',
  published: '2014年3月（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '戲苑2011年開幕、2014年滿三週年；淡水戲館（1909年建、後改名臺灣新舞臺、1945年毀於空襲）、永樂座（舊址在市場對面）、第一劇場（1935年建於太平町，電影與新劇為主）的簡述。',
  context: '專業雜誌，可信度中高。文章介紹三座歷史戲院，但沒有說戲苑承接其中任何一座；本站據此明寫戲苑並非它們的延續。',
}
SOURCES['tapo-xiyuan-events'] = {
  id: 'tapo-xiyuan-events',
  citation: '臺北市藝文推廣處，大稻埕戲苑活動列表。',
  publisher: '臺北市藝文推廣處（tapo.gov.taipei）',
  title: '大稻埕戲苑活動列表',
  url: 'https://www.tapo.gov.taipei/News.aspx?n=34C47A41C78AB210&sms=9A0025CA3D7482D6',
  published: '官方活動頁，隨時更新（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '確認戲苑隸屬臺北市藝文推廣處；節目含布袋戲、歌仔戲、崑劇與偶戲展。',
  context: '官方頁面，只見活動列表，沒有場館簡介與沿革；本站不採任何單一節目的名稱、日期或票價。',
}
SOURCES['wiki-dadaocheng-xiyuan'] = {
  id: 'wiki-dadaocheng-xiyuan',
  citation: '維基百科，〈大稻埕戲苑〉條目（繁體中文）。',
  publisher: '維基百科',
  title: '大稻埕戲苑',
  url: 'https://zh.wikipedia.org/zh-tw/大稻埕戲苑',
  published: '線上條目（頁面自標需重寫；2026年10月查閱，WebFetch 摘要讀取）',
  usage: '沿革節點：1987年2月社教館在「延平區行政中心9樓」成立延平活動中心；2009年3月配合「大稻埕古城重現專案」整建；2009年10月31日更名；2010年3月6日試營運；2015年11月6日改隸藝文推廣處；9樓506席、8樓約100席。',
  context: '百科條目，可信度中低，只當線索；條目沒有說明延平區行政中心與永樂市場大樓的關係，2015年改隸日期只有此一來源，本站都標待核。1987、2009年的節點只寫在章節裡，不上年表。',
}
SOURCES['wiki-yongle-za'] = {
  id: 'wiki-yongle-za',
  citation: '維基百科，〈永樂座〉條目（繁體中文；引《臺灣大百科全書》等）。',
  publisher: '維基百科',
  title: '永樂座',
  url: 'https://zh.wikipedia.org/zh-tw/永樂座',
  published: '線上條目（2026年10月查閱，WebFetch 摘要讀取）',
  usage: '永樂座1921年起籌設（初名臺北大舞台）、1923年改名、1924年2月17日開幕，位於今迪化街一段46巷、大稻埕市場對面；1960年5月歇業。',
  context: '百科條目，引《臺灣大百科全書》，本站未直接查閱原條目，年份與地點標待核。條目沒有提到永樂市場或戲苑，本站據此不把永樂座寫成戲苑的前身。',
}

// 第 8 階段：李春生的人物小節（查證紀錄：docs/research/li-chun-sheng.md；沿用 tea-export-origins.md 的既有出處）
// 檢核：生平與事業以陳慈玉（學術）與國史館自敘（原件）為主；大稻埕教會的門牌與 1915 年禮拜堂有教會刊物與文化局日文頁互相支持；
// 央廣、維基只作線索（四達商行、建昌 1886、1896 赴日細節、1901 長老都標待核）；住址、紀念教會文資身分與設計者查無，不寫。
const LI_ACCESSED = '2026-10-25'

SOURCES['cosmiccare-li-chunsheng-church'] = {
  id: 'cosmiccare-li-chunsheng-church',
  citation: '宇宙光全人關懷機構，〈台灣茶葉之父──李春生長老與大稻埕教會〉，《宇宙光》雜誌。',
  title: '台灣茶葉之父──李春生長老與大稻埕教會',
  publisher: '宇宙光全人關懷機構（教會刊物）',
  url: 'https://www.cosmiccare.org/magazine/Detail/ee0fdf6f-0aa6-4fb8-9d6f-dd6e4138e7e5',
  sourceDate: null,
  accessedAt: LI_ACCESSED,
  published: '頁面未標示日期（2026年10月查閱）',
  supports: ['大稻埕教會在甘州街40號（慈聖宮旁）', '1915年遷建的禮拜堂由李春生出資、規劃並監造', '稱號「台灣茶葉之父」'],
  usage: '教會與李春生的關係、禮拜堂的年份與門牌。教會刊物，可信度中；與文化局《走讀大稻埕》、文化局日文頁的「捐建」說法並列。',
  context: '刊物文章：李春生長老出資規劃並監造1915年遷建的大稻埕教會禮拜堂（臺北市大同區甘州街40號，慈聖宮旁）；文章以「台灣茶葉之父」稱他。本站只採門牌、年份與「出資規劃監造」，不採文中的信仰評價。',
}
SOURCES['culture-taipei-jp-spots'] = {
  id: 'culture-taipei-jp-spots',
  citation: '臺北市政府文化局（日本語），〈文化スポットの物語り〉。',
  title: '文化スポットの物語り',
  publisher: '臺北市政府文化局',
  url: 'https://culture.gov.taipei/cp.aspx?n=785E618AC02A877B&s=AB3BF427B273C5EC',
  sourceDate: null,
  accessedAt: LI_ACCESSED,
  published: '官方網頁，頁面未標示日期（2026年10月查閱）',
  supports: ['大稻埕教會（甘州街40號）由李春生捐建'],
  usage: '大稻埕教會與李春生的關係、門牌。官方頁面，可信度中高；寫法是「捐建」，與《宇宙光》的「出資規劃監造」並列。',
  context: '文化局日文版的文化據點介紹，記大稻埕教會位於甘州街40號、由李春生捐建。頁面沒有寫禮拜堂的年份細節，1915年依《宇宙光》。',
}
SOURCES['pts-2024-li-chunsheng'] = {
  id: 'pts-2024-li-chunsheng',
  citation: '公視台語台，〈紀念臺灣茶業之父李春生〉，2024年11月8日。',
  title: '紀念臺灣茶業之父李春生',
  publisher: '公共電視台語台',
  url: 'https://news.pts.org.tw/article/723349',
  sourceDate: '2024-11-08',
  accessedAt: LI_ACCESSED,
  published: '2024年11月8日',
  supports: ['稱號「臺灣茶業之父」', '2024年為逝世百年（即1924年過世）'],
  usage: '只用來支持稱號的通行與過世年份；新聞報導，可信度中。',
  context: '2024年逝世百年的紀念報導，以「臺灣茶業之父」稱李春生。本站不採報導裡的紀念活動細節。',
}
SOURCES['ntu-li-chunsheng-works-2004'] = {
  id: 'ntu-li-chunsheng-works-2004',
  citation: '黃俊傑、李明輝、黎漢基編，《李春生著作集》，臺北：南天書局，2004年（臺大學術資料庫書目）。',
  title: '李春生著作集',
  publisher: '南天書局；書目見國立臺灣大學學術資料庫',
  url: 'https://scholars.lib.ntu.edu.tw/handle/123456789/5582?locale=en',
  sourceDate: '2004',
  accessedAt: LI_ACCESSED,
  published: '2004年（書目頁面無摘要）',
  supports: ['《李春生著作集》的編者、出版社與年份'],
  usage: '只用來支持著作集的存在與書目；各書原本的出版年不在此頁，本站不寫。',
  context: '臺大學術資料庫條目，只有書名、編者、出版社與年份，沒有摘要與各篇出處。本站不據此寫任何思想評價。',
}
SOURCES['rti-li-chunsheng-tea'] = {
  id: 'rti-li-chunsheng-tea',
  citation: '中央廣播電臺，〈把烏龍茶打造成台灣第一個國際品牌的人～台灣烏龍茶之父李春生〉。',
  title: '把烏龍茶打造成台灣第一個國際品牌的人～台灣烏龍茶之父李春生',
  publisher: '中央廣播電臺',
  url: 'https://www.rti.org.tw/news?uid=3&pid=130053&typeId=2',
  sourceDate: null,
  accessedAt: LI_ACCESSED,
  published: '頁面未標示日期（2026年10月查閱）',
  supports: ['1861年在廈門自立四達商行（單一來源，待核）', '1896年赴日、《東遊六十四日隨筆》書名', '著作書名（《主津新集》、〈台事〉等）', '續任和記洋行買辦'],
  usage: '只作旁證。媒體，可信度低：寫 1865 年受雇為「總辦」（其他來源都寫買辦，本站不用「總辦」）、建昌公司 1886 年（多數來源 1889，本站標待核）、1869 年運量 2,131 擔（與其他資料不一，本站只寫約數）。',
  context: '媒體人物介紹。本站採用的只有：四達商行（標待核）、1896 年赴日與遊記書名、著作書名；年份與職稱的矛盾都不採。',
}
SOURCES['wiki-li-chunsheng'] = {
  id: 'wiki-li-chunsheng',
  citation: '維基百科，〈李春生〉條目（中文；另有英文條目 Li Chunsheng）。',
  title: '李春生',
  publisher: '維基百科',
  url: 'https://zh.wikipedia.org/zh-hk/%E6%9D%8E%E6%98%A5%E7%94%9F',
  sourceDate: null,
  accessedAt: LI_ACCESSED,
  published: '線上條目（2026年10月查閱）',
  supports: ['1868年移居大稻埕一說', '1901年被推為大稻埕教會長老一說', '卒日10月5日一說（與國史館的9月7日矛盾）', '1896年赴日的陪同與月份一說'],
  usage: '只當線索，可信度低（條目內部對卒日與享年自相矛盾）。本站用它的地方都標待核：來臺年並列、1901年長老、1896年赴日細節；「第一位思想家」與1900年會面等說法只見此處，不採。',
  context: '百科條目，生日與官方一致（1838年1月12日），卒日寫1924年10月5日、與國史館引賴永祥的9月7日不同，本站只寫年份。條目的「故居」照片沒有地址，本站不寫住址。',
}

// 第 8 階段：蔣渭水的人物小節（查證紀錄：docs/research/jiang-wei-shui.md 含補查；春風得意樓沿用 jiang-shan-lou.md）
// 檢核：大安醫院 1916 年有國家文化記憶庫（已讀）與碑記摘要兩個獨立來源；渭水驛站以文化局新聞稿原文為主；
// 台灣英文新聞為二手報導、維基只作線索（文協成立日與地點、生年各說都標待核）；門牌、墓地、紀念館沿革查無或不寫。
const JIANG_ACCESSED = '2026-10-25'

SOURCES['tcmb-jiang-wei-shui'] = {
  id: 'tcmb-jiang-wei-shui',
  citation: '李鎧揚、賴郁如撰，〈蔣渭水〉，國家文化記憶庫（資料來源：國立臺灣歷史博物館），2020年10月30日。',
  title: '蔣渭水',
  publisher: '國家文化記憶庫（文化部）',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Object&id=573974',
  sourceDate: '2020-10-30',
  accessedAt: JIANG_ACCESSED,
  published: '2020年10月30日',
  supports: ['生於1888年、1931年8月5日因傷寒病逝', '1916年在大稻埕開設大安醫院', '《臺灣民報》無法在臺灣發行時在醫院設總經銷處', '1921年臺灣文化協會成立、蔣渭水是重要成員', '1927年協會分裂，與林獻堂退出協會運作'],
  usage: '人物小節的骨幹：生卒年、大安醫院、文化協會。國家級資料庫、已讀全文，可信度中高；生年與台灣文學辭典（1891）、文化部英文頁（1890）矛盾，本站三說並列。沒有寫大安醫院門牌、文協成立日。',
  context: '國家文化記憶庫條目：蔣渭水生於1888年、1931年過世（8月5日因傷寒病逝）；1916年在大稻埕開設大安醫院；《臺灣民報》無法在臺灣發行時在醫院設總經銷處；1921年臺灣文化協會成立，他是重要成員之一；1927年協會分裂後與林獻堂退出協會運作。條目未寫門牌、未提民眾黨。',
}
SOURCES['culture-taipei-2020-weishui-station'] = {
  id: 'culture-taipei-2020-weishui-station',
  citation: '臺北市政府文化局新聞稿，〈無圍牆博物館新亮點「渭水驛站」大稻埕全新開張《你好，渭水》常設展〉，2020年10月7日。',
  title: '無圍牆博物館新亮點「渭水驛站」大稻埕全新開張《你好，渭水》常設展',
  publisher: '臺北市政府文化局',
  url: 'https://culture.gov.taipei/News_Content.aspx?n=621F0409A1ABDD34&sms=72544237BBE4C5F6&s=245742BBD6D7283C',
  sourceDate: '2020-10-07',
  accessedAt: JIANG_ACCESSED,
  published: '2020年10月7日（民國109年）',
  supports: ['渭水驛站在臺北市大同區延平北路二段27號', '前身是都市更新處都市再生基地「城市影像實驗室（URS27W）」，改為文化局文化館所，因緊鄰大安醫院舊址而更名', '常設展《你好，渭水》開幕', '大安醫院是《臺灣民報》的總批發處、新文化運動的據點', '店屋稱歷史建築（登錄年份未寫）'],
  usage: '渭水驛站的地址、沿革與開幕日，官方原文、已讀全文，可信度高；地圖上的門牌依此標示。新聞稿沒有寫大安醫院的門牌與設立年，這兩項不據此寫。',
  context: '官方新聞稿（109-10-07）：渭水驛站位於臺北市大同區延平北路二段27號，前身為都市更新處「城市影像實驗室（URS27W）」，完成階段性任務後改為文化局文化館所，因緊鄰大安醫院舊址而更名；常設展《你好，渭水》開幕；大安醫院是《臺灣民報》的總批發處。新聞稿稱店屋為歷史建築，但未寫登錄年份，本站不寫。',
}
SOURCES['jaung-chunfeng-deyilou-2015'] = {
  id: 'jaung-chunfeng-deyilou-2015',
  citation: '莊永明，〈大稻埕名酒樓之二：春風得意樓〉，莊永明書坊（部落格），2015年7月30日。',
  title: '大稻埕名酒樓之二：春風得意樓',
  publisher: '莊永明書坊（個人部落格）',
  url: 'http://jaungyoungming-club.blogspot.com/2015/07/blog-post_30.html',
  sourceDate: '2015-07-30',
  accessedAt: JIANG_ACCESSED,
  published: '2015年7月30日',
  supports: ['春風得意樓1914年2月開業、1916年2月遷太平橫街新建街屋；店主林聚光', '蔣渭水1920年3月改組增資時成為大股東、1922年2月買下全部股份、同年夏前後關店', '大安醫院就在春風得意樓對街'],
  usage: '春風得意樓與蔣渭水的關係。資深臺北文史作者、有年月與位置，但為個人書坊、單一詳細來源，可信度中；人物小節照引並寫出「莊永明」。與維基的「1921年起經營」不同，本站採莊永明。',
  context: '莊永明整理日治報刊的專文：春風得意樓1914年2月開業，1916年2月遷太平橫街；1920年3月改組增資蔣渭水成大股東，1922年2月買下全部股份、同年夏前後關店；大安醫院在對街。本站不採文中的菜色與評語。',
}
SOURCES['tcmb-taiping-shophouse-27'] = {
  id: 'tcmb-taiping-shophouse-27',
  citation: '吳宇凡撰，〈太平町店屋－延平北路2段27號〉，國家文化記憶庫（建檔單位：國立臺北科技大學文化事業發展學系）。',
  title: '太平町店屋－延平北路2段27號',
  publisher: '國家文化記憶庫（文化部）',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Object&id=292599',
  sourceDate: null,
  accessedAt: JIANG_ACCESSED,
  published: '條目未標示日期（2026年10月查閱）',
  supports: ['延平北路二段27號店屋緊鄰原大安醫院、文化協會與文化書局'],
  usage: '只用來支持渭水驛站所在店屋（27號）與大安醫院舊址相鄰，與文化局新聞稿互相支持。條目內容很短，未列文資登錄資訊。',
  context: '國家文化記憶庫的建築條目：太平町店屋（延平北路二段27號），緊鄰原大安醫院、文化協會與文化書局。沒有寫大安醫院的門牌與年份。',
}
SOURCES['taiwannews-2020-weishui-station'] = {
  id: 'taiwannews-2020-weishui-station',
  citation: '台灣英文新聞，〈常設展《你好，渭水》於「渭水驛站」開幕〉（引臺北市政府文化局新聞稿），2020年10月。',
  title: '常設展《你好，渭水》於「渭水驛站」開幕',
  publisher: '台灣英文新聞 Taiwan News',
  url: 'https://www.taiwannews.com.tw/zh/news/4025269',
  sourceDate: '2020-10',
  accessedAt: JIANG_ACCESSED,
  published: '2020年10月',
  supports: ['渭水驛站2020年10月7日開幕、六個展區主題', '渭水驛站緊鄰大安醫院舊址'],
  usage: '新聞稿的轉載，作為開幕日期的旁證；內容以文化局新聞稿原文為準。',
  context: '轉載臺北市文化局新聞稿的報導：渭水驛站常設展《你好，渭水》2020年10月7日開幕，六個主題，館所緊鄰大安醫院舊址。',
}
SOURCES['taiwannews-2021-tca-where'] = {
  id: 'taiwannews-2021-tca-where',
  citation: '台灣英文新聞，〈100年前的「台灣文化協會」在哪裡？……大安醫院在哪裡？〉，2021年。',
  title: '100年前的「台灣文化協會」在哪裡？大安醫院在哪裡？',
  publisher: '台灣英文新聞 Taiwan News',
  url: 'https://www.taiwannews.com.tw/zh/news/4314630',
  sourceDate: '2021',
  accessedAt: JIANG_ACCESSED,
  published: '2021年',
  supports: ['臺灣文化協會1921年10月17日成立一說、地點靜修女子學校一說', '大安醫院舊址今為義美門市', '大安醫院「實際上也就是文協本部」的說法'],
  usage: '二手報導（來源是蔣渭水文化基金會年表與受訪者，文末無學術引註），可信度低；本站引它的地方（17日、靜修女學校、文協本部）都標待核，不寫成事實。',
  context: '文協百年的報導：文化協會1921年10月17日在靜修女子學校成立；大安醫院舊址今為義美門市，報導稱醫院「實際上也就是文協本部」但未說明時間點。未列門牌，無學術引註。',
}
SOURCES['taiwannews-2021-daan-model'] = {
  id: 'taiwannews-2021-daan-model',
  citation: '台灣英文新聞，渭水驛站展出大安醫院立體袖珍模型的報導，2021年10月。',
  title: '渭水驛站展出大安醫院袖珍模型',
  publisher: '台灣英文新聞 Taiwan News',
  url: 'https://www.taiwannews.com.tw/zh/news/4329264',
  sourceDate: '2021-10',
  accessedAt: JIANG_ACCESSED,
  published: '2021年10月',
  supports: ['2021年10月文協百年，大安醫院立體袖珍模型與動畫在渭水驛站展出'],
  usage: '只用來支持「今日可去的地方」裡的模型展出一事；報導無地址、無設立年，其他內容不據此寫。',
  context: '2021年10月29日文協百年之際，大安醫院立體袖珍模型與動畫在渭水驛站展出。報導沒有地址與設立年。',
}
SOURCES['moc-jiang-wei-shui-monument'] = {
  id: 'moc-jiang-wei-shui-monument',
  citation: '文化部，〈蔣渭水紀念碑碑記〉（檔案下載頁；檔案內文本站只見搜尋摘要，未能解析）。',
  title: '蔣渭水紀念碑碑記',
  publisher: '文化部（檔案由中央銀行網站代管）',
  url: 'https://www.cbc.gov.tw/tw/dl-122697-6B988BF938664A2AA2EE8ED09F2CF778.html',
  sourceDate: null,
  accessedAt: JIANG_ACCESSED,
  published: '檔案未標示日期（2026年10月查閱，內文未能解析）',
  supports: ['大安醫院1916年設立（摘要）', '門牌延平北路二段31號一說（摘要，單一來源，待核）', '1921年創立文化協會（摘要）'],
  usage: '只作旁證：檔案內文未能解析，只見搜尋摘要，可信度低。1916年與國家文化記憶庫一致才採；門牌只有這一個來源，標待核、不寫。',
  context: '碑記的下載頁，檔案內文本站未能解析，只見摘要：大安醫院1916年設於太平町（今延平北路二段31號）、1921年創立文化協會。門牌只見於此，本站不寫。',
}
SOURCES['wiki-jiang-wei-shui'] = {
  id: 'wiki-jiang-wei-shui',
  citation: '維基百科，〈蔣渭水〉條目（中文）。',
  title: '蔣渭水',
  publisher: '維基百科',
  url: 'https://zh.wikipedia.org/zh-hk/%E8%94%A3%E6%B8%AD%E6%B0%B4',
  sourceDate: null,
  accessedAt: JIANG_ACCESSED,
  published: '線上條目（2026年10月查閱）',
  supports: ['生年1888、1890、1891三說並列', '大安醫院1916年一說', '春風得意樓「1921年起經營」一說（與莊永明1920年不同）', '文協1921年10月17日一說'],
  usage: '只當線索，可信度低。本站用它的地方都標待核或並列：生年三說、春風得意樓經營起點採莊永明而非維基。條目裡的稱號與評價不採。',
  context: '百科條目：生年列1888、1890、1891三說；1916年設大安醫院；1921年起經營春風得意樓；1921年10月17日文化協會成立。本站只採生年並列，其餘以其他來源為準。',
}

// 第 8 階段：王井泉的人物小節（查證紀錄：docs/research/wang-jing-quan.md 含補查；原始摘錄 shanshuiting-vite-raw.md）
// 檢核：以曾品滄（中研院週報）與林振莖（國立臺灣美術館《臺灣美術》）兩篇已讀全文的學術文章為主，臺灣記憶（國圖）與莊永明書坊為輔；
// 開業年 1937／1938-03-03／1939 與町名太平町／永樂町並列不定案；門牌查無；1940 年照片授權未確認不用；維基只作線索。
const WANG_ACCESSED = '2026-10-25'

SOURCES['sinica-newsletter-1584-shanshuiting'] = {
  id: 'sinica-newsletter-1584-shanshuiting',
  citation: '曾品滄，〈烽火城市裡的清涼地──淺談日治末期的臺灣料理屋山水亭〉，《中央研究院週報》第1584期。',
  title: '烽火城市裡的清涼地──淺談日治末期的臺灣料理屋山水亭',
  publisher: '中央研究院（週報；作者為臺灣史研究所副研究員）',
  url: 'https://newsletter.sinica.edu.tw/reviews/knowledge/1584.pdf',
  sourceDate: null,
  accessedAt: WANG_ACCESSED,
  published: '《中央研究院週報》第1584期（PDF未標示出版日期）',
  supports: ['山水亭1937年由王井泉成立一說', '太平町（今延平北路）街屋二樓、空間不大、擺方桌圓桌、桌上插花、有唱機', '樓上供文藝界人士食宿、呂泉生寄宿', '純臺灣菜取向與代表菜（掛爐烤鴨、羔燒羊肉、紅燒魚、東坡刈包、鳳尾蝦、雞腳凍、椰子餅、菜脯蛋、醬冬瓜、滷肝）、設調酒吧台', '常客名單、呂赫若幾乎每日在山水亭', '啟文社與厚生演劇研究會的會址設於山水亭', '1943年黃旺成日記1.5元定食、1944–1945空襲期間仍營業', '協助廖水來創設波麗路', '1953年遷至波麗路隔壁小店舖、1955年歇業、榮星花園園丁、1965年去世'],
  usage: '人物小節的主要來源之一，學術機構刊物、已讀全文，可信度高；週報體例無註，開業年1937的出處文中未標，與林振莖（1938-03-03）並列。文中1940年照片的授權未確認，本站不用。代表菜只有這一篇，章節註明單一來源。',
  context: '中研院週報的知識專文：1937年王井泉成立山水亭，在太平町（今延平北路）一幢不起眼街屋的二樓，空間略同未隔間住家，擺方桌與圓桌、插花、唱機；樓上供文藝界人士食宿；純臺灣菜取向，名菜與小吃清單引陳逸松口述；啟文社、厚生演劇研究會會址設於山水亭；戰時仍營業；戰後1953年遷址、1955年歇業。「島都文化界的梁山泊」為文中引述的稱號。',
}
SOURCES['ntmofa-lin-zhenjing-2013-wang-jingquan'] = {
  id: 'ntmofa-lin-zhenjing-2013-wang-jingquan',
  citation: '林振莖，〈大稻埕美術活動的贊助者──以王井泉與山水亭為中心〉，《臺灣美術》第93期，頁28–43，國立臺灣美術館，2013年7月15日。',
  title: '大稻埕美術活動的贊助者──以王井泉與山水亭為中心',
  publisher: '國立臺灣美術館《臺灣美術》季刊',
  url: 'https://twfineartsarchive.ntmofa.gov.tw/QuarterlyFile/P0930200.pdf',
  sourceDate: '2013-07-15',
  accessedAt: WANG_ACCESSED,
  published: '2013年7月15日',
  supports: ['1905年6月4日生於臺北；1918年太平公學校畢業、考入臺北商工學校；1928年與魏姇成親', '1931年任維特酒家經理、簽三年約、1934年期滿離開；1935年與廖水來、藍火樹在迪化街開設西式茶室', '1938年3月3日在永樂町（今延平北路）開設山水亭（註釋引其子王古勳1987年回憶文）', '1941年與張文環、陳逸松、黃得時等組啟文社創刊《台灣文學》，王井泉任負責人、張文環任編輯；創刊號批評座談會在山水亭召開', '楊三郎任《台灣文學》編輯委員並協助美編；呂赫若參與編輯校訂', '1943年厚生演劇研究會成立、9月永樂座演出《閹雞》', '戰後參與政經研究會、《人民導報》發行人；1953年遷民生西路、歇業；榮星花園；1965年病逝'],
  usage: '人物小節的主要來源之一，學術論文、註釋密度高、已讀全文，可信度高。開業日期1938-03-03出自註釋引用的家屬回憶文（王古勳），章節寫明「引其子王古勳的回憶」；町名寫永樂町，與曾品滄的太平町並列。',
  context: '《臺灣美術》93期論文：王井泉1905年6月4日生、1931–1934年任維特酒家經理、1935年開設西式茶室、1938年3月3日在永樂町自力開設臺菜餐館山水亭（註19引王古勳〈山水亭：大稻埕的梁山泊（上）〉，《台灣文化季刊》5卷，1987）；1941年啟文社與《台灣文學》；1943年厚生演劇研究會；戰後1953年遷址、歇業、榮星花園園丁、1965年病逝。引《呂赫若日記》記美術界人士在山水亭聚會。',
}
SOURCES['ncl-tm-wang-jingquan'] = {
  id: 'ncl-tm-wang-jingquan',
  citation: '國家圖書館「臺灣記憶」，〈王井泉〉（出處標示《臺灣歷史人物小傳—明清暨日治時期》，國家圖書館，2003，頁46–47）。',
  title: '王井泉',
  publisher: '國家圖書館臺灣記憶系統',
  url: 'https://tm.ncl.edu.tw/article?u=016_002_0000293084',
  sourceDate: '2003',
  accessedAt: WANG_ACCESSED,
  published: '資料庫條目（底本2003年）',
  supports: ['1905年生；1965年5月19日病逝臺大醫院', '1931年曾任維特酒家經理', '1939年開設臺菜餐廳山水亭一說', '1943年厚生演劇研究會', '榮星花園園丁', '後人稱「大稻埕的梁山泊」'],
  usage: '生卒日與開業年三說之一（1939）的來源，國家圖書館資料庫、列出底本，可信度中高。它把王古勳的回憶文標為《臺灣文化》7/8期（1986-12），與林振莖的刊期標法不同，待核。',
  context: '國家圖書館人物資料庫：王井泉1905年生，1931年曾任維特酒家經理（該店當時號稱臺灣第一高級酒家），1939年開設臺菜餐廳山水亭，為文化界人士聚會處，後人稱「大稻埕的梁山泊」；1943年厚生演劇研究會；戰後到榮星花園任園丁；1965年5月19日病逝臺大醫院。「鐵三角」說法只見此一來源，本站不寫。',
}
SOURCES['jaung-wang-jingquan-2015'] = {
  id: 'jaung-wang-jingquan-2015',
  citation: '莊永明，〈台灣文化界的園丁──王井泉〉，莊永明書坊（部落格；整理自《台灣紀事》《台北老街》《大稻埕逍遙遊》），2015年5月19日。',
  title: '台灣文化界的園丁──王井泉',
  publisher: '莊永明書坊（個人部落格）',
  url: 'http://jaungyoungming-club.blogspot.com/2015/05/blog-post_19.html',
  sourceDate: '2015-05-19',
  accessedAt: WANG_ACCESSED,
  published: '2015年5月19日',
  supports: ['山水亭1938年開設一說', '位置「太平町三丁目，約當今延平北路西側靠近民生西路」，未提供門牌', '1965年5月19日病逝、6月4日告別式', '1950年代歇業'],
  usage: '開業年（1938）與町名（太平町）的旁證；位置只到町與路段、無門牌。個人書坊、臺北文史作者，可信度中。',
  context: '莊永明書坊的人物文章：山水亭1938年開設於大稻埕太平町三丁目（約當今延平北路西側靠近民生西路），未提供門牌；戰後1947年在山水亭召開臺灣省藝術建設協會第一次籌備會；1950年代歇業；1965年5月19日病逝。',
}
SOURCES['wiki-wang-jingquan'] = {
  id: 'wiki-wang-jingquan',
  citation: '維基百科，〈王井泉〉條目（中文）。',
  title: '王井泉',
  publisher: '維基百科',
  url: 'https://zh.wikipedia.org/zh-tw/%E7%8E%8B%E4%BA%95%E6%B3%89',
  sourceDate: null,
  accessedAt: WANG_ACCESSED,
  published: '線上條目（2026年10月查閱）',
  supports: ['生日1905年6月4日（與林振莖同）', '山水亭1938年3月3日開業一說（應承襲林振莖）', '1953年遷民生西路、1955年歇業'],
  usage: '只當線索，可信度低；參考文獻清單有助尋源。享年「59歲」與曾品滄「61歲」不同，本站不寫享年。',
  context: '百科條目：王井泉1905年6月4日生、1965年逝；1938年3月3日開設山水亭；1953年遷民生西路、1955年歇業。本站不據此寫任何未在學術來源出現的細節。',
}

/* ── 清末碼頭（港口商街的碼頭、接駁小船、茶箱與挑夫；查證紀錄見 docs/research/qing-wharf.md） ── */
SOURCES['tcmb-dadaocheng-wharf'] = {
  id: 'tcmb-dadaocheng-wharf',
  citation: '阮素芬（撰寫），〈大稻埕碼頭〉，國家文化記憶庫（國立臺灣歷史博物館），CC BY 3.0 TW。',
  publisher: '文化部國家文化記憶庫',
  title: '大稻埕碼頭',
  url: 'https://tcmb.culture.tw/zh-tw/detail?id=333219&indexCode=Culture_Place',
  published: '線上條目（2026年10月查閱）',
  context: '碼頭沿革由新莊、艋舺移到大稻埕，約1860年代唐山帆船改泊大稻埕，1870年以後大稻埕為淡水河最大也是最後的內河港；後來帆船無法靠岸，只能停在河道中，由小船接駁；依1901年地圖，早期碼頭在第三水門與臺北大橋之間。',
}
SOURCES['davidson-formosa-1903'] = {
  id: 'davidson-formosa-1903',
  citation: 'James W. Davidson, The Island of Formosa, Past and Present, London and New York: Macmillan, 1903.',
  publisher: 'Macmillan（Internet Archive 全文）',
  title: 'The Island of Formosa, Past and Present',
  url: 'https://archive.org/details/islandofformosap00davi',
  published: '1903年',
  context: '茶業章（約1898–1900年所見，用於清末時註明「推定相近」）：外銷茶的標準包裝是約40磅的「半箱」，另有四分之一箱與10磅小盒；茶趁熱裝箱，內襯焊封的薄鉛；鉛片在大稻埕以鐵鍋與瓦片現場澆鑄；松木箱板自廈門、福州運來，在大稻埕組釘；箱外貼彩色印花紙或由畫工手繪。淡水河口1895年可見戎克船、貨船、木筏與舢舨。',
}
SOURCES['demomy-tait-tea-label'] = {
  id: 'demomy-tait-tea-label',
  citation: '〈1890年德記洋行福爾摩沙烏龍茶箱商標紙〉，DEMOMY 收藏平臺（使用者 NIKKO 上傳），2025年12月31日。',
  publisher: 'DEMOMY 收藏平臺',
  title: '1890年德記洋行福爾摩沙烏龍茶箱商標紙',
  url: 'https://www.demomy.com/item.php?id=204',
  published: '2025年12月31日',
  usage: '民間藏家頁面，只作旁證；年份為推測，待核。網站的茶箱外裱紙不仿這張商標。',
  context: '宣紙木版印刷的茶箱商標紙，約37×31.5公分，貼在木箱外面；頁面稱箱內為錫箔內襯（與 Davidson 記的鉛不同）。',
}

// 第 10 階段「一箱茶的旅程」：路人對話與探索手記的素材（查證紀錄見 docs/research/tea-journey-qing-port.md）
SOURCES['dodd-blockade-1888'] = {
  id: 'dodd-blockade-1888',
  citation: 'John Dodd, Journal of a Blockaded Resident in North Formosa, during the Franco-Chinese War, 1884–5. Hong Kong: Daily Press Office, 1888.',
  publisher: 'Hong Kong: Daily Press Office（私人印行）',
  title: 'Journal of a Blockaded Resident in North Formosa（北台封鎖記）',
  url: 'https://search.worldcat.org/oclc/464653492',
  published: '1888年',
  usage: '原書無公開電子全文；日記摘句為轉引，逐字引用前宜核對中譯本（陳政三譯述《北台封鎖記：茶商陶德筆下的清法戰爭》，2002）。',
  context: '茶商陶德的清法戰爭封鎖日記（1884–85）：淡水被封鎖期間的物資短缺、茶葉運不出去與居民靠傳聞度日。封鎖缺鉛的細節另以 Davidson 1903（頁375–376）為主要依據。',
}
SOURCES['danshui-ting-zhi-1871'] = {
  id: 'danshui-ting-zhi-1871',
  citation: '陳培桂，《淡水廳志》卷十一〈風俗考〉，1871年；維基文庫。',
  publisher: '陳培桂（清同治十年）；維基文庫',
  title: '淡水廳志・風俗考',
  url: 'https://zh.wikisource.org/wiki/%E6%B7%A1%E6%B0%B4%E5%BB%B3%E5%BF%97/%E5%8D%B711',
  published: '1871年',
  usage: '維基文庫頁面標示「尚未校對」，逐字引用前宜對照臺灣銀行經濟研究室《臺灣文獻叢刊》本。作者過世逾50年，原文可引。',
  context: '風俗考的原文句：「淡俗儉樸，愛惜物力」「茶味薄不如武彝，與福寧埒；然茶樹有數十年不萎者」「估客輳集，以淡為台郡第一」。',
}
SOURCES['cna-goodbook-yaoguai-2019'] = {
  id: 'cna-goodbook-yaoguai-2019',
  citation: '何敬堯，《妖怪臺灣地圖》〈月裡：大稻埕的古井魔女〉書摘，聯經出版；中央社好書視窗轉載，2019年。',
  publisher: '中央社好書視窗／聯經出版',
  title: '妖怪臺灣地圖（周成過臺灣的傳說）',
  url: 'https://www.cna.com.tw/Proj_GoodBook/2615.aspx',
  published: '2019年',
  usage: '民間傳說的梗概與性質說明；人名、籍貫與茶行是否屬實皆不可考，網站一律標「坊間傳說」。',
  context: '傳說梗概：安溪人周成渡臺在大稻埕經營茶行致富、負心害妻，冤魂復仇；連曉青《清代臺灣三大奇案》（1955）收錄，日治時期改編歌仔戲。',
}
SOURCES['ctee-taipei-station-2021'] = {
  id: 'ctee-taipei-station-2021',
  citation: '蘇昭旭，《臺鐵風華．百年一瞬》書摘〈你不知道的臺北車站〉，工商時報，2021年2月24日。',
  publisher: '工商時報／天下文化',
  title: '你不知道的臺北車站：歲月淬鍊下的特等站',
  url: 'https://www.ctee.com.tw/news/20210224700230-431001',
  published: '2021年2月24日',
  context: '1891年基隆—臺北段鐵路竣工通車；第一代臺北車站是1891年設於大稻埕的「臺北停車場」，木造建築。另有分段通車的不同記載（1889年大稻埕—松山），對話只寫「光緒十七年（1891）火車通基隆」。',
}
SOURCES['ltn-shiding-baoge-2021'] = {
  id: 'ltn-shiding-baoge-2021',
  citation: '〈採茶歌聲傳情達意「石碇相褒歌」蒐集最古老台語〉，自由時報，2021年6月5日。',
  publisher: '自由時報',
  title: '石碇相褒歌：採茶的即興對唱',
  url: 'https://news.ltn.com.tw/news/NewTaipei/breakingnews/3558903',
  published: '2021年6月5日',
  usage: '相褒歌的性質（採茶即興對唱、七字一句四句一葩）有出處；可核對的清末歌詞原文查無，網站自擬的對唱句一律標「虛構對白」。',
  context: '相褒歌源自採茶時的台語即興對唱，石碇相褒歌為新北市無形文化資產；林金城採集出版《石碇相褒歌》（2021）。',
}

/* ── 各年代的情境人物與道具（人力車、三輪車、腳踏車、攤車；查證紀錄見 docs/research/era-street-props.md） ── */
SOURCES['wiki-rickshaw-zh'] = {
  id: 'wiki-rickshaw-zh',
  citation: '維基百科，〈人力車〉（臺灣段落引杜偉誌〈臺灣自行車發展軌跡——以國立臺灣歷史博物館蒐藏品為例〉，《歷史臺灣》3期，2012，頁52），CC BY-SA 4.0。',
  publisher: '維基百科',
  title: '人力車',
  url: 'https://zh.wikipedia.org/zh-tw/%E4%BA%BA%E5%8A%9B%E8%BB%8A',
  published: '線上條目（2026年10月查閱）',
  usage: '只作旁證：人力車1887年自上海引進臺灣（待核，原論文未讀到）；戰後被三輪車取代。',
  context: '「1887年第一批人力車從上海引進臺灣」；「第二次世界大戰結束後，人力車開始被三輪車取代。」',
}
SOURCES['masuda-2024-mobility'] = {
  id: 'masuda-2024-mobility',
  citation: '增田高志，《近代「台灣社會」的形成過程：以1920年代至1930年代人之移動所做的探討》，國立臺灣大學博士論文，2024。',
  publisher: '國立臺灣大學',
  title: '近代「台灣社會」的形成過程：以1920年代至1930年代人之移動所做的探討',
  url: 'https://tdr.lib.ntu.edu.tw/handle/123456789/91785',
  published: '2024年',
  usage: '摩登年代放腳踏車與牽腳踏車的人：1930年代腳踏車已普及到本島人的日常生活（只讀到摘要）。',
  context: '摘要：「腳踏車也急速普及到『本島人』的日常生活中」；1930年代後期本島人擁有的腳踏車逾35萬台，每百戶35台以上。',
}
SOURCES['gvm-2020-pedicab-ban'] = {
  id: 'gvm-2020-pedicab-ban',
  citation: '張哲生，〈1968年台北市政府禁行三輪車，輔導車夫轉業為計程車司機〉，遠見《城市學》，2020年2月1日。',
  publisher: '遠見天下文化《城市學》',
  title: '1968年台北市政府禁行三輪車，輔導車夫轉業為計程車司機',
  url: 'https://city.gvm.com.tw/article/70721',
  published: '2020年2月1日',
  usage: '庶民生活年代放等客的三輪車：戰後臺北常見的交通工具，1959年起取締、1968年全面禁行並收購。',
  context: '臺北市一地有一萬四千多輛三輪車（排班八千多、流動六千多）；1959年起取締違規三輪車；1968年臺北市全面禁止行駛三輪車，市府收購營業三輪車，車夫輔導轉業為計程車司機。',
}
SOURCES['lai-2024-taipei-traffic'] = {
  id: 'lai-2024-taipei-traffic',
  citation: '賴敏甄，《戰後臺北市道路交通秩序的形塑（1945－1960s）》，國立臺灣大學歷史學系碩士論文，2024。',
  publisher: '國立臺灣大學',
  title: '戰後臺北市道路交通秩序的形塑（1945－1960s）',
  url: 'https://tdr.lib.ntu.edu.tw/handle/123456789/96109',
  published: '2024年',
  usage: '三輪車是戰後臺北既有的道路使用者，後來被排擠到路邊、離開道路（只讀到摘要）。',
  context: '摘要：臺北市的三輪車與行人等既有道路使用者，因維持交通秩序與安全等理由，被排擠至道路邊緣，甚至被迫離開道路。',
}
SOURCES['cna-2021-old-taipei-pedicab'] = {
  id: 'cna-2021-old-taipei-pedicab',
  citation: '張大春，《我的老台北》（新經典文化，2020）書摘，中央社「好書」專欄，2021年1月1日。',
  publisher: '中央通訊社',
  title: '我的老台北（書摘）',
  url: 'https://www.cna.com.tw/Proj_GoodBook/3035.aspx',
  published: '2021年1月1日',
  usage: '三輪車在臺北消失的另一個年份說法（1960年9月起逐漸消失），與1968年禁行的說法不同，待核。',
  context: '「三輪車要到1960年九月才會逐漸消失在台北街頭」；外縣市拆三輪車推遲到八十年代。散文回憶，非史料。',
}
SOURCES['technews-bicycle-tax'] = {
  id: 'technews-bicycle-tax',
  citation: '吳佳蓉（中央社），〈消失的稅目，古早時代辦桌、騎腳踏車都要稅〉，TechNews 科技新報，2019年11月5日。',
  publisher: 'TechNews 科技新報（中央社稿）',
  title: '消失的稅目，古早時代辦桌、騎腳踏車都要稅',
  url: 'https://technews.tw/?p=530364',
  published: '2019年11月5日',
  usage: '庶民生活年代放腳踏車：1940–1950年代騎腳踏車要繳使用牌照稅、掛車牌（財政部檔案展的報導，單一來源，待核）。',
  context: '1940至1950年代騎腳踏車「必須要繳使用牌照稅並申掛車牌才能行駛」；民國60年（1971）停徵。',
}
SOURCES['taipeitimes-youbike2-2021'] = {
  id: 'taipeitimes-youbike2-2021',
  citation: 'Taipei Times, "Taipei launches upgraded YouBike system", 2021-05-09.',
  publisher: 'Taipei Times',
  title: 'Taipei launches upgraded YouBike system',
  url: 'https://taipeitimes.com/News/taiwan/archives/2021/05/09/2003757094',
  published: '2021年5月9日',
  usage: '老屋新生年代的單車遊客：臺北市的公共自行車系統（大稻埕附近的站點查無，網站不畫站點與品牌）。',
  context: 'YouBike 2.0 於2021年5月8日在臺北正式啟用（只讀到報導摘要）。',
}

SOURCES['nownews-tea-tally-2019'] = {
  id: 'nownews-tea-tally-2019',
  citation: '〈失落的茶產業殘跡　茶籌／茶牌見證大稻埕風華〉，NOWnews，2019年4月6日。',
  publisher: 'NOWnews',
  title: '茶籌／茶牌：揀茶計酬的憑證（口述與私人收藏）',
  url: 'https://www.nownews.com/news/3298707',
  published: '2019年4月6日',
  usage: '耆老口述與私人收藏的報導，講的是日治以後的揀茶間；清末是否已用茶籌查無，博物館典藏也查無——網站標「口述來源、待核」，不作史實陳述。',
  context: '報導記茶行以茶籌暫代薪資憑證、定期結算；收藏者藏品中有茶行的鐵片籌與紙籌。',
}

/* ── 第 12 階段：主題路線「一塊糕餅的人生」（查證紀錄 docs/research/pastry-life-route.md） ── */
SOURCES['th-dict-shoutao'] = {
  id: 'th-dict-shoutao',
  citation: '國史館臺灣文獻館，《臺灣民俗文物辭典》，「壽桃」。',
  publisher: '國史館臺灣文獻館',
  title: '臺灣民俗文物辭典：壽桃',
  url: 'https://dict.th.gov.tw/detailPage.aspx?ID=2272',
  published: '線上辭典（2026年10月查閱）',
  usage: '做壽從五十歲起每十年一次大壽；壽桃依禮俗由孫女贈賀、宴後分送親友；數量取九、十二、十六、十八、六十、八十、一〇八等吉祥數；家庭做法（發麵、包棗泥、捏桃形、蒸約十二分鐘、壓紋後噴紅色）；孫臏獻桃的傳說（「相傳」）。',
}
SOURCES['th-dict-mian-gui'] = {
  id: 'th-dict-mian-gui',
  citation: '國史館臺灣文獻館，《臺灣民俗文物辭典》，「麵龜」。',
  publisher: '國史館臺灣文獻館',
  title: '臺灣民俗文物辭典：麵龜',
  url: 'https://dict.th.gov.tw/detailPage.aspx?ID=2280&Ca=32',
  published: '線上辭典（2026年10月查閱）',
  usage: '麵龜（壽龜）：麵粉做成龜形、外皮染紅，用於神明誕辰、長輩慶壽與嬰兒週歲；清明時孩童到墓前討紅龜粿與麵龜的「印墓粿」習俗。',
}
SOURCES['ltn-2021-shizixuan'] = {
  id: 'ltn-2021-shizixuan',
  citation: '〈自由開麥拉：手工製作八十載〉，《自由時報》，2021年。',
  publisher: '自由時報',
  title: '自由開麥拉：手工製作八十載',
  url: 'https://news.ltn.com.tw/news/life/breakingnews/3432501',
  published: '2021年（2026年10月查閱）',
  usage: '十字軒的糕點常上霞海城隍廟的供桌。',
  context: '報導另記1930年創辦人與友人合夥開店、後改名十字軒；與本站十字軒章節依鏡週刊所寫的「1920年代」不一致，創立年份待核（見研究檔）。',
}
SOURCES['moe-shou-lan'] = {
  id: 'moe-shou-lan',
  citation: '教育部《臺灣台語常用詞辭典》，「收瀾」。',
  publisher: '教育部',
  title: '收瀾',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/2580/',
  published: '線上辭典（2026年10月查閱）',
  usage: '收涎的禮俗：嬰兒滿四個月時，外婆家送中間有孔的口酥餅，用紅絲線串起掛在嬰兒胸前，象徵收口水；例句的吉祥話。',
}
SOURCES['moe-gui-yin'] = {
  id: 'moe-gui-yin',
  citation: '教育部《臺灣台語常用詞辭典》，「粿印」。',
  publisher: '教育部',
  title: '粿印',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/10704/',
  published: '線上辭典（2026年10月查閱）',
  usage: '粿印是做粿的印模，常見一面桃、一面龜，有長壽之意。',
}
SOURCES['moe-da-bing'] = {
  id: 'moe-da-bing',
  citation: '教育部《臺灣台語常用詞辭典》，「大餅」。',
  publisher: '教育部',
  title: '大餅',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/506/',
  published: '線上辭典（2026年10月查閱）',
  usage: '大餅：喜餅、禮餅，訂婚時女方分送親友的餅。',
}
SOURCES['hakka-four-months'] = {
  id: 'hakka-four-months',
  citation: '劉淑貞，〈做四個月〉，教育部《臺灣客語辭典》禮俗專欄（約2021年）。',
  publisher: '教育部',
  title: '做四個月',
  url: 'https://hakkadict.moe.edu.tw/static/resource/禮俗/110_029_做四個月.pdf',
  published: '約2021年（2026年10月查閱）',
  usage: '客家「做四個月」的收涎：餅數取雙數（十二、二十四、三十六片），請年長者用餅在嬰兒嘴邊抹一抹。',
}
SOURCES['tcmb-erlin-red-turtle'] = {
  id: 'tcmb-erlin-red-turtle',
  citation: '洪崇銘撰，〈二林地區紅龜粿習俗〉，蔗青文化工作室，國家文化記憶庫（訪談日期2021年1月21日）。',
  publisher: '國家文化記憶庫',
  title: '二林地區紅龜粿習俗',
  url: 'https://tcmb.culture.tw/zh-tw/detail?indexCode=Culture_Object&id=635964',
  published: '2021年（2026年10月查閱）',
  usage: '紅龜粿的紅白之別沒有全臺通則：二林的喪禮只把紅龜粿當祭品，常與鼠麴粿一起；芳苑王功一帶的龜粿皮不染紅、只在頂端點紅點。',
}
SOURCES['chen-jingkuan-2022-xingang'] = {
  id: 'chen-jingkuan-2022-xingang',
  citation: '陳靜寬，〈日治時期臺南州地方特產的創生及其歷史意義：以新港飴為例〉，國史館臺灣文獻館網站所載期刊論文，2022年。',
  publisher: '國史館臺灣文獻館',
  title: '日治時期臺南州地方特產的創生及其歷史意義：以新港飴為例',
  url: 'https://ws.th.gov.tw/002/TH/tjpdf20241015/var/www/html/new_site/05publish/03publishquery/02journal/tj/401073306.pdf',
  published: '2022年（2026年10月查閱；刊名待核）',
  usage: '轉引清代《續修臺灣府志》：納采有大餅、豚肩、糖品（二手轉引，原書待核）；日治時期日本人引進羊羹、饅頭、煎餅等菓子的做法，在臺灣多成為伴手禮。',
}
SOURCES['chen-yuzhen-2021-kamatiam'] = {
  id: 'chen-yuzhen-2021-kamatiam',
  citation: '陳玉箴，〈你想來點…漢餅還是麵包？百年前的烘焙業〉，「歷史學柑仔店」，2021年。',
  publisher: '歷史學柑仔店',
  title: '你想來點…漢餅還是麵包？',
  url: 'https://kamatiam.org/%E4%BD%A0%E6%83%B3%E4%BE%86%E9%BB%9E%E6%BC%A2%E9%A4%85%E9%82%84%E6%98%AF%E9%BA%B5%E5%8C%85%E7%99%BE%E5%B9%B4%E5%89%8D%E7%9A%84%E7%83%98%E7%84%99%E6%A5%AD/',
  published: '2021年（2026年10月查閱）',
  usage: '男方納采備大餅、豬肉、糖品；日治時期大稻埕的寶香齋在1934年的商工名錄列為「和洋菓子店」。作者另有《臺灣史研究》28卷1期（2021）的論文〈漢餅、臺灣菓子、麵包〉。',
}
SOURCES['ltn-2011-wedding-cakes'] = {
  id: 'ltn-2011-wedding-cakes',
  citation: '楊久瑩，〈【百年老店】喜餅大對抗〉，《自由時報》，2011年10月2日。',
  publisher: '自由時報',
  title: '【百年老店】喜餅大對抗',
  url: 'https://news.ltn.com.tw/news/life/paper/528293',
  published: '2011年10月2日',
  usage: '約1977年香港超群西餅進入臺灣，奶酥喜餅走紅；報導時西式喜餅與漢式大餅約八比二。',
}
SOURCES['nmth-kueh-mold-0563'] = {
  id: 'nmth-kueh-mold-0563',
  citation: '國立臺灣歷史博物館典藏，「朱漆三面龜桃連錢紋帶柄粿印」，登錄號2003.001.0563。',
  publisher: '國立臺灣歷史博物館',
  title: '朱漆三面龜桃連錢紋帶柄粿印',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2003.001.0563',
  published: '典藏網（2026年10月查閱）',
  usage: '龜粿印 3D 模型的形制依據：木質，長36.1×寬17.3×高3.3公分；一面龜紋（龜甲兩圈、中央六角框內刻「壽」），一面桃紋與銀圓紋，側面七枚連錢，握柄底部鑽有鐵圈，表面塗朱漆、有蟲蛀；年代未標明確切時間。',
}
SOURCES['kmh-kueh-mold'] = {
  id: 'kmh-kueh-mold',
  citation: '高雄市立歷史博物館典藏，「龜形陰刻粿印」，KH1998.021.0060。',
  publisher: '高雄市立歷史博物館',
  title: '龜形陰刻粿印',
  url: 'https://collections.culture.tw/kmh_collectionsweb/collection.aspx?GID=M1MHMW',
  published: '典藏網（2026年10月查閱）',
  usage: '對照：樟木粿印，29×14×3公分，戰後；正面壽字與龜、反面壽字與雙連龜，握把有小孔。',
}
SOURCES['foodnext-2023-japan-wedding'] = {
  id: 'foodnext-2023-japan-wedding',
  citation: '青木直己，〈日本婚禮不送喜餅送什麼？〉，《食力 foodNEXT》，2023年。',
  publisher: '食力 foodNEXT',
  title: '日本婚禮不送喜餅送什麼？',
  url: 'https://www.foodnext.net/life/culture/paper/5616822767',
  published: '2023年（2026年10月查閱）',
  usage: '日本的婚禮與慶事常用紅白饅頭等慶事菓子（日本的習俗；臺灣是否有同樣的用法，本站查無）。',
}

/* ── 第 12 階段：主題路線「廟口的一餐」（查證紀錄 docs/research/temple-meal-route.md） ── */
SOURCES['stat-gov-hawker-survey'] = {
  id: 'stat-gov-hawker-survey',
  citation: '行政院主計總處，〈攤販經營概況調查〉簡介，中華民國統計資訊網。',
  publisher: '行政院主計總處',
  title: '攤販經營概況調查：簡介',
  url: 'https://www.stat.gov.tw/cp.aspx?n=2848',
  published: '線上資料（2026年10月查閱）',
  usage: '攤販是由過去農業社會的「市集」「廟會」延續產生的經濟活動。',
}
SOURCES['twreporter-2021-snack-bowl'] = {
  id: 'twreporter-2021-snack-bowl',
  citation: '包子逸，《小吃碗上外太空》（有鹿文化）書摘，《報導者》，2021年5月19日。',
  publisher: '報導者',
  title: '《小吃碗上外太空》書摘',
  url: 'https://www.twreporter.org/a/bookreview-taipei-goldshsu-bowl-and-plate',
  published: '2021年5月19日',
  usage: '白底青花碗是老派小吃常見的食器；鶯歌日用碗盤 1950 年代起步、靠手工轆轤與手繪，1960 年代引進閃光釉；早年圓環小吃攤的碗容易混淆，後來有在碗上燒店號的服務；1970 年代政府推動免洗餐具。',
  context: '書摘的主角是一家現存的餐具商號，本站只取產業的一般情形，不寫商號。',
}
SOURCES['taiwanceramics-yingge-bowl'] = {
  id: 'taiwanceramics-yingge-bowl',
  citation: '台灣碗盤博物館藏，「鶯歌手繪魚紋碗公」，館藏編號 TW-5-01-00-0-B-0030。',
  publisher: '台灣碗盤博物館',
  title: '鶯歌手繪魚紋碗公',
  url: 'https://english.taiwanceramics.com.tw/?p=2544',
  published: '線上典藏（2026年10月查閱）',
  usage: '碗的形制依據：陶製，1945–1964 年，口徑 20.5、高 8.5 公分，碗內以藍色與紅褐色手繪鯉魚與水草、碗口飾有花邊；同館另藏胭脂紅蝦紋小碗（約 18.5 × 5.8 公分）等戰後鶯歌碗。',
}
SOURCES['gvm-2017-mitaimu'] = {
  id: 'gvm-2017-mitaimu',
  citation: '魚夫，〈米苔目、米篩目和老鼠粄〉，《遠見雜誌》，2017年11月3日。',
  publisher: '遠見雜誌',
  title: '米苔目、米篩目和老鼠粄',
  url: 'https://www.gvm.com.tw/article/40754',
  published: '2017年11月3日',
  usage: '作者的說法：臺語「米苔目」音譯自客語「米篩目」；陳年在來米漿加番薯粉揉成「米胎」，在竹製米篩目板上用力搓揉，穿過孔洞成為米條；傳統器具另有槓桿壓榨、鐵片或瓢器鑽孔等形式。',
}
SOURCES['stust-2021-douhua'] = {
  id: 'stust-2021-douhua',
  citation: '方子毓，〈豆花(1)：話說這一碗白花花的「擣灰」！〉，《南台通識電子報》第92期，南臺科技大學通識教育中心，2021年1月15日。',
  publisher: '南臺科技大學通識教育中心',
  title: '豆花(1)：話說這一碗白花花的「擣灰」！',
  url: 'https://genedu.stust.edu.tw/Sysid/genedu/621GEP/GEP10/gep1092_13.pdf',
  published: '2021年1月15日',
  usage: '作者的兒時回憶：扁擔掛兩個大桶，分裝豆花與冰涼糖水（冬天換熱糖水），孩子捧碗拿湯匙、拿五圓硬幣或十元紙鈔等待；民國七〇年代後挑擔漸被推車與鈴聲取代；剛開始加料時印象中只有紅豆。',
  context: '生活回憶，不是特定地點的紀錄；作者以臺南的經驗起筆，本站只取挑擔叫賣的一般情形。',
}
SOURCES['tfam-carrying-pole-1231'] = {
  id: 'tfam-carrying-pole-1231',
  citation: '台灣民俗文物館（臺中市民俗公園）典藏，「籮筐擔」，登錄號1231，國家文化記憶庫／數位典藏聯合目錄。',
  publisher: '台灣民俗文物館',
  title: '籮筐擔',
  url: 'https://catalog.digitalarchives.tw/item/00/32/a4/16.html',
  published: '數位典藏（2026年10月查閱）',
  usage: '竹扁擔的形制依據：以一片剖開的竹子做成的扁擔，長 151.4、寬 7 公分，兩端烤彎略往上翹以免繩子滑落。',
}

/* ── 第 12 階段：主題路線「老屋裡的新生活」（查證紀錄 docs/research/old-house-route.md） ── */
SOURCES['nmth-winnower-2000-003-0001'] = {
  id: 'nmth-winnower-2000-003-0001',
  citation: '國立臺灣歷史博物館典藏，「風鼓車」，登錄號2000.003.0001。',
  publisher: '國立臺灣歷史博物館',
  title: '風鼓車',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2000.003.0001',
  published: '典藏網（2026年10月查閱）',
  usage: '風鼓 3D 模型的形制依據與用法：木質，長77.2×寬139.8×高129.1公分、36公斤；風鼓斗、風鼓掩、風鼓櫃、風鼓肚與風鼓葉、風鼓手、頭皂與二皂；倒入風乾的穀粒、搖風鼓手、抽開風鼓掩，飽滿的穀粒從頭皂二皂流出，空殼雜物被吹出風鼓口；館方引臺灣總督府殖產局《臺灣之農具》（1921）。',
}
SOURCES['nmth-motor-winnower'] = {
  id: 'nmth-motor-winnower',
  citation: '國立臺灣歷史博物館典藏，「風鼓車製造情形」（照片），登錄號2010.006.0093.0065。',
  publisher: '國立臺灣歷史博物館',
  title: '風鼓車製造情形',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2010.006.0093.0065',
  published: '典藏網（2026年10月查閱）',
  usage: '說明傳統風鼓車的把手是人力手搖，改良的風鼓車在外面裝設馬達、齒輪及皮帶；照片推測年份 1961–1965。',
  context: '照片的年份不是馬達改良版出現的年份，本站只寫「1960 年代前期的照片拍到改良版」。',
}
SOURCES['nmth-rice-ledger'] = {
  id: 'nmth-rice-ledger',
  citation: '國立臺灣歷史博物館典藏，「瑞興號米店帳冊」，登錄號2010.015.0220.0067。',
  publisher: '國立臺灣歷史博物館',
  title: '瑞興號米店帳冊',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2010.015.0220.0067',
  published: '典藏網（2026年10月查閱）',
  usage: '帳冊 3D 模型的形制依據：19.8×19.1×1.4公分、206.5公克，棉線裝訂、前後藍色封面，日本時代；內頁有「庚申」（館方對照同套「大正九年庚申」，約1920年）；所屬的「瑞興號及錦瑞號米店帳冊」全套72冊。',
}
SOURCES['nmth-cake-mould-2012-019-0010'] = {
  id: 'nmth-cake-mould-2012-019-0010',
  citation: '國立臺灣歷史博物館典藏，「酒瓶形單面雕桃形壽字紋帶柄餅印」，登錄號2012.019.0010。',
  publisher: '國立臺灣歷史博物館',
  title: '酒瓶形單面雕桃形壽字紋帶柄餅印',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2012.019.0010',
  published: '典藏網（2026年10月查閱）',
  usage: '餅印 3D 模型的形制依據：木質，22.1×11.7×3.1公分、146公克，推測1960–1980年；單面雕刻，桃形外圈、中央刻「壽」、周圍桃葉與花草；用來製作神誕或壽慶的糕餅；柄尾的紅絲帶是捐贈者後加。',
}
SOURCES['moa-baozhong-weekly'] = {
  id: 'moa-baozhong-weekly',
  citation: '〈文山包種茶 清香最誘人〉，《農業周刊》第15卷第34期，頁4（農業部農業知識入口網收錄）。',
  publisher: '農業部 農業知識入口網',
  title: '文山包種茶 清香最誘人',
  url: 'https://kmweb.moa.gov.tw/redirect_files.php?id=157370',
  published: '約1987年（文中稱1885年為「102年前」；2026年10月查閱掃描版）',
  usage: '包種茶的名稱由來：用方形福建毛邊紙2張內外相襯，放入茶葉4兩，包成長方形的四方包，包外蓋上茶名及行號印章，因此稱為「包種」。',
  context: '同文的創製者與年份（王義程、1885 年南港大坑）用「相傳」，本站不採。',
}
SOURCES['nmth-xfc-tea-tin'] = {
  id: 'nmth-xfc-tea-tin',
  citation: '國立臺灣歷史博物館典藏，「新芳春茶行包種茶茶罐」，登錄號2019.031.0393。',
  publisher: '國立臺灣歷史博物館',
  title: '新芳春茶行包種茶茶罐',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2019.031.0393',
  published: '典藏網（2026年10月查閱）',
  usage: '茶罐 3D 模型的形制依據：金屬方罐，8.6×8.5×9.5公分、199.5公克，推測1932–1945年；一面貼紙，印「合資會社新芳春茶行」與「品名」、手寫「包種茶」；編目說明1932年改組合資會社，主要經營包種茶外銷東南亞。',
  context: '編目說明另寫王連河1919年在大稻埕獨資開設新芳春茶行，與其他來源的創立年份不一（見 xin-fang-chun.md），本站不寫創立年份。',
}
SOURCES['nmth-pharmacy-flyer'] = {
  id: 'nmth-pharmacy-flyer',
  citation: '國立臺灣歷史博物館典藏，「義乾泰藥房廣告單」，登錄號2003.006.0290。',
  publisher: '國立臺灣歷史博物館',
  title: '義乾泰藥房廣告單',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2003.006.0290',
  published: '典藏網（2026年10月查閱）',
  usage: '日本時代「藥局」與「藥房」的差別：依1896年的取締規則，藥局須由藥劑師開設、調劑；藥房（藥種商）向官廳申請即可販賣洋藥與漢藥成藥，門口須掛寫有店名、地址與管理人的標誌。',
}
SOURCES['nmth-medicine-bottles'] = {
  id: 'nmth-medicine-bottles',
  citation: '國立臺灣歷史博物館典藏，「藥瓶」2004.028.5685、「褐色小藥瓶」2019.036.0022.0002。',
  publisher: '國立臺灣歷史博物館',
  title: '藥瓶、褐色小藥瓶',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2019.036.0022.0002',
  published: '典藏網（2026年10月查閱）',
  usage: '藥瓶 3D 模型的形制依據：透明玻璃瓶配木蓋（2004.028.5685，3.6×3.6×7.9公分，年代不明，https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2004.028.5685）；褐色玻璃小藥瓶附蓋（2019.036.0022.0002，2.6×2.6×4.4公分，1926–1965年間）。',
}
SOURCES['aat-apothecary-bottle'] = {
  id: 'aat-apothecary-bottle',
  citation: '藝術與建築索引典，「藥鋪瓶」（AAT 300378929），中央研究院數位文化中心。',
  publisher: '中央研究院',
  title: '藥鋪瓶',
  url: 'http://aat.teldap.tw/AATFullDisplay/300378929',
  published: '線上索引典（2026年10月查閱）',
  usage: '藥鋪瓶的一般形制：通常為玻璃製，配玻璃瓶塞、軟木瓶塞也常見，內容物的名稱以標籤貼示或烙鑄在瓶身上；頸部較寬、多為陶瓷的是「藥罐」。',
}

/* ── 第 12 階段：主題路線「今日報紙」（查證紀錄 docs/research/news-route.md） ── */
SOURCES['hkdp-1890-11-29'] = {
  id: 'hkdp-1890-11-29',
  citation: 'Hong Kong Daily Press, 29 November 1890（社論；Internet Archive 掃描與自動辨識文字）。',
  publisher: 'Hong Kong Daily Press（Internet Archive 典藏）',
  title: 'Hong Kong Daily Press, 1890-11-29',
  url: 'https://archive.org/stream/NPDP18901129/NPDP18901129_djvu.txt',
  published: '1890年11月29日（2026年10月查閱）',
  usage: '社論討論英國代理領事因淡水住處整修，在大稻埕租屋、升英國旗並照會巡撫；清方官員認為淡水才是北部的通商口岸，外國人在大稻埕居住與通商只是被默許；社論認為這件事迫使雙方表態。',
  context: '自動辨識文字有錯字與斷句（人名也有誤認），本站只改寫大意、不引原文；社論對條約用語的解讀，摘要讀取時出現不同理解，本站不寫社論的結論。',
}
SOURCES['cai-2019-chenghuang'] = {
  id: 'cai-2019-chenghuang',
  citation: '蔡孟儒，《《臺灣民報》系報刊中的城隍信仰論述與創作分析》，國立臺灣大學臺灣文學研究所碩士論文，2019（DOI：10.6342/NTU201903936），頁33–35。',
  publisher: '國立臺灣大學',
  title: '《臺灣民報》系報刊中的城隍信仰論述與創作分析',
  url: 'https://tdr.lib.ntu.edu.tw/bitstream/123456789/620/1/ntu-108-1.pdf',
  published: '2019年',
  usage: '引《臺灣民報》1929年6月23日〈迷信趣談 城隍吃牲醴？巡查擒八將！〉（批評迎城隍「其行列的低級單純」）與同日小言〈可憐的少女們〉（藝閣上的少女將近二百人，自正午起被扛遊行到七點多鐘，熱度九十六七度）；轉引《臺灣日日新報》1918年6月19日〈稻江準備迎城隍〉（投書建議城隍祭引進商號贊助的藝閣）與1927年6月13日〈久しぶりの晴天に 大賑ひの城隍廟祭 どの汽車も滿員の盛況〉。',
}
SOURCES['song-2012-yingshen'] = {
  id: 'song-2012-yingshen',
  citation: '宋光宇，〈1920 年代迎神賽會與臺北商業體系的形成〉，《宗教哲學》第62期，2012，頁113–147（經蔡孟儒 2019 轉引）。',
  publisher: '宗教哲學',
  title: '1920 年代迎神賽會與臺北商業體系的形成',
  url: 'https://tdr.lib.ntu.edu.tw/bitstream/123456789/620/1/ntu-108-1.pdf',
  published: '2012年（本站經蔡孟儒 2019 碩士論文頁35轉引，原文未直接查閱）',
  usage: '1917年後藝閣兼具廣告機能；該年六月大稻埕商人推出化妝遊行，各商號以藝閣宣傳商品，遊行隊伍高達五千人。',
}
SOURCES['allen-2005-expo'] = {
  id: 'allen-2005-expo',
  citation: 'Joseph R. Allen, “Exhibiting the Colony, Suggesting the Nation: The Taiwan Exposition, 1935,” MLA Convention paper, 2005.',
  publisher: 'Case Western Reserve University（會議論文全文）',
  title: 'Exhibiting the Colony, Suggesting the Nation: The Taiwan Exposition, 1935',
  url: 'https://case.edu/affil/sce/Texts_2005/Allen%20MLA%202005%20w%20illustrations.pdf',
  published: '2005年（2026年10月查閱）',
  usage: '博覽會除了三個主要會場，另有第四個會場由地方商界倡議，設在臺灣人商號集中的大稻埕；介紹南方的展館都在大稻埕會場，由臺灣人商人而不是殖民當局組織經營。作者引程佳惠（2004）頁40–42。',
}
SOURCES['wiki-1935-expo'] = {
  id: 'wiki-1935-expo',
  citation: '維基百科，〈始政四十周年記念臺灣博覽會〉（大稻埕分場段落）。',
  publisher: '維基百科',
  title: '始政四十周年記念臺灣博覽會',
  url: 'https://zh.wikipedia.org/zh-tw/%E5%A7%8B%E6%94%BF%E5%9B%9B%E5%8D%81%E5%91%A8%E5%B9%B4%E8%A8%98%E5%BF%B5%E8%87%BA%E7%81%A3%E5%8D%9A%E8%A6%BD%E6%9C%83',
  published: '線上百科（2026年10月查閱）',
  usage: '大稻埕分場：今太平國小北邊空地、4,000坪，原本沒有規劃、由大稻埕的臺灣人要求設置；展館有南方館、暹邏館、菲律賓館、福建省特產物介紹所、馬產館、演藝館；大稻埕商家聘請京劇團分五輪演出。',
  context: '這一段沒有逐句註腳（條目的參考資料有程佳惠 2004 等），屬網路百科、可信度較低；本站只取與 Allen 2005 一致的大意，展館名稱標待核。',
}
SOURCES['nmth-expo-ticket-2009-011-0281'] = {
  id: 'nmth-expo-ticket-2009-011-0281',
  citation: '國立臺灣歷史博物館典藏，「始政四十周年記念臺灣博覽會團體入場券」，登錄號2009.011.0281。',
  publisher: '國立臺灣歷史博物館',
  title: '始政四十周年記念臺灣博覽會團體入場券',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2009.011.0281',
  published: '典藏網（2026年10月查閱）',
  usage: '入場券 3D 模型的形制依據：紙質，9.1×13.6公分、1.6公克；正面印編號、大人小人與費用，背面注意事項，各會場有打洞記號，第一、第二會場、分場與夜間會場都可以用；博覽會1935年10月10日至11月28日，分場之一在大稻埕迪化街附近。',
}
SOURCES['udn-1968-pedicab'] = {
  id: 'udn-1968-pedicab',
  citation: '〈人力三輪客車 今起禁行北市〉，《聯合報》1968年6月25日第3版（「報時光」2022年5月12日轉載）。',
  publisher: '聯合報系 報時光',
  title: '人力三輪客車 今起禁行北市',
  url: 'https://time.udn.com/udntime/story/122390/6308783',
  published: '1968年6月25日（轉載2022年5月12日）',
  usage: '1968年6月25日起人力三輪客車全面禁止在臺北市區行駛；營業三輪車收購價每輛三千元、1964年8月提高為六千元，最後一天自行轉業者每輛共可領一萬二千元；約八百人已輔導轉為計程車司機、約七百人等待訓練；全市原剩891輛，已收購826輛、65輛未繳車。',
  context: '報導寫的是臺北市全市，沒有大稻埕專屬的記載。',
}
SOURCES['taipei-gov-2009-p098018'] = {
  id: 'taipei-gov-2009-p098018',
  citation: '臺北市政府公告，府都規字第09803474000號（民國98年8月11日），修訂「大稻埕歷史風貌特定專用區容積移轉作業要點」。',
  publisher: '臺北市政府',
  title: '修訂大稻埕歷史風貌特定專用區容積移轉作業要點公告',
  url: 'https://webgis.udd.gov.taipei/book/P098018.pdf',
  published: '2009年8月11日',
  usage: '計畫緣起：大稻埕歷史風貌特定專用區都市計畫於民國89年1月27日公告實施（89年2月1日零時起生效），訂定容積移轉作業要點，允許配合歷史性建築物及傳統街區風貌保存的基地，將可建築容積之一部分或全部移轉至另一宗基地，保障土地所有權人權益；至98年3月底共申請240件、移出101,739.64平方公尺，尚約七成可移轉容積未申請。',
}

/* ── 第 12 階段：主題路線「軼事系列」（查證紀錄 docs/research/folklore-route.md） ── */
SOURCES['ntu-kua-zhou-cheng-1951'] = {
  id: 'ntu-kua-zhou-cheng-1951',
  citation: '《周成過臺灣歌 上本》（卷端題名：周成過臺灣新歌），竹林書局，新竹，民國40年6月；國立臺灣大學圖書館「歌仔冊與唸歌」數位典藏，楊雲萍文庫，索書號539.1208 4614 v.622。',
  publisher: '國立臺灣大學圖書館',
  title: '周成過臺灣歌 上本',
  url: 'https://dl.lib.ntu.edu.tw/s/kua-a-tsheh/item/691854',
  published: '1951年6月（2026年10月查閱詮釋資料）',
  usage: '歌仔冊 3D 模型的形制依據（4葉、16公分）與故事大意：館方分類「時事新編」、內容時代標清代；主角泉州人周成，妻子月裡為他籌船費來臺，周成在臺北的茶行生意發達，卻迷戀郭仔麵、聽信她毒死尋夫來臺的妻子，月裡向閻王申冤，兇手一一遭報應；正直的王根曾勸周成打拼。',
  context: '館方影像、全文與詮釋資料限非營利學術研究使用，本站不轉載唱詞，只改寫館方摘要的大意。',
}
SOURCES['tfam-bowed-shoes-0346'] = {
  id: 'tfam-bowed-shoes-0346',
  citation: '台灣民俗文物館（臺中市民俗公園）典藏，「弓鞋」，登錄號0346，國家文化記憶庫／數位典藏聯合目錄。',
  publisher: '台灣民俗文物館',
  title: '弓鞋',
  url: 'https://catalog.digitalarchives.tw/item/00/32/a2/16.html',
  published: '數位典藏（2026年10月查閱）',
  usage: '弓鞋 3D 模型的形制依據：清末民初，布製，長11、寬4.8、高5公分，120公克；尖頭、高跟、高鞋面，紅布繡花（日文說明寫黑布，記載不一）；纏足的閩南籍婦女所穿，主要是富裕人家。',
}
SOURCES['nmth-rice-sieve-2005-008-1708'] = {
  id: 'nmth-rice-sieve-2005-008-1708',
  citation: '國立臺灣歷史博物館典藏，「米篩」，登錄號2005.008.1708。',
  publisher: '國立臺灣歷史博物館',
  title: '米篩',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2005.008.1708',
  published: '典藏網（2026年10月查閱）',
  usage: '米篩 3D 模型的形制依據與用途：竹篾與厚竹片編製（登錄的材質欄寫木質，與描述不一），長74.2×寬73.6×高7.4公分、1.53公斤，日本時代至戰後；圓盤狀、面大而淺、「壓一挑一」四角孔，口緣以粗竹條夾住內外兩側、尾端以籐皮返折纏繞；篩選米穀豆類、收成後篩出稻穀；婚俗的八卦米篩迎娶時遮在新娘頭頂避邪。',
}
SOURCES['ylps-fazhugong'] = {
  id: 'ylps-fazhugong',
  citation: '臺北市大同區永樂國民小學，「大稻埕主題式網頁」：法主公廟。',
  publisher: '臺北市永樂國小',
  title: '大稻埕主題式網頁：法主公廟',
  url: 'https://dadaochen.ylps.tp.edu.tw/content.php?titlename=far&output_menu=true',
  published: '學校網頁（2026年10月查閱）',
  usage: '法主公的傳說：宋朝時福建永春州九龍潭的石牛洞有能化為人形的千年大蛇，張氏三兄弟入洞制服；乞龜還龜：信徒向法主公祈求，翌年連本帶利、一隻還兩隻（龜指紅龜粿）。',
  context: '學校的鄉土教材網頁，傳說的部分本站標坊間傳說。',
}
SOURCES['zhao-1992-taipei-streets'] = {
  id: 'zhao-1992-taipei-streets',
  citation: '趙莒玲，《臺北市古街之旅》，臺北市政府新聞處，1992，頁62–63（經維基百科〈大稻埕〉轉引）。',
  publisher: '臺北市政府新聞處',
  title: '臺北市古街之旅',
  url: 'https://zh.wikipedia.org/zh-tw/%E5%A4%A7%E7%A8%BB%E5%9F%95',
  published: '1992年（本站經維基百科轉引，原書未直接查閱）',
  usage: '法主公廟的大龜會：信徒許願登錄後拿取紅龜粿（乞龜），隔年還兩隻；三年未還，廟方把名字寫在紅紙上張貼，俗稱「龜上壁」。',
}

/* ── 第 12 階段：主題路線「街坊故事」（查證紀錄 docs/research/neighbour-route.md） ── */
SOURCES['nmth-glazed-jar-2005-010-0340'] = {
  id: 'nmth-glazed-jar-2005-010-0340',
  citation: '國立臺灣歷史博物館典藏，「醬釉帶蓋筒形罐」，登錄號2005.010.0340。',
  publisher: '國立臺灣歷史博物館',
  title: '醬釉帶蓋筒形罐',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2005.010.0340',
  published: '典藏網（2026年10月查閱）',
  usage: '陶罐 3D 模型的形制依據：日本時代，臺灣南投，陶瓷，高15.3、徑15.4公分、872.8公克；器身上寬下窄、上下各兩道陰刻弦紋，橙紅胎拉坯成形、外施醬釉，笠式平沿蓋、蓋紐為回首坐臥的獅形；多用於儲存食物。',
}
SOURCES['nmth-snack-basket-2000-001-0010'] = {
  id: 'nmth-snack-basket-2000-001-0010',
  citation: '國立臺灣歷史博物館典藏，「墨繪竹編點心籃組」，登錄號2000.001.0010。',
  publisher: '國立臺灣歷史博物館',
  title: '墨繪竹編點心籃組',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2000.001.0010',
  published: '典藏網（2026年10月查閱）',
  usage: '點心籃 3D 模型的形制依據與用途：推測日治時期或戰後初期，竹篾編製（材質欄登錄為木質），長50.5、寬40.5、高74.3公分、3.3公斤；一組三件：頂蓋（中央隆起、墨繪多層六邊形）、中隔層（壁高約9公分、底下米字竹條）、提籃（提把6細1粗竹條、頂端藤圈、中央藤環穿扁擔，外壁墨書福祿壽變體字與花卉藤蔓）；農忙時盛裝點心或飯菜，下層放菜或點心、上層放碗筷。',
}
SOURCES['nmth-apothecary-scale-2011-025-0249'] = {
  id: 'nmth-apothecary-scale-2011-025-0249',
  citation: '國立臺灣歷史博物館典藏，「戥秤組合」，登錄號2011.025.0249。',
  publisher: '國立臺灣歷史博物館',
  title: '戥秤組合',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2011.025.0249',
  published: '典藏網（2026年10月查閱）',
  usage: '戥秤 3D 模型的形制依據與用途：日本時代（依秤盤底的「台」字徽紋推定），整組8.1×24.7×3.5公分、131.6公克；琵琶形木盒兩個凹槽收秤與秤陀；戥秤約20公分、徑約0.5公分，一端包金屬、黑色秤星、兩條紫繩提紐、紫繩連金屬秤盤；鐘形秤陀刻「官二」、頂端小耳繫紅繩；秤金銀珠寶或藥材等微量貴重物品，至今仍是中藥行的器具。',
}
SOURCES['nmth-silver-bracelet-2003-014-0152'] = {
  id: 'nmth-silver-bracelet-2003-014-0152',
  citation: '國立臺灣歷史博物館典藏，「繩紋銀手鐲」，登錄號2003.014.0152.0002。',
  publisher: '國立臺灣歷史博物館',
  title: '繩紋銀手鐲',
  url: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2003.014.0152.0002',
  published: '典藏網（2026年10月查閱）',
  usage: '手鐲 3D 模型的形制依據：清代或日本時代，銀，直徑6.1、高0.6公分、17.8公克；數條銀條相互交織繞成圓環、開口處可套入手腕，造型簡樸無紋飾；臺灣民間稱為「繩索環」「索仔環」「腳車藤」。',
}

export function getSource(id) {
  return SOURCES[id] ?? null
}
