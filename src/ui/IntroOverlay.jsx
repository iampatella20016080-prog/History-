import { useEffect, useRef } from 'react'
import { getEra } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'

/** 開場畫面：說明情境與操作方式，按下「開始探索」後進入街道 */
export function IntroOverlay() {
  const started = useGameStore((state) => state.started)
  const start = useGameStore((state) => state.start)
  const era = getEra(useGameStore((state) => state.eraId))
  const button = useRef(null)
  const touchDevice = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

  useEffect(() => {
    if (!started) button.current?.focus({ preventScroll: true })
  }, [started])

  return (
    <div className={`intro${started ? ' is-hidden' : ''}`} aria-hidden={started}>
      <div className="intro__card paper">
        <p className="intro__chapter">
          第一章｜{era?.years} {era?.name}
        </p>
        <h2 className="intro__title">大稻埕食光街</h2>
        <p className="intro__subtitle">走進170年的飲食記憶</p>
        <div className="intro__divider" aria-hidden="true">
          <span />◆<span />
        </div>
        <p className="intro__text">
          你是一位走訪大稻埕的旅人。1853年後，移居此地的人們沿著淡水河岸開設商號，
          南北貨與茶葉在街上往來。沿著街道漫步，走近商號、按下 <kbd>E</kbd>，
          讀一讀店家與食物背後的故事。
        </p>
        <ul className="intro__controls">
          <li>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> 或方向鍵　移動
          </li>
          <li>
            <kbd>Shift</kbd> 快走
          </li>
          <li>
            <kbd>拖曳滑鼠</kbd> 旋轉視角
          </li>
          <li>
            <kbd>E</kbd> 探索店家・<kbd>Esc</kbd> 返回
          </li>
        </ul>
        {touchDevice && <p className="intro__warning">本原型目前以桌面瀏覽器與鍵盤操作為主。</p>}
        <button ref={button} type="button" className="intro__start" onClick={start} tabIndex={started ? -1 : 0}>
          開始探索
        </button>
        <p className="intro__note">場景為十九世紀大稻埕商業街區氛圍的概念性重建，並非精確復原。</p>
      </div>
    </div>
  )
}
