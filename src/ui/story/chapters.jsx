import { getSource } from '../../data/sources.js'
import { FoodIllustration } from '../FoodIllustration.jsx'
import { PHOTOS } from './photos.js'

/**
 * 店家介紹的三種章節版型。所有店家共用；版型由章節資料的 type 決定。
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
                <dt>{entry.term}</dt>
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

export const CHAPTER_VIEWS = {
  text: TextChapter,
  foods: FoodsChapter,
  sources: SourcesChapter,
}
