import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { SOURCES } from '../src/data/sources.js'
import { PIER, RIVER } from '../src/game/config.js'
import { QUALITY_MODES } from '../src/game/quality.js'
import { BANK, BRIDGE, GUANYIN_GAP, OPPOSITE_BANK, bankLightAmount, buildOppositeBank } from '../src/game/oppositeBank.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const built = Object.fromEntries(ERAS.map((era) => [era.id, buildOppositeBank(era.id)]))

/** 剪影在某個 z 範圍內最高的點（只看岸上，不含橋） */
function maxHeightIn(eraId, minZ, maxZ) {
  const { position } = built[eraId]
  let max = -Infinity
  for (let i = 0; i < position.length; i += 3) {
    const [x, y, z] = [position[i], position[i + 1], position[i + 2]]
    if (x <= BANK.edgeX && z >= minZ && z <= maxZ) max = Math.max(max, y - BANK.groundY)
  }
  return max
}

describe('隔岸天際線：只在精緻畫質', () => {
  test('畫質設定：流暢畫質沒有對岸（保留原本的遠景），精緻畫質有', () => {
    assert.equal(QUALITY_MODES.smooth.oppositeBank, false)
    assert.equal(QUALITY_MODES.fine.oppositeBank, true)
  })

  test('流暢畫質的街景批次不變：15／20／25／27／37（對岸不是街景的一部分）', () => {
    const expected = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }
    for (const era of ERAS) assert.equal(buildEraWorldSync(era.id).batches.length, expected[era.id], era.id)
  })

  test('觀音山的剪影只在精緻畫質往後推（等比例放大、從碼頭看大小不變），流暢畫質不動', () => {
    const src = readFileSync(join(ROOT, 'src/game/components/Mountains.jsx'), 'utf8')
    assert.match(src, /oppositeBank \? GUANYIN_PUSH : 1/)
  })
})

describe('隔岸天際線：每個年代的配置依史料', () => {
  test('五個年代都有：中英文說明、出處在 sources.js、標示情境重建', () => {
    for (const era of ERAS) {
      const layout = OPPOSITE_BANK[era.id]
      assert.ok(layout, era.id)
      assert.ok(layout.note.length > 20 && layout.noteEn.length > 20)
      assert.ok(layout.reconstructed.includes('情境重建') && layout.reconstructedEn.length > 20)
      assert.ok(layout.evidence.length >= 3, era.id)
      for (const id of layout.evidence) assert.ok(SOURCES[id]?.url?.startsWith('https://'), `${era.id}：${id}`)
    }
  })

  test('橋的演變：1889 木橋 → 1925 鋼桁架 → 1969 混凝土 → 1996 現橋', () => {
    assert.equal(OPPOSITE_BANK['qing-port'].bridge, 'wood-trestle')
    assert.equal(OPPOSITE_BANK.banquet.bridge, 'steel-truss')
    assert.equal(OPPOSITE_BANK.modern.bridge, 'steel-truss')
    assert.equal(OPPOSITE_BANK.postwar.bridge, 'concrete')
    assert.equal(OPPOSITE_BANK.revival.bridge, 'wide')
  })

  test('清末與日治是平坦的農田與竹圍農舍（沒有高樓、工廠與煙囪）；戰後有工廠與煙囪、沒有高樓；現代有高樓與堤防', () => {
    for (const id of ['qing-port', 'banquet', 'modern']) {
      const c = built[id].counts
      assert.ok(c.farms >= 10 && c.towers === 0 && c.factories === 0 && c.chimneys === 0, id)
      assert.ok(c.maxHeight <= 9, `${id} 最高 ${c.maxHeight}`)
    }
    assert.equal(built['qing-port'].counts.settlement, 0, '清末沒有橋頭聚落')
    assert.ok(built.banquet.counts.settlement > 0)
    const p = built.postwar.counts
    assert.ok(p.blocks > 50 && p.factories > 0 && p.chimneys > 0 && p.towers === 0)
    assert.ok(p.maxHeight < 15)
    const r = built.revival.counts
    assert.ok(r.towers > 20 && r.maxHeight > 30 && OPPOSITE_BANK.revival.floodwall)
    // 每個年代越來越高
    assert.ok(built['qing-port'].counts.maxHeight < p.maxHeight && p.maxHeight < r.maxHeight)
  })

  test('現代的大樓在觀音山主峰的方向留空隙，露出山脊', () => {
    assert.ok(maxHeightIn('revival', GUANYIN_GAP.minZ, GUANYIN_GAP.maxZ) <= GUANYIN_GAP.maxHeight)
    assert.ok(maxHeightIn('revival', -420, GUANYIN_GAP.minZ - 12) > 30, '空隙兩旁有高樓')
  })

  test('從碼頭看的仰角：對岸最高的東西都比觀音山主峰低（約 6.8°）', () => {
    for (const era of ERAS) {
      const { position } = built[era.id]
      let maxAngle = 0
      for (let i = 0; i < position.length; i += 3) {
        const [x, y, z] = [position[i], position[i + 1], position[i + 2]]
        if (x > BANK.edgeX) continue
        maxAngle = Math.max(maxAngle, Math.atan2(y - 3, Math.hypot(x + 48, z)))
      }
      assert.ok(maxAngle < (6.8 * Math.PI) / 180, `${era.id} ${(maxAngle * 180) / Math.PI}°`)
    }
  })
})

describe('隔岸天際線：幾何', () => {
  test('都在河的另一邊（不碰到碼頭、棧橋、船與街道）；橋在碼頭北邊，從這一岸的河面跨到對岸', () => {
    for (const era of ERAS) {
      const { position } = built[era.id]
      for (let i = 0; i < position.length; i += 3) {
        const [x, , z] = [position[i], position[i + 1], position[i + 2]]
        const onBridge = Math.abs(z - BRIDGE.z) <= 11
        assert.ok(x <= BANK.edgeX || (onBridge && x <= RIVER.edgeX), `${era.id} (${x}, ${z})`)
        if (onBridge) assert.ok(x <= PIER.minX + 3 && Math.abs(z) > 100)
      }
    }
    assert.ok(BANK.edgeX < -300 && BANK.edgeX > -400, '對岸在觀音山（410 公尺）之前')
  })

  test('結果固定、每個屬性長度對得上、頂點數在預算內（一次繪製）', () => {
    for (const era of ERAS) {
      const a = built[era.id]
      const b = buildOppositeBank(era.id)
      assert.deepEqual(a.position, b.position)
      const n = a.position.length / 3
      assert.equal(n % 3, 0)
      assert.equal(a.tint.length, n * 3)
      assert.equal(a.light.length, n)
      assert.ok(n < 40000, `${era.id} ${n} 個頂點`)
      for (const v of a.position) assert.ok(Number.isFinite(v))
    }
    assert.equal(buildOppositeBank('unknown'), null)
  })

  test('燈火：清末最少（油燈），現代最多；只在入夜（glow 高）時亮', () => {
    const lights = ERAS.map((era) => built[era.id].counts.lights)
    assert.ok(lights[0] < lights[1] && lights[3] < lights[4], lights.join('、'))
    assert.equal(bankLightAmount(0.08), 0)
    assert.equal(bankLightAmount(1), 1)
    assert.ok(bankLightAmount(0.62) > 0.3 && bankLightAmount(0.62) < 0.9)
  })

  test('研究文件存在、列出每個出處與情境重建', () => {
    const doc = join(ROOT, 'docs/research/opposite-bank.md')
    assert.ok(existsSync(doc))
    const text = readFileSync(doc, 'utf8')
    for (const layout of Object.values(OPPOSITE_BANK)) for (const id of layout.evidence) assert.ok(text.includes(id), id)
    assert.ok(text.includes('歷史情境重建'))
  })
})
