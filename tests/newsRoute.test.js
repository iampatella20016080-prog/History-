import test from 'node:test'
import assert from 'node:assert/strict'
import { NEWS_OBJECTS, NEWS_ROUTE, NEWS_TALK } from '../src/data/routes/newsRoute.js'
import { talkForNpc } from '../src/data/talk.js'
import { nodeEra, routeEras } from '../src/game/themeRoute.js'

const linesOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]

test('今日報紙：五個年代各一則，順序是年代先後', () => {
  assert.deepEqual(routeEras(NEWS_ROUTE), ['qing-port', 'banquet', 'modern', 'postwar', 'revival'])
  for (const node of NEWS_ROUTE.nodes) {
    for (const npcId of node.npcIds) assert.ok(talkForNpc(nodeEra(NEWS_ROUTE, node), npcId), `${node.id}：${npcId}`)
  }
})

test('今日報紙：同一件事、不同人怎麼看——每則都有有出處的報導，也有標虛構對白的街坊反應', () => {
  for (const talk of NEWS_TALK) {
    const lines = linesOf(talk)
    assert.ok(lines.some((line) => line.label === 'sourced'), `${talk.id}：要有出處的報導`)
    assert.ok(lines.some((line) => line.label === 'fiction'), `${talk.id}：要有街坊的反應`)
    // 開場第一句是路人自己的話（虛構），第二句才是報導
    assert.equal(talk.lines[0].label, 'fiction', talk.id)
    assert.equal(talk.lines[1].label, 'sourced', talk.id)
  }
  // 清末北臺灣沒有在地報紙：港口商街讀的是香港的報紙
  const qing = NEWS_TALK.find((talk) => talk.eraId === 'qing-port')
  assert.match(qing.lines[1].text, /香港/)
  assert.match(NEWS_ROUTE.intro, /虛構對白/)
})

test('今日報紙：不碰 1947 年的事件；引用的原文都很短；器物不複製版面', () => {
  const all = [...NEWS_TALK.flatMap(linesOf).map((line) => line.text), NEWS_ROUTE.intro, NEWS_ROUTE.closing, ...Object.values(NEWS_OBJECTS).flatMap((object) => [object.lead, ...object.paragraphs])].join('')
  assert.ok(!/二二八|1947|一九四七|緝菸|天馬茶房/.test(all))
  // 1929 年的報紙（作者不詳、刊行超過五十年）只引一小句
  for (const line of NEWS_TALK.flatMap(linesOf)) for (const quote of line.text.match(/「[^」]*」/g) ?? []) assert.ok(quote.length <= 16, `引文太長：${quote}`)
  for (const object of Object.values(NEWS_OBJECTS)) {
    assert.equal(object.reconstruction, true, object.id)
    assert.match(object.paragraphs.join(''), /不複製|字不畫|字與圖樣不畫/, `${object.id}：要寫明不複製版面`)
  }
})
