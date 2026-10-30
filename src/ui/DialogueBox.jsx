import { getSource } from '../data/sources.js'
import { getInspectObject } from '../data/inspectObjects.js'
import { TALK_LABELS, currentLine, hasNextLine, remainingFollowUps, talkObjectId } from '../game/talk.js'
import { useGameStore } from '../state/useGameStore.js'
import { usePresence } from './usePresence.js'
import { useLocalizer, useT } from '../i18n/useT.js'

/**
 * 路人對話框（畫面下方）：一次一句，可以繼續、追問或道別。
 * 每句話都有看得到的標示（有出處／坊間傳說／虛構對白）；「有出處」的句子列出出處。
 * 路人有器物可以給你看時（talk.objectId），開場說完之後多一個「近看」按鈕。
 * 對話中角色仍可走動，走遠會自動結束（InteractionSystem）。
 */
export function DialogueBox() {
  const t = useT()
  const L = useLocalizer()
  const talk = useGameStore((state) => state.talk)
  const advanceTalk = useGameStore((state) => state.advanceTalk)
  const chooseTalkFollowUp = useGameStore((state) => state.chooseTalkFollowUp)
  const endTalk = useGameStore((state) => state.endTalk)
  const showTalkObject = useGameStore((state) => state.showTalkObject)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const { mounted, state } = usePresence(!!talk, 260)

  // 關閉的淡出期間保留最後的內容
  const session = talk ?? DialogueBox.last
  if (talk) DialogueBox.last = talk
  if (!mounted || !session) return null

  const talkData = L(session.talk)
  const line = L(currentLine(session))
  const label = line && L(TALK_LABELS[line.label])
  const sources = (line?.sourceIds ?? []).map((id) => L(getSource(id))).filter(Boolean)
  const followUps = session.stage === 'choices' ? L(remainingFollowUps(session)) : []
  // 路人拿給你看的器物（開場說完之後）：近看就打開 3D 檢視
  const object = talk ? L(getInspectObject(talkObjectId(session))) : null
  const objectButton = object && (
    <button type="button" className="button-solid dialogue__choice is-object" onClick={showTalkObject}>
      {t('dialogue.look', { title: object.title })}
    </button>
  )

  return (
    <div className="dialogue-layer" data-state={state}>
      <section className="dialogue paper" role="dialog" aria-label={t('dialogue.label', { role: talkData.role })}>
        <header className="dialogue__header">
          <span className="dialogue__role">{talkData.role}</span>
          <span className="dialogue__doing">{talkData.doing}</span>
          <button type="button" className="dialogue__close" onClick={endTalk}>
            {t('dialogue.bye')} <kbd>Esc</kbd>
          </button>
        </header>
        {line && (
          <div className="dialogue__line">
            <p className="dialogue__text">{line.text}</p>
            <div className="dialogue__meta">
              {label && <span className={`talk-label is-${line.label}`}>{label.text}</span>}
              {sources.length > 0 && <span className="dialogue__sources">{t('common.sourcesLine', { list: sources.map((source) => source.title).join('；') })}</span>}
            </div>
          </div>
        )}
        {session.stage === 'line' && (
          <footer className="dialogue__footer">
            <button type="button" className="button-solid" onClick={advanceTalk}>
              {hasNextLine(session) ? t('dialogue.next') : '……'} {!touch && <kbd>E</kbd>}
            </button>
          </footer>
        )}
        {session.stage === 'choices' && (
          <footer className="dialogue__footer dialogue__choices">
            <p className="dialogue__ask">{t('dialogue.ask')}</p>
            {objectButton}
            {followUps.map((item) => (
              <button key={item.id} type="button" className="button-ghost dialogue__choice" onClick={() => chooseTalkFollowUp(item.id)}>
                {item.question}
              </button>
            ))}
            <button type="button" className="button-ghost dialogue__choice is-bye" onClick={endTalk}>
              {t('dialogue.noThanks')}
            </button>
          </footer>
        )}
        {session.stage === 'done' && (
          <footer className="dialogue__footer">
            <p className="dialogue__ask">{t('dialogue.journaled')}</p>
            {objectButton}
            <button type="button" className="button-solid" onClick={endTalk}>
              {t('dialogue.bye')}
            </button>
          </footer>
        )}
      </section>
    </div>
  )
}
