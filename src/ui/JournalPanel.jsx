import { useEffect, useRef, useState } from 'react'
import { getEra } from '../data/eras.js'
import { ROUTES, getRoute } from '../data/routes.js'
import { JOURNAL_KINDS, journalEntries } from '../game/journal.js'
import { nodeEra, routeCount, routeComplete, routeEras, routeJournalPage, routeProgress } from '../game/themeRoute.js'
import { useGameStore } from '../state/useGameStore.js'
import { RouteMap } from './RouteMap.jsx'
import { useLocalizer, useT } from '../i18n/useT.js'

const KIND_TABS = [null, 'talk', 'object', 'shop', 'news']

/**
 * 右上角的「探索手記」：
 * - 主題探索模式：選一條路線（例如「一箱茶的旅程」），列出節點與完成情形，順序自由；
 *   完成後看到這條路線的手記頁。
 * - 手記：記下看過的器物、聽過的話、走過的店與讀過的消息，可以依種類翻看；不用完成百分比。
 */
export function JournalPanel() {
  const t = useT()
  const L = useLocalizer()
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

  const route = activeRouteId ? L(getRoute(activeRouteId)) : null
  const entries = L(journalEntries(journal, kind))

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
          {t('journal.seal')}
        </span>
        {t('journal.title')}
      </button>
      {open && (
        <div id="journal-panel" className="hud-menu__panel paper journal" data-scrollable>
          {/* 主題探索模式 */}
          <section className="journal__routes">
            <p className="hud-menu__heading">
              <span>{t('journal.routes')}</span>
            </p>
            {!route &&
              L(ROUTES).map((item) => {
                const count = routeCount(item, journal)
                return (
                  <div key={item.id} className="journal-route">
                    <div className="journal-route__info">
                      <span className="journal-route__title">{item.title}</span>
                      <span className="journal-route__meta">
                        {routeEras(item).map((id) => L(getEra(id))?.title).join('・')}｜{count.done}／{count.total}
                      </span>
                      <p className="journal-route__intro">{item.intro}</p>
                    </div>
                    <button type="button" className="button-solid" onClick={() => setActiveRoute(item.id)}>
                      {count.done > 0 ? t('journal.continue') : t('journal.start')}
                    </button>
                  </div>
                )
              })}
            {route && <ActiveRoute route={route} journal={journal} eraId={eraId} requestEra={requestEra} onStop={() => setActiveRoute(null)} />}
          </section>

          {/* 手記 */}
          <p className="hud-menu__heading journal__heading">
            <span>{t('journal.entries')}</span>
            <span className="hud-menu__count">{t('journal.count', { n: journal.entries.length })}</span>
          </p>
          <div className="journal__tabs" role="tablist" aria-label={t('journal.tabs')}>
            {KIND_TABS.map((item) => (
              <button
                key={item ?? 'all'}
                type="button"
                role="tab"
                aria-selected={kind === item}
                className={`journal__tab${kind === item ? ' is-active' : ''}`}
                onClick={() => setKind(item)}
              >
                {item ? L(JOURNAL_KINDS[item]).text : t('journal.all')}
              </button>
            ))}
          </div>
          {entries.length === 0 && <p className="journal__empty">{t('journal.empty')}</p>}
          <ul className="journal__list">
            {entries.map((entry) => (
              <li key={entry.id} className="journal-entry">
                <span className="journal-entry__kind">{L(JOURNAL_KINDS[entry.kind]).text}</span>
                <div className="journal-entry__body">
                  <span className="journal-entry__title">
                    {entry.title}
                    {entry.eraId && <em className="journal-entry__era">{L(getEra(entry.eraId))?.title}</em>}
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
  const t = useT()
  const L = useLocalizer()
  const complete = routeComplete(route, journal)
  const count = routeCount(route, journal)
  const progress = routeProgress(route, journal)
  const eras = routeEras(route)
  const pending = progress.filter((node) => !node.done)
  const travelEra = pending.some((node) => nodeEra(route, node) === eraId) ? null : (pending[0] && nodeEra(route, pending[0]))
  return (
    <div className="journal-route is-active">
      <div className="journal-route__info">
        <span className="journal-route__title">{route.title}</span>
        <span className="journal-route__meta">
          {eras.map((id) => L(getEra(id))?.title).join('・')}｜{count.done}／{count.total}
          {complete && t('journal.complete')}
        </span>
        {/* 還沒完成的節點都不在這個年代時，帶你過去（跨年代的路線：前往下一個還沒完成的節點的年代） */}
        {!complete && travelEra && (
          <button type="button" className="button-ghost journal-route__travel" onClick={() => requestEra(travelEra)}>
            {t('journal.travel', { era: L(getEra(travelEra))?.title, range: L(getEra(travelEra))?.yearRange })}
          </button>
        )}
      </div>
      {!complete && <RouteMap route={route} progress={progress} eraId={eraId} />}
      {!complete && (
        <ul className="journal-route__nodes">
          {progress.map((node, i) => (
            <li key={node.id} className={`route-node${node.done ? ' is-done' : ''}`}>
              <span className="route-node__mark" aria-hidden="true">
                {node.done ? '✓' : i + 1}
              </span>
              <div>
                <span className="route-node__title">
                  {node.title}
                  {eras.length > 1 && <em className="route-node__era">{L(getEra(nodeEra(route, node)))?.title}</em>}
                </span>
                {!node.done && <p className="route-node__hint">{node.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {complete && (
        <div className="journal-route__page">
          <p className="journal-route__done">{t('journal.routeDone')}</p>
          {route.closing && <p className="journal-route__intro">{route.closing}</p>}
          <ul className="journal-route__nodes">
            {routeJournalPage(route, journal).map(({ node, entry: rawEntry }) => {
              const entry = L(rawEntry)
              return (
              <li key={node.id} className="route-node is-done">
                <span className="route-node__mark" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <span className="route-node__title">{node.title}</span>
                  {entry?.text && <p className="route-node__hint">{entry.text}</p>}
                </div>
              </li>
              )
            })}
          </ul>
        </div>
      )}
      <button type="button" className="button-ghost" onClick={onStop}>
        {complete ? t('journal.collapse') : t('journal.leave')}
      </button>
    </div>
  )
}
