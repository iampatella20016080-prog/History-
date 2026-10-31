import { useMemo } from 'react'
import { CameraRig } from './components/CameraRig.jsx'
import { EraDirector } from './components/EraDirector.jsx'
import { EraScene } from './components/EraScene.jsx'
import { InteractionSystem } from './components/InteractionSystem.jsx'
import { Lighting, SceneFog } from './components/Lighting.jsx'
import { Mountains } from './components/Mountains.jsx'
import { ObjectStage } from './components/ObjectStage.jsx'
import { Player } from './components/Player.jsx'
import { RouteGuides } from './components/RouteGuides.jsx'
import { StreetPrompts } from './components/StreetPrompts.jsx'
import { River } from './components/River.jsx'
import { Sky } from './components/Sky.jsx'
import { WeatherDirector } from './components/Weather.jsx'
import { StoreMarkers } from './components/StoreMarkers.jsx'
import { ToonRenderer } from './rendering/ToonRenderer.jsx'
import { viewerSpaceOf } from './viewerCamera.js'

/**
 * 3D 場景組合。
 * 天空、光線、遠山與河面由年代氛圍驅動；EraScene 是目前年代的街景，
 * 切換年代時由 EraDirector 在霧氣中換成新的街景。
 */
export function World({ world, promptLayer, onSwap }) {
  const viewerSpace = useMemo(() => viewerSpaceOf(world), [world])
  return (
    <>
      <SceneFog />
      <ToonRenderer />
      <Lighting />
      <Sky />
      <Mountains />
      <River eraId={world.eraId} />
      <EraDirector onSwap={onSwap} />
      <EraScene key={world.eraId} world={world} />
      {/* 天氣（雨天）：只在精緻畫質，流暢畫質不掛載任何東西 */}
      <WeatherDirector world={world} />
      <StoreMarkers shopModels={world.shopModels} promptLayer={promptLayer} />
      <StreetPrompts npcs={world.npcs ?? []} eraId={world.eraId} promptLayer={promptLayer} />
      <RouteGuides world={world} />
      <ObjectStage />
      <Player collision={world.collision} shopModels={world.shopModels} />
      <CameraRig
        eraId={world.eraId}
        blockers={world.blockers}
        buildings={world.buildings}
        shopModels={world.shopModels}
        interiors={world.interiors}
        followAreas={world.followAreas}
        viewerSpace={viewerSpace}
      />
      <InteractionSystem shopModels={world.shopModels} npcs={world.npcs ?? []} eraId={world.eraId} />
    </>
  )
}
