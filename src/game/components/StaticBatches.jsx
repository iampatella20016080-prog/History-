import { useEffect } from 'react'
import { getMaterials } from '../rendering/materials.js'

/** 這些材質不投射陰影（地面、玻璃、發光面），省下陰影貼圖的繪製 */
const NO_SHADOW_CAST = new Set(['earth', 'asphalt', 'pavers', 'glass', 'glassWarm', 'windowLit', 'bulb'])

/**
 * 依材質合併後的靜態網格（整條街只需二十多次繪製呼叫）。
 * dispose = false 時幾何由外部管理（年代街景快取），卸載時不釋放。
 */
export function StaticBatches({ batches, castShadow = true, receiveShadow = true, dispose = true }) {
  const materials = getMaterials()

  useEffect(() => {
    if (!dispose) return undefined
    return () => batches.forEach(({ geometry }) => geometry.dispose())
  }, [batches, dispose])

  return batches.map(({ material, geometry }) => (
    <mesh
      key={material}
      geometry={geometry}
      material={materials[material] ?? materials.plain}
      castShadow={castShadow && !NO_SHADOW_CAST.has(material)}
      receiveShadow={receiveShadow}
    />
  ))
}
