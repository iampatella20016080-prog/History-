import test from 'node:test'
import assert from 'node:assert/strict'
import { ROUTES, getRoute, routeNodePoint } from '../src/data/routes.js'
import { TALK_BY_ERA, TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { pickInteraction } from '../src/game/interactionPick.js'
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

/** 人物附近 8 × 8 公尺的格點（0.2 公尺）：角色站得下的格子（在可行走範圍內、不碰到障礙物） */
function freeCells(world, center, skip = null) {
  const r = 0.32
  const ground = world.collision.walkable.filter((rect) => (rect.level ?? 0) === 0)
  const obstacles = world.collision.obstacles.filter((rect) => (rect.level ?? 0) === 0 && rect !== skip)
  const cells = new Map()
  for (let i = -20; i <= 20; i++) {
    for (let k = -20; k <= 20; k++) {
      const x = center[0] + i * 0.2
      const z = center[1] + k * 0.2
      const inGround = ground.some((rect) => x > rect.minX + r && x < rect.maxX - r && z > rect.minZ + r && z < rect.maxZ - r)
      const blocked = obstacles.some((rect) => x > rect.minX - r && x < rect.maxX + r && z > rect.minZ - r && z < rect.maxZ + r)
      if (inGround && !blocked) cells.set(`${i},${k}`, [x, z])
    }
  }
  return cells
}

/** 格點的連通塊數（只算夠大的塊，忽略邊角的零星格子） */
function components(cells) {
  const seen = new Set()
  let count = 0
  for (const key of cells.keys()) {
    if (seen.has(key)) continue
    const queue = [key]
    seen.add(key)
    let size = 0
    while (queue.length) {
      const [i, k] = queue.pop().split(',').map(Number)
      size++
      for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = `${i + di},${k + dk}`
        if (cells.has(next) && !seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    if (size >= 12) count++
  }
  return count
}

test('第 12 階段：路線人物不把可以走的地方切成兩塊；從空的方向走近再走開，多種步長都不會卡住', () => {
  for (const figure of ROUTE_FIGURES) {
    const world = worldOf(figure.eraId)
    const box = routeFigureBox(figure)
    const own = world.collision.obstacles.find((rect) => Math.abs(rect.minX - box.minX) < 1e-9 && Math.abs(rect.minZ - box.minZ) < 1e-9 && Math.abs(rect.maxX - box.maxX) < 1e-9)
    assert.ok(own, `${figure.id}：碰撞資料裡沒有人物的範圍`)
    const withFigure = freeCells(world, figure.position)
    const without = freeCells(world, figure.position, own)
    assert.equal(components(withFigure), components(without), `${figure.id}：人物把附近可以走的地方隔開了`)
    // 從人物四周空著的方向走近（停在人物外面），再走回原處
    const [fx, fz] = figure.position
    const starts = [0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => [fx + Math.cos((i * Math.PI) / 4) * 1.6, fz + Math.sin((i * Math.PI) / 4) * 1.6])
      .filter(([x, z]) => [...withFigure.values()].some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 0.15))
    assert.ok(starts.length >= 2, `${figure.id}：四周至少要有兩個方向走得到`)
    for (const step of [0.05, 0.13, 0.31]) {
      for (const [sx, sz] of starts) {
        for (let round = 0; round < 3; round++) {
          const p = { x: sx, y: 0, z: sz }
          for (let i = 0; i < 80; i++) {
            const d = Math.hypot(fx - p.x, fz - p.z)
            if (d < step) break
            p.x += ((fx - p.x) / d) * step
            p.z += ((fz - p.z) / d) * step
            resolvePlayerPosition(p, 0.32, world.collision)
          }
          const inside = p.x > box.minX && p.x < box.maxX && p.z > box.minZ && p.z < box.maxZ
          assert.ok(!inside, `${figure.id}：步長 ${step} 走進了人物裡`)
          for (let i = 0; i < 80; i++) {
            const d = Math.hypot(sx - p.x, sz - p.z)
            if (d < step) break
            p.x += ((sx - p.x) / d) * step
            p.z += ((sz - p.z) / d) * step
            resolvePlayerPosition(p, 0.32, world.collision)
          }
          assert.ok(Math.hypot(sx - p.x, sz - p.z) < 0.5, `${figure.id}：步長 ${step} 從 (${sx.toFixed(1)}, ${sz.toFixed(1)}) 走近後走不回去`)
        }
      }
    }
  }
})

test('第 12 階段：每位節點路人都叫得到——有站得到的位置，路人在交談半徑內而且比任何店家的互動點近', () => {
  for (const route of PHASE12) {
    for (const node of route.nodes) {
      const eraId = nodeEra(route, node)
      const world = worldOf(eraId)
      const points = getEra(eraId).availableStores.flatMap((shopId) => {
        const shop = getShop(shopId, eraId)
        if (!shop?.position || shop.status !== 'open') return []
        const placement = getShopPlacement(shop)
        return placement.hotspots.length
          ? placement.hotspots.filter((hotspot) => !hotspot.clickOnly).map((hotspot) => ({ id: shopId, point: hotspot.interactionPoint, radius: hotspot.radius ?? 2 }))
          : [{ id: shopId, point: placement.interactionPoint, radius: shop.interaction?.radius ?? 3.2 }]
      })
      for (const npcId of node.npcIds ?? []) {
        const npc = world.npcs.find((item) => item.id === npcId)
        assert.ok(npc, `${route.id}／${node.id}：${npcId} 不在 ${eraId} 的街景裡`)
        const reachable = [...freeCells(world, [npc.position[0], npc.position[2]]).values()].some(([x, z]) => {
          const talk = Math.hypot(x - npc.position[0], z - npc.position[2])
          if (talk >= TALK_RADIUS) return false
          const shops = points.map((item) => ({ id: item.id, distance: Math.hypot(x - item.point.x, z - item.point.z), radius: item.radius })).filter((item) => item.distance < item.radius)
          const shop = shops.sort((a, b) => a.distance - b.distance)[0] ?? null
          return pickInteraction({ talk: { id: npcId, distance: talk }, shop }).talk !== null
        })
        assert.ok(reachable, `${route.id}／${node.id}：走不到可以跟 ${npcId} 說話的位置`)
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
