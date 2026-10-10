import { useEffect, useRef } from 'react'
import { ERAS } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'

/** 開場畫面：說明情境與操作方式（觸控與鍵盤各自說明），按下「開始探索」後進入街道 */
export function IntroOverlay() {
  const started = useGameStore((state) => state.started)
  const start = useGameStore((state) => state.start)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const button = useRef(null)

  useEffect(() => {
    if (!started) button.current?.focus({ preventScroll: true })
  }, [started])

  return (
    <div className={`intro${started ? ' is-hidden' : ''}`} aria-hidden={started}>
      <div className="intro__card paper" data-scrollable>
        <p className="intro__chapter">
          五個年代｜{ERAS[0].yearRange.split('–')[0]}–今
        </p>
        <h2 className="intro__title">大稻埕食光街</h2>
        <p className="intro__subtitle">走進170年的飲食記憶</p>
        <div className="intro__divider" aria-hidden="true">
          <span />◆<span />
        </div>
        <p className="intro__text">
          你是一位走訪大稻埕的旅人。1853年後，移居此地的人們沿著淡水河岸開設商號，南北貨與茶葉在街上往來；
          之後的一百七十年間，這條街經歷了酒樓繁華、摩登年代、庶民生活與老屋新生。
          沿著街道漫步，走近商號讀一讀店家與食物背後的故事，也可以用上方的時間軸，看看同一條街在不同年代的模樣。
        </p>
        <ol className="intro__eras" aria-label="五個年代">
          {ERAS.map((era) => (
            <li key={era.id}>
              <span>{era.yearRange}</span>
              {era.title}
            </li>
          ))}
        </ol>
        {touch ? (
          <ul className="intro__controls">
            <li>
              <kbd>左下搖桿</kbd> 移動
            </li>
            <li>
              <kbd>單指拖曳</kbd> 旋轉視角・<kbd>雙指</kbd> 縮放
            </li>
            <li>
              <kbd>探索店家</kbd> 靠近店家後點一下
            </li>
            <li>
              <kbd>時間軸</kbd> 點上方年代切換時空
            </li>
          </ul>
        ) : (
          <ul className="intro__controls">
            <li>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> 或方向鍵　移動
            </li>
            <li>
              <kbd>Shift</kbd> 快走・<kbd>拖曳滑鼠</kbd> 旋轉視角
            </li>
            <li>
              <kbd>E</kbd> 探索店家・<kbd>Esc</kbd> 返回
            </li>
            <li>
              <kbd>1</kbd>–<kbd>5</kbd> 或點上方時間軸　切換年代
            </li>
          </ul>
        )}
        <button ref={button} type="button" className="intro__start" onClick={start} tabIndex={started ? -1 : 0}>
          開始探索
        </button>
        <p className="intro__note">
          場景為大稻埕各時期街區氛圍的概念性重建，並非精確復原；已不存在的建築（如江山樓）標示為「歷史情境重建」。
        </p>
      </div>
    </div>
  )
}
