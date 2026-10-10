import { useGameStore } from '../state/useGameStore.js'

/** 走近店家時浮現在店面上方的提示（以 drei Html 投影到 3D 位置） */
export function ShopPrompt({ shop }) {
  const visible = useGameStore((state) => state.started && state.mode === 'explore' && state.nearbyShopId === shop.id)
  const openShop = useGameStore((state) => state.openShop)

  return (
    <div className={`shop-prompt${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <button
        type="button"
        className="shop-prompt__card paper"
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => visible && openShop(shop.id)}
      >
        <span className="shop-prompt__name">{shop.name}</span>
        <span className="shop-prompt__meta">
          {shop.year}年｜{shop.category}
        </span>
        <span className="shop-prompt__action">
          按 <kbd>E</kbd> 探索
        </span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}
