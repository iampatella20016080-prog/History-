import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { createRng } from '../utils/random.js'
import { RICE_ATLAS } from './riceAtlas.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 迪化街329號店屋（稻舍）的圖集（Canvas 繪製）：原創的簡化圖樣，不複製照片裡的壁畫或任何畫作。
 * 圖集第一次有網格用到時才繪製（materials.js 的 onBeforeCompile），其他年代不佔記憶體。
 */
const BODY_FONT = '"Noto Serif TC", "Songti TC", "PMingLiU", serif'

let texture = null
let drawn = false

export function getRiceTexture() {
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

export function ensureRiceTexture() {
  const tex = getRiceTexture()
  if (drawn) return tex
  drawn = true
  const canvas = tex.image
  canvas.width = RICE_ATLAS.width
  canvas.height = RICE_ATLAS.height
  const g = canvas.getContext('2d')
  const draw = () => {
    drawAll(g)
    tex.needsUpdate = true
  }
  registerFontTexture(draw, `700 64px ${DISPLAY_FONT}`, '老屋再生米行產業衰退歷史建築保存稻舍郭雪湖南街殷賑大稻埕白米糙米糯米月日報米茶布藥糖北街碾米非原作圖像示意年')
  return tex
}

function drawAll(g) {
  const R = RICE_ATLAS.regions
  g.clearRect(0, 0, RICE_ATLAS.width, RICE_ATLAS.height)
  clip(g, R.arcadeMural, drawStreetMural)
  clip(g, R.courtyardMural, drawFarmMural)
  clip(g, R.renewalBoard, drawRenewal)
  clip(g, R.nanjieBoard, drawNanjie)
  clip(g, R.ricePoster, drawRiceField)
  clip(g, R.oldPhoto, drawOldPhoto)
  clip(g, R.ledger, drawLedger)
  clip(g, R.menuCard, drawMenu)
  clip(g, R.priceBoard, drawPriceBoard)
  clip(g, R.calendar, drawCalendar)
  clip(g, R.newspaper, drawNewspaper)
  clip(g, R.riceLabels, drawLabels)
  clip(g, R.books, drawBooks)
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

function text(g, value, x, y, { size = 32, color = '#222', font = DISPLAY_FONT, weight = 700, align = 'left' } = {}) {
  g.font = `${weight} ${size}px ${font}`
  g.fillStyle = color
  g.textAlign = align
  g.textBaseline = 'alphabetic'
  g.fillText(value, x, y)
}

function lines(g, x, y, w, n, { gap = 20, h = 6, color = 'rgba(60,50,40,0.45)', seed = 1 } = {}) {
  const rng = createRng(seed)
  g.fillStyle = color
  for (let i = 0; i < n; i++) g.fillRect(x, y + i * gap, w * (i === n - 1 ? 0.5 : 0.75 + rng() * 0.25), h)
}

function speckle(g, w, h, seed, count, rgb, alpha) {
  const rng = createRng(seed)
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${rgb},${alpha * (0.4 + rng() * 0.6)})`
    g.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2)
  }
}

/* ── 騎樓：大稻埕街景壁畫（原創：熱鬧的街、招牌、人群與燈籠） ── */
function drawStreetMural(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#f2e2c4')
  sky.addColorStop(1, '#e9cfa6')
  g.fillStyle = sky
  g.fillRect(0, 0, w, h)
  const rng = createRng(1930)
  const colors = ['#c9473c', '#2f6b8f', '#d9a441', '#4f8a5a', '#8a3b5a', '#e07a3c']
  // 兩排斜向的街屋與招牌（透視往畫面中央收）
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 7; i++) {
      const t = i / 7
      const bw = 150 - t * 90
      const bh = 380 - t * 200
      const x = side === 0 ? t * w * 0.42 : w - t * w * 0.42 - bw
      const y = 120 + t * 260
      g.fillStyle = i % 2 ? '#b85b45' : '#d8c2a0'
      g.fillRect(x, y, bw, bh)
      g.fillStyle = colors[(i + side * 3) % colors.length]
      g.fillRect(x + bw * 0.25, y + 10, bw * 0.3, bh * 0.55)
      g.save()
      g.font = `700 ${Math.max(14, 34 - t * 22)}px ${DISPLAY_FONT}`
      g.fillStyle = '#fff6e3'
      g.textAlign = 'center'
      const word = ['米', '茶', '布', '藥', '糖', '米', '茶'][(i + side) % 7]
      g.fillText(word, x + bw * 0.4, y + bh * 0.3)
      g.restore()
    }
  }
  // 燈籠串
  for (let k = 0; k < 3; k++) {
    const y = 180 + k * 110
    g.strokeStyle = 'rgba(60,40,30,0.6)'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(40, y)
    g.quadraticCurveTo(w / 2, y + 60, w - 40, y)
    g.stroke()
    for (let i = 1; i < 8; i++) {
      const x = 40 + (i * (w - 80)) / 8
      const yy = y + 60 * (1 - Math.pow((x - w / 2) / (w / 2 - 40), 2)) * 0.5 + 12
      g.fillStyle = '#d24b3c'
      g.beginPath()
      g.ellipse(x, yy, 12, 16, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  // 人群（簡化的剪影）與街道
  g.fillStyle = '#c8b08a'
  g.fillRect(0, h * 0.72, w, h * 0.28)
  for (let i = 0; i < 60; i++) {
    const x = rng() * w
    const y = h * 0.66 + rng() * h * 0.3
    const s = 0.6 + (y - h * 0.66) / (h * 0.3)
    g.fillStyle = colors[Math.floor(rng() * colors.length)]
    g.fillRect(x - 8 * s, y - 34 * s, 16 * s, 34 * s)
    g.fillStyle = '#3a2a22'
    g.beginPath()
    g.arc(x, y - 40 * s, 7 * s, 0, Math.PI * 2)
    g.fill()
    if (rng() < 0.3) {
      g.fillStyle = '#e9dcc1'
      g.beginPath()
      g.moveTo(x - 16 * s, y - 44 * s)
      g.lineTo(x, y - 56 * s)
      g.lineTo(x + 16 * s, y - 44 * s)
      g.fill()
    }
  }
  g.strokeStyle = '#5a2e26'
  g.lineWidth = 10
  g.strokeRect(5, 5, w - 10, h - 10)
}

/* ── 天井：稻作壁畫（原創：戴斗笠挑擔的農人、稻田、稻穗與太陽） ── */
function drawFarmMural(g, w, h) {
  g.fillStyle = '#f3eee2'
  g.fillRect(0, 0, w, h)
  // 遠山與稻田
  for (const [y, c] of [
    [h * 0.42, '#5d8f6a'],
    [h * 0.5, '#3f6f55'],
  ]) {
    g.fillStyle = c
    g.beginPath()
    g.moveTo(0, h)
    for (let x = 0; x <= w; x += 40) g.lineTo(x, y + Math.sin(x / 90 + y) * 24)
    g.lineTo(w, h)
    g.fill()
  }
  g.fillStyle = '#d9b44a'
  g.fillRect(0, h * 0.78, w, h * 0.22)
  g.strokeStyle = '#e8cf7a'
  g.lineWidth = 3
  for (let i = 0; i < 18; i++) {
    g.beginPath()
    g.moveTo(i * 60, h * 0.78)
    g.lineTo(i * 60 - 30, h)
    g.stroke()
  }
  // 太陽
  g.fillStyle = '#e2552f'
  g.beginPath()
  g.arc(w * 0.16, h * 0.16, 46, 0, Math.PI * 2)
  g.fill()
  // 稻穗（彎曲的金色穗）
  for (let k = 0; k < 9; k++) {
    const bx = w * 0.06 + k * 32
    g.strokeStyle = '#b98b2e'
    g.lineWidth = 4
    g.beginPath()
    g.moveTo(bx, h * 0.8)
    g.quadraticCurveTo(bx + 30, h * 0.4, bx + 70, h * 0.36)
    g.stroke()
    g.fillStyle = '#e0b24a'
    for (let i = 0; i < 6; i++) {
      g.beginPath()
      g.ellipse(bx + 40 + i * 6, h * 0.38 + i * 9, 5, 9, 0.6, 0, Math.PI * 2)
      g.fill()
    }
  }
  // 挑擔的農人（斗笠、淺綠上衣、竹扁擔與兩籃稻穀）
  const cx = w * 0.58
  const cy = h * 0.5
  g.fillStyle = '#7fb9a8'
  g.fillRect(cx - 50, cy - 60, 100, 120)
  g.fillStyle = '#d98f7a'
  g.fillRect(cx - 46, cy + 60, 36, 120)
  g.fillRect(cx + 10, cy + 60, 36, 120)
  g.fillStyle = '#2a2420'
  g.fillRect(cx - 50, cy + 170, 44, 18)
  g.fillRect(cx + 6, cy + 170, 44, 18)
  g.fillStyle = '#f0d7bd'
  g.beginPath()
  g.arc(cx, cy - 90, 30, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#e0c071'
  g.beginPath()
  g.moveTo(cx - 80, cy - 96)
  g.lineTo(cx, cy - 150)
  g.lineTo(cx + 80, cy - 96)
  g.closePath()
  g.fill()
  g.strokeStyle = '#c9a050'
  g.lineWidth = 8
  g.beginPath()
  g.moveTo(cx - 260, cy - 50)
  g.lineTo(cx + 260, cy - 70)
  g.stroke()
  for (const s of [-1, 1]) {
    const bx = cx + s * 240
    g.strokeStyle = '#5a4a3a'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(bx, cy - 58)
    g.lineTo(bx - 30, cy + 40)
    g.moveTo(bx, cy - 58)
    g.lineTo(bx + 30, cy + 40)
    g.stroke()
    g.fillStyle = '#b58a52'
    g.beginPath()
    g.ellipse(bx, cy + 60, 50, 34, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#e8c46a'
    g.beginPath()
    g.ellipse(bx, cy + 36, 44, 14, 0, 0, Math.PI * 2)
    g.fill()
  }
  speckle(g, w, h, 21, 1500, '80,60,40', 0.08)
}

/* ── 出口旁：老屋再生（米行 → 產業衰退 → 歷史建築保存 → 稻舍） ── */
function drawRenewal(g, w, h) {
  g.fillStyle = '#efe4cf'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#5a2e26'
  g.fillRect(0, 0, w, 74)
  text(g, '老屋再生', w / 2, 52, { size: 42, color: '#f6ead2', align: 'center' })
  const steps = [
    ['米行', '1907 店屋建立・1916 唐益興米行'],
    ['產業衰退', '戰後米業逐漸轉變'],
    ['歷史建築保存', '2014 捐贈市府・2020 登錄'],
    ['稻舍', '2022 老房子文化運動'],
  ]
  steps.forEach(([title, sub], i) => {
    const y = 120 + i * 100
    g.fillStyle = i === 3 ? '#a5402c' : '#7a5a3e'
    g.beginPath()
    g.arc(46, y, 18, 0, Math.PI * 2)
    g.fill()
    if (i < 3) {
      g.fillStyle = '#7a5a3e'
      g.fillRect(43, y + 18, 6, 64)
    }
    text(g, title, 82, y + 10, { size: 32, color: '#2f241c' })
    text(g, sub, 82, y + 44, { size: 18, color: '#6a5443', font: BODY_FONT, weight: 600 })
  })
}

/* ── 二樓：《南街殷賑》說明板（文字與原創的街景線條，不重製畫作） ── */
function drawNanjie(g, w, h) {
  g.fillStyle = '#f4efe4'
  g.fillRect(0, 0, w, h)
  text(g, '郭雪湖《南街殷賑》', 24, 56, { size: 32, color: '#2f241c' })
  text(g, '1930｜臺北市立美術館典藏', 24, 92, { size: 18, color: '#6a5443', font: BODY_FONT, weight: 600 })
  // 原創的街景線條（不是畫作的圖像）
  g.strokeStyle = '#7a5a3e'
  g.lineWidth = 3
  g.strokeRect(24, 116, w - 48, 230)
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 54
    g.strokeRect(x, 160 + (i % 2) * 20, 44, 170 - (i % 2) * 20)
    g.beginPath()
    g.moveTo(x + 22, 160 + (i % 2) * 20)
    g.lineTo(x + 22, 135)
    g.stroke()
  }
  text(g, '原創線條示意・非原作圖像', w / 2, 372, { size: 16, color: '#8a7a68', font: BODY_FONT, weight: 600, align: 'center' })
  lines(g, 24, 400, w - 48, 4, { seed: 7 })
}

function drawRiceField(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.4)
  sky.addColorStop(0, '#c9d6d8')
  sky.addColorStop(1, '#e9dcc0')
  g.fillStyle = sky
  g.fillRect(0, 0, w, h * 0.4)
  g.fillStyle = '#c99a3e'
  g.fillRect(0, h * 0.4, w, h * 0.6)
  const rng = createRng(77)
  for (let i = 0; i < 500; i++) {
    g.strokeStyle = `rgba(${150 + rng() * 60},${110 + rng() * 40},40,0.6)`
    g.lineWidth = 1.5
    const x = rng() * w
    const y = h * 0.42 + rng() * h * 0.58
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + 4, y - 18)
    g.stroke()
  }
  // 戴斗笠的農人剪影
  g.fillStyle = '#3a2e26'
  g.fillRect(w * 0.42, h * 0.3, 40, 90)
  g.beginPath()
  g.moveTo(w * 0.42 - 30, h * 0.3)
  g.lineTo(w * 0.42 + 20, h * 0.24)
  g.lineTo(w * 0.42 + 70, h * 0.3)
  g.fill()
}

function drawOldPhoto(g, w, h) {
  const grad = g.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#c9b896')
  grad.addColorStop(1, '#8a7656')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
  g.fillStyle = 'rgba(50,38,26,0.75)'
  for (let i = 0; i < 4; i++) {
    const x = 20 + i * 74
    g.fillRect(x, 70, 64, 150)
    g.fillStyle = 'rgba(230,215,180,0.6)'
    g.beginPath()
    g.arc(x + 32, 140, 22, Math.PI, 0)
    g.fill()
    g.fillStyle = 'rgba(50,38,26,0.75)'
  }
  for (let i = 0; i < 6; i++) g.fillRect(30 + i * 46, 200, 22, 40)
  speckle(g, w, h, 3, 600, '40,30,20', 0.2)
  g.strokeStyle = '#efe6d2'
  g.lineWidth = 12
  g.strokeRect(0, 0, w, h)
}

function drawLedger(g, w, h) {
  g.fillStyle = '#e8dcc0'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#c9b993'
  g.fillRect(w / 2 - 2, 0, 4, h)
  const rng = createRng(1916)
  g.fillStyle = 'rgba(40,30,25,0.7)'
  for (let p = 0; p < 2; p++) {
    for (let i = 0; i < 7; i++) {
      const x = p * (w / 2) + w / 2 - 24 - i * 20
      g.fillRect(x, 20, 3, 60 + rng() * 150)
    }
  }
  g.strokeStyle = '#b23a2b'
  g.lineWidth = 3
  g.strokeRect(24, h - 60, 34, 34)
}

function drawMenu(g, w, h) {
  g.fillStyle = '#f2ead8'
  g.fillRect(0, 0, w, h)
  text(g, '稻舍', 20, 46, { size: 34, color: '#5a2e26' })
  for (let i = 0; i < 3; i++) {
    const x = 26 + i * 96
    g.fillStyle = '#e9e4d6'
    g.beginPath()
    g.arc(x + 36, 120, 34, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = ['#8a4a2e', '#c9873a', '#4f8a54'][i]
    g.beginPath()
    g.arc(x + 36, 120, 22, 0, Math.PI * 2)
    g.fill()
    lines(g, x, 170, 72, 2, { gap: 14, h: 5, seed: 30 + i })
  }
}

function drawPriceBoard(g, w, h) {
  g.fillStyle = '#d8c09a'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = '#5a3f2b'
  g.lineWidth = 6
  g.strokeRect(6, 6, w - 12, h - 12)
  g.save()
  g.font = `700 40px ${DISPLAY_FONT}`
  g.fillStyle = '#2a1d14'
  g.textAlign = 'center'
  const cols = [['白', '米'], ['糙', '米'], ['糯', '米']]
  cols.forEach((col, i) => col.forEach((c, k) => g.fillText(c, w - 40 - i * 56, 70 + k * 52)))
  g.restore()
}

function drawCalendar(g, w, h) {
  g.fillStyle = '#f6f2e8'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#c8342c'
  g.fillRect(0, 0, w, 60)
  text(g, '月', w / 2, 46, { size: 36, color: '#fff', align: 'center' })
  text(g, '日', w / 2, 170, { size: 90, color: '#c8342c', align: 'center' })
  lines(g, 20, 200, w - 40, 2, { seed: 9 })
}

function drawNewspaper(g, w, h) {
  g.fillStyle = '#e9e2cf'
  g.fillRect(0, 0, w, h)
  text(g, '報', 20, 50, { size: 44, color: '#2a2420' })
  for (let c = 0; c < 4; c++) lines(g, 20 + c * 74, 70, 62, 8, { gap: 20, h: 5, seed: 40 + c })
}

function drawLabels(g, w, h) {
  const items = [
    ['#f1e8d4', '#5a7d3a', '米'],
    ['#efe2c8', '#a5402c', '米'],
    ['#e8ddc6', '#2f5f8a', '米'],
    ['#f3ead8', '#7a5a2e', '米'],
  ]
  items.forEach(([bg, fg, word], i) => {
    const x = i * (w / 4)
    g.fillStyle = bg
    g.fillRect(x, 0, w / 4, h)
    g.fillStyle = fg
    g.beginPath()
    g.arc(x + w / 8, h * 0.42, 52, 0, Math.PI * 2)
    g.fill()
    text(g, word, x + w / 8, h * 0.42 + 22, { size: 64, color: bg, align: 'center' })
    lines(g, x + 30, h * 0.75, w / 4 - 60, 2, { gap: 18, seed: 60 + i })
  })
}

function drawBooks(g, w, h) {
  const colors = ['#3f6a57', '#8a3b33', '#c9a24a', '#2f4b6e', '#6d4c3a', '#a8566a', '#4f7f8a', '#7b6a3e']
  const rng = createRng(329)
  let x = 0
  while (x < w) {
    const bw = 20 + rng() * 30
    g.fillStyle = colors[Math.floor(rng() * colors.length)]
    g.fillRect(x, 0, bw - 2, h)
    g.fillStyle = 'rgba(255,255,255,0.5)'
    g.fillRect(x + 4, h * 0.18, bw - 10, 6)
    x += bw
  }
}
