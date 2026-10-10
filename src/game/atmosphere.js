import { Color, MathUtils, Vector3 } from 'three'

/**
 * 年代氛圍（光線、天空、霧氣、調色、燈火）
 *
 * 每個年代在 eras.js 的 lighting 定義一組數值；切換年代時由 from 平滑過渡到 to。
 * 場景中的天空、燈光、霧、遠山、河面與後製都在每一影格讀取 atmosphere.current。
 */
const COLOR_KEYS = [
  ['sunColor', (l) => l.sun.color],
  ['hemiSky', (l) => l.hemi.sky],
  ['hemiGround', (l) => l.hemi.ground],
  ['ambientColor', (l) => l.ambient.color],
  ['skyTop', (l) => l.sky.top],
  ['skyHorizon', (l) => l.sky.horizon],
  ['skyBottom', (l) => l.sky.bottom],
  ['sunGlow', (l) => l.sky.sunGlow],
  ['fogColor', (l) => l.fog.color],
  ['mountains', (l) => l.mountains],
  ['water', (l) => l.water],
  ['cloudColor', (l) => l.clouds.color],
  ['cloudEmissive', (l) => l.clouds.emissive],
  ['lineColor', (l) => l.lines.color],
]

const NUMBER_KEYS = [
  ['sunIntensity', (l) => l.sun.intensity],
  ['hemiIntensity', (l) => l.hemi.intensity],
  ['ambientIntensity', (l) => l.ambient.intensity],
  ['stars', (l) => l.sky.stars],
  ['fogNear', (l) => l.fog.near],
  ['fogFar', (l) => l.fog.far],
  ['exposure', (l) => l.grade.exposure],
  ['saturation', (l) => l.grade.saturation],
  ['contrast', (l) => l.grade.contrast],
  ['vignette', (l) => l.grade.vignette],
  ['lineStrength', (l) => l.lines.strength],
  ['glow', (l) => l.glow],
  ['riverMist', (l) => l.riverMist],
  ['tintR', (l) => l.grade.tint[0]],
  ['tintG', (l) => l.grade.tint[1]],
  ['tintB', (l) => l.grade.tint[2]],
  ['azimuth', (l) => l.sun.azimuth],
  ['elevation', (l) => l.sun.elevation],
]

function snapshot(lighting) {
  const state = {}
  for (const [key, get] of COLOR_KEYS) state[key] = new Color(get(lighting))
  for (const [key, get] of NUMBER_KEYS) state[key] = get(lighting)
  return state
}

function createCurrent() {
  const state = {}
  for (const [key] of COLOR_KEYS) state[key] = new Color()
  for (const [key] of NUMBER_KEYS) state[key] = 0
  state.sunDirection = new Vector3(0, 1, 0) // 天空中的太陽方向（含真實高度）
  state.lightDirection = new Vector3(0, 1, 0) // 投射陰影的光線方向（高度有下限，避免陰影過長）
  return state
}

export const atmosphere = {
  from: null,
  to: null,
  progress: 1,
  current: createCurrent(),
  version: 0,
}

/** 方位角（度，0 = 北 −z、90 = 東 +x）與仰角 → 單位向量 */
function directionFrom(azimuth, elevation, target) {
  const a = MathUtils.degToRad(azimuth)
  const e = MathUtils.degToRad(elevation)
  return target.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e))
}

function smooth(t) {
  return t * t * (3 - 2 * t)
}

function apply() {
  const { from, to, current } = atmosphere
  const t = smooth(MathUtils.clamp(atmosphere.progress, 0, 1))
  for (const [key] of COLOR_KEYS) current[key].copy(from[key]).lerp(to[key], t)
  for (const [key] of NUMBER_KEYS) current[key] = from[key] + (to[key] - from[key]) * t
  // 方位角走最短的方向
  let delta = to.azimuth - from.azimuth
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  current.azimuth = from.azimuth + delta * t
  directionFrom(current.azimuth, current.elevation, current.sunDirection)
  directionFrom(current.azimuth, Math.max(current.elevation, 24), current.lightDirection)
  atmosphere.version++
}

/** 直接套用某個年代（初次載入） */
export function setAtmosphere(era) {
  atmosphere.from = snapshot(era.lighting)
  atmosphere.to = atmosphere.from
  atmosphere.progress = 1
  apply()
}

/** 開始往另一個年代過渡（從目前的混合狀態出發，可在過渡中途改變目標） */
export function beginAtmosphereTransition(era) {
  if (!atmosphere.to) {
    setAtmosphere(era)
    return
  }
  const from = {}
  for (const [key] of COLOR_KEYS) from[key] = atmosphere.current[key].clone()
  for (const [key] of NUMBER_KEYS) from[key] = atmosphere.current[key]
  atmosphere.from = from
  atmosphere.to = snapshot(era.lighting)
  atmosphere.progress = 0
  apply()
}

export function setAtmosphereProgress(progress) {
  if (!atmosphere.to) return
  atmosphere.progress = progress
  apply()
}
