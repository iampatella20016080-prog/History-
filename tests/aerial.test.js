import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import {
  AIR_DEFAULTS,
  AIR_KEYS,
  DEFAULT_LINE_FADE,
  airPassPlan,
  airValues,
  distanceForFog,
  fogAmount,
  lineFade,
  opticalDepth,
  rayStrength,
  sunElevationFactor,
  sunScreenFactor,
} from '../src/game/aerial.js'
import { atmosphere, setAtmosphere } from '../src/game/atmosphere.js'
import { QUALITY_MODES } from '../src/game/quality.js'
import { ERAS } from '../src/data/eras.js'

/**
 * 空氣遠近感與光束（第 9 階段追加，只在精緻畫質）：霧的係數、各年代參數、光束強度，
 * 以及流暢畫質（iPad）完全不加這兩個 pass。
 */
const era = (id) => ERAS.find((e) => e.id === id)
const air = (id) => airValues(era(id).lighting)

describe('霧的係數', () => {
  const a = { ...AIR_DEFAULTS }
  test('近景（start 以內）完全不加霧', () => {
    assert.equal(fogAmount(a.start - 1, 2, 2, a), 0)
    assert.equal(fogAmount(0, 2, 2, a), 0)
  })

  test('越遠越濃，而且有上限', () => {
    let previous = 0
    for (const d of [20, 40, 80, 160, 320, 640]) {
      const f = fogAmount(d, 2, 2, a)
      assert.ok(f >= previous, `${d} m`)
      previous = f
    }
    assert.ok(fogAmount(5000, 2, 2, a) <= a.max + 1e-9)
    assert.equal(fogAmount(5000, 2, 2, a), a.max)
  })

  test('貼地較濃：同樣距離，看向高處（屋頂、遠山）比看地面淡', () => {
    assert.ok(fogAmount(120, 2, 30, a) < fogAmount(120, 2, 0, a))
    assert.ok(opticalDepth(120, 40, 40, a) < opticalDepth(120, 2, 2, a))
  })

  test('鏡頭和目標同高時，高度積分退化成水平的消光', () => {
    const flat = opticalDepth(100, 5, 5, a)
    const almost = opticalDepth(100, 5, 5.0001, a)
    assert.ok(Math.abs(flat - almost) < 1e-6)
    assert.ok(Math.abs(flat - a.density * (100 - a.start) * Math.exp(-a.heightFalloff * 5)) < 1e-12)
  })

  test('distanceForFog 是 fogAmount 的反函數', () => {
    const d = distanceForFog(0.3, a, 2)
    assert.ok(Math.abs(fogAmount(d, 2, 2, a) - 0.3) < 1e-9)
    assert.equal(distanceForFog(a.max + 0.01, a), Infinity)
  })
})

describe('各年代的參數', () => {
  test('每個年代都有 air，欄位齊全且在合理範圍', () => {
    for (const e of ERAS) {
      assert.ok(e.lighting.air, e.id)
      const v = airValues(e.lighting)
      for (const key of AIR_KEYS) assert.equal(typeof v[key], 'number', `${e.id}.${key}`)
      assert.ok(v.density > 0 && v.density < 0.02, e.id)
      assert.ok(v.max > 0.3 && v.max < 0.8, e.id)
      assert.ok(v.rays >= 0 && v.rays <= 1, e.id)
    }
  })

  test('清末河港偏濕（最濃、最貼地），老屋新生最清', () => {
    const densities = ERAS.map((e) => air(e.id).density)
    assert.equal(air('qing-port').density, Math.max(...densities))
    assert.equal(air('revival').density, Math.min(...densities))
    assert.equal(air('qing-port').heightFalloff, Math.max(...ERAS.map((e) => air(e.id).heightFalloff)))
    // 長街盡頭（150 m）看得出差別
    assert.ok(fogAmount(150, 2, 3, air('qing-port')) > fogAmount(150, 2, 3, air('revival')) + 0.1)
  })

  test('傍晚、黃昏的空氣朝太陽偏暖（太陽光暈色的比例較高）', () => {
    for (const id of ['banquet', 'modern']) assert.ok(air(id).sunScatter > air('revival').sunScatter, id)
  })

  test('沒有設定 air 的年代用預設值', () => {
    assert.deepEqual(airValues({}), AIR_DEFAULTS)
    assert.equal(airValues({ air: { density: 0.01 } }).density, 0.01)
  })

  test('換年代時空氣參數跟著過渡（atmosphere.current 有 air_* 欄位）', () => {
    setAtmosphere(era('banquet'))
    for (const key of AIR_KEYS) assert.equal(atmosphere.current[`air_${key}`], air('banquet')[key], key)
  })
})

describe('描邊淡出', () => {
  test('精緻畫質的描邊不比預設更晚淡出，霧越濃越早淡', () => {
    for (const e of ERAS) {
      const [near, far] = lineFade(air(e.id))
      assert.ok(near < far, e.id)
      assert.ok(near <= DEFAULT_LINE_FADE[0] && far <= DEFAULT_LINE_FADE[1], e.id)
      assert.ok(far >= 60, e.id)
    }
    assert.ok(lineFade(air('qing-port'))[1] < lineFade(air('revival'))[1])
  })

  test('描邊完全淡掉的距離，霧大約 0.4（遠處的黑線不比建築搶眼）', () => {
    const a = air('modern')
    const [, far] = lineFade(a)
    if (far < DEFAULT_LINE_FADE[1]) assert.ok(Math.abs(fogAmount(far, 2, 2, a) - 0.4) < 1e-6)
  })
})

describe('光束強度', () => {
  test('太陽低（傍晚）最強，高過約 45° 就沒有，落到地平線下淡出', () => {
    assert.ok(sunElevationFactor(6) > 0.95)
    assert.ok(sunElevationFactor(14) > 0.9)
    assert.ok(sunElevationFactor(30) < sunElevationFactor(14))
    assert.ok(sunElevationFactor(46) === 0)
    assert.ok(sunElevationFactor(58) === 0)
    assert.equal(sunElevationFactor(-5), 0)
  })

  test('太陽在鏡頭後方時沒有光束；離畫面越遠越淡', () => {
    assert.equal(sunScreenFactor(-0.5, [0, 0]), 0)
    assert.equal(sunScreenFactor(0, [0, 0]), 0)
    assert.equal(sunScreenFactor(0.9, [0, 0]), 1)
    assert.ok(sunScreenFactor(0.9, [1.3, 0]) < 1)
    assert.equal(sunScreenFactor(0.9, [2.2, 0]), 0)
  })

  test('各年代：酒樓繁華（入夜）> 摩登（黃昏）> 白天年代；白天年代弱或關閉', () => {
    const at = (id) => rayStrength(air(id), era(id).lighting.sun.elevation, 0.9, [0, 0.2])
    assert.ok(at('banquet') > at('modern'))
    assert.ok(at('modern') > 0.5)
    for (const id of ['qing-port', 'postwar', 'revival']) assert.ok(at(id) < 0.05, id)
  })
})

describe('流暢畫質（iPad）完全不變', () => {
  test('流暢畫質不加空氣與光束的 pass；精緻畫質兩個都加', () => {
    assert.equal(QUALITY_MODES.smooth.air, false)
    assert.deepEqual(airPassPlan(QUALITY_MODES.smooth), { aerial: false, rays: false })
    assert.equal(QUALITY_MODES.fine.air, true)
    assert.deepEqual(airPassPlan(QUALITY_MODES.fine), { aerial: true, rays: true })
  })

  test('createAirPass 在流暢畫質回傳 null：不建立材質（著色器不編譯）、不配置繪圖目標', async () => {
    const { createAirPass } = await import('../src/game/rendering/airPass.js')
    assert.equal(createAirPass(QUALITY_MODES.smooth, {}), null)
    const pass = createAirPass(QUALITY_MODES.fine, { colorType: undefined, inputTexture: null, depthTexture: null })
    assert.ok(pass)
    // 精緻畫質：一趟光束（四分之一解析度）＋一趟空氣，共兩次全螢幕繪製
    const calls = []
    const gl = { setRenderTarget: (t) => calls.push(t ? 'target' : 'screen'), render: () => calls.push('draw') }
    setAtmosphere(era('banquet'))
    const camera = new (await import('three')).PerspectiveCamera(42, 1.6, 0.3, 900)
    camera.position.set(30, 2, 0)
    camera.lookAt(-20, 3, 0.5)
    pass.update(camera, atmosphere.current)
    assert.ok(pass.rays > 0.3, '酒樓繁華往西看有光束')
    pass.render(gl)
    assert.equal(calls.filter((c) => c === 'draw').length, 2)
    camera.lookAt(80, 3, 0)
    pass.update(camera, atmosphere.current)
    assert.equal(pass.rays, 0, '背對夕陽沒有光束')
    calls.length = 0
    pass.render(gl)
    assert.equal(calls.filter((c) => c === 'draw').length, 1, '沒有光束時略過光束那一趟')
    pass.dispose()
  })

  test('ToonRenderer 只透過 createAirPass 建立 pass，而且只在 quality.air 時；輪廓淡出在流暢畫質維持預設值', () => {
    const source = readFileSync(new URL('../src/game/rendering/ToonRenderer.jsx', import.meta.url), 'utf8')
    assert.match(source, /setAir\(Boolean\(next\.air\)\)/)
    assert.match(source, /air \? air\.update\(camera, a\) : DEFAULT_LINE_FADE/)
    assert.equal((source.match(/createAirPass\(/g) ?? []).length, 1)
    assert.deepEqual(DEFAULT_LINE_FADE, [38, 150])
  })
})
