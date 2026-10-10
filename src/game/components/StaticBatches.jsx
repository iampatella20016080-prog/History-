import { useEffect } from 'react'
import { getMaterials } from '../rendering/materials.js'

/** 依材質合併後的靜態網格（整條街只需十幾次繪製呼叫） */
export function StaticBatches({ batches, castShadow = true, receiveShadow = true }) {
  const materials = getMaterials()

  useEffect(() => () => batches.forEach(({ geometry }) => geometry.dispose()), [batches])

  return batches.map(({ material, geometry }) => (
    <mesh
      key={material}
      geometry={geometry}
      material={materials[material]}
      castShadow={castShadow && material !== 'earth'}
      receiveShadow={receiveShadow}
    />
  ))
}
