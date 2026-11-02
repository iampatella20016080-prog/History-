import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BOAT_LEVEL, PIER_HEAD, QING_BOARDING_ERA, RIDE_ROUTE, deckEntryWorld } from '../../data/qingBoardingLayout.js'
import { boardingFade, boardingRiding, createBoarding, requestBoard, requestFall, requestReturn, resetBoarding, ridePath, rideProgress, skipRide, stepBoarding } from '../boarding.js'
import { boardingState, cameraState, playerState } from '../runtime.js'
import { useGameStore } from '../../state/useGameStore.js'

const prefersReducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/**
 * 清末搭船的導演：把 game/boarding.js 的狀態機接到 store、角色與河上的船（執行期狀態在 runtime.boardingState）。
 *
 * - store.boardingRequest（搭船、回棧橋、略過、落水）→ 狀態機
 * - 每個影格推進狀態機：駁船在路線上的位置、畫面黑幕；到了就把人物放上甲板或棧橋頭（teleport，角色元件套用）
 * - 落水：水花（River.jsx 畫）、淡出，把人物放回棧橋頭、面向街道，淡入
 * - 人物離開了甲板（從店家名錄前往店家、換了年代）：狀態回到岸上；不在港口商街一律岸上
 * 在角色（-2）之前執行，這一格的 teleport 角色就會套用。
 */
export function BoardingDirector() {
  const machine = useRef(createBoarding())
  const seen = useRef(0)

  useFrame((frame, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const store = useGameStore.getState()
    let b = machine.current
    const reduced = prefersReducedMotion()

    // 請求
    const request = store.boardingRequest
    if (request && request.nonce !== seen.current) {
      seen.current = request.nonce
      if (request.action === 'board') b = requestBoard(b, { reduced })
      else if (request.action === 'return') b = requestReturn(b, { reduced })
      else if (request.action === 'fall') b = requestFall(b)
      else if (request.action === 'skip') b = skipRide(b)
    }

    // 人物不在甲板上卻還是「在船上」（前往店家、換了年代）；或不在港口商街
    if (b.phase === 'aboard' && playerState.level !== BOAT_LEVEL) b = resetBoarding(b)
    if (store.eraId !== QING_BOARDING_ERA && b.phase !== 'ashore') b = resetBoarding(b)

    const stepped = stepBoarding(b, dt)
    b = stepped.boarding
    for (const event of stepped.events) {
      if (event === 'arrive') {
        const entry = deckEntryWorld()
        boardingState.teleport = { x: entry.x, z: entry.z, heading: entry.heading, level: BOAT_LEVEL, nonce: (boardingState.teleport?.nonce ?? 0) + 1 }
      } else if (event === 'land' || event === 'rescue') {
        boardingState.teleport = { x: PIER_HEAD.x, z: PIER_HEAD.z, heading: PIER_HEAD.heading, level: 0, nonce: (boardingState.teleport?.nonce ?? 0) + 1 }
      } else if (event === 'splash') {
        const p = playerState.position
        boardingState.splash = { x: p.x, z: p.z, at: frame.clock.elapsedTime, nonce: (boardingState.splash?.nonce ?? 0) + 1 }
      }
    }
    machine.current = b

    // 執行期狀態
    boardingState.phase = b.phase
    boardingState.t = b.t
    const riding = boardingRiding(b)
    if (riding !== boardingState.riding) {
      boardingState.riding = riding
      // 划船開始與結束時鏡頭直接切換（不從河上滑回人物身後）
      cameraState.snap = true
    }
    const s = rideProgress(b)
    const at = ridePath(RIDE_ROUTE, s)
    boardingState.ride.s = s
    boardingState.ride.x = at.x
    boardingState.ride.z = at.z
    boardingState.ride.yaw = at.yaw
    boardingState.fade = boardingFade(b)
    if (store.boardingPhase !== b.phase) store.setBoardingPhase(b.phase)
    if (import.meta.env.DEV && window.__DDC__) window.__DDC__.boarding = { phase: b.phase, t: b.t, s, fade: boardingState.fade, level: playerState.level }
  }, -3)

  return null
}
