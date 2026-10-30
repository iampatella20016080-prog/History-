// 由 src/audio/ambienceCredits.js 產生 public/audio/ambience/CREDITS.md（改了資料檔就重新執行；測試會檢查兩者一致）
// 用法：node tools/music/write_ambience_credits.mjs
import { statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AMBIENCE_SOUNDS, ERA_AMBIENCE } from '../../src/audio/ambienceCore.js'
import { AMBIENCE_CREDITS, AMBIENCE_FALLBACK_SOURCE, AMBIENCE_SOURCES } from '../../src/audio/ambienceCredits.js'
import { ERAS } from '../../src/data/eras.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const kb = (file) => Math.round(statSync(join(ROOT, 'public', file)).size / 1024)
const cell = (text) => String(text).replaceAll('|', '／').replaceAll('\n', ' ')

const lines = [
  '# 環境音：來源與授權',
  '',
  '這個資料夾的環境音全部是 **CC0 或公有領域** 的真實錄音，經過剪輯做成可無縫循環的短音檔（不使用 CC-BY 等需要署名的授權）。',
  '資料檔是 `src/audio/ambienceCredits.js`，這份文件由 `node tools/music/write_ambience_credits.mjs` 產生；剪輯程式是 `tools/music/build_ambience_real.py`',
  '（只做剪輯、濾波、音量、峰值限制、淡入淡出、交叉淡化與混音，沒有加入任何合成的聲音）。',
  '',
  '格式：單聲道 32 kHz、MP3 64 kbps，前後各多 1 秒循環內容（網頁以 loopStart = 1、loopEnd = 1 + 循環長度播放）。',
  '「情境示意」表示錄音不是當年、當地的聲音，只取它的聲響質感。',
  '',
  `\`synth/\` 裡是第 9 階段程式合成的示意音（${AMBIENCE_FALLBACK_SOURCE}），只在真實錄音載入或解碼失敗時使用。`,
  '',
  '## 各年代用到的聲音',
  '',
  '| 年代 | 音檔 |',
  '| --- | --- |',
  ...ERAS.map((era) => `| ${era.title}（${era.id}） | ${ERA_AMBIENCE[era.id].map((e) => `\`${e.sound}.mp3\``).join('、')} |`),
  '',
  '## 音檔',
  '',
  '| 音檔 | 循環 | 大小 | 來源 | 剪輯 | 情境示意 |',
  '| --- | --- | --- | --- | --- | --- |',
]
for (const [id, sound] of Object.entries(AMBIENCE_SOUNDS)) {
  const credit = AMBIENCE_CREDITS[id]
  const sources = credit.sources.map((sid) => `${AMBIENCE_SOURCES[sid].author}〈${AMBIENCE_SOURCES[sid].title}〉`).join('＋')
  lines.push(`| \`${id}.mp3\`（${sound.label}） | ${sound.duration} 秒 | ${kb(sound.file)} KB | ${cell(sources)} | ${cell(credit.edits)} | ${cell(credit.context || '—')} |`)
}
lines.push('', '## 原始錄音', '')
for (const [sid, s] of Object.entries(AMBIENCE_SOURCES)) {
  const used = Object.entries(AMBIENCE_CREDITS)
    .filter(([, c]) => c.sources.includes(sid))
    .map(([id]) => `\`${id}.mp3\``)
  lines.push(
    `### ${s.title}`,
    '',
    `- 作者：${s.author}`,
    `- 網址：${s.url}`,
    `- 授權：${s.licenseName}（${s.licenseUrl}）`,
    `- 原始檔名：${s.originalFile}`,
    `- 錄音：${s.recorded}`,
    `- 下載：${s.downloaded}`,
    `- 用在：${used.join('、')}`,
    '',
  )
}
// 開頭加 UTF-8 BOM：直接在瀏覽器打開時（伺服器回傳 text/markdown 不一定附 charset）也不會變成亂碼
writeFileSync(join(ROOT, 'public/audio/ambience/CREDITS.md'), '\ufeff' + lines.join('\n'))
console.log('寫入 public/audio/ambience/CREDITS.md')
