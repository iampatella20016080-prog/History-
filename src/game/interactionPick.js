/**
 * 互動對象的取捨（純邏輯，不依賴 React／Three，可以直接單測；components/InteractionSystem.jsx 每個影格使用）
 *
 * 路人、街上的器物、店家（或店裡的熱點）各自先找出最近且在範圍內的一個，再兩兩取捨：
 * - 路人與器物同時在範圍內：只留比較近的那一個
 * - 路人與店家同時在範圍內：只留比較近的那一個（第 12 階段：站在店門口的路人不會搶走店家的介紹）
 * 距離相同時路人優先。器物與店家可以同時提示（按 E 時器物優先，見 store.interact）。
 *
 * 參數與回傳：{ talk, inspectable, shop }，每一項是 { id, distance, ... } 或 null。
 */
export function pickInteraction({ talk = null, inspectable = null, shop = null }) {
  let result = { talk, inspectable, shop }
  if (result.talk && result.inspectable) {
    result = result.talk.distance <= result.inspectable.distance ? { ...result, inspectable: null } : { ...result, talk: null }
  }
  if (result.talk && result.shop) {
    result = result.talk.distance <= result.shop.distance ? { ...result, shop: null } : { ...result, talk: null }
  }
  return result
}
