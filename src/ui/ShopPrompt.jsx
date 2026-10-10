import { useGameStore } from '../state/useGameStore.js'

/**
 * 走近店家時浮現在店面上方的提示（以 drei Html 投影到 3D 位置）。
 * 可探索的店家：點一下或按 E 探索；即將開放的店家：只顯示店名與「即將開放」。
 */
export function ShopPrompt({ shop }) {
  const visible = useGameStore(
    (state) => state.started && state.mode === 'explore' && !state.transitioning && state.nearbyShopId === shop.id,
  )
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const openShop = useGameStore((state) => state.openShop)
  const isOpen = shop.status === 'open'

  return (
    <div className={`shop-prompt${visible ? ' is-visible' : ''}${isOpen ? '' : ' is-soon'}`} aria-hidden={!visible}>
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible && isOpen ? 0 : -1}
        disabled={!isOpen}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && isOpen && openShop(shop.id)}
      >
        <span className="shop-prompt__name">{shop.name}</span>
        <span className="shop-prompt__meta">
          {shop.year ? `${shop.year}年｜` : ''}
          {shop.category}
        </span>
        {shop.reconstruction && <span className="shop-prompt__note">歷史情境重建</span>}
        <span className="shop-prompt__action">
          {isOpen ? (
            touch ? (
              '點一下探索'
            ) : (
              <>
                按 <kbd>E</kbd> 探索
              </>
            )
          ) : (
            '即將開放'
          )}
        </span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}
