/**
 * 經典閱讀（三篇）的端對端測試（真實瀏覽器，透過 Playwright 操作網頁）
 *
 * 桌面（精緻畫質）與 iPad 尺寸（觸控、流暢畫質）各跑一次，三篇各一個年代：
 *   1. 霞海城隍廟（港口商街）〈勸和論〉、江山樓（酒樓繁華）〈臨床講義〉、林華泰茶行（酒樓繁華）〈一桿「稱仔」〉
 *      從分頁（觸控用點的）開啟「經典閱讀」章節：背景、原文與白話、詞語、連結、反思問題、查證狀態、出處都在
 *   2. 原文節選逐字出自維基文庫全文（顯示在畫面上的字）、〈臨床講義〉沒有節選但有說明
 *   3. 切換成英文：白話換成英文翻譯、原文保留、反思問題是英文
 *   4. 內文不超出視窗寬度（沒有橫向捲動），分頁在觸控裝置上可以點到
 *   5. 沒有頁面錯誤
 * 截圖（SHOTS）：兩種裝置都拍（桌面 1600×900、iPad 1180×820）。
 *
 * 用法：
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   node tests/e2e/classics.e2e.mjs http://127.0.0.1:5173/
 *
 * 環境變數：PLAYWRIGHT_MODULE、CHROMIUM_EXECUTABLE、DEVICES（desktop,touch）、SHOTS（截圖資料夾）、HEADED=1
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CLASSICS } from '../../src/data/classicsData.js'

const require = createRequire(import.meta.url)
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173/'
const DEVICES = (process.env.DEVICES ?? 'desktop,touch').split(',')
const SHOTS = process.env.SHOTS ?? null
const TIMEOUT = Number(process.env.TIMEOUT ?? 120000)

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

/** 每篇的起始年代與要核對的畫面文字 */
const CASES = {
  'classic-quan-he-lun': { era: 'qing-port', shot: '01-quan-he-lun', title: '經典閱讀：鄭用錫〈勸和論〉', enTitle: 'Classic reading: Zheng Yongxi' },
  'classic-clinical-lecture': { era: 'banquet', shot: '02-clinical-lecture', title: '經典閱讀：蔣渭水〈臨床講義〉', enTitle: 'Classic reading: Jiang Weishui' },
  'classic-yi-gan-cheng-zai': { era: 'banquet', shot: '03-yi-gan-cheng-zai', title: '經典閱讀：賴和〈一桿「稱仔」〉', enTitle: 'Classic reading: Lai He' },
}

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
  const store = (fn, arg) => page.evaluate(fn, arg)

  if (SHOTS) mkdirSync(SHOTS, { recursive: true })
  const shoot = async (name) => {
    if (!SHOTS) return
    await page.screenshot({ path: join(SHOTS, `${name}-${device}.jpg`), type: 'jpeg', quality: 86 })
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
  const switchEra = async (eraId) => {
    await openSettings()
    await press(page.locator(`[data-era-option="${eraId}"]`))
    await page.waitForFunction((id) => document.documentElement.dataset.eraTransition === 'idle' && document.documentElement.dataset.sceneEra === id, eraId, { timeout: TIMEOUT })
    await closeSettings()
    await page.waitForTimeout(1500)
  }

  await page.goto(`${BASE_URL}?era=qing-port&quality=${quality}`, { waitUntil: 'load' })
  await page.waitForFunction(() => document.documentElement.dataset.sceneEra === 'qing-port', null, { timeout: TIMEOUT })
  await press(page.locator('.intro__start'))
  await page.waitForFunction(() => document.querySelector('.hud.is-started'), null, { timeout: 30000 })
  await page.waitForTimeout(2000)

  // 年代由 qing-port 開始，再到 banquet：依 CASES 的年代順序
  const order = [...new Set(CLASSICS.map((item) => CASES[item.id].era))]
  for (const eraId of order) {
    if (eraId !== 'qing-port') await switchEra(eraId)
    for (const item of CLASSICS.filter((entry) => CASES[entry.id].era === eraId)) {
      const spec = CASES[item.id]
      const chapter = item.chapter
      const label = `${item.shopId}@${eraId}`

      // 開啟店家介紹，再用分頁（觸控用點的）切到經典閱讀
      await page.evaluate((id) => window.__DDC__.useGameStore.getState().openShop(id), item.shopId)
      await page.waitForSelector('.story[role="dialog"]')
      const tab = page.locator('.story__tab', { hasText: chapter.tab })
      record(test, `${label}：有「${chapter.tab}」分頁`, (await tab.count()) === 1)
      await tab.scrollIntoViewIfNeeded()
      await press(tab)
      await page.waitForSelector('.chapter--classic')
      const title = await page.locator('.chapter--classic .chapter__title').innerText()
      record(test, `${label}：章節標題是「${spec.title}」`, title === spec.title, title)

      // 六個步驟、反思問題、查證狀態、出處都在
      const steps = await page.locator('.classic-step__title').allInnerTexts()
      record(test, `${label}：背景、原文、詞語、連結、反思、查證狀態都在`, steps.length === 6 && /背景/.test(steps[0]) && /原文/.test(steps[1]) && /反思/.test(steps[4]), steps.join('｜'))
      const question = await page.locator('.classic-reflect__question').innerText()
      record(test, `${label}：有一個連結現代生活的反思問題`, question === chapter.reflection.question, question.slice(0, 24))
      const statuses = await page.locator('.classic-check__status').allInnerTexts()
      record(test, `${label}：查證狀態標出「有出處」「待核」「查無，不寫」`, ['有出處', '待核', '查無，不寫'].every((text) => statuses.includes(text)), [...new Set(statuses)].join('、'))
      const sources = await page.locator('.chapter__source a').count()
      record(test, `${label}：列出 ${chapter.sourceIds.length} 筆出處`, sources === chapter.sourceIds.length, `${sources}`)

      // 原文節選
      const originals = await page.locator('.classic-excerpt__original').allInnerTexts()
      if (chapter.excerpts.length) {
        const same = originals.length === chapter.excerpts.length && originals.every((text, i) => text.replace(/\s+/g, '') === chapter.excerpts[i].original.replace(/\s+/g, ''))
        record(test, `${label}：${originals.length} 段原文節選，畫面上的字和資料一致`, same)
        const plain = await page.locator('.classic-excerpt__plain').first().innerText()
        record(test, `${label}：原文下面有白話翻譯`, plain.includes('白話翻譯') && plain.length > 40)
      } else {
        const none = await page.locator('.classic-excerpt--none').innerText()
        record(test, `${label}：沒有原文節選，畫面說明原文是日文、不引用譯本，並列出本站整理的重點`, originals.length === 0 && /日文/.test(none) && /不是引文/.test(none) && /五項/.test(none), none.slice(0, 30))
      }

      // 版面：內文沒有橫向捲動，分頁的點擊區夠大
      const layout = await page.evaluate(() => {
        const body = document.querySelector('.story__body')
        const dialog = document.querySelector('.story')
        const tabEl = document.querySelector('.story__tab.is-active')
        const box = tabEl.getBoundingClientRect()
        return { overflowX: body.scrollWidth > body.clientWidth + 1, dialogFits: dialog.getBoundingClientRect().right <= window.innerWidth + 1, tabHeight: box.height }
      })
      record(test, `${label}：內文沒有橫向捲動、視窗在畫面內、分頁夠大`, !layout.overflowX && layout.dialogFits && layout.tabHeight >= 28, `${Math.round(layout.tabHeight)}px`)

      // 截圖：原文節選區（臨床講義是沒有節選的說明區）
      await page.evaluate(() => {
        const body = document.querySelector('.story__body')
        body.style.scrollBehavior = 'auto'
        const step = document.querySelectorAll('.classic-step')[1]
        body.scrollTop = step.offsetTop - 70
      })
      await page.waitForTimeout(500)
      await shoot(spec.shot)

      // 英文模式：白話換成英文翻譯、原文保留
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setLang('en'))
      await page.waitForFunction(() => document.documentElement.lang === 'en')
      await page.waitForTimeout(400)
      const enTitle = await page.locator('.chapter--classic .chapter__title').innerText()
      record(test, `${label}：英文模式標題是英文`, enTitle.startsWith(spec.enTitle), enTitle)
      const enStatuses = await page.locator('.classic-check__status').allInnerTexts()
      record(test, `${label}：英文模式查證狀態是英文`, ['Sourced', 'To be verified', 'Not found, left out'].every((text) => enStatuses.includes(text)), [...new Set(enStatuses)].join('、'))
      const enQuestion = await page.locator('.classic-reflect__question').innerText()
      record(test, `${label}：英文模式反思問題是英文`, !/[㐀-鿿]/.test(enQuestion), enQuestion.slice(0, 30))
      if (chapter.excerpts.length) {
        const enOriginal = await page.locator('.classic-excerpt__original').first().innerText()
        const enPlain = await page.locator('.classic-excerpt__plain').first().innerText()
        record(test, `${label}：英文模式原文仍是中文、下面是英文翻譯`, /[㐀-鿿]/.test(enOriginal) && enPlain.includes('English translation') && !/[㐀-鿿]{4}/.test(enPlain.replace('English translation', '')), enPlain.slice(0, 40))
      }
      await shoot(`${spec.shot}-en`)
      await page.evaluate(() => window.__DDC__.useGameStore.getState().setLang('zh-Hant'))
      await page.waitForFunction(() => document.documentElement.lang !== 'en')
      await page.evaluate(() => window.__DDC__.useGameStore.getState().closeShop())
      await page.waitForSelector('.story', { state: 'detached', timeout: 10000 })
      await page.waitForTimeout(500)
    }
  }

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
