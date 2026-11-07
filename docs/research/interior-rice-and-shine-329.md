# 迪化街 329 號 `rice-and-shine-329` 酒樓繁華版室內設計（第 11 階段第 1 段，2026-11-02）

一個年代版本：酒樓繁華（variant `earlyRiceTrade`，「北街米業逐漸形成」）。摩登以後已有完整室內（`riceAndShineInterior.js`）；這份只補 1895–1930 的前店。老屋新生是稻舍（營業中），不涉及。

## 0. 摘要

- 329 號 1895–1915 的使用者：**查無**。最早有名有姓的是 1916 年（大正 5 年）唐塗薩創立的「唐益興米行」（臺灣英文新聞 2022，單一來源）；文化局 2022 新聞稿寫前身「益興碾米工廠」，**2020 年登錄歷史建築**；唐家 2014 年捐給市府。現有寫法「米業逐漸形成」維持，對白可以說「1916 年以後這裡是米行」標單一來源。
- 格局是歷史情境重建：前店（米箱、米斗、米籮、麻袋、桿秤、帳桌）＋店後碾米區**不開放**（碾米間是摩登年代的室內）。
- 新器物 1 件：米箱 `rice-bin`（記憶庫宜蘭米店照片）。沿用並補分層：米斗 `rice-measure`（臺史博兩件圓形官斗）、米篩 `rice-sieve`、麻袋 `jute-sack`、米籮 `carrying-basket`、算盤 `abacus`、桿秤 `tea-scale`。米店帳冊 `rice-ledger` 是老屋路線的器物，不重複放；風鼓是摩登碾米間的，不放。
- 要決定：對白要不要提 1916 唐益興（單一來源）；人物是米店夥計還是買米的客人。

## 1. 照片與文獻

### 1.1 329 號本身
- 臺北市文化局 2022-06-08 https://culture.gov.taipei/News_Content.aspx?n=621F0409A1ABDD34&sms=72544237BBE4C5F6&s=BFD8798AF6AC230B ：迪化街一段 329 號 2020 年登錄歷史建築；前身「益興碾米工廠」，後轉商業及住宅；團隊修復保留碾米工廠氛圍，「展示早期米斗與碾米機」。未寫建築年代。
- 臺灣英文新聞 2022-06-08 https://www.taiwannews.com.tw/ch/news/4563917 （已有 `taiwannews-2022-rice-shine`）：前身為大正五年（1916）唐塗薩創立的唐益興米行；唐家 2014 年捐給市府。
- 公視 2022-06-08（已有 `pts-2022-rice-shine`）：百年老屋、曾是碾米廠、兩年前列歷史建築。
- 旁證：中央社 2026-04-05 https://www.cna.com.tw/news/acul/202604050022.aspx 迪化街一段 270 號和豐商行（五股吳家米業，建物首見登記 1925 年，一坎二落一過水、二層磚木造）核定歷史建築——北段米行群聚的旁證，不涉及 329 號。
- 稻舍官網 https://ricenshine329.com/dihua ：憑證過期，讀不到。
- **1895–1915 的使用者：查無。**

### 1.2 米店器物（典藏）

| 器物 | 登錄號 | 尺寸、材質、年代 | 說明 | 授權 |
| --- | --- | --- | --- | --- |
| 圓形米斗 | 臺史博 2000.001.0044 | 25.7 × 25.3 × 24.9 cm，木，推測 1906–1945 | 印「官」「五升」「穀類用」；五升約 9000 ml；清代方形、日治圓形且官製官賣，販賣須領總督府許可 | CC BY-NC 4.0 |
| 圓形米斗 | 臺史博 2003.001.0898 | 25.8 × 25.8 × 24.5 cm，1.98 kg，木，1906–1945 | 總督府官賣度量衡器，有押蓋火戳；邊角可加銅皮防磨 | PDM |
| 方形米斗 | 臺史博 2001.001.0174 | 8.1 × 8.2 × 5.7 cm，木 | 日式方斗，記「花春」店號 | CC0 |
| 木斗（米斗＋斗棒） | 臺史博 2004.028.0797.0002 | 25.3 × 25.5 × 24.7 cm，戰後 | 朱紅漆、刻容量與「穀類用」，後轉宮廟禮斗用 | — |
| 米籮、麻袋、風鼓車 | 見 `interior-lin-fu-zhen.md`（2003.001.0530、2002.005.0289）、已有 `nmth-winnower-2000-003-0001` | | | |
| 米升、米斗（記憶庫，屏科大農機具陳列館） | 260251 | 木板拼接、邊角鑲銅皮 | 「10 合為 1 升，10 升為 1 斗」；斗界刮平 | CC BY-NC-ND 3.0 TW |
| 傳統米店（記憶庫，宜蘭南館市場，2020 攝） | 559158 | — | 〔照片〕觀察（依條目說明）：木製大米箱盛米；早期以升、斗計價，買米自備米袋；1 斗＝10 升＝11.5 台斤 | CC BY-NC 3.0 TW |

- 米缸、米甕、米櫃的臺史博條目：查無。
- 日治米店或土壟間的店內照片：查無（臺史博《觀‧臺灣》54 期的基隆米店文章只有帳冊照片；已有 `nmth-rice-ledger`）。

## 2. 格局（歷史情境重建）

沿用稻舍的外殼與程式：`riceAndShineInterior.js` 加 `earlyRiceTrade` 分支，`VARIANT_SPACES.earlyRiceTrade = ['street', 'arcade', 'front']`。前店的範圍用 `RS.frontShop`（外殼程式已有）；通往天井與後進的門**關著**（`block: true`，熱點「後面是住家與倉庫」），人物不能走進還沒建模的空間。

| 項目 | 設定 |
| --- | --- |
| door | 依 `RS.frontShop` 的門位置；門板式 |
| items | `riceBin` x -1.6 z -2.4 1.6 × 0.8 × 0.9（木製大米箱，斜開蓋，裡面白米與糙米兩格，`rice-bin` 可近看）；`counter` x 1.6 z -2.8 長 1.6（桿秤 `tea-scale`、算盤 `abacus`、米斗 `rice-measure` 放櫃面）；`sackPile` x 1.9 z -1.0 count 3（麻袋 `jute-sack`，稻穀）；`carryingBasket` ×2 門內（米籮 `carrying-basket`）；`sieveRack` x -2.4 z -4.2（米篩 `rice-sieve` 掛牆，`block: false`）；`ledgerDesk` 小桌（帳簿示意，不是老屋路線的米店帳冊）；街邊既有的「米」「碾米」木牌與「糧」布幡保留 |
| npcs | `rs-banquet-shopman` 米店夥計，站米箱旁 x -0.6 z -2.4 面向 +x；`rs-banquet-customer` 提米袋來買米的客人，站門內（有出處：買米自備米袋） |

## 3. 器物

### 3.1 沿用（補五層）

- `rice-measure` 米斗（已有）：補 form「日治圓形官斗：印『官』『五升』『穀類用』，五升約 9000 ml；清代是方形，日治改圓形且官製官賣，販賣要領總督府許可（臺史博 2000.001.0044）；邊角可加銅皮防磨（2003.001.0898）」、making「量的是米與穀，斗界刮平（記憶庫 260251）」、use「1 斗＝10 升＝11.5 台斤，早期以升、斗計價（記憶庫 559158）」、where「329 號米店（酒樓繁華、摩登）、稻舍的展示；林復振不用斗」、evidence 四件典藏。`nmth-rice-measure-2000-001-0044` `nmth-rice-measure-2003-001-0898` `tcmb-rice-measures-260251` `tcmb-rice-shop-559158`
- `rice-sieve`（已有 `nmth-rice-sieve-2005-008-1708`）：where 加 329 號前店。
- `jute-sack`、`carrying-basket`、`abacus`、`tea-scale`：where 加 329 號。

### 3.2 新器物

#### `rice-bin` 米店的木米箱

- title：米箱｜Rice bin
- lead：木板釘的大箱子，斜開的蓋，裡面分格裝白米、糙米；客人自己帶米袋來，夥計用斗量、用秤秤。｜A big box of nailed boards with a sloping lid, divided inside for white and brown rice; customers brought their own bags, and the shopman measured by the dou and weighed on the steelyard.
- actions：`scoop` 舀一斗｜Scoop a dou → 倒回去｜Pour it back
- form
  - 依國家文化記憶庫「傳統米店」（宜蘭南館市場，2020 年攝）的說明：木製大米箱盛米。模型分兩格、斜蓋，尺寸是示意；日治時期北街米店的米箱照片本站沒有找到。｜After the National Memory Bank entry “A traditional rice shop” (Nanguan market, Yilan, photographed 2020): rice kept in large wooden bins. The model has two compartments and a sloping lid, sizes illustrative; no photograph of a Japanese-era North Street rice shop’s bin was found. `tcmb-rice-shop-559158` reconstruction
- making
  - 稻穀碾成糙米、再碾成白米；北街後來是碾米廠聚集的地段，329 號 1916 年起是唐益興米行、後來是益興碾米工廠。｜Paddy is milled to brown rice and again to white; North Street later became the rice-mill quarter, and no. 329 was the Tang Yixing rice shop from 1916 and later the Yixing rice mill. `taiwannews-2022-rice-shine` `culture-taipei-2022-rice-shine` pending
- use
  - 早期以升、斗計價，買米自備米袋；1 斗＝10 升＝11.5 台斤。｜Rice was priced by the sheng and the dou, and buyers brought their own bags; one dou is ten sheng, about 11.5 Taiwanese catties. `tcmb-rice-shop-559158`
  - 日治時期的米斗是官製官賣的度量衡器，販賣要領總督府許可。｜In the Japanese era the dou measure was made and sold under government monopoly, and selling one needed a Government-General licence. `nmth-rice-measure-2000-001-0044`
- where
  - 329 號米店酒樓繁華的前店；摩登以後的碾米間與戰後米行是另一套擺設。｜The front shop of no. 329 in the banquet era; the mill and the postwar rice shop in later eras are a different set.
- evidence
  - 記憶庫 559158（CC BY-NC 3.0 TW）；臺史博米斗 2000.001.0044、2003.001.0898；文化局 2022-06-08 新聞稿；臺灣英文新聞 2022。｜Memory Bank 559158; NMTH dou measures 2000.001.0044 and 2003.001.0898; Taipei Department of Cultural Affairs press release, 8 Jun 2022; Taiwan News 2022. `tcmb-rice-shop-559158` `nmth-rice-measure-2000-001-0044` `culture-taipei-2022-rice-shine` `taiwannews-2022-rice-shine`
  - 329 號 1895–1915 年的使用者：查無。｜Who used no. 329 between 1895 and 1915: not found. pending

### 3.3 新增出處

`nmth-rice-measure-2000-001-0044`、`nmth-rice-measure-2003-001-0898`、`tcmb-rice-measures-260251`、`tcmb-rice-shop-559158`、`culture-taipei-2022-rice-shine`、`cna-2026-hefeng-rice`。

## 4. 人物與對白

### 米店夥計 `rs-banquet-shopman`（objectId `rice-bin`）
- 有出處：「買米自己帶袋子來，我用斗量：一斗十升，十一斤半。」`tcmb-rice-shop-559158`
- 有出處：「這斗是官製的，上面有『官』字火戳，私做的不能賣。」`nmth-rice-measure-2000-001-0044`
- 虛構對白：「北街這幾年米行一家一家開，船從上游載穀下來。」（米行群聚是文化局與中央社的旁證，句子標虛構）
- 追問「這間店叫什麼？」→ 有出處（單一來源）：「大正五年起這裡是唐家的益興米行——不過那是以後的事，現在還說不準。」`taiwannews-2022-rice-shine`（見第 6 節）

### 買米的客人 `rs-banquet-customer`（虛構對白）
- 虛構對白：「兩斗糙米，米袋在這。」
- 虛構對白：「白米貴，糙米煮久一點一樣香。」

## 5. 入口、碰撞、鏡頭與效能

- 沿用稻舍外殼：`RS.frontShop` 的範圍、騎樓與門；後門 `block`。
- 碰撞：`VARIANT_SPACES` 加 `'arcade'`、`'front'`；其他店家測試裡用 `inRiceAndShineLot` 排除的判斷要改成「酒樓繁華也有室內」。
- 鏡頭：沿用稻舍前進的 `camera` 設定。
- 效能：只加一個 variant 的室內，不動外殼，基準不變。器物 7–8 件。

## 6. 要使用者決定的事

1. **1916 唐益興米行**（單一來源）：對白要不要提？建議放在追問裡、句子標單一來源；年代設定的 label「北街米業逐漸形成」不改。
2. **人物**：夥計＋客人兩位，或只放夥計？建議兩位（客人的「自備米袋」有出處）。
3. **後進**：這個年代後面關著；要不要讓人看得到天井（門半開、`block`）？建議門關。

## 7. 實作紀錄（2026-11-07）

第 6 節三項都先照建議做：1916 唐益興放在夥計的追問、標單一來源；人物兩位；後門關著。與第 2 節不同的地方：

- **外殼**：這個年代的外觀是一般閩南街屋（`buildShophouse`），不是紅磚店屋，所以沒有沿用 `riceAndShineInterior.js` 的外殼，改用共用的街屋室內（`shopInterior.js`，配置在 `data/riceAndShineBanquetLayout.js`）；隔間門關著是新加的選項 `partition.closed`。
- **範圍**：前店到 z = -5.5，比 `RS.frontShop`（z = -3.0）深，才放得下第 2 節 z = -4.2 的米篩與帳桌。
- **位置**：米箱貼左牆（x = -2.05）、櫃台貼右牆（x = 2.15），夥計與客人站在米箱前；座標與第 2 節略有差別，中間才有走道。
- **器物**：第 3.1 節寫「沿用」的 `jute-sack`、`carrying-basket` 在專案裡其實沒有資料，後來依第 8 節做成新器物。
- **模型與文字的落差**：櫃台上的米斗沿用四片木板的方斗模型，和第 3.1 節的日治圓形官斗不同，分層資訊裡有寫明。
- **提示的取捨**：路人與器物只提示比較近的，按 E 時器物又優先於熱點。所以夥計不站第 4 節的米箱正前方，改站米箱靠門的一端；原本的米箱、櫃台熱點拿掉（這兩處由器物近看），改成進門的 `early-shop`。

## 8. 第 2 段補充（2026-11-07，Fable 逐筆核對）

**更正第 0、1、3、4 節的事實**（這些段落保留原文作為紀錄，以本節為準）：

- 「1895–1915 使用者查無」改成「1907 年建屋以前與 1916 年以前查無」。既有 `moc-329-shophouse` 寫建立年代 1907、當時為唐家米行；這是「唐家米行」的第二個來源，但不是 1916 或唐塗薩的來源。
- 臺史博 2000.001.0044：第三個字樣已模糊（「殳用」），「穀類用」是館方推測；重量欄「2.17g」疑為筆誤，不引用。補 1906 年《臺灣度量衡規則》。
- 臺史博 2003.001.0898：沒有「官」字；火戳是兩個倒三角形各立四腳的圖徽。「邊角鑲銅皮」是館方的通則，不是這件的特徵。
- **單位**：記憶庫 559158 的 1 斗＝10 升＝11.5 台斤（6.9 公斤）是 2020 年宜蘭一家店的戰後台制斗；日治官斗五升約 9000 毫升，一斗約 18 公升，不是同一個斗。第 3.1、3.2、4 節把兩者寫在一起是錯的：現在只在米斗的 use 層拆開說明，對白與米箱都不用這個換算。夥計的對白改成「裝滿、刮平，一斗就是一斗」與「印了『官』字、蓋了總督府的火戳」（後者加 0898）。
- 後進這個年代的用途沒有出處：熱點 `early-back` 與 `RICE_SCENARIO` 不寫「住家與倉庫」，改成「後進這個年代沒有重建，門關著（情境設定）」。「依米店的一般樣貌」改成寫明只依 2020 年宜蘭一家米店的照片說明與博物館典藏。

**出處**：第 3.3 節 5 筆的網址全部開得到，拿掉待核實；另新增 `nmth-jute-sack-2002-005-0289`、`nmth-rice-basket-2003-001-0530`（與 `interior-lin-fu-zhen.md` 第 3.3 節同名，林復振分支合併時去重）。記憶庫兩筆補撰寫者，授權分數位物件與描述文字兩層。文化局那筆換成實際標題。臺史博四件的授權欄是動態載入，讀不到，研究文件記的授權待核。稻舍 Yourator 自介的「唐家米行」「一百一十年」是店家自述，不列入出處。

**器物**：米斗換新的五層；米篩補五層；麻袋、米籮做成新器物（五層）；桿秤補兩條 use，算盤補一條 evidence。接文字時照場景改了三處，與 Fable 的稿不同：

- 米篩的 form 寫「三面米篩」（場景掛三面，稿子寫兩面）。
- 麻袋的 where 寫「門邊與靠後牆的地方」（第二堆在左後方，不在帳桌旁）。
- 麻袋、米籮的 where 拿掉「林復振分支實作後補」：那是開發備註，不該出現在畫面上。林復振分支做好後，「在哪家店」會由街上的擺放自動列出。

**待使用者決定**：米斗新增的 form 要不要說方斗「接近 1906 年以前的樣式」。目前維持「與館藏不同」的中性寫法。
