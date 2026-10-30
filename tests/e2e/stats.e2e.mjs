/**
 * 效能量測（?stats=1）的端對端測試（真實瀏覽器，Playwright；打包版與開發版都能跑）
 *
 * - 沒有參數：頁面上沒有 .stats-overlay、沒有 window.__DDC_STATS__
 * - ?stats=1：浮層出現、有數字，繪製呼叫與三角形數 > 0，浮層不攔截觸控（pointer-events: none）
 * - 五個年代 × 兩種畫質各量一次，印出繪製呼叫、三角形數與解析度（headless 軟體渲染，數字供參考）
 *
 * 用法：
 *   npm run build && npx vite preview --port 4173
 *   node tests/e2e/stats.e2e.mjs http://127.0.0.1:4173/
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、ERAS、QUALITIES（smooth,fine）
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:4173/'
const ERA_IDS = (process.env.ERAS ?? 'qing-port,banquet,modern,postwar,revival').split(',')
const QUALITIES = (process.env.QUALITIES ?? 'smooth,fine').split(',')
const TIMEOUT = 240000

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

let failed = 0
function record(step, ok, detail = '') {
  if (!ok) failed++
  console.log(`${ok ? '✔' : '✘'} ${step}${detail ? ` — ${detail}` : ''}`)
}

async function open(browser, query) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 700 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE_URL}?${query}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: TIMEOUT })
  await page.locator('.intro__start').click()
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  return { page, errors }
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

{
  const { page, errors } = await open(browser, 'era=qing-port&quality=smooth')
  await page.waitForTimeout(1500)
  const present = await page.evaluate(() => Boolean(document.querySelector('.stats-overlay') || window.__DDC_STATS__))
  record('沒有參數時不顯示、不收集', !present && !errors.length, errors.join('; '))
  await page.close()
}

for (const quality of QUALITIES) {
  for (const eraId of ERA_IDS) {
    const { page, errors } = await open(browser, `era=${eraId}&quality=${quality}&stats=1`)
    await page.waitForFunction(() => window.__DDC_STATS__?.calls > 0, null, { timeout: 60000 })
    await page.waitForTimeout(2500)
    const r = await page.evaluate(() => {
      const el = document.querySelector('.stats-overlay')
      return { text: el?.textContent ?? '', pe: el ? getComputedStyle(el).pointerEvents : '', s: window.__DDC_STATS__ }
    })
    const ok = r.text.includes('繪製呼叫') && r.pe === 'none' && r.s.calls > 0 && r.s.triangles > 0 && !errors.length
    record(
      `${eraId}/${quality}`,
      ok,
      `calls ${r.s.calls}, triangles ${r.s.triangles}, ${r.s.width}×${r.s.height} @${r.s.dpr.toFixed(2)}, fps ${r.s.fps.avg.toFixed(0)}`,
    )
    await page.close()
  }
}
await browser.close()
process.exit(failed ? 1 : 0)
