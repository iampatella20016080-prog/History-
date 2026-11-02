# 滋養豆餡舖 `zi-yang` 室內設計（第 11 階段第 1 段，2026-11-02）

一個年代：老屋新生（迪化街一段 247 號，仍營業；轉角洋樓 `builders/ziyang.js`）。**只依公開照片與報導，不寫店家沒有公開的經營細節，不把虛構對白安在林家人身上**；人物不具名。實地拍的外觀照片比對在 `docs/ziyang/`。

## 0. 摘要

- 店內有一段可用的公開描述（bunnyann 食記）：「店內空間主要分為展示區與櫃台，後方還有滿滿的木製模具牆」；騎樓設長木凳；少數室內茶席位（有低消與時間限制）；騎樓最中套餐、茶席草莓大福套餐。→ 格局：展示櫃＋櫃台＋後方木製模具牆＋茶席 2 桌＋騎樓長凳。熬餡區看不到，不畫。
- 官網網址子代理沒有找到（Marie Claire 圖說寫「滋養和菓子官網」「滋養和菓子 FB」）；《料理．台灣》2021 專訪原文查無（既有章節引用的 `ryori-taiwan-ziyang` 維持）。
- 新器物 2 件：草莓大福 `strawberry-daifuku`、和菓子木型牆 `wagashi-mould-wall`。沿用：最中 `monaka`（糕餅路線已有，補分層）。
- 糕餅路線挑伴手禮的人 `pastry-wagashi`（x -35.4 z -2.6，騎樓）：建議**移進店裡**站展示櫃前（路線的對白本來就是挑伴手禮）。
- 要決定：挑伴手禮的人移不移；騎樓長凳要不要畫（外觀已建好，要核對有沒有）。

## 1. 照片與文獻

### 1.1 有出處

| 事 | 出處 |
| --- | --- |
| 1953 創立於南京西路（「滋養食品」）；1961 第二代起做和菓子；第三代林濬彤承租迪化街 247 號遷入；每天早起熬豆餡，紅豆用屏東萬丹 8 號紅豆 | 既有 `ziyang-about`、`ryori-taiwan-ziyang`、`supertaste-ziyang` |
| 「店內空間主要分為展示區與櫃台，後方還有滿滿的木製模具牆」；「在騎樓設置了長木凳」；少數室內茶席位「有低消和時間限制」；騎樓最中套餐 50 元（最中＋熱紅茶）、茶席草莓大福套餐 250 元（大福、烏龍茶羊羹、紅茶）；草莓大福單顆 80 元 | bunnyann https://bunnyann.tw/nourish/ （食記，價錢不寫進站內） |
| 紅磚外牆；「窗明几淨」、和菓子整齊陳列於展示櫃；「餡料親製」，紅豆萬丹、糯米台東、草莓苗栗；紅豆餡微甜、保留顆粒感；草莓大福一盒 8 入個別包裝；最中為烤米餅殼包紅豆餡 | 蕃薯藤旅遊 https://travel.yam.com/article/116615 |
| 草莓大福「外露式草莓」（草莓頂端外露）、麻糬皮「薄而軟Q」／另一人說「略帶厚度且Q勁十足」、「細緻綿密的紅豆泥」 | 食尚玩家 https://supertaste.tvbs.com.tw/hot/358072 |
| 最中「以糯米燒製成的最中餅殼，金黃酥脆」；巧克力饅頭為白小豆沙；銅鑼燒「餅皮濕潤……包裹豐富的餡料」；「創立超過七十年，原名『林氏滋養』」；中山店南京西路 188 號、迪化街店 247 號 | Marie Claire https://www.marieclaire.com.tw/lifestyle/taste/90965 |

### 1.2 查無
- 官網網址與《料理．台灣》專訪原文（既有出處維持）；熬餡銅鍋的照片或典藏；產品的公分尺寸；熬餡區是否可見；Commons 無滋養的照片。

## 2. 格局（歷史情境重建；外殼已有）

轉角洋樓 `ziyang`（9 × 16.3 m，`site` 取代 north-0、north-1 與一塊廣場）；店面在斜切的轉角，朝西南。室內是 11 棟裡唯一不是長方形的：用轉角的斜牆當立面，室內矩形取轉角後方的 6 × 7 m。

```
shell（本地座標以斜切立面的中心為原點，+z 朝路口）: {
  half: 2.4（斜切面的半寬）, depth: 7.5, wallT: 0.3, groundH: 3.6, ceiling: 3.1, walkD: 1.7,
  room: { minX: -3.0, maxX: 3.0, minZ: -7.0, maxZ: -0.4 },   // 室內展開成矩形；斜牆兩側的三角補牆用 extraObstacles
}
```

| 項目 | 設定 |
| --- | --- |
| door | -0.9 … 0.9（斜切面中央的玻璃門；黑色遮雨棚在門外，已有）；'open'（石材與玻璃櫥窗） |
| partition | z -5.2，-0.8 … 0.8；partitionWindows false（後面是工作間，**不開放**，門關著，`block`；熬餡區看不到） |
| lamps | 吊燈 ×2（淺色木作、現代） |
| items | `displayCase` x -1.2 z -1.8 2.0 × 0.6 × 1.0（玻璃展示櫃：草莓大福、最中、銅鑼燒、羊羹；`strawberry-daifuku`、`monaka` 可近看）；`counter` x 1.8 z -2.6 長 1.4（淺色木作櫃台）；`mouldWall` z -5.15 minX -2.9 maxX -0.9 高 2.4（後方木製模具牆：整面格架放和菓子木型，`wagashi-mould-wall` 可近看，`block: true`）；`teaTable` ×2 x ±1.6 z -4.0（茶席：小桌＋2 椅）；`giftBoxStack`（8 入禮盒，素色） |
| 騎樓 | `benchLong` 沿斜切立面的騎樓（長木凳，依食記；**要核對 `ziyang.js` 的外觀有沒有已經畫**） |
| npcs | `zy-staff` 門市店員，櫃台內；`zy-tea-guest` 茶席的客人（pose 'sit'）；糕餅路線的 `pastry-wagashi` 移到展示櫃前 x -0.4 z -1.0（第 6 節） |

## 3. 器物

### 3.1 沿用（補分層）
- `monaka` 最中（糕餅路線）：form「烤米餅殼包紅豆餡，金黃酥脆」`yam-travel-116615-ziyang` `marieclaire-90965-ziyang`；use「騎樓有最中配熱紅茶的套餐」（價錢不寫）`bunnyann-ziyang`；where 自動列出滋養店內。

### 3.2 新器物

#### `strawberry-daifuku` 草莓大福

- title：草莓大福｜Strawberry daifuku
- lead：薄薄的麻糬皮包著綿密的紅豆泥，草莓的尖頂露在外面；紅豆是屏東萬丹的 8 號紅豆，每天早上熬。｜A thin mochi skin round smooth red-bean paste, the tip of the strawberry showing; the beans are no. 8 red beans from Wandan, Pingtung, simmered every morning.
- actions：`cut` 切開看剖面｜Cut it open → 合上｜Close it
- form
  - 「外露式」草莓：草莓頂端露在麻糬皮外；麻糬皮薄而軟 Q（另一位記者寫略帶厚度）；裡面是細緻綿密的紅豆泥。一盒 8 入、個別包裝。模型大小是示意。｜An “exposed” strawberry, its tip out of the mochi; the skin thin and soft (one reporter calls it slightly thick); inside, smooth red-bean paste. Boxed eight to a box, each wrapped. Size illustrative. `supertaste-ziyang` `yam-travel-116615-ziyang` reconstruction
- making
  - 自己熬餡，每天早上熬豆餡；紅豆用屏東萬丹的 8 號紅豆，比一般小一號；糯米台東、草莓苗栗。紅豆餡微甜、保留顆粒感（蕃薯藤）。｜The fillings are made in-house, the bean paste simmered every morning; the beans are Wandan no. 8, a size smaller than usual; glutinous rice from Taitung, strawberries from Miaoli. The paste is lightly sweet with some whole beans left (Yam Travel). `ryori-taiwan-ziyang` `yam-travel-116615-ziyang`
- use
  - 1961 年第二代起做和菓子，曾赴京都學藝；草莓大福是現在的招牌之一，茶席有大福配羊羹與紅茶的套餐。｜From 1961, under the second generation, the shop made wagashi and studied in Kyoto; the strawberry daifuku is one of today’s signatures, and the tea seats offer it with yokan and black tea. `ziyang-about` `ryori-taiwan-ziyang` `bunnyann-ziyang`
- where
  - 滋養老屋新生的展示櫃與茶席。｜The display case and tea seats at Ziyang in the revival era.
- evidence
  - 食尚玩家；蕃薯藤旅遊 116615；bunnyann 食記；既有章節出處。｜Supertaste; Yam Travel 116615; the bunnyann review; the chapter’s existing sources. `supertaste-ziyang` `yam-travel-116615-ziyang` `bunnyann-ziyang`

#### `wagashi-mould-wall` 和菓子的木型牆

- title：木製模具牆｜The wall of wooden moulds
- lead：櫃台後面一整面牆都是木製的和菓子模具；本站只畫牆與一格格的木型，不畫每一個圖案。｜The whole wall behind the counter is wooden wagashi moulds; this site models the wall and its rows of moulds, not each pattern.
- actions：`look` 走近看｜Take a closer look → 退開｜Step back
- form
  - 「後方還有滿滿的木製模具牆」（食記）；模具的數量、圖案與排法本站沒有照片，模型是示意的格架與素面木型。｜“A wall full of wooden moulds at the back” (the review); their number, patterns and arrangement are not photographed by this site, so the model is an illustrative rack of plain moulds. `bunnyann-ziyang` reconstruction
- making
  - 木型是押出和菓子（例如落雁、練切）形狀的模具；滋養的哪些點心用木型，店家沒有公開，不寫。｜Wooden moulds press the shapes of wagashi such as rakugan or nerikiri; which of Ziyang’s sweets use them is not published, so it is not stated. pending
- use
  - 台式糕餅的餅印（壽字桃形餅印、龜粿印）本站另有器物；和菓子的木型是另一個系統。｜This site has separate objects for Taiwanese cake moulds (the longevity peach mould, the turtle mould); wagashi moulds are a different tradition.
- where
  - 滋養老屋新生的櫃台後牆。｜The back wall behind the counter at Ziyang.
- evidence
  - bunnyann 食記 https://bunnyann.tw/nourish/ 。木型的典藏或店家公開照片：本站沒有找到。｜The bunnyann review; a museum record or shop photograph of the moulds: not found. `bunnyann-ziyang` pending

### 3.3 新增出處

`bunnyann-ziyang`、`yam-travel-116615-ziyang`、`marieclaire-90965-ziyang`。

## 4. 人物與對白

### 門市店員 `zy-staff`（objectId `strawberry-daifuku`）
- 有出處：「餡都是自己熬的，每天早上；紅豆用萬丹的八號紅豆，比一般小一號。」`ryori-taiwan-ziyang`
- 有出處：「1953 年在南京西路開的，1961 年第二代開始做和菓子。」`ziyang-about` `ryori-taiwan-ziyang`
- 虛構對白：「草莓要露頭，一看就知道是大福。」
- 追問「後面那面牆？」→ 有出處：「木頭的模具，滿滿一面。」`bunnyann-ziyang`

### 茶席的客人 `zy-tea-guest`（虛構對白）
- 虛構對白：「大福配羊羹，再一杯紅茶，坐一下就走。」（套餐內容有出處 `bunnyann-ziyang`）
- 虛構對白：「騎樓的長凳也能坐，吃個最中。」

## 5. 入口、碰撞、鏡頭與效能

- 入口：斜切面中央的玻璃門；`entry` 區要沿斜切的牆寫（`shopInterior.js` 的 `entry` 是軸對齊矩形，轉角店要用 `extraObstacles` 補兩側三角、`entry` 取斜面前方的矩形）。
- 碰撞：室內矩形扣掉模具牆與茶席；後門 `block`。騎樓已有碰撞（`ziyang.js`），長凳要加障礙物。
- 鏡頭：天花 3.1；轉角立面的鏡頭遮擋已有，室內加 `cameraOnly`。
- 效能：外殼已是專用樣式、只有一個年代；加室內不動外殼。器物 7 件。

## 6. 要使用者決定的事

1. **糕餅路線的人 `pastry-wagashi`**：移進店裡站展示櫃前（建議），路線節點位置要改。
2. **騎樓長凳**：核對外觀程式有沒有畫；沒有就加。
3. **木型牆**：只畫素面木型（建議），不畫圖案。
4. 如果有實地拍的店內照片（`docs/ziyang/` 目前只有外觀），格局可以依照片調整。
