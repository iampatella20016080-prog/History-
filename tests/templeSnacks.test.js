import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Color } from 'three'
import { ERAS } from '../src/data/eras.js'
import { MI_TAI_MU_STALL, miTaiMuStallToWorld } from '../src/data/miTaiMuLayout.js'
import { getShop, getShopBuilding, getTheme, getThemeRelated } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { TEMPLE_STALL, templeCourtToWorld, templeStallToWorld } from '../src/data/squidSoupLayout.js'
import {
  DOUHUA_STALL,
  DOUHUA_STALL_HOTSPOTS,
  DOUHUA_STALL_NPCS,
  DOUHUA_THEME,
  KUEH_STALL,
  KUEH_STALL_HOTSPOTS,
  KUEH_STALL_NPCS,
  KUEH_THEME,
  TEMPLE_CENTRAL_PATH,
  TEMPLE_DINING,
  douhuaStallToCourt,
  douhuaStallToWorld,
  kuehStallToCourt,
  kuehStallToWorld,
} from '../src/data/templeSnackLayout.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildTree } from '../src/game/builders/environment.js'
import { buildTempleDouhuaStall } from '../src/game/builders/templeDouhuaStall.js'
import { buildTempleKuehStall } from '../src/game/builders/templeKuehStall.js'
import { douhuaFlake, SWEETS_TINTS } from '../src/game/builders/templeSweetsWares.js'
import { buildNpcGeometry, NPC_LOOKS } from '../src/game/character/npcBuilder.js'
import { groundAt, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { followAllowed, inFollowArea, orbitDirection, pickBuilding, planBuildingFocus, segmentBlocked, viewerSpaceOf } from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 1945–1980 慈聖宮廟口小吃區的傳統豆花攤與傳統糕粿攤（飲食文化情境示意）。
 * 兩攤只在戰後出現；以食物主題連結 2000–現在的導演的豆花店與好粿緣（參訪對照，沒有品牌傳承關係），
 * 現代的兩家店的位置、外觀與功能都不變。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const postwar = worlds.postwar
const revival = worlds.revival
const douhua = getShop('temple-douhua-stall')
const kueh = getShop('temple-kueh-stall')
const DH = (x, z) => douhuaStallToWorld(x, z)
const KU = (x, z) => kuehStallToWorld(x, z)
const COURT = (x, z) => templeCourtToWorld(x, z)
const BRANDS = ['導演', 'Action', '好粿緣', '豆花店', '場記板']

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z, radius = PLAYER.radius) {
  const position = { x, z }
  resolvePlayerPosition(position, radius, world.collision, 0)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function walkTo(world, p, target, step = 0.1, radius = PLAYER.radius) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    p.x += (dx / d) * step
    p.z += (dz / d) * step
    resolvePlayerPosition(p, radius, world.collision, 0)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

function stallText(item) {
  const parts = [item.name, item.summary, item.yearNote, ...Object.values(item.eraNotes ?? {})]
  for (const chapter of item.chapters) {
    parts.push(chapter.title, chapter.lead, chapter.intro, chapter.footnote, chapter.disclaimer, ...(chapter.paragraphs ?? []))
    for (const food of chapter.items ?? []) parts.push(food.name, food.description, food.note)
    for (const fact of chapter.facts ?? []) parts.push(fact.value)
  }
  return parts.filter(Boolean).join('\n')
}

/** 攤位單獨產生一次：b 是兩種畫質都有的部分，detail 是只在精緻模式顯示的細小擺飾 */
function buildAlone(build) {
  const b = new PartBuilder()
  const detail = new PartBuilder()
  const result = build(b, { condition: 'aged' }, detail)
  return { b, detail, result }
}

/** 某個 PartBuilder 裡有沒有某種顏色的頂點（食物的顏色沒有套用年代的褪色） */
function hasTint(builder, hex) {
  const c = new Color(hex)
  for (const list of builder.groups.values()) {
    for (const g of list) {
      const colors = g.attributes.color.array
      for (let i = 0; i < colors.length; i += 3) {
        if (Math.abs(colors[i] - c.r) < 1e-4 && Math.abs(colors[i + 1] - c.g) < 1e-4 && Math.abs(colors[i + 2] - c.b) < 1e-4) return true
      }
    }
  }
  return false
}

function vertices(builder) {
  let n = 0
  for (const list of builder.groups.values()) for (const g of list) n += g.attributes.position.count
  return n
}

const dir = (a, b) => {
  const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
  const l = Math.hypot(d.x, d.y, d.z)
  return { x: d.x / l, y: d.y / l, z: d.z / l }
}

describe('廟口的豆花攤與糕粿攤：年代與歷史界線', () => {
  test('只在 1945–1980 出現（店家、建築、招牌、人物）；其他四個年代都沒有', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const id of ['temple-douhua-stall', 'temple-kueh-stall']) {
        assert.equal(era.availableStores.includes(id), era.id === 'postwar', `${era.id} ${id}`)
        assert.equal(world.buildings.some((item) => item.storeId === id), era.id === 'postwar', `${era.id} ${id}`)
      }
      assert.equal(world.signs.some((sign) => sign.text === '豆花' && sign.style === 'cloth'), era.id === 'postwar', era.id)
      assert.equal(world.signs.some((sign) => sign.text === '傳統糕粿'), era.id === 'postwar', era.id)
      const npcs = world.npcs.map((npc) => npc.id)
      assert.equal(npcs.filter((id) => id.startsWith('temple-douhua-') || id.startsWith('temple-kueh-')).length, era.id === 'postwar' ? 2 : 0, era.id)
    }
  })

  test('獨立的店家 id，標示飲食文化情境示意；沒有創立年份、店史，不寫成慈聖宮當時已有這兩攤或食物起源於1945年', () => {
    for (const item of [douhua, kueh]) {
      assert.equal(item.status, 'open')
      assert.equal(item.scenarioNote, '飲食文化情境示意')
      assert.equal(item.year, undefined)
      const text = stallText(item)
      assert.match(text, /沒有找到記錄戰後大稻埕慈聖宮廟口/)
      assert.match(text, /不表示.*從這個時期才有/)
      assert.match(text, /不代表.*起源於1945年/)
      assert.doesNotMatch(text, /\d+\s*元|營業時間/)
      // 每一章都有對應的熱點或是資料來源
      assert.deepEqual(item.chapters.map((chapter) => chapter.type), ['text', 'foods', 'sources'])
    }
    assert.deepEqual(douhua.chapters.map((chapter) => chapter.tab), ['豆花與甜食攤', '兩碗豆花', '資料來源'])
    assert.equal(kueh.chapters[0].title, '糕粿與日常／節慶米食')
    assert.deepEqual(kueh.chapters.map((chapter) => chapter.tab), ['糕粿與米食', '四種米食', '資料來源'])
  })

  test('戰後的招牌與店名不使用導演的豆花店、好粿緣的店名或商標：豆花攤只寫「豆花」、糕粿攤只寫「傳統糕粿」', () => {
    const near = (sign, center, r) => Math.hypot(sign.position[0] - center.x, sign.position[2] - center.z) < r
    for (const [center, texts] of [[DH(0, -0.2), ['豆花']], [KU(0, -0.4), ['傳統糕粿']]]) {
      const signs = postwar.signs.filter((sign) => near(sign, center, 1.6))
      assert.ok(signs.length >= 1)
      assert.deepEqual([...new Set(signs.map((sign) => sign.text))], texts)
    }
    for (const sign of postwar.signs) for (const brand of ['導演', 'Action', '好粿緣']) assert.ok(!sign.text.includes(brand), `${sign.text}`)
    for (const item of [douhua, kueh]) for (const brand of ['Action', '場記板']) assert.ok(!item.name.includes(brand))
    assert.ok(!douhua.name.includes('導演') && !kueh.name.includes('好粿緣'))
  })

  test('以食物主題（theme）連結現代相關店家：只是參訪對照、沒有品牌傳承關係；主題沒有把現代店家當成攤位的後續版本', () => {
    assert.equal(douhua.theme, DOUHUA_THEME.id)
    assert.equal(kueh.theme, KUEH_THEME.id)
    assert.deepEqual(getThemeRelated(douhua).map((item) => [item.eraId, item.shop.id]), [['revival', 'action-bar']])
    assert.deepEqual(getThemeRelated(kueh).map((item) => [item.eraId, item.shop.id]), [['revival', 'hao-guo-yuan']])
    for (const item of [douhua, kueh]) {
      const theme = getTheme(item.theme)
      assert.deepEqual(Object.keys(theme.versions), ['postwar'])
      for (const related of getThemeRelated(item)) assert.match(related.relation, /參訪對照.*沒有品牌傳承關係/)
      const text = stallText(item)
      assert.match(text, /現代相關店家/)
      assert.match(text, /沒有品牌的傳承關係|沒有品牌傳承關係/)
      assert.match(text, /不表示.*發展而來/)
    }
    // 現代的兩家店不加上主題、資料不變
    assert.equal(getShop('action-bar').theme, undefined)
    assert.equal(getShop('hao-guo-yuan').theme, undefined)
  })

  test('食材、製法與習俗都有來源：每一筆都存在、有網址、出版時間與用途', () => {
    for (const item of [douhua, kueh]) {
      const ids = new Set([...(item.sourceIds ?? []), ...item.chapters.flatMap((chapter) => chapter.sourceIds ?? [])])
      for (const id of ids) {
        const source = getSource(id)
        assert.ok(source, id)
        assert.match(source.url, /^https:\/\//, id)
        assert.ok(source.published, `${id} 出版時間`)
        assert.ok(source.usage, `${id} 用途`)
      }
    }
    assert.equal(getSource('moe-oo-kue').url, 'https://sutian.moe.edu.tw/zh-hant/su/3486/')
    for (const id of ['moe-douhua', 'moe-cao-guo', 'moe-hong-gui', 'moe-oo-kue', 'moe-cai-tau-guo', 'nmth-hong-gui-mold']) assert.ok(getSource(id).context, id)
  })

  test('豆花攤的兩碗與糕粿攤的四種米食：圖鑑品名、草仔粿與紅龜粿是主要的展示，芋粿與蘿蔔糕不是好粿緣的菜單', () => {
    assert.deepEqual(douhua.chapters[1].items.map((item) => item.name), ['原味糖水豆花', '花生豆花'])
    const foods = kueh.chapters[1].items
    assert.deepEqual(foods.map((item) => item.name), ['草仔粿', '紅龜粿', '芋粿', '蘿蔔糕（菜頭粿）'])
    assert.match(foods[0].category, /主要展示/)
    assert.match(foods[1].category, /主要展示/)
    assert.match(foods[2].category, /示意/)
    assert.match(foods[3].category, /示意/)
    assert.match(kueh.chapters[1].footnote, /不是好粿緣的菜單/)
  })
})

describe('現代的導演的豆花店與好粿緣維持不變', () => {
  test('位置、建築與介紹都在老屋新生：導演的豆花店（224巷、電影文化內容）與永樂市場一樓的好粿緣（綠色招牌、食品展示）', () => {
    const bar = getShop('action-bar')
    assert.deepEqual(bar.site, { x: 22.9, z: 4.5, rotationY: 0, replaces: ['south-17'] })
    assert.deepEqual(bar.position, { x: 32.7, z: 23.45 })
    assert.ok(revival.buildings.some((item) => item.storeId === 'action-bar'))
    assert.ok(bar.chapters.length >= 4)
    const hao = getShop('hao-guo-yuan')
    assert.equal(hao.inside, 'yong-le-market')
    assert.deepEqual(hao.position, { x: 50.05, z: -1.8 })
    assert.ok(revival.signs.some((sign) => sign.text === '好粿緣' && sign.style === 'greenBoard'))
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes('action-bar'), era.id === 'revival', era.id)
      assert.equal(worlds[era.id].signs.some((sign) => sign.text === '好粿緣'), era.id === 'revival', era.id)
    }
  })

  test('兩家現代店家沒有被移到廟口、也沒有重複建立', () => {
    const court = COURT(0, -2.5)
    for (const id of ['action-bar', 'hao-guo-yuan']) {
      assert.equal(revival.buildings.filter((item) => item.storeId === id && !item.detail && !item.id.includes('-')).length <= 1, true)
      const p = getShopPlacement(getShop(id)).origin
      assert.ok(Math.hypot(p.x - court.x, p.z - court.z) > 15, id)
    }
    assert.equal(postwar.buildings.some((item) => item.storeId === 'action-bar' || item.storeId === 'hao-guo-yuan'), false)
  })
})

describe('廟口配置：四攤、中央通道、廟門與座位', () => {
  test('廟口能同時看到米苔目、魷魚羹、豆花、糕粿四攤；四攤的位置不重疊、各自在廟埕的矮牆內', () => {
    const ids = ['temple-mi-tai-mu-stall', 'temple-squid-stall', 'temple-douhua-stall', 'temple-kueh-stall']
    for (const id of ids) assert.ok(postwar.buildings.some((item) => item.storeId === id), id)
    const centers = [miTaiMuStallToWorld(0, -0.3), templeStallToWorld(0, -0.3), DH(0, -0.3), KU(0, -0.35)]
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) assert.ok(Math.hypot(centers[i].x - centers[j].x, centers[i].z - centers[j].z) > 3, `${ids[i]} 與 ${ids[j]}`)
    }
    // 四攤的招牌文字都不一樣
    assert.ok(postwar.signs.some((sign) => sign.text === '米苔目'))
    assert.ok(postwar.signs.some((sign) => sign.text === '魷魚羹'))
    // 豆花攤與糕粿攤在矮牆內（廟埕寬 12 m，矮牆內側 ±5.7）
    for (const toCourt of [douhuaStallToCourt, kuehStallToCourt]) {
      for (const [x, z] of [[-0.98, -1.75], [0.85, -1.75], [-0.98, 0.65], [0.85, 0.65]]) assert.ok(Math.abs(toCourt(x, z).x) < 5.75, `${x}, ${z}`)
    }
  })

  test('取代兩側榕樹後方原本的一般小吃攤（只在戰後）；老屋新生的廟埕不變', () => {
    const temple = getShop('ci-sheng-gong')
    assert.equal(getShopBuilding(temple, 'postwar').sideStalls, false)
    assert.deepEqual(getShopBuilding(temple, 'postwar').clearing, [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing])
    assert.deepEqual(getShopBuilding(temple, 'postwar').eastClearing, [MI_TAI_MU_STALL.clearing, KUEH_STALL.clearing])
    for (const key of ['sideStalls', 'clearing', 'eastClearing', 'frontStall']) assert.equal(getShopBuilding(temple, 'revival')[key], undefined, key)
    // 一般小吃攤的價目牌（直式的 menu 招牌）：戰後只剩榕樹下以外的，老屋新生的兩側小吃攤還在
    const sideMenus = (world) =>
      world.signs.filter((sign) => sign.style === 'menu' && [COURT(-3.8, -4.3), COURT(3.8, -4.4)].some((c) => Math.hypot(sign.position[0] - c.x, sign.position[2] - c.z) < 1.4)).length
    assert.equal(sideMenus(postwar), 0)
    assert.ok(sideMenus(revival) >= 2)
  })

  test('中央主通道至少容納兩個角色並行：從迪化街側的廟埕前緣走到天公爐前、再繞到廟前的石階', () => {
    const { minX, maxX, minZ, maxZ } = TEMPLE_CENTRAL_PATH
    assert.ok(maxX - minX >= PLAYER.radius * 4, '寬度至少兩個角色')
    for (let z = minZ; z <= maxZ; z += 0.25) {
      for (const x of [minX + PLAYER.radius, (minX + maxX) / 2, maxX - PLAYER.radius]) {
        const p = COURT(x, z)
        assert.ok(walkableAt(postwar, p.x, p.z), `通道 (${x.toFixed(2)}, ${z.toFixed(2)})`)
      }
    }
    // 兩個角色並行：一個角色兩倍寬的圓能通過整段通道
    const mid = (minX + maxX) / 2
    const wide = { ...COURT(mid, maxZ - 0.2) }
    // （兩倍寬的圓停在天公爐前：天公爐從 z -3.95 開始）
    assert.ok(walkTo(postwar, wide, COURT(mid, -3.95 + PLAYER.radius * 2 + 0.1), 0.1, PLAYER.radius * 2) < 0.15, `寬的角色卡在 (${wide.x.toFixed(2)}, ${wide.z.toFixed(2)})`)
    // 天公爐兩側都能繞到廟前的石階
    for (const side of [-1, 1]) {
      const p = { ...COURT(0, -3.6) }
      for (const [x, z] of [[side * 1.0, -3.8], [side * 1.0, -5.3], [side * 0.4, -5.6]]) assert.ok(walkTo(postwar, p, COURT(x, z)) < 0.15, `天公爐${side > 0 ? '西' : '東'}側 (${x}, ${z})`)
    }
  })

  test('廟門前保留視線：從廟埕前緣看廟門，視線不被任何攤位擋住', () => {
    const stallBoxes = postwar.blockers.filter((box) => box.maxY < 3)
    for (const x of [-0.8, 0, 0.8]) {
      const from = { ...COURT(x, 1.4), y: 1.6 }
      const door = { ...COURT(x * 0.5, -6.2 - 1.45), y: 1.6 }
      const length = Math.hypot(door.x - from.x, door.z - from.z) - 0.4
      const hit = raycastBoxes(from, dir(from, door), length, stallBoxes)
      assert.ok(hit >= length - 1e-6, `從 (${x}, 1.4) 看廟門：在 ${hit.toFixed(2)} m 處被擋住`)
    }
  })

  test('從街上走到兩攤前（不卡住）；推車、木輪、推把、木凳、矮桌、橫牌的木柱與攤販都不能穿越；不能走到攤位後方', () => {
    for (const [toWorld, hotspots, blocked] of [
      [DH, DOUHUA_STALL_HOTSPOTS, [[0, -0.3, '推車'], [DOUHUA_STALL.wheel.x, 0.05, '木輪'], [-0.85, -0.3, '推把'], [DOUHUA_STALL.stools[0].x, DOUHUA_STALL.stools[0].z, '木凳'], [DOUHUA_STALL_NPCS[0].x, DOUHUA_STALL_NPCS[0].z, '攤販'], [0, -1.4, '攤位後方']]],
      [KU, KUEH_STALL_HOTSPOTS, [[0, -0.35, '矮桌'], [KUEH_STALL.sign.posts, KUEH_STALL.sign.z, '橫牌的木柱'], [KUEH_STALL_NPCS[0].x, KUEH_STALL_NPCS[0].z, '攤販'], [KUEH_STALL.baskets.x, KUEH_STALL.baskets.z, '籃筐'], [0, -1.4, '攤位後方']]],
    ]) {
      const p = { ...COURT(0, 1.2) }
      for (const target of [COURT(0, -2.0), toWorld(hotspots[0].point[0], hotspots[0].point[1])]) assert.ok(walkTo(postwar, p, target) < 0.15, `卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
      assert.ok(walkableAt(postwar, p.x, p.z))
      for (const [x, z, label] of blocked) {
        const w = toWorld(x, z)
        assert.ok(!walkableAt(postwar, w.x, w.z), label)
      }
      // 推向攤位不會卡住：往攤位走一段後還能退回通道
      walkTo(postwar, p, toWorld(0, -0.3))
      assert.ok(walkTo(postwar, p, COURT(0, -2.0)) < 0.15, '退回通道')
    }
  })

  test('座位集中在用餐區：共用桌椅在中央通道西側（只在戰後），豆花攤的兩張木凳靠近用餐區，糕粿攤沒有桌椅；桌凳不擋住通道與攤位', () => {
    const temple = getShop('ci-sheng-gong')
    assert.deepEqual(getShopBuilding(temple, 'postwar').sharedTables, TEMPLE_DINING.tables)
    assert.equal(getShopBuilding(temple, 'revival').sharedTables, undefined)
    for (const [x, z] of TEMPLE_DINING.tables) {
      assert.ok(x - 0.6 >= TEMPLE_CENTRAL_PATH.maxX + PLAYER.radius - 1e-6, '桌椅不在中央通道')
      const w = COURT(x, z)
      assert.ok(!walkableAt(postwar, w.x, w.z), '桌椅有碰撞')
    }
    // 從中央通道走到豆花攤前：經過天公爐與用餐區之間
    const p = { ...COURT(0, -2.6) }
    for (const [x, z] of [[0.6, -3.2], [1.5, -3.6], [1.95, -4.6]]) assert.ok(walkTo(postwar, p, COURT(x, z)) < 0.15, `走到豆花攤：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    const shared = COURT(...TEMPLE_DINING.tables[0])
    for (const stool of DOUHUA_STALL.stools) {
      const c = douhuaStallToCourt(stool.x, stool.z)
      assert.ok(c.x > TEMPLE_CENTRAL_PATH.maxX + 1.5, '木凳不在中央通道')
      const w = DH(stool.x, stool.z)
      assert.ok(Math.hypot(w.x - shared.x, w.z - shared.z) < 3.2, '木凳在共用桌椅附近')
    }
    // 豆花攤的客人那一側與兩張木凳之間站得下（攤位前的熱點可以走到）
    const front = DH(DOUHUA_STALL_HOTSPOTS[0].point[0], DOUHUA_STALL_HOTSPOTS[0].point[1])
    assert.ok(walkableAt(postwar, front.x, front.z))
    const kuehFront = KU(KUEH_STALL_HOTSPOTS[0].point[0], KUEH_STALL_HOTSPOTS[0].point[1])
    assert.ok(walkableAt(postwar, kuehFront.x, kuehFront.z))
  })

  test('兩側榕樹在攤位上方讓出空間：空地裡沒有氣根、樹冠抬高到布棚與橫牌上方；榕樹接受多個空地範圍', () => {
    for (const [x, seed, clearings] of [[3.6, 301, [TEMPLE_STALL.clearing, DOUHUA_STALL.clearing]], [-3.6, 299, [MI_TAI_MU_STALL.clearing, KUEH_STALL.clearing]]]) {
      const b = new PartBuilder()
      buildTree(b, [x, 0, -2.4], { scale: 0.9, seed, banyan: true, clearing: clearings })
      const c = clearings[1]
      for (const g of b.groups.get('plain')) {
        const pos = g.attributes.position
        let low = Infinity
        for (let i = 0; i < pos.count; i++) {
          const px = pos.getX(i)
          const pz = pos.getZ(i)
          if (px > c.minX && px < c.maxX && pz > c.minZ && pz < c.maxZ) low = Math.min(low, pos.getY(i))
        }
        assert.ok(low >= c.top - 0.12, `樹冠的底面 ${low.toFixed(2)}`)
      }
      for (const g of b.groups.get('wood').slice(1)) {
        g.computeBoundingBox()
        const m = g.boundingBox.getCenter(g.boundingBox.min.clone())
        for (const k of clearings) assert.ok(!(m.x > k.minX && m.x < k.maxX && m.z > k.minZ && m.z < k.maxZ), '氣根在攤位裡')
      }
    }
    assert.ok(DOUHUA_STALL.canopy.height + 0.12 <= DOUHUA_STALL.clearing.top + 0.05)
    assert.ok(KUEH_STALL.sign.y + KUEH_STALL.sign.height / 2 + 0.05 <= KUEH_STALL.clearing.top + 0.05)
  })

  test('在攤位前切換到其他年代：推到合法的位置（地面、不在障礙物裡）', () => {
    for (const era of ERAS.filter((item) => item.id !== 'postwar')) {
      const world = worlds[era.id]
      for (const p0 of [DH(0.05, 1.05), KU(0, 1.05), DH(0.5, 0.25), KU(-0.5, 0.2)]) {
        const p = { ...p0 }
        resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
        assert.ok(walkableAt(world, p.x, p.z), `${era.id} (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.equal(groundAt(p, world.collision, 0, null).y, 0)
      }
    }
  })
})

describe('攤位的模型：豆花攤與糕粿攤不同，食物可以近距離辨識', () => {
  test('豆花攤是木框推車（木輪、推把、小布棚），糕粿攤是低矮的木桌（沒有布棚、沒有木輪）；工作器具與食品陳列不同', () => {
    const dh = buildAlone(buildTempleDouhuaStall)
    const ku = buildAlone(buildTempleKuehStall)
    assert.ok(DOUHUA_STALL.cart.height > KUEH_STALL.table.height + 0.12, '矮桌比推車低')
    assert.ok(dh.b.groups.has('cloth'), '豆花攤有布棚與布幌')
    assert.ok(hasTint(dh.b, SWEETS_TINTS.douhua) && hasTint(dh.b, SWEETS_TINTS.syrup))
    assert.ok(!hasTint(ku.b, SWEETS_TINTS.douhua), '糕粿攤沒有豆花')
    assert.ok(!hasTint(dh.b, SWEETS_TINTS.caoAKue) && !hasTint(dh.b, SWEETS_TINTS.angKuKue), '豆花攤沒有糕粿')
    assert.ok(ku.b.groups.has('bamboo'), '糕粿攤有竹蒸籠')
    // 兩攤的招牌樣式與文字不同
    assert.deepEqual([...new Set(dh.b.signs.map((sign) => `${sign.style}:${sign.text}`))], ['cloth:豆花'])
    assert.deepEqual([...new Set(ku.b.signs.map((sign) => `${sign.style}:${sign.text}`))], ['wood:傳統糕粿'])
    // 只有少量蒸氣（蒸籠一處），豆花攤沒有大鍋的蒸氣
    assert.equal(dh.b.steam.length, 0)
    assert.equal(ku.b.steam.length, 1)
    assert.ok(ku.b.steam[0].strength <= 0.5)
  })

  test('流暢與精緻模式都保留全部的食物種類；精緻模式只多了小物（份數、花生粒、芋頭顆粒、蘿蔔絲、竹條）', () => {
    const dh = buildAlone(buildTempleDouhuaStall)
    const ku = buildAlone(buildTempleKuehStall)
    for (const key of ['douhua', 'syrup', 'peanut']) assert.ok(hasTint(dh.b, SWEETS_TINTS[key]), `流暢模式有 ${key}`)
    for (const key of ['caoAKue', 'angKuKue', 'ooKue', 'ooKueBits', 'caiTauKue', 'leaf']) assert.ok(hasTint(ku.b, SWEETS_TINTS[key]), `流暢模式有 ${key}`)
    assert.ok(vertices(dh.detail) > 0 && vertices(ku.detail) > 0)
    assert.ok(vertices(dh.b) < 40000, `豆花攤 ${vertices(dh.b)}`)
    assert.ok(vertices(ku.b) < 40000, `糕粿攤 ${vertices(ku.b)}`)
    assert.ok(vertices(dh.detail) < 20000 && vertices(ku.detail) < 20000)
  })

  test('四種米食的形狀、顏色與厚度都不同；豆花是薄而不規則的片狀（不是方塊或圓球），花生是小的橢圓顆粒', () => {
    const sizes = {}
    const ku = buildAlone(buildTempleKuehStall)
    const tints = Object.fromEntries(['caoAKue', 'angKuKue', 'ooKue', 'caiTauKue'].map((key) => [key, new Color(SWEETS_TINTS[key])]))
    for (const g of ku.b.groups.get('plain')) {
      const c = g.attributes.color.array
      const key = Object.keys(tints).find((k) => Math.abs(c[0] - tints[k].r) < 1e-4 && Math.abs(c[1] - tints[k].g) < 1e-4 && Math.abs(c[2] - tints[k].b) < 1e-4)
      if (!key) continue
      g.computeBoundingBox()
      const s = g.boundingBox.getSize(g.boundingBox.min.clone())
      ;(sizes[key] ??= []).push([s.x, s.y, s.z].map((v) => Number(v.toFixed(3))))
    }
    for (const key of Object.keys(tints)) assert.ok(sizes[key]?.length, key)
    const thick = (key) => Math.min(...sizes[key].map(([, y]) => y))
    // 厚度：紅龜粿（扁）< 草仔粿 < 芋粿／蘿蔔糕
    assert.ok(thick('angKuKue') < thick('caoAKue') + 0.01)
    assert.ok(new Set(Object.values(SWEETS_TINTS)).size === Object.keys(SWEETS_TINTS).length, '顏色都不同')
    // 豆花片：寬度遠大於厚度
    const dh = buildAlone(buildTempleDouhuaStall)
    const white = new Color(SWEETS_TINTS.douhua)
    const peanutTint = new Color(SWEETS_TINTS.peanut)
    let flakes = 0
    let nuts = 0
    for (const g of dh.b.groups.get('plain')) {
      const c = g.attributes.color.array
      g.computeBoundingBox()
      const s = g.boundingBox.getSize(g.boundingBox.min.clone())
      if (Math.abs(c[0] - white.r) < 1e-4 && Math.abs(c[1] - white.g) < 1e-4 && Math.abs(c[2] - white.b) < 1e-4 && s.x < 0.1) {
        flakes++
        assert.ok(Math.max(s.x, s.z) > s.y * 1.4, `豆花是片狀：${s.x.toFixed(3)} × ${s.y.toFixed(3)} × ${s.z.toFixed(3)}`)
      }
      if (Math.abs(c[0] - peanutTint.r) < 1e-4 && Math.abs(c[1] - peanutTint.g) < 1e-4 && s.x < 0.03) {
        nuts++
        assert.ok(s.x < 0.025 && s.y < 0.02, '花生是小顆粒')
      }
    }
    assert.ok(flakes >= 6, `豆花片 ${flakes}`)
    // 單獨一片（不傾斜）：很薄、外緣不規則（不是圓片、方塊或圓球）
    const one = new PartBuilder()
    douhuaFlake(one, 0, 0, 0, { r: 0.03, t: 0.009, seed: 5 })
    const g = one.groups.get('plain')[0]
    g.computeBoundingBox()
    const size = g.boundingBox.getSize(g.boundingBox.min.clone())
    assert.ok(size.y < Math.min(size.x, size.z) * 0.4, `薄片 ${size.y.toFixed(3)}`)
    const pos = g.attributes.position
    const radii = []
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getZ(i) / 0.82)
      if (r > 0.01) radii.push(r)
    }
    const outer = radii.sort((a, b) => b - a).slice(0, Math.ceil(radii.length * 0.5))
    assert.ok(Math.max(...outer) / Math.min(...outer) > 1.2, '外緣不規則')
    assert.ok(nuts >= 9, `花生 ${nuts}`)
  })

  test('攤販各一位（不新增大量人物）：三個網格、鞋底貼地；站著的人物有碰撞', () => {
    assert.equal(DOUHUA_STALL_NPCS.length + KUEH_STALL_NPCS.length, 2)
    for (const npc of [...DOUHUA_STALL_NPCS, ...KUEH_STALL_NPCS]) {
      assert.ok(NPC_LOOKS[npc.look], npc.look)
      const g = buildNpcGeometry(npc.look, npc.pose)
      g.body.computeBoundingBox()
      assert.ok(Math.abs(g.body.boundingBox.min.y) < 0.03, `${npc.look} 鞋底 ${g.body.boundingBox.min.y}`)
      assert.ok(npc.z < -0.7, '攤販在攤位後方')
    }
  })
})

describe('互動、點選、鏡頭與觀賞模式', () => {
  test('熱點：兩攤各兩個（攤位、只能點選的餐點）；對應的章節；不和其他已開放店家的互動範圍重疊', () => {
    assert.deepEqual(douhua.hotspots.map((h) => [h.id, h.chapter]), [['stall', 'douhua-stall'], ['bowls', 'douhua-bowls']])
    assert.deepEqual(kueh.hotspots.map((h) => [h.id, h.chapter]), [['stall', 'kueh-stall'], ['trays', 'kueh-foods']])
    const EXIT_MARGIN = 0.7
    const circles = (item) => {
      const placement = getShopPlacement(item)
      if (placement.hotspots.length) return placement.hotspots.filter((h) => !h.clickOnly).map((h) => ({ point: h.interactionPoint, radius: h.radius }))
      return [{ point: placement.interactionPoint, radius: item.interaction?.radius ?? 3.2 }]
    }
    const others = ERAS.find((era) => era.id === 'postwar').availableStores.map(getShop).filter((item) => item?.status === 'open')
    for (const mine of [douhua, kueh]) {
      for (const a of circles(mine)) {
        for (const other of others.filter((item) => item.id !== mine.id)) {
          for (const b of circles(other)) {
            const d = Math.hypot(a.point.x - b.point.x, a.point.z - b.point.z)
            assert.ok(d >= a.radius + EXIT_MARGIN + b.radius, `${mine.id} 與 ${other.id}：${d.toFixed(2)}`)
          }
        }
      }
    }
  })

  test('按 E／點提示開啟「豆花與甜食攤」「糕粿與日常／節慶米食」；點餐點開啟餐點章節；建築觀賞模式不開啟介紹', () => {
    resetStore('postwar')
    const index = (item, id) => item.chapters.findIndex((chapter) => chapter.id === id)
    for (const [item, food] of [[douhua, 'bowls'], [kueh, 'trays']]) {
      useGameStore.getState().setNearbyShop(item.id, 'stall')
      useGameStore.getState().interact()
      assert.equal(useGameStore.getState().chapterIndex, index(item, item.hotspots[0].chapter))
      useGameStore.getState().closeShop()
      useGameStore.getState().setNearbyShop(item.id, 'stall')
      useGameStore.getState().interact(food)
      assert.equal(useGameStore.getState().activeHotspotId, food)
      assert.equal(useGameStore.getState().chapterIndex, index(item, item.hotspots[1].chapter))
      useGameStore.getState().closeShop()
      useGameStore.getState().setViewMode('viewer')
      assert.equal(useGameStore.getState().openShop(item.id, food), false)
      useGameStore.getState().setViewMode('explore')
    }
  })

  test('點選：從攤位前不同的距離與高度（含 iPad 預設鏡頭從人物背後往下看）點得到兩碗豆花與托盤上的米食', () => {
    for (const [toWorld, hotspot, id, target] of [
      [DH, DOUHUA_STALL_HOTSPOTS[0], 'temple-douhua-bowls', { x: 0.05, z: -0.13, y: DOUHUA_STALL.cart.height + 0.06 + 0.04 }],
      [KU, KUEH_STALL_HOTSPOTS[0], 'temple-kueh-trays', { x: -0.06, z: -0.25, y: KUEH_STALL.table.height + 0.06 + 0.03 }],
    ]) {
      const goal = { ...toWorld(target.x, target.z), y: target.y }
      for (const [dz, y, dx] of [[0.9, 1.5, 0], [1.6, 2.0, 0.3], [2.4, 2.6, -0.3], [3.2, 3.2, 0]]) {
        const cam = { ...toWorld(target.x + dx, dz), y }
        const hit = pickBuilding(cam, dir(cam, goal), postwar.buildings)
        assert.equal(hit?.id, id, `${id} ${dz}, ${y}`)
      }
      // 人物站在熱點、背對通道看攤位時的跟隨鏡頭也看得到
      const p = toWorld(hotspot.point[0], hotspot.point[1])
      const target3 = { x: p.x, y: CAMERA.targetHeight, z: p.z }
      const away = toWorld(hotspot.point[0], hotspot.point[1] + 1)
      const yaw = Math.atan2(away.x - p.x, away.z - p.z)
      const d = orbitDirection(yaw, CAMERA.pitch)
      const hit = raycastBoxes(target3, d, CAMERA.distance + 0.45, postwar.blockers)
      const tight = inFollowArea(p, postwar.followAreas, 0)
      const dist = Math.min(CAMERA.distance, followAllowed(hit, CAMERA.minDistance, tight))
      const cam = { x: target3.x + d.x * dist, y: target3.y + d.y * dist, z: target3.z + d.z * dist }
      assert.ok(!postwar.blockers.some((box) => insideBox(cam, box)), `${id} 跟隨鏡頭不在方塊裡`)
    }
  })

  test('廟埕後段是貼近障礙物的跟隨範圍（只在戰後）：兩攤前、用餐區與天公爐前；廟埕前緣與迪化街不是', () => {
    for (const p of [DH(...DOUHUA_STALL_HOTSPOTS[0].point), KU(...KUEH_STALL_HOTSPOTS[0].point), COURT(-0.3, -2.6), COURT(1.5, -3.6)]) assert.ok(inFollowArea(p, postwar.followAreas, 0), `${p.x.toFixed(2)}, ${p.z.toFixed(2)}`)
    for (const p of [COURT(0, 1.2), { x: 4, z: 1.5 }]) assert.ok(!inFollowArea(p, postwar.followAreas, 0))
    assert.equal(revival.followAreas.some((r) => inFollowArea(COURT(-0.3, -2.6), [r], 0)), false, '老屋新生的廟埕不變')
    // 沿著中央通道往豆花攤走的每一步（四個方向）：跟隨鏡頭不在方塊裡
    const p = { ...COURT(-0.3, -1.0) }
    for (const target of [COURT(-0.3, -2.6), COURT(0.55, -3.2), COURT(1.5, -3.6), DH(...DOUHUA_STALL_HOTSPOTS[0].point), COURT(-1.2, -3.3), KU(...KUEH_STALL_HOTSPOTS[0].point)]) {
      for (let n = 0; n < 80 && Math.hypot(target.x - p.x, target.z - p.z) > 0.15; n++) {
        const d = Math.hypot(target.x - p.x, target.z - p.z)
        p.x += ((target.x - p.x) / d) * 0.12
        p.z += ((target.z - p.z) / d) * 0.12
        resolvePlayerPosition(p, PLAYER.radius, postwar.collision, 0)
        for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.atan2(-(target.x - p.x), -(target.z - p.z))]) {
          const t = { x: p.x, y: CAMERA.targetHeight, z: p.z }
          const dir = orbitDirection(yaw, CAMERA.pitch)
          const hit = raycastBoxes(t, dir, CAMERA.distance + 0.45, postwar.blockers)
          const dist = Math.min(CAMERA.distance, followAllowed(hit, CAMERA.minDistance, inFollowArea(p, postwar.followAreas, 0)))
          const cam = { x: t.x + dir.x * dist, y: t.y + dir.y * dist, z: t.z + dir.z * dist }
          assert.ok(!postwar.blockers.some((box) => insideBox(cam, box)), `鏡頭在方塊裡：人物 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})、yaw ${yaw.toFixed(2)}`)
        }
      }
    }
  })

  test('介紹鏡頭不在任何方塊裡、看得到注視點', () => {
    for (const item of [douhua, kueh]) {
      const placement = getShopPlacement(item)
      for (const shot of [...placement.hotspots.map((h) => ({ id: h.id, camera: h.camera })), { id: 'default', camera: placement.camera }]) {
        const cam = shot.camera.position
        assert.ok(!postwar.blockers.some((box) => insideBox(cam, box)), `${item.id}/${shot.id}`)
        assert.ok(!segmentBlocked(cam, shot.camera.target, postwar.blockers.filter((box) => !insideBox(shot.camera.target, box, 0.02))), `${item.id}/${shot.id} 看得到注視點`)
      }
    }
  })

  test('建築觀賞模式：聚焦攤位與餐點時，鏡頭在廟埕上、不在方塊裡、近距離看得到食物', () => {
    const space = viewerSpaceOf(postwar)
    for (const id of ['site-temple-douhua-stall', 'site-temple-kueh-stall', 'temple-douhua-bowls', 'temple-kueh-trays']) {
      const building = postwar.buildings.find((item) => item.id === id)
      assert.ok(building, id)
      const plan = planBuildingFocus(building, postwar.blockers, { yaw: 0, aspect: 4 / 3, fov: CAMERA.fov ?? 50, space })
      const direction = orbitDirection(plan.yaw, plan.pitch)
      const cam = { x: plan.target.x + direction.x * plan.distance, y: plan.target.y + direction.y * plan.distance, z: plan.target.z + direction.z * plan.distance }
      assert.ok(!postwar.blockers.some((box) => insideBox(cam, box)), `${id}：(${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`)
      if (id.includes('bowls') || id.includes('trays')) assert.ok(plan.distance <= 2.2, `${id} 近距離 ${plan.distance.toFixed(2)}`)
      // 鏡頭在廟埕裡（不是退到迪化街上從外面看）
      const court = { a: COURT(5.7, 0.5), b: COURT(-5.7, -6.0) }
      assert.ok(cam.z > Math.min(court.a.z, court.b.z) && cam.z < Math.max(court.a.z, court.b.z), `${id} 鏡頭在廟埕裡：z ${cam.z.toFixed(2)}`)
    }
  })
})
