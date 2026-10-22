import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { RICE_CHAPTERS, RICE_ERA_NOTES, RICE_FACTS, RICE_PENDING, RICE_RECORD, RICE_SCENARIO } from '../src/data/riceAndShineData.js'
import { RICE_AND_SHINE_ID, riceAndShineEraConfig, riceVariantForEra } from '../src/data/riceAndShineEraConfig.js'
import { EARLY, MILL, MODERN, POSTWAR, RICE_HOTSPOTS, RICE_ROUTE, RS, riceToWorld } from '../src/data/riceAndShineLayout.js'
import { getShop, getShopsByEra } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildRiceAndShineExterior } from '../src/game/builders/riceAndShine/riceAndShineExterior.js'
import { buildRiceAndShineInterior } from '../src/game/builders/riceAndShine/riceAndShineInterior.js'
import { groundAt, resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { RICE_ATLAS } from '../src/game/rendering/riceAtlas.js'
import { clampViewerTarget, interiorAmount, viewerSpaceOf } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 迪化街一段329號店屋（稻舍 Rice & Shine）：同一棟建築、同一個 ID，五個年代各有不同的版本。
 * 1853 是一般街屋；1895 初期米業（不能進去）；1930 米行與碾米間；1945 戰後；2000 稻舍（含天井、樓梯與二樓）。
 * 驗證：年代版本、早期不出現「稻舍」、禁止事項、碰撞（從街上走進去、走上二樓再走出來）、熱點與鏡頭、
 * 按需載入的室內、觀賞範圍、換年代時人物的位置、文獻、共用地段不變、不和其他建築重疊。
 */
const WORLDS = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const BUILDING_ID = 'store-rice-and-shine-329'
const L = (x, z) => riceToWorld(x, z)
const F2 = RS.floor2
const STEPS = [0.15, 0.09, 0.05]

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function insideBox(p, b) {
  return p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY && p.z > b.minZ && p.z < b.maxZ
}

function overlaps(a, b, pad = 0.05) {
  return a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
}

/** 角色：每一步先推出障礙物，再依樓層與斜面決定高度（與 Player 相同） */
function player(x, z, level = 0, y = 0) {
  return { x, z, level, y }
}

function stepTo(world, p, x, z) {
  p.x = x
  p.z = z
  resolvePlayerPosition(p, PLAYER.radius, world.collision, p.level)
  const ground = groundAt(p, world.collision, p.level, p.y)
  p.level = ground.level
  p.y = ground.y
}

function walkTo(world, p, target, step) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    stepTo(world, p, p.x + (dx / d) * step, p.z + (dz / d) * step)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

/** 沿著路線走（建築本地座標），回傳每一站離目標還差多少 */
function followRoute(world, p, route, step) {
  const misses = []
  for (const point of route) {
    const miss = walkTo(world, p, L(point.x, point.z), step)
    misses.push({ id: point.id, miss, level: p.level, y: p.y })
  }
  return misses
}

const textOf = (value) => JSON.stringify(value ?? '')

describe('年代版本：同一棟建築、同一個 ID', () => {
  test('1853 是一般街屋，不是可以探索的地點；1895 起每個年代都有自己的名稱與版本', () => {
    assert.equal(riceAndShineEraConfig[1853].active, false)
    assert.ok(!getEra('qing-port').availableStores.includes(RICE_AND_SHINE_ID))
    const qing = WORLDS['qing-port'].buildings.find((b) => b.id === BUILDING_ID)
    assert.ok(!qing, '1853 這塊地沒有店家的建築')
    const expected = {
      banquet: ['earlyRiceTrade', '北街米業店屋（迪化街329號）', '北街米業逐漸形成'],
      modern: ['riceMill', '迪化街329號米行／碾米間', '米行與碾米產業'],
      postwar: ['postwarRiceHouse', '迪化街329號米行（戰後）', '戰後米業與產業轉變'],
      revival: ['riceAndShineModern', '稻舍 Rice & Shine', '老屋再生・稻舍'],
    }
    for (const [eraId, [variant, name, label]] of Object.entries(expected)) {
      assert.ok(getEra(eraId).availableStores.includes(RICE_AND_SHINE_ID), eraId)
      const shop = getShop(RICE_AND_SHINE_ID, eraId)
      assert.equal(shop.id, RICE_AND_SHINE_ID)
      assert.equal(shop.variant, variant)
      assert.equal(shop.name, name)
      assert.equal(shop.eraLabel, label)
      assert.equal(riceVariantForEra(eraId).variant, variant)
      assert.ok(getShopsByEra(getEra(eraId)).some((item) => item === shop), `${eraId}：名錄用的是同一個年代版本的物件`)
      // 同一個建築 ID、同一個地段
      const building = WORLDS[eraId].buildings.find((b) => b.id === BUILDING_ID)
      assert.ok(building, eraId)
      assert.equal(building.storeId, RICE_AND_SHINE_ID)
      assert.ok(Math.abs((building.box.minX + building.box.maxX) / 2 - RS.position.x) < 0.01)
    }
  })

  test('共用的地段切分不變：店面中心、面寬與朝向和原本的稻舍地段相同', () => {
    const lots = getLotPlan().lots.filter((lot) => lot.storeId === RICE_AND_SHINE_ID)
    assert.equal(lots.length, 1)
    const lot = lots[0]
    assert.ok(Math.abs(lot.x - RS.position.x) < 1e-6 && Math.abs(lot.z - RS.position.z) < 1e-6)
    assert.ok(Math.abs(lot.rotationY - Math.PI) < 1e-6)
    assert.ok(Math.abs(lot.width - RS.half * 2) < 0.05, `面寬 ${lot.width}`)
    assert.ok(!getLotPlan().lots.some((item) => item.storeId === 'dao-she'))
  })

  test('切換 10 次年代：每次都是同一棟建築（同一個 ID 與地段），只換外觀、招牌、人物、室內與狀態', () => {
    const sequence = ['revival', 'modern', 'banquet', 'postwar', 'revival', 'qing-port', 'modern', 'revival', 'postwar', 'banquet', 'revival']
    let box = null
    for (const eraId of sequence) {
      const world = WORLDS[eraId]
      const building = world.buildings.find((b) => b.id === BUILDING_ID)
      if (eraId === 'qing-port') {
        assert.ok(!building)
        continue
      }
      if (box) assert.ok(Math.abs(building.box.minX - box.minX) < 1e-6 && Math.abs(building.box.maxX - box.maxX) < 1e-6, eraId)
      box = building.box
      assert.equal(getShop(RICE_AND_SHINE_ID, eraId), getShop(RICE_AND_SHINE_ID, eraId), '同一個年代每次是同一個物件')
      assert.equal(getShop(RICE_AND_SHINE_ID, eraId).variant, riceVariantForEra(eraId).variant)
    }
  })
})

describe('早期年代不出現「稻舍」；禁止事項', () => {
  const signTexts = (eraId) => [...WORLDS[eraId].signs, ...WORLDS[eraId].banners].map((sign) => sign.text)

  test('1895、1930、1945：名稱、分類、印章、摘要、招牌、章節標題都沒有「稻舍」；2000 才有', () => {
    for (const eraId of ['banquet', 'modern', 'postwar']) {
      const shop = getShop(RICE_AND_SHINE_ID, eraId)
      for (const field of [shop.name, shop.eraLabel, shop.category, shop.seal]) assert.doesNotMatch(field, /稻舍|Rice & Shine/, `${eraId}：${field}`)
      // 摘要只會說明「這裡還沒有稻舍」
      assert.doesNotMatch(shop.summary.replace(/沒有「稻舍」/g, ''), /稻舍|Rice & Shine/, `${eraId}：${shop.summary}`)
      for (const chapter of shop.chapters) {
        for (const field of [chapter.tab, chapter.title, chapter.lead]) assert.doesNotMatch(field ?? '', /稻舍/, `${eraId}：${chapter.id}`)
      }
      assert.ok(!signTexts(eraId).some((text) => /稻舍|Rice & Shine|RICE & SHINE/.test(text)), eraId)
    }
    // 1895 用的是一般的行業字：「米」「碾米」「糧」
    for (const text of ['米', '碾米', '糧']) assert.ok(signTexts('banquet').includes(text), text)
    for (const text of ['稻舍', '稻舍 Rice & Shine', '稻舍米糧行']) assert.ok(signTexts('revival').includes(text), text)
  })

  const build = (variant) => {
    const b = new PartBuilder()
    const detail = new PartBuilder()
    b.push([0, 0, 0], 0)
    buildRiceAndShineExterior(b, { variant, seed: 1, width: RS.half * 2 }, detail)
    const inner = new PartBuilder()
    const innerDetail = new PartBuilder()
    buildRiceAndShineInterior(inner, { variant }, innerDetail)
    return { b, inner, signs: b.signs.map((s) => s.text) }
  }

  test('1930 沒有現代玻璃門與現代餐桌；1945 沒有軌道燈；只有 2000 有玻璃門、托盤套餐與軌道燈', () => {
    const results = Object.fromEntries(['riceMill', 'postwarRiceHouse', 'riceAndShineModern'].map((v) => [v, build(v)]))
    for (const variant of ['riceMill', 'postwarRiceHouse']) {
      const { b, inner } = results[variant]
      assert.ok(!b.groups.has('glassClear'), `${variant}：沒有玻璃門`)
      // 托盤（woodLight）、紅陶地磚是稻舍的；舊店屋是三和土地面與灰泥牆
      assert.ok(!inner.groups.has('woodLight') && !inner.groups.has('terracotta'), variant)
      assert.ok(inner.groups.has('granite') && inner.groups.has('plaster'), variant)
      // 燈：只有暖色的裸燈泡（一樓天花下 3 盞），沒有軌道燈
      const ceilingGlows = b.glows.filter((g) => Math.abs(g.position[1] - (RS.ceiling1 - 0.2)) < 0.01)
      assert.equal(ceilingGlows.length, 0, variant)
    }
    const modern = results.riceAndShineModern
    assert.ok(modern.b.groups.has('glassClear'))
    assert.ok(modern.inner.groups.has('woodLight') && modern.inner.groups.has('terracotta'))
    assert.equal(modern.b.glows.filter((g) => Math.abs(g.position[1] - (RS.ceiling1 - 0.2)) < 0.01).length, 8, '軌道燈')
  })

  test('每個年代的室內都不一樣（不是同一套室內）；1895 沒有室內', () => {
    const counts = {}
    for (const variant of ['riceMill', 'postwarRiceHouse', 'riceAndShineModern']) {
      const { inner } = build(variant)
      counts[variant] = [...inner.groups.keys()].sort().join(',') + '|' + [...inner.groups.values()].reduce((n, list) => n + list.length, 0)
    }
    assert.equal(new Set(Object.values(counts)).size, 3)
    const early = build('earlyRiceTrade')
    assert.equal(early.inner.groups.size, 0)
  })

  test('不是咖啡廳：稻舍的介紹與分類是米食料理與稻米文化', () => {
    const shop = getShop(RICE_AND_SHINE_ID, 'revival')
    assert.match(shop.category, /米食料理/)
    // 只在「稻舍不是咖啡廳」的說明裡出現
    assert.doesNotMatch(textOf(shop.chapters).replace(/不是咖啡廳/g, ''), /咖啡/)
    assert.ok(shop.chapters.some((chapter) => chapter.id === 'meals'))
  })

  test('壁畫、展板與老照片是圖集上的原創圖樣，不是把照片貼成整面的貼圖', () => {
    const names = Object.keys(RICE_ATLAS.regions)
    for (const name of ['arcadeMural', 'courtyardMural', 'renewalBoard', 'nanjieBoard']) assert.ok(names.includes(name))
    for (const [name, [, , w, h]] of Object.entries(RICE_ATLAS.regions)) assert.ok(w <= 1024 && h <= 1024, name)
  })
})

describe('碰撞：從街上走進去、走過一樓、天井、二樓，再走出來', () => {
  test('2000–現在：街道 → 紅磚騎樓 → 入口 → 用餐區 → 展示 → 天井 → 後段 → 樓梯 → 二樓（多種步長）', () => {
    const world = WORLDS.revival
    for (const step of STEPS) {
      const start = RICE_ROUTE.riceAndShineModern[0]
      const p = player(L(start.x, start.z).x, L(start.x, start.z).z)
      const misses = followRoute(world, p, RICE_ROUTE.riceAndShineModern.slice(1), step)
      for (const m of misses) assert.ok(m.miss < 0.25, `每步 ${step}：${m.id} 差 ${m.miss.toFixed(2)}`)
      const top = misses.find((m) => m.id === 'upstairs')
      assert.equal(top.level, 1)
      assert.ok(Math.abs(top.y - F2) < 1e-6, `二樓的地板 ${top.y}`)
      // 原路走回街上
      const back = followRoute(world, p, [...RICE_ROUTE.riceAndShineModern].reverse().slice(1), step)
      for (const m of back) assert.ok(m.miss < 0.25, `每步 ${step}（回程）：${m.id} 差 ${m.miss.toFixed(2)}`)
      assert.equal(p.level, 0)
      assert.equal(p.y, 0)
    }
  })

  test('連續進出 5 次：每次都走得進去、走得出來，不會卡在門口或樓梯', () => {
    const world = WORLDS.revival
    const route = RICE_ROUTE.riceAndShineModern
    const p = player(L(0, 3).x, L(0, 3).z)
    for (let i = 0; i < 5; i++) {
      const step = STEPS[i % STEPS.length]
      for (const m of followRoute(world, p, route.slice(1), step)) assert.ok(m.miss < 0.25, `第 ${i + 1} 次進去：${m.id}`)
      for (const m of followRoute(world, p, [...route].reverse().slice(1), step)) assert.ok(m.miss < 0.25, `第 ${i + 1} 次出來：${m.id}`)
    }
  })

  test('1930 與 1945：走過前店、碾米區、天井到米倉（後進），再走出來', () => {
    for (const eraId of ['modern', 'postwar']) {
      const world = WORLDS[eraId]
      for (const step of STEPS) {
        const route = RICE_ROUTE.riceMill.filter((point) => eraId === 'modern' || point.id !== 'granary')
        const p = player(L(0, 3).x, L(0, 3).z)
        for (const m of followRoute(world, p, route.slice(1), step)) assert.ok(m.miss < 0.25, `${eraId} 每步 ${step}：${m.id} 差 ${m.miss.toFixed(2)}`)
        // 戰後：後進的住家（方桌與碗櫃之間）
        if (eraId === 'postwar') assert.ok(walkTo(world, p, L(-0.4, -8.7), step) < 0.25, `戰後的後進 每步 ${step}`)
        for (const m of followRoute(world, p, [...route].reverse().slice(1), step)) assert.ok(m.miss < 0.25, `${eraId} 回程 每步 ${step}：${m.id}`)
      }
      // 沒有二樓
      assert.ok(!world.collision.walkable.some((r) => r.inBuilding && ((r.level ?? 0) === 1 || r.levels)), eraId)
    }
  })

  test('1895：街屋不能進去，但街邊的米袋、木桶、米斗與手推車擋住人物', () => {
    const world = WORLDS.banquet
    assert.ok(!walkableAt(world, L(0, -1.5).x, L(0, -1.5).z), '店裡')
    for (const r of [EARLY.arcadeSacks, EARLY.barrels, EARLY.cart]) {
      const c = L((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(world, c.x, c.z), JSON.stringify(r))
    }
  })

  test('樓梯只能從樓梯口上去：從後進的側面不會踩上樓梯；二樓的人不會掉到一樓', () => {
    const world = WORLDS.revival
    // 從後進往樓梯的側面（-z）走：停在扶手前
    const p = player(L(0.4, -9.4).x, L(0.4, -9.4).z)
    walkTo(world, p, L(0.4, -10.5), 0.09)
    assert.equal(p.level, 0)
    assert.ok(p.y < 0.01)
    // 二樓的平台：往天井那一側走，停在欄杆內
    const q = player(L(2.15, -9.0).x, L(2.15, -9.0).z, 1, F2)
    walkTo(world, q, L(0.5, -7.0), 0.09)
    assert.equal(q.level, 1)
    assert.ok(Math.abs(q.y - F2) < 1e-6)
  })

  test('家具與展示：桌椅、櫃台、木架、土礱、米斗桌、樹、盆栽、碾米機都是障礙物；二樓的長桌與書架在二樓', () => {
    const world = WORLDS.revival
    for (const r of [MODERN.counter, MODERN.shelf, MODERN.husker, MODERN.measureStand, MODERN.tree, MODERN.mill, MODERN.pass]) {
      const c = L((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(world, c.x, c.z), JSON.stringify(r))
    }
    for (const t of MODERN.tables) assert.ok(!walkableAt(world, L(t.x, t.z).x, L(t.x, t.z).z), t.id)
    for (const t of MODERN.longTables) {
      const c = L((t.minX + t.maxX) / 2, (t.minZ + t.maxZ) / 2)
      assert.ok(!walkableAt(world, c.x, c.z, 1), t.id)
    }
    for (const r of [MILL.machine, MILL.counter, MILL.granaryLeft]) {
      const c = L((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(WORLDS.modern, c.x, c.z), JSON.stringify(r))
    }
    for (const r of [POSTWAR.homeTable, POSTWAR.cupboard, POSTWAR.washing]) {
      const c = L((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2)
      assert.ok(!walkableAt(WORLDS.postwar, c.x, c.z), JSON.stringify(r))
    }
  })

  test('換年代：在稻舍裡換到 1930 仍在同一棟店屋裡；換到 1895 被移到街上（不會被推進隔壁）', () => {
    const inside = L(0.95, -3.25)
    const p = { ...inside }
    resolvePlayerPosition(p, PLAYER.radius, WORLDS.modern.collision, 0, { relocate: true })
    assert.ok(Math.hypot(p.x - inside.x, p.z - inside.z) < 0.6, '留在店裡')
    for (const eraId of ['banquet', 'qing-port']) {
      for (const [x, z, level] of [
        [0.95, -3.25, 0],
        [0, -6.9, 0],
        [0.0, 0.4, 1],
      ]) {
        const q = { ...L(x, z) }
        resolvePlayerPosition(q, PLAYER.radius, WORLDS[eraId].collision, level, { relocate: true })
        assert.ok(walkableAt(WORLDS[eraId], q.x, q.z), `${eraId} (${x}, ${z})`)
        assert.ok(q.z < RS.position.z - RS.pierZ[0] + PLAYER.radius + 0.05, `${eraId} (${x}, ${z}) → z ${q.z.toFixed(2)}：在街上`)
      }
    }
  })
})

describe('熱點、鏡頭、室內與觀賞範圍', () => {
  test('每個年代的熱點都站得到、章節存在；介紹的鏡頭不在任何方塊裡', () => {
    for (const eraId of ['banquet', 'modern', 'postwar', 'revival']) {
      const shop = getShop(RICE_AND_SHINE_ID, eraId)
      const world = WORLDS[eraId]
      const placement = getShopPlacement(shop)
      const variant = riceVariantForEra(eraId).variant
      assert.equal(placement.hotspots.length, RICE_HOTSPOTS[variant].length)
      for (const hotspot of placement.hotspots) {
        assert.ok(shop.chapters.some((chapter) => chapter.id === hotspot.chapter), `${eraId}/${hotspot.id}：章節 ${hotspot.chapter}`)
        if (!hotspot.clickOnly) assert.ok(walkableAt(world, hotspot.point.x, hotspot.point.z, hotspot.level ?? 0), `${eraId}/${hotspot.id}：站得到`)
        const cam = hotspot.camera.position
        assert.ok(!world.blockers.some((box) => insideBox(cam, box)), `${eraId}/${hotspot.id}：鏡頭在方塊裡`)
      }
      // 至少一個熱點會開啟北街米業（1930、2000）或碾米的章節
      if (eraId !== 'banquet' && eraId !== 'postwar') assert.ok(placement.hotspots.some((h) => h.chapter === 'dadaocheng-rice-trade'))
    }
    // 2000：四個文化點（北街為什麼曾經都是米行、碾米、米斗、老屋再生）與二樓的《南街殷賑》
    const ids = getShop(RICE_AND_SHINE_ID, 'revival').hotspots.map((h) => h.chapter)
    for (const chapter of ['dadaocheng-rice-trade', 'rice-milling', 'rice-measure', 'renewal', 'nanjie', 'meals', 'courtyard']) assert.ok(ids.includes(chapter), chapter)
  })

  test('章節的版型：碾米是步驟動畫（4 步），米斗是可以旋轉的器物，老屋再生有時間軸', () => {
    for (const eraId of ['modern', 'revival']) {
      const milling = RICE_CHAPTERS[eraId].find((c) => c.id === 'rice-milling')
      assert.equal(milling.type, 'process')
      assert.deepEqual(milling.steps.map((s) => s.id), ['paddy', 'husk', 'brown', 'white'])
      const measure = RICE_CHAPTERS[eraId].find((c) => c.id === 'rice-measure')
      assert.equal(measure.type, 'object')
      assert.equal(measure.object, 'rice-measure')
    }
    const renewal = RICE_CHAPTERS.revival.find((c) => c.id === 'renewal')
    assert.ok(renewal.timeline.length >= 4)
    assert.match(renewal.summary.text, /米行.*產業衰退.*歷史建築保存.*稻舍/)
  })

  test('室內按需載入：1930、1945、2000 各自一套；細部另外合併；頂點數有上限；1895 沒有', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const world = WORLDS[eraId]
      const zones = world.interiors.filter((z) => z.building === BUILDING_ID)
      assert.equal(zones.length, eraId === 'revival' ? 2 : 1, eraId)
      const interior = buildEraInteriorSync(eraId, BUILDING_ID)
      const verts = (list) => list.reduce((n, batch) => n + batch.geometry.attributes.position.count, 0)
      assert.ok(interior.batches.length >= 8, eraId)
      assert.ok(interior.detailBatches.length > 0, eraId)
      assert.ok(verts(interior.batches) < 115000, `${eraId}：室內 ${verts(interior.batches)}`)
      assert.ok(verts(interior.detailBatches) < 50000, `${eraId}：細部 ${verts(interior.detailBatches)}`)
      // 依材質合併：每種材質一個網格（繪製呼叫少）
      const materials = interior.batches.map((b) => b.material)
      assert.equal(new Set(materials).size, materials.length, eraId)
      // 街景的網格裡沒有室內的細部（室內另外產生）
      assert.ok(zones[0].loadRadius > 0 && zones[0].showRadius >= zones[0].loadRadius)
    }
    assert.ok(!WORLDS.banquet.interiors.some((z) => z.building === BUILDING_ID))
    assert.equal(buildEraInteriorSync('banquet', BUILDING_ID).batches.length, 0)
  })

  test('室內鏡頭：在一樓、天井與二樓都算在室內；爬樓梯時切換到二樓的室內範圍', () => {
    const world = WORLDS.revival
    assert.equal(interiorAmount(L(0, 4), world.interiors), null, '街上不是室內')
    for (const [x, z] of [
      [0.95, -3.25],
      [0, -6.9],
      [-0.5, -8.9],
    ]) assert.ok(interiorAmount(L(x, z), world.interiors)?.amount > 0.99, `一樓 (${x}, ${z})`)
    for (const [x, z] of [
      [2.15, -9.0],
      [2.15, -6.8],
      [0, -2.5],
    ]) assert.equal(interiorAmount(L(x, z), world.interiors, 1)?.zone.id, `${RICE_AND_SHINE_ID}-2f`, `二樓 (${x}, ${z})`)
  })

  test('觀賞模式：二樓每個可以站的位置，注視點都在二樓；一樓的注視點都在一樓', () => {
    const world = WORLDS.revival
    const space = viewerSpaceOf(world)
    const upstairs = world.collision.walkable.filter((r) => r.inBuilding && (r.level ?? 0) === 1 && !r.ramp)
    let checked = 0
    for (const r of upstairs) {
      for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.3) {
        for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.3) {
          if (!walkableAt(world, x, z, 1)) continue
          const target = { x, y: F2 + 1.7, z }
          clampViewerTarget(target, world.blockers, space)
          assert.ok(target.y > F2 + 0.3, `二樓 (${x.toFixed(2)}, ${z.toFixed(2)})：注視點降到 y ${target.y.toFixed(2)}`)
          checked++
        }
      }
    }
    assert.ok(checked > 100, `${checked} 個位置`)
    for (const [x, z] of [
      [0.95, -3.25],
      [-0.5, -8.9],
    ]) {
      const target = { ...L(x, z), y: 1.7 }
      clampViewerTarget(target, world.blockers, space)
      assert.ok(target.y < RS.ceiling1, `一樓 (${x}, ${z})：注視點升到 y ${target.y.toFixed(2)}`)
    }
  })

  test('鏡頭不穿牆：店屋裡每個可以站的位置（一樓、天井、樓梯以外的二樓），頭頂高度都不在任何遮擋方塊裡', () => {
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const world = WORLDS[eraId]
      let checked = 0
      for (const r of world.collision.walkable.filter((item) => item.inBuilding && !item.ramp)) {
        const level = r.level ?? 0
        const y = (level ? F2 : 0) + 1.6
        for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.3) {
          for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.3) {
            if (!walkableAt(world, x, z, level)) continue
            const p = { x, y, z }
            const box = world.blockers.find((b) => insideBox(p, b))
            assert.ok(!box, `${eraId} (${x.toFixed(2)}, ${y}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
            checked++
          }
        }
      }
      assert.ok(checked > 60, `${eraId}：${checked} 個位置`)
    }
  })

  test('不和其他建築重疊（每個年代）', () => {
    for (const eraId of ['banquet', 'modern', 'postwar', 'revival']) {
      const world = WORLDS[eraId]
      const mine = world.buildings.filter((b) => b.id === BUILDING_ID || b.storeId === RICE_AND_SHINE_ID)
      const others = world.buildings.filter((b) => b.storeId !== RICE_AND_SHINE_ID && b.id !== BUILDING_ID)
      for (const a of mine) {
        for (const part of a.parts) {
          for (const o of others) {
            for (const other of o.parts) assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, `${eraId}：${a.id} 與 ${o.id} 重疊`)
          }
        }
      }
    }
  })

  test('人物：各年代的情境人物不一樣；坐著用餐的人坐在椅子上，站著的人不擋在動線上', () => {
    const looks = (eraId) => WORLDS[eraId].npcs.filter((n) => n.id.startsWith('rice-')).map((n) => n.look)
    assert.deepEqual(looks('banquet').sort(), ['riceMerchant', 'riceMiller', 'ricePorter'])
    assert.ok(looks('modern').includes('riceMillerModern') && looks('modern').includes('riceClerk'))
    assert.ok(looks('revival').includes('revivalDiner'))
    assert.ok(!looks('modern').includes('revivalDiner'))
    const diners = WORLDS.revival.npcs.filter((n) => n.id.startsWith('rice-') && n.pose === 'eat')
    for (const n of diners) assert.ok(n.seatY > 0.4, n.id)
  })
})

describe('資料與文獻', () => {
  test('地址、文化資產紀錄與各年代的說明', () => {
    assert.equal(RICE_RECORD.address, '臺北市大同區迪化街一段329號')
    for (const eraId of ['banquet', 'modern', 'postwar', 'revival']) assert.ok(RICE_ERA_NOTES[eraId], eraId)
    assert.match(RICE_ERA_NOTES.banquet, /還沒有「稻舍」/)
  })

  test('已查證的史實、照片觀察、情境設計與待核資料分開；每一筆史實都有存在的文獻', () => {
    assert.ok(RICE_FACTS.length > 0 && RICE_SCENARIO.length > 0 && RICE_PENDING.length > 0)
    for (const fact of RICE_FACTS) {
      assert.ok(fact.sourceIds?.length, fact.text ?? fact.label)
      for (const id of fact.sourceIds) assert.ok(getSource(id), id)
    }
  })

  test('章節引用的文獻都存在；每一筆文獻有網址、日期與用途', () => {
    const ids = new Set(Object.values(RICE_CHAPTERS).flatMap((chapters) => chapters.flatMap((c) => c.sourceIds ?? [])))
    assert.ok(ids.size >= 6)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https:\/\//, id)
      assert.ok(source.usage, id)
      assert.ok(source.sourceDate || source.published, id)
    }
    // 1930、1945 的情境標示「歷史情境示意」
    for (const eraId of ['banquet', 'modern', 'postwar']) assert.equal(getShop(RICE_AND_SHINE_ID, eraId).scenarioNote, '歷史情境示意')
  })
})
