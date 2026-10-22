import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { createRng } from '../utils/random.js'
import { EXHIBIT_ATLAS } from './exhibitAtlas.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 黃玉階文史館的展板圖集（Canvas 繪製）。
 *
 * 展板只做「版面示意」：標題、年代軸、欄位、灰色的文字行、圖片框與城市剪影，
 * 不逐字重建館方展板的原文、也不重製照片裡的肖像與文件；可以閱讀的文字在介紹視窗（HTML）。
 * 圖集很大（2048 × 1664），第一次有網格用到這個材質時才繪製（見 materials.js 的 onBeforeCompile），
 * 其他年代不會佔用記憶體。
 */
const BODY_FONT = '"Noto Serif TC", "Songti TC", "PMingLiU", serif'

let texture = null
let drawn = false

export function getExhibitTexture() {
  if (texture) return texture
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 4
  texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  return texture
}

/** 第一次用到時才把圖集畫到全尺寸（字型載入後會自動重畫） */
export function ensureExhibitTexture() {
  const tex = getExhibitTexture()
  if (drawn) return tex
  drawn = true
  const canvas = tex.image
  canvas.width = EXHIBIT_ATLAS.width
  canvas.height = EXHIBIT_ATLAS.height
  const g = canvas.getContext('2d')
  const draw = () => {
    drawAtlas(g)
    tex.needsUpdate = true
  }
  registerFontTexture(draw, `700 72px ${DISPLAY_FONT}`, '日治初期大稻埕的初等教育發展黃玉階文史館立面交趾陶介紹醫療公衛社會參與人體解剖元珍源前言國語傳習所公學校設立女子小補帖仕紳與')
  return tex
}

function drawAtlas(g) {
  const R = EXHIBIT_ATLAS.regions
  g.clearRect(0, 0, EXHIBIT_ATLAS.width, EXHIBIT_ATLAS.height)
  clip(g, R.edu, drawEducationBoard)
  clip(g, R.portrait, drawPortraitWall)
  clip(g, R.arcadeBoard, drawArcadeBoard)
  clip(g, R.oldPhoto, drawOldPhoto)
  clip(g, R.anatomy, drawAnatomy)
  for (let i = 0; i < 4; i++) clip(g, R[`cert${i}`], (c, w, h) => drawCertificate(c, w, h, i))
  clip(g, R.books, drawBooks)
  clip(g, R.wraps, drawWraps)
}

function clip(g, [x, y, w, h], fn) {
  g.save()
  g.translate(x, y)
  g.beginPath()
  g.rect(0, 0, w, h)
  g.clip()
  fn(g, w, h)
  g.restore()
}

/** 灰色的「文字行」（版面示意，不是可讀的文字） */
function textLines(g, x, y, width, lines, { gap = 22, height = 8, color = 'rgba(70,60,52,0.5)', seed = 1, ragged = 0.35 } = {}) {
  const rng = createRng(seed)
  g.fillStyle = color
  for (let i = 0; i < lines; i++) {
    const last = i === lines - 1
    const w = width * (last ? 0.3 + rng() * 0.4 : 1 - rng() * ragged * 0.4)
    g.fillRect(x, y + i * gap, w, height)
  }
  return y + lines * gap
}

function speckle(g, w, h, seed, count, rgb, alpha) {
  const rng = createRng(seed)
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${rgb},${alpha * (0.4 + rng() * 0.6)})`
    g.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2)
  }
}

function text(g, value, x, y, { size = 32, color = '#222', font = DISPLAY_FONT, weight = 700, align = 'left', baseline = 'alphabetic' } = {}) {
  g.font = `${weight} ${size}px ${font}`
  g.fillStyle = color
  g.textAlign = align
  g.textBaseline = baseline
  g.fillText(value, x, y)
}

/* ── 左牆：日治初期大稻埕的初等教育發展 ─────────── */

function drawEducationBoard(g, w, h) {
  // 米色紙底
  g.fillStyle = '#efe6d1'
  g.fillRect(0, 0, w, h)
  speckle(g, w, h, 7, 2400, '120,95,60', 0.12)
  // 標題列（白底深藍字）
  g.fillStyle = '#f7f4ec'
  g.fillRect(0, 0, w, 124)
  text(g, '日治初期大稻埕的初等教育發展', 64, 92, { size: 76, color: '#1f3566' })
  text(g, '版面示意', w - 40, 70, { size: 22, color: 'rgba(60,60,70,0.55)', font: BODY_FONT, weight: 600, align: 'right' })
  // 年代軸（灰綠色帶狀、白色的年份與菱形標記）
  g.fillStyle = '#7f9b92'
  g.fillRect(0, 124, w, 206)
  g.fillStyle = 'rgba(255,255,255,0.85)'
  g.fillRect(40, 214, w - 80, 4)
  const years = ['1896', '1897', '1898', '1899', '1902', '1910', '1915', '1917', '1925', '1930']
  years.forEach((year, i) => {
    const x = 90 + (i * (w - 180)) / (years.length - 1)
    g.save()
    g.translate(x, 216)
    g.rotate(Math.PI / 4)
    g.fillStyle = '#f3eee2'
    g.fillRect(-9, -9, 18, 18)
    g.restore()
    text(g, year, x, 196, { size: 34, color: '#ffffff', font: BODY_FONT, weight: 700, align: 'center' })
    textLines(g, x - 62, 244, 124, 3, { gap: 20, height: 7, color: 'rgba(255,255,255,0.75)', seed: 30 + i })
  })
  // 內文：五個欄位（標題、灰色文字行、圖片框）
  const heads = ['前言', '國語傳習所', '公學校的設立', '女子教育', '小補帖：仕紳與教育']
  const colW = (w - 120) / 5
  heads.forEach((head, i) => {
    const x = 40 + i * (colW + 10)
    let y = 372
    g.fillStyle = '#c8662e'
    g.fillRect(x, y - 26, 14, 30)
    text(g, head, x + 24, y, { size: 34, color: '#b4561f' })
    y += 30
    y = textLines(g, x, y, colW - 20, 6 + (i % 3), { seed: 50 + i })
    y += 14
    if (i === 0) y = mapFigure(g, x, y, colW - 30, 170)
    else if (i === 1) y = photoFigure(g, x, y, colW - 30, 160, 11)
    else if (i === 2) y = documentFigure(g, x, y, colW - 30, 170)
    else if (i === 3) y = photoFigure(g, x, y, colW - 30, 150, 23)
    else y = bowlFigure(g, x, y, colW - 30, 150)
    y += 18
    textLines(g, x, y, colW - 20, 4, { seed: 80 + i })
  })
  // 底部的城市剪影（橘色的街屋與屋頂輪廓）
  skyline(g, w, h)
}

function mapFigure(g, x, y, w, h) {
  g.fillStyle = '#e8dfc8'
  g.fillRect(x, y, w, h)
  g.strokeStyle = 'rgba(120,100,70,0.5)'
  g.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    g.beginPath()
    g.moveTo(x, y + (h * i) / 6)
    g.lineTo(x + w, y + (h * i) / 6 + 8)
    g.stroke()
  }
  g.strokeStyle = 'rgba(80,70,60,0.75)'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(x + w * 0.2, y)
  g.bezierCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.15, y + h * 0.6, x + w * 0.25, y + h)
  g.stroke()
  g.strokeStyle = '#c0392b'
  g.lineWidth = 3
  g.strokeRect(x + w * 0.45, y + h * 0.35, w * 0.22, h * 0.25)
  g.strokeStyle = 'rgba(60,50,40,0.6)'
  g.lineWidth = 2
  g.strokeRect(x, y, w, h)
  return y + h
}

function photoFigure(g, x, y, w, h, seed) {
  const grad = g.createLinearGradient(x, y, x, y + h)
  grad.addColorStop(0, '#b9ad97')
  grad.addColorStop(1, '#7d705d')
  g.fillStyle = grad
  g.fillRect(x, y, w, h)
  const rng = createRng(seed)
  g.fillStyle = 'rgba(50,42,34,0.75)'
  let bx = x + 8
  while (bx < x + w - 20) {
    const bw = 30 + rng() * 50
    const bh = h * (0.3 + rng() * 0.4)
    g.fillRect(bx, y + h - bh, Math.min(bw, x + w - 8 - bx), bh)
    bx += bw + 4
  }
  g.strokeStyle = '#f4efe3'
  g.lineWidth = 6
  g.strokeRect(x, y, w, h)
  return y + h
}

function documentFigure(g, x, y, w, h) {
  const n = 3
  const cw = (w - (n - 1) * 10) / n
  for (let i = 0; i < n; i++) {
    const cx = x + i * (cw + 10)
    g.fillStyle = '#d8c39a'
    g.fillRect(cx, y, cw, h)
    g.fillStyle = 'rgba(60,40,25,0.55)'
    for (let k = 0; k < 6; k++) g.fillRect(cx + cw - 16 - k * (cw / 7), y + 12, 4, h * (0.5 + ((k * 37) % 40) / 100))
    g.fillStyle = '#b23a2b'
    g.fillRect(cx + 8, y + h - 30, 18, 18)
  }
  return y + h
}

function bowlFigure(g, x, y, w, h) {
  g.fillStyle = '#efe6d1'
  g.fillRect(x, y, w, h)
  for (const [cx, r] of [
    [x + w * 0.3, h * 0.36],
    [x + w * 0.72, h * 0.3],
  ]) {
    g.fillStyle = '#8f2e2a'
    g.beginPath()
    g.ellipse(cx, y + h * 0.55, r, r * 0.8, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#c4483c'
    g.beginPath()
    g.ellipse(cx, y + h * 0.45, r * 0.9, r * 0.32, 0, 0, Math.PI * 2)
    g.fill()
  }
  return y + h
}

function skyline(g, w, h) {
  const base = h
  const top = h - 150
  g.fillStyle = '#e7a46e'
  g.fillRect(0, h - 40, w, 40)
  g.fillStyle = '#d9773f'
  g.beginPath()
  g.moveTo(0, base)
  const rng = createRng(1882)
  let x = 0
  while (x < w) {
    const bw = 70 + rng() * 120
    const bh = 40 + rng() * 80
    const y = base - bh
    g.lineTo(x, y + 12)
    // 山牆或拱形的女兒牆
    if (rng() < 0.4) {
      g.quadraticCurveTo(x + bw / 2, y - 26, x + bw, y + 12)
    } else {
      g.lineTo(x + bw * 0.15, y)
      g.lineTo(x + bw * 0.85, y)
      g.lineTo(x + bw, y + 12)
    }
    x += bw
  }
  // 一座有尖塔的建築
  g.lineTo(w, base)
  g.closePath()
  g.fill()
  g.beginPath()
  g.moveTo(w * 0.58, top + 60)
  g.lineTo(w * 0.6, top)
  g.lineTo(w * 0.62, top + 60)
  g.lineTo(w * 0.62, base)
  g.lineTo(w * 0.58, base)
  g.closePath()
  g.fill()
}

/* ── 左牆前段：黃玉階的人物展示 ─────────────── */

function drawPortraitWall(g, w, h) {
  const pw = Math.round(w * 0.62)
  // 肖像看板：水墨暈染的淺灰底與簡化的人物剪影（不重製照片中的肖像）
  const grad = g.createRadialGradient(pw * 0.45, h * 0.45, 20, pw * 0.45, h * 0.45, h * 0.7)
  grad.addColorStop(0, '#f1f0ec')
  grad.addColorStop(1, '#a9a6a0')
  g.fillStyle = grad
  g.fillRect(0, 0, pw, h)
  speckle(g, pw, h, 3, 900, '40,40,40', 0.1)
  g.fillStyle = 'rgba(40,40,42,0.85)'
  // 坐著的人物：頭、長衫與雙手（剪影）
  g.beginPath()
  g.arc(pw * 0.42, h * 0.34, 34, 0, Math.PI * 2)
  g.fill()
  g.beginPath()
  g.moveTo(pw * 0.3, h * 0.42)
  g.lineTo(pw * 0.54, h * 0.42)
  g.lineTo(pw * 0.66, h * 0.86)
  g.lineTo(pw * 0.18, h * 0.86)
  g.closePath()
  g.fill()
  g.fillStyle = 'rgba(232,230,224,0.9)'
  g.fillRect(pw * 0.32, h * 0.6, pw * 0.2, 12)
  // 直書的名字與生卒年
  g.save()
  g.font = `700 76px ${DISPLAY_FONT}`
  g.fillStyle = '#2a2a2c'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  ;['黃', '玉', '階'].forEach((c, i) => g.fillText(c, pw * 0.84, h * 0.22 + i * 84))
  g.restore()
  text(g, '1850–1918', pw * 0.5, h * 0.95, { size: 30, color: '#2a2a2c', font: BODY_FONT, weight: 600, align: 'center' })
  // 右側兩塊深色說明板
  g.fillStyle = '#3d3c3a'
  g.fillRect(pw + 8, 0, w - pw - 8, h)
  const x = pw + 26
  text(g, '醫療公衛', x, 70, { size: 34, color: '#f3f1ea' })
  textLines(g, x, 96, w - pw - 50, 4, { gap: 26, height: 8, color: 'rgba(240,238,230,0.7)', seed: 91 })
  text(g, '社會參與', x, 300, { size: 34, color: '#f3f1ea' })
  textLines(g, x, 326, w - pw - 50, 4, { gap: 26, height: 8, color: 'rgba(240,238,230,0.7)', seed: 92 })
  g.fillStyle = '#f2efe6'
  g.fillRect(pw + 16, h - 170, w - pw - 32, 150)
  textLines(g, pw + 28, h - 150, w - pw - 56, 5, { gap: 24, height: 7, seed: 93 })
}

/* ── 騎樓：文史館的介紹板 ─────────────────── */

function drawArcadeBoard(g, w, h) {
  g.fillStyle = '#8c3a37'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = '#ead9b8'
  g.lineWidth = 4
  g.strokeRect(14, 14, w - 28, h - 28)
  g.lineWidth = 1.5
  g.strokeRect(24, 24, w - 48, h - 48)
  text(g, '黃玉階文史館', 46, 82, { size: 44, color: '#f6ead2' })
  text(g, '立面交趾陶 介紹', 330, 82, { size: 30, color: '#f6ead2' })
  // 三張立面飾板的小圖：左右是彩色陶飾、中間是「元珍」匾額
  const y = 112
  ceramicThumb(g, 46, y, 130, 90, 'fish')
  g.fillStyle = '#1d2331'
  g.fillRect(196, y + 18, 150, 56)
  g.strokeStyle = '#efe8d8'
  g.lineWidth = 6
  g.strokeRect(193, y + 15, 156, 62)
  text(g, '珍 元', 271, y + 58, { size: 34, color: '#e2b65c', align: 'center' })
  ceramicThumb(g, 366, y, 130, 90, 'peony')
  textLines(g, 46, 236, w - 92, 5, { gap: 24, height: 8, color: 'rgba(246,234,210,0.7)', seed: 61 })
}

function ceramicThumb(g, x, y, w, h, kind) {
  g.fillStyle = '#efe8d8'
  g.fillRect(x, y, w, h)
  g.fillStyle = '#2d4f6c'
  g.fillRect(x + 8, y + 8, w - 16, h - 16)
  ceramicMotif(g, x + 8, y + 8, w - 16, h - 16, kind)
}

/** 陶飾板的圖樣（簡化：左邊是花瓶與魚、右邊是花瓶與牡丹；保留照片的配置與色彩） */
export function ceramicMotif(g, x, y, w, h, kind) {
  g.fillStyle = '#c9a24a'
  g.fillRect(x + w * 0.1, y + h * 0.78, w * 0.8, h * 0.08)
  g.fillStyle = kind === 'fish' ? '#d7a13e' : '#4f8a6b'
  g.beginPath()
  g.ellipse(x + w * 0.45, y + h * 0.58, w * 0.14, h * 0.2, 0, 0, Math.PI * 2)
  g.fill()
  if (kind === 'fish') {
    g.fillStyle = '#e07a3c'
    g.beginPath()
    g.ellipse(x + w * 0.66, y + h * 0.5, w * 0.16, h * 0.08, -0.5, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#3f9a5a'
    g.fillRect(x + w * 0.3, y + h * 0.18, w * 0.05, h * 0.3)
  } else {
    for (const [px, py, c] of [
      [0.4, 0.28, '#e58aa0'],
      [0.58, 0.24, '#f0b3c0'],
      [0.5, 0.38, '#d65a72'],
    ]) {
      g.fillStyle = c
      g.beginPath()
      g.arc(x + w * px, y + h * py, w * 0.09, 0, Math.PI * 2)
      g.fill()
    }
  }
}

/* ── 茶席上方：舊照片（簡化的鐵橋） ─────────── */

function drawOldPhoto(g, w, h) {
  const grad = g.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#d4cdd6')
  grad.addColorStop(1, '#8e8597')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(52,44,64,0.85)'
  g.lineWidth = 7
  const deck = h * 0.72
  g.beginPath()
  g.moveTo(0, deck)
  g.lineTo(w, deck)
  g.stroke()
  g.lineWidth = 5
  const x0 = w * 0.18
  const x1 = w * 0.86
  const top = h * 0.22
  g.beginPath()
  g.moveTo(x0, deck)
  g.lineTo(x0 + 30, top)
  g.lineTo(x1 - 30, top)
  g.lineTo(x1, deck)
  g.stroke()
  g.lineWidth = 3
  const n = 6
  for (let i = 0; i < n; i++) {
    const a = x0 + 30 + ((x1 - x0 - 60) * i) / n
    const b = x0 + 30 + ((x1 - x0 - 60) * (i + 1)) / n
    g.beginPath()
    g.moveTo(a, top)
    g.lineTo(b, deck)
    g.moveTo(b, top)
    g.lineTo(b, deck)
    g.stroke()
  }
  speckle(g, w, h, 5, 500, '40,30,50', 0.15)
  g.strokeStyle = '#f2ece2'
  g.lineWidth = 14
  g.strokeRect(0, 0, w, h)
}

/* ── 後牆：人體解剖圖掛軸 ─────────────────── */

function drawAnatomy(g, w, h) {
  g.fillStyle = '#f1ebdc'
  g.fillRect(0, 0, w, h)
  speckle(g, w, h, 9, 500, '120,100,70', 0.1)
  // 標題由右往左
  g.font = `700 36px ${DISPLAY_FONT}`
  g.fillStyle = '#2f2a26'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  ;['剖', '解', '體', '人'].forEach((c, i) => g.fillText(c, w * 0.2 + i * w * 0.2, 36))
  g.strokeStyle = 'rgba(60,55,50,0.85)'
  g.lineWidth = 2.5
  const cx = w / 2
  // 頭、脊椎、肋骨
  g.beginPath()
  g.ellipse(cx, 105, 30, 36, 0, 0, Math.PI * 2)
  g.stroke()
  g.beginPath()
  g.moveTo(cx, 141)
  g.lineTo(cx, 400)
  g.stroke()
  for (let i = 0; i < 7; i++) {
    const y = 175 + i * 22
    g.beginPath()
    g.ellipse(cx, y, 70 - i * 2, 14, 0, 0, Math.PI)
    g.stroke()
  }
  g.beginPath()
  g.moveTo(cx - 85, 160)
  g.lineTo(cx - 95, 400)
  g.moveTo(cx + 85, 160)
  g.lineTo(cx + 95, 400)
  g.stroke()
  // 紅色的動脈與藍色的靜脈
  g.lineWidth = 4
  g.strokeStyle = '#c0392b'
  g.beginPath()
  g.moveTo(cx + 6, 150)
  g.bezierCurveTo(cx + 20, 230, cx - 10, 300, cx + 8, 420)
  g.moveTo(cx + 6, 260)
  g.lineTo(cx + 50, 330)
  g.stroke()
  g.strokeStyle = '#2f5f9e'
  g.beginPath()
  g.moveTo(cx - 8, 150)
  g.bezierCurveTo(cx - 24, 230, cx + 4, 300, cx - 12, 420)
  g.moveTo(cx - 8, 260)
  g.lineTo(cx - 52, 330)
  g.stroke()
  // 心臟
  g.fillStyle = 'rgba(192,57,43,0.7)'
  g.beginPath()
  g.ellipse(cx + 10, 215, 18, 22, 0.4, 0, Math.PI * 2)
  g.fill()
}

/* ── 裝框的文件（淡粉紅的紙、直書的文字行、紅色印章） ─────── */

function drawCertificate(g, w, h, variant) {
  g.fillStyle = '#1e1b1a'
  g.fillRect(0, 0, w, h)
  g.fillStyle = variant % 2 ? '#ecdcdc' : '#f0e4dc'
  g.fillRect(12, 12, w - 24, h - 24)
  const rng = createRng(200 + variant)
  g.fillStyle = 'rgba(40,30,30,0.6)'
  const cols = 5 + (variant % 3)
  for (let i = 0; i < cols; i++) {
    const x = w - 34 - i * ((w - 60) / cols)
    const len = (h - 70) * (0.4 + rng() * 0.6)
    g.fillRect(x, 32, i === 0 ? 7 : 4, len)
  }
  g.strokeStyle = '#b23a2b'
  g.lineWidth = 3
  g.strokeRect(24, h - 64, 34, 34)
  g.fillStyle = 'rgba(178,58,43,0.6)'
  g.fillRect(30, h - 58, 22, 22)
}

/* ── 層架上的書背與包裝 ─────────────────── */

function drawBooks(g, w, h) {
  const colors = ['#3f6a57', '#8a3b33', '#c9a24a', '#2f4b6e', '#6d4c3a', '#a8566a', '#4f7f8a', '#7b6a3e']
  let x = 0
  const rng = createRng(77)
  while (x < w) {
    const bw = 18 + rng() * 26
    g.fillStyle = colors[Math.floor(rng() * colors.length)]
    g.fillRect(x, 0, bw - 2, h)
    g.fillStyle = 'rgba(255,255,255,0.55)'
    g.fillRect(x + 4, h * 0.2, bw - 10, 6)
    g.fillRect(x + 4, h * 0.75, bw - 10, 4)
    x += bw
  }
}

function drawWraps(g, w, h) {
  g.fillStyle = '#c4a172'
  g.fillRect(0, 0, w, h)
  speckle(g, w, h, 12, 1500, '90,60,30', 0.18)
  // 紅紙封條（菱形）與毛筆字
  const labels = [
    [w * 0.25, h * 0.5, '源珍'],
    [w * 0.72, h * 0.5, '精品'],
  ]
  for (const [cx, cy, word] of labels) {
    g.save()
    g.translate(cx, cy)
    g.rotate(Math.PI / 4)
    g.fillStyle = '#c8332b'
    g.fillRect(-62, -62, 124, 124)
    g.restore()
    g.font = `700 44px ${DISPLAY_FONT}`
    g.fillStyle = '#1c1612'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    ;[...word].forEach((c, i) => g.fillText(c, cx, cy - 24 + i * 48))
  }
  g.strokeStyle = 'rgba(60,40,20,0.5)'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(0, h * 0.5)
  g.lineTo(w, h * 0.5)
  g.moveTo(w * 0.5, 0)
  g.lineTo(w * 0.5, h)
  g.stroke()
}
