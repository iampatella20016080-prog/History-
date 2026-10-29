import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { ERAS } from '../src/data/eras.js'
import { getSource } from '../src/data/sources.js'
import { PORTERS, QING_WHARF_ERA, QING_WHARF_SOURCE_IDS, TEA_STACKS, WHARF_BOATS, boatBlocker, qingWharfBoxes, stackBox } from '../src/data/qingWharfLayout.js'
import { buildNpcGeometry, NPC_LOOKS } from '../src/game/character/npcBuilder.js'
import { groundAt, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PIER, PLAYER, RIVER } from '../src/game/config.js'
import { followDistance, orbitDirection, pointInBlockers } from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'

/**
 * 清末碼頭（第 9 階段美術）：河岸廣場的茶箱堆、挑夫與棧橋旁的接駁小船，只在「港口商街」出現。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const qing = worlds[QING_WHARF_ERA]
const wharfBoxes = qingWharfBoxes()

const overlaps = (a, b, pad = 0) => a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
const sameBox = (a, b) => ['minX', 'maxX', 'minZ', 'maxZ'].every((k) => Math.abs(a[k] - b[k]) < 1e-9)

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.level = ground.level
  p.y = ground.y
}

function walkTo(world, p, [x, z], step) {
  for (let n = 0; n < 6000; n++) {
    const dx = x - p.x
    const dz = z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
  }
  return Math.hypot(x - p.x, z - p.z)
}

/** 從街口經過廣場、茶箱堆旁走上棧橋到盡頭，再原路回到街上 */
const IN = [
  [-30, 0.4, '街口'],
  [-38.5, 0.6, '廣場'],
  [-43.6, 0.2, '棧橋頭'],
  [-47.0, -0.2, '棧橋中段'],
  [-49.6, 0.75, '棧橋上的茶箱旁'],
  [-51.9, 0.75, '棧橋盡頭'],
]
const OUT = [...IN].reverse().slice(1)

function followRoute(world, p, route, step) {
  for (const [x, z, label] of route) {
    const miss = walkTo(world, p, [x, z], step)
    assert.ok(miss < step + 1e-6, `${label}：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})，差 ${miss.toFixed(2)} m`)
    assert.ok(walkableAt(world, p.x, p.z), `${label}：站的位置不合法`)
  }
}

describe('清末碼頭：只在港口商街', () => {
  test('茶箱堆、挑夫與接駁小船只在港口商街；其他年代的碰撞、遮擋方塊與人物不變', () => {
    assert.ok(qing.npcs.some((npc) => npc.id.startsWith('qing-wharf-')))
    assert.equal(ERAS.find((era) => era.id === QING_WHARF_ERA).streetProps.boats, 'qingWharf')
    for (const era of ERAS.filter((item) => item.id !== QING_WHARF_ERA)) {
      const world = worlds[era.id]
      assert.ok(!world.npcs.some((npc) => npc.id.startsWith('qing-wharf-')), era.id)
      assert.notEqual(era.streetProps.boats, 'qingWharf', era.id)
      for (const box of wharfBoxes) {
        assert.ok(!world.collision.obstacles.some((o) => sameBox(o, box)), `${era.id} 多了碼頭的障礙物`)
        assert.ok(!world.blockers.some((o) => sameBox(o, box)), `${era.id} 多了碼頭的遮擋方塊`)
      }
    }
  })

  test('港口商街的障礙物與遮擋方塊包含所有茶箱堆、挑夫與船', () => {
    for (const box of wharfBoxes) {
      assert.ok(qing.collision.obstacles.some((o) => sameBox(o, box)))
      assert.ok(qing.blockers.some((o) => sameBox(o, box) && o.maxY > 0.3))
    }
    for (const boat of WHARF_BOATS) assert.ok(qing.blockers.some((o) => sameBox(o, boatBlocker(boat))))
  })

  test('共用地段的切分不變（碼頭在河岸廣場，不佔任何地段）', () => {
    const lots = getLotPlan().lots
    for (const box of wharfBoxes) {
      for (const lot of lots) {
        const half = (lot.width ?? 0) / 2
        // 地段在街屋列（|z| ≥ 4.5），碼頭在廣場（x < -34）
        assert.ok(box.maxX < -34 || Math.abs(lot.z) > 4 || lot.x - half > box.maxX, lot.id)
      }
    }
  })

  test('其他年代：河岸廣場與棧橋的可行走範圍和港口商街一樣（碼頭只加障礙物）', () => {
    const plaza = (world) => world.collision.walkable.slice(0, 3)
    const base = JSON.stringify(plaza(qing))
    for (const era of ERAS) assert.equal(JSON.stringify(plaza(worlds[era.id])), base, era.id)
  })
})

describe('清末碼頭：不和既有物件重疊', () => {
  test('茶箱堆與挑夫彼此不重疊，也不和港口商街原有的道具、路燈、樹與繫船柱重疊', () => {
    const others = qing.collision.obstacles.filter((o) => !wharfBoxes.some((box) => sameBox(o, box)))
    for (let i = 0; i < wharfBoxes.length; i++) {
      for (let j = i + 1; j < wharfBoxes.length; j++) assert.ok(!overlaps(wharfBoxes[i], wharfBoxes[j]), `碼頭第 ${i} 與第 ${j} 個方塊重疊`)
      for (const other of others) assert.ok(!overlaps(wharfBoxes[i], other), `碼頭第 ${i} 個方塊與 ${JSON.stringify(other)} 重疊`)
    }
  })

  test('不和任何建築（包含寶順洋行）重疊：都在河岸廣場上', () => {
    for (const box of wharfBoxes) {
      assert.ok(box.minX >= -44 && box.maxX <= -34, '在廣場範圍內')
      for (const building of qing.buildings) {
        for (const part of building.parts ?? []) assert.ok(!overlaps(box, part), building.id)
      }
    }
    const dodd = qing.buildings.find((item) => item.storeId === 'dodd-tea-house')
    assert.ok(dodd)
  })

  test('接駁小船在棧橋兩側的水面上，不壓到棧橋；戎克船停在河道中', () => {
    for (const boat of WHARF_BOATS) {
      const box = boatBlocker(boat)
      assert.ok(box.maxX < RIVER.edgeX, '在河岸外')
      assert.ok(box.minZ > PIER.halfWidth || box.maxZ < -PIER.halfWidth, '不壓到棧橋')
    }
    const junk = WHARF_BOATS.find((boat) => boat.type === 'junk')
    assert.ok(junk.position[0] < PIER.minX - 5, '戎克船不靠岸')
  })
})

describe('清末碼頭：人物進出', () => {
  for (const step of [0.05, 0.15, 0.4]) {
    test(`從街上走到棧橋盡頭，再走回街上（每步 ${step} m）`, () => {
      const p = { x: IN[0][0], z: IN[0][1], level: 0, y: 0 }
      followRoute(qing, p, IN.slice(1), step)
      followRoute(qing, p, OUT, step)
      assert.equal(p.y, 0)
    })
  }

  test('連續進出 5 次：每次都回到同一個地方', () => {
    const p = { x: IN[0][0], z: IN[0][1], level: 0, y: 0 }
    for (let i = 0; i < 5; i++) {
      followRoute(qing, p, IN.slice(1), 0.12)
      followRoute(qing, p, OUT, 0.12)
      assert.ok(Math.hypot(p.x - IN[0][0], p.z - IN[0][1]) < 0.15, `第 ${i + 1} 次`)
    }
  })

  test('走不進茶箱堆、挑夫、河裡或船上', () => {
    for (const stack of TEA_STACKS) assert.ok(!walkableAt(qing, ...stack.center), stack.id)
    for (const porter of PORTERS) assert.ok(!walkableAt(qing, ...porter.position), porter.id)
    for (const boat of WHARF_BOATS) assert.ok(!walkableAt(qing, boat.position[0], boat.position[2]), boat.type)
    assert.ok(!walkableAt(qing, -48, 4))
    assert.ok(!walkableAt(qing, -46, -2.4))
  })

  test('往船與河裡直走：停在棧橋邊，不會掉進水裡', () => {
    for (const step of [0.05, 0.2, 0.5]) {
      for (const z of [4, -4]) {
        const p = { x: -49.5, z: 0, level: 0, y: 0 }
        walkTo(qing, p, [-49.5, z], step)
        assert.ok(Math.abs(p.z) <= PIER.halfWidth - PLAYER.radius + 1e-6, `${step} ${z}: z ${p.z}`)
      }
    }
  })

  test('棧橋頭到廣場的通道至少兩個角色寬', () => {
    for (const box of wharfBoxes) assert.ok(box.minZ > PIER.halfWidth + 0.1 || box.maxZ < -PIER.halfWidth - 0.1, '不擋住棧橋頭')
    for (let z = -PIER.halfWidth + PLAYER.radius; z <= PIER.halfWidth - PLAYER.radius; z += 0.2) {
      for (const x of [-44.5, -43.6, -42.6]) assert.ok(walkableAt(qing, x, z), `(${x}, ${z.toFixed(2)})`)
    }
  })
})

describe('清末碼頭：鏡頭', () => {
  test('在茶箱堆與挑夫附近各個位置與方向，第三人稱鏡頭都不停在遮擋方塊裡（不穿過茶箱）', () => {
    const { blockers } = qing
    for (let x = -44; x <= -38; x += 0.5) {
      for (let z = -5.5; z <= 5.5; z += 0.5) {
        if (!walkableAt(qing, x, z)) continue
        const p = { x, y: CAMERA.targetHeight, z }
        for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 8) {
          const direction = orbitDirection(yaw, CAMERA.pitch)
          const d = followDistance(p, direction, CAMERA.distance, 1.3, blockers)
          const camera = { x: p.x + direction.x * d, y: p.y + direction.y * d, z: p.z + direction.z * d }
          assert.equal(pointInBlockers(camera, blockers), false, `(${x}, ${z}) yaw ${yaw.toFixed(2)}`)
        }
      }
    }
  })

  test('茶箱堆擋住鏡頭的視線：從堆的另一邊看過來會被拉近', () => {
    const stack = stackBox(TEA_STACKS[0])
    const target = { x: (stack.minX + stack.maxX) / 2, y: 0.8, z: stack.minZ - 0.6 }
    const d = followDistance(target, { x: 0, y: 0, z: 1 }, CAMERA.distance, 0.2, qing.blockers, true)
    assert.ok(d < stack.maxZ - target.z, `距離 ${d}`)
  })
})

describe('清末碼頭：效能', () => {
  test('街景不增加新的材質：主要批次的材質種類不變，精緻模式最多多一個批次', () => {
    const banquet = worlds.banquet
    const qingMaterials = new Set(qing.batches.map((item) => item.material))
    // 碼頭用的 wood、paper、bamboo 本來就在港口商街的批次裡
    for (const material of ['wood', 'paper', 'bamboo']) assert.ok(qingMaterials.has(material))
    assert.ok(qing.batches.length <= banquet.batches.length + 2, `${qing.batches.length}`)
    assert.ok(qing.detailBatches.length <= 4)
  })

  test('挑夫只有 3 個（每人 3 個網格），外觀都是港口商街的', () => {
    const porters = qing.npcs.filter((npc) => npc.id.startsWith('qing-wharf-'))
    assert.equal(porters.length, 3)
    for (const npc of porters) {
      assert.equal(NPC_LOOKS[npc.look].era, QING_WHARF_ERA)
      const parts = buildNpcGeometry(npc.look, npc.pose)
      assert.ok(parts.body && parts.head && parts.forearm)
    }
  })

  test('流暢模式不畫北側的接駁小船；船的總數最多比原本多一艘', () => {
    const river = readFileSync(new URL('../src/game/components/River.jsx', import.meta.url), 'utf8')
    assert.match(river, /detailOnly/)
    assert.ok(WHARF_BOATS.some((boat) => boat.detailOnly))
    // 原本 4 艘：碼頭 3 艘 ＋ 遠處 2 艘
    assert.match(river, /BOATS\.junks\.slice\(1, 3\)/)
  })
})

describe('清末碼頭：出處', () => {
  test('查證來源都在 sources.js，有網址', () => {
    for (const id of QING_WHARF_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https?:\/\//, id)
    }
  })

  test('查證紀錄列出每個來源，並標示待核與歷史情境重建', () => {
    const doc = readFileSync(new URL('../docs/research/qing-wharf.md', import.meta.url), 'utf8')
    for (const id of QING_WHARF_SOURCE_IDS) assert.ok(doc.includes(id), id)
    assert.match(doc, /待核/)
    assert.match(doc, /歷史情境重建/)
    assert.match(doc, /查無/)
  })

  test('廣場上有「歷史情境重建」說明牌，只在港口商街', () => {
    for (const era of ERAS) {
      const found = createEraLayout(era).props.some((prop) => prop.type === 'placard' && /清末碼頭｜歷史情境重建/.test(prop.text))
      assert.equal(found, era.id === QING_WHARF_ERA, era.id)
    }
  })
})
