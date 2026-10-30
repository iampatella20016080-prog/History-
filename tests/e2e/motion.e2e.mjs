/**
 * 畫面動態的端對端測試（真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 畫面動態只在精緻畫質（使用者 2026-10-30 決定）。兩種畫質（流暢 low、精緻 high）× 五個年代：
 * - 精緻：河面材質是加了波紋與反光的版本（river-water）、船的倒影、落葉網格存在並在動、
 *   遮雨棚與煙的 uMotion = 1、蒸氣網格裡有煙（有廟埕的年代）
 * - 流暢：河面是原本的靜態材質、沒有倒影與落葉網格、uMotion = 0（布幡固定幅度、遮雨棚不動、煙畫成蒸氣）
 * - 兩種畫質：燈籠的實例矩陣隔幾個影格會改變（有燈籠的年代）
 * 另外量一個影格的繪製呼叫，不能超過 README 寫的每個年代 390 次；
 * 環境變數 EXPECT_SMOOTH_CALLS='{"qing-port":123,...}' 可以要求流暢畫質的數字和 #53 之前一模一樣。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/motion.e2e.mjs http://127.0.0.1:5173/
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const ERA_IDS = (process.env.ERAS ?? 'qing-port,banquet,modern,postwar,revival').split(',')
const QUALITIES = (process.env.QUALITIES ?? 'low,high').split(',')
const TIMEOUT = 240000
const DRAW_CALL_LIMIT = 390
const EXPECT_SMOOTH_CALLS = process.env.EXPECT_SMOOTH_CALLS ? JSON.parse(process.env.EXPECT_SMOOTH_CALLS) : null

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

const results = []
function record(step, ok, detail = '') {
  results.push({ step, ok })
  console.log(`${ok ? '✔' : '✘'} ${step}${detail ? ` — ${detail}` : ''}`)
}

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const drawCalls = {}
  for (const quality of QUALITIES) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 700 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
    for (const eraId of ERA_IDS) {
      const tag = `${eraId}/${quality}`
      await page.goto(`${BASE_URL}?era=${eraId}&quality=${quality}`, { waitUntil: 'load' })
      await page.waitForFunction((era) => document.documentElement.dataset.sceneEra === era, eraId, { timeout: TIMEOUT })
      await page.locator('.intro__start').click()
      await page.waitForFunction(() => document.querySelector('.hud.is-started') && window.__DDC__?.scene, null, { timeout: 30000 })
      // 鏡頭看著河岸廣場的榕樹與河面，角色站在旁邊
      await page.evaluate(() => {
        const d = window.__DDC__
        d.playerState.position.set(-36, 0, 2)
        d.cameraOverride = { position: [-34, 3, 6], target: [-60, 0, -2] }
      })
      await page.waitForTimeout(1500)

      const sample = () =>
        page.evaluate(() => {
          const d = window.__DDC__
          const out = { reflections: 0, leaves: null, water: null, still: false, awning: null, lanterns: null, smoke: 0, wind: null, motion: null }
          d.scene.traverse((o) => {
            if (o.name === 'boat-reflection') out.reflections++
            if (o.name === 'falling-leaves') out.leaves = { visible: o.visible, count: o.material.uniforms.uCount.value, time: o.material.uniforms.uTime.value }
            if (o.isInstancedMesh && o.count > 0 && o.material?.customProgramCacheKey?.() === 'lantern-glow') {
              out.lanterns = Array.from(o.instanceMatrix.array.slice(0, 16))
            }
            const key = o.material?.customProgramCacheKey?.()
            if (key === 'river-water') out.water = true
            if (o.isMesh && o.material?.isMeshToonMaterial && o.material.map && o.geometry?.type === 'PlaneGeometry' && o.geometry.parameters?.width === 1100 && key !== 'river-water') out.still = true
            if (key === 'awning-sway') out.awning = true
            if (o.geometry?.attributes?.aKind) out.smoke = Array.from(o.geometry.attributes.aKind.array).filter((k) => k > 0.5).length
            if (o.material?.uniforms?.uSmokePuffs) {
              out.wind = o.material.uniforms.uWind.value
              out.motion = o.material.uniforms.uMotion?.value ?? null
            }
          })
          return out
        })
      const a = await sample()
      // 等三個影格（軟體繪圖時一個影格可能要好幾百毫秒）
      const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
      await page.waitForFunction((goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + 3, { timeout: 60000 })
      const b = await sample()

      if (quality === 'high') {
        record(`${tag}：河面是加了波紋與反光的材質`, a.water === true)
        record(`${tag}：船的倒影`, a.reflections > 0, `${a.reflections} 艘`)
        record(`${tag}：落葉網格存在並在動`, !!a.leaves && a.leaves.count > 0 && b.leaves.time > a.leaves.time, a.leaves ? `每棵 ${a.leaves.count} 片` : '沒有')
      } else {
        record(`${tag}：河面是原本的靜態材質`, a.water === null && a.still, `river-water ${a.water}, still ${a.still}`)
        record(`${tag}：沒有船的倒影`, a.reflections === 0, `${a.reflections}`)
        record(`${tag}：沒有落葉網格`, a.leaves === null)
      }
      if (a.motion !== null) record(`${tag}：uMotion（精緻 1、流暢 0）`, a.motion === (quality === 'high' ? 1 : 0), `${a.motion}`)
      if (a.lanterns) record(`${tag}：燈籠的實例矩陣隨時間改變（擺動）`, a.lanterns.some((v, i) => Math.abs(v - b.lanterns[i]) > 1e-6))
      if (a.awning !== null) record(`${tag}：遮雨棚材質隨風`, a.awning === true)
      if (quality === 'high' && ['banquet', 'modern', 'postwar', 'revival'].includes(eraId)) record(`${tag}：廟埕的香煙（煙）`, a.smoke > 0, `${a.smoke} 個頂點`)
      if (a.wind !== null) record(`${tag}：風力在 0.25–1`, a.wind >= 0.25 && a.wind <= 1, a.wind.toFixed(3))

      // 一個影格的繪製呼叫（法線、色彩、陰影與後製全部加起來）
      await page.evaluate(() => (window.__DDC__.cameraOverride = { position: [-30, 2.2, 0.4], target: [20, 3.0, 0.0] }))
      await page.waitForTimeout(600)
      const calls = await page.evaluate(async () => {
        const d = window.__DDC__
        const info = d.gl.info
        info.autoReset = false
        info.reset()
        const start = d.frameCount ?? 0
        await new Promise((resolve) => {
          const tick = () => ((d.frameCount ?? 0) >= start + 3 ? resolve() : requestAnimationFrame(tick))
          tick()
        })
        const n = (d.frameCount ?? 0) - start
        const calls = Math.round(info.render.calls / Math.max(1, n))
        info.autoReset = true
        return calls
      })
      record(`${tag}：一個影格的繪製呼叫 ≤ ${DRAW_CALL_LIMIT}`, calls <= DRAW_CALL_LIMIT, `${calls}`)
      drawCalls[tag] = calls
      if (quality === 'low' && EXPECT_SMOOTH_CALLS?.[eraId] != null) {
        record(`${tag}：繪製呼叫和 #53 之前相同`, calls === EXPECT_SMOOTH_CALLS[eraId], `${calls}（之前 ${EXPECT_SMOOTH_CALLS[eraId]}）`)
      }
      await page.evaluate(() => delete window.__DDC__.cameraOverride)
    }
    record(`${quality}：沒有頁面錯誤`, errors.length === 0, errors.slice(0, 3).join(' | '))
    await page.close()
  }
  console.log(`繪製呼叫：${JSON.stringify(drawCalls)}`)
  await browser.close()
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}／${results.length} 通過`)
  if (failed.length) process.exit(1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
