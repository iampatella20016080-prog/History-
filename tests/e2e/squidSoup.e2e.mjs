/**
 * 魷魚羹兩個年代版本的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 1945–1980：店家名錄有「廟口魷魚羹攤」（飲食文化情境示意），沒有老潘；從出發點沿著迪化街走到慈聖宮廟埕旁的攤位
 *   2. 攤位前的提示「廟口的魷魚羹攤」；按 E／點提示開啟「魷魚羹與廟口飲食」（分開標示史料與情境設計）；
 *      點攤台上的那一碗，開啟「一碗魷魚羹」；資料來源標示出版時間與用途
 *   3. 切換到 2000–現在：廟口的攤位消失、老潘出現；從永樂市場前廣場走到老潘的店門口，經過攤車旁的入口走到座位：
 *      每一個影格鏡頭都不在方塊裡、看得到人物；室內在接近時產生
 *   4. 四道展示餐點的提示 → 「代表餐點」（四張圖鑑）；黑白貓在店裡眨眼、轉頭、擺尾
 *   5. 建築觀賞模式在店內；聚焦老潘的立面；返回探索
 *   6. 在店裡切換畫質：流暢模式隱藏細小的擺飾，貓仍然顯示
 *   7. 走出店外到攤車前，點攤車開啟「市場周邊飲食」
 *   8. 連續進出店 5 次：人物、鏡頭與碰撞正常；年代、服裝與音樂沒有被重置
 *   9. 在店裡切換到 1945–1980：人物移到合法的戶外位置；老潘的店屋、招牌、貓與碰撞都清除
 *  10. 兩個年代往返 10 次：每次都只有當前年代的版本
 *  11. 沒有頁面錯誤
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/squidSoup.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 * CYCLES（進出店的次數，預設 5）、ROUNDS（兩個年代往返的次數，預設 10）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LAO_PAN, LAO_PAN_HOTSPOTS, TEMPLE_STALL, TEMPLE_STALL_HOTSPOTS, laoPanToWorld, templeStallToWorld } from '../../src/data/squidSoupLayout.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 5)
const ROUNDS = Number(process.env.ROUNDS ?? 10)
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)

const LP = (x, z) => laoPanToWorld(x, z)
const TS = (x, z) => templeStallToWorld(x, z)
const route = (toWorld, points) => points.map(([x, z]) => toWorld(x, z))
const ROOM_MIN = LP(LAO_PAN.room.maxX, LAO_PAN.room.maxZ)
const ROOM_MAX = LP(LAO_PAN.room.minX, LAO_PAN.room.minZ)
const inRoom = (c) => c.x > ROOM_MIN.x && c.x < ROOM_MAX.x && c.z > ROOM_MIN.z && c.z < ROOM_MAX.z

const stallPoint = TEMPLE_STALL_HOTSPOTS[0].point
const TO_STALL = [{ x: 6.0, z: 1.5 }, ...route(TS, [[stallPoint[0], 3.0], stallPoint])]
const MARKET = { x: 38.6, z: 0.8 }
const IN = route(LP, [
  [0.6, 2.4],
  [0.6, 1.0],
  [0.6, -0.4],
  [0.0, -2.0],
  LAO_PAN_HOTSPOTS[2].point,
])
const DEEP = route(LP, [
  [0.0, -4.4],
  [0.15, -5.0],
])
const OUT = route(LP, [
  [0.0, -2.6],
  [0.6, -0.4],
  [0.6, 1.0],
  [0.6, 2.4],
])
const TO_COUNTER = route(LP, [LAO_PAN_HOTSPOTS[1].point])

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

function state(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const scene = d.cameraScene.current
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const detail = d.scene?.getObjectByName('interior-lao-pan-squid-soup-detail')
    let interiorCount = 0
    let catCount = 0
    d.scene?.traverse((o) => {
      if (o.name === 'interior-lao-pan-squid-soup') interiorCount++
      if (o.name === 'cat-lao-pan-cat') catCount++
    })
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      cam: { x: c.x, y: c.y, z: c.z },
      camInside: scene.blockers.some((b) => inBox(c, b)),
      indoor: d.indoor?.amount ?? 0,
      interior: d.interiors?.['lao-pan-squid-soup'] ?? null,
      detailVisible: detail ? detail.visible : null,
      interiorCount,
      catCount,
      cat: d.cats?.['lao-pan-cat'] ?? null,
      stall: scene.buildings.some((b) => b.storeId === 'temple-squid-stall'),
      laoPan: scene.buildings.some((b) => b.storeId === 'lao-pan-squid-soup' || /lao-pan/.test(b.id)),
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      activeHotspot: s.activeHotspotId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      prompt: document.querySelector('.shop-prompt.is-visible .shop-prompt__name')?.textContent ?? null,
      viewer: d.viewer ? { phase: d.viewer.phase, yaw: d.viewer.yaw } : null,
    }
  })
}

/** 每一影格記錄鏡頭是否在遮擋方塊裡、鏡頭到人物胸口之間是否被擋住、人物每一影格移動的距離 */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__sqSampler ?? 0)
    const samples = []
    window.__sqSamples = samples
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
      window.__sqSampler = requestAnimationFrame(tick)
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
      prev = { x: p.x, z: p.z }
      samples.push({ inside: blockers.some((b) => inBox(c, b)), blocked, step, camY: c.y, indoor: d.indoor?.amount ?? 0 })
    }
    tick()
  })
}

function samplerStats(page) {
  return page.evaluate(() => {
    const samples = window.__sqSamples ?? []
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      blocked: samples.filter((item) => item.blocked).length,
      maxStep: samples.reduce((max, item) => Math.max(max, item.step), 0),
      maxIndoorCamY: samples.filter((item) => item.indoor > 0.99).reduce((max, item) => Math.max(max, item.camY), 0),
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
        const prev = window.__sqSettle
        if (!prev || prev.frame === now.frame) {
          window.__sqSettle = prev ?? now
          return false
        }
        window.__sqSettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() =>
      page.evaluate(() => {
        window.__sqSettle = null
      }),
    )
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
  }
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個路線點；原地不動太久就停下來回報卡住 */
  const walk = async (points, { tolerance = 0.28 } = {}) => {
    await page.evaluate((points) => {
      window.__sqRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__sqRoute
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
    const r = await page.evaluate(() => ({ i: window.__sqRoute.i, stuck: window.__sqRoute.stuck }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  /** 鏡頭轉向某個點（人物背後看過去） */
  const face = async (target) => {
    await page.evaluate((t) => {
      const d = window.__DDC__
      const p = d.playerState.position
      d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(t.x - p.x), -(t.z - p.z))
    }, target)
    await frames(8)
  }
  /** 一個可以點選的目標（建築紀錄）的遮擋方塊中心在畫面上的位置 */
  const screenPointOf = (id, yOffset = 0) =>
    page.evaluate(
      ({ id, yOffset }) => {
        const d = window.__DDC__
        const record = d.cameraScene.current.buildings.find((item) => item.id === id)
        if (!record) return null
        const b = record.parts[0]
        const point = d.camera.position.clone().set((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2 + yOffset, (b.minZ + b.maxZ) / 2).project(d.camera)
        const rect = d.gl.domElement.getBoundingClientRect()
        return { x: rect.left + ((point.x + 1) / 2) * rect.width, y: rect.top + ((1 - point.y) / 2) * rect.height, inView: Math.abs(point.x) < 0.95 && Math.abs(point.y) < 0.95 && point.z < 1 }
      },
      { id, yOffset },
    )
  const tapAt = async (point) => {
    if (touch) await page.touchscreen.tap(point.x, point.y)
    else await page.mouse.click(point.x, point.y)
  }
  const storyOpen = (name) => waitFor(page, (name) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === name, name, 60000)
  const activeTab = () => page.evaluate(() => document.querySelector('.story__tab.is-active')?.textContent.replace(/^[壹貳參肆伍]/, '').trim() ?? null)
  const tabNames = () => page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆伍]/, '').trim()))
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
  const directory = async (name) => {
    await press(page.locator('.hud-menu__toggle'))
    const entry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: name }) })
    const info = {
      count: await entry.count(),
      open: await entry.locator('.menu-shop__badge.is-open').count(),
      notes: await entry.locator('.menu-shop__note').allTextContents(),
    }
    const others = await page.$$eval('.menu-shop__name', (items) => items.map((item) => item.textContent))
    if (await page.locator('#shop-menu-panel').isVisible()) await press(page.locator('.hud-menu__toggle'))
    await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
    return { ...info, names: others }
  }
  const viewerSettled = () =>
    frames(3).then(() =>
      waitFor(
        page,
        () => {
          const v = window.__DDC__.viewer
          return v?.phase === 'active' && v.target.distanceTo(v.goalTarget) < 0.08 && Math.abs(v.yaw - v.goalYaw) < 0.02 && Math.abs(v.pitch - v.goalPitch) < 0.02 && Math.abs(v.distance - v.goalDistance) < 0.1
        },
        null,
        SETTLE_TIMEOUT,
      ),
    )
  const media = () =>
    page.evaluate(() => ({
      era: window.__DDC__.useGameStore.getState().eraId,
      outfit: window.__DDC__.getOutfit?.(window.__DDC__.useGameStore.getState().eraId)?.id ?? null,
      music: window.__DDC__.audioManager?.inspect() ?? null,
      noReload: window.__noReload,
    }))

  /* ── 1945–1980：廟口的魷魚羹攤 ─────────────── */
  await page.goto(`${BASE_URL}?era=postwar&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'postwar', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'squid'
  })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  const postwarList = await directory('廟口魷魚羹攤')
  record(
    test,
    '1945–1980 的店家名錄有「廟口魷魚羹攤」（可以探索、標示飲食文化情境示意與飲食主題），沒有老潘',
    postwarList.count === 1 && postwarList.open === 1 && postwarList.notes.includes('飲食文化情境示意') && postwarList.notes.some((t) => /魷魚羹飲食文化/.test(t)) && !postwarList.names.includes('老潘魷魚羹'),
    postwarList.notes.join('、'),
  )
  const atStart = await state(page)
  record(test, '1945–1980 的街景：有廟口的攤位，沒有老潘的店屋與貓', atStart.stall && !atStart.laoPan && atStart.catCount === 0)

  await startSampler(page)
  const toStall = await walk(TO_STALL)
  await frames(4)
  const atStall = await state(page)
  const stallStats = await samplerStats(page)
  record(
    test,
    touch ? '用搖桿沿著迪化街走到慈聖宮廟埕旁的魷魚羹攤' : '用鍵盤沿著迪化街走到慈聖宮廟埕旁的魷魚羹攤',
    toStall.ok && atStall.nearby === 'temple-squid-stall' && atStall.hotspot === 'stall' && atStall.prompt === '廟口的魷魚羹攤',
    `人物 (${round(atStall.x)}, ${round(atStall.z)})、提示「${atStall.prompt}」${toStall.ok ? '' : `；卡在第 ${toStall.i} 點`}`,
  )
  record(test, '走向攤位的每一個影格：鏡頭不在方塊裡、看得到人物', stallStats.frames > 10 && stallStats.inside === 0 && stallStats.blocked <= Math.max(3, stallStats.frames * 0.05), `${stallStats.frames} 個影格：在方塊裡 ${stallStats.inside}、視線被擋 ${stallStats.blocked}`)
  await face(TS(TEMPLE_STALL.bowl.x, TEMPLE_STALL.bowl.z))
  await shot(page, `${device}-stall`)
  await interact()
  const stallStory = await storyOpen('廟口魷魚羹攤')
  const stallTabs = await tabNames()
  const stallTab = await activeTab()
  const marks = await page.$$eval('.chapter__p', (items) => items.map((item) => item.textContent.slice(0, 6)))
  record(
    test,
    touch ? '點提示開啟「魷魚羹與廟口飲食」，內容分開標示史料與情境設計' : '按 E 開啟「魷魚羹與廟口飲食」，內容分開標示史料與情境設計',
    stallStory && stallTab === '廟口飲食' && marks.some((t) => t.startsWith('史料｜')) && marks.some((t) => t.startsWith('情境設計｜')),
    `章節 ${stallTabs.join('、')}；目前 ${stallTab}`,
  )
  await press(page.locator('.story__tab').nth(stallTabs.length - 1))
  const stallMeta = await page.$$eval('.source__meta', (items) => items.length)
  const stallLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '資料來源：每一筆都有網址、出版時間與用途', stallLinks >= 8 && stallMeta === stallLinks, `${stallLinks} 筆、${stallMeta} 筆標示出版時間與用途`)
  await closeStory()
  const bowlPoint = await screenPointOf('temple-squid-stall-bowl')
  if (bowlPoint?.inView) await tapAt(bowlPoint)
  const bowlStory = await storyOpen('廟口魷魚羹攤')
  const bowlState = await state(page)
  const bowlTab = await activeTab()
  const bowlFoods = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(
    test,
    touch ? '點攤台上的那一碗：開啟「一碗魷魚羹」' : '用滑鼠點攤台上的那一碗：開啟「一碗魷魚羹」',
    Boolean(bowlPoint?.inView) && bowlStory && bowlState.activeHotspot === 'bowl' && bowlTab === '一碗魷魚羹' && bowlFoods.join('、') === '魷魚羹、乾魷魚（鰇魚）',
    `熱點 ${bowlState.activeHotspot}、章節 ${bowlTab}、圖鑑 ${bowlFoods.join('、')}`,
  )
  if (bowlStory) await closeStory()

  /* ── 切換到 2000–現在：老潘魷魚羹 ─────────── */
  const toRevival = await switchEra('revival')
  await closeSettings()
  const afterSwitch = await state(page)
  record(
    test,
    '在攤位前切換到 2000–現在：廟口的攤位消失、老潘出現；人物在合法的位置',
    toRevival && !afterSwitch.stall && afterSwitch.laoPan && !afterSwitch.camInside && afterSwitch.y === 0,
    `人物 (${round(afterSwitch.x)}, ${round(afterSwitch.z)})`,
  )
  const revivalList = await directory('老潘魷魚羹')
  record(test, '2000–現在的店家名錄有老潘魷魚羹（可以探索），沒有廟口的攤位', revivalList.count === 1 && revivalList.open === 1 && !revivalList.names.includes('廟口魷魚羹攤'))
  record(
    test,
    '離老潘還很遠：店內的細部還沒有產生（按需載入）',
    afterSwitch.interior && afterSwitch.interior.requested === false && afterSwitch.interior.loaded === false,
    JSON.stringify(afterSwitch.interior),
  )

  // 從永樂市場前廣場走到店門口 → 攤車旁的入口 → 四道展示餐點的桌旁
  await page.evaluate(({ x, z }) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, z)
    d.cameraState.snap = true
  }, MARKET)
  await frames(4)
  await face(LP(0, 1.5))
  await shot(page, `${device}-laopan-storefront`)
  const street = await state(page)
  await startSampler(page)
  const walkIn = await walk(IN)
  await waitFor(page, () => (window.__DDC__.indoor?.amount ?? 0) > 0.99, null, 60000)
  await frames(4)
  const atFoods = await state(page)
  const inStats = await samplerStats(page)
  record(
    test,
    touch ? '用搖桿從永樂市場前廣場走到老潘的店門口，經過攤車旁的入口走到座位' : '用鍵盤從永樂市場前廣場走到老潘的店門口，經過攤車旁的入口走到座位',
    walkIn.ok && inRoom(atFoods) && atFoods.y === 0,
    `人物 (${round(atFoods.x)}, ${round(atFoods.z)})${walkIn.ok ? '' : `；卡在第 ${walkIn.i} 點`}`,
  )
  record(
    test,
    '走進店裡的每一個影格：鏡頭不在牆、攤車或天花板裡，看得到人物；店裡的鏡頭在天花板下；沒有傳送',
    inStats.frames > 10 && inStats.inside === 0 && inStats.blocked <= Math.max(3, inStats.frames * 0.05) && inStats.maxIndoorCamY < LAO_PAN.ceiling && inStats.maxStep < 0.6,
    `${inStats.frames} 個影格：在方塊裡 ${inStats.inside}、視線被擋 ${inStats.blocked}、店裡鏡頭最高 ${round(inStats.maxIndoorCamY)} m、每影格最多 ${round(inStats.maxStep)} m`,
  )
  record(
    test,
    '鏡頭切換成室內鏡頭（拉近）；接近時產生並顯示店內',
    atFoods.indoor > 0.99 && street.cam.y - street.y > atFoods.cam.y - atFoods.y && atFoods.interior?.loaded === true && atFoods.interior?.visible === true,
    `室內 ${JSON.stringify(atFoods.interior)}`,
  )
  record(test, '四道展示餐點旁的提示', atFoods.nearby === 'lao-pan-squid-soup' && atFoods.hotspot === 'foods' && atFoods.prompt === '四道展示餐點', `提示「${atFoods.prompt}」`)
  await face(LP(1.38, -2.55))
  await shot(page, `${device}-laopan-foods`)
  await interact()
  const foodsStory = await storyOpen('老潘魷魚羹')
  const laoTabs = await tabNames()
  const foodsTab = await activeTab()
  const foodsOk = await waitFor(page, () => [...document.querySelectorAll('.food-card')].length === 4 && [...document.querySelectorAll('.food-card svg.food-illustration')].every((svg) => svg.childElementCount > 0), null, 30000)
  const foodNames = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(
    test,
    '開啟「代表餐點」：沙茶魷魚羹、魚酥羹、甜不辣、乾拌沙茶生魷魚（四張圖鑑）；章節為店家與位置／市場周邊飲食／代表餐點／資料來源',
    foodsStory && foodsTab === '代表餐點' && foodsOk && foodNames.join('、') === '沙茶魷魚羹、魚酥羹、甜不辣、乾拌沙茶生魷魚' && laoTabs.join('／') === '店家與位置／市場周邊飲食／代表餐點／資料來源',
    `章節 ${laoTabs.join('／')}；圖鑑 ${foodNames.join('、')}`,
  )
  await press(page.locator('.story__tab').nth(3))
  const laoMeta = await page.$$eval('.source__meta', (items) => items.length)
  const laoLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.map((item) => item.href))
  record(
    test,
    '資料來源：店家頁面與2023年實訪紀錄都在，每一筆都標示出版時間與用途',
    laoLinks.includes('https://www.facebook.com/pannoodles/about/') && laoLinks.includes('https://puddings.tw/pannoodles/') && laoMeta === laoLinks.length,
    `${laoLinks.length} 筆、${laoMeta} 筆標示出版時間與用途`,
  )
  await closeStory()

  // 黑白貓：眨眼、轉頭、擺尾
  const toCat = await walk(DEEP)
  await face(LP(LAO_PAN.cat.x, LAO_PAN.cat.z))
  const catA = await state(page)
  const sawBlink = await waitFor(page, () => (window.__DDC__.cats?.['lao-pan-cat']?.blink ?? 1) < 0.9, null, 60000, 'raf')
  const catB = await state(page)
  record(
    test,
    '黑白貓在店裡（桌腳旁）：會眨眼、轉頭、擺尾，不擋走道',
    toCat.ok && catA.catCount === 1 && catA.cat?.visible === true && sawBlink && catB.cat && Math.abs(catB.cat.headYaw - catA.cat.headYaw) > 1e-4 && Math.abs(catB.cat.tailYaw - catA.cat.tailYaw) > 1e-4,
    `貓 ${JSON.stringify(catB.cat)}`,
  )
  await shot(page, `${device}-laopan-cat`)

  // 建築觀賞模式在店內（先面向第一張桌子：觀賞模式的起始鏡頭在人物背後，看得到四道餐點）
  await face(LP(1.38, -2.55))
  const beforeViewer = await state(page)
  await openSettings()
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  const entered = await viewerSettled()
  const viewerIn = await state(page)
  const roomCam = (s) => inRoom(s.cam) && s.cam.y > 0.2 && s.cam.y < LAO_PAN.ceiling && !s.camInside
  record(test, '在店裡進入觀賞模式：鏡頭在店內、地板與天花之間、不在牆裡', entered && roomCam(viewerIn), `鏡頭 (${round(viewerIn.cam.x)}, ${round(viewerIn.cam.y)}, ${round(viewerIn.cam.z)})`)
  // 點四道餐點：近距離聚焦，不開啟介紹
  const foodsPoint = await screenPointOf('lao-pan-foods')
  if (foodsPoint?.inView) await tapAt(foodsPoint)
  const focusedFoods = await viewerSettled()
  const nearFoods = await state(page)
  const foodTable = LP(1.38, -2.55)
  const foodsDistance = Math.hypot(nearFoods.cam.x - foodTable.x, nearFoods.cam.z - foodTable.z)
  record(
    test,
    touch ? '觀賞模式點四道餐點：鏡頭近距離聚焦食品、不開啟介紹' : '觀賞模式用滑鼠點四道餐點：鏡頭近距離聚焦食品、不開啟介紹',
    Boolean(foodsPoint?.inView) && focusedFoods && nearFoods.mode === 'explore' && roomCam(nearFoods) && foodsDistance < 3.2,
    `點在畫面內 ${Boolean(foodsPoint?.inView)}、穩定 ${focusedFoods}；鏡頭 (${round(nearFoods.cam.x)}, ${round(nearFoods.cam.y)}, ${round(nearFoods.cam.z)})、離桌子 ${round(foodsDistance)} m`,
  )
  await shot(page, `${device}-viewer-foods`)
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
  const turned = await state(page)
  record(test, touch ? '觀賞模式在店內單指旋轉：鏡頭仍在店裡、不穿牆' : '觀賞模式在店內拖曳旋轉：鏡頭仍在店裡、不穿牆', rotated && Math.abs(turned.viewer.yaw - nearFoods.viewer.yaw) > 0.1 && roomCam(turned))
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator('[data-focus-shop="lao-pan-squid-soup"]'))
  const focused = await viewerSettled()
  const facade = await state(page)
  record(test, '觀賞模式從店家名錄聚焦老潘：鏡頭在迪化街上看招牌與騎樓、不在牆裡', focused && facade.cam.z < LAO_PAN.site.z - LAO_PAN.arcade && !facade.camInside, `鏡頭 (${round(facade.cam.x)}, ${round(facade.cam.y)}, ${round(facade.cam.z)})`)
  await shot(page, `${device}-viewer-facade`)
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(test, '返回探索：人物還在店裡的同一個位置，鏡頭回到人物身邊', back && Math.hypot(returned.x - beforeViewer.x, returned.z - beforeViewer.z) < 0.05 && !returned.camInside)

  // 在店裡切換畫質
  await openSettings()
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && s.detailVisible === (target === 'fine') && s.cat?.visible === true && !s.camInside)
  }
  await closeSettings()
  record(test, '在店裡切換畫質：流暢模式隱藏細小的擺飾、精緻模式顯示；店內與貓都仍顯示', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 走出店外，到攤車前點攤車
  const walkOut = await walk(OUT)
  const toCounter = await walk(TO_COUNTER)
  await frames(4)
  const atCounter = await state(page)
  record(test, '走出店外到攤車前：提示「料理檯」', walkOut.ok && toCounter.ok && atCounter.hotspot === 'counter' && atCounter.prompt === '料理檯', `提示「${atCounter.prompt}」`)
  await face(LP((LAO_PAN.counter.minX + LAO_PAN.counter.maxX) / 2, LAO_PAN.counter.minZ))
  await shot(page, `${device}-laopan-counter`)
  const cartPoint = await screenPointOf('lao-pan-counter', -0.1)
  if (cartPoint?.inView) await tapAt(cartPoint)
  const cartStory = await storyOpen('老潘魷魚羹')
  const cartTab = await activeTab()
  record(test, touch ? '點攤車：開啟「市場周邊飲食」' : '用滑鼠點攤車：開啟「市場周邊飲食」', Boolean(cartPoint?.inView) && cartStory && cartTab === '市場周邊飲食', `章節 ${cartTab}`)
  if (cartStory) await closeStory()

  // 連續進出 5 次
  const before = await media()
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk([...IN, ...DEEP])
    const sa = await state(page)
    const b = await walk(OUT)
    const sb = await state(page)
    const ok = a.ok && b.ok && inRoom(sa) && !inRoom(sb) && sa.y === 0 && sb.y === 0 && !sa.camInside && !sb.camInside
    cycles.push(ok)
    console.log(`    第 ${i + 1} 次：進 (${round(sa.x)}, ${round(sa.z)})${a.ok ? '' : `（卡在第 ${a.i} 點）`}、出 (${round(sb.x)}, ${round(sb.z)})${b.ok ? '' : `（卡在第 ${b.i} 點）`}`)
  }
  const cycleStats = await samplerStats(page)
  const after = await media()
  record(
    test,
    `連續進出店 ${CYCLES} 次都正常（人物、鏡頭與碰撞）`,
    cycles.every(Boolean) && cycles.length === CYCLES && cycleStats.inside === 0 && cycleStats.blocked <= Math.max(3, cycleStats.frames * 0.05) && cycleStats.maxStep < 0.6,
    `${cycles.filter(Boolean).length}/${CYCLES} 次、${cycleStats.frames} 個影格中鏡頭在方塊裡 ${cycleStats.inside}、視線被擋 ${cycleStats.blocked}`,
  )
  const musicKept = !before.music || (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount && after.music.status === before.music.status)
  record(test, '進出店家不重置年代、服裝與音樂，也沒有重新載入頁面', after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'squid', `音樂 ${after.music?.status ?? '無'}（播放 ${after.music?.startedCount ?? 0} 次）`)

  // 在店裡切換到 1945–1980
  await walk(IN)
  const inside = await state(page)
  const toPostwar = await switchEra('postwar')
  const moved = await state(page)
  record(
    test,
    '在店裡切換到 1945–1980：人物移到合法的戶外位置（街上、地面），老潘的店屋、招牌、貓與店內都清除',
    inRoom(inside) && toPostwar && !inRoom(moved) && moved.y === 0 && moved.z < LAO_PAN.site.z - LAO_PAN.arcade + 0.4 && !moved.camInside && !moved.laoPan && moved.catCount === 0 && moved.interiorCount === 0 && moved.stall,
    `人物 (${round(moved.x)}, ${round(moved.y)}, ${round(moved.z)})、鏡頭 (${round(moved.cam.x)}, ${round(moved.cam.y)}, ${round(moved.cam.z)})`,
  )

  // 兩個年代往返 10 次
  const rounds = []
  for (let i = 0; i < ROUNDS; i++) {
    const a = await switchEra('revival')
    const sa = await state(page)
    const b = await switchEra('postwar')
    const sb = await state(page)
    const ok = a && b && sa.laoPan && !sa.stall && sa.catCount === 1 && !sb.laoPan && sb.stall && sb.catCount === 0 && sb.interiorCount === 0 && !sa.camInside && !sb.camInside
    rounds.push(ok)
    console.log(`    往返 ${i + 1}：老屋新生 老潘 ${sa.laoPan}／攤位 ${sa.stall}／貓 ${sa.catCount}；庶民生活 老潘 ${sb.laoPan}／攤位 ${sb.stall}／貓 ${sb.catCount}${ok ? '' : '（失敗）'}`)
  }
  await closeSettings()
  const finalMedia = await media()
  record(test, `兩個年代往返 ${ROUNDS} 次：每次都只有當前年代的版本，沒有重新載入頁面`, rounds.length === ROUNDS && rounds.every(Boolean) && finalMedia.noReload === 'squid', `${rounds.filter(Boolean).length}/${ROUNDS}`)

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
