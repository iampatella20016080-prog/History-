/**
 * 清末搭船（港口商街）的狀態機：搭駁船上河道中的帆船、在甲板上走動、搭駁船回棧橋，以及落水後回到岸上。
 * 純邏輯，不依賴 React／Three，可以直接單測；components/BoardingDirector.jsx 每個影格推進它。
 *
 *   ashore ──搭船──▶ departing ──(到了)──▶ aboard ──回棧橋──▶ returning ──(到了)──▶ ashore
 *     │                                      │
 *     └──────────────── 落水 ◀───────────────┘
 *                         fallen ──(水花、淡出、回到棧橋頭、淡入)──▶ ashore
 *
 * 狀態物件是不可變的：每個操作回傳新的物件。t 是進入這個階段以來的秒數。
 * departing／returning／fallen 三個階段鎖住移動與換年代（boardingLocked）；每段都有固定長度，一定會結束。
 * 落水這件事是遊戲裡的情境，不是史實（docs/research/qing-boarding.md「落水」一節）。
 */
export const BOARDING_TIMING = {
  ride: 6, // 駁船划過去（秒）
  rideReduced: 0.9, // 使用者偏好減少動態（prefers-reduced-motion）時改成短暫淡出淡入
  rideFade: 0.4, // 到岸前後的淡出與淡入（秒）
  splash: 0.3, // 落水：水花之後才開始淡出
  fallFade: 0.55, // 落水：淡出
  rescueFade: 0.6, // 回到棧橋頭之後淡入
}

export const BOARDING_PHASES = ['ashore', 'departing', 'aboard', 'returning', 'fallen']

export function createBoarding() {
  return { phase: 'ashore', t: 0, seq: 0, duration: 0, rescued: false }
}

/** 這些階段鎖住移動、互動與換年代 */
export function boardingLocked(boarding) {
  return boarding.phase === 'departing' || boarding.phase === 'returning' || boarding.phase === 'fallen'
}

/** 駁船正在河上（去程或回程） */
export function boardingRiding(boarding) {
  return boarding.phase === 'departing' || boarding.phase === 'returning'
}

function enter(boarding, phase, duration = 0) {
  return { ...boarding, phase, t: 0, seq: boarding.seq + 1, duration, rescued: false }
}

/** 在棧橋頭要求搭船（reduced：減少動態） */
export function requestBoard(boarding, { reduced = false } = {}) {
  if (boarding.phase !== 'ashore') return boarding
  return enter(boarding, 'departing', reduced ? BOARDING_TIMING.rideReduced : BOARDING_TIMING.ride)
}

/** 在甲板上要求搭駁船回棧橋 */
export function requestReturn(boarding, { reduced = false } = {}) {
  if (boarding.phase !== 'aboard') return boarding
  return enter(boarding, 'returning', reduced ? BOARDING_TIMING.rideReduced : BOARDING_TIMING.ride)
}

/** 從棧橋邊或甲板邊走出去落水（划船途中與已經在水裡時不重複觸發） */
export function requestFall(boarding) {
  if (boarding.phase !== 'ashore' && boarding.phase !== 'aboard') return boarding
  const { splash, fallFade, rescueFade } = BOARDING_TIMING
  return enter(boarding, 'fallen', splash + fallFade + rescueFade)
}

/** 跳過划船的動畫：直接到岸（只剩淡入） */
export function skipRide(boarding) {
  if (!boardingRiding(boarding)) return boarding
  return { ...boarding, t: Math.max(boarding.t, boarding.duration - BOARDING_TIMING.rideFade * 0.5) }
}

/** 人物離開了甲板（例如從店家名錄前往店家、換了年代）：直接回到岸上的狀態 */
export function resetBoarding(boarding) {
  if (boarding.phase === 'ashore') return boarding
  return enter(boarding, 'ashore')
}

/** 落水後回到棧橋頭的時間點（秒，從落水起算） */
export function rescueAt() {
  return BOARDING_TIMING.splash + BOARDING_TIMING.fallFade
}

/**
 * 推進一個影格：回傳 { boarding, events }。
 * events：'arrive'（駁船到了帆船，把人物放上甲板）、'land'（回到棧橋頭）、'splash'（落水的水花）、'rescue'（把人物放回棧橋頭）
 */
export function stepBoarding(boarding, dt) {
  const events = []
  if (boarding.phase === 'ashore' || boarding.phase === 'aboard') return { boarding: { ...boarding, t: boarding.t + dt }, events }
  let next = { ...boarding, t: boarding.t + dt }
  if (next.phase === 'fallen') {
    if (boarding.t === 0) events.push('splash')
    if (!next.rescued && next.t >= rescueAt()) {
      next.rescued = true
      events.push('rescue')
    }
    if (next.t >= next.duration) next = enter(next, 'ashore')
    return { boarding: next, events }
  }
  if (next.t >= next.duration) {
    const arriving = next.phase === 'departing'
    events.push(arriving ? 'arrive' : 'land')
    next = enter(next, arriving ? 'aboard' : 'ashore')
  }
  return { boarding: next, events }
}

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

/** 駁船在路線上的位置參數 0（棧橋）…1（帆船旁）；去程往 1、回程往 0 */
export function rideProgress(boarding) {
  if (!boardingRiding(boarding)) return boarding.phase === 'aboard' ? 1 : 0
  const fade = BOARDING_TIMING.rideFade
  // 到岸前的淡出期間船已經到位（淡入後人物已經站在甲板或棧橋上）
  const k = ease(Math.min(1, boarding.t / Math.max(0.001, boarding.duration - fade)))
  return boarding.phase === 'departing' ? k : 1 - k
}

/**
 * 畫面的黑幕 0–1：划船到岸前淡出、到岸後淡入；落水時水花之後淡出、回到棧橋頭後淡入。
 * 減少動態時整段都是淡出淡入。
 */
export function boardingFade(boarding) {
  const { rideFade, splash, fallFade, rescueFade } = BOARDING_TIMING
  const { phase, t, duration } = boarding
  if (phase === 'departing' || phase === 'returning') {
    const out = (t - (duration - rideFade)) / rideFade
    return Math.max(0, Math.min(1, out))
  }
  if (phase === 'fallen') {
    if (t < splash) return 0
    if (t < splash + fallFade) return Math.min(1, (t - splash) / fallFade)
    return Math.max(0, 1 - (t - splash - fallFade) / rescueFade)
  }
  // 剛到岸（上一段是划船）或剛被拉回岸上：從全黑淡入
  if (boarding.seq > 0 && t < rideFade) return 1 - t / rideFade
  return 0
}

/**
 * 駁船的路線（世界座標）：從棧橋南側的停泊處划到帆船靠棧橋這一側的舷邊，二次貝茲曲線。
 * s：0 棧橋、1 帆船旁；回傳 { x, z, yaw }（yaw：船頭的方向，船沿 x 軸、rotationY 的慣例與 River.jsx 的船相同）。
 */
export function ridePath(route, s) {
  const [[x0, z0], [cx, cz], [x1, z1]] = route
  const u = 1 - s
  const x = u * u * x0 + 2 * u * s * cx + s * s * x1
  const z = u * u * z0 + 2 * u * s * cz + s * s * z1
  // 切線方向（船頭朝帆船；回程船尾先行）。船的本地 +x 經 rotationY 轉到世界的 (cos, −sin)
  const dx = 2 * u * (cx - x0) + 2 * s * (x1 - cx)
  const dz = 2 * u * (cz - z0) + 2 * s * (z1 - cz)
  return { x, z, yaw: Math.atan2(-dz, dx) }
}
