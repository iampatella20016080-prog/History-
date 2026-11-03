import { Shape, SphereGeometry, TorusGeometry } from 'three'
import { ROOF_GARDEN } from '../../data/jiangShanLouLayout.js'
import { STREET } from '../config.js'
import { createRng } from '../utils/random.js'
import { archWindow, balcony, cornice, projectingSign, rectWindow, signBoard } from './facade.js'
import { pottedPlant, shade } from './props.js'
import { catenaryPoints, wire } from './wires.js'

/**
 * 江山樓（歷史情境重建）
 *
 * 史料記載江山樓為「四層樓紅磚建築」（見 sources.js 的典藏與條目說明）。建築今已不存，
 * 以下的立面細節依同時期大稻埕紅磚洋樓的常見作法推想，並非精確復原：
 *
 * - 一樓：五開間的騎樓拱廊，中央開間最寬（弧拱），入口再向內退縮，有三級台階、
 *   一對門柱與敞開的大門，門內透出宴席的燈光、圓桌與屏風
 * - 二樓：拱形落地窗與通長的瓶形欄杆陽臺，陽臺上方掛一串宴席燈泡
 * - 三樓：方窗配三角與弧形窗楣，中央開間有小陽臺
 * - 四樓：較小的圓拱窗，中央為三連拱窗
 * - 屋頂：平屋頂，女兒牆中央升起弧形山頭並嵌「江山樓」匾額；不加宮殿式屋頂
 *
 * 本地座標同騎樓街屋：一樓店面位於 z = 0，樓上立面位於 z = 步道深度，街道在 +z。
 */
const GROUND_H = 4.5
const UPPER_H = 3.6
const FLOORS = 4

const BRICK = '#ffffff' // 紅磚貼圖原色
const PIER_BRICK = '#f1ddd4' // 壁柱略淺，與牆面分出層次
const TRIM = '#f1e7d4' // 洗石子／灰泥飾帶
const GRANITE = '#cdc5b4'
const LACQUER = '#5b2c22'
const WARM_ROOM = '#8a5a3e'
const TWILIGHT_GLASS = '#4a5270' // 沒點燈的玻璃映著暮色天空（冷色，和室內暖光形成對比）

/** 門窗開間（以寬 11 公尺設計，其他寬度等比例縮放） */
const PIER_X = [-5.15, -3.3, -1.5, 1.5, 3.3, 5.15]
const BAY_X = [-4.2, -2.4, 0, 2.4, 4.2]

/* ── 形狀 ─────────────────────────────────── */

/**
 * 拱的參數：中心 cx、半寬 hw、起拱高度 spring、拱高 rise（rise = hw 時為半圓拱）。
 * 回傳圓心高度、半徑與起拱角。
 */
function archGeometry(cx, hw, spring, rise) {
  const radius = (hw * hw + rise * rise) / (2 * rise)
  const cy = spring + rise - radius
  const start = Math.atan2(spring - cy, hw)
  return { cx, hw, spring, rise, radius, cy, start }
}

/** 拱上方到 top 之間的牆（拱肩） */
function spandrelShape(a, top) {
  const shape = new Shape()
  shape.moveTo(a.cx - a.hw, a.spring)
  shape.absarc(a.cx, a.cy, a.radius, Math.PI - a.start, a.start, true)
  shape.lineTo(a.cx + a.hw, top)
  shape.lineTo(a.cx - a.hw, top)
  shape.closePath()
  return shape
}

/** 拱緣的飾帶（沿著拱的一圈灰泥框） */
function archivoltShape(a, band) {
  const shape = new Shape()
  shape.moveTo(a.cx - a.hw, a.spring)
  shape.absarc(a.cx, a.cy, a.radius, Math.PI - a.start, a.start, true)
  shape.lineTo(a.cx + a.hw + band, a.spring)
  shape.absarc(a.cx, a.cy, a.radius + band, a.start, Math.PI - a.start, false)
  shape.closePath()
  return shape
}

/** 女兒牆中央的弧形山頭（寬 width，兩側高 shoulder，中央最高 peak） */
function pedimentCurve(width, shoulder, peak) {
  const half = width / 2
  // 二次曲線頂點高度 = shoulder + (control - shoulder) / 2
  const control = shoulder + (peak - shoulder) * 2
  return { half, shoulder, peak, control }
}

function pedimentShape(c, grow = 0) {
  const shape = new Shape()
  shape.moveTo(-c.half - grow, 0)
  shape.lineTo(c.half + grow, 0)
  shape.lineTo(c.half + grow, c.shoulder + grow)
  shape.quadraticCurveTo(0, c.control + grow * 2, -c.half - grow, c.shoulder + grow)
  shape.closePath()
  return shape
}

function pedimentPoint(c, t) {
  // t: 0 左肩 → 1 右肩
  const x = -c.half + 2 * c.half * t
  const y = (1 - t) * (1 - t) * c.shoulder + 2 * (1 - t) * t * c.control + t * t * c.shoulder
  return [x, y]
}

/** 窗楣：三角或弧形 */
function windowPediment(b, { x, y, width, z, kind }) {
  const shape = new Shape()
  const half = width / 2
  shape.moveTo(-half, 0)
  shape.lineTo(half, 0)
  if (kind === 'triangle') shape.lineTo(0, 0.42)
  else shape.quadraticCurveTo(0, 0.7, -half, 0)
  shape.closePath()
  b.extrude('stucco', shape, 0.14, { position: [x, y + 0.08, z], tint: TRIM })
  b.box('stucco', [width + 0.08, 0.1, 0.2], [x, y + 0.04, z + 0.08], { tint: shade(TRIM, 0.95) })
}

/* ═══════════ 主體 ═══════════ */

export function buildJiangShanLou(b, cfg, detail = null) {
  const rng = createRng(cfg.seed ?? 1917)
  const w = cfg.width
  const s = w / 11
  const D = cfg.depth ?? 12
  const walkD = STREET.walkwayDepth
  const walkH = STREET.walkwayHeight
  const front = walkD
  const topY = GROUND_H + UPPER_H * (FLOORS - 1)
  const piers = PIER_X.map((x) => x * s)
  const bays = BAY_X.map((x) => x * s)
  const lit = (chance) => rng() < chance

  /* ── 騎樓步道 ─────────────────────── */
  b.box('stone', [w, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: '#d8d1c2' })
  b.box('stone', [w, walkH + 0.025, 0.22], [0, (walkH + 0.025) / 2, walkD - 0.11], { tint: '#b3a995' })
  b.box('stucco', [w - 0.2, 0.14, walkD - 0.45], [0, 3.97, (walkD - 0.45) / 2], { tint: shade(TRIM, 0.88) })

  /* ── 騎樓拱廊（五開間，中央弧拱最寬） ── */
  const arcadeZ = walkD - 0.5
  const friezeY = 4.0
  const arches = bays.map((cx, i) => {
    const hw = i === 2 ? 1.2 * s : 0.6 * s
    return i === 2 ? archGeometry(cx, hw, 2.95, 0.85) : archGeometry(cx, hw, 2.95, hw)
  })
  for (const a of arches) {
    b.extrude('brick', spandrelShape(a, friezeY), 0.5, { position: [0, 0, arcadeZ], tint: BRICK, curveSegments: 10 })
    b.extrude('stucco', archivoltShape(a, 0.15), 0.07, { position: [0, 0, walkD], tint: TRIM, curveSegments: 10 })
    b.box('stucco', [0.2, 0.32, 0.12], [a.cx, a.spring + a.rise + 0.08, walkD + 0.05], { tint: shade(TRIM, 0.95) })
  }
  piers.forEach((x, i) => {
    const outer = i === 0 || i === piers.length - 1
    const pw = outer ? 0.7 : 0.6
    b.box('brick', [pw, friezeY - walkH, 0.5], [x, (friezeY + walkH) / 2, arcadeZ + 0.25], { tint: BRICK, grime: 0.12 })
    b.box('stone', [pw + 0.1, 0.55, 0.6], [x, walkH + 0.275, arcadeZ + 0.25], { tint: GRANITE })
    b.box('stucco', [pw + 0.14, 0.16, 0.6], [x, 2.95 - 0.08, arcadeZ + 0.25], { tint: TRIM })
    // 灰泥隅石（外側柱）或細線腳（內側柱）
    if (outer) {
      for (let k = 0; k < 5; k++) {
        const qw = k % 2 ? 0.5 : 0.74
        b.box('stucco', [qw, 0.3, 0.06], [x, 0.95 + k * 0.42, walkD + 0.03], { tint: TRIM })
      }
    } else {
      b.box('stucco', [pw * 0.6, 0.06, 0.04], [x, 1.6, walkD + 0.02], { tint: TRIM })
    }
  })
  // 拱廊上方的橫楣
  b.box('brick', [w, GROUND_H - friezeY, 0.56], [0, (GROUND_H + friezeY) / 2, arcadeZ + 0.28], { tint: BRICK })
  b.box('stucco', [w + 0.04, 0.1, 0.64], [0, friezeY + 0.05, arcadeZ + 0.3], { tint: TRIM })
  signBoard(b, { text: cfg.sign?.text ?? '江山樓', style: 'gold', y: friezeY + 0.26, z: walkD + 0.05, width: 2.0 * s, height: 0.4, frameTint: '#3e2a20' })

  /* ── 一樓店面：兩側櫥窗、中央內退的入口 ── */
  const doorHalf = 1.25 * s
  for (const side of [-1, 1]) {
    const x0 = side * doorHalf
    const x1 = side * (w / 2 - 0.2)
    const segW = Math.abs(x1 - x0)
    b.box('brick', [segW, friezeY - walkH, 0.3], [(x0 + x1) / 2, (friezeY + walkH) / 2, -0.15], { tint: BRICK, grime: 0.14 })
    b.box('stone', [segW, 0.5, 0.36], [(x0 + x1) / 2, walkH + 0.25, -0.12], { tint: GRANITE })
    for (const bx of [bays[side < 0 ? 0 : 4], bays[side < 0 ? 1 : 3]]) storefrontWindow(b, { x: bx, walkH })
  }
  // 可以走進去（walkIn，第 11 階段）：門廳、宴會廳與鏡頭遮擋改由 builders/jiangShanLou/jiangShanLouInterior.js 的共用室內處理
  if (!cfg.walkIn) {
    buildEntrance(b, { s, walkH, doorHalf, friezeY })
    buildBanquetRoom(b, { s, rng })
  }

  /* ── 樓上立面 ─────────────────────── */
  b.box('brick', [w, topY - GROUND_H + 0.02, 0.32], [0, (GROUND_H + topY) / 2, front - 0.16], { tint: BRICK, grime: 0.06 })
  // 壁柱與兩端隅石
  for (const x of piers.slice(1, -1)) {
    b.box('brick', [0.42, topY - GROUND_H - 0.3, 0.1], [x, (GROUND_H + topY) / 2, front + 0.05], { tint: PIER_BRICK })
    for (let f = 1; f < FLOORS - 1; f++) {
      const capY = GROUND_H + f * UPPER_H - 0.32
      b.box('stucco', [0.56, 0.14, 0.18], [x, capY, front + 0.09], { tint: TRIM })
    }
  }
  for (const side of [-1, 1]) {
    for (let y = GROUND_H + 0.25, k = 0; y < topY - 0.3; y += 0.46, k++) {
      const qw = k % 2 ? 0.36 : 0.6
      b.box('stucco', [qw, 0.36, 0.07], [side * (w / 2 - qw / 2), y + 0.18, front + 0.035], { tint: TRIM })
    }
  }
  // 各層之間的腰線
  for (let f = 2; f < FLOORS; f++) cornice(b, { y: GROUND_H + (f - 1) * UPPER_H + 0.06, width: w, z: front, tint: TRIM })

  floorTwo(b, { y0: GROUND_H, w, s, bays, piers, front, lit })
  floorThree(b, { y0: GROUND_H + UPPER_H, w, s, bays, front, lit })
  floorFour(b, { y0: GROUND_H + UPPER_H * 2, w, s, bays, piers, front, lit, topY })

  // 主簷口與齒飾
  cornice(b, { y: topY - 0.06, width: w + 0.16, z: front, tint: TRIM, depth: 0.42 })
  for (let x = -w / 2 + 0.2; x <= w / 2 - 0.15; x += 0.24) {
    b.box('stucco', [0.11, 0.13, 0.1], [x, topY - 0.36, front + 0.05], { tint: shade(TRIM, 0.96) })
  }

  /* ── 女兒牆、山頭與匾額 ───────────── */
  // 可以走進去的版本（第 11 階段）依臺史博外觀照的描述：山頭上是「山」字（見下方 nmthSigns）
  buildParapet(b, { w, s, piers, front, topY, text: cfg.walkIn ? '山' : cfg.sign?.text ?? '江山樓', plaqueWidth: cfg.walkIn ? 1.1 : null })

  /* ── 直立招牌 ─────────────────────── */
  projectingSign(b, {
    text: cfg.sign?.text ?? '江山樓',
    style: 'red',
    x: w / 2 - 0.42,
    y: GROUND_H + UPPER_H + 1.85,
    z: front,
    width: 0.66,
    height: 2.5,
    boardTint: '#5d2a22',
  })

  /* ── 側牆、後牆與平屋頂 ───────────── */
  for (const side of [-1, 1]) {
    const x = side * (w / 2 - 0.15)
    b.box('brick', [0.3, topY + 0.4, D], [x, (topY + 0.4) / 2, -D / 2], { tint: BRICK, grime: 0.12 })
    b.box('brick', [0.3, topY - GROUND_H + 0.4, walkD - 0.02], [x, (topY + GROUND_H + 0.4) / 2, (walkD - 0.02) / 2], { tint: BRICK })
    // 高出鄰房的側牆：延續正面的腰線與隅石，並在二到四樓開窗（鄰房較高時窗會藏在鄰房牆內）
    b.group([side * w / 2, 0, (walkD - D) / 2], side * Math.PI / 2, () => {
      for (let f = 1; f <= FLOORS; f++) {
        const y = f === FLOORS ? topY - 0.1 : GROUND_H + (f - 1) * UPPER_H + 0.06
        b.box('stucco', [D + walkD, 0.16, 0.08], [0, y, 0.04], { tint: TRIM })
      }
    })
    for (let y = GROUND_H + 0.25, k = 0; y < topY - 0.3; y += 0.46, k++) {
      const qw = k % 2 ? 0.36 : 0.6
      b.box('stucco', [0.07, 0.36, qw], [side * (w / 2 + 0.035), y + 0.18, front - qw / 2], { tint: TRIM })
    }
    for (const z of [-2.2, -5.6, -9.0]) {
      for (let f = 2; f <= FLOORS; f++) {
        const y0 = GROUND_H + (f - 2) * UPPER_H
        b.group([side * w / 2, 0, z], side * Math.PI / 2, () => {
          if (f === FLOORS) {
            archWindow(b, { x: 0, y: y0 + 0.75, width: 0.78, height: 1.6, z: 0.02, lit: lit(0.5), frameTint: TRIM, shutters: false, glassTint: TWILIGHT_GLASS })
          } else {
            rectWindow(b, { x: 0, y: y0 + 1.6, width: 0.8, height: 1.35, z: 0.01, lit: lit(0.6), frameTint: TRIM, frameMat: 'stucco', style: 'panes', glassTint: TWILIGHT_GLASS })
            b.box('stucco', [1.2, 0.12, 0.12], [0, y0 + 2.48, 0.06], { tint: TRIM })
          }
        })
      }
    }
    b.box('brick', [0.3, 0.9, D + front], [x, topY + 0.45, (front - D) / 2], { tint: BRICK })
  }
  b.box('brick', [w, topY + 0.4, 0.3], [0, (topY + 0.4) / 2, -D + 0.15], { tint: BRICK })
  b.box('brick', [w, 0.9, 0.3], [0, topY + 0.45, -D + 0.15], { tint: BRICK })
  b.box('stucco', [w - 0.3, 0.2, D + front - 0.5], [0, topY + 0.02, (front - D) / 2 - 0.1], { tint: '#b9ae9f' })
  // 屋頂樓梯間（平頂）
  if (!cfg.walkIn) {
    b.box('brick', [2.6, 2.4, 2.4], [-w * 0.22, topY + 1.2, -D + 2.2], { tint: BRICK })
    b.box('stucco', [2.8, 0.16, 2.6], [-w * 0.22, topY + 2.46, -D + 2.2], { tint: TRIM })
  }

  /* ── 燈籠（只留少數）、盆栽與燈光 ── */
  for (const [x, scale] of [[-0.78 * s, 1.0], [0.78 * s, 1.0]]) {
    b.box('dark', [0.016, 0.22, 0.016], [x, 3.84, walkD - 0.8], { tint: '#3a2f27' })
    b.addLantern(x, 3.73, walkD - 0.8, { scale })
  }
  for (const [x, y, scale] of [[bays[0], GROUND_H + 3.0, 0.78], [bays[4], GROUND_H + 2.85, 0.7]]) {
    b.box('plain', [0.04, 0.04, 0.6], [x, y + 0.05, front + 0.3], { tint: '#3a2f27' })
    b.addLantern(x, y, front + 0.58, { scale })
  }
  for (const side of [-1, 1]) pottedPlant(b, [side * 2.3 * s, walkH, 0.75], { seed: 70 + side, size: 1.05 })
  b.addPool(0, walkD + 1.1, 3.4, '#ffc07a')
  if (cfg.walkIn) nmthSigns(b, { w, s, front, topY, walkH, detail: detail ?? b })
  if (!cfg.walkIn) {
    b.addPool(0, 0.9, 1.8, '#ffc888', walkH + 0.01)
    b.addBlocker(-w / 2, w / 2, 0, topY + 2.6, -D, front + 0.9)
  }
  return { groundHeight: GROUND_H, topHeight: topY, markerHeight: topY + 4.2, ridgeHeight: topY + 2.6 }
}

/* ── 一樓櫥窗（木框玻璃窗，透出室內暖光） ── */
function storefrontWindow(b, { x, walkH }) {
  const width = 0.96
  const height = 2.2
  const bottom = walkH + 0.75
  const cy = bottom + height / 2
  b.box('glassWarm', [width, height, 0.04], [x, cy, 0.02])
  b.box('wood', [width + 0.14, 0.1, 0.1], [x, bottom + height + 0.05, 0.05], { tint: LACQUER })
  b.box('wood', [width + 0.14, 0.1, 0.1], [x, bottom - 0.05, 0.05], { tint: LACQUER })
  for (const side of [-1, 1]) b.box('wood', [0.08, height, 0.1], [x + side * (width / 2 + 0.03), cy, 0.05], { tint: LACQUER })
  b.box('wood', [0.05, height, 0.06], [x, cy, 0.05], { tint: LACQUER })
  b.box('wood', [width, 0.05, 0.06], [x, bottom + height * 0.72, 0.05], { tint: LACQUER })
  // 窗下木板與窗上灰泥窗楣
  b.box('planks', [width + 0.1, 0.55, 0.06], [x, walkH + 0.42, 0.03], { tint: '#7a4a34' })
  b.box('stucco', [width + 0.4, 0.14, 0.16], [x, bottom + height + 0.22, 0.07], { tint: TRIM })
  b.box('stucco', [0.2, 0.26, 0.14], [x, bottom + height + 0.18, 0.1], { tint: shade(TRIM, 0.95) })
}

/* ── 入口：台階、門柱、內退的門廳與敞開的大門 ── */
function buildEntrance(b, { s, walkH, doorHalf, friezeY }) {
  const top = walkH + 0.36
  const stepW = 3.5 * s
  const vestibuleZ = -1.4
  // 三級台階與平台
  b.box('stone', [stepW + 0.3, 0.12, 0.3], [0, walkH + 0.06, 1.0], { tint: '#d9d2c3' })
  b.box('stone', [stepW + 0.1, 0.24, 0.3], [0, walkH + 0.12, 0.7], { tint: '#d3cbbb' })
  b.box('stone', [stepW, 0.36, 0.85], [0, walkH + 0.18, 0.13], { tint: '#cfc7b6' })
  b.box('stone', [doorHalf * 2, 0.36, 1.5], [0, walkH + 0.18, vestibuleZ / 2 - 0.3], { tint: '#cfc7b6' })
  // 門廳兩側牆、天花
  for (const side of [-1, 1]) {
    b.box('brick', [0.26, friezeY - top, 1.7], [side * (doorHalf + 0.13), (friezeY + top) / 2, -0.85], { tint: BRICK })
  }
  b.box('wood', [doorHalf * 2, 0.1, 1.7], [0, friezeY - 0.05, -0.85], { tint: '#4a2c22' })
  // 門柱（立於平台上，承托入口的小楣樑）
  for (const side of [-1, 1]) {
    const x = side * (doorHalf + 0.22)
    b.cylinder('stone', 0.15, 0.17, friezeY - top - 0.55, 14, [x, top + 0.3 + (friezeY - top - 0.55) / 2, 0.32], { tint: '#e2d9c8' })
    b.box('stone', [0.42, 0.3, 0.42], [x, top + 0.15, 0.32], { tint: GRANITE })
    b.box('stucco', [0.44, 0.14, 0.44], [x, friezeY - 0.32, 0.32], { tint: TRIM })
    b.box('stucco', [0.38, 0.1, 0.38], [x, friezeY - 0.2, 0.32], { tint: shade(TRIM, 0.95) })
  }
  b.box('stucco', [doorHalf * 2 + 0.9, 0.16, 0.5], [0, friezeY - 0.08, 0.32], { tint: TRIM })
  // 門框、門楣上的扇形氣窗
  const doorW = 1.8 * s
  const doorH = 2.8
  const wallZ = vestibuleZ - 0.13
  for (const side of [-1, 1]) {
    const jambW = doorHalf - doorW / 2
    b.box('brick', [jambW, friezeY - top, 0.26], [side * (doorW / 2 + jambW / 2), (friezeY + top) / 2, wallZ], { tint: BRICK })
  }
  b.box('brick', [doorW, friezeY - top - doorH, 0.26], [0, top + doorH + (friezeY - top - doorH) / 2, wallZ], { tint: BRICK })
  b.box('glassWarm', [doorW - 0.2, 0.42, 0.04], [0, top + doorH + 0.32, wallZ + 0.14])
  for (let k = -2; k <= 2; k++) {
    b.box('wood', [0.035, 0.44, 0.05], [k * 0.3, top + doorH + 0.32, wallZ + 0.17], { rotation: [0, 0, k * 0.28], tint: LACQUER })
  }
  b.box('stone', [doorW + 0.24, 0.14, 0.12], [0, top + doorH + 0.04, wallZ + 0.14], { tint: GRANITE })
  for (const side of [-1, 1]) b.box('stone', [0.12, doorH, 0.12], [side * (doorW / 2 + 0.06), top + doorH / 2, wallZ + 0.14], { tint: GRANITE })
  // 敞開的雙扇大門（向內開）
  const leafW = doorW / 2
  const angle = 1.2
  for (const side of [-1, 1]) {
    b.group([side * (doorW / 2), top, wallZ - 0.1], side * -angle, () => {
      b.box('planks', [leafW, doorH - 0.04, 0.07], [-side * leafW / 2, doorH / 2, 0], { tint: LACQUER })
      for (const py of [0.75, 1.95]) b.box('wood', [leafW * 0.68, 0.8, 0.03], [-side * leafW / 2, py, 0.05], { tint: shade(LACQUER, 1.15) })
      b.add('plain', new SphereGeometry(0.035, 6, 4), { position: [-side * (leafW - 0.12), 1.35, 0.06], tint: '#d6ae52' })
    })
  }
  b.addGlow(0, top + 1.6, vestibuleZ + 0.2, 2.2, '#ffcf8f')
}

/* ── 門內的宴席：圓桌、紅桌巾、碗盤、圓凳、屏風與吊燈 ── */
function buildBanquetRoom(b, { s, rng }) {
  const floorY = STREET.walkwayHeight + 0.36
  const z0 = -1.66
  const z1 = -6.2
  const halfW = 2.7 * s
  const depth = z0 - z1
  const cz = (z0 + z1) / 2
  b.box('planks', [halfW * 2, 0.05, depth], [0, floorY - 0.02, cz], { tint: '#7a5a42' })
  b.box('wood', [halfW * 2, 0.1, depth], [0, 4.0, cz], { tint: '#3e2820' })
  for (const side of [-1, 1]) b.box('plain', [0.1, 4.0 - floorY, depth], [side * halfW, (4.0 + floorY) / 2, cz], { tint: WARM_ROOM })
  b.box('windowLit', [halfW * 2, 4.0 - floorY, 0.1], [0, (4.0 + floorY) / 2, z1], { tint: '#7a5238' })
  // 屏風
  for (let k = -1; k <= 1; k++) {
    const x = k * 0.9
    b.box('wood', [0.86, 2.3, 0.06], [x, floorY + 1.2, z1 + 0.3], { rotation: [0, k * 0.18, 0], tint: '#5e3324' })
    b.box('plain', [0.66, 1.6, 0.02], [x, floorY + 1.3, z1 + 0.34], { rotation: [0, k * 0.18, 0], tint: k === 0 ? '#b4402f' : '#d8c08a' })
  }
  // 圓桌
  for (const [tx, tz] of [[-0.8, -3.0], [1.1, -4.5]]) {
    const top = floorY + 0.78
    b.cylinder('wood', 0.08, 0.14, 0.7, 8, [tx, floorY + 0.35, tz], { tint: '#4a2a1e' })
    b.cylinder('plain', 0.66, 0.74, 0.38, 18, [tx, top - 0.19, tz], { tint: '#b23a2c' })
    b.cylinder('plain', 0.66, 0.66, 0.02, 18, [tx, top + 0.01, tz], { tint: '#c4473a' })
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      b.cylinder('plain', 0.08, 0.06, 0.02, 10, [tx + Math.cos(a) * 0.48, top + 0.03, tz + Math.sin(a) * 0.48], { tint: '#f4efe4' })
      b.cylinder('wood', 0.17, 0.15, 0.45, 10, [tx + Math.cos(a + 0.2) * 0.98, floorY + 0.225, tz + Math.sin(a + 0.2) * 0.98], { tint: '#4f2a1f' })
    }
    for (let i = 0; i < 3; i++) {
      const a = rng() * Math.PI * 2
      const r = i === 0 ? 0 : 0.2
      b.add('plain', new SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), {
        position: [tx + Math.cos(a) * r, top + 0.02, tz + Math.sin(a) * r],
        scale: [1, -0.6, 1],
        tint: '#efe6d4',
      })
      b.cylinder('plain', 0.1, 0.1, 0.03, 10, [tx + Math.cos(a) * r, top + 0.05, tz + Math.sin(a) * r], { tint: i === 1 ? '#b7643a' : '#d39a4a' })
    }
    // 吊燈
    b.box('dark', [0.02, 0.6, 0.02], [tx, 3.65, tz], { tint: '#2c211b' })
    b.add('bulb', new SphereGeometry(0.15, 10, 8), { position: [tx, 3.28, tz], tint: '#fff0cf' })
    b.cylinder('plain', 0.24, 0.1, 0.12, 12, [tx, 3.42, tz], { tint: '#d6ae52' })
    b.addGlow(tx, 3.25, tz, 1.3, '#ffd9a0')
  }
  b.addPool(0, -3.4, 2.2, '#ffc888', floorY + 0.01)
}

/* ── 二樓：拱形落地窗與通長陽臺，陽臺上方一串宴席燈泡 ── */
function floorTwo(b, { y0, w, s, bays, piers, front, lit }) {
  for (const [i, x] of bays.entries()) {
    const xs = i === 2 ? [x - 0.6 * s, x + 0.6 * s] : [x]
    for (const wx of xs) {
      const on = lit(0.85)
      archWindow(b, { x: wx, y: y0 + 0.32, width: i === 2 ? 0.86 : 0.98, height: 2.65, z: front, lit: on, frameTint: TRIM, shutters: false, glassTint: TWILIGHT_GLASS })
      if (on) b.addGlow(wx, y0 + 1.6, front + 0.35, 1.5, '#ffc27a')
    }
  }
  balcony(b, { y: y0 + 0.2, width: w - 0.5, depth: 0.85, z: front, slabTint: TRIM, railTint: TRIM, style: 'baluster', brackets: false })
  // 托架對齊壁柱（避開騎樓橫楣上的招牌）
  for (const x of piers) b.box('stucco', [0.16, 0.34, 0.6], [x, y0 - 0.06, front + 0.3], { tint: shade(TRIM, 0.9) })
  // 宴席燈飾：壁柱之間的弧形燈串
  const y = y0 + 3.18
  const z = front + 0.16
  for (let i = 0; i < piers.length - 1; i++) {
    const from = [piers[i] + (i === 0 ? 0.2 : 0), y, z]
    const to = [piers[i + 1] - (i === piers.length - 2 ? 0.2 : 0), y, z]
    const count = 6
    const points = catenaryPoints(from, to, 0.34, count + 1)
    wire(b, { from, to, sag: 0.34, radius: 0.008, tint: '#2f2620', segments: count + 1 })
    for (let k = 1; k <= count; k++) {
      const p = points[k]
      b.add('bulb', new SphereGeometry(0.055, 6, 4), { position: [p.x, p.y - 0.06, p.z], tint: '#fff2cf' })
    }
  }
  for (const x of [-w * 0.3, 0, w * 0.3]) b.addGlow(x, y - 0.2, z + 0.2, 2.4, '#ffe2a8')
}

/* ── 三樓：方窗配三角／弧形窗楣，中央小陽臺 ── */
function floorThree(b, { y0, w, s, bays, front, lit }) {
  for (const [i, x] of bays.entries()) {
    const center = i === 2
    const width = center ? 1.3 * s : 0.95
    const height = center ? 2.3 : 1.8
    const cy = center ? y0 + 0.35 + height / 2 : y0 + 0.62 + height / 2
    const on = lit(0.8)
    rectWindow(b, { x, y: cy, width, height, z: front, lit: on, frameTint: LACQUER, barTint: '#c9ad8a', style: 'panes', glassTint: TWILIGHT_GLASS })
    // 灰泥窗框
    b.box('stucco', [width + 0.42, 0.12, 0.1], [x, cy + height / 2 + 0.06, front + 0.05], { tint: TRIM })
    for (const side of [-1, 1]) b.box('stucco', [0.12, height + 0.1, 0.08], [x + side * (width / 2 + 0.15), cy, front + 0.04], { tint: TRIM })
    windowPediment(b, { x, y: cy + height / 2 + 0.12, width: width + 0.5, z: front, kind: i % 2 === 0 ? 'triangle' : 'segment' })
    if (!center) {
      b.box('stucco', [width + 0.36, 0.1, 0.24], [x, cy - height / 2 - 0.1, front + 0.1], { tint: TRIM })
      for (const side of [-1, 1]) b.box('stucco', [0.1, 0.2, 0.14], [x + side * (width / 2 + 0.05), cy - height / 2 - 0.25, front + 0.07], { tint: shade(TRIM, 0.94) })
    }
    if (on) b.addGlow(x, cy, front + 0.35, 1.4, '#ffc27a')
  }
  balcony(b, { y: y0 + 0.24, width: 2.5 * s, depth: 0.55, z: front, slabTint: TRIM, railTint: TRIM, style: 'baluster' })
}

/* ── 四樓：圓拱窗，中央三連拱窗，上方的圓形飾章 ── */
function floorFour(b, { y0, w, s, bays, piers, front, lit, topY }) {
  for (const [i, x] of bays.entries()) {
    if (i === 2) {
      for (const dx of [-0.66, 0, 0.66]) {
        const on = lit(0.6)
        archWindow(b, { x: x + dx * s, y: y0 + 0.62, width: 0.5, height: dx === 0 ? 1.95 : 1.65, z: front, lit: on, frameTint: TRIM, keystone: dx === 0, shutters: false, glassTint: TWILIGHT_GLASS })
        if (on) b.addGlow(x + dx * s, y0 + 1.4, front + 0.3, 1.0, '#ffc27a')
      }
      b.box('stucco', [2.1 * s, 0.1, 0.22], [x, y0 + 0.55, front + 0.08], { tint: TRIM })
      continue
    }
    const on = lit(0.6)
    archWindow(b, { x, y: y0 + 0.62, width: 0.84, height: 1.75, z: front, lit: on, frameTint: TRIM, shutters: false, glassTint: TWILIGHT_GLASS })
    if (on) b.addGlow(x, y0 + 1.4, front + 0.3, 1.2, '#ffc27a')
  }
  for (const x of piers.slice(1, -1)) {
    b.cylinder('stucco', 0.15, 0.15, 0.08, 14, [x, topY - 0.95, front + 0.12], { rotation: [Math.PI / 2, 0, 0], tint: TRIM })
  }
  b.box('stucco', [w, 0.08, 0.06], [0, topY - 0.62, front + 0.03], { tint: TRIM })
}

/* ── 女兒牆：欄杆段、柱墩與中央弧形山頭（嵌匾額、燈泡勾勒輪廓） ── */
function buildParapet(b, { w, s, piers, front, topY, text, plaqueWidth = null }) {
  const y = topY + 0.06
  const railH = 1.05
  const curve = pedimentCurve(4.6 * s, 1.6, 2.5)
  // 柱墩
  const posts = [-w / 2 + 0.3, piers[1], piers[4], w / 2 - 0.3]
  for (const x of posts) {
    b.box('brick', [0.5, railH + 0.25, 0.5], [x, y + (railH + 0.25) / 2, front - 0.25], { tint: BRICK })
    b.box('stucco', [0.6, 0.12, 0.6], [x, y + railH + 0.31, front - 0.25], { tint: TRIM })
    b.add('plain', new SphereGeometry(0.17, 10, 8), { position: [x, y + railH + 0.55, front - 0.25], tint: TRIM })
  }
  // 欄杆段（柱墩之間、山頭兩側）
  const spans = [
    [posts[0] + 0.25, posts[1] - 0.25],
    [posts[1] + 0.25, -curve.half],
    [curve.half, posts[2] - 0.25],
    [posts[2] + 0.25, posts[3] - 0.25],
  ]
  for (const [x0, x1] of spans) {
    const sw = x1 - x0
    if (sw <= 0.1) continue
    const cx = (x0 + x1) / 2
    b.box('stucco', [sw, 0.16, 0.3], [cx, y + 0.08, front - 0.2], { tint: TRIM })
    b.box('stucco', [sw, 0.1, 0.34], [cx, y + railH - 0.05, front - 0.2], { tint: TRIM })
    const n = Math.max(2, Math.round(sw / 0.22))
    for (let i = 0; i < n; i++) {
      b.box('stucco', [0.09, railH - 0.26, 0.09], [x0 + (i + 0.5) * (sw / n), y + railH / 2, front - 0.2], { tint: TRIM })
    }
  }
  // 山頭：紅磚面，後方略大的灰泥板從邊緣露出成為壓頂線
  b.extrude('brick', pedimentShape(curve), 0.3, { position: [0, y, front - 0.3], tint: BRICK, curveSegments: 16 })
  b.extrude('stucco', pedimentShape(curve, 0.1), 0.3, { position: [0, y - 0.02, front - 0.36], tint: TRIM, curveSegments: 16 })
  b.box('stucco', [curve.half * 2 + 0.2, 0.14, 0.38], [0, y + 0.07, front - 0.15], { tint: TRIM })
  // 匾額
  const pw = plaqueWidth ?? 3.0 * s
  b.box('stucco', [pw + 0.3 * s, 1.08, 0.08], [0, y + 1.05, front + 0.03], { tint: shade(TRIM, 0.95) })
  signBoard(b, { text, style: 'gold', y: y + 1.05, z: front + 0.06, width: pw, height: 0.86, frameTint: '#3e2a20' })
  // 頂端寶瓶
  const peakY = y + curve.peak
  b.cylinder('stucco', 0.2, 0.26, 0.16, 12, [0, peakY + 0.08, front - 0.18], { tint: TRIM })
  b.add('plain', new SphereGeometry(0.2, 12, 10), { position: [0, peakY + 0.34, front - 0.18], scale: [1, 1.2, 1], tint: TRIM })
  // 沿山頭輪廓的燈泡
  for (let k = 0; k <= 14; k++) {
    const [px, py] = pedimentPoint(curve, k / 14)
    b.add('bulb', new SphereGeometry(0.06, 6, 4), { position: [px, y + py + 0.14, front + 0.02], tint: '#fff2cf' })
  }
}

/**
 * 第 11 階段可以走進去的版本：立面與側面的字樣依臺史博典藏「江山樓」（2004.055.0002）外觀照的描述——
 * 由上而下「山」（山頭）、「KANG SAN LAU」、「ライトビール」、「江山樓□□□□□」（看不清的字不補，只寫江山樓）、
 * 「かうさんろう」，側面「高砂麥酒」。招牌用中、英、日三種文字（莊永明）。字的位置與大小是歷史情境重建。
 * 大門上方補一道門楣（原本的入口台階與門廳拿掉，門口由共用室內處理）。
 */
function nmthSigns(b, { w, s, front, topY, walkH, detail }) {
  // 四樓窗上方的英文橫帶
  b.box('stucco', [4.6 * s, 0.5, 0.1], [0, topY - 0.55, front + 0.08], { tint: shade(TRIM, 0.96) })
  b.addSign({ text: 'KANG SAN LAU', style: 'latinBand', width: 4.2 * s, height: 0.38, position: [0, topY - 0.55, front + 0.135] })
  // 三、四樓之間的啤酒廣告橫帶
  const y34 = GROUND_H + UPPER_H * 2 - 0.42
  b.box('stucco', [2.9 * s, 0.46, 0.1], [0, y34, front + 0.1], { tint: '#efe6d2' })
  b.addSign({ text: 'ライトビール', style: 'latinBand', width: 2.6 * s, height: 0.34, position: [0, y34, front + 0.155] })
  // 大門上方的門楣與假名「かうさんろう」
  b.box('brick', [2.5 * s, 1.36, 0.3], [0, 2.62 + 0.68, -0.15], { tint: BRICK })
  b.box('stucco', [2.3 * s, 0.42, 0.06], [0, 3.3, 0.02], { tint: TRIM })
  b.addSign({ text: 'かうさんろう', style: 'latinBand', width: 2.1 * s, height: 0.32, position: [0, 3.3, 0.055] })
  // 側面（右側，本地 +x）的「高砂麥酒」直書大字
  b.box('stucco', [0.08, 3.4, 0.9], [w / 2 + 0.06, GROUND_H + UPPER_H * 1.6, -3.0], { tint: '#efe6d2' })
  b.addSign({ text: '高砂麥酒', style: 'red', vertical: true, width: 0.74, height: 3.1, position: [w / 2 + 0.105, GROUND_H + UPPER_H * 1.6, -3.0], rotationY: Math.PI / 2 })
  // 夜間的燈籠：二、三樓陽臺下各一排（歷史情境重建）
  for (const [y, n] of [[GROUND_H + UPPER_H + 0.12, 4], [GROUND_H + 0.1, 0]]) {
    for (let i = 0; i < n; i++) {
      const x = (-1.5 + i) * 1.15 * s
      b.box('dark', [0.016, 0.25, 0.016], [x, y - 0.12, front + 0.5], { tint: '#3a2f27' })
      b.addLantern(x, y - 0.38, front + 0.5, { scale: 0.75 })
    }
  }
  // 樓頂庭園（歷史情境重建，依臺史博明信片〈臺灣料理江山樓屋上庭園〉2020.006.0807.0005 的配置；明信片只能瀏覽、不放圖）：
  // 左前方有圓窗與四面坡頂的角樓（展望台）、一面開大圓洞的牆、中段的假山與花壇、後方高聳的塔柱、
  // 右後方一排單層磚屋（四樓上來的樓梯就在磚屋裡）、女兒牆邊成排的盆栽。位置與尺寸配合 data/jiangShanLouLayout.js 的 ROOF_GARDEN
  const roofY = topY + 0.12
  const G = ROOF_GARDEN
  // 角樓：紅磚身、灰泥線腳、正面圓窗、四面坡頂與老虎窗
  {
    const t = G.turret
    const cx = (t.minX + t.maxX) / 2
    const cz = (t.minZ + t.maxZ) / 2
    const tw = t.maxX - t.minX
    const td = t.maxZ - t.minZ
    b.box('brick', [tw, 3.0, td], [cx, roofY + 1.5, cz], { tint: BRICK })
    b.box('stucco', [tw + 0.12, 0.14, td + 0.12], [cx, roofY + 3.02, cz], { tint: TRIM })
    b.cylinder('roof', 0.08, Math.hypot(tw, td) / 2 + 0.15, 1.3, 4, [cx, roofY + 3.75, cz], { rotation: [0, Math.PI / 4, 0], tint: '#7a5a4a' })
    b.cylinder('stucco', 0.36, 0.36, 0.06, 16, [cx, roofY + 1.9, t.maxZ + 0.03], { rotation: [Math.PI / 2, 0, 0], tint: TRIM })
    b.cylinder('windowLit', 0.27, 0.27, 0.05, 16, [cx, roofY + 1.9, t.maxZ + 0.05], { rotation: [Math.PI / 2, 0, 0], tint: '#6b4b33' })
    b.box('stucco', [0.5, 0.42, 0.36], [cx, roofY + 3.6, t.maxZ - 0.15], { tint: TRIM })
    detail.box('windowLit', [0.3, 0.26, 0.02], [cx, roofY + 3.6, t.maxZ + 0.04], { tint: '#6b4b33' })
  }
  // 開大圓洞的牆（洞口可以穿過；圓心壓低一點，洞底是平的門檻）：洞的外接方框分成十條橫片，每條補上圓外的兩角
  {
    const w0 = G.moonWall
    const h = 2.7
    const r = w0.r
    const cy = roofY + r - 0.15
    const wall = (x0, x1, y0, y1) => b.box('stucco', [x1 - x0, y1 - y0, 0.25], [(x0 + x1) / 2, (y0 + y1) / 2, w0.z], { tint: '#ece2cc' })
    wall(w0.x0, w0.cx - r, roofY, roofY + h)
    wall(w0.cx + r, w0.x1, roofY, roofY + h)
    wall(w0.cx - r, w0.cx + r, cy + r, roofY + h)
    const n = 10
    const step = (cy + r - roofY) / n
    for (let k = 0; k < n; k++) {
      const y0 = roofY + k * step
      const dy = y0 + step / 2 - cy
      const half = Math.sqrt(Math.max(0, r * r - dy * dy))
      if (r - half < 0.01) continue
      wall(w0.cx - r, w0.cx - half, y0, y0 + step)
      wall(w0.cx + half, w0.cx + r, y0, y0 + step)
    }
    b.add('stucco', new TorusGeometry(r, 0.07, 6, 28), { position: [w0.cx, cy, w0.z + 0.13], tint: TRIM })
    b.box('stucco', [w0.x1 - w0.x0 + 0.1, 0.1, 0.32], [(w0.x0 + w0.x1) / 2, roofY + h + 0.05, w0.z], { tint: TRIM })
  }
  // 假山與花壇
  rockery(b, detail, G.rockery.x, roofY, G.rockery.z)
  // 後方的塔柱
  b.box('brick', [G.tower.size, 5.5, G.tower.size], [G.tower.x, roofY + 2.75, G.tower.z], { tint: BRICK })
  b.box('stucco', [G.tower.size + 0.14, 0.18, G.tower.size + 0.14], [G.tower.x, roofY + 5.55, G.tower.z], { tint: TRIM })
  // 右後方的單層磚屋（樓梯間）：前牆、左牆（門口開著）、屋頂；後牆與右牆接建築的外牆
  {
    const r = G.range
    const h = 2.6
    b.box('brick', [r.frontX1 - r.minX, h, 0.22], [(r.minX + r.frontX1) / 2, roofY + h / 2, r.maxZ], { tint: BRICK })
    b.box('brick', [0.22, h, r.doorMinZ - r.minZ], [r.minX, roofY + h / 2, (r.minZ + r.doorMinZ) / 2], { tint: BRICK })
    b.box('brick', [0.22, h, r.maxZ - r.doorMaxZ], [r.minX, roofY + h / 2, (r.doorMaxZ + r.maxZ) / 2], { tint: BRICK })
    b.box('brick', [0.22, h - 2.2, r.doorMaxZ - r.doorMinZ], [r.minX, roofY + 2.2 + (h - 2.2) / 2, (r.doorMinZ + r.doorMaxZ) / 2], { tint: BRICK })
    b.box('stucco', [r.maxX - r.minX + 0.3, 0.16, r.maxZ - r.minZ + 0.3], [(r.minX + r.maxX) / 2, roofY + h + 0.08, (r.minZ + r.maxZ) / 2], { tint: TRIM })
    for (const x of [r.minX + 0.6, r.minX + 1.3]) b.box('windowLit', [0.5, 0.7, 0.04], [x, roofY + 1.6, r.maxZ + 0.12], { tint: '#6b4b33' })
  }
  // 女兒牆邊成排的盆栽（盆下矮架）
  for (const [x, z] of G.pots) {
    b.box('wood', [0.5, 0.18, 0.5], [x, roofY + 0.09, z], { tint: '#5a3f2b' })
    pottedPlant(b, [x, roofY + 0.18, z], { seed: Math.round(80 + x * 7 + z * 3), size: 0.8 })
  }
}

/** 假山：幾塊疊起來的石頭與一棵小樹（形制查無，示意） */
function rockery(b, detail, x, y, z) {
  const rocks = [[0, 0, 0, 0.9, 0.7], [0.7, 0, 0.3, 0.6, 0.55], [-0.6, 0, -0.2, 0.55, 0.5], [0.1, 0.6, 0.05, 0.55, 0.6], [0.2, 1.05, -0.05, 0.32, 0.45]]
  for (const [dx, dy, dz, r, h] of rocks) b.add('stone', new SphereGeometry(r, 7, 5), { position: [x + dx, y + dy + h * 0.5, z + dz], scale: [1, h / r, 0.85], tint: '#8f8a80' })
  b.box('stone', [2.6, 0.3, 2.0], [x, y + 0.15, z], { tint: '#9a968c' })
  b.cylinder('wood', 0.05, 0.07, 0.8, 6, [x + 0.25, y + 1.6, z], { tint: '#5a4030' })
  b.add('plain', new SphereGeometry(0.42, 8, 6), { position: [x + 0.25, y + 2.1, z], scale: [1.2, 0.7, 1.2], tint: '#4f6a3a' })
  for (let i = 0; i < 6; i++) detail.add('plain', new SphereGeometry(0.12, 6, 4), { position: [x - 0.9 + i * 0.36, y + 0.32, z + 0.85], tint: '#5f7a44' })
}
