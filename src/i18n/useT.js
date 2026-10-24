import { useCallback } from 'react'
import { useGameStore } from '../state/useGameStore.js'
import { translate } from './lang.js'

/** 元件取字串：const t = useT(); t('intro.start') */
export function useT() {
  const lang = useGameStore((state) => state.lang)
  return useCallback((key, params) => translate(lang, key, params), [lang])
}
