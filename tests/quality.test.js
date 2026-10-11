import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import {
  QUALITY_MODES,
  QUALITY_STORAGE_KEY,
  defaultQualityMode,
  getQualitySettings,
  initialQualityMode,
  saveQualityMode,
} from '../src/game/quality.js'
import { useGameStore } from '../src/state/useGameStore.js'

/**
 * 畫質設定：兩種模式的實際數值、依裝置的預設、網址參數與 localStorage 的優先順序。
 * （在 Node 中以假的 window 模擬 iPad 與桌面電腦）
 */
function fakeWindow({ touch = false, ratio = 2, search = '', storage = {} } = {}) {
  const store = { ...storage }
  globalThis.window = {
    devicePixelRatio: ratio,
    location: { search },
    matchMedia: (query) => ({ matches: touch && query.includes('coarse') }),
    localStorage: {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value)
      },
    },
  }
  return store
}

beforeEach(() => fakeWindow())
afterEach(() => {
  delete globalThis.window
})

describe('兩種模式的設定', () => {
  test('流暢：解析度上限 1.25、陰影 512 或 1024、關閉景深／光暈／環境遮蔽、精簡裝飾', () => {
    const q = QUALITY_MODES.smooth
    assert.equal(q.dprMax, 1.25)
    assert.ok([512, 1024].includes(q.shadowMapSize))
    assert.equal(q.dofTaps, 0)
    assert.equal(q.bloom, 0)
    assert.equal(q.ao, 0)
    assert.equal(q.detail, false)
  })

  test('精緻：解析度上限 1.75、陰影 2048 柔和陰影、適量環境遮蔽、非常輕微的光暈、完整裝飾', () => {
    const q = QUALITY_MODES.fine
    assert.equal(q.dprMax, 1.75)
    assert.equal(q.shadowMapSize, 2048)
    assert.ok(q.shadowRadius > QUALITY_MODES.smooth.shadowRadius)
    assert.ok(q.ao > 0 && q.ao <= 0.6)
    assert.ok(q.bloom > 0 && q.bloom <= 0.2)
    assert.equal(q.detail, true)
  })

  test('實際解析度不超過模式上限，也不超過裝置像素比', () => {
    fakeWindow({ ratio: 3 })
    assert.equal(getQualitySettings('smooth').dpr, 1.25)
    assert.equal(getQualitySettings('fine').dpr, 1.75)
    fakeWindow({ ratio: 1.5 })
    assert.equal(getQualitySettings('fine').dpr, 1.5)
    fakeWindow({ ratio: 1 })
    assert.equal(getQualitySettings('smooth').dpr, 1)
    assert.equal(getQualitySettings('fine').dpr, 1)
    assert.ok(getQualitySettings('fine').dprMin <= getQualitySettings('fine').dpr)
  })
})

describe('預設與保存', () => {
  test('iPad（觸控）預設流暢，桌面電腦預設精緻', () => {
    fakeWindow({ touch: true })
    assert.equal(defaultQualityMode(), 'smooth')
    assert.equal(initialQualityMode(), 'smooth')
    fakeWindow({ touch: false })
    assert.equal(defaultQualityMode(), 'fine')
    assert.equal(initialQualityMode(), 'fine')
  })

  test('使用者的選擇記在 localStorage，下次開啟沿用', () => {
    const store = fakeWindow({ touch: true })
    saveQualityMode('fine')
    assert.equal(store[QUALITY_STORAGE_KEY], 'fine')
    assert.equal(initialQualityMode(), 'fine')
  })

  test('網址參數優先；舊的 low／medium／high 對應到新模式；無效的值忽略', () => {
    fakeWindow({ search: '?quality=smooth', storage: { [QUALITY_STORAGE_KEY]: 'fine' } })
    assert.equal(initialQualityMode(), 'smooth')
    fakeWindow({ search: '?quality=low' })
    assert.equal(initialQualityMode(), 'smooth')
    fakeWindow({ search: '?quality=high', touch: true })
    assert.equal(initialQualityMode(), 'fine')
    fakeWindow({ storage: { [QUALITY_STORAGE_KEY]: 'ultra' } })
    assert.equal(initialQualityMode(), 'fine')
  })

  test('無法使用 localStorage（私密瀏覽）時不會出錯', () => {
    fakeWindow()
    globalThis.window.localStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    assert.doesNotThrow(() => saveQualityMode('smooth'))
    assert.equal(initialQualityMode(), 'fine')
  })

  test('切換模式立即更新狀態並保存；來回切換多次後狀態正確', () => {
    const store = fakeWindow()
    const { setQualityMode } = useGameStore.getState()
    for (let i = 0; i < 12; i++) {
      const mode = i % 2 === 0 ? 'smooth' : 'fine'
      setQualityMode(mode)
      assert.equal(useGameStore.getState().qualityMode, mode)
      assert.equal(store[QUALITY_STORAGE_KEY], mode)
    }
    setQualityMode('ultra')
    assert.equal(useGameStore.getState().qualityMode, 'fine')
  })
})
