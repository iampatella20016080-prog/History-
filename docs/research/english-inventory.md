# 英文版盤點

由 `node tools/i18n/inventory.mjs --write` 產生；每次補完一批要重新跑。

- 資料檔中文字串：**5983**，尚無英文對應：**1446**（排除 seals、smallSign、hangingSign、lanterns、sign、signText、signLines、original、quote、taiwanese、romanization、zh、hanzi、script 等刻意保留的欄位）
- 介面元件裡仍寫死中文的行：**14**

## 資料檔

| 檔案 | 中文字串 | 缺英文 | 缺的字數 |
| --- | ---: | ---: | ---: |
| `src/data/ciShengMiaokouData.js` | 146 | 0 | 0 |
| `src/data/dihuaNianhuoData.js` | 53 | 0 | 0 |
| `src/data/doddLayout.js` | 8 | 0 | 0 |
| `src/data/eras.js` | 80 | 0 | 0 |
| `src/data/huangYujieLayout.js` | 23 | 0 | 0 |
| `src/data/huangYujieMuseum.js` | 59 | 0 | 0 |
| `src/data/inspectObjects.js` | 191 | 0 | 0 |
| `src/data/jiangWeiShuiData.js` | 33 | 0 | 0 |
| `src/data/liChunShengData.js` | 35 | 0 | 0 |
| `src/data/liTingXiangData.js` | 85 | 0 | 0 |
| `src/data/licenses.js` | 12 | 0 | 0 |
| `src/data/linHuaTaiQingLayout.js` | 6 | 0 | 0 |
| `src/data/luguoCafeLayout.js` | 10 | 0 | 0 |
| `src/data/miTaiMuLayout.js` | 15 | 0 | 0 |
| `src/data/operatorsData.js` | 52 | 0 | 0 |
| `src/data/overview.js` | 75 | 0 | 0 |
| `src/data/qingPortTalk.js` | 57 | 0 | 0 |
| `src/data/riceAndShineData.js` | 167 | 0 | 0 |
| `src/data/riceAndShineEraConfig.js` | 16 | 0 | 0 |
| `src/data/riceAndShineLayout.js` | 38 | 0 | 0 |
| `src/data/routes/folkloreRoute.js` | 81 | 0 | 0 |
| `src/data/routes/neighbourRoute.js` | 73 | 0 | 0 |
| `src/data/routes/newsRoute.js` | 93 | 0 | 0 |
| `src/data/routes/oldHouseRoute.js` | 90 | 0 | 0 |
| `src/data/routes/pastryRoute.js` | 85 | 0 | 0 |
| `src/data/routes/templeMealRoute.js` | 77 | 0 | 0 |
| `src/data/routes.js` | 82 | 0 | 0 |
| `src/data/shizixuanData.js` | 83 | 0 | 0 |
| `src/data/shizixuanEraConfig.js` | 12 | 0 | 0 |
| `src/data/shizixuanLayout.js` | 44 | 0 | 0 |
| `src/data/shops.js` | 2205 | 3 | 39 |
| `src/data/sources.js` | 1443 | 1443 | 46605 |
| `src/data/squidSoupLayout.js` | 11 | 0 | 0 |
| `src/data/talk.js` | 330 | 0 | 0 |
| `src/data/teaRoute.js` | 12 | 0 | 0 |
| `src/data/templeSnackLayout.js` | 12 | 0 | 0 |
| `src/data/wangJingQuanData.js` | 31 | 0 | 0 |
| `src/data/xiyuanData.js` | 58 | 0 | 0 |

## 介面元件（寫死的中文）

### `src/ui/FoodIllustration.jsx`（1）

- L1165：`<text x="74" y="96" textAnchor="middle" fontSize="12" fill="#fff6e8" fontFamily="serif">包種</text>`

### `src/game/components/EraDirector.jsx`（3）

- L51：`if (!useGameStore.getState().swapEra(job.id, job.to)) throw new Error('轉場已失效：#${job.id}')`
- L56：`console.error('[大稻埕食光街] 無法切換到「${job.target}」，留在原本的年代：', error)`
- L86：`console.error('[大稻埕食光街] 年代轉場發生錯誤：', error)`

### `src/game/components/EraScene.jsx`（1）

- L89：`console.warn('[大稻埕食光街] ${zone.id} 室內產生失敗，稍後再試：', error)`

### `src/game/components/FlickerDebug.jsx`（9）

- L15：`['bounds', '外框'],`
- L16：`['shadows', '關閉陰影'],`
- L17：`['transparent', '關閉透明物件'],`
- L18：`['lod', '關閉距離切換'],`
- L19：`['facade', '隱藏立面'],`
- L20：`['decals', '隱藏貼花'],`
- L42：`panel.innerHTML = '<strong>DEBUG_FLICKER</strong><br>' + OPTIONS.map(([key, label]) => '<label style`
- L52：`rows.push({ name: o.name || o.parent?.name || '(未命名)', material, vertices: o.geometry?.attributes?.p`
- L57：`console.info('[DEBUG_FLICKER] 年代群組：', eras)`

## 資料檔缺英文明細（每檔最多列 400 筆）

### `src/data/shops.js`（缺 3）

- `SHOPS[22].address`：保安街49巷17號
- `SHOPS[23].address`：臺北市大同區迪化街一段329號
- `SHOPS[24].address`：臺北市大同區延平北路二段68號

### `src/data/sources.js`（缺 1443）

- `SOURCES.ith-lin-fu-zhen.citation`：中央研究院臺灣史研究所檔案館，〈林復振商行〉。
- `SOURCES.ith-lin-fu-zhen.publisher`：中央研究院臺灣史研究所檔案館
- `SOURCES.ith-lin-fu-zhen.title`：林復振商行
- `SOURCES.ith-lin-fu-zhen.context`：收錄於該館「館藏選粹」專文〈追溯迪化街百年老店林復振商行與乾元藥行〉。
- `SOURCES.ith-lin-fu-zhen.records[0]`：1915年11月2日淡水林振源號致泰益號書信
- `SOURCES.ith-lin-fu-zhen.records[1]`：1933年9月17日臺北復振英記致泰益號書信
- `SOURCES.ith-lin-fu-zhen.recordsNote`：上列書信圖像見於原頁面，圖像來源標示為「長崎泰益號文書，中研院臺史所檔案館數位典藏」。
- `SOURCES.nmth-jiang-shan-lou.citation`：國立臺灣歷史博物館典藏網，〈江山樓〉（典藏號 2004.055.0002）。
- `SOURCES.nmth-jiang-shan-lou.publisher`：國立臺灣歷史博物館
- `SOURCES.nmth-jiang-shan-lou.title`：江山樓
- `SOURCES.nmth-jiang-shan-lou.context`：老照片藏品說明：江山樓由吳江山於1917年創立，為四層樓高的紅磚建築。
- `SOURCES.wiki-jiang-shan-lou.citation`：維基百科，〈江山樓〉。
- `SOURCES.wiki-jiang-shan-lou.publisher`：維基百科
- `SOURCES.wiki-jiang-shan-lou.title`：江山樓
- `SOURCES.wiki-jiang-shan-lou.context`：記為1917年（大正6年）由吳江山獨資設立，四層紅磚建築，1976年拆除。
- `SOURCES.factpedia-jiang-shan-lou.citation`：求真百科，〈江山樓〉。
- `SOURCES.factpedia-jiang-shan-lou.publisher`：求真百科
- `SOURCES.factpedia-jiang-shan-lou.title`：江山樓
- `SOURCES.factpedia-jiang-shan-lou.context`：記為1921年成立，同年11月20日開幕；描述為紅磚造四層樓連棟街屋（同頁詩作註解則記為1917年創
- `SOURCES.jaung-jiang-shan-lou-2015.citation`：莊永明，〈大稻埕名酒樓之三：江山樓〉，莊永明書坊，2015年8月31日。
- `SOURCES.jaung-jiang-shan-lou-2015.publisher`：莊永明書坊（個人部落格，作者為臺灣史作者；文末列有書名與日治報刊出處）
- `SOURCES.jaung-jiang-shan-lou-2015.title`：大稻埕名酒樓之三：江山樓
- `SOURCES.jaung-jiang-shan-lou-2015.context`：記1921年11月20日開業、披露宴三天；吳江山原為東薈芳合夥人，赴廈門、福州、上海考察後創立。紅磚
- `SOURCES.nccu-thesis-jiang-shan-lou-2008.citation`：簡伃君，《江山樓及其在日治時期紳商社交生活中所扮演的角色（1921–1940）》，國立政治大學歷史學
- `SOURCES.nccu-thesis-jiang-shan-lou-2008.publisher`：國立政治大學
- `SOURCES.nccu-thesis-jiang-shan-lou-2008.title`：江山樓及其在日治時期紳商社交生活中所扮演的角色（1921–1940）
- `SOURCES.nccu-thesis-jiang-shan-lou-2008.context`：摘要稱江山樓是推廣臺灣菜的重要餐廳，1920年代後代表臺灣最高烹飪水準，也是紳商社交的場所。本站只讀
- `SOURCES.cna-taiwanese-cuisine-2020.citation`：陳凱棠，〈台菜的身世〉（引曾品滄），中央社文化+，2020年12月7日。
- `SOURCES.cna-taiwanese-cuisine-2020.publisher`：中央通訊社
- `SOURCES.cna-taiwanese-cuisine-2020.title`：台菜的身世
- `SOURCES.cna-taiwanese-cuisine-2020.context`：1923年皇太子午宴十二道大菜用燕窩、鴿蛋、火雞、魚翅、螃蟹、白木耳、鱉、海參；江山樓後來印出列有1
- `SOURCES.foodnext-chen-yuchen-2020.citation`：陳玉箴，〈1923年皇太子的臺灣料理宴〉，食力 Foodnext，2020年10月18日。
- `SOURCES.foodnext-chen-yuchen-2020.publisher`：食力 Foodnext（作者為國立臺灣師範大學副教授）
- `SOURCES.foodnext-chen-yuchen-2020.title`：1923年皇太子的臺灣料理宴
- `SOURCES.foodnext-chen-yuchen-2020.context`：1923年4月24日中午在總督官邸大食堂辦臺灣料理午宴，總督府曾派人赴日試菜；十二道大菜，第七道炸春
- `SOURCES.ziyang-about.citation`：滋養和菓子官方網站，〈商店簡介〉。
- `SOURCES.ziyang-about.publisher`：滋養和菓子
- `SOURCES.ziyang-about.title`：商店簡介
- `SOURCES.ziyang-about.context`：記載「創立於1953年 原址為南京西路」、1953年草創「滋養食品」，以及引進日本製菓技術、迪化街一
- `SOURCES.ryori-taiwan-ziyang.citation`：朱荔詡，〈滋養配方不變 大膽解構甜點〉，《料理．台灣》第55期，中華飲食文化基金會，2021年1月4
- `SOURCES.ryori-taiwan-ziyang.publisher`：財團法人中華飲食文化基金會
- `SOURCES.ryori-taiwan-ziyang.title`：滋養配方不變 大膽解構甜點
- `SOURCES.ryori-taiwan-ziyang.context`：專訪第三代林濬彤：1953年成立之初的樣貌、1961年第二代開始製作和菓子、原址都市更新後遷入迪化街
- `SOURCES.supertaste-ziyang.citation`：食尚玩家（食尚編輯部），〈IG必收！大稻埕7家美拍老屋餐廳，日治洋樓吃和菓子、中藥房喝凍檸茶〉。
- `SOURCES.supertaste-ziyang.publisher`：食尚玩家
- `SOURCES.supertaste-ziyang.title`：IG必收！大稻埕7家美拍老屋餐廳，日治洋樓吃和菓子、中藥房喝凍檸茶
- `SOURCES.supertaste-ziyang.context`：描述滋養豆餡舖的街屋外觀（洋樓古典風格、紅磚牆、高高的牌樓）與現點現做的最中；原頁面未標示刊登日期。
- `SOURCES.tcma-yongle-market.citation`：臺北市市場處，〈臺北市公有永樂市場〉（資料更新：民國113年8月7日）。
- `SOURCES.tcma-yongle-market.publisher`：臺北市市場處
- `SOURCES.tcma-yongle-market.title`：臺北市公有永樂市場
- `SOURCES.tcma-yongle-market.published`：資料更新：民國113年8月7日（2024年）
- `SOURCES.tcma-yongle-market.usage`：永樂市場的成立、改建與開業年份（臺北市市場處的官方網頁）。
- `SOURCES.tcma-yongle-market.context`：沿革：「民國前4年成立，稱為「公設永樂町食料品小賣市場」，民國71年原市場拆除，改建綜合大樓安置原攤
- `SOURCES.taipei-market-info-yongle.citation`：臺北市政府全球資訊網，市集資訊〈臺北市公有永樂市場〉（資料更新：民國108年2月18日）。
- `SOURCES.taipei-market-info-yongle.publisher`：臺北市政府
- `SOURCES.taipei-market-info-yongle.title`：臺北市公有永樂市場
- `SOURCES.taipei-market-info-yongle.published`：資料更新：民國108年2月18日（2019年）
- `SOURCES.taipei-market-info-yongle.usage`：永樂市場各樓層的用途（臺北市政府的市集資訊）。
- `SOURCES.taipei-market-info-yongle.context`：介紹：「1樓生鮮蔬果日用品，2.3樓布匹窗簾飾布買賣縫製，是全台布業零售、批發中心。」
- `SOURCES.ncl-yongle-market.citation`：國家圖書館「臺灣記憶」，〈永樂町市場攤販〉（臺北市文獻委員會提供；說明引自《臺北市志：卷六經濟志商業
- `SOURCES.ncl-yongle-market.publisher`：國家圖書館
- `SOURCES.ncl-yongle-market.title`：永樂町市場攤販
- `SOURCES.ncl-yongle-market.context`：說明：1897年六館街的大稻埕市場落成，1908年（明治41年）改設於大稻埕蘆竹腳街，1933年（昭
- `SOURCES.udn-1995-yongle-market.citation`：景小佩，〈平民的永樂市場布出名〉，《聯合報》1995年4月4日第30版（聯合報系「報時光」2024年
- `SOURCES.udn-1995-yongle-market.publisher`：聯合報系 報時光
- `SOURCES.udn-1995-yongle-market.title`：迪化街永樂市場 從日治時期到現代的百年布料集散地
- `SOURCES.udn-1995-yongle-market.context`：記載市場成立於1908年12月14日；民國71年3月拆除舊建築改建，74年9月完工、10月8日重新開
- `SOURCES.moe-guo.citation`：教育部《臺灣台語常用詞辭典》，「粿」。
- `SOURCES.moe-guo.publisher`：教育部
- `SOURCES.moe-guo.title`：粿
- `SOURCES.moe-guo.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-guo.usage`：「粿」的定義（糯米或粳米等做成的食品的總稱）。
- `SOURCES.moe-guo.context`：釋義：「糕的總稱，指用糯米或粳米等做成的食品。因所加的原料不同而有不同的稱法。」
- `SOURCES.moe-cao-guo.citation`：教育部《臺灣台語常用詞辭典》，「草仔粿」。
- `SOURCES.moe-cao-guo.publisher`：教育部
- `SOURCES.moe-cao-guo.title`：草仔粿
- `SOURCES.moe-cao-guo.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-cao-guo.usage`：草仔粿的材料、做法（外墊葉片、蒸籠蒸熟）與普渡、清明的用途。
- `SOURCES.moe-cao-guo.context`：釋義：外皮以「粿粞」加入艾草或鼠麴草揉成，外墊黃槿葉或月桃葉等，以蒸籠蒸熟；常做為農曆七月普渡或清明
- `SOURCES.moe-hong-gui.citation`：教育部《臺灣台語常用詞辭典》，「紅龜粿」。
- `SOURCES.moe-hong-gui.publisher`：教育部
- `SOURCES.moe-hong-gui.title`：紅龜粿
- `SOURCES.moe-hong-gui.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-hong-gui.usage`：紅龜粿的做法（染紅、以模具印上龜型圖樣後蒸製）與祭祀、添丁的用途。
- `SOURCES.moe-hong-gui.context`：釋義：由糯米製成，粿皮染紅、以模具印上龜型圖樣後蒸製；常用來祭拜神明、酬神，或在添丁時分送親友。
- `SOURCES.moe-cai-tau-guo.citation`：教育部《臺灣台語常用詞辭典》，「菜頭粿」。
- `SOURCES.moe-cai-tau-guo.publisher`：教育部
- `SOURCES.moe-cai-tau-guo.title`：菜頭粿
- `SOURCES.moe-cai-tau-guo.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-cai-tau-guo.usage`：菜頭粿（蘿蔔糕）的材料與做法。
- `SOURCES.moe-cai-tau-guo.context`：釋義：「蘿蔔糕。在來米漿拌入炒過的蘿蔔絲、蝦米等配料，蒸製而成的食品。」
- `SOURCES.moe-yu-guo-qiao.citation`：教育部《臺灣台語常用詞辭典》，「芋粿曲」。
- `SOURCES.moe-yu-guo-qiao.publisher`：教育部
- `SOURCES.moe-yu-guo-qiao.title`：芋粿曲
- `SOURCES.moe-yu-guo-qiao.context`：釋義：「用芋頭、在來米、紅蔥頭、蝦米等，蒸製而成的一種食品。形狀如弧形而得名。」
- `SOURCES.nmth-hong-gui-mold.citation`：國立臺灣歷史博物館典藏網，〈紅龜粿印模轉印紙張〉（登錄號 2010.003.0248）。
- `SOURCES.nmth-hong-gui-mold.publisher`：國立臺灣歷史博物館
- `SOURCES.nmth-hong-gui-mold.title`：紅龜粿印模轉印紙張
- `SOURCES.nmth-hong-gui-mold.published`：典藏網頁（未標示日期；2026年10月查閱）
- `SOURCES.nmth-hong-gui-mold.usage`：粿模的龜甲紋樣，以及紅龜粿在祭祀、年節與做壽的用途。
- `SOURCES.nmth-hong-gui-mold.context`：說明：粿模為早期農業社會居家常見之模具；紅龜粿與紅桃粿在神明誕辰、年節慶典祭祀、祖先祭拜與長輩做壽都
- `SOURCES.moa-guo-rice.citation`：李誠紘、吳以健、王柏蓉、鄭佳綺，〈「粿」然如此製粿稻米品種介紹〉，《臺中區農情月刊》第285期，20
- `SOURCES.moa-guo-rice.publisher`：農業部 農業知識入口網
- `SOURCES.moa-guo-rice.title`：「粿」然如此製粿稻米品種介紹
- `SOURCES.moa-guo-rice.published`：2023年5月29日（《臺中區農情月刊》第285期）
- `SOURCES.moa-guo-rice.usage`：製粿的米：在來米（蘿蔔糕等）與圓糯米（草仔粿、紅龜粿等）。
- `SOURCES.moa-guo-rice.context`：說明蘿蔔糕、碗粿等以在來米製成；圓糯米磨粉後製成草仔粿、紅龜粿、菜包等。
- `SOURCES.moa-cao-guo.citation`：農業部食農教育資訊整合平臺，〈美味與傳統完美結合的草仔粿〉（資料來源：臺南區農業改良場，2023年4
- `SOURCES.moa-cao-guo.publisher`：農業部
- `SOURCES.moa-cao-guo.title`：美味與傳統完美結合的草仔粿
- `SOURCES.moa-cao-guo.published`：2023年4月4日
- `SOURCES.moa-cao-guo.usage`：草仔粿在清明節掃墓祭祖的用途。
- `SOURCES.moa-cao-guo.context`：說明草仔粿「是閩南人與客家人在清明節掃墓祭祖時的經典糕點」。
- `SOURCES.moa-niangao.citation`：林書帆，〈年糕＆蘿蔔糕〉，《鄉間小路》（農業知識入口網，2019年3月8日）。
- `SOURCES.moa-niangao.publisher`：農業部 農業知識入口網
- `SOURCES.moa-niangao.title`：年糕＆蘿蔔糕
- `SOURCES.moa-niangao.published`：2019年3月8日
- `SOURCES.moa-niangao.usage`：蘿蔔糕「菜頭」與「彩頭」的諧音與過年的習俗。
- `SOURCES.moa-niangao.context`：提到「菜頭」與「彩頭」諧音，蘿蔔糕成為過年必備菜色；臺語俗諺「食甜粿，予你趁家伙」；過年前在家做菜頭
- `SOURCES.tcooc-action-bar.citation`：臺北市商業處，〈探索再造店家（依類型）－茶飲冰品〉：導演的豆花店Action! Bar（資料更新：民
- `SOURCES.tcooc-action-bar.publisher`：臺北市政府商業處
- `SOURCES.tcooc-action-bar.title`：探索再造店家（依類型）－茶飲冰品
- `SOURCES.tcooc-action-bar.context`：品牌故事：「2021年，豆花車延伸為豆花店，在迪化街小巷裡，與夢想一同落腳」；改造重點：原名「夢想基
- `SOURCES.gcis-action-bar.citation`：經濟部商工登記公示資料，「導演的豆花店」（商業登記，登記機關：臺北市商業處）。
- `SOURCES.gcis-action-bar.publisher`：經濟部 商工登記公示資料（政府資料開放平臺 API）
- `SOURCES.gcis-action-bar.title`：導演的豆花店：商業登記基本資料
- `SOURCES.gcis-action-bar.context`：核准設立日期：民國110年3月12日；地址：臺北市大同區迪化街1段224巷24號1樓；營業項目：飲料
- `SOURCES.udn-500-action-bar.citation`：于國華，〈文化觀察者于國華／導演的豆花：認識自己、看見家園〉，聯合報系《500輯》，2024年1月2
- `SOURCES.udn-500-action-bar.publisher`：聯合報系 500輯
- `SOURCES.udn-500-action-bar.title`：導演的豆花：認識自己、看見家園
- `SOURCES.udn-500-action-bar.context`：記載何明瑞與齊柏林相約「你在天上飛、我在地上跑」；2019年7月導演的豆花車登場；在迪化街區創辦「夢
- `SOURCES.kinmen-2019-douhua-truck.citation`：李金鎗，〈導演的豆花車巡迴古寧國小〉，金門縣政府全球資訊網（轉載金門日報），2019年12月5日。
- `SOURCES.kinmen-2019-douhua-truck.publisher`：金門縣政府
- `SOURCES.kinmen-2019-douhua-truck.title`：導演的豆花車巡迴古寧國小
- `SOURCES.kinmen-2019-douhua-truck.context`：介紹何明瑞是紀錄片導演、瑞齊傳播有限公司負責人與製作人，2019年入圍電視金鐘獎非戲劇類節目攝影獎；
- `SOURCES.matsu-2025-action-bar-camp.citation`：〈「導演的豆花店」暑期兒童影像紀錄學習營7月到馬祖　21日起報名〉，《馬祖日報》，2025年3月19
- `SOURCES.matsu-2025-action-bar-camp.publisher`：馬祖日報
- `SOURCES.matsu-2025-action-bar-camp.title`：「導演的豆花店」暑期兒童影像紀錄學習營7月到馬祖
- `SOURCES.matsu-2025-action-bar-camp.context`：學習營為公益性質、完全免費，每年暑期巡迴不同的偏鄉與離島；招收國小四至六年級學童，學習用影像捕捉生活
- `SOURCES.moe-douhua.citation`：教育部《臺灣台語常用詞辭典》，「豆花」。
- `SOURCES.moe-douhua.publisher`：教育部
- `SOURCES.moe-douhua.title`：豆花
- `SOURCES.moe-douhua.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-douhua.usage`：豆花的定義（豆漿加鹽滷或石膏凝結；通常加糖水和花生）。
- `SOURCES.moe-douhua.context`：釋義：「在豆漿中加入少量的鹽滷或石膏，使能凝結成比豆腐還嫩的食品。通常加糖水和花生，當作甜食。」
- `SOURCES.moe-maltose.citation`：教育部《臺灣台語常用詞辭典》，「麥芽膏」。
- `SOURCES.moe-maltose.publisher`：教育部
- `SOURCES.moe-maltose.title`：麥芽膏
- `SOURCES.moe-maltose.context`：釋義：「麥芽糖。由含澱粉酶的麥芽使澱粉水解而成，是一種金黃色，有黏性的糖品。」
- `SOURCES.moe-fun-inn.citation`：教育部《臺灣台語常用詞辭典》，「粉圓」。
- `SOURCES.moe-fun-inn.publisher`：教育部
- `SOURCES.moe-fun-inn.title`：粉圓
- `SOURCES.moe-fun-inn.context`：釋義：「一種用番薯粉和紅糖做成的食品。外表為圓形，煮熟後變透明狀。夏天可以涼食，冬天可以熱食。」
- `SOURCES.moe-fun-kue.citation`：教育部《臺灣台語常用詞辭典》，「粉粿」。
- `SOURCES.moe-fun-kue.publisher`：教育部
- `SOURCES.moe-fun-kue.title`：粉粿
- `SOURCES.moe-fun-kue.context`：釋義：「涼粉。用番薯粉做成的粿類食品。」
- `SOURCES.moa-douhua-gel.citation`：任珮君、何昱圻，〈豆花凝膠機制的介紹〉，《桃園區農情月刊》第285期（農業部食農教育資訊整合平臺，2
- `SOURCES.moa-douhua-gel.publisher`：農業部
- `SOURCES.moa-douhua-gel.title`：豆花凝膠機制的介紹
- `SOURCES.moa-douhua-gel.published`：2023年4月15日（《桃園區農情月刊》第285期）
- `SOURCES.moa-douhua-gel.usage`：豆花凝結的原理（大豆蛋白與凝固劑形成凝膠）與鹽滷豆花的口感。
- `SOURCES.moa-douhua-gel.context`：說明豆漿中的大豆蛋白和凝固劑作用形成凝膠結構；以鹽滷作為凝固劑凝結的豆花口感偏硬脆。
- `SOURCES.moa-ice-toppings.citation`：農業部食農教育資訊整合平臺，〈美食剉冰，你要加什麼料！〉，2023年8月2日。
- `SOURCES.moa-ice-toppings.publisher`：農業部
- `SOURCES.moa-ice-toppings.title`：美食剉冰，你要加什麼料！
- `SOURCES.moa-ice-toppings.context`：說明粉粿是粉漿加上山梔子煮過的水攪拌後蒸熟；粉粿黃黃的顏色來自天然色素「山梔子」，又名黃梔。
- `SOURCES.taipei-pictorial-watson.citation`：魚夫，〈屈臣氏大樓的興衰起落〉，《台北畫刊》2017年2月號，頁56–57。
- `SOURCES.taipei-pictorial-watson.publisher`：臺北市政府
- `SOURCES.taipei-pictorial-watson.title`：屈臣氏大樓的興衰起落
- `SOURCES.taipei-pictorial-watson.context`：「最早屈臣氏是臺中實業家李俊啟全權負責經營，他本來在彰化員林開設「德壽堂」」；「1928 年（一說為
- `SOURCES.boch-opendata-assets.citation`：文化部文化資產局，文化資產開放資料：古蹟（1.1）案件清單。
- `SOURCES.boch-opendata-assets.publisher`：文化部文化資產局
- `SOURCES.boch-opendata-assets.title`：文化資產開放資料（古蹟）
- `SOURCES.boch-opendata-assets.context`：2026年10月查詢古蹟（1.1.json）的案件清單，沒有找到名稱含「屈臣氏」「李俊啟」或地址為迪
- `SOURCES.boch-opendata-historic.citation`：文化部文化資產局，文化資產開放資料：歷史建築（1.2）案件清單。
- `SOURCES.boch-opendata-historic.publisher`：文化部文化資產局
- `SOURCES.boch-opendata-historic.title`：文化資產開放資料（歷史建築）
- `SOURCES.boch-opendata-historic.context`：2026年10月查詢歷史建築（1.2.json）的案件清單，同樣沒有找到名稱含「屈臣氏」「李俊啟」或
- `SOURCES.businesstoday-2012-watson.citation`：《今周刊》，2012年10月25日報導（小藝埕與屈臣氏大藥房）。
- `SOURCES.businesstoday-2012-watson.publisher`：今周刊
- `SOURCES.businesstoday-2012-watson.title`：今周刊 2012年10月25日報導
- `SOURCES.businesstoday-2012-watson.context`：「這棟洗石子外牆的三層樓平樑式結構，坐落在街角」；「二○一一年右翼內棟作為「小藝埕」，內有…藝術設計
- `SOURCES.businesstoday-2015-dadaocheng.citation`：《今周刊》，2015年6月25日報導（大稻埕的老屋新生）。
- `SOURCES.businesstoday-2015-dadaocheng.publisher`：今周刊
- `SOURCES.businesstoday-2015-dadaocheng.title`：今周刊 2015年6月25日報導
- `SOURCES.businesstoday-2015-dadaocheng.context`：報導以「這波大稻埕文藝復興風潮」形容迪化街一帶的老屋再利用。
- `SOURCES.gvm-2013-artyard.citation`：《遠見雜誌》，2013年8月28日報導（周奕成與小藝埕）。
- `SOURCES.gvm-2013-artyard.publisher`：遠見雜誌
- `SOURCES.gvm-2013-artyard.title`：遠見雜誌 2013年8月28日報導
- `SOURCES.gvm-2013-artyard.context`：「2010年周奕成好不容易獲得…「屈臣氏大藥房」屋主點頭出租，以「大稻埕上賣小藝」發想創立小藝埕，展
- `SOURCES.artyard-about.citation`：大藝埕 ArtYard 官方網站，〈關於〉。
- `SOURCES.artyard-about.publisher`：世代群 Sedai Group
- `SOURCES.artyard-about.title`：大藝埕 ArtYard：關於
- `SOURCES.artyard-about.context`：「自 2011 年的「小藝埕」至今，世代群在大稻埕經營了 10 棟藝埕系列街屋」；「大藝埕 ArtY
- `SOURCES.ntpu-2014-dadaocheng.citation`：國立臺北大學都市計劃研究所，〈大稻埕歷史風貌特定專用區之街區再生計畫〉，2014年6月13日。
- `SOURCES.ntpu-2014-dadaocheng.publisher`：國立臺北大學
- `SOURCES.ntpu-2014-dadaocheng.title`：大稻埕歷史風貌特定專用區之街區再生計畫
- `SOURCES.ntpu-2014-dadaocheng.context`：報告引用小藝埕官網：「一樓：「Bookstore 1920s」及「印花樂」 二樓：「爐鍋咖啡」 三樓
- `SOURCES.supertaste-artyard.citation`：TVBS《食尚玩家》，大稻埕小藝埕介紹。
- `SOURCES.supertaste-artyard.publisher`：TVBS 食尚玩家
- `SOURCES.supertaste-artyard.title`：食尚玩家：小藝埕
- `SOURCES.supertaste-artyard.context`：「2樓的「爐鍋咖啡」主打來自各產區、莊園的單品咖啡，還有義式濃縮和拿鐵。」；「3樓是思劇場」。
- `SOURCES.storm-2018-luguo.citation`：《風傳媒》，2018年12月26日報導（迪化街的屈臣氏大藥房與爐鍋咖啡）。
- `SOURCES.storm-2018-luguo.publisher`：風傳媒
- `SOURCES.storm-2018-luguo.title`：風傳媒 2018年12月26日報導
- `SOURCES.storm-2018-luguo.context`：「屈臣氏大藥房的二樓，有間網路上頗具知名度的爐鍋咖啡」；「所有的咖啡豆都是老闆精選各國的豆子，而且每
- `SOURCES.storm-2015-luguo-guandu.citation`：欣台灣，〈居高臨下的窗景令人心醉！五家藏在二樓的好咖啡〉，《風傳媒》，2015年10月10日。
- `SOURCES.storm-2015-luguo-guandu.publisher`：風傳媒
- `SOURCES.storm-2015-luguo-guandu.title`：居高臨下的窗景令人心醉！五家藏在二樓的好咖啡
- `SOURCES.storm-2015-luguo-guandu.context`：「位於台北藝術大學關渡校區的爐鍋咖啡，基本上是開外掛形式的二樓咖啡」。
- `SOURCES.moa-taiwan-coffee.citation`：農業部農業知識入口網（農業試驗所），〈台灣咖啡沿革〉。
- `SOURCES.moa-taiwan-coffee.publisher`：農業部
- `SOURCES.moa-taiwan-coffee.title`：台灣咖啡沿革
- `SOURCES.moa-taiwan-coffee.context`：「西元1884年(清光緒10年)臺灣咖啡樹栽培最早紀錄，始於英國茶商自馬尼拉引進一百株阿拉比卡咖啡在
- `SOURCES.boch-bolero.citation`：文化部文化資產局，國家文化資產網：歷史建築「波麗路餐廳」（2006年5月17日登錄）。
- `SOURCES.boch-bolero.publisher`：文化部文化資產局
- `SOURCES.boch-bolero.title`：波麗路餐廳（歷史建築）
- `SOURCES.boch-bolero.context`：「本店位於本市民生西路314號，初建於1920年代，後於1934年餐廳開業後進行裝修」；「「波麗路」
- `SOURCES.mirror-2025-bolero.citation`：林亦君（文）、何宗昇（攝），〈波麗路西餐廳〉，鏡週刊，2025年5月4日更新。
- `SOURCES.mirror-2025-bolero.publisher`：鏡週刊
- `SOURCES.mirror-2025-bolero.title`：波麗路西餐廳
- `SOURCES.mirror-2025-bolero.context`：1934年（昭和9年）廖水來自立門戶，原在楊承基的「維特咖啡」任主廚；店名取自樂曲〈BOLERO〉；
- `SOURCES.foodnext-2020-bolero.citation`：魚夫，〈波麗路〉，食力 foodNEXT，2020年7月5日。
- `SOURCES.foodnext-2020-bolero.publisher`：食力 foodNEXT
- `SOURCES.foodnext-2020-bolero.title`：波麗路
- `SOURCES.foodnext-2020-bolero.context`：1934年開幕，民生西路314號；招牌法國鴨子飯、附魚鬆的咖哩飯；年輕人相親的場所；廖水來設計多層鋼
- `SOURCES.gvm-city-2024-bolero.citation`：魚夫，〈波麗路與維特咖啡〉，遠見城市，2024年11月21日。
- `SOURCES.gvm-city-2024-bolero.publisher`：遠見城市
- `SOURCES.gvm-city-2024-bolero.title`：波麗路與維特咖啡
- `SOURCES.gvm-city-2024-bolero.context`：波麗路位於日治時期的太平町三丁目（約今民生西路與延平北路口）；維特咖啡1931年開於太平町三丁目；畫
- `SOURCES.gvm-2011-bolero.citation`：王思涵，〈波麗路：保留1934年的菜色與空間〉，《遠見雜誌》2011年8月號（網頁2011年7月29
- `SOURCES.gvm-2011-bolero.publisher`：遠見雜誌
- `SOURCES.gvm-2011-bolero.title`：波麗路：保留1934年的菜色與空間
- `SOURCES.gvm-2011-bolero.context`：廖水來赴日學西餐，朋友鼓勵租小店面開業；後來買下該建物，1976年於隔壁開第二店，本店一直在原址；1
- `SOURCES.setn-2020-vite-cafe.citation`：鍾志鵬，〈維特咖啡〉，三立新聞網，2020年10月22日。
- `SOURCES.setn-2020-vite-cafe.publisher`：三立新聞網
- `SOURCES.setn-2020-vite-cafe.title`：維特咖啡
- `SOURCES.setn-2020-vite-cafe.context`：維特咖啡1931年開設，經營者楊承基（楊三郎之兄），位於太平町三丁目路口二樓（今延平北路與南京西路口
- `SOURCES.newtalk-2024-shanshuiting.citation`：林衡哲，〈王井泉與山水亭〉，新頭殼 Newtalk，2024年4月26日。
- `SOURCES.newtalk-2024-shanshuiting.publisher`：新頭殼 Newtalk
- `SOURCES.newtalk-2024-shanshuiting.title`：王井泉與山水亭
- `SOURCES.newtalk-2024-shanshuiting.context`：王井泉在大稻埕經營山水亭臺菜餐廳，常客有林茂生、陳逸松、張文環、呂赫若、吳新榮等，陳逸松出資協助創辦
- `SOURCES.wiki-bolero.citation`：維基百科，〈波麗路西餐廳〉（無腳註，只作對照）。
- `SOURCES.wiki-bolero.publisher`：維基百科
- `SOURCES.wiki-bolero.title`：波麗路西餐廳
- `SOURCES.wiki-bolero.context`：1934年創立，民生西路314號；店名取自拉威爾〈Boléro〉；1947年畫家顏雲連重新設計改建；
- `SOURCES.moe-coffee.citation`：教育部《國語辭典簡編本》，「咖啡」。
- `SOURCES.moe-coffee.publisher`：教育部
- `SOURCES.moe-coffee.title`：咖啡
- `SOURCES.moe-coffee.context`：「種子為咖啡原料，焙乾後研成細末可沖泡為飲料，有興奮神經的效果。」
- `SOURCES.nca-pour-over.context`："hand-pour water over coffee grounds in a filter"（
- `SOURCES.nca-espresso.context`："uses high pressure to force nearly boiling water 
- `SOURCES.nca-cold-brew.context`："coffee made using room-temperature or cooler wate
- `SOURCES.foodnext-cold-brew.citation`：《食力 foodNEXT》，2017年10月20日（冷萃咖啡與冰滴咖啡的差別）。
- `SOURCES.foodnext-cold-brew.publisher`：食力 foodNEXT
- `SOURCES.foodnext-cold-brew.title`：食力 2017年10月20日報導
- `SOURCES.foodnext-cold-brew.context`：冷萃：「注入冷水，於低溫環境中浸泡至少約12小時」；冰滴：「利用5度C以下的冰水混合物…滴入咖啡粉…
- `SOURCES.moe-jiu-hi-kenn.citation`：教育部《臺灣台語常用詞辭典》，「鰇魚羹」。
- `SOURCES.moe-jiu-hi-kenn.publisher`：教育部
- `SOURCES.moe-jiu-hi-kenn.title`：鰇魚羹
- `SOURCES.moe-jiu-hi-kenn.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-jiu-hi-kenn.usage`：魷魚羹的定義與台語讀音（jiû-hî-kenn）。
- `SOURCES.moe-jiu-hi-kenn.context`：釋義：「一種小吃，用魷魚作成的羹湯。」
- `SOURCES.moe-jiu-hi.citation`：教育部《臺灣台語常用詞辭典》，「鰇魚」。
- `SOURCES.moe-jiu-hi.publisher`：教育部
- `SOURCES.moe-jiu-hi.title`：鰇魚
- `SOURCES.moe-jiu-hi.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-jiu-hi.usage`：魷魚曬成乾、做為提鮮食材的說明。
- `SOURCES.moe-jiu-hi.context`：釋義：「魷魚。……時常從腹腔剖開，去除內臟後曝曬成乾，做為料理的提鮮食材之一。」
- `SOURCES.moe-kenn.citation`：教育部《臺灣台語常用詞辭典》，「羹」。
- `SOURCES.moe-kenn.publisher`：教育部
- `SOURCES.moe-kenn.title`：羹
- `SOURCES.moe-kenn.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-kenn.usage`：「羹」的定義（異用字「焿」）。
- `SOURCES.moe-kenn.context`：釋義：「芶芡而成的濃稠湯汁。」用例「花枝羹」；異用字「焿」。
- `SOURCES.moe-biau-khau.citation`：教育部《臺灣台語常用詞辭典》，「廟口」。
- `SOURCES.moe-biau-khau.publisher`：教育部
- `SOURCES.moe-biau-khau.title`：廟口
- `SOURCES.moe-biau-khau.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-biau-khau.usage`：「廟口」的定義與用例。
- `SOURCES.moe-biau-khau.context`：釋義：「廟門口、廟前廣場。」用例：「廟口的榕樹跤不時都有一寡人佇遐泡茶、開講。」（廟口的榕樹下經常都
- `SOURCES.moe-tiam-sim-tann.citation`：教育部《臺灣台語常用詞辭典》，「點心擔」。
- `SOURCES.moe-tiam-sim-tann.publisher`：教育部
- `SOURCES.moe-tiam-sim-tann.title`：點心擔
- `SOURCES.moe-tiam-sim-tann.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-tiam-sim-tann.usage`：小吃攤的台語說法。
- `SOURCES.moe-tiam-sim-tann.context`：釋義：「賣點心小吃的攤販。」
- `SOURCES.moe-sa-te.citation`：教育部《臺灣台語常用詞辭典》，「沙茶」。
- `SOURCES.moe-sa-te.publisher`：教育部
- `SOURCES.moe-sa-te.title`：沙茶
- `SOURCES.moe-sa-te.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-sa-te.usage`：沙茶醬的一般說明（不是老潘的配方）。
- `SOURCES.moe-sa-te.context`：釋義：「用扁魚、蒜酥、麻粉和各種香料調製而成的一種調味料。多用於吃火鍋時的沾醬。」
- `SOURCES.moe-hi-soo.citation`：教育部《臺灣台語常用詞辭典》，「魚酥」。
- `SOURCES.moe-hi-soo.publisher`：教育部
- `SOURCES.moe-hi-soo.title`：魚酥
- `SOURCES.moe-hi-soo.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-hi-soo.usage`：魚酥的一般說明（不是老潘的配方）。
- `SOURCES.moe-hi-soo.context`：釋義之一：「一種臺灣常見的魚肉加工食品。將魚肉、魚骨打成漿，加入麵粉、地瓜粉和其他醬料混合，再切成條
- `SOURCES.moe-tian-bu-la.citation`：教育部《重編國語辭典修訂本》，「甜不辣」。
- `SOURCES.moe-tian-bu-la.publisher`：教育部
- `SOURCES.moe-tian-bu-la.title`：甜不辣
- `SOURCES.moe-tian-bu-la.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-tian-bu-la.usage`：甜不辣的一般說明（不是老潘的配方）。
- `SOURCES.moe-tian-bu-la.context`：釋義：「一種日式食品。為日語てんぷら的音譯。……今日臺灣一般所指的甜不辣，是指條狀或扁平狀的炸魚漿。
- `SOURCES.wiki-ci-sheng-gong.citation`：維基百科，〈大稻埕慈聖宮〉。
- `SOURCES.wiki-ci-sheng-gong.publisher`：維基百科
- `SOURCES.wiki-ci-sheng-gong.title`：大稻埕慈聖宮
- `SOURCES.wiki-ci-sheng-gong.published`：2026年9月25日修訂的版本
- `SOURCES.wiki-ci-sheng-gong.usage`：慈聖宮的現址、1910年遷建，以及廟前的小吃攤。
- `SOURCES.wiki-ci-sheng-gong.context`：「1910年，日本政府實施市區改正，廟宇遷移」，1914年重建完成；「今址位於保安街49巷17號」；
- `SOURCES.mirror-2025-squid.citation`：裴偉，〈裴社長小吃手記6／萬華大稻埕的魷魚美食〉，《鏡週刊》，2025年8月。
- `SOURCES.mirror-2025-squid.publisher`：鏡週刊
- `SOURCES.mirror-2025-squid.title`：裴社長小吃手記6／萬華大稻埕的魷魚美食
- `SOURCES.mirror-2025-squid.published`：2025年8月（網頁顯示2025年8月28日最後更新）
- `SOURCES.mirror-2025-squid.usage`：專欄作者對魷魚羹興起的說法（不是學術考證）。
- `SOURCES.mirror-2025-squid.context`：「魷魚羹在70年代於萬華、大稻埕一帶興起，除了因為港口聚眾、喜歡這一味的人多，供貨源頭迪化街就在附近
- `SOURCES.mirror-2026-squid.citation`：裴偉，〈裴社長小吃手記／老台北才懂的魷刃有魚〉，《鏡週刊》，2026年1月2日。
- `SOURCES.mirror-2026-squid.publisher`：鏡週刊
- `SOURCES.mirror-2026-squid.title`：裴社長小吃手記／老台北才懂的魷刃有魚
- `SOURCES.mirror-2026-squid.published`：2026年1月2日（網頁顯示的發布時間）
- `SOURCES.mirror-2026-squid.usage`：專欄作者對迪化街南北貨與乾魷魚的說法（不是學術考證）。
- `SOURCES.mirror-2026-squid.context`：「早期的大稻埕是航運港口，因為河港的條件，成為北部南北貨的集散地。」；「來自日本北海道、韓國，後來是
- `SOURCES.fb-pannoodles.citation`：老潘魷魚羹 Pannoodles house，Facebook 粉絲專頁「關於」。
- `SOURCES.fb-pannoodles.title`：老潘魷魚羹 Pannoodles house
- `SOURCES.fb-pannoodles.published`：店家頁面（未標示日期；2026年10月查閱）
- `SOURCES.fb-pannoodles.usage`：店家頁面的名稱。頁面上沒有創立年份，本站不填寫。
- `SOURCES.fb-pannoodles.context`：頁面名稱：「老潘魷魚羹 Pannoodles house」。
- `SOURCES.puddings-2023-pannoodles.citation`：Pudding’s Life，〈台北迪化街美食│老潘魷魚羮》老店口味沙茶魷魚焿.甜不辣~大稻埕永樂市
- `SOURCES.puddings-2023-pannoodles.title`：台北迪化街美食│老潘魷魚羮》老店口味沙茶魷魚焿.甜不辣~大稻埕永樂市場對面
- `SOURCES.puddings-2023-pannoodles.published`：2023年（使用者提供的實訪年份；本次無法開啟頁面核對發表日期）
- `SOURCES.puddings-2023-pannoodles.usage`：只支持該次實訪的記錄：店在「大稻埕永樂市場對面」，品項有沙茶魷魚羹與甜不辣。不當成最新的價格、營業時
- `SOURCES.puddings-2023-pannoodles.context`：依文章標題。本次開發時網站阻擋自動讀取，沒有逐句核對內文；文中的圖片未確認使用權，本站沒有使用。
- `SOURCES.walkerland-2021-laopan.citation`：WalkerLand窩客島，〈【台北美食￭大同區】老潘魷魚羹 x 肉羹麵、魚酥麵&甜不辣〉，2021
- `SOURCES.walkerland-2021-laopan.publisher`：WalkerLand窩客島
- `SOURCES.walkerland-2021-laopan.title`：老潘魷魚羹 x 肉羹麵、魚酥麵&甜不辣
- `SOURCES.walkerland-2021-laopan.published`：2021年2月19日
- `SOURCES.walkerland-2021-laopan.usage`：只支持該次的食記：地址、魚酥、甜不辣、沙茶調味與褪色的招牌。
- `SOURCES.walkerland-2021-laopan.context`：地址「台北市大同區迪化街一段30號」；「整體就是以沙茶最為主要的調味」；「魚酥很新鮮的酥脆」；「招牌
- `SOURCES.andrewplus-laopan.citation`：安魯魯的筆記本，〈老潘魷魚羹 迪化街美食〉。
- `SOURCES.andrewplus-laopan.publisher`：安魯魯的筆記本
- `SOURCES.andrewplus-laopan.title`：老潘魷魚羹 迪化街美食
- `SOURCES.andrewplus-laopan.published`：2024年1月26日發表（2026年9月19日更新）
- `SOURCES.andrewplus-laopan.usage`：只支持該篇食記：門口的攤車、桌上的調味料、品名「乾拌沙茶生魷魚」「沙茶魷魚羹米粉」與「內用區有冷氣開
- `SOURCES.andrewplus-laopan.context`：地址「103台北市大同區迪化街一段30號」；「攤車在外頭」；「內用區有冷氣開放」；「桌子上的醋、胡椒
- `SOURCES.fonfood-laopan.citation`：瘋美食 FonFood，「老潘魷魚羹」店家頁面（網友食記摘錄）。
- `SOURCES.fonfood-laopan.publisher`：瘋美食 FonFood
- `SOURCES.fonfood-laopan.title`：老潘魷魚羹
- `SOURCES.fonfood-laopan.published`：頁面彙整的食記多為2017年前後
- `SOURCES.fonfood-laopan.usage`：只用來核對品名「魚酥羮」「魷魚羮」（網友食記的摘錄，不是店家公告的菜單）。
- `SOURCES.fonfood-laopan.context`：頁面的官方菜單欄「目前沒有資訊」；彙整的食記摘錄中出現「魚酥羮」「肉羮湯」「魷魚羮」等品名。
- `SOURCES.moe-bi-thai-bak.citation`：教育部《臺灣台語常用詞辭典》，「目」（ba̍k）。
- `SOURCES.moe-bi-thai-bak.publisher`：教育部
- `SOURCES.moe-bi-thai-bak.title`：目
- `SOURCES.moe-bi-thai-bak.published`：線上辭典（2026年10月查閱）
- `SOURCES.moe-bi-thai-bak.usage`：「米篩目」（米苔目）的台語寫法、讀音與詞義。
- `SOURCES.moe-bi-thai-bak.context`：「目」的第三個義項是「細孔」，用例：「米篩目」（bí-thai-ba̍k），「米篩的網目，也指篩出的
- `SOURCES.tvbs-2013-temple-food.citation`：食尚玩家編輯部，〈美食雙雄廟口大飽走!大稻埕-霞海城隍廟.慈聖宮〉，《食尚玩家》，2013年4月26
- `SOURCES.tvbs-2013-temple-food.publisher`：食尚玩家（TVBS）
- `SOURCES.tvbs-2013-temple-food.title`：美食雙雄廟口大飽走!大稻埕-霞海城隍廟.慈聖宮
- `SOURCES.tvbs-2013-temple-food.published`：2013年4月26日（網頁的店家資訊卡另有較新的地址）
- `SOURCES.tvbs-2013-temple-food.usage`：只支持該次的報導：舊址、位置的描述與當時「40年老店」的說法（不當成查證過的開業年份）。
- `SOURCES.tvbs-2013-temple-food.context`：「在永樂市場與霞海城隍廟間的巷子中，每到假日必排隊的40年老店「永樂米苔目」」；文中的地址是「台北市
- `SOURCES.tvbs-2013-apang.citation`：食尚玩家編輯部，〈一日北高 阿龐ㄟ國定呷飽日(上)〉，《食尚玩家》，2013年11月27日。
- `SOURCES.tvbs-2013-apang.publisher`：食尚玩家（TVBS）
- `SOURCES.tvbs-2013-apang.title`：一日北高 阿龐ㄟ國定呷飽日(上)
- `SOURCES.tvbs-2013-apang.published`：2013年11月27日
- `SOURCES.tvbs-2013-apang.usage`：只支持該次節目整理的品項：米苔目、嘴邊肉、脆腸（不代表現在的菜單）。
- `SOURCES.tvbs-2013-apang.context`：標題「正宗古早味 手作米苔目」；店家「永樂米苔目」，標籤與描述「米苔目,嘴邊肉,脆腸」。
- `SOURCES.bella-2021-yongle-market.citation`：Bella儂儂，〈大稻埕美食數不完！8間永樂市場美食，不只生魚片連雞捲都有，澎湃的道地好料都在這！〉
- `SOURCES.bella-2021-yongle-market.publisher`：Bella儂儂
- `SOURCES.bella-2021-yongle-market.title`：大稻埕美食數不完！8間永樂市場美食
- `SOURCES.bella-2021-yongle-market.published`：2021年10月2日（網頁顯示2024年7月16日更新）
- `SOURCES.bella-2021-yongle-market.usage`：只支持該次的整理：民樂街的地址、湯頭與小菜的品項（不當成最新的價格或菜單）。
- `SOURCES.bella-2021-yongle-market.context`：「帶點油蔥和韭菜香的米苔目，配上嘴邊肉、豬皮、油豆腐、菜頭…一堆小菜」；「吃完還能無限加大骨湯」；地
- `SOURCES.bella-2025-dadaocheng.citation`：Bella儂儂，〈大稻埕美食地圖！8間「必吃老店」懶人包，從永樂市場吃到迪化街，一篇就夠〉，2025
- `SOURCES.bella-2025-dadaocheng.publisher`：Bella儂儂
- `SOURCES.bella-2025-dadaocheng.title`：大稻埕美食地圖！8間「必吃老店」懶人包
- `SOURCES.bella-2025-dadaocheng.published`：2025年8月10日
- `SOURCES.bella-2025-dadaocheng.usage`：媒體對店史的說法（創立年份、搬遷）與當次提到的品項；創立年份本站未核實。
- `SOURCES.bella-2025-dadaocheng.context`：「從民國五十六年創立至今，已傳承三代」；「搬遷到民樂街後，永樂米苔目的環境更加寬敞明亮」；「湯頭以大
- `SOURCES.judicial-2024-tcda.citation`：臺灣桃園地方法院，〈公告臺灣桃園地方法院113年度法登社字第35號社團法人臺灣文化事業發展協會設立登
- `SOURCES.judicial-2024-tcda.title`：公告臺灣桃園地方法院113年度法登社字第35號社團法人臺灣文化事業發展協會設立登記
- `SOURCES.judicial-2024-tcda.publisher`：臺灣桃園地方法院（司法院網站刊登）
- `SOURCES.judicial-2024-tcda.published`：2024年5月16日（民國113年5月16日）
- `SOURCES.judicial-2024-tcda.supports[0]`：協會正式名稱
- `SOURCES.judicial-2024-tcda.supports[1]`：內政部許可設立日期 2023-10-18
- `SOURCES.judicial-2024-tcda.supports[2]`：法人設立登記日期 2024-05-16
- `SOURCES.judicial-2024-tcda.supports[3]`：宗旨摘要
- `SOURCES.judicial-2024-tcda.usage`：只支持協會的名稱、許可與登記日期及宗旨。公告沒有提到黃玉階、元珍豆醬店或文史館，不能用來說明協會與文
- `SOURCES.judicial-2024-tcda.context`：登記事項：內政部112年10月18日台內團字第1120044388號函許可；113年5月16日登記於
- `SOURCES.tcmb-huang-yujie.citation`：國家文化記憶庫，〈黃玉階〉（建檔單位：衛生福利部國家中醫藥研究所）。
- `SOURCES.tcmb-huang-yujie.title`：黃玉階
- `SOURCES.tcmb-huang-yujie.publisher`：文化部國家文化記憶庫；建檔單位：衛生福利部國家中醫藥研究所
- `SOURCES.tcmb-huang-yujie.published`：頁面未標示日期（2026年10月查閱）
- `SOURCES.tcmb-huang-yujie.supports[0]`：生卒年 1850–1918
- `SOURCES.tcmb-huang-yujie.supports[1]`：1882年遷居大稻埕
- `SOURCES.tcmb-huang-yujie.supports[2]`：經營醬菜業
- `SOURCES.tcmb-huang-yujie.supports[3]`：漢醫救治霍亂、鼠疫等疫病
- …另外 1043 筆
