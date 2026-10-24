import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { CODE_LICENSE, CONTENT_LICENSE, OPEN_DATA, PHOTO_CREDITS, countSources, groupSourcesByPublisher } from '../data/licenses.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'

/**
 * 「授權與出處」視窗：文字與插圖的授權、程式碼授權、開放資料、老照片，以及所有引用文獻（依出版單位分組）。
 * 內容來自 data/licenses.js；授權條款名稱為正式名稱，不翻譯。
 */
export function LicensesPanel() {
  const open = useGameStore((state) => state.licensesOpen)
  const setOpen = useGameStore((state) => state.setLicensesOpen)
  const t = useT()
  const groups = useMemo(() => groupSourcesByPublisher(), [])

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
  }, [open, setOpen])

  if (!open) return null
  return createPortal(
    <div className="story-layer overview-layer" data-state="open">
      <div className="story-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
      <section id="licenses-panel" className="story paper overview licenses" role="dialog" aria-modal="true" aria-labelledby="licenses-title">
        <header className="story__header">
          <div className="story__seal" aria-hidden="true">
            {t('licenses.seal')}
          </div>
          <div className="story__titles">
            <p className="story__eyebrow">{t('licenses.eyebrow')}</p>
            <h2 id="licenses-title" className="story__title">
              {t('licenses.title')}
            </h2>
            <p className="story__meta">{t('licenses.meta')}</p>
          </div>
          <button type="button" className="story__close" onClick={() => setOpen(false)}>
            <span aria-hidden="true">✕</span> <span className="story__close-label">{t('licenses.close')}</span> <kbd>Esc</kbd>
          </button>
        </header>
        <div className="story__body" data-scrollable>
          <div className="story__page" lang="zh-Hant">
            <h3>{t('licenses.contentHeading')}</h3>
            <p>
              <a href={CONTENT_LICENSE.url} target="_blank" rel="noopener noreferrer">
                {CONTENT_LICENSE.name}
              </a>
            </p>
            <ul>
              {CONTENT_LICENSE.terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
            <p>{CONTENT_LICENSE.scope}</p>

            <h3>{t('licenses.codeHeading')}</h3>
            <p>{CODE_LICENSE.text}</p>

            <h3>{t('licenses.dataHeading')}</h3>
            <ul>
              {OPEN_DATA.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>：{item.license}。{item.note}
                </li>
              ))}
            </ul>

            <h3>{t('licenses.photoHeading')}</h3>
            <p>{PHOTO_CREDITS.text}</p>

            <h3>{t('licenses.sourcesHeading', { count: countSources() })}</h3>
            {groups.map((group) => (
              <details key={group.publisher} className="licenses__group">
                <summary>
                  {group.publisher}（{group.items.length}）
                </summary>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {item.citation}{' '}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.url}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
