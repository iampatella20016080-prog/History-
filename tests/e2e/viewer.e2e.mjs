/**
 * 建築觀賞模式與簡化介面的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（滑鼠）與 iPad 尺寸（觸控模擬）各跑一次，逐項檢查：
 *   1. 一般探索畫面沒有左上標誌、頂部時間軸與右下角的店家提示
 *   2. 設定（齒輪）裡有年代、觀看模式、畫質與背景音樂
 *   3. 進入觀賞模式：人物隱藏並停止、搖桿隱藏、鏡頭移到人物附近略高於街道
 *   4. 鏡頭操作：桌面左鍵旋轉、右鍵平移、滾輪縮放；觸控單指旋轉、雙指平移、雙指縮放
 *   5. 點建築：平滑聚焦整個立面、鏡頭不在建築裡也不穿牆；點店家建築不開啟故事
 *   6. 隱藏介面後只留 3D 街景；點右上角隱形觸發區或按 Esc 恢復
 *   7. 觀賞模式中連續切換年代，鏡頭位置與方向不變
 *   8. 返回探索：人物與搖桿重新出現、人物座標不變、年代與畫質不重設
 *   9. 進出觀賞模式 10 次：人物座標不變、畫面不是黑的、WebGL 沒有錯誤
 *  10. 已開放店家的故事互動：桌面按 E、觸控點店面
 *
 * 需要開發版（npm run dev，有 window.__DDC__）才能讀取鏡頭與人物狀態。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/viewer.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE（playwright 模組路徑）、DEVICES（desktop,touch）、CYCLES（進出次數，預設 10）、HEADED=1
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const CYCLES = Number(process.env.CYCLES ?? 10)
// 軟體繪圖（SwiftShader）每個影格可能要一秒以上：鏡頭的平滑移動在測試中會變慢，等待時間放寬
const SETTLE_TIMEOUT = Number(process.env.SETTLE_TIMEOUT ?? 120000)
const TRANSITION_TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)
const WEBGL_WARNING = /WebGL|GL_INVALID|GL ERROR|CONTEXT_LOST/i

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

const round = (n) => Math.round(n * 100) / 100

/** 鏡頭、人物與介面的狀態（開發版） */
function snapshot(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const s = d.useGameStore.getState()
    const v = d.viewer
    const c = d.camera
    const dir = c.getWorldDirection(c.position.clone())
    return {
      viewMode: s.viewMode,
      mode: s.mode,
      uiHidden: s.uiHidden,
      era: s.eraId,
      quality: s.qualityMode,
      started: s.started,
      phase: v?.phase ?? 'off',
      player: { x: d.playerState.position.x, z: d.playerState.position.z },
      playerVisible: d.scene.getObjectByName('player')?.visible,
      camera: { x: c.position.x, y: c.position.y, z: c.position.z },
      direction: { x: dir.x, y: dir.y, z: dir.z },
      viewer: v && {
        yaw: v.yaw,
        pitch: v.pitch,
        distance: v.distance,
        goalYaw: v.goalYaw,
        goalPitch: v.goalPitch,
        goalDistance: v.goalDistance,
        target: { x: v.target.x, y: v.target.y, z: v.target.z },
        goalTarget: { x: v.goalTarget.x, y: v.goalTarget.y, z: v.goalTarget.z },
      },
    }
  })
}

/** 鏡頭是否在任何建築（遮擋方塊）內、與注視點之間是否被建築擋住 */
function cameraClearance(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const { blockers } = d.cameraScene.current
    const c = d.camera.position
    const t = d.viewer.target
    const inside = blockers.some((b) => c.x > b.minX && c.x < b.maxX && c.y > b.minY && c.y < b.maxY && c.z > b.minZ && c.z < b.maxZ)
    // 沿注視點 → 鏡頭取樣，檢查中間有沒有穿過建築
    let crossed = false
    for (let i = 1; i < 40; i++) {
      const k = i / 40
      const p = { x: t.x + (c.x - t.x) * k, y: t.y + (c.y - t.y) * k, z: t.z + (c.z - t.z) * k }
      if (blockers.some((b) => p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY && p.z > b.minZ && p.z < b.maxZ)) crossed = true
    }
    return { inside, crossed, height: c.y }
  })
}

const waitFor = (page, fn, arg, timeout) =>
  page
    .waitForFunction(fn, arg, { timeout, polling: 250 })
    .then(() => true)
    .catch(() => false)

/** 等觀賞鏡頭的平滑移動完成（目前值接近目標值） */
const waitSettled = (page) =>
  waitFor(
    page,
    () => {
      const v = window.__DDC__.viewer
      // 鏡頭要在下一個影格才會切換到觀賞模式（phase 變成 active）
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
  )

/** 截取畫面中央並計算平均亮度與接近全黑的比例 */
async function frameStats(page) {
  const size = page.viewportSize()
  const clip = { x: size.width * 0.2, y: size.height * 0.2, width: size.width * 0.6, height: size.height * 0.5 }
  const buffer = await page.screenshot({ type: 'jpeg', quality: 70, clip, scale: 'css', timeout: 240000 })
  return page.evaluate(async (b64) => {
    const image = new Image()
    image.src = `data:image/jpeg;base64,${b64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 40
    const g = canvas.getContext('2d')
    g.drawImage(image, 0, 0, 64, 40)
    const pixels = g.getImageData(0, 0, 64, 40).data
    let sum = 0
    let dark = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const l = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255
      sum += l
      if (l < 0.04) dark++
    }
    const n = pixels.length / 4
    return { mean: sum / n, dark: dark / n }
  }, buffer.toString('base64'))
}

async function webglStatus(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl')
    if (!gl) return { error: '找不到 WebGL', lost: window.__contextLost ?? 0 }
    if (gl.isContextLost()) return { error: 'WebGL 遺失', lost: window.__contextLost ?? 0 }
    const code = gl.getError()
    return { error: code === 0 ? null : `gl.getError() = 0x${code.toString(16)}`, lost: window.__contextLost ?? 0 }
  })
}

/** 觸控：以 CDP 送出觸控點（Playwright 的 touchscreen 只支援單點點擊） */
function touchDriver(cdp) {
  const send = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
  return {
    async drag(points, steps = 8) {
      // points: [{ from: [x, y], to: [x, y] }, ...]，同時移動多根手指
      const at = (k) => points.map((p, id) => ({ x: p.from[0] + (p.to[0] - p.from[0]) * k, y: p.from[1] + (p.to[1] - p.from[1]) * k, id: id + 1 }))
      await send('touchStart', at(0))
      for (let i = 1; i <= steps; i++) await send('touchMove', at(i / steps))
      await send('touchEnd', [])
    },
  }
}

async function runDevice(browser, device) {
  const touch = device === 'touch'
  const test = touch ? 'iPad 觸控' : '桌面'
  const context = await browser.newContext(
    touch ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: false } : { viewport: { width: 1280, height: 800 } },
  )
  const page = await context.newPage()
  page.setDefaultTimeout(TRANSITION_TIMEOUT)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || (message.type() === 'warning' && WEBGL_WARNING.test(message.text()))) errors.push(message.text())
  })
  const press = (locator) => (touch ? locator.tap() : locator.click())
  const tapAt = (x, y) => (touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y))
  const cdp = touch ? await context.newCDPSession(page) : null
  const fingers = cdp && touchDriver(cdp)
  const size = page.viewportSize()

  await page.goto(`${BASE_URL}?quality=smooth`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.evaluate(() => {
    window.__contextLost = 0
    document.querySelector('canvas')?.addEventListener('webglcontextlost', () => window.__contextLost++)
  })
  await page.waitForTimeout(3000)

  // 1. 簡化後的探索畫面
  const removed = await page.evaluate(() =>
    ['.hud-title', '.era-timeline', '.explore-dock', '.explore-button', '.explore-chip'].filter((selector) => document.querySelector(selector)),
  )
  record(test, '探索畫面沒有左上標誌、頂部時間軸與右下店家提示', removed.length === 0, removed.join('、'))

  // 2. 設定面板的內容
  await press(page.locator('.hud-quality__toggle'))
  await page.waitForSelector('#quality-panel')
  const panel = await page.evaluate(() => ({
    eras: document.querySelectorAll('#quality-panel [data-era-option]').length,
    modes: document.querySelectorAll('#quality-panel [data-view-mode]').length,
    quality: document.querySelectorAll('#quality-panel [data-quality-option]').length,
    music: document.querySelectorAll('#quality-panel [data-music-toggle]').length,
  }))
  record(
    test,
    '設定包含年代、觀看模式、畫質與背景音樂',
    panel.eras === 5 && panel.modes === 2 && panel.quality === 2 && panel.music === 1,
    `年代 ${panel.eras}、模式 ${panel.modes}、畫質 ${panel.quality}、音樂 ${panel.music}`,
  )

  // 3. 進入觀賞模式
  const before = await snapshot(page)
  const musicBefore = await page.evaluate(() => [localStorage.getItem('ddc.music.enabled'), localStorage.getItem('ddc.music.volume')])
  await press(page.locator('[data-view-mode="viewer"]'))
  await page.waitForSelector('.viewer-bar')
  const entered = await waitSettled(page)
  let s = await snapshot(page)
  const ui = await page.evaluate(() => ({ joystick: !!document.querySelector('.joystick'), panel: !!document.querySelector('#quality-panel') }))
  const nearPlayer = Math.hypot(s.viewer.target.x - before.player.x, s.viewer.target.z - before.player.z)
  record(
    test,
    '進入觀賞模式：人物隱藏、搖桿隱藏、鏡頭在人物附近略高於街道',
    s.viewMode === 'viewer' && s.playerVisible === false && !ui.joystick && entered && nearPlayer < 3 && s.camera.y > 2,
    `人物${s.playerVisible ? '可見' : '隱藏'}、搖桿${ui.joystick ? '仍在' : '隱藏'}、注視點距人物 ${round(nearPlayer)} m、鏡頭高 ${round(s.camera.y)} m${entered ? '' : '（鏡頭未在時限內停穩）'}`,
  )

  // 人物在觀賞模式中不會移動（鍵盤或搖桿輸入都不影響）
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(1500)
  await page.keyboard.up('KeyW')
  s = await snapshot(page)
  record(test, '觀賞模式中人物暫停', Math.hypot(s.player.x - before.player.x, s.player.z - before.player.z) < 1e-6)
  await waitSettled(page)

  // 4. 鏡頭操作
  const cx = size.width * 0.5
  const cy = size.height * 0.45
  let a = await snapshot(page)
  if (touch) await fingers.drag([{ from: [cx, cy], to: [cx + 140, cy + 40] }])
  else {
    await page.mouse.move(cx, cy)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(cx + 140, cy + 40, { steps: 8 })
    await page.mouse.up({ button: 'left' })
  }
  let b = await snapshot(page)
  record(test, `旋轉（${touch ? '單指拖曳' : '左鍵拖曳'}）`, Math.abs(b.viewer.goalYaw - a.viewer.goalYaw) > 0.3, `yaw ${round(a.viewer.goalYaw)} → ${round(b.viewer.goalYaw)}、pitch ${round(a.viewer.goalPitch)} → ${round(b.viewer.goalPitch)}`)
  await waitSettled(page)

  a = await snapshot(page)
  if (touch) {
    await fingers.drag([
      { from: [cx - 60, cy], to: [cx - 60 - 160, cy + 20] },
      { from: [cx + 60, cy], to: [cx + 60 - 160, cy + 20] },
    ])
  } else {
    await page.mouse.move(cx, cy)
    await page.mouse.down({ button: 'right' })
    await page.mouse.move(cx - 160, cy + 20, { steps: 8 })
    await page.mouse.up({ button: 'right' })
  }
  b = await snapshot(page)
  const panned = Math.hypot(b.viewer.goalTarget.x - a.viewer.goalTarget.x, b.viewer.goalTarget.y - a.viewer.goalTarget.y, b.viewer.goalTarget.z - a.viewer.goalTarget.z)
  record(test, `平移（${touch ? '雙指拖曳' : '右鍵拖曳'}）`, panned > 0.5, `注視點移動 ${round(panned)} m；距離 ${round(a.viewer.goalDistance)} → ${round(b.viewer.goalDistance)}`)
  await waitSettled(page)

  a = await snapshot(page)
  if (touch) {
    await fingers.drag([
      { from: [cx - 50, cy], to: [cx - 170, cy] },
      { from: [cx + 50, cy], to: [cx + 170, cy] },
    ])
  } else {
    for (let i = 0; i < 3; i++) await page.mouse.wheel(0, -120)
  }
  b = await snapshot(page)
  record(test, `縮放（${touch ? '雙指捏合' : '滾輪'}）`, b.viewer.goalDistance < a.viewer.goalDistance - 0.5, `距離 ${round(a.viewer.goalDistance)} → ${round(b.viewer.goalDistance)}`)
  await waitSettled(page)
  let clear = await cameraClearance(page)
  record(test, '操作後鏡頭不在建築內、不穿牆、不低於地面', !clear.inside && !clear.crossed && clear.height > 0.4, `鏡頭高 ${round(clear.height)} m`)

  // 5. 點建築聚焦：挑畫面上看得到、靠近中央的一棟
  const pick = await page.evaluate(() => {
    const d = window.__DDC__
    const points = d.cameraScene.current.buildings.map((building) => d.facadeScreenPoint(building.id, 3)).filter((p) => p?.inView)
    const w = window.innerWidth
    const h = window.innerHeight
    points.sort((p, q) => Math.hypot(p.x - w / 2, p.y - h / 2) - Math.hypot(q.x - w / 2, q.y - h / 2))
    return points[0] ?? null
  })
  if (!pick) {
    record(test, '點建築聚焦', false, '畫面上找不到可以點的建築')
  } else {
    await tapAt(pick.x, pick.y)
    const settled = await waitSettled(page)
    s = await snapshot(page)
    clear = await cameraClearance(page)
    const facade = await page.evaluate((id) => window.__DDC__.facadeScreenPoint(id, 3), pick.id)
    record(
      test,
      `點建築（${pick.id}）平滑聚焦立面，不穿牆`,
      settled && s.mode === 'explore' && facade.inView && !clear.inside && !clear.crossed,
      `距離 ${round(s.viewer.distance)} m、鏡頭高 ${round(clear.height)} m、立面在畫面內：${facade.inView}`,
    )
  }

  // 點店家建築：只聚焦，不開啟故事
  await page.evaluate(() => window.__DDC__.useGameStore.getState().focusBuilding('lin-fu-zhen'))
  await waitSettled(page)
  const shopPoint = await page.evaluate(() => window.__DDC__.storefrontScreenPoint('lin-fu-zhen'))
  if (shopPoint?.inView) await tapAt(shopPoint.x, shopPoint.y)
  await page.waitForTimeout(3000)
  s = await snapshot(page)
  const story = await page.locator('.story-layer').count()
  record(test, '觀賞模式點店家建築不開啟故事', s.mode === 'explore' && story === 0 && shopPoint?.inView, `mode=${s.mode}`)
  clear = await cameraClearance(page)
  record(test, '店家名錄「聚焦建築」後鏡頭不穿牆', !clear.inside && !clear.crossed)

  // 6. 隱藏介面與恢復
  const hiddenState = () =>
    page.evaluate(() => {
      const visible = (selector) => {
        const el = document.querySelector(selector)
        return el ? getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0' : false
      }
      return {
        hidden: document.querySelector('.hud').classList.contains('is-ui-hidden'),
        gear: visible('.hud-quality__toggle'),
        menu: visible('.hud-menu__toggle'),
        bar: visible('.viewer-bar'),
        controls: visible('.hud-controls'),
        reveal: !!document.querySelector('[data-reveal-ui]'),
      }
    })
  await press(page.locator('.viewer-bar [data-hide-ui]'))
  await page.waitForFunction(() => document.querySelector('.hud.is-ui-hidden'))
  await page.waitForTimeout(1200)
  let h = await hiddenState()
  const pure = await frameStats(page)
  record(
    test,
    '隱藏介面：只留 3D 街景',
    h.hidden && !h.gear && !h.menu && !h.bar && !h.controls && h.reveal && pure.mean > 0.06,
    `設定 ${h.gear}、名錄 ${h.menu}、工具列 ${h.bar}、操作說明 ${h.controls}；畫面亮度 ${pure.mean.toFixed(2)}`,
  )
  const reveal = await page.locator('[data-reveal-ui]').boundingBox()
  await tapAt(reveal.x + reveal.width / 2, reveal.y + reveal.height / 2)
  // 介面以 0.4 秒淡入：等工具列完全顯示再檢查
  await waitFor(
    page,
    () => {
      const bar = document.querySelector('.viewer-bar')
      return !document.querySelector('.hud.is-ui-hidden') && bar && Number(getComputedStyle(bar).opacity) > 0.95
    },
    null,
    30000,
  )
  h = await hiddenState()
  record(test, '點右上角隱形觸發區恢復介面', !h.hidden && h.bar && !h.reveal)
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('#quality-panel [data-hide-ui]'))
  await page.waitForFunction(() => document.querySelector('.hud.is-ui-hidden'))
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('.hud.is-ui-hidden'))
  record(test, '從設定隱藏介面、按 Esc 恢復', true)

  // 7. 觀賞模式中切換年代：鏡頭位置與方向不變
  // （先把鏡頭放在街道上方的空位；若新年代的建築剛好佔到鏡頭的位置，鏡頭會被拉到最近的空位，不會卡進牆裡）
  await page.evaluate(() => {
    const v = window.__DDC__.viewer
    v.goalTarget.set(2, 3.2, 0.2)
    v.goalYaw = v.yaw + Math.atan2(Math.sin(Math.PI / 2 + 0.25 - v.yaw), Math.cos(Math.PI / 2 + 0.25 - v.yaw))
    v.goalPitch = 0.22
    v.goalDistance = 9
    v.lambda = 9
  })
  for (const eraId of ['modern', 'revival']) {
    await waitSettled(page)
    a = await snapshot(page)
    if (!(await page.locator('#quality-panel').count())) await press(page.locator('.hud-quality__toggle'))
    await press(page.locator(`[data-era-option="${eraId}"]`))
    const done = await waitFor(
      page,
      (id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id,
      eraId,
      TRANSITION_TIMEOUT,
    )
    b = await snapshot(page)
    const moved = Math.hypot(b.camera.x - a.camera.x, b.camera.y - a.camera.y, b.camera.z - a.camera.z)
    const turned = Math.acos(Math.min(1, a.direction.x * b.direction.x + a.direction.y * b.direction.y + a.direction.z * b.direction.z))
    record(
      test,
      `觀賞模式中切換到 ${eraId}：保持鏡頭位置與方向`,
      done && b.era === eraId && b.viewMode === 'viewer' && moved < 0.6 && turned < 0.05,
      `鏡頭移動 ${round(moved)} m、方向改變 ${round((turned * 180) / Math.PI)}°`,
    )
  }
  await page.keyboard.press('Escape')

  // 8. 返回探索
  await press(page.locator('[data-exit-viewer]'))
  const returned = await waitFor(page, () => window.__DDC__.viewer.phase === 'off', null, SETTLE_TIMEOUT)
  s = await snapshot(page)
  const exploreUi = await page.evaluate(() => ({ joystick: !!document.querySelector('.joystick'), bar: !!document.querySelector('.viewer-bar') }))
  const musicAfter = await page.evaluate(() => [localStorage.getItem('ddc.music.enabled'), localStorage.getItem('ddc.music.volume')])
  const playerKept = Math.hypot(s.player.x - before.player.x, s.player.z - before.player.z) < 1e-6
  record(
    test,
    '返回探索：人物與第三人稱鏡頭恢復、座標不變',
    returned && s.viewMode === 'explore' && s.playerVisible === true && playerKept && !exploreUi.bar && exploreUi.joystick === touch,
    `人物 (${round(s.player.x)}, ${round(s.player.z)})、搖桿${exploreUi.joystick ? '有' : '無'}`,
  )
  record(
    test,
    '返回探索：年代、畫質、音樂設定不重設',
    s.era === 'revival' && s.quality === before.quality && musicAfter.join() === musicBefore.join(),
    `年代 ${s.era}、畫質 ${s.quality}、音樂 ${musicAfter.join('/')}`,
  )

  // 9. 進出觀賞模式 10 次
  let cycleFailures = 0
  let darkest = 1
  for (let i = 0; i < CYCLES; i++) {
    await press(page.locator('.hud-quality__toggle'))
    await press(page.locator('[data-view-mode="viewer"]'))
    await page.waitForSelector('.viewer-bar')
    await page.waitForTimeout(800)
    if (i % 3 === 0) {
      if (touch) await fingers.drag([{ from: [cx, cy], to: [cx - 80, cy] }])
      else {
        await page.mouse.move(cx, cy)
        await page.mouse.down()
        await page.mouse.move(cx - 80, cy, { steps: 4 })
        await page.mouse.up()
      }
    }
    await press(page.locator('[data-exit-viewer]'))
    await page.waitForTimeout(800)
    s = await snapshot(page)
    const stats = await frameStats(page)
    darkest = Math.min(darkest, stats.mean)
    const ok =
      s.viewMode === 'explore' && s.started && s.playerVisible && Math.hypot(s.player.x - before.player.x, s.player.z - before.player.z) < 1e-6 && stats.mean > 0.06 && stats.dark < 0.6
    if (!ok) {
      cycleFailures++
      record(test, `第 ${i + 1} 次進出`, false, `mode=${s.viewMode} 人物 (${round(s.player.x)}, ${round(s.player.z)}) 亮度 ${stats.mean.toFixed(2)}`)
    }
  }
  const gl = await webglStatus(page)
  record(test, `進出觀賞模式 ${CYCLES} 次：不重設人物、不黑屏`, cycleFailures === 0 && !gl.error && gl.lost === 0, `最低畫面亮度 ${darkest.toFixed(2)}${gl.error ? `；${gl.error}` : ''}`)

  // 10. 已開放店家的故事互動（回到第一個年代，前往林復振）
  await press(page.locator('.hud-quality__toggle'))
  await press(page.locator('[data-era-option="qing-port"]'))
  await waitFor(page, () => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === 'qing-port', null, TRANSITION_TIMEOUT)
  await page.keyboard.press('Escape')
  await press(page.locator('.hud-menu__toggle'))
  await press(page.locator('.menu-shop', { hasText: '林復振' }).locator('.button-ghost'))
  const prompt = await waitFor(page, () => document.querySelector('.shop-prompt.is-visible'), null, 60000)
  if (touch) {
    await page.waitForTimeout(2500)
    const point = await page.evaluate(() => window.__DDC__.storefrontScreenPoint('lin-fu-zhen'))
    await page.touchscreen.tap(point.x, point.y)
  } else {
    await page.keyboard.press('KeyE')
  }
  const opened = await waitFor(page, () => document.querySelector('.story-layer[data-state="open"] .story__title')?.textContent === '林復振', null, 60000)
  record(test, `已開放店家：${touch ? '靠近後點店面' : '靠近後按 E'}開啟介紹`, prompt && opened)
  if (opened) {
    await press(page.locator('.story__close'))
    await page.waitForSelector('.story-layer', { state: 'detached', timeout: 30000 }).catch(() => {})
  }

  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
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
