/**
 * 滋養豆餡舖的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（滑鼠，精緻畫質）與 iPad 尺寸（觸控模擬，流暢畫質）各跑一次：
 *   1. 「老屋新生」的店家名錄有滋養豆餡舖，而且可以探索
 *   2. 街景中有滋養的轉角建築（店家建築、遮擋方塊與聚焦立面），涼州街可以走進去
 *   3. 從名錄前往店門口：出現店名提示；桌面按 E、觸控點店面，開啟介紹
 *   4. 介紹的四個章節：品牌歷史（1953、南京西路）、建築特色（三張照片載入完成）、
 *      代表食品（五張食物圖鑑）、參考文獻（三筆來源）
 *   5. 介紹的鏡頭停在轉角前方的路口，鏡頭不在建築裡，看得到店面
 *   6. 觀賞模式：從名錄「聚焦建築」，鏡頭停在斜切轉角立面的前方、不穿牆；返回探索
 *   7. 切換到其他年代：沒有滋養的建築；再切回「老屋新生」，建築恢復
 *   8. 沒有頁面錯誤
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/ziyang.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
// 軟體繪圖（SwiftShader）每個影格可能要一秒以上，等待時間放寬
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)
const SHOP = 'zi-yang'
const NAME = '滋養豆餡舖'

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

const waitFor = (page, fn, arg, timeout) =>
  page
    .waitForFunction(fn, arg, { timeout, polling: 250 })
    .then(() => true)
    .catch(() => false)

async function shot(page, name) {
  if (!SHOTS) return
  mkdirSync(SHOTS, { recursive: true })
  await page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 240000 })
}

/** 街景中滋養的建築資料（開發版的 cameraScene） */
function sceneInfo(page) {
  return page.evaluate((id) => {
    const scene = window.__DDC__.cameraScene.current
    const building = scene.buildings.find((item) => item.storeId === id)
    return {
      buildings: scene.buildings.length,
      found: !!building,
      parts: building?.parts.length ?? 0,
      focus: building?.focus ?? null,
      box: building?.box ?? null,
    }
  }, SHOP)
}

/** 鏡頭是否在建築裡、鏡頭到某一點之間有沒有被（其他）建築擋住 */
function lineOfSight(page, target, ignoreStore = null) {
  return page.evaluate(
    ({ target, ignoreStore }) => {
      const d = window.__DDC__
      const scene = d.cameraScene.current
      const ignored = new Set(scene.buildings.filter((b) => b.storeId === ignoreStore).flatMap((b) => b.parts))
      const boxes = scene.blockers.filter((box) => !ignored.has(box))
      const c = d.camera.position
      const inBox = (p, b) => p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY && p.z > b.minZ && p.z < b.maxZ
      const inside = scene.blockers.some((b) => inBox(c, b))
      let blocked = 0
      for (let i = 1; i < 60; i++) {
        const k = i / 60
        const p = { x: c.x + (target.x - c.x) * k, y: c.y + (target.y - c.y) * k, z: c.z + (target.z - c.z) * k }
        if (boxes.some((b) => inBox(p, b))) blocked++
      }
      return { inside, blocked, camera: { x: c.x, y: c.y, z: c.z } }
    },
    { target, ignoreStore },
  )
}

async function runDevice(browser, device) {
  const touch = device === 'touch'
  const test = touch ? 'iPad 觸控・流暢' : '桌面・精緻'
  const quality = touch ? 'smooth' : 'fine'
  const context = await browser.newContext(
    touch ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false } : { viewport: { width: 1280, height: 800 } },
  )
  const page = await context.newPage()
  page.setDefaultTimeout(TRANSITION_TIMEOUT)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const press = (locator) => (touch ? locator.tap() : locator.click())

  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)
  const mode = await page.evaluate(() => window.__DDC__.useGameStore.getState().qualityMode)
  record(test, `畫質為${quality === 'fine' ? '精緻' : '流暢'}`, mode === quality, mode)

  // 1. 店家名錄
  await press(page.locator('.hud-menu__toggle'))
  const entry = page.locator('.menu-shop', { hasText: NAME })
  const listed = (await entry.count()) === 1
  const explorable = listed && (await entry.locator('.menu-shop__badge.is-open').count()) === 1
  record(test, '店家名錄有滋養豆餡舖，而且可以探索', listed && explorable)

  // 2. 街景中的轉角建築與涼州街
  const info = await sceneInfo(page)
  record(
    test,
    '街景中有滋養的轉角建築（遮擋方塊與聚焦立面）',
    info.found && info.parts >= 6 && !!info.focus && info.focus.forward.x < -0.6 && info.focus.forward.z > 0.6,
    `建築 ${info.buildings} 棟、遮擋方塊 ${info.parts} 個`,
  )
  // 把人物放到涼州街、轉角人行道與建築內部，等幾個影格後看碰撞是否把人物推開
  const placeAt = async (x, z) => {
    await page.evaluate(([x, z]) => window.__DDC__.playerState.position.set(x, 0, z), [x, z])
    const frame = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (start) => (window.__DDC__.frameCount ?? 0) > start + 3, frame, 60000)
    return page.evaluate(() => ({ x: window.__DDC__.playerState.position.x, z: window.__DDC__.playerState.position.z }))
  }
  const sideStreet = await placeAt(-36.4, -14)
  const corner = await placeAt(-33.2, -3.6)
  const insideBuilding = await placeAt(-29.5, -10)
  const stayed = (p, x, z) => Math.hypot(p.x - x, p.z - z) < 0.05
  record(
    test,
    '涼州街與轉角前的人行道可以行走，建築內部不行',
    stayed(sideStreet, -36.4, -14) && stayed(corner, -33.2, -3.6) && !stayed(insideBuilding, -29.5, -10),
    `建築內部的點被推到 (${insideBuilding.x.toFixed(1)}, ${insideBuilding.z.toFixed(1)})`,
  )

  // 3. 前往店門口 → 店名提示 → 按 E／點店面
  await press(entry.locator('.button-ghost'))
  const prompt = await waitFor(
    page,
    (name) => document.querySelector('.shop-prompt.is-visible')?.textContent.includes(name),
    NAME,
    60000,
  )
  record(test, '前往店門口後出現店名提示', prompt)
  const exploreDock = await page.evaluate(() => !!document.querySelector('.explore-dock, .explore-button, .explore-chip'))
  record(test, '右下角沒有「探索店家」大型提示', !exploreDock)
  await page.waitForTimeout(2500)
  if (touch) {
    const point = await page.evaluate((id) => window.__DDC__.storefrontScreenPoint(id), SHOP)
    await page.touchscreen.tap(point.x, point.y)
  } else {
    await page.keyboard.press('KeyE')
  }
  const opened = await waitFor(page, (name) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === name, NAME, 60000)
  record(test, touch ? '靠近後點店面開啟介紹' : '靠近後按 E 開啟介紹', opened)

  // 4. 四個章節
  const tabs = await page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆]/, '').trim()))
  record(test, '四個章節：品牌歷史、建築特色、代表食品、參考文獻', tabs.join('、') === '品牌歷史、建築特色、代表食品、參考文獻', tabs.join('、'))
  const first = await page.evaluate(() => document.querySelector('.story__body')?.textContent ?? '')
  record(test, '品牌歷史：1953年創立於南京西路、後來才遷入迪化街', first.includes('1953') && first.includes('南京西路') && first.includes('迪化街'))
  await press(page.locator('.story__tab').nth(1))
  const photos = await waitFor(
    page,
    () => {
      const images = [...document.querySelectorAll('.chapter-figure img')]
      return images.length === 3 && images.every((img) => img.complete && img.naturalWidth > 0)
    },
    null,
    60000,
  )
  const architecture = await page.evaluate(() => document.querySelector('.story__body')?.textContent ?? '')
  record(test, '建築特色：三張實地照片載入完成', photos)
  record(test, '建築特色：說明現在的建築不是1953年的原始店面', architecture.includes('不是滋養1953年的原始店面'))
  await press(page.locator('.story__tab').nth(2))
  const foods = await waitFor(
    page,
    () => {
      const cards = [...document.querySelectorAll('.food-card')]
      return cards.length === 5 && cards.every((card) => card.querySelector('svg.food-illustration')?.childElementCount > 0)
    },
    null,
    30000,
  )
  const foodNames = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(test, '代表食品：五張食物圖鑑', foods && foodNames.join('、') === '草莓大福、最中、銅鑼燒、羊羹、鳳梨酥', foodNames.join('、'))
  await press(page.locator('.story__tab').nth(3))
  const sources = await waitFor(page, () => document.querySelectorAll('.source__link').length === 3, null, 30000)
  const links = await page.$$eval('.source__link', (items) => items.map((item) => item.getAttribute('href')))
  record(
    test,
    '參考文獻：官網、料理．台灣、食尚玩家',
    sources && links.some((href) => href.includes('wagashi.com.tw')) && links.some((href) => href.includes('ryoritaiwan')) && links.some((href) => href.includes('supertaste')),
  )

  // 5. 介紹的鏡頭：停在轉角前方的路口
  const shopCamera = await page.evaluate((id) => {
    const model = window.__DDC__.cameraScene.current.shopModels?.find((item) => item.shop.id === id)
    return model ? { x: model.placement.camera.position.x, y: model.placement.camera.position.y, z: model.placement.camera.position.z } : null
  }, SHOP)
  const arrived = shopCamera
    ? await waitFor(
        page,
        (goal) => window.__DDC__.camera.position.distanceTo({ x: goal.x, y: goal.y, z: goal.z, isVector3: true }) < 0.6,
        shopCamera,
        SETTLE_TIMEOUT,
      )
    : await page.waitForTimeout(20000).then(() => true)
  const view = await lineOfSight(page, { x: -30.9, y: 3, z: -5.9 }, SHOP)
  record(test, '介紹鏡頭停在轉角前方、不在建築裡、看得到店面', arrived && !view.inside && view.blocked === 0, `鏡頭 (${view.camera.x.toFixed(1)}, ${view.camera.y.toFixed(1)}, ${view.camera.z.toFixed(1)})`)
  await press(page.locator('.story__tab').nth(1))
  await page.waitForTimeout(1500)
  await shot(page, `${device}-story`)
  await press(page.locator('.story__close'))
  await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})

  // 6. 觀賞模式：聚焦滋養的轉角立面
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(1500)
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator(`[data-focus-shop="${SHOP}"]`))
  const settled = await waitFor(
    page,
    () => {
      const v = window.__DDC__.viewer
      return (
        v?.phase === 'active' &&
        v.target.distanceTo(v.goalTarget) < 0.08 &&
        Math.abs(v.yaw - v.goalYaw) < 0.02 &&
        Math.abs(v.pitch - v.goalPitch) < 0.02 &&
        Math.abs(v.distance - v.goalDistance) < 0.1
      )
    },
    null,
    SETTLE_TIMEOUT,
  )
  const focus = info.focus
  const viewerView = await lineOfSight(page, { x: focus.center.x + focus.forward.x * 0.3, y: 5, z: focus.center.z + focus.forward.z * 0.3 }, SHOP)
  const front = (viewerView.camera.x - focus.center.x) * focus.forward.x + (viewerView.camera.z - focus.center.z) * focus.forward.z
  record(
    test,
    '觀賞模式聚焦：鏡頭在斜切轉角立面的前方、不穿牆',
    settled && front > 2 && !viewerView.inside && viewerView.blocked === 0,
    `前方 ${front.toFixed(1)} m、鏡頭 (${viewerView.camera.x.toFixed(1)}, ${viewerView.camera.y.toFixed(1)}, ${viewerView.camera.z.toFixed(1)})`,
  )
  await shot(page, `${device}-viewer-focus`)
  await press(page.locator('.viewer-bar [data-view-return], .viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore', null, 60000)
  record(test, '返回探索', back)

  // 7. 其他年代沒有滋養；切回老屋新生後恢復
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-era-option="modern"]'))
  const modern = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'modern', null, TRANSITION_TIMEOUT)
  const modernInfo = await sceneInfo(page)
  const modernListed = await page.evaluate(() => window.__DDC__.useGameStore.getState().eraId)
  record(test, '切換到摩登年代：沒有滋養的建築', modern && !modernInfo.found && modernListed === 'modern', `建築 ${modernInfo.buildings} 棟`)
  await press(page.locator('[data-era-option="revival"]'))
  const revival = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'revival', null, TRANSITION_TIMEOUT)
  const revivalInfo = await sceneInfo(page)
  record(test, '切回老屋新生：滋養的建築恢復', revival && revivalInfo.found)
  await page.keyboard.press('Escape').catch(() => {})

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
console.log(`瀏覽器：chromium ${browser.version()}　網址：${BASE_URL}`)
try {
  for (const device of DEVICES) await runDevice(browser, device)
} finally {
  await browser.close()
}

const failed = results.filter((item) => !item.ok)
console.log(`\n共 ${results.length} 項檢查：通過 ${results.length - failed.length} 項、失敗 ${failed.length} 項`)
process.exit(failed.length ? 1 : 0)
