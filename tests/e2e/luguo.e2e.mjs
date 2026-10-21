/**
 * 爐鍋咖啡（小藝埕二樓）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD＋Shift、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 店家名錄有爐鍋咖啡；在出發點（離小藝埕約 15 m）二樓的室內還沒有產生；右下角沒有大型「探索店家」提示
 *   2. 迪化街 → 轉角騎樓 → 巷子側騎樓 → 樓梯入口 → 兩段樓梯 → 二樓的玻璃門 → 吧檯前：
 *      人物一路連續移動（沒有傳送、高度連續變化），到二樓時樓層為 1、地板 4 m；
 *      每一個影格鏡頭都不在牆、樓梯、天花板或家具裡，看得到人物；室內在接近時產生並顯示，
 *      在二樓時不繪製永樂市場的室內
 *   3. 吧檯前的提示是熱點「咖啡吧檯」；按 E／點提示開啟介紹的「咖啡製作與飲食文化」章節（五個章節、五張圖鑑、文獻網址）
 *   4. 走到紅色扭蛋機前，點扭蛋機本身：開啟同一個章節（只是介紹，沒有付費或抽獎）；走到窗邊座位，開啟「小藝埕」章節
 *   5. 建築觀賞模式在店內：鏡頭在店裡、二樓地板與天花之間；旋轉；從店家名錄聚焦小藝埕（鏡頭在迪化街上）；返回探索
 *   6. 在店裡切換畫質：流暢模式隱藏細小的擺飾、精緻模式顯示；店內仍顯示
 *   7. 走下樓梯回到迪化街：樓層 0、地面高度，鏡頭恢復街道上的距離
 *   8. 樓梯連續上下 5 次：每次都上得去、下得來，年代、服裝、音樂都沒有被重置，頁面沒有重新載入
 *   9. 在二樓切換到其他年代：人物回到一樓的街上、鏡頭不在建築裡、沒有小藝埕；切回「老屋新生」恢復，店內只有一份
 *  10. 沒有頁面錯誤
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/luguo.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 * CYCLES（樓梯連續上下的次數，預設 5）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ART_YARD, LUGUO_CAFE, artYardToWorld } from '../../src/data/luguoCafeLayout.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 5)
// 軟體繪圖（SwiftShader）每個影格可能要半秒以上，走路與等待的時間放寬
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)
const SHOP = 'luguo-cafe'
const NAME = '爐鍋咖啡'
const H2 = ART_YARD.floor2

/** 建築本地座標 → 世界座標（與遊戲相同的配置） */
const P = (x, z) => artYardToWorld(x, z)
const route = (points) => points.map(([x, z]) => P(x, z))
// 店內（二樓）的範圍
const CAFE_MIN = P(LUGUO_CAFE.minX, LUGUO_CAFE.minZ)
const CAFE_MAX = P(LUGUO_CAFE.maxX, LUGUO_CAFE.maxZ)
const inCafe = (c) => c.x > CAFE_MIN.x && c.x < CAFE_MAX.x && c.z > CAFE_MIN.z && c.z < CAFE_MAX.z

// 路線（建築本地座標，與 tests/luguo.test.js 相同）
const STREET = P(3.0, 3.6)
const TO_ARCADE = route([
  [3.0, 1.0],
  [3.1, -12.9],
  [3.95, -13.1],
])
const UP = route([
  [3.95, -14.52],
  [1.8, -14.52],
  [-2.4, -14.52],
  [-2.4, -13.1],
  [2.2, -13.1],
  [3.05, -13.1],
  [3.05, -11.2],
])
const TO_BAR = route([
  [0.4, -6.0],
  [-0.75, -1.0],
])
const TO_GACHA = route([
  [0.4, -6.0],
  [0.4, -9.6],
  [LUGUO_CAFE.gacha.x, LUGUO_CAFE.gacha.z + 0.95],
])
const TO_WINDOW = route([
  [0.4, -9.6],
  [1.4, -7.6],
])
const TO_DOOR = route([
  [0.6, -10.9],
  [3.05, -11.2],
])
const DOWN = route([
  [3.05, -13.1],
  [-2.4, -13.1],
  [-2.4, -14.52],
  [1.8, -14.52],
  [3.95, -14.52],
  [3.95, -13.1],
])
const TO_STREET = route([
  [3.1, -12.9],
  [3.0, 1.0],
  [3.0, 3.6],
])

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

async function shot(page, name) {
  if (!SHOTS) return
  mkdirSync(SHOTS, { recursive: true })
  await page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 240000 })
}

/** 目前的人物、鏡頭與店家狀態 */
function state(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const blockers = d.cameraScene.current.blockers
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const detail = d.scene?.getObjectByName('interior-luguo-cafe-detail')
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      level: d.playerState.level,
      cam: { x: c.x, y: c.y, z: c.z },
      camInside: blockers.some((b) => inBox(c, b)),
      indoor: d.indoor?.amount ?? 0,
      interior: d.interiors?.['luguo-cafe'] ?? null,
      market: d.interiors?.['yong-le-market'] ?? null,
      detailVisible: detail ? detail.visible : null,
      interiorCount: (() => {
        let n = 0
        d.scene?.traverse((o) => {
          if (o.name === 'interior-luguo-cafe') n++
        })
        return n
      })(),
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      activeHotspot: s.activeHotspotId,
      chapter: s.chapterIndex,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      quality: document.documentElement.dataset.quality,
      prompt: document.querySelector('.shop-prompt.is-visible .shop-prompt__name')?.textContent ?? null,
      viewer: d.viewer ? { phase: d.viewer.phase, yaw: d.viewer.yaw } : null,
    }
  })
}

/**
 * 每一影格記錄：鏡頭是否在遮擋方塊裡、鏡頭到人物胸口（人物所在的地板上方）之間是否被擋住、
 * 人物每一影格移動的距離與高度變化（樓梯上沒有傳送或跳上跳下）
 */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__lgSampler ?? 0)
    const samples = []
    window.__lgSamples = samples
    let last = -1
    let prev = null
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const rayBox = (o, dir, b) => {
      let tMin = 0
      let tMax = Infinity
      for (const [origin, v, min, max] of [
        [o.x, dir.x, b.minX, b.maxX],
        [o.y, dir.y, b.minY, b.maxY],
        [o.z, dir.z, b.minZ, b.maxZ],
      ]) {
        if (Math.abs(v) < 1e-8) {
          if (origin < min || origin > max) return null
          continue
        }
        let t1 = (min - origin) / v
        let t2 = (max - origin) / v
        if (t1 > t2) [t1, t2] = [t2, t1]
        tMin = Math.max(tMin, t1)
        tMax = Math.min(tMax, t2)
        if (tMin > tMax) return null
      }
      return tMin
    }
    const tick = () => {
      window.__lgSampler = requestAnimationFrame(tick)
      if (d.frameCount === last) return
      last = d.frameCount
      const s = d.useGameStore.getState()
      if (s.viewMode !== 'explore' || s.mode !== 'explore') {
        prev = null
        return
      }
      const c = d.camera.position
      const p = d.playerState.position
      const blockers = d.cameraScene.current.blockers
      const chest = { x: p.x, y: p.y + 1.45, z: p.z }
      const delta = { x: chest.x - c.x, y: chest.y - c.y, z: chest.z - c.z }
      const length = Math.hypot(delta.x, delta.y, delta.z)
      const dir = { x: delta.x / length, y: delta.y / length, z: delta.z / length }
      const blocked = blockers.some((b) => {
        const t = rayBox(c, dir, b)
        return t !== null && t < length - 0.05
      })
      const step = prev ? Math.hypot(p.x - prev.x, p.z - prev.z) : 0
      const rise = prev ? Math.abs(p.y - prev.y) : 0
      prev = { x: p.x, y: p.y, z: p.z }
      samples.push({ y: p.y, level: d.playerState.level, camY: c.y, indoor: d.indoor?.amount ?? 0, inside: blockers.some((b) => inBox(c, b)), blocked, step, rise })
    }
    tick()
  })
}

async function samplerStats(page) {
  return page.evaluate(() => {
    const samples = window.__lgSamples ?? []
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      blocked: samples.filter((item) => item.blocked).length,
      maxStep: samples.reduce((max, item) => Math.max(max, item.step), 0),
      maxRise: samples.reduce((max, item) => Math.max(max, item.rise), 0),
      maxY: samples.reduce((max, item) => Math.max(max, item.y), 0),
      levels: [...new Set(samples.map((item) => item.level))],
      maxCamY: samples.filter((item) => item.indoor > 0.99 && item.y > 3.9).reduce((max, item) => Math.max(max, item.camY), 0),
    }
  })
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
  const cdp = touch ? await context.newCDPSession(page) : null
  const touchSend = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })

  /** 按住前進：桌面是 W（run 時加 Shift），觸控是把搖桿推到底；回傳放開的函式 */
  const holdForward = async (run) => {
    if (touch) {
      const base = await page.locator('.joystick__base').boundingBox()
      const cx = base.x + base.width / 2
      const cy = base.y + base.height / 2
      await touchSend('touchStart', [{ x: cx, y: cy, id: 7 }])
      await touchSend('touchMove', [{ x: cx, y: cy - base.height * (run ? 1 : 0.27), id: 7 }])
      return () => touchSend('touchEnd', [])
    }
    if (run) await page.keyboard.down('ShiftLeft')
    await page.keyboard.down('KeyW')
    return async () => {
      await page.keyboard.up('KeyW')
      if (run) await page.keyboard.up('ShiftLeft')
    }
  }
  /** 等人物停下來（放開後還會減速滑行一小段）：連續兩個影格的位置幾乎不變 */
  const settle = () =>
    waitFor(
      page,
      () => {
        const d = window.__DDC__
        const p = d.playerState.position
        const now = { x: p.x, z: p.z, frame: d.frameCount }
        const prev = window.__lgSettle
        if (!prev || prev.frame === now.frame) {
          window.__lgSettle = prev ?? now
          return false
        }
        window.__lgSettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() =>
      page.evaluate(() => {
        window.__lgSettle = null
      }),
    )
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
  }
  /**
   * 沿著路線走：一直按住前進，每個影格把鏡頭轉到人物背後、朝向下一個路線點（像玩家用滑鼠或手指轉方向），
   * 走到路線點附近就換下一個。人物原地不動太久（卡住）就停下來回報。
   */
  const walk = async (points, { run = false, tolerance = 0.3 } = {}) => {
    await page.evaluate((points) => {
      window.__lgRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward(run)
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__lgRoute
        const p = d.playerState.position
        if (d.frameCount === r.frame) return false
        r.frame = d.frameCount
        let t = r.points[r.i]
        while (t && Math.hypot(t.x - p.x, t.z - p.z) < (r.i === r.points.length - 1 ? tolerance : tolerance + 0.15)) t = r.points[++r.i]
        if (!t) return true
        if (r.last && Math.hypot(p.x - r.last.x, p.z - r.last.z) < 0.004) r.still++
        else r.still = 0
        r.last = { x: p.x, z: p.z }
        if (r.still > 40) {
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
    const r = await page.evaluate(() => ({ i: window.__lgRoute.i, stuck: window.__lgRoute.stuck }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  const viewerSettled = () =>
    frames(3).then(() =>
      waitFor(
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
      ),
    )
  const storyOpen = () => waitFor(page, (name) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === name, NAME, 60000)
  const activeTab = () => page.evaluate(() => document.querySelector('.story__tab.is-active')?.textContent.replace(/^[壹貳參肆伍]/, '').trim() ?? null)
  const closeStory = async () => {
    await press(page.locator('.story__close'))
    await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})
    await frames(4)
  }

  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'luguo'
  })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)
  const mode = await page.evaluate(() => window.__DDC__.useGameStore.getState().qualityMode)
  record(test, `畫質為${quality === 'fine' ? '精緻' : '流暢'}`, mode === quality, mode)

  // 1. 店家名錄、按需載入、沒有大型提示
  await press(page.locator('.hud-menu__toggle'))
  const entry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: NAME }) })
  const listed = (await entry.count()) === 1 && (await entry.locator('.menu-shop__badge.is-open').count()) === 1
  record(test, '店家名錄有爐鍋咖啡（可以探索）', listed)
  if (await page.locator('#shop-menu-panel').isVisible()) await press(page.locator('.hud-menu__toggle'))
  await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  const start = await state(page)
  record(
    test,
    '在出發點（離小藝埕約 15 m）二樓的室內還沒有產生（按需載入）',
    start.interior && start.interior.requested === false && start.interior.loaded === false,
    `人物 (${round(start.x)}, ${round(start.z)})、室內 ${JSON.stringify(start.interior)}`,
  )
  const exploreDock = await page.evaluate(() => !!document.querySelector('.explore-dock, .explore-button, .explore-chip'))
  record(test, '右下角沒有「探索店家」大型提示', !exploreDock)

  // 2. 迪化街 → 騎樓 → 樓梯 → 二樓 → 吧檯前
  await page.evaluate(({ x, z }) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, z)
    d.playerState.level = 0
    d.cameraState.snap = true
  }, STREET)
  await frames(4)
  const street = await state(page)
  await shot(page, `${device}-street`)
  await startSampler(page)
  const arcade = await walk(TO_ARCADE, { run: true })
  const stairs = await walk(UP)
  const upper = await state(page)
  const bar = await walk(TO_BAR)
  await waitFor(page, () => (window.__DDC__.indoor?.amount ?? 0) > 0.99, null, 60000)
  await frames(3)
  const atBar = await state(page)
  const upStats = await samplerStats(page)
  record(
    test,
    touch ? '用搖桿從迪化街經過騎樓、走上兩段樓梯，穿過玻璃門走到吧檯前' : '用鍵盤從迪化街經過騎樓、走上兩段樓梯，穿過玻璃門走到吧檯前',
    arcade.ok && stairs.ok && bar.ok && atBar.level === 1 && Math.abs(atBar.y - H2) < 1e-6 && inCafe(atBar),
    `騎樓 ${arcade.ok ? '✓' : `卡在第 ${arcade.i} 點`}、樓梯 ${stairs.ok ? '✓' : `卡在第 ${stairs.i} 點`}、店內 ${bar.ok ? '✓' : `卡在第 ${bar.i} 點`}；人物 (${round(atBar.x)}, ${round(atBar.y)}, ${round(atBar.z)}) 樓層 ${atBar.level}`,
  )
  record(
    test,
    '上樓是連續的：沒有傳送，高度隨樓梯連續變化，上到二樓才換樓層',
    upStats.maxStep < 0.6 && upStats.maxRise < 0.35 && upStats.levels.includes(0) && upStats.levels.includes(1) && upper.level === 1,
    `每影格最多移動 ${round(upStats.maxStep)} m、高度變化 ${round(upStats.maxRise)} m；樓層 ${upStats.levels.join('→')}`,
  )
  record(
    test,
    '每一個影格：鏡頭不在牆、樓梯或天花板裡，看得到人物；二樓的鏡頭在天花板下',
    upStats.frames > 10 && upStats.inside === 0 && upStats.blocked <= Math.max(3, upStats.frames * 0.05) && upStats.maxCamY < ART_YARD.ceiling2 - 0.3,
    `${upStats.frames} 個影格：在方塊裡 ${upStats.inside}、視線被擋 ${upStats.blocked}、二樓鏡頭最高 ${round(upStats.maxCamY)} m`,
  )
  record(
    test,
    '鏡頭切換成室內鏡頭（拉近）；接近時產生並顯示二樓的室內',
    atBar.indoor > 0.99 && street.cam.y - street.y > atBar.cam.y - atBar.y && atBar.interior?.loaded === true && atBar.interior?.visible === true,
    `街上鏡頭比人物高 ${round(street.cam.y - street.y)} m → 店內 ${round(atBar.cam.y - atBar.y)} m；室內 ${JSON.stringify(atBar.interior)}`,
  )
  record(
    test,
    '在二樓時不繪製永樂市場的室內（看不到，省下 iPad 的繪製量）',
    !atBar.market || atBar.market.visible === false,
    `永樂市場室內 ${JSON.stringify(atBar.market)}`,
  )
  await shot(page, `${device}-bar`)

  // 3. 吧檯熱點 → 按 E／點提示 → 「咖啡製作與飲食文化」
  record(test, '吧檯前的提示是資訊熱點「咖啡吧檯」', atBar.nearby === SHOP && atBar.hotspot === 'bar' && atBar.prompt === '咖啡吧檯', `附近 ${atBar.nearby}／${atBar.hotspot}、提示「${atBar.prompt}」`)
  if (touch) await page.locator('.shop-prompt.is-visible .shop-prompt__card').tap()
  else await page.keyboard.press('KeyE')
  const opened = await storyOpen()
  const tabs = await page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆伍]/, '').trim()))
  const barTab = await activeTab()
  record(
    test,
    touch ? '點提示開啟介紹，從「咖啡製作」章節開始' : '按 E 開啟介紹，從「咖啡製作」章節開始',
    opened && tabs.length === 5 && barTab === tabs[3],
    `章節 ${tabs.join('、')}；目前 ${barTab}`,
  )
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
  record(test, '咖啡製作：咖啡豆、手沖、義式濃縮、冰滴、冷萃（五張圖鑑）', foods && foodNames.join('、') === '咖啡豆、手沖咖啡、義式濃縮、冰滴咖啡、冷萃咖啡', foodNames.join('、'))
  const storyCam = await state(page)
  record(test, '介紹的鏡頭在店裡、不在牆裡', inCafe(storyCam.cam) && !storyCam.camInside && storyCam.cam.y > H2, `鏡頭 (${round(storyCam.cam.x)}, ${round(storyCam.cam.y)}, ${round(storyCam.cam.z)})`)
  await shot(page, `${device}-story-coffee`)
  await press(page.locator('.story__tab').nth(4))
  const sources = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '參考文獻：每一筆都有可以點開的網址', sources >= 12, `${sources} 筆`)
  await closeStory()
  const closed = await state(page)
  record(test, '關閉介紹後仍站在吧檯前（二樓）', closed.mode === 'explore' && closed.level === 1 && Math.hypot(closed.x - atBar.x, closed.z - atBar.z) < 0.05)

  // 4. 紅色扭蛋機與窗邊座位
  const toGacha = await walk(TO_GACHA)
  await frames(3)
  const atGacha = await state(page)
  record(test, '走到紅色扭蛋機前：提示「紅色扭蛋機」', toGacha.ok && atGacha.hotspot === 'gacha' && atGacha.prompt === '紅色扭蛋機', `人物 (${round(atGacha.x)}, ${round(atGacha.z)})、提示「${atGacha.prompt}」`)
  // 鏡頭朝向扭蛋機，點扭蛋機本身
  await page.evaluate(() => {
    const d = window.__DDC__
    d.cameraState.targetYaw = d.cameraState.yaw = 0
  })
  await frames(6)
  const gachaPoint = await page.evaluate((y) => window.__DDC__.facadeScreenPoint('luguo-gacha', y), H2 + 1.0)
  if (gachaPoint?.inView) {
    if (touch) await page.touchscreen.tap(gachaPoint.x, gachaPoint.y)
    else await page.mouse.click(gachaPoint.x, gachaPoint.y)
  }
  const gachaOpened = await storyOpen()
  const gachaState = await state(page)
  const gachaTab = await activeTab()
  record(
    test,
    touch ? '點扭蛋機：開啟「咖啡製作」章節（只有介紹，沒有付費或抽獎）' : '用滑鼠點扭蛋機：開啟「咖啡製作」章節（只有介紹，沒有付費或抽獎）',
    Boolean(gachaPoint?.inView) && gachaOpened && gachaState.activeHotspot === 'gacha' && gachaTab === tabs[3],
    `點在 (${round(gachaPoint?.x ?? 0)}, ${round(gachaPoint?.y ?? 0)})；熱點 ${gachaState.activeHotspot}、章節 ${gachaTab}`,
  )
  await shot(page, `${device}-story-gacha`)
  if (gachaOpened) await closeStory()
  const toWindow = await walk(TO_WINDOW)
  await frames(3)
  const atWindow = await state(page)
  if (touch) await page.locator('.shop-prompt.is-visible .shop-prompt__card').tap().catch(() => {})
  else await page.keyboard.press('KeyE')
  const windowOpened = await storyOpen()
  const windowTab = await activeTab()
  record(
    test,
    '走到窗邊座位：提示「窗邊座位」，開啟「小藝埕」章節',
    toWindow.ok && atWindow.hotspot === 'window' && windowOpened && windowTab === tabs[1],
    `提示「${atWindow.prompt}」、章節 ${windowTab}`,
  )
  if (windowOpened) await closeStory()

  // 5. 建築觀賞模式在店內
  const beforeViewer = await state(page)
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  const entered = await viewerSettled()
  const viewerIn = await state(page)
  const inRoom = (s) => inCafe(s.cam) && s.cam.y > H2 + 0.2 && s.cam.y < ART_YARD.ceiling2 && !s.camInside
  record(
    test,
    '在店裡進入觀賞模式：鏡頭在店內、二樓地板與天花之間、不在牆裡',
    entered && inRoom(viewerIn),
    `鏡頭 (${round(viewerIn.cam.x)}, ${round(viewerIn.cam.y)}, ${round(viewerIn.cam.z)})`,
  )
  const size = page.viewportSize()
  if (touch) {
    const y = size.height * 0.45
    await touchSend('touchStart', [{ x: size.width * 0.62, y, id: 3 }])
    for (let i = 1; i <= 6; i++) await touchSend('touchMove', [{ x: size.width * 0.62 - i * 32, y, id: 3 }])
    await touchSend('touchEnd', [])
  } else {
    await page.mouse.move(size.width * 0.62, size.height * 0.45)
    await page.mouse.down()
    await page.mouse.move(size.width * 0.42, size.height * 0.45, { steps: 6 })
    await page.mouse.up()
  }
  const rotated = await viewerSettled()
  const viewerTurned = await state(page)
  record(
    test,
    touch ? '觀賞模式在店內單指旋轉：鏡頭仍在店裡、不在牆、地板或天花裡' : '觀賞模式在店內拖曳旋轉：鏡頭仍在店裡、不在牆、地板或天花裡',
    rotated && Math.abs(viewerTurned.viewer.yaw - viewerIn.viewer.yaw) > 0.1 && inRoom(viewerTurned),
    `yaw ${round(viewerIn.viewer.yaw)} → ${round(viewerTurned.viewer.yaw)}、鏡頭高 ${round(viewerTurned.cam.y)} m`,
  )
  await shot(page, `${device}-viewer-inside`)
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator(`[data-focus-shop="${SHOP}"]`))
  const focused = await viewerSettled()
  const facade = await state(page)
  record(
    test,
    '觀賞模式從店家名錄聚焦小藝埕：鏡頭在迪化街上看轉角塔樓、不在牆裡',
    focused && facade.cam.z > P(0, ART_YARD.front).z && !facade.camInside,
    `鏡頭 (${round(facade.cam.x)}, ${round(facade.cam.y)}, ${round(facade.cam.z)})`,
  )
  await shot(page, `${device}-viewer-facade`)
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(
    test,
    '返回探索：人物還在二樓的同一個位置，鏡頭回到人物身邊、不在牆裡',
    back && returned.level === 1 && Math.hypot(returned.x - beforeViewer.x, returned.z - beforeViewer.z) < 0.05 && !returned.camInside && inCafe(returned.cam),
    `人物 (${round(returned.x)}, ${round(returned.y)}, ${round(returned.z)})、鏡頭 (${round(returned.cam.x)}, ${round(returned.cam.y)}, ${round(returned.cam.z)})`,
  )

  // 6. 在店裡切換畫質：流暢模式隱藏細小的擺飾
  await press(page.locator('.hud-quality__toggle'))
  await page.waitForSelector('#quality-panel')
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && s.detailVisible === (target === 'fine') && !s.camInside)
    console.log(`    畫質 → ${target}：${applied ? '已套用' : '未套用'}，室內 ${JSON.stringify(s.interior)}、細小擺飾 ${s.detailVisible ? '顯示' : '隱藏'}`)
  }
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForSelector('#quality-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  record(test, '在店裡切換畫質：流暢模式隱藏細小的擺飾、精緻模式顯示，店內仍顯示', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 7. 走下樓梯，回到迪化街
  await startSampler(page)
  const toDoor = await walk(TO_DOOR)
  const down = await walk(DOWN)
  const out = await walk(TO_STREET, { run: true })
  await frames(8)
  const outside = await state(page)
  const downStats = await samplerStats(page)
  record(
    test,
    '走下兩段樓梯、經過騎樓，回到迪化街（一樓、地面）',
    toDoor.ok && down.ok && out.ok && outside.level === 0 && outside.y === 0 && Math.hypot(outside.x - STREET.x, outside.z - STREET.z) < 0.6,
    `人物 (${round(outside.x)}, ${round(outside.y)}, ${round(outside.z)}) 樓層 ${outside.level}`,
  )
  record(
    test,
    '下樓時鏡頭沒有進到牆或天花板裡，回到街上恢復街道上的距離',
    outside.indoor < 0.5 && downStats.inside === 0 && downStats.blocked <= Math.max(3, downStats.frames * 0.05) && downStats.maxStep < 0.6 && downStats.maxRise < 0.35,
    `室內混合 ${round(outside.indoor)}、${downStats.frames} 個影格中在方塊裡 ${downStats.inside}、視線被擋 ${downStats.blocked}`,
  )
  await shot(page, `${device}-back-on-street`)

  // 8. 樓梯連續上下 5 次（從巷子側的騎樓到二樓的玻璃門）
  const before = await page.evaluate(() => ({
    era: window.__DDC__.useGameStore.getState().eraId,
    outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
    music: window.__DDC__.audioManager?.inspect() ?? null,
  }))
  await walk(TO_ARCADE, { run: true })
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk(UP)
    const sa = await state(page)
    const b = await walk(DOWN)
    const sb = await state(page)
    const ok = a.ok && b.ok && sa.level === 1 && Math.abs(sa.y - H2) < 1e-6 && sb.level === 0 && sb.y === 0 && !sa.camInside && !sb.camInside && sa.era === 'revival'
    cycles.push(ok)
    console.log(
      `    第 ${i + 1} 次：上 (${round(sa.x)}, ${round(sa.y)}, ${round(sa.z)}) 樓層 ${sa.level}${a.ok ? '' : `（卡在第 ${a.i} 點）`}；下 (${round(sb.x)}, ${round(sb.y)}, ${round(sb.z)}) 樓層 ${sb.level}${b.ok ? '' : `（卡在第 ${b.i} 點）`}${ok ? '' : '（失敗）'}`,
    )
  }
  const cycleStats = await samplerStats(page)
  const after = await page.evaluate(() => ({
    era: window.__DDC__.useGameStore.getState().eraId,
    outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
    music: window.__DDC__.audioManager?.inspect() ?? null,
    noReload: window.__noReload,
  }))
  record(
    test,
    `樓梯連續上下 ${CYCLES} 次都正常`,
    cycles.length === CYCLES && cycles.every(Boolean) && cycleStats.inside === 0 && cycleStats.blocked <= Math.max(3, cycleStats.frames * 0.05) && cycleStats.maxStep < 0.6 && cycleStats.maxRise < 0.35,
    `${cycles.filter(Boolean).length}/${CYCLES} 次、${cycleStats.frames} 個影格中鏡頭在方塊裡 ${cycleStats.inside}、視線被擋 ${cycleStats.blocked}`,
  )
  const musicKept =
    !before.music ||
    (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount && after.music.status === before.music.status)
  record(
    test,
    '上下樓不重置年代、服裝與音樂，也沒有重新載入頁面',
    after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'luguo',
    `年代 ${after.era}、服裝 ${after.outfit}、音樂 ${after.music?.status ?? '無'}（播放 ${after.music?.startedCount ?? 0} 次）`,
  )

  // 9. 在二樓切換年代
  await walk(UP)
  const upstairs = await state(page)
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-era-option="modern"]'))
  const modern = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'modern', null, TRANSITION_TIMEOUT)
  await frames(6)
  const moved = await state(page)
  const gone = await page.evaluate(() => !window.__DDC__.cameraScene.current.buildings.some((b) => b.storeId === 'luguo-cafe' || /luguo/.test(b.id)))
  record(
    test,
    '在二樓切換到摩登年代：人物回到一樓的街上、鏡頭不在建築裡、沒有小藝埕',
    upstairs.level === 1 && modern && moved.level === 0 && moved.y === 0 && moved.z > -3 && !moved.camInside && gone && moved.interiorCount === 0,
    `人物 (${round(moved.x)}, ${round(moved.y)}, ${round(moved.z)}) 樓層 ${moved.level}、鏡頭 (${round(moved.cam.x)}, ${round(moved.cam.y)}, ${round(moved.cam.z)})`,
  )
  await press(page.locator('[data-era-option="revival"]'))
  const revival = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'revival', null, TRANSITION_TIMEOUT)
  await frames(6)
  const restored = await state(page)
  const rebuilt = await page.evaluate(() => window.__DDC__.cameraScene.current.buildings.some((b) => b.storeId === 'luguo-cafe'))
  record(
    test,
    '切回老屋新生：小藝埕恢復，人物在一樓的街上，店內只有一份',
    revival && rebuilt && restored.level === 0 && restored.y === 0 && restored.interiorCount <= 1 && !restored.camInside,
    `人物 (${round(restored.x)}, ${round(restored.z)}) 樓層 ${restored.level}、店內 ${restored.interiorCount} 份`,
  )
  await page.keyboard.press('Escape').catch(() => {})

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
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
