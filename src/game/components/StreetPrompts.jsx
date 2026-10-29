import { Html } from '@react-three/drei'
import { inspectablesOfEra } from '../../data/inspectObjects.js'
import { talkForNpc } from '../../data/talk.js'
import { useGameStore } from '../../state/useGameStore.js'

/**
 * 街上的互動提示（第 10 階段）：
 * - 有對話的路人：走近時頭上浮現「交談」提示（身分與正在做的事）
 * - 街上可以近看的器物：走近時浮現「近看」提示
 * 做法同店家的 ShopPrompt（drei Html 投影到 3D 位置，掛在 promptLayer）。
 */
function TalkPrompt({ npc, talk }) {
  const visible = useGameStore(
    (state) =>
      state.started &&
      state.mode === 'explore' &&
      state.viewMode === 'explore' &&
      !state.transitioning &&
      !state.talk &&
      !state.inspect &&
      state.nearbyTalkNpcId === npc.id,
  )
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const startTalk = useGameStore((state) => state.startTalk)
  return (
    <div className={`shop-prompt street-prompt${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && startTalk(npc.id)}
      >
        <span className="shop-prompt__name">{talk.role}</span>
        <span className="shop-prompt__meta">{talk.doing}</span>
        <span className="shop-prompt__action">{touch ? '點一下交談' : <>按 <kbd>E</kbd> 交談</>}</span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}

function InspectPrompt({ item }) {
  const visible = useGameStore(
    (state) =>
      state.started &&
      state.mode === 'explore' &&
      state.viewMode === 'explore' &&
      !state.transitioning &&
      !state.talk &&
      !state.inspect &&
      state.nearbyInspectableId === item.id,
  )
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const openInspect = useGameStore((state) => state.openInspect)
  return (
    <div className={`shop-prompt street-prompt${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && openInspect(item.objectId, 'street')}
      >
        <span className="shop-prompt__name">{item.label}</span>
        <span className="shop-prompt__action">{touch ? '點一下近看' : <>按 <kbd>E</kbd> 近看</>}</span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}

export function StreetPrompts({ npcs, eraId, promptLayer }) {
  const talkables = npcs.filter((npc) => !npc.zone && talkForNpc(eraId, npc.id))
  const inspectables = inspectablesOfEra(eraId)
  return (
    <>
      {talkables.map((npc) => (
        <Html
          key={npc.id}
          position={[npc.position[0], 2.1, npc.position[2]]}
          portal={promptLayer}
          zIndexRange={[12, 0]}
          pointerEvents="none"
        >
          <TalkPrompt npc={npc} talk={talkForNpc(eraId, npc.id)} />
        </Html>
      ))}
      {inspectables.map((item) => (
        <Html key={item.id} position={item.prompt} portal={promptLayer} zIndexRange={[12, 0]} pointerEvents="none">
          <InspectPrompt item={item} />
        </Html>
      ))}
    </>
  )
}
