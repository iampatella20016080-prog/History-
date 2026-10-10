import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { CAMERA, LAYERS } from '../config.js'
import { raycastBoxes } from '../collision.js'
import { cameraState, playerState, renderState } from '../runtime.js'
import { clamp, damp, dampAngle, dampVector } from '../utils/math.js'
import { useGameStore } from '../../state/useGameStore.js'

const INTRO_LOOK = new Vector3(-22, 2.4, -0.4)
const UP = new Vector3(0, 1, 0)

/**
 * 第三人稱鏡頭
 * - 平滑跟隨角色；滑鼠拖曳旋轉視角、滾輪縮放；觸控單指旋轉、雙指縮放
 * - 會被建築遮擋時自動拉近，避免穿牆
 * - 探索店家時平滑移到店面前，並把店面留在介紹視窗左側
 */
export function CameraRig({ blockers, shopModels }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)

  const rig = useMemo(
    () => ({
      position: new Vector3(30, 12.5, 1.2),
      look: INTRO_LOOK.clone(),
      desiredPosition: new Vector3(),
      desiredLook: new Vector3(),
      direction: new Vector3(),
      screenRight: new Vector3(),
      target: new Vector3(),
      focus: new Vector3(),
      collisionDistance: CAMERA.distance,
      followLambda: 2,
      initialized: false,
    }),
    [],
  )

  useEffect(() => {
    camera.layers.enable(LAYERS.NO_OUTLINE)
  }, [camera])

  // 滑鼠拖曳與滾輪；觸控：單指拖曳旋轉、雙指捏合縮放（雙指左右移動也可旋轉）
  useEffect(() => {
    const element = gl.domElement
    const touches = new Map()
    let pinch = null
    let mouseId = null
    let lastX = 0
    let lastY = 0
    const canControl = () => {
      const { started, mode } = useGameStore.getState()
      return started && mode === 'explore'
    }
    const rotate = (dx, dy, k) => {
      cameraState.targetYaw -= dx * 0.0055 * k
      cameraState.targetPitch = clamp(cameraState.targetPitch + dy * 0.0038 * k, CAMERA.minPitch, CAMERA.maxPitch)
    }
    const pinchState = () => {
      const [a, b] = [...touches.values()]
      return { distance: Math.hypot(a.x - b.x, a.y - b.y), midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 }
    }
    const onDown = (event) => {
      if (!canControl()) return
      if (event.pointerType === 'touch') {
        event.preventDefault()
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
        element.setPointerCapture?.(event.pointerId)
        pinch = touches.size >= 2 ? pinchState() : null
        element.classList.add('is-dragging')
        return
      }
      if (event.button !== 0 && event.button !== 2) return
      mouseId = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      element.setPointerCapture?.(event.pointerId)
      element.classList.add('is-dragging')
    }
    const onMove = (event) => {
      if (event.pointerType === 'touch') {
        const touch = touches.get(event.pointerId)
        if (!touch) return
        const dx = event.clientX - touch.x
        const dy = event.clientY - touch.y
        touch.x = event.clientX
        touch.y = event.clientY
        if (!canControl()) return
        if (touches.size === 1) {
          rotate(dx, dy, 1.1)
        } else if (touches.size >= 2) {
          const next = pinchState()
          if (pinch && next.distance > 1) {
            const ratio = pinch.distance / next.distance
            cameraState.targetDistance = clamp(cameraState.targetDistance * ratio, CAMERA.minDistance, CAMERA.maxDistance)
            rotate(next.midX - pinch.midX, (next.midY - pinch.midY) * 0.6, 0.9)
          }
          pinch = next
        }
        return
      }
      if (event.pointerId !== mouseId) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      rotate(dx, dy, 1)
    }
    const onUp = (event) => {
      if (event.pointerType === 'touch') {
        if (!touches.delete(event.pointerId)) return
        element.releasePointerCapture?.(event.pointerId)
        pinch = touches.size >= 2 ? pinchState() : null
        if (touches.size === 0) element.classList.remove('is-dragging')
        return
      }
      if (event.pointerId !== mouseId) return
      mouseId = null
      element.releasePointerCapture?.(event.pointerId)
      element.classList.remove('is-dragging')
    }
    const onWheel = (event) => {
      if (!canControl()) return
      event.preventDefault()
      const step = clamp(event.deltaY, -120, 120) * 0.0011
      cameraState.targetDistance = clamp(cameraState.targetDistance * (1 + step), CAMERA.minDistance, CAMERA.maxDistance)
    }
    const onContextMenu = (event) => event.preventDefault()
    // Safari：避免雙指手勢縮放整個網頁
    const onGesture = (event) => event.preventDefault()
    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onUp)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('contextmenu', onContextMenu)
    element.addEventListener('gesturestart', onGesture)
    element.addEventListener('gesturechange', onGesture)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onUp)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('contextmenu', onContextMenu)
      element.removeEventListener('gesturestart', onGesture)
      element.removeEventListener('gesturechange', onGesture)
    }
  }, [gl])

  useFrame((frame, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const { started, mode, activeShopId } = useGameStore.getState()

    cameraState.yaw = dampAngle(cameraState.yaw, cameraState.targetYaw, 10, dt)
    cameraState.pitch = damp(cameraState.pitch, cameraState.targetPitch, 10, dt)
    cameraState.distance = damp(cameraState.distance, cameraState.targetDistance, 8, dt)

    let lambda
    const model = activeShopId ? shopModels.find((item) => item.shop.id === activeShopId) : null

    if (!started) {
      // 開場：緩慢漂移的街景鳥瞰
      const t = frame.clock.elapsedTime
      rig.desiredPosition.set(30 + Math.sin(t * 0.07) * 2.5, 12.5 + Math.sin(t * 0.05) * 0.4, 1.2 + Math.cos(t * 0.06) * 1.2)
      rig.desiredLook.copy(INTRO_LOOK)
      rig.focus.copy(INTRO_LOOK)
      rig.followLambda = 1.6
      lambda = 1.5
    } else if (mode !== 'explore' && model) {
      // 探索店家：鏡頭靠近店面
      const { camera: shot, origin } = model.placement
      rig.desiredPosition.copy(shot.position)
      rig.desiredLook.copy(shot.target)
      const aspect = size.width / Math.max(1, size.height)
      if (aspect > 1.15) {
        // 把注視點往畫面右側推，讓店面落在介紹視窗左邊的可見區域
        const distance = shot.position.distanceTo(shot.target)
        const hfov = 2 * Math.atan(Math.tan(MathUtils.degToRad(camera.fov / 2)) * aspect)
        rig.screenRight.subVectors(shot.target, shot.position).cross(UP).normalize()
        rig.desiredLook.addScaledVector(rig.screenRight, distance * Math.tan(hfov / 2) * 0.5)
      }
      rig.focus.set(origin.x, 3, origin.z)
      rig.followLambda = 2.2
      lambda = 3.2
    } else {
      // 第三人稱跟隨
      const p = playerState.position
      rig.target.set(p.x, CAMERA.targetHeight, p.z)
      const cosPitch = Math.cos(cameraState.pitch)
      rig.direction.set(Math.sin(cameraState.yaw) * cosPitch, Math.sin(cameraState.pitch), Math.cos(cameraState.yaw) * cosPitch)
      const wanted = cameraState.distance
      if (cameraState.snap) rig.collisionDistance = wanted
      const hit = raycastBoxes(rig.target, rig.direction, wanted + 0.45, blockers)
      const allowed = Math.max(1.3, hit - 0.45)
      rig.collisionDistance = allowed < rig.collisionDistance ? allowed : damp(rig.collisionDistance, allowed, 3, dt)
      const distance = Math.min(wanted, rig.collisionDistance)
      rig.desiredPosition.copy(rig.target).addScaledVector(rig.direction, distance)
      // 鏡頭被拉近時，注視點逐漸降回角色胸口，避免仰角過大
      const lookBlend = clamp(distance / CAMERA.distance, 0, 1)
      rig.desiredLook.set(p.x, CAMERA.targetHeight + (CAMERA.lookHeight - CAMERA.targetHeight) * lookBlend, p.z)
      rig.focus.copy(rig.target)
      rig.followLambda = damp(rig.followLambda, 10, 1.6, dt)
      lambda = rig.followLambda
    }

    // 開發模式：除錯用的自由鏡頭（截圖檢查建築用，正式版不包含）
    if (import.meta.env.DEV && window.__DDC__?.cameraOverride) {
      const { position, target } = window.__DDC__.cameraOverride
      rig.desiredPosition.set(...position)
      rig.desiredLook.set(...target)
      rig.focus.set(...target)
      cameraState.snap = true
    }

    if (cameraState.snap || !rig.initialized) {
      rig.position.copy(rig.desiredPosition)
      rig.look.copy(rig.desiredLook)
      cameraState.snap = false
      rig.initialized = true
    } else {
      dampVector(rig.position, rig.desiredPosition, lambda, dt)
      dampVector(rig.look, rig.desiredLook, lambda * 1.25, dt)
    }

    camera.position.copy(rig.position)
    camera.lookAt(rig.look)
    renderState.focusDistance = camera.position.distanceTo(rig.focus)
  }, -1)

  return null
}
