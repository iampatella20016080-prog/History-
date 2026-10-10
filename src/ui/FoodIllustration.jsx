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

const ILLUSTRATIONS = {
  shiitake: Shiitake,
  'dried-shrimp': DriedShrimp,
  'mullet-roe': MulletRoe,
  'dried-goods': DriedGoods,
}

export function FoodIllustration({ id, label }) {
  const Art = ILLUSTRATIONS[id] ?? DriedGoods
  return (
    <svg className="food-illustration" viewBox="0 0 200 140" role="img" aria-label={label}>
      <Art />
    </svg>
  )
}
