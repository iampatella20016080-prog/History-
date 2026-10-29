/**
 * 各年代街頭的情境人物與交通道具（第 9 階段美術）：等客的人力車夫、三輪車夫、牽腳踏車的人、攤車後的小販。
 *
 * 查證紀錄見 docs/research/era-street-props.md。結論：
 * - 港口商街：不加（碼頭已有挑夫，見 qingWharfLayout.js；清末人力車只有單一旁證，待核）
 * - 酒樓繁華、摩登：人力車（1887 年自上海引進臺灣，待核；戰後才被三輪車取代）
 * - 摩登：腳踏車（1930 年代後期本島人擁有逾 35 萬台）
 * - 庶民生活：三輪車（1968 年臺北市全面禁行、收購）、腳踏車（1940–1950 年代主要代步工具，待核）、廟口與廣場的攤車
 * - 老屋新生：牽腳踏車的遊客（不畫公共自行車的站點與品牌：大稻埕附近有無站點查無）
 * 車與人物的形式都是「歷史情境重建」，人物不具名、不走動，只有待機動作。
 *
 * 每個情境依附一個街道道具（anchor）：沿用 eraLayout 原有的道具，或在這裡新加（added: true）。
 * 人物用道具的本地座標（道具面向 +x）；人物本身面向 +Z（NPC 慣例）。
 * 每個情境的範圍（道具＋人物）同時是碰撞障礙物與鏡頭遮擋方塊。
 * detailOnly：低畫質（流暢模式）不畫這個人物；它的位置都在道具的範圍旁，碰撞範圍不因畫質改變。
 */

/** 道具的碰撞半寬（x, z；本地座標，與 eraLayout 的 FOOTPRINT 相同） */
export const SCENE_FOOTPRINT = {
  rickshaw: [1.6, 0.6],
  pedicab: [1.35, 0.6],
  bicycle: [0.9, 0.22],
  foodStall: [1.25, 1.1],
}

/** 人物的碰撞半寬（站著或坐著） */
export const FIGURE_HALF = 0.3

export const STREET_SCENES = [
  // 酒樓繁華：街上與河岸廣場的人力車，車夫坐在車前的腳踏板上等客
  {
    id: 'banquet-rickshaw-street',
    era: 'banquet',
    anchor: { type: 'rickshaw', position: [10.5, 0, 2.0], rotationY: Math.PI, tint: '#4a3a30', added: true },
    figures: [{ look: 'rickshawPuller', pose: 'rest', local: [0.42, 0], facing: 0, seatY: 0.6 }],
  },
  {
    id: 'banquet-rickshaw-plaza',
    era: 'banquet',
    anchor: { type: 'rickshaw', position: [-38.5, 0, 3.6], rotationY: 2.2 },
    figures: [{ look: 'rickshawPuller', pose: 'rest', local: [0.42, 0], facing: 0.25, seatY: 0.6, detailOnly: true }],
  },
  // 摩登：仍有人力車等客；騎樓邊有人牽著腳踏車
  {
    id: 'modern-rickshaw',
    era: 'modern',
    anchor: { type: 'rickshaw', position: [-20.5, 0, 2.0], rotationY: Math.PI, tint: '#3a3430', added: true },
    figures: [{ look: 'rickshawPullerModern', pose: 'rest', local: [0.42, 0], facing: -0.2, seatY: 0.6 }],
  },
  {
    id: 'modern-cyclist',
    era: 'modern',
    anchor: { type: 'bicycle', position: [5.8, 0, 2.45], rotationY: Math.PI - 0.1 },
    figures: [{ look: 'modernCyclist', pose: 'handlebar', local: [0.3, 0.5], facing: 0, detailOnly: true }],
  },
  // 庶民生活：等客的三輪車、牽腳踏車的人、廣場攤車後的小販
  {
    id: 'postwar-pedicab',
    era: 'postwar',
    anchor: { type: 'pedicab', position: [3.0, 0, -2.0], rotationY: 0, added: true },
    figures: [{ look: 'postwarPedicabDriver', pose: 'rest', local: [-0.45, 0], facing: 0, seatY: 0.7 }],
  },
  {
    id: 'postwar-cyclist',
    era: 'postwar',
    anchor: { type: 'bicycle', position: [24.4, 0, 2.45], rotationY: Math.PI + 0.08 },
    figures: [{ look: 'postwarCyclist', pose: 'handlebar', local: [0.3, 0.5], facing: 0, detailOnly: true }],
  },
  {
    id: 'postwar-food-stall',
    era: 'postwar',
    anchor: { type: 'foodStall', position: [-40.5, 0, -6.3], rotationY: 0 },
    // 攤台在本地 -z 一側是攤販站的位置（攤台本身面向 +z）
    figures: [{ look: 'postwarCartVendor', pose: 'ladle', local: [0.3, -0.75], facing: -Math.PI / 2 }],
  },
  // 老屋新生：停下來看街屋的單車遊客
  {
    id: 'revival-cyclist',
    era: 'revival',
    anchor: { type: 'bicycle', position: [9.6, 0, 2.45], rotationY: Math.PI },
    figures: [{ look: 'revivalCyclist', pose: 'handlebar', local: [0.3, 0.5], facing: 0, detailOnly: true }],
  },
]

export function scenesForEra(eraId) {
  return STREET_SCENES.filter((scene) => scene.era === eraId)
}

/** 這個年代要新加到街道上的道具（原有道具不重複加） */
export function addedSceneProps(eraId) {
  return scenesForEra(eraId)
    .filter((scene) => scene.anchor.added)
    .map(({ anchor: { added, ...prop } }) => prop)
}

/** 道具本地座標 → 世界座標（道具面向本地 +x；rotationY 繞 Y 軸） */
export function sceneToWorld(anchor, [lx, lz]) {
  const r = anchor.rotationY ?? 0
  const [x, , z] = anchor.position
  return [x + lx * Math.cos(r) + lz * Math.sin(r), z - lx * Math.sin(r) + lz * Math.cos(r)]
}

function rotatedBox(cx, cz, hx, hz, rotationY) {
  const c = Math.abs(Math.cos(rotationY))
  const s = Math.abs(Math.sin(rotationY))
  const ex = hx * c + hz * s
  const ez = hx * s + hz * c
  return { minX: cx - ex, maxX: cx + ex, minZ: cz - ez, maxZ: cz + ez }
}

/** 道具的範圍（與 eraLayout 的 propObstacle 相同） */
export function anchorBox(anchor) {
  const [hx, hz] = SCENE_FOOTPRINT[anchor.type]
  return rotatedBox(anchor.position[0], anchor.position[2], hx, hz, anchor.rotationY ?? 0)
}

/** 人物：世界座標、面向（NPC 面向 +Z；facing 是相對於道具 +x 的轉角） */
export function figurePlacement(anchor, figure) {
  const [x, z] = sceneToWorld(anchor, figure.local)
  return { position: [x, 0, z], rotationY: (anchor.rotationY ?? 0) + Math.PI / 2 + (figure.facing ?? 0) }
}

export function figureBox(anchor, figure) {
  const { position } = figurePlacement(anchor, figure)
  return { minX: position[0] - FIGURE_HALF, maxX: position[0] + FIGURE_HALF, minZ: position[2] - FIGURE_HALF, maxZ: position[2] + FIGURE_HALF }
}

const SCENE_HEIGHT = { rickshaw: 1.75, pedicab: 1.75, bicycle: 1.75, foodStall: 2.45 }

/** 情境的範圍（道具＋人物，含高度）：碰撞障礙物與鏡頭遮擋方塊 */
export function sceneBox(scene) {
  const boxes = [anchorBox(scene.anchor), ...scene.figures.map((figure) => figureBox(scene.anchor, figure))]
  return {
    minX: Math.min(...boxes.map((b) => b.minX)),
    maxX: Math.max(...boxes.map((b) => b.maxX)),
    minY: 0,
    maxY: SCENE_HEIGHT[scene.anchor.type],
    minZ: Math.min(...boxes.map((b) => b.minZ)),
    maxZ: Math.max(...boxes.map((b) => b.maxZ)),
  }
}

/** 這個年代的情境人物（交給 NpcLayer） */
export function sceneNpcs(eraId) {
  return scenesForEra(eraId).flatMap((scene, i) =>
    scene.figures.map((figure, k) => ({
      id: `street-${scene.id}-${k}`,
      look: figure.look,
      pose: figure.pose,
      ...figurePlacement(scene.anchor, figure),
      ...(figure.seatY ? { seatY: figure.seatY } : {}),
      ...(figure.detailOnly ? { detailOnly: true } : {}),
      phase: (0.23 + i * 0.37 + k * 0.19) % 1,
    })),
  )
}

/** 查證來源（都在 data/sources.js） */
export const STREET_PROPS_SOURCE_IDS = ['wiki-rickshaw-zh', 'masuda-2024-mobility', 'gvm-2020-pedicab-ban', 'lai-2024-taipei-traffic', 'cna-2021-old-taipei-pedicab', 'technews-bicycle-tax', 'taipeitimes-youbike2-2021', 'ncl-yongle-market']
