/** 可重現的亂數產生器（mulberry32），讓程式產生的街景每次載入都一致 */
export function createRng(seed = 1) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length]
}

export function range(rng, min, max) {
  return min + (max - min) * rng()
}

/** 以整數雜湊產生 0–1 之間的值（同樣的輸入永遠得到同樣的結果） */
export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
