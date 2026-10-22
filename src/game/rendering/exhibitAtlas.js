/**
 * 黃玉階文史館的展板圖集：每一塊展板在圖集上的位置（像素）。
 * 這個檔案不使用 DOM，建築的產生器（可能在 Web Worker 裡）只用它換算 UV；
 * 實際的繪製在 exhibitTexture.js（主執行緒，第一次顯示時才畫）。
 */
export const EXHIBIT_ATLAS = {
  width: 2048,
  height: 1664,
  regions: {
    // 左牆：「日治初期大稻埕的初等教育發展」大型展板（2:1）
    edu: [0, 0, 2048, 1024],
    // 左牆前段：黃玉階的人物展示（肖像看板與兩塊說明板）
    portrait: [0, 1024, 500, 640],
    // 騎樓：文史館的介紹板（紅底，標題、三張立面飾板的小圖與說明）
    arcadeBoard: [500, 1024, 560, 400],
    // 茶席上方：舊照片的相框（簡化的鐵橋）
    oldPhoto: [500, 1424, 400, 240],
    // 後牆：人體解剖圖掛軸
    anatomy: [1060, 1024, 300, 480],
    // 人物展示牆上方：裝框的文件（四種）
    cert0: [1360, 1024, 160, 220],
    cert1: [1520, 1024, 160, 220],
    cert2: [1680, 1024, 160, 220],
    cert3: [1840, 1024, 160, 220],
    // 層架上的書背與牛皮紙包裝的紅紙封條
    books: [1360, 1260, 340, 200],
    wraps: [1700, 1260, 340, 200],
  },
}

/** 某塊展板的 UV 範圍 [u0, v0（下緣）, u1, v1（上緣）]（貼圖 flipY，畫布上方是 v = 1） */
export function exhibitUV(name) {
  const r = EXHIBIT_ATLAS.regions[name]
  if (!r) throw new Error(`未知的展板：${name}`)
  const [x, y, w, h] = r
  const { width: W, height: H } = EXHIBIT_ATLAS
  return [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H]
}
