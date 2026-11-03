import { XFC_SHELL, XFC_VARIANTS, xfcToWorld } from '../../../data/xinFangChunLayout.js'
import { stool, teaChest } from '../props.js'
import { STREET } from '../../config.js'
import { createShopInterior } from '../shopInterior.js'
import { buildArcadeBuilding } from '../arcade.js'
import { balcony, signBoard } from '../facade.js'
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

/** 向內整個打開、貼著門口兩側前牆的兩扇黑色大門：障礙物 */
export function xfcDoorLeaves() {
  return [-1, 1].map((s) => ({ minX: Math.min(s * 1.25, s * 2.4), maxX: Math.max(s * 1.25, s * 2.4), minZ: -0.5, maxZ: -0.34 }))
}

/**
 * 立面（使用者提供的照片，2026-11-03）：米白色的二丁掛磁磚牆、三開間三層；騎樓上方的紅字「新芳春行」；
 * 二、三樓一整排高窗（木格加鐵窗花）；三樓中央的陽臺與欄杆；屋頂的欄杆女兒牆。
 * 一樓：兩側各兩扇深色木格窗與磁磚牆裙；中央灰色洗石子門框（門楣與兩側刻字，字只畫筆畫）、
 * 向內開的兩扇黑色大門，門上金字門聯「春採蒙山」「芳尋顧渚」。
 */
function buildXfcFacade(b, cfg) {
  const result = buildArcadeBuilding(b, {
    ...cfg,
    archetype: 'baroque',
    floors: 3,
    groundHeight: S.groundH,
    upperHeight: 3.2,
    wallMat: 'tile',
    wallTint: '#efe5cf',
    trimTint: '#d8d2c4',
    columnMat: 'tile',
    columnTint: '#e9dfc8',
    windowRow: 7,
    windowRowStyle: 'grille',
    windowRowFrame: '#3a2a20',
    parapet: 'balustrade',
    sign: { text: '新芳春行', style: 'redLettersOld', frame: false },
    windowRowY: 1.72,
    windowRowHeight: 1.62,
    storefront: 'open',
    goods: false,
    walkIn: true,
  })
  const groundH = result.groundHeight ?? S.groundH
  const top = groundH - 0.65
  const inner = S.half - 0.5
  const dark = '#2a1e18'
  // 一樓兩側：磁磚牆、牆裙與兩扇木格窗
  for (const side of [-1, 1]) {
    const x0 = side * 1.5
    const x1 = side * inner
    const cx = (x0 + x1) / 2
    const w = Math.abs(x1 - x0)
    b.box('tile', [w, top - 0.17, 0.1], [cx, (top + 0.17) / 2, -0.15], { tint: '#ece2cb' })
    b.box('stone', [w, 0.6, 0.12], [cx, 0.47, -0.1], { tint: '#9a968c' })
    for (const k of [0.27, 0.73]) {
      const x = x0 + (x1 - x0) * k
      b.box('windowLit', [0.62, 2.0, 0.03], [x, 1.85, -0.09], { tint: '#6a4a30' })
      b.box('lattice', [0.62, 2.0, 0.03], [x, 1.85, -0.07], { tint: dark })
      for (const dy of [-1.04, 1.04]) b.box('wood', [0.74, 0.07, 0.07], [x, 1.85 + dy, -0.07], { tint: dark })
      for (const dx of [-0.34, 0.34]) b.box('wood', [0.07, 2.12, 0.07], [x + dx, 1.85, -0.07], { tint: dark })
    }
  }
  // 中央的洗石子門框：兩側門柱、門楣，刻字只畫筆畫
  for (const side of [-1, 1]) {
    b.box('stone', [0.28, 2.95, 0.16], [side * 1.36, 0.17 + 1.475, -0.07], { tint: '#a8a49a' })
    for (let i = 0; i < 7; i++) b.box('plain', [0.1, 0.12, 0.01], [side * 1.36, 2.7 - i * 0.33, 0.015], { tint: '#c9a64a' })
  }
  b.box('stone', [3.0, 0.36, 0.16], [0, 3.3, -0.07], { tint: '#a8a49a' })
  for (let i = 0; i < 9; i++) b.box('plain', [0.14, 0.12, 0.01], [-1.0 + i * 0.25, 3.3, 0.015], { tint: '#c9a64a' })
  // 兩扇黑色大門（向內整個打開、貼著前牆）與金字門聯（從店裡看：右「春採蒙山」、左「芳尋顧渚」，關門時從街上看是左春右芳）
  for (const [side, text] of [[-1, '春採蒙山'], [1, '芳尋顧渚']]) {
    const cx = side * 1.83
    b.box('wood', [1.15, 2.9, 0.07], [cx, 0.17 + 1.45, -0.42], { tint: '#1e1a18' })
    b.box('wood', [0.32, 1.0, 0.02], [cx, 1.95, -0.465], { tint: '#b8924f' })
    b.addSign({ text, style: 'gold', vertical: true, width: 0.26, height: 0.92, position: [cx, 1.95, -0.478], rotationY: Math.PI })
  }
  // 騎樓上的一只茶箱（原本洋樓外觀就有）
  teaChest(b, [S.half - 1.2, STREET.walkwayHeight, STREET.walkwayDepth * 0.45], { rotationY: 0.1 })
  // 庶民生活：門內加裝的捲門（捲起來收在門楣後面）
  if (cfg.variant === 'limitedPartnership') b.box('shutter', [2.4, 0.32, 0.28], [0, 2.95, -0.36], { tint: '#7f8781' })
  // 三樓中央的陽臺與欄杆、紅框的門
  const y3 = groundH + 3.2
  balcony(b, { y: y3 + 0.88, width: 2.8, depth: 0.7, z: S.walkD, slabTint: '#d8d2c4', railTint: '#e6e0d2' })
  b.box('plain', [1.0, 1.8, 0.04], [0, y3 + 1.92, S.walkD + 0.01], { tint: '#9a2a24' })
  return result
}

const interior = createShopInterior({
  id: 'xin-fang-chun',
  shell: S,
  variantOf: xinFangChunVariant,
  lookOf: (config) => LOOKS[config.variant],
  furniture: XFC_FURNITURE,
  siteToWorld: xfcToWorld,
  exterior(b, cfg) {
    const result = buildXfcFacade(b, cfg)
    const variant = xinFangChunVariant(cfg)
    for (const item of variant?.upstairs?.items ?? []) {
      if (item.type === 'plaque') signBoard(b, { text: PLAQUE_TEXT[item.text], style: 'gold', x: item.x, y: F2 + item.y, z: item.z + 0.035, width: item.width, height: 0.42, frame: false })
    }
    // 老屋新生：正廳後方紅磚牆上的木匾「新芳春行」（使用者提供的照片）
    if (cfg.variant === 'teaStoryHouse') signBoard(b, { text: '新芳春行', style: 'wood', x: 0, y: 2.75, z: -6.53, width: 1.4, height: 0.4, frameTint: '#5a3f2b' })
    return result
  },
  // 騎樓柱與向內開的兩扇大門
  extraObstacles: () => [...xfcArcadeColumns(), ...xfcDoorLeaves()],
  buildExtras(b, cfg, variant) {
    const today = cfg.variant === 'teaStoryHouse'
    // 正廳的吊燈：三立形容的「牛奶吊燈」（白色乳白玻璃罩，形制示意）
    const cord = S.ceiling - 0.6
    for (const [x, z] of variant.lamps) {
      b.box('dark', [0.015, S.ceiling - cord, 0.015], [x, (S.ceiling + cord) / 2, z], { tint: '#2a2622' })
      b.cylinder('plain', 0.08, 0.2, 0.16, 12, [x, cord, z], { tint: '#f4f1ea', openEnded: true })
      b.cylinder('bulb', 0.05, 0.05, 0.08, 8, [x, cord - 0.06, z], { tint: '#ffe6b0' })
    }
    // 正廳兩側牆：灰色牆裙與深色木格高窗（使用者提供的照片），天花下的深灰色大樑
    for (const side of [-1, 1]) {
      const x = side * (S.room.maxX - 0.02)
      b.box('stone', [0.03, 1.0, 6.0], [x, 0.5, -3.4], { tint: '#8e8a82' })
      for (const z of [-1.3, -3.1, -4.9]) {
        b.box('windowLit', [0.02, 2.0, 0.9], [x, 2.0, z], { tint: '#6a4a30' })
        b.box('lattice', [0.03, 2.0, 0.9], [x - side * 0.01, 2.0, z], { tint: '#2a1e18' })
        for (const dz of [-0.48, 0.48]) b.box('wood', [0.06, 2.12, 0.07], [x - side * 0.02, 2.0, z + dz], { tint: '#2a1e18' })
        for (const dy of [-1.04, 1.04]) b.box('wood', [0.06, 0.07, 1.03], [x - side * 0.02, 2.0 + dy, z], { tint: '#2a1e18' })
      }
    }
    for (const z of [-1.6, -4.2]) b.box('plaster', [S.room.maxX * 2, 0.32, 0.4], [0, S.ceiling - 0.16, z], { tint: '#6e6c68' })
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
