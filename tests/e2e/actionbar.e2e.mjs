/**
 * 導演的豆花店 Action! Bar 的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD＋Shift、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 店家名錄有導演的豆花店；一開始（離店很遠）店內細部還沒有產生；右下角沒有大型「探索店家」提示
 *   2. 迪化街 → 走進224巷 → 穿過騎樓與大門 → 走到豆花櫃台前：鏡頭平滑切換成店內鏡頭，
 *      走路的每一個影格鏡頭都不在牆或天花板裡，看得到人物；店內細部在接近時產生並顯示
 *   3. 點擊豆花櫃台開啟介紹 → 五個章節 → 「一碗豆花」五張食物圖鑑 → 關閉後仍站在櫃台前
 *   4. 建築觀賞模式在店內：鏡頭在店裡、天花板下；旋轉；點櫃台近距離聚焦豆花；
 *      從店家名錄聚焦店面（鏡頭在巷子裡）；返回探索
 *   5. 在店裡切換畫質（流暢 ↔ 精緻）：設定套用、店內仍顯示、沒有錯誤
 *   6. 走出店、走出巷子，回到迪化街
 *   7. 連續進出 5 次：每次都走得進去、走得出來，年代、服裝、音樂都沒有被重置，頁面沒有重新載入
 *   8. 在店裡切換到其他年代：人物移到街上、鏡頭不在建築裡、沒有豆花店；切回「老屋新生」恢復
 *   9. 沒有頁面錯誤
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/actionbar.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 * CYCLES（連續進出的次數，預設 5）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 5)
// 軟體繪圖（SwiftShader）每個影格可能要半秒以上，走路與等待的時間放寬
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 240000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)
const SHOP = 'action-bar'
const NAME = '導演的豆花店 Action! Bar'

// 世界座標（見 builders/actionBar.js）：巷口在 x 22.9、迪化街南側；巷子往南（+z），店在巷子東側
const LANE_X = 22.9
const DOOR_Z = 23.2
const ZONE = { minX: 28.4, maxX: 35.2, minZ: 20.5, maxZ: 26.1 }
const LANE = { minX: 19.4, maxX: 26.4, minZ: 4.5, maxZ: 29.5 }
const inShop = (c) => c.x > ZONE.minX && c.x < ZONE.maxX && c.z > ZONE.minZ && c.z < ZONE.maxZ
const inLane = (c) => c.x > LANE.minX && c.x < LANE.maxX && c.z > LANE.minZ && c.z < LANE.maxZ

// 鏡頭的方位角：鏡頭在人物的哪一側（前進的方向是反方向）
const YAW = { south: Math.PI, east: -Math.PI / 2, west: Math.PI / 2, north: 0 }

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
    return {
      x: p.x,
      z: p.z,
      cam: { x: c.x, y: c.y, z: c.z },
      camInside: blockers.some((b) => inBox(c, b)),
      indoor: d.indoor?.amount ?? 0,
      interior: d.interiors?.['action-bar'] ?? null,
      market: d.interiors?.['yong-le-market'] ?? null,
      nearby: s.nearbyShopId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      quality: document.documentElement.dataset.quality,
      viewer: d.viewer ? { phase: d.viewer.phase, yaw: d.viewer.yaw } : null,
    }
  })
}

/** 每一影格記錄鏡頭：是否在遮擋方塊裡、鏡頭到人物胸口之間是否被擋住、鏡頭高度與店內混合程度 */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__abSampler ?? 0)
    const samples = []
    window.__abSamples = samples
    let last = -1
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
      window.__abSampler = requestAnimationFrame(tick)
      if (d.frameCount === last) return
      last = d.frameCount
      const s = d.useGameStore.getState()
      if (s.viewMode !== 'explore' || s.mode !== 'explore') return
      const c = d.camera.position
      const p = d.playerState.position
      const blockers = d.cameraScene.current.blockers
      const chest = { x: p.x, y: 1.45, z: p.z }
      const delta = { x: chest.x - c.x, y: chest.y - c.y, z: chest.z - c.z }
      const length = Math.hypot(delta.x, delta.y, delta.z)
      const dir = { x: delta.x / length, y: delta.y / length, z: delta.z / length }
      const blocked = blockers.some((b) => {
        const t = rayBox(c, dir, b)
        return t !== null && t < length - 0.05
      })
      samples.push({ x: p.x, y: c.y, indoor: d.indoor?.amount ?? 0, inside: blockers.some((b) => inBox(c, b)), blocked })
    }
    tick()
  })
}

async function samplerStats(page) {
  return page.evaluate(() => {
    const samples = window.__abSamples ?? []
    const indoor = samples.filter((item) => item.indoor > 0.99)
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      blocked: samples.filter((item) => item.blocked).length,
      maxIndoorY: indoor.reduce((max, item) => Math.max(max, item.y), 0),
      maxIndoor: samples.reduce((max, item) => Math.max(max, item.indoor), 0),
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

  /** 按住前進（桌面：Shift＋W；觸控：搖桿推到底）直到條件成立 */
  const hold = async (until, arg) => {
    let release
    if (touch) {
      const base = await page.locator('.joystick__base').boundingBox()
      const cx = base.x + base.width / 2
      const cy = base.y + base.height / 2
      await touchSend('touchStart', [{ x: cx, y: cy, id: 7 }])
      await touchSend('touchMove', [{ x: cx, y: cy - base.height, id: 7 }])
      release = () => touchSend('touchEnd', [])
    } else {
      await page.keyboard.down('ShiftLeft')
      await page.keyboard.down('KeyW')
      release = async () => {
        await page.keyboard.up('KeyW')
        await page.keyboard.up('ShiftLeft')
      }
    }
    // 每個影格檢查一次，條件成立的那個影格就放開（畫面更新率高時也不會衝過轉角）
    const reached = await waitFor(page, until, arg, WALK_TIMEOUT, 'raf')
    await release()
    return reached
  }
  /** 等人物停下來（放開按鍵或搖桿後還會減速滑行一小段）：連續兩個影格的位置幾乎不變 */
  const settle = () =>
    waitFor(
      page,
      () => {
        const d = window.__DDC__
        const p = d.playerState.position
        const now = { x: p.x, z: p.z, frame: d.frameCount }
        const prev = window.__abSettle
        if (!prev || prev.frame === now.frame) {
          window.__abSettle = prev ?? now
          return false
        }
        window.__abSettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() =>
      page.evaluate(() => {
        window.__abSettle = null
      }),
    )
  /**
   * 轉彎前對準：巷子的轉角是直角、大門只有約 1.4 公尺寬，停下來的位置會因為畫面更新率而差幾十公分；
   * 把人物移到轉角的中線上（回傳移動的距離，太遠表示其實沒有走到轉角）
   */
  const align = (axis, value) =>
    page.evaluate(
      ({ axis, value }) => {
        const d = window.__DDC__
        const p = d.playerState.position
        const moved = Math.abs(p[axis] - value)
        p[axis] = value
        d.playerState.velocity.set(0, 0, 0)
        return moved
      },
      { axis, value },
    )
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
  }
  /** 鏡頭轉到人物的另一側，前進就是往 heading 的方向走（巷子、大門都是直角轉彎） */
  const face = async (heading) => {
    const yaw = { south: YAW.south, east: YAW.east, west: YAW.west, north: YAW.north }[heading]
    await page.evaluate((y) => {
      const d = window.__DDC__
      d.cameraState.targetYaw = d.cameraState.yaw = y
    }, yaw)
    await frames(2)
  }
  /** 從迪化街走進巷子、穿過大門走到櫃台前 */
  const walkIn = async () => {
    await face('south')
    // 放開後還會減速滑行約 0.3–0.4 公尺：提早一點放開，停下來的位置才會在大門的中線附近
    const reached = await hold((z) => window.__DDC__.playerState.position.z > z, DOOR_Z - 0.45)
    await settle()
    const a = await state(page)
    const correction = await align('z', DOOR_Z)
    await face('east')
    const shop = await hold(() => {
      const d = window.__DDC__
      return d.playerState.position.x > 31.0 && d.useGameStore.getState().nearbyShopId === 'action-bar'
    })
    await settle()
    return { lane: reached && correction < 0.8, shop, laneState: a, correction }
  }
  /** 從店裡走回巷子、走回迪化街 */
  const walkOut = async () => {
    await face('west')
    const reached = await hold((x) => window.__DDC__.playerState.position.x < x, LANE_X + 0.5)
    await settle()
    const correction = await align('x', LANE_X)
    await face('north')
    const street = await hold(() => window.__DDC__.playerState.position.z < 1.6)
    await settle()
    return { lane: reached && correction < 0.8, street, correction }
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

  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'action-bar'
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
  record(test, '店家名錄有導演的豆花店（可以探索）', listed)
  if (await page.locator('#shop-menu-panel').isVisible()) await press(page.locator('.hud-menu__toggle'))
  await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  const start = await state(page)
  record(
    test,
    '離店很遠時，店內細部還沒有產生（按需載入）',
    start.interior && start.interior.requested === false && start.interior.loaded === false,
    `人物 (${round(start.x)}, ${round(start.z)})、店內 ${JSON.stringify(start.interior)}`,
  )
  const exploreDock = await page.evaluate(() => !!document.querySelector('.explore-dock, .explore-button, .explore-chip'))
  record(test, '右下角沒有「探索店家」大型提示', !exploreDock)

  // 2. 迪化街 → 224巷 → 大門 → 豆花櫃台前
  await page.evaluate((x) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, 0.6)
    d.cameraState.snap = true
  }, LANE_X)
  await frames(4)
  const street = await state(page)
  await startSampler(page)
  const first = await walkIn()
  // 店只有約 4 公尺深：走到櫃台時鏡頭可能還在平滑過渡，等它完成（取樣持續記錄）
  await waitFor(page, () => (window.__DDC__.indoor?.amount ?? 0) > 0.99, null, 60000)
  await frames(3)
  const inside = await state(page)
  const walkStats = await samplerStats(page)
  record(
    test,
    touch ? '用搖桿從迪化街走進224巷、穿過大門，走到豆花櫃台前' : '用鍵盤從迪化街走進224巷、穿過大門，走到豆花櫃台前',
    first.lane && first.shop && inLane(first.laneState) && inShop(inside),
    `巷子 (${round(first.laneState.x)}, ${round(first.laneState.z)}) → 店裡 (${round(inside.x)}, ${round(inside.z)})、附近 ${inside.nearby}`,
  )
  record(
    test,
    '鏡頭平滑切換成店內鏡頭（拉近、壓低）',
    walkStats.maxIndoor > 0.99 && inside.indoor > 0.99 && street.cam.y > inside.cam.y + 0.8 && walkStats.maxIndoorY <= 2.6,
    `街上鏡頭高 ${round(street.cam.y)} m → 店內 ${round(inside.cam.y)} m、店內最高 ${round(walkStats.maxIndoorY)} m`,
  )
  record(
    test,
    '走路的每一個影格：鏡頭不在牆或天花板裡，看得到人物',
    walkStats.frames > 10 && walkStats.inside === 0 && walkStats.blocked <= Math.max(2, walkStats.frames * 0.05),
    `${walkStats.frames} 個影格：在方塊裡 ${walkStats.inside}、視線被擋 ${walkStats.blocked}`,
  )
  record(test, '接近時產生並顯示店內細部', inside.interior?.loaded === true && inside.interior?.visible === true, JSON.stringify(inside.interior))
  await shot(page, `${device}-inside`)

  // 3. 點豆花櫃台 → 介紹 → 一碗豆花 → 關閉
  await page.waitForTimeout(1500)
  const point = await page.evaluate(() => window.__DDC__.facadeScreenPoint('action-bar-douhua', 1.1))
  if (touch) await page.touchscreen.tap(point.x, point.y)
  else await page.mouse.click(point.x, point.y)
  const opened = await waitFor(page, (name) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === name, NAME, 60000)
  record(test, touch ? '在櫃台前點豆花櫃台，開啟介紹' : '在櫃台前用滑鼠點豆花櫃台，開啟介紹', opened, `點在 (${round(point.x)}, ${round(point.y)})`)
  const tabs = await page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆伍]/, '').trim()))
  record(test, '五個章節：豆花車、夢想基地、一碗豆花、影像記錄、參考文獻', tabs.join('、') === '豆花車、夢想基地、一碗豆花、影像記錄、參考文獻', tabs.join('、'))
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
  record(test, '一碗豆花：傳統豆花、麥芽糖水、地瓜粉圓、粉粿、紅豆・綠豆（五張圖鑑）', foods && foodNames.join('、') === '傳統豆花、麥芽糖水、地瓜粉圓、粉粿、紅豆・綠豆', foodNames.join('、'))
  const storyCam = await state(page)
  record(test, '介紹的鏡頭在店裡、不在牆裡', inShop(storyCam.cam) && !storyCam.camInside, `鏡頭 (${round(storyCam.cam.x)}, ${round(storyCam.cam.y)}, ${round(storyCam.cam.z)})`)
  await shot(page, `${device}-story-foods`)
  await press(page.locator('.story__tab').nth(4))
  const sources = await page.$$eval('.chapter a[href^="https://"]', (items) => items.length)
  record(test, '參考文獻：每一筆都有可以點開的網址', sources >= 8, `${sources} 筆`)
  await press(page.locator('.story__close'))
  await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})
  await frames(4)
  const closed = await state(page)
  record(
    test,
    '關閉介紹後仍站在櫃台前',
    closed.mode === 'explore' && Math.hypot(closed.x - inside.x, closed.z - inside.z) < 0.05 && closed.nearby === SHOP,
    `人物 (${round(closed.x)}, ${round(closed.z)})`,
  )

  // 4. 建築觀賞模式在店內
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  const entered = await viewerSettled()
  const viewerIn = await state(page)
  record(
    test,
    '在店裡進入觀賞模式：鏡頭在店內、天花板下、不在牆裡',
    entered && inShop(viewerIn.cam) && viewerIn.cam.y < 3.0 && !viewerIn.camInside,
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
    touch ? '觀賞模式在店內單指旋轉：鏡頭仍在天花板下、不在牆裡' : '觀賞模式在店內拖曳旋轉：鏡頭仍在天花板下、不在牆裡',
    rotated && Math.abs(viewerTurned.viewer.yaw - viewerIn.viewer.yaw) > 0.1 && inShop(viewerTurned.cam) && viewerTurned.cam.y < 3.0 && !viewerTurned.camInside,
    `yaw ${round(viewerIn.viewer.yaw)} → ${round(viewerTurned.viewer.yaw)}、鏡頭高 ${round(viewerTurned.cam.y)} m`,
  )
  // 點櫃台：近距離聚焦豆花
  await page.evaluate(() => {
    const d = window.__DDC__
    d.viewer.goalYaw = d.viewer.yaw = -Math.PI / 2
  })
  await viewerSettled()
  const counterPoint = await page.evaluate(() => window.__DDC__.facadeScreenPoint('action-bar-douhua', 1.1))
  if (counterPoint?.inView) {
    if (touch) await page.touchscreen.tap(counterPoint.x, counterPoint.y)
    else await page.mouse.click(counterPoint.x, counterPoint.y)
  }
  const nearSettled = await viewerSettled()
  const near = await state(page)
  const nearDistance = Math.hypot(near.cam.x - 32.4, near.cam.z - 23.45)
  record(
    test,
    '觀賞模式點豆花櫃台：鏡頭在店裡近距離看豆花',
    Boolean(counterPoint?.inView) && nearSettled && inShop(near.cam) && nearDistance < 2.8 && !near.camInside,
    `鏡頭 (${round(near.cam.x)}, ${round(near.cam.y)}, ${round(near.cam.z)})、距櫃台 ${round(nearDistance)} m`,
  )
  await shot(page, `${device}-viewer-counter`)
  // 從店家名錄聚焦店面：鏡頭在巷子裡
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator(`[data-focus-shop="${SHOP}"]`))
  const focused = await viewerSettled()
  const facade = await state(page)
  record(
    test,
    '觀賞模式聚焦店面：鏡頭在巷子裡、不在牆裡',
    focused && inLane(facade.cam) && !facade.camInside,
    `鏡頭 (${round(facade.cam.x)}, ${round(facade.cam.y)}, ${round(facade.cam.z)})`,
  )
  await shot(page, `${device}-viewer-facade`)
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(
    test,
    '返回探索：人物還在櫃台前，鏡頭回到人物身邊、不在牆裡',
    back && Math.hypot(returned.x - inside.x, returned.z - inside.z) < 0.05 && !returned.camInside && inShop(returned.cam),
    `鏡頭 (${round(returned.cam.x)}, ${round(returned.cam.y)}, ${round(returned.cam.z)})`,
  )

  // 5. 在店裡切換畫質
  await press(page.locator('.hud-quality__toggle'))
  await page.waitForSelector('#quality-panel')
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && !s.camInside)
    console.log(`    畫質 → ${target}：${applied ? '已套用' : '未套用'}，店內 ${JSON.stringify(s.interior)}`)
  }
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForSelector('#quality-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  record(test, '在店裡切換畫質（流暢 ↔ 精緻）：設定套用、店內仍顯示', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 6. 走出店與巷子
  await startSampler(page)
  const out = await walkOut()
  await frames(8)
  const outside = await state(page)
  const outStats = await samplerStats(page)
  record(test, '走出店、走出巷子，回到迪化街上', out.lane && out.street && outside.z < 2 && Math.abs(outside.x - LANE_X) < 1, `人物 (${round(outside.x)}, ${round(outside.z)})`)
  record(
    test,
    '走出去時鏡頭恢復街道上的距離，而且沒有進到牆或天花板裡',
    outside.indoor < 0.5 && outStats.inside === 0 && outStats.blocked <= Math.max(2, outStats.frames * 0.05),
    `店內混合 ${round(outside.indoor)}、鏡頭高 ${round(outside.cam.y)} m、${outStats.frames} 個影格中視線被擋 ${outStats.blocked}`,
  )

  // 7. 連續進出 5 次
  const before = await page.evaluate(() => ({
    era: window.__DDC__.useGameStore.getState().eraId,
    outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
    music: window.__DDC__.audioManager?.inspect() ?? null,
  }))
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walkIn()
    await frames(2)
    const sa = await state(page)
    const b = await walkOut()
    await frames(2)
    const sb = await state(page)
    const ok = a.lane && a.shop && b.lane && b.street && inShop(sa) && sa.indoor > 0.8 && !sa.camInside && !sb.camInside && sb.z < 2 && sa.era === 'revival' && sb.era === 'revival'
    cycles.push(ok)
    console.log(
      `    第 ${i + 1} 次：進 (${round(sa.x)}, ${round(sa.z)}) 店內 ${round(sa.indoor)}（轉角對準 ${round(a.correction)} m）；出 (${round(sb.x)}, ${round(sb.z)})（對準 ${round(b.correction)} m）${ok ? '' : '（失敗）'}`,
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
    `連續進出店 ${CYCLES} 次都正常`,
    cycles.length === CYCLES && cycles.every(Boolean) && cycleStats.inside === 0 && cycleStats.blocked <= Math.max(3, cycleStats.frames * 0.05),
    `${cycles.filter(Boolean).length}/${CYCLES} 次、${cycleStats.frames} 個影格中鏡頭在方塊裡 ${cycleStats.inside}、視線被擋 ${cycleStats.blocked}`,
  )
  const musicKept =
    !before.music ||
    (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount && after.music.status === before.music.status)
  record(
    test,
    '進出店不重置年代、服裝與音樂，也沒有重新載入頁面',
    after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'action-bar',
    `年代 ${after.era}、服裝 ${after.outfit}、音樂 ${after.music?.status ?? '無'}（播放 ${after.music?.startedCount ?? 0} 次）`,
  )

  // 8. 在店裡切換年代
  await walkIn()
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-era-option="modern"]'))
  const modern = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'modern', null, TRANSITION_TIMEOUT)
  await frames(6)
  const moved = await state(page)
  const gone = await page.evaluate(() => !window.__DDC__.cameraScene.current.buildings.some((b) => b.storeId === 'action-bar' || /action-bar/.test(b.id)))
  record(
    test,
    '在店裡切換到摩登年代：人物移到街上、鏡頭不在建築裡、沒有豆花店',
    modern && moved.z < 10.5 && !moved.camInside && gone,
    `人物 (${round(moved.x)}, ${round(moved.z)})、鏡頭 (${round(moved.cam.x)}, ${round(moved.cam.y)}, ${round(moved.cam.z)})`,
  )
  await press(page.locator('[data-era-option="revival"]'))
  const revival = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'revival', null, TRANSITION_TIMEOUT)
  const restored = await page.evaluate(() => window.__DDC__.cameraScene.current.buildings.some((b) => b.storeId === 'action-bar'))
  record(test, '切回老屋新生：豆花店恢復', revival && restored)
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
