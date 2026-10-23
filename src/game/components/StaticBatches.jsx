import { useEffect } from 'react'
import { LAYERS } from '../config.js'
import { getMaterials } from '../rendering/materials.js'

/** 這些材質不投射陰影（地面、玻璃、發光面），省下陰影貼圖的繪製 */
const NO_SHADOW_CAST = new Set(['earth', 'asphalt', 'pavers', 'glass', 'glassWarm', 'glassClear', 'windowLit', 'bulb'])
/** 半透明的材質放在 NO_OUTLINE 圖層：不擋住後方物件的輪廓線 */
const NO_OUTLINE = new Set(['glassClear'])

/**
 * 依材質合併後的靜態網格（整條街只需二十多次繪製呼叫）。
 * dispose = false 時幾何由外部管理（年代街景快取），卸載時不釋放。
 * materials 可以換成另一組同名材質（例如室內用、略為自發光的材質）。
 */
export function StaticBatches({ batches, materials: materialSet, castShadow = true, receiveShadow = true, dispose = true }) {
  const materials = materialSet ?? getMaterials()

  useEffect(() => {
    if (!dispose) return undefined
    return () => batches.forEach(({ geometry }) => geometry.dispose())
  }, [batches, dispose])

  return batches.map(({ material, geometry }) => (
    <mesh
      key={material}
      name={`batch-${material}`}
      userData={{ material, staticBatch: true }}
      geometry={geometry}
      material={materials[material] ?? materials.plain}
      castShadow={castShadow && !NO_SHADOW_CAST.has(material)}
      receiveShadow={receiveShadow}
      onUpdate={NO_OUTLINE.has(material) ? (mesh) => mesh.layers.set(LAYERS.NO_OUTLINE) : undefined}
    />
  ))
}
