/**
 * 空氣遠近感與光束的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * - 流暢畫質（iPad）：後製沒有空氣與光束（data-air="0"），編譯過的著色器裡沒有 AerialPerspective／GodRays
 * - 精緻畫質：酒樓繁華往西（夕陽方向）看，兩個著色器都編譯了（data-air="1"）
 * - 執行中從精緻切到流暢：pass 立刻拿掉
 * - 精緻畫質一個影格的繪製呼叫不超過 README 寫的每個年代 390 次
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/air.e2e.mjs http://127.0.0.1:5173/
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const TIMEOUT = 240000
const DRAW_CALL_LIMIT = 390
const AIR_PROGRAMS = ['AerialPerspective', 'GodRays']

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

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })

  for (const quality of ['low', 'high']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    await page.goto(`${BASE_URL}?era=banquet&quality=${quality}`, { waitUntil: 'load' })
    await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'banquet', null, { timeout: TIMEOUT })
    await page.locator('.intro__start').click()
    await page.waitForFunction(() => window.__DDC__?.playerState, null, { timeout: TIMEOUT })
    // 往西看向夕陽（騎樓旁），光束一定會開
    await page.evaluate(() => (window.__DDC__.cameraOverride = { position: [26, 1.6, -2.9], target: [4, 3.2, 0.5] }))
    await page.waitForTimeout(2500)
    const state = await page.evaluate(() => {
      const d = window.__DDC__
      const programs = (d.gl.info.programs ?? []).map((p) => p.name)
      return { air: document.documentElement.dataset.air, programs }
    })
    const compiled = AIR_PROGRAMS.filter((name) => state.programs.includes(name))
    if (quality === 'low') {
      record('流暢畫質：沒有空氣與光束的 pass', state.air === '0', `data-air=${state.air}`)
      record('流暢畫質：沒有編譯空氣與光束的著色器', compiled.length === 0, compiled.join('、') || '無')
    } else {
      record('精緻畫質：加上空氣與光束的 pass', state.air === '1', `data-air=${state.air}`)
      record('精緻畫質：兩個著色器都編譯了', compiled.length === 2, compiled.join('、'))
      const calls = await page.evaluate(async () => {
        const info = window.__DDC__.gl.info
        info.autoReset = false
        info.reset()
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        const value = info.render.calls / 2
        info.autoReset = true
        return Math.round(value)
      })
      record(`精緻畫質：繪製呼叫 ≤ ${DRAW_CALL_LIMIT}`, calls <= DRAW_CALL_LIMIT, `${calls}`)
      await page.evaluate(() => window.__DDC__.useGameStore.setState({ qualityMode: 'smooth' }))
      await page.waitForTimeout(800)
      const after = await page.evaluate(() => document.documentElement.dataset.air)
      record('執行中切到流暢畫質：pass 立刻拿掉', after === '0', `data-air=${after}`)
    }
    await context.close()
  }
  await browser.close()
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} 通過`)
  if (failed.length) process.exit(1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
