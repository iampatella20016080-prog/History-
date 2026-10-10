/**
 * 年代轉場的執行期狀態（每一影格由 EraDirector 寫入、ToonRenderer 讀取）。
 *
 * mist      霧氣覆蓋程度 0–1
 * dissolve  0 = 顯示切換前的快照、1 = 顯示新的街景（以筆刷般的雜訊遮罩過渡）
 */
export const transitionState = {
  mist: 0,
  dissolve: 1,
  snapshotRequested: false,
  snapshotReady: false,
  mountedEraId: null,
}
