/**
 * 畫面動態的純邏輯（不依賴 React／Three，可以直接單測）
 *
 * - 風：整條街共用一個緩慢起伏的風力（幾個不成倍數的正弦疊加，偶爾一陣較強的風），
 *   燈籠、布幡、遮雨棚、煙與落葉都讀同一個值，所以一陣風吹過時整條街一起動。
 * - 燈籠：以掛點為軸的單擺；擺動頻率依燈籠大小（擺長）變化，大燈籠擺得慢。
 * - 各畫質的動態份量：流暢模式減量（落葉少一些、倒影只畫近處的船），但每一種動態都保留。
 * - 繪製呼叫預算：新動態最多增加幾次繪製呼叫。
 */

/** 每一種動態在兩種畫質的份量（smooth 流暢、fine 精緻） */
export const MOTION_SETTINGS = {
  smooth: {
    leavesPerTree: 10, // 每棵榕樹同時在空中的落葉
    rippleOctaves: 2, // 河面波紋疊加的層數
    reflections: 'near', // 船的倒影：只畫近處（和船本身的規則相同）
    smokePuffs: 3, // 每個爐灶同時上升的煙團（蒸氣維持原本的隔一個略過）
    awningSway: 1,
  },
  fine: {
    leavesPerTree: 22,
    rippleOctaves: 3,
    reflections: 'all',
    smokePuffs: 6,
    awningSway: 1,
  },
}

/** 新動態增加的繪製呼叫上限（色彩一趟；落葉一次、河面不變、每艘船的倒影一次） */
export const MOTION_DRAW_BUDGET = {
  leaves: 1,
  smoke: 0, // 煙和蒸氣共用 SteamLayer 的同一個網格
  reflectionsPerBoat: 1,
  maxBoats: 6,
}

/** 每個年代畫面上新動態最多增加的繪製呼叫數（色彩一趟） */
export function motionDrawCalls({ boats = 0, leafTrees = 0 } = {}) {
  const b = MOTION_DRAW_BUDGET
  return (leafTrees > 0 ? b.leaves : 0) + Math.min(boats, b.maxBoats) * b.reflectionsPerBoat + b.smoke
}

export function motionSettings(qualityId) {
  return MOTION_SETTINGS[qualityId] ?? MOTION_SETTINGS.fine
}

/**
 * 風力（0.25–1 之間）：平常是微風，大約每二三十秒有一陣較強的風。
 * 用不成倍數的週期疊加，所以不會看出固定的節奏。
 */
export function windStrength(t) {
  const breeze = 0.5 + 0.18 * Math.sin(t * 0.37) + 0.12 * Math.sin(t * 0.83 + 1.7)
  const gust = Math.max(0, Math.sin(t * 0.23 + 0.6)) ** 6 * 0.45
  return Math.min(1, Math.max(0.25, breeze + gust))
}

/** 風向（水平單位向量 [x, z]）：大致從河面（西）吹向街道，慢慢偏轉 */
export function windDirection(t) {
  const angle = 0.35 * Math.sin(t * 0.05) + 0.15
  return [Math.cos(angle), Math.sin(angle)]
}

/** 燈籠單擺的最大擺角（弧度）：微風時約 2–3°，一陣強風時約 6° */
export const LANTERN_SWING = { base: 0.035, gust: 0.07 }

/**
 * 第 i 個燈籠在時間 t 的擺角 [繞 x 軸, 繞 z 軸]。
 * scale：燈籠大小（擺長，預設 1）；大燈籠擺得慢（單擺頻率 ∝ 1/√擺長）。
 */
export function lanternSwing(t, i, scale = 1, wind = windStrength(t)) {
  const omega = 1.9 / Math.sqrt(Math.max(0.3, scale))
  const phase = i * 1.37
  const amp = LANTERN_SWING.base + LANTERN_SWING.gust * (wind - 0.25)
  const [dx, dz] = windDirection(t)
  // 主要順著風向擺動，另外有一點垂直於風向的晃動
  const along = Math.sin(t * omega + phase) * amp
  const across = Math.sin(t * omega * 1.31 + phase * 2.1) * amp * 0.35
  // 風往 +x 吹 → 燈籠繞 z 軸擺；往 +z 吹 → 繞 x 軸擺
  return [along * dz + across * dx, -(along * dx) + across * dz]
}

/** 決定性的亂數（落葉的位置、相位） */
export function seeded(seed) {
  let s = (seed * 2654435761) >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 落葉：每棵榕樹在樹冠範圍內產生 count 片葉子的參數（起點、落下的時間比例、旋轉速度）。
 * 起點在樹冠下緣附近，葉子在著色器裡依時間落下、旋轉、隨風飄，落地後淡出再從樹冠重新開始。
 */
export function leafSeeds(trees, count) {
  const leaves = []
  trees.forEach((tree, treeIndex) => {
    const rng = seeded(97 + treeIndex * 31)
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2
      const r = Math.sqrt(rng()) * tree.radius
      leaves.push({
        start: [tree.position[0] + Math.cos(a) * r, tree.top - rng() * 0.8, tree.position[2] + Math.sin(a) * r],
        ground: tree.ground ?? 0,
        phase: rng(),
        spin: 1.5 + rng() * 2.5,
        size: 0.09 + rng() * 0.05,
        hue: rng(),
      })
    }
  })
  return leaves
}

/** 一片葉子落下一次的時間（秒）：約 1.2 公尺／秒，再加上落地後停留淡出的時間 */
export function leafCycle(height) {
  return Math.max(2, height / 1.2) + 2.5
}
