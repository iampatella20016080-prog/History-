import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildArcadeBuilding } from '../src/game/builders/arcade.js'
import { buildShophouse } from '../src/game/builders/shophouse.js'
import {
  ERA_WEATHERING,
  GRILLE_ERAS,
  POSTER_ERAS,
  POSTER_THEMES,
  applyWeathering,
  planWeathering,
  weatheringLevel,
} from '../src/game/builders/weathering.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

const BUILDERS = { minnan: buildShophouse, baroque: buildArcadeBuilding, deco: buildArcadeBuilding, postwar: buildArcadeBuilding }

/** 逐棟產生某個年代的一般建築，收集風化規劃 */
function weatherEra(eraId, transform = (config) => config) {
  const layout = createEraLayout(ERAS.find((era) => era.id === eraId))
  const results = []
  for (const building of layout.buildings) {
    const builder = BUILDERS[building.config.archetype ?? 'minnan']
    if (!builder || !building.config.weathering) continue
    const b = new PartBuilder()
    const detail = new PartBuilder()
    b.weatherLog = []
    b.push([building.x, 0, building.z], building.rotationY)
    detail.push([building.x, 0, building.z], building.rotationY)
    builder(b, transform({ ...building.config }), detail)
    results.push({ building, b, detail, plan: b.weatherLog[0] ?? null })
  }
  return results
}

const overlaps = (a, b) => Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height

describe('灰泥牆：風化程度', () => {
  test('庶民生活最舊、清末最新，老屋新生比庶民生活乾淨', () => {
    assert.ok(ERA_WEATHERING.postwar > ERA_WEATHERING.modern)
    assert.ok(ERA_WEATHERING.modern > ERA_WEATHERING.banquet)
    assert.ok(ERA_WEATHERING.banquet > ERA_WEATHERING['qing-port'])
    assert.ok(ERA_WEATHERING.revival < ERA_WEATHERING.postwar)
    for (const era of ERAS) assert.ok(era.id in ERA_WEATHERING, era.id)
  })

  test('condition 影響程度：老舊 > 使用多年 > 新建，修復後較乾淨；未知年代為 0', () => {
    for (const eraId of Object.keys(ERA_WEATHERING)) {
      assert.ok(weatheringLevel(eraId, 'aged') >= weatheringLevel(eraId, 'mature'))
      assert.ok(weatheringLevel(eraId, 'mature') > weatheringLevel(eraId, 'new'))
      assert.ok(weatheringLevel(eraId, 'restored') < weatheringLevel(eraId, 'mature'))
      assert.ok(weatheringLevel(eraId, 'aged') <= 1)
    }
    assert.equal(weatheringLevel('nowhere', 'aged'), 0)
  })

  test('各年代的一般建築：庶民生活的水漬最多，老屋新生以補土痕跡為主', () => {
    const stains = {}
    for (const era of ERAS) {
      const results = weatherEra(era.id)
      assert.ok(results.length > 10, era.id)
      stains[era.id] = results.flatMap((r) => r.plan.stains)
    }
    assert.ok(stains.postwar.length > stains['qing-port'].length * 2)
    assert.ok(stains.postwar.length > stains.revival.length)
    const patches = stains.revival.filter((s) => s.kind === 'patch').length
    assert.ok(patches > stains.revival.length / 2, '老屋新生多是修補過的痕跡')
    assert.equal(stains.postwar.filter((s) => s.kind === 'patch').length, 0)
  })

  test('固定亂數：同一面牆每次產生都一樣', () => {
    const a = weatherEra('postwar').map((r) => r.plan)
    const b = weatherEra('postwar').map((r) => r.plan)
    assert.deepEqual(a, b)
  })
})

describe('灰泥牆：海報與鐵窗花', () => {
  test('海報只在庶民生活年代；鐵窗花只在庶民生活與老屋新生', () => {
    assert.deepEqual(POSTER_ERAS, ['postwar'])
    assert.deepEqual(GRILLE_ERAS, ['postwar', 'revival'])
    for (const era of ERAS) {
      const plans = weatherEra(era.id).map((r) => r.plan)
      const posters = plans.flatMap((p) => p.posters)
      const grilles = plans.flatMap((p) => p.grilles)
      if (era.id === 'postwar') assert.ok(posters.length >= 6, `庶民生活的海報 ${posters.length}`)
      else assert.equal(posters.length, 0, era.id)
      if (GRILLE_ERAS.includes(era.id)) assert.ok(grilles.length >= 3, `${era.id} 的鐵窗 ${grilles.length}`)
      else assert.equal(grilles.length, 0, era.id)
    }
  })

  test('海報是不具名的情境示意：只用泛稱主題、不寫字', () => {
    for (const theme of POSTER_THEMES) {
      assert.match(theme.label, /情境示意/)
      assert.ok(['film', 'medicine', 'election'].includes(theme.id))
    }
    const posters = weatherEra('postwar').flatMap((r) => r.plan.posters)
    for (const poster of posters) {
      assert.ok(POSTER_THEMES.some((t) => t.id === poster.theme))
      assert.equal(poster.text, undefined)
    }
    const source = readFileSync(new URL('../src/game/builders/weathering.js', import.meta.url), 'utf8')
    assert.doesNotMatch(source, /addSign|text:/, '海報不寫招牌字')
  })

  test('風化與海報不蓋住窗、招牌與燈籠；鐵窗只套在窗上', () => {
    for (const eraId of ['qing-port', 'postwar', 'revival']) {
      for (const { plan } of weatherEra(eraId)) {
        for (const item of [...plan.stains, ...plan.posters]) {
          for (const other of plan.avoid) assert.ok(!overlaps(item, other), `${eraId} ${item.kind ?? item.theme} 蓋到 ${other.kind}`)
        }
        for (let i = 0; i < plan.posters.length; i++) {
          for (let j = i + 1; j < plan.posters.length; j++) assert.ok(!overlaps(plan.posters[i], plan.posters[j]))
        }
      }
    }
  })

  test('既有的戰後鐵窗不重複加；店家建築與另外建模的建築不套用', () => {
    for (const { plan } of weatherEra('postwar')) {
      for (const g of plan.grilles) assert.ok(g.width > 0.3 && g.height > 0.25)
    }
    for (const era of ERAS) {
      const layout = createEraLayout(era)
      for (const building of layout.buildings) {
        if (building.storeId) assert.equal(building.config.weathering, undefined, `${era.id} ${building.storeId}`)
      }
    }
  })
})

describe('灰泥牆：不改變配置與效能', () => {
  test('建築本體不變：碰撞、鏡頭遮擋、招牌、燈籠與其他材質的幾何都一樣', () => {
    for (const eraId of ['postwar', 'revival']) {
      const withIt = weatherEra(eraId)
      const without = weatherEra(eraId, (config) => ({ ...config, weathering: undefined }))
      assert.equal(withIt.length, without.length)
      withIt.forEach((r, i) => {
        const o = without[i]
        assert.equal(o.plan, null)
        assert.deepEqual(r.b.blockers, o.b.blockers)
        assert.deepEqual(r.b.colliders, o.b.colliders)
        assert.deepEqual(r.b.signs, o.b.signs)
        assert.deepEqual(r.b.lanterns, o.b.lanterns)
        assert.deepEqual(r.b.banners, o.b.banners)
        for (const material of o.b.groups.keys()) {
          if (material === 'plain') continue
          assert.equal(r.b.groups.get(material).length, o.b.groups.get(material).length, `${eraId} ${material}`)
        }
        assert.deepEqual([...r.b.groups.keys()].sort(), [...o.b.groups.keys(), ...(o.b.groups.has('plain') ? [] : ['plain'])].sort())
      })
    }
  })

  test('只用既有的 plain 材質，不新增材質', () => {
    const plan = planWeathering({
      eraId: 'postwar',
      condition: 'aged',
      seed: 3,
      surfaces: [{ x0: -2, x1: 2, y0: 3.5, y1: 6, z: 0 }],
      columns: [{ x: 2, width: 0.42, y0: 0.5, y1: 3, z: 2 }],
      openings: [{ kind: 'window', x: 0, y: 4.8, width: 1.2, height: 1.4, z: 0 }],
    })
    const b = new PartBuilder()
    const detail = new PartBuilder()
    applyWeathering(b, detail, plan)
    assert.ok(plan.stains.length > 0)
    for (const builder of [b, detail]) for (const key of builder.groups.keys()) assert.equal(key, 'plain')
  })

  test('各年代的街景：繪製批次維持在預算內，海報與鐵窗只在精緻模式（detail）', () => {
    for (const era of ERAS) {
      const world = buildEraWorldSync(era.id)
      assert.ok(world.batches.length <= 40, `${era.id} 街景批次 ${world.batches.length}`)
      assert.ok(world.detailBatches.length <= 8, `${era.id} 細節批次 ${world.detailBatches.length}`)
    }
    for (const { b, plan } of weatherEra('postwar')) {
      // 海報與鐵窗放在 detail：街景本體的 plain 只多了風化薄片
      const stainParts = plan.stains.length + plan.stains.filter((s) => s.kind === 'peel').length
      assert.ok(stainParts <= 20)
      assert.ok(b.groups.has('plain'))
    }
  })
})
