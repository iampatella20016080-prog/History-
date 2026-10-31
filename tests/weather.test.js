import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import { MeshToonMaterial } from 'three'
import { ERAS, getEra } from '../src/data/eras.js'
import { QUALITY_MODES } from '../src/game/quality.js'
import {
  RAIN,
  RAIN_LOOK,
  WEATHER_IDS,
  WEATHER_STORAGE_KEY,
  createWeatherState,
  effectiveWeather,
  initialWeather,
  rainNumber,
  saveWeather,
  stepWeather,
  weatherActive,
  weatherAvailable,
  weatherSteady,
} from '../src/game/weather.js'
import { COVER, coverTexelWorld, coverUv, decodeCover, dropFallTime, findEaveEmitters, groundAt, packHeight, unpackHeight, wrapToCamera } from '../src/game/rainMath.js'
import { atmosphere, setAtmosphere, setAtmosphereOverlay } from '../src/game/atmosphere.js'
import { AMBIENCE_SOUNDS, ERA_AMBIENCE, WEATHER_AMBIENCE, getWeatherAmbience, planTracks } from '../src/audio/ambienceCore.js'
import { AMBIENCE_CREDITS, AMBIENCE_SOURCES } from '../src/audio/ambienceCredits.js'
import { createRainGeometry, createRainMaterial, createDripGeometry, createDripMaterial, createCoverMaterial } from '../src/game/rendering/rainShader.js'
import { patchWaterMaterial } from '../src/game/rendering/waterShader.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { RIVER } from '../src/game/config.js'
import { STRINGS } from '../src/i18n/strings.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), data }
}

describe('天氣：只在精緻畫質', () => {
  test('流暢畫質沒有天氣選項，精緻畫質有', () => {
    assert.equal(QUALITY_MODES.smooth.weather, false)
    assert.equal(QUALITY_MODES.fine.weather, true)
    assert.equal(weatherAvailable('smooth'), false)
    assert.equal(weatherAvailable('fine'), true)
  })

  test('流暢畫質一律晴天（選了雨也一樣）；精緻畫質照選擇', () => {
    assert.equal(effectiveWeather('smooth', 'rain'), 'clear')
    assert.equal(effectiveWeather('smooth', 'clear'), 'clear')
    assert.equal(effectiveWeather('fine', 'rain'), 'rain')
    assert.equal(effectiveWeather('fine', 'clear'), 'clear')
    assert.equal(effectiveWeather('fine', 'snow'), 'clear')
  })

  test('開始時的天氣：網址參數 > 記住的選擇 > 晴天；無效的值不採用', () => {
    assert.deepEqual(WEATHER_IDS, ['clear', 'rain'])
    assert.equal(initialWeather('', memoryStorage()), 'clear')
    assert.equal(initialWeather('', memoryStorage({ [WEATHER_STORAGE_KEY]: 'rain' })), 'rain')
    assert.equal(initialWeather('?weather=clear', memoryStorage({ [WEATHER_STORAGE_KEY]: 'rain' })), 'clear')
    assert.equal(initialWeather('?weather=rain', memoryStorage()), 'rain')
    assert.equal(initialWeather('?weather=hail', memoryStorage({ [WEATHER_STORAGE_KEY]: 'fog' })), 'clear')
    const storage = memoryStorage()
    saveWeather('rain', storage)
    assert.equal(storage.data[WEATHER_STORAGE_KEY], 'rain')
    saveWeather('clear', { setItem: () => { throw new Error('私密瀏覽') } })
  })

  test('設定選單的字串兩種語言都有', () => {
    for (const lang of Object.keys(STRINGS)) {
      for (const key of ['settings.weather', 'settings.weather.clear', 'settings.weather.rain', 'settings.weather.clearHint', 'settings.weather.rainHint', 'settings.weatherNote'])
        assert.ok(STRINGS[lang][key]?.length > 0, `${lang} ${key}`)
    }
    const menu = readFileSync(join(ROOT, 'src/ui/SettingsMenu.jsx'), 'utf8')
    assert.match(menu, /weatherAvailable\(mode\) && <WeatherSection \/>/, '天氣的選項只在精緻畫質顯示')
  })
})

describe('天氣：雨勢的變化', () => {
  const run = (state, seconds, raining, dt = 1 / 30) => {
    for (let t = 0; t < seconds; t += dt) stepWeather(state, dt, raining)
    return state
  }

  test('一開始是晴天，全部是 0；一開始就下雨時直接是下了一陣子的樣子', () => {
    assert.deepEqual(createWeatherState(), { rain: 0, sky: 0, wet: 0, puddle: 0, drip: 0 })
    assert.deepEqual(weatherSteady(true), { rain: 1, sky: 1, wet: 1, puddle: 1, drip: 1 })
    assert.equal(weatherActive(createWeatherState()), false)
  })

  test('開始下雨：雨絲先變密，地面慢慢變濕，積水最慢；屋簷過一會兒才滴水', () => {
    const s = run(createWeatherState(), 3, true)
    assert.ok(s.rain > 0.5 && s.rain < 1, `雨 ${s.rain}`)
    assert.ok(s.wet > 0.1 && s.wet < s.rain, `地面 ${s.wet}`)
    assert.ok(s.puddle < s.wet, `積水 ${s.puddle}`)
    assert.ok(s.drip < s.rain, `滴水 ${s.drip}`)
    run(s, 60, true)
    assert.deepEqual(s, { rain: 1, sky: 1, wet: 1, puddle: 1, drip: 1 })
  })

  test('雨停後地面漸乾：雨絲幾秒內停，屋簷還滴一陣子，地面先乾，積水最後才退', () => {
    const s = weatherSteady(true)
    run(s, 4, false)
    assert.equal(s.rain, 0)
    assert.ok(s.drip > 0.5, `屋簷還在滴 ${s.drip}`)
    assert.ok(s.wet > 0.8, `地面還濕 ${s.wet}`)
    run(s, 34, false)
    assert.ok(s.wet < 0.15 && s.wet > 0, `地面快乾了 ${s.wet}`)
    assert.ok(s.puddle > s.wet, `積水比地面晚乾 ${s.puddle}`)
    assert.ok(weatherActive(s))
    run(s, 80, false)
    assert.deepEqual(s, createWeatherState())
    assert.equal(weatherActive(s), false)
  })

  test('每一步都在 0..1，卡頓的長影格不會一次跳到底', () => {
    const s = createWeatherState()
    stepWeather(s, 5, true)
    for (const v of Object.values(s)) assert.ok(v >= 0 && v <= 1)
    assert.ok(s.wet < 0.05, '一個 5 秒的影格只算 0.25 秒')
  })
})

describe('天氣：雨天的光線（疊在年代光線上）', () => {
  const copy = (current) => Object.fromEntries(Object.entries(current).map(([k, v]) => [k, v?.isColor || v?.isVector3 ? v.toArray() : v]))

  test('雨勢 0：每個年代的光線逐位和沒有天氣時相同（流暢畫質不變）', () => {
    for (const era of ERAS) {
      setAtmosphereOverlay({ rain: 0 })
      setAtmosphere(era)
      const before = copy(atmosphere.current)
      setAtmosphereOverlay({ rain: 1 })
      assert.notDeepEqual(copy(atmosphere.current), before)
      setAtmosphereOverlay({ rain: 0 })
      assert.deepEqual(copy(atmosphere.current), before, era.id)
    }
  })

  test('雨天：陽光、光束與星星幾乎沒有，霧近一點，天色變灰，燈早一點亮', () => {
    setAtmosphereOverlay({ rain: 0 })
    setAtmosphere(getEra('postwar'))
    const clear = copy(atmosphere.current)
    setAtmosphereOverlay({ rain: 1 })
    const rain = atmosphere.current
    assert.ok(rain.sunIntensity < clear.sunIntensity * 0.4)
    assert.equal(rain.air_rays, 0)
    assert.equal(rain.stars, 0)
    assert.ok(rain.fogFar < clear.fogFar && rain.fogNear < clear.fogNear)
    assert.ok(rain.glow > clear.glow)
    const sat = (c) => Math.max(...c) - Math.min(...c)
    assert.ok(sat(rain.skyTop.toArray()) < sat(clear.skyTop), '天色比較灰')
    setAtmosphereOverlay({ rain: 0 })
  })

  test('rainNumber：沒有設定的數值不變；雨勢 0 原樣回傳', () => {
    assert.equal(rainNumber('exposure', 1.234, 0), 1.234)
    assert.equal(rainNumber('lineStrength', 0.8, 1), 0.8)
    assert.ok(Math.abs(rainNumber('sunIntensity', 2, 1) - 2 * RAIN_LOOK.mul.sunIntensity) < 1e-12)
    assert.ok(Math.abs(rainNumber('glow', 0.5, 0.5) - (0.5 + RAIN_LOOK.add.glow * 0.5)) < 1e-12)
  })
})

describe('天氣：遮雨高度圖與屋簷滴水（rainMath.js）', () => {
  test('世界座標 ↔ 高度圖：像素中心換回世界座標再換成貼圖座標，落在同一個像素', () => {
    for (const [col, row] of [[0, 0], [100, 37], [COVER.width - 1, COVER.height - 1]]) {
      const [x, z] = coverTexelWorld(col, row)
      const [u, v] = coverUv(x, z)
      assert.equal(Math.floor(u * COVER.width), col)
      assert.equal(Math.floor(v * COVER.height), row)
    }
    assert.deepEqual(coverUv(COVER.minX, COVER.maxZ), [0, 0])
  })

  test('高度的編碼：兩個 8 位元通道，精度在 1 公分以內；沒有畫到的像素是沒有遮蔽', () => {
    for (const y of [-1.05, 0, 0.15, 2.94, 7.3, 33]) {
      const [hi, lo] = packHeight(y)
      assert.ok(Math.abs(unpackHeight(hi, lo) - y) < 0.01, `${y}`)
    }
    assert.equal(unpackHeight(0, 0, 0), -Infinity)
    const pixels = new Uint8Array(COVER.width * COVER.height * 4)
    const decoded = decodeCover(pixels)
    assert.equal(decoded.length, COVER.width * COVER.height)
    assert.equal(decoded[0], -Infinity)
  })

  test('高度圖涵蓋整條街、河岸廣場、棧橋與廟埕', () => {
    assert.ok(COVER.minX <= -53 && COVER.maxX >= 38, '棧橋到街底')
    assert.ok(COVER.minZ <= -30 && COVER.maxZ >= 30)
    assert.equal(groundAt(RIVER.edgeX - 1, RIVER.edgeX, RIVER.waterLevel), RIVER.waterLevel)
    assert.equal(groundAt(0, RIVER.edgeX, RIVER.waterLevel), 0)
  })

  /** 一塊 3 公尺高的騎樓屋頂（z −4.5..−2.8、x −10..10），其餘是地面 */
  function synthetic() {
    const c = { ...COVER, minX: -16, maxX: 16, minZ: -8, maxZ: 8, width: 256, height: 128 }
    const heights = new Float32Array(c.width * c.height).fill(0)
    for (let row = 0; row < c.height; row++)
      for (let col = 0; col < c.width; col++) {
        const [x, z] = coverTexelWorld(col, row, c)
        if (x > -10 && x < 10 && z > -4.5 && z < -2.8) heights[row * c.width + col] = 3
      }
    return { c, heights }
  }

  test('屋簷滴水點：沿著屋頂的邊緣（簷口），從 3 公尺落到地面；平地與屋頂中間沒有', () => {
    const { c, heights } = synthetic()
    const emitters = findEaveEmitters(heights, c, { spacing: 0.3 })
    assert.ok(emitters.length > 100, `${emitters.length}`)
    for (const [x, top, z, bottom] of emitters) {
      assert.ok(Math.abs(top - 2.96) < 1e-6 && bottom === 0)
      const edge = Math.min(Math.abs(z + 2.8), Math.abs(z + 4.5), Math.abs(x - 10), Math.abs(x + 10))
      assert.ok(edge < 0.4, `(${x}, ${z}) 不在簷口`)
    }
    // 靠街的那一邊（z ≈ −2.8）連成一排水簾：每公尺約 3 點
    const front = emitters.filter(([, , z]) => Math.abs(z + 2.8) < 0.4)
    assert.ok(front.length >= 50 && front.length <= 80, `${front.length}`)
  })

  test('屋簷滴水點：同一格只留一點、超過上限時離街道中心近的優先', () => {
    const { c, heights } = synthetic()
    const all = findEaveEmitters(heights, c, { spacing: 0.3 })
    const keys = new Set(all.map(([x, , z]) => `${Math.floor(x / 0.3)},${Math.floor(z / 0.3)}`))
    assert.equal(keys.size, all.length)
    const few = findEaveEmitters(heights, c, { spacing: 0.3, max: 20, focus: [0, -3] })
    assert.equal(few.length, 20)
    for (const [x] of few) assert.ok(Math.abs(x) < 4, `${x}`)
  })

  test('沒有遮蔽的鄰居用地面高度（河面比街面低）', () => {
    const c = { ...COVER, minX: -50, maxX: -40, minZ: -2, maxZ: 2, width: 80, height: 32 }
    const heights = new Float32Array(c.width * c.height).fill(-Infinity)
    for (let row = 0; row < c.height; row++)
      for (let col = 0; col < c.width; col++) if (coverTexelWorld(col, row, c)[0] > -44) heights[row * c.width + col] = 2.5
    const emitters = findEaveEmitters(heights, c, { ground: (x) => groundAt(x, RIVER.edgeX, RIVER.waterLevel) })
    assert.ok(emitters.length > 0)
    for (const e of emitters) assert.equal(e[3], 0, '河岸邊（x > 堤防）落在街面')
  })

  test('水滴自由落體的時間；雨絲固定在世界座標、在鏡頭附近循環', () => {
    assert.ok(Math.abs(dropFallTime(3, 0) - Math.sqrt(6 / 9.8)) < 1e-9)
    const box = RAIN.box
    for (const cam of [-100, -3.2, 0, 17, 250]) {
      const x = wrapToCamera(0.37, box, cam)
      assert.ok(Math.abs(x - cam) <= box / 2 + 1e-9, `${x} 離鏡頭 ${cam} 太遠`)
      assert.ok(Math.abs(((x - 0.37 * box) / box) % 1) < 1e-9, '和種子差整數個 box')
    }
    // 鏡頭稍微移動時，大部分雨絲留在原地
    assert.equal(wrapToCamera(0.4, box, 1), wrapToCamera(0.4, box, 1.5))
  })
})

describe('天氣：著色器與網格（只在精緻畫質建立）', () => {
  test('雨絲與水花一個網格、屋簷滴水一個網格（各一次繪製）', () => {
    const rain = createRainGeometry(10, 4)
    assert.equal(rain.index.count, 14 * 6)
    assert.equal(rain.attributes.aCorner.count, 14 * 4)
    const kinds = new Set()
    for (let i = 0; i < 14 * 4; i++) kinds.add(rain.attributes.aCorner.getZ(i))
    assert.deepEqual([...kinds].sort(), [0, 1])
    const drips = createDripGeometry([[0, 3, -2.8, 0], [1, 3, -2.8, 0]])
    assert.equal(drips.index.count, 2 * (RAIN.dripsPerEmitter + 1) * 6)
    assert.equal(createRainMaterial().name, 'RainStreaks')
    assert.equal(createDripMaterial().name, 'RainDrips')
    assert.equal(createCoverMaterial().name, 'CoverHeight')
    // 不寫入深度、兩面都畫（雨絲的朝向依方向而定）
    assert.equal(createRainMaterial().depthWrite, false)
  })

  test('河面的雨點漣漪只加在精緻畫質那一份水面著色器（有倒影的）；流暢畫質的水面材質不經過這裡', () => {
    const compile = (reflect) => {
      const material = patchWaterMaterial(new MeshToonMaterial())
      material.userData.planarReflection = reflect
      const shader = { uniforms: {}, vertexShader: '#include <common>\n#include <project_vertex>', fragmentShader: '#include <common>\n#include <map_fragment>\n#include <opaque_fragment>' }
      material.onBeforeCompile(shader)
      return shader
    }
    assert.ok(compile(true).fragmentShader.includes('rainRipples'))
    assert.ok(!compile(false).fragmentShader.includes('uRain'))
  })

  test('流暢畫質的街景批次不變：15／20／25／27／37', () => {
    const expected = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) assert.equal(buildEraWorldSync(era.id).batches.length, expected[era.id], era.id)
  })
})

describe('天氣：雨聲', () => {
  test('雨聲是天氣的聲音，不在任何年代的清單裡；雨勢 0 時聲軌規劃和以前相同', () => {
    assert.ok(AMBIENCE_SOUNDS.rain)
    for (const list of Object.values(ERA_AMBIENCE)) assert.ok(!list.some((e) => e.sound === 'rain'))
    assert.deepEqual(WEATHER_AMBIENCE.rain.map((e) => e.sound), ['rain'])
    assert.deepEqual(getWeatherAmbience(0), [])
    for (const era of ERAS) {
      const pos = { x: -40, z: 0 }
      assert.deepEqual(planTracks({ eraId: era.id, pos }), planTracks({ eraId: era.id, pos, rain: 0 }))
      assert.ok(!planTracks({ eraId: era.id, pos }).targets.has('rain'))
    }
  })

  test('下雨時整條街都聽得到雨聲，音量跟著雨勢；聲軌上限照舊', () => {
    const far = { x: 30, z: 0 }
    const full = planTracks({ eraId: 'modern', pos: far, rain: 1 })
    const half = planTracks({ eraId: 'modern', pos: far, rain: 0.5 })
    assert.ok(full.targets.get('rain') > 0.8)
    assert.ok(Math.abs(half.targets.get('rain') - full.targets.get('rain') / 2) < 1e-9)
    assert.ok(full.targets.size <= 4)
  })

  test('雨聲的錄音是 CC0，有來源、剪輯與「情境示意」說明，CREDITS.md 也有', () => {
    const credit = AMBIENCE_CREDITS.rain
    assert.ok(credit && credit.context.startsWith('情境示意') && credit.contextEn.length > 20 && credit.editsEn.length > 20)
    const source = AMBIENCE_SOURCES[credit.sources[0]]
    assert.equal(source.license, 'CC0-1.0')
    assert.match(source.url, /^https:\/\/freesound\.org\/people\/newlocknew\/sounds\/826025\/$/)
    assert.ok(source.recordedEn.length > 20)
    const md = readFileSync(join(ROOT, 'public/audio/ambience/CREDITS.md'), 'utf8')
    assert.ok(md.includes('`rain.mp3`') && md.includes(source.url) && md.includes(credit.edits))
    assert.ok(existsSync(join(ROOT, 'public/audio/ambience/rain.mp3')))
    assert.ok(existsSync(join(ROOT, 'public/audio/ambience/synth/rain.mp3')))
  })
})
