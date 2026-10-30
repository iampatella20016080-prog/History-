/**
 * 歷史時期（年代）資料
 *
 * 五個年代共用同一條基本街道，切換時由這份資料決定：
 * - palette      色彩（介面點綴色、場景主色）
 * - lighting     光線、天空、霧氣、調色與夜間燈火強度
 * - buildingStyle 街屋的演變規則（翻修為何種樣式、新舊程度、招牌風格與行業字）
 * - streetProps  街道鋪面、路燈、電線與街道道具
 * - availableStores 這個年代出現在街上的店家（id 對應 shops.js）
 *
 * 太陽方位角 azimuth：0 = 北（-z）、90 = 東（+x）、180 = 南（+z）、270 = 西（-x，淡水河方向）。
 */
export const ERAS = [
  {
    id: 'qing-port',
    order: 1,
    chapter: 'Chapter 01',
    yearRange: '1853–1895',
    title: '港口商街',
    description: '清末移民、茶葉、南北貨與港口貿易',
    mood: '古樸典雅、熙來攘往，像一幅清末商街的風俗畫。',
    palette: {
      accent: '#a9442f',
      scene: ['#c9973f', '#a85a3e', '#5b3d29', '#8fa996'], // 琥珀金、赭紅、深木棕、柔和青綠
    },
    lighting: {
      timeOfDay: '午後斜陽',
      sun: { azimuth: 228, elevation: 44, color: '#ffeccc', intensity: 2.6 },
      hemi: { sky: '#e4ecea', ground: '#c9ae86', intensity: 1.7 },
      ambient: { color: '#fff3e2', intensity: 0.16 },
      sky: { top: '#b9cfd0', horizon: '#f0e2c6', bottom: '#e6dcc4', sunGlow: '#ffd9a0', stars: 0 },
      fog: { color: '#e9dcc0', near: 42, far: 400 },
      mountains: '#f2ecdc',
      water: '#c9dcd2',
      clouds: { color: '#fff8ec', emissive: '#d8cbb3' },
      grade: { exposure: 1.0, saturation: 0.92, contrast: 1.0, tint: [1.035, 1.0, 0.94], vignette: 0.17 },
      lines: { color: '#2b211a', strength: 0.82 },
      glow: 0.12,
      riverMist: 0.35,
      // 空氣遠近感（精緻畫質）：清末河港偏濕，貼地的水氣較濃；午後太陽高，光束幾乎看不到
      air: { density: 0.0062, start: 14, heightFalloff: 0.07, max: 0.66, desaturate: 0.42, horizon: 0.35, sunScatter: 0.35, rays: 0.35 },
    },
    buildingStyle: {
      rebuild: {},
      condition: 'new',
      signStyles: ['wood', 'lacquer', 'red', 'wood'],
      hangingSignStyles: ['wood', 'cloth', 'red'],
      signWords: ['茶', '米', '布', '油', '糖', '藥材', '雜貨', '竹器', '海味', '陶器', '香燭', '金紙', '豆', '油紙'],
      banners: 0.35,
      lanterns: 0.32,
    },
    streetProps: {
      ground: 'stone-earth',
      lamps: null,
      wires: false,
      lanternStrings: false,
      items: ['teaChests', 'sacks', 'baskets', 'jars', 'handcart', 'carryingPole'],
      boats: 'qingWharf',
    },
    availableStores: ['lin-fu-zhen', 'dodd-tea-house', 'xia-hai-cheng-huang', 'lin-hua-tai'],
  },
  {
    id: 'banquet',
    order: 2,
    chapter: 'Chapter 02',
    yearRange: '1895–1930',
    title: '酒樓繁華',
    description: '酒樓、宴席、仕紳社交與城市繁榮',
    mood: '傍晚入夜，暖黃燈火從窗內灑出，繁華而典雅。',
    palette: {
      accent: '#8e2f2c',
      scene: ['#7c2a2a', '#b08a4a', '#2f4a3c', '#f2e6cf'], // 酒紅、古銅金、深綠、暖白
    },
    lighting: {
      timeOfDay: '傍晚入夜',
      // 第 9 階段調光：陽光略強、半球光減弱，讓直射與背光的立面分得出來；地面反光改成中性的暗灰，不再整片偏紅
      sun: { azimuth: 262, elevation: 6, color: '#ffa872', intensity: 0.95 },
      hemi: { sky: '#8e9bd2', ground: '#57535e', intensity: 1.85 },
      ambient: { color: '#a9b4e4', intensity: 0.4 },
      // 冷色補光：從北北東方向照亮背光的立面（夕陽的暖光與冷色陰影形成對比）
      fill: { color: '#8ea8e6', intensity: 0.95, azimuth: 35, elevation: 30 },
      sky: { top: '#2c3a66', horizon: '#ee9a66', bottom: '#544860', sunGlow: '#ff9a62', stars: 0.85 },
      fog: { color: '#625f7a', near: 30, far: 270 },
      mountains: '#6e6d8e',
      water: '#5f7398',
      clouds: { color: '#c2a6b0', emissive: '#5a4658' },
      // 分離色調：暗部偏藍、亮部（燈火、夕照）偏暖；暗部稍微提亮，騎樓下不會糊成一片黑
      grade: {
        exposure: 1.1,
        saturation: 1.0,
        contrast: 1.1,
        tint: [1.0, 0.99, 0.995],
        vignette: 0.24,
        shadowTint: [0.9, 0.96, 1.12],
        highlightTint: [1.07, 1.0, 0.9],
        lift: 0.04,
      },
      // 材質明度：屋瓦與木作壓暗、灰泥與洗石子提亮，紅磚稍微收一點，立面的層次看得出來
      materialValue: { plaster: 1.14, stucco: 1.12, granite: 1.08, stone: 1.05, brick: 0.96, wood: 0.88, planks: 0.9, roof: 0.88, tile: 0.92, lattice: 0.9 },
      lines: { color: '#1e1620', strength: 0.74 },
      glow: 1.0,
      lanternGlow: 0.75, // 燈籠、燈泡與光暈的亮度調降約 25%
      riverMist: 0.25,
      // 空氣遠近感（精緻畫質）：傍晚的暮色往藍紫退，朝夕陽的方向偏暖；斜陽穿過騎樓與巷口的光束最明顯
      air: { density: 0.006, start: 12, heightFalloff: 0.05, max: 0.6, desaturate: 0.45, horizon: 0.3, sunScatter: 0.75, rays: 0.95 },
    },
    buildingStyle: {
      rebuild: { minnan: { baroque: 0.55 } },
      condition: 'mature',
      signStyles: ['gold', 'lacquer', 'red', 'gold'],
      hangingSignStyles: ['red', 'lacquer', 'wood'],
      signWords: ['茶行', '布莊', '銀樓', '漢藥', '洋服', '料理', '旅館', '海產', '雜貨', '茶館', '米商'],
      banners: 0.1,
      lanterns: 0.7,
    },
    streetProps: {
      ground: 'stone',
      lamps: 'electric-pole',
      wires: false,
      lanternStrings: true,
      items: ['rickshaws', 'pottedPlants', 'teaHouseTables', 'vendorCart', 'teaChests'],
      boats: 'junks',
    },
    // 李亭香不在日治、戰後的名錄：店家早年可能在蘆洲（docs/research/li-ting-xiang.md），街上的店屋保留為一般餅舖
    availableStores: ['lin-fu-zhen', 'jiang-shan-lou', 'qian-yuan-yao-hang', 'ci-sheng-gong', 'you-ji', 'lin-hua-tai', 'rice-and-shine-329'],
  },
  {
    id: 'modern',
    order: 3,
    chapter: 'Chapter 03',
    yearRange: '1930–1945',
    title: '摩登大稻埕',
    description: 'Art Deco 建築、西餐、咖啡與新文化',
    mood: '黃昏的金色光線，咖啡館與西餐廳的窗內透出暖光，浪漫而時髦。',
    palette: {
      accent: '#2f6b5a',
      scene: ['#f1e8d6', '#2f6b5a', '#7a2e33', '#d6b77a'], // 奶油白、祖母綠、酒紅、香檳金
    },
    lighting: {
      timeOfDay: '黃昏',
      // 第 9 階段調光：太陽稍強、半球光減弱並去掉地面的橘紅反光，加一道冷色補光，背光面偏藍灰
      sun: { azimuth: 252, elevation: 14, color: '#ffcb8c', intensity: 2.15 },
      hemi: { sky: '#c3c6de', ground: '#8a8178', intensity: 1.5 },
      ambient: { color: '#e9e3ec', intensity: 0.22 },
      fill: { color: '#a8b6e0', intensity: 0.42, azimuth: 40, elevation: 28 },
      sky: { top: '#7f8fb8', horizon: '#f6c38e', bottom: '#d9b7a0', sunGlow: '#ffc07a', stars: 0.1 },
      fog: { color: '#dcc6b2', near: 34, far: 330 },
      mountains: '#c9a9a6',
      water: '#b9b2a8',
      clouds: { color: '#ffd9bd', emissive: '#a77d72' },
      grade: {
        exposure: 1.06,
        saturation: 0.96,
        contrast: 1.08,
        tint: [1.015, 1.0, 0.965],
        vignette: 0.2,
        shadowTint: [0.94, 0.98, 1.07],
        highlightTint: [1.04, 1.0, 0.94],
        lift: 0.015,
      },
      materialValue: { plaster: 1.08, stucco: 1.08, granite: 1.05, brick: 0.95, wood: 0.88, planks: 0.92, roof: 0.84, tile: 0.94, lattice: 0.92 },
      lines: { color: '#2a1d18', strength: 0.8 },
      glow: 0.62,
      riverMist: 0.2,
      // 空氣遠近感（精緻畫質）：黃昏前的暖色薄霧；太陽仍低，光束次於酒樓繁華
      air: { density: 0.0055, start: 14, heightFalloff: 0.045, max: 0.6, desaturate: 0.45, horizon: 0.5, sunScatter: 0.65, rays: 0.75 },
    },
    buildingStyle: {
      rebuild: { minnan: { deco: 0.38, baroque: 0.12 } },
      condition: 'mature',
      signStyles: ['letters', 'deco', 'lacquer', 'letters'],
      hangingSignStyles: ['deco', 'red', 'lacquer'],
      signWords: ['喫茶', '洋食', '寫真館', '洋服', '化粧品', '時計', '書店', '藥局', '茶行', '布行', '百貨'],
      banners: 0.05,
      lanterns: 0.2,
    },
    streetProps: {
      ground: 'paved',
      lamps: 'deco',
      wires: false,
      lanternStrings: false,
      items: ['cafeSets', 'flowerPots', 'bicycles', 'vintageCar', 'teaChests'],
      boats: 'sampans',
    },
    availableStores: ['lin-fu-zhen', 'bolero', 'xin-fang-chun', 'ci-sheng-gong', 'you-ji', 'lin-hua-tai', 'rice-and-shine-329', 'shizixuan'],
  },
  {
    id: 'postwar',
    order: 4,
    chapter: 'Chapter 04',
    yearRange: '1945–1980',
    title: '庶民生活',
    description: '市場、廟口、小吃與日常生活',
    mood: '午後陽光穿過榕樹，蒸氣裊裊，像一張活起來的老照片。',
    palette: {
      accent: '#b5652c',
      scene: ['#8a5a36', '#c97b3c', '#3f5a48', '#9b948a'], // 焦糖棕、復古橘、墨綠、暖灰
    },
    lighting: {
      timeOfDay: '午後',
      sun: { azimuth: 214, elevation: 50, color: '#fff0d6', intensity: 2.55 },
      hemi: { sky: '#dfe6df', ground: '#b49f82', intensity: 1.6 },
      ambient: { color: '#fff1dc', intensity: 0.15 },
      sky: { top: '#a8c4cc', horizon: '#ece0c8', bottom: '#ddd2bc', sunGlow: '#ffe2b4', stars: 0 },
      fog: { color: '#e2d6bf', near: 40, far: 360 },
      mountains: '#e6e0d0',
      water: '#b8c9bd',
      clouds: { color: '#fbf4e6', emissive: '#cfc2a8' },
      grade: { exposure: 1.0, saturation: 0.84, contrast: 1.03, tint: [1.05, 1.0, 0.9], vignette: 0.24 },
      lines: { color: '#2d241c', strength: 0.82 },
      glow: 0.08,
      riverMist: 0.15,
      // 空氣遠近感（精緻畫質）：午後偏乾的空氣，霧較淡；太陽高，不出現光束
      air: { density: 0.0045, start: 16, heightFalloff: 0.045, max: 0.55, desaturate: 0.45, horizon: 0.5, sunScatter: 0.4, rays: 0.15 },
    },
    buildingStyle: {
      rebuild: { minnan: { postwar: 0.3 }, baroque: { postwar: 0.18 }, deco: { postwar: 0.1 } },
      condition: 'aged',
      signStyles: ['painted', 'painted', 'wood', 'red'],
      hangingSignStyles: ['vertical', 'vertical', 'red'],
      signWords: ['冰果室', '電器行', '西藥房', '照相館', '五金行', '布行', '鐘錶行', '米店', '雜貨店', '麵店', '旅社', '茶行', '南北貨'],
      banners: 0.05,
      lanterns: 0.12,
    },
    streetProps: {
      ground: 'asphalt',
      lamps: 'utility',
      // 不立第三根電線桿（x = −4）：北側林復振一帶戰後加建的鐵皮雨遮伸到離街心 1.68 公尺，燈桿會穿過去（畫面審查）
      lampSkip: [2],
      wires: true,
      lanternStrings: false,
      items: ['foodStalls', 'bicycles', 'tricycle', 'baskets', 'stools'],
      boats: 'sampans',
    },
    availableStores: ['lin-fu-zhen', 'ci-sheng-gong', 'temple-squid-stall', 'temple-mi-tai-mu-stall', 'temple-douhua-stall', 'temple-kueh-stall', 'you-ji', 'lin-hua-tai', 'bolero', 'xin-fang-chun', 'rice-and-shine-329', 'shizixuan'],
  },
  {
    id: 'revival',
    order: 5,
    chapter: 'Chapter 05',
    yearRange: '2000–現在',
    title: '老屋新生',
    description: '老屋再生、歷史保存與當代飲食文化',
    mood: '明亮柔和的自然光，修復的老屋裡透出溫暖燈光，清新而優雅。',
    palette: {
      accent: '#6f8a6e',
      scene: ['#f4efe2', '#9fb39a', '#c7a77c', '#d8b56a'], // 象牙白、鼠尾草綠、淺木色、暖金
    },
    lighting: {
      timeOfDay: '明亮白日',
      sun: { azimuth: 200, elevation: 58, color: '#fff8ec', intensity: 2.45 },
      hemi: { sky: '#e8f0ee', ground: '#cdbfa2', intensity: 1.75 },
      ambient: { color: '#fffaf0', intensity: 0.18 },
      sky: { top: '#a9cbd8', horizon: '#f1ece0', bottom: '#e4ddcc', sunGlow: '#fff1d0', stars: 0 },
      fog: { color: '#e9e6da', near: 46, far: 420 },
      mountains: '#eef0e6',
      water: '#c3d7d2',
      clouds: { color: '#ffffff', emissive: '#d9d7cf' },
      grade: { exposure: 1.02, saturation: 0.95, contrast: 1.0, tint: [1.0, 1.0, 0.97], vignette: 0.14 },
      lines: { color: '#2f2822', strength: 0.74 },
      glow: 0.42,
      riverMist: 0.1,
      // 空氣遠近感（精緻畫質）：現代的晴天最清透，只在街尾略微退色
      air: { density: 0.0032, start: 18, heightFalloff: 0.04, max: 0.48, desaturate: 0.35, horizon: 0.6, sunScatter: 0.3, rays: 0 },
    },
    buildingStyle: {
      rebuild: {},
      condition: 'restored',
      modernFront: 0.65,
      signStyles: ['modern', 'modern', 'letters', 'wood'],
      hangingSignStyles: ['modern', 'wood', 'cloth'],
      signWords: ['咖啡', '茶館', '選物', '甜點', '書店', '茶行', '南北貨', '食堂', '手作', '藝文'],
      banners: 0.1,
      lanterns: 0.15,
    },
    streetProps: {
      ground: 'pavers',
      lamps: 'heritage',
      wires: false,
      lanternStrings: false,
      items: ['planters', 'benches', 'bicycles', 'aBoards', 'cafeSets'],
      boats: 'ferry',
    },
    availableStores: [
      'lin-fu-zhen',
      'zi-yang',
      'yong-le-market',
      'hao-guo-yuan',
      'action-bar',
      // 文化據點：導演的豆花店北鄰的紅磚街屋（只在這個年代，不替其他年代另外做歷史版本）
      'huang-yujie-museum',
      'luguo-cafe',
      'lao-pan-squid-soup',
      'yong-le-mi-tai-mu',
      'rice-and-shine-329',
      'ci-sheng-gong',
      'you-ji',
      'li-ting-xiang',
      'lin-hua-tai',
      'bolero',
      'xin-fang-chun',
      'shizixuan',
    ],
  },
]

export const DEFAULT_ERA_ID = 'qing-port'

export function getEra(id) {
  return ERAS.find((era) => era.id === id) ?? null
}

export function getEraIndex(id) {
  return ERAS.findIndex((era) => era.id === id)
}
