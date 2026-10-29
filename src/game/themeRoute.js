/**
 * 主題探索模式（純邏輯，不依賴 React／Three，可以直接單測）
 *
 * 選一個主題路線，列出 3–5 個節點，順序自由；每個節點對應一件可以做的事
 * （跟某位路人說話、近看某件器物、走進某家店、讀一則消息），
 * 完成與否看探索手記有沒有對應的條目（journal.js），所以關掉網頁再回來也記得。
 *
 * 路線格式：{ id, title, titleEn, intro, eraId, nodes: [...], journalId }
 * 節點格式：{ id, kind, journalIds, title, titleEn, hint, shopId?, npcId?, objectId? }
 *   kind        talk／object／shop／news（手記的種類）
 *   journalIds  完成的判定：手記裡有其中任何一個 id 就算完成
 *               （例如「聽挑夫說消息」：跟三位挑夫之中任何一位說過話都算）
 *   shopId      引導標示掛在哪家店（talk 節點用 npcId 標在路人身上）
 */

/** 每個節點完成了沒（依手記） */
export function routeProgress(route, journal) {
  const ids = new Set(journal.entries.map((entry) => entry.id))
  return route.nodes.map((node) => ({ ...node, done: node.journalIds.some((id) => ids.has(id)) }))
}

/** 路線完成了嗎（所有節點都有手記條目） */
export function routeComplete(route, journal) {
  return routeProgress(route, journal).every((node) => node.done)
}

/** 還沒完成的節點（順序自由：全部列出，讓玩家自己選） */
export function remainingNodes(route, journal) {
  return routeProgress(route, journal).filter((node) => !node.done)
}

/** 完成的數量（介面顯示「3／5」用；不是完成百分比） */
export function routeCount(route, journal) {
  const progress = routeProgress(route, journal)
  return { done: progress.filter((node) => node.done).length, total: progress.length }
}

/** 這條路線完成後的手記頁：依節點順序列出對應的手記條目（沒完成的節點是 null） */
export function routeJournalPage(route, journal) {
  return route.nodes.map((node) => ({
    node,
    entry: journal.entries.find((item) => node.journalIds.includes(item.id)) ?? null,
  }))
}

/** 檢查路線資料的格式（測試用）：回傳問題清單 */
export function validateRoute(route) {
  const problems = []
  if (!route.id) problems.push('缺少 id')
  if (!route.title || !route.titleEn) problems.push(`${route.id}：缺少 title 或 titleEn`)
  if (!route.eraId) problems.push(`${route.id}：缺少 eraId`)
  if (!route.nodes || route.nodes.length < 3 || route.nodes.length > 5) problems.push(`${route.id}：節點要 3–5 個`)
  const ids = new Set()
  for (const node of route.nodes ?? []) {
    if (ids.has(node.id)) problems.push(`${route.id}：節點 id 重複（${node.id}）`)
    ids.add(node.id)
    if (!node.journalIds?.length) problems.push(`${route.id}／${node.id}：缺少 journalIds`)
    if (!node.title || !node.titleEn) problems.push(`${route.id}／${node.id}：缺少 title 或 titleEn`)
    if (!node.hint) problems.push(`${route.id}／${node.id}：缺少引導提示 hint`)
    if (!['talk', 'object', 'shop', 'news'].includes(node.kind)) problems.push(`${route.id}／${node.id}：kind 無效`)
  }
  return problems
}
