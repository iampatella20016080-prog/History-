import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { BANYAN_ROOT_CLEARANCE, buildTree } from '../src/game/builders/environment.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { TEMPLE_STALL } from '../src/data/squidSoupLayout.js'
import { MI_TAI_MU_STALL } from '../src/data/miTaiMuLayout.js'
import { DOUHUA_STALL, KUEH_STALL } from '../src/data/templeSnackLayout.js'

/*
 * 榕樹：多層葉片與氣根（第 9 階段）。
 * 廟埕的兩棵榕樹在廟埕本地座標 (±3.6, -2.4)、scale 0.9，石座的碰撞半寬 0.95；
 * 河岸廣場的榕樹 scale 1.0，樹幹的碰撞半寬 0.55。
 */
const TEMPLE_TREES = [
  { x: 3.6, seed: 301, clearings: [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing] },
  { x: -3.6, seed: 299, clearings: [MI_TAI_MU_STALL.clearing, KUEH_STALL.clearing] },
]

function banyan({ x = 0, z = 0, scale = 0.9, seed = 301, clearing = null, groundRadius = 0.95, withDetail = false } = {}) {
  const b = new PartBuilder()
  const detail = withDetail ? new PartBuilder() : null
  buildTree(b, [x, 0, z], { scale, seed, banyan: true, clearing, groundRadius, detail })
  return { b, detail }
}

// 第一個木作是樹幹，其餘是氣根
const roots = (builder) => builder.groups.get('wood').slice(1)
const verts = (list) => list.reduce((sum, g) => sum + g.attributes.position.count, 0)

function eachVertex(g, fn) {
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) fn(pos.getX(i), pos.getY(i), pos.getZ(i))
}

function minY(g) {
  let low = Infinity
  eachVertex(g, (_x, y) => (low = Math.min(low, y)))
  return low
}

describe('榕樹：多層葉片', () => {
  test('樹冠是三層錯開的葉叢：下層寬而低、上層小而高；一般的樹不變（五團）', () => {
    const { b } = banyan()
    const blobs = b.groups.get('plain').map((g) => {
      g.computeBoundingBox()
      const box = g.boundingBox
      const c = box.getCenter(box.min.clone())
      return { y: c.y, d: Math.hypot(c.x, c.z), w: box.max.x - box.min.x }
    })
    assert.equal(blobs.length, 14)
    const layers = [blobs.slice(0, 6), blobs.slice(6, 11), blobs.slice(11)]
    const mean = (list, key) => list.reduce((s, item) => s + item[key], 0) / list.length
    for (let k = 1; k < 3; k++) {
      assert.ok(mean(layers[k], 'y') > mean(layers[k - 1], 'y') + 0.4, `第 ${k + 1} 層比下一層高`)
      assert.ok(mean(layers[k], 'd') < mean(layers[k - 1], 'd'), `第 ${k + 1} 層比下一層靠近樹幹`)
    }
    // 下層的葉叢比較扁（高度比例小）
    const flat = (g) => {
      g.computeBoundingBox()
      const s = g.boundingBox.getSize(g.boundingBox.min.clone())
      return s.y / s.x
    }
    const groups = b.groups.get('plain')
    assert.ok(flat(groups[0]) < flat(groups[13]))
    // 樹冠的頂不超過鏡頭遮擋方塊的頂（7 × scale）
    for (const g of groups) {
      g.computeBoundingBox()
      assert.ok(g.boundingBox.max.y < 7 * 0.9)
    }
    const tree = new PartBuilder()
    buildTree(tree, [0, 0, 0], { scale: 1.1, seed: 12 })
    assert.equal(tree.groups.get('plain').length, 5, '一般的樹仍是五團')
    assert.equal(tree.groups.get('wood').length, 1, '一般的樹沒有氣根')
    assert.ok(!tree.groups.has('stone'), '一般的樹沒有石座')
  })
})

describe('榕樹：氣根', () => {
  test('有落地的支柱根與垂在樹冠下的短氣根；路徑細長、略彎', () => {
    const { b } = banyan()
    const list = roots(b)
    assert.ok(list.length >= 12, `氣根 ${list.length} 條`)
    const grounded = list.filter((g) => minY(g) < 0.6)
    assert.ok(grounded.length >= 4, `落地的氣根 ${grounded.length} 條`)
    for (const g of list) {
      g.computeBoundingBox()
      const s = g.boundingBox.getSize(g.boundingBox.min.clone())
      assert.ok(Math.max(s.x, s.z) < 1.4 && Math.min(s.x, s.z) > 0.04, '細長而略彎（不是筆直的柱子）')
      assert.ok(s.y > 0.3, '有垂下的長度')
    }
  })

  test('低於頭頂高度的部分都在碰撞範圍裡（廟埕的石座、河岸廣場的樹幹），不擋住人物的走道', () => {
    const cases = [
      ...TEMPLE_TREES.map((t) => ({ ...t, scale: 0.9, groundRadius: 0.95 })),
      ...TEMPLE_TREES.map((t) => ({ ...t, clearings: null, scale: 0.9, groundRadius: 0.95 })),
      { x: -40.6, z: -3.6, seed: 10, clearings: null, scale: 1.0, groundRadius: 0.55 },
    ]
    for (const c of cases) {
      const z0 = c.z ?? -2.4
      const { b, detail } = banyan({ x: c.x, z: z0, scale: c.scale, seed: c.seed, clearing: c.clearings, groundRadius: c.groundRadius, withDetail: true })
      for (const g of [...roots(b), ...detail.groups.get('wood')]) {
        eachVertex(g, (x, y, z) => {
          if (y >= BANYAN_ROOT_CLEARANCE - 0.04) return
          const ax = Math.abs(x - c.x)
          const az = Math.abs(z - z0)
          assert.ok(ax <= c.groundRadius + 0.02 && az <= c.groundRadius + 0.02, `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) 在走道上`)
        })
      }
    }
  })

  test('廟口攤位的空地裡沒有氣根（帆布棚、橫牌與攤位前的走道）', () => {
    for (const t of TEMPLE_TREES) {
      const { b, detail } = banyan({ x: t.x, z: -2.4, seed: t.seed, clearing: t.clearings, withDetail: true })
      const free = banyan({ x: t.x, z: -2.4, seed: t.seed, withDetail: true })
      assert.ok(roots(b).length < roots(free.b).length, '空地裡的氣根不產生')
      for (const g of [...roots(b), ...detail.groups.get('wood')]) {
        eachVertex(g, (x, _y, z) => {
          for (const k of t.clearings) assert.ok(!(x > k.minX && x < k.maxX && z > k.minZ && z < k.maxZ), '氣根在攤位裡')
        })
      }
    }
  })

  test('流暢模式（觸控裝置的預設）少一批氣根：多的氣根只在精緻模式的細部；街景的網格不因此改變', () => {
    const lean = banyan()
    const full = banyan({ withDetail: true })
    assert.equal(verts(lean.b.groups.get('wood')), verts(full.b.groups.get('wood')), '街景的氣根相同')
    assert.equal(verts(lean.b.groups.get('plain')), verts(full.b.groups.get('plain')))
    assert.ok(full.detail.groups.get('wood').length >= 8, '精緻模式另外多一批短氣根')
    assert.deepEqual([...full.detail.groups.keys()], ['wood'])
  })
})

describe('榕樹：空地、碰撞與效能預算', () => {
  test('樹冠空地不變：戰後的四個攤位空地，其他年代沒有空地', () => {
    const temple = getShop('ci-sheng-gong')
    const postwar = temple.buildingByEra.postwar
    assert.deepEqual(postwar.clearing, [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing])
    assert.deepEqual(postwar.eastClearing, [MI_TAI_MU_STALL.clearing, KUEH_STALL.clearing])
    assert.equal(getShopBuilding(temple, 'revival').clearing, undefined)
    assert.equal(getShopBuilding(temple, 'revival').eastClearing, undefined)
  })

  test('依材質合併：榕樹不增加網格（街景與細部各自每種材質一個），頂點數在預算內', () => {
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      for (const list of [world.batches, world.detailBatches]) {
        const materials = list.map((batch) => batch.material)
        assert.equal(new Set(materials).size, materials.length, era.id)
      }
      for (const m of ['wood', 'plain', 'stone']) assert.ok(world.batches.some((batch) => batch.material === m), `${era.id}：${m}`)
      assert.ok(world.detailBatches.some((batch) => batch.material === 'wood'), `${era.id}：細部的氣根和其他木作合併`)
    }
    // 一棵榕樹（含石座）的頂點數
    const { b, detail } = banyan({ withDetail: true })
    const main = [...b.groups.values()].flat()
    assert.ok(verts(main) < 6000, `街景 ${verts(main)}`)
    assert.ok(verts(detail.groups.get('wood')) < 1500, `細部 ${verts(detail.groups.get('wood'))}`)
  })
})
