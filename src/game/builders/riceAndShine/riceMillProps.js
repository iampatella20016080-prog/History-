import { CylinderGeometry, IcosahedronGeometry, PlaneGeometry, SphereGeometry, TorusGeometry } from 'three'
import { riceUV } from '../../rendering/riceAtlas.js'
import { createRng } from '../../utils/random.js'
import { shade } from '../props.js'

/**
 * 米行與碾米間共用的器物（RiceMillProps）：碾米機、米袋堆、木櫃、帳桌、裸燈泡、平放的圖集紙張。
 * 1930 的米行、1945 的戰後米行與 2000 年代稻舍後段的舊碾米機都用這裡的器物，依參數改變新舊與狀態。
 */

/** 平放（朝上）的圖集紙張：帳本、報紙、菜單 */
export function flatPanel(b, name, w, d, position, rotationY = 0) {
  const geometry = new PlaneGeometry(w, d)
  const [u0, v0, u1, v1] = riceUV(name)
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
  return b.add('riceExhibit', geometry, { position, rotation: [-Math.PI / 2, 0, rotationY] })
}

/** 吊下來的裸燈泡（電線、燈座、燈泡） */
export function bareBulb(b, x, y, z, ceiling, shadeTint = null) {
  b.cylinder('dark', 0.006, 0.006, ceiling - y, 4, [x, (ceiling + y) / 2 + 0.05, z], { tint: '#1d1b1a' })
  b.cylinder('dark', 0.022, 0.026, 0.06, 8, [x, y + 0.06, z], { tint: '#2a2622' })
  if (shadeTint) b.add('steel', new CylinderGeometry(0.05, 0.16, 0.1, 14, 1, true), { position: [x, y + 0.04, z], tint: shadeTint })
  b.add('bulb', new IcosahedronGeometry(0.045, 1), { position: [x, y - 0.01, z], scale: [1, 1.25, 1], tint: '#ffe2b0' })
}

/**
 * 米袋（低面數：堆在米倉裡的數量很多）。平放時是枕頭形的麻布袋（長、寬、扁，四角圓鈍、表面微微起伏），
 * 長邊沿著本地 x；standing 時是立著、袋口紮起來的米袋。
 */
export function lowSack(b, x, y, z, { rotationY = 0, tint = '#e2d3b4', scale = 0.72, seed = 1, standing = false } = {}) {
  const rng = createRng(seed)
  if (standing) {
    const r = 0.3 * scale
    const g = new SphereGeometry(r, 10, 5)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      let px = pos.getX(i)
      let py = pos.getY(i) * 1.2
      let pz = pos.getZ(i)
      if (py < -0.55 * r) py = -0.55 * r + (py + 0.55 * r) * 0.2
      if (py > 0.5 * r) {
        const pinch = Math.max(0.35, 1 - (py - 0.5 * r) / (0.9 * r))
        px *= pinch
        pz *= pinch
      }
      pos.setXYZ(i, px, py, pz * 0.85)
    }
    g.computeVertexNormals()
    b.add('burlap', g, { position: [x, y + r * 0.56, z], rotation: [0, rotationY, 0], tint })
    return
  }
  const k = scale / 0.72
  const len = (0.5 + rng() * 0.06) * k
  const wid = 0.38 * k
  const thick = (0.24 + rng() * 0.04) * k
  const g = new SphereGeometry(1, 8, 6)
  const pos = g.attributes.position
  // 球面推向方塊（超橢球）：四角圓鈍的枕頭形；底面壓平，表面依座標微微起伏
  const shape = (v) => Math.sign(v) * Math.abs(v) ** 0.45
  for (let i = 0; i < pos.count; i++) {
    const px = shape(pos.getX(i))
    let py = shape(pos.getY(i))
    const pz = shape(pos.getZ(i))
    if (py < -0.6) py = -0.6 - (py + 0.6) * 0.1
    const n = Math.sin(px * 7.1 + pz * 5.3) * 0.04
    pos.setXYZ(i, (px * len) / 2, ((py + n) * thick) / 2, (pz * wid) / 2 * (1 - Math.abs(px) * 0.12))
  }
  g.computeVertexNormals()
  b.add('burlap', g, { position: [x, y + thick * 0.3, z], rotation: [(rng() - 0.5) * 0.08, rotationY, (rng() - 0.5) * 0.08], tint })
}

/** 一堆米袋（在 r 的範圍內一層一層疊起來；fill 是滿的程度，0–1）。堆在裡面、看不到的米袋不產生 */
export function sackStack(b, r, { layers = 3, fill = 1, tint = ['#e2d3b4', '#cdb991', '#d8c49c'], seed = 1, scale = 0.72, axis = 'x' } = {}) {
  const rng = createRng(seed)
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  // 米袋的長邊沿著 axis（x 或 z）排：從那一側看過去是米袋的側面
  const long = 0.5 * scale / 0.72
  const girth = 0.4 * scale / 0.72
  const sx = axis === 'x' ? long : girth
  const sz = axis === 'x' ? girth : long
  const cols = Math.max(1, Math.floor(w / sx))
  const rows = Math.max(1, Math.floor(d / sz))
  const h = 0.23 * scale / 0.72
  for (let l = 0; l < layers; l++) {
    const top = l === layers - 1
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < rows; k++) {
        // 下面幾層是滿的（看得到的那一面不會有洞）；最上層與沒有堆滿的米袋堆少幾袋
        const skip = rng() > (top ? fill * 0.85 : fill)
        const jx = (rng() - 0.5) * 0.05
        const jz = (rng() - 0.5) * 0.05
        const ry = (axis === 'x' ? 0 : Math.PI / 2) + (rng() - 0.5) * 0.25
        if (skip) continue
        // 堆在裡面、四周與上方都被擋住的米袋不產生
        if (!top && fill >= 1 && c > 0 && c < cols - 1 && k > 0 && k < rows - 1) continue
        const offset = l % 2 ? 0.05 : -0.02
        const x = r.minX + (c + 0.5) * (w / cols) + jx + (axis === 'z' ? offset : 0)
        const z = r.minZ + (k + 0.5) * (d / rows) + jz + (axis === 'x' ? offset : 0)
        lowSack(b, x, l * h, z, { rotationY: ry, tint: tint[(c + k + l) % tint.length], scale, seed: seed * 31 + l * 7 + c * 3 + k })
      }
    }
  }
}

/**
 * 碾米機：木製基座、鑄鐵的碾米筒、木製進料斗、出米口與接米的米袋、側面的皮帶輪。
 * facing：出米口朝向的 x 方向（+1 或 -1）。covered：戰後蓋著布；lineShaft：皮帶接到天花下的天軸（1930 的碾米間）。
 */
export function millMachine(b, detail, r, { facing = 1, aged = false, covered = false, lineShaft = null, seed = 1 } = {}) {
  const rng = createRng(seed)
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  const H = r.height
  const wood = aged ? '#5a4030' : '#7a5636'
  const iron = aged ? '#3a3734' : '#4a4d4f'
  const base = 0.32
  // 木製基座（厚木框）
  b.box('wood', [w * 0.86, base, d * 0.8], [cx, base / 2, cz], { tint: shade(wood, 0.8), grime: 0.2 })
  for (const s of [-1, 1]) b.box('wood', [w * 0.9, 0.08, 0.1], [cx, base - 0.04, cz + s * d * 0.38], { tint: shade(wood, 0.7) })
  // 機身：鑄鐵的碾米筒與筒身外的木箱
  const bodyH = H * 0.32
  b.box('wood', [w * 0.6, bodyH, d * 0.5], [cx, base + bodyH / 2, cz], { tint: wood, grime: 0.15 })
  b.cylinder('steel', d * 0.17, d * 0.17, w * 0.74, 16, [cx, base + bodyH + 0.02, cz], { rotation: [0, 0, Math.PI / 2], tint: iron })
  for (const s of [-1, 1]) b.cylinder('steel', d * 0.2, d * 0.2, 0.05, 16, [cx + s * w * 0.37, base + bodyH + 0.02, cz], { rotation: [0, 0, Math.PI / 2], tint: shade(iron, 0.8) })
  // 進料斗（倒四角錐的木斗）與斗上的框
  const hopTop = H
  const hopBottom = base + bodyH + d * 0.15
  const hopH = hopTop - hopBottom
  b.add('wood', new CylinderGeometry(d * 0.42, d * 0.1, hopH, 4, 1, true), { position: [cx, hopBottom + hopH / 2, cz], rotation: [0, Math.PI / 4, 0], tint: shade(wood, 1.05) })
  b.box('wood', [d * 0.62, 0.05, d * 0.62], [cx, hopTop, cz], { tint: shade(wood, 0.85) })
  // 斗裡的稻穀
  b.add('plain', new IcosahedronGeometry(d * 0.26, 1), { position: [cx, hopTop - 0.05, cz], scale: [1, 0.25, 1], tint: '#c9a24e' })
  // 出米口（斜的木槽）與接米的米袋或木桶
  const outX = cx + facing * w * 0.36
  b.box('wood', [0.42, 0.06, 0.18], [outX, base + bodyH * 0.55, cz + d * 0.12], { rotation: [0, 0, -facing * 0.45], tint: shade(wood, 0.9) })
  lowSack(b, outX + facing * 0.2, 0, cz + d * 0.12, { tint: '#e6dcc4', scale: 0.62, seed: seed + 4, standing: true })
  // 糠的出口（另一側）與一小堆米糠
  b.box('wood', [0.14, 0.32, 0.14], [cx - facing * w * 0.28, base + bodyH * 0.3, cz - d * 0.3], { tint: shade(wood, 0.8) })
  b.add('plain', new IcosahedronGeometry(0.16, 1), { position: [cx - facing * w * 0.28, 0.05, cz - d * 0.36], scale: [1.3, 0.35, 1], tint: '#a88a5a' })
  // 側面的皮帶輪（輪輻）
  const wheelZ = r.minZ + 0.06
  const wheelY = base + bodyH + 0.02
  const wheelR = Math.min(0.42, H * 0.2)
  b.add('steel', new TorusGeometry(wheelR, 0.035, 6, 24), { position: [cx, wheelY, wheelZ], tint: shade(iron, 0.9) })
  for (let i = 0; i < 6; i++) b.box('steel', [0.03, wheelR * 2, 0.025], [cx, wheelY, wheelZ], { rotation: [0, 0, (i / 6) * Math.PI], tint: shade(iron, 0.85) })
  b.cylinder('steel', 0.06, 0.06, 0.12, 10, [cx, wheelY, wheelZ], { rotation: [Math.PI / 2, 0, 0], tint: iron })
  if (lineShaft) {
    // 皮帶：從皮帶輪往上接到天花下的天軸
    const { y, x } = lineShaft
    const dy = y - wheelY
    const dx = x - cx
    const len = Math.hypot(dx, dy)
    const ang = Math.atan2(dy, dx)
    for (const s of [-1, 1]) b.box('cloth', [len, 0.012, 0.09], [(cx + x) / 2 + s * 0.03, (wheelY + y) / 2, wheelZ], { rotation: [0, 0, ang + s * 0.03], tint: '#3a2e24' })
  }
  if (covered) {
    // 戰後：機身蓋著褪色的布（進料斗與皮帶輪露出來）
    b.box('cloth', [w * 0.66, bodyH + 0.18, d * 0.58], [cx, base + bodyH / 2 + 0.06, cz + 0.02], { tint: '#8a7f6a' })
    b.add('cloth', new IcosahedronGeometry(0.3, 1), { position: [cx + 0.1, base + bodyH + 0.12, cz], scale: [1.6, 0.35, 1.2], tint: '#7d735f' })
  }
  // 細部：螺栓、機身上的鐵條與散落的米粒
  for (let i = 0; i < 8; i++) detail.add('steel', new IcosahedronGeometry(0.014, 0), { position: [cx - w * 0.28 + (i % 4) * w * 0.18, base + bodyH - 0.03, cz + (i < 4 ? 1 : -1) * d * 0.25], tint: '#2a2826' })
  for (let i = 0; i < 26; i++) detail.add('plain', new IcosahedronGeometry(0.008, 0), { position: [outX + facing * (rng() * 0.4), 0.06, cz + d * 0.12 + (rng() - 0.5) * 0.5], tint: rng() < 0.5 ? '#efe9d8' : '#d8c89a' })
}

/** 天花下的天軸（長鐵軸、軸承吊架與皮帶輪） */
export function lineShaftRig(b, x, y, z0, z1) {
  b.cylinder('steel', 0.035, 0.035, z1 - z0, 10, [x, y, (z0 + z1) / 2], { rotation: [Math.PI / 2, 0, 0], tint: '#3f3d3a' })
  for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3]) b.box('steel', [0.06, 0.3, 0.06], [x, y + 0.15, z], { tint: '#34312e' })
}

/** 木櫃（抽屜與木門；靠牆，正面朝向 facing 的 x 方向） */
export function drawerCabinet(b, detail, r, { facing = -1, tint = '#5a3d29', carved = false, drawers = 3 } = {}) {
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const w = r.maxX - r.minX
  const d = r.maxZ - r.minZ
  const H = r.height
  b.box('wood', [w, H - 0.08, d], [cx, (H - 0.08) / 2 + 0.08, cz], { tint })
  b.box('wood', [w + 0.04, 0.04, d + 0.04], [cx, H + 0.02, cz], { tint: shade(tint, 0.85) })
  for (const s of [-1, 1]) for (const t of [-1, 1]) b.box('wood', [0.05, 0.1, 0.05], [cx + s * (w / 2 - 0.04), 0.05, cz + t * (d / 2 - 0.04)], { tint: shade(tint, 0.7) })
  const fx = facing > 0 ? r.maxX + 0.005 : r.minX - 0.005
  const dh = (H - 0.2) / (drawers + 1)
  for (let i = 0; i < drawers; i++) {
    const y = H - 0.08 - dh * (i + 0.5)
    b.box('wood', [0.02, dh - 0.04, d - 0.1], [fx, y, cz], { tint: shade(tint, 1.12) })
    b.box('steel', [0.02, 0.02, 0.08], [fx + facing * 0.012, y, cz], { tint: '#b39a5a' })
  }
  // 下方的兩扇木門（雕花的面板）
  for (const s of [-1, 1]) {
    b.box('wood', [0.02, dh * 1.2, d / 2 - 0.08], [fx, 0.12 + dh * 0.6, cz + s * (d / 4)], { tint: shade(tint, 1.08) })
    if (carved) for (let k = 0; k < 3; k++) detail.add('wood', new TorusGeometry(0.04, 0.008, 4, 10), { position: [fx + facing * 0.012, 0.12 + dh * (0.3 + k * 0.3), cz + s * (d / 4)], rotation: [0, Math.PI / 2, 0], tint: shade(tint, 0.75) })
  }
}

/** 竹耙、木掃、木鏟（靠牆的木製農具） */
export function farmTools(b, x, z, { rotationY = 0, aged = false } = {}) {
  const wood = aged ? '#6a5038' : '#8a6a44'
  b.group([x, 0, z], rotationY, () => {
    // 木耙：長柄與一排木齒
    b.box('wood', [0.03, 1.5, 0.03], [0, 0.78, 0], { rotation: [0, 0, 0.18], tint: wood })
    b.box('wood', [0.4, 0.05, 0.04], [-0.13, 0.06, 0], { rotation: [0, 0, 0.18], tint: wood })
    for (let i = 0; i < 6; i++) b.box('wood', [0.015, 0.09, 0.015], [-0.3 + i * 0.07, 0.02, 0], { tint: wood })
    // 木鏟（翻稻穀用）
    b.box('wood', [0.03, 1.4, 0.03], [0.22, 0.72, 0.05], { rotation: [0, 0, 0.14], tint: shade(wood, 0.9) })
    b.box('wood', [0.24, 0.3, 0.02], [0.13, 0.16, 0.05], { rotation: [0, 0, 0.14], tint: shade(wood, 1.05) })
    // 竹掃帚
    b.cylinder('bamboo', 0.014, 0.014, 1.3, 6, [0.45, 0.68, -0.02], { rotation: [0, 0, 0.1], tint: '#b58a52' })
    b.add('bamboo', new CylinderGeometry(0.04, 0.13, 0.42, 8, 1, true), { position: [0.39, 0.2, -0.02], rotation: [0, 0, 0.1], tint: '#a88050' })
  })
}

/** 稻穀堆（金黃的稻穀，表面不平） */
export function paddyHeap(b, detail, x, z, r, h, seed = 1) {
  const rng = createRng(seed)
  b.add('plain', new IcosahedronGeometry(r, 2), { position: [x, 0, z], scale: [1, h / r, 0.85], tint: '#8f6a20' })
  for (let i = 0; i < 4; i++) b.add('plain', new IcosahedronGeometry(r * 0.4, 1), { position: [x + (rng() - 0.5) * r, h * 0.5 * rng(), z + (rng() - 0.5) * r * 0.7], scale: [1, 0.5, 1], tint: rng() < 0.5 ? '#9a7426' : '#a8822e' })
  for (let i = 0; i < 30; i++) detail.add('plain', new IcosahedronGeometry(0.008, 0), { position: [x + (rng() - 0.5) * r * 2.6, 0.04, z + (rng() - 0.5) * r * 2.2], scale: [2, 0.7, 1], tint: '#c9a24e' })
}
