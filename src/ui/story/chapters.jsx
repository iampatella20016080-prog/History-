import { useEffect, useState } from 'react'
import { getInspectObject } from '../../data/inspectObjects.js'
import { getSource } from '../../data/sources.js'
import { useGameStore } from '../../state/useGameStore.js'
import { FoodIllustration } from '../FoodIllustration.jsx'
import { PHOTOS } from './photos.js'
import { useT } from '../../i18n/useT.js'

/**
 * 店家介紹的章節版型。所有店家共用；版型由章節資料的 type 決定：
 * text（文字）、foods（食物圖鑑）、sources（文獻）、process（步驟動畫，例如碾米）、
 * object（器物：開啟主畫面同一個畫布的 3D 檢視，例如米斗、茶箱）。
 */

function SourceNote({ sourceIds, onShowSources }) {
  const t = useT()
  const sources = (sourceIds ?? []).map(getSource).filter(Boolean)
  if (!sources.length) return null
  return (
    <p className="chapter__source">
      <span className="chapter__source-label">{t('chapter.sourceLabel')}</span>
      {sources.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
          {source.citation}
        </a>
      ))}
      {onShowSources && (
        <button type="button" className="text-button" onClick={onShowSources}>
          {t('chapter.viewSources')}
        </button>
      )}
    </p>
  )
}

/** 實地照片（章節資料的 figures：{ id, caption }） */
function Figures({ figures }) {
  const items = (figures ?? []).filter((figure) => PHOTOS[figure.id])
  if (!items.length) return null
  return (
    <div className="chapter-figures">
      {items.map((figure) => {
        const photo = PHOTOS[figure.id]
        return (
          <figure key={figure.id} className="chapter-figure">
            <img src={photo.src} width={photo.width} height={photo.height} alt={figure.caption} loading="lazy" decoding="async" />
            <figcaption>{figure.caption}</figcaption>
          </figure>
        )
      })}
    </div>
  )
}

export function TextChapter({ chapter, onShowSources }) {
  const t = useT()
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__lead">{chapter.lead}</p>

      {chapter.seals && (
        <div className="seal-row" aria-label={t('chapter.sealRow')}>
          {chapter.seals.map((seal) => (
            <span key={seal} className="seal-stamp">
              {seal}
            </span>
          ))}
        </div>
      )}

      {chapter.summary && (
        <section className="chapter-summary">
          <span className="chapter-summary__label">{chapter.summary.label ?? t('chapter.summaryLabel')}</span>
          <p>{chapter.summary.text}</p>
        </section>
      )}

      {chapter.paragraphs?.map((paragraph, i) => (
        <p key={i} className="chapter__p">
          {paragraph}
        </p>
      ))}

      <Figures figures={chapter.figures} />

      {chapter.lists?.map((list) => (
        <section key={list.title} className={`chapter-list is-${list.kind ?? 'plain'}`}>
          <h4 className="chapter-list__title">{list.title}</h4>
          <ul>
            {list.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      {chapter.timeline && (
        <ol className="timeline">
          {chapter.timeline.map((step, i) => (
            <li key={i} className="timeline__step">
              <span className="timeline__place">{step.place}</span>
              <span className="timeline__text">{step.text}</span>
            </li>
          ))}
        </ol>
      )}

      {chapter.facts && (
        <dl className="facts">
          {chapter.facts.map((fact) => (
            <div key={fact.label} className="facts__row">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {chapter.glossary && (
        <aside className="glossary">
          <h4 className="glossary__title">{t('chapter.glossary')}</h4>
          <dl>
            {chapter.glossary.map((entry) => (
              <div key={entry.term} className="glossary__row">
                <dt>
                  {entry.term}
                  {entry.taiwanese && (
                    <span className="glossary__tai" lang="nan-Latn-TW" title={t('chapter.tailo')}>
                      {entry.taiwanese}
                    </span>
                  )}
                </dt>
                <dd>{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}

      <SourceNote sourceIds={chapter.sourceIds} onShowSources={onShowSources} />
    </article>
  )
}

export function FoodsChapter({ chapter, onShowSources }) {
  const t = useT()
  return (
    <article className="chapter chapter--foods">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__intro">{chapter.intro}</p>
      <div className="food-grid">
        {chapter.items.map((item, i) => (
          <figure key={item.id} className="food-card">
            <div className="food-card__top">
              <span className="food-card__no">No.{String(i + 1).padStart(2, '0')}</span>
              <span className="food-card__category">{item.category}</span>
            </div>
            <div className="food-card__art">
              <FoodIllustration id={item.id} label={t('chapter.foodArt', { name: item.name })} />
            </div>
            <figcaption className="food-card__body">
              <h4 className="food-card__name">{item.name}</h4>
              <p className="food-card__desc">{item.description}</p>
              {item.note && (
                <p className="food-card__note">
                  <span className="food-card__note-label">{t('chapter.foodNote')}</span>
                  {item.note}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {chapter.footnote && <p className="chapter__footnote">{chapter.footnote}</p>}
      <SourceNote sourceIds={chapter.sourceIds} onShowSources={onShowSources} />
    </article>
  )
}

export function SourcesChapter({ chapter }) {
  const t = useT()
  const sources = (chapter.sourceIds ?? []).map(getSource).filter(Boolean)
  return (
    <article className="chapter chapter--sources">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__intro">{chapter.intro}</p>
      <ol className="source-list">
        {sources.map((source, i) => (
          <li key={source.id} className="source">
            <a className="source__link" href={source.url} target="_blank" rel="noopener noreferrer">
              <span className="source__index">{i + 1}</span>
              <span className="source__main">
                <span className="source__citation">{source.citation}</span>
                <span className="source__url">{source.url}</span>
              </span>
              <span className="source__open">{t('chapter.openPage')}</span>
            </a>
            {(source.published || source.usage) && (
              <dl className="source__meta">
                {source.published && (
                  <div>
                    <dt>{t('chapter.published')}</dt>
                    <dd>{source.published}</dd>
                  </div>
                )}
                {source.usage && (
                  <div>
                    <dt>{t('chapter.usage')}</dt>
                    <dd>{source.usage}</dd>
                  </div>
                )}
              </dl>
            )}
            {source.context && <p className="source__context">{source.context}</p>}
            {source.records?.length > 0 && (
              <div className="source__records">
                <h4>{t('chapter.records')}</h4>
                <ul>
                  {source.records.map((record) => (
                    <li key={record}>{record}</li>
                  ))}
                </ul>
                {source.recordsNote && <p>{source.recordsNote}</p>}
              </div>
            )}
          </li>
        ))}
      </ol>
      {chapter.disclaimer && (
        <aside className="disclaimer">
          <h4>{t('chapter.aboutScene')}</h4>
          <p>{chapter.disclaimer}</p>
        </aside>
      )}
    </article>
  )
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 一粒米在各個步驟的樣子（SVG）：稻穀有外殼與芒、脫殼時外殼裂開、糙米帶褐色的米糠、精米是白色 */
function Grain({ step, x, y, r = 0 }) {
  const body = { paddy: '#c9a04a', husk: '#d8bd86', brown: '#c8a46e', white: '#f6f2e6' }[step]
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <g className="grain">
        {step === 'husk' && (
          <>
            <path d="M-13 -2 Q-16 -14 -4 -20 L-3 -2 Z" fill="#b8893a" className="grain__shell is-left" />
            <path d="M13 -2 Q16 -14 4 -20 L3 -2 Z" fill="#b8893a" className="grain__shell is-right" />
          </>
        )}
        <ellipse rx={step === 'paddy' ? 11 : 8.5} ry={step === 'paddy' ? 20 : 15} fill={body} stroke="rgba(60,40,20,0.45)" strokeWidth="1.2" />
        {step === 'paddy' && (
          <>
            <path d="M0 -20 L0 -30" stroke="#a07a30" strokeWidth="1.4" />
            <path d="M-6 -12 Q0 0 -6 14 M6 -12 Q0 0 6 14" stroke="#a07a30" strokeWidth="1" fill="none" />
          </>
        )}
        {step === 'brown' && <path d="M-3 -10 Q-5 0 -3 10" stroke="#9c7244" strokeWidth="1.4" fill="none" />}
        {step === 'white' && <ellipse rx="3" ry="7" cx="-2" cy="-3" fill="#ffffff" opacity="0.8" />}
      </g>
    </g>
  )
}

const GRAIN_SPOTS = [
  [40, 46, -18],
  [78, 38, 10],
  [114, 50, -6],
  [150, 40, 16],
  [58, 84, 8],
  [96, 90, -14],
  [134, 86, 4],
]

/** 步驟動畫（例如碾米：稻穀 → 脫殼 → 糙米 → 精米，一輪約 6 秒；減少動態效果時不自動播放） */
export function ProcessChapter({ chapter, onShowSources }) {
  const t = useT()
  const steps = chapter.steps ?? []
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  useEffect(() => {
    if (!playing || steps.length < 2) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % steps.length), chapter.stepMs ?? 1600)
    return () => clearInterval(timer)
  }, [playing, steps.length, chapter.stepMs])
  const step = steps[index]
  return (
    <article className="chapter chapter--process">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__lead">{chapter.lead}</p>
      <div className="process">
        <div className="process__stage" aria-live="polite">
          <svg viewBox="0 0 190 130" className={`process__grains is-${step?.id}`} role="img" aria-label={step ? `${step.label}：${step.text}` : ''}>
            <rect x="6" y="104" width="178" height="14" rx="3" fill="#8a6440" />
            {GRAIN_SPOTS.map(([x, y, r], i) => (
              <Grain key={`${step?.id}-${i}`} step={step?.id ?? 'paddy'} x={x} y={y} r={r} />
            ))}
            {step?.id === 'brown' && [30, 70, 120, 160].map((x) => <circle key={x} cx={x} cy={112} r="3" fill="#a88a5a" />)}
          </svg>
          <p className="process__caption">
            <strong>{step?.label}</strong>
            {step?.text}
          </p>
        </div>
        <ol className="process__steps">
          {steps.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={`process__step${i === index ? ' is-active' : ''}${i < index ? ' is-done' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => {
                  setIndex(i)
                  setPlaying(false)
                }}
              >
                <span className="process__num">{i + 1}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="text-button process__toggle" onClick={() => setPlaying((value) => !value)}>
          {playing ? t('chapter.pause') : t('chapter.play')}
        </button>
      </div>
      {chapter.paragraphs?.map((paragraph, i) => (
        <p key={i} className="chapter__p">
          {paragraph}
        </p>
      ))}
      <SourceNote sourceIds={chapter.sourceIds} onShowSources={onShowSources} />
    </article>
  )
}

/**
 * 器物章節：改用主畫面同一個畫布的 3D 檢視（第 10 階段；卡通材質與描邊，
 * 可以旋轉、縮放與小動作，取代原本的 CSS 立體模型）。
 * chapter.object 對應 data/inspectObjects.js 的器物 id。
 */
export function ObjectChapter({ chapter, onShowSources }) {
  const t = useT()
  const openInspect = useGameStore((state) => state.openInspect)
  const object = getInspectObject(chapter.object)
  return (
    <article className="chapter chapter--object">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__lead">{chapter.lead}</p>
      {object && (
        <button type="button" className="object-launch" onClick={() => openInspect(object.id, 'chapter')}>
          <span className="object-launch__icon" aria-hidden="true">
            ❖
          </span>
          <span className="object-launch__label">{t('chapter.enlarge')}</span>
          <span className="object-launch__meta">{t('chapter.enlargeMeta', { actions: object.actions?.length ? `・${object.actions.map((action) => action.label).join(t('common.listSep'))}` : '' })}</span>
        </button>
      )}
      {chapter.summary && (
        <section className="chapter-summary">
          <span className="chapter-summary__label">{chapter.summary.label ?? t('chapter.summaryLabel')}</span>
          <p>{chapter.summary.text}</p>
        </section>
      )}
      {chapter.paragraphs?.map((paragraph, i) => (
        <p key={i} className="chapter__p">
          {paragraph}
        </p>
      ))}
      <SourceNote sourceIds={chapter.sourceIds} onShowSources={onShowSources} />
    </article>
  )
}

export const CHAPTER_VIEWS = {
  text: TextChapter,
  foods: FoodsChapter,
  sources: SourcesChapter,
  process: ProcessChapter,
  object: ObjectChapter,
}
