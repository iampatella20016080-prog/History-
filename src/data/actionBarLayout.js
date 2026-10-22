/**
 * 迪化街一段224巷與導演的豆花店的位置與尺寸（只在 2000–現在「老屋新生」）
 *
 * 建築的產生器（builders/actionBar.js）與相鄰的黃玉階文史館（huangYujieLayout.js）都從這裡取用，
 * 文史館依豆花店的位置、朝向與面寬定位在它的北側，兩棟不會重疊。
 * 尺寸依照片估算，並非測量。
 */

/** 巷口的基準點（世界座標）：迪化街南側的立面線、巷口中央；取代一般地段 south-17 */
export const ACTION_BAR_SITE = { x: 22.9, z: 4.5, rotationY: 0, replaces: ['south-17'] }

/**
 * 巷子座標：原點在迪化街南側立面線、巷口中央，+z 往巷子裡（南），+x 往巷子東側。
 */
export const LANE = {
  half: 3.5, // 巷寬 7 m（兩側是李亭香與稻舍的山牆）
  length: 25, // 迪化街立面線到巷底
  rowDepth: 11, // 兩側街屋的深度
  mouth: -1.7, // 巷口的路面接到迪化街的人行道
}

/**
 * 豆花店的本地座標：原點在騎樓柱列外緣的中央，+z 朝巷子（西）、+x 沿著店面往巷底（南），室內在 -z。
 */
export const SHOP = {
  origin: [3.5, 0, 18.8], // 巷子座標
  rotationY: -Math.PI / 2,
  half: 3.0, // 面寬 6 m
  depth: 9.0,
  arcade: 1.8, // 騎樓深度
  wallT: 0.2,
  groundH: 3.7, // 一樓樓高
  slab: 0.25,
  top: 7.0, // 二樓牆頂
  parapet: 7.65,
  ceiling: 3.35, // 店內天花
  columns: [-1.05, 1.05],
  door: [-0.95, 0.75],
  window: [-2.5, -1.15],
  sideDoor: [1.4, 2.3],
  counterZ: -6.3, // 櫃台正面
  backZ: -8.8, // 室內後牆內側
  /**
   * 北側（本地 -x）騎樓端牆上通往文史館騎樓的拱門（依照片：從文史館的騎樓可以看到拱門另一側的豆花店）。
   * 端牆分成外側與內側兩段，中間是拱門（本地 z 範圍、拱腳高度）。
   */
  passage: { minZ: -1.45, maxZ: -0.4, spring: 2.05 },
}

/** 店的本地座標 → 巷子座標 */
export function shopToLane(x, z) {
  const [ox, , oz] = SHOP.origin
  const c = Math.cos(SHOP.rotationY)
  const s = Math.sin(SHOP.rotationY)
  return [ox + x * c + z * s, oz - x * s + z * c]
}

/** 巷子座標 → 世界座標 */
export function laneToWorld(x, z) {
  const { x: ox, z: oz, rotationY } = ACTION_BAR_SITE
  const c = Math.cos(rotationY)
  const s = Math.sin(rotationY)
  return { x: ox + x * c + z * s, z: oz - x * s + z * c }
}
