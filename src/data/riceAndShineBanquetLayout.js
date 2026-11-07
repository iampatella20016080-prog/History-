import { RS, riceToWorld } from './riceAndShineLayout.js'

/**
 * 迪化街 329 號（北街米業店屋）酒樓繁華版的室內配置（第 11 階段第 9 項；設計與查證見 docs/research/interior-rice-and-shine-329.md）
 *
 * 外觀仍是初期的閩南式街屋（木構、瓦屋頂、亭仔腳；同一個店家 ID、同一個地段）。1907 年建屋以前與 1916 年以前 329 號的使用者查無，
 * 店內的格局是歷史情境重建：前店（米箱、桿秤與米斗的櫃台、米籮、麻袋、米篩、帳桌）；後進這個年代沒有重建，隔間門關著。
 * 本地座標與稻舍其他年代相同：原點在立面中心，+z 朝迪化街，室內在 -z；從街上正對立面時 +x 是右手邊。
 * 擺設用「器物清單」描述（做法同有記名茶，見 builders/shopInterior.js）：同一份清單產生模型、碰撞與鏡頭遮擋。
 */

/** 外殼尺寸（面寬與進深與其他年代相同；room 只到隔間牆，店後不開放） */
export const RB_SHELL = {
  half: RS.half,
  depth: RS.depth,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 3.0,
  walkD: 1.7,
  room: { minX: -2.5, maxX: 2.5, minZ: -5.6, maxZ: -0.34 },
}

/** 酒樓繁華版的店內：器物清單、人物、隔間牆（門關著） */
export const RB_VARIANT = {
  door: { minX: -0.9, maxX: 0.9 },
  frontPanels: 'boards',
  partition: { z: -5.5, doorMinX: -0.75, doorMaxX: 0.75, closed: true },
  lamps: [],
  items: [
    // 左牆邊的木製大米箱（兩格：白米與糙米）；牆上掛著米篩
    { type: 'riceBin', x: -2.05, z: -2.5, length: 1.6, depth: 0.8, height: 0.62 },
    { type: 'sieveRack', x: -2.43, z0: -5.35, z1: -3.45, block: false },
    // 門內的兩只米籮
    { type: 'riceBasket', x: -1.85, z: -0.8, radius: 0.28, seed: 3 },
    { type: 'riceBasket', x: -1.35, z: -0.62, radius: 0.26, seed: 5 },
    // 右牆邊的櫃台：桿秤、算盤、米斗與帳簿
    { type: 'riceCounter', x: 2.15, z: -2.8, length: 1.6, depth: 0.6, height: 0.95 },
    // 門邊的麻袋（稻穀）與後面的帳桌
    { type: 'sackPile', x: 1.85, z: -0.95, count: 3 },
    { type: 'ledgerDesk', x: 1.5, z: -4.75, width: 1.0, depth: 0.6, height: 0.76 },
    { type: 'sackPile', x: -1.0, z: -4.9, count: 2 },
    // 客人腳邊自備的米袋
    { type: 'sack', x: -0.25, z: -1.55, block: false },
  ],
  npcs: [
    // 米店夥計（站在米箱靠門的一端）與來買米的客人（情境人物，不具名）；不站在米箱正前方，米箱的提示才不會被人物蓋掉
    { id: 'rs-banquet-shopman', look: 'riceShopman', pose: 'stand', x: -1.95, z: -1.4, rotationY: 1.92, seatY: 0 },
    { id: 'rs-banquet-customer', look: 'riceCustomer', pose: 'stand', x: -0.7, z: -1.85, rotationY: -1.22, seatY: 0 },
  ],
}

export function riceBanquetVariant(config) {
  return config?.variant === 'earlyRiceTrade' ? RB_VARIANT : null
}

const at = (x, y, z) => {
  const p = riceToWorld(x, z)
  return [p.x, y, p.z]
}

/** 室內可以近看的器物的位置（本地座標 → 世界座標） */
export const RB_INSPECT_SPOTS = {
  'rs-banquet-rice-bin': { position: at(-1.95, 0.75, -2.6), prompt: at(-1.3, 1.5, -2.6), radius: 1.6 },
  'rs-banquet-rice-measure': { position: at(2.1, 1.12, -2.85), prompt: at(1.35, 1.6, -2.85), radius: 1.5 },
  'rs-banquet-steelyard': { position: at(2.1, 1.25, -3.3), prompt: at(1.35, 1.65, -3.3), radius: 1.5 },
  'rs-banquet-abacus': { position: at(2.1, 1.02, -2.35), prompt: at(1.35, 1.55, -2.35), radius: 1.4 },
  'rs-banquet-rice-sieve': { position: at(-2.35, 1.5, -4.45), prompt: at(-1.7, 1.8, -4.45), radius: 1.7 },
  'rs-banquet-jute-sack': { position: at(1.75, 0.55, -0.95), prompt: at(1.2, 1.4, -1.1), radius: 1.4 },
  'rs-banquet-carrying-basket': { position: at(-1.6, 0.35, -0.7), prompt: at(-1.1, 1.2, -0.75), radius: 1.2 },
}
