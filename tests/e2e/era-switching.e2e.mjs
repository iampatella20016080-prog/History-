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
 * 測試 Q（畫質設定，桌面與 iPad 觸控各一次）：
 *   - 預設模式（桌面「精緻」、觸控「流暢」）
 *   - 以右上角齒輪來回切換流暢／精緻至少 10 次，每次都檢查實際套用的設定
 *     （data-dpr、data-shadow-map、data-msaa、data-ao、data-bloom、data-dof、data-detail），
 *     畫面不是黑的（截圖取樣亮度）、WebGL 沒有錯誤也沒有遺失
 *   - 重新整理後沿用最後的選擇（localStorage）
 *   - 切換後年代切換、角色移動、鏡頭與店家互動仍正常（測試 F）
 *
 * 用法：
 *   npm run build && npx vite preview --port 4173      # 或 npm run dev
 *   node tests/e2e/era-switching.e2e.mjs http://127.0.0.1:4173/
 *
 * 需要 Playwright：npm i -D playwright && npx playwright install chromium，
 * 或以環境變數 PLAYWRIGHT_MODULE 指定已安裝的 playwright 模組路徑。
 * 其他環境變數：BROWSER（chromium｜webkit｜firefox）、ONLY（A,B,C,D,F,Q）、D_COUNT（測試 D 的切換次數，預設 12）、
 * Q_TOGGLES（測試 Q 的切換次數，預設 12）、HEADED=1
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

const WEBGL_WARNING = /WebGL|GL_INVALID|GL ERROR|CONTEXT_LOST/i

async function openGame(context, query, { touch, quality = 'low' }) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || (message.type() === 'warning' && WEBGL_WARNING.test(message.text()))) errors.push(message.text())
  })
  const url = new URL(BASE_URL)
  if (quality) url.searchParams.set('quality', quality)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  await page.goto(url.href, { waitUntil: 'load' })
  await startGame(page, { touch })
  return { page, errors }
}

async function startGame(page, { touch }) {
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  const start = page.locator('.intro__start')
  if (touch) await start.tap()
  else await start.click()
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  // 記錄 WebGL 遺失
  await page.evaluate(() => {
    window.__contextLost = 0
    document.querySelector('canvas')?.addEventListener('webglcontextlost', () => window.__contextLost++)
  })
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
    .waitForFunction((title) => document.querySelector('.chapter-card__title')?.textContent === title, era.title, { timeout: 15000 })
    .then(() => era.title)
    .catch(() => page.evaluate(() => document.querySelector('.chapter-card__title')?.textContent ?? null))
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

/* ───────────── 測試 Q：畫質設定 ───────────── */

const QUALITY_TIMEOUT = Number(process.env.QUALITY_TIMEOUT ?? 240000)
const QUALITY = {
  smooth: { label: '流暢', dprMax: 1.25, shadowMap: '1024', msaa: '2', ao: '0', bloom: '0', dof: '0', detail: 'reduced' },
  fine: { label: '精緻', dprMax: 1.75, shadowMap: '2048', msaa: '4', ao: '0.4', bloom: '0.16', dof: '12', detail: 'full' },
}

/** 等待畫質設定實際套用到渲染器（陰影貼圖在下一次渲染時才重新配置） */
async function waitForQuality(page, mode, ratio) {
  const want = { ...QUALITY[mode], dprMax: Math.min(QUALITY[mode].dprMax, ratio) }
  try {
    await page.waitForFunction(
      ({ mode, want }) => {
        const d = document.documentElement.dataset
        return (
          d.quality === mode &&
          Math.abs(Number(d.dprMax) - want.dprMax) < 0.001 &&
          Math.abs(Number(d.dpr) - want.dprMax) < 0.011 &&
          d.shadowMap === want.shadowMap &&
          d.msaa === want.msaa &&
          d.ao === want.ao &&
          d.bloom === want.bloom &&
          d.dof === want.dof &&
          d.detail === want.detail
        )
      },
      { mode, want },
      { timeout: QUALITY_TIMEOUT },
    )
    return { ok: true, data: await rootData(page) }
  } catch {
    return { ok: false, data: await rootData(page) }
  }
}

const describeQuality = (d) => `DPR ${d.dpr}（上限 ${d.dprMax}）、陰影 ${d.shadowMap}、MSAA ${d.msaa}、AO ${d.ao}、光暈 ${d.bloom}、景深 ${d.dof}、裝飾 ${d.detail}`

/** 截取畫面中央（避開介面）並計算平均亮度與接近全黑的比例 */
async function frameStats(page) {
  const size = page.viewportSize()
  const clip = { x: size.width * 0.25, y: size.height * 0.28, width: size.width * 0.5, height: size.height * 0.4 }
  const buffer = await page.screenshot({ type: 'jpeg', quality: 70, clip, scale: 'css', timeout: QUALITY_TIMEOUT })
  return page.evaluate(async (b64) => {
    const image = new Image()
    image.src = `data:image/jpeg;base64,${b64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 40
    const g = canvas.getContext('2d')
    g.drawImage(image, 0, 0, 64, 40)
    const pixels = g.getImageData(0, 0, 64, 40).data
    let sum = 0
    let dark = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const l = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255
      sum += l
      if (l < 0.04) dark++
    }
    const n = pixels.length / 4
    return { mean: sum / n, dark: dark / n }
  }, buffer.toString('base64'))
}

async function webglStatus(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl')
    if (!gl) return { error: '找不到 WebGL', lost: window.__contextLost ?? 0 }
    if (gl.isContextLost()) return { error: 'WebGL 遺失', lost: window.__contextLost ?? 0 }
    const code = gl.getError()
    return { error: code === 0 ? null : `gl.getError() = 0x${code.toString(16)}`, lost: window.__contextLost ?? 0 }
  })
}

async function testQuality(browser, test, { touch }) {
  const ratio = 2
  const context = await browser.newContext(
    touch
      ? { viewport: { width: 1024, height: 700 }, deviceScaleFactor: ratio, hasTouch: true, isMobile: false }
      : { viewport: { width: 900, height: 600 }, deviceScaleFactor: ratio },
  )
  const press = (locator) => (touch ? locator.tap() : locator.click())
  // 不指定畫質，檢查依裝置的預設；關閉自動調整解析度，才能核對實際的 DPR
  const { page, errors } = await openGame(context, { era: 'banquet', adaptive: '0' }, { touch, quality: null })
  // 軟體繪圖（SwiftShader）每個影格要數秒，切換模式時還要重新編譯著色器：放寬操作的等待時間
  page.setDefaultTimeout(QUALITY_TIMEOUT)
  const expectedDefault = touch ? 'smooth' : 'fine'
  let current = (await rootData(page)).quality
  record(test, `預設畫質（${touch ? 'iPad 觸控' : '桌面'}）`, current === expectedDefault, `${QUALITY[current]?.label ?? current}`)
  const first = await waitForQuality(page, current, ratio)
  record(test, `${QUALITY[current]?.label}：設定已套用`, first.ok, describeQuality(first.data))

  const toggles = Number(process.env.Q_TOGGLES ?? 12)
  await press(page.locator('.hud-quality__toggle'))
  await page.waitForSelector('#quality-panel')
  let failures = 0
  const minimum = { mean: 1, dark: 0 }
  for (let i = 0; i < toggles; i++) {
    const target = current === 'fine' ? 'smooth' : 'fine'
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitForQuality(page, target, ratio)
    await page.waitForTimeout(400)
    const stats = await frameStats(page)
    const gl = await webglStatus(page)
    const notBlack = stats.mean > 0.06 && stats.dark < 0.6
    const ok = applied.ok && notBlack && !gl.error && gl.lost === 0
    if (!ok) failures++
    minimum.mean = Math.min(minimum.mean, stats.mean)
    minimum.dark = Math.max(minimum.dark, stats.dark)
    record(
      test,
      `第 ${i + 1} 次切換 → ${QUALITY[target].label}`,
      ok,
      `${describeQuality(applied.data)}；畫面平均亮度 ${stats.mean.toFixed(2)}、近黑 ${(stats.dark * 100).toFixed(0)}%${gl.error ? `；${gl.error}` : ''}${gl.lost ? `；WebGL 遺失 ${gl.lost} 次` : ''}`,
    )
    current = target
  }
  record(test, `來回切換 ${toggles} 次`, failures === 0, `最低平均亮度 ${minimum.mean.toFixed(2)}、最高近黑比例 ${(minimum.dark * 100).toFixed(0)}%`)
  await page.keyboard.press('Escape')
  await page.waitForSelector('#quality-panel', { state: 'detached', timeout: 10000 }).catch(() => {})

  // 重新整理後沿用最後的選擇
  const stored = await page.evaluate(() => localStorage.getItem('ddc.qualityMode'))
  await page.reload({ waitUntil: 'load' })
  await startGame(page, { touch })
  const reloaded = await waitForQuality(page, current, ratio)
  record(test, '重新整理後沿用選擇（localStorage）', stored === current && reloaded.ok, `儲存值 ${stored}；${describeQuality(reloaded.data)}`)

  // 切換後：年代切換、角色移動、鏡頭與店家互動
  for (const year of [1930, 1895]) {
    if (!(await switchEra(page, test, year, { touch }))) break
  }
  const cdp = touch && BROWSER === 'chromium' ? await context.newCDPSession(page) : null
  await testMovementAndCamera(page, test, { touch, cdp })
  await testShopInteraction(page, test, { touch })
  const gl = await webglStatus(page)
  record(test, '沒有頁面錯誤或 WebGL 錯誤', errors.length === 0 && !gl.error && gl.lost === 0, [...errors.slice(0, 3), gl.error].filter(Boolean).join(' | '))
  await context.close()
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
  if (run('Q')) {
    await testQuality(browser, 'Q 桌面', { touch: false })
    await testQuality(browser, 'Q iPad 觸控', { touch: true })
  }
} finally {
  await browser.close()
}

const failed = results.filter((item) => item.ok === false)
const skipped = results.filter((item) => item.ok === 'skip')
const passed = results.length - failed.length - skipped.length
console.log(`\n共 ${results.length} 項檢查：通過 ${passed} 項、失敗 ${failed.length} 項、略過 ${skipped.length} 項`)
process.exit(failed.length ? 1 : 0)
