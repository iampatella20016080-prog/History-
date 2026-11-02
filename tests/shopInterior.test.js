import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { createShopInterior, snapToWalls, subtractRect } from '../src/game/builders/shopInterior.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'

/*
 * 共用的街屋室內（builders/shopInterior.js，第 11 階段）：林華泰之後的店家都用它接上室內。
 * 林華泰本身的室內在 tests/linHuaTai.test.js；這裡用一間假的店測共用的部分。
 */

const SHELL = {
  half: 3.0,
  depth: 11,
  wallT: 0.3,
  groundH: 3.3,
  ceiling: 2.95,
  walkD: 1.7,
  room: { minX: -2.65, maxX: 2.65, minZ: -10.4, maxZ: -0.34 },
}

const box = (item) => ({ minX: item.x - item.w / 2, maxX: item.x + item.w / 2, minZ: item.z - item.d / 2, maxZ: item.z + item.d / 2 })
const FURNITURE = {
  crate: {
    build: (b, item) => b.box('wood', [item.w, 0.8, item.d], [item.x, 0.4, item.z]),
    footprint: box,
    height: () => 1.1,
  },
  rug: {
    build: (b, item) => b.box('plain', [item.w, 0.01, item.d], [item.x, 0.005, item.z]),
    footprint: box,
    height: () => 0.2,
  },
}

const VARIANT = {
  door: { minX: -1.2, maxX: 1.2 },
  frontPanels: 'boards',
  partition: { z: -5.0, doorMinX: -1.0, doorMaxX: 1.0 },
  lamps: [],
  items: [
    // 靠右牆（離牆 0.4 公尺，要補到牆裡）、靠隔間牆的箱子，和一塊不擋路的地墊
    { type: 'crate', x: 2.0, z: -2.5, w: 0.5, d: 1.2 },
    { type: 'crate', x: -1.6, z: -5.6, w: 0.8, d: 0.6 },
    { type: 'rug', x: 0, z: -7.5, w: 1.6, d: 1.0, block: false },
  ],
  npcs: [{ id: 'kit-clerk', look: 'lhtSorter', pose: 'stand', x: 1.6, z: -2.5, rotationY: 0, seatY: 0 }],
}

const SITE = { x: 10, z: -4.5 }
const kit = createShopInterior({
  id: 'kit-shop',
  shell: SHELL,
  variantOf: (cfg) => (cfg.variant === 'test' ? VARIANT : null),
  lookOf: () => ({ floor: ['stone', '#aaa'], wall: '#eee', ceiling: 'beams', partition: 'planks', wood: '#a80' }),
  furniture: FURNITURE,
  siteToWorld: (x, z) => ({ x: SITE.x + x, z: SITE.z + z }),
  exterior: () => ({ groundHeight: 3.3, ridgeHeight: 6 }),
})
const transform = (x, z) => ({ x: SITE.x + x, z: SITE.z + z })

const overlaps = (a, b) => a.minX < b.maxX - 1e-9 && b.minX < a.maxX - 1e-9 && a.minZ < b.maxZ - 1e-9 && b.minZ < a.maxZ - 1e-9
const area = (r) => (r.maxX - r.minX) * (r.maxZ - r.minZ)

describe('共用的街屋室內：障礙物', () => {
  test('矩形相減：切出來的幾塊互不重疊、不碰到被減的矩形，面積相加等於相減的結果', () => {
    const r = { minX: 0, maxX: 4, minZ: 0, maxZ: 3 }
    const a = { minX: 1, maxX: 2, minZ: 1, maxZ: 5 }
    const pieces = subtractRect(r, a)
    for (const p of pieces) assert.ok(!overlaps(p, a))
    for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) assert.ok(!overlaps(pieces[i], pieces[j]))
    assert.ok(Math.abs(pieces.reduce((s, p) => s + area(p), 0) - (area(r) - 1 * 2)) < 1e-9)
    assert.deepEqual(subtractRect(r, { minX: 5, maxX: 6, minZ: 0, maxZ: 1 }), [r])
  })

  test('靠牆的障礙物補到牆裡；隔間牆的門口前不補', () => {
    const { room } = SHELL
    const partition = VARIANT.partition
    assert.equal(snapToWalls({ minX: 1.8, maxX: 2.2, minZ: -3, maxZ: -2 }, room, partition).maxX, room.maxX + 0.3)
    assert.equal(snapToWalls({ minX: -2.3, maxX: -1.8, minZ: -3, maxZ: -2 }, room, partition).minX, room.minX - 0.3)
    // 補到隔間牆的中線：前店與店後的擺設不會互相重疊
    assert.equal(snapToWalls({ minX: -2, maxX: -1.4, minZ: -5.9, maxZ: -5.4 }, room, partition).maxZ, partition.z)
    assert.equal(snapToWalls({ minX: -2, maxX: -1.4, minZ: -4.8, maxZ: -4.0 }, room, partition).minZ, partition.z)
    const atDoor = { minX: -0.3, maxX: 0.3, minZ: -5.9, maxZ: -5.4 }
    assert.deepEqual(snapToWalls(atDoor, room, partition), atDoor)
  })

  test('器物與人物的障礙物互不重疊；不擋路的器物沒有障礙物', () => {
    const list = kit.obstacles(VARIANT)
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) assert.ok(!overlaps(list[i], list[j]), `${i}/${j}`)
    assert.ok(!list.some((r) => r.minZ <= -7 && r.maxZ >= -8 && r.minX <= 0 && r.maxX >= 0), '地墊不擋路')
  })
})

describe('共用的街屋室內：碰撞', () => {
  const { walkable, obstacles } = kit.collision({ variant: 'test' }, transform)
  const world = { walkable, obstacles }
  const walkableAt = (x, z) => {
    const p = { x, z }
    resolvePlayerPosition(p, PLAYER.radius, world)
    return Math.hypot(p.x - x, p.z - z) < 1e-6
  }

  test('可以走的範圍都標 inBuilding（換年代時人物移到戶外）', () => {
    assert.ok(walkable.length > 0)
    for (const r of walkable) assert.equal(r.inBuilding, true)
  })

  test('從簷下步道走過店門口、前店、隔間門到店後，再走回來', () => {
    const route = [[0, 1.0], [0, -0.5], [0, -3.5], [0, -5.0], [0, -6.5], [0, -9.5]]
    for (const step of [0.05, 0.12, 0.3]) {
      for (let lap = 0; lap < 2; lap++) {
        for (const points of [route, [...route].reverse()]) {
          const p = transform(points[0][0], points[0][1])
          for (let i = 1; i < points.length; i++) {
            const target = transform(points[i][0], points[i][1])
            for (let n = 0; n < 400 && Math.hypot(target.x - p.x, target.z - p.z) > 1e-6; n++) {
              const dx = target.x - p.x
              const dz = target.z - p.z
              const d = Math.hypot(dx, dz)
              const s = Math.min(step, d)
              p.x += (dx / d) * s
              p.z += (dz / d) * s
              resolvePlayerPosition(p, PLAYER.radius, world)
            }
            assert.ok(Math.hypot(target.x - p.x, target.z - p.z) < 0.02, `步長 ${step}：走到 ${points[i]}`)
          }
        }
      }
    }
  })

  test('牆外、門板與隔間牆（門以外）走不過去', () => {
    const outside = transform(SHELL.half + 0.6, -4)
    assert.ok(!walkableAt(outside.x, outside.z))
    const wallPanel = transform(-2.2, -0.15)
    assert.ok(!walkableAt(wallPanel.x, wallPanel.z))
    const partitionWall = transform(-2.0, VARIANT.partition.z)
    assert.ok(!walkableAt(partitionWall.x, partitionWall.z))
  })

  test('沒有這個年代的版本時，沒有可以走的範圍', () => {
    assert.deepEqual(kit.collision({ variant: 'none' }, transform), { walkable: [], obstacles: [] })
  })
})

describe('共用的街屋室內：外殼、室內範圍與擺設', () => {
  const b = new PartBuilder()
  b.push([SITE.x, 0, SITE.z], 0)
  const result = kit.build(b, { variant: 'test' }, b)
  b.pop()

  test('室內範圍用店家的 id，人物掛在同一個室內、位置換成世界座標', () => {
    assert.equal(result.interiors.length, 1)
    const zone = result.interiors[0]
    assert.equal(zone.id, 'kit-shop')
    assert.ok(zone.minX < SITE.x && zone.maxX > SITE.x && zone.maxZ < SITE.z)
    assert.equal(result.npcs[0].zone, 'kit-shop')
    assert.deepEqual(result.npcs[0].position, [SITE.x + 1.6, 0, SITE.z - 2.5])
  })

  test('擺設的鏡頭遮擋只給鏡頭用（cameraOnly 範圍裡有每一件器物）', () => {
    const [range] = result.cameraOnly
    assert.equal(range.end - range.start, VARIANT.items.length)
  })

  test('室內細部（按需載入）產生擺設；這個年代沒有版本時什麼都不產生', () => {
    const inside = new PartBuilder()
    kit.buildInterior(inside, { variant: 'test' }, inside)
    assert.ok(inside.groups.size > 0)
    const empty = new PartBuilder()
    kit.buildInterior(empty, { variant: 'none' }, empty)
    assert.equal(empty.groups.size, 0)
  })
})
