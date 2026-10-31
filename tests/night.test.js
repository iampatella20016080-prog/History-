import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { SOURCES } from '../src/data/sources.js'
import { atmosphere, setAtmosphere, setAtmosphereOverlay } from '../src/game/atmosphere.js'
import {
  NIGHT_ERAS,
  NIGHT_LOOK,
  TIME_IDS,
  TIME_STORAGE_KEY,
  effectiveTimeOfDay,
  initialTimeOfDay,
  nightEra,
  nightNumber,
  saveTimeOfDay,
  stepNight,
  timeAvailable,
} from '../src/game/night.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { STRINGS } from '../src/i18n/strings.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const copy = (current) => Object.fromEntries(Object.entries(current).map(([k, v]) => [k, v?.isColor || v?.isVector3 ? v.toArray() : v]))
const memoryStorage = (initial = {}) => {
  const data = { ...initial }
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), data }
}
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

describe('夜晚：只在精緻畫質', () => {
  test('流暢畫質沒有時段選項、一律白天；精緻畫質照選擇', () => {
    assert.equal(timeAvailable('smooth'), false)
    assert.equal(timeAvailable('fine'), true)
    assert.equal(effectiveTimeOfDay('smooth', 'night'), 'day')
    assert.equal(effectiveTimeOfDay('fine', 'night'), 'night')
    assert.equal(effectiveTimeOfDay('fine', 'dusk'), 'day')
  })

  test('開始時的時段：網址參數 > 記住的選擇 > 白天；無效的值不採用', () => {
    assert.deepEqual(TIME_IDS, ['day', 'night'])
    assert.equal(initialTimeOfDay('', memoryStorage()), 'day')
    assert.equal(initialTimeOfDay('', memoryStorage({ [TIME_STORAGE_KEY]: 'night' })), 'night')
    assert.equal(initialTimeOfDay('?time=day', memoryStorage({ [TIME_STORAGE_KEY]: 'night' })), 'day')
    assert.equal(initialTimeOfDay('?time=midnight', memoryStorage({ [TIME_STORAGE_KEY]: 'noon' })), 'day')
    const storage = memoryStorage()
    saveTimeOfDay('night', storage)
    assert.equal(storage.data[TIME_STORAGE_KEY], 'night')
    saveTimeOfDay('day', { setItem: () => { throw new Error('私密瀏覽') } })
  })

  test('設定選單：時段只在精緻畫質顯示，兩種語言都有字串', () => {
    for (const lang of Object.keys(STRINGS))
      for (const key of ['settings.time', 'settings.time.day', 'settings.time.night', 'settings.time.dayHint', 'settings.time.nightHint', 'settings.timeNote'])
        assert.ok(STRINGS[lang][key]?.length > 0, `${lang} ${key}`)
    const menu = readFileSync(join(ROOT, 'src/ui/SettingsMenu.jsx'), 'utf8')
    assert.match(menu, /timeAvailable\(mode\) && <TimeSection \/>/)
  })

  test('入夜約 5 秒、天亮約 4 秒，長影格不會一次跳到底', () => {
    let v = 0
    for (let t = 0; t < 2.5; t += 1 / 30) v = stepNight(v, 1 / 30, true)
    assert.ok(v > 0.4 && v < 0.6, `${v}`)
    for (let t = 0; t < 4; t += 1 / 30) v = stepNight(v, 1 / 30, true)
    assert.equal(v, 1)
    v = stepNight(v, 10, false)
    assert.ok(v > 0.9)
    for (let t = 0; t < 5; t += 1 / 30) v = stepNight(v, 1 / 30, false)
    assert.equal(v, 0)
  })

  test('流暢畫質的街景批次不變：15／20／25／27／37', () => {
    const expected = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) assert.equal(buildEraWorldSync(era.id).batches.length, expected[era.id], era.id)
  })
})

describe('夜晚的光線（疊在年代光線上）', () => {
  test('夜晚 0：每個年代的光線逐位和沒有疊加時相同', () => {
    for (const era of ERAS) {
      setAtmosphereOverlay({ rain: 0, night: 0 })
      setAtmosphere(era)
      const before = copy(atmosphere.current)
      setAtmosphereOverlay({ night: 1, nightEra: nightEra(era.id) })
      assert.notDeepEqual(copy(atmosphere.current), before)
      setAtmosphereOverlay({ night: 0 })
      assert.deepEqual(copy(atmosphere.current), before, era.id)
    }
  })

  test('夜晚：天色暗、星星滿、陽光換成偏藍的月光；窗光依年代亮起', () => {
    for (const era of ERAS) {
      setAtmosphereOverlay({ night: 0 })
      setAtmosphere(era)
      const day = copy(atmosphere.current)
      setAtmosphereOverlay({ night: 1, nightEra: nightEra(era.id) })
      const night = atmosphere.current
      assert.ok(luminance(night.skyTop.toArray()) < luminance(day.skyTop) || era.id === 'banquet', era.id)
      assert.equal(night.stars, 1)
      assert.ok(night.sunColor.b > night.sunColor.r, '月光偏藍')
      assert.ok(Math.abs(night.glow - NIGHT_ERAS[era.id].glow) < 1e-9)
      assert.ok(night.glow >= day.glow, `${era.id} 夜裡的燈不比白天暗`)
      // 月亮在西邊（觀音山上空），陰影方向仍以 24° 為下限
      assert.ok(night.sunDirection.x < -0.9 && night.sunDirection.y > 0.15 && night.sunDirection.y < 0.25)
      assert.ok(night.lightDirection.y >= Math.sin((24 * Math.PI) / 180) - 1e-9)
    }
    setAtmosphereOverlay({ night: 0 })
  })

  test('雨夜：天色保持暗，不會被雨天的亮灰色洗白', () => {
    setAtmosphereOverlay({ rain: 0, night: 0 })
    setAtmosphere(getEra('postwar'))
    setAtmosphereOverlay({ night: 1, nightEra: nightEra('postwar') })
    const night = luminance(atmosphere.current.skyHorizon.toArray())
    setAtmosphereOverlay({ rain: 1, night: 1, nightEra: nightEra('postwar') })
    const rainyNight = luminance(atmosphere.current.skyHorizon.toArray())
    assert.ok(rainyNight < night * 1.6 + 0.02, `${night} → ${rainyNight}`)
    setAtmosphereOverlay({ rain: 0, night: 0 })
  })

  test('nightNumber：0 原樣回傳；年代的 glow 取代通用目標', () => {
    assert.equal(nightNumber('glow', 0.3, 0), 0.3)
    assert.ok(Math.abs(nightNumber('glow', 0.3, 1, NIGHT_ERAS['qing-port']) - NIGHT_ERAS['qing-port'].glow) < 1e-12)
    assert.equal(nightNumber('stars', 0, 1), NIGHT_LOOK.to.stars)
    assert.equal(nightNumber('lineStrength', 0.8, 1), 0.8)
  })
})

describe('夜晚：各年代的照明依史料', () => {
  test('每個年代都有設定、說明（中英文）、有出處的依據與標示的情境重建', () => {
    for (const era of ERAS) {
      const n = NIGHT_ERAS[era.id]
      assert.ok(n, era.id)
      assert.ok(n.note.length > 20 && n.noteEn.length > 20)
      assert.ok(n.reconstructed.includes('情境重建') && n.reconstructedEn.length > 20, era.id)
      assert.ok(n.evidence.length >= 2, era.id)
      for (const id of n.evidence) {
        assert.ok(SOURCES[id], `${era.id}：${id} 不在 sources.js`)
        assert.match(SOURCES[id].url, /^https:\/\//)
      }
      assert.ok(/^#[0-9a-f]{6}$/.test(n.windowTint) && n.tintAmount > 0 && n.tintAmount <= 0.6)
      assert.ok(n.lift >= 0 && n.lift <= 0.05, `${era.id} 暗部提亮`)
    }
  })

  test('清末沒有電燈：街景沒有路燈與燈泡，窗光最暗、最偏橘；1905 年以後的年代才是電燈', () => {
    assert.equal(NIGHT_ERAS['qing-port'].electric, false)
    for (const id of ['banquet', 'modern', 'postwar', 'revival']) assert.equal(NIGHT_ERAS[id].electric, true)
    assert.equal(getEra('qing-port').streetProps.lamps, null)
    const qing = buildEraWorldSync('qing-port')
    assert.ok(!qing.batches.some((batch) => batch.material === 'bulb'), '清末的街景沒有燈泡')
    for (const id of ['banquet', 'modern', 'postwar', 'revival']) assert.ok(NIGHT_ERAS['qing-port'].glow <= NIGHT_ERAS[id].glow)
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(NIGHT_ERAS['qing-port'].windowTint.slice(i, i + 2), 16))
    assert.ok(r > g && g > b, '油燈偏橘')
    assert.match(NIGHT_ERAS['qing-port'].note, /1895 年以前大稻埕街上沒有電燈/)
  })

  test('清末的河岸正對月亮：暗部提亮最少（不會整片灰霧）；騎樓深的酒樓繁華、摩登提得多', () => {
    for (const id of ['banquet', 'modern', 'postwar']) assert.ok(NIGHT_ERAS['qing-port'].lift < NIGHT_ERAS[id].lift, id)
    // 老屋新生的雨夜也容易灰，和清末一樣只提一點
    assert.ok(NIGHT_ERAS['qing-port'].lift <= NIGHT_ERAS.revival.lift)
    setAtmosphereOverlay({ night: 0 })
    setAtmosphere(getEra('qing-port'))
    setAtmosphereOverlay({ night: 1, nightEra: nightEra('qing-port') })
    assert.ok(Math.abs(atmosphere.current.lift - NIGHT_ERAS['qing-port'].lift) < 1e-12)
    assert.ok(atmosphere.current.air_sunScatter < 0.05, '往月亮方向的空氣不帶月暈色')
    setAtmosphereOverlay({ night: 0 })
  })

  test('戰後的窗光偏冷白（日光燈）；研究文件存在並列出出處', () => {
    const [r, , b] = [1, 3, 5].map((i) => parseInt(NIGHT_ERAS.postwar.windowTint.slice(i, i + 2), 16))
    assert.ok(b >= r)
    const doc = join(ROOT, 'docs/research/night-lighting.md')
    assert.ok(existsSync(doc))
    const text = readFileSync(doc, 'utf8')
    for (const n of Object.values(NIGHT_ERAS)) for (const id of n.evidence) assert.ok(text.includes(id), id)
    assert.ok(text.includes('查無資料，歷史情境重建'))
  })
})
