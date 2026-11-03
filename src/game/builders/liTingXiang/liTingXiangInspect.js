import { BoxGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 李亭香（老屋新生）店內可以近看的器物（第 11 階段）的 3D 檢視模型：平西餅、平安龜。
 * 形制依據與分層資訊在 data/liTingXiangObjects.js；只產生幾何（頂點色），可以在 Node 測試。
 * 大小與層數是示意（報導只寫「掌心大小」「多層酥皮」「壓紋金箔紙」）。detail：精緻畫質多一些段數與紋路。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)
const cyl = (rt, rb, h, seg, open = false, start = 0, length = Math.PI * 2) => new CylinderGeometry(rt, rb, h, seg, 1, open, start, length)

const CRUST = '#e4c78e'
const CRUST_TOP = '#d7a85e'
const LAYER = '#f1dfb4'
const LAYER_DARK = '#e3c991'
const BEAN = '#f3ecd8'
const PLATE = '#f4f1ea'

/**
 * 平西餅（掌心大、渾圓，約直徑 8 公分、厚 3.5 公分，示意）：兩個半圓，剖面是一圈圈酥皮包著白鳳豆沙。
 * 動作 split：右半往旁邊移開、轉一點，露出剖面的層。
 */
function buildPingxi({ detail }) {
  const seg = detail ? 28 : 16
  const r = 0.04
  const h = 0.035
  const plate = new Parts()
  plate.add(PLATE, cyl(0.075, 0.065, 0.008, seg), { p: [0, 0.004, 0] })
  const half = (side) => {
    const p = new Parts()
    const start = side < 0 ? Math.PI : 0
    // 外皮（半個圓柱）與上面略深的烤色
    p.add(CRUST, cyl(r, r * 1.03, h, seg, false, start, Math.PI), { p: [0, h / 2, 0] })
    p.add(CRUST_TOP, cyl(r * 0.86, r * 0.86, 0.003, seg, false, start, Math.PI), { p: [0, h + 0.0015, 0] })
    // 剖面：一層層的酥皮（細長的薄片）與中間的豆沙
    const layers = detail ? 9 : 5
    for (let i = 0; i < layers; i++) {
      const t = (i + 0.5) / layers
      p.add(i % 2 ? LAYER_DARK : LAYER, box(0.0025, h * 0.9, r * 2 * (1 - Math.abs(t - 0.5) * 0.3)), { p: [side * 0.0015, h / 2, 0], s: [1, 1 - t * 0.0, 1] })
    }
    p.add(BEAN, box(0.003, h * 0.5, r * 1.1), { p: [side * 0.002, h / 2, 0] })
    // 剖面的同心層：外圈幾道淺線（看得出是酥皮包餡）
    if (detail) for (let k = 1; k <= 4; k++) p.add(LAYER_DARK, box(0.0032, 0.0015, r * 2 * (1 - k * 0.12)), { p: [side * 0.0016, h / 2 + (k - 2.5) * 0.006, 0] })
    return p.build()
  }
  return {
    radius: 0.12,
    centerY: 0.03,
    viewPitch: 0.55,
    parts: [
      { id: 'plate', geometry: plate.build() },
      { id: 'left', geometry: half(-1), pivot: [0, 0.008, 0] },
      { id: 'right', geometry: half(1), pivot: [0, 0.008, 0], animate: { action: 'split', axis: 'y', from: 0, to: -0.5, drift: [0.045, 0, 0.01] } },
    ],
  }
}

/**
 * 平安龜（龜形小餅包壓紋金箔紙，約長 7 公分，示意）：金紙的龜殼、頭與四足；裡面的餅是淺褐色。
 * 動作 unwrap：金紙往上掀開，露出裡面的龜形餅。
 */
function buildTurtle({ detail }) {
  const seg = detail ? 20 : 12
  const GOLD = '#d9b24c'
  const GOLD_DARK = '#b8913a'
  const plate = new Parts()
  plate.add(PLATE, cyl(0.07, 0.06, 0.008, seg), { p: [0, 0.004, 0] })
  const cake = new Parts()
  cake.add('#c99a5e', new SphereGeometry(0.03, seg, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, 0.008, 0], s: [1.15, 0.6, 0.9] })
  cake.add('#b9874e', new SphereGeometry(0.009, 8, 6), { p: [0.038, 0.014, 0] })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cake.add('#b9874e', box(0.012, 0.008, 0.01), { p: [sx * 0.022, 0.012, sz * 0.028] })
  const foil = new Parts()
  foil.add(GOLD, new SphereGeometry(0.032, seg, 8, 0, Math.PI * 2, 0, Math.PI / 2), { p: [0, 0.008, 0], s: [1.2, 0.68, 0.95] })
  foil.add(GOLD, new SphereGeometry(0.0105, 8, 6), { p: [0.041, 0.015, 0] })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) foil.add(GOLD_DARK, box(0.014, 0.009, 0.012), { p: [sx * 0.024, 0.013, sz * 0.03] })
  // 壓紋：龜甲的六角紋（示意：殼頂一圈小方塊）
  const n = detail ? 7 : 4
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2
    foil.add(GOLD_DARK, box(0.01, 0.003, 0.01), { p: [Math.cos(a) * 0.018, 0.027, Math.sin(a) * 0.014], r: [0, a, 0] })
  }
  foil.add(GOLD_DARK, box(0.012, 0.004, 0.012), { p: [0, 0.03, 0], r: [0, Math.PI / 4, 0] })
  return {
    radius: 0.11,
    centerY: 0.025,
    viewPitch: 0.5,
    parts: [
      { id: 'plate', geometry: plate.build() },
      { id: 'cake', geometry: cake.build() },
      { id: 'foil', geometry: foil.build(), pivot: [-0.035, 0.008, 0], animate: { action: 'unwrap', axis: 'z', from: 0, to: 1.9, drift: [0, 0.01, 0] } },
    ],
  }
}

export const LTX_INSPECT_BUILDERS = {
  'pingxi-cake': buildPingxi,
  'peace-turtle': buildTurtle,
}
