/**
 * 畫面閃爍（Z-fighting）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 1. 閃爍指標：同一個構圖，鏡頭只平移 3 公釐、各畫一張。一般的視差只會讓輪廓動到不到一個像素，
 *    共面的兩個面卻會整片互換顏色——所以「亮度差超過 40 的像素比例」就是閃爍的量。
 *    五個年代各取街道近看、遠看、貼地、騎樓下與店內等構圖，每一個都要低於門檻。
 * 2. 移動：向前走、向後走、左右平移、快速轉鏡頭（滑鼠或手指拖曳）、貼近建築、遠離建築；不能有頁面錯誤。
 * 3. 年代切換：五個年代依序切換後，場景裡只有一個年代的群組，每個室內只有一份（沒有重疊的舊模型）。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/flicker.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、ERAS（逗號分隔）、
 *           THRESHOLD（每個構圖的閃爍像素比例上限，預設 0.004）、REPORT（只量測、不判定，用來和修改前比較）
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { inflateSync } from 'node:zlib'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const ERA_IDS = (process.env.ERAS ?? 'qing-port,banquet,modern,postwar,revival').split(',')
const THRESHOLD = Number(process.env.THRESHOLD ?? 0.004)
const REPORT = !!process.env.REPORT
const TIMEOUT = 240000

/** 各年代的構圖（世界座標）：[名稱, 鏡頭位置, 注視點] */
function viewsFor(eraId) {
  const street = [
    ['北側立面・近', [-6, 1.7, -1.2], [-6, 3.2, 4.6]],
    ['南側立面・近', [8, 1.7, 1.2], [8, 3.2, -4.6]],
    ['街道遠景', [-30, 2.2, 0.4], [20, 3.0, 0.0]],
    ['斜看立面', [-18, 2.0, -2.2], [6, 3.4, 4.6]],
    ['貼地的鋪面', [-10, 0.6, 0.0], [10, 0.0, 0.5]],
    ['騎樓下', [-14, 1.6, 3.6], [6, 1.5, 3.6]],
    ['屋頂與女兒牆', [2, 9.5, -2.5], [2, 7.5, 5.5]],
  ]
  const interiors = {
    modern: [['稻舍・米行', [27.6, 1.7, 5.1], [30.2, 1.0, 8.5]]],
    postwar: [['稻舍・戰後', [27.6, 1.7, 5.1], [30.2, 1.0, 8.5]]],
    revival: [
      ['稻舍・用餐區', [27.25, 1.65, 5.25], [29.8, 0.9, 8.7]],
      ['稻舍・二樓', [27.2, 5.3, 9.7], [30.2, 4.6, 3.9]],
      ['永樂市場', [40.5, 1.7, 0], [52, 1.2, 0]],
    ],
  }
  return [...street, ...(interiors[eraId] ?? [])]
}

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

const results = []
function record(test, step, ok, detail = '') {
  results.push({ test, step, ok: REPORT ? true : ok, detail })
  console.log(`${REPORT ? '•' : ok ? '✔' : '✘'} [${test}] ${step}${detail ? ` — ${detail}` : ''}`)
}

/** 解開 PNG（8 位元 RGB／RGBA、不交錯），回傳每個像素的亮度 */
function luminance(buffer) {
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
  const out = new Float32Array(width * height)
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
    for (let x = 0; x < width; x++) {
      const i = x * channels
      out[y * width + x] = 0.2126 * line[i] + 0.7152 * line[i + 1] + 0.0722 * line[i + 2]
    }
    line.copy(prev)
  }
  return { width, height, data: out }
}

/**
 * 閃爍像素的比例：鏡頭平移前後（a、b）亮度差超過 40、不是輪廓位移，
 * 而且鏡頭沒動時（a 與 a2，同一個構圖再畫一次）沒有變——排除布幡擺動、燈籠、蒸氣等會動的東西。
 */
function flickerRatio(a, b, a2) {
  const { width, height } = a
  const flagged = new Uint8Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      if (Math.abs(a.data[i] - b.data[i]) <= 40) continue
      if (Math.abs(a.data[i] - a2.data[i]) > 12) continue
      // 輪廓位移：在旁邊一個像素找得到相近的顏色（視差移動了不到一個像素）
      let edge = false
      for (const j of [i - 1, i + 1, i - width, i + width]) {
        if (Math.abs(a.data[i] - b.data[j]) < 18) {
          edge = true
          break
        }
      }
      if (!edge) flagged[i] = 1
    }
  }
  // Z-fighting 是成片的：只算周圍 8 個像素裡至少 3 個也被標記的（排除遠處細線的單點鋸齒）
  let changed = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      if (!flagged[i]) continue
      const n = flagged[i - 1] + flagged[i + 1] + flagged[i - width] + flagged[i + width] + flagged[i - width - 1] + flagged[i - width + 1] + flagged[i + width - 1] + flagged[i + width + 1]
      if (n >= 3) changed++
    }
  }
  return changed / ((width - 2) * (height - 2))
}

async function runDevice(browser, device) {
  const touch = device === 'touch'
  const test = touch ? 'iPad 觸控・流暢' : '桌面・精緻'
  const quality = touch ? 'smooth' : 'fine'
  const context = await browser.newContext(touch ? { viewport: { width: 1180, height: 820 }, hasTouch: true } : { viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  page.setDefaultTimeout(TIMEOUT)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  const cdp = touch ? await context.newCDPSession(page) : null
  const frames = async (n) => {
    const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
    await page.waitForFunction((goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, { timeout: 60000 }).catch(() => {})
  }
  const press = (locator) => (touch ? locator.tap() : locator.click())
  const switchEra = async (id) => {
    if (!(await page.locator('#quality-panel').count())) {
      await press(page.locator('.hud-quality__toggle'))
      await page.waitForSelector('#quality-panel')
    }
    await press(page.locator(`[data-era-option="${id}"]`))
    const ok = await page
      .waitForFunction((id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id, id, { timeout: TIMEOUT })
      .then(() => true)
      .catch(() => false)
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForSelector('#quality-panel', { state: 'detached', timeout: 10000 }).catch(() => {})
    await frames(8)
    return ok
  }
  const shotAt = async (position, target) => {
    await page.evaluate(({ position, target }) => {
      window.__DDC__.cameraOverride = { position, target }
      document.documentElement.classList.add('fl-shot')
    }, { position, target })
    await frames(6)
    return luminance(await page.screenshot({ timeout: TIMEOUT }))
  }
  const sceneCheck = () =>
    page.evaluate(() => {
      const d = window.__DDC__
      const eras = []
      const interiors = {}
      d.scene.traverse((o) => {
        if (o.name?.startsWith('era-')) eras.push(o.name)
        if (o.name?.startsWith('interior-') && !o.name.endsWith('-detail') && !o.name.endsWith('-npcs')) interiors[o.name] = (interiors[o.name] ?? 0) + 1
      })
      return { eras, duplicates: Object.entries(interiors).filter(([, n]) => n > 1) }
    })

  await page.goto(`${BASE_URL}?era=${ERA_IDS[0]}&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction((era) => document.documentElement.dataset.sceneEra === era, ERA_IDS[0], { timeout: TIMEOUT })
  await page.addStyleTag({ content: 'html.fl-shot .hud, html.fl-shot .shop-prompt, html.fl-shot .hud-help, html.fl-shot .touch-controls, html.fl-shot .prompt-layer { visibility: hidden !important; }' })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2000)

  for (const eraId of ERA_IDS) {
    if ((await page.evaluate(() => document.documentElement.dataset.sceneEra)) !== eraId) await switchEra(eraId)
    // 1. 閃爍指標
    const scores = []
    for (const [name, position, target] of viewsFor(eraId)) {
      // 角色站在鏡頭後方 2.5 公尺（不在畫面裡；店內的構圖仍在室內產生的範圍內）
      await page.evaluate(({ position, target }) => {
        const d = window.__DDC__
        const dx = target[0] - position[0]
        const dz = target[2] - position[2]
        const len = Math.hypot(dx, dz) || 1
        d.playerState.position.set(position[0] - (dx / len) * 2.5, position[1] > 3 ? 3.75 : 0, position[2] - (dz / len) * 2.5)
        d.playerState.level = position[1] > 3 ? 1 : 0
      }, { position, target })
      await frames(30)
      const a = await shotAt(position, target)
      const b = await shotAt([position[0] + 0.003, position[1], position[2] + 0.002], [target[0] + 0.003, target[1], target[2] + 0.002])
      const a2 = await shotAt(position, target)
      const ratio = flickerRatio(a, b, a2)
      scores.push(`${name} ${(ratio * 100).toFixed(3)}%`)
      record(test, `${eraId}／${name}：鏡頭平移 3 mm，閃爍的像素`, ratio <= THRESHOLD, `${(ratio * 100).toFixed(3)}%`)
    }
    await page.evaluate(() => {
      delete window.__DDC__.cameraOverride
      document.documentElement.classList.remove('fl-shot')
      window.__DDC__.cameraState.snap = true
    })

    // 2. 移動：向前、向後、左右、快速轉鏡頭、貼近與遠離建築
    await page.evaluate(() => {
      const d = window.__DDC__
      d.playerState.position.set(-8, 0, 0)
      d.playerState.level = 0
      d.cameraState.snap = true
    })
    await frames(10)
    const moves = []
    for (const [key, ms] of [
      ['KeyW', 1600],
      ['KeyS', 1600],
      ['KeyA', 1000],
      ['KeyD', 1000],
    ]) {
      if (touch) {
        const base = await page.locator('.joystick__base').boundingBox()
        const cx = base.x + base.width / 2
        const cy = base.y + base.height / 2
        const dir = { KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[key]
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 5 }] })
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + dir[0] * base.width * 0.3, y: cy + dir[1] * base.height * 0.3, id: 5 }] })
        await page.waitForTimeout(ms)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      } else {
        await page.keyboard.down(key)
        await page.waitForTimeout(ms)
        await page.keyboard.up(key)
      }
      moves.push(key)
    }
    // 快速轉鏡頭
    const box = await page.locator('canvas').boundingBox()
    const cx = box.x + box.width * 0.62
    const cy = box.y + box.height * 0.45
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 9 }] })
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + i * 50, y: cy, id: 9 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else {
      await page.mouse.move(cx, cy)
      await page.mouse.down()
      await page.mouse.move(cx + 420, cy, { steps: 8 })
      await page.mouse.move(cx - 300, cy + 40, { steps: 8 })
      await page.mouse.up()
    }
    // 貼近建築（往北側立面走到擋住）、再退回街上
    await page.evaluate(() => {
      const d = window.__DDC__
      d.cameraState.targetYaw = d.cameraState.yaw = Math.PI
      d.cameraState.snap = true
    })
    await frames(4)
    await page.keyboard.down('KeyW')
    await page.waitForTimeout(touch ? 0 : 2200)
    await page.keyboard.up('KeyW')
    await page.keyboard.down('KeyS')
    await page.waitForTimeout(touch ? 0 : 2200)
    await page.keyboard.up('KeyS')
    await frames(6)
    record(test, `${eraId}：向前、向後、左右平移、快速轉鏡頭、貼近與遠離建築，沒有頁面錯誤`, errors.length === 0, `${moves.join('、')}；${scores.length} 個構圖`)
  }

  // 3. 年代切換後沒有重疊的舊模型
  const checks = []
  for (const eraId of ['revival', 'qing-port', 'modern', 'banquet', 'postwar', 'revival']) {
    const ok = await switchEra(eraId)
    await frames(20)
    const s = await sceneCheck()
    checks.push(ok && s.eras.length === 1 && s.eras[0] === `era-${eraId}` && s.duplicates.length === 0)
    console.log(`    → ${eraId}：年代群組 ${s.eras.join(',')}、重複的室內 ${JSON.stringify(s.duplicates)}`)
  }
  record(test, '連續切換年代：場景裡只有一個年代的群組，每個室內只有一份', checks.every(Boolean), checks.join('、'))
  record(test, '沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
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
