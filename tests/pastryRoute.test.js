import test from 'node:test'
import assert from 'node:assert/strict'
import { PASTRY_FIGURES, PASTRY_OBJECTS, PASTRY_ROUTE, PASTRY_TALK } from '../src/data/routes/pastryRoute.js'
import { getShop } from '../src/data/shops.js'
import { getEra } from '../src/data/eras.js'
import { routeFiguresOfEra } from '../src/data/routeFigures.js'
import { talkForNpc } from '../src/data/talk.js'

const SHOPS = ['shizixuan', 'hao-guo-yuan', 'li-ting-xiang', 'zi-yang']
const textsOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)].map((line) => line.text)

test('一塊糕餅的人生：四個節點對應四家老屋新生的店，都在這個年代開放', () => {
  assert.deepEqual(PASTRY_ROUTE.nodes.map((node) => node.shopId), SHOPS)
  for (const id of SHOPS) {
    assert.ok(getEra('revival').availableStores.includes(id), id)
    assert.equal(getShop(id, 'revival').status, 'open', id)
  }
  // 人物與對話只在老屋新生
  assert.equal(routeFiguresOfEra('revival').filter((figure) => figure.id.startsWith('pastry-')).length, PASTRY_FIGURES.length)
  for (const eraId of ['qing-port', 'banquet', 'modern', 'postwar']) {
    for (const talk of PASTRY_TALK) assert.equal(talkForNpc(eraId, talk.npcId), null, `${eraId}：${talk.id}`)
  }
})

test('一塊糕餅的人生：只依主題並列，不寫成傳承線（第 7 階段的結論）', () => {
  const names = SHOPS.map((id) => getShop(id, 'revival').name)
  const all = [PASTRY_ROUTE.intro, PASTRY_ROUTE.closing, ...PASTRY_ROUTE.nodes.map((node) => node.hint)]
  for (const text of all) assert.ok(!/傳承線|師承|一脈相承|延續了/.test(text), text)
  assert.match(PASTRY_ROUTE.intro, /沒有傳承關係/)
  assert.match(PASTRY_ROUTE.closing, /沒有傳承關係/)
  // 每位路人只談自己這一站：對白不提到其他三家店
  PASTRY_TALK.forEach((talk, i) => {
    const others = names.filter((_, k) => k !== i)
    for (const text of textsOf(talk)) for (const name of others) assert.ok(!text.includes(name), `${talk.id} 提到 ${name}`)
  })
})

test('一塊糕餅的人生：三種標示都有，店家的說法標明是店家自述', () => {
  const lines = PASTRY_TALK.flatMap((talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)])
  for (const label of ['sourced', 'folklore', 'fiction']) assert.ok(lines.some((line) => line.label === label), label)
  // 李亭香的創立年份只有店家說法
  const ltx = lines.filter((line) => line.text.includes('一八九五'))
  assert.ok(ltx.length >= 1 && ltx.every((line) => line.text.includes('店家自己的說法')))
  // 器物都標「歷史情境重建」，不複製店家的產品
  for (const object of Object.values(PASTRY_OBJECTS)) assert.equal(object.reconstruction, true, object.id)
})
