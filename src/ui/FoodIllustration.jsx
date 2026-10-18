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
}

export function FoodIllustration({ id, label }) {
  const Art = ILLUSTRATIONS[id] ?? DriedGoods
  return (
    <svg className="food-illustration" viewBox="0 0 200 140" role="img" aria-label={label}>
      <Art />
    </svg>
  )
}
