import { PALETTE } from './config.js'
import { CameraRig } from './components/CameraRig.jsx'
import { InteractionSystem } from './components/InteractionSystem.jsx'
import { Lighting } from './components/Lighting.jsx'
import { Mountains } from './components/Mountains.jsx'
import { Player } from './components/Player.jsx'
import { River } from './components/River.jsx'
import { ShopBuilding } from './components/ShopBuilding.jsx'
import { SignBoards } from './components/SignBoards.jsx'
import { Sky } from './components/Sky.jsx'
import { StaticBatches } from './components/StaticBatches.jsx'
import { ToonRenderer } from './rendering/ToonRenderer.jsx'

/** 3D 場景組合 */
export function World({ world, promptLayer }) {
  return (
    <>
      <fog attach="fog" args={[PALETTE.haze, 50, 430]} />
      <ToonRenderer />
      <Lighting />
      <Sky />
      <Mountains />
      <River />
      <StaticBatches batches={world.batches} />
      <SignBoards signs={world.signs} />
      {world.shopModels.map((model) => (
        <ShopBuilding key={model.shop.id} model={model} promptLayer={promptLayer} />
      ))}
      <Player collision={world.collision} shopModels={world.shopModels} />
      <CameraRig blockers={world.blockers} shopModels={world.shopModels} />
      <InteractionSystem shopModels={world.shopModels} />
    </>
  )
}
