import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { resolvePlayerPosition } from '../src/game/collision.js'
import { PLAYER } from '../src/game/config.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 可行走範圍是多個矩形的聯集。兩個矩形接起來的地方比角色還窄（重疊不到 2 × 半徑）時，
 * 以前的碰撞只看單一矩形，小步走（60 fps 時每個影格約 0.05 公尺）會卡在接縫前面；
 * 慢的軟體繪圖每步比較大，會直接跳過去，所以瀏覽器測試看不出來。
 */
const R = PLAYER.radius
const worlds = Object.fromEntries(['banquet', 'modern', 'postwar', 'revival'].map((id) => [id, buildEraWorldSync(id)]))

/** 模擬按住方向鍵行走：legs 是 [dx, dz, 公尺]，每步 step 公尺 */
function walk(world, from, legs, step) {
  const p = { x: from.x, z: from.z }
  for (const [dx, dz, distance] of legs) {
    for (let i = 0; i < Math.round(distance / step); i++) {
      p.x += dx * step
      p.z += dz * step
      resolvePlayerPosition(p, R, world.collision)
    }
  }
  return p
}

function insideAny(x, z, walkable) {
  return walkable.some((r) => x >= r.minX - 1e-9 && x <= r.maxX + 1e-9 && z >= r.minZ - 1e-9 && z <= r.maxZ + 1e-9)
}

/** 角色的圓伸出可行走範圍多少（64 個方向，每 5 公釐找第一個離開聯集的點） */
function penetration(p, walkable) {
  let worst = 0
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2
    for (let t = 0; t <= R; t += 0.005) {
      if (!insideAny(p.x + Math.cos(a) * t, p.z + Math.sin(a) * t, walkable)) {
        worst = Math.max(worst, R - t)
        break
      }
    }
  }
  return worst
}

const STEPS = [0.09, 0.05, 0.02]

describe('窄的接縫：小步走也走得過去', () => {
  test('從迪化街走進城隍廟前的廟埕（四個年代）', () => {
    for (const id of ['banquet', 'modern', 'postwar', 'revival']) {
      for (const step of STEPS) {
        const p = walk(worlds[id], { x: 4, z: 0 }, [[0, 1, 9]], step)
        assert.ok(p.z > 7.5, `${id} 每步 ${step}：停在 z ${p.z.toFixed(2)}`)
      }
    }
  })

  test('從迪化街走進永樂市場的一樓（中央走道與北側的攤位間）', () => {
    for (const step of STEPS) {
      const hall = walk(worlds.revival, { x: 36, z: 0 }, [[1, 0, 12]], step)
      assert.ok(hall.x > 47, `中央走道 每步 ${step}：停在 x ${hall.x.toFixed(2)}`)
      const bay = walk(worlds.revival, { x: 38, z: 7.3 }, [[1, 0, 4]], step)
      assert.ok(bay.x > 41.5, `北側 每步 ${step}：停在 x ${bay.x.toFixed(2)}`)
    }
  })

  test('滋養豆餡舖：轉角騎樓走到最裡面', () => {
    for (const step of STEPS) {
      const p = walk(worlds.revival, { x: -34, z: 0 }, [[0, -1, 6]], step)
      assert.ok(p.z < -5.5, `每步 ${step}：停在 z ${p.z.toFixed(2)}`)
    }
  })

  test('迪化街 → 224巷 → 導演的豆花店店內', () => {
    for (const step of STEPS) {
      const p = walk(worlds.revival, { x: 22.9, z: 0 }, [[0, 1, 23.2], [1, 0, 9]], step)
      assert.ok(p.x > 31.5, `每步 ${step}：停在 (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`)
    }
  })
})

describe('窄的接縫：角色不會走出可行走範圍', () => {
  test('接縫附近每個位置處理碰撞後，角色的圓最多伸出 6 公分', () => {
    for (const [id, world] of Object.entries(worlds)) {
      const { walkable } = world.collision
      let worst = 0
      for (let i = 0; i < walkable.length; i++) {
        for (let j = i + 1; j < walkable.length; j++) {
          const a = walkable[i]
          const b = walkable[j]
          const minX = Math.max(a.minX, b.minX)
          const maxX = Math.min(a.maxX, b.maxX)
          const minZ = Math.max(a.minZ, b.minZ)
          const maxZ = Math.min(a.maxZ, b.maxZ)
          if (maxX <= minX || maxZ <= minZ || (maxX - minX >= 2 * R && maxZ - minZ >= 2 * R)) continue
          // 接縫前後 1 公尺的格點（含走到牆外的位置）
          for (let x = minX - 1; x <= maxX + 1; x += 0.1) {
            for (let z = minZ - 1; z <= maxZ + 1; z += 0.1) {
              const p = { x, z }
              resolvePlayerPosition(p, R, world.collision)
              worst = Math.max(worst, penetration(p, walkable))
            }
          }
        }
      }
      assert.ok(worst <= 0.06, `${id}：最多伸出 ${(worst * 100).toFixed(1)} 公分`)
    }
  })
})
