import { Color, DoubleSide, MeshBasicMaterial, MeshToonMaterial } from 'three'
import { getTextures } from './textures.js'
import { ensureExhibitTexture, getExhibitTexture } from './exhibitTexture.js'
import { ensureRiceTexture, getRiceTexture } from './riceTexture.js'
import { ensureSzxTexture, getSzxTexture } from './szxTexture.js'
import { windUniforms } from './wind.js'
import { patchShopGlassShader, patchShopWindowShader } from './shopGlow.js'
import { SURFACE_VARIATION, applySurfaceVariation } from './surfaceVariation.js'
import { CONTACT_OPACITY } from '../builders/contactShadow.js'

/**
 * 共用的卡通渲染材質。
 *
 * 每種材質對應一張程式產生的貼圖，搭配頂點色（vertexColors）做出每棟建築的色差，
 * 因此整條街可以依材質合併成少數幾個網格，大幅減少繪製呼叫。
 *
 * TILE：貼圖每重複一次代表的實際尺寸（公尺），PartBuilder 會依此計算 UV。
 * 值為 null 時使用 0–1 的原始 UV（例如茶箱標籤、玻璃櫥窗）。
 *
 * 會發光的材質（亮窗、燈籠、燈泡、櫥窗）由年代的 glow 值統一控制亮度：
 * 入夜的「酒樓繁華」最亮，白天的年代只留淡淡暖光。
 */
export const MATERIAL_TILE = {
  plaster: 2.4,
  stucco: 2.4,
  brick: 1.0,
  tile: 1.0,
  wood: 1.4,
  planks: 1.6,
  woodLight: 1.2,
  lattice: 0.6,
  roof: 2.0,
  stone: 3.2,
  granite: 1.3,
  marketTile: 1.2,
  whiteTile: 1.2,
  creamTile: 1.2,
  mosaicTile: 0.8,
  glossTile: 1.2,
  terracotta: 1.2,
  steel: 0.8,
  perforated: 0.5,
  earth: 4.0,
  asphalt: 4.0,
  pavers: 2.2,
  shutter: 1.2,
  awning: 0.5,
  burlap: 0.5,
  bamboo: 0.35,
  paper: null,
  glass: null,
  glassWarm: null,
  glassClear: 1,
  interior: 1,
  plain: 1,
  dark: 1,
  cloth: 1,
  // 0–1 的 UV：店內透光用 UV 標記效果種類（見 shopGlow.js）
  windowLit: null,
  lanternLit: 1,
  bulb: 1,
  // 黃玉階文史館的展板圖集：平面零件自己指定圖集上的 UV（見 exhibitAtlas.js）
  exhibit: null,
  // 迪化街329號店屋（稻舍）的壁畫、展板與老照片圖集
  riceExhibit: null,
  // 十字軒糕餅舖（2000–現在）的展板、獎狀、價卡與貼紙圖集
  szxExhibit: null,
  // 接地暗影（builders/contactShadow.js）：單色薄片，不用貼圖
  contact: null,
}

/** 發光材質的基礎亮度（乘上年代 glow 值） */
const GLOW_BASE = {
  windowLit: 0.8,
  lanternLit: 1.1,
  bulb: 1.6,
  glassWarm: 0.85,
}

let cache = null

export function getMaterials() {
  if (cache) return cache
  const textures = getTextures()
  const gradientMap = textures.toonGradient
  const toon = (options = {}) =>
    new MeshToonMaterial({
      gradientMap,
      vertexColors: true,
      ...options,
    })

  cache = {
    gradientMap,
    plaster: toon({ map: textures.plaster }),
    stucco: toon({ map: textures.stucco }),
    brick: toon({ map: textures.brick }),
    tile: toon({ map: textures.tile }),
    wood: toon({ map: textures.wood }),
    planks: toon({ map: textures.planks }),
    // 淺色木作（老屋新生店面的貼板）：以木紋自發光提亮
    woodLight: toon({ map: textures.planks, emissive: new Color('#ffffff'), emissiveMap: textures.planks, emissiveIntensity: 0.34 }),
    lattice: toon({ map: textures.lattice }),
    roof: toon({ map: textures.roof }),
    stone: toon({ map: textures.stone }),
    // 洗石子（灰色石粒牆面，例如滋養豆餡舖的立面）
    granite: toon({ map: textures.granite }),
    // 永樂市場：灰色地磚、白色磁磚、不鏽鋼、電纜線槽
    marketTile: toon({ map: textures.marketTile }),
    whiteTile: toon({ map: textures.whiteTile }),
    // 米色方形地磚（老潘魷魚羹的店內）
    creamTile: toon({ map: textures.creamTile }),
    // 永樂米苔目：白色小方磚的立面、店內淺色亮面的大地磚
    mosaicTile: toon({ map: textures.mosaicTile }),
    glossTile: toon({ map: textures.glossTile, emissive: new Color('#ffffff'), emissiveMap: textures.glossTile, emissiveIntensity: 0.12 }),
    // 陶磚地板（爐鍋咖啡二樓、小藝埕的騎樓）
    terracotta: toon({ map: textures.terracotta }),
    steel: toon({ map: textures.steel }),
    perforated: toon({ map: textures.perforated }),
    earth: toon({ map: textures.earth }),
    asphalt: toon({ map: textures.asphalt }),
    pavers: toon({ map: textures.pavers }),
    shutter: toon({ map: textures.shutter }),
    awning: swayingAwning(toon({ map: textures.stripes, side: DoubleSide })),
    burlap: toon({ map: textures.burlap }),
    bamboo: toon({ map: textures.bamboo }),
    paper: toon({ map: textures.teaLabel }),
    glass: toon({ map: textures.glass, emissive: new Color('#ffcf8a'), emissiveIntensity: 0 }),
    // 玻璃店面：原本的室內貼圖畫在假室內的後牆，左右牆、天花板與地板取貼圖邊緣的顏色（shopGlow.js）
    glassWarm: shopGlass(
      toon({
        map: textures.interior,
        emissive: new Color('#ffffff'),
        emissiveMap: textures.interior,
        emissiveIntensity: 0.3,
      }),
    ),
    // 透明玻璃：看得見櫥窗後方的淺層室內（不寫入深度、不參與輪廓線）
    glassClear: toon({ transparent: true, opacity: 0.2, depthWrite: false }),
    // 室內陳設：帶一點暖色自發光，在騎樓的陰影下仍看得清楚
    interior: toon({ emissive: new Color('#ffdcae'), emissiveIntensity: 0.22 }),
    plain: toon(),
    dark: toon(),
    cloth: toon({ side: DoubleSide }),
    // 亮窗與店內後牆：依 UV 標記畫假室內或後牆的漸層，沒標記的維持平面發光（shopGlow.js）
    windowLit: shopWindow(toon({ emissive: new Color('#ffb768'), emissiveIntensity: 0.2 })),
    lanternLit: toon({ emissive: new Color('#ff7a45'), emissiveIntensity: 0.2 }),
    bulb: toon({ emissive: new Color('#fff0c8'), emissiveIntensity: 0.4 }),
    // 黃玉階文史館的展板（圖集很大，第一次有網格用到時才繪製；其他年代不佔記憶體）
    exhibit: exhibitMaterial(toon),
    riceExhibit: lazyAtlasMaterial(toon, getRiceTexture, ensureRiceTexture),
    szxExhibit: lazyAtlasMaterial(toon, getSzxTexture, ensureSzxTexture),
    // 柱腳與家具的接地暗影（builders/contactShadow.js）：半透明的暖灰，三層薄片疊出由深到淡的幾階；
    // 疊在任何地面上都是變暗，不受光、不寫入深度
    contact: new MeshBasicMaterial({
      color: new Color('#2e261f'),
      transparent: true,
      opacity: CONTACT_OPACITY,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  }
  // 大面積的地磚與牆面：世界座標的明暗、色相、補丁與破磚（rendering/surfaceVariation.js）
  for (const [key, config] of Object.entries(SURFACE_VARIATION)) applySurfaceVariation(cache[key], config)
  return cache
}

/**
 * 遮雨棚隨風：沿法線輕輕起伏（頂點著色器，不增加繪製呼叫）。前緣的垂邊（法線水平）擺得較大，
 * 斜面（法線朝上）只有微微起伏；相位依世界座標，一排遮雨棚像被同一陣風吹過。
 * 幅度只有幾公分，輪廓線（法線趟不跑這段）仍然對得上。只在精緻畫質（uMotion = 1）擺動，流暢畫質不動。
 */
function swayingAwning(material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime
    shader.uniforms.uWind = windUniforms.uWind
    shader.uniforms.uMotion = windUniforms.uMotion
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;\nuniform float uMotion;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
          float flap = 1.0 - abs(objectNormal.y);
          float amp = mix(0.006, 0.03, flap) * (0.4 + uWind) * uMotion;
          float wave = sin(uTime * 2.3 + wp.x * 1.3 + wp.z * 0.7) * 0.7 + sin(uTime * 4.1 + wp.x * 2.9) * 0.3;
          transformed += objectNormal * amp * wave;
        }`,
      )
  }
  material.customProgramCacheKey = () => 'awning-sway'
  return material
}

/**
 * 店內透光只在精緻畫質啟用（setShopGlowEnabled）；著色器在編譯時依開關選擇版本（shopGlow.js 的
 * patchShopWindowShader／patchShopGlassShader），流暢畫質是原本的平面發光。切換畫質時材質重新編譯，
 * 不另外多一份材質，批次數不變。
 */
let shopGlowEnabled = false

function shopWindow(material) {
  material.onBeforeCompile = (shader) => patchShopWindowShader(shader, shopGlowEnabled)
  material.customProgramCacheKey = () => (shopGlowEnabled ? 'shop-window' : 'shop-window-flat')
  return material
}

function shopGlass(material) {
  material.onBeforeCompile = (shader) => patchShopGlassShader(shader, shopGlowEnabled)
  material.customProgramCacheKey = () => (shopGlowEnabled ? 'shop-glass' : 'shop-glass-flat')
  return material
}

/** 精緻畫質開啟店內透光、流暢畫質關閉；有變更時讓 windowLit、glassWarm 重新編譯 */
export function setShopGlowEnabled(enabled) {
  const next = Boolean(enabled)
  if (next === shopGlowEnabled) return
  shopGlowEnabled = next
  if (!cache) return
  cache.windowLit.needsUpdate = true
  cache.glassWarm.needsUpdate = true
}

export function isShopGlowEnabled() {
  return shopGlowEnabled
}

function lazyAtlasMaterial(toon, getTexture, ensure) {
  const material = toon({ map: getTexture() })
  material.onBeforeCompile = () => {
    ensure()
  }
  return material
}

function exhibitMaterial(toon) {
  const material = toon({ map: getExhibitTexture() })
  material.onBeforeCompile = () => {
    ensureExhibitTexture()
  }
  return material
}

let interiorCache = null

/**
 * 室內用的材質（永樂市場一樓）：與街景共用貼圖與卡通著色，另外加上一點自發光，
 * 讓沒有陽光直射的室內看起來像被日光燈均勻照亮。發光材質與透明材質維持原樣。
 */
export function getInteriorMaterials() {
  if (interiorCache) return interiorCache
  const base = getMaterials()
  interiorCache = { gradientMap: base.gradientMap }
  for (const [name, material] of Object.entries(base)) {
    if (name === 'gradientMap') continue
    if (name in GLOW_BASE || name === 'glassClear' || name === 'contact' || name === 'interior' || name === 'woodLight' || !material.isMaterial) {
      interiorCache[name] = material
      continue
    }
    const copy = material.clone()
    // clone 不會複製 onBeforeCompile（展板圖集靠它在第一次使用時才繪製）
    if (material.onBeforeCompile) copy.onBeforeCompile = material.onBeforeCompile
    if (material.customProgramCacheKey) copy.customProgramCacheKey = material.customProgramCacheKey
    // 街景材質的顏色會隨年代調整明度（setMaterialValues）；室內材質維持原本的白色
    copy.color.set('#ffffff')
    copy.emissive = new Color('#ffffff')
    copy.emissiveMap = material.map ?? null
    copy.emissiveIntensity = material.map ? 0.2 : 0.14
    interiorCache[name] = copy
  }
  return interiorCache
}

/** 已經產生的室內材質（還沒產生時是 null；材質凹凸開關時一起處理） */
export function peekInteriorMaterials() {
  return interiorCache
}

/**
 * 依年代 glow 值（0 白天 – 1 入夜）更新所有發光材質；
 * lanternGlow 只調整燈籠與燈泡（酒樓年代調暗，避免過曝）。
 */
export function setGlowLevel(glow, lanternGlow = 1) {
  const materials = getMaterials()
  materials.windowLit.emissiveIntensity = 0.1 + glow * GLOW_BASE.windowLit
  materials.lanternLit.emissiveIntensity = 0.15 + glow * GLOW_BASE.lanternLit * lanternGlow
  materials.bulb.emissiveIntensity = 0.25 + glow * GLOW_BASE.bulb * lanternGlow
  materials.glassWarm.emissiveIntensity = 0.22 + glow * GLOW_BASE.glassWarm
  materials.glass.emissiveIntensity = glow * 0.18
}

/**
 * 依年代調整街景材質的明度（atmosphere 的 value_<材質>，年代切換時平滑過渡）。
 * 材質原本的顏色都是白色（色彩來自貼圖與頂點色），所以直接設成倍率。
 */
export function setMaterialValues(current, keys) {
  const materials = getMaterials()
  for (const key of keys) materials[key]?.color.setScalar(current[`value_${key}`] ?? 1)
}

/** 單色卡通材質（角色、標示物等不合併的物件使用） */
export function createToonMaterial(color, options = {}) {
  const { gradientMap } = getMaterials()
  return new MeshToonMaterial({ color: new Color(color), gradientMap, ...options })
}
