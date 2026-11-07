import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { INSPECT_LAYERS, NOTE_STATUS, hasFullLayers, layerNotes, layerSourceIds } from '../src/data/inspectLayers.js'
import { INSPECT_OBJECTS, STREET_INSPECTABLES, getInspectObject, inspectPlaces } from '../src/data/inspectObjects.js'
import { RB_SHELL, RB_VARIANT } from '../src/data/riceAndShineBanquetLayout.js'
import { RICE_AND_SHINE_ID } from '../src/data/riceAndShineEraConfig.js'
import { RICE_SCENARIO } from '../src/data/riceAndShineData.js'
import { RICE_HOTSPOTS, RICE_NPCS, RS, riceToWorld } from '../src/data/riceAndShineLayout.js'
import { RICE_TALK } from '../src/data/riceAndShineTalk.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { TALK_RADIUS, talkForNpc } from '../src/data/talk.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildInspectObject } from '../src/game/builders/inspectObjects.js'
import { buildRiceAndShineInterior } from '../src/game/builders/riceAndShine/riceAndShineInterior.js'
import { NPC_LOOKS } from '../src/game/character/npcBuilder.js'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { inRiceAndShineLot } from './helpers.js'

/**
 * 迪化街 329 號酒樓繁華版的前店（第 11 階段第 9 項）：同一個店家 ID、同一個地段，前店可以走進去，店後的隔間門關著。
 * 驗證：器物清單與碰撞、器物的五層分層資訊（中英文、出處、狀態）、可以近看的位置、人物與對話、
 * 兩種畫質的內容分工、其他年代不受影響（其他年代的版本見 tests/riceAndShine.test.js）。
 */
const WORLD = buildEraWorldSync('banquet')
const BUILDING_ID = 'store-rice-and-shine-329'
const L = (x, z) => riceToWorld(x, z)
const STEPS = [0.15, 0.09, 0.05]
const OBJECT_IDS = ['rice-bin', 'jute-sack', 'carrying-basket', 'rice-measure', 'rice-sieve', 'tea-scale', 'abacus']
const BANQUET_SPOTS = STREET_INSPECTABLES.filter((item) => item.eraId === 'banquet' && item.shopId === RICE_AND_SHINE_ID)

function walkableAt(world, x, z, level = 0) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision, level)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

/** 在 (x, z) 附近 radius 內有沒有站得到的點（半徑內掃格） */
function standableNear(world, x, z, radius) {
  for (let dx = -radius; dx <= radius; dx += 0.1) {
    for (let dz = -radius; dz <= radius; dz += 0.1) {
      if (Math.hypot(dx, dz) <= radius && walkableAt(world, x + dx, z + dz)) return true
    }
  }
  return false
}

function walkTo(world, p, target, step) {
  for (let n = 0; n < 4000; n++) {
    const dx = target.x - p.x
    const dz = target.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) break
    p.x += (dx / d) * step
    p.z += (dz / d) * step
    resolvePlayerPosition(p, PLAYER.radius, world.collision, 0)
  }
  return Math.hypot(target.x - p.x, target.z - p.z)
}

describe('前店的格局與碰撞', () => {
  test('同一個建築 ID 與地段；前店是室內範圍，只有一塊（沒有二樓）；室內範圍與外殼尺寸一致', () => {
    const zones = WORLD.interiors.filter((z) => z.building === BUILDING_ID)
    assert.equal(zones.length, 1)
    assert.equal(zones[0].id, RICE_AND_SHINE_ID)
    assert.equal(RB_SHELL.half, RS.half)
    assert.equal(RB_SHELL.depth, RS.depth)
    assert.ok(RB_VARIANT.partition.closed, '店後的隔間門關著')
    assert.equal(WORLD.followAreas.filter(inRiceAndShineLot).length, 1)
    assert.ok(WORLD.viewerRegions.filter(inRiceAndShineLot).length >= 2)
  })

  test('器物清單：每一件都在前店的範圍裡，不擋住店門口，互相不重疊', () => {
    const { room } = RB_SHELL
    for (const item of RB_VARIANT.items) {
      const x0 = item.x ?? item.minX ?? 0
      assert.ok(x0 > room.minX - 0.01 && x0 < room.maxX + 0.01, `${item.type} x`)
      const z = item.z ?? ((item.z0 + item.z1) / 2)
      assert.ok(z < room.maxZ && z > room.minZ, `${item.type} z`)
    }
    // 店門口（中央 ±0.9、前 0.9 公尺）站得到
    for (const [x, z] of [
      [0, -0.45],
      [-0.6, -0.8],
      [0.6, -0.8],
    ]) assert.ok(walkableAt(WORLD, L(x, z).x, L(x, z).z), `門口 (${x}, ${z})`)
    // 器物本身是障礙物（不能走到米箱、櫃台、帳桌的正中央）
    for (const [x, z] of [
      [-2.05, -2.5],
      [2.15, -2.8],
      [1.5, -4.75],
      [1.85, -0.95],
    ]) assert.ok(!walkableAt(WORLD, L(x, z).x, L(x, z).z), `器物 (${x}, ${z})`)
    // 貼牆的米篩不擋路（block: false）
    assert.equal(RB_VARIANT.items.find((item) => item.type === 'sieveRack').block, false)
  })

  test('店後的隔間門關著：多種步長走向隔間門，都停在隔間牆前面，進不了店後', () => {
    for (const step of STEPS) {
      const p = { ...L(0.4, -3) }
      walkTo(WORLD, p, L(0, -9), step)
      const local = { x: -(p.x - RS.position.x), z: -(p.z - RS.position.z) }
      assert.ok(local.z > RB_VARIANT.partition.z, `每步 ${step}：走到 z ${local.z.toFixed(2)}，越過了隔間牆`)
      resolvePlayerPosition(p, PLAYER.radius, WORLD.collision, 0)
    }
    // 店後沒有可以走的範圍
    for (const r of WORLD.collision.walkable.filter((item) => item.inBuilding && inRiceAndShineLot(item))) {
      const a = L(0, RB_VARIANT.partition.z - 0.2)
      assert.ok(!(a.x > r.minX && a.x < r.maxX && a.z > r.minZ && a.z < r.maxZ), '隔間牆後面不能走')
    }
  })

  test('街邊的米商站在步道上時店門仍有 1 公尺以上的空隙；從街上進出店門 10 次（多種步長）都走得進去、走得出來', () => {
    const merchant = RICE_NPCS.earlyRiceTrade.find((npc) => npc.walkway)
    assert.ok(Math.abs(merchant.x) > RS.half * 0.3, '米商不站在店門正前方')
    const p = { ...L(0, 3) }
    for (let i = 0; i < 10; i++) {
      const step = STEPS[i % STEPS.length]
      assert.ok(walkTo(WORLD, p, L(0.2, -1.2), step) < 0.25, `第 ${i + 1} 次進去`)
      assert.ok(walkTo(WORLD, p, L(-1.25, -2.6), step) < 0.25, `第 ${i + 1} 次到米箱`)
      assert.ok(walkTo(WORLD, p, L(1.2, -2.8), step) < 0.25, `第 ${i + 1} 次到櫃台`)
      assert.ok(walkTo(WORLD, p, L(0, 1.0), step) < 0.25, `第 ${i + 1} 次出店門`)
      assert.ok(walkTo(WORLD, p, L(0, 3), step) < 0.25, `第 ${i + 1} 次回街上`)
    }
  })

  test('換年代：其他年代店屋裡任何站得到的位置換到 1895，人物都落在站得到的地方；1895 前店的位置換到其他年代也一樣', () => {
    const samples = (world) => {
      const list = []
      for (const r of world.collision.walkable.filter((item) => item.inBuilding && !item.ramp && inRiceAndShineLot(item))) {
        const level = r.level ?? 0
        for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.4) {
          for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.4) {
            if (walkableAt(world, x, z, level)) list.push({ x, z, level })
          }
        }
      }
      return list
    }
    const check = (from, to, label) => {
      const list = samples(from)
      assert.ok(list.length > 10, `${label}：${list.length} 個位置`)
      for (const { x, z, level } of list) {
        // 換年代時人物回到一樓再移位；移完之後，下一個影格的碰撞不會再明顯移動人物
        const q = { x, z }
        resolvePlayerPosition(q, PLAYER.radius, to.collision, 0, { relocate: true })
        const next = { ...q }
        resolvePlayerPosition(next, PLAYER.radius, to.collision, 0)
        assert.ok(Math.hypot(next.x - q.x, next.z - q.z) < 0.03, `${label} (${x.toFixed(2)}, ${z.toFixed(2)}, ${level}) → (${q.x.toFixed(2)}, ${q.z.toFixed(2)})`)
      }
    }
    for (const eraId of ['modern', 'postwar', 'revival']) {
      const other = buildEraWorldSync(eraId)
      check(other, WORLD, `${eraId} → banquet`)
      check(WORLD, other, `banquet → ${eraId}`)
    }
    check(WORLD, buildEraWorldSync('qing-port'), 'banquet → qing-port')
  })

  test('鏡頭不穿牆：前店每個可以站的位置，頭頂高度都不在任何遮擋方塊裡', () => {
    let checked = 0
    for (const r of WORLD.collision.walkable.filter((item) => item.inBuilding && inRiceAndShineLot(item))) {
      for (let x = r.minX + PLAYER.radius; x <= r.maxX - PLAYER.radius; x += 0.3) {
        for (let z = r.minZ + PLAYER.radius; z <= r.maxZ - PLAYER.radius; z += 0.3) {
          if (!walkableAt(WORLD, x, z)) continue
          const box = WORLD.blockers.find((b) => x > b.minX && x < b.maxX && 1.6 > b.minY && 1.6 < b.maxY && z > b.minZ && z < b.maxZ)
          assert.ok(!box, `(${x.toFixed(2)}, ${z.toFixed(2)}) 在方塊 ${JSON.stringify(box)} 裡`)
          checked++
        }
      }
    }
    assert.ok(checked > 20, `${checked} 個位置`)
  })
})

describe('器物與分層資訊', () => {
  test('七件器物（米箱、麻袋、米籮、米斗、米篩、桿秤、算盤）：五層都有中英文、有出處或標明狀態', () => {
    for (const id of OBJECT_IDS) {
      const object = getInspectObject(id)
      assert.ok(object, id)
      assert.ok(hasFullLayers(object, inspectPlaces(id)), `${id}：五層`)
      for (const { id: layerId } of INSPECT_LAYERS) {
        for (const note of layerNotes(object, layerId)) {
          assert.ok(note.text && note.textEn, `${id}／${layerId}：中英文都要有`)
          if (note.status) assert.ok(NOTE_STATUS[note.status], `${id}／${layerId}：狀態 ${note.status}`)
        }
      }
      for (const sourceId of layerSourceIds(object)) assert.ok(getSource(sourceId), `${id}：出處 ${sourceId}`)
    }
  })

  test('米箱：新器物，會動的零件（舀一斗）、形制標歷史情境重建；沒有找到的資料標待核，不寫成事實', () => {
    const bin = INSPECT_OBJECTS['rice-bin']
    assert.ok(bin.reconstruction)
    assert.equal(bin.actions[0].id, 'scoop')
    assert.ok(bin.titleEn && bin.leadEn && bin.paragraphsEn.length === bin.paragraphs.length)
    const built = buildInspectObject('rice-bin')
    assert.ok(built.parts.some((part) => part.animate?.action === 'scoop'))
    for (const [id, action] of [
      ['jute-sack', 'open'],
      ['carrying-basket', 'lift'],
    ]) {
      assert.equal(INSPECT_OBJECTS[id].actions[0].id, action)
      for (const detail of [true, false]) assert.ok(buildInspectObject(id, { detail }).parts.some((part) => part.animate?.action === action), id)
    }
    for (const detail of [true, false]) assert.ok(buildInspectObject('rice-bin', { detail }).parts.length >= 2)
    const evidence = layerNotes(bin, 'evidence')
    assert.ok(evidence.some((note) => note.status === 'pending' && /1907.*1916.*查無/.test(note.text)), '1907 年建屋以前與 1916 年以前的使用者：查無')
    // 不把唐益興安在這個年代的店裡：1916 年起的說法只在「做法」層、標待核
    assert.ok(layerNotes(bin, 'making').every((note) => note.status === 'pending'))
  })

  test('米斗：模型與館藏圓形官斗不同要寫明；戰後的 11.5 台斤和日治官斗拆開說；0044 的重量（疑筆誤）不引用', () => {
    const measure = INSPECT_OBJECTS['rice-measure']
    assert.ok(layerNotes(measure, 'form').some((note) => note.status === 'reconstruction' && /不同/.test(note.text)))
    const conversion = layerNotes(measure, 'use').filter((note) => /11\.5/.test(note.text))
    assert.equal(conversion.length, 1)
    assert.match(conversion[0].text, /戰後/)
    assert.match(conversion[0].text, /不是同一個斗/)
    // 2003.001.0898 沒有「官」字；火戳是圖徽
    const second = layerNotes(measure, 'form')[1]
    assert.doesNotMatch(second.text, /記「官」/)
    assert.match(second.text, /倒三角形/)
  })

  test('戰後的 11.5 台斤不放進 1895–1930：對白、米箱、章節與熱點都不用這個換算', () => {
    const lines = RICE_TALK.flatMap((talk) => [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)])
    assert.doesNotMatch(lines.map((line) => line.text).join(''), /十一斤半|11\.5/)
    assert.doesNotMatch(JSON.stringify(INSPECT_OBJECTS['rice-bin']), /11\.5/)
    assert.doesNotMatch(JSON.stringify(RICE_HOTSPOTS.earlyRiceTrade), /11\.5/)
  })

  test('桿秤補米店的使用場合；算盤的證據接上米店帳冊；「住家與倉庫」這種沒有出處的說法不出現', () => {
    const scale = layerNotes(INSPECT_OBJECTS['tea-scale'], 'use')
    assert.ok(scale.some((note) => /度量衡規則/.test(note.text) && note.sourceIds?.includes('nmth-rice-measure-2000-001-0044')))
    assert.ok(scale.some((note) => /情境設定/.test(note.text) && note.status === 'reconstruction'))
    assert.ok(layerNotes(INSPECT_OBJECTS['tea-scale'], 'where').some((note) => /329/.test(note.text)))
    assert.ok(layerNotes(INSPECT_OBJECTS.abacus, 'where').some((note) => /329/.test(note.text)))
    assert.ok(layerNotes(INSPECT_OBJECTS.abacus, 'evidence').some((note) => note.sourceIds?.includes('nmth-rice-ledger') && note.status === 'reconstruction'))
    const back = RICE_HOTSPOTS.earlyRiceTrade.find((h) => h.id === 'early-back')
    assert.doesNotMatch(back.note, /住家|倉庫/)
    assert.doesNotMatch(RICE_SCENARIO.find((item) => item.id === 'banquet-interior').text, /住家|倉庫|1895–1915/)
  })

  test('新出處：網址是典藏條目、沒有「待核實」；2003.001.0898 不寫「官」字', () => {
    for (const id of ['nmth-rice-measure-2000-001-0044', 'nmth-rice-measure-2003-001-0898', 'nmth-jute-sack-2002-005-0289', 'nmth-rice-basket-2003-001-0530', 'tcmb-rice-measures-260251', 'tcmb-rice-shop-559158', 'culture-taipei-2022-rice-shine']) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https:\/\//, id)
      assert.doesNotMatch(source.published, /待核實/, id)
      assert.ok(source.citationEn && source.titleEn && source.publishedEn, id)
    }
    assert.match(getSource('nmth-rice-measure-2003-001-0898').usage, /沒有「官」字/)
    assert.doesNotMatch(getSource('nmth-rice-measure-2000-001-0044').usage, /：25\.7.*2\.17g：/)
    assert.match(getSource('culture-taipei-2022-rice-shine').title, /老房子文化運動/)
  })

  test('近看的位置：酒樓繁華的前店有 7 件（米箱、米斗、桿秤、算盤、米篩、麻袋、米籮），都站得到、提示在半徑內', () => {
    assert.equal(BANQUET_SPOTS.length, 7)
    assert.deepEqual(BANQUET_SPOTS.map((item) => item.objectId).sort(), ['abacus', 'carrying-basket', 'jute-sack', 'rice-bin', 'rice-measure', 'rice-sieve', 'tea-scale'])
    for (const item of BANQUET_SPOTS) {
      assert.ok(getInspectObject(item.objectId), item.id)
      const [x, y, z] = item.position
      assert.ok(y > 0 && inRiceAndShineLot({ minX: x, maxX: x, minZ: z, maxZ: z }), `${item.id}：在店屋裡`)
      assert.ok(standableNear(WORLD, x, z, item.radius - 0.3), `${item.id}：半徑 ${item.radius} 內站得到`)
    }
    // 器物其他年代的位置不受影響（桿秤與算盤在其他店家各有自己的位置）
    assert.ok(inspectPlaces('tea-scale').some((place) => place.shopId !== RICE_AND_SHINE_ID))
  })
})

describe('人物與對話', () => {
  test('兩位前店人物（米店夥計、買米的客人）：在室內範圍、站著、不擋住店門與器物；街邊的三位仍在', () => {
    const npcs = WORLD.npcs.filter((n) => n.id.startsWith('rs-banquet-'))
    assert.deepEqual(npcs.map((n) => n.id).sort(), ['rs-banquet-customer', 'rs-banquet-shopman'])
    for (const n of npcs) {
      assert.equal(n.zone, RICE_AND_SHINE_ID)
      assert.equal(n.pose, 'stand')
      assert.ok(NPC_LOOKS[n.look]?.era === 'banquet', n.id)
      assert.ok(inRiceAndShineLot({ minX: n.position[0], maxX: n.position[0], minZ: n.position[2], maxZ: n.position[2] }), n.id)
      // 人物站的地方是障礙物（走不到人物身上）
      assert.ok(!walkableAt(WORLD, n.position[0], n.position[2]), n.id)
    }
    assert.equal(WORLD.npcs.filter((n) => n.id.startsWith('rice-earlyRiceTrade-')).length, 3)
  })

  test('提示不互相蓋掉：每件器物與每位人物都有站得到、而且它是最近對象的位置（路人與器物只提示比較近的）', () => {
    const talkers = WORLD.npcs.filter((n) => talkForNpc('banquet', n.id) && n.zone === RICE_AND_SHINE_ID)
    assert.equal(talkers.length, 2)
    const targets = [...BANQUET_SPOTS.map((item) => ({ id: item.id, x: item.position[0], z: item.position[2], radius: item.radius })), ...talkers.map((n) => ({ id: n.id, x: n.position[0], z: n.position[2], radius: TALK_RADIUS }))]
    for (const target of targets) {
      let found = false
      for (let dx = -target.radius; dx <= target.radius && !found; dx += 0.1) {
        for (let dz = -target.radius; dz <= target.radius && !found; dz += 0.1) {
          const d = Math.hypot(dx, dz)
          if (d > target.radius - 0.2 || !walkableAt(WORLD, target.x + dx, target.z + dz)) continue
          const rival = Math.min(...targets.filter((other) => other.id !== target.id).map((other) => Math.hypot(target.x + dx - other.x, target.z + dz - other.z)))
          if (rival - d > 0.1) found = true
        }
      }
      assert.ok(found, `${target.id}：沒有它是最近對象的位置`)
    }
  })

  test('對話：夥計三句＋追問「這間店叫什麼？」、客人兩句；標示、出處、中英文齊全；虛構對白不安在真實人物或店家上', () => {
    assert.equal(RICE_TALK.length, 2)
    for (const id of ['rs-banquet-shopman', 'rs-banquet-customer']) assert.ok(talkForNpc('banquet', id), id)
    const shopman = talkForNpc('banquet', 'rs-banquet-shopman')
    assert.equal(shopman.lines.length, 3)
    assert.equal(shopman.followUps.length, 1)
    assert.ok(getInspectObject(shopman.objectId))
    for (const talk of RICE_TALK) {
      assert.ok(talk.role && talk.roleEn && talk.doing && talk.doingEn)
      for (const line of [...talk.lines, ...talk.followUps.flatMap((f) => f.lines)]) {
        assert.ok(line.text && line.textEn, talk.npcId)
        assert.ok(['sourced', 'fiction', 'folklore'].includes(line.label))
        if (line.label === 'sourced') {
          assert.ok(line.sourceIds?.length, line.text)
          for (const id of line.sourceIds) assert.ok(getSource(id), id)
        }
        // 人物不具名，也不說出唐塗薩、葉守倫或稻舍
        assert.doesNotMatch(line.text, /唐塗薩|葉守倫|稻舍/)
      }
    }
    // 1916 唐益興是單一來源：只放在追問裡，且說「現在還說不準」
    const follow = shopman.followUps[0].lines[0]
    assert.deepEqual(follow.sourceIds, ['taiwannews-2022-rice-shine'])
    assert.match(follow.text, /還說不準/)
    assert.ok(shopman.lines.every((line) => !/唐家|益興/.test(line.text)))
  })
})

describe('熱點與章節', () => {
  test('酒樓繁華有 4 個熱點（街邊、街邊米斗、進門的前店、關著的後門）；章節存在；前店的熱點站得到', () => {
    const shop = getShop(RICE_AND_SHINE_ID, 'banquet')
    assert.deepEqual(RICE_HOTSPOTS.earlyRiceTrade.map((h) => h.id), ['early-street', 'early-measure', 'early-shop', 'early-back'])
    for (const h of shop.hotspots) assert.ok(shop.chapters.some((c) => c.id === h.chapter), h.id)
    for (const h of shop.hotspots.filter((item) => ['early-shop', 'early-back'].includes(item.id))) {
      assert.ok(walkableAt(WORLD, h.point.x, h.point.z), `${h.id}：站得到`)
      assert.ok(h.labelEn && h.noteEn, h.id)
    }
    // 按 E 時器物優先：熱點要離開器物的範圍，否則熱點的介紹打不開
    for (const h of shop.hotspots.filter((item) => ['early-shop', 'early-back'].includes(item.id))) {
      for (const item of BANQUET_SPOTS) assert.ok(Math.hypot(h.point.x - item.position[0], h.point.z - item.position[2]) > item.radius, `${h.id} 在 ${item.id} 的範圍裡`)
    }
    const back = RICE_HOTSPOTS.earlyRiceTrade.find((h) => h.id === 'early-back')
    assert.match(back.note, /沒有重建/)
    assert.match(back.note, /不開放/)
  })

  test('「稻舍」的名稱與招牌仍只在 2000 年代；酒樓繁華的室內沒有現代的玻璃、軌道燈、紅陶地磚', () => {
    const shop = getShop(RICE_AND_SHINE_ID, 'banquet')
    assert.doesNotMatch(JSON.stringify([shop.name, shop.category, shop.seal, shop.hotspots.map((h) => [h.label, h.note])]), /稻舍|Rice & Shine/)
    const interior = buildEraInteriorSync('banquet', BUILDING_ID)
    const materials = interior.batches.map((b) => b.material)
    assert.ok(!materials.includes('terracotta') && !materials.includes('glassClear') && !materials.includes('woodLight'))
    assert.ok(!WORLD.signs.some((sign) => /稻舍|Rice & Shine/.test(sign.text)))
  })
})

describe('兩種畫質與效能', () => {
  const build = () => {
    const inner = new PartBuilder()
    const detail = new PartBuilder()
    buildRiceAndShineInterior(inner, { variant: 'earlyRiceTrade' }, detail)
    return { inner, detail }
  }
  const verts = (builder) => [...builder.groups.values()].reduce((n, list) => n + list.length, 0)

  test('結構與功能性內容（米箱、櫃台、麻袋、竹籮、帳桌）在主要的網格，兩種畫質都有；純裝飾的細部另外放、數量少', () => {
    const { inner, detail } = build()
    for (const material of ['wood', 'planks', 'bamboo', 'burlap']) assert.ok(inner.groups.has(material), material)
    assert.ok(verts(detail) > 0 && verts(detail) < verts(inner), '細部（竹編紋路、米粒、墨線）比主要的零件少')
    // 細部只有竹編紋路、米粒與墨線，不放結構用的木作
    for (const material of detail.groups.keys()) assert.ok(['dark', 'bamboo', 'plain'].includes(material), `細部的材質 ${material}`)
  })

  test('街景的批次數與頂點數不增加：酒樓繁華的街景仍是 20 種材質；室內按需載入、頂點數有上限；室內不產生陰影用的貼地暗影', () => {
    assert.equal(WORLD.batches.length, 20)
    const interior = buildEraInteriorSync('banquet', BUILDING_ID)
    const count = (list) => list.reduce((n, batch) => n + batch.geometry.attributes.position.count, 0)
    assert.ok(count(interior.batches) < 60000, `室內 ${count(interior.batches)}`)
    assert.ok(count(interior.detailBatches) < 20000, `細部 ${count(interior.detailBatches)}`)
    assert.ok(!interior.batches.some((batch) => batch.material === 'contact'))
    const materials = interior.batches.map((b) => b.material)
    assert.equal(new Set(materials).size, materials.length, '依材質合併，每種材質一個網格')
  })
})

test('其他年代不受影響：1930、1945、2000 的室內與熱點沿用原本的設定；各年代的資料不含酒樓繁華的器物', () => {
  for (const era of ERAS.filter((item) => ['modern', 'postwar', 'revival'].includes(item.id))) {
    const world = buildEraWorldSync(era.id)
    assert.ok(!world.npcs.some((n) => n.id.startsWith('rs-banquet-')), era.id)
  }
  const other = STREET_INSPECTABLES.filter((item) => item.id.startsWith('rs-banquet-'))
  assert.ok(other.every((item) => item.eraId === 'banquet'))
})
