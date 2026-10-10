export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** 與影格率無關的指數平滑 */
export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function dampVector(vector, target, lambda, dt) {
  return vector.lerp(target, 1 - Math.exp(-lambda * dt))
}

/** 取兩角度間最短方向的差值 */
export function angleDelta(from, to) {
  let delta = (to - from) % (Math.PI * 2)
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  return delta
}

export function dampAngle(current, target, lambda, dt) {
  return current + angleDelta(current, target) * (1 - Math.exp(-lambda * dt))
}
