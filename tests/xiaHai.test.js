import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 霞海城隍廟：同安人信仰中心的文化據點，只在「港口商街」出現；其他年代這塊地段維持原樣
 * （酒樓繁華起 north-6 是乾元藥行、store-bolero 照常，老屋新生的 north-6 是永樂米苔目）。
 */
const SHOP_ID = 'xia-hai-cheng-huang'
const shop = getShop(SHOP_ID)
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

function chapterText(chapter) {
  return [chapter.lead, chapter.intro, ...(chapter.paragraphs ?? [])].filter(Boolean).join('')
}

function allText() {
  return (
    shop.chapters.map(chapterText).join('') +
    shop.chapters.flatMap((c) => [...(c.timeline ?? []), ...(c.facts ?? [])].map((i) => i.text ?? i.value)).join('') +
    shop.summary +
    shop.note +
    shop.eraNotes['qing-port']
  )
}

describe('霞海城隍廟：店家資料', () => {
  test('文化據點，只出現在「港口商街」，沒有食物圖鑑', () => {
    assert.equal(shop.kind, 'heritage')
    assert.equal(shop.status, 'open')
    assert.deepEqual(Object.keys(shop.buildingByEra), ['qing-port'])
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(SHOP_ID), era.id === 'qing-port', era.id)
    }
    assert.ok(!shop.chapters.some((chapter) => chapter.type === 'foods'))
  })

  test('四個章節都是文字與文獻；每一章都有存在的出處，文獻章列出所有引用', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => chapter.type),
      ['text', 'text', 'text', 'sources'],
    )
    for (const chapter of shop.chapters) {
      assert.ok(chapter.sourceIds?.length, chapter.tab)
      for (const id of chapter.sourceIds) {
        const source = getSource(id)
        assert.ok(source, `${chapter.tab} 引用的 ${id} 不存在`)
        assert.match(source.url, /^https?:\/\//, id)
      }
    }
    const cited = new Set(shop.chapters.slice(0, -1).flatMap((chapter) => chapter.sourceIds))
    const listed = new Set(shop.chapters.at(-1).sourceIds)
    for (const id of cited) assert.ok(listed.has(id), `文獻章漏列 ${id}`)
  })

  test('禁寫內容：供品與廟口飲食的內容一律不寫；坪數兩說矛盾不寫', () => {
    const text = allText()
    // 「查無出處、不寫」的聲明可以提到「供品」「牲禮」，但不能描述具體內容
    for (const banned of ['喜糖', '鉛錢', '紅絲線', '蛋糕', '廟口小吃', '甜食', '巧克力', '大福']) {
      assert.doesNotMatch(text, new RegExp(banned), banned)
    }
    for (const m of text.matchAll(/供品|牲禮/g)) {
      const around = text.slice(Math.max(0, m.index - 30), m.index + 40)
      assert.match(around, /查無|不寫/, `提到「${m[0]}」卻沒有標示查無／不寫：${around}`)
    }
    assert.doesNotMatch(text, /\d+\s*坪/)
  })

  test('年份異說並列、單一來源標示；聖誕日依官方登錄；古蹟級別標待核', () => {
    assert.match(shop.yearNote, /1821/)
    assert.match(shop.yearNote, /1856/)
    const text = allText()
    assert.match(text, /一說/)
    assert.match(text, /單一來源/)
    assert.match(text, /五月十三/)
    assert.doesNotMatch(text, /五月十四/)
    assert.match(text, /待核/)
    assert.match(text, /1971/)
    // 捏造的統計不寫
    assert.doesNotMatch(text, /六萬對/)
    // 情境示意
    assert.match(shop.note, /情境示意/)
    assert.match(shop.eraNotes['qing-port'], /情境示意/)
    // 門牌在店家資料裡（對照地圖的 precision 'address' 依此）
    assert.match(shop.address, /迪化街一段61號/)
  })
})

describe('霞海城隍廟：地段與街景', () => {
  test('不改變五個年代共用的地段切分：只在港口商街取代 north-6 與波麗路地段，沒有新的店面地段', () => {
    const lots = getLotPlan().lots
    assert.ok(!lots.some((item) => item.storeId === SHOP_ID))
    assert.deepEqual(shop.site.replaces, ['north-6', 'store-bolero'])
    assert.ok(lots.some((item) => item.id === 'north-6'))
    assert.ok(lots.some((item) => item.id === 'store-bolero'))
    // 地段編號不變（南側從 south-13 開始）
    assert.ok(lots.some((item) => item.id === 'south-13'))
    assert.ok(!lots.some((item) => item.id === 'south-19'))
  })

  test('只有「港口商街」有城隍廟；酒樓繁華起 north-6 是乾元藥行、波麗路地段照常', () => {
    for (const era of ERAS) {
      const building = worlds[era.id].buildings.find((item) => item.storeId === SHOP_ID)
      assert.equal(!!building, era.id === 'qing-port', era.id)
    }
    // 酒樓繁華：乾元藥行在 north-6，波麗路的地段是一般街屋（摩登起才是波麗路）
    assert.ok(worlds.banquet.buildings.find((item) => item.storeId === 'qian-yuan-yao-hang'))
    assert.ok(worlds.modern.buildings.find((item) => item.storeId === 'bolero'))
    // 老屋新生的 north-6 是永樂米苔目
    assert.ok(worlds.revival.buildings.find((item) => item.storeId === 'yong-le-mi-tai-mu'))
  })

  test('廟不和鄰近的建築重疊（左右是一般街屋與有記的地段）', () => {
    const world = worlds['qing-port']
    const self = world.buildings.find((item) => item.storeId === SHOP_ID)
    const halfW = shop.building.width / 2
    for (const other of world.buildings) {
      if (other === self) continue
      if (!Number.isFinite(other.x) || !Number.isFinite(other.config?.width)) continue
      if (Math.abs(other.z - self.z) > 6) continue
      const otherHalf = other.config.width / 2
      const gap = Math.abs(other.x - self.x) - halfW - otherHalf
      assert.ok(gap > -0.05, `與 ${other.storeId ?? other.id}（x=${other.x}）重疊：間距 ${gap.toFixed(2)}`)
    }
  })
})

describe('霞海城隍廟：碰撞、互動與鏡頭', () => {
  const placement = getShopPlacement(shop)
  const world = worlds['qing-port']

  test('廟埕走得進去也走得出來：多種步長、連續進出多次', () => {
    const cx = shop.site.x
    for (const step of [0.12, 0.21, 0.45]) {
      for (let round = 0; round < 3; round++) {
        // 從街道走進廟埕
        const p = { x: cx, z: 0 }
        for (let i = 0; i < 80 && p.z > -8.6; i++) {
          p.z -= step
          resolvePlayerPosition(p, PLAYER.radius, world.collision)
        }
        assert.ok(p.z < -5.5, `步長 ${step}：走不進廟埕（z=${p.z.toFixed(2)}）`)
        // 再走出來
        for (let i = 0; i < 120 && p.z < 0; i++) {
          p.z += step
          resolvePlayerPosition(p, PLAYER.radius, world.collision)
        }
        assert.ok(p.z > -3.5, `步長 ${step}：走不出廟埕（z=${p.z.toFixed(2)}）`)
      }
    }
  })

  test('廟埕裡天公爐是障礙物；正殿走不進去', () => {
    const cx = shop.site.x
    // 天公爐（本地 z 約 -courtD+1.7 = -4.5；世界 z 約 -9）
    assert.ok(!walkableAt(world, cx, -9.0), '天公爐應該是障礙物')
    // 正殿（本地 z < -courtD；世界 z < -10.7）
    assert.ok(!walkableAt(world, cx, -12), '正殿應該走不進去')
    // 廟埕兩側走得到（避開榕樹石座與天公爐）
    assert.ok(walkableAt(world, cx - 2.2, -8.8))
    assert.ok(walkableAt(world, cx + 2.2, -8.8))
  })

  test('互動位置在廟前走得到，左右各一步也走得到', () => {
    const point = placement.interactionPoint
    assert.ok(walkableAt(world, point.x, point.z))
    for (const side of [-0.6, 0.6]) {
      const p = point.clone().addScaledVector(placement.right, side)
      assert.ok(walkableAt(world, p.x, p.z), `旁 ${side} m`)
    }
  })

  test('介紹鏡頭不在任何方塊裡，視線沒有被擋住', () => {
    const cam = placement.camera.position
    const target = placement.camera.target
    for (const box of world.collision.obstacles) assert.ok(!insideBox(cam, box, 0.2))
    assert.ok(walkableAt(world, cam.x, cam.z))
    for (let t = 0.1; t < 0.75; t += 0.1) {
      const p = cam.clone().lerp(target, t)
      for (const box of world.collision.obstacles) assert.ok(!insideBox(p, box), `視線在 ${t} 被擋住`)
    }
  })
})
