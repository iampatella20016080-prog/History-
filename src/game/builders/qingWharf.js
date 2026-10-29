import { createRng } from '../utils/random.js'
import { PORTERS, POLE, TEA_CHEST, TEA_STACKS, WHARF_BOATS, boatBlocker, qingWharfBoxes, stackChests } from '../../data/qingWharfLayout.js'

/**
 * 清末碼頭（港口商街）：河岸廣場上的茶箱堆、挑夫放在地上的擔子，以及茶箱堆、挑夫與停靠船隻的鏡頭遮擋方塊。
 * 配置與查證見 data/qingWharfLayout.js、docs/research/qing-wharf.md；停靠的船畫在 components/River.jsx（隨水面起伏）。
 *
 * 只用既有的材質（wood、paper、bamboo、dark），不增加繪製呼叫；
 * 綑紮的篾條與吊繩放在 detail（流暢模式不畫，精緻模式多一個 bamboo 批次）；外裱紙與木箱合併在既有的 paper、wood 批次。
 */

/** 一個外銷茶箱：木箱（原點在底面中心）、外裱紙與兩道綑紮（綑紮方式查無，是情境重建） */
export function wharfTeaChest(b, detail, [x, y, z], { rotationY = 0, tint = '#c9a77a', seed = 1 } = {}) {
  const { width: w, depth: d, height: h } = TEA_CHEST
  const rng = createRng(seed)
  b.group([x, y, z], rotationY, () => {
    b.box('wood', [w, h, d], [0, h / 2, 0], { tint, grime: 0.25 })
    // 外裱紙：正面與側面各一張，略小於箱面；彩色印花紙或手繪（Davidson 1903），圖案不仿任何洋行的商標
    const paper = ['#e3b45a', '#d9876a', '#efe4c8', '#9fb08a'][Math.floor(rng() * 4)]
    b.plane('paper', w * 0.78, h * 0.7, [0, h * 0.5, d / 2 + 0.006], { tint: paper })
    b.plane('paper', d * 0.74, h * 0.7, [w / 2 + 0.006, h * 0.5, 0], { rotation: [0, Math.PI / 2, 0], tint: paper })
  })
  detail.group([x, y, z], rotationY, () => {
    // 兩道綑紮（篾條）
    for (const sx of [-0.28, 0.28]) detail.box('bamboo', [0.035, h + 0.012, d + 0.012], [sx * w, h / 2, 0], { tint: '#9c8456' })
  })
}

function teaStack(b, detail, stack, seed) {
  b.group([stack.center[0], 0, stack.center[1]], stack.rotationY, () => {
    detail.group([stack.center[0], 0, stack.center[1]], stack.rotationY, () => {
      stackChests(stack).forEach((chest, i) => {
        const rng = createRng(seed + i)
        wharfTeaChest(b, detail, [chest.x, chest.y, chest.z], {
          rotationY: (rng() - 0.5) * 0.08,
          tint: ['#c9a77a', '#bf9c6f', '#d0b085'][i % 3],
          seed: seed + i,
        })
      })
    })
  })
  // 堆腳的草蓆（等著上船時墊在地上）
  b.box('bamboo', [stack.cols * (TEA_CHEST.width + 0.03) + 0.3, 0.02, stack.rows * (TEA_CHEST.depth + 0.03) + 0.3], [stack.center[0], 0.035, stack.center[1]], {
    rotation: [0, stack.rotationY, 0],
    tint: '#cdb98a',
  })
}

/** 放在地上的擔子：一根扁擔、兩端各一個茶箱與吊繩 */
function restingLoad(b, detail, [x, z]) {
  b.cylinder('bamboo', 0.028, 0.028, POLE.length, 6, [x, 0.46, z], { rotation: [0, 0, Math.PI / 2 - 0.05], tint: '#b49a5e' })
  for (const end of [-1, 1]) {
    wharfTeaChest(b, detail, [x + end * POLE.chestOffset, 0, z], { rotationY: Math.PI / 2 + end * 0.06, seed: 40 + end })
    detail.cylinder('bamboo', 0.008, 0.008, 0.06, 4, [x + end * POLE.chestOffset, TEA_CHEST.height + 0.03, z], { tint: '#5a4634' })
  }
}

/**
 * 在街景裡建出清末碼頭；回傳 { npcs }（挑夫，由 NpcLayer 畫出）。
 * 鏡頭遮擋方塊：茶箱堆、挑夫與擔子、接駁小船與河道中的戎克船（船身，忽略起伏）。
 */
export function buildQingWharf(b, detail = b) {
  TEA_STACKS.forEach((stack, i) => teaStack(b, detail, stack, 100 + i * 20))
  for (const porter of PORTERS) if (porter.restLoad) restingLoad(b, detail, porter.restLoad)
  for (const box of qingWharfBoxes()) b.blockers.push({ ...box })
  for (const boat of WHARF_BOATS) b.blockers.push(boatBlocker(boat))
  const npcs = PORTERS.map((porter, i) => ({
    id: `qing-wharf-${porter.id}`,
    look: porter.look,
    pose: porter.pose,
    position: [porter.position[0], 0, porter.position[1]],
    rotationY: porter.rotationY,
    phase: (0.17 + i * 0.41) % 1,
  }))
  return { npcs }
}
