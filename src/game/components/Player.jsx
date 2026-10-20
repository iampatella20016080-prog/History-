import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MeshBasicMaterial, SRGBColorSpace } from 'three'
import { LAYERS, PLAYER } from '../config.js'
import { groundAt, hasLevel, resolvePlayerPosition } from '../collision.js'
import { moveInput } from '../input.js'
import { cameraState, playerState } from '../runtime.js'
import { RIG } from '../character/outfitBuilder.js'
import { getOutfitMaterial } from '../character/outfitMaterials.js'
import { getOutfit, getOutfitPalette } from '../character/outfits.js'
import { clamp, damp, dampAngle } from '../utils/math.js'
import { useGameStore } from '../../state/useGameStore.js'

/** 行走時腿與手臂的最大擺幅（弧度）；腿的擺幅配合步伐，讓鞋底大致跟著地面移動 */
const LEG_SWING = 0.42
const ARM_SWING = 0.52

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

/** 角色站到所在樓層的地板（或樓梯的斜面）上，並更新樓層 */
function settleOnGround(pos, collision, y) {
  const ground = groundAt(pos, collision, playerState.level, y)
  playerState.level = ground.level
  pos.y = ground.y
}

/** 某個部位的服裝網格（同一部位、同一材質已合併） */
function OutfitSlot({ outfit, palette, slot }) {
  return outfit.slots[slot].map((part, i) => (
    <mesh
      key={`${outfit.id}-${slot}-${i}`}
      name={`outfit:${outfit.id}:${slot}`}
      geometry={part.geometry}
      material={getOutfitMaterial(palette[part.material])}
      castShadow={part.shadow}
    />
  ))
}

/**
 * 旅人角色：低多邊形組合的身體，依目前年代換上五套服裝之一（服裝見 game/character/outfits.js）。
 * 年代成功切換（街景在霧中換好）的同時換裝；上一套的帽子與配件整套移除，位置與鏡頭不受影響。
 * WASD／方向鍵依鏡頭方向移動，角色朝移動方向轉身並播放行走動畫。
 *
 * 骨架：body（整體，跨步時髖部下降讓鞋底貼地）→ 腿（髖關節）→ 腳（腳踝，保持鞋底水平）；
 * torso（軀幹，含手臂、頭；走路時前傾）；長衫下襬前後片掛在髖部、跟著前後腳擺動；手上的公事包保持下垂。
 * 角色面向 +Z，角色的右側是 -X。
 */
export function Player({ collision, shopModels }) {
  const root = useRef()
  const body = useRef()
  const torso = useRef()
  const head = useRef()
  const legRight = useRef()
  const legLeft = useRef()
  const footRight = useRef()
  const footLeft = useRef()
  const armRight = useRef()
  const armLeft = useRef()
  const handRight = useRef()
  const handLeft = useRef()
  const skirtFront = useRef()
  const skirtBack = useRef()
  const anim = useRef({ phase: 0, amount: 0, travelNonce: 0, collision: null })

  const eraId = useGameStore((state) => state.eraId)
  const outfit = useMemo(() => getOutfit(eraId), [eraId])
  const palette = useMemo(() => getOutfitPalette(outfit.id), [outfit])
  const outfitRef = useRef(outfit)
  outfitRef.current = outfit

  const m = useMemo(
    () => ({
      shadow: new MeshBasicMaterial({ color: '#2a2230', map: createBlobTexture(), transparent: true, opacity: 0.32, depthWrite: false }),
    }),
    [],
  )

  const blob = useRef()
  useEffect(() => {
    blob.current?.layers.set(LAYERS.NO_OUTLINE)
    // 開發模式：測試用（核對畫面上的服裝與定義是否一致）
    if (import.meta.env.DEV && window.__DDC__) window.__DDC__.getOutfit = getOutfit
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
        const { interactionPoint, forward, level = 0 } = model.placement
        pos.set(interactionPoint.x + forward.x * 0.5, 0, interactionPoint.z + forward.z * 0.5)
        // 二樓的店家（例如爐鍋咖啡）：直接到那一層的地板上
        playerState.level = hasLevel(collision, level) ? level : 0
        resolvePlayerPosition(pos, PLAYER.radius, collision, playerState.level)
        settleOnGround(pos, collision, null)
        vel.set(0, 0, 0)
        playerState.heading = Math.atan2(-forward.x, -forward.z)
        cameraState.targetYaw = cameraState.yaw = playerState.heading + Math.PI + (model.shop.travelYawOffset ?? 0.5)
        cameraState.snap = true
      }
    }

    // 換了年代的街景：原本站的地方（例如永樂市場裡）在新的年代不能走時，角色移到最近的街道上，鏡頭直接跟過去
    if (anim.current.collision !== collision) {
      const first = !anim.current.collision
      anim.current.collision = collision
      const beforeX = pos.x
      const beforeY = pos.y
      const beforeZ = pos.z
      // 新的年代沒有角色所在的樓層（例如在爐鍋咖啡的二樓切換年代）：回到一樓，再推到最近的街道上
      if (!hasLevel(collision, playerState.level)) playerState.level = 0
      resolvePlayerPosition(pos, PLAYER.radius, collision, playerState.level)
      settleOnGround(pos, collision, pos.y)
      if (!first && Math.hypot(pos.x - beforeX, pos.y - beforeY, pos.z - beforeZ) > 1.5) {
        vel.set(0, 0, 0)
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
    resolvePlayerPosition(pos, PLAYER.radius, collision, playerState.level)
    // 樓梯：沿著看不見的斜面上下樓，過了一半就換到另一層
    settleOnGround(pos, collision, pos.y)
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
      root.current.position.set(pos.x, pos.y + 0.004, pos.z)
      root.current.rotation.y = playerState.heading
      root.current.visible = st.viewMode !== 'viewer'
      root.current.userData.outfit = outfitRef.current.id
    }

    // 行走動畫（各套服裝的擺幅與手臂張開角度不同，例如長衫步伐較小、背包那一側的手臂擺幅較小）
    const a = anim.current
    a.amount = damp(a.amount, clamp(actualSpeed / PLAYER.walkSpeed, 0, 1.45), 9, dt)
    a.phase += dt * actualSpeed * 4.3
    let amount = Math.min(a.amount, 1.25)
    let phase = a.phase
    // 開發模式：固定姿勢（截圖檢查走路時的穿模用，正式版不包含）
    if (import.meta.env.DEV && window.__DDC__?.characterPose) ({ phase, amount } = window.__DDC__.characterPose)
    const swing = Math.sin(phase)
    const t = state.clock.elapsedTime
    const idle = 1 - Math.min(1, amount)
    const { legSwing, armSwing, armSpread } = outfitRef.current.anim
    if (legRight.current) {
      const leg = swing * LEG_SWING * legSwing * amount
      legRight.current.rotation.x = leg
      legLeft.current.rotation.x = -leg
      armRight.current.rotation.x = -swing * ARM_SWING * armSwing.right * amount
      armLeft.current.rotation.x = swing * ARM_SWING * armSwing.left * amount
      // 手臂略為向外張開（角色右側是 -X），閒置時輕微擺動
      armRight.current.rotation.z = -armSpread.right - Math.sin(t * 1.6) * 0.02 * idle
      armLeft.current.rotation.z = armSpread.left + Math.sin(t * 1.6) * 0.02 * idle
      const lean = 0.075 * amount
      // 跨步時髖部稍微下降，讓兩腳的鞋底都貼著地面（不浮空、不陷入地面）
      body.current.position.y = RIG.ankleY * (1 - Math.cos(leg))
      // 腳保持水平；走路時只有上半身前傾，腳的位置不受影響
      footRight.current.rotation.x = -leg
      footLeft.current.rotation.x = leg
      // 長衫下襬：前片跟著往前的腳、後片跟著往後的腳
      skirtFront.current.rotation.x = Math.min(leg, -leg, 0) * 0.86
      skirtBack.current.rotation.x = Math.max(leg, -leg, 0) * 0.86
      // 手上的東西（公事包）保持下垂
      handRight.current.rotation.x = -armRight.current.rotation.x - lean
      handRight.current.rotation.z = -armRight.current.rotation.z
      handLeft.current.rotation.x = -armLeft.current.rotation.x - lean
      handLeft.current.rotation.z = -armLeft.current.rotation.z
      torso.current.rotation.x = lean
      torso.current.rotation.y = swing * 0.07 * amount
      torso.current.scale.y = 1 + Math.sin(t * 2.1) * 0.012 * idle
      head.current.rotation.y = -swing * 0.05 * amount + Math.sin(t * 0.5) * 0.08 * idle
    }
  }, -2)

  const slot = (name) => <OutfitSlot outfit={outfit} palette={palette} slot={name} />

  return (
    <group ref={root} name="player">
      <group ref={body}>
        {/* 腿與腳（角色右側在 -X） */}
        <group ref={legRight} position={[-RIG.legX, RIG.hipY, 0]}>
          {slot('legRight')}
          <group ref={footRight} position={[0, RIG.ankleY, 0]}>
            {slot('footRight')}
          </group>
        </group>
        <group ref={legLeft} position={[RIG.legX, RIG.hipY, 0]}>
          {slot('legLeft')}
          <group ref={footLeft} position={[0, RIG.ankleY, 0]}>
            {slot('footLeft')}
          </group>
        </group>
        {/* 長衫下襬（只有酒樓年代的服裝有內容） */}
        <group ref={skirtFront} position={[0, RIG.hipY, 0]}>
          {slot('skirtFront')}
        </group>
        <group ref={skirtBack} position={[0, RIG.hipY, 0]}>
          {slot('skirtBack')}
        </group>

        <group ref={torso} position={[0, RIG.hipY, 0]}>
          {slot('torso')}
          <group ref={armRight} position={[-RIG.shoulderX, RIG.shoulderY, 0]}>
            {slot('armRight')}
            <group ref={handRight} position={[0, RIG.handY, 0]}>
              {slot('handRight')}
            </group>
          </group>
          <group ref={armLeft} position={[RIG.shoulderX, RIG.shoulderY, 0]}>
            {slot('armLeft')}
            <group ref={handLeft} position={[0, RIG.handY, 0]}>
              {slot('handLeft')}
            </group>
          </group>
          <group ref={head} position={[0, RIG.headY, 0]}>
            {slot('head')}
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
