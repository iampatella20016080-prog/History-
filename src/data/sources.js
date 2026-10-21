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

export function getSource(id) {
  return SOURCES[id] ?? null
}
