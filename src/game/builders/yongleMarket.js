import { CylinderGeometry, IcosahedronGeometry, Shape } from 'three'
import { bench, shade } from './props.js'

/**
 * 永樂市場（2000–現在）：迪化街街底的市場大樓與可以走進去的一樓市場。
 *
 * 依實地照片建模的外觀（尺寸由照片估算，不是測量）：
 * - 一樓騎樓：粉灰色花崗石方柱、灰色金屬飾帶、紅磚色地磚、玻璃門（彩虹色帶）
 * - 二樓：紅磚女兒牆與花崗石壓頂、紅磚柱墩；正中央是有深色外框的「永樂布業商場」大招牌
 * - 三樓以上退縮：深色玻璃帷幕（斜切的轉折面）、紅磚量體與女兒牆、後方紅磚樓梯塔
 * - 廣場：樹與圓形座椅、長椅、市場指示牌
 *
 * 一樓市場（簡化的概念配置，不是精確復原）：入口門廳、中央走道、兩側各四個攤位、走道盡頭。
 * 室內的細部模型（攤位、商品、天花管線與燈具）在 yongleInterior.js，按需載入；
 * 這裡只產生外觀、室內的外殼、招牌、遮擋方塊與碰撞資料。
 *
 * 本地座標：原點在一樓外牆（大門）外緣的中央；+z 朝外（迪化街方向），+x 沿著立面。
 * 店家資料的 site 把它放在街底、立面朝西，所以本地 +x 為世界 +z、本地 +z 為世界 -x。
 */
export const MARKET = {
  half: 9, // 立面半寬
  arcade: 2.2, // 騎樓深度（柱列外緣）
  wallT: 0.4,
  back: -20.8, // 後牆外緣
  doorHalf: 2.5,
  doorHeight: 3.0,
  groundH: 4.0, // 騎樓天花
  floor2: 4.8, // 二樓樓板頂
  floor3: 8.0,
  upperFront: -1.4, // 三樓以上退縮的玻璃帷幕
  top: 17.4,
  hall: { half: 5.4, front: -0.4, back: -20.4, ceiling: 4.2 },
  aisleHalf: 1.8,
  stallLength: 3.5,
  stallFront: -2.6, // 第一排攤位靠門的邊
  plaza: 8.0, // 廣場延伸到迪化街的街底（世界 x = 34.2）
  rowEnd: 6.2, // 兩側街屋的盡頭（世界 x = 36）
  columns: [-8.6, -6.0, -2.9, 2.9, 6.0, 8.6],
}

/**
 * 一樓的八個攤位（簡化配置）：side -1 在走道北側（世界 z < 0）、+1 在南側；index 0 最靠近大門。
 * 招牌只用一般的品項字，不虛構具名商號；好粿緣依實地照片，位於北側第二攤（攤位編號 1020）。
 */
export const STALLS = [
  { id: 'nanbei', side: -1, index: 0, sign: '南北貨', style: 'stallRed', kind: 'dry' },
  { id: 'hao-guo-yuan', side: -1, index: 1, sign: '好粿緣', style: 'greenBoard', kind: 'guo', storeId: 'hao-guo-yuan', number: '1020' },
  { id: 'zong', side: -1, index: 2, sign: '粽', style: 'stallYellow', kind: 'zong' },
  { id: 'douhua', side: -1, index: 3, sign: '豆花', style: 'stallWhite', kind: 'dessert' },
  { id: 'fruit', side: 1, index: 0, sign: '水果', style: 'stallYellow', kind: 'fruit' },
  { id: 'lu', side: 1, index: 1, sign: '滷味', style: 'stallRed', kind: 'braised' },
  { id: 'noodle', side: 1, index: 2, sign: '麵', style: 'stallBlue', kind: 'noodle' },
  { id: 'pickle', side: 1, index: 3, sign: '醬菜', style: 'stallWhite', kind: 'pickle' },
]

/** 攤位招牌（攤位座標）：好粿緣的綠色招牌較大，左邊留給商品照片板 */
export function stallSign(stall) {
  return stall.storeId ? { x: 0.4, y: 2.98, width: 2.5, height: 0.86 } : { x: 0, y: 2.9, width: 2.96, height: 0.68 }
}

/** 攤位的座標：原點在攤位正面（走道邊）中央，+z 朝走道、+x 沿著走道（攤位寬 3.5、深 3.6） */
export function stallFrame(stall) {
  const z = MARKET.stallFront - (stall.index + 0.5) * MARKET.stallLength
  return {
    position: [stall.side * MARKET.aisleHalf, 0, z],
    rotationY: stall.side < 0 ? Math.PI / 2 : -Math.PI / 2,
    width: MARKET.stallLength,
    depth: MARKET.hall.half - MARKET.aisleHalf,
  }
}

/** 攤位在市場本地座標中的範圍（走道邊到牆） */
export function stallRect(stall) {
  const z1 = MARKET.stallFront - stall.index * MARKET.stallLength
  const z0 = z1 - MARKET.stallLength
  const x0 = stall.side < 0 ? -MARKET.hall.half : MARKET.aisleHalf
  const x1 = stall.side < 0 ? -MARKET.aisleHalf : MARKET.hall.half
  return { minX: x0, maxX: x1, minZ: z0, maxZ: z1 }
}

const C = {
  granite: '#cdbab0', // 粉灰色花崗石（柱）
  graniteDark: '#a8968c',
  graniteLight: '#d9d2ca',
  frame: '#55595c',
  fascia: '#a3a8aa',
  brick: '#ffffff',
  glass: '#56656d',
  mullion: '#2f3539',
  stucco: '#d9d4cb',
  aluminium: '#b9bec2',
}

/* ── 廣場與騎樓地坪 ─────────────────────── */

function plaza(b) {
  const { half, arcade, plaza: edge, rowEnd } = MARKET
  // 街底中央（與迪化街相接）與兩側（街屋盡頭之後）的灰色鋪面，略高於街道鋪面避免閃爍
  b.box('pavers', [5.6, 0.045, edge - arcade], [0, 0.0225, (edge + arcade) / 2], { tint: '#ddd6c8' })
  for (const side of [-1, 1]) {
    b.box('pavers', [half - 2.8, 0.045, rowEnd - arcade], [side * (half + 2.8) / 2, 0.0225, (rowEnd + arcade) / 2], { tint: '#d6cfc1' })
  }
  // 紅磚色的分隔線
  for (const z of [3.4, 5.4]) b.box('pavers', [half * 2, 0.05, 0.28], [0, 0.025, z], { tint: '#b7735c' })
  // 騎樓的紅磚色地磚與大門的不鏽鋼門檻
  b.box('pavers', [half * 2, 0.055, arcade], [0, 0.0275, arcade / 2], { tint: '#b9664f' })
  b.box('steel', [MARKET.doorHalf * 2, 0.06, 0.18], [0, 0.03, 0.02], { tint: '#d9dcdd' })
}

/** 廣場的樹、圓形座椅、長椅與市場指示牌 */
function plazaProps(b) {
  // 大樹與圍著樹幹的八角形木座椅（照片左側）；樹冠不伸進騎樓與兩側街屋
  const tree = [-5.6, 4.3]
  b.cylinder('wood', 0.2, 0.3, 2.6, 8, [tree[0], 1.3, tree[1]], { tint: '#7d664f', grime: 0.2 })
  ;[
    [0, 3.4, 0, 1.35, '#86956f'],
    [0.75, 3.0, 0.4, 1.1, '#7f8e6b'],
    [-0.7, 3.1, -0.3, 1.15, '#8e9c77'],
    [0.2, 3.25, -0.8, 1.05, '#9aa682'],
    [-0.3, 3.8, 0.6, 0.95, '#8e9c77'],
  ].forEach(([dx, y, dz, r, tint], i) => {
    b.add('plain', new IcosahedronGeometry(r, 1), { position: [tree[0] + dx, y, tree[1] + dz], scale: [1, 0.74, 1], rotation: [0, i * 1.3, 0], tint })
  })
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    b.group([tree[0] + Math.sin(a) * 1.0, 0, tree[1] + Math.cos(a) * 1.0], a, () => {
      b.box('wood', [0.78, 0.06, 0.36], [0, 0.45, 0.06], { tint: '#9a5b3d' })
      b.box('plain', [0.06, 0.42, 0.3], [0, 0.21, 0.06], { tint: '#3a3634' })
    })
  }
  b.cylinder('stone', 0.62, 0.66, 0.14, 12, [tree[0], 0.07, tree[1]], { tint: '#bdb5a6' })
  // 右側的小松樹（照片右側）
  const pine = [6.3, 4.4]
  b.cylinder('wood', 0.08, 0.11, 0.9, 6, [pine[0], 0.45, pine[1]], { tint: '#7a5f47' })
  ;[
    [0.95, 1.2, 0.8],
    [0.78, 1.1, 1.5],
    [0.58, 1.0, 2.15],
    [0.36, 0.8, 2.7],
  ].forEach(([r, h, y], i) => {
    b.add('plain', new CylinderGeometry(0.02, r, h, 7), { position: [pine[0], y, pine[1]], rotation: [0, i * 0.4, 0], tint: i % 2 ? '#5f7f4f' : '#56754a' })
  })
  b.cylinder('stone', 0.55, 0.58, 0.16, 10, [pine[0], 0.08, pine[1]], { tint: '#bdb5a6' })
  // 長椅
  bench(b, [3.4, 0, 5.2], { rotationY: Math.PI, length: 1.7, modern: true })
  bench(b, [-3.2, 0, 5.6], { rotationY: Math.PI, length: 1.5, modern: true })
  // 市場指示牌：白底紅字的直立招牌
  const sign = [-3.75, 3.0]
  b.box('plain', [0.08, 2.5, 0.08], [sign[0] - 0.32, 1.25, sign[1]], { tint: '#6f7477' })
  b.box('plain', [0.08, 2.5, 0.08], [sign[0] + 0.32, 1.25, sign[1]], { tint: '#6f7477' })
  b.box('plain', [0.72, 1.7, 0.08], [sign[0], 1.55, sign[1]], { tint: '#f3f1ec' })
  for (const r of [0, Math.PI]) {
    b.addSign({ text: '永樂市場', style: 'marketBoard', vertical: true, width: 0.6, height: 1.55, position: [sign[0], 1.55, sign[1] + (r ? -0.045 : 0.045)], rotationY: r })
  }
}

/* ── 一樓：騎樓、柱列、大門與兩側店面 ───── */

function arcadeColumn(b, x) {
  const z = MARKET.arcade - 0.4
  b.box('granite', [0.94, 0.45, 0.94], [x, 0.225, z], { tint: C.graniteDark, grime: 0.15 })
  b.box('granite', [0.8, MARKET.groundH - 0.45, 0.8], [x, (MARKET.groundH + 0.45) / 2, z], { tint: C.granite })
  b.box('granite', [0.9, 0.18, 0.9], [x, MARKET.groundH - 0.09, z], { tint: C.graniteLight })
}

/** 大門：鋁框、拉開的玻璃門扇與彩虹色帶，上方是深色的橫楣 */
function entrance(b) {
  const { doorHalf: h, doorHeight: dh } = MARKET
  const frame = (w, hh, x, y, z) => b.box('plain', [w, hh, 0.12], [x, y, z], { tint: C.aluminium })
  frame(h * 2 + 0.2, 0.12, 0, dh + 0.06, -0.06)
  frame(0.12, dh, -h - 0.04, dh / 2, -0.06)
  frame(0.12, dh, h + 0.04, dh / 2, -0.06)
  // 拉開的門扇（收在門洞兩側，牆厚範圍內）
  for (const side of [-1, 1]) {
    const x = side * (h - 0.28)
    b.box('glassClear', [0.5, dh - 0.12, 0.03], [x, dh / 2, -0.33], { tint: '#dfe8ea' })
    b.box('plain', [0.04, dh - 0.12, 0.05], [x - side * 0.25, dh / 2, -0.33], { tint: C.aluminium })
    ;['#d8443c', '#ec9a3a', '#efd24a', '#58a85a', '#3f73b5'].forEach((tint, i) => {
      b.box('plain', [0.5, 0.025, 0.035], [x, 1.02 + i * 0.026, -0.31], { tint })
    })
  }
  // 橫楣：深色帶與店名
  b.box('plain', [h * 2 + 0.4, 0.62, 0.1], [0, dh + 0.43, 0.04], { tint: '#2b2d2f' })
  b.addSign({ text: '永樂市場', style: 'redOnDark', width: 1.9, height: 0.4, position: [0, dh + 0.43, 0.095] })
}

function groundFloor(b) {
  const { half, wallT, groundH, doorHalf, doorHeight } = MARKET
  const wall = (x0, x1, y0, y1) => b.box('granite', [x1 - x0, y1 - y0, wallT], [(x0 + x1) / 2, (y0 + y1) / 2, -wallT / 2], { tint: C.graniteLight, grime: 0.06 })
  const top = MARKET.floor2
  // 外牆（留出大門與兩側店面），往上接到二樓樓板
  wall(-half, -8.2, 0, top)
  wall(8.2, half, 0, top)
  wall(-3.3, -doorHalf, 0, top)
  wall(doorHalf, 3.3, 0, top)
  wall(-doorHalf, doorHalf, doorHeight + 0.12, top)
  wall(-8.2, -3.3, 0, 0.5)
  wall(-8.2, -3.3, 3.1, top)
  wall(3.3, 8.2, 3.25, top)
  entrance(b)
  // 左側：布料店的櫥窗（一捲捲的布）
  b.box('glassWarm', [4.8, 2.5, 0.04], [-5.75, 1.8, -0.2])
  for (const y of [0.5, 3.1]) b.box('plain', [4.9, 0.08, 0.1], [-5.75, y, -0.04], { tint: C.aluminium })
  for (const x of [-8.2, -5.75, -3.3]) b.box('plain', [0.08, 2.6, 0.1], [x, 1.8, -0.04], { tint: C.aluminium })
  // 櫥窗前的布捲架（一捲捲直立的布）
  const cloth = ['#b8463a', '#2f5f8a', '#d9b25c', '#5f7f6b', '#e7dcc6', '#8a5a8f', '#c97a53']
  b.box('wood', [1.5, 0.12, 0.5], [-5.2, 0.12, 0.5], { tint: '#7a5236' })
  b.box('wood', [1.5, 0.06, 0.08], [-5.2, 1.25, 0.32], { tint: '#7a5236' })
  for (let i = 0; i < 6; i++) {
    b.cylinder('cloth', 0.1, 0.1, 1.45, 10, [-5.8 + i * 0.24, 0.9, 0.52 - (i % 2) * 0.08], { tint: cloth[i % cloth.length] })
  }
  b.addSign({ text: '布料', style: 'modern', width: 0.9, height: 0.36, position: [-5.75, 3.55, 0.01] })
  // 右側：木作立板的店面（照片右側）
  for (let i = 0; i < 12; i++) {
    b.box('woodLight', [0.36, 3.2, 0.06], [3.5 + i * 0.4, 1.6, -0.08], { tint: i % 2 ? '#e6c9a1' : '#dcbd93' })
  }
  // 柱列、騎樓天花與吸頂燈
  for (const x of MARKET.columns) arcadeColumn(b, x)
  b.box('stucco', [half * 2, 0.08, MARKET.arcade], [0, groundH - 0.04, MARKET.arcade / 2], { tint: '#f1efe9' })
  for (const x of [-7.3, -4.45, -1.4, 1.4, 4.45, 7.3]) {
    b.cylinder('bulb', 0.2, 0.22, 0.05, 12, [x, groundH - 0.1, 1.1], { tint: '#fffaf0' })
  }
  b.addPool(0, 1.4, 2.6, '#ffe0b0', 0.07)
}

/* ── 二樓：紅磚女兒牆、柱墩與「永樂布業商場」招牌 ── */

function signPanel(b) {
  const w = 11.2
  const h = 3.0
  const y = 6.5
  const z = 2.2
  b.box('granite', [w, h, 0.32], [0, y, z], { tint: C.frame })
  b.box('granite', [w - 0.4, h - 0.4, 0.06], [0, y, z + 0.17], { tint: '#cfc9c1' })
  // 內框線（四角內凹的回紋框）
  const iw = w - 1.0
  const ih = h - 0.95
  const t = 0.07
  const fz = z + 0.215
  const k = 0.22
  for (const side of [-1, 1]) {
    b.box('plain', [iw - 2 * k, t, 0.03], [0, y + side * (ih / 2), fz], { tint: '#3c4043' })
    b.box('plain', [t, ih - 2 * k, 0.03], [side * (iw / 2), y, fz], { tint: '#3c4043' })
  }
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = sx * (iw / 2)
      const cy = y + sy * (ih / 2)
      b.box('plain', [k + t, t, 0.03], [cx - sx * (k / 2), cy - sy * k, fz], { tint: '#3c4043' })
      b.box('plain', [t, k + t, 0.03], [cx - sx * k, cy - sy * (k / 2), fz], { tint: '#3c4043' })
    }
  }
  b.addSign({ text: '永樂布業商場', style: 'redLetters', width: 8.2, height: 1.1, position: [0, y + 0.18, fz + 0.012] })
  b.addSign({ text: '各種布料批發零售/訂做/加工/外銷', style: 'redLetters', width: 5.2, height: 0.3, position: [1.9, y - 0.82, fz + 0.012] })
}

function secondFloor(b) {
  const { half, arcade, groundH, floor2, floor3 } = MARKET
  // 騎樓上方的灰色金屬飾帶
  b.box('stucco', [half * 2, floor2 - groundH, 0.14], [0, (groundH + floor2) / 2, arcade + 0.07], { tint: C.fascia })
  for (let x = -half + 1.5; x < half; x += 1.5) {
    b.box('plain', [0.03, floor2 - groundH - 0.06, 0.02], [x, (groundH + floor2) / 2, arcade + 0.15], { tint: '#7d8285' })
  }
  // 二樓外牆（退在女兒牆後方）與窗帶
  b.box('stucco', [half * 2, floor3 - floor2, 0.3], [0, (floor2 + floor3) / 2, -0.15], { tint: C.stucco })
  for (const side of [-1, 1]) {
    b.box('glass', [2.6, 1.3, 0.04], [side * 7.4, 6.6, 0.02], { tint: C.glass })
  }
  // 紅磚女兒牆、花崗石壓頂與柱墩（中央是大招牌）
  for (const side of [-1, 1]) {
    const x0 = 5.7
    const len = half - x0
    b.box('brick', [len, 1.05, 0.25], [side * (x0 + len / 2), floor2 + 0.525, arcade - 0.13], { tint: C.brick })
    b.box('granite', [len + 0.05, 0.14, 0.36], [side * (x0 + len / 2), floor2 + 1.12, arcade - 0.13], { tint: C.graniteLight })
    for (const px of [6.0, 8.65]) {
      b.box('brick', [0.6, 1.65, 0.5], [side * px, floor2 + 0.825, arcade - 0.15], { tint: C.brick })
      b.box('granite', [0.72, 0.16, 0.62], [side * px, floor2 + 1.73, arcade - 0.15], { tint: C.graniteLight })
    }
    // 女兒牆上的木格柵（照片左側）
    for (let i = 0; i < 6; i++) b.box('wood', [0.06, 0.55, 0.06], [side * (6.55 + i * 0.32), floor2 + 1.48, arcade - 0.1], { tint: '#8c6a4c' })
    b.box('wood', [1.9, 0.06, 0.08], [side * 7.35, floor2 + 1.77, arcade - 0.1], { tint: '#8c6a4c' })
  }
  signPanel(b)
}

/** 平面多邊形 → 水平板（Shape 的 y 對應 -z，擠出方向朝上） */
function slab(b, material, outline, y, thickness, tint) {
  const shape = new Shape()
  outline.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)))
  shape.closePath()
  b.extrude(material, shape, thickness, { position: [0, y, 0], rotation: [-Math.PI / 2, 0, 0], tint, curveSegments: 2 })
}

/* ── 三樓以上：紅磚女兒牆、深色玻璃帷幕與紅磚量體 ── */

/** 玻璃帷幕：一片深色玻璃與鋁框格（在帷幕面的座標中，面朝 +z） */
function curtainWall(b, width, y0, y1) {
  const h = y1 - y0
  b.box('glass', [width, h, 0.08], [0, (y0 + y1) / 2, 0], { tint: C.glass })
  const cols = Math.max(1, Math.round(width / 1.35))
  for (let i = 0; i <= cols; i++) {
    b.box('plain', [0.08, h, 0.14], [-width / 2 + (i * width) / cols, (y0 + y1) / 2, 0.04], { tint: C.mullion })
  }
  const floorH = (y1 - y0) / 3
  for (let f = 0; f <= 3; f++) {
    b.box('plain', [width, 0.12, 0.16], [0, y0 + f * floorH, 0.05], { tint: C.mullion })
    if (f < 3) b.box('plain', [width, 0.05, 0.12], [0, y0 + f * floorH + floorH * 0.62, 0.04], { tint: C.mullion })
  }
}

function upperFloors(b) {
  const { half, floor3, top, upperFront: zf, back } = MARKET
  // 三樓前緣的紅磚女兒牆（灰色石材橫帶）
  b.box('brick', [half * 2, 0.95, 0.3], [0, floor3 + 0.475, 0.1], { tint: C.brick })
  for (const y of [floor3 + 0.32, floor3 + 0.95]) b.box('granite', [half * 2 + 0.06, 0.12, 0.38], [0, y, 0.1], { tint: C.graniteLight })
  for (const x of [-8.65, -6.0, -2.9, 2.9, 6.0, 8.65]) {
    b.box('brick', [0.55, 1.4, 0.45], [x, floor3 + 0.7, 0.12], { tint: C.brick })
    b.box('granite', [0.66, 0.14, 0.56], [x, floor3 + 1.45, 0.12], { tint: C.graniteLight })
  }
  // 中央玻璃帷幕與兩側斜切的玻璃面
  const y0 = floor3 + 0.9
  const y1 = top - 0.5
  b.group([0, 0, zf], 0, () => curtainWall(b, 10.8, y0, y1))
  const chamfer = 1.8
  for (const side of [-1, 1]) {
    const cx = side * (5.4 + chamfer / 2)
    const cz = zf - chamfer / 2
    b.group([cx, 0, cz], side * (-Math.PI / 4), () => curtainWall(b, chamfer * Math.SQRT2, y0, y1))
    // 兩端的紅磚量體與窄窗
    const x0 = 5.4 + chamfer
    b.box('brick', [half - x0, top - floor3, 0.4], [side * (x0 + (half - x0) / 2), (floor3 + top) / 2, zf - chamfer - 0.2], { tint: C.brick })
    for (let f = 0; f < 3; f++) {
      b.box('glass', [0.5, 1.6, 0.04], [side * (x0 + (half - x0) / 2), y0 + 1.4 + f * 2.75, zf - chamfer + 0.02], { tint: C.glass })
    }
  }
  // 頂部的紅磚女兒牆與壓頂（沿著帷幕的轉折）
  b.box('brick', [10.8, 0.8, 0.35], [0, top - 0.1, zf + 0.05], { tint: C.brick })
  b.box('granite', [10.9, 0.12, 0.45], [0, top + 0.36, zf + 0.05], { tint: C.graniteLight })
  for (const side of [-1, 1]) {
    b.group([side * (5.4 + chamfer / 2), 0, zf - chamfer / 2], side * (-Math.PI / 4), () => {
      b.box('brick', [chamfer * Math.SQRT2 + 0.2, 0.8, 0.35], [0, top - 0.1, 0.05], { tint: C.brick })
      b.box('granite', [chamfer * Math.SQRT2 + 0.3, 0.12, 0.45], [0, top + 0.36, 0.05], { tint: C.graniteLight })
    })
  }
  // 三樓以上的量體（側牆、後牆、屋頂）
  const depthUpper = zf - chamfer - back
  for (const side of [-1, 1]) {
    b.box('brick', [0.4, top - floor3, depthUpper], [side * (half - 0.2), (floor3 + top) / 2, (zf - chamfer + back) / 2], { tint: '#f4e2d8' })
    for (let f = 0; f < 3; f++) {
      b.box('glass', [0.04, 1.3, depthUpper - 3], [side * (half + 0.01), y0 + 1.2 + f * 2.75, (zf - chamfer + back) / 2], { tint: C.glass })
      for (let k = 0; k < 6; k++) {
        b.box('plain', [0.06, 1.3, 0.08], [side * (half + 0.02), y0 + 1.2 + f * 2.75, zf - chamfer - 2 - k * ((depthUpper - 3) / 5)], { tint: C.mullion })
      }
    }
  }
  b.box('stucco', [half * 2, 0.3, depthUpper], [0, top - 0.55, (zf - chamfer + back) / 2], { tint: '#b7b2a9' })
  // 帷幕後方的屋頂、三樓前緣的露台地板（從高處看不會看到空心的樓層）
  const glassLine = [
    [-5.4, zf],
    [5.4, zf],
    [5.4 + chamfer, zf - chamfer],
    [-5.4 - chamfer, zf - chamfer],
  ]
  slab(b, 'stucco', glassLine, top - 0.55, 0.3, '#b7b2a9')
  slab(
    b,
    'stucco',
    [
      [-half, 0.25],
      [half, 0.25],
      [half, zf - chamfer],
      [5.4 + chamfer, zf - chamfer],
      [5.4, zf],
      [-5.4, zf],
      [-5.4 - chamfer, zf - chamfer],
      [-half, zf - chamfer],
    ],
    floor3 - 0.15,
    0.15,
    '#bdb7ad',
  )
  b.box('brick', [half * 2, top - floor3, 0.4], [0, (floor3 + top) / 2, back + 0.2], { tint: '#f4e2d8' })
  // 後方的紅磚樓梯塔與屋頂設備
  b.box('brick', [3.4, 21.6, 6.6], [7.3, 10.8, back + 3.3], { tint: C.brick })
  b.box('granite', [3.6, 0.2, 6.8], [7.3, 21.7, back + 3.3], { tint: C.graniteLight })
  b.box('glass', [0.6, 9.5, 0.04], [7.3, 14.6, back + 6.62], { tint: C.glass })
  b.box('stucco', [3.2, 1.8, 2.6], [-3.5, top + 0.4, -12], { tint: '#d0ccc4' })
  b.cylinder('plain', 0.6, 0.6, 1.2, 12, [-0.8, top + 0.1, -15], { tint: '#c9cbc6' })
}

/** 一樓與二樓的側牆、後牆（三樓以上在 upperFloors） */
function lowerShell(b) {
  const { half, back, floor3, groundH } = MARKET
  for (const side of [-1, 1]) {
    b.box('brick', [0.4, floor3, -back], [side * (half - 0.2), floor3 / 2, back / 2], { tint: '#f4e2d8', grime: 0.1 })
    b.box('glass', [0.04, 1.2, -back - 4], [side * (half + 0.01), 6.4, back / 2 - 1], { tint: C.glass })
  }
  b.box('brick', [half * 2, floor3, 0.4], [0, floor3 / 2, back + 0.2], { tint: '#f4e2d8' })
  // 二樓樓板（騎樓與室內天花上方）
  b.box('stucco', [half * 2, MARKET.floor2 - groundH, MARKET.arcade - 0.05], [0, (groundH + MARKET.floor2) / 2, MARKET.arcade / 2], { tint: '#cfcac1' })
}

/**
 * 一樓市場的外殼（主要街景的一部分）：門廳到走道盡頭的牆、天花板與地面的替代面。
 * 室內細部模型載入後會蓋在這些面上；還沒載入時，從遠處看門洞裡面是深色的室內。
 */
function hallShell(b) {
  const { half, hall, floor2 } = MARKET
  const depth = hall.front - hall.back
  const zc = (hall.front + hall.back) / 2
  // 兩側的實心區只到外牆內側（外牆另外產生），後牆由 lowerShell 產生
  const inner = half - 0.4
  for (const side of [-1, 1]) {
    b.box('stucco', [inner - hall.half, floor2, depth], [side * (hall.half + (inner - hall.half) / 2), floor2 / 2, zc], { tint: '#c9c4bb' })
  }
  b.box('stucco', [hall.half * 2, floor2 - hall.ceiling, depth], [0, (hall.ceiling + floor2) / 2, zc], { tint: '#3d3f41' })
  b.box('stucco', [hall.half * 2, 0.01, depth], [0, 0.005, zc], { tint: '#5d5f60' })
}

/** 兩側的鄰棟（取代原本街底後方的遠景房屋，只在這個年代出現） */
function neighbours(b) {
  const blocks = [
    { x: -12.6, z: -4.5, w: 6.6, d: 10, h: 11.6, tint: '#e2dccf' },
    { x: -12.4, z: -15.5, w: 6.2, d: 10.5, h: 14.8, tint: '#d8d9cf' },
    { x: 12.6, z: -4.5, w: 6.6, d: 10, h: 10.4, tint: '#e6dccb' },
    { x: 12.4, z: -15.5, w: 6.2, d: 10.5, h: 13.2, tint: '#dcd6c9' },
  ]
  for (const k of blocks) {
    b.box('stucco', [k.w, k.h, k.d], [k.x, k.h / 2, k.z], { tint: k.tint, grime: 0.15 })
    b.box('stucco', [k.w + 0.2, 0.45, k.d + 0.2], [k.x, k.h + 0.22, k.z], { tint: shade(k.tint, 1.04) })
    const floors = Math.round(k.h / 3.2)
    for (let f = 0; f < floors; f++) {
      const y = (f + 0.55) * (k.h / floors)
      b.box('dark', [0.05, 1.0, k.d - 2], [k.x + Math.sign(k.x) * (k.w / 2 + 0.01), y, k.z], { tint: '#4b4540' })
      b.box('dark', [k.w - 1.4, 1.0, 0.05], [k.x, y, k.z + k.d / 2 + 0.01], { tint: '#4b4540' })
    }
    b.cylinder('plain', 0.55, 0.55, 1.1, 10, [k.x, k.h + 1.0, k.z - 2], { tint: '#b9c3c4' })
  }
}

/* ── 室內的招牌（放在街景的招牌層，跟著室內一起出現） ── */

/** 攤位招牌、好粿緣的紅色攤位牌、走道的指示吊牌、出口標示與公告 */
function interiorSigns(b) {
  for (const stall of STALLS) {
    const frame = stallFrame(stall)
    b.group(frame.position, frame.rotationY, () => {
      const sign = stallSign(stall)
      b.addSign({ text: stall.sign, style: stall.style, width: sign.width - 0.06, height: sign.height - 0.08, position: [sign.x, sign.y, 0.115] })
      if (stall.number) {
        // 紅色攤位牌：垂直於攤位正面，掛在靠走道深處的一角（兩面）
        for (const r of [-Math.PI / 2, Math.PI / 2]) {
          const off = r < 0 ? -0.032 : 0.032
          b.addSign({ text: '好粿緣', style: 'redPlate', width: 0.62, height: 0.3, position: [1.66 + off, 2.62, 0.62], rotationY: r })
          b.addSign({ text: `攤位編號${stall.number}`, style: 'redPlate', width: 0.62, height: 0.13, position: [1.66 + off, 2.86, 0.62], rotationY: r })
        }
        // 加熱說明立牌的標題（立牌在 yongleInterior.js，斜對著走道）
        const turn = 0.35
        b.addSign({
          text: '好粿加熱方式',
          style: 'label',
          width: 0.36,
          height: 0.07,
          position: [-1.36 + Math.sin(turn) * 0.016, 1.04, -0.03 + Math.cos(turn) * 0.016],
          rotationY: turn,
        })
        // 托盤前緣的品名木牌（第一層與第二層）
        const tags = [
          ['草仔粿', -0.85, 0.98, -0.07],
          ['紅龜粿', -0.12, 0.98, -0.07],
          ['蘿蔔糕', 1.1, 0.98, -0.07],
          ['芋粿巧', -1.13, 1.22, -0.52],
          ['紫米糕', -0.1, 1.22, -0.52],
          ['艾草龜粿', 0.94, 1.22, -0.52],
        ]
        for (const [text, x, y, z] of tags) b.addSign({ text, style: 'tag', width: 0.32, height: 0.08, position: [x, y, z + 0.0075] })
      }
    })
  }
  const { hall } = MARKET
  // 門廳的指示吊牌：1號門、3號門、5號門（依照片中的吊牌樣式）
  const gates = [
    ['1號門', -0.9],
    ['3號門', 0],
    ['5號門', 0.9],
  ]
  for (const [text, x] of gates) b.addSign({ text, style: 'marketWhite', width: 0.46, height: 0.2, position: [x + 0.12, 3.24, -1.94] })
  b.addSign({ text: '永樂市場', style: 'redPlate', width: 1.0, height: 0.13, position: [0, 2.99, -1.94] })
  // 出口標示（門的上方，朝室內）
  b.addSign({ text: '出口', style: 'exitGreen', width: 0.5, height: 0.2, position: [0, 3.55, hall.front - 0.07], rotationY: Math.PI })
  // 門廳牆上的公告欄
  b.addSign({ text: '市場公告', style: 'label', width: 0.9, height: 0.2, position: [hall.half - 0.07, 2.25, -1.5], rotationY: -Math.PI / 2 })
  // 走道盡頭的吊牌
  b.addSign({ text: '永樂市場', style: 'redPlate', width: 1.4, height: 0.32, position: [0, 3.1, hall.back + 1.6] })
}

/* ── 遮擋方塊、碰撞與觀賞範圍 ───────────── */

/**
 * 鏡頭的遮擋方塊：室內留空（只有攤位），外牆、天花與樓上的量體都是方塊。
 * 回傳好粿緣攤位的方塊範圍（另外成為一個可點選的「建築」）。
 */
function registerBlockers(b) {
  const { half, back, wallT, doorHalf, doorHeight, groundH, floor2, floor3, top, upperFront, hall, arcade } = MARKET
  // 一樓外牆（大門兩側與門楣）
  b.addBlocker(-half, -doorHalf, 0, floor2, -wallT, 0)
  b.addBlocker(doorHalf, half, 0, floor2, -wallT, 0)
  b.addBlocker(-doorHalf, doorHalf, doorHeight, floor2, -wallT, 0)
  // 室內兩側的實心區、後牆、天花
  b.addBlocker(-half, -hall.half, 0, floor2, back, -wallT)
  b.addBlocker(hall.half, half, 0, floor2, back, -wallT)
  b.addBlocker(-hall.half, hall.half, 0, floor2, back, hall.back)
  b.addBlocker(-hall.half, hall.half, hall.ceiling, floor2, hall.back, hall.front)
  // 騎樓上方的樓板與柱
  b.addBlocker(-half, half, groundH, floor2, 0, arcade + 0.15)
  for (const x of MARKET.columns) b.addBlocker(x - 0.47, x + 0.47, 0, groundH, arcade - 0.87, arcade + 0.07)
  // 二樓（含女兒牆與招牌）、三樓以上、樓梯塔
  b.addBlocker(-half, half, floor2, floor3, back, arcade + 0.45)
  b.addBlocker(-half, half, floor3, top + 0.45, back, upperFront + 0.2)
  b.addBlocker(-half, half, floor3, floor3 + 1.6, upperFront, 0.4)
  b.addBlocker(5.6, half, top + 0.45, 21.8, back, back + 6.6)
  // 鄰棟
  b.addBlocker(-15.9, -9.3, 0, 15.3, -20.75, 0.5)
  b.addBlocker(9.3, 15.9, 0, 13.7, -20.75, 0.5)
  // 廣場的樹冠
  b.addBlocker(-7.8, -3.6, 2.2, 5.6, 2.1, 6.3)
  // 攤位（好粿緣另外記錄）
  let hao = null
  for (const stall of STALLS) {
    const r = stallRect(stall)
    const start = b.blockers.length
    b.addBlocker(r.minX, r.maxX, 0, 3.45, r.minZ, r.maxZ)
    if (stall.storeId) hao = { start, end: b.blockers.length }
  }
  return hao
}

/** 本地矩形 → 世界座標的軸對齊矩形 */
function worldRect(transform, minX, maxX, minZ, maxZ) {
  const a = transform(minX, minZ)
  const c = transform(maxX, maxZ)
  return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
}

/**
 * 角色的可行走範圍與障礙物（世界座標）：街底廣場、騎樓、大門、一樓市場（門廳、走道、走道盡頭）；
 * 障礙物是柱、樹與座椅、長椅、指示牌、攤位與走道盡頭的設備。
 */
export function yongleCollision(config, transform) {
  const { half, arcade, plaza: edge, rowEnd, doorHalf, hall } = MARKET
  const rect = (...args) => worldRect(transform, ...args)
  const walkable = [
    rect(-2.75, 2.75, arcade + 0.05, edge + 0.6),
    rect(-half + 0.4, half - 0.4, arcade + 0.05, rowEnd - 0.05),
    rect(-doorHalf + 0.05, doorHalf - 0.05, -0.3, arcade + 0.5),
    rect(-half + 0.8, half - 0.8, 0.05, 1.35),
    rect(-doorHalf + 0.55, doorHalf - 0.55, -1.4, 0.6),
    rect(-hall.half + 0.4, hall.half - 0.4, hall.back + 0.4, hall.front - 0.05),
  ]
  // 騎樓柱之間的空隙（從廣場走進騎樓）
  const cols = MARKET.columns
  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i] + 0.4
    const c = cols[i + 1] - 0.4
    if (c - a > 1) walkable.push(rect(a, c, 0.05, arcade + 0.5))
  }
  const obstacles = cols.map((x) => rect(x - 0.47, x + 0.47, arcade - 0.87, arcade + 0.07))
  obstacles.push(rect(-6.95, -4.45, 2.95, 5.45)) // 樹與圓形座椅
  obstacles.push(rect(5.55, 7.05, 3.65, 5.15)) // 小松樹
  obstacles.push(rect(2.5, 4.3, 4.85, 5.45)) // 長椅
  obstacles.push(rect(-4.0, -2.4, 5.25, 5.85))
  obstacles.push(rect(-4.25, -3.25, 2.85, 3.15)) // 指示牌
  obstacles.push(rect(-6.0, -4.4, 0.2, 0.8)) // 騎樓的布捲架
  for (const stall of STALLS) {
    const r = stallRect(stall)
    obstacles.push(rect(r.minX, r.maxX, r.minZ, r.maxZ))
  }
  // 走道盡頭：洗手台、回收桶、公告欄
  obstacles.push(rect(-hall.half, -hall.half + 1.1, hall.back, hall.back + 1.4))
  obstacles.push(rect(hall.half - 1.6, hall.half, hall.back, hall.back + 0.9))
  return { walkable, obstacles }
}

/** 市場佔用的世界範圍（街底後方的遠景房屋在這個範圍內不產生） */
export function yongleFootprint(transform) {
  return worldRect(transform, -16.2, 16.2, MARKET.back - 1, MARKET.rowEnd + 0.3)
}

/* ── 主程式 ─────────────────────────────── */

export function buildYongleMarket(b) {
  plaza(b)
  plazaProps(b)
  groundFloor(b)
  secondFloor(b)
  upperFloors(b)
  lowerShell(b)
  hallShell(b)
  neighbours(b)
  interiorSigns(b)
  const hao = registerBlockers(b)

  const local = (x, y, z) => {
    const p = b.transformPoint(x, y, z)
    return [p.x, p.y, p.z]
  }
  const rect = (minX, maxX, minZ, maxZ) => {
    const a = b.transformPoint(minX, 0, minZ)
    const c = b.transformPoint(maxX, 0, maxZ)
    return { minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) }
  }
  const dir = (x, z) => {
    const p = b.transformPoint(x, 0, z).sub(b.transformPoint(0, 0, 0))
    return { x: p.x, z: p.z }
  }
  const { hall, arcade, plaza: edge, doorHalf } = MARKET

  // 好粿緣攤位：可點選、可聚焦的「建築」
  const haoStall = STALLS.find((stall) => stall.storeId)
  const frame = stallFrame(haoStall)
  const stallLocal = (x, y, z) => {
    const [px, , pz] = frame.position
    const c = Math.cos(frame.rotationY)
    const s = Math.sin(frame.rotationY)
    return local(px + x * c + z * s, y, pz - x * s + z * c)
  }
  const stallFront = stallLocal(0, 0, 0)
  const stallForward = (() => {
    const p = stallLocal(0, 0, 1)
    return { x: p[0] - stallFront[0], z: p[2] - stallFront[2] }
  })()

  const ceiling = hall.ceiling
  return {
    groundHeight: MARKET.groundH,
    topHeight: MARKET.top,
    anchors: { prompt: local(0, 2.6, arcade + 0.5), marker: local(0, 20.2, -2) },
    focus: {
      center: { x: local(0, 0, arcade)[0], z: local(0, 0, arcade)[2] },
      forward: dir(0, 1),
      width: MARKET.half * 2,
      height: MARKET.top + 0.5,
    },
    subStores: [
      {
        id: 'stall-hao-guo-yuan',
        storeId: haoStall.storeId,
        range: hao,
        anchors: { prompt: stallLocal(0, 1.62, 0.55), marker: stallLocal(0, 3.62, 0.5), markerScale: 0.42 },
        focus: { center: { x: stallFront[0], z: stallFront[2] }, forward: stallForward, width: 3.5, height: 3.4 },
      },
    ],
    // 室內：鏡頭拉近壓低、按需載入室內模型；entry 是從迪化街街底走到大門的漸變範圍
    interiors: [
      {
        id: 'yong-le-market',
        ...rect(-hall.half, hall.half, hall.back, hall.front),
        ceiling,
        entry: rect(-doorHalf - 0.4, doorHalf + 0.4, hall.front, edge),
        door: { x: local(0, 0, 0)[0], z: local(0, 0, 0)[2] },
        // 室內鏡頭：距離、高度上限（吊牌與燈具下方）、仰角範圍、注視點高度、被擋住時最近的距離
        camera: { distance: 3.8, maxHeight: 2.75, minPitch: 0.04, maxPitch: 0.6, lookHeight: 1.55, minDistance: 0.8 },
        // 角色或鏡頭離室內 loadRadius 公尺內才產生室內模型；超過 showRadius 公尺不繪製
        loadRadius: 26,
        showRadius: 34,
      },
    ],
    // 觀賞模式：注視點可以進到騎樓與一樓市場（高度不超過天花板）
    viewerRegions: [
      { ...rect(-MARKET.half + 0.5, MARKET.half - 0.5, arcade + 0.3, edge + 0.6), maxY: 18 },
      { ...rect(-doorHalf + 0.6, doorHalf - 0.6, hall.front - 0.2, arcade + 0.3), maxY: 2.6 },
      { ...rect(-hall.half + 0.6, hall.half - 0.6, hall.front - 2.2, hall.front - 0.2), maxY: ceiling - 0.8 },
      { ...rect(-MARKET.aisleHalf + 0.3, MARKET.aisleHalf - 0.3, hall.back + 3.6, hall.front - 2.0), maxY: ceiling - 0.8 },
      { ...rect(-hall.half + 0.6, hall.half - 0.6, hall.back + 0.6, hall.back + 3.8), maxY: ceiling - 0.8 },
    ],
    viewerBounds: { maxX: rect(0, 0, MARKET.back - 2, MARKET.back - 2).maxX },
  }
}
