import { useEffect, useRef, useState } from 'react'
import { getInspectObject } from '../data/inspectObjects.js'
import { getSource } from '../data/sources.js'
import { inspectRuntime } from '../game/inspectRuntime.js'
import { rotateInspect, toggleInspectAction, zoomInspect } from '../game/objectInspect.js'
import { useGameStore } from '../state/useGameStore.js'
import { usePresence } from './usePresence.js'
import { useT } from '../i18n/useT.js'

/**
 * 器物 3D 檢視的介面層：器物本身畫在主畫面的畫布（components/ObjectStage.jsx），
 * 這一層只有手勢區（拖曳旋轉、滾輪或雙指縮放）與下方的說明卡片（標題、小動作、說明與出處）。
 */
export function InspectOverlay() {
  const t = useT()
  const inspect = useGameStore((state) => state.inspect)
  const closeInspect = useGameStore((state) => state.closeInspect)
  const { mounted, state } = usePresence(!!inspect, 300)
  // 小動作按鈕的文字要跟著做了沒（檢視狀態在 inspectRuntime，不觸發 React）：自己記一份目標
  const [actionOn, setActionOn] = useState({})
  const pointers = useRef(new Map())
  const pinch = useRef(0)

  useEffect(() => {
    if (inspect) setActionOn({})
  }, [inspect])

  const last = useRef(null)
  if (inspect) last.current = inspect
  const object = last.current ? getInspectObject(last.current.objectId) : null
  if (!mounted || !object) return null

  const sources = (object.sourceIds ?? []).map(getSource).filter(Boolean)

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }
  const onPointerMove = (event) => {
    const prev = pointers.current.get(event.pointerId)
    if (!prev) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      // 雙指：捏合縮放
      const [a, b] = [...pointers.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch.current > 0) inspectRuntime.value = zoomInspect(inspectRuntime.value, distance / pinch.current)
      pinch.current = distance
      return
    }
    inspectRuntime.value = rotateInspect(inspectRuntime.value, (event.clientX - prev.x) * 0.012, (event.clientY - prev.y) * 0.01)
  }
  const onPointerUp = (event) => {
    pointers.current.delete(event.pointerId)
    pinch.current = 0
  }
  const onWheel = (event) => {
    inspectRuntime.value = zoomInspect(inspectRuntime.value, event.deltaY < 0 ? 1.08 : 0.92)
  }

  const toggle = (id) => {
    inspectRuntime.value = toggleInspectAction(inspectRuntime.value, id)
    setActionOn((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="inspect-layer" data-state={state}>
      <div
        className="inspect-stage"
        role="img"
        aria-label={t('inspect.label', { title: object.title })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <span className="inspect-stage__hint">{t('inspect.hint')}</span>
      </div>
      <button type="button" className="inspect-close paper" onClick={closeInspect}>
        <span aria-hidden="true">✕</span> {t('common.close')} <kbd>Esc</kbd>
      </button>
      <section className="inspect-card paper" aria-label={object.title}>
        <header className="inspect-card__header">
          <h3 className="inspect-card__title">{object.title}</h3>
          {object.reconstruction && <span className="story__badge">{t('common.reconstruction')}</span>}
        </header>
        <p className="inspect-card__lead">{object.lead}</p>
        {object.actions?.length > 0 && (
          <div className="inspect-card__actions">
            {object.actions.map((action) => (
              <button key={action.id} type="button" className="button-solid" onClick={() => toggle(action.id)}>
                {actionOn[action.id] ? (action.doneLabel ?? action.label) : action.label}
              </button>
            ))}
          </div>
        )}
        <details className="inspect-card__more">
          <summary>{t('inspect.more')}</summary>
          {object.paragraphs?.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {sources.length > 0 && <p className="inspect-card__sources">{t('common.sourcesLine', { list: sources.map((source) => source.title).join('；') })}</p>}
        </details>
      </section>
    </div>
  )
}
