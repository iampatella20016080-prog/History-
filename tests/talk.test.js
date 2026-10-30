import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceTalk, chooseFollowUp, currentLine, hasNextLine, remainingFollowUps, startTalkSession, talkFinished, talkJournalId, validateTalk } from '../src/game/talk.js'
import { QING_PORT_TALK, qingPortTalkOf } from '../src/data/qingPortTalk.js'
import { TALK_BY_ERA, talkForNpc, talksOfEra } from '../src/data/talk.js'
import { PORTERS } from '../src/data/qingWharfLayout.js'
import { DODD } from '../src/data/doddLayout.js'
import { LHT } from '../src/data/linHuaTaiQingLayout.js'
import { getSource } from '../src/data/sources.js'

test('路人對話：開場逐句前進，說完進入追問', () => {
  const talk = QING_PORT_TALK[0]
  let session = startTalkSession(talk)
  assert.equal(currentLine(session), talk.lines[0])
  assert.ok(hasNextLine(session))
  for (let i = 1; i < talk.lines.length; i++) session = advanceTalk(session)
  assert.equal(currentLine(session), talk.lines.at(-1))
  session = advanceTalk(session)
  assert.equal(session.stage, 'choices')
  assert.equal(remainingFollowUps(session).length, talk.followUps.length)
})

test('路人對話：同一個追問不會出現第二次，問完就結束', () => {
  const talk = QING_PORT_TALK[0]
  let session = startTalkSession(talk)
  while (session.stage === 'line') session = advanceTalk(session)
  for (const followUp of talk.followUps) {
    session = chooseFollowUp(session, followUp.id)
    assert.equal(session.stage, 'line')
    assert.equal(currentLine(session), followUp.lines[0])
    while (session.stage === 'line') session = advanceTalk(session)
    assert.ok(!remainingFollowUps(session).some((item) => item.id === followUp.id))
  }
  assert.ok(talkFinished(session))
})

test('路人對話：選不存在的追問或在錯的階段操作都不改變狀態', () => {
  const talk = QING_PORT_TALK[0]
  const session = startTalkSession(talk)
  assert.equal(chooseFollowUp(session, talk.followUps[0].id), session)
  let done = session
  while (done.stage === 'line') done = advanceTalk(done)
  assert.equal(chooseFollowUp(done, '不存在'), done)
})

test('港口商街的對話資料：格式正確、標示有效、「有出處」都附出處', () => {
  for (const talk of QING_PORT_TALK) {
    assert.deepEqual(validateTalk(talk), [], talk.id)
    for (const line of [...talk.lines, ...(talk.followUps ?? []).flatMap((item) => item.lines)]) {
      for (const id of line.sourceIds ?? []) assert.ok(getSource(id), `${talk.id}：出處 ${id} 不在 sources.js`)
    }
  }
})

test('港口商街的對話：npcId 對應碼頭的挑夫或兩間室內的人物，id 不重複', () => {
  const npcIds = [...PORTERS.map((porter) => `qing-wharf-${porter.id}`), ...DODD.npcs.map((npc) => npc.id), ...LHT.npcs.map((npc) => npc.id)]
  const seen = new Set()
  for (const talk of QING_PORT_TALK) {
    assert.ok(npcIds.includes(talk.npcId), `${talk.id}：npcId ${talk.npcId} 不在碼頭的挑夫裡`)
    assert.ok(!seen.has(talk.id) && !seen.has(talk.npcId), `${talk.id}：重複`)
    seen.add(talk.id)
    seen.add(talk.npcId)
  }
})

test('對話總表：talkForNpc 只在對的年代找得到對話', () => {
  // 港口商街：第 10 階段的碼頭與茶行，加上第 12 階段主題路線在這個年代的對話
  const routeTalks = Object.values(TALK_BY_ERA).flat().filter((talk) => talk.eraId === 'qing-port')
  assert.equal(talksOfEra('qing-port').length, QING_PORT_TALK.length + routeTalks.length)
  for (const talk of QING_PORT_TALK) assert.ok(talksOfEra('qing-port').includes(talk))
  assert.equal(talkForNpc('qing-port', QING_PORT_TALK[0].npcId), QING_PORT_TALK[0])
  assert.equal(talkForNpc('banquet', QING_PORT_TALK[0].npcId), null)
  assert.equal(qingPortTalkOf('沒有這個人'), null)
  for (const eraId of Object.keys(TALK_BY_ERA)) assert.ok(TALK_BY_ERA[eraId].length > 0, eraId)
})

test('手記條目 id：talk: 前綴', () => {
  assert.equal(talkJournalId(QING_PORT_TALK[0]), `talk:${QING_PORT_TALK[0].id}`)
})
