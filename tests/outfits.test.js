import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Box3 } from 'three'
import { ERAS } from '../src/data/eras.js'
import { LEG_LENGTH, RIG, SLOTS } from '../src/game/character/outfitBuilder.js'
import { OUTFIT_IDS, getOutfit, getOutfitPalette } from '../src/game/character/outfits.js'

/**
 * 主角的五套年代服裝：每個年代都有對應的服裝、各自必備的衣物與配件、
 * 不混入其他年代的配件、鞋底貼地、長衫是連續的輪廓、材質都有設定，以及合併後的網格數量。
 */
function bounds(outfit, slot) {
  const box = new Box3()
  for (const part of outfit.slots[slot]) {
    part.geometry.computeBoundingBox()
    box.union(part.geometry.boundingBox)
  }
  return box
}

const REQUIRED = {
  'qing-port': ['conicalHat', 'jacket', 'innerShirt', 'sash', 'trousers', 'strawSandals', 'bag', 'bagStrap'],
  banquet: ['skullCap', 'robe', 'robeSkirt', 'magua', 'clothShoes', 'waistPouch'],
  modern: ['newsboyCap', 'shirt', 'vest', 'tie', 'trousers', 'leatherShoes', 'briefcase'],
  postwar: ['shortSleeveShirt', 'trousers', 'clothShoes', 'towel', 'clothBag'],
  revival: ['openShirt', 'tShirt', 'trousers', 'sneakers', 'toteBag', 'camera'],
}

const HATS = ['conicalHat', 'skullCap', 'newsboyCap']

describe('五個年代都有對應的服裝', () => {
  test('年代 id 與服裝一一對應', () => {
    assert.deepEqual(new Set(OUTFIT_IDS), new Set(ERAS.map((era) => era.id)))
    for (const era of ERAS) assert.equal(getOutfit(era.id).id, era.id)
  })

  for (const [id, tags] of Object.entries(REQUIRED)) {
    test(`${id}：必備的衣物與配件`, () => {
      const outfit = getOutfit(id)
      for (const tag of tags) assert.ok(outfit.tags.includes(tag), `${id} 缺少 ${tag}`)
    })
  }

  test('不混入其他年代的配件：每套最多一頂帽子，1945 之後不戴帽，庶民與老屋新生沒有背心、領帶、長衫', () => {
    for (const id of OUTFIT_IDS) {
      const hats = getOutfit(id).tags.filter((tag) => HATS.includes(tag))
      assert.ok(hats.length <= 1, `${id}：${hats.join('、')}`)
    }
    for (const id of ['postwar', 'revival']) {
      const tags = getOutfit(id).tags
      for (const tag of [...HATS, 'vest', 'tie', 'robe', 'robeSkirt', 'magua', 'briefcase', 'conicalHat']) assert.ok(!tags.includes(tag), `${id} 不應有 ${tag}`)
    }
    assert.ok(!getOutfit('revival').tags.includes('towel'))
    assert.ok(!getOutfit('postwar').tags.includes('camera'))
    // 只有酒樓年代有長衫下襬；只有摩登年代手上提東西
    for (const id of OUTFIT_IDS) {
      assert.equal(getOutfit(id).slots.skirtFront.length > 0, id === 'banquet', `${id} 下襬`)
      assert.equal(getOutfit(id).slots.handRight.length > 0, id === 'modern', `${id} 手上的東西`)
    }
  })

  test('每個零件的材質都有設定', () => {
    for (const id of OUTFIT_IDS) {
      const palette = getOutfitPalette(id)
      for (const slot of SLOTS) {
        for (const part of getOutfit(id).slots[slot]) assert.ok(palette[part.material]?.color, `${id}.${slot}：${part.material}`)
      }
    }
  })
})

describe('與骨架的配合', () => {
  test('五套共用同一張臉、髮型與身形：頭與手的零件相同', () => {
    const shape = (id) =>
      getOutfit(id)
        .slots.head.filter((part) => ['skin', 'hair', 'eye'].includes(part.material))
        .map((part) => `${part.material}:${part.geometry.attributes.position.count}`)
        .sort()
        .join()
    for (const id of OUTFIT_IDS.slice(1)) assert.equal(shape(id), shape(OUTFIT_IDS[0]), id)
  })

  test('鞋底貼地：站立時鞋底在地面（髖部 0.86 m 往下 0.86 m），也不會低於地面', () => {
    assert.ok(Math.abs(RIG.hipY - LEG_LENGTH) < 1e-9)
    for (const id of OUTFIT_IDS) {
      for (const slot of ['footRight', 'footLeft']) {
        const box = bounds(getOutfit(id), slot)
        const bottom = RIG.hipY + RIG.ankleY + box.min.y
        assert.ok(Math.abs(bottom) < 0.006, `${id}.${slot}：鞋底在 ${bottom.toFixed(3)} m`)
      }
    }
  })

  test('長衫是連續的輪廓：從腰到腳踝，下襬寬度足以讓腳在裡面走動', () => {
    const outfit = getOutfit('banquet')
    for (const slot of ['skirtFront', 'skirtBack']) {
      const box = bounds(outfit, slot)
      assert.ok(box.max.y >= 0, `${slot} 從腰開始`)
      const hem = RIG.hipY + box.min.y
      assert.ok(hem > 0.06 && hem < 0.16, `${slot} 下襬離地 ${hem.toFixed(2)} m`)
    }
    // 上半身的長衫往下接到腰部以下（與下襬重疊，沒有斷開）
    const torso = bounds(outfit, 'torso')
    assert.ok(torso.min.y < -0.3, `上半身長衫到 ${torso.min.y.toFixed(2)}`)
    assert.ok(torso.max.y > 0.65)
  })

  test('帽子在頭頂上方（不會嵌進臉）', () => {
    for (const id of ['qing-port', 'banquet', 'modern']) {
      const head = bounds(getOutfit(id), 'head')
      assert.ok(head.max.y > 0.35, `${id}：帽頂 ${head.max.y.toFixed(2)}`)
    }
    for (const id of ['postwar', 'revival']) {
      const head = bounds(getOutfit(id), 'head')
      assert.ok(head.max.y < 0.35, `${id} 沒有帽子`)
    }
  })

  test('合併後的網格數量與頂點數（iPad 效能）', () => {
    for (const id of OUTFIT_IDS) {
      const outfit = getOutfit(id)
      const meshes = SLOTS.reduce((sum, slot) => sum + outfit.slots[slot].length, 0)
      const vertices = SLOTS.reduce((sum, slot) => sum + outfit.slots[slot].reduce((n, part) => n + part.geometry.attributes.position.count, 0), 0)
      assert.ok(meshes <= 40, `${id}：${meshes} 個網格`)
      assert.ok(vertices <= 20000, `${id}：${vertices} 個頂點`)
    }
  })

  test('服裝只產生一次並快取（切換年代不重建幾何）', () => {
    for (const id of OUTFIT_IDS) assert.equal(getOutfit(id), getOutfit(id))
    assert.equal(getOutfit('no-such-era').id, OUTFIT_IDS[0])
  })
})
