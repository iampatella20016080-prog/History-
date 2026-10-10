import { CameraRig } from './components/CameraRig.jsx'
import { EraDirector } from './components/EraDirector.jsx'
import { EraScene } from './components/EraScene.jsx'
import { InteractionSystem } from './components/InteractionSystem.jsx'
import { Lighting, SceneFog } from './components/Lighting.jsx'
import { Mountains } from './components/Mountains.jsx'
import { Player } from './components/Player.jsx'
import { River } from './components/River.jsx'
import { Sky } from './components/Sky.jsx'
import { StoreMarkers } from './components/StoreMarkers.jsx'
import { ToonRenderer } from './rendering/ToonRenderer.jsx'

/**
 * 3D 場景組合。
 * 天空、光線、遠山與河面由年代氛圍驅動；EraScene 是目前年代的街景，
 * 切換年代時由 EraDirector 在霧氣中換成新的街景。
 */
export function World({ world, promptLayer, onSwap }) {
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
      <StoreMarkers shopModels={world.shopModels} promptLayer={promptLayer} />
      <Player collision={world.collision} shopModels={world.shopModels} />
      <CameraRig blockers={world.blockers} shopModels={world.shopModels} />
      <InteractionSystem shopModels={world.shopModels} />
    </>
  )
}
