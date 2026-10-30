import { useEffect, useRef } from 'react'
import { setStick } from '../game/input.js'
import { useGameStore } from '../state/useGameStore.js'
import { useT } from '../i18n/useT.js'

/**
 * 左下角的虛擬搖桿（觸控裝置）：可斜向移動，推得越遠走得越快，放開即停止。
 * 以 Pointer Events 實作並鎖定觸控點，拖曳時手指滑出搖桿範圍也不會中斷。
 */
export function Joystick() {
  const t = useT()
  const zone = useRef(null)
  const knob = useRef(null)
  const drag = useRef({ id: null, cx: 0, cy: 0, radius: 48 })
  const enabled = useGameStore((state) => state.started && state.mode === 'explore')

  const release = () => {
    const d = drag.current
    if (d.id !== null) zone.current?.releasePointerCapture?.(d.id)
    d.id = null
    setStick(0, 0)
    if (knob.current) knob.current.style.transform = 'translate(-50%, -50%)'
    zone.current?.classList.remove('is-active')
  }

  useEffect(() => {
    if (!enabled) release()
    return () => setStick(0, 0)
  }, [enabled])

  const update = (event) => {
    const d = drag.current
    let dx = event.clientX - d.cx
    let dy = event.clientY - d.cy
    const length = Math.hypot(dx, dy)
    if (length > d.radius) {
      dx = (dx / length) * d.radius
      dy = (dy / length) * d.radius
    }
    if (knob.current) knob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    setStick(dx / d.radius, -dy / d.radius)
  }

  const onPointerDown = (event) => {
    if (!enabled || drag.current.id !== null) return
    event.preventDefault()
    event.stopPropagation()
    const base = zone.current.querySelector('.joystick__base').getBoundingClientRect()
    const d = drag.current
    d.id = event.pointerId
    d.cx = base.left + base.width / 2
    d.cy = base.top + base.height / 2
    d.radius = base.width * 0.38
    zone.current.setPointerCapture?.(event.pointerId)
    zone.current.classList.add('is-active')
    update(event)
  }

  const onPointerMove = (event) => {
    if (event.pointerId !== drag.current.id) return
    event.preventDefault()
    update(event)
  }

  const onPointerUp = (event) => {
    if (event.pointerId === drag.current.id) release()
  }

  return (
    <div
      ref={zone}
      className={`joystick${enabled ? '' : ' is-disabled'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      role="presentation"
    >
      <div className="joystick__base">
        <span className="joystick__ring" />
        <span className="joystick__arrow is-up" />
        <span className="joystick__arrow is-down" />
        <span className="joystick__arrow is-left" />
        <span className="joystick__arrow is-right" />
      </div>
      <div ref={knob} className="joystick__knob">
        <span>{t('touch.stickSeal')}</span>
      </div>
    </div>
  )
}
