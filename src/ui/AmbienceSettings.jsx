import { useStore } from 'zustand'
import { ambienceManager } from '../audio/AmbienceManager.js'
import { getEraAmbience, AMBIENCE_SOUNDS } from '../audio/ambienceCore.js'

const STATUS_TEXT = {
  idle: '按下「開始探索」後播放',
  playing: '播放中',
  blocked: '瀏覽器暫停了環境音，請點一下畫面或「啟用環境音」',
  paused: '已暫停',
  off: '已關閉',
  error: '載入失敗',
  unsupported: '此瀏覽器不支援網頁音訊',
}

/** 設定面板中的「環境音：開／關」與音量（與背景音樂分開，選擇記在這台裝置上） */
export function AmbienceSettings() {
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
          環境音
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
          aria-label="環境音音量"
          aria-valuetext={`${percent}%`}
          data-ambience-volume
          onChange={(event) => ambienceManager.setVolume(Number(event.target.value) / 100)}
        />
        <output>{percent}%</output>
      </label>
      <p className="music-settings__status">
        {STATUS_TEXT[status] ?? ''}
        {status === 'playing' && labels.length ? `：${labels.join('、')}` : ''}
        {(status === 'blocked' || status === 'error') && (
          <button type="button" className="button-ghost music-settings__retry" onClick={() => ambienceManager.retry()}>
            {status === 'blocked' ? '啟用環境音' : '重試'}
          </button>
        )}
      </p>
      <p className="music-settings__note">河水、人聲、攤販等環境聲依你所在的位置變化；皆為授權清楚（CC0 或公有領域）的真實錄音剪輯，多為情境示意，不是當年當地的錄音（
        <a href={`${import.meta.env.BASE_URL}audio/ambience/CREDITS.md`} target="_blank" rel="noreferrer">
          來源與授權
        </a>
        ）。
      </p>
    </div>
  )
}
