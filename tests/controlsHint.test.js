import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CONTROLS_STORAGE_KEY,
  controlsNeedsIdleTimer,
  controlsOnIdle,
  controlsOnMove,
  controlsOnToggle,
  defaultControlsState,
  loadControlsState,
  saveControlsState,
} from '../src/ui/controlsHint.js'

const memoryStorage = () => {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}
const brokenStorage = {
  getItem() {
    throw new Error('denied')
  },
  setItem() {
    throw new Error('denied')
  },
}

test('預設：桌面展開、觸控收起', () => {
  assert.deepEqual(defaultControlsState(false), { collapsed: false, manual: false })
  assert.deepEqual(defaultControlsState(true), { collapsed: true, manual: false })
})

test('桌面第一次移動後自動收起', () => {
  const next = controlsOnMove(defaultControlsState(false), false)
  assert.equal(next.collapsed, true)
  assert.equal(next.manual, false)
})

test('展開後無互動計時到就收起，且只在需要時啟動計時', () => {
  const state = defaultControlsState(false)
  assert.equal(controlsNeedsIdleTimer(state, false), true)
  assert.equal(controlsOnIdle(state, false).collapsed, true)
  assert.equal(controlsNeedsIdleTimer({ collapsed: true, manual: false }, false), false)
})

test('手動展開後，移動與計時都不再自動收起', () => {
  let state = controlsOnToggle(controlsOnMove(defaultControlsState(false), false))
  assert.deepEqual(state, { collapsed: false, manual: true })
  assert.equal(controlsOnMove(state, false), state)
  assert.equal(controlsOnIdle(state, false), state)
  assert.equal(controlsNeedsIdleTimer(state, false), false)
})

test('觸控裝置不自動變更，維持使用者的選擇', () => {
  const state = { collapsed: false, manual: false }
  assert.equal(controlsOnMove(state, true), state)
  assert.equal(controlsNeedsIdleTimer(state, true), false)
})

test('模式切換後從儲存還原，保留使用者最後的選擇', () => {
  const storage = memoryStorage()
  saveControlsState(controlsOnToggle({ collapsed: true, manual: false }), storage)
  assert.deepEqual(loadControlsState(false, storage), { collapsed: false, manual: true })
  saveControlsState({ collapsed: true, manual: false }, storage)
  assert.deepEqual(loadControlsState(false, storage), { collapsed: true, manual: false })
})

test('儲存失敗或內容損壞時退回預設', () => {
  assert.deepEqual(loadControlsState(false, brokenStorage), defaultControlsState(false))
  assert.doesNotThrow(() => saveControlsState({ collapsed: true, manual: true }, brokenStorage))
  const storage = memoryStorage()
  storage.setItem(CONTROLS_STORAGE_KEY, '{壞掉')
  assert.deepEqual(loadControlsState(true, storage), defaultControlsState(true))
  storage.setItem(CONTROLS_STORAGE_KEY, '{"collapsed":"x"}')
  assert.deepEqual(loadControlsState(false, storage), defaultControlsState(false))
  assert.deepEqual(loadControlsState(false, null), defaultControlsState(false))
})
