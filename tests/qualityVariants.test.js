import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { BoxGeometry } from 'three'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { batchDrawStart, mergeFineParts, takeFineParts } from '../src/game/builders/qualityVariants.js'
import { ERAS } from '../src/data/eras.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { packWorld, unpackWorld } from '../src/game/world/worldPacking.js'
import { smoothSignature } from './smoothSignature.js'

/*
 * 細節美觀類的效果只在精緻畫質（使用者 2026-10-30 決定）：
 * 流暢畫質（iPad）的網格、頂點、批次與繪製呼叫和第 9 階段細部之前完全相同。
 * tests/fixtures/smoothBaseline.json 由細部之前的 main（5867e2d）以 tests/smoothSignature.js 產生。
 */
const BASELINE = JSON.parse(readFileSync(new URL('./fixtures/smoothBaseline.json', import.meta.url), 'utf8'))

function assertSameSignature(actual, expected, label) {
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${label}：材質相同`)
  for (const [material, [count, ...sums]] of Object.entries(expected)) {
    const [n, ...got] = actual[material]
    assert.equal(n, count, `${label} ${material}：頂點數`)
    sums.forEach((value, i) => assert.ok(Math.abs(got[i] - value) <= 0.01 + Math.abs(value) * 1e-7, `${label} ${material}：總和 ${i} ${got[i]} ≠ ${value}`))
  }
}

describe('流暢畫質與第 9 階段細部之前相同', () => {
  for (const era of ERAS) {
    test(`${era.id}：街景與室內的每一批（材質、頂點數、位置與頂點色）`, () => {
      const now = smoothSignature(era.id)
      assertSameSignature(now.street, BASELINE[era.id].street, `${era.id} 街景`)
      assertSameSignature(now.interior, BASELINE[era.id].interior, `${era.id} 室內`)
    })
  }

  test('批次數：15／20／25／27／37（每種材質一批）', () => {
    const expected = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) assert.equal(Object.keys(BASELINE[era.id].street).length, expected[era.id], era.id)
  })
})

describe('精緻畫質：取代與加上的細部', () => {
  test('精緻畫質從 smoothOnly 開始畫：跳過被取代的零件；流暢畫質從頭畫', () => {
    const world = buildEraWorldSync('postwar')
    const plain = world.batches.find((batch) => batch.material === 'plain')
    assert.ok(plain.smoothOnly > 0, '圓球葉團與牆頂的水漬在 plain 的最前面')
    assert.ok(plain.smoothOnly < plain.geometry.attributes.position.count)
    assert.equal(batchDrawStart(plain, false), 0)
    assert.equal(batchDrawStart(plain, true), plain.smoothOnly)
    // 接地暗影、粗枝與不規則葉團都在精緻畫質才顯示的細部批次
    const detail = new Set(world.detailBatches.map((batch) => batch.material))
    for (const m of ['contact', 'plain', 'wood']) assert.ok(detail.has(m), m)
    assert.ok(!world.batches.some((batch) => batch.material === 'contact'), '流暢畫質沒有接地暗影')
    // 經過 Web Worker 傳遞後 smoothOnly 仍在
    const { payload } = packWorld(world)
    const back = unpackWorld(payload).batches.find((batch) => batch.material === 'plain')
    assert.equal(back.smoothOnly, plain.smoothOnly)
  })

  test('室內：接地暗影只在細部批次', () => {
    for (const era of ERAS) {
      const interior = buildEraInteriorSync(era.id)
      assert.ok(!interior.batches.some((batch) => batch.material === 'contact'), era.id)
    }
    const postwar = buildEraInteriorSync('postwar')
    assert.ok(postwar.detailBatches.some((batch) => batch.material === 'contact'))
  })

  test('takeFineParts／mergeFineParts：精緻畫質的零件移到細部；流暢畫質的零件排在最前面', () => {
    const b = new PartBuilder()
    const detail = new PartBuilder()
    b.box('plain', [1, 1, 1], [0, 0, 0])
    b.variant('smooth', () => b.box('plain', [1, 1, 1], [3, 0, 0]))
    b.variant('fine', () => b.box('plain', [1, 1, 1], [6, 0, 0]))
    b.variant('fine', () => b.box('contact', [1, 1, 1], [9, 0, 0]))
    const fine = takeFineParts([b, detail])
    assert.equal(b.groups.get('plain').length, 2)
    assert.ok(!b.groups.has('contact'))
    mergeFineParts(fine, [b, detail], detail)
    assert.equal(detail.groups.get('plain').length, 1)
    assert.equal(detail.groups.get('contact').length, 1)
    const [batch] = b.buildMaterial('plain')
    assert.equal(batch.smoothOnly, 36)
    batch.geometry.computeBoundingBox()
    // 最前面 36 個頂點是流暢畫質的方塊（x = 3）
    const pos = batch.geometry.attributes.position
    for (let i = 0; i < 36; i++) assert.ok(Math.abs(pos.getX(i) - 3) <= 0.5 + 1e-6)
    // 沒有流暢畫質零件的批次沒有 smoothOnly
    const plain = new PartBuilder()
    plain.add('plain', new BoxGeometry(1, 1, 1))
    assert.equal(plain.buildMaterial('plain')[0].smoothOnly, undefined)
  })

  test('variant 結束後回到兩種畫質都有', () => {
    const b = new PartBuilder()
    b.variant('fine', () => b.variant('smooth', () => b.box('plain', [1, 1, 1])))
    const after = b.box('plain', [1, 1, 1])
    assert.equal(b.groups.get('plain')[0].userData.variant, 'smooth')
    assert.equal(after.userData.variant, undefined)
  })
})
