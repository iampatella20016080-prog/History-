/**
 * 主角年代服裝的端對端測試（真實瀏覽器，需要開發版：npm run dev）
 *
 * 從右上角設定連續切換年代，每次檢查：
 *   1. 角色換上該年代的服裝（場景中角色的網格全部屬於這一套，數量與定義相同，沒有上一套的帽子或包包殘留）
 *   2. 角色位置不變、鏡頭沒有被重設、遊戲沒有重新開始
 * 之後在每套服裝下：
 *   3. 走路（按住 W）時取樣鞋底高度：最低的鞋底貼地，不會沉到地面下
 *   4. 原地轉身（A／D）後角色仍在原位、沒有錯誤
 * 最後：建築觀賞模式中角色保持隱藏，返回探索後重新出現且服裝不變。
 *
 * 用法：node tests/e2e/outfits.e2e.mjs http://127.0.0.1:5173/
 * 環境變數：PLAYWRIGHT_MODULE、SEQUENCE（以逗號分隔的年代 id）、HEADED=1
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const SEQUENCE = (process.env.SEQUENCE ?? 'banquet,modern,postwar,revival,qing-port,modern,banquet').split(',')
const TIMEOUT = Number(process.env.TRANSITION_TIMEOUT ?? 240000)

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

const results = []
function record(step, ok, detail = '') {
  results.push({ step, ok, detail })
  console.log(`${ok ? '✔' : '✘'} ${step}${detail ? ` — ${detail}` : ''}`)
}
const round = (n) => Math.round(n * 1000) / 1000

/** 場景中角色的服裝網格：所屬的服裝 id、數量，以及定義中的數量 */
function outfitState(page) {
  return page.evaluate(() => {
    const d = window.__DDC__
    const player = d.scene.getObjectByName('player')
    const ids = new Set()
    let meshes = 0
    player.traverse((object) => {
      if (object.isMesh && object.name.startsWith('outfit:')) {
        ids.add(object.name.split(':')[1])
        meshes++
      }
    })
    const era = d.useGameStore.getState().eraId
    const expected = Object.values(d.getOutfit(era).slots).reduce((sum, list) => sum + list.length, 0)
    const c = d.camera.position
    return {
      era,
      outfit: player.userData.outfit,
      ids: [...ids],
      meshes,
      expected,
      visible: player.visible,
      player: { x: d.playerState.position.x, z: d.playerState.position.z },
      camera: { x: c.x, y: c.y, z: c.z },
      started: d.useGameStore.getState().started,
    }
  })
}

/** 兩隻腳的鞋底最低點（世界座標 y） */
function soleHeights(page) {
  return page.evaluate(() => {
    const player = window.__DDC__.scene.getObjectByName('player')
    player.updateMatrixWorld(true)
    const result = {}
    player.traverse((object) => {
      if (!object.isMesh || !/:foot(Right|Left)$/.test(object.name)) return
      const side = object.name.endsWith('Right') ? 'right' : 'left'
      const position = object.geometry.attributes.position
      const v = object.position.clone()
      let min = Infinity
      for (let i = 0; i < position.count; i++) {
        v.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld)
        if (v.y < min) min = v.y
      }
      result[side] = Math.min(result[side] ?? Infinity, min)
    })
    return result
  })
}

const playwright = await loadPlaywright()
const browser = await playwright.chromium.launch({
  headless: !process.env.HEADED,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
console.log(`瀏覽器：chromium ${browser.version()}　網址：${BASE_URL}`)
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } })
page.setDefaultTimeout(TIMEOUT)
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))

try {
  await page.goto(`${BASE_URL}?quality=smooth`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra, null, { timeout: 120000 })
  await page.locator('.intro__start').click()
  await page.waitForFunction(() => document.querySelector('.hud.is-started'))
  // 等開場鏡頭移到角色身後、停穩後再開始（之後才比較切換年代前後的鏡頭位置）。
  // 軟體繪圖下一個影格可能要好幾秒，所以要比較「不同影格」的鏡頭位置：連續兩個新影格都沒動才算停穩
  let previous = null
  let lastFrame = -1
  let still = 0
  for (let i = 0; i < 180 && still < 2; i++) {
    await page.waitForTimeout(1000)
    const frame = await page.evaluate(() => window.__DDC__.frameCount ?? null)
    if (frame !== null && frame === lastFrame) continue
    lastFrame = frame
    const c = (await outfitState(page)).camera
    still = previous && Math.hypot(c.x - previous.x, c.y - previous.y, c.z - previous.z) < 0.005 ? still + 1 : 0
    previous = c
  }

  let s = await outfitState(page)
  record('起點：港口商街服裝', s.outfit === 'qing-port' && s.ids.join() === 'qing-port' && s.meshes === s.expected, `${s.meshes}/${s.expected} 個網格`)

  // 1–2. 連續換裝
  for (const eraId of SEQUENCE) {
    const before = await outfitState(page)
    if (!(await page.locator('#quality-panel').count())) await page.locator('.hud-quality__toggle').click()
    await page.locator(`[data-era-option="${eraId}"]`).click()
    const done = await page
      .waitForFunction(
        (id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id,
        eraId,
        { timeout: TIMEOUT, polling: 500 },
      )
      .then(() => true)
      .catch(() => false)
    await page.waitForTimeout(1500)
    s = await outfitState(page)
    const moved = Math.hypot(s.player.x - before.player.x, s.player.z - before.player.z)
    const cameraMoved = Math.hypot(s.camera.x - before.camera.x, s.camera.y - before.camera.y, s.camera.z - before.camera.z)
    record(
      `切換到 ${eraId}：換上對應服裝、沒有殘留`,
      done && s.outfit === eraId && s.ids.length === 1 && s.ids[0] === eraId && s.meshes === s.expected,
      `服裝 ${s.ids.join('、')}，${s.meshes}/${s.expected} 個網格`,
    )
    record(`切換到 ${eraId}：位置與鏡頭不重設`, moved < 1e-6 && cameraMoved < 0.05 && s.started, `角色移動 ${round(moved)} m、鏡頭移動 ${round(cameraMoved)} m`)
  }
  await page.keyboard.press('Escape')

  // 3–4. 每套服裝走路與轉身
  for (const eraId of ['qing-port', 'banquet', 'modern', 'postwar', 'revival']) {
    if ((await outfitState(page)).era !== eraId) {
      await page.locator('.hud-quality__toggle').click()
      await page.locator(`[data-era-option="${eraId}"]`).click()
      await page.waitForFunction(
        (id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id,
        eraId,
        { timeout: TIMEOUT, polling: 500 },
      )
      await page.keyboard.press('Escape')
    }
    const start = await outfitState(page)
    // 按住 W 往前走，期間取樣鞋底高度
    await page.keyboard.down('KeyW')
    // highest：每次取樣中「較低那隻腳」離地高度的最大值（兩腳同時懸空時會變大）；deepest：最深的鞋底
    // 軟體繪圖下一個影格可能要好幾秒：按住直到走了 1 公尺（最多 90 秒），期間每 1.5 秒取樣
    let highest = -Infinity
    let deepest = Infinity
    let samples = 0
    const deadline = Date.now() + 90000
    while (Date.now() < deadline) {
      await page.waitForTimeout(1500)
      const now = await outfitState(page)
      const speed = await page.evaluate(() => window.__DDC__.playerState.speed)
      if (speed > 0.5) {
        const soles = await soleHeights(page)
        highest = Math.max(highest, Math.min(soles.right, soles.left))
        deepest = Math.min(deepest, soles.right, soles.left)
        samples++
      }
      if (Math.hypot(now.player.x - start.player.x, now.player.z - start.player.z) > 1 && samples >= 4) break
    }
    await page.keyboard.up('KeyW')
    const walked = await outfitState(page)
    const distance = Math.hypot(walked.player.x - start.player.x, walked.player.z - start.player.z)
    record(
      `${eraId}：走路時鞋底貼地、不沉入地面`,
      samples >= 3 && deepest > -0.02 && highest < 0.03 && distance > 0.5,
      `取樣 ${samples} 次、較低的鞋底最高離地 ${round(highest)} m、最深 ${round(deepest)} m、走了 ${round(distance)} m`,
    )
    // 原地轉身：左右各按一下
    for (const key of ['KeyA', 'KeyD', 'KeyS']) {
      await page.keyboard.down(key)
      await page.waitForTimeout(1200)
      await page.keyboard.up(key)
    }
    await page.waitForTimeout(1500)
    const soles = await soleHeights(page)
    const turned = await outfitState(page)
    record(`${eraId}：轉身後站立時鞋底在地面`, Math.abs(soles.right) < 0.02 && Math.abs(soles.left) < 0.02 && turned.outfit === eraId, `右 ${round(soles.right)} m、左 ${round(soles.left)} m`)
  }

  // 5. 建築觀賞模式中角色保持隱藏
  await page.locator('.hud-quality__toggle').click()
  await page.locator('[data-view-mode="viewer"]').click()
  await page.waitForFunction(() => window.__DDC__.scene.getObjectByName('player').visible === false, null, { timeout: 60000 })
  await page.waitForTimeout(2000)
  s = await outfitState(page)
  record('建築觀賞模式中角色隱藏', s.visible === false)
  await page.locator('[data-exit-viewer]').click()
  await page.waitForFunction(() => window.__DDC__.scene.getObjectByName('player').visible === true, null, { timeout: 60000 })
  s = await outfitState(page)
  record('返回探索後角色出現、服裝不變', s.visible && s.outfit === s.era && s.meshes === s.expected, s.outfit)
  record('沒有頁面錯誤', errors.length === 0, errors.slice(0, 3).join(' | '))
} finally {
  await browser.close()
}

const failed = results.filter((item) => !item.ok)
console.log(`\n共 ${results.length} 項檢查：通過 ${results.length - failed.length} 項、失敗 ${failed.length} 項`)
process.exit(failed.length ? 1 : 0)
