import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { CAMERA, PLAYER, STREET } from '../src/game/config.js'
import {
  VIEWER,
  clearYaw,
  followAllowed,
  followDistance,
  orbitDirection,
  pointInBlockers,
  streetFacingYaw,
} from '../src/game/viewerCamera.js'
import { buildEraWorldSync } from '../src/game/world/buildWorld.js'

/**
 * 第 9 階段鏡頭修正：窄處不穿牆、換年代後面向街道、觀賞模式起始方向避開遮擋。
 */
const WALL = { minX: -0.5, maxX: 0.5, minY: 0, maxY: 6, minZ: -10, maxZ: 10 }
const target = { x: 1.2, y: CAMERA.targetHeight, z: 0 }

describe('窄處不穿牆', () => {
  test('牆比最近距離還近時，鏡頭停在牆前面，不在牆裡', () => {
    // 鏡頭往 -x 退：牆在 0.7 公尺外，原本最近距離 1.3 會落進牆裡
    const direction = orbitDirection(-Math.PI / 2, 0)
    const allowed = followDistance(target, direction, CAMERA.distance, 1.3, [WALL])
    assert.ok(allowed < 0.7, `allowed ${allowed}`)
    const camera = { x: target.x + direction.x * allowed, y: target.y, z: target.z }
    assert.equal(pointInBlockers(camera, [WALL]), false)
  })

  test('沒有東西擋住、或最近距離的位置不在牆裡時，維持原本的規則', () => {
    const away = orbitDirection(Math.PI / 2, 0.38)
    assert.equal(followDistance(target, away, CAMERA.distance, 1.3, [WALL]), followAllowed(CAMERA.distance + 0.45, 1.3))
    // 細的橫樑：射線很近就碰到，但最近距離的位置已經在橫樑另一側、不在裡面，維持最近距離
    const beam = { minX: 0.6, maxX: 0.9, minY: 1.5, maxY: 1.8, minZ: -2, maxZ: 2 }
    assert.equal(followDistance(target, orbitDirection(-Math.PI / 2, 0.38), CAMERA.distance, 1.3, [beam]), 1.3)
  })

  test('五個年代：街道上各個位置與方向，鏡頭都不停在遮擋方塊裡', () => {
    for (const era of ERAS) {
      const { blockers } = buildEraWorldSync(era.id)
      for (let x = STREET.rowStartX + 1; x <= STREET.walkEndX - 1; x += 2.5) {
        for (const z of [-2.6, -1.2, 0, 1.2, 2.6]) {
          const p = { x, y: CAMERA.targetHeight, z }
          // 人物站不到的地方（離牆不到人物半徑）不算
          const r = PLAYER.radius
          if ([[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].some(([dx, dz]) => pointInBlockers({ x: x + dx, y: p.y, z: z + dz }, blockers))) continue
          for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 6) {
            const direction = orbitDirection(yaw, CAMERA.pitch)
            const d = followDistance(p, direction, CAMERA.distance, 1.3, blockers)
            const camera = { x: p.x + direction.x * d, y: p.y + direction.y * d, z: p.z + direction.z * d }
            assert.equal(pointInBlockers(camera, blockers), false, `${era.id} (${x}, ${z}) yaw ${yaw.toFixed(2)}`)
          }
        }
      }
    }
  })
})

describe('換年代後面向街道', () => {
  test('原本的方向對著牆：轉到沿著街道的方向', () => {
    const turn = streetFacingYaw(target, -Math.PI / 2, CAMERA.pitch, CAMERA.distance, [WALL])
    assert.ok(Math.abs(Math.sin(turn.yaw)) > 0.6, `yaw ${turn.yaw}`)
    assert.ok(turn.distance >= CAMERA.distance * 0.9)
  })

  test('原本就沿著街道、沒被擋住：保留原本的方向', () => {
    const yaw = Math.PI / 2 + 0.3
    assert.equal(streetFacingYaw(target, yaw, CAMERA.pitch, CAMERA.distance, []).yaw, yaw)
  })

  test('原本垂直街道（對著店面）：改成較接近的街道方向', () => {
    const turn = streetFacingYaw(target, 0.2, CAMERA.pitch, CAMERA.distance, [])
    assert.ok(Math.abs(Math.sin(turn.yaw) - 1) < 1e-9, `yaw ${turn.yaw}`)
  })

  test('五個年代：街道中線上的鏡頭方向都看得到角色', () => {
    for (const era of ERAS) {
      const { blockers } = buildEraWorldSync(era.id)
      for (let x = STREET.rowStartX + 2; x <= STREET.walkEndX - 2; x += 4) {
        const p = { x, y: CAMERA.targetHeight, z: 0 }
        const turn = streetFacingYaw(p, 0, CAMERA.pitch, CAMERA.distance, blockers)
        assert.ok(turn.distance >= 3, `${era.id} x=${x} distance ${turn.distance}`)
      }
    }
  })
})

describe('觀賞模式起始位置避開遮擋', () => {
  test('原本方向被擋住時改用旁邊的方向；沒被擋住時不變', () => {
    const start = { x: 1.2, y: VIEWER.start.height, z: 0 }
    const blocked = clearYaw(start, -Math.PI / 2, VIEWER.start.pitch, VIEWER.start.distance, [WALL])
    assert.notEqual(blocked.yaw, -Math.PI / 2)
    assert.ok(blocked.distance >= VIEWER.start.distance * 0.9)
    assert.equal(clearYaw(start, 1, VIEWER.start.pitch, VIEWER.start.distance, []).yaw, 1)
  })
})
