/**
 * 清末搭船（港口商街）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤，精緻畫質）與 iPad 尺寸（觸控，流暢畫質）各跑一次：
 *   1. 棧橋頭：走近駁船船夫出現「交談」與「搭船」兩張提示；交談可以開啟
 *   2. 搭船：划船的動畫（鏡頭在棧橋頭）、黑幕、到了帆船人物在甲板的樓層；「略過」有效
 *   3. 甲板：沿路線走一圈（舷梯口→蓆篷→桅→船首→回來）不卡住、鏡頭不在遮擋方塊裡；甲板細部載入而且看得到
 *   4. 器物：四件都能近看（五個分頁、在哪家店、出處、小動作）；舵工與水手可以交談
 *   5. 落水：從甲板邊走出去 → 水花、黑幕 → 回到棧橋頭、面向街道；從棧橋邊走出去也一樣；連續 CYCLES 次
 *   6. 回程：甲板的舷梯口「回棧橋」，回到棧橋頭
 *   7. 在甲板上切換年代：人物在棧橋頭（新的年代沒有甲板），再切回港口商街仍在棧橋頭；划船途中不能換年代
 *   8. 沒有頁面錯誤
 * 截圖（SHOTS）：棧橋頭的提示、划船途中、甲板、近看、落水。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/qingBoarding.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、CYCLES（落水次數，預設 3）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { BOARDING_SPOTS, BOAT_LEVEL, CREW, DECK_Y, PIER_HEAD, QING_BOARDING_ERA, deckEntryWorld, junkToWorld } from '../../src/data/qingBoardingLayout.js'
import { QING_BOARDING_INSPECTABLES } from '../../src/data/qingBoardingObjects.js'
import { talkForNpc, TALK_RADIUS } from '../../src/data/talk.js'
import { groundAt, resolvePlayerPosition } from '../../src/game/collision.js'
import { PLAYER } from '../../src/game/config.js'
import { buildEraWorldSync } from '../../src/game/world/buildWorld.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 3)
const TIMEOUT = Number(process.env.TIMEOUT ?? 240000)

/* ── Node 端：和遊戲相同的碰撞，算出每件器物與每位人物旁可以站的位置 ── */
const world = buildEraWorldSync(QING_BOARDING_ERA)
/** 站得住而且不是水面（甲板四周的水面也是可以走的範圍，踩到就落水） */
function walkableAt(x, z, level) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision, level)
  return Math.hypot(p.x - x, p.z - z) < 1e-6 && !groundAt(p, world.collision, level).water
}
function standNear([x, , z], radius, level, others = [], minDistance = 0) {
  let best = null
  for (let gx = x - radius; gx <= x + radius; gx += 0.1) {
    for (let gz = z - radius; gz <= z + radius; gz += 0.1) {
      const d = Math.hypot(gx - x, gz - z)
      if (d > radius - 0.3 || d < minDistance || !walkableAt(gx, gz, level)) continue
      const rival = Math.min(...others.map(([ox, oz, r]) => (Math.hypot(gx - ox, gz - oz) < r ? Math.hypot(gx - ox, gz - oz) : Infinity)))
      const margin = rival - d
      if (margin > 0.25 && (!best || margin > best.margin)) best = { x: gx, z: gz, margin }
    }
  }
  return best
}
const crew = world.npcs.filter((npc) => CREW.some((member) => member.id === npc.id))
// 器物旁的站位：要比其他器物與人物都近（只提示比較近的那一個）
const ITEMS = QING_BOARDING_INSPECTABLES.map((item) => ({
  ...item,
  stand: standNear(item.position, item.radius, BOAT_LEVEL, [
    ...crew.map((npc) => [npc.position[0], npc.position[2], TALK_RADIUS]),
    ...QING_BOARDING_INSPECTABLES.filter((other) => other.id !== item.id).map((other) => [other.position[0], other.position[2], other.radius]),
  ]),
}))
const NPCS = crew.map((npc) => ({ id: npc.id, at: { x: npc.position[0], z: npc.position[2] }, stand: standNear(npc.position, TALK_RADIUS, BOAT_LEVEL, QING_BOARDING_INSPECTABLES.map((item) => [item.position[0], item.position[2], item.radius]), 1.2) }))
const entry = deckEntryWorld()
const L = (x, z) => {
  const [wx, wz] = junkToWorld([x, z])
  return { x: wx, z: wz }
}
/** 和 tests/qingBoarding.test.js 相同的甲板路線 */
const DECK_ROUTE = [L(-3.0, -1.2), L(-1.2, -0.3), L(0.8, -1.3), L(0.8, 1.3), L(1.5, 1.3), L(4.0, 1.2), L(4.0, -1.2), L(-3.0, 1.15)]
const EMBARK = BOARDING_SPOTS.find((spot) => spot.action === 'board')
const BOATMAN_STAND = { x: -47.0, z: -0.3 }

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
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      level: d.playerState.level,
      heading: d.playerState.heading,
      camInside: d.cameraScene.current.blockers.some((b) => inBox(c, b)),
      cam: [c.x, c.y, c.z],
      era: s.eraId,
      phase: s.boardingPhase,
      boarding: d.boarding,
      talkNpc: s.nearbyTalkNpcId,
      inspectable: s.nearbyInspectableId,
      boardingSpot: s.nearbyBoardingId,
      deck: d.interiors?.['qing-junk-deck'] ?? null,
      prompts: [...document.querySelectorAll('.street-prompt.is-visible .shop-prompt__name')].map((e) => e.textContent),
      boardingButtons: [...document.querySelectorAll('.street-prompt.is-visible [data-boarding].is-visible, .boarding-prompt.is-visible')].map((e) => e.dataset.boarding),
      caption: document.querySelector('.boarding-caption')?.textContent ?? null,
      veil: Number(document.querySelector('.boarding-veil')?.style.opacity ?? 0),
    }
  })
}

function startSampler(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    cancelAnimationFrame(window.__qbSampler ?? 0)
    const samples = []
    window.__qbSamples = samples
    let last = -1
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__qbSampler = requestAnimationFrame(tick)
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
    cancelAnimationFrame(window.__qbSampler ?? 0)
    const samples = window.__qbSamples ?? []
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
  /** 沿著路線走：按住前進，每個影格把鏡頭轉到人物背後、朝向下一個點；原地不動太久就回報卡住；落水時停 */
  const walk = async (points, tolerance = 0.25) => {
    await page.evaluate((points) => {
      window.__qbRoute = { points, i: 0, still: 0, last: null, stuck: false, fell: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__qbRoute
        const p = d.playerState.position
        if (d.frameCount === r.frame) return false
        r.frame = d.frameCount
        if (d.boarding?.phase === 'fallen') {
          r.fell = true
          return true
        }
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
    const r = await page.evaluate(() => ({ i: window.__qbRoute.i, stuck: window.__qbRoute.stuck, fell: window.__qbRoute.fell, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  /** 瞬移到 p（level：樓層）；給了 face 時鏡頭轉到人物背後、面向 face */
  const teleport = (p, face = null, level = 0) =>
    page.evaluate(
      ({ p, face, level }) => {
        const d = window.__DDC__
        d.playerState.position.set(p.x, 0, p.z)
        d.playerState.level = level
        if (face) d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(face.x - p.x), -(face.z - p.z))
        d.cameraState.snap = true
      },
      { p, face, level },
    )
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
  /** 按 E，或在觸控時點寫著 name 的那張提示卡（轉鏡頭直到卡片在畫面裡） */
  const interactVisible = async (name) => {
    if (!touch) return page.keyboard.press('KeyE')
    const card = page.locator('.street-prompt.is-visible .shop-prompt__card').filter({ hasText: name }).first()
    const viewport = page.viewportSize()
    for (const turn of [0, 0.6, -0.6, 1.2, -1.2, 2.0, -2.0, Math.PI]) {
      if (turn) {
        await page.evaluate((turn) => {
          const d = window.__DDC__
          d.cameraState.targetYaw = d.cameraState.yaw = d.cameraState.yaw + turn
          d.cameraState.snap = true
        }, turn)
        await frames(6)
      }
      const box = await card.boundingBox().catch(() => null)
      if (box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height) break
    }
    await card.tap({ timeout: 30000 })
  }
  const shot = async (name) => {
    if (!SHOTS) return
    mkdirSync(SHOTS, { recursive: true })
    await page.screenshot({ path: join(SHOTS, `${name}-${device}.png`), timeout: TIMEOUT })
  }
  /** 用開發模式的固定鏡頭拍（人物留在原地） */
  const shotFrom = async (name, position, target) => {
    if (!SHOTS) return
    await page.evaluate(({ position, target }) => {
      window.__DDC__.cameraOverride = { position, target }
    }, { position, target })
    await frames(12)
    await shot(name)
    await page.evaluate(() => {
      delete window.__DDC__.cameraOverride
      window.__DDC__.cameraState.snap = true
    })
    await frames(6)
  }
  const waitPhase = (phase, timeout = 30000) => waitFor(page, (phase) => window.__DDC__.useGameStore.getState().boardingPhase === phase, phase, timeout, 100)

  /** 走近一件器物、開啟檢視、檢查五個分頁與小動作 */
  const inspectItem = async (item, shotName) => {
    if (!item.stand) return { ok: false, detail: '找不到可以站的位置' }
    await teleport(item.stand, { x: item.position[0], z: item.position[2] }, BOAT_LEVEL)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyInspectableId === id, item.id, 20000)
    if (!near) return { ok: false, detail: `沒有提示（${JSON.stringify(await state(page))}）` }
    await frames(4)
    await interactVisible(item.label)
    const open = await waitFor(page, () => document.querySelector('.inspect-layer[data-state="open"]'), null, 20000)
    if (!open) return { ok: false, detail: '沒有開啟檢視' }
    const layered = await page.locator('.inspect-layers').count()
    let tabs = 0
    let places = []
    let sources = 0
    if (layered) {
      tabs = await page.locator('.inspect-layers__tab').count()
      // 切到「在哪家店」與「照片與文獻」：觸控時偶爾點不到，確認面板真的換了（最多再點兩次）
      const showTab = async (n, id) => {
        for (let attempt = 0; attempt < 3; attempt++) {
          await press(page.locator('.inspect-layers__tab').nth(n))
          if (await waitFor(page, (id) => document.getElementById('inspect-layer-panel')?.getAttribute('aria-labelledby') === id, id, 2000, 100)) return true
        }
        return false
      }
      await showTab(3, 'inspect-tab-where')
      await page.waitForTimeout(200)
      places = await page.locator('.inspect-layers__places li').allTextContents()
      await showTab(4, 'inspect-tab-evidence')
      await page.waitForTimeout(200)
      sources = await page.locator('.inspect-layers__panel .inspect-card__sources').count()
    }
    const actions = await page.locator('.inspect-card__actions button').count()
    if (actions) await press(page.locator('.inspect-card__actions button').first())
    await page.waitForTimeout(1000)
    if (shotName) await shot(shotName)
    await press(page.locator('.inspect-close'))
    const closed = await waitFor(page, () => !window.__DDC__.useGameStore.getState().inspect, null, 10000)
    await page.waitForTimeout(300)
    // 茶箱沿用舊的「說明與出處」（沒有分層），其他三件有五層
    const ok = closed && actions > 0 && (!layered || (tabs === 5 && places.length > 0 && sources === 1))
    return { ok, detail: layered ? `分頁 ${tabs}、在哪家店 ${places.length} 筆、出處 ${sources}、動作 ${actions}` : `說明與出處、動作 ${actions}` }
  }
  const talkTo = async (npc, level = BOAT_LEVEL) => {
    if (!npc.stand) return false
    await teleport(npc.stand, npc.at, level)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyTalkNpcId === id, npc.id, 20000)
    if (!near) return false
    await frames(4)
    await interactVisible(talkForNpc(QING_BOARDING_ERA, npc.id).role)
    const open = await waitFor(page, () => document.querySelector('.dialogue-layer[data-state="open"] .dialogue__line'), null, 15000)
    if (!open) return false
    await press(page.locator('.dialogue__close'))
    await waitFor(page, () => !window.__DDC__.useGameStore.getState().talk, null, 10000)
    await page.waitForTimeout(300)
    return open
  }

  /* ── 開始：港口商街 ─────────────── */
  await page.goto(`${BASE_URL}?era=qing-port&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'qing-port', null, { timeout: 120000 })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2000)

  // 1. 棧橋頭的提示
  await teleport(BOATMAN_STAND, { x: EMBARK.position[0], z: EMBARK.position[2] })
  const nearEmbark = await waitFor(page, () => window.__DDC__.useGameStore.getState().nearbyBoardingId === 'embark', null, 20000)
  await frames(6)
  let s = await state(page)
  record(test, '棧橋頭：走近駁船出現船夫的「交談」提示與併在卡上的「搭船」', nearEmbark && s.boardingButtons.includes('embark') && s.prompts.includes('駁船船夫'), `${s.prompts.join('、')}；${s.boardingButtons.join('、')}`)
  await shot('01-pier-prompts')
  record(test, '棧橋頭：和駁船船夫交談', await talkTo({ id: 'qing-boatman', at: { x: EMBARK.position[0], z: EMBARK.position[2] }, stand: BOATMAN_STAND }, 0))

  // 2. 搭船（第一次用略過，第二次看完整段）
  await teleport(BOATMAN_STAND, { x: EMBARK.position[0], z: EMBARK.position[2] })
  await waitFor(page, () => window.__DDC__.useGameStore.getState().nearbyBoardingId === 'embark', null, 20000)
  await frames(4)
  // 船夫的「交談」同時在範圍裡，E 會先交談：搭船點提示卡（電腦用滑鼠、iPad 用觸控）
  await press(page.locator('[data-boarding="embark"].is-visible'))
  const departing = await waitPhase('departing', 10000)
  await page.waitForTimeout(1500)
  s = await state(page)
  const rideCam = s.cam[0] > -48 && s.cam[0] < -44 && s.cam[1] > 2
  record(test, '搭船：划船中（鏡頭在棧橋頭、人物在駁船上、有說明與「略過」）', departing && rideCam && s.caption?.includes('駁船') && (await page.locator('[data-boarding-skip]').count()) === 1, `鏡頭 ${s.cam.map(round)}、人物 (${round(s.x)}, ${round(s.z)})`)
  await shot('02-ride')
  await press(page.locator('[data-boarding-skip]'))
  const aboard = await waitPhase('aboard', 15000)
  await page.waitForTimeout(800)
  s = await state(page)
  record(test, '略過：直接到帆船，人物在甲板的樓層、甲板細部載入', aboard && s.level === BOAT_LEVEL && Math.abs(s.y - DECK_Y) < 0.01 && s.deck?.loaded && s.deck?.visible, `樓層 ${s.level}、y ${round(s.y)}、(${round(s.x)}, ${round(s.z)})`)
  record(test, '划船途中與剛到船上都沒有頁面錯誤', errors.length === 0, errors.slice(0, 2).join(' | '))

  // 3. 甲板上走一圈
  await teleport({ x: entry.x, z: entry.z }, DECK_ROUTE[0], BOAT_LEVEL)
  await frames(8)
  await startSampler(page)
  const loop = await walk(DECK_ROUTE)
  const sampled = await samplerStats(page)
  s = await state(page)
  record(test, '甲板：沿路線走一圈不卡住、沒落水、鏡頭不在遮擋方塊裡', loop.ok && !loop.fell && s.level === BOAT_LEVEL && sampled.inside === 0, `第 ${loop.i}/${DECK_ROUTE.length} 點、${sampled.frames} 個影格、${sampled.inside} 個在方塊裡 ${JSON.stringify(sampled.at)}`)
  // 從船首上方往船尾拍整個甲板（人物在舷梯口）
  await shotFrom('03-deck', junkToWorld([6.5, 3.4, 3.2]), junkToWorld([-1.0, 1.3, 0]))

  // 4. 器物與人物
  for (const [i, item] of ITEMS.entries()) {
    const r = await inspectItem(item, i === 1 ? '04-inspect-camphor' : null)
    record(test, `甲板：近看「${item.label}」`, r.ok, r.detail)
  }
  for (const npc of NPCS) record(test, `甲板：和船上的人交談（${npc.id}）`, await talkTo(npc))

  // 5. 落水：從甲板邊走出去 CYCLES 次（回到棧橋頭後再瞬移上甲板），再從棧橋邊走出去一次
  const falls = []
  for (let i = 0; i < CYCLES; i++) {
    await teleport({ x: entry.x, z: entry.z }, null, BOAT_LEVEL)
    await page.evaluate(() => {
      window.__DDC__.useGameStore.setState({ boardingPhase: 'aboard' })
    })
    await frames(6)
    const off = L(-3.0, 3.0)
    const w = await walk([off], 0.2)
    const fell = w.fell || (await waitPhase('fallen', 5000))
    if (i === 0) {
      await page.waitForTimeout(250)
      await shot('05-splash')
    }
    const back = await waitPhase('ashore', 15000)
    await frames(10)
    const st = await state(page)
    const atPier = Math.hypot(st.x - PIER_HEAD.x, st.z - PIER_HEAD.z) < 0.5 && st.level === 0 && Math.abs(st.y) < 0.01
    const facing = Math.abs(Math.atan2(Math.sin(st.heading - PIER_HEAD.heading), Math.cos(st.heading - PIER_HEAD.heading))) < 0.2
    falls.push(fell && back && atPier && facing && !st.camInside)
    console.log(`    → 第 ${i + 1} 次落水：落水 ${fell}、回岸 ${back}、人物 (${round(st.x)}, ${round(st.z)}) 樓層 ${st.level}、面向街道 ${facing}、鏡頭 ${st.camInside ? '在方塊裡' : '正常'}`)
  }
  record(test, `落水：從甲板邊走出去 ${CYCLES} 次，每次都回到棧橋頭、面向街道`, falls.every(Boolean), falls.join('、'))
  await teleport({ x: -48.5, z: 0 }, { x: -48.5, z: 4 })
  await frames(6)
  const pierFall = await walk([{ x: -48.5, z: 4 }], 0.2)
  const pierFell = pierFall.fell || (await waitPhase('fallen', 5000))
  const pierBack = await waitPhase('ashore', 15000)
  await frames(10)
  s = await state(page)
  record(test, '落水：從棧橋邊走出去也會落水，回到棧橋頭', pierFell && pierBack && Math.hypot(s.x - PIER_HEAD.x, s.z - PIER_HEAD.z) < 0.5 && s.level === 0, `(${round(s.x)}, ${round(s.z)})`)
  record(test, '落水時沒有頁面錯誤', errors.length === 0, errors.slice(0, 2).join(' | '))

  // 6. 搭船看完整段，再從舷梯口回程
  await teleport(BOATMAN_STAND, { x: EMBARK.position[0], z: EMBARK.position[2] })
  await waitFor(page, () => window.__DDC__.useGameStore.getState().nearbyBoardingId === 'embark', null, 20000)
  await frames(4)
  await page.evaluate(() => window.__DDC__.useGameStore.getState().requestBoarding('board'))
  const started = await waitPhase('departing', 10000)
  const t0 = Date.now()
  const arrived = await waitPhase('aboard', 20000)
  const seconds = (Date.now() - t0) / 1000
  await page.waitForTimeout(600)
  s = await state(page)
  record(test, '搭船：看完整段划船（約 6 秒）到甲板', started && arrived && seconds > 4 && seconds < 12 && s.level === BOAT_LEVEL, `${round(seconds)} 秒`)
  const disembark = BOARDING_SPOTS.find((spot) => spot.action === 'return')
  await teleport({ x: entry.x, z: entry.z }, { x: disembark.position[0], z: disembark.position[2] }, BOAT_LEVEL)
  const nearReturn = await waitFor(page, () => window.__DDC__.useGameStore.getState().nearbyBoardingId === 'disembark', null, 20000)
  await frames(4)
  s = await state(page)
  record(test, '甲板：舷梯口出現「回棧橋」（併在舵工的卡上）', nearReturn && s.boardingButtons.includes('disembark'), `${s.prompts.join('、')}；${s.boardingButtons.join('、')}`)
  await press(page.locator('[data-boarding="disembark"].is-visible'))
  const returning = await waitPhase('returning', 10000)
  await page.waitForTimeout(800)
  // 划船途中不能換年代
  const refused = await page.evaluate(() => window.__DDC__.useGameStore.getState().requestEra('banquet') === false)
  await press(page.locator('[data-boarding-skip]'))
  const landed = await waitPhase('ashore', 15000)
  await frames(10)
  s = await state(page)
  record(test, '回程：搭駁船回到棧橋頭（略過有效）、划船途中不能換年代', returning && refused && landed && Math.hypot(s.x - PIER_HEAD.x, s.z - PIER_HEAD.z) < 0.5 && s.level === 0 && s.era === 'qing-port', `(${round(s.x)}, ${round(s.z)})`)

  // 7. 在甲板上切換年代
  await teleport({ x: entry.x, z: entry.z }, null, BOAT_LEVEL)
  await page.evaluate(() => {
    window.__DDC__.useGameStore.setState({ boardingPhase: 'aboard' })
  })
  await frames(6)
  const toBanquet = await switchEra('banquet')
  await frames(20)
  s = await state(page)
  const onPier = Math.hypot(s.x - PIER_HEAD.x, s.z - PIER_HEAD.z) < 0.5 && s.level === 0
  record(test, '在甲板上切換到酒樓繁華：人物回到棧橋頭、不在遮擋方塊裡、搭船狀態回到岸上', toBanquet && onPier && !s.camInside && s.phase === 'ashore', `(${round(s.x)}, ${round(s.z)}) 樓層 ${s.level}、${s.phase}`)
  const backToQing = await switchEra('qing-port')
  await frames(20)
  s = await state(page)
  record(test, '切回港口商街：人物仍在棧橋頭、不會被放回船上', backToQing && Math.hypot(s.x - PIER_HEAD.x, s.z - PIER_HEAD.z) < 0.6 && s.level === 0, `(${round(s.x)}, ${round(s.z)})`)

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: !process.env.HEADED, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  for (const device of DEVICES) await runDevice(browser, device)
} finally {
  await browser.close()
}
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} 項通過`)
if (failed.length) {
  for (const r of failed) console.log(`  ✘ [${r.test}] ${r.step}${r.detail ? ` — ${r.detail}` : ''}`)
  process.exit(1)
}
