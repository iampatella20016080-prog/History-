import test from 'node:test'
import assert from 'node:assert/strict'
import { FOLKLORE_OBJECTS, FOLKLORE_ROUTE, FOLKLORE_TALK } from '../src/data/routes/folkloreRoute.js'
import { talkForNpc } from '../src/data/talk.js'
import { nodeEra, routeEras } from '../src/game/themeRoute.js'

const linesOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]
// 傳說裡牽涉到的真實人物、家族與酒樓（研究檔：不出現）
const REAL_NAMES = ['阿仙舍', '廖添丁', '陳金絨', '王稻瑞', '李春生', '江山樓', '金同順']

test('軼事系列：跨港口商街、酒樓繁華、庶民生活，每位路人都在自己的年代', () => {
  assert.deepEqual(routeEras(FOLKLORE_ROUTE), ['qing-port', 'banquet', 'postwar'])
  for (const node of FOLKLORE_ROUTE.nodes) for (const npcId of node.npcIds) assert.ok(talkForNpc(nodeEra(FOLKLORE_ROUTE, node), npcId), `${node.id}：${npcId}`)
})

test('軼事系列：每段對話都有標「坊間傳說」的傳說；傳說本身不標有出處（路人的閒聊是虛構對白）', () => {
  for (const talk of FOLKLORE_TALK) assert.ok(linesOf(talk).some((line) => line.label === 'folklore'), `${talk.id}：要有坊間傳說`)
  // 周成的故事大意、法主公降伏蛇妖、龜上壁、雞母穴：都是坊間傳說
  const legend = FOLKLORE_TALK.flatMap(linesOf).filter((line) => /周成|蛇|龜上壁|雞母穴|人看人/.test(line.text))
  assert.ok(legend.length >= 5)
  for (const line of legend) {
    if (line.text.includes('竹林書局')) continue // 歌仔冊的出版資料是有出處的
    assert.notEqual(line.label, 'sourced', `傳說不能標有出處：${line.text}`)
  }
  assert.ok(legend.filter((line) => line.label === 'folklore').length >= 5)
  assert.match(FOLKLORE_ROUTE.intro, /坊間傳說/)
})

test('軼事系列：不把傳說安在真實人物身上；周成寫明查無其人', () => {
  const texts = [...FOLKLORE_TALK.flatMap(linesOf).map((line) => line.text), FOLKLORE_ROUTE.intro, FOLKLORE_ROUTE.closing, ...Object.values(FOLKLORE_OBJECTS).flatMap((object) => [object.lead, ...object.paragraphs])]
  for (const text of texts) for (const name of REAL_NAMES) assert.ok(!text.includes(name), `出現了 ${name}：${text}`)
  assert.match(FOLKLORE_OBJECTS['zhou-cheng-songbook'].paragraphs.join(''), /查無周成其人/)
  assert.ok(!texts.join('').includes('二二八'))
  for (const object of Object.values(FOLKLORE_OBJECTS)) assert.equal(object.reconstruction, true, object.id)
})
