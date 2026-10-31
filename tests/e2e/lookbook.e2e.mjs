/**
 * 固定視角截圖（美術修改的前後對照；真實瀏覽器，透過 Playwright 操作網頁；需要開發版的 window.__DDC__）
 *
 * 用 window.__DDC__.cameraOverride 把鏡頭固定在同一組位置，拍慈聖宮前、河岸、街道遠景與各年代兩三個店門口，
 * 兩種畫質（流暢 ?quality=low、精緻 ?quality=high）各拍一次，存成 960 寬的 JPEG，另存灰階縮圖（看明度差用）。
 * 每個年代另外量一次街道遠景的繪製呼叫（一個影格內所有 gl.render 的總數，含法線、色彩與陰影三趟）
 * 與場景裡可見的網格數，寫進 stats.json；lightPools 是燈光落點的著色器有沒有編譯過（流暢畫質必須是 false）。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   OUT=docs/lookbook/before node tests/e2e/lookbook.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、OUT（輸出資料夾，預設 docs/lookbook/latest）、
 *           ERAS（逗號分隔）、QUALITIES（預設 low,high）、TIME（固定動畫時間，秒；預設 12）、
 *           SET（shop-glow：只拍店內透光的店面視角，見 SHOP_GLOW_VIEWS）
 *           SET（details：改拍細部的近景——榕樹、大面積地面、灰泥牆、騎樓柱腳；
 *                air：空氣遠近感與光束——街道往兩頭的遠景、河岸，酒樓繁華與摩登加拍騎樓）
 *           SET=relief：材質凹凸與河面倒映——斜光下的牆面、屋瓦、地磚、河岸三個角度
 *           SET=audit：畫面審查——街道、每個開放店家的店門口與探索鏡頭、走進室內（跟隨鏡頭）、路線人物，見 auditViews.mjs
 *           SET=rain：雨天（第 14 階段）——街道遠景、亭仔腳的屋簷、簷口近看、慈聖宮前、河岸；配合 WEATHER 拍前後對照
 *           WEATHER（clear｜rain：加上 ?weather=，只在精緻畫質有效；不設定就不加參數）
 *           ONLY（正規表示式，只拍檔名符合的視角；SET=audit 重拍單張用）
 *           VIEWS（JSON：[[檔名, 鏡頭位置, 注視點], ...]，臨時指定視角，查問題時近看用；優先於 SET）
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
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null
const WEATHER = process.env.WEATHER ? `&weather=${process.env.WEATHER}` : ''
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

/** 細部的近景（第 9 階段・細部）：每個年代都拍同樣的位置 */
export const DETAIL_VIEWS = [
  ['banyan', '廟埕榕樹', [3.4, 1.9, 1.0], [7.6, 3.4, 7.0]],
  ['banyan-under', '河岸榕樹的粗枝', [-36.0, 1.6, 0.6], [-40.6, 3.7, -3.6]],
  ['ground', '大面積地面', [-22, 2.8, 0.2], [-8, 0, 0.3]],
  ['plaster', '樓上灰泥牆', [-7.8, 2.0, 1.6], [-7.8, 5.2, -4.6]],
  ['plaster-arcade', '洋樓立面', [17.8, 2.0, 1.4], [17.8, 5.4, -4.6]],
  ['column', '騎樓柱腳', [19.4, 1.15, -0.6], [20.8, 0.15, -3.1]],
]

/** 材質凹凸與河面倒映（只在精緻畫質）：每個年代都拍同樣的位置 */
export const RELIEF_VIEWS = [
  ['wall-north', '貼著北側立面斜看', [2, 2.0, -3.4], [12, 2.6, -4.7]],
  ['wall-south', '貼著南側立面斜看', [2, 2.0, 3.4], [12, 2.6, 4.7]],
  ['roof', '屋瓦', [-8, 9.5, 5], [-2, 6.5, -8]],
  ['ground', '地磚', [-22, 2.8, 0.2], [-8, 0, 0.3]],
  ['river', '河岸', [-41, 3.0, 3.5], [-72, -0.8, -1]],
  ['river-bank', '從河面看岸邊', [-58, 3.0, 9], [-40, 1.5, 0]],
  ['river-along', '沿著河岸', [-47.5, 2.6, 16], [-49, 0.2, -12]],
]

/** 雨天（第 14 階段，只在精緻畫質）：雨絲、亭仔腳的屋簷滴水與水簾、濕地面與積水倒影、河面的雨點 */
export const RAIN_VIEWS = [
  COMMON_VIEWS[2],
  ['arcade', '亭仔腳的屋簷', [0, 1.5, 0.3], [9, 2.2, -3.4]],
  ['eave', '簷口近看', [1, 1.3, 1.2], [3, 2.2, -2.6]],
  COMMON_VIEWS[0],
  COMMON_VIEWS[1],
]

/** 空氣遠近感與光束（第 9 階段追加）：往東、往西（夕陽方向）的街道遠景與河岸 */
export const AIR_VIEWS = [
  COMMON_VIEWS[2],
  ['street-west', '街道遠景（往河邊）', [32, 2.2, 0.4], [-20, 3.4, 0.0]],
  COMMON_VIEWS[1],
]

/** 騎樓（北側洋樓的亭仔腳，往西看向夕陽） */
export const AIR_ARCADE_VIEWS = {
  banquet: [['arcade', '騎樓', [26, 1.6, -2.9], [4, 3.2, 0.5]]],
  modern: [['arcade', '騎樓', [26, 1.6, -2.9], [4, 3.2, 0.5]]],
}

async function viewsFor(eraId) {
  if (process.env.VIEWS) return JSON.parse(process.env.VIEWS).map(([id, position, target, options]) => [id, id, position, target, options])
  if (SET === 'audit') {
    const [{ auditViews }, { buildEraWorldSync }] = await Promise.all([import('./auditViews.mjs'), import('../../src/game/world/buildWorld.js')])
    return auditViews(eraId, buildEraWorldSync(eraId).interiors ?? [])
  }
  if (SET === 'shop-glow') return SHOP_GLOW_VIEWS[eraId] ?? []
  if (SET === 'details') return DETAIL_VIEWS
  if (SET === 'relief') return RELIEF_VIEWS
  if (SET === 'rain') return RAIN_VIEWS
  if (SET === 'air') return [...AIR_VIEWS, ...(AIR_ARCADE_VIEWS[eraId] ?? [])]
  return [...COMMON_VIEWS, ...(ERA_VIEWS[eraId] ?? [])]
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
    const shoot = async (name, position, target, options = {}) => {
      await page.waitForFunction(() => window.__DDC__?.playerState, null, { timeout: TIMEOUT })
      await page.evaluate(({ position, target, css, follow }) => {
        // 介面藏起來（每張都重新確認：開發伺服器重新載入後樣式會消失）
        if (!document.getElementById('lookbook-css')) {
          const style = document.createElement('style')
          style.id = 'lookbook-css'
          style.textContent = css
          document.head.append(style)
        }
        const d = window.__DDC__
        if (follow) {
          // 跟隨鏡頭：把人物放進去、面向 facing，鏡頭由 CameraRig 自己跟上（看得出鏡頭有沒有穿牆）
          delete d.cameraOverride
          const [fx, fz] = follow.facing
          d.playerState.position.set(follow.position[0], 0, follow.position[1])
          d.playerState.velocity.set(0, 0, 0)
          d.playerState.level = follow.level ?? 0
          d.playerState.heading = Math.atan2(fx, fz)
          d.cameraState.targetYaw = d.cameraState.yaw = d.playerState.heading + Math.PI
          d.cameraState.snap = true
          return
        }
        const dx = target[0] - position[0]
        const dz = target[2] - position[2]
        const len = Math.hypot(dx, dz) || 1
        // 角色站在鏡頭後方，不在畫面裡
        d.playerState.position.set(position[0] - (dx / len) * 2.5, 0, position[2] - (dz / len) * 2.5)
        d.playerState.level = 0
        d.cameraOverride = { position, target }
      }, { position, target, css: HIDE_UI, follow: options.follow ?? null })
      // 室內按需產生（背景執行緒），跟隨鏡頭與審查視角多等一些影格（固定鏡頭在店裡時也要等室內產生完）
      await frames(options.follow ? 90 : SET === 'audit' ? 80 : 40)
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
        // 燈光落點（只在精緻畫質）：這一趟的著色器有沒有編譯過
        const lightPools = (info.programs ?? []).some((program) => program.name === 'LightPools')
        return { calls, meshes, lightPools }
      })

    // 每個年代各自重新載入（?era=），不經過年代選單的轉場與開場卡片
    for (const eraId of ERA_IDS) {
      await page.goto(`${BASE_URL}?era=${eraId}&quality=${quality}${WEATHER}`, { waitUntil: 'load' })
      await page.waitForFunction((era) => document.documentElement.dataset.sceneEra === era, eraId, { timeout: TIMEOUT })
      // 軟體繪圖很慢時開場按鈕的動畫一直不算「穩定」，等不到就直接點
      await page.locator('.intro__start').click({ timeout: 60000 }).catch(() => page.locator('.intro__start').click({ force: true }))
      await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
      await page.waitForTimeout(1500)
      const views = await viewsFor(eraId)
      for (const [id, , position, target, options] of views) {
        const name = `${eraId}-${id}-${quality}`
        if (ONLY && !ONLY.test(name)) continue
        await shoot(name, position, target, options)
        if (options?.follow) {
          // 人物實際停在哪裡（碰撞會把人物推出牆外）：寫進 stats.json 的 follow
          stats.follow ??= {}
          stats.follow[name] = await page.evaluate(() => {
            const p = window.__DDC__.playerState.position
            return [p.x, p.y, p.z].map((v) => Math.round(v * 100) / 100)
          })
        }
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
