import { useEffect } from 'react'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 把年代狀態寫在 <html> 的 data 屬性上（data-era、data-era-transition、data-era-request），
 * 方便自動化測試確認每次切換都有正常完成，也可作為 CSS 依年代調整樣式的掛勾。
 * 實際掛載中的街景年代由 EraScene 寫入 data-scene-era。
 */
export function useEraDocumentState() {
  useEffect(() => {
    const apply = (state) => {
      const data = document.documentElement.dataset
      data.era = state.eraId
      data.eraTransition = state.transitioning ? 'running' : 'idle'
      data.eraRequest = String(state.eraRequestSeq)
    }
    apply(useGameStore.getState())
    return useGameStore.subscribe(apply)
  }, [])
}
