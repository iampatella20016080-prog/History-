import { CylinderGeometry, IcosahedronGeometry, Shape, SphereGeometry, TorusGeometry } from 'three'
import { MARKET, STALLS, stallFrame, stallSign } from './yongleMarket.js'
import { shade } from './props.js'

/**
 * 永樂市場一樓的室內細部（按需載入）：地磚、牆面、天花管線與日光燈、吊牌、八個模組化攤位與商品。
 * 只產生幾何；招牌、遮擋方塊與碰撞在 yongleMarket.js（街景資料的一部分）。
 *
 * 攤位由同一個模組函式產生（攤位外殼＋櫃台＋後方工作區），再依品項放上不同的商品；
 * 重複的道具都由同一組小函式產生，並依材質合併成少數網格。
 *
 * 座標同 yongleMarket.js：原點在大門外緣中央，+z 朝外（迪化街），室內在 -z。
 */
const H = MARKET.hall
const CEIL = H.ceiling

/* ── 小道具 ─────────────────────────────── */

const blob = (b, material, r, position, scale, tint, detail = 1) =>
  b.add(material, new IcosahedronGeometry(r, detail), { position, scale, tint })

/** 塑膠籃（有提把的開口箱） */
function crate(b, x, y, z, { w = 0.5, d = 0.36, h = 0.26, tint = '#2f6fb0' } = {}) {
  b.box('plain', [w, 0.03, d], [x, y + 0.015, z], { tint })
  for (const side of [-1, 1]) {
    b.box('plain', [w, h, 0.025], [x, y + h / 2, z + side * (d / 2)], { tint })
    b.box('plain', [0.025, h, d], [x + side * (w / 2), y + h / 2, z], { tint })
  }
}

/** 紙箱 */
function carton(b, x, y, z, w, h, d, tint = '#c9a476', rotation = 0) {
  b.box('plain', [w, h, d], [x, y + h / 2, z], { tint, rotation: [0, rotation, 0] })
  b.box('plain', [w + 0.005, 0.02, d * 0.3], [x, y + h - 0.01, z], { tint: shade(tint, 0.85), rotation: [0, rotation, 0] })
}

/** 層架：直柱與幾層隔板 */
function shelf(b, x, z, { w = 1.2, d = 0.4, h = 1.8, levels = 4, material = 'steel', tint = '#cfd3d4' } = {}) {
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) b.box(material, [0.03, h, 0.03], [x + sx * (w / 2 - 0.015), h / 2, z + sz * (d / 2 - 0.015)], { tint })
  }
  const ys = []
  for (let i = 0; i < levels; i++) {
    const y = 0.15 + (i * (h - 0.2)) / (levels - 1)
    b.box(material, [w, 0.025, d], [x, y, z], { tint })
    ys.push(y + 0.0125)
  }
  return ys
}

/** 不鏽鋼工作台 */
function steelTable(b, x, z, { w = 1.4, d = 0.6, h = 0.85 } = {}) {
  b.box('steel', [w, 0.04, d], [x, h - 0.02, z], { tint: '#d9dcdd' })
  b.box('steel', [w - 0.06, 0.025, d - 0.06], [x, 0.22, z], { tint: '#c9cdce' })
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) b.box('steel', [0.035, h - 0.04, 0.035], [x + sx * (w / 2 - 0.04), (h - 0.04) / 2, z + sz * (d / 2 - 0.04)], { tint: '#bfc4c5' })
  }
}

/** 電子秤 */
function scale(b, x, y, z) {
  b.box('plain', [0.28, 0.08, 0.3], [x, y + 0.04, z], { tint: '#e8e6e0' })
  b.box('steel', [0.26, 0.012, 0.22], [x, y + 0.086, z - 0.02], { tint: '#dfe2e3' })
  b.box('dark', [0.14, 0.05, 0.02], [x, y + 0.06, z + 0.15], { tint: '#3d4a3f' })
}

/** 玻璃展示櫃（不鏽鋼框＋透明玻璃，裡面兩層托盤） */
function glassCase(b, x, z, w, { h = 1.15, d = 0.7 } = {}) {
  b.box('steel', [w, 0.62, d], [x, 0.31, z], { tint: '#cdd1d2' })
  b.box('glassClear', [w - 0.04, h - 0.64, d - 0.04], [x, 0.62 + (h - 0.64) / 2, z], { tint: '#e6eff0' })
  for (const sx of [-1, 1]) {
    b.box('steel', [0.03, h - 0.62, 0.03], [x + sx * (w / 2 - 0.015), 0.62 + (h - 0.62) / 2, z + d / 2 - 0.015], { tint: '#bfc4c5' })
  }
  b.box('steel', [w, 0.03, d], [x, h, z], { tint: '#cdd1d2' })
  b.box('steel', [w - 0.08, 0.015, d - 0.1], [x, 0.86, z - 0.02], { tint: '#dfe2e3' })
  return [0.635, 0.875]
}

/** 吊燈（細桿、圓錐燈罩、燈泡） */
function pendant(b, x, y, z, tint = '#7f8a86') {
  b.box('plain', [0.015, CEIL - y - 0.1, 0.015], [x, (CEIL + y + 0.1) / 2, z], { tint: '#3a3634' })
  b.add('plain', new CylinderGeometry(0.06, 0.24, 0.2, 12, 1, true), { position: [x, y, z], tint })
  b.add('bulb', new SphereGeometry(0.06, 8, 6), { position: [x, y - 0.07, z], tint: '#fff6dc' })
}

/** 雙管日光燈（白色燈座、兩支燈管）；along：燈管方向沿 x 或 z */
function tubeLight(b, x, y, z, along = 'z', length = 1.25) {
  const rot = along === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]
  const size = along === 'z' ? [0.26, 0.05, length] : [length, 0.05, 0.26]
  b.box('plain', size, [x, y + 0.04, z], { tint: '#eceeed' })
  for (const o of [-0.06, 0.06]) {
    const p = along === 'z' ? [x + o, y, z] : [x, y, z + o]
    b.cylinder('bulb', 0.018, 0.018, length - 0.06, 6, p, { rotation: rot, tint: '#ffffff' })
  }
  // 吊線
  for (const k of [-0.4, 0.4]) {
    const p = along === 'z' ? [x, (y + 3.7) / 2, z + k * length] : [x + k * length, (y + 3.7) / 2, z]
    b.box('plain', [0.008, 3.7 - y, 0.008], p, { tint: '#3a3634' })
  }
}

/* ── 粿與米食（好粿緣的商品）：形狀、厚度與顏色各不相同 ── */

/** 墊在粿下面的葉片（方形） */
function leaf(b, x, y, z, s = 1) {
  b.box('plain', [0.13 * s, 0.006, 0.11 * s], [x, y + 0.003, z], { tint: '#5f8a3a' })
}

/** 草仔粿：深綠色、扁圓、底下墊葉片 */
function caoGuo(b, x, y, z) {
  leaf(b, x, y, z)
  blob(b, 'plain', 0.056, [x, y + 0.03, z], [1, 0.55, 0.86], '#486a2e')
}

/** 紅龜粿：紅色龜殼形，表面有印模壓出的紋路（綠色的是艾草龜粿） */
function hongGui(b, x, y, z, tint = '#cf3840', pattern = '#b52b33') {
  leaf(b, x, y, z, 1.25)
  blob(b, 'plain', 0.068, [x, y + 0.028, z], [1.25, 0.44, 0.95], tint)
  b.cylinder('plain', 0.037, 0.041, 0.016, 6, [x, y + 0.056, z], { tint: pattern })
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    b.box('plain', [0.016, 0.011, 0.016], [x + Math.cos(a) * 0.063, y + 0.05, z + Math.sin(a) * 0.048], { tint: pattern })
  }
}

/** 蘿蔔糕：米白色長方塊（切片疊放） */
function luoboGao(b, x, y, z, slices = 3) {
  for (let i = 0; i < slices; i++) {
    b.box('plain', [0.18, 0.05, 0.11], [x + i * 0.012, y + 0.025 + i * 0.052, z], { tint: i % 2 ? '#efe5cf' : '#f3ead6' })
  }
}

/** 芋粿巧（芋粿曲）：灰紫色、彎成弧形的長條，帶著芋頭丁 */
function yuGuoQiao(b, x, y, z, turn = 0) {
  const r = 0.075
  const arc = 2.3
  // 圓環的一段（弧的中間朝向 +z），壓扁後平放
  const start = -Math.PI / 2 - arc / 2 + turn
  b.add('plain', new TorusGeometry(r, 0.027, 6, 12, arc), {
    position: [x, y + 0.02, z],
    rotation: [-Math.PI / 2, 0, start],
    scale: [1, 1, 0.75],
    tint: '#9d8fa8',
  })
  for (let i = 0; i < 4; i++) {
    const a = start + ((i + 0.5) / 4) * arc
    b.box('plain', [0.018, 0.01, 0.018], [x + Math.cos(a) * r, y + 0.04, z - Math.sin(a) * r], { tint: '#6f5f80' })
  }
}

/** 紫米糕：深紫色的長方塊，帶著紅色的米粒 */
function ziMiGao(b, x, y, z) {
  b.box('plain', [0.16, 0.055, 0.11], [x, y + 0.0275, z], { tint: '#3d2436' })
  for (let i = 0; i < 4; i++) {
    b.box('plain', [0.018, 0.008, 0.014], [x - 0.054 + i * 0.036, y + 0.057, z + (i % 2 ? 0.024 : -0.02)], { tint: '#a8414c' })
  }
}

/** 透明杯裝的深色凍（照片中櫃台前方的杯子）：透明杯、深色內容、白色杯蓋 */
function jellyCup(b, x, y, z) {
  b.cylinder('glassClear', 0.042, 0.034, 0.075, 10, [x, y + 0.0375, z], { tint: '#eef3f4' })
  b.cylinder('plain', 0.037, 0.031, 0.055, 10, [x, y + 0.03, z], { tint: '#2a201c' })
  b.cylinder('plain', 0.045, 0.045, 0.012, 10, [x, y + 0.081, z], { tint: '#f6f5f0' })
}

/** 透明包裝袋：罩在一排商品上的薄透明盒 */
function bag(b, x, y, z, w, h, d) {
  b.box('glassClear', [w, h, d], [x, y + h / 2, z], { tint: '#f4f7f8' })
  b.box('plain', [w * 0.25, 0.012, d + 0.004], [x, y + h - 0.006, z], { tint: '#d8443c' })
}

/** 木製托盤（有邊框、底部是不鏽鋼網） */
function tray(b, x, y, z, w, d) {
  b.box('steel', [w - 0.04, 0.012, d - 0.04], [x, y + 0.006, z], { tint: '#c9cdce' })
  for (const s of [-1, 1]) {
    b.box('wood', [w, 0.05, 0.025], [x, y + 0.025, z + s * (d / 2)], { tint: '#b98a5c' })
    b.box('wood', [0.025, 0.05, d], [x + s * (w / 2), y + 0.025, z], { tint: '#b98a5c' })
  }
}

/** 木牌（插在托盤上的品名牌；字由街景的招牌層畫上） */
function woodTag(b, x, y, z) {
  b.box('wood', [0.36, 0.1, 0.012], [x, y, z], { tint: '#d8b78a' })
  b.box('wood', [0.015, 0.12, 0.012], [x, y - 0.1, z - 0.004], { tint: '#a37a50' })
}

/* ── 攤位模組 ─────────────────────────────── */

const SIGN_COLORS = {
  greenBoard: '#45b23f',
  stallRed: '#c0392b',
  stallYellow: '#efc22b',
  stallWhite: '#f4f2ec',
  stallBlue: '#2f5f9e',
}

/** 攤位外殼：後牆磁磚、兩側隔板、招牌底板與一支直立的日光燈 */
function stallShell(b, stall, frame) {
  const W = frame.width
  const D = frame.depth
  b.box('whiteTile', [W - 0.06, 2.3, 0.04], [0, 1.15, -D + 0.05], { tint: '#f4f3ef' })
  b.box('stucco', [W - 0.06, CEIL - 2.3, 0.04], [0, (2.3 + CEIL) / 2, -D + 0.05], { tint: '#e6e3dc' })
  for (const side of [-1, 1]) {
    const x = side * (W / 2 - 0.03)
    b.box('steel', [0.04, 1.0, D - 0.1], [x, 0.5, -D / 2], { tint: '#cfd3d4' })
    b.box('stucco', [0.04, 1.5, D - 0.6], [x, 1.75, -D / 2 - 0.25], { tint: '#ecebe6' })
    b.box('steel', [0.08, 2.5, 0.08], [x, 1.25, -0.06], { tint: '#bfc4c5' })
  }
  const sign = stallSign(stall)
  b.box('plain', [sign.width, sign.height, 0.1], [sign.x, sign.y, 0.06], { tint: SIGN_COLORS[stall.style] ?? '#c0392b' })
  b.box('plain', [sign.width + 0.06, 0.05, 0.14], [sign.x, sign.y + sign.height / 2 + 0.02, 0.06], { tint: '#e9ebea' })
  // 支撐招牌的吊桿
  for (const x of [sign.x - sign.width / 2 + 0.3, sign.x + sign.width / 2 - 0.3]) {
    b.box('plain', [0.03, CEIL - 3.3, 0.03], [x, (CEIL + 3.3) / 2, 0.05], { tint: '#4a4644' })
  }
  // 攤位前緣上方的日光燈
  tubeLight(b, 0, 3.55, -0.4, 'x', 1.6)
}

/** 後方工作區的共同道具：層架、紙箱與塑膠籃 */
function backArea(b, frame, { fridge = false, tint = '#cfd3d4' } = {}) {
  const D = frame.depth
  const ys = shelf(b, -0.8, -D + 0.3, { w: 1.4, d: 0.42, h: 1.9, levels: 4, tint })
  carton(b, -1.2, ys[1], -D + 0.3, 0.32, 0.22, 0.3)
  carton(b, -0.85, ys[1], -D + 0.3, 0.28, 0.18, 0.3, '#e8e4da')
  carton(b, -0.45, ys[2], -D + 0.3, 0.4, 0.26, 0.32)
  crate(b, -1.1, ys[0], -D + 0.3, { w: 0.46, d: 0.34, h: 0.2, tint: '#2f6fb0' })
  crate(b, -0.55, ys[0], -D + 0.3, { w: 0.46, d: 0.34, h: 0.2, tint: '#d1453b' })
  if (fridge) {
    b.box('plain', [0.7, 1.9, 0.65], [1.15, 0.95, -D + 0.4], { tint: '#f1f1ee' })
    b.box('glassClear', [0.6, 1.4, 0.02], [1.15, 1.05, -D + 0.735], { tint: '#e6eff0' })
    for (const y of [0.55, 0.95, 1.35]) b.box('plain', [0.58, 0.02, 0.5], [1.15, y, -D + 0.4], { tint: '#d9dcdd' })
    b.box('plain', [0.04, 0.5, 0.04], [0.86, 1.1, -D + 0.76], { tint: '#9aa0a3' })
  }
  // 地上的塑膠籃與小凳
  crate(b, 0.2, 0, -D + 0.45, { tint: '#3b8a5a' })
  b.cylinder('plain', 0.15, 0.13, 0.42, 10, [0.75, 0.21, -1.7], { tint: '#d1453b' })
}

/** 好粿緣：木製糕粿展示櫃、多層托盤、透明包裝的粿、木牌、加熱說明牌、後方工作區 */
function haoGuoYuan(b, frame) {
  const D = frame.depth
  // 下層木櫃
  b.box('wood', [3.1, 0.76, 0.9], [0, 0.38, -0.5], { tint: '#a87a50' })
  for (const x of [-1.03, 0, 1.03]) b.box('wood', [0.04, 0.6, 0.02], [x, 0.4, -0.04], { tint: '#8c6440' })
  // 上層的階梯木架
  b.box('wood', [3.1, 0.24, 0.42], [0, 0.88, -0.74], { tint: '#b28554' })
  const t1 = 0.76
  const t2 = 1.0
  const trays1 = [-1.03, 0, 1.03]
  for (const x of trays1) tray(b, x, t1, -0.27, 0.98, 0.42)
  for (const x of trays1) tray(b, x, t2, -0.74, 0.98, 0.4)

  // 品項依實地照片中的價目表與品名牌：草仔粿、紅龜粿與艾草龜粿、芋粿巧、蘿蔔糕、紫米糕
  // 第一層：草仔粿、紅龜粿（各自裝在透明袋裡）、杯裝凍、蘿蔔糕
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) caoGuo(b, -1.4 + i * 0.13, t1 + 0.012, -0.18 - j * 0.14)
  }
  bag(b, -1.27, t1 + 0.012, -0.25, 0.42, 0.075, 0.32)
  for (let i = 0; i < 3; i++) caoGuo(b, -0.86 + i * 0.13, t1 + 0.012, -0.24)
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) hongGui(b, -0.28 + i * 0.17, t1 + 0.012, -0.17 - j * 0.15)
  }
  bag(b, -0.2, t1 + 0.012, -0.24, 0.42, 0.075, 0.34)
  hongGui(b, 0.25, t1 + 0.012, -0.22)
  for (let i = 0; i < 6; i++) jellyCup(b, 0.64 + (i % 3) * 0.1, t1 + 0.012, -0.12 - Math.floor(i / 3) * 0.1)
  for (let i = 0; i < 2; i++) luoboGao(b, 1.02 + i * 0.22, t1 + 0.012, -0.26, 2 + i)
  bag(b, 1.13, t1 + 0.012, -0.26, 0.5, 0.17, 0.18)
  // 第二層：芋粿巧（弧形）、紫米糕、艾草龜粿
  for (let i = 0; i < 3; i++) yuGuoQiao(b, -1.35 + i * 0.22, t2 + 0.012, -0.74, (i - 1) * 0.3)
  bag(b, -1.13, t2 + 0.012, -0.73, 0.7, 0.07, 0.2)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) ziMiGao(b, -0.3 + i * 0.19, t2 + 0.012, -0.66 - j * 0.14)
  }
  bag(b, -0.11, t2 + 0.012, -0.73, 0.6, 0.065, 0.3)
  for (let i = 0; i < 3; i++) hongGui(b, 0.74 + i * 0.2, t2 + 0.012, -0.72, '#5f8f3e', '#4a7430')
  // 木牌：第一層與第二層的前緣（字由招牌層畫上，見 yongleMarket.js）
  for (const x of [-0.85, -0.12, 1.1]) woodTag(b, x, 0.98, -0.07)
  for (const x of [-1.13, -0.1, 0.94]) woodTag(b, x, 1.22, -0.52)
  // 加熱說明牌（壓克力立牌，左前角，斜對著走道）
  b.box('glassClear', [0.46, 0.36, 0.02], [-1.36, 0.94, -0.03], { tint: '#f4f7f8', rotation: [0, 0.35, 0] })
  b.box('plain', [0.42, 0.32, 0.006], [-1.36, 0.94, -0.03], { tint: '#f7f5ee', rotation: [0, 0.35, 0] })
  // 少量紙盒
  carton(b, 1.42, t1 + 0.012, -0.14, 0.2, 0.09, 0.2, '#f1ece2')
  carton(b, 1.42, t1 + 0.1, -0.14, 0.2, 0.09, 0.2, '#e8d9bd')

  // 招牌左側的商品照片板（上半是粉紅與褐色的粿，下半是深紫色的紫米糕）
  b.box('plain', [0.66, 0.86, 0.06], [-1.28, 2.98, 0.06], { tint: '#3a2b26' })
  for (let i = 0; i < 6; i++) {
    blob(b, 'plain', 0.07, [-1.46 + (i % 3) * 0.18, 3.27 - Math.floor(i / 3) * 0.17, 0.1], [1, 0.8, 0.35], i % 2 ? '#e7869b' : '#d4a46e', 0)
  }
  b.box('plain', [0.58, 0.3, 0.02], [-1.28, 2.75, 0.095], { tint: '#3d2436' })
  for (let i = 0; i < 5; i++) b.box('plain', [0.05, 0.03, 0.01], [-1.5 + i * 0.11, 2.72 + (i % 2) * 0.08, 0.108], { tint: '#a8414c' })
  // 招牌前的吊燈
  pendant(b, 0.3, 2.44, 0.32, '#8e9792')
  // 左側柱上的直立日光燈（照片左側）
  b.box('plain', [0.1, 1.5, 0.08], [-1.68, 1.6, 0.05], { tint: '#eceeed' })
  b.cylinder('bulb', 0.02, 0.02, 1.4, 6, [-1.68, 1.6, 0.1], { tint: '#ffffff' })

  // 後方工作區：不鏽鋼工作台、蒸籠與容器、冰箱、層架、粉紅色的塑膠袋、紅色的「福」字
  steelTable(b, 0.1, -D + 0.45, { w: 1.4, d: 0.6 })
  for (let i = 0; i < 3; i++) b.cylinder('wood', 0.2, 0.2, 0.1, 14, [-0.3 + 0.02 * i, 0.9 + i * 0.1, -D + 0.45], { tint: i % 2 ? '#c9a26e' : '#b98f5b' })
  b.cylinder('steel', 0.16, 0.16, 0.22, 12, [0.45, 0.96, -D + 0.45], { tint: '#d9dcdd' })
  scale(b, -0.3, 0.76, -0.68)
  backArea(b, frame, { fridge: true })
  b.box('plain', [0.32, 0.4, 0.06], [-1.45, 1.75, -D + 0.6], { tint: '#e8a3b6' })
  b.box('plain', [0.36, 0.36, 0.02], [0.2, 1.9, -D + 0.08], { tint: '#d0343a', rotation: [0, 0, Math.PI / 4] })
  // 牆上的價目表
  for (const x of [-0.6, 0.1]) {
    b.box('plain', [0.5, 0.66, 0.01], [x, 2.15, -D + 0.075], { tint: '#f7f5ee' })
    for (let k = 0; k < 4; k++) b.box('plain', [0.36, 0.03, 0.005], [x, 2.35 - k * 0.12, -D + 0.08], { tint: k % 2 ? '#c84a3c' : '#3f6b3a' })
  }
}

/** 其他攤位的櫃台與商品（只用一般的品項，不代表特定店家） */
function genericStall(b, stall, frame) {
  const D = frame.depth
  const kind = stall.kind
  if (kind === 'fruit') {
    // 斜放的水果箱
    for (let i = 0; i < 3; i++) {
      const x = -1.05 + i * 1.05
      b.box('wood', [0.95, 0.7, 0.8], [x, 0.35, -0.45], { tint: '#9a7552' })
      b.group([x, 0.78, -0.42], 0, () => {
        b.box('wood', [0.9, 0.05, 0.7], [0, 0, 0], { tint: '#b98a5c', rotation: [-0.25, 0, 0] })
        const colors = [['#f08a24', '#f39a33'], ['#c72f2f', '#d94a3a'], ['#8bbf45', '#9ccc52']][i]
        for (let k = 0; k < 14; k++) {
          const px = -0.33 + (k % 5) * 0.165
          const pz = -0.22 + Math.floor(k / 5) * 0.18
          blob(b, 'plain', 0.07, [px, 0.06 + (0.22 - pz) * 0.25, pz], [1, 0.92, 1], colors[k % 2], 0)
        }
      })
    }
    scale(b, 1.2, 0.72, -1.1)
    crate(b, -1.2, 0, -1.4, { tint: '#d1453b' })
    crate(b, -0.6, 0, -1.4, { tint: '#d1453b' })
    crate(b, -0.9, 0.27, -1.4, { tint: '#2f6fb0' })
  } else if (kind === 'braised') {
    const [low, high] = glassCase(b, -0.2, -0.45, 2.5)
    for (const y of [low, high]) {
      for (let k = 0; k < 8; k++) {
        const x = -1.3 + k * 0.3
        b.box('steel', [0.26, 0.03, 0.4], [x, y + 0.015, -0.45], { tint: '#dfe2e3' })
        if (k % 3 === 0) blob(b, 'plain', 0.07, [x, y + 0.07, -0.45], [1.3, 0.6, 1], '#7b4527', 0)
        else if (k % 3 === 1) b.box('plain', [0.18, 0.05, 0.12], [x, y + 0.055, -0.45], { tint: '#8a5a33' })
        else for (let e = 0; e < 3; e++) blob(b, 'plain', 0.03, [x - 0.06 + e * 0.06, y + 0.06, -0.42], [1, 1.25, 1], '#6b3a22', 0)
      }
    }
    pendant(b, -0.2, 2.25, -0.45, '#c9a26e')
    steelTable(b, 0.4, -D + 0.45, { w: 1.6 })
    b.cylinder('steel', 0.24, 0.24, 0.32, 14, [0.0, 1.0, -D + 0.45], { tint: '#cfd3d4' })
  } else if (kind === 'noodle') {
    steelTable(b, -0.2, -0.45, { w: 2.6, d: 0.75 })
    for (let k = 0; k < 10; k++) {
      const x = -1.3 + (k % 5) * 0.27
      const z = -0.3 - Math.floor(k / 5) * 0.3
      b.cylinder('plain', 0.07, 0.07, 0.2, 8, [x, 0.95, z], { rotation: [0, 0, Math.PI / 2], tint: '#efe2bb' })
      if (k % 2 === 0) bag(b, x, 0.85, z, 0.24, 0.16, 0.18)
    }
    for (let k = 0; k < 3; k++) b.box('cloth', [0.4, 0.55, 0.3], [0.7 + k * 0.1, 0.3, -1.4 - k * 0.35], { tint: '#ece4d2' })
  } else if (kind === 'pickle') {
    steelTable(b, -0.2, -0.45, { w: 2.6, d: 0.75 })
    const fills = ['#d44a2a', '#e0b23a', '#6e8d3c', '#b8463a', '#e7d9a8']
    for (let k = 0; k < 10; k++) {
      const x = -1.3 + (k % 5) * 0.28
      const z = -0.3 - Math.floor(k / 5) * 0.3
      b.cylinder('glassClear', 0.1, 0.1, 0.18, 12, [x, 0.94, z], { tint: '#eef3f4' })
      b.cylinder('plain', 0.09, 0.09, 0.13, 12, [x, 0.915, z], { tint: fills[k % fills.length] })
    }
  } else if (kind === 'zong') {
    steelTable(b, -0.2, -0.45, { w: 2.6, d: 0.75 })
    // 掛起來的粽子串
    b.box('steel', [2.6, 0.03, 0.03], [-0.2, 2.15, -0.25], { tint: '#bfc4c5' })
    for (let k = 0; k < 7; k++) {
      const x = -1.35 + k * 0.38
      b.box('plain', [0.008, 0.4, 0.008], [x, 1.95, -0.25], { tint: '#d8c48e' })
      for (let e = 0; e < 3; e++) {
        b.add('plain', new CylinderGeometry(0.001, 0.07, 0.13, 3), { position: [x + (e - 1) * 0.06, 1.68 - (e % 2) * 0.06, -0.25], rotation: [0, e, Math.PI], tint: '#6e8d3c' })
      }
    }
    b.cylinder('steel', 0.26, 0.26, 0.42, 14, [0.6, 1.06, -0.5], { tint: '#cfd3d4' })
    b.cylinder('steel', 0.27, 0.27, 0.04, 14, [0.6, 1.29, -0.5], { tint: '#dfe2e3' })
  } else if (kind === 'dessert') {
    steelTable(b, -0.2, -0.45, { w: 2.6, d: 0.75 })
    for (let k = 0; k < 3; k++) {
      b.cylinder('steel', 0.2, 0.2, 0.3, 14, [-1.1 + k * 0.5, 1.0, -0.45], { tint: '#cfd3d4' })
      b.cylinder('plain', 0.18, 0.18, 0.02, 14, [-1.1 + k * 0.5, 1.14, -0.45], { tint: ['#f4ecd8', '#6b3a22', '#e6c46a'][k] })
    }
    for (let k = 0; k < 4; k++) b.cylinder('plain', 0.075, 0.05, 0.05, 10, [0.6, 0.88 + k * 0.05, -0.35], { tint: '#f4f2ec' })
    b.box('plain', [0.6, 0.45, 0.02], [0.7, 1.55, -D + 0.08], { tint: '#f7f5ee' })
  } else {
    // 南北貨：竹篩與木桶裡的乾貨、玻璃罐
    for (let i = 0; i < 4; i++) {
      const x = -1.2 + i * 0.75
      b.cylinder('wood', 0.3, 0.26, 0.6, 12, [x, 0.3, -0.45], { tint: '#9a7552' })
      b.cylinder('plain', 0.27, 0.27, 0.03, 12, [x, 0.61, -0.45], { tint: ['#8a5a33', '#c84a3c', '#d9b25c', '#5a3a24'][i] })
      for (let e = 0; e < 5; e++) {
        blob(b, 'plain', 0.04, [x - 0.12 + e * 0.06, 0.64, -0.45 + (e % 2 ? 0.08 : -0.07)], [1, 0.6, 1], ['#7b4527', '#b8463a', '#e2b24a', '#4a2f22'][i], 0)
      }
    }
    for (let k = 0; k < 5; k++) b.cylinder('glassClear', 0.08, 0.08, 0.2, 10, [-1.1 + k * 0.45, 1.0, -1.2], { tint: '#eef3f4' })
    b.box('wood', [2.6, 0.06, 0.4], [-0.2, 0.88, -1.2], { tint: '#9a7552' })
  }
  backArea(b, frame, { fridge: kind === 'braised' || kind === 'dessert' || kind === 'zong' })
}

/* ── 大廳：地磚、牆面、天花、管線、燈具、吊牌、門廳與走道盡頭 ── */

function hallFinishes(b) {
  const { half, front, back } = H
  const depth = front - back
  const zc = (front + back) / 2
  // 灰色市場地磚（攤位內略深）與門口的地墊
  b.box('marketTile', [half * 2, 0.03, depth], [0, 0.015, zc], { tint: '#d2d4d2' })
  for (const side of [-1, 1]) {
    b.box('marketTile', [half - MARKET.aisleHalf, 0.035, MARKET.stallLength * 4], [side * (half + MARKET.aisleHalf) / 2, 0.0175, MARKET.stallFront - MARKET.stallLength * 2], { tint: '#b9bcba' })
  }
  b.box('plain', [3.4, 0.012, 1.2], [0, 0.036, front - 0.8], { tint: '#3d3a38' })
  // 牆面：下半部白磁磚、上半部油漆（門廳與走道盡頭看得到的部分）
  const wallFinish = (x, z, w, rotationY) =>
    b.group([x, 0, z], rotationY, () => {
      b.box('whiteTile', [w, 2.2, 0.03], [0, 1.1, 0], { tint: '#f1f0ec' })
      b.box('stucco', [w, CEIL - 2.2, 0.03], [0, (2.2 + CEIL) / 2, 0], { tint: '#e3e0d8' })
    })
  for (const side of [-1, 1]) {
    wallFinish(side * (half - 0.035), front - 1.1, 2.2, side * (-Math.PI / 2))
    wallFinish(side * (half - 0.035), back + 1.9, 3.8, side * (-Math.PI / 2))
  }
  // 大門內側（左右兩段）與後牆
  for (const side of [-1, 1]) wallFinish(side * (half + MARKET.doorHalf) / 2, front - 0.035, half - MARKET.doorHalf, Math.PI)
  b.box('stucco', [MARKET.doorHalf * 2, CEIL - MARKET.doorHeight - 0.12, 0.03], [0, (CEIL + MARKET.doorHeight + 0.12) / 2, front - 0.035], { tint: '#e3e0d8' })
  wallFinish(0, back + 0.035, half * 2, 0)
  // 天花板（黑色）
  b.box('stucco', [half * 2, 0.03, depth], [0, CEIL - 0.015, zc], { tint: '#2f3133' })
}

function ceilingServices(b) {
  const { front, back } = H
  const z0 = front - 0.5
  const z1 = back + 0.4
  const len = z0 - z1
  const zc = (z0 + z1) / 2
  // 有孔的電纜線槽（兩條，沿著走道）與橫向的線槽
  for (const x of [-0.75, 0.75]) {
    b.box('perforated', [0.42, 0.02, len], [x, 3.7, zc], { tint: '#d6d9da' })
    for (const s of [-1, 1]) b.box('perforated', [0.02, 0.09, len], [x + s * 0.21, 3.745, zc], { tint: '#c9cdce' })
  }
  for (let z = front - 2.6; z > back + 1; z -= MARKET.stallLength) {
    b.box('perforated', [MARKET.hall.half * 2 - 0.4, 0.02, 0.36], [0, 3.86, z], { tint: '#d6d9da' })
  }
  // 管線
  for (const [x, r, tint] of [
    [-1.6, 0.06, '#5d6164'],
    [1.55, 0.05, '#7b7f82'],
    [0.05, 0.035, '#9a9fa2'],
  ]) {
    b.cylinder('plain', r, r, len, 8, [x, 3.98, zc], { rotation: [Math.PI / 2, 0, 0], tint })
  }
  // 走道上方的日光燈
  for (let z = front - 1.4; z > back + 1; z -= 2.6) tubeLight(b, 0, 3.4, z, 'z', 1.25)
  // 監視器
  for (const [x, z, r] of [
    [4.9, front - 0.7, -0.8],
    [-4.9, back + 0.8, 2.4],
  ]) {
    b.group([x, 3.85, z], r, () => {
      b.box('plain', [0.03, 0.25, 0.03], [0, 0.17, 0], { tint: '#d9d9d6' })
      b.box('plain', [0.12, 0.1, 0.24], [0, 0, 0.06], { tint: '#f1f1ee' })
      b.cylinder('dark', 0.035, 0.035, 0.02, 8, [0, 0, 0.18], { rotation: [Math.PI / 2, 0, 0], tint: '#2a2c2e' })
    })
  }
}

/** 白色指示吊牌上的紅色圓形箭頭 */
function arrowDisc(b, x, y, z, angle) {
  b.cylinder('plain', 0.1, 0.1, 0.02, 14, [x, y, z], { rotation: [Math.PI / 2, 0, 0], tint: '#c8282e' })
  const s = new Shape()
  s.moveTo(-0.018, -0.055)
  s.lineTo(0.018, -0.055)
  s.lineTo(0.018, 0.005)
  s.lineTo(0.045, 0.005)
  s.lineTo(0, 0.06)
  s.lineTo(-0.045, 0.005)
  s.lineTo(-0.018, 0.005)
  s.closePath()
  b.extrude('plain', s, 0.008, { position: [x, y, z + 0.011], rotation: [0, 0, angle], tint: '#ffffff' })
}

function hangingSigns(b) {
  const z = -1.97
  // 門廳的指示吊牌（1號門、3號門、5號門，下緣是紅色的「永樂市場」）
  b.box('plain', [2.74, 0.62, 0.05], [0, 3.18, z], { tint: '#f6f6f2' })
  b.box('plain', [2.74, 0.18, 0.052], [0, 2.99, z], { tint: '#c8282e' })
  for (const [x, angle] of [
    [-0.9, Math.PI / 4],
    [0, 0],
    [0.9, -Math.PI / 2],
  ]) {
    arrowDisc(b, x - 0.24, 3.25, z + 0.026, angle)
  }
  for (const x of [-1.2, 1.2]) b.box('plain', [0.02, CEIL - 3.49, 0.02], [x, (CEIL + 3.49) / 2, z], { tint: '#4a4644' })
  // 出口標示燈箱
  b.box('plain', [0.56, 0.24, 0.08], [0, 3.55, H.front - 0.04], { tint: '#1f8a4c' })
  // 走道盡頭的吊牌
  b.box('plain', [1.5, 0.4, 0.05], [0, 3.1, H.back + 1.57], { tint: '#c8282e' })
  for (const x of [-0.6, 0.6]) b.box('plain', [0.02, CEIL - 3.3, 0.02], [x, (CEIL + 3.3) / 2, H.back + 1.57], { tint: '#4a4644' })
}

function vestibuleAndEnd(b) {
  const { half, back } = H
  // 門廳牆上的公告欄（軟木板與幾張公告）
  b.box('wood', [0.04, 1.0, 1.4], [half - 0.06, 1.9, -1.5], { tint: '#b98a5c' })
  for (const [dz, dy, tint] of [
    [-0.4, 0.15, '#f7f5ee'],
    [0.1, 0.2, '#f2e4b0'],
    [0.45, -0.15, '#f7f5ee'],
    [-0.15, -0.22, '#dfe9f2'],
  ]) {
    b.box('plain', [0.01, 0.3, 0.24], [half - 0.085, 1.9 + dy, -1.5 + dz], { tint })
  }
  // 走道盡頭：洗手台、回收桶、拉下的鐵捲門（員工通道）
  b.box('steel', [1.0, 0.85, 1.3], [-half + 0.55, 0.425, back + 0.7], { tint: '#cfd3d4' })
  b.box('steel', [0.8, 0.12, 1.0], [-half + 0.55, 0.8, back + 0.7], { tint: '#dfe2e3' })
  for (const dz of [-0.3, 0.3]) b.box('steel', [0.04, 0.25, 0.04], [-half + 0.3, 1.0, back + 0.7 + dz], { tint: '#bfc4c5' })
  const bins = ['#2f6fb0', '#3b8a5a', '#e0b23a']
  bins.forEach((tint, i) => {
    b.box('plain', [0.48, 0.8, 0.5], [half - 0.32 - i * 0.52, 0.4, back + 0.4], { tint })
    b.box('plain', [0.5, 0.06, 0.52], [half - 0.32 - i * 0.52, 0.83, back + 0.4], { tint: shade(tint, 0.8) })
  })
  b.box('shutter', [2.6, 2.6, 0.05], [0, 1.3, back + 0.08], { tint: '#d4d3cd' })
  b.box('shutter', [2.7, 0.3, 0.25], [0, 2.75, back + 0.15], { tint: '#cfcec8' })
}

/* ── 主程式 ─────────────────────────────── */

export function buildYongleInterior(b) {
  hallFinishes(b)
  ceilingServices(b)
  hangingSigns(b)
  vestibuleAndEnd(b)
  for (const stall of STALLS) {
    const frame = stallFrame(stall)
    b.group(frame.position, frame.rotationY, () => {
      stallShell(b, stall, frame)
      if (stall.kind === 'guo') haoGuoYuan(b, frame)
      else genericStall(b, stall, frame)
    })
  }
}
