import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RedFormat,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { createRng, hash2 } from '../utils/random.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 程式產生的「手繪感」貼圖。
 * 全部以 Canvas 2D 繪製並做成可無縫重複的圖樣，不需要下載外部圖檔。
 * 貼圖保留材質本身的色彩，再由頂點色做每棟建築的細微色差。
 */

function makeCanvas(width, height = width) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function toTexture(canvas, { repeat = true, anisotropy = 8 } = {}) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  if (repeat) texture.wrapS = texture.wrapT = RepeatWrapping
  texture.anisotropy = anisotropy
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = true
  return texture
}

/** 在圖樣邊緣附近重複繪製，讓貼圖可無縫拼接 */
function wrapped(size, x, y, reach, draw) {
  for (const ox of [-size, 0, size]) {
    for (const oy of [-size, 0, size]) {
      const px = x + ox
      const py = y + oy
      if (px + reach < 0 || px - reach > size || py + reach < 0 || py - reach > size) continue
      draw(px, py)
    }
  }
}

function softBlot(g, x, y, r, rgb, alpha) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r)
  grad.addColorStop(0, `rgba(${rgb},${alpha})`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
  g.fill()
}

function speckle(g, size, rng, count, rgb, minAlpha, maxAlpha, maxSize = 1.6) {
  for (let i = 0; i < count; i++) {
    const x = rng() * size
    const y = rng() * size
    const s = 0.6 + rng() * maxSize
    g.fillStyle = `rgba(${rgb},${minAlpha + rng() * (maxAlpha - minAlpha)})`
    g.fillRect(x, y, s, s)
  }
}

/* ───────────────────────── 灰泥牆 ───────────────────────── */
function plasterTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(101)
  g.fillStyle = '#f4ecdc'
  g.fillRect(0, 0, S, S)

  for (let i = 0; i < 70; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 40 + rng() * 90
    const dark = rng() < 0.55
    const a = 0.035 + rng() * 0.05
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '140,112,80' : '255,252,246', a))
  }
  for (let i = 0; i < 240; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 6 + rng() * 22
    const dark = rng() < 0.6
    const a = 0.03 + rng() * 0.05
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '120,95,70' : '255,255,250', a))
  }
  // 抹刀痕
  g.lineCap = 'round'
  for (let i = 0; i < 170; i++) {
    const x = rng() * S
    const y = rng() * S
    const len = 18 + rng() * 60
    const ang = (rng() - 0.5) * 0.5
    const bend = (rng() - 0.5) * 10
    const width = 1.5 + rng() * 4
    const dark = rng() < 0.55
    const a = 0.03 + rng() * 0.05
    wrapped(S, x, y, len, (px, py) => {
      g.strokeStyle = dark ? `rgba(125,100,72,${a})` : `rgba(255,253,248,${a * 1.5})`
      g.lineWidth = width
      g.beginPath()
      g.moveTo(px, py)
      g.quadraticCurveTo(
        px + Math.cos(ang) * len * 0.5,
        py + Math.sin(ang) * len * 0.5 + bend,
        px + Math.cos(ang) * len,
        py + Math.sin(ang) * len,
      )
      g.stroke()
    })
  }
  speckle(g, S, rng, 2200, '100,80,60', 0.05, 0.14)
  // 細裂紋
  for (let i = 0; i < 7; i++) {
    let x = rng() * S
    let y = rng() * S
    const pts = [[x, y]]
    let ang = rng() * Math.PI * 2
    for (let k = 0; k < 9; k++) {
      ang += (rng() - 0.5) * 1.1
      x += Math.cos(ang) * (6 + rng() * 10)
      y += Math.sin(ang) * (6 + rng() * 10)
      pts.push([x, y])
    }
    const alpha = 0.12 + rng() * 0.1
    wrapped(S, pts[0][0], pts[0][1], 120, (px, py) => {
      const dx = px - pts[0][0]
      const dy = py - pts[0][1]
      g.strokeStyle = `rgba(90,70,52,${alpha})`
      g.lineWidth = 0.9
      g.beginPath()
      pts.forEach(([cx, cy], idx) => (idx ? g.lineTo(cx + dx, cy + dy) : g.moveTo(cx + dx, cy + dy)))
      g.stroke()
    })
  }
  return toTexture(canvas)
}

/* ───────────────────────── 紅磚 ───────────────────────── */
const BRICK_COLORS = ['#a55e45', '#ad6749', '#9a5640', '#b06f52', '#a2614a', '#a9654a', '#93553f']

function jitterRect(g, x, y, w, h, rng, j = 1.4) {
  g.beginPath()
  g.moveTo(x + (rng() - 0.5) * j, y + (rng() - 0.5) * j)
  g.lineTo(x + w + (rng() - 0.5) * j, y + (rng() - 0.5) * j)
  g.lineTo(x + w + (rng() - 0.5) * j, y + h + (rng() - 0.5) * j)
  g.lineTo(x + (rng() - 0.5) * j, y + h + (rng() - 0.5) * j)
  g.closePath()
}

function brickTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#d6c4a4'
  g.fillRect(0, 0, S, S)
  const rows = 16
  const rowH = S / rows
  const perRow = 4
  const brickW = S / perRow
  const mortar = 4

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (brickW / 2)
    for (let b = -1; b <= perRow; b++) {
      const id = ((b % perRow) + perRow) % perRow
      const h = hash2(r, id, 7)
      const rng = createRng(Math.floor(h * 1e9))
      let color = BRICK_COLORS[Math.floor(h * BRICK_COLORS.length)]
      if (hash2(r, id, 19) < 0.08) color = '#7a4231'
      const x = b * brickW + offset + mortar / 2
      const y = r * rowH + mortar / 2
      g.fillStyle = color
      jitterRect(g, x, y, brickW - mortar, rowH - mortar, rng)
      g.fill()
      // 磚面斑點與燒痕
      for (let k = 0; k < 10; k++) {
        g.fillStyle = rng() < 0.5 ? 'rgba(60,25,15,0.12)' : 'rgba(255,220,190,0.10)'
        g.fillRect(x + rng() * (brickW - 10), y + rng() * (rowH - 8), 2 + rng() * 9, 1 + rng() * 3)
      }
      // 上緣亮線、下緣暗線，帶出手繪的立體感
      g.strokeStyle = 'rgba(255,225,200,0.16)'
      g.lineWidth = 1.2
      g.beginPath()
      g.moveTo(x + 2, y + 1.5)
      g.lineTo(x + brickW - mortar - 3, y + 1.5)
      g.stroke()
      g.strokeStyle = 'rgba(55,25,15,0.22)'
      g.beginPath()
      g.moveTo(x + 2, y + rowH - mortar - 1)
      g.lineTo(x + brickW - mortar - 2, y + rowH - mortar - 1)
      g.stroke()
    }
  }
  const rng = createRng(202)
  speckle(g, S, rng, 1400, '60,35,25', 0.06, 0.16)
  return toTexture(canvas)
}

/* ───────────────────────── 木紋（無接縫） ───────────────────────── */
function woodTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(303)
  g.fillStyle = '#b28c62'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 26; i++) {
    const x = rng() * S
    const w = 10 + rng() * 40
    const a = 0.04 + rng() * 0.06
    g.fillStyle = rng() < 0.5 ? `rgba(90,60,35,${a})` : `rgba(240,215,180,${a})`
    g.fillRect(x, 0, w, S)
    if (x + w > S) g.fillRect(x - S, 0, w, S)
  }
  g.lineCap = 'round'
  for (let i = 0; i < 90; i++) {
    const x0 = rng() * S
    const amp = 2 + rng() * 6
    const freq = 1 + Math.floor(rng() * 3)
    const phase = rng() * Math.PI * 2
    const a = 0.1 + rng() * 0.2
    const width = 0.6 + rng() * 1.6
    for (const ox of [-S, 0, S]) {
      g.strokeStyle = `rgba(78,52,30,${a})`
      g.lineWidth = width
      g.beginPath()
      for (let y = 0; y <= S; y += 8) {
        const x = x0 + ox + Math.sin((y / S) * Math.PI * 2 * freq + phase) * amp
        if (y === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.stroke()
    }
  }
  speckle(g, S, rng, 900, '70,45,25', 0.06, 0.14)
  return toTexture(canvas)
}

/* ───────────────────────── 木板（有接縫：門板、碼頭） ───────────────────────── */
function planksTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(404)
  const planks = 6
  const pw = S / planks
  const colors = ['#b08a5e', '#a98256', '#b8936a', '#a37b52', '#ae8960', '#9f7a54']
  for (let p = 0; p < planks; p++) {
    const x = p * pw
    g.fillStyle = colors[p]
    g.fillRect(x, 0, pw, S)
    for (let i = 0; i < 12; i++) {
      const x0 = x + 4 + rng() * (pw - 8)
      const amp = 1 + rng() * 3
      const phase = rng() * Math.PI * 2
      g.strokeStyle = `rgba(80,52,30,${0.1 + rng() * 0.18})`
      g.lineWidth = 0.6 + rng() * 1.4
      g.beginPath()
      for (let y = 0; y <= S; y += 8) {
        const px = x0 + Math.sin((y / S) * Math.PI * 4 + phase) * amp
        if (y === 0) g.moveTo(px, y)
        else g.lineTo(px, y)
      }
      g.stroke()
    }
    if (rng() < 0.6) {
      const kx = x + 12 + rng() * (pw - 24)
      const ky = rng() * S
      g.strokeStyle = 'rgba(70,45,25,0.35)'
      g.lineWidth = 1.2
      g.beginPath()
      g.ellipse(kx, ky, 4 + rng() * 3, 8 + rng() * 6, 0, 0, Math.PI * 2)
      g.stroke()
    }
    // 接縫
    g.fillStyle = 'rgba(52,34,20,0.85)'
    g.fillRect(x, 0, 3, S)
    g.fillStyle = 'rgba(240,215,180,0.25)'
    g.fillRect(x + 3, 0, 1.5, S)
  }
  speckle(g, S, rng, 900, '70,45,25', 0.05, 0.13)
  return toTexture(canvas)
}

/* ───────────────────────── 屋瓦（筒瓦＋板瓦） ───────────────────────── */
function roofTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(505)
  g.fillStyle = '#875a4b'
  g.fillRect(0, 0, S, S)
  const cols = 16
  const cw = S / cols
  const course = 64
  for (let c = 0; c < cols; c++) {
    const x = c * cw
    if (c % 2 === 0) {
      // 板瓦（凹）
      g.fillStyle = '#8f5d4c'
      g.fillRect(x, 0, cw, S)
      g.fillStyle = 'rgba(40,18,10,0.18)'
      g.fillRect(x + cw * 0.35, 0, cw * 0.3, S)
    } else {
      // 筒瓦（凸）：左亮右暗
      const grad = g.createLinearGradient(x, 0, x + cw, 0)
      grad.addColorStop(0, '#a9715e')
      grad.addColorStop(0.35, '#b98673')
      grad.addColorStop(0.75, '#9a6552')
      grad.addColorStop(1, '#6e4436')
      g.fillStyle = grad
      g.fillRect(x + 1, 0, cw - 2, S)
    }
    // 瓦片交疊的橫線
    for (let y = 0; y < S; y += course) {
      const oy = (c % 2) * (course / 2)
      const yy = (y + oy) % S
      g.fillStyle = 'rgba(45,20,12,0.32)'
      g.fillRect(x, yy, cw, 2.5)
      g.fillStyle = 'rgba(255,215,190,0.12)'
      g.fillRect(x, yy + 2.5, cw, 2)
    }
  }
  // 風化：青苔與水痕
  for (let i = 0; i < 60; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 8 + rng() * 30
    const a = 0.04 + rng() * 0.07
    const moss = rng() < 0.5
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, moss ? '95,110,80' : '230,215,200', a))
  }
  speckle(g, S, rng, 1200, '40,20,12', 0.06, 0.16)
  return toTexture(canvas)
}

/* ───────────────────────── 石板 ───────────────────────── */
function stoneTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(606)
  g.fillStyle = '#8b8273'
  g.fillRect(0, 0, S, S)
  const tones = ['#c2b9a7', '#b9af9c', '#c9c1b0', '#b1a793', '#bdb4a0', '#c6bca8']
  // 列高總和需等於 S 才能無縫
  const rowHeights = [72, 96, 64, 88, 80, 112]
  let y = 0
  rowHeights.forEach((rh, r) => {
    const count = 3 + Math.floor(rng() * 3)
    const raw = Array.from({ length: count }, () => 0.6 + rng())
    const total = raw.reduce((a, b) => a + b, 0)
    let x = rng() * 60
    raw.forEach((value, i) => {
      const w = (value / total) * S
      const tone = tones[(r * 3 + i) % tones.length]
      const slabRng = createRng(r * 97 + i * 13 + 5)
      for (const ox of [-S, 0]) {
        const sx = x + ox
        g.fillStyle = tone
        jitterRect(g, sx + 2, y + 2, w - 4, rh - 4, slabRng, 2.2)
        g.fill()
        g.fillStyle = 'rgba(255,250,235,0.18)'
        g.fillRect(sx + 4, y + 3, w - 9, 2)
        g.fillStyle = 'rgba(60,52,40,0.18)'
        g.fillRect(sx + 4, y + rh - 6, w - 9, 2)
      }
      x += w
    })
    y += rh
  })
  for (let i = 0; i < 90; i++) {
    const x = rng() * S
    const yy = rng() * S
    const r = 10 + rng() * 34
    const a = 0.03 + rng() * 0.05
    const dark = rng() < 0.6
    wrapped(S, x, yy, r, (px, py) => softBlot(g, px, py, r, dark ? '80,70,55' : '255,250,240', a))
  }
  speckle(g, S, rng, 2600, '70,62,50', 0.06, 0.16)
  return toTexture(canvas)
}

/* ───────────────────────── 夯土地面 ───────────────────────── */
function earthTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(707)
  g.fillStyle = '#cbb894'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 120; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 16 + rng() * 70
    const a = 0.04 + rng() * 0.06
    const dark = rng() < 0.55
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '130,105,72' : '245,235,212', a))
  }
  for (let i = 0; i < 260; i++) {
    const x = rng() * S
    const y = rng() * S
    const rx = 1.5 + rng() * 3.5
    const ry = rx * (0.6 + rng() * 0.4)
    const light = rng() < 0.55
    const rot = rng() * Math.PI
    wrapped(S, x, y, 8, (px, py) => {
      g.fillStyle = light ? 'rgba(232,222,198,0.75)' : 'rgba(140,118,88,0.6)'
      g.beginPath()
      g.ellipse(px, py, rx, ry, rot, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = 'rgba(90,72,50,0.35)'
      g.lineWidth = 0.7
      g.stroke()
    })
  }
  speckle(g, S, rng, 3000, '100,80,55', 0.05, 0.14)
  return toTexture(canvas)
}

/* ───────────────────────── 河水 ───────────────────────── */
function waterTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(808)
  g.fillStyle = '#88a39b'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 30; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 20 + rng() * 50
    const rgb = rng() < 0.5 ? '110,140,135' : '170,196,186'
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, rgb, 0.12))
  }
  g.lineCap = 'round'
  for (let i = 0; i < 70; i++) {
    const x = rng() * S
    const y = rng() * S
    const len = 10 + rng() * 26
    const light = rng() < 0.65
    wrapped(S, x, y, len, (px, py) => {
      g.strokeStyle = light ? 'rgba(232,240,228,0.55)' : 'rgba(90,120,115,0.45)'
      g.lineWidth = light ? 1.6 : 1.2
      g.beginPath()
      g.moveTo(px, py)
      g.quadraticCurveTo(px + len / 2, py - 3, px + len, py)
      g.stroke()
    })
  }
  return toTexture(canvas)
}

/* ───────────────────────── 麻布 ───────────────────────── */
function burlapTexture() {
  const S = 128
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(909)
  g.fillStyle = '#c7aa7a'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < S; i += 4) {
    g.fillStyle = `rgba(110,85,50,${0.12 + rng() * 0.1})`
    g.fillRect(i, 0, 1.5, S)
    g.fillStyle = `rgba(110,85,50,${0.1 + rng() * 0.1})`
    g.fillRect(0, i, S, 1.5)
  }
  speckle(g, S, rng, 500, '90,65,35', 0.08, 0.2, 1.2)
  return toTexture(canvas)
}

/* ───────────────────────── 竹編 ───────────────────────── */
function bambooTexture() {
  const S = 128
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#cfb27a'
  g.fillRect(0, 0, S, S)
  const step = 16
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      const horizontal = ((x + y) / step) % 2 === 0
      g.fillStyle = horizontal ? '#d8bd86' : '#bf9f68'
      g.fillRect(x + 1, y + 1, step - 2, step - 2)
      g.strokeStyle = 'rgba(110,80,40,0.45)'
      g.lineWidth = 1
      g.beginPath()
      if (horizontal) {
        g.moveTo(x + 2, y + step / 2)
        g.lineTo(x + step - 2, y + step / 2)
      } else {
        g.moveTo(x + step / 2, y + 2)
        g.lineTo(x + step / 2, y + step - 2)
      }
      g.stroke()
    }
  }
  return toTexture(canvas)
}

/* ───────────────────────── 茶箱標籤（需要字型） ───────────────────────── */
function teaLabelTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const texture = toTexture(canvas, { repeat: false })
  const fontSpec = `700 150px ${DISPLAY_FONT}`
  const draw = () => {
    const rng = createRng(1001)
    g.fillStyle = '#ead9b6'
    g.fillRect(0, 0, S, S)
    speckle(g, S, rng, 500, '120,90,55', 0.06, 0.16)
    g.strokeStyle = '#9e3b2a'
    g.lineWidth = 10
    g.strokeRect(14, 14, S - 28, S - 28)
    g.lineWidth = 2
    g.strokeRect(30, 30, S - 60, S - 60)
    g.fillStyle = '#2d2018'
    g.font = fontSpec
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('茶', S / 2, S / 2 + 6)
    texture.needsUpdate = true
  }
  registerFontTexture(draw, fontSpec, '茶')
  return texture
}

/* ───────────────────────── 細灰泥（洋樓立面） ───────────────────────── */
function stuccoTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(1101)
  g.fillStyle = '#f7f1e4'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 60; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 50 + rng() * 120
    const dark = rng() < 0.5
    const a = 0.025 + rng() * 0.035
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '150,125,95' : '255,253,248', a))
  }
  // 由上往下的淡淡雨痕
  for (let i = 0; i < 26; i++) {
    const x = rng() * S
    const w = 4 + rng() * 14
    const a = 0.02 + rng() * 0.03
    const grad = g.createLinearGradient(0, 0, 0, S)
    grad.addColorStop(0, `rgba(120,100,80,${a})`)
    grad.addColorStop(1, 'rgba(120,100,80,0)')
    g.fillStyle = grad
    g.fillRect(x, 0, w, S)
    if (x + w > S) g.fillRect(x - S, 0, w, S)
  }
  speckle(g, S, rng, 1400, '110,90,70', 0.04, 0.1)
  return toTexture(canvas)
}

/* ───────────────────────── 二丁掛磁磚（戰後立面） ───────────────────────── */
function tileTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#bdb6a8'
  g.fillRect(0, 0, S, S)
  const rows = 16
  const rowH = S / rows
  const perRow = 4
  const tileW = S / perRow
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (tileW / 2)
    for (let b = -1; b <= perRow; b++) {
      const id = ((b % perRow) + perRow) % perRow
      const h = hash2(r, id, 31)
      const shadeValue = 228 + Math.floor(h * 24)
      const x = b * tileW + offset + 2
      const y = r * rowH + 2
      g.fillStyle = `rgb(${shadeValue},${shadeValue - 4},${shadeValue - 12})`
      g.fillRect(x, y, tileW - 4, rowH - 4)
      g.fillStyle = 'rgba(255,255,255,0.35)'
      g.fillRect(x + 3, y + 2, tileW - 12, 2)
    }
  }
  const rng = createRng(1203)
  for (let i = 0; i < 30; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 30 + rng() * 80
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, '90,80,65', 0.05))
  }
  return toTexture(canvas)
}

/* ───────────────────────── 鐵捲門 ───────────────────────── */
function shutterTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(1301)
  g.fillStyle = '#b9b8b2'
  g.fillRect(0, 0, S, S)
  for (let y = 0; y < S; y += 16) {
    const grad = g.createLinearGradient(0, y, 0, y + 16)
    grad.addColorStop(0, '#d9d8d2')
    grad.addColorStop(0.5, '#b4b3ad')
    grad.addColorStop(1, '#8e8d88')
    g.fillStyle = grad
    g.fillRect(0, y, S, 16)
  }
  for (let i = 0; i < 40; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 4 + rng() * 16
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, '140,90,50', 0.12))
  }
  return toTexture(canvas)
}

/* ───────────────────────── 柏油路面（戰後） ───────────────────────── */
function asphaltTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(1401)
  g.fillStyle = '#a19b91'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 90; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 20 + rng() * 70
    const dark = rng() < 0.55
    const a = 0.05 + rng() * 0.07
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '60,56,50' : '170,164,152', a))
  }
  // 補丁
  for (let i = 0; i < 3; i++) {
    const x = rng() * S
    const y = rng() * S
    const w = 40 + rng() * 90
    const h = 30 + rng() * 60
    g.fillStyle = 'rgba(70,66,60,0.14)'
    g.fillRect(x, y, w, h)
    if (x + w > S) g.fillRect(x - S, y, w, h)
    if (y + h > S) g.fillRect(x, y - S, w, h)
  }
  speckle(g, S, rng, 4200, '210,205,195', 0.12, 0.32, 1.4)
  speckle(g, S, rng, 2600, '40,38,34', 0.12, 0.3, 1.4)
  // 裂縫
  for (let i = 0; i < 8; i++) {
    let x = rng() * S
    let y = rng() * S
    g.strokeStyle = 'rgba(45,42,38,0.4)'
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(x, y)
    for (let k = 0; k < 8; k++) {
      x += (rng() - 0.5) * 30
      y += (rng() - 0.5) * 30
      g.lineTo(x, y)
    }
    g.stroke()
  }
  return toTexture(canvas)
}

/* ───────────────────────── 整齊地磚（當代） ───────────────────────── */
function paversTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(1501)
  g.fillStyle = '#a49c8e'
  g.fillRect(0, 0, S, S)
  const rows = 8
  const rowH = S / rows
  const perRow = 4
  const w = S / perRow
  const tones = ['#d8d1c3', '#cfc7b8', '#ddd6c9', '#c9c1b2', '#d3ccbe']
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (w / 2)
    for (let b = -1; b <= perRow; b++) {
      const id = ((b % perRow) + perRow) % perRow
      const tone = tones[Math.floor(hash2(r, id, 61) * tones.length)]
      const x = b * w + offset + 2.5
      const y = r * rowH + 2.5
      g.fillStyle = tone
      g.fillRect(x, y, w - 5, rowH - 5)
      g.fillStyle = 'rgba(255,255,255,0.22)'
      g.fillRect(x + 2, y + 2, w - 9, 2)
    }
  }
  speckle(g, S, rng, 1800, '90,82,70', 0.05, 0.12)
  return toTexture(canvas)
}

/* ───────────────────────── 條紋布篷 ───────────────────────── */
function stripesTexture() {
  const S = 128
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  for (let x = 0; x < S; x += 16) {
    g.fillStyle = (x / 16) % 2 ? '#f6f0e4' : '#c9c2b5'
    g.fillRect(x, 0, 16, S)
  }
  const rng = createRng(1601)
  speckle(g, S, rng, 300, '90,70,50', 0.05, 0.12, 1)
  return toTexture(canvas)
}

/* ───────────────────────── 雕花木格（門扇、窗扇） ───────────────────────── */
function latticeTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#5a3f2a'
  g.fillRect(0, 0, S, S)
  g.strokeStyle = '#c8a77c'
  g.lineWidth = 7
  g.lineCap = 'square'
  // 方格中帶菱形的窗花
  const cell = 64
  for (let y = 0; y <= S; y += cell) {
    for (let x = 0; x <= S; x += cell) {
      g.strokeRect(x + 6, y + 6, cell - 12, cell - 12)
      g.beginPath()
      g.moveTo(x + cell / 2, y + 12)
      g.lineTo(x + cell - 12, y + cell / 2)
      g.lineTo(x + cell / 2, y + cell - 12)
      g.lineTo(x + 12, y + cell / 2)
      g.closePath()
      g.stroke()
    }
  }
  g.strokeStyle = 'rgba(40,25,15,0.5)'
  g.lineWidth = 2
  for (let y = 0; y <= S; y += cell) {
    for (let x = 0; x <= S; x += cell) g.strokeRect(x + 2, y + 2, cell - 4, cell - 4)
  }
  return toTexture(canvas)
}

/* ───────────────────────── 玻璃櫥窗與室內暖光 ───────────────────────── */
function interiorTexture() {
  const W = 512
  const H = 256
  const canvas = makeCanvas(W, H)
  const g = canvas.getContext('2d')
  const rng = createRng(1701)
  const bg = g.createRadialGradient(W / 2, H * 0.45, 20, W / 2, H * 0.5, W * 0.6)
  bg.addColorStop(0, '#ffd49a')
  bg.addColorStop(0.55, '#c98b52')
  bg.addColorStop(1, '#5e3a24')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  // 層架與商品剪影
  g.fillStyle = 'rgba(70,40,22,0.75)'
  for (const y of [H * 0.38, H * 0.62]) {
    g.fillRect(W * 0.08, y, W * 0.84, 6)
    for (let x = W * 0.1; x < W * 0.9; x += 22 + rng() * 18) {
      const h = 14 + rng() * 22
      const w = 10 + rng() * 14
      if (rng() < 0.5) g.fillRect(x, y - h, w, h)
      else {
        g.beginPath()
        g.ellipse(x + w / 2, y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  // 櫃台
  g.fillStyle = 'rgba(60,34,20,0.85)'
  g.fillRect(W * 0.55, H * 0.72, W * 0.38, H * 0.28)
  // 吊燈
  for (const x of [W * 0.25, W * 0.5, W * 0.75]) {
    g.strokeStyle = 'rgba(60,35,20,0.6)'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, H * 0.16)
    g.stroke()
    const lamp = g.createRadialGradient(x, H * 0.19, 1, x, H * 0.19, 34)
    lamp.addColorStop(0, 'rgba(255,248,220,1)')
    lamp.addColorStop(0.25, 'rgba(255,214,150,0.8)')
    lamp.addColorStop(1, 'rgba(255,200,120,0)')
    g.fillStyle = lamp
    g.beginPath()
    g.arc(x, H * 0.19, 34, 0, Math.PI * 2)
    g.fill()
  }
  // 玻璃反光
  g.fillStyle = 'rgba(255,255,255,0.13)'
  for (let i = 0; i < 4; i++) {
    const x = rng() * W
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x + 40, 0)
    g.lineTo(x - 60, H)
    g.lineTo(x - 100, H)
    g.closePath()
    g.fill()
  }
  const texture = toTexture(canvas, { repeat: false, anisotropy: 4 })
  return texture
}

function glassTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const grad = g.createLinearGradient(0, 0, 0, S)
  grad.addColorStop(0, '#8fb3b4')
  grad.addColorStop(0.45, '#4d6e74')
  grad.addColorStop(1, '#2d4248')
  g.fillStyle = grad
  g.fillRect(0, 0, S, S)
  g.fillStyle = 'rgba(255,255,255,0.18)'
  g.beginPath()
  g.moveTo(S * 0.15, 0)
  g.lineTo(S * 0.35, 0)
  g.lineTo(S * 0.05, S)
  g.lineTo(-S * 0.15, S)
  g.closePath()
  g.fill()
  g.fillStyle = 'rgba(255,255,255,0.1)'
  g.beginPath()
  g.moveTo(S * 0.55, 0)
  g.lineTo(S * 0.62, 0)
  g.lineTo(S * 0.42, S)
  g.lineTo(S * 0.35, S)
  g.closePath()
  g.fill()
  return toTexture(canvas, { repeat: false, anisotropy: 4 })
}

/* ───────────────────────── 卡通渲染階調 ───────────────────────── */
/* ───────────────────────── 洗石子（灰色花崗石粒） ───────────────────────── */
function graniteTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(2471)
  g.fillStyle = '#d3d2ce'
  g.fillRect(0, 0, S, S)
  // 粉刷時的深淺不均與雨痕
  for (let i = 0; i < 70; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 30 + rng() * 90
    const dark = rng() < 0.55
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, dark ? '70,72,74' : '250,250,246', 0.03 + rng() * 0.05))
  }
  // 石粒：深灰、黑與白色的細小顆粒
  speckle(g, S, rng, 9000, '58,58,60', 0.25, 0.6, 2.2)
  speckle(g, S, rng, 2600, '20,20,22', 0.3, 0.7, 1.6)
  speckle(g, S, rng, 3200, '255,255,252', 0.35, 0.8, 1.8)
  speckle(g, S, rng, 1400, '128,112,98', 0.2, 0.45, 1.8)
  return toTexture(canvas)
}

/* ───────────────────────── 市場地磚（灰色方磚） ───────────────────────── */
function marketTileTexture() {
  const S = 512
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(3101)
  g.fillStyle = '#7d817f'
  g.fillRect(0, 0, S, S)
  const n = 4
  const t = S / n
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = 168 + Math.floor(hash2(r, c, 77) * 22)
      g.fillStyle = `rgb(${v},${v + 2},${v + 1})`
      g.fillRect(c * t + 3, r * t + 3, t - 6, t - 6)
      g.fillStyle = 'rgba(255,255,255,0.12)'
      g.fillRect(c * t + 5, r * t + 5, t - 12, 3)
    }
  }
  speckle(g, S, rng, 3600, '70,74,72', 0.15, 0.4, 1.6)
  speckle(g, S, rng, 1200, '235,236,232', 0.2, 0.45, 1.4)
  for (let i = 0; i < 24; i++) {
    const x = rng() * S
    const y = rng() * S
    const r = 20 + rng() * 60
    wrapped(S, x, y, r, (px, py) => softBlot(g, px, py, r, '60,62,60', 0.05))
  }
  return toTexture(canvas)
}

/* ───────────────────────── 白色牆面磁磚 ───────────────────────── */
function whiteTileTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#c9ccca'
  g.fillRect(0, 0, S, S)
  const n = 8
  const t = S / n
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = 238 + Math.floor(hash2(r, c, 91) * 14)
      g.fillStyle = `rgb(${v},${v},${v - 3})`
      g.fillRect(c * t + 1.5, r * t + 1.5, t - 3, t - 3)
      g.fillStyle = 'rgba(255,255,255,0.5)'
      g.fillRect(c * t + 3, r * t + 3, t - 10, 2)
    }
  }
  return toTexture(canvas)
}

/* ───────────────────────── 不鏽鋼（髮絲紋） ───────────────────────── */
function steelTexture() {
  const S = 256
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  const rng = createRng(3301)
  g.fillStyle = '#d4d8d9'
  g.fillRect(0, 0, S, S)
  for (let i = 0; i < 140; i++) {
    const y = rng() * S
    const a = 0.04 + rng() * 0.1
    g.fillStyle = rng() < 0.5 ? `rgba(120,128,132,${a})` : `rgba(255,255,255,${a + 0.05})`
    g.fillRect(0, y, S, 0.6 + rng() * 1.6)
  }
  const grad = g.createLinearGradient(0, 0, S, S)
  grad.addColorStop(0, 'rgba(255,255,255,0.12)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0)')
  grad.addColorStop(1, 'rgba(80,90,95,0.1)')
  g.fillStyle = grad
  g.fillRect(0, 0, S, S)
  return toTexture(canvas)
}

/* ───────────────────────── 有孔的金屬板（電纜線槽） ───────────────────────── */
function perforatedTexture() {
  const S = 128
  const canvas = makeCanvas(S)
  const g = canvas.getContext('2d')
  g.fillStyle = '#d9dcdc'
  g.fillRect(0, 0, S, S)
  g.fillStyle = 'rgba(40,44,46,0.75)'
  for (let y = 4; y < S; y += 8) {
    for (let x = (y / 8) % 2 ? 8 : 4; x < S; x += 8) {
      g.fillRect(x - 1.5, y - 1, 3, 2)
    }
  }
  return toTexture(canvas)
}

function toonGradient() {
  // dot(N, L) 由 -1 → 1 對應 8 格：背光、過渡、受光三段
  const values = [82, 82, 82, 82, 170, 255, 255, 255]
  const texture = new DataTexture(new Uint8Array(values), values.length, 1, RedFormat)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

let cache = null

/** 所有貼圖只產生一次 */
export function getTextures() {
  if (cache) return cache
  cache = {
    plaster: plasterTexture(),
    brick: brickTexture(),
    wood: woodTexture(),
    planks: planksTexture(),
    roof: roofTexture(),
    stone: stoneTexture(),
    earth: earthTexture(),
    water: waterTexture(),
    burlap: burlapTexture(),
    bamboo: bambooTexture(),
    teaLabel: teaLabelTexture(),
    stucco: stuccoTexture(),
    tile: tileTexture(),
    shutter: shutterTexture(),
    asphalt: asphaltTexture(),
    pavers: paversTexture(),
    stripes: stripesTexture(),
    lattice: latticeTexture(),
    interior: interiorTexture(),
    glass: glassTexture(),
    granite: graniteTexture(),
    marketTile: marketTileTexture(),
    whiteTile: whiteTileTexture(),
    steel: steelTexture(),
    perforated: perforatedTexture(),
    toonGradient: toonGradient(),
  }
  return cache
}
