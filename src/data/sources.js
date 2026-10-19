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
  context: '沿革：「民國前4年成立，稱為「公設永樂町食料品小賣市場」，民國71年原市場拆除，改建綜合大樓安置原攤商，74年開業。」地址為迪化街一段21號。',
}
SOURCES['taipei-market-info-yongle'] = {
  id: 'taipei-market-info-yongle',
  citation: '臺北市政府全球資訊網，市集資訊〈臺北市公有永樂市場〉（資料更新：民國108年2月18日）。',
  publisher: '臺北市政府',
  title: '臺北市公有永樂市場',
  url: 'https://www.gov.taipei/News_Content.aspx?n=9F394A83D9DF4A19&s=500622DD41A6B6A3',
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
  context: '釋義：「糕的總稱，指用糯米或粳米等做成的食品。因所加的原料不同而有不同的稱法。」',
}
SOURCES['moe-cao-guo'] = {
  id: 'moe-cao-guo',
  citation: '教育部《臺灣台語常用詞辭典》，「草仔粿」。',
  publisher: '教育部',
  title: '草仔粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/13709/',
  context: '釋義：外皮以「粿粞」加入艾草或鼠麴草揉成，外墊黃槿葉或月桃葉等，以蒸籠蒸熟；常做為農曆七月普渡或清明掃墓時的供品。',
}
SOURCES['moe-hong-gui'] = {
  id: 'moe-hong-gui',
  citation: '教育部《臺灣台語常用詞辭典》，「紅龜粿」。',
  publisher: '教育部',
  title: '紅龜粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/5433/',
  context: '釋義：由糯米製成，粿皮染紅、以模具印上龜型圖樣後蒸製；常用來祭拜神明、酬神，或在添丁時分送親友。',
}
SOURCES['moe-cai-tau-guo'] = {
  id: 'moe-cai-tau-guo',
  citation: '教育部《臺灣台語常用詞辭典》，「菜頭粿」。',
  publisher: '教育部',
  title: '菜頭粿',
  url: 'https://sutian.moe.edu.tw/zh-hant/su/8972/',
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
  context: '說明：粿模為早期農業社會居家常見之模具；紅龜粿與紅桃粿在神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽都可見到。',
}
SOURCES['moa-guo-rice'] = {
  id: 'moa-guo-rice',
  citation: '李誠紘、吳以健、王柏蓉、鄭佳綺，〈「粿」然如此製粿稻米品種介紹〉，《臺中區農情月刊》第285期，2023年5月29日（農業知識入口網）。',
  publisher: '農業部 農業知識入口網',
  title: '「粿」然如此製粿稻米品種介紹',
  url: 'https://kmweb.moa.gov.tw/knowledgebase.php?type=13259&id=420096',
  context: '說明蘿蔔糕、碗粿等以在來米製成；圓糯米磨粉後製成草仔粿、紅龜粿、菜包等。',
}
SOURCES['moa-cao-guo'] = {
  id: 'moa-cao-guo',
  citation: '農業部食農教育資訊整合平臺，〈美味與傳統完美結合的草仔粿〉（資料來源：臺南區農業改良場，2023年4月4日）。',
  publisher: '農業部',
  title: '美味與傳統完美結合的草仔粿',
  url: 'https://fae.moa.gov.tw/theme_data.php?theme=news&sub_theme=hot_news&id=1294',
  context: '說明草仔粿「是閩南人與客家人在清明節掃墓祭祖時的經典糕點」。',
}
SOURCES['moa-niangao'] = {
  id: 'moa-niangao',
  citation: '林書帆，〈年糕＆蘿蔔糕〉，《鄉間小路》（農業知識入口網，2019年3月8日）。',
  publisher: '農業部 農業知識入口網',
  title: '年糕＆蘿蔔糕',
  url: 'https://kmweb.moa.gov.tw/theme_data.php?theme=news&sub_theme=agri_life&id=55163',
  context: '提到「菜頭」與「彩頭」諧音，蘿蔔糕成為過年必備菜色；臺語俗諺「食甜粿，予你趁家伙」；過年前在家做菜頭粿、甜粿、發糕等糕點。',
}

export function getSource(id) {
  return SOURCES[id] ?? null
}
