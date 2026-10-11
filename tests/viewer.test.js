import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { raycastBoxes } from '../src/game/collision.js'
import {
  VIEWER,
  allowedDistance,
  clampViewerTarget,
  facadeOf,
  orbitDirection,
  pickBuilding,
  planBuildingFocus,
} from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { createHarness, resetStore } from './helpers.js'

/**
 * 建築觀賞模式：模式切換的狀態、鏡頭限制（不穿牆、不掉到地面下、不離開街區）與聚焦建築。
 */
const store = () => useGameStore.getState()
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

function resetViewer(eraId = 'qing-port') {
  resetStore(eraId)
  useGameStore.setState({ viewMode: 'explore', uiHidden: false, viewerFocus: null, activeShopId: null, qualityOpen: false })
}

function inside(point, box, pad = 0) {
  return (
    point.x > box.minX - pad &&
    point.x < box.maxX + pad &&
    point.y > box.minY - pad &&
    point.y < box.maxY + pad &&
    point.z > box.minZ - pad &&
    point.z < box.maxZ + pad
  )
}

describe('store：探索／建築觀賞模式', () => {
  beforeEach(() => resetViewer())

  test('開始探索前、閱讀店家介紹時不能進入觀賞模式', () => {
    useGameStore.setState({ started: false })
    assert.equal(store().setViewMode('viewer'), false)
    useGameStore.setState({ started: true, mode: 'reading', activeShopId: 'lin-fu-zhen' })
    assert.equal(store().setViewMode('viewer'), false)
    assert.equal(store().viewMode, 'explore')
  })

  test('觀賞模式中不觸發店家介紹，也不顯示店家提示', () => {
    useGameStore.setState({ nearbyShopId: 'lin-fu-zhen' })
    assert.ok(store().setViewMode('viewer'))
    assert.equal(store().nearbyShopId, null, '進入觀賞模式時清除附近店家')
    useGameStore.setState({ nearbyShopId: 'lin-fu-zhen' })
    store().interact()
    assert.equal(store().openShop('lin-fu-zhen'), false)
    assert.equal(store().mode, 'explore')
    assert.equal(store().activeShopId, null)
  })

  test('返回探索後店家互動恢復正常', () => {
    store().setViewMode('viewer')
    store().setViewMode('explore')
    useGameStore.setState({ nearbyShopId: 'lin-fu-zhen' })
    store().interact()
    assert.equal(store().mode, 'focus')
    assert.equal(store().activeShopId, 'lin-fu-zhen')
  })

  test('隱藏介面只在觀賞模式有效；返回探索時自動恢復', () => {
    store().setUiHidden(true)
    assert.equal(store().uiHidden, false, '探索模式不能隱藏介面')
    store().setViewMode('viewer')
    useGameStore.setState({ qualityOpen: true })
    store().setUiHidden(true)
    assert.equal(store().uiHidden, true)
    assert.equal(store().qualityOpen, false, '隱藏介面時收起設定面板')
    store().setUiHidden(false)
    assert.equal(store().uiHidden, false)
    store().setUiHidden(true)
    store().setViewMode('explore')
    assert.equal(store().uiHidden, false)
  })

  test('觀賞模式中可以連續切換五個年代，模式保持不變', async () => {
    const harness = createHarness()
    store().setViewMode('viewer')
    for (const era of [...ERAS.slice(1), ERAS[0]]) {
      await harness.switchTo(era.id)
      assert.equal(store().viewMode, 'viewer')
    }
  })

  test('進出觀賞模式 10 次：年代、畫質與已探索紀錄都不會被重設', () => {
    useGameStore.setState({ eraId: 'modern', qualityMode: 'fine', visited: { 'lin-fu-zhen': true } })
    for (let i = 0; i < 10; i++) {
      assert.ok(store().setViewMode('viewer'), `第 ${i + 1} 次進入`)
      assert.ok(store().setViewMode('explore'), `第 ${i + 1} 次離開`)
    }
    assert.equal(store().eraId, 'modern')
    assert.equal(store().qualityMode, 'fine')
    assert.deepEqual(store().visited, { 'lin-fu-zhen': true })
    assert.equal(store().started, true)
  })

  test('店家名錄的「聚焦建築」只在觀賞模式有效', () => {
    assert.equal(store().focusBuilding('lin-fu-zhen'), false)
    store().setViewMode('viewer')
    assert.ok(store().focusBuilding('lin-fu-zhen'))
    assert.deepEqual(store().viewerFocus, { storeId: 'lin-fu-zhen', nonce: 1 })
    store().focusBuilding('lin-fu-zhen')
    assert.equal(store().viewerFocus.nonce, 2, '同一家店再按一次也會重新聚焦')
  })
})

describe('觀賞鏡頭的活動範圍', () => {
  test('注視點永遠在街道／廣場／碼頭上方，而且不在任何建築或樹裡', () => {
    for (const [eraId, world] of Object.entries(worlds)) {
      for (let x = -70; x <= 60; x += 2.5) {
        for (let z = -24; z <= 24; z += 2) {
          for (const y of [-3, 1, 6, 40]) {
            const target = clampViewerTarget({ x, y, z }, world.blockers)
            assert.ok(target.y >= VIEWER.minTargetY && target.y <= VIEWER.maxTargetY, `${eraId} 高度`)
            const inRegion = VIEWER.targetRegions.some(
              (r) => target.x >= r.minX - 1e-6 && target.x <= r.maxX + 1e-6 && target.z >= r.minZ - 0.5 && target.z <= r.maxZ + 0.5,
            )
            assert.ok(inRegion, `${eraId} (${x}, ${z}) → (${target.x.toFixed(2)}, ${target.z.toFixed(2)}) 不在街區內`)
            for (const box of world.blockers) assert.ok(!inside(target, box), `${eraId} 注視點在遮擋方塊內`)
          }
        }
      }
    }
  })

  test('任何角度：鏡頭都不會穿過建築、低於地面或離開街區', () => {
    const direction = { x: 0, y: 0, z: 0 }
    for (const [eraId, world] of Object.entries(worlds)) {
      for (let x = -50; x <= 36; x += 4) {
        for (const z of [-2.4, 0, 2.4]) {
          const target = clampViewerTarget({ x, y: 2.4, z }, world.blockers)
          for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 6) {
            for (const pitch of [VIEWER.minPitch, 0, 0.5, VIEWER.maxPitch]) {
              orbitDirection(yaw, pitch, direction)
              const distance = Math.min(VIEWER.maxDistance, allowedDistance(target, direction, VIEWER.maxDistance, world.blockers))
              const camera = {
                x: target.x + direction.x * distance,
                y: target.y + direction.y * distance,
                z: target.z + direction.z * distance,
              }
              assert.ok(camera.y >= VIEWER.bounds.minY - 1e-6, `${eraId} 鏡頭低於地面`)
              assert.ok(camera.x >= VIEWER.bounds.minX && camera.x <= VIEWER.bounds.maxX, `${eraId} 鏡頭離開街區（x）`)
              assert.ok(camera.z >= VIEWER.bounds.minZ && camera.z <= VIEWER.bounds.maxZ, `${eraId} 鏡頭離開街區（z）`)
              assert.ok(raycastBoxes(target, direction, distance, world.blockers) >= distance - 1e-6, `${eraId} 鏡頭與注視點之間有建築`)
              for (const box of world.blockers) assert.ok(!inside(camera, box), `${eraId} 鏡頭在建築內`)
            }
          }
        }
      }
    }
  })
})

describe('點選與聚焦建築', () => {
  test('每個年代都有每棟建築的外框，店家建築標有店家 id', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      assert.ok(world.buildings.length >= 20, `${era.id}：${world.buildings.length} 棟`)
      for (const id of era.availableStores) {
        assert.ok(
          world.buildings.some((building) => building.storeId === id),
          `${era.id}：${id}`,
        )
      }
    }
  })

  test('從街上朝建築點一下，會選到那棟建築', () => {
    const world = worlds['qing-port']
    for (const building of world.buildings.filter((item) => item.storeId)) {
      const facade = facadeOf(building)
      const origin = { x: facade.center.x + facade.forward.x * 4, y: 1.6, z: facade.center.z + facade.forward.z * 4 }
      const target = { x: facade.center.x, y: 3, z: facade.center.z }
      const length = Math.hypot(target.x - origin.x, target.y - origin.y, target.z - origin.z)
      const direction = { x: (target.x - origin.x) / length, y: (target.y - origin.y) / length, z: (target.z - origin.z) / length }
      assert.equal(pickBuilding(origin, direction, world.buildings)?.id, building.id)
    }
    // 朝天空點：沒有選到建築
    assert.equal(pickBuilding({ x: 0, y: 2, z: 0 }, { x: 0, y: 1, z: 0 }, world.buildings), null)
  })

  test('聚焦：鏡頭停在建築前方、看得到整個立面的距離，而且不穿牆', () => {
    const direction = { x: 0, y: 0, z: 0 }
    for (const [eraId, world] of Object.entries(worlds)) {
      for (const building of world.buildings) {
        const plan = planBuildingFocus(building, world.blockers, { yaw: 0, aspect: 4 / 3, fov: 42 })
        const facade = facadeOf(building)
        orbitDirection(plan.yaw, plan.pitch, direction)
        const camera = {
          x: plan.target.x + direction.x * plan.distance,
          y: plan.target.y + direction.y * plan.distance,
          z: plan.target.z + direction.z * plan.distance,
        }
        const label = `${eraId}/${building.id}`
        // 鏡頭在立面前方（不是從建築背後或裡面看）
        const front = (camera.x - facade.center.x) * facade.forward.x + (camera.z - facade.center.z) * facade.forward.z
        assert.ok(front > 1, `${label}：鏡頭不在立面前方（${front.toFixed(2)}）`)
        assert.ok(plan.distance >= 2 && plan.distance <= VIEWER.maxDistance, `${label}：距離 ${plan.distance}`)
        assert.ok(camera.y >= VIEWER.bounds.minY, `${label}：低於地面`)
        assert.ok(raycastBoxes(plan.target, direction, plan.distance, world.blockers) >= plan.distance - 1e-6, `${label}：穿牆`)
        for (const box of world.blockers) assert.ok(!inside(camera, box), `${label}：鏡頭在建築內`)
      }
    }
  })

  test('觀看距離依建築大小決定：高大的建築離得比較遠', () => {
    const world = worlds.banquet
    const plans = world.buildings.map((building) => ({
      height: facadeOf(building).height,
      distance: planBuildingFocus(building, world.blockers, { yaw: 0, aspect: 16 / 9, fov: 42 }).distance,
    }))
    plans.sort((a, b) => a.height - b.height)
    const low = plans.slice(0, 5).reduce((sum, item) => sum + item.distance, 0) / 5
    const high = plans.slice(-5).reduce((sum, item) => sum + item.distance, 0) / 5
    assert.ok(high > low + 1, `高樓平均 ${high.toFixed(1)} m、矮樓平均 ${low.toFixed(1)} m`)
  })
})
