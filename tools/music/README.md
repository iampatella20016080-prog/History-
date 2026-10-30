# 五個年代的背景音樂（合成配樂草稿）

`public/audio/` 的五個 MP3 都是 **合成配樂草稿**：由 `generate_drafts.py` 以程式離線合成，**不是真實樂器錄音**，也沒有使用付費服務、取樣音源或既有曲目。曲子是原創的藝術化配樂方向，不宣稱還原當年的實際音樂。專案中沒有可用的音樂生成工具或音色庫，所以先用這個方式做出可以實際播放的草稿，日後可直接替換成正式配樂。

| 年代 | 檔案 | 速度 | 三個主要聲部 |
| --- | --- | --- | --- |
| 1853–1895 港口商街 | `era-qing-port.mp3` | 96 BPM，6 小節 | 琵琶感撥弦主旋律（含輪指）、竹笛回應短句、輕木擊（D 宮五聲音階） |
| 1895–1930 酒樓繁華 | `era-banquet.mp3` | 64 BPM，4 小節 | 洞簫感長旋律（倚音裝飾）、古箏感撥弦分解和弦、克制的拍板（A 羽調五聲） |
| 1930–1945 摩登大稻埕 | `era-modern.mp3` | 128 BPM 輕搖擺，8 小節 | 柔和鋼琴主旋律、撥奏低音提琴、鼓刷（F 大調） |
| 1945–1980 庶民生活 | `era-postwar.mp3` | 96 BPM，6 小節 | 木吉他主旋律、柔和手風琴（含低音鍵）、輕木擊（G 大調） |
| 2000–現在 老屋新生 | `era-revival.mp3` | 96 BPM 直拍半速感，6 小節 | 柔和電鋼琴和弦、尼龍弦吉他短旋律、輕刷奏與沙鈴（多留白） |

## 合成方式

- 撥弦（琵琶、古箏、吉他、低音提琴）：各泛音獨立衰減、高泛音衰減較快，加上撥弦瞬間的雜音
- 吹管（竹笛、洞簫）：柔和泛音＋帶通氣聲＋延遲出現的顫音，起音帶一點滑音；洞簫加倚音
- 鋼琴：兩段式衰減與輕微不諧和泛音；電鋼琴：調頻合成；手風琴：兩組略微錯音的簧片
- 打擊：木擊（衰減共振）、拍板（帶通雜音）、鼓刷與沙鈴（濾波雜音）
- 殘響：以「循環摺積」計算，超過 15 秒的音尾繞回曲首，所以 15 秒的內容首尾完全銜接
- 五首以近似 K 加權的方均根統一響度，峰值低於 -1.5 dBFS，並柔和濾掉 9 kHz 以上的高頻

## 檔案格式與循環

每個檔案 17 秒：**曲尾最後 1 秒＋完整 15 秒＋曲首前 1 秒**。網頁用 Web Audio 的 `AudioBufferSourceNode`
（`loop = true`、`loopStart = 1`、`loopEnd = 16`）循環播放（設定表：`src/audio/musicTracks.js`）。
前後多出的 1 秒是循環內容的延伸，所以即使某些瀏覽器解碼 MP3 時開頭多出或少掉幾十毫秒，循環區間仍然無縫。

## 重新產生與檢查

```bash
python3 tools/music/generate_drafts.py          # 需要 numpy 與 ffmpeg；輸出 public/audio/*.mp3（結果固定，可重現）
python3 tools/music/analyze.py                  # 檢查循環長度、週期性、接點、峰值、響度一致與高頻
```

## 替換成正式配樂

1. 準備 15 秒可無縫循環的音檔，前後各加 1 秒循環內容（或在設定表中把 `loopStart`／`loopEnd` 改成實際的循環點，單位為秒）。
2. 以同樣的檔名放進 `public/audio/`，或修改 `src/audio/musicTracks.js` 的 `file`。
3. 把設定表的 `source` 改成實際來源（作曲者、授權），並更新這份說明。
4. 執行 `python3 tools/music/analyze.py` 與 `node tests/e2e/music.e2e.mjs`（需要開發伺服器），最後務必實際試聽。

## 環境音（`public/audio/ambience/`）

環境音和背景音樂分開，是 **CC0 或公有領域的真實錄音** 剪成的短循環：

```bash
python3 tools/music/build_ambience_real.py <來源資料夾>   # 需要 numpy 與 ffmpeg；來源資料夾沒有的錄音會依網址下載；輸出 public/audio/ambience/*.mp3 並檢查循環接點
node tools/music/write_ambience_credits.mjs              # 由 src/audio/ambienceCredits.js 產生 public/audio/ambience/CREDITS.md
python3 tools/music/generate_ambience.py                 # 合成備援，輸出 public/audio/ambience/synth/*.mp3
```

來源、授權與剪輯記錄見 `public/audio/ambience/CREDITS.md`，年代依據見 `docs/research/ambience-sources.md`。
