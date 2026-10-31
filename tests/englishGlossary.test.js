import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { STRINGS } from '../src/i18n/strings.js'

/** 譯名表（docs/research/english-glossary.md）的「禁用寫法」：英文欄位裡不能出現 */
const BANNED = [
  [/\bTaibei\b|\bTai-pei\b/, 'Taipei'],
  [/Dadaocheng Street\b/, 'Dadaocheng 或 Dihua Street'],
  [/\bHarbor\b|\bharbor\b/, '英式 harbour'],
]

function listSources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? listSources(full) : /\.(js|jsx)$/.test(entry.name) ? [full] : []
  })
}

test('譯名表：英文介面字串與資料的 *En 欄位沒有禁用寫法', () => {
  const problems = []
  for (const [key, text] of Object.entries(STRINGS.en)) for (const [re, use] of BANNED) if (re.test(text)) problems.push(`strings:${key} → ${use}`)
  for (const file of listSources('src/data')) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (!/\b\w*En:/.test(line)) return
      for (const [re, use] of BANNED) if (re.test(line)) problems.push(`${file}:${i + 1} → ${use}`)
    })
  }
  assert.deepEqual(problems, [])
})
