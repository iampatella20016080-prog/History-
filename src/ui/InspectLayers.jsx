import { getEra } from '../data/eras.js'
import { INSPECT_LAYERS, NOTE_STATUS, layerNotes, layerSourceIds } from '../data/inspectLayers.js'
import { getShop } from '../data/shops.js'
import { getSource } from '../data/sources.js'
import { useLocalizer, useT } from '../i18n/useT.js'

/**
 * 器物的分層資訊（第 11 階段；格式見 data/inspectLayers.js）：
 * 外觀構造 → 食材與做法 → 使用場合 → 在哪家店可以接觸到 → 照片與文獻，用分頁切換。
 * 每段說明標出狀態（家族口述、據說、待核、歷史情境重建）與出處；
 * 「在哪家店可以接觸到」先列出街上擺著這件器物的年代與店家（places），再接補充說明。
 */
export function InspectLayers({ object, places, layer, onLayer }) {
  const t = useT()
  const L = useLocalizer()
  const sourceTitles = (ids) => (ids ?? []).map((id) => L(getSource(id))?.title).filter(Boolean)
  const notes = layerNotes(object, layer)

  return (
    <div className="inspect-layers">
      <div className="inspect-layers__tabs" role="tablist" aria-label={t('inspect.layers')}>
        {INSPECT_LAYERS.map((item, i) => {
          const local = L(item)
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`inspect-tab-${item.id}`}
              aria-selected={layer === item.id}
              aria-controls="inspect-layer-panel"
              className="inspect-layers__tab"
              onClick={() => onLayer(item.id)}
            >
              <span className="inspect-layers__step" aria-hidden="true">
                {i + 1}
              </span>
              {local.title}
            </button>
          )
        })}
      </div>
      <div className="inspect-layers__panel" role="tabpanel" id="inspect-layer-panel" aria-labelledby={`inspect-tab-${layer}`}>
        {layer === 'where' && places.length > 0 && (
          <ul className="inspect-layers__places">
            {places.map((place) => {
              const era = L(getEra(place.eraId))
              const shop = place.shopId ? L(getShop(place.shopId, place.eraId)) : null
              return (
                <li key={place.id}>
                  {t('inspect.place', { era: `${era.yearRange} ${era.title}`, shop: shop?.name ?? t('inspect.street'), label: L(place).label })}
                </li>
              )
            })}
          </ul>
        )}
        {notes.map((note, i) => {
          const local = L(note)
          const status = note.status ? L(NOTE_STATUS[note.status]) : null
          const titles = sourceTitles(note.sourceIds)
          return (
            <p key={i} className="inspect-layers__note">
              {status && <span className={`inspect-layers__status inspect-layers__status--${note.status}`}>{status.label}</span>}
              {local.text}
              {titles.length > 0 && <span className="inspect-layers__cite">{t('common.sourcesLine', { list: titles.join('；') })}</span>}
            </p>
          )
        })}
        {layer === 'evidence' && (
          <p className="inspect-card__sources">{t('inspect.allSources', { list: sourceTitles(layerSourceIds(object)).join('；') })}</p>
        )}
      </div>
    </div>
  )
}
