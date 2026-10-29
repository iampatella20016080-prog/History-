import { useEffect, useMemo, useRef, useState } from 'react'
import { getEra } from '../data/eras.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'
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
    if (firstUnvisited) text = `沿著街道前進，尋找屋頂上有紅色標記的「${firstUnvisited.name}」`
    else if (showDone)
      text = touch ? '點右上角的齒輪切換年代，看看這條街在其他年代的樣子' : '點右上角的齒輪（或按 1–5）切換年代，看看這條街在其他年代的樣子'
  }
  return <div className={`hud-objective${text ? ' is-visible' : ''}`}>{text && <span>{text}</span>}</div>
}

/** 建築觀賞模式的工具列（下方中央）：隱藏介面、返回探索 */
function ViewerBar() {
  const setViewMode = useGameStore((state) => state.setViewMode)
  const setUiHidden = useGameStore((state) => state.setUiHidden)
  return (
    <div className="viewer-bar paper" role="toolbar" aria-label="建築觀賞模式">
      <span className="viewer-bar__label">
        <span className="viewer-bar__seal" aria-hidden="true">
          觀
        </span>
        建築觀賞
      </span>
      <button type="button" className="button-ghost" data-hide-ui onClick={() => setUiHidden(true)}>
        隱藏介面
      </button>
      <button type="button" className="button-solid" data-exit-viewer onClick={() => setViewMode('explore')}>
        返回探索
      </button>
    </div>
  )
}

/** 隱藏介面時：右上角的隱形觸發區，點一下（或按 Esc）重新顯示介面 */
function RevealUi() {
  const setUiHidden = useGameStore((state) => state.setUiHidden)
  return (
    <button
      type="button"
      className="ui-reveal"
      data-reveal-ui
      aria-label="顯示介面"
      title="顯示介面（Esc）"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => setUiHidden(false)}
    />
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
  const era = getEra(eraId)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const shops = useMemo(() => getShopsByEra(era), [era])

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
      {uiHidden && <RevealUi />}
    </div>
  )
}
