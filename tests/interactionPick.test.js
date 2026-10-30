import test from 'node:test'
import assert from 'node:assert/strict'
import { pickInteraction } from '../src/game/interactionPick.js'

const at = (id, distance, extra = {}) => ({ id, distance, ...extra })

test('互動取捨：只有一種對象時原樣保留', () => {
  assert.deepEqual(pickInteraction({ talk: at('npc', 1) }), { talk: at('npc', 1), inspectable: null, shop: null })
  assert.deepEqual(pickInteraction({ shop: at('shop', 2) }), { talk: null, inspectable: null, shop: at('shop', 2) })
  assert.deepEqual(pickInteraction({}), { talk: null, inspectable: null, shop: null })
})

test('互動取捨：路人與店家同時在範圍內，留比較近的（店門口的路人不搶店家的介紹）', () => {
  // 站在店家的互動點上：店家比較近
  assert.deepEqual(pickInteraction({ talk: at('npc', 1.7), shop: at('shop', 0.2, { hotspotId: null }) }), { talk: null, inspectable: null, shop: at('shop', 0.2, { hotspotId: null }) })
  // 走到路人身邊：路人比較近
  assert.deepEqual(pickInteraction({ talk: at('npc', 0.6), shop: at('shop', 2.4) }), { talk: at('npc', 0.6), inspectable: null, shop: null })
  // 一樣近：路人優先
  assert.equal(pickInteraction({ talk: at('npc', 1), shop: at('shop', 1) }).talk.id, 'npc')
})

test('互動取捨：路人與器物留比較近的；器物與店家可以同時提示', () => {
  assert.equal(pickInteraction({ talk: at('npc', 2), inspectable: at('chest', 1) }).talk, null)
  assert.equal(pickInteraction({ talk: at('npc', 1), inspectable: at('chest', 2) }).inspectable, null)
  const both = pickInteraction({ inspectable: at('chest', 1), shop: at('shop', 0.5) })
  assert.ok(both.inspectable && both.shop)
  // 三種都在：器物比路人近 → 路人讓出；店家仍然保留
  const three = pickInteraction({ talk: at('npc', 1.5), inspectable: at('chest', 1), shop: at('shop', 2) })
  assert.deepEqual([three.talk, three.inspectable?.id, three.shop?.id], [null, 'chest', 'shop'])
})
