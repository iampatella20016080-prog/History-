/**
 * 天氣（雨天，第 14 階段）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 流暢畫質（iPad、觸控裝置的預設）：
 * - 網址帶 ?weather=rain 也是晴天：data-weather="clear"、沒有雨的網格、沒有濕地面那一趟（data-wet-pass="0"）、
 *   沒有編譯任何雨的著色器（RainStreaks／RainDrips／CoverHeight／WetGround）、雨勢是 0、環境音沒有雨聲
 * - 設定選單沒有「天氣」
 * - 同一個固定視角，帶 ?weather=rain 和不帶時的繪製呼叫完全相同
 * 精緻畫質：
 * - 設定選單有「天氣」；?weather=rain 時雨的網格、濕地面、四個著色器都有，環境音有雨聲
 * - 繪製呼叫：同一個視角晴天與雨天各量一次，印出多了多少（寫進 PR 說明），且不超過 README 的每個年代 390 次＋積水倒影
 * - 切換年代：雨照下，遮雨高度圖依新年代重畫
 * - 從選單切回晴天：雨絲很快停，地面還濕（漸乾）
 * - 執行中切到流暢畫質：雨的網格與濕地面那一趟立刻拿掉，雨勢歸零
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/weather.e2e.mjs http://127.0.0.1:5173/
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const TIMEOUT = 240000
const RAIN_PROGRAMS = ['RainStreaks', 'RainDrips', 'CoverHeight', 'WetGround']
// 街道遠景（lookbook 的 street）與店門口（亭仔腳的屋簷滴水）
const VIEWS = {
  street: { position: [-30, 2.2, 0.4], target: [20, 3.0, 0.0] },
  arcade: { position: [0, 1.5, 0.3], target: [9, 2.2, -3.4] },
}

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

const results = []
function record(step, ok, detail = '') {
  results.push({ step, ok })
  console.log(`${ok ? '✔' : '✘'} ${step}${detail ? ` — ${detail}` : ''}`)
}

async function open(browser, query) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${BASE_URL}?${query}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: TIMEOUT })
  await page.locator('.intro__start').click({ timeout: 60000 }).catch(() => page.locator('.intro__start').click({ force: true }))
  await page.waitForFunction(() => window.__DDC__?.playerState && document.querySelector('.hud.is-started'), null, { timeout: TIMEOUT })
  return { context, page, errors }
}

const frames = (page, n) =>
  page.evaluate(
    (n) =>
      new Promise((resolve) => {
        const goal = (window.__DDC__.frameCount ?? 0) + n
        const tick = () => ((window.__DDC__.frameCount ?? 0) >= goal ? resolve() : requestAnimationFrame(tick))
        tick()
      }),
    n,
  )

/** 固定鏡頭後，量幾個影格的平均繪製呼叫（所有 pass 的 gl.render 與全螢幕處理） */
async function measure(page, view) {
  await page.evaluate((view) => {
    const d = window.__DDC__
    d.playerState.position.set(view.position[0] - 2.5, 0, view.position[2])
    d.cameraOverride = view
  }, view)
  await frames(page, 30)
  return page.evaluate(async () => {
    const d = window.__DDC__
    const info = d.gl.info
    info.autoReset = false
    info.reset()
    const start = d.frameCount ?? 0
    await new Promise((resolve) => {
      const tick = () => ((d.frameCount ?? 0) >= start + 4 ? resolve() : requestAnimationFrame(tick))
      tick()
    })
    const calls = Math.round(info.render.calls / Math.max(1, (d.frameCount ?? 0) - start))
    info.autoReset = true
    return calls
  })
}

const snapshot = (page) =>
  page.evaluate(() => {
    const d = window.__DDC__
    const data = document.documentElement.dataset
    return {
      weather: data.weather,
      wetPass: data.wetPass,
      rainActive: data.rainActive,
      programs: (d.gl.info.programs ?? []).map((p) => p.name),
      meshes: ['rain-streaks', 'rain-drips'].filter((name) => d.scene.getObjectByName(name)),
      state: { ...d.weatherState },
      coverEra: d.rain?.state?.world?.eraId ?? null,
      coverReady: Boolean(d.rain?.runtime?.coverReady),
      tracks: d.ambienceManager.inspect().liveTracks,
    }
  })

async function weatherSectionCount(page) {
  await page.locator('.hud-quality__toggle').click()
  await page.waitForSelector('#quality-panel')
  const count = await page.locator('[data-weather-section]').count()
  await page.locator('.hud-quality__toggle').click()
  return count
}

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
  })
  const calls = {}

  // ---------- 流暢畫質：帶 ?weather=rain 也完全沒有雨 ----------
  for (const era of ['banquet', 'postwar']) {
    const plain = await open(browser, `era=${era}&quality=low`)
    calls[`${era}/smooth/clear`] = await measure(plain.page, VIEWS.street)
    await plain.context.close()
    const { context, page, errors } = await open(browser, `era=${era}&quality=low&weather=rain`)
    calls[`${era}/smooth/rain`] = await measure(page, VIEWS.street)
    const s = await snapshot(page)
    const compiled = RAIN_PROGRAMS.filter((name) => s.programs.includes(name))
    record(`流暢畫質（${era}）：網址帶 ?weather=rain 也是晴天`, s.weather === 'clear' && s.rainActive === '0', `data-weather=${s.weather} rainActive=${s.rainActive}`)
    record(`流暢畫質（${era}）：沒有濕地面那一趟、沒有雨的網格`, s.wetPass === '0' && s.meshes.length === 0, `wetPass=${s.wetPass} meshes=${s.meshes.join('、') || '無'}`)
    record(`流暢畫質（${era}）：沒有編譯雨的著色器`, compiled.length === 0, compiled.join('、') || '無')
    record(`流暢畫質（${era}）：雨勢為 0、沒有雨聲`, Object.values(s.state).every((v) => v === 0) && !s.tracks.includes('rain'), JSON.stringify(s.state))
    record(
      `流暢畫質（${era}）：繪製呼叫和沒有天氣參數時相同`,
      calls[`${era}/smooth/rain`] === calls[`${era}/smooth/clear`],
      `${calls[`${era}/smooth/clear`]} → ${calls[`${era}/smooth/rain`]}`,
    )
    if (era === 'banquet') record('流暢畫質：設定選單沒有「天氣」', (await weatherSectionCount(page)) === 0)
    record(`流暢畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  // ---------- 精緻畫質 ----------
  for (const era of ['qing-port', 'banquet', 'postwar', 'revival']) {
    const clear = await open(browser, `era=${era}&quality=high&weather=clear`)
    calls[`${era}/fine/clear`] = await measure(clear.page, VIEWS.street)
    const c = await snapshot(clear.page)
    record(`精緻畫質（${era}）晴天：雨的著色器沒有編譯`, RAIN_PROGRAMS.every((name) => !c.programs.includes(name)) && c.meshes.length === 0)
    await clear.context.close()

    const { context, page, errors } = await open(browser, `era=${era}&quality=high&weather=rain`)
    await page.waitForFunction(() => window.__DDC__.rain?.runtime?.coverReady, null, { timeout: 60000 }).catch(() => {})
    calls[`${era}/fine/rain`] = await measure(page, VIEWS.street)
    calls[`${era}/fine/rain-arcade`] = await measure(page, VIEWS.arcade)
    const s = await snapshot(page)
    const compiled = RAIN_PROGRAMS.filter((name) => s.programs.includes(name))
    record(`精緻畫質（${era}）：下雨（data-weather=rain）`, s.weather === 'rain' && s.rainActive === '1' && s.wetPass === '1')
    record(`精緻畫質（${era}）：雨絲與屋簷滴水`, s.meshes.length === 2, s.meshes.join('、'))
    record(`精緻畫質（${era}）：四個雨的著色器都編譯了`, compiled.length === RAIN_PROGRAMS.length, compiled.join('、'))
    record(`精緻畫質（${era}）：遮雨高度圖是這個年代的`, s.coverReady && s.coverEra === era, `${s.coverEra}`)
    record(
      `精緻畫質（${era}）：雨天多的繪製呼叫`,
      calls[`${era}/fine/rain`] > calls[`${era}/fine/clear`],
      `${calls[`${era}/fine/clear`]} → ${calls[`${era}/fine/rain`]}（+${calls[`${era}/fine/rain`] - calls[`${era}/fine/clear`]}）`,
    )
    if (era === 'banquet') {
      record('精緻畫質：設定選單有「天氣」', (await weatherSectionCount(page)) === 1)
      await page.waitForFunction(() => window.__DDC__.ambienceManager.inspect().liveTracks.includes('rain'), null, { timeout: 20000 }).catch(() => {})
      const tracks = await page.evaluate(() => window.__DDC__.ambienceManager.inspect().liveTracks)
      record('精緻畫質：環境音有雨聲', tracks.includes('rain'), tracks.join('、'))

      // 切換年代：雨照下，遮雨高度圖換成新年代的
      await page.evaluate(() => window.__DDC__.useGameStore.getState().requestEra('modern'))
      await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'modern' && !window.__DDC__.useGameStore.getState().transitioning, null, { timeout: TIMEOUT })
      await page.waitForFunction(() => window.__DDC__.rain?.state?.world?.eraId === 'modern' && window.__DDC__.rain.runtime.coverReady, null, { timeout: 60000 }).catch(() => {})
      const m = await snapshot(page)
      record('切換年代：雨照下、遮雨高度圖依新年代重畫', m.weather === 'rain' && m.coverEra === 'modern' && m.coverReady && m.meshes.length === 2, `${m.coverEra}`)

      // 從選單切回晴天：雨絲很快停，地面還濕
      await page.locator('.hud-quality__toggle').click()
      await page.locator('[data-weather-option="clear"]').click()
      await page.locator('.hud-quality__toggle').click()
      await page.waitForTimeout(4500)
      const dry = await snapshot(page)
      record('切回晴天：雨停了，地面還沒乾（漸乾）', dry.weather === 'clear' && dry.state.rain < 0.05 && dry.state.wet > 0.5 && dry.rainActive === '1', JSON.stringify(dry.state))
      const stored = await page.evaluate(() => localStorage.getItem('ddc.weather'))
      record('天氣的選擇記在 localStorage', stored === 'clear', stored)
      await page.locator('.hud-quality__toggle').click()
      await page.locator('[data-weather-option="rain"]').click()
      await page.locator('.hud-quality__toggle').click()

      // 執行中切到流暢畫質：全部拿掉
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setQualityMode('smooth'))
      await frames(page, 10)
      const off = await snapshot(page)
      record(
        '執行中切到流暢畫質：雨的網格與濕地面那一趟立刻拿掉、雨勢歸零',
        off.weather === 'clear' && off.wetPass === '0' && off.meshes.length === 0 && Object.values(off.state).every((v) => v === 0),
        `wetPass=${off.wetPass} meshes=${off.meshes.join('、') || '無'}`,
      )
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setQualityMode('fine'))
      await page.waitForFunction(() => document.documentElement.dataset.rainActive === '1', null, { timeout: 30000 }).catch(() => {})
      record('切回精緻畫質：記住的雨天再下起來', (await snapshot(page)).weather === 'rain')
    }
    record(`精緻畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  await browser.close()
  console.log('\n繪製呼叫（每個影格，街道遠景；rain-arcade 是店門口）：')
  console.log(JSON.stringify(calls, null, 2))
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} 通過`)
  if (failed.length) process.exit(1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
