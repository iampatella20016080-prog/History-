/**
 * 永樂市場與好粿緣的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD＋Shift、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 店家名錄有永樂市場與好粿緣；一開始（離市場很遠）室內細部還沒有產生
 *   2. 街道 → 市場入口 → 走進市場 → 走到好粿緣前：鏡頭平滑切換成室內鏡頭（拉近、壓低），
 *      走路的每一個影格鏡頭都不在牆、天花板或攤位裡，看得到人物；室內細部在接近時產生並顯示
 *   3. 點擊攤位開啟介紹 → 閱讀「代表食品」（四張食物圖鑑）→ 關閉後仍站在攤位前
 *   4. 建築觀賞模式在室內：鏡頭在走道上、天花板下；旋轉、聚焦好粿緣；返回探索
 *   5. 沿原路走出市場，回到街上（鏡頭恢復街道上的距離）
 *   6. 連續進出市場 5 次：每次都走得進去、走得出來，年代、服裝、音樂都沒有被重置，頁面沒有重新載入
 *   7. 在市場裡切換年代：人物回到街上、鏡頭不在建築裡；切回「老屋新生」市場恢復
 *   8. 沒有頁面錯誤
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/yongle.e2e.mjs http://127.0.0.1:5173/
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
const STALL = 'hao-guo-yuan'

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
      interior: d.interior ?? null,
      nearby: s.nearbyShopId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      viewer: d.viewer ? { phase: d.viewer.phase, yaw: d.viewer.yaw } : null,
    }
  })
}

/**
 * 每一影格記錄鏡頭：是否在遮擋方塊（牆、天花板、攤位）裡、鏡頭到人物胸口之間是否被擋住、鏡頭高度與室內混合程度。
 * 鏡頭位置有平滑（追上目標需要幾個影格），因此「被擋住」以比例判斷。
 */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__yongleSampler ?? 0)
    const samples = []
    window.__yongleSamples = samples
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
      window.__yongleSampler = requestAnimationFrame(tick)
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
    const samples = window.__yongleSamples ?? []
    const indoor = samples.filter((item) => item.indoor > 0.99)
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      blocked: samples.filter((item) => item.blocked).length,
      indoorFrames: indoor.length,
      maxIndoorY: indoor.reduce((max, item) => Math.max(max, item.y), 0),
      firstY: samples[0]?.y ?? null,
      maxIndoor: samples.reduce((max, item) => Math.max(max, item.indoor), 0),
      monotonic: samples.every((item, i) => i === 0 || item.indoor >= samples[i - 1].indoor - 1e-6 || item.x < samples[i - 1].x),
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

  /** 按住前進／後退（桌面：Shift＋W／S；觸控：搖桿推到底）直到條件成立 */
  const hold = async (direction, until, arg) => {
    let release
    if (touch) {
      const base = await page.locator('.joystick__base').boundingBox()
      const cx = base.x + base.width / 2
      const cy = base.y + base.height / 2
      await touchSend('touchStart', [{ x: cx, y: cy, id: 7 }])
      await touchSend('touchMove', [{ x: cx, y: cy + (direction === 'forward' ? -base.height : base.height), id: 7 }])
      release = () => touchSend('touchEnd', [])
    } else {
      const key = direction === 'forward' ? 'KeyW' : 'KeyS'
      await page.keyboard.down('ShiftLeft')
      await page.keyboard.down(key)
      release = async () => {
        await page.keyboard.up(key)
        await page.keyboard.up('ShiftLeft')
      }
    }
    const reached = await waitFor(page, until, arg, WALK_TIMEOUT)
    await release()
    return reached
  }
  /** 鏡頭轉到角色西側（面向市場時在身後），前進就是往東走向市場 */
  const faceMarket = () =>
    page.evaluate(() => {
      const d = window.__DDC__
      d.cameraState.targetYaw = -Math.PI / 2
    })
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
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
  const zone = { minX: 42.6, maxX: 62.6, minZ: -5.4, maxZ: 5.4 }
  const inHall = (c) => c.x > zone.minX && c.x < zone.maxX && c.z > zone.minZ && c.z < zone.maxZ

  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'yongle'
  })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)
  const mode = await page.evaluate(() => window.__DDC__.useGameStore.getState().qualityMode)
  record(test, `畫質為${quality === 'fine' ? '精緻' : '流暢'}`, mode === quality, mode)

  // 1. 店家名錄、按需載入
  await press(page.locator('.hud-menu__toggle'))
  // 以店名比對（好粿緣的簡介裡也有「永樂市場」）
  const marketEntry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: /^永樂市場$/ }) })
  const stallEntry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: /^好粿緣$/ }) })
  const listed = (await marketEntry.count()) === 1 && (await stallEntry.count()) === 1
  const open = listed && (await stallEntry.locator('.menu-shop__badge.is-open').count()) === 1
  record(test, '店家名錄有永樂市場與好粿緣（可以探索）', listed && open)
  await page.keyboard.press('Escape').catch(() => {})
  await press(page.locator('.hud-menu__toggle'))
  const start = await state(page)
  record(
    test,
    '離市場很遠時，室內細部還沒有產生（按需載入）',
    start.interior && start.interior.requested === false && start.interior.loaded === false,
    `人物 (${round(start.x)}, ${round(start.z)})、室內 ${JSON.stringify(start.interior)}`,
  )

  // 2. 街道 → 入口 → 走進市場 → 好粿緣前
  await page.evaluate(() => {
    const d = window.__DDC__
    d.playerState.position.set(33.5, 0, 0.2)
    d.cameraState.targetYaw = d.cameraState.yaw = -Math.PI / 2
    d.cameraState.snap = true
  })
  await frames(4)
  await startSampler(page)
  const street = await state(page)
  const walkedIn = await hold('forward', () => {
    const d = window.__DDC__
    return d.playerState.position.x > 48.6 && d.useGameStore.getState().nearbyShopId === 'hao-guo-yuan'
  })
  await frames(3)
  const inside = await state(page)
  const walkStats = await samplerStats(page)
  record(test, touch ? '用搖桿從街道走進市場，走到好粿緣前' : '用鍵盤從街道走進市場，走到好粿緣前', walkedIn, `人物 (${round(inside.x)}, ${round(inside.z)})、附近 ${inside.nearby}`)
  record(
    test,
    '鏡頭平滑切換成室內鏡頭（拉近、壓低）',
    walkStats.maxIndoor > 0.99 && walkStats.monotonic && inside.indoor > 0.99 && street.cam.y > inside.cam.y + 0.8 && walkStats.maxIndoorY <= 2.8,
    `街上鏡頭高 ${round(street.cam.y)} m → 室內 ${round(inside.cam.y)} m、室內最高 ${round(walkStats.maxIndoorY)} m`,
  )
  record(
    test,
    '走路的每一個影格：鏡頭不在牆、天花板或攤位裡，看得到人物',
    walkStats.frames > 10 && walkStats.inside === 0 && walkStats.blocked <= Math.max(2, walkStats.frames * 0.05),
    `${walkStats.frames} 個影格：在方塊裡 ${walkStats.inside}、視線被擋 ${walkStats.blocked}`,
  )
  record(test, '接近市場時產生並顯示室內細部', inside.interior?.loaded === true && inside.interior?.visible === true, JSON.stringify(inside.interior))
  await shot(page, `${device}-aisle`)

  // 3. 點擊攤位 → 介紹 → 代表食品 → 關閉
  await page.waitForTimeout(1500)
  const point = await page.evaluate((id) => window.__DDC__.storefrontScreenPoint(id), STALL)
  if (touch) await page.touchscreen.tap(point.x, point.y)
  else await page.mouse.click(point.x, point.y)
  const opened = await waitFor(page, () => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === '好粿緣', null, 60000)
  record(test, touch ? '在攤位前點攤位，開啟好粿緣的介紹' : '在攤位前用滑鼠點攤位，開啟好粿緣的介紹', opened, `點在 (${round(point.x)}, ${round(point.y)})`)
  const tabs = await page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆]/, '').trim()))
  record(test, '四個章節：店家介紹、代表食品、食物文化、參考資料', tabs.join('、') === '店家介紹、代表食品、食物文化、參考資料', tabs.join('、'))
  await press(page.locator('.story__tab').nth(1))
  const foods = await waitFor(
    page,
    () => {
      const cards = [...document.querySelectorAll('.food-card')]
      return cards.length === 4 && cards.every((card) => card.querySelector('svg.food-illustration')?.childElementCount > 0)
    },
    null,
    30000,
  )
  const foodNames = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(test, '代表食品：草仔粿、紅龜粿、蘿蔔糕、芋粿巧（四張圖鑑）', foods && foodNames.join('、') === '草仔粿、紅龜粿、蘿蔔糕（菜頭粿）、芋粿巧', foodNames.join('、'))
  const storyCam = await state(page)
  record(test, '介紹的鏡頭在市場裡、不在牆或攤位裡', inHall(storyCam.cam) && !storyCam.camInside, `鏡頭 (${round(storyCam.cam.x)}, ${round(storyCam.cam.y)}, ${round(storyCam.cam.z)})`)
  await shot(page, `${device}-story-foods`)
  await press(page.locator('.story__close'))
  await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})
  await frames(4)
  const closed = await state(page)
  record(
    test,
    '關閉介紹後仍站在攤位前',
    closed.mode === 'explore' && Math.hypot(closed.x - inside.x, closed.z - inside.z) < 0.05 && closed.nearby === STALL,
    `人物 (${round(closed.x)}, ${round(closed.z)})`,
  )

  // 4. 建築觀賞模式在室內
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  const entered = await viewerSettled()
  const viewerIn = await state(page)
  record(
    test,
    '在市場裡進入觀賞模式：鏡頭在一樓室內、天花板下、不在攤位裡',
    entered && inHall(viewerIn.cam) && viewerIn.cam.y < 3.2 && !viewerIn.camInside,
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
    touch ? '觀賞模式在室內單指旋轉：鏡頭仍在天花板下、不在攤位裡' : '觀賞模式在室內拖曳旋轉：鏡頭仍在天花板下、不在攤位裡',
    rotated && Math.abs(viewerTurned.viewer.yaw - viewerIn.viewer.yaw) > 0.1 && inHall(viewerTurned.cam) && viewerTurned.cam.y < 3.2 && !viewerTurned.camInside,
    `yaw ${round(viewerIn.viewer.yaw)} → ${round(viewerTurned.viewer.yaw)}、鏡頭高 ${round(viewerTurned.cam.y)} m`,
  )
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator(`[data-focus-shop="${STALL}"]`))
  const focused = await viewerSettled()
  const viewerFocus = await state(page)
  const stallFront = await page.evaluate(() => {
    const d = window.__DDC__
    const c = d.camera.position
    const target = { x: 50.05, y: 1.5, z: -1.7 }
    const blockers = d.cameraScene.current.blockers.filter((b) => !(b.minX > 48.2 && b.maxX < 51.9 && b.maxZ < -1.75))
    const delta = { x: target.x - c.x, y: target.y - c.y, z: target.z - c.z }
    const steps = 60
    let hidden = 0
    for (let i = 1; i < steps; i++) {
      const k = i / steps
      const p = { x: c.x + delta.x * k, y: c.y + delta.y * k, z: c.z + delta.z * k }
      if (blockers.some((b) => p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY && p.z > b.minZ && p.z < b.maxZ)) hidden++
    }
    return hidden
  })
  record(
    test,
    '觀賞模式聚焦好粿緣：鏡頭在走道上，看得到攤位正面',
    focused && inHall(viewerFocus.cam) && Math.abs(viewerFocus.cam.z) < 1.8 && !viewerFocus.camInside && stallFront === 0,
    `鏡頭 (${round(viewerFocus.cam.x)}, ${round(viewerFocus.cam.y)}, ${round(viewerFocus.cam.z)})`,
  )
  await shot(page, `${device}-viewer-stall`)
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(
    test,
    '返回探索：人物還在攤位前，鏡頭回到人物身邊、不在牆裡',
    back && Math.hypot(returned.x - inside.x, returned.z - inside.z) < 0.05 && !returned.camInside && inHall(returned.cam),
    `鏡頭 (${round(returned.cam.x)}, ${round(returned.cam.y)}, ${round(returned.cam.z)})`,
  )

  // 5. 沿原路走出市場
  await faceMarket()
  await frames(4)
  await startSampler(page)
  const walkedOut = await hold('back', () => window.__DDC__.playerState.position.x < 36.5)
  await frames(8)
  const outside = await state(page)
  const outStats = await samplerStats(page)
  record(test, '沿原路走出市場，回到迪化街上', walkedOut && outside.x < 37 && Math.abs(outside.z) < 2.5, `人物 (${round(outside.x)}, ${round(outside.z)})`)
  record(
    test,
    '走出市場時鏡頭恢復街道上的距離，而且沒有進到牆或天花板裡',
    outside.indoor < 0.5 && outside.cam.y > 2.9 && outStats.inside === 0 && outStats.blocked <= Math.max(2, outStats.frames * 0.05),
    `室內混合 ${round(outside.indoor)}、鏡頭高 ${round(outside.cam.y)} m、${outStats.frames} 個影格中視線被擋 ${outStats.blocked}`,
  )
  await shot(page, `${device}-outside`)

  // 6. 連續進出 5 次
  const before = await page.evaluate(() => ({
    era: window.__DDC__.useGameStore.getState().eraId,
    outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
    music: window.__DDC__.audioManager?.inspect() ?? null,
  }))
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const inOk = await hold('forward', () => window.__DDC__.playerState.position.x > 45.5)
    await frames(2)
    const a = await state(page)
    const outOk = await hold('back', () => window.__DDC__.playerState.position.x < 38)
    await frames(2)
    const b = await state(page)
    const ok = inOk && outOk && a.indoor > 0.8 && !a.camInside && !b.camInside && a.era === 'revival' && b.era === 'revival'
    cycles.push(ok)
    console.log(`    第 ${i + 1} 次：進 (${round(a.x)}, ${round(a.z)}) 室內 ${round(a.indoor)}；出 (${round(b.x)}, ${round(b.z)})${ok ? '' : '（失敗）'}`)
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
    `連續進出市場 ${CYCLES} 次都正常`,
    cycles.length === CYCLES && cycles.every(Boolean) && cycleStats.inside === 0 && cycleStats.blocked <= Math.max(3, cycleStats.frames * 0.05),
    `${cycles.filter(Boolean).length}/${CYCLES} 次、${cycleStats.frames} 個影格中鏡頭在方塊裡 ${cycleStats.inside}、視線被擋 ${cycleStats.blocked}`,
  )
  const musicKept =
    !before.music ||
    (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount && after.music.status === before.music.status)
  record(
    test,
    '進出市場不重置年代、服裝與音樂，也沒有重新載入頁面',
    after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'yongle',
    `年代 ${after.era}、服裝 ${after.outfit}、音樂 ${after.music?.status ?? '無'}（播放 ${after.music?.startedCount ?? 0} 次）`,
  )

  // 7. 在市場裡切換年代
  await faceMarket()
  await hold('forward', () => window.__DDC__.playerState.position.x > 47)
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-era-option="modern"]'))
  const modern = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'modern', null, TRANSITION_TIMEOUT)
  await frames(6)
  const moved = await state(page)
  record(
    test,
    '在市場裡切換到摩登年代：人物回到街上、鏡頭不在建築裡',
    modern && moved.x < 36 && !moved.camInside,
    `人物 (${round(moved.x)}, ${round(moved.z)})、鏡頭 (${round(moved.cam.x)}, ${round(moved.cam.y)}, ${round(moved.cam.z)})`,
  )
  await press(page.locator('[data-era-option="revival"]'))
  const revival = await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'revival', null, TRANSITION_TIMEOUT)
  const restored = await page.evaluate(() => window.__DDC__.cameraScene.current.buildings.some((b) => b.storeId === 'yong-le-market'))
  record(test, '切回老屋新生：市場恢復', revival && restored)
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
