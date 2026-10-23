import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { getShop, getShopsByEra } from '../src/data/shops.js'
import { getSource } from '../src/data/sources.js'
import { LANE, SHOP } from '../src/data/actionBarLayout.js'
import {
  HUANG_YUJIE_HOTSPOTS,
  MUSEUM,
  MUSEUM_ROUTE,
  MUSEUM_SITE,
  museumTableBox,
  museumToWorld,
} from '../src/data/huangYujieLayout.js'
import { HISTORIC_SHOP, MUSEUM_RECORD, ORGANIZATIONS, PENDING, PHOTO_OBSERVATIONS, SCENARIO_DESIGN, VERIFIED_FACTS } from '../src/data/huangYujieMuseum.js'
import { EXHIBIT_ATLAS, exhibitUV } from '../src/game/rendering/exhibitAtlas.js'
import { raycastBoxes, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { followAllowed, inFollowArea, indoorFollow, interiorAmount, orbitDirection, planBuildingFocus, segmentBlocked, viewerSpaceOf } from '../src/game/viewerCamera.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 黃玉階文史館（歷史商號：元珍豆醬店）：只在「老屋新生」、導演的豆花店的北鄰（從巷子看是左邊）；
 * 共用連續的騎樓（拱門）、各自的入口、碰撞與互動；一樓展間的動線、資訊熱點、鏡頭、按需載入的展間，
 * 以及資料的界線（已查證史實、照片觀察、情境設計、待核資料分開；協會與場館分開建檔）。
 */
const revival = buildEraWorldSync('revival')
const shop = getShop('huang-yujie-museum')
const actionBar = getShop('action-bar')
const zone = revival.interiors.find((item) => item.id === 'huang-yujie-museum')
const space = viewerSpaceOf(revival)
const L = (x, z) => museumToWorld(x, z)
/** 豆花店的本地座標 → 世界座標 */
const AB = (sx, sz) => ({ x: actionBar.site.x + SHOP.origin[0] - sz, z: actionBar.site.z + SHOP.origin[2] + sx })

function insideBox(p, b, pad = 0) {
  return p.x > b.minX - pad && p.x < b.maxX + pad && p.y > b.minY - pad && p.y < b.maxY + pad && p.z > b.minZ - pad && p.z < b.maxZ + pad
}

function overlaps(a, b, pad = 0.05) {
  return a.minX < b.maxX - pad && a.maxX > b.minX + pad && a.minZ < b.maxZ - pad && a.maxZ > b.minZ + pad
}

function walkableAt(world, x, z) {
  const p = { x, z }
  resolvePlayerPosition(p, PLAYER.radius, world.collision)
  return Math.hypot(p.x - x, p.z - z) < 1e-6
}

/** 朝目標直線走（每步 step 公尺，和遊戲中每個影格相同的碰撞處理）；回傳最後的位置與是否走到 */
function walkTo(world, from, to, step = 0.09) {
  const p = { x: from.x, z: from.z }
  for (let i = 0; i < 600; i++) {
    const dx = to.x - p.x
    const dz = to.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < step) {
      p.x = to.x
      p.z = to.z
      resolvePlayerPosition(p, PLAYER.radius, world.collision)
      break
    }
    p.x += (dx / d) * step
    p.z += (dz / d) * step
    resolvePlayerPosition(p, PLAYER.radius, world.collision)
  }
  return { p, reached: Math.hypot(p.x - to.x, p.z - to.z) < 0.06 }
}

function walkRoute(world, points, step) {
  let p = points[0]
  for (let i = 1; i < points.length; i++) {
    const { p: next, reached } = walkTo(world, p, points[i], step)
    assert.ok(reached, `走到第 ${i} 點（${points[i].id ?? ''}）失敗：停在 (${next.x.toFixed(2)}, ${next.z.toFixed(2)})，目標 (${points[i].x.toFixed(2)}, ${points[i].z.toFixed(2)})`)
    p = next
  }
  return p
}

/** 豆花店門前 → 拱門 → 文史館騎樓 → 入口 → 展間動線 → 回到騎樓 → 拱門 → 豆花店門前（世界座標） */
function fullRoute() {
  const passageZ = (SHOP.passage.minZ + SHOP.passage.maxZ) / 2
  const start = { ...AB(-0.1, -1.0), id: 'action-bar-door' }
  const toArch = { ...AB(-2.2, passageZ), id: 'action-bar-arch' }
  const throughArch = { ...L(1.6, passageZ), id: 'museum-arch' }
  const inside = MUSEUM_ROUTE.map((r) => ({ ...L(r.x, r.z), id: r.id }))
  return [start, toArch, throughArch, ...inside, { ...L(1.6, passageZ), id: 'museum-arch-out' }, { ...toArch, id: 'action-bar-arch-out' }, { ...start, id: 'action-bar-door-out' }]
}

/** 第三人稱鏡頭（與 CameraRig 的跟隨鏡頭相同的計算） */
function followCamera(world, p, yaw, pitch = CAMERA.pitch, distance = CAMERA.distance) {
  const found = interiorAmount(p, world.interiors)
  const k = found?.amount ?? 0
  const shot = found?.zone.camera
  const follow = indoorFollow(pitch, distance, k, shot)
  const target = { x: p.x, y: CAMERA.targetHeight, z: p.z }
  const direction = orbitDirection(yaw, follow.pitch)
  const hit = raycastBoxes(target, direction, follow.distance + 0.45, world.blockers)
  const tight = k >= 0.999 || inFollowArea(p, world.followAreas)
  let allowed = followAllowed(hit, follow.minDistance, tight)
  if (k > 0.001 && direction.y > 0.01) allowed = Math.min(allowed, Math.max(follow.minDistance, (shot.maxHeight + (1 - k) * 6 - target.y) / direction.y))
  const d = Math.min(follow.distance, allowed)
  return { x: target.x + direction.x * d, y: target.y + direction.y * d, z: target.z + direction.z * d, k }
}

describe('黃玉階文史館：只在「老屋新生」', () => {
  test('文化據點只出現在「老屋新生」；其他年代沒有文史館、招牌、展間或協會', () => {
    for (const era of ERAS) assert.equal(era.availableStores.includes('huang-yujie-museum'), era.id === 'revival', era.id)
    for (const era of ERAS.filter((item) => item.id !== 'revival')) {
      const world = buildEraWorldSync(era.id)
      assert.ok(!world.buildings.some((item) => /huang-yujie/.test(item.id) || item.storeId === 'huang-yujie-museum'), era.id)
      assert.ok(!world.signs.some((sign) => /元珍|源珍|學貫中西|豆醬店/.test(sign.text)), era.id)
      assert.ok(!world.interiors.some((item) => item.id === 'huang-yujie-museum'), era.id)
      assert.equal(buildEraInteriorSync(era.id, 'site-huang-yujie-museum').batches.length, 0, era.id)
    }
    // 沒有替其他年代另外做歷史版本
    assert.equal(shop.theme, undefined)
    assert.deepEqual(Object.keys(shop.buildingByEra), ['revival'])
  })

  test('分類是文化據點（文化展示／歷史街屋），不是餐廳：沒有食物圖鑑或點餐', () => {
    assert.equal(shop.kind, 'heritage')
    assert.match(shop.category, /文化據點/)
    assert.ok(!shop.chapters.some((chapter) => chapter.type === 'foods'))
    assert.ok(!JSON.stringify(shop).match(/價格[：:]|菜單|menu/i))
    assert.ok(!shop.hotspots.some((h) => /點餐|外帶/.test(h.label)))
    assert.ok(getShopsByEra(ERAS.find((era) => era.id === 'revival')).includes(shop))
  })

  test('名稱：場景主名稱「黃玉階文史館」、歷史商號「元珍豆醬店」，兩種店名照原樣保留', () => {
    assert.equal(shop.name, '黃玉階文史館')
    assert.equal(HISTORIC_SHOP.name, '元珍豆醬店')
    assert.deepEqual(HISTORIC_SHOP.names.map((n) => n.name), ['元珍', '源珍'])
    const signs = revival.signs
    // 立面的「元珍」：由右往左讀（不是 ltr 樣式，招牌貼圖會把字倒過來排）
    const plaque = signs.find((sign) => sign.text === '元珍')
    assert.equal(plaque.style, 'heritagePlaque')
    const green = signs.find((sign) => sign.text === '源珍' && sign.style === 'heritageGreen')
    assert.ok(green.tilt > 0.3, '綠色匾額斜掛')
    assert.ok(signs.some((sign) => sign.text === '學貫中西'))
  })
})

describe('黃玉階文史館：與導演的豆花店相鄰', () => {
  const museumBuilding = revival.buildings.find((item) => item.id === 'site-huang-yujie-museum')
  const barBuilding = revival.buildings.find((item) => item.id === 'site-action-bar')

  test('依豆花店的位置、朝向與面寬定位：同一條立面線、同一個朝向，在豆花店北側', () => {
    assert.equal(MUSEUM_SITE.rotationY, SHOP.rotationY)
    // 騎樓柱列外緣是同一條線（巷子東側的立面線）
    assert.ok(Math.abs(L(0, 0).x - AB(0, 0).x) < 1e-9)
    // 從巷子正對立面（面向東）時，左邊是北（-z）：文史館在豆花店的左邊
    const museumRight = L(MUSEUM.half, 0).z
    const barLeft = AB(-SHOP.half, 0).z
    assert.ok(museumRight < barLeft && barLeft - museumRight < 0.1, `縫 ${(barLeft - museumRight).toFixed(3)} m`)
    assert.equal(shop.facing, 'west')
    assert.equal(actionBar.facing, 'west')
    assert.equal(MUSEUM_RECORD.neighbour.right, 'action-bar')
    // 不在對面、後方或另一條街：都在巷子東側
    assert.ok(L(0, 0).x > actionBar.site.x)
    assert.ok(Math.abs(L(0, 0).x - (actionBar.site.x + LANE.half)) < 1e-9)
  })

  test('兩棟的方塊不重疊，也不覆蓋巷子的可行走範圍或其他建築', () => {
    for (const part of museumBuilding.parts) {
      for (const other of barBuilding.parts) assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, '與豆花店重疊')
    }
    const laneRect = revival.collision.walkable.find((r) => Math.abs(r.minX - (actionBar.site.x - LANE.half)) < 1e-6 && r.maxZ > 25)
    for (const part of museumBuilding.parts) assert.ok(!overlaps({ ...laneRect, minZ: actionBar.site.z + 0.1 }, part), '穿進巷子')
    const mine = revival.buildings.filter((item) => item.storeId === 'huang-yujie-museum')
    const others = revival.buildings.filter((item) => item.storeId !== 'huang-yujie-museum' && item.storeId !== 'action-bar' && !/action-bar/.test(item.id))
    for (const a of mine) {
      for (const part of a.parts) {
        for (const o of others) for (const other of o.parts) assert.ok(!overlaps(part, other) || part.maxY <= other.minY || part.minY >= other.maxY, `${a.id} 與 ${o.id} 重疊`)
      }
    }
  })

  test('同一個街道鏡頭看得到兩棟的立面', () => {
    // 站在巷子西側、文史館與豆花店交界的正對面，面向東
    const eye = { x: actionBar.site.x - LANE.half + 0.6, y: 1.6, z: (L(MUSEUM.half, 0).z + AB(-SHOP.half, 0).z) / 2 }
    const fov = (CAMERA.fov ?? 50) * (Math.PI / 180)
    const halfH = Math.atan(Math.tan(fov / 2) * (16 / 9))
    for (const target of [L(0, 0), AB(0, 0)]) {
      const angle = Math.atan2(target.z - eye.z, target.x - eye.x)
      assert.ok(Math.abs(angle) < halfH, `角度 ${angle.toFixed(2)}`)
      assert.ok(!segmentBlocked(eye, { x: target.x - 0.3, y: 3, z: target.z }, revival.blockers), '視線被擋住')
    }
  })

  test('兩棟各有入口、碰撞與互動；兩棟的室內沒有打通', () => {
    assert.ok(revival.interiors.some((item) => item.id === 'action-bar'))
    assert.ok(zone)
    // 從文史館展間往豆花店（+x 本地）走：停在側牆前
    const wall = walkTo(revival, L(1.2, -5.9), L(4.0, -5.9))
    assert.ok(!wall.reached)
    assert.ok(wall.p.z < L(MUSEUM.room.maxX, 0).z, '沒有穿進豆花店')
    // 互動點：文史館的熱點都在文史館裡；豆花店的互動點在它的店裡
    const placement = getShopPlacement(shop)
    for (const hotspot of placement.hotspots.filter((item) => !item.clickOnly)) {
      assert.ok(walkableAt(revival, hotspot.interactionPoint.x, hotspot.interactionPoint.z), hotspot.id)
      const bar = getShopPlacement(actionBar).interactionPoint
      assert.ok(Math.hypot(hotspot.interactionPoint.x - bar.x, hotspot.interactionPoint.z - bar.z) > actionBar.interaction.radius + hotspot.radius + 0.5, hotspot.id)
    }
  })
})

describe('黃玉階文史館：騎樓與展間的動線（碰撞）', () => {
  for (const step of [0.15, 0.09, 0.05]) {
    test(`豆花店門前 → 拱門 → 文史館入口 → 展示牆、長桌、層架、醬缸、茶席 → 回到街上（每步 ${step} m）`, () => {
      walkRoute(revival, fullRoute(), step)
    })
  }

  test('連續進出 5 次：不卡在門、柱、花槽或展櫃', () => {
    let route = fullRoute()
    for (let i = 0; i < 5; i++) {
      const end = walkRoute(revival, route, 0.09)
      route = [{ ...end, id: `round-${i}` }, ...route.slice(1)]
    }
  })

  test('從巷子經花槽右端的通道也能走進騎樓；花槽、圓柱、醬缸、展示物都不能穿越', () => {
    const gap = (MUSEUM.planter.maxX + MUSEUM.half - MUSEUM.pier) / 2
    const lane = L(gap, 1.4)
    const { reached } = walkTo(revival, lane, L(gap, -0.9))
    assert.ok(reached, '花槽右端的通道')
    assert.ok(!walkableAt(revival, L(-0.5, 0.2).x, L(-0.5, 0.2).z), '花槽')
    for (const x of MUSEUM.columns) assert.ok(!walkableAt(revival, L(x, MUSEUM.columnZ).x, L(x, MUSEUM.columnZ).z), `柱 ${x}`)
    for (const [x, z, name] of [
      [-1.85, -2.9, '醬缸'],
      [1.9, -5.0, '層架'],
      [1.8, -2.8, '商號陳列'],
      [-0.1, -4.9, '長桌'],
      [-1.9, -8.4, '茶席'],
      [0.9, -8.9, '小展桌'],
    ]) {
      assert.ok(!walkableAt(revival, L(x, z).x, L(x, z).z), name)
    }
  })

  test('中央通道至少兩個角色身寬；長桌間與後方的通道都過得去', () => {
    const a = museumTableBox(MUSEUM.tables[0])
    assert.ok(a.minX - (MUSEUM.room.minX + 0.07) >= PLAYER.radius * 4, `左側通道 ${(a.minX - MUSEUM.room.minX).toFixed(2)} m`)
    assert.ok(MUSEUM.shelves.minX - a.maxX > PLAYER.radius * 2 + 0.3)
    const b = museumTableBox(MUSEUM.tables[1])
    assert.ok(a.minZ - b.maxZ > PLAYER.radius * 2 + 0.1, '兩張長桌之間')
    assert.ok(MUSEUM.desk.maxZ < b.minZ - PLAYER.radius * 2 - 0.3, '長桌與小展桌之間')
  })

  test('在展間裡切換到其他年代：人物被推到可以走的街道上，不留在原地或掉出地圖', () => {
    for (const eraId of ['modern', 'qing-port']) {
      const world = buildEraWorldSync(eraId)
      for (const start of [L(0, -5.9), L(-1.1, -8.0), L(0.5, -1.0)]) {
        const p = { ...start }
        resolvePlayerPosition(p, PLAYER.radius, world.collision)
        assert.ok(walkableAt(world, p.x, p.z), `${eraId} 推到 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
        assert.ok(!world.collision.walkable.some((r) => start.x > r.minX && start.x < r.maxX && start.z > r.minZ && start.z < r.maxZ), '原地在其他年代不能走')
      }
    }
  })
})

describe('黃玉階文史館：資訊熱點、介紹鏡頭與觀賞模式', () => {
  const placement = getShopPlacement(shop)

  test('動線上每一站都有對應的熱點：入口、人物、展板、醬缸、茶席', () => {
    const expect = { arcade: 'facade', portrait: 'portrait', 'edu-wall': 'board', 'jar-area': 'jar-area', tea: 'tea' }
    for (const [id, hotspotId] of Object.entries(expect)) {
      const r = MUSEUM_ROUTE.find((item) => item.id === id)
      const p = L(r.x, r.z)
      let nearest = null
      let best = Infinity
      for (const h of placement.hotspots.filter((item) => !item.clickOnly)) {
        const d = Math.hypot(p.x - h.interactionPoint.x, p.z - h.interactionPoint.z)
        if (d < h.radius && d < best) {
          best = d
          nearest = h.id
        }
      }
      assert.equal(nearest, hotspotId, id)
    }
  })

  test('可點擊的物件：中央匾額、醬缸、木梁、文史展板（以及人物牆、層架、茶席、學貫中西）', () => {
    const subs = revival.buildings.filter((item) => item.storeId === 'huang-yujie-museum' && item.detail)
    const byHotspot = Object.fromEntries(subs.map((item) => [item.hotspot, item]))
    for (const id of ['plaque', 'jars', 'beams', 'board', 'portrait', 'shelves', 'tea', 'study', 'jar-area']) assert.ok(byHotspot[id], id)
    for (const h of HUANG_YUJIE_HOTSPOTS) assert.ok(shop.chapters.some((chapter) => chapter.id === h.chapter), h.id)
  })

  test('每個熱點的介紹鏡頭都不在方塊裡，看得到注視點', () => {
    for (const h of placement.hotspots) {
      const cam = h.camera.position
      assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `${h.id} ${JSON.stringify(cam)}`)
      assert.ok(!segmentBlocked(cam, h.camera.target, revival.blockers.filter((box) => !insideBox(h.camera.target, box, 0.02))), `${h.id} 被擋住`)
    }
  })

  test('觀賞模式：聚焦立面、拱窗與陶飾、木梁、展板、層架、醬缸與茶席，鏡頭不在方塊裡、不離開範圍', () => {
    const records = revival.buildings.filter((item) => item.storeId === 'huang-yujie-museum')
    for (const building of records) {
      const plan = planBuildingFocus(building, revival.blockers, { yaw: -Math.PI / 2, aspect: 4 / 3, fov: 50, space })
      const cam = plan.camera ?? plan.position
      if (cam) assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `${building.id} 鏡頭在方塊裡`)
      assert.ok(plan.distance > 0.5, building.id)
    }
  })

  test('在騎樓、拱門與展間，各個方向的跟隨鏡頭都不在牆裡', () => {
    const points = [L(0.6, -1.0), L(1.9, (SHOP.passage.minZ + SHOP.passage.maxZ) / 2), L(0, -2.5), L(-1.45, -5.6), L(-0.1, -6.0), L(1.15, -5.8), L(-1.05, -7.95)]
    for (const p of points) {
      for (let i = 0; i < 12; i++) {
        const cam = followCamera(revival, p, (i / 12) * Math.PI * 2)
        assert.ok(!revival.blockers.some((box) => insideBox(cam, box)), `(${p.x.toFixed(1)}, ${p.z.toFixed(1)}) yaw ${i}`)
      }
    }
    const inside = interiorAmount(L(0, -5.9), revival.interiors)
    assert.equal(inside.zone.id, 'huang-yujie-museum')
    assert.ok(inside.amount > 0.999)
  })
})

describe('黃玉階文史館：一樓展間（按需載入）', () => {
  const interior = buildEraInteriorSync('revival', zone.building)

  test('展間只在接近時另外產生，範圍在展間裡；兩種畫質都保留木梁、醬缸、展板與長桌', () => {
    assert.ok(interior.batches.length > 8)
    const materials = new Set(interior.batches.map((batch) => batch.material))
    for (const material of ['wood', 'planks', 'exhibit', 'plain', 'cloth', 'bamboo']) assert.ok(materials.has(material), material)
    for (const batch of [...interior.batches, ...interior.detailBatches]) {
      const box = batch.geometry.boundingBox
      assert.ok(box.min.x > zone.minX - 0.3 && box.max.x < zone.maxX + 0.3, batch.material)
      assert.ok(box.min.z > zone.minZ - 0.3 && box.max.z < zone.maxZ + 0.3, batch.material)
      assert.ok(box.max.y <= MUSEUM.boards + 0.05, batch.material)
    }
    const verts = (batches) => batches.reduce((sum, batch) => sum + batch.geometry.attributes.position.count, 0)
    assert.ok(verts(interior.batches) < 120000, `室內頂點數 ${verts(interior.batches)}`)
    // 細部只是少量的小擺飾
    assert.ok(verts(interior.detailBatches) < verts(interior.batches) * 0.25)
    assert.ok(zone.loadRadius > 0 && zone.showRadius >= zone.loadRadius)
    // 豆花店的室內不包含文史館，反之亦然
    const bar = revival.interiors.find((item) => item.id === 'action-bar')
    for (const batch of buildEraInteriorSync('revival', bar.building).batches) assert.ok(batch.geometry.boundingBox.min.z > zone.maxZ - 0.05, batch.material)
  })

  test('展板圖集：每一塊都在圖集裡、彼此不重疊', () => {
    const regions = Object.entries(EXHIBIT_ATLAS.regions)
    for (const [name, [x, y, w, h]] of regions) {
      assert.ok(x >= 0 && y >= 0 && x + w <= EXHIBIT_ATLAS.width && y + h <= EXHIBIT_ATLAS.height, name)
      const [u0, v0, u1, v1] = exhibitUV(name)
      assert.ok(u0 >= 0 && u1 <= 1 && v0 >= 0 && v1 <= 1 && u1 > u0 && v1 > v0, name)
    }
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const [a, [ax, ay, aw, ah]] = regions[i]
        const [b, [bx, by, bw, bh]] = regions[j]
        assert.ok(ax + aw <= bx || bx + bw <= ax || ay + ah <= by || by + bh <= ay, `${a} 與 ${b} 重疊`)
      }
    }
  })
})

describe('黃玉階文史館：介紹內容與資料界線', () => {
  test('四個展示主題各有 80–120 字的摘要，附來源；新整理內容標示「網站延伸整理」', () => {
    for (const id of ['huang', 'yuanzhen', 'reform', 'association']) {
      const chapter = shop.chapters.find((item) => item.id === id)
      const length = [...chapter.summary.text].length
      assert.ok(length >= 80 && length <= 120, `${id} 摘要 ${length} 字`)
      assert.ok(chapter.sourceIds.length > 0, id)
      for (const sourceId of chapter.sourceIds) assert.ok(getSource(sourceId), sourceId)
      assert.equal(chapter.summary.label, undefined, `${id} 使用預設標示「網站延伸整理」`)
    }
  })

  test('史料記錄包含 title、publisher、url、sourceDate、accessedAt、supports', () => {
    for (const id of ['judicial-2024-tcda', 'tcmb-huang-yujie', 'ncl-huang-yujie', 'ith-primary-education', 'merit-2026-huang-yujie']) {
      const source = getSource(id)
      for (const key of ['title', 'publisher', 'url', 'accessedAt']) assert.ok(source[key], `${id}.${key}`)
      assert.ok('sourceDate' in source, `${id}.sourceDate`)
      assert.ok(Array.isArray(source.supports) && source.supports.length > 0, `${id}.supports`)
      assert.match(source.url, /^https:\/\//)
    }
    assert.equal(getSource('merit-2026-huang-yujie').sourceDate, '2026-07-13')
    assert.equal(getSource('judicial-2024-tcda').sourceDate, '2024-05-16')
  })

  test('已查證史實、照片觀察、情境設計與待核資料分開存放', () => {
    assert.ok(VERIFIED_FACTS.every((fact) => fact.sourceIds.length > 0 && fact.sourceIds.every((id) => getSource(id))))
    assert.ok(PHOTO_OBSERVATIONS.every((item) => item.photos.length > 0 && !item.sourceIds))
    assert.ok(SCENARIO_DESIGN.length > 0 && SCENARIO_DESIGN.every((item) => !item.sourceIds))
    assert.ok(PENDING.length > 0)
  })

  test('未確認的欄位留空，不以黃玉階的遷居年份或協會的登記日代替', () => {
    for (const key of ['buildingYear', 'openingDate', 'address', 'openingHours', 'operator']) assert.equal(MUSEUM_RECORD[key], null, key)
    assert.equal(shop.year, null)
    assert.equal(HISTORIC_SHOP.foundedYear, null)
    const text = JSON.stringify(shop)
    assert.ok(!/1882年(興建|開館|建造)|(興建|開館)[^。]*2024/.test(text))
    assert.ok(!/營業時間|開放時間：\d/.test(text))
  })

  test('協會與場館分開建檔：只列為相關組織資料，營運關係待核實', () => {
    const org = ORGANIZATIONS[0]
    assert.equal(org.name, '社團法人臺灣文化事業發展協會')
    assert.equal(org.permitDate, '2023-10-18')
    assert.equal(org.registrationDate, '2024-05-16')
    assert.equal(org.relationToMuseum, null)
    const chapter = shop.chapters.find((item) => item.id === 'association')
    assert.match(chapter.tab, /相關組織資料/)
    assert.ok(chapter.facts.some((fact) => fact.value === '待核實'))
    // 其他章節不提到協會；場景裡沒有協會的招牌
    for (const other of shop.chapters.filter((item) => !['association', 'sources'].includes(item.id))) {
      assert.ok(!JSON.stringify(other).includes('協會'), other.id)
    }
    assert.ok(!revival.signs.some((sign) => sign.text.includes('協會')))
    assert.ok(!/館方[^，。]*協會|協會[^，。]*(主辦|館方|所有權人)(?!、)/.test(JSON.stringify(shop.chapters.filter((c) => c.id !== 'association'))))
  })

  test('醫療記載只是歷史，不提供療效或配方；元珍與源珍並列來源；不宣稱這棟建築以前是學校', () => {
    const text = JSON.stringify(shop.chapters)
    assert.match(text, /不代表任何療法在今天的效果/)
    assert.ok(!/藥方：|療效保證|可以治療/.test(text))
    assert.match(text, /元珍/)
    assert.match(text, /源珍/)
    assert.match(text, /不代表這棟建築以前是學校|就推論這棟建築以前是學校/)
    // 執照年份兩種記載並列
    assert.match(text, /1897/)
    assert.match(text, /1901/)
  })
})
