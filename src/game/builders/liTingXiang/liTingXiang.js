import { LTX_SHELL, LTX_VARIANTS, ltxToWorld } from '../../../data/liTingXiangLayout.js'
import { createShopInterior } from '../shopInterior.js'
import { LTX_FURNITURE } from './liTingXiangFurniture.js'
import { buildLiTingXiangFacade, ltxArcadeColumns } from './liTingXiangFacade.js'

/**
 * 李亭香・老屋新生（第 11 階段；建築樣式 'li-ting-xiang'，只有這個年代換）：
 * 外觀依使用者提供的照片（liTingXiangFacade.js：紅磚洋樓、灰色飾帶、石匾、白色店面與黑色雨遮）；室內的外殼、門面、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內
 * （shopInterior.js）；擺設（器物清單，data/liTingXiangLayout.js）在室內按需載入。
 * 店內描述只有旅遊媒體的「融合了紅磚洋樓與白洋房空間」：白牆、紅磚的隔間牆；其餘是歷史情境重建。
 */
const S = LTX_SHELL

/** 外殼的材質與顏色：淺色磨石子地、白牆、紅磚隔間（「紅磚洋樓與白洋房」） */
const LOOK = { floor: ['stone', '#d6cfc2'], wall: '#f2eee6', ceiling: 'plaster', partition: 'brick', wood: '#6e4a32' }

export function liTingXiangVariant(config) {
  return LTX_VARIANTS[config.variant] ?? null
}

const interior = createShopInterior({
  id: 'li-ting-xiang',
  shell: S,
  variantOf: liTingXiangVariant,
  lookOf: () => LOOK,
  furniture: LTX_FURNITURE,
  siteToWorld: ltxToWorld,
  exterior: (b, cfg, detail) => buildLiTingXiangFacade(b, { ...cfg, door: liTingXiangVariant(cfg).door }, detail),
  extraObstacles: () => ltxArcadeColumns(),
  buildExtras(b, cfg, variant) {
    // 吊燈：白色燈罩（只是燈具，不另外打光）
    const cord = S.ceiling - 0.6
    for (const [x, z] of variant.lamps) {
      b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder('plain', 0.06, 0.18, 0.16, 12, [x, cord, z], { tint: '#f4f1ea', openEnded: true })
      b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, cord - 0.06, z], { tint: '#ffe6b0' })
    }
  },
})

export const ltxObstacles = interior.obstacles
/**
 * 碰撞：共用街屋室內的範圍；簷下步道往東（本地 −x）延伸到 224 巷，和巷子的可行走範圍接起來
 * （步道原本離地段邊 0.1 公尺，和巷子之間留一條比人窄的縫，推擠會把人卡在縫裡；tests/collision.test.js 的接縫檢查）
 */
export function liTingXiangCollision(config, transform) {
  const result = interior.collision(config, transform)
  if (!result.walkable.length) return result
  const [walk, ...rest] = result.walkable
  const edge = transform(-S.half - 0.05, 0).x
  return { ...result, walkable: [{ ...walk, minX: Math.min(walk.minX, edge), maxX: Math.max(walk.maxX, edge) }, ...rest] }
}
export const buildLiTingXiang = interior.build
export const buildLiTingXiangInterior = interior.buildInterior
