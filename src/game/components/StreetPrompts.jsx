import { Html } from '@react-three/drei'
import { inspectablesOfEra } from '../../data/inspectObjects.js'
import { talkForNpc } from '../../data/talk.js'
import { BOARDING_SPOTS, QING_BOARDING_ERA } from '../../data/qingBoardingLayout.js'
import { useGameStore } from '../../state/useGameStore.js'
import { useLocalizer, useT } from '../../i18n/useT.js'

/**
 * 街上的互動提示（第 10 階段）：
 * - 有對話的路人：走近時頭上浮現「交談」提示（身分與正在做的事）
 * - 街上可以近看的器物：走近時浮現「近看」提示
 * 做法同店家的 ShopPrompt（drei Html 投影到 3D 位置，掛在 promptLayer）。
 */
function TalkPrompt({ npc, talk: zhTalk, spot: zhSpot = null }) {
  const t = useT()
  const L = useLocalizer()
  const talk = L(zhTalk)
  const spot = L(zhSpot)
  // 清末搭船：人物旁的搭船點（駁船船夫、舵工）併在這張卡上，點了就出發
  const boardingVisible = useGameStore((state) => Boolean(spot) && state.nearbyBoardingId === spot.id)
  const requestBoarding = useGameStore((state) => state.requestBoarding)
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
      {spot && (
        <button
          type="button"
          className={`boarding-inline paper${visible && boardingVisible ? ' is-visible' : ''}`}
          data-boarding={spot.id}
          tabIndex={visible && boardingVisible ? 0 : -1}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => visible && boardingVisible && requestBoarding(spot.action)}
        >
          <span className="boarding-inline__label">{spot.label}</span>
          {spot.note}
        </button>
      )}
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && startTalk(npc.id)}
      >
        <span className="shop-prompt__name">{talk.role}</span>
        <span className="shop-prompt__meta">{talk.doing}</span>
        <span className="shop-prompt__action">{touch ? t('street.tapTalk') : <>{t('street.pressTalkPre')}<kbd>E</kbd>{t('street.pressTalkPost')}</>}</span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}

function InspectPrompt({ item: zhItem }) {
  const t = useT()
  const L = useLocalizer()
  const item = L(zhItem)
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
        <span className="shop-prompt__action">{touch ? t('street.tapLook') : <>{t('street.pressLookPre')}<kbd>E</kbd>{t('street.pressLookPost')}</>}</span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}

/** 清末搭船：棧橋頭的駁船「搭船」、甲板舷梯口的「回棧橋」提示（旁邊的人物在範圍裡時併在他的卡上，這張不出現） */
function BoardingPrompt({ spot: zhSpot }) {
  const t = useT()
  const L = useLocalizer()
  const spot = L(zhSpot)
  const visible = useGameStore(
    (state) =>
      state.started &&
      state.mode === 'explore' &&
      state.viewMode === 'explore' &&
      !state.transitioning &&
      !state.talk &&
      !state.inspect &&
      state.nearbyTalkNpcId !== spot.npcId &&
      state.nearbyBoardingId === spot.id,
  )
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const requestBoarding = useGameStore((state) => state.requestBoarding)
  const board = spot.action === 'board'
  return (
    <div className={`shop-prompt street-prompt boarding-prompt${visible ? ' is-visible' : ''}`} aria-hidden={!visible} data-boarding={spot.id}>
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && requestBoarding(spot.action)}
      >
        <span className="shop-prompt__name">{spot.label}</span>
        <span className="shop-prompt__meta">{spot.note}</span>
        <span className="shop-prompt__action">
          {touch ? (
            t(board ? 'boarding.tapBoard' : 'boarding.tapReturn')
          ) : (
            <>
              {t(board ? 'boarding.pressBoardPre' : 'boarding.pressReturnPre')}<kbd>E</kbd>{t(board ? 'boarding.pressBoardPost' : 'boarding.pressReturnPost')}
            </>
          )}
        </span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}

export function StreetPrompts({ npcs, eraId, promptLayer }) {
  // 街上與室內有對話的人物都有提示（提示只在走近時浮現，室內的人物走近時室內一定已經載入）
  const talkables = npcs.filter((npc) => talkForNpc(eraId, npc.id))
  const inspectables = inspectablesOfEra(eraId)
  return (
    <>
      {talkables.map((npc) => (
        <Html
          key={npc.id}
          // 二樓的人物（例如有記名茶的清源堂）：提示跟著樓板抬高；帆船甲板低於街面的人物仍在 2.1
          position={[npc.position[0], Math.max(2.1, npc.position[1] + 2.1), npc.position[2]]}
          portal={promptLayer}
          zIndexRange={[12, 0]}
          pointerEvents="none"
        >
          <TalkPrompt npc={npc} talk={talkForNpc(eraId, npc.id)} spot={BOARDING_SPOTS.find((spot) => spot.npcId === npc.id && eraId === QING_BOARDING_ERA) ?? null} />
        </Html>
      ))}
      {inspectables.map((item) => (
        <Html key={item.id} position={item.prompt} portal={promptLayer} zIndexRange={[12, 0]} pointerEvents="none">
          <InspectPrompt item={item} />
        </Html>
      ))}
      {eraId === QING_BOARDING_ERA &&
        BOARDING_SPOTS.map((spot) => (
          <Html key={spot.id} position={spot.prompt} portal={promptLayer} zIndexRange={[12, 0]} pointerEvents="none">
            <BoardingPrompt spot={spot} />
          </Html>
        ))}
    </>
  )
}
