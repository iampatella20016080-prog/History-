import { useEffect, useRef } from 'react'
import { getEra } from '../../data/eras.js'
import { getShop } from '../../data/shops.js'
import { useGameStore } from '../../state/useGameStore.js'
import { usePresence } from '../usePresence.js'
import { CHAPTER_VIEWS } from './chapters.jsx'

const NUMERALS = ['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌']

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
  const mode = useGameStore((state) => state.mode)
  const activeShopId = useGameStore((state) => state.activeShopId)
  const chapterIndex = useGameStore((state) => state.chapterIndex)
  const setChapter = useGameStore((state) => state.setChapter)
  const closeShop = useGameStore((state) => state.closeShop)
  const open = mode === 'reading'
  const { mounted, state } = usePresence(open, 380)

  const lastShop = useRef(null)
  if (activeShopId) lastShop.current = getShop(activeShopId)
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

  if (!mounted || !shop) return null

  const chapters = shop.chapters
  const index = Math.min(chapterIndex, chapters.length - 1)
  const chapter = chapters[index]
  const View = CHAPTER_VIEWS[chapter.type] ?? CHAPTER_VIEWS.text
  const sourcesIndex = chapters.findIndex((item) => item.type === 'sources')
  const era = getEra(shop.eraId)

  return (
    <div className="story-layer" data-state={state}>
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
                {era.years}｜{era.name}
              </p>
            )}
            <h2 id="story-title" className="story__title">
              {shop.name}
            </h2>
            <p className="story__meta">
              {shop.year}年｜{shop.category}
            </p>
          </div>
          <button type="button" className="story__close" onClick={closeShop}>
            <span aria-hidden="true">✕</span> <span className="story__close-label">關閉</span> <kbd>Esc</kbd>
          </button>
        </header>

        <nav ref={tabs} className="story__tabs" role="tablist" aria-label="店家介紹章節">
          {chapters.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`story__tab${i === index ? ' is-active' : ''}`}
              onClick={() => setChapter(i)}
            >
              <span className="story__tab-number">{NUMERALS[i] ?? i + 1}</span>
              {item.tab}
            </button>
          ))}
        </nav>

        <div ref={body} className="story__body" role="tabpanel">
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
            ‹ 上一頁
          </button>
          <span className="story__pager">
            第 {index + 1} 頁／共 {chapters.length} 頁
          </span>
          <button
            type="button"
            className="story__nav"
            disabled={index === chapters.length - 1}
            onClick={() => setChapter(index + 1)}
          >
            下一頁 ›
          </button>
        </footer>
      </section>
    </div>
  )
}
