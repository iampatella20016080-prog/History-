/**
 * 英文版全站檢查（第 13 階段）：用 ?lang=en 逐一打開每個年代、每家店的故事視窗（每一章）、
 * 設定選單、店家名錄、手記與路線地圖、總覽、授權頁，列出畫面上還看得到的中文。
 * 招牌（SVG／貼圖）不在 DOM 裡；括號裡附的中文原名（例如「Jiangshanlou (江山樓)」）與古文原文視為刻意保留。
 *
 * 用法：node tests/e2e/englishAudit.e2e.mjs http://127.0.0.1:5173/   （需要開發版的 window.__DDC__）
 * 環境變數：PLAYWRIGHT_MODULE、SHOTS（輸出截圖的資料夾，例如 docs/english）
 */
const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const SHOTS = process.env.SHOTS
const CJK = /[㐀-鿿]+/g
/** 括號裡的中文原名、書名號與引號內的中文原文，以及印章與插圖上的單字（包種、有記、焿…）和語言選項「中文」，都是刻意保留 */
const KEPT_GLYPHS = new Set([
  '包種', '有記', '米', '焿', '米苔目', '中文',
  // 古文原文（李春生 1895 年履歷；英譯在旁邊）與「兩種寫法比較」的原文字形（Dictionary 寫作 芋粿曲、價目表寫作 芋粿巧）
  '復受英商寶順行', '重盟', '東渡在台北', '芋粿曲', '芋粿巧',
  // 英文句中就是在談這兩個戲院的中文原名
  '大稻埕戲苑', '永樂座',
  // 黃玉階文史館：「元珍」「源珍」兩種寫法本身就是比較的對象
  '元珍', '源珍',
])
const stripKept = (text) =>
  text
    .replace(/[《〈][^》〉]*[》〉]/g, '')
    .replace(/[（(][^）)]*[\u3400-\u9fff][^）)]*[）)]/g, '')
    .replace(/[「“][^」”]*[\u3400-\u9fff][^」”]*[」”]/g, '')

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1180, height: 820 } })
const found = new Map()
const note = (where, text) => {
  for (const m of stripKept(text).match(CJK) ?? []) {
    if (KEPT_GLYPHS.has(m)) continue
    const key = `${where}｜${m}`
    if (!found.has(key)) found.set(key, true)
  }
}
const visibleText = () => page.evaluate(() => document.body.innerText)
const store = (fn, ...args) => page.evaluate(([f, a]) => window.__DDC__.useGameStore.getState()[f](...a), [fn, args])
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }) }

await page.goto(`${base}?lang=en`)
await page.getByRole('button', { name: /Start exploring/ }).click()
await page.waitForTimeout(3500)
const eras = await page.evaluate(() => window.__DDC__.useGameStore.getState().eraId && ['qing-port', 'banquet', 'modern', 'postwar', 'revival'])

for (const eraId of eras) {
  await page.goto(`${base}?lang=en&era=${eraId}`)
  await page.getByRole('button', { name: /Start exploring/ }).click()
  await page.waitForTimeout(3000)
  note(`${eraId}/street`, await visibleText())
  await shot(`street-${eraId}`)
  const shops = await page.evaluate(async (id) => {
    const { getShopsByEra } = await import('/src/data/shops.js')
    const { getEra } = await import('/src/data/eras.js')
    return getShopsByEra(getEra(id)).filter((s) => s.status === 'open').map((s) => ({ id: s.id, chapters: s.chapters.length }))
  }, eraId)
  for (const shop of shops) {
    await store('openShop', shop.id)
    await page.waitForTimeout(700)
    for (let c = 0; c < shop.chapters; c++) {
      await store('setChapter', c).catch(() => {})
      await page.waitForTimeout(150)
      note(`${eraId}/${shop.id}/ch${c}`, await visibleText())
    }
    if (shop.id === 'jiang-shan-lou') await shot(`story-${eraId}-${shop.id}`)
    await store('closeShop')
    await page.waitForTimeout(300)
  }
}
for (const [panel, fn] of [['settings', 'toggleQualityPanel'], ['directory', 'toggleMenu'], ['journal', 'toggleJournal'], ['overview', 'setOverviewOpen'], ['licenses', 'setLicensesOpen']]) {
  await store(fn, true).catch(() => {})
  await page.waitForTimeout(600)
  note(panel, await visibleText())
  await shot(`panel-${panel}`)
  await store(fn, false).catch(() => {})
}
await browser.close()
const list = [...found.keys()]
console.log(list.length ? `畫面上仍有中文（${list.length} 處）：\n${list.join('\n')}` : '英文版：畫面上沒有遺漏的中文')
process.exit(list.length ? 1 : 0)
