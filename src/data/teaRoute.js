/**
 * 主題探索路線「一箱茶的旅程」（第 10 階段）：
 * 碼頭聽挑夫說消息 → 打開茶箱近看 → 寶順洋行 → 林華泰茶行 → 讀一則有出處的外銷消息。
 * 節點順序自由（themeRoute.js）；完成的判定是探索手記的條目 id。
 * 沿用 shops.js 的 `tea` 主題；之後的主題路線照同樣的格式加進 ROUTES。
 */

export const TEA_ROUTE = {
  id: 'tea',
  title: '一箱茶的旅程',
  titleEn: 'The Journey of a Tea Chest',
  intro: '1853–1895 年的港口商街：跟著一箱烏龍茶，從碼頭的挑夫、洋行的精製茶廠，走到茶行的秤茶桌，看臺灣茶怎麼飄洋過海。',
  introEn: 'Follow a chest of oolong through the treaty-port years: from the wharf porters and the foreign hong to the tea firm’s scales.',
  eraId: 'qing-port',
  nodes: [
    {
      id: 'porters',
      kind: 'talk',
      journalIds: ['talk:qing-porter-pole', 'talk:qing-porter-rest', 'talk:qing-porter-stack'],
      title: '碼頭聽挑夫說消息',
      titleEn: 'Hear the porters at the wharf',
      hint: '往西走到河岸碼頭，找一位挑夫說說話。',
      npcIds: ['qing-wharf-pole-pier', 'qing-wharf-rest-north', 'qing-wharf-stack-south'],
    },
    {
      id: 'chest',
      kind: 'object',
      journalIds: ['object:tea-chest'],
      title: '打開茶箱近看',
      titleEn: 'Open a tea chest',
      hint: '碼頭南側榕樹旁，有一箱剛卸下的茶。',
      inspectableId: 'wharf-tea-chest',
    },
    {
      id: 'dodd',
      kind: 'shop',
      journalIds: ['shop:dodd-tea-house@qing-port'],
      title: '走進寶順洋行',
      titleEn: 'Visit Dodd & Co.',
      hint: '北側街上的兩層洋樓：陶德與李春生把烏龍茶賣到紐約。',
      shopId: 'dodd-tea-house',
    },
    {
      id: 'linhuatai',
      kind: 'shop',
      journalIds: ['shop:lin-hua-tai@qing-port'],
      title: '走進林華泰茶行',
      titleEn: 'Visit Lin Hua Tai',
      hint: '街的西段：1883 年起做毛茶的篩選與精製。',
      shopId: 'lin-hua-tai',
    },
    {
      id: 'news',
      kind: 'news',
      journalIds: ['news:oolong-1869'],
      title: '讀一則外銷消息',
      titleEn: 'Read an export dispatch',
      hint: '在寶順洋行讀「洋行與茶」：1869 年烏龍茶運往紐約。',
      shopId: 'dodd-tea-house',
    },
  ],
}

export const ROUTES = [TEA_ROUTE]

export function getRoute(id) {
  return ROUTES.find((route) => route.id === id) ?? null
}
