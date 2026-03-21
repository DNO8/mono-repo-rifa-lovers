import { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap'

interface UseCarouselOptions {
  total: number
  autoAdvanceMs?: number
}

export function useCarousel({ total, autoAdvanceMs = 5000 }: UseCarouselOptions) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const trackX = useRef(0)

  const getSnapX = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return 0
    const card = track.children[index] as HTMLElement | undefined
    if (!card) return 0
    return -(card.offsetLeft - (track.parentElement!.offsetWidth / 2 - card.offsetWidth / 2))
  }, [])

  const snapTo = useCallback((index: number) => {
    const x = getSnapX(index)
    gsap.to(trackRef.current, { x, duration: 0.5, ease: 'power3.out' })
    trackX.current = x
    setCurrent(index)
  }, [getSnapX])

  const goNext = useCallback(() => snapTo((current + 1) % total), [current, total, snapTo])
  const goPrev = useCallback(() => snapTo((current - 1 + total) % total), [current, total, snapTo])

  // Auto-advance
  useEffect(() => {
    if (isPaused || autoAdvanceMs <= 0) return
    const id = setInterval(() => {
      setCurrent((p) => {
        const next = (p + 1) % total
        const x = getSnapX(next)
        gsap.to(trackRef.current, { x, duration: 0.5, ease: 'power3.out' })
        trackX.current = x
        return next
      })
    }, autoAdvanceMs)
    return () => clearInterval(id)
  }, [isPaused, total, getSnapX, autoAdvanceMs])

  // Initial position
  useEffect(() => {
    if (trackRef.current) {
      const x = getSnapX(0)
      gsap.set(trackRef.current, { x })
      trackX.current = x
    }
  }, [getSnapX])

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    setIsPaused(true)
    gsap.killTweensOf(trackRef.current)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    gsap.set(trackRef.current, { x: trackX.current + dx })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const dx = e.clientX - startX.current
    const threshold = 60

    let next = current
    if (dx < -threshold && current < total - 1) next = current + 1
    else if (dx > threshold && current > 0) next = current - 1

    snapTo(next)
    setIsPaused(false)
  }

  return {
    trackRef,
    current,
    isPaused,
    setIsPaused,
    snapTo,
    goNext,
    goPrev,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
