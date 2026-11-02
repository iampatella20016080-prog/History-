import { YJ_SHELL, YJ_VARIANTS, yjToWorld } from '../../../data/youJiLayout.js'
import { buildArcadeBuilding } from '../arcade.js'
import { signBoard } from '../facade.js'
import { stool } from '../props.js'
import { createShopInterior } from '../shopInterior.js'
import { YJ_FURNITURE } from './youJiFurniture.js'

/**
 * 有記名茶・酒樓繁華到老屋新生（第 11 階段；建築樣式 'you-ji'，依年代的 variant 換室內）：
 * 外觀是兩層的紅磚騎樓街屋（arcade.js 的 baroque 立面加 walkIn，樓上一排 7 扇直長格子窗，依官網 IMG_1286）；
 * 室內的外殼、門面、樓梯、二樓、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內（shopInterior.js 的 floor2）；
 * 擺設（器物清單，data/youJiLayout.js）在室內按需載入。
 */
const S = YJ_SHELL
const F2 = S.floor2.y

/** 各年代外殼的材質與顏色（一樓天花、隔間牆、二樓的牆與地板） */
const LOOKS = {
  refineryBanquet: { floor: ['earth', '#9a8468'], wall: '#e6d9be', ceiling: 'beams', partition: 'planks', wood: '#b99a78', floor2: '#7a5a3e', windows2: 7 },
  refineryModern: { floor: ['stone', '#a09584'], wall: '#e2d6bc', ceiling: 'beams', partition: 'planks', wood: '#b0906e', floor2: '#76583c', windows2: 7 },
  factoryNo5: { floor: ['stone', '#a29b8e'], wall: '#ddd4bf', ceiling: 'plaster', partition: 'brick', wood: '#9c7c5c', partitionWindows: true, floor2: '#6e5238', windows2: 7 },
  // 現在：一樓天花露出原木圓樑、米白磨石子方磚地、木格屏風門（官網 IMG_8476）；二樓清源堂木地板、木桁架
  teaHouseToday: { floor: ['stone', '#d8d0bf'], wall: '#ece4d2', ceiling: 'beams', partition: 'planks', wood: '#8a6446', partitionWindows: true, floor2: '#6a4a32', wall2: '#e8dfcc', ceiling2Tint: '#6e5440', windows2: 7 },
}

/** 匾額的字（街景的招牌圖集；「御前清客」照官網 IMG_0923 照抄，使用者 2026-11-02 同意） */
const PLAQUE_TEXT = { youji: '有記名茶', qingke: '御前清客' }

export function youJiVariant(config) {
  return YJ_VARIANTS[config.variant] ?? null
}

/** 騎樓柱（步道兩端，arcade.js 的 arcadeColumn） */
export function yjArcadeColumns() {
  const colW = 0.4
  const z = S.walkD - colW / 2 - 0.02
  return [-1, 1].map((s) => {
    const x = s * (S.half - colW / 2 - 0.02)
    return { minX: x - colW / 2 - 0.02, maxX: x + colW / 2 + 0.02, minZ: z - colW / 2 - 0.02, maxZ: z + colW / 2 + 0.02 }
  })
}

const interior = createShopInterior({
  id: 'you-ji',
  shell: S,
  variantOf: youJiVariant,
  lookOf: (config) => LOOKS[config.variant],
  furniture: YJ_FURNITURE,
  siteToWorld: yjToWorld,
  exterior(b, cfg) {
    const result = buildArcadeBuilding(b, { ...cfg, archetype: 'baroque', facade: 'brick', windowRow: 7, groundHeight: S.groundH, walkIn: true, goods: false, display: null })
    // 匾額的字放在街景（室內細部只有木框）
    const variant = youJiVariant(cfg)
    const plaques = [...(variant?.items ?? []).map((item) => [item, 0]), ...(variant?.upstairs?.items ?? []).map((item) => [item, F2])].filter(([item]) => item.type === 'plaque')
    for (const [item, y0] of plaques) signBoard(b, { text: PLAQUE_TEXT[item.text], style: 'gold', x: item.x, y: y0 + item.y, z: item.z + 0.035, width: item.width, height: 0.42, frame: false })
    return result
  },
  extraObstacles: () => yjArcadeColumns(),
  buildExtras(b, cfg, variant) {
    const lamp = (x, z, y0, ceiling, metal) => {
      const cord = ceiling - 0.55
      b.box('dark', [0.015, ceiling - cord, 0.015], [x, y0 + (ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder(metal ? 'steel' : 'plain', 0.07, 0.2, 0.12, 12, [x, y0 + cord, z], { tint: metal ? '#3a3632' : '#e9e2cd', openEnded: true })
      b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, y0 + cord - 0.05, z], { tint: '#ffe6b0' })
    }
    const today = cfg.variant === 'teaHouseToday'
    // 一樓的吊燈（1930 年代起）；老屋新生門市多一具吊扇（官網 IMG_8476）
    for (const [x, z] of variant.lamps) lamp(x, z, 0, S.ceiling, today)
    if (today) {
      const y = S.ceiling - 0.45
      b.box('dark', [0.03, 0.42, 0.03], [-0.4, y + 0.21, -2.4], { tint: '#2a2622' })
      b.cylinder('steel', 0.1, 0.1, 0.12, 10, [-0.4, y, -2.4], { tint: '#3a3632' })
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3
        b.box('wood', [0.6, 0.012, 0.12], [-0.4 + Math.cos(a) * 0.36, y - 0.02, -2.4 + Math.sin(a) * 0.36], { rotation: [0, -a, 0], tint: '#6a4a32' })
      }
    }
    // 坐著揀茶的人的板凳（二樓）
    for (const npc of variant.upstairs?.npcs ?? []) if (npc.pose === 'sort') stool(b, [npc.x, F2, npc.z], { tint: '#9a7652' })
    // 二樓：吊燈；老屋新生的清源堂是屋頂的木桁架（官網 IMG_0923）
    const c2 = S.floor2.ceiling
    if (today) {
      for (let z = -0.9; z > -10.4; z -= 1.6) {
        b.box('wood', [S.room.maxX - S.room.minX, 0.16, 0.14], [0, F2 + c2 - 0.12, z], { tint: '#5a4030' })
        b.box('wood', [0.12, 0.5, 0.12], [0, F2 + c2 - 0.42, z], { tint: '#5a4030' })
        for (const s of [-1, 1]) b.box('wood', [1.6, 0.1, 0.1], [s * 0.8, F2 + c2 - 0.42, z], { rotation: [0, 0, s * 0.32], tint: '#634733' })
      }
      for (const [x, z] of [[-0.7, -4.0], [-0.7, -6.9]]) lamp(x, z, F2, c2, true)
    } else if (cfg.variant !== 'refineryBanquet') {
      for (const [x, z] of [[-0.9, -2.6], [-0.9, -6.0]]) lamp(x, z, F2, c2, false)
    }
  },
})

/** 本地座標的障礙物（一樓與二樓） */
export const yjObstacles = interior.obstacles
export const yjUpstairsObstacles = interior.upstairsObstacles
export const youJiCollision = interior.collision
export const buildYouJi = interior.build
export const buildYouJiInterior = interior.buildInterior
