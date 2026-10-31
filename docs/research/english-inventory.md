# 英文版盤點

由 `node tools/i18n/inventory.mjs --write` 產生；每次補完一批要重新跑。

- 資料檔中文字串：**5980**，尚無英文對應：**0**（排除 url、seals、smallSign、hangingSign、lanterns、sign、signText、signLines、original、quote、taiwanese、romanization、zh、hanzi、script 等刻意保留的欄位）
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
| `src/data/shops.js` | 2205 | 0 | 0 |
| `src/data/sources.js` | 1440 | 0 | 0 |
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
