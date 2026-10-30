import test from 'node:test'
import assert from 'node:assert/strict'
import { INSPECT_LIMITS, INSPECT_MIN_RADIUS, inspectActionT, inspectScale, inspectViewDistance, newInspectState, objectJournalId, rotateInspect, toggleInspectAction, updateInspect, zoomInspect } from '../src/game/objectInspect.js'
import { CAMERA } from '../src/game/config.js'
import { INSPECT_OBJECTS, STREET_INSPECTABLES, getInspectObject, getInspectable, inspectablesOfEra } from '../src/data/inspectObjects.js'
import { buildInspectObject, inspectPartRotation } from '../src/game/builders/inspectObjects.js'
import { getSource } from '../src/data/sources.js'
import { getEra } from '../src/data/eras.js'
import { stackBox, TEA_STACKS } from '../src/data/qingWharfLayout.js'
import { getShop } from '../src/data/shops.js'

test('器物檢視：旋轉夾在範圍內、縮放不超過上下限、拖曳後不再自轉', () => {
  let state = newInspectState()
  assert.ok(state.spinning)
  state = rotateInspect(state, 0.5, -10)
  assert.equal(state.pitch, INSPECT_LIMITS.minPitch)
  assert.ok(!state.spinning)
  state = rotateInspect(state, 0, 10)
  assert.equal(state.pitch, INSPECT_LIMITS.maxPitch)
  state = zoomInspect(state, 100)
  assert.equal(state.zoom, INSPECT_LIMITS.maxZoom)
  state = zoomInspect(state, 0.0001)
  assert.equal(state.zoom, INSPECT_LIMITS.minZoom)
})

test('器物檢視：小動作按一下做、再按一下還原，進度逐格推進', () => {
  let state = newInspectState()
  state = toggleInspectAction(state, 'lid')
  assert.equal(state.actions.lid.target, 1)
  for (let i = 0; i < 60; i++) state = updateInspect(state, 1 / 30)
  assert.equal(inspectActionT(state, 'lid'), 1)
  state = toggleInspectAction(state, 'lid')
  assert.equal(state.actions.lid.target, 0)
  for (let i = 0; i < 60; i++) state = updateInspect(state, 1 / 30)
  assert.equal(inspectActionT(state, 'lid'), 0)
  // 進度到位且不自轉時回傳原本的狀態（不觸發重畫）
  state = rotateInspect(state, 0, 0)
  assert.equal(updateInspect(state, 1 / 30), state)
})

test('器物資料：欄位齊全、「有出處」的出處存在、動作對應建模的零件', () => {
  for (const object of Object.values(INSPECT_OBJECTS)) {
    assert.ok(object.title && object.titleEn && object.lead && object.leadEn, object.id)
    assert.ok(object.sourceIds?.length, object.id)
    for (const id of object.sourceIds) assert.ok(getSource(id), `${object.id}：出處 ${id} 不在 sources.js`)
    const built = buildInspectObject(object.id)
    assert.ok(built.radius > 0 && built.parts.length > 0, object.id)
    for (const part of built.parts) assert.ok(part.geometry.attributes.position.count > 0, `${object.id}／${part.id}`)
    // 每個小動作都要有會動的零件
    for (const action of object.actions ?? []) {
      assert.ok(
        built.parts.some((part) => part.animate?.action === action.id),
        `${object.id}：動作 ${action.id} 沒有對應的零件`,
      )
    }
  }
})

test('器物建模：會動的零件依進度轉動（緩入緩出，端點正確）', () => {
  const chest = buildInspectObject('tea-chest')
  const lid = chest.parts.find((part) => part.id === 'lid')
  assert.equal(inspectPartRotation(lid, 0), lid.animate.from)
  assert.equal(inspectPartRotation(lid, 1), lid.animate.to)
  const half = inspectPartRotation(lid, 0.5)
  assert.ok((half - lid.animate.from) / (lid.animate.to - lid.animate.from) > 0.4)
  assert.throws(() => buildInspectObject('沒有這件'))
})

test('街上的器物：年代存在、objectId 有資料、位置在碼頭南側的茶箱堆旁', () => {
  for (const item of STREET_INSPECTABLES) {
    assert.ok(getEra(item.eraId), item.id)
    assert.ok(getInspectObject(item.objectId), item.id)
    assert.ok(item.radius > 0 && item.prompt, item.id)
  }
  assert.equal(getInspectable('wharf-tea-chest').objectId, 'tea-chest')
  assert.equal(inspectablesOfEra('qing-port').length, 5)
  assert.equal(inspectablesOfEra('banquet').length, 0)
  // 位置貼著南側的茶箱堆（走近就能近看）
  const south = stackBox(TEA_STACKS.find((stack) => stack.id === 'south'))
  const [x, , z] = getInspectable('wharf-tea-chest').position
  assert.ok(x > south.minX - 1 && x < south.maxX + 1 && z > south.minZ - 1 && z < south.maxZ + 1)
})

test('器物章節：chapter.object 都對應存在的器物（米斗、茶箱）', () => {
  for (const shopId of ['rice-and-shine', 'dodd-tea-house']) {
    const shop = getShop(shopId, shopId === 'dodd-tea-house' ? 'qing-port' : 'banquet')
    for (const chapter of shop?.chapters ?? []) {
      if (chapter.type === 'object') assert.ok(getInspectObject(chapter.object), `${shopId}／${chapter.id}`)
    }
  }
})

test('器物檢視：很小的器物放大取景，任何縮放下鏡頭都不穿進器物（近裁切面之外）', () => {
  assert.equal(inspectScale(0.75), 1)
  assert.ok(Math.abs(inspectScale(0.07) * 0.07 - INSPECT_MIN_RADIUS) < 1e-9)
  for (const object of Object.values(INSPECT_OBJECTS)) {
    const built = buildInspectObject(object.id)
    const radius = built.radius * inspectScale(built.radius)
    for (const zoom of [INSPECT_LIMITS.minZoom, 1, INSPECT_LIMITS.maxZoom]) {
      const distance = inspectViewDistance(radius, zoom, CAMERA.near)
      assert.ok(distance - radius > CAMERA.near, `${object.id}：縮放 ${zoom} 時鏡頭穿進器物`)
    }
  }
  // 拉近時距離變短（還沒碰到下限時）
  assert.ok(inspectViewDistance(0.75, 1, CAMERA.near) > inspectViewDistance(0.75, 2, CAMERA.near))
})
