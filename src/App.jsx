import { GameCanvas } from './game/GameCanvas.jsx'
import { Hud } from './ui/Hud.jsx'
import { IntroOverlay } from './ui/IntroOverlay.jsx'
import { StoryModal } from './ui/story/StoryModal.jsx'
import { useGameKeyboard } from './ui/useGameKeyboard.js'

export default function App() {
  useGameKeyboard()
  return (
    <div className="app">
      <GameCanvas />
      <Hud />
      <StoryModal />
      <IntroOverlay />
    </div>
  )
}
