import { COURT_D, XH_FLOOR_Y, XH_HALL, hz } from './xiaHaiLayout.js'
import { TEMPLE_COURT, templeCourtToWorld } from './squidSoupLayout.js'

/**
 * 慈聖宮的殿內配置（第 11 階段；查證與設計見 docs/research/interior-ci-sheng-gong.md）
 *
 * 街上的廟沿用本站的廟宇原型（specials.js 的 buildTemple，寬 12 m），與霞海城隍廟同一個殿身：
 * 廟埕深 6.2 m，後面是台基上的殿（地面比廟埕高 0.45 m）。真實的慈聖宮是前殿、正殿、兩廊加左右護龍的合院；
 * 本站只做「三川殿 → 中庭（兩廊）→ 正殿」一條軸線，壓在 8 m 的殿深裡（尺度是示意，護龍與側殿不做）：
 *   三川殿 z -1.9 … -2.6：中門、門上的匾「惠澤覃敷」
 *   中庭   z -2.6 … -4.2：兩廊各一對同治六年的石柱（右柱有字）
 *   正殿   z -4.2 … -7.85：黑色圓木柱、媽祖神龕、黑色長供桌；到供桌前約 1 m 為止，神龕一帶不能進去
 * 四個年代同一套格局、依年代老化與增減（variant）：酒樓繁華、摩登、庶民生活、老屋新生。
 * 光明燈從庶民生活起（戰後，年代查無，標推定），宮燈、拱門與供品只在老屋新生（2025 年的照片）。
 *
 * 本地座標（同霞海城隍廟）：原點在廟的臨街中心，+z 朝街道，廟埕與殿在 -z；殿的本地座標 z 以殿前的台基正面為 0，
 * 殿內淨空 z -1.9 … -7.85；從街上正對廟時 +x 是右手邊。
 */

export { COURT_D, XH_FLOOR_Y as CS_FLOOR_Y, hz }

/** 殿的外殼（與霞海城隍廟相同；沒有偏殿） */
export const CS_HALL = {
  room: XH_HALL.room,
  frontWallZ: XH_HALL.frontWallZ,
  door: XH_HALL.door,
  wallTop: XH_HALL.wallTop,
  splitZ: XH_HALL.splitZ,
  porch: XH_HALL.porch,
  steps: XH_HALL.steps,
  columns: XH_HALL.columns,
  /** 信眾走到這裡為止（供桌前約 1 m）；以後是神龕一帶 */
  limitZ: -5.1,
}

export const CS_ID = 'ci-sheng-gong'
/** 有殿內的四個年代，依時間排序 */
export const CS_ERAS = ['banquet', 'modern', 'postwar', 'revival']
/** 殿內依年代老化：新廟（1914 起建、1916 落成）→ 燻黑 → 重修（1994 前殿重修） */
export const CS_AGE = { banquet: 'new', modern: 'mature', postwar: 'aged', revival: 'restored' }

const since = (eraId) => CS_ERAS.indexOf(eraId)

/**
 * 殿內的器物清單（殿的本地座標；y 從殿內地面算起）。同一份清單產生模型、障礙物與鏡頭遮擋。
 * from：從哪個年代起才有（沒有就是四個年代都有）。
 * 不畫的東西（研究文件第 6、8、9 節）：鎮殿以外沒有出處的配祀神像、四尊大型神將（垂簾）、哼哈二將、門神圖案、關帝殿等側殿；供品只在老屋新生。
 */
export const CS_ITEMS = [
  // ── 中庭：兩廊各一對同治六年的石柱（右柱楷書、左柱篆書）──
  { type: 'stonePillar', x: 2.7, z: -2.95, script: 'regular' },
  { type: 'stonePillar', x: -2.7, z: -2.95, script: 'seal' },
  { type: 'stonePillar', x: 2.7, z: -3.95, script: 'plain' },
  { type: 'stonePillar', x: -2.7, z: -3.95, script: 'plain' },
  // ── 正殿 ──
  { type: 'roundPillar', x: -3.5, z: -4.8 },
  { type: 'roundPillar', x: 3.5, z: -4.8 },
  { type: 'roundPillar', x: -3.5, z: -6.6 },
  { type: 'roundPillar', x: 3.5, z: -6.6 },
  { type: 'mazuShrine', x: 0, z: -7.3 },
  { type: 'altarLong', x: 0, z: -6.4 },
  // 右側牆：照片裡一排四尊大型神將，身分只有部落格級的說法，不畫，垂簾示意（使用者 2026-11-05，比照霞海城隍廟）
  { type: 'wallCurtain', x: 4.97, z: -5.8, block: false },
  // 神將前的長案與深色圓爐（2025 年的照片，只有遠景；形制待核）
  { type: 'sideTable', x: 4.55, z: -4.65 },
  { type: 'cushion', x: -0.45, z: -4.85, block: false },
  { type: 'cushion', x: 0.45, z: -4.85, block: false },
  // 光明燈塔（供桌兩側各二座；戰後起，年代查無，標推定）
  { type: 'lightTower', x: -1.95, z: -6.0, from: 'postwar' },
  { type: 'lightTower', x: -1.95, z: -6.8, from: 'postwar' },
  { type: 'lightTower', x: 1.95, z: -6.0, from: 'postwar' },
  { type: 'lightTower', x: 1.95, z: -6.8, from: 'postwar' },
  // 弧形黑木拱門（2025 年的照片；年代查無，只在老屋新生）
  { type: 'arch', x: 0, z: -4.55, from: 'revival' },
]

/** 這個年代的器物清單 */
export function csItemsFor(eraId) {
  return CS_ITEMS.filter((item) => !item.from || since(eraId) >= since(item.from))
}

/** 殿內的人物（不具名；每個年代一位） */
export const CS_NPCS = {
  banquet: { id: 'cs-banquet-caretaker', look: 'csCaretaker', pose: 'stand', x: -1.2, z: -3.9, rotationY: -Math.PI / 2 },
  modern: { id: 'cs-modern-worshipper', look: 'csWorshipperModern', pose: 'stand', x: 1.7, z: -4.75, rotationY: Math.PI },
  postwar: { id: 'cs-postwar-grandma', look: 'csGrandma', pose: 'stand', x: -1.7, z: -4.75, rotationY: Math.PI },
  revival: { id: 'cs-revival-visitor', look: 'csVisitor', pose: 'stand', x: -1.15, z: -2.95, rotationY: 0 },
}

/** 殿內的人物清單（依年代） */
export const csNpcFor = (eraId) => (CS_NPCS[eraId] ? [CS_NPCS[eraId]] : [])

/** 廟的地段（shops.js：position x 4、z 4.5，旋轉 π）：殿的本地座標（x, z）→ 世界座標 */
export const CS_SITE = TEMPLE_COURT
export function csToWorld(x, z) {
  return templeCourtToWorld(x, hz(z))
}

/** 殿內的地面高度（台基上）→ 世界座標的 [x, y, z] */
const at = (x, y, z) => {
  const p = csToWorld(x, z)
  return [p.x, XH_FLOOR_Y + y, p.z]
}
const Y = XH_FLOOR_Y
const shot = (position, target) => ({ position, target })

/**
 * 殿內的資訊熱點（廟埕本地座標，同 ciShengMiaokouData.js 的 CI_SHENG_HOTSPOT：由 hotspotsToWorld 轉成世界座標）。
 * 章節都是廟的沿革（temple）；history 熱點說明年代錯位（廟在 1914 年才遷到日新街，街上整個年代有廟是情境示意）。
 */
export const CS_INTERIOR_HOTSPOTS = [
  {
    id: 'hall',
    label: '正殿與媽祖神龕',
    labelEn: 'The main hall and the Mazu shrine',
    note: '三川殿、中庭、正殿一條軸線；尺度是示意，正殿的匾「海國陽春」與 1920 年平樂社獻的「惠澤覃敷」匾依照片',
    noteEn: 'An axis of entrance hall, court and main hall; the scale is illustrative, while the plaques “Hai guo yang chun” and the 1920 “Grace spreads wide” from the Pingle Society follow photographs',
    chapter: 'temple',
    radius: 1.2,
    point: [0, hz(-4.6)],
    prompt: [0, Y + 2.5, hz(-4.6)],
    camera: shot([1.8, Y + 1.7, hz(-2.4)], [0, Y + 2.0, hz(-7.0)]),
  },
  {
    id: 'history',
    label: '廟的來歷：1914 年起才遷到這裡',
    labelEn: 'The temple’s story: it moved here only from 1914',
    note: '1895–1909 年廟還在舊址（中街、南街一帶，今民樂街口）；1909 年拆除，1914 年起在這裡重建，1916 年落成（廟方；文資網寫 1914）。街上整個年代都有廟是情境示意',
    noteEn: 'From 1895 to 1909 the temple still stood at its old site (near Zhongjie and Nanjie, today’s Minle Street); pulled down in 1909, it was rebuilt here from 1914 and finished in 1916 (the temple’s account; the heritage register says 1914). Having it on the street for the whole era is an illustration',
    chapter: 'temple',
    radius: 1.1,
    point: [-3.7, hz(-3.45)],
    prompt: [-3.7, Y + 2.3, hz(-3.45)],
    camera: shot([-0.6, Y + 1.6, hz(-2.5)], [-3.6, Y + 1.5, hz(-3.9)]),
  },
]

/** 殿內可以近看的器物的位置（世界座標）；id 的後綴是年代 */
export const CS_INSPECT_SPOTS = {
  'cs-shrine': { position: at(0, 1.8, -6.6), prompt: at(0.9, 1.6, -5.0), radius: 2.9 },
  'cs-censer': { position: at(4.55, 1.0, -4.65), prompt: at(3.9, 1.6, -4.4), radius: 1.9 },
  'cs-pillars': { position: at(2.7, 1.3, -2.95), prompt: at(1.8, 1.9, -3.0), radius: 1.5 },
  'cs-plaque': { position: at(0, 2.9, -1.95), prompt: at(-0.8, 2.2, -2.8), radius: 1.3 },
}

export { TEMPLE_COURT }
