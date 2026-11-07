import { IcosahedronGeometry } from 'three'
import { createRng } from '../../utils/random.js'

/** 米斗：上寬下窄的木斗，四片木板、金屬角件與斗裡的米（size 是斗口的半寬） */
export function riceMeasure(b, detail, x, y, z, size = 0.2, rotationY = 0) {
  const h = size * 1.05
  b.group([x, y, z], rotationY, () => {
    const bottom = size * 0.72
    for (const [rx, rz, sx, sz] of [
      [0, 1, 0, 1],
      [0, -1, 0, -1],
      [1, 0, 1, 0],
      [-1, 0, -1, 0],
    ]) {
      const tilt = Math.atan2(size - bottom, h)
      const len = (size + bottom) + 0.03
      if (rz) b.box('wood', [len, h, 0.025], [0, h / 2, rz * (size + bottom) / 2], { rotation: [rz * tilt, 0, 0], tint: rz > 0 ? '#9a6e44' : '#8a6038' })
      else b.box('wood', [0.025, h, len], [rx * (size + bottom) / 2, h / 2, 0], { rotation: [0, 0, -rx * tilt], tint: rx > 0 ? '#a37548' : '#80583a' })
      void sx
      void sz
    }
    b.box('wood', [bottom * 2, 0.025, bottom * 2], [0, 0.0125, 0], { tint: '#6e4a2e' })
    // 金屬角件與斗口的磨損
    for (const [cx, cz] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) b.box('steel', [0.035, 0.05, 0.035], [cx * size * 0.98, h - 0.03, cz * size * 0.98], { tint: '#3f3a34' })
    // 斗裡的米（少量米粒在細部）
    b.box('plain', [size * 1.7, 0.02, size * 1.7], [0, h - 0.05, 0], { tint: '#efe9d8' })
    const rng = createRng(Math.round(x * 100 + z * 10))
    for (let i = 0; i < 18; i++) detail.add('plain', new IcosahedronGeometry(0.006, 0), { position: [x + (rng() - 0.5) * size * 1.5, y + h - 0.035, z + (rng() - 0.5) * size * 1.5], scale: [1.8, 0.8, 1], tint: '#f5f1e4' })
  })
}
