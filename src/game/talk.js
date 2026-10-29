/**
 * 路人對話（純邏輯，不依賴 React／Three，可以直接單測）
 *
 * 每位路人是不具名的情境人物，有身分（role）與正在做的事（doing）。
 * 對話分成開場的 2–4 句（lines）與可以選擇的追問（followUps）；
 * 每句話都有標示（label）：
 *   sourced   有出處（報紙、檔案、海關或領事報告、方志；必須附 sourceIds）
 *   folklore  坊間傳說（民間故事、年代不確定的唸謠與歌謠）
 *   fiction   虛構對白（情境裡的閒聊與小事件）
 *
 * 對話進行中的狀態（session）是不可變物件：每個操作回傳新的 session。
 */

export const TALK_LABELS = {
  sourced: { text: '有出處', textEn: 'Documented' },
  folklore: { text: '坊間傳說', textEn: 'Folklore' },
  fiction: { text: '虛構對白', textEn: 'Fictional' },
}

/** 開始一段對話：從開場的第一句開始 */
export function startTalkSession(talk) {
  if (!talk?.lines?.length) return null
  return { talk, lines: talk.lines, index: 0, askedIds: [], stage: 'line' }
}

/** 目前顯示的這一句（stage 為 line 時） */
export function currentLine(session) {
  return session?.stage === 'line' ? (session.lines[session.index] ?? null) : null
}

/** 這一句之後還有下一句嗎（同一段 lines 之內） */
export function hasNextLine(session) {
  return session?.stage === 'line' && session.index < session.lines.length - 1
}

/** 還沒問過的追問 */
export function remainingFollowUps(session) {
  if (!session) return []
  return (session.talk.followUps ?? []).filter((item) => !session.askedIds.includes(item.id))
}

/**
 * 下一步：還有下一句就前進一句；一段說完後，還有追問就進入選擇（choices），否則結束（done）。
 */
export function advanceTalk(session) {
  if (!session || session.stage !== 'line') return session
  if (session.index < session.lines.length - 1) return { ...session, index: session.index + 1 }
  return { ...session, stage: remainingFollowUps(session).length ? 'choices' : 'done' }
}

/** 選擇一個追問：開始那段回答（同一個追問不會出現第二次） */
export function chooseFollowUp(session, id) {
  if (!session || session.stage !== 'choices') return session
  const followUp = remainingFollowUps(session).find((item) => item.id === id)
  if (!followUp) return session
  return { ...session, lines: followUp.lines, index: 0, askedIds: [...session.askedIds, id], stage: 'line' }
}

/** 對話聽完了嗎（開場說完，而且沒有還沒問過的追問） */
export function talkFinished(session) {
  return session?.stage === 'done'
}

/** 這段對話記進探索手記的條目 id */
export function talkJournalId(talk) {
  return `talk:${talk.id}`
}

/**
 * 檢查一份對話資料的格式（測試用）：回傳問題清單（空陣列表示沒有問題）。
 * - 開場 2–4 句；每句有文字、英文與有效的標示
 * - 標示「有出處」的句子必須附 sourceIds
 * - 追問的 id 不重複，每個追問 1–4 句
 */
export function validateTalk(talk) {
  const problems = []
  const checkLine = (line, where) => {
    if (!line.text) problems.push(`${where}：缺少 text`)
    if (!line.textEn) problems.push(`${where}：缺少 textEn`)
    if (!TALK_LABELS[line.label]) problems.push(`${where}：標示無效（${line.label}）`)
    if (line.label === 'sourced' && !line.sourceIds?.length) problems.push(`${where}：標「有出處」但沒有 sourceIds`)
  }
  if (!talk.id) problems.push('缺少 id')
  if (!talk.role) problems.push(`${talk.id}：缺少身分 role`)
  if (!talk.doing) problems.push(`${talk.id}：缺少正在做的事 doing`)
  if (!talk.lines || talk.lines.length < 2 || talk.lines.length > 4) problems.push(`${talk.id}：開場要 2–4 句`)
  talk.lines?.forEach((line, i) => checkLine(line, `${talk.id} 第 ${i + 1} 句`))
  const ids = new Set()
  for (const followUp of talk.followUps ?? []) {
    if (ids.has(followUp.id)) problems.push(`${talk.id}：追問 id 重複（${followUp.id}）`)
    ids.add(followUp.id)
    if (!followUp.question) problems.push(`${talk.id}／${followUp.id}：缺少問題 question`)
    if (!followUp.questionEn) problems.push(`${talk.id}／${followUp.id}：缺少 questionEn`)
    if (!followUp.lines?.length || followUp.lines.length > 4) problems.push(`${talk.id}／${followUp.id}：回答要 1–4 句`)
    followUp.lines?.forEach((line, i) => checkLine(line, `${talk.id}／${followUp.id} 第 ${i + 1} 句`))
  }
  return problems
}
