import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { createRng } from '../utils/random.js'
import { DISPLAY_FONT, registerFontTexture } from './fonts.js'

/**
 * 招牌貼圖：以 Canvas 繪製底板、框線與書法字。
 *
 * 各年代的招牌樣式：
 * - wood / lacquer / red / cloth  清末的木匾、漆金匾、紅底匾與布幡
 * - gold      日治時期的「金字招牌」：深色漆底、金箔字
 * - deco      1930 年代 Art Deco：祖母綠底、香檳金字與幾何框飾
 * - letters   立體字（無底板，直接貼在立面上）
 * - painted   戰後手繪招牌：米白底、紅或藍色字
 * - vertical  戰後直立招牌：白底紅字、藍色邊框
 * - menu      攤販的手寫菜單牌
 * - modern    今日老屋新生的店招：簡潔、由左至右書寫
 * - label     說明牌（例如「江山樓｜歷史情境重建」）：米白底、由左至右書寫
 * - engraved  嵌在牆面上的黑色立體字（無底板）；awningBlack 黑色布篷垂邊；whiteCloth 白色布旗、暖簾；road 綠色路名牌
 * - 永樂市場：greenBoard 好粿緣的綠色招牌、redPlate 紅色攤位牌、redLetters「永樂布業商場」紅字、
 *   redOnDark 門楣、marketWhite 指示吊牌、marketBoard 指示牌、exitGreen 出口、tag 木製品名牌、stall* 攤位招牌
 * - 導演的豆花店：actionBlue／actionNavy 立面上白邊的藍色與深藍色立體字、filmBlue 電影膠卷邊的藍色突出招牌、
 *   boardWhite 店內的展示看板、chalk 黑板菜單、truckBlue 豆花車車身上的藍字
 * - 小藝埕與爐鍋咖啡：relief／redRelief 洗石子立面上的浮雕字、artYard 旗幟、luguoWood 木製招牌、couplet 春聯
 * - 老潘魷魚羹：laopanName／laopanSub 褪色的黃色主招牌（紅色店名、深藍色品名）、laopanVertical 紅底裝飾框的直立招牌、
 *   awningRed 紅色雨棚垂邊上的白字、laopanMenu 店內的品名板（不寫價格）
 * - 永樂米苔目：mitaimuGold 紅色直條紋主招牌上的金色立體字、mitaimuSmall 右側直寫的「50年老店」、
 *   mitaimuVertical 紅色直立側招牌、takeawayRed「外帶區」紅牌、mitaimuMenu 店內菜單板的直寫店名、tableNumber 紅色的桌號牌
 *
 * 橫式招牌依舊日習慣由右至左書寫（modern 除外）；直式招牌由上而下。
 */
export const SIGN_STYLES = {
  lacquer: { bg: '#2f221a', bg2: '#3e2c22', border: '#b8924f', text: '#e4c074', shadow: 'rgba(0,0,0,0.6)', grain: 'rgba(255,220,170,0.06)' },
  wood: { bg: '#a98159', bg2: '#94704b', border: '#5a3f2b', text: '#21160f', shadow: 'rgba(255,238,205,0.28)', grain: 'rgba(60,35,20,0.17)' },
  red: { bg: '#9d3b2a', bg2: '#873123', border: '#d9b46a', text: '#f2d99c', shadow: 'rgba(40,10,5,0.5)', grain: 'rgba(255,200,170,0.07)' },
  cloth: { bg: '#ece2cb', bg2: '#e0d4b9', border: '#9e3b2a', text: '#2c1f17', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,95,60,0.1)' },
  gold: { bg: '#2a1a15', bg2: '#3b231b', border: '#d4ad5c', text: 'gold', shadow: 'rgba(0,0,0,0.65)', grain: 'rgba(255,215,150,0.05)', double: true },
  deco: { bg: '#2f6b5a', bg2: '#275a4c', border: '#d6b77a', text: '#f3e3b8', shadow: 'rgba(10,30,24,0.55)', grain: 'rgba(255,255,255,0.03)', deco: true },
  painted: { bg: '#f1e8d3', bg2: '#e6dbc2', border: '#a3392a', text: 'ink', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,100,70,0.12)', faded: true },
  vertical: { bg: '#f7f2e6', bg2: '#ece5d5', border: '#2e4a7a', text: '#b3291d', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,110,90,0.08)' },
  menu: { bg: '#f6efdf', bg2: '#ede3cd', border: '#7a4a2e', text: '#b3291d', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,95,60,0.12)' },
  modern: { bg: '#2d2b28', bg2: '#353230', border: null, text: '#efe7d6', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.025)', ltr: true },
  modernLight: { bg: '#d5b98f', bg2: '#c8aa7e', border: null, text: '#2b221b', shadow: 'rgba(255,240,215,0.2)', grain: 'rgba(80,50,25,0.12)', ltr: true },
  letters: { bg: null, text: 'gold', shadow: 'rgba(30,20,10,0.75)', letters: true },
  // 說明牌：米白底、深色字、由左至右書寫（標示「歷史情境重建」等說明）
  label: { bg: '#f4eddd', bg2: '#ebe2cf', border: '#8f3a2a', text: '#2b211a', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,95,60,0.05)', ltr: true, sizeH: 0.56, sizeW: 0.9 },
  // 嵌在洗石子牆上的黑色立體字（滋養豆餡舖的店名），由左至右書寫
  engraved: { bg: null, text: '#1f1d1b', shadow: '#77746f', ltr: true, sizeH: 0.82, sizeW: 0.84 },
  // 黑色布篷垂邊上的白色店名
  awningBlack: { bg: '#1f1d1c', bg2: '#2a2725', border: null, text: '#f1ece1', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.66, sizeW: 0.8 },
  // 白底黑字的布旗與暖簾
  whiteCloth: { bg: '#f7f5ef', bg2: '#ece8df', border: null, text: '#1f1b18', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,110,95,0.07)' },
  // 綠底白字的路名牌
  road: { bg: '#1d6a50', bg2: '#1a6149', border: '#f2f4f0', text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.02)', ltr: true, sizeH: 0.6, sizeW: 0.82 },
  // 永樂市場：好粿緣的鮮綠色大招牌（四角白色回紋）、紅色攤位牌、紅色立體字、指示吊牌、出口標示、木製品名牌
  greenBoard: { bg: '#45b23f', bg2: '#3ea539', border: null, text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.025)', ltr: true, sizeH: 0.74, sizeW: 0.8, frets: '#ffffff' },
  redPlate: { bg: '#c8282e', bg2: '#b92228', border: '#f6e7c8', text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.6, sizeW: 0.86 },
  redLetters: { bg: null, text: '#c3242b', shadow: '#6f1418', ltr: true, sizeH: 0.8, sizeW: 0.9 },
  redOnDark: { bg: '#232526', bg2: '#2b2d2f', border: null, text: '#d8433c', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.02)', ltr: true, sizeH: 0.64 },
  marketWhite: { bg: '#f6f6f2', bg2: '#efefea', border: null, text: '#262626', shadow: 'rgba(0,0,0,0)', grain: 'rgba(0,0,0,0.02)', ltr: true, sizeH: 0.72, sizeW: 0.86 },
  marketBoard: { bg: '#f6f4ef', bg2: '#eeebe4', border: '#c8282e', text: '#c8282e', shadow: 'rgba(0,0,0,0)', grain: 'rgba(0,0,0,0.03)' },
  exitGreen: { bg: '#1f8a4c', bg2: '#1b7a43', border: null, text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.02)', ltr: true, sizeH: 0.66 },
  tag: { bg: '#d8b78a', bg2: '#caa776', border: null, text: '#2b1d12', shadow: 'rgba(0,0,0,0)', grain: 'rgba(80,50,25,0.12)', ltr: true, sizeH: 0.7, sizeW: 0.86 },
  stallRed: { bg: '#c0392b', bg2: '#b03224', border: '#f2d9a6', text: '#fff4e0', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.62 },
  stallYellow: { bg: '#efc22b', bg2: '#e6b722', border: '#b3261d', text: '#b3261d', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,80,0,0.05)', ltr: true, sizeH: 0.62 },
  stallWhite: { bg: '#f4f2ec', bg2: '#ebe8e0', border: '#2e4a7a', text: '#b3261d', shadow: 'rgba(0,0,0,0)', grain: 'rgba(0,0,0,0.03)', ltr: true, sizeH: 0.62 },
  stallBlue: { bg: '#2f5f9e', bg2: '#295490', border: '#f4f2ec', text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.62 },
  // 導演的豆花店
  actionBlue: { bg: null, text: '#2b93d9', fill: '#2b93d9', outline: '#ffffff', outlineWidth: 0.16, shadow: 'rgba(30,60,90,0.3)', letters: true, ltr: true, sizeH: 0.8, sizeW: 0.92 },
  actionNavy: { bg: null, text: '#1f2b45', fill: '#1f2b45', outline: '#ffffff', outlineWidth: 0.14, shadow: 'rgba(30,40,60,0.25)', letters: true, ltr: true, sizeH: 0.82, sizeW: 0.78 },
  filmBlue: { bg: '#2190dc', bg2: '#1c83cc', border: null, text: '#f4f9ff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, film: '#e9f4fd' },
  // 店內白色看板上的藍色標題（字直接印在看板上，沒有底色）
  boardInk: { bg: null, text: '#2a659e', fill: '#2a659e', outline: '#f4f7f9', outlineWidth: 0.05, letters: true, ltr: true, sizeH: 0.8, sizeW: 0.9 },
  boardWhite: { bg: '#f1f4f6', bg2: '#e7ecef', border: null, text: '#245a8c', shadow: 'rgba(0,0,0,0)', grain: 'rgba(0,0,0,0.02)', ltr: true, sizeH: 0.62, sizeW: 0.86 },
  chalk: { bg: '#2c3431', bg2: '#262d2a', border: '#8a6a45', text: '#f1eee4', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.05)', ltr: true, sizeH: 0.5, sizeW: 0.8 },
  truckBlue: { bg: null, text: '#1f5fa8', fill: '#1f5fa8', outline: '#ffffff', outlineWidth: 0.06, shadow: 'rgba(0,0,0,0)', letters: true, ltr: true, sizeH: 0.8, sizeW: 0.9 },
  // 小藝埕（屈臣氏大藥房舊址）：洗石子立面上的浮雕英文字、紅褐色的店號浮雕字（由右往左）、紅褐色的垂掛旗幟
  relief: { bg: null, text: '#d2cec4', fill: '#d6d2c8', outline: '#8a867e', outlineWidth: 0.05, shadow: '#5f5c56', letters: true, ltr: true, sizeH: 0.82, sizeW: 0.8 },
  redRelief: { bg: null, text: '#ad5b4c', fill: '#b0604f', outline: '#6f3a30', outlineWidth: 0.05, shadow: '#4f2e28', letters: true, sizeH: 0.8, sizeW: 0.86 },
  artYard: { bg: '#7b3a31', bg2: '#6e322a', border: null, text: '#f5ece0', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', sizeW: 0.7 },
  artYardLatin: { bg: '#7b3a31', bg2: '#6e322a', border: null, text: '#f5ece0', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.62, sizeW: 0.86 },
  // 爐鍋咖啡：大木櫃上的紅色春聯（直式、黑字）；淺色木板、黑框黑字的招牌
  couplet: { bg: '#c8342c', bg2: '#b62a24', border: null, text: '#1f1612', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,220,200,0.06)' },
  luguoWood: { bg: '#c99d64', bg2: '#bb8f58', border: '#2a1f18', text: '#1d1611', shadow: 'rgba(255,236,200,0.25)', grain: 'rgba(70,40,20,0.16)', ltr: true },
  // 老潘魷魚羹：上下兩塊同色的黃底拼成一面主招牌（沒有框線，框是立體的鐵框），日曬褪色
  laopanName: { bg: '#e0c25e', bg2: '#e0c25e', border: null, text: '#b5281e', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,90,20,0.07)', ltr: true, sizeH: 0.74, sizeW: 0.88, faded: true },
  laopanSub: { bg: '#e0c25e', bg2: '#e0c25e', border: null, text: '#253c6c', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,90,20,0.07)', ltr: true, sizeH: 0.66, sizeW: 0.84, faded: true },
  laopanVertical: { bg: '#b92a20', bg2: '#a9231a', border: '#e9c45a', text: '#fbf0cf', shadow: 'rgba(60,10,5,0.35)', grain: 'rgba(255,220,200,0.05)', double: true },
  awningRed: { bg: '#c3342a', bg2: '#b52d24', border: null, text: '#fffaf2', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.05)', ltr: true, sizeH: 0.64, sizeW: 0.78 },
  laopanMenu: { bg: '#f6f3ea', bg2: '#eeeadf', border: '#b3261d', text: '#b3261d', shadow: 'rgba(0,0,0,0)', grain: 'rgba(0,0,0,0.02)', ltr: true, sizeH: 0.56, sizeW: 0.86 },
  // 永樂米苔目：紅色直條紋的主招牌（底板是立體的凸條，貼圖只有金色立體字）、紅色直立側招牌、外帶區的紅牌、菜單板與桌號牌
  mitaimuGold: { bg: null, text: 'gold', shadow: 'rgba(70,12,8,0.85)', outline: '#6e4a1c', outlineWidth: 0.05, letters: true, ltr: true, sizeH: 0.84, sizeW: 0.84 },
  mitaimuSmall: { bg: null, text: 'gold', shadow: 'rgba(70,12,8,0.6)', outline: '#6e4a1c', outlineWidth: 0.04, letters: true, ltr: true },
  mitaimuVertical: { bg: '#c42d27', bg2: '#b52620', border: '#f4e2b8', text: '#fff6e6', shadow: 'rgba(60,10,5,0.3)', grain: 'rgba(255,220,200,0.05)' },
  takeawayRed: { bg: '#c22a25', bg2: '#b52520', border: null, text: '#fff8ec', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.04)', ltr: true, sizeH: 0.72, sizeW: 0.86 },
  mitaimuMenu: { bg: '#f3ead6', bg2: '#ede2ca', border: null, text: '#8a2c22', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,90,50,0.05)' },
  tableNumber: { bg: '#cf2a26', bg2: '#c42521', border: null, text: '#ffffff', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.8, sizeW: 0.9 },
  // 黃玉階文史館：黑底（帶一點藍）金字的匾額（立面的「元珍」、室內的「學貫中西」，由右往左）、
  // 騎樓斜掛的綠色「源珍」木匾（淺綠色的刻字）、陶缸上紅色菱形紙的黑字、騎樓的粉色直式布條、白色布旗
  heritagePlaque: { bg: '#1d2331', bg2: '#262d3d', border: null, text: 'gold', shadow: 'rgba(0,0,0,0.65)', grain: 'rgba(170,190,220,0.06)', sizeH: 0.7, sizeW: 0.78 },
  heritageGreen: { bg: '#2f5a47', bg2: '#284e3d', border: null, text: '#b5e0bd', shadow: 'rgba(8,26,18,0.7)', grain: 'rgba(255,255,255,0.05)', sizeH: 0.64, sizeW: 0.72 },
  jarLabel: { bg: null, text: '#1c1612', fill: '#1c1612', outline: '#1c1612', outlineWidth: 0.02, shadow: 'rgba(0,0,0,0)', letters: true, sizeH: 0.82, sizeW: 0.86 },
  pinkBanner: { bg: '#ecd2d6', bg2: '#e4c3c9', border: '#3c3236', text: '#2a2326', shadow: 'rgba(0,0,0,0)', grain: 'rgba(90,60,70,0.05)' },
  // 迪化街329號店屋（稻舍）：入口上方的金色立體字、黑底金字的吊牌、二樓飾板上深褐色的浮雕字（由左往右）
  riceGold: { bg: null, text: 'gold', shadow: 'rgba(40,20,10,0.8)', outline: '#5a3a18', outlineWidth: 0.05, letters: true, ltr: true, sizeH: 0.8, sizeW: 0.86 },
  riceBlack: { bg: '#1b1918', bg2: '#232120', border: null, text: '#e7c77e', shadow: 'rgba(0,0,0,0)', grain: 'rgba(255,255,255,0.03)', ltr: true, sizeH: 0.7, sizeW: 0.9 },
  riceRelief: { bg: null, text: '#4a2e22', fill: '#4a2e22', outline: '#2a1a12', outlineWidth: 0.03, shadow: 'rgba(60,40,30,0.35)', letters: true, ltr: true, sizeH: 0.8, sizeW: 0.62 },
  flagCloth: { bg: '#f1eee6', bg2: '#e8e3d8', border: null, text: '#2a2420', shadow: 'rgba(0,0,0,0)', grain: 'rgba(120,110,95,0.08)', sizeH: 0.5, sizeW: 0.62 },
  // 十字軒糕餅舖（2000–現在）：紅底、每個字套金色圓框的店名（由左往右；直式招牌由上而下）、金色小字的英文、金色圓形徽章
  szxCircle: { bg: '#c3242b', bg2: '#b51f26', border: null, text: 'gold', shadow: 'rgba(70,10,10,0.35)', grain: 'rgba(255,255,255,0.02)', ltr: true, circles: true, sizeH: 0.62, sizeW: 0.8 },
  szxSmall: { bg: null, text: 'gold', shadow: 'rgba(70,10,10,0.5)', outline: '#7a1a18', outlineWidth: 0.03, letters: true, ltr: true, sizeH: 0.8, sizeW: 0.7 },
  szxBadge: { bg: null, text: 'gold', shadow: 'rgba(70,10,10,0.5)', badge: true },
}

/** 十字軒的徽章：兩圈金色圓環、回紋方框與中央的「十」 */
function drawBadge(g, cw, ch, text) {
  g.clearRect(0, 0, cw, ch)
  const cx = cw / 2
  const cy = ch / 2
  const r = Math.min(cw, ch) * 0.46
  const gold = goldFill(g, cy - r, cy + r)
  g.strokeStyle = gold
  g.lineWidth = r * 0.07
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.stroke()
  g.lineWidth = r * 0.035
  g.beginPath()
  g.arc(cx, cy, r * 0.84, 0, Math.PI * 2)
  g.stroke()
  // 回紋方框
  const s = r * 0.55
  g.lineWidth = r * 0.05
  g.strokeRect(cx - s, cy - s, s * 2, s * 2)
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    g.beginPath()
    g.moveTo(cx + sx * s, cy + sy * s * 0.45)
    g.lineTo(cx + sx * s * 0.72, cy + sy * s * 0.45)
    g.lineTo(cx + sx * s * 0.72, cy + sy * s * 0.72)
    g.lineTo(cx + sx * s * 0.45, cy + sy * s * 0.72)
    g.lineTo(cx + sx * s * 0.45, cy + sy * s)
    g.stroke()
  }
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `700 ${r * 0.8}px ${DISPLAY_FONT}`
  g.fillStyle = gold
  g.fillText(text || '十', cx, cy + r * 0.04)
}

/** 電影膠卷的齒孔：沿著招牌的上下（橫式）或左右（直式）兩邊排一列圓角方孔 */
function drawFilmStrip(g, cw, ch, m, color, vertical) {
  g.fillStyle = color
  const along = vertical ? ch : cw
  const across = vertical ? cw : ch
  const hole = Math.min(across * 0.07, along * 0.05)
  const count = Math.max(4, Math.floor(along / (hole * 2.2)))
  const step = along / count
  for (let i = 0; i < count; i++) {
    const t = step * (i + 0.5) - hole / 2
    for (const edge of [m * 0.9, across - m * 0.9 - hole]) {
      const [x, y] = vertical ? [edge, t] : [t, edge]
      g.beginPath()
      g.roundRect?.(x, y, hole, hole, hole * 0.25)
      if (!g.roundRect) g.rect(x, y, hole, hole)
      g.fill()
    }
  }
}

/** 四角的回紋（L 形折線），用於好粿緣的綠色招牌 */
function drawFrets(g, cw, ch, m, color) {
  g.strokeStyle = color
  g.lineWidth = Math.max(2, m * 0.16)
  const a = m * 1.1
  const b = m * 2.2
  const c = m * 3.3
  for (const [x, y, sx, sy] of [
    [m, m, 1, 1],
    [cw - m, m, -1, 1],
    [m, ch - m, 1, -1],
    [cw - m, ch - m, -1, -1],
  ]) {
    g.beginPath()
    g.moveTo(x + sx * c, y)
    g.lineTo(x, y)
    g.lineTo(x, y + sy * c)
    g.moveTo(x + sx * a, y + sy * b)
    g.lineTo(x + sx * a, y + sy * a)
    g.lineTo(x + sx * b, y + sy * a)
    g.moveTo(x + sx * b, y + sy * b)
    g.lineTo(x + sx * b * 0.9, y + sy * b * 0.9)
    g.stroke()
  }
}

const PAINTED_INKS = ['#a8301f', '#2e4a7a', '#a8301f', '#2a231e']

function resolveStyle(style, text) {
  if (style === 'modern') return text.length % 2 === 0 ? SIGN_STYLES.modernLight : SIGN_STYLES.modern
  return SIGN_STYLES[style] ?? SIGN_STYLES.wood
}

function goldFill(g, y0, y1) {
  const grad = g.createLinearGradient(0, y0, 0, y1)
  grad.addColorStop(0, '#fff0b8')
  grad.addColorStop(0.45, '#e3b860')
  grad.addColorStop(0.55, '#c99a45')
  grad.addColorStop(1, '#f3d58c')
  return grad
}

function drawDecoOrnaments(g, cw, ch, m, color) {
  g.strokeStyle = color
  g.lineWidth = Math.max(1.5, m * 0.12)
  const step = m * 0.9
  for (const [x, y, sx, sy] of [
    [m, m, 1, 1],
    [cw - m, m, -1, 1],
    [m, ch - m, 1, -1],
    [cw - m, ch - m, -1, -1],
  ]) {
    g.beginPath()
    g.moveTo(x, y + sy * step * 2)
    g.lineTo(x + sx * step, y + sy * step * 2)
    g.lineTo(x + sx * step, y + sy * step)
    g.lineTo(x + sx * step * 2, y + sy * step)
    g.lineTo(x + sx * step * 2, y)
    g.stroke()
  }
}

/** 在 (0,0)–(cw,ch) 的區域內畫一面招牌 */
function drawSign(g, cw, ch, text, style, vertical) {
  const s = resolveStyle(style, text)
  if (s.badge) {
    drawBadge(g, cw, ch, text)
    return
  }
  const rng = createRng(text.charCodeAt(0) * 31 + cw * 7 + ch)
  const m = Math.min(cw, ch) * 0.075

  if (s.bg) {
    const grad = g.createLinearGradient(0, 0, vertical ? cw : 0, vertical ? 0 : ch)
    grad.addColorStop(0, s.bg)
    grad.addColorStop(1, s.bg2)
    g.fillStyle = grad
    g.fillRect(0, 0, cw, ch)

    // 木紋／布紋
    g.lineCap = 'round'
    for (let i = 0; i < 46; i++) {
      g.strokeStyle = s.grain
      g.lineWidth = 0.8 + rng() * 2.2
      g.beginPath()
      if (vertical) {
        const x = rng() * cw
        g.moveTo(x, 0)
        g.bezierCurveTo(x + (rng() - 0.5) * 10, ch * 0.33, x + (rng() - 0.5) * 10, ch * 0.66, x + (rng() - 0.5) * 6, ch)
      } else {
        const y = rng() * ch
        g.moveTo(0, y)
        g.bezierCurveTo(cw * 0.33, y + (rng() - 0.5) * 10, cw * 0.66, y + (rng() - 0.5) * 10, cw, y + (rng() - 0.5) * 6)
      }
      g.stroke()
    }

    // 框線
    if (s.border) {
      g.strokeStyle = s.border
      g.lineWidth = m * 0.32
      g.strokeRect(m, m, cw - 2 * m, ch - 2 * m)
      if (s.double || !s.deco) {
        g.lineWidth = Math.max(1.5, m * 0.1)
        g.strokeRect(m * 1.7, m * 1.7, cw - 3.4 * m, ch - 3.4 * m)
      }
      if (s.deco) drawDecoOrnaments(g, cw, ch, m * 1.6, s.border)
    }
    if (s.frets) drawFrets(g, cw, ch, m * 1.1, s.frets)
    if (s.film) drawFilmStrip(g, cw, ch, m, s.film, vertical)
    // 戰後招牌的日曬褪色
    if (s.faded) {
      for (let i = 0; i < 18; i++) {
        g.fillStyle = `rgba(255,250,235,${0.04 + rng() * 0.06})`
        g.beginPath()
        g.ellipse(rng() * cw, rng() * ch, 10 + rng() * cw * 0.2, 6 + rng() * ch * 0.2, rng() * 3, 0, Math.PI * 2)
        g.fill()
      }
    }
  } else {
    g.clearRect(0, 0, cw, ch)
  }

  // 文字
  const chars = [...text]
  const n = chars.length
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  let ink = s.text
  if (ink === 'ink') ink = PAINTED_INKS[(text.charCodeAt(0) + n) % PAINTED_INKS.length]
  const weight = s.ltr ? 600 : 700
  const positions = []
  let size
  if (vertical) {
    const inner = ch - m * 4
    size = Math.min(cw * (s.letters ? 0.86 : 0.64), (inner / n) * 0.9)
    chars.forEach((char, i) => positions.push([char, cw / 2, m * 2 + (inner * (i + 0.5)) / n]))
  } else {
    const display = signDisplayOrder(chars, s.ltr)
    const pad = s.letters ? m * 0.5 : m * 2
    const inner = cw - pad * 2
    const heightFactor = s.sizeH ?? (s.letters ? 0.86 : s.ltr ? 0.5 : 0.6)
    const widthFactor = s.sizeW ?? (s.ltr ? 0.78 : 0.92)
    size = Math.min(ch * heightFactor, (inner / n) * widthFactor)
    display.forEach((char, i) => positions.push([char, pad + (inner * (i + 0.5)) / n, ch / 2 + size * 0.03]))
  }
  if (s.circles) {
    // 每個字套一個金色圓框，字縮小到圓框裡
    for (const [, x, y] of positions) {
      g.strokeStyle = goldFill(g, y - size / 2, y + size / 2)
      g.lineWidth = Math.max(2, size * 0.06)
      g.beginPath()
      g.arc(x, y - size * 0.03, size * 0.56, 0, Math.PI * 2)
      g.stroke()
    }
    size *= 0.68
  }
  g.font = `${weight} ${size}px ${DISPLAY_FONT}`
  for (const [char, x, y] of positions) {
    if (s.letters) {
      // 立體字：深色側邊＋金屬面（或指定顏色的字面與外框，例如導演的豆花店白邊藍字）
      g.fillStyle = s.shadow
      g.fillText(char, x + size * 0.04, y + size * 0.05)
      g.lineWidth = Math.max(2, size * (s.outlineWidth ?? 0.05))
      g.lineJoin = 'round'
      g.strokeStyle = s.outline ?? '#4a3720'
      g.strokeText(char, x, y)
      g.fillStyle = s.fill ?? goldFill(g, y - size / 2, y + size / 2)
      g.fillText(char, x, y)
      continue
    }
    g.fillStyle = s.shadow
    g.fillText(char, x + size * 0.03, y + size * 0.04)
    g.fillStyle = ink === 'gold' ? goldFill(g, y - size / 2, y + size / 2) : ink
    g.fillText(char, x, y)
  }
}

/* ───────────── 招牌圖集：一個年代的所有招牌共用一張貼圖、一次繪製 ───────────── */

/**
 * 橫式招牌的字序：由右往左讀的招牌（傳統的橫匾）把字倒過來排，但英文與數字（例如寶順洋行的「Dodd & Co.」）
 * 維持由左往右的閱讀順序，整段當成一個字放進倒過來的序列裡。ltr 的招牌照原本的順序。
 */
export function signDisplayOrder(chars, ltr = false) {
  if (ltr) return chars
  const runs = []
  for (const char of chars) {
    const latin = /[A-Za-z0-9]/.test(char)
    const last = runs.at(-1)
    // 英文詞之間的空白與標點（& . ' -）接在同一段英文裡
    if (last?.latin && (latin || /[ &.'’-]/.test(char))) last.chars.push(char)
    else runs.push({ latin, chars: [char] })
  }
  // 英文段落尾端的空白還給中文那一側（當作英文與中文之間的間隔）
  const out = []
  for (const run of runs.reverse()) {
    if (!run.latin) {
      out.push(...run.chars)
      continue
    }
    const trailing = []
    while (run.chars.at(-1) === ' ') trailing.push(run.chars.pop())
    out.push(...trailing, ...run.chars)
  }
  return out
}

export function signKey({ text, style = 'wood', vertical = false, width, height }) {
  return `${text}|${style}|${vertical ? 1 : 0}|${(width / height).toFixed(2)}`
}

const ATLAS_WIDTH = 2048
const MAX_ATLAS_HEIGHT = 2048
const PADDING = 6

function packCells(entries, pxPerMeter) {
  let x = PADDING
  let y = PADDING
  let shelf = 0
  const sorted = [...entries].sort((a, b) => b.height - a.height)
  for (const entry of sorted) {
    const w = Math.round(Math.min(720, Math.max(48, entry.width * pxPerMeter)))
    const h = Math.round(Math.min(720, Math.max(48, entry.height * pxPerMeter)))
    if (x + w + PADDING > ATLAS_WIDTH) {
      x = PADDING
      y += shelf + PADDING
      shelf = 0
    }
    entry.cell = { x, y, w, h }
    x += w + PADDING
    shelf = Math.max(shelf, h)
  }
  return y + shelf + PADDING
}

/**
 * @param {Array} signs 招牌（含 text、style、vertical、width、height）
 * @returns {{ texture, rects: Map<string, [u0, v0, u1, v1]>, dispose }}
 */
export function createSignAtlas(signs) {
  const entries = new Map()
  for (const sign of signs) {
    const key = signKey(sign)
    const existing = entries.get(key)
    if (!existing || sign.width > existing.width) {
      entries.set(key, { key, text: sign.text, style: sign.style ?? 'wood', vertical: !!sign.vertical, width: sign.width, height: sign.height })
    }
  }
  const list = [...entries.values()]
  let pxPerMeter = 300
  let height = packCells(list, pxPerMeter)
  while (height > MAX_ATLAS_HEIGHT && pxPerMeter > 60) {
    pxPerMeter *= 0.85
    height = packCells(list, pxPerMeter)
  }
  const canvasHeight = Math.min(MAX_ATLAS_HEIGHT, Math.max(64, Math.ceil(height / 64) * 64))
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = canvasHeight
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.flipY = false

  const rects = new Map()
  for (const entry of list) {
    const { x, y, w, h } = entry.cell
    rects.set(entry.key, [x / ATLAS_WIDTH, y / canvasHeight, (x + w) / ATLAS_WIDTH, (y + h) / canvasHeight])
  }

  const draw = () => {
    g.clearRect(0, 0, ATLAS_WIDTH, canvasHeight)
    for (const entry of list) {
      const { x, y, w, h } = entry.cell
      g.save()
      g.translate(x, y)
      g.beginPath()
      g.rect(0, 0, w, h)
      g.clip()
      drawSign(g, w, h, entry.text, entry.style, entry.vertical)
      g.restore()
    }
    texture.needsUpdate = true
  }
  const allText = [...new Set(list.map((entry) => entry.text).join(''))].join('')
  const unregister = registerFontTexture(draw, `700 120px ${DISPLAY_FONT}`, allText || '茶')
  return {
    texture,
    rects,
    dispose: () => {
      unregister()
      texture.dispose()
    },
  }
}

/* ───────────── 單張招牌與燈籠貼圖 ───────────── */

const cache = new Map()

export function getSignTexture({ text, style = 'wood', vertical = false, width, height }) {
  const key = signKey({ text, style, vertical, width, height })
  if (cache.has(key)) return cache.get(key)
  const pxPerMeter = 320
  const cw = Math.max(64, Math.round(width * pxPerMeter))
  const ch = Math.max(64, Math.round(height * pxPerMeter))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  const draw = () => {
    drawSign(g, cw, ch, text, style, vertical)
    texture.needsUpdate = true
  }
  registerFontTexture(draw, `700 120px ${DISPLAY_FONT}`, text)
  cache.set(key, texture)
  return texture
}

/** 燈籠貼圖（球面 UV）：紅色燈籠、竹骨橫紋與前後各一個字 */
export function getLanternTexture(text) {
  const key = `lantern|${text}`
  if (cache.has(key)) return cache.get(key)
  const cw = 512
  const ch = 256
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  const draw = () => {
    const grad = g.createLinearGradient(0, 0, 0, ch)
    grad.addColorStop(0, '#8e3526')
    grad.addColorStop(0.5, '#c25a3f')
    grad.addColorStop(1, '#8e3526')
    g.fillStyle = grad
    g.fillRect(0, 0, cw, ch)
    g.strokeStyle = 'rgba(70,20,12,0.35)'
    g.lineWidth = 2
    for (let y = 18; y < ch; y += 22) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(cw, y)
      g.stroke()
    }
    g.font = `700 104px ${DISPLAY_FONT}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#211510'
    for (const u of [0.25, 0.75]) g.fillText(text, cw * u, ch / 2 + 4)
    texture.needsUpdate = true
  }
  registerFontTexture(draw, `700 104px ${DISPLAY_FONT}`, text)
  cache.set(key, texture)
  return texture
}
