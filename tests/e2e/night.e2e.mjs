/**
 * 夜晚（第 14 階段）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 流暢畫質（iPad、觸控裝置的預設）：
 * - 網址帶 ?time=night 也是年代原本的時刻：data-time-of-day="day"、沒有月亮、夜晚程度 0、年代光線不變（glow 和不帶參數時相同）
 * - 設定選單沒有「時段」
 * - 同一個固定視角，帶 ?time=night 和不帶時的繪製呼叫完全相同
 * 精緻畫質：
 * - 設定選單有「時段」；?time=night 時有月亮、夜晚程度 1、glow 是這個年代的夜間值、星星滿天
 * - 繪製呼叫：同一個視角白天與夜晚各量一次，印出多了多少（寫進 PR 說明）
 * - 切換年代：仍是夜晚，glow 換成新年代的夜間值（清末最暗）
 * - 夜晚和雨天同時開：兩者都在
 * - 從選單切回白天：慢慢天亮，月亮最後拿掉
 * - 執行中切到流暢畫質：月亮拿掉、光線回到年代原本的樣子
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/night.e2e.mjs http://127.0.0.1:5173/
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const TIMEOUT = 240000
const STREET = { position: [-30, 2.2, 0.4], target: [20, 3.0, 0.0] }
const RIVER = { position: [-41, 3.0, 3.5], target: [-72, -0.8, -1] }
const NIGHT_GLOW = { 'qing-port': 0.85, banquet: 1.0, modern: 1.0, postwar: 1.0, revival: 1.0 }

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
    const moon = d.scene.getObjectByName('moon')
    return {
      timeOfDay: data.timeOfDay,
      nightActive: data.nightActive,
      weather: data.weather,
      night: d.nightState.night,
      moon: Boolean(moon),
      moonVisible: Boolean(moon?.visible),
      sceneEra: data.sceneEra,
    }
  })

/** 燈火的強度：Lighting 每個影格依 atmosphere 的 glow 設給亮窗材質的發光強度 */
const glowOf = (page) =>
  page.evaluate(() => {
    let value = null
    window.__DDC__.scene.traverse((o) => {
      if (value === null && o.userData?.material === 'windowLit') value = o.material.emissiveIntensity
    })
    return value
  })

async function sectionCount(page) {
  await page.locator('.hud-quality__toggle').click()
  await page.waitForSelector('#quality-panel')
  const count = await page.locator('[data-time-section]').count()
  await page.locator('.hud-quality__toggle').click()
  return count
}

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const calls = {}

  // ---------- 流暢畫質 ----------
  for (const era of ['qing-port', 'modern']) {
    const plain = await open(browser, `era=${era}&quality=low`)
    calls[`${era}/smooth/day`] = await measure(plain.page, STREET)
    const glowDay = await glowOf(plain.page)
    await plain.context.close()
    const { context, page, errors } = await open(browser, `era=${era}&quality=low&time=night&weather=rain`)
    calls[`${era}/smooth/night`] = await measure(page, STREET)
    const s = await snapshot(page)
    record(`流暢畫質（${era}）：網址帶 ?time=night 也是白天、沒有月亮`, s.timeOfDay === 'day' && s.nightActive === '0' && s.night === 0 && !s.moon, JSON.stringify(s))
    const glowNight = await glowOf(page)
    record(`流暢畫質（${era}）：年代光線不變（亮窗的發光強度相同）`, glowNight === glowDay, `${glowDay} → ${glowNight}`)
    record(`流暢畫質（${era}）：繪製呼叫和不帶參數時相同`, calls[`${era}/smooth/night`] === calls[`${era}/smooth/day`], `${calls[`${era}/smooth/day`]} → ${calls[`${era}/smooth/night`]}`)
    if (era === 'modern') record('流暢畫質：設定選單沒有「時段」', (await sectionCount(page)) === 0)
    record(`流暢畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  // ---------- 精緻畫質 ----------
  for (const era of ['qing-port', 'banquet', 'modern', 'postwar', 'revival']) {
    const day = await open(browser, `era=${era}&quality=high&time=day&weather=clear`)
    calls[`${era}/fine/day`] = await measure(day.page, STREET)
    calls[`${era}/fine/day-river`] = await measure(day.page, RIVER)
    record(`精緻畫質（${era}）白天：沒有月亮`, !(await snapshot(day.page)).moon)
    await day.context.close()

    const { context, page, errors } = await open(browser, `era=${era}&quality=high&time=night&weather=clear`)
    calls[`${era}/fine/night`] = await measure(page, STREET)
    calls[`${era}/fine/night-river`] = await measure(page, RIVER)
    const s = await snapshot(page)
    record(`精緻畫質（${era}）：夜晚、月亮在天上`, s.timeOfDay === 'night' && s.nightActive === '1' && s.night === 1 && s.moonVisible, JSON.stringify(s))
    const glow = await glowOf(page)
    // materials.js：亮窗的發光強度 = 0.1 + glow × 0.8
    record(`精緻畫質（${era}）：窗光是這個年代的夜間值`, Math.abs(glow - (0.1 + NIGHT_GLOW[era] * 0.8)) < 1e-3, `${glow}`)
    record(
      `精緻畫質（${era}）：夜晚多的繪製呼叫`,
      true,
      `街道 ${calls[`${era}/fine/day`]} → ${calls[`${era}/fine/night`]}（${calls[`${era}/fine/night`] - calls[`${era}/fine/day`] >= 0 ? '+' : ''}${calls[`${era}/fine/night`] - calls[`${era}/fine/day`]}）、河岸 ${calls[`${era}/fine/day-river`]} → ${calls[`${era}/fine/night-river`]}`,
    )
    if (era === 'banquet') {
      record('精緻畫質：設定選單有「時段」', (await sectionCount(page)) === 1)
      const banquetGlow = glow
      await page.evaluate(() => window.__DDC__.useGameStore.getState().requestEra('qing-port'))
      await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'qing-port' && !window.__DDC__.useGameStore.getState().transitioning, null, { timeout: TIMEOUT })
      await frames(page, 20)
      const q = await snapshot(page)
      const qingGlow = await glowOf(page)
      record('切換年代：仍是夜晚、月亮還在，清末的窗光比酒樓繁華暗（油燈）', q.timeOfDay === 'night' && q.moon && qingGlow < banquetGlow, `${banquetGlow} → ${qingGlow}`)

      await page.locator('.hud-quality__toggle').click()
      await page.locator('[data-weather-option="rain"]').click()
      await page.locator('.hud-quality__toggle').click()
      await page.waitForFunction(() => window.__DDC__.scene.getObjectByName('rain-streaks'), null, { timeout: 30000 }).catch(() => {})
      const both = await snapshot(page)
      const rain = await page.evaluate(() => Boolean(window.__DDC__.scene.getObjectByName('rain-streaks')))
      record('夜晚和雨天同時開', both.timeOfDay === 'night' && both.weather === 'rain' && rain && both.moon)

      await page.locator('.hud-quality__toggle').click()
      await page.locator('[data-time-option="day"]').click()
      await page.locator('.hud-quality__toggle').click()
      await page.waitForTimeout(1500)
      const dawn = await snapshot(page)
      record('切回白天：慢慢天亮（還沒全亮）', dawn.timeOfDay === 'day' && dawn.night > 0.2 && dawn.night < 0.95, `${dawn.night}`)
      await page.waitForFunction(() => document.documentElement.dataset.nightActive === '0', null, { timeout: 30000 }).catch(() => {})
      const morning = await snapshot(page)
      record('天亮後月亮拿掉', morning.night === 0 && !morning.moon)
      const stored = await page.evaluate(() => localStorage.getItem('ddc.timeOfDay'))
      record('時段的選擇記在 localStorage', stored === 'day', stored)

      await page.locator('.hud-quality__toggle').click()
      await page.locator('[data-time-option="night"]').click()
      await page.locator('.hud-quality__toggle').click()
      await page.waitForFunction(() => window.__DDC__.nightState.night >= 1, null, { timeout: 30000 }).catch(() => {})
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setQualityMode('smooth'))
      await frames(page, 10)
      const off = await snapshot(page)
      record('執行中切到流暢畫質：月亮拿掉、夜晚歸零', off.timeOfDay === 'day' && off.night === 0 && !off.moon, JSON.stringify(off))
    }
    record(`精緻畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  await browser.close()
  console.log('\n繪製呼叫（每個影格；street 街道遠景、river 河岸）：')
  console.log(JSON.stringify(calls, null, 2))
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} 通過`)
  if (failed.length) process.exit(1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
