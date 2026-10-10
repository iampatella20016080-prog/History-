import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { ERA_TRANSITION_TIMING } from '../src/game/eraTransition.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { createHarness, resetStore, YEAR } from './helpers.js'

/**
 * 年代轉場狀態機＋ store 的整合測試（模擬影格迴圈、渲染器與 React 掛載）
 */
describe('年代切換：可以連續切換、每次都正常結束', () => {
  beforeEach(() => resetStore('qing-port'))

  test('回歸測試：第一次轉場結束後，第二次請求會開始新的轉場（原本的錯誤）', async () => {
    const harness = createHarness()
    const first = await harness.switchTo(YEAR[1895])
    const second = await harness.switchTo(YEAR[1930])
    assert.equal(first.id, 1)
    assert.equal(second.id, 2)
    assert.equal(harness.director.handledId, 2)
    const begins = harness.events.filter((e) => e.type === 'begin').map((e) => e.id)
    assert.deepEqual(begins, [1, 2])
  })

  test('測試 A：1853 → 1895 → 1930 → 1945 → 2000', async () => {
    const harness = createHarness()
    for (const year of [1895, 1930, 1945, 2000]) await harness.switchTo(YEAR[year])
    assert.equal(useGameStore.getState().eraRequestSeq, 4)
  })

  test('測試 B：2000 → 1853 → 1945 → 1895 → 1930', async () => {
    resetStore(YEAR[2000])
    const harness = createHarness()
    for (const year of [1853, 1945, 1895, 1930]) await harness.switchTo(YEAR[year])
  })

  test('測試 C：1853 → 1930 → 1853 → 1930 → 1853', async () => {
    const harness = createHarness()
    for (const year of [1930, 1853, 1930, 1853]) await harness.switchTo(YEAR[year])
  })

  test('測試 D：連續切換 12 次（含已快取與尚未產生的年代）', async () => {
    const harness = createHarness({ load: (eraId) => ({ frames: eraId.length % 4 }) })
    const order = [1930, 2000, 1895, 1945, 1853, 1930, 1945, 2000, 1853, 1895, 1930, 1853]
    const ids = []
    for (const year of order) ids.push((await harness.switchTo(YEAR[year])).id)
    assert.deepEqual(ids, order.map((_, i) => i + 1))
  })

  test('每次轉場大約 1.8 秒（以 60fps 計）', async () => {
    const harness = createHarness({ load: () => ({ frames: 0 }) })
    const { frames } = await harness.switchTo(YEAR[1945])
    const seconds = frames / 60
    assert.ok(seconds > 1.6 && seconds < 2.4, `轉場長度 ${seconds.toFixed(2)} 秒`)
  })

  test('轉場進行中不接受新的請求，結束後可以再次切換', async () => {
    const harness = createHarness({ load: () => ({ frames: 30 }) })
    const id = useGameStore.getState().requestEra(YEAR[1930])
    assert.equal(id, 1)
    for (let i = 0; i < 10; i++) await harness.frame()
    assert.equal(useGameStore.getState().requestEra(YEAR[1945]), false, '轉場中的請求被拒絕')
    assert.equal(useGameStore.getState().eraTransition.id, 1)
    await harness.runUntilIdle()
    assert.equal(useGameStore.getState().eraId, YEAR[1930])
    await harness.switchTo(YEAR[1945])
  })

  test('街景產生較慢時在霧中等待，完成後正常結束', async () => {
    const harness = createHarness({ load: () => ({ frames: 400 }) })
    useGameStore.getState().requestEra(YEAR[1895])
    for (let i = 0; i < 200; i++) await harness.frame()
    assert.equal(harness.director.job.phase, 'out')
    assert.ok(harness.visual.mist > 0.8, '霧氣維持覆蓋')
    await harness.runUntilIdle()
    assert.equal(useGameStore.getState().eraId, YEAR[1895])
    await harness.switchTo(YEAR[1853])
  })
})

describe('年代切換：錯誤復原', () => {
  beforeEach(() => resetStore('qing-port'))

  test('街景產生失敗：退回原本的年代、解除鎖定、記錄錯誤，之後可以再次切換', async () => {
    let attempts = 0
    const harness = createHarness({
      load: (eraId) => {
        if (eraId === YEAR[1930]) attempts++
        return { frames: 5, fail: eraId === YEAR[1930] && attempts === 1 }
      },
    })
    const id = useGameStore.getState().requestEra(YEAR[1930])
    await harness.runUntilIdle()
    const state = useGameStore.getState()
    assert.equal(state.eraId, YEAR[1853], '留在原本的年代')
    assert.equal(state.transitioning, false)
    assert.equal(state.eraTransition, null)
    assert.deepEqual(state.eraError, { id, eraId: YEAR[1930] })
    assert.equal(harness.visual.mist, 0)
    assert.ok(!harness.events.some((e) => e.type === 'swap'), '沒有換上街景')
    // 再試一次就成功
    await harness.switchTo(YEAR[1930])
    assert.equal(useGameStore.getState().eraError, null, '新的請求會清除錯誤提示')
    await harness.switchTo(YEAR[1895])
  })

  test('渲染器沒有回應擷取畫面：不使用快照，仍然完成轉場', async () => {
    const harness = createHarness({ renderer: false })
    await harness.switchTo(YEAR[1945])
    await harness.switchTo(YEAR[2000])
  })

  test('新街景遲遲沒有回報掛載：等待有上限，仍然完成轉場', async () => {
    const harness = createHarness({ mount: false })
    const id = useGameStore.getState().requestEra(YEAR[1895])
    const frames = await harness.runUntilIdle()
    assert.ok(frames > ERA_TRANSITION_TIMING.mountMaxFrames)
    assert.equal(useGameStore.getState().eraId, YEAR[1895])
    assert.ok(harness.events.some((e) => e.type === 'finish' && e.id === id))
  })

  test('換上街景時發生錯誤：退回原本的年代並解除鎖定', async () => {
    const harness = createHarness({ swapError: new Error('swap failed') })
    useGameStore.getState().requestEra(YEAR[1930])
    await harness.runUntilIdle()
    assert.equal(useGameStore.getState().eraId, YEAR[1853])
    assert.equal(useGameStore.getState().transitioning, false)
  })

  test('非預期錯誤時 recover() 立即結束轉場並解除鎖定', async () => {
    const harness = createHarness({ load: () => ({ frames: 1000 }) })
    useGameStore.getState().requestEra(YEAR[1945])
    for (let i = 0; i < 5; i++) await harness.frame()
    assert.equal(useGameStore.getState().transitioning, true)
    harness.director.recover()
    assert.equal(useGameStore.getState().transitioning, false)
    assert.equal(useGameStore.getState().eraTransition, null)
    assert.equal(harness.visual.mist, 0)
    assert.ok(useGameStore.getState().requestEra(YEAR[1895]), '之後可以再次切換')
  })
})
