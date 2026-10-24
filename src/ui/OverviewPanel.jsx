import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ERAS } from '../data/eras.js'
import { MAP_PLACES, MAP_STREETS, getPlaceShops, getTimelineByEra, getUnmappedShops } from '../data/overview.js'
import { getSource } from '../data/sources.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'

const ERA_TITLE = Object.fromEntries(ERAS.map((era) => [era.id, era.title]))

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
                ['timeline', '壹', t('overview.tab.timeline')],
                ['map', '貳', t('overview.tab.map')],
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
  if (!eraIds?.length) return null
  return (
    <span className="overview-chips">
      {eraIds.map((id) => (
        <span key={id} className="overview-chip">
          {ERA_TITLE[id]}
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
  return (
    <li className={`overview-event is-${item.kind}${item.status === 'coming-soon' ? ' is-soon' : ''}`}>
      <span className="overview-event__year">{item.year}</span>
      <span className="overview-event__body">
        {item.kind === 'shop' ? (
          <>
            <span className="overview-event__name">
              {item.name}
              {item.heritage && <span className="menu-shop__note is-heritage">文化據點</span>}
              {item.status === 'coming-soon' && <span className="menu-shop__badge">即將開放</span>}
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
  const { groups, between, undated } = getTimelineByEra()
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">年表</h3>
      <p className="chapter__lead">店家的年份依各店的文獻；年份記載不一的店家，括號裡寫明說法。灰色的項目是還在準備中的店家。</p>
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
            {items.length === 0 && <li className="overview-event is-empty">這個年代沒有有年份的項目。</li>}
          </ol>
          {index === groups.length - 2 && between.length > 0 && (
            <>
              <h4 className="overview-era__title is-between">1980–2000｜兩個年代之間</h4>
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
          <h4 className="overview-era__title is-between">沒有創立年份的店家與情境攤位</h4>
          <ul className="overview-undated">
            {undated.map((item) => (
              <li key={item.shopId}>
                {item.name}
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
  const [selected, setSelected] = useState(null)
  const place = MAP_PLACES.find((item) => item.id === selected) ?? null
  const unmapped = getUnmappedShops()
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">對照地圖</h3>
      <p className="chapter__lead">
        遊戲裡的街是情境示意，店家的位置不是真實的相對位置。這張簡化的街道圖依文獻裡的門牌標出每家店真正在哪裡（不按比例；虛線圈是文獻只寫到巷名或門牌未核實的地點）。
      </p>
      <svg className="overview-map" viewBox="0 0 100 100" role="img" aria-label="大稻埕街道示意圖與店家位置">
        {MAP_STREETS.map((street) => (
          <g key={street.id}>
            <polyline points={street.points.map((p) => p.join(',')).join(' ')} className={`overview-map__street is-${street.kind ?? 'street'}`} />
            <text x={street.points[0][0] + (street.points[0][0] === street.points[1][0] ? 0.8 : 0)} y={street.points[0][1] + (street.points[0][1] === street.points[1][1] ? -0.8 : 2.4)} className="overview-map__label">
              {street.name}
            </text>
          </g>
        ))}
        {MAP_PLACES.map((item) => (
          <g key={item.id} className={`overview-map__place is-${item.precision}${selected === item.id ? ' is-selected' : ''}`} onClick={() => setSelected(item.id)} role="button" tabIndex={0}>
            <circle cx={item.x} cy={item.y} r="1.6" />
            <text x={item.x + 2.2} y={item.y + 0.8}>{item.name}</text>
          </g>
        ))}
      </svg>
      <div className="overview-place">
        {place ? (
          <>
            <h4 className="overview-place__name">{place.name}</h4>
            <p className="overview-place__address">
              {place.address}
              {place.precision === 'approx' && <span className="menu-shop__badge">位置示意</span>}
            </p>
            <ul className="overview-place__shops">
              {getPlaceShops(place).map((shop) => (
                <li key={shop.id}>{shop.name}</li>
              ))}
            </ul>
            <SourceLinks sourceIds={place.sourceIds} />
          </>
        ) : (
          <p className="overview-place__hint">點地圖上的地點，看門牌與對應的店家。</p>
        )}
      </div>
      {unmapped.length > 0 && (
        <p className="chapter__source">
          <span className="chapter__source-label">地圖上沒有標示</span>
          {unmapped.map((shop) => shop.name).join('、')}：本站引用的文獻沒有這些店家的門牌（或建築已不存在）。
        </p>
      )}
    </article>
  )
}
