import { getEra } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 畫面中央的章節標題：開始探索與切換年代時浮現（在霧氣中淡入、停留後淡出）。
 * 以 nonce 作為 key，每次切換都重新播放動畫。
 */
export function ChapterCard() {
  const card = useGameStore((state) => state.titleCard)
  const started = useGameStore((state) => state.started)
  const era = card ? getEra(card.eraId) : null
  if (!started || !era) return null
  return (
    <div className="chapter-card" key={card.nonce} aria-live="polite">
      <span className="chapter-card__chapter">{era.chapter}</span>
      <span className="chapter-card__rule" aria-hidden="true" />
      <span className="chapter-card__years">{era.yearRange}</span>
      <h2 className="chapter-card__title">{era.title}</h2>
      <p className="chapter-card__desc">{era.description}</p>
      <p className="chapter-card__mood">{era.mood}</p>
    </div>
  )
}
