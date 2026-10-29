import { STREET } from '../config.js'
import { createCurvedSlab } from './PartBuilder.js'
import { MATERIAL_TILE } from '../rendering/materials.js'
import { createRng, pick } from '../utils/random.js'
import {
  bambooPoles,
  basket,
  barrel,
  carryingPole,
  crate,
  displayTable,
  goodsPile,
  jar,
  pastryTray,
  planter,
  riceBin,
  roeTray,
  sack,
  shade,
  teaChest,
} from './props.js'
import { glassStorefront, rectWindow, rollingShutter, signBoard } from './facade.js'
import { bracketShape, gableShape, ridgeShape } from './shapes.js'
import { conditionGrime, conditionTint } from './condition.js'
import { beginWeathering, finishWeathering } from './weathering.js'

/**
 * 閩南式街屋產生器（店家與背景建築共用）
 *
 * 本地座標：立面位於 z = 0，建築往 -z 延伸，街道在 +z 方向；x 為面寬方向（置中）。
 * 幾何直接寫入 PartBuilder；招牌、燈籠、布幡、燈火等登記在 PartBuilder 上另外渲染。
 *
 * 主要構件：紅磚／灰泥立面、木門板、雕花門扇、木格窗、亭仔腳屋簷與木柱、
 * 兩端起翹的屋瓦、山牆（人字或馬背）、屋脊（平脊、翹脊或燕尾脊）、招牌與燈籠。
 *
 * condition：new 新建｜mature 使用多年｜aged 老舊（加鐵皮雨遮）｜restored 修復（可換成玻璃店面）
 */
export function buildShophouse(b, cfg, detail = null) {
  const rng = createRng(cfg.seed ?? 7)
  const weathering = beginWeathering(b, cfg)
  const condition = cfg.condition ?? 'new'
  const tint = (hex) => conditionTint(hex, condition)
  const grime = (value) => conditionGrime(value, condition)
  const w = cfg.width
  const D = cfg.depth ?? 11
  const floors = cfg.floors ?? 1
  const groundH = cfg.groundHeight ?? 3.3
  const upperH = 3.0
  const wallH = floors === 2 ? groundH + upperH : groundH + 1.35
  const rise = Math.min(2.8, D * 0.23)
  const ridgeZ = -D / 2
  const ridgeY = wallH + rise
  const gableT = 0.28
  const wallT = 0.3
  const pillarW = 0.5
  const innerW = w - pillarW * 2
  const walkD = STREET.walkwayDepth
  const walkH = STREET.walkwayHeight
  const openingH = Math.min(2.62, groundH - 0.6)

  const groundMat = cfg.ground ?? 'plaster'
  const upperMat = cfg.upper ?? groundMat
  const plasterTint = tint(cfg.plasterTint ?? '#efe3c8')
  const brickTint = tint(cfg.brickTint ?? '#ffffff')
  const tintFor = (mat) => (mat === 'plaster' ? plasterTint : brickTint)
  const woodTint = tint(cfg.woodTint ?? '#d2bb9c')
  const roofTint = tint(cfg.roofTint ?? '#ffffff')
  const darkWood = shade(woodTint, 0.62)
  const textLanterns = []

  /* ── 簷下步道 ─────────────────────────── */
  if (cfg.walkway !== false) {
    b.box('stone', [w, walkH, walkD], [0, walkH / 2, walkD / 2], { tint: condition === 'restored' ? '#e4ddd0' : '#dcd5c6' })
    b.box('stone', [w, walkH + 0.025, 0.22], [0, (walkH + 0.025) / 2, walkD - 0.11], { tint: '#b3a995' })
  }

  /* ── 山牆 ─────────────────────────────── */
  const gShape = gableShape(D, wallH, ridgeY, cfg.gable ?? 'gable')
  for (const side of [-1, 1]) {
    const x = side < 0 ? -w / 2 : w / 2 - gableT
    b.extrude(groundMat, gShape, gableT, {
      position: [x, 0, 0],
      rotation: [0, Math.PI / 2, 0],
      tint: tintFor(groundMat),
      grime: grime(0.16),
    })
  }

  /* ── 一樓立面 ─────────────────────────── */
  for (const side of [-1, 1]) {
    const x = side * (w / 2 - pillarW / 2)
    b.box(groundMat, [pillarW, groundH, wallT + 0.06], [x, groundH / 2, -wallT / 2 + 0.03], {
      tint: tintFor(groundMat),
      grime: grime(0.22),
    })
    b.box('stone', [pillarW + 0.06, 0.32, wallT + 0.12], [x, 0.16, -wallT / 2 + 0.06], { tint: '#cfc6b4' })
  }
  b.box('wood', [innerW + 0.12, 0.24, wallT + 0.06], [0, openingH + 0.12, -wallT / 2 + 0.03], { tint: darkWood })
  const aboveH = groundH - openingH - 0.24
  if (aboveH > 0.02) {
    b.box(groundMat, [innerW, aboveH, wallT], [0, openingH + 0.24 + aboveH / 2, -wallT / 2], {
      tint: tintFor(groundMat),
    })
  }
  b.box('stone', [innerW, 0.17, 0.46], [0, walkH + 0.01, -0.14], { tint: '#c7bead' })
  buildStorefront(b, cfg, rng, { innerW, openingH, walkH, woodTint, darkWood, condition })

  // 門邊紅紙對聯
  if (cfg.couplets && condition !== 'aged') {
    for (const side of [-1, 1]) {
      b.box('plain', [0.2, 1.25, 0.012], [side * (w / 2 - pillarW / 2), walkH + 1.25, 0.04], { tint: '#b04a35' })
    }
  }

  /* ── 二樓或一樓上方牆帶 ───────────────── */
  const litChance = cfg.litWindows ?? 0.3
  if (floors === 2) {
    b.box('wood', [w - 0.06, 0.18, 0.2], [0, groundH + 0.04, 0.04], { tint: darkWood })
    b.box(upperMat, [w - gableT * 2, upperH, wallT], [0, groundH + upperH / 2, -wallT / 2 - 0.04], {
      tint: tintFor(upperMat),
      grime: grime(0.08),
    })
    const count = cfg.windows ?? (w >= 5.6 ? 2 : 1)
    const winW = Math.min(1.25, (w - 1.8) / count - 0.35)
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 0 : -w * 0.22 + (i * w * 0.44) / (count - 1)
      const lit = rng() < litChance
      rectWindow(b, {
        x,
        y: groundH + 1.86,
        width: winW,
        height: 1.24,
        lit,
        frameTint: darkWood,
        barTint: woodTint,
        shutters: cfg.shutters ?? rng() < 0.5,
        shutterTint: shade(woodTint, 0.9),
      })
      if (lit) b.addGlow(x, groundH + 1.86, 0.3, 1.5, '#ffb468')
      if (condition === 'aged' && rng() < 0.45) laundryPole(b, x, groundH + 2.75, winW, rng)
    }
    b.box('wood', [w - gableT * 2, 0.16, 0.12], [0, wallH - 0.1, 0.02], { tint: darkWood })
  } else {
    b.box(upperMat, [w - gableT * 2, wallH - groundH, wallT], [0, groundH + (wallH - groundH) / 2, -wallT / 2 - 0.03], {
      tint: tintFor(upperMat),
    })
    if (!cfg.sign) {
      for (const side of [-1, 1]) {
        const x = side * w * 0.2
        b.box('dark', [0.62, 0.24, 0.04], [x, groundH + 0.55, 0.0], { tint: '#3a2f27' })
        b.box('wood', [0.74, 0.06, 0.08], [x, groundH + 0.69, 0.02], { tint: darkWood })
        b.box('wood', [0.74, 0.06, 0.08], [x, groundH + 0.41, 0.02], { tint: darkWood })
        for (let k = -1; k <= 1; k++) b.box('wood', [0.04, 0.24, 0.05], [x + k * 0.16, groundH + 0.55, 0.02], { tint: darkWood })
      }
    }
  }

  /* ── 亭仔腳屋簷、木柱、雀替 ───────────── */
  const peY0 = groundH + 0.06
  const peDepth = walkD + 0.32
  const peDrop = 0.6
  const peAngle = Math.atan2(peDrop, peDepth)
  const peLen = Math.hypot(peDrop, peDepth)
  const roofUnder = (z) => peY0 - (peDrop * z) / peDepth - 0.06
  b.box('roof', [w + 0.02, 0.1, peLen + 0.05], [0, peY0 - peDrop / 2 + 0.03, peDepth / 2], {
    rotation: [peAngle, 0, 0],
    tint: roofTint,
  })
  const frontY = peY0 - peDrop
  b.box('wood', [w + 0.02, 0.13, 0.05], [0, frontY - 0.03, peDepth + 0.01], { tint: darkWood })
  for (let x = -w / 2 + 0.14; x <= w / 2 - 0.1; x += 0.25) {
    b.cylinder('roof', 0.058, 0.058, 0.1, 6, [x, frontY + 0.06, peDepth + 0.03], {
      rotation: [Math.PI / 2 + peAngle, 0, 0],
      tint: shade(roofTint, 0.9),
    })
  }
  const postZ = walkD - 0.28
  const beamY = roofUnder(postZ) - 0.1
  b.box('wood', [w, 0.18, 0.16], [0, beamY, postZ], { tint: darkWood })
  for (const side of [-1, 1]) {
    const px = side * (w / 2 - 0.36)
    const postH = beamY - 0.09 - walkH
    b.box('stone', [0.34, 0.2, 0.34], [px, walkH + 0.1, postZ], { tint: '#c9c0ae' })
    b.box('wood', [0.19, postH, 0.19], [px, walkH + postH / 2, postZ], { tint: woodTint, grime: grime(0.25) })
    b.extrude('wood', bracketShape(0.44), 0.06, {
      position: [px - side * 0.095, beamY - 0.09, postZ + (side > 0 ? 0.03 : -0.03)],
      rotation: [0, side > 0 ? Math.PI : 0, 0],
      tint: darkWood,
    })
  }
  if (cfg.tinAwning) tinAwning(b, { w, y: frontY + 0.12, z: peDepth - 0.1 })

  /* ── 主屋頂（兩端起翹） ───────────────── */
  const overhang = 0.5
  const slope = rise / -ridgeZ
  const eaveY = wallH - overhang * slope
  const roofAngle = Math.atan(slope)
  const roofW = w - gableT * 2 + 0.03
  const slabLen = Math.hypot(overhang - ridgeZ, ridgeY - eaveY) + 0.12
  const upturn = cfg.roofUpturn ?? 0.2
  const tile = MATERIAL_TILE.roof
  b.add('roof', createCurvedSlab(roofW, 0.14, slabLen, upturn, tile), {
    position: [0, (eaveY + ridgeY) / 2 + 0.07, (overhang + ridgeZ) / 2],
    rotation: [roofAngle, 0, 0],
    tint: roofTint,
  })
  b.add('roof', createCurvedSlab(roofW, 0.14, slabLen, upturn, tile), {
    position: [0, (eaveY + ridgeY) / 2 + 0.07, (ridgeZ - D - overhang) / 2],
    rotation: [-roofAngle, 0, 0],
    tint: shade(roofTint, 0.94),
  })
  b.box('wood', [roofW, 0.15, 0.06], [0, eaveY - 0.02, overhang + 0.02], {
    rotation: [roofAngle, 0, 0],
    tint: darkWood,
  })
  const ridgeTint = shade(roofTint, 0.86)
  b.extrude('roof', ridgeShape(roofW + 0.2, cfg.ridge ?? 'plain'), 0.36, {
    position: [0, ridgeY - 0.06, ridgeZ - 0.18],
    tint: ridgeTint,
  })
  b.box(groundMat, [w - gableT * 2, wallH, wallT], [0, wallH / 2, -D + wallT / 2], { tint: tintFor(groundMat) })

  /* ── 招牌 ─────────────────────────────── */
  if (cfg.sign) {
    const text = cfg.sign.text
    const sw = Math.min(innerW * 0.88, 0.95 + text.length * 0.62)
    signBoard(b, { text, style: cfg.sign.style ?? 'lacquer', y: groundH + 0.6, z: 0.01, width: sw, height: 0.6, frameTint: '#5d4231' })
  }
  if (cfg.hangingSign) {
    const side = cfg.hangingSign.side === 'right' ? 1 : -1
    const hx = side * (w / 2 - 0.36)
    const hz = postZ - 0.48
    const hTop = roofUnder(hz) - 0.04
    const hH = 1.3
    const hW = 0.46
    const hy = hTop - 0.16 - hH / 2
    b.box('wood', [0.06, hH + 0.1, hW + 0.08], [hx, hy, hz], { tint: '#5d4231' })
    b.box('dark', [0.02, 0.16, 0.02], [hx, hTop - 0.08, hz - hW / 2 + 0.06], { tint: '#3a2f27' })
    b.box('dark', [0.02, 0.16, 0.02], [hx, hTop - 0.08, hz + hW / 2 - 0.06], { tint: '#3a2f27' })
    const sign = { text: cfg.hangingSign.text, style: cfg.hangingSign.style ?? 'wood', vertical: true, width: hW, height: hH }
    b.addSign({ ...sign, position: [hx + 0.034, hy, hz], rotationY: Math.PI / 2 })
    b.addSign({ ...sign, position: [hx - 0.034, hy, hz], rotationY: -Math.PI / 2 })
  }

  /* ── 布幡 ─────────────────────────────── */
  if (cfg.banner) {
    const side = cfg.hangingSign?.side === 'right' ? -1 : 1
    const bx = side * (w / 2 - 0.36)
    b.cylinder('bamboo', 0.03, 0.03, 1.1, 5, [bx, beamY + 0.05, postZ + 0.45], { rotation: [Math.PI / 2, 0, 0], tint: '#d8c48e' })
    b.addBanner({ text: cfg.banner.text, style: 'cloth', width: 0.5, height: 1.45, position: [bx, beamY - 0.02, postZ + 0.75], rotationY: Math.PI / 2 })
  }

  /* ── 燈籠 ─────────────────────────────── */
  if (cfg.lanterns) {
    const xs = innerW > 3.4 && cfg.lanternCount !== 1 ? [-innerW * 0.34, innerW * 0.34] : [cfg.lanternCount === 1 ? -innerW * 0.2 : 0]
    const scale = cfg.lanternScale ?? 1
    const drop = cfg.lanternDrop ?? 0
    for (const [i, x] of xs.entries()) {
      // 燈籠大小與吊掛高度依店家而異（只有酒樓年代設定）
      const cord = 0.26 + drop * (i ? 0.6 : 1)
      const ly = beamY - 0.4 - cord
      b.box('dark', [0.016, cord, 0.016], [x, beamY - 0.09 - cord / 2, postZ], { tint: '#3a2f27' })
      if (cfg.lanterns.text) {
        const p = b.transformPoint(x, ly, postZ)
        textLanterns.push({ position: [p.x, p.y, p.z], rotationY: b.worldRotationY(), text: cfg.lanterns.text })
        b.addGlow(x, ly, postZ, 1.5, '#ff9a5c', 1)
      } else {
        b.addLantern(x, ly, postZ, { scale })
      }
    }
  }

  /* ── 店前擺設 ─────────────────────────── */
  if (cfg.storefront !== 'closed') b.addPool(0, walkD * 0.5, Math.min(2.4, w * 0.35), '#ffb468', walkH + 0.02)
  if (cfg.display) buildDisplay(b, cfg.display, { innerW, walkH, walkD })
  if (cfg.goods) buildGoods(b, cfg, rng, { w, innerW, walkH, walkD })
  if (condition === 'restored' && cfg.planters !== false) {
    planter(b, [w / 2 - 0.6, walkH, walkD - 0.55], { seed: cfg.seed })
    if (w > 5) planter(b, [-w / 2 + 0.6, walkH, walkD - 0.55], { seed: (cfg.seed ?? 1) + 7, small: true })
  }

  // 灰泥牆的風化、海報與鐵窗花（只有一般街屋）：樓上牆面與一樓兩側的牆柱
  if (weathering) {
    const upperFront = floors === 2 ? -0.04 : -0.03
    const pillarYs = { y0: 0.4, y1: groundH - 0.12 }
    finishWeathering(b, detail, cfg, weathering, {
      surfaces: [
        { x0: -w / 2 + gableT, x1: w / 2 - gableT, y0: groundH + (floors === 2 ? 0.24 : 0.16), y1: wallH - 0.2, z: upperFront },
        ...[-1, 1].map((side) => ({ x0: side * (w / 2 - pillarW / 2) - pillarW / 2, x1: side * (w / 2 - pillarW / 2) + pillarW / 2, ...pillarYs, z: 0.06 })),
      ],
      columns: [-1, 1].map((side) => ({ x: side * (w / 2 - pillarW / 2), width: pillarW, ...pillarYs, z: 0.06 })),
    })
  }

  // 鏡頭遮擋：建築本體＋簷下屋頂（只取步道正上方，避免沿街邊行走時鏡頭被拉近）；
  // 可以走進去的店家（walkIn）不能是一整個實心方塊，改由該店家的建築產生器分成牆面與樓板
  if (!cfg.walkIn) b.addBlocker(-w / 2, w / 2, 0, ridgeY + 0.4, -D, 0)
  b.addBlocker(-w / 2, w / 2, groundH - 0.65, groundH + 0.3, 0, walkD - 0.1)

  return {
    textLanterns,
    groundHeight: groundH,
    wallHeight: wallH,
    ridgeHeight: ridgeY,
    beamY,
    postZ,
  }
}

/* ── 鐵皮雨遮（戰後加建） ───────────────── */
function tinAwning(b, { w, y, z }) {
  const depth = 0.9
  const drop = 0.25
  const angle = Math.atan2(drop, depth)
  b.box('awning', [w + 0.1, 0.03, Math.hypot(depth, drop)], [0, y - drop / 2, z + depth / 2], {
    rotation: [angle, 0, 0],
    tint: '#9ea7a6',
  })
  for (const side of [-1, 1]) {
    b.box('plain', [0.04, 0.04, depth + 0.1], [side * (w / 2 - 0.2), y - drop / 2 - 0.05, z + depth / 2], {
      rotation: [angle, 0, 0],
      tint: '#5d615f',
    })
  }
}

/* ── 曬衣竹竿（戰後生活感） ─────────────── */
function laundryPole(b, x, y, width, rng) {
  const len = width + 0.9
  b.cylinder('bamboo', 0.025, 0.025, len, 5, [x, y, 0.55], { rotation: [0, 0, Math.PI / 2], tint: '#cdb98a' })
  for (const side of [-1, 1]) {
    b.box('plain', [0.03, 0.03, 0.6], [x + side * (len / 2 - 0.1), y - 0.04, 0.27], { tint: '#5c5c58' })
  }
  const colors = ['#f2efe6', '#b8c7cf', '#d9b8a0', '#e9e2c9', '#c25d4a']
  let cx = x - len / 2 + 0.25
  while (cx < x + len / 2 - 0.3) {
    const cw = 0.28 + rng() * 0.3
    b.box('cloth', [cw, 0.45 + rng() * 0.25, 0.02], [cx + cw / 2, y - 0.3, 0.55], { tint: pick(rng, colors) })
    cx += cw + 0.08
  }
}

/* ── 店面：門板與室內 ───────────────────── */
function buildStorefront(b, cfg, rng, { innerW, openingH, walkH, woodTint, darkWood, condition }) {
  // 可以走進去的店家（例如港口商街的林華泰）：門面留空，室內由該店家的建築產生器自己建
  if (cfg.walkIn) return
  const type = cfg.storefront ?? 'closed'
  const panelH = openingH - walkH - 0.08
  const panelY = walkH + 0.08 + panelH / 2

  if (condition === 'restored' && cfg.modernFront) {
    glassStorefront(b, { width: innerW - 0.1, height: openingH - walkH - 0.1, y0: walkH + 0.02, z: -0.16, frameTint: darkWood })
    return
  }
  if (type === 'closed') {
    if (condition === 'aged' && cfg.shutter !== false) {
      rollingShutter(b, { width: innerW, height: panelH, y0: walkH + 0.08, z: -0.12, openRatio: 0.35 + rng() * 0.4 })
      interiorRoom(b, innerW, openingH, walkH, rng)
      return
    }
    // 雕花門扇＋門板
    const doorW = Math.min(1.6, innerW * 0.4)
    b.box('lattice', [doorW, panelH * 0.55, 0.05], [0, panelY + panelH * 0.2, -0.1], { tint: woodTint })
    b.box('planks', [doorW, panelH * 0.42, 0.06], [0, walkH + 0.08 + panelH * 0.21, -0.1], { tint: woodTint })
    for (const side of [-1, 1]) {
      const pw = (innerW - doorW) / 2
      b.box('planks', [pw, panelH, 0.07], [side * (doorW / 2 + pw / 2), panelY, -0.13], { tint: woodTint, grime: 0.18 })
    }
    b.box('wood', [innerW, 0.08, 0.04], [0, walkH + 0.55, -0.08], { tint: darkWood })
    b.box('wood', [innerW, 0.08, 0.04], [0, openingH - 0.4, -0.08], { tint: darkWood })
    return
  }
  interiorRoom(b, innerW, openingH, walkH, rng)
  if (type === 'half') {
    const pw = innerW * 0.3
    for (const side of [-1, 1]) {
      b.box('planks', [pw, panelH, 0.07], [side * (innerW / 2 - pw / 2), panelY, -0.13], { tint: woodTint, grime: 0.18 })
    }
  } else {
    for (let i = 0; i < 3; i++) {
      b.box('planks', [0.3, panelH * 0.96, 0.05], [-innerW / 2 + 0.18 + i * 0.07, walkH + panelH * 0.48, 0.2 + i * 0.07], {
        rotation: [-0.08, 0, 0],
        tint: shade(woodTint, 0.95 - i * 0.04),
      })
    }
  }
}

function interiorRoom(b, innerW, openingH, walkH, rng) {
  const roomD = 2.9
  const cz = -roomD / 2 - 0.12
  b.box('planks', [innerW, 0.04, roomD], [0, walkH + 0.02, cz], { tint: '#6b5643' })
  b.box('windowLit', [innerW, openingH, 0.1], [0, openingH / 2, -roomD - 0.12], { tint: '#4a3a2e' })
  b.box('dark', [innerW, 0.1, roomD], [0, openingH + 0.05, cz], { tint: '#2c241e' })
  for (const side of [-1, 1]) {
    b.box('dark', [0.1, openingH, roomD], [side * (innerW / 2 - 0.05), openingH / 2, cz], { tint: '#463a30' })
  }
  for (let i = 0; i < 2; i++) {
    const sy = walkH + 0.95 + i * 0.62
    b.box('wood', [innerW * 0.86, 0.05, 0.36], [0, sy, -roomD + 0.08], { tint: '#8d6c4d' })
    const items = Math.floor(innerW / 0.42)
    for (let k = 0; k < items; k++) {
      const x = -innerW * 0.4 + (k + 0.5) * ((innerW * 0.8) / items)
      if (rng() < 0.75) {
        jar(b, [x, sy + 0.025, -roomD + 0.1], { scale: 0.5 + rng() * 0.15, tint: pick(rng, ['#6e4a34', '#58483a', '#8a6844', '#a07a52']) })
      }
    }
  }
  b.box('wood', [innerW * 0.55, 0.92, 0.52], [innerW * 0.16, walkH + 0.46, -1.35], { tint: '#9a7652' })
  b.box('wood', [innerW * 0.58, 0.05, 0.6], [innerW * 0.16, walkH + 0.94, -1.35], { tint: '#7c5c40' })
}

/* ── 林復振等店家的展示貨品 ─────────────── */
function buildDisplay(b, display, { innerW, walkH, walkD }) {
  const z = walkD * 0.5
  const tableW = Math.min(1.75, innerW * 0.34)
  const left = -innerW * 0.3
  const right = innerW * 0.3
  const height = 0.64
  displayTable(b, [left, walkH, z], { width: tableW, height })
  displayTable(b, [right, walkH, z], { width: tableW, height })
  const slots = [
    [left - tableW * 0.24, z],
    [left + tableW * 0.24, z],
    [right - tableW * 0.24, z],
    [right + tableW * 0.24, z],
  ]
  display.slice(0, 4).forEach((item, i) => {
    const [x, sz] = slots[i]
    const y = walkH + height
    if (item === 'mullet-roe') roeTray(b, [x, y, sz], { rotationY: 0.05 })
    else basket(b, [x, y, sz], { radius: Math.min(0.36, tableW * 0.22), content: item, seed: 31 + i })
  })
  sack(b, [-innerW / 2 + 0.25, walkH, 0.55], { seed: 91 })
  sack(b, [-innerW / 2 + 0.55, walkH, 0.3], { seed: 92, tint: '#e6d8bf' })
  barrel(b, [innerW / 2 - 0.3, walkH, 0.4], { radius: 0.26, height: 0.62 })
  basket(b, [innerW / 2 - 0.3, walkH + 0.62, 0.4], { radius: 0.24, depth: 0.08, content: 'beans', seed: 93 })
}

/* ── 一般店家的貨品 ─────────────────────── */
export function buildGoods(b, cfg, rng, { w, innerW, walkH, walkD }) {
  const goods = cfg.goods
  const z = walkD * 0.48
  if (goods === 'tea') {
    goodsPile(b, [-innerW / 2 + 0.25, walkH, z - 0.1], { kind: 'tea', seed: cfg.seed })
    teaChest(b, [innerW / 2 - 0.4, walkH, z], { rotationY: rng() * 0.3 })
  } else if (goods === 'grain') {
    carryingPole(b, [0, walkH, z + 0.1], { content: rng() < 0.5 ? 'rice' : 'beans', seed: cfg.seed })
    sack(b, [innerW / 2 - 0.3, walkH, z - 0.2], { seed: (cfg.seed ?? 1) + 1 })
  } else if (goods === 'rice') {
    riceBin(b, [-innerW / 2 + 0.6, walkH, z], {})
    riceBin(b, [-innerW / 2 + 1.45, walkH, z + 0.05], { content: 'beans' })
    sack(b, [innerW / 2 - 0.35, walkH, z - 0.15], { seed: (cfg.seed ?? 1) + 3 })
    sack(b, [innerW / 2 - 0.85, walkH, z - 0.05], { seed: (cfg.seed ?? 1) + 4, tint: '#ece2cc' })
  } else if (goods === 'pastry') {
    displayTable(b, [0, walkH, z], { width: Math.min(1.8, innerW * 0.7), height: 0.7, tint: '#8c6446' })
    pastryTray(b, [-0.42, walkH + 0.7, z], { seed: cfg.seed })
    pastryTray(b, [0.42, walkH + 0.7, z], { seed: (cfg.seed ?? 1) + 2, kind: 'turtle' })
  } else if (goods === 'jars') {
    for (let i = 0; i < 3; i++) {
      jar(b, [-innerW / 2 + 0.35 + i * 0.5, walkH, z - 0.1 + (i % 2) * 0.2], {
        scale: 0.9 + rng() * 0.4,
        tint: pick(rng, ['#6e4a34', '#58483a', '#8a6844']),
        lid: rng() < 0.5,
      })
    }
  } else if (goods === 'crates') {
    goodsPile(b, [innerW / 2 - 1.0, walkH, z - 0.1], { kind: 'crates', seed: cfg.seed })
  } else if (goods === 'sacks') {
    goodsPile(b, [-innerW / 2 + 0.3, walkH, z - 0.1], { kind: 'sacks', seed: cfg.seed })
  } else if (goods === 'baskets') {
    displayTable(b, [0, walkH, z], { width: Math.min(1.6, innerW * 0.6), height: 0.6 })
    basket(b, [-0.35, walkH + 0.6, z], { content: pick(rng, ['beans', 'peanuts', 'tea']), seed: cfg.seed })
    basket(b, [0.35, walkH + 0.6, z], { content: pick(rng, ['rice', 'beans', 'peanuts']), seed: (cfg.seed ?? 1) + 3 })
  } else if (goods === 'cloth') {
    // 布行：展示桌上的布捲與立起的布匹
    displayTable(b, [0, walkH, z], { width: Math.min(1.7, innerW * 0.65), height: 0.62 })
    const colors = ['#c9564a', '#3f5f8a', '#e0c36a', '#6f8a5c', '#d7b8a8', '#2f3f5c']
    for (let i = 0; i < 4; i++) {
      b.cylinder('cloth', 0.08, 0.08, 0.5, 10, [-0.45 + i * 0.3, walkH + 0.7, z], { rotation: [0, 0, Math.PI / 2], tint: pick(rng, colors) })
    }
    for (let i = 0; i < 3; i++) {
      b.cylinder('cloth', 0.08, 0.08, 1.2, 10, [innerW / 2 - 0.3 - i * 0.2, walkH + 0.6, z - 0.25], { rotation: [0.1, 0, 0.08 * (i - 1)], tint: pick(rng, colors) })
    }
  } else if (goods === 'poles') {
    bambooPoles(b, [w / 2 - 0.9, walkH, -0.05], {})
    crate(b, [-innerW / 2 + 0.4, walkH, z], { rotationY: rng() * 0.4 })
  }
}
