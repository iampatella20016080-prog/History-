import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「街坊故事」的器物（第 12 階段）：依國立臺灣歷史博物館典藏的形制程式建模（data/routes/neighbourRoute.js）；
 * 故事是虛構的，器物的樣子有依據。每個建模函式接受 { detail }，
 * 原點在器物底部中央；radius、centerY、viewPitch 的意思同 pastryObjects.js。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

const GLAZE = '#6a3a22'
const GLAZE_LIGHT = '#8a5232'
const CLAY = '#c86e4a'
const MUSHROOM = '#6a4a32'
const MUSHROOM_CAP = '#4a3426'
const BAMBOO = '#c9ae74'
const BAMBOO_DARK = '#a88d55'
const RATTAN = '#8a6a44'
const INK = '#2f2a26'
const WOOD = '#9a6f45'
const WOOD_DARK = '#76522f'
const METAL = '#b9b3a6'
const BRASS = '#b8944a'
const PURPLE = '#6a4a7a'
const RED_CORD = '#b8323a'
const SILVER = '#d6d6d2'
const SILVER_DARK = '#a9aaa6'
const HERB = '#8a7a4a'
const CLOTH = '#e3d5ae'

/**
 * 醬釉帶蓋筒形罐（依臺史博 2005.010.0340：日本時代、臺灣南投，陶，高 15.3、徑 15.4 公分；
 * 器身上寬下窄的直筒、上下各兩道陰刻弦紋，橙紅胎外施醬釉，笠式平沿蓋，蓋紐是回首坐臥的獅子；多用來儲存食物）。
 * 動作 lid：打開蓋子，罐裡是乾香菇（示意）。
 */
function buildGlazedJar({ detail }) {
  const radial = detail ? 28 : 12
  const R = 0.077
  const H = 0.13
  const jar = new Parts()
  jar.add(GLAZE, new CylinderGeometry(R, R * 0.9, H, radial, 1, true), { p: [0, H / 2 + 0.006, 0] })
  jar.add('#4a2a1a', new CylinderGeometry(R - 0.006, R * 0.9 - 0.006, H - 0.004, radial, 1, true), { p: [0, H / 2 + 0.008, 0], s: [-1, 1, 1] })
  jar.add(CLAY, new CylinderGeometry(R * 0.86, R * 0.84, 0.012, radial), { p: [0, 0.006, 0] })
  for (const y of [0.025, 0.033, H - 0.012, H - 0.004]) jar.add(GLAZE_LIGHT, new TorusGeometry(R * (y < H / 2 ? 0.92 : 0.995), 0.0015, 3, radial), { p: [0, y, 0], r: [Math.PI / 2, 0, 0] })
  // 罐裡的乾香菇
  for (let i = 0; i < (detail ? 9 : 4); i++) {
    const a = i * 2.3
    const r = (i % 3) * 0.022
    jar.add(MUSHROOM_CAP, new SphereGeometry(0.016, detail ? 10 : 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), { p: [Math.cos(a) * r, H - 0.02 + (i % 2) * 0.006, Math.sin(a) * r], s: [1, 0.55, 1] })
    if (detail) jar.add(MUSHROOM, new CylinderGeometry(0.004, 0.005, 0.012, 6), { p: [Math.cos(a) * r, H - 0.028, Math.sin(a) * r] })
  }

  // 笠式平沿蓋與回首坐臥的獅紐（簡化）
  const lid = new Parts()
  const ly = H + 0.006
  lid.add(GLAZE, new CylinderGeometry(R * 0.6, R + 0.006, 0.018, radial), { p: [0, ly + 0.009, 0] })
  lid.add(GLAZE_LIGHT, new CylinderGeometry(R + 0.006, R + 0.006, 0.004, radial), { p: [0, ly + 0.002, 0] })
  lid.add(GLAZE, box(0.03, 0.016, 0.018), { p: [0, ly + 0.026, 0] })
  lid.add(GLAZE, new SphereGeometry(0.01, detail ? 10 : 6, 6), { p: [0.016, ly + 0.034, 0] })
  if (detail) {
    lid.add(GLAZE_LIGHT, new SphereGeometry(0.004, 6, 4), { p: [0.024, ly + 0.036, 0.006] })
    lid.add(GLAZE, box(0.008, 0.008, 0.02), { p: [-0.018, ly + 0.028, 0], r: [0, 0, 0.6] })
  }

  return {
    radius: 0.15,
    centerY: 0.08,
    viewPitch: 0.35,
    parts: [
      { id: 'jar', geometry: jar.build() },
      { id: 'lid', geometry: lid.build(), pivot: [0, ly, -R], animate: { action: 'lid', axis: 'x', from: 0, to: -1.9 } },
    ],
  }
}

/**
 * 墨繪竹編點心籃組（依臺史博 2000.001.0010：推測日治時期或戰後初期，竹篾編製，長 50.5、寬 40.5、高 74.3 公分；
 * 一組三件——頂蓋、中隔層、提籃；提把由 6 條細竹條與 1 條粗竹條組成、頂端藤圈固定、中央藤環可穿扁擔；
 * 外壁墨書福祿壽變體字與花卉藤蔓；下層放菜或點心、上層放碗筷）。墨繪的字與花是示意的色塊。
 * 動作 open：掀起頂蓋、拿起中隔層，看下層的點心。
 */
function buildSnackBasket({ detail }) {
  const radial = detail ? 24 : 12
  const R = 0.2
  const H = 0.3
  const basket = new Parts()
  basket.add(BAMBOO, new CylinderGeometry(R, R * 0.92, H, radial, 1, true), { p: [0, H / 2, 0] })
  basket.add(BAMBOO_DARK, new CylinderGeometry(R - 0.008, R * 0.92 - 0.008, H - 0.01, radial, 1, true), { p: [0, H / 2 + 0.005, 0], s: [-1, 1, 1] })
  basket.add(BAMBOO_DARK, new CylinderGeometry(R * 0.92, R * 0.92, 0.012, 6), { p: [0, 0.006, 0] })
  // 外壁的墨書與花卉（示意的色塊）
  basket.add(INK, box(0.05, 0.08, 0.002), { p: [0, 0.16, R * 0.97] })
  if (detail) {
    for (let i = 0; i < 10; i++) basket.add(INK, box(0.004, 0.06, 0.002), { p: [Math.sin((i / 10) * Math.PI * 2) * R * 0.97, 0.1 + (i % 3) * 0.04, Math.cos((i / 10) * Math.PI * 2) * R * 0.97], r: [0, (i / 10) * Math.PI * 2, 0.4] })
    for (let k = 0; k < 6; k++) basket.add(BAMBOO_DARK, new TorusGeometry(R * (0.93 + k * 0.012), 0.002, 3, radial), { p: [0, 0.03 + k * 0.05, 0], r: [Math.PI / 2, 0, 0] })
  }
  // 提把：細竹條＋粗竹條，從兩側往上、頂端的藤圈與中央藤環
  for (const side of [-1, 1]) {
    for (let i = 0; i < (detail ? 7 : 3); i++) basket.add(i === 0 ? BAMBOO_DARK : BAMBOO, box(i === 0 ? 0.016 : 0.008, 0.46, 0.006), { p: [side * (R - 0.01), H + 0.2, (i - 3) * 0.008], r: [0, 0, side * -0.08] })
  }
  basket.add(BAMBOO, box(R * 2 - 0.02, 0.016, 0.03), { p: [0, H + 0.43, 0] })
  basket.add(RATTAN, new TorusGeometry(0.03, 0.007, 6, 12), { p: [0, H + 0.45, 0] })
  // 下層的點心（示意：紅龜與粿）
  basket.add('#cf3b3b', new SphereGeometry(0.05, 10, 6), { p: [-0.07, 0.05, 0.02], s: [1.2, 0.4, 1] })
  basket.add('#5d8a4e', new SphereGeometry(0.045, 10, 6), { p: [0.07, 0.05, -0.03], s: [1.2, 0.4, 1] })

  // 中隔層：深圓盤（底下米字竹條），放碗筷
  const tray = new Parts()
  const ty = H - 0.05
  tray.add(BAMBOO, new CylinderGeometry(R - 0.01, R - 0.016, 0.09, radial, 1, true), { p: [0, ty, 0] })
  tray.add(BAMBOO_DARK, new CylinderGeometry(R - 0.016, R - 0.016, 0.008, 6), { p: [0, ty - 0.045, 0] })
  for (let i = 0; i < 3; i++) tray.add(WOOD_DARK, box(R * 1.8, 0.006, 0.01), { p: [0, ty - 0.05, 0], r: [0, (i * Math.PI) / 3, 0] })
  tray.add('#e9e4d8', new CylinderGeometry(0.05, 0.03, 0.04, detail ? 14 : 8), { p: [0.05, ty - 0.02, 0] })
  for (const dz of [-0.01, 0.01]) tray.add(BAMBOO_DARK, new CylinderGeometry(0.003, 0.004, 0.2, 5), { p: [-0.06, ty - 0.035, dz], r: [0, 0, Math.PI / 2] })

  // 頂蓋：中央隆起的圓盤，墨繪六邊形
  const lid = new Parts()
  const ly = H + 0.005
  lid.add(BAMBOO, new CylinderGeometry(R * 0.5, R + 0.006, 0.04, radial), { p: [0, ly + 0.02, 0] })
  lid.add(INK, new CylinderGeometry(0.06, 0.06, 0.002, 6), { p: [0, ly + 0.041, 0] })
  if (detail) lid.add(BAMBOO, new CylinderGeometry(0.045, 0.045, 0.0025, 6), { p: [0, ly + 0.0415, 0] })

  return {
    radius: 0.55,
    centerY: 0.32,
    viewPitch: 0.3,
    parts: [
      { id: 'basket', geometry: basket.build() },
      { id: 'tray', geometry: tray.build(), pivot: [0, ty, 0], animate: { action: 'open', kind: 'slide', axis: 'x', from: 0, to: 0.48, drift: [0, 0.05, 0] } },
      { id: 'lid', geometry: lid.build(), pivot: [0, ly, 0], animate: { action: 'open', kind: 'slide', axis: 'x', from: 0, to: -0.48, drift: [0, 0.03, 0] } },
    ],
  }
}

/**
 * 戥秤組合（依臺史博 2011.025.0249：日本時代，整組 8.1 × 24.7 × 3.5 公分；琵琶形木盒有兩個凹槽，
 * 分別收秤與秤陀；戥秤約 20 公分長、徑約 0.5 公分，一端包金屬、黑色秤星、兩條紫繩提紐、紫繩吊圓形金屬秤盤；
 * 秤陀是鐘形金屬、頂端小耳繫紅繩；秤金銀珠寶或藥材這類小而貴重的東西）。盤底的徽紋與秤陀的刻字不畫。
 * 動作 weigh：提起戥秤、秤盤裡放一撮藥材，秤陀滑到平衡。
 */
function buildApothecaryScale({ detail }) {
  const radial = detail ? 20 : 10
  const box0 = new Parts()
  // 琵琶形木盒：圓的一端加長頸，盒蓋旋開在一旁
  box0.add(WOOD, new CylinderGeometry(0.04, 0.04, 0.03, radial), { p: [0.08, 0.015, 0] })
  box0.add(WOOD, box(0.17, 0.03, 0.04), { p: [-0.02, 0.015, 0] })
  box0.add(WOOD_DARK, box(0.16, 0.004, 0.012), { p: [-0.02, 0.031, 0] })
  box0.add(WOOD_DARK, new CylinderGeometry(0.014, 0.014, 0.004, 10), { p: [0.08, 0.031, 0] })
  box0.add(WOOD, new CylinderGeometry(0.04, 0.04, 0.012, radial), { p: [0.06, 0.006, 0.09] })
  box0.add(WOOD, box(0.17, 0.012, 0.04), { p: [-0.04, 0.006, 0.09] })
  if (detail) box0.add('#5a4030', new TorusGeometry(0.006, 0.0018, 4, 8), { p: [0.12, 0.02, 0.03], r: [Math.PI / 2, 0, 0] })
  // 一小撮藥材（放在一旁的紙上）
  box0.add(CLOTH, box(0.07, 0.002, 0.07), { p: [0.02, 0.001, -0.08], r: [0, 0.3, 0] })
  for (let i = 0; i < (detail ? 8 : 3); i++) box0.add(HERB, box(0.012, 0.003, 0.004), { p: [0.02 + ((i * 7) % 5) * 0.006 - 0.012, 0.004, -0.08 + ((i * 3) % 4) * 0.006], r: [0, i, 0] })

  // 戥秤：秤桿、提紐、秤盤；提起時整組往上
  const beam = new Parts()
  const y = 0.14
  beam.add(BRASS, new CylinderGeometry(0.0025, 0.0028, 0.2, 8), { p: [0, y, 0], r: [0, 0, Math.PI / 2] })
  beam.add(METAL, new CylinderGeometry(0.0032, 0.0032, 0.012, 8), { p: [-0.1, y, 0], r: [0, 0, Math.PI / 2] })
  for (let i = 0; i < (detail ? 14 : 6); i++) beam.add(INK, new CylinderGeometry(0.003, 0.003, 0.001, 6), { p: [-0.05 + i * (0.14 / (detail ? 14 : 6)), y, 0], r: [0, 0, Math.PI / 2] })
  for (const x of [-0.085, -0.07]) beam.add(PURPLE, box(0.002, 0.05, 0.002), { p: [x, y + 0.025, 0] })
  // 秤盤與吊繩
  beam.add(PURPLE, box(0.002, 0.06, 0.002), { p: [-0.095, y - 0.03, 0.008], r: [0.15, 0, 0] })
  beam.add(PURPLE, box(0.002, 0.06, 0.002), { p: [-0.095, y - 0.03, -0.008], r: [-0.15, 0, 0] })
  beam.add(METAL, new CylinderGeometry(0.022, 0.018, 0.004, radial), { p: [-0.095, y - 0.062, 0] })
  for (let i = 0; i < (detail ? 5 : 2); i++) beam.add(HERB, box(0.01, 0.003, 0.004), { p: [-0.095 + (i - 2) * 0.004, y - 0.058, (i % 2) * 0.004], r: [0, i, 0] })

  // 秤陀：鐘形，頂端的小耳繫紅繩，沿著秤桿滑動
  const weight = new Parts()
  weight.add(METAL, new CylinderGeometry(0.004, 0.006, 0.019, 10), { p: [0.0, y - 0.03, 0] })
  weight.add(RED_CORD, box(0.0015, 0.02, 0.0015), { p: [0.0, y - 0.012, 0] })
  if (detail) weight.add(METAL, new TorusGeometry(0.0025, 0.0008, 4, 8), { p: [0.0, y - 0.019, 0] })

  return {
    radius: 0.17,
    centerY: 0.07,
    viewPitch: 0.25,
    parts: [
      { id: 'box', geometry: box0.build() },
      { id: 'beam', geometry: beam.build(), pivot: [-0.08, y, 0], animate: { action: 'weigh', axis: 'z', from: -0.12, to: 0 } },
      { id: 'weight', geometry: weight.build(), pivot: [0, y, 0], animate: { action: 'weigh', kind: 'slide', axis: 'x', from: 0, to: 0.06 } },
    ],
  }
}

/**
 * 繩紋銀手鐲（依臺史博 2003.014.0152.0002：清代或日本時代，銀，直徑 6.1、高 0.6 公分，17.8 公克；
 * 數條銀條相互交織繞成圓環、留開口套入手腕，素面無紋飾；民間俗稱「繩索環」「索仔環」「腳車藤」）。
 * 動作 lift：從布帕上拿起來立著轉，看銀條交纏的樣子與開口。
 */
function buildSilverBracelet({ detail }) {
  const R = 0.0305
  const strands = detail ? 4 : 3
  const seg = detail ? 48 : 18
  const bracelet = new Parts()
  // 幾條銀條沿著圓環繞著彼此轉（每條用一串小圓柱逼近），留一個開口
  const gap = 0.35
  for (let k = 0; k < strands; k++) {
    for (let i = 0; i < seg; i++) {
      const a = gap / 2 + (i / seg) * (Math.PI * 2 - gap)
      const twist = a * 6 + (k / strands) * Math.PI * 2
      const r = R + Math.cos(twist) * 0.0016
      const y = 0.003 + Math.sin(twist) * 0.0016
      bracelet.add(k % 2 ? SILVER_DARK : SILVER, new CylinderGeometry(0.0011, 0.0011, ((Math.PI * 2 - gap) / seg) * R * 1.25, 5), { p: [Math.cos(a) * r, y, Math.sin(a) * r], r: [Math.PI / 2, 0, a] })
    }
  }
  // 開口兩端的收尾
  for (const a of [gap / 2, -gap / 2]) bracelet.add(SILVER, new SphereGeometry(0.0022, 6, 4), { p: [Math.cos(a) * R, 0.003, Math.sin(a) * R] })
  const cloth = new Parts()
  cloth.add(CLOTH, box(0.09, 0.002, 0.09), { p: [0, -0.001, 0], r: [0, 0.4, 0] })
  if (detail) cloth.add('#c9b98e', box(0.08, 0.0022, 0.004), { p: [0, -0.0008, 0.032], r: [0, 0.4, 0] })

  return {
    radius: 0.07,
    centerY: 0.022,
    viewPitch: 0.5,
    parts: [
      { id: 'cloth', geometry: cloth.build() },
      { id: 'bracelet', geometry: bracelet.build(), pivot: [0, 0.003, 0], animate: { action: 'lift', axis: 'x', from: 0, to: -1.3, drift: [0, 0.02, 0] } },
    ],
  }
}

export const NEIGHBOUR_BUILDERS = {
  'glazed-jar': buildGlazedJar,
  'snack-basket': buildSnackBasket,
  'apothecary-scale': buildApothecaryScale,
  'silver-bracelet': buildSilverBracelet,
}
