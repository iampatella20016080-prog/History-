import test from 'node:test'
import assert from 'node:assert/strict'
import { ROUTES, getRoute, routeNodePoint } from '../src/data/routes.js'
import { TALK_BY_ERA, talkForNpc } from '../src/data/talk.js'
import { ROUTE_FIGURES, routeFigureBox, routeFigureNpcId, routeFiguresOfEra } from '../src/data/routeFigures.js'
import { INSPECT_OBJECTS, getInspectObject } from '../src/data/inspectObjects.js'
import { getSource } from '../src/data/sources.js'
import { getEra } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { TALK_LABELS, advanceTalk, startTalkSession, talkObjectId, validateTalk } from '../src/game/talk.js'
import { nodeEra, routeComplete, routeCount, routeEras, routeJournalPage, routeProgress, validateRoute } from '../src/game/themeRoute.js'
import { addJournalEntry, newJournal } from '../src/game/journal.js'
import { buildInspectObject } from '../src/game/builders/inspectObjects.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { useGameStore } from '../src/state/useGameStore.js'
import { resetStore } from './helpers.js'

/**
 * 第 12 階段「其他主題路線」的共用檢查：每條新路線（一箱茶的旅程以外）都要通過。
 * 個別路線的內容檢查（不寫成傳承線、二二八不放、標示的種類）在各路線自己的測試檔。
 */
const PHASE12 = ROUTES.filter((route) => route.id !== 'tea')
const allTalks = Object.values(TALK_BY_ERA).flat()
const worlds = new Map()
const worldOf = (eraId) => {
  if (!worlds.has(eraId)) worlds.set(eraId, buildEraWorldSync(eraId))
  return worlds.get(eraId)
}

function talkOfNode(route, node) {
  return (node.npcIds ?? []).map((npcId) => talkForNpc(nodeEra(route, node), npcId)).filter(Boolean)
}

function allLines(talk) {
  return [...talk.lines, ...(talk.followUps ?? []).flatMap((followUp) => followUp.lines)]
}

test('第 12 階段：六條路線都在總表裡，格式正確', () => {
  assert.ok(PHASE12.length >= 1)
  for (const route of PHASE12) {
    assert.deepEqual(validateRoute(route), [], route.id)
    assert.ok(route.introEn && route.closing && route.closingEn, `${route.id}：缺少 introEn 或完成頁的 closing／closingEn`)
    assert.equal(getRoute(route.id), route)
    for (const eraId of routeEras(route)) assert.ok(getEra(eraId), `${route.id}：年代 ${eraId}`)
  }
})

test('第 12 階段：每個節點有路人對話（2–4 句、可追問）與至少一件可以近看的器物', () => {
  for (const route of PHASE12) {
    for (const node of route.nodes) {
      const talks = talkOfNode(route, node)
      assert.ok(talks.length >= 1, `${route.id}／${node.id}：沒有路人對話`)
      for (const talk of talks) {
        assert.deepEqual(validateTalk(talk), [], talk.id)
        assert.ok(talk.followUps?.length >= 1, `${talk.id}：要可以追問`)
        assert.equal(talk.eraId, nodeEra(route, node), `${talk.id}：對話的年代`)
        const object = getInspectObject(talk.objectId)
        assert.ok(object, `${talk.id}：路人拿給你看的器物 ${talk.objectId}`)
        // 節點的完成判定：聽完對話或近看器物
        assert.ok(node.journalIds.includes(`talk:${talk.id}`), `${route.id}／${node.id}：journalIds 要有對話`)
        assert.ok(node.journalIds.includes(`object:${talk.objectId}`), `${route.id}／${node.id}：journalIds 要有器物`)
      }
      if (node.shopId) assert.ok(getShop(node.shopId, nodeEra(route, node)), `${route.id}／${node.id}：店家 ${node.shopId}`)
      assert.ok(routeNodePoint({ ...node, eraId: nodeEra(route, node) }), `${route.id}／${node.id}：地圖上找不到位置`)
    }
  }
})

test('第 12 階段：對白的三種標示、英文與出處都齊全', () => {
  for (const route of PHASE12) {
    for (const node of route.nodes) {
      for (const talk of talkOfNode(route, node)) {
        for (const line of allLines(talk)) {
          assert.ok(TALK_LABELS[line.label], `${talk.id}：標示 ${line.label}`)
          assert.ok(line.textEn, `${talk.id}：缺少 textEn`)
          for (const id of line.sourceIds ?? []) assert.ok(getSource(id), `${talk.id}：出處 ${id} 不在 sources.js`)
          if (line.label === 'sourced') assert.ok(line.sourceIds?.length, `${talk.id}：「有出處」要附出處`)
        }
      }
    }
  }
})

test('第 12 階段：器物資料齊全，精緻與流暢兩種模型的零件與小動作相同、流暢版面數較少', () => {
  const objectIds = new Set(PHASE12.flatMap((route) => route.nodes.flatMap((node) => talkOfNode(route, node).map((talk) => talk.objectId))))
  for (const id of objectIds) {
    const object = INSPECT_OBJECTS[id]
    assert.ok(object.title && object.titleEn && object.lead && object.leadEn, id)
    assert.ok(object.paragraphs?.length && object.paragraphsEn?.length === object.paragraphs.length, `${id}：說明要有英文`)
    assert.ok(object.sourceIds?.length, id)
    for (const sourceId of object.sourceIds) assert.ok(getSource(sourceId), `${id}：出處 ${sourceId}`)
    for (const action of object.actions ?? []) assert.ok(action.labelEn && action.doneLabelEn, `${id}／${action.id}：動作的英文`)
    const fine = buildInspectObject(id, { detail: true })
    const smooth = buildInspectObject(id, { detail: false })
    assert.deepEqual(
      smooth.parts.map((part) => [part.id, part.animate?.action ?? null]),
      fine.parts.map((part) => [part.id, part.animate?.action ?? null]),
      `${id}：兩種畫質的零件與動作要相同`,
    )
    const count = (built) => built.parts.reduce((sum, part) => sum + part.geometry.attributes.position.count, 0)
    assert.ok(count(smooth) < count(fine), `${id}：流暢版要比較簡化`)
    for (const action of object.actions ?? []) {
      assert.ok(fine.parts.some((part) => part.animate?.action === action.id), `${id}：動作 ${action.id} 沒有會動的零件`)
    }
  }
})

test('第 12 階段：主題模式的節點完成判定與完成後的手記頁', () => {
  for (const route of PHASE12) {
    let journal = newJournal()
    assert.deepEqual(routeCount(route, journal), { done: 0, total: route.nodes.length })
    // 順序自由：倒著走也可以
    for (const [i, node] of [...route.nodes].reverse().entries()) {
      const id = node.journalIds[i % node.journalIds.length]
      journal = addJournalEntry(journal, { id, kind: id.split(':')[0], eraId: nodeEra(route, node), title: id, text: `${id} 的手記` })
      assert.equal(routeProgress(route, journal).find((item) => item.id === node.id).done, true)
    }
    assert.ok(routeComplete(route, journal), route.id)
    for (const { entry } of routeJournalPage(route, journal)) assert.ok(entry)
  }
})

test('第 12 階段：跟路人說完話記進手記、按「近看」打開 3D 檢視並記下器物', () => {
  for (const route of PHASE12) {
    const node = route.nodes[0]
    const [talk] = talkOfNode(route, node)
    resetStore(nodeEra(route, node))
    useGameStore.setState({ viewMode: 'explore', talk: null, inspect: null, journal: newJournal() })
    assert.ok(useGameStore.getState().startTalk(talk.npcId))
    let session = useGameStore.getState().talk
    assert.equal(talkObjectId(session), null, '開場還沒說完，不出現近看')
    while (useGameStore.getState().talk.stage === 'line') useGameStore.getState().advanceTalk()
    session = useGameStore.getState().talk
    assert.equal(talkObjectId(session), talk.objectId)
    assert.ok(useGameStore.getState().journal.entries.some((entry) => entry.id === `talk:${talk.id}`))
    assert.ok(useGameStore.getState().showTalkObject())
    const state = useGameStore.getState()
    assert.equal(state.talk, null)
    assert.equal(state.inspect.objectId, talk.objectId)
    assert.equal(state.inspect.source, 'talk')
    assert.ok(state.journal.entries.some((entry) => entry.id === `object:${talk.objectId}`))
    assert.equal(routeProgress(route, state.journal).find((item) => item.id === node.id).done, true)
    useGameStore.setState({ inspect: null })
    // 純邏輯：說完開場才出現器物
    assert.equal(talkObjectId(advanceTalk(startTalkSession(talk))), talk.lines.length === 1 ? talk.objectId : null)
  }
})

test('第 12 階段：路線人物站在可以走的地方，不和建築、道具重疊，也不擋住店家的互動點', () => {
  const ids = new Set()
  for (const figure of ROUTE_FIGURES) {
    assert.ok(!ids.has(figure.id), `人物 id 重複：${figure.id}`)
    ids.add(figure.id)
    const world = worldOf(figure.eraId)
    const npc = world.npcs.find((item) => item.id === routeFigureNpcId(figure))
    assert.ok(npc, `${figure.id}：不在 world.npcs`)
    const box = routeFigureBox(figure)
    const { walkable, obstacles } = world.collision
    const ground = walkable.filter((rect) => (rect.level ?? 0) === 0)
    assert.ok(
      ground.some((rect) => box.minX >= rect.minX && box.maxX <= rect.maxX && box.minZ >= rect.minZ && box.maxZ <= rect.maxZ),
      `${figure.id}：要站在可行走範圍裡`,
    )
    const overlap = (a, b, margin = 0) => a.minX < b.maxX + margin && a.maxX > b.minX - margin && a.minZ < b.maxZ + margin && a.maxZ > b.minZ - margin
    const others = obstacles.filter((rect) => (rect.level ?? 0) === 0 && !(Math.abs(rect.minX - box.minX) < 1e-9 && Math.abs(rect.minZ - box.minZ) < 1e-9))
    for (const rect of others) assert.ok(!overlap(box, rect, 0.65), `${figure.id}：離障礙物太近（要留 0.65 公尺，比人物的直徑寬，讓人走過）`)
    // 店家的互動點（含熱點）不在人物旁邊：玩家走近店家時不會先被人物擋住
    for (const shopId of getEra(figure.eraId).availableStores) {
      const shop = getShop(shopId, figure.eraId)
      if (!shop?.position) continue
      const placement = getShopPlacement(shop)
      const points = placement.hotspots.length ? placement.hotspots.map((hotspot) => hotspot.interactionPoint) : [placement.interactionPoint]
      for (const point of points) {
        assert.ok(Math.hypot(point.x - figure.position[0], point.z - figure.position[1]) > 1.1, `${figure.id}：擋住 ${shopId} 的互動點`)
      }
    }
  }
})

test('第 12 階段：路線人物不影響走路——從人物身邊走過，多種步長來回多次都不會卡住', () => {
  for (const figure of ROUTE_FIGURES) {
    const world = worldOf(figure.eraId)
    const [fx, fz] = figure.position
    // 從人物旁邊（街心那一側 1 公尺）沿街走過去再走回來
    const side = fz > 0 ? -1 : 1
    for (const step of [0.05, 0.13, 0.31]) {
      const p = { x: fx - 3, y: 0, z: fz + side * 1.0 }
      for (let round = 0; round < 3; round++) {
        for (const dir of [1, -1]) {
          const target = fx + dir * 3
          for (let i = 0; i < 200 && Math.abs(p.x - target) > step; i++) {
            p.x += Math.sign(target - p.x) * step
            resolvePlayerPosition(p, 0.32, world.collision)
          }
          assert.ok(Math.abs(p.x - target) <= step + 1e-6, `${figure.id}：步長 ${step} 走不過去`)
        }
      }
    }
  }
})

test('第 12 階段：沒有路線人物的年代，人物數量不變', () => {
  for (const eraId of ['qing-port', 'banquet', 'modern', 'postwar', 'revival']) {
    const world = worldOf(eraId)
    const routeNpcs = world.npcs.filter((npc) => npc.id.startsWith('route-'))
    assert.equal(routeNpcs.length, routeFiguresOfEra(eraId).length, eraId)
  }
})
