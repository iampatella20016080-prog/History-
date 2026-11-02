import { LHT_SHELL, LHT_VARIANTS, lhtEraToWorld } from '../../../data/linHuaTaiLayout.js'
import { buildShophouse } from '../shophouse.js'
import { stool } from '../props.js'
import { createShopInterior } from '../shopInterior.js'
import { FURNITURE } from './linHuaTaiFurniture.js'
import { buildLinHuaTai1965, lht1965Columns } from './linHuaTaiBuilding1965.js'

/**
 * 林華泰茶行・酒樓繁華到老屋新生（第 11 階段；港口商街版在 builders/linHuaTaiQing.js）：
 * 酒樓繁華與摩登的外觀沿用一般閩南街屋（buildShophouse，walkIn 讓門面留空）；
 * 庶民生活與老屋新生是 1965 年前後改建的四層樓（linHuaTaiBuilding1965.js）。
 * 室內的外殼、門面、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內（shopInterior.js）；
 * 擺設（器物清單，data/linHuaTaiLayout.js）在室內按需載入。格局查無，屬歷史情境重建。
 */
const S = LHT_SHELL

/** 各年代外殼的材質與顏色 */
// building1965：1965 年前後改建的四層樓（linHuaTaiBuilding1965.js）；庶民生活的樓還新、老屋新生的洗石子已經舊了
const LOOKS = {
  baozhongHong: { floor: ['earth', '#9a8468'], wall: '#e8dcc2', ceiling: 'beams', partition: 'planks', wood: '#c4a685' },
  charcoalRoastery: { floor: ['stone', '#a39684'], wall: '#e4d8bf', ceiling: 'beams', partition: 'planks', wood: '#b99a78' },
  wholesaleHong: {
    floor: ['stone', '#9c978c'], wall: '#ddd5c2', ceiling: 'plaster', partition: 'brick', wood: '#a88d70',
    building1965: { facadeTint: '#b4b2a6', finTint: '#e6e3da', frameTint: '#5d7266', grime: 0.08 },
  },
  // 現在：前店的後牆是木壁板與木框玻璃窗（官網照片的背景）
  heritageHong: {
    floor: ['stone', '#aaa498'], wall: '#ece6d6', ceiling: 'plaster', partition: 'planks', wood: '#7e5f45', partitionWindows: true,
    building1965: { facadeTint: '#a19f93', finTint: '#d6d3ca', frameTint: '#4f6157', grime: 0.3 },
  },
}

export function lhtEraVariant(config) {
  return LHT_VARIANTS[config.variant] ?? null
}

const interior = createShopInterior({
  id: 'lin-hua-tai',
  shell: S,
  variantOf: lhtEraVariant,
  lookOf: (config) => LOOKS[config.variant],
  furniture: FURNITURE,
  siteToWorld: lhtEraToWorld,
  exterior: (b, cfg, detail, look) =>
    look.building1965 ? buildLinHuaTai1965(b, cfg, look.building1965) : buildShophouse(b, { ...cfg, walkIn: true, goods: false, display: null }, detail),
  // 四層樓的騎樓柱（在步道兩端）
  extraObstacles: (config, look) => (look?.building1965 ? lht1965Columns(config.width ?? S.half * 2) : []),
  buildExtras(b, cfg, variant) {
    for (const npc of variant.npcs) if (npc.pose === 'sort') stool(b, [npc.x, 0, npc.z], { tint: '#9a7652' })
    // 吊燈：1930 年代起的電燈泡（燈罩與燈泡；只是燈具，不另外打光）
    const cord = S.ceiling - 0.55
    for (const [x, z] of variant.lamps) {
      b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder(cfg.variant === 'heritageHong' ? 'steel' : 'plain', 0.07, 0.2, 0.12, 12, [x, cord, z], { tint: cfg.variant === 'heritageHong' ? '#d8d4c8' : '#e9e2cd', openEnded: true })
      b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, cord - 0.05, z], { tint: '#ffe6b0' })
    }
  },
})

/** 本地座標的障礙物（器物與人物；靠牆的延伸到牆裡、切成互不重疊的矩形） */
export const lhtEraObstacles = interior.obstacles
export const linHuaTaiEraCollision = interior.collision
export const buildLinHuaTaiEra = interior.build
export const buildLinHuaTaiEraInterior = interior.buildInterior
