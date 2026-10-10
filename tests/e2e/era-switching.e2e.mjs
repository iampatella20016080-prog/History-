/**
 * 年代切換端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 以時間軸實際點擊（桌面）或觸控點擊（iPad 尺寸、觸控模擬）連續切換年代，
 * 每次切換都檢查：
 *   1. 請求被接受（data-era-request 加一）
 *   2. 播放轉場（中央出現該年代的章節標題；開發版另外確認霧氣有出現）
 *   3. 載入目標年代的街景（data-scene-era）
 *   4. 介面年代更新（時間軸目前節點、data-era）
 *   5. 轉場結束（data-era-transition = idle、時間軸按鈕全部可按）
 *   6. 可以再次切換（下一次請求同樣被接受）
 * 最後檢查（測試 F）：店家互動（店家名錄 → 前往店門口 → 探索店家 → 介紹視窗 → 關閉）；
 * 開發版（有 window.__DDC__）另外檢查角色移動與鏡頭操作。
 *
 * 用法：
 *   npm run build && npx vite preview --port 4173      # 或 npm run dev
 *   node tests/e2e/era-switching.e2e.mjs http://127.0.0.1:4173/
 *
 * 需要 Playwright：npm i -D playwright && npx playwright install chromium，
 * 或以環境變數 PLAYWRIGHT_MODULE 指定已安裝的 playwright 模組路徑。
 * 其他環境變數：BROWSER（chromium｜webkit｜firefox）、ONLY（A,B,C,D,F）、D_COUNT（測試 D 的切換次數，預設 12）、HEADED=1
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:4173/'
const BROWSER = process.env.BROWSER ?? 'chromium'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 180000)

const ERAS = {
  1853: { id: 'qing-port', index: 0, title: '港口商街' },
  1895: { id: 'banquet', index: 1, title: '酒樓繁華' },
  1930: { id: 'modern', index: 2, title: '摩登大稻埕' },
  1945: { id: 'postwar', index: 3, title: '庶民生活' },
  2000: { id: 'revival', index: 4, title: '老屋新生' },
}

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  try {
    const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
    const module = await import(resolved)
    return module.chromium ? module : module.default
  } catch (error) {
    console.error(`找不到 Playwright（${name}）。請先安裝：npm i -D playwright && npx playwright install chromium`)
    throw error
  }
}

const results = []
/** ok：true 通過、false 失敗、'skip' 略過（沒有測試，不算通過） */
function record(test, step, ok, detail = '') {
  results.push({ test, step, ok, detail })
  const mark = ok === 'skip' ? '－' : ok ? '✔' : '✘'
  console.log(`${mark} [${test}] ${step}${detail ? ` — ${detail}` : ''}`)
}

const rootData = (page) => page.evaluate(() => ({ ...document.documentElement.dataset }))

async function openGame(context, query, { touch }) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  const url = new URL(BASE_URL)
  url.searchParams.set('quality', 'low')
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  await page.goto(url.href, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  const start = page.locator('.intro__start')
  if (touch) await start.tap()
  else await start.click()
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  return { page, errors }
}

/** 點時間軸切換年代，並逐項檢查完成條件 */
async function switchEra(page, test, year, { touch }) {
  const era = ERAS[year]
  const before = await rootData(page)
  const requestBefore = Number(before.eraRequest)
  const button = page.locator('.era-node__button').nth(era.index)
  const started = Date.now()
  if (touch) await button.tap()
  else await button.click()

  // 1. 請求被接受
  try {
    await page.waitForFunction((n) => Number(document.documentElement.dataset.eraRequest) === n, requestBefore + 1, { timeout: 15000 })
    record(test, `${year}：請求被接受`, true, `request #${requestBefore + 1}`)
  } catch {
    record(test, `${year}：請求被接受`, false, `data-era-request 仍為 ${requestBefore}`)
    return false
  }

  // 2. 播放轉場：章節標題出現（開發版另外取樣霧氣）
  let mistSeen = null
  const cardTitle = await page
    .waitForFunction(() => document.querySelector('.chapter-card__title')?.textContent, null, { timeout: 15000 })
    .then((handle) => handle.jsonValue())
    .catch(() => null)
  const hasDebug = await page.evaluate(() => Boolean(window.__DDC__))
  if (hasDebug) {
    mistSeen = await page
      .waitForFunction(() => window.__DDC__.transitionState.mist > 0.3, null, { timeout: TRANSITION_TIMEOUT })
      .then(() => true)
      .catch(() => false)
  }
  record(test, `${year}：播放轉場`, cardTitle === era.title && mistSeen !== false, `章節標題「${cardTitle}」${mistSeen === null ? '' : `、霧氣${mistSeen ? '有' : '沒有'}出現`}`)

  // 3–5. 街景、介面與轉場狀態
  try {
    await page.waitForFunction(
      (id) => {
        const data = document.documentElement.dataset
        return data.eraTransition === 'idle' && data.sceneEra === id && data.era === id
      },
      era.id,
      { timeout: TRANSITION_TIMEOUT },
    )
  } catch {
    const data = await rootData(page)
    record(test, `${year}：轉場完成`, false, `era=${data.era} scene=${data.sceneEra} transition=${data.eraTransition}`)
    return false
  }
  const ui = await page.evaluate(() => ({
    active: document.querySelector('.era-node.is-active .era-node__title')?.textContent,
    enabled: document.querySelectorAll('.era-node__button:not([disabled])').length,
    transitioningClass: document.querySelector('.era-timeline')?.classList.contains('is-transitioning'),
  }))
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  record(test, `${year}：載入目標街景`, true, `data-scene-era=${era.id}`)
  record(test, `${year}：介面年代更新`, ui.active === era.title, `時間軸目前節點「${ui.active}」`)
  record(test, `${year}：轉場正常結束`, ui.enabled === 5 && !ui.transitioningClass, `時間軸按鈕可按 ${ui.enabled}/5，耗時 ${seconds} 秒`)
  return ui.active === era.title && ui.enabled === 5
}

async function runSequence(browser, test, startYear, years, { touch = false } = {}) {
  const context = await browser.newContext(
    touch
      ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false }
      : { viewport: { width: 1100, height: 700 } },
  )
  const { page, errors } = await openGame(context, startYear === 1853 ? {} : { era: ERAS[startYear].id }, { touch })
  record(test, `起點 ${startYear}`, (await rootData(page)).sceneEra === ERAS[startYear].id)
  for (const year of years) {
    const ok = await switchEra(page, test, year, { touch })
    if (!ok) break
  }
  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  return { context, page, errors }
}

async function testShopInteraction(page, test, { touch }) {
  const press = (locator) => (touch ? locator.tap() : locator.click())
  await press(page.locator('.hud-menu__toggle'))
  const shop = page.locator('.menu-shop', { hasText: '林復振' })
  await press(shop.locator('.button-ghost'))
  try {
    await page.waitForSelector('.explore-button', { timeout: 60000 })
    await press(page.locator('.explore-button'))
    await page.waitForSelector('.story-layer[data-state="open"] .story__title', { timeout: 60000 })
    const title = await page.locator('.story__title').textContent()
    const note = await page.locator('.era-note__label').textContent().catch(() => '')
    record(test, '店家互動：開啟林復振介紹', title === '林復振', note)
    await press(page.locator('.story__close'))
    await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 })
    record(test, '店家互動：關閉後回到街道', true)
  } catch (error) {
    record(test, '店家互動', false, error.message.split('\n')[0])
  }
}

async function testMovementAndCamera(page, test, { touch, cdp }) {
  const hasDebug = await page.evaluate(() => Boolean(window.__DDC__))
  if (!hasDebug) {
    record(test, '角色移動與鏡頭', 'skip', '略過：需要開發版（window.__DDC__）才能讀取角色與鏡頭狀態')
    return
  }
  const state = () =>
    page.evaluate(() => {
      const d = window.__DDC__
      return { x: d.playerState.position.x, z: d.playerState.position.z, yaw: d.cameraState.targetYaw, mode: d.useGameStore.getState().mode }
    })
  const before = await state()
  if (touch && cdp) {
    const base = await page.locator('.joystick__base').boundingBox()
    const cx = base.x + base.width / 2
    const cy = base.y + base.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + 30, y: cy - 40, id: 1 }] })
    await page.waitForTimeout(2500)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.keyboard.down('KeyD')
    await page.waitForTimeout(2500)
    await page.keyboard.up('KeyD')
  }
  await page.waitForTimeout(500)
  const moved = await state()
  const distance = Math.hypot(moved.x - before.x, moved.z - before.z)
  record(test, `角色可移動（${touch ? '搖桿' : '鍵盤'}）`, distance > 0.05, `移動 ${distance.toFixed(2)} 公尺`)

  const size = page.viewportSize()
  if (touch && cdp) {
    const x = size.width * 0.72
    const y = size.height * 0.5
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 2 }] })
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 25, y, id: 2 }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(size.width * 0.6, size.height * 0.55)
    await page.mouse.down()
    await page.mouse.move(size.width * 0.4, size.height * 0.55, { steps: 6 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)
  const turned = await state()
  record(test, `鏡頭可操作（${touch ? '單指拖曳' : '滑鼠拖曳'}）`, Math.abs(turned.yaw - moved.yaw) > 0.05, `yaw ${moved.yaw.toFixed(2)} → ${turned.yaw.toFixed(2)}`)
}

const playwright = await loadPlaywright()
const browserType = playwright[BROWSER]
const browser = await browserType.launch({
  headless: !process.env.HEADED,
  args: BROWSER === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [],
})
console.log(`瀏覽器：${BROWSER} ${browser.version()}　網址：${BASE_URL}`)

try {
  const run = (name) => !ONLY || ONLY.includes(name)
  if (run('A')) {
    const { context } = await runSequence(browser, 'A', 1853, [1895, 1930, 1945, 2000])
    await context.close()
  }
  if (run('B')) {
    const { context } = await runSequence(browser, 'B', 2000, [1853, 1945, 1895, 1930])
    await context.close()
  }
  if (run('C')) {
    const { context, page } = await runSequence(browser, 'C', 1853, [1930, 1853, 1930, 1853])
    if (run('F')) {
      await testMovementAndCamera(page, 'F 桌面', { touch: false })
      await testShopInteraction(page, 'F 桌面', { touch: false })
    }
    await context.close()
  }
  if (run('D')) {
    const years = [1895, 1930, 1945, 2000, 1853, 1930, 1853, 1945, 1895, 2000, 1930, 1853].slice(0, Number(process.env.D_COUNT ?? 12))
    const { context, page } = await runSequence(browser, 'D iPad 觸控', 1853, years, { touch: true })
    if (run('F')) {
      const cdp = BROWSER === 'chromium' ? await context.newCDPSession(page) : null
      await testMovementAndCamera(page, 'F 觸控', { touch: true, cdp })
      await testShopInteraction(page, 'F 觸控', { touch: true })
    }
    await context.close()
  }
} finally {
  await browser.close()
}

const failed = results.filter((item) => item.ok === false)
const skipped = results.filter((item) => item.ok === 'skip')
const passed = results.length - failed.length - skipped.length
console.log(`\n共 ${results.length} 項檢查：通過 ${passed} 項、失敗 ${failed.length} 項、略過 ${skipped.length} 項`)
process.exit(failed.length ? 1 : 0)
