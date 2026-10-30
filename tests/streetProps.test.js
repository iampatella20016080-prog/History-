import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { ERAS } from '../src/data/eras.js'
import { getSource } from '../src/data/sources.js'
import { STREET_PROPS_SOURCE_IDS, STREET_SCENES, addedSceneProps, figurePlacement, sceneBox, sceneNpcs, scenesForEra } from '../src/data/streetPropsLayout.js'
import { buildNpcGeometry, NPC_LOOKS } from '../src/game/character/npcBuilder.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER, STREET } from '../src/game/config.js'
import { followDistance, orbitDirection, pointInBlockers } from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { inRiceAndShineLot } from './helpers.js'

/**
 * 各年代的情境人物與道具（第 9 階段美術）：人力車夫、三輪車夫、牽腳踏車的人與攤車後的小販。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const overlaps = (a, b, pad = 0) => a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
const sameBox = (a, b) => ['minX', 'maxX', 'minZ', 'maxZ'].every((k) => Math.abs(a[k] - b[k]) < 1e-9)
const inside = (inner, outer) => inner.minX >= outer.minX - 1e-9 && inner.maxX <= outer.maxX + 1e-9 && inner.minZ >= outer.minZ - 1e-9 && inner.maxZ <= outer.maxZ + 1e-9

function walkableAt(world, x, z) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}

function walkTo(world, p, [x, z], step) {
  for (let n = 0; n < 8000; n++) {
    const dx = x - p.x
    const dz = z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    p.x += (dx / d) * step
    p.z += (dz / d) * step
    resolvePlayerPosition(p, PLAYER.radius, world.collision)
  }
  return Math.hypot(x - p.x, z - p.z)
}

/** 情境以外的障礙物（情境依附的原有道具的範圍除外） */
function otherObstacles(eraId) {
  const world = worlds[eraId]
  const own = scenesForEra(eraId).map(sceneBox)
  return world.collision.obstacles.filter((o) => !own.some((box) => sameBox(o, box)) && !own.some((box) => inside(o, box)))
}

describe('情境人物與道具：只在指定年代', () => {
  test('每個年代至多四個情境，港口商街沒有（碼頭已有挑夫）', () => {
    assert.equal(scenesForEra('qing-port').length, 0)
    for (const era of ERAS) assert.ok(scenesForEra(era.id).length <= 4, era.id)
    for (const id of ['banquet', 'modern', 'postwar', 'revival']) assert.ok(scenesForEra(id).length > 0, id)
  })

  test('人物只出現在自己的年代，外觀也是那個年代的', () => {
    for (const era of ERAS) {
      const npcs = worlds[era.id].npcs.filter((npc) => npc.id.startsWith('street-'))
      assert.equal(npcs.length, scenesForEra(era.id).reduce((n, s) => n + s.figures.length, 0), era.id)
      for (const npc of npcs) assert.equal(NPC_LOOKS[npc.look].era, era.id, npc.id)
    }
  })

  test('依附的原有道具確實在那個年代的街道上；新加的道具只在那個年代', () => {
    for (const era of ERAS) {
      const props = createEraLayout(era).props
      for (const scene of scenesForEra(era.id)) {
        const { type, position } = scene.anchor
        assert.ok(props.some((p) => p.type === type && p.position.every((v, i) => Math.abs(v - position[i]) < 1e-9)), scene.id)
      }
      for (const other of ERAS.filter((e) => e.id !== era.id)) {
        for (const prop of addedSceneProps(other.id)) assert.ok(!props.includes(prop) && !props.some((p) => p.type === prop.type && p.position === prop.position), `${era.id} 多了 ${other.id} 的道具`)
      }
    }
    // 三輪車只在庶民生活
    for (const era of ERAS) assert.equal(createEraLayout(era).props.some((p) => p.type === 'pedicab'), era.id === 'postwar', era.id)
  })

  test('情境範圍是碰撞障礙物與鏡頭遮擋方塊，而且只在自己的年代', () => {
    for (const scene of STREET_SCENES) {
      const box = sceneBox(scene)
      for (const era of ERAS) {
        const world = worlds[era.id]
        const has = world.collision.obstacles.some((o) => sameBox(o, box)) && world.blockers.some((o) => sameBox(o, box) && o.maxY > 1.5)
        assert.equal(has, era.id === scene.era, `${scene.id} 在 ${era.id}`)
      }
    }
  })

  test('共用地段的切分不變（情境都在街道或廣場上，不在任何地段裡）', () => {
    for (const scene of STREET_SCENES) {
      const box = sceneBox(scene)
      assert.ok(box.maxZ <= STREET.facadeZ - STREET.walkwayDepth + 1e-9 && box.minZ >= -(STREET.facadeZ - STREET.walkwayDepth) - 1e-9 || box.maxX <= -34, scene.id)
    }
    assert.ok(getLotPlan().lots.length > 0)
  })
})

describe('情境人物與道具：不重疊、不擋路', () => {
  test('不和其他道具、路燈、樹、攤位、碼頭或店家的障礙物重疊', () => {
    for (const era of ERAS) {
      const own = scenesForEra(era.id).map(sceneBox)
      const others = otherObstacles(era.id)
      own.forEach((box, i) => {
        for (const other of others) assert.ok(!overlaps(box, other, 0.01), `${era.id} ${scenesForEra(era.id)[i].id} 與 ${JSON.stringify(other)} 重疊`)
        own.forEach((b2, j) => j > i && assert.ok(!overlaps(box, b2), `${era.id} 情境 ${i}、${j} 重疊`))
      })
    }
  })

  test('不和任何建築的遮擋方塊重疊', () => {
    for (const era of ERAS) {
      for (const scene of scenesForEra(era.id)) {
        const box = sceneBox(scene)
        for (const building of worlds[era.id].buildings) {
          for (const part of building.parts ?? []) {
            if (part.minY > 2.5) continue
            assert.ok(!overlaps(box, part, 0.01), `${scene.id} 與 ${building.id}`)
          }
        }
      }
    }
  })

  test('不佔街道中央的石板路；中央通道兩側都留一個角色以上的寬度', () => {
    for (const scene of STREET_SCENES) {
      const box = sceneBox(scene)
      if (box.maxX <= -34) continue
      assert.ok(box.minZ >= STREET.laneHalfWidth || box.maxZ <= -STREET.laneHalfWidth, scene.id)
    }
  })

  test('不擋店家入口與互動熱點：入口前到街心的通道沒有情境', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const scene of scenesForEra(era.id)) {
        const box = sceneBox(scene)
        for (const [id, store] of Object.entries(world.stores)) {
          const prompt = store.anchors?.prompt
          if (!prompt) continue
          const [px, , pz] = prompt
          const corridor = { minX: px - 0.7, maxX: px + 0.7, minZ: Math.min(0, pz), maxZ: Math.max(0, pz) }
          assert.ok(!overlaps(box, corridor), `${scene.id} 擋住 ${id}`)
          assert.ok(Math.hypot(Math.max(box.minX - px, 0, px - box.maxX), Math.max(box.minZ - pz, 0, pz - box.maxZ)) > 0.6, `${scene.id} 太靠近 ${id} 的熱點`)
        }
      }
    }
  })

  test('情境旁邊走得到：道具四周至少有一側是可以站的地方', () => {
    for (const era of ERAS) {
      for (const scene of scenesForEra(era.id)) {
        const box = sceneBox(scene)
        const cx = (box.minX + box.maxX) / 2
        const towardCenter = box.minZ > 0 ? box.minZ - 0.5 : box.maxZ + 0.5
        assert.ok(walkableAt(worlds[era.id], cx, towardCenter), `${scene.id}`)
        assert.ok(!walkableAt(worlds[era.id], ...figurePlacement(scene.anchor, scene.figures[0]).position.filter((_, i) => i !== 1)), `${scene.id} 站得進人物裡`)
      }
    }
  })
})

describe('情境人物與道具：人物繞過去', () => {
  for (const step of [0.05, 0.15, 0.4]) {
    test(`沿著中央石板路的兩側邊緣走過整條街，再走回來（每步 ${step} m）`, () => {
      for (const era of ERAS) {
        const world = worlds[era.id]
        for (const side of [-1, 1]) {
          const z = side * 0.3
          const p = { x: -30, z }
          for (const target of [[30, z], [-30, z]]) {
            walkTo(world, p, target, step)
            assert.ok(Math.abs(p.x - target[0]) < 0.6, `${era.id} 側 ${side}：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
          }
        }
      }
    })
  }

  test('連續五次繞過每個情境：每次都回到原點', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const scene of scenesForEra(era.id)) {
        const box = sceneBox(scene)
        const z = box.minZ > 0 ? box.minZ - 0.6 : box.maxZ + 0.6
        const start = [box.minX - 1.2, z]
        if (!walkableAt(world, ...start) || inRiceAndShineLot({ minX: start[0] - 0.3, maxX: start[0] + 0.3, minZ: start[1] - 0.3, maxZ: start[1] + 0.3 })) continue
        const p = { x: start[0], z: start[1] }
        for (let i = 0; i < 5; i++) {
          walkTo(world, p, [box.maxX + 1.2, z], 0.12)
          walkTo(world, p, start, 0.12)
          assert.ok(Math.hypot(p.x - start[0], p.z - start[1]) < 0.15, `${scene.id} 第 ${i + 1} 次`)
        }
      }
    }
  })
})

describe('情境人物與道具：鏡頭', () => {
  test('情境附近各個位置與方向，第三人稱鏡頭都不停在遮擋方塊裡', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const scene of scenesForEra(era.id)) {
        const box = sceneBox(scene)
        for (let x = box.minX - 1.5; x <= box.maxX + 1.5; x += 0.5) {
          for (let z = box.minZ - 1.5; z <= box.maxZ + 1.5; z += 0.5) {
            if (!walkableAt(world, x, z)) continue
            const p = { x, y: CAMERA.targetHeight, z }
            for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 4) {
              const direction = orbitDirection(yaw, CAMERA.pitch)
              const d = followDistance(p, direction, CAMERA.distance, 1.3, world.blockers)
              const camera = { x: p.x + direction.x * d, y: p.y + direction.y * d, z: p.z + direction.z * d }
              assert.equal(pointInBlockers(camera, world.blockers), false, `${scene.id} (${x.toFixed(1)}, ${z.toFixed(1)}) yaw ${yaw.toFixed(2)}`)
            }
          }
        }
      }
    }
  })
})

describe('情境人物與道具：效能', () => {
  test('不增加新材質：主要批次與精緻批次的材質種類和沒有情境時一樣', () => {
    for (const era of ERAS) {
      const materials = new Set(worlds[era.id].batches.map((b) => b.material))
      // 三輪車與人力車只用既有的 plain、wood、cloth
      for (const m of ['plain', 'wood', 'cloth']) if (scenesForEra(era.id).some((s) => s.anchor.added)) assert.ok(materials.has(m), `${era.id} ${m}`)
    }
    // 加入情境前（第 9 階段灰泥牆、碼頭之後）各年代的批次數：依材質合併，每種材質一批，情境不增加批次
    const before = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) {
      assert.ok(worlds[era.id].batches.length <= before[era.id], `${era.id} ${worlds[era.id].batches.length}`)
      assert.equal(worlds[era.id].batches.length, new Set(worlds[era.id].batches.map((b) => b.material)).size, era.id)
    }
  })

  test('每個年代最多三個一定會畫的人物（每人三個網格）；其餘低畫質不畫', () => {
    for (const era of ERAS) {
      const npcs = sceneNpcs(era.id)
      assert.ok(npcs.filter((npc) => !npc.detailOnly).length <= 3, era.id)
      for (const npc of npcs) {
        const parts = buildNpcGeometry(npc.look, npc.pose, { seatY: npc.seatY })
        assert.ok(parts.body && parts.head && parts.forearm, npc.id)
      }
    }
    const layer = readFileSync(new URL('../src/game/components/NpcLayer.jsx', import.meta.url), 'utf8')
    assert.match(layer, /detailOnly/)
  })
})

describe('情境人物與道具：出處', () => {
  test('查證來源都在 sources.js，有網址', () => {
    for (const id of STREET_PROPS_SOURCE_IDS) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https?:\/\//, id)
    }
  })

  test('查證紀錄列出每個來源，並標示待核、查無與歷史情境重建', () => {
    const doc = readFileSync(new URL('../docs/research/era-street-props.md', import.meta.url), 'utf8')
    for (const id of STREET_PROPS_SOURCE_IDS) assert.ok(doc.includes(id), id)
    for (const word of ['待核', '查無', '歷史情境重建']) assert.ok(doc.includes(word), word)
  })
})
