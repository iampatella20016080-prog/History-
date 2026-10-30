# CLAUDE.md

這份文件給在這個專案工作的 Claude Code 參考。完整說明見 `README.md`（很長，需要細節時再查對應段落）。

## 專案

**大稻埕食光街：走進170年的飲食記憶**——第三人稱 3D 探索網站，透過店家與食物介紹大稻埕的歷史。同一條街有五個年代：

| id | 年份 | 名稱 |
| --- | --- | --- |
| `qing-port` | 1853–1895 | 港口商街 |
| `banquet` | 1895–1930 | 酒樓繁華 |
| `modern` | 1930–1945 | 摩登大稻埕 |
| `postwar` | 1945–1980 | 庶民生活 |
| `revival` | 2000–現在 | 老屋新生 |

技術：React 19、@react-three/fiber 9、drei、Three.js 0.186、zustand 5、Vite 8。Node ≥ 20.19。主要目標裝置是 iPad Safari（觸控），桌面也支援。

## 指令

```bash
npm install
npm run dev        # http://localhost:5173（server.host: true，可用區網 iPad 連線）
npm run build      # 輸出到 dist/（base: './'，可部署在任何子路徑）
npm run preview
npm test           # 單元測試：Node 內建 test runner，跑 tests/*.test.js
node --test tests/luguo.test.js   # 只跑一個檔案
```

瀏覽器端對端測試（Playwright，需另外安裝，可用 `PLAYWRIGHT_MODULE` 指定路徑）：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
node tests/e2e/viewer.e2e.mjs http://127.0.0.1:5173/
```

讀取人物／鏡頭狀態的 e2e 需要開發版的 `window.__DDC__`（`src/main.jsx`）。`era-switching.e2e.mjs` 也可以對 `vite preview --port 4173` 的打包版執行。

除錯用網址參數：`?era=<年代 id>`、`?quality=low|medium|high`、`?worker=0`（不用 Web Worker 產生街景）、`?adaptive=0`（停用畫面更新率過低時的自動降解析度）、`?stats=1`（左上角顯示幀率、繪製呼叫、三角形數、解析度；正式版也有效，沒參數時不載入，見 `src/stats/`）。

## 架構

資料驅動：年代與店家都是 `src/data/` 裡的資料，街景由程式產生。

- `src/data/`
  - `eras.js`：每個年代的光線、天空、調色、建築演變規則、街道道具、`availableStores`
  - `shops.js`：店家的座標、各年代建築（`buildingByEra`）、招牌、介紹章節
  - `sources.js`：文獻
  - `*Layout.js`：單一店家或主題的配置，例如 `luguoCafeLayout.js`、`squidSoupLayout.js`、`miTaiMuLayout.js`
  - `routes.js`、`routes/*.js`：主題探索路線（第 12 階段）；每條路線的節點、路人對話、情境人物（`routeFigures.js` 合併）與器物在同一個檔案，器物建模在 `game/builders/routeObjects/`
- `src/game/world/`：街景產生流程
  - 流程：`lots.js`（共用地段）→ `lineage.js`（各年代的建築演變）→ `eraLayout.js`（建築、道具、碰撞 `SITE_COLLISION`）→ `buildWorld.js`（分段產生；室內產生器登記在 `BUILDING_INTERIORS`）
  - 在 `world.worker.js` 中執行，失敗時退回主執行緒
  - `worldManager.js` 最多快取兩個年代，閒置時預先產生下一個年代，室內用 `loadEraInterior` 按需產生
- `src/game/builders/`：程式化建模，例如 `shophouse`、`arcade`、`facade`、`jiangShanLou`、`yongleMarket`／`yongleInterior`、`actionBar`、`luguoCafe`、`ziyang`、`props`、`wires`
- `src/game/components/`：R3F 元件，例如 `EraDirector`（轉場）、`EraScene`、`CameraRig`、`Player`、`SignLayer`、`LanternLayer`、`InteractionSystem`
- `src/game/rendering/`：卡通渲染管線、手繪貼圖、招牌貼圖、材質
- `src/game/character/`：五套年代服裝
- **純邏輯模組（不依賴 React／Three，可以直接單測）**：`eraTransition.js`（轉場狀態機）、`viewerCamera.js`（建築觀賞鏡頭）、`collision.js`（可行走範圍是矩形聯集）、`quality.js`、`atmosphere.js`。新邏輯盡量放在這類模組裡。
- `src/state/useGameStore.js`：zustand store（探索／閱讀、觀賞模式、年代與轉場序號、觸控／滑鼠）
- `src/ui/`：HUD、設定選單（年代、觀看模式、畫質、音樂）、店家名錄、故事視窗（`ui/story/`）、觸控搖桿
- `src/audio/`：背景音樂，每個年代一首，音檔在 `public/audio/era-*.mp3`
- `tools/music/`：產生音樂草稿的 Python 工具
- `docs/`：各功能的截圖

## 新增店家

步驟詳見 README「新增年代內容與店家」。

1. 在 `shops.js` 加入一筆資料。`position` 會自動在地段配置中預留店面。
2. 用 `buildingByEra` 指定各年代的建築：
   - `archetype`：`minnan`、`baroque`、`deco`、`postwar`、`grand-restaurant`、`tea-mansion`、`temple`
   - 另外設定 `condition` 與招牌
   - 沒有列出的年代由一般街屋補上
3. 把店家 id 加入對應年代的 `availableStores`。
4. 形狀特殊的建築改用 `site: { x, z, rotationY, replaces }`，產生器可以回傳 `anchors` 與 `focus`。
5. 建築裡的店家設定 `inside: '<建築店家 id>'`，產生器可以回傳 `subStores`、`interiors`、`viewerRegions`、`viewerBounds`。
6. 設定 `status: 'open'` 並提供 `chapters`，就能探索這家店。
7. 開放探索的店家都要有可以走進去的室內（使用者 2026-10-29 決定，不做只看得到的淺室內）；還沒補的清單見 `docs/roadmap.md` 第 11 階段。

**文化據點**（例如黃玉階文史館）：

- 設定 `kind: 'heritage'`，店家名錄會顯示「文化據點」，不加食物圖鑑或點餐。
- 配置在 `src/data/huangYujieLayout.js`；資料在 `huangYujieMuseum.js`，已查證史實、照片觀察、情境設計與待核資料分開存放。
- 相鄰建築依 `src/data/actionBarLayout.js` 定位，不要讓模型重疊。
- 展板用 `exhibit` 材質與 `rendering/exhibitAtlas.js` 的圖集。

**同一種食物的跨年代版本**（例如魷魚羹、米苔目）：

- 每個年代各是一家店，共用同一個 `theme` id。
- 主題（`versions: { 年代 id: 店家 id }`）、位置與擺設集中在一個配置檔，例如 `src/data/squidSoupLayout.js`、`miTaiMuLayout.js`。
- `getThemeVersions(shop)` 會列出這種食物在其他年代的店家版本。
- 範例：
  - 建模：`builders/templeSquidStall.js`、`laoPanExterior.js`
  - 測試：`tests/squidSoup.test.js`、`tests/miTaiMu.test.js`
- 只有同類食物、沒有品牌傳承關係的現代店家放在主題的 `related`（用 `getThemeRelated(shop)` 取得），例如廟口豆花攤 → 導演的豆花店（`src/data/templeSnackLayout.js`）。這類情境示意攤位不使用現代店家的店名、商標或裝潢。

**同一棟建築的跨年代版本**（例如稻舍／迪化街329號店屋）：

- 同一個店家 ID、同一個地段；`buildingByEra` 指定各年代的 `variant`，`eras` 放各年代的名稱、章節、熱點與狀態，用 `getShop(id, eraId)` 取得年代版本（不要直接讀 `SHOPS`）。
- 年代設定在 `src/data/riceAndShineEraConfig.js`，配置在 `riceAndShineLayout.js`，建模在 `builders/riceAndShine/`；碰撞在 `eraLayout.js` 的店家地段裡依版本加上。
- 店屋的可行走範圍標 `inBuilding`：換年代時人物用 `resolvePlayerPosition(..., { relocate: true })` 移到戶外，不會被推進店屋。
- 測試：`tests/riceAndShine.test.js`、`tests/e2e/riceAndShine.e2e.mjs`；其他店家的測試檢查「這個年代沒有室內」時用 `helpers.js` 的 `inRiceAndShineLot` 排除它。

## 慣例

- 介面文字、註解、測試名稱、commit 說明都用**繁體中文**。commit 標題格式為「功能名: 說明」，例如 `爐鍋咖啡: fixes from the adversarial review`。
- 新店家或場景通常只出現在一個年代。測試要驗證：
  - 其他年代不受影響
  - 共用地段切分不變
  - 不和既有建築重疊
  - 人物走得進去也走得出來（碰撞測試用多種步長，連續進出多次）
  - 鏡頭不穿牆
- 寫新測試時參考 `tests/helpers.js`（`resetStore`、`YEAR` 對照）和既有的店家測試，例如 `luguo.test.js`、`actionbar.test.js`、`squidSoup.test.js`。
- **iPad 效能預算**：
  - 依材質合併網格，每個年代約 340–390 次繪製呼叫
  - 招牌畫在同一張圖集，燈籠用實例化繪製
  - 室內按需產生，不投射也不接收陰影
  - 觸控裝置預設低畫質
- **歷史內容要有出處**：加到 `sources.js`。未查證的年份要標示，重建的場景標「歷史情境重建」。
  - 路人對話與探索手記分三種標示，畫面上看得到：「有出處」（附出處）、「坊間傳說」（民間故事、年代不確定的唸謠）、「虛構對白」（情境閒聊）。不把沒有證據的故事安在真實人物、家族或仍在營業的店家身上。
  - 作者過世超過 50 年的原文可以引用；近代歌詞、小說與中譯本只寫篇名、背景與改寫。
  - 新的文字欄位一開始就留英文（例如 `textEn`）。
  - 各年代可用的素材（清末沒有在地報紙，改用海關、領事報告與檔案）見 `docs/roadmap.md` 的附錄。
- 功能完成後要更新 README：功能段落、「自動化測試」、「測試狀態」。
- 開發分支 `claude/dadaocheng-food-street-phase1-*`，透過 PR 合併到 `main`，不直接推送到 `main`。收工前要跑 `npm test`。

## 注意

- 專案在 iCloud Drive 裡，`node_modules/` 和 `dist/` 也會被同步。兩者都在 `.gitignore`，不要提交。
- 需要支援 WebGL 2 的瀏覽器。
