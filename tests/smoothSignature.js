import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 流暢畫質畫出來的網格的指紋（與合併順序無關）：每一批在流暢畫質畫的頂點數、位置與頂點色的總和。
 * 用來比對第 9 階段細部前後流暢畫質完全相同（tests/fixtures/smoothBaseline.json 由細部之前的 main 產生）。
 */
export function batchSignature(batches) {
  const result = {}
  for (const batch of batches) {
    const pos = batch.geometry.attributes.position.array
    const color = batch.geometry.attributes.color?.array ?? []
    let sx = 0
    let sy = 0
    let sz = 0
    let sc = 0
    for (let i = 0; i < pos.length; i += 3) {
      sx += pos[i]
      sy += pos[i + 1]
      sz += pos[i + 2]
    }
    for (let i = 0; i < color.length; i++) sc += color[i]
    result[batch.material] = [pos.length / 3, sx, sy, sz, sc]
  }
  return result
}

export function smoothSignature(eraId) {
  const world = buildEraWorldSync(eraId)
  const interior = buildEraInteriorSync(eraId)
  return { street: batchSignature(world.batches), interior: batchSignature(interior.batches) }
}
