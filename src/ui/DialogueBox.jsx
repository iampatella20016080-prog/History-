import { getSource } from '../data/sources.js'
import { TALK_LABELS, currentLine, hasNextLine, remainingFollowUps } from '../game/talk.js'
import { useGameStore } from '../state/useGameStore.js'
import { usePresence } from './usePresence.js'

/**
 * 路人對話框（畫面下方）：一次一句，可以繼續、追問或道別。
 * 每句話都有看得到的標示（有出處／坊間傳說／虛構對白）；「有出處」的句子列出出處。
 * 對話中角色仍可走動，走遠會自動結束（InteractionSystem）。
 */
export function DialogueBox() {
  const talk = useGameStore((state) => state.talk)
  const advanceTalk = useGameStore((state) => state.advanceTalk)
  const chooseTalkFollowUp = useGameStore((state) => state.chooseTalkFollowUp)
  const endTalk = useGameStore((state) => state.endTalk)
  const touch = useGameStore((state) => state.inputMode === 'touch')
  const { mounted, state } = usePresence(!!talk, 260)

  // 關閉的淡出期間保留最後的內容
  const session = talk ?? DialogueBox.last
  if (talk) DialogueBox.last = talk
  if (!mounted || !session) return null

  const line = currentLine(session)
  const label = line && TALK_LABELS[line.label]
  const sources = (line?.sourceIds ?? []).map(getSource).filter(Boolean)
  const followUps = session.stage === 'choices' ? remainingFollowUps(session) : []

  return (
    <div className="dialogue-layer" data-state={state}>
      <section className="dialogue paper" role="dialog" aria-label={`與${session.talk.role}的對話`}>
        <header className="dialogue__header">
          <span className="dialogue__role">{session.talk.role}</span>
          <span className="dialogue__doing">{session.talk.doing}</span>
          <button type="button" className="dialogue__close" onClick={endTalk}>
            道別 <kbd>Esc</kbd>
          </button>
        </header>
        {line && (
          <div className="dialogue__line">
            <p className="dialogue__text">{line.text}</p>
            <div className="dialogue__meta">
              {label && <span className={`talk-label is-${line.label}`}>{label.text}</span>}
              {sources.length > 0 && <span className="dialogue__sources">出處：{sources.map((source) => source.title).join('；')}</span>}
            </div>
          </div>
        )}
        {session.stage === 'line' && (
          <footer className="dialogue__footer">
            <button type="button" className="button-solid" onClick={advanceTalk}>
              {hasNextLine(session) ? '繼續' : '……'} {!touch && <kbd>E</kbd>}
            </button>
          </footer>
        )}
        {session.stage === 'choices' && (
          <footer className="dialogue__footer dialogue__choices">
            <p className="dialogue__ask">想問些什麼？</p>
            {followUps.map((item) => (
              <button key={item.id} type="button" className="button-ghost dialogue__choice" onClick={() => chooseTalkFollowUp(item.id)}>
                {item.question}
              </button>
            ))}
            <button type="button" className="button-ghost dialogue__choice is-bye" onClick={endTalk}>
              沒事了，多謝。
            </button>
          </footer>
        )}
        {session.stage === 'done' && (
          <footer className="dialogue__footer">
            <p className="dialogue__ask">（已記進探索手記）</p>
            <button type="button" className="button-solid" onClick={endTalk}>
              道別
            </button>
          </footer>
        )}
      </section>
    </div>
  )
}
