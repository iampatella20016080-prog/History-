/**
 * 器物資訊的分層（第 11 階段；林華泰茶行是第一個完整範例，之後其他店家的器物直接套用）
 *
 * 器物資料（data/inspectObjects.js 的 INSPECT_OBJECTS）可以有 layers：
 *   layers: {
 *     form:     [note, ...]  外觀構造
 *     making:   [note, ...]  食材與做法
 *     use:      [note, ...]  使用場合
 *     where:    [note, ...]  在哪家店可以接觸到（街上擺著這件器物的店家與年代由 inspectPlaces 自動列出，這裡寫補充）
 *     evidence: [note, ...]  照片與文獻（沒查證的標 pending「待核」）
 *   }
 *   note = { text, textEn, sourceIds?: [...], status?: 'oral' | 'hearsay' | 'pending' | 'reconstruction' }
 *
 * status 會在畫面上標出：家族口述、據說、待核、歷史情境重建；沒有 status 的是有出處的敘述。
 * 沒有 layers 的舊器物維持原本的「說明與出處」（paragraphs）。
 */
export const INSPECT_LAYERS = [
  { id: 'form', title: '外觀構造', titleEn: 'Form and construction' },
  { id: 'making', title: '食材與做法', titleEn: 'Ingredients and making' },
  { id: 'use', title: '使用場合', titleEn: 'When it was used' },
  { id: 'where', title: '在哪家店可以接觸到', titleEn: 'Where to find it' },
  { id: 'evidence', title: '照片與文獻', titleEn: 'Photos and sources' },
]

export const NOTE_STATUS = {
  oral: { label: '家族口述', labelEn: 'Family oral history' },
  hearsay: { label: '據說', labelEn: 'Reportedly' },
  pending: { label: '待核', labelEn: 'To be verified' },
  reconstruction: { label: '歷史情境重建', labelEn: 'Reconstructed historical scene' },
}

/** 這件器物某一層的說明（沒有時是空陣列） */
export function layerNotes(object, layerId) {
  return object?.layers?.[layerId] ?? []
}

/** 器物的分層資訊是否完整（五層都有內容；「在哪家店」可以由街上的擺放自動列出） */
export function hasFullLayers(object, places = []) {
  if (!object?.layers) return false
  return INSPECT_LAYERS.every(({ id }) => layerNotes(object, id).length > 0 || (id === 'where' && places.length > 0))
}

/** 分層資訊裡引用的所有出處（照片與文獻層列出的出處，依出現順序、不重複） */
export function layerSourceIds(object) {
  const ids = []
  for (const { id } of INSPECT_LAYERS) {
    for (const note of layerNotes(object, id)) for (const sourceId of note.sourceIds ?? []) if (!ids.includes(sourceId)) ids.push(sourceId)
  }
  for (const sourceId of object?.sourceIds ?? []) if (!ids.includes(sourceId)) ids.push(sourceId)
  return ids
}
