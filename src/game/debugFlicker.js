/**
 * 閃爍除錯開關。true 時畫面左下角出現除錯面板（見 components/FlickerDebug.jsx）；
 * 預設關閉，開發時也可以在網址加上 ?debug=flicker 暫時開啟。
 */
export const DEBUG_FLICKER = false

export const DEBUG_FLICKER_ENABLED =
  DEBUG_FLICKER || (typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === 'flicker')

/** 面板的勾選狀態（純資料；距離切換等程式會讀它） */
export const flickerDebugState = { bounds: false, shadows: false, transparent: false, lod: false, facade: false, decals: false }
