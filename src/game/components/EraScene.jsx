import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { transitionState } from '../transition.js'
import { QUALITY_MODES } from '../quality.js'
import { playerState } from '../runtime.js'
import { getInteriorMaterials } from '../rendering/materials.js'
import { loadEraInterior } from '../world/worldManager.js'
import { useGameStore } from '../../state/useGameStore.js'
import { GlowLayer } from './GlowLayer.jsx'
import { LanternLayer } from './LanternLayer.jsx'
import { SignLayer } from './SignLayer.jsx'
import { StaticBatches } from './StaticBatches.jsx'
import { SteamLayer } from './SteamLayer.jsx'
import { TextLanterns } from './StoreMarkers.jsx'

/** 室內產生失敗時，隔多久再試一次（秒） */
const INTERIOR_RETRY = 5

/** 點到矩形範圍的水平距離（在範圍內為 0） */
function distanceToRect(r, x, z) {
  return Math.hypot(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minZ - z, 0, z - r.maxZ))
}

/**
 * 可以走進去的建築的室內細部（永樂市場一樓的攤位、天花板設備與吊牌）：
 * 角色接近時才產生（建築觀賞模式也看鏡頭的位置；從店家名錄前往裡面的攤位時也會產生），離開一段距離後不再繪製。
 * 開始探索之前（開場的鳥瞰鏡頭）不產生。
 * 跟著這個年代的街景快取與釋放；其他年代沒有室內，也就不會產生或繪製。
 * 不投射也不接收陰影，改用略為自發光的材質，看起來像被日光燈均勻照亮。
 */
function InteriorLayer({ world }) {
  const [batches, setBatches] = useState(() => world.interior?.batches ?? null)
  const group = useRef()
  const status = useRef({ requested: false, retryAt: 0, visible: false, mounted: true })

  useEffect(() => {
    const state = status.current
    state.mounted = true
    return () => {
      state.mounted = false
    }
  }, [])

  useFrame(({ camera, clock }) => {
    const state = status.current
    const p = playerState.position
    const { started, viewMode, travel } = useGameStore.getState()
    // 探索時鏡頭就在角色附近，看角色的位置；觀賞模式的鏡頭可以自由移動，也看鏡頭的位置
    const useCamera = viewMode === 'viewer'
    let nearest = Infinity
    let loadRadius = 0
    let showRadius = 0
    for (const zone of world.interiors) {
      let d = distanceToRect(zone, p.x, p.z)
      if (useCamera) d = Math.min(d, distanceToRect(zone, camera.position.x, camera.position.z))
      if (d < nearest) {
        nearest = d
        loadRadius = zone.loadRadius
        showRadius = zone.showRadius
      }
    }
    const travelInside = travel && world.shopModels.some((model) => model.shop.id === travel.shopId && model.shop.inside)
    if (started && !state.requested && (nearest < loadRadius || travelInside) && clock.elapsedTime >= state.retryAt) {
      state.requested = true
      loadEraInterior(world)
        .then((loaded) => {
          if (state.mounted && loaded) setBatches(loaded)
        })
        .catch((error) => {
          console.warn('[大稻埕食光街] 室內產生失敗，稍後再試：', error)
          state.requested = false
          state.retryAt = clock.elapsedTime + INTERIOR_RETRY
        })
    }
    state.visible = nearest < showRadius
    if (group.current) group.current.visible = state.visible
    if (import.meta.env.DEV && window.__DDC__) {
      window.__DDC__.interior = { requested: state.requested, loaded: Boolean(group.current), visible: Boolean(group.current?.visible) }
    }
  })

  if (!batches) return null
  return (
    <group ref={group} name="interior">
      <StaticBatches batches={batches} materials={getInteriorMaterials()} castShadow={false} receiveShadow={false} dispose={false} />
    </group>
  )
}

/**
 * 一個年代的街景：合併後的靜態網格、招牌與布幡、燈籠、燈火、蒸氣，以及可以走進去的建築的室內。
 * 靜態網格由 worldManager 快取與釋放；其餘衍生資源隨元件卸載而釋放。
 */
export function EraScene({ world }) {
  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail ?? true)
  // 通知轉場狀態機：這個年代的街景已經掛載到場景中
  useLayoutEffect(() => {
    transitionState.mountedWorld = world
    transitionState.mountedEraId = world.eraId
    if (typeof document !== 'undefined') document.documentElement.dataset.sceneEra = world.eraId
  }, [world])

  return (
    <group name={`era-${world.eraId}`}>
      <StaticBatches batches={world.batches} dispose={false} />
      {/* 遠景與節慶裝飾：精緻模式才顯示 */}
      <group visible={detail}>
        <StaticBatches batches={world.detailBatches ?? []} dispose={false} />
      </group>
      {world.interiors?.length > 0 && <InteriorLayer world={world} />}
      <SignLayer signs={world.signs} banners={world.banners} />
      <LanternLayer lanterns={world.lanterns} />
      <TextLanterns lanterns={world.textLanterns} />
      <GlowLayer glows={world.glows} pools={world.pools} />
      <SteamLayer steam={world.steam} />
    </group>
  )
}
