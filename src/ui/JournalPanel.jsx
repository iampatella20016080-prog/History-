import { useEffect, useRef, useState } from 'react'
import { getEra } from '../data/eras.js'
import { ROUTES, getRoute } from '../data/teaRoute.js'
import { JOURNAL_KINDS, journalEntries } from '../game/journal.js'
import { routeCount, routeComplete, routeJournalPage, routeProgress } from '../game/themeRoute.js'
import { useGameStore } from '../state/useGameStore.js'

const KIND_TABS = [null, 'talk', 'object', 'shop', 'news']

/**
 * 右上角的「探索手記」：
 * - 主題探索模式：選一條路線（例如「一箱茶的旅程」），列出節點與完成情形，順序自由；
 *   完成後看到這條路線的手記頁。
 * - 手記：記下看過的器物、聽過的話、走過的店與讀過的消息，可以依種類翻看；不用完成百分比。
 */
export function JournalPanel() {
  const open = useGameStore((state) => state.journalOpen)
  const toggleJournal = useGameStore((state) => state.toggleJournal)
  const journal = useGameStore((state) => state.journal)
  const activeRouteId = useGameStore((state) => state.activeRouteId)
  const setActiveRoute = useGameStore((state) => state.setActiveRoute)
  const requestEra = useGameStore((state) => state.requestEra)
  const eraId = useGameStore((state) => state.eraId)
  const mode = useGameStore((state) => state.mode)
  const transitioning = useGameStore((state) => state.transitioning)
  const [kind, setKind] = useState(null)
  const container = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!container.current?.contains(event.target)) toggleJournal(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open, toggleJournal])

  const route = activeRouteId ? getRoute(activeRouteId) : null
  const entries = journalEntries(journal, kind)

  return (
    <div className="hud-menu" ref={container}>
      <button
        type="button"
        className="hud-menu__toggle paper"
        aria-expanded={open}
        aria-controls="journal-panel"
        disabled={mode !== 'explore' || transitioning}
        onClick={() => toggleJournal()}
      >
        <span className="hud-menu__seal" aria-hidden="true">
          記
        </span>
        探索手記
      </button>
      {open && (
        <div id="journal-panel" className="hud-menu__panel paper journal" data-scrollable>
          {/* 主題探索模式 */}
          <section className="journal__routes">
            <p className="hud-menu__heading">
              <span>主題探索</span>
            </p>
            {!route &&
              ROUTES.map((item) => {
                const count = routeCount(item, journal)
                return (
                  <div key={item.id} className="journal-route">
                    <div className="journal-route__info">
                      <span className="journal-route__title">{item.title}</span>
                      <span className="journal-route__meta">
                        {getEra(item.eraId)?.title}｜{count.done}／{count.total}
                      </span>
                      <p className="journal-route__intro">{item.intro}</p>
                    </div>
                    <button type="button" className="button-solid" onClick={() => setActiveRoute(item.id)}>
                      {count.done > 0 ? '繼續' : '開始'}
                    </button>
                  </div>
                )
              })}
            {route && <ActiveRoute route={route} journal={journal} eraId={eraId} requestEra={requestEra} onStop={() => setActiveRoute(null)} />}
          </section>

          {/* 手記 */}
          <p className="hud-menu__heading journal__heading">
            <span>手記</span>
            <span className="hud-menu__count">{journal.entries.length} 則</span>
          </p>
          <div className="journal__tabs" role="tablist" aria-label="手記分類">
            {KIND_TABS.map((item) => (
              <button
                key={item ?? 'all'}
                type="button"
                role="tab"
                aria-selected={kind === item}
                className={`journal__tab${kind === item ? ' is-active' : ''}`}
                onClick={() => setKind(item)}
              >
                {item ? JOURNAL_KINDS[item].text : '全部'}
              </button>
            ))}
          </div>
          {entries.length === 0 && <p className="journal__empty">還沒有記下東西——去街上跟人說說話、近看器物、走進店家吧。</p>}
          <ul className="journal__list">
            {entries.map((entry) => (
              <li key={entry.id} className="journal-entry">
                <span className="journal-entry__kind">{JOURNAL_KINDS[entry.kind].text}</span>
                <div className="journal-entry__body">
                  <span className="journal-entry__title">
                    {entry.title}
                    {entry.eraId && <em className="journal-entry__era">{getEra(entry.eraId)?.title}</em>}
                  </span>
                  {entry.text && <p className="journal-entry__text">{entry.text}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** 進行中的路線：節點清單（順序自由）；完成後是這條路線的手記頁 */
function ActiveRoute({ route, journal, eraId, requestEra, onStop }) {
  const complete = routeComplete(route, journal)
  const count = routeCount(route, journal)
  const progress = routeProgress(route, journal)
  return (
    <div className="journal-route is-active">
      <div className="journal-route__info">
        <span className="journal-route__title">{route.title}</span>
        <span className="journal-route__meta">
          {getEra(route.eraId)?.title}｜{count.done}／{count.total}
          {complete && '・完成'}
        </span>
        {route.eraId !== eraId && (
          <button type="button" className="button-ghost journal-route__travel" onClick={() => requestEra(route.eraId)}>
            前往{getEra(route.eraId)?.title}（{getEra(route.eraId)?.yearRange}）
          </button>
        )}
      </div>
      {!complete && (
        <ul className="journal-route__nodes">
          {progress.map((node) => (
            <li key={node.id} className={`route-node${node.done ? ' is-done' : ''}`}>
              <span className="route-node__mark" aria-hidden="true">
                {node.done ? '✓' : '○'}
              </span>
              <div>
                <span className="route-node__title">{node.title}</span>
                {!node.done && <p className="route-node__hint">{node.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {complete && (
        <div className="journal-route__page">
          <p className="journal-route__done">這條路線走完了——這是你一路記下的手記：</p>
          <ul className="journal-route__nodes">
            {routeJournalPage(route, journal).map(({ node, entry }) => (
              <li key={node.id} className="route-node is-done">
                <span className="route-node__mark" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <span className="route-node__title">{node.title}</span>
                  {entry?.text && <p className="route-node__hint">{entry.text}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="button-ghost" onClick={onStop}>
        {complete ? '收起路線' : '先不走這條路線'}
      </button>
    </div>
  )
}
