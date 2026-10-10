import { useLayoutEffect } from 'react'
import { transitionState } from '../transition.js'
import { GlowLayer } from './GlowLayer.jsx'
import { LanternLayer } from './LanternLayer.jsx'
import { SignLayer } from './SignLayer.jsx'
import { StaticBatches } from './StaticBatches.jsx'
import { SteamLayer } from './SteamLayer.jsx'
import { TextLanterns } from './StoreMarkers.jsx'

/**
 * 一個年代的街景：合併後的靜態網格、招牌與布幡、燈籠、燈火、蒸氣。
 * 靜態網格由 worldManager 快取與釋放；其餘衍生資源隨元件卸載而釋放。
 */
export function EraScene({ world }) {
  useLayoutEffect(() => {
    transitionState.mountedEraId = world.eraId
  }, [world])

  return (
    <group name={`era-${world.eraId}`}>
      <StaticBatches batches={world.batches} dispose={false} />
      <SignLayer signs={world.signs} banners={world.banners} />
      <LanternLayer lanterns={world.lanterns} />
      <TextLanterns lanterns={world.textLanterns} />
      <GlowLayer glows={world.glows} pools={world.pools} />
      <SteamLayer steam={world.steam} />
    </group>
  )
}
