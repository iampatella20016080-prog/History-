import { Vector3 } from 'three'
import { CAMERA, PLAYER } from './config.js'

/**
 * 每一影格都會讀寫的執行期狀態。
 * 使用可變物件而非 React state，避免高頻更新造成重新渲染。
 */
export const playerState = {
  position: new Vector3(PLAYER.spawn.x, 0, PLAYER.spawn.z),
  velocity: new Vector3(),
  heading: PLAYER.spawn.heading,
  speed: 0,
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

/** 後製參數（由鏡頭控制器寫入、渲染器讀取） */
export const renderState = {
  focusDistance: CAMERA.distance,
  blurStrength: 1,
}
