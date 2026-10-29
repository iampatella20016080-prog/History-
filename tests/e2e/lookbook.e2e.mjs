/**
 * 固定視角截圖（美術修改的前後對照；真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 用 window.__DDC__.cameraOverride 把鏡頭固定在同一組位置，拍慈聖宮前、河岸、街道遠景與各年代兩三個店門口，
 * 兩種畫質（流暢 ?quality=low、精緻 ?quality=high）各拍一次，存成 960 寬的 JPEG，另存灰階縮圖（看明度差用）。
 * 每個年代另外量一次街道遠景的繪製呼叫（一個影格內所有 gl.render 的總數，含法線、色彩與陰影三趟）
 * 與場景裡可見的網格數，寫進 stats.json。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   OUT=docs/lookbook/before node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、OUT（輸出資料夾，預設 docs/lookbook/latest）、
 *           ERAS（逗號分隔）、QUALITIES（預設 low,high）、TIME（固定動畫時間，秒；預設 12）、
 *           SET（shop-glow：只拍店內透光的店面視角，見 SHOP_GLOW_VIEWS）
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const OUT = process.env.OUT ?? 'docs/lookbook/latest'
const ERA_IDS = (process.env.ERAS ?? 'qing-port,banquet,modern,postwar,revival').split(',')
const QUALITIES = (process.env.QUALITIES ?? 'low,high').split(',')
const SET = process.env.SET ?? 'default'
const TIMEOUT = 240000
const HIDE_UI =
  '.hud, .hud-quality, .hud-actions, .hud-controls, .hud-objective, .shop-prompt, .hud-help, .touch-controls, .prompt-layer, .dialogue-box, .controls-hint, .toast { visibility: hidden !important; }'

/** 每個年代都拍的視角：[檔名, 說明, 鏡頭位置, 注視點] */
export const COMMON_VIEWS = [
  ['temple', '慈聖宮前', [4, 2.3, -2.6], [4, 3.6, 14]],
  ['river', '河岸', [-41, 3.0, 3.5], [-72, -0.8, -1]],
  ['street', '街道遠景', [-30, 2.2, 0.4], [20, 3.0, 0.0]],
]

/** 店門口（北側的店面朝 +z、南側朝 −z；鏡頭站在街道另一側） */
function storefront(id, label, x, side) {
  return side === 'north' ? [id, label, [x, 1.75, 2.6], [x, 3.4, -6]] : [id, label, [x, 1.75, -2.6], [x, 3.4, 6]]
}

export const ERA_VIEWS = {
  'qing-port': [storefront('lin-fu-zhen', '林復振', -2, 'north'), storefront('dodd', '寶順洋行', 5.15, 'north'), storefront('lin-hua-tai', '林華泰茶行', -22, 'north')],
  banquet: [storefront('jiang-shan-lou', '江山樓', -13.5, 'south'), storefront('qian-yuan', '乾元藥行', 17.8, 'north'), storefront('lin-hua-tai', '林華泰茶行', -22, 'north')],
  modern: [storefront('bolero', '波麗路', 24.3, 'north'), storefront('xin-fang-chun', '新芳春茶行', -27, 'south'), storefront('shizixuan', '十字軒', -14.4, 'north')],
  postwar: [storefront('you-ji', '有記名茶', 11.6, 'north'), storefront('bolero', '波麗路', 24.3, 'north'), storefront('rice-and-shine', '迪化街329號', 29.2, 'south')],
  revival: [storefront('luguo', '爐鍋咖啡', 30.2, 'north'), storefront('lao-pan', '老潘魷魚羹', 33.4, 'south'), storefront('zi-yang', '滋養豆餡舖', -30.5, 'north')],
}

/**
 * 店內透光（SET=shop-glow）：一般街屋的店面，正面一張（看漸層與層架陰影）、斜看一張（看視差）。
 * 正面的注視點比店門口視角低，看得到店內深處。
 */
function glowViews(id, x, side) {
  const s = side === 'north' ? 1 : -1
  return [
    [`${id}-front`, `${id} 正面`, [x, 1.6, 2.4 * s], [x, 1.5, -6 * s]],
    [`${id}-oblique`, `${id} 斜看`, [x + 3.2, 1.6, 2.6 * s], [x - 1.2, 1.4, -4 * s]],
  ]
}

export const SHOP_GLOW_VIEWS = {
  'qing-port': [...glowViews('minnan-open', -31.8, 'north'), ...glowViews('minnan-south', 12.0, 'south')],
  banquet: [...glowViews('minnan-open', -7.8, 'north'), ...glowViews('arcade', -27.0, 'south'), ...glowViews('baroque', 11.6, 'north')],
  modern: [...glowViews('minnan-open', -2.0, 'north'), ...glowViews('minnan-south', -5.0, 'south')],
  postwar: [...glowViews('shutter', -31.8, 'north'), ...glowViews('baroque', 11.6, 'north')],
  revival: [...glowViews('glass', 5.2, 'north'), ...glowViews('minnan-open', -2.0, 'north')],
}

async function loadPlaywright() {
  const name = process.env.PLAYWRIGHT_MODULE ?? 'playwright'
  const resolved = name.startsWith('/') ? pathToFileURL(require.resolve(name)).href : name
  const module = await import(resolved)
  return module.chromium ? module : module.default
}

async function run() {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  mkdirSync(OUT, { recursive: true })
  const stats = {}
  const errors = []

  for (const quality of QUALITIES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(`${quality}: ${error.message}`))
    const frames = async (n) => {
      const start = await page.evaluate(() => window.__DDC__.frameCount ?? 0)
      await page.waitForFunction((goal) => (window.__DDC__.frameCount ?? 0) >= goal, start + n, { timeout: 60000 }).catch(() => {})
    }
    const shoot = async (name, position, target) => {
      await page.waitForFunction(() => window.__DDC__?.playerState, null, { timeout: TIMEOUT })
      await page.evaluate(({ position, target, css }) => {
        // 介面藏起來（每張都重新確認：開發伺服器重新載入後樣式會消失）
        if (!document.getElementById('lookbook-css')) {
          const style = document.createElement('style')
          style.id = 'lookbook-css'
          style.textContent = css
          document.head.append(style)
        }
        const d = window.__DDC__
        const dx = target[0] - position[0]
        const dz = target[2] - position[2]
        const len = Math.hypot(dx, dz) || 1
        // 角色站在鏡頭後方，不在畫面裡
        d.playerState.position.set(position[0] - (dx / len) * 2.5, 0, position[2] - (dz / len) * 2.5)
        d.playerState.level = 0
        d.cameraOverride = { position, target }
      }, { position, target, css: HIDE_UI })
      await frames(40)
      const png = await page.screenshot({ timeout: TIMEOUT })
      // 在網頁裡用 canvas 縮成 960 寬的 JPEG（放進 repo 的大小），另存 1/4 大小的灰階縮圖（看明度差用）
      const [color, gray] = await page.evaluate(async (b64) => {
        const image = new Image()
        image.src = `data:image/png;base64,${b64}`
        await image.decode()
        const encode = (scale, filter, type) => {
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(image.width * scale)
          canvas.height = Math.round(image.height * scale)
          const g = canvas.getContext('2d')
          g.filter = filter
          g.drawImage(image, 0, 0, canvas.width, canvas.height)
          return canvas.toDataURL(type, 0.8).split(',')[1]
        }
        return [encode(960 / image.width, 'none', 'image/jpeg'), encode(0.25, 'grayscale(1)', 'image/png')]
      }, png.toString('base64'))
      writeFileSync(join(OUT, `${name}.jpg`), Buffer.from(color, 'base64'))
      writeFileSync(join(OUT, `${name}.gray.png`), Buffer.from(gray, 'base64'))
      console.log(`✔ ${name}`)
    }
    const measure = () =>
      page.evaluate(async () => {
        const d = window.__DDC__
        const info = d.gl.info
        info.autoReset = false
        info.reset()
        const goal = (d.frameCount ?? 0) + 1
        await new Promise((resolve) => {
          const tick = () => ((d.frameCount ?? 0) > goal ? resolve() : requestAnimationFrame(tick))
          tick()
        })
        const frames = (d.frameCount ?? 0) - goal + 1
        const calls = Math.round(info.render.calls / Math.max(1, frames))
        info.autoReset = true
        let meshes = 0
        d.scene.traverseVisible((o) => {
          if (o.isMesh || o.isInstancedMesh || o.isPoints) meshes++
        })
        return { calls, meshes }
      })

    // 每個年代各自重新載入（?era=），不經過年代選單的轉場與開場卡片
    for (const eraId of ERA_IDS) {
      await page.goto(`${BASE_URL}?era=${eraId}&quality=${quality}`, { waitUntil: 'load' })
      await page.waitForFunction((era) => document.documentElement.dataset.sceneEra === era, eraId, { timeout: TIMEOUT })
      await page.locator('.intro__start').click()
      await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
      await page.waitForTimeout(1500)
      const views = SET === 'shop-glow' ? (SHOP_GLOW_VIEWS[eraId] ?? []) : [...COMMON_VIEWS, ...(ERA_VIEWS[eraId] ?? [])]
      for (const [id, , position, target] of views) {
        await shoot(`${eraId}-${id}-${quality}`, position, target)
      }
      const [, , position, target] = COMMON_VIEWS[2]
      await page.evaluate(({ position, target }) => (window.__DDC__.cameraOverride = { position, target }), { position, target })
      await frames(20)
      stats[`${eraId}/${quality}`] = await measure()
      console.log(`  ${eraId}/${quality}`, JSON.stringify(stats[`${eraId}/${quality}`]))
      await page.evaluate(() => delete window.__DDC__.cameraOverride)
    }
    await context.close()
  }
  await browser.close()
  writeFileSync(join(OUT, 'stats.json'), JSON.stringify({ stats, errors }, null, 2))
  if (errors.length) console.log('頁面錯誤：', errors)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
