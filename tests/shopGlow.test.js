/**
 * 第 9 階段：店內透出的光改成有深度的漸層
 *
 * - 後牆：中間亮、左右與上方暗、層架下有陰影。
 * - 假室內（亮窗、玻璃店面）：視線打到看不見的房間，斜看時打到的位置跟著移動（視差）；天花板比後牆暗。
 * - UV 標記：街景的亮窗與店內後牆有標記，室內場景（BUILDING_INTERIORS）的窗維持平面發光。
 * - 預算：不加材質，街景批次數和改動前一樣。
 * - 只在精緻畫質啟用：流暢畫質（iPad）的著色器不做假室內求交，維持原本的平面發光。
 */
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ShaderLib } from 'three'
import { ERAS } from '../src/data/eras.js'
import {
  backWallShade,
  patchShopGlassShader,
  patchShopWindowShader,
  roomHit,
  roomShade,
  SHOP_GLOW_KIND,
  SHOP_GLOW_U0,
  SHOP_ROOM_ATTRIBUTE,
  SHOP_SHELF_HEIGHTS,
  shopGlowKind,
  tagShopGlowUV,
  tagShopGlowUVGroup,
} from '../src/game/rendering/shopGlow.js'
import { MATERIAL_TILE } from '../src/game/rendering/materials.js'
import { getQualitySettings, QUALITY_MODES } from '../src/game/quality.js'
import { buildEraInteriorSync, buildEraWorldSync } from '../src/game/world/buildWorld.js'

/** 改動前（main a8a83f5，含細部的接地暗影批次）各年代依材質合併的街景批次數 */
const BATCHES_BEFORE = { 'qing-port': 15, banquet: 20, modern: 25, postwar: 27, revival: 37 }

describe('店內後牆的明暗', () => {
  test('中間比左右兩側亮', () => {
    assert.ok(backWallShade(0.5, 1.3) > backWallShade(0.05, 1.3) * 1.6)
    assert.ok(backWallShade(0.5, 1.3) > backWallShade(0.95, 1.3) * 1.6)
  })
  test('上方與地面附近比中間暗', () => {
    assert.ok(backWallShade(0.5, 2.75) < backWallShade(0.5, 1.3) * 0.5)
    assert.ok(backWallShade(0.5, 0.02) < backWallShade(0.5, 0.6))
  })
  test('每層層架正下方有陰影，層板上方不受影響', () => {
    for (const h of SHOP_SHELF_HEIGHTS) {
      const under = backWallShade(0.5, h - 0.06)
      const above = backWallShade(0.5, h + 0.04)
      assert.ok(under < above * 0.65, `層架 ${h} m：下方 ${under.toFixed(2)}、上方 ${above.toFixed(2)}`)
    }
  })
  test('數值在 0–1 之間', () => {
    for (let u = 0; u <= 1; u += 0.1) {
      for (let v = 0; v <= 3.2; v += 0.1) {
        const s = backWallShade(u, v)
        assert.ok(s > 0.05 && s <= 1, `${u}, ${v}: ${s}`)
      }
    }
  })
})

describe('假室內（interior mapping）', () => {
  test('正面直視打到後牆的同一點', () => {
    const hit = roomHit(0.5, 0.5, [0, 0, -1])
    assert.equal(hit.surface, 'back')
    assert.deepEqual(hit.point.map((x) => +x.toFixed(6)), [0.5, 0.5, -1])
  })
  test('斜看時打到的位置跟著移動（視差），從右邊看得到左牆', () => {
    const straight = roomHit(0.3, 0.5, [0, 0, -1])
    const oblique = roomHit(0.3, 0.5, [-0.5, 0, -1])
    assert.equal(oblique.surface, 'left')
    assert.notDeepEqual(straight.point, oblique.point)
    const slight = roomHit(0.6, 0.5, [-0.2, 0, -1])
    assert.equal(slight.surface, 'back')
    assert.ok(Math.abs(slight.point[0] - 0.4) < 1e-9, '後牆上的點往視線方向移')
  })
  test('從下往上看打到天花板，天花板比後牆中間暗', () => {
    const hit = roomHit(0.5, 0.9, [0, 0.6, -1])
    assert.equal(hit.surface, 'ceiling')
    assert.ok(roomShade(hit) < roomShade(roomHit(0.5, 0.6, [0, 0, -1])) * 0.6)
  })
  test('後牆中間比牆角亮，層架下有陰影', () => {
    const center = roomShade(roomHit(0.5, 0.65, [0, 0, -1]))
    const corner = roomShade(roomHit(0.02, 0.98, [0, 0, -1]))
    assert.ok(center > corner * 2)
    assert.ok(roomShade(roomHit(0.5, 0.42, [0, 0, -1])) < roomShade(roomHit(0.5, 0.5, [0, 0, -1])) * 0.7)
  })
})

describe('UV 標記', () => {
  /** 一面朝 +z 的窗：(x 0.4–1.6, y 1–2.5) 的四邊形 */
  const quad = (nx = 0, nz = 1) => {
    const positions = new Float32Array([0.4, 1, 0, 1.6, 1, 0, 1.6, 2.5, 0, 0.4, 2.5, 0])
    const normals = new Float32Array([nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz])
    return { positions, normals, uvs: new Float32Array(8) }
  }
  test('假室內窗：u − 10 與 v 都是 0–1', () => {
    const { positions, normals, uvs } = quad()
    tagShopGlowUV(positions, normals, uvs, 'room')
    assert.deepEqual([...uvs].map((x) => +x.toFixed(4)), [10, 0, 11, 0, 11, 1, 10, 1])
    assert.equal(shopGlowKind(uvs[0]), SHOP_GLOW_KIND.room)
  })
  test('店內後牆：v 是離店內地面的高度（公尺）', () => {
    const { positions, normals, uvs } = quad()
    // 店內地面比幾何底邊低 0.5 m（例如後牆從騎樓地面往下埋一點）
    tagShopGlowUV(positions, normals, uvs, 'back', { floorOffset: -0.5 })
    assert.ok(Math.abs(uvs[1] - 0.5) < 1e-6 && Math.abs(uvs[5] - 2.0) < 1e-6)
    assert.equal(shopGlowKind(uvs[0]), SHOP_GLOW_KIND.back)
  })
  test('朝 −z 的面（南側店面）u 一樣從觀看者的左邊到右邊', () => {
    const { positions, normals, uvs } = quad(0, -1)
    tagShopGlowUV(positions, normals, uvs, 'room')
    // 朝 −z：從外面看，左邊是 +x
    assert.ok(uvs[0] > uvs[2], 'x 小的點在右邊')
  })
  test('玻璃店面的整排玻璃共用一個範圍（同一個假房間）', () => {
    const left = quad()
    const right = quad()
    for (let i = 0; i < 4; i++) right.positions[i * 3] += 1.4 // 右邊一片：x 1.8–3.0
    tagShopGlowUVGroup([left, right], 'room')
    assert.ok(Math.abs(left.uvs[0] - 10) < 1e-6, '最左邊 u = 0')
    assert.ok(Math.abs(right.uvs[2] - 11) < 1e-6, '最右邊 u = 1')
    assert.ok(left.uvs[2] < 10.5 && right.uvs[0] > 10.5, '兩片各佔一半，不是各自 0–1')
  })
  test('未標記的 UV 是平面發光', () => {
    assert.equal(shopGlowKind(0.5), SHOP_GLOW_KIND.flat)
    assert.equal(shopGlowKind(SHOP_GLOW_U0.room - 1), SHOP_GLOW_KIND.flat)
  })
  test('windowLit 改用 0–1 的 UV（不會因世界座標誤判成標記）', () => {
    assert.equal(MATERIAL_TILE.windowLit, null)
  })
})

/** 一個批次裡 windowLit 的 UV 各種類的頂點數 */
function kindCounts(batches, material = 'windowLit') {
  const counts = { flat: 0, room: 0, back: 0 }
  for (const batch of batches.filter((b) => b.material === material)) {
    const uv = batch.geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) {
      const kind = shopGlowKind(uv.getX(i))
      counts[kind === SHOP_GLOW_KIND.back ? 'back' : kind === SHOP_GLOW_KIND.room ? 'room' : 'flat']++
    }
  }
  return counts
}

describe('街景與室內', () => {
  for (const era of ERAS) {
    test(`${era.id}：街景批次數不變，亮窗與店內後牆有標記`, () => {
      const world = buildEraWorldSync(era.id)
      assert.equal(world.batches.length, BATCHES_BEFORE[era.id], `${era.id} 街景批次 ${world.batches.length}`)
      const counts = kindCounts(world.batches)
      assert.ok(counts.back > 0, `${era.id} 有店內後牆`)
      assert.ok(counts.room > 0, `${era.id} 有假室內窗`)
      // glassWarm 的 UV 維持原本每片 0–1；整排玻璃另有 shopRoom 屬性（0 = 沒有，1–2 = 整排共用的位置）
      for (const batch of world.batches.filter((b) => b.material === 'glassWarm')) {
        const uv = batch.geometry.attributes.uv
        for (let i = 0; i < uv.count; i++) assert.ok(uv.getX(i) > -0.01 && uv.getX(i) < 1.01, `glassWarm u = ${uv.getX(i)}`)
        const room = batch.geometry.attributes[SHOP_ROOM_ATTRIBUTE]
        if (!room) continue
        for (let i = 0; i < room.count; i++) {
          const u = room.getX(i)
          assert.ok(u === 0 || (u > 0.99 && u < 2.01), `shopRoom u = ${u}`)
        }
      }
    })
    test(`${era.id}：室內場景的窗不套假室內`, () => {
      const interior = buildEraInteriorSync(era.id)
      const counts = kindCounts(interior.batches ?? [])
      assert.equal(counts.room + counts.back, 0)
    })
  }
})

describe('只在精緻畫質啟用', () => {
  const toon = () => ({ vertexShader: ShaderLib.toon.vertexShader, fragmentShader: ShaderLib.toon.fragmentShader })

  test('精緻畫質開啟、流暢畫質關閉', () => {
    assert.equal(QUALITY_MODES.fine.shopGlow, true)
    assert.equal(QUALITY_MODES.smooth.shopGlow, false)
    assert.equal(getQualitySettings('smooth').shopGlow, false)
    assert.equal(getQualitySettings('fine').shopGlow, true)
  })
  test('流暢畫質：亮窗的著色器和原本完全相同', () => {
    const original = toon()
    const shader = patchShopWindowShader(toon(), false)
    assert.equal(shader.vertexShader, original.vertexShader)
    assert.equal(shader.fragmentShader, original.fragmentShader)
  })
  test('流暢畫質：玻璃店面的著色器和原本完全相同（不做假室內求交）', () => {
    const shader = patchShopGlassShader(toon(), false)
    assert.equal(shader.vertexShader, ShaderLib.toon.vertexShader)
    assert.equal(shader.fragmentShader, ShaderLib.toon.fragmentShader)
    for (const word of ['shopRoomHit', 'dFdx', SHOP_ROOM_ATTRIBUTE]) assert.ok(!shader.fragmentShader.includes(word) && !shader.vertexShader.includes(word))
  })
  test('老屋新生的玻璃店面有整排共用的假房間座標', () => {
    const world = buildEraWorldSync('revival')
    const glass = world.batches.find((b) => b.material === 'glassWarm')
    const room = glass.geometry.attributes[SHOP_ROOM_ATTRIBUTE]
    assert.ok(room, '有 shopRoom 屬性')
    let tagged = 0
    for (let i = 0; i < room.count; i++) if (room.getX(i) > 0.5) tagged++
    assert.ok(tagged > 0)
  })
  test('精緻畫質：亮窗與玻璃店面都有假室內求交', () => {
    for (const patch of [patchShopWindowShader, patchShopGlassShader]) {
      const shader = patch(toon(), true)
      assert.ok(shader.fragmentShader.includes('shopRoomHit('))
      assert.ok(shader.vertexShader.includes('vShopPos ='))
    }
    assert.ok(patchShopWindowShader(toon(), true).fragmentShader.includes('shopBackWall('))
    assert.ok(patchShopGlassShader(toon(), true).vertexShader.includes(`vShopUv = ${SHOP_ROOM_ATTRIBUTE}.x > 0.5`), '整排玻璃用 shopRoom')
  })
})
