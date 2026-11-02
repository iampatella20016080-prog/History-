/**
 * 昭和浪漫洗濯屋（老屋新生）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；做法同 tests/e2e/linHuaTai.e2e.mjs）
 *
 * 桌面（鍵盤 WASD，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 從迪化街走進店裡、穿過隔間門到後場再走出來，不卡住、鏡頭不在遮擋方塊裡，室內載入而且看得到
 *   2. 四件可以近看的器物（「僑隆洗染」舊招牌、霜淇淋模型、炭火熨斗、木桶與洗衣板）：走近出現提示，開啟 3D 檢視，
 *      五個分頁、「在哪家店」列出老屋新生、「照片與文獻」列出出處、小動作按鈕可以按
 *   3. 三位可以交談的人：走近出現「交談」，開啟對話
 *   4. 連續進出 CYCLES 次；在店裡切換到其他四個年代，人物都在可以站的地方
 *   5. 沒有頁面錯誤
 * 截圖（SHOTS）：長立面、朝廣場的山牆、店內的吧台與樓梯、器物檢視（兩種裝置）。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/showaLaundry.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 *           CYCLES（進出次數，預設 3）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SHOWA_SHELL, SHOWA_VARIANT, showaToWorld } from '../../src/data/showaLaundryLayout.js'
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
const ID = 'showa-laundry'
const W = (x, z) => showaToWorld(x, z)

/** 和 tests/showaLaundry.test.js 相同的路線（本地座標）：迪化街 → 門 → 前店 → 隔間門 → 後場 */
const ROUTE = [[-1.35, 1.6], [-1.35, -0.6], [-1.6, -1.8], [-1.95, -3.0], [-1.95, -4.15], [-2.95, -4.2]].map(([x, z]) => W(x, z))
const STREET = W(-1.35, 2.6)
const PARTITION_Z = W(0, SHOWA_VARIANT.partition.z).z

/* ── Node 端：每件器物與每位人物旁邊可以站的位置（和遊戲相同的碰撞） ── */
const world = buildEraWorldSync('revival')
const worlds = { revival: world }
function walkableAt(world, x, z) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}
/** 走近 target 的位置：站得到、在 radius 裡，而且 target 比其他會搶提示的對象更近（遊戲的取捨規則見 game/interactionPick.js） */
function standNear(world, [x, , z], radius, others, minDistance = 0, allow = () => true) {
  let best = null
  for (let gx = x - radius; gx <= x + radius; gx += 0.1) {
    for (let gz = z - radius; gz <= z + radius; gz += 0.1) {
      const d = Math.hypot(gx - x, gz - z)
      if (d > radius - 0.3 || d < minDistance || !allow(gx, gz) || !walkableAt(world, gx, gz)) continue
      const rival = Math.min(...others.map(([ox, oz, r]) => (Math.hypot(gx - ox, gz - oz) < r ? Math.hypot(gx - ox, gz - oz) : Infinity)))
      const margin = rival - d
      // 沒有對手時（margin 都是無限大）挑離目標最遠的一點：鏡頭不會貼著前牆往上仰，頭頂的提示在畫面裡
      if (margin > 0.25 && (!best || margin > best.margin || (margin === best.margin && d > best.d))) best = { x: gx, z: gz, margin, d }
    }
  }
  return best
}
/**
 * 和目標站在同一側（不隔著牆走近）：店門口與山牆外的從街上或廣場走近（立面線 z = 4.5 的街道那一側，或山牆外），
 * 前店的不從隔間牆後的後場走近（隔間牆 z = PARTITION_Z）
 */
const GABLE_X = W(SHOWA_SHELL.half, 0).x
function sameSide([x, , z]) {
  if (x < GABLE_X) return (gx) => gx < GABLE_X - 0.2
  if (z < 4.6) return (gx, gz) => gz < 4.3
  if (z < PARTITION_Z) return (gx, gz) => gx > GABLE_X + 0.3 && gz > 4.8 && gz < PARTITION_Z - 0.2
  return (gx, gz) => gz > PARTITION_Z + 0.2
}
const inspectables = inspectablesOfEra('revival')
const talkers = world.npcs.filter((npc) => talkForNpc('revival', npc.id))
const hotspots = getShop(ID, 'revival').hotspots.map((h) => [h.point.x, h.point.z, h.radius])
const ITEMS = inspectables
  .filter((item) => item.shopId === ID)
  .map((item) => {
    // 舊招牌與霜淇淋模型離得近：其他器物也會搶提示
    const rivals = inspectables.filter((other) => other.id !== item.id).map((other) => [other.position[0], other.position[2], other.radius])
    // 和器物站在同一側（不隔著牆）：店門口的器物從簷下走近（立面線 z = 4.5 的街道那一側），
    // 前店的器物不從隔間牆後的後場走近（隔間牆 z = PARTITION_Z）
    return { ...item, stand: standNear(world, item.position, item.radius, [...talkers.map((npc) => [npc.position[0], npc.position[2], TALK_RADIUS]), ...hotspots, ...rivals], 0, sameSide(item.position)) }
  })
const NPCS = talkers
  .filter((npc) => npc.id.startsWith('showa-'))
  .map((npc) => ({ id: npc.id, eraId: 'revival', inside: npc.zone === ID, at: { x: npc.position[0], z: npc.position[2] }, stand: standNear(world, npc.position, TALK_RADIUS, [...inspectables.map((item) => [item.position[0], item.position[2], item.radius]), ...hotspots], 1.2, sameSide(npc.position)) }))

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
    cancelAnimationFrame(window.__showaSampler ?? 0)
    const samples = []
    window.__showaSamples = samples
    let last = -1
    const inBox = (q, b) => q.x > b.minX && q.x < b.maxX && q.y > b.minY && q.y < b.maxY && q.z > b.minZ && q.z < b.maxZ
    const tick = () => {
      window.__showaSampler = requestAnimationFrame(tick)
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
    cancelAnimationFrame(window.__showaSampler ?? 0)
    const samples = window.__showaSamples ?? []
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
  /** stopAtTalk：走到這位人物的「交談」提示出現就停下（一般操作走近人物） */
  const walk = async (points, tolerance = 0.25, stopAtTalk = null) => {
    await page.evaluate(({ points, stopAtTalk }) => {
      window.__showaRoute = { points, i: 0, still: 0, last: null, stuck: false, stopAtTalk }
    }, { points, stopAtTalk })
    const release = await holdForward()
    const done = await waitFor(
      page,
      (tolerance) => {
        const d = window.__DDC__
        const r = window.__showaRoute
        const p = d.playerState.position
        if (d.frameCount === r.frame) return false
        r.frame = d.frameCount
        if (r.stopAtTalk && d.useGameStore.getState().nearbyTalkNpcId === r.stopAtTalk) return true
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
    const r = await page.evaluate(() => ({ i: window.__showaRoute.i, stuck: window.__showaRoute.stuck, p: window.__DDC__.playerState.position.toArray() }))
    return { ok: done && !r.stuck && r.i >= points.length, ...r }
  }
  /** 瞬移到 p；給了 face 時鏡頭轉到人物背後、面向 face（像走過去時一樣看得到提示） */
  const teleport = (p, face = null) =>
    page.evaluate(
      ({ p, face }) => {
        const d = window.__DDC__
        d.playerState.position.set(p.x, 0, p.z)
        if (face) d.cameraState.targetYaw = d.cameraState.yaw = Math.atan2(-(face.x - p.x), -(face.z - p.z))
        d.cameraState.snap = true
      },
      { p, face },
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
    await card.tap({ timeout: 30000 })
  }
  const shot = async (name, position, target) => {
    if (!SHOTS) return
    mkdirSync(SHOTS, { recursive: true })
    // 拍照時主角先站到店門外的簷下（不擋住店內的構圖；仍在室內的載入範圍裡）
    const away = W(-3.4, 2.2)
    await page.evaluate(({ position, target, away }) => {
      const d = window.__DDC__
      window.__showaBack = d.playerState.position.toArray()
      d.playerState.position.set(away.x, 0, away.z)
      d.cameraOverride = { position, target }
      document.documentElement.classList.add('showa-shot')
    }, { position, target, away })
    await frames(24)
    await page.screenshot({ path: join(SHOTS, `${name}-${device}.png`), timeout: TIMEOUT })
    await page.evaluate(() => {
      const d = window.__DDC__
      delete d.cameraOverride
      d.playerState.position.fromArray(window.__showaBack)
      document.documentElement.classList.remove('showa-shot')
      d.cameraState.snap = true
    })
    await frames(6)
  }
  const at = (x, y, z) => [W(x, z).x, y, W(x, z).z]

  /** 走近一件器物、開啟檢視、檢查五個分頁與小動作 */
  const inspectItem = async (eraId, item, shotName) => {
    if (!item.stand) return { ok: false, detail: '找不到可以站的位置' }
    await teleport(item.stand, { x: item.position[0], z: item.position[2] })
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyInspectableId === id, item.id, 20000)
    if (!near) return { ok: false, detail: `沒有提示（${JSON.stringify(await state(page))}）` }
    await frames(4)
    if (process.env.DEBUG) console.log('DBG', item.id, JSON.stringify(item.stand), JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.street-prompt.is-visible .shop-prompt__card')].map((c) => { const r = c.getBoundingClientRect(); const cam = window.__DDC__.camera.position; return [c.textContent.slice(0, 12), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), getComputedStyle(c.closest('.street-prompt').parentElement).display, [cam.x, cam.y, cam.z].map((v) => v.toFixed(2))] }))))
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
    if (npc.inside) {
      // 店裡的人物用一般操作走近：預設的鏡頭俯角，從街上走進店門、朝人物走，提示一出現就停下
      await page.evaluate(() => {
        const d = window.__DDC__
        d.cameraState.targetPitch = d.cameraState.pitch = window.__showaDefaultPitch
      })
      await teleport(STREET, W(-1.35, 0))
      await frames(8)
      await walk([W(-1.35, 0.4), W(-1.35, -0.6), npc.at], 0.25, npc.id)
    } else {
      // 店外的人物：站在 1.2 公尺以外、面向人物，提示才在畫面裡
      await teleport(npc.stand, npc.at)
    }
    const near = await waitFor(page, (id) => window.__DDC__.useGameStore.getState().nearbyTalkNpcId === id, npc.id, 20000)
    if (!near) return false
    await frames(4)
    if (process.env.DEBUG) console.log('DBG', npc.id, JSON.stringify(npc.stand), JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.street-prompt.is-visible, .shop-prompt.is-visible')].map((c) => { const r = c.getBoundingClientRect(); const cam = window.__DDC__.camera.position; return [c.textContent.slice(0, 10), Math.round(r.x), Math.round(r.y), [cam.x, cam.y, cam.z].map((v) => v.toFixed(2))] }))))
    await interactVisible(talkForNpc(npc.eraId, npc.id).role)
    const open = await waitFor(page, () => document.querySelector('.dialogue-layer[data-state="open"] .dialogue__line'), null, 15000)
    await press(page.locator('.dialogue__close'))
    await waitFor(page, () => !window.__DDC__.useGameStore.getState().talk, null, 10000)
    await page.waitForTimeout(400)
    return open
  }

  /* ── 開始：2000–現在 ─────────────── */
  await page.goto(`${BASE_URL}?era=revival&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'revival', null, { timeout: 120000 })
  await page.addStyleTag({ content: 'html.showa-shot .hud, html.showa-shot .shop-prompt, html.showa-shot .street-prompt, html.showa-shot .hud-help, html.showa-shot .touch-controls { visibility: hidden !important; }' })
  await press(page.locator('.intro__start'))
  await page.evaluate(() => { window.__showaDefaultPitch = window.__DDC__.cameraState.pitch })
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  await teleport(STREET, W(-1.35, 0))
  await frames(20)
  await shot('01-facade', [W(1.8, 0).x, 2.4, W(0, 8.2).z], [W(0.2, 0).x, 3.0, W(0, 0).z])
  await shot('02-gable', [W(11.0, 0).x, 2.9, W(0, -1.0).z], [W(3.85, 0).x, 3.1, W(0, -1.65).z])
  await shot('03-corner', [W(7.5, 0).x, 3.4, W(0, 6.8).z], [W(1.0, 0).x, 3.2, W(0, -2.0).z])

  await startSampler(page)
  const inside = await walk(ROUTE)
  const s = await state(page)
  const loaded = await waitFor(page, (id) => window.__DDC__.interiors?.[id]?.loaded && window.__DDC__.interiors[id].visible, ID, 60000)
  record(test, '從迪化街走進店裡、穿過隔間門到後場，室內載入而且看得到', inside.ok && loaded, `到 (${round(s.x)}, ${round(s.z)})、第 ${inside.i} 點`)
  await shot('04-bar', [W(-2.3, 0).x, 1.75, W(0, -0.7).z], [W(1.6, 0).x, 1.1, W(0, -2.6).z])
  await shot('05-stairs', [W(1.0, 0).x, 1.7, W(0, -0.9).z], [W(-3.0, 0).x, 1.3, W(0, -2.6).z])

  for (const [i, item] of ITEMS.entries()) {
    const r = await inspectItem('revival', item, `inspect-${i + 1}-${item.objectId}`)
    record(test, `近看「${item.label}」——五個分頁、在哪家店、出處、小動作`, r.ok, r.detail)
  }
  for (const npc of NPCS) record(test, `和 ${talkForNpc('revival', npc.id).role} 交談（${npc.id}）`, await talkTo(npc))

  await teleport(ROUTE.at(-1))
  await frames(8)
  const out = await walk([...ROUTE].reverse().concat([STREET]))
  const sampled = await samplerStats(page)
  record(test, '走回迪化街；走路時鏡頭不在遮擋方塊裡', out.ok && sampled.inside === 0, `${sampled.frames} 個影格、${sampled.inside} 個在方塊裡 ${JSON.stringify(sampled.at)}`)

  const cycles = []
  await startSampler(page)
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk(ROUTE)
    const b = await walk([...ROUTE].reverse().concat([STREET]))
    cycles.push(a.ok && b.ok)
  }
  const cycleSamples = await samplerStats(page)
  record(test, `連續進出 ${CYCLES} 次不卡住、鏡頭不在方塊裡`, cycles.every(Boolean) && cycleSamples.inside === 0, `${cycles.join('、')}；${cycleSamples.inside}/${cycleSamples.frames}`)

  // 在店裡切換年代：其他年代這裡是一般街屋與貨棧，人物移到可以站的地方
  await walk(ROUTE.slice(0, 3))
  const switches = []
  for (const eraId of ['postwar', 'qing-port', 'revival']) {
    const ok = await switchEra(eraId)
    await frames(20)
    const st = await state(page)
    const fine = walkableAt((worlds[eraId] ??= buildEraWorldSync(eraId)), st.x, st.z)
    switches.push(ok && fine && !st.camInside)
    console.log(`    → ${eraId}：轉場 ${ok}、人物 (${round(st.x)}, ${round(st.z)}) ${fine ? '可以站' : '不能站'}、鏡頭 ${st.camInside ? '在方塊裡' : '正常'}`)
  }
  record(test, '在店裡切換年代：人物都在可以站的地方、鏡頭不在方塊裡', switches.every(Boolean), switches.join('、'))

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
