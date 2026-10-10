import { buildEraWorldSync } from './buildWorld.js'
import { packWorld } from './worldPacking.js'

/**
 * 在背景執行緒產生年代街景，避免切換年代時主畫面卡頓。
 * 訊息格式：{ id, eraId } → { id, ok, world | error }
 */
self.onmessage = (event) => {
  const { id, eraId } = event.data
  try {
    const startTime = performance.now()
    const world = buildEraWorldSync(eraId)
    const { payload, transfer } = packWorld(world)
    payload.buildTime = performance.now() - startTime
    self.postMessage({ id, ok: true, world: payload }, transfer)
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.stack ?? error) })
  }
}
