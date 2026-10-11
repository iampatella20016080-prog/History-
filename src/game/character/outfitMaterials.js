import { CanvasTexture, Color, DoubleSide, RepeatWrapping, SRGBColorSpace } from 'three'
import { createToonMaterial } from '../rendering/materials.js'

/**
 * 服裝材質：依顏色與紋理建立卡通材質並快取（五套服裝共用，切換年代不重建）。
 * 微弱的自發光讓背光時衣服仍保有顏色（與原本的角色相同）。
 * 紋理都是低對比的小圖：斗笠竹編、長衫暗紋、馬褂提花、帆布袋印刷。
 */
const materials = new Map()
const textures = new Map()

function canvas(size, draw) {
  const element = document.createElement('canvas')
  element.width = size
  element.height = size
  draw(element.getContext('2d'), size)
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

const TEXTURES = {
  // 斗笠：斜向交錯的竹編
  weave: () =>
    canvas(64, (g, s) => {
      g.fillStyle = '#ffffff'
      g.fillRect(0, 0, s, s)
      g.strokeStyle = 'rgba(120, 90, 50, 0.28)'
      g.lineWidth = 2
      for (let i = -s; i < s * 2; i += 8) {
        g.beginPath()
        g.moveTo(i, 0)
        g.lineTo(i + s, s)
        g.stroke()
        g.beginPath()
        g.moveTo(i + s, 0)
        g.lineTo(i, s)
        g.stroke()
      }
    }),
  // 長衫：細密的暗紋織布
  robe: () =>
    canvas(64, (g, s) => {
      g.fillStyle = '#ffffff'
      g.fillRect(0, 0, s, s)
      g.fillStyle = 'rgba(0, 0, 0, 0.07)'
      for (let y = 0; y < s; y += 4) g.fillRect(0, y, s, 1)
      g.fillStyle = 'rgba(0, 0, 0, 0.05)'
      for (let x = 0; x < s; x += 6) g.fillRect(x, 0, 1, s)
    }),
  // 馬褂與布包：低對比的雲紋提花
  brocade: () =>
    canvas(128, (g, s) => {
      g.fillStyle = '#d6d0c8'
      g.fillRect(0, 0, s, s)
      g.strokeStyle = 'rgba(255, 240, 210, 0.55)'
      g.lineWidth = 3
      for (const [cx, cy] of [
        [32, 32],
        [96, 96],
        [96, 32],
        [32, 96],
      ]) {
        g.beginPath()
        g.arc(cx, cy, 14, Math.PI * 0.1, Math.PI * 1.6)
        g.stroke()
        g.beginPath()
        g.arc(cx + 10, cy - 4, 7, Math.PI * 0.9, Math.PI * 2.2)
        g.stroke()
      }
    }),
  // 帆布托特包上的印刷：大稻埕字樣與街屋線稿（透明底）
  totePrint: () =>
    canvas(128, (g, s) => {
      g.clearRect(0, 0, s, s)
      g.strokeStyle = 'rgba(70, 55, 45, 0.9)'
      g.lineWidth = 2
      // 街屋線稿
      g.strokeRect(14, 58, 44, 52)
      g.beginPath()
      g.moveTo(10, 58)
      g.lineTo(36, 40)
      g.lineTo(62, 58)
      g.stroke()
      for (const x of [20, 40]) g.strokeRect(x, 70, 10, 14)
      g.strokeRect(28, 92, 14, 18)
      // 大稻埕（直書）
      g.fillStyle = 'rgba(70, 55, 45, 0.95)'
      g.font = 'bold 22px "Noto Serif TC", "Songti TC", serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      ;['大', '稻', '埕'].forEach((ch, i) => g.fillText(ch, 94, 46 + i * 26))
    }),
}

function getTexture(name) {
  if (!textures.has(name)) {
    const texture = TEXTURES[name]()
    if (name === 'robe') texture.repeat.set(6, 6)
    if (name === 'brocade') texture.repeat.set(2, 2)
    if (name === 'weave') texture.repeat.set(6, 2)
    textures.set(name, texture)
  }
  return textures.get(name)
}

/** 依 palette 的設定取得材質（{ color, texture?, double? }） */
export function getOutfitMaterial({ color, texture, double }) {
  const key = `${color}|${texture ?? ''}|${double ? 1 : 0}`
  if (!materials.has(key)) {
    const options = { emissive: new Color(color), emissiveIntensity: 0.16 }
    if (texture) options.map = getTexture(texture)
    if (double) options.side = DoubleSide
    if (texture === 'totePrint') {
      options.transparent = true
      options.alphaTest = 0.4
      options.emissiveIntensity = 0.05
    }
    materials.set(key, createToonMaterial(color, options))
  }
  return materials.get(key)
}
