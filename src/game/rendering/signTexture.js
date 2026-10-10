import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { createRng } from '../utils/random.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 招牌貼圖：以 Canvas 繪製木紋底板、框線與書法字。
 * 橫式招牌依清代習慣由右至左書寫；直式招牌由上而下。
 */
const STYLES = {
  lacquer: { bg: '#2f221a', bg2: '#3e2c22', border: '#b8924f', text: '#e4c074', shadow: 'rgba(0,0,0,0.6)', grain: 'rgba(255,220,170,0.06)' },
  wood: { bg: '#a98159', bg2: '#94704b', border: '#5a3f2b', text: '#21160f', shadow: 'rgba(255,238,205,0.28)', grain: 'rgba(60,35,20,0.17)' },
  red: { bg: '#9d3b2a', bg2: '#873123', border: '#d9b46a', text: '#f2d99c', shadow: 'rgba(40,10,5,0.5)', grain: 'rgba(255,200,170,0.07)' },
  cloth: { bg: '#ece2cb', bg2: '#e0d4b9', border: '#9e3b2a', text: '#2c1f17', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,95,60,0.1)' },
}

const cache = new Map()

function drawSign(g, cw, ch, text, style, vertical) {
  const s = STYLES[style] ?? STYLES.wood
  const rng = createRng(text.charCodeAt(0) * 31 + cw * 7 + ch)
  const grad = g.createLinearGradient(0, 0, vertical ? cw : 0, vertical ? 0 : ch)
  grad.addColorStop(0, s.bg)
  grad.addColorStop(1, s.bg2)
  g.fillStyle = grad
  g.fillRect(0, 0, cw, ch)

  // 木紋／布紋
  g.lineCap = 'round'
  for (let i = 0; i < 46; i++) {
    g.strokeStyle = s.grain
    g.lineWidth = 0.8 + rng() * 2.2
    g.beginPath()
    if (vertical) {
      const x = rng() * cw
      g.moveTo(x, 0)
      g.bezierCurveTo(x + (rng() - 0.5) * 10, ch * 0.33, x + (rng() - 0.5) * 10, ch * 0.66, x + (rng() - 0.5) * 6, ch)
    } else {
      const y = rng() * ch
      g.moveTo(0, y)
      g.bezierCurveTo(cw * 0.33, y + (rng() - 0.5) * 10, cw * 0.66, y + (rng() - 0.5) * 10, cw, y + (rng() - 0.5) * 6)
    }
    g.stroke()
  }

  // 框線
  const m = Math.min(cw, ch) * 0.075
  g.strokeStyle = s.border
  g.lineWidth = m * 0.32
  g.strokeRect(m, m, cw - 2 * m, ch - 2 * m)
  g.lineWidth = Math.max(1.5, m * 0.1)
  g.strokeRect(m * 1.7, m * 1.7, cw - 3.4 * m, ch - 3.4 * m)

  // 文字
  const chars = [...text]
  const n = chars.length
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  if (vertical) {
    const inner = ch - m * 4
    const size = Math.min(cw * 0.64, (inner / n) * 0.9)
    g.font = `700 ${size}px ${DISPLAY_FONT}`
    chars.forEach((char, i) => {
      const x = cw / 2
      const y = m * 2 + (inner * (i + 0.5)) / n
      g.fillStyle = s.shadow
      g.fillText(char, x + size * 0.03, y + size * 0.04)
      g.fillStyle = s.text
      g.fillText(char, x, y)
    })
  } else {
    const display = chars.slice().reverse()
    const inner = cw - m * 4
    const size = Math.min(ch * 0.6, (inner / n) * 0.92)
    g.font = `700 ${size}px ${DISPLAY_FONT}`
    display.forEach((char, i) => {
      const x = m * 2 + (inner * (i + 0.5)) / n
      const y = ch / 2 + size * 0.03
      g.fillStyle = s.shadow
      g.fillText(char, x + size * 0.03, y + size * 0.04)
      g.fillStyle = s.text
      g.fillText(char, x, y)
    })
  }
}

export function getSignTexture({ text, style = 'wood', vertical = false, width, height }) {
  const key = `${text}|${style}|${vertical}|${(width / height).toFixed(2)}`
  if (cache.has(key)) return cache.get(key)
  const pxPerMeter = 320
  const cw = Math.max(64, Math.round(width * pxPerMeter))
  const ch = Math.max(64, Math.round(height * pxPerMeter))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  const draw = () => {
    drawSign(g, cw, ch, text, style, vertical)
    texture.needsUpdate = true
  }
  registerFontTexture(draw, `700 120px ${DISPLAY_FONT}`, text)
  cache.set(key, texture)
  return texture
}

/** 燈籠貼圖（球面 UV）：紅色燈籠、竹骨橫紋與前後各一個字 */
export function getLanternTexture(text) {
  const key = `lantern|${text}`
  if (cache.has(key)) return cache.get(key)
  const cw = 512
  const ch = 256
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  const draw = () => {
    const grad = g.createLinearGradient(0, 0, 0, ch)
    grad.addColorStop(0, '#8e3526')
    grad.addColorStop(0.5, '#c25a3f')
    grad.addColorStop(1, '#8e3526')
    g.fillStyle = grad
    g.fillRect(0, 0, cw, ch)
    g.strokeStyle = 'rgba(70,20,12,0.35)'
    g.lineWidth = 2
    for (let y = 18; y < ch; y += 22) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(cw, y)
      g.stroke()
    }
    g.font = `700 104px ${DISPLAY_FONT}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#211510'
    for (const u of [0.25, 0.75]) g.fillText(text, cw * u, ch / 2 + 4)
    texture.needsUpdate = true
  }
  registerFontTexture(draw, `700 104px ${DISPLAY_FONT}`, text)
  cache.set(key, texture)
  return texture
}
