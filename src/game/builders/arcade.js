import { CylinderGeometry, IcosahedronGeometry } from 'three'
import { STREET } from '../config.js'
import { createCurvedSlab } from './PartBuilder.js'
import { MATERIAL_TILE } from '../rendering/materials.js'
import { createRng, pick } from '../utils/random.js'
import { conditionGrime, conditionTint } from './condition.js'
import {
  arcadeColumn,
  archWindow,
  awning,
  balcony,
  cornice,
  glassStorefront,
  parapet,
  pilaster,
  projectingSign,
  rectWindow,
  rollingShutter,
  roundWindow,
  signBoard,
} from './facade.js'
import { cafeSet, flowerPot, jar, planter, pottedPlant, shade } from './props.js'
import { buildGoods } from './shophouse.js'

/**
 * 騎樓（亭仔腳）街屋：日治時期之後的街屋多把樓上往外推到步道邊，
 * 一樓退縮成有柱廊的步道。三種立面樣式共用這個骨架：
 *
 * - baroque 仿巴洛克洋樓（1910–1920 年代）：拱窗、陽臺欄杆、捲渦山頭
 * - deco    Art Deco（1930 年代）：水平飾帶、垂直鰭片、圓窗、階梯山頭、櫥窗與布篷
 * - postwar 戰後鋼筋混凝土（1950–1970 年代）：二丁掛磁磚、鐵窗花、直立招牌、水塔
 *
 * 本地座標同閩南街屋：一樓店面位於 z = 0，樓上立面位於 z = 步道深度，街道在 +z。
 */
const STYLE_DEFAULTS = {
  baroque: { groundH: 3.7, upperH: 3.25, wallMat: 'stucco', columnMat: 'brick', parapetH: 1.7 },
  deco: { groundH: 3.7, upperH: 3.3, wallMat: 'stucco', columnMat: 'stucco', parapetH: 1.5 },
  postwar: { groundH: 3.5, upperH: 3.0, wallMat: 'tile', columnMat: 'stucco', parapetH: 0.7 },
}

export function buildArcadeBuilding(b, cfg) {
  const style = cfg.archetype
  const defaults = STYLE_DEFAULTS[style] ?? STYLE_DEFAULTS.baroque
  const rng = createRng(cfg.seed ?? 11)
  const condition = cfg.condition ?? 'new'
  const tint = (hex) => conditionTint(hex, condition)
  const grime = (value) => conditionGrime(value, condition)

  const w = cfg.width
  const D = cfg.depth ?? 11
  const floors = Math.max(2, cfg.floors ?? 2)
  const groundH = cfg.groundHeight ?? defaults.groundH
  const upperH = cfg.upperHeight ?? defaults.upperH
  const topY = groundH + upperH * (floors - 1)
  const walkD = STREET.walkwayDepth
  const walkH = STREET.walkwayHeight
  const front = walkD // 樓上立面前緣
  const wallT = 0.3
  const sideT = 0.26
  const wallMat = cfg.wallMat ?? defaults.wallMat
  const wallTint = tint(cfg.wallTint ?? '#efe3c8')
  const trimTint = tint(cfg.trimTint ?? '#f6efe0')
  const shutterTint = tint(cfg.shutterTint ?? '#6d8a83')
  const columnMat = cfg.columnMat ?? defaults.columnMat
  const columnTint = tint(cfg.columnTint ?? (columnMat === 'brick' ? '#ffffff' : '#ece4d4'))
  const woodTint = tint(cfg.woodTint ?? '#c9ad8a')
  const darkWood = shade(woodTint, 0.6)
  const litChance = cfg.litWindows ?? 0.35

  /* ── 步道與騎樓 ─────────────────────── */
  b.box('stone', [w, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: condition === 'restored' ? '#e6dfd2' : '#d8d1c2' })
  b.box('stone', [w, walkH + 0.025, 0.22], [0, (walkH + 0.025) / 2, walkD - 0.11], { tint: '#b3a995' })
  b.box('stucco', [w, 0.22, walkD - 0.03], [0, groundH + 0.11, (walkD - 0.03) / 2], { tint: shade(trimTint, 0.9) })
  const colW = style === 'postwar' ? 0.42 : 0.4
  for (const side of [-1, 1]) {
    arcadeColumn(b, {
      x: side * (w / 2 - colW / 2 - 0.02),
      z: walkD - colW / 2 - 0.02,
      height: groundH,
      width: colW,
      mat: columnMat,
      tint: columnTint,
      capTint: trimTint,
      round: style === 'deco',
    })
  }

  /* ── 側牆、後牆 ─────────────────────── */
  for (const side of [-1, 1]) {
    const x = side * (w / 2 - sideT / 2)
    b.box(wallMat, [sideT, topY + 0.3, D], [x, (topY + 0.3) / 2, -D / 2], { tint: wallTint, grime: grime(0.14) })
    b.box(wallMat, [sideT, topY - groundH, walkD - 0.05], [x, (topY + groundH) / 2, (walkD - 0.05) / 2], { tint: wallTint })
  }
  b.box(wallMat, [w - sideT * 2, topY, wallT], [0, topY / 2, -D + wallT / 2], { tint: wallTint })

  /* ── 一樓店面（退縮在騎樓內） ──────── */
  const innerW = w - 1.0
  const openingH = groundH - 0.65
  for (const side of [-1, 1]) {
    b.box(wallMat, [0.5, groundH, wallT], [side * (w / 2 - 0.25), groundH / 2, -wallT / 2], { tint: wallTint, grime: grime(0.2) })
  }
  b.box(wallMat, [innerW, groundH - openingH, wallT], [0, openingH + (groundH - openingH) / 2, -wallT / 2], { tint: wallTint })
  b.box('stone', [innerW, 0.17, 0.4], [0, walkH + 0.01, -0.12], { tint: '#c7bead' })
  buildGroundShop(b, cfg, rng, { style, innerW, openingH, walkH, condition, darkWood, woodTint, trimTint })

  /* ── 樓上立面 ───────────────────────── */
  b.box(wallMat, [w - 0.02, topY - groundH + 0.02, wallT], [0, (groundH + topY) / 2, front - wallT / 2], {
    tint: wallTint,
    grime: grime(0.1),
  })
  const signY = groundH + 0.52
  if (style === 'baroque') {
    baroqueFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, shutterTint, litChance, condition })
  } else if (style === 'deco') {
    decoFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, condition })
  } else {
    postwarFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, condition })
  }

  /* ── 招牌：騎樓上方的橫招牌 ───────── */
  if (cfg.sign && cfg.sign.placement !== 'parapet') {
    const text = cfg.sign.text
    const sw = Math.min(w - 1.2, 0.95 + text.length * 0.6)
    const lettersOnly = cfg.sign.style === 'letters'
    signBoard(b, {
      text,
      style: cfg.sign.style ?? 'gold',
      y: signY,
      z: front,
      width: lettersOnly ? sw + 0.4 : sw,
      height: lettersOnly ? 0.7 : 0.58,
      frame: !lettersOnly,
      frameTint: style === 'deco' ? '#2b2724' : '#4d3626',
    })
  }
  if (cfg.smallSign) {
    signBoard(b, { text: cfg.smallSign.text, style: cfg.smallSign.style ?? 'deco', x: w / 2 - 0.9, y: groundH - 0.6, z: walkD - 0.02, width: 0.9, height: 0.36 })
  }
  if (cfg.hangingSign) {
    const side = cfg.hangingSign.side === 'left' ? -1 : 1
    projectingSign(b, {
      text: cfg.hangingSign.text,
      style: cfg.hangingSign.style ?? 'vertical',
      x: side * (w / 2 - 0.55),
      y: groundH + Math.min(2.4, (topY - groundH) * 0.55),
      z: front,
      height: Math.min(2.6, (topY - groundH) * 0.8),
      width: 0.52,
      boardTint: cfg.hangingSign.style === 'vertical' ? '#f5f0e2' : '#5d4231',
    })
  }

  /* ── 燈籠、燈火 ─────────────────────── */
  if (cfg.lanterns) {
    const xs = innerW > 3.4 ? [-innerW * 0.3, innerW * 0.3] : [0]
    for (const x of xs) {
      b.box('dark', [0.016, 0.3, 0.016], [x, groundH - 0.15, walkD - 0.5], { tint: '#3a2f27' })
      b.addLantern(x, groundH - 0.75, walkD - 0.5)
    }
  }
  if (cfg.storefront !== 'closed') b.addPool(0, walkD * 0.55, Math.min(2.4, w * 0.35), '#ffb468', walkH + 0.02)

  /* ── 屋頂（藏在山頭後方的單坡瓦頂） ── */
  const roofLen = D + front - 0.4
  const roofDrop = Math.min(1.6, D * 0.12)
  const roofAngle = Math.atan2(roofDrop, roofLen)
  if (style === 'postwar') {
    b.box('stucco', [w - 0.1, 0.2, D + front - 0.3], [0, topY + 0.1, (front - D) / 2], { tint: shade(wallTint, 0.85) })
    waterTank(b, { x: -w * 0.2, y: topY + 0.2, z: -D * 0.35, rng })
  } else {
    b.add('roof', createCurvedSlab(w - 0.3, 0.14, Math.hypot(roofLen, roofDrop), 0, MATERIAL_TILE.roof, 2), {
      position: [0, topY + 0.25 - roofDrop / 2, front - 0.3 - roofLen / 2],
      rotation: [-roofAngle, 0, 0],
      tint: tint(cfg.roofTint ?? '#f2e6e0'),
    })
  }

  // 鏡頭遮擋
  b.addBlocker(-w / 2, w / 2, 0, topY + (defaults.parapetH ?? 1), -D, front)

  return { groundHeight: groundH, topHeight: topY }
}

/* ═══════════ 仿巴洛克立面 ═══════════ */
function baroqueFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, shutterTint, litChance }) {
  const count = w >= 7 ? 3 : w >= 4.8 ? 2 : 1
  const winW = Math.min(1.15, (w - 1.4) / count - 0.45)
  const spacing = (w - 0.8) / count
  const hasBalcony = cfg.balcony ?? rng() < 0.55
  // 壁柱
  for (let i = 0; i <= count; i++) {
    const x = -w / 2 + 0.4 + i * spacing
    pilaster(b, { x, y0: groundH + 0.25, y1: topY, z: front, width: 0.28, tint: trimTint })
  }
  for (let f = 1; f < floors; f++) {
    const fy = groundH + (f - 1) * upperH
    cornice(b, { y: f === 1 ? fy - 0.02 : fy + 0.18, width: w, z: front, tint: trimTint })
    const windowStyle = cfg.windowStyles?.[f - 1] ?? 'arch'
    for (let i = 0; i < count; i++) {
      const x = -w / 2 + 0.4 + spacing * (i + 0.5)
      const lit = rng() < litChance
      if (windowStyle === 'rect') {
        rectWindow(b, { x, y: fy + 1.55, width: winW, height: 1.3, z: front, lit, frameTint: '#5b4636', barTint: '#c9ad8a', style: 'bars' })
      } else {
        archWindow(b, {
          x,
          y: fy + 0.95,
          width: winW,
          height: Math.min(1.9, upperH - 1.15),
          z: front,
          lit,
          frameTint: trimTint,
          shutters: cfg.shutters ?? rng() < 0.6,
          shutterTint,
        })
      }
      if (lit) b.addGlow(x, fy + 1.7, front + 0.3, 1.5, '#ffb468')
    }
    const balconyHere = cfg.balconyFloors ? cfg.balconyFloors.includes(f) : f === 1 && hasBalcony
    if (balconyHere) {
      balcony(b, { y: fy + 0.88, width: w - 0.9, depth: 0.6, z: front, slabTint: trimTint, railTint: trimTint, brackets: !cfg.sign })
      if (cfg.balconyLanterns) {
        for (let i = 0; i < count; i++) b.addLantern(-w / 2 + 0.4 + spacing * (i + 0.5), fy + 2.55, front + 0.45, { scale: 0.85 })
      }
    }
  }
  cornice(b, { y: topY - 0.05, width: w + 0.1, z: front, tint: trimTint, depth: 0.3 })
  // 圓形飾章
  for (const side of [-1, 1]) {
    b.cylinder('stucco', 0.16, 0.16, 0.08, 12, [side * (w / 2 - 0.55), topY + 0.55, front + 0.02], { rotation: [Math.PI / 2, 0, 0], tint: shade(trimTint, 0.95) })
  }
  const plaqueText = cfg.parapetText ?? (cfg.sign?.placement === 'parapet' ? cfg.sign.text : null)
  parapet(b, {
    y: topY + 0.1,
    width: w - 0.02,
    height: cfg.parapetHeight ?? 1.7,
    z: front,
    style: cfg.parapet ?? pick(rng, ['scroll', 'arch', 'stepped', 'scroll']),
    tint: wallTint,
    trimTint,
    plaque: plaqueText ? { text: plaqueText, style: cfg.sign?.style ?? 'gold' } : null,
  })
}

/* ═══════════ Art Deco 立面 ═══════════ */
function decoFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance }) {
  const accent = trimTint
  const cream = shade(wallTint, 1.0)
  // 水平飾帶
  for (let f = 1; f < floors; f++) {
    const fy = groundH + (f - 1) * upperH
    b.box('stucco', [w, 0.12, 0.08], [0, f === 1 ? fy + 0.04 : fy + 0.2, front + 0.04], { tint: accent })
    const count = w >= 6 ? 3 : 2
    const winW = (w - 1.6) / count - 0.25
    for (let i = 0; i < count; i++) {
      const x = -w / 2 + 0.8 + ((w - 1.6) / count) * (i + 0.5)
      const lit = rng() < litChance
      rectWindow(b, {
        x,
        y: fy + 1.55,
        width: winW,
        height: 1.35,
        z: front,
        lit,
        frameTint: '#2d2a28',
        barTint: '#2d2a28',
        style: 'panes',
        frameMat: 'plain',
      })
      if (lit) b.addGlow(x, fy + 1.55, front + 0.3, 1.5, '#ffc27a')
    }
  }
  // 速度線
  for (let k = 0; k < 3; k++) {
    b.box('stucco', [w * 0.9, 0.06, 0.06], [0, topY - 0.35 - k * 0.16, front + 0.03], { tint: accent })
  }
  // 中央垂直鰭片或舷窗（位於頂樓窗戶上方）
  if (rng() < 0.55) {
    for (const dx of [-0.35, 0, 0.35]) {
      const h = dx === 0 ? 2.7 : 2.2
      b.box('stucco', [0.12, h, 0.18], [dx, topY - 0.8 + h / 2, front + 0.09], { tint: dx === 0 ? accent : cream })
    }
  } else {
    roundWindow(b, { x: 0, y: topY + 0.62, radius: 0.3, z: front + 0.04, frameTint: accent, lit: rng() < litChance })
  }
  // 實牆陽臺（騎樓上方掛著橫招牌時不加，避免擋住招牌）
  const wantsBalcony = cfg.balcony ?? rng() < 0.35
  if (wantsBalcony && !(cfg.sign && cfg.sign.placement !== 'parapet')) {
    balcony(b, { y: groundH + upperH * 0.25, width: w * 0.5, depth: 0.55, z: front, slabTint: cream, railTint: cream, style: 'solid' })
  }
  const plaqueText = cfg.parapetText ?? (cfg.sign?.placement === 'parapet' ? cfg.sign.text : null)
  parapet(b, {
    y: topY,
    width: w - 0.02,
    height: cfg.parapetHeight ?? 1.5,
    z: front,
    style: 'deco',
    tint: cream,
    trimTint: shade(cream, 1.02),
    finials: false,
    plaque: plaqueText ? { text: plaqueText, style: cfg.sign?.style ?? 'deco' } : null,
  })
  b.box('stucco', [w, 0.08, 0.1], [0, topY + 0.6 * 1.5 * 0.4 + 0.02, front + 0.05], { tint: accent })
}

/* ═══════════ 戰後鋼筋混凝土立面 ═══════════ */
function postwarFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, condition }) {
  const count = w >= 5.5 ? 2 : 1
  for (let f = 1; f < floors; f++) {
    const fy = groundH + (f - 1) * upperH
    b.box('stucco', [w, 0.18, 0.12], [0, fy + 0.1, front + 0.06], { tint: shade(trimTint, 0.95) })
    const hasBalcony = rng() < 0.4
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 0 : (i === 0 ? -1 : 1) * w * 0.24
      const winW = Math.min(1.5, (w - 1.0) / count - 0.3)
      const lit = rng() < litChance
      rectWindow(b, {
        x,
        y: fy + 1.5,
        width: winW,
        height: 1.25,
        z: front,
        lit,
        frameTint: '#c9cbc6',
        barTint: '#3c4a4d',
        style: 'grille',
        frameMat: 'plain',
      })
      // 小鐵皮雨遮
      b.box('awning', [winW + 0.4, 0.03, 0.55], [x, fy + 2.32, front + 0.27], { rotation: [0.32, 0, 0], tint: '#a7b1b0' })
      if (lit) b.addGlow(x, fy + 1.5, front + 0.3, 1.2, '#ffe0a8')
    }
    if (hasBalcony && f < floors - 0) {
      balcony(b, { y: fy + 0.15, width: w - 0.8, depth: 0.7, z: front, slabTint: '#d6d2c8', railTint: '#3e4b4e', style: 'iron', mat: 'stucco' })
      if (rng() < 0.7) {
        for (let k = 0; k < 2; k++) {
          b.cylinder('plain', 0.14, 0.11, 0.24, 8, [-w / 2 + 0.8 + k * 0.5, fy + 0.35, front + 0.35], { tint: '#b9653f' })
          b.add('plain', new IcosahedronGeometry(0.18, 1), { position: [-w / 2 + 0.8 + k * 0.5, fy + 0.6, front + 0.35], tint: '#6f8a5c' })
        }
      }
    }
  }
  // 女兒牆
  b.box('stucco', [w, 0.7, 0.24], [0, topY + 0.35, front - 0.12], { tint: shade(trimTint, 0.95) })
  b.box('stucco', [w + 0.06, 0.08, 0.32], [0, topY + 0.72, front - 0.12], { tint: trimTint })
  if (condition === 'aged') {
    // 加蓋的鐵皮
    b.box('awning', [w * 0.6, 0.04, 2.4], [w * 0.15, topY + 1.9, front - 1.6], { rotation: [0.12, 0, 0], tint: '#9ea7a6' })
    for (const sx of [-1, 1]) {
      b.cylinder('plain', 0.03, 0.03, 1.8, 5, [w * 0.15 + sx * w * 0.28, topY + 0.9, front - 0.6], { tint: '#5d615f' })
    }
  }
}

/* ── 屋頂水塔 ───────────────────────────── */
function waterTank(b, { x, y, z, rng }) {
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) b.box('plain', [0.06, 1.0, 0.06], [x + sx * 0.4, y + 0.5, z + sz * 0.4], { tint: '#6a6964' })
  }
  b.add(rng() < 0.5 ? 'plain' : 'stucco', new CylinderGeometry(0.62, 0.62, 1.2, 14), { position: [x, y + 1.6, z], tint: rng() < 0.5 ? '#d9d6cc' : '#a9b7b3' })
  b.cylinder('plain', 0.64, 0.64, 0.06, 14, [x, y + 2.22, z], { tint: '#8f8e88' })
}

/* ── 一樓店面 ───────────────────────────── */
function buildGroundShop(b, cfg, rng, { style, innerW, openingH, walkH, condition, darkWood, woodTint, trimTint }) {
  const walkD = STREET.walkwayDepth
  const height = openingH - walkH - 0.05
  const interior = () => {
    const roomD = 2.8
    b.box('planks', [innerW, 0.04, roomD], [0, walkH + 0.02, -roomD / 2 - 0.12], { tint: '#6b5643' })
    b.box('windowLit', [innerW, openingH, 0.1], [0, openingH / 2, -roomD - 0.12], { tint: '#4a3a2e' })
    b.box('dark', [innerW, 0.1, roomD], [0, openingH + 0.05, -roomD / 2 - 0.12], { tint: '#2c241e' })
    for (let i = 0; i < 2; i++) {
      const sy = walkH + 0.95 + i * 0.62
      b.box('wood', [innerW * 0.86, 0.05, 0.36], [0, sy, -roomD + 0.08], { tint: '#8d6c4d' })
      for (let k = 0; k < Math.floor(innerW / 0.5); k++) {
        if (rng() < 0.7) jar(b, [-innerW * 0.4 + k * 0.5 + 0.2, sy + 0.025, -roomD + 0.1], { scale: 0.5, tint: pick(rng, ['#6e4a34', '#8a6844', '#a07a52']) })
      }
    }
    b.box('wood', [innerW * 0.5, 0.92, 0.5], [innerW * 0.18, walkH + 0.46, -1.3], { tint: '#9a7652' })
  }

  const modern = condition === 'restored' && (cfg.modernFront || style === 'deco')
  if (modern || (style === 'deco' && cfg.storefront !== 'closed')) {
    interior()
    glassStorefront(b, { width: innerW - 0.1, height, y0: walkH + 0.02, z: -0.16, frameTint: style === 'deco' ? '#2d2a28' : darkWood, frameMat: style === 'deco' ? 'plain' : 'wood' })
    if (style === 'deco' && cfg.awningTint !== null) {
      awning(b, { y: openingH + 0.25, z: 0.02, width: innerW + 0.2, depth: 1.05, drop: 0.5, tint: conditionTint(cfg.awningTint ?? '#7a2e33', condition) })
    }
    if (cfg.cafe) {
      cafeSet(b, [-innerW * 0.25, walkH, walkD * 0.55], { seed: cfg.seed, modern: condition === 'restored' })
      flowerPot(b, [innerW * 0.38, walkH, walkD * 0.62], { seed: cfg.seed })
    }
    if (condition === 'restored') planter(b, [innerW / 2 - 0.2, walkH, walkD - 0.5], { seed: cfg.seed, small: true })
    return
  }
  if (style === 'postwar' || (condition === 'aged' && cfg.storefront === 'closed')) {
    interior()
    rollingShutter(b, { width: innerW, height, y0: walkH + 0.05, z: -0.1, openRatio: cfg.storefront === 'closed' ? 0.15 : 0.85 })
  } else if (cfg.storefront === 'closed') {
    b.box('lattice', [innerW * 0.4, height * 0.55, 0.05], [0, walkH + height * 0.68, -0.1], { tint: woodTint })
    b.box('planks', [innerW * 0.4, height * 0.42, 0.06], [0, walkH + height * 0.21, -0.1], { tint: woodTint })
    for (const side of [-1, 1]) {
      b.box('planks', [innerW * 0.3, height, 0.07], [side * innerW * 0.35, walkH + height / 2, -0.13], { tint: woodTint })
    }
  } else {
    interior()
    for (const side of [-1, 1]) {
      b.box('lattice', [innerW * 0.18, height, 0.06], [side * (innerW / 2 - innerW * 0.09), walkH + height / 2, -0.12], { tint: woodTint })
    }
  }
  if (cfg.goods) buildGoods(b, cfg, rng, { w: innerW + 1, innerW, walkH, walkD })
  if (cfg.pottedPlants) {
    for (const side of [-1, 1]) pottedPlant(b, [side * (innerW / 2 - 0.1), walkH, walkD * 0.62], { seed: (cfg.seed ?? 1) + side })
  }
  if (condition === 'restored') planter(b, [innerW / 2 - 0.2, walkH, walkD - 0.5], { seed: cfg.seed, small: true })
}
