/**
 * 雨天的純邏輯（不依賴 React／Three，可以直接單測；只在精緻畫質使用）
 *
 * 遮雨高度圖（cover map）：年代街景載入後，從正上方用正交鏡頭把街景的靜態網格畫一次，
 * 每個像素記下「這個位置最高的東西有多高」。雨絲、濕地面與屋簷滴水都讀同一張圖：
 * - 雨絲落到這個高度就停（屋頂、騎樓的天花板、榕樹的樹冠下面沒有雨），在那裡濺起水花；
 * - 濕地面只在頭上沒有遮蔽的地方（騎樓下、店裡的地板是乾的）；
 * - 屋簷滴水：高度從屋簷（> 1.8 公尺）一下掉到地面的邊緣，就是會滴水的簷口；沿著街屋的亭仔腳連成一排水簾。
 * 高度用 RGBA8 的兩個通道存成 16 位元（−8..40 公尺，精度約 0.7 公釐），任何 WebGL 2 裝置都能讀回。
 */

/** 遮雨高度圖涵蓋的範圍（世界座標，公尺）：街屋列、河岸廣場、棧橋與慈聖宮廟埕；外面一律當作沒有遮蔽 */
export const COVER = {
  minX: -72,
  maxX: 56,
  minZ: -40,
  maxZ: 40,
  width: 1024,
  height: 640,
  top: 60, // 正交鏡頭的高度
  minY: -8, // 編碼範圍
  maxY: 40,
}

/** 世界座標 → 高度圖的貼圖座標（u 往 +x、v 往 −z；鏡頭從正上方看，畫面上方是 −z） */
export function coverUv(x, z, c = COVER) {
  return [(x - c.minX) / (c.maxX - c.minX), (c.maxZ - z) / (c.maxZ - c.minZ)]
}

/** 高度圖第 (col, row) 個像素中心的世界座標（row 0 是貼圖最下面一列 = maxZ 那一側） */
export function coverTexelWorld(col, row, c = COVER) {
  return [c.minX + ((col + 0.5) / c.width) * (c.maxX - c.minX), c.maxZ - ((row + 0.5) / c.height) * (c.maxZ - c.minZ)]
}

/** 高度（公尺）→ 0..1 → 兩個 8 位元通道（高位、低位）；與著色器的 packHeight 相同 */
export function packHeight(y, c = COVER) {
  const v = Math.min(1, Math.max(0, (y - c.minY) / (c.maxY - c.minY)))
  const hi = Math.floor(v * 255)
  const lo = Math.round((v * 255 - hi) * 255)
  return [hi, lo]
}

/** 兩個 8 位元通道 → 高度（公尺）；沒有畫到東西的像素（全 0）視為沒有遮蔽，回傳 −Infinity */
export function unpackHeight(hi, lo, alpha = 255, c = COVER) {
  if (alpha === 0) return -Infinity
  return c.minY + ((hi + lo / 255) / 255) * (c.maxY - c.minY)
}

/** 把 readPixels 讀回的 RGBA8 轉成每個像素的高度（−Infinity：沒有遮蔽） */
export function decodeCover(pixels, c = COVER) {
  const out = new Float32Array(c.width * c.height)
  for (let i = 0; i < out.length; i++) out[i] = unpackHeight(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 3], c)
  return out
}

/** 地面的高度：沒有遮蔽（高度圖外、河面上）的地方用街道或水面 */
export function groundAt(x, edgeX, waterY) {
  return x < edgeX ? waterY : 0
}

/**
 * 屋簷滴水點：高度圖裡「屋簷（高於 minEave）的旁邊 reach 個像素就是低很多的地方（落差 > minDrop）」的像素。
 * 每個滴水點：[x, 簷口高度, z, 落地高度]。spacing 公尺內只留一個（同一段簷口不會擠在一起），最多 max 個，
 * 離 focus（街道中心）近的優先。
 * heights：decodeCover 的結果；−Infinity 的鄰居用 ground(x) 當高度（河面、廣場外）。
 */
export function findEaveEmitters(heights, c = COVER, { minEave = 1.8, maxEave = 14, minDrop = 1.4, reach = 2, spacing = 0.3, max = 3200, focus = [0, 0], ground = () => 0 } = {}) {
  const { width: w, height: h } = c
  const cell = new Map()
  const found = []
  const at = (col, row) => {
    const v = heights[row * w + col]
    if (v === -Infinity) return ground(coverTexelWorld(col, row, c)[0])
    return v
  }
  const NEIGHBORS = [
    [reach, 0],
    [-reach, 0],
    [0, reach],
    [0, -reach],
  ]
  for (let row = reach; row < h - reach; row++) {
    for (let col = reach; col < w - reach; col++) {
      const top = heights[row * w + col]
      if (!(top >= minEave && top <= maxEave)) continue
      let low = Infinity
      for (const [a, b] of NEIGHBORS) low = Math.min(low, at(col + a, row + b))
      if (!(top - low >= minDrop)) continue
      const [x, z] = coverTexelWorld(col, row, c)
      const key = `${Math.floor(x / spacing)},${Math.floor(z / spacing)}`
      if (cell.has(key)) continue
      cell.set(key, true)
      found.push([x, top - 0.04, z, low])
    }
  }
  if (found.length > max) {
    found.sort((p, q) => Math.hypot(p[0] - focus[0], p[2] - focus[1]) - Math.hypot(q[0] - focus[0], q[2] - focus[1]))
    found.length = max
  }
  return found
}

/** 一滴水從 top 落到 bottom 的時間（自由落體，秒） */
export function dropFallTime(top, bottom, g = 9.8) {
  return Math.sqrt((2 * Math.max(0.05, top - bottom)) / g)
}

/**
 * 雨絲在世界座標的位置（與著色器相同）：種子 seed（0..1）乘上 box 得到固定的世界位置，
 * 再平移整數個 box 到離鏡頭最近的那一個——鏡頭移動時雨絲不會跟著跑，也不會在邊界整片跳動。
 */
export function wrapToCamera(seed, box, camera) {
  const w = seed * box
  return w + box * Math.floor((camera - w) / box + 0.5)
}
