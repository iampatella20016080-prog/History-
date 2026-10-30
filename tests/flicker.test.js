import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { ERAS } from '../src/data/eras.js'
import { COPLANAR_DELTA, findCoplanar, resolveAllCoplanar } from '../src/game/builders/coplanar.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { CAMERA } from '../src/game/config.js'
import { DEBUG_FLICKER, flickerDebugState } from '../src/game/debugFlicker.js'
import { hysteresisVisible, VISIBILITY_MARGIN } from '../src/game/visibility.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 畫面閃爍（Z-fighting）：
 * - 共面處理（builders/coplanar.js）：重複的方塊刪掉一層；重疊的較小方塊往外長；疊在一起的飾件一層一層錯開；
 *   斜放的方塊與非方塊的零件也處理；只會往外長、不會往內縮。
 * - 五個年代的街景與室內：處理之後沒有剩下共面重疊的面（不論看不看得到）。
 * - 鏡頭的 near／far、依距離顯示的遲滯、除錯開關預設關閉。
 */
const boxAt = (b, size, position, material = 'plain', rotationY = 0) => {
  b.group([0, 0, 0], rotationY, () => b.box(material, size, position))
}
const bounds = (g) => {
  g.computeBoundingBox()
  return g.boundingBox.clone()
}
const allGeometries = (b) => [...b.groups.values()].flat()

describe('共面處理', () => {
  test('完全重複的方塊：刪掉一層', () => {
    const b = new PartBuilder()
    boxAt(b, [2, 3, 0.2], [0, 1.5, 0], 'brick')
    boxAt(b, [2, 3, 0.2], [0, 1.5, 0], 'plaster')
    const stats = resolveAllCoplanar([b])
    assert.equal(stats.removed, 1)
    assert.equal(allGeometries(b).length, 1)
    assert.equal(b.groups.get('plaster').length, 1, '留下後加入的那一個')
  })

  test('貼在牆面上的飾條：飾條往外長 5 mm（在牆前面），牆不動', () => {
    const b = new PartBuilder()
    boxAt(b, [4, 3, 0.2], [0, 1.5, -0.1], 'brick')
    boxAt(b, [1, 0.1, 0.05], [0, 2, -0.025], 'wood')
    const wall = bounds(b.groups.get('brick')[0])
    resolveAllCoplanar([b])
    assert.deepEqual(bounds(b.groups.get('brick')[0]), wall)
    const strip = bounds(b.groups.get('wood')[0])
    assert.ok(Math.abs(strip.max.z - COPLANAR_DELTA) < 1e-6, `飾條正面 ${strip.max.z}`)
    assert.ok(Math.abs(strip.min.z + 0.05) < 1e-6, '背面不動')
    assert.equal(findCoplanar([b]).length, 0)
  })

  test('同一面牆上互相重疊的三層飾件：一層一層錯開，最後沒有共面', () => {
    const b = new PartBuilder()
    boxAt(b, [4, 3, 0.2], [0, 1.5, -0.1], 'brick')
    boxAt(b, [2, 1, 0.05], [0, 1.5, -0.025], 'plaster')
    boxAt(b, [1, 0.5, 0.02], [0, 1.5, -0.01], 'wood')
    boxAt(b, [0.4, 0.2, 0.01], [0, 1.5, -0.005], 'dark')
    resolveAllCoplanar([b])
    const fronts = ['brick', 'plaster', 'wood', 'dark'].map((m) => bounds(b.groups.get(m)[0]).max.z)
    for (let i = 1; i < fronts.length; i++) assert.ok(fronts[i] > fronts[i - 1] + 0.004, `第 ${i} 層 ${fronts[i]} 在第 ${i - 1} 層 ${fronts[i - 1]} 前面`)
    assert.equal(findCoplanar([b]).length, 0)
  })

  test('斜放（45 度）的建築上的飾條也處理', () => {
    const b = new PartBuilder()
    boxAt(b, [4, 3, 0.2], [0, 1.5, -0.1], 'brick', Math.PI / 4)
    boxAt(b, [1, 0.1, 0.05], [0, 2, -0.025], 'wood', Math.PI / 4)
    assert.ok(findCoplanar([b]).length > 0)
    resolveAllCoplanar([b])
    assert.equal(findCoplanar([b]).length, 0)
  })

  test('非方塊的零件（平面貼片）：在牆前面', () => {
    const b = new PartBuilder()
    boxAt(b, [4, 3, 0.2], [0, 1.5, -0.1], 'brick')
    b.plane('exhibit', 1, 0.8, [0, 1.5, 0])
    resolveAllCoplanar([b])
    const panel = bounds(b.groups.get('exhibit')[0])
    assert.ok(panel.min.z >= COPLANAR_DELTA - 1e-6, `展板 ${panel.min.z}`)
    assert.equal(findCoplanar([b]).length, 0)
  })

  test('只會往外長：每個零件的外框都不會變小（相鄰建築之間不會出現縫隙）', () => {
    const b = new PartBuilder()
    for (const x of [0, 4]) {
      boxAt(b, [4, 0.1, 1.7], [x, 0.05, 0.85], 'stone')
      boxAt(b, [4, 0.125, 0.22], [x, 0.0625, 1.59], 'stone')
      boxAt(b, [0.26, 7, 10], [x + 1.87, 3.5, -5], 'plaster')
    }
    const before = allGeometries(b).map(bounds)
    resolveAllCoplanar([b])
    allGeometries(b).forEach((g, i) => {
      const after = bounds(g)
      for (const axis of ['x', 'y', 'z']) {
        assert.ok(after.min[axis] <= before[i].min[axis] + 1e-6 && after.max[axis] >= before[i].max[axis] - 1e-6, `零件 ${i} 在 ${axis} 方向變小了`)
      }
    })
  })

  test('fixed（已經在街景裡的外殼）不修改；和它共面的室內地板往上長（即使比較大）', () => {
    const shell = new PartBuilder()
    boxAt(shell, [2, 0.05, 2], [0, 0.025, 0], 'dark')
    const room = new PartBuilder()
    boxAt(room, [4, 0.01, 4], [0, 0.045, 0], 'terracotta')
    const before = bounds(shell.groups.get('dark')[0])
    resolveAllCoplanar([room], { fixed: [shell] })
    assert.deepEqual(bounds(shell.groups.get('dark')[0]), before)
    assert.ok(Math.abs(bounds(room.groups.get('terracotta')[0]).max.y - (0.05 + COPLANAR_DELTA)) < 1e-6)
  })
})

describe('五個年代：處理之後沒有共面重疊的面', () => {
  // 攔截 PartBuilder.add，取得街景與室內合併之前的每一個零件
  const parts = []
  const original = PartBuilder.prototype.add
  PartBuilder.prototype.add = function (material, geometry, options) {
    const g = original.call(this, material, geometry, options)
    parts.push(g)
    return g
  }
  const remaining = (eraId) => {
    parts.length = 0
    buildEraWorldSync(eraId)
    buildEraInteriorSync(eraId)
    const kept = parts.filter((g) => !g.userData.discarded)
    return findCoplanar([{ groups: new Map([['all', kept]]) }], { visibleOnly: true })
  }
  for (const era of ERAS) {
    test(`${era.id}：街景＋室內`, () => {
      const list = remaining(era.id)
      const area = list.reduce((sum, item) => sum + item.area, 0)
      // 只剩兩個零件都不是最外側的面（凹槽裡），面積很小
      assert.ok(area < 0.1, `${era.id}：剩下 ${list.length} 處、${area.toFixed(2)} m²：${JSON.stringify(list.slice(0, 3))}`)
    })
  }
  test('結束攔截', () => {
    PartBuilder.prototype.add = original
  })
})

describe('鏡頭、距離切換與除錯開關', () => {
  test('鏡頭的 near／far：near 0.3 m、far 只涵蓋最遠的山（半徑 760 m）', () => {
    assert.ok(CAMERA.near >= 0.3)
    assert.ok(CAMERA.far >= 850 && CAMERA.far <= 1000, `far ${CAMERA.far}`)
    // 24 位元深度緩衝在 60 m 的解析度要小於共面處理的位移（5 mm）的一半
    const resolution = (z) => (z * z) / (CAMERA.near * 2 ** 24)
    assert.ok(resolution(60) < COPLANAR_DELTA / 2, `${resolution(60)}`)
  })

  test('依距離顯示加上遲滯：走近到 show 以內才顯示，退到 show + margin 以外才隱藏', () => {
    assert.equal(hysteresisVisible(false, 29.9, 30), true)
    assert.equal(hysteresisVisible(false, 30.5, 30), false)
    assert.equal(hysteresisVisible(true, 30.5, 30), true, '剛好超過顯示距離時仍然顯示')
    assert.equal(hysteresisVisible(true, 30 + VISIBILITY_MARGIN + 0.1, 30), false)
    // 在臨界距離附近來回走 100 個影格：最多切換一次
    let visible = false
    let toggles = 0
    for (let i = 0; i < 100; i++) {
      const next = hysteresisVisible(visible, 30 + Math.sin(i) * 0.8, 30)
      if (next !== visible) toggles++
      visible = next
    }
    assert.ok(toggles <= 1, `切換 ${toggles} 次`)
  })

  test('閃爍除錯開關預設關閉；關閉距離切換時一律顯示', () => {
    assert.equal(DEBUG_FLICKER, false)
    flickerDebugState.lod = true
    assert.equal(hysteresisVisible(false, 999, 30), true)
    flickerDebugState.lod = false
  })

  test('招牌是貼花：往前偏移並加上 polygonOffset；只有貼花開 polygonOffset', () => {
    const sign = readFileSync(new URL('../src/game/components/SignLayer.jsx', import.meta.url), 'utf8')
    assert.match(sign, /SIGN_LIFT = 0\.006/)
    assert.match(sign, /material\.polygonOffset = true/)
    // 材質裡只有接地暗影（貼地的半透明薄片，細部階段）開 polygonOffset
    const materials = readFileSync(new URL('../src/game/rendering/materials.js', import.meta.url), 'utf8')
    const contact = materials.slice(materials.indexOf('contact: new MeshBasicMaterial'), materials.indexOf('}),', materials.indexOf('contact: new MeshBasicMaterial')))
    assert.match(contact, /polygonOffset: true/)
    assert.doesNotMatch(materials.replace(contact, ''), /polygonOffset/)
  })
})
