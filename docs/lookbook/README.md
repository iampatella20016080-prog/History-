# 固定視角截圖（第 9 階段：酒樓繁華與摩登的光線、畫面動態）

由 `tests/e2e/lookbook.e2e.mjs` 產生（開發版、Playwright Chromium headless，SwiftShader 軟體繪圖，1280×800 縮成 960 寬）。

- `before/`：改動前（main，1e1d4cf）
- `after/`：改動後
- 檔名：`<年代>-<視角>-<畫質>.jpg`，`low` 是流暢、`high` 是精緻；`.gray.png` 是 1/4 大小的灰階縮圖（看明度差）
- 視角：`temple` 慈聖宮前、`river` 河岸、`street` 街道遠景，以及各年代三個店門口
- `stats.json`：每個年代、每種畫質在街道遠景的繪製呼叫（一個影格內所有 gl.render 的總數）與可見網格數

重拍：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
OUT=docs/lookbook/after node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
```

已知：`modern-xin-fang-chun-*` 的鏡頭前有一團遮擋（改動前後都有，是視角位置的問題，不是這次的改動）。
