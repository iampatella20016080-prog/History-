import ziYangCorner from '../../assets/photos/zi-yang-corner.webp'
import ziYangFacade from '../../assets/photos/zi-yang-facade.webp'
import ziYangStorefront from '../../assets/photos/zi-yang-storefront.webp'

/**
 * 章節中的實地照片（WebP，寬 1280 px）。店家資料只記 id，
 * 圖檔由 Vite 打包並加上雜湊檔名。
 */
export const PHOTOS = {
  'zi-yang-corner': { src: ziYangCorner, width: 1280, height: 960 },
  'zi-yang-facade': { src: ziYangFacade, width: 1280, height: 960 },
  'zi-yang-storefront': { src: ziYangStorefront, width: 1280, height: 960 },
}
