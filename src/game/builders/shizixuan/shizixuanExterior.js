import { IcosahedronGeometry, TorusGeometry } from 'three'
import { EARLY, MODERN, POSTWAR, SHIZIXUAN_ID } from '../../../data/shizixuanLayout.js'
import { planter, pottedPlant, shade } from '../props.js'
import { createShellParts, gableWall, insetWindow, openDoorLeaf, PARTY_INSET, sideWalls, slab, wallWithOpenings, windowBackdrop } from './shizixuanShell.js'

/**
 * 十字軒糕餅舖（延平北路二段68號；同一個店家 ID，依年代的 variant 替換外觀）
 *
 * - earlyShop（1930–1945）：窄身的閩南式街屋（紅磚、木構、雙坡瓦屋頂與兩側山牆），木框玻璃門窗，簡單的木製「十字軒」招牌。
 * - postwarShop（1945–1980）：兩個店面寬的土黃／米黃灰泥兩層樓、四面女兒牆的平屋頂與封閉的天窗，木窗、手繪橫式招牌。
 * - modernShop（2000–現在，依實拍照片）：三層樓、淡米黃小磁磚立面，樓上懸挑到騎樓外緣；兩個開間（中央一道柱）、
 *   木框格子窗與下段鐵窗花；左開間是紅色招牌盒上的金色徽章與「TEN CAKE／SINCE 1930」、右開間是金色圓框的
 *   「十字軒糕餅舖」；右側立面外的紅色直式招牌；平屋頂上的盆栽；騎樓停著機車。
 *
 * 三個年代都是完整的封閉殼體（shizixuanShell.js）：四面牆、每層樓板、屋頂（1930 加山牆、1945／2000 加四面女兒牆）、
 * 窗戶嵌在牆的開口裡、樓上的窗後是暗色室內背板；側牆往內退一點，不和隔壁街屋的山牆共面。沒有剖面（cutaway）模式。
 * 室內細部在 shizixuanInterior.js 按需載入；室內的燈火在這裡（室內只產生幾何）。
 *
 * 座標：建築本地座標（見 data/shizixuanLayout.js）：原點在一樓店面線中央地面，+z 朝街道，室內在 -z。
 */

/** 機車（停在騎樓下，車頭朝街）：車身、腳踏板、座墊、龍頭與後照鏡、前後輪 */
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

/** 牆上的壁燈：從牆面伸出的支架與燈泡（不懸空） */
function wallLamp(b, x, y, z, glow = 0.55) {
  b.box('dark', [0.05, 0.05, 0.32], [x, y, z + 0.16], { tint: '#1d1b1a' })
  b.cylinder('dark', 0.008, 0.008, 0.12, 4, [x, y - 0.06, z + 0.3], { tint: '#1d1b1a' })
  b.add('bulb', new IcosahedronGeometry(0.045, 1), { position: [x, y - 0.15, z + 0.3], tint: '#ffe8c0' })
  b.addGlow(x, y - 0.15, z + 0.3, glow, '#ffd59a')
}

/** 旋轉的方塊（例如斜屋頂）：畫出來並把外框（AABB）登記在 parts */
function slopedSlab(b, parts, key, mat, { width, length, thickness, center, angle, tint }) {
  b.box(mat, [width, thickness, length], center, { rotation: [angle, 0, 0], tint })
  const c = Math.cos(angle)
  const s = Math.abs(Math.sin(angle))
  const hy = (thickness * c + length * s) / 2
  const hz = (thickness * s + length * c) / 2
  parts[key].push({ minX: -width / 2, maxX: width / 2, minY: center[1] - hy, maxY: center[1] + hy, minZ: center[2] - hz, maxZ: center[2] + hz })
}

/* ═══════════ 1930–1945：十字軒（糕餅店初創） ═══════════ */

function earlyShop(b, parts) {
  const L = EARLY
  const { half, wallT, depth, door, partitionDoor, back } = L
  const groundH = 2.9
  const wallH = 4.8
  const rise = 1.1
  const ridge = wallH + rise
  const over = 0.4
  const brick = '#b06a4e'
  const wood = '#6e4a2f'

  // 側牆（party wall）與兩側的三角形山牆
  const { inner, outer } = sideWalls(b, parts, 'brick', { half, wallT, minY: 0, maxY: wallH, minZ: -depth, maxZ: 0, tint: shade(brick, 0.92) })
  for (const x0 of [-outer, inner]) gableWall(b, parts, 'gables', 'brick', { x0, t: wallT, y0: wallH, zFront: 0, zBack: -depth, zRidge: -depth / 2, yRidge: ridge, tint: shade(brick, 0.9) })
  // 正面：一樓（門與兩扇展示窗）、二樓（一扇窗）
  const win1 = [
    { minX: -1.9, maxX: -0.95, minY: 0.65, maxY: 1.95 },
    { minX: 0.95, maxX: 1.9, minY: 0.65, maxY: 1.95 },
  ]
  const win2 = { minX: -0.45, maxX: 0.45, minY: 3.25, maxY: 4.15 }
  wallWithOpenings(b, parts, 'front', 'brick', { minX: -inner, maxX: inner, minY: 0, maxY: groundH, minZ: -wallT, maxZ: 0, tint: shade(brick, 0.9), openings: [{ minX: door.minX, maxX: door.maxX, minY: 0, maxY: door.height }, ...win1] })
  wallWithOpenings(b, parts, 'front', 'brick', { minX: -inner, maxX: inner, minY: groundH, maxY: wallH, minZ: -wallT, maxZ: 0, tint: shade(brick, 0.88), openings: [win2] })
  wallWithOpenings(b, parts, 'back', 'brick', { minX: -inner, maxX: inner, minY: 0, maxY: wallH, minZ: -depth, maxZ: -depth + wallT, tint: shade(brick, 0.86) })
  // 前舖與後坊之間的隔牆（到二樓樓板）
  wallWithOpenings(b, parts, 'partitions', 'plaster', { minX: -inner, maxX: inner, minY: 0.03, maxY: groundH - 0.15, minZ: back.maxZ, maxZ: back.maxZ + wallT, tint: '#e6d8bc', openings: [{ minX: partitionDoor.minX, maxX: partitionDoor.maxX, minY: 0.03, maxY: partitionDoor.height }] })
  // 地板、二樓樓板
  slab(b, parts, 'floor', 'planks', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: 0.03, t: 0.03, tint: '#8a6a4a' })
  slab(b, parts, 'slabs', 'planks', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: groundH, t: 0.15, tint: '#6e5038' })
  windowBackdrop(b, parts, { minX: -inner, maxX: inner, minY: groundH, maxY: wallH, z: -wallT - 0.3 })
  // 雙坡屋頂：照 rise 與進深計算斜度，兩片在屋脊相接；屋簷只往前後伸出，寬度不超出地段
  const a = Math.atan2(rise, depth / 2)
  const t = 0.12
  const len = (depth / 2 + over) / Math.cos(a)
  const midY = (wallH - over * Math.tan(a) + ridge) / 2
  slopedSlab(b, parts, 'roof', 'roof', { width: outer * 2, length: len, thickness: t, angle: a, center: [0, midY + (Math.cos(a) * t) / 2, (over - depth / 2) / 2 + (Math.sin(a) * t) / 2], tint: '#7a8d7f' })
  slopedSlab(b, parts, 'roof', 'roof', { width: outer * 2, length: len, thickness: t, angle: -a, center: [0, midY + (Math.cos(a) * t) / 2, (-depth / 2 - depth - over) / 2 - (Math.sin(a) * t) / 2], tint: '#5f7266' })
  b.box('roof', [outer * 2 - 0.02, 0.1, 0.24], [0, ridge + 0.11, -depth / 2], { tint: '#56685c' })
  // 屋簷的封簷板（前、後）
  for (const [z, s] of [
    [over, 1],
    [-depth - over, -1],
  ]) b.box('wood', [outer * 2 - 0.04, 0.12, 0.05], [0, wallH - over * Math.tan(a) - 0.05, z - s * 0.02], { tint: '#4a3426' })

  // 門：木框與半開的玻璃門
  b.box('wood', [0.07, door.height, 0.1], [door.minX + 0.035, door.height / 2, -0.05], { tint: wood })
  b.box('wood', [0.07, door.height, 0.1], [door.maxX - 0.035, door.height / 2, -0.05], { tint: wood })
  openDoorLeaf(b, { hingeX: door.minX + 0.07, side: -1, width: door.maxX - door.minX - 0.16, height: door.height - 0.05, z: -wallT - 0.04, frame: wood, glass: '#8a9a9c' })
  for (const w of win1) insetWindow(b, { ...w, frontZ: 0, depth: wallT, frame: wood, glass: '#93a4a7', cols: 3, rows: 2 })
  insetWindow(b, { ...win2, frontZ: 0, depth: wallT, frame: wood, glass: '#8a9a9c', cols: 3, rows: 3 })
  // 簡單木製「十字軒」招牌，門楣上方
  b.box('wood', [1.1, 0.4, 0.05], [0, door.height + 0.34, 0.05], { tint: '#8a6440' })
  b.addSign({ text: '十字軒', style: 'wood', width: 0.96, height: 0.3, position: [0, door.height + 0.34, 0.08] })
  wallLamp(b, door.minX - 0.25, groundH - 0.25, 0)
  b.addPool(0, 0.7, 1.0, '#ffcf96')
  return { groundHeight: groundH, wallHeight: wallH, ridgeHeight: ridge + 0.16 }
}

/* ═══════════ 1945–1980：十字軒餅舖（戰後） ═══════════ */

function postwarShop(b, parts) {
  const L = POSTWAR
  const { half, wallT, depth, door, skylight } = L
  const groundH = 3.0
  const wallH = 5.5
  const top = wallH + 0.9
  const plaster = '#d9c79a'
  const wood = '#5c4330'

  const { inner } = sideWalls(b, parts, 'plaster', { half, wallT, minY: 0, maxY: top, minZ: -depth, maxZ: 0, tint: shade(plaster, 0.85), grime: 0.15 })
  const win1 = [
    { minX: -3.6, maxX: -2.0, minY: 0.75, maxY: 2.25 },
    { minX: 2.0, maxX: 3.6, minY: 0.75, maxY: 2.25 },
  ]
  const win2 = [-2.3, 0, 2.3].map((x) => ({ minX: x - 0.5, maxX: x + 0.5, minY: 3.45, maxY: 4.45 }))
  wallWithOpenings(b, parts, 'front', 'plaster', { minX: -inner, maxX: inner, minY: 0, maxY: groundH, minZ: -wallT, maxZ: 0, tint: plaster, grime: 0.22, openings: [{ minX: door.minX, maxX: door.maxX, minY: 0, maxY: door.height }, ...win1] })
  wallWithOpenings(b, parts, 'front', 'plaster', { minX: -inner, maxX: inner, minY: groundH, maxY: wallH, minZ: -wallT, maxZ: 0, tint: shade(plaster, 1.04), grime: 0.18, openings: win2 })
  wallWithOpenings(b, parts, 'front', 'plaster', { minX: -inner, maxX: inner, minY: wallH, maxY: top, minZ: -wallT, maxZ: 0, tint: shade(plaster, 1.08) })
  wallWithOpenings(b, parts, 'back', 'plaster', { minX: -inner, maxX: inner, minY: 0, maxY: top, minZ: -depth, maxZ: -depth + wallT, tint: shade(plaster, 0.8), grime: 0.2 })
  slab(b, parts, 'floor', 'stone', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: 0.03, t: 0.03, tint: '#a39d92' })
  slab(b, parts, 'slabs', 'plaster', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: groundH, t: 0.15, tint: '#cfc6b4' })
  // 平屋頂：四面都有女兒牆（側牆、後牆、正面都蓋到 top），屋頂板在 wallH
  slab(b, parts, 'roof', 'stone', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: wallH, t: 0.15, tint: '#9a958c' })
  windowBackdrop(b, parts, { minX: -inner, maxX: inner, minY: groundH, maxY: wallH - 0.15, z: -wallT - 0.3 })
  // 屋頂上封閉的天窗（玻璃頂＋四邊矮牆），暗示下方的工坊
  b.box('plaster', [skylight.maxX - skylight.minX, 0.25, skylight.maxZ - skylight.minZ], [(skylight.minX + skylight.maxX) / 2, wallH + 0.125, (skylight.minZ + skylight.maxZ) / 2], { tint: shade(plaster, 0.9) })
  b.box('glass', [skylight.maxX - skylight.minX - 0.1, 0.02, skylight.maxZ - skylight.minZ - 0.1], [(skylight.minX + skylight.maxX) / 2, wallH + 0.26, (skylight.minZ + skylight.maxZ) / 2], { tint: '#9fb1b4' })
  // 腰帶與女兒牆壓頂（貼在牆前，背面與牆面相接）
  b.box('brick', [inner * 2, 0.12, 0.06], [0, groundH - 0.04, 0.03], { tint: shade(plaster, 0.8) })
  b.box('plaster', [inner * 2, 0.06, wallT + 0.06], [0, top + 0.03, -wallT / 2 + 0.03], { tint: shade(plaster, 1.1) })

  // 門與窗
  for (const s of [-1, 1]) b.box('wood', [0.07, door.height, 0.08], [s * (door.maxX - 0.035), door.height / 2, -0.06], { tint: wood })
  for (const s of [-1, 1]) openDoorLeaf(b, { hingeX: s * (door.maxX - 0.07), side: s, width: door.maxX - 0.1, height: door.height - 0.05, z: -wallT - 0.04, frame: wood, glass: '#8a9a9c' })
  b.box('wood', [door.maxX - door.minX + 0.12, 0.08, 0.17], [0, 0.04, 0.085], { tint: shade(wood, 0.85) })
  for (const w of win1) insetWindow(b, { ...w, frontZ: 0, depth: wallT, frame: wood, glass: '#93a4a7', cols: 3, rows: 2 })
  for (const w of win2) insetWindow(b, { ...w, frontZ: 0, depth: wallT, frame: wood, glass: '#8a9a9c', cols: 2, rows: 2 })
  // 傳統橫式招牌（戰後手繪字），在腰帶前方
  b.box('wood', [2.0, 0.38, 0.05], [0, 2.75, 0.09], { tint: '#d9cdb0' })
  b.addSign({ text: '十字軒餅舖', style: 'painted', width: 1.8, height: 0.3, position: [0, 2.75, 0.125] })
  // 戰後的電線（離牆面）
  b.box('dark', [inner * 2 + 0.4, 0.012, 0.012], [0, wallH + 0.2, 0.25], { tint: '#1f1d1c' })
  for (const x of [-half + 0.9, half - 0.9]) wallLamp(b, x, groundH - 0.3, 0, 0.6)
  b.addPool(0, 0.7, 1.5, '#ffcf96')
  return { groundHeight: groundH, wallHeight: wallH, topHeight: top }
}

/* ═══════════ 2000–現在：十字軒糕餅舖（依實拍照片） ═══════════ */

const TILE = '#ead9ab'
const FRAME = '#9a6a3a'
const RED = '#c3242b'

/** 左右兩個開間的窗戶位置（照片：左開間三扇等寬；右開間窄、寬、窄） */
export function modernWindows() {
  const left = [
    [-3.758, -2.978],
    [-2.605, -1.825],
    [-1.453, -0.673],
  ]
  const right = [
    [0.635, 1.255],
    [1.59, 2.84],
    [3.175, 3.795],
  ]
  return [...left, ...right]
}

function modernShop(b, parts) {
  const L = MODERN
  const { half, wallT, depth, arcade: A, groundH, upperH, parapet, arcadeCeiling, door, sideLight, showWindow } = L
  const roofY = groundH + upperH * (L.floors - 1)
  const top = roofY + parapet
  const faceZ = A // 樓上立面的外表面
  const backZ = A - wallT

  // 側牆（含騎樓兩端的端牆）一路蓋到女兒牆頂
  const { inner } = sideWalls(b, parts, 'plaster', { half, wallT, minY: 0, maxY: top, minZ: -depth, maxZ: faceZ, tint: '#d8c9a2' })
  // 樓上立面（小磁磚）：招牌帶、二樓、三樓、女兒牆，窗戶嵌在開口裡
  const floorsY = [groundH, groundH + upperH]
  const windows = modernWindows()
  wallWithOpenings(b, parts, 'front', 'creamTile', { minX: -inner, maxX: inner, minY: arcadeCeiling, maxY: groundH, minZ: backZ, maxZ: faceZ, tint: TILE })
  for (const [i, y0] of floorsY.entries()) {
    const openings = windows.map(([x0, x1]) => ({ minX: x0, maxX: x1, minY: y0 + 0.45, maxY: y0 + 2.55 }))
    wallWithOpenings(b, parts, 'front', 'creamTile', { minX: -inner, maxX: inner, minY: y0, maxY: y0 + upperH, minZ: backZ, maxZ: faceZ, tint: i ? shade(TILE, 1.02) : TILE, openings })
    for (const [j, [x0, x1]] of windows.entries()) {
      insetWindow(b, { minX: x0, maxX: x1, minY: y0 + 0.45, maxY: y0 + 2.55, frontZ: faceZ, depth: wallT, frame: FRAME, glass: '#a9bcc0', cols: x1 - x0 > 1 ? 4 : 2, rows: 4, lit: (i + j) % 3 === 1, grille: 0.32 })
    }
    windowBackdrop(b, parts, { minX: -inner, maxX: inner, minY: y0, maxY: y0 + upperH - 0.15, z: backZ - 0.35 })
  }
  wallWithOpenings(b, parts, 'front', 'creamTile', { minX: -inner, maxX: inner, minY: roofY, maxY: top, minZ: backZ, maxZ: faceZ, tint: shade(TILE, 1.04) })
  wallWithOpenings(b, parts, 'back', 'plaster', { minX: -inner, maxX: inner, minY: 0, maxY: top, minZ: -depth, maxZ: -depth + wallT, tint: '#d2c39c' })
  // 一樓店面（退在 z = 0）：左開間展示窗、右開間入口與側窗
  wallWithOpenings(b, parts, 'front', 'wood', {
    minX: -inner,
    maxX: inner,
    minY: 0,
    maxY: groundH - 0.15,
    minZ: -wallT,
    maxZ: 0,
    tint: '#4a3426',
    openings: [showWindow, { minX: door.minX, maxX: door.maxX, minY: 0, maxY: door.height }, sideLight],
  })
  // 樓板、屋頂、地板、騎樓天花
  slab(b, parts, 'floor', 'glossTile', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: -wallT, y: 0.03, t: 0.03, tint: '#3a3a3c' })
  slab(b, parts, 'floor', 'stone', { minX: -inner, maxX: inner, minZ: 0, maxZ: faceZ, y: 0.03, t: 0.03, tint: '#c9c3b6' })
  for (const y of floorsY) slab(b, parts, 'slabs', 'plaster', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: backZ, y, t: 0.15, tint: '#d9d3c6' })
  slab(b, parts, 'roof', 'stone', { minX: -inner, maxX: inner, minZ: -depth + wallT, maxZ: backZ, y: roofY, t: 0.15, tint: '#a29d93' })
  slab(b, parts, 'slabs', 'plaster', { minX: -inner, maxX: inner, minZ: 0, maxZ: backZ, y: arcadeCeiling + 0.15, t: 0.15, tint: '#f1ede4' })
  // 騎樓的三道柱（左右端柱、中央柱）與樓上立面的壁柱（略凸出 3 cm）
  const piers = [
    [-inner, -inner + L.endPier],
    [-L.pier / 2, L.pier / 2],
    [inner - L.endPier, inner],
  ]
  for (const [x0, x1] of piers) {
    b.box('creamTile', [x1 - x0, arcadeCeiling - 0.03, 0.48], [(x0 + x1) / 2, (arcadeCeiling + 0.03) / 2, faceZ - 0.21], { tint: shade(TILE, 0.97) })
    parts.piers.push({ minX: x0, maxX: x1, minY: 0.03, maxY: arcadeCeiling, minZ: faceZ - 0.45, maxZ: faceZ + 0.03 })
    b.box('creamTile', [x1 - x0, top - arcadeCeiling, 0.03], [(x0 + x1) / 2, (arcadeCeiling + top) / 2, faceZ + 0.015], { tint: shade(TILE, 0.95) })
  }
  // 女兒牆壓頂（貼在牆頂）
  b.box('plaster', [inner * 2, 0.06, wallT + 0.04], [0, top + 0.03, faceZ - wallT / 2 + 0.02], { tint: '#cbbd98' })

  // 一樓：展示窗（木色直框、明亮的商品）、入口玻璃門、側窗
  const glassPane = (o, z, cols) => {
    const w = o.maxX - o.minX
    const h = o.maxY - o.minY
    b.box('glassClear', [w - 0.06, h - 0.06, 0.012], [(o.minX + o.maxX) / 2, (o.minY + o.maxY) / 2, z], { tint: '#ffffff' })
    for (let i = 1; i < cols; i++) b.box('wood', [0.05, h - 0.12, 0.08], [o.minX + (w * i) / cols, (o.minY + o.maxY) / 2, z + 0.01], { tint: '#6b4a30' })
    b.box('wood', [w, 0.06, 0.1], [(o.minX + o.maxX) / 2, o.minY + 0.03, z + 0.01], { tint: '#6b4a30' })
    b.box('wood', [w, 0.06, 0.1], [(o.minX + o.maxX) / 2, o.maxY - 0.03, z + 0.01], { tint: '#6b4a30' })
  }
  glassPane(showWindow, -0.1, 4)
  glassPane(sideLight, -0.1, 2)
  // 入口：兩扇往內推開的玻璃門（門洞暢通）與上方的木框
  const half2 = (door.maxX - door.minX) / 2
  for (const [hx, s] of [
    [door.minX + 0.04, -1],
    [door.maxX - 0.04, 1],
  ]) openDoorLeaf(b, { hingeX: hx, side: s, width: half2 - 0.06, height: door.height - 0.06, z: -wallT - 0.04 })
  b.box('wood', [door.maxX - door.minX, 0.08, 0.1], [(door.minX + door.maxX) / 2, door.height - 0.04, -0.09], { tint: '#6b4a30' })
  b.box('plain', [0.6, 0.012, 0.06], [-1.7, 0.45, 0.035], { tint: '#3a2a20' })

  // 招牌盒：黑色邊框、紅色面板（有厚度，往外凸），文字與徽章貼在面板前方
  const signBox = (x0, x1) => {
    b.box('dark', [x1 - x0, groundH - arcadeCeiling - 0.06, 0.26], [(x0 + x1) / 2, (arcadeCeiling + groundH) / 2, faceZ + 0.13], { tint: '#1b1918' })
    b.box('plain', [x1 - x0 - 0.08, groundH - arcadeCeiling - 0.14, 0.02], [(x0 + x1) / 2, (arcadeCeiling + groundH) / 2, faceZ + 0.27], { tint: RED })
  }
  const leftX = [-inner + L.endPier + 0.04, -L.pier / 2 - 0.04]
  const rightX = [L.pier / 2 + 0.04, inner - L.endPier - 0.04]
  signBox(...leftX)
  signBox(...rightX)
  const signZ = faceZ + 0.29
  const signMid = (arcadeCeiling + groundH) / 2
  const lc = (leftX[0] + leftX[1]) / 2
  const rc = (rightX[0] + rightX[1]) / 2
  b.addSign({ text: '十', style: 'szxBadge', width: 0.5, height: 0.5, position: [lc, signMid + 0.12, signZ] })
  b.addSign({ text: 'TEN CAKE', style: 'szxSmall', width: 0.72, height: 0.1, position: [lc, signMid - 0.2, signZ] })
  b.addSign({ text: 'SINCE 1930', style: 'szxSmall', width: 0.62, height: 0.07, position: [lc, signMid - 0.3, signZ] })
  b.addSign({ text: '十字軒糕餅舖', style: 'szxCircle', width: 2.9, height: 0.5, position: [rc, signMid + 0.08, signZ] })
  b.addSign({ text: 'SHI ZI XUAN CAKE & PASTRY', style: 'szxSmall', width: 1.7, height: 0.08, position: [rc + 0.5, signMid - 0.27, signZ] })
  // 右側立面外的紅色直式招牌（垂直於立面、兩面都有字），支架固定在端柱上
  const vx = inner - 0.21
  const vz0 = faceZ + 0.18
  const vz1 = faceZ + 0.88
  const vy0 = groundH + 0.3
  const vy1 = groundH + 5.0
  b.box('dark', [0.14, vy1 - vy0, vz1 - vz0], [vx, (vy0 + vy1) / 2, (vz0 + vz1) / 2], { tint: '#1b1918' })
  for (const s of [-1, 1]) b.box('plain', [0.012, vy1 - vy0 - 0.08, vz1 - vz0 - 0.08], [vx + s * 0.076, (vy0 + vy1) / 2, (vz0 + vz1) / 2], { tint: RED })
  for (const y of [vy0 + 0.4, vy1 - 0.4]) b.box('steel', [0.06, 0.06, 0.15], [vx, y, faceZ + 0.105], { tint: '#3a3634' })
  for (const s of [-1, 1]) {
    const rot = s * Math.PI / 2
    b.addSign({ text: '十', style: 'szxBadge', width: 0.5, height: 0.5, position: [vx + s * 0.09, vy1 - 0.55, (vz0 + vz1) / 2], rotationY: rot })
    b.addSign({ text: '十字軒', style: 'szxCircle', vertical: true, width: 0.58, height: 2.6, position: [vx + s * 0.09, vy0 + 2.1, (vz0 + vz1) / 2], rotationY: rot })
  }

  // 平屋頂上的盆栽與綠籬（照片：屋頂的樹）
  pottedPlant(b, [-3.2, roofY, -2.0], { seed: 61, size: 1.6 })
  pottedPlant(b, [-1.6, roofY, -1.6], { seed: 62, size: 1.3 })
  pottedPlant(b, [2.4, roofY, -2.3], { seed: 63, size: 1.8 })
  planter(b, [0.6, roofY, -1.2], { seed: 64 })
  b.box('plaster', [7.6, 0.5, 0.7], [0, roofY + 0.25, -3.2], { tint: '#8a8478' })
  for (let i = 0; i < 10; i++) b.add('plain', new IcosahedronGeometry(0.38, 1), { position: [-3.4 + i * 0.75, roofY + 0.72 + (i % 2) * 0.12, -3.2], scale: [1.15, 1, 1], tint: i % 2 ? '#5f7f45' : '#6f8f52' })

  // 騎樓下的機車（左開間，車頭朝街）與中央柱前的電箱
  scooter(b, -3.45, 0.78, 0, '#d6d9d9')
  scooter(b, -2.6, 0.82, 0, '#2f6f8f')
  scooter(b, -1.75, 0.78, 0, '#2f3236')
  b.box('plain', [0.5, 1.15, 0.36], [0, 0.6, faceZ + 0.21], { tint: '#8d918f' })
  for (let i = 0; i < 4; i++) b.box('plain', [0.52, 0.06, 0.01], [0, 0.08 + i * 0.12, faceZ + 0.395], { tint: i % 2 ? '#1d1d1d' : '#e8c22a' })

  // 騎樓天花的嵌燈
  for (const x of [-3.0, -1.5, 1.5, 3.0]) {
    b.add('plain', new TorusGeometry(0.07, 0.015, 6, 14), { position: [x, arcadeCeiling - 0.012, 0.8], rotation: [Math.PI / 2, 0, 0], tint: '#f2f0ea' })
    b.addGlow(x, arcadeCeiling - 0.05, 0.8, 0.6, '#fff0d0')
  }
  b.addPool(1.5, 0.8, 1.6, '#fff0d0')
  return { groundHeight: groundH, wallHeight: roofY, topHeight: top }
}

/* ═══════════ 室內的燈火（室內細部只產生幾何，燈火放在街景資料裡） ═══════════ */

function interiorLights(b, variant) {
  if (variant === 'earlyShop') {
    for (const z of [-1.4, -6.4]) b.addGlow(0.2, 2.45, z, 0.7, '#ffc77f')
    return
  }
  if (variant === 'postwarShop') {
    for (const [x, z] of [
      [-2, -2],
      [2, -2],
      [0, -7.5],
    ]) b.addGlow(x, 2.55, z, 0.75, '#ffd08a')
    return
  }
  // 2000：明亮的暖色零售照明（嵌燈、凹槽的間接照明、層架燈帶）
  const ceil = MODERN.ceiling
  for (const x of [-3, -1, 1, 3]) for (const z of [-1.6, -3.6, -5.6, -7.6]) b.addGlow(x, ceil - 0.08, z, 0.75, '#fff1d8')
  for (const z of [-3.2, -4.0, -4.8]) b.addGlow(0.5, ceil + 0.08, z, 0.9, '#ffe6b8')
  for (const z of [-2.5, -4.5, -6.5]) b.addGlow(3.6, 1.6, z, 0.6, '#fff1d8')
  for (const x of [-1.0, 0.6, 2.2, 3.6]) b.addGlow(x, 1.7, -9.0, 0.6, '#fff1d8')
  for (const x of [-3.6, -2.7, -1.8, -0.9]) b.addGlow(x, 1.9, -0.7, 0.55, '#ffe2a8')
  b.addPool(0.5, -4.0, 3.2, '#fff1d8', 0.05)
  b.addPool(0, -7.5, 2.6, '#fff1d8', 0.05)
}

/* ═══════════ 遮擋方塊、碰撞、主程式 ═══════════ */

function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/** 殼體的每一個零件就是一個遮擋方塊（同時用於角色碰撞之外的鏡頭遮擋與點選範圍） */
function blockersFromParts(b, parts) {
  for (const key of ['front', 'back', 'left', 'right', 'roof', 'slabs', 'gables', 'partitions', 'backdrops', 'piers']) {
    for (const r of parts[key] ?? []) b.addBlocker(r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ)
  }
}

const MODERN_FURNITURE = ['windowCounter', 'island', 'rightShelf', 'counter', 'glassCase', 'certShelf', 'productWall', 'ritualStand']

/** 家具的遮擋方塊（只給鏡頭用，由 buildWorld.js 的 cameraOnly 範圍標記） */
export function szxFurnitureBlockers(b, config) {
  const variant = config.variant
  const list =
    variant === 'earlyShop'
      ? [EARLY.counter, EARLY.shelf, EARLY.workbench]
      : variant === 'postwarShop'
        ? [POSTWAR.counter, POSTWAR.shelf, POSTWAR.cabinet]
        : MODERN_FURNITURE.map((key) => MODERN[key])
  for (const r of list) b.addBlocker(r.minX, r.maxX, 0, r.height, r.minZ, r.maxZ)
}

/** 2000 騎樓下的障礙物：三道柱、三台機車、電箱 */
export function modernArcadeObstacles() {
  const inner = MODERN.half - PARTY_INSET - MODERN.wallT
  const faceZ = MODERN.arcade
  return [
    { minX: -inner, maxX: -inner + MODERN.endPier, minZ: faceZ - 0.45, maxZ: faceZ + 0.03 },
    { minX: -MODERN.pier / 2, maxX: MODERN.pier / 2, minZ: faceZ - 0.45, maxZ: faceZ + 0.03 },
    { minX: inner - MODERN.endPier, maxX: inner, minZ: faceZ - 0.45, maxZ: faceZ + 0.03 },
    ...[-3.45, -2.6, -1.75].map((x) => ({ minX: x - 0.22, maxX: x + 0.22, minZ: 0.02, maxZ: 1.5 })),
    { minX: -0.27, maxX: 0.27, minZ: faceZ + 0.02, maxZ: faceZ + 0.4 },
  ]
}

/** 打開的門扇在室內地面上的範圍（和 openDoorLeaf 的位置一致） */
export function doorLeafObstacles(variant) {
  const leaf = (hingeX, side, width) => {
    const z = -0.24
    const zEnd = z - Math.sin(1.45) * width
    const xEnd = hingeX + side * -1 * Math.cos(1.45) * width
    return { minX: Math.min(hingeX, xEnd) - 0.06, maxX: Math.max(hingeX, xEnd) + 0.06, minZ: zEnd - 0.06, maxZ: z + 0.02 }
  }
  if (variant === 'earlyShop') return [leaf(EARLY.door.minX + 0.07, -1, EARLY.door.maxX - EARLY.door.minX - 0.16)]
  if (variant === 'postwarShop') return [-1, 1].map((s) => leaf(s * (POSTWAR.door.maxX - 0.07), s, POSTWAR.door.maxX - 0.1))
  const { door } = MODERN
  const w = (door.maxX - door.minX) / 2 - 0.06
  return [leaf(door.minX + 0.04, -1, w), leaf(door.maxX - 0.04, 1, w)]
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
    return { walkable, obstacles: [ob(counter), ob(shelf), ob(workbench), ...doorLeafObstacles('earlyShop').map((r) => ob(r))] }
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
    return { walkable, obstacles: [ob(counter), ob(shelf), ob(cabinet), ...doorLeafObstacles('postwarShop').map((r) => ob(r))] }
  }
  const { wallT, door, front } = MODERN
  const inner = MODERN.half - PARTY_INSET - wallT
  const walkable = [
    room(-inner + 0.02, inner - 0.02, 0.02, 1.75),
    room(door.minX + 0.02, door.maxX - 0.02, -wallT - 0.3, 0.3),
    room(front.minX + 0.02, front.maxX - 0.02, front.minZ + 0.02, front.maxZ - 0.02),
  ]
  const obstacles = [...MODERN_FURNITURE.map((key) => ob(MODERN[key])), ...modernArcadeObstacles().map((r) => ob(r)), ...doorLeafObstacles('modernShop').map((r) => ob(r))]
  return { walkable, obstacles }
}

/** 佔地範圍（世界座標）：範圍內不產生遠景房屋與遠景的樹 */
export function shizixuanFootprint(transform) {
  return worldRect(transform, -4.8, 4.8, -10.2, 0.2)
}

export function buildShizixuanExterior(b, config = {}) {
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
  const parts = createShellParts()

  let shell
  let interior
  let viewerRegions
  if (variant === 'earlyShop') {
    shell = earlyShop(b, parts)
    const { front, back, door } = EARLY
    interior = { ...room(front), parts: [room(front), room(back)].map((p) => ({ ...p, level: 0 })), ceiling: shell.groundHeight - 0.15, entry: { ...zone(door.minX - 0.1, door.maxX + 0.1, -EARLY.wallT, 1.2), level: 0 }, entryRamp: 2.0, camera: { distance: 2.2, maxHeight: shell.groundHeight - 0.5, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.35, minDistance: 0.6 }, viewerStart: { distance: 2.0 }, loadRadius: 12, showRadius: 20 }
    viewerRegions = [
      zone(-EARLY.half + 0.3, EARLY.half - 0.3, 0.15, 1.3, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.15 }),
      zone(front.minX + 0.3, front.maxX - 0.3, front.minZ + 0.3, front.maxZ - 0.2, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.35 }),
      zone(back.minX + 0.3, back.maxX - 0.3, back.minZ + 0.3, back.maxZ - 0.3, { maxY: 2.2, cameraMaxY: shell.groundHeight - 0.35 }),
    ]
  } else if (variant === 'postwarShop') {
    shell = postwarShop(b, parts)
    const { front, back, door } = POSTWAR
    interior = { ...room(front), parts: [room(front), room(back)].map((p) => ({ ...p, level: 0 })), ceiling: shell.groundHeight - 0.15, entry: { ...zone(door.minX - 0.1, door.maxX + 0.1, -POSTWAR.wallT, 1.2), level: 0 }, entryRamp: 2.2, camera: { distance: 2.4, maxHeight: shell.groundHeight - 0.5, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.4, minDistance: 0.6 }, viewerStart: { distance: 2.2 }, loadRadius: 13, showRadius: 22 }
    viewerRegions = [
      zone(-POSTWAR.half + 0.3, POSTWAR.half - 0.3, 0.15, 1.3, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.15 }),
      zone(front.minX + 0.35, front.maxX - 0.35, front.minZ + 0.35, front.maxZ - 0.2, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.4 }),
      zone(back.minX + 0.35, back.maxX - 0.35, back.minZ + 0.35, back.maxZ - 0.3, { maxY: 2.3, cameraMaxY: shell.groundHeight - 0.4 }),
    ]
  } else {
    shell = modernShop(b, parts)
    const { front, door, ceiling, arcadeCeiling } = MODERN
    interior = { ...room(front), ceiling, entry: { ...zone(door.minX - 0.1, door.maxX + 0.1, -MODERN.wallT, 1.2), level: 0 }, entryRamp: 2.4, camera: { distance: 2.6, maxHeight: ceiling - 0.35, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.45, minDistance: 0.7 }, viewerStart: { distance: 2.4 }, loadRadius: 14, showRadius: 24 }
    viewerRegions = [
      zone(-MODERN.half + 0.5, MODERN.half - 0.5, 0.15, 1.2, { maxY: 2.2, cameraMaxY: arcadeCeiling - 0.15 }),
      zone(front.minX + 0.35, front.maxX - 0.35, front.minZ + 0.35, front.maxZ - 0.3, { maxY: 2.4, cameraMaxY: ceiling - 0.3 }),
    ]
  }
  interiorLights(b, variant)
  blockersFromParts(b, parts)
  const topHeight = shell.topHeight ?? shell.ridgeHeight
  return {
    ...shell,
    topHeight,
    shellParts: parts,
    anchors: { prompt: local(variant === 'modernShop' ? 1.8 : 0, Math.min(shell.groundHeight, 2.9) - 0.2, 1.4), marker: local(0, topHeight + 1.4, -1.0) },
    interiors: [{ id: SHIZIXUAN_ID, ...interior, entryHold: 0.5, door: toWorld(variant === 'modernShop' ? (MODERN.door.minX + MODERN.door.maxX) / 2 : 0, 0) }],
    viewerRegions,
  }
}
