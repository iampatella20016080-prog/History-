import { ERAS } from './eras.js'
import { SHOPS, getShop, shopYearText } from './shops.js'

/**
 * 總覽頁的資料（純資料，沒有 React／Three）：
 * - 年表：五個年代的區間、所有店家的創立年份，以及幾個有出處的大事
 * - 對照地圖：遊戲街景是情境示意，地圖依文獻裡的門牌標出店家的真實位置（簡化的街道示意圖，不按比例）
 */

/** 年表上店家以外的大事；每一條都要有 sources.js 裡的出處 */
export const TIMELINE_EVENTS = [
  { year: 1853, text: '艋舺頂下郊拚，同安人隨林右藻移居大稻埕。', sourceIds: ['ith-lin-fu-zhen'] },
  { year: 1862, text: '滬尾正式設關開埠（1858年天津條約開放，通稱1860年淡水開港）。', sourceIds: ['tshs-zhang-tamsui-port'] },
  { year: 1868, text: '陶德把精製茶廠設在大稻埕。', sourceIds: ['ntcri-73-tea-road'] },
  { year: 1869, text: '臺灣烏龍茶運往紐約，「Formosa Oolong」打開美國市場。', sourceIds: ['tcmb-tea-trade', 'twcenter-muzha-tea-2001'] },
  { year: 1881, text: '同安茶商在大稻埕設源隆行，專製包種茶外銷。', sourceIds: ['tcmb-tea-trade'] },
  { year: 1889, text: '林維源與李春生成立建昌公司，建昌街、千秋街（今貴德街）成為洋樓街。', sourceIds: ['chen-ciyu-li-family-2015'] },
  { year: 1896, text: '日本人調查：大稻埕茶商252店、從業3,612人。', sourceIds: ['chen-ciyu-li-family-2015'] },
  { year: 1935, text: '李春生紀念教會在貴德街設立。', sourceIds: ['pct-li-chunsheng-church'] },
  { year: 1976, text: '江山樓拆除。', sourceIds: ['wiki-jiang-shan-lou'] },
  { year: 1985, text: '永樂市場現在的大樓開業。', sourceIds: ['tcma-yongle-market'] },
  { year: 2009, text: '新芳春茶行指定為直轄市定古蹟。', sourceIds: ['nchdb-xinfangchun'] },
  { year: 2016, text: '新芳春茶行修復後開放參觀。', sourceIds: ['pts-xinfangchun-2016'] },
]

/** 年份落在哪個年代（年代的起始年歸該年代；1980–2000 之間沒有年代） */
export function eraForYear(year) {
  const bounds = [
    ['qing-port', 1853, 1895],
    ['banquet', 1895, 1930],
    ['modern', 1930, 1945],
    ['postwar', 1945, 1980],
    ['revival', 2000, Infinity],
  ]
  for (let i = bounds.length - 1; i >= 0; i--) {
    const [id, start, end] = bounds[i]
    if (year >= start && year < end) return id
  }
  return null
}

/** 店家在哪些年代出現（同一棟店屋有 eras 的店家也算） */
export function shopEraIds(shop) {
  return ERAS.map((era) => era.id).filter((eraId) => era_has(shop, eraId))
}

function era_has(shop, eraId) {
  return ERAS.find((era) => era.id === eraId)?.availableStores.includes(shop.id) ?? false
}

/**
 * 年表：依年份排序的項目。store 項目來自 SHOPS 的 year（沒有年份的店家另外列在 undated）；
 * event 項目來自 TIMELINE_EVENTS。
 */
export function getTimeline() {
  const dated = []
  const undated = []
  for (const shop of SHOPS) {
    const item = { kind: 'shop', shopId: shop.id, name: shop.name, year: shop.year ?? null, label: shopYearText(shop), eraIds: shopEraIds(shop), status: shop.status, heritage: shop.kind === 'heritage' }
    if (typeof shop.year === 'number') dated.push(item)
    else undated.push(item)
  }
  const events = TIMELINE_EVENTS.map((event) => ({ kind: 'event', ...event }))
  const items = [...dated, ...events].sort((a, b) => a.year - b.year || (a.kind === 'event' ? -1 : 1))
  return { items, undated }
}

/** 年表依年代分組（1980–2000 之間的項目歸到「老屋新生」之前的空檔，標 between） */
export function getTimelineByEra() {
  const { items, undated } = getTimeline()
  const groups = ERAS.map((era) => ({ era, items: [] }))
  const between = []
  for (const item of items) {
    const eraId = eraForYear(item.year)
    const group = groups.find((g) => g.era.id === eraId)
    if (group) group.items.push(item)
    else between.push(item)
  }
  return { groups, between, undated }
}

/**
 * 對照地圖：簡化的街道示意圖（座標 0–100，x 向東、y 向南；不按比例）。
 * 街道只畫故事裡提到的幾條；河在西邊。
 */
export const MAP_STREETS = [
  { id: 'river', name: '淡水河', kind: 'river', points: [[6, 0], [5, 100]] },
  { id: 'guide', name: '貴德街', points: [[14, 30], [14, 88]] },
  { id: 'xining', name: '西寧北路', points: [[25, 10], [25, 95]] },
  { id: 'dihua', name: '迪化街一段', points: [[38, 4], [38, 95]] },
  { id: 'minle', name: '民樂街', points: [[47, 60], [47, 92]] },
  { id: 'yanping', name: '延平北路二段', points: [[58, 4], [58, 95]] },
  { id: 'chongqing', name: '重慶北路二段', points: [[80, 4], [80, 95]] },
  { id: 'minquan', name: '民權西路', points: [[8, 8], [96, 8]] },
  { id: 'liangzhou', name: '涼州街', points: [[14, 28], [96, 28]] },
  { id: 'baoan', name: '保安街', points: [[58, 42], [96, 42]] },
  { id: 'guisui', name: '歸綏街', points: [[14, 54], [96, 54]] },
  { id: 'minsheng', name: '民生西路', points: [[8, 68], [96, 68]] },
  { id: 'nanjing', name: '南京西路', points: [[8, 92], [96, 92]] },
]

/**
 * 地圖上的地點：address 是文獻裡的門牌（sourceIds 是出處）；precision 'address' 表示依門牌標示，
 * 'approx' 表示文獻只寫到街名或巷名（或門牌未核實），位置是示意。
 */
export const MAP_PLACES = [
  { id: 'yongle', shopIds: ['yong-le-market', 'hao-guo-yuan'], name: '永樂市場・好粿緣', address: '迪化街一段21號', x: 41, y: 84, precision: 'address', sourceIds: ['tcma-yongle-market'] },
  { id: 'lao-pan', shopIds: ['lao-pan-squid-soup'], name: '老潘魷魚羹', address: '迪化街一段30號', x: 35, y: 79, precision: 'address', sourceIds: ['walkerland-2021-laopan'] },
  { id: 'luguo', shopIds: ['luguo-cafe'], name: '爐鍋咖啡（小藝埕）', address: '迪化街一段32巷1號', x: 34, y: 75, precision: 'address', sourceIds: ['storm-2018-luguo'] },
  { id: 'yongle-mtm', shopIds: ['yong-le-mi-tai-mu'], name: '永樂米苔目', address: '民樂街111號', x: 47, y: 74, precision: 'address', sourceIds: ['bella-2021-yongle-market'] },
  { id: 'xinfangchun', shopIds: ['xin-fang-chun'], name: '新芳春茶行', address: '民生西路309號', x: 50, y: 68, precision: 'address', sourceIds: ['nchdb-xinfangchun'] },
  { id: 'bolero', shopIds: ['bolero'], name: '波麗路', address: '民生西路314號', x: 52, y: 70, precision: 'address', sourceIds: ['boch-bolero'] },
  { id: 'shizixuan', shopIds: ['shizixuan'], name: '十字軒糕餅舖', address: '延平北路二段68號', x: 58, y: 64, precision: 'address', sourceIds: ['mirrormedia-2024-shizixuan'] },
  { id: 'wangtea', shopIds: ['you-ji'], name: '有記名茶', address: '重慶北路二段64巷26號', x: 80, y: 62, precision: 'address', sourceIds: ['wangtea-transformation'] },
  { id: 'linhuatai', shopIds: ['lin-hua-tai'], name: '林華泰茶行', address: '重慶北路二段193號', x: 80, y: 40, precision: 'address', sourceIds: ['linhuatai-site'] },
  { id: 'cisheng', shopIds: ['ci-sheng-gong', 'temple-squid-stall', 'temple-mi-tai-mu-stall', 'temple-douhua-stall', 'temple-kueh-stall'], name: '慈聖宮與廟口小吃', address: '保安街49巷17號', x: 66, y: 42, precision: 'address', sourceIds: ['wiki-ci-sheng-gong'] },
  { id: 'ziyang', shopIds: ['zi-yang'], name: '滋養豆餡舖', address: '迪化街一段247號（涼州街口）', x: 40, y: 30, precision: 'address', sourceIds: ['ziyang-about'] },
  { id: 'action-bar', shopIds: ['action-bar', 'huang-yujie-museum'], name: '導演的豆花店・黃玉階文史館', address: '迪化街一段224巷24號（文史館門牌未核實）', x: 43, y: 35, precision: 'approx', sourceIds: ['tcooc-action-bar'] },
  { id: 'rice-and-shine', shopIds: ['rice-and-shine-329'], name: '稻舍（迪化街329號店屋）', address: '迪化街一段329號', x: 40, y: 18, precision: 'address', sourceIds: ['moc-329-shophouse'] },
  { id: 'li-church', shopIds: ['dodd-tea-house'], name: '李春生紀念教會', address: '貴德街44號', x: 14, y: 78, precision: 'address', sourceIds: ['pct-li-chunsheng-church'] },
  { id: 'dodd', shopIds: ['dodd-tea-house'], name: '洋行區（建昌街・千秋街）', address: '今貴德街一帶，洋行與茶行的確切門牌未載', x: 14, y: 46, precision: 'approx', sourceIds: ['chen-ciyu-li-family-2015'] },
]

/** 沒有查到門牌、所以地圖上沒有標示的店家 */
export function getUnmappedShops() {
  const mapped = new Set(MAP_PLACES.flatMap((place) => place.shopIds))
  return SHOPS.filter((shop) => !mapped.has(shop.id)).map((shop) => ({ id: shop.id, name: shop.name }))
}

/** 地點對應的店家物件（過濾掉不存在的 id） */
export function getPlaceShops(place) {
  return place.shopIds.map((id) => getShop(id)).filter(Boolean)
}
