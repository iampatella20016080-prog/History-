import { IcosahedronGeometry, SphereGeometry } from 'three'
import { CULTURE_SLOTS, EARLY, MODERN, POSTWAR } from '../../../data/shizixuanLayout.js'
import { basket, jar, pastryTray, shade } from '../props.js'
import { createRng } from '../../utils/random.js'

/**
 * 十字軒糕餅舖的室內細部（按需載入）：帳桌／結帳櫃台、展示架或玻璃櫃、後方的工作間或歷史展示角，
 * 以及五個文化節點的小擺件（滿月、收涎、婚嫁、祝壽、祭祀）。從街上就看得到的外殼、招牌與遮擋方塊在
 * shizixuanExterior.js；這裡只有家具與五個文化節點本身的模型。
 */

/** 紅圓（滿月）：一疊扁圓的紅色糯米糰，疊在小木盤上 */
function manYue(b, position) {
  b.group(position, 0, () => {
    b.cylinder('wood', 0.16, 0.16, 0.02, 14, [0, 0.01, 0], { tint: '#8c6446' })
    for (let i = 0; i < 3; i++) b.cylinder('plain', 0.055, 0.06, 0.03, 12, [(i - 1) * 0.07, 0.03 + i * 0.001, 0], { tint: i % 2 ? '#c4473a' : '#cf5a45' })
  })
}

/** 收涎（鹹光餅）：紅絲線串起的小圓餅，掛在小木架上 */
function shouYan(b, position) {
  b.group(position, 0, () => {
    b.box('wood', [0.28, 0.02, 0.02], [0, 0.42, 0], { tint: '#6a4a30' })
    b.cylinder('wood', 0.01, 0.01, 0.42, 4, [0, 0.21, 0], { tint: '#5a3c26' })
    for (let i = 0; i < 4; i++) {
      const y = 0.36 - i * 0.07
      b.cylinder('plain', 0.009, 0.009, 0.1, 4, [0, y + 0.035, 0], { tint: '#b3291d' })
      b.cylinder('plain', 0.045, 0.048, 0.018, 10, [0, y, 0], { tint: '#e0c48a' })
    }
  })
}

/** 婚嫁（喜餅）：兩個紅色禮盒，繫著金色緞帶 */
function hunJia(b, position) {
  b.group(position, 0, () => {
    b.box('cloth', [0.26, 0.1, 0.26], [0, 0.05, 0], { tint: '#b3291d' })
    b.box('plain', [0.27, 0.025, 0.03], [0, 0.1, 0], { tint: '#d9b46a' })
    b.box('plain', [0.03, 0.025, 0.27], [0, 0.1, 0], { tint: '#d9b46a' })
    b.box('cloth', [0.2, 0.09, 0.2], [0.12, 0.155, 0.1], { tint: '#9d2a28' })
    b.box('plain', [0.21, 0.02, 0.025], [0.12, 0.2, 0.1], { tint: '#d9b46a' })
  })
}

/** 祝壽（壽桃）：三顆桃形的粉色麵食，疊在小木盤上 */
function zhuShou(b, position) {
  b.group(position, 0, () => {
    b.cylinder('wood', 0.17, 0.17, 0.02, 14, [0, 0.01, 0], { tint: '#8c6446' })
    const spots = [
      [0, 0.07],
      [-0.09, -0.04],
      [0.09, -0.04],
    ]
    for (const [x, z] of spots) {
      b.add('plain', new SphereGeometry(1, 10, 8), { position: [x, 0.065, z], scale: [0.07, 0.065, 0.07], tint: '#f0c3b8' })
      b.add('plain', new SphereGeometry(1, 8, 6), { position: [x, 0.11, z], scale: [0.015, 0.02, 0.015], tint: '#7a9a52' })
    }
  })
}

/** 祭祀（紅龜粿）：一整盤印著龜甲紋的紅龜粿（復用通用的糕餅托盤模型） */
function jiSi(b, position, seed) {
  pastryTray(b, [position[0], position[1] - 0.075, position[2]], { seed, kind: 'turtle' })
}

const CULTURE_BUILDERS = [manYue, shouYan, hunJia, zhuShou, jiSi]

function placeCultureSlots(b, variant) {
  const slots = CULTURE_SLOTS[variant]
  slots.forEach(([x, z], i) => {
    const y = variant === 'earlyShop' ? EARLY.shelf.height : variant === 'postwarShop' ? POSTWAR.shelf.height : 0.95
    const builder = CULTURE_BUILDERS[i]
    if (builder === jiSi) jiSi(b, [x, y + 0.075, z], 40 + i)
    else builder(b, [x, y, z])
  })
}

/* ═══════════ 1930–1945：十字軒（糕餅店初創） ═══════════ */

function earlyInterior(b) {
  const { counter, shelf, workbench } = EARLY
  // 帳桌：算盤、帳本與秤
  b.box('wood', [counter.maxX - counter.minX, counter.height, counter.maxZ - counter.minZ], [(counter.minX + counter.maxX) / 2, counter.height / 2, (counter.minZ + counter.maxZ) / 2], { tint: '#6a4a30' })
  b.box('wood', [0.3, 0.02, 0.2], [counter.minX + 0.3, counter.height + 0.01, (counter.minZ + counter.maxZ) / 2], { tint: '#4a3320' })
  // 展示架：早期的西點麵包與初期漢餅
  b.box('wood', [shelf.maxX - shelf.minX, 0.04, shelf.maxZ - shelf.minZ], [(shelf.minX + shelf.maxX) / 2, shelf.height, (shelf.minZ + shelf.maxZ) / 2], { tint: '#5a3c26' })
  for (const [sx, sz] of [-1, 1].map((s) => [(shelf.minX + shelf.maxX) / 2, (shelf.minZ + shelf.maxZ) / 2 + s * 0.3])) {
    pastryTray(b, [sx, shelf.height + 0.03, sz], { seed: sz > 0 ? 11 : 12 })
  }
  for (let leg = 0; leg < 2; leg++) b.box('wood', [0.04, shelf.height, 0.04], [shelf.minX + 0.05, shelf.height / 2, shelf.minZ + 0.05 + leg * (shelf.maxZ - shelf.minZ - 0.1)], { tint: '#4a3320' })
  // 後坊：工作檯、揉麵盆與桿麵棍
  b.box('wood', [workbench.maxX - workbench.minX, workbench.height, workbench.maxZ - workbench.minZ], [0, workbench.height / 2, (workbench.minZ + workbench.maxZ) / 2], { tint: shade('#6a4a30', 0.9) })
  b.cylinder('plain', 0.18, 0.2, 0.08, 14, [-0.6, workbench.height + 0.04, (workbench.minZ + workbench.maxZ) / 2], { tint: '#e8dcc2' })
  b.cylinder('wood', 0.025, 0.025, 0.5, 10, [0.5, workbench.height + 0.04, (workbench.minZ + workbench.maxZ) / 2], { rotation: [0, 0, Math.PI / 2], tint: '#caa876' })
  basket(b, [0.9, 0, workbench.minZ + 0.3], { radius: 0.28, depth: 0.14, content: 'flour', seed: 15 })
  b.addGlow(0, 2.2, (workbench.minZ + workbench.maxZ) / 2, 0.6, '#ffc77f')
  placeCultureSlots(b, 'earlyShop')
}

/* ═══════════ 1945–1980：十字軒餅舖（戰後） ═══════════ */

function postwarInterior(b) {
  const { counter, shelf, cabinet } = POSTWAR
  b.box('wood', [counter.maxX - counter.minX, counter.height, counter.maxZ - counter.minZ], [(counter.minX + counter.maxX) / 2, counter.height / 2, (counter.minZ + counter.maxZ) / 2], { tint: '#6a4a30' })
  b.box('wood', [0.3, 0.02, 0.2], [counter.minX + 0.3, counter.height + 0.01, (counter.minZ + counter.maxZ) / 2], { tint: '#4a3320' })
  // 木製餅櫃：多層架，陳列漢餅、壽桃與紅龜（紙盒與竹籮，不用壓克力）
  const shelfLevels = [0.4, 0.85, 1.3]
  for (const y of shelfLevels) b.box('wood', [shelf.maxX - shelf.minX, 0.04, shelf.maxZ - shelf.minZ], [(shelf.minX + shelf.maxX) / 2, y, (shelf.minZ + shelf.maxZ) / 2], { tint: '#5a3c26' })
  for (let leg = 0; leg < 2; leg++) b.box('wood', [0.04, shelf.height, 0.04], [shelf.minX + 0.05, shelf.height / 2, shelf.minZ + 0.1 + leg * (shelf.maxZ - shelf.minZ - 0.2)], { tint: '#4a3320' })
  shelfLevels.forEach((y, i) => {
    const z = (shelf.minZ + shelf.maxZ) / 2 + (i - 1) * 0.25
    pastryTray(b, [(shelf.minX + shelf.maxX) / 2, y + 0.03, z], { seed: 20 + i, kind: i === 2 ? 'turtle' : 'round' })
  })
  // 右牆的櫥櫃：紙盒與竹籮
  b.box('wood', [cabinet.maxX - cabinet.minX, cabinet.height, cabinet.maxZ - cabinet.minZ], [(cabinet.minX + cabinet.maxX) / 2, cabinet.height / 2, (cabinet.minZ + cabinet.maxZ) / 2], { tint: '#5a3c26' })
  for (let i = 0; i < 3; i++) {
    const x = cabinet.minX + 0.3 + i * 0.45
    b.box('plain', [0.3, 0.2, 0.3], [x, cabinet.height + 0.1, cabinet.minZ + 0.3], { tint: i % 2 ? '#f1e8d3' : '#e6dbc2' })
  }
  basket(b, [cabinet.maxX - 0.3, cabinet.height, cabinet.maxZ - 0.3], { radius: 0.3, depth: 0.16, content: 'pastry', seed: 23 })
  jar(b, [cabinet.minX - 0.4, 0, cabinet.minZ - 0.3], { scale: 1.1, tint: '#6e4a34' })
  placeCultureSlots(b, 'postwarShop')
}

/* ═══════════ 2000–現在：十字軒糕餅舖 ═══════════ */

function modernInterior(b) {
  const { checkout, caseL, caseR, pastryWall, historyNook } = MODERN
  // 木作天花的格柵（簡化的格子天花）與嵌燈
  const ceilingY = 3.05
  for (let i = -3; i <= 3; i++) b.box('wood', [0.06, 0.1, 9.0], [i * 1.1, ceilingY, -5.0], { tint: '#4a3524' })
  for (const z of [-1.5, -3.5, -5.5, -7.5]) {
    b.add('bulb', new IcosahedronGeometry(0.04, 1), { position: [0, ceilingY - 0.08, z], tint: '#fff0c8' })
    b.addGlow(0, ceilingY - 0.1, z, 0.8, '#ffe2b0')
  }
  // 結帳櫃台
  b.box('wood', [checkout.maxX - checkout.minX, checkout.height, checkout.maxZ - checkout.minZ], [0, checkout.height / 2, (checkout.minZ + checkout.maxZ) / 2], { tint: '#3d2a1e' })
  b.box('plain', [checkout.maxX - checkout.minX - 0.06, 0.03, checkout.maxZ - checkout.minZ - 0.06], [0, checkout.height + 0.015, (checkout.minZ + checkout.maxZ) / 2], { tint: '#e8e2d2' })
  // 兩側玻璃展示櫃
  for (const c of [caseL, caseR]) {
    b.box('wood', [c.maxX - c.minX, 0.06, c.maxZ - c.minZ], [(c.minX + c.maxX) / 2, 0.03, (c.minZ + c.maxZ) / 2], { tint: '#2a1f16' })
    b.box('glassClear', [c.maxX - c.minX - 0.04, c.height - 0.08, c.maxZ - c.minZ - 0.04], [(c.minX + c.maxX) / 2, c.height / 2 + 0.04, (c.minZ + c.maxZ) / 2], { tint: '#e6eef0' })
    b.box('wood', [c.maxX - c.minX, 0.04, c.maxZ - c.minZ], [(c.minX + c.maxX) / 2, c.height, (c.minZ + c.maxZ) / 2], { tint: '#2a1f16' })
    const rng = createRng(c === caseL ? 31 : 32)
    for (let i = 0; i < 3; i++) {
      const x = c.minX + 0.4 + i * ((c.maxX - c.minX - 0.8) / 2)
      pastryTray(b, [x, 0.04, (c.minZ + c.maxZ) / 2], { seed: 33 + i, kind: rng() < 0.5 ? 'turtle' : 'round' })
    }
  }
  // 牆面的包裝糕餅牆（紅色禮盒分格陳列）
  const cols = 6
  for (let i = 0; i < cols; i++) {
    const x = pastryWall.minX + 0.4 + i * ((pastryWall.maxX - pastryWall.minX - 0.8) / (cols - 1))
    for (const y of [0.7, 1.3, 1.9]) b.box('cloth', [0.3, 0.3, 0.1], [x, y, pastryWall.minZ + 0.06], { tint: y === 1.3 ? '#9d2a28' : '#b3291d' })
  }
  // 歷史展示角：矮櫃上的老照片框、獎狀與老電話
  b.box('wood', [historyNook.maxX - historyNook.minX, historyNook.height, historyNook.maxZ - historyNook.minZ], [(historyNook.minX + historyNook.maxX) / 2, historyNook.height / 2, (historyNook.minZ + historyNook.maxZ) / 2], { tint: '#3d2a1e' })
  for (let i = 0; i < 3; i++) {
    const x = historyNook.minX + 0.35 + i * 0.5
    b.box('plain', [0.32, 0.42, 0.02], [x, historyNook.height + 0.3, historyNook.minZ + 0.1], { tint: '#2a2420' })
    b.box('plain', [0.27, 0.36, 0.01], [x, historyNook.height + 0.3, historyNook.minZ + 0.12], { tint: '#efe7d6' })
  }
  b.box('plain', [0.14, 0.16, 0.14], [historyNook.maxX - 0.25, historyNook.height + 0.08, historyNook.maxZ - 0.25], { tint: '#1f1d1b' })
  b.addGlow((caseL.minX + caseR.maxX) / 2, 1.6, (caseL.minZ + caseL.maxZ) / 2, 0.9, '#ffe2b0')
  placeCultureSlots(b, 'modernShop')
}

export function buildShizixuanInterior(b, config = {}) {
  const variant = config.variant ?? 'modernShop'
  if (variant === 'earlyShop') return earlyInterior(b)
  if (variant === 'postwarShop') return postwarInterior(b)
  return modernInterior(b)
}
