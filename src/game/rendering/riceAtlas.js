/**
 * 迪化街329號店屋（稻舍）的圖集：每一塊在圖集上的位置（像素）。不使用 DOM，建築的產生器只用它換算 UV；
 * 實際的繪製在 riceTexture.js（主執行緒，第一次顯示時才畫）。
 * 壁畫、展板與老照片都是本站原創的簡化圖樣，不複製照片裡的壁畫或任何畫作。
 */
export const RICE_ATLAS = {
  width: 2048,
  height: 1536,
  regions: {
    // 騎樓牆上的大稻埕街景壁畫（拱形，直式）
    arcadeMural: [0, 0, 640, 1024],
    // 天井牆上的稻作壁畫（橫式）
    courtyardMural: [640, 0, 1024, 768],
    // 出口旁的「老屋再生」說明板
    renewalBoard: [1664, 0, 384, 512],
    // 二樓的《南街殷賑》說明板（文字與原創的街景線條，不重製畫作）
    nanjieBoard: [1664, 512, 384, 512],
    // 稻田的照片（隔屏上）
    ricePoster: [640, 768, 384, 512],
    // 老照片（米行街景，原創的褐色剪影）
    oldPhoto: [1024, 768, 320, 256],
    // 米行帳本（翻開的兩頁）
    ledger: [1344, 768, 320, 256],
    // 菜單卡（只有圖樣，不寫價格）
    menuCard: [1024, 1024, 320, 224],
    // 手寫的品名牌（白米、糙米、糯米，不寫價格）
    priceBoard: [1344, 1024, 192, 320],
    // 戰後的日曆與舊報紙
    calendar: [1536, 1024, 192, 256],
    newspaper: [1728, 1024, 320, 256],
    // 米袋與米包裝的標籤
    riceLabels: [0, 1024, 640, 256],
    // 書背
    books: [0, 1280, 640, 256],
  },
}

export function riceUV(name) {
  const r = RICE_ATLAS.regions[name]
  if (!r) throw new Error(`未知的圖樣：${name}`)
  const [x, y, w, h] = r
  const { width: W, height: H } = RICE_ATLAS
  return [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H]
}
