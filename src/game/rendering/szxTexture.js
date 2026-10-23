import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { createRng } from '../utils/random.js'
import { SZX_ATLAS } from './szxAtlas.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 十字軒糕餅舖的圖集（Canvas 繪製）：原創的簡化圖樣。展板只寫主題字，內文是示意線條；
 * 獎狀只有「獎狀」「感謝狀」字樣與示意線條，不寫頒發單位、得獎內容或年份。
 * 圖集第一次有網格用到時才繪製（materials.js 的 onBeforeCompile），其他年代不佔記憶體。
 */
let texture = null
let drawn = false

export function getSzxTexture() {
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

export function ensureSzxTexture() {
  const tex = getSzxTexture()
  if (drawn) return tex
  drawn = true
  const canvas = tex.image
  canvas.width = SZX_ATLAS.width
  canvas.height = SZX_ATLAS.height
  const g = canvas.getContext('2d')
  const draw = () => {
    drawAll(g)
    tex.needsUpdate = true
  }
  registerFontTexture(draw, `700 64px ${DISPLAY_FONT}`, '十字軒博物館年大稻埕走過一甲子生命禮俗滿月收涎婚嫁祝壽祭祀獎狀感謝狀糕餅舖品名')
  return tex
}

function drawAll(g) {
  const R = SZX_ATLAS.regions
  g.clearRect(0, 0, SZX_ATLAS.width, SZX_ATLAS.height)
  clip(g, R.panelMuseum, (c, w, h) => panel(c, w, h, '十字軒博物館', 'street', 1))
  clip(g, R.panel1930, (c, w, h) => panel(c, w, h, '1930年大稻埕', 'street', 2))
  clip(g, R.panelDecade, (c, w, h) => panel(c, w, h, '走過一甲子', 'shop', 3))
  clip(g, R.panelTenCake, (c, w, h) => panel(c, w, h, '十字軒 TEN CAKE', 'pastry', 4))
  clip(g, R.panelRitual, (c, w, h) => panel(c, w, h, '生命禮俗', 'rows', 5))
  clip(g, R.panelRitual2, (c, w, h) => panel(c, w, h, '生命禮俗', 'icons', 6))
  clip(g, R.certA, (c, w, h) => certificate(c, w, h, '獎狀', 11, false))
  clip(g, R.certB, (c, w, h) => certificate(c, w, h, '感謝狀', 12, false))
  clip(g, R.certC, (c, w, h) => certificate(c, w, h, '感謝狀', 13, true))
  clip(g, R.certD, (c, w, h) => certificate(c, w, h, '獎狀', 14, true))
  clip(g, R.oldPhoto, oldPhoto)
  clip(g, R.priceTags, priceTags)
  clip(g, R.stickers, stickers)
  clip(g, R.tinLabel, tinLabel)
  clip(g, R.giftPattern, giftPattern)
  clip(g, R.mascot, mascot)
  clip(g, R.vent, vent)
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

function text(g, value, x, y, { size = 32, color = '#222', weight = 700, align = 'left' } = {}) {
  g.font = `${weight} ${size}px ${DISPLAY_FONT}`
  g.textAlign = align
  g.textBaseline = 'alphabetic'
  g.fillStyle = color
  g.fillText(value, x, y)
}

function lines(g, x, y, w, n, { gap = 16, h = 4, color = 'rgba(40,40,44,0.45)', seed = 1 } = {}) {
  const rng = createRng(seed)
  g.fillStyle = color
  for (let i = 0; i < n; i++) g.fillRect(x, y + i * gap, w * (0.6 + rng() * 0.4), h)
}

/** 銀灰色的金屬展板：標題、示意線條與線描插圖 */
function panel(g, w, h, title, art, seed) {
  const grad = g.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#d9dcdf')
  grad.addColorStop(0.5, '#c5c9cd')
  grad.addColorStop(1, '#d4d7da')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
  g.strokeStyle = '#8c9196'
  g.lineWidth = 6
  g.strokeRect(3, 3, w - 6, h - 6)
  // 標題帶
  g.fillStyle = '#ecedee'
  g.fillRect(12, 12, w - 24, 46)
  text(g, title, w / 2, 46, { size: title.length > 7 ? 22 : 28, color: '#8a1d1d', align: 'center' })
  lines(g, 20, 76, w - 40, art === 'rows' ? 4 : 7, { gap: 15, seed })
  g.strokeStyle = '#3c3f44'
  g.lineWidth = 2.5
  const top = art === 'rows' ? 150 : 200
  if (art === 'street') {
    // 街屋立面的線描
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 54
      g.strokeRect(x, top + 20, 48, h - top - 50)
      g.beginPath()
      g.moveTo(x, top + 20)
      g.lineTo(x + 24, top)
      g.lineTo(x + 48, top + 20)
      g.stroke()
      g.strokeRect(x + 12, top + 50, 24, 30)
    }
  } else if (art === 'shop') {
    g.strokeRect(24, top, w - 48, h - top - 30)
    for (let i = 0; i < 3; i++) g.strokeRect(36 + i * 64, top + 16, 50, 60)
    g.strokeRect(w / 2 - 30, top + 96, 60, h - top - 126)
  } else if (art === 'pastry') {
    for (const [x, y, r] of [
      [70, top + 60, 34],
      [150, top + 50, 40],
      [110, top + 120, 30],
      [190, top + 120, 26],
    ]) {
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.stroke()
      g.beginPath()
      g.arc(x, y, r * 0.55, 0, Math.PI * 2)
      g.stroke()
    }
  } else if (art === 'rows') {
    // 生命禮俗：五列分隔
    for (let i = 0; i < 5; i++) {
      const y = top + i * 44
      g.strokeRect(16, y, w - 32, 38)
      lines(g, 70, y + 12, w - 100, 2, { gap: 12, h: 3, seed: seed * 10 + i })
      g.beginPath()
      g.arc(42, y + 19, 13, 0, Math.PI * 2)
      g.stroke()
    }
  } else {
    // 五個小圖示：圓餅、龜、喜餅盒、桃、香爐
    const cx = [52, 128, 204]
    g.beginPath()
    g.arc(cx[0], top + 40, 24, 0, Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.ellipse(cx[1], top + 40, 30, 20, 0, 0, Math.PI * 2)
    g.stroke()
    g.strokeRect(cx[2] - 26, top + 18, 52, 44)
    g.beginPath()
    g.moveTo(cx[0], top + 150)
    g.bezierCurveTo(cx[0] - 34, top + 120, cx[0] - 20, top + 90, cx[0], top + 100)
    g.bezierCurveTo(cx[0] + 20, top + 90, cx[0] + 34, top + 120, cx[0], top + 150)
    g.stroke()
    g.strokeRect(cx[1] - 22, top + 104, 44, 40)
    lines(g, 160, top + 100, 70, 4, { gap: 12, h: 3, seed })
  }
}

/** 獎狀：米色紙、紅色印章、深色木框（框由幾何做），只有標題字與示意線條 */
function certificate(g, w, h, title, seed, portrait) {
  g.fillStyle = '#f2ead6'
  g.fillRect(0, 0, w, h)
  const rng = createRng(seed)
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(150,120,70,${0.03 + rng() * 0.05})`
    g.fillRect(rng() * w, rng() * h, 2 + rng() * 6, 2 + rng() * 6)
  }
  g.strokeStyle = '#b48a3c'
  g.lineWidth = 4
  g.strokeRect(8, 8, w - 16, h - 16)
  g.lineWidth = 1.5
  g.strokeRect(14, 14, w - 28, h - 28)
  if (portrait) {
    // 直式：右側直書標題、左側直行的示意線條
    g.font = `700 30px ${DISPLAY_FONT}`
    g.fillStyle = '#2a2420'
    g.textAlign = 'center'
    ;[...title].forEach((ch, i) => g.fillText(ch, w - 34, 56 + i * 36))
    g.fillStyle = 'rgba(40,36,32,0.45)'
    for (let c = 0; c < 6; c++) g.fillRect(w - 70 - c * 20, 34, 4, h * (0.5 + rng() * 0.3))
  } else {
    text(g, title, w / 2, 48, { size: 28, color: '#2a2420', align: 'center' })
    lines(g, 26, 66, w - 52, 6, { gap: 14, h: 3, color: 'rgba(40,36,32,0.45)', seed })
  }
  g.fillStyle = 'rgba(190,40,30,0.85)'
  g.beginPath()
  g.arc(portrait ? 46 : w - 44, h - 42, 18, 0, Math.PI * 2)
  g.fill()
}

function oldPhoto(g, w, h) {
  g.fillStyle = '#c9b48e'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#7a6448'
  g.fillRect(0, h * 0.62, w, h * 0.38)
  g.fillStyle = '#5a4734'
  for (let i = 0; i < 5; i++) {
    const x = 10 + i * 48
    g.fillRect(x, h * 0.25, 42, h * 0.4)
    g.fillStyle = '#e2d3b2'
    g.fillRect(x + 8, h * 0.33, 12, 16)
    g.fillStyle = '#5a4734'
  }
  g.strokeStyle = '#f4ead8'
  g.lineWidth = 8
  g.strokeRect(0, 0, w, h)
}

function priceTags(g, w, h) {
  const n = 8
  for (let i = 0; i < n; i++) {
    const x = (w / n) * i
    g.fillStyle = '#fbf7ee'
    g.fillRect(x + 3, 3, w / n - 6, h - 6)
    g.fillStyle = '#c3242b'
    g.fillRect(x + 3, 3, w / n - 6, 20)
    g.fillStyle = '#c3242b'
    g.beginPath()
    g.arc(x + 20, 50, 10, 0, Math.PI * 2)
    g.fill()
    lines(g, x + 36, 42, w / n - 50, 3, { gap: 13, h: 4, color: 'rgba(40,30,30,0.55)', seed: 30 + i })
  }
}

function stickers(g, w, h) {
  const cell = w / 6
  for (let i = 0; i < 6; i++) {
    const x = cell * i + cell / 2
    if (i % 3 === 0) {
      g.fillStyle = '#c3242b'
      g.beginPath()
      g.arc(x, h / 2, h * 0.42, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#e8c56c'
      g.lineWidth = 4
      g.beginPath()
      g.arc(x, h / 2, h * 0.32, 0, Math.PI * 2)
      g.stroke()
      text(g, '十', x, h / 2 + 14, { size: 38, color: '#f3d88a', align: 'center' })
    } else if (i % 3 === 1) {
      g.fillStyle = '#d9a63e'
      g.fillRect(x - h * 0.42, h * 0.08, h * 0.84, h * 0.84)
      g.strokeStyle = '#8a2a1e'
      g.lineWidth = 3
      g.strokeRect(x - h * 0.36, h * 0.14, h * 0.72, h * 0.72)
      text(g, '糕', x, h / 2 + 14, { size: 36, color: '#8a2a1e', align: 'center' })
    } else {
      g.fillStyle = '#fbf6ea'
      g.fillRect(x - cell * 0.42, h * 0.2, cell * 0.84, h * 0.6)
      g.fillStyle = '#c3242b'
      g.fillRect(x - cell * 0.42, h * 0.2, cell * 0.2, h * 0.6)
      lines(g, x - cell * 0.18, h * 0.32, cell * 0.55, 3, { gap: 12, h: 4, color: 'rgba(60,30,30,0.55)', seed: 50 + i })
    }
  }
}

function tinLabel(g, w, h) {
  const colors = ['#c3242b', '#2f5a7a', '#d9a63e', '#3f6a4a']
  colors.forEach((c, i) => {
    const x = (w / 4) * i
    g.fillStyle = c
    g.fillRect(x, 0, w / 4, h)
    g.fillStyle = '#f6ecd4'
    g.fillRect(x + 12, h * 0.3, w / 4 - 24, h * 0.4)
    text(g, '十字軒', x + w / 8, h * 0.62, { size: 26, color: c, align: 'center' })
  })
}

function giftPattern(g, w, h) {
  g.fillStyle = '#b81f26'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = '#e3bd63'
  g.lineWidth = 3
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const x = 32 + i * 64
      const y = 32 + j * 64
      g.beginPath()
      g.arc(x, y, 22, 0, Math.PI * 2)
      g.stroke()
      g.strokeRect(x - 9, y - 9, 18, 18)
    }
  }
  g.fillStyle = '#e3bd63'
  g.fillRect(w / 2 - 6, 0, 12, h)
  g.fillRect(0, h / 2 - 6, w, 12)
}

function mascot(g, w, h) {
  g.clearRect(0, 0, w, h)
  g.fillStyle = '#f2a6ae'
  g.beginPath()
  g.moveTo(w / 2, h * 0.12)
  g.bezierCurveTo(w * 0.95, h * 0.3, w * 0.85, h * 0.85, w / 2, h * 0.9)
  g.bezierCurveTo(w * 0.15, h * 0.85, w * 0.05, h * 0.3, w / 2, h * 0.12)
  g.fill()
  g.fillStyle = '#6e9a4a'
  g.beginPath()
  g.ellipse(w * 0.62, h * 0.14, 30, 14, -0.5, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#2a2020'
  g.beginPath()
  g.arc(w * 0.42, h * 0.5, 7, 0, Math.PI * 2)
  g.arc(w * 0.58, h * 0.5, 7, 0, Math.PI * 2)
  g.fill()
}

function vent(g, w, h) {
  g.fillStyle = '#e9e8e4'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#9a9a96'
  for (let y = 14; y < h - 10; y += 12) g.fillRect(12, y, w - 24, 4)
}
