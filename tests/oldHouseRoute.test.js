import test from 'node:test'
import assert from 'node:assert/strict'
import { OLD_HOUSE_OBJECTS, OLD_HOUSE_ROUTE, OLD_HOUSE_TALK } from '../src/data/routes/oldHouseRoute.js'
import { getShop } from '../src/data/shops.js'
import { getEra } from '../src/data/eras.js'
import { talkForNpc } from '../src/data/talk.js'
import { nodeEra, routeEras } from '../src/game/themeRoute.js'
import { addJournalEntry, newJournal } from '../src/game/journal.js'

const linesOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]

test('老屋裡的新生活：跨三個年代，每個節點的店在自己的年代都開放', () => {
  assert.deepEqual(routeEras(OLD_HOUSE_ROUTE), ['modern', 'revival', 'postwar'])
  for (const node of OLD_HOUSE_ROUTE.nodes) {
    const eraId = nodeEra(OLD_HOUSE_ROUTE, node)
    assert.ok(getEra(eraId).availableStores.includes(node.shopId), `${node.id}：${node.shopId} 不在 ${eraId}`)
    assert.equal(getShop(node.shopId, eraId).status, 'open', node.id)
    for (const npcId of node.npcIds) assert.ok(talkForNpc(eraId, npcId), `${node.id}：${npcId} 在 ${eraId} 沒有對話`)
  }
  // 329 號的兩個節點是同一棟店屋的兩個年代版本
  const rice = OLD_HOUSE_ROUTE.nodes.filter((node) => node.shopId === 'rice-and-shine-329')
  assert.deepEqual(rice.map((node) => node.eraId), ['modern', 'revival'])
  assert.notEqual(getShop('rice-and-shine-329', 'modern').name, getShop('rice-and-shine-329', 'revival').name)
})

test('老屋裡的新生活：對話只在自己的年代；完成一個年代的節點不影響其他年代', () => {
  for (const talk of OLD_HOUSE_TALK) {
    for (const eraId of ['qing-port', 'banquet', 'modern', 'postwar', 'revival']) {
      assert.equal(!!talkForNpc(eraId, talk.npcId) && talkForNpc(eraId, talk.npcId).id === talk.id, eraId === talk.eraId, `${talk.id}／${eraId}`)
    }
  }
  const journal = addJournalEntry(newJournal(), { id: 'talk:old-house-mill', kind: 'talk', eraId: 'modern', title: 'x' })
  const done = OLD_HOUSE_ROUTE.nodes.filter((node) => node.journalIds.some((id) => journal.entries.some((entry) => entry.id === id)))
  assert.deepEqual(done.map((node) => node.id), ['mill'])
})

test('老屋裡的新生活：有爭議的創立年份不寫；器物都不是店家自己的、標歷史情境重建', () => {
  const texts = [...OLD_HOUSE_TALK.flatMap(linesOf).map((line) => line.text), OLD_HOUSE_ROUTE.intro, OLD_HOUSE_ROUTE.closing]
  const szx = OLD_HOUSE_TALK.find((talk) => talk.id === 'old-house-szx')
  for (const line of linesOf(szx)) assert.ok(!/19[23]\d|1920 年代|創立於/.test(line.text), `十字軒的創立年份待核：${line.text}`)
  const xfc = OLD_HOUSE_TALK.find((talk) => talk.id === 'old-house-xfc')
  for (const line of linesOf(xfc)) assert.ok(!/1918|1919|一九一[89]/.test(line.text), `新芳春的創立年份各說不一：${line.text}`)
  assert.ok(!texts.join('').includes('二二八'))
  for (const object of Object.values(OLD_HOUSE_OBJECTS)) assert.equal(object.reconstruction, true, object.id)
  for (const id of ['rice-ledger', 'longevity-cake-mould', 'pharmacy-bottles']) assert.match(OLD_HOUSE_OBJECTS[id].paragraphs.join(''), /不是/, `${id}：要寫明不是這家店的器物`)
  const labels = new Set(OLD_HOUSE_TALK.flatMap(linesOf).map((line) => line.label))
  assert.ok(labels.has('sourced') && labels.has('fiction'))
})
