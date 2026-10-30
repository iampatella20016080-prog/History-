import { shopYearText } from '../data/shops.js'
import { useGameStore } from '../state/useGameStore.js'
import { useLocalizer, useT } from '../i18n/useT.js'

/**
 * 走近已開放的店家時，浮現在店面上方的店名提示（以 drei Html 投影到 3D 位置）。
 * 電腦按 E、觸控裝置點店面（或點這張提示）即可開啟介紹。
 * 未開放的店家不顯示提示；建築觀賞模式與器物檢視時也不顯示。
 */
export function ShopPrompt({ shop: zhShop, hotspot: zhHotspot = null }) {
  const t = useT()
  const lang = useGameStore((state) => state.lang)
  const L = useLocalizer()
  const shop = L(zhShop)
  const hotspot = L(zhHotspot)
  const visible = useGameStore(
    (state) =>
      state.started &&
      state.mode === 'explore' &&
      state.viewMode === 'explore' &&
      !state.transitioning &&
      // 器物 3D 檢視時鏡頭在街道上空的舞台，店名提示不浮在器物上
      !state.inspect &&
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
        onClick={() => visible && openShop(shop.id, hotspot?.id ?? null)}
      >
        {/* 店裡的資訊熱點（例如爐鍋咖啡的吧檯、扭蛋機）：熱點名稱與一句簡短介紹，下方是店名 */}
        <span className="shop-prompt__name">{hotspot ? hotspot.label : shop.name}</span>
        <span className="shop-prompt__meta">
          {hotspot ? (
            `${shop.name}｜${hotspot.note}`
          ) : (
            <>
              {shopYearText(shop, lang) ? `${shopYearText(shop, lang)}｜` : ''}
              {shop.category}
            </>
          )}
        </span>
        {shop.reconstruction && <span className="shop-prompt__note">{t('common.reconstruction')}</span>}
        <span className="shop-prompt__action">
          {touch ? (
            t('shopPrompt.tap')
          ) : (
            <>
              {t('shopPrompt.pressPre')}<kbd>E</kbd>{t('shopPrompt.pressPost')}
            </>
          )}
        </span>
      </button>
      <span className="shop-prompt__tip" />
    </div>
  )
}
