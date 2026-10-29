import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { STREET } from '../src/game/config.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildArcadeBuilding } from '../src/game/builders/arcade.js'
import { CONTACT_LIFT, contactFalloff, contactShadow } from '../src/game/builders/contactShadow.js'
import { BANYAN_ROOT_CLEARANCE, buildTree } from '../src/game/builders/environment.js'
import { LUMP_IN, LUMP_OUT, lumpyClump } from '../src/game/builders/foliage.js'
import { pottedPlant, stool } from '../src/game/builders/props.js'
import { buildShophouse } from '../src/game/builders/shophouse.js'
import { SILL_GAP, planWeathering } from '../src/game/builders/weathering.js'
import { MATERIAL_TILE } from '../src/game/rendering/materials.js'
import { SURFACE_VARIATION, SURFACE_VARIATION_GLSL, hash12, unitCell, unitState } from '../src/game/rendering/surfaceVariation.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { TEMPLE_STALL } from '../src/data/squidSoupLayout.js'
import { DOUHUA_STALL } from '../src/data/templeSnackLayout.js'

/*
 * 第 9 階段・細部：
 * 1. 榕樹與盆栽的外緣不規則、露出粗枝
 * 2. 大面積地磚與牆面的明暗、色相、補丁與破磚（打破重複感）
 * 3. 灰泥牆的水漬從窗臺下開始往下流
 * 4. 柱腳與家具的接地暗影做進模型（兩種畫質都看得到）
 */

function eachVertex(g, fn) {
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) fn(pos.getX(i), pos.getY(i), pos.getZ(i))
}

function radii(g) {
  const list = []
  eachVertex(g, (x, y, z) => list.push({ r: Math.hypot(x, y, z), x, y, z }))
  return list
}

describe('細部：不規則的葉團與粗枝', () => {
  test('葉團不是球：有凹下去的缺口與凸出的起伏，底部不比原本的球低', () => {
    const g = lumpyClump(1, 7)
    const list = radii(g)
    const rs = list.map((v) => v.r)
    assert.ok(Math.min(...rs) < 1 - LUMP_IN * 0.5, `最深的缺口 ${Math.min(...rs).toFixed(2)}`)
    assert.ok(Math.max(...rs) > 1 + LUMP_OUT * 0.3, `最大的凸出 ${Math.max(...rs).toFixed(2)}`)
    assert.ok(Math.min(...list.map((v) => v.y)) >= -1.0001, '底面不低於原本的球')
    assert.ok(Math.max(...rs) <= 1 + LUMP_OUT + 1e-6)
  })

  test('固定亂數：同一個 seed 形狀相同，不同 seed 形狀不同', () => {
    const a = radii(lumpyClump(1, 3)).map((v) => v.r)
    const b = radii(lumpyClump(1, 3)).map((v) => v.r)
    const c = radii(lumpyClump(1, 4)).map((v) => v.r)
    assert.deepEqual(a, b)
    assert.notDeepEqual(a, c)
  })

  test('外緣的小葉團往 outward 方向伸出，讓輪廓參差', () => {
    const g = lumpyClump(1, 9, { satellites: 2, outward: 0 })
    let farX = -Infinity
    eachVertex(g, (x) => (farX = Math.max(farX, x)))
    assert.ok(farX > 1.15, `往 +x 伸出 ${farX.toFixed(2)}`)
  })

  test('榕樹：有合併成一個網格的粗枝，從樹幹往外伸到下層葉叢的外緣', () => {
    const b = new PartBuilder()
    buildTree(b, [0, 0, 0], { scale: 0.9, seed: 301, banyan: true, groundRadius: 0.95 })
    const limbs = b.groups.get('wood')[1]
    let reach = 0
    eachVertex(limbs, (x, y, z) => {
      const d = Math.hypot(x, z)
      reach = Math.max(reach, d)
      // 離開樹幹之後都在頭頂以上，不擋住人物
      if (d > 0.55) assert.ok(y >= BANYAN_ROOT_CLEARANCE, `(${d.toFixed(2)}, ${y.toFixed(2)})`)
    })
    assert.ok(reach > 2.0, `粗枝伸到 ${reach.toFixed(2)} m`)
    // 外緣參差：每團葉叢到自己中心的距離有明顯的起伏
    for (const g of b.groups.get('plain')) {
      g.computeBoundingBox()
      const c = g.boundingBox.getCenter(g.boundingBox.min.clone())
      const rs = []
      eachVertex(g, (x, y, z) => rs.push(Math.hypot(x - c.x, z - c.z)))
      assert.ok(Math.max(...rs) - Math.min(...rs) > 0.3)
    }
  })

  test('廟口攤位的留空範圍：葉團與粗枝都不伸進攤位上方', () => {
    const clearings = [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing]
    const b = new PartBuilder()
    buildTree(b, [3.6, 0, -2.4], { scale: 0.9, seed: 301, banyan: true, clearing: clearings, groundRadius: 0.95 })
    for (const g of [...b.groups.get('plain'), b.groups.get('wood')[1]]) {
      eachVertex(g, (x, y, z) => {
        for (const c of clearings) {
          if (x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ) assert.ok(y >= c.top, `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`)
        }
      })
    }
  })

  test('盆栽：葉叢不規則，主幹分出細枝；仍只用 plain 與 wood（加上接地暗影）', () => {
    const b = new PartBuilder()
    pottedPlant(b, [0, 0, 0], { seed: 41, size: 1.1 })
    assert.ok(b.groups.get('wood').length >= 3, '主幹加上細枝')
    assert.deepEqual([...b.groups.keys()].sort(), ['contact', 'plain', 'wood'])
  })
})

describe('細部：大面積地磚與牆面的變化', () => {
  test('只設定在既有的材質上，不新增材質', () => {
    for (const key of Object.keys(SURFACE_VARIATION)) assert.ok(key in MATERIAL_TILE, key)
  })

  test('雜湊落在 0–1，GLSL 與 JS 用同一組常數', () => {
    for (let i = 0; i < 200; i++) {
      const h = hash12(i * 1.7 - 40, i * 0.3 + 5)
      assert.ok(h >= 0 && h < 1)
    }
    assert.match(SURFACE_VARIATION_GLSL.common, /0\.1031/)
    assert.match(SURFACE_VARIATION_GLSL.common, /33\.33/)
  })

  test('磚格：錯縫的奇數列偏移半塊；負的座標也算得對', () => {
    const grid = { rows: 16, perRow: 4, bond: true }
    assert.deepEqual(unitCell(0.1, 0.01, grid), [0, 0])
    assert.deepEqual(unitCell(0.1, 1 / 16 + 0.01, grid), [-1, 1])
    assert.deepEqual(unitCell(-0.1, -0.01, grid), [-1, -1])
    assert.deepEqual(unitCell(0.9, 0.01, { rows: 4, perRow: 4, bond: false }), [3, 0])
  })

  test('破磚與換過的磚：比例接近設定，而且同一張貼圖的不同重複位置結果不同（不是每張圖都一樣）', () => {
    const config = SURFACE_VARIATION.pavers
    const { rows, perRow } = config.grid
    let broken = 0
    let swapped = 0
    let total = 0
    let differs = 0
    for (let rep = 0; rep < 40; rep++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < perRow; c++) {
          const state = unitState(c + rep * perRow, r, config)
          const next = unitState(c + (rep + 1) * perRow, r, config)
          if (state !== next) differs++
          if (state === 'broken') broken++
          if (state === 'swapped') swapped++
          total++
        }
      }
    }
    assert.ok(Math.abs(broken / total - config.broken) < 0.012, `破磚 ${(broken / total).toFixed(3)}`)
    assert.ok(Math.abs(swapped / total - config.swapped) < 0.02, `換過 ${(swapped / total).toFixed(3)}`)
    assert.ok(differs > 0)
  })

  test('幅度溫和：明暗與色相都在 10% 左右以內', () => {
    for (const [key, c] of Object.entries(SURFACE_VARIATION)) {
      assert.ok(c.tone <= 0.1 && c.hue <= 0.04, key)
      assert.ok((c.broken ?? 0) + (c.swapped ?? 0) < 0.1, key)
    }
  })
})

describe('細部：水漬從窗臺下開始', () => {
  const wall = { x0: -2, x1: 2, y0: 3.4, y1: 6.6, z: 0 }
  const windows = [
    { kind: 'window', x: -1, y: 5.2, width: 0.9, height: 1.2, z: 0 },
    { kind: 'window', x: 1, y: 5.2, width: 0.9, height: 1.2, z: 0 },
  ]

  test('每道水漬的上緣都貼著某一扇窗的窗臺，寬度不超過窗寬，往下流', () => {
    for (let seed = 1; seed < 40; seed++) {
      const plan = planWeathering({ eraId: 'postwar', condition: 'aged', seed, surfaces: [wall], openings: windows })
      for (const s of plan.stains.filter((item) => item.kind === 'streak')) {
        const o = windows.find((w) => Math.abs(s.sill - (w.y - w.height / 2 - SILL_GAP)) < 1e-9 && Math.abs(s.x - w.x) <= w.width / 2)
        assert.ok(o, '水漬在窗下')
        assert.ok(Math.abs(s.y + s.height / 2 - s.sill) < 1e-9, '上緣在窗臺')
        assert.ok(s.width <= o.width)
        assert.ok(s.y - s.height / 2 >= wall.y0 - 1e-9, '不超出牆面')
        assert.ok(s.sill < wall.y1 - 0.5, '不是從牆頂開始')
        for (const d of s.drips) assert.ok(d.length <= s.height - 0.08 + 1e-9 && Math.abs(d.dx) <= s.width / 2)
      }
    }
  })

  test('沒有窗的牆面（騎樓下的牆柱）沒有水漬', () => {
    for (let seed = 1; seed < 30; seed++) {
      const plan = planWeathering({ eraId: 'postwar', condition: 'aged', seed, surfaces: [{ x0: -0.25, x1: 0.25, y0: 0.4, y1: 3.2, z: 0 }] })
      assert.equal(plan.stains.filter((s) => s.kind === 'streak').length, 0)
    }
  })

  test('街上的一般建築：水漬都從窗臺下開始；庶民生活仍有不少水漬', () => {
    const BUILDERS = { minnan: buildShophouse, baroque: buildArcadeBuilding, deco: buildArcadeBuilding, postwar: buildArcadeBuilding }
    let streaks = 0
    for (const eraId of ['postwar', 'modern']) {
      const layout = createEraLayout(ERAS.find((era) => era.id === eraId))
      for (const building of layout.buildings) {
        const builder = BUILDERS[building.config.archetype ?? 'minnan']
        if (!builder || !building.config.weathering) continue
        const b = new PartBuilder()
        b.weatherLog = []
        builder(b, { ...building.config }, new PartBuilder())
        const plan = b.weatherLog[0]
        for (const s of plan.stains.filter((item) => item.kind === 'streak')) {
          assert.ok(Number.isFinite(s.sill))
          if (eraId === 'postwar') streaks++
        }
      }
    }
    assert.ok(streaks > 20, `庶民生活的水漬 ${streaks}`)
  })
})

describe('細部：接地暗影', () => {
  test('暗影貼圖：中間實心、四周淡出到 0，由內往外遞減', () => {
    assert.equal(contactFalloff(0.5, 0.5), 1)
    assert.equal(contactFalloff(0, 0.5), 0)
    assert.equal(contactFalloff(1, 1), 0)
    let last = 1
    for (let u = 0.5; u <= 1; u += 0.05) {
      const a = contactFalloff(u, 0.5)
      assert.ok(a <= last + 1e-9)
      last = a
    }
  })

  test('薄片貼在地面上方一點點、比物件底面大，跟著家具的旋轉', () => {
    const b = new PartBuilder()
    stool(b, [1, 0.2, 2])
    const [g] = b.groups.get('contact')
    g.computeBoundingBox()
    const box = g.boundingBox
    assert.ok(Math.abs(box.min.y - (0.2 + CONTACT_LIFT)) < 1e-6 && Math.abs(box.max.y - box.min.y) < 1e-6, '水平貼地')
    assert.ok(box.max.x - box.min.x > 0.3, '比凳腳的範圍大')
    const r = new PartBuilder()
    r.group([0, 0, 0], Math.PI / 4, () => contactShadow(r, 0, 0, 0, 1, 0.2, { spread: 0 }))
    const [rg] = r.groups.get('contact')
    rg.computeBoundingBox()
    assert.ok(rg.boundingBox.max.z - rg.boundingBox.min.z > 0.6, '旋轉 45 度後在 z 方向也有長度')
  })

  test('每個年代的街景都有接地暗影，放在主要批次（兩種畫質都畫），只多一批', () => {
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      assert.equal(world.batches.filter((batch) => batch.material === 'contact').length, 1, era.id)
      assert.ok(!world.detailBatches.some((batch) => batch.material === 'contact'), `${era.id} 不在細部`)
    }
  })

  test('騎樓柱與亭仔腳木柱的柱腳都有暗影，貼在騎樓步道上', () => {
    const b = new PartBuilder()
    buildArcadeBuilding(b, { archetype: 'baroque', width: 5, floors: 2, seed: 3 }, new PartBuilder())
    const onWalkway = (list) =>
      list.filter((g) => {
        g.computeBoundingBox()
        return Math.abs(g.boundingBox.min.y - (STREET.walkwayHeight + CONTACT_LIFT)) < 1e-6
      }).length
    assert.ok(onWalkway(b.groups.get('contact')) >= 2, '兩根騎樓柱')
    const s = new PartBuilder()
    buildShophouse(s, { width: 5, floors: 2, seed: 3 }, new PartBuilder())
    assert.ok(onWalkway(s.groups.get('contact')) >= 2, '兩根亭仔腳木柱')
  })

  test('材質：半透明、不寫入深度、不投射陰影、不描輪廓線；室內不重設它的顏色', () => {
    const batches = readFileSync(new URL('../src/game/components/StaticBatches.jsx', import.meta.url), 'utf8')
    assert.match(batches, /NO_SHADOW_CAST = new Set\([^)]*'contact'/)
    assert.match(batches, /NO_OUTLINE = new Set\([^)]*'contact'/)
    const materials = readFileSync(new URL('../src/game/rendering/materials.js', import.meta.url), 'utf8')
    assert.match(materials, /name === 'contact'/)
    assert.equal(MATERIAL_TILE.contact, null)
  })
})
