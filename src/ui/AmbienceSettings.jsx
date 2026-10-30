import { useStore } from 'zustand'
import { ambienceManager } from '../audio/AmbienceManager.js'
import { getEraAmbience, AMBIENCE_SOUNDS } from '../audio/ambienceCore.js'
import { useT } from '../i18n/useT.js'

const STATUS_KEYS = ['idle', 'playing', 'blocked', 'paused', 'off', 'error', 'unsupported']

/** 設定面板中的「環境音：開／關」與音量（與背景音樂分開，選擇記在這台裝置上） */
export function AmbienceSettings() {
  const t = useT()
  const enabled = useStore(ambienceManager.store, (s) => s.enabled)
  const volume = useStore(ambienceManager.store, (s) => s.volume)
  const status = useStore(ambienceManager.store, (s) => s.status)
  const eraId = useStore(ambienceManager.store, (s) => s.eraId)
  const percent = Math.round(volume * 100)
  const labels = [...new Set(getEraAmbience(eraId).map((e) => AMBIENCE_SOUNDS[e.sound]?.label))].filter(Boolean)

  return (
    <div className="music-settings" data-ambience-status={status}>
      <div className="music-settings__row">
        <span className="music-settings__label" id="ambience-toggle-label">
          {t('ambience.title')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="ambience-toggle-label"
          className={`music-switch${enabled ? ' is-on' : ''}`}
          data-ambience-toggle
          onClick={() => ambienceManager.setEnabled(!enabled)}
        >
          <span className="music-switch__knob" aria-hidden="true" />
          <span className="music-switch__text">{enabled ? t('music.on') : t('music.off')}</span>
        </button>
      </div>
      <label className="music-settings__volume">
        <span>{t('music.volumeLabel')}</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={percent}
          disabled={!enabled}
          aria-label={t('ambience.volume')}
          aria-valuetext={`${percent}%`}
          data-ambience-volume
          onChange={(event) => ambienceManager.setVolume(Number(event.target.value) / 100)}
        />
        <output>{percent}%</output>
      </label>
      <p className="music-settings__status">
        {STATUS_KEYS.includes(status) ? t(`ambience.status.${status}`) : ''}
        {/* TODO(en-data) AMBIENCE_SOUNDS[].label */}
        {status === 'playing' && labels.length ? t('ambience.playingList', { list: labels.join(t('common.listSep')) }) : ''}
        {(status === 'blocked' || status === 'error') && (
          <button type="button" className="button-ghost music-settings__retry" onClick={() => ambienceManager.retry()}>
            {status === 'blocked' ? t('ambience.enable') : t('music.retry')}
          </button>
        )}
      </p>
      <p className="music-settings__note">{t('ambience.note')}</p>
    </div>
  )
}
