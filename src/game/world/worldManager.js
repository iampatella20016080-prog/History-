import { Vector3 } from 'three'
import { getEra } from '../../data/eras.js'
import { getShop } from '../../data/shops.js'
import { eraInteriorSteps, eraWorldSteps } from './buildWorld.js'
import { getShopPlacement } from './placement.js'
import { unpackInterior, unpackWorld } from './worldPacking.js'

/**
 * 年代街景管理：
 * - 在 Web Worker 中產生街景；不支援、出錯或逾時沒有回應時，改在主執行緒分段產生
 * - 最多快取兩個年代（目前顯示中＋最近使用），其餘釋放 GPU 資源；
 *   轉場進行中的起點與目標年代會被鎖定（retain），不會在轉場途中被釋放
 * - 閒置時預先產生下一個年代，讓切換更流暢
 * - 產生失敗的年代不會留在快取中，下次切換會重新產生
 */
const MAX_CACHED = 2
const SLICE_BUDGET = 7 // 主執行緒分段產生時，每段最多佔用的毫秒數
const DEV = Boolean(import.meta.env?.DEV)

const config = {
  workerTimeout: 20000, // Web Worker 多久沒有回應視為失敗（毫秒）
}

const cache = new Map() // eraId → { promise, world, lastUsed }
const retained = new Map() // eraId → 鎖定次數
let displayedEraId = null
let worker = null
// 網址加上 ?worker=0 可停用背景產生（除錯與測試主執行緒的備援流程）
let workerBroken = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('worker') === '0'
let requestId = 0
const pending = new Map()

function getWorker() {
  if (workerBroken || typeof Worker === 'undefined') return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('./world.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const { id, ok, world, error } = event.data ?? {}
      const request = pending.get(id)
      if (!request) return
      pending.delete(id)
      if (ok) request.resolve(world)
      else request.reject(new Error(error))
    }
    worker.onerror = (event) => {
      event.preventDefault?.()
      failWorker(new Error(event.message || 'world worker error'))
    }
    worker.onmessageerror = () => failWorker(new Error('world worker message error'))
  } catch (error) {
    failWorker(error)
  }
  return worker
}

/** Web Worker 無法使用：之後一律改在主執行緒產生，等待中的請求也立即改走主執行緒 */
function failWorker(error) {
  if (DEV) console.warn('[大稻埕食光街] 背景產生街景失敗，改用主執行緒：', error)
  workerBroken = true
  const broken = worker
  worker = null
  try {
    broken?.terminate()
  } catch {
    // 忽略
  }
  const requests = [...pending.values()]
  pending.clear()
  for (const request of requests) request.fallback()
}

const nextFrame = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => setTimeout(resolve, 0))
    else setTimeout(resolve, 16)
  })

/** 主執行緒分段產生（每段約 7 毫秒，之後讓出給畫面更新）；kind：world 街景、interior 室內細部（building 那棟建築） */
async function buildOnMainThread(eraId, kind = 'world', building = null) {
  const steps = kind === 'interior' ? eraInteriorSteps(eraId, building) : eraWorldSteps(eraId)
  let sliceStart = performance.now()
  for (;;) {
    const step = steps.next()
    if (step.done) return step.value
    if (performance.now() - sliceStart > SLICE_BUDGET) {
      await nextFrame()
      sliceStart = performance.now()
    }
  }
}

function buildRaw(eraId, kind = 'world', building = null) {
  const target = getWorker()
  if (!target) return buildOnMainThread(eraId, kind, building)
  const unpack = kind === 'interior' ? unpackInterior : unpackWorld
  return new Promise((resolve, reject) => {
    const id = ++requestId
    let settled = false
    const settle = (fn) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }
    const fallback = () => settle(() => buildOnMainThread(eraId, kind, building).then(resolve, reject))
    // 背景執行緒遲遲沒有回應（例如被系統終止）：視為失敗，改走主執行緒
    const timer = setTimeout(() => {
      if (pending.has(id)) failWorker(new Error(`world worker timeout: ${eraId}`))
    }, config.workerTimeout)
    pending.set(id, {
      resolve: (payload) =>
        settle(() => {
          try {
            resolve(unpack(payload))
          } catch (error) {
            reject(error)
          }
        }),
      reject: (error) => {
        if (DEV) console.warn('[大稻埕食光街] 背景產生街景錯誤，改用主執行緒：', error)
        fallback()
      },
      fallback,
    })
    try {
      target.postMessage({ id, eraId, kind, building })
    } catch (error) {
      failWorker(error)
    }
  })
}

function toVector(point) {
  return new Vector3(point[0], point[1], point[2])
}

/** 補上主執行緒才需要的資料：店家（含互動位置與鏡頭構圖） */
function hydrate(raw) {
  const era = getEra(raw.eraId)
  if (!era) throw new Error(`未知的年代：${raw.eraId}`)
  const shopModels = []
  for (const id of era.availableStores) {
    const shop = getShop(id)
    const store = raw.stores[id]
    if (!shop || !store) continue
    shopModels.push({
      shop,
      placement: getShopPlacement(shop),
      anchors: {
        prompt: toVector(store.anchors.prompt),
        marker: toVector(store.anchors.marker),
        markerScale: store.anchors.markerScale ?? 1,
      },
    })
  }
  return { ...raw, era, shopModels }
}

function disposeWorld(world) {
  world?.batches.forEach(({ geometry }) => geometry.dispose())
  world?.detailBatches?.forEach(({ geometry }) => geometry.dispose())
  for (const state of Object.values(world?.interior ?? {})) {
    state.disposed = true
    state.batches?.forEach(({ geometry }) => geometry.dispose())
  }
  if (world) world.interior = null
}

/**
 * 室內細部（按需載入）：角色接近某棟可以走進去的建築時，才產生這棟建築的室內（背景執行緒，不行時改走主執行緒），
 * 產生後跟著這個年代的街景一起快取與釋放。zone 為 world.interiors 裡的室內範圍；沒有室內時回傳 null。
 */
export function loadEraInterior(world, zone = world?.interiors?.[0]) {
  if (!zone) return Promise.resolve(null)
  const key = zone.building ?? zone.id
  world.interior ??= {}
  if (world.interior[key]?.promise) return world.interior[key].promise
  const state = { promise: null, batches: null, disposed: false }
  world.interior[key] = state
  const startTime = performance.now()
  state.promise = Promise.resolve()
    .then(() => buildRaw(world.eraId, 'interior', zone.building ?? null))
    .then((raw) => {
      if (state.disposed) {
        raw.batches.forEach(({ geometry }) => geometry.dispose())
        return null
      }
      state.batches = raw.batches
      if (DEV) console.info(`[大稻埕食光街] ${world.eraId}／${zone.id} 室內完成：${(performance.now() - startTime).toFixed(0)} ms`)
      return raw.batches
    })
  state.promise.catch(() => {
    if (world.interior?.[key] === state) delete world.interior[key]
  })
  return state.promise
}

/** 已經產生完成的某棟建築的室內（沒有則回傳 null） */
export function getLoadedInterior(world, zone) {
  return world?.interior?.[zone.building ?? zone.id]?.batches ?? null
}

/** 超過快取上限時，釋放最久沒用到、而且沒有顯示或鎖定中的年代 */
function evict() {
  if (cache.size <= MAX_CACHED) return
  const candidates = [...cache.entries()]
    .filter(([id, entry]) => id !== displayedEraId && !retained.has(id) && entry.world)
    .sort((a, b) => a[1].lastUsed - b[1].lastUsed)
  while (cache.size > MAX_CACHED && candidates.length) {
    const [id, entry] = candidates.shift()
    cache.delete(id)
    disposeWorld(entry.world)
  }
}

/** 取得某年代的街景（已快取則立即回傳；產生失敗時 Promise 會被拒絕，且不留在快取中） */
export function loadEraWorld(eraId) {
  let entry = cache.get(eraId)
  if (!entry) {
    const created = { world: null, lastUsed: performance.now(), promise: null }
    entry = created
    const startTime = performance.now()
    created.promise = Promise.resolve()
      .then(() => buildRaw(eraId))
      .then((raw) => {
        created.world = hydrate(raw)
        if (DEV) {
          const where = raw.buildTime != null ? `背景 ${raw.buildTime.toFixed(0)} ms` : '主執行緒'
          console.info(`[大稻埕食光街] ${eraId} 街景完成：${(performance.now() - startTime).toFixed(0)} ms（${where}）`)
        }
        evict()
        return created.world
      })
    created.promise.catch(() => {
      if (cache.get(eraId) === created) cache.delete(eraId)
    })
    cache.set(eraId, created)
  }
  entry.lastUsed = performance.now()
  return entry.promise
}

/** 已經產生完成的街景（沒有則回傳 null） */
export function getCachedEraWorld(eraId) {
  return cache.get(eraId)?.world ?? null
}

/** 標記目前顯示的年代（不會被釋放） */
export function setDisplayedEra(eraId) {
  displayedEraId = eraId
  const entry = cache.get(eraId)
  if (entry) entry.lastUsed = performance.now()
  evict()
}

/** 鎖定某年代的街景（轉場進行中使用），鎖定期間不會被釋放 */
export function retainEraWorld(eraId) {
  if (!eraId) return
  retained.set(eraId, (retained.get(eraId) ?? 0) + 1)
}

/** 解除鎖定 */
export function releaseEraWorld(eraId) {
  if (!eraId || !retained.has(eraId)) return
  const count = retained.get(eraId) - 1
  if (count > 0) retained.set(eraId, count)
  else retained.delete(eraId)
  evict()
}

/** 閒置時預先產生某個年代 */
export function prefetchEraWorld(eraId, delay = 1800) {
  if (!eraId || cache.has(eraId)) return () => {}
  const run = () => {
    if (!cache.has(eraId) && pending.size === 0) loadEraWorld(eraId).catch(() => {})
  }
  if (typeof requestIdleCallback === 'function') {
    let idleId = null
    const timer = setTimeout(() => {
      idleId = requestIdleCallback(run, { timeout: 4000 })
    }, delay)
    return () => {
      clearTimeout(timer)
      if (idleId !== null) cancelIdleCallback(idleId)
    }
  }
  const timer = setTimeout(run, delay + 600)
  return () => clearTimeout(timer)
}

/* ───────────── 測試用 ───────────── */

/** 調整設定（測試時縮短 Web Worker 逾時） */
export function configureWorldManager(options) {
  Object.assign(config, options)
}

/** 清空快取與狀態（只供自動化測試使用） */
export function resetWorldManager() {
  for (const entry of cache.values()) disposeWorld(entry.world)
  cache.clear()
  retained.clear()
  pending.clear()
  displayedEraId = null
  try {
    worker?.terminate()
  } catch {
    // 忽略
  }
  worker = null
  workerBroken = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('worker') === '0'
}

/** 目前的快取狀態（只供自動化測試使用） */
export function inspectWorldManager() {
  return {
    cached: [...cache.keys()],
    retained: Object.fromEntries(retained),
    displayed: displayedEraId,
    workerBroken,
    pending: pending.size,
  }
}
