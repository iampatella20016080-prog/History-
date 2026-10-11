import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { getShop, getShopBuilding } from '../src/data/shops.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { SHOP_TYPES, displayShopfront } from '../src/game/builders/shopDisplays.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'

/**
 * 摩登大稻埕（1930–1945）精修：店種與櫥窗、Art Deco 立面、街道設施，以及其他年代不受影響。
 */
const layout = createEraLayout(getEra('modern'))
const generic = layout.buildings.filter((building) => !building.storeId)
const world = buildEraWorldSync('modern')

describe('店種與櫥窗', () => {
  test('店家聚焦在西餐廳、喫茶、洋服、藥局、茶行、布行，六種都有，招牌字相符', () => {
    const types = generic.map((building) => building.config.shopType).filter(Boolean)
    assert.ok(types.length >= generic.length - 1, '幾乎每家一般店都有店種')
    for (const type of types) assert.ok(SHOP_TYPES[type], type)
    assert.equal(new Set(types).size, 6)
    for (const building of generic) {
      const { shopType, sign } = building.config
      if (shopType && sign) assert.equal(sign.text, SHOP_TYPES[shopType].word, building.id)
    }
  })

  test('同一側相鄰的店不重複店種；閩南舊店屋只當茶行、布行或藥局', () => {
    const rows = new Map()
    for (const building of layout.buildings) rows.set(building.z.toFixed(1), [...(rows.get(building.z.toFixed(1)) ?? []), building])
    for (const row of rows.values()) {
      row.sort((a, b) => a.x - b.x)
      for (let i = 1; i < row.length; i++) {
        const a = row[i - 1].config.shopType
        const b = row[i].config.shopType
        if (a && b && !row[i].storeId && !row[i - 1].storeId) assert.notEqual(a, b, `${row[i - 1].id} 與 ${row[i].id}`)
      }
    }
    for (const building of generic.filter((item) => item.config.archetype === 'minnan')) {
      assert.ok(['tea', 'cloth', 'pharmacy'].includes(building.config.shopType), building.id)
    }
  })

  test('每種店的櫥窗內容都不同，而且不是整片發光玻璃', () => {
    const signatures = new Set()
    for (const type of Object.keys(SHOP_TYPES)) {
      const b = new PartBuilder()
      displayShopfront(b, { shopType: type, seed: 3 }, { innerW: 4.6, openingH: 3.05, style: 'deco', darkWood: '#5a3e2a' })
      let vertices = 0
      for (const list of b.groups.values()) for (const geometry of list) vertices += geometry.attributes.position.count
      signatures.add(vertices)
      // 發光玻璃只用在氣窗與門上的小窗（每片高度都低於 1.5 公尺）
      for (const geometry of b.groups.get('glassWarm') ?? []) {
        geometry.computeBoundingBox()
        const box = geometry.boundingBox
        assert.ok(box.max.y - box.min.y < 1.5, `${type}：發光玻璃高 ${(box.max.y - box.min.y).toFixed(2)} 公尺`)
      }
    }
    assert.equal(signatures.size, 6, '六種店的陳設都不一樣')
  })

  test('Art Deco 與舊洋樓的店面都換成依店種陳列的櫥窗；波麗路是西餐廳', () => {
    const arcade = generic.filter((building) => building.config.archetype !== 'minnan')
    const displays = arcade.filter((building) => building.config.shopfront === 'display')
    assert.ok(displays.length >= arcade.length * 0.7, `${displays.length}/${arcade.length}`)
    const bolero = getShopBuilding(getShop('bolero'), 'modern')
    assert.equal(bolero.shopfront, 'display')
    assert.equal(bolero.shopType, 'restaurant')
  })
})

describe('立面與街道', () => {
  test('Art Deco 立面有三種組合，並與舊式紅磚店屋、洋樓並存', () => {
    const deco = generic.filter((building) => building.config.archetype === 'deco')
    assert.ok(new Set(deco.map((building) => building.config.decoDetail)).size >= 2)
    const archetypes = new Set(generic.map((building) => building.config.archetype))
    for (const kind of ['deco', 'baroque', 'minnan']) assert.ok(archetypes.has(kind), kind)
  })

  test('街角的 Art Deco 樓有弧角；街底有圓鐘的視覺焦點', () => {
    const corners = layout.buildings.filter((building) => building.config.roundCorner)
    assert.ok(corners.length >= 2, `弧角 ${corners.length} 處`)
    assert.ok(layout.buildings.some((building) => building.config.focal), '街底焦點')
  })

  test('街道設施：招牌桿、報紙架、海報欄、兩輛早期汽車與盆栽，彼此不重疊', () => {
    const count = (type) => layout.props.filter((prop) => prop.type === type).length
    assert.ok(count('signPole') >= 3)
    assert.equal(count('newsStand'), 1)
    assert.equal(count('posterBoard'), 1)
    assert.equal(count('vintageCar'), 2)
    assert.ok(count('pottedPlant') >= 2)
    assert.ok(count('bicycle') >= 3)
    const o = layout.obstacles
    for (let i = 0; i < o.length; i++) {
      for (let j = i + 1; j < o.length; j++) {
        const overlap = o[i].minX < o[j].maxX && o[j].minX < o[i].maxX && o[i].minZ < o[j].maxZ && o[j].minZ < o[i].maxZ
        assert.ok(!overlap, `障礙物 ${i} 與 ${j} 重疊`)
      }
    }
  })

  test('招牌高低錯落：直立招牌的高度各不相同', () => {
    const lifts = generic.map((building) => building.config.hangingLift).filter((value) => value !== undefined)
    assert.ok(new Set(lifts.map((value) => value.toFixed(2))).size >= 6)
    const vertical = world.signs.filter((sign) => sign.vertical)
    const heights = new Set(vertical.map((sign) => sign.position[1].toFixed(1)))
    assert.ok(heights.size >= 6, `直式招牌高度 ${heights.size} 種`)
  })
})

describe('其他四個年代不受影響', () => {
  for (const era of ERAS.filter((item) => item.id !== 'modern')) {
    test(era.title, () => {
      const other = createEraLayout(era)
      for (const building of other.buildings) {
        for (const key of ['shopType', 'shopfront', 'decoDetail', 'roundCorner', 'focal', 'hangingLift', 'arcadeBench']) {
          assert.equal(building.config[key], undefined, `${building.id}.${key}`)
        }
      }
      for (const type of ['signPole', 'newsStand', 'posterBoard']) assert.ok(!other.props.some((prop) => prop.type === type), type)
    })
  }
})
