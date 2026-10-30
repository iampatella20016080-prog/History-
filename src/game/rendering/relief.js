import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, Vector2 } from 'three'
import { RELIEF, reliefNormals } from './reliefMath.js'
import { getTextures } from './textures.js'

/**
 * 材質凹凸（只在精緻畫質）：由手繪貼圖推算的法線貼圖接到卡通材質的 normalMap。
 *
 * - 法線貼圖和色彩貼圖同尺寸、同 UV、同重複方式，材質還是同一個，不新增材質批次或繪製呼叫。
 * - 第一次切到精緻畫質時才產生（每張 512²，分幾個影格做完，不會一次卡住畫面）；流暢畫質從不產生。
 * - 切回流暢畫質時把 normalMap 拿掉、重新編譯，著色器與現在完全相同。
 */

const normals = new Map()
let pending = null

function normalTexture(key) {
  if (normals.has(key)) return normals.get(key)
  const source = getTextures()[key]?.image
  if (!source) return null
  const { width, height } = source
  const read = source.getContext?.('2d') ?? (() => {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    const g = c.getContext('2d')
    g.drawImage(source, 0, 0)
    return g
  })()
  const pixels = read.getImageData(0, 0, width, height).data
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const image = new ImageData(reliefNormals(pixels, width, height, RELIEF[key]), width, height)
  canvas.getContext('2d').putImageData(image, 0, 0)
  const texture = new CanvasTexture(canvas)
  // 法線是資料，不做色彩空間轉換；重複、篩選與色彩貼圖相同（遠處 mipmap 自然變平，不會閃爍）
  texture.colorSpace = NoColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = 8
  normals.set(key, texture)
  return texture
}

function attach(material, key, texture) {
  if (!material || material.normalMap === texture) return
  material.normalMap = texture
  if (texture) material.normalScale = new Vector2(RELIEF[key].normalScale, RELIEF[key].normalScale)
  material.needsUpdate = true
}

/**
 * 開關材質凹凸。materialSets() 回傳要處理的材質組（街景與已產生的室內材質；每一步重新取，
 * 中途才產生的室內材質也會處理到）。
 * 開啟時一個影格處理一種材質，避免第一次產生法線貼圖時卡頓。
 */
export function setRelief(enabled, materialSets) {
  if (pending) {
    cancelAnimationFrame(pending)
    pending = null
  }
  const keys = Object.keys(RELIEF)
  if (!enabled) {
    for (const set of materialSets()) for (const key of keys) attach(set[key], key, null)
    return
  }
  const queue = [...keys]
  const step = () => {
    pending = null
    const key = queue.shift()
    if (!key) return
    const texture = normalTexture(key)
    for (const set of materialSets()) attach(set[key], key, texture)
    if (queue.length) pending = requestAnimationFrame(step)
  }
  step()
}

/** 測試用：目前已產生的法線貼圖 */
export function reliefTextureKeys() {
  return [...normals.keys()]
}
