import { Color, DoubleSide, MeshToonMaterial } from 'three'
import { getTextures } from './textures.js'

/**
 * 共用的卡通渲染材質。
 *
 * 每種材質對應一張程式產生的貼圖，搭配頂點色（vertexColors）做出每棟建築的色差，
 * 因此整條街可以依材質合併成少數幾個網格，大幅減少繪製呼叫。
 *
 * TILE：貼圖每重複一次代表的實際尺寸（公尺），PartBuilder 會依此計算 UV。
 * 值為 null 時使用 0–1 的原始 UV（例如茶箱標籤）。
 */
export const MATERIAL_TILE = {
  plaster: 2.4,
  brick: 1.0,
  wood: 1.4,
  planks: 1.6,
  roof: 2.0,
  stone: 3.2,
  earth: 4.0,
  burlap: 0.5,
  bamboo: 0.35,
  paper: null,
  plain: 1,
  dark: 1,
  cloth: 1,
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
    brick: toon({ map: textures.brick }),
    wood: toon({ map: textures.wood }),
    planks: toon({ map: textures.planks }),
    roof: toon({ map: textures.roof }),
    stone: toon({ map: textures.stone }),
    earth: toon({ map: textures.earth }),
    burlap: toon({ map: textures.burlap }),
    bamboo: toon({ map: textures.bamboo }),
    paper: toon({ map: textures.teaLabel }),
    plain: toon(),
    dark: toon(),
    cloth: toon({ side: DoubleSide }),
  }
  return cache
}

/** 單色卡通材質（角色、標示物等不合併的物件使用） */
export function createToonMaterial(color, options = {}) {
  const { gradientMap } = getMaterials()
  return new MeshToonMaterial({ color: new Color(color), gradientMap, ...options })
}
