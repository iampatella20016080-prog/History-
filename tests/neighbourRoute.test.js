import test from 'node:test'
import assert from 'node:assert/strict'
import { NEIGHBOUR_FIGURES, NEIGHBOUR_OBJECTS, NEIGHBOUR_ROUTE, NEIGHBOUR_TALK } from '../src/data/routes/neighbourRoute.js'
import { getEra } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getShopPlacement } from '../src/game/world/placement.js'

const linesOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]

test('街坊故事：對白全部是虛構對白，器物的說明都有出處', () => {
  for (const talk of NEIGHBOUR_TALK) for (const line of linesOf(talk)) assert.equal(line.label, 'fiction', `${talk.id}：${line.text}`)
  for (const object of Object.values(NEIGHBOUR_OBJECTS)) {
    assert.ok(object.sourceIds.length >= 1, object.id)
    assert.equal(object.reconstruction, true, object.id)
    assert.match(object.paragraphs.join(''), /虛構/, `${object.id}：要寫明故事是虛構的`)
  }
  assert.match(NEIGHBOUR_ROUTE.intro, /虛構對白/)
})

test('街坊故事：一天的四個時段，順序自由；都在酒樓繁華', () => {
  assert.deepEqual(NEIGHBOUR_ROUTE.nodes.map((node) => node.id), ['morning', 'noon', 'afternoon', 'dusk'])
  assert.equal(NEIGHBOUR_ROUTE.eraId, 'banquet')
  for (const node of NEIGHBOUR_ROUTE.nodes) assert.equal(node.eraId ?? NEIGHBOUR_ROUTE.eraId, 'banquet')
})

test('街坊故事：不把虛構的事安在真實店家身上——對白不提店名，路人也不站在有名字的店門口', () => {
  const names = getEra('banquet').availableStores.map((id) => getShop(id, 'banquet').name)
  for (const talk of NEIGHBOUR_TALK) for (const line of linesOf(talk)) for (const name of names) assert.ok(!line.text.includes(name), `${talk.id} 提到 ${name}`)
  for (const node of NEIGHBOUR_ROUTE.nodes) assert.equal(node.shopId, undefined, node.id)
  for (const figure of NEIGHBOUR_FIGURES) {
    for (const id of getEra('banquet').availableStores) {
      const point = getShopPlacement(getShop(id, 'banquet')).interactionPoint
      assert.ok(Math.hypot(point.x - figure.position[0], point.z - figure.position[1]) > 2.2, `${figure.id} 太靠近 ${id} 的門口`)
    }
  }
})
