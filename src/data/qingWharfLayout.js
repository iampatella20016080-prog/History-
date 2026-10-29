import { PIER, RIVER } from '../game/config.js'

/**
 * 清末碼頭（港口商街，1853–1895）：河岸廣場與碼頭棧橋旁的茶箱堆、挑夫與停靠的船。
 *
 * 只在 `qing-port` 出現；其他年代的廣場、棧橋與碰撞不變。查證紀錄見 docs/research/qing-wharf.md。
 * 茶箱的形式（木箱、外裱紙、四角鐵皮或竹篾綑紮）與挑夫的穿著都是歷史情境重建，不對應任何照片或具名的人。
 * 座標是世界座標；茶箱堆與挑夫的障礙物同時是鏡頭遮擋方塊（見 builders/qingWharf.js）。
 */
export const QING_WHARF_ERA = 'qing-port'

/**
 * 茶箱：外銷茶的「半箱」（約 40 磅）松木箱，內襯焊封的薄鉛、外貼彩色印花紙或手繪圖案（Davidson 1903）。
 * 外箱的長寬高查無：這裡是依約 40 磅茶葉估的建模比例（公尺），不是史料數字。
 */
export const TEA_CHEST = { width: 0.48, depth: 0.36, height: 0.36 }

/**
 * 茶箱堆：center 為底面中心，cols × rows 個茶箱排在地上，layers 層往上疊（上層少一排，錯開堆疊）
 * - 碼頭北側：等著上船的一大堆
 * - 碼頭南側：榕樹旁剛卸下的一小堆
 */
export const TEA_STACKS = [
  { id: 'north', center: [-42.6, 3.6], rotationY: 0, cols: 3, rows: 2, layers: 3 },
  { id: 'south', center: [-43.0, -4.2], rotationY: 0.12, cols: 2, rows: 2, layers: 2 },
]

/**
 * 挑夫（不具名的情境人物，只有待機動作）：
 * - pole：扁擔挑著兩個茶箱（carry 姿勢，左手扶著肩上的扁擔）
 * - rest：放下擔子休息，扁擔與茶箱放在腳邊
 * rotationY 依 NPC 的慣例（人物面向 +Z）
 */
export const PORTERS = [
  { id: 'pole-pier', look: 'qingPorterPole', pose: 'carry', position: [-42.4, -2.45], rotationY: -Math.PI / 2, load: 'pole' },
  { id: 'rest-north', look: 'qingPorterJacket', pose: 'stand', position: [-40.9, 3.55], rotationY: -Math.PI / 2, load: 'rest', restLoad: [-40.85, 2.45] },
  { id: 'stack-south', look: 'qingPorter', pose: 'stand', position: [-41.9, -4.55], rotationY: -Math.PI / 2 + 0.2, load: 'none' },
]

/** 扁擔：長度與兩端茶箱吊掛的位置（扁擔方向的距離） */
export const POLE = { length: 1.9, chestOffset: 0.78, shoulderY: 1.46, shoulderX: 0.2 }

/**
 * 船（隨水面起伏，畫在 components/River.jsx）：
 * 大型帆船後來無法靠岸，停在河道中，由小船接駁（國家文化記憶庫〈大稻埕碼頭〉）。
 * - 河道中下錨的戎克船（收帆，甲板上有茶箱）
 * - 棧橋兩側的兩艘接駁小船，載著茶箱
 * 流暢模式不畫北側的小船（detailOnly）。船型、帆與大小查無，都是示意（不稱「紅頭船」：那個說法只見一個來源，待核）。
 */
export const WHARF_BOATS = [
  { type: 'sampan', position: [-49.6, RIVER.waterLevel - 0.2, -(PIER.halfWidth + 1.4)], rotationY: Math.PI, length: 5.4, beam: 1.5, canopy: true, bob: 0.6, cargo: 'tea' },
  { type: 'sampan', position: [-50.4, RIVER.waterLevel - 0.2, PIER.halfWidth + 1.35], rotationY: Math.PI + 0.06, length: 4.8, beam: 1.4, canopy: false, bob: 1.7, cargo: 'tea', detailOnly: true },
  { type: 'junk', position: [-66, RIVER.waterLevel - 0.35, -7.5], rotationY: Math.PI - 0.25, length: 10, beam: 2.7, sails: 2, furled: true, bob: 2.4, cargo: 'tea' },
]

/** 船身的鏡頭遮擋方塊（水面以上的船殼與艙房；世界座標，忽略起伏） */
export function boatBlocker(boat) {
  const [x, y, z] = boat.position
  const half = boat.length / 2 + Math.abs(Math.sin(boat.rotationY)) * boat.beam
  const top = boat.type === 'junk' ? y + 1.95 : y + 0.65
  return { minX: x - half, maxX: x + half, minY: RIVER.waterLevel - 0.6, maxY: top, minZ: z - boat.beam / 2, maxZ: z + boat.beam / 2 }
}

/** 茶箱堆每個茶箱的底面中心與高度（本地座標，原點在堆的底面中心；上層少一排，往中間錯開） */
export function stackChests(stack) {
  const { width: w, depth: d, height: h } = TEA_CHEST
  const chests = []
  for (let layer = 0; layer < stack.layers; layer++) {
    const cols = Math.max(1, stack.cols - (layer > 0 && stack.cols > 2 ? layer : 0))
    const rows = Math.max(1, stack.rows - (layer >= 2 ? 1 : 0))
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        chests.push({ x: (c - (cols - 1) / 2) * (w + 0.03), y: layer * h, z: (r - (rows - 1) / 2) * (d + 0.03), layer })
      }
    }
  }
  return chests
}

function rotatedBox(cx, cz, hx, hz, rotationY) {
  const c = Math.abs(Math.cos(rotationY))
  const s = Math.abs(Math.sin(rotationY))
  const ex = hx * c + hz * s
  const ez = hx * s + hz * c
  return { minX: cx - ex, maxX: cx + ex, minZ: cz - ez, maxZ: cz + ez }
}

/** 茶箱堆的範圍（世界座標，含高度） */
export function stackBox(stack) {
  const { width: w, depth: d, height: h } = TEA_CHEST
  const hx = (stack.cols * (w + 0.03)) / 2 + 0.04
  const hz = (stack.rows * (d + 0.03)) / 2 + 0.04
  return { ...rotatedBox(stack.center[0], stack.center[1], hx, hz, stack.rotationY), minY: 0, maxY: stack.layers * h + 0.05 }
}

/**
 * 挑夫（連同扁擔與茶箱）的範圍（世界座標）。人物面向 +Z：本地 x 對應世界 (cos, -sin)、本地 z 對應 (sin, cos)。
 * 挑著擔子的人：扁擔沿著面向的方向，前後各 1.1 公尺；休息的人另外加上腳邊的擔子。
 */
export function porterBoxes(porter) {
  const [x, z] = porter.position
  const boxes = []
  const pole = porter.load === 'pole'
  const hx = pole ? 0.42 : 0.36
  const hz = pole ? 1.1 : 0.3
  boxes.push({ ...rotatedBox(x, z, hx, hz, porter.rotationY), minY: 0, maxY: 1.85 })
  if (porter.restLoad) {
    const [lx, lz] = porter.restLoad
    // 放在地上的擔子沿著 x 方向：扁擔 1.9 公尺、兩端各一個茶箱
    boxes.push({ minX: lx - 1.0, maxX: lx + 1.0, minY: 0, maxY: 0.5, minZ: lz - 0.3, maxZ: lz + 0.3 })
  }
  return boxes
}

/** 清末碼頭所有的障礙物（同時是鏡頭遮擋方塊，人物也不能穿過） */
export function qingWharfBoxes() {
  return [...TEA_STACKS.map(stackBox), ...PORTERS.flatMap(porterBoxes)]
}

/** 清末碼頭的查證來源（都在 data/sources.js；查證紀錄見 docs/research/qing-wharf.md） */
export const QING_WHARF_SOURCE_IDS = ['tcmb-dadaocheng-wharf', 'davidson-formosa-1903', 'demomy-tait-tea-label', 'culture-taipei-walk-dadaocheng-2018', 'panorama-dadaocheng-1981']
