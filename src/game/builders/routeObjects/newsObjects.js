import { BoxGeometry, CylinderGeometry, TorusGeometry } from 'three'
import { Parts } from '../inspectParts.js'

/**
 * 主題路線「今日報紙」的器物（第 12 階段）：各年代的報紙、入場券與公告（data/routes/newsRoute.js）。
 * 程式建模；版面只用色塊示意欄位、標題與照片，不複製任何一頁的文字。每個建模函式接受 { detail }，
 * 原點在器物底部中央；radius、centerY、viewPitch 的意思同 pastryObjects.js。
 */

const box = (x, y, z) => new BoxGeometry(x, y, z)

const PAPER = '#ece3cc'
const PAPER_OLD = '#e0d2ac'
const PAPER_NEW = '#f1ede2'
const INK = '#3a342c'
const INK_SOFT = '#7a7060'
const PHOTO = '#6e6a62'
const SEAL = '#b8463a'
const WOOD = '#8f6a44'
const CORK = '#b8935e'
const PIN = '#c0392b'
const TICKET = '#d9c9a0'
const TICKET_BAND = '#9a4a3a'

/**
 * 摺起來的一份報紙：下半頁攤在桌上，上半頁蓋在上面；翻開（動作 unfold）時上半頁沿摺線翻到另一邊，
 * 露出頭版（報頭、標題、照片）。版面座標：z 0–half 是下半頁，摺線在 z = half。
 * 上半頁的頭版畫在它的底面（摺著時朝下、看不到），翻開後朝上；外面那一面是背頁的欄位。
 * style：english 英文報紙（橫排多欄、報頭橫在最上方）／vertical 漢文報紙（直排的欄、報頭框在右上）／
 *        postwar 戰後的報紙（直排、大標題與一張新聞照片）
 */
function buildNewspaper({ detail }, { W, D, style, color = PAPER }) {
  const t = 0.0015
  const half = D / 2
  const lower = new Parts()
  const upper = new Parts()
  lower.add(color, box(W, t * 6, half), { p: [0, t * 3, half / 2] })
  upper.add(color, box(W, t * 6, half), { p: [0, t * 9, half / 2] })
  const yLow = t * 6 + 0.0004 // 下半頁的版面（翻開後看得到）
  const yOut = t * 12 + 0.0004 // 上半頁的外面（背頁，摺著時看得到）
  const yIn = t * 6 - 0.0005 // 上半頁的底面（頭版，翻開後朝上）
  // 版面的一欄（橫排或直排）：在 y 高度、z 範圍裡畫幾條示意的字行
  const columns = (parts, y, z0, z1, vertical, cols) => {
    if (vertical) {
      for (let i = 0; i < cols; i++) parts.add(INK_SOFT, box(0.003, 0.0006, z1 - z0 - 0.01), { p: [W / 2 - 0.02 - i * ((W - 0.04) / cols), y, (z0 + z1) / 2] })
    } else {
      for (let i = 0; i < cols; i++) parts.add(INK_SOFT, box((W - 0.04) / cols - 0.008, 0.0006, z1 - z0 - 0.01), { p: [-W / 2 + 0.02 + ((i + 0.5) * (W - 0.04)) / cols, y, (z0 + z1) / 2] })
    }
  }
  const vertical = style !== 'english'
  const cols = vertical ? (detail ? 22 : 9) : detail ? 7 : 4
  // 下半頁：兩到三段欄位；上半頁外面（背頁）一整段
  const bands = detail ? 3 : 2
  for (let b = 0; b < bands; b++) columns(lower, yLow, 0.012 + (b * (half - 0.024)) / bands, 0.012 + ((b + 1) * (half - 0.024)) / bands, vertical, cols)
  columns(upper, yOut, 0.015, half - 0.015, vertical, vertical ? (detail ? 18 : 7) : detail ? 6 : 3)
  // 頭版（上半頁底面；z 靠近 0 的一端翻開後在最上方）
  if (style === 'english') {
    upper.add(INK, box(W * 0.7, 0.0008, 0.03), { p: [0, yIn, 0.03] })
    upper.add(INK, box(W - 0.03, 0.0008, 0.002), { p: [0, yIn, 0.055] })
    columns(upper, yIn, 0.065, half - 0.012, false, detail ? 7 : 4)
  } else {
    upper.add(INK, box(0.06, 0.0008, 0.1), { p: [W / 2 - 0.05, yIn, 0.065] })
    upper.add(color, box(0.05, 0.0009, 0.09), { p: [W / 2 - 0.05, yIn - 0.0001, 0.065] })
    upper.add(INK, box(0.014, 0.001, 0.13), { p: [W / 2 - 0.1, yIn, 0.08] })
    if (style === 'postwar') {
      upper.add(PHOTO, box(0.13, 0.0008, 0.1), { p: [-0.02, yIn, 0.075] })
      if (detail) upper.add('#9a968c', box(0.05, 0.0009, 0.035), { p: [-0.04, yIn - 0.0001, 0.06] })
    }
    columns(upper, yIn, 0.15, half - 0.012, true, detail ? 18 : 7)
  }
  // 摺痕
  if (detail) lower.add('#cbbf9f', box(W, 0.0009, 0.002), { p: [0, yLow + 0.0002, half - 0.001] })

  // 以摺線為中心（摺著時在畫面下緣，攤開後整份報紙置中）
  const lowerGeometry = lower.build().translate(0, 0, -half)
  const upperGeometry = upper.build().translate(0, 0, -half)
  return {
    radius: Math.max(W, D) * 0.62,
    centerY: 0.01,
    viewPitch: 0.6,
    parts: [
      { id: 'lower', geometry: lowerGeometry },
      { id: 'upper', geometry: upperGeometry, pivot: [0, t * 6, 0], animate: { action: 'unfold', axis: 'x', from: 0, to: Math.PI * 0.97 } },
    ],
  }
}

/** 香港的英文報紙（1890）：大張、橫排多欄（版面尺寸查無，示意） */
const buildEnglishNewspaper = (options) => buildNewspaper(options, { W: 0.46, D: 0.6, style: 'english', color: PAPER_OLD })
/** 漢文的週刊報紙（1929）：直排（版面尺寸查無，示意） */
const buildMinpaoNewspaper = (options) => buildNewspaper(options, { W: 0.38, D: 0.52, style: 'vertical', color: PAPER })
/** 戰後的日報（1968）：直排、大標題與新聞照片（版面尺寸查無，示意） */
const buildPostwarNewspaper = (options) => buildNewspaper(options, { W: 0.4, D: 0.56, style: 'postwar', color: PAPER_NEW })

/**
 * 博覽會的團體入場券（依國立臺灣歷史博物館 2009.011.0281：紙質，9.1 × 13.6 公分；正面印編號、大人小人與費用，
 * 背面是注意事項，各會場有打洞的記號，第一、第二會場與分場、夜間會場都可以用）。字不畫，以色塊示意。
 * 動作 flip：翻到背面，看各會場打過的洞。
 */
function buildExpoTicket({ detail }) {
  const W = 0.091
  const D = 0.136
  const t = 0.0012
  const ticket = new Parts()
  ticket.add(TICKET, box(W, t, D), { p: [0, 0, 0] })
  // 正面：上方的色帶與標題、編號、大人小人兩欄與費用
  ticket.add(TICKET_BAND, box(W - 0.008, 0.0004, 0.022), { p: [0, t / 2 + 0.0002, D / 2 - 0.016] })
  ticket.add(INK, box(0.03, 0.0004, 0.006), { p: [W / 2 - 0.022, t / 2 + 0.0002, D / 2 - 0.036] })
  for (const x of [-0.02, 0.02]) {
    ticket.add(INK_SOFT, box(0.03, 0.0004, 0.03), { p: [x, t / 2 + 0.0002, 0.0] })
    ticket.add(PAPER, box(0.026, 0.0005, 0.026), { p: [x, t / 2 + 0.0003, 0.0] })
  }
  if (detail) {
    for (let i = 0; i < 4; i++) ticket.add(INK_SOFT, box(W - 0.02, 0.0004, 0.0012), { p: [0, t / 2 + 0.0002, -0.025 - i * 0.008] })
    ticket.add(TICKET_BAND, new TorusGeometry(0.008, 0.0012, 4, 16), { p: [-W / 2 + 0.016, t / 2 + 0.0002, D / 2 - 0.016], r: [Math.PI / 2, 0, 0] })
  }
  // 背面：注意事項的條文與各會場的打洞（深色的小圓，翻過來才看得到）
  for (let i = 0; i < (detail ? 9 : 4); i++) ticket.add(INK_SOFT, box(W - 0.02, 0.0004, 0.0014), { p: [0, -t / 2 - 0.0002, D / 2 - 0.02 - i * 0.009] })
  for (const [x, z] of [[-0.03, -0.045], [-0.01, -0.045], [0.01, -0.045], [0.03, -0.045]]) ticket.add('#2a2622', new CylinderGeometry(0.0035, 0.0035, t + 0.0012, detail ? 12 : 6), { p: [x, 0, z] })

  return {
    radius: 0.1,
    centerY: 0,
    viewPitch: 0.7,
    parts: [{ id: 'ticket', geometry: ticket.build(), pivot: [0, 0, 0], animate: { action: 'flip', axis: 'z', from: 0, to: Math.PI } }],
  }
}

/**
 * 釘在公告欄上的市府公告（版式依臺北市政府公告：主旨、依據、公告事項，蓋有機關印信；字不畫，以色塊示意）。
 * 動作 lift：掀起公告的第一頁，看下面附的計畫範圍示意圖。
 */
function buildPublicNotice({ detail }) {
  const W = 0.21
  const H = 0.297
  const board = new Parts()
  board.add(WOOD, box(0.5, 0.42, 0.03), { p: [0, 0.21, -0.02] })
  board.add(CORK, box(0.46, 0.38, 0.004), { p: [0, 0.21, -0.003] })
  // 底下的附圖：街廓與保存範圍（示意的色塊）
  board.add(PAPER_NEW, box(W, H, 0.0008), { p: [0.02, 0.2, 0.0006] })
  board.add('#c9c2b0', box(W - 0.03, 0.03, 0.0005), { p: [0.02, 0.24, 0.0012] })
  board.add('#d9a46a', box(W - 0.08, 0.1, 0.0005), { p: [0.02, 0.17, 0.0012] })
  if (detail) for (let i = 0; i < 6; i++) board.add('#8a8070', box(0.002, 0.1, 0.0006), { p: [-0.05 + i * 0.028, 0.17, 0.0014] })
  // 旁邊的另一張舊公告（斜斜的）
  board.add(PAPER_OLD, box(0.13, 0.17, 0.0008), { p: [-0.16, 0.25, 0.0006], r: [0, 0, 0.05] })

  // 公告本文：以上緣的圖釘為樞軸掀起
  const notice = new Parts()
  notice.add(PAPER_NEW, box(W, H, 0.0008), { p: [0.02, 0.2, 0.0022] })
  notice.add(INK, box(0.1, 0.012, 0.0006), { p: [0.02, 0.33, 0.003] })
  const lines = detail ? 14 : 6
  for (let i = 0; i < lines; i++) notice.add(INK_SOFT, box(W - 0.04 - (i % 3) * 0.02, 0.0035, 0.0006), { p: [0.02, 0.3 - i * (0.2 / lines), 0.003] })
  notice.add(SEAL, box(0.04, 0.04, 0.0006), { p: [0.08, 0.09, 0.003] })
  if (detail) notice.add('#f1ede2', box(0.032, 0.032, 0.0007), { p: [0.08, 0.09, 0.0032] })
  for (const x of [-0.07, 0.11]) notice.add(PIN, new CylinderGeometry(0.006, 0.006, 0.006, detail ? 10 : 6), { p: [x, 0.34, 0.004], r: [Math.PI / 2, 0, 0] })

  return {
    radius: 0.32,
    centerY: 0.2,
    viewPitch: -0.05,
    parts: [
      { id: 'board', geometry: board.build() },
      { id: 'notice', geometry: notice.build(), pivot: [0, 0.345, 0.003], animate: { action: 'lift', axis: 'x', from: 0, to: -1.25 } },
    ],
  }
}

export const NEWS_BUILDERS = {
  'hkdp-1890': buildEnglishNewspaper,
  'minpao-1929': buildMinpaoNewspaper,
  'expo-ticket-1935': buildExpoTicket,
  'udn-1968': buildPostwarNewspaper,
  'notice-2000': buildPublicNotice,
}
