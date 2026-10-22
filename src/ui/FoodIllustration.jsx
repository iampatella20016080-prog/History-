/**
 * 食物圖鑑插圖（手繪風格的向量圖，深褐色描邊）。
 * 新增食物時，在 ILLUSTRATIONS 加入對應 id 的插圖即可；沒有插圖時顯示通用的竹篩圖。
 */
const INK = '#3a2a1f'

function Shadow({ cx = 100, cy = 124, rx = 70 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={7} fill={INK} opacity={0.1} />
}

function Shiitake() {
  const gills = [
    'M-36 -2 L-11 -1', 'M-33 -9 L-10 -3', 'M-24 -14 L-7 -4', 'M-12 -16 L-3 -5', 'M2 -16 L1 -5',
    'M15 -15 L6 -4', 'M26 -12 L9 -3', 'M35 -6 L11 -1', 'M35 4 L11 1', 'M26 11 L9 3',
    'M14 15 L6 4', 'M0 16 L0 5', 'M-14 15 L-6 4', 'M-26 11 L-9 3', 'M-35 4 L-11 1',
  ]
  return (
    <>
      <Shadow />
      <g transform="translate(134 86) rotate(16)">
        <ellipse rx="40" ry="17" fill="#e6cfa4" stroke={INK} strokeWidth="2" />
        <path d={gills.join(' ')} stroke="#9c7b55" strokeWidth="1.2" fill="none" />
        <ellipse rx="9" ry="4.5" fill="#cfb185" stroke={INK} strokeWidth="1.5" />
      </g>
      <path d="M74 97 L71 113 Q84 119 97 113 L94 97" fill="#e8d3ab" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 93 Q42 52 82 48 Q123 46 129 87 Q118 99 84 99 Q49 99 38 93 Z" fill="#7b4f33" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M50 86 Q56 62 84 57" fill="none" stroke="#a87650" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      <path
        d="M60 67 l9 5 l-3 7 M80 56 l2 9 l8 3 M101 60 l-4 8 l6 6 M70 84 l10 -3 l5 6 M110 79 l-8 3 M92 88 l4 -5"
        stroke="#efdcbb"
        strokeWidth="2.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

function ShrimpShape({ x, y, r, s }) {
  const body = 'M0 -14 C14 -16 22 -4 18 8 C15 16 6 20 -2 18'
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={body} fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
      <path d={body} fill="none" stroke="#e18f61" strokeWidth="9.5" strokeLinecap="round" />
      <path d="M8 -12 l-2 6 M15 -6 l-5 3 M18 2 l-6 1 M15 10 l-5 -2 M8 15 l-3 -4" stroke="#a9583b" strokeWidth="1.4" fill="none" />
      <path d="M-2 18 l-9 -3 l3 7 z" fill="#d97c50" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="1" cy="-14" r="1.6" fill={INK} />
    </g>
  )
}

function DriedShrimp() {
  return (
    <>
      <Shadow />
      <ellipse cx="100" cy="100" rx="72" ry="22" fill="#efe4cc" stroke={INK} strokeWidth="2" />
      <ellipse cx="100" cy="97" rx="62" ry="16" fill="#e5d6b6" />
      <ShrimpShape x={62} y={84} r={-20} s={1.05} />
      <ShrimpShape x={96} y={74} r={30} s={1.15} />
      <ShrimpShape x={132} y={88} r={-60} s={1} />
      <ShrimpShape x={84} y={102} r={95} s={0.9} />
      <ShrimpShape x={118} y={106} r={150} s={0.85} />
    </>
  )
}

function MulletRoe() {
  return (
    <>
      <Shadow />
      <path d="M28 82 Q26 56 64 50 Q122 41 152 58 Q169 69 153 84 Q121 100 70 98 Q32 96 28 82 Z" fill="#c8662f" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M46 72 Q80 56 132 60" stroke="#efa56a" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M62 90 Q100 94 142 79" stroke="#9b4a20" strokeWidth="2" fill="none" opacity="0.55" />
      <path d="M92 52 Q96 74 92 97" stroke="#9b4a20" strokeWidth="1.6" fill="none" opacity="0.5" />
      {[58, 96, 134].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={116 - (i % 2) * 3} rx="16" ry="7" fill="#d4793c" stroke={INK} strokeWidth="1.8" />
          <ellipse cx={cx - 1} cy={115 - (i % 2) * 3} rx="10" ry="3.6" fill="#eba467" opacity="0.75" />
        </g>
      ))}
    </>
  )
}

function DriedGoods() {
  return (
    <>
      <Shadow rx={76} />
      <defs>
        <clipPath id="sieve-inner">
          <ellipse cx="100" cy="90" rx="70" ry="25" />
        </clipPath>
      </defs>
      <ellipse cx="100" cy="94" rx="80" ry="31" fill="#d8bd86" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="100" cy="90" rx="70" ry="25" fill="#c9a96e" stroke="#9c7d4a" strokeWidth="1.2" />
      <g clipPath="url(#sieve-inner)" stroke="#a8874f" strokeWidth="1" opacity="0.6">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`a${i}`} x1={20 + i * 11} y1={60} x2={i * 11 - 10} y2={120} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`b${i}`} x1={i * 11 - 10} y1={60} x2={20 + i * 11} y2={120} />
        ))}
      </g>
      {/* 木耳 */}
      <path d="M50 86 q6 -12 17 -5 q9 -7 13 4 q-1 11 -15 9 q-13 4 -15 -8z" fill="#3b302a" stroke="#1e1712" strokeWidth="1.5" />
      <path d="M70 98 q5 -8 13 -3 q7 -4 9 4 q-2 8 -12 6 q-9 2 -10 -7z" fill="#463931" stroke="#1e1712" strokeWidth="1.4" />
      {/* 金針 */}
      {[
        [104, 70, 132, 78],
        [108, 80, 140, 84],
        [100, 88, 126, 98],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d8a947" strokeWidth="4.4" strokeLinecap="round" />
        </g>
      ))}
      {/* 干貝 */}
      {[
        [138, 96],
        [150, 86],
        [124, 104],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <path d={`M${cx - 7} ${cy} v5 a7 4 0 0 0 14 0 v-5`} fill="#b98a4f" stroke={INK} strokeWidth="1.5" />
          <ellipse cx={cx} cy={cy} rx="7" ry="4" fill="#d6a865" stroke={INK} strokeWidth="1.5" />
        </g>
      ))}
    </>
  )
}

/* ── 滋養豆餡舖：和菓子與糕餅 ─────────────── */

function Plate({ cx = 100, cy = 106, rx = 74, ry = 20, fill = '#f2ece0' }) {
  return (
    <>
      <ellipse cx={cx} cy={cy + 3} rx={rx} ry={ry} fill="#d9cdb6" stroke={INK} strokeWidth="2" />
      <ellipse cx={cx} cy={cy} rx={rx - 4} ry={ry - 4} fill={fill} stroke={INK} strokeWidth="1.4" />
    </>
  )
}

function StrawberryDaifuku() {
  // 切開的紅豆大福：露出的紅豆餡上放半粒草莓
  const seeds = [
    [-8, -6], [0, -9], [8, -5], [-10, 3], [-2, 0], [7, 4], [-4, 9], [4, 11],
  ]
  return (
    <>
      <Shadow />
      <Plate />
      {/* 後方一整顆大福 */}
      <path d="M38 96 Q36 66 62 62 Q88 60 90 92 Q78 102 60 102 Q44 102 38 96 Z" fill="#f8f4ec" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 76 Q55 67 66 67" stroke="#ffffff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      {/* 切開的大福 */}
      <path d="M92 104 Q90 74 122 70 Q156 68 160 100 Q146 112 124 112 Q100 112 92 104 Z" fill="#f8f4ec" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M100 100 Q102 82 124 80 Q148 80 152 98 Q140 106 124 106 Q106 106 100 100 Z" fill="#6b2d29" stroke={INK} strokeWidth="1.6" />
      {[[112, 92], [124, 88], [137, 93], [118, 99], [131, 100], [144, 96]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="3" ry="2" fill="#8d4339" opacity="0.8" />
      ))}
      {/* 半粒草莓 */}
      <g transform="translate(126 70)">
        <path d="M-16 4 Q-18 -18 0 -24 Q18 -18 16 4 Q8 10 0 10 Q-8 10 -16 4 Z" fill="#d93a3f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-9 -2 Q-6 -15 2 -18 Q8 -12 6 2 Q0 6 -9 -2 Z" fill="#f4a3a3" opacity="0.85" />
        {seeds.map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="1.2" ry="1.8" fill="#f6dc8a" />
        ))}
        <path d="M-12 -20 Q-4 -30 0 -24 Q4 -32 12 -20 Q4 -22 0 -19 Q-4 -22 -12 -20 Z" fill="#6f9a4f" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      {/* 手粉 */}
      {[[54, 84], [70, 76], [104, 96], [150, 92], [66, 94]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill="#ffffff" opacity="0.9" />
      ))}
    </>
  )
}

/** 花形米菓烤皮的輪廓（六瓣） */
function flowerPath(r = 34, petals = 6) {
  const parts = []
  for (let i = 0; i < petals; i++) {
    const a = (i * Math.PI * 2) / petals
    const mid = a + Math.PI / petals
    const next = a + (Math.PI * 2) / petals
    if (i === 0) parts.push(`M${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`)
    parts.push(
      `Q${(Math.cos(mid) * r * 1.32).toFixed(1)} ${(Math.sin(mid) * r * 1.32).toFixed(1)} ${(Math.cos(next) * r).toFixed(1)} ${(Math.sin(next) * r).toFixed(1)}`,
    )
  }
  return `${parts.join(' ')} Z`
}

const FLOWER = flowerPath()
const FLOWER_RAYS = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3
  return `M${(Math.cos(a) * 15).toFixed(1)} ${(Math.sin(a) * 15).toFixed(1)} L${(Math.cos(a) * 28).toFixed(1)} ${(Math.sin(a) * 28).toFixed(1)}`
}).join(' ')

function MonakaShell({ x, y }) {
  // 花形的米菓烤皮（壓出花紋），略為壓扁表現俯角
  return (
    <g transform={`translate(${x} ${y}) scale(1 0.55)`}>
      <path d={FLOWER} fill="#ecd29a" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <circle r="13" fill="none" stroke="#c9a462" strokeWidth="2.4" />
      <path d={FLOWER_RAYS} stroke="#c9a462" strokeWidth="2.2" />
    </g>
  )
}

function Monaka() {
  return (
    <>
      <Shadow />
      {/* 側面：兩片烤皮夾著紅豆餡 */}
      <g transform="translate(62 92)">
        <path d="M-30 -6 Q0 -16 30 -6 L30 2 Q0 -8 -30 2 Z" fill="#ecd29a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-30 2 Q0 -8 30 2 L28 10 Q0 2 -28 10 Z" fill="#5c2a26" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M-28 10 Q0 2 28 10 L30 18 Q0 10 -30 18 Z" fill="#e4c588" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <MonakaShell x={132} y={84} />
      <path d="M100 112 Q132 120 166 108" stroke={INK} strokeWidth="1.6" fill="none" opacity="0.35" />
    </>
  )
}

function Dorayaki() {
  return (
    <>
      <Shadow />
      <Plate fill="#efe8da" />
      {/* 下層餅皮、紅豆餡、上層餅皮 */}
      <ellipse cx="100" cy="98" rx="50" ry="15" fill="#e7b46b" stroke={INK} strokeWidth="2" />
      <path d="M52 92 Q100 108 148 92 L146 86 Q100 100 54 86 Z" fill="#5f2b27" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M54 86 Q50 60 100 56 Q150 60 146 86 Q100 100 54 86 Z" fill="#b5703a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M64 80 Q68 64 100 62 Q132 64 136 80" fill="none" stroke="#8f5426" strokeWidth="2" opacity="0.5" />
      <path d="M70 70 Q84 63 100 63" stroke="#d99a55" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M55 86 Q100 98 145 86" fill="none" stroke="#e8b46a" strokeWidth="3" opacity="0.8" />
    </>
  )
}

function Yokan() {
  return (
    <>
      <Shadow />
      {/* 木盤 */}
      <path d="M26 108 L150 108 L176 94 L52 94 Z" fill="#c69a68" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M26 108 L26 114 L150 114 L176 100 L176 94 L150 108 Z" fill="#a77c4f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      {/* 長條羊羹 */}
      <path d="M44 98 L44 74 L62 64 L136 64 L136 88 L118 98 Z" fill="#4a2321" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M44 74 L62 64 L136 64 L118 74 Z" fill="#6a3330" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M118 74 L118 98" stroke={INK} strokeWidth="1.6" />
      <path d="M58 70 L100 70" stroke="#a45f55" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {/* 切下的一片與竹籤 */}
      <path d="M140 100 L140 84 L150 78 L158 78 L158 94 L148 100 Z" fill="#4a2321" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M140 84 L150 78 L158 78 L148 84 Z" fill="#6a3330" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M150 74 L176 50" stroke="#e2c79a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M150 74 L176 50" stroke={INK} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </>
  )
}

function PineappleCake() {
  // 鳳梨夾心餅：兩片長方形酥餅夾著鳳梨餡（中間一層白巧克力）
  return (
    <>
      <Shadow />
      <g transform="translate(96 88)">
        <path d="M-54 6 L-54 20 L34 20 L58 8 L58 -6 L-30 -6 Z" fill="#e2b874" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-54 6 L-30 -6 L58 -6 L34 6 Z" fill="#edcb8c" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M-54 0 L-54 6 L34 6 L58 -6 L58 -12 L34 0 Z" fill="#f6eedd" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M-54 -10 L-54 0 L34 0 L58 -12 L58 -22 L34 -10 Z" fill="#e1a12f" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M-50 -6 L28 -6" stroke="#f5c95e" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
        <path d="M-54 -14 L-54 -10 L34 -10 L58 -22 L58 -26 L34 -14 Z" fill="#f6eedd" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-54 -14 L-54 -26 L34 -26 L58 -38 L58 -26 L34 -14 Z" fill="#e2b874" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-54 -26 L-30 -38 L58 -38 L34 -26 Z" fill="#efcf94" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {[[-30, -32], [-8, -32], [14, -32], [36, -32]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l6 -3 M${x + 2} ${y + 3} l6 -3`} stroke="#c8954e" strokeWidth="1.4" />
        ))}
      </g>
    </>
  )
}

/** 方形的葉片（墊在粿下面），中央一條葉脈 */
function Leaf({ points, vein }) {
  return (
    <>
      <path d={`M${points} Z`} fill="#77a04a" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d={vein} stroke="#557a32" strokeWidth="1.3" fill="none" />
    </>
  )
}

function CaoGuo() {
  // 草仔粿：墨綠色的扁圓粿墊著葉片；切開的一顆露出菜脯（鹹口味）的內餡
  const filling = [
    [126, 92], [134, 88], [143, 91], [150, 95], [131, 97], [140, 98], [148, 100], [123, 99],
  ]
  return (
    <>
      <Shadow />
      <Leaf points="20 104 L60 88 L104 101 L64 118" vein="M38 104 L86 101" />
      <Leaf points="96 106 L136 90 L180 103 L140 120" vein="M114 106 L162 103" />
      {/* 完整的一顆 */}
      <path d="M34 101 Q32 72 62 69 Q92 68 94 99 Q80 109 63 109 Q45 109 34 101 Z" fill="#3f5f2a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M45 85 Q51 75 64 74" stroke="#6d8f4c" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* 切開的一顆：外皮與內餡 */}
      <path d="M108 105 Q106 76 137 72 Q168 72 170 103 Q155 113 138 113 Q120 113 108 105 Z" fill="#3f5f2a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M116 101 Q118 84 138 82 Q160 82 162 100 Q151 107 138 107 Q125 107 116 101 Z" fill="#a8743f" stroke={INK} strokeWidth="1.5" />
      {filling.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="2.6" rx="0.8" fill={i % 3 === 0 ? '#6b4423' : '#e3c27a'} transform={`rotate(${i * 37} ${x + 2} ${y + 1.3})`} />
      ))}
    </>
  )
}

/** 六角形（紅龜粿的龜殼紋） */
function hexagon(cx, cy, r) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`
  })
  return `M${points.join(' L')} Z`
}

const SHELL = [hexagon(0, 0, 11), ...Array.from({ length: 6 }, (_, i) => hexagon(Math.cos((Math.PI / 3) * i + Math.PI / 6) * 19.5, Math.sin((Math.PI / 3) * i + Math.PI / 6) * 19.5, 9))]

function HongGui() {
  // 紅龜粿：用粿模印出龜殼紋的紅色粿，墊著葉片；後方是綠色的艾草龜粿
  return (
    <>
      <Shadow />
      {/* 後方的艾草龜粿 */}
      <g transform="translate(140 74)">
        <ellipse rx="38" ry="18" fill="#5f8f3e" stroke={INK} strokeWidth="2" />
        <g transform="scale(0.9 0.42)" fill="none" stroke="#45702a" strokeWidth="2.4">
          {SHELL.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
      <Leaf points="24 110 L76 90 L136 105 L84 125" vein="M48 110 L110 105" />
      {/* 紅龜粿：頭、四肢與龜殼 */}
      <g transform="translate(80 100)">
        <ellipse cx="-50" cy="-2" rx="9" ry="6" fill="#cf3840" stroke={INK} strokeWidth="1.8" />
        {[[-30, -16], [30, -16], [-30, 14], [30, 14]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="4.5" fill="#c3313a" stroke={INK} strokeWidth="1.6" />
        ))}
        <ellipse rx="46" ry="21" fill="#d6404a" stroke={INK} strokeWidth="2.2" />
        <g transform="scale(1.05 0.46)" fill="none" stroke="#a8262f" strokeWidth="2.6">
          {SHELL.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path d="M-30 -10 Q-12 -18 8 -17" stroke="#f08a8f" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    </>
  )
}

function LuoboGao() {
  // 蘿蔔糕（菜頭粿）：米白色的長方塊，切面看得到蘿蔔絲與蝦米；前面兩片煎得金黃
  const shreds = [
    [50, 76, 8], [62, 82, -6], [74, 74, 4], [86, 84, 10], [56, 88, 2], [92, 76, -8], [68, 90, 6], [80, 80, -3],
  ]
  return (
    <>
      <Shadow />
      <Plate />
      {/* 整塊 */}
      <path d="M38 94 L38 66 L58 56 L124 56 L124 84 L104 94 Z" fill="#efe5cf" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M38 66 L58 56 L124 56 L104 66 Z" fill="#f8f1e0" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M104 66 L104 94" stroke={INK} strokeWidth="1.6" />
      {shreds.map(([x, y, a], i) => (
        <path key={i} d={`M${x} ${y} l9 ${a / 3}`} stroke="#d6c59b" strokeWidth="1.8" strokeLinecap="round" />
      ))}
      {[[60, 72], [90, 88], [72, 86]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#e08a6a" stroke={INK} strokeWidth="0.6" />
      ))}
      {/* 煎好的兩片 */}
      <path d="M112 112 L112 104 L128 96 L168 96 L168 104 L152 112 Z" fill="#c98f3f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M112 104 L128 96 L168 96 L152 104 Z" fill="#e2b061" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M118 100 L120 99 M130 98 L134 97 M142 101 L146 100 M154 98 L158 97" stroke="#b8792f" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 98 L120 90 L136 82 L172 82 L172 90 L156 98 Z" fill="#cf9645" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M120 90 L136 82 L172 82 L156 90 Z" fill="#ebbd6c" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M134 87 Q148 84 160 85" stroke="#f6d896" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.8" />
    </>
  )
}

function YuGuoQiao() {
  // 芋粿巧（芋粿曲）：灰紫色、彎成弧形的長條，帶著芋頭丁、紅蔥頭與蝦米
  const dice = [
    [60, 82], [74, 70], [92, 63], [112, 63], [130, 70], [146, 82], [70, 100], [86, 89], [104, 85], [122, 89], [138, 100],
  ]
  return (
    <>
      <Shadow />
      <Plate fill="#efe8da" />
      {/* 後面一條、前面一條 */}
      <path d="M42 96 Q54 52 104 50 Q154 52 166 96 L150 100 Q142 66 104 64 Q66 66 58 100 Z" fill="#a597b0" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M54 112 Q64 74 104 72 Q144 74 154 112 L138 114 Q132 88 104 86 Q76 88 70 114 Z" fill="#9585a3" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M62 86 Q74 60 100 56" stroke="#c4b8cf" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
      {dice.map(([x, y], i) => (
        <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" rx="1" fill={i % 2 ? '#d9cfe2' : '#6f5f80'} stroke={INK} strokeWidth="0.5" transform={`rotate(${i * 23} ${x} ${y})`} />
      ))}
      {[[82, 66], [126, 66], [96, 92], [116, 94]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.9" fill="#e08a6a" stroke={INK} strokeWidth="0.5" />
      ))}
    </>
  )
}

/* ── 豆花與配料（導演的豆花店） ─────────── */

/** 側面看的碗：碗身與碗口（碗口裡的內容由 children 畫在碗口的橢圓裡） */
function Bowl({ cx = 100, rimY = 70, rx = 62, depth = 44, fill = '#f7f5ee', pattern = null, children }) {
  const bottom = rimY + depth
  const foot = rx * 0.42
  return (
    <>
      <path
        d={`M${cx - rx} ${rimY} Q${cx - rx + 6} ${bottom - 6} ${cx - foot} ${bottom} L${cx + foot} ${bottom} Q${cx + rx - 6} ${bottom - 6} ${cx + rx} ${rimY} Z`}
        fill={fill}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {pattern}
      <rect x={cx - foot + 4} y={bottom} width={(foot - 4) * 2} height="5" rx="2" fill="#e4e0d4" stroke={INK} strokeWidth="1.6" />
      <ellipse cx={cx} cy={rimY} rx={rx} ry={rx * 0.26} fill="#e9e5da" stroke={INK} strokeWidth="2.2" />
      {children}
    </>
  )
}

/** 藍白花紋（碗身與碟子的青花） */
function BlueRim({ cx, y, rx, count = 9 }) {
  return Array.from({ length: count }, (_, i) => {
    const x = cx - rx + 10 + (i * (rx * 2 - 20)) / (count - 1)
    return <circle key={i} cx={x} cy={y} r="3.2" fill="none" stroke="#2c5d9c" strokeWidth="1.6" />
  })
}

function Douhua() {
  // 傳統豆花：白碗裡琥珀色的麥芽糖水，上面是用大湯杓舀起的一大片白豆花
  return (
    <>
      <Shadow cy={126} rx={66} />
      <Bowl rimY={66} depth={50}>
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#d2913a" stroke={INK} strokeWidth="1.4" />
        <path d="M58 70 Q60 50 92 46 Q126 44 138 62 Q120 74 96 75 Q72 76 58 70 Z" fill="#fbfaf4" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M100 62 Q112 48 134 52 Q148 58 146 68 Q130 74 112 72 Q102 70 100 62 Z" fill="#f4f0e4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M70 58 Q80 51 94 50" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </Bowl>
      {/* 木湯匙 */}
      <path d="M150 40 L180 18" stroke="#b48a58" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="146" cy="44" rx="9" ry="5" transform="rotate(-36 146 44)" fill="#c99d68" stroke={INK} strokeWidth="1.6" />
    </>
  )
}

function MaltoseSyrup() {
  // 麥芽糖水：玻璃罐裡金黃有黏性的麥芽糖，用竹籤挑起；旁邊一小碗煮好的糖水
  return (
    <>
      <Shadow cy={126} rx={72} />
      {/* 玻璃罐 */}
      <path d="M36 52 L36 116 Q36 122 44 122 L92 122 Q100 122 100 116 L100 52 Z" fill="#eaf1f2" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 76 L40 114 Q40 118 46 118 L90 118 Q96 118 96 114 L96 76 Q68 82 40 76 Z" fill="#e3a43c" stroke={INK} strokeWidth="1.4" />
      <path d="M46 84 L46 110" stroke="#f6d27c" strokeWidth="4" strokeLinecap="round" />
      <rect x="32" y="44" width="72" height="10" rx="3" fill="#a8763f" stroke={INK} strokeWidth="1.8" />
      {/* 竹籤挑起的麥芽糖 */}
      <path d="M70 80 Q72 40 82 18" stroke="#c9a46a" strokeWidth="4" strokeLinecap="round" />
      <path d="M73 52 Q66 42 74 30 Q82 36 76 52 Z" fill="#e8a935" stroke={INK} strokeWidth="1.4" opacity="0.95" />
      <path d="M72 54 Q70 66 72 78" stroke="#e8a935" strokeWidth="3" fill="none" />
      {/* 一小碗糖水 */}
      <Bowl cx={146} rimY={86} rx={38} depth={30}>
        <ellipse cx="146" cy="87" rx="33" ry="7.5" fill="#b8692a" stroke={INK} strokeWidth="1.2" />
        <path d="M128 86 Q140 83 152 84" stroke="#e7a65a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </Bowl>
    </>
  )
}

function SweetPotatoBalls() {
  // 地瓜粉圓：藍白花碗裡，一顆顆橘色（紅地瓜）與紫色（紫地瓜）的小圓粒
  const balls = []
  for (let row = 0; row < 4; row++) {
    const n = 9 - row
    for (let i = 0; i < n; i++) {
      const x = 100 - (n - 1) * 6.4 + i * 12.8 + (row % 2) * 3
      const y = 70 - row * 6.5
      balls.push([x, y, (i + row * 2) % 3 === 0])
    }
  }
  return (
    <>
      <Shadow cy={126} rx={66} />
      <Bowl rimY={72} depth={42} pattern={<BlueRim cx={100} y={88} rx={56} />}>
        <ellipse cx="100" cy="73" rx="56" ry="12" fill="#c98a3c" stroke={INK} strokeWidth="1.2" />
        {balls.map(([x, y, purple], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6.2" fill={purple ? '#6f4a97' : '#ec8a2e'} stroke={INK} strokeWidth="1.3" />
            <circle cx={x - 1.8} cy={y - 2} r="1.6" fill="#ffffff" opacity="0.6" />
          </g>
        ))}
      </Bowl>
    </>
  )
}

function FenGuo() {
  // 粉粿：青花碟子上，山梔子的橘黃色與黑糖色的半透明方塊交錯疊放
  const cubes = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) cubes.push([62 + c * 26 + r * 6, 54 + r * 14, (r + c) % 2 === 1])
  }
  return (
    <>
      <Shadow cy={124} rx={78} />
      <ellipse cx="100" cy="98" rx="80" ry="24" fill="#f2f4f6" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="100" cy="96" rx="66" ry="17" fill="none" stroke="#2c5d9c" strokeWidth="2" strokeDasharray="5 4" />
      <BlueRim cx={100} y={114} rx={68} count={11} />
      {cubes.map(([x, y, dark], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 10 L10 4 L32 4 L22 10 Z" fill={dark ? '#7a4026' : '#f4b54a'} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M0 10 L22 10 L22 30 L0 30 Z" fill={dark ? '#5b2f1e' : '#e99a2c'} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" opacity="0.95" />
          <path d="M22 10 L32 4 L32 24 L22 30 Z" fill={dark ? '#4a2416' : '#cf7f22'} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M4 14 L4 24" stroke={dark ? '#8a5638' : '#ffd88a'} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </>
  )
}

function RedGreenBeans() {
  // 紅豆與綠豆：兩小碗煮到鬆軟的豆子（紅豆粒大、綠豆粒小）
  const pile = (cx, cy, rx, size, tints, seed) =>
    Array.from({ length: 26 }, (_, i) => {
      const a = (i * 2.4 + seed) % (Math.PI * 2)
      const r = ((i * 7) % 13) / 13
      const x = cx + Math.cos(a) * r * rx
      const y = cy + Math.sin(a) * r * rx * 0.3 - (1 - r) * 6
      return <ellipse key={i} cx={x} cy={y} rx={size * 1.35} ry={size} transform={`rotate(${(i * 41) % 180} ${x} ${y})`} fill={tints[i % 2]} stroke={INK} strokeWidth="0.9" />
    })
  return (
    <>
      <Shadow cy={126} rx={84} />
      <Bowl cx={58} rimY={80} rx={42} depth={34}>
        <ellipse cx="58" cy="81" rx="37" ry="9" fill="#5a1d22" stroke={INK} strokeWidth="1.2" />
        {pile(58, 78, 30, 4.2, ['#7d262c', '#943538'], 0.3)}
      </Bowl>
      <Bowl cx={142} rimY={80} rx={42} depth={34}>
        <ellipse cx="142" cy="81" rx="37" ry="9" fill="#6e6a33" stroke={INK} strokeWidth="1.2" />
        {pile(142, 78, 30, 3.2, ['#8a8740', '#a19d52'], 1.1)}
      </Bowl>
    </>
  )
}

/* ── 爐鍋咖啡：咖啡豆與幾種萃取方式 ── */

/** 一顆咖啡豆（中間一道彎曲的溝） */
function Bean({ x, y, r = 0, s = 1, fill = '#6b3e24' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="9" ry="12.5" fill={fill} stroke={INK} strokeWidth="1.6" />
      <path d="M0 -10 Q-4 -3 0 0 Q4 4 0 10" stroke="#2a170d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M-4 -7 Q-6 -2 -5 3" stroke="#a8724a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  )
}

function CoffeeBeans() {
  // 咖啡豆：一小堆烘焙過的深褐色咖啡豆，旁邊一枝帶著紅色果實的咖啡枝
  const beans = [
    [70, 104, -20],
    [92, 108, 15],
    [114, 104, -35],
    [136, 108, 25],
    [80, 88, 40],
    [104, 90, -10],
    [126, 88, 30],
    [92, 72, -25],
    [116, 74, 10],
    [104, 58, 35],
  ]
  return (
    <>
      <Shadow cy={124} rx={66} />
      {beans.map(([x, y, r], i) => (
        <Bean key={i} x={x} y={y} r={r} fill={i % 3 === 0 ? '#5a321c' : '#6b3e24'} />
      ))}
      <path d="M150 112 Q160 80 178 62" stroke="#5d7a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M162 84 Q176 78 182 86 Q172 94 162 84 Z" fill="#7aa04a" stroke={INK} strokeWidth="1.4" />
      <circle cx="156" cy="96" r="5" fill="#c8342c" stroke={INK} strokeWidth="1.4" />
      <circle cx="166" cy="92" r="5" fill="#d8503a" stroke={INK} strokeWidth="1.4" />
    </>
  )
}

function PourOver() {
  // 手沖咖啡：細口壺把熱水倒進濾杯，咖啡滴進下方的玻璃分享壺
  return (
    <>
      <Shadow cy={126} rx={70} />
      <path d="M62 82 L66 120 Q90 126 114 120 L118 82 Z" fill="#e8f0f2" stroke={INK} strokeWidth="2" strokeLinejoin="round" opacity="0.95" />
      <path d="M67 100 L69 118 Q90 123 111 118 L113 100 Q90 104 67 100 Z" fill="#6b3e24" stroke={INK} strokeWidth="1.4" />
      <path d="M118 88 Q130 90 126 104 Q124 112 116 112" stroke={INK} strokeWidth="2" fill="none" />
      <path d="M58 78 L122 78 L108 52 L72 52 Z" fill="#f4f1ea" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M74 56 L106 56" stroke="#d6cfbf" strokeWidth="2" />
      <ellipse cx="90" cy="53" rx="18" ry="4" fill="#5a321c" stroke={INK} strokeWidth="1.4" />
      <path d="M90 80 L90 98" stroke="#5a321c" strokeWidth="2.4" strokeDasharray="3 4" />
      {/* 細口壺 */}
      <path d="M140 46 Q140 26 160 26 Q178 26 178 46 L176 66 L142 66 Z" fill="#2b2b2b" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M142 54 Q120 50 108 36" stroke="#2b2b2b" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M178 36 Q192 40 186 56" stroke={INK} strokeWidth="2.4" fill="none" />
      <path d="M106 38 Q100 44 98 50" stroke="#9fd3e6" strokeWidth="2" fill="none" />
    </>
  )
}

function Espresso() {
  // 義式濃縮：白色小杯裡帶著一層金棕色泡沫（crema）的濃縮咖啡，放在碟子上
  return (
    <>
      <Shadow cy={124} rx={62} />
      <ellipse cx="100" cy="112" rx="58" ry="12" fill="#f4f1ea" stroke={INK} strokeWidth="2" />
      <ellipse cx="100" cy="110" rx="40" ry="7" fill="#e4dfd2" />
      <path d="M68 62 Q70 104 100 108 Q130 104 132 62 Z" fill="#fbfaf6" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M132 70 Q152 70 150 86 Q148 98 128 94" stroke={INK} strokeWidth="2.2" fill="none" />
      <ellipse cx="100" cy="62" rx="32" ry="9" fill="#5a321c" stroke={INK} strokeWidth="2" />
      <ellipse cx="100" cy="62" rx="26" ry="6.5" fill="#c08a4a" />
      <path d="M86 61 Q96 57 110 62" stroke="#e2b77a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M90 44 Q86 36 92 28 M106 44 Q102 34 110 26" stroke="#c9c2b4" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )
}

function ColdDrip() {
  // 冰滴咖啡：木架上方裝冰水的玻璃瓶，一滴一滴落進咖啡粉，再經過螺旋管滴進下方的玻璃壺
  return (
    <>
      <Shadow cy={128} rx={52} />
      <path d="M62 14 L62 126 M138 14 L138 126" stroke="#5d3b27" strokeWidth="6" strokeLinecap="round" />
      <path d="M56 16 L144 16 M56 60 L144 60 M56 94 L144 94" stroke="#5d3b27" strokeWidth="5" strokeLinecap="round" />
      <path d="M84 20 L116 20 L114 50 Q100 56 86 50 Z" fill="#e8f0f2" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M86 36 L114 36 L114 50 Q100 56 86 50 Z" fill="#b8dce8" opacity="0.8" />
      <path d="M100 54 L100 62" stroke="#9fd3e6" strokeWidth="2" strokeDasharray="2 3" />
      <rect x="88" y="64" width="24" height="22" rx="3" fill="#5a321c" stroke={INK} strokeWidth="1.8" />
      <path d="M92 98 Q108 101 92 104 Q108 107 92 110" stroke="#9aaeb2" strokeWidth="2" fill="none" />
      <path d="M84 112 L116 112 L118 124 Q100 128 82 124 Z" fill="#e8f0f2" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M84 118 L116 118 L117 124 Q100 127 83 124 Z" fill="#6b3e24" />
    </>
  )
}

function ColdBrew() {
  // 冷萃咖啡：玻璃瓶裡浸泡著濾袋，旁邊一杯加了冰塊的冷萃
  return (
    <>
      <Shadow cy={126} rx={70} />
      <path d="M50 46 L50 116 Q50 122 56 122 L94 122 Q100 122 100 116 L100 46 Z" fill="#e8f0f2" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M52 62 L98 62 L98 116 Q98 120 94 120 L56 120 Q52 120 52 116 Z" fill="#4a2a18" />
      <rect x="46" y="34" width="58" height="12" rx="3" fill="#b8bcbb" stroke={INK} strokeWidth="1.8" />
      <path d="M66 48 L66 70 Q75 84 84 70 L84 48" fill="#e9dcc4" stroke={INK} strokeWidth="1.6" opacity="0.9" />
      <path d="M75 46 L75 30" stroke="#b8bcbb" strokeWidth="2" />
      <path d="M120 70 L124 120 Q140 124 156 120 L160 70 Z" fill="#eef4f6" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M121 82 L159 82 L156 118 Q140 121 124 118 Z" fill="#6b3e24" />
      <rect x="128" y="76" width="12" height="12" rx="2" fill="#dff2f8" stroke={INK} strokeWidth="1.2" transform="rotate(-12 134 82)" />
      <rect x="142" y="80" width="11" height="11" rx="2" fill="#dff2f8" stroke={INK} strokeWidth="1.2" transform="rotate(14 147 85)" />
      <path d="M150 50 L144 104" stroke="#c8342c" strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

/* ── 魷魚羹飲食文化（廟口的魷魚羹攤、老潘魷魚羹） ── */

/** 捲起的魷魚片（白色、邊緣帶粉紅） */
function SquidCurl({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-11 2 Q-12 -9 0 -9 Q11 -9 11 1" fill="none" stroke={INK} strokeWidth="8.5" strokeLinecap="round" />
      <path d="M-11 2 Q-12 -9 0 -9 Q11 -9 11 1" fill="none" stroke="#f6ebe0" strokeWidth="6" strokeLinecap="round" />
      <path d="M-8 -5 l3 2 M-2 -8 l1 3 M5 -7 l-1 3" stroke="#d99f88" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  )
}

function SoupLeaves({ points }) {
  return points.map(([x, y, r], i) => (
    <ellipse key={i} cx={x} cy={y} rx="6.5" ry="3" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? '#4f8a3a' : '#6a9e48'} stroke={INK} strokeWidth="1.1" />
  ))
}

function SteamLines({ x = 100, y = 30 }) {
  return (
    <path
      d={`M${x - 18} ${y + 10} q-6 -10 0 -18 q6 -8 0 -16 M${x} ${y + 6} q-6 -10 0 -18 q6 -8 0 -16 M${x + 18} ${y + 10} q-6 -10 0 -18`}
      fill="none"
      stroke="#b9ab98"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
  )
}

function SquidGeng() {
  // 廟口的魷魚羹：藍邊白瓷碗、褐色的羹湯、捲起的魷魚片、魚漿塊與少量葉菜
  return (
    <>
      <Shadow cy={126} rx={66} />
      <SteamLines />
      <Bowl rimY={66} depth={50} pattern={<BlueRim cx={100} y={92} rx={52} count={8} />}>
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#8d5c33" stroke={INK} strokeWidth="1.4" />
        <ellipse cx="86" cy="66" rx="9" ry="4" fill="#eadfc9" stroke={INK} strokeWidth="1.2" />
        <ellipse cx="121" cy="70" rx="8" ry="3.6" fill="#e6dac2" stroke={INK} strokeWidth="1.2" />
        <SquidCurl x={70} y={68} r={-12} s={0.9} />
        <SquidCurl x={102} y={64} r={8} s={1} />
        <SquidCurl x={130} y={66} r={20} s={0.85} />
        <SoupLeaves points={[[110, 70, -20], [92, 72, 30], [118, 62, 60]]} />
      </Bowl>
    </>
  )
}

function DriedSquid() {
  // 乾魷魚：剖開曬乾的扁平魷魚身與觸手
  return (
    <>
      <Shadow cy={124} rx={74} />
      <path d="M40 70 Q44 40 92 36 Q140 34 150 62 Q152 84 118 94 Q88 102 60 96 Q38 90 40 70 Z" fill="#d7a265" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M52 70 Q60 50 94 46 Q130 44 140 64" fill="none" stroke="#ecc590" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M95 44 Q97 70 94 96" fill="none" stroke="#a9733e" strokeWidth="1.6" opacity="0.6" />
      {[[58, 98, 112], [70, 99, 120], [84, 100, 118], [100, 99, 122], [114, 97, 116], [128, 93, 110]].map(([x, y, y2], i) => (
        <path key={i} d={`M${x} ${y} Q${x - 6 + (i % 3) * 5} ${(y + y2) / 2 + 4} ${x - 10 + i * 3} ${y2}`} fill="none" stroke="#c08a4f" strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d="M40 70 Q30 64 28 52 Q38 56 44 62" fill="#c99556" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  )
}

function ShachaSquidGeng() {
  // 沙茶魷魚羹：厚實的白碗、深褐色的羹湯與紅褐色的沙茶油光、魷魚片與葉菜
  return (
    <>
      <Shadow cy={126} rx={66} />
      <SteamLines />
      <Bowl rimY={66} depth={50}>
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#7a4a26" stroke={INK} strokeWidth="1.4" />
        {[[78, 70, 5], [96, 66, 3.5], [124, 69, 4.5], [112, 73, 3]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill="#a9582a" />
        ))}
        <SquidCurl x={74} y={66} r={-20} s={0.95} />
        <SquidCurl x={104} y={64} r={10} s={1.05} />
        <SquidCurl x={130} y={68} r={30} s={0.85} />
        <SquidCurl x={90} y={72} r={170} s={0.75} />
        <SoupLeaves points={[[116, 62, 50], [84, 62, -30]]} />
      </Bowl>
    </>
  )
}

function FishCrispGeng() {
  // 魚酥羹：不規則的金黃魚酥片，一部分露出湯面
  const crisps = [
    'M66 66 l14 -10 l10 4 l-6 12 z',
    'M88 60 l16 -8 l8 8 l-12 8 z',
    'M112 64 l12 -12 l12 6 l-8 12 z',
    'M80 74 l12 -4 l6 6 l-14 4 z',
    'M120 74 l10 -6 l8 4 l-10 6 z',
  ]
  return (
    <>
      <Shadow cy={126} rx={66} />
      <SteamLines />
      <Bowl rimY={66} depth={50}>
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#9a6a3a" stroke={INK} strokeWidth="1.4" />
        {crisps.map((d, i) => (
          <path key={i} d={d} fill={i % 2 ? '#c98d38' : '#e3b25a'} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        ))}
        <SoupLeaves points={[[102, 72, 10], [72, 72, -20]]} />
      </Bowl>
    </>
  )
}

function Tempura() {
  // 甜不辣：盤裡不同形狀的魚漿製品、白蘿蔔塊與紅褐色的醬汁
  return (
    <>
      <Shadow cy={124} rx={74} />
      <Plate cy={100} />
      <ellipse cx="100" cy="98" rx="50" ry="11" fill="#b5532f" opacity="0.85" />
      <rect x="56" y="80" width="34" height="12" rx="3" transform="rotate(-10 73 86)" fill="#d8ae74" stroke={INK} strokeWidth="1.6" />
      <rect x="104" y="84" width="34" height="11" rx="3" transform="rotate(12 121 89)" fill="#cf9f63" stroke={INK} strokeWidth="1.6" />
      <g transform="rotate(-25 92 72)">
        <rect x="76" y="66" width="32" height="12" rx="6" fill="#e0bb83" stroke={INK} strokeWidth="1.6" />
        <ellipse cx="108" cy="72" rx="3" ry="6" fill="#9c6a3c" stroke={INK} strokeWidth="1.2" />
      </g>
      <ellipse cx="124" cy="76" rx="11" ry="6" fill="#d8ae74" stroke={INK} strokeWidth="1.6" />
      <path d="M92 94 l14 -2 l-6 -12 z" fill="#cf9f63" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {[[66, 98], [138, 98], [110, 104]].map(([x, y], i) => (
        <rect key={i} x={x - 6} y={y - 7} width="12" height="11" rx="1.5" fill="#efe7d0" stroke={INK} strokeWidth="1.4" />
      ))}
      <path d="M62 84 Q80 76 96 82 Q112 86 128 78" fill="none" stroke="#8f3a24" strokeWidth="3.4" strokeLinecap="round" />
    </>
  )
}

function DryShachaSquid() {
  // 乾拌沙茶生魷魚：盤裡的魷魚片、豆芽、深色的沙茶醬與綠色葉片
  const sprouts = [
    [64, 92, 84, 88], [70, 98, 92, 96], [108, 98, 132, 94], [116, 92, 138, 90], [84, 100, 104, 102], [126, 100, 140, 98],
  ]
  return (
    <>
      <Shadow cy={124} rx={74} />
      <Plate cy={100} />
      {sprouts.map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - 4} ${x2} ${y2}`} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - 4} ${x2} ${y2}`} fill="none" stroke="#f3eed8" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={x2} cy={y2} r="2.6" fill="#e8d77a" stroke={INK} strokeWidth="1" />
        </g>
      ))}
      <SquidCurl x={82} y={86} r={-15} s={1.05} />
      <SquidCurl x={112} y={84} r={18} s={1.1} />
      <SquidCurl x={98} y={94} r={185} s={0.9} />
      {[[92, 80, 9], [120, 92, 7], [76, 96, 6]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill={i % 2 ? '#5a3820' : '#4a2e1a'} stroke={INK} strokeWidth="1.2" />
      ))}
      <SoupLeaves points={[[100, 78, -10], [108, 76, 40], [92, 76, 70]]} />
    </>
  )
}

/** 米苔目：短而粗、兩端略尖的白色米條 */
function MiTaiMuStrand({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-11 0 Q-6 -3.4 0 -3.4 Q6 -3.4 11 0 Q6 3.4 0 3.4 Q-6 3.4 -11 0 Z" fill="#f3eee2" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M-5 -1.2 Q0 -2 5 -1.2" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
    </g>
  )
}

/** 撒在湯上的韭菜段與油蔥酥 */
function ChivesAndShallots({ chives, shallots }) {
  return (
    <>
      {chives.map(([x, y, r], i) => (
        <rect key={`c${i}`} x={x - 3.5} y={y - 1.6} width="7" height="3.2" rx="1.2" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? '#4f8a3a' : '#6a9e48'} stroke={INK} strokeWidth="0.9" />
      ))}
      {shallots.map(([x, y], i) => (
        <path key={`s${i}`} d={`M${x - 2.6} ${y} l2.4 -2.2 l2.8 1.4 l-1.6 2.4 z`} fill={i % 2 ? '#9a6532' : '#b07a3e'} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      ))}
    </>
  )
}

function MiTaiMuSoup() {
  // 湯米苔目：淡琥珀色的大骨湯、浮在湯面的白色米條、韭菜與油蔥酥
  const strands = [
    [72, 66, -14, 1], [92, 62, 8, 1.05], [114, 64, -6, 0.95], [132, 68, 18, 0.9], [84, 72, 24, 0.9], [106, 72, -20, 1], [124, 74, 4, 0.85], [64, 72, 30, 0.8], [98, 66, 40, 0.85],
  ]
  return (
    <>
      <Shadow cy={126} rx={66} />
      <SteamLines />
      <Bowl rimY={66} depth={50} fill="#2f2a27">
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#d9b98a" stroke={INK} strokeWidth="1.4" />
        <ellipse cx="80" cy="66" rx="7" ry="2.4" fill="#ecd09a" opacity="0.9" />
        {strands.map(([x, y, r, s], i) => (
          <MiTaiMuStrand key={i} x={x} y={y} r={r} s={s} />
        ))}
        <ChivesAndShallots chives={[[90, 68, 20], [118, 66, -30], [102, 74, 60], [76, 70, -10], [128, 72, 40]]} shallots={[[86, 64], [110, 70], [122, 64], [96, 76], [70, 68]]} />
      </Bowl>
    </>
  )
}

function TempleMiTaiMu() {
  // 廟口攤位的湯米苔目：藍邊白瓷碗
  const strands = [[72, 66, -10, 1], [94, 62, 12, 1], [116, 64, -8, 0.95], [132, 70, 20, 0.85], [86, 72, 28, 0.9], [108, 73, -18, 0.95], [64, 72, 34, 0.8]]
  return (
    <>
      <Shadow cy={126} rx={66} />
      <SteamLines />
      <Bowl rimY={66} depth={50} pattern={<BlueRim cx={100} y={92} rx={52} count={8} />}>
        <ellipse cx="100" cy="68" rx="56" ry="13" fill="#d9b98a" stroke={INK} strokeWidth="1.4" />
        {strands.map(([x, y, r, s], i) => (
          <MiTaiMuStrand key={i} x={x} y={y} r={r} s={s} />
        ))}
        <ChivesAndShallots chives={[[90, 68, 20], [120, 66, -30], [102, 74, 60]]} shallots={[[84, 64], [112, 70], [126, 64]]} />
      </Bowl>
    </>
  )
}

function SideDishes() {
  // 兩碟簡單的小菜（示意）：油豆腐與燙青菜
  return (
    <>
      <Shadow cy={124} rx={80} />
      <Plate cx={64} cy={98} rx={42} ry={14} />
      <Plate cx={138} cy={102} rx={42} ry={14} />
      {[[52, 90], [68, 86], [76, 94], [58, 98]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 8} y={y - 8} width="16" height="13" rx="2.5" fill={i % 2 ? '#c98a3c' : '#d39648'} stroke={INK} strokeWidth="1.5" />
          {i % 2 === 0 && <rect x={x - 6} y={y - 7} width="12" height="4" rx="1.5" fill="#f1e7cf" stroke={INK} strokeWidth="0.9" />}
        </g>
      ))}
      {[[124, 96, -20], [136, 92, 10], [148, 98, 35], [132, 102, -40], [146, 104, 5], [140, 98, 70]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="11" ry="4.4" transform={`rotate(${r} ${x} ${y})`} fill={['#3f7a33', '#4f8a3a', '#5c9a45'][i % 3]} stroke={INK} strokeWidth="1.2" />
      ))}
      <path d="M126 94 Q138 90 150 96" fill="none" stroke="#5a3420" strokeWidth="2.6" strokeLinecap="round" />
    </>
  )
}

function PorkCheek() {
  // 嘴邊肉：淺盤上的薄片（粉褐色、外緣較深）、薑絲與醬油膏
  const slices = [[70, 92, -18], [88, 86, -6], [106, 86, 8], [124, 92, 20], [96, 98, -2], [80, 100, 14], [114, 100, -12]]
  return (
    <>
      <Shadow cy={124} rx={74} />
      <Plate cy={100} />
      {slices.map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="15" ry="7" fill={['#d9a58e', '#cf9a82', '#e0b09a'][i % 3]} stroke={INK} strokeWidth="1.5" />
          <path d={`M${x - 12} ${y - 2} Q${x} ${y - 6} ${x + 12} ${y - 2}`} fill="none" stroke="#a86a52" strokeWidth="1.6" />
        </g>
      ))}
      {[[90, 84, 30], [100, 82, -20], [110, 88, 50], [94, 92, -40], [104, 94, 15]].map(([x, y, r], i) => (
        <rect key={i} x={x - 6} y={y - 0.9} width="12" height="1.8" rx="0.9" transform={`rotate(${r} ${x} ${y})`} fill="#e8cf7a" stroke={INK} strokeWidth="0.6" />
      ))}
      <path d="M82 94 Q98 88 116 94" fill="none" stroke="#5a3420" strokeWidth="2.6" strokeLinecap="round" />
    </>
  )
}

function FriedTofu() {
  // 油豆腐：炸成金褐色的豆腐塊，切開的露出白色的內面
  const cubes = [[74, 90], [100, 86], [126, 90], [88, 100], [114, 100]]
  return (
    <>
      <Shadow cy={124} rx={74} />
      <Plate cy={100} />
      <ellipse cx="100" cy="100" rx="40" ry="9" fill="#8a5a32" opacity="0.6" />
      {cubes.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x - 11} ${y - 6} l11 -5 l11 5 l0 11 l-11 5 l-11 -5 z`} fill={i % 2 ? '#bf7f34' : '#c98a3c'} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M${x - 11} ${y - 6} l11 -5 l11 5 l-11 5 z`} fill={i % 2 ? '#d39648' : '#f1e7cf'} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      ))}
    </>
  )
}

function Daikon() {
  // 菜頭（滷白蘿蔔）：淡琥珀色的厚圓塊
  return (
    <>
      <Shadow cy={124} rx={74} />
      <Plate cy={100} />
      {[[76, 92, '#e7cf9d'], [104, 88, '#dcc08a'], [128, 96, '#ead6a8'], [92, 102, '#e2c896']].map(([x, y, fill], i) => (
        <g key={i}>
          <path d={`M${x - 14} ${y - 4} L${x - 14} ${y + 6} A14 5 0 0 0 ${x + 14} ${y + 6} L${x + 14} ${y - 4}`} fill={fill} stroke={INK} strokeWidth="1.5" />
          <ellipse cx={x} cy={y - 4} rx="14" ry="5" fill="#f2e2bc" stroke={INK} strokeWidth="1.4" />
          <ellipse cx={x} cy={y - 4} rx="8" ry="2.6" fill="none" stroke="#d8bf8a" strokeWidth="1" />
        </g>
      ))}
    </>
  )
}

const ILLUSTRATIONS = {
  shiitake: Shiitake,
  'dried-shrimp': DriedShrimp,
  'mullet-roe': MulletRoe,
  'dried-goods': DriedGoods,
  'strawberry-daifuku': StrawberryDaifuku,
  monaka: Monaka,
  dorayaki: Dorayaki,
  yokan: Yokan,
  'pineapple-cake': PineappleCake,
  'cao-guo': CaoGuo,
  'hong-gui': HongGui,
  'luobo-gao': LuoboGao,
  'yu-guo-qiao': YuGuoQiao,
  douhua: Douhua,
  'maltose-syrup': MaltoseSyrup,
  'sweet-potato-balls': SweetPotatoBalls,
  'fen-guo': FenGuo,
  'red-green-beans': RedGreenBeans,
  'coffee-beans': CoffeeBeans,
  'pour-over': PourOver,
  espresso: Espresso,
  'cold-drip': ColdDrip,
  'cold-brew': ColdBrew,
  'squid-geng': SquidGeng,
  'dried-squid': DriedSquid,
  'shacha-squid-geng': ShachaSquidGeng,
  'fish-crisp-geng': FishCrispGeng,
  tempura: Tempura,
  'dry-shacha-squid': DryShachaSquid,
  'temple-mi-tai-mu': TempleMiTaiMu,
  'side-dishes': SideDishes,
  'mi-tai-mu-soup': MiTaiMuSoup,
  'pork-cheek': PorkCheek,
  'fried-tofu': FriedTofu,
  daikon: Daikon,
}

export function FoodIllustration({ id, label }) {
  const Art = ILLUSTRATIONS[id] ?? DriedGoods
  return (
    <svg className="food-illustration" viewBox="0 0 200 140" role="img" aria-label={label}>
      <Art />
    </svg>
  )
}
