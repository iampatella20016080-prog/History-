import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { beforeEach, describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopBuilding, getTheme, getThemeVersions } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import {
  LAO_PAN,
  LAO_PAN_HOTSPOTS,
  SQUID_SOUP_THEME,
  TEMPLE_COURT,
  TEMPLE_STALL,
  TEMPLE_STALL_HOTSPOTS,
  laoPanAisle,
  laoPanTable,
  laoPanToWorld,
  templeCourtToWorld,
  templeStallToWorld,
} from '../src/data/squidSoupLayout.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildTree } from '../src/game/builders/environment.js'
import { LAO_PAN_DISHES } from '../src/game/builders/laoPanFoodDisplay.js'
import { groundAt, raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import {
  allowedDistance,
  clampViewerTarget,
  followAllowed,
  inFollowArea,
  indoorFollow,
  interiorAmount,
  orbitDirection,
  pickBuilding,
  planBuildingFocus,
  segmentBlocked,
  viewerSpaceOf,
} from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 魷魚羹的兩個年代版本：1945–1980 慈聖宮廟口的魷魚羹攤（飲食文化情境示意）與 2000–現在的老潘魷魚羹。
 * 兩者以飲食主題串連，但位置、模型、碰撞、互動與故事各自獨立，只在自己的年代出現。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const postwar = worlds.postwar
const revival = worlds.revival
const stall = getShop('temple-squid-stall')
const laoPan = getShop('lao-pan-squid-soup')
const zone = revival.interiors.find((item) => item.id === 'lao-pan-squid-soup')
const space = viewerSpaceOf(revival)
const postwarSpace = viewerSpaceOf(postwar)
const LP = (x, z) => laoPanToWorld(x, z)
const TS = (x, z) => templeStallToWorld(x, z)
const TC = (x, z) => templeCourtToWorld(x, z)
const ROOM_Y = 0

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function overlaps(a, b, pad = 0.05) {
  return a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
}

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function player(x, z) {
  return { x, z, level: 0, y: 0 }
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

function followRoute(world, p, route, step, toWorld = LP) {
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

function shopText(shop) {
  const parts = [shop.summary, shop.yearNote, ...Object.values(shop.eraNotes ?? {})]
  for (const chapter of shop.chapters) {
    parts.push(chapter.title, chapter.lead, chapter.intro, chapter.footnote, chapter.disclaimer, ...(chapter.paragraphs ?? []))
    for (const item of chapter.items ?? []) parts.push(item.name, item.description, item.note)
    for (const fact of chapter.facts ?? []) parts.push(fact.value)
  }
  return parts.filter(Boolean).join('\n')
}

// 老潘：從永樂市場前廣場走到店門口、攤車旁的入口、店裡的座位，再原路回到街上（建築本地座標）
const IN = [
  [0.6, 2.4, '店門口的街上'],
  [0.6, 1.0, '騎樓'],
  [0.6, -0.4, '入口（攤車旁）'],
  [0.0, -2.6, '走道'],
  [LAO_PAN_HOTSPOTS[2].point[0], LAO_PAN_HOTSPOTS[2].point[1], '四道餐點的桌旁'],
  [0.0, -4.4, '走道深處'],
  [0.15, -5.4, '貓的旁邊'],
  [0.0, -6.2, '後牆前'],
]
const OUT = [
  [0.0, -4.4, '走道'],
  [0.0, -2.6, '走道'],
  [0.6, -0.4, '入口'],
  [0.6, 1.0, '騎樓'],
  [0.6, 2.4, '街上'],
]

describe('魷魚羹：兩個年代版本', () => {
  test('只在各自的年代出現：1945–1980 廟口的魷魚羹攤、2000–現在的老潘魷魚羹；其他三個年代都沒有', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      assert.equal(era.availableStores.includes('temple-squid-stall'), era.id === 'postwar', era.id)
      assert.equal(era.availableStores.includes('lao-pan-squid-soup'), era.id === 'revival', era.id)
      assert.equal(world.buildings.some((item) => item.storeId === 'temple-squid-stall'), era.id === 'postwar', era.id)
      assert.equal(world.buildings.some((item) => item.storeId === 'lao-pan-squid-soup'), era.id === 'revival', era.id)
      assert.equal(world.signs.some((sign) => /老潘|冷氣開放/.test(sign.text)), era.id === 'revival', era.id)
      assert.equal(world.signs.some((sign) => sign.text === '魷魚羹'), era.id === 'postwar', era.id)
      assert.equal(world.cats.length, era.id === 'revival' ? 1 : 0, era.id)
      assert.equal(world.interiors.some((item) => item.id === 'lao-pan-squid-soup'), era.id === 'revival', era.id)
      // 老潘取代的地段：其他年代仍是一般街屋
      for (const id of LAO_PAN.site.replaces) assert.equal(world.buildings.some((item) => item.id === id), era.id !== 'revival', `${era.id} ${id}`)
      assert.equal(getShopBuilding(stall, era.id) !== null, era.id === 'postwar')
      assert.equal(getShopBuilding(laoPan, era.id) !== null, era.id === 'revival')
    }
  })

  test('兩個版本在不同的位置：廟口的攤位在慈聖宮的廟埕，老潘在永樂市場前廣場旁；廟口沒有長出老潘的店屋', () => {
    const temple = getShop('ci-sheng-gong')
    assert.deepEqual([TEMPLE_COURT.x, TEMPLE_COURT.z], [temple.position.x, temple.position.z])
    assert.equal(getShopPlacement(temple).rotationY, TEMPLE_COURT.rotationY)
    assert.ok(Math.hypot(stall.site.x - laoPan.site.x, stall.site.z - laoPan.site.z) > 20)
    // 攤位在廟埕裡（廟埕本地 x ±6、z -6.2 – 1.7）
    for (const [x, z] of [[-S().counter.half, -S().counter.depth], [S().counter.half, S().tables[0].z + 0.5]]) {
      const cx = TEMPLE_STALL.court.x + x
      const cz = TEMPLE_STALL.court.z + z
      assert.ok(Math.abs(cx) < 5.7 && cz > -6.2 && cz < 1.75, `${cx}, ${cz}`)
    }
    // 老潘的東牆就是街屋列的盡頭，緊鄰永樂市場前廣場
    const footprint = revival.buildings.find((item) => item.id === 'site-lao-pan-squid-soup').box
    assert.ok(Math.abs(footprint.maxX - 36) < 0.1, footprint.maxX)
    // 戰後的廟埕旁沒有老潘的店屋（老潘的招牌、雨棚都不在戰後）
    assert.ok(!postwar.buildings.some((item) => /lao-pan/.test(item.id)))
  })

  test('同一個飲食主題串連，但不寫成傳承：兩個版本的主題相同，內容寫明不是前身、不是遷出', () => {
    assert.equal(stall.theme, SQUID_SOUP_THEME.id)
    assert.equal(laoPan.theme, SQUID_SOUP_THEME.id)
    assert.equal(getTheme(SQUID_SOUP_THEME.id).title, '魷魚羹飲食文化')
    assert.deepEqual(getThemeVersions(stall).map((item) => [item.eraId, item.shop.id]), [['revival', 'lao-pan-squid-soup']])
    assert.deepEqual(getThemeVersions(laoPan).map((item) => [item.eraId, item.shop.id]), [['postwar', 'temple-squid-stall']])
    const a = shopText(stall)
    const b = shopText(laoPan)
    assert.match(a, /不是2000年之後老潘魷魚羹的前身|沒有表示這個攤位是老潘的前身/)
    assert.match(a, /不表示老潘從廟口遷出/)
    assert.match(b, /那個攤位不是老潘的前身，老潘也不是從廟口遷出/)
    // 老潘沒有創立年份，也沒有被放進 1945–1980
    assert.equal(laoPan.year, undefined)
    assert.equal(laoPan.yearLabel, undefined)
    assert.match(laoPan.yearNote, /未核實/)
    assert.doesNotMatch(b, /創立於|創業於|成立於\d|開業於|\d+年的老店|老字號/)
  })

  test('廟口的攤位：飲食文化情境示意、招牌只寫「魷魚羹」、內容分開標示史料與情境設計', () => {
    assert.equal(stall.scenarioNote, '飲食文化情境示意')
    const near = postwar.signs.filter((sign) => Math.hypot(sign.position[0] - stall.site.x, sign.position[2] - stall.site.z) < 2.5)
    assert.deepEqual(near.map((sign) => sign.text), ['魷魚羹'])
    const chapter = stall.chapters.find((item) => item.id === 'temple-food')
    assert.equal(chapter.title, '魷魚羹與廟口飲食')
    assert.ok(chapter.paragraphs.some((text) => text.startsWith('史料｜')))
    assert.ok(chapter.paragraphs.some((text) => text.startsWith('情境設計｜')))
    assert.ok(chapter.paragraphs.some((text) => text.startsWith('專欄的說法｜')))
    assert.match(stall.chapters.at(-1).disclaimer, /飲食文化情境示意/)
    assert.doesNotMatch(shopText(stall), /老潘魷魚羹的(招牌|商標|照片)/)
  })

  test('老潘的店家資料：id、店名、地址、類型；只在老屋新生；一樓可以進去', () => {
    assert.equal(laoPan.name, '老潘魷魚羹')
    assert.equal(laoPan.address, '臺北市大同區迪化街一段30號')
    assert.equal(laoPan.category, '傳統小吃・羹湯')
    assert.equal(laoPan.hasInterior, true)
    assert.equal(laoPan.status, 'open')
    assert.deepEqual(Object.keys(laoPan.buildingByEra), ['revival'])
    assert.deepEqual(Object.keys(stall.buildingByEra), ['postwar'])
  })

  test('老潘四個章節：店家與位置／市場周邊飲食／代表餐點／資料來源；四道展示餐點的品名', () => {
    assert.deepEqual(laoPan.chapters.map((item) => item.tab), ['店家與位置', '市場周邊飲食', '代表餐點', '資料來源'])
    const foods = laoPan.chapters.find((item) => item.type === 'foods')
    const names = ['沙茶魷魚羹', '魚酥羹', '甜不辣', '乾拌沙茶生魷魚']
    assert.deepEqual(foods.items.map((item) => item.name), names)
    assert.deepEqual(LAO_PAN_DISHES.map((item) => item.name), names)
    assert.deepEqual(LAO_PAN_DISHES.map((item) => item.id), foods.items.map((item) => item.id))
    const illustrations = readFileSync(new URL('../src/ui/FoodIllustration.jsx', import.meta.url), 'utf8')
    for (const item of [...foods.items, ...stall.chapters.find((c) => c.type === 'foods').items]) {
      assert.match(illustrations, new RegExp(`'?${item.id}'?: [A-Z]`), `${item.id} 的插圖`)
    }
    assert.match(foods.intro, /不代表完整或即時的菜單/)
  })

  test('來源：都存在、有網址、出版時間與用途；包含使用者提供的兩個網址；內容不寫價格與營業時間', () => {
    const ids = new Set()
    for (const shop of [stall, laoPan]) {
      for (const id of shop.sourceIds ?? []) ids.add(id)
      for (const chapter of shop.chapters) for (const id of chapter.sourceIds ?? []) ids.add(id)
    }
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https?:\/\//, id)
    }
    for (const id of ids) {
      assert.ok(getSource(id).published, `${id} 出版時間`)
      assert.ok(getSource(id).usage, `${id} 用途`)
    }
    const urls = [...ids].map((id) => getSource(id).url)
    assert.ok(urls.includes('https://www.facebook.com/pannoodles/about/'))
    assert.ok(urls.includes('https://puddings.tw/pannoodles/'))
    assert.match(getSource('puddings-2023-pannoodles').usage, /不當成最新的價格、營業時間或歷史文獻/)
    for (const shop of [stall, laoPan]) {
      const text = shopText(shop)
      assert.doesNotMatch(text, /\d+\s*元|NT\$|\d{1,2}[:：]\d{2}|公休/, shop.id)
    }
    for (const id of ids) assert.doesNotMatch(getSource(id).context ?? '', /\d+\s*元|NT\$|\d{1,2}[:：]\d{2}/, id)
  })

  test('黑白貓：照片參考的情境角色，沒有名字，也不表示由店家飼養', () => {
    const text = shopText(laoPan)
    assert.match(text, /情境角色/)
    assert.match(text, /不知道牠的名字，也不表示牠是店家飼養的貓/)
    const source = readFileSync(new URL('../src/game/components/LaoPanCat.jsx', import.meta.url), 'utf8')
    assert.match(source, /沒有名字/)
  })
})

function S() {
  return TEMPLE_STALL
}

describe('老潘：店面、走進店裡與碰撞', () => {
  test('店面：黃色主招牌（紅色店名、深藍色品名）、紅底直立招牌（兩面）、雨棚的「冷氣開放」；店內的品名板不寫價格', () => {
    const signs = revival.signs
    assert.ok(signs.some((sign) => sign.text === '老潘魷魚羹' && sign.style === 'laopanName'))
    assert.ok(signs.some((sign) => sign.text === '魷魚羹・魚酥羹・甜不辣' && sign.style === 'laopanSub'))
    assert.equal(signs.filter((sign) => sign.text === '老潘魷魚羹' && sign.style === 'laopanVertical' && sign.vertical).length, 2)
    assert.ok(signs.some((sign) => sign.text === '冷氣開放' && sign.style === 'awningRed'))
    const menu = signs.find((sign) => sign.style === 'laopanMenu')
    assert.ok(menu && /魷魚羹/.test(menu.text))
    for (const sign of signs.filter((item) => /^(laopan|awningRed)/.test(item.style))) assert.doesNotMatch(sign.text, /\d/, sign.text)
    // 招牌的字面向迪化街（直立招牌的兩面朝向店面的左右）
    const name = signs.find((sign) => sign.style === 'laopanName')
    assert.ok(name.position[2] < LAO_PAN.site.z - LAO_PAN.arcade, '主招牌在騎樓外緣的立面上')
  })

  test('老潘不覆蓋小藝埕、稻舍、永樂市場、豆花店或其他建築', () => {
    const mine = revival.buildings.filter((item) => /lao-pan/.test(item.id))
    const others = revival.buildings.filter((item) => !/lao-pan/.test(item.id))
    assert.ok(mine.length >= 4)
    for (const id of ['yong-le-market', 'luguo-cafe', 'dao-she', 'action-bar']) assert.ok(others.some((item) => item.storeId === id), `${id} 仍在街上`)
    for (const a of mine) {
      for (const part of a.parts) {
        for (const o of others) {
          for (const other of o.parts) assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, `${a.id} 與 ${o.id} 重疊`)
        }
      }
    }
  })

  for (const step of [0.05, 0.15]) {
    test(`從永樂市場前廣場走到店門口，經過攤車旁的入口走到座位，再原路回到街上（每步 ${step} m）`, () => {
      const p = player(38.2, 1.6)
      followRoute(revival, p, IN, step)
      followRoute(revival, p, OUT, step)
      assert.equal(p.y, 0)
    })
  }

  test('連續進出 5 次：每次都回到同一個地方、沒有卡住', () => {
    const p = player(...Object.values(LP(0.6, 2.4)))
    const start = { x: p.x, z: p.z }
    for (let i = 0; i < 5; i++) {
      followRoute(revival, p, IN, 0.12)
      followRoute(revival, p, OUT, 0.12)
      assert.ok(Math.hypot(p.x - start.x, p.z - start.z) < 0.15, `第 ${i + 1} 次`)
    }
  })

  test('中央走道至少兩個角色身寬；入口比兩個角色寬', () => {
    const aisle = laoPanAisle()
    assert.ok(aisle.width >= PLAYER.radius * 4 + 0.05, `走道 ${aisle.width.toFixed(2)} m`)
    assert.ok(LAO_PAN.entrance.maxX - LAO_PAN.entrance.minX >= PLAYER.radius * 4 + 0.05)
    // 走道上每 0.25 m 都站得下（貓所在的那一段也是）
    for (let z = -0.6; z > LAO_PAN.room.minZ + 0.4; z -= 0.25) {
      assert.ok(walkableAt(revival, LP(0, z).x, LP(0, z).z), `走道 z ${z.toFixed(2)}`)
      assert.ok(walkableAt(revival, LP(0.2, z).x, LP(0.2, z).z) || walkableAt(revival, LP(-0.2, z).x, LP(-0.2, z).z), `走道兩側 z ${z.toFixed(2)}`)
    }
  })

  test('攤車、工作區、瀝水區、桌椅、貓、冰箱、牆與後場都不能穿越', () => {
    const blocked = [
      [(LAO_PAN.counter.minX + LAO_PAN.counter.maxX) / 2, (LAO_PAN.counter.minZ + LAO_PAN.counter.maxZ) / 2, '攤車'],
      [-1.0, 0.0, '攤車後方的工作區'],
      [(LAO_PAN.sink.minX + LAO_PAN.sink.maxX) / 2, -1.0, '瀝水區'],
      [LAO_PAN.cat.x, LAO_PAN.cat.z, '貓'],
      [(LAO_PAN.fridge.minX + LAO_PAN.fridge.maxX) / 2, (LAO_PAN.fridge.minZ + LAO_PAN.fridge.maxZ) / 2, '冰箱'],
      [0.75, -7.4, '後場'],
      [2.3, -3.0, '右側的牆外'],
      [-2.3, -3.0, '左側的牆外（廣場側）'],
      [LAO_PAN.half - 0.2, LAO_PAN.arcade - 0.2, '騎樓的柱'],
    ]
    for (const t of LAO_PAN.tables) {
      blocked.push([t.x, t.z, `桌子 ${t.id}`])
      for (const s of [-1, 1]) blocked.push([t.x, t.z + s * LAO_PAN.stoolOffset, `凳子 ${t.id}`])
    }
    for (const [x, z, label] of blocked) {
      const p = LP(x, z)
      assert.ok(!walkableAt(revival, p.x, p.z), label)
    }
    // 從走道直直往桌子、凳子、攤車與牆推：都被擋在外面，但不會卡住，轉身就能離開
    for (const [tx, tz] of [[1.6, -2.55], [1.6, -4.85], [-1.6, -3.7], [-1.2, 0.8], [-2.5, -5.0], [2.5, -1.0]]) {
      const p = player(LP(0, (tz + 0) / 2 - 1.5).x, LP(0, (tz + 0) / 2 - 1.5).z)
      walkTo(revival, p, LP(tx, tz), 0.15)
      assert.ok(walkableAt(revival, p.x, p.z))
      const miss = walkTo(revival, p, LP(0, -3.0), 0.15)
      assert.ok(miss < 0.2, `從 (${tx}, ${tz}) 回到走道`)
    }
  })

  test('在店裡或騎樓換到其他年代：推到合法的戶外位置（街道上、地面高度、不在障礙物裡）', () => {
    const spots = [[0.0, -2.6], [0.15, -5.4], [0.45, -2.6], [0.6, -0.4], [0.6, 1.0], [0.0, -6.2]]
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = worlds[era.id]
      for (const [x, z] of spots) {
        const p = { ...LP(x, z) }
        resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
        assert.ok(walkableAt(world, p.x, p.z), `${era.id} (${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.equal(groundAt(p, world.collision, 0, null).y, 0)
        // 不在老潘的位置（那裡是一般街屋）
        assert.ok(p.z < LAO_PAN.site.z - LAO_PAN.arcade + PLAYER.radius + 0.01, `${era.id} 在街上：z ${p.z.toFixed(2)}`)
      }
    }
  })

  test('室內只在接近時另外產生；細小的擺飾另外合併（流暢模式不顯示）；頂點數有上限', () => {
    const interior = buildEraInteriorSync('revival', zone.building)
    assert.ok(interior.batches.length >= 3)
    assert.ok(interior.detailBatches.length > 0)
    const verts = (list) => list.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(verts(interior.batches) < 45000, `室內 ${verts(interior.batches)}`)
    assert.ok(verts(interior.detailBatches) < 40000, `細小擺飾 ${verts(interior.detailBatches)}`)
    // 出發點離店還很遠，不會一開始就產生
    const spawn = { x: PLAYER.spawn.x, z: PLAYER.spawn.z }
    const distance = Math.hypot(Math.max(zone.minX - spawn.x, 0, spawn.x - zone.maxX), Math.max(zone.minZ - spawn.z, 0, spawn.z - zone.maxZ))
    assert.ok(distance > zone.loadRadius, `出發點 ${distance.toFixed(1)} m`)
    for (const era of ERAS.filter((item) => item.id !== 'revival')) assert.equal(buildEraInteriorSync(era.id, 'site-lao-pan-squid-soup').batches.length, 0, era.id)
  })

  test('黑白貓：在座位區邊緣的桌腳旁，不擋入口與走道；只在老屋新生', () => {
    const [cat] = revival.cats
    assert.equal(cat.zone, 'lao-pan-squid-soup')
    const at = LP(LAO_PAN.cat.x, LAO_PAN.cat.z)
    assert.ok(Math.abs(cat.position[0] - at.x) < 1e-9 && Math.abs(cat.position[2] - at.z) < 1e-9)
    assert.ok(cat.position[0] > zone.minX && cat.position[0] < zone.maxX && cat.position[2] > zone.minZ && cat.position[2] < zone.maxZ, '在店裡')
    // 桌腳旁：離最近的桌子邊緣不到 0.4 m
    const near = Math.min(...LAO_PAN.tables.map((t) => Math.hypot(Math.max(Math.abs(LAO_PAN.cat.x - t.x) - LAO_PAN.table.halfX, 0), Math.max(Math.abs(LAO_PAN.cat.z - t.z) - LAO_PAN.table.halfZ, 0))))
    assert.ok(near < 0.4, `離桌子 ${near.toFixed(2)} m`)
    // 不在入口附近；貓旁邊的走道仍有兩個角色身寬
    assert.ok(LAO_PAN.cat.z < -3)
    const left = Math.max(...LAO_PAN.tables.filter((t) => t.x < 0 && Math.abs(t.z - LAO_PAN.cat.z) < LAO_PAN.table.halfZ + LAO_PAN.stoolOffset).map((t) => t.x + LAO_PAN.table.halfX), LAO_PAN.room.minX)
    assert.ok(LAO_PAN.cat.x - 0.14 - left >= PLAYER.radius * 4, `貓旁的走道 ${(LAO_PAN.cat.x - 0.14 - left).toFixed(2)} m`)
  })
})

describe('廟口的魷魚羹攤：位置、碰撞與榕樹', () => {
  test('不佔用廟門與中央通道：從街上沿著中央通道走到廟前的台階', () => {
    const p = player(TC(0, 2.4).x, TC(0, 2.4).z)
    followRoute(postwar, p, [
      [0, 1.0, '廟埕前緣'],
      [-0.05, -3.5, '中央通道'],
      [-0.9, -4.4, '繞過天公爐'],
      [-0.9, -5.6, '廟前的台階前'],
    ], 0.15, TC)
    // 攤位的障礙物都不在中央通道（廟埕本地 x -0.7 – 0.6）
    const corridor = (() => {
      const a = TC(-0.7, -6.2)
      const b = TC(0.6, 1.7)
      return { minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z) }
    })()
    const mine = postwar.buildings.find((item) => item.storeId === 'temple-squid-stall' && !item.detail)
    for (const part of mine.parts) assert.ok(!overlaps(part, corridor, 0), '攤位在中央通道上')
  })

  test('與其他小吃攤相鄰：離廟埕原本的共用桌椅不到 2 m；攤台前與兩張小桌之間站得下', () => {
    const shared = TC(2.4, -1.0)
    const nearest = Math.hypot(shared.x - TS(-S().canopy.half, 0).x, shared.z - TS(-S().canopy.half, 0).z)
    assert.ok(nearest < 2, `${nearest.toFixed(2)} m`)
    for (const [x, z, label] of [[-0.16, 0.45, '攤台前'], [-0.16, 1.65, '兩張小桌之間'], [-0.16, 2.6, '街邊']]) {
      assert.ok(walkableAt(postwar, TS(x, z).x, TS(x, z).z), label)
    }
    // 從街邊走到攤台前，再走回街上
    const p = player(TS(-0.16, 3.4).x, TS(-0.16, 3.4).z)
    followRoute(postwar, p, [[-0.16, 1.65, '小桌之間'], [-0.16, 0.45, '攤台前'], [-0.16, 3.4, '街上']], 0.1, TS)
    // 攤台、竹竿與桌椅都不能穿越
    for (const [x, z, label] of [[0, -0.36, '攤台'], [S().canopy.half, S().canopy.front, '竹竿'], [S().tables[0].x, S().tables[0].z, '小桌'], [S().tables[1].x, S().tables[1].z + S().stoolOffset, '木凳']]) {
      assert.ok(!walkableAt(postwar, TS(x, z).x, TS(x, z).z), label)
    }
  })

  test('戰後的西側榕樹在攤位上方讓出空間：攤位裡沒有氣根，樹冠的底面在帆布棚上方；其他年代的榕樹不變', () => {
    const clearing = TEMPLE_STALL.clearing
    const build = (options) => {
      const b = new PartBuilder()
      buildTree(b, [3.6, 0, -2.4], { scale: 0.9, seed: 301, banyan: true, ...options })
      return b
    }
    const plain = build({ clearing })
    const free = build({})
    assert.equal(plain.groups.get('plain').length, free.groups.get('plain').length, '樹冠的數量相同')
    for (const g of plain.groups.get('plain')) {
      g.computeBoundingBox()
      const box = g.boundingBox
      const over = box.min.x < clearing.maxX && box.max.x > clearing.minX && box.min.z < clearing.maxZ && box.max.z > clearing.minZ
      if (over) {
        // 樹冠是橢球：在空地範圍裡的底面（取空地範圍內最低的頂點）不低於 top
        const pos = g.attributes.position
        let low = Infinity
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          const z = pos.getZ(i)
          if (x > clearing.minX && x < clearing.maxX && z > clearing.minZ && z < clearing.maxZ) low = Math.min(low, pos.getY(i))
        }
        assert.ok(low >= clearing.top - 0.12, `樹冠的底面 ${low.toFixed(2)}`)
      }
    }
    const roots = (b) => b.groups.get('wood').slice(1)
    assert.ok(roots(plain).length < roots(free).length, '空地裡的氣根不產生')
    for (const g of roots(plain)) {
      g.computeBoundingBox()
      const c = g.boundingBox.getCenter(g.boundingBox.min.clone())
      assert.ok(!(c.x > clearing.minX && c.x < clearing.maxX && c.z > clearing.minZ && c.z < clearing.maxZ), '氣根在攤位裡')
    }
    assert.equal(getShopBuilding(getShop('ci-sheng-gong'), 'revival').clearing, undefined, '老屋新生的榕樹不變')
  })
})

describe('魷魚羹：熱點、點選與章節', () => {
  beforeEach(() => {
    resetStore('revival')
    useGameStore.setState({ viewMode: 'explore', activeShopId: null, activeHotspotId: null, nearbyHotspotId: null, chapterIndex: 0 })
  })

  test('熱點：老潘三個（店門口、料理檯、四道餐點）、廟口兩個（攤位、只能點選的一碗）；各自對應一個章節', () => {
    assert.deepEqual(laoPan.hotspots.map((item) => item.id), ['storefront', 'counter', 'foods'])
    assert.deepEqual(stall.hotspots.map((item) => item.id), ['stall', 'bowl'])
    for (const shop of [laoPan, stall]) {
      for (const hotspot of shop.hotspots) assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${shop.id}/${hotspot.id}`)
    }
    assert.equal(stall.hotspots.find((item) => item.id === 'bowl').clickOnly, true)
    const system = readFileSync(new URL('../src/game/components/InteractionSystem.jsx', import.meta.url), 'utf8')
    assert.match(system, /if \(hotspot\.clickOnly\) continue/)
  })

  test('一樓的熱點（連同離開時的緩衝）不和其他已開放店家的互動範圍重疊', () => {
    const EXIT_MARGIN = 0.7
    for (const [eraId, shop] of [['revival', laoPan], ['postwar', stall]]) {
      const circles = (item) => {
        const placement = getShopPlacement(item)
        if (placement.hotspots.length) return placement.hotspots.filter((h) => !h.clickOnly && (h.level ?? 0) === 0).map((h) => ({ point: h.interactionPoint, radius: h.radius }))
        return placement.level === 0 ? [{ point: placement.interactionPoint, radius: item.interaction?.radius ?? 3.2 }] : []
      }
      const others = ERAS.find((era) => era.id === eraId)
        .availableStores.filter((id) => id !== shop.id)
        .map(getShop)
        .filter((item) => item?.status === 'open')
      for (const mine of circles(shop)) {
        for (const other of others) {
          for (const theirs of circles(other)) {
            const d = Math.hypot(mine.point.x - theirs.point.x, mine.point.z - theirs.point.z)
            assert.ok(d >= mine.radius + EXIT_MARGIN + theirs.radius, `${shop.id} 與 ${other.id}：相距 ${d.toFixed(2)} m`)
          }
        }
      }
    }
  })

  test('按 E／點提示開啟對應的章節；點攤台上的那一碗開啟「一碗魷魚羹」；從店家名錄從第一章開始', () => {
    const index = (shop, id) => shop.chapters.findIndex((chapter) => chapter.id === id)
    for (const [hotspot, chapter] of [['storefront', 'shop'], ['counter', 'market'], ['foods', 'foods']]) {
      useGameStore.getState().setNearbyShop('lao-pan-squid-soup', hotspot)
      useGameStore.getState().interact()
      assert.equal(useGameStore.getState().chapterIndex, index(laoPan, chapter), hotspot)
      useGameStore.getState().closeShop()
    }
    resetStore('postwar')
    useGameStore.getState().setNearbyShop('temple-squid-stall', 'stall')
    useGameStore.getState().interact()
    assert.equal(useGameStore.getState().chapterIndex, index(stall, 'temple-food'))
    useGameStore.getState().closeShop()
    useGameStore.getState().setNearbyShop('temple-squid-stall', 'stall')
    useGameStore.getState().interact('bowl')
    assert.equal(useGameStore.getState().activeHotspotId, 'bowl')
    assert.equal(useGameStore.getState().chapterIndex, index(stall, 'bowl'))
    useGameStore.getState().closeShop()
    useGameStore.getState().openShop('temple-squid-stall', null)
    assert.equal(useGameStore.getState().chapterIndex, 0)
    // 建築觀賞模式中不開啟介紹
    useGameStore.getState().closeShop()
    useGameStore.getState().setViewMode('viewer')
    assert.equal(useGameStore.getState().openShop('temple-squid-stall', 'bowl'), false)
    useGameStore.getState().setViewMode('explore')
  })

  test('店門前的街上：人物背對老潘走出來時，第三人稱鏡頭停在雨棚前面，不在雨棚裡', () => {
    const away = LP(0, 1)
    const origin = LP(0, 0)
    const heading = Math.atan2(away.x - origin.x, away.z - origin.z)
    let checked = 0
    for (let z = 1.8; z <= 4.6; z += 0.2) {
      for (let x = -1.6; x <= 1.6; x += 0.4) {
        const p = { ...LP(x, z), level: 0, y: 0 }
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

  test('站在攤位的提示前、鏡頭在人物背後（iPad 的預設鏡頭）：點攤台上的那一碗點得到它，不會先點到帆布棚', () => {
    const dir = (a, b) => {
      const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
      const l = Math.hypot(d.x, d.y, d.z)
      return { x: d.x / l, y: d.y / l, z: d.z / l }
    }
    const top = S().counter.height + 0.06
    const bowl = { ...TS(S().bowl.x, S().bowl.z), y: top + 0.05 }
    const at = TEMPLE_STALL_HOTSPOTS[0].point
    for (const dx of [-0.6, -0.3, 0, 0.3]) {
      const p = { ...TS(at[0] + dx, at[1]), level: 0, y: 0 }
      const yaw = Math.atan2(bowl.x - p.x, bowl.z - p.z) + Math.PI
      const cam = followCamera(postwar, p, yaw)
      const hit = pickBuilding(cam, dir(cam, bowl), postwar.buildings)
      assert.equal(hit?.id, 'temple-squid-stall-bowl', `${dx}：鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`)
    }
  })

  test('點選：攤台上的那一碗、攤車、四道餐點、招牌各自是可以點選、聚焦的細部目標', () => {
    const dir = (a, b) => {
      const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
      const l = Math.hypot(d.x, d.y, d.z)
      return { x: d.x / l, y: d.y / l, z: d.z / l }
    }
    const top = S().counter.height + 0.06
    const bowlCam = { ...TS(S().bowl.x, 1.2), y: 1.6 }
    const bowl = { ...TS(S().bowl.x, S().bowl.z), y: top + 0.05 }
    const hitBowl = pickBuilding(bowlCam, dir(bowlCam, bowl), postwar.buildings)
    assert.equal(hitBowl?.id, 'temple-squid-stall-bowl')
    assert.equal(hitBowl.hotspot, 'bowl')
    const c = LAO_PAN.counter
    const cartCam = { ...LP(-1.1, 3.2), y: 1.7 }
    const cart = { ...LP((c.minX + c.maxX) / 2, (c.minZ + c.maxZ) / 2), y: c.height + 0.1 }
    assert.equal(pickBuilding(cartCam, dir(cartCam, cart), revival.buildings)?.id, 'lao-pan-counter')
    const t = laoPanTable(LAO_PAN.foodTable)
    const foodCam = { ...LP(0.2, t.z), y: 1.5 }
    const food = { ...LP(t.x - 0.15, t.z), y: LAO_PAN.table.height + 0.08 }
    assert.equal(pickBuilding(foodCam, dir(foodCam, food), revival.buildings)?.id, 'lao-pan-foods')
    const signCam = { ...LP(0, 7), y: 2.0 }
    const sign = { ...LP(-0.2, LAO_PAN.arcade + 0.1), y: 4.3 }
    const hitSign = pickBuilding(signCam, dir(signCam, sign), revival.buildings)
    assert.equal(hitSign?.id, 'lao-pan-signs')
    assert.equal(hitSign.hotspot, 'storefront')
    // 桌子的遮擋方塊只給鏡頭用：點另一張桌子不會點到老潘的任何目標以外的東西
    const other = laoPanTable('r2')
    const hitTable = pickBuilding(foodCam, dir(foodCam, { ...LP(other.x, other.z), y: 0.7 }), revival.buildings)
    assert.ok(!hitTable || hitTable.storeId === 'lao-pan-squid-soup', hitTable?.id)
  })
})

describe('魷魚羹：鏡頭與建築觀賞模式', () => {
  test('介紹鏡頭不在任何方塊裡、看得到熱點；老潘店裡的鏡頭在天花板下', () => {
    for (const [world, shop] of [[revival, laoPan], [postwar, stall]]) {
      const placement = getShopPlacement(shop)
      for (const shot of [...placement.hotspots.map((item) => ({ id: item.id, camera: item.camera })), { id: 'default', camera: placement.camera }]) {
        const cam = shot.camera.position
        assert.ok(!world.blockers.some((box) => insideBox(cam, box)), `${shop.id}/${shot.id}：${JSON.stringify(cam)}`)
        assert.ok(!segmentBlocked(cam, shot.camera.target, world.blockers.filter((box) => !insideBox(shot.camera.target, box, 0.02))), `${shop.id}/${shot.id} 看得到注視點`)
        if (cam.x > zone.minX && cam.x < zone.maxX && cam.z > zone.minZ && cam.z < zone.maxZ) assert.ok(cam.y < LAO_PAN.ceiling - 0.3, `${shot.id} y=${cam.y}`)
      }
    }
  })

  test('從店家名錄前往：老潘站在騎樓下的店門口（再自己走進店裡）；廟口站在兩張小桌之間的街邊', () => {
    for (const [world, shop] of [[revival, laoPan], [postwar, stall]]) {
      const placement = getShopPlacement(shop)
      const arrive = { x: placement.interactionPoint.x + placement.forward.x * 0.5, z: placement.interactionPoint.z + placement.forward.z * 0.5 }
      assert.ok(walkableAt(world, arrive.x, arrive.z), shop.id)
    }
    const arrive = getShopPlacement(laoPan).interactionPoint
    assert.ok(!(arrive.x > zone.minX && arrive.x < zone.maxX && arrive.z > zone.minZ && arrive.z < zone.maxZ), '不是直接傳送到店裡')
  })

  test('走進店門時逐漸切換成室內鏡頭；店裡完全切換；街上不受影響', () => {
    const ramp = [2.6, 1.6, 0.8, 0.1].map((z) => interiorAmount(LP(0.6, z), revival.interiors, 0)?.amount ?? 0)
    for (let i = 1; i < ramp.length; i++) assert.ok(ramp[i] >= ramp[i - 1], ramp.join(', '))
    assert.equal(interiorAmount(LP(0, -3.0), revival.interiors, 0).amount, 1)
    assert.equal(interiorAmount(LP(0.6, 4.5), revival.interiors, 0), null)
  })

  test('店裡與騎樓：各個方向的跟隨鏡頭都在天花板下、不在牆或家具裡，看得到人物', () => {
    for (const [x, z] of [[0.6, -0.4], [0.0, -2.6], [0.45, -2.6], [0.0, -4.4], [0.15, -5.4], [0.0, -6.2], [0.6, 1.0]]) {
      const p = { ...LP(x, z), y: 0 }
      for (let i = 0; i < 12; i++) {
        for (const pitch of [0.2, CAMERA.pitch, 0.8]) {
          const cam = followCamera(revival, p, (i / 12) * Math.PI * 2, pitch)
          const where = `(${x}, ${z}) 方向 ${i} pitch ${pitch}：(${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})`
          assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), where)
          if (cam.k >= 0.999) assert.ok(cam.y < LAO_PAN.ceiling, where)
          assert.ok(!segmentBlocked(cam, cam.target, revival.blockers), `${where} 視線被擋`)
        }
      }
    }
  })

  test('觀賞模式：注視點可以從街上移進騎樓與店裡；在店裡旋轉不穿牆；聚焦招牌、料理檯與食品', () => {
    // 從街上往店裡一步一步移動注視點
    const target = { ...LP(0.6, 3.0), y: 1.6 }
    let from = { ...target }
    for (let z = 3.0; z > -4.0; z -= 0.2) {
      const next = { ...LP(0.3, z), y: 1.6 }
      target.x = next.x
      target.z = next.z
      clampViewerTarget(target, revival.blockers, space, from)
      from = { ...target }
    }
    assert.ok(target.x > zone.minX && target.x < zone.maxX && target.z > zone.minZ && target.z < zone.maxZ, JSON.stringify(target))
    assert.ok(target.y < LAO_PAN.ceiling)
    for (let i = 0; i < 8; i++) {
      for (const pitch of [0.1, 0.5, 1.0]) {
        const direction = orbitDirection((i / 8) * Math.PI * 2, pitch)
        const d = allowedDistance(target, direction, 8, revival.blockers, space)
        const cam = { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d }
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `方向 ${i} pitch ${pitch}`)
        assert.ok(cam.y <= LAO_PAN.ceiling, `方向 ${i} pitch ${pitch} y ${cam.y.toFixed(2)}`)
      }
    }
    for (const [world, ids, sp] of [[revival, ['site-lao-pan-squid-soup', 'lao-pan-signs', 'lao-pan-counter', 'lao-pan-foods'], space], [postwar, ['site-temple-squid-stall', 'temple-squid-stall-bowl'], postwarSpace]]) {
      for (const id of ids) {
        const record = world.buildings.find((item) => item.id === id)
        assert.ok(record, id)
        const plan = planBuildingFocus(record, world.blockers, { yaw: 0, aspect: 1.5, fov: CAMERA.fov, space: sp })
        const f = orbitDirection(plan.yaw, plan.pitch)
        const cam = { x: plan.target.x + f.x * plan.distance, y: plan.target.y + f.y * plan.distance, z: plan.target.z + f.z * plan.distance }
        assert.ok(!world.blockers.some((box) => insideBox(cam, box)), `${id}：${JSON.stringify(cam)}`)
        assert.ok(raycastBoxes(plan.target, f, plan.distance, world.blockers) >= plan.distance - 1e-6, `${id} 穿牆`)
      }
    }
  })
})
