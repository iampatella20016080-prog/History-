import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import { createStore } from 'zustand/vanilla'
import { ERAS } from '../src/data/eras.js'
import { createAmbienceManager } from '../src/audio/AmbienceManager.js'
import {
  AMBIENCE_SOUNDS,
  ERA_AMBIENCE,
  FADE,
  MUSIC_RATIO,
  LOOP_PAD,
  MAX_TRACKS,
  MIN_AUDIBLE,
  STORY_RATIO,
  ambienceSoundIds,
  distanceGain,
  entryGain,
  masterRamp,
  masterTarget,
  planTracks,
} from '../src/audio/ambienceCore.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')

describe('環境音：聲音清單', () => {
  test('每個年代都有清單，且只用音檔表裡的聲音、音檔都存在且夠小', () => {
    for (const era of ERAS) {
      const list = ERA_AMBIENCE[era.id]
      assert.ok(list?.length >= 3, `${era.id} 至少三種環境聲`)
      assert.equal(new Set(list.map((e) => e.sound)).size, list.length, `${era.id} 的聲音不重複`)
      for (const entry of list) assert.ok(AMBIENCE_SOUNDS[entry.sound], `${era.id}: ${entry.sound}`)
    }
    let total = 0
    for (const [id, sound] of Object.entries(AMBIENCE_SOUNDS)) {
      const path = join(PUBLIC, sound.file)
      assert.ok(existsSync(path), `${id} 音檔不存在`)
      const size = statSync(path).size
      assert.ok(size < 300 * 1024, `${id} 超過 300 KB`)
      total += size
      assert.ok(sound.duration > 4 && sound.duration < 30)
    }
    assert.ok(total < 2 * 1024 * 1024, '全部音檔 < 2 MB')
    assert.deepEqual(new Set(ambienceSoundIds()), new Set(Object.keys(AMBIENCE_SOUNDS)), '沒有沒用到的音檔')
  })

  test('年代正確性：留聲機只在摩登、收音機只在庶民生活、機車只在老屋新生、港口商街沒有機械聲', () => {
    const where = (sound) => ERAS.filter((e) => ERA_AMBIENCE[e.id].some((x) => x.sound === sound)).map((e) => e.id)
    assert.deepEqual(where('gramophone'), ['modern'])
    assert.deepEqual(where('radio'), ['postwar'])
    assert.deepEqual(where('scooter'), ['revival'])
    assert.deepEqual(where('trishaw'), ['postwar'])
    assert.deepEqual(where('bicycle-bell'), ['modern'])
    assert.deepEqual(where('wharf-calls'), ['qing-port'])
    assert.deepEqual(where('oars'), ['qing-port'])
    assert.deepEqual(where('gong-distant'), ['banquet'])
    assert.deepEqual(ERA_AMBIENCE['qing-port'].map((e) => e.sound).sort(), ['oars', 'river-lap', 'street-murmur', 'wharf-calls'])
  })

  test('錨點在可走的街道、廣場或河岸一帶（不在街道以外很遠的地方）', () => {
    for (const list of Object.values(ERA_AMBIENCE))
      for (const e of list.filter((x) => x.mode === 'spot')) {
        assert.ok(e.anchor.x >= -60 && e.anchor.x <= 40 && Math.abs(e.anchor.z) <= 12, `${e.sound} 錨點 (${e.anchor.x}, ${e.anchor.z})`)
        assert.ok(e.outer > e.inner && e.inner > 0)
        assert.ok(e.gain > 0 && e.gain <= 1)
      }
  })
})

describe('環境音：距離與聲軌上限', () => {
  test('distanceGain：內圈 1、外圈 0、單調下降', () => {
    assert.equal(distanceGain(0, 10, 40), 1)
    assert.equal(distanceGain(10, 10, 40), 1)
    assert.equal(distanceGain(40, 10, 40), 0)
    assert.equal(distanceGain(99, 10, 40), 0)
    let prev = 1
    for (let d = 10; d <= 40; d += 1) {
      const g = distanceGain(d, 10, 40)
      assert.ok(g <= prev + 1e-12)
      prev = g
    }
    assert.ok(Math.abs(distanceGain(25, 10, 40) - 0.5) < 1e-9)
  })

  test('走近河岸時水聲變大、走到街尾幾乎聽不到；人聲底噪處處相同', () => {
    const river = ERA_AMBIENCE['qing-port'].find((e) => e.sound === 'river-lap')
    const murmur = ERA_AMBIENCE['qing-port'].find((e) => e.sound === 'street-murmur')
    assert.equal(entryGain(river, { x: -47, z: 0 }), 1)
    assert.ok(entryGain(river, { x: -30, z: 0 }) < entryGain(river, { x: -40, z: 0 }))
    assert.equal(entryGain(river, { x: 30, z: 0 }), 0)
    assert.equal(entryGain(murmur, { x: -47, z: 0 }), entryGain(murmur, { x: 30, z: 0 }))
  })

  test('planTracks：同時聲軌不超過上限，聲音大的優先；出生點附近只播應該聽到的', () => {
    for (const era of ERAS)
      for (const x of [-50, -40, -20, 0, 4, 20, 34])
        for (const z of [-6, 0, 7]) {
          const { targets } = planTracks({ eraId: era.id, pos: { x, z } })
          assert.ok(targets.size <= MAX_TRACKS)
          for (const g of targets.values()) assert.ok(g >= MIN_AUDIBLE && g <= 1)
        }
    const { targets } = planTracks({ eraId: 'postwar', pos: { x: 4, z: 7 }, max: 2 })
    assert.equal(targets.size, 2)
    assert.ok(targets.has('vendor-calls'), '廟埕中央先聽到攤販叫賣')
    const spawn = planTracks({ eraId: 'qing-port', pos: { x: 13, z: 0.7 } })
    assert.ok(!spawn.targets.has('oars'), '出生點聽不到河岸的船槳')
  })

  test('planTracks：含淡出中的聲軌也算進上限，不會超過', () => {
    const live = ['a', 'b', 'c']
    const plan = planTracks({ eraId: 'postwar', pos: { x: 4, z: 7 }, live, max: 4 })
    assert.equal(plan.start.length, 1)
    const full = planTracks({ eraId: 'postwar', pos: { x: 4, z: 7 }, live: ['a', 'b', 'c', 'd'], max: 4 })
    assert.deepEqual(full.start, [])
    const again = planTracks({ eraId: 'postwar', pos: { x: 4, z: 7 }, live: ['vendor-calls'], max: 4 })
    assert.ok(!again.start.includes('vendor-calls'), '已在播的不重複建立')
  })

  test('總音量與淡入淡出時間', () => {
    assert.equal(masterTarget({ enabled: false, volume: 0.6, transitioning: false, story: false }), 0)
    assert.equal(masterTarget({ enabled: true, volume: 0.6, transitioning: true, story: false }), 0)
    assert.equal(masterTarget({ enabled: true, volume: 0.6, transitioning: false, story: false }), 0.6)
    assert.ok(Math.abs(masterTarget({ enabled: true, volume: 0.6, transitioning: false, story: true }) - 0.6 * STORY_RATIO) < 1e-12)
    assert.ok(Math.abs(masterTarget({ enabled: true, volume: 0.6, transitioning: false, story: false, music: true }) - 0.6 * MUSIC_RATIO) < 1e-12, '音樂播放中環境音退讓')
    assert.equal(masterRamp({ from: 0.6, to: 0 }), FADE.out)
    assert.equal(masterRamp({ from: 0, to: 0.6, first: true }), FADE.first)
    assert.equal(masterRamp({ from: 0, to: 0.6 }), FADE.in)
    assert.ok(FADE.out < 1.0, '淡出在轉場起霧（0.7 秒）內完成，換街景時已經安靜')
  })
})

class FakeParam {
  constructor(v) {
    this.value = v
  }
  cancelScheduledValues() {}
  setValueAtTime(v) {
    this.value = v
  }
  linearRampToValueAtTime(v) {
    this.value = v
  }
}

function setup({ pos = { x: 4, z: 7 }, storage = {}, allowResume = true } = {}) {
  const ctxs = []
  const sources = []
  const mem = { ...storage }
  const fetched = []
  const ctxFactory = () => {
    const ctx = {
      state: 'suspended',
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      createGain: () => ({ gain: new FakeParam(1), connect() {}, disconnect() {} }),
      createBuffer: () => ({}),
      createBufferSource() {
        const s = { loop: false, loopStart: 0, loopEnd: 0, stopped: false, connect() {}, disconnect() {}, start(_, off) { this.offset = off; sources.push(this) }, stop() { this.stopped = true } }
        return s
      },
      resume() {
        if (allowResume) this.state = 'running'
        return Promise.resolve()
      },
      suspend() {
        this.state = 'suspended'
        return Promise.resolve()
      },
      decodeAudioData: () => Promise.resolve({}),
    }
    ctxs.push(ctx)
    return ctx
  }
  let position = pos
  const manager = createAmbienceManager({
    storage: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => (mem[k] = String(v)) },
    doc: { hidden: false, addEventListener() {}, removeEventListener() {} },
    createContext: ctxFactory,
    resolveUrl: (f) => f,
    fetchAudio: async (url) => {
      fetched.push(url)
      return { slice: () => ({}) }
    },
    setInterval: () => 1,
    clearInterval: () => {},
    getPosition: () => position,
  })
  const game = createStore(() => ({ started: false, transitioning: false, eraId: 'postwar', mode: 'explore' }))
  manager.connect(game, () => position)
  const flush = async () => {
    for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r))
  }
  return { manager, game, ctxs, sources: { get length() { return sources.filter((x) => x.offset !== undefined).length }, [Symbol.iterator]: () => sources.filter((x) => x.offset !== undefined)[Symbol.iterator](), filter: (f) => sources.filter((x) => x.offset !== undefined).filter(f) }, mem, fetched, flush, move: (p) => (position = p) }
}

describe('環境音管理器', () => {
  test('使用者開始探索之前不建立 AudioContext；開始後播放該年代的聲音，數量不超過上限', async () => {
    const t = setup()
    assert.equal(t.ctxs.length, 0)
    assert.equal(t.manager.inspect().status, 'idle')
    t.game.setState({ started: true })
    await t.flush()
    assert.equal(t.ctxs.length, 1)
    const info = t.manager.inspect()
    assert.equal(info.status, 'playing')
    assert.ok(info.playingTracks.includes('vendor-calls'))
    assert.ok(info.playingTracks.length <= MAX_TRACKS)
    for (const s of t.sources) {
      assert.equal(s.loop, true)
      assert.equal(s.offset, LOOP_PAD)
      assert.ok(s.loopEnd > s.loopStart)
    }
  })

  test('被瀏覽器阻擋時顯示 blocked，下一次使用者操作後恢復', async () => {
    const t = setup({ allowResume: false })
    t.game.setState({ started: true })
    await t.flush()
    assert.equal(t.manager.inspect().status, 'blocked')
    assert.equal(t.sources.length, 0)
    t.ctxs[0].resume = function () {
      this.state = 'running'
      return Promise.resolve()
    }
    t.manager.unlock()
    await t.flush()
    assert.equal(t.manager.inspect().status, 'playing')
  })

  test('轉場：開始就淡出到 0，結束後淡入；共有的聲音不重建，不屬於新年代的停掉', async () => {
    const t = setup({ pos: { x: -40, z: 0 } })
    t.game.setState({ started: true, eraId: 'qing-port' })
    await t.flush()
    const before = t.manager.inspect()
    assert.ok(before.playingTracks.includes('wharf-calls'))
    assert.ok(before.masterTarget > 0)
    t.game.setState({ transitioning: true })
    assert.equal(t.manager.inspect().masterTarget, 0)
    t.game.setState({ eraId: 'banquet' })
    await t.flush()
    const mid = t.manager.inspect()
    assert.ok(!mid.playingTracks.includes('wharf-calls'), '港口的吆喝在新年代停掉')
    const started = mid.startedCount
    t.game.setState({ transitioning: false })
    await t.flush()
    const after = t.manager.inspect()
    assert.ok(after.masterTarget > 0)
    assert.ok(after.playingTracks.includes('river-lap'))
    assert.equal(t.sources.filter((s) => s.offset !== undefined).length, after.startedCount)
    assert.ok(after.startedCount >= started)
    assert.equal(after.eraId, 'banquet')
  })

  test('走遠後水聲聲軌淡出並停止，走回來又出現', async () => {
    const t = setup({ pos: { x: -46, z: 0 } })
    t.game.setState({ started: true, eraId: 'qing-port' })
    await t.flush()
    assert.ok(t.manager.inspect().playingTracks.includes('oars'))
    t.move({ x: 30, z: 0 })
    t.manager.tick()
    assert.ok(!t.manager.inspect().playingTracks.includes('oars'))
    t.ctxs[0].currentTime += 5
    t.manager.tick()
    assert.ok(!t.manager.inspect().liveTracks.includes('oars'), '淡出完成後釋放')
    t.move({ x: -46, z: 0 })
    t.manager.tick()
    await t.flush()
    assert.ok(t.manager.inspect().playingTracks.includes('oars'))
  })

  test('開關與音量獨立記憶，關閉後停止所有聲軌；閱讀故事時降音量', async () => {
    const t = setup()
    t.game.setState({ started: true })
    await t.flush()
    t.manager.setMusicActive(true)
    assert.ok(Math.abs(t.manager.inspect().masterTarget - 0.35 * MUSIC_RATIO) < 1e-9)
    t.manager.setMusicActive(false)
    t.manager.setVolume(0.3)
    assert.equal(t.mem['ddc.ambience.volume'], '0.3')
    assert.ok(!('ddc.music.volume' in t.mem), '不影響背景音樂的設定')
    t.game.setState({ mode: 'reading' })
    assert.ok(Math.abs(t.manager.inspect().masterTarget - 0.3 * STORY_RATIO) < 1e-9)
    t.manager.setEnabled(false)
    assert.equal(t.mem['ddc.ambience.enabled'], 'false')
    assert.equal(t.manager.inspect().masterTarget, 0)
    assert.equal(t.manager.inspect().status, 'off')
    const again = setup({ storage: { 'ddc.ambience.enabled': 'false', 'ddc.ambience.volume': '0.2' } })
    assert.equal(again.manager.inspect().enabled, false)
    assert.equal(again.manager.inspect().volume, 0.2)
    again.game.setState({ started: true })
    await again.flush()
    assert.equal(again.ctxs.length, 0, '關閉時不建立 AudioContext')
  })

  test('載入失敗不會讓程式出錯，也不會每個更新週期重試', async () => {
    const t = setup()
    t.manager.disconnect()
    const failing = createAmbienceManager({
      storage: { getItem: () => null, setItem() {} },
      doc: { hidden: false, addEventListener() {}, removeEventListener() {} },
      createContext: () => ({ state: 'running', currentTime: 0, createGain: () => ({ gain: new FakeParam(1), connect() {} }), createBuffer: () => ({}), createBufferSource: () => ({ connect() {}, start() {} }), resume: () => Promise.resolve() }),
      fetchAudio: async () => {
        failing.count = (failing.count ?? 0) + 1
        throw new Error('offline')
      },
      setInterval: () => 1,
      clearInterval() {},
      getPosition: () => ({ x: 4, z: 7 }),
    })
    const game = createStore(() => ({ started: false, transitioning: false, eraId: 'postwar', mode: 'explore' }))
    failing.connect(game)
    game.setState({ started: true })
    for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r))
    const first = failing.count
    assert.ok(first > 0)
    failing.tick()
    failing.tick()
    for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r))
    assert.equal(failing.count, first, '冷卻期間不重試')
    assert.equal(failing.inspect().status, 'error')
  })
})
