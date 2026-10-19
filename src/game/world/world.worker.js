import { buildEraInteriorSync, buildEraWorldSync } from './buildWorld.js'
import { packInterior, packWorld } from './worldPacking.js'

/**
 * 在背景執行緒產生年代街景（或按需載入的室內細部），避免主畫面卡頓。
 * 訊息格式：{ id, eraId, kind, building } → { id, ok, world | error }；
 * kind 為 world（預設）或 interior（building：只產生這棟建築的室內）
 */
self.onmessage = (event) => {
  const { id, eraId, kind = 'world', building = null } = event.data
  try {
    const startTime = performance.now()
    const { payload, transfer } =
      kind === 'interior' ? packInterior(buildEraInteriorSync(eraId, building)) : packWorld(buildEraWorldSync(eraId))
    payload.buildTime = performance.now() - startTime
    self.postMessage({ id, ok: true, world: payload }, transfer)
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.stack ?? error) })
  }
}
