import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import { createStore } from 'zustand/vanilla'
import { ERAS } from '../src/data/eras.js'
import { CROSSFADE, DUCK_RATIO, MUSIC_STORAGE, createAudioManager } from '../src/audio/AudioManager.js'
import { MUSIC_TRACKS } from '../src/audio/musicTracks.js'

/**
 * 背景音樂管理：以假的 Web Audio（AudioContext、GainNode、AudioBufferSourceNode）與假的下載，
 * 檢查循環設定、換曲交叉淡化、快速切換不疊播、靜音與音量記憶、故事降音量、背景暫停、
 * 被瀏覽器阻擋與載入失敗的處理。這裡只檢查程式邏輯，不能代替實際試聽。
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const flush = async (times = 6) => {
  for (let i = 0; i < times; i++) await new Promise((resolve) => setImmediate(resolve))
}

class FakeParam {
  constructor(value) {
    this.value = value
    this.events = []
  }
  cancelScheduledValues(t) {
    this.events.push(['cancel', t])
  }
  setValueAtTime(v, t) {
    this.value = v
    this.events.push(['set', v, t])
  }
  linearRampToValueAtTime(v, t) {
    this.value = v
    this.events.push(['ramp', v, t])
  }
}

class FakeContext {
  constructor(options) {
    this.options = options
    this.state = 'suspended'
    this.currentTime = 0
    this.sampleRate = 44100
    this.destination = {}
    this.sources = []
    this.decoded = 0
  }
  createGain() {
    return { gain: new FakeParam(1), connect() {}, disconnect() {} }
  }
  createBuffer() {
    return { silent: true }
  }
  createBufferSource() {
    const ctx = this
    const source = {
      buffer: null,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      started: null,
      stopped: null,
      onended: null,
      connect() {},
      disconnect() {},
      start(t, offset) {
        this.started = { t, offset }
        ctx.sources.push(this)
      },
      stop(t) {
        if (this.stopped !== null) return
        this.stopped = t
        setImmediate(() => this.onended?.())
      },
    }
    return source
  }
  resume() {
    if (this.options.allowResume()) this.state = 'running'
    return Promise.resolve()
  }
  suspend() {
    this.state = 'suspended'
    return Promise.resolve()
  }
  decodeAudioData(data) {
    this.decoded++
    return Promise.resolve({ eraId: data.eraId, duration: 17 })
  }
}

function setup({ storage = {}, delays = {}, fail = () => false, allowResume = () => true } = {}) {
  const contexts = []
  const fetches = []
  const store = { ...storage }
  const listeners = new Set()
  const doc = {
    hidden: false,
    addEventListener: (type, fn) => listeners.add(fn),
    removeEventListener: (type, fn) => listeners.delete(fn),
    setHidden(value) {
      this.hidden = value
      for (const fn of listeners) fn()
    },
  }
  const manager = createAudioManager({
    storage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = String(v)) },
    doc,
    createContext: () => {
      const ctx = new FakeContext({ allowResume })
      contexts.push(ctx)
      return ctx
    },
    resolveUrl: (file) => file,
    fetchAudio: (url, signal) =>
      new Promise((resolve, reject) => {
        const eraId = Object.values(MUSIC_TRACKS).find((track) => track.file === url).eraId
        fetches.push(eraId)
        const done = () => {
          if (signal?.aborted) return
          if (fail(eraId)) reject(new Error('network'))
          else {
            const data = new ArrayBuffer(8)
            data.eraId = eraId
            data.slice = () => data
            resolve(data)
          }
        }
        signal?.addEventListener('abort', () => {
          const error = new Error('aborted')
          error.name = 'AbortError'
          reject(error)
        })
        setTimeout(done, delays[eraId] ?? 1)
      }),
  })
  const game = createStore(() => ({ started: false, eraId: 'qing-port', mode: 'explore', qualityMode: 'fine', menuOpen: false, eraTransition: null }))
  manager.connect(game)
  const tracks = () => contexts[0]?.sources.filter((s) => s.loop) ?? []
  const settle = async (ms = 40) => {
    await new Promise((resolve) => setTimeout(resolve, ms))
    await flush()
  }
  return { manager, game, contexts, fetches, store, doc, tracks, settle }
}

describe('設定表與音檔', () => {
  test('五個年代各對應一首、音檔存在、循環區間精確為 15 秒', () => {
    for (const era of ERAS) {
      const track = MUSIC_TRACKS[era.id]
      assert.ok(track, era.id)
      assert.equal(track.loopEnd - track.loopStart, 15)
      assert.ok(existsSync(join(ROOT, 'public', track.file)), track.file)
      assert.equal(track.source, '合成配樂草稿')
      assert.ok(track.voices.length <= 3)
    }
  })
})

describe('播放與換曲', () => {
  test('按下開始探索才建立 AudioContext；預設音量 25%；以 loop／loopStart／loopEnd 循環播放目前年代', async () => {
    const { manager, game, contexts, tracks, settle } = setup()
    await settle()
    assert.equal(contexts.length, 0, '開始前不建立 AudioContext')
    game.setState({ started: true })
    await settle()
    const info = manager.inspect()
    assert.equal(contexts.length, 1)
    assert.equal(info.status, 'playing')
    assert.equal(info.currentEra, 'qing-port')
    assert.equal(info.masterTarget, 0.25)
    const [source] = tracks()
    assert.deepEqual([source.loop, source.loopStart, source.loopEnd], [true, 1, 16])
    assert.equal(source.started.offset, 1, '從曲首（循環起點）開始')
  })

  test('停在同一年代時不重播：畫質、選單、轉場狀態改變都不影響音樂', async () => {
    const { manager, game, settle } = setup()
    game.setState({ started: true })
    await settle()
    const before = manager.inspect().startedCount
    game.setState({ qualityMode: 'smooth' })
    game.setState({ qualityMode: 'fine', menuOpen: true })
    game.setState({ eraTransition: { id: 1, from: 'qing-port', to: 'modern' } })
    await settle()
    assert.equal(manager.inspect().startedCount, before)
    assert.equal(manager.inspect().liveSources, 1)
  })

  test('切換年代：新曲從頭播放，舊曲交叉淡出 0.8 秒後停止並清理', async () => {
    const { manager, game, tracks, settle } = setup()
    game.setState({ started: true })
    await settle()
    game.setState({ eraId: 'banquet' })
    await settle()
    const [oldSource, newSource] = tracks()
    assert.equal(manager.inspect().currentEra, 'banquet')
    assert.equal(newSource.started.offset, 1)
    assert.ok(Math.abs(oldSource.stopped - (CROSSFADE + 0.05)) < 1e-9, `舊曲在 ${oldSource.stopped} 秒停止`)
    assert.equal(manager.inspect().liveSources, 1, '淡出後舊音源已釋放')
  })

  test('快速連續切換 10 次：只播放最後一個年代，沒有殘留疊播', async () => {
    const delays = { 'qing-port': 30, banquet: 5, modern: 25, postwar: 2, revival: 15 }
    const { manager, game, tracks, settle } = setup({ delays })
    game.setState({ started: true })
    await settle(60)
    const order = ['banquet', 'modern', 'postwar', 'revival', 'qing-port', 'modern', 'banquet', 'revival', 'postwar', 'modern']
    for (const eraId of order) game.setState({ eraId })
    await settle(120)
    const info = manager.inspect()
    assert.equal(info.currentEra, 'modern')
    assert.equal(info.liveSources, 1)
    const playing = tracks().filter((s) => s.stopped === null)
    assert.equal(playing.length, 1)
    assert.equal(playing[0].buffer.eraId, 'modern')
  })

  test('連續換曲（每次載入完成後才再換）10 次，音樂始終與年代一致', async () => {
    const { manager, game, settle } = setup()
    game.setState({ started: true })
    await settle()
    const order = ['banquet', 'modern', 'postwar', 'revival', 'qing-port', 'banquet', 'modern', 'postwar', 'revival', 'qing-port']
    for (const eraId of order) {
      game.setState({ eraId })
      await settle()
      const info = manager.inspect()
      assert.equal(info.currentEra, eraId)
      assert.equal(info.liveSources, 1)
    }
  })
})

describe('聲音控制', () => {
  test('已有靜音設定時維持靜音：開始探索不建立音訊；打開開關後才播放', async () => {
    const { manager, game, contexts, settle, store } = setup({ storage: { [MUSIC_STORAGE.enabled]: 'false' } })
    game.setState({ started: true })
    await settle()
    assert.equal(contexts.length, 0)
    assert.equal(manager.inspect().status, 'off')
    manager.setEnabled(true)
    await settle()
    assert.equal(store[MUSIC_STORAGE.enabled], 'true')
    assert.equal(manager.inspect().status, 'playing')
  })

  test('關閉音樂：淡出後停止音源，不在背景偷偷播放；再開啟時重新播放目前年代', async () => {
    const { manager, game, settle } = setup()
    game.setState({ started: true })
    await settle()
    manager.setEnabled(false)
    await settle()
    let info = manager.inspect()
    assert.equal(info.status, 'off')
    assert.equal(info.liveSources, 0)
    assert.equal(info.masterTarget, 0)
    manager.setEnabled(true)
    await settle()
    info = manager.inspect()
    assert.equal(info.status, 'playing')
    assert.equal(info.liveSources, 1)
  })

  test('音量記在 localStorage，下次開啟沿用', async () => {
    const first = setup()
    first.manager.setVolume(0.6)
    assert.equal(first.store[MUSIC_STORAGE.volume], '0.6')
    const second = setup({ storage: first.store })
    assert.equal(second.manager.inspect().volume, 0.6)
  })

  test('開啟故事時降到使用者音量的 40%，關閉後恢復；不覆蓋靜音', async () => {
    const { manager, game, settle } = setup()
    game.setState({ started: true })
    await settle()
    manager.setVolume(0.5)
    game.setState({ mode: 'reading' })
    assert.equal(manager.inspect().masterTarget, 0.5 * DUCK_RATIO)
    game.setState({ mode: 'explore' })
    assert.equal(manager.inspect().masterTarget, 0.5)
    manager.setEnabled(false)
    game.setState({ mode: 'reading' })
    assert.equal(manager.inspect().masterTarget, 0)
    game.setState({ mode: 'explore' })
    assert.equal(manager.inspect().masterTarget, 0, '關閉故事後仍維持靜音')
  })
})

describe('iPad 與錯誤處理', () => {
  test('頁面進入背景時暫停，回來後恢復；原本關閉音樂時不恢復', async () => {
    const { manager, game, contexts, doc, settle } = setup()
    game.setState({ started: true })
    await settle()
    doc.setHidden(true)
    await settle()
    assert.equal(contexts[0].state, 'suspended')
    assert.equal(manager.inspect().status, 'paused')
    doc.setHidden(false)
    await settle()
    assert.equal(contexts[0].state, 'running')
    assert.equal(manager.inspect().status, 'playing')
    assert.equal(manager.inspect().startedCount, 1, '恢復時沒有重播')

    manager.setEnabled(false)
    await settle(400)
    doc.setHidden(true)
    doc.setHidden(false)
    await settle()
    assert.equal(contexts[0].state, 'suspended')
    assert.equal(manager.inspect().status, 'off')
  })

  test('被瀏覽器阻擋時狀態為 blocked（不顯示假播放），使用者點「啟用音樂」後播放', async () => {
    let allow = false
    const { manager, game, settle } = setup({ allowResume: () => allow })
    game.setState({ started: true })
    await settle()
    assert.equal(manager.inspect().status, 'blocked')
    assert.equal(manager.inspect().liveSources, 0)
    allow = true
    manager.retry()
    await settle()
    assert.equal(manager.inspect().status, 'playing')
  })

  test('返回前景時恢復受阻：等待使用者再點一次', async () => {
    let allow = true
    const { manager, game, doc, settle } = setup({ allowResume: () => allow })
    game.setState({ started: true })
    await settle()
    doc.setHidden(true)
    allow = false
    doc.setHidden(false)
    await settle()
    assert.equal(manager.inspect().status, 'blocked')
  })

  test('音檔載入失敗：顯示錯誤、年代不受影響，可重試', async () => {
    let broken = true
    const { manager, game, settle } = setup({ fail: (eraId) => eraId === 'banquet' && broken })
    game.setState({ started: true })
    await settle()
    game.setState({ eraId: 'banquet' })
    await settle()
    assert.equal(manager.inspect().status, 'error')
    assert.equal(game.getState().eraId, 'banquet')
    broken = false
    manager.retry()
    await settle()
    assert.equal(manager.inspect().status, 'playing')
    assert.equal(manager.inspect().currentEra, 'banquet')
    assert.equal(manager.inspect().liveSources, 1)
  })

  test('先下載目前年代，其餘年代在需要時才下載並快取', async () => {
    const { manager, game, fetches, settle } = setup()
    await settle()
    assert.deepEqual(fetches, ['qing-port'], '開始前只先下載目前年代')
    game.setState({ started: true })
    await settle()
    game.setState({ eraId: 'modern' })
    await settle()
    game.setState({ eraId: 'qing-port' })
    await settle()
    assert.deepEqual(fetches, ['qing-port', 'modern'], '回到已載入的年代不重新下載')
    assert.deepEqual(manager.inspect().cached.sort(), ['modern', 'qing-port'])
  })
})
