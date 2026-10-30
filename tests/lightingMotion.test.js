/**
 * 第 9 階段：酒樓繁華與摩登的光線、畫面動態
 *
 * - 光線：其他三個年代（港口商街、庶民生活、老屋新生）的光線設定一個數字都不變；
 *   酒樓繁華與摩登的陰影偏冷、燈火偏暖、不再整片偏紅，材質明度差拉開。
 * - 動態：風、燈籠單擺、落葉、煙、河面與倒影都是純資料或著色器；只在精緻畫質啟用
 *   （使用者 2026-10-30 決定：細節美觀類效果只給電腦版），流暢畫質回到第 9 階段之前的畫面。
 * - 預算：新動態在精緻畫質增加的繪製呼叫有上限；流暢畫質不增加，街景批次與蒸氣來源和 #53 之前完全相同。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import {
  lanternSway,
  lanternSwing,
  leafCycle,
  leafSeeds,
  MOTION_DRAW_BUDGET,
  MOTION_SETTINGS,
  motionDrawCalls,
  motionEnabled,
  motionSettings,
  windDirection,
  windStrength,
} from '../src/game/motion.js'
import { gradeValues, materialValues, MATERIAL_VALUE_KEYS } from '../src/game/atmosphere.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

const DAYLIGHT = JSON.parse(readFileSync(new URL('./fixtures/daylightLighting.json', import.meta.url), 'utf8'))
/** #53 合併前（89c4aa0^1）各年代的批次數與蒸氣來源（tests/fixtures/preMotionWorld.json） */
const PRE_MOTION = JSON.parse(readFileSync(new URL('./fixtures/preMotionWorld.json', import.meta.url), 'utf8'))
const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')

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
      // air 是精緻畫質後製的空氣遠近感參數（tests/aerial.test.js），不影響既有的光線設定
      const { air, ...lighting } = getEra(id).lighting
      assert.deepEqual(lighting, DAYLIGHT[id])
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

describe('畫面動態只在精緻畫質', () => {
  test('精緻畫質有全部的動態；流暢畫質全部關閉（落葉、波紋、倒影、煙、遮雨棚都是 0）', () => {
    const s = MOTION_SETTINGS.smooth
    const f = MOTION_SETTINGS.fine
    assert.equal(motionEnabled('fine'), true)
    assert.equal(motionEnabled('smooth'), false)
    for (const key of ['leavesPerTree', 'rippleOctaves', 'smokePuffs', 'awningSway']) {
      assert.equal(s[key], 0, `smooth ${key}`)
      assert.ok(f[key] > 0, `fine ${key}`)
    }
    assert.equal(s.reflections, 'none')
    assert.equal(f.reflections, 'all')
    assert.equal(motionSettings('unknown'), f)
  })
  test('新動態的繪製呼叫：精緻畫質落葉一次、每艘船的倒影一次，河面與煙不另外增加；流暢畫質 0', () => {
    assert.equal(MOTION_DRAW_BUDGET.smoke, 0)
    assert.equal(motionDrawCalls({ boats: 4, leafTrees: 3 }), 5)
    assert.equal(motionDrawCalls({ boats: 20, leafTrees: 1 }), 1 + MOTION_DRAW_BUDGET.maxBoats)
    assert.equal(motionDrawCalls({}), 0)
    assert.equal(motionDrawCalls({ boats: 6, leafTrees: 3 }, 'smooth'), 0)
  })
  test('流暢畫質的燈籠是 #53 之前固定頻率的輕擺（不跟著風）', () => {
    for (const [t, i] of [
      [0, 0],
      [3.7, 2],
      [41.2, 9],
    ]) {
      assert.deepEqual(lanternSway(t, i), [Math.sin(t * 0.9 + i * 1.3) * 0.035, Math.sin(t * 1.3 + i * 1.7) * 0.06])
    }
  })
  test('元件依畫質開關：落葉與倒影只在精緻畫質建立，河面在流暢畫質用靜態材質', () => {
    assert.match(source('game/components/EraScene.jsx'), /\{motion && <LeafLayer /)
    const river = source('game/components/River.jsx')
    assert.match(river, /reflection=\{motion\}/)
    assert.match(river, /motion \? materials\.rippled : materials\.still/)
    assert.match(source('game/components/LanternLayer.jsx'), /lanternSway\(t, i\)/)
  })
  test('布幡、遮雨棚與煙讀 uMotion（流暢畫質為 0：布幡固定幅度、遮雨棚不動、煙畫成蒸氣）', () => {
    assert.match(source('game/components/SignLayer.jsx'), /mix\(1\.0, 0\.6 \+ uWind \* 0\.9, uMotion\)/)
    assert.match(source('game/rendering/materials.js'), /\(0\.4 \+ uWind\) \* uMotion/)
    const steam = source('game/components/SteamLayer.jsx')
    assert.match(steam, /step\(0\.5, aKind\) \* uMotion/)
    assert.match(steam, /uMotion < 0\.5 && aKind > 1\.5/)
    assert.match(source('game/rendering/wind.js'), /uMotion\.value = enabled \? 1 : 0/)
  })
})

describe('流暢畫質和 #53 之前相同', () => {
  for (const era of ERAS) {
    test(`${era.id}：街景批次、遠景批次、招牌、布幡、燈籠數不變`, () => {
      const world = buildEraWorldSync(era.id)
      const pre = PRE_MOTION[era.id]
      assert.equal(world.batches.length, pre.batches)
      assert.equal((world.detailBatches ?? []).length, pre.detailBatches)
      assert.equal(world.signs.length, pre.signs)
      assert.equal(world.banners.length, pre.banners)
      assert.equal(world.lanterns.length, pre.lanterns)
    })
    test(`${era.id}：流暢畫質畫出的蒸氣來源（蒸氣＋畫成蒸氣的香爐）和 #53 之前完全相同`, () => {
      const world = buildEraWorldSync(era.id)
      const visible = world.steam
        .filter((s) => s.kind !== 'smoke' || s.smoothAsSteam)
        .map((s) => [...s.position.map((v) => +v.toFixed(4)), s.strength])
      assert.deepEqual(visible, PRE_MOTION[era.id].steam)
    })
  }
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
