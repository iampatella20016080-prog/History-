/**
 * 江山樓室內（第 11 階段，酒樓繁華）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；寫法同 tests/e2e/youJi.e2e.mjs）
 *
 * 桌面（鍵盤 WASD，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 酒樓繁華：從街上走過門廳到廚房門口，走樓梯上二樓的宴會廳，再下樓走出來；
 *      不卡住、鏡頭不在遮擋方塊裡，室內載入而且看得到
 *   2. 每件可以近看的器物：走近出現提示，按 E／點提示開啟 3D 檢視；有五個分頁（外觀構造→…→照片與文獻），
 *      「在哪家店」列出年代與店家、「照片與文獻」列出出處；小動作按鈕可以按
 *   3. 店裡的人物：走近出現「交談」，開啟對話
 *   4. 老屋新生連續上下樓、進出 CYCLES 次；在店裡（一樓與二樓）切換年代（含港口商街），人物都在可以站的地方
 *   5. 沒有頁面錯誤
 * 截圖（SHOTS）：兩種裝置都拍（桌面 1600×900、iPad 1180×820），每個年代的店內與器物檢視。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/jiangShanLou.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 *           CYCLES（進出次數，預設 3）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSL_SHELL, JSL_UPPER, jslToWorld } from '../../src/data/jiangShanLouLayout.js'
import { getEra } from '../../src/data/eras.js'
import { getShop } from '../../src/data/shops.js'
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
const ID = 'jiang-shan-lou'
const F2 = JSL_SHELL.floor2.y
/** 各樓層的地板高度（level → y） */
const FLOOR_Y = { 0: 0, 1: F2, ...Object.fromEntries(JSL_UPPER.map((f) => [f.level, f.y])) }
const ROOF_Y = JSL_UPPER.at(-1).y
const LATER = ['banquet']
const W = (x, z) => jslToWorld(x, z)

/** 和 tests/jiangShanLouInterior.test.js 相同的路線（本地座標）：一樓走過正廳、天井到加工廠；上樓梯、二樓走到後段再回前段 */
const BACK = [[0, 1.0], [0, -0.6], [-0.4, -3.5], [-2.5, -6.3]]
const STAIRS_UP = [[0, -0.6], [4.5, -0.75], [4.5, -1.6], [4.5, -6.2]]
const UPSTAIRS = [[3.0, -6.3], [2.6, -4.0], [2.6, -1.0]]
const toWorld = (points) => points.map(([x, z]) => W(x, z))
const route = () => toWorld(BACK)
const upRoute = () => toWorld([BACK[0], ...STAIRS_UP, ...UPSTAIRS])

/* ── Node 端：每件器物與每位人物旁邊可以站的位置（和遊戲相同的碰撞） ── */
const worlds = Object.fromEntries([...LATER, 'qing-port'].map((eraId) => [eraId, buildEraWorldSync(eraId)]))
function walkableAt(world, x, z, level = 0) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision, level)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}
/**
 * 走近 target 的位置：站得到、在 radius 裡，而且 target 比其他會搶提示的對象（others，路人與器物只提示比較近的）更近；
 * 取 target 最占優勢的一點（遊戲的取捨規則見 game/interactionPick.js）。
 */
function standNear(world, [x, , z], radius, others, minDistance = 0, level = 0, prompt = null, target = 1.3) {
  let best = null
  for (let gx = x - radius; gx <= x + radius; gx += 0.1) {
    for (let gz = z - radius; gz <= z + radius; gz += 0.1) {
      const d = Math.hypot(gx - x, gz - z)
      if (d > radius - 0.3 || d < minDistance || !walkableAt(world, gx, gz, level)) continue
      const rival = Math.min(...others.map(([ox, oz, r]) => (Math.hypot(gx - ox, gz - oz) < r ? Math.hypot(gx - ox, gz - oz) : Infinity)))
      // 優勢超過 1 公尺就算一樣好；一樣好時挑離提示約 target 公尺的位置（鏡頭拍得到提示卡；器物 1.3、人物 2.0），
      // 不要挑到擺設與牆之間的角落（鏡頭擠在角落時，提示卡會在畫面外）
      const margin = Math.min(rival - d, 1)
      const near = prompt ? Math.abs(Math.hypot(gx - prompt[0], gz - prompt[2]) - target) : 0
      if (rival - d > 0.25 && (!best || margin > best.margin + 1e-9 || (Math.abs(margin - best.margin) < 1e-9 && near < best.near))) best = { x: gx, z: gz, margin, near }
    }
  }
  return best
}
const PLAN = Object.fromEntries(
  LATER.map((eraId) => {
    const world = worlds[eraId]
    const inspectables = inspectablesOfEra(eraId)
    const talkers = world.npcs.filter((npc) => talkForNpc(eraId, npc.id))
    const lv = (item) => item.level ?? 0
    const items = inspectables
      .filter((item) => item.shopId === ID)
      .map((item) => ({
        ...item,
        // 會搶提示的對象：同一層可以交談的人與其他器物（器物之間也只提示最近的一件）
        stand: standNear(world, item.position, item.radius, [
          ...talkers.filter((npc) => lv(npc) === lv(item)).map((npc) => [npc.position[0], npc.position[2], TALK_RADIUS]),
          ...inspectables.filter((other) => other.id !== item.id && lv(other) === lv(item)).map((other) => [other.position[0], other.position[2], other.radius]),
        ], 0, lv(item), item.prompt),
      }))
    // 路人和器物、路人和店家的熱點都是只提示比較近的：站的位置要離路人最近（同一層）
    const hotspots = getShop(ID, eraId).hotspots
    const npcs = talkers
      .filter((npc) => npc.zone?.startsWith(ID))
      .map((npc) => ({
        id: npc.id,
        eraId,
        level: lv(npc),
        at: { x: npc.position[0], z: npc.position[2] },
        stand: standNear(world, npc.position, TALK_RADIUS, [...inspectables.filter((item) => lv(item) === lv(npc)).map((item) => [item.position[0], item.position[2], item.radius]), ...hotspots.filter((h) => lv(h) === lv(npc)).map((h) => [h.point.x, h.point.z, h.radius])], 1.2, lv(npc), npc.position, 2.0),
      }))
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
    cancelAnimationFrame(window.__yjSampler ?? 0)
    const samples = []
    window.__yjSamples = samples
    let last = -1
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__yjSampler = requestAnimationFrame(tick)
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
    cancelAnimationFrame(window.__yjSampler ?? 0)
    const samples = window.__yjSamples ?? []
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
      window.__yjRoute = { points, i: 0, still: 0, last: null, stuck: false }
    }, points)
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__yjRoute
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
    const r = await page.evaluate(() => ({ i: window.__yjRoute.i, stuck: window.__yjRoute.stuck, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  /** 瞬移到 p（level 1：二樓的樓板上）；給了 face 時鏡頭轉到人物背後、面向 face（像走過去時一樣看得到提示） */
  const teleport = (p, face = null, level = 0) =>
    page.evaluate(
      ({ p, face, level, y }) => {
        const d = window.__DDC__
        d.playerState.level = level
        d.playerState.position.set(p.x, y, p.z)
        if (face) d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(face.x - p.x), -(face.z - p.z))
        d.cameraState.snap = true
      },
      { p, face, level, y: FLOOR_Y[level] ?? 0 },
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
  /** 按 E，或在觸控時點寫著 name 的那張提示卡（店家熱點的提示可能同時出現） */
  const interactVisible = async (name) => {
    if (!touch) return page.keyboard.press('KeyE')
    const card = page.locator('.street-prompt.is-visible .shop-prompt__card').filter({ hasText: name }).first()
    // 提示卡要在畫面裡才點得到（玩家會轉鏡頭）：不在畫面裡就把鏡頭往左右轉，直到看得到
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
    try {
      await card.tap({ timeout: 30000 })
    } catch (error) {
      if (SHOTS) await page.screenshot({ path: join(SHOTS, `fail-${name}-${device}.png`) }).catch(() => {})
      throw error
    }
  }
  const shot = async (name, position, target) => {
    if (!SHOTS) return
    mkdirSync(SHOTS, { recursive: true })
    // 拍照時主角先站到店門外的簷下（不擋住店內的構圖；仍在室內的載入範圍裡）
    const away = W(2.3, 1.0)
    await page.evaluate(({ position, target, away }) => {
      const d = window.__DDC__
      window.__yjBack = d.playerState.position.toArray()
      window.__yjLevel = d.playerState.level
      d.playerState.level = 0
      d.playerState.position.set(away.x, 0, away.z)
      d.cameraOverride = { position, target }
      document.documentElement.classList.add('yj-shot')
    }, { position, target, away })
    await frames(24)
    await page.screenshot({ path: join(SHOTS, `${name}-${device}.png`), timeout: TIMEOUT })
    await page.evaluate(() => {
      const d = window.__DDC__
      delete d.cameraOverride
      d.playerState.level = window.__yjLevel
      d.playerState.position.fromArray(window.__yjBack)
      document.documentElement.classList.remove('yj-shot')
      d.cameraState.snap = true
    })
    await frames(6)
  }
  const at = (x, y, z) => [W(x, z).x, y, W(x, z).z]

  /** 走近一件器物、開啟檢視、檢查五個分頁與小動作 */
  const inspectItem = async (eraId, item, shotName) => {
    if (!item.stand) return { ok: false, detail: '找不到可以站的位置' }
    await teleport(item.stand, { x: item.position[0], z: item.position[2] }, item.level ?? 0)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyInspectableId === id, item.id, 20000)
    if (!near) return { ok: false, detail: `沒有提示（${JSON.stringify(await state(page))}）` }
    await frames(4)
    await interactVisible(item.label)
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
    // 人物的提示在頭頂上方：站在 1.2 公尺以外、面向人物，提示才在畫面裡
    await teleport(npc.stand, npc.at, npc.level)
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyTalkNpcId === id, npc.id, 20000)
    if (!near) return false
    await frames(4)
    await interactVisible(talkForNpc(npc.eraId, npc.id).role)
    const open = await waitFor(page, () => document.querySelector('.dialogue-layer[data-state="open"] .dialogue__line'), null, 15000)
    await press(page.locator('.dialogue__close'))
    await waitFor(page, () => !window.__DDC__.useGameStore.getState().talk, null, 10000)
    await page.waitForTimeout(400)
    return open
  }

  /* ── 開始：1895–1930 ─────────────── */
  await page.goto(`${BASE_URL}?era=banquet&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'banquet', null, { timeout: 120000 })
  await page.addStyleTag({ content: 'html.yj-shot .hud, html.yj-shot .shop-prompt, html.yj-shot .hud-help, html.yj-shot .touch-controls { visibility: hidden !important; }' })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  for (const eraId of LATER) {
    const label = `${getEra(eraId).yearRange} 江山樓`
    if (eraId !== 'banquet') record(test, `切換到 ${eraId}`, await switchEra(eraId))
    await teleport(W(0, 1.3))
    await frames(10)
    await startSampler(page)
    const inside = await walk(route(eraId))
    const s = await state(page)
    const loaded = await waitFor(page, (id) => window.__DDC__.interiors?.[id]?.loaded && window.__DDC__.interiors[id].visible, ID, 60000)
    record(test, `${label}：從街上走過門廳到廚房門口，室內載入而且看得到`, inside.ok && loaded, `到 (${round(s.x)}, ${round(s.z)})、第 ${inside.i} 點`)
    // 上樓：回到門廳、走到右側的樓梯、爬上去、走進宴會廳
    await teleport(W(0, -0.6))
    await frames(6)
    const up = await walk(upRoute(eraId).slice(1))
    const level = await page.evaluate(() => [window.__DDC__.playerState.level, window.__DDC__.playerState.position.y])
    record(test, `${label}：走樓梯上二樓的宴會廳`, up.ok && level[0] === 1 && Math.abs(level[1] - F2) < 0.05, `第 ${up.i} 點、樓層 ${level[0]}、高度 ${round(level[1])}`)
    const down = await walk([...upRoute(eraId).slice(1)].reverse())
    const level0 = await page.evaluate(() => window.__DDC__.playerState.level)
    record(test, `${label}：下樓回到門廳`, down.ok && level0 === 0, `第 ${down.i} 點、樓層 ${level0}`)
    // 一路爬到樓頂庭園：二樓、三樓的大廳與走廊、四樓樓梯間（和單元測試相同的路線），再一路走回門廳
    const TO_ROOF = toWorld([[0, -0.6], [4.5, -0.75], [4.5, -1.6], [4.5, -6.2], [4.5, -6.6], [4.5, -10.9], [3.0, -10.9], [3.0, -7.4], [2.0, -6.0], [2.6, -0.8], [4.5, -0.75], [4.5, -5.0], [4.5, -6.2], [4.5, -10.4], [1.4, -10.4], [1.25, -9.0], [1.25, -3.4]])
    await teleport(W(0, -0.6), null, 0)
    await frames(6)
    const roof = await walk(TO_ROOF.slice(1))
    const top = await page.evaluate(() => [window.__DDC__.playerState.level, window.__DDC__.playerState.position.y])
    record(test, `${label}：一路爬到樓頂庭園`, roof.ok && top[0] === 4 && Math.abs(top[1] - ROOF_Y) < 0.05, `第 ${roof.i} 點、樓層 ${top[0]}、高度 ${round(top[1])}`)
    await shot('05-third-floor', at(3.2, FLOOR_Y[2] + 1.9, -0.9), at(-1.8, FLOOR_Y[2] + 0.8, -4.6))
    await shot('06-small-room', at(1.4, FLOOR_Y[1] + 1.8, -8.3), at(-3.0, FLOOR_Y[1] + 0.8, -9.8))
    await shot('07-roof-garden', at(3.4, ROOF_Y + 2.2, -0.9), at(-2.6, ROOF_Y + 0.6, -7.2))
    await shot('08-facade', at(0, 1.8, 6.6), at(0, 9.5, 0))
    const back = await walk([...TO_ROOF].reverse())
    const lv = await page.evaluate(() => window.__DDC__.playerState.level)
    record(test, `${label}：從樓頂一路走回門廳`, back.ok && lv === 0, `第 ${back.i} 點、樓層 ${lv}`)

    await shot('01-lobby', at(1.6, 1.8, -0.8), at(-3.0, 1.6, -4.0))
    await shot('02-stairs', at(-1.0, 1.8, -1.2), at(4.5, 2.2, -4.6))
    await shot('03-banquet-room', at(3.2, F2 + 1.9, -0.9), at(-1.8, F2 + 0.8, -4.2))
    await shot('04-banquet-plaques', at(1.0, F2 + 1.7, -1.8), at(-1.0, F2 + 2.0, -7.0))

    const plan = PLAN[eraId]
    const inspected = []
    for (const [i, item] of plan.items.entries()) {
      const r = await inspectItem(eraId, item, i === 0 ? `inspect-${eraId}-${item.objectId}` : null)
      inspected.push(r.ok)
      record(test, `${label}：近看「${item.label}」——五個分頁、在哪家店、出處、小動作`, r.ok, r.detail)
    }
    for (const npc of plan.npcs) record(test, `${label}：和店裡的人物交談（${npc.id}）`, await talkTo(npc))

    // 走回街上
    await teleport(route(eraId).at(-1), null, 0)
    await frames(8)
    const out = await walk([...route(eraId)].reverse().concat([W(0, 1.3)]))
    const sampled = await samplerStats(page)
    record(test, `${label}：走回街上；走路時鏡頭不在遮擋方塊裡`, out.ok && sampled.inside === 0, `${sampled.frames} 個影格、${sampled.inside} 個在方塊裡 ${JSON.stringify(sampled.at)}`)
  }

  // 酒樓繁華：連續上下樓、進出
  const cycles = []
  await teleport(W(0, 1.3), null, 0)
  await frames(8)
  await startSampler(page)
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk(upRoute('banquet'))
    const b = await walk([...upRoute('banquet')].reverse().concat([W(0, 1.3)]))
    cycles.push(a.ok && b.ok)
  }
  const cycleSamples = await samplerStats(page)
  record(test, `酒樓繁華：連續上下樓、進出 ${CYCLES} 次不卡住、鏡頭不在方塊裡`, cycles.every(Boolean) && cycleSamples.inside === 0, `${cycles.join('、')}；${cycleSamples.inside}/${cycleSamples.frames}`)

  // 在店裡切換年代（一樓與二樓，含港口商街）：人物在可以站的地方、鏡頭不在方塊裡
  const switches = []
  for (const [where, points] of [['一樓', route('banquet').slice(0, 4)], ['二樓', upRoute('banquet')]]) {
    await teleport(W(0, 1.3), null, 0)
    await frames(6)
    await walk(points)
    for (const eraId of ['modern', 'qing-port', 'revival', 'banquet']) {
      const before = await page.evaluate(() => window.__DDC__.playerState.level)
      const ok = await switchEra(eraId)
      await frames(20)
      const s = await state(page)
      const level = await page.evaluate(() => window.__DDC__.playerState.level)
      const fine = walkableAt(worlds[eraId] ?? buildEraWorldSync(eraId), s.x, s.z, level)
      switches.push(ok && fine && !s.camInside)
      console.log(`    → ${where} ${eraId}：轉場 ${ok}、樓層 ${before}→${level}、人物 (${round(s.x)}, ${round(s.z)}) ${fine ? '可以站' : '不能站'}、鏡頭 ${s.camInside ? '在方塊裡' : '正常'}`)
    }
  }
  record(test, '在店裡（一樓、二樓）連續切換年代：人物都在可以站的地方、鏡頭不在方塊裡', switches.every(Boolean), switches.join('、'))

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
