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

## 店內透光（第 9 階段）

- `shop-glow-before/`：改動前（main，5867e2d）；`shop-glow-after/`：改動後
- 只在精緻畫質啟用：`-high` 是效果，`-low`（流暢）和改動前相同
- 視角（`SET=shop-glow`，見腳本的 `SHOP_GLOW_VIEWS`）：每個年代兩三個一般店面，`-front` 正面（注視點較低，看得到店內深處）、`-oblique` 斜看（看假室內的視差）
- 繪製呼叫（街道遠景，`stats.json`）前後完全相同：流暢 225／212／232／258／307，精緻 245／230／246／288／356（港口商街、酒樓繁華、摩登、庶民生活、老屋新生）
- 摩登的改動前截圖與數字是另外重拍的（第一次拍時摩登的街道遠景量到還沒載完的影格，只有 158／172）

```bash
SET=shop-glow OUT=docs/lookbook/shop-glow-after node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
```
