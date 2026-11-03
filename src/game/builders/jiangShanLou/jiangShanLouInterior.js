import { JSL_SHELL, JSL_VARIANTS, jslToWorld } from '../../../data/jiangShanLouLayout.js'
import { buildJiangShanLou } from '../jiangShanLou.js'
import { createShopInterior } from '../shopInterior.js'
import { JSL_FURNITURE } from './jiangShanLouFurniture.js'

/**
 * 江山樓・酒樓繁華（第 11 階段；建築樣式 'jiang-shan-lou'）：外觀沿用四層紅磚酒樓（jiangShanLou.js，加 walkIn 讓門口留空、
 * 不畫門內的假宴席）；室內的外殼、樓梯、二樓、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內（shopInterior.js 的 floor2）；
 * 擺設（器物清單，data/jiangShanLouLayout.js）在室內按需載入。
 */
const S = JSL_SHELL
const F2 = S.floor2.y

/** 外殼的材質與顏色：一樓門廳木樑天花、紅磚隔間；二樓木地板 */
const LOOK = { floor: ['stone', '#c9c0ae'], wall: '#ece2cc', ceiling: 'beams', partition: 'brick', wood: '#6a3a2a', floor2: '#6e4e36', wall2: '#efe6d2', windows2: 8 }

export function jiangShanLouVariant(config) {
  return JSL_VARIANTS[config.variant] ?? null
}

/** 騎樓拱廊的柱墩（jiangShanLou.js 的 PIER_X，柱腳石座寬約 0.8）與門口兩側的盆栽 */
export function jslArcadeObstacles() {
  const z0 = S.walkD - 0.55
  const z1 = S.walkD + 0.05
  const piers = [-5.15, -3.3, -1.5, 1.5, 3.3, 5.15].map((x, i, all) => {
    const hw = i === 0 || i === all.length - 1 ? 0.42 : 0.37
    return { minX: Math.max(-S.half, x - hw), maxX: Math.min(S.half, x + hw), minZ: z0, maxZ: z1 }
  })
  const pots = [-1, 1].map((side) => ({ minX: side * 2.3 - 0.32, maxX: side * 2.3 + 0.32, minZ: 0.45, maxZ: 1.05 }))
  return [...piers, ...pots]
}

const interior = createShopInterior({
  id: 'jiang-shan-lou',
  shell: S,
  variantOf: jiangShanLouVariant,
  lookOf: () => LOOK,
  furniture: JSL_FURNITURE,
  siteToWorld: jslToWorld,
  exterior: (b, cfg) => buildJiangShanLou(b, { ...cfg, walkIn: true }),
  extraObstacles: () => jslArcadeObstacles(),
  buildExtras(b, cfg, variant) {
    const lamp = (x, z, y0, ceiling) => {
      const cord = ceiling - 0.7
      b.box('dark', [0.015, ceiling - cord, 0.015], [x, y0 + (ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder('plain', 0.08, 0.22, 0.16, 12, [x, y0 + cord, z], { tint: '#f6f3ec', openEnded: true })
      b.cylinder('bulb', 0.05, 0.05, 0.08, 8, [x, y0 + cord - 0.06, z], { tint: '#ffe6b0' })
    }
    for (const [x, z] of variant.lamps) lamp(x, z, 0, S.ceiling)
    // 二樓宴會廳：白玻璃罩吊燈、吊扇與彩紙串（宴席照）
    const c2 = S.floor2.ceiling
    for (const [x, z] of [[-1.3, -3.6], [1.8, -3.6]]) lamp(x, z, F2, c2)
    const fy = F2 + c2 - 0.45
    b.box('dark', [0.03, 0.42, 0.03], [-3.0, fy + 0.22, -4.0], { tint: '#2a2622' })
    b.cylinder('steel', 0.1, 0.1, 0.12, 10, [-3.0, fy, -4.0], { tint: '#3a3632' })
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2
      b.box('wood', [0.7, 0.012, 0.13], [-3.0 + Math.cos(a) * 0.42, fy - 0.02, -4.0 + Math.sin(a) * 0.42], { rotation: [0, -a, 0], tint: '#4a3426' })
    }
    const colors = ['#c8302a', '#e8c25a', '#3e6a8a', '#efe9dc']
    for (const [x0, z0, x1, z1] of [[-5.0, -1.2, 3.8, -5.6], [-5.0, -5.6, 3.8, -1.2]]) {
      const n = 14
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n
        const sag = Math.sin(t * Math.PI) * 0.45
        b.box('cloth', [0.12, 0.14, 0.004], [x0 + (x1 - x0) * t, F2 + c2 - 0.25 - sag, z0 + (z1 - z0) * t], { rotation: [0, Math.atan2(x1 - x0, z1 - z0), 0], tint: colors[i % colors.length] })
      }
    }
  },
})

export const jslObstacles = interior.obstacles
export const jslUpstairsObstacles = interior.upstairsObstacles
export const jiangShanLouCollision = interior.collision
export const buildJiangShanLouWalkIn = interior.build
export const buildJiangShanLouInterior = interior.buildInterior
