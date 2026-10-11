import { Color, DoubleSide, MeshToonMaterial } from 'three'
import { getTextures } from './textures.js'

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
  lattice: 0.6,
  roof: 2.0,
  stone: 3.2,
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
  plain: 1,
  dark: 1,
  cloth: 1,
  windowLit: 1,
  lanternLit: 1,
  bulb: 1,
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
    lattice: toon({ map: textures.lattice }),
    roof: toon({ map: textures.roof }),
    stone: toon({ map: textures.stone }),
    earth: toon({ map: textures.earth }),
    asphalt: toon({ map: textures.asphalt }),
    pavers: toon({ map: textures.pavers }),
    shutter: toon({ map: textures.shutter }),
    awning: toon({ map: textures.stripes, side: DoubleSide }),
    burlap: toon({ map: textures.burlap }),
    bamboo: toon({ map: textures.bamboo }),
    paper: toon({ map: textures.teaLabel }),
    glass: toon({ map: textures.glass, emissive: new Color('#ffcf8a'), emissiveIntensity: 0 }),
    glassWarm: toon({
      map: textures.interior,
      emissive: new Color('#ffffff'),
      emissiveMap: textures.interior,
      emissiveIntensity: 0.3,
    }),
    plain: toon(),
    dark: toon(),
    cloth: toon({ side: DoubleSide }),
    windowLit: toon({ emissive: new Color('#ffb768'), emissiveIntensity: 0.2 }),
    lanternLit: toon({ emissive: new Color('#ff7a45'), emissiveIntensity: 0.2 }),
    bulb: toon({ emissive: new Color('#fff0c8'), emissiveIntensity: 0.4 }),
  }
  return cache
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

/** 單色卡通材質（角色、標示物等不合併的物件使用） */
export function createToonMaterial(color, options = {}) {
  const { gradientMap } = getMaterials()
  return new MeshToonMaterial({ color: new Color(color), gradientMap, ...options })
}
