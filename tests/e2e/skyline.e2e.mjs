/**
 * 隔岸天際線（第 14 階段）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 流暢畫質（iPad、觸控裝置的預設）：沒有對岸的網格、沒有編譯 OppositeBank 著色器、觀音山的剪影倍率 1（原本的遠景）
 * 精緻畫質：
 * - 每個年代都有對岸（網格的 eraId 對得上）、觀音山往後推 1.8 倍、著色器編譯了、也畫進河面倒映的圖層
 * - 繪製呼叫：同一個河岸視角，藏起對岸（並把觀音山放回原位）前後各量一次，印出多了多少
 * - 切換年代：對岸換成新年代的
 * - 燈火：白天的年代不亮；夜晚亮
 * - 執行中切到流暢畫質：對岸拿掉、觀音山放回原位
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/skyline.e2e.mjs http://127.0.0.1:5173/
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const TIMEOUT = 240000
const RIVER_VIEW = { position: [-41, 3.0, 3.5], target: [-72, -0.8, -1] }
const REFLECT_LAYER = 2

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

async function measure(page) {
  await page.evaluate((view) => {
    const d = window.__DDC__
    d.playerState.position.set(view.position[0] + 2.5, 0, view.position[2])
    d.cameraOverride = view
  }, RIVER_VIEW)
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
  page.evaluate((reflectLayer) => {
    const d = window.__DDC__
    const bank = d.scene.getObjectByName('opposite-bank')
    return {
      bank: Boolean(bank),
      eraId: bank?.userData.eraId ?? null,
      reflect: Boolean(bank && bank.layers.isEnabled(reflectLayer)),
      light: bank?.material.uniforms.uLightAmount.value ?? null,
      guanyin: d.scene.getObjectByName('guanyin')?.scale.x ?? null,
      programs: (d.gl.info.programs ?? []).map((p) => p.name).filter((n) => n === 'OppositeBank'),
    }
  }, REFLECT_LAYER)

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const calls = {}

  for (const era of ['qing-port', 'revival']) {
    const { context, page, errors } = await open(browser, `era=${era}&quality=low&time=night`)
    calls[`${era}/smooth`] = await measure(page)
    const s = await snapshot(page)
    record(`流暢畫質（${era}）：沒有對岸、沒有編譯著色器、觀音山在原位`, !s.bank && s.programs.length === 0 && s.guanyin === 1, JSON.stringify(s))
    record(`流暢畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  for (const era of ['qing-port', 'banquet', 'modern', 'postwar', 'revival']) {
    const { context, page, errors } = await open(browser, `era=${era}&quality=high&time=day&weather=clear`)
    calls[`${era}/fine`] = await measure(page)
    const s = await snapshot(page)
    record(`精緻畫質（${era}）：有這個年代的對岸、觀音山往後推、畫進河面倒映`, s.bank && s.eraId === era && s.guanyin === 1.8 && s.reflect && s.programs.length === 1, JSON.stringify(s))
    // 藏起對岸、觀音山放回原位：等於加入天際線之前的精緻畫質
    await page.evaluate(() => {
      const d = window.__DDC__
      d.scene.getObjectByName('opposite-bank').visible = false
      d.scene.getObjectByName('guanyin').scale.setScalar(1)
    })
    calls[`${era}/fine-hidden`] = await measure(page)
    record(`精緻畫質（${era}）：對岸多的繪製呼叫`, calls[`${era}/fine`] - calls[`${era}/fine-hidden`] <= 2, `${calls[`${era}/fine-hidden`]} → ${calls[`${era}/fine`]}（+${calls[`${era}/fine`] - calls[`${era}/fine-hidden`]}）`)
    await page.evaluate(() => {
      const d = window.__DDC__
      d.scene.getObjectByName('opposite-bank').visible = true
      d.scene.getObjectByName('guanyin').scale.setScalar(1.8)
    })
    if (era === 'qing-port' || era === 'postwar') record(`精緻畫質（${era}）：白天的年代燈火不亮`, s.light === 0, `${s.light}`)
    if (era === 'postwar') {
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setTimeOfDay('night'))
      await page.waitForFunction(() => window.__DDC__.nightState.night >= 1, null, { timeout: 30000 }).catch(() => {})
      await frames(page, 5)
      const n = await snapshot(page)
      record('夜晚：對岸的燈火亮起', n.light > 0.9, `${n.light}`)
      await page.evaluate(() => window.__DDC__.useGameStore.getState().requestEra('revival'))
      await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival' && !window.__DDC__.useGameStore.getState().transitioning, null, { timeout: TIMEOUT })
      await frames(page, 10)
      const r = await snapshot(page)
      record('切換年代：對岸換成新年代的', r.bank && r.eraId === 'revival', `${r.eraId}`)
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setQualityMode('smooth'))
      await frames(page, 10)
      const off = await snapshot(page)
      record('執行中切到流暢畫質：對岸拿掉、觀音山放回原位', !off.bank && off.guanyin === 1, JSON.stringify(off))
    }
    record(`精緻畫質（${era}）：沒有頁面錯誤`, errors.length === 0, errors.join('；'))
    await context.close()
  }

  await browser.close()
  console.log('\n繪製呼叫（每個影格，河岸視角；fine-hidden 是藏起對岸、觀音山放回原位）：')
  console.log(JSON.stringify(calls, null, 2))
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} 通過`)
  if (failed.length) process.exit(1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
