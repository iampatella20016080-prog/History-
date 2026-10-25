import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { CI_SHENG_CHAPTERS, MIAOKOU_FOODS_CHAPTER } from '../src/data/ciShengMiaokouData.js'
import { TIMELINE_EVENTS } from '../src/data/overview.js'
import { SHOPS, getShop, getShopBuilding, getShopsByEra } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { TEMPLE_COURT, templeCourtToWorld } from '../src/data/squidSoupLayout.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 慈聖宮與廟口小吃（第 6 階段 B）：同一座廟、同一個 ID，各年代的章節不同——
 * 酒樓繁華、摩登大稻埕是文化據點（廟的沿革），庶民生活是廟口的情境示意攤位與四種小吃，老屋新生只寫現況。
 * 查證結論（docs/research/ci-sheng-gong-miaokou.md）：不寫任何具名的老店、攤主與各攤年份；年份並列、標待核。
 */
const SHOP_ID = 'ci-sheng-gong'
const base = getShop(SHOP_ID)
const byEra = Object.fromEntries(ERAS.map((era) => [era.id, getShop(SHOP_ID, era.id)]))
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))
const TEMPLE_ERAS = ['banquet', 'modern', 'postwar', 'revival']

function chapterText(chapter) {
  return [
    chapter.lead,
    chapter.intro,
    chapter.footnote,
    chapter.disclaimer,
    ...(chapter.paragraphs ?? []),
    ...(chapter.timeline ?? []).map((i) => i.text),
    ...(chapter.facts ?? []).map((i) => `${i.label}${i.value}`),
    ...(chapter.glossary ?? []).map((i) => `${i.term}${i.definition}`),
    ...(chapter.items ?? []).map((i) => `${i.name}${i.category}${i.description}${i.note}`),
  ]
    .filter(Boolean)
    .join('')
}

function allText(shop) {
  return [shop.name, shop.category, shop.summary, shop.note, shop.yearNote, shop.scenarioNote, ...Object.values(shop.eraNotes ?? {}), ...shop.chapters.map(chapterText)]
    .filter(Boolean)
    .join('')
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

describe('慈聖宮廟口：年代版本', () => {
  test('同一個 ID 出現在酒樓繁華起的四個年代；港口商街沒有（廟在日治才遷到這裡）', () => {
    assert.ok(SHOPS.filter((shop) => shop.id === SHOP_ID).length === 1)
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(SHOP_ID), TEMPLE_ERAS.includes(era.id), era.id)
      assert.equal(!!getShopBuilding(base, era.id), TEMPLE_ERAS.includes(era.id), era.id)
      assert.equal(worlds[era.id].buildings.some((item) => item.storeId === SHOP_ID), TEMPLE_ERAS.includes(era.id), era.id)
    }
  })

  test('各年代都開放；酒樓繁華與摩登是文化據點（只有廟的沿革、沒有食物圖鑑），庶民生活有情境攤位與四種小吃，老屋新生只寫現況', () => {
    for (const eraId of TEMPLE_ERAS) assert.equal(byEra[eraId].status, 'open', eraId)
    for (const eraId of ['banquet', 'modern']) {
      assert.equal(byEra[eraId].kind, 'heritage', eraId)
      assert.equal(byEra[eraId].name, '慈聖宮')
      assert.deepEqual(byEra[eraId].chapters.map((c) => c.id), ['temple', 'sources'])
      assert.ok(!byEra[eraId].chapters.some((c) => c.type === 'foods'))
    }
    assert.notEqual(byEra.postwar.kind, 'heritage')
    assert.equal(byEra.postwar.name, '慈聖宮廟口小吃')
    assert.equal(byEra.postwar.scenarioNote, '歷史情境重建')
    assert.deepEqual(byEra.postwar.chapters.map((c) => c.id), ['miaokou', 'miaokou-foods', 'temple', 'sources'])
    assert.deepEqual(byEra.revival.chapters.map((c) => c.id), ['today', 'temple', 'sources'])
    assert.ok(!byEra.revival.chapters.some((c) => c.type === 'foods'))
    // 店家名錄用年代版本
    assert.equal(getShopsByEra(ERAS.find((e) => e.id === 'postwar')).find((s) => s.id === SHOP_ID).name, '慈聖宮廟口小吃')
    // 不寫創立年份（年份各說不一）
    assert.equal(base.year, undefined)
    assert.match(base.yearNote, /待核/)
  })

  test('四種小吃各有名稱、分類、說明與標示；描述只限做法特色', () => {
    const items = MIAOKOU_FOODS_CHAPTER.items
    assert.deepEqual(items.map((i) => i.name), ['原汁排骨湯', '肉粥', '豬腳麵線', '四神湯'])
    for (const item of items) {
      for (const key of ['id', 'name', 'category', 'description', 'note']) assert.ok(item[key], `${item.name} 缺 ${key}`)
      assert.doesNotMatch(item.description, /\d{4}年|元/)
    }
    assert.match(MIAOKOU_FOODS_CHAPTER.footnote, /不代表價格/)
  })
})

describe('慈聖宮廟口：出處與禁寫內容', () => {
  test('每一章都有存在的出處；文獻章列出所有引用；查證紀錄有新的來源並有檢核說明', () => {
    for (const chapters of Object.values(CI_SHENG_CHAPTERS)) {
      for (const chapter of chapters) {
        assert.ok(chapter.sourceIds?.length, chapter.tab)
        for (const id of chapter.sourceIds) {
          const source = getSource(id)
          assert.ok(source, `${chapter.tab} 引用的 ${id} 不存在`)
          assert.match(source.url, /^https?:\/\//, id)
          assert.ok(source.published, id)
        }
      }
      const cited = new Set(chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
      const listed = new Set(chapters.at(-1).sourceIds)
      assert.equal(chapters.at(-1).type, 'sources')
      for (const id of cited) assert.ok(listed.has(id), `文獻章漏列 ${id}`)
    }
    for (const id of ['sinica-gis-2025-cisheng', 'tcma-cisheng-four-herb', 'tvbs-supertaste-cisheng', 'ettoday-2018-cisheng']) {
      const source = getSource(id)
      assert.ok(source.usage && source.context, id)
    }
    // 中研院專題的「民國50年間」在來源裡標待核
    assert.match(getSource('sinica-gis-2025-cisheng').context, /待核/)
  })

  test('禁寫：具名老店的店名、攤主、各攤年份與排名一律不出現', () => {
    const text = TEMPLE_ERAS.map((eraId) => allText(byEra[eraId])).join('') + ['sinica-gis-2025-cisheng', 'tcma-cisheng-four-herb', 'tvbs-supertaste-cisheng', 'ettoday-2018-cisheng'].map((id) => getSource(id).usage).join('')
    for (const banned of ['許仔', '葉家', '阿桂姨', '江家', '黃記', '賴記', '媽祖宮口', '魷魚標', '1974', '1958', '白種元', '郭台銘', '第四代', '第二代']) {
      assert.doesNotMatch(text, new RegExp(banned), banned)
    }
    // 只寫「有些傳到第三代」這種未指明哪一攤的概述
    for (const m of text.matchAll(/第三代/g)) {
      const around = text.slice(Math.max(0, m.index - 40), m.index + 30)
      assert.match(around, /未指明/, around)
    }
  })

  test('年份並列、標待核：初建四說、遷建 1909／1910、完工 1914／1916；攤販聚集「民國50年」標待核、不寫成戰後初期；古蹟身分不寫成事實', () => {
    const text = allText(byEra.postwar)
    assert.match(text, /1909／1910/)
    assert.match(text, /1914／1916/)
    for (const year of ['1855', '1864', '1866', '1869']) assert.match(text, new RegExp(year))
    assert.match(text, /各說不一/)
    for (const m of text.matchAll(/民國50年/g)) {
      const around = text.slice(m.index, m.index + 60)
      assert.match(around, /待核/, around)
    }
    // 「戰後初期」只能出現在「不寫成」的聲明裡
    for (const m of text.matchAll(/戰後初期/g)) assert.match(text.slice(Math.max(0, m.index - 6), m.index), /不寫成「$/, text.slice(m.index - 20, m.index + 6))
    assert.doesNotMatch(text, /日治時期.{0,10}(已有|就有)/)
    for (const m of text.matchAll(/古蹟/g)) {
      const around = text.slice(Math.max(0, m.index - 40), m.index + 60)
      assert.match(around, /待核|單一來源|不寫成事實|未核對/, around)
    }
    // 整體標「歷史情境重建」；四神湯「由迪化街口遷入」只當待核例子、不點名
    assert.match(text, /歷史情境重建/)
    const relocation = text.match(/迪化街口[^。]*。[^。]*。/)
    assert.ok(relocation)
    assert.match(relocation[0], /待核/)
    assert.match(relocation[0], /不點名/)
    // 老屋新生只寫現況、不點名
    const today = allText(byEra.revival)
    assert.match(today, /現在.{0,20}仍有/)
    assert.match(today, /不寫任何具名/)
  })

  test('年表：遷建完成的大事有出處並標待核；對照地圖的門牌在店家資料裡', () => {
    const event = TIMELINE_EVENTS.find((item) => /慈聖宮/.test(item.text))
    assert.ok(event)
    assert.equal(event.year, 1914)
    assert.match(event.text, /待核/)
    for (const id of event.sourceIds) assert.ok(getSource(id), id)
    assert.match(base.address, /保安街49巷17號/)
  })
})

describe('慈聖宮廟口：地段、碰撞、互動與鏡頭', () => {
  test('沒有新的建築或攤位：地段切分不變、廟埕原有的四攤與矮牆不變、其他年代的廟不受影響', () => {
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => item.id === 'south-19'))
    const stalls = ['temple-squid-stall', 'temple-mi-tai-mu-stall', 'temple-douhua-stall', 'temple-kueh-stall']
    for (const id of stalls) assert.ok(worlds.postwar.buildings.some((item) => item.storeId === id), id)
    for (const eraId of ['banquet', 'modern', 'revival']) for (const id of stalls) assert.ok(!worlds[eraId].buildings.some((item) => item.storeId === id), `${eraId} ${id}`)
    // 同一個年代的世界重建兩次：建築與碰撞數量相同（店家資料沒有改變街景）
    const again = buildEraWorldSync('postwar')
    assert.equal(again.buildings.length, worlds.postwar.buildings.length)
    assert.equal(again.collision.obstacles.length, worlds.postwar.collision.obstacles.length)
  })

  test('熱點在廟埕前的街邊：各年代走得到、左右各一步也走得到；只有一個熱點、各年代開不同的章節', () => {
    for (const eraId of TEMPLE_ERAS) {
      const shop = byEra[eraId]
      const placement = getShopPlacement(shop)
      assert.equal(placement.hotspots.length, 1, eraId)
      const [hotspot] = placement.hotspots
      assert.ok(shop.chapters.some((c) => c.id === hotspot.chapter), `${eraId} ${hotspot.chapter}`)
      const world = worlds[eraId]
      const point = hotspot.interactionPoint
      assert.ok(walkableAt(world, point.x, point.z), eraId)
      for (const side of [-0.6, 0.6]) assert.ok(walkableAt(world, point.x + side, point.z), `${eraId} 旁 ${side} m`)
    }
    assert.equal(getShopPlacement(byEra.postwar).hotspots[0].chapter, 'miaokou')
    assert.equal(getShopPlacement(byEra.revival).hotspots[0].chapter, 'today')
    assert.equal(getShopPlacement(byEra.banquet).hotspots[0].chapter, 'temple')
  })

  test('熱點（連同離開時的緩衝）不和同年代其他已開放店家的互動範圍重疊（含廟口四攤）', () => {
    const EXIT_MARGIN = 0.7
    const circles = (item) => {
      const placement = getShopPlacement(item)
      if (placement.hotspots.length) return placement.hotspots.filter((h) => !h.clickOnly && (h.level ?? 0) === 0).map((h) => ({ point: h.interactionPoint, radius: h.radius }))
      return placement.level === 0 ? [{ point: placement.interactionPoint, radius: item.interaction?.radius ?? 3.2 }] : []
    }
    for (const eraId of TEMPLE_ERAS) {
      const era = ERAS.find((e) => e.id === eraId)
      const others = getShopsByEra(era).filter((item) => item.id !== SHOP_ID && item.status === 'open')
      for (const mine of circles(byEra[eraId])) {
        for (const other of others) {
          for (const theirs of circles(other)) {
            const d = Math.hypot(mine.point.x - theirs.point.x, mine.point.z - theirs.point.z)
            assert.ok(d >= mine.radius + EXIT_MARGIN + theirs.radius, `${eraId}：與 ${other.id} 相距 ${d.toFixed(2)} m`)
          }
        }
      }
    }
  })

  test('從熱點走進廟埕、繞過天公爐到廟前的石階，再走出來：多種步長、連續三次', () => {
    const world = worlds.postwar
    const start = getShopPlacement(byEra.postwar).hotspots[0].interactionPoint
    // 朝目標一步一步走（每一步都套用碰撞），回傳離目標的距離
    const goTo = (p, target, step) => {
      const n = Math.ceil(Math.hypot(target.x - p.x, target.z - p.z) / step) + 6
      for (let i = 0; i < n; i++) {
        const dx = target.x - p.x
        const dz = target.z - p.z
        const d = Math.hypot(dx, dz)
        if (d < 1e-3) break
        const s = Math.min(step, d)
        p.x += (dx / d) * s
        p.z += (dz / d) * s
        resolvePlayerPosition(p, PLAYER.radius, world.collision)
      }
      return Math.hypot(target.x - p.x, target.z - p.z)
    }
    // 路線（廟埕本地座標）：廟埕前緣 → 中央通道到天公爐前 → 往西側繞過天公爐 → 廟前的石階 → 原路走出來
    const route = [[0, 1.0], [0, -3.3], [1.3, -3.3], [1.3, -5.6], [1.3, -3.3], [0, -3.3], [0, 1.0]].map(([x, z]) => templeCourtToWorld(x, z))
    for (const step of [0.12, 0.21, 0.45]) {
      for (let round = 0; round < 3; round++) {
        const p = { x: start.x, z: start.z }
        for (const target of route) assert.ok(goTo(p, target, step) < 0.35, `步長 ${step}：走不到 (${target.x.toFixed(1)}, ${target.z.toFixed(1)})，停在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.ok(goTo(p, start, step) < 0.35, `步長 ${step}：回不到熱點`)
      }
    }
  })

  test('介紹鏡頭在街上、不在任何障礙物裡；到注視點的視線不被廟埕的攤位、桌椅與天公爐擋住', () => {
    for (const eraId of TEMPLE_ERAS) {
      const world = worlds[eraId]
      const { camera } = getShopPlacement(byEra[eraId]).hotspots[0]
      assert.ok(walkableAt(world, camera.position.x, camera.position.z), eraId)
      // 鏡頭與注視點都在廟埕的中線附近，從街上沿中央通道看進去
      assert.ok(Math.abs(camera.position.x - TEMPLE_COURT.x) < 1.5)
      for (let t = 0.1; t < 0.9; t += 0.1) {
        const x = camera.position.x + (camera.target.x - camera.position.x) * t
        const y = camera.position.y + (camera.target.y - camera.position.y) * t
        const z = camera.position.z + (camera.target.z - camera.position.z) * t
        for (const box of world.blockers ?? []) {
          const inside = x > box.minX && x < box.maxX && y > box.minY && y < box.maxY && z > box.minZ && z < box.maxZ
          assert.ok(!inside, `${eraId}：視線在 ${t.toFixed(1)} 被擋住`)
        }
      }
    }
  })
})
