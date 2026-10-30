// 英文版盤點：列出 src/ 裡所有使用者看得到的中文字串，以及哪些已有英文對應。
// 用法：node tools/i18n/inventory.mjs [--write]   （--write 會更新 docs/research/english-inventory.md）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
import { EXEMPT_KEYS, hasCjk, walk } from './walk.mjs'

function listFiles(dir, exts) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return listFiles(p, exts)
    return exts.some((x) => p.endsWith(x)) && !/ 2\./.test(p) ? [p] : []
  })
}

async function dataInventory() {
  const rows = []
  for (const file of listFiles(path.join(ROOT, 'src/data'), ['.js'])) {
    let mod
    try {
      mod = await import(pathToFileURL(file).href)
    } catch (e) {
      rows.push({ file: path.relative(ROOT, file), error: e.message })
      continue
    }
    const out = []
    for (const [name, val] of Object.entries(mod)) walk(val, name, out)
    rows.push({ file: path.relative(ROOT, file), items: out })
  }
  return rows
}

/** 介面元件裡的中文：以字面掃描（JSX 文字、字串、樣板字串），已走字串表的不會有中文 */
function uiInventory() {
  const rows = []
  for (const file of [...listFiles(path.join(ROOT, 'src/ui'), ['.jsx', '.js']), ...listFiles(path.join(ROOT, 'src/game/components'), ['.jsx']), path.join(ROOT, 'src/App.jsx')]) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    const hits = []
    lines.forEach((line, i) => {
      if (!hasCjk(line)) return
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
      const code = line.replace(/\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '')
      if (hasCjk(code)) hits.push({ line: i + 1, text: line.trim().slice(0, 100) })
    })
    if (hits.length) rows.push({ file: path.relative(ROOT, file), hits })
  }
  return rows
}

const data = await dataInventory()
const ui = uiInventory()
let total = 0
let missing = 0
const lines = []
const fileRows = []
for (const r of data) {
  if (r.error) { fileRows.push(`| \`${r.file}\` | 無法載入：${r.error.slice(0, 60)} | | |`); continue }
  const items = r.items.filter((i) => !EXEMPT_KEYS.has(i.key))
  const miss = items.filter((i) => !i.covered)
  const chars = miss.reduce((n, i) => n + i.text.length, 0)
  total += items.length
  missing += miss.length
  if (items.length) fileRows.push(`| \`${r.file}\` | ${items.length} | ${miss.length} | ${chars} |`)
  if (miss.length) {
    lines.push(`\n### \`${r.file}\`（缺 ${miss.length}）\n`)
    for (const i of miss.slice(0, 400)) lines.push(`- \`${i.path}\`：${i.text.replace(/\n/g, ' ').slice(0, 50)}`)
    if (miss.length > 400) lines.push(`- …另外 ${miss.length - 400} 筆`)
  }
}
const uiCount = ui.reduce((n, r) => n + r.hits.length, 0)
const md = [
  '# 英文版盤點',
  '',
  '由 `node tools/i18n/inventory.mjs --write` 產生；每次補完一批要重新跑。',
  '',
  `- 資料檔中文字串：**${total}**，尚無英文對應：**${missing}**（排除 ${[...EXEMPT_KEYS].join('、')} 等刻意保留的欄位）`,
  `- 介面元件裡仍寫死中文的行：**${uiCount}**`,
  '',
  '## 資料檔',
  '',
  '| 檔案 | 中文字串 | 缺英文 | 缺的字數 |',
  '| --- | ---: | ---: | ---: |',
  ...fileRows,
  '',
  '## 介面元件（寫死的中文）',
  '',
  ...ui.flatMap((r) => [`### \`${r.file}\`（${r.hits.length}）`, '', ...r.hits.slice(0, 60).map((h) => `- L${h.line}：\`${h.text.replace(/`/g, "'")}\``), '']),
  '## 資料檔缺英文明細（每檔最多列 400 筆）',
  ...lines,
  '',
].join('\n')
if (process.argv.includes('--write')) fs.writeFileSync(path.join(ROOT, 'docs/research/english-inventory.md'), md)
console.log(`data strings ${total}, missing ${missing}, ui hard-coded lines ${uiCount}`)
console.log(fileRows.join('\n'))
