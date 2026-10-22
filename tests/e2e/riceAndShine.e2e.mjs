/**
 * 迪化街329號店屋（稻舍 Rice & Shine）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 2000–現在的店家名錄有「稻舍 Rice & Shine」（老屋再生・稻舍、可探索）
 *   2. 動線：街道 → 紅磚騎樓 → 入口 → 米食用餐區 → 米業展示 → 天井 → 後段（舊碾米機）→ 樓梯 → 二樓（《南街殷賑》）
 *      每一站的提示都是稻舍的熱點，按 E／點提示開啟對應章節；碾米是步驟動畫
 *   3. 點米斗桌與土礱：開啟「米斗」（可以拖曳旋轉的模型）與「竹籮與竹篩」；出口旁的「老屋再生」有時間軸
 *   4. 在店裡切換畫質：細部隱藏／顯示，室內仍在
 *   5. 建築觀賞模式：點米業展示的木架只聚焦、不開啟介紹
 *   6. 從街上走上二樓再走出來，連續 CYCLES 次：不卡住、鏡頭不在方塊裡
 *   7. 在店裡連續切換 10 次年代：每次都完成轉場、畫面不是黑的、人物在合法的位置；1930 的米行可以走進去、開啟「碾米」
 *   8. 年代、服裝、音樂不被重置；沒有頁面錯誤
 * 截圖（SHOTS，只在桌面）：2000 的立面、騎樓、用餐區、套餐、米業展示、天井、後段與樓梯、二樓、《南街殷賑》、
 * 1895 的街邊、1930 的立面與碾米間、米倉、1945 的立面與店內、碾米與米斗的介紹視窗。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/riceAndShine.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、CHROMIUM_EXECUTABLE（完整版 Chromium 的路徑）、DEVICES（desktop,touch）、
 *           SHOTS（截圖資料夾）、CYCLES（進出次數，預設 3）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { inflateSync } from 'node:zlib'
import { RICE_ROUTE, RS, riceToWorld } from '../../src/data/riceAndShineLayout.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 3)
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)
const ID = 'rice-and-shine-329'

const L = (x, z) => riceToWorld(x, z)
const MODERN_ROUTE = RICE_ROUTE.riceAndShineModern
const route = (ids, list = MODERN_ROUTE) => ids.map((id) => list.find((r) => r.id === id)).map((r) => ({ ...L(r.x, r.z), level: r.level ?? 0 }))
const IN_IDS = MODERN_ROUTE.map((r) => r.id).filter((id) => id !== 'street')
const OUT_IDS = [...MODERN_ROUTE].reverse().map((r) => r.id)
const A = L(-RS.half, RS.pierZ[0])
const B = L(RS.half, RS.back.minZ)
const inBuilding = (c) => c.x > Math.min(A.x, B.x) && c.x < Math.max(A.x, B.x) && c.z > Math.min(A.z, B.z) && c.z < Math.max(A.z, B.z)

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

/** 解開 PNG（8 位元 RGB／RGBA、不交錯），回傳平均亮度與標準差：用來判斷畫面不是黑的、也不是一片單色 */
function pngStats(buffer) {
  let offset = 8
  let width = 0
  let height = 0
  let channels = 4
  const idat = []
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      channels = data[9] === 6 ? 4 : 3
    } else if (type === 'IDAT') idat.push(data)
    offset += 12 + length
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const prev = Buffer.alloc(stride)
  const line = Buffer.alloc(stride)
  let sum = 0
  let sum2 = 0
  let n = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0
      const b = prev[i]
      const c = i >= channels ? prev[i - channels] : 0
      let v = row[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      line[i] = v & 255
    }
    for (let x = 0; x < width; x += 4) {
      const i = x * channels
      const lum = 0.2126 * line[i] + 0.7152 * line[i + 1] + 0.0722 * line[i + 2]
      sum += lum
      sum2 += lum * lum
      n++
    }
    line.copy(prev)
  }
  const mean = sum / n
  return { mean, std: Math.sqrt(Math.max(0, sum2 / n - mean * mean)) }
}

function state(page) {
  return page.evaluate((id) => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const scene = d.cameraScene.current
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    let interiorCount = 0
    d.scene?.traverse((o) => {
      if (o.name === `interior-${id}`) interiorCount++
    })
    const detail = d.scene?.getObjectByName(`interior-${id}-detail`)
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      level: d.playerState.level ?? 0,
      camInside: scene.blockers.some((b) => inBox(c, b)),
      interior: d.interiors?.[id] ?? null,
      detailVisible: detail ? detail.visible : null,
      interiorCount,
      building: scene.buildings.some((b) => b.storeId === id),
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      era: s.eraId,
      mode: s.mode,
      viewMode: s.viewMode,
      prompt: document.querySelector('.shop-prompt.is-visible .shop-prompt__name')?.textContent ?? null,
    }
  }, ID)
}

function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__rsSampler ?? 0)
    const samples = []
    window.__rsSamples = samples
    let last = -1
    let prev = null
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__rsSampler = requestAnimationFrame(tick)
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
    const samples = window.__rsSamples ?? []
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
        const prev = window.__rsSettle
        if (!prev || prev.frame === now.frame) {
          window.__rsSettle = prev ?? now
          return false
        }
        window.__rsSettle = now
        return Math.hypot(now.x - prev.x, now.z - prev.z) < 0.002
      },
      null,
      60000,
    ).then(() => page.evaluate(() => (window.__rsSettle = null)))
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個點；原地不動太久就回報卡住 */
  const walk = async (points, { tolerance = 0.22 } = {}) => {
    await page.evaluate((points) => {
      window.__rsRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__rsRoute
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
    const r = await page.evaluate(() => ({ i: window.__rsRoute.i, stuck: window.__rsRoute.stuck, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  const storyOpen = (title) => waitFor(page, (title) => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent.replace(/\s+/g, ' ').trim() === title, title, 60000)
  const tabLabel = (el) => [...el.childNodes].filter((node) => !node.classList?.contains('story__tab-number')).map((node) => node.textContent).join('').trim()
  const activeTab = () => page.evaluate((fn) => {
    const el = document.querySelector('.story__tab.is-active')
    return el ? new Function(`return (${fn})`)()(el) : null
  }, tabLabel.toString())
  const closeStory = async () => {
    if (!(await page.locator('.story__close').count())) return
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
    await closeSettings()
    await frames(8)
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
  const lookAt = (x, z) =>
    page.evaluate((t) => {
      const d = window.__DDC__
      const p = d.playerState.position
      d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(t.x - p.x), -(t.z - p.z))
      d.cameraState.snap = true
    }, L(x, z))
  const teleport = (x, z, level = 0) =>
    page.evaluate(
      ({ p, level, y }) => {
        const d = window.__DDC__
        d.playerState.position.set(p.x, y, p.z)
        d.playerState.level = level
        d.cameraState.snap = true
      },
      { p: L(x, z), level, y: level ? RS.floor2 : 0 },
    )
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
      document.documentElement.classList.add('rs-shot')
    }, { position, target })
    await frames(24)
    await page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 240000 })
    await page.evaluate(() => {
      delete window.__DDC__.cameraOverride
      document.documentElement.classList.remove('rs-shot')
      window.__DDC__.cameraState.snap = true
    })
    await frames(6)
  }
  const storyShot = async (name) => {
    if (!SHOTS || touch) return
    mkdirSync(SHOTS, { recursive: true })
    await page.waitForTimeout(900)
    await page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 240000 })
  }
  const at = (x, y, z) => [L(x, z).x, y, L(x, z).z]
  /** 走到某一站、確認提示是哪一個熱點，按 E／點提示開啟介紹並確認章節 */
  const stop = async (ids, hotspot, tab, title, extra = null) => {
    const w = await walk(route(ids))
    await frames(8)
    const s = await state(page)
    let opened = false
    let extraOk = true
    if (s.hotspot === hotspot) {
      await interact()
      opened = (await storyOpen(title)) && (await activeTab()) === tab
      if (extra) extraOk = await extra()
      await closeStory()
    }
    const ok = w.ok && s.nearby === ID && s.hotspot === hotspot && opened && extraOk
    console.log(`    ${hotspot}：${w.ok ? '走到' : `卡在第 ${w.i} 點`}、提示 ${s.prompt}（${s.hotspot}）、介紹 ${opened}${extra ? `、${extraOk}` : ''}、樓層 ${s.level}`)
    return { ok, s }
  }
  const processRuns = async () => {
    const first = await page.evaluate(() => document.querySelector('.process__step.is-active')?.textContent ?? null)
    await page.waitForTimeout(2200)
    const second = await page.evaluate(() => document.querySelector('.process__step.is-active')?.textContent ?? null)
    const steps = await page.locator('.process__step').count()
    return steps === 4 && first !== null && (touch || first !== second)
  }

  /* ── 開始：2000–現在 ─────────────── */
  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.addStyleTag({ content: 'html.rs-shot .hud, html.rs-shot .shop-prompt, html.rs-shot .hud-help, html.rs-shot .touch-controls { visibility: hidden !important; }' })
  await page.evaluate(() => (window.__noReload = 'rice-and-shine'))
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  // 店家名錄
  await press(page.locator('.hud-menu__toggle'))
  const entry = page.locator('.menu-shop', { has: page.locator('.menu-shop__name', { hasText: '稻舍 Rice & Shine' }) })
  const count = await entry.count()
  const notes = await entry.locator('.menu-shop__note').allTextContents()
  const open = await entry.locator('.menu-shop__badge.is-open').count()
  await press(page.locator('.hud-menu__toggle'))
  await page.waitForSelector('#shop-menu-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
  record(test, '店家名錄有「稻舍 Rice & Shine」，標示「老屋再生・稻舍」、可以探索', count === 1 && open === 1 && notes.includes('老屋再生・稻舍'), notes.join('、'))

  // 從街上走到騎樓
  await teleport(0, 3.0)
  await frames(10)
  await startSampler(page)
  const toArcade = await walk(route(['arcade']))
  await frames(6)
  const atArcade = await state(page)
  record(test, '從迪化街走到紅磚騎樓：提示是稻舍', toArcade.ok && atArcade.nearby === ID && atArcade.hotspot === 'rs-arcade' && atArcade.prompt === '稻舍 Rice & Shine', `(${round(atArcade.x)}, ${round(atArcade.z)}) 提示 ${atArcade.prompt}`)
  await interact()
  const firstStory = (await storyOpen('稻舍 Rice & Shine')) && (await activeTab()) === '稻舍'
  const tabs = await page.$$eval('.story__tab', (items, fn) => items.map((item) => new Function(`return (${fn})`)()(item)), tabLabel.toString())
  record(test, '按 E／點提示開啟介紹：稻舍，十個章節（米食料理、北街米業、米斗、碾米、竹籮與竹篩、天井、南街殷賑、老屋再生、參考文獻）', firstStory && tabs.length === 10 && tabs.includes('南街殷賑') && tabs.includes('老屋再生'), tabs.join('、'))
  await closeStory()

  // 一樓、天井、後段、樓梯與二樓
  const stops = []
  stops.push((await stop(['entrance', 'aisle', 'dining'], 'rs-dining', '米食料理', '稻舍 Rice & Shine')).ok)
  stops.push((await stop(['dining-back', 'to-exhibit', 'exhibit'], 'rs-exhibit', '北街米業', '稻舍 Rice & Shine')).ok)
  stops.push((await stop(['basket'], 'rs-basket', '竹籮與竹篩', '稻舍 Rice & Shine')).ok)
  stops.push((await stop(['measure'], 'rs-measure', '米斗', '稻舍 Rice & Shine')).ok)
  stops.push((await stop(['courtyard-door', 'courtyard'], 'rs-courtyard', '天井', '稻舍 Rice & Shine')).ok)
  stops.push((await stop(['back-door', 'back'], 'rs-milling', '碾米', '稻舍 Rice & Shine', processRuns)).ok)
  const upstairs = await stop(['to-stair', 'stair-foot', 'stair-start', 'stair-top', 'landing', 'corridor', 'upstairs', 'nanjie'], 'rs-nanjie', '南街殷賑', '稻舍 Rice & Shine')
  stops.push(upstairs.ok && upstairs.s.level === 1 && Math.abs(upstairs.s.y - RS.floor2) < 0.05)
  record(test, '動線：用餐區、米業展示、土礱、米斗、天井、舊碾米機（碾米的步驟動畫）、走上樓梯到二樓的《南街殷賑》', stops.every(Boolean), stops.join('、'))

  // 下樓，點米斗桌與土礱
  const down = await walk(route(['upstairs', 'corridor', 'landing', 'stair-top', 'stair-start', 'stair-foot', 'to-stair', 'back', 'back-door', 'courtyard', 'courtyard-door', 'measure', 'basket']))
  const clicks = []
  // 站在展示區前；店裡坐著用餐的客人會擋住跟隨鏡頭，用固定的構圖（開發版的鏡頭覆寫）看著要點的物件再點
  for (const [id, tab, check, camera, stand] of [
    ['rice-measure', '米斗', '.measure3d', [at(-0.6, 1.5, -4.6), at(-2.1, 0.85, -5.36)], [-1.25, -5.35]],
    ['rice-basket', '竹籮與竹篩', null, [at(-0.5, 1.6, -3.9), at(-2.1, 0.7, -4.65)], [-1.15, -4.5]],
  ]) {
    await page.evaluate((p) => window.__DDC__.playerState.position.set(p.x, 0, p.z), L(...stand))
    await frames(8)
    await page.evaluate(([position, target]) => (window.__DDC__.cameraOverride = { position, target }), camera)
    await frames(12)
    const point = await screenPointOf(id)
    let ok = false
    if (point?.inView) {
      await tapAt(point)
      await frames(2)
      await page.evaluate(() => delete window.__DDC__.cameraOverride)
      ok = (await storyOpen('稻舍 Rice & Shine')) && (await activeTab()) === tab
      if (ok && check) {
        await storyShot('17-story-measure')
        await page.waitForSelector('.measure3d__model', { state: 'attached', timeout: 30000 })
        const box = await page.locator(check).boundingBox()
        const before = await page.evaluate(() => document.querySelector('.measure3d__model')?.style.transform ?? null)
        if (touch) {
          await touchSend('touchStart', [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 3 }])
          await touchSend('touchMove', [{ x: box.x + box.width / 2 + 80, y: box.y + box.height / 2 + 10, id: 3 }])
          await touchSend('touchEnd', [])
        } else {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
          await page.mouse.down()
          await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 10, { steps: 6 })
          await page.mouse.up()
        }
        const after = await page.evaluate(() => document.querySelector('.measure3d__model')?.style.transform ?? null)
        // 拖曳只旋轉模型、不會換到別的章節
        ok = before !== null && after !== null && before !== after && (await activeTab()) === tab
      }
      await closeStory()
    }
    await page.evaluate(() => delete window.__DDC__.cameraOverride)
    clicks.push(ok)
  }
  record(test, '點米斗桌開啟「米斗」（可以拖曳旋轉的模型）、點土礱開啟「竹籮與竹篩」（直接點物件）', down.ok && clicks.every(Boolean), clicks.join('、'))

  // 出口旁的「老屋再生」
  const renewal = await walk([L(-0.6, -2.0), L(-1.15, -1.0)])
  await frames(6)
  const sr = await state(page)
  let timeline = 0
  if (sr.hotspot === 'rs-renewal') {
    await interact()
    if ((await storyOpen('稻舍 Rice & Shine')) && (await activeTab()) === '老屋再生') timeline = await page.locator('.timeline__step').count()
    await closeStory()
  }
  record(test, '出口旁的「老屋再生」：米行 → 產業衰退 → 歷史建築保存 → 稻舍的時間軸', renewal.ok && timeline >= 4, `${sr.hotspot}、${timeline} 個年份`)

  // 在店裡切換畫質
  await openSettings()
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && s.interiorCount === 1 && s.detailVisible === (target === 'fine') && !s.camInside)
  }
  await closeSettings()
  record(test, '在店裡切換畫質：流暢模式隱藏細部、精緻模式顯示；室內只有一份（一樓與二樓共用）', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 建築觀賞模式
  await page.evaluate((p) => window.__DDC__.playerState.position.set(p.x, 0, p.z), L(-0.3, -2.4))
  await lookAt(-2.4, -2.8)
  await frames(12)
  await openSettings()
  await press(page.locator('[data-view-mode="viewer"]').first())
  await closeSettings()
  const viewerReady = await waitFor(page, () => window.__DDC__.viewer?.phase === 'active', null, SETTLE_TIMEOUT)
  const focusChecks = []
  for (const id of ['rice-exhibit', 'rice-food']) {
    const point = await screenPointOf(id)
    if (point?.inView) await tapAt(point)
    await frames(60)
    const s = await state(page)
    focusChecks.push(s.mode === 'explore' && s.viewMode === 'viewer' && !s.camInside)
  }
  record(test, '觀賞模式：點米業展示的木架、桌上的套餐只聚焦，不開啟介紹，鏡頭不在方塊裡', viewerReady && focusChecks.every(Boolean), focusChecks.join('、'))
  await openSettings()
  await press(page.locator('[data-view-mode="explore"]').first())
  await closeSettings()
  await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore', null, 30000)
  await frames(10)

  // 截圖（桌面、2000–現在）
  await shot('01-revival-facade', at(1.2, 1.7, 6.1), at(-0.2, 3.7, 0.6))
  await shot('02-arcade', at(-2.1, 1.55, 1.25), at(1.5, 2.2, 0.2))
  await shot('03-dining', at(1.95, 1.65, -0.75), at(-0.6, 0.85, -4.2))
  await shot('04-meal', at(0.15, 1.25, -1.55), at(0.15, 0.76, -2.15))
  await shot('05-exhibit', at(0.4, 1.5, -3.0), at(-2.4, 1.3, -4.4))
  await shot('06-courtyard', at(1.9, 1.6, -6.2), at(-2.5, 2.0, -7.0))
  await shot('07-back-stair', at(-1.8, 1.7, -8.1), at(1.0, 1.4, -10.2))
  await shot('08-upstairs', at(1.9, RS.floor2 + 1.6, -5.4), at(-1.0, RS.floor2 + 0.9, 0.6))
  await shot('09-nanjie', at(0.5, RS.floor2 + 1.6, -2.4), at(2.6, RS.floor2 + 1.6, -2.7))

  // 連續進出
  const out = await walk(route(['entrance', 'arcade', 'street']), { tolerance: 0.3 })
  const before = await media()
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk(route(IN_IDS))
    const sa = await state(page)
    const b = await walk(route(OUT_IDS.slice(1)))
    const sb = await state(page)
    const ok = a.ok && b.ok && inBuilding(sa) && sa.level === 1 && Math.abs(sa.y - RS.floor2) < 0.05 && !inBuilding(sb) && sb.level === 0 && sb.y === 0 && !sa.camInside && !sb.camInside
    cycles.push(ok)
    console.log(`    第 ${i + 1} 次：上到二樓 (${round(sa.x)}, ${round(sa.y)}, ${round(sa.z)})${a.ok ? '' : `（卡在第 ${a.i} 點）`}、回到街上 (${round(sb.x)}, ${round(sb.z)})${b.ok ? '' : `（卡在第 ${b.i} 點）`}`)
  }
  const stats = await samplerStats(page)
  const after = await media()
  record(
    test,
    `街上 ↔ 稻舍二樓連續進出 ${CYCLES} 次：不卡門、桌椅、天井或樓梯，鏡頭不在方塊裡`,
    out.ok && cycles.length === CYCLES && cycles.every(Boolean) && stats.inside === 0 && stats.maxStep < 0.6,
    `${cycles.filter(Boolean).length}/${CYCLES}、${stats.frames} 個影格中鏡頭在方塊裡 ${stats.inside}${stats.insideAt.length ? `；${JSON.stringify(stats.insideAt)}` : ''}`,
  )
  const musicKept = !before.music || (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount)
  record(test, '進出不重置年代、服裝與音樂，也沒有重新載入頁面', after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'rice-and-shine')

  // 在店裡連續切換 10 次年代
  await walk(route(['arcade', 'entrance', 'aisle', 'dining']))
  const sequence = ['modern', 'postwar', 'banquet', 'revival', 'qing-port', 'modern', 'revival', 'postwar', 'banquet', 'revival']
  const switches = []
  for (const [i, eraId] of sequence.entries()) {
    const ok = await switchEra(eraId)
    await frames(10)
    const s = await state(page)
    const png = await page.screenshot({ clip: touch ? { x: 290, y: 205, width: 600, height: 410 } : { x: 400, y: 225, width: 800, height: 450 } })
    const { mean, std } = pngStats(png)
    const placeOk = eraId === 'banquet' || eraId === 'qing-port' ? !inBuilding(s) && s.y === 0 : true
    const buildingOk = eraId === 'qing-port' ? !s.building : s.building
    const pass = ok && s.era === eraId && mean > 18 && std > 4 && placeOk && buildingOk && !s.camInside
    switches.push(pass)
    console.log(`    第 ${i + 1} 次 → ${eraId}：轉場 ${ok}、亮度 ${mean.toFixed(1)}±${std.toFixed(1)}、人物 (${round(s.x)}, ${round(s.z)}) ${inBuilding(s) ? '店裡' : '店外'}、建築 ${s.building}`)
    if (eraId === 'banquet' && i === 2) await shot('10-1895-street', at(-1.4, 1.7, 6.6), at(-0.6, 1.6, 1.4))
    if (eraId === 'postwar' && i === 1) {
      await shot('14-1945-facade', at(-1.6, 1.8, 6.3), at(0.1, 3.6, 0.6))
      await shot('15-1945-interior', at(1.6, 1.7, -0.6), at(-1.0, 1.0, -4.0))
    }
    if (eraId === 'modern' && i === 0) {
      await shot('11-1930-facade', at(-1.6, 1.8, 6.3), at(0.1, 3.6, 0.6))
      await shot('12-1930-mill', at(1.6, 1.7, -0.6), at(-1.0, 1.0, -4.0))
      await shot('13-1930-granary', at(0.4, 1.6, -7.9), at(-1.0, 1.0, -10.4))
    }
    // 回到店裡，下一次切換時人物在店裡
    if (eraId !== 'banquet' && eraId !== 'qing-port' && !inBuilding(s)) await walk(route(['arcade', 'entrance', 'aisle', 'dining']))
  }
  record(test, '在店裡連續切換 10 次年代：每次都完成轉場、畫面不是黑的；1895 與 1853 把人物移到街上', switches.every(Boolean), switches.join('、'))

  // 1930：米行與碾米間
  await switchEra('modern')
  await teleport(0, 3.0)
  await frames(10)
  const mill = await walk(route(['arcade', 'entrance', 'counter', 'machine'], RICE_ROUTE.riceMill))
  await frames(8)
  const sm = await state(page)
  let millOk = false
  if (sm.hotspot === 'mill-machine') {
    await interact()
    millOk = (await storyOpen('迪化街329號米行／碾米間')) && (await activeTab()) === '碾米' && (await processRuns())
    await storyShot('16-story-milling')
    await closeStory()
  }
  const noBrand = await page.evaluate(() => !document.querySelector('.story-layer') && !document.body.textContent.includes('稻舍 Rice & Shine'))
  record(test, '1930：走進米行，碾米機的提示開啟「碾米」步驟動畫；畫面上沒有「稻舍」', mill.ok && millOk && noBrand, `${sm.prompt}（${sm.hotspot}）`)
  const back = await switchEra('revival')
  record(test, '切回 2000–現在：沒有重新載入頁面', back && (await media()).noReload === 'rice-and-shine')

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
