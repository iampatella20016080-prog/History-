import { Vector3 } from 'three'
import { getEra } from '../../data/eras.js'
import { getShop } from '../../data/shops.js'
import { eraWorldSteps } from './buildWorld.js'
import { getShopPlacement } from './placement.js'
import { unpackWorld } from './worldPacking.js'

/**
 * 年代街景管理：
 * - 在 Web Worker 中產生街景（不支援時退回主執行緒分段產生）
 * - 最多快取兩個年代（目前顯示中＋最近使用），其餘釋放 GPU 資源
 * - 閒置時預先產生下一個年代，讓切換更流暢
 */
const MAX_CACHED = 2
const SLICE_BUDGET = 7 // 主執行緒分段產生時，每段最多佔用的毫秒數

const cache = new Map() // eraId → { promise, world, lastUsed }
let displayedEraId = null
let worker = null
let workerBroken = false
let requestId = 0
const pending = new Map()

function getWorker() {
  if (workerBroken || typeof Worker === 'undefined') return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('./world.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const { id, ok, world, error } = event.data
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
  } catch (error) {
    failWorker(error)
  }
  return worker
}

function failWorker(error) {
  if (import.meta.env.DEV) console.warn('[大稻埕食光街] 背景產生街景失敗，改用主執行緒：', error)
  workerBroken = true
  worker?.terminate()
  worker = null
  for (const request of pending.values()) request.fallback()
  pending.clear()
}

const nextFrame = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => setTimeout(resolve, 0))
    else setTimeout(resolve, 16)
  })

/** 主執行緒分段產生（每段約 7 毫秒，之後讓出給畫面更新） */
async function buildOnMainThread(eraId) {
  const steps = eraWorldSteps(eraId)
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

function buildRaw(eraId) {
  const target = getWorker()
  if (!target) return buildOnMainThread(eraId)
  return new Promise((resolve, reject) => {
    const id = ++requestId
    pending.set(id, {
      resolve: (payload) => resolve(unpackWorld(payload)),
      reject: (error) => {
        if (import.meta.env.DEV) console.warn('[大稻埕食光街] 背景產生街景錯誤：', error)
        buildOnMainThread(eraId).then(resolve, reject)
      },
      fallback: () => buildOnMainThread(eraId).then(resolve, reject),
    })
    target.postMessage({ id, eraId })
  })
}

function toVector(point) {
  return new Vector3(point[0], point[1], point[2])
}

/** 補上主執行緒才需要的資料：店家（含互動位置與鏡頭構圖） */
function hydrate(raw) {
  const era = getEra(raw.eraId)
  const shopModels = []
  for (const id of era.availableStores) {
    const shop = getShop(id)
    const store = raw.stores[id]
    if (!shop || !store) continue
    shopModels.push({
      shop,
      placement: getShopPlacement(shop),
      anchors: { prompt: toVector(store.anchors.prompt), marker: toVector(store.anchors.marker) },
    })
  }
  return { ...raw, era, shopModels }
}

function disposeWorld(world) {
  world?.batches.forEach(({ geometry }) => geometry.dispose())
}

function evict() {
  if (cache.size <= MAX_CACHED) return
  const candidates = [...cache.entries()]
    .filter(([id, entry]) => id !== displayedEraId && entry.world)
    .sort((a, b) => a[1].lastUsed - b[1].lastUsed)
  while (cache.size > MAX_CACHED && candidates.length) {
    const [id, entry] = candidates.shift()
    cache.delete(id)
    disposeWorld(entry.world)
  }
}

/** 取得某年代的街景（已快取則立即回傳） */
export function loadEraWorld(eraId) {
  let entry = cache.get(eraId)
  if (!entry) {
    entry = { world: null, lastUsed: performance.now(), promise: null }
    const startTime = performance.now()
    entry.promise = buildRaw(eraId).then((raw) => {
      entry.world = hydrate(raw)
      if (import.meta.env.DEV) {
        const where = raw.buildTime != null ? `背景 ${raw.buildTime.toFixed(0)} ms` : '主執行緒'
        console.info(`[大稻埕食光街] ${eraId} 街景完成：${(performance.now() - startTime).toFixed(0)} ms（${where}）`)
      }
      evict()
      return entry.world
    })
    entry.promise.catch(() => cache.delete(eraId))
    cache.set(eraId, entry)
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
