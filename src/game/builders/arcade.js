import { beginWeathering, finishWeathering } from './weathering.js'
import { CylinderGeometry, IcosahedronGeometry, Shape, SphereGeometry, TorusGeometry } from 'three'
import { STREET } from '../config.js'
import { createCurvedSlab } from './PartBuilder.js'
import { MATERIAL_TILE } from '../rendering/materials.js'
import { SHOP_SHELF_HEIGHTS } from '../rendering/shopGlow.js'
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
import { bench, cafeSet, flowerPot, jar, planter, pottedPlant, shade } from './props.js'
import { SHOP_TYPES, displayShopfront } from './shopDisplays.js'
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

export function buildArcadeBuilding(b, cfg, detail = null) {
  const weathering = beginWeathering(b, cfg)
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
  // 紅磚立面（酒樓年代的洋樓變化）：牆與騎樓柱都用紅磚，飾帶仍為灰泥
  const brickFacade = cfg.facade === 'brick'
  const wallMat = brickFacade ? 'brick' : cfg.wallMat ?? defaults.wallMat
  const wallTint = tint(brickFacade ? cfg.brickTint ?? '#ffffff' : cfg.wallTint ?? '#efe3c8')
  const trimTint = tint(cfg.trimTint ?? '#f6efe0')
  const shutterTint = tint(cfg.shutterTint ?? '#6d8a83')
  const columnMat = brickFacade ? 'brick' : cfg.columnMat ?? defaults.columnMat
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
      floorY: walkH,
      floorMaxZ: walkD,
    })
  }

  /* ── 側牆、後牆 ─────────────────────── */
  // 弧角（摩登年代街角的 Art Deco 樓）：該側樓上的牆角改成四分之一圓柱
  const cornerSide = cfg.roundCorner === 'left' ? -1 : cfg.roundCorner === 'right' ? 1 : 0
  const cornerR = cornerSide ? Math.min(1.0, w * 0.2) : 0
  for (const side of [-1, 1]) {
    const x = side * (w / 2 - sideT / 2)
    b.box(wallMat, [sideT, topY + 0.3, D], [x, (topY + 0.3) / 2, -D / 2], { tint: wallTint, grime: grime(0.14) })
    const cut = side === cornerSide ? cornerR : 0
    b.box(wallMat, [sideT, topY - groundH, walkD - 0.05 - cut], [x, (topY + groundH) / 2, (walkD - 0.05 - cut) / 2], { tint: wallTint })
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
  b.box(wallMat, [w - 0.02 - cornerR, topY - groundH + 0.02, wallT], [-cornerSide * cornerR / 2, (groundH + topY) / 2, front - wallT / 2], {
    tint: wallTint,
    grime: grime(0.1),
  })
  if (cornerSide) roundedCorner(b, { side: cornerSide, r: cornerR, w, groundH, topY, front, wallMat, wallTint, trimTint, floors, upperH, parapetH: cfg.parapetHeight ?? 1.5 })
  const signY = groundH + 0.52
  if (style === 'baroque') {
    baroqueFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, shutterTint, litChance, condition })
  } else if (style === 'deco') {
    decoFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, condition, cornerSide, cornerR })
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
      y: groundH + Math.min(2.4, (topY - groundH) * 0.55) + (cfg.hangingLift ?? 0),
      z: front,
      height: Math.min(2.6, (topY - groundH) * 0.8),
      width: 0.52,
      boardTint: cfg.hangingSign.style === 'vertical' ? '#f5f0e2' : '#5d4231',
    })
  }

  // 街底的視覺焦點：女兒牆上的圓鐘與屋頂旗桿
  if (cfg.focal) focalClock(b, { topY, front, parapetH: cfg.parapetHeight ?? defaults.parapetH, trimTint })

  /* ── 燈籠、燈火 ─────────────────────── */
  if (cfg.lanterns) {
    const scale = cfg.lanternScale ?? 1
    const drop = cfg.lanternDrop ?? 0
    const xs = innerW > 3.4 && cfg.lanternCount !== 1 ? [-innerW * 0.3, innerW * 0.3] : [cfg.lanternCount === 1 ? innerW * 0.18 : 0]
    xs.forEach((x, i) => {
      // 兩盞時高度略有差異
      const cord = 0.3 + drop + i * drop * 0.4
      b.box('dark', [0.016, cord, 0.016], [x, groundH - cord / 2, walkD - 0.5], { tint: '#3a2f27' })
      b.addLantern(x, groundH - 0.45 - cord, walkD - 0.5, { scale })
    })
  }
  /* ── 布幡：掛在騎樓柱外側，垂直於立面 ── */
  if (cfg.banner) {
    const side = cfg.hangingSign?.side === 'right' ? -1 : 1
    const bx = side * (w / 2 - 0.22)
    b.cylinder('bamboo', 0.025, 0.025, 0.62, 5, [bx, groundH - 0.12, walkD + 0.24], { rotation: [Math.PI / 2, 0, 0], tint: '#d8c48e' })
    b.addBanner({ text: cfg.banner.text, style: 'cloth', width: 0.44, height: 1.25, position: [bx, groundH - 0.78, walkD + 0.28], rotationY: Math.PI / 2 })
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

  // 灰泥牆的風化、海報與鐵窗花（只有一般洋樓）：樓上立面、一樓牆柱與騎樓柱
  if (weathering) {
    const pillarYs = { y0: 0.4, y1: groundH - 0.12 }
    finishWeathering(b, detail, cfg, weathering, {
      surfaces: [
        { x0: -w / 2 + 0.05 + (cornerSide < 0 ? cornerR : 0), x1: w / 2 - 0.05 - (cornerSide > 0 ? cornerR : 0), y0: groundH + 0.3, y1: topY - 0.15, z: front },
        ...[-1, 1].map((side) => ({ x0: side * (w / 2 - 0.25) - 0.25, x1: side * (w / 2 - 0.25) + 0.25, ...pillarYs, z: 0 })),
      ],
      columns: [-1, 1].map((side) => ({ x: side * (w / 2 - colW / 2 - 0.02), width: colW, y0: 0.5, y1: groundH - 0.35, z: walkD - 0.02, round: style === 'deco' })),
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
  const brick = cfg.facade === 'brick'
  // 酒樓年代：沒點燈的窗映著暮色（只在這個年代設定 ornate）
  const glass = cfg.ornate ? { glassTint: '#4a5270' } : {}
  // 壁柱（紅磚立面改以兩端的灰泥隅石收邊）
  for (let i = 0; i <= count; i++) {
    if (brick && (i === 0 || i === count)) continue
    const x = -w / 2 + 0.4 + i * spacing
    pilaster(b, { x, y0: groundH + 0.25, y1: topY, z: front, width: 0.28, tint: trimTint })
    if (cfg.ornate) {
      for (let f = 1; f < floors; f++) {
        const ry = groundH + (f - 1) * upperH + upperH * 0.6
        b.cylinder('stucco', 0.11, 0.11, 0.06, 12, [x, ry, front + 0.12], { rotation: [Math.PI / 2, 0, 0], tint: shade(trimTint, 0.95) })
      }
    }
  }
  if (brick) {
    for (const side of [-1, 1]) {
      for (let y = groundH + 0.3, k = 0; y < topY - 0.3; y += 0.44, k++) {
        const qw = k % 2 ? 0.3 : 0.5
        b.box('stucco', [qw, 0.34, 0.07], [side * (w / 2 - qw / 2), y + 0.17, front + 0.035], { tint: trimTint })
      }
    }
  }
  for (let f = 1; f < floors; f++) {
    const fy = groundH + (f - 1) * upperH
    cornice(b, { y: f === 1 ? fy - 0.02 : fy + 0.18, width: w, z: front, tint: trimTint })
    const windowStyle = cfg.windowStyles?.[f - 1] ?? 'arch'
    for (let i = 0; i < count; i++) {
      const x = -w / 2 + 0.4 + spacing * (i + 0.5)
      const lit = rng() < litChance
      if (windowStyle === 'rect' || windowStyle === 'segment') {
        rectWindow(b, { x, y: fy + 1.55, width: winW, height: 1.3, z: front, lit, frameTint: '#5b4636', barTint: '#c9ad8a', style: brick ? 'panes' : 'bars', ...glass })
        if (windowStyle === 'segment') {
          // 弧形窗楣（紅磚洋樓常見）
          b.extrude('stucco', segmentHood(winW + 0.32, 0.3), 0.12, { position: [x, fy + 2.3, front], tint: trimTint })
          b.box('stucco', [0.16, 0.24, 0.16], [x, fy + 2.44, front + 0.06], { tint: shade(trimTint, 0.95) })
        } else if (cfg.ornate) {
          b.box('stucco', [winW + 0.36, 0.12, 0.14], [x, fy + 2.36, front + 0.07], { tint: trimTint })
        }
        if (cfg.ornate) {
          for (const side of [-1, 1]) b.box('stucco', [0.09, 0.18, 0.12], [x + side * (winW / 2 + 0.12), fy + 0.72, front + 0.07], { tint: shade(trimTint, 0.93) })
        }
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
          ...glass,
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
  if (cfg.parapet === 'balustrade') {
    balustradeParapet(b, { y: topY + 0.1, width: w - 0.02, z: front, wallTint, trimTint, count })
    return
  }
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

/** 弧形窗楣的輪廓（寬 width、拱高 rise） */
function segmentHood(width, rise) {
  const shape = new Shape()
  const half = width / 2
  shape.moveTo(-half, 0)
  shape.lineTo(half, 0)
  shape.quadraticCurveTo(0, rise * 2, -half, 0)
  shape.closePath()
  return shape
}

/** 欄杆式女兒牆：紅磚柱墩、灰泥欄杆與中央略高的牆垛 */
function balustradeParapet(b, { y, width, z, wallTint, trimTint, count }) {
  const h = 0.95
  const posts = [-width / 2 + 0.2, width / 2 - 0.2]
  if (count >= 2) posts.push(0)
  for (const x of posts) {
    const tall = x === 0
    const ph = h + (tall ? 0.55 : 0.18)
    b.box('brick', [tall ? 0.9 : 0.4, ph, 0.4], [x, y + ph / 2, z - 0.2], { tint: wallTint })
    b.box('stucco', [tall ? 1.02 : 0.5, 0.1, 0.5], [x, y + ph + 0.05, z - 0.2], { tint: trimTint })
    if (!tall) b.add('plain', new SphereGeometry(0.14, 10, 8), { position: [x, y + ph + 0.24, z - 0.2], tint: trimTint })
  }
  b.box('stucco', [width, 0.14, 0.3], [0, y + 0.07, z - 0.18], { tint: trimTint })
  b.box('stucco', [width, 0.09, 0.34], [0, y + h - 0.05, z - 0.18], { tint: trimTint })
  const n = Math.max(4, Math.round(width / 0.22))
  for (let i = 0; i < n; i++) {
    const x = -width / 2 + (i + 0.5) * (width / n)
    if (posts.some((p) => Math.abs(p - x) < (p === 0 ? 0.5 : 0.24))) continue
    b.box('stucco', [0.08, h - 0.24, 0.08], [x, y + h / 2, z - 0.18], { tint: trimTint })
  }
}

/* ═══════════ Art Deco 立面 ═══════════ */
function decoFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, cornerSide = 0, cornerR = 0 }) {
  if (cfg.decoDetail) {
    decoDetailFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, cornerSide, cornerR })
    return
  }
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
  // 摩登年代：依店種陳列的櫥窗店面（西餐廳、喫茶、洋服、藥局、茶行、布行）
  if (cfg.shopfront === 'display') {
    displayShopfront(b, cfg, { innerW, openingH, style, darkWood })
    if (style === 'deco' && cfg.awningTint !== null) {
      const tint = cfg.awningTint ?? SHOP_TYPES[cfg.shopType]?.awning ?? '#7a2e33'
      awning(b, { y: openingH + 0.25, z: 0.02, width: innerW + 0.2, depth: 1.0, drop: 0.45, tint })
    }
    if (cfg.arcadeBench) bench(b, [innerW / 2 - 0.9, walkH, walkD * 0.7], { rotationY: 0, length: 1.2 })
    if (cfg.cafe) cafeSet(b, [-innerW * 0.25, walkH, walkD * 0.62], { seed: cfg.seed })
    return
  }
  const height = openingH - walkH - 0.05
  const interior = () => {
    const roomD = 2.8
    b.box('planks', [innerW, 0.04, roomD], [0, walkH + 0.02, -roomD / 2 - 0.12], { tint: '#6b5643' })
    // 後牆：中間亮、四周與上方暗、層架下有陰影（店內透光，rendering/shopGlow.js）
    b.shopGlow(b.box('windowLit', [innerW, openingH, 0.1], [0, openingH / 2, -roomD - 0.12], { tint: '#4a3a2e' }), 'back', { floorOffset: walkH })
    b.box('dark', [innerW, 0.1, roomD], [0, openingH + 0.05, -roomD / 2 - 0.12], { tint: '#2c241e' })
    for (const shelfH of SHOP_SHELF_HEIGHTS) {
      const sy = walkH + shelfH
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

/* ═══════════ 摩登年代：細緻的 Art Deco 立面 ═══════════ */

const STEEL = '#2e2b27'

/** 鋼框窗：細框、一道直櫺、三道水平玻璃條（Art Deco 的特徵），外圍灰泥窗框與階梯狀窗楣 */
function steelWindow(b, { x, y, width, height, z, lit, surround, curtain, glassTint = '#4a5270' }) {
  const glass = b.box(lit ? 'windowLit' : 'dark', [width, height, 0.04], [x, y, z - 0.03], { tint: lit ? '#6b4b33' : glassTint })
  if (lit) b.shopGlow(glass, 'room')
  const f = 0.045
  for (const dy of [-1, 1]) b.box('plain', [width + f * 2, f, 0.06], [x, y + dy * (height / 2 + f / 2), z], { tint: STEEL })
  for (const dx of [-1, 1]) b.box('plain', [f, height, 0.06], [x + dx * (width / 2 + f / 2), y, z], { tint: STEEL })
  b.box('plain', [0.03, height, 0.05], [x, y, z], { tint: STEEL })
  for (const t of [-0.25, 0.08, 0.32]) b.box('plain', [width, 0.025, 0.05], [x, y + height * t, z], { tint: STEEL })
  // 窗內的窗簾（住家）
  if (curtain) {
    for (const dx of [-1, 1]) b.box('cloth', [width * 0.22, height * 0.85, 0.02], [x + dx * width * 0.36, y + height * 0.04, z - 0.02], { tint: curtain })
  }
  // 灰泥窗框、階梯狀窗楣、窗臺
  b.box('stucco', [width + 0.3, 0.1, 0.12], [x, y + height / 2 + 0.12, z + 0.04], { tint: surround })
  b.box('stucco', [width + 0.14, 0.08, 0.1], [x, y + height / 2 + 0.21, z + 0.04], { tint: surround })
  b.box('stucco', [width + 0.26, 0.07, 0.18], [x, y - height / 2 - 0.07, z + 0.07], { tint: surround })
}

/** 幾何鐵欄杆：三道橫桿、細直桿與中央的圓環 */
function decoRailing(b, { x, y, width, z, tint }) {
  const h = 0.9
  b.box('stucco', [width, 0.14, 0.62], [x, y, z + 0.31], { tint: shade(tint, 1.4) })
  b.box('stucco', [width + 0.04, 0.05, 0.66], [x, y - 0.09, z + 0.31], { tint: shade(tint, 1.3) })
  const rz = z + 0.58
  for (const t of [0.22, 0.52, 0.86]) b.box('plain', [width, 0.03, 0.03], [x, y + 0.07 + h * t, rz], { tint: STEEL })
  const n = Math.max(3, Math.round(width / 0.32))
  for (let i = 0; i <= n; i++) b.box('plain', [0.025, h, 0.025], [x - width / 2 + (i * width) / n, y + 0.07 + h / 2, rz], { tint: STEEL })
  b.add('plain', new TorusGeometry(0.17, 0.018, 5, 16), { position: [x, y + 0.07 + h * 0.54, rz], tint: STEEL })
}

function decoDetailFacade(b, { cfg, rng, w, floors, groundH, upperH, topY, front, wallTint, trimTint, litChance, cornerSide, cornerR }) {
  const accent = trimTint
  const cream = wallTint
  const surround = shade(cream, 1.04)
  const style = cfg.decoDetail
  // 可用寬度（弧角那一側讓出空間）
  const usable = w - cornerR
  const x0 = -w / 2 + (cornerSide < 0 ? cornerR : 0)
  const count = usable >= 6 ? 3 : 2
  const bay = (usable - 1.0) / count
  const winW = Math.min(1.25, bay - 0.45)
  const curtains = ['#e8d9c0', '#d9c7c9', '#cfd8cc', '#e6dcc6']

  for (let f = 1; f < floors; f++) {
    const fy = groundH + (f - 1) * upperH
    // 水平飾帶（樓層線）
    b.box('stucco', [usable, 0.14, 0.1], [x0 + usable / 2, f === 1 ? fy + 0.05 : fy + 0.18, front + 0.05], { tint: accent })
    for (let i = 0; i < count; i++) {
      const x = x0 + 0.5 + bay * (i + 0.5)
      const lit = rng() < litChance
      steelWindow(b, { x, y: fy + 1.6, width: winW, height: 1.4, z: front, lit, surround, curtain: rng() < 0.6 ? pick(rng, curtains) : null })
      if (lit) b.addGlow(x, fy + 1.6, front + 0.3, 1.4, '#ffc98a')
      if (rng() < 0.25) flowerPot(b, [x + winW * 0.3, fy + 0.86, front + 0.12], { seed: Math.floor(rng() * 1000) })
    }
    // 流線型：窗間的三道細水平溝槽
    if (style === 'bands') {
      for (let i = 0; i <= count; i++) {
        const x = x0 + 0.5 + bay * i
        for (let k = 0; k < 3; k++) b.box('stucco', [0.34, 0.035, 0.05], [x, fy + 1.25 + k * 0.32, front + 0.025], { tint: accent })
      }
    }
  }
  // 垂直線條：鰭片式的直條壁柱貫穿樓上各層
  if (style === 'fins' || style === 'stepped') {
    for (let i = 0; i <= count; i++) {
      const x = x0 + 0.5 + bay * i
      const center = i === Math.floor(count / 2) || i === Math.ceil(count / 2)
      const h = topY - groundH + (style === 'fins' && center ? 1.1 : 0.35)
      b.box('stucco', [0.16, h, 0.2], [x, groundH + h / 2, front + 0.1], { tint: center ? accent : surround })
      if (style === 'fins') for (const dx of [-0.11, 0.11]) b.box('stucco', [0.04, h - 0.4, 0.12], [x + dx, groundH + (h - 0.4) / 2 + 0.2, front + 0.06], { tint: surround })
    }
  }
  // 二樓中央的幾何鐵欄杆陽臺
  if (style !== 'fins' && floors >= 3) {
    const bx = x0 + 0.5 + bay * (Math.floor(count / 2) + (count % 2 ? 0.5 : 0))
    decoRailing(b, { x: bx, y: groundH + upperH + 0.22, width: Math.min(bay * 1.2, 2.2), z: front, tint: accent })
  }
  // 簷下的幾何收邊：一排菱形
  if (style === 'stepped') {
    for (let x = x0 + 0.3; x < x0 + usable - 0.2; x += 0.42) {
      b.box('stucco', [0.16, 0.16, 0.05], [x, topY - 0.32, front + 0.03], { rotation: [0, 0, Math.PI / 4], tint: accent })
    }
  }
  // 速度線
  for (let k = 0; k < 3; k++) b.box('stucco', [usable * 0.92, 0.05, 0.06], [x0 + usable / 2, topY - 0.55 - k * 0.14, front + 0.03], { tint: accent })
  const plaqueText = cfg.parapetText ?? (cfg.sign?.placement === 'parapet' ? cfg.sign.text : null)
  b.group([-cornerSide * cornerR / 2, 0, 0], 0, () => {
    parapet(b, {
      y: topY,
      width: usable - 0.02,
      height: cfg.parapetHeight ?? 1.5,
      z: front,
      style: 'deco',
      tint: cream,
      trimTint: shade(cream, 1.02),
      finials: false,
      plaque: plaqueText ? { text: plaqueText, style: cfg.sign?.style ?? 'deco' } : null,
    })
    b.box('stucco', [usable, 0.08, 0.1], [0, topY + 0.62, front + 0.05], { tint: accent })
  })
}

/** 街角的弧形牆角：四分之一圓柱的牆面、每層一道環形飾帶、頂端圓弧女兒牆 */
function roundedCorner(b, { side, r, w, groundH, topY, front, wallMat, wallTint, trimTint, floors, upperH, parapetH }) {
  const cx = side * (w / 2 - r)
  const cz = front - r
  const thetaStart = side > 0 ? 0 : Math.PI * 1.5
  const h = topY - groundH
  b.add(wallMat === 'brick' ? 'brick' : 'stucco', new CylinderGeometry(r, r, h, 14, 1, true, thetaStart, Math.PI / 2), {
    position: [cx, groundH + h / 2, cz],
    tint: wallTint,
  })
  for (let f = 1; f <= floors; f++) {
    const y = f === floors ? topY - 0.1 : groundH + (f - 1) * upperH + (f === 1 ? 0.05 : 0.18)
    b.add('stucco', new TorusGeometry(r + 0.04, 0.06, 4, 10, Math.PI / 2), {
      position: [cx, y, cz],
      rotation: [Math.PI / 2, 0, side > 0 ? 0 : Math.PI / 2],
      tint: trimTint,
    })
  }
  // 弧面上的三道速度線
  for (let k = 0; k < 3; k++) {
    b.add('stucco', new TorusGeometry(r + 0.025, 0.025, 3, 10, Math.PI / 2), {
      position: [cx, topY - 0.55 - k * 0.14, cz],
      rotation: [Math.PI / 2, 0, side > 0 ? 0 : Math.PI / 2],
      tint: trimTint,
    })
  }
  b.add('stucco', new CylinderGeometry(r, r, parapetH * 0.4, 14, 1, true, thetaStart, Math.PI / 2), {
    position: [cx, topY + parapetH * 0.2, cz],
    tint: wallTint,
  })
}

/** 街底建築的圓鐘與旗桿（遠景的視覺焦點） */
function focalClock(b, { topY, front, parapetH, trimTint }) {
  const y = topY + parapetH * 0.62
  const z = front + 0.06
  b.cylinder('stucco', 0.62, 0.62, 0.12, 24, [0, y, z - 0.02], { rotation: [Math.PI / 2, 0, 0], tint: shade(trimTint, 0.95) })
  b.cylinder('plain', 0.5, 0.5, 0.04, 24, [0, y, z + 0.05], { rotation: [Math.PI / 2, 0, 0], tint: '#f6f1e4' })
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    b.box('plain', [0.03, i % 3 === 0 ? 0.11 : 0.06, 0.02], [Math.sin(a) * 0.41, y + Math.cos(a) * 0.41, z + 0.08], { rotation: [0, 0, -a], tint: '#2b2622' })
  }
  b.box('plain', [0.035, 0.3, 0.02], [0.05, y + 0.13, z + 0.09], { rotation: [0, 0, -0.35], tint: '#2b2622' })
  b.box('plain', [0.03, 0.4, 0.02], [-0.12, y + 0.08, z + 0.1], { rotation: [0, 0, 1.2], tint: '#2b2622' })
  b.addGlow(0, y, z + 0.2, 1.4, '#fff1d6')
  // 旗桿與小旗
  b.cylinder('plain', 0.035, 0.045, 3.2, 8, [0, topY + parapetH + 1.6, front - 0.6], { tint: '#d8d2c4' })
  b.add('plain', new SphereGeometry(0.07, 8, 6), { position: [0, topY + parapetH + 3.25, front - 0.6], tint: '#c9a24a' })
  b.box('cloth', [0.9, 0.55, 0.02], [0.47, topY + parapetH + 2.85, front - 0.6], { rotation: [0, 0.25, 0], tint: '#e9e2d0' })
}
