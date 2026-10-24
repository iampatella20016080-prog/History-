import { useEffect, useMemo, useState } from 'react'
import { getEra } from '../data/eras.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'
import { ChapterCard } from './ChapterCard.jsx'
import { EraNotice } from './EraNotice.jsx'
import { MusicNotice } from './MusicSettings.jsx'
import { SettingsMenu } from './SettingsMenu.jsx'
import { OverviewPanel } from './OverviewPanel.jsx'
import { StoreDirectory } from './StoreDirectory.jsx'
import { Joystick } from './TouchControls.jsx'

const HINTS = {
  explore: {
    touch: [
      ['搖桿', '左下角移動，推得越遠走得越快'],
      ['單指拖曳', '旋轉視角'],
      ['雙指', '捏合縮放'],
      ['點店面', '靠近已開放的店家後點一下，閱讀故事'],
      ['齒輪', '右上角切換年代、觀看模式、畫質與音樂'],
    ],
    mouse: [
      [['W', 'A', 'S', 'D'], '或方向鍵　移動'],
      [['Shift'], '快走'],
      [['拖曳'], '旋轉視角　滾輪 縮放'],
      [['E'], '靠近已開放的店家時閱讀故事　Esc 返回'],
      [['1', '5'], '切換年代（或右上角齒輪）'],
    ],
  },
  viewer: {
    touch: [
      ['單指拖曳', '旋轉鏡頭'],
      ['雙指拖曳', '平移鏡頭'],
      ['雙指捏合', '縮放（拉到最近時往前推進）'],
      ['點建築', '平滑聚焦整個立面'],
    ],
    mouse: [
      [['左鍵拖曳'], '旋轉鏡頭'],
      [['右鍵拖曳'], '平移鏡頭'],
      [['滾輪'], '縮放（拉到最近時往前推進）'],
      [['W', 'A', 'S', 'D'], '沿街移動鏡頭'],
      [['點建築'], '平滑聚焦整個立面'],
    ],
  },
}

function ControlsHint({ touch, viewer }) {
  const [collapsed, setCollapsed] = useState(touch)
  useEffect(() => setCollapsed(touch), [touch])
  const items = HINTS[viewer ? 'viewer' : 'explore'][touch ? 'touch' : 'mouse']
  return (
    <div className={`hud-controls paper${collapsed ? ' is-collapsed' : ''}${touch ? ' is-touch' : ''}`}>
      <button
        type="button"
        className="hud-controls__toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        {viewer ? '觀賞操作' : '操作說明'} {collapsed ? '＋' : '－'}
      </button>
      {!collapsed && (
        <ul className="hud-controls__list">
          {items.map(([keys, text]) => (
            <li key={text}>
              <span className="keys">
                {touch ? (
                  <kbd>{keys}</kbd>
                ) : keys.length === 2 && keys[0] === '1' ? (
                  <>
                    <kbd>1</kbd>–<kbd>5</kbd>
                  </>
                ) : (
                  keys.map((key) => <kbd key={key}>{key}</kbd>)
                )}
              </span>
              {text}
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
  const era = getEra(eraId)
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
        <OverviewPanel />
      </div>
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
