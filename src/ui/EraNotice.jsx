import { useEffect } from 'react'
import { getEra } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'

/**
 * 年代切換失敗的提示：街景無法產生時，轉場會退回原本的年代並正常結束，
 * 這裡告訴使用者可以再試一次（提示幾秒後自動收起）。
 */
export function EraNotice() {
  const t = useT()
  const error = useGameStore((state) => state.eraError)
  const dismiss = useGameStore((state) => state.dismissEraError)

  useEffect(() => {
    if (!error) return undefined
    const timer = setTimeout(dismiss, 6000)
    return () => clearTimeout(timer)
  }, [error, dismiss])

  if (!error) return null
  const era = getEra(error.eraId)
  return (
    <div className="era-notice paper" role="status">
      <span>
        {t('eraNotice.text', { label: era ? `${era.yearRange}｜${era.title}` : error.eraId })} {/* TODO(en-data) era.title */}
      </span>
      <button type="button" className="era-notice__close" onClick={dismiss}>
        {t('eraNotice.ok')}
      </button>
    </div>
  )
}
