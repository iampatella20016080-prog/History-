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

export function getSource(id) {
  return SOURCES[id] ?? null
}
