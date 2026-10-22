/**
 * 黃玉階文史館（元珍豆醬店）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 2000–現在的店家名錄有「黃玉階文史館」（文化據點、可探索）
 *   2. 動線：導演的豆花店門前 → 拱門 → 文史館的騎樓 → 入口 → 人物展示牆 → 展板 → 長桌 → 層架 → 醬缸 → 茶席 → 回到街上
 *      每一站的提示都是文史館的熱點（不會串到豆花店），按 E／點提示開啟對應章節
 *   3. 點「文史展板」開啟「社會改革與初等教育」（HTML 文字可以閱讀，不是圖片小字）
 *   4. 建築觀賞模式：聚焦立面、拱窗與陶飾、木梁、展板；觀賞模式點物件只聚焦、不開啟介紹
 *   5. 在展間裡切換畫質：細部隱藏／顯示，展間仍在
 *   6. 連續進出 5 次：不卡住、鏡頭不在方塊裡
 *   7. 在展間裡切換到 1930–1945：人物移到合法的戶外位置、文史館與展間清除；切回來文史館與豆花店都在
 *   8. 年代、服裝、音樂不被重置；沒有頁面錯誤
 * 截圖（SHOTS，只在桌面）：相鄰街景、文史館正面、騎樓木梁、入口看向展間、展示牆與長桌、木架陳列、醬缸展示區、茶席。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/huangYujie.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、CHROMIUM_EXECUTABLE（完整版 Chromium 的路徑）、DEVICES（desktop,touch）、
 *           SHOTS（截圖資料夾）、CYCLES（進出次數，預設 5）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SHOP } from '../../src/data/actionBarLayout.js'
import { MUSEUM, MUSEUM_ROUTE, museumToWorld } from '../../src/data/huangYujieLayout.js'
import { getShop } from '../../src/data/shops.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 5)
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)

const L = (x, z) => museumToWorld(x, z)
const bar = getShop('action-bar')
const AB = (sx, sz) => ({ x: bar.site.x + SHOP.origin[0] - sz, z: bar.site.z + SHOP.origin[2] + sx })
const PASSAGE_Z = (SHOP.passage.minZ + SHOP.passage.maxZ) / 2
const route = (ids) => ids.map((id) => MUSEUM_ROUTE.find((r) => r.id === id)).map((r) => L(r.x, r.z))
const AB_DOOR = AB(-0.1, -1.0)
const TO_MUSEUM = [AB(-2.2, PASSAGE_Z), L(1.6, PASSAGE_Z), ...route(['arcade'])]
const BACK_TO_BAR = [L(1.6, PASSAGE_Z), AB(-2.2, PASSAGE_Z), AB_DOOR]
const ROOM_MIN = L(MUSEUM.room.maxX, MUSEUM.room.maxZ)
const ROOM_MAX = L(MUSEUM.room.minX, MUSEUM.room.minZ)
const inRoom = (c) => c.x > Math.min(ROOM_MIN.x, ROOM_MAX.x) && c.x < Math.max(ROOM_MIN.x, ROOM_MAX.x) && c.z > Math.min(ROOM_MIN.z, ROOM_MAX.z) && c.z < Math.max(ROOM_MIN.z, ROOM_MAX.z)

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

const waitFor = (page, fn, arg, timeout, polling = 250) =>
  page
    .waitForFunction(fn, arg, { timeout, polling })
    .then(() => true)
    .catch(() => false)

const round = (n) => Number(n).toFixed(2)

function state(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const scene = d.cameraScene.current
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    let interiorCount = 0
    d.scene?.traverse((o) => {
      if (o.name === 'interior-huang-yujie-museum') interiorCount++
    })
    const detail = d.scene?.getObjectByName('interior-huang-yujie-museum-detail')
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      camInside: scene.blockers.some((b) => inBox(c, b)),
      interior: d.interiors?.['huang-yujie-museum'] ?? null,
      detailVisible: detail ? detail.visible : null,
      interiorCount,
      museum: scene.buildings.some((b) => b.storeId === 'huang-yujie-museum'),
      actionBar: scene.buildings.some((b) => b.storeId === 'action-bar'),
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      prompt: document.querySelector('.shop-prompt.is-visible .shop-prompt__name')?.textContent ?? null,
    }
  })
}

function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__hySampler ?? 0)
    const samples = []
    window.__hySamples = samples
    let last = -1
    let prev = null
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__hySampler = requestAnimationFrame(tick)
      if (d.frameCount === last) return
      last = d.frameCount
      const s = d.useGameStore.getState()
      if (s.viewMode !== 'explore' || s.mode !== 'explore') {
        prev = null
        return
      }
      const c = d.camera.position
      const p = d.playerState.position
      const step = prev ? Math.hypot(p.x - prev.x, p.z - prev.z) : 0
      prev = { x: p.x, z: p.z }
      const box = d.cameraScene.current.blockers.findIndex((b) => inBox(c, b))
      samples.push({ inside: box >= 0, step, at: box >= 0 ? [c.x, c.y, c.z].map((v) => +v.toFixed(2)) : null })
    }
    tick()
  })
}

function samplerStats(page) {
  return page.evaluate(() => {
    const samples = window.__hySamples ?? []
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      maxStep: samples.reduce((max, item) => Math.max(max, item.step), 0),
      insideAt: samples.filter((item) => item.at).slice(0, 3).map((item) => item.at),
    }
  })
}

async function runDevice(browser, device) {
  const touch = device === 'touch'
  const test = touch ? 'iPad 觸控・流暢' : '桌面・精緻'
  const quality = touch ? 'smooth' : 'fine'
  const context = await browser.newContext(touch ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false } : { viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(TRANSITION_TIMEOUT)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const press = (locator) => (touch ? locator.tap() : locator.click())
  const cdp = touch ? await context.newCDPSession(page) : null
  const touchSend = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })

  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
  }
  const holdForward = async () => {
    if (touch) {
      const base = await page.locator('.joystick__base').boundingBox()
      const cx = base.x + base.width / 2
      const cy = base.y + base.height / 2
      await touchSend('touchStart', [{ x: cx, y: cy, id: 7 }])
      await touchSend('touchMove', [{ x: cx, y: cy - base.height * 0.27, id: 7 }])
      return () => touchSend('touchEnd', [])
    }
    await page.keyboard.down('KeyW')
    return () => page.keyboard.up('KeyW')
  }
  const settle = () =>
    waitFor(
      page,
      () => {
        const d = window.__DDC__
        const p = d.playerState.position
        const now = { x: p.x, z: p.z, frame: d.frameCount }
        const prev = window.__hySettle
        if (!prev || prev.frame === now.frame) {
          window.__hySettle = prev ?? now
          return false
        }
        window.__hySettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() => page.evaluate(() => (window.__hySettle = null)))
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個點；原地不動太久就回報卡住 */
  const walk = async (points, { tolerance = 0.22 } = {}) => {
    await page.evaluate((points) => {
      window.__hyRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__hyRoute
        const p = d.playerState.position
        if (d.frameCount === r.frame) return false
        r.frame = d.frameCount
        let t = r.points[r.i]
        while (t && Math.hypot(t.x - p.x, t.z - p.z) < (r.i === r.points.length - 1 ? tolerance : tolerance + 0.1)) t = r.points[++r.i]
        if (!t) return true
        if (r.last && Math.hypot(p.x - r.last.x, p.z - r.last.z) < 0.004) r.still++
        else r.still = 0
        r.last = { x: p.x, z: p.z }
        if (r.still > 45) {
          r.stuck = true
          return true
        }
        d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(t.x - p.x), -(t.z - p.z))
        return false
      },
      tolerance,
      WALK_TIMEOUT,
      'raf',
    )
    await release()
    await settle()
    const r = await page.evaluate(() => ({ i: window.__hyRoute.i, stuck: window.__hyRoute.stuck, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  const storyOpen = (title) => waitFor(page, (title) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === title, title, 60000)
  const activeTab = () => page.evaluate(() => document.querySelector('.story__tab.is-active')?.textContent.replace(/^[壹貳參肆伍陸柒]/, '').trim() ?? null)
  const closeStory = async () => {
    await press(page.locator('.story__close'))
    await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})
    await frames(4)
  }
  const interact = async () => {
    if (touch) await page.locator('.shop-prompt.is-visible .shop-prompt__card').tap()
    else await page.keyboard.press('KeyE')
  }
  const openSettings = async () => {
    if (await page.locator('#quality-panel').count()) return
    await press(page.locator('.hud-quality__toggle'))
    await page.waitForSelector('#quality-panel')
  }
  const closeSettings = async () => {
    if (!(await page.locator('#quality-panel').count())) return
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForSelector('#quality-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  }
  const switchEra = async (id) => {
    await openSettings()
    await press(page.locator(`[data-era-option="${id}"]`))
    const ok = await waitFor(page, (id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id, id, TRANSITION_TIMEOUT)
    await frames(6)
    return ok
  }
  const screenPointOf = (id) =>
    page.evaluate((id) => {
      const d = window.__DDC__
      const record = d.cameraScene.current.buildings.find((item) => item.id === id)
      if (!record) return null
      const b = record.parts[0]
      const point = d.camera.position.clone().set((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2).project(d.camera)
      const rect = d.gl.domElement.getBoundingClientRect()
      return { x: rect.left + ((point.x + 1) / 2) * rect.width, y: rect.top + ((1 - point.y) / 2) * rect.height, inView: Math.abs(point.x) < 0.95 && Math.abs(point.y) < 0.95 && point.z < 1 }
    }, id)
  const tapAt = async (point) => {
    if (touch) await page.touchscreen.tap(point.x, point.y)
    else await page.mouse.click(point.x, point.y)
  }
  const media = () =>
    page.evaluate(() => ({
      era: window.__DDC__.useGameStore.getState().eraId,
      outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
      music: window.__DDC__.audioManager?.inspect() ?? null,
      noReload: window.__noReload,
    }))
  /** 截圖：用開發版的鏡頭覆寫指定構圖，暫時隱藏介面 */
  const shot = async (name, position, target) => {
    if (!SHOTS || touch) return
    mkdirSync(SHOTS, { recursive: true })
    await page.evaluate(({ position, target }) => {
      window.__DDC__.cameraOverride = { position, target }
      document.documentElement.classList.add('hy-shot')
    }, { position, target })
    await frames(24)
    await page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 240000 })
    await page.evaluate(() => {
      delete window.__DDC__.cameraOverride
      document.documentElement.classList.remove('hy-shot')
      window.__DDC__.cameraState.snap = true
    })
    await frames(6)
  }
  const at = (x, y, z) => [L(x, z).x, y, L(x, z).z]

  /* ── 開始：2000–現在 ─────────────── */
  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.addStyleTag({ content: 'html.hy-shot .hud, html.hy-shot .shop-prompt, html.hy-shot .hud-help, html.hy-shot .touch-controls { visibility: hidden !important; }' })
  await page.evaluate(() => (window.__noReload = 'huang-yujie'))
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  // 店家名錄：文化據點
  await press(page.locator('.hud-menu__toggle'))
  const entry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: '黃玉階文史館' }) })
  const count = await entry.count()
  const notes = await entry.locator('.menu-shop__note').allTextContents()
  const open = await entry.locator('.menu-shop__badge.is-open').count()
  await press(page.locator('.hud-menu__toggle'))
  await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  record(test, '店家名錄有「黃玉階文史館」，以「文化據點」分類顯示、可以探索', count === 1 && open === 1 && notes.includes('文化據點'), notes.join('、'))

  // 從導演的豆花店門前出發
  await page.evaluate((p) => {
    const d = window.__DDC__
    d.playerState.position.set(p.x, 0, p.z)
    d.cameraState.snap = true
  }, AB_DOOR)
  await frames(10)
  await startSampler(page)
  const toArcade = await walk(TO_MUSEUM)
  await frames(6)
  const atArcade = await state(page)
  record(
    test,
    '從豆花店門前穿過拱門走到文史館的騎樓；提示是文史館（不是豆花店）',
    toArcade.ok && atArcade.nearby === 'huang-yujie-museum' && atArcade.hotspot === 'facade' && atArcade.prompt === '黃玉階文史館',
    `(${round(atArcade.x)}, ${round(atArcade.z)}) 提示 ${atArcade.prompt}`,
  )
  await interact()
  const museumStory = (await storyOpen('黃玉階文史館')) && (await activeTab()) === '場館與老屋'
  const tabs = await page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆伍陸柒]/, '').trim()))
  const summary = await page.evaluate(() => document.querySelector('.chapter-summary__label')?.textContent ?? null)
  record(test, '按 E／點提示開啟介紹：場館與老屋（網站延伸整理），七個章節含「相關組織資料」', museumStory && tabs.length === 7 && tabs.includes('相關組織資料') && summary === '網站延伸整理', tabs.join('、'))
  await closeStory()

  // 走進展間：人物展示牆 → 展板 → 長桌 → 層架 → 醬缸 → 茶席
  const stops = [
    { ids: ['entrance', 'portrait'], hotspot: 'portrait', tab: '黃玉階與大稻埕' },
    { ids: ['corner-in', 'aisle', 'edu-wall'], hotspot: 'board', tab: '社會改革與教育' },
    { ids: ['cross', 'tables', 'shelves', 'jar-area'], hotspot: 'jar-area', tab: '元珍豆醬店' },
    { ids: ['right-aisle', 'right-back', 'desk', 'tea'], hotspot: 'tea', tab: '日常器物' },
  ]
  const stopResults = []
  for (const stop of stops) {
    const w = await walk(route(stop.ids))
    await frames(6)
    const s = await state(page)
    let opened = false
    if (s.hotspot === stop.hotspot) {
      await interact()
      opened = (await storyOpen('黃玉階文史館')) && (await activeTab()) === stop.tab
      await closeStory()
    }
    stopResults.push(w.ok && s.nearby === 'huang-yujie-museum' && s.hotspot === stop.hotspot && opened)
    console.log(`    ${stop.hotspot}：${w.ok ? '走到' : `卡在第 ${w.i} 點`}、提示 ${s.prompt}（${s.hotspot}）、介紹 ${opened}`)
  }
  record(test, '展間的動線：人物展示牆、展板、醬缸、茶席的提示都正確，開啟對應章節', stopResults.every(Boolean), stopResults.join('、'))

  // 點文史展板：開啟「社會改革與初等教育」，文字是 HTML
  await walk(route(['left-aisle']))
  await page.evaluate((t) => {
    const d = window.__DDC__
    const p = d.playerState.position
    d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(t.x - p.x), -(t.z - p.z))
    d.cameraState.snap = true
  }, L(MUSEUM.room.minX, -5.6))
  await page.evaluate((p) => window.__DDC__.playerState.position.set(p.x, 0, p.z), L(-0.95, -5.9))
  await frames(20)
  const boardPoint = await screenPointOf('huang-yujie-board')
  let boardOpened = false
  let boardText = 0
  if (boardPoint?.inView) {
    await tapAt(boardPoint)
    boardOpened = (await storyOpen('黃玉階文史館')) && (await activeTab()) === '社會改革與教育'
    boardText = await page.evaluate(() => [...document.querySelectorAll('.story-layer .chapter__p, .story-layer .chapter-summary p')].reduce((n, el) => n + el.textContent.length, 0))
    await closeStory()
  }
  record(test, '點文史展板：開啟「社會改革與初等教育」，可以讀到清楚的 HTML 文字', boardOpened && boardText > 200, `文字 ${boardText} 字`)

  // 在展間裡切換畫質：細部隱藏／顯示，展間仍在
  await openSettings()
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && s.detailVisible === (target === 'fine') && !s.camInside)
  }
  await closeSettings()
  record(test, '在展間裡切換畫質：流暢模式隱藏細部、精緻模式顯示；木梁、醬缸、展板與長桌一直都在', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 建築觀賞模式：在展間裡進入，點展板、木梁只聚焦，不開啟介紹
  await openSettings()
  await press(page.locator('[data-view-mode="viewer"]').first())
  await closeSettings()
  const viewerReady = await waitFor(page, () => window.__DDC__.viewer?.phase === 'active', null, SETTLE_TIMEOUT)
  const focusChecks = []
  for (const id of ['huang-yujie-board', 'huang-yujie-beams', 'huang-yujie-shelves']) {
    await page.evaluate((id) => {
      const d = window.__DDC__
      const b = d.cameraScene.current.buildings.find((item) => item.id === id)
      window.__hyFocusTarget = b ? { x: (b.box.minX + b.box.maxX) / 2, z: (b.box.minZ + b.box.maxZ) / 2 } : null
    }, id)
    const point = await screenPointOf(id)
    if (point?.inView) await tapAt(point)
    await frames(60)
    const s = await state(page)
    focusChecks.push(s.mode === 'explore' && s.viewMode === 'viewer' && !s.camInside)
  }
  record(test, '觀賞模式：點展板、木梁、層架只聚焦，不開啟介紹，鏡頭不在方塊裡', viewerReady && focusChecks.every(Boolean), focusChecks.join('、'))
  await openSettings()
  await press(page.locator('[data-view-mode="explore"]').first())
  await closeSettings()
  await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore', null, 30000)
  await frames(10)

  // 截圖（桌面）
  await shot('01-street-neighbours', [L(-3.0, 6.2).x, 2.1, L(-3.0, 6.2).z], [L(3.1, -0.4).x, 3.6, L(3.1, -0.4).z])
  await shot('02-museum-facade', at(0.3, 2.3, 6.4), at(0, 3.9, -0.2))
  // 沿著騎樓往豆花店看（照片2的角度）：木梁天花、斜掛的「源珍」木匾、吊燈與盡頭的拱門
  await shot('03-arcade-beams', at(-1.85, 1.5, -1.25), at(2.4, 2.35, -0.9))
  await shot('04-entrance-interior', at(0.35, 1.7, -2.15), at(-0.3, 1.25, -8.6))
  await shot('05-wall-tables', at(1.25, 1.8, -3.1), at(-1.6, 1.15, -6.4))
  await shot('06-shelves', at(-0.75, 1.65, -4.4), at(2.1, 1.45, -6.6))
  await shot('07-jar-display', at(-0.35, 1.45, -4.35), at(2.05, 0.95, -2.75))
  await shot('08-tea-study', at(0.95, 1.6, -6.9), at(-1.1, 1.3, -9.1))

  // 連續進出 5 次
  const out = await walk([...route(['left-aisle', 'back-to-door', 'corner-out', 'exit', 'arcade-out']), ...BACK_TO_BAR])
  const before = await media()
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk([...TO_MUSEUM, ...route(['entrance', 'portrait', 'corner-in', 'aisle', 'edu-wall', 'cross', 'tables'])])
    const sa = await state(page)
    const b = await walk([...route(['cross', 'edu-wall', 'aisle', 'corner-out', 'exit', 'arcade-out']), ...BACK_TO_BAR])
    const sb = await state(page)
    const ok = a.ok && b.ok && inRoom(sa) && !inRoom(sb) && sa.y === 0 && sb.y === 0 && !sa.camInside && !sb.camInside
    cycles.push(ok)
    console.log(`    第 ${i + 1} 次：進 (${round(sa.x)}, ${round(sa.z)})${a.ok ? '' : `（卡在第 ${a.i} 點）`}、出 (${round(sb.x)}, ${round(sb.z)})${b.ok ? '' : `（卡在第 ${b.i} 點）`}`)
  }
  const stats = await samplerStats(page)
  const after = await media()
  record(
    test,
    `豆花店門前 ↔ 文史館展間連續進出 ${CYCLES} 次：不卡門、柱、花槽或展櫃，鏡頭不在方塊裡`,
    out.ok && cycles.length === CYCLES && cycles.every(Boolean) && stats.inside === 0 && stats.maxStep < 0.6,
    `${cycles.filter(Boolean).length}/${CYCLES}、${stats.frames} 個影格中鏡頭在方塊裡 ${stats.inside}${stats.insideAt.length ? `；${JSON.stringify(stats.insideAt)}` : ''}`,
  )
  const musicKept = !before.music || (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount)
  record(test, '進出不重置年代、服裝與音樂，也沒有重新載入頁面', after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'huang-yujie')

  // 在展間裡切換年代
  await walk([...TO_MUSEUM, ...route(['entrance', 'portrait', 'corner-in', 'aisle', 'edu-wall', 'cross', 'tables'])])
  const inside = await state(page)
  const toModern = await switchEra('modern')
  const moved = await state(page)
  record(
    test,
    '在展間裡切換到 1930–1945：人物移到合法的戶外位置，文史館、展間與招牌都清除',
    inRoom(inside) && toModern && !inRoom(moved) && moved.y === 0 && !moved.camInside && !moved.museum && moved.interiorCount === 0,
    `人物 (${round(moved.x)}, ${round(moved.y)}, ${round(moved.z)})`,
  )
  const back = await switchEra('revival')
  const again = await state(page)
  await closeSettings()
  record(test, '切回 2000–現在：文史館與導演的豆花店都在，沒有重新載入頁面', back && again.museum && again.actionBar && (await media()).noReload === 'huang-yujie')

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
  // 沒有安裝 headless shell 時，可以用 CHROMIUM_EXECUTABLE 指定完整版的 Chromium
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
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
