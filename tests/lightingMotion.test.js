/**
 * 第 9 階段：酒樓繁華與摩登的光線、畫面動態
 *
 * - 光線：其他三個年代（港口商街、庶民生活、老屋新生）的光線設定一個數字都不變；
 *   酒樓繁華與摩登的陰影偏冷、燈火偏暖、不再整片偏紅，材質明度差拉開。
 * - 動態：風、燈籠單擺、落葉、煙、河面與倒影都是純資料或著色器；兩種畫質都有，流暢模式減量。
 * - 預算：新動態增加的繪製呼叫有上限；街景批次數不變。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import {
  lanternSwing,
  leafCycle,
  leafSeeds,
  MOTION_DRAW_BUDGET,
  MOTION_SETTINGS,
  motionDrawCalls,
  motionSettings,
  windDirection,
  windStrength,
} from '../src/game/motion.js'
import { gradeValues, materialValues, MATERIAL_VALUE_KEYS } from '../src/game/atmosphere.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

const DAYLIGHT = JSON.parse(readFileSync(new URL('./fixtures/daylightLighting.json', import.meta.url), 'utf8'))

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255)
}
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
/** 藍減紅：正值偏冷 */
const coolness = (hex) => {
  const [r, , b] = hexToRgb(hex)
  return b - r
}

describe('光線：其他年代不變', () => {
  for (const id of ['qing-port', 'postwar', 'revival']) {
    test(`${id} 的光線設定和修改前完全相同`, () => {
      assert.deepEqual(getEra(id).lighting, DAYLIGHT[id])
    })
    test(`${id} 沒有分離色調與材質明度設定（調色結果和修改前相同）`, () => {
      const grade = gradeValues(getEra(id).lighting)
      assert.deepEqual(grade.shadowTint, [1, 1, 1])
      assert.deepEqual(grade.highlightTint, [1, 1, 1])
      for (const key of MATERIAL_VALUE_KEYS) assert.equal(materialValues(getEra(id).lighting)[key], 1)
    })
  }
})

describe('光線：酒樓繁華與摩登', () => {
  for (const id of ['banquet', 'modern']) {
    const l = getEra(id).lighting
    test(`${id}：保留原本的時刻與太陽仰角`, () => {
      assert.equal(l.timeOfDay, id === 'banquet' ? '傍晚入夜' : '黃昏')
      assert.equal(l.sun.elevation, id === 'banquet' ? 6 : 14)
    })
    test(`${id}：陰影偏冷（補光、半球天空光、陰影色調偏藍），燈火與陽光偏暖`, () => {
      assert.ok(l.fill && coolness(l.fill.color) > 0.1, '冷色補光')
      assert.ok(coolness(l.hemi.sky) > 0, '半球天空光偏藍')
      const grade = gradeValues(l)
      assert.ok(grade.shadowTint[2] > grade.shadowTint[0], '暗部往藍偏')
      assert.ok(grade.highlightTint[0] > grade.highlightTint[2], '亮部往暖偏')
      assert.ok(coolness(l.sun.color) < -0.2, '陽光偏暖')
    })
    test(`${id}：不再整片偏紅（調色的紅色倍率不高於綠色太多，地面反光不帶紅）`, () => {
      const [r, g] = l.grade.tint
      assert.ok(r - g <= 0.02, `tint ${l.grade.tint}`)
      const [gr, gg, gb] = hexToRgb(l.hemi.ground)
      assert.ok(gr - (gg + gb) / 2 < 0.06, `hemi.ground ${l.hemi.ground}`)
    })
    test(`${id}：屋瓦、木作偏暗，灰泥、洗石子偏亮（明度差拉開）`, () => {
      const v = materialValues(l)
      assert.ok(v.plaster > 1 && v.stucco > 1)
      assert.ok(v.roof < 1 && v.wood < 1)
      assert.ok(v.plaster / v.roof > 1.2)
    })
    test(`${id}：半球光不再壓過直射光（明暗面看得出來）`, () => {
      assert.ok(l.hemi.intensity < (id === 'banquet' ? 2.3 : 1.8))
    })
  }
  test('酒樓繁華仍然比摩登暗、燈火比摩登亮', () => {
    const b = getEra('banquet').lighting
    const m = getEra('modern').lighting
    assert.ok(b.sun.intensity < m.sun.intensity)
    assert.ok(b.glow > m.glow)
    assert.ok(luma(hexToRgb(b.sky.top)) < luma(hexToRgb(m.sky.top)))
  })
})

describe('風與燈籠擺動', () => {
  test('風力在 0.25–1 之間，會起伏（不是常數）', () => {
    let min = 1
    let max = 0
    for (let t = 0; t < 120; t += 0.25) {
      const w = windStrength(t)
      assert.ok(w >= 0.25 && w <= 1)
      min = Math.min(min, w)
      max = Math.max(max, w)
    }
    assert.ok(max - min > 0.3, `${min}–${max}`)
  })
  test('風向是水平單位向量', () => {
    for (let t = 0; t < 200; t += 7) {
      const [x, z] = windDirection(t)
      assert.ok(Math.abs(Math.hypot(x, z) - 1) < 1e-9)
    }
  })
  test('燈籠擺角很小（最多約 8°）、會隨時間變化，相鄰燈籠不同步', () => {
    let peak = 0
    for (let t = 0; t < 60; t += 0.1) {
      for (let i = 0; i < 5; i++) {
        const [ax, az] = lanternSwing(t, i)
        peak = Math.max(peak, Math.abs(ax), Math.abs(az))
      }
    }
    assert.ok(peak > 0.02 && peak < 0.14, `peak ${peak}`)
    const a = lanternSwing(3, 0)
    const b = lanternSwing(3, 1)
    assert.notDeepEqual(a, b)
  })
  test('大燈籠擺得比較慢（單擺）', () => {
    const crossings = (scale) => {
      let n = 0
      let prev = lanternSwing(0, 0, scale, 0.5)[1]
      for (let t = 0.02; t < 30; t += 0.02) {
        const next = lanternSwing(t, 0, scale, 0.5)[1]
        if (Math.sign(next) !== Math.sign(prev)) n++
        prev = next
      }
      return n
    }
    assert.ok(crossings(2) < crossings(0.8))
  })
})

describe('落葉', () => {
  const trees = [
    { position: [0, 0, 0], top: 3, radius: 2.5, ground: 0 },
    { position: [10, 0, 0], top: 3.4, radius: 2, ground: 0.4 },
  ]
  test('每棵樹的落葉在樹冠範圍內、從樹冠下緣開始，結果是決定性的', () => {
    const leaves = leafSeeds(trees, 12)
    assert.equal(leaves.length, 24)
    for (const [i, leaf] of leaves.entries()) {
      const tree = trees[Math.floor(i / 12)]
      assert.ok(Math.hypot(leaf.start[0] - tree.position[0], leaf.start[2] - tree.position[2]) <= tree.radius + 1e-9)
      assert.ok(leaf.start[1] <= tree.top && leaf.start[1] >= tree.top - 0.8)
    }
    assert.deepEqual(leafSeeds(trees, 12), leaves)
  })
  test('落下的週期隨高度變長', () => {
    assert.ok(leafCycle(5) > leafCycle(2))
  })
})

describe('兩種畫質都有動態，流暢模式減量', () => {
  test('流暢模式的落葉、煙團、波紋都少於或等於精緻模式，但都不是 0', () => {
    const s = MOTION_SETTINGS.smooth
    const f = MOTION_SETTINGS.fine
    for (const key of ['leavesPerTree', 'rippleOctaves', 'smokePuffs', 'awningSway']) {
      assert.ok(s[key] > 0, `smooth ${key}`)
      assert.ok(s[key] <= f[key], key)
    }
    assert.ok(s.leavesPerTree < f.leavesPerTree)
    assert.equal(motionSettings('unknown'), f)
  })
  test('新動態的繪製呼叫：落葉一次、每艘船的倒影一次，河面與煙不另外增加', () => {
    assert.equal(MOTION_DRAW_BUDGET.smoke, 0)
    assert.equal(motionDrawCalls({ boats: 4, leafTrees: 3 }), 5)
    assert.equal(motionDrawCalls({ boats: 20, leafTrees: 1 }), 1 + MOTION_DRAW_BUDGET.maxBoats)
    assert.equal(motionDrawCalls({}), 0)
  })
})

describe('各年代的街景：動態資料與預算', () => {
  for (const era of ERAS) {
    test(`${era.id}：榕樹登記落葉、爐灶登記煙；街景批次仍在預算內`, () => {
      const world = buildEraWorldSync(era.id)
      assert.ok(Array.isArray(world.leafTrees))
      for (const tree of world.leafTrees) {
        assert.ok(tree.top > tree.ground + 1.5, '樹冠下緣高於地面')
        assert.ok(tree.radius > 1 && tree.radius < 5)
      }
      assert.ok(world.leafTrees.length > 0, '每個年代至少有河岸廣場的榕樹')
      // 新動態只用額外的網格（落葉、倒影），不改變依材質合併的批次數
      assert.ok(world.batches.length <= 40, `${era.id} 街景批次 ${world.batches.length}`)
      const smoke = world.steam.filter((s) => s.kind === 'smoke')
      for (const s of smoke) assert.ok(s.strength > 0)
      const boats = era.streetProps.boats === 'qingWharf' ? 6 : 4
      assert.ok(motionDrawCalls({ boats, leafTrees: world.leafTrees.length }) <= 7)
    })
  }
  test('有爐灶的年代（庶民生活的小吃攤）有煙', () => {
    const world = buildEraWorldSync('postwar')
    assert.ok(world.steam.some((s) => s.kind === 'smoke'))
  })
})
