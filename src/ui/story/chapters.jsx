import { useEffect, useRef, useState } from 'react'
import { getSource } from '../../data/sources.js'
import { FoodIllustration } from '../FoodIllustration.jsx'
import { PHOTOS } from './photos.js'

/**
 * 店家介紹的章節版型。所有店家共用；版型由章節資料的 type 決定：
 * text（文字）、foods（食物圖鑑）、sources（文獻）、process（步驟動畫，例如碾米）、object（可以拖曳旋轉的器物，例如米斗）。
 */

function SourceNote({ sourceIds, onShowSources }) {
  const sources = (sourceIds ?? []).map(getSource).filter(Boolean)
  if (!sources.length) return null
  return (
    <p className="chapter__source">
      <span className="chapter__source-label">資料來源</span>
      {sources.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
          {source.citation}
        </a>
      ))}
      {onShowSources && (
        <button type="button" className="text-button" onClick={onShowSources}>
          查看文獻頁
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
  return (
    <article className="chapter chapter--text">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__lead">{chapter.lead}</p>

      {chapter.seals && (
        <div className="seal-row" aria-label="家族商號">
          {chapter.seals.map((seal) => (
            <span key={seal} className="seal-stamp">
              {seal}
            </span>
          ))}
        </div>
      )}

      {chapter.summary && (
        <section className="chapter-summary">
          <span className="chapter-summary__label">{chapter.summary.label ?? '網站延伸整理'}</span>
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
          <h4 className="glossary__title">名詞小辭典</h4>
          <dl>
            {chapter.glossary.map((entry) => (
              <div key={entry.term} className="glossary__row">
                <dt>
                  {entry.term}
                  {entry.taiwanese && (
                    <span className="glossary__tai" lang="nan-Latn-TW" title="教育部《臺灣台語常用詞辭典》台羅讀音">
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
              <FoodIllustration id={item.id} label={`${item.name}插圖`} />
            </div>
            <figcaption className="food-card__body">
              <h4 className="food-card__name">{item.name}</h4>
              <p className="food-card__desc">{item.description}</p>
              {item.note && (
                <p className="food-card__note">
                  <span className="food-card__note-label">文獻小記</span>
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
              <span className="source__open">開啟原始網頁 ↗</span>
            </a>
            {(source.published || source.usage) && (
              <dl className="source__meta">
                {source.published && (
                  <div>
                    <dt>出版時間</dt>
                    <dd>{source.published}</dd>
                  </div>
                )}
                {source.usage && (
                  <div>
                    <dt>用途</dt>
                    <dd>{source.usage}</dd>
                  </div>
                )}
              </dl>
            )}
            {source.context && <p className="source__context">{source.context}</p>}
            {source.records?.length > 0 && (
              <div className="source__records">
                <h4>原頁面刊載的史料</h4>
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
          <h4>關於本場景</h4>
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
          {playing ? '暫停' : '播放'}
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

/** 米斗的 CSS 立體模型：四片梯形的木板（上寬下窄）、金屬角件、斗底與斗裡的米 */
function RiceMeasureModel({ rotation }) {
  return (
    <div className="measure3d__model" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
      {[0, 90, 180, 270].map((angle) => (
        <div key={angle} className="measure3d__side" style={{ transform: `rotateY(${angle}deg) translateZ(var(--measure-half)) rotateX(var(--measure-tilt))` }}>
          <span className="measure3d__corner is-left" />
          <span className="measure3d__corner is-right" />
        </div>
      ))}
      <div className="measure3d__bottom" />
      <div className="measure3d__rice" />
    </div>
  )
}

/** 可以拖曳旋轉的器物（例如米斗；滑鼠拖曳或手指滑動；沒有碰過時慢慢自己轉） */
export function ObjectChapter({ chapter, onShowSources }) {
  const [rotation, setRotation] = useState({ x: -24, y: 32 })
  const drag = useRef(null)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (touched || prefersReducedMotion()) return undefined
    const timer = setInterval(() => setRotation((r) => ({ ...r, y: r.y + 0.6 })), 40)
    return () => clearInterval(timer)
  }, [touched])
  // 拖曳旋轉時不讓介紹視窗把手指的滑動當成換章節
  const onPointerDown = (event) => {
    event.stopPropagation()
    drag.current = { x: event.clientX, y: event.clientY, start: rotation }
    setTouched(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const onPointerMove = (event) => {
    if (!drag.current) return
    const { x, y, start } = drag.current
    setRotation({ x: Math.max(-80, Math.min(30, start.x - (event.clientY - y) * 0.5)), y: start.y + (event.clientX - x) * 0.6 })
  }
  const onPointerUp = (event) => {
    event.stopPropagation()
    drag.current = null
  }
  return (
    <article className="chapter chapter--object">
      <h3 className="chapter__title">{chapter.title}</h3>
      <p className="chapter__lead">{chapter.lead}</p>
      <div
        className="measure3d"
        role="img"
        aria-label={`${chapter.tab ?? '器物'}的立體模型，可以拖曳旋轉`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <RiceMeasureModel rotation={rotation} />
        <span className="measure3d__hint">拖曳旋轉</span>
      </div>
      {chapter.summary && (
        <section className="chapter-summary">
          <span className="chapter-summary__label">{chapter.summary.label ?? '網站延伸整理'}</span>
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
