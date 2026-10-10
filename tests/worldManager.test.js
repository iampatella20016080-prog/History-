import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  configureWorldManager,
  getCachedEraWorld,
  inspectWorldManager,
  loadEraWorld,
  releaseEraWorld,
  resetWorldManager,
  retainEraWorld,
  setDisplayedEra,
} from '../src/game/world/worldManager.js'

/**
 * 街景管理：Web Worker 出錯、沒有回應或無法使用時，改在主執行緒產生；
 * 產生失敗不留在快取；轉場鎖定中的年代不會被釋放。
 * （在 Node 中執行真正的街景產生器，每個年代約需數百毫秒）
 */
function installFakeWorker(behavior) {
  const instances = []
  globalThis.Worker = class FakeWorker {
    constructor() {
      instances.push(this)
      this.terminated = false
    }
    postMessage(message) {
      behavior(this, message)
    }
    terminate() {
      this.terminated = true
    }
  }
  return instances
}

afterEach(() => {
  delete globalThis.Worker
  resetWorldManager()
  configureWorldManager({ workerTimeout: 20000 })
})

describe('worldManager', () => {
  test('沒有 Web Worker 時在主執行緒產生完整的街景', async () => {
    const world = await loadEraWorld('modern')
    assert.equal(world.eraId, 'modern')
    assert.ok(world.batches.length > 10)
    assert.ok(world.shopModels.some((model) => model.shop.id === 'bolero'))
    assert.equal(getCachedEraWorld('modern'), world)
  })

  test('Web Worker 一直沒有回應：逾時後改用主執行緒', async () => {
    configureWorldManager({ workerTimeout: 30 })
    const workers = installFakeWorker(() => {})
    const world = await loadEraWorld('banquet')
    assert.equal(world.eraId, 'banquet')
    assert.ok(workers[0].terminated, '沒有回應的 Worker 被終止')
    assert.equal(inspectWorldManager().workerBroken, true)
  })

  test('Web Worker 回報錯誤：改用主執行緒', async () => {
    installFakeWorker((worker, { id }) => setTimeout(() => worker.onmessage({ data: { id, ok: false, error: 'boom' } }), 5))
    const world = await loadEraWorld('postwar')
    assert.equal(world.eraId, 'postwar')
  })

  test('Web Worker 發生例外（onerror）：改用主執行緒', async () => {
    installFakeWorker((worker) => setTimeout(() => worker.onerror({ message: 'script error', preventDefault() {} }), 5))
    const world = await loadEraWorld('revival')
    assert.equal(world.eraId, 'revival')
  })

  test('產生失敗時 Promise 被拒絕，而且不會留在快取中', async () => {
    await assert.rejects(loadEraWorld('no-such-era'))
    assert.ok(!inspectWorldManager().cached.includes('no-such-era'))
  })

  test('顯示中與轉場鎖定中的年代不會被釋放', async () => {
    await loadEraWorld('qing-port')
    setDisplayedEra('qing-port')
    retainEraWorld('banquet')
    await loadEraWorld('banquet')
    await loadEraWorld('modern')
    let state = inspectWorldManager()
    assert.ok(state.cached.includes('qing-port'), '顯示中的年代保留')
    assert.ok(state.cached.includes('banquet'), '鎖定中的年代保留')
    releaseEraWorld('banquet')
    state = inspectWorldManager()
    assert.ok(state.cached.length <= 2, `解除鎖定後回到快取上限（${state.cached.join(', ')}）`)
    assert.ok(state.cached.includes('qing-port'))
  })
})
