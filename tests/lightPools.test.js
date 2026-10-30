import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import {
  MAX_POOL_LIGHTS,
  POOL_RANGE,
  buildPoolLights,
  hexToLinear,
  lightPoolStrength,
  poolBand,
  poolFalloff,
  poolFocus,
  poolRadius,
  selectPoolLights,
  syncLightPoolPass,
} from '../src/game/lightPools.js'
import { QUALITY_MODES } from '../src/game/quality.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 燈光落點（第 9 階段・只在精緻畫質）：衰減曲線、卡通色階、挑燈、各年代強度，
 * 以及流暢畫質完全不建立這一趟（不編譯著色器、繪製呼叫不變）。
 */
const glowOf = (id) => ERAS.find((era) => era.id === id).lighting.glow

describe('衰減與色階', () => {
  test('中心 1、半徑處 0，單調遞減，半徑外為 0', () => {
    assert.equal(poolFalloff(0, 5), 1)
    assert.equal(poolFalloff(5, 5), 0)
    assert.equal(poolFalloff(8, 5), 0)
    let last = 1
    for (let d = 0.25; d <= 5; d += 0.25) {
      const v = poolFalloff(d, 5)
      assert.ok(v <= last, `距離 ${d}`)
      last = v
    }
  })

  test('卡通色階：0 與 1 不變、分成幾階（中間有平台），不超過 1', () => {
    assert.equal(poolBand(0), 0)
    assert.equal(poolBand(1), 1)
    assert.ok(poolBand(2) <= 1)
    // 同一階的中段是平的
    assert.equal(poolBand(0.3), poolBand(0.32))
    // 單調遞增
    let last = 0
    for (let v = 0; v <= 1; v += 0.01) {
      assert.ok(poolBand(v) >= last - 1e-9)
      last = poolBand(v)
    }
  })

  test('半徑：燈籠掛在 3–4 公尺高也照得到地面，最大不超過 7 公尺（光斑不連成一片）', () => {
    assert.ok(poolRadius(1.5) > 4.5 && poolRadius(1.5) < 6)
    assert.ok(poolFalloff(3.6, poolRadius(1.5)) > 0.2, '燈籠正下方的地面')
    assert.ok(poolRadius(10) <= 7)
    assert.ok(poolRadius(0.1) >= 3.5)
  })

  test('sRGB 色碼轉成線性（和 Three.js 相同）', () => {
    const [r, g, b] = hexToLinear('#ff8000')
    assert.equal(r, 1)
    assert.ok(Math.abs(g - 0.2158605) < 1e-5)
    assert.equal(b, 0)
  })
})

describe('挑燈', () => {
  const row = Array.from({ length: 40 }, (_, i) => ({ position: [i * 2, 3, 0], radius: 5, color: [1, 0.5, 0.2] }))

  test('最多 MAX_POOL_LIGHTS 盞，由近到遠', () => {
    const picked = selectPoolLights(row, [0, 3, 0])
    assert.equal(picked.length, MAX_POOL_LIGHTS)
    assert.deepEqual(
      picked.map((p) => p.index),
      Array.from({ length: MAX_POOL_LIGHTS }, (_, i) => i),
    )
  })

  test('最近的燈全亮；被擠出名單的燈之前會先淡出（不會突然消失）', () => {
    const picked = selectPoolLights(row, [0, 3, 0])
    assert.equal(picked[0].weight, 1)
    assert.ok(picked.at(-1).weight < 0.2, `第 ${MAX_POOL_LIGHTS} 盞 ${picked.at(-1).weight}`)
  })

  test('超出範圍的燈不算', () => {
    const far = [{ position: [POOL_RANGE + 1, 0, 0], radius: 5, color: [1, 1, 1] }]
    assert.equal(selectPoolLights(far, [0, 0, 0]).length, 0)
  })

  test('注視點在鏡頭前方（水平方向）', () => {
    const [x, y, z] = poolFocus([0, 2, 0], [0, -0.5, -1], 12)
    assert.ok(Math.abs(x) < 1e-9)
    assert.equal(y, 2)
    assert.ok(Math.abs(z + 12) < 1e-9)
  })

  test('街景的燈火都能轉成光源（半徑、正的色彩）', () => {
    for (const id of ['banquet', 'modern', 'revival']) {
      const world = buildEraWorldSync(id)
      const lights = buildPoolLights(world.glows)
      assert.equal(lights.length, world.glows.length)
      assert.ok(lights.length > 20, `${id} 有 ${lights.length} 盞燈`)
      for (const light of lights) {
        assert.ok(light.radius >= 3.5 && light.radius <= 7)
        assert.ok(light.color.every((c) => c >= 0 && c <= 1))
      }
    }
  })
})

describe('各年代的強度', () => {
  test('酒樓繁華（入夜）全亮、摩登（黃昏）約一半以上', () => {
    assert.equal(lightPoolStrength(glowOf('banquet')), 1)
    assert.ok(lightPoolStrength(glowOf('modern')) >= 0.5, `摩登 ${lightPoolStrength(glowOf('modern'))}`)
  })

  test('老屋新生（明亮白日）只剩一點店面暖光；港口商街、庶民生活的白天為 0', () => {
    const revival = lightPoolStrength(glowOf('revival'))
    assert.ok(revival > 0 && revival < 0.12, `老屋新生 ${revival}`)
    assert.equal(lightPoolStrength(glowOf('qing-port')), 0)
    assert.equal(lightPoolStrength(glowOf('postwar')), 0)
  })

  test('轉場時連續變化（glow 由 0 到 1 單調遞增）', () => {
    let last = 0
    for (let g = 0; g <= 1; g += 0.02) {
      assert.ok(lightPoolStrength(g) >= last)
      last = lightPoolStrength(g)
    }
  })
})

describe('只在精緻畫質', () => {
  test('畫質設定：精緻開啟、流暢關閉', () => {
    assert.equal(QUALITY_MODES.fine.lightPools, true)
    assert.equal(QUALITY_MODES.smooth.lightPools, false)
  })

  test('流暢畫質不建立這一趟（不呼叫 create，不編譯著色器）', () => {
    let created = 0
    const create = () => {
      created++
      return { dispose() {} }
    }
    let pass = null
    for (let i = 0; i < 5; i++) pass = syncLightPoolPass(pass, QUALITY_MODES.smooth, create)
    assert.equal(pass, null)
    assert.equal(created, 0)
  })

  test('切到精緻建立一次；切回流暢就釋放', () => {
    let created = 0
    let disposed = 0
    const create = () => {
      created++
      return { dispose: () => disposed++ }
    }
    let pass = syncLightPoolPass(null, QUALITY_MODES.fine, create)
    pass = syncLightPoolPass(pass, QUALITY_MODES.fine, create)
    assert.equal(created, 1)
    pass = syncLightPoolPass(pass, QUALITY_MODES.smooth, create)
    assert.equal(pass, null)
    assert.equal(disposed, 1)
  })

  test('渲染管線只透過 syncLightPoolPass 建立，流暢畫質的光暈強度不受年代影響', () => {
    const source = readFileSync(new URL('../src/game/rendering/ToonRenderer.jsx', import.meta.url), 'utf8')
    const creates = source.match(/createLightPoolPass\(/g) ?? []
    assert.equal(creates.length, 1)
    assert.match(source, /syncLightPoolPass\(lightPools, next, \(\) => createLightPoolPass\(colorType\)\)/)
    // 流暢畫質 lightPools 為 null → 強度 0 → 光暈 = quality.bloom（0）
    assert.match(source, /const poolStrength = lightPools \? lightPoolStrength\(a\.glow\) : 0/)
    assert.match(source, /tColor\.value = lightPoolsActive\s*\?/)
  })
})
