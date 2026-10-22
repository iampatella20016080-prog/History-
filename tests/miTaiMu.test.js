import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { beforeEach, describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  MI_TAI_MU_STALL,
  MI_TAI_MU_STALL_HOTSPOTS,
  MI_TAI_MU_STALL_NPCS,
  MI_TAI_MU_THEME,
  YONGLE_MTM,
  YONGLE_MTM_HOTSPOTS,
  YONGLE_MTM_NPCS,
  miTaiMuStallToWorld,
  yongleMtmAisle,
  yongleMtmNpcPlacement,
  yongleMtmTable,
  yongleMtmToWorld,
} from '../src/data/miTaiMuLayout.js'
import { TEMPLE_STALL, templeCourtToWorld, templeStallToWorld } from '../src/data/squidSoupLayout.js'
import { getShop, getTheme, getThemeVersions } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildTree } from '../src/game/builders/environment.js'
import { buildNpcGeometry, NPC_LOOKS, NPC_POSES, npcAnimation } from '../src/game/character/npcBuilder.js'
import { RIG } from '../src/game/character/outfitBuilder.js'
import { groundAt, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { followAllowed, inFollowArea, indoorFollow, interiorAmount, orbitDirection, pickBuilding, planBuildingFocus, segmentBlocked, viewerSpaceOf } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 米苔目的兩個年代版本：1945–1980 慈聖宮廟口小吃群裡的米苔目攤（飲食文化情境示意）與 2000–現在的永樂米苔目。
 * 兩者以飲食主題串連，但位置、模型、碰撞、人物、互動與故事各自獨立，只在自己的年代出現。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const postwar = worlds.postwar
const revival = worlds.revival
const stall = getShop('temple-mi-tai-mu-stall')
const shop = getShop('yong-le-mi-tai-mu')
const zone = revival.interiors.find((item) => item.id === 'yong-le-mi-tai-mu')
const YL = (x, z) => yongleMtmToWorld(x, z)
const MS = (x, z) => miTaiMuStallToWorld(x, z)

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.level = ground.level
  p.y = ground.y
}

function walkTo(world, p, target, step = 0.15) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

function followRoute(world, p, route, step, toWorld) {
  for (const [x, z, label] of route) {
    const miss = walkTo(world, p, toWorld(x, z), step)
    assert.ok(miss < step + 1e-6, `${label}：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})，差 ${miss.toFixed(2)} m`)
    assert.ok(walkableAt(world, p.x, p.z), `${label}：站的位置不合法`)
  }
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const found = interiorAmount(p, world.interiors, 0)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: (p.y ?? 0) + CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas, 0)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k, target }
}

function shopText(item) {
  const parts = [item.summary, item.yearNote, ...Object.values(item.eraNotes ?? {})]
  for (const chapter of item.chapters) {
    parts.push(chapter.title, chapter.lead, chapter.intro, chapter.footnote, chapter.disclaimer, ...(chapter.paragraphs ?? []))
    for (const food of chapter.items ?? []) parts.push(food.name, food.description, food.note)
    for (const fact of chapter.facts ?? []) parts.push(fact.value)
  }
  return parts.filter(Boolean).join('\n')
}

// 永樂米苔目：從迪化街走到騎樓下的店門口、入口、店內的用餐空間、走道邊第一張桌子、走道深處，再原路回到街上（建築本地座標）
const IN = [
  [1.0, 2.6, '店門口的街上'],
  [1.0, 1.0, '騎樓'],
  [1.0, 0.2, '入口'],
  [YONGLE_MTM_HOTSPOTS[1].point[0], YONGLE_MTM_HOTSPOTS[1].point[1], '店內的用餐空間'],
  [-0.7, -2.2, '走道'],
  [YONGLE_MTM_HOTSPOTS[2].point[0], YONGLE_MTM_HOTSPOTS[2].point[1], '走道邊第一張桌子'],
  [-0.85, -5.2, '走道深處'],
  [-0.95, -7.2, '後方'],
  [0.6, -8.8, '後方櫃台前'],
]
const OUT = [
  [-0.95, -7.2, '後方'],
  [-0.85, -5.0, '走道'],
  [-0.72, -2.6, '走道邊第一張桌子'],
  [0.6, -1.6, '入口內側'],
  [1.0, 0.2, '入口'],
  [1.0, 1.2, '騎樓'],
  [1.0, 2.6, '街上'],
]
const STALL_ROUTE = [
  [0, 2.7, '攤位前的街邊'],
  [MI_TAI_MU_STALL_HOTSPOTS[0].point[0], MI_TAI_MU_STALL_HOTSPOTS[0].point[1], '兩張小桌之間'],
  [0, 0.45, '攤台前'],
]

beforeEach(() => resetStore('revival'))

describe('米苔目：兩個年代版本', () => {
  test('只在各自的年代出現：1945–1980 廟口的米苔目攤、2000–現在的永樂米苔目；其他三個年代都沒有', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      assert.equal(era.availableStores.includes('temple-mi-tai-mu-stall'), era.id === 'postwar', era.id)
      assert.equal(era.availableStores.includes('yong-le-mi-tai-mu'), era.id === 'revival', era.id)
      assert.equal(world.buildings.some((item) => item.storeId === 'temple-mi-tai-mu-stall'), era.id === 'postwar', era.id)
      assert.equal(world.buildings.some((item) => item.storeId === 'yong-le-mi-tai-mu'), era.id === 'revival', era.id)
      assert.equal(world.signs.some((sign) => sign.text === '永樂米苔目'), era.id === 'revival', era.id)
      assert.equal(world.signs.some((sign) => sign.text === '米苔目' && sign.style === 'painted'), era.id === 'postwar', era.id)
      assert.equal(world.interiors.some((item) => item.id === 'yong-le-mi-tai-mu'), era.id === 'revival', era.id)
      const npcs = world.npcs.map((npc) => npc.id)
      assert.equal(npcs.filter((id) => id.startsWith('temple-mi-tai-mu-')).length, era.id === 'postwar' ? MI_TAI_MU_STALL_NPCS.length : 0, era.id)
      assert.equal(npcs.filter((id) => id.startsWith('yong-le-')).length, era.id === 'revival' ? YONGLE_MTM_NPCS.length : 0, era.id)
    }
  })

  test('兩個版本在不同的位置、形式不同：廟口是露天的攤位（沒有室內），現代是可以走進去的店面', () => {
    const a = MS(0, 0)
    const b = YL(0, 0)
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) > 9, '兩個版本相距超過 9 m')
    // 廟口的攤位在慈聖宮的廟埕（迪化街南側），永樂米苔目在迪化街北側，中間隔著街道
    assert.ok(a.z > 2.8 && b.z < -2.8)
    assert.equal(stall.hasInterior, undefined)
    assert.equal(shop.hasInterior, true)
    assert.ok(!postwar.interiors.length || !postwar.interiors.some((item) => /mi-tai-mu/.test(item.id)))
    // 形式：攤位只有攤台、帆布棚與桌椅（2.6 m 寬），店面是 4.6 m 寬、四層樓的街屋
    const stallBox = postwar.buildings.find((item) => item.id === 'site-temple-mi-tai-mu-stall').box
    const shopBox = revival.buildings.find((item) => item.id === 'site-yong-le-mi-tai-mu').box
    assert.ok(stallBox.maxY < 3 && shopBox.maxY > 12, `${stallBox.maxY} / ${shopBox.maxY}`)
  })

  test('同一個飲食主題串連，但不寫成傳承：內容寫明不是前身，也不寫成永樂米苔目當時已經存在', () => {
    assert.equal(MI_TAI_MU_THEME.title, '米苔目飲食文化')
    assert.equal(getTheme('mi-tai-mu'), MI_TAI_MU_THEME)
    assert.equal(stall.theme, 'mi-tai-mu')
    assert.equal(shop.theme, 'mi-tai-mu')
    assert.deepEqual(getThemeVersions(stall).map((item) => [item.eraId, item.shop.id]), [['revival', 'yong-le-mi-tai-mu']])
    assert.deepEqual(getThemeVersions(shop).map((item) => [item.eraId, item.shop.id]), [['postwar', 'temple-mi-tai-mu-stall']])
    const a = shopText(stall)
    const b = shopText(shop)
    assert.match(a, /不是2000年之後永樂米苔目的前身/)
    assert.match(a, /沒有表示這個攤位是永樂米苔目的前身/)
    assert.match(a, /不表示永樂米苔目當時已經在這裡擺攤/)
    assert.match(b, /不是這家店的前身/)
    assert.doesNotMatch(a, /永樂米苔目(的攤位|當時就是|從這裡)/)
    // 廟口的攤位：飲食文化情境示意，沒有店名、年份與店史
    assert.equal(stall.scenarioNote, '飲食文化情境示意')
    assert.equal(stall.year, undefined)
    assert.equal(shop.year, undefined)
  })

  test('廟口的米苔目：介紹米苔目是庶民小吃（使用者提供的那一段），分開標示史料與情境設計；招牌只寫「米苔目」', () => {
    const intro = stall.chapters.find((chapter) => chapter.id === 'temple-food')
    assert.equal(intro.lead, '米苔目是台灣常見的庶民小吃，在戰後至1980年代的大稻埕，也屬於廟口與街邊常見的日常飲食之一。')
    assert.ok(intro.paragraphs.some((p) => p.startsWith('史料｜')))
    assert.ok(intro.paragraphs.some((p) => p.startsWith('情境設計｜')))
    assert.ok(intro.paragraphs.some((p) => p.startsWith('說明｜') && /沒有找到/.test(p)))
    const signs = postwar.signs.filter((sign) => Math.hypot(sign.position[0] - MS(0, 0).x, sign.position[2] - MS(0, 0).z) < 2.5)
    assert.deepEqual([...new Set(signs.map((sign) => sign.text))], ['米苔目'])
    // 不套用現代永樂米苔目的紅色大招牌
    assert.ok(!postwar.signs.some((sign) => /^mitaimu|takeawayRed|tableNumber/.test(sign.style)))
    const bowl = stall.chapters.find((chapter) => chapter.id === 'bowl')
    assert.deepEqual(bowl.items.map((item) => item.name), ['湯米苔目', '小菜（示意）'])
  })

  test('永樂米苔目的店家資料：id、店名、地址、類型；只在老屋新生；一樓可以進去；創立年份留空', () => {
    assert.equal(shop.name, '永樂米苔目')
    assert.equal(shop.address, '臺北市大同區民樂街111號')
    assert.equal(shop.status, 'open')
    assert.deepEqual(Object.keys(shop.buildingByEra), ['revival'])
    assert.match(shop.yearNote, /未核實/)
    const intro = shop.chapters.find((chapter) => chapter.id === 'shop')
    assert.equal(intro.lead, '到了現代，大稻埕的傳統庶民飲食不只留在記憶裡，也以具體店家的形式延續下來。永樂米苔目就是其中一種代表性的小吃場景。')
    // 「50年老店」只是招牌上的文字；媒體的說法標明未核實
    assert.ok(intro.paragraphs.some((p) => /50年老店/.test(p) && /未核實|沒有找到/.test(p) && /當成招牌上的文字/.test(p)))
    assert.deepEqual(shop.chapters.map((chapter) => chapter.tab), ['店家與店面', '店內的用餐空間', '一碗米苔目', '資料來源'])
    const foods = shop.chapters.find((chapter) => chapter.id === 'foods')
    assert.deepEqual(foods.items.map((item) => item.name), ['湯米苔目', '嘴邊肉', '油豆腐', '菜頭'])
  })

  test('來源：都存在、有網址、出版時間與用途；內容不寫價格與營業時間', () => {
    const ids = new Set()
    for (const item of [stall, shop]) {
      for (const id of item.sourceIds) ids.add(id)
      for (const chapter of item.chapters) for (const id of chapter.sourceIds ?? []) ids.add(id)
    }
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https:\/\//, id)
      assert.ok(source.published && source.usage, `${id} 標示出版時間與用途`)
    }
    for (const id of ['moe-bi-thai-bak', 'bella-2021-yongle-market', 'bella-2025-dadaocheng', 'tvbs-2013-temple-food', 'tvbs-2013-apang']) assert.ok(ids.has(id), id)
    for (const item of [stall, shop]) {
      const text = shopText(item)
      assert.doesNotMatch(text, /\d+\s*元|\$\s*\d|NT\$/, `${item.id} 不寫價格`)
      assert.doesNotMatch(text, /\d{1,2}[:：]\d{2}/, `${item.id} 不寫營業時間`)
    }
    // 招牌上的數字：只有「50年老店」與桌號，沒有價格
    for (const sign of revival.signs.filter((s) => /^mitaimu|takeawayRed|tableNumber/.test(s.style))) {
      if (/\d/.test(sign.text)) assert.ok(sign.text === '50年老店' || /^\d$/.test(sign.text), sign.text)
    }
  })
})

describe('永樂米苔目：店面、走進店裡與碰撞', () => {
  test('店面（依照片）：紅色主招牌的金色立體字「永樂米苔目」、右側「50年老店」、左右兩面紅色直立招牌、外帶區', () => {
    const signs = revival.signs.filter((sign) => Math.abs(sign.position[0] - YL(0, 0).x) < 3.5 && sign.position[2] < -1.4 && sign.position[2] > -16)
    const main = signs.find((sign) => sign.style === 'mitaimuGold')
    assert.equal(main?.text, '永樂米苔目')
    assert.ok(main.position[1] > YONGLE_MTM.arcadeCeiling && main.position[1] < YONGLE_MTM.groundH + 0.6)
    assert.ok(signs.some((sign) => sign.style === 'mitaimuSmall' && sign.text === '50年老店' && sign.vertical))
    const sides = signs.filter((sign) => sign.style === 'mitaimuVertical')
    assert.equal(sides.length, 4, '兩面直立招牌、各兩面')
    const xs = [...new Set(sides.map((sign) => Math.sign(sign.position[0] - YL(0, 0).x)))]
    assert.deepEqual(xs.sort(), [-1, 1], '左右兩側')
    assert.ok(signs.some((sign) => sign.style === 'takeawayRed' && sign.text === '外帶區'))
  })

  test('永樂米苔目（連同右側的鄰屋）不覆蓋其他建築；只取代 north-6 這個一般地段', () => {
    const mine = revival.buildings.filter((item) => item.storeId === 'yong-le-mi-tai-mu')
    const others = revival.buildings.filter((item) => item.storeId !== 'yong-le-mi-tai-mu')
    const site = mine.find((item) => item.id === 'site-yong-le-mi-tai-mu').box
    for (const other of others) {
      const b = other.box
      const overlap = Math.min(site.maxX, b.maxX) - Math.max(site.minX, b.minX) > 0.05 && Math.min(site.maxZ, b.maxZ) - Math.max(site.minZ, b.minZ) > 0.05
      assert.ok(!overlap, `與 ${other.id} 重疊`)
    }
    assert.ok(!revival.buildings.some((item) => item.id === 'north-6'))
    assert.ok(worlds.modern.buildings.some((item) => item.id === 'north-6'))
  })

  for (const step of [0.05, 0.15]) {
    test(`從迪化街走到店門口、入口、走道與後方，再原路回到街上（每步 ${step} m）`, () => {
      const p = { ...YL(1.0, 3.6), level: 0, y: 0 }
      followRoute(revival, p, IN, step, YL)
      followRoute(revival, p, OUT, step, YL)
    })
  }

  test('連續進出 5 次：每次都回到同一個地方、沒有卡住', () => {
    const p = { ...YL(1.0, 3.6), level: 0, y: 0 }
    const ends = []
    for (let i = 0; i < 5; i++) {
      followRoute(revival, p, IN, 0.15, YL)
      followRoute(revival, p, OUT, 0.15, YL)
      ends.push([p.x, p.z])
    }
    for (const [x, z] of ends) assert.ok(Math.hypot(x - ends[0][0], z - ends[0][1]) < 0.2)
  })

  test('走道至少兩個角色身寬；入口比兩個角色寬；機車與排隊的人不擋住入口', () => {
    const aisle = yongleMtmAisle()
    assert.ok(aisle.width >= PLAYER.radius * 4, `走道 ${aisle.width.toFixed(2)} m`)
    const blockers = [YONGLE_MTM.blower.minX, ...YONGLE_MTM_NPCS.filter((npc) => !npc.table && npc.z > -1.6 && npc.x > 0).map((npc) => npc.x - 0.22)]
    const right = Math.min(...blockers)
    const left = Math.max(YONGLE_MTM.entrance.minX, ...YONGLE_MTM_NPCS.filter((npc) => npc.arcade).map((npc) => npc.x + 0.22))
    assert.ok(right - left >= PLAYER.radius * 2 + 0.3, `入口淨寬 ${(right - left).toFixed(2)} m`)
  })

  test('外帶區、機車、鋁櫃、鼓風機、桌椅、站著的人物、櫃台、冰箱與牆都不能穿越', () => {
    const t = yongleMtmTable('m2')
    const spots = [
      [(YONGLE_MTM.takeaway.minX + YONGLE_MTM.takeaway.maxX) / 2, -0.5, '外帶區'],
      [YONGLE_MTM.scooters[0].x, YONGLE_MTM.scooters[0].z, '機車'],
      [-1.2, 0.3, '鋁櫃'],
      [(YONGLE_MTM.blower.minX + YONGLE_MTM.blower.maxX) / 2, 1.25, '鼓風機'],
      [t.x, t.z, '桌子'],
      [t.x, t.z + YONGLE_MTM.stoolOffset, '圓凳'],
      [1.62, -0.62, '排隊的人'],
      [0.6, -9.9, '後方櫃台'],
      [-1.75, -10.0, '冰箱'],
      [-2.3, -5.0, '左牆'],
      [2.3, -5.0, '右牆'],
      [0.0, -11.0, '後牆'],
    ]
    for (const [x, z, label] of spots) assert.ok(!walkableAt(revival, YL(x, z).x, YL(x, z).z), label)
  })

  test('在店裡或騎樓換到其他年代：推到合法的戶外位置（街道上、地面高度、不在障礙物裡）', () => {
    const spots = [[0.95, -1.45], [-0.72, -3.0], [-0.9, -7.2], [0.6, -8.8], [1.0, 0.2], [1.0, 1.2], [-1.0, -5.0]]
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = worlds[era.id]
      for (const [x, z] of spots) {
        const p = { ...YL(x, z) }
        resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
        assert.ok(walkableAt(world, p.x, p.z), `${era.id} (${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.equal(groundAt(p, world.collision, 0, null).y, 0)
        assert.ok(p.z > YONGLE_MTM.site.z + YONGLE_MTM.arcade - PLAYER.radius - 0.01, `${era.id} 在街上：z ${p.z.toFixed(2)}`)
      }
    }
  })

  test('室內只在接近時另外產生；細小的擺飾另外合併（流暢模式不顯示）；頂點數有上限', () => {
    const interior = buildEraInteriorSync('revival', zone.building)
    assert.ok(interior.batches.length >= 3)
    assert.ok(interior.detailBatches.length > 0)
    const verts = (list) => list.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(verts(interior.batches) < 50000, `室內 ${verts(interior.batches)}`)
    assert.ok(verts(interior.detailBatches) < 30000, `細小擺飾 ${verts(interior.detailBatches)}`)
    assert.ok(zone.loadRadius < 10 && zone.showRadius > zone.loadRadius)
    for (const era of ERAS.filter((item) => item.id !== 'revival')) assert.equal(buildEraInteriorSync(era.id, 'site-yong-le-mi-tai-mu').batches.length, 0, era.id)
  })
})

describe('米苔目：情境人物（NPC）', () => {
  test('每一種外觀與姿勢都產生三個網格（身體、頭、右前臂），鞋底貼地、頂點數有上限', () => {
    for (const look of Object.keys(NPC_LOOKS)) {
      for (const pose of Object.keys(NPC_POSES)) {
        const g = buildNpcGeometry(look, pose, { seatY: 0.46 })
        for (const part of ['body', 'head', 'forearm']) assert.ok(g[part]?.attributes.position.count > 0, `${look}/${pose}/${part}`)
        assert.ok(g.body.attributes.color, '頂點色')
        assert.ok(Math.abs(g.body.boundingBox.min.y) < 0.005, `${look}/${pose} 鞋底 ${g.body.boundingBox.min.y.toFixed(3)}`)
        const verts = g.body.attributes.position.count + g.head.attributes.position.count + g.forearm.attributes.position.count
        assert.ok(verts < 12000, `${look}/${pose}：${verts}`)
      }
    }
    // 沿用主角的身形比例：站著的頭與主角同高
    assert.ok(Math.abs(buildNpcGeometry('revivalDiner', 'stand').headPivot.position[1] - (RIG.hipY + RIG.headY)) < 1e-6)
  })

  test('待機動作：夾菜、招手、舀湯時右前臂在動，頭會點、會轉；不會走動', () => {
    for (const pose of ['eat', 'wave', 'ladle']) {
      const values = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((t) => npcAnimation(NPC_POSES[pose], t, 0.1).elbow)
      assert.ok(Math.max(...values) - Math.min(...values) > 0.3, pose)
    }
    const source = readFileSync(new URL('../src/game/components/NpcLayer.jsx', import.meta.url), 'utf8')
    assert.doesNotMatch(source, /position\.(x|z)\s*[+-]?=/, '人物不會移動')
  })

  test('攤位的人物：攤販在攤台後、兩位客人坐在凳子上、一位站在旁邊；都不擋住通往攤台的通道', () => {
    const npcs = postwar.npcs.filter((npc) => npc.id.startsWith('temple-mi-tai-mu-'))
    assert.deepEqual(npcs.map((npc) => npc.pose).sort(), ['eat', 'eat', 'stand', 'wave'])
    for (const npc of MI_TAI_MU_STALL_NPCS.filter((item) => item.seat)) {
      const table = MI_TAI_MU_STALL.tables.find((t) => Math.abs(t.x - npc.x) < 1e-6)
      assert.ok(table && Math.abs(Math.abs(npc.z - table.z) - MI_TAI_MU_STALL.stoolOffset) < 1e-6, npc.id)
    }
    const vendor = MI_TAI_MU_STALL_NPCS.find((npc) => npc.id === 'vendor')
    assert.ok(vendor.z < -MI_TAI_MU_STALL.counter.depth, '攤販在攤台後面')
    // 從街邊走到攤台前（兩張小桌之間）
    const p = { ...MS(0, 3.4), level: 0, y: 0 }
    followRoute(postwar, p, STALL_ROUTE, 0.1, MS)
    // 站著的客人與攤販有碰撞
    for (const npc of MI_TAI_MU_STALL_NPCS.filter((item) => !item.seat)) assert.ok(!walkableAt(postwar, MS(npc.x, npc.z).x, MS(npc.x, npc.z).z), npc.id)
  })

  test('店裡的人物：坐著的客人在桌子前後的凳子上，站著的人不在走道與入口；店裡的人物跟著室內顯示', () => {
    for (const npc of YONGLE_MTM_NPCS) {
      const p = yongleMtmNpcPlacement(npc)
      const world = revival.npcs.find((item) => item.id === `yong-le-${npc.id}`)
      assert.ok(world, npc.id)
      if (npc.arcade) assert.equal(world.zone, undefined)
      else assert.equal(world.zone, 'yong-le-mi-tai-mu')
      if (p.seat) {
        assert.equal(world.seatY, 0.46)
        continue
      }
      const aisle = yongleMtmAisle()
      assert.ok(!(p.z < -1.6 && p.z > -9 && p.x > aisle.minX && p.x < aisle.maxX), `${npc.id} 不在走道`)
      assert.ok(!walkableAt(revival, YL(p.x, p.z).x, YL(p.x, p.z).z), `${npc.id} 有碰撞`)
    }
    const scene = readFileSync(new URL('../src/game/components/EraScene.jsx', import.meta.url), 'utf8')
    // 店裡的人物跟著所屬建築的室內一起顯示（同一棟建築的室內範圍共用一份室內）
    assert.match(scene, /zones\.some\(\(item\) => item\.id === npc\.zone\)/)
  })
})

describe('米苔目：熱點、點選、章節與鏡頭', () => {
  test('熱點：永樂米苔目三個（店門口、店內的用餐空間、一碗米苔目）、廟口兩個（攤位、只能點選的一碗）；各自對應一個章節', () => {
    assert.deepEqual(shop.hotspots.map((item) => [item.id, item.chapter]), [['storefront', 'shop'], ['dining', 'dining'], ['foods', 'foods']])
    assert.deepEqual(stall.hotspots.map((item) => [item.id, item.chapter]), [['stall', 'temple-food'], ['bowl', 'bowl']])
    assert.equal(stall.hotspots.find((item) => item.id === 'bowl').clickOnly, true)
    for (const item of [stall, shop]) for (const h of item.hotspots) assert.ok(item.chapters.some((chapter) => chapter.id === h.chapter), h.id)
  })

  test('熱點（連同離開時的緩衝）不和其他已開放店家的互動範圍重疊', () => {
    const EXIT_MARGIN = 0.7
    for (const [eraId, mineShop] of [['revival', shop], ['postwar', stall]]) {
      const circles = (item) => {
        const placement = getShopPlacement(item)
        if (placement.hotspots.length) return placement.hotspots.filter((h) => !h.clickOnly && (h.level ?? 0) === 0).map((h) => ({ point: h.interactionPoint, radius: h.radius }))
        return placement.level === 0 ? [{ point: placement.interactionPoint, radius: item.interaction?.radius ?? 3.2 }] : []
      }
      const others = ERAS.find((era) => era.id === eraId)
        .availableStores.filter((id) => id !== mineShop.id)
        .map(getShop)
        .filter((item) => item?.status === 'open')
      for (const mine of circles(mineShop)) {
        for (const other of others) {
          for (const theirs of circles(other)) {
            const d = Math.hypot(mine.point.x - theirs.point.x, mine.point.z - theirs.point.z)
            assert.ok(d >= mine.radius + EXIT_MARGIN + theirs.radius, `${mineShop.id} 與 ${other.id}：相距 ${d.toFixed(2)} m`)
          }
        }
      }
    }
  })

  test('按 E／點提示開啟對應的章節；點攤台上的那一碗開啟「一碗米苔目」；建築觀賞模式不開啟介紹', () => {
    const index = (item, id) => item.chapters.findIndex((chapter) => chapter.id === id)
    for (const [hotspot, chapter] of [['storefront', 'shop'], ['dining', 'dining'], ['foods', 'foods']]) {
      useGameStore.getState().setNearbyShop('yong-le-mi-tai-mu', hotspot)
      useGameStore.getState().interact()
      assert.equal(useGameStore.getState().chapterIndex, index(shop, chapter), hotspot)
      useGameStore.getState().closeShop()
    }
    resetStore('postwar')
    useGameStore.getState().setNearbyShop('temple-mi-tai-mu-stall', 'stall')
    useGameStore.getState().interact()
    assert.equal(useGameStore.getState().chapterIndex, index(stall, 'temple-food'))
    useGameStore.getState().closeShop()
    useGameStore.getState().setNearbyShop('temple-mi-tai-mu-stall', 'stall')
    useGameStore.getState().interact('bowl')
    assert.equal(useGameStore.getState().activeHotspotId, 'bowl')
    assert.equal(useGameStore.getState().chapterIndex, index(stall, 'bowl'))
    useGameStore.getState().closeShop()
    useGameStore.getState().setViewMode('viewer')
    assert.equal(useGameStore.getState().openShop('temple-mi-tai-mu-stall', 'bowl'), false)
    useGameStore.getState().setViewMode('explore')
  })

  test('點選：攤台上的那一碗（從高處往下看也點得到）、招牌、菜單板、一碗米苔目各自是可以點選、聚焦的細部目標', () => {
    const dir = (a, b) => {
      const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
      const l = Math.hypot(d.x, d.y, d.z)
      return { x: d.x / l, y: d.y / l, z: d.z / l }
    }
    const top = MI_TAI_MU_STALL.counter.height + 0.06
    const bowl = { ...MS(MI_TAI_MU_STALL.bowl.x, MI_TAI_MU_STALL.bowl.z), y: top + 0.05 }
    // 從攤位前方不同的距離與高度看那一碗（包括 iPad 預設鏡頭那樣從高處往下看）
    for (const [dz, y] of [[1.2, 1.6], [2.4, 2.2], [3.2, 3.0], [3.6, 3.6]]) {
      const cam = { ...MS(MI_TAI_MU_STALL.bowl.x + 0.1, dz), y }
      const hit = pickBuilding(cam, dir(cam, bowl), postwar.buildings)
      assert.equal(hit?.id, 'temple-mi-tai-mu-bowl', `${dz}, ${y}`)
      assert.equal(hit.hotspot, 'bowl')
    }
    const signCam = { ...YL(0, 7.5), y: 2.0 }
    const sign = { ...YL(-0.3, YONGLE_MTM.arcade + 0.2), y: YONGLE_MTM.arcadeCeiling + 0.5 }
    const hitSign = pickBuilding(signCam, dir(signCam, sign), revival.buildings)
    assert.equal(hitSign?.id, 'yong-le-signs')
    assert.equal(hitSign.hotspot, 'storefront')
    const m = YONGLE_MTM.menuBoard
    const menuCam = { ...YL(0.6, (m.minZ + m.maxZ) / 2), y: 1.6 }
    const menu = { ...YL(YONGLE_MTM.room.maxX - 0.05, (m.minZ + m.maxZ) / 2), y: (m.y0 + m.y1) / 2 }
    assert.equal(pickBuilding(menuCam, dir(menuCam, menu), revival.buildings)?.id, 'yong-le-menu')
    const t = yongleMtmTable(YONGLE_MTM.foodTable)
    const foodCam = { ...YL(-0.9, t.z), y: 1.5 }
    const food = { ...YL(t.x - 0.1, t.z), y: YONGLE_MTM.table.height + 0.1 }
    assert.equal(pickBuilding(foodCam, dir(foodCam, food), revival.buildings)?.id, 'yong-le-foods')
  })

  test('介紹鏡頭不在任何方塊裡、看得到熱點；店裡的鏡頭在天花板下', () => {
    for (const [world, item] of [[revival, shop], [postwar, stall]]) {
      const placement = getShopPlacement(item)
      for (const shot of [...placement.hotspots.map((h) => ({ id: h.id, camera: h.camera })), { id: 'default', camera: placement.camera }]) {
        const cam = shot.camera.position
        assert.ok(!world.blockers.some((box) => insideBox(cam, box)), `${item.id}/${shot.id}：${JSON.stringify(cam)}`)
        assert.ok(!segmentBlocked(cam, shot.camera.target, world.blockers.filter((box) => !insideBox(shot.camera.target, box, 0.02))), `${item.id}/${shot.id} 看得到注視點`)
        if (cam.x > zone.minX && cam.x < zone.maxX && cam.z > zone.minZ && cam.z < zone.maxZ) assert.ok(cam.y < YONGLE_MTM.ceiling - 0.3, `${shot.id} y=${cam.y}`)
      }
    }
  })

  test('走進店裡與走出來的每一步：第三人稱鏡頭（四個方向）不在方塊裡，店裡的鏡頭在天花板下', () => {
    const p = { ...YL(1.0, 3.6), level: 0, y: 0 }
    const route = [...IN, ...OUT]
    let checked = 0
    for (const [x, z] of route) {
      const target = YL(x, z)
      for (let n = 0; n < 400; n++) {
        const dx = target.x - p.x
        const dz = target.z - p.z
        const d = Math.hypot(dx, dz)
        if (d < 0.15) break
        stepTo(revival, p, p.x + (dx / d) * 0.15, p.z + (dz / d) * 0.15)
        const heading = Math.atan2(dx, dz)
        for (const offset of [0, Math.PI / 2, -Math.PI / 2, Math.PI]) {
          const cam = followCamera(revival, p, heading + Math.PI + offset)
          assert.ok(!revival.blockers.some((box) => insideBox(cam, box, -0.02)), `(${p.x.toFixed(2)}, ${p.z.toFixed(2)}) 方向 ${offset.toFixed(2)}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`)
          if (cam.k >= 0.999) assert.ok(cam.y < YONGLE_MTM.ceiling, `店裡鏡頭 y=${cam.y.toFixed(2)}`)
          checked++
        }
      }
    }
    assert.ok(checked > 200)
  })

  test('店門前的街上：人物背對店面走出來時，第三人稱鏡頭停在主招牌與騎樓的梁前面，不在方塊裡', () => {
    const away = YL(0, 1)
    const origin = YL(0, 0)
    const heading = Math.atan2(away.x - origin.x, away.z - origin.z)
    let checked = 0
    for (let z = 1.8; z <= 4.6; z += 0.2) {
      for (let x = -1.6; x <= 1.6; x += 0.4) {
        const p = { ...YL(x, z), level: 0, y: 0 }
        if (!walkableAt(revival, p.x, p.z)) continue
        for (const offset of [0, 0.5, -0.5]) {
          const cam = followCamera(revival, p, heading + Math.PI + offset)
          assert.ok(!revival.blockers.some((box) => insideBox(cam, box, -0.02)), `(${x.toFixed(1)}, ${z.toFixed(1)}) ${offset}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`)
          checked++
        }
      }
    }
    assert.ok(checked > 100, `${checked}`)
  })

  test('建築觀賞模式：聚焦立面時鏡頭在迪化街上；注視點可以進到騎樓與店裡', () => {
    const space = viewerSpaceOf(revival)
    const record = revival.buildings.find((item) => item.id === 'site-yong-le-mi-tai-mu')
    const plan = planBuildingFocus(record, revival.blockers, { yaw: 0, aspect: 1.44, fov: 50, space })
    const cam = { x: plan.target.x + Math.sin(plan.yaw) * Math.cos(plan.pitch) * plan.distance, y: plan.target.y + Math.sin(plan.pitch) * plan.distance, z: plan.target.z + Math.cos(plan.yaw) * Math.cos(plan.pitch) * plan.distance }
    assert.ok(cam.z > YONGLE_MTM.site.z + YONGLE_MTM.arcade, `鏡頭 z ${cam.z.toFixed(2)}`)
    assert.ok(revival.viewerRegions.some((r) => r.maxY && YL(0, -5).x > r.minX && YL(0, -5).x < r.maxX && YL(0, -5).z > r.minZ && YL(0, -5).z < r.maxZ))
  })
})

describe('廟口的米苔目攤：位置與榕樹', () => {
  test('在廟口小吃群裡：與廟埕的其他小吃攤、共用桌椅與魷魚羹攤相鄰；不佔用廟門與中央通道', () => {
    const a = MS(0, 0)
    const squid = templeStallToWorld(0, 0)
    assert.ok(Math.hypot(a.x - squid.x, a.z - squid.z) < 8, '與魷魚羹攤都在廟埕的前緣')
    // 從街上沿著中央通道走到廟前的台階
    const p = { ...templeCourtToWorld(0, 1.5), level: 0, y: 0 }
    // 天公爐前（廟埕本地 z -3.95 起是天公爐）
    const miss = walkTo(postwar, p, templeCourtToWorld(0, -3.55), 0.1)
    assert.ok(miss < 0.15, `中央通道：卡在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    // 攤位不碰到東側榕樹的石座，也不在廟埕的矮牆外
    const half = MI_TAI_MU_STALL.canopy.half
    const left = MI_TAI_MU_STALL.court.x - half
    assert.ok(left > -12 / 2 + 0.3, '在東側矮牆內')
    assert.ok(MI_TAI_MU_STALL.court.z + MI_TAI_MU_STALL.canopy.back > -2.4 + 0.95 + 0.05, '不碰到榕樹的石座')
  })

  test('戰後的東側榕樹在攤位上方讓出空間；西側（魷魚羹攤）不變；其他年代的榕樹不變', () => {
    const c = MI_TAI_MU_STALL.clearing
    const roots = (clearing) => {
      const b = new PartBuilder()
      buildTree(b, [-3.6, 0, -2.4], { scale: 0.9, seed: 299, banyan: true, clearing })
      return b.build().reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    }
    assert.notEqual(roots(c), roots(null))
    const temple = getShop('ci-sheng-gong')
    assert.deepEqual(temple.buildingByEra.postwar.eastClearing, c)
    assert.equal(temple.buildingByEra.postwar.frontStall, false)
    assert.deepEqual(temple.buildingByEra.postwar.clearing, TEMPLE_STALL.clearing)
    assert.equal(temple.buildingByEra.revival.eastClearing, undefined)
    assert.equal(temple.buildingByEra.revival.frontStall, undefined)
  })
})
