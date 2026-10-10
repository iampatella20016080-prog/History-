import { useEffect, useMemo, useRef, useState } from 'react'
import { getEra } from '../data/eras.js'
import { getShopsByEra } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'

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

function EraBanner({ era }) {
  if (!era) return null
  return (
    <div className="hud-era">
      <div className="hud-era__main">
        <span className="hud-era__ornament" aria-hidden="true" />
        <span>
          {era.years}｜{era.name}
        </span>
        <span className="hud-era__ornament" aria-hidden="true" />
      </div>
      <p className="hud-era__theme">{era.theme}</p>
    </div>
  )
}

function ShopMenu({ shops }) {
  const open = useGameStore((state) => state.menuOpen)
  const toggleMenu = useGameStore((state) => state.toggleMenu)
  const travelToShop = useGameStore((state) => state.travelToShop)
  const openShop = useGameStore((state) => state.openShop)
  const visited = useGameStore((state) => state.visited)
  const mode = useGameStore((state) => state.mode)
  const container = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!container.current?.contains(event.target)) toggleMenu(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open, toggleMenu])

  return (
    <div className="hud-menu" ref={container}>
      <button
        type="button"
        className="hud-menu__toggle paper"
        aria-expanded={open}
        aria-controls="shop-menu-panel"
        disabled={mode !== 'explore'}
        onClick={() => toggleMenu()}
      >
        <span className="hud-menu__icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        店家選單
      </button>
      {open && (
        <div id="shop-menu-panel" className="hud-menu__panel paper">
          <p className="hud-menu__heading">目前可探索的店家</p>
          <ul className="hud-menu__list">
            {shops.map((shop) => (
              <li key={shop.id} className="menu-shop">
                <div className="menu-shop__info">
                  <span className="menu-shop__name">{shop.name}</span>
                  <span className="menu-shop__meta">
                    {shop.year}年｜{shop.category}
                  </span>
                  {visited[shop.id] && <span className="menu-shop__badge">已探索</span>}
                </div>
                <p className="menu-shop__summary">{shop.summary}</p>
                <div className="menu-shop__actions">
                  <button type="button" className="button-ghost" onClick={() => travelToShop(shop.id)}>
                    前往店門口
                  </button>
                  <button
                    type="button"
                    className="button-solid"
                    onClick={() => {
                      travelToShop(shop.id)
                      openShop(shop.id)
                    }}
                  >
                    閱讀故事
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="hud-menu__note">其他店家與年代將在後續階段陸續開放。</p>
        </div>
      )}
    </div>
  )
}

function ControlsHint() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={`hud-controls paper${collapsed ? ' is-collapsed' : ''}`}>
      <button
        type="button"
        className="hud-controls__toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        操作說明 {collapsed ? '＋' : '－'}
      </button>
      {!collapsed && (
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
        </ul>
      )}
    </div>
  )
}

function ObjectiveHint({ shops }) {
  const started = useGameStore((state) => state.started)
  const visited = useGameStore((state) => state.visited)
  const mode = useGameStore((state) => state.mode)
  const nearby = useGameStore((state) => state.nearbyShopId)
  const visitedCount = shops.filter((shop) => visited[shop.id]).length
  const [showDone, setShowDone] = useState(false)
  const firstUnvisited = shops.find((shop) => !visited[shop.id])

  useEffect(() => {
    if (visitedCount === 0 || mode !== 'explore') return undefined
    setShowDone(true)
    const timer = setTimeout(() => setShowDone(false), 6000)
    return () => clearTimeout(timer)
  }, [visitedCount, mode])

  let text = null
  if (started && mode === 'explore' && !nearby) {
    if (firstUnvisited) text = `沿著街道前進，尋找屋頂上有紅色標記的「${firstUnvisited.name}」`
    else if (showDone) text = `已探索 ${visitedCount}／${shops.length} 間店家・更多店家將在後續階段開放`
  }
  return <div className={`hud-objective${text ? ' is-visible' : ''}`}>{text && <span>{text}</span>}</div>
}

/** 畫面上的固定介面：左上標題、上方年代、右上選單、左下操作說明、下方任務提示 */
export function Hud() {
  const started = useGameStore((state) => state.started)
  const mode = useGameStore((state) => state.mode)
  const eraId = useGameStore((state) => state.eraId)
  const era = getEra(eraId)
  const shops = useMemo(() => getShopsByEra(eraId), [eraId])

  return (
    <div className={`hud${started ? ' is-started' : ''}${mode === 'reading' ? ' is-reading' : ''}`}>
      <TitleBadge />
      <EraBanner era={era} />
      <ShopMenu shops={shops} />
      <ControlsHint />
      <ObjectiveHint shops={shops} />
    </div>
  )
}
