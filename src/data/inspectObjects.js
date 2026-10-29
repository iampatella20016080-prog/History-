/**
 * 器物 3D 檢視的器物資料（第 10 階段）：標題、說明、小動作與出處。
 * 3D 模型在 game/builders/inspectObjects.js（程式建模，對照照片與文獻，不用 AI 生成的模型）；
 * 檢視的狀態在 game/objectInspect.js。
 *
 * reconstruction：形制查無、依文獻描述與一般樣式重建的器物，介面標「歷史情境重建」。
 */

export const INSPECT_OBJECTS = {
  'tea-chest': {
    id: 'tea-chest',
    title: '外銷茶箱',
    titleEn: 'Export tea chest',
    lead: '松木箱裡襯焊封的薄鉛防潮，外頭裱上彩色印花紙——一箱約四十磅的烏龍茶，就這樣飄洋過海。',
    leadEn: 'A pine chest lined with soldered lead against the damp, pasted over with colourful papers—about forty pounds of oolong, bound across the sea.',
    actions: [{ id: 'lid', label: '打開箱蓋', labelEn: 'Open the lid', doneLabel: '蓋上箱蓋', doneLabelEn: 'Close the lid' }],
    paragraphs: [
      'Davidson（1903）記載，外銷的茶裝在內襯薄鉛的木箱裡，鉛襯焊封防潮；箱外裱紙、印上商號與圖案，半箱（half-chest）約裝四十磅茶。',
      '箱子的實際長寬高查無：模型是依約四十磅茶葉估的比例，外箱圖案依「德記洋行茶箱籤」的風格設計，都是歷史情境重建。',
    ],
    reconstruction: true,
    sourceIds: ['davidson-formosa-1903', 'demomy-tait-tea-label'],
  },
  'rice-measure': {
    id: 'rice-measure',
    title: '米斗',
    titleEn: 'Rice measure',
    lead: '上寬下窄的木斗，四片木板拼接、角上包著金屬角件；量米時倒滿再刮平，一斗就是一個固定的量。',
    leadEn: 'A wooden measure, wider at the mouth, four boards joined with metal corner fittings; filled and struck level, one dou is one fixed amount.',
    actions: [{ id: 'flip', label: '翻過來看斗底', labelEn: 'Turn it over', doneLabel: '翻回正面', doneLabelEn: 'Turn it back' }],
    paragraphs: [
      '「斗」是計算容量的單位，十升為一斗、十斗為一石；「米斗」是形狀像斗、用來量米的木器（教育部《重編國語辭典修訂本》）。',
      '場景中的米斗是示意的模型，不代表某一件實際的器物或容量。',
    ],
    reconstruction: true,
    sourceIds: ['moe-dou'],
  },
}

export function getInspectObject(id) {
  return INSPECT_OBJECTS[id] ?? null
}

/**
 * 街上可以近看的器物（不屬於店家介紹的章節）：走近出現提示，點開 3D 檢視。
 * position 是世界座標；只在 eraId 的年代出現。
 */
export const STREET_INSPECTABLES = [
  {
    id: 'wharf-tea-chest',
    eraId: 'qing-port',
    objectId: 'tea-chest',
    label: '剛卸下的茶箱',
    labelEn: 'Fresh-landed tea chest',
    // 碼頭南側榕樹旁剛卸下的一小堆（qingWharfLayout.js 的 TEA_STACKS south）
    position: [-43.0, 0.5, -4.2],
    prompt: [-43.0, 1.3, -4.2],
    radius: 2.4,
  },
]

export function inspectablesOfEra(eraId) {
  return STREET_INSPECTABLES.filter((item) => item.eraId === eraId)
}

export function getInspectable(id) {
  return STREET_INSPECTABLES.find((item) => item.id === id) ?? null
}
