/**
 * 林華泰茶行各年代室內（第 11 階段）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 酒樓繁華、摩登、庶民生活、老屋新生：從街上走進店後深處再走出來，不卡住、鏡頭不在遮擋方塊裡，室內載入而且看得到
 *   2. 每件可以近看的器物：走近出現提示，按 E／點提示開啟 3D 檢視；有五個分頁（外觀構造→…→照片與文獻），
 *      「在哪家店」列出年代與店家、「照片與文獻」列出出處；小動作按鈕可以按
 *   3. 店裡的人物：走近出現「交談」，開啟對話
 *   4. 老屋新生連續進出 CYCLES 次；在店裡切換年代（含港口商街），人物都在可以站的地方
 *   5. 沒有頁面錯誤
 * 截圖（SHOTS）：兩種裝置都拍（桌面 1600×900、iPad 1180×820），每個年代的店內與器物檢視。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/linHuaTai.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 *           CYCLES（進出次數，預設 3）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LIN_HUA_TAI_BY_ERA } from '../../src/data/linHuaTaiEraConfig.js'
import { lhtEraToWorld } from '../../src/data/linHuaTaiLayout.js'
import { getEra } from '../../src/data/eras.js'
import { inspectablesOfEra } from '../../src/data/inspectObjects.js'
import { talkForNpc, TALK_RADIUS } from '../../src/data/talk.js'
import { resolvePlayerPosition } from '../../src/game/collision.js'
import { PLAYER } from '../../src/game/config.js'
import { buildEraWorldSync } from '../../src/game/world/buildWorld.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 3)
const TIMEOUT = Number(process.env.TIMEOUT ?? 240000)
const ID = 'lin-hua-tai'
const LATER = ['banquet', 'modern', 'postwar', 'revival']
const W = (x, z) => lhtEraToWorld(x, z)

/** 和 tests/linHuaTai.test.js 相同的路線（本地座標） */
const ROUTES = {
  banquet: [[0.4, 1.0], [0.4, -0.6], [0.5, -4.4], [0.1, -5.6], [0.15, -9.9]],
  modern: [[0, 1.0], [0, -0.6], [-0.2, -4.0], [0, -5.1], [-1.3, -5.1], [-1.3, -9.8], [0.5, -9.85]],
  postwar: [[0, 1.0], [0, -0.6], [-0.6, -3.0], [-0.6, -4.6], [0, -5.6], [-0.15, -8.9]],
  revival: [[0, 1.0], [0, -0.6], [-0.75, -1.2], [-0.75, -4.6], [0, -5.0], [0, -6.0], [0.05, -9.3]],
}
const route = (eraId) => ROUTES[eraId].map(([x, z]) => W(x, z))

/* ── Node 端：每件器物與每位人物旁邊可以站的位置（和遊戲相同的碰撞） ── */
const worlds = Object.fromEntries([...LATER, 'qing-port'].map((eraId) => [eraId, buildEraWorldSync(eraId)]))
function walkableAt(world, x, z) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}
/**
 * 走近 target 的位置：站得到、在 radius 裡，而且 target 比其他會搶提示的對象（others，路人與器物只提示比較近的）更近；
 * 取 target 最占優勢的一點（遊戲的取捨規則見 game/interactionPick.js）。
 */
function standNear(world, [x, , z], radius, others) {
  let best = null
  for (let gx = x - radius; gx <= x + radius; gx += 0.1) {
    for (let gz = z - radius; gz <= z + radius; gz += 0.1) {
      const d = Math.hypot(gx - x, gz - z)
      if (d > radius - 0.3 || !walkableAt(world, gx, gz)) continue
      const rival = Math.min(...others.map(([ox, oz, r]) => (Math.hypot(gx - ox, gz - oz) < r ? Math.hypot(gx - ox, gz - oz) : Infinity)))
      const margin = rival - d
      if (margin > 0.25 && (!best || margin > best.margin)) best = { x: gx, z: gz, margin }
    }
  }
  return best
}
const PLAN = Object.fromEntries(
  LATER.map((eraId) => {
    const world = worlds[eraId]
    const inspectables = inspectablesOfEra(eraId)
    const talkers = world.npcs.filter((npc) => talkForNpc(eraId, npc.id))
    const items = inspectables
      .filter((item) => item.shopId === ID)
      .map((item) => ({ ...item, stand: standNear(world, item.position, item.radius, talkers.map((npc) => [npc.position[0], npc.position[2], TALK_RADIUS])) }))
    const npcs = talkers
      .filter((npc) => npc.zone === ID)
      .map((npc) => ({ id: npc.id, stand: standNear(world, npc.position, TALK_RADIUS, inspectables.map((item) => [item.position[0], item.position[2], item.radius])) }))
    return [eraId, { items, npcs }]
  }),
)

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
  return page.evaluate((id) => {
    const d = window.__DDC__
    const p = d.playerState.position
    const c = d.camera.position
    const s = d.useGameStore.getState()
    const scene = d.cameraScene.current
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    return {
      x: p.x,
      z: p.z,
      camInside: scene.blockers.some((b) => inBox(c, b)),
      interior: d.interiors?.[id] ?? null,
      era: s.eraId,
      nearby: s.nearbyShopId,
      hotspot: s.nearbyHotspotId,
      inspectable: s.nearbyInspectableId,
      talkNpc: s.nearbyTalkNpcId,
    }
  }, ID)
}

/** 每個影格記下鏡頭是否在遮擋方塊裡（走路時） */
function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__lhtSampler ?? 0)
    const samples = []
    window.__lhtSamples = samples
    let last = -1
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__lhtSampler = requestAnimationFrame(tick)
      if (d.frameCount === last) return
      last = d.frameCount
      const s = d.useGameStore.getState()
      if (s.viewMode !== 'explore' || s.mode !== 'explore' || s.transitioning) return
      const c = d.camera.position
      const box = d.cameraScene.current.blockers.findIndex((b) => inBox(c, b))
      samples.push(box >= 0 ? [c.x, c.y, c.z].map((v) => +v.toFixed(2)) : null)
    }
    tick()
  })
}
const samplerStats = (page) =>
  page.evaluate(() => {
    cancelAnimationFrame(window.__lhtSampler ?? 0)
    const samples = window.__lhtSamples ?? []
    return { frames: samples.length, inside: samples.filter(Boolean).length, at: samples.filter(Boolean).slice(0, 3) }
  })

async function runDevice(browser, device) {
  const touch = device === 'touch'
  const test = touch ? 'iPad 觸控・流暢' : '桌面・精緻'
  const quality = touch ? 'smooth' : 'fine'
  const context = await browser.newContext(touch ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false } : { viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(TIMEOUT)
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
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個點；原地不動太久就回報卡住 */
  const walk = async (points, tolerance = 0.25) => {
    await page.evaluate((points) => {
      window.__lhtRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__lhtRoute
        const p = d.playerState.position
        if (d.frameCount === r.frame) return false
        r.frame = d.frameCount
        let t = r.points[r.i]
        while (t && Math.hypot(t.x - p.x, t.z - p.z) < tolerance) t = r.points[++r.i]
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
      TIMEOUT,
      'raf',
    )
    await release()
    await frames(6)
    const r = await page.evaluate(() => ({ i: window.__lhtRoute.i, stuck: window.__lhtRoute.stuck, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  const teleport = (p) =>
    page.evaluate((p) => {
      const d = window.__DDC__
      d.playerState.position.set(p.x, 0, p.z)
      d.cameraState.snap = true
    }, p)
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
    const ok = await waitFor(page, (id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id, id, TIMEOUT)
    await closeSettings()
    await frames(8)
    return ok
  }
  const interactVisible = async () => {
    if (touch) await page.locator('.shop-prompt.is-visible .shop-prompt__card').first().tap()
    else await page.keyboard.press('KeyE')
  }
  const shot = async (name, position, target) => {
    if (!SHOTS) return
    mkdirSync(SHOTS, { recursive: true })
    await page.evaluate(({ position, target }) => {
      window.__DDC__.cameraOverride = { position, target }
      document.documentElement.classList.add('lht-shot')
    }, { position, target })
    await frames(24)
    await page.screenshot({ path: join(SHOTS, `${name}-${device}.png`), timeout: TIMEOUT })
    await page.evaluate(() => {
      delete window.__DDC__.cameraOverride
      document.documentElement.classList.remove('lht-shot')
      window.__DDC__.cameraState.snap = true
    })
    await frames(6)
  }
  const at = (x, y, z) => [W(x, z).x, y, W(x, z).z]

  /** 走近一件器物、開啟檢視、檢查五個分頁與小動作 */
  const inspectItem = async (eraId, item, shotName) => {
    if (!item.stand) return { ok: false, detail: '找不到可以站的位置' }
    await teleport(item.stand)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyInspectableId === id, item.id, 20000)
    if (!near) return { ok: false, detail: `沒有提示（${JSON.stringify(await state(page))}）` }
    await frames(4)
    await interactVisible()
    const open = await waitFor(page, () => document.querySelector('.inspect-layer[data-state="open"] .inspect-layers'), null, 20000)
    if (!open) return { ok: false, detail: '沒有開啟分層檢視' }
    const tabs = await page.locator('.inspect-layers__tab').count()
    await press(page.locator('.inspect-layers__tab').nth(3))
    const places = await page.locator('.inspect-layers__places li').allTextContents()
    const eraTitle = getEra(eraId).title
    await press(page.locator('.inspect-layers__tab').nth(4))
    const sources = await page.locator('.inspect-layers__panel .inspect-card__sources').count()
    await press(page.locator('.inspect-card__actions button').first())
    await page.waitForTimeout(1200)
    if (SHOTS && shotName) {
      mkdirSync(SHOTS, { recursive: true })
      await page.screenshot({ path: join(SHOTS, `${shotName}-${device}.png`), timeout: TIMEOUT })
    }
    await press(page.locator('.inspect-close'))
    const closed = await waitFor(page, () => !window.__DDC__.useGameStore.getState().inspect, null, 10000)
    await page.waitForTimeout(400)
    const ok = tabs === 5 && places.some((text) => text.includes(eraTitle)) && sources === 1 && closed
    return { ok, detail: `分頁 ${tabs}、在哪家店 ${places.length} 筆、出處 ${sources}` }
  }
  const talkTo = async (npc) => {
    if (!npc.stand) return false
    await teleport(npc.stand)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyTalkNpcId === id, npc.id, 20000)
    if (!near) return false
    await frames(4)
    await interactVisible()
    const open = await waitFor(page, () => document.querySelector('.dialogue-layer[data-state="open"] .dialogue__line'), null, 15000)
    await press(page.locator('.dialogue__close'))
    await waitFor(page, () => !window.__DDC__.useGameStore.getState().talk, null, 10000)
    await page.waitForTimeout(400)
    return open
  }

  /* ── 開始：1895–1930 ─────────────── */
  await page.goto(`${BASE_URL}?era=banquet&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'banquet', null, { timeout: 120000 })
  await page.addStyleTag({ content: 'html.lht-shot .hud, html.lht-shot .shop-prompt, html.lht-shot .hud-help, html.lht-shot .touch-controls { visibility: hidden !important; }' })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  for (const eraId of LATER) {
    const label = `${getEra(eraId).yearRange} ${LIN_HUA_TAI_BY_ERA[eraId].label}`
    if (eraId !== 'banquet') record(test, `切換到 ${eraId}`, await switchEra(eraId))
    await teleport(W(0, 2.4))
    await frames(10)
    await startSampler(page)
    const inside = await walk(route(eraId))
    const s = await state(page)
    const loaded = await waitFor(page, (id) => window.__DDC__.interiors?.[id]?.loaded && window.__DDC__.interiors[id].visible, ID, 60000)
    record(test, `${label}：從街上走到店後深處，室內載入而且看得到`, inside.ok && loaded, `到 (${round(s.x)}, ${round(s.z)})、第 ${inside.i} 點`)

    if (eraId === 'banquet') {
      await shot('01-1895-front', at(1.4, 1.75, -0.4), at(-1.0, 0.9, -3.6))
      await shot('02-1895-sorting', at(0.9, 1.8, -5.5), at(-1.6, 0.6, -8.0))
    } else if (eraId === 'modern') {
      await shot('03-1930-roastery', at(1.25, 2.15, -4.9), at(-0.6, 0.3, -8.6))
      await shot('04-1930-front', at(-0.6, 1.75, -0.4), at(1.0, 0.9, -3.4))
    } else if (eraId === 'postwar') {
      await shot('05-1945-front', at(-0.9, 1.8, -0.4), at(1.2, 0.8, -3.8))
      await shot('06-1945-dryer', at(-0.3, 2.0, -5.4), at(0.6, 0.6, -9.2))
    } else {
      await shot('07-2000-drums', at(1.2, 1.8, -0.4), at(-1.0, 0.7, -3.6))
      await shot('08-2000-back', at(0.2, 2.1, -5.7), at(-0.8, 0.5, -9.4))
    }

    const plan = PLAN[eraId]
    const inspected = []
    for (const [i, item] of plan.items.entries()) {
      const r = await inspectItem(eraId, item, i === 0 ? `inspect-${eraId}-${item.objectId}` : null)
      inspected.push(r.ok)
      record(test, `${label}：近看「${item.label}」——五個分頁、在哪家店、出處、小動作`, r.ok, r.detail)
    }
    for (const npc of plan.npcs) record(test, `${label}：和店裡的人物交談（${npc.id}）`, await talkTo(npc))

    // 走回街上
    await teleport(route(eraId).at(-1))
    await frames(8)
    const out = await walk([...route(eraId)].reverse().concat([W(0, 2.4)]))
    const sampled = await samplerStats(page)
    record(test, `${label}：走回街上；走路時鏡頭不在遮擋方塊裡`, out.ok && sampled.inside === 0, `${sampled.frames} 個影格、${sampled.inside} 個在方塊裡 ${JSON.stringify(sampled.at)}`)
  }

  // 老屋新生：連續進出
  const cycles = []
  await startSampler(page)
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk(route('revival'))
    const b = await walk([...route('revival')].reverse().concat([W(0, 2.4)]))
    cycles.push(a.ok && b.ok)
  }
  const cycleSamples = await samplerStats(page)
  record(test, `老屋新生：連續進出 ${CYCLES} 次不卡住、鏡頭不在方塊裡`, cycles.every(Boolean) && cycleSamples.inside === 0, `${cycles.join('、')}；${cycleSamples.inside}/${cycleSamples.frames}`)

  // 在店裡切換年代（含港口商街）：人物在可以站的地方、鏡頭不在方塊裡
  await walk(route('revival').slice(0, 4))
  const switches = []
  for (const eraId of ['qing-port', 'postwar', 'banquet', 'modern', 'revival']) {
    const ok = await switchEra(eraId)
    await frames(20)
    const s = await state(page)
    const fine = walkableAt(worlds[eraId] ?? buildEraWorldSync(eraId), s.x, s.z)
    switches.push(ok && fine && !s.camInside)
    console.log(`    → ${eraId}：轉場 ${ok}、人物 (${round(s.x)}, ${round(s.z)}) ${fine ? '可以站' : '不能站'}、鏡頭 ${s.camInside ? '在方塊裡' : '正常'}`)
  }
  record(test, '在店裡連續切換年代：人物都在可以站的地方、鏡頭不在方塊裡', switches.every(Boolean), switches.join('、'))

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
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
