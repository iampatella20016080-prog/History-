import { useEffect, useMemo, useRef, useState } from 'react'
import { boardingState } from '../game/runtime.js'
import { getEra } from '../data/eras.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'
import { applyDocumentLang } from '../i18n/lang.js'
import { useLocalizer, useT } from '../i18n/useT.js'
import { LicensesPanel } from './LicensesPanel.jsx'
import { ChapterCard } from './ChapterCard.jsx'
import { EraNotice } from './EraNotice.jsx'
import { MusicNotice } from './MusicSettings.jsx'
import { JournalPanel } from './JournalPanel.jsx'
import { SettingsMenu } from './SettingsMenu.jsx'
import { OverviewPanel } from './OverviewPanel.jsx'
import { StoreDirectory } from './StoreDirectory.jsx'
import { Joystick } from './TouchControls.jsx'
import {
  CONTROLS_IDLE_MS,
  controlsNeedsIdleTimer,
  controlsOnIdle,
  controlsOnMove,
  controlsOnToggle,
  loadControlsState,
  saveControlsState,
} from './controlsHint.js'

/** 操作說明：每項是 [按鍵, 說明字串的鍵] */
const HINTS = {
  explore: {
    touch: [
      ['@hud.key.joystick', 'hud.hint.joystick'],
      ['@hud.key.drag1', 'hud.hint.drag1'],
      ['@hud.key.pinch', 'hud.hint.pinch'],
      ['@hud.key.tapShop', 'hud.hint.tap'],
      ['@hud.key.gear', 'hud.hint.gear'],
    ],
    mouse: [
      [['W', 'A', 'S', 'D'], 'hud.hint.wasd'],
      [['Shift'], 'hud.hint.shift'],
      [['@hud.key.drag'], 'hud.hint.mouseDrag'],
      [['E'], 'hud.hint.e'],
      [['1', '5'], 'hud.hint.era'],
    ],
  },
  viewer: {
    touch: [
      ['@hud.key.drag1', 'hud.hint.viewerDrag'],
      ['@hud.key.twoDrag', 'hud.hint.viewerPan'],
      ['@hud.key.twoPinch', 'hud.hint.viewerZoom'],
      ['@hud.key.tapBuilding', 'hud.hint.viewerFocus'],
    ],
    mouse: [
      [['@hud.key.leftDrag'], 'hud.hint.viewerDrag'],
      [['@hud.key.rightDrag'], 'hud.hint.viewerPan'],
      [['@hud.key.wheel'], 'hud.hint.viewerZoom'],
      [['W', 'A', 'S', 'D'], 'hud.hint.viewerMove'],
      [['@hud.key.tapBuilding'], 'hud.hint.viewerFocus'],
    ],
  },
}

function ControlsHint({ touch, viewer }) {
  const t = useT()
  const L = useLocalizer()
  const [state, setState] = useState(() => loadControlsState(touch))
  const { collapsed } = state
  const touchRef = useRef(touch)
  const apply = (update) =>
    setState((prev) => {
      const next = update(prev)
      if (next !== prev) saveControlsState(next)
      return next
    })
  useEffect(() => {
    if (touchRef.current === touch) return
    touchRef.current = touch
    setState(loadControlsState(touch))
  }, [touch])
  // 第一次實際移動（鍵盤或拖曳視角）後自動收起；手動操作過就不動
  useEffect(() => {
    if (touch) return undefined
    const onKey = (event) => {
      if (/^(w|a|s|d|arrowup|arrowdown|arrowleft|arrowright)$/i.test(event.key)) apply((prev) => controlsOnMove(prev, false))
    }
    const onDrag = (event) => {
      if (event.buttons) apply((prev) => controlsOnMove(prev, false))
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onDrag)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onDrag)
    }
  }, [touch])
  // 展開後約 12 秒無互動自動收起
  useEffect(() => {
    if (!controlsNeedsIdleTimer(state, touch)) return undefined
    const timer = setTimeout(() => apply((prev) => controlsOnIdle(prev, touch)), CONTROLS_IDLE_MS)
    return () => clearTimeout(timer)
  }, [state, touch])
  const keyLabel = (key) => (key.startsWith('@') ? t(key.slice(1)) : key)
  const items = HINTS[viewer ? 'viewer' : 'explore'][touch ? 'touch' : 'mouse']
  return (
    <div className={`hud-controls paper${collapsed ? ' is-collapsed' : ''}${touch ? ' is-touch' : ''}`}>
      <button
        type="button"
        className="hud-controls__toggle"
        aria-expanded={!collapsed}
        onClick={() => apply(controlsOnToggle)}
      >
        {viewer ? t('hud.hint.viewer') : t('hud.hint.explore')} {collapsed ? '＋' : '－'}
      </button>
      {!collapsed && (
        <ul className="hud-controls__list">
          {items.map(([keys, text]) => (
            <li key={text}>
              <span className="keys">
                {touch ? (
                  <kbd>{keyLabel(keys)}</kbd>
                ) : keys.length === 2 && keys[0] === '1' ? (
                  <>
                    <kbd>1</kbd>–<kbd>5</kbd>
                  </>
                ) : (
                  keys.map((key) => <kbd key={key}>{keyLabel(key)}</kbd>)
                )}
              </span>
              {t(text)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ObjectiveHint({ shops, touch }) {
  const t = useT()
  const L = useLocalizer()
  const started = useGameStore((state) => state.started)
  const visited = useGameStore((state) => state.visited)
  const mode = useGameStore((state) => state.mode)
  const nearby = useGameStore((state) => state.nearbyShopId)
  const transitioning = useGameStore((state) => state.transitioning)
  const viewMode = useGameStore((state) => state.viewMode)
  const openShops = shops.filter((shop) => shop.status === 'open')
  const visitedCount = openShops.filter((shop) => visited[shop.id]).length
  const [showDone, setShowDone] = useState(false)
  const firstUnvisited = openShops.find((shop) => !visited[shop.id])

  useEffect(() => {
    if (visitedCount === 0 || mode !== 'explore') return undefined
    setShowDone(true)
    const timer = setTimeout(() => setShowDone(false), 7000)
    return () => clearTimeout(timer)
  }, [visitedCount, mode])

  let text = null
  if (started && mode === 'explore' && viewMode === 'explore' && !nearby && !transitioning) {
    if (firstUnvisited) text = t('hud.objective.find', { name: firstUnvisited.name })
    else if (showDone)
      text = touch ? t('hud.objective.doneTouch') : t('hud.objective.doneKeys')
  }
  return <div className={`hud-objective${text ? ' is-visible' : ''}`}>{text && <span>{text}</span>}</div>
}

/**
 * 清末搭船的畫面：划船時的黑幕與說明（可以略過）、落水時的黑幕與一句話。
 * 黑幕的濃淡每個影格由 runtime.boardingState.fade 直接寫到樣式，不經過 React 狀態。
 * 說明文字標「歷史情境重建」（划船）與「虛構情節」（落水）：落水不是史實。
 */
function BoardingOverlay() {
  const t = useT()
  const phase = useGameStore((state) => state.boardingPhase)
  const requestBoarding = useGameStore((state) => state.requestBoarding)
  const veil = useRef()
  useEffect(() => {
    if (phase === 'ashore' || phase === 'aboard') {
      let raf = 0
      // 到岸後的淡入：繼續讀幾秒
      const tick = () => {
        if (veil.current) veil.current.style.opacity = String(boardingState.fade)
        if (boardingState.fade > 0.001) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
    let raf = 0
    const tick = () => {
      if (veil.current) veil.current.style.opacity = String(boardingState.fade)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])
  const riding = phase === 'departing' || phase === 'returning'
  const active = riding || phase === 'fallen'
  return (
    <div className={`boarding-layer${active ? ' is-active' : ''}`} data-boarding-phase={phase}>
      <div ref={veil} className="boarding-veil" style={{ opacity: 0 }} />
      {active && (
        <div className="boarding-caption paper">
          <span className="boarding-caption__text">{t(phase === 'fallen' ? 'boarding.fallen' : phase === 'departing' ? 'boarding.departing' : 'boarding.returning')}</span>
          <span className="boarding-caption__tag">{t(phase === 'fallen' ? 'boarding.fiction' : 'boarding.reconstruction')}</span>
          {riding && (
            <button type="button" className="button-ghost boarding-skip" data-boarding-skip onClick={() => requestBoarding('skip')}>
              {t('boarding.skip')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** 建築觀賞模式的工具列（下方中央）：隱藏介面、返回探索 */
function ViewerBar() {
  const t = useT()
  const L = useLocalizer()
  const setViewMode = useGameStore((state) => state.setViewMode)
  const setUiHidden = useGameStore((state) => state.setUiHidden)
  return (
    <div className="viewer-bar paper" role="toolbar" aria-label={t('viewerBar.label')}>
      <span className="viewer-bar__label">
        <span className="viewer-bar__seal" aria-hidden="true">
          {t('viewerBar.seal')}
        </span>
        {t('viewerBar.title')}
      </span>
      <button type="button" className="button-ghost" data-hide-ui onClick={() => setUiHidden(true)}>
        {t('viewerBar.hide')}
      </button>
      <button type="button" className="button-solid" data-exit-viewer onClick={() => setViewMode('explore')}>
        {t('viewerBar.exit')}
      </button>
    </div>
  )
}

/** 隱藏介面時：右上角一顆看得見的小按鈕，點一下（或按 Esc）重新顯示介面 */
function RevealUi() {
  const t = useT()
  const L = useLocalizer()
  const setUiHidden = useGameStore((state) => state.setUiHidden)
  return (
    <button
      type="button"
      className="ui-reveal paper"
      data-reveal-ui
      aria-label={t('revealUi.label')}
      title={t('revealUi.title')}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => setUiHidden(false)}
    >
      {t('revealUi.label')}
    </button>
  )
}

/**
 * 畫面上的固定介面：
 * 右上角的設定（年代、觀看模式、畫質、音樂）與店家名錄、左下操作說明與搖桿（觸控）、
 * 中央的章節標題與下方的任務提示；建築觀賞模式改顯示觀賞工具列，隱藏介面時只留 3D 街景。
 */
export function Hud() {
  const started = useGameStore((state) => state.started)
  const mode = useGameStore((state) => state.mode)
  const eraId = useGameStore((state) => state.eraId)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const viewer = useGameStore((state) => state.viewMode === 'viewer')
  const uiHidden = useGameStore((state) => state.uiHidden)
  const lang = useGameStore((state) => state.lang)
  const L = useLocalizer()
  const era = L(getEra(eraId))
  useEffect(() => {
    applyDocumentLang(lang)
  }, [lang])
  const shops = useMemo(() => L(getShopsByEra(era)), [era, L])

  const className = [
    'hud',
    started && 'is-started',
    mode === 'reading' && 'is-reading',
    touch && 'is-touch',
    viewer && 'is-viewer',
    uiHidden && 'is-ui-hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <EraNotice />
      <div className="hud-actions">
        <SettingsMenu />
        <StoreDirectory era={era} shops={shops} />
        <JournalPanel />
        <OverviewPanel />
      </div>
      <LicensesPanel />
      {started && <MusicNotice />}
      <ControlsHint touch={touch} viewer={viewer} />
      <ObjectiveHint shops={shops} touch={touch} />
      {touch && !viewer && <Joystick />}
      {started && viewer && <ViewerBar />}
      <ChapterCard />
      {started && <BoardingOverlay />}
      {uiHidden && <RevealUi />}
    </div>
  )
}
