/**
 * 畫面審查的視角（SET=audit，第 9 階段・畫面審查）：由資料自動產生，每個年代都拍
 *   - 街道遠景（往東、往西）、慈聖宮前、河岸
 *   - 每個開放店家：街道另一側的店門口與招牌（`<店家>-front`）、按 E 探索時的鏡頭（`<店家>-explore`）
 *   - 每個可以走進去的室內：人物站在門內面向室內（`<室內>-in`）、站在最裡面面向門口（`<室內>-back`），
 *     兩張都用遊戲本身的跟隨鏡頭（不固定鏡頭），看得出鏡頭有沒有穿牆
 *   - 每位路線人物：站在人物前方看人物（`fig-<人物>`）
 *
 * 視角格式：[檔名, 說明, 鏡頭位置, 注視點, 選項]；選項 follow: { position: [x, z], facing: [fx, fz], level }
 * 表示不固定鏡頭，把人物放在 position、面向 facing，鏡頭由 CameraRig 自己跟上。
 */
import { ERAS } from '../../src/data/eras.js'
import { getShopsByEra } from '../../src/data/shops.js'
import { getShopPlacement } from '../../src/game/world/placement.js'
import { routeFiguresOfEra } from '../../src/data/routeFigures.js'

const r2 = (v) => Math.round(v * 100) / 100
const pt = (v) => v.map(r2)

const STREET_VIEWS = [
  ['street', '街道遠景（往東）', [-30, 2.2, 0.4], [20, 3.0, 0.0]],
  ['street-west', '街道遠景（往河邊）', [32, 2.2, 0.4], [-20, 3.4, 0.0]],
  ['temple', '慈聖宮前', [4, 2.3, -2.6], [4, 3.6, 14]],
  ['river', '河岸', [-41, 3.0, 3.5], [-72, -0.8, -1]],
]

/** 店門口：站在店面正前方 standOff 公尺（一般街屋就是街道另一側）的眼睛高度，看門口到招牌 */
function shopViews(shop) {
  const { origin, forward, camera } = getShopPlacement(shop)
  // 自訂位置的建築（site）前面不一定是街道，站近一點
  // （站在街心，不站到對面騎樓的雨棚下面）
  const standOff = shop.inside ? 3.2 : shop.site || Math.abs(origin.z) > 6 ? 5.2 : 5.4
  const eye = [origin.x + forward.x * standOff, 1.65, origin.z + forward.z * standOff]
  const look = [origin.x - forward.x * 0.8, 3.1, origin.z - forward.z * 0.8]
  return [
    [`${shop.id}-front`, `${shop.name} 店門口與招牌`, pt(eye), pt(look)],
    [`${shop.id}-explore`, `${shop.name} 探索鏡頭`, pt(camera.position.toArray()), pt(camera.target.toArray())],
  ]
}

/** 室內的「往外」方向：門口指向門外的入口範圍中心（取主要的軸） */
function outward(zone) {
  const cx = (zone.entry.minX + zone.entry.maxX) / 2 - zone.door.x
  const cz = (zone.entry.minZ + zone.entry.maxZ) / 2 - zone.door.z
  return Math.abs(cx) > Math.abs(cz) ? [Math.sign(cx), 0] : [0, Math.sign(cz)]
}

/** 沿著 -out 方向，室內範圍有多深（從門口量起） */
function depthOf(zone, out) {
  const [ox, oz] = out
  if (ox > 0) return zone.door.x - zone.minX
  if (ox < 0) return zone.maxX - zone.door.x
  if (oz > 0) return zone.door.z - zone.minZ
  return zone.maxZ - zone.door.z
}

function interiorViews(zone) {
  if (!zone.door || !zone.entry) {
    // 沒有門的室內（例如稻舍的二樓，從一樓的樓梯上去）：站在最大的一塊中間，面向街道與背向街道各一張
    const part = (zone.parts ?? [zone]).reduce((a, b) => ((b.maxX - b.minX) * (b.maxZ - b.minZ) > (a.maxX - a.minX) * (a.maxZ - a.minZ) ? b : a))
    const level = part.levels ? part.levels.at(-1) : (part.level ?? 0)
    const center = pt([(part.minX + part.maxX) / 2, (part.minZ + part.maxZ) / 2])
    const toStreet = [0, -Math.sign(center[1]) || 1]
    return [
      [`${zone.id}-in`, `${zone.id} 面向街道`, null, null, { follow: { position: center, facing: toStreet, level } }],
      [`${zone.id}-back`, `${zone.id} 背向街道`, null, null, { follow: { position: center, facing: [0, -toStreet[1]], level } }],
    ]
  }
  const out = outward(zone)
  const inward = [-out[0], -out[1]]
  const depth = depthOf(zone, out)
  const level = zone.entry.level ?? 0
  const near = Math.min(1.6, depth * 0.3)
  const far = Math.max(near + 0.5, depth - 1.0)
  const at = (d) => pt([zone.door.x + inward[0] * d, zone.door.z + inward[1] * d])
  return [
    [`${zone.id}-in`, `${zone.id} 進門`, null, null, { follow: { position: at(near), facing: inward, level } }],
    [`${zone.id}-back`, `${zone.id} 最裡面看門口`, null, null, { follow: { position: at(far), facing: out, level } }],
  ]
}

function figureViews(eraId) {
  return routeFiguresOfEra(eraId).map((figure) => {
    const [x, z] = figure.position
    const r = figure.rotationY ?? 0
    const f = [Math.sin(r), Math.cos(r)]
    let eye = [x + f[0] * 3.2, z + f[1] * 3.2]
    // 面向店面的人物：鏡頭改站在街心那一側（不站進建築裡）
    if (Math.abs(eye[1]) > 3.6 && Math.abs(eye[1]) > Math.abs(z)) eye = [x + f[0] * 1.5, z - Math.sign(z) * 3.2]
    return [`fig-${figure.id}`, `路線人物 ${figure.id}`, pt([eye[0], 1.65, eye[1]]), pt([x, 1.2, z])]
  })
}

/** interiors：這個年代的 world.interiors（由 buildEraWorldSync 取得） */
export function auditViews(eraId, interiors = []) {
  const era = ERAS.find((item) => item.id === eraId)
  const shops = getShopsByEra(era).filter((shop) => shop.status === 'open')
  return [...STREET_VIEWS, ...shops.flatMap(shopViews), ...interiors.flatMap(interiorViews), ...figureViews(eraId)]
}
