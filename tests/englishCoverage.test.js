import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { EXEMPT_KEYS, walk } from '../tools/i18n/walk.mjs'

/**
 * 已完成英文化的資料檔：每個中文字串欄位都要有非空的 `*En` 對應。
 * 每個英文版 PR 補完一批，就把檔名加進這裡；全部補完後改成掃描 src/data 全部。
 */
const COMPLETE = [
  'teaRoute.js', 'talk.js', 'qingPortTalk.js', 'routes.js',
  'routes/folkloreRoute.js', 'routes/neighbourRoute.js', 'routes/newsRoute.js', 'routes/oldHouseRoute.js', 'routes/pastryRoute.js', 'routes/templeMealRoute.js',
  'ciShengMiaokouData.js', 'dihuaNianhuoData.js', 'huangYujieMuseum.js', 'jiangWeiShuiData.js', 'liChunShengData.js', 'liTingXiangData.js',
  'operatorsData.js', 'riceAndShineData.js', 'shizixuanData.js', 'wangJingQuanData.js', 'xiyuanData.js', 'inspectObjects.js', 'miTaiMuLayout.js',
  'eras.js', 'licenses.js', 'doddLayout.js', 'huangYujieLayout.js', 'linHuaTaiQingLayout.js', 'luguoCafeLayout.js',
  'riceAndShineEraConfig.js', 'riceAndShineLayout.js', 'shizixuanEraConfig.js', 'shizixuanLayout.js', 'squidSoupLayout.js', 'templeSnackLayout.js',
]

for (const name of COMPLETE) {
  test(`英文版：${name} 的中文字串都有英文對應`, async () => {
    const mod = await import(pathToFileURL(path.resolve('src/data', name)).href)
    const out = []
    for (const [key, value] of Object.entries(mod)) walk(value, key, out)
    const missing = out.filter((item) => !EXEMPT_KEYS.has(item.key) && !item.covered)
    assert.deepEqual(
      missing.slice(0, 10).map((item) => `${item.path}: ${item.text.slice(0, 30)}`),
      [],
      `${name} 缺 ${missing.length} 筆英文`,
    )
  })
}
