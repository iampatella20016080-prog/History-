import { Path, Shape, SphereGeometry, TorusGeometry } from 'three'
import { shade } from './props.js'

/**
 * 立面零件庫：各年代建築共用的窗、欄杆、簷口、柱、山頭、遮篷、櫥窗與招牌板。
 * 所有座標皆為建築本地座標（立面朝 +z），由呼叫端 push 好建築的位置與朝向。
 */

/* ── 形狀 ─────────────────────────────────── */

/** 半圓拱頂的窗洞（寬 w、直段高 h；拱頂半徑 w/2），原點在窗洞底部中央 */
function archOutline(path, w, h, inset = 0) {
  const r = w / 2 - inset
  path.moveTo(-r, inset)
  path.lineTo(r, inset)
  path.lineTo(r, h)
  path.absarc(0, h, r, 0, Math.PI, false)
  path.lineTo(-r, inset)
}

export function archShape(w, h) {
  const shape = new Shape()
  archOutline(shape, w, h)
  return shape
}

export function archFrameShape(w, h, frame) {
  const outer = new Shape()
  const r = w / 2 + frame
  outer.moveTo(-r, -frame)
  outer.lineTo(r, -frame)
  outer.lineTo(r, h)
  outer.absarc(0, h, r, 0, Math.PI, false)
  outer.lineTo(-r, -frame)
  const hole = new Path()
  const ri = w / 2
  hole.moveTo(-ri, 0)
  hole.absarc(0, h, ri, Math.PI, 0, true)
  hole.lineTo(ri, 0)
  hole.lineTo(-ri, 0)
  outer.holes.push(hole)
  return outer
}

/* ── 窗 ───────────────────────────────────── */

/**
 * 方窗：木框、直櫺或玻璃格，可選百葉窗扇。
 * style: 'bars'（直櫺）| 'panes'（玻璃格）| 'grille'（鐵窗花）
 */
export function rectWindow(b, { x, y, width, height, z = 0, lit = false, frameTint = '#6b4f39', barTint = '#c9ad8a', style = 'bars', shutters = false, shutterTint = '#6d8a83', frameMat = 'wood', glassTint = '#3b3029' }) {
  const f = 0.09
  // 風化與鐵窗花（builders/weathering.js）要避開或套上的窗洞
  b.openings?.push({ kind: 'window', x, y, width: width + 2 * f, height: height + 2 * f, z, grille: style === 'grille' })
  const glass = b.box(lit ? 'windowLit' : 'dark', [width, height, 0.04], [x, y, z], { tint: lit ? '#6b4b33' : glassTint })
  if (lit) b.shopGlow(glass, 'room')
  b.box(frameMat, [width + 2 * f, f, 0.1], [x, y + height / 2 + f / 2, z + 0.03], { tint: frameTint })
  b.box(frameMat, [width + 2 * f + 0.08, f * 1.1, 0.16], [x, y - height / 2 - f * 0.55, z + 0.05], { tint: frameTint })
  b.box(frameMat, [f, height, 0.1], [x - width / 2 - f / 2, y, z + 0.03], { tint: frameTint })
  b.box(frameMat, [f, height, 0.1], [x + width / 2 + f / 2, y, z + 0.03], { tint: frameTint })
  if (style === 'bars') {
    const bars = Math.max(3, Math.round(width / 0.2))
    for (let i = 1; i < bars; i++) {
      b.box('wood', [0.045, height, 0.05], [x - width / 2 + (i * width) / bars, y, z + 0.03], { tint: barTint })
    }
    b.box('wood', [width, 0.045, 0.05], [x, y + height * 0.18, z + 0.04], { tint: barTint })
  } else if (style === 'panes') {
    b.box('wood', [0.04, height, 0.05], [x, y, z + 0.03], { tint: frameTint })
    for (const t of [-0.17, 0.17]) b.box('wood', [width, 0.035, 0.05], [x, y + height * t, z + 0.03], { tint: frameTint })
  } else if (style === 'grille') {
    grille(b, { x, y, width, height, z: z + 0.1, tint: barTint })
  }
  if (shutters) {
    for (const side of [-1, 1]) {
      b.box('planks', [width / 2, height, 0.04], [x + side * (width * 0.75 + f + 0.02), y, z + 0.06], {
        rotation: [0, side * 0.35, 0],
        tint: shutterTint,
      })
    }
  }
}

/** 拱窗（洋樓立面）：拱形框、拱心石、窗臺與百葉窗扇 */
export function archWindow(b, { x, y, width, height, z = 0, lit = false, frameTint = '#f6efe0', frameMat = 'stucco', keystone = true, shutters = false, shutterTint = '#6d8a83', mullions = true, glassTint = '#3b3029' }) {
  const straight = Math.max(0.2, height - width / 2)
  b.openings?.push({ kind: 'arch', x, y: y + height / 2, width: width + 0.24, height: height + 0.24, z, straight, bottom: y })
  const glass = b.extrude(lit ? 'windowLit' : 'dark', archShape(width, straight), 0.04, {
    position: [x, y, z - 0.02],
    tint: lit ? '#6b4b33' : glassTint,
    curveSegments: 8,
  })
  if (lit) b.shopGlow(glass, 'room')
  b.extrude(frameMat, archFrameShape(width, straight, 0.12), 0.12, {
    position: [x, y, z - 0.02],
    tint: frameTint,
    curveSegments: 8,
  })
  if (mullions) {
    b.box('wood', [0.045, straight + width / 2 - 0.05, 0.05], [x, y + (straight + width / 2) / 2, z + 0.02], { tint: '#5b4636' })
    b.box('wood', [width, 0.045, 0.05], [x, y + straight, z + 0.02], { tint: '#5b4636' })
  }
  b.box(frameMat, [width + 0.4, 0.1, 0.22], [x, y - 0.07, z + 0.06], { tint: frameTint })
  if (keystone) {
    b.box(frameMat, [0.18, 0.26, 0.16], [x, y + straight + width / 2 + 0.06, z + 0.06], { tint: shade(frameTint, 0.95) })
  }
  if (shutters) {
    for (const side of [-1, 1]) {
      b.box('planks', [width / 2, straight + 0.1, 0.04], [x + side * (width * 0.78 + 0.1), y + straight / 2 + 0.05, z + 0.08], {
        rotation: [0, side * 0.42, 0],
        tint: shutterTint,
      })
    }
  }
}

/** 圓窗（Art Deco 的舷窗） */
export function roundWindow(b, { x, y, radius = 0.38, z = 0, lit = false, frameTint = '#2f6b5a' }) {
  b.openings?.push({ kind: 'round', x, y, width: radius * 2 + 0.2, height: radius * 2 + 0.2, z })
  const glass = b.cylinder(lit ? 'windowLit' : 'dark', radius, radius, 0.05, 16, [x, y, z], { rotation: [Math.PI / 2, 0, 0], tint: lit ? '#6b4b33' : '#334044' })
  if (lit) b.shopGlow(glass, 'room')
  b.add('plain', new TorusGeometry(radius + 0.04, 0.05, 5, 20), { position: [x, y, z + 0.02], tint: frameTint })
  b.box('plain', [radius * 2, 0.03, 0.04], [x, y, z + 0.03], { tint: frameTint })
}

/* ── 鐵窗花（戰後） ───────────────────────── */

export function grille(b, { x, y, width, height, z = 0.1, tint = '#3c4a4d', pattern = 'diamond' }) {
  const t = 0.025
  b.box('plain', [width, t, t], [x, y + height / 2, z], { tint })
  b.box('plain', [width, t, t], [x, y - height / 2, z], { tint })
  const bars = Math.max(3, Math.round(width / 0.22))
  for (let i = 0; i <= bars; i++) {
    b.box('plain', [t, height, t], [x - width / 2 + (i * width) / bars, y, z], { tint })
  }
  b.box('plain', [width, t, t], [x, y, z], { tint })
  if (pattern === 'diamond') {
    const s = Math.min(width, height) * 0.22
    for (const dy of [-height * 0.25, height * 0.25]) {
      for (const angle of [Math.PI / 4, -Math.PI / 4]) {
        b.box('plain', [s * 1.4, t, t], [x, y + dy, z + 0.01], { rotation: [0, 0, angle], tint })
      }
    }
  }
}

/* ── 陽臺 ─────────────────────────────────── */

/**
 * style: 'baluster'（瓶形欄杆：洋樓）| 'iron'（鐵欄杆：戰後）| 'solid'（實牆：Deco）
 */
export function balcony(b, { x = 0, y, width, depth = 0.7, z = 0, slabTint = '#efe6d4', railTint = '#f4ecdc', style = 'baluster', mat = 'stucco', brackets = true }) {
  b.box(mat, [width, 0.16, depth], [x, y, z + depth / 2], { tint: slabTint })
  b.box(mat, [width + 0.06, 0.06, depth + 0.04], [x, y - 0.1, z + depth / 2], { tint: shade(slabTint, 0.92) })
  // 托架
  if (brackets) {
    const count = Math.max(2, Math.round(width / 1.4))
    for (let i = 0; i <= count; i++) {
      const bx = x - width / 2 + 0.15 + (i * (width - 0.3)) / count
      b.box(mat, [0.12, 0.3, depth * 0.7], [bx, y - 0.24, z + depth * 0.35], { tint: shade(slabTint, 0.9) })
    }
  }
  const railH = 0.85
  const top = y + 0.08 + railH
  if (style === 'solid') {
    b.box(mat, [width, railH, 0.12], [x, y + 0.08 + railH / 2, z + depth - 0.06], { tint: railTint })
    b.box(mat, [width + 0.05, 0.08, 0.18], [x, top, z + depth - 0.06], { tint: shade(railTint, 0.95) })
    return
  }
  b.box(style === 'iron' ? 'plain' : mat, [width, 0.08, 0.14], [x, top, z + depth - 0.07], { tint: railTint })
  if (style === 'iron') {
    const n = Math.round(width / 0.12)
    for (let i = 0; i <= n; i++) {
      b.box('plain', [0.025, railH, 0.025], [x - width / 2 + (i * width) / n, y + 0.08 + railH / 2, z + depth - 0.07], { tint: railTint })
    }
    b.box('plain', [width, 0.03, 0.03], [x, y + 0.3, z + depth - 0.07], { tint: railTint })
  } else {
    b.box(mat, [width, 0.08, 0.16], [x, y + 0.12, z + depth - 0.07], { tint: railTint })
    const n = Math.round(width / 0.2)
    for (let i = 0; i < n; i++) {
      const bx = x - width / 2 + (i + 0.5) * (width / n)
      b.box(mat, [0.08, railH - 0.16, 0.08], [bx, y + 0.08 + railH / 2, z + depth - 0.07], { tint: railTint })
    }
    // 欄杆柱墩
    for (const bx of [x - width / 2 + 0.08, x + width / 2 - 0.08]) {
      b.box(mat, [0.16, railH + 0.08, 0.18], [bx, y + 0.08 + railH / 2, z + depth - 0.07], { tint: shade(railTint, 0.97) })
    }
  }
}

/* ── 簷口、壁柱、柱 ───────────────────────── */

export function cornice(b, { y, width, z = 0, tint = '#f6efe0', mat = 'stucco', depth = 0.22 }) {
  b.box(mat, [width, 0.1, depth * 0.5], [0, y - 0.1, z + depth * 0.25], { tint: shade(tint, 0.95) })
  b.box(mat, [width + 0.06, 0.12, depth], [0, y, z + depth / 2], { tint })
  b.box(mat, [width + 0.12, 0.06, depth + 0.08], [0, y + 0.09, z + (depth + 0.08) / 2], { tint: shade(tint, 1.02) })
}

export function pilaster(b, { x, y0, y1, z = 0, width = 0.3, tint = '#f6efe0', mat = 'stucco' }) {
  const h = y1 - y0
  b.box(mat, [width, h, 0.1], [x, y0 + h / 2, z + 0.05], { tint })
  b.box(mat, [width + 0.1, 0.12, 0.16], [x, y1 - 0.06, z + 0.08], { tint: shade(tint, 0.96) })
}

/** 騎樓柱（亭仔腳）：柱身、柱礎與柱頭 */
export function arcadeColumn(b, { x, z, height, width = 0.5, mat = 'brick', tint = '#ffffff', capTint = '#f3ebdc', round = false }) {
  if (round) {
    b.cylinder(mat, width / 2, width / 2, height - 0.5, 14, [x, 0.3 + (height - 0.5) / 2, z], { tint, grime: 0.2 })
  } else {
    b.box(mat, [width, height - 0.5, width], [x, 0.3 + (height - 0.5) / 2, z], { tint, grime: 0.25 })
  }
  b.box('stone', [width + 0.12, 0.3, width + 0.12], [x, 0.15, z], { tint: '#cdc4b2' })
  b.box('stucco', [width + 0.14, 0.12, width + 0.14], [x, height - 0.26, z], { tint: capTint })
  b.box('stucco', [width + 0.06, 0.14, width + 0.06], [x, height - 0.1, z], { tint: shade(capTint, 0.96) })
}

/* ── 山頭（女兒牆） ───────────────────────── */

/** 山頭輪廓：scroll 巴洛克捲渦、arch 弧形、stepped 階梯、deco 幾何階梯 */
export function parapetShape(width, height, style) {
  const half = width / 2
  const shape = new Shape()
  shape.moveTo(-half, 0)
  shape.lineTo(half, 0)
  if (style === 'scroll') {
    shape.lineTo(half, height * 0.45)
    shape.quadraticCurveTo(half * 0.82, height * 0.48, half * 0.62, height * 0.62)
    shape.quadraticCurveTo(half * 0.45, height * 0.74, half * 0.3, height * 0.78)
    shape.quadraticCurveTo(half * 0.2, height * 1.02, 0, height)
    shape.quadraticCurveTo(-half * 0.2, height * 1.02, -half * 0.3, height * 0.78)
    shape.quadraticCurveTo(-half * 0.45, height * 0.74, -half * 0.62, height * 0.62)
    shape.quadraticCurveTo(-half * 0.82, height * 0.48, -half, height * 0.45)
  } else if (style === 'arch') {
    shape.lineTo(half, height * 0.55)
    shape.lineTo(half * 0.55, height * 0.55)
    shape.quadraticCurveTo(0, height * 1.25, -half * 0.55, height * 0.55)
    shape.lineTo(-half, height * 0.55)
  } else if (style === 'deco') {
    shape.lineTo(half, height * 0.4)
    shape.lineTo(half * 0.6, height * 0.4)
    shape.lineTo(half * 0.6, height * 0.62)
    shape.lineTo(half * 0.32, height * 0.62)
    shape.lineTo(half * 0.32, height * 0.82)
    shape.lineTo(half * 0.14, height * 0.82)
    shape.lineTo(half * 0.14, height)
    shape.lineTo(-half * 0.14, height)
    shape.lineTo(-half * 0.14, height * 0.82)
    shape.lineTo(-half * 0.32, height * 0.82)
    shape.lineTo(-half * 0.32, height * 0.62)
    shape.lineTo(-half * 0.6, height * 0.62)
    shape.lineTo(-half * 0.6, height * 0.4)
    shape.lineTo(-half, height * 0.4)
  } else {
    // stepped
    shape.lineTo(half, height * 0.5)
    shape.lineTo(half * 0.45, height * 0.5)
    shape.lineTo(half * 0.45, height * 0.8)
    shape.lineTo(-half * 0.45, height * 0.8)
    shape.lineTo(-half * 0.45, height * 0.5)
    shape.lineTo(-half, height * 0.5)
  }
  shape.closePath()
  return shape
}

export function parapet(b, { y, width, height = 1.6, z = 0, style = 'scroll', tint = '#f2e8d4', trimTint = '#f8f1e2', mat = 'stucco', finials = true, plaque = null }) {
  b.extrude(mat, parapetShape(width, height, style), 0.26, { position: [0, y, z - 0.26], tint, curveSegments: 6 })
  // 頂緣線腳
  b.extrude(mat, parapetShape(width + 0.12, height + 0.08, style), 0.06, {
    position: [0, y - 0.04, z + 0.0],
    tint: trimTint,
    scale: [1, 1, 1],
    curveSegments: 6,
  })
  if (finials && style !== 'deco') {
    for (const side of [-1, 1]) {
      const fx = side * (width / 2 - 0.15)
      b.box(mat, [0.3, 0.5, 0.3], [fx, y + height * 0.45 + 0.25, z - 0.13], { tint: trimTint })
      b.add('plain', new SphereGeometry(0.17, 10, 8), { position: [fx, y + height * 0.45 + 0.62, z - 0.13], tint: trimTint })
    }
  }
  if (plaque) {
    const pw = Math.min(width * 0.5, 0.8 + plaque.text.length * 0.42)
    const ph = 0.5
    const py = y + height * (style === 'deco' ? 0.55 : 0.48)
    b.box(mat, [pw + 0.16, ph + 0.16, 0.08], [0, py, z + 0.07], { tint: shade(trimTint, 0.94) })
    b.addSign({ text: plaque.text, style: plaque.style ?? 'gold', width: pw, height: ph, position: [0, py, z + 0.115] })
  }
}

/* ── 遮篷、櫥窗、鐵捲門 ───────────────────── */

/** 條紋布篷：從立面斜斜伸出 */
export function awning(b, { x = 0, y, z = 0, width, depth = 1.0, drop = 0.45, tint = '#7a2e33' }) {
  const angle = Math.atan2(drop, depth)
  const len = Math.hypot(drop, depth)
  b.box('awning', [width, 0.04, len], [x, y - drop / 2, z + depth / 2], { rotation: [angle, 0, 0], tint })
  b.box('awning', [width, 0.24, 0.03], [x, y - drop - 0.1, z + depth], { tint: shade(tint, 0.9) })
  for (const side of [-1, 1]) {
    b.box('plain', [0.03, 0.03, len], [x + side * (width / 2), y - drop / 2, z + depth / 2], { rotation: [angle, 0, 0], tint: '#3a3430' })
  }
}

/** 玻璃櫥窗店面：木框＋透出暖光的玻璃，含一扇門 */
export function glassStorefront(b, { width, height, y0 = 0.15, z = -0.1, frameTint = '#6b5039', frameMat = 'wood' }) {
  const panes = Math.max(2, Math.round(width / 1.1))
  const paneW = width / panes
  const doorIndex = Math.floor(panes / 2)
  const glass = []
  for (let i = 0; i < panes; i++) {
    const px = -width / 2 + paneW * (i + 0.5)
    const isDoor = i === doorIndex
    const bottom = isDoor ? y0 : y0 + 0.45
    const h = height - (bottom - y0)
    glass.push(b.box('glassWarm', [paneW - 0.08, h - 0.08, 0.04], [px, bottom + h / 2, z]))
    if (!isDoor) b.box(frameMat, [paneW, 0.45, 0.12], [px, y0 + 0.225, z + 0.02], { tint: frameTint })
  }
  for (let i = 0; i <= panes; i++) {
    b.box(frameMat, [0.08, height, 0.12], [-width / 2 + paneW * i, y0 + height / 2, z + 0.03], { tint: frameTint })
  }
  b.box(frameMat, [width + 0.08, 0.1, 0.14], [0, y0 + height, z + 0.03], { tint: frameTint })
  b.box(frameMat, [width, 0.06, 0.1], [0, y0 + height * 0.78, z + 0.03], { tint: frameTint })
  // 整排玻璃後面是同一個假房間（店內透光，rendering/shopGlow.js）
  b.shopGlowGroup(glass)
}

/** 鐵捲門：openRatio 為拉起的比例 */
export function rollingShutter(b, { width, height, y0 = 0.15, z = -0.05, openRatio = 0.5 }) {
  const closedH = height * (1 - openRatio)
  b.box('shutter', [width, 0.36, 0.3], [0, y0 + height + 0.1, z + 0.08], { tint: '#d9d6cc' })
  if (closedH > 0.05) {
    b.box('shutter', [width, closedH, 0.04], [0, y0 + height - closedH / 2, z], { tint: '#e3e0d6' })
  }
  for (const side of [-1, 1]) {
    b.box('plain', [0.06, height, 0.08], [side * (width / 2 - 0.03), y0 + height / 2, z + 0.02], { tint: '#6f706b' })
  }
}

/* ── 招牌板 ───────────────────────────────── */

/** 橫式招牌（含木框），position 為招牌中心 */
export function signBoard(b, { text, style, x = 0, y, z = 0, width, height = 0.6, frameTint = '#5d4231', frame = true }) {
  b.openings?.push({ kind: 'sign', x, y, width: width + 0.3, height: height + 0.3, z })
  if (frame) b.box('wood', [width + 0.16, height + 0.16, 0.08], [x, y, z + 0.04], { tint: frameTint })
  b.addSign({ text, style, width, height, position: [x, y, z + (frame ? 0.083 : 0.012)] })
}

/** 直立突出招牌（垂直於立面，兩面都有字） */
export function projectingSign(b, { text, style = 'vertical', x, y, z = 0, width = 0.55, height = 2.0, boardTint = '#f4efe2' }) {
  b.openings?.push({ kind: 'sign', x, y, width: 0.5, height: height + 0.3, z })
  b.box('plain', [0.08, height + 0.1, width + 0.1], [x, y, z + width / 2 + 0.25], { tint: boardTint })
  b.box('plain', [0.04, 0.04, 0.3], [x, y + height / 2 - 0.2, z + 0.15], { tint: '#4a4440' })
  b.box('plain', [0.04, 0.04, 0.3], [x, y - height / 2 + 0.2, z + 0.15], { tint: '#4a4440' })
  const sign = { text, style, vertical: true, width, height }
  b.addSign({ ...sign, position: [x + 0.042, y, z + width / 2 + 0.25], rotationY: Math.PI / 2 })
  b.addSign({ ...sign, position: [x - 0.042, y, z + width / 2 + 0.25], rotationY: -Math.PI / 2 })
}
