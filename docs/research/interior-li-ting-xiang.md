# 李亭香 `li-ting-xiang` 室內設計（第 11 階段第 1 段，2026-11-02）

一個年代：老屋新生（迪化街一段 309 號，仍營業）。**只依公開照片與報導，不寫店家沒有公開的經營細節，不把虛構對白安在李家人身上**；人物不具名。其他三個年代的地段仍是一般街屋，不動。

## 0. 摘要

- 官網 https://lee-cake.com/ 現在是純商店（sitemap 66 個網址全是商品與條款，**沒有品牌故事頁**）。店內描述只有旅遊媒體的文字：「融合紅磚洋樓與白洋房空間」「店內設有內用座位，提供台式下午茶點」、るるぶ「併設咖啡」；櫃台、展示櫃、工作區的描述查無；Commons 只有三張食物照（翠玉綠豆糕、小泡芙，2014，CC BY-SA 2.0）。
- 格局：前店（展示櫃、櫃台）＋內用座位區；**不畫工作區**（查無可見的描述）。全部標歷史情境重建。
- 新器物 2 件：平西餅 `pingxi-cake`、平安龜 `peace-turtle`。沿用：收涎餅 `shouxian-cakes`（糕餅路線已有，店內再放一份）、壽字桃形餅印 `longevity-cake-mould`（已有）。
- 糕餅路線「收涎餅」的外婆 `pastry-shouxian`（門口 x 15.0 z 2.2）：建議維持在門口（她的對白是在街上等孫女，移進店裡要改路線文字）。
- 要決定：外婆移不移；平安龜的餡（兩個來源不同）。

## 1. 照片與文獻

### 1.1 有出處

| 事 | 出處 |
| --- | --- |
| 1895 創立（店家說法）；最盛北部九家，現剩迪化街創始店與新北兩家；李佳陽（前友達處長）接班；華山「糕餅文化館」有糕餅文化牆（壽桃、發糕、收涎餅）、漢餅餅模與拓印版敲打體驗；「餅形更為小巧可愛」 | ETtoday 2019（已有 `ettoday-2019-litingxiang`） |
| 「店面裝潢復古又文青，融合了紅磚洋樓與白洋房空間」「店內還設有內用座位，提供各種台式下午茶點」 | 蕃薯藤旅遊 https://travel.yam.com/article/135298 |
| 「カフェも併設されています」；平安龜「ピーナッツ味の生地で黒ゴマ餡を包んだ」（花生味外皮包黑芝麻餡，1 個 NT$45） | るるぶ https://rurubu.jp/andmore/article/15069 |
| 平安龜：「裹入拌有麥芽糖、花生粉的奶香內餡，覆以壓紋金箔紙，結合台灣乞龜之俗……以『金龜』兼有『金歸』祈求財運」 | 鏡週刊 2023 https://www.mirrormedia.mg/story/20230511cnt003 |
| 平西餅：掌心大小、渾圓；白鳳豆沙內餡；「30 層酥皮」；口味原味、咖哩、香菇、白玉；由來為薛平貴西征傳說（店家說法） | 天下／鏡週刊搜尋摘要（原頁 403，**未讀到**，標待核）；既有 `li-ting-xiang.md` 寫 27 層（今周刊 2020）——**層數兩說** |
| 平西餅內餡白豆沙原料「白鳳豆」曾產於三重、蘆洲 | SIDOLI（已有 `sidoli-litingxiang`，可信度低） |
| Commons：〈Food 翠玉綠豆糕, 李亭香…〉〈經典原味小泡芙〉三張（bryan…，2014，CC BY-SA 2.0）；無店面照 | https://commons.wikimedia.org/w/index.php?search=李亭香&title=Special:MediaSearch&type=image |

### 1.2 查無
- 官網品牌故事全文；櫃台、展示櫃、工作區的照片描述；平西餅、平安龜的公分尺寸；臺史博餅印典藏號（搜尋未跑成；可手動搜「餅模」「粿印」補）。

## 2. 格局（歷史情境重建）

地段 x=16.7 南側，5.4 × 11 m，兩層（最窄的一間）。只在老屋新生換專用樣式 `li-ting-xiang`；其他三個年代仍是一般 `minnan` 街屋。

```
shell: {
  half: 2.7, depth: 11, wallT: 0.3, groundH: 3.3, ceiling: 2.95, walkD: 1.7,
  room: { minX: -2.35, maxX: 2.35, minZ: -10.4, maxZ: -0.34 },
}
```

| 項目 | 設定 |
| --- | --- |
| door | -1.0 … 1.0；'open'（玻璃櫥窗下牆；「紅磚洋樓」用現有 brick 材質，牆面白色） |
| partition | z -6.0，-0.9 … 0.9；partitionWindows false（後面是工作區，**不開放**，門關著，`block`；熱點「後面是工作間，不開放」） |
| lamps | 吊燈 ×2 |
| items | `displayCase` x -1.6 z -1.6 1.6 × 0.6 × 1.0（玻璃展示櫃：平西餅、平安龜、收涎餅、綠豆糕；`pingxi-cake` 與 `peace-turtle` 可近看）；`counter` x 1.6 z -2.4 長 1.4（櫃台、紙盒）；`giftBoxShelf` x 2.3 z0 -4.0 z1 -2.8（禮盒架，素色）；`cafeTable` ×2 x ±1.2 z -4.6（內用座位：小方桌＋2 椅，依「設有內用座位」）；`mouldWall` x -2.3 z0 -5.6 z1 -4.0（餅印掛牆，`longevity-cake-mould` 可近看，`block: false`；華山文化館有餅模展示，本店掛牆是示意）；`shouxianTray`（收涎餅一盤放展示櫃上，`shouxian-cakes`） |
| npcs | `ltx-staff` 門市店員，櫃台內 x 2.2 z -2.4 面向 -x；`ltx-customer` 坐內用座位喝茶的客人 |

## 3. 器物

### 3.1 沿用
- `shouxian-cakes`（糕餅路線）：where 自動列出李亭香店內。
- `longevity-cake-mould`（已有，臺史博 2012.019.0010）：where 加「李亭香店內掛的餅印是示意；華山糕餅文化館有餅模與拓印版可以敲打」`ettoday-2019-litingxiang`。

### 3.2 新器物

#### `pingxi-cake` 平西餅

- title：平西餅｜Pingxi cake
- lead：掌心大的圓餅，一層層的酥皮包著白鳳豆沙；店家說從第一代就在賣，名字來自薛平貴西征的故事。｜A palm-sized round pastry, layer on layer of flaky skin round white kidney-bean paste; the shop says it has sold it since the first generation, and the name comes from the tale of Xue Pinggui’s western campaign.
- actions：`split` 剝開看層｜Break it open → 合起來｜Put it together
- form
  - 掌心大小、渾圓，表面淡金色；剖面是多層酥皮。層數有兩說：今周刊 2020 寫 27 層，另一篇搜尋摘要寫 30 層（原頁未讀到）。｜Palm-sized and round, pale gold on top; the cut face shows many flaky layers. Two counts are given: 27 in Business Today 2020, 30 in another report whose page could not be opened. `businesstoday-2020-litingxiang` pending
  - 模型的大小與層數是示意。｜Size and layer count in the model are illustrative. reconstruction
- making
  - 內餡是白鳳豆沙；小島裡專欄說白鳳豆曾產於三重、蘆洲（可信度低）。口味後來多了咖哩（炒肉入餡）、香菇、白玉——口味與世代的對應只有今周刊一篇，標待核。｜The filling is white kidney-bean paste; a podcast column says the beans were once grown in Sanchong and Luzhou (low reliability). Curry (with stir-fried pork), mushroom and “white jade” flavours came later; which generation added which rests on one Business Today piece and is marked to be verified. `sidoli-litingxiang` `businesstoday-2020-litingxiang` pending
- use
  - 店家說 1895 年創立，創立地有蘆洲、大稻埕兩說；本站只在老屋新生開放這家店。約 1980 年大稻埕沒落時，店裡曾兼賣香菸、罐頭等雜貨。｜The shop dates itself to 1895, with Luzhou and Dadaocheng both given as its birthplace; this site opens the shop only in the revival era. Around 1980, when Dadaocheng declined, it sold cigarettes and tinned goods on the side. `businesstoday-2020-litingxiang` `ettoday-2019-litingxiang` pending
- where
  - 李亭香老屋新生的展示櫃。｜The display case at Li Tingxiang in the revival era.
- evidence
  - 今周刊 2020；ETtoday 2019；鏡週刊 2018。平西餅的照片：本站沒有找到可用授權的照片（Commons 只有綠豆糕與小泡芙）。｜Business Today 2020; ETtoday 2019; Mirror Media 2018. A usable photograph of the cake: not found (Commons has only the mung-bean cake and the cream puffs). `businesstoday-2020-litingxiang` `ettoday-2019-litingxiang` `mirror-2018-litingxiang` pending

#### `peace-turtle` 平安龜

- title：平安龜｜Peace turtle
- lead：龜形的小餅，包著壓紋的金箔紙；借的是台灣「乞龜」的習俗，「金龜」也念成「金歸」。｜A small turtle-shaped pastry wrapped in embossed gold paper; it borrows the Taiwanese custom of “begging a turtle”, and “gold turtle” sounds like “gold returns”.
- actions：`unwrap` 拆開金紙｜Unwrap it → 包回去｜Wrap it up
- form
  - 龜形、覆壓紋金箔紙（鏡週刊 2023）；模型的大小是示意。｜Turtle-shaped, covered in embossed gold foil paper (Mirror Media 2023); the model’s size is illustrative. `mirror-2023-litingxiang` reconstruction
- making
  - 餡有兩種說法：鏡週刊寫「拌有麥芽糖、花生粉的奶香內餡」，るるぶ寫「花生味外皮包黑芝麻餡」；可能是不同年份或口味，本站並列。｜Two accounts of the filling: Mirror Media says a milky filling with maltose and peanut powder; Rurubu says a peanut-flavoured skin round black-sesame paste. They may be different years or flavours; this site lists both. `mirror-2023-litingxiang` `rurubu-litingxiang` pending
- use
  - 乞龜：廟會時向神明「乞」一隻龜形的粿或餅帶回家，明年加倍還——本站的紅龜粿、龜粿印已有說明；平安龜把它做成小餅。｜“Begging a turtle”: at a temple festival one asks the god for a turtle-shaped cake to take home, returning double next year—see this site’s red turtle cake and turtle moulds; the peace turtle makes it a small pastry. `mirror-2023-litingxiang`
- where
  - 李亭香老屋新生的展示櫃；龜粿印在永樂市場（已有）。｜The display case at Li Tingxiang; the turtle mould is at Yongle Market.
- evidence
  - 鏡週刊 2023-05-11；るるぶ。｜Mirror Media, 11 May 2023; Rurubu. `mirror-2023-litingxiang` `rurubu-litingxiang`

### 3.3 新增出處

`mirror-2023-litingxiang`、`rurubu-litingxiang`、`yam-travel-135298-litingxiang`、`commons-litingxiang-mungbean-cake`。

## 4. 人物與對白

### 門市店員 `ltx-staff`（objectId `pingxi-cake`）
- 有出處：「店家說是 1895 年開的；平西餅從第一代就在賣。」`businesstoday-2020-litingxiang`
- 有出處：「店名的由來，店家說是因為騎樓常飄出餅香——亭仔腳的香。」`businesstoday-2020-litingxiang` `sidoli-litingxiang`
- 虛構對白：「裡面有座位，台式下午茶，配一壺茶。」（座位有出處 `yam-travel-135298-litingxiang`，句子標虛構）
- 追問「平安龜是什麼？」→ 有出處：「借乞龜的習俗做的小餅，包金紙；金龜，也是金歸。」`mirror-2023-litingxiang`

### 內用的客人 `ltx-customer`（虛構對白）
- 虛構對白：「平西餅一剝就掉屑，要接著。」
- 有出處（一般）：「華山那邊有他們的糕餅文化館，餅模可以拓印。」`ettoday-2019-litingxiang`

## 5. 入口、碰撞、鏡頭與效能

- 入口：門 2.0 m，櫥窗下牆；面寬 5.4 m，室內只有 4.7 m，展示櫃與櫃台分兩側，中央走道 1.2 m。
- 碰撞：前店＋內用區；後門 `block`；外婆 `pastry-shouxian` 維持在門口（第 6 節）。
- 鏡頭：天花 2.95；窄店 distance 2.6。
- 效能：只在老屋新生換樣式，只更新一個年代的基準。器物 8 件。

## 6. 要使用者決定的事

1. **糕餅路線的外婆**：維持在門口（建議），或移進店裡（路線文字要改）。
2. **平安龜的餡**：兩個來源不同，並列還是只採鏡週刊？建議並列、標待核。
3. **平西餅層數**：27（今周刊）對 30（未讀到的頁面）。建議寫 27、註另一說。
4. **工作區**：查無可見的描述，不畫；要不要在後門加熱點「後面是工作間」？建議加。
