import { BufferAttribute, BufferGeometry, Color, DoubleSide, Matrix4, NormalBlending, ShaderMaterial, Vector2, Vector4 } from 'three'
import { COVER } from '../rainMath.js'
import { RAIN } from '../weather.js'
import { RIVER } from '../config.js'

/**
 * 雨天的著色器（只在精緻畫質建立；純邏輯在 game/rainMath.js 與 game/weather.js）
 *
 * - 遮雨高度圖（cover）：從正上方把街景畫成一張「每個位置最高有多高」的圖（CoverHeight 覆寫材質），
 *   雨絲、水花、濕地面都讀它，屋頂、騎樓與樹冠下面沒有雨。
 * - 雨絲與水花（RainStreaks）：一個網格、一次繪製。每條雨絲是一個四邊形，位置全部在頂點著色器裡算
 *   （世界座標固定、在鏡頭周圍循環），順著風斜斜落下，落到遮雨高度就停，在那裡濺起一圈水花。
 * - 屋簷滴水與水簾（RainDrips）：遮雨高度圖找出的簷口，每點兩滴，自由落體加速落下；雨大時拉成連續的水簾。
 */

/** 遮雨高度圖的取樣（雨絲、水花、濕地面共用） */
export const COVER_GLSL = /* glsl */ `
  uniform sampler2D tCover;
  uniform vec4 uCoverBounds; // minX, maxX, minZ, maxZ
  uniform vec2 uCoverRange;  // minY, maxY
  uniform float uEdgeX;
  uniform float uWaterY;
  // 這個位置頭上最高的東西有多高（沒有遮蔽時回傳 −10000）
  float coverHeight(vec2 xz) {
    vec2 uv = vec2((xz.x - uCoverBounds.x) / (uCoverBounds.y - uCoverBounds.x), (uCoverBounds.w - xz.y) / (uCoverBounds.w - uCoverBounds.z));
    if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return -10000.0;
    vec4 c = texture2D(tCover, uv);
    if (c.a < 0.5) return -10000.0;
    return uCoverRange.x + ((c.r * 255.0 + c.g) / 255.0) * (uCoverRange.y - uCoverRange.x);
  }
  // 雨落到哪裡：遮蔽物的頂面，或沒有遮蔽時的街面／河面
  float rainFloor(vec2 xz) {
    return max(coverHeight(xz), xz.x < uEdgeX ? uWaterY : 0.0);
  }
`

/** 遮雨高度圖、積水倒影等跨元件共用的資料（Rain 元件寫入，ToonRenderer 的濕地面那一趟讀取） */
export const rainRuntime = {
  cover: null, // 遮雨高度圖（WebGLRenderTarget 的貼圖）
  coverReady: false,
  puddle: null, // 積水倒影（WebGLRenderTarget 的貼圖）
  puddleReady: false,
  puddleMatrix: new Matrix4(),
  puddleY: 0.02,
}

export function coverUniforms() {
  return {
    tCover: { value: null },
    uCoverBounds: { value: new Vector4(COVER.minX, COVER.maxX, COVER.minZ, COVER.maxZ) },
    uCoverRange: { value: new Vector2(COVER.minY, COVER.maxY) },
    uEdgeX: { value: RIVER.edgeX },
    uWaterY: { value: RIVER.waterLevel },
  }
}

/** 畫遮雨高度圖用的覆寫材質：輸出世界座標的高度（兩個 8 位元通道） */
export function createCoverMaterial() {
  return new ShaderMaterial({
    name: 'CoverHeight',
    side: DoubleSide,
    uniforms: { uCoverRange: { value: new Vector2(COVER.minY, COVER.maxY) } },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vY = world.y;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uCoverRange;
      varying float vY;
      void main() {
        float v = clamp((vY - uCoverRange.x) / (uCoverRange.y - uCoverRange.x), 0.0, 1.0);
        float hi = floor(v * 255.0);
        gl_FragColor = vec4(hi / 255.0, fract(v * 255.0), 0.0, 1.0);
      }
    `,
  })
}

/** 四邊形的四個角（side −1/1、end 0/1）與索引：n 個四邊形 */
function quads(n, fill) {
  const corner = new Float32Array(n * 4 * 3)
  const index = new Uint32Array(n * 6)
  const extra = fill(n)
  for (let i = 0; i < n; i++) {
    const c = i * 12
    corner.set([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], c)
    index.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(n * 4 * 3), 3))
  geometry.setAttribute('aCorner', new BufferAttribute(corner, 3))
  for (const [name, { array, size }] of Object.entries(extra)) geometry.setAttribute(name, new BufferAttribute(array, size))
  geometry.setIndex(new BufferAttribute(index, 1))
  return geometry
}

/** 決定性的亂數（雨絲與水滴的位置、相位） */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 雨絲與水花的幾何：前 streaks 個是雨絲（kind 0），後 splashes 個是水花（kind 1） */
export function createRainGeometry(streaks = RAIN.streaks, splashes = RAIN.splashes) {
  const n = streaks + splashes
  const random = rng(1853)
  const geometry = quads(n, (count) => {
    const seed = new Float32Array(count * 4 * 4)
    for (let i = 0; i < count; i++) {
      const s = [random(), random(), random(), random()]
      for (let k = 0; k < 4; k++) seed.set(s, (i * 4 + k) * 4)
    }
    return { aSeed: { array: seed, size: 4 } }
  })
  const corner = geometry.attributes.aCorner.array
  for (let i = streaks; i < n; i++) for (let k = 0; k < 4; k++) corner[(i * 4 + k) * 3 + 2] = 1
  // 位置全部在著色器裡算，包圍球設成很大，不會被視錐剔除
  geometry.boundingSphere = null
  return geometry
}

const RAIN_VERTEX = /* glsl */ `
  attribute vec4 aSeed;
  attribute vec3 aCorner;
  uniform float uTime;
  uniform float uBox;
  uniform float uHeight;
  uniform float uSpeed;
  uniform float uLength;
  uniform float uAmount;
  uniform float uPixel;   // 每公尺距離一個像素有多寬（2·tan(fov/2) / 畫面高）
  uniform vec2 uWind;
  varying vec2 vLocal;
  varying float vAlpha;
  varying float vKind;
  ${COVER_GLSL}

  void hide() {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0;
  }

  void main() {
    vKind = aCorner.z;
    vLocal = vec2(aCorner.x, aCorner.y * 2.0 - 1.0);
    // 雨勢小時只畫一部分（種子大於雨勢的不畫）
    if (aSeed.w > uAmount) { hide(); return; }
    if (aCorner.z < 0.5) {
      // 雨絲：世界座標固定，平移整數個 box 到鏡頭附近（rainMath.js 的 wrapToCamera）
      float period = uHeight / uSpeed;
      float t = fract(uTime / period + aSeed.z);
      float fall = t * period;
      vec2 w = aSeed.xy * uBox;
      vec2 xz = w + uBox * floor((cameraPosition.xz - w) / uBox + 0.5) + uWind * (fall - period * 0.5);
      float top = cameraPosition.y + uHeight * 0.55;
      float headY = top - fall * uSpeed;
      float floorY = rainFloor(xz);
      if (headY < floorY) { hide(); return; }
      vec3 dir = normalize(vec3(uWind.x, -uSpeed, uWind.y));
      vec3 head = vec3(xz.x, headY, xz.y);
      vec3 tail = head - dir * uLength * (0.7 + aSeed.z * 0.6);
      vec3 p = mix(head, tail, aCorner.y);
      vec3 toCam = p - cameraPosition;
      float dist = length(toCam);
      // 寬度至少一個像素；遠處變細的雨絲改成變淡
      float width = max(0.0055, dist * uPixel * 0.75);
      vec3 side = normalize(cross(dir, toCam / max(dist, 0.001)));
      p += side * aCorner.x * width;
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      float horiz = length(toCam.xz);
      vAlpha = (0.0055 / width) * 0.85 + 0.15;
      vAlpha *= smoothstep(0.8, 3.0, dist) * (1.0 - smoothstep(uBox * 0.32, uBox * 0.5, horiz));
    } else {
      // 水花：每 0.5 秒換一個位置，落在雨落到的地方（街面、屋頂、河面），一圈很快散開的水
      float cycle = floor(uTime * 2.0 + aSeed.z);
      vec2 s = fract(aSeed.xy + cycle * vec2(0.6180339, 0.4142135));
      vec2 w = s * uBox * 0.7;
      vec2 xz = w + uBox * 0.7 * floor((cameraPosition.xz - w) / (uBox * 0.7) + 0.5);
      float life = fract(uTime * 2.0 + aSeed.z);
      float y = rainFloor(xz) + 0.025;
      float r = mix(0.03, 0.13, sqrt(life));
      vec3 p = vec3(xz.x + aCorner.x * r, y, xz.y + (aCorner.y * 2.0 - 1.0) * r);
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      float dist = length(p - cameraPosition);
      vAlpha = (1.0 - life) * 0.7 * (1.0 - smoothstep(9.0, 16.0, dist)) * smoothstep(0.6, 1.4, dist);
    }
  }
`

const RAIN_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vLocal;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float a;
    if (vKind < 0.5) {
      // 雨絲：中間最濃、兩側柔邊；頭（下端）比尾巴清楚
      a = (1.0 - abs(vLocal.x)) * mix(1.0, 0.35, vLocal.y * 0.5 + 0.5);
    } else {
      // 水花：一圈細環（卡通風格的硬邊）
      float r = length(vLocal);
      a = smoothstep(0.62, 0.78, r) * (1.0 - smoothstep(0.86, 1.0, r)) * 1.4;
    }
    a *= vAlpha * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

export function createRainMaterial() {
  return new ShaderMaterial({
    name: 'RainStreaks',
    vertexShader: RAIN_VERTEX,
    fragmentShader: RAIN_FRAGMENT,
    transparent: true,
    depthWrite: false,
    // 四邊形朝向鏡頭的那一面依雨絲方向而定，兩面都畫
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      ...coverUniforms(),
      uTime: { value: 0 },
      uBox: { value: RAIN.box },
      uHeight: { value: RAIN.height },
      uSpeed: { value: RAIN.speed },
      uLength: { value: RAIN.length },
      uAmount: { value: 0 },
      uPixel: { value: 0.001 },
      uWind: { value: new Vector2(1.2, 0.3) },
      uColor: { value: new Color('#dfe6ea') },
      uOpacity: { value: 0.36 },
    },
  })
}

/**
 * 屋簷滴水的幾何：每個滴水點 RAIN.dripsPerEmitter 滴（kind 0）＋落地的水花（kind 1）。
 * emitters：rainMath.js 的 findEaveEmitters（[x, 簷口高度, z, 落地高度]）。
 */
export function createDripGeometry(emitters, perEmitter = RAIN.dripsPerEmitter) {
  const n = emitters.length * (perEmitter + 1)
  const random = rng(329)
  const geometry = quads(n, (count) => {
    const emit = new Float32Array(count * 4 * 4)
    const seed = new Float32Array(count * 4 * 4)
    let q = 0
    for (const e of emitters) {
      const active = random()
      const rate = random()
      for (let k = 0; k <= perEmitter; k++) {
        // 同一點的幾滴錯開相位；最後一個是水花，跟第一滴同步
        const phase = k === perEmitter ? 0 : k / perEmitter
        const s = [phase, rate, active, k === perEmitter ? 1 : 0]
        for (let v = 0; v < 4; v++) {
          emit.set(e, (q * 4 + v) * 4)
          seed.set(s, (q * 4 + v) * 4)
        }
        q++
      }
    }
    return { aEmit: { array: emit, size: 4 }, aSeed: { array: seed, size: 4 } }
  })
  geometry.boundingSphere = null
  return geometry
}

const DRIP_VERTEX = /* glsl */ `
  attribute vec4 aEmit;   // x, 簷口高度, z, 落地高度
  attribute vec4 aSeed;   // 相位, 間隔的變化, 啟用門檻, 是不是水花
  attribute vec3 aCorner;
  uniform float uTime;
  uniform float uDrip;    // 屋簷滴水的量（weather.js 的 drip）
  uniform float uRain;    // 雨勢：大雨時水滴拉長成水簾
  uniform float uPixel;
  varying vec2 vLocal;
  varying float vAlpha;
  varying float vKind;
  const float G = 9.8;

  void hide() {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0;
  }

  void main() {
    vKind = aSeed.w;
    vLocal = vec2(aCorner.x, aCorner.y * 2.0 - 1.0);
    // 雨剛開始、雨停之後只有一部分的簷口在滴
    if (aSeed.z > uDrip) { hide(); return; }
    float drop = max(0.05, aEmit.y - aEmit.w);
    float fallTime = sqrt(2.0 * drop / G);
    // 一滴落下的週期：雨大時幾乎連成一線（水簾），雨小時間隔較長
    float cycle = fallTime * mix(2.6, 1.05, uRain) + 0.25 + aSeed.y * 0.5;
    float tc = mod(uTime + aSeed.x * cycle + aSeed.y * 7.0, cycle);
    vec3 base = vec3(aEmit.x, 0.0, aEmit.z);
    float dist = length(base.xz - cameraPosition.xz);
    if (dist > 38.0) { hide(); return; }
    if (aSeed.w < 0.5) {
      if (tc > fallTime) { hide(); return; }
      float y = aEmit.y - 0.5 * G * tc * tc;
      float v = G * tc;
      float len = clamp(0.06 + v * mix(0.03, 0.12, uRain), 0.06, min(1.3, aEmit.y - y + 0.06));
      vec3 head = vec3(aEmit.x, max(y, aEmit.w), aEmit.z);
      vec3 p = head + vec3(0.0, len * aCorner.y, 0.0);
      vec3 toCam = p - cameraPosition;
      float d = length(toCam);
      float width = max(0.014, d * uPixel * 0.8);
      vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), toCam / max(d, 0.001)));
      p += side * aCorner.x * width;
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      vAlpha = ((0.014 / width) * 0.8 + 0.2) * smoothstep(0.4, 1.2, d) * (1.0 - smoothstep(26.0, 38.0, dist));
    } else {
      // 落地的水花：水滴落地後 0.3 秒內散開
      float life = (tc - fallTime) / 0.3;
      if (life < 0.0 || life > 1.0) { hide(); return; }
      float r = mix(0.05, 0.2, sqrt(life));
      vec3 p = vec3(aEmit.x + aCorner.x * r, aEmit.w + 0.03, aEmit.z + (aCorner.y * 2.0 - 1.0) * r);
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      vAlpha = (1.0 - life) * (1.0 - smoothstep(14.0, 24.0, dist));
    }
  }
`

export function createDripMaterial() {
  return new ShaderMaterial({
    name: 'RainDrips',
    vertexShader: DRIP_VERTEX,
    fragmentShader: RAIN_FRAGMENT,
    transparent: true,
    depthWrite: false,
    // 四邊形朝向鏡頭的那一面依雨絲方向而定，兩面都畫
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uDrip: { value: 0 },
      uRain: { value: 0 },
      uPixel: { value: 0.001 },
      uColor: { value: new Color('#e6edf0') },
      uOpacity: { value: 0.62 },
    },
  })
}

/** 雨點打在水面的漣漪（河面與積水共用；回傳 (dx, dz, 環的亮度)） */
export const RIPPLE_GLSL = /* glsl */ `
  float rippleHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  vec3 rainRipples(vec2 p, float t) {
    vec2 cell = floor(p);
    vec3 acc = vec3(0.0);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 c = cell + vec2(float(i), float(j));
        float h = rippleHash(c);
        vec2 center = c + vec2(rippleHash(c + 3.1), rippleHash(c + 7.7));
        float life = fract(t * (0.8 + h * 0.6) + h * 9.0);
        vec2 dv = p - center;
        float r = length(dv);
        float ring = exp(-pow((r - life * 0.85) * 11.0, 2.0)) * (1.0 - life) * (1.0 - life);
        acc.xy += dv / max(r, 0.001) * ring;
        acc.z += ring;
      }
    }
    return acc;
  }
`

