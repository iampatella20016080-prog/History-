/**
 * 場景與操作的共用常數（單位：公尺、秒、弧度）
 *
 * 座標系：街道沿 X 軸延伸，西側（x < 0）通往淡水河岸碼頭；
 * 街道中心線 z = 0，北側街屋位於 z < 0，南側位於 z > 0；Y 軸朝上。
 */

/** Three.js 圖層：NO_OUTLINE 圖層的物件不參與輪廓線計算（天空、遠山、半透明效果） */
export const LAYERS = {
  NO_OUTLINE: 1,
}

export const STREET = {
  facadeZ: 4.5, // 街屋立面到街道中心線的距離
  walkwayDepth: 1.7, // 簷下步道（亭仔腳）深度
  walkwayHeight: 0.15,
  laneHalfWidth: 1.35, // 中央石板路半寬
  rowStartX: -34, // 街屋列西端（接河岸廣場）
  rowEndX: 36, // 街屋列東端
  walkEndX: 34.2, // 東側可行走邊界
  endFacadeX: 38, // 街底橫向建築的立面
}

export const PLAZA = {
  minX: -44,
  maxX: -34,
  halfDepth: 9.5,
}

export const PIER = {
  minX: -53,
  maxX: -44,
  halfWidth: 1.45,
}

export const RIVER = {
  edgeX: -44.6, // 河岸石砌堤防外緣
  waterLevel: -1.05,
}

export const PLAYER = {
  radius: 0.32,
  walkSpeed: 3.0,
  runSpeed: 5.4,
  spawn: { x: 13, z: 0.7, heading: -Math.PI / 2 },
}

export const CAMERA = {
  fov: 42,
  near: 0.3,
  far: 1600,
  yaw: Math.PI / 2,
  pitch: 0.38,
  distance: 7.8,
  minDistance: 3.4,
  maxDistance: 12.5,
  minPitch: 0.12,
  maxPitch: 1.0,
  targetHeight: 1.45, // 鏡頭環繞中心（角色胸口）
  lookHeight: 2.35, // 注視點略高於角色，讓角色位於畫面中央偏下
}

/** 陽光方向：西南方斜照，北側店面（含林復振）受光 */
export const SUN = {
  offset: [-26, 42, 30],
  color: '#fff0d4',
  intensity: 2.55,
}

export const PALETTE = {
  ink: '#2b211a',
  skyTop: '#bfd3d4',
  skyHorizon: '#efe6d0',
  haze: '#e7dfca',
  hemiSky: '#e3ecea',
  hemiGround: '#c7b08b',
}
