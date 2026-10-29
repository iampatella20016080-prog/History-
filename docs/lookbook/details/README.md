# 固定視角截圖（第 9 階段・細部）

由 `tests/e2e/lookbook.e2e.mjs` 的 `SET=details` 產生（開發版、Playwright Chromium headless，SwiftShader 軟體繪圖，1280×800 縮成 960 寬）。灰階縮圖沒有放進來（省空間）。

- `before/`：改動前（main，5867e2d）；`after/`：改動後
- 年代：港口商街、庶民生活、老屋新生；`low` 是流暢、`high` 是精緻
- 視角：`banyan` 廟埕榕樹、`banyan-under` 河岸榕樹的粗枝、`ground` 大面積地面、`plaster` 樓上灰泥牆、`plaster-arcade` 洋樓立面、`column` 騎樓柱腳
- `postwar-sill-streak-low.jpg`：另外用同一個開發版鏡頭拍的庶民生活洋樓（x = 5.2），水漬從牆頂改成窗臺下（只有流暢模式）
- `stats.json`：街道遠景的繪製呼叫（一個影格內所有 gl.render 的總數，含法線、色彩與陰影三趟）與可見網格數

| 年代／畫質 | 改動前 | 改動後 |
| --- | --- | --- |
| 港口商街／流暢 | 225 | 227 |
| 庶民生活／流暢 | 258 | 259 |
| 老屋新生／流暢 | 386 | 389 |
| 港口商街／精緻 | 245 | 248 |
| 庶民生活／精緻 | 288 | 289 |
| 老屋新生／精緻 | 447 | 450 |

已知：港口商街的 `banyan` 視角被那個年代的店屋擋住（視角位置是依庶民生活的配置選的）；`plaster` 視角在庶民生活與老屋新生拍到的是紅磚樓，看不到灰泥水漬，水漬請看 `plaster-arcade` 與 `postwar-sill-streak-low.jpg`。

重拍：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
SET=details ERAS=qing-port,postwar,revival OUT=docs/lookbook/details/after node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
```
