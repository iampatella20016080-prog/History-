import { IcosahedronGeometry } from 'three'
import { PIER, PLAZA, RIVER, STREET } from '../config.js'
import { createRng, pick, range } from '../utils/random.js'
import { shade } from './props.js'
import { gableShape, junkHullShape, ridgeShape, sailShape } from './shapes.js'

/* ───────────── 地面、街道鋪面、河岸與碼頭 ───────────── */
export function buildGround(b) {
  const groundMinX = RIVER.edgeX
  const groundMaxX = 330
  const groundW = groundMaxX - groundMinX
  b.plane('earth', groundW, 660, [(groundMinX + groundMaxX) / 2, -0.01, 0], {
    rotation: [-Math.PI / 2, 0, 0],
    uvRepeat: [groundW / 4, 660 / 4],
  })
  // 對岸
  b.plane('earth', 520, 900, [-480, RIVER.waterLevel + 0.45, 0], {
    rotation: [-Math.PI / 2, 0, 0],
    uvRepeat: [520 / 6, 900 / 6],
    tint: '#c2c49d',
  })

  // 中央石板路
  const laneStart = PLAZA.maxX - 0.4
  const laneEnd = STREET.endFacadeX
  b.box('stone', [laneEnd - laneStart, 0.03, STREET.laneHalfWidth * 2], [(laneStart + laneEnd) / 2, 0.015, 0], {
    tint: '#f2ece0',
  })
  // 排水溝
  const edge = STREET.facadeZ - STREET.walkwayDepth
  for (const side of [-1, 1]) {
    b.box('dark', [STREET.rowEndX - STREET.rowStartX, 0.012, 0.16], [(STREET.rowStartX + STREET.rowEndX) / 2, 0.006, side * (edge - 0.08)], {
      tint: '#857a69',
    })
  }
  // 河岸廣場鋪面
  b.box('stone', [PLAZA.maxX - PLAZA.minX, 0.03, PLAZA.halfDepth * 2], [(PLAZA.minX + PLAZA.maxX) / 2, 0.015, 0], {
    tint: '#ebe4d6',
  })
  // 石砌堤岸
  const bankW = PLAZA.minX - RIVER.edgeX
  b.box('stone', [bankW, 2.5, 150], [RIVER.edgeX + bankW / 2, -1.2, 0], { tint: '#a69d8b', grime: 0.35 })
  b.box('stone', [bankW + 0.12, 0.14, 150], [RIVER.edgeX + bankW / 2 - 0.06, 0.07, 0], { tint: '#cbc3b2' })

  // 碼頭棧橋
  const deckLen = PIER.maxX + 0.6 - PIER.minX
  b.box('planks', [deckLen, 0.14, PIER.halfWidth * 2], [PIER.minX + deckLen / 2, -0.03, 0], {
    rotation: [0, 0, 0],
    tint: '#c9b08c',
  })
  for (const side of [-1, 1]) {
    b.box('wood', [deckLen, 0.16, 0.12], [PIER.minX + deckLen / 2, -0.15, side * (PIER.halfWidth - 0.06)], {
      tint: '#7a5f45',
    })
  }
  for (let x = PIER.maxX - 1.2; x >= PIER.minX; x -= 2.3) {
    for (const side of [-1, 1]) {
      b.cylinder('wood', 0.12, 0.13, 2.6, 7, [x, -1.3, side * (PIER.halfWidth - 0.1)], { tint: '#6c5440', grime: 0.4 })
    }
    b.box('wood', [0.16, 0.14, PIER.halfWidth * 2], [x, -0.2, 0], { tint: '#6c5440' })
  }
}

export function buildMooringPosts(b, posts) {
  for (const [x, z] of posts) {
    b.cylinder('wood', 0.13, 0.15, 0.62, 8, [x, 0.31, z], { tint: '#6f5641', grime: 0.3 })
    b.cylinder('wood', 0.17, 0.17, 0.08, 8, [x, 0.64, z], { tint: '#5b4635' })
  }
}

/* ───────────── 背景建築（第二排屋頂，形成天際線） ───────────── */
function backdropHouse(b, { x, z, width, depth, height, material, tint, roofTint, gable, rotationY = 0 }) {
  b.group([x, 0, z], rotationY, () => {
    const rise = Math.min(2.6, depth * 0.26)
    const ridgeY = height + rise
    b.box(material, [width - 0.5, height, depth - 0.2], [0, height / 2, -depth / 2], { tint, grime: 0.15 })
    const shape = gableShape(depth, height, ridgeY, gable)
    b.extrude(material, shape, 0.25, { position: [-width / 2, 0, 0], rotation: [0, Math.PI / 2, 0], tint })
    b.extrude(material, shape, 0.25, { position: [width / 2 - 0.25, 0, 0], rotation: [0, Math.PI / 2, 0], tint })
    const angle = Math.atan(rise / (depth / 2))
    const len = Math.hypot(depth / 2 + 0.4, rise + 0.18) + 0.1
    b.box('roof', [width - 0.48, 0.12, len], [0, height + rise / 2 - 0.02, -depth / 4 + 0.2], {
      rotation: [angle, 0, 0],
      tint: roofTint,
    })
    b.box('roof', [width - 0.48, 0.12, len], [0, height + rise / 2 - 0.02, (-depth * 3) / 4 - 0.2], {
      rotation: [-angle, 0, 0],
      tint: shade(roofTint, 0.92),
    })
    b.extrude('roof', ridgeShape(width - 0.3, 'curved'), 0.3, {
      position: [0, ridgeY - 0.06, -depth / 2 - 0.15],
      tint: shade(roofTint, 0.85),
    })
  })
}

/**
 * 在街屋列後方排出第二、三排較簡化的屋頂，形成有層次的天際線。
 * exclusions：要留空的區域（樹、廟宇），格式 { minX, maxX, minZ, maxZ }
 */
export function buildBackdrop(b, exclusions = []) {
  const rng = createRng(91)
  const tints = ['#e9dcc0', '#e2d7bd', '#d9dac3', '#ead6b9']
  const roofTints = ['#ffffff', '#ece0d8', '#ddd5cf']
  // 沿 x 排列的帶狀區域：[x0, x1, 立面 z, 朝向]；朝向 0 = 面南、PI = 面北
  const strips = [
    [-33, 36, -19.5, 0],
    [-33, 36, 19.5, Math.PI],
    [-44, -34, -21, 0],
    [-44, -34, 21, Math.PI],
    [37.5, 64, -7.4, 0],
    [37.5, 64, 7.4, Math.PI],
  ]
  const blocked = (minX, maxX, minZ, maxZ) =>
    exclusions.some((e) => minX < e.maxX && maxX > e.minX && minZ < e.maxZ && maxZ > e.minZ)

  const place = (config) => {
    const { x, z, width, depth, rotationY } = config
    // 粗略計算佔地（四種朝向皆為軸對齊）
    const alongX = Math.abs(Math.sin(rotationY)) < 0.5
    const hx = alongX ? width / 2 : depth
    const hz = alongX ? depth : width / 2
    if (blocked(x - hx, x + hx, z - hz, z + hz)) return
    backdropHouse(b, config)
  }
  const randomConfig = () => ({
    width: range(rng, 4.5, 7.5),
    depth: range(rng, 7, 10),
    height: pick(rng, [3.6, 4.2, 4.8, 6.0, 6.6]),
    material: rng() < 0.45 ? 'brick' : 'plaster',
    tint: pick(rng, tints),
    roofTint: pick(rng, roofTints),
    gable: rng() < 0.5 ? 'horseback' : 'gable',
  })

  for (const [x0, x1, zFace, rotationY] of strips) {
    let x = x0
    while (x < x1) {
      const config = randomConfig()
      const inset = range(rng, 0, 2.2)
      const z = rotationY === 0 ? zFace - inset : zFace + inset
      place({ ...config, x: x + config.width / 2, z, rotationY })
      x += config.width + range(rng, 0, 1.2)
    }
  }
  // 街底建築後方：面向西、沿 z 排列
  let z = -6.4
  while (z < 6.4) {
    const config = randomConfig()
    place({ ...config, x: 51 + range(rng, 0, 4), z: z + config.width / 2, rotationY: -Math.PI / 2 })
    z += config.width + range(rng, 0, 1)
  }
}

/* ───────────── 遠方廟宇屋頂（不標示名稱，僅作天際線） ───────────── */
export function buildTempleRoofs(b, position = [6, 0, 25], rotationY = Math.PI) {
  b.group(position, rotationY, () => {
    const w = 11
    const d = 9
    b.box('brick', [w, 4.2, d], [0, 2.1, -d / 2], { grime: 0.2 })
    // 下層屋簷
    for (const s of [1, -1]) {
      b.box('roof', [w + 1.2, 0.14, 3.0], [0, 4.55, -d / 2 + s * 3.6], {
        rotation: [s * 0.42, 0, 0],
        tint: '#f4e2d8',
      })
    }
    // 上層
    b.box('plaster', [w - 3, 2.2, d - 3], [0, 5.6, -d / 2], { tint: '#eadcc2' })
    for (const s of [1, -1]) {
      b.box('roof', [w - 1.4, 0.14, 3.6], [0, 7.25, -d / 2 + s * 1.65], {
        rotation: [s * 0.5, 0, 0],
        tint: '#ffffff',
      })
    }
    b.extrude('roof', ridgeShape(w - 2.2, 'swallowtail'), 0.4, {
      position: [0, 8.05, -d / 2 - 0.2],
      tint: '#d9c4b8',
    })
    // 屋脊中央寶珠
    b.add('plain', new IcosahedronGeometry(0.32, 1), { position: [0, 8.65, -d / 2], tint: '#c9a24f' })
  })
}

/* ───────────── 樹木 ───────────── */
export function buildTree(b, position, { scale = 1, seed = 1, banyan = false } = {}) {
  const rng = createRng(seed)
  const [x, y, z] = position
  const trunkH = (banyan ? 2.6 : 3.2) * scale
  b.cylinder('wood', 0.28 * scale, (banyan ? 0.55 : 0.38) * scale, trunkH, 8, [x, y + trunkH / 2, z], {
    tint: '#8a7258',
    grime: 0.25,
  })
  const blobs = banyan ? 7 : 5
  const greens = ['#8e9c77', '#7f8e6b', '#9aa682', '#86956f']
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2 + rng()
    const d = (i === 0 ? 0 : range(rng, 1.0, 2.0)) * scale * (banyan ? 1.4 : 1)
    const r = range(rng, 1.4, 2.1) * scale * (banyan ? 1.15 : 1)
    b.add('plain', new IcosahedronGeometry(r, 1), {
      position: [x + Math.cos(a) * d, y + trunkH + range(rng, 0.6, 1.6) * scale, z + Math.sin(a) * d],
      scale: [1, 0.72, 1],
      rotation: [0, rng() * 6, 0],
      tint: pick(rng, greens),
    })
  }
  if (banyan) {
    // 氣根
    for (let i = 0; i < 9; i++) {
      const a = rng() * Math.PI * 2
      const d = range(rng, 0.9, 2.6)
      const h = range(rng, 1.6, 2.6)
      b.cylinder('wood', 0.025, 0.035, h, 4, [x + Math.cos(a) * d, y + trunkH + 0.5 - h / 2, z + Math.sin(a) * d], {
        tint: '#7c6650',
      })
    }
    // 樹下石座
    b.cylinder('stone', 0.95, 1.05, 0.38, 10, [x, y + 0.19, z], { tint: '#c8c0ae' })
  }
}

/* ───────────── 戎克船 ───────────── */
export function buildJunk(b, { length = 9, beam = 2.6, sails = 2, sailTint = '#b98d5f', furled = false, sailAngle = 1.1 } = {}) {
  b.extrude('wood', junkHullShape(length), beam, { position: [0, 0, -beam / 2], tint: '#8d6c4d', grime: 0.3 })
  b.box('planks', [length - 1.3, 0.08, beam - 0.1], [0.1, 0.92, 0], { tint: '#bf9f7a' })
  for (const s of [-1, 1]) {
    b.box('wood', [length * 0.86, 0.14, 0.08], [0.05, 1.02, s * (beam / 2 + 0.02)], { tint: '#5d4533' })
    // 船眼
    b.cylinder('plain', 0.17, 0.17, 0.03, 10, [length / 2 - 0.95, 0.7, s * (beam / 2 + 0.03)], {
      rotation: [Math.PI / 2, 0, 0],
      tint: '#efe6d2',
    })
    b.cylinder('plain', 0.08, 0.08, 0.04, 8, [length / 2 - 0.92, 0.7, s * (beam / 2 + 0.04)], {
      rotation: [Math.PI / 2, 0, 0],
      tint: '#2b231d',
    })
  }
  b.box('wood', [2.0, 0.95, beam - 0.5], [-length / 2 + 1.5, 1.4, 0], { tint: '#9d7e5d' })
  b.box('roof', [2.3, 0.1, beam - 0.2], [-length / 2 + 1.5, 1.92, 0], { tint: '#e5d7cc' })
  const masts = sails === 1 ? [length * 0.1] : [length * 0.18, -length * 0.12]
  masts.forEach((mx, i) => {
    const h = i === 0 ? 7.2 : 5.6
    b.cylinder('wood', 0.07, 0.11, h, 6, [mx, 0.9 + h / 2, 0], { tint: '#6f533b' })
    if (furled) {
      b.cylinder('cloth', 0.22, 0.22, 2.6, 7, [mx - 0.3, 0.9 + h * 0.35, 0], { rotation: [0, 0, Math.PI / 2], tint: sailTint })
      return
    }
    // 帆繞桅杆轉向，讓岸上看得到帆面
    const sw = i === 0 ? 3.6 : 2.8
    const sh = i === 0 ? 5.4 : 4.1
    b.group([mx, 0, 0], sailAngle, () => {
      b.extrude('cloth', sailShape(sw, sh), 0.04, {
        position: [-0.35, 1.7, 0.12],
        tint: sailTint,
      })
      const battens = Math.floor(sh / 0.85)
      for (let k = 1; k <= battens; k++) {
        const by = 1.7 + (k * sh) / (battens + 1)
        b.box('wood', [sw * 0.98, 0.05, 0.07], [-0.32, by, 0.14], { tint: '#5d4533' })
      }
    })
  })
}
