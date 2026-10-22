/**
 * 米苔目兩個年代版本的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（鍵盤 WASD、滑鼠，精緻畫質）與 iPad 尺寸（觸控搖桿與點擊，流暢畫質）各跑一次：
 *   1. 1945–1980：店家名錄有「廟口米苔目攤」（飲食文化情境示意），沒有永樂米苔目；從出發點沿著迪化街走到慈聖宮廟口的攤位
 *   2. 攤販與客人（情境人物）都顯示、手和頭在動；人物不能穿過站著的客人
 *   3. 攤位前的提示「廟口的米苔目」；按 E／點提示開啟介紹（米苔目是庶民小吃、分開標示史料與情境設計）；
 *      點攤台上的那一碗，開啟「一碗米苔目」；資料來源標示出版時間與用途
 *   4. 切換到 2000–現在：廟口的攤位與人物消失、永樂米苔目出現；走到騎樓下的店門口，開啟「店家與店面」
 *   5. 走進店裡：店內的用餐空間、走道邊第一張桌子的一碗米苔目（四張圖鑑）；每一個影格鏡頭都不在方塊裡
 *   6. 店裡的人物（客人、排隊、店員）都顯示；建築觀賞模式在店內、聚焦菜單板與立面；在店裡切換畫質
 *   7. 連續進出店 5 次：人物、鏡頭與碰撞正常；年代、服裝與音樂沒有被重置
 *   8. 在店裡切換到 1945–1980：人物移到合法的戶外位置；店屋、人物與店內都清除
 *   9. 其他三個年代都沒有兩個版本；兩個年代往返 10 次：每次都只有當前年代的版本
 *  10. 沒有頁面錯誤
 * 截圖（SHOTS）：廟口的米苔目攤、永樂米苔目的街道外觀、入口往內看、店內的用餐區、一碗米苔目、觀賞模式的立面。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/miTaiMu.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、
 * CYCLES（進出店的次數，預設 5）、ROUNDS（兩個年代往返的次數，預設 10）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MI_TAI_MU_STALL, MI_TAI_MU_STALL_HOTSPOTS, YONGLE_MTM_HOTSPOTS, YONGLE_MTM, miTaiMuStallToWorld, yongleMtmToWorld } from '../../src/data/miTaiMuLayout.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const CYCLES = Number(process.env.CYCLES ?? 5)
const ROUNDS = Number(process.env.ROUNDS ?? 10)
const WALK_TIMEOUT = Number(process.env.WALK_TIMEOUT ?? 300000)
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 150000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)


const YL = (x, z) => yongleMtmToWorld(x, z)
const MS = (x, z) => miTaiMuStallToWorld(x, z)
const route = (toWorld, points) => points.map(([x, z]) => toWorld(x, z))
const ROOM_MIN = YL(YONGLE_MTM.room.minX, YONGLE_MTM.room.minZ)
const ROOM_MAX = YL(YONGLE_MTM.room.maxX, YONGLE_MTM.room.maxZ)
const inRoom = (c) => c.x > ROOM_MIN.x && c.x < ROOM_MAX.x && c.z > ROOM_MIN.z && c.z < ROOM_MAX.z

// 廟口：從出發點沿著迪化街南側走到兩張小桌之間（繞過路燈）
const stallPoint = MI_TAI_MU_STALL_HOTSPOTS[0].point
const TO_STALL = [{ x: 9.0, z: 1.3 }, { x: 7.4, z: 1.9 }, ...route(MS, [[stallPoint[0], 2.7], stallPoint])]
// 永樂米苔目：從迪化街走到騎樓下的店門口、入口、店內的用餐空間、走道邊第一張桌子、走道深處，再原路回到街上
const STREET_FRONT = YL(1.0, 4.4)
const TO_FRONT = route(YL, [[1.0, 2.6], YONGLE_MTM_HOTSPOTS[0].point])
const IN_DINING = route(YL, [[1.0, 2.4], [1.0, 1.0], [1.0, 0.2], YONGLE_MTM_HOTSPOTS[1].point])
const IN_FOODS = route(YL, [[-0.7, -2.2], YONGLE_MTM_HOTSPOTS[2].point])
const DEEP = route(YL, [[-0.85, -5.2], [-0.95, -7.2]])
const OUT = route(YL, [[-0.85, -5.0], [-0.72, -1.9], [0.6, -1.6], [1.0, 0.2], [1.0, 1.2], [1.0, 2.6]])

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
    const detail = d.scene?.getObjectByName('interior-yong-le-mi-tai-mu-detail')
    let interiorCount = 0
    let stallNpcs = 0
    let shopNpcs = 0
    d.scene?.traverse((o) => {
      if (o.name === 'interior-yong-le-mi-tai-mu') interiorCount++
      if (o.name.startsWith('npc-temple-mi-tai-mu-')) stallNpcs++
      if (o.name.startsWith('npc-yong-le-')) shopNpcs++
    })
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      cam: { x: c.x, y: c.y, z: c.z },
      camInside: scene.blockers.some((b) => inBox(c, b)),
      indoor: d.indoor?.amount ?? 0,
      interior: d.interiors?.['yong-le-mi-tai-mu'] ?? null,
      detailVisible: detail ? detail.visible : null,
      interiorCount,
      stallNpcs,
      shopNpcs,
      stall: scene.buildings.some((b) => b.storeId === 'temple-mi-tai-mu-stall'),
      yongle: scene.buildings.some((b) => b.storeId === 'yong-le-mi-tai-mu'),
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
      const box = blockers.findIndex((b) => inBox(c, b))
      samples.push({ inside: box >= 0, blocked, step, camY: c.y, indoor: d.indoor?.amount ?? 0, at: box >= 0 ? { cam: [c.x, c.y, c.z].map((v) => +v.toFixed(2)), player: [p.x, p.z].map((v) => +v.toFixed(2)), box: blockers[box] } : null })
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
      insideAt: samples.filter((item) => item.at).slice(0, 3).map((item) => item.at),
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

  const checkNpcs = (prefix) =>
    page.evaluate((prefix) => {
      const list = Object.entries(window.__DDC__.npcs ?? {}).filter(([id]) => id.startsWith(prefix))
      return { count: list.length, visible: list.filter(([, n]) => n.visible).length, items: Object.fromEntries(list.map(([id, n]) => [id, { elbow: n.elbow, nod: n.nod, pose: n.pose, position: n.position }])) }
    }, prefix)

  /* ── 1945–1980：廟口的米苔目攤 ─────────────── */
  await page.goto(`${BASE_URL}?era=postwar&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'postwar', null, { timeout: 120000 })
  await page.evaluate(() => {
    window.__noReload = 'mitaimu'
  })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2500)

  const postwarList = await directory('廟口米苔目攤')
  record(
    test,
    '1945–1980 的店家名錄有「廟口米苔目攤」（可以探索、飲食文化情境示意、飲食主題），沒有永樂米苔目',
    postwarList.count === 1 && postwarList.open === 1 && postwarList.notes.includes('飲食文化情境示意') && postwarList.notes.some((t) => /米苔目飲食文化/.test(t)) && !postwarList.names.includes('永樂米苔目'),
    postwarList.notes.join('、'),
  )
  const atStart = await state(page)
  record(test, '1945–1980 的街景：廟口有米苔目攤與攤販、客人，沒有永樂米苔目的店面', atStart.stall && !atStart.yongle && atStart.stallNpcs === 4 && atStart.shopNpcs === 0, `攤位的人物 ${atStart.stallNpcs}`)

  await startSampler(page)
  const toStall = await walk(TO_STALL)
  await frames(4)
  const atStall = await state(page)
  const stallStats = await samplerStats(page)
  record(
    test,
    touch ? '用搖桿沿著迪化街走到慈聖宮廟口的米苔目攤' : '用鍵盤沿著迪化街走到慈聖宮廟口的米苔目攤',
    toStall.ok && atStall.nearby === 'temple-mi-tai-mu-stall' && atStall.hotspot === 'stall' && atStall.prompt === '廟口的米苔目',
    `人物 (${round(atStall.x)}, ${round(atStall.z)})、提示「${atStall.prompt}」${toStall.ok ? '' : `；卡在第 ${toStall.i} 點`}`,
  )
  record(test, '走向攤位的每一個影格：鏡頭不在方塊裡、看得到人物', stallStats.frames > 10 && stallStats.inside === 0 && stallStats.blocked <= Math.max(3, stallStats.frames * 0.05), `${stallStats.frames} 個影格：在方塊裡 ${stallStats.inside}、視線被擋 ${stallStats.blocked}${stallStats.insideAt.length ? `；${JSON.stringify(stallStats.insideAt)}` : ''}`)
  const npcA = await checkNpcs('temple-mi-tai-mu-')
  await frames(6)
  const npcB = await checkNpcs('temple-mi-tai-mu-')
  const moving = ['vendor', 'diner-a', 'diner-b'].every((id) => {
    const a = npcA.items[`temple-mi-tai-mu-${id}`]
    const b = npcB.items[`temple-mi-tai-mu-${id}`]
    return a && b && (Math.abs(a.elbow - b.elbow) > 1e-4 || Math.abs(a.nod - b.nod) > 1e-4)
  })
  record(test, '攤販在攤台後招呼客人、兩位客人坐著吃、一位站著等：四個人物都顯示，攤販與客人的手和頭在動', npcB.count === 4 && npcB.visible === 4 && moving, `顯示 ${npcB.visible}/${npcB.count}`)
  // 人物避位：朝著站在攤台旁的客人走過去，會被擋在他前面
  const waiting = npcB.items['temple-mi-tai-mu-waiting']?.position
  if (waiting) {
    await walk([{ x: waiting[0], z: waiting[2] }], { tolerance: 0.1 })
    const near = await state(page)
    const gap = Math.hypot(near.x - waiting[0], near.z - waiting[2])
    record(test, '人物不能穿過站著的客人（碰撞）', gap > 0.4, `離客人 ${round(gap)} m`)
    await walk(TO_STALL.slice(-1))
  }
  await face(MS(MI_TAI_MU_STALL.bowl.x, MI_TAI_MU_STALL.bowl.z))
  await shot(page, `${device}-01-temple-stall`)
  await interact()
  const stallStory = await storyOpen('廟口米苔目攤')
  const stallTabs = await tabNames()
  const stallTab = await activeTab()
  const lead = await page.evaluate(() => document.querySelector('.chapter__lead')?.textContent.trim() ?? null)
  const marks = await page.$$eval('.chapter__p', (items) => items.map((item) => item.textContent.slice(0, 6)))
  record(
    test,
    touch ? '點提示開啟「廟口的米苔目」：介紹米苔目是庶民小吃，分開標示史料與情境設計' : '按 E 開啟「廟口的米苔目」：介紹米苔目是庶民小吃，分開標示史料與情境設計',
    stallStory && stallTab === '廟口的米苔目' && lead === '米苔目是台灣常見的庶民小吃，在戰後至1980年代的大稻埕，也屬於廟口與街邊常見的日常飲食之一。' && marks.some((t) => t.startsWith('史料｜')) && marks.some((t) => t.startsWith('情境設計｜')),
    `章節 ${stallTabs.join('、')}；目前 ${stallTab}`,
  )
  await press(page.locator('.story__tab').nth(stallTabs.length - 1))
  const stallMeta = await page.$$eval('.source__meta', (items) => items.length)
  const stallLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '資料來源：每一筆都有網址、出版時間與用途', stallLinks >= 4 && stallMeta === stallLinks, `${stallLinks} 筆、${stallMeta} 筆標示出版時間與用途`)
  await closeStory()
  const bowlPoint = await screenPointOf('temple-mi-tai-mu-bowl')
  if (bowlPoint?.inView) await tapAt(bowlPoint)
  const bowlStory = await storyOpen('廟口米苔目攤')
  const bowlState = await state(page)
  const bowlTab = await activeTab()
  const bowlFoods = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(
    test,
    touch ? '點攤台上的那一碗：開啟「一碗米苔目」（湯米苔目與小菜）' : '用滑鼠點攤台上的那一碗：開啟「一碗米苔目」（湯米苔目與小菜）',
    Boolean(bowlPoint?.inView) && bowlStory && bowlState.activeHotspot === 'bowl' && bowlTab === '一碗米苔目' && bowlFoods.join('、') === '湯米苔目、小菜（示意）',
    `熱點 ${bowlState.activeHotspot}、章節 ${bowlTab}、圖鑑 ${bowlFoods.join('、')}`,
  )
  if (bowlStory) await closeStory()

  /* ── 切換到 2000–現在：永樂米苔目 ─────────── */
  const toRevival = await switchEra('revival')
  await closeSettings()
  const afterSwitch = await state(page)
  record(
    test,
    '在攤位前切換到 2000–現在：廟口的攤位與人物消失、永樂米苔目出現；人物在合法的位置',
    toRevival && !afterSwitch.stall && afterSwitch.stallNpcs === 0 && afterSwitch.yongle && !afterSwitch.camInside && afterSwitch.y === 0,
    `人物 (${round(afterSwitch.x)}, ${round(afterSwitch.z)})`,
  )
  const revivalList = await directory('永樂米苔目')
  record(test, '2000–現在的店家名錄有永樂米苔目（可以探索、飲食主題），沒有廟口的攤位', revivalList.count === 1 && revivalList.open === 1 && revivalList.notes.some((t) => /米苔目飲食文化/.test(t)) && !revivalList.names.includes('廟口米苔目攤'))

  // 從街上走到店門口：看招牌與立面
  await page.evaluate(({ x, z }) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, z)
    d.cameraState.snap = true
  }, STREET_FRONT)
  await frames(4)
  await walk(TO_FRONT)
  const atFront = await state(page)
  record(test, '從迪化街走到騎樓下的店門口：提示「永樂米苔目」', atFront.nearby === 'yong-le-mi-tai-mu' && atFront.hotspot === 'storefront' && atFront.prompt === '永樂米苔目', `提示「${atFront.prompt}」`)
  await page.evaluate(({ x, z }) => {
    const d = window.__DDC__
    d.playerState.position.set(x, 0, z)
    d.cameraState.snap = true
  }, YL(1.0, 4.6))
  await frames(4)
  await face(YL(0, 0))
  await page.evaluate(() => {
    window.__DDC__.cameraState.targetPitch = window.__DDC__.cameraState.pitch = 0.18
  })
  await frames(10)
  await shot(page, `${device}-02-yongle-exterior`)
  await walk(TO_FRONT)
  await interact()
  const shopStory = await storyOpen('永樂米苔目')
  const shopTabs = await tabNames()
  const shopTab = await activeTab()
  const shopLead = await page.evaluate(() => document.querySelector('.chapter__lead')?.textContent.trim() ?? null)
  record(
    test,
    '開啟「店家與店面」：介紹現代的店家場景；章節為店家與店面／店內的用餐空間／一碗米苔目／資料來源',
    shopStory && shopTab === '店家與店面' && shopLead === '到了現代，大稻埕的傳統庶民飲食不只留在記憶裡，也以具體店家的形式延續下來。永樂米苔目就是其中一種代表性的小吃場景。' && shopTabs.join('／') === '店家與店面／店內的用餐空間／一碗米苔目／資料來源',
    `章節 ${shopTabs.join('／')}`,
  )
  await press(page.locator('.story__tab').nth(3))
  const shopMeta = await page.$$eval('.source__meta', (items) => items.length)
  const shopLinks = await page.$$eval('.chapter a[href^="http"]', (items) => items.length)
  record(test, '永樂米苔目的資料來源：每一筆都有網址、出版時間與用途', shopLinks >= 4 && shopMeta === shopLinks, `${shopLinks} 筆`)
  await closeStory()

  // 走進店裡：入口 → 店內的用餐空間 → 走道邊第一張桌子
  await startSampler(page)
  const walkIn = await walk(IN_DINING)
  await frames(4)
  const atDining = await state(page)
  record(test, '走進店門：提示「店內的用餐空間」；室內在接近時產生並顯示，店裡的人物跟著出現', walkIn.ok && atDining.hotspot === 'dining' && atDining.prompt === '店內的用餐空間' && atDining.interior?.loaded && atDining.interior?.visible && atDining.shopNpcs === 9, `提示「${atDining.prompt}」、室內 ${JSON.stringify(atDining.interior)}、人物 ${atDining.shopNpcs}`)
  await face(YL(0.6, -6.5))
  await shot(page, `${device}-03-yongle-entrance-in`)
  const walkFood = await walk(IN_FOODS)
  await waitFor(page, () => (window.__DDC__.indoor?.amount ?? 0) > 0.99, null, 60000)
  await frames(4)
  const atFoods = await state(page)
  const inStats = await samplerStats(page)
  record(test, touch ? '用搖桿從騎樓走進店裡，走到走道邊第一張桌子' : '用鍵盤從騎樓走進店裡，走到走道邊第一張桌子', walkFood.ok && inRoom(atFoods) && atFoods.y === 0, `人物 (${round(atFoods.x)}, ${round(atFoods.z)})`)
  record(
    test,
    '走進店裡的每一個影格：鏡頭不在牆、桌子或天花板裡，看得到人物；店裡的鏡頭在天花板下；沒有傳送',
    inStats.frames > 10 && inStats.inside === 0 && inStats.blocked <= Math.max(3, inStats.frames * 0.05) && inStats.maxIndoorCamY < YONGLE_MTM.ceiling && inStats.maxStep < 0.6,
    `${inStats.frames} 個影格：在方塊裡 ${inStats.inside}、視線被擋 ${inStats.blocked}、店裡鏡頭最高 ${round(inStats.maxIndoorCamY)} m${inStats.insideAt.length ? `；${JSON.stringify(inStats.insideAt)}` : ''}`,
  )
  record(test, '一碗米苔目旁的提示', atFoods.nearby === 'yong-le-mi-tai-mu' && atFoods.hotspot === 'foods' && atFoods.prompt === '一碗米苔目', `提示「${atFoods.prompt}」`)
  await face(YL(0.1, -3.0))
  await shot(page, `${device}-05-yongle-foods`)
  await interact()
  const foodsStory = await storyOpen('永樂米苔目')
  const foodsTab = await activeTab()
  const foodsOk = await waitFor(page, () => [...document.querySelectorAll('.food-card')].length === 4 && [...document.querySelectorAll('.food-card svg.food-illustration')].every((svg) => svg.childElementCount > 0), null, 30000)
  const foodNames = await page.$$eval('.food-card__name', (items) => items.map((item) => item.textContent.trim()))
  record(test, '開啟「一碗米苔目」：湯米苔目、嘴邊肉、油豆腐、菜頭（四張圖鑑）', foodsStory && foodsTab === '一碗米苔目' && foodsOk && foodNames.join('、') === '湯米苔目、嘴邊肉、油豆腐、菜頭', `圖鑑 ${foodNames.join('、')}`)
  await closeStory()

  // 用餐區：往裡面看，客人坐著吃東西
  await walk(DEEP)
  await face(YL(0.9, -8.5))
  await shot(page, `${device}-04-yongle-dining`)
  const shopA = await checkNpcs('yong-le-')
  await frames(6)
  const shopB = await checkNpcs('yong-le-')
  const eating = ['diner-r1', 'diner-m2', 'diner-r2', 'diner-m3'].every((id) => {
    const a = shopA.items[`yong-le-${id}`]
    const b = shopB.items[`yong-le-${id}`]
    return a && b && b.pose === 'eat' && (Math.abs(a.elbow - b.elbow) > 1e-4 || Math.abs(a.nod - b.nod) > 1e-4)
  })
  record(test, '店裡的人物：四位客人坐著吃（手與頭在動）、門口兩人排隊、騎樓一人點外帶、兩位店員', shopB.count === 9 && shopB.visible === 9 && eating, `顯示 ${shopB.visible}/${shopB.count}`)

  // 建築觀賞模式在店內（先面向右牆的菜單板：觀賞模式的起始鏡頭在人物背後，看得到菜單板）
  await face(YL(2.0, -4.6))
  const beforeViewer = await state(page)
  await openSettings()
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  await page.keyboard.press('Escape').catch(() => {})
  const entered = await viewerSettled()
  const inViewer = await state(page)
  const roomCam = (s) => inRoom(s.cam) && s.cam.y > 0.2 && s.cam.y < YONGLE_MTM.ceiling && !s.camInside
  record(test, '在店裡進入觀賞模式：鏡頭在店內、地板與天花之間、不在牆裡', entered && roomCam(inViewer), `鏡頭 (${round(inViewer.cam.x)}, ${round(inViewer.cam.y)}, ${round(inViewer.cam.z)})`)
  const menuPoint = await screenPointOf('yong-le-menu')
  if (menuPoint?.inView) await tapAt(menuPoint)
  const menuSettled = await viewerSettled()
  const atMenu = await state(page)
  record(test, touch ? '觀賞模式點右牆的菜單板：鏡頭聚焦菜單板、不開啟介紹、不穿牆' : '觀賞模式用滑鼠點右牆的菜單板：鏡頭聚焦菜單板、不開啟介紹、不穿牆', Boolean(menuPoint?.inView) && menuSettled && atMenu.mode === 'explore' && roomCam(atMenu), `點在畫面內 ${Boolean(menuPoint?.inView)}；鏡頭 (${round(atMenu.cam.x)}, ${round(atMenu.cam.y)}, ${round(atMenu.cam.z)})`)
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator('[data-focus-shop="yong-le-mi-tai-mu"]'))
  const focused = await viewerSettled()
  const facade = await state(page)
  record(test, '觀賞模式從店家名錄聚焦永樂米苔目：鏡頭在迪化街上看立面與招牌、不在牆裡', focused && facade.cam.z > YONGLE_MTM.site.z + YONGLE_MTM.arcade && !facade.camInside, `鏡頭 (${round(facade.cam.x)}, ${round(facade.cam.y)}, ${round(facade.cam.z)})`)
  await shot(page, `${device}-06-viewer-facade`)
  await press(page.locator('.viewer-bar button', { hasText: '返回探索' }).first())
  const back = await waitFor(page, () => window.__DDC__.useGameStore.getState().viewMode === 'explore' && window.__DDC__.viewer.phase === 'off', null, 60000)
  await frames(6)
  const returned = await state(page)
  record(test, '返回探索：人物還在店裡的同一個位置，鏡頭回到人物身邊', back && Math.hypot(returned.x - beforeViewer.x, returned.z - beforeViewer.z) < 0.05 && !returned.camInside)

  // 在店裡切換畫質：流暢模式隱藏細小的擺飾，人物仍然顯示
  await openSettings()
  const qualityChecks = []
  for (const target of [quality === 'fine' ? 'smooth' : 'fine', quality]) {
    await press(page.locator(`[data-quality-option="${target}"]`))
    const applied = await waitFor(page, (want) => document.documentElement.dataset.quality === want, target, 120000)
    await frames(4)
    const s = await state(page)
    qualityChecks.push(applied && s.interior?.visible === true && s.detailVisible === (target === 'fine') && s.shopNpcs === 9 && !s.camInside)
  }
  await closeSettings()
  record(test, '在店裡切換畫質：流暢模式隱藏細小的擺飾、精緻模式顯示；店內與人物都仍顯示', qualityChecks.every(Boolean), qualityChecks.join('、'))

  // 連續進出 5 次
  await walk(OUT)
  const before = await media()
  await startSampler(page)
  const cycles = []
  for (let i = 0; i < CYCLES; i++) {
    const a = await walk([...IN_DINING, ...IN_FOODS, ...DEEP])
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
    `${cycles.filter(Boolean).length}/${CYCLES} 次、${cycleStats.frames} 個影格中鏡頭在方塊裡 ${cycleStats.inside}、視線被擋 ${cycleStats.blocked}${cycleStats.insideAt.length ? `；${JSON.stringify(cycleStats.insideAt)}` : ''}`,
  )
  const musicKept = !before.music || (after.music && after.music.currentEra === before.music.currentEra && after.music.startedCount === before.music.startedCount && after.music.status === before.music.status)
  record(test, '進出店家不重置年代、服裝與音樂，也沒有重新載入頁面', after.era === before.era && after.outfit === before.outfit && musicKept && after.noReload === 'mitaimu', `音樂 ${after.music?.status ?? '無'}（播放 ${after.music?.startedCount ?? 0} 次）`)

  // 在店裡切換到 1945–1980
  await walk([...IN_DINING, ...IN_FOODS])
  const inside = await state(page)
  const toPostwar = await switchEra('postwar')
  const moved = await state(page)
  record(
    test,
    '在店裡切換到 1945–1980：人物移到合法的戶外位置（街上、地面），永樂米苔目的店屋、人物與店內都清除，廟口的攤位出現',
    inRoom(inside) && toPostwar && !inRoom(moved) && moved.y === 0 && moved.z > YONGLE_MTM.site.z + YONGLE_MTM.arcade - 0.4 && !moved.camInside && !moved.yongle && moved.shopNpcs === 0 && moved.interiorCount === 0 && moved.stall && moved.stallNpcs === 4,
    `人物 (${round(moved.x)}, ${round(moved.y)}, ${round(moved.z)})`,
  )

  // 年代切換：先到其他三個年代各一次（兩個版本都不出現），再在兩個年代之間往返 10 次
  const others = []
  for (const id of ['qing-port', 'banquet', 'modern']) {
    const ok = await switchEra(id)
    const s = await state(page)
    others.push(ok && !s.stall && !s.yongle && s.stallNpcs === 0 && s.shopNpcs === 0)
  }
  record(test, '清末、酒樓、摩登三個年代：廟口的米苔目攤與永樂米苔目都不出現', others.every(Boolean), others.join('、'))
  const rounds = []
  for (let i = 0; i < ROUNDS; i++) {
    const a = await switchEra('postwar')
    const sa = await state(page)
    const b = await switchEra('revival')
    const sb = await state(page)
    const ok = a && b && sa.stall && !sa.yongle && sa.stallNpcs === 4 && sa.shopNpcs === 0 && sb.yongle && !sb.stall && sb.stallNpcs === 0 && !sa.camInside && !sb.camInside
    rounds.push(ok)
    console.log(`    往返 ${i + 1}：庶民生活 攤位 ${sa.stall}／店 ${sa.yongle}／人物 ${sa.stallNpcs}；老屋新生 店 ${sb.yongle}／攤位 ${sb.stall}${ok ? '' : '（失敗）'}`)
  }
  await closeSettings()
  const finalMedia = await media()
  record(test, `兩個年代往返 ${ROUNDS} 次（共 ${ROUNDS * 2 + 3} 次切換）：每次都只有當前年代的版本，沒有重新載入頁面`, rounds.length === ROUNDS && rounds.every(Boolean) && finalMedia.noReload === 'mitaimu', `${rounds.filter(Boolean).length}/${ROUNDS}`)

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
