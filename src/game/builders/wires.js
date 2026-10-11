import { CylinderGeometry, Euler, Quaternion, Vector3 } from 'three'

/**
 * 懸垂的電線與燈籠串（懸鏈線以拋物線近似）。
 * 線段以細圓柱組成並併入靜態網格，輪廓描線會自然把它們畫成墨線。
 */
const UP = new Vector3(0, 1, 0)
const _dir = new Vector3()
const _quat = new Quaternion()
const _euler = new Euler()

export function catenaryPoints(from, to, sag, segments) {
  const points = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    points.push(
      new Vector3(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t - sag * 4 * t * (1 - t),
        from[2] + (to[2] - from[2]) * t,
      ),
    )
  }
  return points
}

function segment(b, material, a, c, radius, tint) {
  _dir.subVectors(c, a)
  const length = _dir.length()
  if (length < 1e-4) return
  _quat.setFromUnitVectors(UP, _dir.normalize())
  _euler.setFromQuaternion(_quat)
  b.add(material, new CylinderGeometry(radius, radius, length, 4, 1, true), {
    position: [(a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2],
    rotation: [_euler.x, _euler.y, _euler.z],
    tint,
  })
}

/** 一條懸垂的線 */
export function wire(b, { from, to, sag = 0.5, radius = 0.016, tint = '#2f2a26', segments = 10 }) {
  const points = catenaryPoints(from, to, sag, segments)
  for (let i = 0; i < points.length - 1; i++) segment(b, 'dark', points[i], points[i + 1], radius, tint)
  return points
}

/**
 * 跨街的燈籠串：沿懸垂線掛上小燈籠。
 * scales（每盞的大小）、offsets（間距的偏移，以間距為單位）與 drops（吊繩加長）可讓燈籠不那麼整齊。
 */
export function lanternString(b, { from, to, sag = 0.8, count = 7, scale = 0.55, scales = null, offsets = null, drops = null }) {
  const points = catenaryPoints(from, to, sag, 24)
  for (let i = 0; i < points.length - 1; i++) segment(b, 'dark', points[i], points[i + 1], 0.012, '#3a2c24')
  for (let k = 1; k <= count; k++) {
    const t = (k + (offsets?.[k - 1] ?? 0)) / (count + 1)
    const index = Math.min(points.length - 1, Math.max(0, Math.round(t * 24)))
    const p = points[index]
    const size = scales?.[k - 1] ?? scale
    const cord = 0.18 + (drops?.[k - 1] ?? 0)
    segment(b, 'dark', p, new Vector3(p.x, p.y - cord, p.z), 0.008, '#3a2c24')
    b.addLantern(p.x, p.y - cord - 0.3 * size, p.z, { scale: size, glow: true })
  }
}
