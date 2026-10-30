# 空氣遠近感與斜陽光束：前後對照（第 9 階段追加，只在精緻畫質）

由 `tests/e2e/lookbook.e2e.mjs`（`SET=air`）產生：開發版、Playwright Chromium headless（SwiftShader 軟體繪圖），1280×800 縮成 960 寬。

- `before/`：改動前（main，a8a83f5）；`after/`：改動後
- `compare/`：精緻畫質左右對照（左：改動前、右：改動後）
- 檔名：`<年代>-<視角>-<畫質>.jpg`，`low` 流暢、`high` 精緻
- 視角：`street` 街道遠景（往東）、`street-west` 街道遠景（往河邊與夕陽）、`river` 河岸、`arcade` 騎樓（酒樓繁華與摩登，往西看向夕陽）
- `stats.json`：街道遠景（往東，太陽在鏡頭後方）一個影格的繪製呼叫。流暢畫質前後相同；精緻畫質多 1 次（空氣 pass；太陽在畫面附近時光束再多 1 次）

流暢畫質的 `before`／`after` 不是逐像素相同：河面、路人、落葉、燈籠都隨時間在動，兩次截圖的時間點不同。流暢畫質的程式路徑沒有變（不建立 pass、不編譯著色器，`tests/aerial.test.js` 與 `tests/e2e/air.e2e.mjs` 檢查）。

重拍：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
OUT=docs/lookbook/air/after SET=air node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
```
