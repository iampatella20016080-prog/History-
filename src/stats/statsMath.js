/**
 * 效能量測（?stats=1）的純邏輯：參數解析、影格時間的滑動統計、顯示用格式化。
 * 不依賴 React 與 Three，可直接單測。
 */

/** 網址是否要求顯示效能數字（?stats=1；也接受 true） */
export function parseStatsParam(search) {
  const value = new URLSearchParams(search ?? '').get('stats')
  return value === '1' || value === 'true'
}

/** 影格時間（秒）的滑動視窗：只保留最近 windowSec 秒 */
export class FrameWindow {
  constructor(windowSec = 2) {
    this.windowSec = windowSec
    this.times = []
    this.total = 0
  }

  push(delta) {
    if (!(delta > 0) || !Number.isFinite(delta)) return
    this.times.push(delta)
    this.total += delta
    while (this.times.length > 1 && this.total - this.times[0] >= this.windowSec) {
      this.total -= this.times.shift()
    }
  }

  /** 平均幀率；最低幀率取視窗內最慢的一格 */
  summary() {
    if (!this.times.length) return { avg: 0, min: 0, frames: 0 }
    const worst = Math.max(...this.times)
    return { avg: this.times.length / this.total, min: 1 / worst, frames: this.times.length }
  }

  reset() {
    this.times = []
    this.total = 0
  }
}

/** 渲染解析度：像素寬高與 dpr */
export function formatResolution(width, height, dpr) {
  return `${Math.round(width)}×${Math.round(height)} @${Number(dpr).toFixed(2)}x`
}

function compact(n) {
  return n >= 10000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n))
}

/**
 * 組成浮層的文字列。
 * snapshot: { fps:{avg,min}, calls, triangles, points, lines, width, height, dpr, dprMax, quality, passes? }
 */
export function formatStats(s) {
  const adaptive = s.dprMax > 0 && s.dpr < s.dprMax - 0.01
  const lines = [
    `FPS ${s.fps.avg.toFixed(0)}（最低 ${s.fps.min.toFixed(0)}）`,
    `繪製呼叫 ${compact(s.calls)}`,
    `三角形 ${compact(s.triangles)}`,
    formatResolution(s.width, s.height, s.dpr),
    `畫質 ${s.quality}　自動降解析度 ${adaptive ? `是（上限 ${Number(s.dprMax).toFixed(2)}）` : '否'}`,
  ]
  return lines
}
