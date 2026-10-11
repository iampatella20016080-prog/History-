import { BoxGeometry, ConeGeometry, CylinderGeometry, PlaneGeometry, Shape, SphereGeometry, TorusGeometry, Vector3 } from 'three'
import { OutfitBuilder, RIG, openShell, radiusAt, ring, segment, shell, surfaceStrap, tube, wrapShape } from './outfitBuilder.js'

/**
 * 五個年代的主角服裝（依附上的造型參考圖，轉成低多邊形、Cel Shading 的 3D 零件）
 *
 * 五套共用同一張臉、髮型、身形與動畫；只換衣服、帽子、鞋子與配件。
 * 衣領、袖口、衣襬都做成有厚度的環或邊條，不只是換顏色。
 * palette：材質名稱 → { color, texture?, double? }（材質在 outfitMaterials.js 依此建立並快取）
 */

const SKIN = { color: '#e2bf98' }
const HAIR = { color: '#2a221d' }
const EYE = { color: '#231b16' }

/* ───────────── 共用：臉、頭髮、手 ───────────── */

function addBody(b) {
  // 脖子與頭
  b.add('head', 'skin', tube(0.055, 0.065, 0.1, 8), { p: [0, 0.02, 0] })
  b.add('head', 'skin', new SphereGeometry(0.155, 16, 12), { p: [0, 0.16, 0] })
  // 頭髮：頭頂、後腦、瀏海與鬢角（五套相同）
  b.add('head', 'hair', new SphereGeometry(0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), { p: [0, 0.19, -0.025], s: [1.05, 1, 1.05], tag: 'hair' })
  b.add('head', 'hair', new SphereGeometry(0.15, 12, 10), { p: [0, 0.155, -0.05], s: [1.02, 0.9, 0.9] })
  const fringe = [
    [-0.08, 0.238, 0.104, 0.35],
    [-0.032, 0.244, 0.114, 0.1],
    [0.024, 0.245, 0.115, -0.12],
    [0.076, 0.238, 0.104, -0.38],
  ]
  for (const [x, y, z, rz] of fringe) {
    b.add('head', 'hair', new ConeGeometry(0.04, 0.09, 6), { p: [x, y, z], r: [0.2, 0, rz + Math.PI], s: [1, 1, 0.6], shadow: false })
  }
  for (const side of [-1, 1]) {
    b.add('head', 'hair', new BoxGeometry(0.03, 0.08, 0.05), { p: [side * 0.148, 0.165, 0.05], r: [0, 0, side * 0.08], shadow: false })
  }
  // 眼睛與眉毛
  for (const side of [-1, 1]) {
    b.add('head', 'eye', new SphereGeometry(0.017, 6, 4), { p: [side * 0.052, 0.16, 0.142], shadow: false })
    b.add('head', 'hair', new BoxGeometry(0.048, 0.011, 0.014), { p: [side * 0.055, 0.2, 0.142], r: [0, 0, side * -0.12], shadow: false })
  }
  // 手
  for (const slot of ['armRight', 'armLeft']) b.add(slot, 'skin', new SphereGeometry(0.056, 8, 6), { p: [0, RIG.handY, 0.01] })
}

/** 袖子：從肩膀到 length 處，袖口加一圈有厚度的反摺；之後露出前臂 */
function addSleeves(b, material, { length, rTop = 0.076, rBottom = 0.07, cuff, cuffHeight = 0.06, cuffRadius, forearm = true, shoulderCap = true }) {
  for (const slot of ['armRight', 'armLeft']) {
    b.add(slot, material, tube(rTop, rBottom, length, 10), { p: [0, -length / 2, 0], tag: 'sleeve' })
    if (shoulderCap) b.add(slot, material, new SphereGeometry(rTop + 0.004, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, -0.005, 0] })
    if (cuff) b.add(slot, cuff, tube(cuffRadius ?? rBottom + 0.009, cuffRadius ?? rBottom + 0.009, cuffHeight, 10), { p: [0, -length - cuffHeight / 2 + 0.01, 0], tag: 'cuff' })
    if (forearm && length < 0.48) {
      const top = -length - (cuff ? cuffHeight - 0.01 : 0)
      const h = RIG.handY + 0.03 - top
      b.add(slot, 'skin', tube(0.054, 0.048, -h, 8), { p: [0, top + h / 2, 0] })
    }
  }
}

/** 褲管：從髖部到 length（往下），可加反摺褲腳 */
function addTrousers(b, material, { length, rTop = 0.105, rBottom = 0.09, cuff, cuffHeight = 0.06, ankle = 'skin' }) {
  for (const slot of ['legRight', 'legLeft']) {
    b.add(slot, material, tube(rTop, rBottom, length + 0.04, 10), { p: [0, 0.04 - (length + 0.04) / 2, 0], tag: 'trousers' })
    if (cuff) b.add(slot, cuff, tube(rBottom + 0.008, rBottom + 0.01, cuffHeight, 10), { p: [0, -length + cuffHeight / 2 - 0.01, 0], tag: 'trouserCuff' })
    // 褲腳與鞋子之間露出的腳踝
    const gap = -length - RIG.ankleY
    if (gap > 0.003) b.add(slot, ankle, tube(0.045, 0.045, gap + 0.04, 8), { p: [0, -length - gap / 2 + 0.01, 0] })
  }
}

/** 鞋子（腳踝座標）：鞋底下緣在 y = -0.08，站立時剛好貼地 */
function addShoes(b, { upper, sole, soleHeight = 0.024, length = 0.25, width = 0.105, height = 0.06, toe = 0.05, tag = 'shoes' }) {
  const bottom = -RIG.soleDepth
  for (const slot of ['footRight', 'footLeft']) {
    b.add(slot, sole, new BoxGeometry(width, soleHeight, length), { p: [0, bottom + soleHeight / 2, toe], tag })
    b.add(slot, upper, new SphereGeometry(0.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), {
      p: [0, bottom + soleHeight - 0.004, toe],
      s: [width * 0.96, height * 2, length * 0.96],
    })
    b.add(slot, upper, tube(0.05, 0.055, 0.05, 8), { p: [0, bottom + soleHeight + 0.03, -0.02] })
  }
}

/** 折線背帶：依序連接各點（點以 [x, y, z] 表示） */
function strapPath(b, slot, material, points, options) {
  for (let i = 0; i < points.length - 1; i++) segment(b, slot, material, new Vector3(...points[i]), new Vector3(...points[i + 1]), options)
}

/** 骨盆（衣襬下方、兩腿之間），避免從低角度看見空隙 */
function addPelvis(b, material, r = 0.2) {
  b.add('torso', material, tube(r, r - 0.012, 0.12, 12), { p: [0, -0.03, 0] })
}

/* ───────────── 1853–1895 港口商街 ───────────── */

function qingPort() {
  const b = new OutfitBuilder('qing-port')
  addBody(b)
  const jacket = (y) => radiusAt(y, 0.02, 0.232, 0.62, 0.198)

  // 米白內衫（中式盤扣）
  b.add('torso', 'inner', tube(0.19, 0.215, 0.6, 14), { p: [0, 0.32, 0], tag: 'innerShirt' })
  for (const y of [0.52, 0.44, 0.36, 0.28]) {
    const r = radiusAt(y, 0.02, 0.215, 0.62, 0.19)
    b.add('torso', 'button', new CylinderGeometry(0.008, 0.008, 0.045, 6), { p: [0, y, r + 0.006], r: [0, 0, Math.PI / 2], shadow: false, tag: 'frogButton' })
    b.add('torso', 'button', new SphereGeometry(0.011, 6, 4), { p: [0.024, y, r + 0.008], shadow: false })
  }
  // 靛藍對襟短衫：前襟敞開，衣襟、衣襬、領口都有厚度
  const gap = 0.72
  b.add('torso', 'jacket', openShell(0.198, 0.232, 0.6, gap), { p: [0, 0.32, 0], tag: 'jacket' })
  b.add('torso', 'jacketEdge', ring(0.233, 0.012, gap / 2, Math.PI * 2 - gap), { p: [0, 0.025, 0] })
  for (const side of [-1, 1]) {
    const edge = (y) => {
      const r = jacket(y) + 0.004
      const a = side * (gap / 2 + 0.02)
      return new Vector3(r * Math.sin(a), y, r * Math.cos(a))
    }
    segment(b, 'torso', 'jacketEdge', edge(0.62), edge(0.02), { width: 0.032, thickness: 0.02 })
    // 對襟上的盤扣
    for (const y of [0.5, 0.36]) {
      const p = edge(y)
      b.add('torso', 'button', new SphereGeometry(0.012, 6, 4), { p: [p.x, p.y, p.z + 0.008], shadow: false })
    }
  }
  b.add('torso', 'jacketEdge', ring(0.1, 0.022, 0.55, Math.PI * 2 - 1.1), { p: [0, 0.628, 0], tag: 'collar' })
  // 布腰帶：繞腰一圈，前側打結、垂下兩條帶尾
  b.add('torso', 'sash', tube(0.24, 0.243, 0.08, 16), { p: [0, 0.11, 0], tag: 'sash' })
  b.add('torso', 'sash', new SphereGeometry(0.04, 8, 6), { p: [0.1, 0.11, 0.225], s: [1.2, 0.9, 0.7] })
  segment(b, 'torso', 'sash', new Vector3(0.09, 0.1, 0.25), new Vector3(0.12, -0.13, 0.262), { width: 0.05, thickness: 0.016 })
  segment(b, 'torso', 'sash', new Vector3(0.11, 0.1, 0.248), new Vector3(0.165, -0.08, 0.236), { width: 0.045, thickness: 0.016 })
  addPelvis(b, 'trousers', 0.21)

  // 麻布斜背袋：背帶從左肩斜過胸前與背後，袋子在右後腰（右手擺幅縮小，不穿過袋子）
  const outer = (y) => jacket(y) + 0.012
  surfaceStrap(b, 'torso', 'strap', [[0.15, 0.63], [-0.05, 0.36], [-0.215, 0.12]], { radius: outer, width: 0.034, front: true, tag: 'bagStrap' })
  surfaceStrap(b, 'torso', 'strap', [[0.15, 0.63], [-0.06, 0.34], [-0.2, 0.12]], { radius: outer, width: 0.034, front: false })
  strapPath(b, 'torso', 'strap', [[0.15, 0.63, 0.162], [0.155, 0.665, 0], [0.15, 0.63, -0.162]], { width: 0.034, thickness: 0.016 })
  strapPath(b, 'torso', 'strap', [[-0.215, 0.12, 0.127], [-0.252, 0.1, 0], [-0.2, 0.12, -0.15], [-0.2, 0.09, -0.24]], { width: 0.034, thickness: 0.016 })
  b.add('torso', 'bag', new BoxGeometry(0.24, 0.24, 0.085), { p: [-0.2, -0.04, -0.255], r: [0.04, -0.55, 0.05], tag: 'bag' })
  b.add('torso', 'bagDark', new BoxGeometry(0.245, 0.1, 0.02), { p: [-0.18, 0.04, -0.29], r: [0.15, -0.55, 0.05] })

  // 袖子捲到前臂（露出米白內衫的袖口）
  addSleeves(b, 'jacket', { length: 0.34, cuff: 'inner', cuffHeight: 0.07, cuffRadius: 0.08 })
  // 灰褐直筒褲，褲腳反摺
  addTrousers(b, 'trousers', { length: 0.68, cuff: 'trousersDark' })
  // 草鞋：草編鞋底、腳背的草繩，露出腳
  for (const slot of ['footRight', 'footLeft']) {
    b.add(slot, 'skin', new SphereGeometry(0.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, -0.058, 0.045], s: [0.09, 0.09, 0.22] })
    b.add(slot, 'straw', new BoxGeometry(0.11, 0.024, 0.26), { p: [0, -0.068, 0.045], tag: 'strawSandals' })
    for (const z of [0.1, 0.03]) b.add(slot, 'strawDark', new BoxGeometry(0.1, 0.018, 0.026), { p: [0, -0.034, z], r: [z > 0.05 ? 0.25 : 0.1, 0, 0], shadow: false })
    b.add(slot, 'strawDark', new TorusGeometry(0.045, 0.008, 4, 12, Math.PI), { p: [0, -0.05, -0.04], r: [0, 0, 0], s: [1, 0.8, 1], shadow: false })
  }
  // 斗笠：竹編紋理、帽緣、頂結與繫繩
  b.add('head', 'hat', new ConeGeometry(0.37, 0.18, 18), { p: [0, 0.33, 0], r: [0.08, 0, 0], tag: 'conicalHat' })
  b.add('head', 'hatRim', new TorusGeometry(0.36, 0.014, 4, 24), { p: [0, 0.248, -0.007], r: [Math.PI / 2 + 0.08, 0, 0] })
  b.add('head', 'hatRim', new SphereGeometry(0.03, 6, 4), { p: [0, 0.43, 0.008] })
  for (const side of [-1, 1]) segment(b, 'head', 'strapThin', new Vector3(side * 0.16, 0.25, 0.02), new Vector3(side * 0.03, 0.03, 0.11), { width: 0.008, thickness: 0.008 })

  return b.build({ armSwing: { right: 0.25, left: 1 }, armSpread: { right: 0.16, left: 0.13 } })
}

/* ───────────── 1895–1930 酒樓繁華 ───────────── */

function banquet() {
  const b = new OutfitBuilder('banquet')
  addBody(b)
  const magua = (y) => radiusAt(y, -0.04, 0.25, 0.62, 0.206)

  // 深棗紅長衫（上半身）與立領，內衫米白領緣
  b.add('torso', 'robe', tube(0.196, 0.236, 0.64, 16), { p: [0, 0.31, 0], tag: 'robe' })
  b.add('torso', 'robe', tube(0.088, 0.098, 0.07, 12), { p: [0, 0.66, 0], tag: 'collar' })
  b.add('torso', 'innerCollar', new TorusGeometry(0.09, 0.009, 4, 16), { p: [0, 0.697, 0], r: [Math.PI / 2, 0, 0], shadow: false })
  // 黑色短馬褂：低對比暗紋、金色細邊、五顆盤扣
  b.add('torso', 'magua', tube(0.206, 0.25, 0.66, 16), { p: [0, 0.29, 0], tag: 'magua' })
  b.add('torso', 'trim', ring(0.251, 0.01), { p: [0, -0.04, 0] })
  b.add('torso', 'trim', ring(0.207, 0.01), { p: [0, 0.62, 0] })
  segment(b, 'torso', 'trim', new Vector3(0, 0.62, magua(0.62) + 0.004), new Vector3(0, -0.04, magua(-0.04) + 0.004), { width: 0.016, thickness: 0.01 })
  for (const y of [0.55, 0.44, 0.33, 0.22, 0.11]) {
    const r = magua(y) + 0.008
    b.add('torso', 'knot', new CylinderGeometry(0.008, 0.008, 0.06, 6), { p: [0, y, r], r: [0, 0, Math.PI / 2], shadow: false, tag: 'frogButton' })
    b.add('torso', 'knot', new SphereGeometry(0.013, 6, 4), { p: [0, y, r + 0.004], shadow: false })
  }
  // 袖子到手腕，米白反摺袖口
  addSleeves(b, 'robe', { length: 0.5, rTop: 0.08, rBottom: 0.074, cuff: 'innerCollar', cuffHeight: 0.07, cuffRadius: 0.084 })
  // 長衫下襬：前後兩片（側邊開衩），從腰連到腳踝，走路時隨前後腳擺動
  const skirtH = 0.76
  const front = [-0.45 * Math.PI, 0.9 * Math.PI]
  const back = [0.55 * Math.PI, 0.9 * Math.PI]
  // 內層：腰到膝蓋的一圈（不擺動），開衩只從膝蓋以下露出黑褲，整體仍是連續的長衫輪廓
  b.add('torso', 'robe', tube(0.236, 0.272, 0.44, 16), { p: [0, -0.2, 0] })
  for (const [slot, [start, length]] of [
    ['skirtFront', front],
    ['skirtBack', back],
  ]) {
    b.add(slot, 'robe', shell(0.244, 0.33, skirtH, start, length, 16), { p: [0, -skirtH / 2 + 0.02, 0], tag: 'robeSkirt' })
    b.add(slot, 'robeDark', ring(0.331, 0.012, start, length), { p: [0, -skirtH + 0.025, 0], shadow: false })
  }
  // 腰間小布包（掛在前片，跟著衣襬擺動）
  segment(b, 'skirtFront', 'cord', new Vector3(-0.15, -0.03, 0.212), new Vector3(-0.155, -0.15, 0.25), { width: 0.008, thickness: 0.008 })
  b.add('skirtFront', 'pouch', new SphereGeometry(0.05, 8, 6), { p: [-0.155, -0.2, 0.27], s: [1, 1.15, 0.6], tag: 'waistPouch' })
  b.add('skirtFront', 'tassel', new ConeGeometry(0.018, 0.08, 6), { p: [-0.155, -0.29, 0.272], shadow: false })
  b.add('skirtFront', 'brass', new TorusGeometry(0.014, 0.004, 4, 10), { p: [-0.13, -0.15, 0.262], shadow: false })
  // 黑長褲與黑布鞋
  addTrousers(b, 'black', { length: 0.78, rTop: 0.1, rBottom: 0.085 })
  addShoes(b, { upper: 'black', sole: 'sole', soleHeight: 0.026, height: 0.055, tag: 'clothShoes' })
  // 黑色圓帽（瓜皮帽）與紅色帽頂
  b.add('head', 'black', new SphereGeometry(0.175, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, 0.185, -0.018], tag: 'skullCap' })
  b.add('head', 'blackLight', tube(0.177, 0.177, 0.03, 16), { p: [0, 0.195, -0.018] })
  b.add('head', 'red', new SphereGeometry(0.022, 8, 6), { p: [0, 0.365, -0.018] })

  return b.build({ legSwing: 0.72, armSwing: { right: 0.85, left: 0.85 }, armSpread: { right: 0.17, left: 0.17 } })
}

/* ───────────── 1930–1945 摩登大稻埕 ───────────── */

function modern() {
  const b = new OutfitBuilder('modern')
  addBody(b)
  const vest = (y) => radiusAt(y, 0.1, 0.212, 0.6, 0.2)

  // 白襯衫、高腰西裝褲與皮帶
  b.add('torso', 'shirt', tube(0.19, 0.205, 0.52, 14), { p: [0, 0.38, 0], tag: 'shirt' })
  b.add('torso', 'trousers', tube(0.206, 0.212, 0.2, 14), { p: [0, 0.06, 0] })
  addPelvis(b, 'trousers', 0.212)
  // 合身深棕背心：V 領露出襯衫與領帶，四顆鈕扣，下襬有厚度
  b.add('torso', 'vest', tube(0.2, 0.212, 0.5, 16), { p: [0, 0.35, 0], tag: 'vest' })
  b.add('torso', 'vestDark', ring(0.213, 0.011), { p: [0, 0.1, 0] })
  const v = new Shape()
  v.moveTo(-0.085, 0.605)
  v.lineTo(0.085, 0.605)
  v.lineTo(0, 0.37)
  v.closePath()
  b.add('torso', 'shirt', wrapShape(v, vest, { lift: 0.003 }))
  for (const side of [-1, 1]) {
    const r0 = vest(0.6) + 0.006
    const r1 = vest(0.37) + 0.006
    const a0 = (side * 0.085) / r0
    segment(b, 'torso', 'vestDark', new Vector3(r0 * Math.sin(a0), 0.6, r0 * Math.cos(a0)), new Vector3(0, 0.37, r1), { width: 0.022, thickness: 0.012 })
  }
  for (const y of [0.33, 0.265, 0.2, 0.135]) b.add('torso', 'buttonDark', new SphereGeometry(0.011, 6, 4), { p: [0, y, vest(y) + 0.006], shadow: false })
  // 藏青領帶與襯衫領
  const tie = new Shape()
  tie.moveTo(-0.017, 0.6)
  tie.lineTo(0.017, 0.6)
  tie.lineTo(0.03, 0.42)
  tie.lineTo(0, 0.39)
  tie.lineTo(-0.03, 0.42)
  tie.closePath()
  b.add('torso', 'tie', wrapShape(tie, vest, { lift: 0.008 }), { tag: 'tie' })
  b.add('torso', 'tie', new BoxGeometry(0.04, 0.036, 0.028), { p: [0, 0.628, 0.19], r: [0.5, 0, 0], shadow: false })
  b.add('torso', 'shirt', tube(0.09, 0.1, 0.06, 12), { p: [0, 0.655, 0], tag: 'collar' })
  b.add('torso', 'shirt', tube(0.188, 0.19, 0.04, 14), { p: [0, 0.62, 0] })
  for (const side of [-1, 1]) {
    b.add('torso', 'shirt', new BoxGeometry(0.06, 0.05, 0.012), { p: [side * 0.045, 0.628, 0.185], r: [0.6, side * 0.35, side * -0.7], shadow: false })
  }
  // 襯衫袖子捲到手肘
  addSleeves(b, 'shirt', { length: 0.27, rTop: 0.074, rBottom: 0.068, cuff: 'shirtFold', cuffHeight: 0.07, cuffRadius: 0.077 })
  // 手錶（左手腕）
  b.add('armLeft', 'leather', tube(0.052, 0.052, 0.018, 10), { p: [0, -0.48, 0], shadow: false, tag: 'watch' })
  b.add('armLeft', 'brass', tube(0.016, 0.016, 0.008, 10), { p: [0.05, -0.48, 0], r: [0, 0, Math.PI / 2], shadow: false })
  // 灰色高腰西裝褲（到鞋面）
  addTrousers(b, 'trousers', { length: 0.77, rTop: 0.098, rBottom: 0.088, ankle: 'sock' })
  // 深棕皮鞋
  addShoes(b, { upper: 'leather', sole: 'leatherSole', soleHeight: 0.022, length: 0.26, height: 0.058, tag: 'leatherShoes' })
  // 小公事包（右手提著，保持下垂）
  b.add('handRight', 'leather', new TorusGeometry(0.035, 0.008, 4, 10, Math.PI), { p: [0, -0.04, 0], r: [0, Math.PI / 2, 0], shadow: false })
  b.add('handRight', 'case', new BoxGeometry(0.07, 0.22, 0.32), { p: [0, -0.16, 0], tag: 'briefcase' })
  b.add('handRight', 'brass', new BoxGeometry(0.075, 0.03, 0.04), { p: [0, -0.08, 0], shadow: false })
  // 棕色報童帽：蓬鬆的帽頂、帽圍與帽簷
  b.add('head', 'cap', new SphereGeometry(0.185, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, 0.245, -0.005], s: [1.06, 0.62, 1.1], tag: 'newsboyCap' })
  b.add('head', 'capDark', tube(0.158, 0.164, 0.05, 16), { p: [0, 0.235, -0.005] })
  b.add('head', 'capDark', new CylinderGeometry(0.1, 0.1, 0.014, 12, 1, false, -Math.PI / 2, Math.PI), { p: [0, 0.225, 0.13], r: [0.28, 0, 0] })
  b.add('head', 'capDark', new SphereGeometry(0.018, 6, 4), { p: [0, 0.36, -0.005], shadow: false })

  return b.build({ armSwing: { right: 0.7, left: 1 }, armSpread: { right: 0.2, left: 0.1 } })
}

/* ───────────── 1945–1980 庶民生活 ───────────── */

function postwar() {
  const b = new OutfitBuilder('postwar')
  addBody(b)
  const shirt = (y) => radiusAt(y, -0.03, 0.226, 0.6, 0.194)

  // 卡其短袖襯衫（下襬放在褲外）、門襟、鈕扣、胸前口袋與襯衫領
  b.add('torso', 'khaki', tube(0.194, 0.226, 0.63, 16), { p: [0, 0.285, 0], tag: 'shortSleeveShirt' })
  b.add('torso', 'khakiDark', ring(0.227, 0.011), { p: [0, -0.03, 0] })
  segment(b, 'torso', 'khakiDark', new Vector3(0, 0.6, shirt(0.6) + 0.004), new Vector3(0, -0.03, shirt(-0.03) + 0.004), { width: 0.03, thickness: 0.01 })
  for (const y of [0.5, 0.38, 0.26, 0.14]) b.add('torso', 'buttonLight', new SphereGeometry(0.01, 6, 4), { p: [0, y, shirt(y) + 0.011], shadow: false })
  const pocket = new Shape()
  pocket.moveTo(0.035, 0.44)
  pocket.lineTo(0.115, 0.44)
  pocket.lineTo(0.115, 0.36)
  pocket.lineTo(0.075, 0.345)
  pocket.lineTo(0.035, 0.36)
  pocket.closePath()
  b.add('torso', 'khakiDark', wrapShape(pocket, shirt, { lift: 0.004 }), { tag: 'pocket' })
  b.add('torso', 'khaki', tube(0.092, 0.1, 0.055, 12), { p: [0, 0.645, 0], tag: 'collar' })
  for (const side of [-1, 1]) {
    b.add('torso', 'khakiDark', new BoxGeometry(0.07, 0.055, 0.012), { p: [side * 0.05, 0.612, 0.18], r: [0.6, side * 0.35, side * -0.6], shadow: false })
  }
  addPelvis(b, 'trousers', 0.212)
  // 米白肩巾：繞過後頸，兩端垂在胸前，末端兩道藍線
  b.add('torso', 'towel', ring(0.13, 0.026, 0.45 * Math.PI, 1.1 * Math.PI), { p: [0, 0.64, -0.01], tag: 'towel' })
  for (const side of [-1, 1]) {
    const top = new Vector3(side * 0.1, 0.612, shirt(0.6) + 0.006)
    const bottom = new Vector3(side * 0.09, 0.36, shirt(0.36) + 0.022)
    segment(b, 'torso', 'towel', new Vector3(side * 0.105, 0.655, 0.09), top, { width: 0.075, thickness: 0.024 })
    segment(b, 'torso', 'towel', top, bottom, { width: 0.075, thickness: 0.024 })
    for (const y of [0.42, 0.395]) {
      const t = (top.y - y) / (top.y - bottom.y)
      const p = top.clone().lerp(bottom, t)
      b.add('torso', 'stripe', new BoxGeometry(0.078, 0.008, 0.028), { p: [p.x, p.y, p.z], r: [-0.12, 0, 0], shadow: false })
    }
  }
  // 簡單布袋：提把掛在左肩，袋子在左後腰（左手擺幅縮小），袋口露出青蔥
  strapPath(b, 'torso', 'bagStrap', [[0.16, 0.655, 0.05], [0.19, 0.61, -0.1], [0.225, 0.4, -0.16], [0.235, 0.16, -0.2]], { width: 0.03, thickness: 0.014 })
  strapPath(b, 'torso', 'bagStrap', [[0.16, 0.655, -0.01], [0.18, 0.61, -0.14], [0.215, 0.4, -0.22], [0.225, 0.16, -0.31]], { width: 0.03, thickness: 0.014 })
  b.add('torso', 'bag', new BoxGeometry(0.1, 0.25, 0.24), { p: [0.24, 0.02, -0.27], r: [0, 0.35, -0.05], tag: 'clothBag' })
  for (const [x, z, rz] of [
    [0.22, -0.23, 0.2],
    [0.25, -0.26, -0.1],
    [0.24, -0.29, 0.35],
  ]) {
    b.add('torso', 'greens', new ConeGeometry(0.014, 0.16, 5), { p: [x, 0.2, z], r: [-0.15, 0, rz], shadow: false })
  }
  // 短袖（有厚度的袖口），露出手臂
  addSleeves(b, 'khaki', { length: 0.2, rTop: 0.082, rBottom: 0.079, cuff: 'khakiDark', cuffHeight: 0.035, cuffRadius: 0.084 })
  // 舊藍寬鬆直筒褲，褲腳反摺
  addTrousers(b, 'trousers', { length: 0.69, rTop: 0.11, rBottom: 0.1, cuff: 'trousersLight' })
  // 樸素黑布鞋（磨舊的淺色鞋底）
  addShoes(b, { upper: 'black', sole: 'sole', soleHeight: 0.022, height: 0.052, tag: 'clothShoes' })

  return b.build({ armSwing: { right: 1, left: 0.25 }, armSpread: { right: 0.12, left: 0.15 } })
}

/* ───────────── 2000–現在 老屋新生 ───────────── */

function revival() {
  const b = new OutfitBuilder('revival')
  addBody(b)
  const tee = (y) => radiusAt(y, 0.04, 0.2, 0.6, 0.188)
  const shirt = (y) => radiusAt(y, -0.08, 0.228, 0.6, 0.198)

  // 米白圓領 T-shirt
  b.add('torso', 'tee', tube(0.188, 0.2, 0.58, 14), { p: [0, 0.32, 0], tag: 'tShirt' })
  b.add('torso', 'tee', new TorusGeometry(0.09, 0.012, 4, 16), { p: [0, 0.61, 0.005], r: [Math.PI / 2 - 0.1, 0, 0], shadow: false })
  addPelvis(b, 'jeans', 0.21)
  // 淺卡其敞開襯衫：前襟邊條、衣襬、翻領
  const gap = 1.0
  b.add('torso', 'shirt', openShell(0.198, 0.228, 0.68, gap), { p: [0, 0.26, 0], tag: 'openShirt' })
  b.add('torso', 'shirtDark', ring(0.229, 0.011, gap / 2, Math.PI * 2 - gap), { p: [0, -0.08, 0] })
  for (const side of [-1, 1]) {
    const edge = (y) => {
      const r = shirt(y) + 0.004
      const a = side * (gap / 2 + 0.02)
      return new Vector3(r * Math.sin(a), y, r * Math.cos(a))
    }
    segment(b, 'torso', 'shirtDark', edge(0.6), edge(-0.08), { width: 0.03, thickness: 0.014 })
    // 翻領：從後頸翻到胸前的兩片
    b.add('torso', 'shirt', new BoxGeometry(0.08, 0.12, 0.014), { p: [side * 0.115, 0.57, 0.172], r: [0.25, side * 0.6, side * -0.45], tag: 'collar' })
  }
  b.add('torso', 'shirt', ring(0.115, 0.018, 0.5, Math.PI * 2 - 1.0), { p: [0, 0.63, -0.005] })
  // 小相機：背帶繞過後頸垂到胸前
  b.add('torso', 'black', ring(0.118, 0.006, 0.5 * Math.PI, Math.PI), { p: [0, 0.645, -0.005], shadow: false })
  for (const side of [-1, 1]) {
    strapPath(b, 'torso', 'black', [[side * 0.09, 0.648, 0.06], [side * 0.08, 0.615, 0.172], [side * 0.045, 0.44, tee(0.44) + 0.04]], { width: 0.014, thickness: 0.008 })
  }
  b.add('torso', 'camera', new BoxGeometry(0.115, 0.075, 0.05), { p: [0, 0.4, tee(0.4) + 0.045], tag: 'camera' })
  b.add('torso', 'silver', new BoxGeometry(0.117, 0.016, 0.052), { p: [0, 0.444, tee(0.4) + 0.045], shadow: false })
  b.add('torso', 'black', new CylinderGeometry(0.026, 0.026, 0.045, 12), { p: [0, 0.395, tee(0.4) + 0.09], r: [Math.PI / 2, 0, 0], shadow: false })
  // 帆布托特包：背帶掛在右肩，袋子在右後腰，外側印有大稻埕街景
  strapPath(b, 'torso', 'canvasDark', [[-0.16, 0.655, 0.05], [-0.19, 0.61, -0.1], [-0.228, 0.4, -0.17], [-0.24, 0.15, -0.21]], { width: 0.032, thickness: 0.012 })
  strapPath(b, 'torso', 'canvasDark', [[-0.16, 0.655, -0.01], [-0.18, 0.61, -0.14], [-0.218, 0.4, -0.23], [-0.23, 0.15, -0.33]], { width: 0.032, thickness: 0.012 })
  const tote = { x: -0.25, y: -0.01, z: -0.27, ry: -0.35 }
  b.add('torso', 'canvas', new BoxGeometry(0.08, 0.3, 0.27), { p: [tote.x, tote.y, tote.z], r: [0, tote.ry, 0.05], tag: 'toteBag' })
  // 袋子外側（朝右）的印刷
  const face = -0.042
  b.add('torso', 'print', new PlaneGeometry(0.22, 0.24), {
    p: [tote.x + face * Math.cos(tote.ry), tote.y, tote.z - face * Math.sin(tote.ry)],
    r: [0, tote.ry - Math.PI / 2, 0.05],
    shadow: false,
  })
  // 袖子捲到前臂
  addSleeves(b, 'shirt', { length: 0.36, rTop: 0.08, rBottom: 0.074, cuff: 'shirtDark', cuffHeight: 0.06, cuffRadius: 0.081 })
  // 深藍直筒休閒褲與白球鞋
  addTrousers(b, 'jeans', { length: 0.72, rTop: 0.102, rBottom: 0.094, cuff: 'jeansLight', cuffHeight: 0.035 })
  addShoes(b, { upper: 'sneaker', sole: 'sneakerSole', soleHeight: 0.034, length: 0.27, width: 0.112, height: 0.06, tag: 'sneakers' })
  for (const slot of ['footRight', 'footLeft']) b.add(slot, 'black', new BoxGeometry(0.04, 0.006, 0.07), { p: [0, -0.02, 0.07], r: [-0.35, 0, 0], shadow: false })

  return b.build({ armSwing: { right: 0.25, left: 1 }, armSpread: { right: 0.15, left: 0.12 } })
}

export const OUTFIT_BUILDERS = {
  'qing-port': qingPort,
  banquet,
  modern,
  postwar,
  revival,
}

/** 各套服裝的材質（顏色、紋理）；skin／hair／eye 五套共用 */
export const OUTFIT_PALETTES = {
  'qing-port': {
    jacket: { color: '#33405c', double: true },
    jacketEdge: { color: '#283247' },
    inner: { color: '#e3d8c2' },
    button: { color: '#4d3f33' },
    sash: { color: '#a99c84' },
    trousers: { color: '#5c534b' },
    trousersDark: { color: '#4b433d' },
    straw: { color: '#b9955b' },
    strawDark: { color: '#9a7a45' },
    strap: { color: '#9c8a69' },
    bag: { color: '#b6a385' },
    bagDark: { color: '#9f8d6f' },
    hat: { color: '#cfab6e', texture: 'weave' },
    hatRim: { color: '#a8824d' },
    strapThin: { color: '#6e5338' },
  },
  banquet: {
    robe: { color: '#6e2532', texture: 'robe', double: true },
    robeDark: { color: '#561b26' },
    innerCollar: { color: '#e8dcc6' },
    magua: { color: '#25201f', texture: 'brocade' },
    trim: { color: '#7d6440' },
    knot: { color: '#151212' },
    black: { color: '#1f1c1b' },
    blackLight: { color: '#2d2826' },
    sole: { color: '#d9d0be' },
    red: { color: '#a3262a' },
    cord: { color: '#6a4a2a' },
    pouch: { color: '#2b2c3c', texture: 'brocade' },
    tassel: { color: '#a3262a' },
    brass: { color: '#b08d4a' },
  },
  modern: {
    shirt: { color: '#efebe2', double: true },
    shirtFold: { color: '#e0dbd0' },
    trousers: { color: '#6f6e6b' },
    sock: { color: '#2c2622' },
    vest: { color: '#4b3a2e' },
    vestDark: { color: '#3b2e25' },
    buttonDark: { color: '#2a2019' },
    tie: { color: '#2b3552' },
    leather: { color: '#4a2f22' },
    leatherSole: { color: '#2b1d16' },
    case: { color: '#6b4128' },
    brass: { color: '#c9a24a' },
    cap: { color: '#6b5643', double: true },
    capDark: { color: '#57463a' },
  },
  postwar: {
    khaki: { color: '#ab9c80' },
    khakiDark: { color: '#968a71' },
    buttonLight: { color: '#e8e0cf' },
    trousers: { color: '#4f5b70' },
    trousersLight: { color: '#5d687b' },
    black: { color: '#262421' },
    sole: { color: '#c9bfab' },
    towel: { color: '#ece6d8' },
    stripe: { color: '#5d7196' },
    bagStrap: { color: '#b8aa8f' },
    bag: { color: '#cdbfa4' },
    greens: { color: '#5f8a4a' },
  },
  revival: {
    shirt: { color: '#c4b593', double: true },
    shirtDark: { color: '#ae9f7d' },
    tee: { color: '#f1eee6' },
    jeans: { color: '#2d3549' },
    jeansLight: { color: '#3a4358' },
    sneaker: { color: '#f2f0ea' },
    sneakerSole: { color: '#d8d4ca' },
    black: { color: '#262628' },
    camera: { color: '#2e2e31' },
    silver: { color: '#a9a9ac' },
    canvas: { color: '#ece4d2' },
    canvasDark: { color: '#d6ccb6' },
    print: { color: '#ffffff', texture: 'totePrint' },
  },
}

export const SHARED_PALETTE = { skin: SKIN, hair: HAIR, eye: EYE }

export const OUTFIT_IDS = Object.keys(OUTFIT_BUILDERS)

const cache = new Map()

/** 取得某年代的服裝（幾何只產生一次並快取；年代 id 不在清單時用第一套） */
export function getOutfit(eraId) {
  const id = OUTFIT_BUILDERS[eraId] ? eraId : OUTFIT_IDS[0]
  if (!cache.has(id)) cache.set(id, OUTFIT_BUILDERS[id]())
  return cache.get(id)
}

/** 某套服裝的材質設定（共用的皮膚、頭髮、眼睛 + 該套的顏色） */
export function getOutfitPalette(id) {
  return { ...SHARED_PALETTE, ...OUTFIT_PALETTES[id] }
}
