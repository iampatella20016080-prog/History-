import { GameCanvas } from './game/GameCanvas.jsx'
import { DialogueBox } from './ui/DialogueBox.jsx'
import { Hud } from './ui/Hud.jsx'
import { InspectOverlay } from './ui/InspectOverlay.jsx'
import { IntroOverlay } from './ui/IntroOverlay.jsx'
import { StoryModal } from './ui/story/StoryModal.jsx'
import { useDeviceGuards } from './ui/useDeviceGuards.js'
import { useEraDocumentState } from './ui/useEraDocumentState.js'
import { useGameKeyboard } from './ui/useGameKeyboard.js'

export default function App() {
  useGameKeyboard()
  useDeviceGuards()
  useEraDocumentState()
  return (
    <div className="app">
      <GameCanvas />
      <Hud />
      <StoryModal />
      <DialogueBox />
      <InspectOverlay />
      <IntroOverlay />
    </div>
  )
}
