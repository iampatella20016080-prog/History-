import { ERAS, getEra } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 上方中央的年代時間軸：五個年代節點，點擊（或觸控）即可切換。
 * 轉場進行中、閱讀店家介紹時暫時不能切換。
 */
export function EraTimeline() {
  const eraId = useGameStore((state) => state.eraId)
  const transition = useGameStore((state) => state.eraTransition)
  const transitioning = useGameStore((state) => state.transitioning)
  const worldReady = useGameStore((state) => state.worldReady)
  const mode = useGameStore((state) => state.mode)
  const requestEra = useGameStore((state) => state.requestEra)
  const shownId = transition?.to ?? eraId
  const era = getEra(shownId)
  const activeIndex = ERAS.findIndex((item) => item.id === shownId)
  const locked = transitioning || !worldReady || mode !== 'explore'

  return (
    <nav className={`era-timeline${transitioning ? ' is-transitioning' : ''}`} aria-label="年代時間軸">
      <ol className="era-timeline__track" style={{ '--progress': activeIndex / (ERAS.length - 1) }}>
        {ERAS.map((item) => {
          const active = item.id === shownId
          return (
            <li key={item.id} className={`era-node${active ? ' is-active' : ''}`}>
              <button
                type="button"
                className="era-node__button"
                aria-current={active ? 'step' : undefined}
                aria-label={`${item.yearRange} ${item.title}`}
                disabled={locked && !active}
                onClick={() => requestEra(item.id)}
              >
                <span className="era-node__year">{item.yearRange.split('–')[0]}</span>
                <span className="era-node__mark" aria-hidden="true" />
                <span className="era-node__title">{item.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {era && (
        <p className="era-timeline__caption" key={era.id}>
          <span className="era-timeline__years">{era.yearRange}</span>
          <span className="era-timeline__desc">{era.description}</span>
        </p>
      )}
    </nav>
  )
}
