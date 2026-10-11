/**
 * 背景音樂端對端測試（真實瀏覽器，需要開發版伺服器：window.__DDC__.audioManager）
 *
 * L  五首配樂：以瀏覽器自己的 MP3 解碼器解碼，用 OfflineAudioContext 依設定表的 loopStart／loopEnd
 *    連續循環渲染 45 秒，檢查兩個循環接點有沒有空白（20 毫秒音量）或爆音（樣本跳動量）
 * T  iPad 尺寸觸控模擬：點開始探索、點開關、以觸控事件拖曳音量滑桿
 * R  五個年代各即時播放 45 秒，以分析節點量測總輸出，循環接點附近沒有空白、同時只有一個音源
 * P  遊戲中（桌面）：
 *    - 按「開始探索」後啟用音訊並播放目前年代，循環參數正確
 *    - 畫質來回切換、開關店家名錄、移動角色時不重播、不新增音源
 *    - 開啟店家故事時音量降到 40%，關閉後恢復
 *    - 連續切換年代 10 次，每次音樂都換成目前年代，交叉淡化後只剩一個音源
 *    - 音檔載入失敗時顯示提示、年代照常切換，按「重試」後恢復
 *    - 頁面進入背景時暫停、返回後恢復（模擬 visibilitychange）
 *    - 關閉音樂與音量會記住（重新整理後沿用，靜音時不建立音訊）
 *
 * 用法：npm run dev，然後 node tests/e2e/music.e2e.mjs http://127.0.0.1:5173/
 * 環境變數：PLAYWRIGHT_MODULE、ONLY（L,P,R,T）、LISTEN_SECONDS（即時播放秒數，預設 45）
 *
 * 注意：這些是自動量測，不能取代實際試聽；也沒有在真實 iPad／Safari 上執行。
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const LISTEN_SECONDS = Number(process.env.LISTEN_SECONDS ?? 45)
const TRANSITION_TIMEOUT = 180000
const ERAS = [
  { year: 1853, id: 'qing-port', index: 0 },
  { year: 1895, id: 'banquet', index: 1 },
  { year: 1930, id: 'modern', index: 2 },
  { year: 1945, id: 'postwar', index: 3 },
  { year: 2000, id: 'revival', index: 4 },
]

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

const results = []
function record(test, step, ok, detail = '') {
  results.push({ test, step, ok, detail })
  console.log(`${ok ? '✔' : '✘'} [${test}] ${step}${detail ? ` — ${detail}` : ''}`)
}

const audio = (page) => page.evaluate(() => window.__DDC__.audioManager.inspect())
const waitFor = (page, fn, arg, timeout = 30000) => page.waitForFunction(fn, arg, { timeout }).then(() => true, () => false)

/* ───────────── L：45 秒循環渲染 ───────────── */
async function testLoops(browser) {
  const page = await browser.newPage()
  await page.goto(BASE_URL, { waitUntil: 'load' })
  // 開發伺服器第一次載入時可能重新整理一次（依賴預先打包），等頁面穩定
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  const reports = await page.evaluate(async (seconds) => {
    const { MUSIC_TRACKS } = await import('/src/audio/musicTracks.js')
    const out = []
    for (const track of Object.values(MUSIC_TRACKS)) {
      const data = await (await fetch(`/${track.file}`)).arrayBuffer()
      const rate = 44100
      const offline = new OfflineAudioContext(2, seconds * rate, rate)
      const buffer = await offline.decodeAudioData(data)
      const source = offline.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.loopStart = track.loopStart
      source.loopEnd = track.loopEnd
      source.connect(offline.destination)
      source.start(0, track.loopStart)
      const rendered = await offline.startRendering()
      const l = rendered.getChannelData(0)
      const r = rendered.getChannelData(1)
      const n = l.length
      const mono = new Float32Array(n)
      for (let i = 0; i < n; i++) mono[i] = (l[i] + r[i]) / 2
      const jumps = new Float32Array(n - 1)
      for (let i = 1; i < n; i++) jumps[i - 1] = Math.abs(mono[i] - mono[i - 1])
      const sorted = Float32Array.from(jumps).sort()
      const typical = sorted[Math.floor(sorted.length * 0.999)]
      const loopSamples = Math.round((track.loopEnd - track.loopStart) * rate)
      const seams = [loopSamples, loopSamples * 2]
      const seamJump = Math.max(...seams.map((s) => Math.max(jumps[s - 2], jumps[s - 1], jumps[s])))
      const win = Math.round(0.02 * rate)
      const rms = []
      for (let i = 0; i + win <= n; i += win) {
        let sum = 0
        for (let k = i; k < i + win; k++) sum += mono[k] * mono[k]
        rms.push(Math.sqrt(sum / win))
      }
      const db = (v) => 20 * Math.log10(v + 1e-9)
      const seamRms = Math.min(...seams.map((s) => rms[Math.floor(s / win)]))
      let peak = 0
      for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]))
      out.push({
        eraId: track.eraId,
        decodedSeconds: buffer.duration,
        loopSeconds: track.loopEnd - track.loopStart,
        renderedSeconds: n / rate,
        seamJump,
        typical,
        seamRmsDb: db(seamRms),
        minRmsDb: db(Math.min(...rms)),
        peakDb: db(peak),
      })
    }
    return out
  }, 45)
  for (const r of reports) {
    const ok = r.loopSeconds === 15 && r.renderedSeconds === 45 && r.seamJump <= r.typical && r.seamRmsDb > r.minRmsDb - 1 && r.seamRmsDb > -50 && r.peakDb < -1
    record(
      'L 45 秒循環',
      r.eraId,
      ok,
      `解碼 ${r.decodedSeconds.toFixed(3)} 秒、循環 ${r.loopSeconds} 秒；接點跳動 ${r.seamJump.toFixed(4)}（一般 99.9% ${r.typical.toFixed(4)}）；接點 20ms 音量 ${r.seamRmsDb.toFixed(1)} dB（全曲最低 ${r.minRmsDb.toFixed(1)} dB）；峰值 ${r.peakDb.toFixed(2)} dBFS`,
    )
  }
  await page.close()
}

/* ───────────── P：遊戲中 ───────────── */
async function startGame(page) {
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  await page.locator('.intro__start').click()
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
}

async function switchEra(page, era) {
  const before = Number(await page.evaluate(() => document.documentElement.dataset.eraRequest))
  await page.locator('.era-node__button').nth(era.index).click()
  const accepted = await waitFor(page, (n) => Number(document.documentElement.dataset.eraRequest) === n, before + 1, 15000)
  const done = await waitFor(
    page,
    (id) => {
      const d = document.documentElement.dataset
      return d.eraTransition === 'idle' && d.era === id
    },
    era.id,
    TRANSITION_TIMEOUT,
  )
  return accepted && done
}

async function listen(page, seconds) {
  // 每 50 毫秒取樣一次總音量輸出，記錄相對於曲首的時間
  return page.evaluate(async (seconds) => {
    const m = window.__DDC__.audioManager
    const analyser = m.tap()
    const data = new Float32Array(analyser.fftSize)
    const samples = []
    const info0 = m.inspect()
    // 分析節點剛接上時緩衝區還是 0，先等 300 毫秒再開始取樣
    await new Promise((resolve) => setTimeout(resolve, 300))
    const end = performance.now() + seconds * 1000
    while (performance.now() < end) {
      analyser.getFloatTimeDomainData(data)
      let sum = 0
      for (const v of data) sum += v * v
      const info = m.inspect()
      samples.push({ t: info.currentTime - info.startedAt, rms: Math.sqrt(sum / data.length), sources: info.liveSources })
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    analyser.disconnect()
    return { era: info0.currentEra, samples }
  }, seconds)
}

function judgeListen({ samples }) {
  const db = (v) => 20 * Math.log10(v + 1e-9)
  const playedSeconds = samples.length ? samples[samples.length - 1].t - samples[0].t : 0
  let longestSilence = 0
  let run = 0
  for (const s of samples) {
    run = db(s.rms) < -60 ? run + 1 : 0
    longestSilence = Math.max(longestSilence, run)
  }
  const nearSeam = samples.filter((s) => s.t > 1 && Math.abs(((s.t + 7.5) % 15) - 7.5) < 0.12)
  const seamMin = nearSeam.length ? Math.min(...nearSeam.map((s) => db(s.rms))) : null
  const all = samples.filter((s) => s.t > 1.2).map((s) => db(s.rms))
  const maxSources = Math.max(...samples.map((s) => s.sources))
  return { playedSeconds, longestSilenceMs: longestSilence * 50, seamMin, overallMin: Math.min(...all), seamSamples: nearSeam.length, maxSources }
}

async function testGame(browser) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 700 } })
  const page = await context.newPage()
  page.setDefaultTimeout(120000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  // 刻意攔截的音檔請求會在主控台留下網路錯誤，不算頁面錯誤
  page.on('console', (message) => message.type() === 'error' && !/era-modern\.mp3|ERR_FAILED|Failed to load resource/.test(message.text()) && errors.push(message.text()))
  await page.goto(`${BASE_URL}?quality=smooth`, { waitUntil: 'load' })
  const beforeStart = await audio(page)
  record('P 遊戲', '開始前不建立 AudioContext', beforeStart.contextState === null, `狀態 ${beforeStart.status}`)
  await startGame(page)
  const playing = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 30000)
  let info = await audio(page)
  record('P 遊戲', '開始探索後播放目前年代', playing && info.contextState === 'running' && info.currentEra === 'qing-port', `${info.currentEra}、AudioContext ${info.contextState}、音量 ${info.masterTarget}`)
  record('P 遊戲', '循環參數', info.loop?.loop === true && info.loop.loopStart === 1 && info.loop.loopEnd === 16, JSON.stringify(info.loop))

  // 畫質、選單、移動不影響音樂
  const count0 = info.startedCount
  await page.locator('.hud-quality__toggle').click()
  for (const mode of ['fine', 'smooth', 'fine', 'smooth']) {
    await page.locator(`[data-quality-option="${mode}"]`).click()
    await waitFor(page, (m) => document.documentElement.dataset.quality === m, mode, 120000)
  }
  await page.keyboard.press('Escape')
  await page.locator('.hud-menu__toggle').click()
  await page.locator('.hud-menu__toggle').click()
  await page.keyboard.down('KeyD')
  await page.waitForTimeout(3000)
  await page.keyboard.up('KeyD')
  info = await audio(page)
  record('P 遊戲', '畫質切換 4 次、開關選單、移動角色：不重播、不新增音源', info.startedCount === count0 && info.liveSources === 1, `累計音源 ${info.startedCount}、目前 ${info.liveSources}`)

  // 店家故事降音量
  await page.locator('.hud-menu__toggle').click()
  await page.locator('.menu-shop', { hasText: '林復振' }).locator('.button-solid').click()
  const reading = await waitFor(page, () => window.__DDC__.useGameStore.getState().mode === 'reading', null, 60000)
  const duckInfo = await audio(page)
  await page.locator('.story__close').click()
  await waitFor(page, () => window.__DDC__.useGameStore.getState().mode === 'explore', null, 30000)
  const restored = await audio(page)
  record('P 遊戲', '開啟故事降到 40%，關閉後恢復', reading && Math.abs(duckInfo.masterTarget - duckInfo.volume * 0.4) < 1e-6 && restored.masterTarget === restored.volume, `故事中 ${duckInfo.masterTarget.toFixed(3)}、關閉後 ${restored.masterTarget}`)

  // 連續切換年代 10 次
  const order = [1, 2, 3, 4, 0, 2, 1, 4, 3, 0].map((i) => ERAS[i])
  let switches = 0
  for (const era of order) {
    const ok = await switchEra(page, era)
    const matched = await waitFor(page, (id) => window.__DDC__.audioManager.inspect().currentEra === id, era.id, 20000)
    await page.waitForTimeout(1500)
    info = await audio(page)
    const good = ok && matched && info.liveSources === 1 && info.status === 'playing'
    if (good) switches++
    record('P 年代切換', `→ ${era.year}`, good, `畫面 ${await page.evaluate(() => document.documentElement.dataset.era)}、音樂 ${info.currentEra}、音源 ${info.liveSources}、${info.status}`)
  }
  record('P 年代切換', '連續切換 10 次', switches === 10, `${switches}/10`)

  // 載入失敗：攔截 1930 的音檔，重新整理（清空快取）後切換到 1930
  await page.route('**/audio/era-modern.mp3', (route) => route.abort())
  await page.reload({ waitUntil: 'load' })
  await startGame(page)
  await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 30000)
  const switched = await switchEra(page, ERAS[2])
  const failed = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'error', null, 20000)
  const notice = await page.locator('[data-music-notice="error"]').isVisible().catch(() => false)
  record('P 錯誤處理', '音檔載入失敗：顯示提示、年代照常切換', switched && failed && notice, `年代 ${await page.evaluate(() => document.documentElement.dataset.era)}、提示 ${notice ? '有' : '沒有'}`)
  await page.unroute('**/audio/era-modern.mp3')
  await page.locator('[data-music-notice="error"] button').click()
  const recovered = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing' && window.__DDC__.audioManager.inspect().currentEra === 'modern', null, 20000)
  record('P 錯誤處理', '按「重試」後播放', recovered)

  // 頁面進入背景
  const count1 = (await audio(page)).startedCount
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  const paused = await waitFor(page, () => window.__DDC__.audioManager.inspect().contextState === 'suspended', null, 10000)
  const pausedInfo = await audio(page)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  const resumed = await waitFor(page, () => window.__DDC__.audioManager.inspect().contextState === 'running' && window.__DDC__.audioManager.inspect().status === 'playing', null, 10000)
  info = await audio(page)
  record('P 背景', '進入背景暫停、返回後恢復且不重播', paused && pausedInfo.status === 'paused' && resumed && info.startedCount === count1, `背景 ${pausedInfo.contextState}/${pausedInfo.status}、返回 ${info.contextState}/${info.status}`)

  // 音量與靜音記憶
  await page.locator('.hud-quality__toggle').click()
  await page.locator('[data-music-volume]').fill('60')
  await page.locator('[data-music-toggle]').click()
  await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'off', null, 5000)
  await page.waitForTimeout(600)
  const off = await audio(page)
  await page.reload({ waitUntil: 'load' })
  await startGame(page)
  await page.waitForTimeout(1500)
  const afterReload = await audio(page)
  record('P 設定記憶', '關閉音樂後停止音源；重新整理後維持靜音、不建立音訊', off.liveSources === 0 && afterReload.status === 'off' && afterReload.contextState === null, `關閉後音源 ${off.liveSources}；重新整理後 ${afterReload.status}、AudioContext ${afterReload.contextState}`)
  record('P 設定記憶', '音量 60% 重新整理後沿用', Math.abs(afterReload.volume - 0.6) < 1e-9, `${afterReload.volume}`)
  await page.locator('.hud-quality__toggle').click()
  await page.locator('[data-music-toggle]').click()
  const back = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 20000)
  record('P 設定記憶', '再打開開關後播放目前年代', back, (await audio(page)).currentEra)
  // 還原預設，避免影響下次執行
  await page.evaluate(() => {
    localStorage.removeItem('ddc.music.enabled')
    localStorage.removeItem('ddc.music.volume')
  })
  record('P 遊戲', '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

/* ───────────── R：五個年代各即時播放 45 秒 ───────────── */
async function testListen(browser) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 700 } })
  const page = await context.newPage()
  page.setDefaultTimeout(120000)
  await page.goto(`${BASE_URL}?quality=smooth`, { waitUntil: 'load' })
  await startGame(page)
  await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 30000)
  // 五個年代各即時播放 45 秒
  for (const era of ERAS) {
    const current = await page.evaluate(() => document.documentElement.dataset.era)
    if (current !== era.id) await switchEra(page, era)
    await waitFor(page, (id) => window.__DDC__.audioManager.inspect().currentEra === id && window.__DDC__.audioManager.inspect().liveSources === 1, era.id, 20000)
    const r = judgeListen(await listen(page, LISTEN_SECONDS))
    const ok = r.playedSeconds > LISTEN_SECONDS - 2 && r.longestSilenceMs <= 100 && r.seamSamples >= 2 && r.seamMin > r.overallMin - 3 && r.maxSources === 1
    record('R 即時播放', `${era.year} ${LISTEN_SECONDS} 秒`, ok, `播放 ${r.playedSeconds.toFixed(1)} 秒；最長靜音 ${r.longestSilenceMs} ms；接點附近最低 ${r.seamMin?.toFixed(1)} dB（全程最低 ${r.overallMin.toFixed(1)} dB，取樣 ${r.seamSamples} 次）；同時音源最多 ${r.maxSources}`)
  }

  await context.close()
}

/* ───────────── T：iPad 觸控操作背景音樂設定 ───────────── */
async function testTouch(browser) {
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false })
  const page = await context.newPage()
  page.setDefaultTimeout(120000)
  await page.goto(`${BASE_URL}?quality=smooth`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  await page.locator('.intro__start').tap()
  const playing = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 30000)
  record('T 觸控', '點「開始探索」後播放', playing, (await audio(page)).status)
  await page.locator('.hud-quality__toggle').tap()
  await page.locator('[data-music-toggle]').tap()
  const off = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'off', null, 5000)
  await page.locator('[data-music-toggle]').tap()
  const on = await waitFor(page, () => window.__DDC__.audioManager.inspect().status === 'playing', null, 20000)
  record('T 觸控', '點一下切換「背景音樂：開／關」', off && on)
  // 以觸控事件拖曳音量滑桿（從左側拖到約 80% 的位置）
  const box = await page.locator('[data-music-volume]').boundingBox()
  const cdp = await context.newCDPSession(page)
  const y = box.y + box.height / 2
  const from = box.x + box.width * 0.25
  const to = box.x + box.width * 0.8
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y, id: 1 }] })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + ((to - from) * i) / 8, y, id: 1 }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(500)
  const info = await audio(page)
  const stored = await page.evaluate(() => localStorage.getItem('ddc.music.volume'))
  record('T 觸控', '以觸控拖曳音量滑桿', info.volume > 0.6 && Number(stored) === info.volume, `音量 ${Math.round(info.volume * 100)}%（儲存值 ${stored}）`)
  await page.evaluate(() => localStorage.removeItem('ddc.music.volume'))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
try {
  const run = (name) => !ONLY || ONLY.includes(name)
  if (run('L')) await testLoops(browser)
  if (run('P')) await testGame(browser)
  if (run('R')) await testListen(browser)
  if (run('T')) await testTouch(browser)
} finally {
  await browser.close()
}
const failed = results.filter((r) => !r.ok)
console.log(`\n共 ${results.length} 項檢查：通過 ${results.length - failed.length} 項、失敗 ${failed.length} 項`)
process.exit(failed.length ? 1 : 0)
