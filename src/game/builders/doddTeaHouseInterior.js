import { DODD } from '../../data/doddLayout.js'
import { basket, jar, sack, stool, teaChest } from './props.js'
import { packingBench, pickingTable, roastingBasket, roastingPlatform } from './teaWares.js'

/**
 * 寶順洋行的精製茶廠室內（按需載入；外殼在 doddTeaHouse.js）：
 * 揀茶區（矮桌、大竹篩、簍子與板凳）、焙茶區（磚臺、焙坑、焙籠）、
 * 裝箱區（工作檯、鉛片、茶箱）、側牆的層架與帳桌。
 * 格局查無，依 Davidson（1903）的流程重建（歷史情境重建）；配置見 data/doddLayout.js。
 * 情境人物（揀茶女、焙茶工、職員）由街景資料的 npcs 提供（components/NpcLayer.jsx）。
 */
export function buildDoddTeaHouseInterior(b, cfg = {}, detail = b) {
  const { picking, roasting, packing, shelf, desk } = DODD

  // 揀茶區：兩張矮桌與板凳、裝茶的簍子、茶袋
  for (const table of picking.tables) pickingTable(b, table, picking.tableSize)
  for (const npc of DODD.npcs.filter((item) => item.pose === 'sort')) {
    stool(b, [npc.x, 0, npc.z], { tint: '#9a7652' })
  }
  for (const [i, k] of picking.baskets.entries()) basket(b, [k.x, 0.02, k.z], { radius: 0.26, depth: 0.2, content: 'tea', seed: 11 + i })
  for (const s of picking.sacks) sack(b, [s.x, 0, s.z], { tint: '#e6d9bd', seed: 3 })

  // 焙茶區：磚臺、焙坑（炭火微光）與焙籠
  roastingPlatform(b, roasting)
  for (const k of roasting.baskets) {
    roastingBasket(b, [k.x, k.onPit ? roasting.platform.height + 0.07 : 0, k.z], { tea: k.onPit })
  }

  // 裝箱區：工作檯與茶箱（疊起來的是封好的，旁邊一箱還開著）
  packingBench(b, packing.bench)
  for (const c of packing.chests) {
    for (let i = 0; i < c.stack; i++) teaChest(b, [c.x, i * 0.4, c.z], { size: 0.56, rotationY: c.rotationY + i * 0.08 })
  }
  sack(b, [packing.leadSheets.x, 0, packing.leadSheets.z], { tint: '#cfd2d4', scale: 0.8, seed: 7 })

  // 側牆的層架（茶樣罐）與帳桌
  for (const y of [0.9, 1.5]) {
    b.box('wood', [0.4, 0.05, shelf.z1 - shelf.z0], [shelf.x + 0.2, y, (shelf.z0 + shelf.z1) / 2], { tint: '#8d6c4d' })
    for (let i = 0; i < 5; i++) {
      jar(detail, [shelf.x + 0.2, y + 0.025, shelf.z0 + 0.3 + i * ((shelf.z1 - shelf.z0 - 0.6) / 4)], { scale: 0.45, tint: i % 2 ? '#6e4a34' : '#58483a', lid: true })
    }
  }
  b.group([desk.x, 0, desk.z], desk.rotationY, () => {
    b.box('wood', [1.1, 0.05, 0.6], [0, 0.78, 0], { tint: '#9a7a56' })
    for (const sx of [-1, 1]) b.box('wood', [0.07, 0.76, 0.5], [sx * 0.48, 0.38, 0], { tint: '#7c5c40' })
    // 帳本與算盤（示意）
    b.box('paper', [0.3, 0.025, 0.22], [-0.2, 0.82, 0.05], { tint: '#efe6cf' })
    b.box('wood', [0.34, 0.035, 0.2], [0.22, 0.82, -0.08], { tint: '#6b4a32' })
  })
}
