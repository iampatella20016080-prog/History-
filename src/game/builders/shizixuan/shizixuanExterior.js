import { IcosahedronGeometry, TorusGeometry } from 'three'
import { EARLY, MODERN, POSTWAR, SHIZIXUAN_ID } from '../../../data/shizixuanLayout.js'
import { arcadeColumn, glassStorefront, rectWindow } from '../facade.js'
import { planter, shade } from '../props.js'

/**
 * 十字軒糕餅舖（延平北路二段68號；同一個店家 ID，依年代的 variant 替換外觀）
 *
 * - earlyShop（1930–1945）：窄身的閩南式街屋（紅磚、木構），木框玻璃門窗，簡單的木製「十字軒」招牌；
 *   前舖是帳桌與糕餅展示，後面隔出小小的製餅工作間。沒有「TEN CAKE」。
 * - postwarShop（1945–1980）：擴建成兩個店面寬，土黃／米黃灰泥立面，木窗，傳統橫式招牌（手繪字），
 *   屋頂留一個小天井的透光口暗示工坊；木製餅櫃、紙盒與竹籮，不用壓克力。沒有「TEN CAKE」。
 * - modernShop（2000–現在）：依實地照片——三層樓米色建築、兩個騎樓開間，紅底金字「十字軒糕餅舖」招牌，
 *   招牌下一行金色「TEN CAKE SINCE 1930」，木框窗，騎樓停著機車。
 * 室內細部在 shizixuanInterior.js 按需載入；這裡是外殼、招牌、燈火、遮擋方塊、碰撞與點選範圍。
 *
 * 座標：建築本地座標（見 data/shizixuanLayout.js）：原點在一樓店面線中央地面，+z 朝延平北路，室內在 -z。
 */

/** 機車（停在騎樓邊，車頭朝街）：車身、腳踏板、座墊、龍頭與後照鏡、前後輪（與其他店家共用的簡化模型） */
function scooter(b, x, z, rotationY, tint = '#d9dcdc') {
  b.group([x, 0.06, z], rotationY, () => {
    for (const wz of [-0.55, 0.6]) {
      b.add('plain', new TorusGeometry(0.2, 0.07, 6, 14), { position: [0, 0.22, wz], rotation: [0, Math.PI / 2, 0], tint: '#222224' })
      b.cylinder('plain', 0.11, 0.11, 0.1, 10, [0, 0.22, wz], { rotation: [0, 0, Math.PI / 2], tint: '#8b8f93' })
    }
    b.box('plain', [0.36, 0.34, 0.75], [0, 0.55, -0.35], { tint })
    b.box('plain', [0.32, 0.1, 0.62], [0, 0.77, -0.3], { tint: '#1e1e20' })
    b.box('plain', [0.3, 0.08, 0.5], [0, 0.32, 0.18], { tint: '#2a2b2e' })
    b.box('plain', [0.34, 0.6, 0.2], [0, 0.62, 0.48], { rotation: [-0.25, 0, 0], tint })
    b.box('plain', [0.24, 0.22, 0.22], [0, 0.36, 0.62], { tint })
    b.box('plain', [0.6, 0.05, 0.06], [0, 1.0, 0.45], { tint: '#2a2b2e' })
    for (const s of [-1, 1]) {
      b.cylinder('plain', 0.008, 0.008, 0.18, 4, [s * 0.24, 1.1, 0.43], { tint: '#2a2b2e' })
      b.box('plain', [0.09, 0.06, 0.02], [s * 0.26, 1.2, 0.43], { tint: '#1e1e20' })
    }
    b.box('bulb', [0.14, 0.08, 0.03], [0, 0.9, 0.56], { tint: '#f4f1e8' })
  })
}

/* ═══════════ 1930–1945：十字軒（糕餅店初創） ═══════════ */

function earlyShop(b) {
  const L = EARLY
  const { half, wallT, depth, door } = L
  const groundH = 2.9
  const upperH = 1.9
  const wallH = groundH + upperH
  const rise = 1.1
  const ridgeY = wallH + rise
  const brick = '#b06a4e'
  const wood = '#6e4a2f'

  // 側牆與後牆
  for (const s of [-1, 1]) b.box('brick', [wallT, wallH, depth], [s * (half - wallT / 2), wallH / 2, -depth / 2], { tint: shade(brick, 0.92) })
  b.box('brick', [half * 2, wallH, wallT], [0, wallH / 2, -depth + wallT / 2], { tint: shade(brick, 0.9) })
  // 山牆與屋頂（簡單雙坡）
  b.box('roof', [half * 2 + 0.2, 0.12, depth * 0.56], [0, wallH + rise * 0.55, -depth * 0.26], { rotation: [0.32, 0, 0], tint: '#7a8d7f' })
  b.box('roof', [half * 2 + 0.2, 0.12, depth * 0.56], [0, wallH + rise * 0.55, -depth * 0.78], { rotation: [-0.32, 0, 0], tint: '#5f7266' })
  b.box('brick', [half * 2, 0.08, wallT], [0, wallH + 0.04, -wallT / 2], { tint: shade(brick, 0.85) })

  // 店面線：門與兩側的木框玻璃窗
  const wallZ = -wallT / 2
  for (const [x0, x1] of [
    [-half, door.minX],
    [door.maxX, half],
  ]) {
    b.box('brick', [x1 - x0, groundH, wallT], [(x0 + x1) / 2, groundH / 2, wallZ], { tint: shade(brick, 0.9) })
  }
  b.box('brick', [door.maxX - door.minX, groundH - door.height, wallT], [0, (door.height + groundH) / 2, wallZ], { tint: shade(brick, 0.88) })
  // 木框玻璃門（半開）
  b.box('wood', [0.07, door.height, 0.1], [door.minX, door.height / 2, 0.02], { tint: wood })
  b.box('wood', [0.07, door.height, 0.1], [door.maxX, door.height / 2, 0.02], { tint: wood })
  b.box('glass', [door.maxX - door.minX - 0.1, door.height - 0.1, 0.02], [0, door.height / 2, 0], { tint: '#8a9a9c' })
  for (let i = 1; i < 3; i++) b.box('wood', [door.maxX - door.minX - 0.08, 0.03, 0.03], [0, 0.4 * i, 0.03], { tint: wood })
  // 兩側的木框玻璃窗（展示窗）
  for (const s of [-1, 1]) {
    const cx = s * (half + door.maxX) / 2
    const ww = half - Math.abs(door.maxX) - 0.3
    b.box('wood', [ww, 1.3, 0.05], [cx, 1.3, 0.01], { tint: wood })
    b.box('glass', [ww - 0.1, 1.1, 0.02], [cx, 1.3, 0.02], { tint: '#93a4a7' })
  }
  // 二樓一扇小窗
  b.box('wood', [0.9, 0.9, 0.05], [0, groundH + 0.8, 0.01], { tint: wood })
  b.box('glass', [0.74, 0.74, 0.02], [0, groundH + 0.8, 0.02], { tint: '#8a9a9c' })
  for (let i = 1; i < 3; i++) b.box('wood', [0.03, 0.74, 0.04], [0 - 0.37 + (i * 0.74) / 3, groundH + 0.8, 0.03], { tint: wood })

  // 簡單木製「十字軒」招牌，門楣上方
  b.box('wood', [1.1, 0.4, 0.05], [0, door.height + 0.34, 0.05], { tint: '#8a6440' })
  b.addSign({ text: '十字軒', style: 'wood', width: 0.96, height: 0.3, position: [0, door.height + 0.34, 0.08] })

  // 騎樓燈與地面暖光
  b.cylinder('dark', 0.008, 0.008, 0.2, 4, [0, groundH - 0.15, 1.1], { tint: '#1d1b1a' })
  b.add('bulb', new IcosahedronGeometry(0.045, 1), { position: [0, groundH - 0.3, 1.1], tint: '#ffe8c0' })
  b.addGlow(0, groundH - 0.3, 1.1, 0.55, '#ffd59a')
  b.addPool(0, 0.7, 1.0, '#ffcf96')
  return { groundHeight: groundH, wallHeight: wallH, ridgeHeight: ridgeY }
}

/* ═══════════ 1945–1980：十字軒餅舖（戰後） ═══════════ */

function postwarShop(b) {
  const L = POSTWAR
  const { half, wallT, depth, door, skylight } = L
  const groundH = 3.0
  const upperH = 2.5
  const wallH = groundH + upperH
  const plaster = '#d9c79a'
  const wood = '#5c4330'

  for (const s of [-1, 1]) b.box('brick', [wallT, wallH, depth], [s * (half - wallT / 2), wallH / 2, -depth / 2], { tint: shade(plaster, 0.75), grime: 0.2 })
  b.box('brick', [half * 2, wallH, wallT], [0, wallH / 2, -depth + wallT / 2], { tint: shade(plaster, 0.7), grime: 0.2 })
  // 立面：土黃／米黃灰泥，簡單的腰帶與平頂女兒牆
  b.box('plaster', [half * 2, groundH, wallT], [0, groundH / 2, -wallT / 2], { tint: plaster, grime: 0.22 })
  b.box('plaster', [half * 2, upperH, wallT], [0, groundH + upperH / 2, -wallT / 2], { tint: shade(plaster, 1.04), grime: 0.18 })
  b.box('brick', [half * 2 + 0.08, 0.12, wallT + 0.08], [0, groundH - 0.04, -wallT / 2], { tint: shade(plaster, 0.8) })
  b.box('plaster', [half * 2 + 0.1, 0.9, wallT + 0.06], [0, wallH + 0.45, -wallT / 2], { tint: shade(plaster, 1.08) })
  // 屋頂：平頂，中央留一個小天井的透光口
  b.box('roof', [half * 2, 0.14, depth], [0, wallH + 0.9, -depth / 2], { tint: '#8d8478' })
  b.addPool(0, (skylight.minZ + skylight.maxZ) / 2, (skylight.maxZ - skylight.minZ) * 1.2, '#fff4dc', wallH + 0.85)

  // 店面線：門與兩側較大的木框玻璃窗（兩個店面寬，各一組）
  const wallZ = -wallT / 2
  for (const [x0, x1] of [
    [-half, door.minX],
    [door.maxX, half],
  ]) {
    b.box('plaster', [x1 - x0, groundH, wallT], [(x0 + x1) / 2, groundH / 2, wallZ], { tint: plaster, grime: 0.2 })
    const cx = (x0 + x1) / 2
    const ww = Math.min(1.6, (x1 - x0) * 0.6)
    b.box('wood', [ww, 1.5, 0.05], [cx, 1.5, 0.01], { tint: wood })
    b.box('glass', [ww - 0.12, 1.3, 0.02], [cx, 1.5, 0.02], { tint: '#93a4a7' })
    for (let i = 1; i < 3; i++) b.box('wood', [0.04, 1.3, 0.04], [cx - ww / 2 + (i * ww) / 3, 1.5, 0.03], { tint: wood })
  }
  b.box('plaster', [door.maxX - door.minX, groundH - door.height, wallT], [0, (door.height + groundH) / 2, wallZ], { tint: shade(plaster, 0.95) })
  b.box('wood', [door.maxX - door.minX + 0.12, 0.08, 0.18], [0, 0.04, wallZ], { tint: shade(wood, 0.85) })
  b.box('glass', [door.maxX - door.minX - 0.1, door.height - 0.1, 0.02], [0, door.height / 2, 0], { tint: '#8a9a9c' })
  for (const s of [-1, 1]) b.box('wood', [0.07, door.height, 0.08], [s * door.maxX, door.height / 2, wallZ + 0.03], { tint: wood })
  // 二樓三扇木框窗
  for (const x of [-half * 0.5, 0, half * 0.5]) {
    b.box('wood', [1.0, 1.0, 0.05], [x, groundH + 0.95, 0.01], { tint: wood })
    b.box('glass', [0.84, 0.84, 0.02], [x, groundH + 0.95, 0.02], { tint: '#8a9a9c' })
  }

  // 傳統橫式招牌（戰後手繪字）
  b.box('wood', [2.0, 0.44, 0.05], [0, door.height + 0.4, 0.05], { tint: '#d9cdb0' })
  b.addSign({ text: '十字軒餅舖', style: 'painted', width: 1.8, height: 0.32, position: [0, door.height + 0.4, 0.08] })
  // 戰後的電線（與其他店家一致，掛一條裝飾用的黑線）
  b.box('dark', [half * 2 + 0.4, 0.012, 0.012], [0, wallH + 0.2, wallT + 0.05], { tint: '#1f1d1c' })

  for (const x of [-half + 0.9, 0, half - 0.9]) {
    b.cylinder('dark', 0.008, 0.008, 0.2, 4, [x, groundH - 0.15, 1.1], { tint: '#1d1b1a' })
    b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, groundH - 0.3, 1.1], tint: '#ffe8c0' })
    b.addGlow(x, groundH - 0.3, 1.1, 0.6, '#ffd59a')
  }
  b.addPool(0, 0.7, 1.5, '#ffcf96')
  return { groundHeight: groundH, wallHeight: wallH }
}

/* ═══════════ 2000–現在：十字軒糕餅舖（延平北路二段68號） ═══════════ */

function modernShop(b) {
  const L = MODERN
  const { half, wallT, depth, doorL, doorR } = L
  const groundH = 3.1
  const upperH = 2.7
  const wallH = groundH + upperH * 2
  const beige = '#e3d3ac'
  const cream = '#f1e7cc'
  const wood = '#7a5536'

  for (const s of [-1, 1]) b.box('brick', [wallT, wallH, depth], [s * (half - wallT / 2), wallH / 2, -depth / 2], { tint: shade(beige, 0.86) })
  b.box('brick', [half * 2, wallH, wallT], [0, wallH / 2, -depth + wallT / 2], { tint: shade(beige, 0.84) })
  b.box('roof', [half * 2, 0.14, depth], [0, wallH + 0.08, -depth / 2], { tint: '#8d8478' })
  b.box('plaster', [half * 2 + 0.08, 0.7, wallT + 0.06], [0, wallH + 0.35, -wallT / 2], { tint: shade(beige, 1.06) })

  // 一樓立面：騎樓柱、兩個玻璃入口
  for (const x of [-half + 0.25, -half / 3, half / 3, half - 0.25]) arcadeColumn(b, { x, z: wallT / 2 + 0.02, height: groundH, width: 0.42, mat: 'plaster', tint: beige })
  const gap = { minX: doorL.maxX, maxX: doorR.minX }
  b.box('plaster', [gap.maxX - gap.minX, groundH, wallT], [(gap.minX + gap.maxX) / 2, groundH / 2, -wallT / 2], { tint: cream })
  for (const door of [doorL, doorR]) {
    b.group([(door.minX + door.maxX) / 2, 0, 0], 0, () => {
      glassStorefront(b, { width: door.maxX - door.minX - 0.1, height: door.height, y0: 0, z: 0.02, frameTint: '#2a2826', frameMat: 'steel' })
    })
  }

  // 二、三樓：木框窗（左右各兩扇），米色牆面與窗間飾帶
  for (let floor = 1; floor <= 2; floor++) {
    const y = groundH + upperH * (floor - 1) + upperH / 2
    b.box('plaster', [half * 2 + 0.04, 0.1, wallT + 0.04], [0, y - upperH / 2 + 0.02, -wallT / 2], { tint: shade(beige, 0.92) })
    for (const x of [-half * 0.55, -half * 0.18, half * 0.18, half * 0.55]) {
      rectWindow(b, { x, y, width: 0.78, height: 1.3, z: wallT / 2 + 0.03, lit: floor === 1, frameTint: wood, frameMat: 'wood', style: 'bars', glassTint: '#8a9a9c' })
    }
  }

  // 紅底金字「十字軒糕餅舖」主招牌與金色「TEN CAKE SINCE 1930」
  const signY = groundH - 0.3
  b.box('dark', [gap.maxX - gap.minX + 0.3, 1.0, 0.05], [(gap.minX + gap.maxX) / 2, signY, 0.06], { tint: '#1b1918' })
  b.addSign({ text: '十字軒糕餅舖', style: 'red', width: gap.maxX - gap.minX, height: 0.52, position: [(gap.minX + gap.maxX) / 2, signY + 0.18, 0.1] })
  b.addSign({ text: 'TEN CAKE SINCE 1930', style: 'riceGold', width: gap.maxX - gap.minX - 0.3, height: 0.2, position: [(gap.minX + gap.maxX) / 2, signY - 0.28, 0.1] })

  // 騎樓下的機車
  scooter(b, -half + 1.2, 1.1, Math.PI, '#d6d9d9')
  scooter(b, -half + 2.1, 1.15, Math.PI, '#2f3236')
  planter(b, [half - 0.5, 0, 1.3], { seed: 68 })

  for (const x of [doorL.minX, 0, doorR.maxX]) {
    b.cylinder('dark', 0.01, 0.01, 0.25, 4, [x, groundH - 0.2, 1.1], { tint: '#1d1b1a' })
    b.add('bulb', new IcosahedronGeometry(0.05, 1), { position: [x, groundH - 0.4, 1.1], tint: '#ffe8c0' })
    b.addGlow(x, groundH - 0.4, 1.1, 0.75, '#ffd59a')
  }
  b.addPool(0, 0.8, 1.8, '#ffcf96')
  return { groundHeight: groundH, wallHeight: wallH }
}

/* ═══════════ 遮擋方塊、碰撞、主程式 ═══════════ */

function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

function registerBlockers(b, variant) {
  if (variant === 'earlyShop') {
    const { half, wallT, depth, door, partitionDoor, back } = EARLY
    b.addBlocker(-half, door.minX, 0, 2.9, -wallT, 0)
    b.addBlocker(door.maxX, half, 0, 2.9, -wallT, 0)
    b.addBlocker(door.minX, door.maxX, door.height, 2.9, -wallT, 0)
    for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, 5.0, -depth, 0)
    b.addBlocker(-half, half, 0, 5.0, -depth, back.minZ)
    b.addBlocker(-half, partitionDoor.minX, 0, 5.0, back.maxZ, back.maxZ + wallT)
    b.addBlocker(partitionDoor.maxX, half, 0, 5.0, back.maxZ, back.maxZ + wallT)
    b.addBlocker(partitionDoor.minX, partitionDoor.maxX, partitionDoor.height, 5.0, back.maxZ, back.maxZ + wallT)
    b.addBlocker(-half, half, 2.95, 7.0, -depth, 0)
    return
  }
  if (variant === 'postwarShop') {
    const { half, wallT, depth, door, back } = POSTWAR
    b.addBlocker(-half, door.minX, 0, 3.0, -wallT, 0)
    b.addBlocker(door.maxX, half, 0, 3.0, -wallT, 0)
    b.addBlocker(door.minX, door.maxX, door.height, 3.0, -wallT, 0)
    for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, 5.6, -depth, 0)
    b.addBlocker(-half, half, 0, 5.6, -depth, back.minZ - 0.4)
    b.addBlocker(-half, half, 3.05, 7.6, -depth, 0)
    return
  }
  const { half, wallT, depth, doorL, doorR } = MODERN
  b.addBlocker(-half, doorL.minX, 0, 3.1, -wallT, 0)
  b.addBlocker(doorL.maxX, doorR.minX, 0, 3.1, -wallT, 0)
  b.addBlocker(doorR.maxX, half, 0, 3.1, -wallT, 0)
  b.addBlocker(doorL.minX, doorL.maxX, doorL.height, 3.1, -wallT, 0)
  b.addBlocker(doorR.minX, doorR.maxX, doorR.height, 3.1, -wallT, 0)
  for (const s of [-1, 1]) b.addBlocker(s < 0 ? -half : half - wallT, s < 0 ? -half + wallT : half, 0, 8.6, -depth, 0)
  b.addBlocker(-half, half, 0, 8.6, -depth, -depth + wallT)
  b.addBlocker(-half, half, 3.15, 8.6, -depth, 0)
}

/** 家具的遮擋方塊（只給鏡頭用，由 buildWorld.js 的 cameraOnly 範圍標記） */
export function szxFurnitureBlockers(b, config) {
  const variant = config.variant
  if (variant === 'earlyShop') {
    const { counter, shelf, workbench } = EARLY
    for (const r of [counter, shelf, workbench]) b.addBlocker(r.minX, r.maxX, 0, r.height, r.minZ, r.maxZ)
  } else if (variant === 'postwarShop') {
    const { counter, shelf, cabinet } = POSTWAR
    for (const r of [counter, shelf, cabinet]) b.addBlocker(r.minX, r.maxX, 0, r.height, r.minZ, r.maxZ)
  } else {
    // pastryWall 是貼牆的薄裝飾（包裝糕餅牆），不另外登記遮擋方塊：鏡頭與人物都不會被它擋住
    const { checkout, caseL, caseR, historyNook } = MODERN
    for (const r of [checkout, caseL, caseR, historyNook]) b.addBlocker(r.minX, r.maxX, 0, r.height, r.minZ, r.maxZ)
  }
}

/** 可行走範圍與障礙物（世界座標） */
export function shizixuanCollision(config, transform) {
  const variant = config.variant
  const rect = (minX, maxX, minZ, maxZ, extra = {}) => ({ ...worldRect(transform, minX, maxX, minZ, maxZ), ...extra })
  const room = (minX, maxX, minZ, maxZ, extra = {}) => rect(minX, maxX, minZ, maxZ, { inBuilding: true, ...extra })
  const ob = (r, extra = {}) => rect(r.minX, r.maxX, r.minZ, r.maxZ, extra)
  if (variant === 'earlyShop') {
    const { half, wallT, door, partitionDoor, front, back, counter, shelf, workbench } = EARLY
    const inner = half - 0.2
    const walkable = [
      room(-inner, inner, 0.02, 1.75),
      room(door.minX + 0.02, door.maxX - 0.02, -wallT - 0.3, 0.3),
      room(front.minX + 0.02, front.maxX - 0.02, front.minZ + 0.02, front.maxZ - 0.02),
      room(partitionDoor.minX + 0.02, partitionDoor.maxX - 0.02, back.maxZ - 0.3, front.minZ + 0.3),
      room(back.minX + 0.02, back.maxX - 0.02, back.minZ + 0.02, back.maxZ - 0.02),
    ]
    const obstacles = [ob(counter), ob(shelf), ob(workbench)]
    return { walkable, obstacles }
  }
  if (variant === 'postwarShop') {
    const { half, wallT, door, front, back, counter, shelf, cabinet } = POSTWAR
    const inner = half - 0.2
    const walkable = [
      room(-inner, inner, 0.02, 1.75),
      room(door.minX + 0.02, door.maxX - 0.02, -wallT - 0.3, 0.3),
      room(front.minX + 0.02, front.maxX - 0.02, front.minZ + 0.02, front.maxZ - 0.02),
      room(back.minX + 0.02, back.maxX - 0.02, back.minZ + 0.02, front.maxZ - 0.4),
    ]
    const obstacles = [ob(counter), ob(shelf), ob(cabinet)]
    return { walkable, obstacles }
  }
  const { half, wallT, doorL, doorR, front, checkout, caseL, caseR, historyNook } = MODERN
  const inner = half - 0.2
  const walkable = [
    room(-inner, inner, 0.02, 1.75),
    room(doorL.minX + 0.02, doorL.maxX - 0.02, -wallT - 0.3, 0.3),
    room(doorR.minX + 0.02, doorR.maxX - 0.02, -wallT - 0.3, 0.3),
    room(front.minX + 0.02, front.maxX - 0.02, front.minZ + 0.02, front.maxZ - 0.02),
  ]
  // pastryWall 是貼牆的薄裝飾（包裝糕餅牆），不是落地家具，不擋路
  const obstacles = [ob(checkout), ob(caseL), ob(caseR), ob(historyNook)]
  return { walkable, obstacles }
}

/** 佔地範圍（世界座標）：範圍內不產生遠景房屋與遠景的樹 */
export function shizixuanFootprint(transform) {
  return worldRect(transform, -4.8, 4.8, -10.2, 0.2)
}

export function buildShizixuanExterior(b, config = {}, detail = b) {
  const variant = config.variant ?? 'modernShop'
  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const toWorld = (x, z) => {
    const p = b.transformPoint(x, 0, z)
    return { x: p.x, z: p.z }
  }
  const zone = (minX, maxX, minZ, maxZ, extra = {}) => {
    const p = toWorld(minX, minZ)
    const q = toWorld(maxX, maxZ)
    return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z), ...extra }
  }
  const room = (r) => zone(r.minX, r.maxX, r.minZ, r.maxZ)

  registerBlockers(b, variant)

  if (variant === 'earlyShop') {
    const shell = earlyShop(b)
    const { front, back } = EARLY
    return {
      ...shell,
      topHeight: shell.ridgeHeight,
      anchors: { prompt: local(0, shell.groundHeight - 0.2, 1.4), marker: local(0, shell.ridgeHeight + 1.2, -1.0) },
      interiors: [
        {
          id: SHIZIXUAN_ID,
          ...room(front),
          parts: [room(front), room(back)].map((p) => ({ ...p, level: 0 })),
          ceiling: shell.groundHeight,
          entry: { ...zone(EARLY.door.minX - 0.1, EARLY.door.maxX + 0.1, -EARLY.wallT, 1.2), level: 0 },
          entryHold: 0.5,
          entryRamp: 2.0,
          door: toWorld(0, 0),
          camera: { distance: 2.2, maxHeight: shell.groundHeight - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.35, minDistance: 0.6 },
          viewerStart: { distance: 2.0 },
          loadRadius: 12,
          showRadius: 20,
        },
      ],
      viewerRegions: [
        zone(-EARLY.half + 0.3, EARLY.half - 0.3, 0.15, 1.3, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.15 }),
        zone(front.minX + 0.3, front.maxX - 0.3, front.minZ + 0.3, front.maxZ - 0.2, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.2 }),
        zone(back.minX + 0.3, back.maxX - 0.3, back.minZ + 0.3, back.maxZ - 0.3, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.2 }),
      ],
    }
  }

  if (variant === 'postwarShop') {
    const shell = postwarShop(b)
    const { front, back } = POSTWAR
    const topHeight = shell.wallHeight + 0.9
    return {
      ...shell,
      topHeight,
      anchors: { prompt: local(0, shell.groundHeight - 0.2, 1.4), marker: local(0, topHeight + 1.4, -1.0) },
      interiors: [
        {
          id: SHIZIXUAN_ID,
          ...room(front),
          parts: [room(front), room(back)].map((p) => ({ ...p, level: 0 })),
          ceiling: shell.groundHeight,
          entry: { ...zone(POSTWAR.door.minX - 0.1, POSTWAR.door.maxX + 0.1, -POSTWAR.wallT, 1.2), level: 0 },
          entryHold: 0.5,
          entryRamp: 2.2,
          door: toWorld(0, 0),
          camera: { distance: 2.4, maxHeight: shell.groundHeight - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.4, minDistance: 0.6 },
          viewerStart: { distance: 2.2 },
          loadRadius: 13,
          showRadius: 22,
        },
      ],
      viewerRegions: [
        zone(-POSTWAR.half + 0.3, POSTWAR.half - 0.3, 0.15, 1.3, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.15 }),
        zone(front.minX + 0.35, front.maxX - 0.35, front.minZ + 0.35, front.maxZ - 0.2, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.3 }),
        zone(back.minX + 0.35, back.maxX - 0.35, back.minZ + 0.35, back.maxZ - 0.3, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.3 }),
      ],
    }
  }

  const shell = modernShop(b)
  const { front, doorL, doorR } = MODERN
  const topHeight = shell.wallHeight + 0.7
  return {
    ...shell,
    topHeight,
    anchors: { prompt: local(0, shell.groundHeight - 0.2, 1.4), marker: local(0, topHeight + 1.6, -1.0) },
    interiors: [
      {
        id: SHIZIXUAN_ID,
        ...room(front),
        ceiling: shell.groundHeight,
        entry: { ...zone(doorL.minX - 0.1, doorR.maxX + 0.1, -MODERN.wallT, 1.2), level: 0 },
        entryHold: 0.5,
        entryRamp: 2.4,
        door: toWorld(0, 0),
        camera: { distance: 2.6, maxHeight: shell.groundHeight - 0.4, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 },
        viewerStart: { distance: 2.4 },
        loadRadius: 14,
        showRadius: 24,
      },
    ],
    viewerRegions: [
      zone(-MODERN.half + 0.3, MODERN.half - 0.3, 0.15, 1.3, { maxY: 2.4, cameraMaxY: shell.groundHeight - 0.15 }),
      zone(front.minX + 0.35, front.maxX - 0.35, front.minZ + 0.35, front.maxZ - 0.3, { maxY: 2.4, cameraMaxY: shell.groundHeight - 0.3 }),
    ],
  }
}
