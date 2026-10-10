/**
 * 招牌、茶箱標籤等「畫在 Canvas 上的文字」需要等網頁字型載入後重畫。
 * 這裡集中管理：先用後備字型畫一次，字型載入完成後自動重畫所有已註冊的貼圖。
 */
export const DISPLAY_FONT =
  '"LXGW WenKai TC", "Kaiti TC", "BiauKai", "DFKai-SB", "標楷體", "Noto Serif TC", "Noto Serif CJK TC", "Songti TC", serif'

const redrawers = new Set()
let listening = false

function refreshAll() {
  for (const redraw of redrawers) redraw()
}

function ensureListening() {
  if (listening || typeof document === 'undefined' || !document.fonts) return
  listening = true
  document.fonts.ready.then(refreshAll).catch(() => {})
  document.fonts.addEventListener?.('loadingdone', refreshAll)
}

/**
 * @param {() => void} redraw 重畫函式（會立即執行一次）
 * @param {string} fontSpec  例如 '700 120px "LXGW WenKai TC"'
 * @param {string} text      需要的字元，用來觸發對應字型子集的下載
 */
export function registerFontTexture(redraw, fontSpec, text) {
  redrawers.add(redraw)
  redraw()
  ensureListening()
  if (typeof document !== 'undefined' && document.fonts?.load) {
    document.fonts
      .load(fontSpec, text)
      .then(redraw)
      .catch(() => {})
  }
  return () => redrawers.delete(redraw)
}
