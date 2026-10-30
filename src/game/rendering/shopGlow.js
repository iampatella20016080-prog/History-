/**
 * 店內透光：讓店面與窗戶裡的光有縱深（純邏輯模組，不依賴 React／Three，可以直接單測）。
 *
 * 原本店內後牆、亮窗都是一整片同樣亮度的發光面，看起來像貼了一張紙。改成：
 * - 店內後牆（街屋、騎樓店面有實際層架與櫃台的淺室內）：中間亮、左右與上方暗、地面附近收暗，
 *   兩層層架下各有一道陰影（光從店中央上方的燈來，層板擋住）。
 * - 亮窗與玻璃店面（後面沒有模型）：假室內（interior mapping）——在面上算出視線打到一個看不見的房間的哪一面
 *   （後牆、左右牆、天花板、地板），各面明暗不同，從街上斜看時房間會跟著視差移動。
 *
 * 全部在既有材質（windowLit、glassWarm）的著色器裡算，不加光源、不加材質、不加繪製呼叫。
 * 只在精緻畫質啟用（quality.js 的 shopGlow）；流暢畫質（iPad）的著色器不做求交，維持原本的平面發光。
 * 要哪一種效果記在 UV 上（windowLit 沒有貼圖，UV 本來沒用到）：
 * - u < 9.5：維持原本的平面發光（室內場景裡的窗、門楣等，不讓假室內和真的室內衝突）
 * - u ∈ [10, 11]：假室內窗，u − 10、v 是窗面上 0–1 的位置
 * - u ∈ [20, 21]：店內後牆，u − 20 是 0–1 的寬度位置，v 是離店內地面的高度（公尺）
 * glassWarm 一律是假室內（UV 維持原本每片 0–1，後牆畫的是原本的室內貼圖）；玻璃店面的整排玻璃另外寫一個頂點屬性
 * shopRoom = (1 + u, 1 + v)（整排共用的 0–1 位置），精緻畫質的著色器用它讓整排共用一個房間；沒有這個屬性時讀到 0，
 * 改用每片自己的 UV。流暢畫質不讀它，著色器和原本完全相同。
 *
 * 下面的 JS 函式和 GLSL 是同一套算式（JS 給測試用），改一邊要一起改另一邊。
 */

export const SHOP_GLOW_KIND = { flat: 0, room: 1, back: 2 }

/** UV 上標記效果種類用的偏移 */
export const SHOP_GLOW_U0 = { room: 10, back: 20 }

/** 店內兩層層架離店內地面的高度（公尺）；shophouse、arcade 的淺室內依此放層板，後牆依此畫陰影 */
export const SHOP_SHELF_HEIGHTS = [0.95, 1.57]

/** 玻璃店面整排共用的假房間座標（頂點屬性名稱；值是 1 + 0–1 的位置，0 代表沒有） */
export const SHOP_ROOM_ATTRIBUTE = 'shopRoom'

/** 假室內的房間深度（公尺）：樓上的窗、玻璃店面 */
export const ROOM_DEPTH = { window: 2.4, glass: 3.0 }

/** 由 UV 判斷效果種類 */
export function shopGlowKind(u) {
  if (u >= SHOP_GLOW_U0.back - 0.5) return SHOP_GLOW_KIND.back
  if (u >= SHOP_GLOW_U0.room - 0.5) return SHOP_GLOW_KIND.room
  return SHOP_GLOW_KIND.flat
}

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const sq = (x) => x * x

/**
 * 店內後牆的明暗（約 0.1–1）：u 是 0–1 的寬度位置，v 是離店內地面的高度（公尺）。
 */
export function backWallShade(u, v) {
  const lateral = 0.3 + 0.7 * Math.exp(-sq((u - 0.5) * 2.6))
  const vertical = 0.5 + 0.5 * Math.exp(-sq((v - 1.25) / 0.95))
  const top = 1 - 0.6 * smoothstep(1.85, 2.9, v)
  const floor = 0.7 + 0.3 * smoothstep(0.0, 0.4, v)
  let shelves = 1
  for (const h of SHOP_SHELF_HEIGHTS) {
    // 層板正下方最暗，往下約 40 公分淡掉
    const under = smoothstep(h - 0.42, h - 0.02, v) * (v <= h ? 1 : 0)
    shelves *= 1 - 0.65 * under
  }
  return lateral * vertical * top * floor * shelves
}

/**
 * 假室內的視線求交：窗面上的點 (u, v)（0–1），視線方向 dir（房間座標：x 沿寬、y 沿高、z 朝外為正，
 * 已除以窗寬、窗高與房間深度）。房間是 x、y ∈ [0, 1]、z ∈ [−1, 0] 的盒子。
 * 回傳打到的面與交點。
 */
export function roomHit(u, v, dir) {
  const [dx, dy, dz] = dir
  const far = 1e6
  const tz = dz < 0 ? -1 / dz : far
  const tx = dx > 0 ? (1 - u) / dx : dx < 0 ? -u / dx : far
  const ty = dy > 0 ? (1 - v) / dy : dy < 0 ? -v / dy : far
  const t = Math.min(tz, tx, ty)
  const point = [u + dx * t, v + dy * t, dz * t]
  let surface = 'back'
  if (t === tx) surface = dx > 0 ? 'right' : 'left'
  else if (t === ty) surface = dy > 0 ? 'ceiling' : 'floor'
  return { surface, point }
}

const SURFACE_ALBEDO = { back: 1, left: 0.72, right: 0.72, floor: 0.68, ceiling: 0.42 }

/**
 * 假室內交點的明暗（約 0.1–1）：燈在房間中央偏上、偏後，各面依和燈的距離衰減；
 * 牆角收暗；後牆有一道層架與它下面的陰影。
 */
export function roomShade({ surface, point }) {
  const [x, y, z] = point
  const lamp = 0.3 + 0.7 * Math.exp(-(sq(x - 0.5) * 2.6 + sq(y - 0.78) * 2.2 + sq(z + 0.55) * 1.4))
  // 牆角：離這一面的邊越近越暗
  const edge = surface === 'back' ? Math.min(x, 1 - x, y, 1 - y) : surface === 'left' || surface === 'right' ? Math.min(y, 1 - y, 1 + z) : Math.min(x, 1 - x, 1 + z)
  const ao = 0.6 + 0.4 * smoothstep(0, 0.14, edge)
  let shelf = 1
  if (surface === 'back') shelf = 1 - 0.5 * smoothstep(0.2, 0.42, y) * (y <= 0.44 ? 1 : 0)
  return SURFACE_ALBEDO[surface] * lamp * ao * shelf
}

/**
 * 在已經放到世界座標的幾何上寫入店內透光的 UV（PartBuilder.add 回傳的幾何）。
 * positions、normals 是扁平的 xyz 陣列，uvs 是扁平的 uv 陣列（就地修改）。
 * 每個面依法線算出水平切線 T = up × N，u 沿 T、v 沿高度；同一方向的面一起正規化到 0–1。
 * kind 'room'：v 也正規化到 0–1；'back'：v 是離店內地面的高度（公尺），floorOffset 是店內地面比這個幾何的底邊高多少
 * （用幾何自己的底邊當基準，不受建築群組的位移影響）。
 */
export function tagShopGlowUV(positions, normals, uvs, kind, options = {}) {
  tagShopGlowUVGroup([{ positions, normals, uvs }], kind, options)
  return uvs
}

/**
 * 好幾片幾何共用一個範圍（例如玻璃店面的每一片玻璃）：整排玻璃後面是同一個假房間，不會變成一格一格的隔間。
 * parts：[{ positions, normals, uvs }]
 */
export function tagShopGlowUVGroup(parts, kind, { floorOffset = 0, offset } = {}) {
  const u0 = offset ?? SHOP_GLOW_U0[kind]
  if (u0 === undefined) throw new Error(`未知的店內透光種類：${kind}`)
  const groups = new Map()
  let yMin = Infinity
  let yMax = -Infinity
  const meta = parts.map(({ positions, normals }) => {
    const count = positions.length / 3
    const s = new Float64Array(count)
    const key = new Array(count)
    for (let i = 0; i < count; i++) {
      const nx = normals[i * 3]
      const nz = normals[i * 3 + 2]
      const len = Math.hypot(nx, nz)
      const y = positions[i * 3 + 1]
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
      if (len < 0.5) {
        key[i] = null // 朝上、朝下的面：放在中間
        continue
      }
      const tx = nz / len
      const tz = -nx / len
      s[i] = positions[i * 3] * tx + positions[i * 3 + 2] * tz
      const k = `${Math.round(tx * 20)},${Math.round(tz * 20)}`
      key[i] = k
      const g = groups.get(k) ?? { min: Infinity, max: -Infinity }
      if (s[i] < g.min) g.min = s[i]
      if (s[i] > g.max) g.max = s[i]
      groups.set(k, g)
    }
    return { s, key }
  })
  const ySpan = Math.max(yMax - yMin, 1e-6)
  parts.forEach(({ positions, uvs }, p) => {
    const { s, key } = meta[p]
    for (let i = 0; i < s.length; i++) {
      const y = positions[i * 3 + 1]
      let u = 0.5
      if (key[i] !== null) {
        const g = groups.get(key[i])
        u = (s[i] - g.min) / Math.max(g.max - g.min, 1e-6)
      }
      uvs[i * 2] = u0 + u
      uvs[i * 2 + 1] = kind === 'room' ? (offset ?? 0) + (y - yMin) / ySpan : y - yMin - floorOffset
    }
  })
}

/* ── GLSL（MeshToonMaterial 的 onBeforeCompile 用） ───────────── */

export const SHOP_GLOW_VERTEX_PARS = /* glsl */ `
varying vec3 vShopPos;
varying vec3 vShopNormal;
varying vec2 vShopUv;
`

export const SHOP_GLOW_VERTEX = /* glsl */ `
vShopPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vShopNormal = normalize(mat3(modelMatrix) * objectNormal);
vShopUv = uv;
`

export const SHOP_GLOW_FRAGMENT_PARS = /* glsl */ `
varying vec3 vShopPos;
varying vec3 vShopNormal;
varying vec2 vShopUv;

float shopSq(float x) { return x * x; }

float shopBackWall(float u, float v) {
  float lateral = 0.3 + 0.7 * exp(-shopSq((u - 0.5) * 2.6));
  float vertical = 0.5 + 0.5 * exp(-shopSq((v - 1.25) / 0.95));
  float top = 1.0 - 0.6 * smoothstep(1.85, 2.9, v);
  float floorAo = 0.7 + 0.3 * smoothstep(0.0, 0.4, v);
  float shelves = 1.0;
  shelves *= 1.0 - 0.65 * smoothstep(${(SHOP_SHELF_HEIGHTS[0] - 0.42).toFixed(3)}, ${(SHOP_SHELF_HEIGHTS[0] - 0.02).toFixed(3)}, v) * step(v, ${SHOP_SHELF_HEIGHTS[0].toFixed(3)});
  shelves *= 1.0 - 0.65 * smoothstep(${(SHOP_SHELF_HEIGHTS[1] - 0.42).toFixed(3)}, ${(SHOP_SHELF_HEIGHTS[1] - 0.02).toFixed(3)}, v) * step(v, ${SHOP_SHELF_HEIGHTS[1].toFixed(3)});
  return lateral * vertical * top * floorAo * shelves;
}

// 假室內：回傳交點（xyz，房間座標）與面的代號（w：0 後牆、1 左右牆、2 地板、3 天花板、−1 算不出來）
vec4 shopRoomHit(vec2 p, float depth) {
  vec3 dpdx = dFdx(vShopPos);
  vec3 dpdy = dFdy(vShopPos);
  vec2 dudx = dFdx(vShopUv);
  vec2 dudy = dFdy(vShopUv);
  float det = dudx.x * dudy.y - dudx.y * dudy.x;
  if (abs(det) < 1e-10) return vec4(p, 0.0, -1.0);
  vec3 dPdu = (dpdx * dudy.y - dpdy * dudx.y) / det;
  vec3 dPdv = (dpdy * dudx.x - dpdx * dudy.x) / det;
  float su = max(length(dPdu), 1e-4);
  float sv = max(length(dPdv), 1e-4);
  vec3 n = normalize(vShopNormal);
  vec3 view = vShopPos - cameraPosition;
  vec3 d = vec3(dot(view, dPdu) / (su * su), dot(view, dPdv) / (sv * sv), dot(view, n) / depth);
  if (d.z > -1e-4) return vec4(p, 0.0, -1.0);
  float far = 1e6;
  float tz = -1.0 / d.z;
  float tx = d.x > 0.0 ? (1.0 - p.x) / d.x : (d.x < 0.0 ? -p.x / d.x : far);
  float ty = d.y > 0.0 ? (1.0 - p.y) / d.y : (d.y < 0.0 ? -p.y / d.y : far);
  float t = min(tz, min(tx, ty));
  vec3 hit = vec3(p, 0.0) + d * t;
  float surface = 0.0;
  if (t == tx) surface = 1.0;
  else if (t == ty) surface = d.y > 0.0 ? 3.0 : 2.0;
  return vec4(hit, surface);
}

float shopRoomShade(vec4 hit) {
  vec3 q = hit.xyz;
  float surface = hit.w;
  float lamp = 0.3 + 0.7 * exp(-(shopSq(q.x - 0.5) * 2.6 + shopSq(q.y - 0.78) * 2.2 + shopSq(q.z + 0.55) * 1.4));
  float edge;
  float albedo;
  if (surface < 0.5) {
    edge = min(min(q.x, 1.0 - q.x), min(q.y, 1.0 - q.y));
    albedo = 1.0;
  } else if (surface < 1.5) {
    edge = min(min(q.y, 1.0 - q.y), 1.0 + q.z);
    albedo = 0.72;
  } else {
    edge = min(min(q.x, 1.0 - q.x), 1.0 + q.z);
    albedo = surface < 2.5 ? 0.68 : 0.42;
  }
  float ao = 0.6 + 0.4 * smoothstep(0.0, 0.14, edge);
  float shelf = surface < 0.5 ? 1.0 - 0.5 * smoothstep(0.2, 0.42, q.y) * step(q.y, 0.44) : 1.0;
  return albedo * lamp * ao * shelf;
}

// 燈光的色溫：亮處偏白、暗處偏深琥珀（白熾燈往外衰減的感覺）
vec3 shopLampTint(float shade) {
  return mix(vec3(0.78, 0.46, 0.3), vec3(1.0, 0.96, 0.9), clamp(shade, 0.0, 1.0));
}
`

/* ── 著色器修補（materials.js 的 onBeforeCompile 呼叫；精緻畫質才開啟） ───────────── */

/** 頂點著色器：傳世界座標、法線與 UV（windowLit 沒有貼圖，vUv 不存在） */
function patchVertex(shader) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${SHOP_GLOW_VERTEX_PARS}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n${SHOP_GLOW_VERTEX}`)
}

/**
 * windowLit（亮窗與店內後牆）。enabled 為 false（流暢畫質）時不修改，維持原本的平面發光。
 * - 店內後牆：中間亮、左右與上方暗、層架下有陰影；
 * - 假室內窗：視線打到看不見的房間，斜看有視差，窗邊兩側有窗簾；
 * - 沒標記的（室內場景裡的窗、門楣）維持原本的平面發光。
 * 明暗同時乘在底色與自發光：白天看得出房間的深淺，入夜時燈光集中在中間。
 */
export function patchShopWindowShader(shader, enabled) {
  if (!enabled) return shader
  patchVertex(shader)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${SHOP_GLOW_FRAGMENT_PARS}`)
    .replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      // 求交放在分支外面（dFdx 在分支裡沒有定義）
      vec4 shopHit = shopRoomHit(vec2(vShopUv.x - ${SHOP_GLOW_U0.room.toFixed(1)}, vShopUv.y), ${ROOM_DEPTH.window.toFixed(2)});
      float shopShade = 1.0;
      float shopEmissive = 1.0;
      if (vShopUv.x > ${(SHOP_GLOW_U0.back - 0.5).toFixed(1)}) {
        shopShade = shopBackWall(vShopUv.x - ${SHOP_GLOW_U0.back.toFixed(1)}, vShopUv.y);
        // 中間約等於原本的亮度，往外收暗（太亮會在入夜的年代過曝，層架陰影就看不出來）
        shopEmissive = shopShade * 1.05;
      } else if (vShopUv.x > ${(SHOP_GLOW_U0.room - 0.5).toFixed(1)}) {
        float px = vShopUv.x - ${SHOP_GLOW_U0.room.toFixed(1)};
        shopShade = shopHit.w < -0.5 ? 0.8 : shopRoomShade(shopHit);
        // 窗簾：貼在玻璃上（不跟著視差），兩側收起、偏暗
        float curtain = max(1.0 - smoothstep(0.08, 0.17, px), smoothstep(0.83, 0.92, px));
        shopShade = mix(shopShade, 0.32, curtain * 0.8);
        shopEmissive = shopShade * 1.3;
      }
      if (vShopUv.x > 9.5) diffuseColor.rgb *= mix(0.45, 1.15, shopShade);`,
    )
    .replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n        totalEmissiveRadiance *= vShopUv.x > 9.5 ? shopEmissive * shopLampTint(shopShade) : vec3(1.0);',
    )
  return shader
}

/**
 * glassWarm（玻璃店面）。enabled 為 true：假室內，後牆是原本的室內貼圖，其他面取貼圖邊緣的顏色並依燈的距離收暗，
 * 玻璃反光留在玻璃面上（不跟著視差）。enabled 為 false（流暢畫質）時不修改，維持原本的平貼室內圖。
 */
export function patchShopGlassShader(shader, enabled) {
  if (!enabled) return shader
  patchVertex(shader)
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\nattribute vec2 ${SHOP_ROOM_ATTRIBUTE};`)
    .replace('vShopUv = uv;', `vShopUv = ${SHOP_ROOM_ATTRIBUTE}.x > 0.5 ? ${SHOP_ROOM_ATTRIBUTE} - 1.0 : uv;`)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${SHOP_GLOW_FRAGMENT_PARS}`)
    .replace(
      '#include <map_fragment>',
      `// 玻璃店面整排共用一個房間（頂點屬性 shopRoom），其他的 glassWarm 用每片自己 0–1 的 UV
      vec2 shopUv = vShopUv;
      vec4 shopHit = shopRoomHit(shopUv, ${ROOM_DEPTH.glass.toFixed(2)});
      vec2 shopTexUv = shopHit.w < -0.5 ? shopUv : shopHit.xy;
      if (shopHit.w > 0.5 && shopHit.w < 1.5) shopTexUv = vec2(shopHit.x > 0.5 ? 0.985 : 0.015, shopHit.y);
      else if (shopHit.w > 1.5 && shopHit.w < 2.5) shopTexUv = vec2(shopHit.x, 0.03);
      else if (shopHit.w > 2.5) shopTexUv = vec2(shopHit.x, 0.97);
      shopTexUv = clamp(shopTexUv, 0.005, 0.995);
      float shopShade = shopHit.w < 0.5 ? 1.0 : shopRoomShade(shopHit) * 1.25;
      vec3 shopRoom = texture2D(map, shopTexUv).rgb * shopShade;
      // 玻璃反光：留在玻璃面上，不跟著視差
      float shopGlint = fract(shopUv.x * 0.8 + shopUv.y * 0.45 + 0.15);
      shopRoom += vec3(0.06) * smoothstep(0.0, 0.04, shopGlint) * (1.0 - smoothstep(0.07, 0.13, shopGlint));
      diffuseColor.rgb *= shopRoom;`,
    )
    .replace(
      '#include <emissivemap_fragment>',
      'totalEmissiveRadiance *= shopRoom;',
    )
  return shader
}
