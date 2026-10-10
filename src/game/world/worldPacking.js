import { Box3, BufferAttribute, BufferGeometry, Sphere, Vector3 } from 'three'

/**
 * 街景資料在 Web Worker 與主執行緒之間傳遞：
 * BufferGeometry 拆成 TypedArray（可轉移，不需複製），主執行緒再組回 BufferGeometry。
 */
export function packWorld(world) {
  const transfer = []
  const batches = world.batches.map(({ material, geometry }) => {
    const attributes = {}
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      attributes[name] = { array: attribute.array, itemSize: attribute.itemSize }
      transfer.push(attribute.array.buffer)
    }
    const { center, radius } = geometry.boundingSphere
    const { min, max } = geometry.boundingBox
    return {
      material,
      attributes,
      sphere: [center.x, center.y, center.z, radius],
      box: [min.x, min.y, min.z, max.x, max.y, max.z],
    }
  })
  return { payload: { ...world, batches }, transfer }
}

export function unpackWorld(payload) {
  const batches = payload.batches.map(({ material, attributes, sphere, box }) => {
    const geometry = new BufferGeometry()
    for (const [name, { array, itemSize }] of Object.entries(attributes)) {
      geometry.setAttribute(name, new BufferAttribute(array, itemSize))
    }
    geometry.boundingSphere = new Sphere(new Vector3(sphere[0], sphere[1], sphere[2]), sphere[3])
    geometry.boundingBox = new Box3(new Vector3(box[0], box[1], box[2]), new Vector3(box[3], box[4], box[5]))
    return { material, geometry }
  })
  return { ...payload, batches }
}
