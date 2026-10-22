import { useEffect, useRef } from 'react'
import { getTheme, shopYearText } from '../data/shops.js'
import { getSource } from '../data/sources.js'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 右上角的「店家名錄」：列出目前年代街上的店家。
 * 可探索的店家能直接閱讀故事；即將開放的店家可以先前往店門口看看建築。
 * 建築觀賞模式中改為「聚焦建築」：鏡頭移到該店的立面前（不開啟故事）。
 */
export function StoreDirectory({ era, shops }) {
  const open = useGameStore((state) => state.menuOpen)
  const toggleMenu = useGameStore((state) => state.toggleMenu)
  const travelToShop = useGameStore((state) => state.travelToShop)
  const openShop = useGameStore((state) => state.openShop)
  const focusBuilding = useGameStore((state) => state.focusBuilding)
  const viewer = useGameStore((state) => state.viewMode === 'viewer')
  const visited = useGameStore((state) => state.visited)
  const mode = useGameStore((state) => state.mode)
  const transitioning = useGameStore((state) => state.transitioning)
  const container = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!container.current?.contains(event.target)) toggleMenu(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open, toggleMenu])

  const openCount = shops.filter((shop) => shop.status === 'open').length

  return (
    <div className="hud-menu" ref={container}>
      <button
        type="button"
        className="hud-menu__toggle paper"
        aria-expanded={open}
        aria-controls="shop-menu-panel"
        disabled={mode !== 'explore' || transitioning}
        onClick={() => toggleMenu()}
      >
        <span className="hud-menu__icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        店家名錄
      </button>
      {open && (
        <div id="shop-menu-panel" className="hud-menu__panel paper" data-scrollable>
          <p className="hud-menu__heading">
            <span>{era?.yearRange}｜{era?.title}</span>
            <span className="hud-menu__count">
              {shops.length} 間店家・{openCount} 間可探索
            </span>
          </p>
          <ul className="hud-menu__list">
            {shops.map((shop) => {
              const isOpen = shop.status === 'open'
              return (
                <li key={shop.id} className={`menu-shop${isOpen ? '' : ' is-soon'}`}>
                  <div className="menu-shop__info">
                    <span className="menu-shop__name">{shop.name}</span>
                    <span className="menu-shop__meta">
                      {shopYearText(shop) ? `${shopYearText(shop)}｜` : ''}
                      {shop.category}
                    </span>
                    {isOpen ? (
                      <span className="menu-shop__badge is-open">{visited[shop.id] ? '已探索' : '可探索'}</span>
                    ) : (
                      <span className="menu-shop__badge">即將開放</span>
                    )}
                  </div>
                  {shop.reconstruction && <span className="menu-shop__note">歷史情境重建</span>}
                  {shop.scenarioNote && <span className="menu-shop__note">{shop.scenarioNote}</span>}
                  {shop.theme && <span className="menu-shop__note is-theme">飲食主題：{getTheme(shop.theme)?.title}</span>}
                  <p className="menu-shop__summary">{shop.summary}</p>
                  {(shop.yearNote || shop.sourceIds?.length) && <ShopSources shop={shop} />}
                  <div className="menu-shop__actions">
                    {viewer ? (
                      <button type="button" className="button-ghost" data-focus-shop={shop.id} onClick={() => focusBuilding(shop.id)}>
                        聚焦建築
                      </button>
                    ) : (
                      <button type="button" className="button-ghost" onClick={() => travelToShop(shop.id)}>
                        前往店門口
                      </button>
                    )}
                    {isOpen && !viewer && (
                      <button
                        type="button"
                        className="button-solid"
                        onClick={() => {
                          travelToShop(shop.id)
                          openShop(shop.id, null)
                        }}
                      >
                        閱讀故事
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="hud-menu__note">店家在街上的位置為情境示意。其他店家的故事將在後續階段陸續開放。</p>
        </div>
      )}
    </div>
  )
}

/** 年份記載不一的說明與資料來源（可展開） */
function ShopSources({ shop }) {
  const sources = (shop.sourceIds ?? []).map(getSource).filter(Boolean)
  return (
    <details className="menu-shop__sources">
      <summary>年份與資料來源</summary>
      {shop.yearNote && <p>{shop.yearNote}</p>}
      {shop.note && <p>{shop.note}</p>}
      {sources.length > 0 && (
        <ul>
          {sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.citation}
              </a>
            </li>
          ))}
        </ul>
      )}
    </details>
  )
}
