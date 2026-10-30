import { useEffect, useRef } from 'react'
import { getEra } from '../../data/eras.js'
import { getShop, shopYearText } from '../../data/shops.js'
import { useGameStore } from '../../state/useGameStore.js'
import { usePresence } from '../usePresence.js'
import { CHAPTER_VIEWS } from './chapters.jsx'
import { useLocalizer, useT } from '../../i18n/useT.js'

function Corner({ className }) {
  return (
    <svg className={`story__corner ${className}`} viewBox="0 0 28 28" aria-hidden="true">
      <path d="M2 26 V2 H26" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 26 V7 H26" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M7 14 H14 V7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/**
 * 店家介紹視窗（所有店家共用）
 * 米白紙張質感、深褐色字體與細緻邊框；可用分頁、上一頁／下一頁或鍵盤左右鍵切換章節。
 */
export function StoryModal() {
  const t = useT()
  const L = useLocalizer()
  const mode = useGameStore((state) => state.mode)
  const eraId = useGameStore((state) => state.eraId)
  const activeShopId = useGameStore((state) => state.activeShopId)
  const chapterIndex = useGameStore((state) => state.chapterIndex)
  const setChapter = useGameStore((state) => state.setChapter)
  const closeShop = useGameStore((state) => state.closeShop)
  const open = mode === 'reading'
  const { mounted, state } = usePresence(open, 380)
  // 器物 3D 檢視（從器物章節開啟）時，介紹視窗先讓開，關閉檢視再回來
  const inspecting = useGameStore((state) => !!state.inspect)
  const recordJournal = useGameStore((state) => state.recordJournal)

  const lastShop = useRef(null)
  if (activeShopId) lastShop.current = getShop(activeShopId, eraId)
  const shop = lastShop.current

  const dialog = useRef(null)
  const body = useRef(null)

  useEffect(() => {
    if (open) dialog.current?.focus({ preventScroll: true })
  }, [open])

  const tabs = useRef(null)

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
    tabs.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [chapterIndex])

  // 觸控：在內文區左右滑動切換章節（上下滑動仍是捲動）
  const swipe = useRef(null)
  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return
    swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event) => {
    const start = swipe.current
    swipe.current = null
    if (!start || start.id !== event.pointerId || !shop) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return
    const count = shop.chapters.length
    const current = Math.min(useGameStore.getState().chapterIndex, count - 1)
    const next = Math.max(0, Math.min(count - 1, current + (dx < 0 ? 1 : -1)))
    if (next !== current) setChapter(next)
  }

  const chapters = shop?.chapters
  const index = chapters ? Math.min(chapterIndex, chapters.length - 1) : 0
  const chapter = chapters?.[index]

  // 探索手記：讀到帶手記條目的章節（例如寶順洋行的外銷消息）就記下來
  useEffect(() => {
    if (open && chapter?.journal) recordJournal({ ...chapter.journal, eraId })
  }, [open, chapter, eraId, recordJournal])

  if (!mounted || !shop) return null
  const View = CHAPTER_VIEWS[chapter.type] ?? CHAPTER_VIEWS.text
  const sourcesIndex = chapters.findIndex((item) => item.type === 'sources')
  const era = L(getEra(eraId))
  const eraNote = shop.eraNotes?.[eraId]

  return (
    <div className={`story-layer${inspecting ? ' is-inspecting' : ''}`} data-state={state}>
      <div className="story-backdrop" aria-hidden="true" />
      <section
        ref={dialog}
        className="story paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-title"
        tabIndex={-1}
      >
        <Corner className="is-tl" />
        <Corner className="is-tr" />
        <Corner className="is-bl" />
        <Corner className="is-br" />

        <header className="story__header">
          <div className="story__seal" aria-hidden="true">
            {shop.seal ?? shop.category}
          </div>
          <div className="story__titles">
            {era && (
              <p className="story__eyebrow">
                {era.chapter}・{era.yearRange}｜{era.title}
              </p>
            )}
            <h2 id="story-title" className="story__title">
              {shop.name}
            </h2>
            <p className="story__meta">
              {shopYearText(shop) ? `${shopYearText(shop)}｜` : ''}
              {shop.category}
              {shop.reconstruction && <span className="story__badge">{t('story.reconstruction')}</span>}
            </p>
          </div>
          <button type="button" className="story__close" onClick={closeShop}>
            <span aria-hidden="true">✕</span> <span className="story__close-label">{t('common.close')}</span> <kbd>Esc</kbd>
          </button>
        </header>

        <nav ref={tabs} className="story__tabs" role="tablist" aria-label={t('story.chaptersLabel')}>
          {chapters.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`story__tab${i === index ? ' is-active' : ''}`}
              onClick={() => setChapter(i)}
            >
              <span className="story__tab-number">{i < 8 ? t(`numeral.${i + 1}`) : i + 1}</span>
              {item.tab}
            </button>
          ))}
        </nav>

        <div
          ref={body}
          className="story__body"
          role="tabpanel"
          data-scrollable
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
        >
          {index === 0 && eraNote && era && (
            <aside className="era-note">
              <p className="era-note__label">
                {t('story.eraNote', { name: shop.name, range: era.yearRange })}
              </p>
              <p className="era-note__text">{eraNote}</p>
            </aside>
          )}
          <div key={chapter.id} className="story__page">
            <View
              chapter={chapter}
              shop={shop}
              onShowSources={sourcesIndex >= 0 && sourcesIndex !== index ? () => setChapter(sourcesIndex) : null}
            />
          </div>
        </div>

        <footer className="story__footer">
          <button type="button" className="story__nav" disabled={index === 0} onClick={() => setChapter(index - 1)}>
            {t('story.prev')}
          </button>
          <span className="story__pager">
            {t('story.pager', { n: index + 1, total: chapters.length })}
          </span>
          <button
            type="button"
            className="story__nav"
            disabled={index === chapters.length - 1}
            onClick={() => setChapter(index + 1)}
          >
            {t('story.next')}
          </button>
        </footer>
      </section>
    </div>
  )
}
