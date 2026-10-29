import { LHT } from '../../data/linHuaTaiQingLayout.js'
import { jar, sack, teaChest } from './props.js'
import { roastingBasket, roastingPlatform, steelyard } from './teaWares.js'

/**
 * 林華泰茶行・港口商街版的室內擺設（按需載入；外殼在 linHuaTaiQing.js）：
 * 前店（櫃台、左牆層架的茶甕與茶箱、地上的茶袋）、秤茶桌（桿秤與茶簍）、
 * 後段的焙茶區（磚臺、焙坑、焙籠）。歷史情境重建；配置見 data/linHuaTaiQingLayout.js。
 */
export function buildLinHuaTaiQingInterior(b, cfg = {}, detail = b) {
  const { counter, shelf, scaleTable, roasting, jarsOnFloor, sacks } = LHT

  // 櫃台（木檯面、前板）與檯面上的茶則、紙包
  b.group([counter.x, 0, counter.z], counter.rotationY, () => {
    b.box('wood', [counter.width, 0.06, counter.depth], [0, counter.height - 0.03, 0], { tint: '#9a7a56' })
    b.box('planks', [counter.width, counter.height - 0.06, 0.08], [0, (counter.height - 0.06) / 2, counter.depth / 2 - 0.04], { tint: '#8a6a4c', grime: 0.15 })
    for (const sx of [-1, 1]) b.box('wood', [0.08, counter.height - 0.06, counter.depth - 0.1], [sx * (counter.width / 2 - 0.08), (counter.height - 0.06) / 2, 0], { tint: '#7c5c40' })
    b.box('paper', [0.26, 0.1, 0.2], [-0.5, counter.height + 0.05, 0], { tint: '#e8d9b8' })
    b.box('paper', [0.22, 0.08, 0.18], [-0.24, counter.height + 0.04, 0.05], { tint: '#dfcfa8' })
    b.cylinder('wood', 0.05, 0.05, 0.04, 8, [0.3, counter.height + 0.02, 0.1], { tint: '#c9a05e' })
  })

  // 左牆的層架：茶甕（上層）與小茶箱（下層）
  for (const [level, y] of [
    ['jars', 1.45],
    ['chests', 0.75],
  ]) {
    b.box('wood', [0.42, 0.05, shelf.z1 - shelf.z0], [shelf.x + 0.21, y, (shelf.z0 + shelf.z1) / 2], { tint: '#8d6c4d' })
    const count = 4
    for (let i = 0; i < count; i++) {
      const z = shelf.z0 + 0.35 + i * ((shelf.z1 - shelf.z0 - 0.7) / (count - 1))
      if (level === 'jars') jar(b, [shelf.x + 0.21, y + 0.025, z], { scale: 0.55, tint: i % 2 ? '#58483a' : '#6e4a34', lid: true })
      else teaChest(b, [shelf.x + 0.23, y + 0.025, z], { size: 0.34, rotationY: 0.04 * (i - 1.5) })
    }
  }
  for (const j of jarsOnFloor) jar(b, [j.x, 0, j.z], { scale: 1.0, tint: '#5c4b3c', lid: true })
  for (const [i, s] of sacks.entries()) sack(b, [s.x, 0, s.z], { tint: '#e6d9bd', seed: 4 + i })

  // 秤茶桌：桌、桿秤、待秤的茶簍
  b.group([scaleTable.x, 0, scaleTable.z], scaleTable.rotationY, () => {
    b.box('wood', [scaleTable.width, 0.055, scaleTable.depth], [0, scaleTable.height - 0.028, 0], { tint: '#a98562' })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.box('wood', [0.07, scaleTable.height - 0.055, 0.07], [sx * (scaleTable.width / 2 - 0.09), (scaleTable.height - 0.055) / 2, sz * (scaleTable.depth / 2 - 0.09)], { tint: '#8a6a4c' })
      }
    }
  })
  steelyard(b, [scaleTable.x + 0.15, scaleTable.height, scaleTable.z], scaleTable.rotationY)

  // 焙茶區：磚臺、焙坑與焙籠、待焙的毛茶袋
  roastingPlatform(b, roasting)
  for (const k of roasting.baskets) {
    roastingBasket(b, [k.x, k.onPit ? roasting.platform.height + 0.07 : 0, k.z], { tea: k.onPit })
  }
  for (const s of roasting.sacks) sack(b, [s.x, 0, s.z], { tint: '#ded0b2', seed: 9 })
}
