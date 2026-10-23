/**
 * 十字軒糕餅舖（2000–現在）的圖集：每一塊在圖集上的位置（像素）。不使用 DOM，產生器只用它換算 UV；
 * 實際的繪製在 szxTexture.js（主執行緒，第一次顯示時才畫）。
 * 展板只有主題字與示意線條、獎狀只有「獎狀」「感謝狀」字樣，不重製照片裡的實際文字或頒發內容。
 */
export const SZX_ATLAS = {
  width: 2048,
  height: 1024,
  regions: {
    // 後牆上方的六塊歷史金屬展板（銀灰底、深色字、線描插圖）
    panelMuseum: [0, 0, 256, 384],
    panel1930: [256, 0, 256, 384],
    panelDecade: [512, 0, 256, 384],
    panelTenCake: [768, 0, 256, 384],
    panelRitual: [1024, 0, 256, 384],
    panelRitual2: [1280, 0, 256, 384],
    // 獎狀與感謝狀（直式、橫式）
    certA: [1536, 0, 256, 192],
    certB: [1792, 0, 256, 192],
    certC: [1536, 192, 192, 256],
    certD: [1728, 192, 192, 256],
    // 老照片（街景剪影）
    oldPhoto: [0, 384, 256, 192],
    // 價卡（一列 8 張，不寫價格數字）
    priceTags: [256, 384, 768, 96],
    // 包裝貼紙（紅色圓貼、金色方貼、品名貼）
    stickers: [256, 480, 768, 96],
    // 鐵罐標籤
    tinLabel: [1024, 384, 512, 128],
    // 禮盒的金色紋樣
    giftPattern: [1024, 512, 256, 256],
    // 店內的品牌小立牌（壽桃吉祥物的簡化圖樣）
    mascot: [1280, 512, 256, 256],
    // 空調出風口格柵
    vent: [1536, 448, 256, 128],
  },
}

export function szxUV(name) {
  const r = SZX_ATLAS.regions[name]
  if (!r) throw new Error(`未知的圖樣：${name}`)
  const [x, y, w, h] = r
  const { width: W, height: H } = SZX_ATLAS
  return [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H]
}
