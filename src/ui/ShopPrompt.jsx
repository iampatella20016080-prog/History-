import { shopYearText } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'

/**
 * 走近已開放的店家時，浮現在店面上方的店名提示（以 drei Html 投影到 3D 位置）。
 * 電腦按 E、觸控裝置點店面（或點這張提示）即可開啟介紹。
 * 未開放的店家不顯示提示；建築觀賞模式也不顯示。
 */
export function ShopPrompt({ shop }) {
  const visible = useGameStore(
    (state) =>
      state.started &&
      state.mode === 'explore' &&
      state.viewMode === 'explore' &&
      !state.transitioning &&
      state.nearbyShopId === shop.id,
  )
  const touch = useGameStore((state) => state.inputMode === 'touch')
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
          {shopYearText(shop) ? `${shopYearText(shop)}｜` : ''}
          {shop.category}
        </span>
        {shop.reconstruction && <span className="shop-prompt__note">歷史情境重建</span>}
        <span className="shop-prompt__action">
          {touch ? (
            '點店面探索'
          ) : (
            <>
              按 <kbd>E</kbd> 探索
            </>
          )}
        </span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}
