import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { FrameWindow, formatResolution, formatStats, parseStatsParam } from '../src/stats/statsMath.js'

describe('效能量測：網址參數', () => {
  test('?stats=1 開啟，其他情況關閉', () => {
    assert.equal(parseStatsParam('?stats=1'), true)
    assert.equal(parseStatsParam('?quality=fine&stats=1&adaptive=0'), true)
    assert.equal(parseStatsParam('?stats=0'), false)
    assert.equal(parseStatsParam('?quality=fine'), false)
    assert.equal(parseStatsParam(''), false)
    assert.equal(parseStatsParam(undefined), false)
  })
})

describe('效能量測：滑動統計', () => {
  test('固定 60fps 的平均與最低', () => {
    const w = new FrameWindow(2)
    for (let i = 0; i < 300; i++) w.push(1 / 60)
    const s = w.summary()
    assert.ok(Math.abs(s.avg - 60) < 0.5)
    assert.ok(Math.abs(s.min - 60) < 0.5)
    assert.ok(s.frames <= 125 && s.frames >= 115)
  })

  test('卡頓的一格會拉低最低幀率，舊資料滑出視窗後恢復', () => {
    const w = new FrameWindow(2)
    for (let i = 0; i < 60; i++) w.push(1 / 60)
    w.push(0.1)
    assert.ok(Math.abs(w.summary().min - 10) < 0.01)
    for (let i = 0; i < 200; i++) w.push(1 / 60)
    assert.ok(w.summary().min > 55)
  })

  test('忽略無效的影格時間；空視窗回傳 0', () => {
    const w = new FrameWindow()
    assert.deepEqual(w.summary(), { avg: 0, min: 0, frames: 0 })
    w.push(0)
    w.push(-1)
    w.push(NaN)
    assert.equal(w.summary().frames, 0)
    w.push(0.5)
    w.reset()
    assert.equal(w.summary().frames, 0)
  })
})

describe('效能量測：格式化', () => {
  test('解析度', () => {
    assert.equal(formatResolution(2048.2, 1536, 1.25), '2048×1536 @1.25x')
  })

  test('浮層文字與自動降解析度判斷', () => {
    const base = { fps: { avg: 59.6, min: 41 }, calls: 372, triangles: 182345, width: 1000, height: 800, dpr: 1.25, dprMax: 1.25, quality: 'smooth' }
    const text = formatStats(base).join('\n')
    assert.match(text, /FPS 60（最低 41）/)
    assert.match(text, /繪製呼叫 372/)
    assert.match(text, /三角形 182\.3k/)
    assert.match(text, /1000×800 @1\.25x/)
    assert.match(text, /畫質 smooth/)
    assert.match(text, /自動降解析度 否/)
    assert.match(formatStats({ ...base, dpr: 0.95 }).join('\n'), /自動降解析度 是（上限 1\.25）/)
  })
})
