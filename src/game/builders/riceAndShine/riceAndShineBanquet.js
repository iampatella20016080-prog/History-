import { RB_SHELL, riceBanquetVariant } from '../../../data/riceAndShineBanquetLayout.js'
import { RS, riceToWorld } from '../../../data/riceAndShineLayout.js'
import { createShopInterior } from '../shopInterior.js'
import { RICE_BANQUET_FURNITURE } from './riceBanquetFurniture.js'

/**
 * 迪化街 329 號・酒樓繁華版（1895–1930）的店內：外觀是初期的閩南式街屋（riceAndShineExterior.js 的 earlyRiceTrade，
 * buildShophouse 加 walkIn 讓門面留空），室內的外殼、門面、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內（shopInterior.js），
 * 擺設（器物清單，data/riceAndShineBanquetLayout.js）在室內按需載入。後進這個年代沒有重建，隔間門關著。
 */

/** 外殼的材質與顏色：三和土地面、灰泥牆、木梁天花與木板隔間（木板比有記名茶淺：這面牆正對店門，關著的門要看得出來） */
const LOOK = { floor: ['earth', '#9a8468'], wall: '#e6d9be', ceiling: 'beams', partition: 'planks', wood: '#dcc8a6' }

/** exterior(b, cfg, detail)：街邊與店屋外觀（回傳建築產生器的結果） */
export function createRiceBanquet(exterior) {
  return createShopInterior({
    id: RS.id,
    shell: RB_SHELL,
    variantOf: riceBanquetVariant,
    lookOf: () => LOOK,
    furniture: RICE_BANQUET_FURNITURE,
    siteToWorld: riceToWorld,
    exterior,
  })
}
