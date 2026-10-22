import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { transitionState } from '../transition.js'
import { QUALITY_MODES } from '../quality.js'
import { playerState } from '../runtime.js'
import { getInteriorMaterials } from '../rendering/materials.js'
import { interiorAmount } from '../viewerCamera.js'
import { getLoadedInterior, getLoadedInteriorDetail, loadEraInterior } from '../world/worldManager.js'
import { useGameStore } from '../../state/useGameStore.js'
import { GlowLayer } from './GlowLayer.jsx'
import { CatLayer } from './LaoPanCat.jsx'
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
 * 一棟可以走進去的建築的室內細部（例如永樂市場一樓的攤位、天花板設備與吊牌）：
 * 角色接近這棟建築時才產生（建築觀賞模式也看鏡頭的位置；從店家名錄前往裡面的店家時也會產生），離開一段距離後不再繪製。
 * 開始探索之前（開場的鳥瞰鏡頭）不產生。每棟建築各自產生與顯示，接近一棟不會連帶產生另一棟。
 * 跟著這個年代的街景快取與釋放；其他年代沒有室內，也就不會產生或繪製。
 * 不投射也不接收陰影，改用略為自發光的材質，看起來像被室內的燈均勻照亮。
 */
function InteriorZone({ world, zone, detail }) {
  const [batches, setBatches] = useState(() => getLoadedInterior(world, zone))
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
    let nearest = distanceToRect(zone, p.x, p.z)
    if (viewMode === 'viewer') nearest = Math.min(nearest, distanceToRect(zone, camera.position.x, camera.position.z))
    const travelInside =
      travel && world.shopModels.some((model) => model.shop.id === travel.shopId && (model.shop.inside === zone.id || model.shop.id === zone.id))
    // 角色已經在另一棟建築的室內（例如在爐鍋咖啡的二樓、永樂市場裡）：這一棟的室內看不到，不繪製，也先不產生
    const here = viewMode === 'explore' ? interiorAmount(p, world.interiors, playerState.level) : null
    const elsewhere = Boolean(here && here.amount >= 0.999 && here.zone.id !== zone.id)
    if (started && !state.requested && !elsewhere && (nearest < zone.loadRadius || travelInside) && clock.elapsedTime >= state.retryAt) {
      state.requested = true
      loadEraInterior(world, zone)
        .then((loaded) => {
          if (state.mounted && loaded) setBatches(loaded)
        })
        .catch((error) => {
          console.warn(`[大稻埕食光街] ${zone.id} 室內產生失敗，稍後再試：`, error)
          state.requested = false
          state.retryAt = clock.elapsedTime + INTERIOR_RETRY
        })
    }
    state.visible = nearest < zone.showRadius && !elsewhere
    if (group.current) group.current.visible = state.visible
    if (import.meta.env.DEV && window.__DDC__) {
      window.__DDC__.interiors ??= {}
      window.__DDC__.interiors[zone.id] = { requested: state.requested, loaded: Boolean(group.current), visible: Boolean(group.current?.visible) }
    }
  })

  if (!batches) return null
  const small = getLoadedInteriorDetail(world, zone)
  return (
    <group ref={group} name={`interior-${zone.id}`}>
      <StaticBatches batches={batches} materials={getInteriorMaterials()} castShadow={false} receiveShadow={false} dispose={false} />
      {/* 細小的擺飾：精緻模式才顯示 */}
      {small.length > 0 && (
        <group name={`interior-${zone.id}-detail`} visible={detail}>
          <StaticBatches batches={small} materials={getInteriorMaterials()} castShadow={false} receiveShadow={false} dispose={false} />
        </group>
      )}
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
      {(world.interiors ?? []).map((zone) => (
        <InteriorZone key={zone.id} world={world} zone={zone} detail={detail} />
      ))}
      <SignLayer signs={world.signs} banners={world.banners} />
      <LanternLayer lanterns={world.lanterns} />
      <TextLanterns lanterns={world.textLanterns} />
      <GlowLayer glows={world.glows} pools={world.pools} />
      <SteamLayer steam={world.steam} />
      {/* 店裡的小動物（老潘的黑白貓）：跟著這個年代的街景掛載與卸載 */}
      <CatLayer cats={world.cats} />
    </group>
  )
}
