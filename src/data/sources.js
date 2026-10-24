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

export function getSource(id) {
  return SOURCES[id] ?? null
}
