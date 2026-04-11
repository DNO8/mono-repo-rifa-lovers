import { useRef, useCallback } from 'react'

interface UseModelDragOptions {
  resumeDelayMs?: number
  decayFactor?: number
  sensitivity?: number
}

export function useModelDrag({
  resumeDelayMs = 5000,
  decayFactor = 0.95,
  sensitivity = 0.01,
}: UseModelDragOptions = {}) {
  const dragRef = useRef({ active: false, startX: 0, rotation: 0, lastX: 0, velocity: 0 })
  const userRotation = useRef(0)
  const paused = useRef(false)
  const locked = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const inertiaRaf = useRef<number>(0)

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      paused.current = false
    }, resumeDelayMs)
  }, [resumeDelayMs])

  const startInertia = () => {
    const decay = () => {
      dragRef.current.velocity *= decayFactor
      if (Math.abs(dragRef.current.velocity) < 0.0001) {
        dragRef.current.velocity = 0
        scheduleResume()
        return
      }
      userRotation.current += dragRef.current.velocity
      inertiaRaf.current = requestAnimationFrame(decay)
    }
    inertiaRaf.current = requestAnimationFrame(decay)
  }

  const lock = useCallback(() => {
    locked.current = true
    dragRef.current.active = false
    cancelAnimationFrame(inertiaRaf.current)
    paused.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  const unlock = useCallback(() => {
    locked.current = false
    scheduleResume()
  }, [scheduleResume])

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked.current) return
    // Don't capture if the click originated from an Html overlay (annotation dots)
    const target = e.target as HTMLElement
    if (target.tagName !== 'CANVAS' && !target.closest('canvas')) return
    cancelAnimationFrame(inertiaRaf.current)
    dragRef.current.active = true
    dragRef.current.startX = e.clientX
    dragRef.current.lastX = e.clientX
    dragRef.current.rotation = userRotation.current
    dragRef.current.velocity = 0
    paused.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (locked.current || !dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    dragRef.current.velocity = (e.clientX - dragRef.current.lastX) * sensitivity
    dragRef.current.lastX = e.clientX
    userRotation.current = dragRef.current.rotation + dx * sensitivity
  }

  const onPointerUp = () => {
    dragRef.current.active = false
    startInertia()
  }

  return {
    userRotation,
    paused,
    locked,
    lock,
    unlock,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
