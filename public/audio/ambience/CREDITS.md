# 環境音：來源與授權

這個資料夾的環境音全部是 **CC0 或公有領域** 的真實錄音，經過剪輯做成可無縫循環的短音檔（不使用 CC-BY 等需要署名的授權）。
資料檔是 `src/audio/ambienceCredits.js`，這份文件由 `node tools/music/write_ambience_credits.mjs` 產生；剪輯程式是 `tools/music/build_ambience_real.py`
（只做剪輯、濾波、音量、峰值限制、淡入淡出、交叉淡化與混音，沒有加入任何合成的聲音）。

格式：單聲道 32 kHz、MP3 64 kbps，前後各多 1 秒循環內容（網頁以 loopStart = 1、loopEnd = 1 + 循環長度播放）。
「情境示意」表示錄音不是當年、當地的聲音，只取它的聲響質感。

`synth/` 裡是第 9 階段程式合成的示意音（由 tools/music/generate_ambience.py 以 numpy 濾波雜訊與加法合成，沒有第三方素材），只在真實錄音載入或解碼失敗時使用。

## 各年代用到的聲音

| 年代 | 音檔 |
| --- | --- |
| 港口商街（qing-port） | `river-lap.mp3`、`oars.mp3` |
| 酒樓繁華（banquet） | `river-lap.mp3`、`gong-distant.mp3` |
| 摩登大稻埕（modern） | `river-lap.mp3`、`bicycle-bell.mp3`、`gramophone.mp3` |
| 庶民生活（postwar） | `river-lap.mp3`、`trishaw.mp3`、`radio.mp3` |
| 老屋新生（revival） | `river-lap.mp3` |
| 雨天（只在精緻畫質，五個年代都有） | `rain.mp3` |

## 音檔

| 音檔 | 循環 | 大小 | 來源 | 剪輯 | 情境示意 |
| --- | --- | --- | --- | --- | --- |
| `river-lap.mp3`（河水拍岸） | 12 秒 | 110 KB | ceich93〈Water_Lapping_River.wav〉 | 剪 10–24 秒（沒有人聲、車聲的段落）；去掉 120 Hz 以下的風噪；尾端 2 秒交叉淡化接回開頭成 12 秒循環。 | 情境示意：美國哈德遜河的卵石岸，不是淡水河；只取河水拍岸的聲響。 |
| `oars.mp3`（船槳與水花） | 12 秒 | 110 KB | ilmari_freesound〈2021-08-30-rowing-boat-009.wav〉 | 剪 8–22 秒的划槳、槳架摩擦與水花（避開 23 秒處最大聲的一下）；去掉 60 Hz 以下；交叉淡化成 12 秒循環。 | 情境示意：芬蘭湖上的木划艇，不是淡水河上的舢舨。 |
| `gong-distant.mp3`（遠處的鑼鼓） | 16 秒 | 141 KB | Jor92〈Chinese Hong Kong folk drums and gongs beating 02〉 | 剪 15–33 秒的連續段落；帶通 120 Hz–1.8 kHz，做成遠處傳來的鑼鼓；交叉淡化成 16 秒循環。 | 情境示意：香港醒獅的鑼鼓，不是日治時期大稻埕的演出；實際的樂器與曲目待核。 |
| `bicycle-bell.mp3`（腳踏車鈴） | 14 秒 | 126 KB | submergent〈bicycle_rideby_stereo_01〉＋trpete〈Traditional Bicycle Bell.wav〉 | 腳踏車滑行經過（4.2 秒）放在第 1 秒；車鈴單響（1.6–4.6 秒）放在第 2.6 秒、連響（19.2–22.6 秒）放在第 9 秒；14 秒循環，接點落在無聲處。 | 情境示意：英國傳統車鈴與現代腳踏車，不是 1930 年代臺灣的錄音。 |
| `gramophone.mp3`（留聲機） | 26 秒 | 219 KB | 作曲：蕭邦（1810–1849）；演奏：拉赫曼尼諾夫（1873–1943）；Victor 唱片 1008（B-24644，第 8 次錄音），1923-12-27〈Mazurka in C sharp minor, op. 63, no. 3 (1923 recording)〉＋thaighaudio〈071416 Victor Victrola playing a record end loop.wav〉 | 唱片剪 2.5–24.5 秒，前後淡入 1 秒、淡出 2.5 秒，放在第 2 秒；Victrola 唱針雜音（1.5–13.5 秒）反覆交叉淡化接成連續底噪，比音樂小 14 dB；兩者帶通 250 Hz–4.5 kHz 模擬喇叭留聲機；26 秒循環，接點只有唱針雜音。 | 情境示意：1934 年開業的波麗路西餐廳以 78 轉電唱機播古典樂（見 docs/research/bolero.md），這裡用年代相近、已是公有領域的 1923 年唱片；不是當年大稻埕實際播放的那一張。 |
| `trishaw.mp3`（三輪車） | 12 秒 | 110 KB | submergent〈bicycle_rideby_stereo_01〉＋RutgerMuller〈Japan_Matsudo_Bicycle_Bell_2.wav〉 | 腳踏車滑行經過放慢到 0.8 倍（較重、較慢）、音量提高，放在第 0.8 秒；松戶的車鈴兩段（降低音量）（1.5–3.8、6.7–8.7 秒）放在第 2.4、8.2 秒；12 秒循環，接點落在無聲處。 | 情境示意：用腳踏車與日本車鈴組成三輪車經過的聲音，沒有找到授權清楚的三輪車錄音。 |
| `radio.mp3`（收音機） | 20 秒 | 173 KB | 作曲：巴哈（1685–1750）；演奏：克萊斯勒、津巴利斯特（小提琴），Walter B. Rogers 指揮；Victor 唱片 76028（C-15560，第 4 次錄音），1915-01-04〈Concerto for two violins Part 1 (1915 recording)〉＋Anellide〈German Radio Saba_AM.wav〉 | 唱片剪 40–56 秒，帶通 300 Hz–3.4 kHz 模擬調幅收音機，前後淡入 1.5 秒、淡出 2 秒，放在第 2 秒；SABA 收音機 AM 底噪（1–23 秒，沒有電台內容）帶通 200 Hz–4 kHz、比音樂小 12 dB，交叉淡化成 20 秒循環；接點只有底噪。 | 情境示意：收音機播放的內容用公有領域的 1915 年古典樂唱片代替，不是當年臺灣電台的節目；收音機雜訊錄自德國 SABA 真空管收音機（機種年代未查證）。 |
| `rain.mp3`（雨聲與屋簷滴水） | 20 秒 | 173 KB | newlocknew〈RAIN_Summer Rain.City Yard.Entrance Canopy.Eaves Leaking.Drops On Plants And Asphalt 3_EM〉 | 剪 120–142 秒（雨勢平穩、沒有雷聲與人聲的段落）；去掉 80 Hz 以下的低頻轟聲；尾端 2 秒交叉淡化接回開頭成 20 秒循環。只在精緻畫質的雨天播放，音量跟著雨勢。 | 情境示意：俄羅斯老社區中庭的雨與屋簷滴水，不是大稻埕的錄音；只取雨打在雨棚、地面與屋簷滴水的聲響。 |

## 原始錄音

### Water_Lapping_River.wav

- 作者：ceich93
- 網址：https://freesound.org/people/ceich93/sounds/318064/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：Water_Lapping_River.wav
- 錄音：美國哈德遜河卵石岸邊，夜間（上傳於 2015-07-30）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`river-lap.mp3`

### 2021-08-30-rowing-boat-009.wav

- 作者：ilmari_freesound
- 網址：https://freesound.org/people/ilmari_freesound/sounds/585316/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：2021-08-30-rowing-boat-009.wav
- 錄音：芬蘭塞馬湖（Lake Saimaa）上的舊木划艇，2021-08-30
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`oars.mp3`

### Chinese Hong Kong folk drums and gongs beating 02

- 作者：Jor92
- 網址：https://freesound.org/people/Jor92/sounds/792545/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：Chinese Hong Kong folk drums and gongs beating 02
- 錄音：香港路邊店家前的醒獅鑼鼓（上傳於 2025-03-15）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`gong-distant.mp3`

### Traditional Bicycle Bell.wav

- 作者：trpete
- 網址：https://freesound.org/people/trpete/sounds/688055/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：Traditional Bicycle Bell.wav
- 錄音：英國傳統機械式腳踏車鈴的單響與連響（上傳於 2023-05-20）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`bicycle-bell.mp3`

### bicycle_rideby_stereo_01

- 作者：submergent
- 網址：https://freesound.org/people/submergent/sounds/826604/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：bicycle_rideby_stereo_01
- 錄音：舊十段變速腳踏車在粗糙路面滑行經過（上傳於 2025-09-15）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`bicycle-bell.mp3`、`trishaw.mp3`

### Japan_Matsudo_Bicycle_Bell_2.wav

- 作者：RutgerMuller
- 網址：https://freesound.org/people/RutgerMuller/sounds/364806/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：Japan_Matsudo_Bicycle_Bell_2.wav
- 錄音：日本千葉縣松戶車站附近的腳踏車鈴，2016 年 10 月下旬
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`trishaw.mp3`

### Mazurka in C sharp minor, op. 63, no. 3 (1923 recording)

- 作者：作曲：蕭邦（1810–1849）；演奏：拉赫曼尼諾夫（1873–1943）；Victor 唱片 1008（B-24644，第 8 次錄音），1923-12-27
- 網址：https://commons.wikimedia.org/wiki/File:Mazurka_in_C_sharp_minor,_op._63,_no._3_(1923_recording).mp3
- 授權：公有領域（錄音：1923 年在美國出版，已進入美國公有領域，臺灣著作權法的錄音保護期（公開發表後 50 年）也已屆滿；演奏者逝世逾 80 年。作曲：作者逝世逾 170 年）（https://commons.wikimedia.org/wiki/Template:PD-US-record-expired）
- 原始檔名：Mazurka_in_C_sharp_minor,_op._63,_no._3_(1923_recording).mp3
- 錄音：78 轉蟲膠唱片，美國國會圖書館 National Jukebox 轉錄（https://www.loc.gov/item/jukebox-38676/）
- 下載：Wikimedia Commons 原始檔
- 用在：`gramophone.mp3`

### 071416 Victor Victrola playing a record end loop.wav

- 作者：thaighaudio
- 網址：https://freesound.org/people/thaighaudio/sounds/350323/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：071416 Victor Victrola playing a record end loop.wav
- 錄音：1916 年 Victor Victrola VV-XI 留聲機播完 78 轉唱片後唱針在終端溝槽的雜音（錄於 2016-07-14）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`gramophone.mp3`

### Concerto for two violins Part 1 (1915 recording)

- 作者：作曲：巴哈（1685–1750）；演奏：克萊斯勒、津巴利斯特（小提琴），Walter B. Rogers 指揮；Victor 唱片 76028（C-15560，第 4 次錄音），1915-01-04
- 網址：https://commons.wikimedia.org/wiki/File:Concerto_for_two_violins_Part_1_(1915_recording).mp3
- 授權：公有領域（錄音：1915 年在美國出版，已進入美國公有領域，臺灣著作權法的錄音保護期（公開發表後 50 年）也已屆滿。作曲：作者逝世逾 270 年）（https://commons.wikimedia.org/wiki/Template:PD-old-auto-record-expired）
- 原始檔名：Concerto_for_two_violins_Part_1_(1915_recording).mp3
- 錄音：78 轉蟲膠唱片，美國國會圖書館 National Jukebox 轉錄（https://www.loc.gov/item/jukebox-11983/）
- 下載：Wikimedia Commons 原始檔
- 用在：`radio.mp3`

### German Radio Saba_AM.wav

- 作者：Anellide
- 網址：https://freesound.org/people/Anellide/sounds/686530/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：German Radio Saba_AM.wav
- 錄音：德國 SABA 2000 Transeuropa 真空管收音機在 AM 波段選台的雜訊，錄於比利時布魯塞爾（上傳於 2023-05-09）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`radio.mp3`

### RAIN_Summer Rain.City Yard.Entrance Canopy.Eaves Leaking.Drops On Plants And Asphalt 3_EM

- 作者：newlocknew
- 網址：https://freesound.org/people/newlocknew/sounds/826025/
- 授權：CC0 1.0（公眾領域貢獻宣告）（https://creativecommons.org/publicdomain/zero/1.0/）
- 原始檔名：RAIN_Summer Rain.City Yard.Entrance Canopy.Eaves Leaking.Drops On Plants And Asphalt 3_EM.wav
- 錄音：俄羅斯葉卡捷琳堡老社區公寓中庭的入口雨棚下，夏天的大雨，屋簷漏水滴在地面與草地上，2025-06-13（Tascam DR-05x）
- 下載：Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載
- 用在：`rain.mp3`
