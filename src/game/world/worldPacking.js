import { Box3, BufferAttribute, BufferGeometry, Sphere, Vector3 } from 'three'

/**
 * 街景資料在 Web Worker 與主執行緒之間傳遞：
 * BufferGeometry 拆成 TypedArray（可轉移，不需複製），主執行緒再組回 BufferGeometry。
 */
function packBatches(list, transfer) {
  return list.map(({ material, geometry, smoothOnly }) => {
    const attributes = {}
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      attributes[name] = { array: attribute.array, itemSize: attribute.itemSize }
      transfer.push(attribute.array.buffer)
    }
    const { center, radius } = geometry.boundingSphere
    const { min, max } = geometry.boundingBox
    return {
      material,
      ...(smoothOnly ? { smoothOnly } : {}),
      attributes,
      sphere: [center.x, center.y, center.z, radius],
      box: [min.x, min.y, min.z, max.x, max.y, max.z],
    }
  })
}

export function packWorld(world) {
  const transfer = []
  const batches = packBatches(world.batches, transfer)
  const detailBatches = packBatches(world.detailBatches ?? [], transfer)
  return { payload: { ...world, batches, detailBatches }, transfer }
}

function unpackBatches(list) {
  return list.map(({ material, smoothOnly, attributes, sphere, box }) => {
    const geometry = new BufferGeometry()
    for (const [name, { array, itemSize }] of Object.entries(attributes)) {
      geometry.setAttribute(name, new BufferAttribute(array, itemSize))
    }
    geometry.boundingSphere = new Sphere(new Vector3(sphere[0], sphere[1], sphere[2]), sphere[3])
    geometry.boundingBox = new Box3(new Vector3(box[0], box[1], box[2]), new Vector3(box[3], box[4], box[5]))
    return smoothOnly ? { material, geometry, smoothOnly } : { material, geometry }
  })
}

export function unpackWorld(payload) {
  return { ...payload, batches: unpackBatches(payload.batches), detailBatches: unpackBatches(payload.detailBatches ?? []) }
}

/** 室內細部（按需載入）只有依材質合併的網格（以及精緻模式才顯示的細小擺飾） */
export function packInterior(interior) {
  const transfer = []
  const batches = packBatches(interior.batches, transfer)
  const detailBatches = packBatches(interior.detailBatches ?? [], transfer)
  return { payload: { ...interior, batches, detailBatches }, transfer }
}

export function unpackInterior(payload) {
  return { ...payload, batches: unpackBatches(payload.batches), detailBatches: unpackBatches(payload.detailBatches ?? []) }
}
