import { useEffect, useRef } from 'react'
import { getQualitySettings } from '../game/quality.js'
import { useGameStore } from '../state/useGameStore.js'

const MODE_ORDER = ['smooth', 'fine']

function specs(q) {
  return q.id === 'smooth'
    ? [`解析度最高 ×${q.dpr.toFixed(2)}`, `陰影貼圖 ${q.shadowMapSize}`, '關閉景深、光暈與環境遮蔽', '精簡遠景裝飾與蒸氣']
    : [`解析度最高 ×${q.dpr.toFixed(2)}`, `陰影貼圖 ${q.shadowMapSize}（柔和陰影）`, '環境遮蔽、輕微光暈與景深', '完整的遠景與街景裝飾']
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
 * 右上角的畫質設定（齒輪）：流暢（適合 iPad）／精緻（適合電腦）。
 * 選擇會記在這台裝置上，切換後立即套用到 3D 畫面，不需要重新整理。
 */
export function QualitySettings() {
  const mode = useGameStore((state) => state.qualityMode)
  const open = useGameStore((state) => state.qualityOpen)
  const togglePanel = useGameStore((state) => state.toggleQualityPanel)
  const setQualityMode = useGameStore((state) => state.setQualityMode)
  const container = useRef(null)

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
        aria-label="畫質設定"
        title="畫質設定"
        aria-expanded={open}
        aria-controls="quality-panel"
        onClick={() => togglePanel()}
      >
        <GearIcon />
      </button>
      {open && (
        <div id="quality-panel" className="hud-quality__panel paper" role="dialog" aria-label="畫質設定">
          <p className="hud-menu__heading">
            <span>畫質設定</span>
          </p>
          <div className="quality-options" role="radiogroup" aria-label="畫質模式">
            {MODE_ORDER.map((id) => {
              const q = getQualitySettings(id)
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
                    {specs(q).map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="hud-menu__note">選擇會記在這台裝置上。兩種模式的店家、歷史資訊與互動完全相同。</p>
        </div>
      )}
    </div>
  )
}
