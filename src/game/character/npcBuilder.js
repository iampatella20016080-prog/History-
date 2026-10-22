import { BoxGeometry, BufferAttribute, Color, ConeGeometry, CylinderGeometry, Euler, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RIG } from './outfitBuilder.js'

/**
 * 店家與攤位裡的情境人物（NPC）：攤販、吃米苔目的客人、排隊的人與店員。
 *
 * 沿用主角的身形比例（outfitBuilder.js 的 RIG：髖部、肩膀、頭的高度）與同一張臉、同樣的頭髮做法，
 * 衣服與配色依年代與角色不同；另外加上手肘與膝蓋，才能坐在凳子上、拿筷子吃東西或招手。
 * 都是沒有名字、沒有身分的情境人物，不對應照片裡的任何人。
 *
 * 為了 iPad 的效能，每個人物合併成三個網格（頂點色、同一種材質）：
 *   body     身體、腿、左手臂與右上臂（不動）
 *   head     頭（以脖子為軸，點頭、轉頭）
 *   forearm  右前臂與手上的東西（以手肘為軸：夾菜吃東西、招手、舀湯）
 * 只產生幾何，不建立材質，可以在 Node 測試；人物面向 +Z，人物的右側是 -X，原點在腳下的地面。
 */

const SKIN = '#e2bf98'
const HAIR = '#2a221d'
const EYE = '#231b16'

/** 上臂與前臂（加上手）的長度：總長與主角的手臂相同（RIG.handY） */
export const UPPER_ARM = 0.28
export const FOREARM = -RIG.handY - UPPER_ARM
/** 坐姿：大腿長度、凳面以上到髖關節的高度 */
const THIGH = 0.42
const SEAT_HIP = 0.1

const _m = new Matrix4()
const _q = new Quaternion()
const _e = new Euler()
const _p = new Vector3()
const _s = new Vector3()
const _c = new Color()

/** 同一個網格的零件：每個零件寫入自己的頂點色，最後合併成一個幾何 */
class Parts {
  constructor() {
    this.list = []
  }

  /** frame：零件所在的座標系（Matrix4，可省略）；p／r／s：零件在 frame 裡的位置、旋轉、縮放 */
  add(color, geometry, { p = [0, 0, 0], r = [0, 0, 0], s = 1, frame = null } = {}) {
    const scale = Array.isArray(s) ? s : [s, s, s]
    _m.compose(_p.set(...p), _q.setFromEuler(_e.set(...r)), _s.set(...scale))
    if (frame) _m.premultiply(frame)
    let g = geometry.index ? geometry.toNonIndexed() : geometry
    if (g !== geometry) geometry.dispose()
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
    g.applyMatrix4(_m)
    _c.set(color)
    const count = g.attributes.position.count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = _c.r
      colors[i * 3 + 1] = _c.g
      colors[i * 3 + 2] = _c.b
    }
    g.setAttribute('color', new BufferAttribute(colors, 3))
    this.list.push(g)
    return this
  }

  build() {
    if (!this.list.length) return null
    const geometry = this.list.length === 1 ? this.list[0] : mergeGeometries(this.list, false)
    this.list.forEach((g) => g !== geometry && g.dispose())
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
    return geometry
  }
}

const tube = (rTop, rBottom, height, radial = 10) => new CylinderGeometry(rTop, rBottom, height, radial, 1, false)
const sphere = (r, w = 12, h = 8) => new SphereGeometry(r, w, h)
const box = (x, y, z) => new BoxGeometry(x, y, z)

/** 座標系：位置 p、依序繞 x、y、z 的旋轉 */
function frameOf(p, r = [0, 0, 0], parent = null) {
  const m = new Matrix4().compose(new Vector3(...p), new Quaternion().setFromEuler(new Euler(...r)), new Vector3(1, 1, 1))
  return parent ? m.premultiply(parent) : m
}

/* ───────────── 角色的外觀（年代、衣服、頭髮、配件） ───────────── */

/**
 * top：上衣（tee 短袖 T 恤／shirt 有領的短袖襯衫／singlet 白色背心／long 長袖）
 * hair：short 短髮／bun 盤髮／long 長髮／bob 齊耳短髮
 * extras：apron 圍裙、towel 肩上的毛巾、backpack 背包、bucketHat 漁夫帽、cap 棒球帽、mask 口罩、strap 斜背包的背帶
 */
export const NPC_LOOKS = {
  // 1945–1980：米苔目攤的攤販與客人
  postwarVendor: { era: 'postwar', skin: '#d6ad84', hair: 'short', top: { kind: 'singlet', color: '#efebe1' }, bottom: '#454b55', shoes: ['#2a2622', '#c9bfab'], extras: { apron: '#5f7186', towel: '#ece6d8' } },
  postwarDiner: { era: 'postwar', hair: 'short', top: { kind: 'shirt', color: '#e6e1d3', trim: '#cfc8b6' }, bottom: '#6a6862', shoes: ['#4a3225', '#2b1d16'] },
  postwarDinerWoman: { era: 'postwar', hair: 'bun', top: { kind: 'shirt', color: '#b46a5e', trim: '#9a5549' }, bottom: '#34405a', shoes: ['#2a2622', '#c9bfab'] },
  postwarCustomer: { era: 'postwar', hair: 'short', top: { kind: 'shirt', color: '#9fb2c4', trim: '#8597aa' }, bottom: '#4f5b70', shoes: ['#2a2622', '#c9bfab'] },
  // 2000–現在：永樂米苔目的客人與店員
  revivalDiner: { era: 'revival', hair: 'short', top: { kind: 'tee', color: '#2f3d5a' }, bottom: '#3a4560', shoes: ['#f1efe9', '#d8d4ca'] },
  revivalDinerWoman: { era: 'revival', hair: 'long', top: { kind: 'tee', color: '#ebe6dc', trim: '#2f3d5a' }, bottom: '#8a8f96', shoes: ['#f1efe9', '#d8d4ca'] },
  revivalDinerBackpack: { era: 'revival', hair: 'bob', top: { kind: 'tee', color: '#87303b' }, bottom: '#2c2c30', shoes: ['#2c2c30', '#e9e5dc'], extras: { backpack: '#cfae93' } },
  revivalDinerHat: { era: 'revival', hair: 'short', top: { kind: 'shirt', color: '#a7c0a0', trim: '#8fa888' }, bottom: '#9a8a6c', shoes: ['#6e6a66', '#3a3836'], extras: { bucketHat: '#4a4f5a' } },
  revivalQueue: { era: 'revival', hair: 'short', top: { kind: 'tee', color: '#2b2b2e', trim: '#e9e6df' }, bottom: '#39445a', shoes: ['#f1efe9', '#d8d4ca'], extras: { strap: '#3a3a3e' } },
  revivalQueueWoman: { era: 'revival', hair: 'bob', top: { kind: 'tee', color: '#9a3446' }, bottom: '#232327', shoes: ['#2c2c30', '#e9e5dc'], extras: { strap: '#7a5a42' } },
  revivalCustomer: { era: 'revival', hair: 'short', top: { kind: 'tee', color: '#7d8389' }, bottom: '#3c3f45', shoes: ['#3c3f45', '#e9e5dc'] },
  revivalStaff: { era: 'revival', hair: 'short', top: { kind: 'tee', color: '#5d6f80' }, bottom: '#2a2b2f', shoes: ['#2a2b2f', '#5c5d60'], extras: { apron: '#2a2a2c', cap: '#2a2a2c', mask: '#f3f3f0' } },
  revivalStaffBack: { era: 'revival', hair: 'bun', top: { kind: 'tee', color: '#5d6f80' }, bottom: '#2a2b2f', shoes: ['#2a2b2f', '#5c5d60'], extras: { apron: '#2a2a2c' } },
}

/* ───────────── 姿勢 ───────────── */

/**
 * 每個姿勢的關節角度（弧度）：
 *   lean 上半身前傾；head 頭的低頭角度
 *   right／left：shoulder 上臂往前抬（0 為自然下垂）、spread 向外張開、twist 往身體中線收、elbow 前臂再往前彎
 *   anim：右前臂（手肘）與頭的待機動作（elbow：彎曲角度的範圍；period 秒）
 *   holds：右手拿的東西（chopsticks 筷子、ladle 湯勺、phone 手機）
 */
export const NPC_POSES = {
  stand: {
    seated: false,
    lean: 0,
    head: 0.04,
    right: { shoulder: 0.06, spread: 0.1, twist: 0, elbow: 0.16 },
    left: { shoulder: 0.06, spread: 0.1, twist: 0, elbow: 0.16 },
    anim: { elbow: [0.16, 0.2], period: 4.2, nod: 0.03, turn: 0.18 },
  },
  phone: {
    seated: false,
    lean: 0.04,
    head: 0.42,
    right: { shoulder: 0.32, spread: 0.06, twist: -0.3, elbow: 1.45 },
    left: { shoulder: 0.32, spread: 0.06, twist: -0.32, elbow: 1.4 },
    anim: { elbow: [1.42, 1.5], period: 3.4, nod: 0.05, turn: 0.06 },
    holds: 'phone',
  },
  wave: {
    seated: false,
    lean: 0.06,
    head: 0.02,
    // 右手舉到胸前往自己的方向招手；左手扶著攤台
    right: { shoulder: 1.05, spread: 0.32, twist: 0, elbow: 0.7 },
    left: { shoulder: 0.62, spread: 0.08, twist: -0.12, elbow: 0.5 },
    anim: { elbow: [0.35, 1.35], period: 1.1, nod: 0.08, turn: 0.12 },
  },
  ladle: {
    seated: false,
    lean: 0.14,
    head: 0.3,
    right: { shoulder: 0.72, spread: 0.12, twist: -0.1, elbow: 0.55 },
    left: { shoulder: 0.66, spread: 0.06, twist: -0.18, elbow: 0.9 },
    anim: { elbow: [0.4, 0.95], period: 2.6, nod: 0.05, turn: 0.1 },
    holds: 'ladle',
  },
  eat: {
    seated: true,
    lean: 0.16,
    head: 0.26,
    // 右手拿筷子在碗與嘴之間來回；左手扶著桌上的碗
    right: { shoulder: 0.5, spread: 0.04, twist: -0.28, elbow: 1.2 },
    left: { shoulder: 0.62, spread: 0.06, twist: -0.22, elbow: 1.0 },
    anim: { elbow: [1.05, 2.25], period: 3.0, nod: 0.12, turn: 0.08 },
    holds: 'chopsticks',
  },
}

/* ───────────── 身體各部位 ───────────── */

function headParts(parts, look, extras) {
  const hairColor = look.hairColor ?? HAIR
  const skin = look.skin ?? SKIN
  parts.add(skin, tube(0.055, 0.065, 0.1, 8), { p: [0, 0.02, 0] })
  parts.add(skin, sphere(0.155, 16, 12), { p: [0, 0.16, 0] })
  // 頭髮：頭頂、後腦（與主角相同），再依髮型加上盤髮、長髮或齊耳短髮
  parts.add(hairColor, new SphereGeometry(0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), { p: [0, 0.19, -0.025], s: [1.05, 1, 1.05] })
  parts.add(hairColor, sphere(0.15, 12, 10), { p: [0, 0.155, -0.05], s: [1.02, 0.9, 0.9] })
  if (look.hair === 'bun') parts.add(hairColor, sphere(0.075, 10, 8), { p: [0, 0.25, -0.16] })
  if (look.hair === 'long') parts.add(hairColor, box(0.25, 0.34, 0.07), { p: [0, 0.02, -0.12], r: [0.08, 0, 0] })
  if (look.hair === 'bob') {
    for (const side of [-1, 1]) parts.add(hairColor, box(0.05, 0.18, 0.2), { p: [side * 0.14, 0.1, -0.02] })
    parts.add(hairColor, box(0.26, 0.16, 0.06), { p: [0, 0.09, -0.14] })
  }
  for (const [x, rz] of [[-0.07, 0.3], [-0.022, 0.08], [0.028, -0.1], [0.074, -0.34]]) {
    parts.add(hairColor, new ConeGeometry(0.04, 0.09, 6), { p: [x, 0.24, 0.106], r: [0.2, 0, rz + Math.PI], s: [1, 1, 0.6] })
  }
  for (const side of [-1, 1]) {
    parts.add(EYE, sphere(0.017, 6, 4), { p: [side * 0.052, 0.16, 0.142] })
    parts.add(hairColor, box(0.048, 0.011, 0.014), { p: [side * 0.055, 0.2, 0.142], r: [0, 0, side * -0.12] })
  }
  if (extras.mask) parts.add(extras.mask, box(0.17, 0.09, 0.05), { p: [0, 0.095, 0.13], r: [-0.12, 0, 0] })
  if (extras.cap) {
    parts.add(extras.cap, new SphereGeometry(0.165, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), { p: [0, 0.2, -0.01] })
    parts.add(extras.cap, box(0.2, 0.018, 0.13), { p: [0, 0.205, 0.2], r: [-0.12, 0, 0] })
  }
  if (extras.bucketHat) {
    parts.add(extras.bucketHat, tube(0.15, 0.17, 0.13, 14), { p: [0, 0.28, -0.01] })
    parts.add(extras.bucketHat, tube(0.23, 0.25, 0.025, 16), { p: [0, 0.215, -0.01] })
  }
}

/** 上衣、骨盆、圍裙、毛巾與背包（軀幹座標：原點在髖部） */
function torsoParts(parts, look, extras, frame) {
  const { kind, color, trim } = look.top
  const edge = trim ?? new Color(color).multiplyScalar(0.86).getStyle()
  parts.add(color, tube(0.194, 0.224, 0.63, 16), { p: [0, 0.285, 0], frame })
  parts.add(edge, tube(0.228, 0.228, 0.025, 16), { p: [0, -0.02, 0], frame })
  parts.add(look.bottom, tube(0.212, 0.2, 0.12, 12), { p: [0, -0.03, 0], frame })
  if (kind === 'shirt') {
    // 襯衫領與門襟
    parts.add(color, tube(0.092, 0.1, 0.055, 12), { p: [0, 0.645, 0], frame })
    for (const side of [-1, 1]) parts.add(edge, box(0.07, 0.055, 0.012), { p: [side * 0.05, 0.612, 0.18], r: [0.6, side * 0.35, side * -0.6], frame })
    parts.add(edge, box(0.028, 0.56, 0.012), { p: [0, 0.32, 0.215], r: [-0.05, 0, 0], frame })
  } else {
    // T 恤與背心的圓領
    parts.add(edge, tube(0.1, 0.104, 0.03, 12), { p: [0, 0.615, 0], frame })
  }
  if (extras.apron) {
    // 圍裙：胸前到大腿的一片布與掛在脖子上的帶子
    parts.add(extras.apron, box(0.32, 0.74, 0.02), { p: [0, 0.13, 0.225], r: [-0.04, 0, 0], frame })
    for (const side of [-1, 1]) parts.add(extras.apron, box(0.02, 0.2, 0.02), { p: [side * 0.08, 0.56, 0.19], r: [-0.35, 0, side * 0.3], frame })
    parts.add(extras.apron, tube(0.232, 0.232, 0.03, 16), { p: [0, 0.18, 0], frame })
  }
  if (extras.towel) {
    // 搭在右肩上的毛巾
    parts.add(extras.towel, box(0.1, 0.03, 0.3), { p: [-0.17, 0.64, 0], r: [0, 0, 0.35], frame })
    parts.add(extras.towel, box(0.1, 0.24, 0.025), { p: [-0.2, 0.5, 0.17], r: [-0.1, 0, 0.1], frame })
  }
  if (extras.backpack) {
    parts.add(extras.backpack, box(0.3, 0.38, 0.14), { p: [0, 0.34, -0.29], frame })
    for (const side of [-1, 1]) parts.add(new Color(extras.backpack).multiplyScalar(0.8).getStyle(), box(0.04, 0.42, 0.03), { p: [side * 0.11, 0.38, 0.2], r: [0.08, 0, 0], frame })
  }
  if (extras.strap) {
    // 斜背包的背帶：右肩到左腰
    parts.add(extras.strap, box(0.035, 0.68, 0.02), { p: [0, 0.32, 0.215], r: [0, 0, 0.62], frame })
    parts.add(extras.strap, box(0.22, 0.16, 0.06), { p: [0.2, 0.0, 0.12], r: [0, -0.6, 0], frame })
  }
}

/** 上臂的袖子（短袖、背心露出手臂）：上臂座標，原點在肩膀、往 -y */
function upperArm(parts, look, frame) {
  const { kind, color, trim } = look.top
  const skin = look.skin ?? SKIN
  const edge = trim ?? new Color(color).multiplyScalar(0.86).getStyle()
  parts.add(kind === 'singlet' ? skin : color, new SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, -0.005, 0], frame })
  if (kind === 'singlet') {
    parts.add(skin, tube(0.064, 0.056, UPPER_ARM, 8), { p: [0, -UPPER_ARM / 2, 0], frame })
  } else {
    const sleeve = kind === 'long' ? UPPER_ARM : 0.2
    parts.add(color, tube(0.082, 0.078, sleeve, 10), { p: [0, -sleeve / 2, 0], frame })
    parts.add(edge, tube(0.084, 0.084, 0.03, 10), { p: [0, -sleeve + 0.01, 0], frame })
    if (sleeve < UPPER_ARM) parts.add(skin, tube(0.058, 0.055, UPPER_ARM - sleeve + 0.02, 8), { p: [0, -(sleeve + UPPER_ARM) / 2, 0], frame })
  }
  parts.add(skin, sphere(0.056, 8, 6), { p: [0, -UPPER_ARM, 0], frame })
}

/** 前臂、手與手上的東西：手肘座標，原點在手肘、往 -y */
function forearm(parts, look, holds, frame) {
  const skin = look.skin ?? SKIN
  const sleeve = look.top.kind === 'long'
  parts.add(sleeve ? look.top.color : skin, tube(0.054, 0.046, FOREARM - 0.03, 8), { p: [0, -(FOREARM - 0.03) / 2, 0], frame })
  parts.add(skin, sphere(0.056, 8, 6), { p: [0, -FOREARM, 0.01], frame })
  if (holds === 'chopsticks') {
    for (const dx of [-0.012, 0.012]) parts.add('#c9a46e', tube(0.005, 0.004, 0.22, 4), { p: [dx, -FOREARM - 0.02, 0.1], r: [Math.PI / 2 - 0.25, 0, 0], frame })
  } else if (holds === 'ladle') {
    parts.add('#b9bec0', tube(0.008, 0.008, 0.42, 6), { p: [0, -FOREARM - 0.02, 0.17], r: [Math.PI / 2 - 0.5, 0, 0], frame })
    parts.add('#aeb3b5', new SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { p: [0, -FOREARM - 0.2, 0.36], frame })
  } else if (holds === 'phone') {
    parts.add('#26272b', box(0.075, 0.012, 0.14), { p: [0.03, -FOREARM - 0.03, 0.03], r: [0.2, 0, 0], frame })
  }
}

/** 腳：站著時腿往下伸直；坐著時大腿往前、小腿往下，鞋底貼地 */
function legs(parts, look, pose, seatY) {
  const [upper, sole] = look.shoes
  const trousers = look.bottom
  const skirt = new Color(trousers).multiplyScalar(0.9).getStyle()
  for (const side of [-1, 1]) {
    const x = side * RIG.legX
    if (!pose.seated) {
      const hip = RIG.hipY
      parts.add(trousers, tube(0.108, 0.094, hip - 0.12, 10), { p: [x, 0.12 + (hip - 0.12) / 2, 0] })
      parts.add(skirt, tube(0.098, 0.098, 0.03, 10), { p: [x, 0.13, 0] })
      parts.add(skin(look), tube(0.045, 0.045, 0.06, 8), { p: [x, 0.1, 0] })
      shoe(parts, upper, sole, x, 0)
    } else {
      const hip = seatY + SEAT_HIP
      const knee = { y: hip - 0.03, z: THIGH }
      // 大腿：從髖關節往前
      parts.add(trousers, tube(0.108, 0.1, THIGH + 0.06, 10), { p: [x, (hip + knee.y) / 2, THIGH / 2], r: [Math.PI / 2 + Math.atan2(hip - knee.y, THIGH), 0, 0] })
      parts.add(trousers, sphere(0.1, 10, 8), { p: [x, knee.y, knee.z] })
      // 小腿：從膝蓋往下到腳踝（鞋底在地面）
      const shin = knee.y - 0.12
      parts.add(trousers, tube(0.098, 0.09, shin, 10), { p: [x, 0.12 + shin / 2, knee.z + 0.02] })
      parts.add(skin(look), tube(0.045, 0.045, 0.06, 8), { p: [x, 0.1, knee.z + 0.02] })
      shoe(parts, upper, sole, x, knee.z + 0.02)
    }
  }
}

const skin = (look) => look.skin ?? SKIN

function shoe(parts, upper, sole, x, z) {
  parts.add(sole, box(0.105, 0.024, 0.25), { p: [x, 0.012, z + 0.05] })
  parts.add(upper, new SphereGeometry(0.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [x, 0.02, z + 0.05], s: [0.1, 0.11, 0.24] })
  parts.add(upper, tube(0.05, 0.055, 0.05, 8), { p: [x, 0.075, z - 0.02] })
}

/* ───────────── 組合 ───────────── */

/** 一隻手臂的肩膀與手肘座標系（軀幹座標系 torso 之下） */
function armFrames(torso, side, angles) {
  // side：-1 為人物的右手（-X），1 為左手
  const { shoulder, spread, twist, elbow } = angles
  const shoulderFrame = frameOf([side * RIG.shoulderX, RIG.shoulderY, 0], [0, 0, 0], torso)
  // 先往外張開、往內收，再往前抬（往前抬是繞 x 軸的負角度：手往 +z）
  const rotation = new Matrix4().makeRotationFromEuler(new Euler(-shoulder, side * twist, side * spread, 'ZYX'))
  shoulderFrame.multiply(rotation)
  const elbowFrame = frameOf([0, -UPPER_ARM, 0], [-elbow, 0, 0], shoulderFrame)
  return { shoulderFrame, elbowFrame }
}

/**
 * 產生一個人物的三個網格與關節（人物本地座標）：
 * { body, head, forearm, headPivot: { position, quaternion }, elbowPivot: { position, quaternion }, pose, look, hipY }
 * elbowPivot 是「手肘彎曲角度為 0」時的座標系；動畫時前臂繞它的 x 軸彎曲（負角度往前）。
 * seatY：坐著的人物的凳面高度（站著的人物忽略）。
 */
export function buildNpcGeometry(lookId, poseId, { seatY = 0.46 } = {}) {
  const look = NPC_LOOKS[lookId]
  const pose = NPC_POSES[poseId]
  if (!look) throw new Error(`未知的人物外觀：${lookId}`)
  if (!pose) throw new Error(`未知的人物姿勢：${poseId}`)
  const extras = look.extras ?? {}
  const hipY = pose.seated ? seatY + SEAT_HIP : RIG.hipY
  const torso = frameOf([0, hipY, 0], [pose.lean, 0, 0])

  const body = new Parts()
  legs(body, look, pose, seatY)
  torsoParts(body, look, extras, torso)
  const right = armFrames(torso, -1, pose.right)
  const left = armFrames(torso, 1, pose.left)
  upperArm(body, look, right.shoulderFrame)
  upperArm(body, look, left.shoulderFrame)
  forearm(body, look, null, left.elbowFrame)

  // 右前臂：在「手肘角度為 0」的座標系裡產生，動畫時再彎曲
  const elbowRest = frameOf([0, -UPPER_ARM, 0], [0, 0, 0], right.shoulderFrame)
  const arm = new Parts()
  forearm(arm, look, pose.holds ?? null, null)

  const headFrame = frameOf([0, RIG.headY, 0], [0, 0, 0], torso)
  const head = new Parts()
  headParts(head, look, extras)

  const decompose = (m) => {
    const position = new Vector3()
    const quaternion = new Quaternion()
    m.decompose(position, quaternion, new Vector3())
    return { position: position.toArray(), quaternion: quaternion.toArray() }
  }
  return {
    body: body.build(),
    head: head.build(),
    forearm: arm.build(),
    headPivot: decompose(headFrame),
    elbowPivot: decompose(elbowRest),
    pose,
    look,
    hipY,
  }
}

/** 某個姿勢在時間 t（秒）的右手肘彎曲角度與頭的點頭、轉頭角度（phase：每個人物錯開的相位） */
export function npcAnimation(pose, t, phase = 0) {
  const { elbow, period, nod, turn } = pose.anim
  const cycle = (t / period + phase) % 1
  // 吃東西與招手：大部分時間在起點附近，中段很快地舉起再放下
  const lift = pose.holds === 'chopsticks' ? Math.max(0, Math.sin(cycle * Math.PI * 2 - 0.6)) ** 2 : 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2)
  return {
    elbow: elbow[0] + (elbow[1] - elbow[0]) * lift,
    nod: pose.head + Math.sin((t / period + phase) * Math.PI * 2) * nod,
    turn: Math.sin(t * 0.37 + phase * 6.28) * turn,
  }
}
