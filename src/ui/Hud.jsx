import { useEffect, useMemo, useState } from 'react'
import { getEra } from '../data/eras.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'
import { ChapterCard } from './ChapterCard.jsx'
import { EraTimeline } from './EraTimeline.jsx'
import { StoreDirectory } from './StoreDirectory.jsx'
import { ExploreButton, Joystick } from './TouchControls.jsx'

function TitleBadge() {
  return (
    <div className="hud-title">
      <span className="hud-title__seal" aria-hidden="true">
        食
      </span>
      <div>
        <h1 className="hud-title__name">大稻埕食光街</h1>
        <p className="hud-title__sub">走進170年的飲食記憶</p>
      </div>
    </div>
  )
}

function ControlsHint({ touch }) {
  const [collapsed, setCollapsed] = useState(touch)
  useEffect(() => setCollapsed(touch), [touch])
  return (
    <div className={`hud-controls paper${collapsed ? ' is-collapsed' : ''}${touch ? ' is-touch' : ''}`}>
      <button
        type="button"
        className="hud-controls__toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        操作說明 {collapsed ? '＋' : '－'}
      </button>
      {!collapsed && touch && (
        <ul className="hud-controls__list">
          <li>
            <span className="keys">
              <kbd>搖桿</kbd>
            </span>
            左下角移動，推得越遠走得越快
          </li>
          <li>
            <span className="keys">
              <kbd>單指拖曳</kbd>
            </span>
            旋轉視角
          </li>
          <li>
            <span className="keys">
              <kbd>雙指</kbd>
            </span>
            捏合縮放
          </li>
          <li>
            <span className="keys">
              <kbd>探索店家</kbd>
            </span>
            靠近店家後點一下
          </li>
          <li>
            <span className="keys">
              <kbd>時間軸</kbd>
            </span>
            點上方年代切換時空
          </li>
        </ul>
      )}
      {!collapsed && !touch && (
        <ul className="hud-controls__list">
          <li>
            <span className="keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            或方向鍵　移動
          </li>
          <li>
            <span className="keys">
              <kbd>Shift</kbd>
            </span>
            快走
          </li>
          <li>
            <span className="keys">
              <kbd>拖曳</kbd>
            </span>
            旋轉視角　<kbd>滾輪</kbd> 縮放
          </li>
          <li>
            <span className="keys">
              <kbd>E</kbd>
            </span>
            探索店家　<kbd>Esc</kbd> 返回
          </li>
          <li>
            <span className="keys">
              <kbd>1</kbd>–<kbd>5</kbd>
            </span>
            切換年代（或點上方時間軸）
          </li>
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
  if (started && mode === 'explore' && !nearby && !transitioning) {
    if (firstUnvisited) text = `沿著街道前進，尋找屋頂上有紅色標記的「${firstUnvisited.name}」`
    else if (showDone) text = touch ? '點上方時間軸，看看這條街在其他年代的樣子' : '點上方時間軸（或按 1–5），看看這條街在其他年代的樣子'
  }
  return <div className={`hud-objective${text ? ' is-visible' : ''}`}>{text && <span>{text}</span>}</div>
}

/**
 * 畫面上的固定介面：
 * 左上標題、上方中央年代時間軸、右上店家名錄、左下搖桿（觸控）或操作說明、
 * 右下「探索店家」按鈕、中央的章節標題與下方的任務提示。
 */
export function Hud() {
  const started = useGameStore((state) => state.started)
  const mode = useGameStore((state) => state.mode)
  const eraId = useGameStore((state) => state.eraId)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const era = getEra(eraId)
  const shops = useMemo(() => getShopsByEra(era), [era])

  return (
    <div
      className={`hud${started ? ' is-started' : ''}${mode === 'reading' ? ' is-reading' : ''}${touch ? ' is-touch' : ''}`}
    >
      <TitleBadge />
      <EraTimeline />
      <StoreDirectory era={era} shops={shops} />
      <ControlsHint touch={touch} />
      <ObjectiveHint shops={shops} touch={touch} />
      {touch && <Joystick />}
      <ExploreButton />
      <ChapterCard />
    </div>
  )
}
