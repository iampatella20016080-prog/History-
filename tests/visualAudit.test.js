import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { routeFiguresOfEra } from '../src/data/routeFigures.js'
import { getShopBuilding, getShopsByEra } from '../src/data/shops.js'
import { PartBuilder } from '../src/game/builders/PartBuilder.js'
import { buildArcadeBuilding } from '../src/game/builders/arcade.js'
import { buildShophouse } from '../src/game/builders/shophouse.js'
import { groundAt, resolvePlayerPosition } from '../src/game/collision.js'
import { CAMERA, PLAYER } from '../src/game/config.js'
import { SIGN_STYLES, signDisplayOrder } from '../src/game/rendering/signTexture.js'
import { cameraTooCloseToCharacter, followDistance, indoorFollow, interiorAmount, orbitDirection } from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'
import { createEraLayout } from '../src/game/world/eraLayout.js'
import { getShopPlacement } from '../src/game/world/placement.js'

/**
 * 畫面審查（第 9 階段）：五個年代、兩種畫質的固定視角截圖（tests/e2e/lookbook.e2e.mjs 的 SET=audit）找到的瑕疵，
 * 修正後的回歸測試。清單見 docs/research/visual-audit.md。
 */
const worlds = Object.fromEntries(ERAS.map((era) => [era.id, buildEraWorldSync(era.id)]))

/** 室內範圍的各塊（沒有 parts 的室內就是範圍本身） */
const partsOf = (zone) => zone.parts ?? [{ ...zone, level: zone.level ?? 0 }]

/** 入口範圍往門外延伸 reach 公尺（鏡頭從門口退到門外的街上是正常的） */
function entryReach(zone, reach) {
  const { entry, door } = zone
  const cx = (entry.minX + entry.maxX) / 2 - door.x
  const cz = (entry.minZ + entry.maxZ) / 2 - door.z
  const r = { ...entry }
  if (Math.abs(cx) > Math.abs(cz)) cx > 0 ? (r.maxX += reach) : (r.minX -= reach)
  else cz > 0 ? (r.maxZ += reach) : (r.minZ -= reach)
  return r
}

/**
 * 同一棟建築的室內（各塊與入口範圍）的外框：跟隨鏡頭只能在這個範圍裡，
 * 出了外框就是退到後牆或側牆外面（例如清末林華泰的「最裡面看門口」只拍到後牆的外面）
 */
function buildingFrame(world, building) {
  const rects = world.interiors.filter((zone) => zone.building === building).flatMap((zone) => [...partsOf(zone), ...(zone.entry && zone.door ? [entryReach(zone, zone.camera.distance)] : [])])
  return {
    minX: Math.min(...rects.map((r) => r.minX)),
    maxX: Math.max(...rects.map((r) => r.maxX)),
    minZ: Math.min(...rects.map((r) => r.minZ)),
    maxZ: Math.max(...rects.map((r) => r.maxZ)),
  }
}

describe('室內的跟隨鏡頭不退到牆外', () => {
  for (const era of ERAS) {
    const world = worlds[era.id]
    for (const zone of world.interiors) {
      test(`${era.id}／${zone.id}`, () => {
        const frame = buildingFrame(world, zone.building)
        const escaped = []
        let samples = 0
        for (const part of partsOf(zone)) {
          const level = part.levels ? part.levels[0] : (part.level ?? 0)
          for (let fx = 0.1; fx < 0.95; fx += 0.2) {
            for (let fz = 0.1; fz < 0.95; fz += 0.2) {
              const p = { x: part.minX + (part.maxX - part.minX) * fx, y: 0, z: part.minZ + (part.maxZ - part.minZ) * fz }
              const moved = { ...p }
              resolvePlayerPosition(moved, PLAYER.radius, world.collision, level)
              // 只看人物站得到、而且確實在這個室內的位置
              if (Math.hypot(moved.x - p.x, moved.z - p.z) > 0.01 || interiorAmount(p, world.interiors, level)?.zone !== zone) continue
              const floorY = groundAt(p, world.collision, level).y
              for (let a = 0; a < 16; a++) {
                for (const pitch0 of [CAMERA.minPitch, CAMERA.pitch, CAMERA.maxPitch]) {
                  samples++
                  const { pitch, distance: wanted, minDistance } = indoorFollow(pitch0, CAMERA.distance, 1, zone.camera)
                  const dir = orbitDirection((a / 16) * Math.PI * 2, pitch)
                  const target = { x: p.x, y: floorY + CAMERA.targetHeight, z: p.z }
                  let allowed = followDistance(target, dir, wanted, minDistance, world.blockers, true)
                  if (dir.y > 0.01) allowed = Math.min(allowed, Math.max(minDistance, (floorY + zone.camera.maxHeight - target.y) / dir.y))
                  const d = Math.min(wanted, allowed)
                  const c = { x: target.x + dir.x * d, z: target.z + dir.z * d }
                  const inside = c.x >= frame.minX - 0.1 && c.x <= frame.maxX + 0.1 && c.z >= frame.minZ - 0.1 && c.z <= frame.maxZ + 0.1
                  if (!inside) escaped.push(`人物 (${p.x.toFixed(2)}, ${p.z.toFixed(2)}) → 鏡頭 (${c.x.toFixed(2)}, ${c.z.toFixed(2)})`)
                }
              }
            }
          }
        }
        assert.ok(samples > 0, '室內至少有一個站得到的位置')
        assert.deepEqual(escaped.slice(0, 5), [], `${escaped.length}/${samples} 個鏡頭位置在室內外框外`)
      })
    }
  }
})

describe('招牌的字序', () => {
  test('由右往左的招牌：中文倒過來排，英文維持由左往右（寶順洋行的「Dodd & Co.」不再變成「.oC & ddoD」）', () => {
    assert.equal(signDisplayOrder([...'Dodd & Co. 寶順洋行']).join(''), '行洋順寶 Dodd & Co.')
    assert.equal(signDisplayOrder([...'林復振']).join(''), '振復林')
    assert.equal(signDisplayOrder([...'RICE & SHINE'], true).join(''), 'RICE & SHINE')
  })

  test('五個年代街景裡的招牌：每一段英文都照原本的順序出現在畫面上', () => {
    for (const era of ERAS) {
      for (const sign of worlds[era.id].signs) {
        if (sign.vertical) continue
        const style = SIGN_STYLES[sign.style ?? 'wood'] ?? SIGN_STYLES.wood
        const shown = signDisplayOrder([...sign.text], style.ltr).join('')
        for (const word of sign.text.match(/[A-Za-z0-9][A-Za-z0-9.&'’-]*/g) ?? []) {
          assert.ok(shown.includes(word), `${era.id}「${sign.text}」顯示成「${shown}」`)
        }
      }
    }
  })
})

describe('按 E 探索店家時的鏡頭', () => {
  /** 線段 a→b 在高度 h 以下的部分，到垂直桿 (x, z) 的最近水平距離 */
  function poleDistance(a, b, x, z, h) {
    let best = Infinity
    for (let i = 0; i <= 200; i++) {
      const t = i / 200
      const y = a.y + (b.y - a.y) * t
      if (y > h) continue
      best = Math.min(best, Math.hypot(a.x + (b.x - a.x) * t - x, a.z + (b.z - a.z) * t - z))
    }
    return best
  }

  test('鏡頭與店面之間沒有路燈桿（林復振在酒樓繁華以後原本正好在 x = 8 的路燈旁）', () => {
    for (const era of ERAS) {
      const lamps = createEraLayout(era).lamps ?? []
      for (const shop of getShopsByEra(era).filter((item) => item.status === 'open')) {
        const { position, target } = getShopPlacement(shop).camera
        // 只看前 70%（注視點附近就是店面本身）
        const mid = position.clone().lerp(target, 0.7)
        for (const lamp of lamps) {
          const d = poleDistance(position, mid, lamp.position[0], lamp.position[2], 4.8)
          assert.ok(d > 0.45, `${era.id}／${shop.id}：路燈 (${lamp.position[0]}, ${lamp.position[2]}) 離視線 ${d.toFixed(2)} 公尺`)
        }
      }
    }
  })

  test('鏡頭與店面之間沒有路線人物擋著（好粿緣的鏡頭原本從壽粿的阿伯頭上掠過）', () => {
    for (const era of ERAS) {
      const figures = routeFiguresOfEra(era.id)
      for (const shop of getShopsByEra(era).filter((item) => item.status === 'open')) {
        const { position, target } = getShopPlacement(shop).camera
        const mid = position.clone().lerp(target, 0.7)
        for (const figure of figures) {
          const d = poleDistance(position, mid, figure.position[0], figure.position[1], 2.1)
          assert.ok(d > 0.8, `${era.id}／${shop.id}：路線人物 ${figure.id} 離視線 ${d.toFixed(2)} 公尺`)
        }
      }
    }
  })

  test('沿街店家的鏡頭站在街上，不在對街的店屋裡（慈聖宮原本用預設距離 9，鏡頭落在北側店屋的立面上）', () => {
    for (const era of ERAS) {
      for (const shop of getShopsByEra(era).filter((item) => item.status === 'open')) {
        const { origin, camera } = getShopPlacement(shop)
        if (Math.abs(origin.z) !== 4.5) continue
        assert.ok(Math.abs(camera.position.z) < 4.3, `${era.id}／${shop.id}：鏡頭在 z = ${camera.position.z.toFixed(2)}`)
      }
    }
  })
})

describe('騎樓上方的橫招牌沒有被立面構件擋住', () => {
  /** 建一棟洋樓，記下所有沒有旋轉的方塊（本地座標） */
  function buildWithBoxes(cfg) {
    const b = new PartBuilder()
    const boxes = []
    const box = b.box.bind(b)
    b.box = (material, size, position = [0, 0, 0], options = {}) => {
      if (!options.rotation?.some((r) => r !== 0)) {
        const [w, h, d] = size
        const [x, y, z] = position
        boxes.push({ material, minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2, maxZ: z + d / 2 })
      }
      return box(material, size, position, options)
    }
    buildArcadeBuilding(b, { seed: 1, ...cfg })
    return { signs: b.signs, boxes }
  }

  test('壁柱、鰭片（高度超過 1 公尺的直立構件）不從招牌前面穿過（酒樓繁華以後的王有記茶行、摩登的波麗路）', () => {
    for (const era of ERAS) {
      for (const shop of getShopsByEra(era)) {
        const building = getShopBuilding(shop, era.id) ?? shop.building
        if (!['baroque', 'deco', 'postwar'].includes(building?.archetype)) continue
        const { signs, boxes } = buildWithBoxes(building)
        for (const sign of signs.filter((item) => !item.vertical && !item.rotationY)) {
          const [sx, sy, sz] = sign.position
          for (const k of boxes) {
            if (k.maxY - k.minY < 1 || k.maxZ <= sz + 0.002) continue
            const ox = Math.min(sx + sign.width / 2, k.maxX) - Math.max(sx - sign.width / 2, k.minX)
            const oy = Math.min(sy + sign.height / 2, k.maxY) - Math.max(sy - sign.height / 2, k.minY)
            assert.ok(ox <= 0.04 || oy <= 0.04, `${era.id}／${shop.id}「${sign.text}」前面有 ${k.material} 構件（x ${k.minX.toFixed(2)}–${k.maxX.toFixed(2)}）`)
          }
        }
      }
    }
  })
})

describe('布幡掛在竹竿下面', () => {
  test('街屋與洋樓的布幡上緣不高過竹竿（街屋的布幡原本中心在竹竿高度，上半截穿過雨棚）', () => {
    for (const [build, cfg] of [
      [buildShophouse, { width: 4.2, depth: 9, floors: 2, banner: { text: '藥' }, seed: 3 }],
      [buildShophouse, { width: 4.2, depth: 9, floors: 1, banner: { text: '布' }, hangingSign: { text: '布行', side: 'right' }, seed: 5 }],
      [buildArcadeBuilding, { archetype: 'baroque', width: 5, floors: 2, banner: { text: '酒' }, seed: 1 }],
    ]) {
      const b = new PartBuilder()
      const poles = []
      const cylinder = b.cylinder.bind(b)
      b.cylinder = (material, rt, rb, h, seg, position = [0, 0, 0], options = {}) => {
        if (material === 'bamboo') poles.push(position[1])
        return cylinder(material, rt, rb, h, seg, position, options)
      }
      build(b, cfg)
      assert.equal(b.banners.length, 1)
      const [banner] = b.banners
      assert.ok(poles.length >= 1)
      assert.ok(banner.position[1] + banner.height / 2 <= Math.max(...poles) + 1e-6, `布幡上緣 ${(banner.position[1] + banner.height / 2).toFixed(2)} 高過竹竿 ${Math.max(...poles).toFixed(2)}`)
    }
  })
})

describe('鏡頭貼著人物時不畫人物', () => {
  test('水平距離 0.7 公尺以內、高度在人物身上時算太近（近裁切面 0.3 公尺會切開肩膀與後腦）', () => {
    const p = { x: 0, y: 0, z: 0 }
    assert.ok(cameraTooCloseToCharacter({ x: 0.45, y: 1.6, z: 0 }, p), '貼在背後')
    assert.ok(!cameraTooCloseToCharacter({ x: 0.9, y: 1.6, z: 0 }, p), '一般室內距離')
    assert.ok(!cameraTooCloseToCharacter({ x: 0.3, y: 3.2, z: 0 }, p), '頭頂上方很高')
    assert.ok(!cameraTooCloseToCharacter({ x: 0, y: 1.6, z: 7.8 }, p), '街上')
  })

  test('站在每個室內的中間，跟隨鏡頭在一般距離時人物都畫得出來', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const zone of world.interiors) {
        const part = partsOf(zone).reduce((a, b) => ((b.maxX - b.minX) * (b.maxZ - b.minZ) > (a.maxX - a.minX) * (a.maxZ - a.minZ) ? b : a))
        const p = { x: (part.minX + part.maxX) / 2, y: 0, z: (part.minZ + part.maxZ) / 2 }
        const { pitch, distance } = indoorFollow(CAMERA.pitch, CAMERA.distance, 1, zone.camera)
        const dir = orbitDirection(0, pitch)
        const camera = { x: p.x + dir.x * distance, y: CAMERA.targetHeight + dir.y * distance, z: p.z + dir.z * distance }
        assert.ok(!cameraTooCloseToCharacter(camera, p), `${era.id}／${zone.id}`)
      }
    }
  })
})

describe('店家標記看得到', () => {
  test('標記不在榕樹的樹冠裡（廟口四個攤位的標記原本在 3.1–3.7 公尺，整顆藏在樹葉裡）', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      for (const [id, store] of Object.entries(world.stores)) {
        const [x, y, z] = store.anchors.marker
        for (const tree of world.leafTrees) {
          const inside = Math.hypot(x - tree.position[0], z - tree.position[2]) < tree.radius && y > tree.top - 0.3 && y < tree.top + 2.9
          assert.ok(!inside, `${era.id}／${id} 的標記在 (${tree.position[0].toFixed(1)}, ${tree.position[2].toFixed(1)}) 的樹冠裡`)
        }
      }
    }
  })
})

describe('路燈桿不穿過建築', () => {
  /** 垂直線 (x, z) 與三角形的交點高度（沒有交點回傳 null） */
  function hitY(a, b, c, x, z) {
    const d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2])
    if (Math.abs(d) < 1e-9) return null
    const l1 = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / d
    const l2 = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / d
    const l3 = 1 - l1 - l2
    if (l1 < 0 || l2 < 0 || l3 < 0) return null
    return l1 * a[1] + l2 * b[1] + l3 * c[1]
  }

  test('燈桿（含 0.16 公尺的半徑）在 0.3–5.8 公尺之間不碰到街景的任何三角形（原本穿過屋簷、簷口、陽臺與鐵皮雨遮）', () => {
    for (const era of ERAS) {
      const world = worlds[era.id]
      const lamps = (createEraLayout(era).lamps ?? []).filter((lamp) => lamp.position[0] > -40)
      for (const batch of world.batches) {
        const pos = batch.geometry.attributes.position
        const index = batch.geometry.index
        const n = index ? index.count : pos.count
        const v = (k) => [pos.getX(k), pos.getY(k), pos.getZ(k)]
        for (let t = 0; t < n; t += 3) {
          const tri = [0, 1, 2].map((i) => v(index ? index.getX(t + i) : t + i))
          for (const lamp of lamps) {
            const [lx, , lz] = lamp.position
            // 燈桿本身的三角形（都在燈桿附近）不算
            if (tri.every(([x, , z]) => Math.hypot(x - lx, z - lz) < 1.4)) continue
            if (tri.every(([x, , z]) => Math.abs(x - lx) > 6 || Math.abs(z - lz) > 6)) continue
            for (const [ox, oz] of [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]]) {
              const y = hitY(...tri, lx + ox, lz + oz)
              assert.ok(y == null || y <= 0.3 || y >= 5.8, `${era.id}：(${lx}, ${lz}) 的燈桿在 ${y?.toFixed(2)} 公尺碰到 ${batch.material}`)
            }
          }
        }
      }
    }
  })
})
