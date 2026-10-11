import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, MeshBasicMaterial, SRGBColorSpace } from 'three'
import { LAYERS, PLAYER } from '../config.js'
import { resolvePlayerPosition } from '../collision.js'
import { moveInput } from '../input.js'
import { cameraState, playerState } from '../runtime.js'
import { createToonMaterial } from '../rendering/materials.js'
import { clamp, damp, dampAngle } from '../utils/math.js'
import { useGameStore } from '../../state/useGameStore.js'

const COLORS = {
  skin: '#e2bf98',
  hair: '#2a221d',
  tunic: '#4f6a7d',
  tunicDark: '#3f5666',
  inner: '#e8dcc4',
  sash: '#b98a50',
  pants: '#7a7266',
  shoes: '#4a3d33',
  hat: '#cfb27a',
  hatRim: '#a88a55',
  bundle: '#a65f45',
  strap: '#7a5a3e',
  eye: '#231b16',
}

/** 腳下陰影的貼圖：中央較深、往外柔和淡出（不會在地面上留下一塊硬邊的黑圓） */
function createBlobTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const g = canvas.getContext('2d')
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.45, 'rgba(255,255,255,0.6)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * 旅人角色：低多邊形組合而成（斗笠、短衫、寬褲、背上的包袱）。
 * WASD／方向鍵依鏡頭方向移動，角色朝移動方向轉身並播放行走動畫。
 */
export function Player({ collision, shopModels }) {
  const root = useRef()
  const body = useRef()
  const torso = useRef()
  const head = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const anim = useRef({ phase: 0, amount: 0, travelNonce: 0 })

  const m = useMemo(() => {
    const result = {}
    // 微弱的自發光：背光（夕陽、夜景）時角色的暗面仍保有顏色，不會變成一團黑
    for (const [key, color] of Object.entries(COLORS)) {
      result[key] = createToonMaterial(color, { emissive: new Color(color), emissiveIntensity: 0.16 })
    }
    result.shadow = new MeshBasicMaterial({ color: '#2a2230', map: createBlobTexture(), transparent: true, opacity: 0.32, depthWrite: false })
    return result
  }, [])

  const blob = useRef()
  useEffect(() => {
    blob.current?.layers.set(LAYERS.NO_OUTLINE)
  }, [])

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const st = useGameStore.getState()
    const pos = playerState.position
    const vel = playerState.velocity

    // 從選單「前往」店家：移動到店門口並面向店面
    if (st.travel && st.travel.nonce !== anim.current.travelNonce) {
      anim.current.travelNonce = st.travel.nonce
      const model = shopModels.find((item) => item.shop.id === st.travel.shopId)
      if (model) {
        const { interactionPoint, forward } = model.placement
        pos.set(interactionPoint.x + forward.x * 0.5, 0, interactionPoint.z + forward.z * 0.5)
        vel.set(0, 0, 0)
        playerState.heading = Math.atan2(-forward.x, -forward.z)
        cameraState.targetYaw = cameraState.yaw = playerState.heading + Math.PI + 0.5
        cameraState.snap = true
      }
    }

    // 建築觀賞模式：角色停在原地並隱藏（座標保留，返回探索時從同一個位置繼續）
    const canMove = st.started && st.mode === 'explore' && st.viewMode === 'explore'
    let forwardInput = 0
    let rightInput = 0
    let stick = 0
    if (canMove) {
      forwardInput = (moveInput.forward ? 1 : 0) - (moveInput.back ? 1 : 0)
      rightInput = (moveInput.right ? 1 : 0) - (moveInput.left ? 1 : 0)
      stick = Math.min(1, Math.hypot(moveInput.stickX, moveInput.stickY))
      if (stick > 0.08 && forwardInput === 0 && rightInput === 0) {
        forwardInput = moveInput.stickY
        rightInput = moveInput.stickX
      } else {
        stick = 0
      }
    }
    const yaw = cameraState.yaw
    let dx = -Math.sin(yaw) * forwardInput + Math.cos(yaw) * rightInput
    let dz = -Math.cos(yaw) * forwardInput - Math.sin(yaw) * rightInput
    const length = Math.hypot(dx, dz)
    const moving = length > 0.001
    if (moving) {
      dx /= length
      dz /= length
    }
    // 搖桿：輕推慢走、推到底小跑步；鍵盤：Shift 快走
    let speed = moveInput.run ? PLAYER.runSpeed : PLAYER.walkSpeed
    if (stick > 0) {
      const walk = PLAYER.walkSpeed * clamp((stick - 0.08) / 0.62, 0.25, 1)
      const runBlend = clamp((stick - 0.86) / 0.12, 0, 1)
      speed = walk + (PLAYER.runSpeed * 0.82 - walk) * runBlend
    }
    const targetVx = moving ? dx * speed : 0
    const targetVz = moving ? dz * speed : 0
    const accel = 1 - Math.exp(-(moving ? 9 : 13) * dt)
    vel.x += (targetVx - vel.x) * accel
    vel.z += (targetVz - vel.z) * accel

    const prevX = pos.x
    const prevZ = pos.z
    pos.x += vel.x * dt
    pos.z += vel.z * dt
    resolvePlayerPosition(pos, PLAYER.radius, collision)
    const actualSpeed = dt > 0 ? Math.hypot(pos.x - prevX, pos.z - prevZ) / dt : 0
    playerState.speed = actualSpeed

    // 轉身：移動時朝向移動方向；探索店家時面向店面
    let targetHeading = playerState.heading
    if (moving) targetHeading = Math.atan2(dx, dz)
    if (st.mode !== 'explore' && st.activeShopId) {
      const model = shopModels.find((item) => item.shop.id === st.activeShopId)
      if (model) targetHeading = Math.atan2(model.placement.origin.x - pos.x, model.placement.origin.z - pos.z)
    }
    playerState.heading = dampAngle(playerState.heading, targetHeading, 11, dt)

    if (root.current) {
      root.current.position.set(pos.x, 0.02, pos.z)
      root.current.rotation.y = playerState.heading
      root.current.visible = st.viewMode !== 'viewer'
    }

    // 行走動畫
    const a = anim.current
    a.amount = damp(a.amount, clamp(actualSpeed / PLAYER.walkSpeed, 0, 1.45), 9, dt)
    a.phase += dt * actualSpeed * 4.3
    const amount = Math.min(a.amount, 1.25)
    const swing = Math.sin(a.phase)
    const t = state.clock.elapsedTime
    const idle = 1 - Math.min(1, a.amount)
    if (legL.current) {
      legL.current.rotation.x = swing * 0.62 * amount
      legR.current.rotation.x = -swing * 0.62 * amount
      armL.current.rotation.x = -swing * 0.52 * amount
      armR.current.rotation.x = swing * 0.52 * amount
      armL.current.rotation.z = 0.08 + Math.sin(t * 1.6) * 0.02 * idle
      armR.current.rotation.z = -0.08 - Math.sin(t * 1.6) * 0.02 * idle
      body.current.position.y = Math.abs(Math.cos(a.phase)) * 0.045 * amount
      body.current.rotation.x = 0.075 * amount
      torso.current.rotation.y = swing * 0.07 * amount
      torso.current.scale.y = 1 + Math.sin(t * 2.1) * 0.012 * idle
      head.current.rotation.y = -swing * 0.05 * amount + Math.sin(t * 0.5) * 0.08 * idle
    }
  }, -2)

  return (
    <group ref={root} name="player">
      <group ref={body}>
        {/* 腿 */}
        {[
          [legL, -0.11],
          [legR, 0.11],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref} position={[x, 0.86, 0]}>
            <mesh position={[0, -0.38, 0]} material={m.pants} castShadow>
              <cylinderGeometry args={[0.1, 0.082, 0.78, 8]} />
            </mesh>
            <mesh position={[0, -0.8, 0.045]} material={m.shoes} castShadow>
              <boxGeometry args={[0.13, 0.08, 0.25]} />
            </mesh>
          </group>
        ))}

        <group ref={torso} position={[0, 0.86, 0]}>
          {/* 短衫 */}
          <mesh position={[0, 0.31, 0]} material={m.tunic} castShadow>
            <cylinderGeometry args={[0.19, 0.25, 0.62, 8]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={m.tunicDark} castShadow>
            <cylinderGeometry args={[0.255, 0.27, 0.08, 8]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={m.sash}>
            <cylinderGeometry args={[0.236, 0.24, 0.08, 8]} />
          </mesh>
          <mesh position={[0, 0.63, 0]} material={m.inner}>
            <cylinderGeometry args={[0.1, 0.13, 0.06, 8]} />
          </mesh>
          {/* 包袱與背帶 */}
          <mesh position={[0, 0.42, -0.25]} scale={[1.1, 0.85, 0.72]} material={m.bundle} castShadow>
            <icosahedronGeometry args={[0.2, 1]} />
          </mesh>
          <mesh position={[0.02, 0.56, -0.38]} material={m.bundle}>
            <icosahedronGeometry args={[0.06, 0]} />
          </mesh>
          <mesh position={[0, 0.36, 0.205]} rotation={[0.12, 0, 0.62]} material={m.strap}>
            <boxGeometry args={[0.05, 0.64, 0.025]} />
          </mesh>

          {/* 手臂 */}
          {[
            [armL, -0.245],
            [armR, 0.245],
          ].map(([ref, x], i) => (
            <group key={i} ref={ref} position={[x, 0.56, 0]}>
              <mesh position={[0, -0.25, 0]} material={m.tunic} castShadow>
                <cylinderGeometry args={[0.072, 0.066, 0.52, 7]} />
              </mesh>
              <mesh position={[0, -0.55, 0.01]} material={m.skin}>
                <sphereGeometry args={[0.056, 8, 6]} />
              </mesh>
            </group>
          ))}

          {/* 頭與斗笠 */}
          <group ref={head} position={[0, 0.7, 0]}>
            <mesh position={[0, 0.02, 0]} material={m.skin}>
              <cylinderGeometry args={[0.055, 0.065, 0.1, 6]} />
            </mesh>
            <mesh position={[0, 0.16, 0]} material={m.skin} castShadow>
              <sphereGeometry args={[0.155, 14, 10]} />
            </mesh>
            <mesh position={[0, 0.19, -0.025]} scale={[1.05, 1, 1.05]} material={m.hair}>
              <sphereGeometry args={[0.155, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
            <mesh position={[-0.052, 0.16, 0.142]} material={m.eye}>
              <sphereGeometry args={[0.017, 6, 4]} />
            </mesh>
            <mesh position={[0.052, 0.16, 0.142]} material={m.eye}>
              <sphereGeometry args={[0.017, 6, 4]} />
            </mesh>
            <group position={[0, 0.33, 0]} rotation={[0.08, 0, 0]}>
              <mesh material={m.hat} castShadow>
                <coneGeometry args={[0.37, 0.18, 14]} />
              </mesh>
              <mesh position={[0, -0.085, 0]} rotation-x={Math.PI / 2} material={m.hatRim}>
                <torusGeometry args={[0.36, 0.014, 4, 20]} />
              </mesh>
              <mesh position={[0, 0.1, 0]} material={m.hatRim}>
                <sphereGeometry args={[0.03, 6, 4]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* 腳下柔和陰影（不描邊） */}
      <mesh ref={blob} position={[0, 0.035, 0]} rotation-x={-Math.PI / 2} material={m.shadow} renderOrder={5}>
        <planeGeometry args={[1.0, 1.0]} />
      </mesh>
    </group>
  )
}
