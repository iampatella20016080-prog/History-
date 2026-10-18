import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS, getEra } from '../src/data/eras.js'
import { getShop } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { facadeOf, planBuildingFocus, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { getLotPlan } from '../src/game/world/lots.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 滋養豆餡舖：店家資料、轉角建築的位置（只在「老屋新生」）、碰撞與互動範圍、鏡頭與觀賞模式。
 */
const SHOP_ID = 'zi-yang'
const REPLACED = ['north-0', 'north-1', 'plaza--1-1']
const shop = getShop(SHOP_ID)
const revival = buildEraWorldSync('revival')
const building = revival.buildings.find((item) => item.storeId === SHOP_ID)

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function walkableAt(world, x, z) {
  const position = { x, z }
  resolvePlayerPosition(position, PLAYER.radius, world.collision)
  return Math.hypot(position.x - x, position.z - z) < 1e-6
}

describe('滋養豆餡舖：店家資料', () => {
  test('已開放的店家，只出現在「老屋新生」', () => {
    assert.equal(shop.status, 'open')
    assert.equal(shop.year, 1953)
    assert.deepEqual(Object.keys(shop.buildingByEra), ['revival'])
    for (const era of ERAS) {
      assert.equal(era.availableStores.includes(SHOP_ID), era.id === 'revival', era.id)
    }
  })

  test('四個章節：品牌歷史、建築特色、代表食品、參考文獻', () => {
    assert.deepEqual(
      shop.chapters.map((chapter) => [chapter.tab, chapter.type]),
      [
        ['品牌歷史', 'text'],
        ['建築特色', 'text'],
        ['代表食品', 'foods'],
        ['參考文獻', 'sources'],
      ],
    )
    const foods = shop.chapters.find((chapter) => chapter.type === 'foods')
    assert.deepEqual(
      foods.items.map((item) => item.name),
      ['草莓大福', '最中', '銅鑼燒', '羊羹', '鳳梨酥'],
    )
  })

  test('歷史說明區分 1953 年創立於南京西路與後來遷入迪化街，不把現在的建築當成原始店面', () => {
    const [history, architecture] = shop.chapters
    const historyText = [history.lead, ...history.paragraphs].join('')
    assert.match(historyText, /1953/)
    assert.match(historyText, /南京西路/)
    assert.match(historyText, /遷入/)
    const architectureText = [architecture.lead, ...architecture.paragraphs].join('')
    assert.match(architectureText, /不是滋養1953年的原始店面/)
    assert.match(shop.eraNotes.revival, /並不是1953年的原始店面/)
    // 未查證的建築年代不寫成事實
    assert.ok(architecture.facts.some((fact) => fact.label === '興建年代' && /未查證/.test(fact.value)))
  })

  test('引用的文獻都存在，而且都有網址', () => {
    const ids = new Set(shop.chapters.flatMap((chapter) => chapter.sourceIds ?? []))
    assert.ok(ids.size >= 3)
    for (const id of ids) {
      const source = getSource(id)
      assert.ok(source, id)
      assert.match(source.url, /^https:\/\//)
    }
  })
})

describe('滋養豆餡舖：轉角建築的位置', () => {
  test('不改變五個年代共用的地段切分（斜向的店面不預留街屋地段）', () => {
    const ids = getLotPlan().lots.map((lot) => lot.id)
    for (const id of REPLACED) assert.ok(ids.includes(id), id)
    assert.ok(!ids.includes(`store-${SHOP_ID}`))
  })

  test('只在「老屋新生」取代街屋列西端的兩塊地段與廣場北側的一間貨棧；其他年代不變', () => {
    for (const era of ERAS) {
      const layout = createEraLayout(getEra(era.id))
      const ids = layout.buildings.map((item) => item.id)
      const site = layout.buildings.find((item) => item.storeId === SHOP_ID)
      if (era.id === 'revival') {
        for (const id of REPLACED) assert.ok(!ids.includes(id), `${era.id} 仍有 ${id}`)
        assert.ok(site)
        assert.deepEqual([site.x, site.z, site.rotationY], [shop.site.x, shop.site.z, shop.site.rotationY])
      } else {
        for (const id of REPLACED) assert.ok(ids.includes(id), `${era.id} 少了 ${id}`)
        assert.equal(site, undefined, era.id)
        assert.ok(!buildEraWorldSync(era.id).signs.some((sign) => sign.text === '滋養豆餡舖'), era.id)
      }
    }
  })

  test('轉角建築不和其他建築重疊（包含隔壁的林華泰茶行）', () => {
    for (const other of revival.buildings) {
      if (other === building) continue
      for (const a of building.parts) {
        for (const b of other.parts) {
          const overlap =
            Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) > 0.05 &&
            Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ) > 0.05 &&
            Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY) > 0.05
          assert.ok(!overlap, `與 ${other.id} 重疊`)
        }
      }
    }
  })

  test('立面上有「滋養豆餡舖」招牌，以及「滋養」的遮雨棚與布旗', () => {
    assert.ok(revival.signs.some((sign) => sign.text === '滋養豆餡舖' && sign.style === 'engraved'))
    assert.ok(revival.signs.filter((sign) => sign.text === '滋養' && sign.style === 'awningBlack').length >= 2)
    assert.ok(revival.banners.filter((banner) => banner.text === '滋養').length >= 2)
    assert.ok(revival.signs.some((sign) => sign.text === '涼州街'))
  })
})

describe('滋養豆餡舖：碰撞、互動與鏡頭', () => {
  const placement = getShopPlacement(shop)

  test('涼州街與轉角前的人行道可以行走；建築與騎樓內部不行', () => {
    assert.ok(walkableAt(revival, -36.4, -14), '涼州街')
    assert.ok(walkableAt(revival, -36.4, -9), '涼州街口')
    assert.ok(walkableAt(revival, -33.2, -3.6), '轉角人行道')
    assert.ok(!walkableAt(revival, -30, -10), '建築內部')
    assert.ok(!walkableAt(revival, -33.1, -12), '涼州街側的騎樓')
    // 其他年代的這個位置仍是貨棧
    assert.ok(!walkableAt(buildEraWorldSync('modern'), -36.4, -14))
  })

  test('從河岸廣場可以一路走進涼州街（中間沒有被腳踏車或柱子擋住）', () => {
    const position = { x: -38, z: 0 }
    for (const [x, z] of [[-36.4, -4], [-36.4, -8], [-36.4, -11], [-36.4, -15]]) {
      for (let k = 0; k < 40; k++) {
        position.x += (x - position.x) * 0.15
        position.z += (z - position.z) * 0.15
        resolvePlayerPosition(position, PLAYER.radius, revival.collision)
      }
      assert.ok(Math.hypot(position.x - x, position.z - z) < 0.3, `卡在 (${position.x.toFixed(2)}, ${position.z.toFixed(2)})，目標 (${x}, ${z})`)
    }
  })

  test('互動位置在轉角前的人行道上；從名錄前往時人物站的位置可以行走', () => {
    const p = placement.interactionPoint
    assert.ok(walkableAt(revival, p.x + placement.forward.x * 0.5, p.z + placement.forward.z * 0.5))
    // 從迪化街與河岸廣場走近時，都在互動範圍內
    const radius = shop.interaction.radius
    assert.ok(Math.hypot(p.x - -32.2, p.z - -2.2) < radius, '迪化街')
    assert.ok(Math.hypot(p.x - -34.8, p.z - -4.6) < radius, '河岸廣場')
  })

  test('店名提示與屋頂標記的錨點在建築外面（提示在騎樓開口上緣）', () => {
    const [px, py, pz] = revival.stores[SHOP_ID].anchors.prompt
    const prompt = { x: px, y: py, z: pz }
    assert.ok(py > 3 && py < 4.5)
    assert.ok(!revival.blockers.some((box) => insideBox(prompt, box)))
    const marker = revival.stores[SHOP_ID].anchors.marker
    assert.ok(marker[1] > 13)
  })

  test('介紹的鏡頭在路口，不在建築裡，看得到店面', () => {
    const { position, target } = placement.camera
    assert.ok(!revival.blockers.some((box) => insideBox(position, box)))
    const others = revival.blockers.filter((box) => !building.parts.includes(box))
    const dx = target.x - position.x
    const dy = target.y - position.y
    const dz = target.z - position.z
    const length = Math.hypot(dx, dy, dz)
    const hit = raycastBoxes(position, { x: dx / length, y: dy / length, z: dz / length }, length, others)
    assert.ok(hit >= length - 1e-6, '被其他建築或樹擋住')
  })

  test('觀賞模式聚焦斜切的轉角立面：鏡頭在路口那一側、不穿牆', () => {
    const facade = facadeOf(building)
    assert.ok(facade.forward.x < -0.7 && facade.forward.z > 0.7, '轉角朝西南')
    assert.ok(Math.abs(facade.center.x - -31.7) < 0.2 && Math.abs(facade.center.z - -5.1) < 0.2)
    const plan = planBuildingFocus(building, revival.blockers, { yaw: 0, aspect: 16 / 9, fov: 42 })
    const direction = orbitDirection(plan.yaw, plan.pitch)
    const camera = {
      x: plan.target.x + direction.x * plan.distance,
      y: plan.target.y + direction.y * plan.distance,
      z: plan.target.z + direction.z * plan.distance,
    }
    const front = (camera.x - facade.center.x) * facade.forward.x + (camera.z - facade.center.z) * facade.forward.z
    assert.ok(front > 3, `前方 ${front.toFixed(2)} m`)
    assert.ok(raycastBoxes(plan.target, direction, plan.distance, revival.blockers) >= plan.distance - 1e-6)
  })
})
