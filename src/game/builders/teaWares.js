import { shade } from './props.js'

/**
 * 清末茶行與洋行茶廠共用的器物建模（第 10 階段「一箱茶的旅程」）：
 * 焙茶的磚臺、焙坑與焙籠、揀茶桌與竹篩、秤茶桌上的桿秤、裝箱檯的鉛襯與焊具。
 *
 * 形制依 Davidson（1903，Ch. XXIII）的描述重建（日治初期記載，用於清末為推定相近）：
 * 焙坑「深二呎、徑二呎、相距一呎，周圍是低磚臺」；焙籠「高約三呎、形如骰盅，腰下有篩為底」。
 * 查證紀錄見 docs/research/tea-journey-qing-port.md；全部屬「歷史情境重建」。
 */

const BRICK = '#b07a5c'
const BAMBOO = '#cdb27e'
const TEA = '#4a4034'

/** 焙茶的磚臺與焙坑：臺面與坑口齊平，坑裡是覆著灰的炭火（微光） */
export function roastingPlatform(b, { platform, pits, pitRadius }) {
  const { minX, maxX, minZ, maxZ, height } = platform
  b.box('brick', [maxX - minX, height, maxZ - minZ], [(minX + maxX) / 2, height / 2, (minZ + maxZ) / 2], { tint: BRICK, grime: 0.3 })
  b.box('stone', [maxX - minX + 0.08, 0.05, maxZ - minZ + 0.08], [(minX + maxX) / 2, height + 0.025, (minZ + maxZ) / 2], { tint: '#9c8a74' })
  for (const pit of pits) {
    // 坑口的磚緣與坑裡的炭火（覆灰養火：外圈灰、中央透著暗紅）
    b.cylinder('brick', pitRadius + 0.09, pitRadius + 0.09, 0.07, 12, [pit.x, height + 0.06, pit.z], { tint: shade(BRICK, 0.85) })
    b.cylinder('dark', pitRadius, pitRadius, 0.05, 12, [pit.x, height + 0.07, pit.z], { tint: '#8a8178' })
    b.cylinder('bulb', pitRadius * 0.45, pitRadius * 0.45, 0.03, 10, [pit.x, height + 0.085, pit.z], { tint: '#e2683a' })
    b.addGlow(pit.x, height + 0.3, pit.z, 0.9, '#ff7a3c', 1)
  }
}

/**
 * 焙籠：高約三呎（0.9 m）、形如骰盅（上下略開、腰部收窄）的竹籠，腰下有篩，篩上一層茶。
 * onPit：放在焙坑上（底在磚臺面）；否則放在地上待用。
 */
export function roastingBasket(b, [x, y, z], { tea = true } = {}) {
  const H = 0.9
  const waistY = y + H * 0.42
  // 上下兩段錐筒（開口較寬、腰部收窄）
  b.cylinder('bamboo', 0.3, 0.24, H * 0.42, 12, [x, y + H * 0.21, z], { tint: BAMBOO, grime: 0.15 })
  b.cylinder('bamboo', 0.24, 0.3, H * 0.58, 12, [x, y + H * 0.42 + H * 0.29, z], { tint: shade(BAMBOO, 1.04) })
  // 腰部的篩與篩上的茶
  b.cylinder('wood', 0.235, 0.235, 0.03, 12, [x, waistY, z], { tint: shade(BAMBOO, 0.8) })
  if (tea) b.cylinder('dark', 0.21, 0.21, 0.05, 12, [x, waistY + 0.04, z], { tint: TEA })
  // 籠口與籠腳的竹箍
  b.cylinder('bamboo', 0.31, 0.31, 0.03, 12, [x, y + H - 0.015, z], { tint: shade(BAMBOO, 0.85) })
  b.cylinder('bamboo', 0.31, 0.31, 0.03, 12, [x, y + 0.015, z], { tint: shade(BAMBOO, 0.85) })
}

/** 揀茶桌：矮桌上一面大竹篩，篩裡攤著毛茶、桌邊一小堆挑出來的茶梗 */
export function pickingTable(b, { x, z, rotationY = 0 }, { width, depth, height }) {
  b.group([x, 0, z], rotationY, () => {
    b.box('wood', [width, 0.05, depth], [0, height - 0.025, 0], { tint: '#a98562' })
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.box('wood', [0.07, height - 0.05, 0.07], [sx * (width / 2 - 0.08), (height - 0.05) / 2, sz * (depth / 2 - 0.08)], { tint: '#8a6a4c' })
      }
    }
    // 大竹篩（淺盤）與毛茶
    b.cylinder('bamboo', Math.min(width, depth) * 0.46, Math.min(width, depth) * 0.42, 0.07, 14, [0, height + 0.035, 0], { tint: BAMBOO })
    b.cylinder('dark', Math.min(width, depth) * 0.4, Math.min(width, depth) * 0.4, 0.04, 14, [0, height + 0.06, 0], { tint: TEA })
    // 桌邊挑出來的茶梗
    b.box('dark', [0.16, 0.03, 0.12], [width / 2 - 0.2, height + 0.015, depth / 2 - 0.12], { tint: '#6a5c44' })
  })
}

/** 桿秤：秤桿、秤鉤上的茶簍與滑動的秤錘（放在秤茶桌上，一端架在木架上） */
export function steelyard(b, [x, y, z], rotationY = 0) {
  b.group([x, y, z], rotationY, () => {
    // 木架（立柱與橫臂）吊著秤桿的提繩
    b.box('wood', [0.07, 0.72, 0.07], [-0.45, 0.36, 0], { tint: '#7c5c40' })
    b.box('wood', [0.5, 0.05, 0.06], [-0.24, 0.72, 0], { tint: '#7c5c40' })
    b.box('dark', [0.015, 0.16, 0.015], [-0.05, 0.63, 0], { tint: '#3a332c' })
    // 秤桿（略斜）、秤鉤上的茶簍與秤錘
    b.cylinder('wood', 0.016, 0.022, 1.0, 8, [0.1, 0.55, 0], { rotation: [0, 0, Math.PI / 2 - 0.08], tint: '#c9a05e' })
    b.box('dark', [0.012, 0.1, 0.012], [-0.32, 0.47, 0], { tint: '#3a332c' })
    b.cylinder('bamboo', 0.17, 0.13, 0.16, 10, [-0.32, 0.32, 0], { tint: BAMBOO })
    b.cylinder('dark', 0.15, 0.15, 0.04, 10, [-0.32, 0.41, 0], { tint: TEA })
    b.box('dark', [0.012, 0.09, 0.012], [0.38, 0.5, 0], { tint: '#3a332c' })
    b.cylinder('dark', 0.045, 0.055, 0.09, 8, [0.38, 0.42, 0], { tint: '#4a443c' })
  })
}

/** 裝箱檯：檯面上的鉛片、烙鐵與一箱裝到一半的茶 */
export function packingBench(b, { x, z, width, depth, height, rotationY = 0 }) {
  b.group([x, 0, z], rotationY, () => {
    b.box('wood', [width, 0.06, depth], [0, height - 0.03, 0], { tint: '#9a7a56' })
    for (const sx of [-1, 1]) b.box('wood', [0.09, height - 0.06, depth - 0.12], [sx * (width / 2 - 0.1), (height - 0.06) / 2, 0], { tint: '#7c5c40' })
    // 鉛片（幾張薄灰板）與焊封用的烙鐵
    b.box('steel', [0.5, 0.012, 0.36], [-0.5, height + 0.006, -0.05], { tint: '#9aa0a6' })
    b.box('steel', [0.46, 0.012, 0.32], [-0.46, height + 0.02, 0.02], { tint: '#a8adb2' })
    b.cylinder('dark', 0.022, 0.028, 0.3, 6, [0.1, height + 0.03, 0.18], { rotation: [0, 0, Math.PI / 2 - 0.25], tint: '#4a443c' })
    // 裝到一半的茶箱（開著口、裡面一層茶）
    b.box('planks', [0.48, 0.3, 0.36], [0.55, height + 0.15, -0.05], { tint: '#d9c08e' })
    b.box('dark', [0.4, 0.04, 0.28], [0.55, height + 0.26, -0.05], { tint: TEA })
  })
}
