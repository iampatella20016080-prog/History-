import { IcosahedronGeometry, SphereGeometry } from 'three'
import { STREET } from '../config.js'
import { createCurvedSlab } from './PartBuilder.js'
import { MATERIAL_TILE } from '../rendering/materials.js'
import { createRng, pick } from '../utils/random.js'
import { buildArcadeBuilding } from './arcade.js'
import { conditionGrime, conditionTint } from './condition.js'
import { signBoard } from './facade.js'
import { buildJiangShanLou } from './jiangShanLou.js'
import { bench, foodStall, pottedPlant, stool, teaChest } from './props.js'
import { ridgeShape } from './shapes.js'
import { buildTree } from './environment.js'

/**
 * 特殊建築：江山樓（酒樓）、新芳春茶行（洋樓茶行）、慈聖宮（廟埕與榕樹下的小吃攤）。
 * 皆為歷史情境的概念重建，並非精確復原。
 */

/* ═══════════ 江山樓：四層紅磚酒樓（歷史情境重建，見 jiangShanLou.js） ═══════════ */
export function buildGrandRestaurant(b, cfg) {
  return buildJiangShanLou(b, cfg)
}

/* ═══════════ 新芳春茶行：閩南式結合仿洋式的三層洋樓 ═══════════ */
export function buildTeaMansion(b, cfg) {
  const result = buildArcadeBuilding(b, {
    ...cfg,
    archetype: 'baroque',
    floors: 3,
    groundHeight: 3.8,
    upperHeight: 3.2,
    wallMat: 'brick',
    wallTint: '#ffffff',
    trimTint: '#f1e8d6',
    columnMat: 'brick',
    shutterTint: '#4f6f69',
    windowStyles: ['arch', 'rect'],
    balconyFloors: [1],
    parapet: 'arch',
    parapetHeight: 1.9,
    sign: { ...cfg.sign, placement: 'parapet' },
    storefront: 'open',
    goods: 'tea',
  })
  // 店前茶箱與焙茶竹簍
  const walkD = STREET.walkwayDepth
  teaChest(b, [cfg.width / 2 - 1.2, STREET.walkwayHeight, walkD * 0.45], { rotationY: 0.1 })
  return result
}

/* ═══════════ 慈聖宮：廟埕、榕樹與小吃攤 ═══════════ */
/** 廟埕的共用桌椅（廟埕本地座標的中心；桌子與前後的凳子） */
const SHARED_TABLES = [
  [1.2, -2.6],
  [2.4, -1.0],
]

export function buildTemple(b, cfg) {
  const rng = createRng(cfg.seed ?? 19)
  const condition = cfg.condition ?? 'mature'
  const tint = (hex) => conditionTint(hex, condition)
  const w = cfg.width
  const courtD = 6.2
  const hallD = 8
  const hallW = w - 1.4
  const walkD = STREET.walkwayDepth
  const baseH = 0.45

  // 廟埕鋪面
  b.box('stone', [w, 0.06, courtD + walkD], [0, 0.03, (walkD - courtD) / 2], { tint: condition === 'restored' ? '#e2dccf' : '#d2cab8' })
  // 兩側矮牆
  for (const side of [-1, 1]) {
    b.box('brick', [0.3, 1.1, courtD], [side * (w / 2 - 0.15), 0.55, -courtD / 2], { tint: tint('#ffffff'), grime: conditionGrime(0.2, condition) })
    b.box('stucco', [0.36, 0.08, courtD], [side * (w / 2 - 0.15), 1.14, -courtD / 2], { tint: tint('#efe6d4') })
  }

  b.group([0, 0, -courtD], 0, () => {
    // 台基與石階
    b.box('stone', [hallW + 0.6, baseH, hallD + 0.4], [0, baseH / 2, -hallD / 2 + 0.2], { tint: '#cfc6b3', grime: 0.2 })
    for (let i = 0; i < 3; i++) {
      b.box('stone', [3.2, baseH / 3, 0.35], [0, (baseH / 3) * (i + 0.5), 0.55 - i * 0.3], { tint: '#d8d0bf' })
    }
    // 步口紅柱
    const colZ = -0.55
    for (const x of [-hallW / 2 + 0.5, -1.7, 1.7, hallW / 2 - 0.5]) {
      b.cylinder('plain', 0.17, 0.19, 3.6, 12, [x, baseH + 1.8, colZ], { tint: tint('#a8382c') })
      b.cylinder('stone', 0.26, 0.28, 0.32, 10, [x, baseH + 0.16, colZ], { tint: '#cfc6b3' })
    }
    // 正面牆與門
    const wallZ = -1.7
    b.box('brick', [hallW, 3.9, 0.35], [0, baseH + 1.95, wallZ], { tint: tint('#ffffff'), grime: conditionGrime(0.18, condition) })
    b.box('plain', [2.0, 2.9, 0.08], [0, baseH + 1.45, wallZ + 0.2], { tint: tint('#9e3328') })
    b.box('plain', [0.04, 2.9, 0.1], [0, baseH + 1.45, wallZ + 0.22], { tint: '#3a1d17' })
    for (let row = 0; row < 4; row++) {
      for (const dx of [-0.6, -0.3, 0.3, 0.6]) {
        b.add('plain', new SphereGeometry(0.035, 6, 4), { position: [dx, baseH + 0.6 + row * 0.62, wallZ + 0.25], tint: '#d6ae52' })
      }
    }
    for (const side of [-1, 1]) {
      b.box('plain', [1.1, 2.4, 0.08], [side * 2.6, baseH + 1.2, wallZ + 0.2], { tint: tint('#9e3328') })
      b.box('stone', [0.9, 0.9, 0.1], [side * 2.6, baseH + 3.0, wallZ + 0.2], { tint: '#cbc2ae' })
      for (let k = -2; k <= 2; k++) b.box('stone', [0.06, 0.8, 0.12], [side * 2.6 + k * 0.16, baseH + 3.0, wallZ + 0.24], { tint: '#9c937f' })
    }
    signBoard(b, { text: cfg.sign?.text ?? '慈聖宮', style: 'gold', y: baseH + 3.45, z: wallZ + 0.2, width: 1.9, height: 0.62, frameTint: '#3a1d17' })
    // 步口屋簷
    b.add('roof', createCurvedSlab(hallW + 1.0, 0.14, 2.2, 0.35, MATERIAL_TILE.roof, 10), {
      position: [0, baseH + 4.05, -0.5],
      rotation: [0.42, 0, 0],
      tint: tint('#f5e3d8'),
    })
    // 主殿屋頂（燕尾脊）
    const roofY = baseH + 4.6
    b.box('brick', [hallW, 1.2, hallD - 1.6], [0, roofY - 0.2, -hallD / 2 - 0.9], { tint: tint('#ffffff') })
    for (const sz of [1, -1]) {
      b.add('roof', createCurvedSlab(hallW + 1.4, 0.16, 4.8, 0.55, MATERIAL_TILE.roof, 12), {
        position: [0, roofY + 1.15, -hallD / 2 - 0.9 + sz * 1.95],
        rotation: [sz * 0.5, 0, 0],
        tint: tint(sz > 0 ? '#f6e4d8' : '#e8d6cb'),
      })
    }
    b.extrude('roof', ridgeShape(hallW - 0.6, 'swallowtail'), 0.42, {
      position: [0, roofY + 2.05, -hallD / 2 - 0.9 - 0.21],
      scale: [1, 1.25, 1],
      tint: tint('#e7d2c4'),
    })
    // 脊上剪黏：雙龍搶珠的意象
    b.add('plain', new SphereGeometry(0.28, 12, 10), { position: [0, roofY + 2.75, -hallD / 2 - 0.9], tint: '#e0b545' })
    for (const side of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const t = k / 5
        b.add('plain', new IcosahedronGeometry(0.16 - t * 0.05, 0), {
          position: [side * (0.6 + t * 2.4), roofY + 2.62 + Math.sin(t * Math.PI * 2) * 0.18, -hallD / 2 - 0.9],
          tint: k % 2 ? '#4f8f7c' : '#d9b24c',
        })
      }
    }
    // 廟前燈籠
    for (const x of [-hallW / 2 + 1.2, -0.9, 0.9, hallW / 2 - 1.2]) {
      b.addLantern(x, baseH + 3.15, colZ + 0.1, { scale: 1.05 })
    }
    b.addPool(0, 1.2, 4.2, '#ffad66', 0.08)
  })

  // 天公爐
  const burnerZ = -courtD + 1.7
  b.cylinder('plain', 0.45, 0.35, 0.55, 12, [0, 0.75, burnerZ], { tint: '#6b5a3c' })
  b.cylinder('plain', 0.5, 0.5, 0.06, 12, [0, 1.04, burnerZ], { tint: '#7e6b48' })
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    b.box('plain', [0.1, 0.5, 0.1], [Math.cos(a) * 0.3, 0.25, burnerZ + Math.sin(a) * 0.3], { tint: '#5a4a30' })
  }
  b.addSteam(0, 1.15, burnerZ, 0.6)
  // 戰後的廟埕後段有觀賞鏡頭（cfg.courtCamera）：天公爐也是遮擋方塊，聚焦兩側的攤位時鏡頭不會躲在爐子後面
  if (cfg.courtCamera) b.addBlocker(-0.5, 0.5, 0, 1.1, burnerZ - 0.5, burnerZ + 0.5)

  // 兩棵大榕樹與環樹石座
  const treeZ = -2.4
  for (const side of [-1, 1]) {
    const tx = side * (w / 2 - 2.4)
    // 戰後的魷魚羹攤與豆花攤在西側榕樹下（cfg.clearing）、米苔目攤與糕粿攤在東側榕樹下（cfg.eastClearing）：
    // 那一棵的氣根與低垂的樹冠讓出攤位的空間（可以是一個或多個範圍）
    const clearing = (side > 0 ? cfg.clearing : cfg.eastClearing) ?? null
    buildTree(b, [tx, 0, treeZ], { scale: 0.9, seed: 300 + side, banyan: true, clearing })
    if (cfg.stalls) {
      // 東側的板凳在米苔目攤的位置：有米苔目攤的年代移到榕樹靠矮牆的那一側
      const benchX = side < 0 && cfg.eastClearing ? tx + side * 1.55 : tx + side * -1.6
      bench(b, [benchX, 0.06, treeZ + 1.3], { rotationY: Math.PI / 2, length: 1.4 })
    }
  }

  // 戰後到現在：榕樹下的小吃攤
  if (cfg.stalls) {
    const canopies = condition === 'restored' ? ['#e9e4d6', '#d8e0d4', '#efe2cc'] : ['#d9cdb4', '#c9b08a', '#d6c6a8', '#b9c3b0']
    // 兩側榕樹後方的一般小吃攤：有豆花攤與糕粿攤的年代（cfg.sideStalls 為 false）由這兩攤取代（亂數的使用順序不變）
    const sideCanopies = [pick(rng, canopies), pick(rng, canopies)]
    if (cfg.sideStalls !== false) {
      foodStall(b, [-w / 2 + 2.2, 0.06, -4.3], { rotationY: Math.PI / 2 - 0.08, seed: 41, canopy: sideCanopies[0] })
      foodStall(b, [w / 2 - 2.2, 0.06, -4.4], { rotationY: -Math.PI / 2 + 0.08, seed: 42, canopy: sideCanopies[1] })
    }
    // 東側前緣的一般小吃攤：有米苔目攤的年代（cfg.frontStall 為 false）由米苔目攤取代（亂數的使用順序不變）
    const frontCanopy = pick(rng, canopies)
    if (cfg.frontStall !== false) foodStall(b, [-1.8, 0.06, -0.4], { rotationY: Math.PI, seed: 43, canopy: frontCanopy })
    // 共用桌椅（戰後由 cfg.sharedTables 集中到中央通道西側的用餐區）
    for (const [x, z] of cfg.sharedTables ?? SHARED_TABLES) {
      b.box('wood', [0.9, 0.05, 0.6], [x, 0.78, z], { tint: '#9a7656' })
      for (const sx of [-1, 1]) b.box('wood', [0.05, 0.75, 0.5], [x + sx * 0.38, 0.4, z], { tint: '#6c4c34' })
      for (const sz of [-1, 1]) stool(b, [x, 0.06, z + sz * 0.6], { tint: pick(rng, ['#c96a4a', '#5f8fa3', '#e0b04c']) })
    }
  } else {
    for (const side of [-1, 1]) pottedPlant(b, [side * 2.4, 0.06, -courtD + 0.9], { seed: 60 + side, size: 1.1 })
  }

  b.addBlocker(-hallW / 2 - 0.4, hallW / 2 + 0.4, 0, 8, -courtD - hallD - 0.4, -courtD + 0.2)
  const result = { courtDepth: courtD, treeZ, stalls: !!cfg.stalls }
  // 戰後的廟埕後段（豆花攤、糕粿攤、用餐區與天公爐一帶，cfg.courtCamera）：
  // 榕樹的樹冠與攤位很近，第三人稱鏡頭在這裡停在障礙物前面，不會退進樹冠裡；建築觀賞模式的注視點也可以移進廟埕
  if (cfg.courtCamera) {
    const zone = (minX, maxX, minZ, maxZ) => {
      const p = b.transformPoint(minX, 0, minZ)
      const q = b.transformPoint(maxX, 0, maxZ)
      return { minX: Math.min(p.x, q.x), maxX: Math.max(p.x, q.x), minZ: Math.min(p.z, q.z), maxZ: Math.max(p.z, q.z) }
    }
    result.followAreas = [zone(-w / 2 + 0.3, w / 2 - 0.3, -courtD + 0.3, -0.8)]
    result.viewerRegions = [{ ...zone(-w / 2 + 0.6, w / 2 - 0.6, -courtD + 0.6, 0.5), maxY: 2.0, cameraMaxY: 2.1 }]
  }
  return result
}

/** 廟埕在世界座標中的可行走範圍與障礙物（由 layout 使用） */
export function templeCollision(cfg, transform) {
  const w = cfg.width
  const courtD = 6.2
  const toWorld = (x, z) => transform(x, z)
  const corners = [toWorld(-w / 2 + 0.35, -courtD + 0.3), toWorld(w / 2 - 0.35, STREET.walkwayDepth + 0.5)]
  const walk = {
    minX: Math.min(corners[0].x, corners[1].x),
    maxX: Math.max(corners[0].x, corners[1].x),
    minZ: Math.min(corners[0].z, corners[1].z),
    maxZ: Math.max(corners[0].z, corners[1].z),
  }
  const obstacles = []
  const box = (x0, x1, z0, z1) => {
    const a = toWorld(x0, z0)
    const c = toWorld(x1, z1)
    obstacles.push({ minX: Math.min(a.x, c.x), maxX: Math.max(a.x, c.x), minZ: Math.min(a.z, c.z), maxZ: Math.max(a.z, c.z) })
  }
  box(-0.55, 0.55, -courtD + 1.15, -courtD + 2.25) // 天公爐
  for (const side of [-1, 1]) {
    const tx = side * (w / 2 - 2.4)
    box(tx - 0.95, tx + 0.95, -2.4 - 0.95, -2.4 + 0.95) // 榕樹石座
  }
  if (cfg.stalls) {
    if (cfg.sideStalls !== false) {
      box(-w / 2 + 1.6, -w / 2 + 2.8, -5.4, -3.2)
      box(w / 2 - 2.8, w / 2 - 1.6, -5.5, -3.3)
    }
    if (cfg.frontStall !== false) box(-2.9, -0.7, -1.0, 0.5)
    for (const [x, z] of cfg.sharedTables ?? SHARED_TABLES) box(x - 0.6, x + 0.6, z - 0.7, z + 0.7)
  }
  return { walk, obstacles }
}
