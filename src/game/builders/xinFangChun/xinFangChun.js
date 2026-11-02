import { XFC_SHELL, XFC_VARIANTS, xfcToWorld } from '../../../data/xinFangChunLayout.js'
import { signBoard } from '../facade.js'
import { stool } from '../props.js'
import { createShopInterior } from '../shopInterior.js'
import { buildTeaMansion } from '../specials.js'
import { XFC_FURNITURE } from './xinFangChunFurniture.js'

/**
 * 新芳春茶行・摩登到老屋新生（第 11 階段；建築樣式 'xin-fang-chun'，依年代的 variant 換室內）：
 * 外觀沿用三開間三層的洋樓（specials.js 的 buildTeaMansion，加 walkIn 讓門面留空）；
 * 室內的外殼、門面、樓梯、天井、二樓、碰撞、鏡頭遮擋與室內範圍用共用的街屋室內（shopInterior.js 的 floor2 與 well）；
 * 擺設（器物清單，data/xinFangChunLayout.js）在室內按需載入。
 */
const S = XFC_SHELL
const F2 = S.floor2.y

/** 各年代外殼的材質與顏色 */
const LOOKS = {
  teaMansion1934: { floor: ['stone', '#a39b8c'], wall: '#e9e1cf', ceiling: 'beams', partition: 'brick', wood: '#7a5a40', floor2: '#8a6a4a', windows2: 6 },
  limitedPartnership: { floor: ['stone', '#9b948a'], wall: '#ddd5c4', ceiling: 'beams', partition: 'brick', wood: '#6e523a', floor2: '#7a5c40', windows2: 6 },
  // 現在：修復後的灰泥牆、深色木地板（《臺灣工藝》77 期 p.52）
  teaStoryHouse: { floor: ['stone', '#b4ab9c'], wall: '#efe9dc', ceiling: 'beams', partition: 'brick', wood: '#5a4030', floor2: '#5a3e2c', wall2: '#ece6da', windows2: 6 },
}

/** 匾額的字（街景的招牌圖集）：二樓盡頭高窗上的紅底金字橫匾「新芳春茶行」（《臺灣工藝》77 期 p.52 可見） */
const PLAQUE_TEXT = { xfc: '新芳春茶行' }

export function xinFangChunVariant(config) {
  return XFC_VARIANTS[config.variant] ?? null
}

/** 騎樓柱（步道兩端；arcade.js 的 arcadeColumn） */
export function xfcArcadeColumns() {
  const colW = 0.4
  const z = S.walkD - colW / 2 - 0.02
  return [-1, 1].map((s) => {
    const x = s * (S.half - colW / 2 - 0.02)
    return { minX: x - colW / 2 - 0.02, maxX: x + colW / 2 + 0.02, minZ: z - colW / 2 - 0.02, maxZ: z + colW / 2 + 0.02 }
  })
}

const interior = createShopInterior({
  id: 'xin-fang-chun',
  shell: S,
  variantOf: xinFangChunVariant,
  lookOf: (config) => LOOKS[config.variant],
  furniture: XFC_FURNITURE,
  siteToWorld: xfcToWorld,
  exterior(b, cfg) {
    const result = buildTeaMansion(b, { ...cfg, walkIn: true })
    const variant = xinFangChunVariant(cfg)
    for (const item of variant?.upstairs?.items ?? []) {
      if (item.type === 'plaque') signBoard(b, { text: PLAQUE_TEXT[item.text], style: 'gold', x: item.x, y: F2 + item.y, z: item.z + 0.035, width: item.width, height: 0.42, frame: false })
    }
    // 門上的木格氣窗（〔照片〕Commons Interior-02：大門兩側與上方高大的格子木窗）：店門口開口與騎樓牆之間
    const top = (result.groundHeight ?? S.groundH) - 0.65
    const bottom = Math.min(2.62, (result.groundHeight ?? S.groundH) - 0.6)
    b.box('lattice', [S.half * 2 - 1.0, top - bottom, 0.05], [0, (top + bottom) / 2, -0.15], { tint: '#3a2a20' })
    b.box('wood', [S.half * 2 - 1.0, 0.08, 0.1], [0, bottom + 0.04, -0.15], { tint: '#2a1e18' })
    // 檜木大門內側的門聯「芳尋顧渚」「春採蒙山」（〔照片〕Commons Interior-02；面朝店內）
    for (const [text, x] of [['芳尋顧渚', 1.45], ['春採蒙山', -1.45]]) {
      b.box('wood', [0.3, 1.5, 0.04], [x, 1.55, -0.32], { tint: '#2a1e18' })
      b.addSign({ text, style: 'gold', vertical: true, width: 0.24, height: 1.36, position: [x, 1.55, -0.345], rotationY: Math.PI })
    }
    return result
  },
  extraObstacles: () => xfcArcadeColumns(),
  buildExtras(b, cfg, variant) {
    const today = cfg.variant === 'teaStoryHouse'
    // 正廳的吊燈：三立形容的「牛奶吊燈」（白色乳白玻璃罩，形制示意）
    const cord = S.ceiling - 0.6
    for (const [x, z] of variant.lamps) {
      b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder('plain', 0.08, 0.2, 0.16, 12, [x, cord, z], { tint: '#f4f1ea', openEnded: true })
      b.cylinder('bulb', 0.05, 0.05, 0.08, 8, [x, cord - 0.06, z], { tint: '#ffe6b0' })
    }
    // 加工廠的天軸：沿天花貫穿的木軸、皮帶輪與垂下的皮帶（〔照片〕Commons〈新芳春茶行撿梗間.jpg〉、Interior-05）
    const shaftY = S.ceiling - 0.35
    b.cylinder('wood', 0.06, 0.06, 4.0, 8, [1.0, shaftY, -9.0], { rotation: [Math.PI / 2, 0, 0], tint: '#6a4e36' })
    for (const z of [-7.3, -8.4, -10.6]) b.cylinder('wood', 0.2, 0.2, 0.08, 14, [1.0, shaftY, z], { rotation: [Math.PI / 2, 0, 0], tint: '#5a4030' })
    for (const sx of [-1, 1]) b.box('steel', [0.04, 0.35, 0.04], [1.0 + sx * 0.1, S.ceiling - 0.17, -9.0], { tint: '#3a3632' })
    // 二樓的板凳（坐著揀茶的人）與吊燈（現在是白玻璃吊燈）
    for (const npc of variant.upstairs?.npcs ?? []) if (npc.pose === 'sort') stool(b, [npc.x, F2, npc.z], { tint: '#9a7652' })
    const c2 = S.floor2.ceiling
    for (const [x, z] of [[-1.6, -2.5], [-1.6, -8.6], [0.8, -9.6]]) {
      const c = c2 - 0.5
      b.box('dark', [0.015, c2 - c, 0.015], [x, F2 + (c2 + c) / 2, z], { tint: '#2a2622' })
      b.cylinder(today ? 'plain' : 'plain', 0.07, 0.18, 0.14, 12, [x, F2 + c, z], { tint: today ? '#f6f4ee' : '#e9e2cd', openEnded: true })
      b.cylinder('bulb', 0.045, 0.045, 0.08, 8, [x, F2 + c - 0.05, z], { tint: '#ffe6b0' })
    }
  },
})

export const xfcObstacles = interior.obstacles
export const xfcUpstairsObstacles = interior.upstairsObstacles
export const xinFangChunCollision = interior.collision
export const buildXinFangChun = interior.build
export const buildXinFangChunInterior = interior.buildInterior
