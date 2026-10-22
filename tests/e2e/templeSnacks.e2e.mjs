/**
 * 廟口的豆花攤與糕粿攤的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 1945–1980：店家名錄有「廟口豆花攤」「廟口糕粿攤」（飲食文化情境示意、飲食主題），沒有導演的豆花店與好粿緣；
 *      廟口同時有米苔目、魷魚羹、豆花、糕粿四攤
 *   2. 從出發點沿著迪化街走進廟埕、沿著中央通道走到天公爐前（每一個影格檢查鏡頭）
 *   3. 走到豆花攤前：按 E／點提示開啟「豆花與甜食攤」（說明、史料、情境設計、現代相關店家）、資料來源標示出版時間與用途；
 *      點推車上的兩碗開啟「兩碗豆花」；人物不能穿過推車；攤販顯示、手和頭在動
 *   4. 走到糕粿攤前：開啟「糕粿與日常／節慶米食」；點托盤開啟「四種傳統米食」（四張圖鑑）
 *   5. 建築觀賞模式：從店家名錄聚焦兩攤、點兩碗豆花與托盤近距離聚焦（不開啟介紹、不穿牆）；返回探索
 *   6. 在攤位前切換畫質：兩攤與攤販都仍顯示
 *   7. 在攤位前切換到 2000–現在：兩攤與攤販都清除、人物在合法的位置；導演的豆花店與永樂市場（好粿緣）都在
 *   8. 其他三個年代都沒有兩攤；兩個年代往返 10 次：每次都只有當前年代的版本；年代、服裝與音樂沒有被重置
 *   9. 沒有頁面錯誤
 * 截圖（SHOTS）：廟口全景、豆花攤、糕粿攤、兩碗豆花與托盤的近景。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/templeSnacks.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 * ROUNDS（兩個年代往返的次數，預設 10）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { templeCourtToWorld } from '../../src/data/squidSoupLayout.js'
import { DOUHUA_STALL_HOTSPOTS, KUEH_STALL_HOTSPOTS, douhuaStallToWorld, kuehStallToWorld } from '../../src/data/templeSnackLayout.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const ROUNDS = Number(process.env.ROUNDS ?? 10)
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)

const COURT = (x, z) => templeCourtToWorld(x, z)
const DH = (x, z) => douhuaStallToWorld(x, z)
const KU = (x, z) => kuehStallToWorld(x, z)
const STALLS = ['temple-mi-tai-mu-stall', 'temple-squid-stall', 'temple-douhua-stall', 'temple-kueh-stall']

// 從出發點沿著迪化街南側走到廟埕前緣，再沿著中央通道走到天公爐前
const TO_COURT = [{ x: 9.0, z: 1.3 }, { x: 6.0, z: 1.9 }, COURT(-0.3, 2.2), COURT(-0.3, 0.6), COURT(-0.3, -2.4)]
// 中央通道 → 天公爐與用餐區之間 → 豆花攤前（推車前、兩張木凳旁）
const TO_DOUHUA = [COURT(0.55, -3.2), COURT(1.5, -3.6), DH(...DOUHUA_STALL_HOTSPOTS[0].point)]
const DOUHUA_BACK = [COURT(1.5, -3.6), COURT(0.55, -3.2), COURT(-0.3, -2.6)]
// 中央通道 → 天公爐東側 → 糕粿攤前
const TO_KUEH = [COURT(-1.2, -3.3), KU(...KUEH_STALL_HOTSPOTS[0].point)]

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
  return page.evaluate((stallIds) => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const scene = d.cameraScene.current
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    let vendors = 0
    d.scene?.traverse((o) => {
      if (o.name === 'npc-temple-douhua-vendor' || o.name === 'npc-temple-kueh-vendor') vendors++
    })
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      cam: { x: c.x, y: c.y, z: c.z },
      camInside: scene.blockers.some((b) => inBox(c, b)),
      stalls: Object.fromEntries(stallIds.map((id) => [id, scene.buildings.some((b) => b.storeId === id)])),
      actionBar: scene.buildings.some((b) => b.storeId === 'action-bar'),
      market: scene.buildings.some((b) => b.storeId === 'yong-le-market'),
      vendors,
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      activeHotspot: s.activeHotspotId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      quality: document.documentElement.dataset.quality,
      prompt: document.querySelector('.shop-prompt.is-visible .shop-prompt__name')?.textContent ?? null,
    }
  }, STALLS)
}

/** 每一影格記錄鏡頭是否在遮擋方塊裡、鏡頭到人物胸口之間是否被擋住、人物每一影格移動的距離 */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__tsSampler ?? 0)
    const samples = []
    window.__tsSamples = samples
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
      window.__tsSampler = requestAnimationFrame(tick)
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
      const box = blockers.findIndex((b) => inBox(c, b))
      samples.push({ inside: box >= 0, blocked, step, at: box >= 0 ? { cam: [c.x, c.y, c.z].map((v) => +v.toFixed(2)), player: [p.x, p.z].map((v) => +v.toFixed(2)), box: blockers[box] } : null })
    }
    tick()
  })
}

function samplerStats(page) {
  return page.evaluate(() => {
    const samples = window.__tsSamples ?? []
    return {
      frames: samples.length,
      inside: samples.filter((item) => item.inside).length,
      blocked: samples.filter((item) => item.blocked).length,
      maxStep: samples.reduce((max, item) => Math.max(max, item.step), 0),
      insideAt: samples.filter((item) => item.at).slice(0, 3).map((item) => item.at),
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
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await waitFor(page, (goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, 60000)
  }
  const settle = () =>
    waitFor(
      page,
      () => {
        const d = window.__DDC__
        const p = d.playerState.position
        const now = { x: p.x, z: p.z, frame: d.frameCount }
        const prev = window.__tsSettle
        if (!prev || prev.frame === now.frame) {
          window.__tsSettle = prev ?? now
          return false
        }
        window.__tsSettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() =>
      page.evaluate(() => {
        window.__tsSettle = null
      }),
    )
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個路線點；原地不動太久就停下來回報卡住 */
  const walk = async (points, { tolerance = 0.28 } = {}) => {
    await page.evaluate((points) => {
      window.__tsRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__tsRoute
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
    const r = await page.evaluate(() => ({ i: window.__tsRoute.i, stuck: window.__tsRoute.stuck }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  const face = async (target, pitch = null) => {
    await page.evaluate(
      ({ t, pitch }) => {
        const d = window.__DDC__
        const p = d.playerState.position
        d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(t.x - p.x), -(t.z - p.z))
        if (pitch != null) d.cameraState.targetPitch = d.cameraState.pitch = pitch
      },
      { t: target, pitch },
    )
    await frames(8)
  }
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
  const distanceTo = (id) =>
    page.evaluate((id) => {
      const d = window.__DDC__
      const b = d.cameraScene.current.buildings.find((item) => item.id === id)?.parts[0]
      if (!b) return null
      const c = d.camera.position
      return Math.hypot(c.x - (b.minX + b.maxX) / 2, c.y - (b.minY + b.maxY) / 2, c.z - (b.minZ + b.maxZ) / 2)
    }, id)
  /** 鏡頭停下來（例如關閉介紹後鏡頭從介紹的位置回到人物背後）：之後再計算要點的位置，點下去時鏡頭不會再移動 */
  const cameraSettled = () =>
    waitFor(
      page,
      () => {
        const d = window.__DDC__
        const c = d.camera.position
        const now = { x: c.x, y: c.y, z: c.z, frame: d.frameCount }
        const prev = window.__camSettle
        if (!prev || prev.frame === now.frame) {
          window.__camSettle = prev ?? now
          return false
        }
        window.__camSettle = now
        return Math.hypot(now.x - prev.x, now.y - prev.y, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() =>
      page.evaluate(() => {
        window.__camSettle = null
      }),
    )
  const tapAt = async (point) => {
    if (touch) await page.touchscreen.tap(point.x, point.y)
    else await page.mouse.click(point.x, point.y)
  }
  const storyOpen = (name) => waitFor(page, (name) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === name, name, 60000)
  const storyIsOpen = () => page.evaluate(() => Boolean(document.querySelector('.story-layer')))
  const activeTab = () => page.evaluate(() => document.querySelector('.story__tab.is-active')?.textContent.replace(/^[壹貳參肆伍]/, '').trim() ?? null)
  const tabNames = () => page.$$eval('.story__tab', (items) => items.map((item) => item.textContent.replace(/^[壹貳參肆伍]/, '').trim()))
  const closeStory = async () => {
    await press(page.locator('.story__close'))
    const closed = await page
      .waitForSelector('.story-layer', { state: 'detached', timeout: 60000 })
      .then(() => true)
      .catch(() => false)
    await frames(4)
    return closed
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
  const directory = async () => {
    await press(page.locator('.hud-menu__toggle'))
    const entries = await page.$$eval('.menu-shop', (items) =>
      items.map((item) => ({
        name: item.querySelector('.menu-shop__name')?.textContent ?? '',
        open: Boolean(item.querySelector('.menu-shop__badge.is-open')),
        notes: [...item.querySelectorAll('.menu-shop__note')].map((note) => note.textContent),
      })),
    )
    if (await page.locator('#shop-menu-panel').isVisible()) await press(page.locator('.hud-menu__toggle'))
    await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
    return entries
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
  const checkNpcs = () =>
    page.evaluate(() => {
      const list = Object.entries(window.__DDC__.npcs ?? {}).filter(([id]) => id === 'temple-douhua-vendor' || id === 'temple-kueh-vendor')
      return { count: list.length, visible: list.filter(([, n]) => n.visible).length, items: Object.fromEntries(list.map(([id, n]) => [id, { elbow: n.elbow, nod: n.nod }])) }
    })
  const allFour = (s) => STALLS.every((id) => s.stalls[id])
  const noneOfNew = (s) => !s.stalls['temple-douhua-stall'] && !s.stalls['temple-kueh-stall'] && s.vendors === 0

  /* ── 1945–1980：廟口的四攤 ─────────────── */
  await page.goto(`${BASE_URL}?era=postwar&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'postwar', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'snacks'
  })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  const list = await directory()
  const find = (name) => list.find((item) => item.name === name)
  const dh = find('廟口豆花攤')
  const ku = find('廟口糕粿攤')
  record(
    test,
    '1945–1980 的店家名錄有「廟口豆花攤」「廟口糕粿攤」（可以探索、飲食文化情境示意、飲食主題），沒有導演的豆花店與好粿緣',
    Boolean(dh?.open && ku?.open) && dh.notes.includes('飲食文化情境示意') && ku.notes.includes('飲食文化情境示意') && dh.notes.some((t) => /豆花甜食文化/.test(t)) && ku.notes.some((t) => /糕粿米食文化/.test(t)) && !list.some((item) => /導演|好粿緣/.test(item.name)),
    `${dh?.notes.join('、')}；${ku?.notes.join('、')}`,
  )
  const atStart = await state(page)
  record(test, '1945–1980 的廟口：米苔目、魷魚羹、豆花、糕粿四攤都在，兩攤的攤販各一位', allFour(atStart) && atStart.vendors === 2 && !atStart.actionBar, JSON.stringify(atStart.stalls))

  // 走進廟埕、沿著中央通道到天公爐前
  await startSampler(page)
  const toCourt = await walk(TO_COURT)
  const courtStats = await samplerStats(page)
  record(test, touch ? '用搖桿從迪化街走進廟埕、沿著中央通道走到天公爐前' : '用鍵盤從迪化街走進廟埕、沿著中央通道走到天公爐前', toCourt.ok, toCourt.ok ? '' : `卡在第 ${toCourt.i} 點`)
  record(test, '走進廟埕的每一個影格：鏡頭不在方塊裡、看得到人物', courtStats.frames > 10 && courtStats.inside === 0 && courtStats.blocked <= Math.max(3, courtStats.frames * 0.05), `${courtStats.frames} 個影格：在方塊裡 ${courtStats.inside}、視線被擋 ${courtStats.blocked}${courtStats.insideAt.length ? `；${JSON.stringify(courtStats.insideAt)}` : ''}`)

  // 廟口全景：站在廟埕前緣，鏡頭拉高拉遠看整個廟埕
  await page.evaluate(({ x, z }) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, z)
    d.cameraState.snap = true
  }, COURT(-0.3, 2.3))
  await face(COURT(-0.3, -4.0), 0.42)
  const distance = await page.evaluate(() => {
    const d = window.__DDC__
    const previous = d.cameraState.targetDistance
    d.cameraState.targetDistance = 11
    return previous
  })
  await frames(20)
  await shot(page, `${device}-01-temple-court`)
  await page.evaluate((previous) => {
    window.__DDC__.cameraState.targetDistance = previous
  }, distance)
  await walk(TO_COURT.slice(-2))

  /* ── 豆花攤 ─────────────── */
  await startSampler(page)
  const toDouhua = await walk(TO_DOUHUA)
  await frames(4)
  const atDouhua = await state(page)
  const douhuaStats = await samplerStats(page)
  record(
    test,
    '從中央通道經過天公爐與用餐區之間，走到豆花攤前：提示「廟口的豆花攤」',
    toDouhua.ok && atDouhua.nearby === 'temple-douhua-stall' && atDouhua.hotspot === 'stall' && atDouhua.prompt === '廟口的豆花攤',
    `人物 (${round(atDouhua.x)}, ${round(atDouhua.z)})、提示「${atDouhua.prompt}」${toDouhua.ok ? '' : `；卡在第 ${toDouhua.i} 點`}`,
  )
  record(test, '走向豆花攤的每一個影格：鏡頭不在方塊裡、看得到人物', douhuaStats.frames > 5 && douhuaStats.inside === 0 && douhuaStats.blocked <= Math.max(3, douhuaStats.frames * 0.05), `${douhuaStats.frames} 個影格：在方塊裡 ${douhuaStats.inside}、視線被擋 ${douhuaStats.blocked}${douhuaStats.insideAt.length ? `；${JSON.stringify(douhuaStats.insideAt)}` : ''}`)
  const npcA = await checkNpcs()
  await frames(6)
  const npcB = await checkNpcs()
  const moving = ['temple-douhua-vendor', 'temple-kueh-vendor'].every((id) => {
    const a = npcA.items[id]
    const b = npcB.items[id]
    return a && b && (Math.abs(a.elbow - b.elbow) > 1e-4 || Math.abs(a.nod - b.nod) > 1e-4)
  })
  record(test, '兩攤的攤販（各一位）都顯示，手和頭在動', npcB.count === 2 && npcB.visible === 2 && moving, `顯示 ${npcB.visible}/${npcB.count}`)
  await face(DH(0.05, -0.2), 0.32)
  await shot(page, `${device}-02-douhua-stall`)
  await interact()
  const douhuaStory = await storyOpen('廟口豆花攤')
  const douhuaTabs = await tabNames()
  const douhuaTab = await activeTab()
  const douhuaMarks = await page.$$eval('.chapter__p', (items) => items.map((item) => item.textContent.split('｜')[0]))
  record(
    test,
    touch ? '點提示開啟「豆花與甜食攤」：分開標示說明、史料、情境設計與現代相關店家' : '按 E 開啟「豆花與甜食攤」：分開標示說明、史料、情境設計與現代相關店家',
    douhuaStory && douhuaTab === '豆花與甜食攤' && ['說明', '史料', '情境設計', '現代相關店家'].every((mark) => douhuaMarks.includes(mark)) && douhuaTabs.join('／') === '豆花與甜食攤／兩碗豆花／資料來源',
    `章節 ${douhuaTabs.join('／')}；目前 ${douhuaTab}`,
  )
  await press(page.locator('.story__tab').nth(douhuaTabs.length - 1))
  const douhuaMeta = await page.$$eval('.source__meta', (items) => items.length)
  const douhuaLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '豆花攤的資料來源：每一筆都有網址、出版時間與用途', douhuaLinks >= 4 && douhuaMeta === douhuaLinks, `${douhuaLinks} 筆、${douhuaMeta} 筆標示出版時間與用途`)
  const closed1 = await closeStory()
  await cameraSettled()
  const bowlsPoint = await screenPointOf('temple-douhua-bowls')
  if (closed1 && bowlsPoint?.inView) await tapAt(bowlsPoint)
  const bowlsStory = await storyOpen('廟口豆花攤')
  const bowlsState = await state(page)
  const bowlsTab = await activeTab()
  const bowlsFoods = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(
    test,
    touch ? '點推車上的兩碗：開啟「兩碗豆花」（原味糖水豆花、花生豆花）' : '用滑鼠點推車上的兩碗：開啟「兩碗豆花」（原味糖水豆花、花生豆花）',
    closed1 && Boolean(bowlsPoint?.inView) && bowlsStory && bowlsState.activeHotspot === 'bowls' && bowlsTab === '兩碗豆花' && bowlsFoods.join('、') === '原味糖水豆花、花生豆花',
    `介紹已關閉 ${closed1}、熱點 ${bowlsState.activeHotspot}、章節 ${bowlsTab}、圖鑑 ${bowlsFoods.join('、')}`,
  )
  if (bowlsStory) await closeStory()
  // 碰撞：朝推車走過去，會被擋在推車前
  const cart = DH(0, -0.3)
  await walk([cart], { tolerance: 0.1 })
  const atCart = await state(page)
  const gap = Math.hypot(atCart.x - cart.x, atCart.z - cart.z)
  record(test, '人物不能穿過豆花推車（碰撞）；推向推車不會卡住', gap > 0.55 && !atCart.camInside, `離推車中心 ${round(gap)} m`)
  const backOk = await walk(DOUHUA_BACK)
  record(test, '從豆花攤退回中央通道', backOk.ok, backOk.ok ? '' : `卡在第 ${backOk.i} 點`)

  /* ── 糕粿攤 ─────────────── */
  await startSampler(page)
  const toKueh = await walk(TO_KUEH)
  await frames(4)
  const atKueh = await state(page)
  const kuehStats = await samplerStats(page)
  record(
    test,
    '從中央通道經過天公爐東側，走到糕粿攤前：提示「廟口的糕粿攤」；每一個影格鏡頭都不在方塊裡',
    toKueh.ok && atKueh.nearby === 'temple-kueh-stall' && atKueh.hotspot === 'stall' && atKueh.prompt === '廟口的糕粿攤' && kuehStats.inside === 0 && kuehStats.blocked <= Math.max(3, kuehStats.frames * 0.05),
    `人物 (${round(atKueh.x)}, ${round(atKueh.z)})、提示「${atKueh.prompt}」、${kuehStats.frames} 個影格：在方塊裡 ${kuehStats.inside}、視線被擋 ${kuehStats.blocked}`,
  )
  await face(KU(0, -0.3), 0.36)
  await shot(page, `${device}-03-kueh-stall`)
  await interact()
  const kuehStory = await storyOpen('廟口糕粿攤')
  const kuehTabs = await tabNames()
  const kuehTitle = await page.evaluate(() => document.querySelector('.chapter__title, .chapter h3')?.textContent ?? null)
  const kuehMarks = await page.$$eval('.chapter__p', (items) => items.map((item) => item.textContent.split('｜')[0]))
  record(
    test,
    touch ? '點提示開啟「糕粿與日常／節慶米食」：說明、史料、節慶與日常的米食、現代相關店家' : '按 E 開啟「糕粿與日常／節慶米食」：說明、史料、節慶與日常的米食、現代相關店家',
    kuehStory && (await activeTab()) === '糕粿與米食' && ['說明', '史料', '節慶的米食', '日常與年節的米食', '現代相關店家'].every((mark) => kuehMarks.includes(mark)) && kuehTabs.join('／') === '糕粿與米食／四種米食／資料來源',
    `章節 ${kuehTabs.join('／')}；標題 ${kuehTitle}`,
  )
  await press(page.locator('.story__tab').nth(kuehTabs.length - 1))
  const kuehMeta = await page.$$eval('.source__meta', (items) => items.length)
  const kuehLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '糕粿攤的資料來源：每一筆都有網址、出版時間與用途', kuehLinks >= 8 && kuehMeta === kuehLinks, `${kuehLinks} 筆、${kuehMeta} 筆標示出版時間與用途`)
  const closed2 = await closeStory()
  await cameraSettled()
  const traysPoint = await screenPointOf('temple-kueh-trays')
  if (closed2 && traysPoint?.inView) await tapAt(traysPoint)
  const traysStory = await storyOpen('廟口糕粿攤')
  const traysState = await state(page)
  const traysOk = await waitFor(page, () => [...document.querySelectorAll('.food-card')].length === 4 && [...document.querySelectorAll('.food-card svg.food-illustration')].every((svg) => svg.childElementCount > 0), null, 30000)
  const traysFoods = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(
    test,
    touch ? '點托盤：開啟「四種傳統米食」（草仔粿、紅龜粿、芋粿、蘿蔔糕，四張圖鑑）' : '用滑鼠點托盤：開啟「四種傳統米食」（草仔粿、紅龜粿、芋粿、蘿蔔糕，四張圖鑑）',
    closed2 && Boolean(traysPoint?.inView) && traysStory && traysState.activeHotspot === 'trays' && (await activeTab()) === '四種米食' && traysOk && traysFoods.join('、') === '草仔粿、紅龜粿、芋粿、蘿蔔糕（菜頭粿）',
    `熱點 ${traysState.activeHotspot}、圖鑑 ${traysFoods.join('、')}`,
  )
  if (traysStory) await closeStory()

  /* ── 建築觀賞模式：聚焦兩攤與食物 ─────────────── */
  const beforeViewer = await state(page)
  await openSettings()
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  await viewerSettled()
  const focusChecks = []
  for (const [shopId, target, name] of [
    ['temple-douhua-stall', 'temple-douhua-bowls', 'douhua'],
    ['temple-kueh-stall', 'temple-kueh-trays', 'kueh'],
  ]) {
    await press(page.locator('.hud-menu__toggle'))
    await press(page.locator(`[data-focus-shop="${shopId}"]`))
    const focused = await viewerSettled()
    const atStall = await state(page)
    const point = await screenPointOf(target)
    if (point?.inView) await tapAt(point)
    const close = await viewerSettled()
    const s = await state(page)
    const dist = await distanceTo(target)
    const story = await storyIsOpen()
    await shot(page, `${device}-0${name === 'douhua' ? 4 : 5}-${name}-closeup`)
    focusChecks.push({ name, ok: focused && !atStall.camInside && Boolean(point?.inView) && close && !story && s.mode === 'explore' && !s.camInside && dist < 2.6, dist })
  }
  record(test, touch ? '觀賞模式從名錄聚焦兩攤、點兩碗豆花與托盤：近距離聚焦食物、不開啟介紹、不在方塊裡' : '觀賞模式從名錄聚焦兩攤、用滑鼠點兩碗豆花與托盤：近距離聚焦食物、不開啟介紹、不在方塊裡', focusChecks.every((item) => item.ok), focusChecks.map((item) => `${item.name} ${item.ok} ${round(item.dist ?? -1)} m`).join('、'))
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(test, '返回探索：人物還在糕粿攤前，鏡頭回到人物身邊', back && Math.hypot(returned.x - beforeViewer.x, returned.z - beforeViewer.z) < 0.05 && !returned.camInside)

  /* ── 切換畫質 ─────────────── */
  await openSettings()
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    const n = await checkNpcs()
    qualityChecks.push(applied && allFour(s) && n.visible === 2 && !s.camInside)
  }
  await closeSettings()
  record(test, '在攤位前切換畫質（流暢 ↔ 精緻）：四攤與攤販都仍顯示', qualityChecks.every(Boolean), qualityChecks.join('、'))

  /* ── 切換到 2000–現在 ─────────────── */
  const before = await media()
  const toRevival = await switchEra('revival')
  await closeSettings()
  const inRevival = await state(page)
  record(
    test,
    '在糕粿攤前切換到 2000–現在：豆花攤、糕粿攤與攤販都清除，人物在合法的位置；導演的豆花店與永樂市場都在',
    toRevival && noneOfNew(inRevival) && !inRevival.stalls['temple-mi-tai-mu-stall'] && !inRevival.stalls['temple-squid-stall'] && inRevival.actionBar && inRevival.market && !inRevival.camInside && inRevival.y === 0,
    `人物 (${round(inRevival.x)}, ${round(inRevival.z)})`,
  )
  const revivalList = await directory()
  record(test, '2000–現在的店家名錄有導演的豆花店與好粿緣，沒有廟口的豆花攤與糕粿攤', revivalList.some((item) => /導演的豆花店/.test(item.name)) && revivalList.some((item) => item.name === '好粿緣') && !revivalList.some((item) => /廟口豆花攤|廟口糕粿攤/.test(item.name)))

  const others = []
  for (const id of ['qing-port', 'banquet', 'modern']) {
    const ok = await switchEra(id)
    const s = await state(page)
    others.push(ok && noneOfNew(s))
  }
  record(test, '清末、酒樓、摩登三個年代：都沒有豆花攤與糕粿攤', others.every(Boolean), others.join('、'))
  const rounds = []
  for (let i = 0; i < ROUNDS; i++) {
    const a = await switchEra('postwar')
    const sa = await state(page)
    const b = await switchEra('revival')
    const sb = await state(page)
    const ok = a && b && allFour(sa) && sa.vendors === 2 && !sa.actionBar && noneOfNew(sb) && sb.actionBar && sb.market && !sa.camInside && !sb.camInside
    rounds.push(ok)
    console.log(`    往返 ${i + 1}：庶民生活 四攤 ${allFour(sa)}／攤販 ${sa.vendors}；老屋新生 兩攤 ${!noneOfNew(sb)}／豆花店 ${sb.actionBar}／市場 ${sb.market}${ok ? '' : '（失敗）'}`)
  }
  await closeSettings()
  const after = await media()
  record(test, `兩個年代往返 ${ROUNDS} 次（共 ${ROUNDS * 2 + 4} 次切換）：每次都只有當前年代的版本，沒有重新載入頁面`, rounds.length === ROUNDS && rounds.every(Boolean) && after.noReload === 'snacks', `${rounds.filter(Boolean).length}/${ROUNDS}`)
  record(test, '切換年代後服裝跟著年代、背景音樂沒有出錯', after.outfit !== null && (!after.music || after.music.status !== 'error') && before.noReload === after.noReload, `服裝 ${after.outfit}、音樂 ${after.music?.status ?? '無'}`)

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
