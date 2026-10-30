import test from 'node:test'
import assert from 'node:assert/strict'
import { TEMPLE_MEAL_OBJECTS, TEMPLE_MEAL_ROUTE, TEMPLE_MEAL_TALK } from '../src/data/routes/templeMealRoute.js'
import { getShop } from '../src/data/shops.js'
import { getEra } from '../src/data/eras.js'
import { talkForNpc } from '../src/data/talk.js'

const linesOf = (talk) => [...talk.lines, ...talk.followUps.flatMap((item) => item.lines)]
// 廟口的現存攤商（第 6 階段的查證：只做情境示意，不用店名、攤主與年份）
const VENDOR_NAMES = ['許仔', '葉家', '阿桂姨', '江家', '黃記', '賴記', '媽祖宮口', '魷魚標']

test('廟口的一餐：四個節點都在庶民生活的慈聖宮廟埕，對應開放的攤位', () => {
  assert.equal(TEMPLE_MEAL_ROUTE.eraId, 'postwar')
  assert.deepEqual(TEMPLE_MEAL_ROUTE.nodes.map((node) => node.shopId), ['ci-sheng-gong', 'temple-squid-stall', 'temple-mi-tai-mu-stall', 'temple-douhua-stall'])
  for (const node of TEMPLE_MEAL_ROUTE.nodes) {
    assert.ok(getEra('postwar').availableStores.includes(node.shopId), node.shopId)
    assert.equal(getShop(node.shopId, 'postwar').status, 'open', node.shopId)
  }
  // 米苔目攤與豆花攤沿用攤位裡原本的攤販；對話只在庶民生活
  for (const talk of TEMPLE_MEAL_TALK) {
    assert.equal(talkForNpc('postwar', talk.npcId), talk)
    for (const eraId of ['qing-port', 'banquet', 'modern', 'revival']) assert.equal(talkForNpc(eraId, talk.npcId), null)
  }
})

test('廟口的一餐：攤位是情境示意——不出現現存攤商的名字，器物都標歷史情境重建', () => {
  const texts = [TEMPLE_MEAL_ROUTE.intro, TEMPLE_MEAL_ROUTE.closing, ...TEMPLE_MEAL_ROUTE.nodes.map((node) => node.hint), ...TEMPLE_MEAL_TALK.flatMap(linesOf).map((line) => line.text)]
  for (const object of Object.values(TEMPLE_MEAL_OBJECTS)) texts.push(object.lead, ...object.paragraphs)
  for (const text of texts) for (const name of VENDOR_NAMES) assert.ok(!text.includes(name), `出現了 ${name}：${text}`)
  assert.match(TEMPLE_MEAL_ROUTE.intro, /情境示意/)
  // 老屋新生的同一種食物只是不同店家，不寫成傳承
  assert.match(TEMPLE_MEAL_ROUTE.closing, /沒有傳承關係/)
  for (const object of Object.values(TEMPLE_MEAL_OBJECTS)) assert.equal(object.reconstruction, true, object.id)
})

test('廟口的一餐：三種標示都有；專欄與回憶文的內容寫明是誰的說法；不碰二二八', () => {
  const lines = TEMPLE_MEAL_TALK.flatMap(linesOf)
  for (const label of ['sourced', 'folklore', 'fiction']) assert.ok(lines.some((line) => line.label === label), label)
  for (const line of lines.filter((item) => item.sourceIds?.includes('mirror-2025-squid'))) assert.match(line.text, /專欄/)
  for (const line of lines.filter((item) => item.sourceIds?.includes('stust-2021-douhua'))) assert.match(line.text, /回憶|記得/)
  const all = [...lines.map((line) => line.text), TEMPLE_MEAL_ROUTE.intro, TEMPLE_MEAL_ROUTE.closing].join('')
  assert.ok(!/二二八|緝菸|天馬茶房/.test(all))
})
