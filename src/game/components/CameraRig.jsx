import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Raycaster, Vector2, Vector3 } from 'three'
import { CAMERA, LAYERS } from '../config.js'
import { raycastBoxes } from '../collision.js'
import { moveInput } from '../input.js'
import { cameraState, playerState, renderState } from '../runtime.js'
import { clamp, damp, dampAngle, dampVector } from '../utils/math.js'
import {
  VIEWER,
  allowedDistance,
  clampViewerTarget,
  facadeOf,
  indoorFollow,
  interiorAmount,
  orbitDirection,
  pickBuilding,
  planBuildingFocus,
  segmentBlocked,
} from '../viewerCamera.js'
import { useGameStore } from '../../state/useGameStore.js'

const INTRO_LOOK = new Vector3(-22, 2.4, -0.4)
const UP = new Vector3(0, 1, 0)
/** 點一下（而不是拖曳）的判定：移動不超過幾個像素、按住不超過多久 */
const TAP_SLOP = 9
const TAP_TIME = 450
/** 觀賞模式：鍵盤 WASD 平移注視點的速度（公尺／秒） */
const VIEWER_KEY_SPEED = 7
/** 在室內進入觀賞模式：注視點較低、鏡頭較平也較近，才不會一開始就頂到天花板或退到門外 */
const VIEWER_INDOOR_START = { height: 1.7, pitch: 0.16, distance: 4.5 }

/**
 * 鏡頭
 *
 * 探索（第三人稱）
 * - 平滑跟隨角色；滑鼠拖曳旋轉視角、滾輪縮放；觸控單指旋轉、雙指縮放
 * - 會被建築遮擋時自動拉近，避免穿牆
 * - 走進室內（永樂市場）時平滑拉近、壓低，鏡頭留在天花板與吊牌下方
 * - 探索店家時平滑移到店面前，並把店面留在介紹視窗左側
 * - 靠近已開放的店家時，點一下店面即可開啟介紹
 *
 * 建築觀賞（自由環繞）
 * - 電腦：左鍵拖曳旋轉、右鍵拖曳平移、滾輪縮放、WASD 移動；觸控：單指旋轉、雙指平移與捏合縮放
 * - 點一下建築：平滑聚焦整個立面（依建築大小決定距離）
 * - 鏡頭不穿牆、不低於地面、不離開街區；返回探索時平滑回到角色身後
 * - 可以走進去的建築（viewerSpace 的額外範圍）：注視點可以移進騎樓與一樓室內，高度不超過天花板
 */
export function CameraRig({ blockers, buildings, shopModels, interiors = [], viewerSpace }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)
  // 事件處理只註冊一次，從 ref 讀取目前年代的建築資料
  const sceneRef = useRef({ blockers, buildings, shopModels, space: viewerSpace })
  sceneRef.current = { blockers, buildings, shopModels, space: viewerSpace }

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
      /** 室內鏡頭的混合程度（0 街道 – 1 室內）與目前的室內範圍 */
      indoor: 0,
      indoorZone: null,
      initialized: false,
      viewer: {
        /** off：第三人稱；active：觀賞中；returning：返回探索，鏡頭正移回角色身後 */
        phase: 'off',
        target: new Vector3(),
        goalTarget: new Vector3(),
        yaw: 0,
        pitch: 0,
        distance: VIEWER.start.distance,
        goalYaw: 0,
        goalPitch: 0,
        goalDistance: VIEWER.start.distance,
        collision: VIEWER.start.distance,
        lambda: 3,
        returnTime: 0,
        focusNonce: 0,
      },
    }),
    [],
  )

  useEffect(() => {
    camera.layers.enable(LAYERS.NO_OUTLINE)
  }, [camera])

  // 開發模式：測試用的鏡頭與建築資料（正式版不包含）
  useEffect(() => {
    if (!import.meta.env.DEV || !window.__DDC__) return undefined
    const debug = window.__DDC__
    debug.camera = camera
    debug.cameraScene = sceneRef
    /** 建築立面（中央、離地 height 公尺）在畫面上的位置；key 可以是店家 id 或建築 id */
    debug.facadeScreenPoint = (key, height = 2) => {
      const building = sceneRef.current.buildings?.find((item) => item.storeId === key || item.id === key)
      if (!building) return null
      const { center, forward } = facadeOf(building)
      const point = new Vector3(center.x + forward.x * 0.3, height, center.z + forward.z * 0.3).project(camera)
      const rect = gl.domElement.getBoundingClientRect()
      return {
        id: building.id,
        storeId: building.storeId,
        x: rect.left + ((point.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - point.y) / 2) * rect.height,
        inView: Math.abs(point.x) < 0.9 && Math.abs(point.y) < 0.9 && point.z < 1,
      }
    }
    debug.storefrontScreenPoint = (storeId) => debug.facadeScreenPoint(storeId, 2)
    return () => {
      delete debug.facadeScreenPoint
      delete debug.storefrontScreenPoint
    }
  }, [camera, gl])

  useEffect(() => {
    const element = gl.domElement
    const v = rig.viewer
    const touches = new Map()
    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const dir = new Vector3()
    let pinch = null
    let mouseId = null
    let mouseButton = 0
    let lastX = 0
    let lastY = 0
    let tap = null

    const store = () => useGameStore.getState()
    const inViewer = () => store().started && store().viewMode === 'viewer'
    const canExplore = () => {
      const { started, mode, viewMode } = store()
      return started && mode === 'explore' && viewMode === 'explore'
    }
    const canControl = () => inViewer() || canExplore()

    const rotate = (dx, dy, k) => {
      if (inViewer()) {
        v.goalYaw -= dx * 0.005 * k
        v.goalPitch = clamp(v.goalPitch + dy * 0.004 * k, VIEWER.minPitch, VIEWER.maxPitch)
        v.lambda = 9
        return
      }
      cameraState.targetYaw -= dx * 0.0055 * k
      cameraState.targetPitch = clamp(cameraState.targetPitch + dy * 0.0038 * k, CAMERA.minPitch, CAMERA.maxPitch)
    }
    // 觀賞模式平移：沿著畫面的左右與上下移動注視點（拖曳多少，街景就跟著手指移動多少）
    const pan = (dx, dy) => {
      const height = Math.max(1, element.clientHeight)
      const scale = (2 * Math.min(v.distance, v.collision) * Math.tan(MathUtils.degToRad(camera.fov / 2))) / height
      const sinYaw = Math.sin(v.yaw)
      const cosYaw = Math.cos(v.yaw)
      const sinPitch = Math.sin(v.pitch)
      const cosPitch = Math.cos(v.pitch)
      v.goalTarget.x += (-cosYaw * dx - sinYaw * sinPitch * dy) * scale
      v.goalTarget.y += cosPitch * dy * scale
      v.goalTarget.z += (sinYaw * dx - cosYaw * sinPitch * dy) * scale
      clampViewerTarget(v.goalTarget, sceneRef.current.blockers, sceneRef.current.space)
      v.lambda = 9
    }
    // 縮放：factor > 1 拉遠、< 1 拉近；已經拉到最近時，改成往前推進（方便沿街移動）
    const zoom = (factor) => {
      if (inViewer()) {
        const next = v.goalDistance * factor
        if (factor < 1 && v.goalDistance <= VIEWER.minDistance + 0.01) {
          orbitDirection(v.yaw, v.pitch, dir)
          v.goalTarget.addScaledVector(dir, -(1 - factor) * 9)
          clampViewerTarget(v.goalTarget, sceneRef.current.blockers, sceneRef.current.space)
        } else if (factor > 1 && next > v.collision + 1.5) {
          v.goalDistance = Math.max(v.goalDistance, Math.min(next, v.collision + 1.5))
        } else {
          v.goalDistance = clamp(next, VIEWER.minDistance, VIEWER.maxDistance)
        }
        v.lambda = 9
        return
      }
      cameraState.targetDistance = clamp(cameraState.targetDistance * factor, CAMERA.minDistance, CAMERA.maxDistance)
    }
    const pinchState = () => {
      const [a, b] = [...touches.values()]
      return { distance: Math.hypot(a.x - b.x, a.y - b.y), midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 }
    }

    // 點一下：觀賞模式聚焦建築；探索模式點已開放店家的店面（需在店家附近）開啟介紹
    const onTap = (clientX, clientY) => {
      const rect = element.getBoundingClientRect()
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const building = pickBuilding(raycaster.ray.origin, raycaster.ray.direction, sceneRef.current.buildings ?? [])
      if (!building) return
      if (inViewer()) {
        focusOn(building)
      } else if (canExplore() && building.storeId && building.storeId === store().nearbyShopId) {
        store().interact()
      }
    }
    const focusOn = (building) => {
      const plan = planBuildingFocus(building, sceneRef.current.blockers, {
        yaw: v.yaw,
        aspect: element.clientWidth / Math.max(1, element.clientHeight),
        fov: camera.fov,
        space: sceneRef.current.space,
      })
      v.goalTarget.set(plan.target.x, plan.target.y, plan.target.z)
      // 旋轉走最短的方向
      v.goalYaw = v.yaw + Math.atan2(Math.sin(plan.yaw - v.yaw), Math.cos(plan.yaw - v.yaw))
      v.goalPitch = plan.pitch
      v.goalDistance = plan.distance
      v.lambda = 3.2
      // 中間隔著牆（例如從市場裡聚焦外面的立面）：直接切換過去，鏡頭不從牆裡穿過
      if (segmentBlocked(v.target, v.goalTarget, sceneRef.current.blockers)) {
        v.target.copy(v.goalTarget)
        v.yaw = v.goalYaw
        v.pitch = v.goalPitch
        v.distance = v.goalDistance
        v.collision = plan.distance
        cameraState.snap = true
      }
    }
    rig.focusOn = focusOn

    const onDown = (event) => {
      if (!canControl()) return
      if (event.pointerType === 'touch') {
        event.preventDefault()
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
        element.setPointerCapture?.(event.pointerId)
        pinch = touches.size >= 2 ? pinchState() : null
        tap = touches.size === 1 ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp } : null
        element.classList.add('is-dragging')
        return
      }
      if (event.button !== 0 && event.button !== 1 && event.button !== 2) return
      if (event.button === 1) event.preventDefault()
      mouseId = event.pointerId
      mouseButton = event.button
      lastX = event.clientX
      lastY = event.clientY
      tap = event.button === 0 ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp } : null
      element.setPointerCapture?.(event.pointerId)
      element.classList.add('is-dragging')
    }
    const onMove = (event) => {
      if (tap && tap.id === event.pointerId && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > TAP_SLOP) tap = null
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
            zoom(pinch.distance / next.distance)
            // 雙指一起移動：觀賞模式平移，探索模式旋轉
            if (inViewer()) pan(next.midX - pinch.midX, next.midY - pinch.midY)
            else rotate(next.midX - pinch.midX, (next.midY - pinch.midY) * 0.6, 0.9)
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
      if (!canControl()) return
      if (inViewer() && mouseButton !== 0) pan(dx, dy)
      else rotate(dx, dy, 1)
    }
    const onUp = (event) => {
      const tapped = tap && tap.id === event.pointerId && event.type === 'pointerup' && event.timeStamp - tap.time < TAP_TIME
      if (tap?.id === event.pointerId) tap = null
      if (event.pointerType === 'touch') {
        if (!touches.delete(event.pointerId)) return
        element.releasePointerCapture?.(event.pointerId)
        pinch = touches.size >= 2 ? pinchState() : null
        if (touches.size === 0) element.classList.remove('is-dragging')
      } else {
        if (event.pointerId !== mouseId) return
        mouseId = null
        element.releasePointerCapture?.(event.pointerId)
        element.classList.remove('is-dragging')
      }
      if (tapped && canControl()) onTap(event.clientX, event.clientY)
    }
    const onWheel = (event) => {
      if (!canControl()) return
      event.preventDefault()
      zoom(1 + clamp(event.deltaY, -120, 120) * (inViewer() ? 0.0013 : 0.0011))
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
      rig.focusOn = null
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onUp)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('contextmenu', onContextMenu)
      element.removeEventListener('gesturestart', onGesture)
      element.removeEventListener('gesturechange', onGesture)
    }
  }, [gl, camera, rig])

  useFrame((frame, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const { started, mode, activeShopId, viewMode, viewerFocus } = useGameStore.getState()
    const v = rig.viewer
    const p = playerState.position

    cameraState.yaw = dampAngle(cameraState.yaw, cameraState.targetYaw, 10, dt)
    cameraState.pitch = damp(cameraState.pitch, cameraState.targetPitch, 10, dt)
    cameraState.distance = damp(cameraState.distance, cameraState.targetDistance, 8, dt)

    // 進入觀賞模式：從目前的鏡頭位置出發，平滑移到角色附近、略高於街道的位置
    if (started && viewMode === 'viewer' && v.phase !== 'active') {
      if (v.phase === 'off') {
        v.target.copy(rig.look)
        rig.desiredPosition.subVectors(rig.position, rig.look)
        v.distance = Math.max(0.5, rig.desiredPosition.length())
        v.yaw = Math.atan2(rig.desiredPosition.x, rig.desiredPosition.z)
        v.pitch = Math.asin(clamp(rig.desiredPosition.y / v.distance, -1, 1))
        v.collision = v.distance
      }
      v.phase = 'active'
      const indoor = (interiorAmount(p, interiors)?.amount ?? 0) > 0.5
      const start = indoor ? VIEWER_INDOOR_START : VIEWER.start
      v.goalTarget.set(p.x, start.height, p.z)
      clampViewerTarget(v.goalTarget, blockers, viewerSpace)
      v.goalYaw = v.yaw + Math.atan2(Math.sin(cameraState.yaw - v.yaw), Math.cos(cameraState.yaw - v.yaw))
      v.goalPitch = start.pitch
      v.goalDistance = start.distance
      v.lambda = 3
      v.focusNonce = viewerFocus?.nonce ?? v.focusNonce
    } else if (viewMode !== 'viewer' && v.phase === 'active') {
      rig.target.set(p.x, CAMERA.targetHeight, p.z)
      if (segmentBlocked(v.target, rig.target, blockers)) {
        // 鏡頭與角色之間隔著牆（例如角色在市場裡、鏡頭在外面）：直接切回第三人稱，不穿牆飛回去
        v.phase = 'off'
        cameraState.snap = true
      } else {
        v.phase = 'returning'
        v.returnTime = 0
        v.lambda = 3.4
      }
    } else if (v.phase === 'returning' && cameraState.snap) {
      // 返回途中角色被傳送（例如從店家名錄前往店門口）：直接交還第三人稱鏡頭
      v.phase = 'off'
    }

    // 店家名錄的「聚焦建築」
    if (v.phase === 'active' && viewerFocus && viewerFocus.nonce !== v.focusNonce) {
      v.focusNonce = viewerFocus.nonce
      // 聚焦店家的建築本身（不是店裡的細部，例如豆花櫃台）
      const building = buildings?.find((item) => item.storeId === viewerFocus.storeId && !item.detail)
      if (building) rig.focusOn?.(building)
    }

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
      v.phase = 'off'
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
    } else if (v.phase !== 'off') {
      // 建築觀賞：繞著注視點環繞；返回探索時，目標改成第三人稱鏡頭的位置（在室內就是室內的鏡頭）
      if (v.phase === 'returning') {
        const indoor = interiorAmount(p, interiors)
        const follow = indoorFollow(cameraState.pitch, cameraState.distance, indoor?.amount ?? 0, indoor?.zone.camera)
        v.goalTarget.set(p.x, CAMERA.targetHeight, p.z)
        v.goalYaw = v.yaw + Math.atan2(Math.sin(cameraState.yaw - v.yaw), Math.cos(cameraState.yaw - v.yaw))
        v.goalPitch = follow.pitch
        v.goalDistance = follow.distance
        v.returnTime += dt
      } else {
        // 鍵盤 WASD：沿著視線的水平方向與左右移動注視點
        const forward = (moveInput.forward ? 1 : 0) - (moveInput.back ? 1 : 0)
        const right = (moveInput.right ? 1 : 0) - (moveInput.left ? 1 : 0)
        if (forward || right) {
          const step = VIEWER_KEY_SPEED * (moveInput.run ? 1.8 : 1) * dt
          v.goalTarget.x += (-Math.sin(v.yaw) * forward + Math.cos(v.yaw) * right) * step
          v.goalTarget.z += (-Math.cos(v.yaw) * forward - Math.sin(v.yaw) * right) * step
          clampViewerTarget(v.goalTarget, blockers, viewerSpace)
          v.lambda = 9
        }
      }
      v.target.x = damp(v.target.x, v.goalTarget.x, v.lambda, dt)
      v.target.y = damp(v.target.y, v.goalTarget.y, v.lambda, dt)
      v.target.z = damp(v.target.z, v.goalTarget.z, v.lambda, dt)
      v.yaw = damp(v.yaw, v.goalYaw, v.lambda * 1.1, dt)
      v.pitch = damp(v.pitch, v.goalPitch, v.lambda * 1.1, dt)
      v.distance = damp(v.distance, v.goalDistance, v.lambda, dt)

      orbitDirection(v.yaw, v.pitch, rig.direction)
      const allowed = allowedDistance(v.target, rig.direction, v.distance, blockers, viewerSpace)
      v.collision = allowed < v.collision ? allowed : damp(v.collision, allowed, 3, dt)
      const distance = Math.min(v.distance, v.collision)
      rig.desiredPosition.copy(v.target).addScaledVector(rig.direction, distance)
      rig.desiredLook.copy(v.target)
      rig.focus.copy(v.target)
      lambda = 24

      if (v.phase === 'returning') {
        const settled =
          v.target.distanceTo(v.goalTarget) < 0.08 &&
          Math.abs(v.yaw - v.goalYaw) < 0.03 &&
          Math.abs(v.pitch - v.goalPitch) < 0.02 &&
          Math.abs(v.distance - v.goalDistance) < 0.12
        if (settled || v.returnTime > 2.2) {
          // 交還給第三人稱鏡頭（注視點的高度差由跟隨的平滑處理）
          v.phase = 'off'
          rig.collisionDistance = v.collision
          rig.followLambda = 5
          const indoor = interiorAmount(p, interiors)
          rig.indoor = indoor?.amount ?? 0
          if (indoor) rig.indoorZone = indoor.zone
        }
      }
    } else {
      // 第三人稱跟隨
      rig.target.set(p.x, CAMERA.targetHeight, p.z)
      // 室內：從街道走向大門時逐漸拉近、壓低（混合程度平滑變化；傳送時直接到位）
      const indoor = interiorAmount(p, interiors)
      if (indoor) rig.indoorZone = indoor.zone
      const indoorGoal = indoor?.amount ?? 0
      rig.indoor = cameraState.snap ? indoorGoal : damp(rig.indoor, indoorGoal, 2.4, dt)
      const k = rig.indoorZone ? rig.indoor : 0
      const shot = rig.indoorZone?.camera
      const { pitch, distance: wanted, minDistance } = indoorFollow(cameraState.pitch, cameraState.distance, k, shot)
      const cosPitch = Math.cos(pitch)
      rig.direction.set(Math.sin(cameraState.yaw) * cosPitch, Math.sin(pitch), Math.cos(cameraState.yaw) * cosPitch)
      if (cameraState.snap) rig.collisionDistance = wanted
      const hit = raycastBoxes(rig.target, rig.direction, wanted + 0.45, blockers)
      let allowed = Math.max(minDistance, hit - 0.45)
      if (k > 0.001 && rig.direction.y > 0.01) {
        // 室內的鏡頭高度上限（在吊牌與燈具下方）；越接近街道上限越高
        const maxHeight = shot.maxHeight + (1 - k) * 6
        allowed = Math.min(allowed, Math.max(minDistance, (maxHeight - rig.target.y) / rig.direction.y))
      }
      rig.collisionDistance = allowed < rig.collisionDistance ? allowed : damp(rig.collisionDistance, allowed, 3, dt)
      const distance = Math.min(wanted, rig.collisionDistance)
      rig.desiredPosition.copy(rig.target).addScaledVector(rig.direction, distance)
      // 鏡頭被拉近時，注視點逐漸降回角色胸口，避免仰角過大；室內注視點略高於胸口
      const lookBlend = clamp(distance / CAMERA.distance, 0, 1)
      let lookHeight = CAMERA.targetHeight + (CAMERA.lookHeight - CAMERA.targetHeight) * lookBlend
      if (k > 0.001) lookHeight += (shot.lookHeight - lookHeight) * k
      rig.desiredLook.set(p.x, lookHeight, p.z)
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
    if (import.meta.env.DEV && window.__DDC__) {
      window.__DDC__.viewer = v
      window.__DDC__.indoor = { amount: rig.indoor, zone: rig.indoorZone?.id ?? null }
      window.__DDC__.frameCount = (window.__DDC__.frameCount ?? 0) + 1
    }
  }, -1)

  return null
}
