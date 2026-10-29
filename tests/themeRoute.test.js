import test from 'node:test'
import assert from 'node:assert/strict'
import { remainingNodes, routeComplete, routeCount, routeJournalPage, routeProgress, validateRoute } from '../src/game/themeRoute.js'
import { ROUTES, TEA_ROUTE, getRoute } from '../src/data/teaRoute.js'
import { addJournalEntry, newJournal } from '../src/game/journal.js'
import { QING_PORT_TALK } from '../src/data/qingPortTalk.js'
import { getInspectable } from '../src/data/inspectObjects.js'
import { getShop } from '../src/data/shops.js'
import { getEra } from '../src/data/eras.js'

function journalWith(ids) {
  let journal = newJournal()
  for (const id of ids) {
    const kind = id.startsWith('talk:') ? 'talk' : id.startsWith('object:') ? 'object' : id.startsWith('news:') ? 'news' : 'shop'
    journal = addJournalEntry(journal, { id, kind, eraId: 'qing-port', title: id, text: `${id} 的手記` })
  }
  return journal
}

test('主題路線：資料格式正確', () => {
  for (const route of ROUTES) assert.deepEqual(validateRoute(route), [], route.id)
})

test('一箱茶的旅程：節點對應存在的對話、器物、店家與年代', () => {
  assert.ok(getEra(TEA_ROUTE.eraId))
  for (const node of TEA_ROUTE.nodes) {
    for (const npcId of node.npcIds ?? []) assert.ok(QING_PORT_TALK.some((talk) => talk.npcId === npcId), `${node.id}：${npcId}`)
    if (node.inspectableId) assert.ok(getInspectable(node.inspectableId), node.id)
    if (node.shopId) {
      const shop = getShop(node.shopId, TEA_ROUTE.eraId)
      assert.ok(shop, node.id)
      assert.equal(shop.status, 'open', `${node.id}：${node.shopId} 要是可探索的店家`)
    }
  }
  // 對話節點：碼頭的三位挑夫任何一位都算（室內的人物不在這個節點裡）
  const talkNode = TEA_ROUTE.nodes.find((node) => node.kind === 'talk')
  const porters = QING_PORT_TALK.filter((talk) => talk.npcId.startsWith('qing-wharf-'))
  assert.equal(talkNode.journalIds.length, porters.length)
  // 外銷消息的節點對應寶順洋行「洋行與茶」章節的手記條目
  const dodd = getShop('dodd-tea-house')
  const journalChapter = dodd.chapters.find((chapter) => chapter.journal)
  assert.ok(journalChapter)
  const newsNode = TEA_ROUTE.nodes.find((node) => node.kind === 'news')
  assert.ok(newsNode.journalIds.includes(journalChapter.journal.id))
})

test('主題路線：進度依手記、順序自由、完成後有手記頁', () => {
  const journal = journalWith(['object:tea-chest', 'talk:qing-porter-rest'])
  const progress = routeProgress(TEA_ROUTE, journal)
  assert.equal(progress.find((node) => node.id === 'chest').done, true)
  assert.equal(progress.find((node) => node.id === 'porters').done, true, '任何一位挑夫都算')
  assert.equal(routeComplete(TEA_ROUTE, journal), false)
  assert.deepEqual(routeCount(TEA_ROUTE, journal), { done: 2, total: 5 })
  assert.equal(remainingNodes(TEA_ROUTE, journal).length, 3)

  const all = journalWith(TEA_ROUTE.nodes.map((node) => node.journalIds[0]))
  assert.ok(routeComplete(TEA_ROUTE, all))
  const page = routeJournalPage(TEA_ROUTE, all)
  assert.equal(page.length, TEA_ROUTE.nodes.length)
  for (const { entry } of page) assert.ok(entry)
})

test('主題路線：getRoute', () => {
  assert.equal(getRoute('tea'), TEA_ROUTE)
  assert.equal(getRoute('沒有'), null)
})
