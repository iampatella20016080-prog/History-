import { Vector3 } from 'three'
import { CAMERA, PLAYER, RIVER } from './config.js'

/**
 * 每一影格都會讀寫的執行期狀態。
 * 使用可變物件而非 React state，避免高頻更新造成重新渲染。
 */
export const playerState = {
  position: new Vector3(PLAYER.spawn.x, 0, PLAYER.spawn.z),
  velocity: new Vector3(),
  heading: PLAYER.spawn.heading,
  speed: 0,
  /** 所在樓層（0：街道與一樓；position.y 是腳下地板的高度，例如走樓梯上二樓） */
  level: 0,
}

export const cameraState = {
  yaw: CAMERA.yaw,
  pitch: CAMERA.pitch,
  distance: CAMERA.distance,
  targetYaw: CAMERA.yaw,
  targetPitch: CAMERA.pitch,
  targetDistance: CAMERA.distance,
  /** 設為 true 時，下一影格鏡頭直接跳到目標位置（傳送後使用） */
  snap: false,
}

/**
 * 清末搭船的執行期狀態（components/BoardingDirector.jsx 每個影格寫入；角色、鏡頭、河上的船與介面讀取）
 *   phase／t       與 game/boarding.js 的狀態相同（phase 另外也寫進 store，給介面用）
 *   riding         駁船正在河上
 *   ride           駁船目前的位置 { s, x, z, yaw }（s：0 棧橋、1 帆船旁）
 *   fade           畫面黑幕 0–1
 *   teleport       要角色元件把人物放到某處 { x, z, heading, level, nonce }
 *   splash         落水的水花 { x, z, at, nonce }（at：發生時的時鐘秒數）
 */
export const boardingState = {
  phase: 'ashore',
  t: 0,
  riding: false,
  ride: { s: 0, x: 0, z: 0, yaw: 0 },
  /** 駁船目前的高度（含起伏；River.jsx 寫入，人物站在船上時用） */
  rideY: RIVER.waterLevel - 0.2,
  fade: 0,
  teleport: null,
  splash: null,
}

/** 後製參數（由鏡頭控制器寫入、渲染器讀取） */
export const renderState = {
  focusDistance: CAMERA.distance,
  blurStrength: 1,
}
