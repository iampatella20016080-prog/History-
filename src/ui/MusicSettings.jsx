import { useStore } from 'zustand'
import { audioManager } from '../audio/AudioManager.js'
import { getMusicTrack } from '../audio/musicTracks.js'
import { useLocalizer, useT } from '../i18n/useT.js'

const STATUS_KEYS = ['idle', 'loading', 'playing', 'blocked', 'paused', 'off', 'error', 'unsupported']

/** 設定面板中的「背景音樂：開／關」與音量（選擇記在這台裝置上） */
export function MusicSettings() {
  const t = useT()
  const L = useLocalizer()
  const enabled = useStore(audioManager.store, (s) => s.enabled)
  const volume = useStore(audioManager.store, (s) => s.volume)
  const status = useStore(audioManager.store, (s) => s.status)
  const trackEraId = useStore(audioManager.store, (s) => s.trackEraId)
  const track = getMusicTrack(trackEraId)
  const percent = Math.round(volume * 100)

  return (
    <div className="music-settings" data-music-status={status}>
      <div className="music-settings__row">
        <span className="music-settings__label" id="music-toggle-label">
          {t('music.title')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="music-toggle-label"
          className={`music-switch${enabled ? ' is-on' : ''}`}
          data-music-toggle
          onClick={() => audioManager.setEnabled(!enabled)}
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
          aria-label={t('music.volume')}
          aria-valuetext={`${percent}%`}
          data-music-volume
          onChange={(event) => audioManager.setVolume(Number(event.target.value) / 100)}
        />
        <output>{percent}%</output>
      </label>
      <p className="music-settings__status">
        {STATUS_KEYS.includes(status) ? t(`music.status.${status}`) : ''}
        {status === 'playing' && track ? t('music.playingTrack', { title: L(track).title }) : ''}
        {(status === 'blocked' || status === 'error') && (
          <button type="button" className="button-ghost music-settings__retry" onClick={() => audioManager.retry()}>
            {status === 'blocked' ? t('music.enable') : t('music.retry')}
          </button>
        )}
      </p>
      <p className="music-settings__note">{t('music.note')}</p>
    </div>
  )
}

/** 音樂被瀏覽器阻擋或載入失敗時，畫面上的簡短提示（可點擊） */
export function MusicNotice() {
  const t = useT()
  const L = useLocalizer()
  const status = useStore(audioManager.store, (s) => s.status)
  if (status === 'blocked') {
    return (
      <button type="button" className="music-notice paper" data-music-notice="blocked" onClick={() => audioManager.retry()}>
        <span aria-hidden="true">♪</span> {t('music.enable')}
      </button>
    )
  }
  if (status === 'error') {
    return (
      <div className="music-notice paper is-error" data-music-notice="error" role="status">
        {t('music.loadFailed')}
        <button type="button" className="button-ghost" onClick={() => audioManager.retry()}>
          {t('music.retry')}
        </button>
      </div>
    )
  }
  return null
}
