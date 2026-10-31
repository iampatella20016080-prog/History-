import { useEffect, useRef } from 'react'
import { ERAS, getEra } from '../data/eras.js'
import { getQualitySettings } from '../game/quality.js'
import { WEATHER_IDS, weatherAvailable } from '../game/weather.js'
import { TIME_IDS, timeAvailable } from '../game/night.js'
import { useGameStore } from '../state/useGameStore.js'
import { AmbienceSettings } from './AmbienceSettings.jsx'
import { MusicSettings } from './MusicSettings.jsx'
import { LANGS } from '../i18n/lang.js'
import { useLocalizer, useT } from '../i18n/useT.js'

const MODE_ORDER = ['smooth', 'fine']

function specs(q, t) {
  const dpr = t('settings.spec.dpr', { dpr: q.dpr.toFixed(2) })
  return q.id === 'smooth'
    ? [dpr, t('settings.spec.shadow', { size: q.shadowMapSize }), t('settings.spec.smooth1'), t('settings.spec.smooth2')]
    : [dpr, t('settings.spec.shadowSoft', { size: q.shadowMapSize }), t('settings.spec.fine1'), t('settings.spec.fine2')]
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6a.5.5 0 0 0 .1-.6l-1.9-3.3a.5.5 0 0 0-.6-.2l-2.4 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6A.5.5 0 0 0 14 2h-3.8a.5.5 0 0 0-.5.4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1a.5.5 0 0 0-.6.2L2.7 8.5a.5.5 0 0 0 .1.6L4.8 11a7.5 7.5 0 0 0 0 2l-2 1.6a.5.5 0 0 0-.1.6l1.9 3.3a.5.5 0 0 0 .6.2l2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.6a.5.5 0 0 0 .5.4H14a.5.5 0 0 0 .5-.4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1a.5.5 0 0 0 .6-.2l1.9-3.3a.5.5 0 0 0-.1-.6zM12.1 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
      />
    </svg>
  )
}

/**
 * 年代切換：五個年代，點一下即可切換（轉場進行中、閱讀店家介紹時暫時不能切換）。
 * 切換後設定面板保持開啟，可以連續切換；建築觀賞模式中切換年代時，鏡頭位置與方向不變。
 */
function EraSection({ touch }) {
  const eraId = useGameStore((state) => state.eraId)
  const transition = useGameStore((state) => state.eraTransition)
  const transitioning = useGameStore((state) => state.transitioning)
  const worldReady = useGameStore((state) => state.worldReady)
  const mode = useGameStore((state) => state.mode)
  const requestEra = useGameStore((state) => state.requestEra)
  const t = useT()
  const L = useLocalizer()
  const shownId = transition?.to ?? eraId
  const era = L(getEra(shownId))
  const locked = transitioning || !worldReady || mode !== 'explore'

  return (
    <section className={`settings-section${transitioning ? ' is-transitioning' : ''}`} aria-labelledby="settings-era-heading">
      <p className="hud-menu__heading">
        <span id="settings-era-heading">{t('settings.era')}</span>
        <span className="hud-menu__count">{transitioning ? t('settings.eraSwitching') : touch ? t('settings.eraTouch') : t('settings.eraKeys')}</span>
      </p>
      <ol className="era-options">
        {L(ERAS).map((item, index) => {
          const active = item.id === shownId
          return (
            <li key={item.id}>
              <button
                type="button"
                data-era-option={item.id}
                className={`era-option${active ? ' is-active' : ''}`}
                aria-pressed={active}
                aria-label={`${item.yearRange} ${item.title}`}
                disabled={locked && !active}
                onClick={() => requestEra(item.id)}
              >
                <span className="era-option__index" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="era-option__years">{item.yearRange}</span>
                <span className="era-option__title">{item.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {era && <p className="era-options__desc">{era.description}</p>}
    </section>
  )
}

/** 觀看模式：探索（操控人物）／建築觀賞（自由鏡頭）；觀賞模式可隱藏介面 */
function ViewModeSection() {
  const viewMode = useGameStore((state) => state.viewMode)
  const canEnter = useGameStore((state) => state.started && state.mode === 'explore')
  const setViewMode = useGameStore((state) => state.setViewMode)
  const setUiHidden = useGameStore((state) => state.setUiHidden)
  const t = useT()
  const L = useLocalizer()
  const togglePanel = useGameStore((state) => state.toggleQualityPanel)
  const options = [
    { id: 'explore', label: t('settings.view.explore'), hint: t('settings.view.exploreHint') },
    { id: 'viewer', label: t('settings.view.viewer'), hint: t('settings.view.viewerHint') },
  ]

  return (
    <section className="settings-section" aria-labelledby="settings-view-heading">
      <p className="hud-menu__heading">
        <span id="settings-view-heading">{t('settings.view')}</span>
      </p>
      <div className="mode-options" role="radiogroup" aria-labelledby="settings-view-heading">
        {options.map((option) => {
          const active = viewMode === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-view-mode={option.id}
              className={`mode-option${active ? ' is-active' : ''}`}
              disabled={!active && option.id === 'viewer' && !canEnter}
              onClick={() => {
                if (setViewMode(option.id)) togglePanel(false)
              }}
            >
              <strong>{option.label}</strong>
              <small>{option.hint}</small>
            </button>
          )
        })}
      </div>
      {viewMode === 'viewer' && (
        <button type="button" className="button-ghost settings-hide-ui" data-hide-ui onClick={() => setUiHidden(true)}>
          {t('settings.hideUi')}
        </button>
      )}
    </section>
  )
}

/**
 * 天氣：晴／雨（第 14 階段）。只在精緻畫質顯示；流暢畫質（iPad）沒有這一段，畫面一律是晴天。
 * 選擇記在這台裝置上，切到流暢畫質再切回來時仍然記得。
 */
function WeatherSection() {
  const weather = useGameStore((state) => state.weather)
  const setWeather = useGameStore((state) => state.setWeather)
  const t = useT()
  return (
    <section className="settings-section" aria-labelledby="settings-weather-heading" data-weather-section>
      <p className="hud-menu__heading">
        <span id="settings-weather-heading">{t('settings.weather')}</span>
      </p>
      <div className="mode-options" role="radiogroup" aria-labelledby="settings-weather-heading">
        {WEATHER_IDS.map((id) => {
          const active = weather === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              data-weather-option={id}
              className={`mode-option${active ? ' is-active' : ''}`}
              onClick={() => setWeather(id)}
            >
              <strong>{t(`settings.weather.${id}`)}</strong>
              <small>{t(`settings.weather.${id}Hint`)}</small>
            </button>
          )
        })}
      </div>
      <p className="hud-menu__note">{t('settings.weatherNote')}</p>
    </section>
  )
}

/**
 * 時段：白天／夜晚（第 14 階段）。只在精緻畫質顯示，可以和雨天同時開；流暢畫質一律是年代原本的時刻。
 */
function TimeSection() {
  const timeOfDay = useGameStore((state) => state.timeOfDay)
  const setTimeOfDay = useGameStore((state) => state.setTimeOfDay)
  const t = useT()
  return (
    <section className="settings-section" aria-labelledby="settings-time-heading" data-time-section>
      <p className="hud-menu__heading">
        <span id="settings-time-heading">{t('settings.time')}</span>
      </p>
      <div className="mode-options" role="radiogroup" aria-labelledby="settings-time-heading">
        {TIME_IDS.map((id) => {
          const active = timeOfDay === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              data-time-option={id}
              className={`mode-option${active ? ' is-active' : ''}`}
              onClick={() => setTimeOfDay(id)}
            >
              <strong>{t(`settings.time.${id}`)}</strong>
              <small>{t(`settings.time.${id}Hint`)}</small>
            </button>
          )
        })}
      </div>
      <p className="hud-menu__note">{t('settings.timeNote')}</p>
    </section>
  )
}

/**
 * 右上角的設定（齒輪）：
 * - 年代：五個年代的切換
 * - 觀看模式：探索／建築觀賞（含隱藏介面）
 * - 畫質：流暢（適合 iPad）／精緻（適合電腦），切換後立即套用到 3D 畫面，不需要重新整理
 * - 天氣：晴／雨；時段：白天／夜晚（都只在精緻畫質顯示）
 * - 背景音樂：開／關與音量
 * 畫質與音樂的選擇會記在這台裝置上。
 */
export function SettingsMenu() {
  const mode = useGameStore((state) => state.qualityMode)
  const open = useGameStore((state) => state.qualityOpen)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const togglePanel = useGameStore((state) => state.toggleQualityPanel)
  const setQualityMode = useGameStore((state) => state.setQualityMode)
  const container = useRef(null)
  const t = useT()
  const L = useLocalizer()
  const lang = useGameStore((state) => state.lang)
  const setLang = useGameStore((state) => state.setLang)
  const setLicensesOpen = useGameStore((state) => state.setLicensesOpen)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!container.current?.contains(event.target)) togglePanel(false)
    }
    const onKeyDown = (event) => {
      if (event.code === 'Escape') togglePanel(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, togglePanel])

  return (
    <div className="hud-quality" ref={container}>
      <button
        type="button"
        className="hud-quality__toggle paper"
        aria-label={t('settings.label')}
        title={t('settings.label')}
        aria-expanded={open}
        aria-controls="quality-panel"
        onClick={() => togglePanel()}
      >
        <GearIcon />
      </button>
      {open && (
        <div id="quality-panel" className="hud-quality__panel paper" role="dialog" aria-label={t('settings.dialog')} data-scrollable>
          <EraSection touch={touch} />
          <ViewModeSection />
          <p className="hud-menu__heading">
            <span>{t('settings.quality')}</span>
          </p>
          <div className="quality-options" role="radiogroup" aria-label={t('settings.qualityMode')}>
            {MODE_ORDER.map((id) => {
              const q = L(getQualitySettings(id))
              const active = mode === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-quality-option={id}
                  className={`quality-option${active ? ' is-active' : ''}`}
                  onClick={() => setQualityMode(id)}
                >
                  <span className="quality-option__title">
                    {q.label}
                    <small>{q.hint}</small>
                  </span>
                  <span className="quality-option__specs">
                    {specs(q, t).map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="hud-menu__note">{t('settings.qualityNote')}</p>
          {weatherAvailable(mode) && <WeatherSection />}
          {timeAvailable(mode) && <TimeSection />}
          <MusicSettings />
          <AmbienceSettings />
          <section className="settings-section" aria-labelledby="settings-lang-heading">
            <p className="hud-menu__heading">
              <span id="settings-lang-heading">{t('settings.language')}</span>
            </p>
            <div className="mode-options" role="radiogroup" aria-labelledby="settings-lang-heading">
              {LANGS.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={lang === id}
                  lang={id}
                  data-lang-option={id}
                  className={`mode-option${lang === id ? ' is-active' : ''}`}
                  onClick={() => setLang(id)}
                >
                  <strong>{t(`lang.${id}`)}</strong>
                </button>
              ))}
            </div>
            <p className="hud-menu__note">{t('settings.languageNote')}</p>
            <button type="button" className="button-ghost" data-licenses-toggle onClick={() => setLicensesOpen(true)}>
              {t('settings.licenses')}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
