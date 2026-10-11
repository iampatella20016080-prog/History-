import { ERAS } from '../../data/eras.js'
import { createRng, pick } from '../utils/random.js'

/**
 * 街屋的「生命史」：每塊地段在清末都是閩南式街屋，之後依各年代 buildingStyle.rebuild
 * 的機率翻修成仿巴洛克洋樓、Art Deco 或戰後鋼筋混凝土建築；沒有翻修的建築則逐漸老舊，
 * 到了「老屋新生」再被修復。同一塊地在每個年代的結果都固定（以地段種子計算），
 * 所以切換年代時看得到同一條街的演變。
 */
function seeded(seed, salt) {
  return createRng((seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0)
}

const MINNAN_PLASTER = ['#efe3c6', '#e8d6b0', '#e3ddc7', '#d8dcc3', '#ecd8bb', '#e6dfcc', '#dfe1cd']
const ROOF_TINTS = ['#ffffff', '#ece2dc', '#dcd5d0', '#f3e9e1', '#d8d2ce']
const WOOD_TINTS = ['#d6bd9c', '#c9ae8c', '#bfa07c', '#d9c4a5', '#c4a685']
const BAROQUE_WALL = ['#efe3c8', '#ead3c4', '#d8e0d0', '#e8d2a6', '#f0e6d4', '#e3d8e0']
const BAROQUE_SHUTTER = ['#6d8a83', '#8a5a44', '#5f7286', '#7d6b4f']
const DECO_WALL = ['#f1e8d6', '#ece2cc', '#efe3d6', '#e6e2d4']
const DECO_TRIM = ['#2f6b5a', '#7a2e33', '#b98f4f', '#3f4f63', '#2f5d6b']
const DECO_AWNING = ['#7a2e33', '#2f6b5a', '#8a5a36', '#3f4f63']
const POSTWAR_TILE = ['#e2e3d4', '#e9dfcf', '#d4cbb8', '#dfd0b8', '#cfd8d3', '#e4d3c9']

const BANNER_WORDS = ['茶', '米', '布', '油', '糖', '酒', '藥']

/** 各年代店前擺放的貨品類型（null 代表不擺） */
const GOODS_BY_ERA = {
  'qing-port': ['tea', 'grain', 'jars', 'crates', 'sacks', 'baskets', 'poles', null],
  banquet: ['tea', 'baskets', 'jars', 'crates', 'pastry', null, null],
  modern: ['tea', 'jars', 'baskets', null, null],
  postwar: ['baskets', 'sacks', 'crates', 'jars', 'rice', null],
  revival: ['tea', 'baskets', 'pastry', null, null, null],
}

function initialState(lot) {
  const rng = seeded(lot.seed, 1)
  return {
    archetype: 'minnan',
    builtEra: 1,
    params: {
      floors: lot.warehouse || lot.kind === 'end' ? 2 : rng() < 0.4 ? 2 : 1,
      ground: rng() < 0.52 ? 'brick' : 'plaster',
      upperBrick: rng() < 0.28,
      plasterTint: pick(rng, MINNAN_PLASTER),
      roofTint: pick(rng, ROOF_TINTS),
      woodTint: pick(rng, WOOD_TINTS),
      gable: lot.rowStart || lot.warehouse ? 'horseback' : rng() < 0.5 ? 'horseback' : 'gable',
      ridge: rng() < 0.45 ? 'curved' : 'plain',
      groundHeight: lot.warehouse || lot.kind === 'end' ? 3.5 : pick(rng, [3.15, 3.3, 3.45]),
      shutters: rng() < 0.5,
    },
  }
}

function rebuiltState(lot, archetype, eraOrder) {
  const rng = seeded(lot.seed, 100 + eraOrder)
  const wide = lot.width > 7
  if (archetype === 'baroque') {
    return {
      archetype,
      builtEra: eraOrder,
      params: {
        floors: wide || rng() < 0.4 ? 3 : 2,
        wallTint: pick(rng, BAROQUE_WALL),
        trimTint: '#f6efe0',
        shutterTint: pick(rng, BAROQUE_SHUTTER),
        columnMat: rng() < 0.5 ? 'brick' : 'stucco',
        parapet: pick(rng, ['scroll', 'arch', 'stepped', 'scroll']),
        balcony: rng() < 0.55,
        shutters: rng() < 0.6,
        roofTint: pick(rng, ROOF_TINTS),
      },
    }
  }
  if (archetype === 'deco') {
    return {
      archetype,
      builtEra: eraOrder,
      params: {
        floors: wide || rng() < 0.5 ? 3 : 2,
        wallTint: pick(rng, DECO_WALL),
        trimTint: pick(rng, DECO_TRIM),
        awningTint: pick(rng, DECO_AWNING),
        roofTint: pick(rng, ROOF_TINTS),
      },
    }
  }
  return {
    archetype: 'postwar',
    builtEra: eraOrder,
    params: {
      floors: rng() < 0.55 ? 3 : 4,
      wallMat: 'tile',
      wallTint: pick(rng, POSTWAR_TILE),
      trimTint: '#d9d6cc',
      columnMat: 'stucco',
      columnTint: '#d6d2c8',
    },
  }
}

/** 地段在某個年代的建築狀態（樣式、建造年代與外觀參數） */
export function lotState(lot, eraOrder) {
  let state = initialState(lot)
  for (const era of ERAS) {
    if (era.order <= 1 || era.order > eraOrder) continue
    const rules = era.buildingStyle.rebuild?.[state.archetype]
    if (!rules) continue
    const roll = seeded(lot.seed, 200 + era.order)()
    let accumulated = 0
    for (const [target, probability] of Object.entries(rules)) {
      accumulated += probability
      if (roll < accumulated) {
        state = rebuiltState(lot, target, era.order)
        break
      }
    }
  }
  return state
}

/** 一般（非店家）地段在某個年代的完整建築設定 */
export function genericBuildingConfig(lot, era) {
  const state = lotState(lot, era.order)
  const style = era.buildingStyle
  const rng = seeded(lot.seed, 300 + era.order)
  const condition = state.builtEra === era.order ? 'new' : style.condition
  const arcade = state.archetype !== 'minnan'
  const storefront = state.archetype === 'postwar'
    ? pick(rng, ['open', 'open', 'closed'])
    : pick(rng, ['closed', 'half', 'half', 'open', 'open'])
  const hasSign = rng() < (arcade ? 0.82 : 0.58)
  const signText = pick(rng, style.signWords)
  const hangingChance = era.id === 'postwar' ? 0.65 : arcade ? 0.35 : 0.45
  const hasHanging = rng() < hangingChance
  const night = era.lighting.glow > 0.5
  const config = {
    archetype: state.archetype,
    ...state.params,
    width: lot.width,
    depth: lot.depth,
    seed: Math.floor(rng() * 1e9),
    condition,
    storefront,
    sign: hasSign ? { text: signText, style: pick(rng, style.signStyles) } : null,
    hangingSign: hasHanging
      ? {
          text: pick(rng, style.signWords),
          style: pick(rng, style.hangingSignStyles),
          side: rng() < 0.5 ? 'left' : 'right',
        }
      : null,
    lanterns: rng() < style.lanterns,
    banner: era.id === 'qing-port' && !arcade && rng() < style.banners ? { text: pick(rng, BANNER_WORDS) } : null,
    couplets: rng() < 0.35,
    goods: pick(rng, GOODS_BY_ERA[era.id] ?? [null]),
    litWindows: night ? 0.75 : era.lighting.glow > 0.3 ? 0.45 : 0.22,
    modernFront: condition === 'restored' && rng() < (style.modernFront ?? 0),
    tinAwning: condition === 'aged' && state.archetype === 'minnan' && rng() < 0.6,
    balconyLanterns: era.id === 'banquet' && rng() < 0.22,
    pottedPlants: era.id === 'banquet' && arcade && rng() < 0.35,
    cafe: (era.id === 'modern' && state.archetype === 'deco' && rng() < 0.5) || (era.id === 'revival' && rng() < 0.3),
    walkway: true,
  }
  if (state.archetype === 'minnan') {
    config.upper = state.params.upperBrick ? 'brick' : state.params.floors === 2 ? 'plaster' : state.params.ground
    if (lot.warehouse) {
      config.storefront = 'open'
      config.goods = era.id === 'revival' ? null : pick(rng, ['tea', 'sacks', 'crates'])
    }
  }
  if (lot.kind === 'end') config.windows = 3
  if (era.id === 'banquet') Object.assign(config, banquetVariety(lot, state))
  return config
}

const BRICK_TINTS = ['#ffffff', '#f6e6de', '#fbeee2']

/**
 * 酒樓年代的街景變化（只影響這個年代，使用獨立的亂數序列，其他年代的建築完全不變）：
 * - 洋樓分成紅磚與灰泥兩種立面，窗型與山頭也各有不同
 * - 燈籠大小、高度與數量不一，避免整排一模一樣
 * - 少數店家在騎樓前掛布幡
 */
function banquetVariety(lot, state) {
  const rng = seeded(lot.seed, 900)
  const variety = {
    ornate: true,
    lanternScale: 0.8 + rng() * 0.32,
    lanternDrop: rng() * 0.38,
    lanternCount: rng() < 0.45 ? 1 : 2,
    banner: rng() < 0.24 ? { text: pick(rng, BANNER_WORDS) } : null,
  }
  if (state.archetype === 'baroque') {
    const brick = rng() < 0.5
    variety.facade = brick ? 'brick' : 'stucco'
    variety.brickTint = pick(rng, BRICK_TINTS)
    variety.windowStyles = brick ? pick(rng, [['rect', 'arch'], ['segment', 'rect'], ['segment', 'segment']]) : pick(rng, [['arch', 'arch'], ['arch', 'rect']])
    if (brick) variety.parapet = 'balustrade'
  }
  return variety
}
