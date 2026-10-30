import { useCallback } from 'react'
import { useGameStore } from '../state/useGameStore.js'
import { localize, translate } from './lang.js'

/** 元件取字串：const t = useT(); t('intro.start') */
export function useT() {
  const lang = useGameStore((state) => state.lang)
  return useCallback((key, params) => translate(lang, key, params), [lang])
}

/** 資料物件的在地化：const L = useLocalizer(); const era = L(getEra(id)) */
export function useLocalizer() {
  const lang = useGameStore((state) => state.lang)
  return useCallback((data) => localize(data, lang), [lang])
}
