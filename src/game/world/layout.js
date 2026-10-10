import { PIER, PLAZA, STREET } from '../config.js'
import { createRng, pick, range } from '../utils/random.js'
import { getStreetSide } from './placement.js'

/**
 * 第一時期（1853–1895）的街區配置。
 *
 * 依店家資料自動在街屋列中預留店面位置，其餘以隨機（但每次相同）的背景街屋補滿，
 * 因此新增店家時只要在 shops.js 填入座標即可，不必手動調整街景。
 *
 * 招牌只使用「茶、米、布」等一般行業字，避免虛構具名的歷史商號。
 */
const SIGN_WORDS = ['茶', '米', '布', '油', '糖', '藥材', '雜貨', '竹器', '海味', '陶器', '香燭', '金紙', '豆', '油紙']
const PLASTER_TINTS = ['#efe3c6', '#e8d6b0', '#e3ddc7', '#d8dcc3', '#ecd8bb', '#e6dfcc', '#dfe1cd']
const ROOF_TINTS = ['#ffffff', '#ece2dc', '#dcd5d0', '#f3e9e1', '#d8d2ce']
const WOOD_TINTS = ['#d6bd9c', '#c9ae8c', '#bfa07c', '#d9c4a5', '#c4a685']
const OPEN_GOODS = ['tea', 'grain', 'jars', 'crates', 'sacks', 'baskets', 'poles', 'baskets', 'tea']

function complement([start, end], reserved) {
  const sorted = [...reserved].sort((a, b) => a[0] - b[0])
  const result = []
  let cursor = start
  for (const [a, b] of sorted) {
    if (a > cursor + 0.01) result.push([cursor, Math.min(a, end)])
    cursor = Math.max(cursor, b)
  }
  if (cursor < end - 0.01) result.push([cursor, end])
  return result
}

function shuffled(rng, list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function backgroundConfig(rng, width, signDeck) {
  const floors = rng() < 0.4 ? 2 : 1
  const ground = rng() < 0.52 ? 'brick' : 'plaster'
  const upper = floors === 2 ? (rng() < 0.72 ? 'plaster' : 'brick') : ground
  const storefront = pick(rng, ['closed', 'half', 'half', 'open', 'open'])
  const hasSign = rng() < 0.58
  const nextWord = () => signDeck.shift() ?? pick(rng, SIGN_WORDS)
  const sign = hasSign ? { text: nextWord(), style: pick(rng, ['wood', 'lacquer', 'red', 'wood']) } : null
  const hangingSign =
    !hasSign && rng() < 0.5
      ? { text: nextWord(), style: pick(rng, ['wood', 'cloth', 'red']), side: rng() < 0.5 ? 'left' : 'right' }
      : null
  return {
    type: 'shophouse',
    width,
    depth: range(rng, 10, 13),
    floors,
    groundHeight: pick(rng, [3.15, 3.3, 3.45]),
    ground,
    upper,
    plasterTint: pick(rng, PLASTER_TINTS),
    roofTint: pick(rng, ROOF_TINTS),
    woodTint: pick(rng, WOOD_TINTS),
    gable: rng() < 0.5 ? 'horseback' : 'gable',
    ridge: rng() < 0.45 ? 'curved' : 'plain',
    storefront,
    sign,
    hangingSign,
    lanterns: rng() < 0.3,
    couplets: rng() < 0.35,
    shutters: rng() < 0.5,
    goods:
      storefront !== 'closed'
        ? pick(rng, OPEN_GOODS)
        : rng() < 0.45
          ? pick(rng, ['crates', 'sacks', 'poles'])
          : null,
    seed: Math.floor(rng() * 1e6),
  }
}

export function createStreetLayout(shops) {
  const rng = createRng(1853)
  const signDeck = shuffled(rng, [...SIGN_WORDS, ...SIGN_WORDS])
  const buildings = []

  /* ── 主街兩側的連續街屋 ───────────────── */
  const reserved = { north: [], south: [] }
  for (const shop of shops) {
    const side = getStreetSide(shop)
    if (!side) continue
    const half = shop.building.width / 2
    reserved[side].push([shop.position.x - half, shop.position.x + half])
  }

  for (const side of ['north', 'south']) {
    const z = side === 'north' ? -STREET.facadeZ : STREET.facadeZ
    const rotationY = side === 'north' ? 0 : Math.PI
    const intervals = complement([STREET.rowStartX, STREET.rowEndX], reserved[side])
    for (const [x0, x1] of intervals) {
      let x = x0
      while (x1 - x > 0.05) {
        const remaining = x1 - x
        let width
        if (remaining <= 7.0) width = remaining
        else {
          width = pick(rng, [4.2, 4.6, 5.0, 5.4, 5.8, 6.2])
          if (remaining - width < 3.6) width = remaining / 2
        }
        const config = backgroundConfig(rng, width, signDeck)
        if (Math.abs(x - STREET.rowStartX) < 0.01) config.gable = 'horseback' // 面向廣場的山牆
        buildings.push({ id: `${side}-${buildings.length}`, x: x + width / 2, z, rotationY, config })
        x += width
      }
    }
  }

  /* ── 河岸廣場兩側的貨棧 ───────────────── */
  for (const side of [-1, 1]) {
    const z = side * PLAZA.halfDepth
    const rotationY = side < 0 ? 0 : Math.PI
    const widths = [5.4, 4.6]
    let x = PLAZA.minX
    widths.forEach((width, i) => {
      buildings.push({
        id: `plaza-${side}-${i}`,
        x: x + width / 2,
        z,
        rotationY,
        config: {
          type: 'shophouse',
          width,
          depth: 10,
          floors: 2,
          groundHeight: 3.5,
          ground: i === 0 ? 'brick' : 'plaster',
          upper: 'plaster',
          plasterTint: pick(rng, PLASTER_TINTS),
          roofTint: pick(rng, ROOF_TINTS),
          woodTint: pick(rng, WOOD_TINTS),
          gable: 'horseback',
          ridge: 'curved',
          storefront: 'open',
          sign: i === 0 ? { text: '茶', style: 'red' } : null,
          lanterns: i === 1,
          goods: i === 0 ? 'tea' : 'sacks',
          seed: Math.floor(rng() * 1e6),
        },
      })
      x += width
    })
  }

  /* ── 街底橫向建築（收束街景） ─────────── */
  buildings.push({
    id: 'street-end',
    x: STREET.endFacadeX,
    z: 0,
    rotationY: -Math.PI / 2,
    config: {
      type: 'shophouse',
      width: 13,
      depth: 11,
      floors: 2,
      groundHeight: 3.5,
      ground: 'brick',
      upper: 'plaster',
      plasterTint: '#ebdcbc',
      roofTint: '#ffffff',
      woodTint: '#c9ae8c',
      gable: 'horseback',
      ridge: 'curved',
      storefront: 'half',
      windows: 3,
      sign: { text: '雜貨', style: 'lacquer' },
      lanterns: true,
      couplets: true,
      goods: 'crates',
      seed: 4242,
    },
  })

  /* ── 街道上的擺設（含碰撞範圍） ─────────── */
  const props = [
    { type: 'handcart', position: [19.5, 0, 2.05], rotationY: 0.12, load: 'sacks' },
    { type: 'carryingPole', position: [-14.5, 0, -2.05], rotationY: -0.05, content: 'rice' },
    { type: 'goodsPile', position: [-30.6, 0, 2.15], rotationY: 0.2, kind: 'sacks' },
    { type: 'goodsPile', position: [26.5, 0, -2.2], rotationY: -0.15, kind: 'crates' },
    { type: 'goodsPile', position: [8.2, 0, 2.25], rotationY: 0.4, kind: 'mixed' },
    // 河岸廣場：茶箱與貨物（港口貿易）
    { type: 'goodsPile', position: [-41.5, 0, -6.6], rotationY: 0.1, kind: 'tea' },
    { type: 'goodsPile', position: [-39.6, 0, -6.9], rotationY: -0.3, kind: 'tea' },
    { type: 'goodsPile', position: [-37.6, 0, 6.5], rotationY: 0.25, kind: 'crates' },
    { type: 'goodsPile', position: [-42.4, 0, 5.2], rotationY: -0.2, kind: 'sacks' },
    { type: 'handcart', position: [-36.4, 0, -5.9], rotationY: 1.4, load: 'tea' },
    // 碼頭
    { type: 'ropeCoil', position: [-47.5, 0, 1.0] },
    { type: 'goodsPile', position: [-50.6, 0, -0.95], rotationY: -Math.PI / 2, kind: 'tea' },
  ]

  /* ── 可行走區域與障礙物 ─────────────────── */
  const streetHalf = STREET.facadeZ - STREET.walkwayDepth
  const plazaHalf = PLAZA.halfDepth - STREET.walkwayDepth
  const walkable = [
    { minX: PLAZA.minX, maxX: STREET.walkEndX, minZ: -streetHalf, maxZ: streetHalf },
    { minX: PLAZA.minX, maxX: PLAZA.maxX, minZ: -plazaHalf, maxZ: plazaHalf },
    { minX: PIER.minX, maxX: PIER.maxX + 1, minZ: -PIER.halfWidth, maxZ: PIER.halfWidth },
  ]

  const footprint = {
    handcart: [1.3, 0.75],
    carryingPole: [1.05, 0.38],
    goodsPile: [0.85, 0.5],
    ropeCoil: [0.3, 0.3],
  }
  const obstacles = props.map((prop) => {
    const [hx, hz] = footprint[prop.type] ?? [0.5, 0.5]
    const r = prop.rotationY ?? 0
    const c = Math.abs(Math.cos(r))
    const s = Math.abs(Math.sin(r))
    const ex = hx * c + hz * s
    const ez = hx * s + hz * c
    // goodsPile 的原點在第一件貨物，整堆向 +x 延伸
    const shift = prop.type === 'goodsPile' ? 0.3 : 0
    const cx = prop.position[0] + Math.cos(r) * shift
    const cz = prop.position[2] - Math.sin(r) * shift
    return { minX: cx - ex, maxX: cx + ex, minZ: cz - ez, maxZ: cz + ez }
  })

  // 河岸廣場北側的大榕樹（不擋住通往碼頭的路）與街屋後方的樹
  const trees = [
    { position: [-40.6, 0, -3.6], scale: 1.0, collider: true },
    { position: [-28, 0, -24], scale: 1.2 },
    { position: [-8, 0, 23], scale: 1.1 },
    { position: [16, 0, -25], scale: 1.3 },
    { position: [30, 0, 22], scale: 1.0 },
    { position: [-41, 0, -27], scale: 1.1 },
    { position: [-40.5, 0, 28], scale: 1.25 },
    { position: [-41.5, 0, -40], scale: 1.0 },
    { position: [-41, 0, 43], scale: 1.15 },
  ]
  for (const tree of trees) {
    if (!tree.collider) continue
    const [x, , z] = tree.position
    obstacles.push({ minX: x - 0.55, maxX: x + 0.55, minZ: z - 0.55, maxZ: z + 0.55 })
  }

  // 碼頭繫船柱
  const mooringPosts = [
    [-46.2, 1.3],
    [-49.4, -1.3],
    [-52.6, 1.3],
    [-52.6, -1.3],
  ]
  for (const [x, z] of mooringPosts) {
    obstacles.push({ minX: x - 0.18, maxX: x + 0.18, minZ: z - 0.18, maxZ: z + 0.18 })
  }

  return { buildings, props, walkable, obstacles, trees, mooringPosts }
}
