import { useStore } from 'zustand'
import { audioManager } from '../audio/AudioManager.js'
import { getMusicTrack } from '../audio/musicTracks.js'

const STATUS_TEXT = {
  idle: '按下「開始探索」後播放',
  loading: '載入中…',
  playing: '播放中',
  blocked: '瀏覽器暫停了音樂，請點「啟用音樂」',
  paused: '已暫停',
  off: '已關閉',
  error: '載入失敗',
  unsupported: '此瀏覽器不支援網頁音訊',
}

/** 設定面板中的「背景音樂：開／關」與音量（選擇記在這台裝置上） */
export function MusicSettings() {
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
          背景音樂
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
          <span className="music-switch__text">{enabled ? '開' : '關'}</span>
        </button>
      </div>
      <label className="music-settings__volume">
        <span>音量</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={percent}
          disabled={!enabled}
          aria-label="背景音樂音量"
          aria-valuetext={`${percent}%`}
          data-music-volume
          onChange={(event) => audioManager.setVolume(Number(event.target.value) / 100)}
        />
        <output>{percent}%</output>
      </label>
      <p className="music-settings__status">
        {STATUS_TEXT[status] ?? ''}
        {status === 'playing' && track ? `：${track.title}` : ''}
        {(status === 'blocked' || status === 'error') && (
          <button type="button" className="button-ghost music-settings__retry" onClick={() => audioManager.retry()}>
            {status === 'blocked' ? '啟用音樂' : '重試'}
          </button>
        )}
      </p>
      <p className="music-settings__note">五個年代各一首 15 秒循環的「合成配樂草稿」（程式合成，非真實樂器錄音）。</p>
    </div>
  )
}

/** 音樂被瀏覽器阻擋或載入失敗時，畫面上的簡短提示（可點擊） */
export function MusicNotice() {
  const status = useStore(audioManager.store, (s) => s.status)
  if (status === 'blocked') {
    return (
      <button type="button" className="music-notice paper" data-music-notice="blocked" onClick={() => audioManager.retry()}>
        <span aria-hidden="true">♪</span> 啟用音樂
      </button>
    )
  }
  if (status === 'error') {
    return (
      <div className="music-notice paper is-error" data-music-notice="error" role="status">
        背景音樂載入失敗
        <button type="button" className="button-ghost" onClick={() => audioManager.retry()}>
          重試
        </button>
      </div>
    )
  }
  return null
}
