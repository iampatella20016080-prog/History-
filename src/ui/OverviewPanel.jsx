import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ERAS } from '../data/eras.js'
import { MAP_PLACES, MAP_STREETS, getPlaceShops, getTimelineByEra, getUnmappedShops } from '../data/overview.js'
import { getSource } from '../data/sources.js'
import { useGameStore } from '../state/useGameStore.js'
import { useLocalizer, useT } from '../i18n/useT.js'


/**
 * 「年表與地圖」總覽：右上角的按鈕打開全頁的紙張視窗，兩個分頁——
 * 年表（五個年代、所有店家的創立年份與有出處的大事）與對照地圖（遊戲街景是情境示意，地圖依文獻的門牌標出真實位置）。
 */
export function OverviewPanel() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('timeline')
  const mode = useGameStore((state) => state.mode)
  const transitioning = useGameStore((state) => state.transitioning)
  const toggleMenu = useGameStore((state) => state.toggleMenu)
  const t = useT()
  const L = useLocalizer()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  return (
    <div className="hud-menu">
      <button
        type="button"
        className="hud-menu__toggle paper"
        aria-expanded={open}
        aria-controls="overview-panel"
        disabled={mode !== 'explore' || transitioning}
        data-overview-toggle
        onClick={() => {
          toggleMenu(false)
          setOpen(true)
        }}
      >
        {t('overview.toggle')}
      </button>
      {/* 全頁視窗用 portal 掛到 body：hud-actions 有 transform，fixed 定位會被框在裡面 */}
      {open &&
        createPortal(
        <div className="story-layer overview-layer" data-state="open">
          <div className="story-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
          <section id="overview-panel" className="story paper overview" role="dialog" aria-modal="true" aria-labelledby="overview-title">
            <header className="story__header">
              <div className="story__seal" aria-hidden="true">
                {t('overview.seal')}
              </div>
              <div className="story__titles">
                <p className="story__eyebrow">{t('overview.eyebrow')}</p>
                <h2 id="overview-title" className="story__title">
                  {t('overview.title')}
                </h2>
                <p className="story__meta">{t('overview.meta')}</p>
              </div>
              <button type="button" className="story__close" onClick={() => setOpen(false)}>
                <span aria-hidden="true">✕</span> <span className="story__close-label">{t('overview.close')}</span> <kbd>Esc</kbd>
              </button>
            </header>
            <nav className="story__tabs" role="tablist" aria-label={t('overview.tabs')}>
              {[
                ['timeline', t('numeral.1'), t('overview.tab.timeline')],
                ['map', t('numeral.2'), t('overview.tab.map')],
              ].map(([id, numeral, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} className={`story__tab${tab === id ? ' is-active' : ''}`} onClick={() => setTab(id)}>
                  <span className="story__tab-number">{numeral}</span>
                  {label}
                </button>
              ))}
            </nav>
            <div className="story__body" role="tabpanel" data-scrollable>
              <div className="story__page">{tab === 'timeline' ? <Timeline /> : <ComparisonMap />}</div>
            </div>
          </section>
        </div>,
          document.body,
        )}
    </div>
  )
}

function EraChips({ eraIds }) {
  const L = useLocalizer()
  const eraTitle = Object.fromEntries(L(ERAS).map((era) => [era.id, era.title]))
  if (!eraIds?.length) return null
  return (
    <span className="overview-chips">
      {eraIds.map((id) => (
        <span key={id} className="overview-chip">
          {eraTitle[id]}
        </span>
      ))}
    </span>
  )
}

function SourceLinks({ sourceIds }) {
  const sources = (sourceIds ?? []).map(getSource).filter(Boolean)
  if (!sources.length) return null
  return (
    <span className="overview-sources">
      {sources.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
          {source.publisher ?? source.citation}
        </a>
      ))}
    </span>
  )
}

function TimelineItem({ item }) {
  const t = useT()
  const L = useLocalizer()
  return (
    <li className={`overview-event is-${item.kind}${item.status === 'coming-soon' ? ' is-soon' : ''}`}>
      <span className="overview-event__year">{item.year}</span>
      <span className="overview-event__body">
        {item.kind === 'shop' ? (
          <>
            <span className="overview-event__name">
              {L(item).name}
              {item.heritage && <span className="menu-shop__note is-heritage">{t('overview.heritage')}</span>}
              {item.status === 'coming-soon' && <span className="menu-shop__badge">{t('overview.soon')}</span>}
            </span>
            <span className="overview-event__meta">{item.label}</span>
            <EraChips eraIds={item.eraIds} />
          </>
        ) : (
          <>
            <span className="overview-event__text">{item.text}</span>
            <SourceLinks sourceIds={item.sourceIds} />
          </>
        )}
      </span>
    </li>
  )
}

function Timeline() {
  const t = useT()
  const L = useLocalizer()
  const { groups, between, undated } = getTimelineByEra()
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">{t('overview.timeline')}</h3>
      <p className="chapter__lead">{t('overview.timelineLead')}</p>
      {groups.map(({ era, items }, index) => (
        <section key={era.id} className="overview-era">
          <h4 className="overview-era__title">
            <span className="overview-era__chapter">{era.chapter}</span>
            {era.yearRange}｜{era.title}
          </h4>
          <ol className="overview-events">
            {items.map((item) => (
              <TimelineItem key={`${item.kind}-${item.shopId ?? item.year}-${item.text ?? ''}`} item={item} />
            ))}
            {items.length === 0 && <li className="overview-event is-empty">{t('overview.emptyEra')}</li>}
          </ol>
          {index === groups.length - 2 && between.length > 0 && (
            <>
              <h4 className="overview-era__title is-between">{t('overview.between')}</h4>
              <ol className="overview-events">
                {between.map((item) => (
                  <TimelineItem key={`${item.kind}-${item.shopId ?? item.year}-${item.text ?? ''}`} item={item} />
                ))}
              </ol>
            </>
          )}
        </section>
      ))}
      {undated.length > 0 && (
        <section className="overview-era">
          <h4 className="overview-era__title is-between">{t('overview.undated')}</h4>
          <ul className="overview-undated">
            {undated.map((item) => (
              <li key={item.shopId}>
                {L(item).name}
                <EraChips eraIds={item.eraIds} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

function ComparisonMap() {
  const t = useT()
  const L = useLocalizer()
  const [selected, setSelected] = useState(null)
  const place = MAP_PLACES.find((item) => item.id === selected) ?? null
  const unmapped = getUnmappedShops()
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">{t('overview.mapTitle')}</h3>
      <p className="chapter__lead">
        {t('overview.mapLead')}
      </p>
      <svg className="overview-map" viewBox="0 0 100 100" role="img" aria-label={t('overview.mapLabel')}>
        {MAP_STREETS.map((street) => (
          <g key={street.id}>
            <polyline points={street.points.map((p) => p.join(',')).join(' ')} className={`overview-map__street is-${street.kind ?? 'street'}`} />
            <text x={street.points[0][0] + (street.points[0][0] === street.points[1][0] ? 0.8 : 0)} y={street.points[0][1] + (street.points[0][1] === street.points[1][1] ? -0.8 : 2.4)} className="overview-map__label">
              {L(street).name}
            </text>
          </g>
        ))}
        {MAP_PLACES.map((item) => (
          <g key={item.id} className={`overview-map__place is-${item.precision}${selected === item.id ? ' is-selected' : ''}`} onClick={() => setSelected(item.id)} role="button" tabIndex={0}>
            <circle cx={item.x} cy={item.y} r="1.6" />
            <text x={item.x + 2.2} y={item.y + 0.8}>{L(item).name}</text>
          </g>
        ))}
      </svg>
      <div className="overview-place">
        {place ? (
          <>
            <h4 className="overview-place__name">{place.name}</h4>
            <p className="overview-place__address">
              {place.address}
              {place.precision === 'approx' && <span className="menu-shop__badge">{t('overview.approx')}</span>}
            </p>
            <ul className="overview-place__shops">
              {getPlaceShops(place).map((shop) => (
                <li key={shop.id}>{L(shop).name}</li>
              ))}
            </ul>
            <SourceLinks sourceIds={place.sourceIds} />
          </>
        ) : (
          <p className="overview-place__hint">{t('overview.mapHint')}</p>
        )}
      </div>
      {unmapped.length > 0 && (
        <p className="chapter__source">
          <span className="chapter__source-label">{t('overview.unmappedLabel')}</span>
          {t('overview.unmapped', { names: unmapped.map((shop) => L(shop).name).join(t('common.listSep')) })}
        </p>
      )}
    </article>
  )
}
