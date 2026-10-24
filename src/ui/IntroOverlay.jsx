import { useEffect, useRef } from 'react'
import { ERAS } from '../data/eras.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'

/** 開場畫面：說明情境與操作方式（觸控與鍵盤各自說明），按下「開始探索」後進入街道 */
export function IntroOverlay() {
  const started = useGameStore((state) => state.started)
  const start = useGameStore((state) => state.start)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const button = useRef(null)
  const t = useT()

  useEffect(() => {
    if (!started) button.current?.focus({ preventScroll: true })
  }, [started])

  return (
    <div className={`intro${started ? ' is-hidden' : ''}`} aria-hidden={started}>
      <div className="intro__card paper" data-scrollable>
        <p className="intro__chapter">
          {t('intro.chapter', { from: ERAS[0].yearRange.split('–')[0] })}
        </p>
        <h2 className="intro__title">{t('intro.title')}</h2>
        <p className="intro__subtitle">{t('intro.subtitle')}</p>
        <div className="intro__divider" aria-hidden="true">
          <span />◆<span />
        </div>
        <p className="intro__text">
          {t('intro.text')}
        </p>
        <ol className="intro__eras" aria-label={t('intro.erasLabel')}>
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
              <kbd>{t('intro.touch.joystick')}</kbd> {t('intro.touch.joystickText')}
            </li>
            <li>
              <kbd>{t('intro.touch.drag')}</kbd> {t('intro.touch.dragText')}<kbd>{t('intro.touch.pinch')}</kbd> {t('intro.touch.pinchText')}
            </li>
            <li>
              <kbd>{t('intro.touch.tap')}</kbd> {t('intro.touch.tapText')}
            </li>
            <li>
              <kbd>{t('intro.touch.gear')}</kbd> {t('intro.touch.gearText')}
            </li>
          </ul>
        ) : (
          <ul className="intro__controls">
            <li>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> {t('intro.key.moveText')}
            </li>
            <li>
              <kbd>Shift</kbd> {t('intro.key.run')}<kbd>{t('intro.key.drag')}</kbd> {t('intro.key.dragText')}
            </li>
            <li>
              <kbd>E</kbd> {t('intro.key.enterText')}<kbd>Esc</kbd> {t('intro.key.escText')}
            </li>
            <li>
              <kbd>1</kbd>–<kbd>5</kbd> {t('intro.key.eraText')}
            </li>
          </ul>
        )}
        <button ref={button} type="button" className="intro__start" onClick={start} tabIndex={started ? -1 : 0}>
          {t('intro.start')}
        </button>
        <p className="intro__note">
          {t('intro.note')}
        </p>
      </div>
    </div>
  )
}
