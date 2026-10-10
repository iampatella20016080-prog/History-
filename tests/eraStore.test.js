import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

const store = () => useGameStore.getState()

describe('store：年代切換請求', () => {
  beforeEach(() => resetStore('qing-port'))

  test('請求 id 是持續遞增的流水號，轉場結束（eraTransition 清除）後也不會重新開始', () => {
    const ids = []
    for (let i = 0; i < 20; i++) {
      const next = ERAS[(i + 1) % ERAS.length].id // 依序循環，每次都和目前的年代不同
      const id = store().requestEra(next)
      assert.ok(id, `第 ${i + 1} 次請求應該被接受`)
      ids.push(id)
      assert.ok(store().swapEra(id, next))
      assert.ok(store().finishEraTransition(id))
      assert.equal(store().eraTransition, null)
      assert.equal(store().transitioning, false)
      assert.equal(store().eraId, next)
    }
    assert.deepEqual(ids, Array.from({ length: 20 }, (_, i) => i + 1))
    assert.equal(new Set(ids).size, ids.length)
  })

  test('轉場進行中、閱讀介紹中、尚未載入或選到同一年代時不接受請求', () => {
    assert.equal(store().requestEra('qing-port'), false, '同一個年代')
    assert.equal(store().requestEra('no-such-era'), false, '不存在的年代')
    useGameStore.setState({ mode: 'reading' })
    assert.equal(store().requestEra('banquet'), false, '閱讀介紹中')
    useGameStore.setState({ mode: 'explore', worldReady: false })
    assert.equal(store().requestEra('banquet'), false, '街景尚未載入')
    useGameStore.setState({ worldReady: true })
    const id = store().requestEra('banquet')
    assert.equal(id, 1)
    assert.equal(store().requestEra('modern'), false, '轉場進行中')
    assert.deepEqual(store().eraTransition, { id: 1, from: 'qing-port', to: 'banquet' })
  })

  test('過期的 id 不會影響目前的轉場', () => {
    const id = store().requestEra('banquet')
    assert.equal(store().swapEra(id + 5, 'modern'), false)
    assert.equal(store().finishEraTransition(id - 1), false)
    assert.equal(store().reportEraError(999, 'banquet'), false)
    assert.equal(store().transitioning, true)
    assert.equal(store().eraId, 'qing-port')
    assert.ok(store().swapEra(id, 'banquet'))
    assert.ok(store().finishEraTransition(id))
    assert.equal(store().finishEraTransition(id), false, '同一個轉場不會結束兩次')
    assert.equal(store().eraId, 'banquet')
  })

  test('每次請求都會產生新的章節標題（動畫重新播放）', () => {
    const first = store().requestEra('banquet')
    const cardA = store().titleCard
    store().swapEra(first, 'banquet')
    store().finishEraTransition(first)
    store().requestEra('modern')
    const cardB = store().titleCard
    assert.equal(cardB.eraId, 'modern')
    assert.notEqual(cardA.nonce, cardB.nonce)
  })
})
